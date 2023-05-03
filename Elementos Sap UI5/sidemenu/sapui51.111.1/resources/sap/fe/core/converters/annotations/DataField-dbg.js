/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/templating/DisplayModeFormatter", "sap/fe/core/templating/PropertyHelper", "../helpers/DataFieldHelper"], function (DisplayModeFormatter, PropertyHelper, DataFieldHelper) {
  "use strict";

  var _exports = {};
  var isReferencePropertyStaticallyHidden = DataFieldHelper.isReferencePropertyStaticallyHidden;
  var isProperty = PropertyHelper.isProperty;
  var isPathExpression = PropertyHelper.isPathExpression;
  var getAssociatedUnitProperty = PropertyHelper.getAssociatedUnitProperty;
  var getAssociatedTimezoneProperty = PropertyHelper.getAssociatedTimezoneProperty;
  var getAssociatedCurrencyProperty = PropertyHelper.getAssociatedCurrencyProperty;
  var getDisplayMode = DisplayModeFormatter.getDisplayMode;
  /**
   * Identifies if the given dataFieldAbstract that is passed is a "DataFieldForActionAbstract".
   * DataFieldForActionAbstract has an inline action defined.
   *
   * @param dataField DataField to be evaluated
   * @returns Validates that dataField is a DataFieldForActionAbstractType
   */
  function isDataFieldForActionAbstract(dataField) {
    return dataField.hasOwnProperty("Action");
  }

  /**
   * Identifies if the given dataFieldAbstract that is passed is a "DataField".
   * DataField has a value defined.
   *
   * @param dataField DataField to be evaluated
   * @returns Validate that dataField is a DataFieldTypes
   */
  _exports.isDataFieldForActionAbstract = isDataFieldForActionAbstract;
  function isDataFieldTypes(dataField) {
    return dataField.hasOwnProperty("Value");
  }

  /**
   * Retrieves the TargetValue from a DataPoint.
   *
   * @param source the target property or DataPoint
   * @returns The TargetValue as a decimal or a property path
   */
  _exports.isDataFieldTypes = isDataFieldTypes;
  function getTargetValueOnDataPoint(source) {
    let targetValue;
    if (isProperty(source)) {
      var _source$annotations, _source$annotations$U, _source$annotations$U2, _source$annotations$U3, _source$annotations$U4, _source$annotations2, _source$annotations2$, _source$annotations2$2, _source$annotations2$3, _source$annotations2$4;
      targetValue = ((_source$annotations = source.annotations) === null || _source$annotations === void 0 ? void 0 : (_source$annotations$U = _source$annotations.UI) === null || _source$annotations$U === void 0 ? void 0 : (_source$annotations$U2 = _source$annotations$U.DataFieldDefault) === null || _source$annotations$U2 === void 0 ? void 0 : (_source$annotations$U3 = _source$annotations$U2.Target) === null || _source$annotations$U3 === void 0 ? void 0 : (_source$annotations$U4 = _source$annotations$U3.$target) === null || _source$annotations$U4 === void 0 ? void 0 : _source$annotations$U4.TargetValue) ?? ((_source$annotations2 = source.annotations) === null || _source$annotations2 === void 0 ? void 0 : (_source$annotations2$ = _source$annotations2.UI) === null || _source$annotations2$ === void 0 ? void 0 : (_source$annotations2$2 = _source$annotations2$.DataFieldDefault) === null || _source$annotations2$2 === void 0 ? void 0 : (_source$annotations2$3 = _source$annotations2$2.Target) === null || _source$annotations2$3 === void 0 ? void 0 : (_source$annotations2$4 = _source$annotations2$3.$target) === null || _source$annotations2$4 === void 0 ? void 0 : _source$annotations2$4.MaximumValue);
    } else {
      targetValue = source.TargetValue ?? source.MaximumValue;
    }
    if (typeof targetValue === "number") {
      return targetValue.toString();
    }
    return isPathExpression(targetValue) ? targetValue : "100";
  }

  /**
   * Check if a property uses a DataPoint within a DataFieldDefault.
   *
   * @param property The property to be checked
   * @returns `true` if the referenced property has a DataPoint within the DataFieldDefault, false else
   * @private
   */
  _exports.getTargetValueOnDataPoint = getTargetValueOnDataPoint;
  const isDataPointFromDataFieldDefault = function (property) {
    var _property$annotations, _property$annotations2, _property$annotations3, _property$annotations4, _property$annotations5;
    return ((_property$annotations = property.annotations) === null || _property$annotations === void 0 ? void 0 : (_property$annotations2 = _property$annotations.UI) === null || _property$annotations2 === void 0 ? void 0 : (_property$annotations3 = _property$annotations2.DataFieldDefault) === null || _property$annotations3 === void 0 ? void 0 : (_property$annotations4 = _property$annotations3.Target) === null || _property$annotations4 === void 0 ? void 0 : (_property$annotations5 = _property$annotations4.$target) === null || _property$annotations5 === void 0 ? void 0 : _property$annotations5.$Type) === "com.sap.vocabularies.UI.v1.DataPointType";
  };
  _exports.isDataPointFromDataFieldDefault = isDataPointFromDataFieldDefault;
  function getSemanticObjectPath(converterContext, object) {
    if (typeof object === "object") {
      var _object$Value;
      if (isDataFieldTypes(object) && (_object$Value = object.Value) !== null && _object$Value !== void 0 && _object$Value.$target) {
        var _object$Value2, _property$annotations6, _property$annotations7;
        const property = (_object$Value2 = object.Value) === null || _object$Value2 === void 0 ? void 0 : _object$Value2.$target;
        if ((property === null || property === void 0 ? void 0 : (_property$annotations6 = property.annotations) === null || _property$annotations6 === void 0 ? void 0 : (_property$annotations7 = _property$annotations6.Common) === null || _property$annotations7 === void 0 ? void 0 : _property$annotations7.SemanticObject) !== undefined) {
          return converterContext.getEntitySetBasedAnnotationPath(property === null || property === void 0 ? void 0 : property.fullyQualifiedName);
        }
      } else if (isProperty(object)) {
        var _object$annotations, _object$annotations$C;
        if ((object === null || object === void 0 ? void 0 : (_object$annotations = object.annotations) === null || _object$annotations === void 0 ? void 0 : (_object$annotations$C = _object$annotations.Common) === null || _object$annotations$C === void 0 ? void 0 : _object$annotations$C.SemanticObject) !== undefined) {
          return converterContext.getEntitySetBasedAnnotationPath(object === null || object === void 0 ? void 0 : object.fullyQualifiedName);
        }
      }
    }
    return undefined;
  }

  /**
   * Returns the navigation path prefix for a property path.
   *
   * @param path The property path For e.g. /EntityType/Navigation/Property
   * @returns The navigation path prefix For e.g. /EntityType/Navigation/
   */
  _exports.getSemanticObjectPath = getSemanticObjectPath;
  function _getNavigationPathPrefix(path) {
    return path.indexOf("/") > -1 ? path.substring(0, path.lastIndexOf("/") + 1) : "";
  }

  /**
   * Collect additional properties for the ALP table use-case.
   *
   * For e.g. If UI.Hidden points to a property, include this property in the additionalProperties of ComplexPropertyInfo object.
   *
   * @param target Property or DataField being processed
   * @param navigationPathPrefix Navigation path prefix, applicable in case of navigation properties.
   * @param tableType Table type.
   * @param relatedProperties The related properties identified so far.
   * @returns The related properties identified.
   */
  function _collectAdditionalPropertiesForAnalyticalTable(target, navigationPathPrefix, tableType, relatedProperties) {
    if (tableType === "AnalyticalTable") {
      var _target$annotations, _target$annotations$U;
      const hiddenAnnotation = (_target$annotations = target.annotations) === null || _target$annotations === void 0 ? void 0 : (_target$annotations$U = _target$annotations.UI) === null || _target$annotations$U === void 0 ? void 0 : _target$annotations$U.Hidden;
      if (hiddenAnnotation !== null && hiddenAnnotation !== void 0 && hiddenAnnotation.path && isProperty(hiddenAnnotation.$target)) {
        const hiddenAnnotationPropertyPath = navigationPathPrefix + hiddenAnnotation.path;
        // This property should be added to additionalProperties map for the ALP table use-case.
        relatedProperties.additionalProperties[hiddenAnnotationPropertyPath] = hiddenAnnotation.$target;
      }
    }
    return relatedProperties;
  }

  /**
   * Collect related properties from a property's annotations.
   *
   * @param path The property path
   * @param property The property to be considered
   * @param converterContext The converter context
   * @param ignoreSelf Whether to exclude the same property from related properties.
   * @param tableType The table type.
   * @param relatedProperties The related properties identified so far.
   * @param addUnitInTemplate True if the unit/currency property needs to be added in the export template
   * @param isAnnotatedAsHidden True if the DataField or the property are statically hidden
   * @returns The related properties identified.
   */
  function collectRelatedProperties(path, property, converterContext, ignoreSelf, tableType) {
    let relatedProperties = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {
      properties: {},
      additionalProperties: {},
      textOnlyPropertiesFromTextAnnotation: []
    };
    let addUnitInTemplate = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : false;
    let isAnnotatedAsHidden = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : false;
    /**
     * Helper to push unique related properties.
     *
     * @param key The property path
     * @param value The properties object containing value property, description property...
     * @returns Index at which the property is available
     */
    function _pushUnique(key, value) {
      if (!relatedProperties.properties.hasOwnProperty(key)) {
        relatedProperties.properties[key] = value;
      }
      return Object.keys(relatedProperties.properties).indexOf(key);
    }

    /**
     * Helper to append the export settings template with a formatted text.
     *
     * @param value Formatted text
     */
    function _appendTemplate(value) {
      relatedProperties.exportSettingsTemplate = relatedProperties.exportSettingsTemplate ? `${relatedProperties.exportSettingsTemplate}${value}` : `${value}`;
    }
    if (path && property) {
      var _property$annotations8, _property$annotations9;
      let valueIndex;
      let targetValue;
      let currencyOrUoMIndex;
      let timezoneOrUoMIndex;
      let dataPointIndex;
      if (isAnnotatedAsHidden) {
        // Collect underlying property
        valueIndex = _pushUnique(path, property);
        _appendTemplate(`{${valueIndex}}`);
        return relatedProperties;
      }
      const navigationPathPrefix = _getNavigationPathPrefix(path);

      // Check for Text annotation.
      const textAnnotation = (_property$annotations8 = property.annotations) === null || _property$annotations8 === void 0 ? void 0 : (_property$annotations9 = _property$annotations8.Common) === null || _property$annotations9 === void 0 ? void 0 : _property$annotations9.Text;
      if (relatedProperties.exportSettingsTemplate) {
        // FieldGroup use-case. Need to add each Field in new line.
        _appendTemplate("\n");
        relatedProperties.exportSettingsWrapping = true;
      }
      if (textAnnotation !== null && textAnnotation !== void 0 && textAnnotation.path && textAnnotation !== null && textAnnotation !== void 0 && textAnnotation.$target) {
        // Check for Text Arrangement.
        const dataModelObjectPath = converterContext.getDataModelObjectPath();
        const textAnnotationPropertyPath = navigationPathPrefix + textAnnotation.path;
        const displayMode = getDisplayMode(property, dataModelObjectPath);
        let descriptionIndex;
        switch (displayMode) {
          case "Value":
            valueIndex = _pushUnique(path, property);
            _appendTemplate(`{${valueIndex}}`);
            break;
          case "Description":
            descriptionIndex = _pushUnique(textAnnotationPropertyPath, textAnnotation.$target);
            _appendTemplate(`{${descriptionIndex}}`);
            relatedProperties.textOnlyPropertiesFromTextAnnotation.push(textAnnotationPropertyPath);
            break;
          case "ValueDescription":
            valueIndex = _pushUnique(path, property);
            descriptionIndex = _pushUnique(textAnnotationPropertyPath, textAnnotation.$target);
            _appendTemplate(`{${valueIndex}} ({${descriptionIndex}})`);
            break;
          case "DescriptionValue":
            valueIndex = _pushUnique(path, property);
            descriptionIndex = _pushUnique(textAnnotationPropertyPath, textAnnotation.$target);
            _appendTemplate(`{${descriptionIndex}} ({${valueIndex}})`);
            break;
          // no default
        }
      } else {
        var _property$annotations10, _property$annotations11, _property$annotations12, _property$annotations13, _property$annotations14, _property$annotations15, _property$Target, _property$Target$$tar, _property$Target2, _property$Target2$$ta, _property$annotations16, _property$annotations17, _property$annotations18, _property$annotations19, _property$annotations20;
        // Check for field containing Currency Or Unit Properties or Timezone
        const currencyOrUoMProperty = getAssociatedCurrencyProperty(property) || getAssociatedUnitProperty(property);
        const currencyOrUnitAnnotation = (property === null || property === void 0 ? void 0 : (_property$annotations10 = property.annotations) === null || _property$annotations10 === void 0 ? void 0 : (_property$annotations11 = _property$annotations10.Measures) === null || _property$annotations11 === void 0 ? void 0 : _property$annotations11.ISOCurrency) || (property === null || property === void 0 ? void 0 : (_property$annotations12 = property.annotations) === null || _property$annotations12 === void 0 ? void 0 : (_property$annotations13 = _property$annotations12.Measures) === null || _property$annotations13 === void 0 ? void 0 : _property$annotations13.Unit);
        const timezoneProperty = getAssociatedTimezoneProperty(property);
        const timezoneAnnotation = property === null || property === void 0 ? void 0 : (_property$annotations14 = property.annotations) === null || _property$annotations14 === void 0 ? void 0 : (_property$annotations15 = _property$annotations14.Common) === null || _property$annotations15 === void 0 ? void 0 : _property$annotations15.Timezone;
        if (currencyOrUoMProperty && currencyOrUnitAnnotation !== null && currencyOrUnitAnnotation !== void 0 && currencyOrUnitAnnotation.$target) {
          valueIndex = _pushUnique(path, property);
          currencyOrUoMIndex = _pushUnique(navigationPathPrefix + currencyOrUnitAnnotation.path, currencyOrUnitAnnotation.$target);
          if (addUnitInTemplate) {
            _appendTemplate(`{${valueIndex}}  {${currencyOrUoMIndex}}`);
          } else {
            relatedProperties.exportUnitName = navigationPathPrefix + currencyOrUnitAnnotation.path;
          }
        } else if (timezoneProperty && timezoneAnnotation !== null && timezoneAnnotation !== void 0 && timezoneAnnotation.$target) {
          valueIndex = _pushUnique(path, property);
          timezoneOrUoMIndex = _pushUnique(navigationPathPrefix + timezoneAnnotation.path, timezoneAnnotation.$target);
          if (addUnitInTemplate) {
            _appendTemplate(`{${valueIndex}}  {${timezoneOrUoMIndex}}`);
          } else {
            relatedProperties.exportTimezoneName = navigationPathPrefix + timezoneAnnotation.path;
          }
        } else if (((_property$Target = property.Target) === null || _property$Target === void 0 ? void 0 : (_property$Target$$tar = _property$Target.$target) === null || _property$Target$$tar === void 0 ? void 0 : _property$Target$$tar.$Type) === "com.sap.vocabularies.UI.v1.DataPointType" && !((_property$Target2 = property.Target) !== null && _property$Target2 !== void 0 && (_property$Target2$$ta = _property$Target2.$target) !== null && _property$Target2$$ta !== void 0 && _property$Target2$$ta.ValueFormat) || ((_property$annotations16 = property.annotations) === null || _property$annotations16 === void 0 ? void 0 : (_property$annotations17 = _property$annotations16.UI) === null || _property$annotations17 === void 0 ? void 0 : (_property$annotations18 = _property$annotations17.DataFieldDefault) === null || _property$annotations18 === void 0 ? void 0 : (_property$annotations19 = _property$annotations18.Target) === null || _property$annotations19 === void 0 ? void 0 : (_property$annotations20 = _property$annotations19.$target) === null || _property$annotations20 === void 0 ? void 0 : _property$annotations20.$Type) === "com.sap.vocabularies.UI.v1.DataPointType") {
          var _property$Target3, _property$Target3$$ta, _property$Target4, _property$annotations21, _property$annotations22;
          const dataPointProperty = (_property$Target3 = property.Target) === null || _property$Target3 === void 0 ? void 0 : (_property$Target3$$ta = _property$Target3.$target) === null || _property$Target3$$ta === void 0 ? void 0 : _property$Target3$$ta.Value.$target;
          const datapointTarget = (_property$Target4 = property.Target) === null || _property$Target4 === void 0 ? void 0 : _property$Target4.$target;
          // DataPoint use-case using DataFieldDefault.
          const dataPointDefaultProperty = (_property$annotations21 = property.annotations) === null || _property$annotations21 === void 0 ? void 0 : (_property$annotations22 = _property$annotations21.UI) === null || _property$annotations22 === void 0 ? void 0 : _property$annotations22.DataFieldDefault;
          valueIndex = _pushUnique(navigationPathPrefix ? navigationPathPrefix + path : path, dataPointDefaultProperty ? property : dataPointProperty);
          targetValue = getTargetValueOnDataPoint(dataPointDefaultProperty ? property : datapointTarget);
          if (isProperty(targetValue.$target)) {
            //in case it's a dynamic targetValue
            targetValue = targetValue;
            dataPointIndex = _pushUnique(navigationPathPrefix ? navigationPathPrefix + targetValue.$target.name : targetValue.$target.name, targetValue.$target);
            _appendTemplate(`{${valueIndex}}/{${dataPointIndex}}`);
          } else {
            relatedProperties.exportDataPointTargetValue = targetValue;
            _appendTemplate(`{${valueIndex}}/${targetValue}`);
          }
        } else if (property.$Type === "com.sap.vocabularies.Communication.v1.ContactType") {
          var _property$fn, _property$fn2;
          const contactProperty = (_property$fn = property.fn) === null || _property$fn === void 0 ? void 0 : _property$fn.$target;
          const contactPropertyPath = (_property$fn2 = property.fn) === null || _property$fn2 === void 0 ? void 0 : _property$fn2.path;
          valueIndex = _pushUnique(navigationPathPrefix ? navigationPathPrefix + contactPropertyPath : contactPropertyPath, contactProperty);
          _appendTemplate(`{${valueIndex}}`);
        } else if (!ignoreSelf) {
          // Collect underlying property
          valueIndex = _pushUnique(path, property);
          _appendTemplate(`{${valueIndex}}`);
          if (currencyOrUnitAnnotation) {
            relatedProperties.exportUnitString = `${currencyOrUnitAnnotation}`; // Hard-coded currency/unit
          } else if (timezoneAnnotation) {
            relatedProperties.exportTimezoneString = `${timezoneAnnotation}`; // Hard-coded timezone
          }
        }
      }

      relatedProperties = _collectAdditionalPropertiesForAnalyticalTable(property, navigationPathPrefix, tableType, relatedProperties);
      if (Object.keys(relatedProperties.additionalProperties).length > 0 && Object.keys(relatedProperties.properties).length === 0) {
        // Collect underlying property if not collected already.
        // This is to ensure that additionalProperties are made available only to complex property infos.
        valueIndex = _pushUnique(path, property);
        _appendTemplate(`{${valueIndex}}`);
      }
    }
    return relatedProperties;
  }

  /**
   * Collect properties consumed by a DataField.
   * This is for populating the ComplexPropertyInfos of the table delegate.
   *
   * @param dataField The DataField for which the properties need to be identified.
   * @param converterContext The converter context.
   * @param tableType The table type.
   * @param relatedProperties The properties identified so far.
   * @param isEmbedded True if the DataField is embedded in another annotation (e.g. FieldGroup).
   * @returns The properties related to the DataField.
   */
  _exports.collectRelatedProperties = collectRelatedProperties;
  function collectRelatedPropertiesRecursively(dataField, converterContext, tableType) {
    var _dataField$Target, _dataField$Target$$ta, _dataField$Target$$ta2;
    let relatedProperties = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {
      properties: {},
      additionalProperties: {},
      textOnlyPropertiesFromTextAnnotation: []
    };
    let isEmbedded = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
    let isStaticallyHidden = false;
    switch (dataField === null || dataField === void 0 ? void 0 : dataField.$Type) {
      case "com.sap.vocabularies.UI.v1.DataField":
      case "com.sap.vocabularies.UI.v1.DataFieldWithUrl":
      case "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":
      case "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation":
      case "com.sap.vocabularies.UI.v1.DataFieldWithAction":
        if (dataField.Value) {
          var _property$$target, _property$$target$ann, _property$$target$ann2;
          const property = dataField.Value;
          isStaticallyHidden = isReferencePropertyStaticallyHidden((_property$$target = property.$target) === null || _property$$target === void 0 ? void 0 : (_property$$target$ann = _property$$target.annotations) === null || _property$$target$ann === void 0 ? void 0 : (_property$$target$ann2 = _property$$target$ann.UI) === null || _property$$target$ann2 === void 0 ? void 0 : _property$$target$ann2.DataFieldDefault) || isReferencePropertyStaticallyHidden(dataField) || false;
          relatedProperties = collectRelatedProperties(property.path, property.$target, converterContext, false, tableType, relatedProperties, isEmbedded, isStaticallyHidden);
          const navigationPathPrefix = _getNavigationPathPrefix(property.path);
          relatedProperties = _collectAdditionalPropertiesForAnalyticalTable(dataField, navigationPathPrefix, tableType, relatedProperties);
        }
        break;
      case "com.sap.vocabularies.UI.v1.DataFieldForAction":
      case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
        break;
      case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
        switch ((_dataField$Target = dataField.Target) === null || _dataField$Target === void 0 ? void 0 : (_dataField$Target$$ta = _dataField$Target.$target) === null || _dataField$Target$$ta === void 0 ? void 0 : _dataField$Target$$ta.$Type) {
          case "com.sap.vocabularies.UI.v1.FieldGroupType":
            (_dataField$Target$$ta2 = dataField.Target.$target.Data) === null || _dataField$Target$$ta2 === void 0 ? void 0 : _dataField$Target$$ta2.forEach(innerDataField => {
              relatedProperties = collectRelatedPropertiesRecursively(innerDataField, converterContext, tableType, relatedProperties, true);
            });
            break;
          case "com.sap.vocabularies.UI.v1.DataPointType":
            isStaticallyHidden = isReferencePropertyStaticallyHidden(dataField) ?? false;
            relatedProperties = collectRelatedProperties(dataField.Target.$target.Value.path, dataField, converterContext, false, tableType, relatedProperties, isEmbedded, isStaticallyHidden);
            break;
          case "com.sap.vocabularies.Communication.v1.ContactType":
            const dataFieldContact = dataField.Target.$target;
            isStaticallyHidden = isReferencePropertyStaticallyHidden(dataField) ?? false;
            relatedProperties = collectRelatedProperties(dataField.Target.value, dataFieldContact, converterContext, isStaticallyHidden, tableType, relatedProperties, isEmbedded, isStaticallyHidden);
            break;
          default:
            break;
        }
        break;
      default:
        break;
    }
    return relatedProperties;
  }
  _exports.collectRelatedPropertiesRecursively = collectRelatedPropertiesRecursively;
  const getDataFieldDataType = function (oDataField) {
    var _Value, _Value$$target, _Target, _Target$$target;
    let sDataType = oDataField.$Type;
    switch (sDataType) {
      case "com.sap.vocabularies.UI.v1.DataFieldForAction":
      case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
        sDataType = undefined;
        break;
      case "com.sap.vocabularies.UI.v1.DataField":
      case "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":
      case "com.sap.vocabularies.UI.v1.DataFieldWithUrl":
      case "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation":
      case "com.sap.vocabularies.UI.v1.DataFieldWithAction":
        sDataType = oDataField === null || oDataField === void 0 ? void 0 : (_Value = oDataField.Value) === null || _Value === void 0 ? void 0 : (_Value$$target = _Value.$target) === null || _Value$$target === void 0 ? void 0 : _Value$$target.type;
        break;
      case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
      default:
        const sDataTypeForDataFieldForAnnotation = (_Target = oDataField.Target) === null || _Target === void 0 ? void 0 : (_Target$$target = _Target.$target) === null || _Target$$target === void 0 ? void 0 : _Target$$target.$Type;
        if (sDataTypeForDataFieldForAnnotation) {
          var _Target2, _Target4;
          if (((_Target2 = oDataField.Target) === null || _Target2 === void 0 ? void 0 : _Target2.$target.$Type) === "com.sap.vocabularies.Communication.v1.ContactType") {
            var _$target, _Target3, _Target3$$target;
            sDataType = (_$target = ((_Target3 = oDataField.Target) === null || _Target3 === void 0 ? void 0 : (_Target3$$target = _Target3.$target) === null || _Target3$$target === void 0 ? void 0 : _Target3$$target.fn).$target) === null || _$target === void 0 ? void 0 : _$target.type;
          } else if (((_Target4 = oDataField.Target) === null || _Target4 === void 0 ? void 0 : _Target4.$target.$Type) === "com.sap.vocabularies.UI.v1.DataPointType") {
            var _Target5, _Target5$$target, _Target5$$target$Valu, _Target5$$target$Valu2, _Target6, _Target6$$target, _Target6$$target$Valu;
            sDataType = ((_Target5 = oDataField.Target) === null || _Target5 === void 0 ? void 0 : (_Target5$$target = _Target5.$target) === null || _Target5$$target === void 0 ? void 0 : (_Target5$$target$Valu = _Target5$$target.Value) === null || _Target5$$target$Valu === void 0 ? void 0 : (_Target5$$target$Valu2 = _Target5$$target$Valu.$Path) === null || _Target5$$target$Valu2 === void 0 ? void 0 : _Target5$$target$Valu2.$Type) || ((_Target6 = oDataField.Target) === null || _Target6 === void 0 ? void 0 : (_Target6$$target = _Target6.$target) === null || _Target6$$target === void 0 ? void 0 : (_Target6$$target$Valu = _Target6$$target.Value) === null || _Target6$$target$Valu === void 0 ? void 0 : _Target6$$target$Valu.$target.type);
          } else {
            var _Target7;
            // e.g. FieldGroup or Chart
            // FieldGroup Properties have no type, so we define it as a boolean type to prevent exceptions during the calculation of the width
            sDataType = ((_Target7 = oDataField.Target) === null || _Target7 === void 0 ? void 0 : _Target7.$target.$Type) === "com.sap.vocabularies.UI.v1.ChartDefinitionType" ? undefined : "Edm.Boolean";
          }
        } else {
          sDataType = undefined;
        }
        break;
    }
    return sDataType;
  };
  _exports.getDataFieldDataType = getDataFieldDataType;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJpc0RhdGFGaWVsZEZvckFjdGlvbkFic3RyYWN0IiwiZGF0YUZpZWxkIiwiaGFzT3duUHJvcGVydHkiLCJpc0RhdGFGaWVsZFR5cGVzIiwiZ2V0VGFyZ2V0VmFsdWVPbkRhdGFQb2ludCIsInNvdXJjZSIsInRhcmdldFZhbHVlIiwiaXNQcm9wZXJ0eSIsImFubm90YXRpb25zIiwiVUkiLCJEYXRhRmllbGREZWZhdWx0IiwiVGFyZ2V0IiwiJHRhcmdldCIsIlRhcmdldFZhbHVlIiwiTWF4aW11bVZhbHVlIiwidG9TdHJpbmciLCJpc1BhdGhFeHByZXNzaW9uIiwiaXNEYXRhUG9pbnRGcm9tRGF0YUZpZWxkRGVmYXVsdCIsInByb3BlcnR5IiwiJFR5cGUiLCJnZXRTZW1hbnRpY09iamVjdFBhdGgiLCJjb252ZXJ0ZXJDb250ZXh0Iiwib2JqZWN0IiwiVmFsdWUiLCJDb21tb24iLCJTZW1hbnRpY09iamVjdCIsInVuZGVmaW5lZCIsImdldEVudGl0eVNldEJhc2VkQW5ub3RhdGlvblBhdGgiLCJmdWxseVF1YWxpZmllZE5hbWUiLCJfZ2V0TmF2aWdhdGlvblBhdGhQcmVmaXgiLCJwYXRoIiwiaW5kZXhPZiIsInN1YnN0cmluZyIsImxhc3RJbmRleE9mIiwiX2NvbGxlY3RBZGRpdGlvbmFsUHJvcGVydGllc0ZvckFuYWx5dGljYWxUYWJsZSIsInRhcmdldCIsIm5hdmlnYXRpb25QYXRoUHJlZml4IiwidGFibGVUeXBlIiwicmVsYXRlZFByb3BlcnRpZXMiLCJoaWRkZW5Bbm5vdGF0aW9uIiwiSGlkZGVuIiwiaGlkZGVuQW5ub3RhdGlvblByb3BlcnR5UGF0aCIsImFkZGl0aW9uYWxQcm9wZXJ0aWVzIiwiY29sbGVjdFJlbGF0ZWRQcm9wZXJ0aWVzIiwiaWdub3JlU2VsZiIsInByb3BlcnRpZXMiLCJ0ZXh0T25seVByb3BlcnRpZXNGcm9tVGV4dEFubm90YXRpb24iLCJhZGRVbml0SW5UZW1wbGF0ZSIsImlzQW5ub3RhdGVkQXNIaWRkZW4iLCJfcHVzaFVuaXF1ZSIsImtleSIsInZhbHVlIiwiT2JqZWN0Iiwia2V5cyIsIl9hcHBlbmRUZW1wbGF0ZSIsImV4cG9ydFNldHRpbmdzVGVtcGxhdGUiLCJ2YWx1ZUluZGV4IiwiY3VycmVuY3lPclVvTUluZGV4IiwidGltZXpvbmVPclVvTUluZGV4IiwiZGF0YVBvaW50SW5kZXgiLCJ0ZXh0QW5ub3RhdGlvbiIsIlRleHQiLCJleHBvcnRTZXR0aW5nc1dyYXBwaW5nIiwiZGF0YU1vZGVsT2JqZWN0UGF0aCIsImdldERhdGFNb2RlbE9iamVjdFBhdGgiLCJ0ZXh0QW5ub3RhdGlvblByb3BlcnR5UGF0aCIsImRpc3BsYXlNb2RlIiwiZ2V0RGlzcGxheU1vZGUiLCJkZXNjcmlwdGlvbkluZGV4IiwicHVzaCIsImN1cnJlbmN5T3JVb01Qcm9wZXJ0eSIsImdldEFzc29jaWF0ZWRDdXJyZW5jeVByb3BlcnR5IiwiZ2V0QXNzb2NpYXRlZFVuaXRQcm9wZXJ0eSIsImN1cnJlbmN5T3JVbml0QW5ub3RhdGlvbiIsIk1lYXN1cmVzIiwiSVNPQ3VycmVuY3kiLCJVbml0IiwidGltZXpvbmVQcm9wZXJ0eSIsImdldEFzc29jaWF0ZWRUaW1lem9uZVByb3BlcnR5IiwidGltZXpvbmVBbm5vdGF0aW9uIiwiVGltZXpvbmUiLCJleHBvcnRVbml0TmFtZSIsImV4cG9ydFRpbWV6b25lTmFtZSIsIlZhbHVlRm9ybWF0IiwiZGF0YVBvaW50UHJvcGVydHkiLCJkYXRhcG9pbnRUYXJnZXQiLCJkYXRhUG9pbnREZWZhdWx0UHJvcGVydHkiLCJuYW1lIiwiZXhwb3J0RGF0YVBvaW50VGFyZ2V0VmFsdWUiLCJjb250YWN0UHJvcGVydHkiLCJmbiIsImNvbnRhY3RQcm9wZXJ0eVBhdGgiLCJleHBvcnRVbml0U3RyaW5nIiwiZXhwb3J0VGltZXpvbmVTdHJpbmciLCJsZW5ndGgiLCJjb2xsZWN0UmVsYXRlZFByb3BlcnRpZXNSZWN1cnNpdmVseSIsImlzRW1iZWRkZWQiLCJpc1N0YXRpY2FsbHlIaWRkZW4iLCJpc1JlZmVyZW5jZVByb3BlcnR5U3RhdGljYWxseUhpZGRlbiIsIkRhdGEiLCJmb3JFYWNoIiwiaW5uZXJEYXRhRmllbGQiLCJkYXRhRmllbGRDb250YWN0IiwiZ2V0RGF0YUZpZWxkRGF0YVR5cGUiLCJvRGF0YUZpZWxkIiwic0RhdGFUeXBlIiwidHlwZSIsInNEYXRhVHlwZUZvckRhdGFGaWVsZEZvckFubm90YXRpb24iLCIkUGF0aCJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiRGF0YUZpZWxkLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgUHJpbWl0aXZlVHlwZSwgUHJvcGVydHksIFByb3BlcnR5UGF0aCB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlc1wiO1xuaW1wb3J0IHR5cGUgeyBDb250YWN0IH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9Db21tdW5pY2F0aW9uXCI7XG5pbXBvcnQgeyBDb21tdW5pY2F0aW9uQW5ub3RhdGlvblR5cGVzIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9Db21tdW5pY2F0aW9uXCI7XG5pbXBvcnQgdHlwZSB7XG5cdERhdGFGaWVsZCxcblx0RGF0YUZpZWxkQWJzdHJhY3RUeXBlcyxcblx0RGF0YUZpZWxkRm9yQWN0aW9uQWJzdHJhY3RUeXBlcyxcblx0RGF0YUZpZWxkRm9yQW5ub3RhdGlvbixcblx0RGF0YUZpZWxkRm9yQW5ub3RhdGlvblR5cGVzLFxuXHREYXRhRmllbGRUeXBlcyxcblx0RGF0YVBvaW50LFxuXHREYXRhUG9pbnRUeXBlXG59IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlcIjtcbmltcG9ydCB7IFVJQW5ub3RhdGlvblR5cGVzIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9VSVwiO1xuaW1wb3J0IHR5cGUgeyBUYWJsZVR5cGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9Db21tb24vVGFibGVcIjtcbmltcG9ydCB7IGdldERpc3BsYXlNb2RlIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRGlzcGxheU1vZGVGb3JtYXR0ZXJcIjtcbmltcG9ydCB7XG5cdGdldEFzc29jaWF0ZWRDdXJyZW5jeVByb3BlcnR5LFxuXHRnZXRBc3NvY2lhdGVkVGltZXpvbmVQcm9wZXJ0eSxcblx0Z2V0QXNzb2NpYXRlZFVuaXRQcm9wZXJ0eSxcblx0aXNQYXRoRXhwcmVzc2lvbixcblx0aXNQcm9wZXJ0eVxufSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9Qcm9wZXJ0eUhlbHBlclwiO1xuaW1wb3J0IHR5cGUgQ29udmVydGVyQ29udGV4dCBmcm9tIFwiLi4vQ29udmVydGVyQ29udGV4dFwiO1xuaW1wb3J0IHsgaXNSZWZlcmVuY2VQcm9wZXJ0eVN0YXRpY2FsbHlIaWRkZW4gfSBmcm9tIFwiLi4vaGVscGVycy9EYXRhRmllbGRIZWxwZXJcIjtcblxuZXhwb3J0IHR5cGUgQ29tcGxleFByb3BlcnR5SW5mbyA9IHtcblx0cHJvcGVydGllczogUmVjb3JkPHN0cmluZywgUHJvcGVydHk+O1xuXHRhZGRpdGlvbmFsUHJvcGVydGllczogUmVjb3JkPHN0cmluZywgUHJvcGVydHk+O1xuXHRleHBvcnRTZXR0aW5nc1RlbXBsYXRlPzogc3RyaW5nO1xuXHRleHBvcnRTZXR0aW5nc1dyYXBwaW5nPzogYm9vbGVhbjtcblx0ZXhwb3J0VW5pdE5hbWU/OiBzdHJpbmc7XG5cdGV4cG9ydFVuaXRTdHJpbmc/OiBzdHJpbmc7XG5cdGV4cG9ydFRpbWV6b25lTmFtZT86IHN0cmluZztcblx0ZXhwb3J0VGltZXpvbmVTdHJpbmc/OiBzdHJpbmc7XG5cdHRleHRPbmx5UHJvcGVydGllc0Zyb21UZXh0QW5ub3RhdGlvbjogc3RyaW5nW107XG5cdGV4cG9ydERhdGFQb2ludFRhcmdldFZhbHVlPzogc3RyaW5nO1xufTtcblxuLyoqXG4gKiBJZGVudGlmaWVzIGlmIHRoZSBnaXZlbiBkYXRhRmllbGRBYnN0cmFjdCB0aGF0IGlzIHBhc3NlZCBpcyBhIFwiRGF0YUZpZWxkRm9yQWN0aW9uQWJzdHJhY3RcIi5cbiAqIERhdGFGaWVsZEZvckFjdGlvbkFic3RyYWN0IGhhcyBhbiBpbmxpbmUgYWN0aW9uIGRlZmluZWQuXG4gKlxuICogQHBhcmFtIGRhdGFGaWVsZCBEYXRhRmllbGQgdG8gYmUgZXZhbHVhdGVkXG4gKiBAcmV0dXJucyBWYWxpZGF0ZXMgdGhhdCBkYXRhRmllbGQgaXMgYSBEYXRhRmllbGRGb3JBY3Rpb25BYnN0cmFjdFR5cGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRGF0YUZpZWxkRm9yQWN0aW9uQWJzdHJhY3QoZGF0YUZpZWxkOiBEYXRhRmllbGRBYnN0cmFjdFR5cGVzKTogZGF0YUZpZWxkIGlzIERhdGFGaWVsZEZvckFjdGlvbkFic3RyYWN0VHlwZXMge1xuXHRyZXR1cm4gKGRhdGFGaWVsZCBhcyBEYXRhRmllbGRGb3JBY3Rpb25BYnN0cmFjdFR5cGVzKS5oYXNPd25Qcm9wZXJ0eShcIkFjdGlvblwiKTtcbn1cblxuLyoqXG4gKiBJZGVudGlmaWVzIGlmIHRoZSBnaXZlbiBkYXRhRmllbGRBYnN0cmFjdCB0aGF0IGlzIHBhc3NlZCBpcyBhIFwiRGF0YUZpZWxkXCIuXG4gKiBEYXRhRmllbGQgaGFzIGEgdmFsdWUgZGVmaW5lZC5cbiAqXG4gKiBAcGFyYW0gZGF0YUZpZWxkIERhdGFGaWVsZCB0byBiZSBldmFsdWF0ZWRcbiAqIEByZXR1cm5zIFZhbGlkYXRlIHRoYXQgZGF0YUZpZWxkIGlzIGEgRGF0YUZpZWxkVHlwZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRGF0YUZpZWxkVHlwZXMoZGF0YUZpZWxkOiBEYXRhRmllbGRBYnN0cmFjdFR5cGVzKTogZGF0YUZpZWxkIGlzIERhdGFGaWVsZFR5cGVzIHtcblx0cmV0dXJuIChkYXRhRmllbGQgYXMgRGF0YUZpZWxkVHlwZXMpLmhhc093blByb3BlcnR5KFwiVmFsdWVcIik7XG59XG5cbi8qKlxuICogUmV0cmlldmVzIHRoZSBUYXJnZXRWYWx1ZSBmcm9tIGEgRGF0YVBvaW50LlxuICpcbiAqIEBwYXJhbSBzb3VyY2UgdGhlIHRhcmdldCBwcm9wZXJ0eSBvciBEYXRhUG9pbnRcbiAqIEByZXR1cm5zIFRoZSBUYXJnZXRWYWx1ZSBhcyBhIGRlY2ltYWwgb3IgYSBwcm9wZXJ0eSBwYXRoXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFRhcmdldFZhbHVlT25EYXRhUG9pbnQoc291cmNlOiBQcm9wZXJ0eSB8IERhdGFQb2ludFR5cGUpOiBzdHJpbmcgfCBQcm9wZXJ0eVBhdGgge1xuXHRsZXQgdGFyZ2V0VmFsdWU6IHN0cmluZyB8IFByb3BlcnR5UGF0aCB8IG51bWJlcjtcblx0aWYgKGlzUHJvcGVydHkoc291cmNlKSkge1xuXHRcdHRhcmdldFZhbHVlID1cblx0XHRcdCgoc291cmNlLmFubm90YXRpb25zPy5VST8uRGF0YUZpZWxkRGVmYXVsdCBhcyBEYXRhRmllbGRGb3JBbm5vdGF0aW9uVHlwZXMpPy5UYXJnZXQ/LiR0YXJnZXQgYXMgRGF0YVBvaW50VHlwZSk/LlRhcmdldFZhbHVlID8/XG5cdFx0XHQoKHNvdXJjZS5hbm5vdGF0aW9ucz8uVUk/LkRhdGFGaWVsZERlZmF1bHQgYXMgRGF0YUZpZWxkRm9yQW5ub3RhdGlvblR5cGVzKT8uVGFyZ2V0Py4kdGFyZ2V0IGFzIERhdGFQb2ludFR5cGUpPy5NYXhpbXVtVmFsdWU7XG5cdH0gZWxzZSB7XG5cdFx0dGFyZ2V0VmFsdWUgPSBzb3VyY2UuVGFyZ2V0VmFsdWUgPz8gc291cmNlLk1heGltdW1WYWx1ZTtcblx0fVxuXHRpZiAodHlwZW9mIHRhcmdldFZhbHVlID09PSBcIm51bWJlclwiKSB7XG5cdFx0cmV0dXJuIHRhcmdldFZhbHVlLnRvU3RyaW5nKCk7XG5cdH1cblx0cmV0dXJuIGlzUGF0aEV4cHJlc3Npb24odGFyZ2V0VmFsdWUpID8gdGFyZ2V0VmFsdWUgOiBcIjEwMFwiO1xufVxuXG4vKipcbiAqIENoZWNrIGlmIGEgcHJvcGVydHkgdXNlcyBhIERhdGFQb2ludCB3aXRoaW4gYSBEYXRhRmllbGREZWZhdWx0LlxuICpcbiAqIEBwYXJhbSBwcm9wZXJ0eSBUaGUgcHJvcGVydHkgdG8gYmUgY2hlY2tlZFxuICogQHJldHVybnMgYHRydWVgIGlmIHRoZSByZWZlcmVuY2VkIHByb3BlcnR5IGhhcyBhIERhdGFQb2ludCB3aXRoaW4gdGhlIERhdGFGaWVsZERlZmF1bHQsIGZhbHNlIGVsc2VcbiAqIEBwcml2YXRlXG4gKi9cblxuZXhwb3J0IGNvbnN0IGlzRGF0YVBvaW50RnJvbURhdGFGaWVsZERlZmF1bHQgPSBmdW5jdGlvbiAocHJvcGVydHk6IFByb3BlcnR5KTogYm9vbGVhbiB7XG5cdHJldHVybiAoXG5cdFx0KHByb3BlcnR5LmFubm90YXRpb25zPy5VST8uRGF0YUZpZWxkRGVmYXVsdCBhcyBEYXRhRmllbGRGb3JBbm5vdGF0aW9uKT8uVGFyZ2V0Py4kdGFyZ2V0Py4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YVBvaW50VHlwZVxuXHQpO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldFNlbWFudGljT2JqZWN0UGF0aChjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LCBvYmplY3Q6IGFueSk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG5cdGlmICh0eXBlb2Ygb2JqZWN0ID09PSBcIm9iamVjdFwiKSB7XG5cdFx0aWYgKGlzRGF0YUZpZWxkVHlwZXMob2JqZWN0KSAmJiBvYmplY3QuVmFsdWU/LiR0YXJnZXQpIHtcblx0XHRcdGNvbnN0IHByb3BlcnR5ID0gb2JqZWN0LlZhbHVlPy4kdGFyZ2V0O1xuXHRcdFx0aWYgKHByb3BlcnR5Py5hbm5vdGF0aW9ucz8uQ29tbW9uPy5TZW1hbnRpY09iamVjdCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdHJldHVybiBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVNldEJhc2VkQW5ub3RhdGlvblBhdGgocHJvcGVydHk/LmZ1bGx5UXVhbGlmaWVkTmFtZSk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmIChpc1Byb3BlcnR5KG9iamVjdCkpIHtcblx0XHRcdGlmIChvYmplY3Q/LmFubm90YXRpb25zPy5Db21tb24/LlNlbWFudGljT2JqZWN0ICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0cmV0dXJuIGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0QmFzZWRBbm5vdGF0aW9uUGF0aChvYmplY3Q/LmZ1bGx5UXVhbGlmaWVkTmFtZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbmF2aWdhdGlvbiBwYXRoIHByZWZpeCBmb3IgYSBwcm9wZXJ0eSBwYXRoLlxuICpcbiAqIEBwYXJhbSBwYXRoIFRoZSBwcm9wZXJ0eSBwYXRoIEZvciBlLmcuIC9FbnRpdHlUeXBlL05hdmlnYXRpb24vUHJvcGVydHlcbiAqIEByZXR1cm5zIFRoZSBuYXZpZ2F0aW9uIHBhdGggcHJlZml4IEZvciBlLmcuIC9FbnRpdHlUeXBlL05hdmlnYXRpb24vXG4gKi9cbmZ1bmN0aW9uIF9nZXROYXZpZ2F0aW9uUGF0aFByZWZpeChwYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xuXHRyZXR1cm4gcGF0aC5pbmRleE9mKFwiL1wiKSA+IC0xID8gcGF0aC5zdWJzdHJpbmcoMCwgcGF0aC5sYXN0SW5kZXhPZihcIi9cIikgKyAxKSA6IFwiXCI7XG59XG5cbi8qKlxuICogQ29sbGVjdCBhZGRpdGlvbmFsIHByb3BlcnRpZXMgZm9yIHRoZSBBTFAgdGFibGUgdXNlLWNhc2UuXG4gKlxuICogRm9yIGUuZy4gSWYgVUkuSGlkZGVuIHBvaW50cyB0byBhIHByb3BlcnR5LCBpbmNsdWRlIHRoaXMgcHJvcGVydHkgaW4gdGhlIGFkZGl0aW9uYWxQcm9wZXJ0aWVzIG9mIENvbXBsZXhQcm9wZXJ0eUluZm8gb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB0YXJnZXQgUHJvcGVydHkgb3IgRGF0YUZpZWxkIGJlaW5nIHByb2Nlc3NlZFxuICogQHBhcmFtIG5hdmlnYXRpb25QYXRoUHJlZml4IE5hdmlnYXRpb24gcGF0aCBwcmVmaXgsIGFwcGxpY2FibGUgaW4gY2FzZSBvZiBuYXZpZ2F0aW9uIHByb3BlcnRpZXMuXG4gKiBAcGFyYW0gdGFibGVUeXBlIFRhYmxlIHR5cGUuXG4gKiBAcGFyYW0gcmVsYXRlZFByb3BlcnRpZXMgVGhlIHJlbGF0ZWQgcHJvcGVydGllcyBpZGVudGlmaWVkIHNvIGZhci5cbiAqIEByZXR1cm5zIFRoZSByZWxhdGVkIHByb3BlcnRpZXMgaWRlbnRpZmllZC5cbiAqL1xuZnVuY3Rpb24gX2NvbGxlY3RBZGRpdGlvbmFsUHJvcGVydGllc0ZvckFuYWx5dGljYWxUYWJsZShcblx0dGFyZ2V0OiBQcmltaXRpdmVUeXBlLFxuXHRuYXZpZ2F0aW9uUGF0aFByZWZpeDogc3RyaW5nLFxuXHR0YWJsZVR5cGU6IFRhYmxlVHlwZSxcblx0cmVsYXRlZFByb3BlcnRpZXM6IENvbXBsZXhQcm9wZXJ0eUluZm9cbik6IENvbXBsZXhQcm9wZXJ0eUluZm8ge1xuXHRpZiAodGFibGVUeXBlID09PSBcIkFuYWx5dGljYWxUYWJsZVwiKSB7XG5cdFx0Y29uc3QgaGlkZGVuQW5ub3RhdGlvbiA9IHRhcmdldC5hbm5vdGF0aW9ucz8uVUk/LkhpZGRlbjtcblx0XHRpZiAoaGlkZGVuQW5ub3RhdGlvbj8ucGF0aCAmJiBpc1Byb3BlcnR5KGhpZGRlbkFubm90YXRpb24uJHRhcmdldCkpIHtcblx0XHRcdGNvbnN0IGhpZGRlbkFubm90YXRpb25Qcm9wZXJ0eVBhdGggPSBuYXZpZ2F0aW9uUGF0aFByZWZpeCArIGhpZGRlbkFubm90YXRpb24ucGF0aDtcblx0XHRcdC8vIFRoaXMgcHJvcGVydHkgc2hvdWxkIGJlIGFkZGVkIHRvIGFkZGl0aW9uYWxQcm9wZXJ0aWVzIG1hcCBmb3IgdGhlIEFMUCB0YWJsZSB1c2UtY2FzZS5cblx0XHRcdHJlbGF0ZWRQcm9wZXJ0aWVzLmFkZGl0aW9uYWxQcm9wZXJ0aWVzW2hpZGRlbkFubm90YXRpb25Qcm9wZXJ0eVBhdGhdID0gaGlkZGVuQW5ub3RhdGlvbi4kdGFyZ2V0O1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gcmVsYXRlZFByb3BlcnRpZXM7XG59XG5cbi8qKlxuICogQ29sbGVjdCByZWxhdGVkIHByb3BlcnRpZXMgZnJvbSBhIHByb3BlcnR5J3MgYW5ub3RhdGlvbnMuXG4gKlxuICogQHBhcmFtIHBhdGggVGhlIHByb3BlcnR5IHBhdGhcbiAqIEBwYXJhbSBwcm9wZXJ0eSBUaGUgcHJvcGVydHkgdG8gYmUgY29uc2lkZXJlZFxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHQgVGhlIGNvbnZlcnRlciBjb250ZXh0XG4gKiBAcGFyYW0gaWdub3JlU2VsZiBXaGV0aGVyIHRvIGV4Y2x1ZGUgdGhlIHNhbWUgcHJvcGVydHkgZnJvbSByZWxhdGVkIHByb3BlcnRpZXMuXG4gKiBAcGFyYW0gdGFibGVUeXBlIFRoZSB0YWJsZSB0eXBlLlxuICogQHBhcmFtIHJlbGF0ZWRQcm9wZXJ0aWVzIFRoZSByZWxhdGVkIHByb3BlcnRpZXMgaWRlbnRpZmllZCBzbyBmYXIuXG4gKiBAcGFyYW0gYWRkVW5pdEluVGVtcGxhdGUgVHJ1ZSBpZiB0aGUgdW5pdC9jdXJyZW5jeSBwcm9wZXJ0eSBuZWVkcyB0byBiZSBhZGRlZCBpbiB0aGUgZXhwb3J0IHRlbXBsYXRlXG4gKiBAcGFyYW0gaXNBbm5vdGF0ZWRBc0hpZGRlbiBUcnVlIGlmIHRoZSBEYXRhRmllbGQgb3IgdGhlIHByb3BlcnR5IGFyZSBzdGF0aWNhbGx5IGhpZGRlblxuICogQHJldHVybnMgVGhlIHJlbGF0ZWQgcHJvcGVydGllcyBpZGVudGlmaWVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29sbGVjdFJlbGF0ZWRQcm9wZXJ0aWVzKFxuXHRwYXRoOiBzdHJpbmcsXG5cdHByb3BlcnR5OiBQcmltaXRpdmVUeXBlLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRpZ25vcmVTZWxmOiBib29sZWFuLFxuXHR0YWJsZVR5cGU6IFRhYmxlVHlwZSxcblx0cmVsYXRlZFByb3BlcnRpZXM6IENvbXBsZXhQcm9wZXJ0eUluZm8gPSB7IHByb3BlcnRpZXM6IHt9LCBhZGRpdGlvbmFsUHJvcGVydGllczoge30sIHRleHRPbmx5UHJvcGVydGllc0Zyb21UZXh0QW5ub3RhdGlvbjogW10gfSxcblx0YWRkVW5pdEluVGVtcGxhdGU6IGJvb2xlYW4gPSBmYWxzZSxcblx0aXNBbm5vdGF0ZWRBc0hpZGRlbjogYm9vbGVhbiA9IGZhbHNlXG4pOiBDb21wbGV4UHJvcGVydHlJbmZvIHtcblx0LyoqXG5cdCAqIEhlbHBlciB0byBwdXNoIHVuaXF1ZSByZWxhdGVkIHByb3BlcnRpZXMuXG5cdCAqXG5cdCAqIEBwYXJhbSBrZXkgVGhlIHByb3BlcnR5IHBhdGhcblx0ICogQHBhcmFtIHZhbHVlIFRoZSBwcm9wZXJ0aWVzIG9iamVjdCBjb250YWluaW5nIHZhbHVlIHByb3BlcnR5LCBkZXNjcmlwdGlvbiBwcm9wZXJ0eS4uLlxuXHQgKiBAcmV0dXJucyBJbmRleCBhdCB3aGljaCB0aGUgcHJvcGVydHkgaXMgYXZhaWxhYmxlXG5cdCAqL1xuXHRmdW5jdGlvbiBfcHVzaFVuaXF1ZShrZXk6IHN0cmluZywgdmFsdWU6IFByb3BlcnR5KTogbnVtYmVyIHtcblx0XHRpZiAoIXJlbGF0ZWRQcm9wZXJ0aWVzLnByb3BlcnRpZXMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuXHRcdFx0cmVsYXRlZFByb3BlcnRpZXMucHJvcGVydGllc1trZXldID0gdmFsdWU7XG5cdFx0fVxuXHRcdHJldHVybiBPYmplY3Qua2V5cyhyZWxhdGVkUHJvcGVydGllcy5wcm9wZXJ0aWVzKS5pbmRleE9mKGtleSk7XG5cdH1cblxuXHQvKipcblx0ICogSGVscGVyIHRvIGFwcGVuZCB0aGUgZXhwb3J0IHNldHRpbmdzIHRlbXBsYXRlIHdpdGggYSBmb3JtYXR0ZWQgdGV4dC5cblx0ICpcblx0ICogQHBhcmFtIHZhbHVlIEZvcm1hdHRlZCB0ZXh0XG5cdCAqL1xuXHRmdW5jdGlvbiBfYXBwZW5kVGVtcGxhdGUodmFsdWU6IHN0cmluZykge1xuXHRcdHJlbGF0ZWRQcm9wZXJ0aWVzLmV4cG9ydFNldHRpbmdzVGVtcGxhdGUgPSByZWxhdGVkUHJvcGVydGllcy5leHBvcnRTZXR0aW5nc1RlbXBsYXRlXG5cdFx0XHQ/IGAke3JlbGF0ZWRQcm9wZXJ0aWVzLmV4cG9ydFNldHRpbmdzVGVtcGxhdGV9JHt2YWx1ZX1gXG5cdFx0XHQ6IGAke3ZhbHVlfWA7XG5cdH1cblx0aWYgKHBhdGggJiYgcHJvcGVydHkpIHtcblx0XHRsZXQgdmFsdWVJbmRleDogbnVtYmVyO1xuXHRcdGxldCB0YXJnZXRWYWx1ZTogc3RyaW5nIHwgUHJvcGVydHlQYXRoO1xuXHRcdGxldCBjdXJyZW5jeU9yVW9NSW5kZXg6IG51bWJlcjtcblx0XHRsZXQgdGltZXpvbmVPclVvTUluZGV4OiBudW1iZXI7XG5cdFx0bGV0IGRhdGFQb2ludEluZGV4OiBudW1iZXI7XG5cdFx0aWYgKGlzQW5ub3RhdGVkQXNIaWRkZW4pIHtcblx0XHRcdC8vIENvbGxlY3QgdW5kZXJseWluZyBwcm9wZXJ0eVxuXHRcdFx0dmFsdWVJbmRleCA9IF9wdXNoVW5pcXVlKHBhdGgsIHByb3BlcnR5KTtcblx0XHRcdF9hcHBlbmRUZW1wbGF0ZShgeyR7dmFsdWVJbmRleH19YCk7XG5cdFx0XHRyZXR1cm4gcmVsYXRlZFByb3BlcnRpZXM7XG5cdFx0fVxuXHRcdGNvbnN0IG5hdmlnYXRpb25QYXRoUHJlZml4ID0gX2dldE5hdmlnYXRpb25QYXRoUHJlZml4KHBhdGgpO1xuXG5cdFx0Ly8gQ2hlY2sgZm9yIFRleHQgYW5ub3RhdGlvbi5cblx0XHRjb25zdCB0ZXh0QW5ub3RhdGlvbiA9IHByb3BlcnR5LmFubm90YXRpb25zPy5Db21tb24/LlRleHQ7XG5cblx0XHRpZiAocmVsYXRlZFByb3BlcnRpZXMuZXhwb3J0U2V0dGluZ3NUZW1wbGF0ZSkge1xuXHRcdFx0Ly8gRmllbGRHcm91cCB1c2UtY2FzZS4gTmVlZCB0byBhZGQgZWFjaCBGaWVsZCBpbiBuZXcgbGluZS5cblx0XHRcdF9hcHBlbmRUZW1wbGF0ZShcIlxcblwiKTtcblx0XHRcdHJlbGF0ZWRQcm9wZXJ0aWVzLmV4cG9ydFNldHRpbmdzV3JhcHBpbmcgPSB0cnVlO1xuXHRcdH1cblxuXHRcdGlmICh0ZXh0QW5ub3RhdGlvbj8ucGF0aCAmJiB0ZXh0QW5ub3RhdGlvbj8uJHRhcmdldCkge1xuXHRcdFx0Ly8gQ2hlY2sgZm9yIFRleHQgQXJyYW5nZW1lbnQuXG5cdFx0XHRjb25zdCBkYXRhTW9kZWxPYmplY3RQYXRoID0gY29udmVydGVyQ29udGV4dC5nZXREYXRhTW9kZWxPYmplY3RQYXRoKCk7XG5cdFx0XHRjb25zdCB0ZXh0QW5ub3RhdGlvblByb3BlcnR5UGF0aCA9IG5hdmlnYXRpb25QYXRoUHJlZml4ICsgdGV4dEFubm90YXRpb24ucGF0aDtcblx0XHRcdGNvbnN0IGRpc3BsYXlNb2RlID0gZ2V0RGlzcGxheU1vZGUocHJvcGVydHksIGRhdGFNb2RlbE9iamVjdFBhdGgpO1xuXHRcdFx0bGV0IGRlc2NyaXB0aW9uSW5kZXg6IG51bWJlcjtcblx0XHRcdHN3aXRjaCAoZGlzcGxheU1vZGUpIHtcblx0XHRcdFx0Y2FzZSBcIlZhbHVlXCI6XG5cdFx0XHRcdFx0dmFsdWVJbmRleCA9IF9wdXNoVW5pcXVlKHBhdGgsIHByb3BlcnR5KTtcblx0XHRcdFx0XHRfYXBwZW5kVGVtcGxhdGUoYHske3ZhbHVlSW5kZXh9fWApO1xuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdGNhc2UgXCJEZXNjcmlwdGlvblwiOlxuXHRcdFx0XHRcdGRlc2NyaXB0aW9uSW5kZXggPSBfcHVzaFVuaXF1ZSh0ZXh0QW5ub3RhdGlvblByb3BlcnR5UGF0aCwgdGV4dEFubm90YXRpb24uJHRhcmdldCk7XG5cdFx0XHRcdFx0X2FwcGVuZFRlbXBsYXRlKGB7JHtkZXNjcmlwdGlvbkluZGV4fX1gKTtcblx0XHRcdFx0XHRyZWxhdGVkUHJvcGVydGllcy50ZXh0T25seVByb3BlcnRpZXNGcm9tVGV4dEFubm90YXRpb24ucHVzaCh0ZXh0QW5ub3RhdGlvblByb3BlcnR5UGF0aCk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0Y2FzZSBcIlZhbHVlRGVzY3JpcHRpb25cIjpcblx0XHRcdFx0XHR2YWx1ZUluZGV4ID0gX3B1c2hVbmlxdWUocGF0aCwgcHJvcGVydHkpO1xuXHRcdFx0XHRcdGRlc2NyaXB0aW9uSW5kZXggPSBfcHVzaFVuaXF1ZSh0ZXh0QW5ub3RhdGlvblByb3BlcnR5UGF0aCwgdGV4dEFubm90YXRpb24uJHRhcmdldCk7XG5cdFx0XHRcdFx0X2FwcGVuZFRlbXBsYXRlKGB7JHt2YWx1ZUluZGV4fX0gKHske2Rlc2NyaXB0aW9uSW5kZXh9fSlgKTtcblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRjYXNlIFwiRGVzY3JpcHRpb25WYWx1ZVwiOlxuXHRcdFx0XHRcdHZhbHVlSW5kZXggPSBfcHVzaFVuaXF1ZShwYXRoLCBwcm9wZXJ0eSk7XG5cdFx0XHRcdFx0ZGVzY3JpcHRpb25JbmRleCA9IF9wdXNoVW5pcXVlKHRleHRBbm5vdGF0aW9uUHJvcGVydHlQYXRoLCB0ZXh0QW5ub3RhdGlvbi4kdGFyZ2V0KTtcblx0XHRcdFx0XHRfYXBwZW5kVGVtcGxhdGUoYHske2Rlc2NyaXB0aW9uSW5kZXh9fSAoeyR7dmFsdWVJbmRleH19KWApO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHQvLyBubyBkZWZhdWx0XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIENoZWNrIGZvciBmaWVsZCBjb250YWluaW5nIEN1cnJlbmN5IE9yIFVuaXQgUHJvcGVydGllcyBvciBUaW1lem9uZVxuXHRcdFx0Y29uc3QgY3VycmVuY3lPclVvTVByb3BlcnR5ID0gZ2V0QXNzb2NpYXRlZEN1cnJlbmN5UHJvcGVydHkocHJvcGVydHkpIHx8IGdldEFzc29jaWF0ZWRVbml0UHJvcGVydHkocHJvcGVydHkpO1xuXHRcdFx0Y29uc3QgY3VycmVuY3lPclVuaXRBbm5vdGF0aW9uID0gcHJvcGVydHk/LmFubm90YXRpb25zPy5NZWFzdXJlcz8uSVNPQ3VycmVuY3kgfHwgcHJvcGVydHk/LmFubm90YXRpb25zPy5NZWFzdXJlcz8uVW5pdDtcblx0XHRcdGNvbnN0IHRpbWV6b25lUHJvcGVydHkgPSBnZXRBc3NvY2lhdGVkVGltZXpvbmVQcm9wZXJ0eShwcm9wZXJ0eSk7XG5cdFx0XHRjb25zdCB0aW1lem9uZUFubm90YXRpb24gPSBwcm9wZXJ0eT8uYW5ub3RhdGlvbnM/LkNvbW1vbj8uVGltZXpvbmU7XG5cblx0XHRcdGlmIChjdXJyZW5jeU9yVW9NUHJvcGVydHkgJiYgY3VycmVuY3lPclVuaXRBbm5vdGF0aW9uPy4kdGFyZ2V0KSB7XG5cdFx0XHRcdHZhbHVlSW5kZXggPSBfcHVzaFVuaXF1ZShwYXRoLCBwcm9wZXJ0eSk7XG5cdFx0XHRcdGN1cnJlbmN5T3JVb01JbmRleCA9IF9wdXNoVW5pcXVlKG5hdmlnYXRpb25QYXRoUHJlZml4ICsgY3VycmVuY3lPclVuaXRBbm5vdGF0aW9uLnBhdGgsIGN1cnJlbmN5T3JVbml0QW5ub3RhdGlvbi4kdGFyZ2V0KTtcblx0XHRcdFx0aWYgKGFkZFVuaXRJblRlbXBsYXRlKSB7XG5cdFx0XHRcdFx0X2FwcGVuZFRlbXBsYXRlKGB7JHt2YWx1ZUluZGV4fX0gIHske2N1cnJlbmN5T3JVb01JbmRleH19YCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmVsYXRlZFByb3BlcnRpZXMuZXhwb3J0VW5pdE5hbWUgPSBuYXZpZ2F0aW9uUGF0aFByZWZpeCArIGN1cnJlbmN5T3JVbml0QW5ub3RhdGlvbi5wYXRoO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYgKHRpbWV6b25lUHJvcGVydHkgJiYgdGltZXpvbmVBbm5vdGF0aW9uPy4kdGFyZ2V0KSB7XG5cdFx0XHRcdHZhbHVlSW5kZXggPSBfcHVzaFVuaXF1ZShwYXRoLCBwcm9wZXJ0eSk7XG5cdFx0XHRcdHRpbWV6b25lT3JVb01JbmRleCA9IF9wdXNoVW5pcXVlKG5hdmlnYXRpb25QYXRoUHJlZml4ICsgdGltZXpvbmVBbm5vdGF0aW9uLnBhdGgsIHRpbWV6b25lQW5ub3RhdGlvbi4kdGFyZ2V0KTtcblx0XHRcdFx0aWYgKGFkZFVuaXRJblRlbXBsYXRlKSB7XG5cdFx0XHRcdFx0X2FwcGVuZFRlbXBsYXRlKGB7JHt2YWx1ZUluZGV4fX0gIHske3RpbWV6b25lT3JVb01JbmRleH19YCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmVsYXRlZFByb3BlcnRpZXMuZXhwb3J0VGltZXpvbmVOYW1lID0gbmF2aWdhdGlvblBhdGhQcmVmaXggKyB0aW1lem9uZUFubm90YXRpb24ucGF0aDtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmIChcblx0XHRcdFx0KHByb3BlcnR5LlRhcmdldD8uJHRhcmdldD8uJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFQb2ludFR5cGUgJiYgIXByb3BlcnR5LlRhcmdldD8uJHRhcmdldD8uVmFsdWVGb3JtYXQpIHx8XG5cdFx0XHRcdHByb3BlcnR5LmFubm90YXRpb25zPy5VST8uRGF0YUZpZWxkRGVmYXVsdD8uVGFyZ2V0Py4kdGFyZ2V0Py4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YVBvaW50VHlwZVxuXHRcdFx0KSB7XG5cdFx0XHRcdGNvbnN0IGRhdGFQb2ludFByb3BlcnR5ID0gcHJvcGVydHkuVGFyZ2V0Py4kdGFyZ2V0Py5WYWx1ZS4kdGFyZ2V0IGFzIFByb3BlcnR5O1xuXHRcdFx0XHRjb25zdCBkYXRhcG9pbnRUYXJnZXQgPSBwcm9wZXJ0eS5UYXJnZXQ/LiR0YXJnZXQ7XG5cdFx0XHRcdC8vIERhdGFQb2ludCB1c2UtY2FzZSB1c2luZyBEYXRhRmllbGREZWZhdWx0LlxuXHRcdFx0XHRjb25zdCBkYXRhUG9pbnREZWZhdWx0UHJvcGVydHkgPSBwcm9wZXJ0eS5hbm5vdGF0aW9ucz8uVUk/LkRhdGFGaWVsZERlZmF1bHQ7XG5cdFx0XHRcdHZhbHVlSW5kZXggPSBfcHVzaFVuaXF1ZShcblx0XHRcdFx0XHRuYXZpZ2F0aW9uUGF0aFByZWZpeCA/IG5hdmlnYXRpb25QYXRoUHJlZml4ICsgcGF0aCA6IHBhdGgsXG5cdFx0XHRcdFx0ZGF0YVBvaW50RGVmYXVsdFByb3BlcnR5ID8gcHJvcGVydHkgOiBkYXRhUG9pbnRQcm9wZXJ0eVxuXHRcdFx0XHQpO1xuXHRcdFx0XHR0YXJnZXRWYWx1ZSA9IGdldFRhcmdldFZhbHVlT25EYXRhUG9pbnQoZGF0YVBvaW50RGVmYXVsdFByb3BlcnR5ID8gcHJvcGVydHkgOiBkYXRhcG9pbnRUYXJnZXQpO1xuXHRcdFx0XHRpZiAoaXNQcm9wZXJ0eSgodGFyZ2V0VmFsdWUgYXMgUHJvcGVydHlQYXRoKS4kdGFyZ2V0KSkge1xuXHRcdFx0XHRcdC8vaW4gY2FzZSBpdCdzIGEgZHluYW1pYyB0YXJnZXRWYWx1ZVxuXHRcdFx0XHRcdHRhcmdldFZhbHVlID0gdGFyZ2V0VmFsdWUgYXMgUHJvcGVydHlQYXRoO1xuXHRcdFx0XHRcdGRhdGFQb2ludEluZGV4ID0gX3B1c2hVbmlxdWUoXG5cdFx0XHRcdFx0XHRuYXZpZ2F0aW9uUGF0aFByZWZpeCA/IG5hdmlnYXRpb25QYXRoUHJlZml4ICsgdGFyZ2V0VmFsdWUuJHRhcmdldC5uYW1lIDogdGFyZ2V0VmFsdWUuJHRhcmdldC5uYW1lLFxuXHRcdFx0XHRcdFx0dGFyZ2V0VmFsdWUuJHRhcmdldFxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0X2FwcGVuZFRlbXBsYXRlKGB7JHt2YWx1ZUluZGV4fX0veyR7ZGF0YVBvaW50SW5kZXh9fWApO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJlbGF0ZWRQcm9wZXJ0aWVzLmV4cG9ydERhdGFQb2ludFRhcmdldFZhbHVlID0gdGFyZ2V0VmFsdWUgYXMgc3RyaW5nO1xuXHRcdFx0XHRcdF9hcHBlbmRUZW1wbGF0ZShgeyR7dmFsdWVJbmRleH19LyR7dGFyZ2V0VmFsdWV9YCk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZiAocHJvcGVydHkuJFR5cGUgPT09IENvbW11bmljYXRpb25Bbm5vdGF0aW9uVHlwZXMuQ29udGFjdFR5cGUpIHtcblx0XHRcdFx0Y29uc3QgY29udGFjdFByb3BlcnR5ID0gcHJvcGVydHkuZm4/LiR0YXJnZXQ7XG5cdFx0XHRcdGNvbnN0IGNvbnRhY3RQcm9wZXJ0eVBhdGggPSBwcm9wZXJ0eS5mbj8ucGF0aDtcblx0XHRcdFx0dmFsdWVJbmRleCA9IF9wdXNoVW5pcXVlKFxuXHRcdFx0XHRcdG5hdmlnYXRpb25QYXRoUHJlZml4ID8gbmF2aWdhdGlvblBhdGhQcmVmaXggKyBjb250YWN0UHJvcGVydHlQYXRoIDogY29udGFjdFByb3BlcnR5UGF0aCxcblx0XHRcdFx0XHRjb250YWN0UHJvcGVydHlcblx0XHRcdFx0KTtcblx0XHRcdFx0X2FwcGVuZFRlbXBsYXRlKGB7JHt2YWx1ZUluZGV4fX1gKTtcblx0XHRcdH0gZWxzZSBpZiAoIWlnbm9yZVNlbGYpIHtcblx0XHRcdFx0Ly8gQ29sbGVjdCB1bmRlcmx5aW5nIHByb3BlcnR5XG5cdFx0XHRcdHZhbHVlSW5kZXggPSBfcHVzaFVuaXF1ZShwYXRoLCBwcm9wZXJ0eSk7XG5cdFx0XHRcdF9hcHBlbmRUZW1wbGF0ZShgeyR7dmFsdWVJbmRleH19YCk7XG5cdFx0XHRcdGlmIChjdXJyZW5jeU9yVW5pdEFubm90YXRpb24pIHtcblx0XHRcdFx0XHRyZWxhdGVkUHJvcGVydGllcy5leHBvcnRVbml0U3RyaW5nID0gYCR7Y3VycmVuY3lPclVuaXRBbm5vdGF0aW9ufWA7IC8vIEhhcmQtY29kZWQgY3VycmVuY3kvdW5pdFxuXHRcdFx0XHR9IGVsc2UgaWYgKHRpbWV6b25lQW5ub3RhdGlvbikge1xuXHRcdFx0XHRcdHJlbGF0ZWRQcm9wZXJ0aWVzLmV4cG9ydFRpbWV6b25lU3RyaW5nID0gYCR7dGltZXpvbmVBbm5vdGF0aW9ufWA7IC8vIEhhcmQtY29kZWQgdGltZXpvbmVcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJlbGF0ZWRQcm9wZXJ0aWVzID0gX2NvbGxlY3RBZGRpdGlvbmFsUHJvcGVydGllc0ZvckFuYWx5dGljYWxUYWJsZShwcm9wZXJ0eSwgbmF2aWdhdGlvblBhdGhQcmVmaXgsIHRhYmxlVHlwZSwgcmVsYXRlZFByb3BlcnRpZXMpO1xuXHRcdGlmIChPYmplY3Qua2V5cyhyZWxhdGVkUHJvcGVydGllcy5hZGRpdGlvbmFsUHJvcGVydGllcykubGVuZ3RoID4gMCAmJiBPYmplY3Qua2V5cyhyZWxhdGVkUHJvcGVydGllcy5wcm9wZXJ0aWVzKS5sZW5ndGggPT09IDApIHtcblx0XHRcdC8vIENvbGxlY3QgdW5kZXJseWluZyBwcm9wZXJ0eSBpZiBub3QgY29sbGVjdGVkIGFscmVhZHkuXG5cdFx0XHQvLyBUaGlzIGlzIHRvIGVuc3VyZSB0aGF0IGFkZGl0aW9uYWxQcm9wZXJ0aWVzIGFyZSBtYWRlIGF2YWlsYWJsZSBvbmx5IHRvIGNvbXBsZXggcHJvcGVydHkgaW5mb3MuXG5cdFx0XHR2YWx1ZUluZGV4ID0gX3B1c2hVbmlxdWUocGF0aCwgcHJvcGVydHkpO1xuXHRcdFx0X2FwcGVuZFRlbXBsYXRlKGB7JHt2YWx1ZUluZGV4fX1gKTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHJlbGF0ZWRQcm9wZXJ0aWVzO1xufVxuXG4vKipcbiAqIENvbGxlY3QgcHJvcGVydGllcyBjb25zdW1lZCBieSBhIERhdGFGaWVsZC5cbiAqIFRoaXMgaXMgZm9yIHBvcHVsYXRpbmcgdGhlIENvbXBsZXhQcm9wZXJ0eUluZm9zIG9mIHRoZSB0YWJsZSBkZWxlZ2F0ZS5cbiAqXG4gKiBAcGFyYW0gZGF0YUZpZWxkIFRoZSBEYXRhRmllbGQgZm9yIHdoaWNoIHRoZSBwcm9wZXJ0aWVzIG5lZWQgdG8gYmUgaWRlbnRpZmllZC5cbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0IFRoZSBjb252ZXJ0ZXIgY29udGV4dC5cbiAqIEBwYXJhbSB0YWJsZVR5cGUgVGhlIHRhYmxlIHR5cGUuXG4gKiBAcGFyYW0gcmVsYXRlZFByb3BlcnRpZXMgVGhlIHByb3BlcnRpZXMgaWRlbnRpZmllZCBzbyBmYXIuXG4gKiBAcGFyYW0gaXNFbWJlZGRlZCBUcnVlIGlmIHRoZSBEYXRhRmllbGQgaXMgZW1iZWRkZWQgaW4gYW5vdGhlciBhbm5vdGF0aW9uIChlLmcuIEZpZWxkR3JvdXApLlxuICogQHJldHVybnMgVGhlIHByb3BlcnRpZXMgcmVsYXRlZCB0byB0aGUgRGF0YUZpZWxkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29sbGVjdFJlbGF0ZWRQcm9wZXJ0aWVzUmVjdXJzaXZlbHkoXG5cdGRhdGFGaWVsZDogRGF0YUZpZWxkQWJzdHJhY3RUeXBlcyxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0dGFibGVUeXBlOiBUYWJsZVR5cGUsXG5cdHJlbGF0ZWRQcm9wZXJ0aWVzOiBDb21wbGV4UHJvcGVydHlJbmZvID0geyBwcm9wZXJ0aWVzOiB7fSwgYWRkaXRpb25hbFByb3BlcnRpZXM6IHt9LCB0ZXh0T25seVByb3BlcnRpZXNGcm9tVGV4dEFubm90YXRpb246IFtdIH0sXG5cdGlzRW1iZWRkZWQ6IGJvb2xlYW4gPSBmYWxzZVxuKTogQ29tcGxleFByb3BlcnR5SW5mbyB7XG5cdGxldCBpc1N0YXRpY2FsbHlIaWRkZW4gPSBmYWxzZTtcblx0c3dpdGNoIChkYXRhRmllbGQ/LiRUeXBlKSB7XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGQ6XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoVXJsOlxuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aE5hdmlnYXRpb25QYXRoOlxuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aEludGVudEJhc2VkTmF2aWdhdGlvbjpcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhBY3Rpb246XG5cdFx0XHRpZiAoZGF0YUZpZWxkLlZhbHVlKSB7XG5cdFx0XHRcdGNvbnN0IHByb3BlcnR5ID0gZGF0YUZpZWxkLlZhbHVlO1xuXHRcdFx0XHRpc1N0YXRpY2FsbHlIaWRkZW4gPVxuXHRcdFx0XHRcdGlzUmVmZXJlbmNlUHJvcGVydHlTdGF0aWNhbGx5SGlkZGVuKHByb3BlcnR5LiR0YXJnZXQ/LmFubm90YXRpb25zPy5VST8uRGF0YUZpZWxkRGVmYXVsdCkgfHxcblx0XHRcdFx0XHRpc1JlZmVyZW5jZVByb3BlcnR5U3RhdGljYWxseUhpZGRlbihkYXRhRmllbGQpIHx8XG5cdFx0XHRcdFx0ZmFsc2U7XG5cdFx0XHRcdHJlbGF0ZWRQcm9wZXJ0aWVzID0gY29sbGVjdFJlbGF0ZWRQcm9wZXJ0aWVzKFxuXHRcdFx0XHRcdHByb3BlcnR5LnBhdGgsXG5cdFx0XHRcdFx0cHJvcGVydHkuJHRhcmdldCxcblx0XHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0LFxuXHRcdFx0XHRcdGZhbHNlLFxuXHRcdFx0XHRcdHRhYmxlVHlwZSxcblx0XHRcdFx0XHRyZWxhdGVkUHJvcGVydGllcyxcblx0XHRcdFx0XHRpc0VtYmVkZGVkLFxuXHRcdFx0XHRcdGlzU3RhdGljYWxseUhpZGRlblxuXHRcdFx0XHQpO1xuXHRcdFx0XHRjb25zdCBuYXZpZ2F0aW9uUGF0aFByZWZpeCA9IF9nZXROYXZpZ2F0aW9uUGF0aFByZWZpeChwcm9wZXJ0eS5wYXRoKTtcblx0XHRcdFx0cmVsYXRlZFByb3BlcnRpZXMgPSBfY29sbGVjdEFkZGl0aW9uYWxQcm9wZXJ0aWVzRm9yQW5hbHl0aWNhbFRhYmxlKFxuXHRcdFx0XHRcdGRhdGFGaWVsZCxcblx0XHRcdFx0XHRuYXZpZ2F0aW9uUGF0aFByZWZpeCxcblx0XHRcdFx0XHR0YWJsZVR5cGUsXG5cdFx0XHRcdFx0cmVsYXRlZFByb3BlcnRpZXNcblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHRcdGJyZWFrO1xuXG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBY3Rpb246XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb246XG5cdFx0XHRicmVhaztcblxuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQW5ub3RhdGlvbjpcblx0XHRcdHN3aXRjaCAoZGF0YUZpZWxkLlRhcmdldD8uJHRhcmdldD8uJFR5cGUpIHtcblx0XHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5GaWVsZEdyb3VwVHlwZTpcblx0XHRcdFx0XHRkYXRhRmllbGQuVGFyZ2V0LiR0YXJnZXQuRGF0YT8uZm9yRWFjaCgoaW5uZXJEYXRhRmllbGQ6IERhdGFGaWVsZEFic3RyYWN0VHlwZXMpID0+IHtcblx0XHRcdFx0XHRcdHJlbGF0ZWRQcm9wZXJ0aWVzID0gY29sbGVjdFJlbGF0ZWRQcm9wZXJ0aWVzUmVjdXJzaXZlbHkoXG5cdFx0XHRcdFx0XHRcdGlubmVyRGF0YUZpZWxkLFxuXHRcdFx0XHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0LFxuXHRcdFx0XHRcdFx0XHR0YWJsZVR5cGUsXG5cdFx0XHRcdFx0XHRcdHJlbGF0ZWRQcm9wZXJ0aWVzLFxuXHRcdFx0XHRcdFx0XHR0cnVlXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YVBvaW50VHlwZTpcblx0XHRcdFx0XHRpc1N0YXRpY2FsbHlIaWRkZW4gPSBpc1JlZmVyZW5jZVByb3BlcnR5U3RhdGljYWxseUhpZGRlbihkYXRhRmllbGQpID8/IGZhbHNlO1xuXHRcdFx0XHRcdHJlbGF0ZWRQcm9wZXJ0aWVzID0gY29sbGVjdFJlbGF0ZWRQcm9wZXJ0aWVzKFxuXHRcdFx0XHRcdFx0ZGF0YUZpZWxkLlRhcmdldC4kdGFyZ2V0LlZhbHVlLnBhdGgsXG5cdFx0XHRcdFx0XHRkYXRhRmllbGQsXG5cdFx0XHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0LFxuXHRcdFx0XHRcdFx0ZmFsc2UsXG5cdFx0XHRcdFx0XHR0YWJsZVR5cGUsXG5cdFx0XHRcdFx0XHRyZWxhdGVkUHJvcGVydGllcyxcblx0XHRcdFx0XHRcdGlzRW1iZWRkZWQsXG5cdFx0XHRcdFx0XHRpc1N0YXRpY2FsbHlIaWRkZW5cblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdGNhc2UgQ29tbXVuaWNhdGlvbkFubm90YXRpb25UeXBlcy5Db250YWN0VHlwZTpcblx0XHRcdFx0XHRjb25zdCBkYXRhRmllbGRDb250YWN0ID0gZGF0YUZpZWxkLlRhcmdldC4kdGFyZ2V0IGFzIENvbnRhY3Q7XG5cdFx0XHRcdFx0aXNTdGF0aWNhbGx5SGlkZGVuID0gaXNSZWZlcmVuY2VQcm9wZXJ0eVN0YXRpY2FsbHlIaWRkZW4oZGF0YUZpZWxkKSA/PyBmYWxzZTtcblx0XHRcdFx0XHRyZWxhdGVkUHJvcGVydGllcyA9IGNvbGxlY3RSZWxhdGVkUHJvcGVydGllcyhcblx0XHRcdFx0XHRcdGRhdGFGaWVsZC5UYXJnZXQudmFsdWUsXG5cdFx0XHRcdFx0XHRkYXRhRmllbGRDb250YWN0LFxuXHRcdFx0XHRcdFx0Y29udmVydGVyQ29udGV4dCxcblx0XHRcdFx0XHRcdGlzU3RhdGljYWxseUhpZGRlbixcblx0XHRcdFx0XHRcdHRhYmxlVHlwZSxcblx0XHRcdFx0XHRcdHJlbGF0ZWRQcm9wZXJ0aWVzLFxuXHRcdFx0XHRcdFx0aXNFbWJlZGRlZCxcblx0XHRcdFx0XHRcdGlzU3RhdGljYWxseUhpZGRlblxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0XHRicmVhaztcblxuXHRcdGRlZmF1bHQ6XG5cdFx0XHRicmVhaztcblx0fVxuXG5cdHJldHVybiByZWxhdGVkUHJvcGVydGllcztcbn1cblxuZXhwb3J0IGNvbnN0IGdldERhdGFGaWVsZERhdGFUeXBlID0gZnVuY3Rpb24gKG9EYXRhRmllbGQ6IERhdGFGaWVsZEFic3RyYWN0VHlwZXMgfCBQcm9wZXJ0eSk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG5cdGxldCBzRGF0YVR5cGU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IChvRGF0YUZpZWxkIGFzIERhdGFGaWVsZEFic3RyYWN0VHlwZXMpLiRUeXBlO1xuXHRzd2l0Y2ggKHNEYXRhVHlwZSkge1xuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQWN0aW9uOlxuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uOlxuXHRcdFx0c0RhdGFUeXBlID0gdW5kZWZpbmVkO1xuXHRcdFx0YnJlYWs7XG5cblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZDpcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhOYXZpZ2F0aW9uUGF0aDpcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhVcmw6XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoSW50ZW50QmFzZWROYXZpZ2F0aW9uOlxuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aEFjdGlvbjpcblx0XHRcdHNEYXRhVHlwZSA9IChvRGF0YUZpZWxkIGFzIERhdGFGaWVsZCk/LlZhbHVlPy4kdGFyZ2V0Py50eXBlO1xuXHRcdFx0YnJlYWs7XG5cblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFubm90YXRpb246XG5cdFx0ZGVmYXVsdDpcblx0XHRcdGNvbnN0IHNEYXRhVHlwZUZvckRhdGFGaWVsZEZvckFubm90YXRpb24gPSAob0RhdGFGaWVsZCBhcyBEYXRhRmllbGRGb3JBbm5vdGF0aW9uKS5UYXJnZXQ/LiR0YXJnZXQ/LiRUeXBlO1xuXHRcdFx0aWYgKHNEYXRhVHlwZUZvckRhdGFGaWVsZEZvckFubm90YXRpb24pIHtcblx0XHRcdFx0aWYgKChvRGF0YUZpZWxkIGFzIERhdGFGaWVsZEZvckFubm90YXRpb24pLlRhcmdldD8uJHRhcmdldC4kVHlwZSA9PT0gQ29tbXVuaWNhdGlvbkFubm90YXRpb25UeXBlcy5Db250YWN0VHlwZSkge1xuXHRcdFx0XHRcdHNEYXRhVHlwZSA9ICgoKG9EYXRhRmllbGQgYXMgRGF0YUZpZWxkRm9yQW5ub3RhdGlvbikuVGFyZ2V0Py4kdGFyZ2V0IGFzIENvbnRhY3QpPy5mbiBhcyBhbnkpLiR0YXJnZXQ/LnR5cGU7XG5cdFx0XHRcdH0gZWxzZSBpZiAoKG9EYXRhRmllbGQgYXMgRGF0YUZpZWxkRm9yQW5ub3RhdGlvbikuVGFyZ2V0Py4kdGFyZ2V0LiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhUG9pbnRUeXBlKSB7XG5cdFx0XHRcdFx0c0RhdGFUeXBlID1cblx0XHRcdFx0XHRcdCgob0RhdGFGaWVsZCBhcyBEYXRhRmllbGRGb3JBbm5vdGF0aW9uKS5UYXJnZXQ/LiR0YXJnZXQgYXMgRGF0YVBvaW50KT8uVmFsdWU/LiRQYXRoPy4kVHlwZSB8fFxuXHRcdFx0XHRcdFx0KChvRGF0YUZpZWxkIGFzIERhdGFGaWVsZEZvckFubm90YXRpb24pLlRhcmdldD8uJHRhcmdldCBhcyBEYXRhUG9pbnQpPy5WYWx1ZT8uJHRhcmdldC50eXBlO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIGUuZy4gRmllbGRHcm91cCBvciBDaGFydFxuXHRcdFx0XHRcdC8vIEZpZWxkR3JvdXAgUHJvcGVydGllcyBoYXZlIG5vIHR5cGUsIHNvIHdlIGRlZmluZSBpdCBhcyBhIGJvb2xlYW4gdHlwZSB0byBwcmV2ZW50IGV4Y2VwdGlvbnMgZHVyaW5nIHRoZSBjYWxjdWxhdGlvbiBvZiB0aGUgd2lkdGhcblx0XHRcdFx0XHRzRGF0YVR5cGUgPVxuXHRcdFx0XHRcdFx0KG9EYXRhRmllbGQgYXMgRGF0YUZpZWxkRm9yQW5ub3RhdGlvbikuVGFyZ2V0Py4kdGFyZ2V0LiRUeXBlID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0RGVmaW5pdGlvblR5cGVcIlxuXHRcdFx0XHRcdFx0XHQ/IHVuZGVmaW5lZFxuXHRcdFx0XHRcdFx0XHQ6IFwiRWRtLkJvb2xlYW5cIjtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c0RhdGFUeXBlID0gdW5kZWZpbmVkO1xuXHRcdFx0fVxuXHRcdFx0YnJlYWs7XG5cdH1cblxuXHRyZXR1cm4gc0RhdGFUeXBlO1xufTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7O0VBdUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ08sU0FBU0EsNEJBQTRCLENBQUNDLFNBQWlDLEVBQWdEO0lBQzdILE9BQVFBLFNBQVMsQ0FBcUNDLGNBQWMsQ0FBQyxRQUFRLENBQUM7RUFDL0U7O0VBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFOQTtFQU9PLFNBQVNDLGdCQUFnQixDQUFDRixTQUFpQyxFQUErQjtJQUNoRyxPQUFRQSxTQUFTLENBQW9CQyxjQUFjLENBQUMsT0FBTyxDQUFDO0VBQzdEOztFQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUxBO0VBT08sU0FBU0UseUJBQXlCLENBQUNDLE1BQWdDLEVBQXlCO0lBQ2xHLElBQUlDLFdBQTJDO0lBQy9DLElBQUlDLFVBQVUsQ0FBQ0YsTUFBTSxDQUFDLEVBQUU7TUFBQTtNQUN2QkMsV0FBVyxHQUNWLHdCQUFFRCxNQUFNLENBQUNHLFdBQVcsaUZBQWxCLG9CQUFvQkMsRUFBRSxvRkFBdEIsc0JBQXdCQyxnQkFBZ0IscUZBQXpDLHVCQUEyRUMsTUFBTSxxRkFBakYsdUJBQW1GQyxPQUFPLDJEQUEzRix1QkFBK0dDLFdBQVcsOEJBQ3hIUixNQUFNLENBQUNHLFdBQVcsa0ZBQWxCLHFCQUFvQkMsRUFBRSxvRkFBdEIsc0JBQXdCQyxnQkFBZ0IscUZBQXpDLHVCQUEyRUMsTUFBTSxxRkFBakYsdUJBQW1GQyxPQUFPLDJEQUEzRix1QkFBK0dFLFlBQVk7SUFDN0gsQ0FBQyxNQUFNO01BQ05SLFdBQVcsR0FBR0QsTUFBTSxDQUFDUSxXQUFXLElBQUlSLE1BQU0sQ0FBQ1MsWUFBWTtJQUN4RDtJQUNBLElBQUksT0FBT1IsV0FBVyxLQUFLLFFB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