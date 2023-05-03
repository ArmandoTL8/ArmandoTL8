/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/converters/helpers/BindingHelper", "sap/fe/core/converters/helpers/Key", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/SideEffectsHelper", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/templating/FieldControlHelper", "sap/fe/core/templating/PropertyHelper", "sap/fe/core/templating/UIFormatters", "sap/fe/macros/CommonHelper", "sap/fe/macros/internal/valuehelp/ValueListHelper", "sap/fe/macros/ResourceModel", "sap/ui/base/ManagedObject", "sap/ui/core/format/DateFormat", "sap/ui/model/json/JSONModel", "sap/ui/model/odata/v4/AnnotationHelper"], function (Log, CommonUtils, BindingHelper, Key, BindingToolkit, ModelHelper, SideEffectsHelper, StableIdHelper, FieldControlHelper, PropertyHelper, UIFormatters, CommonHelper, ValueListHelper, ResourceModel, ManagedObject, DateFormat, JSONModel, AnnotationHelper) {
  "use strict";

  var getAlignmentExpression = UIFormatters.getAlignmentExpression;
  var isProperty = PropertyHelper.isProperty;
  var isRequiredExpression = FieldControlHelper.isRequiredExpression;
  var generate = StableIdHelper.generate;
  var pathInModel = BindingToolkit.pathInModel;
  var or = BindingToolkit.or;
  var ifElse = BindingToolkit.ifElse;
  var equal = BindingToolkit.equal;
  var constant = BindingToolkit.constant;
  var compileExpression = BindingToolkit.compileExpression;
  var KeyHelper = Key.KeyHelper;
  var UI = BindingHelper.UI;
  const ISOCurrency = "@Org.OData.Measures.V1.ISOCurrency",
    Unit = "@Org.OData.Measures.V1.Unit";

  /**
   * What does the map look like?
   *    {
   *  	'namespace.of.entityType' : [
   * 			[namespace.of.entityType1#Qualifier,namespace.of.entityType2#Qualifier], --> Search For: mappingSourceEntities
   * 			{
   * 				'property' : [namespace.of.entityType3#Qualifier,namespace.of.entityType4#Qualifier] --> Search For: mappingSourceProperties
   * 			}
   * 	}.
   *
   * @param oInterface Interface instance
   * @returns Promise resolved when the map is ready and provides the map
   */
  async function _generateSideEffectsMap(oInterface) {
    const oMetaModel = oInterface.getModel();
    const oFieldSettings = oInterface.getSetting("sap.fe.macros.internal.Field");
    const oSideEffects = oFieldSettings.sideEffects;

    // Generate map once
    if (oSideEffects) {
      return oSideEffects;
    }
    return SideEffectsHelper.generateSideEffectsMapFromMetaModel(oMetaModel);
  }
  const FieldHelper = {
    /**
     * Determine how to show the value by analyzing Text and TextArrangement Annotations.
     *
     * @function
     * @name sap.fe.macros.field.FieldHelper#displayMode
     * @memberof sap.fe.macros.field.FieldHelper
     * @static
     * @param oPropertyAnnotations The Property annotations
     * @param oCollectionAnnotations The EntityType annotations
     * @returns The display mode of the field
     * @private
     * @ui5-restricted
     */
    displayMode: function (oPropertyAnnotations, oCollectionAnnotations) {
      const oTextAnnotation = oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"],
        oTextArrangementAnnotation = oTextAnnotation && (oPropertyAnnotations && oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement"] || oCollectionAnnotations && oCollectionAnnotations["@com.sap.vocabularies.UI.v1.TextArrangement"]);
      if (oTextArrangementAnnotation) {
        if (oTextArrangementAnnotation.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly") {
          return "Description";
        } else if (oTextArrangementAnnotation.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextLast") {
          return "ValueDescription";
        }
        //Default should be TextFirst if there is a Text annotation and neither TextOnly nor TextLast are set
        return "DescriptionValue";
      }
      return oTextAnnotation ? "DescriptionValue" : "Value";
    },
    buildExpressionForTextValue: function (sPropertyPath, oDataField) {
      const oMetaModel = oDataField.context.getModel();
      const sPath = oDataField.context.getPath();
      const oTextAnnotationContext = oMetaModel.createBindingContext(`${sPath}@com.sap.vocabularies.Common.v1.Text`);
      const oTextAnnotation = oTextAnnotationContext.getProperty();
      const sTextExpression = oTextAnnotation ? AnnotationHelper.value(oTextAnnotation, {
        context: oTextAnnotationContext
      }) : undefined;
      let sExpression = "";
      sPropertyPath = AnnotationHelper.getNavigationPath(sPropertyPath);
      if (sPropertyPath.indexOf("/") > -1 && sTextExpression) {
        sExpression = sPropertyPath.replace(/[^\/]*$/, sTextExpression.substr(1, sTextExpression.length - 2));
      } else {
        sExpression = sTextExpression;
      }
      if (sExpression) {
        sExpression = "{ path : '" + sExpression.replace(/^\{+/g, "").replace(/\}+$/g, "") + "', parameters: {'$$noPatch': true}}";
      }
      return sExpression;
    },
    buildTargetPathFromDataModelObjectPath: function (oDataModelObjectPath) {
      const sSartEntitySet = oDataModelObjectPath.startingEntitySet.name;
      let sPath = `/${sSartEntitySet}`;
      const aNavigationProperties = oDataModelObjectPath.navigationProperties;
      for (let i = 0; i < aNavigationProperties.length; i++) {
        sPath += `/${aNavigationProperties[i].name}`;
      }
      return sPath;
    },
    hasSemanticObjectTargets: function (oPropertyDataModelObjectPath) {
      var _oPropertyDefinition$, _oPropertyDefinition$2, _oPropertyDefinition$3, _oPropertyDefinition$4, _sSemanticObject$valu;
      const oPropertyDefinition = isProperty(oPropertyDataModelObjectPath.targetObject) ? oPropertyDataModelObjectPath.targetObject : oPropertyDataModelObjectPath.targetObject.$target;
      const sSemanticObject = (_oPropertyDefinition$ = oPropertyDefinition.annotations) === null || _oPropertyDefinition$ === void 0 ? void 0 : (_oPropertyDefinition$2 = _oPropertyDefinition$.Common) === null || _oPropertyDefinition$2 === void 0 ? void 0 : _oPropertyDefinition$2.SemanticObject;
      const aSemanticObjectUnavailableActions = (_oPropertyDefinition$3 = oPropertyDefinition.annotations) === null || _oPropertyDefinition$3 === void 0 ? void 0 : (_oPropertyDefinition$4 = _oPropertyDefinition$3.Common) === null || _oPropertyDefinition$4 === void 0 ? void 0 : _oPropertyDefinition$4.SemanticObjectUnavailableActions;
      const sPropertyLocationPath = FieldHelper.buildTargetPathFromDataModelObjectPath(oPropertyDataModelObjectPath);
      const sPropertyPath = `${sPropertyLocationPath}/${oPropertyDefinition.name}`;
      let sBindingExpression;
      if (sSemanticObject !== null && sSemanticObject !== void 0 && sSemanticObject.path) {
        sBindingExpression = compileExpression(pathInModel(sSemanticObject.path));
      }
      if (sPropertyPath && (sBindingExpression || (sSemanticObject === null || sSemanticObject === void 0 ? void 0 : (_sSemanticObject$valu = sSemanticObject.valueOf()) === null || _sSemanticObject$valu === void 0 ? void 0 : _sSemanticObject$valu.length) > 0)) {
        const sAlternatePath = sPropertyPath.replace(/\//g, "_"); //replaceAll("/","_");
        if (!sBindingExpression) {
          const sBindingPath = "pageInternal>semanticsTargets/" + (sSemanticObject === null || sSemanticObject === void 0 ? void 0 : sSemanticObject.valueOf()) + "/" + sAlternatePath + (!aSemanticObjectUnavailableActions ? "/HasTargetsNotFiltered" : "/HasTargets");
          return "{parts:[{path:'" + sBindingPath + "'}], formatter:'FieldRuntime.hasTargets'}";
        } else {
          // Semantic Object Name is a path we return undefined
          // this will be updated later via modelContextChange
          return undefined;
        }
      } else {
        return false;
      }
    },
    getStateDependingOnSemanticObjectTargets: function (oPropertyDataModelObjectPath) {
      var _oPropertyDefinition$5, _oPropertyDefinition$6, _oPropertyDefinition$7, _oPropertyDefinition$8, _sSemanticObject$valu2;
      const oPropertyDefinition = isProperty(oPropertyDataModelObjectPath.targetObject) ? oPropertyDataModelObjectPath.targetObject : oPropertyDataModelObjectPath.targetObject.$target;
      const sSemanticObject = (_oPropertyDefinition$5 = oPropertyDefinition.annotations) === null || _oPropertyDefinition$5 === void 0 ? void 0 : (_oPropertyDefinition$6 = _oPropertyDefinition$5.Common) === null || _oPropertyDefinition$6 === void 0 ? void 0 : _oPropertyDefinition$6.SemanticObject;
      const aSemanticObjectUnavailableActions = (_oPropertyDefinition$7 = oPropertyDefinition.annotations) === null || _oPropertyDefinition$7 === void 0 ? void 0 : (_oPropertyDefinition$8 = _oPropertyDefinition$7.Common) === null || _oPropertyDefinition$8 === void 0 ? void 0 : _oPropertyDefinition$8.SemanticObjectUnavailableActions;
      const sPropertyLocationPath = FieldHelper.buildTargetPathFromDataModelObjectPath(oPropertyDataModelObjectPath);
      const sPropertyPath = `${sPropertyLocationPath}/${oPropertyDefinition.name}`;
      let sBindingExpression;
      if (sSemanticObject !== null && sSemanticObject !== void 0 && sSemanticObject.path) {
        sBindingExpression = compileExpression(pathInModel(sSemanticObject.path));
      }
      if (sPropertyPath && (sBindingExpression || (sSemanticObject === null || sSemanticObject === void 0 ? void 0 : (_sSemanticObject$valu2 = sSemanticObject.valueOf()) === null || _sSemanticObject$valu2 === void 0 ? void 0 : _sSemanticObject$valu2.length) > 0)) {
        const sAlternatePath = sPropertyPath.replace(/\//g, "_");
        if (!sBindingExpression) {
          const sBindingPath = `pageInternal>semanticsTargets/${sSemanticObject === null || sSemanticObject === void 0 ? void 0 : sSemanticObject.valueOf()}/${sAlternatePath}${!aSemanticObjectUnavailableActions ? "/HasTargetsNotFiltered" : "/HasTargets"}`;
          return `{parts:[{path:'${sBindingPath}'}], formatter:'FieldRuntime.getStateDependingOnSemanticObjectTargets'}`;
        } else {
          return "Information";
        }
      } else {
        return "None";
      }
    },
    isNotAlwaysHidden: function (oDataField, oDetails) {
      const oContext = oDetails.context;
      let isAlwaysHidden = false;
      if (oDataField.Value && oDataField.Value.$Path) {
        isAlwaysHidden = oContext.getObject("Value/$Path@com.sap.vocabularies.UI.v1.Hidden");
      }
      if (!isAlwaysHidden || isAlwaysHidden.$Path) {
        isAlwaysHidden = oContext.getObject("@com.sap.vocabularies.UI.v1.Hidden");
        if (!isAlwaysHidden || isAlwaysHidden.$Path) {
          isAlwaysHidden = false;
        }
      }
      return !isAlwaysHidden;
    },
    isDraftIndicatorVisibleInFieldGroup: function (column) {
      if (column && column.formatOptions && column.formatOptions.fieldGroupDraftIndicatorPropertyPath && column.formatOptions.fieldGroupName) {
        return "{parts: [" + "{value: '" + column.formatOptions.fieldGroupName + "'}," + "{path: 'internal>semanticKeyHasDraftIndicator'} , " + "{path: 'HasDraftEntity', targetType: 'any'}, " + "{path: 'IsActiveEntity', targetType: 'any'}, " + "{path: 'pageInternal>hideDraftInfo', targetType: 'any'}], " + "formatter: 'sap.fe.macros.field.FieldRuntime.isDraftIndicatorVisible'}";
      } else {
        return false;
      }
    },
    isRequired: function (oFieldControl, sEditMode) {
      if (sEditMode === "Display" || sEditMode === "ReadOnly" || sEditMode === "Disabled") {
        return false;
      }
      if (oFieldControl) {
        if (ManagedObject.bindingParser(oFieldControl)) {
          return "{= %" + oFieldControl + " === 7}";
        } else {
          return oFieldControl == "com.sap.vocabularies.Common.v1.FieldControlType/Mandatory";
        }
      }
      return false;
    },
    getActionParameterVisibility: function (oParam, oContext) {
      // To use the UI.Hidden annotation for controlling visibility the value needs to be negated
      if (typeof oParam === "object") {
        if (oParam && oParam.$If && oParam.$If.length === 3) {
          // In case the UI.Hidden contains a dynamic expression we do this
          // by just switching the "then" and "else" part of the erpression
          // oParam.$If[0] <== Condition part
          // oParam.$If[1] <== Then part
          // oParam.$If[2] <== Else part
          const oNegParam = {
            $If: []
          };
          oNegParam.$If[0] = oParam.$If[0];
          oNegParam.$If[1] = oParam.$If[2];
          oNegParam.$If[2] = oParam.$If[1];
          return AnnotationHelper.value(oNegParam, oContext);
        } else {
          return "{= !%{" + oParam.$Path + "} }";
        }
      } else if (typeof oParam === "boolean") {
        return AnnotationHelper.value(!oParam, oContext);
      } else {
        return undefined;
      }
    },
    /**
     * Computed annotation that returns vProperty for a string and @sapui.name for an object.
     *
     * @param vProperty The property
     * @param oInterface The interface instance
     * @returns The property name
     */
    propertyName: function (vProperty, oInterface) {
      let sPropertyName;
      if (typeof vProperty === "string") {
        if (oInterface.context.getPath().indexOf("$Path") > -1 || oInterface.context.getPath().indexOf("$PropertyPath") > -1) {
          // We could end up with a pure string property (no $Path), and this is not a real property in that case
          sPropertyName = vProperty;
        }
      } else if (vProperty.$Path || vProperty.$PropertyPath) {
        const sPath = vProperty.$Path ? "/$Path" : "/$PropertyPath";
        const sContextPath = oInterface.context.getPath();
        sPropertyName = oInterface.context.getObject(`${sContextPath + sPath}/$@sapui.name`);
      } else if (vProperty.Value && vProperty.Value.$Path) {
        sPropertyName = vProperty.Value.$Path;
      } else {
        sPropertyName = oInterface.context.getObject("@sapui.name");
      }
      return sPropertyName;
    },
    /**
     * This method getFieldGroupIDs uses a map stored in preprocessing data for the macro Field
     * _generateSideEffectsMap generates this map once during templating for the first macro field
     * and then reuses it. Map exists only during templating.
     * The map is used to set the field group IDs for the macro field.
     * A field group ID has the format -- namespace.of.entityType#Qualifier
     * where 'namespace.of.entityType' is the target entity type of the side effect annotation
     * and 'Qualifier' is the qualififer of the side effect annotation.
     * This information is enough to identify the side effect annotation.
     *
     * @param oContext Context instance
     * @param sPropertyPath Property path
     * @returns A promise which provides a string of field group IDs separated by a comma
     */
    getFieldGroupIds: function (oContext, sPropertyPath) {
      if (!sPropertyPath) {
        return undefined;
      }
      const oInterface = oContext.getInterface(0);
      // generate the mapping for side effects or get the generated map if it is already generated
      return _generateSideEffectsMap(oInterface).then(function (oSideEffects) {
        const oFieldSettings = oInterface.getSetting("sap.fe.macros.internal.Field");
        oFieldSettings.sideEffects = oSideEffects;
        const sOwnerEntityType = oContext.getPath(1).substr(1);
        const aFieldGroupIds = FieldHelper.getSideEffectsOnEntityAndProperty(sPropertyPath, sOwnerEntityType, oSideEffects);
        let sFieldGroupIds;
        if (aFieldGroupIds.length) {
          sFieldGroupIds = aFieldGroupIds.reduce(function (sResult, sId) {
            return sResult && `${sResult},${sId}` || sId;
          });
        }
        return sFieldGroupIds; //"ID1,ID2,ID3..."
      });
    },

    /**
     * Generate map which has data from source entity as well as source property for a given field.
     *
     * @param sPath
     * @param sOwnerEntityType
     * @param oSideEffects
     * @returns An array of side Effect Ids.
     */
    getSideEffectsOnEntityAndProperty: function (sPath, sOwnerEntityType, oSideEffects) {
      const bIsNavigationPath = sPath.indexOf("/") > 0;
      sPath = bIsNavigationPath ? sPath.substr(sPath.lastIndexOf("/") + 1) : sPath;
      // add to fieldGroupIds, all side effects which mention sPath as source property or sOwnerEntityType as source entity
      return oSideEffects[sOwnerEntityType] && oSideEffects[sOwnerEntityType][0].concat(oSideEffects[sOwnerEntityType][1][sPath] || []) || [];
    },
    fieldControl: function (sPropertyPath, oInterface) {
      const oModel = oInterface && oInterface.context.getModel();
      const sPath = oInterface && oInterface.context.getPath();
      const oFieldControlContext = oModel && oModel.createBindingContext(`${sPath}@com.sap.vocabularies.Common.v1.FieldControl`);
      const oFieldControl = oFieldControlContext && oFieldControlContext.getProperty();
      if (oFieldControl) {
        if (oFieldControl.hasOwnProperty("$EnumMember")) {
          return oFieldControl.$EnumMember;
        } else if (oFieldControl.hasOwnProperty("$Path")) {
          return AnnotationHelper.value(oFieldControl, {
            context: oFieldControlContext
          });
        }
      } else {
        return undefined;
      }
    },
    /**
     * Method to get the value help property from a DataField or a PropertyPath (in case a SelectionField is used)
     * Priority from where to get the property value of the field (examples are "Name" and "Supplier"):
     * 1. If oPropertyContext.getObject() has key '$Path', then we take the value at '$Path'.
     * 2. Else, value at oPropertyContext.getObject().
     * If there is an ISOCurrency or if there are Unit annotations for the field property,
     * then the Path at the ISOCurrency or Unit annotations of the field property is considered.
     *
     * @memberof sap.fe.macros.field.FieldHelper.js
     * @param oPropertyContext The context from which value help property need to be extracted.
     * @param bInFilterField Whether or not we're in the filter field and should ignore
     * @returns The value help property path
     */
    valueHelpProperty: function (oPropertyContext, bInFilterField) {
      /* For currency (and later Unit) we need to forward the value help to the annotated field */
      const sContextPath = oPropertyContext.getPath();
      const oContent = oPropertyContext.getObject() || {};
      let sPath = oContent.$Path ? `${sContextPath}/$Path` : sContextPath;
      const sAnnoPath = `${sPath}@`;
      const oPropertyAnnotations = oPropertyContext.getObject(sAnnoPath);
      let sAnnotation;
      if (oPropertyAnnotations) {
        sAnnotation = oPropertyAnnotations.hasOwnProperty(ISOCurrency) && ISOCurrency || oPropertyAnnotations.hasOwnProperty(Unit) && Unit;
        if (sAnnotation && !bInFilterField) {
          const sUnitOrCurrencyPath = `${sPath + sAnnotation}/$Path`;
          // we check that the currency or unit is a Property and not a fixed value
          if (oPropertyContext.getObject(sUnitOrCurrencyPath)) {
            sPath = sUnitOrCurrencyPath;
          }
        }
      }
      return sPath;
    },
    /**
     * Dedicated method to avoid looking for unit properties.
     *
     * @param oPropertyContext
     * @returns The value help property path
     */
    valueHelpPropertyForFilterField: function (oPropertyContext) {
      return FieldHelper.valueHelpProperty(oPropertyContext, true);
    },
    /**
     * Method to generate the ID for Value Help.
     *
     * @function
     * @name getIDForFieldValueHelp
     * @memberof sap.fe.macros.field.FieldHelper.js
     * @param sFlexId Flex ID of the current object
     * @param sIdPrefix Prefix for the ValueHelp ID
     * @param sOriginalPropertyName Name of the property
     * @param sPropertyName Name of the ValueHelp Property
     * @returns The ID generated for the ValueHelp
     */
    getIDForFieldValueHelp: function (sFlexId, sIdPrefix, sOriginalPropertyName, sPropertyName) {
      if (sFlexId) {
        return sFlexId;
      }
      let sProperty = sPropertyName;
      if (sOriginalPropertyName !== sPropertyName) {
        sProperty = `${sOriginalPropertyName}::${sPropertyName}`;
      }
      return generate([sIdPrefix, sProperty]);
    },
    /**
     * Method to get the fieldHelp property of the FilterField.
     *
     * @function
     * @name getFieldHelpPropertyForFilterField
     * @memberof sap.fe.macros.field.FieldHelper.js
     * @param propertyContext Property context for filter field
     * @param oProperty The object of the FieldHelp property
     * @param sPropertyType The $Type of the property
     * @param sVhIdPrefix The ID prefix of the value help
     * @param sPropertyName The name of the property
     * @param sValueHelpPropertyName The property name of the value help
     * @param bHasValueListWithFixedValues `true` if there is a value list with a fixed value annotation
     * @param bUseSemanticDateRange `true` if the semantic date range is set to 'true' in the manifest
     * @returns The field help property of the value help
     */
    getFieldHelpPropertyForFilterField: function (propertyContext, oProperty, sPropertyType, sVhIdPrefix, sPropertyName, sValueHelpPropertyName, bHasValueListWithFixedValues, bUseSemanticDateRange) {
      const sProperty = FieldHelper.propertyName(oProperty, {
          context: propertyContext
        }),
        bSemanticDateRange = bUseSemanticDateRange === "true" || bUseSemanticDateRange === true;
      const oModel = propertyContext.getModel(),
        sPropertyPath = propertyContext.getPath(),
        sPropertyLocationPath = CommonHelper.getLocationForPropertyPath(oModel, sPropertyPath),
        oFilterRestrictions = CommonUtils.getFilterRestrictionsByPath(sPropertyLocationPath, oModel);
      if ((sPropertyType === "Edm.DateTimeOffset" || sPropertyType === "Edm.Date") && bSemanticDateRange && oFilterRestrictions && oFilterRestrictions.FilterAllowedExpressions && oFilterRestrictions.FilterAllowedExpressions[sProperty] && (oFilterRestrictions.FilterAllowedExpressions[sProperty].indexOf("SingleRange") !== -1 || oFilterRestrictions.FilterAllowedExpressions[sProperty].indexOf("SingleValue") !== -1) || sPropertyType === "Edm.Boolean" && !bHasValueListWithFixedValues) {
        return undefined;
      }
      return FieldHelper.getIDForFieldValueHelp(null, sVhIdPrefix || "FilterFieldValueHelp", sPropertyName, sValueHelpPropertyName);
    },
    /**
     * Method to get semantic key title
     *
     * @function
     * @name getSemanticKeyTitle
     * @memberof sap.fe.macros.field.FieldHelper.js
     * @param {string} sPropertyTextValue String containing the binding of text associated to the property
     * @param {string} sPropertyValue String containing the binding of a property
     * @param {string} sDataField String containing the name of a data field
     * @param {object} oTextArrangement Object containing the text arrangement
     * @param {string} sSemanticKeyStyle enum containing the style of the semantic key
     * @param {object} oDraftRoot Draft root object
     * @returns {string} - Binding that resolves to the title of the semantic key
     */

    getSemanticKeyTitle: function (sPropertyTextValue, sPropertyValue, sDataField, oTextArrangement, sSemanticKeyStyle, oDraftRoot) {
      const sNewObject = ResourceModel.getText("T_NEW_OBJECT");
      const sUnnamedObject = ResourceModel.getText("T_ANNOTATION_HELPER_DEFAULT_OBJECT_PAGE_HEADER_TITLE_NO_HEADER_INFO");
      let sNewObjectExpression, sUnnnamedObjectExpression;
      let sSemanticKeyTitleExpression;
      const addNewObjectUnNamedObjectExpression = function (sValue) {
        sNewObjectExpression = "($" + sValue + " === '' || $" + sValue + " === undefined || $" + sValue + " === null ? '" + sNewObject + "': $" + sValue + ")";
        sUnnnamedObjectExpression = "($" + sValue + " === '' || $" + sValue + " === undefined || $" + sValue + " === null ? '" + sUnnamedObject + "': $" + sValue + ")";
        return "(!%{IsActiveEntity} ? !%{HasActiveEntity} ? " + sNewObjectExpression + " : " + sUnnnamedObjectExpression + " : " + sUnnnamedObjectExpression + ")";
      };
      const buildExpressionForSemantickKeyTitle = function (sValue, bIsExpressionBinding) {
        let sExpression;
        if (oDraftRoot) {
          //check if it is draft root so that we can add NewObject and UnnamedObject feature
          sExpression = addNewObjectUnNamedObjectExpression(sValue);
          return bIsExpressionBinding ? "{= " + sExpression + "}" : sExpression;
        } else {
          return bIsExpressionBinding ? sValue : "$" + sValue;
        }
      };
      if (sPropertyTextValue) {
        // check for text association
        if (oTextArrangement && sSemanticKeyStyle !== "ObjectIdentifier") {
          // check if text arrangement is present and table type is GridTable
          const sTextArrangement = oTextArrangement.$EnumMember;
          if (sTextArrangement === "com.sap.vocabularies.UI.v1.TextArrangementType/TextFirst") {
            // Eg: English (EN)
            sSemanticKeyTitleExpression = buildExpressionForSemantickKeyTitle(sPropertyTextValue, false);
            return "{= " + sSemanticKeyTitleExpression + " +' (' + " + "($" + sPropertyValue + (sDataField ? " || ${" + sDataField + "}" : "") + ") +')' }";
          } else if (sTextArrangement === "com.sap.vocabularies.UI.v1.TextArrangementType/TextLast") {
            // Eg: EN (English)
            sSemanticKeyTitleExpression = buildExpressionForSemantickKeyTitle(sPropertyTextValue, false);
            return "{= ($" + sPropertyValue + (sDataField ? " || ${" + sDataField + "}" : "") + ")" + " + ' (' + " + sSemanticKeyTitleExpression + " +')' }";
          } else {
            // for a Grid table when text is available and text arrangement is TextOnly or TextSeperate or no text arrangement then we return Text
            return buildExpressionForSemantickKeyTitle(sPropertyTextValue, true);
          }
        } else {
          return buildExpressionForSemantickKeyTitle(sPropertyTextValue, true);
        }
      } else {
        // if there is no text association then we return the property value
        return buildExpressionForSemantickKeyTitle(sPropertyValue, true);
      }
    },
    getObjectIdentifierText: function (oTextAnnotation, oTextArrangementAnnotation, sPropertyValueBinding, sDataFieldName) {
      if (oTextAnnotation) {
        // There is a text annotation. In this case, the ObjectIdentifier shows:
        //  - the *text* as the ObjectIdentifier's title
        //  - the *value* as the ObjectIdentifier's text
        //
        // So if the TextArrangement is #TextOnly or #TextSeparate, do not set the ObjectIdentifier's text
        // property
        if (oTextArrangementAnnotation && (oTextArrangementAnnotation.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly" || oTextArrangementAnnotation.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextSeparate" || oTextArrangementAnnotation.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextFirst")) {
          return undefined;
        } else {
          return sPropertyValueBinding || `{${sDataFieldName}}`;
        }
      }

      // no text annotation: the property value is part of the ObjectIdentifier's title already
      return undefined;
    },
    getSemanticObjectsList: function (propertyAnnotations) {
      // look for annotations SemanticObject with and without qualifier
      // returns : list of SemanticObjects
      const annotations = propertyAnnotations;
      const aSemanticObjects = [];
      for (const key in annotations.getObject()) {
        // var qualifier;
        if (key.indexOf("com.sap.vocabularies.Common.v1.SemanticObject") > -1 && key.indexOf("com.sap.vocabularies.Common.v1.SemanticObjectMapping") === -1 && key.indexOf("com.sap.vocabularies.Common.v1.SemanticObjectUnavailableActions") === -1) {
          let semanticObjectValue = annotations.getObject()[key];
          if (typeof semanticObjectValue === "object") {
            semanticObjectValue = AnnotationHelper.value(semanticObjectValue, {
              context: propertyAnnotations
            });
          }
          if (aSemanticObjects.indexOf(semanticObjectValue) === -1) {
            aSemanticObjects.push(semanticObjectValue);
          }
        }
      }
      const oSemanticObjectsModel = new JSONModel(aSemanticObjects);
      oSemanticObjectsModel.$$valueAsPromise = true;
      return oSemanticObjectsModel.createBindingContext("/");
    },
    getSemanticObjectsQualifiers: function (propertyAnnotations) {
      // look for annotations SemanticObject, SemanticObjectUnavailableActions, SemanticObjectMapping
      // returns : list of qualifiers (array of objects with qualifiers : {qualifier, SemanticObject, SemanticObjectUnavailableActions, SemanticObjectMapping for this qualifier}
      const annotations = propertyAnnotations;
      let qualifiersAnnotations = [];
      const findObject = function (qualifier) {
        return qualifiersAnnotations.find(function (object) {
          return object.qualifier === qualifier;
        });
      };
      for (const key in annotations.getObject()) {
        // var qualifier;
        if (key.indexOf("com.sap.vocabularies.Common.v1.SemanticObject#") > -1 || key.indexOf("com.sap.vocabularies.Common.v1.SemanticObjectMapping#") > -1 || key.indexOf("com.sap.vocabularies.Common.v1.SemanticObjectUnavailableActions#") > -1) {
          const annotationContent = annotations.getObject()[key],
            annotation = key.split("#")[0],
            qualifier = key.split("#")[1];
          let qualifierObject = findObject(qualifier);
          if (!qualifierObject) {
            qualifierObject = {
              qualifier: qualifier
            };
            qualifierObject[annotation] = annotationContent;
            qualifiersAnnotations.push(qualifierObject);
          } else {
            qualifierObject[annotation] = annotationContent;
          }
        }
      }
      qualifiersAnnotations = qualifiersAnnotations.filter(function (oQualifier) {
        return !!oQualifier["@com.sap.vocabularies.Common.v1.SemanticObject"];
      });
      const oQualifiersModel = new JSONModel(qualifiersAnnotations);
      oQualifiersModel.$$valueAsPromise = true;
      return oQualifiersModel.createBindingContext("/");
    },
    computeSemanticLinkModelContextChange: function (aSemanticObjects, oDataModelObjectPath) {
      if (FieldHelper.hasSemanticObjectsWithPath(aSemanticObjects)) {
        const sPathToProperty = FieldHelper.buildTargetPathFromDataModelObjectPath(oDataModelObjectPath);
        return `FieldRuntime.LinkModelContextChange($event, '${oDataModelObjectPath.targetObject.name}', '${sPathToProperty}')`;
      } else {
        return undefined;
      }
    },
    hasSemanticObjectsWithPath: function (aSemanticObjects) {
      let bSemanticObjectHasAPath = false;
      if (aSemanticObjects && aSemanticObjects.length) {
        for (let i = 0; i < aSemanticObjects.length; i++) {
          if (aSemanticObjects[i] && aSemanticObjects[i].value && aSemanticObjects[i].value.indexOf("{") === 0) {
            bSemanticObjectHasAPath = true;
            break;
          }
        }
      }
      return bSemanticObjectHasAPath;
    },
    isSemanticKeyHasFieldGroupColumn: function (isFieldGroupColumn) {
      return isFieldGroupColumn;
    },
    /*
     * Method to compute the delegate with payload
     * @function
     * @param {object} delegateName - name of the delegate methode
     * @param {boolean} retrieveTextFromValueList - added to the payload of the delegate methode
     * @return {object} - returns the delegate with payload
     */
    computeFieldBaseDelegate: function (delegateName, retrieveTextFromValueList) {
      if (retrieveTextFromValueList) {
        return JSON.stringify({
          name: delegateName,
          payload: {
            retrieveTextFromValueList: retrieveTextFromValueList
          }
        });
      }
      return `{name: '${delegateName}'}`;
    },
    _getPrimaryIntents: function (aSemanticObjectsList) {
      const aPromises = [];
      if (aSemanticObjectsList) {
        const oUshellContainer = sap.ushell && sap.ushell.Container;
        const oService = oUshellContainer && oUshellContainer.getService("CrossApplicationNavigation");
        aSemanticObjectsList.forEach(function (semObject) {
          if (typeof semObject === "string") {
            aPromises.push(oService.getPrimaryIntent(semObject, {}));
          }
        });
      }
      return Promise.all(aPromises).then(function (aSemObjectPrimaryAction) {
        return aSemObjectPrimaryAction;
      }).catch(function (oError) {
        Log.error("Error fetching primary intents", oError);
        return [];
      });
    },
    _SemanticObjectsHasPrimaryAction: function (oSemantics, aSemanticObjectsPrimaryActions) {
      const _fnIsSemanticObjectActionUnavailable = function (_oSemantics, _oPrimaryAction, _index) {
        for (const unavailableActionsIndex in _oSemantics.semanticObjectUnavailableActions[_index].actions) {
          if (_oPrimaryAction.intent.split("-")[1].indexOf(_oSemantics.semanticObjectUnavailableActions[_index].actions[unavailableActionsIndex]) === 0) {
            return false;
          }
        }
        return true;
      };
      oSemantics.semanticPrimaryActions = aSemanticObjectsPrimaryActions;
      const oPrimaryAction = oSemantics.semanticObjects && oSemantics.mainSemanticObject && oSemantics.semanticPrimaryActions[oSemantics.semanticObjects.indexOf(oSemantics.mainSemanticObject)];
      const sCurrentHash = CommonUtils.getHash();
      if (oSemantics.mainSemanticObject && oPrimaryAction !== null && oPrimaryAction.intent !== sCurrentHash) {
        for (const index in oSemantics.semanticObjectUnavailableActions) {
          if (oSemantics.mainSemanticObject.indexOf(oSemantics.semanticObjectUnavailableActions[index].semanticObject) === 0) {
            return _fnIsSemanticObjectActionUnavailable(oSemantics, oPrimaryAction, index);
          }
        }
        return true;
      } else {
        return false;
      }
    },
    checkPrimaryActions: function (oSemantics, bGetTitleLink) {
      return this._getPrimaryIntents(oSemantics && oSemantics.semanticObjects).then(aSemanticObjectsPrimaryActions => {
        return bGetTitleLink ? {
          titleLink: aSemanticObjectsPrimaryActions,
          hasTitleLink: this._SemanticObjectsHasPrimaryAction(oSemantics, aSemanticObjectsPrimaryActions)
        } : this._SemanticObjectsHasPrimaryAction(oSemantics, aSemanticObjectsPrimaryActions);
      }).catch(function (oError) {
        Log.error("Error in checkPrimaryActions", oError);
      });
    },
    _getTitleLinkWithParameters: function (_oSemanticObjectModel, _linkIntent) {
      if (_oSemanticObjectModel && _oSemanticObjectModel.titlelink) {
        return _oSemanticObjectModel.titlelink;
      } else {
        return _linkIntent;
      }
    },
    getPrimaryAction: function (oSemantics) {
      return oSemantics.semanticPrimaryActions[oSemantics.semanticObjects.indexOf(oSemantics.mainSemanticObject)].intent ? FieldHelper._getTitleLinkWithParameters(oSemantics, oSemantics.semanticPrimaryActions[oSemantics.semanticObjects.indexOf(oSemantics.mainSemanticObject)].intent) : oSemantics.primaryIntentAction;
    },
    /**
     * Method to fetch the filter restrictions. Filter restrictions can be annotated on an entity set or a navigation property.
     * Depending on the path to which the control is bound, we check for filter restrictions on the context path of the control,
     * or on the navigation property (if there is a navigation).
     * Eg. If the table is bound to '/EntitySet', for property path '/EntitySet/_Association/PropertyName', the filter restrictions
     * on '/EntitySet' win over filter restrictions on '/EntitySet/_Association'.
     * If the table is bound to '/EntitySet/_Association', the filter restrictions on '/EntitySet/_Association' win over filter
     * retrictions on '/AssociationEntitySet'.
     *
     * @param oContext Property Context
     * @param oProperty Property object in the metadata
     * @param bUseSemanticDateRange Boolean Suggests if semantic date range should be used
     * @param sSettings Stringified object of the property settings
     * @param contextPath Path to which the parent control (the table or the filter bar) is bound
     * @returns String containing comma-separated list of operators for filtering
     */
    operators: function (oContext, oProperty, bUseSemanticDateRange, sSettings, contextPath) {
      if (!oProperty || !contextPath) {
        return undefined;
      }
      let operators;
      const sProperty = FieldHelper.propertyName(oProperty, {
        context: oContext
      });
      const oModel = oContext.getModel(),
        sPropertyPath = oContext.getPath(),
        sPropertyLocationPath = CommonHelper.getLocationForPropertyPath(oModel, sPropertyPath),
        propertyType = oProperty.$Type;
      if (propertyType === "Edm.Guid") {
        return CommonUtils.getOperatorsForGuidProperty();
      }

      // remove '/'
      contextPath = contextPath.slice(0, -1);
      const isTableBoundToNavigation = contextPath.lastIndexOf("/") > 0;
      const isNavigationPath = isTableBoundToNavigation && contextPath !== sPropertyLocationPath || !isTableBoundToNavigation && sPropertyLocationPath.lastIndexOf("/") > 0;
      const navigationPath = isNavigationPath && sPropertyLocationPath.substr(sPropertyLocationPath.indexOf(contextPath) + contextPath.length + 1) || "";
      const propertyPath = isNavigationPath && navigationPath + "/" + sProperty || sProperty;
      if (!isTableBoundToNavigation) {
        if (!isNavigationPath) {
          // /SalesOrderManage/ID
          operators = CommonUtils.getOperatorsForProperty(sProperty, sPropertyLocationPath, oModel, propertyType, bUseSemanticDateRange, sSettings);
        } else {
          // /SalesOrderManange/_Item/Material
          //let operators
          operators = CommonUtils.getOperatorsForProperty(propertyPath, contextPath, oModel, propertyType, bUseSemanticDateRange, sSettings);
          if (operators.length === 0) {
            operators = CommonUtils.getOperatorsForProperty(sProperty, sPropertyLocationPath, oModel, propertyType, bUseSemanticDateRange, sSettings);
          }
        }
      } else if (!isNavigationPath) {
        var _operators;
        // /SalesOrderManage/_Item/Material
        operators = CommonUtils.getOperatorsForProperty(propertyPath, contextPath, oModel, propertyType, bUseSemanticDateRange, sSettings);
        if (operators.length === 0) {
          operators = CommonUtils.getOperatorsForProperty(sProperty, ModelHelper.getEntitySetPath(contextPath), oModel, propertyType, bUseSemanticDateRange, sSettings);
        }
        return ((_operators = operators) === null || _operators === void 0 ? void 0 : _operators.length) > 0 ? operators.toString() : undefined;
      } else {
        // /SalesOrderManage/_Item/_Association/PropertyName
        // This is currently not supported for tables
        operators = CommonUtils.getOperatorsForProperty(propertyPath, contextPath, oModel, propertyType, bUseSemanticDateRange, sSettings);
        if (operators.length === 0) {
          operators = CommonUtils.getOperatorsForProperty(propertyPath, ModelHelper.getEntitySetPath(contextPath), oModel, propertyType, bUseSemanticDateRange, sSettings);
        }
      }
      if ((!operators || operators.length === 0) && (propertyType === "Edm.Date" || propertyType === "Edm.DateTimeOffset")) {
        operators = CommonUtils.getOperatorsForDateProperty(propertyType);
      }
      return operators.length > 0 ? operators.toString() : undefined;
    },
    /**
     * Return the property context for usage in QuickView.
     *
     * @param oDataFieldContext Context of the data field or associated property
     * @returns Binding context
     */
    getPropertyContextForQuickView: function (oDataFieldContext) {
      if (oDataFieldContext.getObject("Value") !== undefined) {
        // Create a binding context to the property from the data field.
        const oInterface = oDataFieldContext.getInterface(),
          oModel = oInterface.getModel();
        let sPath = oInterface.getPath();
        sPath = sPath + (sPath.endsWith("/") ? "Value" : "/Value");
        return oModel.createBindingContext(sPath);
      } else {
        // It is a property. Just return the context as it is.
        return oDataFieldContext;
      }
    },
    /**
     * Return the binding context corresponding to the property path.
     *
     * @param oPropertyContext Context of the property
     * @returns Binding context
     */
    getPropertyPathForQuickView: function (oPropertyContext) {
      if (oPropertyContext && oPropertyContext.getObject("$Path")) {
        const oInterface = oPropertyContext.getInterface(),
          oModel = oInterface.getModel();
        let sPath = oInterface.getPath();
        sPath = sPath + (sPath.endsWith("/") ? "$Path" : "/$Path");
        return oModel.createBindingContext(sPath);
      }
      return oPropertyContext;
    },
    /**
     * Return the path of the DaFieldDefault (if any). Otherwise, the DataField path is returned.
     *
     * @param oDataFieldContext Context of the DataField
     * @returns Object path
     */
    getDataFieldDefault: function (oDataFieldContext) {
      const oDataFieldDefault = oDataFieldContext.getModel().getObject(`${oDataFieldContext.getPath()}@com.sap.vocabularies.UI.v1.DataFieldDefault`);
      return oDataFieldDefault ? `${oDataFieldContext.getPath()}@com.sap.vocabularies.UI.v1.DataFieldDefault` : oDataFieldContext.getPath();
    },
    /*
     * Method to get visible expression for DataFieldActionButton
     * @function
     * @name isDataFieldActionButtonVisible
     * @param {object} oThis - Current Object
     * @param {object} oDataField - DataPoint's Value
     * @param {boolean} bIsBound - DataPoint action bound
     * @param {object} oActionContext - ActionContext Value
     * @return {boolean} - returns boolean
     */
    isDataFieldActionButtonVisible: function (oThis, oDataField, bIsBound, oActionContext) {
      return oDataField["@com.sap.vocabularies.UI.v1.Hidden"] !== true && (bIsBound !== true || oActionContext !== false);
    },
    /**
     * Method to get press event for DataFieldActionButton.
     *
     * @function
     * @name getPressEventForDataFieldActionButton
     * @param oThis Current Object
     * @param oDataField DataPoint's Value
     * @returns The binding expression for the DataFieldActionButton press event
     */
    getPressEventForDataFieldActionButton: function (oThis, oDataField) {
      var _oThis$entitySet;
      let sInvocationGrouping = "Isolated";
      if (oDataField.InvocationGrouping && oDataField.InvocationGrouping.$EnumMember === "com.sap.vocabularies.UI.v1.OperationGroupingType/ChangeSet") {
        sInvocationGrouping = "ChangeSet";
      }
      let bIsNavigable = oThis.navigateAfterAction;
      bIsNavigable = bIsNavigable === "false" ? false : true;
      const entities = oThis === null || oThis === void 0 ? void 0 : (_oThis$entitySet = oThis.entitySet) === null || _oThis$entitySet === void 0 ? void 0 : _oThis$entitySet.getPath().split("/");
      const entitySetName = entities[entities.length - 1];
      const oParams = {
        contexts: "${$source>/}.getBindingContext()",
        invocationGrouping: CommonHelper.addSingleQuotes(sInvocationGrouping),
        model: "${$source>/}.getModel()",
        label: CommonHelper.addSingleQuotes(oDataField.Label, true),
        isNavigable: bIsNavigable,
        entitySetName: CommonHelper.addSingleQuotes(entitySetName)
      };
      return CommonHelper.generateFunction(".editFlow.invokeAction", CommonHelper.addSingleQuotes(oDataField.Action), CommonHelper.objectToString(oParams));
    },
    isNumericDataType: function (sDataFieldType) {
      const _sDataFieldType = sDataFieldType;
      if (_sDataFieldType !== undefined) {
        const aNumericDataTypes = ["Edm.Int16", "Edm.Int32", "Edm.Int64", "Edm.Byte", "Edm.SByte", "Edm.Single", "Edm.Decimal", "Edm.Double"];
        return aNumericDataTypes.indexOf(_sDataFieldType) === -1 ? false : true;
      } else {
        return false;
      }
    },
    isDateOrTimeDataType: function (sPropertyType) {
      if (sPropertyType !== undefined) {
        const aDateTimeDataTypes = ["Edm.DateTimeOffset", "Edm.DateTime", "Edm.Date", "Edm.TimeOfDay", "Edm.Time"];
        return aDateTimeDataTypes.indexOf(sPropertyType) > -1;
      } else {
        return false;
      }
    },
    isDateTimeDataType: function (sPropertyType) {
      if (sPropertyType !== undefined) {
        const aDateDataTypes = ["Edm.DateTimeOffset", "Edm.DateTime"];
        return aDateDataTypes.indexOf(sPropertyType) > -1;
      } else {
        return false;
      }
    },
    isDateDataType: function (sPropertyType) {
      return sPropertyType === "Edm.Date";
    },
    isTimeDataType: function (sPropertyType) {
      if (sPropertyType !== undefined) {
        const aDateDataTypes = ["Edm.TimeOfDay", "Edm.Time"];
        return aDateDataTypes.indexOf(sPropertyType) > -1;
      } else {
        return false;
      }
    },
    /**
     * Method to return the underlying property data type in case TextArrangement annotation of Text annotation 'TextOnly' exists.
     *
     * @param oAnnotations All the annotations of a property
     * @param oModel An instance of OData v4 model
     * @param sEntityPath The path to root Entity
     * @param sType The property data type
     * @returns The underlying property data type for TextOnly annotated property, otherwise the original data type.
     * @private
     */
    getUnderlyingPropertyDataType: function (oAnnotations, oModel, sEntityPath, sType) {
      const sTextAnnotation = "@com.sap.vocabularies.Common.v1.Text",
        sTextArrangementAnnotation = "@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement";
      if (!!oAnnotations && !!oAnnotations[sTextArrangementAnnotation] && oAnnotations[sTextArrangementAnnotation].$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly" && !!oAnnotations[sTextAnnotation] && !!oAnnotations[sTextAnnotation].$Path) {
        return oModel.getObject(`${sEntityPath}/${oAnnotations[sTextAnnotation].$Path}/$Type`);
      }
      return sType;
    },
    getColumnAlignment: function (oDataField, oTable) {
      const sEntityPath = oTable.collection.sPath,
        oModel = oTable.collection.oModel;
      if ((oDataField["$Type"] === "com.sap.vocabularies.UI.v1.DataFieldForAction" || oDataField["$Type"] === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation") && oDataField.Inline && oDataField.IconUrl) {
        return "Center";
      }
      // Columns containing a Semantic Key must be Begin aligned
      const aSemanticKeys = oModel.getObject(`${sEntityPath}/@com.sap.vocabularies.Common.v1.SemanticKey`);
      if (oDataField["$Type"] === "com.sap.vocabularies.UI.v1.DataField") {
        const sPropertyPath = oDataField.Value.$Path;
        const bIsSemanticKey = aSemanticKeys && !aSemanticKeys.every(function (oKey) {
          return oKey.$PropertyPath !== sPropertyPath;
        });
        if (bIsSemanticKey) {
          return "Begin";
        }
      }
      return FieldHelper.getDataFieldAlignment(oDataField, oModel, sEntityPath);
    },
    /**
     * Get alignment based only on the property.
     *
     * @param sType The property's type
     * @param oFormatOptions The field format options
     * @param [oComputedEditMode] The computed Edit mode of the property is empty when directly called from the ColumnProperty fragment
     * @returns The property alignment
     */
    getPropertyAlignment: function (sType, oFormatOptions, oComputedEditMode) {
      let sDefaultAlignment = "Begin";
      const sTextAlignment = oFormatOptions ? oFormatOptions.textAlignMode : "";
      switch (sTextAlignment) {
        case "Form":
          if (this.isNumericDataType(sType)) {
            sDefaultAlignment = "Begin";
            if (oComputedEditMode) {
              sDefaultAlignment = getAlignmentExpression(oComputedEditMode, "Begin", "End");
            }
          }
          break;
        default:
          if (this.isNumericDataType(sType) || this.isDateOrTimeDataType(sType)) {
            sDefaultAlignment = "Right";
          }
          break;
      }
      return sDefaultAlignment;
    },
    getDataFieldAlignment: function (oDataField, oModel, sEntityPath, oFormatOptions, oComputedEditMode) {
      let sDataFieldPath,
        sDefaultAlignment = "Begin",
        sType,
        oAnnotations;
      if (oDataField["$Type"] === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation") {
        sDataFieldPath = oDataField.Target.$AnnotationPath;
        if (oDataField.Target["$AnnotationPath"] && oDataField.Target["$AnnotationPath"].indexOf("com.sap.vocabularies.UI.v1.FieldGroup") >= 0) {
          const oFieldGroup = oModel.getObject(`${sEntityPath}/${sDataFieldPath}`);
          for (let i = 0; i < oFieldGroup.Data.length; i++) {
            sType = oModel.getObject(`${sEntityPath}/${sDataFieldPath}/Data/${i.toString()}/Value/$Path/$Type`);
            oAnnotations = oModel.getObject(`${sEntityPath}/${sDataFieldPath}/Data/${i.toString()}/Value/$Path@`);
            sType = this.getUnderlyingPropertyDataType(oAnnotations, oModel, sEntityPath, sType);
            sDefaultAlignment = this.getPropertyAlignment(sType, oFormatOptions, oComputedEditMode);
            if (sDefaultAlignment === "Begin") {
              break;
            }
          }
          return sDefaultAlignment;
        } else if (oDataField.Target["$AnnotationPath"] && oDataField.Target["$AnnotationPath"].indexOf("com.sap.vocabularies.UI.v1.DataPoint") >= 0 && oModel.getObject(`${sEntityPath}/${sDataFieldPath}/Visualization/$EnumMember`) === "com.sap.vocabularies.UI.v1.VisualizationType/Rating") {
          return sDefaultAlignment;
        } else {
          sType = oModel.getObject(`${sEntityPath}/${sDataFieldPath}/$Type`);
          if (sType === "com.sap.vocabularies.UI.v1.DataPointType") {
            sType = oModel.getObject(`${sEntityPath}/${sDataFieldPath}/Value/$Path/$Type`);
            oAnnotations = oModel.getObject(`${sEntityPath}/${sDataFieldPath}/Value/$Path@`);
            sType = this.getUnderlyingPropertyDataType(oAnnotations, oModel, sEntityPath, sType);
          }
          sDefaultAlignment = this.getPropertyAlignment(sType, oFormatOptions, oComputedEditMode);
        }
      } else {
        sDataFieldPath = oDataField.Value.$Path;
        sType = oModel.getObject(`${sEntityPath}/${sDataFieldPath}/$Type`);
        oAnnotations = oModel.getObject(`${sEntityPath}/${sDataFieldPath}@`);
        sType = this.getUnderlyingPropertyDataType(oAnnotations, oModel, sEntityPath, sType);
        if (!(oModel.getObject(`${sEntityPath}/`)["$Key"].indexOf(sDataFieldPath) === 0)) {
          sDefaultAlignment = this.getPropertyAlignment(sType, oFormatOptions, oComputedEditMode);
        }
      }
      return sDefaultAlignment;
    },
    getTypeAlignment: function (oContext, oDataField, oFormatOptions, sEntityPath, oComputedEditMode, oProperty) {
      const oInterface = oContext.getInterface(0);
      const oModel = oInterface.getModel();
      if (sEntityPath === "/undefined" && oProperty && oProperty.$target) {
        sEntityPath = `/${oProperty.$target.fullyQualifiedName.split("/")[0]}`;
      }
      return FieldHelper.getDataFieldAlignment(oDataField, oModel, sEntityPath, oFormatOptions, oComputedEditMode);
    },
    /**
     * Method to get enabled expression for DataFieldActionButton.
     *
     * @function
     * @name isDataFieldActionButtonEnabled
     * @param oDataField DataPoint's Value
     * @param bIsBound DataPoint action bound
     * @param oActionContext ActionContext Value
     * @param sActionContextFormat Formatted value of ActionContext
     * @returns A boolean or string expression for enabled property
     */
    isDataFieldActionButtonEnabled: function (oDataField, bIsBound, oActionContext, sActionContextFormat) {
      if (bIsBound !== true) {
        return "true";
      }
      return (oActionContext === null ? "{= !${#" + oDataField.Action + "} ? false : true }" : oActionContext) ? sActionContextFormat : "true";
    },
    /**
     * Method to get labelText for DataField.
     *
     * @function
     * @name getLabelTextForDataField
     * @param oEntitySetModel The EntitySet model Object
     * @param oPropertyPath The Property path's object
     * @param sPropertyPathBuildExpression The evaluated value of expression @@FIELD.buildExpressionForTextValue
     * @param sPropertyValue Property value from model
     * @param sUiName The sapui.name annotation value
     * @param sSemanticKeyStyle
     * @returns The binding expression for datafield label.
     */
    getLabelTextForDataField: function (oEntitySetModel, oPropertyPath, sPropertyPathBuildExpression, sPropertyValue, sUiName, sSemanticKeyStyle) {
      const oDraftRoot = oEntitySetModel["@com.sap.vocabularies.Common.v1.DraftRoot"];
      return FieldHelper.getSemanticKeyTitle(oPropertyPath["@com.sap.vocabularies.Common.v1.Text"] && sPropertyPathBuildExpression, sPropertyValue, sUiName, oPropertyPath["@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement"], sSemanticKeyStyle, oDraftRoot);
    },
    /**
     * Method to retrieve text from value list for DataField.
     *
     * @function
     * @name retrieveTextFromValueList
     * @param oEntitySetModel The EntitySet model Object
     * @param sPropertyPath The property path's name
     * @param oFormatOptions The evaluated informations for the format option
     * @returns The binding expression for datafield text.
     */
    retrieveTextFromValueList: function (oEntitySetModel, sPropertyPath, oFormatOptions) {
      const sPropertyFullPath = `${oEntitySetModel.sPath}/${sPropertyPath}`;
      const sDisplayFormat = oFormatOptions.displayMode;
      CommonHelper.setMetaModel(oEntitySetModel.getModel());
      return "{= FieldRuntime.retrieveTextFromValueList(%{" + sPropertyPath + "},'" + sPropertyFullPath + "','" + sDisplayFormat + "')}";
    },
    /**
     * Method to compute the label for a DataField.
     * If the DataField's label is an empty string, it's not rendered even if a fallback exists.
     *
     * @function
     * @name computeLabelText
     * @param {object} oDataField The DataField being processed
     * @param {object} oInterface The interface for context instance
     * @returns {string} The computed text for the DataField label.
     */

    computeLabelText: function (oDataField, oInterface) {
      const oModel = oInterface.context.getModel();
      let sContextPath = oInterface.context.getPath();
      if (sContextPath.endsWith("/")) {
        sContextPath = sContextPath.slice(0, sContextPath.lastIndexOf("/"));
      }
      const sDataFieldLabel = oModel.getObject(`${sContextPath}/Label`);
      //We do not show an additional label text for a button:
      if (oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction" || oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation") {
        return undefined;
      }
      if (sDataFieldLabel) {
        return sDataFieldLabel;
      } else if (sDataFieldLabel === "") {
        return "";
      }
      let sDataFieldTargetTitle;
      if (oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation") {
        if (oDataField.Target.$AnnotationPath.indexOf("@com.sap.vocabularies.UI.v1.DataPoint") > -1 || oDataField.Target.$AnnotationPath.indexOf("@com.sap.vocabularies.UI.v1.Chart") > -1) {
          sDataFieldTargetTitle = oModel.getObject(`${sContextPath}/Target/$AnnotationPath@/Title`);
        }
        if (oDataField.Target.$AnnotationPath.indexOf("@com.sap.vocabularies.Communication.v1.Contact") > -1) {
          sDataFieldTargetTitle = oModel.getObject(`${sContextPath}/Target/$AnnotationPath@/fn/$Path@com.sap.vocabularies.Common.v1.Label`);
        }
      }
      if (sDataFieldTargetTitle) {
        return sDataFieldTargetTitle;
      }
      let sDataFieldTargetLabel;
      if (oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation") {
        sDataFieldTargetLabel = oModel.getObject(`${sContextPath}/Target/$AnnotationPath@/Label`);
      }
      if (sDataFieldTargetLabel) {
        return sDataFieldTargetLabel;
      }
      const sDataFieldValueLabel = oModel.getObject(`${sContextPath}/Value/$Path@com.sap.vocabularies.Common.v1.Label`);
      if (sDataFieldValueLabel) {
        return sDataFieldValueLabel;
      }
      let sDataFieldTargetValueLabel;
      if (oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation") {
        sDataFieldTargetValueLabel = oModel.getObject(`${sContextPath}/Target/$AnnotationPath/Value/$Path@com.sap.vocabularies.Common.v1.Label`);
      }
      if (sDataFieldTargetValueLabel) {
        return sDataFieldTargetValueLabel;
      }
      return "";
    },
    /**
     * Method to align the data fields with their label.
     *
     * @function
     * @name buildExpressionForAlignItems
     * @param sVisualization
     * @returns Expression binding for alignItems property
     */
    buildExpressionForAlignItems: function (sVisualization) {
      const fieldVisualizationBindingExpression = constant(sVisualization);
      const progressVisualizationBindingExpression = constant("com.sap.vocabularies.UI.v1.VisualizationType/Progress");
      const ratingVisualizationBindingExpression = constant("com.sap.vocabularies.UI.v1.VisualizationType/Rating");
      return compileExpression(ifElse(or(equal(fieldVisualizationBindingExpression, progressVisualizationBindingExpression), equal(fieldVisualizationBindingExpression, ratingVisualizationBindingExpression)), constant("Center"), ifElse(UI.IsEditable, constant("Center"), constant("Stretch"))));
    },
    /**
     * Method to check ValueListReferences, ValueListMapping and ValueList inside ActionParameters for FieldHelp.
     *
     * @function
     * @name hasValueHelp
     * @param oPropertyAnnotations Action parameter object
     * @returns `true` if there is a ValueList* annotation defined
     */
    hasValueHelpAnnotation: function (oPropertyAnnotations) {
      if (oPropertyAnnotations) {
        return oPropertyAnnotations["@com.sap.vocabularies.Common.v1.ValueListReferences"] || oPropertyAnnotations["@com.sap.vocabularies.Common.v1.ValueListMapping"] || oPropertyAnnotations["@com.sap.vocabularies.Common.v1.ValueList"];
      }
      return false;
    },
    /**
     * Method to get display property for ActionParameter dialog.
     *
     * 	@function
     * @name getAPDialogDisplayFormat
     * @param oProperty The action parameter instance
     * @param oInterface The interface for the context instance
     * @returns The display format  for an action parameter Field
     */
    getAPDialogDisplayFormat: function (oProperty, oInterface) {
      let oAnnotation;
      const oModel = oInterface.context.getModel();
      const sContextPath = oInterface.context.getPath();
      const sPropertyName = oProperty.$Name || oInterface.context.getProperty(`${sContextPath}@sapui.name`);
      const oActionParameterAnnotations = oModel.getObject(`${sContextPath}@`);
      const oValueHelpAnnotation = oActionParameterAnnotations["@com.sap.vocabularies.Common.v1.ValueList"] || oActionParameterAnnotations["@com.sap.vocabularies.Common.v1.ValueListMapping"] || oActionParameterAnnotations["@com.sap.vocabularies.Common.v1.ValueListReferences"];
      const getValueListPropertyName = function (oValueList) {
        const oValueListParameter = oValueList.Parameters.find(function (oParameter) {
          return oParameter.LocalDataProperty && oParameter.LocalDataProperty.$PropertyPath === sPropertyName;
        });
        return oValueListParameter && oValueListParameter.ValueListProperty;
      };
      let sValueListPropertyName;
      if (oActionParameterAnnotations["@com.sap.vocabularies.Common.v1.TextArrangement"] || oActionParameterAnnotations["@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement"]) {
        return CommonUtils.computeDisplayMode(oActionParameterAnnotations, undefined);
      } else if (oValueHelpAnnotation) {
        if (oValueHelpAnnotation.CollectionPath) {
          // get the name of the corresponding property in value list collection
          sValueListPropertyName = getValueListPropertyName(oValueHelpAnnotation);
          if (!sValueListPropertyName) {
            return "Value";
          }
          // get text for this property
          oAnnotation = oModel.getObject(`/${oValueHelpAnnotation.CollectionPath}/${sValueListPropertyName}@`);
          return oAnnotation && oAnnotation["@com.sap.vocabularies.Common.v1.Text"] ? CommonUtils.computeDisplayMode(oAnnotation, undefined) : "Value";
        } else {
          return oModel.requestValueListInfo(sContextPath, true).then(function (oValueListInfo) {
            // get the name of the corresponding property in value list collection
            sValueListPropertyName = getValueListPropertyName(oValueListInfo[""]);
            if (!sValueListPropertyName) {
              return "Value";
            }
            // get text for this property
            oAnnotation = oValueListInfo[""].$model.getMetaModel().getObject(`/${oValueListInfo[""]["CollectionPath"]}/${sValueListPropertyName}@`);
            return oAnnotation && oAnnotation["@com.sap.vocabularies.Common.v1.Text"] ? CommonUtils.computeDisplayMode(oAnnotation, undefined) : "Value";
          });
        }
      } else {
        return "Value";
      }
    },
    /**
     * Method to get display property for ActionParameter dialog FieldHelp.
     *
     * @function
     * @name getActionParameterDialogFieldHelp
     * @param oActionParameter Action parameter object
     * @param sSapUIName Action sapui name
     * @param sParamName The parameter name
     * @returns The ID of the fieldHelp used by this action parameter
     */
    getActionParameterDialogFieldHelp: function (oActionParameter, sSapUIName, sParamName) {
      return this.hasValueHelpAnnotation(oActionParameter) ? generate([sSapUIName, sParamName]) : undefined;
    },
    /**
     * Method to get the delegate configuration for ActionParameter dialog.
     *
     * @function
     * @name getValueHelpDelegate
     * @param isBound Action is bound
     * @param entityTypePath The EntityType Path
     * @param sapUIName The name of the Action
     * @param paramName The name of the ActionParameter
     * @returns The delegate configuration object as a string
     */
    getValueHelpDelegate: function (isBound, entityTypePath, sapUIName, paramName) {
      const delegateConfiguration = {
        name: CommonHelper.addSingleQuotes("sap/fe/macros/valuehelp/ValueHelpDelegate"),
        payload: {
          propertyPath: CommonHelper.addSingleQuotes(ValueListHelper.getPropertyPath({
            UnboundAction: !isBound,
            EntityTypePath: entityTypePath,
            Action: sapUIName,
            Property: paramName
          })),
          qualifiers: {},
          valueHelpQualifier: CommonHelper.addSingleQuotes(""),
          isActionParameterDialog: true
        }
      };
      return CommonHelper.objectToString(delegateConfiguration);
    },
    /**
     * Method to get the delegate configuration for NonComputedVisibleKeyField dialog.
     *
     * @function
     * @name getValueHelpDelegateForNonComputedVisibleKeyField
     * @param propertyPath The current property path
     * @returns The delegate configuration object as a string
     */
    getValueHelpDelegateForNonComputedVisibleKeyField: function (propertyPath) {
      const delegateConfiguration = {
        name: CommonHelper.addSingleQuotes("sap/fe/macros/valuehelp/ValueHelpDelegate"),
        payload: {
          propertyPath: CommonHelper.addSingleQuotes(propertyPath),
          qualifiers: {},
          valueHelpQualifier: CommonHelper.addSingleQuotes("")
        }
      };
      return CommonHelper.objectToString(delegateConfiguration);
    },
    /**
     * Method to fetch entity from a path containing multiple associations.
     *
     * @function
     * @name _getEntitySetFromMultiLevel
     * @param oContext The context whose path is to be checked
     * @param sPath The path from which entity has to be fetched
     * @param sSourceEntity The entity path in which nav entity exists
     * @param iStart The start index : beginning parts of the path to be ignored
     * @param iDiff The diff index : end parts of the path to be ignored
     * @returns The path of the entity set
     */
    _getEntitySetFromMultiLevel: function (oContext, sPath, sSourceEntity, iStart, iDiff) {
      let aNavParts = sPath.split("/").filter(Boolean);
      aNavParts = aNavParts.filter(function (sPart) {
        return sPart !== "$NavigationPropertyBinding";
      });
      if (aNavParts.length > 0) {
        for (let i = iStart; i < aNavParts.length - iDiff; i++) {
          sSourceEntity = `/${oContext.getObject(`${sSourceEntity}/$NavigationPropertyBinding/${aNavParts[i]}`)}`;
        }
      }
      return sSourceEntity;
    },
    /**
     * Method to find the entity of the property.
     *
     * @function
     * @name getPropertyCollection
     * @param oProperty The context from which datafield's path needs to be extracted.
     * @param oContextObject The Metadata Context(Not passed when called with template:with)
     * @returns The entity set path of the property
     */
    getPropertyCollection: function (oProperty, oContextObject) {
      const oContext = oContextObject && oContextObject.context || oProperty;
      const sPath = oContext.getPath();
      const aMainEntityParts = sPath.split("/").filter(Boolean);
      const sMainEntity = aMainEntityParts[0];
      const sPropertyPath = oContext.getObject("$Path");
      let sFieldSourceEntity = `/${sMainEntity}`;
      // checking against prefix of annotations, ie. @com.sap.vocabularies.
      // as annotation path can be of a line item, field group or facet
      if (sPath.indexOf("/@com.sap.vocabularies.") > -1) {
        const iAnnoIndex = sPath.indexOf("/@com.sap.vocabularies.");
        const sInnerPath = sPath.substring(0, iAnnoIndex);
        // the facet or line item's entity could be a navigation entity
        sFieldSourceEntity = FieldHelper._getEntitySetFromMultiLevel(oContext, sInnerPath, sFieldSourceEntity, 1, 0);
      }
      if (sPropertyPath && sPropertyPath.indexOf("/") > -1) {
        // the field within facet or line item could be from a navigation entity
        sFieldSourceEntity = FieldHelper._getEntitySetFromMultiLevel(oContext, sPropertyPath, sFieldSourceEntity, 0, 1);
      }
      return sFieldSourceEntity;
    },
    /**
     * Method used in a template with to retrieve the currency or the unit property inside a templating variable.
     *
     * @param oPropertyAnnotations
     * @returns The annotationPath to be dealt with by template:with
     */
    getUnitOrCurrency: function (oPropertyAnnotations) {
      const oPropertyAnnotationsObject = oPropertyAnnotations.getObject();
      let sAnnotationPath = oPropertyAnnotations.sPath;
      if (oPropertyAnnotationsObject["@Org.OData.Measures.V1.ISOCurrency"]) {
        sAnnotationPath = `${sAnnotationPath}Org.OData.Measures.V1.ISOCurrency`;
      } else {
        sAnnotationPath = `${sAnnotationPath}Org.OData.Measures.V1.Unit`;
      }
      return sAnnotationPath;
    },
    hasStaticUnitOrCurrency: function (oPropertyAnnotations) {
      return oPropertyAnnotations["@Org.OData.Measures.V1.ISOCurrency"] ? !oPropertyAnnotations["@Org.OData.Measures.V1.ISOCurrency"].$Path : !oPropertyAnnotations["@Org.OData.Measures.V1.Unit"].$Path;
    },
    getStaticUnitOrCurrency: function (oPropertyAnnotations, oFormatOptions) {
      if (oFormatOptions && oFormatOptions.measureDisplayMode !== "Hidden") {
        const unit = oPropertyAnnotations["@Org.OData.Measures.V1.ISOCurrency"] || oPropertyAnnotations["@Org.OData.Measures.V1.Unit"];
        const dateFormat = DateFormat.getDateInstance();
        const localeData = dateFormat.oLocaleData.mData;
        if (localeData && localeData.units && localeData.units.short && localeData.units.short[unit] && localeData.units.short[unit].displayName) {
          return localeData.units.short[unit].displayName;
        }
        return unit;
      }
    },
    getEmptyIndicatorTrigger: function (bActive, sBinding, sFullTextBinding) {
      if (sFullTextBinding) {
        return bActive ? sFullTextBinding : "inactive";
      }
      return bActive ? sBinding : "inactive";
    },
    /**
     * When the value displayed is in text arrangement TextOnly we also want to retrieve the Text value for tables even if we don't show it.
     * This method will return the value of the original data field.
     *
     * @param oThis The current object
     * @param oDataFieldTextArrangement DataField using text arrangement annotation
     * @param oDataField DataField containing the value using text arrangement annotation
     * @returns The binding to the value
     */
    getBindingInfoForTextArrangement: function (oThis, oDataFieldTextArrangement, oDataField) {
      if (oDataFieldTextArrangement && oDataFieldTextArrangement.$EnumMember && oDataFieldTextArrangement.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly" && oDataField) {
        return `{${oDataField.Value.$Path}}`;
      }
      return undefined;
    },
    semanticKeyFormat: function (vRaw, oInterface) {
      // The Empty argument ensures that "groupingEnabled" is added to "formatOptions"
      oInterface.arguments = [{}, {
        groupingEnabled: false
      }];
      return AnnotationHelper.format(vRaw, oInterface);
    },
    getIsMediaContentTypeNullExpr: function (sPropertyPath, sOperator) {
      sOperator = sOperator || "===";
      return "{= %{" + sPropertyPath + "@odata.mediaContentType} " + sOperator + " null }";
    },
    getPathForIconSource: function (sPropertyPath) {
      return "{= FIELDRUNTIME.getIconForMimeType(%{" + sPropertyPath + "@odata.mediaContentType})}";
    },
    getFilenameExpr: function (sFilename, sNoFilenameText) {
      if (sFilename) {
        if (sFilename.indexOf("{") === 0) {
          // filename is referenced via path, i.e. @Core.ContentDisposition.Filename : path
          return "{= $" + sFilename + " ? $" + sFilename + " : $" + sNoFilenameText + "}";
        }
        // static filename, i.e. @Core.ContentDisposition.Filename : 'someStaticName'
        return sFilename;
      }
      // no @Core.ContentDisposition.Filename
      return sNoFilenameText;
    },
    calculateMBfromByte: function (iByte) {
      return iByte ? (iByte / (1024 * 1024)).toFixed(6) : undefined;
    },
    getDownloadUrl: function (propertyPath) {
      return propertyPath + "{= ${internal>/stickySessionToken} ? ('?SAP-ContextId=' + ${internal>/stickySessionToken}) : '' }";
    },
    getMarginClass: function (compactSemanticKey) {
      return compactSemanticKey === "true" || compactSemanticKey === true ? "sapMTableContentMargin" : undefined;
    },
    getRequired: function (immutableKey, target, requiredProperties) {
      let targetRequiredExpression = constant(false);
      if (target !== null) {
        targetRequiredExpression = isRequiredExpression(target === null || target === void 0 ? void 0 : target.targetObject);
      }
      return compileExpression(or(targetRequiredExpression, requiredProperties.indexOf(immutableKey) > -1));
    },
    /**
     * The method checks if the field is already part of a form.
     *
     * @param dataFieldCollection The list of the fields of the form
     * @param dataFieldObjectPath The data model object path of the field which needs to be checked in the form
     * @returns `true` if the field is already part of the form, `false` otherwise
     */
    isFieldPartOfForm: function (dataFieldCollection, dataFieldObjectPath) {
      //generating key for the received data field
      const connectedDataFieldKey = KeyHelper.generateKeyFromDataField(dataFieldObjectPath.targetObject);
      // trying to find the generated key in already existing form elements
      const isFieldFound = dataFieldCollection.find(field => {
        return field.key === connectedDataFieldKey;
      });
      return isFieldFound ? true : false;
    }
  };
  FieldHelper.buildExpressionForTextValue.requiresIContext = true;
  FieldHelper.getFieldGroupIds.requiresIContext = true;
  FieldHelper.fieldControl.requiresIContext = true;
  FieldHelper.getTypeAlignment.requiresIContext = true;
  FieldHelper.getPropertyCollection.requiresIContext = true;
  FieldHelper.getAPDialogDisplayFormat.requiresIContext = true;
  FieldHelper.semanticKeyFormat.requiresIContext = true;
  FieldHelper.computeLabelText.requiresIContext = true;
  FieldHelper.retrieveTextFromValueList.requiresIContext = true;
  FieldHelper.getActionParameterVisibility.requiresIContext = true;
  return FieldHelper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJJU09DdXJyZW5jeSIsIlVuaXQiLCJfZ2VuZXJhdGVTaWRlRWZmZWN0c01hcCIsIm9JbnRlcmZhY2UiLCJvTWV0YU1vZGVsIiwiZ2V0TW9kZWwiLCJvRmllbGRTZXR0aW5ncyIsImdldFNldHRpbmciLCJvU2lkZUVmZmVjdHMiLCJzaWRlRWZmZWN0cyIsIlNpZGVFZmZlY3RzSGVscGVyIiwiZ2VuZXJhdGVTaWRlRWZmZWN0c01hcEZyb21NZXRhTW9kZWwiLCJGaWVsZEhlbHBlciIsImRpc3BsYXlNb2RlIiwib1Byb3BlcnR5QW5ub3RhdGlvbnMiLCJvQ29sbGVjdGlvbkFubm90YXRpb25zIiwib1RleHRBbm5vdGF0aW9uIiwib1RleHRBcnJhbmdlbWVudEFubm90YXRpb24iLCIkRW51bU1lbWJlciIsImJ1aWxkRXhwcmVzc2lvbkZvclRleHRWYWx1ZSIsInNQcm9wZXJ0eVBhdGgiLCJvRGF0YUZpZWxkIiwiY29udGV4dCIsInNQYXRoIiwiZ2V0UGF0aCIsIm9UZXh0QW5ub3RhdGlvbkNvbnRleHQiLCJjcmVhdGVCaW5kaW5nQ29udGV4dCIsImdldFByb3BlcnR5Iiwic1RleHRFeHByZXNzaW9uIiwiQW5ub3RhdGlvbkhlbHBlciIsInZhbHVlIiwidW5kZWZpbmVkIiwic0V4cHJlc3Npb24iLCJnZXROYXZpZ2F0aW9uUGF0aCIsImluZGV4T2YiLCJyZXBsYWNlIiwic3Vic3RyIiwibGVuZ3RoIiwiYnVpbGRUYXJnZXRQYXRoRnJvbURhdGFNb2RlbE9iamVjdFBhdGgiLCJvRGF0YU1vZGVsT2JqZWN0UGF0aCIsInNTYXJ0RW50aXR5U2V0Iiwic3RhcnRpbmdFbnRpdHlTZXQiLCJuYW1lIiwiYU5hdmlnYXRpb25Qcm9wZXJ0aWVzIiwibmF2aWdhdGlvblByb3BlcnRpZXMiLCJpIiwiaGFzU2VtYW50aWNPYmplY3RUYXJnZXRzIiwib1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aCIsIm9Qcm9wZXJ0eURlZmluaXRpb24iLCJpc1Byb3BlcnR5IiwidGFyZ2V0T2JqZWN0IiwiJHRhcmdldCIsInNTZW1hbnRpY09iamVjdCIsImFubm90YXRpb25zIiwiQ29tbW9uIiwiU2VtYW50aWNPYmplY3QiLCJhU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMiLCJTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucyIsInNQcm9wZXJ0eUxvY2F0aW9uUGF0aCIsInNCaW5kaW5nRXhwcmVzc2lvbiIsInBhdGgiLCJjb21waWxlRXhwcmVzc2lvbiIsInBhdGhJbk1vZGVsIiwidmFsdWVPZiIsInNBbHRlcm5hdGVQYXRoIiwic0JpbmRpbmdQYXRoIiwiZ2V0U3RhdGVEZXBlbmRpbmdPblNlbWFudGljT2JqZWN0VGFyZ2V0cyIsImlzTm90QWx3YXlzSGlkZGVuIiwib0RldGFpbHMiLCJvQ29udGV4dCIsImlzQWx3YXlzSGlkZGVuIiwiVmFsdWUiLCIkUGF0aCIsImdldE9iamVjdCIsImlzRHJhZnRJbmRpY2F0b3JWaXNpYmxlSW5GaWVsZEdyb3VwIiwiY29sdW1uIiwiZm9ybWF0T3B0aW9ucyIsImZpZWxkR3JvdXBEcmFmdEluZGljYXRvclByb3BlcnR5UGF0aCIsImZpZWxkR3JvdXBOYW1lIiwiaXNSZXF1aXJlZCIsIm9GaWVsZENvbnRyb2wiLCJzRWRpdE1vZGUiLCJNYW5hZ2VkT2JqZWN0IiwiYmluZGluZ1BhcnNlciIsImdldEFjdGlvblBhcmFtZXRlclZpc2liaWxpdHkiLCJvUGFyYW0iLCIkSWYiLCJvTmVnUGFyYW0iLCJwcm9wZXJ0eU5hbWUiLCJ2UHJvcGVydHkiLCJzUHJvcGVydHlOYW1lIiwiJFByb3BlcnR5UGF0aCIsInNDb250ZXh0UGF0aCIsImdldEZpZWxkR3JvdXBJZHMiLCJnZXRJbnRlcmZhY2UiLCJ0aGVuIiwic093bmVyRW50aXR5VHlwZSIsImFGaWVsZEdyb3VwSWRzIiwiZ2V0U2lkZUVmZmVjdHNPbkVudGl0eUFuZFByb3BlcnR5Iiwic0ZpZWxkR3JvdXBJZHMiLCJyZWR1Y2UiLCJzUmVzdWx0Iiwic0lkIiwiYklzTmF2aWdhdGlvblBhdGgiLCJsYXN0SW5kZXhPZiIsImNvbmNhdCIsImZpZWxkQ29udHJvbCIsIm9Nb2RlbCIsIm9GaWVsZENvbnRyb2xDb250ZXh0IiwiaGFzT3duUHJvcGVydHkiLCJ2YWx1ZUhlbHBQcm9wZXJ0eSIsIm9Qcm9wZXJ0eUNvbnRleHQiLCJiSW5GaWx0ZXJGaWVsZCIsIm9Db250ZW50Iiwic0Fubm9QYXRoIiwic0Fubm90YXRpb24iLCJzVW5pdE9yQ3VycmVuY3lQYXRoIiwidmFsdWVIZWxwUHJvcGVydHlGb3JGaWx0ZXJGaWVsZCIsImdldElERm9yRmllbGRWYWx1ZUhlbHAiLCJzRmxleElkIiwic0lkUHJlZml4Iiwic09yaWdpbmFsUHJvcGVydHlOYW1lIiwic1Byb3BlcnR5IiwiZ2VuZXJhdGUiLCJnZXRGaWVsZEhlbHBQcm9wZXJ0eUZvckZpbHRlckZpZWxkIiwicHJvcGVydHlDb250ZXh0Iiwib1Byb3BlcnR5Iiwic1Byb3BlcnR5VHlwZSIsInNWaElkUHJlZml4Iiwic1ZhbHVlSGVscFByb3BlcnR5TmFtZSIsImJIYXNWYWx1ZUxpc3RXaXRoRml4ZWRWYWx1ZXMiLCJiVXNlU2VtYW50aWNEYXRlUmFuZ2UiLCJiU2VtYW50aWNEYXRlUmFuZ2UiLCJDb21tb25IZWxwZXIiLCJnZXRMb2NhdGlvbkZvclByb3BlcnR5UGF0aCIsIm9GaWx0ZXJSZXN0cmljdGlvbnMiLCJDb21tb25VdGlscyIsImdldEZpbHRlclJlc3RyaWN0aW9uc0J5UGF0aCIsIkZpbHRlckFsbG93ZWRFeHByZXNzaW9ucyIsImdldFNlbWFudGljS2V5VGl0bGUiLCJzUHJvcGVydHlUZXh0VmFsdWUiLCJzUHJvcGVydHlWYWx1ZSIsInNEYXRhRmllbGQiLCJvVGV4dEFycmFuZ2VtZW50Iiwic1NlbWFudGljS2V5U3R5bGUiLCJvRHJhZnRSb290Iiwic05ld09iamVjdCIsIlJlc291cmNlTW9kZWwiLCJnZXRUZXh0Iiwic1VubmFtZWRPYmplY3QiLCJzTmV3T2JqZWN0RXhwcmVzc2lvbiIsInNVbm5uYW1lZE9iamVjdEV4cHJlc3Npb24iLCJzU2VtYW50aWNLZXlUaXRsZUV4cHJlc3Npb24iLCJhZGROZXdPYmplY3RVbk5hbWVkT2JqZWN0RXhwcmVzc2lvbiIsInNWYWx1ZSIsImJ1aWxkRXhwcmVzc2lvbkZvclNlbWFudGlja0tleVRpdGxlIiwiYklzRXhwcmVzc2lvbkJpbmRpbmciLCJzVGV4dEFycmFuZ2VtZW50IiwiZ2V0T2JqZWN0SWRlbnRpZmllclRleHQiLCJzUHJvcGVydHlWYWx1ZUJpbmRpbmciLCJzRGF0YUZpZWxkTmFtZSIsImdldFNlbWFudGljT2JqZWN0c0xpc3QiLCJwcm9wZXJ0eUFubm90YXRpb25zIiwiYVNlbWFudGljT2JqZWN0cyIsImtleSIsInNlbWFudGljT2JqZWN0VmFsdWUiLCJwdXNoIiwib1NlbWFudGljT2JqZWN0c01vZGVsIiwiSlNPTk1vZGVsIiwiJCR2YWx1ZUFzUHJvbWlzZSIsImdldFNlbWFudGljT2JqZWN0c1F1YWxpZmllcnMiLCJxdWFsaWZpZXJzQW5ub3RhdGlvbnMiLCJmaW5kT2JqZWN0IiwicXVhbGlmaWVyIiwiZmluZCIsIm9iamVjdCIsImFubm90YXRpb25Db250ZW50IiwiYW5ub3RhdGlvbiIsInNwbGl0IiwicXVhbGlmaWVyT2JqZWN0IiwiZmlsdGVyIiwib1F1YWxpZmllciIsIm9RdWFsaWZpZXJzTW9kZWwiLCJjb21wdXRlU2VtYW50aWNMaW5rTW9kZWxDb250ZXh0Q2hhbmdlIiwiaGFzU2VtYW50aWNPYmplY3RzV2l0aFBhdGgiLCJzUGF0aFRvUHJvcGVydHkiLCJiU2VtYW50aWNPYmplY3RIYXNBUGF0aCIsImlzU2VtYW50aWNLZXlIYXNGaWVsZEdyb3VwQ29sdW1uIiwiaXNGaWVsZEdyb3VwQ29sdW1uIiwiY29tcHV0ZUZpZWxkQmFzZURlbGVnYXRlIiwiZGVsZWdhdGVOYW1lIiwicmV0cmlldmVUZXh0RnJvbVZhbHVlTGlzdCIsIkpTT04iLCJzdHJpbmdpZnkiLCJwYXlsb2FkIiwiX2dldFByaW1hcnlJbnRlbnRzIiwiYVNlbWFudGljT2JqZWN0c0xpc3QiLCJhUHJvbWlzZXMiLCJvVXNoZWxsQ29udGFpbmVyIiwic2FwIiwidXNoZWxsIiwiQ29udGFpbmVyIiwib1NlcnZpY2UiLCJnZXRTZXJ2aWNlIiwiZm9yRWFjaCIsInNlbU9iamVjdCIsImdldFByaW1hcnlJbnRlbnQiLCJQcm9taXNlIiwiYWxsIiwiYVNlbU9iamVjdFByaW1hcnlBY3Rpb24iLCJjYXRjaCIsIm9FcnJvciIsIkxvZyIsImVycm9yIiwiX1NlbWFudGljT2JqZWN0c0hhc1ByaW1hcnlBY3Rpb24iLCJvU2VtYW50aWNzIiwiYVNlbWFudGljT2JqZWN0c1ByaW1hcnlBY3Rpb25zIiwiX2ZuSXNTZW1hbnRpY09iamVjdEFjdGlvblVuYXZhaWxhYmxlIiwiX29TZW1hbnRpY3MiLCJfb1ByaW1hcnlBY3Rpb24iLCJfaW5kZXgiLCJ1bmF2YWlsYWJsZUFjdGlvbnNJbmRleCIsInNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zIiwiYWN0aW9ucyIsImludGVudCIsInNlbWFudGljUHJpbWFyeUFjdGlvbnMiLCJvUHJpbWFyeUFjdGlvbiIsInNlbWFudGljT2JqZWN0cyIsIm1haW5TZW1hbnRpY09iamVjdCIsInNDdXJyZW50SGFzaCIsImdldEhhc2giLCJpbmRleCIsInNlbWFudGljT2JqZWN0IiwiY2hlY2tQcmltYXJ5QWN0aW9ucyIsImJHZXRUaXRsZUxpbmsiLCJ0aXRsZUxpbmsiLCJoYXNUaXRsZUxpbmsiLCJfZ2V0VGl0bGVMaW5rV2l0aFBhcmFtZXRlcnMiLCJfb1NlbWFudGljT2JqZWN0TW9kZWwiLCJfbGlua0ludGVudCIsInRpdGxlbGluayIsImdldFByaW1hcnlBY3Rpb24iLCJwcmltYXJ5SW50ZW50QWN0aW9uIiwib3BlcmF0b3JzIiwic1NldHRpbmdzIiwiY29udGV4dFBhdGgiLCJwcm9wZXJ0eVR5cGUiLCIkVHlwZSIsImdldE9wZXJhdG9yc0Zvckd1aWRQcm9wZXJ0eSIsInNsaWNlIiwiaXNUYWJsZUJvdW5kVG9OYXZpZ2F0aW9uIiwiaXNOYXZpZ2F0aW9uUGF0aCIsIm5hdmlnYXRpb25QYXRoIiwicHJvcGVydHlQYXRoIiwiZ2V0T3BlcmF0b3JzRm9yUHJvcGVydHkiLCJNb2RlbEhlbHBlciIsImdldEVudGl0eVNldFBhdGgiLCJ0b1N0cmluZyIsImdldE9wZXJhdG9yc0ZvckRhdGVQcm9wZXJ0eSIsImdldFByb3BlcnR5Q29udGV4dEZvclF1aWNrVmlldyIsIm9EYXRhRmllbGRDb250ZXh0IiwiZW5kc1dpdGgiLCJnZXRQcm9wZXJ0eVBhdGhGb3JRdWlja1ZpZXciLCJnZXREYXRhRmllbGREZWZhdWx0Iiwib0RhdGFGaWVsZERlZmF1bHQiLCJpc0RhdGFGaWVsZEFjdGlvbkJ1dHRvblZpc2libGUiLCJvVGhpcyIsImJJc0JvdW5kIiwib0FjdGlvbkNvbnRleHQiLCJnZXRQcmVzc0V2ZW50Rm9yRGF0YUZpZWxkQWN0aW9uQnV0dG9uIiwic0ludm9jYXRpb25Hcm91cGluZyIsIkludm9jYXRpb25Hcm91cGluZyIsImJJc05hdmlnYWJsZSIsIm5hdmlnYXRlQWZ0ZXJBY3Rpb24iLCJlbnRpdGllcyIsImVudGl0eVNldCIsImVudGl0eVNldE5hbWUiLCJvUGFyYW1zIiwiY29udGV4dHMiLCJpbnZvY2F0aW9uR3JvdXBpbmciLCJhZGRTaW5nbGVRdW90ZXMiLCJtb2RlbCIsImxhYmVsIiwiTGFiZWwiLCJpc05hdmlnYWJsZSIsImdlbmVyYXRlRnVuY3Rpb24iLCJBY3Rpb24iLCJvYmplY3RUb1N0cmluZyIsImlzTnVtZXJpY0RhdGFUeXBlIiwic0RhdGFGaWVsZFR5cGUiLCJfc0RhdGFGaWVsZFR5cGUiLCJhTnVtZXJpY0RhdGFUeXBlcyIsImlzRGF0ZU9yVGltZURhdGFUeXBlIiwiYURhdGVUaW1lRGF0YVR5cGVzIiwiaXNEYXRlVGltZURhdGFUeXBlIiwiYURhdGVEYXRhVHlwZXMiLCJpc0RhdGVEYXRhVHlwZSIsImlzVGltZURhdGFUeXBlIiwiZ2V0VW5kZXJseWluZ1Byb3BlcnR5RGF0YVR5cGUiLCJvQW5ub3RhdGlvbnMiLCJzRW50aXR5UGF0aCIsInNUeXBlIiwic1RleHRBbm5vdGF0aW9uIiwic1RleHRBcnJhbmdlbWVudEFubm90YXRpb24iLCJnZXRDb2x1bW5BbGlnbm1lbnQiLCJvVGFibGUiLCJjb2xsZWN0aW9uIiwiSW5saW5lIiwiSWNvblVybCIsImFTZW1hbnRpY0tleXMiLCJiSXNTZW1hbnRpY0tleSIsImV2ZXJ5Iiwib0tleSIsImdldERhdGFGaWVsZEFsaWdubWVudCIsImdldFByb3BlcnR5QWxpZ25tZW50Iiwib0Zvcm1hdE9wdGlvbnMiLCJvQ29tcHV0ZWRFZGl0TW9kZSIsInNEZWZhdWx0QWxpZ25tZW50Iiwic1RleHRBbGlnbm1lbnQiLCJ0ZXh0QWxpZ25Nb2RlIiwiZ2V0QWxpZ25tZW50RXhwcmVzc2lvbiIsInNEYXRhRmllbGRQYXRoIiwiVGFyZ2V0IiwiJEFubm90YXRpb25QYXRoIiwib0ZpZWxkR3JvdXAiLCJEYXRhIiwiZ2V0VHlwZUFsaWdubWVudCIsImZ1bGx5UXVhbGlmaWVkTmFtZSIsImlzRGF0YUZpZWxkQWN0aW9uQnV0dG9uRW5hYmxlZCIsInNBY3Rpb25Db250ZXh0Rm9ybWF0IiwiZ2V0TGFiZWxUZXh0Rm9yRGF0YUZpZWxkIiwib0VudGl0eVNldE1vZGVsIiwib1Byb3BlcnR5UGF0aCIsInNQcm9wZXJ0eVBhdGhCdWlsZEV4cHJlc3Npb24iLCJzVWlOYW1lIiwic1Byb3BlcnR5RnVsbFBhdGgiLCJzRGlzcGxheUZvcm1hdCIsInNldE1ldGFNb2RlbCIsImNvbXB1dGVMYWJlbFRleHQiLCJzRGF0YUZpZWxkTGFiZWwiLCJzRGF0YUZpZWxkVGFyZ2V0VGl0bGUiLCJzRGF0YUZpZWxkVGFyZ2V0TGFiZWwiLCJzRGF0YUZpZWxkVmFsdWVMYWJlbCIsInNEYXRhRmllbGRUYXJnZXRWYWx1ZUxhYmVsIiwiYnVpbGRFeHByZXNzaW9uRm9yQWxpZ25JdGVtcyIsInNWaXN1YWxpemF0aW9uIiwiZmllbGRWaXN1YWxpemF0aW9uQmluZGluZ0V4cHJlc3Npb24iLCJjb25zdGFudCIsInByb2dyZXNzVmlzdWFsaXphdGlvbkJpbmRpbmdFeHByZXNzaW9uIiwicmF0aW5nVmlzdWFsaXphdGlvbkJpbmRpbmdFeHByZXNzaW9uIiwiaWZFbHNlIiwib3IiLCJlcXVhbCIsIlVJIiwiSXNFZGl0YWJsZSIsImhhc1ZhbHVlSGVscEFubm90YXRpb24iLCJnZXRBUERpYWxvZ0Rpc3BsYXlGb3JtYXQiLCJvQW5ub3RhdGlvbiIsIiROYW1lIiwib0FjdGlvblBhcmFtZXRlckFubm90YXRpb25zIiwib1ZhbHVlSGVscEFubm90YXRpb24iLCJnZXRWYWx1ZUxpc3RQcm9wZXJ0eU5hbWUiLCJvVmFsdWVMaXN0Iiwib1ZhbHVlTGlzdFBhcmFtZXRlciIsIlBhcmFtZXRlcnMiLCJvUGFyYW1ldGVyIiwiTG9jYWxEYXRhUHJvcGVydHkiLCJWYWx1ZUxpc3RQcm9wZXJ0eSIsInNWYWx1ZUxpc3RQcm9wZXJ0eU5hbWUiLCJjb21wdXRlRGlzcGxheU1vZGUiLCJDb2xsZWN0aW9uUGF0aCIsInJlcXVlc3RWYWx1ZUxpc3RJbmZvIiwib1ZhbHVlTGlzdEluZm8iLCIkbW9kZWwiLCJnZXRNZXRhTW9kZWwiLCJnZXRBY3Rpb25QYXJhbWV0ZXJEaWFsb2dGaWVsZEhlbHAiLCJvQWN0aW9uUGFyYW1ldGVyIiwic1NhcFVJTmFtZSIsInNQYXJhbU5hbWUiLCJnZXRWYWx1ZUhlbHBEZWxlZ2F0ZSIsImlzQm91bmQiLCJlbnRpdHlUeXBlUGF0aCIsInNhcFVJTmFtZSIsInBhcmFtTmFtZSIsImRlbGVnYXRlQ29uZmlndXJhdGlvbiIsIlZhbHVlTGlzdEhlbHBlciIsImdldFByb3BlcnR5UGF0aCIsIlVuYm91bmRBY3Rpb24iLCJFbnRpdHlUeXBlUGF0aCIsIlByb3BlcnR5IiwicXVhbGlmaWVycyIsInZhbHVlSGVscFF1YWxpZmllciIsImlzQWN0aW9uUGFyYW1ldGVyRGlhbG9nIiwiZ2V0VmFsdWVIZWxwRGVsZWdhdGVGb3JOb25Db21wdXRlZFZpc2libGVLZXlGaWVsZCIsIl9nZXRFbnRpdHlTZXRGcm9tTXVsdGlMZXZlbCIsInNTb3VyY2VFbnRpdHkiLCJpU3RhcnQiLCJpRGlmZiIsImFOYXZQYXJ0cyIsIkJvb2xlYW4iLCJzUGFydCIsImdldFByb3BlcnR5Q29sbGVjdGlvbiIsIm9Db250ZXh0T2JqZWN0IiwiYU1haW5FbnRpdHlQYXJ0cyIsInNNYWluRW50aXR5Iiwic0ZpZWxkU291cmNlRW50aXR5IiwiaUFubm9JbmRleCIsInNJbm5lclBhdGgiLCJzdWJzdHJpbmciLCJnZXRVbml0T3JDdXJyZW5jeSIsIm9Qcm9wZXJ0eUFubm90YXRpb25zT2JqZWN0Iiwic0Fubm90YXRpb25QYXRoIiwiaGFzU3RhdGljVW5pdE9yQ3VycmVuY3kiLCJnZXRTdGF0aWNVbml0T3JDdXJyZW5jeSIsIm1lYXN1cmVEaXNwbGF5TW9kZSIsInVuaXQiLCJkYXRlRm9ybWF0IiwiRGF0ZUZvcm1hdCIsImdldERhdGVJbnN0YW5jZSIsImxvY2FsZURhdGEiLCJvTG9jYWxlRGF0YSIsIm1EYXRhIiwidW5pdHMiLCJzaG9ydCIsImRpc3BsYXlOYW1lIiwiZ2V0RW1wdHlJbmRpY2F0b3JUcmlnZ2VyIiwiYkFjdGl2ZSIsInNCaW5kaW5nIiwic0Z1bGxUZXh0QmluZGluZyIsImdldEJpbmRpbmdJbmZvRm9yVGV4dEFycmFuZ2VtZW50Iiwib0RhdGFGaWVsZFRleHRBcnJhbmdlbWVudCIsInNlbWFudGljS2V5Rm9ybWF0IiwidlJhdyIsImFyZ3VtZW50cyIsImdyb3VwaW5nRW5hYmxlZCIsImZvcm1hdCIsImdldElzTWVkaWFDb250ZW50VHlwZU51bGxFeHByIiwic09wZXJhdG9yIiwiZ2V0UGF0aEZvckljb25Tb3VyY2UiLCJnZXRGaWxlbmFtZUV4cHIiLCJzRmlsZW5hbWUiLCJzTm9GaWxlbmFtZVRleHQiLCJjYWxjdWxhdGVNQmZyb21CeXRlIiwiaUJ5dGUiLCJ0b0ZpeGVkIiwiZ2V0RG93bmxvYWRVcmwiLCJnZXRNYXJnaW5DbGFzcyIsImNvbXBhY3RTZW1hbnRpY0tleSIsImdldFJlcXVpcmVkIiwiaW1tdXRhYmxlS2V5IiwidGFyZ2V0IiwicmVxdWlyZWRQcm9wZXJ0aWVzIiwidGFyZ2V0UmVxdWlyZWRFeHByZXNzaW9uIiwiaXNSZXF1aXJlZEV4cHJlc3Npb24iLCJpc0ZpZWxkUGFydE9mRm9ybSIsImRhdGFGaWVsZENvbGxlY3Rpb24iLCJkYXRhRmllbGRPYmplY3RQYXRoIiwiY29ubmVjdGVkRGF0YUZpZWxkS2V5IiwiS2V5SGVscGVyIiwiZ2VuZXJhdGVLZXlGcm9tRGF0YUZpZWxkIiwiaXNGaWVsZEZvdW5kIiwiZmllbGQiLCJyZXF1aXJlc0lDb250ZXh0Il0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJGaWVsZEhlbHBlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IFByb3BlcnR5IH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzXCI7XG5pbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCB0eXBlIHsgRm9ybUVsZW1lbnQgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9Db21tb24vRm9ybVwiO1xuaW1wb3J0IHsgVUkgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL0JpbmRpbmdIZWxwZXJcIjtcbmltcG9ydCB7IEtleUhlbHBlciB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvS2V5XCI7XG5pbXBvcnQgdHlwZSB7IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQgeyBjb21waWxlRXhwcmVzc2lvbiwgY29uc3RhbnQsIGVxdWFsLCBpZkVsc2UsIG9yLCBwYXRoSW5Nb2RlbCB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQgTW9kZWxIZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTW9kZWxIZWxwZXJcIjtcbmltcG9ydCBTaWRlRWZmZWN0c0hlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9TaWRlRWZmZWN0c0hlbHBlclwiO1xuaW1wb3J0IHsgZ2VuZXJhdGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9TdGFibGVJZEhlbHBlclwiO1xuaW1wb3J0IHsgRGF0YU1vZGVsT2JqZWN0UGF0aCB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL0RhdGFNb2RlbFBhdGhIZWxwZXJcIjtcbmltcG9ydCB7IGlzUmVxdWlyZWRFeHByZXNzaW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRmllbGRDb250cm9sSGVscGVyXCI7XG5pbXBvcnQgeyBpc1Byb3BlcnR5IH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvUHJvcGVydHlIZWxwZXJcIjtcbmltcG9ydCB7IGdldEFsaWdubWVudEV4cHJlc3Npb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9VSUZvcm1hdHRlcnNcIjtcbmltcG9ydCBDb21tb25IZWxwZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvQ29tbW9uSGVscGVyXCI7XG5pbXBvcnQgdHlwZSB7IFZhbHVlSGVscFBheWxvYWQgfSBmcm9tIFwic2FwL2ZlL21hY3Jvcy9pbnRlcm5hbC92YWx1ZWhlbHAvVmFsdWVMaXN0SGVscGVyXCI7XG5pbXBvcnQgVmFsdWVMaXN0SGVscGVyIGZyb20gXCJzYXAvZmUvbWFjcm9zL2ludGVybmFsL3ZhbHVlaGVscC9WYWx1ZUxpc3RIZWxwZXJcIjtcbmltcG9ydCBSZXNvdXJjZU1vZGVsIGZyb20gXCJzYXAvZmUvbWFjcm9zL1Jlc291cmNlTW9kZWxcIjtcbmltcG9ydCBNYW5hZ2VkT2JqZWN0IGZyb20gXCJzYXAvdWkvYmFzZS9NYW5hZ2VkT2JqZWN0XCI7XG5pbXBvcnQgRGF0ZUZvcm1hdCBmcm9tIFwic2FwL3VpL2NvcmUvZm9ybWF0L0RhdGVGb3JtYXRcIjtcbmltcG9ydCBKU09OTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9qc29uL0pTT05Nb2RlbFwiO1xuaW1wb3J0IEFubm90YXRpb25IZWxwZXIgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Bbm5vdGF0aW9uSGVscGVyXCI7XG5cbmltcG9ydCB0eXBlIEJhc2VDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvQ29udGV4dFwiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L0NvbnRleHRcIjtcbmltcG9ydCB0eXBlIE9EYXRhTWV0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFNZXRhTW9kZWxcIjtcblxuY29uc3QgSVNPQ3VycmVuY3kgPSBcIkBPcmcuT0RhdGEuTWVhc3VyZXMuVjEuSVNPQ3VycmVuY3lcIixcblx0VW5pdCA9IFwiQE9yZy5PRGF0YS5NZWFzdXJlcy5WMS5Vbml0XCI7XG5cbi8qKlxuICogV2hhdCBkb2VzIHRoZSBtYXAgbG9vayBsaWtlP1xuICogICAge1xuICogIFx0J25hbWVzcGFjZS5vZi5lbnRpdHlUeXBlJyA6IFtcbiAqIFx0XHRcdFtuYW1lc3BhY2Uub2YuZW50aXR5VHlwZTEjUXVhbGlmaWVyLG5hbWVzcGFjZS5vZi5lbnRpdHlUeXBlMiNRdWFsaWZpZXJdLCAtLT4gU2VhcmNoIEZvcjogbWFwcGluZ1NvdXJjZUVudGl0aWVzXG4gKiBcdFx0XHR7XG4gKiBcdFx0XHRcdCdwcm9wZXJ0eScgOiBbbmFtZXNwYWNlLm9mLmVudGl0eVR5cGUzI1F1YWxpZmllcixuYW1lc3BhY2Uub2YuZW50aXR5VHlwZTQjUXVhbGlmaWVyXSAtLT4gU2VhcmNoIEZvcjogbWFwcGluZ1NvdXJjZVByb3BlcnRpZXNcbiAqIFx0XHRcdH1cbiAqIFx0fS5cbiAqXG4gKiBAcGFyYW0gb0ludGVyZmFjZSBJbnRlcmZhY2UgaW5zdGFuY2VcbiAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2ZWQgd2hlbiB0aGUgbWFwIGlzIHJlYWR5IGFuZCBwcm92aWRlcyB0aGUgbWFwXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIF9nZW5lcmF0ZVNpZGVFZmZlY3RzTWFwKG9JbnRlcmZhY2U6IGFueSkge1xuXHRjb25zdCBvTWV0YU1vZGVsID0gb0ludGVyZmFjZS5nZXRNb2RlbCgpO1xuXHRjb25zdCBvRmllbGRTZXR0aW5ncyA9IG9JbnRlcmZhY2UuZ2V0U2V0dGluZyhcInNhcC5mZS5tYWNyb3MuaW50ZXJuYWwuRmllbGRcIik7XG5cdGNvbnN0IG9TaWRlRWZmZWN0cyA9IG9GaWVsZFNldHRpbmdzLnNpZGVFZmZlY3RzO1xuXG5cdC8vIEdlbmVyYXRlIG1hcCBvbmNlXG5cdGlmIChvU2lkZUVmZmVjdHMpIHtcblx0XHRyZXR1cm4gb1NpZGVFZmZlY3RzO1xuXHR9XG5cblx0cmV0dXJuIFNpZGVFZmZlY3RzSGVscGVyLmdlbmVyYXRlU2lkZUVmZmVjdHNNYXBGcm9tTWV0YU1vZGVsKG9NZXRhTW9kZWwpO1xufVxuXG5jb25zdCBGaWVsZEhlbHBlciA9IHtcblx0LyoqXG5cdCAqIERldGVybWluZSBob3cgdG8gc2hvdyB0aGUgdmFsdWUgYnkgYW5hbHl6aW5nIFRleHQgYW5kIFRleHRBcnJhbmdlbWVudCBBbm5vdGF0aW9ucy5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIHNhcC5mZS5tYWNyb3MuZmllbGQuRmllbGRIZWxwZXIjZGlzcGxheU1vZGVcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5tYWNyb3MuZmllbGQuRmllbGRIZWxwZXJcblx0ICogQHN0YXRpY1xuXHQgKiBAcGFyYW0gb1Byb3BlcnR5QW5ub3RhdGlvbnMgVGhlIFByb3BlcnR5IGFubm90YXRpb25zXG5cdCAqIEBwYXJhbSBvQ29sbGVjdGlvbkFubm90YXRpb25zIFRoZSBFbnRpdHlUeXBlIGFubm90YXRpb25zXG5cdCAqIEByZXR1cm5zIFRoZSBkaXNwbGF5IG1vZGUgb2YgdGhlIGZpZWxkXG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKi9cblx0ZGlzcGxheU1vZGU6IGZ1bmN0aW9uIChvUHJvcGVydHlBbm5vdGF0aW9uczogYW55LCBvQ29sbGVjdGlvbkFubm90YXRpb25zOiBhbnkpIHtcblx0XHRjb25zdCBvVGV4dEFubm90YXRpb24gPSBvUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGV4dFwiXSxcblx0XHRcdG9UZXh0QXJyYW5nZW1lbnRBbm5vdGF0aW9uID1cblx0XHRcdFx0b1RleHRBbm5vdGF0aW9uICYmXG5cdFx0XHRcdCgob1Byb3BlcnR5QW5ub3RhdGlvbnMgJiZcblx0XHRcdFx0XHRvUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGV4dEBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5UZXh0QXJyYW5nZW1lbnRcIl0pIHx8XG5cdFx0XHRcdFx0KG9Db2xsZWN0aW9uQW5ub3RhdGlvbnMgJiYgb0NvbGxlY3Rpb25Bbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5UZXh0QXJyYW5nZW1lbnRcIl0pKTtcblxuXHRcdGlmIChvVGV4dEFycmFuZ2VtZW50QW5ub3RhdGlvbikge1xuXHRcdFx0aWYgKG9UZXh0QXJyYW5nZW1lbnRBbm5vdGF0aW9uLiRFbnVtTWVtYmVyID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlRleHRBcnJhbmdlbWVudFR5cGUvVGV4dE9ubHlcIikge1xuXHRcdFx0XHRyZXR1cm4gXCJEZXNjcmlwdGlvblwiO1xuXHRcdFx0fSBlbHNlIGlmIChvVGV4dEFycmFuZ2VtZW50QW5ub3RhdGlvbi4kRW51bU1lbWJlciA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5UZXh0QXJyYW5nZW1lbnRUeXBlL1RleHRMYXN0XCIpIHtcblx0XHRcdFx0cmV0dXJuIFwiVmFsdWVEZXNjcmlwdGlvblwiO1xuXHRcdFx0fVxuXHRcdFx0Ly9EZWZhdWx0IHNob3VsZCBiZSBUZXh0Rmlyc3QgaWYgdGhlcmUgaXMgYSBUZXh0IGFubm90YXRpb24gYW5kIG5laXRoZXIgVGV4dE9ubHkgbm9yIFRleHRMYXN0IGFyZSBzZXRcblx0XHRcdHJldHVybiBcIkRlc2NyaXB0aW9uVmFsdWVcIjtcblx0XHR9XG5cdFx0cmV0dXJuIG9UZXh0QW5ub3RhdGlvbiA/IFwiRGVzY3JpcHRpb25WYWx1ZVwiIDogXCJWYWx1ZVwiO1xuXHR9LFxuXHRidWlsZEV4cHJlc3Npb25Gb3JUZXh0VmFsdWU6IGZ1bmN0aW9uIChzUHJvcGVydHlQYXRoOiBhbnksIG9EYXRhRmllbGQ6IGFueSkge1xuXHRcdGNvbnN0IG9NZXRhTW9kZWwgPSBvRGF0YUZpZWxkLmNvbnRleHQuZ2V0TW9kZWwoKTtcblx0XHRjb25zdCBzUGF0aCA9IG9EYXRhRmllbGQuY29udGV4dC5nZXRQYXRoKCk7XG5cdFx0Y29uc3Qgb1RleHRBbm5vdGF0aW9uQ29udGV4dCA9IG9NZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoYCR7c1BhdGh9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5UZXh0YCk7XG5cdFx0Y29uc3Qgb1RleHRBbm5vdGF0aW9uID0gb1RleHRBbm5vdGF0aW9uQ29udGV4dC5nZXRQcm9wZXJ0eSgpO1xuXHRcdGNvbnN0IHNUZXh0RXhwcmVzc2lvbiA9IG9UZXh0QW5ub3RhdGlvbiA/IEFubm90YXRpb25IZWxwZXIudmFsdWUob1RleHRBbm5vdGF0aW9uLCB7IGNvbnRleHQ6IG9UZXh0QW5ub3RhdGlvbkNvbnRleHQgfSkgOiB1bmRlZmluZWQ7XG5cdFx0bGV0IHNFeHByZXNzaW9uOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBcIlwiO1xuXHRcdHNQcm9wZXJ0eVBhdGggPSBBbm5vdGF0aW9uSGVscGVyLmdldE5hdmlnYXRpb25QYXRoKHNQcm9wZXJ0eVBhdGgpO1xuXHRcdGlmIChzUHJvcGVydHlQYXRoLmluZGV4T2YoXCIvXCIpID4gLTEgJiYgc1RleHRFeHByZXNzaW9uKSB7XG5cdFx0XHRzRXhwcmVzc2lvbiA9IHNQcm9wZXJ0eVBhdGgucmVwbGFjZSgvW15cXC9dKiQvLCBzVGV4dEV4cHJlc3Npb24uc3Vic3RyKDEsIHNUZXh0RXhwcmVzc2lvbi5sZW5ndGggLSAyKSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNFeHByZXNzaW9uID0gc1RleHRFeHByZXNzaW9uO1xuXHRcdH1cblx0XHRpZiAoc0V4cHJlc3Npb24pIHtcblx0XHRcdHNFeHByZXNzaW9uID0gXCJ7IHBhdGggOiAnXCIgKyBzRXhwcmVzc2lvbi5yZXBsYWNlKC9eXFx7Ky9nLCBcIlwiKS5yZXBsYWNlKC9cXH0rJC9nLCBcIlwiKSArIFwiJywgcGFyYW1ldGVyczogeyckJG5vUGF0Y2gnOiB0cnVlfX1cIjtcblx0XHR9XG5cdFx0cmV0dXJuIHNFeHByZXNzaW9uO1xuXHR9LFxuXG5cdGJ1aWxkVGFyZ2V0UGF0aEZyb21EYXRhTW9kZWxPYmplY3RQYXRoOiBmdW5jdGlvbiAob0RhdGFNb2RlbE9iamVjdFBhdGg6IGFueSkge1xuXHRcdGNvbnN0IHNTYXJ0RW50aXR5U2V0ID0gb0RhdGFNb2RlbE9iamVjdFBhdGguc3RhcnRpbmdFbnRpdHlTZXQubmFtZTtcblx0XHRsZXQgc1BhdGggPSBgLyR7c1NhcnRFbnRpdHlTZXR9YDtcblx0XHRjb25zdCBhTmF2aWdhdGlvblByb3BlcnRpZXMgPSBvRGF0YU1vZGVsT2JqZWN0UGF0aC5uYXZpZ2F0aW9uUHJvcGVydGllcztcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGFOYXZpZ2F0aW9uUHJvcGVydGllcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0c1BhdGggKz0gYC8ke2FOYXZpZ2F0aW9uUHJvcGVydGllc1tpXS5uYW1lfWA7XG5cdFx0fVxuXHRcdHJldHVybiBzUGF0aDtcblx0fSxcblx0aGFzU2VtYW50aWNPYmplY3RUYXJnZXRzOiBmdW5jdGlvbiAob1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCkge1xuXHRcdGNvbnN0IG9Qcm9wZXJ0eURlZmluaXRpb24gPSBpc1Byb3BlcnR5KG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0KVxuXHRcdFx0PyBvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdFxuXHRcdFx0OiAob1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QuJHRhcmdldCBhcyBQcm9wZXJ0eSk7XG5cdFx0Y29uc3Qgc1NlbWFudGljT2JqZWN0ID0gb1Byb3BlcnR5RGVmaW5pdGlvbi5hbm5vdGF0aW9ucz8uQ29tbW9uPy5TZW1hbnRpY09iamVjdDtcblx0XHRjb25zdCBhU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMgPSBvUHJvcGVydHlEZWZpbml0aW9uLmFubm90YXRpb25zPy5Db21tb24/LlNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zO1xuXHRcdGNvbnN0IHNQcm9wZXJ0eUxvY2F0aW9uUGF0aCA9IEZpZWxkSGVscGVyLmJ1aWxkVGFyZ2V0UGF0aEZyb21EYXRhTW9kZWxPYmplY3RQYXRoKG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgpO1xuXHRcdGNvbnN0IHNQcm9wZXJ0eVBhdGggPSBgJHtzUHJvcGVydHlMb2NhdGlvblBhdGh9LyR7b1Byb3BlcnR5RGVmaW5pdGlvbi5uYW1lfWA7XG5cdFx0bGV0IHNCaW5kaW5nRXhwcmVzc2lvbjtcblx0XHRpZiAoKHNTZW1hbnRpY09iamVjdCBhcyBhbnkpPy5wYXRoKSB7XG5cdFx0XHRzQmluZGluZ0V4cHJlc3Npb24gPSBjb21waWxlRXhwcmVzc2lvbihwYXRoSW5Nb2RlbCgoc1NlbWFudGljT2JqZWN0IGFzIGFueSkucGF0aCkpO1xuXHRcdH1cblx0XHRpZiAoc1Byb3BlcnR5UGF0aCAmJiAoc0JpbmRpbmdFeHByZXNzaW9uIHx8IChzU2VtYW50aWNPYmplY3Q/LnZhbHVlT2YoKSBhcyBhbnkpPy5sZW5ndGggPiAwKSkge1xuXHRcdFx0Y29uc3Qgc0FsdGVybmF0ZVBhdGggPSBzUHJvcGVydHlQYXRoLnJlcGxhY2UoL1xcLy9nLCBcIl9cIik7IC8vcmVwbGFjZUFsbChcIi9cIixcIl9cIik7XG5cdFx0XHRpZiAoIXNCaW5kaW5nRXhwcmVzc2lvbikge1xuXHRcdFx0XHRjb25zdCBzQmluZGluZ1BhdGggPVxuXHRcdFx0XHRcdFwicGFnZUludGVybmFsPnNlbWFudGljc1RhcmdldHMvXCIgK1xuXHRcdFx0XHRcdHNTZW1hbnRpY09iamVjdD8udmFsdWVPZigpICtcblx0XHRcdFx0XHRcIi9cIiArXG5cdFx0XHRcdFx0c0FsdGVybmF0ZVBhdGggK1xuXHRcdFx0XHRcdCghYVNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zID8gXCIvSGFzVGFyZ2V0c05vdEZpbHRlcmVkXCIgOiBcIi9IYXNUYXJnZXRzXCIpO1xuXHRcdFx0XHRyZXR1cm4gXCJ7cGFydHM6W3twYXRoOidcIiArIHNCaW5kaW5nUGF0aCArIFwiJ31dLCBmb3JtYXR0ZXI6J0ZpZWxkUnVudGltZS5oYXNUYXJnZXRzJ31cIjtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIFNlbWFudGljIE9iamVjdCBOYW1lIGlzIGEgcGF0aCB3ZSByZXR1cm4gdW5kZWZpbmVkXG5cdFx0XHRcdC8vIHRoaXMgd2lsbCBiZSB1cGRhdGVkIGxhdGVyIHZpYSBtb2RlbENvbnRleHRDaGFuZ2Vcblx0XHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0fSxcblx0Z2V0U3RhdGVEZXBlbmRpbmdPblNlbWFudGljT2JqZWN0VGFyZ2V0czogZnVuY3Rpb24gKG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgpIHtcblx0XHRjb25zdCBvUHJvcGVydHlEZWZpbml0aW9uID0gaXNQcm9wZXJ0eShvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdClcblx0XHRcdD8gb1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3Rcblx0XHRcdDogKG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0LiR0YXJnZXQgYXMgUHJvcGVydHkpO1xuXHRcdGNvbnN0IHNTZW1hbnRpY09iamVjdCA9IG9Qcm9wZXJ0eURlZmluaXRpb24uYW5ub3RhdGlvbnM/LkNvbW1vbj8uU2VtYW50aWNPYmplY3Q7XG5cdFx0Y29uc3QgYVNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zID0gb1Byb3BlcnR5RGVmaW5pdGlvbi5hbm5vdGF0aW9ucz8uQ29tbW9uPy5TZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucztcblx0XHRjb25zdCBzUHJvcGVydHlMb2NhdGlvblBhdGggPSBGaWVsZEhlbHBlci5idWlsZFRhcmdldFBhdGhGcm9tRGF0YU1vZGVsT2JqZWN0UGF0aChvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoKTtcblx0XHRjb25zdCBzUHJvcGVydHlQYXRoID0gYCR7c1Byb3BlcnR5TG9jYXRpb25QYXRofS8ke29Qcm9wZXJ0eURlZmluaXRpb24ubmFtZX1gO1xuXHRcdGxldCBzQmluZGluZ0V4cHJlc3Npb247XG5cdFx0aWYgKChzU2VtYW50aWNPYmplY3QgYXMgYW55KT8ucGF0aCkge1xuXHRcdFx0c0JpbmRpbmdFeHByZXNzaW9uID0gY29tcGlsZUV4cHJlc3Npb24ocGF0aEluTW9kZWwoKHNTZW1hbnRpY09iamVjdCBhcyBhbnkpLnBhdGgpKTtcblx0XHR9XG5cdFx0aWYgKHNQcm9wZXJ0eVBhdGggJiYgKHNCaW5kaW5nRXhwcmVzc2lvbiB8fCAoc1NlbWFudGljT2JqZWN0Py52YWx1ZU9mKCkgYXMgYW55KT8ubGVuZ3RoID4gMCkpIHtcblx0XHRcdGNvbnN0IHNBbHRlcm5hdGVQYXRoID0gc1Byb3BlcnR5UGF0aC5yZXBsYWNlKC9cXC8vZywgXCJfXCIpO1xuXHRcdFx0aWYgKCFzQmluZGluZ0V4cHJlc3Npb24pIHtcblx0XHRcdFx0Y29uc3Qgc0JpbmRpbmdQYXRoID0gYHBhZ2VJbnRlcm5hbD5zZW1hbnRpY3NUYXJnZXRzLyR7c1NlbWFudGljT2JqZWN0Py52YWx1ZU9mKCl9LyR7c0FsdGVybmF0ZVBhdGh9JHtcblx0XHRcdFx0XHQhYVNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zID8gXCIvSGFzVGFyZ2V0c05vdEZpbHRlcmVkXCIgOiBcIi9IYXNUYXJnZXRzXCJcblx0XHRcdFx0fWA7XG5cdFx0XHRcdHJldHVybiBge3BhcnRzOlt7cGF0aDonJHtzQmluZGluZ1BhdGh9J31dLCBmb3JtYXR0ZXI6J0ZpZWxkUnVudGltZS5nZXRTdGF0ZURlcGVuZGluZ09uU2VtYW50aWNPYmplY3RUYXJnZXRzJ31gO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIFwiSW5mb3JtYXRpb25cIjtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIFwiTm9uZVwiO1xuXHRcdH1cblx0fSxcblx0aXNOb3RBbHdheXNIaWRkZW46IGZ1bmN0aW9uIChvRGF0YUZpZWxkOiBhbnksIG9EZXRhaWxzOiBhbnkpIHtcblx0XHRjb25zdCBvQ29udGV4dCA9IG9EZXRhaWxzLmNvbnRleHQ7XG5cdFx0bGV0IGlzQWx3YXlzSGlkZGVuOiBhbnkgPSBmYWxzZTtcblx0XHRpZiAob0RhdGFGaWVsZC5WYWx1ZSAmJiBvRGF0YUZpZWxkLlZhbHVlLiRQYXRoKSB7XG5cdFx0XHRpc0Fsd2F5c0hpZGRlbiA9IG9Db250ZXh0LmdldE9iamVjdChcIlZhbHVlLyRQYXRoQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhpZGRlblwiKTtcblx0XHR9XG5cdFx0aWYgKCFpc0Fsd2F5c0hpZGRlbiB8fCBpc0Fsd2F5c0hpZGRlbi4kUGF0aCkge1xuXHRcdFx0aXNBbHdheXNIaWRkZW4gPSBvQ29udGV4dC5nZXRPYmplY3QoXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuSGlkZGVuXCIpO1xuXHRcdFx0aWYgKCFpc0Fsd2F5c0hpZGRlbiB8fCBpc0Fsd2F5c0hpZGRlbi4kUGF0aCkge1xuXHRcdFx0XHRpc0Fsd2F5c0hpZGRlbiA9IGZhbHNlO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gIWlzQWx3YXlzSGlkZGVuO1xuXHR9LFxuXHRpc0RyYWZ0SW5kaWNhdG9yVmlzaWJsZUluRmllbGRHcm91cDogZnVuY3Rpb24gKGNvbHVtbjogYW55KSB7XG5cdFx0aWYgKFxuXHRcdFx0Y29sdW1uICYmXG5cdFx0XHRjb2x1bW4uZm9ybWF0T3B0aW9ucyAmJlxuXHRcdFx0Y29sdW1uLmZvcm1hdE9wdGlvbnMuZmllbGRHcm91cERyYWZ0SW5kaWNhdG9yUHJvcGVydHlQYXRoICYmXG5cdFx0XHRjb2x1bW4uZm9ybWF0T3B0aW9ucy5maWVsZEdyb3VwTmFtZVxuXHRcdCkge1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0XCJ7cGFydHM6IFtcIiArXG5cdFx0XHRcdFwie3ZhbHVlOiAnXCIgK1xuXHRcdFx0XHRjb2x1bW4uZm9ybWF0T3B0aW9ucy5maWVsZEdyb3VwTmFtZSArXG5cdFx0XHRcdFwiJ30sXCIgK1xuXHRcdFx0XHRcIntwYXRoOiAnaW50ZXJuYWw+c2VtYW50aWNLZXlIYXNEcmFmdEluZGljYXRvcid9ICwgXCIgK1xuXHRcdFx0XHRcIntwYXRoOiAnSGFzRHJhZnRFbnRpdHknLCB0YXJnZXRUeXBlOiAnYW55J30sIFwiICtcblx0XHRcdFx0XCJ7cGF0aDogJ0lzQWN0aXZlRW50aXR5JywgdGFyZ2V0VHlwZTogJ2FueSd9LCBcIiArXG5cdFx0XHRcdFwie3BhdGg6ICdwYWdlSW50ZXJuYWw+aGlkZURyYWZ0SW5mbycsIHRhcmdldFR5cGU6ICdhbnknfV0sIFwiICtcblx0XHRcdFx0XCJmb3JtYXR0ZXI6ICdzYXAuZmUubWFjcm9zLmZpZWxkLkZpZWxkUnVudGltZS5pc0RyYWZ0SW5kaWNhdG9yVmlzaWJsZSd9XCJcblx0XHRcdCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdH0sXG5cdGlzUmVxdWlyZWQ6IGZ1bmN0aW9uIChvRmllbGRDb250cm9sOiBhbnksIHNFZGl0TW9kZTogYW55KSB7XG5cdFx0aWYgKHNFZGl0TW9kZSA9PT0gXCJEaXNwbGF5XCIgfHwgc0VkaXRNb2RlID09PSBcIlJlYWRPbmx5XCIgfHwgc0VkaXRNb2RlID09PSBcIkRpc2FibGVkXCIpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0aWYgKG9GaWVsZENvbnRyb2wpIHtcblx0XHRcdGlmICgoTWFuYWdlZE9iamVjdCBhcyBhbnkpLmJpbmRpbmdQYXJzZXIob0ZpZWxkQ29udHJvbCkpIHtcblx0XHRcdFx0cmV0dXJuIFwiez0gJVwiICsgb0ZpZWxkQ29udHJvbCArIFwiID09PSA3fVwiO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIG9GaWVsZENvbnRyb2wgPT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRmllbGRDb250cm9sVHlwZS9NYW5kYXRvcnlcIjtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9LFxuXG5cdGdldEFjdGlvblBhcmFtZXRlclZpc2liaWxpdHk6IGZ1bmN0aW9uIChvUGFyYW06IGFueSwgb0NvbnRleHQ6IGFueSkge1xuXHRcdC8vIFRvIHVzZSB0aGUgVUkuSGlkZGVuIGFubm90YXRpb24gZm9yIGNvbnRyb2xsaW5nIHZpc2liaWxpdHkgdGhlIHZhbHVlIG5lZWRzIHRvIGJlIG5lZ2F0ZWRcblx0XHRpZiAodHlwZW9mIG9QYXJhbSA9PT0gXCJvYmplY3RcIikge1xuXHRcdFx0aWYgKG9QYXJhbSAmJiBvUGFyYW0uJElmICYmIG9QYXJhbS4kSWYubGVuZ3RoID09PSAzKSB7XG5cdFx0XHRcdC8vIEluIGNhc2UgdGhlIFVJLkhpZGRlbiBjb250YWlucyBhIGR5bmFtaWMgZXhwcmVzc2lvbiB3ZSBkbyB0aGlzXG5cdFx0XHRcdC8vIGJ5IGp1c3Qgc3dpdGNoaW5nIHRoZSBcInRoZW5cIiBhbmQgXCJlbHNlXCIgcGFydCBvZiB0aGUgZXJwcmVzc2lvblxuXHRcdFx0XHQvLyBvUGFyYW0uJElmWzBdIDw9PSBDb25kaXRpb24gcGFydFxuXHRcdFx0XHQvLyBvUGFyYW0uJElmWzFdIDw9PSBUaGVuIHBhcnRcblx0XHRcdFx0Ly8gb1BhcmFtLiRJZlsyXSA8PT0gRWxzZSBwYXJ0XG5cdFx0XHRcdGNvbnN0IG9OZWdQYXJhbTogYW55ID0geyAkSWY6IFtdIH07XG5cdFx0XHRcdG9OZWdQYXJhbS4kSWZbMF0gPSBvUGFyYW0uJElmWzBdO1xuXHRcdFx0XHRvTmVnUGFyYW0uJElmWzFdID0gb1BhcmFtLiRJZlsyXTtcblx0XHRcdFx0b05lZ1BhcmFtLiRJZlsyXSA9IG9QYXJhbS4kSWZbMV07XG5cdFx0XHRcdHJldHVybiBBbm5vdGF0aW9uSGVscGVyLnZhbHVlKG9OZWdQYXJhbSwgb0NvbnRleHQpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIFwiez0gISV7XCIgKyBvUGFyYW0uJFBhdGggKyBcIn0gfVwiO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAodHlwZW9mIG9QYXJhbSA9PT0gXCJib29sZWFuXCIpIHtcblx0XHRcdHJldHVybiBBbm5vdGF0aW9uSGVscGVyLnZhbHVlKCFvUGFyYW0sIG9Db250ZXh0KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIENvbXB1dGVkIGFubm90YXRpb24gdGhhdCByZXR1cm5zIHZQcm9wZXJ0eSBmb3IgYSBzdHJpbmcgYW5kIEBzYXB1aS5uYW1lIGZvciBhbiBvYmplY3QuXG5cdCAqXG5cdCAqIEBwYXJhbSB2UHJvcGVydHkgVGhlIHByb3BlcnR5XG5cdCAqIEBwYXJhbSBvSW50ZXJmYWNlIFRoZSBpbnRlcmZhY2UgaW5zdGFuY2Vcblx0ICogQHJldHVybnMgVGhlIHByb3BlcnR5IG5hbWVcblx0ICovXG5cdHByb3BlcnR5TmFtZTogZnVuY3Rpb24gKHZQcm9wZXJ0eTogYW55LCBvSW50ZXJmYWNlOiBhbnkpIHtcblx0XHRsZXQgc1Byb3BlcnR5TmFtZTtcblx0XHRpZiAodHlwZW9mIHZQcm9wZXJ0eSA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0aWYgKG9JbnRlcmZhY2UuY29udGV4dC5nZXRQYXRoKCkuaW5kZXhPZihcIiRQYXRoXCIpID4gLTEgfHwgb0ludGVyZmFjZS5jb250ZXh0LmdldFBhdGgoKS5pbmRleE9mKFwiJFByb3BlcnR5UGF0aFwiKSA+IC0xKSB7XG5cdFx0XHRcdC8vIFdlIGNvdWxkIGVuZCB1cCB3aXRoIGEgcHVyZSBzdHJpbmcgcHJvcGVydHkgKG5vICRQYXRoKSwgYW5kIHRoaXMgaXMgbm90IGEgcmVhbCBwcm9wZXJ0eSBpbiB0aGF0IGNhc2Vcblx0XHRcdFx0c1Byb3BlcnR5TmFtZSA9IHZQcm9wZXJ0eTtcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKHZQcm9wZXJ0eS4kUGF0aCB8fCB2UHJvcGVydHkuJFByb3BlcnR5UGF0aCkge1xuXHRcdFx0Y29uc3Qgc1BhdGggPSB2UHJvcGVydHkuJFBhdGggPyBcIi8kUGF0aFwiIDogXCIvJFByb3BlcnR5UGF0aFwiO1xuXHRcdFx0Y29uc3Qgc0NvbnRleHRQYXRoID0gb0ludGVyZmFjZS5jb250ZXh0LmdldFBhdGgoKTtcblx0XHRcdHNQcm9wZXJ0eU5hbWUgPSBvSW50ZXJmYWNlLmNvbnRleHQuZ2V0T2JqZWN0KGAke3NDb250ZXh0UGF0aCArIHNQYXRofS8kQHNhcHVpLm5hbWVgKTtcblx0XHR9IGVsc2UgaWYgKHZQcm9wZXJ0eS5WYWx1ZSAmJiB2UHJvcGVydHkuVmFsdWUuJFBhdGgpIHtcblx0XHRcdHNQcm9wZXJ0eU5hbWUgPSB2UHJvcGVydHkuVmFsdWUuJFBhdGg7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNQcm9wZXJ0eU5hbWUgPSBvSW50ZXJmYWNlLmNvbnRleHQuZ2V0T2JqZWN0KFwiQHNhcHVpLm5hbWVcIik7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHNQcm9wZXJ0eU5hbWU7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFRoaXMgbWV0aG9kIGdldEZpZWxkR3JvdXBJRHMgdXNlcyBhIG1hcCBzdG9yZWQgaW4gcHJlcHJvY2Vzc2luZyBkYXRhIGZvciB0aGUgbWFjcm8gRmllbGRcblx0ICogX2dlbmVyYXRlU2lkZUVmZmVjdHNNYXAgZ2VuZXJhdGVzIHRoaXMgbWFwIG9uY2UgZHVyaW5nIHRlbXBsYXRpbmcgZm9yIHRoZSBmaXJzdCBtYWNybyBmaWVsZFxuXHQgKiBhbmQgdGhlbiByZXVzZXMgaXQuIE1hcCBleGlzdHMgb25seSBkdXJpbmcgdGVtcGxhdGluZy5cblx0ICogVGhlIG1hcCBpcyB1c2VkIHRvIHNldCB0aGUgZmllbGQgZ3JvdXAgSURzIGZvciB0aGUgbWFjcm8gZmllbGQuXG5cdCAqIEEgZmllbGQgZ3JvdXAgSUQgaGFzIHRoZSBmb3JtYXQgLS0gbmFtZXNwYWNlLm9mLmVudGl0eVR5cGUjUXVhbGlmaWVyXG5cdCAqIHdoZXJlICduYW1lc3BhY2Uub2YuZW50aXR5VHlwZScgaXMgdGhlIHRhcmdldCBlbnRpdHkgdHlwZSBvZiB0aGUgc2lkZSBlZmZlY3QgYW5ub3RhdGlvblxuXHQgKiBhbmQgJ1F1YWxpZmllcicgaXMgdGhlIHF1YWxpZmlmZXIgb2YgdGhlIHNpZGUgZWZmZWN0IGFubm90YXRpb24uXG5cdCAqIFRoaXMgaW5mb3JtYXRpb24gaXMgZW5vdWdoIHRvIGlkZW50aWZ5IHRoZSBzaWRlIGVmZmVjdCBhbm5vdGF0aW9uLlxuXHQgKlxuXHQgKiBAcGFyYW0gb0NvbnRleHQgQ29udGV4dCBpbnN0YW5jZVxuXHQgKiBAcGFyYW0gc1Byb3BlcnR5UGF0aCBQcm9wZXJ0eSBwYXRoXG5cdCAqIEByZXR1cm5zIEEgcHJvbWlzZSB3aGljaCBwcm92aWRlcyBhIHN0cmluZyBvZiBmaWVsZCBncm91cCBJRHMgc2VwYXJhdGVkIGJ5IGEgY29tbWFcblx0ICovXG5cdGdldEZpZWxkR3JvdXBJZHM6IGZ1bmN0aW9uIChvQ29udGV4dDogYW55LCBzUHJvcGVydHlQYXRoOiBzdHJpbmcpIHtcblx0XHRpZiAoIXNQcm9wZXJ0eVBhdGgpIHtcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXHRcdGNvbnN0IG9JbnRlcmZhY2UgPSBvQ29udGV4dC5nZXRJbnRlcmZhY2UoMCk7XG5cdFx0Ly8gZ2VuZXJhdGUgdGhlIG1hcHBpbmcgZm9yIHNpZGUgZWZmZWN0cyBvciBnZXQgdGhlIGdlbmVyYXRlZCBtYXAgaWYgaXQgaXMgYWxyZWFkeSBnZW5lcmF0ZWRcblx0XHRyZXR1cm4gX2dlbmVyYXRlU2lkZUVmZmVjdHNNYXAob0ludGVyZmFjZSkudGhlbihmdW5jdGlvbiAob1NpZGVFZmZlY3RzOiBhbnkpIHtcblx0XHRcdGNvbnN0IG9GaWVsZFNldHRpbmdzID0gb0ludGVyZmFjZS5nZXRTZXR0aW5nKFwic2FwLmZlLm1hY3Jvcy5pbnRlcm5hbC5GaWVsZFwiKTtcblx0XHRcdG9GaWVsZFNldHRpbmdzLnNpZGVFZmZlY3RzID0gb1NpZGVFZmZlY3RzO1xuXHRcdFx0Y29uc3Qgc093bmVyRW50aXR5VHlwZSA9IG9Db250ZXh0LmdldFBhdGgoMSkuc3Vic3RyKDEpO1xuXHRcdFx0Y29uc3QgYUZpZWxkR3JvdXBJZHMgPSBGaWVsZEhlbHBlci5nZXRTaWRlRWZmZWN0c09uRW50aXR5QW5kUHJvcGVydHkoc1Byb3BlcnR5UGF0aCwgc093bmVyRW50aXR5VHlwZSwgb1NpZGVFZmZlY3RzKTtcblx0XHRcdGxldCBzRmllbGRHcm91cElkcztcblxuXHRcdFx0aWYgKGFGaWVsZEdyb3VwSWRzLmxlbmd0aCkge1xuXHRcdFx0XHRzRmllbGRHcm91cElkcyA9IGFGaWVsZEdyb3VwSWRzLnJlZHVjZShmdW5jdGlvbiAoc1Jlc3VsdDogYW55LCBzSWQ6IGFueSkge1xuXHRcdFx0XHRcdHJldHVybiAoc1Jlc3VsdCAmJiBgJHtzUmVzdWx0fSwke3NJZH1gKSB8fCBzSWQ7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHNGaWVsZEdyb3VwSWRzOyAvL1wiSUQxLElEMixJRDMuLi5cIlxuXHRcdH0pO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBHZW5lcmF0ZSBtYXAgd2hpY2ggaGFzIGRhdGEgZnJvbSBzb3VyY2UgZW50aXR5IGFzIHdlbGwgYXMgc291cmNlIHByb3BlcnR5IGZvciBhIGdpdmVuIGZpZWxkLlxuXHQgKlxuXHQgKiBAcGFyYW0gc1BhdGhcblx0ICogQHBhcmFtIHNPd25lckVudGl0eVR5cGVcblx0ICogQHBhcmFtIG9TaWRlRWZmZWN0c1xuXHQgKiBAcmV0dXJucyBBbiBhcnJheSBvZiBzaWRlIEVmZmVjdCBJZHMuXG5cdCAqL1xuXHRnZXRTaWRlRWZmZWN0c09uRW50aXR5QW5kUHJvcGVydHk6IGZ1bmN0aW9uIChzUGF0aDogc3RyaW5nLCBzT3duZXJFbnRpdHlUeXBlOiBzdHJpbmcsIG9TaWRlRWZmZWN0czogYW55KSB7XG5cdFx0Y29uc3QgYklzTmF2aWdhdGlvblBhdGggPSBzUGF0aC5pbmRleE9mKFwiL1wiKSA+IDA7XG5cdFx0c1BhdGggPSBiSXNOYXZpZ2F0aW9uUGF0aCA/IHNQYXRoLnN1YnN0cihzUGF0aC5sYXN0SW5kZXhPZihcIi9cIikgKyAxKSA6IHNQYXRoO1xuXHRcdC8vIGFkZCB0byBmaWVsZEdyb3VwSWRzLCBhbGwgc2lkZSBlZmZlY3RzIHdoaWNoIG1lbnRpb24gc1BhdGggYXMgc291cmNlIHByb3BlcnR5IG9yIHNPd25lckVudGl0eVR5cGUgYXMgc291cmNlIGVudGl0eVxuXHRcdHJldHVybiAoXG5cdFx0XHQob1NpZGVFZmZlY3RzW3NPd25lckVudGl0eVR5cGVdICYmIG9TaWRlRWZmZWN0c1tzT3duZXJFbnRpdHlUeXBlXVswXS5jb25jYXQob1NpZGVFZmZlY3RzW3NPd25lckVudGl0eVR5cGVdWzFdW3NQYXRoXSB8fCBbXSkpIHx8XG5cdFx0XHRbXVxuXHRcdCk7XG5cdH0sXG5cblx0ZmllbGRDb250cm9sOiBmdW5jdGlvbiAoc1Byb3BlcnR5UGF0aDogYW55LCBvSW50ZXJmYWNlOiBhbnkpIHtcblx0XHRjb25zdCBvTW9kZWwgPSBvSW50ZXJmYWNlICYmIG9JbnRlcmZhY2UuY29udGV4dC5nZXRNb2RlbCgpO1xuXHRcdGNvbnN0IHNQYXRoID0gb0ludGVyZmFjZSAmJiBvSW50ZXJmYWNlLmNvbnRleHQuZ2V0UGF0aCgpO1xuXHRcdGNvbnN0IG9GaWVsZENvbnRyb2xDb250ZXh0ID0gb01vZGVsICYmIG9Nb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChgJHtzUGF0aH1AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkZpZWxkQ29udHJvbGApO1xuXHRcdGNvbnN0IG9GaWVsZENvbnRyb2wgPSBvRmllbGRDb250cm9sQ29udGV4dCAmJiBvRmllbGRDb250cm9sQ29udGV4dC5nZXRQcm9wZXJ0eSgpO1xuXHRcdGlmIChvRmllbGRDb250cm9sKSB7XG5cdFx0XHRpZiAob0ZpZWxkQ29udHJvbC5oYXNPd25Qcm9wZXJ0eShcIiRFbnVtTWVtYmVyXCIpKSB7XG5cdFx0XHRcdHJldHVybiBvRmllbGRDb250cm9sLiRFbnVtTWVtYmVyO1xuXHRcdFx0fSBlbHNlIGlmIChvRmllbGRDb250cm9sLmhhc093blByb3BlcnR5KFwiJFBhdGhcIikpIHtcblx0XHRcdFx0cmV0dXJuIEFubm90YXRpb25IZWxwZXIudmFsdWUob0ZpZWxkQ29udHJvbCwgeyBjb250ZXh0OiBvRmllbGRDb250cm9sQ29udGV4dCB9KTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ldGhvZCB0byBnZXQgdGhlIHZhbHVlIGhlbHAgcHJvcGVydHkgZnJvbSBhIERhdGFGaWVsZCBvciBhIFByb3BlcnR5UGF0aCAoaW4gY2FzZSBhIFNlbGVjdGlvbkZpZWxkIGlzIHVzZWQpXG5cdCAqIFByaW9yaXR5IGZyb20gd2hlcmUgdG8gZ2V0IHRoZSBwcm9wZXJ0eSB2YWx1ZSBvZiB0aGUgZmllbGQgKGV4YW1wbGVzIGFyZSBcIk5hbWVcIiBhbmQgXCJTdXBwbGllclwiKTpcblx0ICogMS4gSWYgb1Byb3BlcnR5Q29udGV4dC5nZXRPYmplY3QoKSBoYXMga2V5ICckUGF0aCcsIHRoZW4gd2UgdGFrZSB0aGUgdmFsdWUgYXQgJyRQYXRoJy5cblx0ICogMi4gRWxzZSwgdmFsdWUgYXQgb1Byb3BlcnR5Q29udGV4dC5nZXRPYmplY3QoKS5cblx0ICogSWYgdGhlcmUgaXMgYW4gSVNPQ3VycmVuY3kgb3IgaWYgdGhlcmUgYXJlIFVuaXQgYW5ub3RhdGlvbnMgZm9yIHRoZSBmaWVsZCBwcm9wZXJ0eSxcblx0ICogdGhlbiB0aGUgUGF0aCBhdCB0aGUgSVNPQ3VycmVuY3kgb3IgVW5pdCBhbm5vdGF0aW9ucyBvZiB0aGUgZmllbGQgcHJvcGVydHkgaXMgY29uc2lkZXJlZC5cblx0ICpcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5tYWNyb3MuZmllbGQuRmllbGRIZWxwZXIuanNcblx0ICogQHBhcmFtIG9Qcm9wZXJ0eUNvbnRleHQgVGhlIGNvbnRleHQgZnJvbSB3aGljaCB2YWx1ZSBoZWxwIHByb3BlcnR5IG5lZWQgdG8gYmUgZXh0cmFjdGVkLlxuXHQgKiBAcGFyYW0gYkluRmlsdGVyRmllbGQgV2hldGhlciBvciBub3Qgd2UncmUgaW4gdGhlIGZpbHRlciBmaWVsZCBhbmQgc2hvdWxkIGlnbm9yZVxuXHQgKiBAcmV0dXJucyBUaGUgdmFsdWUgaGVscCBwcm9wZXJ0eSBwYXRoXG5cdCAqL1xuXHR2YWx1ZUhlbHBQcm9wZXJ0eTogZnVuY3Rpb24gKG9Qcm9wZXJ0eUNvbnRleHQ6IENvbnRleHQsIGJJbkZpbHRlckZpZWxkPzogYm9vbGVhbikge1xuXHRcdC8qIEZvciBjdXJyZW5jeSAoYW5kIGxhdGVyIFVuaXQpIHdlIG5lZWQgdG8gZm9yd2FyZCB0aGUgdmFsdWUgaGVscCB0byB0aGUgYW5ub3RhdGVkIGZpZWxkICovXG5cdFx0Y29uc3Qgc0NvbnRleHRQYXRoID0gb1Byb3BlcnR5Q29udGV4dC5nZXRQYXRoKCk7XG5cdFx0Y29uc3Qgb0NvbnRlbnQgPSBvUHJvcGVydHlDb250ZXh0LmdldE9iamVjdCgpIHx8IHt9O1xuXHRcdGxldCBzUGF0aCA9IG9Db250ZW50LiRQYXRoID8gYCR7c0NvbnRleHRQYXRofS8kUGF0aGAgOiBzQ29udGV4dFBhdGg7XG5cdFx0Y29uc3Qgc0Fubm9QYXRoID0gYCR7c1BhdGh9QGA7XG5cdFx0Y29uc3Qgb1Byb3BlcnR5QW5ub3RhdGlvbnMgPSBvUHJvcGVydHlDb250ZXh0LmdldE9iamVjdChzQW5ub1BhdGgpO1xuXHRcdGxldCBzQW5ub3RhdGlvbjtcblx0XHRpZiAob1Byb3BlcnR5QW5ub3RhdGlvbnMpIHtcblx0XHRcdHNBbm5vdGF0aW9uID1cblx0XHRcdFx0KG9Qcm9wZXJ0eUFubm90YXRpb25zLmhhc093blByb3BlcnR5KElTT0N1cnJlbmN5KSAmJiBJU09DdXJyZW5jeSkgfHwgKG9Qcm9wZXJ0eUFubm90YXRpb25zLmhhc093blByb3BlcnR5KFVuaXQpICYmIFVuaXQpO1xuXHRcdFx0aWYgKHNBbm5vdGF0aW9uICYmICFiSW5GaWx0ZXJGaWVsZCkge1xuXHRcdFx0XHRjb25zdCBzVW5pdE9yQ3VycmVuY3lQYXRoID0gYCR7c1BhdGggKyBzQW5ub3RhdGlvbn0vJFBhdGhgO1xuXHRcdFx0XHQvLyB3ZSBjaGVjayB0aGF0IHRoZSBjdXJyZW5jeSBvciB1bml0IGlzIGEgUHJvcGVydHkgYW5kIG5vdCBhIGZpeGVkIHZhbHVlXG5cdFx0XHRcdGlmIChvUHJvcGVydHlDb250ZXh0LmdldE9iamVjdChzVW5pdE9yQ3VycmVuY3lQYXRoKSkge1xuXHRcdFx0XHRcdHNQYXRoID0gc1VuaXRPckN1cnJlbmN5UGF0aDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gc1BhdGg7XG5cdH0sXG5cblx0LyoqXG5cdCAqIERlZGljYXRlZCBtZXRob2QgdG8gYXZvaWQgbG9va2luZyBmb3IgdW5pdCBwcm9wZXJ0aWVzLlxuXHQgKlxuXHQgKiBAcGFyYW0gb1Byb3BlcnR5Q29udGV4dFxuXHQgKiBAcmV0dXJucyBUaGUgdmFsdWUgaGVscCBwcm9wZXJ0eSBwYXRoXG5cdCAqL1xuXHR2YWx1ZUhlbHBQcm9wZXJ0eUZvckZpbHRlckZpZWxkOiBmdW5jdGlvbiAob1Byb3BlcnR5Q29udGV4dDogYW55KSB7XG5cdFx0cmV0dXJuIEZpZWxkSGVscGVyLnZhbHVlSGVscFByb3BlcnR5KG9Qcm9wZXJ0eUNvbnRleHQsIHRydWUpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gZ2VuZXJhdGUgdGhlIElEIGZvciBWYWx1ZSBIZWxwLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgZ2V0SURGb3JGaWVsZFZhbHVlSGVscFxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLm1hY3Jvcy5maWVsZC5GaWVsZEhlbHBlci5qc1xuXHQgKiBAcGFyYW0gc0ZsZXhJZCBGbGV4IElEIG9mIHRoZSBjdXJyZW50IG9iamVjdFxuXHQgKiBAcGFyYW0gc0lkUHJlZml4IFByZWZpeCBmb3IgdGhlIFZhbHVlSGVscCBJRFxuXHQgKiBAcGFyYW0gc09yaWdpbmFsUHJvcGVydHlOYW1lIE5hbWUgb2YgdGhlIHByb3BlcnR5XG5cdCAqIEBwYXJhbSBzUHJvcGVydHlOYW1lIE5hbWUgb2YgdGhlIFZhbHVlSGVscCBQcm9wZXJ0eVxuXHQgKiBAcmV0dXJucyBUaGUgSUQgZ2VuZXJhdGVkIGZvciB0aGUgVmFsdWVIZWxwXG5cdCAqL1xuXHRnZXRJREZvckZpZWxkVmFsdWVIZWxwOiBmdW5jdGlvbiAoc0ZsZXhJZDogc3RyaW5nIHwgbnVsbCwgc0lkUHJlZml4OiBzdHJpbmcsIHNPcmlnaW5hbFByb3BlcnR5TmFtZTogc3RyaW5nLCBzUHJvcGVydHlOYW1lOiBzdHJpbmcpIHtcblx0XHRpZiAoc0ZsZXhJZCkge1xuXHRcdFx0cmV0dXJuIHNGbGV4SWQ7XG5cdFx0fVxuXHRcdGxldCBzUHJvcGVydHkgPSBzUHJvcGVydHlOYW1lO1xuXHRcdGlmIChzT3JpZ2luYWxQcm9wZXJ0eU5hbWUgIT09IHNQcm9wZXJ0eU5hbWUpIHtcblx0XHRcdHNQcm9wZXJ0eSA9IGAke3NPcmlnaW5hbFByb3BlcnR5TmFtZX06OiR7c1Byb3BlcnR5TmFtZX1gO1xuXHRcdH1cblx0XHRyZXR1cm4gZ2VuZXJhdGUoW3NJZFByZWZpeCwgc1Byb3BlcnR5XSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ldGhvZCB0byBnZXQgdGhlIGZpZWxkSGVscCBwcm9wZXJ0eSBvZiB0aGUgRmlsdGVyRmllbGQuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBnZXRGaWVsZEhlbHBQcm9wZXJ0eUZvckZpbHRlckZpZWxkXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUubWFjcm9zLmZpZWxkLkZpZWxkSGVscGVyLmpzXG5cdCAqIEBwYXJhbSBwcm9wZXJ0eUNvbnRleHQgUHJvcGVydHkgY29udGV4dCBmb3IgZmlsdGVyIGZpZWxkXG5cdCAqIEBwYXJhbSBvUHJvcGVydHkgVGhlIG9iamVjdCBvZiB0aGUgRmllbGRIZWxwIHByb3BlcnR5XG5cdCAqIEBwYXJhbSBzUHJvcGVydHlUeXBlIFRoZSAkVHlwZSBvZiB0aGUgcHJvcGVydHlcblx0ICogQHBhcmFtIHNWaElkUHJlZml4IFRoZSBJRCBwcmVmaXggb2YgdGhlIHZhbHVlIGhlbHBcblx0ICogQHBhcmFtIHNQcm9wZXJ0eU5hbWUgVGhlIG5hbWUgb2YgdGhlIHByb3BlcnR5XG5cdCAqIEBwYXJhbSBzVmFsdWVIZWxwUHJvcGVydHlOYW1lIFRoZSBwcm9wZXJ0eSBuYW1lIG9mIHRoZSB2YWx1ZSBoZWxwXG5cdCAqIEBwYXJhbSBiSGFzVmFsdWVMaXN0V2l0aEZpeGVkVmFsdWVzIGB0cnVlYCBpZiB0aGVyZSBpcyBhIHZhbHVlIGxpc3Qgd2l0aCBhIGZpeGVkIHZhbHVlIGFubm90YXRpb25cblx0ICogQHBhcmFtIGJVc2VTZW1hbnRpY0RhdGVSYW5nZSBgdHJ1ZWAgaWYgdGhlIHNlbWFudGljIGRhdGUgcmFuZ2UgaXMgc2V0IHRvICd0cnVlJyBpbiB0aGUgbWFuaWZlc3Rcblx0ICogQHJldHVybnMgVGhlIGZpZWxkIGhlbHAgcHJvcGVydHkgb2YgdGhlIHZhbHVlIGhlbHBcblx0ICovXG5cdGdldEZpZWxkSGVscFByb3BlcnR5Rm9yRmlsdGVyRmllbGQ6IGZ1bmN0aW9uIChcblx0XHRwcm9wZXJ0eUNvbnRleHQ6IEJhc2VDb250ZXh0LFxuXHRcdG9Qcm9wZXJ0eTogYW55LFxuXHRcdHNQcm9wZXJ0eVR5cGU6IHN0cmluZyxcblx0XHRzVmhJZFByZWZpeDogc3RyaW5nLFxuXHRcdHNQcm9wZXJ0eU5hbWU6IHN0cmluZyxcblx0XHRzVmFsdWVIZWxwUHJvcGVydHlOYW1lOiBzdHJpbmcsXG5cdFx0Ykhhc1ZhbHVlTGlzdFdpdGhGaXhlZFZhbHVlczogYm9vbGVhbixcblx0XHRiVXNlU2VtYW50aWNEYXRlUmFuZ2U6IGJvb2xlYW4gfCBzdHJpbmdcblx0KSB7XG5cdFx0Y29uc3Qgc1Byb3BlcnR5ID0gRmllbGRIZWxwZXIucHJvcGVydHlOYW1lKG9Qcm9wZXJ0eSwgeyBjb250ZXh0OiBwcm9wZXJ0eUNvbnRleHQgfSksXG5cdFx0XHRiU2VtYW50aWNEYXRlUmFuZ2UgPSBiVXNlU2VtYW50aWNEYXRlUmFuZ2UgPT09IFwidHJ1ZVwiIHx8IGJVc2VTZW1hbnRpY0RhdGVSYW5nZSA9PT0gdHJ1ZTtcblx0XHRjb25zdCBvTW9kZWwgPSBwcm9wZXJ0eUNvbnRleHQuZ2V0TW9kZWwoKSBhcyBPRGF0YU1ldGFNb2RlbCxcblx0XHRcdHNQcm9wZXJ0eVBhdGggPSBwcm9wZXJ0eUNvbnRleHQuZ2V0UGF0aCgpLFxuXHRcdFx0c1Byb3BlcnR5TG9jYXRpb25QYXRoID0gQ29tbW9uSGVscGVyLmdldExvY2F0aW9uRm9yUHJvcGVydHlQYXRoKG9Nb2RlbCwgc1Byb3BlcnR5UGF0aCksXG5cdFx0XHRvRmlsdGVyUmVzdHJpY3Rpb25zID0gQ29tbW9uVXRpbHMuZ2V0RmlsdGVyUmVzdHJpY3Rpb25zQnlQYXRoKHNQcm9wZXJ0eUxvY2F0aW9uUGF0aCwgb01vZGVsKTtcblx0XHRpZiAoXG5cdFx0XHQoKHNQcm9wZXJ0eVR5cGUgPT09IFwiRWRtLkRhdGVUaW1lT2Zmc2V0XCIgfHwgc1Byb3BlcnR5VHlwZSA9PT0gXCJFZG0uRGF0ZVwiKSAmJlxuXHRcdFx0XHRiU2VtYW50aWNEYXRlUmFuZ2UgJiZcblx0XHRcdFx0b0ZpbHRlclJlc3RyaWN0aW9ucyAmJlxuXHRcdFx0XHRvRmlsdGVyUmVzdHJpY3Rpb25zLkZpbHRlckFsbG93ZWRFeHByZXNzaW9ucyAmJlxuXHRcdFx0XHRvRmlsdGVyUmVzdHJpY3Rpb25zLkZpbHRlckFsbG93ZWRFeHByZXNzaW9uc1tzUHJvcGVydHldICYmXG5cdFx0XHRcdChvRmlsdGVyUmVzdHJpY3Rpb25zLkZpbHRlckFsbG93ZWRFeHByZXNzaW9uc1tzUHJvcGVydHldLmluZGV4T2YoXCJTaW5nbGVSYW5nZVwiKSAhPT0gLTEgfHxcblx0XHRcdFx0XHRvRmlsdGVyUmVzdHJpY3Rpb25zLkZpbHRlckFsbG93ZWRFeHByZXNzaW9uc1tzUHJvcGVydHldLmluZGV4T2YoXCJTaW5nbGVWYWx1ZVwiKSAhPT0gLTEpKSB8fFxuXHRcdFx0KHNQcm9wZXJ0eVR5cGUgPT09IFwiRWRtLkJvb2xlYW5cIiAmJiAhYkhhc1ZhbHVlTGlzdFdpdGhGaXhlZFZhbHVlcylcblx0XHQpIHtcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXHRcdHJldHVybiBGaWVsZEhlbHBlci5nZXRJREZvckZpZWxkVmFsdWVIZWxwKG51bGwsIHNWaElkUHJlZml4IHx8IFwiRmlsdGVyRmllbGRWYWx1ZUhlbHBcIiwgc1Byb3BlcnR5TmFtZSwgc1ZhbHVlSGVscFByb3BlcnR5TmFtZSk7XG5cdH0sXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gZ2V0IHNlbWFudGljIGtleSB0aXRsZVxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgZ2V0U2VtYW50aWNLZXlUaXRsZVxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLm1hY3Jvcy5maWVsZC5GaWVsZEhlbHBlci5qc1xuXHQgKiBAcGFyYW0ge3N0cmluZ30gc1Byb3BlcnR5VGV4dFZhbHVlIFN0cmluZyBjb250YWluaW5nIHRoZSBiaW5kaW5nIG9mIHRleHQgYXNzb2NpYXRlZCB0byB0aGUgcHJvcGVydHlcblx0ICogQHBhcmFtIHtzdHJpbmd9IHNQcm9wZXJ0eVZhbHVlIFN0cmluZyBjb250YWluaW5nIHRoZSBiaW5kaW5nIG9mIGEgcHJvcGVydHlcblx0ICogQHBhcmFtIHtzdHJpbmd9IHNEYXRhRmllbGQgU3RyaW5nIGNvbnRhaW5pbmcgdGhlIG5hbWUgb2YgYSBkYXRhIGZpZWxkXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBvVGV4dEFycmFuZ2VtZW50IE9iamVjdCBjb250YWluaW5nIHRoZSB0ZXh0IGFycmFuZ2VtZW50XG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBzU2VtYW50aWNLZXlTdHlsZSBlbnVtIGNvbnRhaW5pbmcgdGhlIHN0eWxlIG9mIHRoZSBzZW1hbnRpYyBrZXlcblx0ICogQHBhcmFtIHtvYmplY3R9IG9EcmFmdFJvb3QgRHJhZnQgcm9vdCBvYmplY3Rcblx0ICogQHJldHVybnMge3N0cmluZ30gLSBCaW5kaW5nIHRoYXQgcmVzb2x2ZXMgdG8gdGhlIHRpdGxlIG9mIHRoZSBzZW1hbnRpYyBrZXlcblx0ICovXG5cblx0Z2V0U2VtYW50aWNLZXlUaXRsZTogZnVuY3Rpb24gKFxuXHRcdHNQcm9wZXJ0eVRleHRWYWx1ZTogc3RyaW5nLFxuXHRcdHNQcm9wZXJ0eVZhbHVlOiBzdHJpbmcsXG5cdFx0c0RhdGFGaWVsZDogc3RyaW5nLFxuXHRcdG9UZXh0QXJyYW5nZW1lbnQ6IGFueSxcblx0XHRzU2VtYW50aWNLZXlTdHlsZTogc3RyaW5nLFxuXHRcdG9EcmFmdFJvb3Q6IGFueVxuXHQpIHtcblx0XHRjb25zdCBzTmV3T2JqZWN0ID0gUmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiVF9ORVdfT0JKRUNUXCIpO1xuXHRcdGNvbnN0IHNVbm5hbWVkT2JqZWN0ID0gUmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiVF9BTk5PVEFUSU9OX0hFTFBFUl9ERUZBVUxUX09CSkVDVF9QQUdFX0hFQURFUl9USVRMRV9OT19IRUFERVJfSU5GT1wiKTtcblx0XHRsZXQgc05ld09iamVjdEV4cHJlc3Npb24sIHNVbm5uYW1lZE9iamVjdEV4cHJlc3Npb247XG5cdFx0bGV0IHNTZW1hbnRpY0tleVRpdGxlRXhwcmVzc2lvbjtcblx0XHRjb25zdCBhZGROZXdPYmplY3RVbk5hbWVkT2JqZWN0RXhwcmVzc2lvbiA9IGZ1bmN0aW9uIChzVmFsdWU6IHN0cmluZykge1xuXHRcdFx0c05ld09iamVjdEV4cHJlc3Npb24gPVxuXHRcdFx0XHRcIigkXCIgK1xuXHRcdFx0XHRzVmFsdWUgK1xuXHRcdFx0XHRcIiA9PT0gJycgfHwgJFwiICtcblx0XHRcdFx0c1ZhbHVlICtcblx0XHRcdFx0XCIgPT09IHVuZGVmaW5lZCB8fCAkXCIgK1xuXHRcdFx0XHRzVmFsdWUgK1xuXHRcdFx0XHRcIiA9PT0gbnVsbCA/ICdcIiArXG5cdFx0XHRcdHNOZXdPYmplY3QgK1xuXHRcdFx0XHRcIic6ICRcIiArXG5cdFx0XHRcdHNWYWx1ZSArXG5cdFx0XHRcdFwiKVwiO1xuXHRcdFx0c1Vubm5hbWVkT2JqZWN0RXhwcmVzc2lvbiA9XG5cdFx0XHRcdFwiKCRcIiArXG5cdFx0XHRcdHNWYWx1ZSArXG5cdFx0XHRcdFwiID09PSAnJyB8fCAkXCIgK1xuXHRcdFx0XHRzVmFsdWUgK1xuXHRcdFx0XHRcIiA9PT0gdW5kZWZpbmVkIHx8ICRcIiArXG5cdFx0XHRcdHNWYWx1ZSArXG5cdFx0XHRcdFwiID09PSBudWxsID8gJ1wiICtcblx0XHRcdFx0c1VubmFtZWRPYmplY3QgK1xuXHRcdFx0XHRcIic6ICRcIiArXG5cdFx0XHRcdHNWYWx1ZSArXG5cdFx0XHRcdFwiKVwiO1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0XCIoISV7SXNBY3RpdmVFbnRpdHl9ID8gISV7SGFzQWN0aXZlRW50aXR5fSA/IFwiICtcblx0XHRcdFx0c05ld09iamVjdEV4cHJlc3Npb24gK1xuXHRcdFx0XHRcIiA6IFwiICtcblx0XHRcdFx0c1Vubm5hbWVkT2JqZWN0RXhwcmVzc2lvbiArXG5cdFx0XHRcdFwiIDogXCIgK1xuXHRcdFx0XHRzVW5ubmFtZWRPYmplY3RFeHByZXNzaW9uICtcblx0XHRcdFx0XCIpXCJcblx0XHRcdCk7XG5cdFx0fTtcblx0XHRjb25zdCBidWlsZEV4cHJlc3Npb25Gb3JTZW1hbnRpY2tLZXlUaXRsZSA9IGZ1bmN0aW9uIChzVmFsdWU6IHN0cmluZywgYklzRXhwcmVzc2lvbkJpbmRpbmc6IGJvb2xlYW4pIHtcblx0XHRcdGxldCBzRXhwcmVzc2lvbjtcblx0XHRcdGlmIChvRHJhZnRSb290KSB7XG5cdFx0XHRcdC8vY2hlY2sgaWYgaXQgaXMgZHJhZnQgcm9vdCBzbyB0aGF0IHdlIGNhbiBhZGQgTmV3T2JqZWN0IGFuZCBVbm5hbWVkT2JqZWN0IGZlYXR1cmVcblx0XHRcdFx0c0V4cHJlc3Npb24gPSBhZGROZXdPYmplY3RVbk5hbWVkT2JqZWN0RXhwcmVzc2lvbihzVmFsdWUpO1xuXHRcdFx0XHRyZXR1cm4gYklzRXhwcmVzc2lvbkJpbmRpbmcgPyBcIns9IFwiICsgc0V4cHJlc3Npb24gKyBcIn1cIiA6IHNFeHByZXNzaW9uO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIGJJc0V4cHJlc3Npb25CaW5kaW5nID8gc1ZhbHVlIDogXCIkXCIgKyBzVmFsdWU7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdGlmIChzUHJvcGVydHlUZXh0VmFsdWUpIHtcblx0XHRcdC8vIGNoZWNrIGZvciB0ZXh0IGFzc29jaWF0aW9uXG5cdFx0XHRpZiAob1RleHRBcnJhbmdlbWVudCAmJiBzU2VtYW50aWNLZXlTdHlsZSAhPT0gXCJPYmplY3RJZGVudGlmaWVyXCIpIHtcblx0XHRcdFx0Ly8gY2hlY2sgaWYgdGV4dCBhcnJhbmdlbWVudCBpcyBwcmVzZW50IGFuZCB0YWJsZSB0eXBlIGlzIEdyaWRUYWJsZVxuXHRcdFx0XHRjb25zdCBzVGV4dEFycmFuZ2VtZW50ID0gb1RleHRBcnJhbmdlbWVudC4kRW51bU1lbWJlcjtcblx0XHRcdFx0aWYgKHNUZXh0QXJyYW5nZW1lbnQgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuVGV4dEFycmFuZ2VtZW50VHlwZS9UZXh0Rmlyc3RcIikge1xuXHRcdFx0XHRcdC8vIEVnOiBFbmdsaXNoIChFTilcblx0XHRcdFx0XHRzU2VtYW50aWNLZXlUaXRsZUV4cHJlc3Npb24gPSBidWlsZEV4cHJlc3Npb25Gb3JTZW1hbnRpY2tLZXlUaXRsZShzUHJvcGVydHlUZXh0VmFsdWUsIGZhbHNlKTtcblx0XHRcdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHRcdFx0XCJ7PSBcIiArXG5cdFx0XHRcdFx0XHRzU2VtYW50aWNLZXlUaXRsZUV4cHJlc3Npb24gK1xuXHRcdFx0XHRcdFx0XCIgKycgKCcgKyBcIiArXG5cdFx0XHRcdFx0XHRcIigkXCIgK1xuXHRcdFx0XHRcdFx0c1Byb3BlcnR5VmFsdWUgK1xuXHRcdFx0XHRcdFx0KHNEYXRhRmllbGQgPyBcIiB8fCAke1wiICsgc0RhdGFGaWVsZCArIFwifVwiIDogXCJcIikgK1xuXHRcdFx0XHRcdFx0XCIpICsnKScgfVwiXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fSBlbHNlIGlmIChzVGV4dEFycmFuZ2VtZW50ID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlRleHRBcnJhbmdlbWVudFR5cGUvVGV4dExhc3RcIikge1xuXHRcdFx0XHRcdC8vIEVnOiBFTiAoRW5nbGlzaClcblx0XHRcdFx0XHRzU2VtYW50aWNLZXlUaXRsZUV4cHJlc3Npb24gPSBidWlsZEV4cHJlc3Npb25Gb3JTZW1hbnRpY2tLZXlUaXRsZShzUHJvcGVydHlUZXh0VmFsdWUsIGZhbHNlKTtcblx0XHRcdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHRcdFx0XCJ7PSAoJFwiICtcblx0XHRcdFx0XHRcdHNQcm9wZXJ0eVZhbHVlICtcblx0XHRcdFx0XHRcdChzRGF0YUZpZWxkID8gXCIgfHwgJHtcIiArIHNEYXRhRmllbGQgKyBcIn1cIiA6IFwiXCIpICtcblx0XHRcdFx0XHRcdFwiKVwiICtcblx0XHRcdFx0XHRcdFwiICsgJyAoJyArIFwiICtcblx0XHRcdFx0XHRcdHNTZW1hbnRpY0tleVRpdGxlRXhwcmVzc2lvbiArXG5cdFx0XHRcdFx0XHRcIiArJyknIH1cIlxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gZm9yIGEgR3JpZCB0YWJsZSB3aGVuIHRleHQgaXMgYXZhaWxhYmxlIGFuZCB0ZXh0IGFycmFuZ2VtZW50IGlzIFRleHRPbmx5IG9yIFRleHRTZXBlcmF0ZSBvciBubyB0ZXh0IGFycmFuZ2VtZW50IHRoZW4gd2UgcmV0dXJuIFRleHRcblx0XHRcdFx0XHRyZXR1cm4gYnVpbGRFeHByZXNzaW9uRm9yU2VtYW50aWNrS2V5VGl0bGUoc1Byb3BlcnR5VGV4dFZhbHVlLCB0cnVlKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIGJ1aWxkRXhwcmVzc2lvbkZvclNlbWFudGlja0tleVRpdGxlKHNQcm9wZXJ0eVRleHRWYWx1ZSwgdHJ1ZSk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIGlmIHRoZXJlIGlzIG5vIHRleHQgYXNzb2NpYXRpb24gdGhlbiB3ZSByZXR1cm4gdGhlIHByb3BlcnR5IHZhbHVlXG5cdFx0XHRyZXR1cm4gYnVpbGRFeHByZXNzaW9uRm9yU2VtYW50aWNrS2V5VGl0bGUoc1Byb3BlcnR5VmFsdWUsIHRydWUpO1xuXHRcdH1cblx0fSxcblxuXHRnZXRPYmplY3RJZGVudGlmaWVyVGV4dDogZnVuY3Rpb24gKFxuXHRcdG9UZXh0QW5ub3RhdGlvbjogYW55LFxuXHRcdG9UZXh0QXJyYW5nZW1lbnRBbm5vdGF0aW9uOiBhbnksXG5cdFx0c1Byb3BlcnR5VmFsdWVCaW5kaW5nOiBhbnksXG5cdFx0c0RhdGFGaWVsZE5hbWU6IGFueVxuXHQpIHtcblx0XHRpZiAob1RleHRBbm5vdGF0aW9uKSB7XG5cdFx0XHQvLyBUaGVyZSBpcyBhIHRleHQgYW5ub3RhdGlvbi4gSW4gdGhpcyBjYXNlLCB0aGUgT2JqZWN0SWRlbnRpZmllciBzaG93czpcblx0XHRcdC8vICAtIHRoZSAqdGV4dCogYXMgdGhlIE9iamVjdElkZW50aWZpZXIncyB0aXRsZVxuXHRcdFx0Ly8gIC0gdGhlICp2YWx1ZSogYXMgdGhlIE9iamVjdElkZW50aWZpZXIncyB0ZXh0XG5cdFx0XHQvL1xuXHRcdFx0Ly8gU28gaWYgdGhlIFRleHRBcnJhbmdlbWVudCBpcyAjVGV4dE9ubHkgb3IgI1RleHRTZXBhcmF0ZSwgZG8gbm90IHNldCB0aGUgT2JqZWN0SWRlbnRpZmllcidzIHRleHRcblx0XHRcdC8vIHByb3BlcnR5XG5cdFx0XHRpZiAoXG5cdFx0XHRcdG9UZXh0QXJyYW5nZW1lbnRBbm5vdGF0aW9uICYmXG5cdFx0XHRcdChvVGV4dEFycmFuZ2VtZW50QW5ub3RhdGlvbi4kRW51bU1lbWJlciA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5UZXh0QXJyYW5nZW1lbnRUeXBlL1RleHRPbmx5XCIgfHxcblx0XHRcdFx0XHRvVGV4dEFycmFuZ2VtZW50QW5ub3RhdGlvbi4kRW51bU1lbWJlciA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5UZXh0QXJyYW5nZW1lbnRUeXBlL1RleHRTZXBhcmF0ZVwiIHx8XG5cdFx0XHRcdFx0b1RleHRBcnJhbmdlbWVudEFubm90YXRpb24uJEVudW1NZW1iZXIgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuVGV4dEFycmFuZ2VtZW50VHlwZS9UZXh0Rmlyc3RcIilcblx0XHRcdCkge1xuXHRcdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIHNQcm9wZXJ0eVZhbHVlQmluZGluZyB8fCBgeyR7c0RhdGFGaWVsZE5hbWV9fWA7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gbm8gdGV4dCBhbm5vdGF0aW9uOiB0aGUgcHJvcGVydHkgdmFsdWUgaXMgcGFydCBvZiB0aGUgT2JqZWN0SWRlbnRpZmllcidzIHRpdGxlIGFscmVhZHlcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9LFxuXG5cdGdldFNlbWFudGljT2JqZWN0c0xpc3Q6IGZ1bmN0aW9uIChwcm9wZXJ0eUFubm90YXRpb25zOiBhbnkpIHtcblx0XHQvLyBsb29rIGZvciBhbm5vdGF0aW9ucyBTZW1hbnRpY09iamVjdCB3aXRoIGFuZCB3aXRob3V0IHF1YWxpZmllclxuXHRcdC8vIHJldHVybnMgOiBsaXN0IG9mIFNlbWFudGljT2JqZWN0c1xuXHRcdGNvbnN0IGFubm90YXRpb25zID0gcHJvcGVydHlBbm5vdGF0aW9ucztcblx0XHRjb25zdCBhU2VtYW50aWNPYmplY3RzID0gW107XG5cdFx0Zm9yIChjb25zdCBrZXkgaW4gYW5ub3RhdGlvbnMuZ2V0T2JqZWN0KCkpIHtcblx0XHRcdC8vIHZhciBxdWFsaWZpZXI7XG5cdFx0XHRpZiAoXG5cdFx0XHRcdGtleS5pbmRleE9mKFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlNlbWFudGljT2JqZWN0XCIpID4gLTEgJiZcblx0XHRcdFx0a2V5LmluZGV4T2YoXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuU2VtYW50aWNPYmplY3RNYXBwaW5nXCIpID09PSAtMSAmJlxuXHRcdFx0XHRrZXkuaW5kZXhPZihcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5TZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uc1wiKSA9PT0gLTFcblx0XHRcdCkge1xuXHRcdFx0XHRsZXQgc2VtYW50aWNPYmplY3RWYWx1ZSA9IGFubm90YXRpb25zLmdldE9iamVjdCgpW2tleV07XG5cdFx0XHRcdGlmICh0eXBlb2Ygc2VtYW50aWNPYmplY3RWYWx1ZSA9PT0gXCJvYmplY3RcIikge1xuXHRcdFx0XHRcdHNlbWFudGljT2JqZWN0VmFsdWUgPSBBbm5vdGF0aW9uSGVscGVyLnZhbHVlKHNlbWFudGljT2JqZWN0VmFsdWUsIHsgY29udGV4dDogcHJvcGVydHlBbm5vdGF0aW9ucyB9KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoYVNlbWFudGljT2JqZWN0cy5pbmRleE9mKHNlbWFudGljT2JqZWN0VmFsdWUpID09PSAtMSkge1xuXHRcdFx0XHRcdGFTZW1hbnRpY09iamVjdHMucHVzaChzZW1hbnRpY09iamVjdFZhbHVlKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRjb25zdCBvU2VtYW50aWNPYmplY3RzTW9kZWwgPSBuZXcgSlNPTk1vZGVsKGFTZW1hbnRpY09iamVjdHMpO1xuXHRcdChvU2VtYW50aWNPYmplY3RzTW9kZWwgYXMgYW55KS4kJHZhbHVlQXNQcm9taXNlID0gdHJ1ZTtcblx0XHRyZXR1cm4gb1NlbWFudGljT2JqZWN0c01vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KFwiL1wiKTtcblx0fSxcblx0Z2V0U2VtYW50aWNPYmplY3RzUXVhbGlmaWVyczogZnVuY3Rpb24gKHByb3BlcnR5QW5ub3RhdGlvbnM6IGFueSkge1xuXHRcdC8vIGxvb2sgZm9yIGFubm90YXRpb25zIFNlbWFudGljT2JqZWN0LCBTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucywgU2VtYW50aWNPYmplY3RNYXBwaW5nXG5cdFx0Ly8gcmV0dXJucyA6IGxpc3Qgb2YgcXVhbGlmaWVycyAoYXJyYXkgb2Ygb2JqZWN0cyB3aXRoIHF1YWxpZmllcnMgOiB7cXVhbGlmaWVyLCBTZW1hbnRpY09iamVjdCwgU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMsIFNlbWFudGljT2JqZWN0TWFwcGluZyBmb3IgdGhpcyBxdWFsaWZpZXJ9XG5cdFx0Y29uc3QgYW5ub3RhdGlvbnMgPSBwcm9wZXJ0eUFubm90YXRpb25zO1xuXHRcdGxldCBxdWFsaWZpZXJzQW5ub3RhdGlvbnM6IGFueVtdID0gW107XG5cdFx0Y29uc3QgZmluZE9iamVjdCA9IGZ1bmN0aW9uIChxdWFsaWZpZXI6IGFueSkge1xuXHRcdFx0cmV0dXJuIHF1YWxpZmllcnNBbm5vdGF0aW9ucy5maW5kKGZ1bmN0aW9uIChvYmplY3Q6IGFueSkge1xuXHRcdFx0XHRyZXR1cm4gb2JqZWN0LnF1YWxpZmllciA9PT0gcXVhbGlmaWVyO1xuXHRcdFx0fSk7XG5cdFx0fTtcblx0XHRmb3IgKGNvbnN0IGtleSBpbiBhbm5vdGF0aW9ucy5nZXRPYmplY3QoKSkge1xuXHRcdFx0Ly8gdmFyIHF1YWxpZmllcjtcblx0XHRcdGlmIChcblx0XHRcdFx0a2V5LmluZGV4T2YoXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuU2VtYW50aWNPYmplY3QjXCIpID4gLTEgfHxcblx0XHRcdFx0a2V5LmluZGV4T2YoXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuU2VtYW50aWNPYmplY3RNYXBwaW5nI1wiKSA+IC0xIHx8XG5cdFx0XHRcdGtleS5pbmRleE9mKFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zI1wiKSA+IC0xXG5cdFx0XHQpIHtcblx0XHRcdFx0Y29uc3QgYW5ub3RhdGlvbkNvbnRlbnQgPSBhbm5vdGF0aW9ucy5nZXRPYmplY3QoKVtrZXldLFxuXHRcdFx0XHRcdGFubm90YXRpb24gPSBrZXkuc3BsaXQoXCIjXCIpWzBdLFxuXHRcdFx0XHRcdHF1YWxpZmllciA9IGtleS5zcGxpdChcIiNcIilbMV07XG5cdFx0XHRcdGxldCBxdWFsaWZpZXJPYmplY3QgPSBmaW5kT2JqZWN0KHF1YWxpZmllcik7XG5cblx0XHRcdFx0aWYgKCFxdWFsaWZpZXJPYmplY3QpIHtcblx0XHRcdFx0XHRxdWFsaWZpZXJPYmplY3QgPSB7XG5cdFx0XHRcdFx0XHRxdWFsaWZpZXI6IHF1YWxpZmllclxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0cXVhbGlmaWVyT2JqZWN0W2Fubm90YXRpb25dID0gYW5ub3RhdGlvbkNvbnRlbnQ7XG5cdFx0XHRcdFx0cXVhbGlmaWVyc0Fubm90YXRpb25zLnB1c2gocXVhbGlmaWVyT2JqZWN0KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRxdWFsaWZpZXJPYmplY3RbYW5ub3RhdGlvbl0gPSBhbm5vdGF0aW9uQ29udGVudDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRxdWFsaWZpZXJzQW5ub3RhdGlvbnMgPSBxdWFsaWZpZXJzQW5ub3RhdGlvbnMuZmlsdGVyKGZ1bmN0aW9uIChvUXVhbGlmaWVyOiBhbnkpIHtcblx0XHRcdHJldHVybiAhIW9RdWFsaWZpZXJbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlNlbWFudGljT2JqZWN0XCJdO1xuXHRcdH0pO1xuXHRcdGNvbnN0IG9RdWFsaWZpZXJzTW9kZWwgPSBuZXcgSlNPTk1vZGVsKHF1YWxpZmllcnNBbm5vdGF0aW9ucyk7XG5cdFx0KG9RdWFsaWZpZXJzTW9kZWwgYXMgYW55KS4kJHZhbHVlQXNQcm9taXNlID0gdHJ1ZTtcblx0XHRyZXR1cm4gb1F1YWxpZmllcnNNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIik7XG5cdH0sXG5cdGNvbXB1dGVTZW1hbnRpY0xpbmtNb2RlbENvbnRleHRDaGFuZ2U6IGZ1bmN0aW9uIChhU2VtYW50aWNPYmplY3RzOiBhbnksIG9EYXRhTW9kZWxPYmplY3RQYXRoOiBhbnkpIHtcblx0XHRpZiAoRmllbGRIZWxwZXIuaGFzU2VtYW50aWNPYmplY3RzV2l0aFBhdGgoYVNlbWFudGljT2JqZWN0cykpIHtcblx0XHRcdGNvbnN0IHNQYXRoVG9Qcm9wZXJ0eSA9IEZpZWxkSGVscGVyLmJ1aWxkVGFyZ2V0UGF0aEZyb21EYXRhTW9kZWxPYmplY3RQYXRoKG9EYXRhTW9kZWxPYmplY3RQYXRoKTtcblx0XHRcdHJldHVybiBgRmllbGRSdW50aW1lLkxpbmtNb2RlbENvbnRleHRDaGFuZ2UoJGV2ZW50LCAnJHtcblx0XHRcdFx0KG9EYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdCBhcyBQcm9wZXJ0eSkubmFtZVxuXHRcdFx0fScsICcke3NQYXRoVG9Qcm9wZXJ0eX0nKWA7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXHR9LFxuXHRoYXNTZW1hbnRpY09iamVjdHNXaXRoUGF0aDogZnVuY3Rpb24gKGFTZW1hbnRpY09iamVjdHM6IGFueSkge1xuXHRcdGxldCBiU2VtYW50aWNPYmplY3RIYXNBUGF0aCA9IGZhbHNlO1xuXHRcdGlmIChhU2VtYW50aWNPYmplY3RzICYmIGFTZW1hbnRpY09iamVjdHMubGVuZ3RoKSB7XG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGFTZW1hbnRpY09iamVjdHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYgKGFTZW1hbnRpY09iamVjdHNbaV0gJiYgYVNlbWFudGljT2JqZWN0c1tpXS52YWx1ZSAmJiBhU2VtYW50aWNPYmplY3RzW2ldLnZhbHVlLmluZGV4T2YoXCJ7XCIpID09PSAwKSB7XG5cdFx0XHRcdFx0YlNlbWFudGljT2JqZWN0SGFzQVBhdGggPSB0cnVlO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBiU2VtYW50aWNPYmplY3RIYXNBUGF0aDtcblx0fSxcblx0aXNTZW1hbnRpY0tleUhhc0ZpZWxkR3JvdXBDb2x1bW46IGZ1bmN0aW9uIChpc0ZpZWxkR3JvdXBDb2x1bW46IGFueSkge1xuXHRcdHJldHVybiBpc0ZpZWxkR3JvdXBDb2x1bW47XG5cdH0sXG5cdC8qXG5cdCAqIE1ldGhvZCB0byBjb21wdXRlIHRoZSBkZWxlZ2F0ZSB3aXRoIHBheWxvYWRcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBkZWxlZ2F0ZU5hbWUgLSBuYW1lIG9mIHRoZSBkZWxlZ2F0ZSBtZXRob2RlXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gcmV0cmlldmVUZXh0RnJvbVZhbHVlTGlzdCAtIGFkZGVkIHRvIHRoZSBwYXlsb2FkIG9mIHRoZSBkZWxlZ2F0ZSBtZXRob2RlXG5cdCAqIEByZXR1cm4ge29iamVjdH0gLSByZXR1cm5zIHRoZSBkZWxlZ2F0ZSB3aXRoIHBheWxvYWRcblx0ICovXG5cdGNvbXB1dGVGaWVsZEJhc2VEZWxlZ2F0ZTogZnVuY3Rpb24gKGRlbGVnYXRlTmFtZTogc3RyaW5nLCByZXRyaWV2ZVRleHRGcm9tVmFsdWVMaXN0OiBib29sZWFuKSB7XG5cdFx0aWYgKHJldHJpZXZlVGV4dEZyb21WYWx1ZUxpc3QpIHtcblx0XHRcdHJldHVybiBKU09OLnN0cmluZ2lmeSh7XG5cdFx0XHRcdG5hbWU6IGRlbGVnYXRlTmFtZSxcblx0XHRcdFx0cGF5bG9hZDoge1xuXHRcdFx0XHRcdHJldHJpZXZlVGV4dEZyb21WYWx1ZUxpc3Q6IHJldHJpZXZlVGV4dEZyb21WYWx1ZUxpc3Rcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdHJldHVybiBge25hbWU6ICcke2RlbGVnYXRlTmFtZX0nfWA7XG5cdH0sXG5cdF9nZXRQcmltYXJ5SW50ZW50czogZnVuY3Rpb24gKGFTZW1hbnRpY09iamVjdHNMaXN0OiBhbnlbXSk6IFByb21pc2U8YW55W10+IHtcblx0XHRjb25zdCBhUHJvbWlzZXM6IGFueVtdID0gW107XG5cdFx0aWYgKGFTZW1hbnRpY09iamVjdHNMaXN0KSB7XG5cdFx0XHRjb25zdCBvVXNoZWxsQ29udGFpbmVyID0gc2FwLnVzaGVsbCAmJiBzYXAudXNoZWxsLkNvbnRhaW5lcjtcblx0XHRcdGNvbnN0IG9TZXJ2aWNlID0gb1VzaGVsbENvbnRhaW5lciAmJiBvVXNoZWxsQ29udGFpbmVyLmdldFNlcnZpY2UoXCJDcm9zc0FwcGxpY2F0aW9uTmF2aWdhdGlvblwiKTtcblx0XHRcdGFTZW1hbnRpY09iamVjdHNMaXN0LmZvckVhY2goZnVuY3Rpb24gKHNlbU9iamVjdCkge1xuXHRcdFx0XHRpZiAodHlwZW9mIHNlbU9iamVjdCA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0XHRcdGFQcm9taXNlcy5wdXNoKG9TZXJ2aWNlLmdldFByaW1hcnlJbnRlbnQoc2VtT2JqZWN0LCB7fSkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0cmV0dXJuIFByb21pc2UuYWxsKGFQcm9taXNlcylcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChhU2VtT2JqZWN0UHJpbWFyeUFjdGlvbikge1xuXHRcdFx0XHRyZXR1cm4gYVNlbU9iamVjdFByaW1hcnlBY3Rpb247XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChvRXJyb3IpIHtcblx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3IgZmV0Y2hpbmcgcHJpbWFyeSBpbnRlbnRzXCIsIG9FcnJvcik7XG5cdFx0XHRcdHJldHVybiBbXTtcblx0XHRcdH0pO1xuXHR9LFxuXHRfU2VtYW50aWNPYmplY3RzSGFzUHJpbWFyeUFjdGlvbjogZnVuY3Rpb24gKG9TZW1hbnRpY3M6IGFueSwgYVNlbWFudGljT2JqZWN0c1ByaW1hcnlBY3Rpb25zOiBhbnkpOiBib29sZWFuIHtcblx0XHRjb25zdCBfZm5Jc1NlbWFudGljT2JqZWN0QWN0aW9uVW5hdmFpbGFibGUgPSBmdW5jdGlvbiAoX29TZW1hbnRpY3M6IGFueSwgX29QcmltYXJ5QWN0aW9uOiBhbnksIF9pbmRleDogc3RyaW5nKSB7XG5cdFx0XHRmb3IgKGNvbnN0IHVuYXZhaWxhYmxlQWN0aW9uc0luZGV4IGluIF9vU2VtYW50aWNzLnNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zW19pbmRleF0uYWN0aW9ucykge1xuXHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0X29QcmltYXJ5QWN0aW9uLmludGVudFxuXHRcdFx0XHRcdFx0LnNwbGl0KFwiLVwiKVsxXVxuXHRcdFx0XHRcdFx0LmluZGV4T2YoX29TZW1hbnRpY3Muc2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnNbX2luZGV4XS5hY3Rpb25zW3VuYXZhaWxhYmxlQWN0aW9uc0luZGV4XSkgPT09IDBcblx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9O1xuXHRcdG9TZW1hbnRpY3Muc2VtYW50aWNQcmltYXJ5QWN0aW9ucyA9IGFTZW1hbnRpY09iamVjdHNQcmltYXJ5QWN0aW9ucztcblx0XHRjb25zdCBvUHJpbWFyeUFjdGlvbiA9XG5cdFx0XHRvU2VtYW50aWNzLnNlbWFudGljT2JqZWN0cyAmJlxuXHRcdFx0b1NlbWFudGljcy5tYWluU2VtYW50aWNPYmplY3QgJiZcblx0XHRcdG9TZW1hbnRpY3Muc2VtYW50aWNQcmltYXJ5QWN0aW9uc1tvU2VtYW50aWNzLnNlbWFudGljT2JqZWN0cy5pbmRleE9mKG9TZW1hbnRpY3MubWFpblNlbWFudGljT2JqZWN0KV07XG5cdFx0Y29uc3Qgc0N1cnJlbnRIYXNoID0gQ29tbW9uVXRpbHMuZ2V0SGFzaCgpO1xuXHRcdGlmIChvU2VtYW50aWNzLm1haW5TZW1hbnRpY09iamVjdCAmJiBvUHJpbWFyeUFjdGlvbiAhPT0gbnVsbCAmJiBvUHJpbWFyeUFjdGlvbi5pbnRlbnQgIT09IHNDdXJyZW50SGFzaCkge1xuXHRcdFx0Zm9yIChjb25zdCBpbmRleCBpbiBvU2VtYW50aWNzLnNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zKSB7XG5cdFx0XHRcdGlmIChvU2VtYW50aWNzLm1haW5TZW1hbnRpY09iamVjdC5pbmRleE9mKG9TZW1hbnRpY3Muc2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnNbaW5kZXhdLnNlbWFudGljT2JqZWN0KSA9PT0gMCkge1xuXHRcdFx0XHRcdHJldHVybiBfZm5Jc1NlbWFudGljT2JqZWN0QWN0aW9uVW5hdmFpbGFibGUob1NlbWFudGljcywgb1ByaW1hcnlBY3Rpb24sIGluZGV4KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdH0sXG5cdGNoZWNrUHJpbWFyeUFjdGlvbnM6IGZ1bmN0aW9uIChvU2VtYW50aWNzOiBhbnksIGJHZXRUaXRsZUxpbms6IGJvb2xlYW4pIHtcblx0XHRyZXR1cm4gdGhpcy5fZ2V0UHJpbWFyeUludGVudHMob1NlbWFudGljcyAmJiBvU2VtYW50aWNzLnNlbWFudGljT2JqZWN0cylcblx0XHRcdC50aGVuKChhU2VtYW50aWNPYmplY3RzUHJpbWFyeUFjdGlvbnM6IGFueVtdKSA9PiB7XG5cdFx0XHRcdHJldHVybiBiR2V0VGl0bGVMaW5rXG5cdFx0XHRcdFx0PyB7XG5cdFx0XHRcdFx0XHRcdHRpdGxlTGluazogYVNlbWFudGljT2JqZWN0c1ByaW1hcnlBY3Rpb25zLFxuXHRcdFx0XHRcdFx0XHRoYXNUaXRsZUxpbms6IHRoaXMuX1NlbWFudGljT2JqZWN0c0hhc1ByaW1hcnlBY3Rpb24ob1NlbWFudGljcywgYVNlbWFudGljT2JqZWN0c1ByaW1hcnlBY3Rpb25zKVxuXHRcdFx0XHRcdCAgfVxuXHRcdFx0XHRcdDogdGhpcy5fU2VtYW50aWNPYmplY3RzSGFzUHJpbWFyeUFjdGlvbihvU2VtYW50aWNzLCBhU2VtYW50aWNPYmplY3RzUHJpbWFyeUFjdGlvbnMpO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbiAob0Vycm9yKSB7XG5cdFx0XHRcdExvZy5lcnJvcihcIkVycm9yIGluIGNoZWNrUHJpbWFyeUFjdGlvbnNcIiwgb0Vycm9yKTtcblx0XHRcdH0pO1xuXHR9LFxuXHRfZ2V0VGl0bGVMaW5rV2l0aFBhcmFtZXRlcnM6IGZ1bmN0aW9uIChfb1NlbWFudGljT2JqZWN0TW9kZWw6IGFueSwgX2xpbmtJbnRlbnQ6IHN0cmluZykge1xuXHRcdGlmIChfb1NlbWFudGljT2JqZWN0TW9kZWwgJiYgX29TZW1hbnRpY09iamVjdE1vZGVsLnRpdGxlbGluaykge1xuXHRcdFx0cmV0dXJuIF9vU2VtYW50aWNPYmplY3RNb2RlbC50aXRsZWxpbms7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBfbGlua0ludGVudDtcblx0XHR9XG5cdH0sXG5cblx0Z2V0UHJpbWFyeUFjdGlvbjogZnVuY3Rpb24gKG9TZW1hbnRpY3M6IGFueSkge1xuXHRcdHJldHVybiBvU2VtYW50aWNzLnNlbWFudGljUHJpbWFyeUFjdGlvbnNbb1NlbWFudGljcy5zZW1hbnRpY09iamVjdHMuaW5kZXhPZihvU2VtYW50aWNzLm1haW5TZW1hbnRpY09iamVjdCldLmludGVudFxuXHRcdFx0PyBGaWVsZEhlbHBlci5fZ2V0VGl0bGVMaW5rV2l0aFBhcmFtZXRlcnMoXG5cdFx0XHRcdFx0b1NlbWFudGljcyxcblx0XHRcdFx0XHRvU2VtYW50aWNzLnNlbWFudGljUHJpbWFyeUFjdGlvbnNbb1NlbWFudGljcy5zZW1hbnRpY09iamVjdHMuaW5kZXhPZihvU2VtYW50aWNzLm1haW5TZW1hbnRpY09iamVjdCldLmludGVudFxuXHRcdFx0ICApXG5cdFx0XHQ6IG9TZW1hbnRpY3MucHJpbWFyeUludGVudEFjdGlvbjtcblx0fSxcblx0LyoqXG5cdCAqIE1ldGhvZCB0byBmZXRjaCB0aGUgZmlsdGVyIHJlc3RyaWN0aW9ucy4gRmlsdGVyIHJlc3RyaWN0aW9ucyBjYW4gYmUgYW5ub3RhdGVkIG9uIGFuIGVudGl0eSBzZXQgb3IgYSBuYXZpZ2F0aW9uIHByb3BlcnR5LlxuXHQgKiBEZXBlbmRpbmcgb24gdGhlIHBhdGggdG8gd2hpY2ggdGhlIGNvbnRyb2wgaXMgYm91bmQsIHdlIGNoZWNrIGZvciBmaWx0ZXIgcmVzdHJpY3Rpb25zIG9uIHRoZSBjb250ZXh0IHBhdGggb2YgdGhlIGNvbnRyb2wsXG5cdCAqIG9yIG9uIHRoZSBuYXZpZ2F0aW9uIHByb3BlcnR5IChpZiB0aGVyZSBpcyBhIG5hdmlnYXRpb24pLlxuXHQgKiBFZy4gSWYgdGhlIHRhYmxlIGlzIGJvdW5kIHRvICcvRW50aXR5U2V0JywgZm9yIHByb3BlcnR5IHBhdGggJy9FbnRpdHlTZXQvX0Fzc29jaWF0aW9uL1Byb3BlcnR5TmFtZScsIHRoZSBmaWx0ZXIgcmVzdHJpY3Rpb25zXG5cdCAqIG9uICcvRW50aXR5U2V0JyB3aW4gb3ZlciBmaWx0ZXIgcmVzdHJpY3Rpb25zIG9uICcvRW50aXR5U2V0L19Bc3NvY2lhdGlvbicuXG5cdCAqIElmIHRoZSB0YWJsZSBpcyBib3VuZCB0byAnL0VudGl0eVNldC9fQXNzb2NpYXRpb24nLCB0aGUgZmlsdGVyIHJlc3RyaWN0aW9ucyBvbiAnL0VudGl0eVNldC9fQXNzb2NpYXRpb24nIHdpbiBvdmVyIGZpbHRlclxuXHQgKiByZXRyaWN0aW9ucyBvbiAnL0Fzc29jaWF0aW9uRW50aXR5U2V0Jy5cblx0ICpcblx0ICogQHBhcmFtIG9Db250ZXh0IFByb3BlcnR5IENvbnRleHRcblx0ICogQHBhcmFtIG9Qcm9wZXJ0eSBQcm9wZXJ0eSBvYmplY3QgaW4gdGhlIG1ldGFkYXRhXG5cdCAqIEBwYXJhbSBiVXNlU2VtYW50aWNEYXRlUmFuZ2UgQm9vbGVhbiBTdWdnZXN0cyBpZiBzZW1hbnRpYyBkYXRlIHJhbmdlIHNob3VsZCBiZSB1c2VkXG5cdCAqIEBwYXJhbSBzU2V0dGluZ3MgU3RyaW5naWZpZWQgb2JqZWN0IG9mIHRoZSBwcm9wZXJ0eSBzZXR0aW5nc1xuXHQgKiBAcGFyYW0gY29udGV4dFBhdGggUGF0aCB0byB3aGljaCB0aGUgcGFyZW50IGNvbnRyb2wgKHRoZSB0YWJsZSBvciB0aGUgZmlsdGVyIGJhcikgaXMgYm91bmRcblx0ICogQHJldHVybnMgU3RyaW5nIGNvbnRhaW5pbmcgY29tbWEtc2VwYXJhdGVkIGxpc3Qgb2Ygb3BlcmF0b3JzIGZvciBmaWx0ZXJpbmdcblx0ICovXG5cdG9wZXJhdG9yczogZnVuY3Rpb24gKG9Db250ZXh0OiBCYXNlQ29udGV4dCwgb1Byb3BlcnR5OiBhbnksIGJVc2VTZW1hbnRpY0RhdGVSYW5nZTogYm9vbGVhbiwgc1NldHRpbmdzOiBzdHJpbmcsIGNvbnRleHRQYXRoOiBzdHJpbmcpIHtcblx0XHRpZiAoIW9Qcm9wZXJ0eSB8fCAhY29udGV4dFBhdGgpIHtcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXHRcdGxldCBvcGVyYXRvcnM6IHN0cmluZ1tdO1xuXHRcdGNvbnN0IHNQcm9wZXJ0eSA9IEZpZWxkSGVscGVyLnByb3BlcnR5TmFtZShvUHJvcGVydHksIHsgY29udGV4dDogb0NvbnRleHQgfSk7XG5cdFx0Y29uc3Qgb01vZGVsID0gb0NvbnRleHQuZ2V0TW9kZWwoKSBhcyBPRGF0YU1ldGFNb2RlbCxcblx0XHRcdHNQcm9wZXJ0eVBhdGggPSBvQ29udGV4dC5nZXRQYXRoKCksXG5cdFx0XHRzUHJvcGVydHlMb2NhdGlvblBhdGggPSBDb21tb25IZWxwZXIuZ2V0TG9jYXRpb25Gb3JQcm9wZXJ0eVBhdGgob01vZGVsLCBzUHJvcGVydHlQYXRoKSxcblx0XHRcdHByb3BlcnR5VHlwZSA9IG9Qcm9wZXJ0eS4kVHlwZTtcblxuXHRcdGlmIChwcm9wZXJ0eVR5cGUgPT09IFwiRWRtLkd1aWRcIikge1xuXHRcdFx0cmV0dXJuIENvbW1vblV0aWxzLmdldE9wZXJhdG9yc0Zvckd1aWRQcm9wZXJ0eSgpO1xuXHRcdH1cblxuXHRcdC8vIHJlbW92ZSAnLydcblx0XHRjb250ZXh0UGF0aCA9IGNvbnRleHRQYXRoLnNsaWNlKDAsIC0xKTtcblx0XHRjb25zdCBpc1RhYmxlQm91bmRUb05hdmlnYXRpb246IEJvb2xlYW4gPSBjb250ZXh0UGF0aC5sYXN0SW5kZXhPZihcIi9cIikgPiAwO1xuXHRcdGNvbnN0IGlzTmF2aWdhdGlvblBhdGg6IEJvb2xlYW4gPVxuXHRcdFx0KGlzVGFibGVCb3VuZFRvTmF2aWdhdGlvbiAmJiBjb250ZXh0UGF0aCAhPT0gc1Byb3BlcnR5TG9jYXRpb25QYXRoKSB8fFxuXHRcdFx0KCFpc1RhYmxlQm91bmRUb05hdmlnYXRpb24gJiYgc1Byb3BlcnR5TG9jYXRpb25QYXRoLmxhc3RJbmRleE9mKFwiL1wiKSA+IDApO1xuXHRcdGNvbnN0IG5hdmlnYXRpb25QYXRoOiBzdHJpbmcgPVxuXHRcdFx0KGlzTmF2aWdhdGlvblBhdGggJiYgc1Byb3BlcnR5TG9jYXRpb25QYXRoLnN1YnN0cihzUHJvcGVydHlMb2NhdGlvblBhdGguaW5kZXhPZihjb250ZXh0UGF0aCkgKyBjb250ZXh0UGF0aC5sZW5ndGggKyAxKSkgfHwgXCJcIjtcblx0XHRjb25zdCBwcm9wZXJ0eVBhdGg6IHN0cmluZyA9IChpc05hdmlnYXRpb25QYXRoICYmIG5hdmlnYXRpb25QYXRoICsgXCIvXCIgKyBzUHJvcGVydHkpIHx8IHNQcm9wZXJ0eTtcblxuXHRcdGlmICghaXNUYWJsZUJvdW5kVG9OYXZpZ2F0aW9uKSB7XG5cdFx0XHRpZiAoIWlzTmF2aWdhdGlvblBhdGgpIHtcblx0XHRcdFx0Ly8gL1NhbGVzT3JkZXJNYW5hZ2UvSURcblx0XHRcdFx0b3BlcmF0b3JzID0gQ29tbW9uVXRpbHMuZ2V0T3BlcmF0b3JzRm9yUHJvcGVydHkoXG5cdFx0XHRcdFx0c1Byb3BlcnR5LFxuXHRcdFx0XHRcdHNQcm9wZXJ0eUxvY2F0aW9uUGF0aCxcblx0XHRcdFx0XHRvTW9kZWwsXG5cdFx0XHRcdFx0cHJvcGVydHlUeXBlLFxuXHRcdFx0XHRcdGJVc2VTZW1hbnRpY0RhdGVSYW5nZSxcblx0XHRcdFx0XHRzU2V0dGluZ3Ncblx0XHRcdFx0KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIC9TYWxlc09yZGVyTWFuYW5nZS9fSXRlbS9NYXRlcmlhbFxuXHRcdFx0XHQvL2xldCBvcGVyYXRvcnNcblx0XHRcdFx0b3BlcmF0b3JzID0gQ29tbW9uVXRpbHMuZ2V0T3BlcmF0b3JzRm9yUHJvcGVydHkoXG5cdFx0XHRcdFx0cHJvcGVydHlQYXRoLFxuXHRcdFx0XHRcdGNvbnRleHRQYXRoLFxuXHRcdFx0XHRcdG9Nb2RlbCxcblx0XHRcdFx0XHRwcm9wZXJ0eVR5cGUsXG5cdFx0XHRcdFx0YlVzZVNlbWFudGljRGF0ZVJhbmdlLFxuXHRcdFx0XHRcdHNTZXR0aW5nc1xuXHRcdFx0XHQpO1xuXHRcdFx0XHRpZiAob3BlcmF0b3JzLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0XHRcdG9wZXJhdG9ycyA9IENvbW1vblV0aWxzLmdldE9wZXJhdG9yc0ZvclByb3BlcnR5KFxuXHRcdFx0XHRcdFx0c1Byb3BlcnR5LFxuXHRcdFx0XHRcdFx0c1Byb3BlcnR5TG9jYXRpb25QYXRoLFxuXHRcdFx0XHRcdFx0b01vZGVsLFxuXHRcdFx0XHRcdFx0cHJvcGVydHlUeXBlLFxuXHRcdFx0XHRcdFx0YlVzZVNlbWFudGljRGF0ZVJhbmdlLFxuXHRcdFx0XHRcdFx0c1NldHRpbmdzXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAoIWlzTmF2aWdhdGlvblBhdGgpIHtcblx0XHRcdC8vIC9TYWxlc09yZGVyTWFuYWdlL19JdGVtL01hdGVyaWFsXG5cdFx0XHRvcGVyYXRvcnMgPSBDb21tb25VdGlscy5nZXRPcGVyYXRvcnNGb3JQcm9wZXJ0eShcblx0XHRcdFx0cHJvcGVydHlQYXRoLFxuXHRcdFx0XHRjb250ZXh0UGF0aCxcblx0XHRcdFx0b01vZGVsLFxuXHRcdFx0XHRwcm9wZXJ0eVR5cGUsXG5cdFx0XHRcdGJVc2VTZW1hbnRpY0RhdGVSYW5nZSxcblx0XHRcdFx0c1NldHRpbmdzXG5cdFx0XHQpO1xuXHRcdFx0aWYgKG9wZXJhdG9ycy5sZW5ndGggPT09IDApIHtcblx0XHRcdFx0b3BlcmF0b3JzID0gQ29tbW9uVXRpbHMuZ2V0T3BlcmF0b3JzRm9yUHJvcGVydHkoXG5cdFx0XHRcdFx0c1Byb3BlcnR5LFxuXHRcdFx0XHRcdE1vZGVsSGVscGVyLmdldEVudGl0eVNldFBhdGgoY29udGV4dFBhdGgpLFxuXHRcdFx0XHRcdG9Nb2RlbCxcblx0XHRcdFx0XHRwcm9wZXJ0eVR5cGUsXG5cdFx0XHRcdFx0YlVzZVNlbWFudGljRGF0ZVJhbmdlLFxuXHRcdFx0XHRcdHNTZXR0aW5nc1xuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIG9wZXJhdG9ycz8ubGVuZ3RoID4gMCA/IG9wZXJhdG9ycy50b1N0cmluZygpIDogdW5kZWZpbmVkO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyAvU2FsZXNPcmRlck1hbmFnZS9fSXRlbS9fQXNzb2NpYXRpb24vUHJvcGVydHlOYW1lXG5cdFx0XHQvLyBUaGlzIGlzIGN1cnJlbnRseSBub3Qgc3VwcG9ydGVkIGZvciB0YWJsZXNcblx0XHRcdG9wZXJhdG9ycyA9IENvbW1vblV0aWxzLmdldE9wZXJhdG9yc0ZvclByb3BlcnR5KFxuXHRcdFx0XHRwcm9wZXJ0eVBhdGgsXG5cdFx0XHRcdGNvbnRleHRQYXRoLFxuXHRcdFx0XHRvTW9kZWwsXG5cdFx0XHRcdHByb3BlcnR5VHlwZSxcblx0XHRcdFx0YlVzZVNlbWFudGljRGF0ZVJhbmdlLFxuXHRcdFx0XHRzU2V0dGluZ3Ncblx0XHRcdCk7XG5cdFx0XHRpZiAob3BlcmF0b3JzLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0XHRvcGVyYXRvcnMgPSBDb21tb25VdGlscy5nZXRPcGVyYXRvcnNGb3JQcm9wZXJ0eShcblx0XHRcdFx0XHRwcm9wZXJ0eVBhdGgsXG5cdFx0XHRcdFx0TW9kZWxIZWxwZXIuZ2V0RW50aXR5U2V0UGF0aChjb250ZXh0UGF0aCksXG5cdFx0XHRcdFx0b01vZGVsLFxuXHRcdFx0XHRcdHByb3BlcnR5VHlwZSxcblx0XHRcdFx0XHRiVXNlU2VtYW50aWNEYXRlUmFuZ2UsXG5cdFx0XHRcdFx0c1NldHRpbmdzXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKCghb3BlcmF0b3JzIHx8IG9wZXJhdG9ycy5sZW5ndGggPT09IDApICYmIChwcm9wZXJ0eVR5cGUgPT09IFwiRWRtLkRhdGVcIiB8fCBwcm9wZXJ0eVR5cGUgPT09IFwiRWRtLkRhdGVUaW1lT2Zmc2V0XCIpKSB7XG5cdFx0XHRvcGVyYXRvcnMgPSBDb21tb25VdGlscy5nZXRPcGVyYXRvcnNGb3JEYXRlUHJvcGVydHkocHJvcGVydHlUeXBlKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gb3BlcmF0b3JzLmxlbmd0aCA+IDAgPyBvcGVyYXRvcnMudG9TdHJpbmcoKSA6IHVuZGVmaW5lZDtcblx0fSxcblx0LyoqXG5cdCAqIFJldHVybiB0aGUgcHJvcGVydHkgY29udGV4dCBmb3IgdXNhZ2UgaW4gUXVpY2tWaWV3LlxuXHQgKlxuXHQgKiBAcGFyYW0gb0RhdGFGaWVsZENvbnRleHQgQ29udGV4dCBvZiB0aGUgZGF0YSBmaWVsZCBvciBhc3NvY2lhdGVkIHByb3BlcnR5XG5cdCAqIEByZXR1cm5zIEJpbmRpbmcgY29udGV4dFxuXHQgKi9cblx0Z2V0UHJvcGVydHlDb250ZXh0Rm9yUXVpY2tWaWV3OiBmdW5jdGlvbiAob0RhdGFGaWVsZENvbnRleHQ6IGFueSkge1xuXHRcdGlmIChvRGF0YUZpZWxkQ29udGV4dC5nZXRPYmplY3QoXCJWYWx1ZVwiKSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHQvLyBDcmVhdGUgYSBiaW5kaW5nIGNvbnRleHQgdG8gdGhlIHByb3BlcnR5IGZyb20gdGhlIGRhdGEgZmllbGQuXG5cdFx0XHRjb25zdCBvSW50ZXJmYWNlID0gb0RhdGFGaWVsZENvbnRleHQuZ2V0SW50ZXJmYWNlKCksXG5cdFx0XHRcdG9Nb2RlbCA9IG9JbnRlcmZhY2UuZ2V0TW9kZWwoKTtcblx0XHRcdGxldCBzUGF0aCA9IG9JbnRlcmZhY2UuZ2V0UGF0aCgpO1xuXHRcdFx0c1BhdGggPSBzUGF0aCArIChzUGF0aC5lbmRzV2l0aChcIi9cIikgPyBcIlZhbHVlXCIgOiBcIi9WYWx1ZVwiKTtcblx0XHRcdHJldHVybiBvTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoc1BhdGgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBJdCBpcyBhIHByb3BlcnR5LiBKdXN0IHJldHVybiB0aGUgY29udGV4dCBhcyBpdCBpcy5cblx0XHRcdHJldHVybiBvRGF0YUZpZWxkQ29udGV4dDtcblx0XHR9XG5cdH0sXG5cdC8qKlxuXHQgKiBSZXR1cm4gdGhlIGJpbmRpbmcgY29udGV4dCBjb3JyZXNwb25kaW5nIHRvIHRoZSBwcm9wZXJ0eSBwYXRoLlxuXHQgKlxuXHQgKiBAcGFyYW0gb1Byb3BlcnR5Q29udGV4dCBDb250ZXh0IG9mIHRoZSBwcm9wZXJ0eVxuXHQgKiBAcmV0dXJucyBCaW5kaW5nIGNvbnRleHRcblx0ICovXG5cdGdldFByb3BlcnR5UGF0aEZvclF1aWNrVmlldzogZnVuY3Rpb24gKG9Qcm9wZXJ0eUNvbnRleHQ6IGFueSkge1xuXHRcdGlmIChvUHJvcGVydHlDb250ZXh0ICYmIG9Qcm9wZXJ0eUNvbnRleHQuZ2V0T2JqZWN0KFwiJFBhdGhcIikpIHtcblx0XHRcdGNvbnN0IG9JbnRlcmZhY2UgPSBvUHJvcGVydHlDb250ZXh0LmdldEludGVyZmFjZSgpLFxuXHRcdFx0XHRvTW9kZWwgPSBvSW50ZXJmYWNlLmdldE1vZGVsKCk7XG5cdFx0XHRsZXQgc1BhdGggPSBvSW50ZXJmYWNlLmdldFBhdGgoKTtcblx0XHRcdHNQYXRoID0gc1BhdGggKyAoc1BhdGguZW5kc1dpdGgoXCIvXCIpID8gXCIkUGF0aFwiIDogXCIvJFBhdGhcIik7XG5cdFx0XHRyZXR1cm4gb01vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KHNQYXRoKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gb1Byb3BlcnR5Q29udGV4dDtcblx0fSxcblx0LyoqXG5cdCAqIFJldHVybiB0aGUgcGF0aCBvZiB0aGUgRGFGaWVsZERlZmF1bHQgKGlmIGFueSkuIE90aGVyd2lzZSwgdGhlIERhdGFGaWVsZCBwYXRoIGlzIHJldHVybmVkLlxuXHQgKlxuXHQgKiBAcGFyYW0gb0RhdGFGaWVsZENvbnRleHQgQ29udGV4dCBvZiB0aGUgRGF0YUZpZWxkXG5cdCAqIEByZXR1cm5zIE9iamVjdCBwYXRoXG5cdCAqL1xuXHRnZXREYXRhRmllbGREZWZhdWx0OiBmdW5jdGlvbiAob0RhdGFGaWVsZENvbnRleHQ6IGFueSkge1xuXHRcdGNvbnN0IG9EYXRhRmllbGREZWZhdWx0ID0gb0RhdGFGaWVsZENvbnRleHRcblx0XHRcdC5nZXRNb2RlbCgpXG5cdFx0XHQuZ2V0T2JqZWN0KGAke29EYXRhRmllbGRDb250ZXh0LmdldFBhdGgoKX1AY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRGVmYXVsdGApO1xuXHRcdHJldHVybiBvRGF0YUZpZWxkRGVmYXVsdFxuXHRcdFx0PyBgJHtvRGF0YUZpZWxkQ29udGV4dC5nZXRQYXRoKCl9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZERlZmF1bHRgXG5cdFx0XHQ6IG9EYXRhRmllbGRDb250ZXh0LmdldFBhdGgoKTtcblx0fSxcblx0Lypcblx0ICogTWV0aG9kIHRvIGdldCB2aXNpYmxlIGV4cHJlc3Npb24gZm9yIERhdGFGaWVsZEFjdGlvbkJ1dHRvblxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgaXNEYXRhRmllbGRBY3Rpb25CdXR0b25WaXNpYmxlXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBvVGhpcyAtIEN1cnJlbnQgT2JqZWN0XG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBvRGF0YUZpZWxkIC0gRGF0YVBvaW50J3MgVmFsdWVcblx0ICogQHBhcmFtIHtib29sZWFufSBiSXNCb3VuZCAtIERhdGFQb2ludCBhY3Rpb24gYm91bmRcblx0ICogQHBhcmFtIHtvYmplY3R9IG9BY3Rpb25Db250ZXh0IC0gQWN0aW9uQ29udGV4dCBWYWx1ZVxuXHQgKiBAcmV0dXJuIHtib29sZWFufSAtIHJldHVybnMgYm9vbGVhblxuXHQgKi9cblx0aXNEYXRhRmllbGRBY3Rpb25CdXR0b25WaXNpYmxlOiBmdW5jdGlvbiAob1RoaXM6IGFueSwgb0RhdGFGaWVsZDogYW55LCBiSXNCb3VuZDogYW55LCBvQWN0aW9uQ29udGV4dDogYW55KSB7XG5cdFx0cmV0dXJuIG9EYXRhRmllbGRbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuSGlkZGVuXCJdICE9PSB0cnVlICYmIChiSXNCb3VuZCAhPT0gdHJ1ZSB8fCBvQWN0aW9uQ29udGV4dCAhPT0gZmFsc2UpO1xuXHR9LFxuXHQvKipcblx0ICogTWV0aG9kIHRvIGdldCBwcmVzcyBldmVudCBmb3IgRGF0YUZpZWxkQWN0aW9uQnV0dG9uLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgZ2V0UHJlc3NFdmVudEZvckRhdGFGaWVsZEFjdGlvbkJ1dHRvblxuXHQgKiBAcGFyYW0gb1RoaXMgQ3VycmVudCBPYmplY3Rcblx0ICogQHBhcmFtIG9EYXRhRmllbGQgRGF0YVBvaW50J3MgVmFsdWVcblx0ICogQHJldHVybnMgVGhlIGJpbmRpbmcgZXhwcmVzc2lvbiBmb3IgdGhlIERhdGFGaWVsZEFjdGlvbkJ1dHRvbiBwcmVzcyBldmVudFxuXHQgKi9cblx0Z2V0UHJlc3NFdmVudEZvckRhdGFGaWVsZEFjdGlvbkJ1dHRvbjogZnVuY3Rpb24gKG9UaGlzOiBhbnksIG9EYXRhRmllbGQ6IGFueSkge1xuXHRcdGxldCBzSW52b2NhdGlvbkdyb3VwaW5nID0gXCJJc29sYXRlZFwiO1xuXHRcdGlmIChcblx0XHRcdG9EYXRhRmllbGQuSW52b2NhdGlvbkdyb3VwaW5nICYmXG5cdFx0XHRvRGF0YUZpZWxkLkludm9jYXRpb25Hcm91cGluZy4kRW51bU1lbWJlciA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5PcGVyYXRpb25Hcm91cGluZ1R5cGUvQ2hhbmdlU2V0XCJcblx0XHQpIHtcblx0XHRcdHNJbnZvY2F0aW9uR3JvdXBpbmcgPSBcIkNoYW5nZVNldFwiO1xuXHRcdH1cblx0XHRsZXQgYklzTmF2aWdhYmxlID0gb1RoaXMubmF2aWdhdGVBZnRlckFjdGlvbjtcblx0XHRiSXNOYXZpZ2FibGUgPSBiSXNOYXZpZ2FibGUgPT09IFwiZmFsc2VcIiA/IGZhbHNlIDogdHJ1ZTtcblxuXHRcdGNvbnN0IGVudGl0aWVzOiBBcnJheTxzdHJpbmc+ID0gb1RoaXM/LmVudGl0eVNldD8uZ2V0UGF0aCgpLnNwbGl0KFwiL1wiKTtcblx0XHRjb25zdCBlbnRpdHlTZXROYW1lOiBzdHJpbmcgPSBlbnRpdGllc1tlbnRpdGllcy5sZW5ndGggLSAxXTtcblxuXHRcdGNvbnN0IG9QYXJhbXMgPSB7XG5cdFx0XHRjb250ZXh0czogXCIkeyRzb3VyY2U+L30uZ2V0QmluZGluZ0NvbnRleHQoKVwiLFxuXHRcdFx0aW52b2NhdGlvbkdyb3VwaW5nOiBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKHNJbnZvY2F0aW9uR3JvdXBpbmcpLFxuXHRcdFx0bW9kZWw6IFwiJHskc291cmNlPi99LmdldE1vZGVsKClcIixcblx0XHRcdGxhYmVsOiBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKG9EYXRhRmllbGQuTGFiZWwsIHRydWUpLFxuXHRcdFx0aXNOYXZpZ2FibGU6IGJJc05hdmlnYWJsZSxcblx0XHRcdGVudGl0eVNldE5hbWU6IENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMoZW50aXR5U2V0TmFtZSlcblx0XHR9O1xuXG5cdFx0cmV0dXJuIENvbW1vbkhlbHBlci5nZW5lcmF0ZUZ1bmN0aW9uKFxuXHRcdFx0XCIuZWRpdEZsb3cuaW52b2tlQWN0aW9uXCIsXG5cdFx0XHRDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKG9EYXRhRmllbGQuQWN0aW9uKSxcblx0XHRcdENvbW1vbkhlbHBlci5vYmplY3RUb1N0cmluZyhvUGFyYW1zKVxuXHRcdCk7XG5cdH0sXG5cblx0aXNOdW1lcmljRGF0YVR5cGU6IGZ1bmN0aW9uIChzRGF0YUZpZWxkVHlwZTogYW55KSB7XG5cdFx0Y29uc3QgX3NEYXRhRmllbGRUeXBlID0gc0RhdGFGaWVsZFR5cGU7XG5cdFx0aWYgKF9zRGF0YUZpZWxkVHlwZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRjb25zdCBhTnVtZXJpY0RhdGFUeXBlcyA9IFtcblx0XHRcdFx0XCJFZG0uSW50MTZcIixcblx0XHRcdFx0XCJFZG0uSW50MzJcIixcblx0XHRcdFx0XCJFZG0uSW50NjRcIixcblx0XHRcdFx0XCJFZG0uQnl0ZVwiLFxuXHRcdFx0XHRcIkVkbS5TQnl0ZVwiLFxuXHRcdFx0XHRcIkVkbS5TaW5nbGVcIixcblx0XHRcdFx0XCJFZG0uRGVjaW1hbFwiLFxuXHRcdFx0XHRcIkVkbS5Eb3VibGVcIlxuXHRcdFx0XTtcblx0XHRcdHJldHVybiBhTnVtZXJpY0RhdGFUeXBlcy5pbmRleE9mKF9zRGF0YUZpZWxkVHlwZSkgPT09IC0xID8gZmFsc2UgOiB0cnVlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHR9LFxuXG5cdGlzRGF0ZU9yVGltZURhdGFUeXBlOiBmdW5jdGlvbiAoc1Byb3BlcnR5VHlwZTogYW55KSB7XG5cdFx0aWYgKHNQcm9wZXJ0eVR5cGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Y29uc3QgYURhdGVUaW1lRGF0YVR5cGVzID0gW1wiRWRtLkRhdGVUaW1lT2Zmc2V0XCIsIFwiRWRtLkRhdGVUaW1lXCIsIFwiRWRtLkRhdGVcIiwgXCJFZG0uVGltZU9mRGF5XCIsIFwiRWRtLlRpbWVcIl07XG5cdFx0XHRyZXR1cm4gYURhdGVUaW1lRGF0YVR5cGVzLmluZGV4T2Yoc1Byb3BlcnR5VHlwZSkgPiAtMTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0fSxcblx0aXNEYXRlVGltZURhdGFUeXBlOiBmdW5jdGlvbiAoc1Byb3BlcnR5VHlwZTogYW55KSB7XG5cdFx0aWYgKHNQcm9wZXJ0eVR5cGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Y29uc3QgYURhdGVEYXRhVHlwZXMgPSBbXCJFZG0uRGF0ZVRpbWVPZmZzZXRcIiwgXCJFZG0uRGF0ZVRpbWVcIl07XG5cdFx0XHRyZXR1cm4gYURhdGVEYXRhVHlwZXMuaW5kZXhPZihzUHJvcGVydHlUeXBlKSA+IC0xO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHR9LFxuXHRpc0RhdGVEYXRhVHlwZTogZnVuY3Rpb24gKHNQcm9wZXJ0eVR5cGU6IGFueSkge1xuXHRcdHJldHVybiBzUHJvcGVydHlUeXBlID09PSBcIkVkbS5EYXRlXCI7XG5cdH0sXG5cdGlzVGltZURhdGFUeXBlOiBmdW5jdGlvbiAoc1Byb3BlcnR5VHlwZTogYW55KSB7XG5cdFx0aWYgKHNQcm9wZXJ0eVR5cGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Y29uc3QgYURhdGVEYXRhVHlwZXMgPSBbXCJFZG0uVGltZU9mRGF5XCIsIFwiRWRtLlRpbWVcIl07XG5cdFx0XHRyZXR1cm4gYURhdGVEYXRhVHlwZXMuaW5kZXhPZihzUHJvcGVydHlUeXBlKSA+IC0xO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gcmV0dXJuIHRoZSB1bmRlcmx5aW5nIHByb3BlcnR5IGRhdGEgdHlwZSBpbiBjYXNlIFRleHRBcnJhbmdlbWVudCBhbm5vdGF0aW9uIG9mIFRleHQgYW5ub3RhdGlvbiAnVGV4dE9ubHknIGV4aXN0cy5cblx0ICpcblx0ICogQHBhcmFtIG9Bbm5vdGF0aW9ucyBBbGwgdGhlIGFubm90YXRpb25zIG9mIGEgcHJvcGVydHlcblx0ICogQHBhcmFtIG9Nb2RlbCBBbiBpbnN0YW5jZSBvZiBPRGF0YSB2NCBtb2RlbFxuXHQgKiBAcGFyYW0gc0VudGl0eVBhdGggVGhlIHBhdGggdG8gcm9vdCBFbnRpdHlcblx0ICogQHBhcmFtIHNUeXBlIFRoZSBwcm9wZXJ0eSBkYXRhIHR5cGVcblx0ICogQHJldHVybnMgVGhlIHVuZGVybHlpbmcgcHJvcGVydHkgZGF0YSB0eXBlIGZvciBUZXh0T25seSBhbm5vdGF0ZWQgcHJvcGVydHksIG90aGVyd2lzZSB0aGUgb3JpZ2luYWwgZGF0YSB0eXBlLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0Z2V0VW5kZXJseWluZ1Byb3BlcnR5RGF0YVR5cGU6IGZ1bmN0aW9uIChvQW5ub3RhdGlvbnM6IGFueSwgb01vZGVsOiBPRGF0YU1ldGFNb2RlbCwgc0VudGl0eVBhdGg6IHN0cmluZywgc1R5cGU6IHN0cmluZykge1xuXHRcdGNvbnN0IHNUZXh0QW5ub3RhdGlvbiA9IFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5UZXh0XCIsXG5cdFx0XHRzVGV4dEFycmFuZ2VtZW50QW5ub3RhdGlvbiA9IFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5UZXh0QGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlRleHRBcnJhbmdlbWVudFwiO1xuXHRcdGlmIChcblx0XHRcdCEhb0Fubm90YXRpb25zICYmXG5cdFx0XHQhIW9Bbm5vdGF0aW9uc1tzVGV4dEFycmFuZ2VtZW50QW5ub3RhdGlvbl0gJiZcblx0XHRcdG9Bbm5vdGF0aW9uc1tzVGV4dEFycmFuZ2VtZW50QW5ub3RhdGlvbl0uJEVudW1NZW1iZXIgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuVGV4dEFycmFuZ2VtZW50VHlwZS9UZXh0T25seVwiICYmXG5cdFx0XHQhIW9Bbm5vdGF0aW9uc1tzVGV4dEFubm90YXRpb25dICYmXG5cdFx0XHQhIW9Bbm5vdGF0aW9uc1tzVGV4dEFubm90YXRpb25dLiRQYXRoXG5cdFx0KSB7XG5cdFx0XHRyZXR1cm4gb01vZGVsLmdldE9iamVjdChgJHtzRW50aXR5UGF0aH0vJHtvQW5ub3RhdGlvbnNbc1RleHRBbm5vdGF0aW9uXS4kUGF0aH0vJFR5cGVgKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gc1R5cGU7XG5cdH0sXG5cblx0Z2V0Q29sdW1uQWxpZ25tZW50OiBmdW5jdGlvbiAob0RhdGFGaWVsZDogYW55LCBvVGFibGU6IGFueSkge1xuXHRcdGNvbnN0IHNFbnRpdHlQYXRoID0gb1RhYmxlLmNvbGxlY3Rpb24uc1BhdGgsXG5cdFx0XHRvTW9kZWwgPSBvVGFibGUuY29sbGVjdGlvbi5vTW9kZWw7XG5cdFx0aWYgKFxuXHRcdFx0KG9EYXRhRmllbGRbXCIkVHlwZVwiXSA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRGb3JBY3Rpb25cIiB8fFxuXHRcdFx0XHRvRGF0YUZpZWxkW1wiJFR5cGVcIl0gPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uXCIpICYmXG5cdFx0XHRvRGF0YUZpZWxkLklubGluZSAmJlxuXHRcdFx0b0RhdGFGaWVsZC5JY29uVXJsXG5cdFx0KSB7XG5cdFx0XHRyZXR1cm4gXCJDZW50ZXJcIjtcblx0XHR9XG5cdFx0Ly8gQ29sdW1ucyBjb250YWluaW5nIGEgU2VtYW50aWMgS2V5IG11c3QgYmUgQmVnaW4gYWxpZ25lZFxuXHRcdGNvbnN0IGFTZW1hbnRpY0tleXMgPSBvTW9kZWwuZ2V0T2JqZWN0KGAke3NFbnRpdHlQYXRofS9AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlNlbWFudGljS2V5YCk7XG5cdFx0aWYgKG9EYXRhRmllbGRbXCIkVHlwZVwiXSA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRcIikge1xuXHRcdFx0Y29uc3Qgc1Byb3BlcnR5UGF0aCA9IG9EYXRhRmllbGQuVmFsdWUuJFBhdGg7XG5cdFx0XHRjb25zdCBiSXNTZW1hbnRpY0tleSA9XG5cdFx0XHRcdGFTZW1hbnRpY0tleXMgJiZcblx0XHRcdFx0IWFTZW1hbnRpY0tleXMuZXZlcnkoZnVuY3Rpb24gKG9LZXk6IGFueSkge1xuXHRcdFx0XHRcdHJldHVybiBvS2V5LiRQcm9wZXJ0eVBhdGggIT09IHNQcm9wZXJ0eVBhdGg7XG5cdFx0XHRcdH0pO1xuXHRcdFx0aWYgKGJJc1NlbWFudGljS2V5KSB7XG5cdFx0XHRcdHJldHVybiBcIkJlZ2luXCI7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBGaWVsZEhlbHBlci5nZXREYXRhRmllbGRBbGlnbm1lbnQob0RhdGFGaWVsZCwgb01vZGVsLCBzRW50aXR5UGF0aCk7XG5cdH0sXG5cdC8qKlxuXHQgKiBHZXQgYWxpZ25tZW50IGJhc2VkIG9ubHkgb24gdGhlIHByb3BlcnR5LlxuXHQgKlxuXHQgKiBAcGFyYW0gc1R5cGUgVGhlIHByb3BlcnR5J3MgdHlwZVxuXHQgKiBAcGFyYW0gb0Zvcm1hdE9wdGlvbnMgVGhlIGZpZWxkIGZvcm1hdCBvcHRpb25zXG5cdCAqIEBwYXJhbSBbb0NvbXB1dGVkRWRpdE1vZGVdIFRoZSBjb21wdXRlZCBFZGl0IG1vZGUgb2YgdGhlIHByb3BlcnR5IGlzIGVtcHR5IHdoZW4gZGlyZWN0bHkgY2FsbGVkIGZyb20gdGhlIENvbHVtblByb3BlcnR5IGZyYWdtZW50XG5cdCAqIEByZXR1cm5zIFRoZSBwcm9wZXJ0eSBhbGlnbm1lbnRcblx0ICovXG5cdGdldFByb3BlcnR5QWxpZ25tZW50OiBmdW5jdGlvbiAoc1R5cGU6IHN0cmluZywgb0Zvcm1hdE9wdGlvbnM6IGFueSwgb0NvbXB1dGVkRWRpdE1vZGU/OiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248c3RyaW5nPikge1xuXHRcdGxldCBzRGVmYXVsdEFsaWdubWVudCA9IFwiQmVnaW5cIiBhcyBhbnk7XG5cdFx0Y29uc3Qgc1RleHRBbGlnbm1lbnQgPSBvRm9ybWF0T3B0aW9ucyA/IG9Gb3JtYXRPcHRpb25zLnRleHRBbGlnbk1vZGUgOiBcIlwiO1xuXHRcdHN3aXRjaCAoc1RleHRBbGlnbm1lbnQpIHtcblx0XHRcdGNhc2UgXCJGb3JtXCI6XG5cdFx0XHRcdGlmICh0aGlzLmlzTnVtZXJpY0RhdGFUeXBlKHNUeXBlKSkge1xuXHRcdFx0XHRcdHNEZWZhdWx0QWxpZ25tZW50ID0gXCJCZWdpblwiO1xuXHRcdFx0XHRcdGlmIChvQ29tcHV0ZWRFZGl0TW9kZSkge1xuXHRcdFx0XHRcdFx0c0RlZmF1bHRBbGlnbm1lbnQgPSBnZXRBbGlnbm1lbnRFeHByZXNzaW9uKG9Db21wdXRlZEVkaXRNb2RlLCBcIkJlZ2luXCIsIFwiRW5kXCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdGlmICh0aGlzLmlzTnVtZXJpY0RhdGFUeXBlKHNUeXBlKSB8fCB0aGlzLmlzRGF0ZU9yVGltZURhdGFUeXBlKHNUeXBlKSkge1xuXHRcdFx0XHRcdHNEZWZhdWx0QWxpZ25tZW50ID0gXCJSaWdodFwiO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0XHRyZXR1cm4gc0RlZmF1bHRBbGlnbm1lbnQ7XG5cdH0sXG5cblx0Z2V0RGF0YUZpZWxkQWxpZ25tZW50OiBmdW5jdGlvbiAob0RhdGFGaWVsZDogYW55LCBvTW9kZWw6IGFueSwgc0VudGl0eVBhdGg6IGFueSwgb0Zvcm1hdE9wdGlvbnM/OiBhbnksIG9Db21wdXRlZEVkaXRNb2RlPzogYW55KSB7XG5cdFx0bGV0IHNEYXRhRmllbGRQYXRoLFxuXHRcdFx0c0RlZmF1bHRBbGlnbm1lbnQgPSBcIkJlZ2luXCIsXG5cdFx0XHRzVHlwZSxcblx0XHRcdG9Bbm5vdGF0aW9ucztcblxuXHRcdGlmIChvRGF0YUZpZWxkW1wiJFR5cGVcIl0gPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRm9yQW5ub3RhdGlvblwiKSB7XG5cdFx0XHRzRGF0YUZpZWxkUGF0aCA9IG9EYXRhRmllbGQuVGFyZ2V0LiRBbm5vdGF0aW9uUGF0aDtcblx0XHRcdGlmIChcblx0XHRcdFx0b0RhdGFGaWVsZC5UYXJnZXRbXCIkQW5ub3RhdGlvblBhdGhcIl0gJiZcblx0XHRcdFx0b0RhdGFGaWVsZC5UYXJnZXRbXCIkQW5ub3RhdGlvblBhdGhcIl0uaW5kZXhPZihcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkZpZWxkR3JvdXBcIikgPj0gMFxuXHRcdFx0KSB7XG5cdFx0XHRcdGNvbnN0IG9GaWVsZEdyb3VwID0gb01vZGVsLmdldE9iamVjdChgJHtzRW50aXR5UGF0aH0vJHtzRGF0YUZpZWxkUGF0aH1gKTtcblxuXHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IG9GaWVsZEdyb3VwLkRhdGEubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRzVHlwZSA9IG9Nb2RlbC5nZXRPYmplY3QoYCR7c0VudGl0eVBhdGh9LyR7c0RhdGFGaWVsZFBhdGh9L0RhdGEvJHtpLnRvU3RyaW5nKCl9L1ZhbHVlLyRQYXRoLyRUeXBlYCk7XG5cdFx0XHRcdFx0b0Fubm90YXRpb25zID0gb01vZGVsLmdldE9iamVjdChgJHtzRW50aXR5UGF0aH0vJHtzRGF0YUZpZWxkUGF0aH0vRGF0YS8ke2kudG9TdHJpbmcoKX0vVmFsdWUvJFBhdGhAYCk7XG5cdFx0XHRcdFx0c1R5cGUgPSB0aGlzLmdldFVuZGVybHlpbmdQcm9wZXJ0eURhdGFUeXBlKG9Bbm5vdGF0aW9ucywgb01vZGVsLCBzRW50aXR5UGF0aCwgc1R5cGUpO1xuXHRcdFx0XHRcdHNEZWZhdWx0QWxpZ25tZW50ID0gdGhpcy5nZXRQcm9wZXJ0eUFsaWdubWVudChzVHlwZSwgb0Zvcm1hdE9wdGlvbnMsIG9Db21wdXRlZEVkaXRNb2RlKTtcblxuXHRcdFx0XHRcdGlmIChzRGVmYXVsdEFsaWdubWVudCA9PT0gXCJCZWdpblwiKSB7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIHNEZWZhdWx0QWxpZ25tZW50O1xuXHRcdFx0fSBlbHNlIGlmIChcblx0XHRcdFx0b0RhdGFGaWVsZC5UYXJnZXRbXCIkQW5ub3RhdGlvblBhdGhcIl0gJiZcblx0XHRcdFx0b0RhdGFGaWVsZC5UYXJnZXRbXCIkQW5ub3RhdGlvblBhdGhcIl0uaW5kZXhPZihcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFQb2ludFwiKSA+PSAwICYmXG5cdFx0XHRcdG9Nb2RlbC5nZXRPYmplY3QoYCR7c0VudGl0eVBhdGh9LyR7c0RhdGFGaWVsZFBhdGh9L1Zpc3VhbGl6YXRpb24vJEVudW1NZW1iZXJgKSA9PT1cblx0XHRcdFx0XHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlZpc3VhbGl6YXRpb25UeXBlL1JhdGluZ1wiXG5cdFx0XHQpIHtcblx0XHRcdFx0cmV0dXJuIHNEZWZhdWx0QWxpZ25tZW50O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c1R5cGUgPSBvTW9kZWwuZ2V0T2JqZWN0KGAke3NFbnRpdHlQYXRofS8ke3NEYXRhRmllbGRQYXRofS8kVHlwZWApO1xuXHRcdFx0XHRpZiAoc1R5cGUgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YVBvaW50VHlwZVwiKSB7XG5cdFx0XHRcdFx0c1R5cGUgPSBvTW9kZWwuZ2V0T2JqZWN0KGAke3NFbnRpdHlQYXRofS8ke3NEYXRhRmllbGRQYXRofS9WYWx1ZS8kUGF0aC8kVHlwZWApO1xuXHRcdFx0XHRcdG9Bbm5vdGF0aW9ucyA9IG9Nb2RlbC5nZXRPYmplY3QoYCR7c0VudGl0eVBhdGh9LyR7c0RhdGFGaWVsZFBhdGh9L1ZhbHVlLyRQYXRoQGApO1xuXHRcdFx0XHRcdHNUeXBlID0gdGhpcy5nZXRVbmRlcmx5aW5nUHJvcGVydHlEYXRhVHlwZShvQW5ub3RhdGlvbnMsIG9Nb2RlbCwgc0VudGl0eVBhdGgsIHNUeXBlKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRzRGVmYXVsdEFsaWdubWVudCA9IHRoaXMuZ2V0UHJvcGVydHlBbGlnbm1lbnQoc1R5cGUsIG9Gb3JtYXRPcHRpb25zLCBvQ29tcHV0ZWRFZGl0TW9kZSk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNEYXRhRmllbGRQYXRoID0gb0RhdGFGaWVsZC5WYWx1ZS4kUGF0aDtcblx0XHRcdHNUeXBlID0gb01vZGVsLmdldE9iamVjdChgJHtzRW50aXR5UGF0aH0vJHtzRGF0YUZpZWxkUGF0aH0vJFR5cGVgKTtcblx0XHRcdG9Bbm5vdGF0aW9ucyA9IG9Nb2RlbC5nZXRPYmplY3QoYCR7c0VudGl0eVBhdGh9LyR7c0RhdGFGaWVsZFBhdGh9QGApO1xuXHRcdFx0c1R5cGUgPSB0aGlzLmdldFVuZGVybHlpbmdQcm9wZXJ0eURhdGFUeXBlKG9Bbm5vdGF0aW9ucywgb01vZGVsLCBzRW50aXR5UGF0aCwgc1R5cGUpO1xuXHRcdFx0aWYgKCEob01vZGVsLmdldE9iamVjdChgJHtzRW50aXR5UGF0aH0vYClbXCIkS2V5XCJdLmluZGV4T2Yoc0RhdGFGaWVsZFBhdGgpID09PSAwKSkge1xuXHRcdFx0XHRzRGVmYXVsdEFsaWdubWVudCA9IHRoaXMuZ2V0UHJvcGVydHlBbGlnbm1lbnQoc1R5cGUsIG9Gb3JtYXRPcHRpb25zLCBvQ29tcHV0ZWRFZGl0TW9kZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBzRGVmYXVsdEFsaWdubWVudDtcblx0fSxcblx0Z2V0VHlwZUFsaWdubWVudDogZnVuY3Rpb24gKFxuXHRcdG9Db250ZXh0OiBhbnksXG5cdFx0b0RhdGFGaWVsZDogYW55LFxuXHRcdG9Gb3JtYXRPcHRpb25zOiBhbnksXG5cdFx0c0VudGl0eVBhdGg6IHN0cmluZyxcblx0XHRvQ29tcHV0ZWRFZGl0TW9kZTogYW55LFxuXHRcdG9Qcm9wZXJ0eTogYW55XG5cdCkge1xuXHRcdGNvbnN0IG9JbnRlcmZhY2UgPSBvQ29udGV4dC5nZXRJbnRlcmZhY2UoMCk7XG5cdFx0Y29uc3Qgb01vZGVsID0gb0ludGVyZmFjZS5nZXRNb2RlbCgpO1xuXG5cdFx0aWYgKHNFbnRpdHlQYXRoID09PSBcIi91bmRlZmluZWRcIiAmJiBvUHJvcGVydHkgJiYgb1Byb3BlcnR5LiR0YXJnZXQpIHtcblx0XHRcdHNFbnRpdHlQYXRoID0gYC8ke29Qcm9wZXJ0eS4kdGFyZ2V0LmZ1bGx5UXVhbGlmaWVkTmFtZS5zcGxpdChcIi9cIilbMF19YDtcblx0XHR9XG5cdFx0cmV0dXJuIEZpZWxkSGVscGVyLmdldERhdGFGaWVsZEFsaWdubWVudChvRGF0YUZpZWxkLCBvTW9kZWwsIHNFbnRpdHlQYXRoLCBvRm9ybWF0T3B0aW9ucywgb0NvbXB1dGVkRWRpdE1vZGUpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gZ2V0IGVuYWJsZWQgZXhwcmVzc2lvbiBmb3IgRGF0YUZpZWxkQWN0aW9uQnV0dG9uLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgaXNEYXRhRmllbGRBY3Rpb25CdXR0b25FbmFibGVkXG5cdCAqIEBwYXJhbSBvRGF0YUZpZWxkIERhdGFQb2ludCdzIFZhbHVlXG5cdCAqIEBwYXJhbSBiSXNCb3VuZCBEYXRhUG9pbnQgYWN0aW9uIGJvdW5kXG5cdCAqIEBwYXJhbSBvQWN0aW9uQ29udGV4dCBBY3Rpb25Db250ZXh0IFZhbHVlXG5cdCAqIEBwYXJhbSBzQWN0aW9uQ29udGV4dEZvcm1hdCBGb3JtYXR0ZWQgdmFsdWUgb2YgQWN0aW9uQ29udGV4dFxuXHQgKiBAcmV0dXJucyBBIGJvb2xlYW4gb3Igc3RyaW5nIGV4cHJlc3Npb24gZm9yIGVuYWJsZWQgcHJvcGVydHlcblx0ICovXG5cdGlzRGF0YUZpZWxkQWN0aW9uQnV0dG9uRW5hYmxlZDogZnVuY3Rpb24gKG9EYXRhRmllbGQ6IGFueSwgYklzQm91bmQ6IGJvb2xlYW4sIG9BY3Rpb25Db250ZXh0OiBhbnksIHNBY3Rpb25Db250ZXh0Rm9ybWF0OiBzdHJpbmcpIHtcblx0XHRpZiAoYklzQm91bmQgIT09IHRydWUpIHtcblx0XHRcdHJldHVybiBcInRydWVcIjtcblx0XHR9XG5cdFx0cmV0dXJuIChvQWN0aW9uQ29udGV4dCA9PT0gbnVsbCA/IFwiez0gISR7I1wiICsgb0RhdGFGaWVsZC5BY3Rpb24gKyBcIn0gPyBmYWxzZSA6IHRydWUgfVwiIDogb0FjdGlvbkNvbnRleHQpXG5cdFx0XHQ/IHNBY3Rpb25Db250ZXh0Rm9ybWF0XG5cdFx0XHQ6IFwidHJ1ZVwiO1xuXHR9LFxuXHQvKipcblx0ICogTWV0aG9kIHRvIGdldCBsYWJlbFRleHQgZm9yIERhdGFGaWVsZC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGdldExhYmVsVGV4dEZvckRhdGFGaWVsZFxuXHQgKiBAcGFyYW0gb0VudGl0eVNldE1vZGVsIFRoZSBFbnRpdHlTZXQgbW9kZWwgT2JqZWN0XG5cdCAqIEBwYXJhbSBvUHJvcGVydHlQYXRoIFRoZSBQcm9wZXJ0eSBwYXRoJ3Mgb2JqZWN0XG5cdCAqIEBwYXJhbSBzUHJvcGVydHlQYXRoQnVpbGRFeHByZXNzaW9uIFRoZSBldmFsdWF0ZWQgdmFsdWUgb2YgZXhwcmVzc2lvbiBAQEZJRUxELmJ1aWxkRXhwcmVzc2lvbkZvclRleHRWYWx1ZVxuXHQgKiBAcGFyYW0gc1Byb3BlcnR5VmFsdWUgUHJvcGVydHkgdmFsdWUgZnJvbSBtb2RlbFxuXHQgKiBAcGFyYW0gc1VpTmFtZSBUaGUgc2FwdWkubmFtZSBhbm5vdGF0aW9uIHZhbHVlXG5cdCAqIEBwYXJhbSBzU2VtYW50aWNLZXlTdHlsZVxuXHQgKiBAcmV0dXJucyBUaGUgYmluZGluZyBleHByZXNzaW9uIGZvciBkYXRhZmllbGQgbGFiZWwuXG5cdCAqL1xuXHRnZXRMYWJlbFRleHRGb3JEYXRhRmllbGQ6IGZ1bmN0aW9uIChcblx0XHRvRW50aXR5U2V0TW9kZWw6IGFueSxcblx0XHRvUHJvcGVydHlQYXRoOiBhbnksXG5cdFx0c1Byb3BlcnR5UGF0aEJ1aWxkRXhwcmVzc2lvbjogc3RyaW5nLFxuXHRcdHNQcm9wZXJ0eVZhbHVlOiBzdHJpbmcsXG5cdFx0c1VpTmFtZTogc3RyaW5nLFxuXHRcdHNTZW1hbnRpY0tleVN0eWxlOiBzdHJpbmdcblx0KSB7XG5cdFx0Y29uc3Qgb0RyYWZ0Um9vdCA9IG9FbnRpdHlTZXRNb2RlbFtcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRHJhZnRSb290XCJdO1xuXHRcdHJldHVybiBGaWVsZEhlbHBlci5nZXRTZW1hbnRpY0tleVRpdGxlKFxuXHRcdFx0b1Byb3BlcnR5UGF0aFtcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGV4dFwiXSAmJiBzUHJvcGVydHlQYXRoQnVpbGRFeHByZXNzaW9uLFxuXHRcdFx0c1Byb3BlcnR5VmFsdWUsXG5cdFx0XHRzVWlOYW1lLFxuXHRcdFx0b1Byb3BlcnR5UGF0aFtcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGV4dEBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5UZXh0QXJyYW5nZW1lbnRcIl0sXG5cdFx0XHRzU2VtYW50aWNLZXlTdHlsZSxcblx0XHRcdG9EcmFmdFJvb3Rcblx0XHQpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gcmV0cmlldmUgdGV4dCBmcm9tIHZhbHVlIGxpc3QgZm9yIERhdGFGaWVsZC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIHJldHJpZXZlVGV4dEZyb21WYWx1ZUxpc3Rcblx0ICogQHBhcmFtIG9FbnRpdHlTZXRNb2RlbCBUaGUgRW50aXR5U2V0IG1vZGVsIE9iamVjdFxuXHQgKiBAcGFyYW0gc1Byb3BlcnR5UGF0aCBUaGUgcHJvcGVydHkgcGF0aCdzIG5hbWVcblx0ICogQHBhcmFtIG9Gb3JtYXRPcHRpb25zIFRoZSBldmFsdWF0ZWQgaW5mb3JtYXRpb25zIGZvciB0aGUgZm9ybWF0IG9wdGlvblxuXHQgKiBAcmV0dXJucyBUaGUgYmluZGluZyBleHByZXNzaW9uIGZvciBkYXRhZmllbGQgdGV4dC5cblx0ICovXG5cdHJldHJpZXZlVGV4dEZyb21WYWx1ZUxpc3Q6IGZ1bmN0aW9uIChvRW50aXR5U2V0TW9kZWw6IGFueSwgc1Byb3BlcnR5UGF0aDogc3RyaW5nLCBvRm9ybWF0T3B0aW9uczogYW55KSB7XG5cdFx0Y29uc3Qgc1Byb3BlcnR5RnVsbFBhdGggPSBgJHtvRW50aXR5U2V0TW9kZWwuc1BhdGh9LyR7c1Byb3BlcnR5UGF0aH1gO1xuXHRcdGNvbnN0IHNEaXNwbGF5Rm9ybWF0ID0gb0Zvcm1hdE9wdGlvbnMuZGlzcGxheU1vZGU7XG5cdFx0Q29tbW9uSGVscGVyLnNldE1ldGFNb2RlbChvRW50aXR5U2V0TW9kZWwuZ2V0TW9kZWwoKSk7XG5cdFx0cmV0dXJuIFwiez0gRmllbGRSdW50aW1lLnJldHJpZXZlVGV4dEZyb21WYWx1ZUxpc3QoJXtcIiArIHNQcm9wZXJ0eVBhdGggKyBcIn0sJ1wiICsgc1Byb3BlcnR5RnVsbFBhdGggKyBcIicsJ1wiICsgc0Rpc3BsYXlGb3JtYXQgKyBcIicpfVwiO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gY29tcHV0ZSB0aGUgbGFiZWwgZm9yIGEgRGF0YUZpZWxkLlxuXHQgKiBJZiB0aGUgRGF0YUZpZWxkJ3MgbGFiZWwgaXMgYW4gZW1wdHkgc3RyaW5nLCBpdCdzIG5vdCByZW5kZXJlZCBldmVuIGlmIGEgZmFsbGJhY2sgZXhpc3RzLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgY29tcHV0ZUxhYmVsVGV4dFxuXHQgKiBAcGFyYW0ge29iamVjdH0gb0RhdGFGaWVsZCBUaGUgRGF0YUZpZWxkIGJlaW5nIHByb2Nlc3NlZFxuXHQgKiBAcGFyYW0ge29iamVjdH0gb0ludGVyZmFjZSBUaGUgaW50ZXJmYWNlIGZvciBjb250ZXh0IGluc3RhbmNlXG5cdCAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBjb21wdXRlZCB0ZXh0IGZvciB0aGUgRGF0YUZpZWxkIGxhYmVsLlxuXHQgKi9cblxuXHRjb21wdXRlTGFiZWxUZXh0OiBmdW5jdGlvbiAob0RhdGFGaWVsZDogYW55LCBvSW50ZXJmYWNlOiBhbnkpIHtcblx0XHRjb25zdCBvTW9kZWwgPSBvSW50ZXJmYWNlLmNvbnRleHQuZ2V0TW9kZWwoKTtcblx0XHRsZXQgc0NvbnRleHRQYXRoID0gb0ludGVyZmFjZS5jb250ZXh0LmdldFBhdGgoKTtcblx0XHRpZiAoc0NvbnRleHRQYXRoLmVuZHNXaXRoKFwiL1wiKSkge1xuXHRcdFx0c0NvbnRleHRQYXRoID0gc0NvbnRleHRQYXRoLnNsaWNlKDAsIHNDb250ZXh0UGF0aC5sYXN0SW5kZXhPZihcIi9cIikpO1xuXHRcdH1cblx0XHRjb25zdCBzRGF0YUZpZWxkTGFiZWwgPSBvTW9kZWwuZ2V0T2JqZWN0KGAke3NDb250ZXh0UGF0aH0vTGFiZWxgKTtcblx0XHQvL1dlIGRvIG5vdCBzaG93IGFuIGFkZGl0aW9uYWwgbGFiZWwgdGV4dCBmb3IgYSBidXR0b246XG5cdFx0aWYgKFxuXHRcdFx0b0RhdGFGaWVsZC4kVHlwZSA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRGb3JBY3Rpb25cIiB8fFxuXHRcdFx0b0RhdGFGaWVsZC4kVHlwZSA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb25cIlxuXHRcdCkge1xuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cdFx0aWYgKHNEYXRhRmllbGRMYWJlbCkge1xuXHRcdFx0cmV0dXJuIHNEYXRhRmllbGRMYWJlbDtcblx0XHR9IGVsc2UgaWYgKHNEYXRhRmllbGRMYWJlbCA9PT0gXCJcIikge1xuXHRcdFx0cmV0dXJuIFwiXCI7XG5cdFx0fVxuXHRcdGxldCBzRGF0YUZpZWxkVGFyZ2V0VGl0bGU7XG5cdFx0aWYgKG9EYXRhRmllbGQuJFR5cGUgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRm9yQW5ub3RhdGlvblwiKSB7XG5cdFx0XHRpZiAoXG5cdFx0XHRcdG9EYXRhRmllbGQuVGFyZ2V0LiRBbm5vdGF0aW9uUGF0aC5pbmRleE9mKFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFQb2ludFwiKSA+IC0xIHx8XG5cdFx0XHRcdG9EYXRhRmllbGQuVGFyZ2V0LiRBbm5vdGF0aW9uUGF0aC5pbmRleE9mKFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0XCIpID4gLTFcblx0XHRcdCkge1xuXHRcdFx0XHRzRGF0YUZpZWxkVGFyZ2V0VGl0bGUgPSBvTW9kZWwuZ2V0T2JqZWN0KGAke3NDb250ZXh0UGF0aH0vVGFyZ2V0LyRBbm5vdGF0aW9uUGF0aEAvVGl0bGVgKTtcblx0XHRcdH1cblx0XHRcdGlmIChvRGF0YUZpZWxkLlRhcmdldC4kQW5ub3RhdGlvblBhdGguaW5kZXhPZihcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tdW5pY2F0aW9uLnYxLkNvbnRhY3RcIikgPiAtMSkge1xuXHRcdFx0XHRzRGF0YUZpZWxkVGFyZ2V0VGl0bGUgPSBvTW9kZWwuZ2V0T2JqZWN0KFxuXHRcdFx0XHRcdGAke3NDb250ZXh0UGF0aH0vVGFyZ2V0LyRBbm5vdGF0aW9uUGF0aEAvZm4vJFBhdGhAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkxhYmVsYFxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoc0RhdGFGaWVsZFRhcmdldFRpdGxlKSB7XG5cdFx0XHRyZXR1cm4gc0RhdGFGaWVsZFRhcmdldFRpdGxlO1xuXHRcdH1cblx0XHRsZXQgc0RhdGFGaWVsZFRhcmdldExhYmVsO1xuXHRcdGlmIChvRGF0YUZpZWxkLiRUeXBlID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZEZvckFubm90YXRpb25cIikge1xuXHRcdFx0c0RhdGFGaWVsZFRhcmdldExhYmVsID0gb01vZGVsLmdldE9iamVjdChgJHtzQ29udGV4dFBhdGh9L1RhcmdldC8kQW5ub3RhdGlvblBhdGhAL0xhYmVsYCk7XG5cdFx0fVxuXHRcdGlmIChzRGF0YUZpZWxkVGFyZ2V0TGFiZWwpIHtcblx0XHRcdHJldHVybiBzRGF0YUZpZWxkVGFyZ2V0TGFiZWw7XG5cdFx0fVxuXG5cdFx0Y29uc3Qgc0RhdGFGaWVsZFZhbHVlTGFiZWwgPSBvTW9kZWwuZ2V0T2JqZWN0KGAke3NDb250ZXh0UGF0aH0vVmFsdWUvJFBhdGhAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkxhYmVsYCk7XG5cdFx0aWYgKHNEYXRhRmllbGRWYWx1ZUxhYmVsKSB7XG5cdFx0XHRyZXR1cm4gc0RhdGFGaWVsZFZhbHVlTGFiZWw7XG5cdFx0fVxuXG5cdFx0bGV0IHNEYXRhRmllbGRUYXJnZXRWYWx1ZUxhYmVsO1xuXHRcdGlmIChvRGF0YUZpZWxkLiRUeXBlID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZEZvckFubm90YXRpb25cIikge1xuXHRcdFx0c0RhdGFGaWVsZFRhcmdldFZhbHVlTGFiZWwgPSBvTW9kZWwuZ2V0T2JqZWN0KFxuXHRcdFx0XHRgJHtzQ29udGV4dFBhdGh9L1RhcmdldC8kQW5ub3RhdGlvblBhdGgvVmFsdWUvJFBhdGhAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkxhYmVsYFxuXHRcdFx0KTtcblx0XHR9XG5cdFx0aWYgKHNEYXRhRmllbGRUYXJnZXRWYWx1ZUxhYmVsKSB7XG5cdFx0XHRyZXR1cm4gc0RhdGFGaWVsZFRhcmdldFZhbHVlTGFiZWw7XG5cdFx0fVxuXHRcdHJldHVybiBcIlwiO1xuXHR9LFxuXHQvKipcblx0ICogTWV0aG9kIHRvIGFsaWduIHRoZSBkYXRhIGZpZWxkcyB3aXRoIHRoZWlyIGxhYmVsLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgYnVpbGRFeHByZXNzaW9uRm9yQWxpZ25JdGVtc1xuXHQgKiBAcGFyYW0gc1Zpc3VhbGl6YXRpb25cblx0ICogQHJldHVybnMgRXhwcmVzc2lvbiBiaW5kaW5nIGZvciBhbGlnbkl0ZW1zIHByb3BlcnR5XG5cdCAqL1xuXHRidWlsZEV4cHJlc3Npb25Gb3JBbGlnbkl0ZW1zOiBmdW5jdGlvbiAoc1Zpc3VhbGl6YXRpb246IHN0cmluZykge1xuXHRcdGNvbnN0IGZpZWxkVmlzdWFsaXphdGlvbkJpbmRpbmdFeHByZXNzaW9uID0gY29uc3RhbnQoc1Zpc3VhbGl6YXRpb24pO1xuXHRcdGNvbnN0IHByb2dyZXNzVmlzdWFsaXphdGlvbkJpbmRpbmdFeHByZXNzaW9uID0gY29uc3RhbnQoXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5WaXN1YWxpemF0aW9uVHlwZS9Qcm9ncmVzc1wiKTtcblx0XHRjb25zdCByYXRpbmdWaXN1YWxpemF0aW9uQmluZGluZ0V4cHJlc3Npb24gPSBjb25zdGFudChcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlZpc3VhbGl6YXRpb25UeXBlL1JhdGluZ1wiKTtcblx0XHRyZXR1cm4gY29tcGlsZUV4cHJlc3Npb24oXG5cdFx0XHRpZkVsc2UoXG5cdFx0XHRcdG9yKFxuXHRcdFx0XHRcdGVxdWFsKGZpZWxkVmlzdWFsaXphdGlvbkJpbmRpbmdFeHByZXNzaW9uLCBwcm9ncmVzc1Zpc3VhbGl6YXRpb25CaW5kaW5nRXhwcmVzc2lvbiksXG5cdFx0XHRcdFx0ZXF1YWwoZmllbGRWaXN1YWxpemF0aW9uQmluZGluZ0V4cHJlc3Npb24sIHJhdGluZ1Zpc3VhbGl6YXRpb25CaW5kaW5nRXhwcmVzc2lvbilcblx0XHRcdFx0KSxcblx0XHRcdFx0Y29uc3RhbnQoXCJDZW50ZXJcIiksXG5cdFx0XHRcdGlmRWxzZShVSS5Jc0VkaXRhYmxlLCBjb25zdGFudChcIkNlbnRlclwiKSwgY29uc3RhbnQoXCJTdHJldGNoXCIpKVxuXHRcdFx0KVxuXHRcdCk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ldGhvZCB0byBjaGVjayBWYWx1ZUxpc3RSZWZlcmVuY2VzLCBWYWx1ZUxpc3RNYXBwaW5nIGFuZCBWYWx1ZUxpc3QgaW5zaWRlIEFjdGlvblBhcmFtZXRlcnMgZm9yIEZpZWxkSGVscC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGhhc1ZhbHVlSGVscFxuXHQgKiBAcGFyYW0gb1Byb3BlcnR5QW5ub3RhdGlvbnMgQWN0aW9uIHBhcmFtZXRlciBvYmplY3Rcblx0ICogQHJldHVybnMgYHRydWVgIGlmIHRoZXJlIGlzIGEgVmFsdWVMaXN0KiBhbm5vdGF0aW9uIGRlZmluZWRcblx0ICovXG5cdGhhc1ZhbHVlSGVscEFubm90YXRpb246IGZ1bmN0aW9uIChvUHJvcGVydHlBbm5vdGF0aW9uczogYW55KSB7XG5cdFx0aWYgKG9Qcm9wZXJ0eUFubm90YXRpb25zKSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHRvUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVmFsdWVMaXN0UmVmZXJlbmNlc1wiXSB8fFxuXHRcdFx0XHRvUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVmFsdWVMaXN0TWFwcGluZ1wiXSB8fFxuXHRcdFx0XHRvUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVmFsdWVMaXN0XCJdXG5cdFx0XHQpO1xuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0sXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gZ2V0IGRpc3BsYXkgcHJvcGVydHkgZm9yIEFjdGlvblBhcmFtZXRlciBkaWFsb2cuXG5cdCAqXG5cdCAqIFx0QGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGdldEFQRGlhbG9nRGlzcGxheUZvcm1hdFxuXHQgKiBAcGFyYW0gb1Byb3BlcnR5IFRoZSBhY3Rpb24gcGFyYW1ldGVyIGluc3RhbmNlXG5cdCAqIEBwYXJhbSBvSW50ZXJmYWNlIFRoZSBpbnRlcmZhY2UgZm9yIHRoZSBjb250ZXh0IGluc3RhbmNlXG5cdCAqIEByZXR1cm5zIFRoZSBkaXNwbGF5IGZvcm1hdCAgZm9yIGFuIGFjdGlvbiBwYXJhbWV0ZXIgRmllbGRcblx0ICovXG5cdGdldEFQRGlhbG9nRGlzcGxheUZvcm1hdDogZnVuY3Rpb24gKG9Qcm9wZXJ0eTogYW55LCBvSW50ZXJmYWNlOiBhbnkpIHtcblx0XHRsZXQgb0Fubm90YXRpb247XG5cdFx0Y29uc3Qgb01vZGVsID0gb0ludGVyZmFjZS5jb250ZXh0LmdldE1vZGVsKCk7XG5cdFx0Y29uc3Qgc0NvbnRleHRQYXRoID0gb0ludGVyZmFjZS5jb250ZXh0LmdldFBhdGgoKTtcblx0XHRjb25zdCBzUHJvcGVydHlOYW1lID0gb1Byb3BlcnR5LiROYW1lIHx8IG9JbnRlcmZhY2UuY29udGV4dC5nZXRQcm9wZXJ0eShgJHtzQ29udGV4dFBhdGh9QHNhcHVpLm5hbWVgKTtcblx0XHRjb25zdCBvQWN0aW9uUGFyYW1ldGVyQW5ub3RhdGlvbnMgPSBvTW9kZWwuZ2V0T2JqZWN0KGAke3NDb250ZXh0UGF0aH1AYCk7XG5cdFx0Y29uc3Qgb1ZhbHVlSGVscEFubm90YXRpb24gPVxuXHRcdFx0b0FjdGlvblBhcmFtZXRlckFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5WYWx1ZUxpc3RcIl0gfHxcblx0XHRcdG9BY3Rpb25QYXJhbWV0ZXJBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVmFsdWVMaXN0TWFwcGluZ1wiXSB8fFxuXHRcdFx0b0FjdGlvblBhcmFtZXRlckFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5WYWx1ZUxpc3RSZWZlcmVuY2VzXCJdO1xuXHRcdGNvbnN0IGdldFZhbHVlTGlzdFByb3BlcnR5TmFtZSA9IGZ1bmN0aW9uIChvVmFsdWVMaXN0OiBhbnkpIHtcblx0XHRcdGNvbnN0IG9WYWx1ZUxpc3RQYXJhbWV0ZXIgPSBvVmFsdWVMaXN0LlBhcmFtZXRlcnMuZmluZChmdW5jdGlvbiAob1BhcmFtZXRlcjogYW55KSB7XG5cdFx0XHRcdHJldHVybiBvUGFyYW1ldGVyLkxvY2FsRGF0YVByb3BlcnR5ICYmIG9QYXJhbWV0ZXIuTG9jYWxEYXRhUHJvcGVydHkuJFByb3BlcnR5UGF0aCA9PT0gc1Byb3BlcnR5TmFtZTtcblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIG9WYWx1ZUxpc3RQYXJhbWV0ZXIgJiYgb1ZhbHVlTGlzdFBhcmFtZXRlci5WYWx1ZUxpc3RQcm9wZXJ0eTtcblx0XHR9O1xuXHRcdGxldCBzVmFsdWVMaXN0UHJvcGVydHlOYW1lO1xuXHRcdGlmIChcblx0XHRcdG9BY3Rpb25QYXJhbWV0ZXJBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGV4dEFycmFuZ2VtZW50XCJdIHx8XG5cdFx0XHRvQWN0aW9uUGFyYW1ldGVyQW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHRAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuVGV4dEFycmFuZ2VtZW50XCJdXG5cdFx0KSB7XG5cdFx0XHRyZXR1cm4gQ29tbW9uVXRpbHMuY29tcHV0ZURpc3BsYXlNb2RlKG9BY3Rpb25QYXJhbWV0ZXJBbm5vdGF0aW9ucywgdW5kZWZpbmVkKTtcblx0XHR9IGVsc2UgaWYgKG9WYWx1ZUhlbHBBbm5vdGF0aW9uKSB7XG5cdFx0XHRpZiAob1ZhbHVlSGVscEFubm90YXRpb24uQ29sbGVjdGlvblBhdGgpIHtcblx0XHRcdFx0Ly8gZ2V0IHRoZSBuYW1lIG9mIHRoZSBjb3JyZXNwb25kaW5nIHByb3BlcnR5IGluIHZhbHVlIGxpc3QgY29sbGVjdGlvblxuXHRcdFx0XHRzVmFsdWVMaXN0UHJvcGVydHlOYW1lID0gZ2V0VmFsdWVMaXN0UHJvcGVydHlOYW1lKG9WYWx1ZUhlbHBBbm5vdGF0aW9uKTtcblx0XHRcdFx0aWYgKCFzVmFsdWVMaXN0UHJvcGVydHlOYW1lKSB7XG5cdFx0XHRcdFx0cmV0dXJuIFwiVmFsdWVcIjtcblx0XHRcdFx0fVxuXHRcdFx0XHQvLyBnZXQgdGV4dCBmb3IgdGhpcyBwcm9wZXJ0eVxuXHRcdFx0XHRvQW5ub3RhdGlvbiA9IG9Nb2RlbC5nZXRPYmplY3QoYC8ke29WYWx1ZUhlbHBBbm5vdGF0aW9uLkNvbGxlY3Rpb25QYXRofS8ke3NWYWx1ZUxpc3RQcm9wZXJ0eU5hbWV9QGApO1xuXHRcdFx0XHRyZXR1cm4gb0Fubm90YXRpb24gJiYgb0Fubm90YXRpb25bXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHRcIl1cblx0XHRcdFx0XHQ/IENvbW1vblV0aWxzLmNvbXB1dGVEaXNwbGF5TW9kZShvQW5ub3RhdGlvbiwgdW5kZWZpbmVkKVxuXHRcdFx0XHRcdDogXCJWYWx1ZVwiO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIG9Nb2RlbC5yZXF1ZXN0VmFsdWVMaXN0SW5mbyhzQ29udGV4dFBhdGgsIHRydWUpLnRoZW4oZnVuY3Rpb24gKG9WYWx1ZUxpc3RJbmZvOiBhbnkpIHtcblx0XHRcdFx0XHQvLyBnZXQgdGhlIG5hbWUgb2YgdGhlIGNvcnJlc3BvbmRpbmcgcHJvcGVydHkgaW4gdmFsdWUgbGlzdCBjb2xsZWN0aW9uXG5cdFx0XHRcdFx0c1ZhbHVlTGlzdFByb3BlcnR5TmFtZSA9IGdldFZhbHVlTGlzdFByb3BlcnR5TmFtZShvVmFsdWVMaXN0SW5mb1tcIlwiXSk7XG5cdFx0XHRcdFx0aWYgKCFzVmFsdWVMaXN0UHJvcGVydHlOYW1lKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gXCJWYWx1ZVwiO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvLyBnZXQgdGV4dCBmb3IgdGhpcyBwcm9wZXJ0eVxuXHRcdFx0XHRcdG9Bbm5vdGF0aW9uID0gb1ZhbHVlTGlzdEluZm9bXCJcIl0uJG1vZGVsXG5cdFx0XHRcdFx0XHQuZ2V0TWV0YU1vZGVsKClcblx0XHRcdFx0XHRcdC5nZXRPYmplY3QoYC8ke29WYWx1ZUxpc3RJbmZvW1wiXCJdW1wiQ29sbGVjdGlvblBhdGhcIl19LyR7c1ZhbHVlTGlzdFByb3BlcnR5TmFtZX1AYCk7XG5cdFx0XHRcdFx0cmV0dXJuIG9Bbm5vdGF0aW9uICYmIG9Bbm5vdGF0aW9uW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5UZXh0XCJdXG5cdFx0XHRcdFx0XHQ/IENvbW1vblV0aWxzLmNvbXB1dGVEaXNwbGF5TW9kZShvQW5ub3RhdGlvbiwgdW5kZWZpbmVkKVxuXHRcdFx0XHRcdFx0OiBcIlZhbHVlXCI7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gXCJWYWx1ZVwiO1xuXHRcdH1cblx0fSxcblx0LyoqXG5cdCAqIE1ldGhvZCB0byBnZXQgZGlzcGxheSBwcm9wZXJ0eSBmb3IgQWN0aW9uUGFyYW1ldGVyIGRpYWxvZyBGaWVsZEhlbHAuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBnZXRBY3Rpb25QYXJhbWV0ZXJEaWFsb2dGaWVsZEhlbHBcblx0ICogQHBhcmFtIG9BY3Rpb25QYXJhbWV0ZXIgQWN0aW9uIHBhcmFtZXRlciBvYmplY3Rcblx0ICogQHBhcmFtIHNTYXBVSU5hbWUgQWN0aW9uIHNhcHVpIG5hbWVcblx0ICogQHBhcmFtIHNQYXJhbU5hbWUgVGhlIHBhcmFtZXRlciBuYW1lXG5cdCAqIEByZXR1cm5zIFRoZSBJRCBvZiB0aGUgZmllbGRIZWxwIHVzZWQgYnkgdGhpcyBhY3Rpb24gcGFyYW1ldGVyXG5cdCAqL1xuXHRnZXRBY3Rpb25QYXJhbWV0ZXJEaWFsb2dGaWVsZEhlbHA6IGZ1bmN0aW9uIChvQWN0aW9uUGFyYW1ldGVyOiBvYmplY3QsIHNTYXBVSU5hbWU6IHN0cmluZywgc1BhcmFtTmFtZTogc3RyaW5nKSB7XG5cdFx0cmV0dXJuIHRoaXMuaGFzVmFsdWVIZWxwQW5ub3RhdGlvbihvQWN0aW9uUGFyYW1ldGVyKSA/IGdlbmVyYXRlKFtzU2FwVUlOYW1lLCBzUGFyYW1OYW1lXSkgOiB1bmRlZmluZWQ7XG5cdH0sXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gZ2V0IHRoZSBkZWxlZ2F0ZSBjb25maWd1cmF0aW9uIGZvciBBY3Rpb25QYXJhbWV0ZXIgZGlhbG9nLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgZ2V0VmFsdWVIZWxwRGVsZWdhdGVcblx0ICogQHBhcmFtIGlzQm91bmQgQWN0aW9uIGlzIGJvdW5kXG5cdCAqIEBwYXJhbSBlbnRpdHlUeXBlUGF0aCBUaGUgRW50aXR5VHlwZSBQYXRoXG5cdCAqIEBwYXJhbSBzYXBVSU5hbWUgVGhlIG5hbWUgb2YgdGhlIEFjdGlvblxuXHQgKiBAcGFyYW0gcGFyYW1OYW1lIFRoZSBuYW1lIG9mIHRoZSBBY3Rpb25QYXJhbWV0ZXJcblx0ICogQHJldHVybnMgVGhlIGRlbGVnYXRlIGNvbmZpZ3VyYXRpb24gb2JqZWN0IGFzIGEgc3RyaW5nXG5cdCAqL1xuXHRnZXRWYWx1ZUhlbHBEZWxlZ2F0ZTogZnVuY3Rpb24gKGlzQm91bmQ6IGJvb2xlYW4sIGVudGl0eVR5cGVQYXRoOiBzdHJpbmcsIHNhcFVJTmFtZTogc3RyaW5nLCBwYXJhbU5hbWU6IHN0cmluZykge1xuXHRcdGNvbnN0IGRlbGVnYXRlQ29uZmlndXJhdGlvbjogeyBuYW1lOiBzdHJpbmc7IHBheWxvYWQ6IFZhbHVlSGVscFBheWxvYWQgfSA9IHtcblx0XHRcdG5hbWU6IENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMoXCJzYXAvZmUvbWFjcm9zL3ZhbHVlaGVscC9WYWx1ZUhlbHBEZWxlZ2F0ZVwiKSxcblx0XHRcdHBheWxvYWQ6IHtcblx0XHRcdFx0cHJvcGVydHlQYXRoOiBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKFxuXHRcdFx0XHRcdFZhbHVlTGlzdEhlbHBlci5nZXRQcm9wZXJ0eVBhdGgoe1xuXHRcdFx0XHRcdFx0VW5ib3VuZEFjdGlvbjogIWlzQm91bmQsXG5cdFx0XHRcdFx0XHRFbnRpdHlUeXBlUGF0aDogZW50aXR5VHlwZVBhdGgsXG5cdFx0XHRcdFx0XHRBY3Rpb246IHNhcFVJTmFtZSxcblx0XHRcdFx0XHRcdFByb3BlcnR5OiBwYXJhbU5hbWVcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQpLFxuXHRcdFx0XHRxdWFsaWZpZXJzOiB7fSxcblx0XHRcdFx0dmFsdWVIZWxwUXVhbGlmaWVyOiBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKFwiXCIpLFxuXHRcdFx0XHRpc0FjdGlvblBhcmFtZXRlckRpYWxvZzogdHJ1ZVxuXHRcdFx0fVxuXHRcdH07XG5cdFx0cmV0dXJuIENvbW1vbkhlbHBlci5vYmplY3RUb1N0cmluZyhkZWxlZ2F0ZUNvbmZpZ3VyYXRpb24pO1xuXHR9LFxuXHQvKipcblx0ICogTWV0aG9kIHRvIGdldCB0aGUgZGVsZWdhdGUgY29uZmlndXJhdGlvbiBmb3IgTm9uQ29tcHV0ZWRWaXNpYmxlS2V5RmllbGQgZGlhbG9nLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgZ2V0VmFsdWVIZWxwRGVsZWdhdGVGb3JOb25Db21wdXRlZFZpc2libGVLZXlGaWVsZFxuXHQgKiBAcGFyYW0gcHJvcGVydHlQYXRoIFRoZSBjdXJyZW50IHByb3BlcnR5IHBhdGhcblx0ICogQHJldHVybnMgVGhlIGRlbGVnYXRlIGNvbmZpZ3VyYXRpb24gb2JqZWN0IGFzIGEgc3RyaW5nXG5cdCAqL1xuXHRnZXRWYWx1ZUhlbHBEZWxlZ2F0ZUZvck5vbkNvbXB1dGVkVmlzaWJsZUtleUZpZWxkOiBmdW5jdGlvbiAocHJvcGVydHlQYXRoOiBzdHJpbmcpIHtcblx0XHRjb25zdCBkZWxlZ2F0ZUNvbmZpZ3VyYXRpb246IHsgbmFtZTogc3RyaW5nOyBwYXlsb2FkOiBWYWx1ZUhlbHBQYXlsb2FkIH0gPSB7XG5cdFx0XHRuYW1lOiBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKFwic2FwL2ZlL21hY3Jvcy92YWx1ZWhlbHAvVmFsdWVIZWxwRGVsZWdhdGVcIiksXG5cdFx0XHRwYXlsb2FkOiB7XG5cdFx0XHRcdHByb3BlcnR5UGF0aDogQ29tbW9uSGVscGVyLmFkZFNpbmdsZVF1b3Rlcyhwcm9wZXJ0eVBhdGgpLFxuXHRcdFx0XHRxdWFsaWZpZXJzOiB7fSxcblx0XHRcdFx0dmFsdWVIZWxwUXVhbGlmaWVyOiBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKFwiXCIpXG5cdFx0XHR9XG5cdFx0fTtcblx0XHRyZXR1cm4gQ29tbW9uSGVscGVyLm9iamVjdFRvU3RyaW5nKGRlbGVnYXRlQ29uZmlndXJhdGlvbik7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ldGhvZCB0byBmZXRjaCBlbnRpdHkgZnJvbSBhIHBhdGggY29udGFpbmluZyBtdWx0aXBsZSBhc3NvY2lhdGlvbnMuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBfZ2V0RW50aXR5U2V0RnJvbU11bHRpTGV2ZWxcblx0ICogQHBhcmFtIG9Db250ZXh0IFRoZSBjb250ZXh0IHdob3NlIHBhdGggaXMgdG8gYmUgY2hlY2tlZFxuXHQgKiBAcGFyYW0gc1BhdGggVGhlIHBhdGggZnJvbSB3aGljaCBlbnRpdHkgaGFzIHRvIGJlIGZldGNoZWRcblx0ICogQHBhcmFtIHNTb3VyY2VFbnRpdHkgVGhlIGVudGl0eSBwYXRoIGluIHdoaWNoIG5hdiBlbnRpdHkgZXhpc3RzXG5cdCAqIEBwYXJhbSBpU3RhcnQgVGhlIHN0YXJ0IGluZGV4IDogYmVnaW5uaW5nIHBhcnRzIG9mIHRoZSBwYXRoIHRvIGJlIGlnbm9yZWRcblx0ICogQHBhcmFtIGlEaWZmIFRoZSBkaWZmIGluZGV4IDogZW5kIHBhcnRzIG9mIHRoZSBwYXRoIHRvIGJlIGlnbm9yZWRcblx0ICogQHJldHVybnMgVGhlIHBhdGggb2YgdGhlIGVudGl0eSBzZXRcblx0ICovXG5cdF9nZXRFbnRpdHlTZXRGcm9tTXVsdGlMZXZlbDogZnVuY3Rpb24gKG9Db250ZXh0OiBDb250ZXh0LCBzUGF0aDogc3RyaW5nLCBzU291cmNlRW50aXR5OiBzdHJpbmcsIGlTdGFydDogYW55LCBpRGlmZjogYW55KSB7XG5cdFx0bGV0IGFOYXZQYXJ0cyA9IHNQYXRoLnNwbGl0KFwiL1wiKS5maWx0ZXIoQm9vbGVhbik7XG5cdFx0YU5hdlBhcnRzID0gYU5hdlBhcnRzLmZpbHRlcihmdW5jdGlvbiAoc1BhcnQ6IHN0cmluZykge1xuXHRcdFx0cmV0dXJuIHNQYXJ0ICE9PSBcIiROYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nXCI7XG5cdFx0fSk7XG5cdFx0aWYgKGFOYXZQYXJ0cy5sZW5ndGggPiAwKSB7XG5cdFx0XHRmb3IgKGxldCBpID0gaVN0YXJ0OyBpIDwgYU5hdlBhcnRzLmxlbmd0aCAtIGlEaWZmOyBpKyspIHtcblx0XHRcdFx0c1NvdXJjZUVudGl0eSA9IGAvJHtvQ29udGV4dC5nZXRPYmplY3QoYCR7c1NvdXJjZUVudGl0eX0vJE5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmcvJHthTmF2UGFydHNbaV19YCl9YDtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHNTb3VyY2VFbnRpdHk7XG5cdH0sXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gZmluZCB0aGUgZW50aXR5IG9mIHRoZSBwcm9wZXJ0eS5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGdldFByb3BlcnR5Q29sbGVjdGlvblxuXHQgKiBAcGFyYW0gb1Byb3BlcnR5IFRoZSBjb250ZXh0IGZyb20gd2hpY2ggZGF0YWZpZWxkJ3MgcGF0aCBuZWVkcyB0byBiZSBleHRyYWN0ZWQuXG5cdCAqIEBwYXJhbSBvQ29udGV4dE9iamVjdCBUaGUgTWV0YWRhdGEgQ29udGV4dChOb3QgcGFzc2VkIHdoZW4gY2FsbGVkIHdpdGggdGVtcGxhdGU6d2l0aClcblx0ICogQHJldHVybnMgVGhlIGVudGl0eSBzZXQgcGF0aCBvZiB0aGUgcHJvcGVydHlcblx0ICovXG5cdGdldFByb3BlcnR5Q29sbGVjdGlvbjogZnVuY3Rpb24gKG9Qcm9wZXJ0eTogb2JqZWN0LCBvQ29udGV4dE9iamVjdDogYW55KSB7XG5cdFx0Y29uc3Qgb0NvbnRleHQgPSAob0NvbnRleHRPYmplY3QgJiYgb0NvbnRleHRPYmplY3QuY29udGV4dCkgfHwgb1Byb3BlcnR5O1xuXHRcdGNvbnN0IHNQYXRoID0gb0NvbnRleHQuZ2V0UGF0aCgpO1xuXHRcdGNvbnN0IGFNYWluRW50aXR5UGFydHMgPSBzUGF0aC5zcGxpdChcIi9cIikuZmlsdGVyKEJvb2xlYW4pO1xuXHRcdGNvbnN0IHNNYWluRW50aXR5ID0gYU1haW5FbnRpdHlQYXJ0c1swXTtcblx0XHRjb25zdCBzUHJvcGVydHlQYXRoID0gb0NvbnRleHQuZ2V0T2JqZWN0KFwiJFBhdGhcIik7XG5cdFx0bGV0IHNGaWVsZFNvdXJjZUVudGl0eSA9IGAvJHtzTWFpbkVudGl0eX1gO1xuXHRcdC8vIGNoZWNraW5nIGFnYWluc3QgcHJlZml4IG9mIGFubm90YXRpb25zLCBpZS4gQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlxuXHRcdC8vIGFzIGFubm90YXRpb24gcGF0aCBjYW4gYmUgb2YgYSBsaW5lIGl0ZW0sIGZpZWxkIGdyb3VwIG9yIGZhY2V0XG5cdFx0aWYgKHNQYXRoLmluZGV4T2YoXCIvQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlwiKSA+IC0xKSB7XG5cdFx0XHRjb25zdCBpQW5ub0luZGV4ID0gc1BhdGguaW5kZXhPZihcIi9AY29tLnNhcC52b2NhYnVsYXJpZXMuXCIpO1xuXHRcdFx0Y29uc3Qgc0lubmVyUGF0aCA9IHNQYXRoLnN1YnN0cmluZygwLCBpQW5ub0luZGV4KTtcblx0XHRcdC8vIHRoZSBmYWNldCBvciBsaW5lIGl0ZW0ncyBlbnRpdHkgY291bGQgYmUgYSBuYXZpZ2F0aW9uIGVudGl0eVxuXHRcdFx0c0ZpZWxkU291cmNlRW50aXR5ID0gRmllbGRIZWxwZXIuX2dldEVudGl0eVNldEZyb21NdWx0aUxldmVsKG9Db250ZXh0LCBzSW5uZXJQYXRoLCBzRmllbGRTb3VyY2VFbnRpdHksIDEsIDApO1xuXHRcdH1cblx0XHRpZiAoc1Byb3BlcnR5UGF0aCAmJiBzUHJvcGVydHlQYXRoLmluZGV4T2YoXCIvXCIpID4gLTEpIHtcblx0XHRcdC8vIHRoZSBmaWVsZCB3aXRoaW4gZmFjZXQgb3IgbGluZSBpdGVtIGNvdWxkIGJlIGZyb20gYSBuYXZpZ2F0aW9uIGVudGl0eVxuXHRcdFx0c0ZpZWxkU291cmNlRW50aXR5ID0gRmllbGRIZWxwZXIuX2dldEVudGl0eVNldEZyb21NdWx0aUxldmVsKG9Db250ZXh0LCBzUHJvcGVydHlQYXRoLCBzRmllbGRTb3VyY2VFbnRpdHksIDAsIDEpO1xuXHRcdH1cblx0XHRyZXR1cm4gc0ZpZWxkU291cmNlRW50aXR5O1xuXHR9LFxuXHQvKipcblx0ICogTWV0aG9kIHVzZWQgaW4gYSB0ZW1wbGF0ZSB3aXRoIHRvIHJldHJpZXZlIHRoZSBjdXJyZW5jeSBvciB0aGUgdW5pdCBwcm9wZXJ0eSBpbnNpZGUgYSB0ZW1wbGF0aW5nIHZhcmlhYmxlLlxuXHQgKlxuXHQgKiBAcGFyYW0gb1Byb3BlcnR5QW5ub3RhdGlvbnNcblx0ICogQHJldHVybnMgVGhlIGFubm90YXRpb25QYXRoIHRvIGJlIGRlYWx0IHdpdGggYnkgdGVtcGxhdGU6d2l0aFxuXHQgKi9cblx0Z2V0VW5pdE9yQ3VycmVuY3k6IGZ1bmN0aW9uIChvUHJvcGVydHlBbm5vdGF0aW9uczogYW55KSB7XG5cdFx0Y29uc3Qgb1Byb3BlcnR5QW5ub3RhdGlvbnNPYmplY3QgPSBvUHJvcGVydHlBbm5vdGF0aW9ucy5nZXRPYmplY3QoKTtcblx0XHRsZXQgc0Fubm90YXRpb25QYXRoID0gb1Byb3BlcnR5QW5ub3RhdGlvbnMuc1BhdGg7XG5cdFx0aWYgKG9Qcm9wZXJ0eUFubm90YXRpb25zT2JqZWN0W1wiQE9yZy5PRGF0YS5NZWFzdXJlcy5WMS5JU09DdXJyZW5jeVwiXSkge1xuXHRcdFx0c0Fubm90YXRpb25QYXRoID0gYCR7c0Fubm90YXRpb25QYXRofU9yZy5PRGF0YS5NZWFzdXJlcy5WMS5JU09DdXJyZW5jeWA7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNBbm5vdGF0aW9uUGF0aCA9IGAke3NBbm5vdGF0aW9uUGF0aH1PcmcuT0RhdGEuTWVhc3VyZXMuVjEuVW5pdGA7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHNBbm5vdGF0aW9uUGF0aDtcblx0fSxcblx0aGFzU3RhdGljVW5pdE9yQ3VycmVuY3k6IGZ1bmN0aW9uIChvUHJvcGVydHlBbm5vdGF0aW9uczogYW55KSB7XG5cdFx0cmV0dXJuIG9Qcm9wZXJ0eUFubm90YXRpb25zW1wiQE9yZy5PRGF0YS5NZWFzdXJlcy5WMS5JU09DdXJyZW5jeVwiXVxuXHRcdFx0PyAhb1Byb3BlcnR5QW5ub3RhdGlvbnNbXCJAT3JnLk9EYXRhLk1lYXN1cmVzLlYxLklTT0N1cnJlbmN5XCJdLiRQYXRoXG5cdFx0XHQ6ICFvUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBPcmcuT0RhdGEuTWVhc3VyZXMuVjEuVW5pdFwiXS4kUGF0aDtcblx0fSxcblx0Z2V0U3RhdGljVW5pdE9yQ3VycmVuY3k6IGZ1bmN0aW9uIChvUHJvcGVydHlBbm5vdGF0aW9uczogYW55LCBvRm9ybWF0T3B0aW9uczogYW55KSB7XG5cdFx0aWYgKG9Gb3JtYXRPcHRpb25zICYmIG9Gb3JtYXRPcHRpb25zLm1lYXN1cmVEaXNwbGF5TW9kZSAhPT0gXCJIaWRkZW5cIikge1xuXHRcdFx0Y29uc3QgdW5pdCA9IG9Qcm9wZXJ0eUFubm90YXRpb25zW1wiQE9yZy5PRGF0YS5NZWFzdXJlcy5WMS5JU09DdXJyZW5jeVwiXSB8fCBvUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBPcmcuT0RhdGEuTWVhc3VyZXMuVjEuVW5pdFwiXTtcblxuXHRcdFx0Y29uc3QgZGF0ZUZvcm1hdCA9IERhdGVGb3JtYXQuZ2V0RGF0ZUluc3RhbmNlKCkgYXMgYW55O1xuXHRcdFx0Y29uc3QgbG9jYWxlRGF0YSA9IGRhdGVGb3JtYXQub0xvY2FsZURhdGEubURhdGE7XG5cblx0XHRcdGlmIChcblx0XHRcdFx0bG9jYWxlRGF0YSAmJlxuXHRcdFx0XHRsb2NhbGVEYXRhLnVuaXRzICYmXG5cdFx0XHRcdGxvY2FsZURhdGEudW5pdHMuc2hvcnQgJiZcblx0XHRcdFx0bG9jYWxlRGF0YS51bml0cy5zaG9ydFt1bml0XSAmJlxuXHRcdFx0XHRsb2NhbGVEYXRhLnVuaXRzLnNob3J0W3VuaXRdLmRpc3BsYXlOYW1lXG5cdFx0XHQpIHtcblx0XHRcdFx0cmV0dXJuIGxvY2FsZURhdGEudW5pdHMuc2hvcnRbdW5pdF0uZGlzcGxheU5hbWU7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB1bml0O1xuXHRcdH1cblx0fSxcblx0Z2V0RW1wdHlJbmRpY2F0b3JUcmlnZ2VyOiBmdW5jdGlvbiAoYkFjdGl2ZTogYW55LCBzQmluZGluZzogYW55LCBzRnVsbFRleHRCaW5kaW5nOiBhbnkpIHtcblx0XHRpZiAoc0Z1bGxUZXh0QmluZGluZykge1xuXHRcdFx0cmV0dXJuIGJBY3RpdmUgPyBzRnVsbFRleHRCaW5kaW5nIDogXCJpbmFjdGl2ZVwiO1xuXHRcdH1cblx0XHRyZXR1cm4gYkFjdGl2ZSA/IHNCaW5kaW5nIDogXCJpbmFjdGl2ZVwiO1xuXHR9LFxuXHQvKipcblx0ICogV2hlbiB0aGUgdmFsdWUgZGlzcGxheWVkIGlzIGluIHRleHQgYXJyYW5nZW1lbnQgVGV4dE9ubHkgd2UgYWxzbyB3YW50IHRvIHJldHJpZXZlIHRoZSBUZXh0IHZhbHVlIGZvciB0YWJsZXMgZXZlbiBpZiB3ZSBkb24ndCBzaG93IGl0LlxuXHQgKiBUaGlzIG1ldGhvZCB3aWxsIHJldHVybiB0aGUgdmFsdWUgb2YgdGhlIG9yaWdpbmFsIGRhdGEgZmllbGQuXG5cdCAqXG5cdCAqIEBwYXJhbSBvVGhpcyBUaGUgY3VycmVudCBvYmplY3Rcblx0ICogQHBhcmFtIG9EYXRhRmllbGRUZXh0QXJyYW5nZW1lbnQgRGF0YUZpZWxkIHVzaW5nIHRleHQgYXJyYW5nZW1lbnQgYW5ub3RhdGlvblxuXHQgKiBAcGFyYW0gb0RhdGFGaWVsZCBEYXRhRmllbGQgY29udGFpbmluZyB0aGUgdmFsdWUgdXNpbmcgdGV4dCBhcnJhbmdlbWVudCBhbm5vdGF0aW9uXG5cdCAqIEByZXR1cm5zIFRoZSBiaW5kaW5nIHRvIHRoZSB2YWx1ZVxuXHQgKi9cblx0Z2V0QmluZGluZ0luZm9Gb3JUZXh0QXJyYW5nZW1lbnQ6IGZ1bmN0aW9uIChvVGhpczogb2JqZWN0LCBvRGF0YUZpZWxkVGV4dEFycmFuZ2VtZW50OiBhbnksIG9EYXRhRmllbGQ6IGFueSkge1xuXHRcdGlmIChcblx0XHRcdG9EYXRhRmllbGRUZXh0QXJyYW5nZW1lbnQgJiZcblx0XHRcdG9EYXRhRmllbGRUZXh0QXJyYW5nZW1lbnQuJEVudW1NZW1iZXIgJiZcblx0XHRcdG9EYXRhRmllbGRUZXh0QXJyYW5nZW1lbnQuJEVudW1NZW1iZXIgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuVGV4dEFycmFuZ2VtZW50VHlwZS9UZXh0T25seVwiICYmXG5cdFx0XHRvRGF0YUZpZWxkXG5cdFx0KSB7XG5cdFx0XHRyZXR1cm4gYHske29EYXRhRmllbGQuVmFsdWUuJFBhdGh9fWA7XG5cdFx0fVxuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH0sXG5cblx0c2VtYW50aWNLZXlGb3JtYXQ6IGZ1bmN0aW9uICh2UmF3OiBhbnksIG9JbnRlcmZhY2U6IGFueSkge1xuXHRcdC8vIFRoZSBFbXB0eSBhcmd1bWVudCBlbnN1cmVzIHRoYXQgXCJncm91cGluZ0VuYWJsZWRcIiBpcyBhZGRlZCB0byBcImZvcm1hdE9wdGlvbnNcIlxuXHRcdG9JbnRlcmZhY2UuYXJndW1lbnRzID0gW3t9LCB7IGdyb3VwaW5nRW5hYmxlZDogZmFsc2UgfV07XG5cdFx0cmV0dXJuIEFubm90YXRpb25IZWxwZXIuZm9ybWF0KHZSYXcsIG9JbnRlcmZhY2UpO1xuXHR9LFxuXHRnZXRJc01lZGlhQ29udGVudFR5cGVOdWxsRXhwcjogZnVuY3Rpb24gKHNQcm9wZXJ0eVBhdGg6IGFueSwgc09wZXJhdG9yOiBhbnkpIHtcblx0XHRzT3BlcmF0b3IgPSBzT3BlcmF0b3IgfHwgXCI9PT1cIjtcblx0XHRyZXR1cm4gXCJ7PSAle1wiICsgc1Byb3BlcnR5UGF0aCArIFwiQG9kYXRhLm1lZGlhQ29udGVudFR5cGV9IFwiICsgc09wZXJhdG9yICsgXCIgbnVsbCB9XCI7XG5cdH0sXG5cdGdldFBhdGhGb3JJY29uU291cmNlOiBmdW5jdGlvbiAoc1Byb3BlcnR5UGF0aDogYW55KSB7XG5cdFx0cmV0dXJuIFwiez0gRklFTERSVU5USU1FLmdldEljb25Gb3JNaW1lVHlwZSgle1wiICsgc1Byb3BlcnR5UGF0aCArIFwiQG9kYXRhLm1lZGlhQ29udGVudFR5cGV9KX1cIjtcblx0fSxcblx0Z2V0RmlsZW5hbWVFeHByOiBmdW5jdGlvbiAoc0ZpbGVuYW1lOiBhbnksIHNOb0ZpbGVuYW1lVGV4dDogYW55KSB7XG5cdFx0aWYgKHNGaWxlbmFtZSkge1xuXHRcdFx0aWYgKHNGaWxlbmFtZS5pbmRleE9mKFwie1wiKSA9PT0gMCkge1xuXHRcdFx0XHQvLyBmaWxlbmFtZSBpcyByZWZlcmVuY2VkIHZpYSBwYXRoLCBpLmUuIEBDb3JlLkNvbnRlbnREaXNwb3NpdGlvbi5GaWxlbmFtZSA6IHBhdGhcblx0XHRcdFx0cmV0dXJuIFwiez0gJFwiICsgc0ZpbGVuYW1lICsgXCIgPyAkXCIgKyBzRmlsZW5hbWUgKyBcIiA6ICRcIiArIHNOb0ZpbGVuYW1lVGV4dCArIFwifVwiO1xuXHRcdFx0fVxuXHRcdFx0Ly8gc3RhdGljIGZpbGVuYW1lLCBpLmUuIEBDb3JlLkNvbnRlbnREaXNwb3NpdGlvbi5GaWxlbmFtZSA6ICdzb21lU3RhdGljTmFtZSdcblx0XHRcdHJldHVybiBzRmlsZW5hbWU7XG5cdFx0fVxuXHRcdC8vIG5vIEBDb3JlLkNvbnRlbnREaXNwb3NpdGlvbi5GaWxlbmFtZVxuXHRcdHJldHVybiBzTm9GaWxlbmFtZVRleHQ7XG5cdH0sXG5cblx0Y2FsY3VsYXRlTUJmcm9tQnl0ZTogZnVuY3Rpb24gKGlCeXRlOiBhbnkpIHtcblx0XHRyZXR1cm4gaUJ5dGUgPyAoaUJ5dGUgLyAoMTAyNCAqIDEwMjQpKS50b0ZpeGVkKDYpIDogdW5kZWZpbmVkO1xuXHR9LFxuXHRnZXREb3dubG9hZFVybDogZnVuY3Rpb24gKHByb3BlcnR5UGF0aDogc3RyaW5nKSB7XG5cdFx0cmV0dXJuIHByb3BlcnR5UGF0aCArIFwiez0gJHtpbnRlcm5hbD4vc3RpY2t5U2Vzc2lvblRva2VufSA/ICgnP1NBUC1Db250ZXh0SWQ9JyArICR7aW50ZXJuYWw+L3N0aWNreVNlc3Npb25Ub2tlbn0pIDogJycgfVwiO1xuXHR9LFxuXHRnZXRNYXJnaW5DbGFzczogZnVuY3Rpb24gKGNvbXBhY3RTZW1hbnRpY0tleTogc3RyaW5nIHwgYm9vbGVhbikge1xuXHRcdHJldHVybiBjb21wYWN0U2VtYW50aWNLZXkgPT09IFwidHJ1ZVwiIHx8IGNvbXBhY3RTZW1hbnRpY0tleSA9PT0gdHJ1ZSA/IFwic2FwTVRhYmxlQ29udGVudE1hcmdpblwiIDogdW5kZWZpbmVkO1xuXHR9LFxuXHRnZXRSZXF1aXJlZDogZnVuY3Rpb24gKGltbXV0YWJsZUtleTogYW55LCB0YXJnZXQ6IGFueSwgcmVxdWlyZWRQcm9wZXJ0aWVzOiBhbnkpIHtcblx0XHRsZXQgdGFyZ2V0UmVxdWlyZWRFeHByZXNzaW9uOiBhbnkgPSBjb25zdGFudChmYWxzZSk7XG5cdFx0aWYgKHRhcmdldCAhPT0gbnVsbCkge1xuXHRcdFx0dGFyZ2V0UmVxdWlyZWRFeHByZXNzaW9uID0gaXNSZXF1aXJlZEV4cHJlc3Npb24odGFyZ2V0Py50YXJnZXRPYmplY3QpO1xuXHRcdH1cblx0XHRyZXR1cm4gY29tcGlsZUV4cHJlc3Npb24ob3IodGFyZ2V0UmVxdWlyZWRFeHByZXNzaW9uLCByZXF1aXJlZFByb3BlcnRpZXMuaW5kZXhPZihpbW11dGFibGVLZXkpID4gLTEpKTtcblx0fSxcblxuXHQvKipcblx0ICogVGhlIG1ldGhvZCBjaGVja3MgaWYgdGhlIGZpZWxkIGlzIGFscmVhZHkgcGFydCBvZiBhIGZvcm0uXG5cdCAqXG5cdCAqIEBwYXJhbSBkYXRhRmllbGRDb2xsZWN0aW9uIFRoZSBsaXN0IG9mIHRoZSBmaWVsZHMgb2YgdGhlIGZvcm1cblx0ICogQHBhcmFtIGRhdGFGaWVsZE9iamVjdFBhdGggVGhlIGRhdGEgbW9kZWwgb2JqZWN0IHBhdGggb2YgdGhlIGZpZWxkIHdoaWNoIG5lZWRzIHRvIGJlIGNoZWNrZWQgaW4gdGhlIGZvcm1cblx0ICogQHJldHVybnMgYHRydWVgIGlmIHRoZSBmaWVsZCBpcyBhbHJlYWR5IHBhcnQgb2YgdGhlIGZvcm0sIGBmYWxzZWAgb3RoZXJ3aXNlXG5cdCAqL1xuXHRpc0ZpZWxkUGFydE9mRm9ybTogZnVuY3Rpb24gKGRhdGFGaWVsZENvbGxlY3Rpb246IEZvcm1FbGVtZW50W10sIGRhdGFGaWVsZE9iamVjdFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgpIHtcblx0XHQvL2dlbmVyYXRpbmcga2V5IGZvciB0aGUgcmVjZWl2ZWQgZGF0YSBmaWVsZFxuXHRcdGNvbnN0IGNvbm5lY3RlZERhdGFGaWVsZEtleSA9IEtleUhlbHBlci5nZW5lcmF0ZUtleUZyb21EYXRhRmllbGQoZGF0YUZpZWxkT2JqZWN0UGF0aC50YXJnZXRPYmplY3QpO1xuXHRcdC8vIHRyeWluZyB0byBmaW5kIHRoZSBnZW5lcmF0ZWQga2V5IGluIGFscmVhZHkgZXhpc3RpbmcgZm9ybSBlbGVtZW50c1xuXHRcdGNvbnN0IGlzRmllbGRGb3VuZCA9IGRhdGFGaWVsZENvbGxlY3Rpb24uZmluZCgoZmllbGQpID0+IHtcblx0XHRcdHJldHVybiBmaWVsZC5rZXkgPT09IGNvbm5lY3RlZERhdGFGaWVsZEtleTtcblx0XHR9KTtcblx0XHRyZXR1cm4gaXNGaWVsZEZvdW5kID8gdHJ1ZSA6IGZhbHNlO1xuXHR9XG59O1xuKEZpZWxkSGVscGVyLmJ1aWxkRXhwcmVzc2lvbkZvclRleHRWYWx1ZSBhcyBhbnkpLnJlcXVpcmVzSUNvbnRleHQgPSB0cnVlO1xuKEZpZWxkSGVscGVyLmdldEZpZWxkR3JvdXBJZHMgYXMgYW55KS5yZXF1aXJlc0lDb250ZXh0ID0gdHJ1ZTtcbihGaWVsZEhlbHBlci5maWVsZENvbnRyb2wgYXMgYW55KS5yZXF1aXJlc0lDb250ZXh0ID0gdHJ1ZTtcbihGaWVsZEhlbHBlci5nZXRUeXBlQWxpZ25tZW50IGFzIGFueSkucmVxdWlyZXNJQ29udGV4dCA9IHRydWU7XG4oRmllbGRIZWxwZXIuZ2V0UHJvcGVydHlDb2xsZWN0aW9uIGFzIGFueSkucmVxdWlyZXNJQ29udGV4dCA9IHRydWU7XG4oRmllbGRIZWxwZXIuZ2V0QVBEaWFsb2dEaXNwbGF5Rm9ybWF0IGFzIGFueSkucmVxdWlyZXNJQ29udGV4dCA9IHRydWU7XG4oRmllbGRIZWxwZXIuc2VtYW50aWNLZXlGb3JtYXQgYXMgYW55KS5yZXF1aXJlc0lDb250ZXh0ID0gdHJ1ZTtcbihGaWVsZEhlbHBlci5jb21wdXRlTGFiZWxUZXh0IGFzIGFueSkucmVxdWlyZXNJQ29udGV4dCA9IHRydWU7XG4oRmllbGRIZWxwZXIucmV0cmlldmVUZXh0RnJvbVZhbHVlTGlzdCBhcyBhbnkpLnJlcXVpcmVzSUNvbnRleHQgPSB0cnVlO1xuKEZpZWxkSGVscGVyLmdldEFjdGlvblBhcmFtZXRlclZpc2liaWxpdHkgYXMgYW55KS5yZXF1aXJlc0lDb250ZXh0ID0gdHJ1ZTtcblxuZXhwb3J0IGRlZmF1bHQgRmllbGRIZWxwZXI7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7RUE0QkEsTUFBTUEsV0FBVyxHQUFHLG9DQUFvQztJQUN2REMsSUFBSSxHQUFHLDZCQUE2Qjs7RUFFckM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxlQUFlQyx1QkFBdUIsQ0FBQ0MsVUFBZSxFQUFFO0lBQ3ZELE1BQU1DLFVBQVUsR0FBR0QsVUFBVSxDQUFDRSxRQUFRLEVBQUU7SUFDeEMsTUFBTUMsY0FBYyxHQUFHSCxVQUFVLENBQUNJLFVBQVUsQ0FBQyw4QkFBOEIsQ0FBQztJQUM1RSxNQUFNQyxZQUFZLEdBQUdGLGNBQWMsQ0FBQ0csV0FBVzs7SUFFL0M7SUFDQSxJQUFJRCxZQUFZLEVBQUU7TUFDakIsT0FBT0EsWUFBWTtJQUNwQjtJQUVBLE9BQU9FLGlCQUFpQixDQUFDQyxt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