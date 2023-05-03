/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/templating/PropertyHelper", "sap/fe/core/templating/SemanticObjectHelper", "sap/fe/macros/field/FieldTemplating", "sap/fe/macros/MacroMetadata"], function (MetaModelConverter, BindingToolkit, PropertyHelper, SemanticObjectHelper, FieldTemplating, MacroMetadata) {
  "use strict";

  var getDataModelObjectPathForValue = FieldTemplating.getDataModelObjectPathForValue;
  var hasSemanticObject = SemanticObjectHelper.hasSemanticObject;
  var getSemanticObjectUnavailableActions = SemanticObjectHelper.getSemanticObjectUnavailableActions;
  var getSemanticObjects = SemanticObjectHelper.getSemanticObjects;
  var getSemanticObjectMappings = SemanticObjectHelper.getSemanticObjectMappings;
  var getDynamicPathFromSemanticObject = SemanticObjectHelper.getDynamicPathFromSemanticObject;
  var isProperty = PropertyHelper.isProperty;
  var pathInModel = BindingToolkit.pathInModel;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var compileExpression = BindingToolkit.compileExpression;
  const QuickView = MacroMetadata.extend("sap.fe.macros.quickView.QuickView", {
    /**
     * Name of the building block control.
     */
    name: "QuickView",
    /**
     *
     * Namespace of the building block control
     */
    namespace: "sap.fe.macros",
    /**
     * Fragment source of the building block (optional) - if not set, fragment is generated from namespace and name
     */
    fragment: "sap.fe.macros.quickView.QuickView",
    /**
     * The metadata describing the building block control.
     */
    metadata: {
      /**
       * Define building block stereotype for documentation
       */
      stereotype: "xmlmacro",
      /**
       * Location of the designtime info
       */
      designtime: "sap/fe/macros/quickView/QuickView.designtime",
      /**
       * Properties.
       */
      properties: {
        dataField: {
          type: "sap.ui.model.Context",
          required: true,
          $kind: "Property",
          $Type: ["com.sap.vocabularies.UI.v1.DataField", "com.sap.vocabularies.UI.v1.DataFieldWithUrl", "com.sap.vocabularies.UI.v1.DataFieldForAnnotation", "com.sap.vocabularies.UI.v1.DataPointType"]
        },
        semanticObject: {
          type: "string"
        },
        /**
         * Metadata path to the entity set
         */
        contextPath: {
          type: "sap.ui.model.Context",
          required: false
        },
        /**
         * Context pointing to an array of key value that is used for custom data generation
         */
        semanticObjectsToResolve: {
          type: "sap.ui.model.Context",
          required: false,
          computed: true
        }
      },
      events: {}
    },
    create: function (oProps) {
      var _valueProperty$annota, _oDataModelPath$conte, _oDataModelPath$conte2, _oDataModelPath$conte3, _oDataModelPath$conte4, _valueProperty$annota2, _valueProperty$annota3, _valueProperty$annota4;
      let oDataModelPath = MetaModelConverter.getInvolvedDataModelObjects(oProps.dataField, oProps.contextPath);
      const valueDataModelPath = getDataModelObjectPathForValue(oDataModelPath);
      oDataModelPath = valueDataModelPath || oDataModelPath;
      const valueProperty = oDataModelPath.targetObject;
      const hasQuickViewFacets = valueProperty ? FieldTemplating.isUsedInNavigationWithQuickViewFacets(oDataModelPath, valueProperty) + "" : "false";
      const commonAnnotations = valueProperty === null || valueProperty === void 0 ? void 0 : (_valueProperty$annota = valueProperty.annotations) === null || _valueProperty$annota === void 0 ? void 0 : _valueProperty$annota.Common;
      //we will need to pass the relativeLocation=getRelativePaths(oDataModelPath); to fieldTemplating#getSemanticObjectExpressionToResolve

      const aSemObjExprToResolve = commonAnnotations ? FieldTemplating.getSemanticObjectExpressionToResolve(commonAnnotations, true) : [];
      const pathOfDynamicSemanticObject = getDynamicPathFromSemanticObject(oProps.semanticObject);
      if (pathOfDynamicSemanticObject) {
        aSemObjExprToResolve.push({
          key: pathOfDynamicSemanticObject,
          value: oProps.semanticObject
        });
      }
      oProps.semanticObjectsToResolve = FieldTemplating.getSemanticObjects(aSemObjExprToResolve); // this is used via semanticObjectsToResolve>
      const relativePathToQuickViewEntity = this._getRelativePathToQuickViewEntity(oDataModelPath);
      // it can be that there is no targetEntityset for the context location so we use the targetObjectFullyQualifiedName
      const quickViewEntity = relativePathToQuickViewEntity ? `/${((_oDataModelPath$conte = oDataModelPath.contextLocation) === null || _oDataModelPath$conte === void 0 ? void 0 : (_oDataModelPath$conte2 = _oDataModelPath$conte.targetEntitySet) === null || _oDataModelPath$conte2 === void 0 ? void 0 : _oDataModelPath$conte2.name) || ((_oDataModelPath$conte3 = oDataModelPath.contextLocation) === null || _oDataModelPath$conte3 === void 0 ? void 0 : (_oDataModelPath$conte4 = _oDataModelPath$conte3.targetObject) === null || _oDataModelPath$conte4 === void 0 ? void 0 : _oDataModelPath$conte4.fullyQualifiedName)}/${relativePathToQuickViewEntity}` : undefined;
      const navigationPath = relativePathToQuickViewEntity ? compileExpression(pathInModel(relativePathToQuickViewEntity)) : undefined;
      const propertyWithSemanticObject = this._getPropertyWithSemanticObject(oDataModelPath);
      let mainSemanticObject;
      const {
        semanticObjectsList,
        qualifierMap
      } = this._getSemanticObjectsForPayloadAndQualifierMap(propertyWithSemanticObject);
      const semanticObjectMappings = this._getSemanticObjectMappingsForPayload(propertyWithSemanticObject, qualifierMap);
      const semanticObjectUnavailableActions = this._getSemanticObjectUnavailableActionsForPayload(propertyWithSemanticObject, qualifierMap);
      if (isProperty(propertyWithSemanticObject)) {
        // TODO why should this be different for navigation: when we add this some links disappear
        mainSemanticObject = qualifierMap["main"] || qualifierMap[""];
      }
      this._addCustomSemanticObjectToSemanticObjectListForPayload(semanticObjectsList, oProps.semanticObject);
      const propertyPathLabel = ((_valueProperty$annota2 = valueProperty.annotations) === null || _valueProperty$annota2 === void 0 ? void 0 : (_valueProperty$annota3 = _valueProperty$annota2.Common) === null || _valueProperty$annota3 === void 0 ? void 0 : (_valueProperty$annota4 = _valueProperty$annota3.Label) === null || _valueProperty$annota4 === void 0 ? void 0 : _valueProperty$annota4.valueOf()) || "";
      const payload = {
        semanticObjects: semanticObjectsList,
        entityType: quickViewEntity,
        semanticObjectUnavailableActions: semanticObjectUnavailableActions,
        semanticObjectMappings: semanticObjectMappings,
        mainSemanticObject: mainSemanticObject,
        propertyPathLabel: propertyPathLabel,
        dataField: quickViewEntity === undefined ? oProps.dataField.getPath() : undefined,
        contact: undefined,
        navigationPath: navigationPath,
        hasQuickViewFacets: hasQuickViewFacets
      };
      oProps.delegateConfiguration = JSON.stringify({
        name: "sap/fe/macros/quickView/QuickViewDelegate",
        payload: payload
      });
      return oProps;
    },
    /**
     * Get the relative path to the entity which quick view Facets we want to display.
     *
     * @param propertyDataModelPath
     * @returns A path if it exists.
     */
    _getRelativePathToQuickViewEntity: function (propertyDataModelPath) {
      let relativePathToQuickViewEntity;
      const quickViewNavProp = this._getNavPropToQuickViewEntity(propertyDataModelPath);
      if (quickViewNavProp) {
        relativePathToQuickViewEntity = propertyDataModelPath.navigationProperties.reduce((relativPath, navProp) => {
          var _propertyDataModelPat;
          if (navProp.name !== quickViewNavProp.name && !((_propertyDataModelPat = propertyDataModelPath.contextLocation) !== null && _propertyDataModelPat !== void 0 && _propertyDataModelPat.navigationProperties.find(contextNavProp => contextNavProp.name === navProp.name))) {
            // we keep only navProperties that are part of the relativePath and not the one for quickViewNavProp
            return `${relativPath}${navProp.name}/`;
          }
          return relativPath;
        }, "");
        relativePathToQuickViewEntity = `${relativePathToQuickViewEntity}${quickViewNavProp.name}`;
      }
      return relativePathToQuickViewEntity;
    },
    /**
     * Get the property or the navigation property in  its relative path that holds semanticObject annotation if it exists.
     *
     * @param dataModelObjectPath
     * @returns A property or a NavProperty or undefined
     */
    _getPropertyWithSemanticObject: function (dataModelObjectPath) {
      let propertyWithSemanticObject;
      if (hasSemanticObject(dataModelObjectPath.targetObject)) {
        propertyWithSemanticObject = dataModelObjectPath.targetObject;
      } else if (dataModelObjectPath.navigationProperties.length > 0) {
        // there are no semantic objects on the property itself so we look for some on nav properties
        for (const navProperty of dataModelObjectPath.navigationProperties) {
          var _dataModelObjectPath$;
          if (!((_dataModelObjectPath$ = dataModelObjectPath.contextLocation) !== null && _dataModelObjectPath$ !== void 0 && _dataModelObjectPath$.navigationProperties.find(contextNavProp => contextNavProp.fullyQualifiedName === navProperty.fullyQualifiedName)) && !propertyWithSemanticObject && hasSemanticObject(navProperty)) {
            propertyWithSemanticObject = navProperty;
          }
        }
      }
      return propertyWithSemanticObject;
    },
    /**
     * Get the semanticObject compile biding from metadata and a map to the qualifiers.
     *
     * @param propertyWithSemanticObject The property that holds semanticObject annotataions if it exists
     * @returns An object containing semanticObjectList and qualifierMap
     */
    _getSemanticObjectsForPayloadAndQualifierMap: function (propertyWithSemanticObject) {
      const qualifierMap = {};
      const semanticObjectsList = [];
      if (propertyWithSemanticObject !== undefined) {
        for (const semanticObject of getSemanticObjects(propertyWithSemanticObject)) {
          const compiledSemanticObject = compileExpression(getExpressionFromAnnotation(semanticObject));
          // this should not happen, but we make sure not to add twice the semanticObject otherwise the mdcLink crashes
          if (compiledSemanticObject && !semanticObjectsList.includes(compiledSemanticObject)) {
            qualifierMap[semanticObject.qualifier || ""] = compiledSemanticObject;
            semanticObjectsList.push(compiledSemanticObject);
          }
        }
      }
      return {
        semanticObjectsList,
        qualifierMap
      };
    },
    /**
     * Get the semanticObjectMappings from metadata in the payload expected structure.
     *
     * @param propertyWithSemanticObject
     * @param qualifierMap
     * @returns A payload structure for semanticObjectMappings
     */
    _getSemanticObjectMappingsForPayload: function (propertyWithSemanticObject, qualifierMap) {
      const semanticObjectMappings = [];
      if (propertyWithSemanticObject !== undefined) {
        for (const semanticObjectMapping of getSemanticObjectMappings(propertyWithSemanticObject)) {
          const correspondingSemanticObject = qualifierMap[semanticObjectMapping.qualifier || ""];
          if (correspondingSemanticObject) {
            semanticObjectMappings.push({
              semanticObject: correspondingSemanticObject,
              items: semanticObjectMapping.map(semanticObjectMappingType => {
                return {
                  key: semanticObjectMappingType.LocalProperty.value,
                  value: semanticObjectMappingType.SemanticObjectProperty.valueOf()
                };
              })
            });
          }
        }
      }
      return semanticObjectMappings;
    },
    /**
     * Get the semanticObjectUnavailableActions from metadata in the payload expected structure.
     *
     * @param propertyWithSemanticObject
     * @param qualifierMap
     * @returns A payload structure for semanticObjectUnavailableActions
     */
    _getSemanticObjectUnavailableActionsForPayload: function (propertyWithSemanticObject, qualifierMap) {
      const semanticObjectUnavailableActions = [];
      if (propertyWithSemanticObject !== undefined) {
        for (const unavailableActionAnnotation of getSemanticObjectUnavailableActions(propertyWithSemanticObject)) {
          const correspondingSemanticObject = qualifierMap[unavailableActionAnnotation.qualifier || ""];
          if (correspondingSemanticObject) {
            semanticObjectUnavailableActions.push({
              semanticObject: correspondingSemanticObject,
              actions: unavailableActionAnnotation.map(unavailableAction => unavailableAction)
            });
          }
        }
      }
      return semanticObjectUnavailableActions;
    },
    /**
     * Add customObject(s) to the semanticObject list for the payload if it exists.
     *
     * @param semanticObjectsList
     * @param customSemanticObject
     */
    _addCustomSemanticObjectToSemanticObjectListForPayload: function (semanticObjectsList, customSemanticObject) {
      if (customSemanticObject) {
        // the custom semantic objects are either a single string/key to custom data or a stringified array
        if (customSemanticObject[0] !== "[") {
          // customSemanticObject = "semanticObject" | "{pathInModel}"
          if (semanticObjectsList.indexOf(customSemanticObject) === -1) {
            semanticObjectsList.push(customSemanticObject);
          }
        } else {
          // customSemanticObject = '["semanticObject1","semanticObject2"]'
          for (const semanticObject of JSON.parse(customSemanticObject)) {
            if (semanticObjectsList.indexOf(semanticObject) === -1) {
              semanticObjectsList.push(semanticObject);
            }
          }
        }
      }
    },
    /**
     * Get the navigationProperty to an entity with QuickViewFacets that can be linked to the property.
     *
     * @param propertyDataModelPath
     * @returns A navigation property if it exists.
     */
    _getNavPropToQuickViewEntity: function (propertyDataModelPath) {
      var _propertyDataModelPat2;
      //TODO we should investigate to put this code as common with FieldTemplating.isUsedInNavigationWithQuickViewFacets
      const property = propertyDataModelPath.targetObject;
      const navigationProperties = propertyDataModelPath.targetEntityType.navigationProperties;
      let quickViewNavProp = navigationProperties.find(navProp => {
        var _navProp$referentialC;
        return (_navProp$referentialC = navProp.referentialConstraint) === null || _navProp$referentialC === void 0 ? void 0 : _navProp$referentialC.some(referentialConstraint => {
          var _navProp$targetType, _navProp$targetType$a, _navProp$targetType$a2;
          return (referentialConstraint === null || referentialConstraint === void 0 ? void 0 : referentialConstraint.sourceProperty) === property.name && (navProp === null || navProp === void 0 ? void 0 : (_navProp$targetType = navProp.targetType) === null || _navProp$targetType === void 0 ? void 0 : (_navProp$targetType$a = _navProp$targetType.annotations) === null || _navProp$targetType$a === void 0 ? void 0 : (_navProp$targetType$a2 = _navProp$targetType$a.UI) === null || _navProp$targetType$a2 === void 0 ? void 0 : _navProp$targetType$a2.QuickViewFacets);
        });
      });
      if (!quickViewNavProp && ((_propertyDataModelPat2 = propertyDataModelPath.contextLocation) === null || _propertyDataModelPat2 === void 0 ? void 0 : _propertyDataModelPat2.targetEntitySet) !== propertyDataModelPath.targetEntitySet) {
        var _propertyDataModelPat3, _propertyDataModelPat4, _propertyDataModelPat5, _propertyDataModelPat6, _propertyDataModelPat7, _propertyDataModelPat8;
        const semanticKeys = (propertyDataModelPath === null || propertyDataModelPath === void 0 ? void 0 : (_propertyDataModelPat3 = propertyDataModelPath.targetEntityType) === null || _propertyDataModelPat3 === void 0 ? void 0 : (_propertyDataModelPat4 = _propertyDataModelPat3.annotations) === null || _propertyDataModelPat4 === void 0 ? void 0 : (_propertyDataModelPat5 = _propertyDataModelPat4.Common) === null || _propertyDataModelPat5 === void 0 ? void 0 : _propertyDataModelPat5.SemanticKey) || [];
        const isPropertySemanticKey = semanticKeys.some(function (semanticKey) {
          var _semanticKey$$target;
          return (semanticKey === null || semanticKey === void 0 ? void 0 : (_semanticKey$$target = semanticKey.$target) === null || _semanticKey$$target === void 0 ? void 0 : _semanticKey$$target.name) === property.name;
        });
        const lastNavProp = propertyDataModelPath.navigationProperties[propertyDataModelPath.navigationProperties.length - 1];
        if ((isPropertySemanticKey || property.isKey) && propertyDataModelPath !== null && propertyDataModelPath !== void 0 && (_propertyDataModelPat6 = propertyDataModelPath.targetEntityType) !== null && _propertyDataModelPat6 !== void 0 && (_propertyDataModelPat7 = _propertyDataModelPat6.annotations) !== null && _propertyDataModelPat7 !== void 0 && (_propertyDataModelPat8 = _propertyDataModelPat7.UI) !== null && _propertyDataModelPat8 !== void 0 && _propertyDataModelPat8.QuickViewFacets) {
          quickViewNavProp = lastNavProp;
        }
      }
      return quickViewNavProp;
    }
  });
  return QuickView;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJRdWlja1ZpZXciLCJNYWNyb01ldGFkYXRhIiwiZXh0ZW5kIiwibmFtZSIsIm5hbWVzcGFjZSIsImZyYWdtZW50IiwibWV0YWRhdGEiLCJzdGVyZW90eXBlIiwiZGVzaWdudGltZSIsInByb3BlcnRpZXMiLCJkYXRhRmllbGQiLCJ0eXBlIiwicmVxdWlyZWQiLCIka2luZCIsIiRUeXBlIiwic2VtYW50aWNPYmplY3QiLCJjb250ZXh0UGF0aCIsInNlbWFudGljT2JqZWN0c1RvUmVzb2x2ZSIsImNvbXB1dGVkIiwiZXZlbnRzIiwiY3JlYXRlIiwib1Byb3BzIiwib0RhdGFNb2RlbFBhdGgiLCJNZXRhTW9kZWxDb252ZXJ0ZXIiLCJnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMiLCJ2YWx1ZURhdGFNb2RlbFBhdGgiLCJnZXREYXRhTW9kZWxPYmplY3RQYXRoRm9yVmFsdWUiLCJ2YWx1ZVByb3BlcnR5IiwidGFyZ2V0T2JqZWN0IiwiaGFzUXVpY2tWaWV3RmFjZXRzIiwiRmllbGRUZW1wbGF0aW5nIiwiaXNVc2VkSW5OYXZpZ2F0aW9uV2l0aFF1aWNrVmlld0ZhY2V0cyIsImNvbW1vbkFubm90YXRpb25zIiwiYW5ub3RhdGlvbnMiLCJDb21tb24iLCJhU2VtT2JqRXhwclRvUmVzb2x2ZSIsImdldFNlbWFudGljT2JqZWN0RXhwcmVzc2lvblRvUmVzb2x2ZSIsInBhdGhPZkR5bmFtaWNTZW1hbnRpY09iamVjdCIsImdldER5bmFtaWNQYXRoRnJvbVNlbWFudGljT2JqZWN0IiwicHVzaCIsImtleSIsInZhbHVlIiwiZ2V0U2VtYW50aWNPYmplY3RzIiwicmVsYXRpdmVQYXRoVG9RdWlja1ZpZXdFbnRpdHkiLCJfZ2V0UmVsYXRpdmVQYXRoVG9RdWlja1ZpZXdFbnRpdHkiLCJxdWlja1ZpZXdFbnRpdHkiLCJjb250ZXh0TG9jYXRpb24iLCJ0YXJnZXRFbnRpdHlTZXQiLCJmdWxseVF1YWxpZmllZE5hbWUiLCJ1bmRlZmluZWQiLCJuYXZpZ2F0aW9uUGF0aCIsImNvbXBpbGVFeHByZXNzaW9uIiwicGF0aEluTW9kZWwiLCJwcm9wZXJ0eVdpdGhTZW1hbnRpY09iamVjdCIsIl9nZXRQcm9wZXJ0eVdpdGhTZW1hbnRpY09iamVjdCIsIm1haW5TZW1hbnRpY09iamVjdCIsInNlbWFudGljT2JqZWN0c0xpc3QiLCJxdWFsaWZpZXJNYXAiLCJfZ2V0U2VtYW50aWNPYmplY3RzRm9yUGF5bG9hZEFuZFF1YWxpZmllck1hcCIsInNlbWFudGljT2JqZWN0TWFwcGluZ3MiLCJfZ2V0U2VtYW50aWNPYmplY3RNYXBwaW5nc0ZvclBheWxvYWQiLCJzZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucyIsIl9nZXRTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uc0ZvclBheWxvYWQiLCJpc1Byb3BlcnR5IiwiX2FkZEN1c3RvbVNlbWFudGljT2JqZWN0VG9TZW1hbnRpY09iamVjdExpc3RGb3JQYXlsb2FkIiwicHJvcGVydHlQYXRoTGFiZWwiLCJMYWJlbCIsInZhbHVlT2YiLCJwYXlsb2FkIiwic2VtYW50aWNPYmplY3RzIiwiZW50aXR5VHlwZSIsImdldFBhdGgiLCJjb250YWN0IiwiZGVsZWdhdGVDb25maWd1cmF0aW9uIiwiSlNPTiIsInN0cmluZ2lmeSIsInByb3BlcnR5RGF0YU1vZGVsUGF0aCIsInF1aWNrVmlld05hdlByb3AiLCJfZ2V0TmF2UHJvcFRvUXVpY2tWaWV3RW50aXR5IiwibmF2aWdhdGlvblByb3BlcnRpZXMiLCJyZWR1Y2UiLCJyZWxhdGl2UGF0aCIsIm5hdlByb3AiLCJmaW5kIiwiY29udGV4dE5hdlByb3AiLCJkYXRhTW9kZWxPYmplY3RQYXRoIiwiaGFzU2VtYW50aWNPYmplY3QiLCJsZW5ndGgiLCJuYXZQcm9wZXJ0eSIsImNvbXBpbGVkU2VtYW50aWNPYmplY3QiLCJnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24iLCJpbmNsdWRlcyIsInF1YWxpZmllciIsInNlbWFudGljT2JqZWN0TWFwcGluZyIsImdldFNlbWFudGljT2JqZWN0TWFwcGluZ3MiLCJjb3JyZXNwb25kaW5nU2VtYW50aWNPYmplY3QiLCJpdGVtcyIsIm1hcCIsInNlbWFudGljT2JqZWN0TWFwcGluZ1R5cGUiLCJMb2NhbFByb3BlcnR5IiwiU2VtYW50aWNPYmplY3RQcm9wZXJ0eSIsInVuYXZhaWxhYmxlQWN0aW9uQW5ub3RhdGlvbiIsImdldFNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zIiwiYWN0aW9ucyIsInVuYXZhaWxhYmxlQWN0aW9uIiwiY3VzdG9tU2VtYW50aWNPYmplY3QiLCJpbmRleE9mIiwicGFyc2UiLCJwcm9wZXJ0eSIsInRhcmdldEVudGl0eVR5cGUiLCJyZWZlcmVudGlhbENvbnN0cmFpbnQiLCJzb21lIiwic291cmNlUHJvcGVydHkiLCJ0YXJnZXRUeXBlIiwiVUkiLCJRdWlja1ZpZXdGYWNldHMiLCJzZW1hbnRpY0tleXMiLCJTZW1hbnRpY0tleSIsImlzUHJvcGVydHlTZW1hbnRpY0tleSIsInNlbWFudGljS2V5IiwiJHRhcmdldCIsImxhc3ROYXZQcm9wIiwiaXNLZXkiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlF1aWNrVmlldy5tZXRhZGF0YS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBbm5vdGF0aW9uVGVybSwgTmF2aWdhdGlvblByb3BlcnR5LCBQcm9wZXJ0eSB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlc1wiO1xuaW1wb3J0ICogYXMgRWRtIGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy9FZG1cIjtcbmltcG9ydCB7IENvbW1vbkFubm90YXRpb25UZXJtcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvQ29tbW9uXCI7XG5pbXBvcnQgKiBhcyBNZXRhTW9kZWxDb252ZXJ0ZXIgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvTWV0YU1vZGVsQ29udmVydGVyXCI7XG5pbXBvcnQge1xuXHRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24sXG5cdENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uLFxuXHRjb21waWxlRXhwcmVzc2lvbixcblx0Z2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uLFxuXHRwYXRoSW5Nb2RlbFxufSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IHR5cGUgeyBEYXRhTW9kZWxPYmplY3RQYXRoIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRGF0YU1vZGVsUGF0aEhlbHBlclwiO1xuaW1wb3J0IHsgaXNQcm9wZXJ0eSB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL1Byb3BlcnR5SGVscGVyXCI7XG5pbXBvcnQge1xuXHRnZXREeW5hbWljUGF0aEZyb21TZW1hbnRpY09iamVjdCxcblx0Z2V0U2VtYW50aWNPYmplY3RNYXBwaW5ncyxcblx0Z2V0U2VtYW50aWNPYmplY3RzLFxuXHRnZXRTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucyxcblx0aGFzU2VtYW50aWNPYmplY3Rcbn0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvU2VtYW50aWNPYmplY3RIZWxwZXJcIjtcbmltcG9ydCB0eXBlIHsgU2VtYW50aWNPYmplY3RDdXN0b21EYXRhIH0gZnJvbSBcInNhcC9mZS9tYWNyb3MvZmllbGQvRmllbGRUZW1wbGF0aW5nXCI7XG5pbXBvcnQgKiBhcyBGaWVsZFRlbXBsYXRpbmcgZnJvbSBcInNhcC9mZS9tYWNyb3MvZmllbGQvRmllbGRUZW1wbGF0aW5nXCI7XG5pbXBvcnQgeyBnZXREYXRhTW9kZWxPYmplY3RQYXRoRm9yVmFsdWUgfSBmcm9tIFwic2FwL2ZlL21hY3Jvcy9maWVsZC9GaWVsZFRlbXBsYXRpbmdcIjtcbmltcG9ydCBNYWNyb01ldGFkYXRhIGZyb20gXCJzYXAvZmUvbWFjcm9zL01hY3JvTWV0YWRhdGFcIjtcbmltcG9ydCB7XG5cdFJlZ2lzdGVyZWRQYXlsb2FkLFxuXHRSZWdpc3RlcmVkU2VtYW50aWNPYmplY3RNYXBwaW5nLFxuXHRSZWdpc3RlcmVkU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnNcbn0gZnJvbSBcInNhcC9mZS9tYWNyb3MvcXVpY2tWaWV3L1F1aWNrVmlld0RlbGVnYXRlXCI7XG5cbmNvbnN0IFF1aWNrVmlldyA9IE1hY3JvTWV0YWRhdGEuZXh0ZW5kKFwic2FwLmZlLm1hY3Jvcy5xdWlja1ZpZXcuUXVpY2tWaWV3XCIsIHtcblx0LyoqXG5cdCAqIE5hbWUgb2YgdGhlIGJ1aWxkaW5nIGJsb2NrIGNvbnRyb2wuXG5cdCAqL1xuXHRuYW1lOiBcIlF1aWNrVmlld1wiLFxuXHQvKipcblx0ICpcblx0ICogTmFtZXNwYWNlIG9mIHRoZSBidWlsZGluZyBibG9jayBjb250cm9sXG5cdCAqL1xuXHRuYW1lc3BhY2U6IFwic2FwLmZlLm1hY3Jvc1wiLFxuXHQvKipcblx0ICogRnJhZ21lbnQgc291cmNlIG9mIHRoZSBidWlsZGluZyBibG9jayAob3B0aW9uYWwpIC0gaWYgbm90IHNldCwgZnJhZ21lbnQgaXMgZ2VuZXJhdGVkIGZyb20gbmFtZXNwYWNlIGFuZCBuYW1lXG5cdCAqL1xuXHRmcmFnbWVudDogXCJzYXAuZmUubWFjcm9zLnF1aWNrVmlldy5RdWlja1ZpZXdcIixcblx0LyoqXG5cdCAqIFRoZSBtZXRhZGF0YSBkZXNjcmliaW5nIHRoZSBidWlsZGluZyBibG9jayBjb250cm9sLlxuXHQgKi9cblx0bWV0YWRhdGE6IHtcblx0XHQvKipcblx0XHQgKiBEZWZpbmUgYnVpbGRpbmcgYmxvY2sgc3RlcmVvdHlwZSBmb3IgZG9jdW1lbnRhdGlvblxuXHRcdCAqL1xuXHRcdHN0ZXJlb3R5cGU6IFwieG1sbWFjcm9cIixcblx0XHQvKipcblx0XHQgKiBMb2NhdGlvbiBvZiB0aGUgZGVzaWdudGltZSBpbmZvXG5cdFx0ICovXG5cdFx0ZGVzaWdudGltZTogXCJzYXAvZmUvbWFjcm9zL3F1aWNrVmlldy9RdWlja1ZpZXcuZGVzaWdudGltZVwiLFxuXHRcdC8qKlxuXHRcdCAqIFByb3BlcnRpZXMuXG5cdFx0ICovXG5cdFx0cHJvcGVydGllczoge1xuXHRcdFx0ZGF0YUZpZWxkOiB7XG5cdFx0XHRcdHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIixcblx0XHRcdFx0cmVxdWlyZWQ6IHRydWUsXG5cdFx0XHRcdCRraW5kOiBcIlByb3BlcnR5XCIsXG5cdFx0XHRcdCRUeXBlOiBbXG5cdFx0XHRcdFx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRcIixcblx0XHRcdFx0XHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZFdpdGhVcmxcIixcblx0XHRcdFx0XHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZEZvckFubm90YXRpb25cIixcblx0XHRcdFx0XHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFQb2ludFR5cGVcIlxuXHRcdFx0XHRdXG5cdFx0XHR9LFxuXHRcdFx0c2VtYW50aWNPYmplY3Q6IHtcblx0XHRcdFx0dHlwZTogXCJzdHJpbmdcIlxuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogTWV0YWRhdGEgcGF0aCB0byB0aGUgZW50aXR5IHNldFxuXHRcdFx0ICovXG5cdFx0XHRjb250ZXh0UGF0aDoge1xuXHRcdFx0XHR0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCIsXG5cdFx0XHRcdHJlcXVpcmVkOiBmYWxzZVxuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogQ29udGV4dCBwb2ludGluZyB0byBhbiBhcnJheSBvZiBrZXkgdmFsdWUgdGhhdCBpcyB1c2VkIGZvciBjdXN0b20gZGF0YSBnZW5lcmF0aW9uXG5cdFx0XHQgKi9cblx0XHRcdHNlbWFudGljT2JqZWN0c1RvUmVzb2x2ZToge1xuXHRcdFx0XHR0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCIsXG5cdFx0XHRcdHJlcXVpcmVkOiBmYWxzZSxcblx0XHRcdFx0Y29tcHV0ZWQ6IHRydWVcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0ZXZlbnRzOiB7fVxuXHR9LFxuXHRjcmVhdGU6IGZ1bmN0aW9uIChvUHJvcHM6IGFueSkge1xuXHRcdGxldCBvRGF0YU1vZGVsUGF0aCA9IE1ldGFNb2RlbENvbnZlcnRlci5nZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMob1Byb3BzLmRhdGFGaWVsZCwgb1Byb3BzLmNvbnRleHRQYXRoKTtcblx0XHRjb25zdCB2YWx1ZURhdGFNb2RlbFBhdGggPSBnZXREYXRhTW9kZWxPYmplY3RQYXRoRm9yVmFsdWUob0RhdGFNb2RlbFBhdGgpO1xuXHRcdG9EYXRhTW9kZWxQYXRoID0gdmFsdWVEYXRhTW9kZWxQYXRoIHx8IG9EYXRhTW9kZWxQYXRoO1xuXG5cdFx0Y29uc3QgdmFsdWVQcm9wZXJ0eSA9IG9EYXRhTW9kZWxQYXRoLnRhcmdldE9iamVjdDtcblx0XHRjb25zdCBoYXNRdWlja1ZpZXdGYWNldHMgPSB2YWx1ZVByb3BlcnR5XG5cdFx0XHQ/IEZpZWxkVGVtcGxhdGluZy5pc1VzZWRJbk5hdmlnYXRpb25XaXRoUXVpY2tWaWV3RmFjZXRzKG9EYXRhTW9kZWxQYXRoLCB2YWx1ZVByb3BlcnR5KSArIFwiXCJcblx0XHRcdDogXCJmYWxzZVwiO1xuXG5cdFx0Y29uc3QgY29tbW9uQW5ub3RhdGlvbnMgPSB2YWx1ZVByb3BlcnR5Py5hbm5vdGF0aW9ucz8uQ29tbW9uO1xuXHRcdC8vd2Ugd2lsbCBuZWVkIHRvIHBhc3MgdGhlIHJlbGF0aXZlTG9jYXRpb249Z2V0UmVsYXRpdmVQYXRocyhvRGF0YU1vZGVsUGF0aCk7IHRvIGZpZWxkVGVtcGxhdGluZyNnZXRTZW1hbnRpY09iamVjdEV4cHJlc3Npb25Ub1Jlc29sdmVcblxuXHRcdGNvbnN0IGFTZW1PYmpFeHByVG9SZXNvbHZlOiBTZW1hbnRpY09iamVjdEN1c3RvbURhdGFbXSA9IGNvbW1vbkFubm90YXRpb25zXG5cdFx0XHQ/IEZpZWxkVGVtcGxhdGluZy5nZXRTZW1hbnRpY09iamVjdEV4cHJlc3Npb25Ub1Jlc29sdmUoY29tbW9uQW5ub3RhdGlvbnMsIHRydWUpXG5cdFx0XHQ6IFtdO1xuXG5cdFx0Y29uc3QgcGF0aE9mRHluYW1pY1NlbWFudGljT2JqZWN0ID0gZ2V0RHluYW1pY1BhdGhGcm9tU2VtYW50aWNPYmplY3Qob1Byb3BzLnNlbWFudGljT2JqZWN0KTtcblx0XHRpZiAocGF0aE9mRHluYW1pY1NlbWFudGljT2JqZWN0KSB7XG5cdFx0XHRhU2VtT2JqRXhwclRvUmVzb2x2ZS5wdXNoKHtcblx0XHRcdFx0a2V5OiBwYXRoT2ZEeW5hbWljU2VtYW50aWNPYmplY3QsXG5cdFx0XHRcdHZhbHVlOiBvUHJvcHMuc2VtYW50aWNPYmplY3Rcblx0XHRcdH0pO1xuXHRcdH1cblx0XHRvUHJvcHMuc2VtYW50aWNPYmplY3RzVG9SZXNvbHZlID0gRmllbGRUZW1wbGF0aW5nLmdldFNlbWFudGljT2JqZWN0cyhhU2VtT2JqRXhwclRvUmVzb2x2ZSk7IC8vIHRoaXMgaXMgdXNlZCB2aWEgc2VtYW50aWNPYmplY3RzVG9SZXNvbHZlPlxuXHRcdGNvbnN0IHJlbGF0aXZlUGF0aFRvUXVpY2tWaWV3RW50aXR5ID0gdGhpcy5fZ2V0UmVsYXRpdmVQYXRoVG9RdWlja1ZpZXdFbnRpdHkob0RhdGFNb2RlbFBhdGgpO1xuXHRcdC8vIGl0IGNhbiBiZSB0aGF0IHRoZXJlIGlzIG5vIHRhcmdldEVudGl0eXNldCBmb3IgdGhlIGNvbnRleHQgbG9jYXRpb24gc28gd2UgdXNlIHRoZSB0YXJnZXRPYmplY3RGdWxseVF1YWxpZmllZE5hbWVcblx0XHRjb25zdCBxdWlja1ZpZXdFbnRpdHkgPSByZWxhdGl2ZVBhdGhUb1F1aWNrVmlld0VudGl0eVxuXHRcdFx0PyBgLyR7XG5cdFx0XHRcdFx0b0RhdGFNb2RlbFBhdGguY29udGV4dExvY2F0aW9uPy50YXJnZXRFbnRpdHlTZXQ/Lm5hbWUgfHxcblx0XHRcdFx0XHRvRGF0YU1vZGVsUGF0aC5jb250ZXh0TG9jYXRpb24/LnRhcmdldE9iamVjdD8uZnVsbHlRdWFsaWZpZWROYW1lXG5cdFx0XHQgIH0vJHtyZWxhdGl2ZVBhdGhUb1F1aWNrVmlld0VudGl0eX1gXG5cdFx0XHQ6IHVuZGVmaW5lZDtcblx0XHRjb25zdCBuYXZpZ2F0aW9uUGF0aCA9IHJlbGF0aXZlUGF0aFRvUXVpY2tWaWV3RW50aXR5ID8gY29tcGlsZUV4cHJlc3Npb24ocGF0aEluTW9kZWwocmVsYXRpdmVQYXRoVG9RdWlja1ZpZXdFbnRpdHkpKSA6IHVuZGVmaW5lZDtcblxuXHRcdGNvbnN0IHByb3BlcnR5V2l0aFNlbWFudGljT2JqZWN0ID0gdGhpcy5fZ2V0UHJvcGVydHlXaXRoU2VtYW50aWNPYmplY3Qob0RhdGFNb2RlbFBhdGgpO1xuXHRcdGxldCBtYWluU2VtYW50aWNPYmplY3Q7XG5cdFx0Y29uc3QgeyBzZW1hbnRpY09iamVjdHNMaXN0LCBxdWFsaWZpZXJNYXAgfSA9IHRoaXMuX2dldFNlbWFudGljT2JqZWN0c0ZvclBheWxvYWRBbmRRdWFsaWZpZXJNYXAocHJvcGVydHlXaXRoU2VtYW50aWNPYmplY3QpO1xuXHRcdGNvbnN0IHNlbWFudGljT2JqZWN0TWFwcGluZ3MgPSB0aGlzLl9nZXRTZW1hbnRpY09iamVjdE1hcHBpbmdzRm9yUGF5bG9hZChwcm9wZXJ0eVdpdGhTZW1hbnRpY09iamVjdCwgcXVhbGlmaWVyTWFwKTtcblx0XHRjb25zdCBzZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucyA9IHRoaXMuX2dldFNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zRm9yUGF5bG9hZChcblx0XHRcdHByb3BlcnR5V2l0aFNlbWFudGljT2JqZWN0LFxuXHRcdFx0cXVhbGlmaWVyTWFwXG5cdFx0KTtcblx0XHRpZiAoaXNQcm9wZXJ0eShwcm9wZXJ0eVdpdGhTZW1hbnRpY09iamVjdCkpIHtcblx0XHRcdC8vIFRPRE8gd2h5IHNob3VsZCB0aGlzIGJlIGRpZmZlcmVudCBmb3IgbmF2aWdhdGlvbjogd2hlbiB3ZSBhZGQgdGhpcyBzb21lIGxpbmtzIGRpc2FwcGVhclxuXHRcdFx0bWFpblNlbWFudGljT2JqZWN0ID0gcXVhbGlmaWVyTWFwW1wibWFpblwiXSB8fCBxdWFsaWZpZXJNYXBbXCJcIl07XG5cdFx0fVxuXHRcdHRoaXMuX2FkZEN1c3RvbVNlbWFudGljT2JqZWN0VG9TZW1hbnRpY09iamVjdExpc3RGb3JQYXlsb2FkKHNlbWFudGljT2JqZWN0c0xpc3QsIG9Qcm9wcy5zZW1hbnRpY09iamVjdCBhcyBzdHJpbmcgfCB1bmRlZmluZWQpO1xuXHRcdGNvbnN0IHByb3BlcnR5UGF0aExhYmVsID0gdmFsdWVQcm9wZXJ0eS5hbm5vdGF0aW9ucz8uQ29tbW9uPy5MYWJlbD8udmFsdWVPZigpIHx8IFwiXCI7XG5cblx0XHRjb25zdCBwYXlsb2FkOiBSZWdpc3RlcmVkUGF5bG9hZCA9IHtcblx0XHRcdHNlbWFudGljT2JqZWN0czogc2VtYW50aWNPYmplY3RzTGlzdCxcblx0XHRcdGVudGl0eVR5cGU6IHF1aWNrVmlld0VudGl0eSxcblx0XHRcdHNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zOiBzZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucyxcblx0XHRcdHNlbWFudGljT2JqZWN0TWFwcGluZ3M6IHNlbWFudGljT2JqZWN0TWFwcGluZ3MsXG5cdFx0XHRtYWluU2VtYW50aWNPYmplY3Q6IG1haW5TZW1hbnRpY09iamVjdCxcblx0XHRcdHByb3BlcnR5UGF0aExhYmVsOiBwcm9wZXJ0eVBhdGhMYWJlbCxcblx0XHRcdGRhdGFGaWVsZDogcXVpY2tWaWV3RW50aXR5ID09PSB1bmRlZmluZWQgPyBvUHJvcHMuZGF0YUZpZWxkLmdldFBhdGgoKSA6IHVuZGVmaW5lZCxcblx0XHRcdGNvbnRhY3Q6IHVuZGVmaW5lZCxcblx0XHRcdG5hdmlnYXRpb25QYXRoOiBuYXZpZ2F0aW9uUGF0aCxcblx0XHRcdGhhc1F1aWNrVmlld0ZhY2V0czogaGFzUXVpY2tWaWV3RmFjZXRzXG5cdFx0fTtcblx0XHRvUHJvcHMuZGVsZWdhdGVDb25maWd1cmF0aW9uID0gSlNPTi5zdHJpbmdpZnkoe1xuXHRcdFx0bmFtZTogXCJzYXAvZmUvbWFjcm9zL3F1aWNrVmlldy9RdWlja1ZpZXdEZWxlZ2F0ZVwiLFxuXHRcdFx0cGF5bG9hZDogcGF5bG9hZFxuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIG9Qcm9wcztcblx0fSxcblx0LyoqXG5cdCAqIEdldCB0aGUgcmVsYXRpdmUgcGF0aCB0byB0aGUgZW50aXR5IHdoaWNoIHF1aWNrIHZpZXcgRmFjZXRzIHdlIHdhbnQgdG8gZGlzcGxheS5cblx0ICpcblx0ICogQHBhcmFtIHByb3BlcnR5RGF0YU1vZGVsUGF0aFxuXHQgKiBAcmV0dXJucyBBIHBhdGggaWYgaXQgZXhpc3RzLlxuXHQgKi9cblx0X2dldFJlbGF0aXZlUGF0aFRvUXVpY2tWaWV3RW50aXR5OiBmdW5jdGlvbiAocHJvcGVydHlEYXRhTW9kZWxQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0XHRsZXQgcmVsYXRpdmVQYXRoVG9RdWlja1ZpZXdFbnRpdHk6IHN0cmluZyB8IHVuZGVmaW5lZDtcblx0XHRjb25zdCBxdWlja1ZpZXdOYXZQcm9wID0gdGhpcy5fZ2V0TmF2UHJvcFRvUXVpY2tWaWV3RW50aXR5KHByb3BlcnR5RGF0YU1vZGVsUGF0aCk7XG5cdFx0aWYgKHF1aWNrVmlld05hdlByb3ApIHtcblx0XHRcdHJlbGF0aXZlUGF0aFRvUXVpY2tWaWV3RW50aXR5ID0gcHJvcGVydHlEYXRhTW9kZWxQYXRoLm5hdmlnYXRpb25Qcm9wZXJ0aWVzLnJlZHVjZSgocmVsYXRpdlBhdGg6IHN0cmluZywgbmF2UHJvcCkgPT4ge1xuXHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0bmF2UHJvcC5uYW1lICE9PSBxdWlja1ZpZXdOYXZQcm9wLm5hbWUgJiZcblx0XHRcdFx0XHQhcHJvcGVydHlEYXRhTW9kZWxQYXRoLmNvbnRleHRMb2NhdGlvbj8ubmF2aWdhdGlvblByb3BlcnRpZXMuZmluZChcblx0XHRcdFx0XHRcdChjb250ZXh0TmF2UHJvcCkgPT4gY29udGV4dE5hdlByb3AubmFtZSA9PT0gbmF2UHJvcC5uYW1lXG5cdFx0XHRcdFx0KVxuXHRcdFx0XHQpIHtcblx0XHRcdFx0XHQvLyB3ZSBrZWVwIG9ubHkgbmF2UHJvcGVydGllcyB0aGF0IGFyZSBwYXJ0IG9mIHRoZSByZWxhdGl2ZVBhdGggYW5kIG5vdCB0aGUgb25lIGZvciBxdWlja1ZpZXdOYXZQcm9wXG5cdFx0XHRcdFx0cmV0dXJuIGAke3JlbGF0aXZQYXRofSR7bmF2UHJvcC5uYW1lfS9gO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiByZWxhdGl2UGF0aDtcblx0XHRcdH0sIFwiXCIpO1xuXHRcdFx0cmVsYXRpdmVQYXRoVG9RdWlja1ZpZXdFbnRpdHkgPSBgJHtyZWxhdGl2ZVBhdGhUb1F1aWNrVmlld0VudGl0eX0ke3F1aWNrVmlld05hdlByb3AubmFtZX1gO1xuXHRcdH1cblx0XHRyZXR1cm4gcmVsYXRpdmVQYXRoVG9RdWlja1ZpZXdFbnRpdHk7XG5cdH0sXG5cdC8qKlxuXHQgKiBHZXQgdGhlIHByb3BlcnR5IG9yIHRoZSBuYXZpZ2F0aW9uIHByb3BlcnR5IGluICBpdHMgcmVsYXRpdmUgcGF0aCB0aGF0IGhvbGRzIHNlbWFudGljT2JqZWN0IGFubm90YXRpb24gaWYgaXQgZXhpc3RzLlxuXHQgKlxuXHQgKiBAcGFyYW0gZGF0YU1vZGVsT2JqZWN0UGF0aFxuXHQgKiBAcmV0dXJucyBBIHByb3BlcnR5IG9yIGEgTmF2UHJvcGVydHkgb3IgdW5kZWZpbmVkXG5cdCAqL1xuXHRfZ2V0UHJvcGVydHlXaXRoU2VtYW50aWNPYmplY3Q6IGZ1bmN0aW9uIChkYXRhTW9kZWxPYmplY3RQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoKSB7XG5cdFx0bGV0IHByb3BlcnR5V2l0aFNlbWFudGljT2JqZWN0OiBQcm9wZXJ0eSB8IE5hdmlnYXRpb25Qcm9wZXJ0eSB8IHVuZGVmaW5lZDtcblx0XHRpZiAoaGFzU2VtYW50aWNPYmplY3QoZGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QpKSB7XG5cdFx0XHRwcm9wZXJ0eVdpdGhTZW1hbnRpY09iamVjdCA9IGRhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0O1xuXHRcdH0gZWxzZSBpZiAoZGF0YU1vZGVsT2JqZWN0UGF0aC5uYXZpZ2F0aW9uUHJvcGVydGllcy5sZW5ndGggPiAwKSB7XG5cdFx0XHQvLyB0aGVyZSBhcmUgbm8gc2VtYW50aWMgb2JqZWN0cyBvbiB0aGUgcHJvcGVydHkgaXRzZWxmIHNvIHdlIGxvb2sgZm9yIHNvbWUgb24gbmF2IHByb3BlcnRpZXNcblx0XHRcdGZvciAoY29uc3QgbmF2UHJvcGVydHkgb2YgZGF0YU1vZGVsT2JqZWN0UGF0aC5uYXZpZ2F0aW9uUHJvcGVydGllcykge1xuXHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0IWRhdGFNb2RlbE9iamVjdFBhdGguY29udGV4dExvY2F0aW9uPy5uYXZpZ2F0aW9uUHJvcGVydGllcy5maW5kKFxuXHRcdFx0XHRcdFx0KGNvbnRleHROYXZQcm9wKSA9PiBjb250ZXh0TmF2UHJvcC5mdWxseVF1YWxpZmllZE5hbWUgPT09IG5hdlByb3BlcnR5LmZ1bGx5UXVhbGlmaWVkTmFtZVxuXHRcdFx0XHRcdCkgJiZcblx0XHRcdFx0XHQhcHJvcGVydHlXaXRoU2VtYW50aWNPYmplY3QgJiZcblx0XHRcdFx0XHRoYXNTZW1hbnRpY09iamVjdChuYXZQcm9wZXJ0eSlcblx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0cHJvcGVydHlXaXRoU2VtYW50aWNPYmplY3QgPSBuYXZQcm9wZXJ0eTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gcHJvcGVydHlXaXRoU2VtYW50aWNPYmplY3Q7XG5cdH0sXG5cdC8qKlxuXHQgKiBHZXQgdGhlIHNlbWFudGljT2JqZWN0IGNvbXBpbGUgYmlkaW5nIGZyb20gbWV0YWRhdGEgYW5kIGEgbWFwIHRvIHRoZSBxdWFsaWZpZXJzLlxuXHQgKlxuXHQgKiBAcGFyYW0gcHJvcGVydHlXaXRoU2VtYW50aWNPYmplY3QgVGhlIHByb3BlcnR5IHRoYXQgaG9sZHMgc2VtYW50aWNPYmplY3QgYW5ub3RhdGFpb25zIGlmIGl0IGV4aXN0c1xuXHQgKiBAcmV0dXJucyBBbiBvYmplY3QgY29udGFpbmluZyBzZW1hbnRpY09iamVjdExpc3QgYW5kIHF1YWxpZmllck1hcFxuXHQgKi9cblx0X2dldFNlbWFudGljT2JqZWN0c0ZvclBheWxvYWRBbmRRdWFsaWZpZXJNYXA6IGZ1bmN0aW9uIChwcm9wZXJ0eVdpdGhTZW1hbnRpY09iamVjdDogUHJvcGVydHkgfCBOYXZpZ2F0aW9uUHJvcGVydHkgfCB1bmRlZmluZWQpIHtcblx0XHRjb25zdCBxdWFsaWZpZXJNYXA6IHsgW2tleTogc3RyaW5nXTogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24gfSA9IHt9O1xuXHRcdGNvbnN0IHNlbWFudGljT2JqZWN0c0xpc3Q6IHN0cmluZ1tdID0gW107XG5cdFx0aWYgKHByb3BlcnR5V2l0aFNlbWFudGljT2JqZWN0ICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdGZvciAoY29uc3Qgc2VtYW50aWNPYmplY3Qgb2YgZ2V0U2VtYW50aWNPYmplY3RzKHByb3BlcnR5V2l0aFNlbWFudGljT2JqZWN0KSkge1xuXHRcdFx0XHRjb25zdCBjb21waWxlZFNlbWFudGljT2JqZWN0ID0gY29tcGlsZUV4cHJlc3Npb24oXG5cdFx0XHRcdFx0Z2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKHNlbWFudGljT2JqZWN0KSBhcyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248c3RyaW5nPlxuXHRcdFx0XHQpO1xuXHRcdFx0XHQvLyB0aGlzIHNob3VsZCBub3QgaGFwcGVuLCBidXQgd2UgbWFrZSBzdXJlIG5vdCB0byBhZGQgdHdpY2UgdGhlIHNlbWFudGljT2JqZWN0IG90aGVyd2lzZSB0aGUgbWRjTGluayBjcmFzaGVzXG5cdFx0XHRcdGlmIChjb21waWxlZFNlbWFudGljT2JqZWN0ICYmICFzZW1hbnRpY09iamVjdHNMaXN0LmluY2x1ZGVzKGNvbXBpbGVkU2VtYW50aWNPYmplY3QpKSB7XG5cdFx0XHRcdFx0cXVhbGlmaWVyTWFwW3NlbWFudGljT2JqZWN0LnF1YWxpZmllciB8fCBcIlwiXSA9IGNvbXBpbGVkU2VtYW50aWNPYmplY3Q7XG5cdFx0XHRcdFx0c2VtYW50aWNPYmplY3RzTGlzdC5wdXNoKGNvbXBpbGVkU2VtYW50aWNPYmplY3QpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiB7IHNlbWFudGljT2JqZWN0c0xpc3QsIHF1YWxpZmllck1hcCB9O1xuXHR9LFxuXHQvKipcblx0ICogR2V0IHRoZSBzZW1hbnRpY09iamVjdE1hcHBpbmdzIGZyb20gbWV0YWRhdGEgaW4gdGhlIHBheWxvYWQgZXhwZWN0ZWQgc3RydWN0dXJlLlxuXHQgKlxuXHQgKiBAcGFyYW0gcHJvcGVydHlXaXRoU2VtYW50aWNPYmplY3Rcblx0ICogQHBhcmFtIHF1YWxpZmllck1hcFxuXHQgKiBAcmV0dXJucyBBIHBheWxvYWQgc3RydWN0dXJlIGZvciBzZW1hbnRpY09iamVjdE1hcHBpbmdzXG5cdCAqL1xuXHRfZ2V0U2VtYW50aWNPYmplY3RNYXBwaW5nc0ZvclBheWxvYWQ6IGZ1bmN0aW9uIChcblx0XHRwcm9wZXJ0eVdpdGhTZW1hbnRpY09iamVjdDogUHJvcGVydHkgfCBOYXZpZ2F0aW9uUHJvcGVydHkgfCB1bmRlZmluZWQsXG5cdFx0cXVhbGlmaWVyTWFwOiB7IFtrZXk6IHN0cmluZ106IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIH1cblx0KSB7XG5cdFx0Y29uc3Qgc2VtYW50aWNPYmplY3RNYXBwaW5nczogUmVnaXN0ZXJlZFNlbWFudGljT2JqZWN0TWFwcGluZ1tdID0gW107XG5cdFx0aWYgKHByb3BlcnR5V2l0aFNlbWFudGljT2JqZWN0ICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdGZvciAoY29uc3Qgc2VtYW50aWNPYmplY3RNYXBwaW5nIG9mIGdldFNlbWFudGljT2JqZWN0TWFwcGluZ3MocHJvcGVydHlXaXRoU2VtYW50aWNPYmplY3QpKSB7XG5cdFx0XHRcdGNvbnN0IGNvcnJlc3BvbmRpbmdTZW1hbnRpY09iamVjdCA9IHF1YWxpZmllck1hcFtzZW1hbnRpY09iamVjdE1hcHBpbmcucXVhbGlmaWVyIHx8IFwiXCJdO1xuXHRcdFx0XHRpZiAoY29ycmVzcG9uZGluZ1NlbWFudGljT2JqZWN0KSB7XG5cdFx0XHRcdFx0c2VtYW50aWNPYmplY3RNYXBwaW5ncy5wdXNoKHtcblx0XHRcdFx0XHRcdHNlbWFudGljT2JqZWN0OiBjb3JyZXNwb25kaW5nU2VtYW50aWNPYmplY3QsXG5cdFx0XHRcdFx0XHRpdGVtczogc2VtYW50aWNPYmplY3RNYXBwaW5nLm1hcCgoc2VtYW50aWNPYmplY3RNYXBwaW5nVHlwZSkgPT4ge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0XHRcdGtleTogc2VtYW50aWNPYmplY3RNYXBwaW5nVHlwZS5Mb2NhbFByb3BlcnR5LnZhbHVlLFxuXHRcdFx0XHRcdFx0XHRcdHZhbHVlOiBzZW1hbnRpY09iamVjdE1hcHBpbmdUeXBlLlNlbWFudGljT2JqZWN0UHJvcGVydHkudmFsdWVPZigpIGFzIHN0cmluZ1xuXHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gc2VtYW50aWNPYmplY3RNYXBwaW5ncztcblx0fSxcblx0LyoqXG5cdCAqIEdldCB0aGUgc2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMgZnJvbSBtZXRhZGF0YSBpbiB0aGUgcGF5bG9hZCBleHBlY3RlZCBzdHJ1Y3R1cmUuXG5cdCAqXG5cdCAqIEBwYXJhbSBwcm9wZXJ0eVdpdGhTZW1hbnRpY09iamVjdFxuXHQgKiBAcGFyYW0gcXVhbGlmaWVyTWFwXG5cdCAqIEByZXR1cm5zIEEgcGF5bG9hZCBzdHJ1Y3R1cmUgZm9yIHNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zXG5cdCAqL1xuXHRfZ2V0U2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnNGb3JQYXlsb2FkOiBmdW5jdGlvbiAoXG5cdFx0cHJvcGVydHlXaXRoU2VtYW50aWNPYmplY3Q6IFByb3BlcnR5IHwgTmF2aWdhdGlvblByb3BlcnR5IHwgdW5kZWZpbmVkLFxuXHRcdHF1YWxpZmllck1hcDogeyBba2V5OiBzdHJpbmddOiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB9XG5cdCkge1xuXHRcdGNvbnN0IHNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zOiBSZWdpc3RlcmVkU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMgPSBbXTtcblx0XHRpZiAocHJvcGVydHlXaXRoU2VtYW50aWNPYmplY3QgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Zm9yIChjb25zdCB1bmF2YWlsYWJsZUFjdGlvbkFubm90YXRpb24gb2YgZ2V0U2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMocHJvcGVydHlXaXRoU2VtYW50aWNPYmplY3QpIGFzICh7XG5cdFx0XHRcdHRlcm06IENvbW1vbkFubm90YXRpb25UZXJtcy5TZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucztcblx0XHRcdH0gJiBBbm5vdGF0aW9uVGVybTxFZG0uU3RyaW5nW10+KVtdKSB7XG5cdFx0XHRcdGNvbnN0IGNvcnJlc3BvbmRpbmdTZW1hbnRpY09iamVjdCA9IHF1YWxpZmllck1hcFt1bmF2YWlsYWJsZUFjdGlvbkFubm90YXRpb24ucXVhbGlmaWVyIHx8IFwiXCJdO1xuXHRcdFx0XHRpZiAoY29ycmVzcG9uZGluZ1NlbWFudGljT2JqZWN0KSB7XG5cdFx0XHRcdFx0c2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMucHVzaCh7XG5cdFx0XHRcdFx0XHRzZW1hbnRpY09iamVjdDogY29ycmVzcG9uZGluZ1NlbWFudGljT2JqZWN0LFxuXHRcdFx0XHRcdFx0YWN0aW9uczogdW5hdmFpbGFibGVBY3Rpb25Bbm5vdGF0aW9uLm1hcCgodW5hdmFpbGFibGVBY3Rpb24pID0+IHVuYXZhaWxhYmxlQWN0aW9uIGFzIHN0cmluZylcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gc2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnM7XG5cdH0sXG5cdC8qKlxuXHQgKiBBZGQgY3VzdG9tT2JqZWN0KHMpIHRvIHRoZSBzZW1hbnRpY09iamVjdCBsaXN0IGZvciB0aGUgcGF5bG9hZCBpZiBpdCBleGlzdHMuXG5cdCAqXG5cdCAqIEBwYXJhbSBzZW1hbnRpY09iamVjdHNMaXN0XG5cdCAqIEBwYXJhbSBjdXN0b21TZW1hbnRpY09iamVjdFxuXHQgKi9cblx0X2FkZEN1c3RvbVNlbWFudGljT2JqZWN0VG9TZW1hbnRpY09iamVjdExpc3RGb3JQYXlsb2FkOiBmdW5jdGlvbiAoXG5cdFx0c2VtYW50aWNPYmplY3RzTGlzdDogc3RyaW5nW10sXG5cdFx0Y3VzdG9tU2VtYW50aWNPYmplY3Q6IHN0cmluZyB8IHVuZGVmaW5lZFxuXHQpOiB2b2lkIHtcblx0XHRpZiAoY3VzdG9tU2VtYW50aWNPYmplY3QpIHtcblx0XHRcdC8vIHRoZSBjdXN0b20gc2VtYW50aWMgb2JqZWN0cyBhcmUgZWl0aGVyIGEgc2luZ2xlIHN0cmluZy9rZXkgdG8gY3VzdG9tIGRhdGEgb3IgYSBzdHJpbmdpZmllZCBhcnJheVxuXHRcdFx0aWYgKGN1c3RvbVNlbWFudGljT2JqZWN0WzBdICE9PSBcIltcIikge1xuXHRcdFx0XHQvLyBjdXN0b21TZW1hbnRpY09iamVjdCA9IFwic2VtYW50aWNPYmplY3RcIiB8IFwie3BhdGhJbk1vZGVsfVwiXG5cdFx0XHRcdGlmIChzZW1hbnRpY09iamVjdHNMaXN0LmluZGV4T2YoY3VzdG9tU2VtYW50aWNPYmplY3QpID09PSAtMSkge1xuXHRcdFx0XHRcdHNlbWFudGljT2JqZWN0c0xpc3QucHVzaChjdXN0b21TZW1hbnRpY09iamVjdCk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIGN1c3RvbVNlbWFudGljT2JqZWN0ID0gJ1tcInNlbWFudGljT2JqZWN0MVwiLFwic2VtYW50aWNPYmplY3QyXCJdJ1xuXHRcdFx0XHRmb3IgKGNvbnN0IHNlbWFudGljT2JqZWN0IG9mIEpTT04ucGFyc2UoY3VzdG9tU2VtYW50aWNPYmplY3QpKSB7XG5cdFx0XHRcdFx0aWYgKHNlbWFudGljT2JqZWN0c0xpc3QuaW5kZXhPZihzZW1hbnRpY09iamVjdCkgPT09IC0xKSB7XG5cdFx0XHRcdFx0XHRzZW1hbnRpY09iamVjdHNMaXN0LnB1c2goc2VtYW50aWNPYmplY3QpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0LyoqXG5cdCAqIEdldCB0aGUgbmF2aWdhdGlvblByb3BlcnR5IHRvIGFuIGVudGl0eSB3aXRoIFF1aWNrVmlld0ZhY2V0cyB0aGF0IGNhbiBiZSBsaW5rZWQgdG8gdGhlIHByb3BlcnR5LlxuXHQgKlxuXHQgKiBAcGFyYW0gcHJvcGVydHlEYXRhTW9kZWxQYXRoXG5cdCAqIEByZXR1cm5zIEEgbmF2aWdhdGlvbiBwcm9wZXJ0eSBpZiBpdCBleGlzdHMuXG5cdCAqL1xuXHRfZ2V0TmF2UHJvcFRvUXVpY2tWaWV3RW50aXR5OiBmdW5jdGlvbiAocHJvcGVydHlEYXRhTW9kZWxQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoKSB7XG5cdFx0Ly9UT0RPIHdlIHNob3VsZCBpbnZlc3RpZ2F0ZSB0byBwdXQgdGhpcyBjb2RlIGFzIGNvbW1vbiB3aXRoIEZpZWxkVGVtcGxhdGluZy5pc1VzZWRJbk5hdmlnYXRpb25XaXRoUXVpY2tWaWV3RmFjZXRzXG5cdFx0Y29uc3QgcHJvcGVydHkgPSBwcm9wZXJ0eURhdGFNb2RlbFBhdGgudGFyZ2V0T2JqZWN0IGFzIFByb3BlcnR5O1xuXHRcdGNvbnN0IG5hdmlnYXRpb25Qcm9wZXJ0aWVzID0gcHJvcGVydHlEYXRhTW9kZWxQYXRoLnRhcmdldEVudGl0eVR5cGUubmF2aWdhdGlvblByb3BlcnRpZXM7XG5cdFx0bGV0IHF1aWNrVmlld05hdlByb3AgPSBuYXZpZ2F0aW9uUHJvcGVydGllcy5maW5kKChuYXZQcm9wOiBOYXZpZ2F0aW9uUHJvcGVydHkpID0+IHtcblx0XHRcdHJldHVybiBuYXZQcm9wLnJlZmVyZW50aWFsQ29uc3RyYWludD8uc29tZSgocmVmZXJlbnRpYWxDb25zdHJhaW50KSA9PiB7XG5cdFx0XHRcdHJldHVybiByZWZlcmVudGlhbENvbnN0cmFpbnQ/LnNvdXJjZVByb3BlcnR5ID09PSBwcm9wZXJ0eS5uYW1lICYmIG5hdlByb3A/LnRhcmdldFR5cGU/LmFubm90YXRpb25zPy5VST8uUXVpY2tWaWV3RmFjZXRzO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdFx0aWYgKCFxdWlja1ZpZXdOYXZQcm9wICYmIHByb3BlcnR5RGF0YU1vZGVsUGF0aC5jb250ZXh0TG9jYXRpb24/LnRhcmdldEVudGl0eVNldCAhPT0gcHJvcGVydHlEYXRhTW9kZWxQYXRoLnRhcmdldEVudGl0eVNldCkge1xuXHRcdFx0Y29uc3Qgc2VtYW50aWNLZXlzID0gcHJvcGVydHlEYXRhTW9kZWxQYXRoPy50YXJnZXRFbnRpdHlUeXBlPy5hbm5vdGF0aW9ucz8uQ29tbW9uPy5TZW1hbnRpY0tleSB8fCBbXTtcblx0XHRcdGNvbnN0IGlzUHJvcGVydHlTZW1hbnRpY0tleSA9IHNlbWFudGljS2V5cy5zb21lKGZ1bmN0aW9uIChzZW1hbnRpY0tleSkge1xuXHRcdFx0XHRyZXR1cm4gc2VtYW50aWNLZXk/LiR0YXJnZXQ/Lm5hbWUgPT09IHByb3BlcnR5Lm5hbWU7XG5cdFx0XHR9KTtcblx0XHRcdGNvbnN0IGxhc3ROYXZQcm9wID0gcHJvcGVydHlEYXRhTW9kZWxQYXRoLm5hdmlnYXRpb25Qcm9wZXJ0aWVzW3Byb3BlcnR5RGF0YU1vZGVsUGF0aC5uYXZpZ2F0aW9uUHJvcGVydGllcy5sZW5ndGggLSAxXTtcblx0XHRcdGlmICgoaXNQcm9wZXJ0eVNlbWFudGljS2V5IHx8IHByb3BlcnR5LmlzS2V5KSAmJiBwcm9wZXJ0eURhdGFNb2RlbFBhdGg/LnRhcmdldEVudGl0eVR5cGU/LmFubm90YXRpb25zPy5VST8uUXVpY2tWaWV3RmFjZXRzKSB7XG5cdFx0XHRcdHF1aWNrVmlld05hdlByb3AgPSBsYXN0TmF2UHJvcCBhcyB1bmtub3duIGFzIE5hdmlnYXRpb25Qcm9wZXJ0eTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHF1aWNrVmlld05hdlByb3A7XG5cdH1cbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBRdWlja1ZpZXc7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7O0VBOEJBLE1BQU1BLFNBQVMsR0FBR0MsYUFBYSxDQUFDQyxNQUFNLENBQUMsbUNBQW1DLEVBQUU7SUFDM0U7QUFDRDtBQUNBO0lBQ0NDLElBQUksRUFBRSxXQUFXO0lBQ2pCO0FBQ0Q7QUFDQTtBQUNBO0lBQ0NDLFNBQVMsRUFBRSxlQUFlO0lBQzFCO0FBQ0Q7QUFDQTtJQUNDQyxRQUFRLEVBQUUsbUNBQW1DO0lBQzdDO0FBQ0Q7QUFDQTtJQUNDQyxRQUFRLEVBQUU7TUFDVDtBQUNGO0FBQ0E7TUFDRUMsVUFBVSxFQUFFLFVBQVU7TUFDdEI7QUFDRjtBQUNBO01BQ0VDLFVBQVUsRUFBRSw4Q0FBOEM7TUFDMUQ7QUFDRjtBQUNBO01BQ0VDLFVBQVUsRUFBRTtRQUNYQyxTQUFTLEVBQUU7VUFDVkMsSUFBSSxFQUFFLHNCQUFzQjtVQUM1QkMsUUFBUSxFQUFFLElBQUk7VUFDZEMsS0FBSyxFQUFFLFVBQVU7VUFDakJDLEtBQUssRUFBRSxDQUNOLHNDQUFzQyxFQUN0Qyw2Q0FBNkMsRUFDN0MsbURBQW1ELEVBQ25ELDBDQUEwQztRQUU1QyxDQUFDO1FBQ0RDLGNBQWMsRUFBRTtVQUNmSixJQUFJLEVBQUU7UUFDUCxDQUFDO1FBQ0Q7QUFDSDtBQUNBO1FBQ0dLLFdBQVcsRUFBRTtVQUNaTCxJQUFJLEVBQUUsc0JBQXNCO1VBQzVCQyxRQUFRLEVBQUU7UUFDWCxDQUFDO1FBQ0Q7QUFDSDtBQUNBO1FBQ0dLLHdCQUF3QixF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