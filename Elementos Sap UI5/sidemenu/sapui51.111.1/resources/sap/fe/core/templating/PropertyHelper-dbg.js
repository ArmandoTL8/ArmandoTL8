/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/templating/SemanticObjectHelper"], function (SemanticObjectHelper) {
  "use strict";

  var _exports = {};
  /**
   * Identify if the given property passed is a "Property" (has a _type).
   *
   * @param property A target property to evaluate
   * @returns Validate that property is a Property
   */
  function isProperty(property) {
    return property && property.hasOwnProperty("_type") && property._type === "Property";
  }

  /**
   * Check whether the property has the Core.Computed annotation or not.
   *
   * @param oProperty The target property
   * @returns `true` if the property is computed
   */
  _exports.isProperty = isProperty;
  const isComputed = function (oProperty) {
    var _oProperty$annotation, _oProperty$annotation2, _oProperty$annotation3;
    return !!((_oProperty$annotation = oProperty.annotations) !== null && _oProperty$annotation !== void 0 && (_oProperty$annotation2 = _oProperty$annotation.Core) !== null && _oProperty$annotation2 !== void 0 && (_oProperty$annotation3 = _oProperty$annotation2.Computed) !== null && _oProperty$annotation3 !== void 0 && _oProperty$annotation3.valueOf());
  };

  /**
   * Identify if the given property passed is a "NavigationProperty".
   *
   * @param property A target property to evaluate
   * @returns Validate that property is a NavigationProperty
   */
  _exports.isComputed = isComputed;
  function isNavigationProperty(property) {
    return property && property.hasOwnProperty("_type") && property._type === "NavigationProperty";
  }

  /**
   * Check whether the property has the Core.Immutable annotation or not.
   *
   * @param oProperty The target property
   * @returns `true` if it's immutable
   */
  _exports.isNavigationProperty = isNavigationProperty;
  const isImmutable = function (oProperty) {
    var _oProperty$annotation4, _oProperty$annotation5, _oProperty$annotation6;
    return !!((_oProperty$annotation4 = oProperty.annotations) !== null && _oProperty$annotation4 !== void 0 && (_oProperty$annotation5 = _oProperty$annotation4.Core) !== null && _oProperty$annotation5 !== void 0 && (_oProperty$annotation6 = _oProperty$annotation5.Immutable) !== null && _oProperty$annotation6 !== void 0 && _oProperty$annotation6.valueOf());
  };

  /**
   * Check whether the property is a key or not.
   *
   * @param oProperty The target property
   * @returns `true` if it's a key
   */
  _exports.isImmutable = isImmutable;
  const isKey = function (oProperty) {
    return !!oProperty.isKey;
  };

  /**
   * Check whether the property is a semanticKey for the context entity.
   *
   * @param property
   * @param contextDataModelObject The DataModelObject that holds the context
   * @returns `true`if it's a semantic key
   */
  _exports.isKey = isKey;
  const isSemanticKey = function (property, contextDataModelObject) {
    var _contextDataModelObje, _contextDataModelObje2, _contextDataModelObje3, _contextDataModelObje4;
    const semanticKeys = (_contextDataModelObje = contextDataModelObject.contextLocation) === null || _contextDataModelObje === void 0 ? void 0 : (_contextDataModelObje2 = _contextDataModelObje.targetEntityType) === null || _contextDataModelObje2 === void 0 ? void 0 : (_contextDataModelObje3 = _contextDataModelObje2.annotations) === null || _contextDataModelObje3 === void 0 ? void 0 : (_contextDataModelObje4 = _contextDataModelObje3.Common) === null || _contextDataModelObje4 === void 0 ? void 0 : _contextDataModelObje4.SemanticKey;
    return (semanticKeys === null || semanticKeys === void 0 ? void 0 : semanticKeys.some(function (key) {
      var _key$$target;
      return (key === null || key === void 0 ? void 0 : (_key$$target = key.$target) === null || _key$$target === void 0 ? void 0 : _key$$target.fullyQualifiedName) === property.fullyQualifiedName;
    })) ?? false;
  };

  /**
   * Checks whether the property has a date time or not.
   *
   * @param oProperty
   * @returns `true` if it is of type date / datetime / datetimeoffset
   */
  _exports.isSemanticKey = isSemanticKey;
  const hasDateType = function (oProperty) {
    return ["Edm.Date", "Edm.DateTime", "Edm.DateTimeOffset"].indexOf(oProperty.type) !== -1;
  };

  /**
   * Retrieve the label annotation.
   *
   * @param oProperty The target property
   * @returns The label string
   */
  _exports.hasDateType = hasDateType;
  const getLabel = function (oProperty) {
    var _oProperty$annotation7, _oProperty$annotation8, _oProperty$annotation9;
    return ((_oProperty$annotation7 = oProperty.annotations) === null || _oProperty$annotation7 === void 0 ? void 0 : (_oProperty$annotation8 = _oProperty$annotation7.Common) === null || _oProperty$annotation8 === void 0 ? void 0 : (_oProperty$annotation9 = _oProperty$annotation8.Label) === null || _oProperty$annotation9 === void 0 ? void 0 : _oProperty$annotation9.toString()) || "";
  };

  /**
   * Check whether the property has a semantic object defined or not.
   *
   * @param property The target property
   * @returns `true` if it has a semantic object
   */
  _exports.getLabel = getLabel;
  const hasSemanticObject = function (property) {
    return SemanticObjectHelper.hasSemanticObject(property);
  };
  _exports.hasSemanticObject = hasSemanticObject;
  const isPathExpression = function (expression) {
    return !!expression && expression.type !== undefined && expression.type === "Path";
  };
  _exports.isPathExpression = isPathExpression;
  const isPropertyPathExpression = function (expression) {
    return !!expression && expression.type !== undefined && expression.type === "PropertyPath";
  };
  _exports.isPropertyPathExpression = isPropertyPathExpression;
  const isAnnotationPathExpression = function (expression) {
    return !!expression && expression.type !== undefined && expression.type === "AnnotationPath";
  };

  /**
   * Retrieves the timezone property associated to the property, if applicable.
   *
   * @param oProperty The target property
   * @returns The timezone property, if it exists
   */
  _exports.isAnnotationPathExpression = isAnnotationPathExpression;
  const getAssociatedTimezoneProperty = function (oProperty) {
    var _oProperty$annotation10, _oProperty$annotation11, _oProperty$annotation12, _oProperty$annotation13;
    return isPathExpression(oProperty === null || oProperty === void 0 ? void 0 : (_oProperty$annotation10 = oProperty.annotations) === null || _oProperty$annotation10 === void 0 ? void 0 : (_oProperty$annotation11 = _oProperty$annotation10.Common) === null || _oProperty$annotation11 === void 0 ? void 0 : _oProperty$annotation11.Timezone) ? (_oProperty$annotation12 = oProperty.annotations) === null || _oProperty$annotation12 === void 0 ? void 0 : (_oProperty$annotation13 = _oProperty$annotation12.Common) === null || _oProperty$annotation13 === void 0 ? void 0 : _oProperty$annotation13.Timezone.$target : undefined;
  };

  /**
   * Retrieves the timezone property path associated to the property, if applicable.
   *
   * @param oProperty The target property
   * @returns The timezone property path, if it exists
   */
  _exports.getAssociatedTimezoneProperty = getAssociatedTimezoneProperty;
  const getAssociatedTimezonePropertyPath = function (oProperty) {
    var _oProperty$annotation14, _oProperty$annotation15, _oProperty$annotation16, _oProperty$annotation17, _oProperty$annotation18;
    return isPathExpression(oProperty === null || oProperty === void 0 ? void 0 : (_oProperty$annotation14 = oProperty.annotations) === null || _oProperty$annotation14 === void 0 ? void 0 : (_oProperty$annotation15 = _oProperty$annotation14.Common) === null || _oProperty$annotation15 === void 0 ? void 0 : _oProperty$annotation15.Timezone) ? oProperty === null || oProperty === void 0 ? void 0 : (_oProperty$annotation16 = oProperty.annotations) === null || _oProperty$annotation16 === void 0 ? void 0 : (_oProperty$annotation17 = _oProperty$annotation16.Common) === null || _oProperty$annotation17 === void 0 ? void 0 : (_oProperty$annotation18 = _oProperty$annotation17.Timezone) === null || _oProperty$annotation18 === void 0 ? void 0 : _oProperty$annotation18.path : undefined;
  };

  /**
   * Retrieves the associated text property for that property, if it exists.
   *
   * @param oProperty The target property
   * @returns The text property, if it exists
   */
  _exports.getAssociatedTimezonePropertyPath = getAssociatedTimezonePropertyPath;
  const getAssociatedTextProperty = function (oProperty) {
    var _oProperty$annotation19, _oProperty$annotation20, _oProperty$annotation21, _oProperty$annotation22;
    return isPathExpression(oProperty === null || oProperty === void 0 ? void 0 : (_oProperty$annotation19 = oProperty.annotations) === null || _oProperty$annotation19 === void 0 ? void 0 : (_oProperty$annotation20 = _oProperty$annotation19.Common) === null || _oProperty$annotation20 === void 0 ? void 0 : _oProperty$annotation20.Text) ? (_oProperty$annotation21 = oProperty.annotations) === null || _oProperty$annotation21 === void 0 ? void 0 : (_oProperty$annotation22 = _oProperty$annotation21.Common) === null || _oProperty$annotation22 === void 0 ? void 0 : _oProperty$annotation22.Text.$target : undefined;
  };

  /**
   * Retrieves the unit property associated to the property, if applicable.
   *
   * @param oProperty The target property
   * @returns The unit property, if it exists
   */
  _exports.getAssociatedTextProperty = getAssociatedTextProperty;
  const getAssociatedUnitProperty = function (oProperty) {
    var _oProperty$annotation23, _oProperty$annotation24, _oProperty$annotation25, _oProperty$annotation26;
    return isPathExpression(oProperty === null || oProperty === void 0 ? void 0 : (_oProperty$annotation23 = oProperty.annotations) === null || _oProperty$annotation23 === void 0 ? void 0 : (_oProperty$annotation24 = _oProperty$annotation23.Measures) === null || _oProperty$annotation24 === void 0 ? void 0 : _oProperty$annotation24.Unit) ? (_oProperty$annotation25 = oProperty.annotations) === null || _oProperty$annotation25 === void 0 ? void 0 : (_oProperty$annotation26 = _oProperty$annotation25.Measures) === null || _oProperty$annotation26 === void 0 ? void 0 : _oProperty$annotation26.Unit.$target : undefined;
  };
  _exports.getAssociatedUnitProperty = getAssociatedUnitProperty;
  const getAssociatedUnitPropertyPath = function (oProperty) {
    var _oProperty$annotation27, _oProperty$annotation28, _oProperty$annotation29, _oProperty$annotation30;
    return isPathExpression(oProperty === null || oProperty === void 0 ? void 0 : (_oProperty$annotation27 = oProperty.annotations) === null || _oProperty$annotation27 === void 0 ? void 0 : (_oProperty$annotation28 = _oProperty$annotation27.Measures) === null || _oProperty$annotation28 === void 0 ? void 0 : _oProperty$annotation28.Unit) ? (_oProperty$annotation29 = oProperty.annotations) === null || _oProperty$annotation29 === void 0 ? void 0 : (_oProperty$annotation30 = _oProperty$annotation29.Measures) === null || _oProperty$annotation30 === void 0 ? void 0 : _oProperty$annotation30.Unit.path : undefined;
  };

  /**
   * Retrieves the associated currency property for that property if it exists.
   *
   * @param oProperty The target property
   * @returns The unit property, if it exists
   */
  _exports.getAssociatedUnitPropertyPath = getAssociatedUnitPropertyPath;
  const getAssociatedCurrencyProperty = function (oProperty) {
    var _oProperty$annotation31, _oProperty$annotation32, _oProperty$annotation33, _oProperty$annotation34;
    return isPathExpression(oProperty === null || oProperty === void 0 ? void 0 : (_oProperty$annotation31 = oProperty.annotations) === null || _oProperty$annotation31 === void 0 ? void 0 : (_oProperty$annotation32 = _oProperty$annotation31.Measures) === null || _oProperty$annotation32 === void 0 ? void 0 : _oProperty$annotation32.ISOCurrency) ? (_oProperty$annotation33 = oProperty.annotations) === null || _oProperty$annotation33 === void 0 ? void 0 : (_oProperty$annotation34 = _oProperty$annotation33.Measures) === null || _oProperty$annotation34 === void 0 ? void 0 : _oProperty$annotation34.ISOCurrency.$target : undefined;
  };
  _exports.getAssociatedCurrencyProperty = getAssociatedCurrencyProperty;
  const getAssociatedCurrencyPropertyPath = function (oProperty) {
    var _oProperty$annotation35, _oProperty$annotation36, _oProperty$annotation37, _oProperty$annotation38;
    return isPathExpression(oProperty === null || oProperty === void 0 ? void 0 : (_oProperty$annotation35 = oProperty.annotations) === null || _oProperty$annotation35 === void 0 ? void 0 : (_oProperty$annotation36 = _oProperty$annotation35.Measures) === null || _oProperty$annotation36 === void 0 ? void 0 : _oProperty$annotation36.ISOCurrency) ? (_oProperty$annotation37 = oProperty.annotations) === null || _oProperty$annotation37 === void 0 ? void 0 : (_oProperty$annotation38 = _oProperty$annotation37.Measures) === null || _oProperty$annotation38 === void 0 ? void 0 : _oProperty$annotation38.ISOCurrency.path : undefined;
  };

  /**
   * Retrieves the Common.Text property path if it exists.
   *
   * @param oProperty The target property
   * @returns The Common.Text property path or undefined if it does not exist
   */
  _exports.getAssociatedCurrencyPropertyPath = getAssociatedCurrencyPropertyPath;
  const getAssociatedTextPropertyPath = function (oProperty) {
    var _oProperty$annotation39, _oProperty$annotation40, _oProperty$annotation41, _oProperty$annotation42;
    return isPathExpression((_oProperty$annotation39 = oProperty.annotations) === null || _oProperty$annotation39 === void 0 ? void 0 : (_oProperty$annotation40 = _oProperty$annotation39.Common) === null || _oProperty$annotation40 === void 0 ? void 0 : _oProperty$annotation40.Text) ? (_oProperty$annotation41 = oProperty.annotations) === null || _oProperty$annotation41 === void 0 ? void 0 : (_oProperty$annotation42 = _oProperty$annotation41.Common) === null || _oProperty$annotation42 === void 0 ? void 0 : _oProperty$annotation42.Text.path : undefined;
  };

  /**
   * Check whether the property has a value help annotation defined or not.
   *
   * @param property The target property to be checked
   * @returns `true` if it has a value help
   */
  _exports.getAssociatedTextPropertyPath = getAssociatedTextPropertyPath;
  const hasValueHelp = function (property) {
    var _property$annotations, _property$annotations2, _property$annotations3, _property$annotations4, _property$annotations5, _property$annotations6, _property$annotations7, _property$annotations8;
    return !!((_property$annotations = property.annotations) !== null && _property$annotations !== void 0 && (_property$annotations2 = _property$annotations.Common) !== null && _property$annotations2 !== void 0 && _property$annotations2.ValueList) || !!((_property$annotations3 = property.annotations) !== null && _property$annotations3 !== void 0 && (_property$annotations4 = _property$annotations3.Common) !== null && _property$annotations4 !== void 0 && _property$annotations4.ValueListReferences) || !!((_property$annotations5 = property.annotations) !== null && _property$annotations5 !== void 0 && (_property$annotations6 = _property$annotations5.Common) !== null && _property$annotations6 !== void 0 && _property$annotations6.ValueListWithFixedValues) || !!((_property$annotations7 = property.annotations) !== null && _property$annotations7 !== void 0 && (_property$annotations8 = _property$annotations7.Common) !== null && _property$annotations8 !== void 0 && _property$annotations8.ValueListMapping);
  };

  /**
   * Check whether the property has a value help with fixed value annotation defined or not.
   *
   * @param oProperty The target property
   * @returns `true` if it has a value help
   */
  _exports.hasValueHelp = hasValueHelp;
  const hasValueHelpWithFixedValues = function (oProperty) {
    var _oProperty$annotation43, _oProperty$annotation44, _oProperty$annotation45;
    return !!(oProperty !== null && oProperty !== void 0 && (_oProperty$annotation43 = oProperty.annotations) !== null && _oProperty$annotation43 !== void 0 && (_oProperty$annotation44 = _oProperty$annotation43.Common) !== null && _oProperty$annotation44 !== void 0 && (_oProperty$annotation45 = _oProperty$annotation44.ValueListWithFixedValues) !== null && _oProperty$annotation45 !== void 0 && _oProperty$annotation45.valueOf());
  };

  /**
   * Check whether the property has a value help for validation annotation defined or not.
   *
   * @param oProperty The target property
   * @returns `true` if it has a value help
   */
  _exports.hasValueHelpWithFixedValues = hasValueHelpWithFixedValues;
  const hasValueListForValidation = function (oProperty) {
    var _oProperty$annotation46, _oProperty$annotation47;
    return ((_oProperty$annotation46 = oProperty.annotations) === null || _oProperty$annotation46 === void 0 ? void 0 : (_oProperty$annotation47 = _oProperty$annotation46.Common) === null || _oProperty$annotation47 === void 0 ? void 0 : _oProperty$annotation47.ValueListForValidation) !== undefined;
  };
  _exports.hasValueListForValidation = hasValueListForValidation;
  const hasTimezone = function (oProperty) {
    var _oProperty$annotation48, _oProperty$annotation49;
    return ((_oProperty$annotation48 = oProperty.annotations) === null || _oProperty$annotation48 === void 0 ? void 0 : (_oProperty$annotation49 = _oProperty$annotation48.Common) === null || _oProperty$annotation49 === void 0 ? void 0 : _oProperty$annotation49.Timezone) !== undefined;
  };
  /**
   * Checks whether the property is a unit property.
   *
   * @param property The property to be checked
   * @returns `true` if it is a unit
   */
  _exports.hasTimezone = hasTimezone;
  const isUnit = function (property) {
    var _property$annotations9, _property$annotations10, _property$annotations11;
    return !!((_property$annotations9 = property.annotations) !== null && _property$annotations9 !== void 0 && (_property$annotations10 = _property$annotations9.Common) !== null && _property$annotations10 !== void 0 && (_property$annotations11 = _property$annotations10.IsUnit) !== null && _property$annotations11 !== void 0 && _property$annotations11.valueOf());
  };

  /**
   * Checks whether the property has a text property.
   *
   * @param property The property to be checked
   * @returns `true` if it is a Text
   */
  _exports.isUnit = isUnit;
  const hasText = function (property) {
    var _property$annotations12, _property$annotations13, _property$annotations14;
    return !!((_property$annotations12 = property.annotations) !== null && _property$annotations12 !== void 0 && (_property$annotations13 = _property$annotations12.Common) !== null && _property$annotations13 !== void 0 && (_property$annotations14 = _property$annotations13.Text) !== null && _property$annotations14 !== void 0 && _property$annotations14.valueOf());
  };

  /**
   * Checks whether the property has an ImageURL.
   *
   * @param property The property to be checked
   * @returns `true` if it is an ImageURL
   */
  _exports.hasText = hasText;
  const isImageURL = function (property) {
    var _property$annotations15, _property$annotations16, _property$annotations17;
    return !!((_property$annotations15 = property.annotations) !== null && _property$annotations15 !== void 0 && (_property$annotations16 = _property$annotations15.UI) !== null && _property$annotations16 !== void 0 && (_property$annotations17 = _property$annotations16.IsImageURL) !== null && _property$annotations17 !== void 0 && _property$annotations17.valueOf());
  };

  /**
   * Checks whether the property is a currency property.
   *
   * @param oProperty The property to be checked
   * @returns `true` if it is a currency
   */
  _exports.isImageURL = isImageURL;
  const isCurrency = function (oProperty) {
    var _oProperty$annotation50, _oProperty$annotation51, _oProperty$annotation52;
    return !!((_oProperty$annotation50 = oProperty.annotations) !== null && _oProperty$annotation50 !== void 0 && (_oProperty$annotation51 = _oProperty$annotation50.Common) !== null && _oProperty$annotation51 !== void 0 && (_oProperty$annotation52 = _oProperty$annotation51.IsCurrency) !== null && _oProperty$annotation52 !== void 0 && _oProperty$annotation52.valueOf());
  };

  /**
   * Checks whether the property has a currency property.
   *
   * @param property The property to be checked
   * @returns `true` if it has a currency
   */
  _exports.isCurrency = isCurrency;
  const hasCurrency = function (property) {
    var _property$annotations18, _property$annotations19;
    return ((_property$annotations18 = property.annotations) === null || _property$annotations18 === void 0 ? void 0 : (_property$annotations19 = _property$annotations18.Measures) === null || _property$annotations19 === void 0 ? void 0 : _property$annotations19.ISOCurrency) !== undefined;
  };

  /**
   * Checks whether the property has a unit property.
   *
   * @param property The property to be checked
   * @returns `true` if it has a unit
   */
  _exports.hasCurrency = hasCurrency;
  const hasUnit = function (property) {
    var _property$annotations20, _property$annotations21;
    return ((_property$annotations20 = property.annotations) === null || _property$annotations20 === void 0 ? void 0 : (_property$annotations21 = _property$annotations20.Measures) === null || _property$annotations21 === void 0 ? void 0 : _property$annotations21.Unit) !== undefined;
  };

  /**
   * Checks whether the property type has Edm.Guid.
   *
   * @param property The property to be checked
   * @returns `true` if it is a Guid
   */
  _exports.hasUnit = hasUnit;
  const isGuid = function (property) {
    return property.type === "Edm.Guid";
  };
  _exports.isGuid = isGuid;
  const hasStaticPercentUnit = function (oProperty) {
    var _oProperty$annotation53, _oProperty$annotation54, _oProperty$annotation55;
    return (oProperty === null || oProperty === void 0 ? void 0 : (_oProperty$annotation53 = oProperty.annotations) === null || _oProperty$annotation53 === void 0 ? void 0 : (_oProperty$annotation54 = _oProperty$annotation53.Measures) === null || _oProperty$annotation54 === void 0 ? void 0 : (_oProperty$annotation55 = _oProperty$annotation54.Unit) === null || _oProperty$annotation55 === void 0 ? void 0 : _oProperty$annotation55.toString()) === "%";
  };
  _exports.hasStaticPercentUnit = hasStaticPercentUnit;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJpc1Byb3BlcnR5IiwicHJvcGVydHkiLCJoYXNPd25Qcm9wZXJ0eSIsIl90eXBlIiwiaXNDb21wdXRlZCIsIm9Qcm9wZXJ0eSIsImFubm90YXRpb25zIiwiQ29yZSIsIkNvbXB1dGVkIiwidmFsdWVPZiIsImlzTmF2aWdhdGlvblByb3BlcnR5IiwiaXNJbW11dGFibGUiLCJJbW11dGFibGUiLCJpc0tleSIsImlzU2VtYW50aWNLZXkiLCJjb250ZXh0RGF0YU1vZGVsT2JqZWN0Iiwic2VtYW50aWNLZXlzIiwiY29udGV4dExvY2F0aW9uIiwidGFyZ2V0RW50aXR5VHlwZSIsIkNvbW1vbiIsIlNlbWFudGljS2V5Iiwic29tZSIsImtleSIsIiR0YXJnZXQiLCJmdWxseVF1YWxpZmllZE5hbWUiLCJoYXNEYXRlVHlwZSIsImluZGV4T2YiLCJ0eXBlIiwiZ2V0TGFiZWwiLCJMYWJlbCIsInRvU3RyaW5nIiwiaGFzU2VtYW50aWNPYmplY3QiLCJTZW1hbnRpY09iamVjdEhlbHBlciIsImlzUGF0aEV4cHJlc3Npb24iLCJleHByZXNzaW9uIiwidW5kZWZpbmVkIiwiaXNQcm9wZXJ0eVBhdGhFeHByZXNzaW9uIiwiaXNBbm5vdGF0aW9uUGF0aEV4cHJlc3Npb24iLCJnZXRBc3NvY2lhdGVkVGltZXpvbmVQcm9wZXJ0eSIsIlRpbWV6b25lIiwiZ2V0QXNzb2NpYXRlZFRpbWV6b25lUHJvcGVydHlQYXRoIiwicGF0aCIsImdldEFzc29jaWF0ZWRUZXh0UHJvcGVydHkiLCJUZXh0IiwiZ2V0QXNzb2NpYXRlZFVuaXRQcm9wZXJ0eSIsIk1lYXN1cmVzIiwiVW5pdCIsImdldEFzc29jaWF0ZWRVbml0UHJvcGVydHlQYXRoIiwiZ2V0QXNzb2NpYXRlZEN1cnJlbmN5UHJvcGVydHkiLCJJU09DdXJyZW5jeSIsImdldEFzc29jaWF0ZWRDdXJyZW5jeVByb3BlcnR5UGF0aCIsImdldEFzc29jaWF0ZWRUZXh0UHJvcGVydHlQYXRoIiwiaGFzVmFsdWVIZWxwIiwiVmFsdWVMaXN0IiwiVmFsdWVMaXN0UmVmZXJlbmNlcyIsIlZhbHVlTGlzdFdpdGhGaXhlZFZhbHVlcyIsIlZhbHVlTGlzdE1hcHBpbmciLCJoYXNWYWx1ZUhlbHBXaXRoRml4ZWRWYWx1ZXMiLCJoYXNWYWx1ZUxpc3RGb3JWYWxpZGF0aW9uIiwiVmFsdWVMaXN0Rm9yVmFsaWRhdGlvbiIsImhhc1RpbWV6b25lIiwiaXNVbml0IiwiSXNVbml0IiwiaGFzVGV4dCIsImlzSW1hZ2VVUkwiLCJVSSIsIklzSW1hZ2VVUkwiLCJpc0N1cnJlbmN5IiwiSXNDdXJyZW5jeSIsImhhc0N1cnJlbmN5IiwiaGFzVW5pdCIsImlzR3VpZCIsImhhc1N0YXRpY1BlcmNlbnRVbml0Il0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJQcm9wZXJ0eUhlbHBlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IE5hdmlnYXRpb25Qcm9wZXJ0eSwgUGF0aEFubm90YXRpb25FeHByZXNzaW9uLCBQcm9wZXJ0eSB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlc1wiO1xuaW1wb3J0IHR5cGUgeyBEYXRhTW9kZWxPYmplY3RQYXRoIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRGF0YU1vZGVsUGF0aEhlbHBlclwiO1xuaW1wb3J0ICogYXMgU2VtYW50aWNPYmplY3RIZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvU2VtYW50aWNPYmplY3RIZWxwZXJcIjtcblxuLyoqXG4gKiBJZGVudGlmeSBpZiB0aGUgZ2l2ZW4gcHJvcGVydHkgcGFzc2VkIGlzIGEgXCJQcm9wZXJ0eVwiIChoYXMgYSBfdHlwZSkuXG4gKlxuICogQHBhcmFtIHByb3BlcnR5IEEgdGFyZ2V0IHByb3BlcnR5IHRvIGV2YWx1YXRlXG4gKiBAcmV0dXJucyBWYWxpZGF0ZSB0aGF0IHByb3BlcnR5IGlzIGEgUHJvcGVydHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzUHJvcGVydHkocHJvcGVydHk6IGFueSk6IHByb3BlcnR5IGlzIFByb3BlcnR5IHtcblx0cmV0dXJuIHByb3BlcnR5ICYmIChwcm9wZXJ0eSBhcyBQcm9wZXJ0eSkuaGFzT3duUHJvcGVydHkoXCJfdHlwZVwiKSAmJiAocHJvcGVydHkgYXMgUHJvcGVydHkpLl90eXBlID09PSBcIlByb3BlcnR5XCI7XG59XG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciB0aGUgcHJvcGVydHkgaGFzIHRoZSBDb3JlLkNvbXB1dGVkIGFubm90YXRpb24gb3Igbm90LlxuICpcbiAqIEBwYXJhbSBvUHJvcGVydHkgVGhlIHRhcmdldCBwcm9wZXJ0eVxuICogQHJldHVybnMgYHRydWVgIGlmIHRoZSBwcm9wZXJ0eSBpcyBjb21wdXRlZFxuICovXG5leHBvcnQgY29uc3QgaXNDb21wdXRlZCA9IGZ1bmN0aW9uIChvUHJvcGVydHk6IFByb3BlcnR5KTogYm9vbGVhbiB7XG5cdHJldHVybiAhIW9Qcm9wZXJ0eS5hbm5vdGF0aW9ucz8uQ29yZT8uQ29tcHV0ZWQ/LnZhbHVlT2YoKTtcbn07XG5cbi8qKlxuICogSWRlbnRpZnkgaWYgdGhlIGdpdmVuIHByb3BlcnR5IHBhc3NlZCBpcyBhIFwiTmF2aWdhdGlvblByb3BlcnR5XCIuXG4gKlxuICogQHBhcmFtIHByb3BlcnR5IEEgdGFyZ2V0IHByb3BlcnR5IHRvIGV2YWx1YXRlXG4gKiBAcmV0dXJucyBWYWxpZGF0ZSB0aGF0IHByb3BlcnR5IGlzIGEgTmF2aWdhdGlvblByb3BlcnR5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc05hdmlnYXRpb25Qcm9wZXJ0eShwcm9wZXJ0eTogYW55KTogcHJvcGVydHkgaXMgTmF2aWdhdGlvblByb3BlcnR5IHtcblx0cmV0dXJuIChcblx0XHRwcm9wZXJ0eSAmJlxuXHRcdChwcm9wZXJ0eSBhcyBOYXZpZ2F0aW9uUHJvcGVydHkpLmhhc093blByb3BlcnR5KFwiX3R5cGVcIikgJiZcblx0XHQocHJvcGVydHkgYXMgTmF2aWdhdGlvblByb3BlcnR5KS5fdHlwZSA9PT0gXCJOYXZpZ2F0aW9uUHJvcGVydHlcIlxuXHQpO1xufVxuXG4vKipcbiAqIENoZWNrIHdoZXRoZXIgdGhlIHByb3BlcnR5IGhhcyB0aGUgQ29yZS5JbW11dGFibGUgYW5ub3RhdGlvbiBvciBub3QuXG4gKlxuICogQHBhcmFtIG9Qcm9wZXJ0eSBUaGUgdGFyZ2V0IHByb3BlcnR5XG4gKiBAcmV0dXJucyBgdHJ1ZWAgaWYgaXQncyBpbW11dGFibGVcbiAqL1xuZXhwb3J0IGNvbnN0IGlzSW1tdXRhYmxlID0gZnVuY3Rpb24gKG9Qcm9wZXJ0eTogUHJvcGVydHkpOiBib29sZWFuIHtcblx0cmV0dXJuICEhb1Byb3BlcnR5LmFubm90YXRpb25zPy5Db3JlPy5JbW11dGFibGU/LnZhbHVlT2YoKTtcbn07XG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciB0aGUgcHJvcGVydHkgaXMgYSBrZXkgb3Igbm90LlxuICpcbiAqIEBwYXJhbSBvUHJvcGVydHkgVGhlIHRhcmdldCBwcm9wZXJ0eVxuICogQHJldHVybnMgYHRydWVgIGlmIGl0J3MgYSBrZXlcbiAqL1xuZXhwb3J0IGNvbnN0IGlzS2V5ID0gZnVuY3Rpb24gKG9Qcm9wZXJ0eTogUHJvcGVydHkpOiBib29sZWFuIHtcblx0cmV0dXJuICEhb1Byb3BlcnR5LmlzS2V5O1xufTtcblxuLyoqXG4gKiBDaGVjayB3aGV0aGVyIHRoZSBwcm9wZXJ0eSBpcyBhIHNlbWFudGljS2V5IGZvciB0aGUgY29udGV4dCBlbnRpdHkuXG4gKlxuICogQHBhcmFtIHByb3BlcnR5XG4gKiBAcGFyYW0gY29udGV4dERhdGFNb2RlbE9iamVjdCBUaGUgRGF0YU1vZGVsT2JqZWN0IHRoYXQgaG9sZHMgdGhlIGNvbnRleHRcbiAqIEByZXR1cm5zIGB0cnVlYGlmIGl0J3MgYSBzZW1hbnRpYyBrZXlcbiAqL1xuZXhwb3J0IGNvbnN0IGlzU2VtYW50aWNLZXkgPSBmdW5jdGlvbiAocHJvcGVydHk6IFByb3BlcnR5LCBjb250ZXh0RGF0YU1vZGVsT2JqZWN0OiBEYXRhTW9kZWxPYmplY3RQYXRoKSB7XG5cdGNvbnN0IHNlbWFudGljS2V5cyA9IGNvbnRleHREYXRhTW9kZWxPYmplY3QuY29udGV4dExvY2F0aW9uPy50YXJnZXRFbnRpdHlUeXBlPy5hbm5vdGF0aW9ucz8uQ29tbW9uPy5TZW1hbnRpY0tleTtcblx0cmV0dXJuIChcblx0XHRzZW1hbnRpY0tleXM/LnNvbWUoZnVuY3Rpb24gKGtleSkge1xuXHRcdFx0cmV0dXJuIGtleT8uJHRhcmdldD8uZnVsbHlRdWFsaWZpZWROYW1lID09PSBwcm9wZXJ0eS5mdWxseVF1YWxpZmllZE5hbWU7XG5cdFx0fSkgPz8gZmFsc2Vcblx0KTtcbn07XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgdGhlIHByb3BlcnR5IGhhcyBhIGRhdGUgdGltZSBvciBub3QuXG4gKlxuICogQHBhcmFtIG9Qcm9wZXJ0eVxuICogQHJldHVybnMgYHRydWVgIGlmIGl0IGlzIG9mIHR5cGUgZGF0ZSAvIGRhdGV0aW1lIC8gZGF0ZXRpbWVvZmZzZXRcbiAqL1xuZXhwb3J0IGNvbnN0IGhhc0RhdGVUeXBlID0gZnVuY3Rpb24gKG9Qcm9wZXJ0eTogUHJvcGVydHkpOiBib29sZWFuIHtcblx0cmV0dXJuIFtcIkVkbS5EYXRlXCIsIFwiRWRtLkRhdGVUaW1lXCIsIFwiRWRtLkRhdGVUaW1lT2Zmc2V0XCJdLmluZGV4T2Yob1Byb3BlcnR5LnR5cGUpICE9PSAtMTtcbn07XG5cbi8qKlxuICogUmV0cmlldmUgdGhlIGxhYmVsIGFubm90YXRpb24uXG4gKlxuICogQHBhcmFtIG9Qcm9wZXJ0eSBUaGUgdGFyZ2V0IHByb3BlcnR5XG4gKiBAcmV0dXJucyBUaGUgbGFiZWwgc3RyaW5nXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRMYWJlbCA9IGZ1bmN0aW9uIChvUHJvcGVydHk6IFByb3BlcnR5KTogc3RyaW5nIHtcblx0cmV0dXJuIG9Qcm9wZXJ0eS5hbm5vdGF0aW9ucz8uQ29tbW9uPy5MYWJlbD8udG9TdHJpbmcoKSB8fCBcIlwiO1xufTtcblxuLyoqXG4gKiBDaGVjayB3aGV0aGVyIHRoZSBwcm9wZXJ0eSBoYXMgYSBzZW1hbnRpYyBvYmplY3QgZGVmaW5lZCBvciBub3QuXG4gKlxuICogQHBhcmFtIHByb3BlcnR5IFRoZSB0YXJnZXQgcHJvcGVydHlcbiAqIEByZXR1cm5zIGB0cnVlYCBpZiBpdCBoYXMgYSBzZW1hbnRpYyBvYmplY3RcbiAqL1xuZXhwb3J0IGNvbnN0IGhhc1NlbWFudGljT2JqZWN0ID0gZnVuY3Rpb24gKHByb3BlcnR5OiBQcm9wZXJ0eSk6IGJvb2xlYW4ge1xuXHRyZXR1cm4gU2VtYW50aWNPYmplY3RIZWxwZXIuaGFzU2VtYW50aWNPYmplY3QocHJvcGVydHkpO1xufTtcblxuZXhwb3J0IGNvbnN0IGlzUGF0aEV4cHJlc3Npb24gPSBmdW5jdGlvbiA8VD4oZXhwcmVzc2lvbjogYW55KTogZXhwcmVzc2lvbiBpcyBQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb248VD4ge1xuXHRyZXR1cm4gISFleHByZXNzaW9uICYmIGV4cHJlc3Npb24udHlwZSAhPT0gdW5kZWZpbmVkICYmIGV4cHJlc3Npb24udHlwZSA9PT0gXCJQYXRoXCI7XG59O1xuZXhwb3J0IGNvbnN0IGlzUHJvcGVydHlQYXRoRXhwcmVzc2lvbiA9IGZ1bmN0aW9uIDxUPihleHByZXNzaW9uOiBhbnkpOiBleHByZXNzaW9uIGlzIFBhdGhBbm5vdGF0aW9uRXhwcmVzc2lvbjxUPiB7XG5cdHJldHVybiAhIWV4cHJlc3Npb24gJiYgZXhwcmVzc2lvbi50eXBlICE9PSB1bmRlZmluZWQgJiYgZXhwcmVzc2lvbi50eXBlID09PSBcIlByb3BlcnR5UGF0aFwiO1xufTtcbmV4cG9ydCBjb25zdCBpc0Fubm90YXRpb25QYXRoRXhwcmVzc2lvbiA9IGZ1bmN0aW9uIDxUPihleHByZXNzaW9uOiBhbnkpOiBleHByZXNzaW9uIGlzIFBhdGhBbm5vdGF0aW9uRXhwcmVzc2lvbjxUPiB7XG5cdHJldHVybiAhIWV4cHJlc3Npb24gJiYgZXhwcmVzc2lvbi50eXBlICE9PSB1bmRlZmluZWQgJiYgZXhwcmVzc2lvbi50eXBlID09PSBcIkFubm90YXRpb25QYXRoXCI7XG59O1xuXG4vKipcbiAqIFJldHJpZXZlcyB0aGUgdGltZXpvbmUgcHJvcGVydHkgYXNzb2NpYXRlZCB0byB0aGUgcHJvcGVydHksIGlmIGFwcGxpY2FibGUuXG4gKlxuICogQHBhcmFtIG9Qcm9wZXJ0eSBUaGUgdGFyZ2V0IHByb3BlcnR5XG4gKiBAcmV0dXJucyBUaGUgdGltZXpvbmUgcHJvcGVydHksIGlmIGl0IGV4aXN0c1xuICovXG5leHBvcnQgY29uc3QgZ2V0QXNzb2NpYXRlZFRpbWV6b25lUHJvcGVydHkgPSBmdW5jdGlvbiAob1Byb3BlcnR5OiBQcm9wZXJ0eSk6IFByb3BlcnR5IHwgdW5kZWZpbmVkIHtcblx0cmV0dXJuIGlzUGF0aEV4cHJlc3Npb24ob1Byb3BlcnR5Py5hbm5vdGF0aW9ucz8uQ29tbW9uPy5UaW1lem9uZSlcblx0XHQ/IChvUHJvcGVydHkuYW5ub3RhdGlvbnM/LkNvbW1vbj8uVGltZXpvbmUuJHRhcmdldCBhcyB1bmtub3duIGFzIFByb3BlcnR5KVxuXHRcdDogdW5kZWZpbmVkO1xufTtcblxuLyoqXG4gKiBSZXRyaWV2ZXMgdGhlIHRpbWV6b25lIHByb3BlcnR5IHBhdGggYXNzb2NpYXRlZCB0byB0aGUgcHJvcGVydHksIGlmIGFwcGxpY2FibGUuXG4gKlxuICogQHBhcmFtIG9Qcm9wZXJ0eSBUaGUgdGFyZ2V0IHByb3BlcnR5XG4gKiBAcmV0dXJucyBUaGUgdGltZXpvbmUgcHJvcGVydHkgcGF0aCwgaWYgaXQgZXhpc3RzXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRBc3NvY2lhdGVkVGltZXpvbmVQcm9wZXJ0eVBhdGggPSBmdW5jdGlvbiAob1Byb3BlcnR5OiBQcm9wZXJ0eSk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG5cdHJldHVybiBpc1BhdGhFeHByZXNzaW9uKG9Qcm9wZXJ0eT8uYW5ub3RhdGlvbnM/LkNvbW1vbj8uVGltZXpvbmUpID8gb1Byb3BlcnR5Py5hbm5vdGF0aW9ucz8uQ29tbW9uPy5UaW1lem9uZT8ucGF0aCA6IHVuZGVmaW5lZDtcbn07XG5cbi8qKlxuICogUmV0cmlldmVzIHRoZSBhc3NvY2lhdGVkIHRleHQgcHJvcGVydHkgZm9yIHRoYXQgcHJvcGVydHksIGlmIGl0IGV4aXN0cy5cbiAqXG4gKiBAcGFyYW0gb1Byb3BlcnR5IFRoZSB0YXJnZXQgcHJvcGVydHlcbiAqIEByZXR1cm5zIFRoZSB0ZXh0IHByb3BlcnR5LCBpZiBpdCBleGlzdHNcbiAqL1xuZXhwb3J0IGNvbnN0IGdldEFzc29jaWF0ZWRUZXh0UHJvcGVydHkgPSBmdW5jdGlvbiAob1Byb3BlcnR5OiBQcm9wZXJ0eSk6IFByb3BlcnR5IHwgdW5kZWZpbmVkIHtcblx0cmV0dXJuIGlzUGF0aEV4cHJlc3Npb24ob1Byb3BlcnR5Py5hbm5vdGF0aW9ucz8uQ29tbW9uPy5UZXh0KVxuXHRcdD8gKG9Qcm9wZXJ0eS5hbm5vdGF0aW9ucz8uQ29tbW9uPy5UZXh0LiR0YXJnZXQgYXMgdW5rbm93biBhcyBQcm9wZXJ0eSlcblx0XHQ6IHVuZGVmaW5lZDtcbn07XG5cbi8qKlxuICogUmV0cmlldmVzIHRoZSB1bml0IHByb3BlcnR5IGFzc29jaWF0ZWQgdG8gdGhlIHByb3BlcnR5LCBpZiBhcHBsaWNhYmxlLlxuICpcbiAqIEBwYXJhbSBvUHJvcGVydHkgVGhlIHRhcmdldCBwcm9wZXJ0eVxuICogQHJldHVybnMgVGhlIHVuaXQgcHJvcGVydHksIGlmIGl0IGV4aXN0c1xuICovXG5leHBvcnQgY29uc3QgZ2V0QXNzb2NpYXRlZFVuaXRQcm9wZXJ0eSA9IGZ1bmN0aW9uIChvUHJvcGVydHk6IFByb3BlcnR5KTogUHJvcGVydHkgfCB1bmRlZmluZWQge1xuXHRyZXR1cm4gaXNQYXRoRXhwcmVzc2lvbihvUHJvcGVydHk/LmFubm90YXRpb25zPy5NZWFzdXJlcz8uVW5pdClcblx0XHQ/IChvUHJvcGVydHkuYW5ub3RhdGlvbnM/Lk1lYXN1cmVzPy5Vbml0LiR0YXJnZXQgYXMgdW5rbm93biBhcyBQcm9wZXJ0eSlcblx0XHQ6IHVuZGVmaW5lZDtcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRBc3NvY2lhdGVkVW5pdFByb3BlcnR5UGF0aCA9IGZ1bmN0aW9uIChvUHJvcGVydHk6IFByb3BlcnR5KTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0cmV0dXJuIGlzUGF0aEV4cHJlc3Npb24ob1Byb3BlcnR5Py5hbm5vdGF0aW9ucz8uTWVhc3VyZXM/LlVuaXQpID8gb1Byb3BlcnR5LmFubm90YXRpb25zPy5NZWFzdXJlcz8uVW5pdC5wYXRoIDogdW5kZWZpbmVkO1xufTtcblxuLyoqXG4gKiBSZXRyaWV2ZXMgdGhlIGFzc29jaWF0ZWQgY3VycmVuY3kgcHJvcGVydHkgZm9yIHRoYXQgcHJvcGVydHkgaWYgaXQgZXhpc3RzLlxuICpcbiAqIEBwYXJhbSBvUHJvcGVydHkgVGhlIHRhcmdldCBwcm9wZXJ0eVxuICogQHJldHVybnMgVGhlIHVuaXQgcHJvcGVydHksIGlmIGl0IGV4aXN0c1xuICovXG5leHBvcnQgY29uc3QgZ2V0QXNzb2NpYXRlZEN1cnJlbmN5UHJvcGVydHkgPSBmdW5jdGlvbiAob1Byb3BlcnR5OiBQcm9wZXJ0eSk6IFByb3BlcnR5IHwgdW5kZWZpbmVkIHtcblx0cmV0dXJuIGlzUGF0aEV4cHJlc3Npb24ob1Byb3BlcnR5Py5hbm5vdGF0aW9ucz8uTWVhc3VyZXM/LklTT0N1cnJlbmN5KVxuXHRcdD8gKG9Qcm9wZXJ0eS5hbm5vdGF0aW9ucz8uTWVhc3VyZXM/LklTT0N1cnJlbmN5LiR0YXJnZXQgYXMgdW5rbm93biBhcyBQcm9wZXJ0eSlcblx0XHQ6IHVuZGVmaW5lZDtcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRBc3NvY2lhdGVkQ3VycmVuY3lQcm9wZXJ0eVBhdGggPSBmdW5jdGlvbiAob1Byb3BlcnR5OiBQcm9wZXJ0eSk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG5cdHJldHVybiBpc1BhdGhFeHByZXNzaW9uKG9Qcm9wZXJ0eT8uYW5ub3RhdGlvbnM/Lk1lYXN1cmVzPy5JU09DdXJyZW5jeSkgPyBvUHJvcGVydHkuYW5ub3RhdGlvbnM/Lk1lYXN1cmVzPy5JU09DdXJyZW5jeS5wYXRoIDogdW5kZWZpbmVkO1xufTtcblxuLyoqXG4gKiBSZXRyaWV2ZXMgdGhlIENvbW1vbi5UZXh0IHByb3BlcnR5IHBhdGggaWYgaXQgZXhpc3RzLlxuICpcbiAqIEBwYXJhbSBvUHJvcGVydHkgVGhlIHRhcmdldCBwcm9wZXJ0eVxuICogQHJldHVybnMgVGhlIENvbW1vbi5UZXh0IHByb3BlcnR5IHBhdGggb3IgdW5kZWZpbmVkIGlmIGl0IGRvZXMgbm90IGV4aXN0XG4gKi9cbmV4cG9ydCBjb25zdCBnZXRBc3NvY2lhdGVkVGV4dFByb3BlcnR5UGF0aCA9IGZ1bmN0aW9uIChvUHJvcGVydHk6IFByb3BlcnR5KTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0cmV0dXJuIGlzUGF0aEV4cHJlc3Npb24ob1Byb3BlcnR5LmFubm90YXRpb25zPy5Db21tb24/LlRleHQpID8gb1Byb3BlcnR5LmFubm90YXRpb25zPy5Db21tb24/LlRleHQucGF0aCA6IHVuZGVmaW5lZDtcbn07XG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciB0aGUgcHJvcGVydHkgaGFzIGEgdmFsdWUgaGVscCBhbm5vdGF0aW9uIGRlZmluZWQgb3Igbm90LlxuICpcbiAqIEBwYXJhbSBwcm9wZXJ0eSBUaGUgdGFyZ2V0IHByb3BlcnR5IHRvIGJlIGNoZWNrZWRcbiAqIEByZXR1cm5zIGB0cnVlYCBpZiBpdCBoYXMgYSB2YWx1ZSBoZWxwXG4gKi9cbmV4cG9ydCBjb25zdCBoYXNWYWx1ZUhlbHAgPSBmdW5jdGlvbiAocHJvcGVydHk6IFByb3BlcnR5KTogYm9vbGVhbiB7XG5cdHJldHVybiAoXG5cdFx0ISFwcm9wZXJ0eS5hbm5vdGF0aW9ucz8uQ29tbW9uPy5WYWx1ZUxpc3QgfHxcblx0XHQhIXByb3BlcnR5LmFubm90YXRpb25zPy5Db21tb24/LlZhbHVlTGlzdFJlZmVyZW5jZXMgfHxcblx0XHQhIXByb3BlcnR5LmFubm90YXRpb25zPy5Db21tb24/LlZhbHVlTGlzdFdpdGhGaXhlZFZhbHVlcyB8fFxuXHRcdCEhcHJvcGVydHkuYW5ub3RhdGlvbnM/LkNvbW1vbj8uVmFsdWVMaXN0TWFwcGluZ1xuXHQpO1xufTtcblxuLyoqXG4gKiBDaGVjayB3aGV0aGVyIHRoZSBwcm9wZXJ0eSBoYXMgYSB2YWx1ZSBoZWxwIHdpdGggZml4ZWQgdmFsdWUgYW5ub3RhdGlvbiBkZWZpbmVkIG9yIG5vdC5cbiAqXG4gKiBAcGFyYW0gb1Byb3BlcnR5IFRoZSB0YXJnZXQgcHJvcGVydHlcbiAqIEByZXR1cm5zIGB0cnVlYCBpZiBpdCBoYXMgYSB2YWx1ZSBoZWxwXG4gKi9cbmV4cG9ydCBjb25zdCBoYXNWYWx1ZUhlbHBXaXRoRml4ZWRWYWx1ZXMgPSBmdW5jdGlvbiAob1Byb3BlcnR5OiBQcm9wZXJ0eSk6IGJvb2xlYW4ge1xuXHRyZXR1cm4gISFvUHJvcGVydHk/LmFubm90YXRpb25zPy5Db21tb24/LlZhbHVlTGlzdFdpdGhGaXhlZFZhbHVlcz8udmFsdWVPZigpO1xufTtcblxuLyoqXG4gKiBDaGVjayB3aGV0aGVyIHRoZSBwcm9wZXJ0eSBoYXMgYSB2YWx1ZSBoZWxwIGZvciB2YWxpZGF0aW9uIGFubm90YXRpb24gZGVmaW5lZCBvciBub3QuXG4gKlxuICogQHBhcmFtIG9Qcm9wZXJ0eSBUaGUgdGFyZ2V0IHByb3BlcnR5XG4gKiBAcmV0dXJucyBgdHJ1ZWAgaWYgaXQgaGFzIGEgdmFsdWUgaGVscFxuICovXG5leHBvcnQgY29uc3QgaGFzVmFsdWVMaXN0Rm9yVmFsaWRhdGlvbiA9IGZ1bmN0aW9uIChvUHJvcGVydHk6IFByb3BlcnR5KTogYm9vbGVhbiB7XG5cdHJldHVybiBvUHJvcGVydHkuYW5ub3RhdGlvbnM/LkNvbW1vbj8uVmFsdWVMaXN0Rm9yVmFsaWRhdGlvbiAhPT0gdW5kZWZpbmVkO1xufTtcblxuZXhwb3J0IGNvbnN0IGhhc1RpbWV6b25lID0gZnVuY3Rpb24gKG9Qcm9wZXJ0eTogUHJvcGVydHkpOiBib29sZWFuIHtcblx0cmV0dXJuIG9Qcm9wZXJ0eS5hbm5vdGF0aW9ucz8uQ29tbW9uPy5UaW1lem9uZSAhPT0gdW5kZWZpbmVkO1xufTtcbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgdGhlIHByb3BlcnR5IGlzIGEgdW5pdCBwcm9wZXJ0eS5cbiAqXG4gKiBAcGFyYW0gcHJvcGVydHkgVGhlIHByb3BlcnR5IHRvIGJlIGNoZWNrZWRcbiAqIEByZXR1cm5zIGB0cnVlYCBpZiBpdCBpcyBhIHVuaXRcbiAqL1xuZXhwb3J0IGNvbnN0IGlzVW5pdCA9IGZ1bmN0aW9uIChwcm9wZXJ0eTogUHJvcGVydHkpOiBib29sZWFuIHtcblx0cmV0dXJuICEhcHJvcGVydHkuYW5ub3RhdGlvbnM/LkNvbW1vbj8uSXNVbml0Py52YWx1ZU9mKCk7XG59O1xuXG4vKipcbiAqIENoZWNrcyB3aGV0aGVyIHRoZSBwcm9wZXJ0eSBoYXMgYSB0ZXh0IHByb3BlcnR5LlxuICpcbiAqIEBwYXJhbSBwcm9wZXJ0eSBUaGUgcHJvcGVydHkgdG8gYmUgY2hlY2tlZFxuICogQHJldHVybnMgYHRydWVgIGlmIGl0IGlzIGEgVGV4dFxuICovXG5leHBvcnQgY29uc3QgaGFzVGV4dCA9IGZ1bmN0aW9uIChwcm9wZXJ0eTogUHJvcGVydHkpOiBib29sZWFuIHtcblx0cmV0dXJuICEhcHJvcGVydHkuYW5ub3RhdGlvbnM/LkNvbW1vbj8uVGV4dD8udmFsdWVPZigpO1xufTtcblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciB0aGUgcHJvcGVydHkgaGFzIGFuIEltYWdlVVJMLlxuICpcbiAqIEBwYXJhbSBwcm9wZXJ0eSBUaGUgcHJvcGVydHkgdG8gYmUgY2hlY2tlZFxuICogQHJldHVybnMgYHRydWVgIGlmIGl0IGlzIGFuIEltYWdlVVJMXG4gKi9cbmV4cG9ydCBjb25zdCBpc0ltYWdlVVJMID0gZnVuY3Rpb24gKHByb3BlcnR5OiBQcm9wZXJ0eSk6IGJvb2xlYW4ge1xuXHRyZXR1cm4gISFwcm9wZXJ0eS5hbm5vdGF0aW9ucz8uVUk/LklzSW1hZ2VVUkw/LnZhbHVlT2YoKTtcbn07XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgdGhlIHByb3BlcnR5IGlzIGEgY3VycmVuY3kgcHJvcGVydHkuXG4gKlxuICogQHBhcmFtIG9Qcm9wZXJ0eSBUaGUgcHJvcGVydHkgdG8gYmUgY2hlY2tlZFxuICogQHJldHVybnMgYHRydWVgIGlmIGl0IGlzIGEgY3VycmVuY3lcbiAqL1xuZXhwb3J0IGNvbnN0IGlzQ3VycmVuY3kgPSBmdW5jdGlvbiAob1Byb3BlcnR5OiBQcm9wZXJ0eSk6IGJvb2xlYW4ge1xuXHRyZXR1cm4gISFvUHJvcGVydHkuYW5ub3RhdGlvbnM/LkNvbW1vbj8uSXNDdXJyZW5jeT8udmFsdWVPZigpO1xufTtcblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciB0aGUgcHJvcGVydHkgaGFzIGEgY3VycmVuY3kgcHJvcGVydHkuXG4gKlxuICogQHBhcmFtIHByb3BlcnR5IFRoZSBwcm9wZXJ0eSB0byBiZSBjaGVja2VkXG4gKiBAcmV0dXJucyBgdHJ1ZWAgaWYgaXQgaGFzIGEgY3VycmVuY3lcbiAqL1xuZXhwb3J0IGNvbnN0IGhhc0N1cnJlbmN5ID0gZnVuY3Rpb24gKHByb3BlcnR5OiBQcm9wZXJ0eSk6IGJvb2xlYW4ge1xuXHRyZXR1cm4gcHJvcGVydHkuYW5ub3RhdGlvbnM/Lk1lYXN1cmVzPy5JU09DdXJyZW5jeSAhPT0gdW5kZWZpbmVkO1xufTtcblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciB0aGUgcHJvcGVydHkgaGFzIGEgdW5pdCBwcm9wZXJ0eS5cbiAqXG4gKiBAcGFyYW0gcHJvcGVydHkgVGhlIHByb3BlcnR5IHRvIGJlIGNoZWNrZWRcbiAqIEByZXR1cm5zIGB0cnVlYCBpZiBpdCBoYXMgYSB1bml0XG4gKi9cblxuZXhwb3J0IGNvbnN0IGhhc1VuaXQgPSBmdW5jdGlvbiAocHJvcGVydHk6IFByb3BlcnR5KTogYm9vbGVhbiB7XG5cdHJldHVybiBwcm9wZXJ0eS5hbm5vdGF0aW9ucz8uTWVhc3VyZXM/LlVuaXQgIT09IHVuZGVmaW5lZDtcbn07XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgdGhlIHByb3BlcnR5IHR5cGUgaGFzIEVkbS5HdWlkLlxuICpcbiAqIEBwYXJhbSBwcm9wZXJ0eSBUaGUgcHJvcGVydHkgdG8gYmUgY2hlY2tlZFxuICogQHJldHVybnMgYHRydWVgIGlmIGl0IGlzIGEgR3VpZFxuICovXG5leHBvcnQgY29uc3QgaXNHdWlkID0gZnVuY3Rpb24gKHByb3BlcnR5OiBQcm9wZXJ0eSk6IGJvb2xlYW4ge1xuXHRyZXR1cm4gcHJvcGVydHkudHlwZSA9PT0gXCJFZG0uR3VpZFwiO1xufTtcblxuZXhwb3J0IGNvbnN0IGhhc1N0YXRpY1BlcmNlbnRVbml0ID0gZnVuY3Rpb24gKG9Qcm9wZXJ0eTogUHJvcGVydHkpOiBib29sZWFuIHtcblx0cmV0dXJuIG9Qcm9wZXJ0eT8uYW5ub3RhdGlvbnM/Lk1lYXN1cmVzPy5Vbml0Py50b1N0cmluZygpID09PSBcIiVcIjtcbn07XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7O0VBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ08sU0FBU0EsVUFBVSxDQUFDQyxRQUFhLEVBQXdCO0lBQy9ELE9BQU9BLFFBQVEsSUFBS0EsUUFBUSxDQUFjQyxjQUFjLENBQUMsT0FBTyxDQUFDLElBQUtELFFBQVEsQ0FBY0UsS0FBSyxLQUFLLFVBQVU7RUFDakg7O0VBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBTEE7RUFNTyxNQUFNQyxVQUFVLEdBQUcsVUFBVUMsU0FBbUIsRUFBVztJQUFBO0lBQ2pFLE9BQU8sQ0FBQywyQkFBQ0EsU0FBUyxDQUFDQyxXQUFXLDRFQUFyQixzQkFBdUJDLElBQUksNkVBQTNCLHVCQUE2QkMsUUFBUSxtREFBckMsdUJBQXVDQyxPQUFPLEVBQUU7RUFDMUQsQ0FBQzs7RUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFMQTtFQU1PLFNBQVNDLG9CQUFvQixDQUFDVCxRQUFhLEVBQWtDO0lBQ25GLE9BQ0NBLFFBQVEsSUFDUEEsUUFBUSxDQUF3QkMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxJQUN2REQsUUFBUSxDQUF3QkUsS0FBSyxLQUFLLG9C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