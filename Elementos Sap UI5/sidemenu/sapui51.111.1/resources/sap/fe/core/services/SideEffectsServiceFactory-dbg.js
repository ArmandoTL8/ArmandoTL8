/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/converters/MetaModelConverter", "sap/ui/core/service/Service", "sap/ui/core/service/ServiceFactory", "../templating/PropertyHelper"], function (Log, MetaModelConverter, Service, ServiceFactory, PropertyHelper) {
  "use strict";

  var _exports = {};
  var isPathExpression = PropertyHelper.isPathExpression;
  var convertTypes = MetaModelConverter.convertTypes;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  let SideEffectsService = /*#__PURE__*/function (_Service) {
    _inheritsLoose(SideEffectsService, _Service);
    function SideEffectsService() {
      return _Service.apply(this, arguments) || this;
    }
    _exports.SideEffectsService = SideEffectsService;
    var _proto = SideEffectsService.prototype;
    // !: means that we know it will be assigned before usage
    _proto.init = function init() {
      this._oSideEffectsType = {
        oData: {
          entities: {},
          actions: {}
        },
        control: {}
      };
      this._bInitialized = false;
      this.initPromise = Promise.resolve(this);
    }

    /**
     * Adds a SideEffects control
     * SideEffects definition is added by a control to keep data up to date
     * These SideEffects get limited scope compared with SideEffects coming from an OData service:
     * - Only one SideEffects definition can be defined for the combination entity type - control Id
     * - Only SideEffects source properties are recognized and used to trigger SideEffects
     *
     * Ensure the sourceControlId matches the associated SAPUI5 control ID.
     *
     * @private
     * @ui5-restricted
     * @param sEntityType Name of the entity type
     * @param oSideEffect SideEffects definition
     */;
    _proto.addControlSideEffects = function addControlSideEffects(sEntityType, oSideEffect) {
      if (oSideEffect.sourceControlId) {
        const oControlSideEffect = {
          ...oSideEffect,
          fullyQualifiedName: `${sEntityType}/SideEffectsForControl/${oSideEffect.sourceControlId}`
        };
        const mEntityControlSideEffects = this._oSideEffectsType.control[sEntityType] || {};
        mEntityControlSideEffects[oControlSideEffect.sourceControlId] = oControlSideEffect;
        this._oSideEffectsType.control[sEntityType] = mEntityControlSideEffects;
      }
    }

    /**
     * Executes SideEffects action.
     *
     * @private
     * @ui5-restricted
     * @param sTriggerAction Name of the action
     * @param oContext Context
     * @param sGroupId The group ID to be used for the request
     * @returns A promise that is resolved without data or with a return value context when the action call succeeded
     */;
    _proto.executeAction = function executeAction(sTriggerAction, oContext, sGroupId) {
      const oTriggerAction = oContext.getModel().bindContext(`${sTriggerAction}(...)`, oContext);
      return oTriggerAction.execute(sGroupId || oContext.getBinding().getUpdateGroupId());
    }

    /**
     * Gets converted OData metaModel.
     *
     * @private
     * @ui5-restricted
     * @returns Converted OData metaModel
     */;
    _proto.getConvertedMetaModel = function getConvertedMetaModel() {
      const oContext = this.getContext();
      const oComponent = oContext.scopeObject;
      const oMetaModel = oComponent.getModel().getMetaModel();
      return convertTypes(oMetaModel, this._oCapabilities);
    }

    /**
     * Gets the entity type of a context.
     *
     * @function
     * @name getEntityTypeFromContext
     * @param oContext Context
     * @returns Entity Type
     */;
    _proto.getEntityTypeFromContext = function getEntityTypeFromContext(oContext) {
      const oMetaModel = oContext.getModel().getMetaModel(),
        sMetaPath = oMetaModel.getMetaPath(oContext.getPath()),
        sEntityType = oMetaModel.getObject(sMetaPath)["$Type"];
      return sEntityType;
    }

    /**
     * Gets the SideEffects that come from an OData service.
     *
     * @private
     * @ui5-restricted
     * @param sEntityTypeName Name of the entity type
     * @returns SideEffects dictionary
     */;
    _proto.getODataEntitySideEffects = function getODataEntitySideEffects(sEntityTypeName) {
      return this._oSideEffectsType.oData.entities[sEntityTypeName] || {};
    }

    /**
     * Gets the global SideEffects that come from an OData service.
     *
     * @private
     * @ui5-restricted
     * @param sEntityTypeName Name of the entity type
     * @returns Global SideEffects
     */;
    _proto.getGlobalODataEntitySideEffects = function getGlobalODataEntitySideEffects(sEntityTypeName) {
      const mEntitySideEffects = this.getODataEntitySideEffects(sEntityTypeName);
      const aGlobalSideEffects = [];
      for (const key in mEntitySideEffects) {
        const oEntitySideEffects = mEntitySideEffects[key];
        if (!oEntitySideEffects.SourceEntities && !oEntitySideEffects.SourceProperties) {
          aGlobalSideEffects.push(oEntitySideEffects);
        }
      }
      return aGlobalSideEffects;
    }

    /**
     * Gets the SideEffects that come from an OData service.
     *
     * @private
     * @ui5-restricted
     * @param sActionName Name of the action
     * @param oContext Context
     * @returns SideEffects definition
     */;
    _proto.getODataActionSideEffects = function getODataActionSideEffects(sActionName, oContext) {
      if (oContext) {
        const sEntityType = this.getEntityTypeFromContext(oContext);
        if (sEntityType) {
          var _this$_oSideEffectsTy;
          return (_this$_oSideEffectsTy = this._oSideEffectsType.oData.actions[sEntityType]) === null || _this$_oSideEffectsTy === void 0 ? void 0 : _this$_oSideEffectsTy[sActionName];
        }
      }
      return undefined;
    }

    /**
     * Generates the dictionary for the SideEffects.
     *
     * @private
     * @ui5-restricted
     * @param oCapabilities The current capabilities
     */;
    _proto.initializeSideEffects = function initializeSideEffects(oCapabilities) {
      this._oCapabilities = oCapabilities;
      if (!this._bInitialized) {
        const oConvertedMetaModel = this.getConvertedMetaModel();
        oConvertedMetaModel.entityTypes.forEach(entityType => {
          this._oSideEffectsType.oData.entities[entityType.fullyQualifiedName] = this._retrieveODataEntitySideEffects(entityType);
          this._oSideEffectsType.oData.actions[entityType.fullyQualifiedName] = this._retrieveODataActionsSideEffects(entityType); // only bound actions are analyzed since unbound ones don't get SideEffects
        });

        this._bInitialized = true;
      }
    }

    /**
     * Removes all SideEffects related to a control.
     *
     * @private
     * @ui5-restricted
     * @param sControlId Control Id
     */;
    _proto.removeControlSideEffects = function removeControlSideEffects(sControlId) {
      Object.keys(this._oSideEffectsType.control).forEach(sEntityType => {
        if (this._oSideEffectsType.control[sEntityType][sControlId]) {
          delete this._oSideEffectsType.control[sEntityType][sControlId];
        }
      });
    }

    /**
     * Request SideEffects on a specific context.
     *
     * @function
     * @name requestSideEffects
     * @param aPathExpressions Targets of SideEffects to be executed
     * @param oContext Context where SideEffects need to be executed
     * @param sGroupId The group ID to be used for the request
     * @returns Promise on SideEffects request
     */;
    _proto.requestSideEffects = async function requestSideEffects(aPathExpressions, oContext, sGroupId) {
      this._logRequest(aPathExpressions, oContext);
      return oContext.requestSideEffects(aPathExpressions, sGroupId);
    };
    _proto.requestSideEffectsForODataAction = function requestSideEffectsForODataAction(sideEffects, oContext) {
      var _sideEffects$triggerA, _sideEffects$pathExpr;
      let aPromises;
      if ((_sideEffects$triggerA = sideEffects.triggerActions) !== null && _sideEffects$triggerA !== void 0 && _sideEffects$triggerA.length) {
        aPromises = sideEffects.triggerActions.map(sTriggerActionName => {
          return this.executeAction(sTriggerActionName, oContext);
        });
      } else {
        aPromises = [];
      }
      if ((_sideEffects$pathExpr = sideEffects.pathExpressions) !== null && _sideEffects$pathExpr !== void 0 && _sideEffects$pathExpr.length) {
        aPromises.push(this.requestSideEffects(sideEffects.pathExpressions, oContext));
      }
      return aPromises.length ? Promise.all(aPromises) : Promise.resolve();
    }

    /**
     * Request SideEffects for a navigation property on a specific context.
     *
     * @function
     * @name requestSideEffectsForNavigationProperty
     * @param sNavigationProperty Navigation property
     * @param oContext Context where SideEffects need to be executed
     * @returns SideEffects request on SAPUI5 context
     */;
    _proto.requestSideEffectsForNavigationProperty = function requestSideEffectsForNavigationProperty(sNavigationProperty, oContext) {
      const sBaseEntityType = this.getEntityTypeFromContext(oContext);
      if (sBaseEntityType) {
        const sNavigationPath = `${sNavigationProperty}/`;
        const aSideEffects = this.getODataEntitySideEffects(sBaseEntityType);
        let targetProperties = [];
        let targetEntities = [];
        let sideEffectsTargets = [];
        Object.keys(aSideEffects).filter(
        // Keep relevant SideEffects
        sAnnotationName => {
          const oSideEffects = aSideEffects[sAnnotationName];
          return (oSideEffects.SourceProperties || []).some(oPropertyPath => {
            const sPropertyPath = oPropertyPath.value;
            return sPropertyPath.startsWith(sNavigationPath) && sPropertyPath.replace(sNavigationPath, "").indexOf("/") === -1;
          }) || (oSideEffects.SourceEntities || []).some(oNavigationPropertyPath => oNavigationPropertyPath.value === sNavigationProperty);
        }).forEach(sAnnotationName => {
          const oSideEffects = aSideEffects[sAnnotationName];
          if (oSideEffects.TriggerAction) {
            this.executeAction(oSideEffects.TriggerAction, oContext);
          }
          targetProperties = targetProperties.concat(oSideEffects.TargetProperties);
          targetEntities = targetEntities.concat(oSideEffects.TargetEntities);
        });
        // Remove duplicate targets
        const sideEffectsTargetDefinition = this._removeDuplicateTargets(targetProperties, targetEntities);
        sideEffectsTargets = [...sideEffectsTargetDefinition.TargetProperties, ...sideEffectsTargetDefinition.TargetEntities];
        if (sideEffectsTargets.length > 0) {
          return this.requestSideEffects(sideEffectsTargets, oContext).catch(oError => Log.error(`SideEffects - Error while processing SideEffects for Navigation Property ${sNavigationProperty}`, oError));
        }
      }
      return Promise.resolve();
    }

    /**
     * Gets the SideEffects that come from controls.
     *
     * @private
     * @ui5-restricted
     * @param sEntityTypeName Entity type Name
     * @returns SideEffects dictionary
     */;
    _proto.getControlEntitySideEffects = function getControlEntitySideEffects(sEntityTypeName) {
      return this._oSideEffectsType.control[sEntityTypeName] || {};
    }

    /**
     * Adds the text properties required for SideEffects
     * If a property has an associated text then this text needs to be added as targetProperties or targetEntities.
     *
     * @private
     * @ui5-restricted
     * @param oSideEffect SideEffects definition
     * @param mEntityType Entity type
     * @returns SideEffects definition with added text properties
     */;
    _proto._addRequiredTextProperties = function _addRequiredTextProperties(oSideEffect, mEntityType) {
      const aInitialProperties = oSideEffect.TargetProperties,
        aEntitiesRequested = oSideEffect.TargetEntities.map(navigation => navigation.$NavigationPropertyPath);
      let aDerivedProperties = [];
      aInitialProperties.forEach(sPropertyPath => {
        var _targetType;
        const bIsStarProperty = sPropertyPath.endsWith("*"),
          // Can be '*' or '.../navProp/*'
          sNavigationPropertyPath = sPropertyPath.substring(0, sPropertyPath.lastIndexOf("/")),
          sRelativePath = sNavigationPropertyPath ? `${sNavigationPropertyPath}/` : "",
          mTarget = mEntityType.resolvePath(sNavigationPropertyPath) || mEntityType;

        // mTarget can be an entity type, navigationProperty or or a complexType
        const aTargetEntityProperties = mTarget.entityProperties || ((_targetType = mTarget.targetType) === null || _targetType === void 0 ? void 0 : _targetType.properties) || mTarget.targetType.entityProperties;
        if (aTargetEntityProperties) {
          if (bIsStarProperty) {
            // Add all required properties behind the *
            aEntitiesRequested.push(sNavigationPropertyPath);
            aDerivedProperties = aDerivedProperties.concat(aTargetEntityProperties.map(mProperty => {
              return {
                navigationPath: sRelativePath,
                property: mProperty
              };
            }));
          } else {
            aDerivedProperties.push({
              property: aTargetEntityProperties.find(mProperty => mProperty.name === sPropertyPath.split("/").pop()),
              navigationPath: sRelativePath
            });
          }
        } else {
          Log.info(`SideEffects - The entity type associated to property path ${sPropertyPath} cannot be resolved`);
        }
      });
      aDerivedProperties.forEach(mPropertyInfo => {
        var _mPropertyInfo$proper, _mPropertyInfo$proper2, _mPropertyInfo$proper3;
        const textAnnotation = (_mPropertyInfo$proper = mPropertyInfo.property) === null || _mPropertyInfo$proper === void 0 ? void 0 : (_mPropertyInfo$proper2 = _mPropertyInfo$proper.annotations) === null || _mPropertyInfo$proper2 === void 0 ? void 0 : (_mPropertyInfo$proper3 = _mPropertyInfo$proper2.Common) === null || _mPropertyInfo$proper3 === void 0 ? void 0 : _mPropertyInfo$proper3.Text;
        if (textAnnotation && isPathExpression(textAnnotation)) {
          const sTargetTextPath = textAnnotation.path,
            sTextPathFromInitialEntity = mPropertyInfo.navigationPath + sTargetTextPath,
            sTargetCollectionPath = sTextPathFromInitialEntity.substring(0, sTextPathFromInitialEntity.lastIndexOf("/"));
          /**
           * The property Text must be added only if the property is
           * - not part of a star property (.i.e '*' or 'navigation/*') or a targeted Entity
           * - not include into the initial targeted properties of SideEffects
           *  Indeed in the two listed cases, the property containing text will be/is requested by initial SideEffects configuration.
           */

          if (sTargetTextPath && aEntitiesRequested.indexOf(sTargetCollectionPath) === -1 && aInitialProperties.indexOf(sTextPathFromInitialEntity) === -1) {
            var _mEntityType$resolveP;
            // The Text association is added as TargetEntities if it's contained on a different entitySet and not a complexType
            // Otherwise it's added as targetProperties
            if (sTargetTextPath.lastIndexOf("/") > -1 && ((_mEntityType$resolveP = mEntityType.resolvePath(sTargetCollectionPath)) === null || _mEntityType$resolveP === void 0 ? void 0 : _mEntityType$resolveP._type) === "NavigationProperty") {
              oSideEffect.TargetEntities.push({
                $NavigationPropertyPath: sTargetCollectionPath
              });
              aEntitiesRequested.push(sTargetCollectionPath);
            } else {
              oSideEffect.TargetProperties.push(sTextPathFromInitialEntity);
            }
          }
        }
      });
      return oSideEffect;
    }
    /**
     * Converts SideEffects to expected format
     *  - Converts SideEffects targets to expected format
     *  - Removes binding parameter from SideEffects targets properties
     *  - Adds the text properties
     *  - Replaces TargetProperties having reference to Source Properties for a SideEffects.
     *
     * @private
     * @ui5-restricted
     * @param oSideEffects SideEffects definition
     * @param mEntityType Entity type
     * @param sBindingParameter Name of the binding parameter
     * @returns SideEffects definition
     */;
    _proto._convertSideEffects = function _convertSideEffects(oSideEffects, mEntityType, sBindingParameter) {
      const oTempSideEffects = this._removeBindingParameter(this._convertTargetsFormat(oSideEffects), sBindingParameter);
      return this._addRequiredTextProperties(oTempSideEffects, mEntityType);
    }

    /**
     * Converts SideEffects targets (TargetEntities and TargetProperties) to expected format
     *  - TargetProperties as array of string
     *  - TargetEntities as array of object with property $NavigationPropertyPath.
     *
     * @private
     * @ui5-restricted
     * @param oSideEffects SideEffects definition
     * @returns Converted SideEffects
     */;
    _proto._convertTargetsFormat = function _convertTargetsFormat(oSideEffects) {
      const TargetProperties = (oSideEffects.TargetProperties || []).reduce((aTargetProperties, vTarget) => {
          const sTarget = vTarget.type && vTarget.value || vTarget;
          if (sTarget) {
            aTargetProperties.push(sTarget);
          } else {
            Log.error(`SideEffects - Error while processing TargetProperties for SideEffects${oSideEffects.fullyQualifiedName}`);
          }
          return aTargetProperties;
        }, []),
        TargetEntities = (oSideEffects.TargetEntities || []).map(mTargetEntity => {
          return {
            $NavigationPropertyPath: mTargetEntity.value || ""
          };
        });
      return {
        ...oSideEffects,
        ...{
          TargetProperties,
          TargetEntities
        }
      };
    }

    /**
     * Gets SideEffects related to an entity type or action that come from an OData Service
     * Internal routine to get, from converted oData metaModel, SideEffects related to a specific entity type or action
     * and to convert these SideEffects with expected format.
     *
     * @private
     * @ui5-restricted
     * @param oSource Entity type or action
     * @returns Array of SideEffects
     */;
    _proto._getSideEffectsFromSource = function _getSideEffectsFromSource(oSource) {
      const aSideEffects = [];
      const mEntityType = oSource._type === "EntityType" ? oSource : oSource.sourceEntityType;
      if (mEntityType) {
        var _oSource$annotations;
        const mCommonAnnotation = ((_oSource$annotations = oSource.annotations) === null || _oSource$annotations === void 0 ? void 0 : _oSource$annotations.Common) || {};
        const mBindingParameter = (oSource.parameters || []).find(mParameter => mParameter.type === mEntityType.fullyQualifiedName);
        const sBindingParameter = mBindingParameter ? mBindingParameter.fullyQualifiedName.split("/")[1] : "";
        Object.keys(mCommonAnnotation).filter(sAnnotationName => mCommonAnnotation[sAnnotationName].$Type === "com.sap.vocabularies.Common.v1.SideEffectsType").forEach(sAnnotationName => {
          aSideEffects.push(this._convertSideEffects(mCommonAnnotation[sAnnotationName], mEntityType, sBindingParameter));
        });
      }
      return aSideEffects;
    }

    /**
     * Logs SideEffects request.
     *
     * @private
     * @ui5-restricted
     * @param aPathExpressions SideEffects targets
     * @param oContext Context
     */;
    _proto._logRequest = function _logRequest(aPathExpressions, oContext) {
      const sTargetPaths = aPathExpressions.reduce(function (sPaths, mTarget) {
        return `${sPaths}\n\t\t${mTarget.$NavigationPropertyPath || mTarget || ""}`;
      }, "");
      Log.debug(`SideEffects - Request:\n\tContext path : ${oContext.getPath()}\n\tProperty paths :${sTargetPaths}`);
    }

    /**
     * Removes name of binding parameter on SideEffects targets.
     *
     * @private
     * @ui5-restricted
     * @param oSideEffects SideEffects definition
     * @param sBindingParameterName Name of binding parameter
     * @returns SideEffects definition
     */;
    _proto._removeBindingParameter = function _removeBindingParameter(oSideEffects, sBindingParameterName) {
      if (sBindingParameterName) {
        const replaceBindingParameter = function (value) {
          return value.replace(new RegExp(`^${sBindingParameterName}/?`), "");
        };
        oSideEffects.TargetProperties = oSideEffects.TargetProperties.map(targetProperty => replaceBindingParameter(targetProperty));
        oSideEffects.TargetEntities = oSideEffects.TargetEntities.map(targetEntity => {
          return {
            $NavigationPropertyPath: replaceBindingParameter(targetEntity.$NavigationPropertyPath)
          };
        });
      }
      return oSideEffects;
    }

    /**
     * Remove duplicates in SideEffects targets.
     *
     * @private
     * @ui5-restricted
     * @param targetProperties SideEffects TargetProperties
     * @param targetEntities SideEffects TargetEntities
     * @returns SideEffects targets without duplicates
     */;
    _proto._removeDuplicateTargets = function _removeDuplicateTargets(targetProperties, targetEntities) {
      const uniqueTargetedEntitiesPath = new Set([]);
      const uniqueTargetProperties = new Set(targetProperties);
      const uniqueTargetedEntities = targetEntities.filter(targetEntity => {
        const navigationPath = targetEntity.$NavigationPropertyPath;
        if (!uniqueTargetedEntitiesPath.has(navigationPath)) {
          uniqueTargetedEntitiesPath.add(navigationPath);
          return true;
        }
        return false;
      });
      return {
        TargetProperties: Array.from(uniqueTargetProperties),
        TargetEntities: uniqueTargetedEntities
      };
    }

    /**
     * Gets SideEffects action type that come from an OData Service
     * Internal routine to get, from converted oData metaModel, SideEffects on actions
     * related to a specific entity type and to convert these SideEffects with
     * expected format.
     *
     * @private
     * @ui5-restricted
     * @param entityType Entity type
     * @returns Entity type SideEffects dictionary
     */;
    _proto._retrieveODataActionsSideEffects = function _retrieveODataActionsSideEffects(entityType) {
      const sideEffects = {};
      const actions = entityType.actions;
      if (actions) {
        Object.keys(actions).forEach(actionName => {
          const action = entityType.actions[actionName];
          const triggerActions = new Set();
          let targetProperties = [];
          let targetEntities = [];
          this._getSideEffectsFromSource(action).forEach(oDataSideEffect => {
            const triggerAction = oDataSideEffect.TriggerAction;
            targetProperties = targetProperties.concat(oDataSideEffect.TargetProperties);
            targetEntities = targetEntities.concat(oDataSideEffect.TargetEntities);
            if (triggerAction) {
              triggerActions.add(triggerAction);
            }
          });
          const sideEffectsTargets = this._removeDuplicateTargets(targetProperties, targetEntities);
          sideEffects[actionName] = {
            pathExpressions: [...sideEffectsTargets.TargetProperties, ...sideEffectsTargets.TargetEntities],
            triggerActions: Array.from(triggerActions)
          };
        });
      }
      return sideEffects;
    }

    /**
     * Gets SideEffects entity type that come from an OData Service
     * Internal routine to get, from converted oData metaModel, SideEffects
     * related to a specific entity type and to convert these SideEffects with
     * expected format.
     *
     * @private
     * @ui5-restricted
     * @param mEntityType Entity type
     * @returns Entity type SideEffects dictionary
     */;
    _proto._retrieveODataEntitySideEffects = function _retrieveODataEntitySideEffects(mEntityType) {
      const oEntitySideEffects = {};
      this._getSideEffectsFromSource(mEntityType).forEach(oSideEffects => {
        oEntitySideEffects[oSideEffects.fullyQualifiedName] = oSideEffects;
      });
      return oEntitySideEffects;
    };
    _proto.getInterface = function getInterface() {
      return this;
    };
    return SideEffectsService;
  }(Service);
  _exports.SideEffectsService = SideEffectsService;
  let SideEffectsServiceFactory = /*#__PURE__*/function (_ServiceFactory) {
    _inheritsLoose(SideEffectsServiceFactory, _ServiceFactory);
    function SideEffectsServiceFactory() {
      return _ServiceFactory.apply(this, arguments) || this;
    }
    var _proto2 = SideEffectsServiceFactory.prototype;
    _proto2.createInstance = function createInstance(oServiceContext) {
      const SideEffectsServiceService = new SideEffectsService(oServiceContext);
      return SideEffectsServiceService.initPromise;
    };
    return SideEffectsServiceFactory;
  }(ServiceFactory);
  return SideEffectsServiceFactory;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaWRlRWZmZWN0c1NlcnZpY2UiLCJpbml0IiwiX29TaWRlRWZmZWN0c1R5cGUiLCJvRGF0YSIsImVudGl0aWVzIiwiYWN0aW9ucyIsImNvbnRyb2wiLCJfYkluaXRpYWxpemVkIiwiaW5pdFByb21pc2UiLCJQcm9taXNlIiwicmVzb2x2ZSIsImFkZENvbnRyb2xTaWRlRWZmZWN0cyIsInNFbnRpdHlUeXBlIiwib1NpZGVFZmZlY3QiLCJzb3VyY2VDb250cm9sSWQiLCJvQ29udHJvbFNpZGVFZmZlY3QiLCJmdWxseVF1YWxpZmllZE5hbWUiLCJtRW50aXR5Q29udHJvbFNpZGVFZmZlY3RzIiwiZXhlY3V0ZUFjdGlvbiIsInNUcmlnZ2VyQWN0aW9uIiwib0NvbnRleHQiLCJzR3JvdXBJZCIsIm9UcmlnZ2VyQWN0aW9uIiwiZ2V0TW9kZWwiLCJiaW5kQ29udGV4dCIsImV4ZWN1dGUiLCJnZXRCaW5kaW5nIiwiZ2V0VXBkYXRlR3JvdXBJZCIsImdldENvbnZlcnRlZE1ldGFNb2RlbCIsImdldENvbnRleHQiLCJvQ29tcG9uZW50Iiwic2NvcGVPYmplY3QiLCJvTWV0YU1vZGVsIiwiZ2V0TWV0YU1vZGVsIiwiY29udmVydFR5cGVzIiwiX29DYXBhYmlsaXRpZXMiLCJnZXRFbnRpdHlUeXBlRnJvbUNvbnRleHQiLCJzTWV0YVBhdGgiLCJnZXRNZXRhUGF0aCIsImdldFBhdGgiLCJnZXRPYmplY3QiLCJnZXRPRGF0YUVudGl0eVNpZGVFZmZlY3RzIiwic0VudGl0eVR5cGVOYW1lIiwiZ2V0R2xvYmFsT0RhdGFFbnRpdHlTaWRlRWZmZWN0cyIsIm1FbnRpdHlTaWRlRWZmZWN0cyIsImFHbG9iYWxTaWRlRWZmZWN0cyIsImtleSIsIm9FbnRpdHlTaWRlRWZmZWN0cyIsIlNvdXJjZUVudGl0aWVzIiwiU291cmNlUHJvcGVydGllcyIsInB1c2giLCJnZXRPRGF0YUFjdGlvblNpZGVFZmZlY3RzIiwic0FjdGlvbk5hbWUiLCJ1bmRlZmluZWQiLCJpbml0aWFsaXplU2lkZUVmZmVjdHMiLCJvQ2FwYWJpbGl0aWVzIiwib0NvbnZlcnRlZE1ldGFNb2RlbCIsImVudGl0eVR5cGVzIiwiZm9yRWFjaCIsImVudGl0eVR5cGUiLCJfcmV0cmlldmVPRGF0YUVudGl0eVNpZGVFZmZlY3RzIiwiX3JldHJpZXZlT0RhdGFBY3Rpb25zU2lkZUVmZmVjdHMiLCJyZW1vdmVDb250cm9sU2lkZUVmZmVjdHMiLCJzQ29udHJvbElkIiwiT2JqZWN0Iiwia2V5cyIsInJlcXVlc3RTaWRlRWZmZWN0cyIsImFQYXRoRXhwcmVzc2lvbnMiLCJfbG9nUmVxdWVzdCIsInJlcXVlc3RTaWRlRWZmZWN0c0Zvck9EYXRhQWN0aW9uIiwic2lkZUVmZmVjdHMiLCJhUHJvbWlzZXMiLCJ0cmlnZ2VyQWN0aW9ucyIsImxlbmd0aCIsIm1hcCIsInNUcmlnZ2VyQWN0aW9uTmFtZSIsInBhdGhFeHByZXNzaW9ucyIsImFsbCIsInJlcXVlc3RTaWRlRWZmZWN0c0Zvck5hdmlnYXRpb25Qcm9wZXJ0eSIsInNOYXZpZ2F0aW9uUHJvcGVydHkiLCJzQmFzZUVudGl0eVR5cGUiLCJzTmF2aWdhdGlvblBhdGgiLCJhU2lkZUVmZmVjdHMiLCJ0YXJnZXRQcm9wZXJ0aWVzIiwidGFyZ2V0RW50aXRpZXMiLCJzaWRlRWZmZWN0c1RhcmdldHMiLCJmaWx0ZXIiLCJzQW5ub3RhdGlvbk5hbWUiLCJvU2lkZUVmZmVjdHMiLCJzb21lIiwib1Byb3BlcnR5UGF0aCIsInNQcm9wZXJ0eVBhdGgiLCJ2YWx1ZSIsInN0YXJ0c1dpdGgiLCJyZXBsYWNlIiwiaW5kZXhPZiIsIm9OYXZpZ2F0aW9uUHJvcGVydHlQYXRoIiwiVHJpZ2dlckFjdGlvbiIsImNvbmNhdCIsIlRhcmdldFByb3BlcnRpZXMiLCJUYXJnZXRFbnRpdGllcyIsInNpZGVFZmZlY3RzVGFyZ2V0RGVmaW5pdGlvbiIsIl9yZW1vdmVEdXBsaWNhdGVUYXJnZXRzIiwiY2F0Y2giLCJvRXJyb3IiLCJMb2ciLCJlcnJvciIsImdldENvbnRyb2xFbnRpdHlTaWRlRWZmZWN0cyIsIl9hZGRSZXF1aXJlZFRleHRQcm9wZXJ0aWVzIiwibUVudGl0eVR5cGUiLCJhSW5pdGlhbFByb3BlcnRpZXMiLCJhRW50aXRpZXNSZXF1ZXN0ZWQiLCJuYXZpZ2F0aW9uIiwiJE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgiLCJhRGVyaXZlZFByb3BlcnRpZXMiLCJiSXNTdGFyUHJvcGVydHkiLCJlbmRzV2l0aCIsInNOYXZpZ2F0aW9uUHJvcGVydHlQYXRoIiwic3Vic3RyaW5nIiwibGFzdEluZGV4T2YiLCJzUmVsYXRpdmVQYXRoIiwibVRhcmdldCIsInJlc29sdmVQYXRoIiwiYVRhcmdldEVudGl0eVByb3BlcnRpZXMiLCJlbnRpdHlQcm9wZXJ0aWVzIiwidGFyZ2V0VHlwZSIsInByb3BlcnRpZXMiLCJtUHJvcGVydHkiLCJuYXZpZ2F0aW9uUGF0aCIsInByb3BlcnR5IiwiZmluZCIsIm5hbWUiLCJzcGxpdCIsInBvcCIsImluZm8iLCJtUHJvcGVydHlJbmZvIiwidGV4dEFubm90YXRpb24iLCJhbm5vdGF0aW9ucyIsIkNvbW1vbiIsIlRleHQiLCJpc1BhdGhFeHByZXNzaW9uIiwic1RhcmdldFRleHRQYXRoIiwicGF0aCIsInNUZXh0UGF0aEZyb21Jbml0aWFsRW50aXR5Iiwic1RhcmdldENvbGxlY3Rpb25QYXRoIiwiX3R5cGUiLCJfY29udmVydFNpZGVFZmZlY3RzIiwic0JpbmRpbmdQYXJhbWV0ZXIiLCJvVGVtcFNpZGVFZmZlY3RzIiwiX3JlbW92ZUJpbmRpbmdQYXJhbWV0ZXIiLCJfY29udmVydFRhcmdldHNGb3JtYXQiLCJyZWR1Y2UiLCJhVGFyZ2V0UHJvcGVydGllcyIsInZUYXJnZXQiLCJzVGFyZ2V0IiwidHlwZSIsIm1UYXJnZXRFbnRpdHkiLCJfZ2V0U2lkZUVmZmVjdHNGcm9tU291cmNlIiwib1NvdXJjZSIsInNvdXJjZUVudGl0eVR5cGUiLCJtQ29tbW9uQW5ub3RhdGlvbiIsIm1CaW5kaW5nUGFyYW1ldGVyIiwicGFyYW1ldGVycyIsIm1QYXJhbWV0ZXIiLCIkVHlwZSIsInNUYXJnZXRQYXRocyIsInNQYXRocyIsImRlYnVnIiwic0JpbmRpbmdQYXJhbWV0ZXJOYW1lIiwicmVwbGFjZUJpbmRpbmdQYXJhbWV0ZXIiLCJSZWdFeHAiLCJ0YXJnZXRQcm9wZXJ0eSIsInRhcmdldEVudGl0eSIsInVuaXF1ZVRhcmdldGVkRW50aXRpZXNQYXRoIiwiU2V0IiwidW5pcXVlVGFyZ2V0UHJvcGVydGllcyIsInVuaXF1ZVRhcmdldGVkRW50aXRpZXMiLCJoYXMiLCJhZGQiLCJBcnJheSIsImZyb20iLCJhY3Rpb25OYW1lIiwiYWN0aW9uIiwib0RhdGFTaWRlRWZmZWN0IiwidHJpZ2dlckFjdGlvbiIsImdldEludGVyZmFjZSIsIlNlcnZpY2UiLCJTaWRlRWZmZWN0c1NlcnZpY2VGYWN0b3J5IiwiY3JlYXRlSW5zdGFuY2UiLCJvU2VydmljZUNvbnRleHQiLCJTaWRlRWZmZWN0c1NlcnZpY2VTZXJ2aWNlIiwiU2VydmljZUZhY3RvcnkiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlNpZGVFZmZlY3RzU2VydmljZUZhY3RvcnkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUge1xuXHRBY3Rpb24sXG5cdEFubm90YXRpb25UZXJtLFxuXHRDb21wbGV4VHlwZSxcblx0Q29udmVydGVkTWV0YWRhdGEsXG5cdEVudGl0eVR5cGUsXG5cdE5hdmlnYXRpb25Qcm9wZXJ0eSxcblx0TmF2aWdhdGlvblByb3BlcnR5UGF0aCxcblx0UHJvcGVydHksXG5cdFByb3BlcnR5UGF0aFxufSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXNcIjtcbmltcG9ydCB0eXBlIHsgU2lkZUVmZmVjdHNUeXBlIGFzIENvbW1vblNpZGVFZmZlY3RzVHlwZSB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvQ29tbW9uXCI7XG5pbXBvcnQgeyBDb21tb25Bbm5vdGF0aW9uVHlwZXMgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL0NvbW1vblwiO1xuaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgdHlwZSB7IEVudmlyb25tZW50Q2FwYWJpbGl0aWVzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvTWV0YU1vZGVsQ29udmVydGVyXCI7XG5pbXBvcnQgeyBjb252ZXJ0VHlwZXMgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9NZXRhTW9kZWxDb252ZXJ0ZXJcIjtcbmltcG9ydCBTZXJ2aWNlIGZyb20gXCJzYXAvdWkvY29yZS9zZXJ2aWNlL1NlcnZpY2VcIjtcbmltcG9ydCBTZXJ2aWNlRmFjdG9yeSBmcm9tIFwic2FwL3VpL2NvcmUvc2VydmljZS9TZXJ2aWNlRmFjdG9yeVwiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L0NvbnRleHRcIjtcbmltcG9ydCB0eXBlIE9EYXRhTWV0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFNZXRhTW9kZWxcIjtcbmltcG9ydCB0eXBlIHsgU2VydmljZUNvbnRleHQsIFY0Q29udGV4dCB9IGZyb20gXCJ0eXBlcy9leHRlbnNpb25fdHlwZXNcIjtcbmltcG9ydCB7IGlzUGF0aEV4cHJlc3Npb24gfSBmcm9tIFwiLi4vdGVtcGxhdGluZy9Qcm9wZXJ0eUhlbHBlclwiO1xuXG50eXBlIFNpZGVFZmZlY3RzU2V0dGluZ3MgPSB7fTtcblxuZXhwb3J0IHR5cGUgU2lkZUVmZmVjdHNUYXJnZXRFbnRpdHlUeXBlID0ge1xuXHQkTmF2aWdhdGlvblByb3BlcnR5UGF0aDogc3RyaW5nO1xuXHQkUHJvcGVydHlQYXRoPzogc3RyaW5nO1xufTtcbmV4cG9ydCB0eXBlIFNpZGVFZmZlY3RzVGFyZ2V0ID0gU2lkZUVmZmVjdHNUYXJnZXRFbnRpdHlUeXBlIHwgc3RyaW5nO1xuXG50eXBlIFNpZGVFZmZlY3RzVGFyZ2V0VHlwZSA9IHtcblx0VGFyZ2V0UHJvcGVydGllczogc3RyaW5nW107XG5cdFRhcmdldEVudGl0aWVzOiBTaWRlRWZmZWN0c1RhcmdldEVudGl0eVR5cGVbXTtcbn07XG5cbnR5cGUgQmFzZVNpZGVFZmZlY3RzVHlwZSA9IHtcblx0ZnVsbHlRdWFsaWZpZWROYW1lOiBzdHJpbmc7XG59ICYgU2lkZUVmZmVjdHNUYXJnZXRUeXBlO1xuXG5leHBvcnQgdHlwZSBBY3Rpb25TaWRlRWZmZWN0c1R5cGUgPSB7XG5cdHBhdGhFeHByZXNzaW9uczogU2lkZUVmZmVjdHNUYXJnZXRbXTtcblx0dHJpZ2dlckFjdGlvbnM/OiBzdHJpbmdbXTtcbn07XG5cbmV4cG9ydCB0eXBlIENvbnRyb2xTaWRlRWZmZWN0c1R5cGUgPSBQYXJ0aWFsPEJhc2VTaWRlRWZmZWN0c1R5cGU+ICYge1xuXHRmdWxseVF1YWxpZmllZE5hbWU6IHN0cmluZztcblx0U291cmNlUHJvcGVydGllczogc3RyaW5nW107XG5cdHNvdXJjZUNvbnRyb2xJZDogc3RyaW5nO1xufTtcblxuZXhwb3J0IHR5cGUgT0RhdGFTaWRlRWZmZWN0c1R5cGUgPSBCYXNlU2lkZUVmZmVjdHNUeXBlICYge1xuXHRTb3VyY2VQcm9wZXJ0aWVzPzogUHJvcGVydHlQYXRoW107XG5cdFNvdXJjZUVudGl0aWVzPzogTmF2aWdhdGlvblByb3BlcnR5UGF0aFtdO1xuXHRUcmlnZ2VyQWN0aW9uPzogc3RyaW5nO1xufTtcblxuZXhwb3J0IHR5cGUgU2lkZUVmZmVjdHNUeXBlID0gQ29udHJvbFNpZGVFZmZlY3RzVHlwZSB8IE9EYXRhU2lkZUVmZmVjdHNUeXBlO1xuXG5leHBvcnQgdHlwZSBPRGF0YVNpZGVFZmZlY3RzRW50aXR5RGljdGlvbmFyeSA9IFJlY29yZDxzdHJpbmcsIE9EYXRhU2lkZUVmZmVjdHNUeXBlPjtcbmV4cG9ydCB0eXBlIE9EYXRhU2lkZUVmZmVjdHNBY3Rpb25EaWN0aW9uYXJ5ID0gUmVjb3JkPHN0cmluZywgQWN0aW9uU2lkZUVmZmVjdHNUeXBlPjtcbmV4cG9ydCB0eXBlIENvbnRyb2xTaWRlRWZmZWN0c0VudGl0eURpY3Rpb25hcnkgPSBSZWNvcmQ8c3RyaW5nLCBDb250cm9sU2lkZUVmZmVjdHNUeXBlPjtcblxudHlwZSBTaWRlRWZmZWN0c09yaWdpblJlZ2lzdHJ5ID0ge1xuXHRvRGF0YToge1xuXHRcdGVudGl0aWVzOiB7XG5cdFx0XHRbZW50aXR5OiBzdHJpbmddOiBSZWNvcmQ8c3RyaW5nLCBPRGF0YVNpZGVFZmZlY3RzVHlwZT47XG5cdFx0fTtcblx0XHRhY3Rpb25zOiB7XG5cdFx0XHRbZW50aXR5OiBzdHJpbmddOiBSZWNvcmQ8c3RyaW5nLCBBY3Rpb25TaWRlRWZmZWN0c1R5cGU+O1xuXHRcdH07XG5cdH07XG5cdGNvbnRyb2w6IHtcblx0XHRbZW50aXR5OiBzdHJpbmddOiBSZWNvcmQ8c3RyaW5nLCBDb250cm9sU2lkZUVmZmVjdHNUeXBlPjtcblx0fTtcbn07XG5cbnR5cGUgRXh0cmFjdG9yUHJvcGVydHlJbmZvID0ge1xuXHRwcm9wZXJ0eTogUHJvcGVydHk7XG5cdG5hdmlnYXRpb25QYXRoPzogc3RyaW5nO1xufTtcblxuZXhwb3J0IGNsYXNzIFNpZGVFZmZlY3RzU2VydmljZSBleHRlbmRzIFNlcnZpY2U8U2lkZUVmZmVjdHNTZXR0aW5ncz4ge1xuXHRpbml0UHJvbWlzZSE6IFByb21pc2U8U2lkZUVmZmVjdHNTZXJ2aWNlPjtcblx0X29TaWRlRWZmZWN0c1R5cGUhOiBTaWRlRWZmZWN0c09yaWdpblJlZ2lzdHJ5O1xuXHRfb0NhcGFiaWxpdGllcyE6IEVudmlyb25tZW50Q2FwYWJpbGl0aWVzIHwgdW5kZWZpbmVkO1xuXHRfYkluaXRpYWxpemVkITogYm9vbGVhbjtcblx0Ly8gITogbWVhbnMgdGhhdCB3ZSBrbm93IGl0IHdpbGwgYmUgYXNzaWduZWQgYmVmb3JlIHVzYWdlXG5cdGluaXQoKSB7XG5cdFx0dGhpcy5fb1NpZGVFZmZlY3RzVHlwZSA9IHtcblx0XHRcdG9EYXRhOiB7XG5cdFx0XHRcdGVudGl0aWVzOiB7fSxcblx0XHRcdFx0YWN0aW9uczoge31cblx0XHRcdH0sXG5cdFx0XHRjb250cm9sOiB7fVxuXHRcdH07XG5cdFx0dGhpcy5fYkluaXRpYWxpemVkID0gZmFsc2U7XG5cdFx0dGhpcy5pbml0UHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZSh0aGlzKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBZGRzIGEgU2lkZUVmZmVjdHMgY29udHJvbFxuXHQgKiBTaWRlRWZmZWN0cyBkZWZpbml0aW9uIGlzIGFkZGVkIGJ5IGEgY29udHJvbCB0byBrZWVwIGRhdGEgdXAgdG8gZGF0ZVxuXHQgKiBUaGVzZSBTaWRlRWZmZWN0cyBnZXQgbGltaXRlZCBzY29wZSBjb21wYXJlZCB3aXRoIFNpZGVFZmZlY3RzIGNvbWluZyBmcm9tIGFuIE9EYXRhIHNlcnZpY2U6XG5cdCAqIC0gT25seSBvbmUgU2lkZUVmZmVjdHMgZGVmaW5pdGlvbiBjYW4gYmUgZGVmaW5lZCBmb3IgdGhlIGNvbWJpbmF0aW9uIGVudGl0eSB0eXBlIC0gY29udHJvbCBJZFxuXHQgKiAtIE9ubHkgU2lkZUVmZmVjdHMgc291cmNlIHByb3BlcnRpZXMgYXJlIHJlY29nbml6ZWQgYW5kIHVzZWQgdG8gdHJpZ2dlciBTaWRlRWZmZWN0c1xuXHQgKlxuXHQgKiBFbnN1cmUgdGhlIHNvdXJjZUNvbnRyb2xJZCBtYXRjaGVzIHRoZSBhc3NvY2lhdGVkIFNBUFVJNSBjb250cm9sIElELlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQHBhcmFtIHNFbnRpdHlUeXBlIE5hbWUgb2YgdGhlIGVudGl0eSB0eXBlXG5cdCAqIEBwYXJhbSBvU2lkZUVmZmVjdCBTaWRlRWZmZWN0cyBkZWZpbml0aW9uXG5cdCAqL1xuXHRwdWJsaWMgYWRkQ29udHJvbFNpZGVFZmZlY3RzKHNFbnRpdHlUeXBlOiBzdHJpbmcsIG9TaWRlRWZmZWN0OiBPbWl0PENvbnRyb2xTaWRlRWZmZWN0c1R5cGUsIFwiZnVsbHlRdWFsaWZpZWROYW1lXCI+KTogdm9pZCB7XG5cdFx0aWYgKG9TaWRlRWZmZWN0LnNvdXJjZUNvbnRyb2xJZCkge1xuXHRcdFx0Y29uc3Qgb0NvbnRyb2xTaWRlRWZmZWN0OiBDb250cm9sU2lkZUVmZmVjdHNUeXBlID0ge1xuXHRcdFx0XHQuLi5vU2lkZUVmZmVjdCxcblx0XHRcdFx0ZnVsbHlRdWFsaWZpZWROYW1lOiBgJHtzRW50aXR5VHlwZX0vU2lkZUVmZmVjdHNGb3JDb250cm9sLyR7b1NpZGVFZmZlY3Quc291cmNlQ29udHJvbElkfWBcblx0XHRcdH07XG5cdFx0XHRjb25zdCBtRW50aXR5Q29udHJvbFNpZGVFZmZlY3RzID0gdGhpcy5fb1NpZGVFZmZlY3RzVHlwZS5jb250cm9sW3NFbnRpdHlUeXBlXSB8fCB7fTtcblx0XHRcdG1FbnRpdHlDb250cm9sU2lkZUVmZmVjdHNbb0NvbnRyb2xTaWRlRWZmZWN0LnNvdXJjZUNvbnRyb2xJZF0gPSBvQ29udHJvbFNpZGVFZmZlY3Q7XG5cdFx0XHR0aGlzLl9vU2lkZUVmZmVjdHNUeXBlLmNvbnRyb2xbc0VudGl0eVR5cGVdID0gbUVudGl0eUNvbnRyb2xTaWRlRWZmZWN0cztcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogRXhlY3V0ZXMgU2lkZUVmZmVjdHMgYWN0aW9uLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQHBhcmFtIHNUcmlnZ2VyQWN0aW9uIE5hbWUgb2YgdGhlIGFjdGlvblxuXHQgKiBAcGFyYW0gb0NvbnRleHQgQ29udGV4dFxuXHQgKiBAcGFyYW0gc0dyb3VwSWQgVGhlIGdyb3VwIElEIHRvIGJlIHVzZWQgZm9yIHRoZSByZXF1ZXN0XG5cdCAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdpdGhvdXQgZGF0YSBvciB3aXRoIGEgcmV0dXJuIHZhbHVlIGNvbnRleHQgd2hlbiB0aGUgYWN0aW9uIGNhbGwgc3VjY2VlZGVkXG5cdCAqL1xuXHRwdWJsaWMgZXhlY3V0ZUFjdGlvbihzVHJpZ2dlckFjdGlvbjogc3RyaW5nLCBvQ29udGV4dDogQ29udGV4dCwgc0dyb3VwSWQ/OiBzdHJpbmcpOiBQcm9taXNlPGFueT4ge1xuXHRcdGNvbnN0IG9UcmlnZ2VyQWN0aW9uID0gb0NvbnRleHQuZ2V0TW9kZWwoKS5iaW5kQ29udGV4dChgJHtzVHJpZ2dlckFjdGlvbn0oLi4uKWAsIG9Db250ZXh0KTtcblx0XHRyZXR1cm4gb1RyaWdnZXJBY3Rpb24uZXhlY3V0ZShzR3JvdXBJZCB8fCBvQ29udGV4dC5nZXRCaW5kaW5nKCkuZ2V0VXBkYXRlR3JvdXBJZCgpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIGNvbnZlcnRlZCBPRGF0YSBtZXRhTW9kZWwuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcmV0dXJucyBDb252ZXJ0ZWQgT0RhdGEgbWV0YU1vZGVsXG5cdCAqL1xuXHRwdWJsaWMgZ2V0Q29udmVydGVkTWV0YU1vZGVsKCk6IENvbnZlcnRlZE1ldGFkYXRhIHtcblx0XHRjb25zdCBvQ29udGV4dCA9IHRoaXMuZ2V0Q29udGV4dCgpO1xuXHRcdGNvbnN0IG9Db21wb25lbnQgPSBvQ29udGV4dC5zY29wZU9iamVjdDtcblx0XHRjb25zdCBvTWV0YU1vZGVsOiBPRGF0YU1ldGFNb2RlbCA9IG9Db21wb25lbnQuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKTtcblx0XHRyZXR1cm4gY29udmVydFR5cGVzKG9NZXRhTW9kZWwsIHRoaXMuX29DYXBhYmlsaXRpZXMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIGVudGl0eSB0eXBlIG9mIGEgY29udGV4dC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGdldEVudGl0eVR5cGVGcm9tQ29udGV4dFxuXHQgKiBAcGFyYW0gb0NvbnRleHQgQ29udGV4dFxuXHQgKiBAcmV0dXJucyBFbnRpdHkgVHlwZVxuXHQgKi9cblx0cHVibGljIGdldEVudGl0eVR5cGVGcm9tQ29udGV4dChvQ29udGV4dDogQ29udGV4dCk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG5cdFx0Y29uc3Qgb01ldGFNb2RlbCA9IChvQ29udGV4dCBhcyBWNENvbnRleHQpLmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCksXG5cdFx0XHRzTWV0YVBhdGggPSBvTWV0YU1vZGVsLmdldE1ldGFQYXRoKG9Db250ZXh0LmdldFBhdGgoKSksXG5cdFx0XHRzRW50aXR5VHlwZSA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KHNNZXRhUGF0aClbXCIkVHlwZVwiXTtcblx0XHRyZXR1cm4gc0VudGl0eVR5cGU7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyB0aGUgU2lkZUVmZmVjdHMgdGhhdCBjb21lIGZyb20gYW4gT0RhdGEgc2VydmljZS5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBwYXJhbSBzRW50aXR5VHlwZU5hbWUgTmFtZSBvZiB0aGUgZW50aXR5IHR5cGVcblx0ICogQHJldHVybnMgU2lkZUVmZmVjdHMgZGljdGlvbmFyeVxuXHQgKi9cblx0cHVibGljIGdldE9EYXRhRW50aXR5U2lkZUVmZmVjdHMoc0VudGl0eVR5cGVOYW1lOiBzdHJpbmcpOiBSZWNvcmQ8c3RyaW5nLCBPRGF0YVNpZGVFZmZlY3RzVHlwZT4ge1xuXHRcdHJldHVybiB0aGlzLl9vU2lkZUVmZmVjdHNUeXBlLm9EYXRhLmVudGl0aWVzW3NFbnRpdHlUeXBlTmFtZV0gfHwge307XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyB0aGUgZ2xvYmFsIFNpZGVFZmZlY3RzIHRoYXQgY29tZSBmcm9tIGFuIE9EYXRhIHNlcnZpY2UuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcGFyYW0gc0VudGl0eVR5cGVOYW1lIE5hbWUgb2YgdGhlIGVudGl0eSB0eXBlXG5cdCAqIEByZXR1cm5zIEdsb2JhbCBTaWRlRWZmZWN0c1xuXHQgKi9cblx0cHVibGljIGdldEdsb2JhbE9EYXRhRW50aXR5U2lkZUVmZmVjdHMoc0VudGl0eVR5cGVOYW1lOiBzdHJpbmcpOiBPRGF0YVNpZGVFZmZlY3RzVHlwZVtdIHtcblx0XHRjb25zdCBtRW50aXR5U2lkZUVmZmVjdHMgPSB0aGlzLmdldE9EYXRhRW50aXR5U2lkZUVmZmVjdHMoc0VudGl0eVR5cGVOYW1lKTtcblx0XHRjb25zdCBhR2xvYmFsU2lkZUVmZmVjdHM6IE9EYXRhU2lkZUVmZmVjdHNUeXBlW10gPSBbXTtcblx0XHRmb3IgKGNvbnN0IGtleSBpbiBtRW50aXR5U2lkZUVmZmVjdHMpIHtcblx0XHRcdGNvbnN0IG9FbnRpdHlTaWRlRWZmZWN0cyA9IG1FbnRpdHlTaWRlRWZmZWN0c1trZXldO1xuXHRcdFx0aWYgKCFvRW50aXR5U2lkZUVmZmVjdHMuU291cmNlRW50aXRpZXMgJiYgIW9FbnRpdHlTaWRlRWZmZWN0cy5Tb3VyY2VQcm9wZXJ0aWVzKSB7XG5cdFx0XHRcdGFHbG9iYWxTaWRlRWZmZWN0cy5wdXNoKG9FbnRpdHlTaWRlRWZmZWN0cyk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBhR2xvYmFsU2lkZUVmZmVjdHM7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyB0aGUgU2lkZUVmZmVjdHMgdGhhdCBjb21lIGZyb20gYW4gT0RhdGEgc2VydmljZS5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBwYXJhbSBzQWN0aW9uTmFtZSBOYW1lIG9mIHRoZSBhY3Rpb25cblx0ICogQHBhcmFtIG9Db250ZXh0IENvbnRleHRcblx0ICogQHJldHVybnMgU2lkZUVmZmVjdHMgZGVmaW5pdGlvblxuXHQgKi9cblx0cHVibGljIGdldE9EYXRhQWN0aW9uU2lkZUVmZmVjdHMoc0FjdGlvbk5hbWU6IHN0cmluZywgb0NvbnRleHQ/OiBDb250ZXh0KTogQWN0aW9uU2lkZUVmZmVjdHNUeXBlIHwgdW5kZWZpbmVkIHtcblx0XHRpZiAob0NvbnRleHQpIHtcblx0XHRcdGNvbnN0IHNFbnRpdHlUeXBlID0gdGhpcy5nZXRFbnRpdHlUeXBlRnJvbUNvbnRleHQob0NvbnRleHQpO1xuXHRcdFx0aWYgKHNFbnRpdHlUeXBlKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLl9vU2lkZUVmZmVjdHNUeXBlLm9EYXRhLmFjdGlvbnNbc0VudGl0eVR5cGVdPy5bc0FjdGlvbk5hbWVdO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdlbmVyYXRlcyB0aGUgZGljdGlvbmFyeSBmb3IgdGhlIFNpZGVFZmZlY3RzLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQHBhcmFtIG9DYXBhYmlsaXRpZXMgVGhlIGN1cnJlbnQgY2FwYWJpbGl0aWVzXG5cdCAqL1xuXHRwdWJsaWMgaW5pdGlhbGl6ZVNpZGVFZmZlY3RzKG9DYXBhYmlsaXRpZXM/OiBFbnZpcm9ubWVudENhcGFiaWxpdGllcyk6IHZvaWQge1xuXHRcdHRoaXMuX29DYXBhYmlsaXRpZXMgPSBvQ2FwYWJpbGl0aWVzO1xuXHRcdGlmICghdGhpcy5fYkluaXRpYWxpemVkKSB7XG5cdFx0XHRjb25zdCBvQ29udmVydGVkTWV0YU1vZGVsID0gdGhpcy5nZXRDb252ZXJ0ZWRNZXRhTW9kZWwoKTtcblx0XHRcdG9Db252ZXJ0ZWRNZXRhTW9kZWwuZW50aXR5VHlwZXMuZm9yRWFjaCgoZW50aXR5VHlwZTogRW50aXR5VHlwZSkgPT4ge1xuXHRcdFx0XHR0aGlzLl9vU2lkZUVmZmVjdHNUeXBlLm9EYXRhLmVudGl0aWVzW2VudGl0eVR5cGUuZnVsbHlRdWFsaWZpZWROYW1lXSA9IHRoaXMuX3JldHJpZXZlT0RhdGFFbnRpdHlTaWRlRWZmZWN0cyhlbnRpdHlUeXBlKTtcblx0XHRcdFx0dGhpcy5fb1NpZGVFZmZlY3RzVHlwZS5vRGF0YS5hY3Rpb25zW2VudGl0eVR5cGUuZnVsbHlRdWFsaWZpZWROYW1lXSA9IHRoaXMuX3JldHJpZXZlT0RhdGFBY3Rpb25zU2lkZUVmZmVjdHMoZW50aXR5VHlwZSk7IC8vIG9ubHkgYm91bmQgYWN0aW9ucyBhcmUgYW5hbHl6ZWQgc2luY2UgdW5ib3VuZCBvbmVzIGRvbid0IGdldCBTaWRlRWZmZWN0c1xuXHRcdFx0fSk7XG5cdFx0XHR0aGlzLl9iSW5pdGlhbGl6ZWQgPSB0cnVlO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIGFsbCBTaWRlRWZmZWN0cyByZWxhdGVkIHRvIGEgY29udHJvbC5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBwYXJhbSBzQ29udHJvbElkIENvbnRyb2wgSWRcblx0ICovXG5cdHB1YmxpYyByZW1vdmVDb250cm9sU2lkZUVmZmVjdHMoc0NvbnRyb2xJZDogc3RyaW5nKTogdm9pZCB7XG5cdFx0T2JqZWN0LmtleXModGhpcy5fb1NpZGVFZmZlY3RzVHlwZS5jb250cm9sKS5mb3JFYWNoKChzRW50aXR5VHlwZSkgPT4ge1xuXHRcdFx0aWYgKHRoaXMuX29TaWRlRWZmZWN0c1R5cGUuY29udHJvbFtzRW50aXR5VHlwZV1bc0NvbnRyb2xJZF0pIHtcblx0XHRcdFx0ZGVsZXRlIHRoaXMuX29TaWRlRWZmZWN0c1R5cGUuY29udHJvbFtzRW50aXR5VHlwZV1bc0NvbnRyb2xJZF07XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogUmVxdWVzdCBTaWRlRWZmZWN0cyBvbiBhIHNwZWNpZmljIGNvbnRleHQuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSByZXF1ZXN0U2lkZUVmZmVjdHNcblx0ICogQHBhcmFtIGFQYXRoRXhwcmVzc2lvbnMgVGFyZ2V0cyBvZiBTaWRlRWZmZWN0cyB0byBiZSBleGVjdXRlZFxuXHQgKiBAcGFyYW0gb0NvbnRleHQgQ29udGV4dCB3aGVyZSBTaWRlRWZmZWN0cyBuZWVkIHRvIGJlIGV4ZWN1dGVkXG5cdCAqIEBwYXJhbSBzR3JvdXBJZCBUaGUgZ3JvdXAgSUQgdG8gYmUgdXNlZCBmb3IgdGhlIHJlcXVlc3Rcblx0ICogQHJldHVybnMgUHJvbWlzZSBvbiBTaWRlRWZmZWN0cyByZXF1ZXN0XG5cdCAqL1xuXHRwdWJsaWMgYXN5bmMgcmVxdWVzdFNpZGVFZmZlY3RzKGFQYXRoRXhwcmVzc2lvbnM6IFNpZGVFZmZlY3RzVGFyZ2V0W10sIG9Db250ZXh0OiBDb250ZXh0LCBzR3JvdXBJZD86IHN0cmluZyB8IHVuZGVmaW5lZCk6IFByb21pc2U8YW55PiB7XG5cdFx0dGhpcy5fbG9nUmVxdWVzdChhUGF0aEV4cHJlc3Npb25zLCBvQ29udGV4dCk7XG5cdFx0cmV0dXJuIG9Db250ZXh0LnJlcXVlc3RTaWRlRWZmZWN0cyhhUGF0aEV4cHJlc3Npb25zIGFzIG9iamVjdFtdLCBzR3JvdXBJZCk7XG5cdH1cblxuXHRwdWJsaWMgcmVxdWVzdFNpZGVFZmZlY3RzRm9yT0RhdGFBY3Rpb24oc2lkZUVmZmVjdHM6IEFjdGlvblNpZGVFZmZlY3RzVHlwZSwgb0NvbnRleHQ6IENvbnRleHQpOiBQcm9taXNlPGFueT4ge1xuXHRcdGxldCBhUHJvbWlzZXM6IFByb21pc2U8YW55PltdO1xuXG5cdFx0aWYgKHNpZGVFZmZlY3RzLnRyaWdnZXJBY3Rpb25zPy5sZW5ndGgpIHtcblx0XHRcdGFQcm9taXNlcyA9IHNpZGVFZmZlY3RzLnRyaWdnZXJBY3Rpb25zLm1hcCgoc1RyaWdnZXJBY3Rpb25OYW1lKSA9PiB7XG5cdFx0XHRcdHJldHVybiB0aGlzLmV4ZWN1dGVBY3Rpb24oc1RyaWdnZXJBY3Rpb25OYW1lLCBvQ29udGV4dCk7XG5cdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0YVByb21pc2VzID0gW107XG5cdFx0fVxuXG5cdFx0aWYgKHNpZGVFZmZlY3RzLnBhdGhFeHByZXNzaW9ucz8ubGVuZ3RoKSB7XG5cdFx0XHRhUHJvbWlzZXMucHVzaCh0aGlzLnJlcXVlc3RTaWRlRWZmZWN0cyhzaWRlRWZmZWN0cy5wYXRoRXhwcmVzc2lvbnMsIG9Db250ZXh0KSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGFQcm9taXNlcy5sZW5ndGggPyBQcm9taXNlLmFsbChhUHJvbWlzZXMpIDogUHJvbWlzZS5yZXNvbHZlKCk7XG5cdH1cblxuXHQvKipcblx0ICogUmVxdWVzdCBTaWRlRWZmZWN0cyBmb3IgYSBuYXZpZ2F0aW9uIHByb3BlcnR5IG9uIGEgc3BlY2lmaWMgY29udGV4dC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIHJlcXVlc3RTaWRlRWZmZWN0c0Zvck5hdmlnYXRpb25Qcm9wZXJ0eVxuXHQgKiBAcGFyYW0gc05hdmlnYXRpb25Qcm9wZXJ0eSBOYXZpZ2F0aW9uIHByb3BlcnR5XG5cdCAqIEBwYXJhbSBvQ29udGV4dCBDb250ZXh0IHdoZXJlIFNpZGVFZmZlY3RzIG5lZWQgdG8gYmUgZXhlY3V0ZWRcblx0ICogQHJldHVybnMgU2lkZUVmZmVjdHMgcmVxdWVzdCBvbiBTQVBVSTUgY29udGV4dFxuXHQgKi9cblx0cHVibGljIHJlcXVlc3RTaWRlRWZmZWN0c0Zvck5hdmlnYXRpb25Qcm9wZXJ0eShzTmF2aWdhdGlvblByb3BlcnR5OiBzdHJpbmcsIG9Db250ZXh0OiBDb250ZXh0KTogUHJvbWlzZTxhbnk+IHtcblx0XHRjb25zdCBzQmFzZUVudGl0eVR5cGUgPSB0aGlzLmdldEVudGl0eVR5cGVGcm9tQ29udGV4dChvQ29udGV4dCk7XG5cdFx0aWYgKHNCYXNlRW50aXR5VHlwZSkge1xuXHRcdFx0Y29uc3Qgc05hdmlnYXRpb25QYXRoID0gYCR7c05hdmlnYXRpb25Qcm9wZXJ0eX0vYDtcblx0XHRcdGNvbnN0IGFTaWRlRWZmZWN0cyA9IHRoaXMuZ2V0T0RhdGFFbnRpdHlTaWRlRWZmZWN0cyhzQmFzZUVudGl0eVR5cGUpO1xuXHRcdFx0bGV0IHRhcmdldFByb3BlcnRpZXM6IHN0cmluZ1tdID0gW107XG5cdFx0XHRsZXQgdGFyZ2V0RW50aXRpZXM6IFNpZGVFZmZlY3RzVGFyZ2V0RW50aXR5VHlwZVtdID0gW107XG5cdFx0XHRsZXQgc2lkZUVmZmVjdHNUYXJnZXRzOiBTaWRlRWZmZWN0c1RhcmdldFtdID0gW107XG5cdFx0XHRPYmplY3Qua2V5cyhhU2lkZUVmZmVjdHMpXG5cdFx0XHRcdC5maWx0ZXIoXG5cdFx0XHRcdFx0Ly8gS2VlcCByZWxldmFudCBTaWRlRWZmZWN0c1xuXHRcdFx0XHRcdChzQW5ub3RhdGlvbk5hbWUpID0+IHtcblx0XHRcdFx0XHRcdGNvbnN0IG9TaWRlRWZmZWN0czogT0RhdGFTaWRlRWZmZWN0c1R5cGUgPSBhU2lkZUVmZmVjdHNbc0Fubm90YXRpb25OYW1lXTtcblx0XHRcdFx0XHRcdHJldHVybiAoXG5cdFx0XHRcdFx0XHRcdChvU2lkZUVmZmVjdHMuU291cmNlUHJvcGVydGllcyB8fCBbXSkuc29tZSgob1Byb3BlcnR5UGF0aCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IHNQcm9wZXJ0eVBhdGggPSBvUHJvcGVydHlQYXRoLnZhbHVlO1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiAoXG5cdFx0XHRcdFx0XHRcdFx0XHRzUHJvcGVydHlQYXRoLnN0YXJ0c1dpdGgoc05hdmlnYXRpb25QYXRoKSAmJlxuXHRcdFx0XHRcdFx0XHRcdFx0c1Byb3BlcnR5UGF0aC5yZXBsYWNlKHNOYXZpZ2F0aW9uUGF0aCwgXCJcIikuaW5kZXhPZihcIi9cIikgPT09IC0xXG5cdFx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdFx0fSkgfHxcblx0XHRcdFx0XHRcdFx0KG9TaWRlRWZmZWN0cy5Tb3VyY2VFbnRpdGllcyB8fCBbXSkuc29tZShcblx0XHRcdFx0XHRcdFx0XHQob05hdmlnYXRpb25Qcm9wZXJ0eVBhdGgpID0+IG9OYXZpZ2F0aW9uUHJvcGVydHlQYXRoLnZhbHVlID09PSBzTmF2aWdhdGlvblByb3BlcnR5XG5cdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHQpXG5cdFx0XHRcdC5mb3JFYWNoKChzQW5ub3RhdGlvbk5hbWUpID0+IHtcblx0XHRcdFx0XHRjb25zdCBvU2lkZUVmZmVjdHM6IE9EYXRhU2lkZUVmZmVjdHNUeXBlID0gYVNpZGVFZmZlY3RzW3NBbm5vdGF0aW9uTmFtZV07XG5cdFx0XHRcdFx0aWYgKG9TaWRlRWZmZWN0cy5UcmlnZ2VyQWN0aW9uKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmV4ZWN1dGVBY3Rpb24ob1NpZGVFZmZlY3RzLlRyaWdnZXJBY3Rpb24sIG9Db250ZXh0KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0dGFyZ2V0UHJvcGVydGllcyA9IHRhcmdldFByb3BlcnRpZXMuY29uY2F0KG9TaWRlRWZmZWN0cy5UYXJnZXRQcm9wZXJ0aWVzKTtcblx0XHRcdFx0XHR0YXJnZXRFbnRpdGllcyA9IHRhcmdldEVudGl0aWVzLmNvbmNhdChvU2lkZUVmZmVjdHMuVGFyZ2V0RW50aXRpZXMpO1xuXHRcdFx0XHR9KTtcblx0XHRcdC8vIFJlbW92ZSBkdXBsaWNhdGUgdGFyZ2V0c1xuXHRcdFx0Y29uc3Qgc2lkZUVmZmVjdHNUYXJnZXREZWZpbml0aW9uID0gdGhpcy5fcmVtb3ZlRHVwbGljYXRlVGFyZ2V0cyh0YXJnZXRQcm9wZXJ0aWVzLCB0YXJnZXRFbnRpdGllcyk7XG5cdFx0XHRzaWRlRWZmZWN0c1RhcmdldHMgPSBbLi4uc2lkZUVmZmVjdHNUYXJnZXREZWZpbml0aW9uLlRhcmdldFByb3BlcnRpZXMsIC4uLnNpZGVFZmZlY3RzVGFyZ2V0RGVmaW5pdGlvbi5UYXJnZXRFbnRpdGllc107XG5cdFx0XHRpZiAoc2lkZUVmZmVjdHNUYXJnZXRzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMucmVxdWVzdFNpZGVFZmZlY3RzKHNpZGVFZmZlY3RzVGFyZ2V0cywgb0NvbnRleHQpLmNhdGNoKChvRXJyb3IpID0+XG5cdFx0XHRcdFx0TG9nLmVycm9yKGBTaWRlRWZmZWN0cyAtIEVycm9yIHdoaWxlIHByb2Nlc3NpbmcgU2lkZUVmZmVjdHMgZm9yIE5hdmlnYXRpb24gUHJvcGVydHkgJHtzTmF2aWdhdGlvblByb3BlcnR5fWAsIG9FcnJvcilcblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIFNpZGVFZmZlY3RzIHRoYXQgY29tZSBmcm9tIGNvbnRyb2xzLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQHBhcmFtIHNFbnRpdHlUeXBlTmFtZSBFbnRpdHkgdHlwZSBOYW1lXG5cdCAqIEByZXR1cm5zIFNpZGVFZmZlY3RzIGRpY3Rpb25hcnlcblx0ICovXG5cdHB1YmxpYyBnZXRDb250cm9sRW50aXR5U2lkZUVmZmVjdHMoc0VudGl0eVR5cGVOYW1lOiBzdHJpbmcpOiBSZWNvcmQ8c3RyaW5nLCBDb250cm9sU2lkZUVmZmVjdHNUeXBlPiB7XG5cdFx0cmV0dXJuIHRoaXMuX29TaWRlRWZmZWN0c1R5cGUuY29udHJvbFtzRW50aXR5VHlwZU5hbWVdIHx8IHt9O1xuXHR9XG5cblx0LyoqXG5cdCAqIEFkZHMgdGhlIHRleHQgcHJvcGVydGllcyByZXF1aXJlZCBmb3IgU2lkZUVmZmVjdHNcblx0ICogSWYgYSBwcm9wZXJ0eSBoYXMgYW4gYXNzb2NpYXRlZCB0ZXh0IHRoZW4gdGhpcyB0ZXh0IG5lZWRzIHRvIGJlIGFkZGVkIGFzIHRhcmdldFByb3BlcnRpZXMgb3IgdGFyZ2V0RW50aXRpZXMuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcGFyYW0gb1NpZGVFZmZlY3QgU2lkZUVmZmVjdHMgZGVmaW5pdGlvblxuXHQgKiBAcGFyYW0gbUVudGl0eVR5cGUgRW50aXR5IHR5cGVcblx0ICogQHJldHVybnMgU2lkZUVmZmVjdHMgZGVmaW5pdGlvbiB3aXRoIGFkZGVkIHRleHQgcHJvcGVydGllc1xuXHQgKi9cblx0cHJpdmF0ZSBfYWRkUmVxdWlyZWRUZXh0UHJvcGVydGllcyhvU2lkZUVmZmVjdDogQmFzZVNpZGVFZmZlY3RzVHlwZSwgbUVudGl0eVR5cGU6IEVudGl0eVR5cGUpOiBCYXNlU2lkZUVmZmVjdHNUeXBlIHtcblx0XHRjb25zdCBhSW5pdGlhbFByb3BlcnRpZXM6IHN0cmluZ1tdID0gb1NpZGVFZmZlY3QuVGFyZ2V0UHJvcGVydGllcyxcblx0XHRcdGFFbnRpdGllc1JlcXVlc3RlZDogc3RyaW5nW10gPSBvU2lkZUVmZmVjdC5UYXJnZXRFbnRpdGllcy5tYXAoKG5hdmlnYXRpb24pID0+IG5hdmlnYXRpb24uJE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgpO1xuXHRcdGxldCBhRGVyaXZlZFByb3BlcnRpZXM6IEV4dHJhY3RvclByb3BlcnR5SW5mb1tdID0gW107XG5cblx0XHRhSW5pdGlhbFByb3BlcnRpZXMuZm9yRWFjaCgoc1Byb3BlcnR5UGF0aCkgPT4ge1xuXHRcdFx0Y29uc3QgYklzU3RhclByb3BlcnR5ID0gc1Byb3BlcnR5UGF0aC5lbmRzV2l0aChcIipcIiksIC8vIENhbiBiZSAnKicgb3IgJy4uLi9uYXZQcm9wLyonXG5cdFx0XHRcdHNOYXZpZ2F0aW9uUHJvcGVydHlQYXRoOiBzdHJpbmcgPSBzUHJvcGVydHlQYXRoLnN1YnN0cmluZygwLCBzUHJvcGVydHlQYXRoLmxhc3RJbmRleE9mKFwiL1wiKSksXG5cdFx0XHRcdHNSZWxhdGl2ZVBhdGggPSBzTmF2aWdhdGlvblByb3BlcnR5UGF0aCA/IGAke3NOYXZpZ2F0aW9uUHJvcGVydHlQYXRofS9gIDogXCJcIixcblx0XHRcdFx0bVRhcmdldCA9IG1FbnRpdHlUeXBlLnJlc29sdmVQYXRoKHNOYXZpZ2F0aW9uUHJvcGVydHlQYXRoKSB8fCBtRW50aXR5VHlwZTtcblxuXHRcdFx0Ly8gbVRhcmdldCBjYW4gYmUgYW4gZW50aXR5IHR5cGUsIG5hdmlnYXRpb25Qcm9wZXJ0eSBvciBvciBhIGNvbXBsZXhUeXBlXG5cdFx0XHRjb25zdCBhVGFyZ2V0RW50aXR5UHJvcGVydGllczogUHJvcGVydHlbXSA9XG5cdFx0XHRcdChtVGFyZ2V0IGFzIEVudGl0eVR5cGUpLmVudGl0eVByb3BlcnRpZXMgfHxcblx0XHRcdFx0KChtVGFyZ2V0IGFzIFByb3BlcnR5KS50YXJnZXRUeXBlIGFzIENvbXBsZXhUeXBlKT8ucHJvcGVydGllcyB8fFxuXHRcdFx0XHQobVRhcmdldCBhcyBOYXZpZ2F0aW9uUHJvcGVydHkpLnRhcmdldFR5cGUuZW50aXR5UHJvcGVydGllcztcblx0XHRcdGlmIChhVGFyZ2V0RW50aXR5UHJvcGVydGllcykge1xuXHRcdFx0XHRpZiAoYklzU3RhclByb3BlcnR5KSB7XG5cdFx0XHRcdFx0Ly8gQWRkIGFsbCByZXF1aXJlZCBwcm9wZXJ0aWVzIGJlaGluZCB0aGUgKlxuXHRcdFx0XHRcdGFFbnRpdGllc1JlcXVlc3RlZC5wdXNoKHNOYXZpZ2F0aW9uUHJvcGVydHlQYXRoKTtcblx0XHRcdFx0XHRhRGVyaXZlZFByb3BlcnRpZXMgPSBhRGVyaXZlZFByb3BlcnRpZXMuY29uY2F0KFxuXHRcdFx0XHRcdFx0YVRhcmdldEVudGl0eVByb3BlcnRpZXMubWFwKChtUHJvcGVydHkpID0+IHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdFx0XHRuYXZpZ2F0aW9uUGF0aDogc1JlbGF0aXZlUGF0aCxcblx0XHRcdFx0XHRcdFx0XHRwcm9wZXJ0eTogbVByb3BlcnR5XG5cdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0YURlcml2ZWRQcm9wZXJ0aWVzLnB1c2goe1xuXHRcdFx0XHRcdFx0cHJvcGVydHk6IGFUYXJnZXRFbnRpdHlQcm9wZXJ0aWVzLmZpbmQoXG5cdFx0XHRcdFx0XHRcdChtUHJvcGVydHkpID0+IG1Qcm9wZXJ0eS5uYW1lID09PSBzUHJvcGVydHlQYXRoLnNwbGl0KFwiL1wiKS5wb3AoKVxuXHRcdFx0XHRcdFx0KSBhcyBQcm9wZXJ0eSxcblx0XHRcdFx0XHRcdG5hdmlnYXRpb25QYXRoOiBzUmVsYXRpdmVQYXRoXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdExvZy5pbmZvKGBTaWRlRWZmZWN0cyAtIFRoZSBlbnRpdHkgdHlwZSBhc3NvY2lhdGVkIHRvIHByb3BlcnR5IHBhdGggJHtzUHJvcGVydHlQYXRofSBjYW5ub3QgYmUgcmVzb2x2ZWRgKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdGFEZXJpdmVkUHJvcGVydGllcy5mb3JFYWNoKChtUHJvcGVydHlJbmZvKSA9PiB7XG5cdFx0XHRjb25zdCB0ZXh0QW5ub3RhdGlvbiA9IG1Qcm9wZXJ0eUluZm8ucHJvcGVydHk/LmFubm90YXRpb25zPy5Db21tb24/LlRleHQ7XG5cdFx0XHRpZiAodGV4dEFubm90YXRpb24gJiYgaXNQYXRoRXhwcmVzc2lvbih0ZXh0QW5ub3RhdGlvbikpIHtcblx0XHRcdFx0Y29uc3Qgc1RhcmdldFRleHRQYXRoID0gdGV4dEFubm90YXRpb24ucGF0aCxcblx0XHRcdFx0XHRzVGV4dFBhdGhGcm9tSW5pdGlhbEVudGl0eSA9IG1Qcm9wZXJ0eUluZm8ubmF2aWdhdGlvblBhdGggKyBzVGFyZ2V0VGV4dFBhdGgsXG5cdFx0XHRcdFx0c1RhcmdldENvbGxlY3Rpb25QYXRoID0gc1RleHRQYXRoRnJvbUluaXRpYWxFbnRpdHkuc3Vic3RyaW5nKDAsIHNUZXh0UGF0aEZyb21Jbml0aWFsRW50aXR5Lmxhc3RJbmRleE9mKFwiL1wiKSk7XG5cdFx0XHRcdC8qKlxuXHRcdFx0XHQgKiBUaGUgcHJvcGVydHkgVGV4dCBtdXN0IGJlIGFkZGVkIG9ubHkgaWYgdGhlIHByb3BlcnR5IGlzXG5cdFx0XHRcdCAqIC0gbm90IHBhcnQgb2YgYSBzdGFyIHByb3BlcnR5ICguaS5lICcqJyBvciAnbmF2aWdhdGlvbi8qJykgb3IgYSB0YXJnZXRlZCBFbnRpdHlcblx0XHRcdFx0ICogLSBub3QgaW5jbHVkZSBpbnRvIHRoZSBpbml0aWFsIHRhcmdldGVkIHByb3BlcnRpZXMgb2YgU2lkZUVmZmVjdHNcblx0XHRcdFx0ICogIEluZGVlZCBpbiB0aGUgdHdvIGxpc3RlZCBjYXNlcywgdGhlIHByb3BlcnR5IGNvbnRhaW5pbmcgdGV4dCB3aWxsIGJlL2lzIHJlcXVlc3RlZCBieSBpbml0aWFsIFNpZGVFZmZlY3RzIGNvbmZpZ3VyYXRpb24uXG5cdFx0XHRcdCAqL1xuXG5cdFx0XHRcdGlmIChcblx0XHRcdFx0XHRzVGFyZ2V0VGV4dFBhdGggJiZcblx0XHRcdFx0XHRhRW50aXRpZXNSZXF1ZXN0ZWQuaW5kZXhPZihzVGFyZ2V0Q29sbGVjdGlvblBhdGgpID09PSAtMSAmJlxuXHRcdFx0XHRcdGFJbml0aWFsUHJvcGVydGllcy5pbmRleE9mKHNUZXh0UGF0aEZyb21Jbml0aWFsRW50aXR5KSA9PT0gLTFcblx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0Ly8gVGhlIFRleHQgYXNzb2NpYXRpb24gaXMgYWRkZWQgYXMgVGFyZ2V0RW50aXRpZXMgaWYgaXQncyBjb250YWluZWQgb24gYSBkaWZmZXJlbnQgZW50aXR5U2V0IGFuZCBub3QgYSBjb21wbGV4VHlwZVxuXHRcdFx0XHRcdC8vIE90aGVyd2lzZSBpdCdzIGFkZGVkIGFzIHRhcmdldFByb3BlcnRpZXNcblx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRzVGFyZ2V0VGV4dFBhdGgubGFzdEluZGV4T2YoXCIvXCIpID4gLTEgJiZcblx0XHRcdFx0XHRcdG1FbnRpdHlUeXBlLnJlc29sdmVQYXRoKHNUYXJnZXRDb2xsZWN0aW9uUGF0aCk/Ll90eXBlID09PSBcIk5hdmlnYXRpb25Qcm9wZXJ0eVwiXG5cdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHRvU2lkZUVmZmVjdC5UYXJnZXRFbnRpdGllcy5wdXNoKHsgJE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGg6IHNUYXJnZXRDb2xsZWN0aW9uUGF0aCB9KTtcblx0XHRcdFx0XHRcdGFFbnRpdGllc1JlcXVlc3RlZC5wdXNoKHNUYXJnZXRDb2xsZWN0aW9uUGF0aCk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdG9TaWRlRWZmZWN0LlRhcmdldFByb3BlcnRpZXMucHVzaChzVGV4dFBhdGhGcm9tSW5pdGlhbEVudGl0eSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gb1NpZGVFZmZlY3Q7XG5cdH1cblx0LyoqXG5cdCAqIENvbnZlcnRzIFNpZGVFZmZlY3RzIHRvIGV4cGVjdGVkIGZvcm1hdFxuXHQgKiAgLSBDb252ZXJ0cyBTaWRlRWZmZWN0cyB0YXJnZXRzIHRvIGV4cGVjdGVkIGZvcm1hdFxuXHQgKiAgLSBSZW1vdmVzIGJpbmRpbmcgcGFyYW1ldGVyIGZyb20gU2lkZUVmZmVjdHMgdGFyZ2V0cyBwcm9wZXJ0aWVzXG5cdCAqICAtIEFkZHMgdGhlIHRleHQgcHJvcGVydGllc1xuXHQgKiAgLSBSZXBsYWNlcyBUYXJnZXRQcm9wZXJ0aWVzIGhhdmluZyByZWZlcmVuY2UgdG8gU291cmNlIFByb3BlcnRpZXMgZm9yIGEgU2lkZUVmZmVjdHMuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcGFyYW0gb1NpZGVFZmZlY3RzIFNpZGVFZmZlY3RzIGRlZmluaXRpb25cblx0ICogQHBhcmFtIG1FbnRpdHlUeXBlIEVudGl0eSB0eXBlXG5cdCAqIEBwYXJhbSBzQmluZGluZ1BhcmFtZXRlciBOYW1lIG9mIHRoZSBiaW5kaW5nIHBhcmFtZXRlclxuXHQgKiBAcmV0dXJucyBTaWRlRWZmZWN0cyBkZWZpbml0aW9uXG5cdCAqL1xuXHRwcml2YXRlIF9jb252ZXJ0U2lkZUVmZmVjdHMoXG5cdFx0b1NpZGVFZmZlY3RzOiBDb21tb25TaWRlRWZmZWN0c1R5cGUsXG5cdFx0bUVudGl0eVR5cGU6IEVudGl0eVR5cGUsXG5cdFx0c0JpbmRpbmdQYXJhbWV0ZXI/OiBzdHJpbmdcblx0KTogT0RhdGFTaWRlRWZmZWN0c1R5cGUge1xuXHRcdGNvbnN0IG9UZW1wU2lkZUVmZmVjdHMgPSB0aGlzLl9yZW1vdmVCaW5kaW5nUGFyYW1ldGVyKHRoaXMuX2NvbnZlcnRUYXJnZXRzRm9ybWF0KG9TaWRlRWZmZWN0cyksIHNCaW5kaW5nUGFyYW1ldGVyKTtcblx0XHRyZXR1cm4gdGhpcy5fYWRkUmVxdWlyZWRUZXh0UHJvcGVydGllcyhvVGVtcFNpZGVFZmZlY3RzLCBtRW50aXR5VHlwZSk7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydHMgU2lkZUVmZmVjdHMgdGFyZ2V0cyAoVGFyZ2V0RW50aXRpZXMgYW5kIFRhcmdldFByb3BlcnRpZXMpIHRvIGV4cGVjdGVkIGZvcm1hdFxuXHQgKiAgLSBUYXJnZXRQcm9wZXJ0aWVzIGFzIGFycmF5IG9mIHN0cmluZ1xuXHQgKiAgLSBUYXJnZXRFbnRpdGllcyBhcyBhcnJheSBvZiBvYmplY3Qgd2l0aCBwcm9wZXJ0eSAkTmF2aWdhdGlvblByb3BlcnR5UGF0aC5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBwYXJhbSBvU2lkZUVmZmVjdHMgU2lkZUVmZmVjdHMgZGVmaW5pdGlvblxuXHQgKiBAcmV0dXJucyBDb252ZXJ0ZWQgU2lkZUVmZmVjdHNcblx0ICovXG5cdHByaXZhdGUgX2NvbnZlcnRUYXJnZXRzRm9ybWF0KG9TaWRlRWZmZWN0czogQ29tbW9uU2lkZUVmZmVjdHNUeXBlKTogQmFzZVNpZGVFZmZlY3RzVHlwZSB7XG5cdFx0Y29uc3QgVGFyZ2V0UHJvcGVydGllczogc3RyaW5nW10gPSAoKG9TaWRlRWZmZWN0cy5UYXJnZXRQcm9wZXJ0aWVzIHx8IFtdKSBhcyAoc3RyaW5nIHwgUHJvcGVydHlQYXRoKVtdKS5yZWR1Y2UoXG5cdFx0XHRcdChhVGFyZ2V0UHJvcGVydGllczogc3RyaW5nW10sIHZUYXJnZXQpID0+IHtcblx0XHRcdFx0XHRjb25zdCBzVGFyZ2V0ID0gKCh2VGFyZ2V0IGFzIFByb3BlcnR5UGF0aCkudHlwZSAmJiAodlRhcmdldCBhcyBQcm9wZXJ0eVBhdGgpLnZhbHVlKSB8fCAodlRhcmdldCBhcyBzdHJpbmcpO1xuXHRcdFx0XHRcdGlmIChzVGFyZ2V0KSB7XG5cdFx0XHRcdFx0XHRhVGFyZ2V0UHJvcGVydGllcy5wdXNoKHNUYXJnZXQpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRMb2cuZXJyb3IoXG5cdFx0XHRcdFx0XHRcdGBTaWRlRWZmZWN0cyAtIEVycm9yIHdoaWxlIHByb2Nlc3NpbmcgVGFyZ2V0UHJvcGVydGllcyBmb3IgU2lkZUVmZmVjdHMke29TaWRlRWZmZWN0cy5mdWxseVF1YWxpZmllZE5hbWV9YFxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmV0dXJuIGFUYXJnZXRQcm9wZXJ0aWVzO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRbXVxuXHRcdFx0KSxcblx0XHRcdFRhcmdldEVudGl0aWVzOiBTaWRlRWZmZWN0c1RhcmdldEVudGl0eVR5cGVbXSA9IChvU2lkZUVmZmVjdHMuVGFyZ2V0RW50aXRpZXMgfHwgW10pLm1hcCgobVRhcmdldEVudGl0eSkgPT4ge1xuXHRcdFx0XHRyZXR1cm4geyAkTmF2aWdhdGlvblByb3BlcnR5UGF0aDogbVRhcmdldEVudGl0eS52YWx1ZSB8fCBcIlwiIH07XG5cdFx0XHR9KTtcblx0XHRyZXR1cm4geyAuLi5vU2lkZUVmZmVjdHMsIC4uLnsgVGFyZ2V0UHJvcGVydGllcywgVGFyZ2V0RW50aXRpZXMgfSB9O1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgU2lkZUVmZmVjdHMgcmVsYXRlZCB0byBhbiBlbnRpdHkgdHlwZSBvciBhY3Rpb24gdGhhdCBjb21lIGZyb20gYW4gT0RhdGEgU2VydmljZVxuXHQgKiBJbnRlcm5hbCByb3V0aW5lIHRvIGdldCwgZnJvbSBjb252ZXJ0ZWQgb0RhdGEgbWV0YU1vZGVsLCBTaWRlRWZmZWN0cyByZWxhdGVkIHRvIGEgc3BlY2lmaWMgZW50aXR5IHR5cGUgb3IgYWN0aW9uXG5cdCAqIGFuZCB0byBjb252ZXJ0IHRoZXNlIFNpZGVFZmZlY3RzIHdpdGggZXhwZWN0ZWQgZm9ybWF0LlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQHBhcmFtIG9Tb3VyY2UgRW50aXR5IHR5cGUgb3IgYWN0aW9uXG5cdCAqIEByZXR1cm5zIEFycmF5IG9mIFNpZGVFZmZlY3RzXG5cdCAqL1xuXHRwcml2YXRlIF9nZXRTaWRlRWZmZWN0c0Zyb21Tb3VyY2Uob1NvdXJjZTogRW50aXR5VHlwZSB8IEFjdGlvbik6IE9EYXRhU2lkZUVmZmVjdHNUeXBlW10ge1xuXHRcdGNvbnN0IGFTaWRlRWZmZWN0czogT0RhdGFTaWRlRWZmZWN0c1R5cGVbXSA9IFtdO1xuXHRcdGNvbnN0IG1FbnRpdHlUeXBlOiBFbnRpdHlUeXBlIHwgdW5kZWZpbmVkID0gb1NvdXJjZS5fdHlwZSA9PT0gXCJFbnRpdHlUeXBlXCIgPyBvU291cmNlIDogb1NvdXJjZS5zb3VyY2VFbnRpdHlUeXBlO1xuXHRcdGlmIChtRW50aXR5VHlwZSkge1xuXHRcdFx0Y29uc3QgbUNvbW1vbkFubm90YXRpb24gPSBvU291cmNlLmFubm90YXRpb25zPy5Db21tb24gfHwgKHt9IGFzIFJlY29yZDxzdHJpbmcsIEFubm90YXRpb25UZXJtPGFueT4+KTtcblx0XHRcdGNvbnN0IG1CaW5kaW5nUGFyYW1ldGVyID0gKChvU291cmNlIGFzIEFjdGlvbikucGFyYW1ldGVycyB8fCBbXSkuZmluZChcblx0XHRcdFx0KG1QYXJhbWV0ZXIpID0+IG1QYXJhbWV0ZXIudHlwZSA9PT0gbUVudGl0eVR5cGUuZnVsbHlRdWFsaWZpZWROYW1lXG5cdFx0XHQpO1xuXHRcdFx0Y29uc3Qgc0JpbmRpbmdQYXJhbWV0ZXIgPSBtQmluZGluZ1BhcmFtZXRlciA/IG1CaW5kaW5nUGFyYW1ldGVyLmZ1bGx5UXVhbGlmaWVkTmFtZS5zcGxpdChcIi9cIilbMV0gOiBcIlwiO1xuXHRcdFx0T2JqZWN0LmtleXMobUNvbW1vbkFubm90YXRpb24pXG5cdFx0XHRcdC5maWx0ZXIoKHNBbm5vdGF0aW9uTmFtZSkgPT4gbUNvbW1vbkFubm90YXRpb25bc0Fubm90YXRpb25OYW1lXS4kVHlwZSA9PT0gQ29tbW9uQW5ub3RhdGlvblR5cGVzLlNpZGVFZmZlY3RzVHlwZSlcblx0XHRcdFx0LmZvckVhY2goKHNBbm5vdGF0aW9uTmFtZSkgPT4ge1xuXHRcdFx0XHRcdGFTaWRlRWZmZWN0cy5wdXNoKFxuXHRcdFx0XHRcdFx0dGhpcy5fY29udmVydFNpZGVFZmZlY3RzKFxuXHRcdFx0XHRcdFx0XHRtQ29tbW9uQW5ub3RhdGlvbltzQW5ub3RhdGlvbk5hbWVdIGFzIENvbW1vblNpZGVFZmZlY3RzVHlwZSxcblx0XHRcdFx0XHRcdFx0bUVudGl0eVR5cGUsXG5cdFx0XHRcdFx0XHRcdHNCaW5kaW5nUGFyYW1ldGVyXG5cdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fSk7XG5cdFx0fVxuXHRcdHJldHVybiBhU2lkZUVmZmVjdHM7XG5cdH1cblxuXHQvKipcblx0ICogTG9ncyBTaWRlRWZmZWN0cyByZXF1ZXN0LlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQHBhcmFtIGFQYXRoRXhwcmVzc2lvbnMgU2lkZUVmZmVjdHMgdGFyZ2V0c1xuXHQgKiBAcGFyYW0gb0NvbnRleHQgQ29udGV4dFxuXHQgKi9cblx0cHJpdmF0ZSBfbG9nUmVxdWVzdChhUGF0aEV4cHJlc3Npb25zOiBTaWRlRWZmZWN0c1RhcmdldFtdLCBvQ29udGV4dDogQ29udGV4dCkge1xuXHRcdGNvbnN0IHNUYXJnZXRQYXRocyA9IGFQYXRoRXhwcmVzc2lvbnMucmVkdWNlKGZ1bmN0aW9uIChzUGF0aHMsIG1UYXJnZXQpIHtcblx0XHRcdHJldHVybiBgJHtzUGF0aHN9XFxuXFx0XFx0JHsobVRhcmdldCBhcyBTaWRlRWZmZWN0c1RhcmdldEVudGl0eVR5cGUpLiROYXZpZ2F0aW9uUHJvcGVydHlQYXRoIHx8IG1UYXJnZXQgfHwgXCJcIn1gO1xuXHRcdH0sIFwiXCIpO1xuXHRcdExvZy5kZWJ1ZyhgU2lkZUVmZmVjdHMgLSBSZXF1ZXN0OlxcblxcdENvbnRleHQgcGF0aCA6ICR7b0NvbnRleHQuZ2V0UGF0aCgpfVxcblxcdFByb3BlcnR5IHBhdGhzIDoke3NUYXJnZXRQYXRoc31gKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIG5hbWUgb2YgYmluZGluZyBwYXJhbWV0ZXIgb24gU2lkZUVmZmVjdHMgdGFyZ2V0cy5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBwYXJhbSBvU2lkZUVmZmVjdHMgU2lkZUVmZmVjdHMgZGVmaW5pdGlvblxuXHQgKiBAcGFyYW0gc0JpbmRpbmdQYXJhbWV0ZXJOYW1lIE5hbWUgb2YgYmluZGluZyBwYXJhbWV0ZXJcblx0ICogQHJldHVybnMgU2lkZUVmZmVjdHMgZGVmaW5pdGlvblxuXHQgKi9cblx0cHJpdmF0ZSBfcmVtb3ZlQmluZGluZ1BhcmFtZXRlcihvU2lkZUVmZmVjdHM6IEJhc2VTaWRlRWZmZWN0c1R5cGUsIHNCaW5kaW5nUGFyYW1ldGVyTmFtZT86IHN0cmluZyk6IEJhc2VTaWRlRWZmZWN0c1R5cGUge1xuXHRcdGlmIChzQmluZGluZ1BhcmFtZXRlck5hbWUpIHtcblx0XHRcdGNvbnN0IHJlcGxhY2VCaW5kaW5nUGFyYW1ldGVyID0gZnVuY3Rpb24gKHZhbHVlOiBzdHJpbmcpIHtcblx0XHRcdFx0cmV0dXJuIHZhbHVlLnJlcGxhY2UobmV3IFJlZ0V4cChgXiR7c0JpbmRpbmdQYXJhbWV0ZXJOYW1lfS8/YCksIFwiXCIpO1xuXHRcdFx0fTtcblxuXHRcdFx0b1NpZGVFZmZlY3RzLlRhcmdldFByb3BlcnRpZXMgPSBvU2lkZUVmZmVjdHMuVGFyZ2V0UHJvcGVydGllcy5tYXAoKHRhcmdldFByb3BlcnR5KSA9PiByZXBsYWNlQmluZGluZ1BhcmFtZXRlcih0YXJnZXRQcm9wZXJ0eSkpO1xuXHRcdFx0b1NpZGVFZmZlY3RzLlRhcmdldEVudGl0aWVzID0gb1NpZGVFZmZlY3RzLlRhcmdldEVudGl0aWVzLm1hcCgodGFyZ2V0RW50aXR5KSA9PiB7XG5cdFx0XHRcdHJldHVybiB7ICROYXZpZ2F0aW9uUHJvcGVydHlQYXRoOiByZXBsYWNlQmluZGluZ1BhcmFtZXRlcih0YXJnZXRFbnRpdHkuJE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgpIH07XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0cmV0dXJuIG9TaWRlRWZmZWN0cztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmUgZHVwbGljYXRlcyBpbiBTaWRlRWZmZWN0cyB0YXJnZXRzLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQHBhcmFtIHRhcmdldFByb3BlcnRpZXMgU2lkZUVmZmVjdHMgVGFyZ2V0UHJvcGVydGllc1xuXHQgKiBAcGFyYW0gdGFyZ2V0RW50aXRpZXMgU2lkZUVmZmVjdHMgVGFyZ2V0RW50aXRpZXNcblx0ICogQHJldHVybnMgU2lkZUVmZmVjdHMgdGFyZ2V0cyB3aXRob3V0IGR1cGxpY2F0ZXNcblx0ICovXG5cdHByaXZhdGUgX3JlbW92ZUR1cGxpY2F0ZVRhcmdldHModGFyZ2V0UHJvcGVydGllczogc3RyaW5nW10sIHRhcmdldEVudGl0aWVzOiBTaWRlRWZmZWN0c1RhcmdldEVudGl0eVR5cGVbXSk6IFNpZGVFZmZlY3RzVGFyZ2V0VHlwZSB7XG5cdFx0Y29uc3QgdW5pcXVlVGFyZ2V0ZWRFbnRpdGllc1BhdGggPSBuZXcgU2V0PHN0cmluZz4oW10pO1xuXHRcdGNvbnN0IHVuaXF1ZVRhcmdldFByb3BlcnRpZXMgPSBuZXcgU2V0PHN0cmluZz4odGFyZ2V0UHJvcGVydGllcyk7XG5cdFx0Y29uc3QgdW5pcXVlVGFyZ2V0ZWRFbnRpdGllcyA9IHRhcmdldEVudGl0aWVzLmZpbHRlcigodGFyZ2V0RW50aXR5KSA9PiB7XG5cdFx0XHRjb25zdCBuYXZpZ2F0aW9uUGF0aCA9IHRhcmdldEVudGl0eS4kTmF2aWdhdGlvblByb3BlcnR5UGF0aDtcblx0XHRcdGlmICghdW5pcXVlVGFyZ2V0ZWRFbnRpdGllc1BhdGguaGFzKG5hdmlnYXRpb25QYXRoKSkge1xuXHRcdFx0XHR1bmlxdWVUYXJnZXRlZEVudGl0aWVzUGF0aC5hZGQobmF2aWdhdGlvblBhdGgpO1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9KTtcblxuXHRcdHJldHVybiB7IFRhcmdldFByb3BlcnRpZXM6IEFycmF5LmZyb20odW5pcXVlVGFyZ2V0UHJvcGVydGllcyksIFRhcmdldEVudGl0aWVzOiB1bmlxdWVUYXJnZXRlZEVudGl0aWVzIH07XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyBTaWRlRWZmZWN0cyBhY3Rpb24gdHlwZSB0aGF0IGNvbWUgZnJvbSBhbiBPRGF0YSBTZXJ2aWNlXG5cdCAqIEludGVybmFsIHJvdXRpbmUgdG8gZ2V0LCBmcm9tIGNvbnZlcnRlZCBvRGF0YSBtZXRhTW9kZWwsIFNpZGVFZmZlY3RzIG9uIGFjdGlvbnNcblx0ICogcmVsYXRlZCB0byBhIHNwZWNpZmljIGVudGl0eSB0eXBlIGFuZCB0byBjb252ZXJ0IHRoZXNlIFNpZGVFZmZlY3RzIHdpdGhcblx0ICogZXhwZWN0ZWQgZm9ybWF0LlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQHBhcmFtIGVudGl0eVR5cGUgRW50aXR5IHR5cGVcblx0ICogQHJldHVybnMgRW50aXR5IHR5cGUgU2lkZUVmZmVjdHMgZGljdGlvbmFyeVxuXHQgKi9cblx0cHJpdmF0ZSBfcmV0cmlldmVPRGF0YUFjdGlvbnNTaWRlRWZmZWN0cyhlbnRpdHlUeXBlOiBFbnRpdHlUeXBlKTogUmVjb3JkPHN0cmluZywgQWN0aW9uU2lkZUVmZmVjdHNUeXBlPiB7XG5cdFx0Y29uc3Qgc2lkZUVmZmVjdHM6IFJlY29yZDxzdHJpbmcsIEFjdGlvblNpZGVFZmZlY3RzVHlwZT4gPSB7fTtcblx0XHRjb25zdCBhY3Rpb25zID0gZW50aXR5VHlwZS5hY3Rpb25zO1xuXHRcdGlmIChhY3Rpb25zKSB7XG5cdFx0XHRPYmplY3Qua2V5cyhhY3Rpb25zKS5mb3JFYWNoKChhY3Rpb25OYW1lKSA9PiB7XG5cdFx0XHRcdGNvbnN0IGFjdGlvbiA9IGVudGl0eVR5cGUuYWN0aW9uc1thY3Rpb25OYW1lXTtcblx0XHRcdFx0Y29uc3QgdHJpZ2dlckFjdGlvbnMgPSBuZXcgU2V0PHN0cmluZz4oKTtcblx0XHRcdFx0bGV0IHRhcmdldFByb3BlcnRpZXM6IHN0cmluZ1tdID0gW107XG5cdFx0XHRcdGxldCB0YXJnZXRFbnRpdGllczogU2lkZUVmZmVjdHNUYXJnZXRFbnRpdHlUeXBlW10gPSBbXTtcblxuXHRcdFx0XHR0aGlzLl9nZXRTaWRlRWZmZWN0c0Zyb21Tb3VyY2UoYWN0aW9uKS5mb3JFYWNoKChvRGF0YVNpZGVFZmZlY3QpID0+IHtcblx0XHRcdFx0XHRjb25zdCB0cmlnZ2VyQWN0aW9uID0gb0RhdGFTaWRlRWZmZWN0LlRyaWdnZXJBY3Rpb247XG5cdFx0XHRcdFx0dGFyZ2V0UHJvcGVydGllcyA9IHRhcmdldFByb3BlcnRpZXMuY29uY2F0KG9EYXRhU2lkZUVmZmVjdC5UYXJnZXRQcm9wZXJ0aWVzKTtcblx0XHRcdFx0XHR0YXJnZXRFbnRpdGllcyA9IHRhcmdldEVudGl0aWVzLmNvbmNhdChvRGF0YVNpZGVFZmZlY3QuVGFyZ2V0RW50aXRpZXMpO1xuXHRcdFx0XHRcdGlmICh0cmlnZ2VyQWN0aW9uKSB7XG5cdFx0XHRcdFx0XHR0cmlnZ2VyQWN0aW9ucy5hZGQodHJpZ2dlckFjdGlvbik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdFx0Y29uc3Qgc2lkZUVmZmVjdHNUYXJnZXRzID0gdGhpcy5fcmVtb3ZlRHVwbGljYXRlVGFyZ2V0cyh0YXJnZXRQcm9wZXJ0aWVzLCB0YXJnZXRFbnRpdGllcyk7XG5cdFx0XHRcdHNpZGVFZmZlY3RzW2FjdGlvbk5hbWVdID0ge1xuXHRcdFx0XHRcdHBhdGhFeHByZXNzaW9uczogWy4uLnNpZGVFZmZlY3RzVGFyZ2V0cy5UYXJnZXRQcm9wZXJ0aWVzLCAuLi5zaWRlRWZmZWN0c1RhcmdldHMuVGFyZ2V0RW50aXRpZXNdLFxuXHRcdFx0XHRcdHRyaWdnZXJBY3Rpb25zOiBBcnJheS5mcm9tKHRyaWdnZXJBY3Rpb25zKVxuXHRcdFx0XHR9O1xuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdHJldHVybiBzaWRlRWZmZWN0cztcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIFNpZGVFZmZlY3RzIGVudGl0eSB0eXBlIHRoYXQgY29tZSBmcm9tIGFuIE9EYXRhIFNlcnZpY2Vcblx0ICogSW50ZXJuYWwgcm91dGluZSB0byBnZXQsIGZyb20gY29udmVydGVkIG9EYXRhIG1ldGFNb2RlbCwgU2lkZUVmZmVjdHNcblx0ICogcmVsYXRlZCB0byBhIHNwZWNpZmljIGVudGl0eSB0eXBlIGFuZCB0byBjb252ZXJ0IHRoZXNlIFNpZGVFZmZlY3RzIHdpdGhcblx0ICogZXhwZWN0ZWQgZm9ybWF0LlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQHBhcmFtIG1FbnRpdHlUeXBlIEVudGl0eSB0eXBlXG5cdCAqIEByZXR1cm5zIEVudGl0eSB0eXBlIFNpZGVFZmZlY3RzIGRpY3Rpb25hcnlcblx0ICovXG5cdHByaXZhdGUgX3JldHJpZXZlT0RhdGFFbnRpdHlTaWRlRWZmZWN0cyhtRW50aXR5VHlwZTogRW50aXR5VHlwZSk6IFJlY29yZDxzdHJpbmcsIE9EYXRhU2lkZUVmZmVjdHNUeXBlPiB7XG5cdFx0Y29uc3Qgb0VudGl0eVNpZGVFZmZlY3RzOiBSZWNvcmQ8c3RyaW5nLCBPRGF0YVNpZGVFZmZlY3RzVHlwZT4gPSB7fTtcblx0XHR0aGlzLl9nZXRTaWRlRWZmZWN0c0Zyb21Tb3VyY2UobUVudGl0eVR5cGUpLmZvckVhY2goKG9TaWRlRWZmZWN0cykgPT4ge1xuXHRcdFx0b0VudGl0eVNpZGVFZmZlY3RzW29TaWRlRWZmZWN0cy5mdWxseVF1YWxpZmllZE5hbWVdID0gb1NpZGVFZmZlY3RzO1xuXHRcdH0pO1xuXHRcdHJldHVybiBvRW50aXR5U2lkZUVmZmVjdHM7XG5cdH1cblxuXHRnZXRJbnRlcmZhY2UoKTogU2lkZUVmZmVjdHNTZXJ2aWNlIHtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxufVxuXG5jbGFzcyBTaWRlRWZmZWN0c1NlcnZpY2VGYWN0b3J5IGV4dGVuZHMgU2VydmljZUZhY3Rvcnk8U2lkZUVmZmVjdHNTZXR0aW5ncz4ge1xuXHRjcmVhdGVJbnN0YW5jZShvU2VydmljZUNvbnRleHQ6IFNlcnZpY2VDb250ZXh0PFNpZGVFZmZlY3RzU2V0dGluZ3M+KTogUHJvbWlzZTxTaWRlRWZmZWN0c1NlcnZpY2U+IHtcblx0XHRjb25zdCBTaWRlRWZmZWN0c1NlcnZpY2VTZXJ2aWNlID0gbmV3IFNpZGVFZmZlY3RzU2VydmljZShvU2VydmljZUNvbnRleHQpO1xuXHRcdHJldHVybiBTaWRlRWZmZWN0c1NlcnZpY2VTZXJ2aWNlLmluaXRQcm9taXNlO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFNpZGVFZmZlY3RzU2VydmljZUZhY3Rvcnk7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7OztNQWtGYUEsa0JBQWtCO0lBQUE7SUFBQTtNQUFBO0lBQUE7SUFBQTtJQUFBO0lBSzlCO0lBQUEsT0FDQUMsSUFBSSxHQUFKLGdCQUFPO01BQ04sSUFBSSxDQUFDQyxpQkFBaUIsR0FBRztRQUN4QkMsS0FBSyxFQUFFO1VBQ05DLFFBQVEsRUFBRSxDQUFDLENBQUM7VUFDWkMsT0FBTyxFQUFFLENBQUM7UUFDWCxDQUFDO1FBQ0RDLE9BQU8sRUFBRSxDQUFDO01BQ1gsQ0FBQztNQUNELElBQUksQ0FBQ0MsYUFBYSxHQUFHLEtBQUs7TUFDMUIsSUFBSSxDQUFDQyxXQUFXLEdBQUdDLE9BQU8sQ0FBQ0MsT0FBTyxDQUFDLElBQUksQ0FBQztJQUN6Qzs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BYkM7SUFBQSxPQWNPQyxxQkFBcUIsR0FBNUIsK0JBQTZCQyxXQUFtQixFQUFFQyxXQUErRCxFQUFRO01BQ3hILElBQUlBLFdBQVcsQ0FBQ0MsZUFBZSxFQUFFO1FBQ2hDLE1BQU1DLGtCQUEwQyxHQUFHO1VBQ2xELEdBQUdGLFdBQVc7VUFDZEcsa0JBQWtCLEVBQUcsR0FBRUos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