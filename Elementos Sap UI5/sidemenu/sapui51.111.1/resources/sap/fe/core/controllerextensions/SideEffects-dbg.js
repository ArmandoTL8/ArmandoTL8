/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/helpers/SideEffectsHelper", "sap/ui/core/mvc/ControllerExtension", "../CommonUtils", "../helpers/ClassSupport"], function (Log, SideEffectsHelper, ControllerExtension, CommonUtils, ClassSupport) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _dec31, _dec32, _dec33, _dec34, _dec35, _dec36, _dec37, _dec38, _class, _class2;
  var publicExtension = ClassSupport.publicExtension;
  var privateExtension = ClassSupport.privateExtension;
  var methodOverride = ClassSupport.methodOverride;
  var finalExtension = ClassSupport.finalExtension;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  let SideEffectsControllerExtension = (_dec = defineUI5Class("sap.fe.core.controllerextensions.SideEffects"), _dec2 = methodOverride(), _dec3 = publicExtension(), _dec4 = finalExtension(), _dec5 = publicExtension(), _dec6 = finalExtension(), _dec7 = publicExtension(), _dec8 = finalExtension(), _dec9 = publicExtension(), _dec10 = finalExtension(), _dec11 = publicExtension(), _dec12 = finalExtension(), _dec13 = publicExtension(), _dec14 = finalExtension(), _dec15 = publicExtension(), _dec16 = finalExtension(), _dec17 = publicExtension(), _dec18 = finalExtension(), _dec19 = publicExtension(), _dec20 = finalExtension(), _dec21 = publicExtension(), _dec22 = finalExtension(), _dec23 = publicExtension(), _dec24 = finalExtension(), _dec25 = publicExtension(), _dec26 = finalExtension(), _dec27 = privateExtension(), _dec28 = finalExtension(), _dec29 = publicExtension(), _dec30 = finalExtension(), _dec31 = privateExtension(), _dec32 = finalExtension(), _dec33 = privateExtension(), _dec34 = finalExtension(), _dec35 = privateExtension(), _dec36 = finalExtension(), _dec37 = publicExtension(), _dec38 = finalExtension(), _dec(_class = (_class2 = /*#__PURE__*/function (_ControllerExtension) {
    _inheritsLoose(SideEffectsControllerExtension, _ControllerExtension);
    function SideEffectsControllerExtension() {
      return _ControllerExtension.apply(this, arguments) || this;
    }
    var _proto = SideEffectsControllerExtension.prototype;
    _proto.onInit = function onInit() {
      this._view = this.base.getView();
      this._sideEffectsService = CommonUtils.getAppComponent(this._view).getSideEffectsService();
      this._registeredFieldGroupMap = {};
      this._fieldGroupInvalidity = {};
      this._registeredFailedSideEffects = {};
    }

    /**
     * Adds a SideEffects control.
     *
     * @function
     * @name addControlSideEffects
     * @param entityType Name of the entity where the SideEffects control will be registered
     * @param controlSideEffects SideEffects to register. Ensure the sourceControlId matches the associated SAPUI5 control ID.
     */;
    _proto.addControlSideEffects = function addControlSideEffects(entityType, controlSideEffects) {
      this._sideEffectsService.addControlSideEffects(entityType, controlSideEffects);
    }

    /**
     * Removes SideEffects created by a control.
     *
     * @function
     * @name removeControlSideEffects
     * @param control SAPUI5 Control
     */;
    _proto.removeControlSideEffects = function removeControlSideEffects(control) {
      var _control$isA;
      const controlId = ((_control$isA = control.isA) === null || _control$isA === void 0 ? void 0 : _control$isA.call(control, "sap.ui.base.ManagedObject")) && control.getId();
      if (controlId) {
        this._sideEffectsService.removeControlSideEffects(controlId);
      }
    }

    /**
     * Gets the appropriate context on which SideEffects can be requested.
     * The correct one must have the binding parameter $$patchWithoutSideEffects.
     *
     * @function
     * @name getContextForSideEffects
     * @param bindingContext Initial binding context
     * @param sideEffectEntityType EntityType of the sideEffects
     * @returns SAPUI5 Context or undefined
     */;
    _proto.getContextForSideEffects = function getContextForSideEffects(bindingContext, sideEffectEntityType) {
      let contextForSideEffects = bindingContext,
        entityType = this._sideEffectsService.getEntityTypeFromContext(bindingContext);
      if (sideEffectEntityType !== entityType) {
        contextForSideEffects = bindingContext.getBinding().getContext();
        if (contextForSideEffects) {
          entityType = this._sideEffectsService.getEntityTypeFromContext(contextForSideEffects);
          if (sideEffectEntityType !== entityType) {
            contextForSideEffects = contextForSideEffects.getBinding().getContext();
            if (contextForSideEffects) {
              entityType = this._sideEffectsService.getEntityTypeFromContext(contextForSideEffects);
              if (sideEffectEntityType !== entityType) {
                return undefined;
              }
            }
          }
        }
      }
      return contextForSideEffects || undefined;
    }

    /**
     * Gets the SideEffects map for a field
     * These SideEffects are
     * - listed into FieldGroupIds (coming from an OData Service)
     * - generated by a control or controls and that configure this field as SourceProperties.
     *
     * @function
     * @name getFieldSideEffectsMap
     * @param field Field control
     * @returns SideEffects map
     */;
    _proto.getFieldSideEffectsMap = function getFieldSideEffectsMap(field) {
      let sideEffectsMap = {};
      const fieldGroupIds = field.getFieldGroupIds(),
        viewEntitySetSetName = this._view.getViewData().entitySet,
        viewEntitySet = this._sideEffectsService.getConvertedMetaModel().entitySets.find(entitySet => {
          return entitySet.name === viewEntitySetSetName;
        });

      // SideEffects coming from an OData Service
      sideEffectsMap = this.getSideEffectsMapForFieldGroups(fieldGroupIds, field);

      // SideEffects coming from control(s)
      if (viewEntitySetSetName && viewEntitySet) {
        const viewEntityType = viewEntitySet.entityType.fullyQualifiedName,
          fieldPath = this.getTargetProperty(field),
          context = this.getContextForSideEffects(field.getBindingContext(), viewEntityType);
        if (fieldPath && context) {
          const controlSideEffectsEntityType = this._sideEffectsService.getControlEntitySideEffects(viewEntityType);
          Object.keys(controlSideEffectsEntityType).forEach(sideEffectsName => {
            const oControlSideEffects = controlSideEffectsEntityType[sideEffectsName];
            if (oControlSideEffects.SourceProperties.includes(fieldPath)) {
              const name = `${sideEffectsName}::${viewEntityType}`;
              sideEffectsMap[name] = {
                name: name,
                immediate: true,
                sideEffects: oControlSideEffects,
                context: context
              };
            }
          });
        }
      }
      return sideEffectsMap;
    }

    /**
     * Gets the sideEffects map for fieldGroups.
     *
     * @function
     * @name getSideEffectsMapForFieldGroups
     * @param fieldGroupIds Field group ids
     * @param field Field control
     * @returns SideEffects map
     */;
    _proto.getSideEffectsMapForFieldGroups = function getSideEffectsMapForFieldGroups(fieldGroupIds, field) {
      const mSideEffectsMap = {};
      fieldGroupIds.forEach(fieldGroupId => {
        const {
          name,
          immediate,
          sideEffects,
          sideEffectEntityType
        } = this._getSideEffectsPropertyForFieldGroup(fieldGroupId);
        const oContext = field ? this.getContextForSideEffects(field.getBindingContext(), sideEffectEntityType) : undefined;
        if (sideEffects && (!field || field && oContext)) {
          mSideEffectsMap[name] = {
            name,
            immediate,
            sideEffects
          };
          if (field) {
            mSideEffectsMap[name].context = oContext;
          }
        }
      });
      return mSideEffectsMap;
    }

    /**
     * Clear recorded validation status for all properties.
     *
     * @function
     * @name clearFieldGroupsValidity
     */;
    _proto.clearFieldGroupsValidity = function clearFieldGroupsValidity() {
      this._fieldGroupInvalidity = {};
    }

    /**
     * Clear recorded validation status for all properties.
     *
     * @function
     * @name isFieldGroupValid
     * @param fieldGroupId Field group id
     * @param context Context
     * @returns SAPUI5 Context or undefined
     */;
    _proto.isFieldGroupValid = function isFieldGroupValid(fieldGroupId, context) {
      const id = this._getFieldGroupIndex(fieldGroupId, context);
      return Object.keys(this._fieldGroupInvalidity[id] ?? {}).length === 0;
    }

    /**
     * Gets the relative target property related to the Field.
     *
     * @function
     * @name getTargetProperty
     * @param field Field control
     * @returns Relative target property
     */;
    _proto.getTargetProperty = function getTargetProperty(field) {
      var _this$_view$getBindin;
      const fieldPath = field.data("sourcePath");
      const metaModel = this._view.getModel().getMetaModel();
      const viewBindingPath = (_this$_view$getBindin = this._view.getBindingContext()) === null || _this$_view$getBindin === void 0 ? void 0 : _this$_view$getBindin.getPath();
      const viewMetaModelPath = viewBindingPath ? `${metaModel.getMetaPath(viewBindingPath)}/` : "";
      return fieldPath === null || fieldPath === void 0 ? void 0 : fieldPath.replace(viewMetaModelPath, "");
    }

    /**
     * Manages the workflow for SideEffects with related changes to a field
     * The following scenarios are managed:
     *  - Execute: triggers immediate SideEffects requests if the promise for the field event is fulfilled
     *  - Register: caches deferred SideEffects that will be executed when the FieldGroup is unfocused.
     *
     * @function
     * @name handleFieldChange
     * @param event SAPUI5 event that comes from a field change
     * @param fieldValidity
     * @param fieldGroupPreRequisite Promise to be fulfilled before executing deferred SideEffects
     * @returns  Promise on SideEffects request(s)
     */;
    _proto.handleFieldChange = async function handleFieldChange(event, fieldValidity, fieldGroupPreRequisite) {
      const field = event.getSource();
      this._saveFieldPropertiesStatus(field, fieldValidity);
      if (!fieldValidity) {
        return;
      }
      try {
        await (event.getParameter("promise") ?? Promise.resolve());
      } catch (e) {
        Log.debug("Prerequisites on Field for the SideEffects have been rejected", e);
        return;
      }
      return this._manageSideEffectsFromField(field, fieldGroupPreRequisite ?? Promise.resolve());
    }

    /**
     * Manages SideEffects with a related 'focus out' to a field group.
     *
     * @function
     * @name handleFieldGroupChange
     * @param event SAPUI5 Event
     * @returns Promise returning true if the SideEffects have been successfully executed
     */;
    _proto.handleFieldGroupChange = function handleFieldGroupChange(event) {
      const field = event.getSource(),
        fieldGroupIds = event.getParameter("fieldGroupIds"),
        fieldGroupsSideEffects = fieldGroupIds.reduce((results, fieldGroupId) => {
          return results.concat(this.getRegisteredSideEffectsForFieldGroup(fieldGroupId));
        }, []);
      return Promise.all(fieldGroupsSideEffects.map(fieldGroupSideEffects => {
        return this._requestFieldGroupSideEffects(fieldGroupSideEffects);
      })).catch(error => {
        var _field$getBindingCont;
        const contextPath = (_field$getBindingCont = field.getBindingContext()) === null || _field$getBindingCont === void 0 ? void 0 : _field$getBindingCont.getPath();
        Log.debug(`Error while processing FieldGroup SideEffects on context ${contextPath}`, error);
      });
    }

    /**
     * Request SideEffects on a specific context.
     *
     * @function
     * @name requestSideEffects
     * @param sideEffects SideEffects to be executed
     * @param context Context where SideEffects need to be executed
     * @param groupId
     * @param fnGetTargets The callback function which will give us the targets and actions if it was coming through some specific handling.
     * @returns SideEffects request on SAPUI5 context
     */;
    _proto.requestSideEffects = async function requestSideEffects(sideEffects, context, groupId, fnGetTargets) {
      let targets, triggerAction;
      if (fnGetTargets) {
        const targetsAndActionData = await fnGetTargets(sideEffects);
        targets = targetsAndActionData["aTargets"];
        triggerAction = targetsAndActionData["TriggerAction"];
      } else {
        targets = [...(sideEffects.TargetEntities ?? []), ...(sideEffects.TargetProperties ?? [])];
        triggerAction = sideEffects.TriggerAction;
      }
      if (triggerAction) {
        this._sideEffectsService.executeAction(triggerAction, context, groupId);
      }
      if (targets.length) {
        return this._sideEffectsService.requestSideEffects(targets, context, groupId).catch(error => {
          this.registerFailedSideEffects(sideEffects, context);
          throw error;
        });
      }
    }

    /**
     * Gets failed SideEffects.
     *
     * @function
     * @name getRegisteredFailedRequests
     * @returns Registered SideEffects requests that have failed
     */;
    _proto.getRegisteredFailedRequests = function getRegisteredFailedRequests() {
      return this._registeredFailedSideEffects;
    }

    /**
     * Adds SideEffects to the queue of the failed SideEffects
     * The SideEffects are retriggered on the next change on the same context.
     *
     * @function
     * @name registerFailedSideEffects
     * @param sideEffects SideEffects that need to be retriggered
     * @param context Context where SideEffects have failed
     */;
    _proto.registerFailedSideEffects = function registerFailedSideEffects(sideEffects, context) {
      const contextPath = context.getPath();
      this._registeredFailedSideEffects[contextPath] = this._registeredFailedSideEffects[contextPath] ?? [];
      const isNotAlreadyListed = this._registeredFailedSideEffects[contextPath].every(mFailedSideEffects => sideEffects.fullyQualifiedName !== mFailedSideEffects.fullyQualifiedName);
      if (isNotAlreadyListed) {
        this._registeredFailedSideEffects[contextPath].push(sideEffects);
      }
    }

    /**
     * Deletes SideEffects to the queue of the failed SideEffects for a context.
     *
     * @function
     * @name unregisterFailedSideEffectsForAContext
     * @param contextPath Context path where SideEffects have failed
     */;
    _proto.unregisterFailedSideEffectsForAContext = function unregisterFailedSideEffectsForAContext(contextPath) {
      delete this._registeredFailedSideEffects[contextPath];
    }

    /**
     * Deletes SideEffects to the queue of the failed SideEffects.
     *
     * @function
     * @name unregisterFailedSideEffects
     * @param sideEffectsFullyQualifiedName SideEffects that need to be retriggered
     * @param context Context where SideEffects have failed
     */;
    _proto.unregisterFailedSideEffects = function unregisterFailedSideEffects(sideEffectsFullyQualifiedName, context) {
      var _this$_registeredFail;
      const contextPath = context.getPath();
      if ((_this$_registeredFail = this._registeredFailedSideEffects[contextPath]) !== null && _this$_registeredFail !== void 0 && _this$_registeredFail.length) {
        this._registeredFailedSideEffects[contextPath] = this._registeredFailedSideEffects[contextPath].filter(sideEffects => sideEffects.fullyQualifiedName !== sideEffectsFullyQualifiedName);
      }
    }

    /**
     * Adds SideEffects to the queue of a FieldGroup
     * The SideEffects are triggered when event related to the field group change is fired.
     *
     * @function
     * @name registerFieldGroupSideEffects
     * @param sideEffectsProperties SideEffects properties
     * @param fieldGroupPreRequisite Promise to fullfil before executing the SideEffects
     */;
    _proto.registerFieldGroupSideEffects = function registerFieldGroupSideEffects(sideEffectsProperties, fieldGroupPreRequisite) {
      const id = this._getFieldGroupIndex(sideEffectsProperties.name, sideEffectsProperties.context);
      if (!this._registeredFieldGroupMap[id]) {
        this._registeredFieldGroupMap[id] = {
          promise: fieldGroupPreRequisite ?? Promise.resolve(),
          sideEffectProperty: sideEffectsProperties
        };
      }
    }

    /**
     * Deletes SideEffects to the queue of a FieldGroup.
     *
     * @function
     * @name unregisterFieldGroupSideEffects
     * @param sideEffectsProperties SideEffects properties
     */;
    _proto.unregisterFieldGroupSideEffects = function unregisterFieldGroupSideEffects(sideEffectsProperties) {
      const {
        context,
        name
      } = sideEffectsProperties;
      const id = this._getFieldGroupIndex(name, context);
      delete this._registeredFieldGroupMap[id];
    }

    /**
     * Gets the registered SideEffects into the queue for a field group id.
     *
     * @function
     * @name getRegisteredSideEffectsForFieldGroup
     * @param fieldGroupId Field group id
     * @returns Array of registered SideEffects and their promise
     */;
    _proto.getRegisteredSideEffectsForFieldGroup = function getRegisteredSideEffectsForFieldGroup(fieldGroupId) {
      const sideEffects = [];
      for (const registryIndex of Object.keys(this._registeredFieldGroupMap)) {
        if (registryIndex.startsWith(`${fieldGroupId}_`)) {
          sideEffects.push(this._registeredFieldGroupMap[registryIndex]);
        }
      }
      return sideEffects;
    }

    /**
     * Gets a status index.
     *
     * @function
     * @name _getFieldGroupIndex
     * @param fieldGroupId The field group id
     * @param context SAPUI5 Context
     * @returns Index
     */;
    _proto._getFieldGroupIndex = function _getFieldGroupIndex(fieldGroupId, context) {
      return `${fieldGroupId}_${context.getPath()}`;
    }

    /**
     * Gets sideEffects properties from a field group id
     * The properties are:
     *  - name
     *  - sideEffects definition
     *  - sideEffects entity type
     *  - immediate sideEffects.
     *
     * @function
     * @name _getSideEffectsPropertyForFieldGroup
     * @param fieldGroupId
     * @returns SideEffects properties
     */;
    _proto._getSideEffectsPropertyForFieldGroup = function _getSideEffectsPropertyForFieldGroup(fieldGroupId) {
      var _this$_sideEffectsSer;
      /**
       * string "$$ImmediateRequest" is added to the SideEffects name during templating to know
       * if this SideEffects must be immediately executed requested (on field change) or must
       * be deferred (on field group focus out)
       *
       */
      const immediate = fieldGroupId.indexOf(SideEffectsHelper.IMMEDIATE_REQUEST) !== -1,
        name = fieldGroupId.replace(SideEffectsHelper.IMMEDIATE_REQUEST, ""),
        sideEffectParts = name.split("#"),
        sideEffectEntityType = sideEffectParts[0],
        sideEffectPath = `${sideEffectEntityType}@com.sap.vocabularies.Common.v1.SideEffects${sideEffectParts.length === 2 ? `#${sideEffectParts[1]}` : ""}`,
        sideEffects = (_this$_sideEffectsSer = this._sideEffectsService.getODataEntitySideEffects(sideEffectEntityType)) === null || _this$_sideEffectsSer === void 0 ? void 0 : _this$_sideEffectsSer[sideEffectPath];
      return {
        name,
        immediate,
        sideEffects,
        sideEffectEntityType
      };
    }

    /**
     * Manages the SideEffects for a field.
     *
     * @function
     * @name _manageSideEffectsFromField
     * @param field Field control
     * @param fieldGroupPreRequisite Promise to fullfil before executing deferred SideEffects
     * @returns Promise related to the requested immediate sideEffects and registered deferred SideEffects
     */;
    _proto._manageSideEffectsFromField = async function _manageSideEffectsFromField(field, fieldGroupPreRequisite) {
      const sideEffectsMap = this.getFieldSideEffectsMap(field);
      try {
        const failedSideEffectsPromises = [];
        const sideEffectsPromises = Object.keys(sideEffectsMap).map(sideEffectsName => {
          const sideEffectsProperties = sideEffectsMap[sideEffectsName];
          if (sideEffectsProperties.immediate === true) {
            // if this SideEffects is recorded as failed SideEffects, need to remove it.
            this.unregisterFailedSideEffects(sideEffectsProperties.sideEffects.fullyQualifiedName, sideEffectsProperties.context);
            return this.requestSideEffects(sideEffectsProperties.sideEffects, sideEffectsProperties.context);
          }
          return this.registerFieldGroupSideEffects(sideEffectsProperties, fieldGroupPreRequisite);
        });

        //Replay failed SideEffects related to the view or Field
        for (const context of [field.getBindingContext(), this._view.getBindingContext()]) {
          if (context) {
            const contextPath = context.getPath();
            const failedSideEffects = this._registeredFailedSideEffects[contextPath] ?? [];
            this.unregisterFailedSideEffectsForAContext(contextPath);
            for (const failedSideEffect of failedSideEffects) {
              failedSideEffectsPromises.push(this.requestSideEffects(failedSideEffect, context));
            }
          }
        }
        await Promise.all(sideEffectsPromises.concat(failedSideEffectsPromises));
      } catch (e) {
        Log.debug(`Error while managing Field SideEffects`, e);
      }
    }

    /**
     * Requests the SideEffects for a fieldGroup.
     *
     * @function
     * @name _requestFieldGroupSideEffects
     * @param fieldGroupSideEffects Field group sideEffects with its promise
     * @returns Promise returning true if the SideEffects have been successfully executed
     */;
    _proto._requestFieldGroupSideEffects = async function _requestFieldGroupSideEffects(fieldGroupSideEffects) {
      this.unregisterFieldGroupSideEffects(fieldGroupSideEffects.sideEffectProperty);
      try {
        await fieldGroupSideEffects.promise;
      } catch (e) {
        Log.debug(`Error while processing FieldGroup SideEffects`, e);
        return;
      }
      try {
        const {
          sideEffects,
          context,
          name
        } = fieldGroupSideEffects.sideEffectProperty;
        if (this.isFieldGroupValid(name, context)) {
          await this.requestSideEffects(sideEffects, context);
        }
      } catch (e) {
        Log.debug(`Error while executing FieldGroup SideEffects`, e);
      }
    }

    /**
     * Saves the validation status of properties related to a field control.
     *
     * @param field The field control
     * @param success Status of the field validation
     */;
    _proto._saveFieldPropertiesStatus = function _saveFieldPropertiesStatus(field, success) {
      const sideEffectsMap = this.getFieldSideEffectsMap(field);
      Object.keys(sideEffectsMap).forEach(key => {
        const {
          name,
          immediate,
          context
        } = sideEffectsMap[key];
        if (!immediate) {
          const id = this._getFieldGroupIndex(name, context);
          if (success) {
            var _this$_fieldGroupInva;
            (_this$_fieldGroupInva = this._fieldGroupInvalidity[id]) === null || _this$_fieldGroupInva === void 0 ? true : delete _this$_fieldGroupInva[field.getId()];
          } else {
            this._fieldGroupInvalidity[id] = {
              ...this._fieldGroupInvalidity[id],
              ...{
                [field.getId()]: true
              }
            };
          }
        }
      });
    };
    return SideEffectsControllerExtension;
  }(ControllerExtension), (_applyDecoratedDescriptor(_class2.prototype, "onInit", [_dec2], Object.getOwnPropertyDescriptor(_class2.prototype, "onInit"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "addControlSideEffects", [_dec3, _dec4], Object.getOwnPropertyDescriptor(_class2.prototype, "addControlSideEffects"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "removeControlSideEffects", [_dec5, _dec6], Object.getOwnPropertyDescriptor(_class2.prototype, "removeControlSideEffects"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getContextForSideEffects", [_dec7, _dec8], Object.getOwnPropertyDescriptor(_class2.prototype, "getContextForSideEffects"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getFieldSideEffectsMap", [_dec9, _dec10], Object.getOwnPropertyDescriptor(_class2.prototype, "getFieldSideEffectsMap"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getSideEffectsMapForFieldGroups", [_dec11, _dec12], Object.getOwnPropertyDescriptor(_class2.prototype, "getSideEffectsMapForFieldGroups"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "clearFieldGroupsValidity", [_dec13, _dec14], Object.getOwnPropertyDescriptor(_class2.prototype, "clearFieldGroupsValidity"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "isFieldGroupValid", [_dec15, _dec16], Object.getOwnPropertyDescriptor(_class2.prototype, "isFieldGroupValid"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getTargetProperty", [_dec17, _dec18], Object.getOwnPropertyDescriptor(_class2.prototype, "getTargetProperty"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "handleFieldChange", [_dec19, _dec20], Object.getOwnPropertyDescriptor(_class2.prototype, "handleFieldChange"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "handleFieldGroupChange", [_dec21, _dec22], Object.getOwnPropertyDescriptor(_class2.prototype, "handleFieldGroupChange"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "requestSideEffects", [_dec23, _dec24], Object.getOwnPropertyDescriptor(_class2.prototype, "requestSideEffects"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getRegisteredFailedRequests", [_dec25, _dec26], Object.getOwnPropertyDescriptor(_class2.prototype, "getRegisteredFailedRequests"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "registerFailedSideEffects", [_dec27, _dec28], Object.getOwnPropertyDescriptor(_class2.prototype, "registerFailedSideEffects"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "unregisterFailedSideEffectsForAContext", [_dec29, _dec30], Object.getOwnPropertyDescriptor(_class2.prototype, "unregisterFailedSideEffectsForAContext"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "unregisterFailedSideEffects", [_dec31, _dec32], Object.getOwnPropertyDescriptor(_class2.prototype, "unregisterFailedSideEffects"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "registerFieldGroupSideEffects", [_dec33, _dec34], Object.getOwnPropertyDescriptor(_class2.prototype, "registerFieldGroupSideEffects"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "unregisterFieldGroupSideEffects", [_dec35, _dec36], Object.getOwnPropertyDescriptor(_class2.prototype, "unregisterFieldGroupSideEffects"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getRegisteredSideEffectsForFieldGroup", [_dec37, _dec38], Object.getOwnPropertyDescriptor(_class2.prototype, "getRegisteredSideEffectsForFieldGroup"), _class2.prototype)), _class2)) || _class);
  return SideEffectsControllerExtension;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaWRlRWZmZWN0c0NvbnRyb2xsZXJFeHRlbnNpb24iLCJkZWZpbmVVSTVDbGFzcyIsIm1ldGhvZE92ZXJyaWRlIiwicHVibGljRXh0ZW5zaW9uIiwiZmluYWxFeHRlbnNpb24iLCJwcml2YXRlRXh0ZW5zaW9uIiwib25Jbml0IiwiX3ZpZXciLCJiYXNlIiwiZ2V0VmlldyIsIl9zaWRlRWZmZWN0c1NlcnZpY2UiLCJDb21tb25VdGlscyIsImdldEFwcENvbXBvbmVudCIsImdldFNpZGVFZmZlY3RzU2VydmljZSIsIl9yZWdpc3RlcmVkRmllbGRHcm91cE1hcCIsIl9maWVsZEdyb3VwSW52YWxpZGl0eSIsIl9yZWdpc3RlcmVkRmFpbGVkU2lkZUVmZmVjdHMiLCJhZGRDb250cm9sU2lkZUVmZmVjdHMiLCJlbnRpdHlUeXBlIiwiY29udHJvbFNpZGVFZmZlY3RzIiwicmVtb3ZlQ29udHJvbFNpZGVFZmZlY3RzIiwiY29udHJvbCIsImNvbnRyb2xJZCIsImlzQSIsImdldElkIiwiZ2V0Q29udGV4dEZvclNpZGVFZmZlY3RzIiwiYmluZGluZ0NvbnRleHQiLCJzaWRlRWZmZWN0RW50aXR5VHlwZSIsImNvbnRleHRGb3JTaWRlRWZmZWN0cyIsImdldEVudGl0eVR5cGVGcm9tQ29udGV4dCIsImdldEJpbmRpbmciLCJnZXRDb250ZXh0IiwidW5kZWZpbmVkIiwiZ2V0RmllbGRTaWRlRWZmZWN0c01hcCIsImZpZWxkIiwic2lkZUVmZmVjdHNNYXAiLCJmaWVsZEdyb3VwSWRzIiwiZ2V0RmllbGRHcm91cElkcyIsInZpZXdFbnRpdHlTZXRTZXROYW1lIiwiZ2V0Vmlld0RhdGEiLCJlbnRpdHlTZXQiLCJ2aWV3RW50aXR5U2V0IiwiZ2V0Q29udmVydGVkTWV0YU1vZGVsIiwiZW50aXR5U2V0cyIsImZpbmQiLCJuYW1lIiwiZ2V0U2lkZUVmZmVjdHNNYXBGb3JGaWVsZEdyb3VwcyIsInZpZXdFbnRpdHlUeXBlIiwiZnVsbHlRdWFsaWZpZWROYW1lIiwiZmllbGRQYXRoIiwiZ2V0VGFyZ2V0UHJvcGVydHkiLCJjb250ZXh0IiwiZ2V0QmluZGluZ0NvbnRleHQiLCJjb250cm9sU2lkZUVmZmVjdHNFbnRpdHlUeXBlIiwiZ2V0Q29udHJvbEVudGl0eVNpZGVFZmZlY3RzIiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJzaWRlRWZmZWN0c05hbWUiLCJvQ29udHJvbFNpZGVFZmZlY3RzIiwiU291cmNlUHJvcGVydGllcyIsImluY2x1ZGVzIiwiaW1tZWRpYXRlIiwic2lkZUVmZmVjdHMiLCJtU2lkZUVmZmVjdHNNYXAiLCJmaWVsZEdyb3VwSWQiLCJfZ2V0U2lkZUVmZmVjdHNQcm9wZXJ0eUZvckZpZWxkR3JvdXAiLCJvQ29udGV4dCIsImNsZWFyRmllbGRHcm91cHNWYWxpZGl0eSIsImlzRmllbGRHcm91cFZhbGlkIiwiaWQiLCJfZ2V0RmllbGRHcm91cEluZGV4IiwibGVuZ3RoIiwiZGF0YSIsIm1ldGFNb2RlbCIsImdldE1vZGVsIiwiZ2V0TWV0YU1vZGVsIiwidmlld0JpbmRpbmdQYXRoIiwiZ2V0UGF0aCIsInZpZXdNZXRhTW9kZWxQYXRoIiwiZ2V0TWV0YVBhdGgiLCJyZXBsYWNlIiwiaGFuZGxlRmllbGRDaGFuZ2UiLCJldmVudCIsImZpZWxkVmFsaWRpdHkiLCJmaWVsZEdyb3VwUHJlUmVxdWlzaXRlIiwiZ2V0U291cmNlIiwiX3NhdmVGaWVsZFByb3BlcnRpZXNTdGF0dXMiLCJnZXRQYXJhbWV0ZXIiLCJQcm9taXNlIiwicmVzb2x2ZSIsImUiLCJMb2ciLCJkZWJ1ZyIsIl9tYW5hZ2VTaWRlRWZmZWN0c0Zyb21GaWVsZCIsImhhbmRsZUZpZWxkR3JvdXBDaGFuZ2UiLCJmaWVsZEdyb3Vwc1NpZGVFZmZlY3RzIiwicmVkdWNlIiwicmVzdWx0cyIsImNvbmNhdCIsImdldFJlZ2lzdGVyZWRTaWRlRWZmZWN0c0ZvckZpZWxkR3JvdXAiLCJhbGwiLCJtYXAiLCJmaWVsZEdyb3VwU2lkZUVmZmVjdHMiLCJfcmVxdWVzdEZpZWxkR3JvdXBTaWRlRWZmZWN0cyIsImNhdGNoIiwiZXJyb3IiLCJjb250ZXh0UGF0aCIsInJlcXVlc3RTaWRlRWZmZWN0cyIsImdyb3VwSWQiLCJmbkdldFRhcmdldHMiLCJ0YXJnZXRzIiwidHJpZ2dlckFjdGlvbiIsInRhcmdldHNBbmRBY3Rpb25EYXRhIiwiVGFyZ2V0RW50aXRpZXMiLCJUYXJnZXRQcm9wZXJ0aWVzIiwiVHJpZ2dlckFjdGlvbiIsImV4ZWN1dGVBY3Rpb24iLCJyZWdpc3RlckZhaWxlZFNpZGVFZmZlY3RzIiwiZ2V0UmVnaXN0ZXJlZEZhaWxlZFJlcXVlc3RzIiwiaXNOb3RBbHJlYWR5TGlzdGVkIiwiZXZlcnkiLCJtRmFpbGVkU2lkZUVmZmVjdHMiLCJwdXNoIiwidW5yZWdpc3RlckZhaWxlZFNpZGVFZmZlY3RzRm9yQUNvbnRleHQiLCJ1bnJlZ2lzdGVyRmFpbGVkU2lkZUVmZmVjdHMiLCJzaWRlRWZmZWN0c0Z1bGx5UXVhbGlmaWVkTmFtZSIsImZpbHRlciIsInJlZ2lzdGVyRmllbGRHcm91cFNpZGVFZmZlY3RzIiwic2lkZUVmZmVjdHNQcm9wZXJ0aWVzIiwicHJvbWlzZSIsInNpZGVFZmZlY3RQcm9wZXJ0eSIsInVucmVnaXN0ZXJGaWVsZEdyb3VwU2lkZUVmZmVjdHMiLCJyZWdpc3RyeUluZGV4Iiwic3RhcnRzV2l0aCIsImluZGV4T2YiLCJTaWRlRWZmZWN0c0hlbHBlciIsIklNTUVESUFURV9SRVFVRVNUIiwic2lkZUVmZmVjdFBhcnRzIiwic3BsaXQiLCJzaWRlRWZmZWN0UGF0aCIsImdldE9EYXRhRW50aXR5U2lkZUVmZmVjdHMiLCJmYWlsZWRTaWRlRWZmZWN0c1Byb21pc2VzIiwic2lkZUVmZmVjdHNQcm9taXNlcyIsImZhaWxlZFNpZGVFZmZlY3RzIiwiZmFpbGVkU2lkZUVmZmVjdCIsInN1Y2Nlc3MiLCJrZXkiLCJDb250cm9sbGVyRXh0ZW5zaW9uIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJTaWRlRWZmZWN0cy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBTaWRlRWZmZWN0c0hlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9TaWRlRWZmZWN0c0hlbHBlclwiO1xuaW1wb3J0IHR5cGUge1xuXHRDb250cm9sU2lkZUVmZmVjdHNUeXBlLFxuXHRPRGF0YVNpZGVFZmZlY3RzVHlwZSxcblx0U2lkZUVmZmVjdHNTZXJ2aWNlLFxuXHRTaWRlRWZmZWN0c1RhcmdldCxcblx0U2lkZUVmZmVjdHNUeXBlXG59IGZyb20gXCJzYXAvZmUvY29yZS9zZXJ2aWNlcy9TaWRlRWZmZWN0c1NlcnZpY2VGYWN0b3J5XCI7XG5pbXBvcnQgdHlwZSBFdmVudCBmcm9tIFwic2FwL3VpL2Jhc2UvRXZlbnRcIjtcbmltcG9ydCB0eXBlIENvbnRyb2wgZnJvbSBcInNhcC91aS9jb3JlL0NvbnRyb2xcIjtcbmltcG9ydCBDb250cm9sbGVyRXh0ZW5zaW9uIGZyb20gXCJzYXAvdWkvY29yZS9tdmMvQ29udHJvbGxlckV4dGVuc2lvblwiO1xuaW1wb3J0IHR5cGUgVmlldyBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL1ZpZXdcIjtcbmltcG9ydCBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvQ29udGV4dFwiO1xuaW1wb3J0IE9EYXRhTWV0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFNZXRhTW9kZWxcIjtcbmltcG9ydCB7IFY0Q29udGV4dCB9IGZyb20gXCJ0eXBlcy9leHRlbnNpb25fdHlwZXNcIjtcbmltcG9ydCBDb21tb25VdGlscyBmcm9tIFwiLi4vQ29tbW9uVXRpbHNcIjtcbmltcG9ydCB7IEJhc2VNYW5pZmVzdFNldHRpbmdzIH0gZnJvbSBcIi4uL2NvbnZlcnRlcnMvTWFuaWZlc3RTZXR0aW5nc1wiO1xuaW1wb3J0IHsgZGVmaW5lVUk1Q2xhc3MsIGZpbmFsRXh0ZW5zaW9uLCBtZXRob2RPdmVycmlkZSwgcHJpdmF0ZUV4dGVuc2lvbiwgcHVibGljRXh0ZW5zaW9uIH0gZnJvbSBcIi4uL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgUGFnZUNvbnRyb2xsZXIgZnJvbSBcIi4uL1BhZ2VDb250cm9sbGVyXCI7XG5cbnR5cGUgQmFzZVNpZGVFZmZlY3RQcm9wZXJ0eVR5cGUgPSB7XG5cdG5hbWU6IHN0cmluZztcblx0aW1tZWRpYXRlPzogYm9vbGVhbjtcblx0c2lkZUVmZmVjdHM6IFNpZGVFZmZlY3RzVHlwZTtcbn07XG5cbmV4cG9ydCB0eXBlIE1hc3NFZGl0RmllbGRTaWRlRWZmZWN0UHJvcGVydHlUeXBlID0gQmFzZVNpZGVFZmZlY3RQcm9wZXJ0eVR5cGU7XG5cbmV4cG9ydCB0eXBlIEZpZWxkU2lkZUVmZmVjdFByb3BlcnR5VHlwZSA9IEJhc2VTaWRlRWZmZWN0UHJvcGVydHlUeXBlICYge1xuXHRjb250ZXh0OiBWNENvbnRleHQ7XG59O1xuXG5leHBvcnQgdHlwZSBGaWVsZFNpZGVFZmZlY3REaWN0aW9uYXJ5ID0gUmVjb3JkPHN0cmluZywgRmllbGRTaWRlRWZmZWN0UHJvcGVydHlUeXBlPjtcblxuZXhwb3J0IHR5cGUgTWFzc0VkaXRGaWVsZFNpZGVFZmZlY3REaWN0aW9uYXJ5ID0gUmVjb3JkPHN0cmluZywgTWFzc0VkaXRGaWVsZFNpZGVFZmZlY3RQcm9wZXJ0eVR5cGU+O1xuXG50eXBlIEZhaWxlZFNpZGVFZmZlY3REaWN0aW9uYXJ5ID0gUmVjb3JkPHN0cmluZywgU2lkZUVmZmVjdHNUeXBlW10+O1xuXG5leHBvcnQgdHlwZSBGaWVsZEdyb3VwU2lkZUVmZmVjdFR5cGUgPSB7XG5cdHByb21pc2U6IFByb21pc2U8YW55Pjtcblx0c2lkZUVmZmVjdFByb3BlcnR5OiBGaWVsZFNpZGVFZmZlY3RQcm9wZXJ0eVR5cGU7XG59O1xuXG5AZGVmaW5lVUk1Q2xhc3MoXCJzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5TaWRlRWZmZWN0c1wiKVxuY2xhc3MgU2lkZUVmZmVjdHNDb250cm9sbGVyRXh0ZW5zaW9uIGV4dGVuZHMgQ29udHJvbGxlckV4dGVuc2lvbiB7XG5cdHByb3RlY3RlZCBiYXNlITogUGFnZUNvbnRyb2xsZXI7XG5cdHByaXZhdGUgX3ZpZXchOiBWaWV3O1xuXHRwcml2YXRlIF9yZWdpc3RlcmVkRmllbGRHcm91cE1hcCE6IFJlY29yZDxzdHJpbmcsIEZpZWxkR3JvdXBTaWRlRWZmZWN0VHlwZT47XG5cdHByaXZhdGUgX2ZpZWxkR3JvdXBJbnZhbGlkaXR5ITogUmVjb3JkPHN0cmluZywgUmVjb3JkPHN0cmluZywgYm9vbGVhbj4+O1xuXHRwcml2YXRlIF9zaWRlRWZmZWN0c1NlcnZpY2UhOiBTaWRlRWZmZWN0c1NlcnZpY2U7XG5cdHByaXZhdGUgX3JlZ2lzdGVyZWRGYWlsZWRTaWRlRWZmZWN0cyE6IEZhaWxlZFNpZGVFZmZlY3REaWN0aW9uYXJ5O1xuXG5cdEBtZXRob2RPdmVycmlkZSgpXG5cdG9uSW5pdCgpIHtcblx0XHR0aGlzLl92aWV3ID0gdGhpcy5iYXNlLmdldFZpZXcoKTtcblx0XHR0aGlzLl9zaWRlRWZmZWN0c1NlcnZpY2UgPSBDb21tb25VdGlscy5nZXRBcHBDb21wb25lbnQodGhpcy5fdmlldykuZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlKCk7XG5cdFx0dGhpcy5fcmVnaXN0ZXJlZEZpZWxkR3JvdXBNYXAgPSB7fTtcblx0XHR0aGlzLl9maWVsZEdyb3VwSW52YWxpZGl0eSA9IHt9O1xuXHRcdHRoaXMuX3JlZ2lzdGVyZWRGYWlsZWRTaWRlRWZmZWN0cyA9IHt9O1xuXHR9XG5cblx0LyoqXG5cdCAqIEFkZHMgYSBTaWRlRWZmZWN0cyBjb250cm9sLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgYWRkQ29udHJvbFNpZGVFZmZlY3RzXG5cdCAqIEBwYXJhbSBlbnRpdHlUeXBlIE5hbWUgb2YgdGhlIGVudGl0eSB3aGVyZSB0aGUgU2lkZUVmZmVjdHMgY29udHJvbCB3aWxsIGJlIHJlZ2lzdGVyZWRcblx0ICogQHBhcmFtIGNvbnRyb2xTaWRlRWZmZWN0cyBTaWRlRWZmZWN0cyB0byByZWdpc3Rlci4gRW5zdXJlIHRoZSBzb3VyY2VDb250cm9sSWQgbWF0Y2hlcyB0aGUgYXNzb2NpYXRlZCBTQVBVSTUgY29udHJvbCBJRC5cblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRhZGRDb250cm9sU2lkZUVmZmVjdHMoZW50aXR5VHlwZTogc3RyaW5nLCBjb250cm9sU2lkZUVmZmVjdHM6IE9taXQ8Q29udHJvbFNpZGVFZmZlY3RzVHlwZSwgXCJmdWxseVF1YWxpZmllZE5hbWVcIj4pOiB2b2lkIHtcblx0XHR0aGlzLl9zaWRlRWZmZWN0c1NlcnZpY2UuYWRkQ29udHJvbFNpZGVFZmZlY3RzKGVudGl0eVR5cGUsIGNvbnRyb2xTaWRlRWZmZWN0cyk7XG5cdH1cblxuXHQvKipcblx0ICogUmVtb3ZlcyBTaWRlRWZmZWN0cyBjcmVhdGVkIGJ5IGEgY29udHJvbC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIHJlbW92ZUNvbnRyb2xTaWRlRWZmZWN0c1xuXHQgKiBAcGFyYW0gY29udHJvbCBTQVBVSTUgQ29udHJvbFxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdHJlbW92ZUNvbnRyb2xTaWRlRWZmZWN0cyhjb250cm9sOiBDb250cm9sKTogdm9pZCB7XG5cdFx0Y29uc3QgY29udHJvbElkID0gY29udHJvbC5pc0E/LihcInNhcC51aS5iYXNlLk1hbmFnZWRPYmplY3RcIikgJiYgY29udHJvbC5nZXRJZCgpO1xuXG5cdFx0aWYgKGNvbnRyb2xJZCkge1xuXHRcdFx0dGhpcy5fc2lkZUVmZmVjdHNTZXJ2aWNlLnJlbW92ZUNvbnRyb2xTaWRlRWZmZWN0cyhjb250cm9sSWQpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIHRoZSBhcHByb3ByaWF0ZSBjb250ZXh0IG9uIHdoaWNoIFNpZGVFZmZlY3RzIGNhbiBiZSByZXF1ZXN0ZWQuXG5cdCAqIFRoZSBjb3JyZWN0IG9uZSBtdXN0IGhhdmUgdGhlIGJpbmRpbmcgcGFyYW1ldGVyICQkcGF0Y2hXaXRob3V0U2lkZUVmZmVjdHMuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBnZXRDb250ZXh0Rm9yU2lkZUVmZmVjdHNcblx0ICogQHBhcmFtIGJpbmRpbmdDb250ZXh0IEluaXRpYWwgYmluZGluZyBjb250ZXh0XG5cdCAqIEBwYXJhbSBzaWRlRWZmZWN0RW50aXR5VHlwZSBFbnRpdHlUeXBlIG9mIHRoZSBzaWRlRWZmZWN0c1xuXHQgKiBAcmV0dXJucyBTQVBVSTUgQ29udGV4dCBvciB1bmRlZmluZWRcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRnZXRDb250ZXh0Rm9yU2lkZUVmZmVjdHMoYmluZGluZ0NvbnRleHQ6IGFueSwgc2lkZUVmZmVjdEVudGl0eVR5cGU6IHN0cmluZyk6IENvbnRleHQgfCB1bmRlZmluZWQge1xuXHRcdGxldCBjb250ZXh0Rm9yU2lkZUVmZmVjdHMgPSBiaW5kaW5nQ29udGV4dCxcblx0XHRcdGVudGl0eVR5cGUgPSB0aGlzLl9zaWRlRWZmZWN0c1NlcnZpY2UuZ2V0RW50aXR5VHlwZUZyb21Db250ZXh0KGJpbmRpbmdDb250ZXh0KTtcblxuXHRcdGlmIChzaWRlRWZmZWN0RW50aXR5VHlwZSAhPT0gZW50aXR5VHlwZSkge1xuXHRcdFx0Y29udGV4dEZvclNpZGVFZmZlY3RzID0gYmluZGluZ0NvbnRleHQuZ2V0QmluZGluZygpLmdldENvbnRleHQoKTtcblx0XHRcdGlmIChjb250ZXh0Rm9yU2lkZUVmZmVjdHMpIHtcblx0XHRcdFx0ZW50aXR5VHlwZSA9IHRoaXMuX3NpZGVFZmZlY3RzU2VydmljZS5nZXRFbnRpdHlUeXBlRnJvbUNvbnRleHQoY29udGV4dEZvclNpZGVFZmZlY3RzKTtcblx0XHRcdFx0aWYgKHNpZGVFZmZlY3RFbnRpdHlUeXBlICE9PSBlbnRpdHlUeXBlKSB7XG5cdFx0XHRcdFx0Y29udGV4dEZvclNpZGVFZmZlY3RzID0gY29udGV4dEZvclNpZGVFZmZlY3RzLmdldEJpbmRpbmcoKS5nZXRDb250ZXh0KCk7XG5cdFx0XHRcdFx0aWYgKGNvbnRleHRGb3JTaWRlRWZmZWN0cykge1xuXHRcdFx0XHRcdFx0ZW50aXR5VHlwZSA9IHRoaXMuX3NpZGVFZmZlY3RzU2VydmljZS5nZXRFbnRpdHlUeXBlRnJvbUNvbnRleHQoY29udGV4dEZvclNpZGVFZmZlY3RzKTtcblx0XHRcdFx0XHRcdGlmIChzaWRlRWZmZWN0RW50aXR5VHlwZSAhPT0gZW50aXR5VHlwZSkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBjb250ZXh0Rm9yU2lkZUVmZmVjdHMgfHwgdW5kZWZpbmVkO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIFNpZGVFZmZlY3RzIG1hcCBmb3IgYSBmaWVsZFxuXHQgKiBUaGVzZSBTaWRlRWZmZWN0cyBhcmVcblx0ICogLSBsaXN0ZWQgaW50byBGaWVsZEdyb3VwSWRzIChjb21pbmcgZnJvbSBhbiBPRGF0YSBTZXJ2aWNlKVxuXHQgKiAtIGdlbmVyYXRlZCBieSBhIGNvbnRyb2wgb3IgY29udHJvbHMgYW5kIHRoYXQgY29uZmlndXJlIHRoaXMgZmllbGQgYXMgU291cmNlUHJvcGVydGllcy5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGdldEZpZWxkU2lkZUVmZmVjdHNNYXBcblx0ICogQHBhcmFtIGZpZWxkIEZpZWxkIGNvbnRyb2xcblx0ICogQHJldHVybnMgU2lkZUVmZmVjdHMgbWFwXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0Z2V0RmllbGRTaWRlRWZmZWN0c01hcChmaWVsZDogQ29udHJvbCk6IEZpZWxkU2lkZUVmZmVjdERpY3Rpb25hcnkge1xuXHRcdGxldCBzaWRlRWZmZWN0c01hcDogRmllbGRTaWRlRWZmZWN0RGljdGlvbmFyeSA9IHt9O1xuXHRcdGNvbnN0IGZpZWxkR3JvdXBJZHMgPSBmaWVsZC5nZXRGaWVsZEdyb3VwSWRzKCksXG5cdFx0XHR2aWV3RW50aXR5U2V0U2V0TmFtZSA9ICh0aGlzLl92aWV3LmdldFZpZXdEYXRhKCkgYXMgQmFzZU1hbmlmZXN0U2V0dGluZ3MpLmVudGl0eVNldCxcblx0XHRcdHZpZXdFbnRpdHlTZXQgPSB0aGlzLl9zaWRlRWZmZWN0c1NlcnZpY2UuZ2V0Q29udmVydGVkTWV0YU1vZGVsKCkuZW50aXR5U2V0cy5maW5kKChlbnRpdHlTZXQpID0+IHtcblx0XHRcdFx0cmV0dXJuIGVudGl0eVNldC5uYW1lID09PSB2aWV3RW50aXR5U2V0U2V0TmFtZTtcblx0XHRcdH0pO1xuXG5cdFx0Ly8gU2lkZUVmZmVjdHMgY29taW5nIGZyb20gYW4gT0RhdGEgU2VydmljZVxuXHRcdHNpZGVFZmZlY3RzTWFwID0gdGhpcy5nZXRTaWRlRWZmZWN0c01hcEZvckZpZWxkR3JvdXBzKGZpZWxkR3JvdXBJZHMsIGZpZWxkKSBhcyBGaWVsZFNpZGVFZmZlY3REaWN0aW9uYXJ5O1xuXG5cdFx0Ly8gU2lkZUVmZmVjdHMgY29taW5nIGZyb20gY29udHJvbChzKVxuXHRcdGlmICh2aWV3RW50aXR5U2V0U2V0TmFtZSAmJiB2aWV3RW50aXR5U2V0KSB7XG5cdFx0XHRjb25zdCB2aWV3RW50aXR5VHlwZSA9IHZpZXdFbnRpdHlTZXQuZW50aXR5VHlwZS5mdWxseVF1YWxpZmllZE5hbWUsXG5cdFx0XHRcdGZpZWxkUGF0aCA9IHRoaXMuZ2V0VGFyZ2V0UHJvcGVydHkoZmllbGQpLFxuXHRcdFx0XHRjb250ZXh0ID0gdGhpcy5nZXRDb250ZXh0Rm9yU2lkZUVmZmVjdHMoZmllbGQuZ2V0QmluZGluZ0NvbnRleHQoKSwgdmlld0VudGl0eVR5cGUpIGFzIFY0Q29udGV4dCB8IHVuZGVmaW5lZDtcblxuXHRcdFx0aWYgKGZpZWxkUGF0aCAmJiBjb250ZXh0KSB7XG5cdFx0XHRcdGNvbnN0IGNvbnRyb2xTaWRlRWZmZWN0c0VudGl0eVR5cGUgPSB0aGlzLl9zaWRlRWZmZWN0c1NlcnZpY2UuZ2V0Q29udHJvbEVudGl0eVNpZGVFZmZlY3RzKHZpZXdFbnRpdHlUeXBlKTtcblx0XHRcdFx0T2JqZWN0LmtleXMoY29udHJvbFNpZGVFZmZlY3RzRW50aXR5VHlwZSkuZm9yRWFjaCgoc2lkZUVmZmVjdHNOYW1lKSA9PiB7XG5cdFx0XHRcdFx0Y29uc3Qgb0NvbnRyb2xTaWRlRWZmZWN0cyA9IGNvbnRyb2xTaWRlRWZmZWN0c0VudGl0eVR5cGVbc2lkZUVmZmVjdHNOYW1lXTtcblx0XHRcdFx0XHRpZiAob0NvbnRyb2xTaWRlRWZmZWN0cy5Tb3VyY2VQcm9wZXJ0aWVzLmluY2x1ZGVzKGZpZWxkUGF0aCkpIHtcblx0XHRcdFx0XHRcdGNvbnN0IG5hbWUgPSBgJHtzaWRlRWZmZWN0c05hbWV9Ojoke3ZpZXdFbnRpdHlUeXBlfWA7XG5cdFx0XHRcdFx0XHRzaWRlRWZmZWN0c01hcFtuYW1lXSA9IHtcblx0XHRcdFx0XHRcdFx0bmFtZTogbmFtZSxcblx0XHRcdFx0XHRcdFx0aW1tZWRpYXRlOiB0cnVlLFxuXHRcdFx0XHRcdFx0XHRzaWRlRWZmZWN0czogb0NvbnRyb2xTaWRlRWZmZWN0cyxcblx0XHRcdFx0XHRcdFx0Y29udGV4dDogY29udGV4dFxuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gc2lkZUVmZmVjdHNNYXA7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyB0aGUgc2lkZUVmZmVjdHMgbWFwIGZvciBmaWVsZEdyb3Vwcy5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGdldFNpZGVFZmZlY3RzTWFwRm9yRmllbGRHcm91cHNcblx0ICogQHBhcmFtIGZpZWxkR3JvdXBJZHMgRmllbGQgZ3JvdXAgaWRzXG5cdCAqIEBwYXJhbSBmaWVsZCBGaWVsZCBjb250cm9sXG5cdCAqIEByZXR1cm5zIFNpZGVFZmZlY3RzIG1hcFxuXHQgKi9cblxuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0Z2V0U2lkZUVmZmVjdHNNYXBGb3JGaWVsZEdyb3Vwcyhcblx0XHRmaWVsZEdyb3VwSWRzOiBzdHJpbmdbXSxcblx0XHRmaWVsZD86IENvbnRyb2xcblx0KTogTWFzc0VkaXRGaWVsZFNpZGVFZmZlY3REaWN0aW9uYXJ5IHwgRmllbGRTaWRlRWZmZWN0RGljdGlvbmFyeSB7XG5cdFx0Y29uc3QgbVNpZGVFZmZlY3RzTWFwOiBNYXNzRWRpdEZpZWxkU2lkZUVmZmVjdERpY3Rpb25hcnkgfCBGaWVsZFNpZGVFZmZlY3REaWN0aW9uYXJ5ID0ge307XG5cdFx0ZmllbGRHcm91cElkcy5mb3JFYWNoKChmaWVsZEdyb3VwSWQpID0+IHtcblx0XHRcdGNvbnN0IHsgbmFtZSwgaW1tZWRpYXRlLCBzaWRlRWZmZWN0cywgc2lkZUVmZmVjdEVudGl0eVR5cGUgfSA9IHRoaXMuX2dldFNpZGVFZmZlY3RzUHJvcGVydHlGb3JGaWVsZEdyb3VwKGZpZWxkR3JvdXBJZCk7XG5cdFx0XHRjb25zdCBvQ29udGV4dCA9IGZpZWxkXG5cdFx0XHRcdD8gKHRoaXMuZ2V0Q29udGV4dEZvclNpZGVFZmZlY3RzKGZpZWxkLmdldEJpbmRpbmdDb250ZXh0KCksIHNpZGVFZmZlY3RFbnRpdHlUeXBlKSBhcyBWNENvbnRleHQpXG5cdFx0XHRcdDogdW5kZWZpbmVkO1xuXHRcdFx0aWYgKHNpZGVFZmZlY3RzICYmICghZmllbGQgfHwgKGZpZWxkICYmIG9Db250ZXh0KSkpIHtcblx0XHRcdFx0bVNpZGVFZmZlY3RzTWFwW25hbWVdID0ge1xuXHRcdFx0XHRcdG5hbWUsXG5cdFx0XHRcdFx0aW1tZWRpYXRlLFxuXHRcdFx0XHRcdHNpZGVFZmZlY3RzXG5cdFx0XHRcdH07XG5cdFx0XHRcdGlmIChmaWVsZCkge1xuXHRcdFx0XHRcdChtU2lkZUVmZmVjdHNNYXBbbmFtZV0gYXMgRmllbGRTaWRlRWZmZWN0UHJvcGVydHlUeXBlKS5jb250ZXh0ID0gb0NvbnRleHQhO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0cmV0dXJuIG1TaWRlRWZmZWN0c01hcDtcblx0fVxuXG5cdC8qKlxuXHQgKiBDbGVhciByZWNvcmRlZCB2YWxpZGF0aW9uIHN0YXR1cyBmb3IgYWxsIHByb3BlcnRpZXMuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBjbGVhckZpZWxkR3JvdXBzVmFsaWRpdHlcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRjbGVhckZpZWxkR3JvdXBzVmFsaWRpdHkoKTogdm9pZCB7XG5cdFx0dGhpcy5fZmllbGRHcm91cEludmFsaWRpdHkgPSB7fTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDbGVhciByZWNvcmRlZCB2YWxpZGF0aW9uIHN0YXR1cyBmb3IgYWxsIHByb3BlcnRpZXMuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBpc0ZpZWxkR3JvdXBWYWxpZFxuXHQgKiBAcGFyYW0gZmllbGRHcm91cElkIEZpZWxkIGdyb3VwIGlkXG5cdCAqIEBwYXJhbSBjb250ZXh0IENvbnRleHRcblx0ICogQHJldHVybnMgU0FQVUk1IENvbnRleHQgb3IgdW5kZWZpbmVkXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0aXNGaWVsZEdyb3VwVmFsaWQoZmllbGRHcm91cElkOiBzdHJpbmcsIGNvbnRleHQ6IFY0Q29udGV4dCk6IGJvb2xlYW4ge1xuXHRcdGNvbnN0IGlkID0gdGhpcy5fZ2V0RmllbGRHcm91cEluZGV4KGZpZWxkR3JvdXBJZCwgY29udGV4dCk7XG5cdFx0cmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuX2ZpZWxkR3JvdXBJbnZhbGlkaXR5W2lkXSA/PyB7fSkubGVuZ3RoID09PSAwO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIHJlbGF0aXZlIHRhcmdldCBwcm9wZXJ0eSByZWxhdGVkIHRvIHRoZSBGaWVsZC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGdldFRhcmdldFByb3BlcnR5XG5cdCAqIEBwYXJhbSBmaWVsZCBGaWVsZCBjb250cm9sXG5cdCAqIEByZXR1cm5zIFJlbGF0aXZlIHRhcmdldCBwcm9wZXJ0eVxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdGdldFRhcmdldFByb3BlcnR5KGZpZWxkOiBDb250cm9sKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0XHRjb25zdCBmaWVsZFBhdGggPSBmaWVsZC5kYXRhKFwic291cmNlUGF0aFwiKSBhcyBzdHJpbmc7XG5cdFx0Y29uc3QgbWV0YU1vZGVsID0gdGhpcy5fdmlldy5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpIGFzIE9EYXRhTWV0YU1vZGVsO1xuXHRcdGNvbnN0IHZpZXdCaW5kaW5nUGF0aCA9IHRoaXMuX3ZpZXcuZ2V0QmluZGluZ0NvbnRleHQoKT8uZ2V0UGF0aCgpO1xuXHRcdGNvbnN0IHZpZXdNZXRhTW9kZWxQYXRoID0gdmlld0JpbmRpbmdQYXRoID8gYCR7bWV0YU1vZGVsLmdldE1ldGFQYXRoKHZpZXdCaW5kaW5nUGF0aCl9L2AgOiBcIlwiO1xuXHRcdHJldHVybiBmaWVsZFBhdGg/LnJlcGxhY2Uodmlld01ldGFNb2RlbFBhdGgsIFwiXCIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIE1hbmFnZXMgdGhlIHdvcmtmbG93IGZvciBTaWRlRWZmZWN0cyB3aXRoIHJlbGF0ZWQgY2hhbmdlcyB0byBhIGZpZWxkXG5cdCAqIFRoZSBmb2xsb3dpbmcgc2NlbmFyaW9zIGFyZSBtYW5hZ2VkOlxuXHQgKiAgLSBFeGVjdXRlOiB0cmlnZ2VycyBpbW1lZGlhdGUgU2lkZUVmZmVjdHMgcmVxdWVzdHMgaWYgdGhlIHByb21pc2UgZm9yIHRoZSBmaWVsZCBldmVudCBpcyBmdWxmaWxsZWRcblx0ICogIC0gUmVnaXN0ZXI6IGNhY2hlcyBkZWZlcnJlZCBTaWRlRWZmZWN0cyB0aGF0IHdpbGwgYmUgZXhlY3V0ZWQgd2hlbiB0aGUgRmllbGRHcm91cCBpcyB1bmZvY3VzZWQuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBoYW5kbGVGaWVsZENoYW5nZVxuXHQgKiBAcGFyYW0gZXZlbnQgU0FQVUk1IGV2ZW50IHRoYXQgY29tZXMgZnJvbSBhIGZpZWxkIGNoYW5nZVxuXHQgKiBAcGFyYW0gZmllbGRWYWxpZGl0eVxuXHQgKiBAcGFyYW0gZmllbGRHcm91cFByZVJlcXVpc2l0ZSBQcm9taXNlIHRvIGJlIGZ1bGZpbGxlZCBiZWZvcmUgZXhlY3V0aW5nIGRlZmVycmVkIFNpZGVFZmZlY3RzXG5cdCAqIEByZXR1cm5zICBQcm9taXNlIG9uIFNpZGVFZmZlY3RzIHJlcXVlc3Qocylcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRhc3luYyBoYW5kbGVGaWVsZENoYW5nZShldmVudDogRXZlbnQsIGZpZWxkVmFsaWRpdHk6IGJvb2xlYW4sIGZpZWxkR3JvdXBQcmVSZXF1aXNpdGU/OiBQcm9taXNlPGFueT4pOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRjb25zdCBmaWVsZCA9IGV2ZW50LmdldFNvdXJjZSgpIGFzIENvbnRyb2w7XG5cdFx0dGhpcy5fc2F2ZUZpZWxkUHJvcGVydGllc1N0YXR1cyhmaWVsZCwgZmllbGRWYWxpZGl0eSk7XG5cdFx0aWYgKCFmaWVsZFZhbGlkaXR5KSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dHJ5IHtcblx0XHRcdGF3YWl0IChldmVudC5nZXRQYXJhbWV0ZXIoXCJwcm9taXNlXCIpID8/IFByb21pc2UucmVzb2x2ZSgpKTtcblx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRMb2cuZGVidWcoXCJQcmVyZXF1aXNpdGVzIG9uIEZpZWxkIGZvciB0aGUgU2lkZUVmZmVjdHMgaGF2ZSBiZWVuIHJlamVjdGVkXCIsIGUgYXMgc3RyaW5nKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMuX21hbmFnZVNpZGVFZmZlY3RzRnJvbUZpZWxkKGZpZWxkLCBmaWVsZEdyb3VwUHJlUmVxdWlzaXRlID8/IFByb21pc2UucmVzb2x2ZSgpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBNYW5hZ2VzIFNpZGVFZmZlY3RzIHdpdGggYSByZWxhdGVkICdmb2N1cyBvdXQnIHRvIGEgZmllbGQgZ3JvdXAuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBoYW5kbGVGaWVsZEdyb3VwQ2hhbmdlXG5cdCAqIEBwYXJhbSBldmVudCBTQVBVSTUgRXZlbnRcblx0ICogQHJldHVybnMgUHJvbWlzZSByZXR1cm5pbmcgdHJ1ZSBpZiB0aGUgU2lkZUVmZmVjdHMgaGF2ZSBiZWVuIHN1Y2Nlc3NmdWxseSBleGVjdXRlZFxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdGhhbmRsZUZpZWxkR3JvdXBDaGFuZ2UoZXZlbnQ6IEV2ZW50KTogUHJvbWlzZTx2b2lkIHwgdm9pZFtdPiB7XG5cdFx0Y29uc3QgZmllbGQgPSBldmVudC5nZXRTb3VyY2UoKSBhcyBDb250cm9sLFxuXHRcdFx0ZmllbGRHcm91cElkczogc3RyaW5nW10gPSBldmVudC5nZXRQYXJhbWV0ZXIoXCJmaWVsZEdyb3VwSWRzXCIpLFxuXHRcdFx0ZmllbGRHcm91cHNTaWRlRWZmZWN0cyA9IGZpZWxkR3JvdXBJZHMucmVkdWNlKChyZXN1bHRzOiBGaWVsZEdyb3VwU2lkZUVmZmVjdFR5cGVbXSwgZmllbGRHcm91cElkKSA9PiB7XG5cdFx0XHRcdHJldHVybiByZXN1bHRzLmNvbmNhdCh0aGlzLmdldFJlZ2lzdGVyZWRTaWRlRWZmZWN0c0ZvckZpZWxkR3JvdXAoZmllbGRHcm91cElkKSk7XG5cdFx0XHR9LCBbXSk7XG5cblx0XHRyZXR1cm4gUHJvbWlzZS5hbGwoXG5cdFx0XHRmaWVsZEdyb3Vwc1NpZGVFZmZlY3RzLm1hcCgoZmllbGRHcm91cFNpZGVFZmZlY3RzKSA9PiB7XG5cdFx0XHRcdHJldHVybiB0aGlzLl9yZXF1ZXN0RmllbGRHcm91cFNpZGVFZmZlY3RzKGZpZWxkR3JvdXBTaWRlRWZmZWN0cyk7XG5cdFx0XHR9KVxuXHRcdCkuY2F0Y2goKGVycm9yKSA9PiB7XG5cdFx0XHRjb25zdCBjb250ZXh0UGF0aCA9IGZpZWxkLmdldEJpbmRpbmdDb250ZXh0KCk/LmdldFBhdGgoKTtcblx0XHRcdExvZy5kZWJ1ZyhgRXJyb3Igd2hpbGUgcHJvY2Vzc2luZyBGaWVsZEdyb3VwIFNpZGVFZmZlY3RzIG9uIGNvbnRleHQgJHtjb250ZXh0UGF0aH1gLCBlcnJvcik7XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogUmVxdWVzdCBTaWRlRWZmZWN0cyBvbiBhIHNwZWNpZmljIGNvbnRleHQuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSByZXF1ZXN0U2lkZUVmZmVjdHNcblx0ICogQHBhcmFtIHNpZGVFZmZlY3RzIFNpZGVFZmZlY3RzIHRvIGJlIGV4ZWN1dGVkXG5cdCAqIEBwYXJhbSBjb250ZXh0IENvbnRleHQgd2hlcmUgU2lkZUVmZmVjdHMgbmVlZCB0byBiZSBleGVjdXRlZFxuXHQgKiBAcGFyYW0gZ3JvdXBJZFxuXHQgKiBAcGFyYW0gZm5HZXRUYXJnZXRzIFRoZSBjYWxsYmFjayBmdW5jdGlvbiB3aGljaCB3aWxsIGdpdmUgdXMgdGhlIHRhcmdldHMgYW5kIGFjdGlvbnMgaWYgaXQgd2FzIGNvbWluZyB0aHJvdWdoIHNvbWUgc3BlY2lmaWMgaGFuZGxpbmcuXG5cdCAqIEByZXR1cm5zIFNpZGVFZmZlY3RzIHJlcXVlc3Qgb24gU0FQVUk1IGNvbnRleHRcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRhc3luYyByZXF1ZXN0U2lkZUVmZmVjdHMoXG5cdFx0c2lkZUVmZmVjdHM6IFNpZGVFZmZlY3RzVHlwZSxcblx0XHRjb250ZXh0OiBWNENvbnRleHQsXG5cdFx0Z3JvdXBJZD86IHN0cmluZyxcblx0XHRmbkdldFRhcmdldHM/OiBGdW5jdGlvblxuXHQpOiBQcm9taXNlPHVua25vd24+IHtcblx0XHRsZXQgdGFyZ2V0czogU2lkZUVmZmVjdHNUYXJnZXRbXSwgdHJpZ2dlckFjdGlvbjtcblx0XHRpZiAoZm5HZXRUYXJnZXRzKSB7XG5cdFx0XHRjb25zdCB0YXJnZXRzQW5kQWN0aW9uRGF0YSA9IGF3YWl0IGZuR2V0VGFyZ2V0cyhzaWRlRWZmZWN0cyk7XG5cdFx0XHR0YXJnZXRzID0gdGFyZ2V0c0FuZEFjdGlvbkRhdGFbXCJhVGFyZ2V0c1wiXTtcblx0XHRcdHRyaWdnZXJBY3Rpb24gPSB0YXJnZXRzQW5kQWN0aW9uRGF0YVtcIlRyaWdnZXJBY3Rpb25cIl07XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRhcmdldHMgPSBbLi4uKHNpZGVFZmZlY3RzLlRhcmdldEVudGl0aWVzID8/IFtdKSwgLi4uKHNpZGVFZmZlY3RzLlRhcmdldFByb3BlcnRpZXMgPz8gW10pXTtcblx0XHRcdHRyaWdnZXJBY3Rpb24gPSAoc2lkZUVmZmVjdHMgYXMgT0RhdGFTaWRlRWZmZWN0c1R5cGUpLlRyaWdnZXJBY3Rpb247XG5cdFx0fVxuXHRcdGlmICh0cmlnZ2VyQWN0aW9uKSB7XG5cdFx0XHR0aGlzLl9zaWRlRWZmZWN0c1NlcnZpY2UuZXhlY3V0ZUFjdGlvbih0cmlnZ2VyQWN0aW9uLCBjb250ZXh0LCBncm91cElkKTtcblx0XHR9XG5cblx0XHRpZiAodGFyZ2V0cy5sZW5ndGgpIHtcblx0XHRcdHJldHVybiB0aGlzLl9zaWRlRWZmZWN0c1NlcnZpY2UucmVxdWVzdFNpZGVFZmZlY3RzKHRhcmdldHMsIGNvbnRleHQsIGdyb3VwSWQpLmNhdGNoKChlcnJvcjogdW5rbm93bikgPT4ge1xuXHRcdFx0XHR0aGlzLnJlZ2lzdGVyRmFpbGVkU2lkZUVmZmVjdHMoc2lkZUVmZmVjdHMsIGNvbnRleHQpO1xuXHRcdFx0XHR0aHJvdyBlcnJvcjtcblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIGZhaWxlZCBTaWRlRWZmZWN0cy5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGdldFJlZ2lzdGVyZWRGYWlsZWRSZXF1ZXN0c1xuXHQgKiBAcmV0dXJucyBSZWdpc3RlcmVkIFNpZGVFZmZlY3RzIHJlcXVlc3RzIHRoYXQgaGF2ZSBmYWlsZWRcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRwdWJsaWMgZ2V0UmVnaXN0ZXJlZEZhaWxlZFJlcXVlc3RzKCk6IEZhaWxlZFNpZGVFZmZlY3REaWN0aW9uYXJ5IHtcblx0XHRyZXR1cm4gdGhpcy5fcmVnaXN0ZXJlZEZhaWxlZFNpZGVFZmZlY3RzO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFkZHMgU2lkZUVmZmVjdHMgdG8gdGhlIHF1ZXVlIG9mIHRoZSBmYWlsZWQgU2lkZUVmZmVjdHNcblx0ICogVGhlIFNpZGVFZmZlY3RzIGFyZSByZXRyaWdnZXJlZCBvbiB0aGUgbmV4dCBjaGFuZ2Ugb24gdGhlIHNhbWUgY29udGV4dC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIHJlZ2lzdGVyRmFpbGVkU2lkZUVmZmVjdHNcblx0ICogQHBhcmFtIHNpZGVFZmZlY3RzIFNpZGVFZmZlY3RzIHRoYXQgbmVlZCB0byBiZSByZXRyaWdnZXJlZFxuXHQgKiBAcGFyYW0gY29udGV4dCBDb250ZXh0IHdoZXJlIFNpZGVFZmZlY3RzIGhhdmUgZmFpbGVkXG5cdCAqL1xuXHRAcHJpdmF0ZUV4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdHJlZ2lzdGVyRmFpbGVkU2lkZUVmZmVjdHMoc2lkZUVmZmVjdHM6IFNpZGVFZmZlY3RzVHlwZSwgY29udGV4dDogQ29udGV4dCk6IHZvaWQge1xuXHRcdGNvbnN0IGNvbnRleHRQYXRoID0gY29udGV4dC5nZXRQYXRoKCk7XG5cdFx0dGhpcy5fcmVnaXN0ZXJlZEZhaWxlZFNpZGVFZmZlY3RzW2NvbnRleHRQYXRoXSA9IHRoaXMuX3JlZ2lzdGVyZWRGYWlsZWRTaWRlRWZmZWN0c1tjb250ZXh0UGF0aF0gPz8gW107XG5cdFx0Y29uc3QgaXNOb3RBbHJlYWR5TGlzdGVkID0gdGhpcy5fcmVnaXN0ZXJlZEZhaWxlZFNpZGVFZmZlY3RzW2NvbnRleHRQYXRoXS5ldmVyeShcblx0XHRcdChtRmFpbGVkU2lkZUVmZmVjdHMpID0+IHNpZGVFZmZlY3RzLmZ1bGx5UXVhbGlmaWVkTmFtZSAhPT0gbUZhaWxlZFNpZGVFZmZlY3RzLmZ1bGx5UXVhbGlmaWVkTmFtZVxuXHRcdCk7XG5cdFx0aWYgKGlzTm90QWxyZWFkeUxpc3RlZCkge1xuXHRcdFx0dGhpcy5fcmVnaXN0ZXJlZEZhaWxlZFNpZGVFZmZlY3RzW2NvbnRleHRQYXRoXS5wdXNoKHNpZGVFZmZlY3RzKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogRGVsZXRlcyBTaWRlRWZmZWN0cyB0byB0aGUgcXVldWUgb2YgdGhlIGZhaWxlZCBTaWRlRWZmZWN0cyBmb3IgYSBjb250ZXh0LlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgdW5yZWdpc3RlckZhaWxlZFNpZGVFZmZlY3RzRm9yQUNvbnRleHRcblx0ICogQHBhcmFtIGNvbnRleHRQYXRoIENvbnRleHQgcGF0aCB3aGVyZSBTaWRlRWZmZWN0cyBoYXZlIGZhaWxlZFxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdHVucmVnaXN0ZXJGYWlsZWRTaWRlRWZmZWN0c0ZvckFDb250ZXh0KGNvbnRleHRQYXRoOiBzdHJpbmcpIHtcblx0XHRkZWxldGUgdGhpcy5fcmVnaXN0ZXJlZEZhaWxlZFNpZGVFZmZlY3RzW2NvbnRleHRQYXRoXTtcblx0fVxuXG5cdC8qKlxuXHQgKiBEZWxldGVzIFNpZGVFZmZlY3RzIHRvIHRoZSBxdWV1ZSBvZiB0aGUgZmFpbGVkIFNpZGVFZmZlY3RzLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgdW5yZWdpc3RlckZhaWxlZFNpZGVFZmZlY3RzXG5cdCAqIEBwYXJhbSBzaWRlRWZmZWN0c0Z1bGx5UXVhbGlmaWVkTmFtZSBTaWRlRWZmZWN0cyB0aGF0IG5lZWQgdG8gYmUgcmV0cmlnZ2VyZWRcblx0ICogQHBhcmFtIGNvbnRleHQgQ29udGV4dCB3aGVyZSBTaWRlRWZmZWN0cyBoYXZlIGZhaWxlZFxuXHQgKi9cblx0QHByaXZhdGVFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHR1bnJlZ2lzdGVyRmFpbGVkU2lkZUVmZmVjdHMoc2lkZUVmZmVjdHNGdWxseVF1YWxpZmllZE5hbWU6IHN0cmluZywgY29udGV4dDogQ29udGV4dCk6IHZvaWQge1xuXHRcdGNvbnN0IGNvbnRleHRQYXRoID0gY29udGV4dC5nZXRQYXRoKCk7XG5cdFx0aWYgKHRoaXMuX3JlZ2lzdGVyZWRGYWlsZWRTaWRlRWZmZWN0c1tjb250ZXh0UGF0aF0/Lmxlbmd0aCkge1xuXHRcdFx0dGhpcy5fcmVnaXN0ZXJlZEZhaWxlZFNpZGVFZmZlY3RzW2NvbnRleHRQYXRoXSA9IHRoaXMuX3JlZ2lzdGVyZWRGYWlsZWRTaWRlRWZmZWN0c1tjb250ZXh0UGF0aF0uZmlsdGVyKFxuXHRcdFx0XHQoc2lkZUVmZmVjdHMpID0+IHNpZGVFZmZlY3RzLmZ1bGx5UXVhbGlmaWVkTmFtZSAhPT0gc2lkZUVmZmVjdHNGdWxseVF1YWxpZmllZE5hbWVcblx0XHRcdCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEFkZHMgU2lkZUVmZmVjdHMgdG8gdGhlIHF1ZXVlIG9mIGEgRmllbGRHcm91cFxuXHQgKiBUaGUgU2lkZUVmZmVjdHMgYXJlIHRyaWdnZXJlZCB3aGVuIGV2ZW50IHJlbGF0ZWQgdG8gdGhlIGZpZWxkIGdyb3VwIGNoYW5nZSBpcyBmaXJlZC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIHJlZ2lzdGVyRmllbGRHcm91cFNpZGVFZmZlY3RzXG5cdCAqIEBwYXJhbSBzaWRlRWZmZWN0c1Byb3BlcnRpZXMgU2lkZUVmZmVjdHMgcHJvcGVydGllc1xuXHQgKiBAcGFyYW0gZmllbGRHcm91cFByZVJlcXVpc2l0ZSBQcm9taXNlIHRvIGZ1bGxmaWwgYmVmb3JlIGV4ZWN1dGluZyB0aGUgU2lkZUVmZmVjdHNcblx0ICovXG5cdEBwcml2YXRlRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0cmVnaXN0ZXJGaWVsZEdyb3VwU2lkZUVmZmVjdHMoc2lkZUVmZmVjdHNQcm9wZXJ0aWVzOiBGaWVsZFNpZGVFZmZlY3RQcm9wZXJ0eVR5cGUsIGZpZWxkR3JvdXBQcmVSZXF1aXNpdGU/OiBQcm9taXNlPHVua25vd24+KSB7XG5cdFx0Y29uc3QgaWQgPSB0aGlzLl9nZXRGaWVsZEdyb3VwSW5kZXgoc2lkZUVmZmVjdHNQcm9wZXJ0aWVzLm5hbWUsIHNpZGVFZmZlY3RzUHJvcGVydGllcy5jb250ZXh0KTtcblx0XHRpZiAoIXRoaXMuX3JlZ2lzdGVyZWRGaWVsZEdyb3VwTWFwW2lkXSkge1xuXHRcdFx0dGhpcy5fcmVnaXN0ZXJlZEZpZWxkR3JvdXBNYXBbaWRdID0ge1xuXHRcdFx0XHRwcm9taXNlOiBmaWVsZEdyb3VwUHJlUmVxdWlzaXRlID8/IFByb21pc2UucmVzb2x2ZSgpLFxuXHRcdFx0XHRzaWRlRWZmZWN0UHJvcGVydHk6IHNpZGVFZmZlY3RzUHJvcGVydGllc1xuXHRcdFx0fTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogRGVsZXRlcyBTaWRlRWZmZWN0cyB0byB0aGUgcXVldWUgb2YgYSBGaWVsZEdyb3VwLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgdW5yZWdpc3RlckZpZWxkR3JvdXBTaWRlRWZmZWN0c1xuXHQgKiBAcGFyYW0gc2lkZUVmZmVjdHNQcm9wZXJ0aWVzIFNpZGVFZmZlY3RzIHByb3BlcnRpZXNcblx0ICovXG5cdEBwcml2YXRlRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0dW5yZWdpc3RlckZpZWxkR3JvdXBTaWRlRWZmZWN0cyhzaWRlRWZmZWN0c1Byb3BlcnRpZXM6IEZpZWxkU2lkZUVmZmVjdFByb3BlcnR5VHlwZSkge1xuXHRcdGNvbnN0IHsgY29udGV4dCwgbmFtZSB9ID0gc2lkZUVmZmVjdHNQcm9wZXJ0aWVzO1xuXHRcdGNvbnN0IGlkID0gdGhpcy5fZ2V0RmllbGRHcm91cEluZGV4KG5hbWUsIGNvbnRleHQpO1xuXHRcdGRlbGV0ZSB0aGlzLl9yZWdpc3RlcmVkRmllbGRHcm91cE1hcFtpZF07XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyB0aGUgcmVnaXN0ZXJlZCBTaWRlRWZmZWN0cyBpbnRvIHRoZSBxdWV1ZSBmb3IgYSBmaWVsZCBncm91cCBpZC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGdldFJlZ2lzdGVyZWRTaWRlRWZmZWN0c0ZvckZpZWxkR3JvdXBcblx0ICogQHBhcmFtIGZpZWxkR3JvdXBJZCBGaWVsZCBncm91cCBpZFxuXHQgKiBAcmV0dXJucyBBcnJheSBvZiByZWdpc3RlcmVkIFNpZGVFZmZlY3RzIGFuZCB0aGVpciBwcm9taXNlXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0Z2V0UmVnaXN0ZXJlZFNpZGVFZmZlY3RzRm9yRmllbGRHcm91cChmaWVsZEdyb3VwSWQ6IHN0cmluZyk6IEZpZWxkR3JvdXBTaWRlRWZmZWN0VHlwZVtdIHtcblx0XHRjb25zdCBzaWRlRWZmZWN0cyA9IFtdO1xuXHRcdGZvciAoY29uc3QgcmVnaXN0cnlJbmRleCBvZiBPYmplY3Qua2V5cyh0aGlzLl9yZWdpc3RlcmVkRmllbGRHcm91cE1hcCkpIHtcblx0XHRcdGlmIChyZWdpc3RyeUluZGV4LnN0YXJ0c1dpdGgoYCR7ZmllbGRHcm91cElkfV9gKSkge1xuXHRcdFx0XHRzaWRlRWZmZWN0cy5wdXNoKHRoaXMuX3JlZ2lzdGVyZWRGaWVsZEdyb3VwTWFwW3JlZ2lzdHJ5SW5kZXhdKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHNpZGVFZmZlY3RzO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgYSBzdGF0dXMgaW5kZXguXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBfZ2V0RmllbGRHcm91cEluZGV4XG5cdCAqIEBwYXJhbSBmaWVsZEdyb3VwSWQgVGhlIGZpZWxkIGdyb3VwIGlkXG5cdCAqIEBwYXJhbSBjb250ZXh0IFNBUFVJNSBDb250ZXh0XG5cdCAqIEByZXR1cm5zIEluZGV4XG5cdCAqL1xuXHRwcml2YXRlIF9nZXRGaWVsZEdyb3VwSW5kZXgoZmllbGRHcm91cElkOiBzdHJpbmcsIGNvbnRleHQ6IFY0Q29udGV4dCk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIGAke2ZpZWxkR3JvdXBJZH1fJHtjb250ZXh0LmdldFBhdGgoKX1gO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgc2lkZUVmZmVjdHMgcHJvcGVydGllcyBmcm9tIGEgZmllbGQgZ3JvdXAgaWRcblx0ICogVGhlIHByb3BlcnRpZXMgYXJlOlxuXHQgKiAgLSBuYW1lXG5cdCAqICAtIHNpZGVFZmZlY3RzIGRlZmluaXRpb25cblx0ICogIC0gc2lkZUVmZmVjdHMgZW50aXR5IHR5cGVcblx0ICogIC0gaW1tZWRpYXRlIHNpZGVFZmZlY3RzLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgX2dldFNpZGVFZmZlY3RzUHJvcGVydHlGb3JGaWVsZEdyb3VwXG5cdCAqIEBwYXJhbSBmaWVsZEdyb3VwSWRcblx0ICogQHJldHVybnMgU2lkZUVmZmVjdHMgcHJvcGVydGllc1xuXHQgKi9cblx0cHJpdmF0ZSBfZ2V0U2lkZUVmZmVjdHNQcm9wZXJ0eUZvckZpZWxkR3JvdXAoZmllbGRHcm91cElkOiBzdHJpbmcpIHtcblx0XHQvKipcblx0XHQgKiBzdHJpbmcgXCIkJEltbWVkaWF0ZVJlcXVlc3RcIiBpcyBhZGRlZCB0byB0aGUgU2lkZUVmZmVjdHMgbmFtZSBkdXJpbmcgdGVtcGxhdGluZyB0byBrbm93XG5cdFx0ICogaWYgdGhpcyBTaWRlRWZmZWN0cyBtdXN0IGJlIGltbWVkaWF0ZWx5IGV4ZWN1dGVkIHJlcXVlc3RlZCAob24gZmllbGQgY2hhbmdlKSBvciBtdXN0XG5cdFx0ICogYmUgZGVmZXJyZWQgKG9uIGZpZWxkIGdyb3VwIGZvY3VzIG91dClcblx0XHQgKlxuXHRcdCAqL1xuXHRcdGNvbnN0IGltbWVkaWF0ZSA9IGZpZWxkR3JvdXBJZC5pbmRleE9mKFNpZGVFZmZlY3RzSGVscGVyLklNTUVESUFURV9SRVFVRVNUKSAhPT0gLTEsXG5cdFx0XHRuYW1lID0gZmllbGRHcm91cElkLnJlcGxhY2UoU2lkZUVmZmVjdHNIZWxwZXIuSU1NRURJQVRFX1JFUVVFU1QsIFwiXCIpLFxuXHRcdFx0c2lkZUVmZmVjdFBhcnRzID0gbmFtZS5zcGxpdChcIiNcIiksXG5cdFx0XHRzaWRlRWZmZWN0RW50aXR5VHlwZSA9IHNpZGVFZmZlY3RQYXJ0c1swXSxcblx0XHRcdHNpZGVFZmZlY3RQYXRoID0gYCR7c2lkZUVmZmVjdEVudGl0eVR5cGV9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5TaWRlRWZmZWN0cyR7XG5cdFx0XHRcdHNpZGVFZmZlY3RQYXJ0cy5sZW5ndGggPT09IDIgPyBgIyR7c2lkZUVmZmVjdFBhcnRzWzFdfWAgOiBcIlwiXG5cdFx0XHR9YCxcblx0XHRcdHNpZGVFZmZlY3RzOiBPRGF0YVNpZGVFZmZlY3RzVHlwZSB8IHVuZGVmaW5lZCA9XG5cdFx0XHRcdHRoaXMuX3NpZGVFZmZlY3RzU2VydmljZS5nZXRPRGF0YUVudGl0eVNpZGVFZmZlY3RzKHNpZGVFZmZlY3RFbnRpdHlUeXBlKT8uW3NpZGVFZmZlY3RQYXRoXTtcblx0XHRyZXR1cm4geyBuYW1lLCBpbW1lZGlhdGUsIHNpZGVFZmZlY3RzLCBzaWRlRWZmZWN0RW50aXR5VHlwZSB9O1xuXHR9XG5cblx0LyoqXG5cdCAqIE1hbmFnZXMgdGhlIFNpZGVFZmZlY3RzIGZvciBhIGZpZWxkLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgX21hbmFnZVNpZGVFZmZlY3RzRnJvbUZpZWxkXG5cdCAqIEBwYXJhbSBmaWVsZCBGaWVsZCBjb250cm9sXG5cdCAqIEBwYXJhbSBmaWVsZEdyb3VwUHJlUmVxdWlzaXRlIFByb21pc2UgdG8gZnVsbGZpbCBiZWZvcmUgZXhlY3V0aW5nIGRlZmVycmVkIFNpZGVFZmZlY3RzXG5cdCAqIEByZXR1cm5zIFByb21pc2UgcmVsYXRlZCB0byB0aGUgcmVxdWVzdGVkIGltbWVkaWF0ZSBzaWRlRWZmZWN0cyBhbmQgcmVnaXN0ZXJlZCBkZWZlcnJlZCBTaWRlRWZmZWN0c1xuXHQgKi9cblx0cHJpdmF0ZSBhc3luYyBfbWFuYWdlU2lkZUVmZmVjdHNGcm9tRmllbGQoZmllbGQ6IENvbnRyb2wsIGZpZWxkR3JvdXBQcmVSZXF1aXNpdGU6IFByb21pc2U8dW5rbm93bj4pOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRjb25zdCBzaWRlRWZmZWN0c01hcCA9IHRoaXMuZ2V0RmllbGRTaWRlRWZmZWN0c01hcChmaWVsZCk7XG5cdFx0dHJ5IHtcblx0XHRcdGNvbnN0IGZhaWxlZFNpZGVFZmZlY3RzUHJvbWlzZXM6ICh2b2lkIHwgUHJvbWlzZTx1bmtub3duPilbXSA9IFtdO1xuXHRcdFx0Y29uc3Qgc2lkZUVmZmVjdHNQcm9taXNlcyA9IE9iamVjdC5rZXlzKHNpZGVFZmZlY3RzTWFwKS5tYXAoKHNpZGVFZmZlY3RzTmFtZSkgPT4ge1xuXHRcdFx0XHRjb25zdCBzaWRlRWZmZWN0c1Byb3BlcnRpZXMgPSBzaWRlRWZmZWN0c01hcFtzaWRlRWZmZWN0c05hbWVdO1xuXG5cdFx0XHRcdGlmIChzaWRlRWZmZWN0c1Byb3BlcnRpZXMuaW1tZWRpYXRlID09PSB0cnVlKSB7XG5cdFx0XHRcdFx0Ly8gaWYgdGhpcyBTaWRlRWZmZWN0cyBpcyByZWNvcmRlZCBhcyBmYWlsZWQgU2lkZUVmZmVjdHMsIG5lZWQgdG8gcmVtb3ZlIGl0LlxuXHRcdFx0XHRcdHRoaXMudW5yZWdpc3RlckZhaWxlZFNpZGVFZmZlY3RzKHNpZGVFZmZlY3RzUHJvcGVydGllcy5zaWRlRWZmZWN0cy5mdWxseVF1YWxpZmllZE5hbWUsIHNpZGVFZmZlY3RzUHJvcGVydGllcy5jb250ZXh0KTtcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5yZXF1ZXN0U2lkZUVmZmVjdHMoc2lkZUVmZmVjdHNQcm9wZXJ0aWVzLnNpZGVFZmZlY3RzLCBzaWRlRWZmZWN0c1Byb3BlcnRpZXMuY29udGV4dCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIHRoaXMucmVnaXN0ZXJGaWVsZEdyb3VwU2lkZUVmZmVjdHMoc2lkZUVmZmVjdHNQcm9wZXJ0aWVzLCBmaWVsZEdyb3VwUHJlUmVxdWlzaXRlKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQvL1JlcGxheSBmYWlsZWQgU2lkZUVmZmVjdHMgcmVsYXRlZCB0byB0aGUgdmlldyBvciBGaWVsZFxuXHRcdFx0Zm9yIChjb25zdCBjb250ZXh0IG9mIFtmaWVsZC5nZXRCaW5kaW5nQ29udGV4dCgpLCB0aGlzLl92aWV3LmdldEJpbmRpbmdDb250ZXh0KCldKSB7XG5cdFx0XHRcdGlmIChjb250ZXh0KSB7XG5cdFx0XHRcdFx0Y29uc3QgY29udGV4dFBhdGggPSBjb250ZXh0LmdldFBhdGgoKTtcblx0XHRcdFx0XHRjb25zdCBmYWlsZWRTaWRlRWZmZWN0cyA9IHRoaXMuX3JlZ2lzdGVyZWRGYWlsZWRTaWRlRWZmZWN0c1tjb250ZXh0UGF0aF0gPz8gW107XG5cdFx0XHRcdFx0dGhpcy51bnJlZ2lzdGVyRmFpbGVkU2lkZUVmZmVjdHNGb3JBQ29udGV4dChjb250ZXh0UGF0aCk7XG5cdFx0XHRcdFx0Zm9yIChjb25zdCBmYWlsZWRTaWRlRWZmZWN0IG9mIGZhaWxlZFNpZGVFZmZlY3RzKSB7XG5cdFx0XHRcdFx0XHRmYWlsZWRTaWRlRWZmZWN0c1Byb21pc2VzLnB1c2godGhpcy5yZXF1ZXN0U2lkZUVmZmVjdHMoZmFpbGVkU2lkZUVmZmVjdCwgY29udGV4dCBhcyBWNENvbnRleHQpKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0YXdhaXQgUHJvbWlzZS5hbGwoc2lkZUVmZmVjdHNQcm9taXNlcy5jb25jYXQoZmFpbGVkU2lkZUVmZmVjdHNQcm9taXNlcykpO1xuXHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdExvZy5kZWJ1ZyhgRXJyb3Igd2hpbGUgbWFuYWdpbmcgRmllbGQgU2lkZUVmZmVjdHNgLCBlIGFzIHN0cmluZyk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFJlcXVlc3RzIHRoZSBTaWRlRWZmZWN0cyBmb3IgYSBmaWVsZEdyb3VwLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgX3JlcXVlc3RGaWVsZEdyb3VwU2lkZUVmZmVjdHNcblx0ICogQHBhcmFtIGZpZWxkR3JvdXBTaWRlRWZmZWN0cyBGaWVsZCBncm91cCBzaWRlRWZmZWN0cyB3aXRoIGl0cyBwcm9taXNlXG5cdCAqIEByZXR1cm5zIFByb21pc2UgcmV0dXJuaW5nIHRydWUgaWYgdGhlIFNpZGVFZmZlY3RzIGhhdmUgYmVlbiBzdWNjZXNzZnVsbHkgZXhlY3V0ZWRcblx0ICovXG5cdHByaXZhdGUgYXN5bmMgX3JlcXVlc3RGaWVsZEdyb3VwU2lkZUVmZmVjdHMoZmllbGRHcm91cFNpZGVFZmZlY3RzOiBGaWVsZEdyb3VwU2lkZUVmZmVjdFR5cGUpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHR0aGlzLnVucmVnaXN0ZXJGaWVsZEdyb3VwU2lkZUVmZmVjdHMoZmllbGRHcm91cFNpZGVFZmZlY3RzLnNpZGVFZmZlY3RQcm9wZXJ0eSk7XG5cdFx0dHJ5IHtcblx0XHRcdGF3YWl0IGZpZWxkR3JvdXBTaWRlRWZmZWN0cy5wcm9taXNlO1xuXHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdExvZy5kZWJ1ZyhgRXJyb3Igd2hpbGUgcHJvY2Vzc2luZyBGaWVsZEdyb3VwIFNpZGVFZmZlY3RzYCwgZSBhcyBzdHJpbmcpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgeyBzaWRlRWZmZWN0cywgY29udGV4dCwgbmFtZSB9ID0gZmllbGRHcm91cFNpZGVFZmZlY3RzLnNpZGVFZmZlY3RQcm9wZXJ0eTtcblx0XHRcdGlmICh0aGlzLmlzRmllbGRHcm91cFZhbGlkKG5hbWUsIGNvbnRleHQpKSB7XG5cdFx0XHRcdGF3YWl0IHRoaXMucmVxdWVzdFNpZGVFZmZlY3RzKHNpZGVFZmZlY3RzLCBjb250ZXh0KTtcblx0XHRcdH1cblx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRMb2cuZGVidWcoYEVycm9yIHdoaWxlIGV4ZWN1dGluZyBGaWVsZEdyb3VwIFNpZGVFZmZlY3RzYCwgZSBhcyBzdHJpbmcpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBTYXZlcyB0aGUgdmFsaWRhdGlvbiBzdGF0dXMgb2YgcHJvcGVydGllcyByZWxhdGVkIHRvIGEgZmllbGQgY29udHJvbC5cblx0ICpcblx0ICogQHBhcmFtIGZpZWxkIFRoZSBmaWVsZCBjb250cm9sXG5cdCAqIEBwYXJhbSBzdWNjZXNzIFN0YXR1cyBvZiB0aGUgZmllbGQgdmFsaWRhdGlvblxuXHQgKi9cblx0cHJpdmF0ZSBfc2F2ZUZpZWxkUHJvcGVydGllc1N0YXR1cyhmaWVsZDogQ29udHJvbCwgc3VjY2VzczogYm9vbGVhbik6IHZvaWQge1xuXHRcdGNvbnN0IHNpZGVFZmZlY3RzTWFwID0gdGhpcy5nZXRGaWVsZFNpZGVFZmZlY3RzTWFwKGZpZWxkKTtcblx0XHRPYmplY3Qua2V5cyhzaWRlRWZmZWN0c01hcCkuZm9yRWFjaCgoa2V5KSA9PiB7XG5cdFx0XHRjb25zdCB7IG5hbWUsIGltbWVkaWF0ZSwgY29udGV4dCB9ID0gc2lkZUVmZmVjdHNNYXBba2V5XTtcblx0XHRcdGlmICghaW1tZWRpYXRlKSB7XG5cdFx0XHRcdGNvbnN0IGlkID0gdGhpcy5fZ2V0RmllbGRHcm91cEluZGV4KG5hbWUsIGNvbnRleHQpO1xuXHRcdFx0XHRpZiAoc3VjY2Vzcykge1xuXHRcdFx0XHRcdGRlbGV0ZSB0aGlzLl9maWVsZEdyb3VwSW52YWxpZGl0eVtpZF0/LltmaWVsZC5nZXRJZCgpXTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0aGlzLl9maWVsZEdyb3VwSW52YWxpZGl0eVtpZF0gPSB7XG5cdFx0XHRcdFx0XHQuLi50aGlzLl9maWVsZEdyb3VwSW52YWxpZGl0eVtpZF0sXG5cdFx0XHRcdFx0XHQuLi57IFtmaWVsZC5nZXRJZCgpXTogdHJ1ZSB9XG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFNpZGVFZmZlY3RzQ29udHJvbGxlckV4dGVuc2lvbjtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7OztNQTZDTUEsOEJBQThCLFdBRG5DQyxjQUFjLENBQUMsOENBQThDLENBQUMsVUFTN0RDLGNBQWMsRUFBRSxVQWlCaEJDLGVBQWUsRUFBRSxVQUNqQkMsY0FBYyxFQUFFLFVBWWhCRCxlQUFlLEVBQUUsVUFDakJDLGNBQWMsRUFBRSxVQW1CaEJELGVBQWUsRUFBRSxVQUNqQkMsY0FBYyxFQUFFLFVBbUNoQkQsZUFBZSxFQUFFLFdBQ2pCQyxjQUFjLEVBQUUsV0ErQ2hCRCxlQUFlLEVBQUUsV0FDakJDLGNBQWMsRUFBRSxXQStCaEJELGVBQWUsRUFBRSxXQUNqQkMsY0FBYyxFQUFFLFdBY2hCRCxlQUFlLEVBQUUsV0FDakJDLGNBQWMsRUFBRSxXQWNoQkQsZUFBZSxFQUFFLFdBQ2pCQyxjQUFjLEVBQUUsV0FzQmhCRCxlQUFlLEVBQUUsV0FDakJDLGNBQWMsRUFBRSxXQXlCaEJELGVBQWUsRUFBRSxXQUNqQkMsY0FBYyxFQUFFLFdBNkJoQkQsZUFBZSxFQUFFLFdBQ2pCQyxjQUFjLEVBQUUsV0FtQ2hCRCxlQUFlLEVBQUUsV0FDakJDLGNBQWMsRUFBRSxXQWNoQkMsZ0JBQWdCLEVBQUUsV0FDbEJELGNBQWMsRUFBRSxXQW1CaEJELGVBQWUsRUFBRSxXQUNqQkMsY0FBYyxFQUFFLFdBYWhCQyxnQkFBZ0IsRUFBRSxXQUNsQkQsY0FBYyxFQUFFLFdBbUJoQkMsZ0JBQWdCLEVBQUUsV0FDbEJELGNBQWMsRUFBRSxXQWtCaEJDLGdCQUFnQixFQUFFLFdBQ2xCRCxjQUFj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