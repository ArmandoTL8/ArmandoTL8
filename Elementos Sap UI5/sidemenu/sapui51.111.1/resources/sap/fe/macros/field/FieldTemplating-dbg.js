/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/helpers/BindingHelper", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/templating/CommonFormatters", "sap/fe/core/templating/DataModelPathHelper", "sap/fe/core/templating/FieldControlHelper", "sap/fe/core/templating/PropertyHelper", "sap/fe/core/templating/SemanticObjectHelper", "sap/fe/core/templating/UIFormatters", "sap/ui/model/json/JSONModel"], function (BindingHelper, BindingToolkit, CommonFormatters, DataModelPathHelper, FieldControlHelper, PropertyHelper, SemanticObjectHelper, UIFormatters, JSONModel) {
  "use strict";

  var _exports = {};
  var getDynamicPathFromSemanticObject = SemanticObjectHelper.getDynamicPathFromSemanticObject;
  var isReadOnlyExpression = FieldControlHelper.isReadOnlyExpression;
  var getContextRelativeTargetObjectPath = DataModelPathHelper.getContextRelativeTargetObjectPath;
  var enhanceDataModelPath = DataModelPathHelper.enhanceDataModelPath;
  var transformRecursively = BindingToolkit.transformRecursively;
  var pathInModel = BindingToolkit.pathInModel;
  var or = BindingToolkit.or;
  var not = BindingToolkit.not;
  var isPathInModelExpression = BindingToolkit.isPathInModelExpression;
  var isComplexTypeExpression = BindingToolkit.isComplexTypeExpression;
  var ifElse = BindingToolkit.ifElse;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var formatWithTypeInformation = BindingToolkit.formatWithTypeInformation;
  var equal = BindingToolkit.equal;
  var constant = BindingToolkit.constant;
  var compileExpression = BindingToolkit.compileExpression;
  var and = BindingToolkit.and;
  var UI = BindingHelper.UI;
  /**
   * Recursively add the text arrangement to a binding expression.
   *
   * @param bindingExpressionToEnhance The binding expression to be enhanced
   * @param fullContextPath The current context path we're on (to properly resolve the text arrangement properties)
   * @returns An updated expression containing the text arrangement binding.
   */
  const addTextArrangementToBindingExpression = function (bindingExpressionToEnhance, fullContextPath) {
    return transformRecursively(bindingExpressionToEnhance, "PathInModel", expression => {
      let outExpression = expression;
      if (expression.modelName === undefined) {
        // In case of default model we then need to resolve the text arrangement property
        const oPropertyDataModelPath = enhanceDataModelPath(fullContextPath, expression.path);
        outExpression = CommonFormatters.getBindingWithTextArrangement(oPropertyDataModelPath, expression);
      }
      return outExpression;
    });
  };
  _exports.addTextArrangementToBindingExpression = addTextArrangementToBindingExpression;
  const formatValueRecursively = function (bindingExpressionToEnhance, fullContextPath) {
    return transformRecursively(bindingExpressionToEnhance, "PathInModel", expression => {
      let outExpression = expression;
      if (expression.modelName === undefined) {
        // In case of default model we then need to resolve the text arrangement property
        const oPropertyDataModelPath = enhanceDataModelPath(fullContextPath, expression.path);
        outExpression = formatWithTypeInformation(oPropertyDataModelPath.targetObject, expression);
      }
      return outExpression;
    });
  };
  _exports.formatValueRecursively = formatValueRecursively;
  const getTextBindingExpression = function (oPropertyDataModelObjectPath, fieldFormatOptions) {
    return getTextBinding(oPropertyDataModelObjectPath, fieldFormatOptions, true);
  };
  _exports.getTextBindingExpression = getTextBindingExpression;
  const getTextBinding = function (oPropertyDataModelObjectPath, fieldFormatOptions) {
    var _oPropertyDataModelOb, _oPropertyDataModelOb2, _oPropertyDataModelOb3, _oPropertyDataModelOb4, _oPropertyDataModelOb5, _oPropertyDataModelOb6, _oPropertyDataModelOb7, _oPropertyDataModelOb8, _oPropertyDataModelOb9, _oPropertyDataModelOb10, _oPropertyDataModelOb11, _oPropertyDataModelOb12, _oPropertyDataModelOb13, _oPropertyDataModelOb14, _oPropertyDataModelOb15;
    let asObject = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    if (((_oPropertyDataModelOb = oPropertyDataModelObjectPath.targetObject) === null || _oPropertyDataModelOb === void 0 ? void 0 : _oPropertyDataModelOb.$Type) === "com.sap.vocabularies.UI.v1.DataField" || ((_oPropertyDataModelOb2 = oPropertyDataModelObjectPath.targetObject) === null || _oPropertyDataModelOb2 === void 0 ? void 0 : _oPropertyDataModelOb2.$Type) === "com.sap.vocabularies.UI.v1.DataPointType" || ((_oPropertyDataModelOb3 = oPropertyDataModelObjectPath.targetObject) === null || _oPropertyDataModelOb3 === void 0 ? void 0 : _oPropertyDataModelOb3.$Type) === "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath" || ((_oPropertyDataModelOb4 = oPropertyDataModelObjectPath.targetObject) === null || _oPropertyDataModelOb4 === void 0 ? void 0 : _oPropertyDataModelOb4.$Type) === "com.sap.vocabularies.UI.v1.DataFieldWithUrl" || ((_oPropertyDataModelOb5 = oPropertyDataModelObjectPath.targetObject) === null || _oPropertyDataModelOb5 === void 0 ? void 0 : _oPropertyDataModelOb5.$Type) === "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation" || ((_oPropertyDataModelOb6 = oPropertyDataModelObjectPath.targetObject) === null || _oPropertyDataModelOb6 === void 0 ? void 0 : _oPropertyDataModelOb6.$Type) === "com.sap.vocabularies.UI.v1.DataFieldWithAction") {
      // If there is no resolved property, the value is returned as a constant
      const fieldValue = oPropertyDataModelObjectPath.targetObject.Value || "";
      return compileExpression(constant(fieldValue));
    }
    if (PropertyHelper.isPathExpression(oPropertyDataModelObjectPath.targetObject) && oPropertyDataModelObjectPath.targetObject.$target) {
      oPropertyDataModelObjectPath = enhanceDataModelPath(oPropertyDataModelObjectPath, oPropertyDataModelObjectPath.targetObject.path);
    }
    const oBindingExpression = pathInModel(getContextRelativeTargetObjectPath(oPropertyDataModelObjectPath));
    let oTargetBinding;
    if ((_oPropertyDataModelOb7 = oPropertyDataModelObjectPath.targetObject) !== null && _oPropertyDataModelOb7 !== void 0 && (_oPropertyDataModelOb8 = _oPropertyDataModelOb7.annotations) !== null && _oPropertyDataModelOb8 !== void 0 && (_oPropertyDataModelOb9 = _oPropertyDataModelOb8.Measures) !== null && _oPropertyDataModelOb9 !== void 0 && _oPropertyDataModelOb9.Unit || (_oPropertyDataModelOb10 = oPropertyDataModelObjectPath.targetObject) !== null && _oPropertyDataModelOb10 !== void 0 && (_oPropertyDataModelOb11 = _oPropertyDataModelOb10.annotations) !== null && _oPropertyDataModelOb11 !== void 0 && (_oPropertyDataModelOb12 = _oPropertyDataModelOb11.Measures) !== null && _oPropertyDataModelOb12 !== void 0 && _oPropertyDataModelOb12.ISOCurrency) {
      oTargetBinding = UIFormatters.getBindingWithUnitOrCurrency(oPropertyDataModelObjectPath, oBindingExpression);
      if ((fieldFormatOptions === null || fieldFormatOptions === void 0 ? void 0 : fieldFormatOptions.measureDisplayMode) === "Hidden" && isComplexTypeExpression(oTargetBinding)) {
        // TODO: Refactor once types are less generic here
        oTargetBinding.formatOptions = {
          ...oTargetBinding.formatOptions,
          showMeasure: false
        };
      }
    } else if ((_oPropertyDataModelOb13 = oPropertyDataModelObjectPath.targetObject) !== null && _oPropertyDataModelOb13 !== void 0 && (_oPropertyDataModelOb14 = _oPropertyDataModelOb13.annotations) !== null && _oPropertyDataModelOb14 !== void 0 && (_oPropertyDataModelOb15 = _oPropertyDataModelOb14.Common) !== null && _oPropertyDataModelOb15 !== void 0 && _oPropertyDataModelOb15.Timezone) {
      oTargetBinding = UIFormatters.getBindingWithTimezone(oPropertyDataModelObjectPath, oBindingExpression, false, true, fieldFormatOptions.dateFormatOptions);
    } else {
      oTargetBinding = CommonFormatters.getBindingWithTextArrangement(oPropertyDataModelObjectPath, oBindingExpression, fieldFormatOptions);
    }
    if (asObject) {
      return oTargetBinding;
    }
    // We don't include $$nopatch and parseKeepEmptyString as they make no sense in the text binding case
    return compileExpression(oTargetBinding);
  };
  _exports.getTextBinding = getTextBinding;
  const getValueBinding = function (oPropertyDataModelObjectPath, fieldFormatOptions) {
    let ignoreUnit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    let ignoreFormatting = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    let bindingParameters = arguments.length > 4 ? arguments[4] : undefined;
    let targetTypeAny = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;
    let keepUnit = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : false;
    if (PropertyHelper.isPathExpression(oPropertyDataModelObjectPath.targetObject) && oPropertyDataModelObjectPath.targetObject.$target) {
      const oNavPath = oPropertyDataModelObjectPath.targetEntityType.resolvePath(oPropertyDataModelObjectPath.targetObject.path, true);
      oPropertyDataModelObjectPath.targetObject = oNavPath.target;
      oNavPath.visitedObjects.forEach(oNavObj => {
        if (oNavObj && oNavObj._type === "NavigationProperty") {
          oPropertyDataModelObjectPath.navigationProperties.push(oNavObj);
        }
      });
    }
    const targetObject = oPropertyDataModelObjectPath.targetObject;
    if (PropertyHelper.isProperty(targetObject)) {
      let oBindingExpression = pathInModel(getContextRelativeTargetObjectPath(oPropertyDataModelObjectPath));
      if (isPathInModelExpression(oBindingExpression)) {
        var _targetObject$annotat, _targetObject$annotat2, _targetObject$annotat3, _targetObject$annotat4, _targetObject$annotat5, _targetObject$annotat6;
        if ((_targetObject$annotat = targetObject.annotations) !== null && _targetObject$annotat !== void 0 && (_targetObject$annotat2 = _targetObject$annotat.Communication) !== null && _targetObject$annotat2 !== void 0 && _targetObject$annotat2.IsEmailAddress) {
          oBindingExpression.type = "sap.fe.core.type.Email";
        } else if (!ignoreUnit && ((_targetObject$annotat3 = targetObject.annotations) !== null && _targetObject$annotat3 !== void 0 && (_targetObject$annotat4 = _targetObject$annotat3.Measures) !== null && _targetObject$annotat4 !== void 0 && _targetObject$annotat4.ISOCurrency || (_targetObject$annotat5 = targetObject.annotations) !== null && _targetObject$annotat5 !== void 0 && (_targetObject$annotat6 = _targetObject$annotat5.Measures) !== null && _targetObject$annotat6 !== void 0 && _targetObject$annotat6.Unit)) {
          oBindingExpression = UIFormatters.getBindingWithUnitOrCurrency(oPropertyDataModelObjectPath, oBindingExpression, true, keepUnit ? undefined : {
            showMeasure: false
          });
        } else {
          var _oPropertyDataModelOb16, _oPropertyDataModelOb17;
          const oTimezone = (_oPropertyDataModelOb16 = oPropertyDataModelObjectPath.targetObject.annotations) === null || _oPropertyDataModelOb16 === void 0 ? void 0 : (_oPropertyDataModelOb17 = _oPropertyDataModelOb16.Common) === null || _oPropertyDataModelOb17 === void 0 ? void 0 : _oPropertyDataModelOb17.Timezone;
          if (oTimezone) {
            oBindingExpression = UIFormatters.getBindingWithTimezone(oPropertyDataModelObjectPath, oBindingExpression, true);
          } else {
            oBindingExpression = formatWithTypeInformation(targetObject, oBindingExpression);
          }
          if (isPathInModelExpression(oBindingExpression) && oBindingExpression.type === "sap.ui.model.odata.type.String") {
            oBindingExpression.formatOptions = {
              parseKeepsEmptyString: true
            };
          }
        }
        if (isPathInModelExpression(oBindingExpression)) {
          if (ignoreFormatting) {
            delete oBindingExpression.formatOptions;
            delete oBindingExpression.constraints;
            delete oBindingExpression.type;
          }
          if (bindingParameters) {
            oBindingExpression.parameters = bindingParameters;
          }
          if (targetTypeAny) {
            oBindingExpression.targetType = "any";
          }
        }
        return compileExpression(oBindingExpression);
      } else {
        // if somehow we could not compile the binding -> return empty string
        return "";
      }
    } else if ((targetObject === null || targetObject === void 0 ? void 0 : targetObject.$Type) === "com.sap.vocabularies.UI.v1.DataFieldWithUrl" || (targetObject === null || targetObject === void 0 ? void 0 : targetObject.$Type) === "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath") {
      return compileExpression(getExpressionFromAnnotation(targetObject.Value));
    } else {
      return "";
    }
  };
  _exports.getValueBinding = getValueBinding;
  const getAssociatedTextBinding = function (oPropertyDataModelObjectPath, fieldFormatOptions) {
    const textPropertyPath = PropertyHelper.getAssociatedTextPropertyPath(oPropertyDataModelObjectPath.targetObject);
    if (textPropertyPath) {
      const oTextPropertyPath = enhanceDataModelPath(oPropertyDataModelObjectPath, textPropertyPath);
      return getValueBinding(oTextPropertyPath, fieldFormatOptions, true, true, {
        $$noPatch: true
      });
    }
    return undefined;
  };
  _exports.getAssociatedTextBinding = getAssociatedTextBinding;
  const isUsedInNavigationWithQuickViewFacets = function (oDataModelPath, oProperty) {
    var _oDataModelPath$targe, _oDataModelPath$targe2, _oDataModelPath$targe3, _oDataModelPath$targe4, _oDataModelPath$conte;
    const aNavigationProperties = (oDataModelPath === null || oDataModelPath === void 0 ? void 0 : (_oDataModelPath$targe = oDataModelPath.targetEntityType) === null || _oDataModelPath$targe === void 0 ? void 0 : _oDataModelPath$targe.navigationProperties) || [];
    const aSemanticObjects = (oDataModelPath === null || oDataModelPath === void 0 ? void 0 : (_oDataModelPath$targe2 = oDataModelPath.targetEntityType) === null || _oDataModelPath$targe2 === void 0 ? void 0 : (_oDataModelPath$targe3 = _oDataModelPath$targe2.annotations) === null || _oDataModelPath$targe3 === void 0 ? void 0 : (_oDataModelPath$targe4 = _oDataModelPath$targe3.Common) === null || _oDataModelPath$targe4 === void 0 ? void 0 : _oDataModelPath$targe4.SemanticKey) || [];
    let bIsUsedInNavigationWithQuickViewFacets = false;
    aNavigationProperties.forEach(oNavProp => {
      if (oNavProp.referentialConstraint && oNavProp.referentialConstraint.length) {
        oNavProp.referentialConstraint.forEach(oRefConstraint => {
          if ((oRefConstraint === null || oRefConstraint === void 0 ? void 0 : oRefConstraint.sourceProperty) === oProperty.name) {
            var _oNavProp$targetType, _oNavProp$targetType$, _oNavProp$targetType$2;
            if (oNavProp !== null && oNavProp !== void 0 && (_oNavProp$targetType = oNavProp.targetType) !== null && _oNavProp$targetType !== void 0 && (_oNavProp$targetType$ = _oNavProp$targetType.annotations) !== null && _oNavProp$targetType$ !== void 0 && (_oNavProp$targetType$2 = _oNavProp$targetType$.UI) !== null && _oNavProp$targetType$2 !== void 0 && _oNavProp$targetType$2.QuickViewFacets) {
              bIsUsedInNavigationWithQuickViewFacets = true;
            }
          }
        });
      }
    });
    if (((_oDataModelPath$conte = oDataModelPath.contextLocation) === null || _oDataModelPath$conte === void 0 ? void 0 : _oDataModelPath$conte.targetEntitySet) !== oDataModelPath.targetEntitySet) {
      var _oDataModelPath$targe5, _oDataModelPath$targe6, _oDataModelPath$targe7;
      const aIsTargetSemanticKey = aSemanticObjects.some(function (oSemantic) {
        var _oSemantic$$target;
        return (oSemantic === null || oSemantic === void 0 ? void 0 : (_oSemantic$$target = oSemantic.$target) === null || _oSemantic$$target === void 0 ? void 0 : _oSemantic$$target.name) === oProperty.name;
      });
      if ((aIsTargetSemanticKey || oProperty.isKey) && oDataModelPath !== null && oDataModelPath !== void 0 && (_oDataModelPath$targe5 = oDataModelPath.targetEntityType) !== null && _oDataModelPath$targe5 !== void 0 && (_oDataModelPath$targe6 = _oDataModelPath$targe5.annotations) !== null && _oDataModelPath$targe6 !== void 0 && (_oDataModelPath$targe7 = _oDataModelPath$targe6.UI) !== null && _oDataModelPath$targe7 !== void 0 && _oDataModelPath$targe7.QuickViewFacets) {
        bIsUsedInNavigationWithQuickViewFacets = true;
      }
    }
    return bIsUsedInNavigationWithQuickViewFacets;
  };
  _exports.isUsedInNavigationWithQuickViewFacets = isUsedInNavigationWithQuickViewFacets;
  const isRetrieveTextFromValueListEnabled = function (oPropertyPath, fieldFormatOptions) {
    var _oProperty$annotation, _oProperty$annotation2, _oProperty$annotation3;
    const oProperty = PropertyHelper.isPathExpression(oPropertyPath) && oPropertyPath.$target || oPropertyPath;
    if (!((_oProperty$annotation = oProperty.annotations) !== null && _oProperty$annotation !== void 0 && (_oProperty$annotation2 = _oProperty$annotation.Common) !== null && _oProperty$annotation2 !== void 0 && _oProperty$annotation2.Text) && !((_oProperty$annotation3 = oProperty.annotations) !== null && _oProperty$annotation3 !== void 0 && _oProperty$annotation3.Measures) && PropertyHelper.hasValueHelp(oProperty) && fieldFormatOptions.textAlignMode === "Form") {
      return true;
    }
    return false;
  };

  /**
   * Returns the binding expression to evaluate the visibility of a DataField or DataPoint annotation.
   *
   * SAP Fiori elements will evaluate either the UI.Hidden annotation defined on the annotation itself or on the target property.
   *
   * @param dataFieldModelPath The metapath referring to the annotation we are evaluating.
   * @param [formatOptions] FormatOptions optional.
   * @param formatOptions.isAnalytics This flag is set when using an analytical table.
   * @returns An expression that you can bind to the UI.
   */
  _exports.isRetrieveTextFromValueListEnabled = isRetrieveTextFromValueListEnabled;
  const getVisibleExpression = function (dataFieldModelPath, formatOptions) {
    var _targetObject$Target, _targetObject$Target$, _targetObject$annotat7, _targetObject$annotat8, _propertyValue$annota, _propertyValue$annota2;
    const targetObject = dataFieldModelPath.targetObject;
    let propertyValue;
    if (targetObject) {
      switch (targetObject.$Type) {
        case "com.sap.vocabularies.UI.v1.DataField":
        case "com.sap.vocabularies.UI.v1.DataFieldWithUrl":
        case "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":
        case "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation":
        case "com.sap.vocabularies.UI.v1.DataFieldWithAction":
        case "com.sap.vocabularies.UI.v1.DataPointType":
          propertyValue = targetObject.Value.$target;
          break;
        case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
          // if it is a DataFieldForAnnotation pointing to a DataPoint we look at the dataPoint's value
          if ((targetObject === null || targetObject === void 0 ? void 0 : (_targetObject$Target = targetObject.Target) === null || _targetObject$Target === void 0 ? void 0 : (_targetObject$Target$ = _targetObject$Target.$target) === null || _targetObject$Target$ === void 0 ? void 0 : _targetObject$Target$.$Type) === "com.sap.vocabularies.UI.v1.DataPointType") {
            var _targetObject$Target$2;
            propertyValue = (_targetObject$Target$2 = targetObject.Target.$target) === null || _targetObject$Target$2 === void 0 ? void 0 : _targetObject$Target$2.Value.$target;
            break;
          }
        // eslint-disable-next-line no-fallthrough
        case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
        case "com.sap.vocabularies.UI.v1.DataFieldForAction":
        default:
          propertyValue = undefined;
      }
    }
    const isAnalyticalGroupHeaderExpanded = formatOptions !== null && formatOptions !== void 0 && formatOptions.isAnalytics ? UI.IsExpanded : constant(false);
    const isAnalyticalLeaf = formatOptions !== null && formatOptions !== void 0 && formatOptions.isAnalytics ? equal(UI.NodeLevel, 0) : constant(false);

    // A data field is visible if:
    // - the UI.Hidden expression in the original annotation does not evaluate to 'true'
    // - the UI.Hidden expression in the target property does not evaluate to 'true'
    // - in case of Analytics it's not visible for an expanded GroupHeader
    return compileExpression(and(...[not(equal(getExpressionFromAnnotation(targetObject === null || targetObject === void 0 ? void 0 : (_targetObject$annotat7 = targetObject.annotations) === null || _targetObject$annotat7 === void 0 ? void 0 : (_targetObject$annotat8 = _targetObject$annotat7.UI) === null || _targetObject$annotat8 === void 0 ? void 0 : _targetObject$annotat8.Hidden), true)), ifElse(!!propertyValue, propertyValue && not(equal(getExpressionFromAnnotation((_propertyValue$annota = propertyValue.annotations) === null || _propertyValue$annota === void 0 ? void 0 : (_propertyValue$annota2 = _propertyValue$annota.UI) === null || _propertyValue$annota2 === void 0 ? void 0 : _propertyValue$annota2.Hidden), true)), true), or(not(isAnalyticalGroupHeaderExpanded), isAnalyticalLeaf)]));
  };
  _exports.getVisibleExpression = getVisibleExpression;
  const QVTextBinding = function (oPropertyDataModelObjectPath, oPropertyValueDataModelObjectPath, fieldFormatOptions) {
    let asObject = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    let returnValue = getValueBinding(oPropertyDataModelObjectPath, fieldFormatOptions, asObject);
    if (returnValue === "") {
      returnValue = getTextBinding(oPropertyValueDataModelObjectPath, fieldFormatOptions, asObject);
    }
    return returnValue;
  };
  _exports.QVTextBinding = QVTextBinding;
  const getQuickViewType = function (oPropertyDataModelObjectPath) {
    var _targetObject$$target, _targetObject$$target2, _targetObject$$target3, _targetObject$$target4, _targetObject$$target5, _targetObject$$target6;
    const targetObject = oPropertyDataModelObjectPath.targetObject;
    if (targetObject !== null && targetObject !== void 0 && (_targetObject$$target = targetObject.$target) !== null && _targetObject$$target !== void 0 && (_targetObject$$target2 = _targetObject$$target.annotations) !== null && _targetObject$$target2 !== void 0 && (_targetObject$$target3 = _targetObject$$target2.Communication) !== null && _targetObject$$target3 !== void 0 && _targetObject$$target3.IsEmailAddress) {
      return "email";
    }
    if (targetObject !== null && targetObject !== void 0 && (_targetObject$$target4 = targetObject.$target) !== null && _targetObject$$target4 !== void 0 && (_targetObject$$target5 = _targetObject$$target4.annotations) !== null && _targetObject$$target5 !== void 0 && (_targetObject$$target6 = _targetObject$$target5.Communication) !== null && _targetObject$$target6 !== void 0 && _targetObject$$target6.IsPhoneNumber) {
      return "phone";
    }
    return "text";
  };
  _exports.getQuickViewType = getQuickViewType;
  /**
   * Get the customData key value pair of SemanticObjects.
   *
   * @param propertyAnnotations The value of the Common annotation.
   * @param [dynamicSemanticObjectsOnly] Flag for retrieving dynamic Semantic Objects only.
   * @returns The array of the semantic Objects.
   */
  const getSemanticObjectExpressionToResolve = function (propertyAnnotations, dynamicSemanticObjectsOnly) {
    const aSemObjExprToResolve = [];
    let sSemObjExpression;
    let annotation;
    if (propertyAnnotations) {
      const semanticObjectsKeys = Object.keys(propertyAnnotations).filter(function (element) {
        return element === "SemanticObject" || element.startsWith("SemanticObject#");
      });
      for (const semanticObject of semanticObjectsKeys) {
        var _annotation;
        annotation = propertyAnnotations[semanticObject];
        sSemObjExpression = compileExpression(getExpressionFromAnnotation(annotation));
        if (!dynamicSemanticObjectsOnly || dynamicSemanticObjectsOnly && ((_annotation = annotation) === null || _annotation === void 0 ? void 0 : _annotation.type) === "Path") {
          aSemObjExprToResolve.push({
            key: getDynamicPathFromSemanticObject(sSemObjExpression) || sSemObjExpression,
            value: sSemObjExpression
          });
        }
      }
    }
    return aSemObjExprToResolve;
  };
  _exports.getSemanticObjectExpressionToResolve = getSemanticObjectExpressionToResolve;
  const getSemanticObjects = function (aSemObjExprToResolve) {
    if (aSemObjExprToResolve.length > 0) {
      let sCustomDataKey = "";
      let sCustomDataValue = "";
      const aSemObjCustomData = [];
      for (let iSemObjCount = 0; iSemObjCount < aSemObjExprToResolve.length; iSemObjCount++) {
        sCustomDataKey = aSemObjExprToResolve[iSemObjCount].key;
        sCustomDataValue = compileExpression(getExpressionFromAnnotation(aSemObjExprToResolve[iSemObjCount].value));
        aSemObjCustomData.push({
          key: sCustomDataKey,
          value: sCustomDataValue
        });
      }
      const oSemanticObjectsModel = new JSONModel(aSemObjCustomData);
      oSemanticObjectsModel.$$valueAsPromise = true;
      const oSemObjBindingContext = oSemanticObjectsModel.createBindingContext("/");
      return oSemObjBindingContext;
    } else {
      return new JSONModel([]).createBindingContext("/");
    }
  };

  /**
   * Method to get MultipleLines for a DataField.
   *
   * @name getMultipleLinesForDataField
   * @param {any} oThis The current object
   * @param {string} sPropertyType The property type
   * @param {boolean} isMultiLineText The property isMultiLineText
   * @returns {CompiledBindingToolkitExpression<string>} The binding expression to determine if a data field should be a MultiLineText or not
   * @public
   */
  _exports.getSemanticObjects = getSemanticObjects;
  const getMultipleLinesForDataField = function (oThis, sPropertyType, isMultiLineText) {
    if (oThis.wrap === false) {
      return false;
    }
    if (sPropertyType !== "Edm.String") {
      return isMultiLineText;
    }
    if (oThis.editMode === "Display") {
      return true;
    }
    if (oThis.editMode.indexOf("{") > -1) {
      // If the editMode is computed then we just care about the page editMode to determine if the multiline property should be taken into account
      return compileExpression(or(not(UI.IsEditable), isMultiLineText));
    }
    return isMultiLineText;
  };
  _exports.getMultipleLinesForDataField = getMultipleLinesForDataField;
  const _hasValueHelpToShow = function (oProperty, measureDisplayMode) {
    // we show a value help if teh property has one or if its visible unit has one
    const oPropertyUnit = PropertyHelper.getAssociatedUnitProperty(oProperty);
    const oPropertyCurrency = PropertyHelper.getAssociatedCurrencyProperty(oProperty);
    return PropertyHelper.hasValueHelp(oProperty) && oProperty.type !== "Edm.Boolean" || measureDisplayMode !== "Hidden" && (oPropertyUnit && PropertyHelper.hasValueHelp(oPropertyUnit) || oPropertyCurrency && PropertyHelper.hasValueHelp(oPropertyCurrency));
  };

  /**
   * Sets Edit Style properties for Field in case of Macro Field(Field.metadata.ts) and MassEditDialog fields.
   *
   * @param oProps Field Properties for the Macro Field.
   * @param oDataField DataField Object.
   * @param oDataModelPath DataModel Object Path to the property.
   * @param onlyEditStyle To add only editStyle.
   */
  const setEditStyleProperties = function (oProps, oDataField, oDataModelPath, onlyEditStyle) {
    var _oDataField$Target, _oDataField$Target$$t, _oProps$formatOptions, _oProperty$annotation4, _oProperty$annotation5, _oProperty$annotation6, _oProperty$annotation7, _oProperty$annotation8, _oProperty$annotation9, _oProperty$annotation10, _oProperty$annotation11, _oProperty$annotation12;
    const oProperty = oDataModelPath.targetObject;
    if (!PropertyHelper.isProperty(oProperty)) {
      oProps.editStyle = null;
      return;
    }
    if (!onlyEditStyle) {
      oProps.valueBindingExpression = getValueBinding(oDataModelPath, oProps.formatOptions);
    }
    switch (oDataField.$Type) {
      case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
        if (((_oDataField$Target = oDataField.Target) === null || _oDataField$Target === void 0 ? void 0 : (_oDataField$Target$$t = _oDataField$Target.$target) === null || _oDataField$Target$$t === void 0 ? void 0 : _oDataField$Target$$t.Visualization) === "UI.VisualizationType/Rating") {
          oProps.editStyle = "RatingIndicator";
          return;
        }
        break;
      case "com.sap.vocabularies.UI.v1.DataPointType":
        if ((oDataField === null || oDataField === void 0 ? void 0 : oDataField.Visualization) === "UI.VisualizationType/Rating") {
          oProps.editStyle = "RatingIndicator";
          return;
        }
        break;
      case "com.sap.vocabularies.UI.v1.DataFieldForAction":
      case "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":
      case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
        oProps.editStyle = null;
        return;
      default:
    }
    if (_hasValueHelpToShow(oProperty, (_oProps$formatOptions = oProps.formatOptions) === null || _oProps$formatOptions === void 0 ? void 0 : _oProps$formatOptions.measureDisplayMode)) {
      if (!onlyEditStyle) {
        var _oProps$formatOptions2;
        oProps.textBindingExpression = getAssociatedTextBinding(oDataModelPath, oProps.formatOptions);
        if (((_oProps$formatOptions2 = oProps.formatOptions) === null || _oProps$formatOptions2 === void 0 ? void 0 : _oProps$formatOptions2.measureDisplayMode) !== "Hidden") {
          // for the MDC Field we need to keep the unit inside the valueBindingExpression
          oProps.valueBindingExpression = getValueBinding(oDataModelPath, oProps.formatOptions, false, false, undefined, false, true);
        }
      }
      oProps.editStyle = "InputWithValueHelp";
      return;
    }
    switch (oProperty.type) {
      case "Edm.Date":
        oProps.editStyle = "DatePicker";
        return;
      case "Edm.Time":
      case "Edm.TimeOfDay":
        oProps.editStyle = "TimePicker";
        return;
      case "Edm.DateTime":
      case "Edm.DateTimeOffset":
        oProps.editStyle = "DateTimePicker";
        // No timezone defined. Also for compatibility reasons.
        if (!((_oProperty$annotation4 = oProperty.annotations) !== null && _oProperty$annotation4 !== void 0 && (_oProperty$annotation5 = _oProperty$annotation4.Common) !== null && _oProperty$annotation5 !== void 0 && _oProperty$annotation5.Timezone)) {
          oProps.showTimezone = undefined;
        } else {
          oProps.showTimezone = true;
        }
        return;
      case "Edm.Boolean":
        oProps.editStyle = "CheckBox";
        return;
      case "Edm.Stream":
        oProps.editStyle = "File";
        return;
      case "Edm.String":
        if ((_oProperty$annotation6 = oProperty.annotations) !== null && _oProperty$annotation6 !== void 0 && (_oProperty$annotation7 = _oProperty$annotation6.UI) !== null && _oProperty$annotation7 !== void 0 && (_oProperty$annotation8 = _oProperty$annotation7.MultiLineText) !== null && _oProperty$annotation8 !== void 0 && _oProperty$annotation8.valueOf()) {
          oProps.editStyle = "TextArea";
          return;
        }
        break;
      default:
        oProps.editStyle = "Input";
    }
    if ((_oProperty$annotation9 = oProperty.annotations) !== null && _oProperty$annotation9 !== void 0 && (_oProperty$annotation10 = _oProperty$annotation9.Measures) !== null && _oProperty$annotation10 !== void 0 && _oProperty$annotation10.ISOCurrency || (_oProperty$annotation11 = oProperty.annotations) !== null && _oProperty$annotation11 !== void 0 && (_oProperty$annotation12 = _oProperty$annotation11.Measures) !== null && _oProperty$annotation12 !== void 0 && _oProperty$annotation12.Unit) {
      if (!onlyEditStyle) {
        oProps.unitBindingExpression = compileExpression(UIFormatters.getBindingForUnitOrCurrency(oDataModelPath));
        oProps.descriptionBindingExpression = UIFormatters.ifUnitEditable(oProperty, "", UIFormatters.getBindingForUnitOrCurrency(oDataModelPath));
        const unitProperty = PropertyHelper.getAssociatedCurrencyProperty(oProperty) || PropertyHelper.getAssociatedUnitProperty(oProperty);
        oProps.unitEditable = compileExpression(not(isReadOnlyExpression(unitProperty)));
      }
      oProps.editStyle = "InputWithUnit";
      return;
    }
    oProps.editStyle = "Input";
  };
  _exports.setEditStyleProperties = setEditStyleProperties;
  const hasSemanticObjectInNavigationOrProperty = propertyDataModelObjectPath => {
    var _propertyDataModelObj, _propertyDataModelObj2, _propertyDataModelObj3, _propertyDataModelObj4;
    const property = propertyDataModelObjectPath.targetObject;
    if (SemanticObjectHelper.hasSemanticObject(property)) {
      return true;
    }
    const lastNavProp = propertyDataModelObjectPath !== null && propertyDataModelObjectPath !== void 0 && (_propertyDataModelObj = propertyDataModelObjectPath.navigationProperties) !== null && _propertyDataModelObj !== void 0 && _propertyDataModelObj.length ? propertyDataModelObjectPath === null || propertyDataModelObjectPath === void 0 ? void 0 : propertyDataModelObjectPath.navigationProperties[(propertyDataModelObjectPath === null || propertyDataModelObjectPath === void 0 ? void 0 : (_propertyDataModelObj2 = propertyDataModelObjectPath.navigationProperties) === null || _propertyDataModelObj2 === void 0 ? void 0 : _propertyDataModelObj2.length) - 1] : null;
    if (!lastNavProp || (_propertyDataModelObj3 = propertyDataModelObjectPath.contextLocation) !== null && _propertyDataModelObj3 !== void 0 && (_propertyDataModelObj4 = _propertyDataModelObj3.navigationProperties) !== null && _propertyDataModelObj4 !== void 0 && _propertyDataModelObj4.find(contextNavProp => contextNavProp.name === lastNavProp.name)) {
      return false;
    }
    return SemanticObjectHelper.hasSemanticObject(lastNavProp);
  };

  /**
   * Get the dataModelObjectPath with the value property as targetObject if it exists
   * for a dataModelObjectPath targeting a DataField or a DataPoint annotation.
   *
   * @param initialDataModelObjectPath
   * @returns The dataModelObjectPath targetiing the value property or undefined
   */
  _exports.hasSemanticObjectInNavigationOrProperty = hasSemanticObjectInNavigationOrProperty;
  const getDataModelObjectPathForValue = initialDataModelObjectPath => {
    if (!initialDataModelObjectPath.targetObject) {
      return undefined;
    }
    let valuePath = "";
    // data point annotations need not have $Type defined, so add it if missing
    if (initialDataModelObjectPath.targetObject.term === "com.sap.vocabularies.UI.v1.DataPoint") {
      initialDataModelObjectPath.targetObject.$Type = initialDataModelObjectPath.targetObject.$Type || "com.sap.vocabularies.UI.v1.DataPointType";
    }
    switch (initialDataModelObjectPath.targetObject.$Type) {
      case "com.sap.vocabularies.UI.v1.DataField":
      case "com.sap.vocabularies.UI.v1.DataPointType":
      case "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":
      case "com.sap.vocabularies.UI.v1.DataFieldWithUrl":
      case "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation":
      case "com.sap.vocabularies.UI.v1.DataFieldWithAction":
        if (typeof initialDataModelObjectPath.targetObject.Value === "object") {
          valuePath = initialDataModelObjectPath.targetObject.Value.path;
        }
        break;
      case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
        if (initialDataModelObjectPath.targetObject.Target.$target) {
          if (initialDataModelObjectPath.targetObject.Target.$target.$Type === "com.sap.vocabularies.UI.v1.DataField" || initialDataModelObjectPath.targetObject.Target.$target.$Type === "com.sap.vocabularies.UI.v1.DataPointType") {
            if (initialDataModelObjectPath.targetObject.Target.value.indexOf("/") > 0) {
              var _initialDataModelObje;
              valuePath = initialDataModelObjectPath.targetObject.Target.value.replace(/\/@.*/, `/${(_initialDataModelObje = initialDataModelObjectPath.targetObject.Target.$target.Value) === null || _initialDataModelObje === void 0 ? void 0 : _initialDataModelObje.path}`);
            } else {
              var _initialDataModelObje2;
              valuePath = (_initialDataModelObje2 = initialDataModelObjectPath.targetObject.Target.$target.Value) === null || _initialDataModelObje2 === void 0 ? void 0 : _initialDataModelObje2.path;
            }
          } else {
            var _initialDataModelObje3;
            valuePath = (_initialDataModelObje3 = initialDataModelObjectPath.targetObject.Target) === null || _initialDataModelObje3 === void 0 ? void 0 : _initialDataModelObje3.path;
          }
        }
        break;
    }
    if (valuePath && valuePath.length > 0) {
      return enhanceDataModelPath(initialDataModelObjectPath, valuePath);
    } else {
      return undefined;
    }
  };
  _exports.getDataModelObjectPathForValue = getDataModelObjectPathForValue;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhZGRUZXh0QXJyYW5nZW1lbnRUb0JpbmRpbmdFeHByZXNzaW9uIiwiYmluZGluZ0V4cHJlc3Npb25Ub0VuaGFuY2UiLCJmdWxsQ29udGV4dFBhdGgiLCJ0cmFuc2Zvcm1SZWN1cnNpdmVseSIsImV4cHJlc3Npb24iLCJvdXRFeHByZXNzaW9uIiwibW9kZWxOYW1lIiwidW5kZWZpbmVkIiwib1Byb3BlcnR5RGF0YU1vZGVsUGF0aCIsImVuaGFuY2VEYXRhTW9kZWxQYXRoIiwicGF0aCIsIkNvbW1vbkZvcm1hdHRlcnMiLCJnZXRCaW5kaW5nV2l0aFRleHRBcnJhbmdlbWVudCIsImZvcm1hdFZhbHVlUmVjdXJzaXZlbHkiLCJmb3JtYXRXaXRoVHlwZUluZm9ybWF0aW9uIiwidGFyZ2V0T2JqZWN0IiwiZ2V0VGV4dEJpbmRpbmdFeHByZXNzaW9uIiwib1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aCIsImZpZWxkRm9ybWF0T3B0aW9ucyIsImdldFRleHRCaW5kaW5nIiwiYXNPYmplY3QiLCIkVHlwZSIsImZpZWxkVmFsdWUiLCJWYWx1ZSIsImNvbXBpbGVFeHByZXNzaW9uIiwiY29uc3RhbnQiLCJQcm9wZXJ0eUhlbHBlciIsImlzUGF0aEV4cHJlc3Npb24iLCIkdGFyZ2V0Iiwib0JpbmRpbmdFeHByZXNzaW9uIiwicGF0aEluTW9kZWwiLCJnZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoIiwib1RhcmdldEJpbmRpbmciLCJhbm5vdGF0aW9ucyIsIk1lYXN1cmVzIiwiVW5pdCIsIklTT0N1cnJlbmN5IiwiVUlGb3JtYXR0ZXJzIiwiZ2V0QmluZGluZ1dpdGhVbml0T3JDdXJyZW5jeSIsIm1lYXN1cmVEaXNwbGF5TW9kZSIsImlzQ29tcGxleFR5cGVFeHByZXNzaW9uIiwiZm9ybWF0T3B0aW9ucyIsInNob3dNZWFzdXJlIiwiQ29tbW9uIiwiVGltZXpvbmUiLCJnZXRCaW5kaW5nV2l0aFRpbWV6b25lIiwiZGF0ZUZvcm1hdE9wdGlvbnMiLCJnZXRWYWx1ZUJpbmRpbmciLCJpZ25vcmVVbml0IiwiaWdub3JlRm9ybWF0dGluZyIsImJpbmRpbmdQYXJhbWV0ZXJzIiwidGFyZ2V0VHlwZUFueSIsImtlZXBVbml0Iiwib05hdlBhdGgiLCJ0YXJnZXRFbnRpdHlUeXBlIiwicmVzb2x2ZVBhdGgiLCJ0YXJnZXQiLCJ2aXNpdGVkT2JqZWN0cyIsImZvckVhY2giLCJvTmF2T2JqIiwiX3R5cGUiLCJuYXZpZ2F0aW9uUHJvcGVydGllcyIsInB1c2giLCJpc1Byb3BlcnR5IiwiaXNQYXRoSW5Nb2RlbEV4cHJlc3Npb24iLCJDb21tdW5pY2F0aW9uIiwiSXNFbWFpbEFkZHJlc3MiLCJ0eXBlIiwib1RpbWV6b25lIiwicGFyc2VLZWVwc0VtcHR5U3RyaW5nIiwiY29uc3RyYWludHMiLCJwYXJhbWV0ZXJzIiwidGFyZ2V0VHlwZSIsImdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbiIsImdldEFzc29jaWF0ZWRUZXh0QmluZGluZyIsInRleHRQcm9wZXJ0eVBhdGgiLCJnZXRBc3NvY2lhdGVkVGV4dFByb3BlcnR5UGF0aCIsIm9UZXh0UHJvcGVydHlQYXRoIiwiJCRub1BhdGNoIiwiaXNVc2VkSW5OYXZpZ2F0aW9uV2l0aFF1aWNrVmlld0ZhY2V0cyIsIm9EYXRhTW9kZWxQYXRoIiwib1Byb3BlcnR5IiwiYU5hdmlnYXRpb25Qcm9wZXJ0aWVzIiwiYVNlbWFudGljT2JqZWN0cyIsIlNlbWFudGljS2V5IiwiYklzVXNlZEluTmF2aWdhdGlvbldpdGhRdWlja1ZpZXdGYWNldHMiLCJvTmF2UHJvcCIsInJlZmVyZW50aWFsQ29uc3RyYWludCIsImxlbmd0aCIsIm9SZWZDb25zdHJhaW50Iiwic291cmNlUHJvcGVydHkiLCJuYW1lIiwiVUkiLCJRdWlja1ZpZXdGYWNldHMiLCJjb250ZXh0TG9jYXRpb24iLCJ0YXJnZXRFbnRpdHlTZXQiLCJhSXNUYXJnZXRTZW1hbnRpY0tleSIsInNvbWUiLCJvU2VtYW50aWMiLCJpc0tleSIsImlzUmV0cmlldmVUZXh0RnJvbVZhbHVlTGlzdEVuYWJsZWQiLCJvUHJvcGVydHlQYXRoIiwiVGV4dCIsImhhc1ZhbHVlSGVscCIsInRleHRBbGlnbk1vZGUiLCJnZXRWaXNpYmxlRXhwcmVzc2lvbiIsImRhdGFGaWVsZE1vZGVsUGF0aCIsInByb3BlcnR5VmFsdWUiLCJUYXJnZXQiLCJpc0FuYWx5dGljYWxHcm91cEhlYWRlckV4cGFuZGVkIiwiaXNBbmFseXRpY3MiLCJJc0V4cGFuZGVkIiwiaXNBbmFseXRpY2FsTGVhZiIsImVxdWFsIiwiTm9kZUxldmVsIiwiYW5kIiwibm90IiwiSGlkZGVuIiwiaWZFbHNlIiwib3IiLCJRVlRleHRCaW5kaW5nIiwib1Byb3BlcnR5VmFsdWVEYXRhTW9kZWxPYmplY3RQYXRoIiwicmV0dXJuVmFsdWUiLCJnZXRRdWlja1ZpZXdUeXBlIiwiSXNQaG9uZU51bWJlciIsImdldFNlbWFudGljT2JqZWN0RXhwcmVzc2lvblRvUmVzb2x2ZSIsInByb3BlcnR5QW5ub3RhdGlvbnMiLCJkeW5hbWljU2VtYW50aWNPYmplY3RzT25seSIsImFTZW1PYmpFeHByVG9SZXNvbHZlIiwic1NlbU9iakV4cHJlc3Npb24iLCJhbm5vdGF0aW9uIiwic2VtYW50aWNPYmplY3RzS2V5cyIsIk9iamVjdCIsImtleXMiLCJmaWx0ZXIiLCJlbGVtZW50Iiwic3RhcnRzV2l0aCIsInNlbWFudGljT2JqZWN0Iiwia2V5IiwiZ2V0RHluYW1pY1BhdGhGcm9tU2VtYW50aWNPYmplY3QiLCJ2YWx1ZSIsImdldFNlbWFudGljT2JqZWN0cyIsInNDdXN0b21EYXRhS2V5Iiwic0N1c3RvbURhdGFWYWx1ZSIsImFTZW1PYmpDdXN0b21EYXRhIiwiaVNlbU9iakNvdW50Iiwib1NlbWFudGljT2JqZWN0c01vZGVsIiwiSlNPTk1vZGVsIiwiJCR2YWx1ZUFzUHJvbWlzZSIsIm9TZW1PYmpCaW5kaW5nQ29udGV4dCIsImNyZWF0ZUJpbmRpbmdDb250ZXh0IiwiZ2V0TXVsdGlwbGVMaW5lc0ZvckRhdGFGaWVsZCIsIm9UaGlzIiwic1Byb3BlcnR5VHlwZSIsImlzTXVsdGlMaW5lVGV4dCIsIndyYXAiLCJlZGl0TW9kZSIsImluZGV4T2YiLCJJc0VkaXRhYmxlIiwiX2hhc1ZhbHVlSGVscFRvU2hvdyIsIm9Qcm9wZXJ0eVVuaXQiLCJnZXRBc3NvY2lhdGVkVW5pdFByb3BlcnR5Iiwib1Byb3BlcnR5Q3VycmVuY3kiLCJnZXRBc3NvY2lhdGVkQ3VycmVuY3lQcm9wZXJ0eSIsInNldEVkaXRTdHlsZVByb3BlcnRpZXMiLCJvUHJvcHMiLCJvRGF0YUZpZWxkIiwib25seUVkaXRTdHlsZSIsImVkaXRTdHlsZSIsInZhbHVlQmluZGluZ0V4cHJlc3Npb24iLCJWaXN1YWxpemF0aW9uIiwidGV4dEJpbmRpbmdFeHByZXNzaW9uIiwic2hvd1RpbWV6b25lIiwiTXVsdGlMaW5lVGV4dCIsInZhbHVlT2YiLCJ1bml0QmluZGluZ0V4cHJlc3Npb24iLCJnZXRCaW5kaW5nRm9yVW5pdE9yQ3VycmVuY3kiLCJkZXNjcmlwdGlvbkJpbmRpbmdFeHByZXNzaW9uIiwiaWZVbml0RWRpdGFibGUiLCJ1bml0UHJvcGVydHkiLCJ1bml0RWRpdGFibGUiLCJpc1JlYWRPbmx5RXhwcmVzc2lvbiIsImhhc1NlbWFudGljT2JqZWN0SW5OYXZpZ2F0aW9uT3JQcm9wZXJ0eSIsInByb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aCIsInByb3BlcnR5IiwiU2VtYW50aWNPYmplY3RIZWxwZXIiLCJoYXNTZW1hbnRpY09iamVjdCIsImxhc3ROYXZQcm9wIiwiZmluZCIsImNvbnRleHROYXZQcm9wIiwiZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aEZvclZhbHVlIiwiaW5pdGlhbERhdGFNb2RlbE9iamVjdFBhdGgiLCJ2YWx1ZVBhdGgiLCJ0ZXJtIiwicmVwbGFjZSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiRmllbGRUZW1wbGF0aW5nLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgTmF2aWdhdGlvblByb3BlcnR5LCBQcm9wZXJ0eSB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlc1wiO1xuaW1wb3J0IHR5cGUgeyBEYXRhRmllbGRBYnN0cmFjdFR5cGVzLCBEYXRhRmllbGRXaXRoVXJsLCBEYXRhUG9pbnRUeXBlVHlwZXMgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1VJXCI7XG5pbXBvcnQgeyBVSUFubm90YXRpb25UeXBlcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlcIjtcbmltcG9ydCB7IFVJIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvaGVscGVycy9CaW5kaW5nSGVscGVyXCI7XG5pbXBvcnQgdHlwZSB7IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiwgQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IHtcblx0YW5kLFxuXHRjb21waWxlRXhwcmVzc2lvbixcblx0Y29uc3RhbnQsXG5cdGVxdWFsLFxuXHRmb3JtYXRXaXRoVHlwZUluZm9ybWF0aW9uLFxuXHRnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24sXG5cdGlmRWxzZSxcblx0aXNDb21wbGV4VHlwZUV4cHJlc3Npb24sXG5cdGlzUGF0aEluTW9kZWxFeHByZXNzaW9uLFxuXHRub3QsXG5cdG9yLFxuXHRwYXRoSW5Nb2RlbCxcblx0dHJhbnNmb3JtUmVjdXJzaXZlbHlcbn0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCAqIGFzIENvbW1vbkZvcm1hdHRlcnMgZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvQ29tbW9uRm9ybWF0dGVyc1wiO1xuaW1wb3J0IHR5cGUgeyBEYXRhTW9kZWxPYmplY3RQYXRoIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRGF0YU1vZGVsUGF0aEhlbHBlclwiO1xuaW1wb3J0IHsgZW5oYW5jZURhdGFNb2RlbFBhdGgsIGdldENvbnRleHRSZWxhdGl2ZVRhcmdldE9iamVjdFBhdGggfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9EYXRhTW9kZWxQYXRoSGVscGVyXCI7XG5pbXBvcnQgeyBpc1JlYWRPbmx5RXhwcmVzc2lvbiB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL0ZpZWxkQ29udHJvbEhlbHBlclwiO1xuaW1wb3J0ICogYXMgUHJvcGVydHlIZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvUHJvcGVydHlIZWxwZXJcIjtcbmltcG9ydCAqIGFzIFNlbWFudGljT2JqZWN0SGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL1NlbWFudGljT2JqZWN0SGVscGVyXCI7XG5pbXBvcnQgeyBnZXREeW5hbWljUGF0aEZyb21TZW1hbnRpY09iamVjdCB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL1NlbWFudGljT2JqZWN0SGVscGVyXCI7XG5pbXBvcnQgdHlwZSB7IERpc3BsYXlNb2RlLCBQcm9wZXJ0eU9yUGF0aCB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL1VJRm9ybWF0dGVyc1wiO1xuaW1wb3J0ICogYXMgVUlGb3JtYXR0ZXJzIGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL1VJRm9ybWF0dGVyc1wiO1xuaW1wb3J0IHR5cGUgeyBGaWVsZFByb3BlcnRpZXMgfSBmcm9tIFwic2FwL2ZlL21hY3Jvcy9pbnRlcm5hbC9JbnRlcm5hbEZpZWxkXCI7XG5pbXBvcnQgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcblxuLyoqXG4gKiBSZWN1cnNpdmVseSBhZGQgdGhlIHRleHQgYXJyYW5nZW1lbnQgdG8gYSBiaW5kaW5nIGV4cHJlc3Npb24uXG4gKlxuICogQHBhcmFtIGJpbmRpbmdFeHByZXNzaW9uVG9FbmhhbmNlIFRoZSBiaW5kaW5nIGV4cHJlc3Npb24gdG8gYmUgZW5oYW5jZWRcbiAqIEBwYXJhbSBmdWxsQ29udGV4dFBhdGggVGhlIGN1cnJlbnQgY29udGV4dCBwYXRoIHdlJ3JlIG9uICh0byBwcm9wZXJseSByZXNvbHZlIHRoZSB0ZXh0IGFycmFuZ2VtZW50IHByb3BlcnRpZXMpXG4gKiBAcmV0dXJucyBBbiB1cGRhdGVkIGV4cHJlc3Npb24gY29udGFpbmluZyB0aGUgdGV4dCBhcnJhbmdlbWVudCBiaW5kaW5nLlxuICovXG5leHBvcnQgY29uc3QgYWRkVGV4dEFycmFuZ2VtZW50VG9CaW5kaW5nRXhwcmVzc2lvbiA9IGZ1bmN0aW9uIChcblx0YmluZGluZ0V4cHJlc3Npb25Ub0VuaGFuY2U6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxhbnk+LFxuXHRmdWxsQ29udGV4dFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGhcbik6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxhbnk+IHtcblx0cmV0dXJuIHRyYW5zZm9ybVJlY3Vyc2l2ZWx5KGJpbmRpbmdFeHByZXNzaW9uVG9FbmhhbmNlLCBcIlBhdGhJbk1vZGVsXCIsIChleHByZXNzaW9uKSA9PiB7XG5cdFx0bGV0IG91dEV4cHJlc3Npb246IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxhbnk+ID0gZXhwcmVzc2lvbjtcblx0XHRpZiAoZXhwcmVzc2lvbi5tb2RlbE5hbWUgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Ly8gSW4gY2FzZSBvZiBkZWZhdWx0IG1vZGVsIHdlIHRoZW4gbmVlZCB0byByZXNvbHZlIHRoZSB0ZXh0IGFycmFuZ2VtZW50IHByb3BlcnR5XG5cdFx0XHRjb25zdCBvUHJvcGVydHlEYXRhTW9kZWxQYXRoID0gZW5oYW5jZURhdGFNb2RlbFBhdGgoZnVsbENvbnRleHRQYXRoLCBleHByZXNzaW9uLnBhdGgpO1xuXHRcdFx0b3V0RXhwcmVzc2lvbiA9IENvbW1vbkZvcm1hdHRlcnMuZ2V0QmluZGluZ1dpdGhUZXh0QXJyYW5nZW1lbnQob1Byb3BlcnR5RGF0YU1vZGVsUGF0aCwgZXhwcmVzc2lvbik7XG5cdFx0fVxuXHRcdHJldHVybiBvdXRFeHByZXNzaW9uO1xuXHR9KTtcbn07XG5cbmV4cG9ydCBjb25zdCBmb3JtYXRWYWx1ZVJlY3Vyc2l2ZWx5ID0gZnVuY3Rpb24gKFxuXHRiaW5kaW5nRXhwcmVzc2lvblRvRW5oYW5jZTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGFueT4sXG5cdGZ1bGxDb250ZXh0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aFxuKTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGFueT4ge1xuXHRyZXR1cm4gdHJhbnNmb3JtUmVjdXJzaXZlbHkoYmluZGluZ0V4cHJlc3Npb25Ub0VuaGFuY2UsIFwiUGF0aEluTW9kZWxcIiwgKGV4cHJlc3Npb24pID0+IHtcblx0XHRsZXQgb3V0RXhwcmVzc2lvbjogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGFueT4gPSBleHByZXNzaW9uO1xuXHRcdGlmIChleHByZXNzaW9uLm1vZGVsTmFtZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHQvLyBJbiBjYXNlIG9mIGRlZmF1bHQgbW9kZWwgd2UgdGhlbiBuZWVkIHRvIHJlc29sdmUgdGhlIHRleHQgYXJyYW5nZW1lbnQgcHJvcGVydHlcblx0XHRcdGNvbnN0IG9Qcm9wZXJ0eURhdGFNb2RlbFBhdGggPSBlbmhhbmNlRGF0YU1vZGVsUGF0aChmdWxsQ29udGV4dFBhdGgsIGV4cHJlc3Npb24ucGF0aCk7XG5cdFx0XHRvdXRFeHByZXNzaW9uID0gZm9ybWF0V2l0aFR5cGVJbmZvcm1hdGlvbihvUHJvcGVydHlEYXRhTW9kZWxQYXRoLnRhcmdldE9iamVjdCwgZXhwcmVzc2lvbik7XG5cdFx0fVxuXHRcdHJldHVybiBvdXRFeHByZXNzaW9uO1xuXHR9KTtcbn07XG5leHBvcnQgY29uc3QgZ2V0VGV4dEJpbmRpbmdFeHByZXNzaW9uID0gZnVuY3Rpb24gKFxuXHRvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoLFxuXHRmaWVsZEZvcm1hdE9wdGlvbnM6IHsgZGlzcGxheU1vZGU/OiBEaXNwbGF5TW9kZTsgbWVhc3VyZURpc3BsYXlNb2RlPzogc3RyaW5nIH1cbik6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxzdHJpbmc+IHtcblx0cmV0dXJuIGdldFRleHRCaW5kaW5nKG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgsIGZpZWxkRm9ybWF0T3B0aW9ucywgdHJ1ZSkgYXMgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPHN0cmluZz47XG59O1xuZXhwb3J0IGNvbnN0IGdldFRleHRCaW5kaW5nID0gZnVuY3Rpb24gKFxuXHRvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoLFxuXHRmaWVsZEZvcm1hdE9wdGlvbnM6IHtcblx0XHRkaXNwbGF5TW9kZT86IERpc3BsYXlNb2RlO1xuXHRcdG1lYXN1cmVEaXNwbGF5TW9kZT86IHN0cmluZztcblx0XHRkYXRlRm9ybWF0T3B0aW9ucz86IHsgc2hvd1RpbWU6IHN0cmluZzsgc2hvd0RhdGU6IHN0cmluZzsgc2hvd1RpbWV6b25lOiBzdHJpbmcgfTtcblx0fSxcblx0YXNPYmplY3Q6IGJvb2xlYW4gPSBmYWxzZVxuKTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPHN0cmluZz4gfCBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB7XG5cdGlmIChcblx0XHRvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdD8uJFR5cGUgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkXCIgfHxcblx0XHRvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdD8uJFR5cGUgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YVBvaW50VHlwZVwiIHx8XG5cdFx0b1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3Q/LiRUeXBlID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZFdpdGhOYXZpZ2F0aW9uUGF0aFwiIHx8XG5cdFx0b1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3Q/LiRUeXBlID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZFdpdGhVcmxcIiB8fFxuXHRcdG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0Py4kVHlwZSA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRXaXRoSW50ZW50QmFzZWROYXZpZ2F0aW9uXCIgfHxcblx0XHRvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdD8uJFR5cGUgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkV2l0aEFjdGlvblwiXG5cdCkge1xuXHRcdC8vIElmIHRoZXJlIGlzIG5vIHJlc29sdmVkIHByb3BlcnR5LCB0aGUgdmFsdWUgaXMgcmV0dXJuZWQgYXMgYSBjb25zdGFudFxuXHRcdGNvbnN0IGZpZWxkVmFsdWUgPSBvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdC5WYWx1ZSB8fCBcIlwiO1xuXHRcdHJldHVybiBjb21waWxlRXhwcmVzc2lvbihjb25zdGFudChmaWVsZFZhbHVlKSk7XG5cdH1cblx0aWYgKFByb3BlcnR5SGVscGVyLmlzUGF0aEV4cHJlc3Npb24ob1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QpICYmIG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0LiR0YXJnZXQpIHtcblx0XHRvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoID0gZW5oYW5jZURhdGFNb2RlbFBhdGgob1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aCwgb1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QucGF0aCk7XG5cdH1cblx0Y29uc3Qgb0JpbmRpbmdFeHByZXNzaW9uID0gcGF0aEluTW9kZWwoZ2V0Q29udGV4dFJlbGF0aXZlVGFyZ2V0T2JqZWN0UGF0aChvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoKSk7XG5cdGxldCBvVGFyZ2V0QmluZGluZztcblx0aWYgKFxuXHRcdG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0Py5hbm5vdGF0aW9ucz8uTWVhc3VyZXM/LlVuaXQgfHxcblx0XHRvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdD8uYW5ub3RhdGlvbnM/Lk1lYXN1cmVzPy5JU09DdXJyZW5jeVxuXHQpIHtcblx0XHRvVGFyZ2V0QmluZGluZyA9IFVJRm9ybWF0dGVycy5nZXRCaW5kaW5nV2l0aFVuaXRPckN1cnJlbmN5KG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgsIG9CaW5kaW5nRXhwcmVzc2lvbik7XG5cdFx0aWYgKGZpZWxkRm9ybWF0T3B0aW9ucz8ubWVhc3VyZURpc3BsYXlNb2RlID09PSBcIkhpZGRlblwiICYmIGlzQ29tcGxleFR5cGVFeHByZXNzaW9uKG9UYXJnZXRCaW5kaW5nKSkge1xuXHRcdFx0Ly8gVE9ETzogUmVmYWN0b3Igb25jZSB0eXBlcyBhcmUgbGVzcyBnZW5lcmljIGhlcmVcblx0XHRcdG9UYXJnZXRCaW5kaW5nLmZvcm1hdE9wdGlvbnMgPSB7XG5cdFx0XHRcdC4uLm9UYXJnZXRCaW5kaW5nLmZvcm1hdE9wdGlvbnMsXG5cdFx0XHRcdHNob3dNZWFzdXJlOiBmYWxzZVxuXHRcdFx0fTtcblx0XHR9XG5cdH0gZWxzZSBpZiAob1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3Q/LmFubm90YXRpb25zPy5Db21tb24/LlRpbWV6b25lKSB7XG5cdFx0b1RhcmdldEJpbmRpbmcgPSBVSUZvcm1hdHRlcnMuZ2V0QmluZGluZ1dpdGhUaW1lem9uZShcblx0XHRcdG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgsXG5cdFx0XHRvQmluZGluZ0V4cHJlc3Npb24sXG5cdFx0XHRmYWxzZSxcblx0XHRcdHRydWUsXG5cdFx0XHRmaWVsZEZvcm1hdE9wdGlvbnMuZGF0ZUZvcm1hdE9wdGlvbnNcblx0XHQpO1xuXHR9IGVsc2Uge1xuXHRcdG9UYXJnZXRCaW5kaW5nID0gQ29tbW9uRm9ybWF0dGVycy5nZXRCaW5kaW5nV2l0aFRleHRBcnJhbmdlbWVudChcblx0XHRcdG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgsXG5cdFx0XHRvQmluZGluZ0V4cHJlc3Npb24sXG5cdFx0XHRmaWVsZEZvcm1hdE9wdGlvbnNcblx0XHQpO1xuXHR9XG5cdGlmIChhc09iamVjdCkge1xuXHRcdHJldHVybiBvVGFyZ2V0QmluZGluZztcblx0fVxuXHQvLyBXZSBkb24ndCBpbmNsdWRlICQkbm9wYXRjaCBhbmQgcGFyc2VLZWVwRW1wdHlTdHJpbmcgYXMgdGhleSBtYWtlIG5vIHNlbnNlIGluIHRoZSB0ZXh0IGJpbmRpbmcgY2FzZVxuXHRyZXR1cm4gY29tcGlsZUV4cHJlc3Npb24ob1RhcmdldEJpbmRpbmcpO1xufTtcblxuZXhwb3J0IGNvbnN0IGdldFZhbHVlQmluZGluZyA9IGZ1bmN0aW9uIChcblx0b1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCxcblx0ZmllbGRGb3JtYXRPcHRpb25zOiB7IG1lYXN1cmVEaXNwbGF5TW9kZT86IHN0cmluZyB9LFxuXHRpZ25vcmVVbml0OiBib29sZWFuID0gZmFsc2UsXG5cdGlnbm9yZUZvcm1hdHRpbmc6IGJvb2xlYW4gPSBmYWxzZSxcblx0YmluZGluZ1BhcmFtZXRlcnM/OiBvYmplY3QsXG5cdHRhcmdldFR5cGVBbnkgPSBmYWxzZSxcblx0a2VlcFVuaXQgPSBmYWxzZVxuKTogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24ge1xuXHRpZiAoUHJvcGVydHlIZWxwZXIuaXNQYXRoRXhwcmVzc2lvbihvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdCkgJiYgb1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QuJHRhcmdldCkge1xuXHRcdGNvbnN0IG9OYXZQYXRoID0gb1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRFbnRpdHlUeXBlLnJlc29sdmVQYXRoKG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0LnBhdGgsIHRydWUpO1xuXHRcdG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0ID0gb05hdlBhdGgudGFyZ2V0O1xuXHRcdG9OYXZQYXRoLnZpc2l0ZWRPYmplY3RzLmZvckVhY2goKG9OYXZPYmo6IGFueSkgPT4ge1xuXHRcdFx0aWYgKG9OYXZPYmogJiYgb05hdk9iai5fdHlwZSA9PT0gXCJOYXZpZ2F0aW9uUHJvcGVydHlcIikge1xuXHRcdFx0XHRvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLm5hdmlnYXRpb25Qcm9wZXJ0aWVzLnB1c2gob05hdk9iaik7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHRjb25zdCB0YXJnZXRPYmplY3QgPSBvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdDtcblx0aWYgKFByb3BlcnR5SGVscGVyLmlzUHJvcGVydHkodGFyZ2V0T2JqZWN0KSkge1xuXHRcdGxldCBvQmluZGluZ0V4cHJlc3Npb246IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxhbnk+ID0gcGF0aEluTW9kZWwoXG5cdFx0XHRnZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoKG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgpXG5cdFx0KTtcblx0XHRpZiAoaXNQYXRoSW5Nb2RlbEV4cHJlc3Npb24ob0JpbmRpbmdFeHByZXNzaW9uKSkge1xuXHRcdFx0aWYgKHRhcmdldE9iamVjdC5hbm5vdGF0aW9ucz8uQ29tbXVuaWNhdGlvbj8uSXNFbWFpbEFkZHJlc3MpIHtcblx0XHRcdFx0b0JpbmRpbmdFeHByZXNzaW9uLnR5cGUgPSBcInNhcC5mZS5jb3JlLnR5cGUuRW1haWxcIjtcblx0XHRcdH0gZWxzZSBpZiAoIWlnbm9yZVVuaXQgJiYgKHRhcmdldE9iamVjdC5hbm5vdGF0aW9ucz8uTWVhc3VyZXM/LklTT0N1cnJlbmN5IHx8IHRhcmdldE9iamVjdC5hbm5vdGF0aW9ucz8uTWVhc3VyZXM/LlVuaXQpKSB7XG5cdFx0XHRcdG9CaW5kaW5nRXhwcmVzc2lvbiA9IFVJRm9ybWF0dGVycy5nZXRCaW5kaW5nV2l0aFVuaXRPckN1cnJlbmN5KFxuXHRcdFx0XHRcdG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgsXG5cdFx0XHRcdFx0b0JpbmRpbmdFeHByZXNzaW9uLFxuXHRcdFx0XHRcdHRydWUsXG5cdFx0XHRcdFx0a2VlcFVuaXQgPyB1bmRlZmluZWQgOiB7IHNob3dNZWFzdXJlOiBmYWxzZSB9XG5cdFx0XHRcdCkgYXMgYW55O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc3Qgb1RpbWV6b25lID0gb1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QuYW5ub3RhdGlvbnM/LkNvbW1vbj8uVGltZXpvbmU7XG5cdFx0XHRcdGlmIChvVGltZXpvbmUpIHtcblx0XHRcdFx0XHRvQmluZGluZ0V4cHJlc3Npb24gPSBVSUZvcm1hdHRlcnMuZ2V0QmluZGluZ1dpdGhUaW1lem9uZShvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLCBvQmluZGluZ0V4cHJlc3Npb24sIHRydWUpIGFzIGFueTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRvQmluZGluZ0V4cHJlc3Npb24gPSBmb3JtYXRXaXRoVHlwZUluZm9ybWF0aW9uKHRhcmdldE9iamVjdCwgb0JpbmRpbmdFeHByZXNzaW9uKSBhcyBhbnk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKGlzUGF0aEluTW9kZWxFeHByZXNzaW9uKG9CaW5kaW5nRXhwcmVzc2lvbikgJiYgb0JpbmRpbmdFeHByZXNzaW9uLnR5cGUgPT09IFwic2FwLnVpLm1vZGVsLm9kYXRhLnR5cGUuU3RyaW5nXCIpIHtcblx0XHRcdFx0XHRvQmluZGluZ0V4cHJlc3Npb24uZm9ybWF0T3B0aW9ucyA9IHtcblx0XHRcdFx0XHRcdHBhcnNlS2VlcHNFbXB0eVN0cmluZzogdHJ1ZVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmIChpc1BhdGhJbk1vZGVsRXhwcmVzc2lvbihvQmluZGluZ0V4cHJlc3Npb24pKSB7XG5cdFx0XHRcdGlmIChpZ25vcmVGb3JtYXR0aW5nKSB7XG5cdFx0XHRcdFx0ZGVsZXRlIG9CaW5kaW5nRXhwcmVzc2lvbi5mb3JtYXRPcHRpb25zO1xuXHRcdFx0XHRcdGRlbGV0ZSBvQmluZGluZ0V4cHJlc3Npb24uY29uc3RyYWludHM7XG5cdFx0XHRcdFx0ZGVsZXRlIG9CaW5kaW5nRXhwcmVzc2lvbi50eXBlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChiaW5kaW5nUGFyYW1ldGVycykge1xuXHRcdFx0XHRcdG9CaW5kaW5nRXhwcmVzc2lvbi5wYXJhbWV0ZXJzID0gYmluZGluZ1BhcmFtZXRlcnM7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHRhcmdldFR5cGVBbnkpIHtcblx0XHRcdFx0XHRvQmluZGluZ0V4cHJlc3Npb24udGFyZ2V0VHlwZSA9IFwiYW55XCI7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiBjb21waWxlRXhwcmVzc2lvbihvQmluZGluZ0V4cHJlc3Npb24pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBpZiBzb21laG93IHdlIGNvdWxkIG5vdCBjb21waWxlIHRoZSBiaW5kaW5nIC0+IHJldHVybiBlbXB0eSBzdHJpbmdcblx0XHRcdHJldHVybiBcIlwiO1xuXHRcdH1cblx0fSBlbHNlIGlmIChcblx0XHR0YXJnZXRPYmplY3Q/LiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoVXJsIHx8XG5cdFx0dGFyZ2V0T2JqZWN0Py4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aE5hdmlnYXRpb25QYXRoXG5cdCkge1xuXHRcdHJldHVybiBjb21waWxlRXhwcmVzc2lvbihnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oKHRhcmdldE9iamVjdCBhcyBEYXRhRmllbGRXaXRoVXJsKS5WYWx1ZSkpO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBcIlwiO1xuXHR9XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0QXNzb2NpYXRlZFRleHRCaW5kaW5nID0gZnVuY3Rpb24gKFxuXHRvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoLFxuXHRmaWVsZEZvcm1hdE9wdGlvbnM6IHsgbWVhc3VyZURpc3BsYXlNb2RlPzogc3RyaW5nIH1cbik6IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIHtcblx0Y29uc3QgdGV4dFByb3BlcnR5UGF0aCA9IFByb3BlcnR5SGVscGVyLmdldEFzc29jaWF0ZWRUZXh0UHJvcGVydHlQYXRoKG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0KTtcblx0aWYgKHRleHRQcm9wZXJ0eVBhdGgpIHtcblx0XHRjb25zdCBvVGV4dFByb3BlcnR5UGF0aCA9IGVuaGFuY2VEYXRhTW9kZWxQYXRoKG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgsIHRleHRQcm9wZXJ0eVBhdGgpO1xuXHRcdHJldHVybiBnZXRWYWx1ZUJpbmRpbmcob1RleHRQcm9wZXJ0eVBhdGgsIGZpZWxkRm9ybWF0T3B0aW9ucywgdHJ1ZSwgdHJ1ZSwgeyAkJG5vUGF0Y2g6IHRydWUgfSk7XG5cdH1cblx0cmV0dXJuIHVuZGVmaW5lZDtcbn07XG5cbmV4cG9ydCBjb25zdCBpc1VzZWRJbk5hdmlnYXRpb25XaXRoUXVpY2tWaWV3RmFjZXRzID0gZnVuY3Rpb24gKG9EYXRhTW9kZWxQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoLCBvUHJvcGVydHk6IFByb3BlcnR5KTogYm9vbGVhbiB7XG5cdGNvbnN0IGFOYXZpZ2F0aW9uUHJvcGVydGllcyA9IG9EYXRhTW9kZWxQYXRoPy50YXJnZXRFbnRpdHlUeXBlPy5uYXZpZ2F0aW9uUHJvcGVydGllcyB8fCBbXTtcblx0Y29uc3QgYVNlbWFudGljT2JqZWN0cyA9IG9EYXRhTW9kZWxQYXRoPy50YXJnZXRFbnRpdHlUeXBlPy5hbm5vdGF0aW9ucz8uQ29tbW9uPy5TZW1hbnRpY0tleSB8fCBbXTtcblx0bGV0IGJJc1VzZWRJbk5hdmlnYXRpb25XaXRoUXVpY2tWaWV3RmFjZXRzID0gZmFsc2U7XG5cdGFOYXZpZ2F0aW9uUHJvcGVydGllcy5mb3JFYWNoKChvTmF2UHJvcDogTmF2aWdhdGlvblByb3BlcnR5KSA9PiB7XG5cdFx0aWYgKG9OYXZQcm9wLnJlZmVyZW50aWFsQ29uc3RyYWludCAmJiBvTmF2UHJvcC5yZWZlcmVudGlhbENvbnN0cmFpbnQubGVuZ3RoKSB7XG5cdFx0XHRvTmF2UHJvcC5yZWZlcmVudGlhbENvbnN0cmFpbnQuZm9yRWFjaCgob1JlZkNvbnN0cmFpbnQpID0+IHtcblx0XHRcdFx0aWYgKG9SZWZDb25zdHJhaW50Py5zb3VyY2VQcm9wZXJ0eSA9PT0gb1Byb3BlcnR5Lm5hbWUpIHtcblx0XHRcdFx0XHRpZiAob05hdlByb3A/LnRhcmdldFR5cGU/LmFubm90YXRpb25zPy5VST8uUXVpY2tWaWV3RmFjZXRzKSB7XG5cdFx0XHRcdFx0XHRiSXNVc2VkSW5OYXZpZ2F0aW9uV2l0aFF1aWNrVmlld0ZhY2V0cyA9IHRydWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdH0pO1xuXHRpZiAob0RhdGFNb2RlbFBhdGguY29udGV4dExvY2F0aW9uPy50YXJnZXRFbnRpdHlTZXQgIT09IG9EYXRhTW9kZWxQYXRoLnRhcmdldEVudGl0eVNldCkge1xuXHRcdGNvbnN0IGFJc1RhcmdldFNlbWFudGljS2V5ID0gYVNlbWFudGljT2JqZWN0cy5zb21lKGZ1bmN0aW9uIChvU2VtYW50aWMpIHtcblx0XHRcdHJldHVybiBvU2VtYW50aWM/LiR0YXJnZXQ/Lm5hbWUgPT09IG9Qcm9wZXJ0eS5uYW1lO1xuXHRcdH0pO1xuXHRcdGlmICgoYUlzVGFyZ2V0U2VtYW50aWNLZXkgfHwgb1Byb3BlcnR5LmlzS2V5KSAmJiBvRGF0YU1vZGVsUGF0aD8udGFyZ2V0RW50aXR5VHlwZT8uYW5ub3RhdGlvbnM/LlVJPy5RdWlja1ZpZXdGYWNldHMpIHtcblx0XHRcdGJJc1VzZWRJbk5hdmlnYXRpb25XaXRoUXVpY2tWaWV3RmFjZXRzID0gdHJ1ZTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIGJJc1VzZWRJbk5hdmlnYXRpb25XaXRoUXVpY2tWaWV3RmFjZXRzO1xufTtcblxuZXhwb3J0IGNvbnN0IGlzUmV0cmlldmVUZXh0RnJvbVZhbHVlTGlzdEVuYWJsZWQgPSBmdW5jdGlvbiAoXG5cdG9Qcm9wZXJ0eVBhdGg6IFByb3BlcnR5T3JQYXRoPFByb3BlcnR5Pixcblx0ZmllbGRGb3JtYXRPcHRpb25zOiB7IGRpc3BsYXlNb2RlPzogRGlzcGxheU1vZGU7IHRleHRBbGlnbk1vZGU/OiBzdHJpbmcgfVxuKTogYm9vbGVhbiB7XG5cdGNvbnN0IG9Qcm9wZXJ0eTogUHJvcGVydHkgPSAoUHJvcGVydHlIZWxwZXIuaXNQYXRoRXhwcmVzc2lvbihvUHJvcGVydHlQYXRoKSAmJiBvUHJvcGVydHlQYXRoLiR0YXJnZXQpIHx8IChvUHJvcGVydHlQYXRoIGFzIFByb3BlcnR5KTtcblx0aWYgKFxuXHRcdCFvUHJvcGVydHkuYW5ub3RhdGlvbnM/LkNvbW1vbj8uVGV4dCAmJlxuXHRcdCFvUHJvcGVydHkuYW5ub3RhdGlvbnM/Lk1lYXN1cmVzICYmXG5cdFx0UHJvcGVydHlIZWxwZXIuaGFzVmFsdWVIZWxwKG9Qcm9wZXJ0eSkgJiZcblx0XHRmaWVsZEZvcm1hdE9wdGlvbnMudGV4dEFsaWduTW9kZSA9PT0gXCJGb3JtXCJcblx0KSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblx0cmV0dXJuIGZhbHNlO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBiaW5kaW5nIGV4cHJlc3Npb24gdG8gZXZhbHVhdGUgdGhlIHZpc2liaWxpdHkgb2YgYSBEYXRhRmllbGQgb3IgRGF0YVBvaW50IGFubm90YXRpb24uXG4gKlxuICogU0FQIEZpb3JpIGVsZW1lbnRzIHdpbGwgZXZhbHVhdGUgZWl0aGVyIHRoZSBVSS5IaWRkZW4gYW5ub3RhdGlvbiBkZWZpbmVkIG9uIHRoZSBhbm5vdGF0aW9uIGl0c2VsZiBvciBvbiB0aGUgdGFyZ2V0IHByb3BlcnR5LlxuICpcbiAqIEBwYXJhbSBkYXRhRmllbGRNb2RlbFBhdGggVGhlIG1ldGFwYXRoIHJlZmVycmluZyB0byB0aGUgYW5ub3RhdGlvbiB3ZSBhcmUgZXZhbHVhdGluZy5cbiAqIEBwYXJhbSBbZm9ybWF0T3B0aW9uc10gRm9ybWF0T3B0aW9ucyBvcHRpb25hbC5cbiAqIEBwYXJhbSBmb3JtYXRPcHRpb25zLmlzQW5hbHl0aWNzIFRoaXMgZmxhZyBpcyBzZXQgd2hlbiB1c2luZyBhbiBhbmFseXRpY2FsIHRhYmxlLlxuICogQHJldHVybnMgQW4gZXhwcmVzc2lvbiB0aGF0IHlvdSBjYW4gYmluZCB0byB0aGUgVUkuXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRWaXNpYmxlRXhwcmVzc2lvbiA9IGZ1bmN0aW9uIChcblx0ZGF0YUZpZWxkTW9kZWxQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoLFxuXHRmb3JtYXRPcHRpb25zPzogeyBpc0FuYWx5dGljcz86IGJvb2xlYW4gfVxuKTogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24ge1xuXHRjb25zdCB0YXJnZXRPYmplY3Q6IERhdGFGaWVsZEFic3RyYWN0VHlwZXMgfCBEYXRhUG9pbnRUeXBlVHlwZXMgPSBkYXRhRmllbGRNb2RlbFBhdGgudGFyZ2V0T2JqZWN0O1xuXHRsZXQgcHJvcGVydHlWYWx1ZTtcblx0aWYgKHRhcmdldE9iamVjdCkge1xuXHRcdHN3aXRjaCAodGFyZ2V0T2JqZWN0LiRUeXBlKSB7XG5cdFx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZDpcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aFVybDpcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aE5hdmlnYXRpb25QYXRoOlxuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoSW50ZW50QmFzZWROYXZpZ2F0aW9uOlxuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoQWN0aW9uOlxuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhUG9pbnRUeXBlOlxuXHRcdFx0XHRwcm9wZXJ0eVZhbHVlID0gdGFyZ2V0T2JqZWN0LlZhbHVlLiR0YXJnZXQ7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBbm5vdGF0aW9uOlxuXHRcdFx0XHQvLyBpZiBpdCBpcyBhIERhdGFGaWVsZEZvckFubm90YXRpb24gcG9pbnRpbmcgdG8gYSBEYXRhUG9pbnQgd2UgbG9vayBhdCB0aGUgZGF0YVBvaW50J3MgdmFsdWVcblx0XHRcdFx0aWYgKHRhcmdldE9iamVjdD8uVGFyZ2V0Py4kdGFyZ2V0Py4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YVBvaW50VHlwZSkge1xuXHRcdFx0XHRcdHByb3BlcnR5VmFsdWUgPSB0YXJnZXRPYmplY3QuVGFyZ2V0LiR0YXJnZXQ/LlZhbHVlLiR0YXJnZXQ7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1mYWxsdGhyb3VnaFxuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb246XG5cdFx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFjdGlvbjpcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHByb3BlcnR5VmFsdWUgPSB1bmRlZmluZWQ7XG5cdFx0fVxuXHR9XG5cdGNvbnN0IGlzQW5hbHl0aWNhbEdyb3VwSGVhZGVyRXhwYW5kZWQgPSBmb3JtYXRPcHRpb25zPy5pc0FuYWx5dGljcyA/IFVJLklzRXhwYW5kZWQgOiBjb25zdGFudChmYWxzZSk7XG5cdGNvbnN0IGlzQW5hbHl0aWNhbExlYWYgPSBmb3JtYXRPcHRpb25zPy5pc0FuYWx5dGljcyA/IGVxdWFsKFVJLk5vZGVMZXZlbCwgMCkgOiBjb25zdGFudChmYWxzZSk7XG5cblx0Ly8gQSBkYXRhIGZpZWxkIGlzIHZpc2libGUgaWY6XG5cdC8vIC0gdGhlIFVJLkhpZGRlbiBleHByZXNzaW9uIGluIHRoZSBvcmlnaW5hbCBhbm5vdGF0aW9uIGRvZXMgbm90IGV2YWx1YXRlIHRvICd0cnVlJ1xuXHQvLyAtIHRoZSBVSS5IaWRkZW4gZXhwcmVzc2lvbiBpbiB0aGUgdGFyZ2V0IHByb3BlcnR5IGRvZXMgbm90IGV2YWx1YXRlIHRvICd0cnVlJ1xuXHQvLyAtIGluIGNhc2Ugb2YgQW5hbHl0aWNzIGl0J3Mgbm90IHZpc2libGUgZm9yIGFuIGV4cGFuZGVkIEdyb3VwSGVhZGVyXG5cdHJldHVybiBjb21waWxlRXhwcmVzc2lvbihcblx0XHRhbmQoXG5cdFx0XHQuLi5bXG5cdFx0XHRcdG5vdChlcXVhbChnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24odGFyZ2V0T2JqZWN0Py5hbm5vdGF0aW9ucz8uVUk/LkhpZGRlbiksIHRydWUpKSxcblx0XHRcdFx0aWZFbHNlKFxuXHRcdFx0XHRcdCEhcHJvcGVydHlWYWx1ZSxcblx0XHRcdFx0XHRwcm9wZXJ0eVZhbHVlICYmIG5vdChlcXVhbChnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24ocHJvcGVydHlWYWx1ZS5hbm5vdGF0aW9ucz8uVUk/LkhpZGRlbiksIHRydWUpKSxcblx0XHRcdFx0XHR0cnVlXG5cdFx0XHRcdCksXG5cdFx0XHRcdG9yKG5vdChpc0FuYWx5dGljYWxHcm91cEhlYWRlckV4cGFuZGVkKSwgaXNBbmFseXRpY2FsTGVhZilcblx0XHRcdF1cblx0XHQpXG5cdCk7XG59O1xuXG5leHBvcnQgY29uc3QgUVZUZXh0QmluZGluZyA9IGZ1bmN0aW9uIChcblx0b1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCxcblx0b1Byb3BlcnR5VmFsdWVEYXRhTW9kZWxPYmplY3RQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoLFxuXHRmaWVsZEZvcm1hdE9wdGlvbnM6IHsgZGlzcGxheU1vZGU/OiBEaXNwbGF5TW9kZTsgbWVhc3VyZURpc3BsYXlNb2RlPzogc3RyaW5nIH0sXG5cdGFzT2JqZWN0OiBib29sZWFuID0gZmFsc2Vcbikge1xuXHRsZXQgcmV0dXJuVmFsdWU6IGFueSA9IGdldFZhbHVlQmluZGluZyhvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLCBmaWVsZEZvcm1hdE9wdGlvbnMsIGFzT2JqZWN0KTtcblx0aWYgKHJldHVyblZhbHVlID09PSBcIlwiKSB7XG5cdFx0cmV0dXJuVmFsdWUgPSBnZXRUZXh0QmluZGluZyhvUHJvcGVydHlWYWx1ZURhdGFNb2RlbE9iamVjdFBhdGgsIGZpZWxkRm9ybWF0T3B0aW9ucywgYXNPYmplY3QpO1xuXHR9XG5cdHJldHVybiByZXR1cm5WYWx1ZTtcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRRdWlja1ZpZXdUeXBlID0gZnVuY3Rpb24gKG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgpOiBzdHJpbmcge1xuXHRjb25zdCB0YXJnZXRPYmplY3QgPSBvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdDtcblx0aWYgKHRhcmdldE9iamVjdD8uJHRhcmdldD8uYW5ub3RhdGlvbnM/LkNvbW11bmljYXRpb24/LklzRW1haWxBZGRyZXNzKSB7XG5cdFx0cmV0dXJuIFwiZW1haWxcIjtcblx0fVxuXHRpZiAodGFyZ2V0T2JqZWN0Py4kdGFyZ2V0Py5hbm5vdGF0aW9ucz8uQ29tbXVuaWNhdGlvbj8uSXNQaG9uZU51bWJlcikge1xuXHRcdHJldHVybiBcInBob25lXCI7XG5cdH1cblx0cmV0dXJuIFwidGV4dFwiO1xufTtcblxuZXhwb3J0IHR5cGUgU2VtYW50aWNPYmplY3RDdXN0b21EYXRhID0ge1xuXHRrZXk6IHN0cmluZztcblx0dmFsdWU6IHN0cmluZztcbn07XG5cbi8qKlxuICogR2V0IHRoZSBjdXN0b21EYXRhIGtleSB2YWx1ZSBwYWlyIG9mIFNlbWFudGljT2JqZWN0cy5cbiAqXG4gKiBAcGFyYW0gcHJvcGVydHlBbm5vdGF0aW9ucyBUaGUgdmFsdWUgb2YgdGhlIENvbW1vbiBhbm5vdGF0aW9uLlxuICogQHBhcmFtIFtkeW5hbWljU2VtYW50aWNPYmplY3RzT25seV0gRmxhZyBmb3IgcmV0cmlldmluZyBkeW5hbWljIFNlbWFudGljIE9iamVjdHMgb25seS5cbiAqIEByZXR1cm5zIFRoZSBhcnJheSBvZiB0aGUgc2VtYW50aWMgT2JqZWN0cy5cbiAqL1xuZXhwb3J0IGNvbnN0IGdldFNlbWFudGljT2JqZWN0RXhwcmVzc2lvblRvUmVzb2x2ZSA9IGZ1bmN0aW9uIChcblx0cHJvcGVydHlBbm5vdGF0aW9uczogYW55LFxuXHRkeW5hbWljU2VtYW50aWNPYmplY3RzT25seT86IGJvb2xlYW5cbik6IFNlbWFudGljT2JqZWN0Q3VzdG9tRGF0YVtdIHtcblx0Y29uc3QgYVNlbU9iakV4cHJUb1Jlc29sdmU6IFNlbWFudGljT2JqZWN0Q3VzdG9tRGF0YVtdID0gW107XG5cdGxldCBzU2VtT2JqRXhwcmVzc2lvbjogc3RyaW5nO1xuXHRsZXQgYW5ub3RhdGlvbjtcblx0aWYgKHByb3BlcnR5QW5ub3RhdGlvbnMpIHtcblx0XHRjb25zdCBzZW1hbnRpY09iamVjdHNLZXlzID0gT2JqZWN0LmtleXMocHJvcGVydHlBbm5vdGF0aW9ucykuZmlsdGVyKGZ1bmN0aW9uIChlbGVtZW50KSB7XG5cdFx0XHRyZXR1cm4gZWxlbWVudCA9PT0gXCJTZW1hbnRpY09iamVjdFwiIHx8IGVsZW1lbnQuc3RhcnRzV2l0aChcIlNlbWFudGljT2JqZWN0I1wiKTtcblx0XHR9KTtcblx0XHRmb3IgKGNvbnN0IHNlbWFudGljT2JqZWN0IG9mIHNlbWFudGljT2JqZWN0c0tleXMpIHtcblx0XHRcdGFubm90YXRpb24gPSBwcm9wZXJ0eUFubm90YXRpb25zW3NlbWFudGljT2JqZWN0XTtcblx0XHRcdHNTZW1PYmpFeHByZXNzaW9uID0gY29tcGlsZUV4cHJlc3Npb24oZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKGFubm90YXRpb24pKSBhcyBzdHJpbmc7XG5cdFx0XHRpZiAoIWR5bmFtaWNTZW1hbnRpY09iamVjdHNPbmx5IHx8IChkeW5hbWljU2VtYW50aWNPYmplY3RzT25seSAmJiBhbm5vdGF0aW9uPy50eXBlID09PSBcIlBhdGhcIikpIHtcblx0XHRcdFx0YVNlbU9iakV4cHJUb1Jlc29sdmUucHVzaCh7XG5cdFx0XHRcdFx0a2V5OiBnZXREeW5hbWljUGF0aEZyb21TZW1hbnRpY09iamVjdChzU2VtT2JqRXhwcmVzc2lvbikgfHwgc1NlbU9iakV4cHJlc3Npb24sXG5cdFx0XHRcdFx0dmFsdWU6IHNTZW1PYmpFeHByZXNzaW9uXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gYVNlbU9iakV4cHJUb1Jlc29sdmU7XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0U2VtYW50aWNPYmplY3RzID0gZnVuY3Rpb24gKGFTZW1PYmpFeHByVG9SZXNvbHZlOiBhbnlbXSk6IGFueSB7XG5cdGlmIChhU2VtT2JqRXhwclRvUmVzb2x2ZS5sZW5ndGggPiAwKSB7XG5cdFx0bGV0IHNDdXN0b21EYXRhS2V5OiBzdHJpbmcgPSBcIlwiO1xuXHRcdGxldCBzQ3VzdG9tRGF0YVZhbHVlOiBhbnkgPSBcIlwiO1xuXHRcdGNvbnN0IGFTZW1PYmpDdXN0b21EYXRhOiBhbnlbXSA9IFtdO1xuXHRcdGZvciAobGV0IGlTZW1PYmpDb3VudCA9IDA7IGlTZW1PYmpDb3VudCA8IGFTZW1PYmpFeHByVG9SZXNvbHZlLmxlbmd0aDsgaVNlbU9iakNvdW50KyspIHtcblx0XHRcdHNDdXN0b21EYXRhS2V5ID0gYVNlbU9iakV4cHJUb1Jlc29sdmVbaVNlbU9iakNvdW50XS5rZXk7XG5cdFx0XHRzQ3VzdG9tRGF0YVZhbHVlID0gY29tcGlsZUV4cHJlc3Npb24oZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKGFTZW1PYmpFeHByVG9SZXNvbHZlW2lTZW1PYmpDb3VudF0udmFsdWUpKTtcblx0XHRcdGFTZW1PYmpDdXN0b21EYXRhLnB1c2goe1xuXHRcdFx0XHRrZXk6IHNDdXN0b21EYXRhS2V5LFxuXHRcdFx0XHR2YWx1ZTogc0N1c3RvbURhdGFWYWx1ZVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdGNvbnN0IG9TZW1hbnRpY09iamVjdHNNb2RlbDogYW55ID0gbmV3IEpTT05Nb2RlbChhU2VtT2JqQ3VzdG9tRGF0YSk7XG5cdFx0b1NlbWFudGljT2JqZWN0c01vZGVsLiQkdmFsdWVBc1Byb21pc2UgPSB0cnVlO1xuXHRcdGNvbnN0IG9TZW1PYmpCaW5kaW5nQ29udGV4dDogYW55ID0gb1NlbWFudGljT2JqZWN0c01vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KFwiL1wiKTtcblx0XHRyZXR1cm4gb1NlbU9iakJpbmRpbmdDb250ZXh0O1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBuZXcgSlNPTk1vZGVsKFtdKS5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIik7XG5cdH1cbn07XG5cbi8qKlxuICogTWV0aG9kIHRvIGdldCBNdWx0aXBsZUxpbmVzIGZvciBhIERhdGFGaWVsZC5cbiAqXG4gKiBAbmFtZSBnZXRNdWx0aXBsZUxpbmVzRm9yRGF0YUZpZWxkXG4gKiBAcGFyYW0ge2FueX0gb1RoaXMgVGhlIGN1cnJlbnQgb2JqZWN0XG4gKiBAcGFyYW0ge3N0cmluZ30gc1Byb3BlcnR5VHlwZSBUaGUgcHJvcGVydHkgdHlwZVxuICogQHBhcmFtIHtib29sZWFufSBpc011bHRpTGluZVRleHQgVGhlIHByb3BlcnR5IGlzTXVsdGlMaW5lVGV4dFxuICogQHJldHVybnMge0NvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPHN0cmluZz59IFRoZSBiaW5kaW5nIGV4cHJlc3Npb24gdG8gZGV0ZXJtaW5lIGlmIGEgZGF0YSBmaWVsZCBzaG91bGQgYmUgYSBNdWx0aUxpbmVUZXh0IG9yIG5vdFxuICogQHB1YmxpY1xuICovXG5cbmV4cG9ydCBjb25zdCBnZXRNdWx0aXBsZUxpbmVzRm9yRGF0YUZpZWxkID0gZnVuY3Rpb24gKG9UaGlzOiBhbnksIHNQcm9wZXJ0eVR5cGU6IHN0cmluZywgaXNNdWx0aUxpbmVUZXh0OiBib29sZWFuKTogYW55IHtcblx0aWYgKG9UaGlzLndyYXAgPT09IGZhbHNlKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cdGlmIChzUHJvcGVydHlUeXBlICE9PSBcIkVkbS5TdHJpbmdcIikge1xuXHRcdHJldHVybiBpc011bHRpTGluZVRleHQ7XG5cdH1cblx0aWYgKG9UaGlzLmVkaXRNb2RlID09PSBcIkRpc3BsYXlcIikge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cdGlmIChvVGhpcy5lZGl0TW9kZS5pbmRleE9mKFwie1wiKSA+IC0xKSB7XG5cdFx0Ly8gSWYgdGhlIGVkaXRNb2RlIGlzIGNvbXB1dGVkIHRoZW4gd2UganVzdCBjYXJlIGFib3V0IHRoZSBwYWdlIGVkaXRNb2RlIHRvIGRldGVybWluZSBpZiB0aGUgbXVsdGlsaW5lIHByb3BlcnR5IHNob3VsZCBiZSB0YWtlbiBpbnRvIGFjY291bnRcblx0XHRyZXR1cm4gY29tcGlsZUV4cHJlc3Npb24ob3Iobm90KFVJLklzRWRpdGFibGUpLCBpc011bHRpTGluZVRleHQpKTtcblx0fVxuXHRyZXR1cm4gaXNNdWx0aUxpbmVUZXh0O1xufTtcblxuY29uc3QgX2hhc1ZhbHVlSGVscFRvU2hvdyA9IGZ1bmN0aW9uIChvUHJvcGVydHk6IFByb3BlcnR5LCBtZWFzdXJlRGlzcGxheU1vZGU6IHN0cmluZyB8IHVuZGVmaW5lZCk6IGJvb2xlYW4gfCB1bmRlZmluZWQge1xuXHQvLyB3ZSBzaG93IGEgdmFsdWUgaGVscCBpZiB0ZWggcHJvcGVydHkgaGFzIG9uZSBvciBpZiBpdHMgdmlzaWJsZSB1bml0IGhhcyBvbmVcblx0Y29uc3Qgb1Byb3BlcnR5VW5pdCA9IFByb3BlcnR5SGVscGVyLmdldEFzc29jaWF0ZWRVbml0UHJvcGVydHkob1Byb3BlcnR5KTtcblx0Y29uc3Qgb1Byb3BlcnR5Q3VycmVuY3kgPSBQcm9wZXJ0eUhlbHBlci5nZXRBc3NvY2lhdGVkQ3VycmVuY3lQcm9wZXJ0eShvUHJvcGVydHkpO1xuXHRyZXR1cm4gKFxuXHRcdChQcm9wZXJ0eUhlbHBlci5oYXNWYWx1ZUhlbHAob1Byb3BlcnR5KSAmJiBvUHJvcGVydHkudHlwZSAhPT0gXCJFZG0uQm9vbGVhblwiKSB8fFxuXHRcdChtZWFzdXJlRGlzcGxheU1vZGUgIT09IFwiSGlkZGVuXCIgJiZcblx0XHRcdCgob1Byb3BlcnR5VW5pdCAmJiBQcm9wZXJ0eUhlbHBlci5oYXNWYWx1ZUhlbHAob1Byb3BlcnR5VW5pdCkpIHx8XG5cdFx0XHRcdChvUHJvcGVydHlDdXJyZW5jeSAmJiBQcm9wZXJ0eUhlbHBlci5oYXNWYWx1ZUhlbHAob1Byb3BlcnR5Q3VycmVuY3kpKSkpXG5cdCk7XG59O1xuXG4vKipcbiAqIFNldHMgRWRpdCBTdHlsZSBwcm9wZXJ0aWVzIGZvciBGaWVsZCBpbiBjYXNlIG9mIE1hY3JvIEZpZWxkKEZpZWxkLm1ldGFkYXRhLnRzKSBhbmQgTWFzc0VkaXREaWFsb2cgZmllbGRzLlxuICpcbiAqIEBwYXJhbSBvUHJvcHMgRmllbGQgUHJvcGVydGllcyBmb3IgdGhlIE1hY3JvIEZpZWxkLlxuICogQHBhcmFtIG9EYXRhRmllbGQgRGF0YUZpZWxkIE9iamVjdC5cbiAqIEBwYXJhbSBvRGF0YU1vZGVsUGF0aCBEYXRhTW9kZWwgT2JqZWN0IFBhdGggdG8gdGhlIHByb3BlcnR5LlxuICogQHBhcmFtIG9ubHlFZGl0U3R5bGUgVG8gYWRkIG9ubHkgZWRpdFN0eWxlLlxuICovXG5leHBvcnQgY29uc3Qgc2V0RWRpdFN0eWxlUHJvcGVydGllcyA9IGZ1bmN0aW9uIChcblx0b1Byb3BzOiBGaWVsZFByb3BlcnRpZXMsXG5cdG9EYXRhRmllbGQ6IGFueSxcblx0b0RhdGFNb2RlbFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgsXG5cdG9ubHlFZGl0U3R5bGU/OiBib29sZWFuXG4pOiB2b2lkIHtcblx0Y29uc3Qgb1Byb3BlcnR5ID0gb0RhdGFNb2RlbFBhdGgudGFyZ2V0T2JqZWN0O1xuXHRpZiAoIVByb3BlcnR5SGVscGVyLmlzUHJvcGVydHkob1Byb3BlcnR5KSkge1xuXHRcdG9Qcm9wcy5lZGl0U3R5bGUgPSBudWxsO1xuXHRcdHJldHVybjtcblx0fVxuXHRpZiAoIW9ubHlFZGl0U3R5bGUpIHtcblx0XHRvUHJvcHMudmFsdWVCaW5kaW5nRXhwcmVzc2lvbiA9IGdldFZhbHVlQmluZGluZyhvRGF0YU1vZGVsUGF0aCwgb1Byb3BzLmZvcm1hdE9wdGlvbnMpO1xuXHR9XG5cblx0c3dpdGNoIChvRGF0YUZpZWxkLiRUeXBlKSB7XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBbm5vdGF0aW9uOlxuXHRcdFx0aWYgKG9EYXRhRmllbGQuVGFyZ2V0Py4kdGFyZ2V0Py5WaXN1YWxpemF0aW9uID09PSBcIlVJLlZpc3VhbGl6YXRpb25UeXBlL1JhdGluZ1wiKSB7XG5cdFx0XHRcdG9Qcm9wcy5lZGl0U3R5bGUgPSBcIlJhdGluZ0luZGljYXRvclwiO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFQb2ludFR5cGU6XG5cdFx0XHRpZiAob0RhdGFGaWVsZD8uVmlzdWFsaXphdGlvbiA9PT0gXCJVSS5WaXN1YWxpemF0aW9uVHlwZS9SYXRpbmdcIikge1xuXHRcdFx0XHRvUHJvcHMuZWRpdFN0eWxlID0gXCJSYXRpbmdJbmRpY2F0b3JcIjtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBY3Rpb246XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoTmF2aWdhdGlvblBhdGg6XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb246XG5cdFx0XHRvUHJvcHMuZWRpdFN0eWxlID0gbnVsbDtcblx0XHRcdHJldHVybjtcblx0XHRkZWZhdWx0OlxuXHR9XG5cdGlmIChfaGFzVmFsdWVIZWxwVG9TaG93KG9Qcm9wZXJ0eSwgb1Byb3BzLmZvcm1hdE9wdGlvbnM/Lm1lYXN1cmVEaXNwbGF5TW9kZSkpIHtcblx0XHRpZiAoIW9ubHlFZGl0U3R5bGUpIHtcblx0XHRcdG9Qcm9wcy50ZXh0QmluZGluZ0V4cHJlc3Npb24gPSBnZXRBc3NvY2lhdGVkVGV4dEJpbmRpbmcob0RhdGFNb2RlbFBhdGgsIG9Qcm9wcy5mb3JtYXRPcHRpb25zKTtcblx0XHRcdGlmIChvUHJvcHMuZm9ybWF0T3B0aW9ucz8ubWVhc3VyZURpc3BsYXlNb2RlICE9PSBcIkhpZGRlblwiKSB7XG5cdFx0XHRcdC8vIGZvciB0aGUgTURDIEZpZWxkIHdlIG5lZWQgdG8ga2VlcCB0aGUgdW5pdCBpbnNpZGUgdGhlIHZhbHVlQmluZGluZ0V4cHJlc3Npb25cblx0XHRcdFx0b1Byb3BzLnZhbHVlQmluZGluZ0V4cHJlc3Npb24gPSBnZXRWYWx1ZUJpbmRpbmcob0RhdGFNb2RlbFBhdGgsIG9Qcm9wcy5mb3JtYXRPcHRpb25zLCBmYWxzZSwgZmFsc2UsIHVuZGVmaW5lZCwgZmFsc2UsIHRydWUpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRvUHJvcHMuZWRpdFN0eWxlID0gXCJJbnB1dFdpdGhWYWx1ZUhlbHBcIjtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRzd2l0Y2ggKG9Qcm9wZXJ0eS50eXBlKSB7XG5cdFx0Y2FzZSBcIkVkbS5EYXRlXCI6XG5cdFx0XHRvUHJvcHMuZWRpdFN0eWxlID0gXCJEYXRlUGlja2VyXCI7XG5cdFx0XHRyZXR1cm47XG5cdFx0Y2FzZSBcIkVkbS5UaW1lXCI6XG5cdFx0Y2FzZSBcIkVkbS5UaW1lT2ZEYXlcIjpcblx0XHRcdG9Qcm9wcy5lZGl0U3R5bGUgPSBcIlRpbWVQaWNrZXJcIjtcblx0XHRcdHJldHVybjtcblx0XHRjYXNlIFwiRWRtLkRhdGVUaW1lXCI6XG5cdFx0Y2FzZSBcIkVkbS5EYXRlVGltZU9mZnNldFwiOlxuXHRcdFx0b1Byb3BzLmVkaXRTdHlsZSA9IFwiRGF0ZVRpbWVQaWNrZXJcIjtcblx0XHRcdC8vIE5vIHRpbWV6b25lIGRlZmluZWQuIEFsc28gZm9yIGNvbXBhdGliaWxpdHkgcmVhc29ucy5cblx0XHRcdGlmICghb1Byb3BlcnR5LmFubm90YXRpb25zPy5Db21tb24/LlRpbWV6b25lKSB7XG5cdFx0XHRcdG9Qcm9wcy5zaG93VGltZXpvbmUgPSB1bmRlZmluZWQ7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRvUHJvcHMuc2hvd1RpbWV6b25lID0gdHJ1ZTtcblx0XHRcdH1cblx0XHRcdHJldHVybjtcblx0XHRjYXNlIFwiRWRtLkJvb2xlYW5cIjpcblx0XHRcdG9Qcm9wcy5lZGl0U3R5bGUgPSBcIkNoZWNrQm94XCI7XG5cdFx0XHRyZXR1cm47XG5cdFx0Y2FzZSBcIkVkbS5TdHJlYW1cIjpcblx0XHRcdG9Qcm9wcy5lZGl0U3R5bGUgPSBcIkZpbGVcIjtcblx0XHRcdHJldHVybjtcblx0XHRjYXNlIFwiRWRtLlN0cmluZ1wiOlxuXHRcdFx0aWYgKG9Qcm9wZXJ0eS5hbm5vdGF0aW9ucz8uVUk/Lk11bHRpTGluZVRleHQ/LnZhbHVlT2YoKSkge1xuXHRcdFx0XHRvUHJvcHMuZWRpdFN0eWxlID0gXCJUZXh0QXJlYVwiO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRicmVhaztcblx0XHRkZWZhdWx0OlxuXHRcdFx0b1Byb3BzLmVkaXRTdHlsZSA9IFwiSW5wdXRcIjtcblx0fVxuXHRpZiAob1Byb3BlcnR5LmFubm90YXRpb25zPy5NZWFzdXJlcz8uSVNPQ3VycmVuY3kgfHwgb1Byb3BlcnR5LmFubm90YXRpb25zPy5NZWFzdXJlcz8uVW5pdCkge1xuXHRcdGlmICghb25seUVkaXRTdHlsZSkge1xuXHRcdFx0b1Byb3BzLnVuaXRCaW5kaW5nRXhwcmVzc2lvbiA9IGNvbXBpbGVFeHByZXNzaW9uKFVJRm9ybWF0dGVycy5nZXRCaW5kaW5nRm9yVW5pdE9yQ3VycmVuY3kob0RhdGFNb2RlbFBhdGgpKTtcblx0XHRcdG9Qcm9wcy5kZXNjcmlwdGlvbkJpbmRpbmdFeHByZXNzaW9uID0gVUlGb3JtYXR0ZXJzLmlmVW5pdEVkaXRhYmxlKFxuXHRcdFx0XHRvUHJvcGVydHksXG5cdFx0XHRcdFwiXCIsXG5cdFx0XHRcdFVJRm9ybWF0dGVycy5nZXRCaW5kaW5nRm9yVW5pdE9yQ3VycmVuY3kob0RhdGFNb2RlbFBhdGgpXG5cdFx0XHQpO1xuXHRcdFx0Y29uc3QgdW5pdFByb3BlcnR5ID1cblx0XHRcdFx0UHJvcGVydHlIZWxwZXIuZ2V0QXNzb2NpYXRlZEN1cnJlbmN5UHJvcGVydHkob1Byb3BlcnR5KSB8fCBQcm9wZXJ0eUhlbHBlci5nZXRBc3NvY2lhdGVkVW5pdFByb3BlcnR5KG9Qcm9wZXJ0eSk7XG5cdFx0XHRvUHJvcHMudW5pdEVkaXRhYmxlID0gY29tcGlsZUV4cHJlc3Npb24obm90KGlzUmVhZE9ubHlFeHByZXNzaW9uKHVuaXRQcm9wZXJ0eSkpKTtcblx0XHR9XG5cdFx0b1Byb3BzLmVkaXRTdHlsZSA9IFwiSW5wdXRXaXRoVW5pdFwiO1xuXHRcdHJldHVybjtcblx0fVxuXG5cdG9Qcm9wcy5lZGl0U3R5bGUgPSBcIklucHV0XCI7XG59O1xuXG5leHBvcnQgY29uc3QgaGFzU2VtYW50aWNPYmplY3RJbk5hdmlnYXRpb25PclByb3BlcnR5ID0gKHByb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCkgPT4ge1xuXHRjb25zdCBwcm9wZXJ0eSA9IHByb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QgYXMgUHJvcGVydHk7XG5cdGlmIChTZW1hbnRpY09iamVjdEhlbHBlci5oYXNTZW1hbnRpY09iamVjdChwcm9wZXJ0eSkpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXHRjb25zdCBsYXN0TmF2UHJvcCA9IHByb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aD8ubmF2aWdhdGlvblByb3BlcnRpZXM/Lmxlbmd0aFxuXHRcdD8gcHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoPy5uYXZpZ2F0aW9uUHJvcGVydGllc1twcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGg/Lm5hdmlnYXRpb25Qcm9wZXJ0aWVzPy5sZW5ndGggLSAxXVxuXHRcdDogbnVsbDtcblx0aWYgKFxuXHRcdCFsYXN0TmF2UHJvcCB8fFxuXHRcdHByb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aC5jb250ZXh0TG9jYXRpb24/Lm5hdmlnYXRpb25Qcm9wZXJ0aWVzPy5maW5kKFxuXHRcdFx0KGNvbnRleHROYXZQcm9wKSA9PiBjb250ZXh0TmF2UHJvcC5uYW1lID09PSBsYXN0TmF2UHJvcC5uYW1lXG5cdFx0KVxuXHQpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblx0cmV0dXJuIFNlbWFudGljT2JqZWN0SGVscGVyLmhhc1NlbWFudGljT2JqZWN0KGxhc3ROYXZQcm9wKTtcbn07XG5cbi8qKlxuICogR2V0IHRoZSBkYXRhTW9kZWxPYmplY3RQYXRoIHdpdGggdGhlIHZhbHVlIHByb3BlcnR5IGFzIHRhcmdldE9iamVjdCBpZiBpdCBleGlzdHNcbiAqIGZvciBhIGRhdGFNb2RlbE9iamVjdFBhdGggdGFyZ2V0aW5nIGEgRGF0YUZpZWxkIG9yIGEgRGF0YVBvaW50IGFubm90YXRpb24uXG4gKlxuICogQHBhcmFtIGluaXRpYWxEYXRhTW9kZWxPYmplY3RQYXRoXG4gKiBAcmV0dXJucyBUaGUgZGF0YU1vZGVsT2JqZWN0UGF0aCB0YXJnZXRpaW5nIHRoZSB2YWx1ZSBwcm9wZXJ0eSBvciB1bmRlZmluZWRcbiAqL1xuZXhwb3J0IGNvbnN0IGdldERhdGFNb2RlbE9iamVjdFBhdGhGb3JWYWx1ZSA9IChpbml0aWFsRGF0YU1vZGVsT2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCk6IERhdGFNb2RlbE9iamVjdFBhdGggfCB1bmRlZmluZWQgPT4ge1xuXHRpZiAoIWluaXRpYWxEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdCkge1xuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cblx0bGV0IHZhbHVlUGF0aCA9IFwiXCI7XG5cdC8vIGRhdGEgcG9pbnQgYW5ub3RhdGlvbnMgbmVlZCBub3QgaGF2ZSAkVHlwZSBkZWZpbmVkLCBzbyBhZGQgaXQgaWYgbWlzc2luZ1xuXHRpZiAoaW5pdGlhbERhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0LnRlcm0gPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YVBvaW50XCIpIHtcblx0XHRpbml0aWFsRGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QuJFR5cGUgPSBpbml0aWFsRGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QuJFR5cGUgfHwgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YVBvaW50VHlwZTtcblx0fVxuXHRzd2l0Y2ggKGluaXRpYWxEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdC4kVHlwZSkge1xuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkOlxuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YVBvaW50VHlwZTpcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhOYXZpZ2F0aW9uUGF0aDpcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhVcmw6XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoSW50ZW50QmFzZWROYXZpZ2F0aW9uOlxuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aEFjdGlvbjpcblx0XHRcdGlmICh0eXBlb2YgaW5pdGlhbERhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0LlZhbHVlID09PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRcdHZhbHVlUGF0aCA9IGluaXRpYWxEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdC5WYWx1ZS5wYXRoO1xuXHRcdFx0fVxuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBbm5vdGF0aW9uOlxuXHRcdFx0aWYgKGluaXRpYWxEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdC5UYXJnZXQuJHRhcmdldCkge1xuXHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0aW5pdGlhbERhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0LlRhcmdldC4kdGFyZ2V0LiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGQgfHxcblx0XHRcdFx0XHRpbml0aWFsRGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QuVGFyZ2V0LiR0YXJnZXQuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFQb2ludFR5cGVcblx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0aWYgKGluaXRpYWxEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdC5UYXJnZXQudmFsdWUuaW5kZXhPZihcIi9cIikgPiAwKSB7XG5cdFx0XHRcdFx0XHR2YWx1ZVBhdGggPSBpbml0aWFsRGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QuVGFyZ2V0LnZhbHVlLnJlcGxhY2UoXG5cdFx0XHRcdFx0XHRcdC9cXC9ALiovLFxuXHRcdFx0XHRcdFx0XHRgLyR7aW5pdGlhbERhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0LlRhcmdldC4kdGFyZ2V0LlZhbHVlPy5wYXRofWBcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHZhbHVlUGF0aCA9IGluaXRpYWxEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdC5UYXJnZXQuJHRhcmdldC5WYWx1ZT8ucGF0aDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dmFsdWVQYXRoID0gaW5pdGlhbERhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0LlRhcmdldD8ucGF0aDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0YnJlYWs7XG5cdH1cblxuXHRpZiAodmFsdWVQYXRoICYmIHZhbHVlUGF0aC5sZW5ndGggPiAwKSB7XG5cdFx0cmV0dXJuIGVuaGFuY2VEYXRhTW9kZWxQYXRoKGluaXRpYWxEYXRhTW9kZWxPYmplY3RQYXRoLCB2YWx1ZVBhdGgpO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cbn07XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBZ0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ08sTUFBTUEscUNBQXFDLEdBQUcsVUFDcERDLDBCQUF5RCxFQUN6REMsZUFBb0MsRUFDSjtJQUNoQyxPQUFPQyxvQkFBb0IsQ0FBQ0YsMEJBQTBCLEVBQUUsYUFBYSxFQUFHRyxVQUFVLElBQUs7TUFDdEYsSUFBSUMsYUFBNEMsR0FBR0QsVUFBVTtNQUM3RCxJQUFJQSxVQUFVLENBQUNFLFNBQVMsS0FBS0MsU0FBUyxFQUFFO1FBQ3ZDO1FBQ0EsTUFBTUMsc0JBQXNCLEdBQUdDLG9CQUFvQixDQUFDUCxlQUFlLEVBQUVFLFVBQVUsQ0FBQ00sSUFBSSxDQUFDO1FBQ3JGTCxhQUFhLEdBQUdNLGdCQUFnQixDQUFDQyw2QkFBNkIsQ0FBQ0osc0JBQXNCLEVBQUVKLFVBQVUsQ0FBQztNQUNuRztNQUNBLE9BQU9DLGFBQWE7SUFD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