/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/merge", "sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/editFlow/draft", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/KeepAliveHelper", "sap/fe/core/helpers/ModelHelper", "sap/fe/navigation/SelectionVariant", "sap/ui/core/Core", "sap/ui/core/Fragment", "sap/ui/core/mvc/ControllerExtension", "sap/ui/core/mvc/OverrideExecution", "sap/ui/core/util/XMLPreprocessor", "sap/ui/core/XMLTemplateProcessor", "sap/ui/model/json/JSONModel", "../converters/helpers/Aggregation"], function (Log, mergeObjects, CommonUtils, draft, MetaModelConverter, ClassSupport, KeepAliveHelper, ModelHelper, SelectionVariant, Core, Fragment, ControllerExtension, OverrideExecution, XMLPreprocessor, XMLTemplateProcessor, JSONModel, Aggregation) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _class, _class2;
  var AggregationHelper = Aggregation.AggregationHelper;
  var publicExtension = ClassSupport.publicExtension;
  var privateExtension = ClassSupport.privateExtension;
  var methodOverride = ClassSupport.methodOverride;
  var finalExtension = ClassSupport.finalExtension;
  var extensible = ClassSupport.extensible;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  /**
   * {@link sap.ui.core.mvc.ControllerExtension Controller extension}
   *
   * @namespace
   * @alias sap.fe.core.controllerextensions.InternalInternalBasedNavigation
   * @private
   * @since 1.84.0
   */
  let InternalIntentBasedNavigation = (_dec = defineUI5Class("sap.fe.core.controllerextensions.InternalInternalBasedNavigation"), _dec2 = methodOverride(), _dec3 = publicExtension(), _dec4 = finalExtension(), _dec5 = publicExtension(), _dec6 = finalExtension(), _dec7 = publicExtension(), _dec8 = finalExtension(), _dec9 = publicExtension(), _dec10 = extensible(OverrideExecution.Instead), _dec11 = publicExtension(), _dec12 = finalExtension(), _dec13 = privateExtension(), _dec14 = publicExtension(), _dec15 = finalExtension(), _dec16 = publicExtension(), _dec17 = finalExtension(), _dec18 = publicExtension(), _dec19 = finalExtension(), _dec20 = publicExtension(), _dec21 = finalExtension(), _dec(_class = (_class2 = /*#__PURE__*/function (_ControllerExtension) {
    _inheritsLoose(InternalIntentBasedNavigation, _ControllerExtension);
    function InternalIntentBasedNavigation() {
      return _ControllerExtension.apply(this, arguments) || this;
    }
    var _proto = InternalIntentBasedNavigation.prototype;
    _proto.onInit = function onInit() {
      this._oAppComponent = this.base.getAppComponent();
      this._oMetaModel = this._oAppComponent.getModel().getMetaModel();
      this._oNavigationService = this._oAppComponent.getNavigationService();
      this._oView = this.base.getView();
    }

    /**
     * Enables intent-based navigation (SemanticObject-Action) with the provided context.
     * If semantic object mapping is provided, this is also applied to the selection variant after the adaptation by a consumer.
     * This takes care of removing any technical parameters and determines if an explace or inplace navigation should take place.
     *
     * @param sSemanticObject Semantic object for the target app
     * @param sAction  Action for the target app
     * @param [mNavigationParameters] Optional parameters to be passed to the external navigation
     * @param [mNavigationParameters.navigationContexts] Uses one of the following to be passed to the intent:
     *    a single instance of {@link sap.ui.model.odata.v4.Context}
     *    multiple instances of {@link sap.ui.model.odata.v4.Context}
     *    an object or an array of objects
     *		  If an array of objects is passed, the context is used to determine the metaPath and to remove any sensitive data
     *		  If an array of objects is passed, the following format ix expected:
     *		  {
     *			data: {
     *	 			ProductID: 7634,
     *				Name: "Laptop"
     *			 },
     *			 metaPath: "/SalesOrderManage"
     *        }
     * @param [mNavigationParameters.semanticObjectMapping] String representation of the SemanticObjectMapping or SemanticObjectMapping that applies to this navigation
     * @param [mNavigationParameters.defaultRefreshStrategy] Default refresh strategy to be used in case no refresh strategy is specified for the intent in the view.
     * @param [mNavigationParameters.refreshStrategies]
     * @param [mNavigationParameters.additionalNavigationParameters] Additional navigation parameters configured in the crossAppNavigation outbound parameters.
     */;
    _proto.navigate = function navigate(sSemanticObject, sAction, mNavigationParameters) {
      const _doNavigate = oContext => {
        const vNavigationContexts = mNavigationParameters && mNavigationParameters.navigationContexts,
          aNavigationContexts = vNavigationContexts && !Array.isArray(vNavigationContexts) ? [vNavigationContexts] : vNavigationContexts,
          vSemanticObjectMapping = mNavigationParameters && mNavigationParameters.semanticObjectMapping,
          vOutboundParams = mNavigationParameters && mNavigationParameters.additionalNavigationParameters,
          oTargetInfo = {
            semanticObject: sSemanticObject,
            action: sAction
          },
          oView = this.base.getView(),
          oController = oView.getController();
        if (oContext) {
          this._oView.setBindingContext(oContext);
        }
        if (sSemanticObject && sAction) {
          let aSemanticAttributes = [],
            oSelectionVariant = new SelectionVariant();
          // 1. get SemanticAttributes for navigation
          if (aNavigationContexts && aNavigationContexts.length) {
            aNavigationContexts.forEach(oNavigationContext => {
              // 1.1.a if navigation context is instance of sap.ui.mode.odata.v4.Context
              // else check if navigation context is of type object
              if (oNavigationContext.isA && oNavigationContext.isA("sap.ui.model.odata.v4.Context")) {
                // 1.1.b remove sensitive data
                let oSemanticAttributes = oNavigationContext.getObject();
                const sMetaPath = this._oMetaModel.getMetaPath(oNavigationContext.getPath());
                // TODO: also remove sensitive data from  navigation properties
                oSemanticAttributes = this.removeSensitiveData(oSemanticAttributes, sMetaPath);
                const oNavContext = this.prepareContextForExternalNavigation(oSemanticAttributes, oNavigationContext);
                oTargetInfo["propertiesWithoutConflict"] = oNavContext.propertiesWithoutConflict;
                aSemanticAttributes.push(oNavContext.semanticAttributes);
              } else if (!(oNavigationContext && Array.isArray(oNavigationContext.data)) && typeof oNavigationContext === "object") {
                // 1.1.b remove sensitive data from object
                aSemanticAttributes.push(this.removeSensitiveData(oNavigationContext.data, oNavigationContext.metaPath));
              } else if (oNavigationContext && Array.isArray(oNavigationContext.data)) {
                // oNavigationContext.data can be array already ex : [{Customer: "10001"}, {Customer: "10091"}]
                // hence assigning it to the aSemanticAttributes
                aSemanticAttributes = this.removeSensitiveData(oNavigationContext.data, oNavigationContext.metaPath);
              }
            });
          }
          // 2.1 Merge base selection variant and sanitized semantic attributes into one SelectionVariant
          if (aSemanticAttributes && aSemanticAttributes.length) {
            oSelectionVariant = this._oNavigationService.mixAttributesAndSelectionVariant(aSemanticAttributes, oSelectionVariant.toJSONString());
          }

          // 3. Add filterContextUrl to SV so the NavigationHandler can remove any sensitive data based on view entitySet
          const oModel = this._oView.getModel(),
            sEntitySet = this.getEntitySet(),
            sContextUrl = sEntitySet ? this._oNavigationService.constructContextUrl(sEntitySet, oModel) : undefined;
          if (sContextUrl) {
            oSelectionVariant.setFilterContextUrl(sContextUrl);
          }

          // Apply Outbound Parameters to the SV
          if (vOutboundParams) {
            this._applyOutboundParams(oSelectionVariant, vOutboundParams);
          }

          // 4. give an opportunity for the application to influence the SelectionVariant
          oController.intentBasedNavigation.adaptNavigationContext(oSelectionVariant, oTargetInfo);

          // 5. Apply semantic object mappings to the SV
          if (vSemanticObjectMapping) {
            this._applySemanticObjectMappings(oSelectionVariant, vSemanticObjectMapping);
          }

          // 6. remove technical parameters from Selection Variant
          this._removeTechnicalParameters(oSelectionVariant);

          // 7. check if programming model is sticky and page is editable
          const sNavMode = oController._intentBasedNavigation.getNavigationMode();

          // 8. Updating refresh strategy in internal model
          const mRefreshStrategies = mNavigationParameters && mNavigationParameters.refreshStrategies || {},
            oInternalModel = oView.getModel("internal");
          if (oInternalModel) {
            if ((oView && oView.getViewData()).refreshStrategyOnAppRestore) {
              const mViewRefreshStrategies = oView.getViewData().refreshStrategyOnAppRestore || {};
              mergeObjects(mRefreshStrategies, mViewRefreshStrategies);
            }
            const mRefreshStrategy = KeepAliveHelper.getRefreshStrategyForIntent(mRefreshStrategies, sSemanticObject, sAction);
            if (mRefreshStrategy) {
              oInternalModel.setProperty("/refreshStrategyOnAppRestore", mRefreshStrategy);
            }
          }

          // 9. Navigate via NavigationHandler
          const onError = function () {
            sap.ui.require(["sap/m/MessageBox"], function (MessageBox) {
              const oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core");
              MessageBox.error(oResourceBundle.getText("C_COMMON_HELPER_NAVIGATION_ERROR_MESSAGE"), {
                title: oResourceBundle.getText("C_COMMON_SAPFE_ERROR")
              });
            });
          };
          this._oNavigationService.navigate(sSemanticObject, sAction, oSelectionVariant.toJSONString(), undefined, onError, undefined, sNavMode);
        } else {
          throw new Error("Semantic Object/action is not provided");
        }
      };
      const oBindingContext = this.base.getView().getBindingContext();
      const oMetaModel = oBindingContext && oBindingContext.getModel().getMetaModel();
      if (this.getView().getViewData().converterType === "ObjectPage" && oMetaModel && !ModelHelper.isStickySessionSupported(oMetaModel)) {
        draft.processDataLossOrDraftDiscardConfirmation(_doNavigate.bind(this), Function.prototype, this.base.getView().getBindingContext(), this.base.getView().getController(), true, draft.NavigationType.ForwardNavigation);
      } else {
        _doNavigate();
      }
    }

    /**
     * Prepare attributes to be passed to external navigation.
     *
     * @param oSemanticAttributes Context data after removing all sensitive information.
     * @param oContext Actual context from which the semanticAttributes were derived.
     * @returns Object of prepared attributes for external navigation and no conflict properties.
     */;
    _proto.prepareContextForExternalNavigation = function prepareContextForExternalNavigation(oSemanticAttributes, oContext) {
      // 1. Find all distinct keys in the object SemanticAttributes
      // Store meta path for each occurence of the key
      const oDistinctKeys = {},
        sContextPath = oContext.getPath(),
        oMetaModel = oContext.getModel().getMetaModel(),
        sMetaPath = oMetaModel.getMetaPath(sContextPath),
        aMetaPathParts = sMetaPath.split("/").filter(Boolean);
      function _findDistinctKeysInObject(LookUpObject, sLookUpObjectMetaPath) {
        for (const sKey in LookUpObject) {
          // null case??
          if (LookUpObject[sKey] === null || typeof LookUpObject[sKey] !== "object") {
            if (!oDistinctKeys[sKey]) {
              // if key is found for the first time then create array
              oDistinctKeys[sKey] = [];
            }
            // push path to array
            oDistinctKeys[sKey].push(sLookUpObjectMetaPath);
          } else {
            // if a nested object is found
            const oNewLookUpObject = LookUpObject[sKey];
            _findDistinctKeysInObject(oNewLookUpObject, `${sLookUpObjectMetaPath}/${sKey}`);
          }
        }
      }
      _findDistinctKeysInObject(oSemanticAttributes, sMetaPath);

      // 2. Determine distinct key value and add conflicted paths to semantic attributes
      const sMainEntitySetName = aMetaPathParts[0],
        sMainEntityTypeName = oMetaModel.getObject(`/${sMainEntitySetName}/@sapui.name`),
        oPropertiesWithoutConflict = {};
      let sMainEntityValuePath, sCurrentValuePath, sLastValuePath;
      for (const sDistinctKey in oDistinctKeys) {
        const aConflictingPaths = oDistinctKeys[sDistinctKey];
        let sWinnerValuePath;
        // Find winner value for each distinct key in case of conflict by the following rule:

        // -> A. if any meta path for a distinct key is the same as main entity take that as the value
        // -> B. if A is not met keep the value from the current context (sMetaPath === path of distince key)
        // -> C. if A, B or C are not met take the last path for value
        if (aConflictingPaths.length > 1) {
          // conflict
          for (let i = 0; i <= aConflictingPaths.length - 1; i++) {
            const sPath = aConflictingPaths[i];
            let sPathInContext = sPath.replace(sPath === sMetaPath ? sMetaPath : `${sMetaPath}/`, "");
            sPathInContext = (sPathInContext === "" ? sPathInContext : `${sPathInContext}/`) + sDistinctKey;
            const sEntityTypeName = oMetaModel.getObject(`${sPath}/@sapui.name`);
            // rule A

            // rule A
            if (sEntityTypeName === sMainEntityTypeName) {
              sMainEntityValuePath = sPathInContext;
            }

            // rule B
            if (sPath === sMetaPath) {
              sCurrentValuePath = sPathInContext;
            }

            // rule C
            sLastValuePath = sPathInContext;

            // add conflicted path to semantic attributes
            // check if the current path points to main entity and prefix attribute names accordingly
            oSemanticAttributes[`${sMetaPath}/${sPathInContext}`.split("/").filter(function (sValue) {
              return sValue != "";
            }).join(".")] = oContext.getProperty(sPathInContext);
          }
          // A || B || C
          sWinnerValuePath = sMainEntityValuePath || sCurrentValuePath || sLastValuePath;
          oSemanticAttributes[sDistinctKey] = oContext.getProperty(sWinnerValuePath);
          sMainEntityValuePath = undefined;
          sCurrentValuePath = undefined;
          sLastValuePath = undefined;
        } else {
          // no conflict, add distinct key without adding paths
          const sPath = aConflictingPaths[0]; // because there is only one and hence no conflict
          let sPathInContext = sPath.replace(sPath === sMetaPath ? sMetaPath : `${sMetaPath}/`, "");
          sPathInContext = (sPathInContext === "" ? sPathInContext : `${sPathInContext}/`) + sDistinctKey;
          oSemanticAttributes[sDistinctKey] = oContext.getProperty(sPathInContext);
          oPropertiesWithoutConflict[sDistinctKey] = `${sMetaPath}/${sPathInContext}`.split("/").filter(function (sValue) {
            return sValue != "";
          }).join(".");
        }
      }
      // 3. Remove all Navigation properties
      for (const sProperty in oSemanticAttributes) {
        if (oSemanticAttributes[sProperty] !== null && typeof oSemanticAttributes[sProperty] === "object") {
          delete oSemanticAttributes[sProperty];
        }
      }
      return {
        semanticAttributes: oSemanticAttributes,
        propertiesWithoutConflict: oPropertiesWithoutConflict
      };
    }
    /**
     * Prepare filter conditions to be passed to external navigation.
     *
     * @param oFilterBarConditions Filter conditions.
     * @param sRootPath Root path of the application.
     * @param aParameters Names of parameters to be considered.
     * @returns Object of prepared filter conditions for external navigation and no conflict filters.
     */;
    _proto.prepareFiltersForExternalNavigation = function prepareFiltersForExternalNavigation(oFilterBarConditions, sRootPath, aParameters) {
      let sPath;
      const oDistinctKeys = {};
      const oFilterConditionsWithoutConflict = {};
      let sMainEntityValuePath, sCurrentValuePath, sFullContextPath, sWinnerValuePath, sPathInContext;
      function _findDistinctKeysInObject(LookUpObject) {
        let sLookUpObjectMetaPath;
        for (let sKey in LookUpObject) {
          if (LookUpObject[sKey]) {
            if (sKey.includes("/")) {
              sLookUpObjectMetaPath = sKey; // "/SalesOrdermanage/_Item/Material"
              const aPathParts = sKey.split("/");
              sKey = aPathParts[aPathParts.length - 1];
            } else {
              sLookUpObjectMetaPath = sRootPath;
            }
            if (!oDistinctKeys[sKey]) {
              // if key is found for the first time then create array
              oDistinctKeys[sKey] = [];
            }

            // push path to array
            oDistinctKeys[sKey].push(sLookUpObjectMetaPath);
          }
        }
      }
      _findDistinctKeysInObject(oFilterBarConditions);
      for (const sDistinctKey in oDistinctKeys) {
        const aConflictingPaths = oDistinctKeys[sDistinctKey];
        if (aConflictingPaths.length > 1) {
          // conflict
          for (let i = 0; i <= aConflictingPaths.length - 1; i++) {
            sPath = aConflictingPaths[i];
            if (sPath === sRootPath) {
              sFullContextPath = `${sRootPath}/${sDistinctKey}`;
              sPathInContext = sDistinctKey;
              sMainEntityValuePath = sDistinctKey;
              if (aParameters && aParameters.includes(sDistinctKey)) {
                oFilterBarConditions[`$Parameter.${sDistinctKey}`] = oFilterBarConditions[sDistinctKey];
              }
            } else {
              sPathInContext = sPath;
              sFullContextPath = `${sRootPath}/${sPath}`.replaceAll(/\*/g, "");
              sCurrentValuePath = sPath;
            }
            oFilterBarConditions[sFullContextPath.split("/").filter(function (sValue) {
              return sValue != "";
            }).join(".")] = oFilterBarConditions[sPathInContext];
            delete oFilterBarConditions[sPath];
          }
          sWinnerValuePath = sMainEntityValuePath || sCurrentValuePath;
          oFilterBarConditions[sDistinctKey] = oFilterBarConditions[sWinnerValuePath];
        } else {
          // no conflict, add distinct key without adding paths
          sPath = aConflictingPaths[0];
          sFullContextPath = sPath === sRootPath ? `${sRootPath}/${sDistinctKey}` : `${sRootPath}/${sPath}`.replaceAll("*", "");
          oFilterConditionsWithoutConflict[sDistinctKey] = sFullContextPath.split("/").filter(function (sValue) {
            return sValue != "";
          }).join(".");
          if (aParameters && aParameters.includes(sDistinctKey)) {
            oFilterBarConditions[`$Parameter.${sDistinctKey}`] = oFilterBarConditions[sDistinctKey];
          }
        }
      }
      return {
        filterConditions: oFilterBarConditions,
        filterConditionsWithoutConflict: oFilterConditionsWithoutConflict
      };
    }

    /**
     * Get Navigation mode.
     *
     * @returns The navigation mode
     */;
    _proto.getNavigationMode = function getNavigationMode() {
      return undefined;
    }
    /**
     * Allows for navigation to a given intent (SemanticObject-Action) with the provided context, using a dialog that shows the contexts which cannot be passed
     * If semantic object mapping is provided, this setting is also applied to the selection variant after adaptation by a consumer.
     * This setting also removes any technical parameters and determines if an inplace or explace navigation should take place.
     *
     * @param sSemanticObject Semantic object for the target app
     * @param sAction  Action for the target app
     * @param [mNavigationParameters] Optional parameters to be passed to the external navigation
     * @param [mNavigationParameters.label]
     * @param [mNavigationParameters.navigationContexts] Single instance or multiple instances of {@link sap.ui.model.odata.v4.Context}, or alternatively an object or array of objects, to be passed to the intent.
     * @param [mNavigationParameters.applicableContexts] Single instance or multiple instances of {@link sap.ui.model.odata.v4.Context}, or alternatively an object or array of objects, to be passed to the intent and for which the IBN button is enabled
     * @param [mNavigationParameters.notApplicableContexts] Single instance or multiple instances of {@link sap.ui.model.odata.v4.Context}, or alternatively an object or array of objects, which cannot be passed to the intent.
     *		  if an array of contexts is passed the context is used to determine the meta path and accordingly remove the sensitive data
     *		  If an array of objects is passed, the following format is expected:
     *		  {
     *			data: {
     *	 			ProductID: 7634,
     *				Name: "Laptop"
     *			 },
     *			 metaPath: "/SalesOrderManage"
     *        }
     *		The metaPath is used to remove any sensitive data.
     * @param [mNavigationParameters.semanticObjectMapping] String representation of SemanticObjectMapping or SemanticObjectMapping that applies to this navigation
     */;
    _proto.navigateWithConfirmationDialog = function navigateWithConfirmationDialog(sSemanticObject, sAction, mNavigationParameters) {
      var _mNavigationParameter;
      if (mNavigationParameters !== null && mNavigationParameters !== void 0 && mNavigationParameters.notApplicableContexts && ((_mNavigationParameter = mNavigationParameters.notApplicableContexts) === null || _mNavigationParameter === void 0 ? void 0 : _mNavigationParameter.length) >= 1) {
        let oApplicableContextDialog;
        const oController = {
          onClose: function () {
            // User cancels action
            oApplicableContextDialog.close();
          },
          onContinue: () => {
            // Users continues the action with the bound contexts
            mNavigationParameters.navigationContexts = mNavigationParameters.applicableContexts;
            oApplicableContextDialog.close();
            this.navigate(sSemanticObject, sAction, mNavigationParameters);
          }
        };
        const fnOpenAndFillDialog = function () {
          let oDialogContent;
          const nNotApplicable = mNavigationParameters.notApplicableContexts.length,
            aNotApplicableItems = [];
          for (let i = 0; i < mNavigationParameters.notApplicableContexts.length; i++) {
            oDialogContent = mNavigationParameters.notApplicableContexts[i].getObject();
            aNotApplicableItems.push(oDialogContent);
          }
          const oNotApplicableItemsModel = new JSONModel(aNotApplicableItems);
          const oTotals = new JSONModel({
            total: nNotApplicable,
            label: mNavigationParameters.label
          });
          oApplicableContextDialog.setModel(oNotApplicableItemsModel, "notApplicable");
          oApplicableContextDialog.setModel(oTotals, "totals");
          oApplicableContextDialog.open();
        };
        // Show the contexts that are not applicable and will not therefore be processed
        const sFragmentName = "sap.fe.core.controls.ActionPartial";
        const oDialogFragment = XMLTemplateProcessor.loadTemplate(sFragmentName, "fragment");
        const oModel = this._oView.getModel();
        const oMetaModel = oModel.getMetaModel();
        const sCanonicalPath = mNavigationParameters.notApplicableContexts[0].getCanonicalPath();
        const sEntitySet = `${sCanonicalPath.substr(0, sCanonicalPath.indexOf("("))}/`;
        Promise.resolve(XMLPreprocessor.process(oDialogFragment, {
          name: sFragmentName
        }, {
          bindingContexts: {
            entityType: oMetaModel.createBindingContext(sEntitySet)
          },
          models: {
            entityType: oMetaModel,
            metaModel: oMetaModel
          }
        })).then(function (oFragment) {
          return Fragment.load({
            definition: oFragment,
            controller: oController
          });
        }).then(oPopover => {
          oApplicableContextDialog = oPopover;
          this.getView().addDependent(oPopover);
          fnOpenAndFillDialog();
        }).catch(function () {
          Log.error("Error");
        });
      } else {
        this.navigate(sSemanticObject, sAction, mNavigationParameters);
      }
    };
    _proto._removeTechnicalParameters = function _removeTechnicalParameters(oSelectionVariant) {
      oSelectionVariant.removeSelectOption("@odata.context");
      oSelectionVariant.removeSelectOption("@odata.metadataEtag");
      oSelectionVariant.removeSelectOption("SAP__Messages");
    }
    /**
     * Get targeted Entity set.
     *
     * @returns Entity set name
     */;
    _proto.getEntitySet = function getEntitySet() {
      return this._oView.getViewData().entitySet;
    }
    /**
     * Removes sensitive data from the semantic attribute with respect to the entitySet.
     *
     * @param oAttributes Context data
     * @param sMetaPath Meta path to reach the entitySet in the MetaModel
     * @returns Array of semantic Attributes
     * @private
     */
    // TO-DO add unit tests for this function in the controller extension qunit.
    ;
    _proto.removeSensitiveData = function removeSensitiveData(oAttributes, sMetaPath) {
      if (oAttributes) {
        const {
          transAggregations,
          customAggregates
        } = this._getAggregates(sMetaPath, this.base.getView(), this.base.getAppComponent().getDiagnostics());
        const aProperties = Object.keys(oAttributes);
        if (aProperties.length) {
          delete oAttributes["@odata.context"];
          delete oAttributes["@odata.metadataEtag"];
          delete oAttributes["SAP__Messages"];
          for (let j = 0; j < aProperties.length; j++) {
            if (oAttributes[aProperties[j]] && typeof oAttributes[aProperties[j]] === "object") {
              this.removeSensitiveData(oAttributes[aProperties[j]], `${sMetaPath}/${aProperties[j]}`);
            }
            const sProp = aProperties[j];
            if (sProp.indexOf("@odata.type") > -1) {
              delete oAttributes[aProperties[j]];
              continue;
            }
            this._deleteAggregates([...transAggregations, ...customAggregates], aProperties[j], oAttributes);
            const aPropertyAnnotations = this._getPropertyAnnotations(sProp, sMetaPath, oAttributes, this._oMetaModel);
            if (aPropertyAnnotations) {
              if (aPropertyAnnotations["com.sap.vocabularies.PersonalData.v1.IsPotentiallySensitive"] || aPropertyAnnotations["com.sap.vocabularies.UI.v1.ExcludeFromNavigationContext"] || aPropertyAnnotations["com.sap.vocabularies.Analytics.v1.Measure"]) {
                delete oAttributes[sProp];
              } else if (aPropertyAnnotations["com.sap.vocabularies.Common.v1.FieldControl"]) {
                const oFieldControl = aPropertyAnnotations["com.sap.vocabularies.Common.v1.FieldControl"];
                if (oFieldControl["$EnumMember"] && oFieldControl["$EnumMember"].split("/")[1] === "Inapplicable") {
                  delete oAttributes[sProp];
                } else if (oFieldControl["$Path"] && this._isFieldControlPathInapplicable(oFieldControl["$Path"], oAttributes)) {
                  delete oAttributes[sProp];
                }
              }
            }
          }
        }
      }
      return oAttributes;
    }

    /**
     * Remove the attribute from navigation data if it is a measure.
     *
     * @param aggregates Array of Aggregates
     * @param sProp Attribute name
     * @param oAttributes SemanticAttributes
     */;
    _proto._deleteAggregates = function _deleteAggregates(aggregates, sProp, oAttributes) {
      if (aggregates && aggregates.indexOf(sProp) > -1) {
        delete oAttributes[sProp];
      }
    }

    /**
     * Returns the property annotations.
     *
     * @param sProp
     * @param sMetaPath
     * @param oAttributes
     * @param oMetaModel
     * @returns - The property annotations
     */;
    _proto._getPropertyAnnotations = function _getPropertyAnnotations(sProp, sMetaPath, oAttributes, oMetaModel) {
      if (oAttributes[sProp] && sMetaPath && !sMetaPath.includes("undefined")) {
        var _oFullContext$targetO, _oFullContext$targetO2;
        const oContext = oMetaModel.createBindingContext(`${sMetaPath}/${sProp}`);
        const oFullContext = MetaModelConverter.getInvolvedDataModelObjects(oContext);
        return oFullContext === null || oFullContext === void 0 ? void 0 : (_oFullContext$targetO = oFullContext.targetObject) === null || _oFullContext$targetO === void 0 ? void 0 : (_oFullContext$targetO2 = _oFullContext$targetO.annotations) === null || _oFullContext$targetO2 === void 0 ? void 0 : _oFullContext$targetO2._annotations;
      }
      return null;
    }

    /**
     * Returns the aggregates part of the EntitySet or EntityType.
     *
     * @param sMetaPath
     * @param oView
     * @param oDiagnostics
     * @returns - The aggregates
     */;
    _proto._getAggregates = function _getAggregates(sMetaPath, oView, oDiagnostics) {
      const converterContext = this._getConverterContext(sMetaPath, oView, oDiagnostics);
      const aggregationHelper = new AggregationHelper(converterContext.getEntityType(), converterContext);
      const isAnalyticsSupported = aggregationHelper.isAnalyticsSupported();
      let transAggregations = [],
        customAggregates = [];
      if (isAnalyticsSupported) {
        transAggregations = aggregationHelper.getTransAggregations();
        if (transAggregations.length) {
          transAggregations = transAggregations.map(transAgg => {
            return transAgg.Name || transAgg.Value;
          });
        }
        customAggregates = aggregationHelper.getCustomAggregateDefinitions();
        if (customAggregates.length) {
          customAggregates = customAggregates.map(customAggregate => {
            return customAggregate.qualifier;
          });
        }
      }
      return {
        transAggregations,
        customAggregates
      };
    }

    /**
     * Returns converterContext.
     *
     * @param sMetaPath
     * @param oView
     * @param oDiagnostics
     * @returns - ConverterContext
     */;
    _proto._getConverterContext = function _getConverterContext(sMetaPath, oView, oDiagnostics) {
      const oViewData = oView.getViewData();
      let sEntitySet = oViewData.entitySet;
      const sContextPath = oViewData.contextPath;
      if (sContextPath && (!sEntitySet || sEntitySet.includes("/"))) {
        sEntitySet = oViewData === null || oViewData === void 0 ? void 0 : oViewData.fullContextPath.split("/")[1];
      }
      return CommonUtils.getConverterContextForPath(sMetaPath, oView.getModel().getMetaModel(), sEntitySet, oDiagnostics);
    }

    /**
     * Check if path-based FieldControl evaluates to inapplicable.
     *
     * @param sFieldControlPath Field control path
     * @param oAttribute SemanticAttributes
     * @returns `true` if inapplicable
     */;
    _proto._isFieldControlPathInapplicable = function _isFieldControlPathInapplicable(sFieldControlPath, oAttribute) {
      let bInapplicable = false;
      const aParts = sFieldControlPath.split("/");
      // sensitive data is removed only if the path has already been resolved.
      if (aParts.length > 1) {
        bInapplicable = oAttribute[aParts[0]] && oAttribute[aParts[0]].hasOwnProperty(aParts[1]) && oAttribute[aParts[0]][aParts[1]] === 0;
      } else {
        bInapplicable = oAttribute[sFieldControlPath] === 0;
      }
      return bInapplicable;
    }
    /**
     * Method to replace Local Properties with Semantic Object mappings.
     *
     * @param oSelectionVariant SelectionVariant consisting of filterbar, Table and Page Context
     * @param vMappings A string representation of semantic object mapping
     * @returns - Modified SelectionVariant with LocalProperty replaced with SemanticObjectProperties.
     */;
    _proto._applySemanticObjectMappings = function _applySemanticObjectMappings(oSelectionVariant, vMappings) {
      const oMappings = typeof vMappings === "string" ? JSON.parse(vMappings) : vMappings;
      for (let i = 0; i < oMappings.length; i++) {
        const sLocalProperty = oMappings[i]["LocalProperty"] && oMappings[i]["LocalProperty"]["$PropertyPath"] || oMappings[i]["@com.sap.vocabularies.Common.v1.LocalProperty"] && oMappings[i]["@com.sap.vocabularies.Common.v1.LocalProperty"]["$Path"];
        const sSemanticObjectProperty = oMappings[i]["SemanticObjectProperty"] || oMappings[i]["@com.sap.vocabularies.Common.v1.SemanticObjectProperty"];
        const oSelectOption = oSelectionVariant.getSelectOption(sLocalProperty);
        if (oSelectOption) {
          //Create a new SelectOption with sSemanticObjectProperty as the property Name and remove the older one
          oSelectionVariant.removeSelectOption(sLocalProperty);
          oSelectionVariant.massAddSelectOption(sSemanticObjectProperty, oSelectOption);
        }
      }
      return oSelectionVariant;
    }
    /**
     * Navigates to an Outbound provided in the manifest.
     *
     * @function
     * @param sOutbound Identifier to location the outbound in the manifest
     * @param mNavigationParameters Optional map containing key/value pairs to be passed to the intent
     * @alias sap.fe.core.controllerextensions.IntentBasedNavigation#navigateOutbound
     * @since 1.86.0
     */;
    _proto.navigateOutbound = function navigateOutbound(sOutbound, mNavigationParameters) {
      var _oManifestEntry$cross, _oManifestEntry$cross2;
      let aNavParams;
      const oManifestEntry = this.base.getAppComponent().getManifestEntry("sap.app"),
        oOutbound = (_oManifestEntry$cross = oManifestEntry.crossNavigation) === null || _oManifestEntry$cross === void 0 ? void 0 : (_oManifestEntry$cross2 = _oManifestEntry$cross.outbounds) === null || _oManifestEntry$cross2 === void 0 ? void 0 : _oManifestEntry$cross2[sOutbound];
      if (!oOutbound) {
        Log.error("Outbound is not defined in manifest!!");
        return;
      }
      const sSemanticObject = oOutbound.semanticObject,
        sAction = oOutbound.action,
        outboundParams = oOutbound.parameters && this.getOutboundParams(oOutbound.parameters);
      if (mNavigationParameters) {
        aNavParams = [];
        Object.keys(mNavigationParameters).forEach(function (key) {
          let oParams;
          if (Array.isArray(mNavigationParameters[key])) {
            const aValues = mNavigationParameters[key];
            for (let i = 0; i < aValues.length; i++) {
              var _aNavParams;
              oParams = {};
              oParams[key] = aValues[i];
              (_aNavParams = aNavParams) === null || _aNavParams === void 0 ? void 0 : _aNavParams.push(oParams);
            }
          } else {
            var _aNavParams2;
            oParams = {};
            oParams[key] = mNavigationParameters[key];
            (_aNavParams2 = aNavParams) === null || _aNavParams2 === void 0 ? void 0 : _aNavParams2.push(oParams);
          }
        });
      }
      if (aNavParams || outboundParams) {
        mNavigationParameters = {
          navigationContexts: {
            data: aNavParams || outboundParams
          }
        };
      }
      this.base._intentBasedNavigation.navigate(sSemanticObject, sAction, mNavigationParameters);
    }

    /**
     * Method to apply outbound parameters defined in the manifest.
     *
     * @param oSelectionVariant SelectionVariant consisting of a filter bar, a table, and a page context
     * @param vOutboundParams Outbound Properties defined in the manifest
     * @returns - The modified SelectionVariant with outbound parameters.
     */;
    _proto._applyOutboundParams = function _applyOutboundParams(oSelectionVariant, vOutboundParams) {
      const aParameters = Object.keys(vOutboundParams);
      const aSelectProperties = oSelectionVariant.getSelectOptionsPropertyNames();
      aParameters.forEach(function (key) {
        if (!aSelectProperties.includes(key)) {
          oSelectionVariant.addSelectOption(key, "I", "EQ", vOutboundParams[key]);
        }
      });
      return oSelectionVariant;
    }
    /**
     * Method to get the outbound parameters defined in the manifest.
     *
     * @function
     * @param oOutboundParams Parameters defined in the outbounds. Only "plain" is supported
     * @returns Parameters with the key-Value pair
     */;
    _proto.getOutboundParams = function getOutboundParams(oOutboundParams) {
      const oParamsMapping = {};
      if (oOutboundParams) {
        const aParameters = Object.keys(oOutboundParams) || [];
        if (aParameters.length > 0) {
          aParameters.forEach(function (key) {
            const oMapping = oOutboundParams[key];
            if (oMapping.value && oMapping.value.value && oMapping.value.format === "plain") {
              if (!oParamsMapping[key]) {
                oParamsMapping[key] = oMapping.value.value;
              }
            }
          });
        }
      }
      return oParamsMapping;
    }

    /**
     * Triggers an outbound navigation when a user chooses the chevron.
     *
     * @param {object} oController
     * @param {string} sOutboundTarget Name of the outbound target (needs to be defined in the manifest)
     * @param {sap.ui.model.odata.v4.Context} oContext The context that contains the data for the target app
     * @param {string} sCreatePath Create path when the chevron is created.
     * @returns {Promise} Promise which is resolved once the navigation is triggered
     */;
    _proto.onChevronPressNavigateOutBound = function onChevronPressNavigateOutBound(oController, sOutboundTarget, oContext, sCreatePath) {
      const oOutbounds = oController.getAppComponent().getRoutingService().getOutbounds();
      const oDisplayOutbound = oOutbounds[sOutboundTarget];
      let additionalNavigationParameters;
      if (oDisplayOutbound && oDisplayOutbound.semanticObject && oDisplayOutbound.action) {
        const oRefreshStrategies = {
          intents: {}
        };
        const oDefaultRefreshStrategy = {};
        let sMetaPath;
        if (oContext) {
          if (oContext.isA && oContext.isA("sap.ui.model.odata.v4.Context")) {
            sMetaPath = ModelHelper.getMetaPathForContext(oContext);
            oContext = [oContext];
          } else {
            sMetaPath = ModelHelper.getMetaPathForContext(oContext[0]);
          }
          oDefaultRefreshStrategy[sMetaPath] = "self";
          oRefreshStrategies["_feDefault"] = oDefaultRefreshStrategy;
        }
        if (sCreatePath) {
          const sKey = `${oDisplayOutbound.semanticObject}-${oDisplayOutbound.action}`;
          oRefreshStrategies.intents[sKey] = {};
          oRefreshStrategies.intents[sKey][sCreatePath] = "self";
        }
        if (oDisplayOutbound && oDisplayOutbound.parameters) {
          const oParams = oDisplayOutbound.parameters && this.getOutboundParams(oDisplayOutbound.parameters);
          if (Object.keys(oParams).length > 0) {
            additionalNavigationParameters = oParams;
          }
        }
        oController._intentBasedNavigation.navigate(oDisplayOutbound.semanticObject, oDisplayOutbound.action, {
          navigationContexts: oContext,
          refreshStrategies: oRefreshStrategies,
          additionalNavigationParameters: additionalNavigationParameters
        });

        //TODO: check why returning a promise is required
        return Promise.resolve();
      } else {
        throw new Error(`outbound target ${sOutboundTarget} not found in cross navigation definition of manifest`);
      }
    };
    return InternalIntentBasedNavigation;
  }(ControllerExtension), (_applyDecoratedDescriptor(_class2.prototype, "onInit", [_dec2], Object.getOwnPropertyDescriptor(_class2.prototype, "onInit"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "navigate", [_dec3, _dec4], Object.getOwnPropertyDescriptor(_class2.prototype, "navigate"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "prepareContextForExternalNavigation", [_dec5, _dec6], Object.getOwnPropertyDescriptor(_class2.prototype, "prepareContextForExternalNavigation"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "prepareFiltersForExternalNavigation", [_dec7, _dec8], Object.getOwnPropertyDescriptor(_class2.prototype, "prepareFiltersForExternalNavigation"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getNavigationMode", [_dec9, _dec10], Object.getOwnPropertyDescriptor(_class2.prototype, "getNavigationMode"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "navigateWithConfirmationDialog", [_dec11, _dec12], Object.getOwnPropertyDescriptor(_class2.prototype, "navigateWithConfirmationDialog"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getEntitySet", [_dec13], Object.getOwnPropertyDescriptor(_class2.prototype, "getEntitySet"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "removeSensitiveData", [_dec14, _dec15], Object.getOwnPropertyDescriptor(_class2.prototype, "removeSensitiveData"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "navigateOutbound", [_dec16, _dec17], Object.getOwnPropertyDescriptor(_class2.prototype, "navigateOutbound"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getOutboundParams", [_dec18, _dec19], Object.getOwnPropertyDescriptor(_class2.prototype, "getOutboundParams"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onChevronPressNavigateOutBound", [_dec20, _dec21], Object.getOwnPropertyDescriptor(_class2.prototype, "onChevronPressNavigateOutBound"), _class2.prototype)), _class2)) || _class);
  return InternalIntentBasedNavigation;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJJbnRlcm5hbEludGVudEJhc2VkTmF2aWdhdGlvbiIsImRlZmluZVVJNUNsYXNzIiwibWV0aG9kT3ZlcnJpZGUiLCJwdWJsaWNFeHRlbnNpb24iLCJmaW5hbEV4dGVuc2lvbiIsImV4dGVuc2libGUiLCJPdmVycmlkZUV4ZWN1dGlvbiIsIkluc3RlYWQiLCJwcml2YXRlRXh0ZW5zaW9uIiwib25Jbml0IiwiX29BcHBDb21wb25lbnQiLCJiYXNlIiwiZ2V0QXBwQ29tcG9uZW50IiwiX29NZXRhTW9kZWwiLCJnZXRNb2RlbCIsImdldE1ldGFNb2RlbCIsIl9vTmF2aWdhdGlvblNlcnZpY2UiLCJnZXROYXZpZ2F0aW9uU2VydmljZSIsIl9vVmlldyIsImdldFZpZXciLCJuYXZpZ2F0ZSIsInNTZW1hbnRpY09iamVjdCIsInNBY3Rpb24iLCJtTmF2aWdhdGlvblBhcmFtZXRlcnMiLCJfZG9OYXZpZ2F0ZSIsIm9Db250ZXh0Iiwidk5hdmlnYXRpb25Db250ZXh0cyIsIm5hdmlnYXRpb25Db250ZXh0cyIsImFOYXZpZ2F0aW9uQ29udGV4dHMiLCJBcnJheSIsImlzQXJyYXkiLCJ2U2VtYW50aWNPYmplY3RNYXBwaW5nIiwic2VtYW50aWNPYmplY3RNYXBwaW5nIiwidk91dGJvdW5kUGFyYW1zIiwiYWRkaXRpb25hbE5hdmlnYXRpb25QYXJhbWV0ZXJzIiwib1RhcmdldEluZm8iLCJzZW1hbnRpY09iamVjdCIsImFjdGlvbiIsIm9WaWV3Iiwib0NvbnRyb2xsZXIiLCJnZXRDb250cm9sbGVyIiwic2V0QmluZGluZ0NvbnRleHQiLCJhU2VtYW50aWNBdHRyaWJ1dGVzIiwib1NlbGVjdGlvblZhcmlhbnQiLCJTZWxlY3Rpb25WYXJpYW50IiwibGVuZ3RoIiwiZm9yRWFjaCIsIm9OYXZpZ2F0aW9uQ29udGV4dCIsImlzQSIsIm9TZW1hbnRpY0F0dHJpYnV0ZXMiLCJnZXRPYmplY3QiLCJzTWV0YVBhdGgiLCJnZXRNZXRhUGF0aCIsImdldFBhdGgiLCJyZW1vdmVTZW5zaXRpdmVEYXRhIiwib05hdkNvbnRleHQiLCJwcmVwYXJlQ29udGV4dEZvckV4dGVybmFsTmF2aWdhdGlvbiIsInByb3BlcnRpZXNXaXRob3V0Q29uZmxpY3QiLCJwdXNoIiwic2VtYW50aWNBdHRyaWJ1dGVzIiwiZGF0YSIsIm1ldGFQYXRoIiwibWl4QXR0cmlidXRlc0FuZFNlbGVjdGlvblZhcmlhbnQiLCJ0b0pTT05TdHJpbmciLCJvTW9kZWwiLCJzRW50aXR5U2V0IiwiZ2V0RW50aXR5U2V0Iiwic0NvbnRleHRVcmwiLCJjb25zdHJ1Y3RDb250ZXh0VXJsIiwidW5kZWZpbmVkIiwic2V0RmlsdGVyQ29udGV4dFVybCIsIl9hcHBseU91dGJvdW5kUGFyYW1zIiwiaW50ZW50QmFzZWROYXZpZ2F0aW9uIiwiYWRhcHROYXZpZ2F0aW9uQ29udGV4dCIsIl9hcHBseVNlbWFudGljT2JqZWN0TWFwcGluZ3MiLCJfcmVtb3ZlVGVjaG5pY2FsUGFyYW1ldGVycyIsInNOYXZNb2RlIiwiX2ludGVudEJhc2VkTmF2aWdhdGlvbiIsImdldE5hdmlnYXRpb25Nb2RlIiwibVJlZnJlc2hTdHJhdGVnaWVzIiwicmVmcmVzaFN0cmF0ZWdpZXMiLCJvSW50ZXJuYWxNb2RlbCIsImdldFZpZXdEYXRhIiwicmVmcmVzaFN0cmF0ZWd5T25BcHBSZXN0b3JlIiwibVZpZXdSZWZyZXNoU3RyYXRlZ2llcyIsIm1lcmdlT2JqZWN0cyIsIm1SZWZyZXNoU3RyYXRlZ3kiLCJLZWVwQWxpdmVIZWxwZXIiLCJnZXRSZWZyZXNoU3RyYXRlZ3lGb3JJbnRlbnQiLCJzZXRQcm9wZXJ0eSIsIm9uRXJyb3IiLCJzYXAiLCJ1aSIsInJlcXVpcmUiLCJNZXNzYWdlQm94Iiwib1Jlc291cmNlQnVuZGxlIiwiQ29yZSIsImdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZSIsImVycm9yIiwiZ2V0VGV4dCIsInRpdGxlIiwiRXJyb3IiLCJvQmluZGluZ0NvbnRleHQiLCJnZXRCaW5kaW5nQ29udGV4dCIsIm9NZXRhTW9kZWwiLCJjb252ZXJ0ZXJUeXBlIiwiTW9kZWxIZWxwZXIiLCJpc1N0aWNreVNlc3Npb25TdXBwb3J0ZWQiLCJkcmFmdCIsInByb2Nlc3NEYXRhTG9zc09yRHJhZnREaXNjYXJkQ29uZmlybWF0aW9uIiwiYmluZCIsIkZ1bmN0aW9uIiwicHJvdG90eXBlIiwiTmF2aWdhdGlvblR5cGUiLCJGb3J3YXJkTmF2aWdhdGlvbiIsIm9EaXN0aW5jdEtleXMiLCJzQ29udGV4dFBhdGgiLCJhTWV0YVBhdGhQYXJ0cyIsInNwbGl0IiwiZmlsdGVyIiwiQm9vbGVhbiIsIl9maW5kRGlzdGluY3RLZXlzSW5PYmplY3QiLCJMb29rVXBPYmplY3QiLCJzTG9va1VwT2JqZWN0TWV0YVBhdGgiLCJzS2V5Iiwib05ld0xvb2tVcE9iamVjdCIsInNNYWluRW50aXR5U2V0TmFtZSIsInNNYWluRW50aXR5VHlwZU5hbWUiLCJvUHJvcGVydGllc1dpdGhvdXRDb25mbGljdCIsInNNYWluRW50aXR5VmFsdWVQYXRoIiwic0N1cnJlbnRWYWx1ZVBhdGgiLCJzTGFzdFZhbHVlUGF0aCIsInNEaXN0aW5jdEtleSIsImFDb25mbGljdGluZ1BhdGhzIiwic1dpbm5lclZhbHVlUGF0aCIsImkiLCJzUGF0aCIsInNQYXRoSW5Db250ZXh0IiwicmVwbGFjZSIsInNFbnRpdHlUeXBlTmFtZSIsInNWYWx1ZSIsImpvaW4iLCJnZXRQcm9wZXJ0eSIsInNQcm9wZXJ0eSIsInByZXBhcmVGaWx0ZXJzRm9yRXh0ZXJuYWxOYXZpZ2F0aW9uIiwib0ZpbHRlckJhckNvbmRpdGlvbnMiLCJzUm9vdFBhdGgiLCJhUGFyYW1ldGVycyIsIm9GaWx0ZXJDb25kaXRpb25zV2l0aG91dENvbmZsaWN0Iiwic0Z1bGxDb250ZXh0UGF0aCIsImluY2x1ZGVzIiwiYVBhdGhQYXJ0cyIsInJlcGxhY2VBbGwiLCJmaWx0ZXJDb25kaXRpb25zIiwiZmlsdGVyQ29uZGl0aW9uc1dpdGhvdXRDb25mbGljdCIsIm5hdmlnYXRlV2l0aENvbmZpcm1hdGlvbkRpYWxvZyIsIm5vdEFwcGxpY2FibGVDb250ZXh0cyIsIm9BcHBsaWNhYmxlQ29udGV4dERpYWxvZyIsIm9uQ2xvc2UiLCJjbG9zZSIsIm9uQ29udGludWUiLCJhcHBsaWNhYmxlQ29udGV4dHMiLCJmbk9wZW5BbmRGaWxsRGlhbG9nIiwib0RpYWxvZ0NvbnRlbnQiLCJuTm90QXBwbGljYWJsZSIsImFOb3RBcHBsaWNhYmxlSXRlbXMiLCJvTm90QXBwbGljYWJsZUl0ZW1zTW9kZWwiLCJKU09OTW9kZWwiLCJvVG90YWxzIiwidG90YWwiLCJsYWJlbCIsInNldE1vZGVsIiwib3BlbiIsInNGcmFnbWVudE5hbWUiLCJvRGlhbG9nRnJhZ21lbnQiLCJYTUxUZW1wbGF0ZVByb2Nlc3NvciIsImxvYWRUZW1wbGF0ZSIsInNDYW5vbmljYWxQYXRoIiwiZ2V0Q2Fub25pY2FsUGF0aCIsInN1YnN0ciIsImluZGV4T2YiLCJQcm9taXNlIiwicmVzb2x2ZSIsIlhNTFByZXByb2Nlc3NvciIsInByb2Nlc3MiLCJuYW1lIiwiYmluZGluZ0NvbnRleHRzIiwiZW50aXR5VHlwZSIsImNyZWF0ZUJpbmRpbmdDb250ZXh0IiwibW9kZWxzIiwibWV0YU1vZGVsIiwidGhlbiIsIm9GcmFnbWVudCIsIkZyYWdtZW50IiwibG9hZCIsImRlZmluaXRpb24iLCJjb250cm9sbGVyIiwib1BvcG92ZXIiLCJhZGREZXBlbmRlbnQiLCJjYXRjaCIsIkxvZyIsInJlbW92ZVNlbGVjdE9wdGlvbiIsImVudGl0eVNldCIsIm9BdHRyaWJ1dGVzIiwidHJhbnNBZ2dyZWdhdGlvbnMiLCJjdXN0b21BZ2dyZWdhdGVzIiwiX2dldEFnZ3JlZ2F0ZXMiLCJnZXREaWFnbm9zdGljcyIsImFQcm9wZXJ0aWVzIiwiT2JqZWN0Iiwia2V5cyIsImoiLCJzUHJvcCIsIl9kZWxldGVBZ2dyZWdhdGVzIiwiYVByb3BlcnR5QW5ub3RhdGlvbnMiLCJfZ2V0UHJvcGVydHlBbm5vdGF0aW9ucyIsIm9GaWVsZENvbnRyb2wiLCJfaXNGaWVsZENvbnRyb2xQYXRoSW5hcHBsaWNhYmxlIiwiYWdncmVnYXRlcyIsIm9GdWxsQ29udGV4dCIsIk1ldGFNb2RlbENvbnZlcnRlciIsImdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyIsInRhcmdldE9iamVjdCIsImFubm90YXRpb25zIiwiX2Fubm90YXRpb25zIiwib0RpYWdub3N0aWNzIiwiY29udmVydGVyQ29udGV4dCIsIl9nZXRDb252ZXJ0ZXJDb250ZXh0IiwiYWdncmVnYXRpb25IZWxwZXIiLCJBZ2dyZWdhdGlvbkhlbHBlciIsImdldEVudGl0eVR5cGUiLCJpc0FuYWx5dGljc1N1cHBvcnRlZCIsImdldFRyYW5zQWdncmVnYXRpb25zIiwibWFwIiwidHJhbnNBZ2ciLCJOYW1lIiwiVmFsdWUiLCJnZXRDdXN0b21BZ2dyZWdhdGVEZWZpbml0aW9ucyIsImN1c3RvbUFnZ3JlZ2F0ZSIsInF1YWxpZmllciIsIm9WaWV3RGF0YSIsImNvbnRleHRQYXRoIiwiZnVsbENvbnRleHRQYXRoIiwiQ29tbW9uVXRpbHMiLCJnZXRDb252ZXJ0ZXJDb250ZXh0Rm9yUGF0aCIsInNGaWVsZENvbnRyb2xQYXRoIiwib0F0dHJpYnV0ZSIsImJJbmFwcGxpY2FibGUiLCJhUGFydHMiLCJoYXNPd25Qcm9wZXJ0eSIsInZNYXBwaW5ncyIsIm9NYXBwaW5ncyIsIkpTT04iLCJwYXJzZSIsInNMb2NhbFByb3BlcnR5Iiwic1NlbWFudGljT2JqZWN0UHJvcGVydHkiLCJvU2VsZWN0T3B0aW9uIiwiZ2V0U2VsZWN0T3B0aW9uIiwibWFzc0FkZFNlbGVjdE9wdGlvbiIsIm5hdmlnYXRlT3V0Ym91bmQiLCJzT3V0Ym91bmQiLCJhTmF2UGFyYW1zIiwib01hbmlmZXN0RW50cnkiLCJnZXRNYW5pZmVzdEVudHJ5Iiwib091dGJvdW5kIiwiY3Jvc3NOYXZpZ2F0aW9uIiwib3V0Ym91bmRzIiwib3V0Ym91bmRQYXJhbXMiLCJwYXJhbWV0ZXJzIiwiZ2V0T3V0Ym91bmRQYXJhbXMiLCJrZXkiLCJvUGFyYW1zIiwiYVZhbHVlcyIsImFTZWxlY3RQcm9wZXJ0aWVzIiwiZ2V0U2VsZWN0T3B0aW9uc1Byb3BlcnR5TmFtZXMiLCJhZGRTZWxlY3RPcHRpb24iLCJvT3V0Ym91bmRQYXJhbXMiLCJvUGFyYW1zTWFwcGluZyIsIm9NYXBwaW5nIiwidmFsdWUiLCJmb3JtYXQiLCJvbkNoZXZyb25QcmVzc05hdmlnYXRlT3V0Qm91bmQiLCJzT3V0Ym91bmRUYXJnZXQiLCJzQ3JlYXRlUGF0aCIsIm9PdXRib3VuZHMiLCJnZXRSb3V0aW5nU2VydmljZSIsImdldE91dGJvdW5kcyIsIm9EaXNwbGF5T3V0Ym91bmQiLCJvUmVmcmVzaFN0cmF0ZWdpZXMiLCJpbnRlbnRzIiwib0RlZmF1bHRSZWZyZXNoU3RyYXRlZ3kiLCJnZXRNZXRhUGF0aEZvckNvbnRleHQiLCJDb250cm9sbGVyRXh0ZW5zaW9uIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJJbnRlcm5hbEludGVudEJhc2VkTmF2aWdhdGlvbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBtZXJnZU9iamVjdHMgZnJvbSBcInNhcC9iYXNlL3V0aWwvbWVyZ2VcIjtcbmltcG9ydCB0eXBlIEFwcENvbXBvbmVudCBmcm9tIFwic2FwL2ZlL2NvcmUvQXBwQ29tcG9uZW50XCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgZHJhZnQgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL2VkaXRGbG93L2RyYWZ0XCI7XG5pbXBvcnQgKiBhcyBNZXRhTW9kZWxDb252ZXJ0ZXIgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvTWV0YU1vZGVsQ29udmVydGVyXCI7XG5pbXBvcnQge1xuXHRkZWZpbmVVSTVDbGFzcyxcblx0ZXh0ZW5zaWJsZSxcblx0ZmluYWxFeHRlbnNpb24sXG5cdG1ldGhvZE92ZXJyaWRlLFxuXHRwcml2YXRlRXh0ZW5zaW9uLFxuXHRwdWJsaWNFeHRlbnNpb25cbn0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgS2VlcEFsaXZlSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0tlZXBBbGl2ZUhlbHBlclwiO1xuaW1wb3J0IE1vZGVsSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL01vZGVsSGVscGVyXCI7XG5pbXBvcnQgdHlwZSBQYWdlQ29udHJvbGxlciBmcm9tIFwic2FwL2ZlL2NvcmUvUGFnZUNvbnRyb2xsZXJcIjtcbmltcG9ydCB0eXBlIHsgTmF2aWdhdGlvblNlcnZpY2UgfSBmcm9tIFwic2FwL2ZlL2NvcmUvc2VydmljZXMvTmF2aWdhdGlvblNlcnZpY2VGYWN0b3J5XCI7XG5pbXBvcnQgRGlhZ25vc3RpY3MgZnJvbSBcInNhcC9mZS9jb3JlL3N1cHBvcnQvRGlhZ25vc3RpY3NcIjtcbmltcG9ydCBTZWxlY3Rpb25WYXJpYW50IGZyb20gXCJzYXAvZmUvbmF2aWdhdGlvbi9TZWxlY3Rpb25WYXJpYW50XCI7XG5pbXBvcnQgdHlwZSBEaWFsb2cgZnJvbSBcInNhcC9tL0RpYWxvZ1wiO1xuaW1wb3J0IENvcmUgZnJvbSBcInNhcC91aS9jb3JlL0NvcmVcIjtcbmltcG9ydCBGcmFnbWVudCBmcm9tIFwic2FwL3VpL2NvcmUvRnJhZ21lbnRcIjtcbmltcG9ydCBDb250cm9sbGVyRXh0ZW5zaW9uIGZyb20gXCJzYXAvdWkvY29yZS9tdmMvQ29udHJvbGxlckV4dGVuc2lvblwiO1xuaW1wb3J0IE92ZXJyaWRlRXhlY3V0aW9uIGZyb20gXCJzYXAvdWkvY29yZS9tdmMvT3ZlcnJpZGVFeGVjdXRpb25cIjtcbmltcG9ydCB0eXBlIFZpZXcgZnJvbSBcInNhcC91aS9jb3JlL212Yy9WaWV3XCI7XG5pbXBvcnQgWE1MUHJlcHJvY2Vzc29yIGZyb20gXCJzYXAvdWkvY29yZS91dGlsL1hNTFByZXByb2Nlc3NvclwiO1xuaW1wb3J0IFhNTFRlbXBsYXRlUHJvY2Vzc29yIGZyb20gXCJzYXAvdWkvY29yZS9YTUxUZW1wbGF0ZVByb2Nlc3NvclwiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL0NvbnRleHRcIjtcbmltcG9ydCBKU09OTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9qc29uL0pTT05Nb2RlbFwiO1xuaW1wb3J0IHR5cGUgT0RhdGFWNENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Db250ZXh0XCI7XG5pbXBvcnQgdHlwZSBPRGF0YU1ldGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTWV0YU1vZGVsXCI7XG5pbXBvcnQgeyBBZ2dyZWdhdGlvbkhlbHBlciB9IGZyb20gXCIuLi9jb252ZXJ0ZXJzL2hlbHBlcnMvQWdncmVnYXRpb25cIjtcblxuLyoqXG4gKiB7QGxpbmsgc2FwLnVpLmNvcmUubXZjLkNvbnRyb2xsZXJFeHRlbnNpb24gQ29udHJvbGxlciBleHRlbnNpb259XG4gKlxuICogQG5hbWVzcGFjZVxuICogQGFsaWFzIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkludGVybmFsSW50ZXJuYWxCYXNlZE5hdmlnYXRpb25cbiAqIEBwcml2YXRlXG4gKiBAc2luY2UgMS44NC4wXG4gKi9cbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkludGVybmFsSW50ZXJuYWxCYXNlZE5hdmlnYXRpb25cIilcbmNsYXNzIEludGVybmFsSW50ZW50QmFzZWROYXZpZ2F0aW9uIGV4dGVuZHMgQ29udHJvbGxlckV4dGVuc2lvbiB7XG5cdHByb3RlY3RlZCBiYXNlITogUGFnZUNvbnRyb2xsZXI7XG5cdHByaXZhdGUgX29BcHBDb21wb25lbnQhOiBBcHBDb21wb25lbnQ7XG5cdHByaXZhdGUgX29NZXRhTW9kZWwhOiBPRGF0YU1ldGFNb2RlbDtcblx0cHJpdmF0ZSBfb05hdmlnYXRpb25TZXJ2aWNlITogTmF2aWdhdGlvblNlcnZpY2U7XG5cdHByaXZhdGUgX29WaWV3ITogVmlldztcblx0QG1ldGhvZE92ZXJyaWRlKClcblx0b25Jbml0KCkge1xuXHRcdHRoaXMuX29BcHBDb21wb25lbnQgPSB0aGlzLmJhc2UuZ2V0QXBwQ29tcG9uZW50KCk7XG5cdFx0dGhpcy5fb01ldGFNb2RlbCA9IHRoaXMuX29BcHBDb21wb25lbnQuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSBhcyBPRGF0YU1ldGFNb2RlbDtcblx0XHR0aGlzLl9vTmF2aWdhdGlvblNlcnZpY2UgPSB0aGlzLl9vQXBwQ29tcG9uZW50LmdldE5hdmlnYXRpb25TZXJ2aWNlKCk7XG5cdFx0dGhpcy5fb1ZpZXcgPSB0aGlzLmJhc2UuZ2V0VmlldygpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEVuYWJsZXMgaW50ZW50LWJhc2VkIG5hdmlnYXRpb24gKFNlbWFudGljT2JqZWN0LUFjdGlvbikgd2l0aCB0aGUgcHJvdmlkZWQgY29udGV4dC5cblx0ICogSWYgc2VtYW50aWMgb2JqZWN0IG1hcHBpbmcgaXMgcHJvdmlkZWQsIHRoaXMgaXMgYWxzbyBhcHBsaWVkIHRvIHRoZSBzZWxlY3Rpb24gdmFyaWFudCBhZnRlciB0aGUgYWRhcHRhdGlvbiBieSBhIGNvbnN1bWVyLlxuXHQgKiBUaGlzIHRha2VzIGNhcmUgb2YgcmVtb3ZpbmcgYW55IHRlY2huaWNhbCBwYXJhbWV0ZXJzIGFuZCBkZXRlcm1pbmVzIGlmIGFuIGV4cGxhY2Ugb3IgaW5wbGFjZSBuYXZpZ2F0aW9uIHNob3VsZCB0YWtlIHBsYWNlLlxuXHQgKlxuXHQgKiBAcGFyYW0gc1NlbWFudGljT2JqZWN0IFNlbWFudGljIG9iamVjdCBmb3IgdGhlIHRhcmdldCBhcHBcblx0ICogQHBhcmFtIHNBY3Rpb24gIEFjdGlvbiBmb3IgdGhlIHRhcmdldCBhcHBcblx0ICogQHBhcmFtIFttTmF2aWdhdGlvblBhcmFtZXRlcnNdIE9wdGlvbmFsIHBhcmFtZXRlcnMgdG8gYmUgcGFzc2VkIHRvIHRoZSBleHRlcm5hbCBuYXZpZ2F0aW9uXG5cdCAqIEBwYXJhbSBbbU5hdmlnYXRpb25QYXJhbWV0ZXJzLm5hdmlnYXRpb25Db250ZXh0c10gVXNlcyBvbmUgb2YgdGhlIGZvbGxvd2luZyB0byBiZSBwYXNzZWQgdG8gdGhlIGludGVudDpcblx0ICogICAgYSBzaW5nbGUgaW5zdGFuY2Ugb2Yge0BsaW5rIHNhcC51aS5tb2RlbC5vZGF0YS52NC5Db250ZXh0fVxuXHQgKiAgICBtdWx0aXBsZSBpbnN0YW5jZXMgb2Yge0BsaW5rIHNhcC51aS5tb2RlbC5vZGF0YS52NC5Db250ZXh0fVxuXHQgKiAgICBhbiBvYmplY3Qgb3IgYW4gYXJyYXkgb2Ygb2JqZWN0c1xuXHQgKlx0XHQgIElmIGFuIGFycmF5IG9mIG9iamVjdHMgaXMgcGFzc2VkLCB0aGUgY29udGV4dCBpcyB1c2VkIHRvIGRldGVybWluZSB0aGUgbWV0YVBhdGggYW5kIHRvIHJlbW92ZSBhbnkgc2Vuc2l0aXZlIGRhdGFcblx0ICpcdFx0ICBJZiBhbiBhcnJheSBvZiBvYmplY3RzIGlzIHBhc3NlZCwgdGhlIGZvbGxvd2luZyBmb3JtYXQgaXggZXhwZWN0ZWQ6XG5cdCAqXHRcdCAge1xuXHQgKlx0XHRcdGRhdGE6IHtcblx0ICpcdCBcdFx0XHRQcm9kdWN0SUQ6IDc2MzQsXG5cdCAqXHRcdFx0XHROYW1lOiBcIkxhcHRvcFwiXG5cdCAqXHRcdFx0IH0sXG5cdCAqXHRcdFx0IG1ldGFQYXRoOiBcIi9TYWxlc09yZGVyTWFuYWdlXCJcblx0ICogICAgICAgIH1cblx0ICogQHBhcmFtIFttTmF2aWdhdGlvblBhcmFtZXRlcnMuc2VtYW50aWNPYmplY3RNYXBwaW5nXSBTdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIFNlbWFudGljT2JqZWN0TWFwcGluZyBvciBTZW1hbnRpY09iamVjdE1hcHBpbmcgdGhhdCBhcHBsaWVzIHRvIHRoaXMgbmF2aWdhdGlvblxuXHQgKiBAcGFyYW0gW21OYXZpZ2F0aW9uUGFyYW1ldGVycy5kZWZhdWx0UmVmcmVzaFN0cmF0ZWd5XSBEZWZhdWx0IHJlZnJlc2ggc3RyYXRlZ3kgdG8gYmUgdXNlZCBpbiBjYXNlIG5vIHJlZnJlc2ggc3RyYXRlZ3kgaXMgc3BlY2lmaWVkIGZvciB0aGUgaW50ZW50IGluIHRoZSB2aWV3LlxuXHQgKiBAcGFyYW0gW21OYXZpZ2F0aW9uUGFyYW1ldGVycy5yZWZyZXNoU3RyYXRlZ2llc11cblx0ICogQHBhcmFtIFttTmF2aWdhdGlvblBhcmFtZXRlcnMuYWRkaXRpb25hbE5hdmlnYXRpb25QYXJhbWV0ZXJzXSBBZGRpdGlvbmFsIG5hdmlnYXRpb24gcGFyYW1ldGVycyBjb25maWd1cmVkIGluIHRoZSBjcm9zc0FwcE5hdmlnYXRpb24gb3V0Ym91bmQgcGFyYW1ldGVycy5cblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRuYXZpZ2F0ZShcblx0XHRzU2VtYW50aWNPYmplY3Q6IHN0cmluZyxcblx0XHRzQWN0aW9uOiBzdHJpbmcsXG5cdFx0bU5hdmlnYXRpb25QYXJhbWV0ZXJzOlxuXHRcdFx0fCB7XG5cdFx0XHRcdFx0bmF2aWdhdGlvbkNvbnRleHRzPzogb2JqZWN0IHwgYW55W10gfCB1bmRlZmluZWQ7XG5cdFx0XHRcdFx0c2VtYW50aWNPYmplY3RNYXBwaW5nPzogc3RyaW5nIHwgb2JqZWN0IHwgdW5kZWZpbmVkO1xuXHRcdFx0XHRcdGRlZmF1bHRSZWZyZXNoU3RyYXRlZ3k/OiBvYmplY3QgfCB1bmRlZmluZWQ7XG5cdFx0XHRcdFx0cmVmcmVzaFN0cmF0ZWdpZXM/OiBhbnk7XG5cdFx0XHRcdFx0YWRkaXRpb25hbE5hdmlnYXRpb25QYXJhbWV0ZXJzPzogb2JqZWN0IHwgdW5kZWZpbmVkO1xuXHRcdFx0ICB9XG5cdFx0XHR8IHVuZGVmaW5lZFxuXHQpIHtcblx0XHRjb25zdCBfZG9OYXZpZ2F0ZSA9IChvQ29udGV4dD86IGFueSkgPT4ge1xuXHRcdFx0Y29uc3Qgdk5hdmlnYXRpb25Db250ZXh0cyA9IG1OYXZpZ2F0aW9uUGFyYW1ldGVycyAmJiBtTmF2aWdhdGlvblBhcmFtZXRlcnMubmF2aWdhdGlvbkNvbnRleHRzLFxuXHRcdFx0XHRhTmF2aWdhdGlvbkNvbnRleHRzID1cblx0XHRcdFx0XHR2TmF2aWdhdGlvbkNvbnRleHRzICYmICFBcnJheS5pc0FycmF5KHZOYXZpZ2F0aW9uQ29udGV4dHMpID8gW3ZOYXZpZ2F0aW9uQ29udGV4dHNdIDogdk5hdmlnYXRpb25Db250ZXh0cyxcblx0XHRcdFx0dlNlbWFudGljT2JqZWN0TWFwcGluZyA9IG1OYXZpZ2F0aW9uUGFyYW1ldGVycyAmJiBtTmF2aWdhdGlvblBhcmFtZXRlcnMuc2VtYW50aWNPYmplY3RNYXBwaW5nLFxuXHRcdFx0XHR2T3V0Ym91bmRQYXJhbXMgPSBtTmF2aWdhdGlvblBhcmFtZXRlcnMgJiYgbU5hdmlnYXRpb25QYXJhbWV0ZXJzLmFkZGl0aW9uYWxOYXZpZ2F0aW9uUGFyYW1ldGVycyxcblx0XHRcdFx0b1RhcmdldEluZm86IGFueSA9IHtcblx0XHRcdFx0XHRzZW1hbnRpY09iamVjdDogc1NlbWFudGljT2JqZWN0LFxuXHRcdFx0XHRcdGFjdGlvbjogc0FjdGlvblxuXHRcdFx0XHR9LFxuXHRcdFx0XHRvVmlldyA9IHRoaXMuYmFzZS5nZXRWaWV3KCksXG5cdFx0XHRcdG9Db250cm9sbGVyID0gb1ZpZXcuZ2V0Q29udHJvbGxlcigpIGFzIFBhZ2VDb250cm9sbGVyO1xuXG5cdFx0XHRpZiAob0NvbnRleHQpIHtcblx0XHRcdFx0dGhpcy5fb1ZpZXcuc2V0QmluZGluZ0NvbnRleHQob0NvbnRleHQpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoc1NlbWFudGljT2JqZWN0ICYmIHNBY3Rpb24pIHtcblx0XHRcdFx0bGV0IGFTZW1hbnRpY0F0dHJpYnV0ZXM6IGFueVtdID0gW10sXG5cdFx0XHRcdFx0b1NlbGVjdGlvblZhcmlhbnQ6IGFueSA9IG5ldyBTZWxlY3Rpb25WYXJpYW50KCk7XG5cdFx0XHRcdC8vIDEuIGdldCBTZW1hbnRpY0F0dHJpYnV0ZXMgZm9yIG5hdmlnYXRpb25cblx0XHRcdFx0aWYgKGFOYXZpZ2F0aW9uQ29udGV4dHMgJiYgYU5hdmlnYXRpb25Db250ZXh0cy5sZW5ndGgpIHtcblx0XHRcdFx0XHRhTmF2aWdhdGlvbkNvbnRleHRzLmZvckVhY2goKG9OYXZpZ2F0aW9uQ29udGV4dDogYW55KSA9PiB7XG5cdFx0XHRcdFx0XHQvLyAxLjEuYSBpZiBuYXZpZ2F0aW9uIGNvbnRleHQgaXMgaW5zdGFuY2Ugb2Ygc2FwLnVpLm1vZGUub2RhdGEudjQuQ29udGV4dFxuXHRcdFx0XHRcdFx0Ly8gZWxzZSBjaGVjayBpZiBuYXZpZ2F0aW9uIGNvbnRleHQgaXMgb2YgdHlwZSBvYmplY3Rcblx0XHRcdFx0XHRcdGlmIChvTmF2aWdhdGlvbkNvbnRleHQuaXNBICYmIG9OYXZpZ2F0aW9uQ29udGV4dC5pc0EoXCJzYXAudWkubW9kZWwub2RhdGEudjQuQ29udGV4dFwiKSkge1xuXHRcdFx0XHRcdFx0XHQvLyAxLjEuYiByZW1vdmUgc2Vuc2l0aXZlIGRhdGFcblx0XHRcdFx0XHRcdFx0bGV0IG9TZW1hbnRpY0F0dHJpYnV0ZXMgPSBvTmF2aWdhdGlvbkNvbnRleHQuZ2V0T2JqZWN0KCk7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IHNNZXRhUGF0aCA9IHRoaXMuX29NZXRhTW9kZWwuZ2V0TWV0YVBhdGgob05hdmlnYXRpb25Db250ZXh0LmdldFBhdGgoKSk7XG5cdFx0XHRcdFx0XHRcdC8vIFRPRE86IGFsc28gcmVtb3ZlIHNlbnNpdGl2ZSBkYXRhIGZyb20gIG5hdmlnYXRpb24gcHJvcGVydGllc1xuXHRcdFx0XHRcdFx0XHRvU2VtYW50aWNBdHRyaWJ1dGVzID0gdGhpcy5yZW1vdmVTZW5zaXRpdmVEYXRhKG9TZW1hbnRpY0F0dHJpYnV0ZXMsIHNNZXRhUGF0aCk7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IG9OYXZDb250ZXh0ID0gdGhpcy5wcmVwYXJlQ29udGV4dEZvckV4dGVybmFsTmF2aWdhdGlvbihvU2VtYW50aWNBdHRyaWJ1dGVzLCBvTmF2aWdhdGlvbkNvbnRleHQpO1xuXHRcdFx0XHRcdFx0XHRvVGFyZ2V0SW5mb1tcInByb3BlcnRpZXNXaXRob3V0Q29uZmxpY3RcIl0gPSBvTmF2Q29udGV4dC5wcm9wZXJ0aWVzV2l0aG91dENvbmZsaWN0O1xuXHRcdFx0XHRcdFx0XHRhU2VtYW50aWNBdHRyaWJ1dGVzLnB1c2gob05hdkNvbnRleHQuc2VtYW50aWNBdHRyaWJ1dGVzKTtcblx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoXG5cdFx0XHRcdFx0XHRcdCEob05hdmlnYXRpb25Db250ZXh0ICYmIEFycmF5LmlzQXJyYXkob05hdmlnYXRpb25Db250ZXh0LmRhdGEpKSAmJlxuXHRcdFx0XHRcdFx0XHR0eXBlb2Ygb05hdmlnYXRpb25Db250ZXh0ID09PSBcIm9iamVjdFwiXG5cdFx0XHRcdFx0XHQpIHtcblx0XHRcdFx0XHRcdFx0Ly8gMS4xLmIgcmVtb3ZlIHNlbnNpdGl2ZSBkYXRhIGZyb20gb2JqZWN0XG5cdFx0XHRcdFx0XHRcdGFTZW1hbnRpY0F0dHJpYnV0ZXMucHVzaCh0aGlzLnJlbW92ZVNlbnNpdGl2ZURhdGEob05hdmlnYXRpb25Db250ZXh0LmRhdGEsIG9OYXZpZ2F0aW9uQ29udGV4dC5tZXRhUGF0aCkpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIGlmIChvTmF2aWdhdGlvbkNvbnRleHQgJiYgQXJyYXkuaXNBcnJheShvTmF2aWdhdGlvbkNvbnRleHQuZGF0YSkpIHtcblx0XHRcdFx0XHRcdFx0Ly8gb05hdmlnYXRpb25Db250ZXh0LmRhdGEgY2FuIGJlIGFycmF5IGFscmVhZHkgZXggOiBbe0N1c3RvbWVyOiBcIjEwMDAxXCJ9LCB7Q3VzdG9tZXI6IFwiMTAwOTFcIn1dXG5cdFx0XHRcdFx0XHRcdC8vIGhlbmNlIGFzc2lnbmluZyBpdCB0byB0aGUgYVNlbWFudGljQXR0cmlidXRlc1xuXHRcdFx0XHRcdFx0XHRhU2VtYW50aWNBdHRyaWJ1dGVzID0gdGhpcy5yZW1vdmVTZW5zaXRpdmVEYXRhKG9OYXZpZ2F0aW9uQ29udGV4dC5kYXRhLCBvTmF2aWdhdGlvbkNvbnRleHQubWV0YVBhdGgpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIDIuMSBNZXJnZSBiYXNlIHNlbGVjdGlvbiB2YXJpYW50IGFuZCBzYW5pdGl6ZWQgc2VtYW50aWMgYXR0cmlidXRlcyBpbnRvIG9uZSBTZWxlY3Rpb25WYXJpYW50XG5cdFx0XHRcdGlmIChhU2VtYW50aWNBdHRyaWJ1dGVzICYmIGFTZW1hbnRpY0F0dHJpYnV0ZXMubGVuZ3RoKSB7XG5cdFx0XHRcdFx0b1NlbGVjdGlvblZhcmlhbnQgPSB0aGlzLl9vTmF2aWdhdGlvblNlcnZpY2UubWl4QXR0cmlidXRlc0FuZFNlbGVjdGlvblZhcmlhbnQoXG5cdFx0XHRcdFx0XHRhU2VtYW50aWNBdHRyaWJ1dGVzLFxuXHRcdFx0XHRcdFx0b1NlbGVjdGlvblZhcmlhbnQudG9KU09OU3RyaW5nKClcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gMy4gQWRkIGZpbHRlckNvbnRleHRVcmwgdG8gU1Ygc28gdGhlIE5hdmlnYXRpb25IYW5kbGVyIGNhbiByZW1vdmUgYW55IHNlbnNpdGl2ZSBkYXRhIGJhc2VkIG9uIHZpZXcgZW50aXR5U2V0XG5cdFx0XHRcdGNvbnN0IG9Nb2RlbCA9IHRoaXMuX29WaWV3LmdldE1vZGVsKCksXG5cdFx0XHRcdFx0c0VudGl0eVNldCA9IHRoaXMuZ2V0RW50aXR5U2V0KCksXG5cdFx0XHRcdFx0c0NvbnRleHRVcmwgPSBzRW50aXR5U2V0ID8gdGhpcy5fb05hdmlnYXRpb25TZXJ2aWNlLmNvbnN0cnVjdENvbnRleHRVcmwoc0VudGl0eVNldCwgb01vZGVsKSA6IHVuZGVmaW5lZDtcblx0XHRcdFx0aWYgKHNDb250ZXh0VXJsKSB7XG5cdFx0XHRcdFx0b1NlbGVjdGlvblZhcmlhbnQuc2V0RmlsdGVyQ29udGV4dFVybChzQ29udGV4dFVybCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBBcHBseSBPdXRib3VuZCBQYXJhbWV0ZXJzIHRvIHRoZSBTVlxuXHRcdFx0XHRpZiAodk91dGJvdW5kUGFyYW1zKSB7XG5cdFx0XHRcdFx0dGhpcy5fYXBwbHlPdXRib3VuZFBhcmFtcyhvU2VsZWN0aW9uVmFyaWFudCwgdk91dGJvdW5kUGFyYW1zKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIDQuIGdpdmUgYW4gb3Bwb3J0dW5pdHkgZm9yIHRoZSBhcHBsaWNhdGlvbiB0byBpbmZsdWVuY2UgdGhlIFNlbGVjdGlvblZhcmlhbnRcblx0XHRcdFx0b0NvbnRyb2xsZXIuaW50ZW50QmFzZWROYXZpZ2F0aW9uLmFkYXB0TmF2aWdhdGlvbkNvbnRleHQob1NlbGVjdGlvblZhcmlhbnQsIG9UYXJnZXRJbmZvKTtcblxuXHRcdFx0XHQvLyA1LiBBcHBseSBzZW1hbnRpYyBvYmplY3QgbWFwcGluZ3MgdG8gdGhlIFNWXG5cdFx0XHRcdGlmICh2U2VtYW50aWNPYmplY3RNYXBwaW5nKSB7XG5cdFx0XHRcdFx0dGhpcy5fYXBwbHlTZW1hbnRpY09iamVjdE1hcHBpbmdzKG9TZWxlY3Rpb25WYXJpYW50LCB2U2VtYW50aWNPYmplY3RNYXBwaW5nKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIDYuIHJlbW92ZSB0ZWNobmljYWwgcGFyYW1ldGVycyBmcm9tIFNlbGVjdGlvbiBWYXJpYW50XG5cdFx0XHRcdHRoaXMuX3JlbW92ZVRlY2huaWNhbFBhcmFtZXRlcnMob1NlbGVjdGlvblZhcmlhbnQpO1xuXG5cdFx0XHRcdC8vIDcuIGNoZWNrIGlmIHByb2dyYW1taW5nIG1vZGVsIGlzIHN0aWNreSBhbmQgcGFnZSBpcyBlZGl0YWJsZVxuXHRcdFx0XHRjb25zdCBzTmF2TW9kZSA9IG9Db250cm9sbGVyLl9pbnRlbnRCYXNlZE5hdmlnYXRpb24uZ2V0TmF2aWdhdGlvbk1vZGUoKTtcblxuXHRcdFx0XHQvLyA4LiBVcGRhdGluZyByZWZyZXNoIHN0cmF0ZWd5IGluIGludGVybmFsIG1vZGVsXG5cdFx0XHRcdGNvbnN0IG1SZWZyZXNoU3RyYXRlZ2llcyA9IChtTmF2aWdhdGlvblBhcmFtZXRlcnMgJiYgbU5hdmlnYXRpb25QYXJhbWV0ZXJzLnJlZnJlc2hTdHJhdGVnaWVzKSB8fCB7fSxcblx0XHRcdFx0XHRvSW50ZXJuYWxNb2RlbCA9IG9WaWV3LmdldE1vZGVsKFwiaW50ZXJuYWxcIikgYXMgSlNPTk1vZGVsO1xuXHRcdFx0XHRpZiAob0ludGVybmFsTW9kZWwpIHtcblx0XHRcdFx0XHRpZiAoKG9WaWV3ICYmIChvVmlldy5nZXRWaWV3RGF0YSgpIGFzIGFueSkpLnJlZnJlc2hTdHJhdGVneU9uQXBwUmVzdG9yZSkge1xuXHRcdFx0XHRcdFx0Y29uc3QgbVZpZXdSZWZyZXNoU3RyYXRlZ2llcyA9IChvVmlldy5nZXRWaWV3RGF0YSgpIGFzIGFueSkucmVmcmVzaFN0cmF0ZWd5T25BcHBSZXN0b3JlIHx8IHt9O1xuXHRcdFx0XHRcdFx0bWVyZ2VPYmplY3RzKG1SZWZyZXNoU3RyYXRlZ2llcywgbVZpZXdSZWZyZXNoU3RyYXRlZ2llcyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNvbnN0IG1SZWZyZXNoU3RyYXRlZ3kgPSBLZWVwQWxpdmVIZWxwZXIuZ2V0UmVmcmVzaFN0cmF0ZWd5Rm9ySW50ZW50KG1SZWZyZXNoU3RyYXRlZ2llcywgc1NlbWFudGljT2JqZWN0LCBzQWN0aW9uKTtcblx0XHRcdFx0XHRpZiAobVJlZnJlc2hTdHJhdGVneSkge1xuXHRcdFx0XHRcdFx0b0ludGVybmFsTW9kZWwuc2V0UHJvcGVydHkoXCIvcmVmcmVzaFN0cmF0ZWd5T25BcHBSZXN0b3JlXCIsIG1SZWZyZXNoU3RyYXRlZ3kpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIDkuIE5hdmlnYXRlIHZpYSBOYXZpZ2F0aW9uSGFuZGxlclxuXHRcdFx0XHRjb25zdCBvbkVycm9yID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdHNhcC51aS5yZXF1aXJlKFtcInNhcC9tL01lc3NhZ2VCb3hcIl0sIGZ1bmN0aW9uIChNZXNzYWdlQm94OiBhbnkpIHtcblx0XHRcdFx0XHRcdGNvbnN0IG9SZXNvdXJjZUJ1bmRsZSA9IENvcmUuZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlKFwic2FwLmZlLmNvcmVcIik7XG5cdFx0XHRcdFx0XHRNZXNzYWdlQm94LmVycm9yKG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiQ19DT01NT05fSEVMUEVSX05BVklHQVRJT05fRVJST1JfTUVTU0FHRVwiKSwge1xuXHRcdFx0XHRcdFx0XHR0aXRsZTogb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJDX0NPTU1PTl9TQVBGRV9FUlJPUlwiKVxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH07XG5cdFx0XHRcdHRoaXMuX29OYXZpZ2F0aW9uU2VydmljZS5uYXZpZ2F0ZShcblx0XHRcdFx0XHRzU2VtYW50aWNPYmplY3QsXG5cdFx0XHRcdFx0c0FjdGlvbixcblx0XHRcdFx0XHRvU2VsZWN0aW9uVmFyaWFudC50b0pTT05TdHJpbmcoKSxcblx0XHRcdFx0XHR1bmRlZmluZWQsXG5cdFx0XHRcdFx0b25FcnJvcixcblx0XHRcdFx0XHR1bmRlZmluZWQsXG5cdFx0XHRcdFx0c05hdk1vZGVcblx0XHRcdFx0KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlNlbWFudGljIE9iamVjdC9hY3Rpb24gaXMgbm90IHByb3ZpZGVkXCIpO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0Y29uc3Qgb0JpbmRpbmdDb250ZXh0ID0gdGhpcy5iYXNlLmdldFZpZXcoKS5nZXRCaW5kaW5nQ29udGV4dCgpO1xuXHRcdGNvbnN0IG9NZXRhTW9kZWwgPSBvQmluZGluZ0NvbnRleHQgJiYgKG9CaW5kaW5nQ29udGV4dC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpIGFzIE9EYXRhTWV0YU1vZGVsKTtcblx0XHRpZiAoXG5cdFx0XHQodGhpcy5nZXRWaWV3KCkuZ2V0Vmlld0RhdGEoKSBhcyBhbnkpLmNvbnZlcnRlclR5cGUgPT09IFwiT2JqZWN0UGFnZVwiICYmXG5cdFx0XHRvTWV0YU1vZGVsICYmXG5cdFx0XHQhTW9kZWxIZWxwZXIuaXNTdGlja3lTZXNzaW9uU3VwcG9ydGVkKG9NZXRhTW9kZWwpXG5cdFx0KSB7XG5cdFx0XHRkcmFmdC5wcm9jZXNzRGF0YUxvc3NPckRyYWZ0RGlzY2FyZENvbmZpcm1hdGlvbihcblx0XHRcdFx0X2RvTmF2aWdhdGUuYmluZCh0aGlzKSxcblx0XHRcdFx0RnVuY3Rpb24ucHJvdG90eXBlLFxuXHRcdFx0XHR0aGlzLmJhc2UuZ2V0VmlldygpLmdldEJpbmRpbmdDb250ZXh0KCksXG5cdFx0XHRcdHRoaXMuYmFzZS5nZXRWaWV3KCkuZ2V0Q29udHJvbGxlcigpLFxuXHRcdFx0XHR0cnVlLFxuXHRcdFx0XHRkcmFmdC5OYXZpZ2F0aW9uVHlwZS5Gb3J3YXJkTmF2aWdhdGlvblxuXHRcdFx0KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0X2RvTmF2aWdhdGUoKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogUHJlcGFyZSBhdHRyaWJ1dGVzIHRvIGJlIHBhc3NlZCB0byBleHRlcm5hbCBuYXZpZ2F0aW9uLlxuXHQgKlxuXHQgKiBAcGFyYW0gb1NlbWFudGljQXR0cmlidXRlcyBDb250ZXh0IGRhdGEgYWZ0ZXIgcmVtb3ZpbmcgYWxsIHNlbnNpdGl2ZSBpbmZvcm1hdGlvbi5cblx0ICogQHBhcmFtIG9Db250ZXh0IEFjdHVhbCBjb250ZXh0IGZyb20gd2hpY2ggdGhlIHNlbWFudGljQXR0cmlidXRlcyB3ZXJlIGRlcml2ZWQuXG5cdCAqIEByZXR1cm5zIE9iamVjdCBvZiBwcmVwYXJlZCBhdHRyaWJ1dGVzIGZvciBleHRlcm5hbCBuYXZpZ2F0aW9uIGFuZCBubyBjb25mbGljdCBwcm9wZXJ0aWVzLlxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdHByZXBhcmVDb250ZXh0Rm9yRXh0ZXJuYWxOYXZpZ2F0aW9uKG9TZW1hbnRpY0F0dHJpYnV0ZXM6IGFueSwgb0NvbnRleHQ6IENvbnRleHQpIHtcblx0XHQvLyAxLiBGaW5kIGFsbCBkaXN0aW5jdCBrZXlzIGluIHRoZSBvYmplY3QgU2VtYW50aWNBdHRyaWJ1dGVzXG5cdFx0Ly8gU3RvcmUgbWV0YSBwYXRoIGZvciBlYWNoIG9jY3VyZW5jZSBvZiB0aGUga2V5XG5cdFx0Y29uc3Qgb0Rpc3RpbmN0S2V5czogYW55ID0ge30sXG5cdFx0XHRzQ29udGV4dFBhdGggPSBvQ29udGV4dC5nZXRQYXRoKCksXG5cdFx0XHRvTWV0YU1vZGVsID0gb0NvbnRleHQuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSBhcyBPRGF0YU1ldGFNb2RlbCxcblx0XHRcdHNNZXRhUGF0aCA9IG9NZXRhTW9kZWwuZ2V0TWV0YVBhdGgoc0NvbnRleHRQYXRoKSxcblx0XHRcdGFNZXRhUGF0aFBhcnRzID0gc01ldGFQYXRoLnNwbGl0KFwiL1wiKS5maWx0ZXIoQm9vbGVhbik7XG5cblx0XHRmdW5jdGlvbiBfZmluZERpc3RpbmN0S2V5c0luT2JqZWN0KExvb2tVcE9iamVjdDogYW55LCBzTG9va1VwT2JqZWN0TWV0YVBhdGg6IGFueSkge1xuXHRcdFx0Zm9yIChjb25zdCBzS2V5IGluIExvb2tVcE9iamVjdCkge1xuXHRcdFx0XHQvLyBudWxsIGNhc2U/P1xuXHRcdFx0XHRpZiAoTG9va1VwT2JqZWN0W3NLZXldID09PSBudWxsIHx8IHR5cGVvZiBMb29rVXBPYmplY3Rbc0tleV0gIT09IFwib2JqZWN0XCIpIHtcblx0XHRcdFx0XHRpZiAoIW9EaXN0aW5jdEtleXNbc0tleV0pIHtcblx0XHRcdFx0XHRcdC8vIGlmIGtleSBpcyBmb3VuZCBmb3IgdGhlIGZpcnN0IHRpbWUgdGhlbiBjcmVhdGUgYXJyYXlcblx0XHRcdFx0XHRcdG9EaXN0aW5jdEtleXNbc0tleV0gPSBbXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly8gcHVzaCBwYXRoIHRvIGFycmF5XG5cdFx0XHRcdFx0b0Rpc3RpbmN0S2V5c1tzS2V5XS5wdXNoKHNMb29rVXBPYmplY3RNZXRhUGF0aCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gaWYgYSBuZXN0ZWQgb2JqZWN0IGlzIGZvdW5kXG5cdFx0XHRcdFx0Y29uc3Qgb05ld0xvb2tVcE9iamVjdCA9IExvb2tVcE9iamVjdFtzS2V5XTtcblx0XHRcdFx0XHRfZmluZERpc3RpbmN0S2V5c0luT2JqZWN0KG9OZXdMb29rVXBPYmplY3QsIGAke3NMb29rVXBPYmplY3RNZXRhUGF0aH0vJHtzS2V5fWApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0X2ZpbmREaXN0aW5jdEtleXNJbk9iamVjdChvU2VtYW50aWNBdHRyaWJ1dGVzLCBzTWV0YVBhdGgpO1xuXG5cdFx0Ly8gMi4gRGV0ZXJtaW5lIGRpc3RpbmN0IGtleSB2YWx1ZSBhbmQgYWRkIGNvbmZsaWN0ZWQgcGF0aHMgdG8gc2VtYW50aWMgYXR0cmlidXRlc1xuXHRcdGNvbnN0IHNNYWluRW50aXR5U2V0TmFtZSA9IGFNZXRhUGF0aFBhcnRzWzBdLFxuXHRcdFx0c01haW5FbnRpdHlUeXBlTmFtZSA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAvJHtzTWFpbkVudGl0eVNldE5hbWV9L0BzYXB1aS5uYW1lYCksXG5cdFx0XHRvUHJvcGVydGllc1dpdGhvdXRDb25mbGljdDogYW55ID0ge307XG5cdFx0bGV0IHNNYWluRW50aXR5VmFsdWVQYXRoLCBzQ3VycmVudFZhbHVlUGF0aCwgc0xhc3RWYWx1ZVBhdGg7XG5cdFx0Zm9yIChjb25zdCBzRGlzdGluY3RLZXkgaW4gb0Rpc3RpbmN0S2V5cykge1xuXHRcdFx0Y29uc3QgYUNvbmZsaWN0aW5nUGF0aHMgPSBvRGlzdGluY3RLZXlzW3NEaXN0aW5jdEtleV07XG5cdFx0XHRsZXQgc1dpbm5lclZhbHVlUGF0aDtcblx0XHRcdC8vIEZpbmQgd2lubmVyIHZhbHVlIGZvciBlYWNoIGRpc3RpbmN0IGtleSBpbiBjYXNlIG9mIGNvbmZsaWN0IGJ5IHRoZSBmb2xsb3dpbmcgcnVsZTpcblxuXHRcdFx0Ly8gLT4gQS4gaWYgYW55IG1ldGEgcGF0aCBmb3IgYSBkaXN0aW5jdCBrZXkgaXMgdGhlIHNhbWUgYXMgbWFpbiBlbnRpdHkgdGFrZSB0aGF0IGFzIHRoZSB2YWx1ZVxuXHRcdFx0Ly8gLT4gQi4gaWYgQSBpcyBub3QgbWV0IGtlZXAgdGhlIHZhbHVlIGZyb20gdGhlIGN1cnJlbnQgY29udGV4dCAoc01ldGFQYXRoID09PSBwYXRoIG9mIGRpc3RpbmNlIGtleSlcblx0XHRcdC8vIC0+IEMuIGlmIEEsIEIgb3IgQyBhcmUgbm90IG1ldCB0YWtlIHRoZSBsYXN0IHBhdGggZm9yIHZhbHVlXG5cdFx0XHRpZiAoYUNvbmZsaWN0aW5nUGF0aHMubGVuZ3RoID4gMSkge1xuXHRcdFx0XHQvLyBjb25mbGljdFxuXHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8PSBhQ29uZmxpY3RpbmdQYXRocy5sZW5ndGggLSAxOyBpKyspIHtcblx0XHRcdFx0XHRjb25zdCBzUGF0aCA9IGFDb25mbGljdGluZ1BhdGhzW2ldO1xuXHRcdFx0XHRcdGxldCBzUGF0aEluQ29udGV4dCA9IHNQYXRoLnJlcGxhY2Uoc1BhdGggPT09IHNNZXRhUGF0aCA/IHNNZXRhUGF0aCA6IGAke3NNZXRhUGF0aH0vYCwgXCJcIik7XG5cdFx0XHRcdFx0c1BhdGhJbkNvbnRleHQgPSAoc1BhdGhJbkNvbnRleHQgPT09IFwiXCIgPyBzUGF0aEluQ29udGV4dCA6IGAke3NQYXRoSW5Db250ZXh0fS9gKSArIHNEaXN0aW5jdEtleTtcblx0XHRcdFx0XHRjb25zdCBzRW50aXR5VHlwZU5hbWUgPSBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzUGF0aH0vQHNhcHVpLm5hbWVgKTtcblx0XHRcdFx0XHQvLyBydWxlIEFcblxuXHRcdFx0XHRcdC8vIHJ1bGUgQVxuXHRcdFx0XHRcdGlmIChzRW50aXR5VHlwZU5hbWUgPT09IHNNYWluRW50aXR5VHlwZU5hbWUpIHtcblx0XHRcdFx0XHRcdHNNYWluRW50aXR5VmFsdWVQYXRoID0gc1BhdGhJbkNvbnRleHQ7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Ly8gcnVsZSBCXG5cdFx0XHRcdFx0aWYgKHNQYXRoID09PSBzTWV0YVBhdGgpIHtcblx0XHRcdFx0XHRcdHNDdXJyZW50VmFsdWVQYXRoID0gc1BhdGhJbkNvbnRleHQ7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Ly8gcnVsZSBDXG5cdFx0XHRcdFx0c0xhc3RWYWx1ZVBhdGggPSBzUGF0aEluQ29udGV4dDtcblxuXHRcdFx0XHRcdC8vIGFkZCBjb25mbGljdGVkIHBhdGggdG8gc2VtYW50aWMgYXR0cmlidXRlc1xuXHRcdFx0XHRcdC8vIGNoZWNrIGlmIHRoZSBjdXJyZW50IHBhdGggcG9pbnRzIHRvIG1haW4gZW50aXR5IGFuZCBwcmVmaXggYXR0cmlidXRlIG5hbWVzIGFjY29yZGluZ2x5XG5cdFx0XHRcdFx0b1NlbWFudGljQXR0cmlidXRlc1tcblx0XHRcdFx0XHRcdGAke3NNZXRhUGF0aH0vJHtzUGF0aEluQ29udGV4dH1gXG5cdFx0XHRcdFx0XHRcdC5zcGxpdChcIi9cIilcblx0XHRcdFx0XHRcdFx0LmZpbHRlcihmdW5jdGlvbiAoc1ZhbHVlOiBzdHJpbmcpIHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gc1ZhbHVlICE9IFwiXCI7XG5cdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdC5qb2luKFwiLlwiKVxuXHRcdFx0XHRcdF0gPSBvQ29udGV4dC5nZXRQcm9wZXJ0eShzUGF0aEluQ29udGV4dCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gQSB8fCBCIHx8IENcblx0XHRcdFx0c1dpbm5lclZhbHVlUGF0aCA9IHNNYWluRW50aXR5VmFsdWVQYXRoIHx8IHNDdXJyZW50VmFsdWVQYXRoIHx8IHNMYXN0VmFsdWVQYXRoO1xuXHRcdFx0XHRvU2VtYW50aWNBdHRyaWJ1dGVzW3NEaXN0aW5jdEtleV0gPSBvQ29udGV4dC5nZXRQcm9wZXJ0eShzV2lubmVyVmFsdWVQYXRoKTtcblx0XHRcdFx0c01haW5FbnRpdHlWYWx1ZVBhdGggPSB1bmRlZmluZWQ7XG5cdFx0XHRcdHNDdXJyZW50VmFsdWVQYXRoID0gdW5kZWZpbmVkO1xuXHRcdFx0XHRzTGFzdFZhbHVlUGF0aCA9IHVuZGVmaW5lZDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIG5vIGNvbmZsaWN0LCBhZGQgZGlzdGluY3Qga2V5IHdpdGhvdXQgYWRkaW5nIHBhdGhzXG5cdFx0XHRcdGNvbnN0IHNQYXRoID0gYUNvbmZsaWN0aW5nUGF0aHNbMF07IC8vIGJlY2F1c2UgdGhlcmUgaXMgb25seSBvbmUgYW5kIGhlbmNlIG5vIGNvbmZsaWN0XG5cdFx0XHRcdGxldCBzUGF0aEluQ29udGV4dCA9IHNQYXRoLnJlcGxhY2Uoc1BhdGggPT09IHNNZXRhUGF0aCA/IHNNZXRhUGF0aCA6IGAke3NNZXRhUGF0aH0vYCwgXCJcIik7XG5cdFx0XHRcdHNQYXRoSW5Db250ZXh0ID0gKHNQYXRoSW5Db250ZXh0ID09PSBcIlwiID8gc1BhdGhJbkNvbnRleHQgOiBgJHtzUGF0aEluQ29udGV4dH0vYCkgKyBzRGlzdGluY3RLZXk7XG5cdFx0XHRcdG9TZW1hbnRpY0F0dHJpYnV0ZXNbc0Rpc3RpbmN0S2V5XSA9IG9Db250ZXh0LmdldFByb3BlcnR5KHNQYXRoSW5Db250ZXh0KTtcblx0XHRcdFx0b1Byb3BlcnRpZXNXaXRob3V0Q29uZmxpY3Rbc0Rpc3RpbmN0S2V5XSA9IGAke3NNZXRhUGF0aH0vJHtzUGF0aEluQ29udGV4dH1gXG5cdFx0XHRcdFx0LnNwbGl0KFwiL1wiKVxuXHRcdFx0XHRcdC5maWx0ZXIoZnVuY3Rpb24gKHNWYWx1ZTogc3RyaW5nKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gc1ZhbHVlICE9IFwiXCI7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQuam9pbihcIi5cIik7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8vIDMuIFJlbW92ZSBhbGwgTmF2aWdhdGlvbiBwcm9wZXJ0aWVzXG5cdFx0Zm9yIChjb25zdCBzUHJvcGVydHkgaW4gb1NlbWFudGljQXR0cmlidXRlcykge1xuXHRcdFx0aWYgKG9TZW1hbnRpY0F0dHJpYnV0ZXNbc1Byb3BlcnR5XSAhPT0gbnVsbCAmJiB0eXBlb2Ygb1NlbWFudGljQXR0cmlidXRlc1tzUHJvcGVydHldID09PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRcdGRlbGV0ZSBvU2VtYW50aWNBdHRyaWJ1dGVzW3NQcm9wZXJ0eV07XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiB7XG5cdFx0XHRzZW1hbnRpY0F0dHJpYnV0ZXM6IG9TZW1hbnRpY0F0dHJpYnV0ZXMsXG5cdFx0XHRwcm9wZXJ0aWVzV2l0aG91dENvbmZsaWN0OiBvUHJvcGVydGllc1dpdGhvdXRDb25mbGljdFxuXHRcdH07XG5cdH1cblx0LyoqXG5cdCAqIFByZXBhcmUgZmlsdGVyIGNvbmRpdGlvbnMgdG8gYmUgcGFzc2VkIHRvIGV4dGVybmFsIG5hdmlnYXRpb24uXG5cdCAqXG5cdCAqIEBwYXJhbSBvRmlsdGVyQmFyQ29uZGl0aW9ucyBGaWx0ZXIgY29uZGl0aW9ucy5cblx0ICogQHBhcmFtIHNSb290UGF0aCBSb290IHBhdGggb2YgdGhlIGFwcGxpY2F0aW9uLlxuXHQgKiBAcGFyYW0gYVBhcmFtZXRlcnMgTmFtZXMgb2YgcGFyYW1ldGVycyB0byBiZSBjb25zaWRlcmVkLlxuXHQgKiBAcmV0dXJucyBPYmplY3Qgb2YgcHJlcGFyZWQgZmlsdGVyIGNvbmRpdGlvbnMgZm9yIGV4dGVybmFsIG5hdmlnYXRpb24gYW5kIG5vIGNvbmZsaWN0IGZpbHRlcnMuXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0cHJlcGFyZUZpbHRlcnNGb3JFeHRlcm5hbE5hdmlnYXRpb24ob0ZpbHRlckJhckNvbmRpdGlvbnM6IGFueSwgc1Jvb3RQYXRoOiBzdHJpbmcsIGFQYXJhbWV0ZXJzPzogYW55W10pIHtcblx0XHRsZXQgc1BhdGg7XG5cdFx0Y29uc3Qgb0Rpc3RpbmN0S2V5czogYW55ID0ge307XG5cdFx0Y29uc3Qgb0ZpbHRlckNvbmRpdGlvbnNXaXRob3V0Q29uZmxpY3Q6IGFueSA9IHt9O1xuXHRcdGxldCBzTWFpbkVudGl0eVZhbHVlUGF0aCwgc0N1cnJlbnRWYWx1ZVBhdGgsIHNGdWxsQ29udGV4dFBhdGgsIHNXaW5uZXJWYWx1ZVBhdGgsIHNQYXRoSW5Db250ZXh0O1xuXG5cdFx0ZnVuY3Rpb24gX2ZpbmREaXN0aW5jdEtleXNJbk9iamVjdChMb29rVXBPYmplY3Q6IGFueSkge1xuXHRcdFx0bGV0IHNMb29rVXBPYmplY3RNZXRhUGF0aDtcblx0XHRcdGZvciAobGV0IHNLZXkgaW4gTG9va1VwT2JqZWN0KSB7XG5cdFx0XHRcdGlmIChMb29rVXBPYmplY3Rbc0tleV0pIHtcblx0XHRcdFx0XHRpZiAoc0tleS5pbmNsdWRlcyhcIi9cIikpIHtcblx0XHRcdFx0XHRcdHNMb29rVXBPYmplY3RNZXRhUGF0aCA9IHNLZXk7IC8vIFwiL1NhbGVzT3JkZXJtYW5hZ2UvX0l0ZW0vTWF0ZXJpYWxcIlxuXHRcdFx0XHRcdFx0Y29uc3QgYVBhdGhQYXJ0cyA9IHNLZXkuc3BsaXQoXCIvXCIpO1xuXHRcdFx0XHRcdFx0c0tleSA9IGFQYXRoUGFydHNbYVBhdGhQYXJ0cy5sZW5ndGggLSAxXTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0c0xvb2tVcE9iamVjdE1ldGFQYXRoID0gc1Jvb3RQYXRoO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAoIW9EaXN0aW5jdEtleXNbc0tleV0pIHtcblx0XHRcdFx0XHRcdC8vIGlmIGtleSBpcyBmb3VuZCBmb3IgdGhlIGZpcnN0IHRpbWUgdGhlbiBjcmVhdGUgYXJyYXlcblx0XHRcdFx0XHRcdG9EaXN0aW5jdEtleXNbc0tleV0gPSBbXTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvLyBwdXNoIHBhdGggdG8gYXJyYXlcblx0XHRcdFx0XHRvRGlzdGluY3RLZXlzW3NLZXldLnB1c2goc0xvb2tVcE9iamVjdE1ldGFQYXRoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdF9maW5kRGlzdGluY3RLZXlzSW5PYmplY3Qob0ZpbHRlckJhckNvbmRpdGlvbnMpO1xuXHRcdGZvciAoY29uc3Qgc0Rpc3RpbmN0S2V5IGluIG9EaXN0aW5jdEtleXMpIHtcblx0XHRcdGNvbnN0IGFDb25mbGljdGluZ1BhdGhzID0gb0Rpc3RpbmN0S2V5c1tzRGlzdGluY3RLZXldO1xuXG5cdFx0XHRpZiAoYUNvbmZsaWN0aW5nUGF0aHMubGVuZ3RoID4gMSkge1xuXHRcdFx0XHQvLyBjb25mbGljdFxuXHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8PSBhQ29uZmxpY3RpbmdQYXRocy5sZW5ndGggLSAxOyBpKyspIHtcblx0XHRcdFx0XHRzUGF0aCA9IGFDb25mbGljdGluZ1BhdGhzW2ldO1xuXHRcdFx0XHRcdGlmIChzUGF0aCA9PT0gc1Jvb3RQYXRoKSB7XG5cdFx0XHRcdFx0XHRzRnVsbENvbnRleHRQYXRoID0gYCR7c1Jvb3RQYXRofS8ke3NEaXN0aW5jdEtleX1gO1xuXHRcdFx0XHRcdFx0c1BhdGhJbkNvbnRleHQgPSBzRGlzdGluY3RLZXk7XG5cdFx0XHRcdFx0XHRzTWFpbkVudGl0eVZhbHVlUGF0aCA9IHNEaXN0aW5jdEtleTtcblx0XHRcdFx0XHRcdGlmIChhUGFyYW1ldGVycyAmJiBhUGFyYW1ldGVycy5pbmNsdWRlcyhzRGlzdGluY3RLZXkpKSB7XG5cdFx0XHRcdFx0XHRcdG9GaWx0ZXJCYXJDb25kaXRpb25zW2AkUGFyYW1ldGVyLiR7c0Rpc3RpbmN0S2V5fWBdID0gb0ZpbHRlckJhckNvbmRpdGlvbnNbc0Rpc3RpbmN0S2V5XTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0c1BhdGhJbkNvbnRleHQgPSBzUGF0aDtcblx0XHRcdFx0XHRcdHNGdWxsQ29udGV4dFBhdGggPSAoYCR7c1Jvb3RQYXRofS8ke3NQYXRofWAgYXMgYW55KS5yZXBsYWNlQWxsKC9cXCovZywgXCJcIik7XG5cdFx0XHRcdFx0XHRzQ3VycmVudFZhbHVlUGF0aCA9IHNQYXRoO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRvRmlsdGVyQmFyQ29uZGl0aW9uc1tcblx0XHRcdFx0XHRcdHNGdWxsQ29udGV4dFBhdGhcblx0XHRcdFx0XHRcdFx0LnNwbGl0KFwiL1wiKVxuXHRcdFx0XHRcdFx0XHQuZmlsdGVyKGZ1bmN0aW9uIChzVmFsdWU6IGFueSkge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBzVmFsdWUgIT0gXCJcIjtcblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0LmpvaW4oXCIuXCIpXG5cdFx0XHRcdFx0XSA9IG9GaWx0ZXJCYXJDb25kaXRpb25zW3NQYXRoSW5Db250ZXh0XTtcblx0XHRcdFx0XHRkZWxldGUgb0ZpbHRlckJhckNvbmRpdGlvbnNbc1BhdGhdO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0c1dpbm5lclZhbHVlUGF0aCA9IHNNYWluRW50aXR5VmFsdWVQYXRoIHx8IHNDdXJyZW50VmFsdWVQYXRoO1xuXHRcdFx0XHRvRmlsdGVyQmFyQ29uZGl0aW9uc1tzRGlzdGluY3RLZXldID0gb0ZpbHRlckJhckNvbmRpdGlvbnNbc1dpbm5lclZhbHVlUGF0aF07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBubyBjb25mbGljdCwgYWRkIGRpc3RpbmN0IGtleSB3aXRob3V0IGFkZGluZyBwYXRoc1xuXHRcdFx0XHRzUGF0aCA9IGFDb25mbGljdGluZ1BhdGhzWzBdO1xuXHRcdFx0XHRzRnVsbENvbnRleHRQYXRoID1cblx0XHRcdFx0XHRzUGF0aCA9PT0gc1Jvb3RQYXRoID8gYCR7c1Jvb3RQYXRofS8ke3NEaXN0aW5jdEtleX1gIDogKGAke3NSb290UGF0aH0vJHtzUGF0aH1gIGFzIGFueSkucmVwbGFjZUFsbChcIipcIiwgXCJcIik7XG5cdFx0XHRcdG9GaWx0ZXJDb25kaXRpb25zV2l0aG91dENvbmZsaWN0W3NEaXN0aW5jdEtleV0gPSBzRnVsbENvbnRleHRQYXRoXG5cdFx0XHRcdFx0LnNwbGl0KFwiL1wiKVxuXHRcdFx0XHRcdC5maWx0ZXIoZnVuY3Rpb24gKHNWYWx1ZTogYW55KSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gc1ZhbHVlICE9IFwiXCI7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQuam9pbihcIi5cIik7XG5cdFx0XHRcdGlmIChhUGFyYW1ldGVycyAmJiBhUGFyYW1ldGVycy5pbmNsdWRlcyhzRGlzdGluY3RLZXkpKSB7XG5cdFx0XHRcdFx0b0ZpbHRlckJhckNvbmRpdGlvbnNbYCRQYXJhbWV0ZXIuJHtzRGlzdGluY3RLZXl9YF0gPSBvRmlsdGVyQmFyQ29uZGl0aW9uc1tzRGlzdGluY3RLZXldO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdGZpbHRlckNvbmRpdGlvbnM6IG9GaWx0ZXJCYXJDb25kaXRpb25zLFxuXHRcdFx0ZmlsdGVyQ29uZGl0aW9uc1dpdGhvdXRDb25mbGljdDogb0ZpbHRlckNvbmRpdGlvbnNXaXRob3V0Q29uZmxpY3Rcblx0XHR9O1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldCBOYXZpZ2F0aW9uIG1vZGUuXG5cdCAqXG5cdCAqIEByZXR1cm5zIFRoZSBuYXZpZ2F0aW9uIG1vZGVcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZXh0ZW5zaWJsZShPdmVycmlkZUV4ZWN1dGlvbi5JbnN0ZWFkKVxuXHRnZXROYXZpZ2F0aW9uTW9kZSgpIHtcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cdC8qKlxuXHQgKiBBbGxvd3MgZm9yIG5hdmlnYXRpb24gdG8gYSBnaXZlbiBpbnRlbnQgKFNlbWFudGljT2JqZWN0LUFjdGlvbikgd2l0aCB0aGUgcHJvdmlkZWQgY29udGV4dCwgdXNpbmcgYSBkaWFsb2cgdGhhdCBzaG93cyB0aGUgY29udGV4dHMgd2hpY2ggY2Fubm90IGJlIHBhc3NlZFxuXHQgKiBJZiBzZW1hbnRpYyBvYmplY3QgbWFwcGluZyBpcyBwcm92aWRlZCwgdGhpcyBzZXR0aW5nIGlzIGFsc28gYXBwbGllZCB0byB0aGUgc2VsZWN0aW9uIHZhcmlhbnQgYWZ0ZXIgYWRhcHRhdGlvbiBieSBhIGNvbnN1bWVyLlxuXHQgKiBUaGlzIHNldHRpbmcgYWxzbyByZW1vdmVzIGFueSB0ZWNobmljYWwgcGFyYW1ldGVycyBhbmQgZGV0ZXJtaW5lcyBpZiBhbiBpbnBsYWNlIG9yIGV4cGxhY2UgbmF2aWdhdGlvbiBzaG91bGQgdGFrZSBwbGFjZS5cblx0ICpcblx0ICogQHBhcmFtIHNTZW1hbnRpY09iamVjdCBTZW1hbnRpYyBvYmplY3QgZm9yIHRoZSB0YXJnZXQgYXBwXG5cdCAqIEBwYXJhbSBzQWN0aW9uICBBY3Rpb24gZm9yIHRoZSB0YXJnZXQgYXBwXG5cdCAqIEBwYXJhbSBbbU5hdmlnYXRpb25QYXJhbWV0ZXJzXSBPcHRpb25hbCBwYXJhbWV0ZXJzIHRvIGJlIHBhc3NlZCB0byB0aGUgZXh0ZXJuYWwgbmF2aWdhdGlvblxuXHQgKiBAcGFyYW0gW21OYXZpZ2F0aW9uUGFyYW1ldGVycy5sYWJlbF1cblx0ICogQHBhcmFtIFttTmF2aWdhdGlvblBhcmFtZXRlcnMubmF2aWdhdGlvbkNvbnRleHRzXSBTaW5nbGUgaW5zdGFuY2Ugb3IgbXVsdGlwbGUgaW5zdGFuY2VzIG9mIHtAbGluayBzYXAudWkubW9kZWwub2RhdGEudjQuQ29udGV4dH0sIG9yIGFsdGVybmF0aXZlbHkgYW4gb2JqZWN0IG9yIGFycmF5IG9mIG9iamVjdHMsIHRvIGJlIHBhc3NlZCB0byB0aGUgaW50ZW50LlxuXHQgKiBAcGFyYW0gW21OYXZpZ2F0aW9uUGFyYW1ldGVycy5hcHBsaWNhYmxlQ29udGV4dHNdIFNpbmdsZSBpbnN0YW5jZSBvciBtdWx0aXBsZSBpbnN0YW5jZXMgb2Yge0BsaW5rIHNhcC51aS5tb2RlbC5vZGF0YS52NC5Db250ZXh0fSwgb3IgYWx0ZXJuYXRpdmVseSBhbiBvYmplY3Qgb3IgYXJyYXkgb2Ygb2JqZWN0cywgdG8gYmUgcGFzc2VkIHRvIHRoZSBpbnRlbnQgYW5kIGZvciB3aGljaCB0aGUgSUJOIGJ1dHRvbiBpcyBlbmFibGVkXG5cdCAqIEBwYXJhbSBbbU5hdmlnYXRpb25QYXJhbWV0ZXJzLm5vdEFwcGxpY2FibGVDb250ZXh0c10gU2luZ2xlIGluc3RhbmNlIG9yIG11bHRpcGxlIGluc3RhbmNlcyBvZiB7QGxpbmsgc2FwLnVpLm1vZGVsLm9kYXRhLnY0LkNvbnRleHR9LCBvciBhbHRlcm5hdGl2ZWx5IGFuIG9iamVjdCBvciBhcnJheSBvZiBvYmplY3RzLCB3aGljaCBjYW5ub3QgYmUgcGFzc2VkIHRvIHRoZSBpbnRlbnQuXG5cdCAqXHRcdCAgaWYgYW4gYXJyYXkgb2YgY29udGV4dHMgaXMgcGFzc2VkIHRoZSBjb250ZXh0IGlzIHVzZWQgdG8gZGV0ZXJtaW5lIHRoZSBtZXRhIHBhdGggYW5kIGFjY29yZGluZ2x5IHJlbW92ZSB0aGUgc2Vuc2l0aXZlIGRhdGFcblx0ICpcdFx0ICBJZiBhbiBhcnJheSBvZiBvYmplY3RzIGlzIHBhc3NlZCwgdGhlIGZvbGxvd2luZyBmb3JtYXQgaXMgZXhwZWN0ZWQ6XG5cdCAqXHRcdCAge1xuXHQgKlx0XHRcdGRhdGE6IHtcblx0ICpcdCBcdFx0XHRQcm9kdWN0SUQ6IDc2MzQsXG5cdCAqXHRcdFx0XHROYW1lOiBcIkxhcHRvcFwiXG5cdCAqXHRcdFx0IH0sXG5cdCAqXHRcdFx0IG1ldGFQYXRoOiBcIi9TYWxlc09yZGVyTWFuYWdlXCJcblx0ICogICAgICAgIH1cblx0ICpcdFx0VGhlIG1ldGFQYXRoIGlzIHVzZWQgdG8gcmVtb3ZlIGFueSBzZW5zaXRpdmUgZGF0YS5cblx0ICogQHBhcmFtIFttTmF2aWdhdGlvblBhcmFtZXRlcnMuc2VtYW50aWNPYmplY3RNYXBwaW5nXSBTdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgU2VtYW50aWNPYmplY3RNYXBwaW5nIG9yIFNlbWFudGljT2JqZWN0TWFwcGluZyB0aGF0IGFwcGxpZXMgdG8gdGhpcyBuYXZpZ2F0aW9uXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0bmF2aWdhdGVXaXRoQ29uZmlybWF0aW9uRGlhbG9nKFxuXHRcdHNTZW1hbnRpY09iamVjdDogc3RyaW5nLFxuXHRcdHNBY3Rpb246IHN0cmluZyxcblx0XHRtTmF2aWdhdGlvblBhcmFtZXRlcnM/OiB7XG5cdFx0XHRuYXZpZ2F0aW9uQ29udGV4dHM/OiBvYmplY3QgfCBhbnlbXTtcblx0XHRcdGFwcGxpY2FibGVDb250ZXh0cz86IG9iamVjdCB8IGFueVtdO1xuXHRcdFx0bm90QXBwbGljYWJsZUNvbnRleHRzPzogYW55O1xuXHRcdFx0bGFiZWw/OiBzdHJpbmc7XG5cdFx0XHRzZW1hbnRpY09iamVjdE1hcHBpbmc/OiBzdHJpbmcgfCBvYmplY3Q7XG5cdFx0fVxuXHQpIHtcblx0XHRpZiAobU5hdmlnYXRpb25QYXJhbWV0ZXJzPy5ub3RBcHBsaWNhYmxlQ29udGV4dHMgJiYgbU5hdmlnYXRpb25QYXJhbWV0ZXJzLm5vdEFwcGxpY2FibGVDb250ZXh0cz8ubGVuZ3RoID49IDEpIHtcblx0XHRcdGxldCBvQXBwbGljYWJsZUNvbnRleHREaWFsb2c6IERpYWxvZztcblx0XHRcdGNvbnN0IG9Db250cm9sbGVyID0ge1xuXHRcdFx0XHRvbkNsb3NlOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0Ly8gVXNlciBjYW5jZWxzIGFjdGlvblxuXHRcdFx0XHRcdG9BcHBsaWNhYmxlQ29udGV4dERpYWxvZy5jbG9zZSgpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRvbkNvbnRpbnVlOiAoKSA9PiB7XG5cdFx0XHRcdFx0Ly8gVXNlcnMgY29udGludWVzIHRoZSBhY3Rpb24gd2l0aCB0aGUgYm91bmQgY29udGV4dHNcblx0XHRcdFx0XHRtTmF2aWdhdGlvblBhcmFtZXRlcnMubmF2aWdhdGlvbkNvbnRleHRzID0gbU5hdmlnYXRpb25QYXJhbWV0ZXJzLmFwcGxpY2FibGVDb250ZXh0cztcblx0XHRcdFx0XHRvQXBwbGljYWJsZUNvbnRleHREaWFsb2cuY2xvc2UoKTtcblx0XHRcdFx0XHR0aGlzLm5hdmlnYXRlKHNTZW1hbnRpY09iamVjdCwgc0FjdGlvbiwgbU5hdmlnYXRpb25QYXJhbWV0ZXJzKTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHRcdGNvbnN0IGZuT3BlbkFuZEZpbGxEaWFsb2cgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdGxldCBvRGlhbG9nQ29udGVudDtcblx0XHRcdFx0Y29uc3Qgbk5vdEFwcGxpY2FibGUgPSBtTmF2aWdhdGlvblBhcmFtZXRlcnMubm90QXBwbGljYWJsZUNvbnRleHRzLmxlbmd0aCxcblx0XHRcdFx0XHRhTm90QXBwbGljYWJsZUl0ZW1zID0gW107XG5cdFx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgbU5hdmlnYXRpb25QYXJhbWV0ZXJzLm5vdEFwcGxpY2FibGVDb250ZXh0cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdG9EaWFsb2dDb250ZW50ID0gbU5hdmlnYXRpb25QYXJhbWV0ZXJzLm5vdEFwcGxpY2FibGVDb250ZXh0c1tpXS5nZXRPYmplY3QoKTtcblx0XHRcdFx0XHRhTm90QXBwbGljYWJsZUl0ZW1zLnB1c2gob0RpYWxvZ0NvbnRlbnQpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNvbnN0IG9Ob3RBcHBsaWNhYmxlSXRlbXNNb2RlbCA9IG5ldyBKU09OTW9kZWwoYU5vdEFwcGxpY2FibGVJdGVtcyk7XG5cdFx0XHRcdGNvbnN0IG9Ub3RhbHMgPSBuZXcgSlNPTk1vZGVsKHsgdG90YWw6IG5Ob3RBcHBsaWNhYmxlLCBsYWJlbDogbU5hdmlnYXRpb25QYXJhbWV0ZXJzLmxhYmVsIH0pO1xuXHRcdFx0XHRvQXBwbGljYWJsZUNvbnRleHREaWFsb2cuc2V0TW9kZWwob05vdEFwcGxpY2FibGVJdGVtc01vZGVsLCBcIm5vdEFwcGxpY2FibGVcIik7XG5cdFx0XHRcdG9BcHBsaWNhYmxlQ29udGV4dERpYWxvZy5zZXRNb2RlbChvVG90YWxzLCBcInRvdGFsc1wiKTtcblx0XHRcdFx0b0FwcGxpY2FibGVDb250ZXh0RGlhbG9nLm9wZW4oKTtcblx0XHRcdH07XG5cdFx0XHQvLyBTaG93IHRoZSBjb250ZXh0cyB0aGF0IGFyZSBub3QgYXBwbGljYWJsZSBhbmQgd2lsbCBub3QgdGhlcmVmb3JlIGJlIHByb2Nlc3NlZFxuXHRcdFx0Y29uc3Qgc0ZyYWdtZW50TmFtZSA9IFwic2FwLmZlLmNvcmUuY29udHJvbHMuQWN0aW9uUGFydGlhbFwiO1xuXHRcdFx0Y29uc3Qgb0RpYWxvZ0ZyYWdtZW50ID0gWE1MVGVtcGxhdGVQcm9jZXNzb3IubG9hZFRlbXBsYXRlKHNGcmFnbWVudE5hbWUsIFwiZnJhZ21lbnRcIik7XG5cdFx0XHRjb25zdCBvTW9kZWwgPSB0aGlzLl9vVmlldy5nZXRNb2RlbCgpO1xuXHRcdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG9Nb2RlbC5nZXRNZXRhTW9kZWwoKSBhcyBPRGF0YU1ldGFNb2RlbDtcblx0XHRcdGNvbnN0IHNDYW5vbmljYWxQYXRoID0gbU5hdmlnYXRpb25QYXJhbWV0ZXJzLm5vdEFwcGxpY2FibGVDb250ZXh0c1swXS5nZXRDYW5vbmljYWxQYXRoKCk7XG5cdFx0XHRjb25zdCBzRW50aXR5U2V0ID0gYCR7c0Nhbm9uaWNhbFBhdGguc3Vic3RyKDAsIHNDYW5vbmljYWxQYXRoLmluZGV4T2YoXCIoXCIpKX0vYDtcblx0XHRcdFByb21pc2UucmVzb2x2ZShcblx0XHRcdFx0WE1MUHJlcHJvY2Vzc29yLnByb2Nlc3MoXG5cdFx0XHRcdFx0b0RpYWxvZ0ZyYWdtZW50LFxuXHRcdFx0XHRcdHsgbmFtZTogc0ZyYWdtZW50TmFtZSB9LFxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGJpbmRpbmdDb250ZXh0czoge1xuXHRcdFx0XHRcdFx0XHRlbnRpdHlUeXBlOiBvTWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KHNFbnRpdHlTZXQpXG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0bW9kZWxzOiB7XG5cdFx0XHRcdFx0XHRcdGVudGl0eVR5cGU6IG9NZXRhTW9kZWwsXG5cdFx0XHRcdFx0XHRcdG1ldGFNb2RlbDogb01ldGFNb2RlbFxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0KVxuXHRcdFx0KVxuXHRcdFx0XHQudGhlbihmdW5jdGlvbiAob0ZyYWdtZW50OiBhbnkpIHtcblx0XHRcdFx0XHRyZXR1cm4gRnJhZ21lbnQubG9hZCh7IGRlZmluaXRpb246IG9GcmFnbWVudCwgY29udHJvbGxlcjogb0NvbnRyb2xsZXIgfSk7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC50aGVuKChvUG9wb3ZlcjogYW55KSA9PiB7XG5cdFx0XHRcdFx0b0FwcGxpY2FibGVDb250ZXh0RGlhbG9nID0gb1BvcG92ZXI7XG5cdFx0XHRcdFx0dGhpcy5nZXRWaWV3KCkuYWRkRGVwZW5kZW50KG9Qb3BvdmVyKTtcblx0XHRcdFx0XHRmbk9wZW5BbmRGaWxsRGlhbG9nKCk7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5jYXRjaChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3JcIik7XG5cdFx0XHRcdH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLm5hdmlnYXRlKHNTZW1hbnRpY09iamVjdCwgc0FjdGlvbiwgbU5hdmlnYXRpb25QYXJhbWV0ZXJzKTtcblx0XHR9XG5cdH1cblx0X3JlbW92ZVRlY2huaWNhbFBhcmFtZXRlcnMob1NlbGVjdGlvblZhcmlhbnQ6IGFueSkge1xuXHRcdG9TZWxlY3Rpb25WYXJpYW50LnJlbW92ZVNlbGVjdE9wdGlvbihcIkBvZGF0YS5jb250ZXh0XCIpO1xuXHRcdG9TZWxlY3Rpb25WYXJpYW50LnJlbW92ZVNlbGVjdE9wdGlvbihcIkBvZGF0YS5tZXRhZGF0YUV0YWdcIik7XG5cdFx0b1NlbGVjdGlvblZhcmlhbnQucmVtb3ZlU2VsZWN0T3B0aW9uKFwiU0FQX19NZXNzYWdlc1wiKTtcblx0fVxuXHQvKipcblx0ICogR2V0IHRhcmdldGVkIEVudGl0eSBzZXQuXG5cdCAqXG5cdCAqIEByZXR1cm5zIEVudGl0eSBzZXQgbmFtZVxuXHQgKi9cblx0QHByaXZhdGVFeHRlbnNpb24oKVxuXHRnZXRFbnRpdHlTZXQoKSB7XG5cdFx0cmV0dXJuICh0aGlzLl9vVmlldy5nZXRWaWV3RGF0YSgpIGFzIGFueSkuZW50aXR5U2V0O1xuXHR9XG5cdC8qKlxuXHQgKiBSZW1vdmVzIHNlbnNpdGl2ZSBkYXRhIGZyb20gdGhlIHNlbWFudGljIGF0dHJpYnV0ZSB3aXRoIHJlc3BlY3QgdG8gdGhlIGVudGl0eVNldC5cblx0ICpcblx0ICogQHBhcmFtIG9BdHRyaWJ1dGVzIENvbnRleHQgZGF0YVxuXHQgKiBAcGFyYW0gc01ldGFQYXRoIE1ldGEgcGF0aCB0byByZWFjaCB0aGUgZW50aXR5U2V0IGluIHRoZSBNZXRhTW9kZWxcblx0ICogQHJldHVybnMgQXJyYXkgb2Ygc2VtYW50aWMgQXR0cmlidXRlc1xuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0Ly8gVE8tRE8gYWRkIHVuaXQgdGVzdHMgZm9yIHRoaXMgZnVuY3Rpb24gaW4gdGhlIGNvbnRyb2xsZXIgZXh0ZW5zaW9uIHF1bml0LlxuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0cmVtb3ZlU2Vuc2l0aXZlRGF0YShvQXR0cmlidXRlczogYW55LCBzTWV0YVBhdGg6IHN0cmluZykge1xuXHRcdGlmIChvQXR0cmlidXRlcykge1xuXHRcdFx0Y29uc3QgeyB0cmFuc0FnZ3JlZ2F0aW9ucywgY3VzdG9tQWdncmVnYXRlcyB9ID0gdGhpcy5fZ2V0QWdncmVnYXRlcyhcblx0XHRcdFx0c01ldGFQYXRoLFxuXHRcdFx0XHR0aGlzLmJhc2UuZ2V0VmlldygpLFxuXHRcdFx0XHR0aGlzLmJhc2UuZ2V0QXBwQ29tcG9uZW50KCkuZ2V0RGlhZ25vc3RpY3MoKVxuXHRcdFx0KTtcblx0XHRcdGNvbnN0IGFQcm9wZXJ0aWVzID0gT2JqZWN0LmtleXMob0F0dHJpYnV0ZXMpO1xuXHRcdFx0aWYgKGFQcm9wZXJ0aWVzLmxlbmd0aCkge1xuXHRcdFx0XHRkZWxldGUgb0F0dHJpYnV0ZXNbXCJAb2RhdGEuY29udGV4dFwiXTtcblx0XHRcdFx0ZGVsZXRlIG9BdHRyaWJ1dGVzW1wiQG9kYXRhLm1ldGFkYXRhRXRhZ1wiXTtcblx0XHRcdFx0ZGVsZXRlIG9BdHRyaWJ1dGVzW1wiU0FQX19NZXNzYWdlc1wiXTtcblx0XHRcdFx0Zm9yIChsZXQgaiA9IDA7IGogPCBhUHJvcGVydGllcy5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRcdGlmIChvQXR0cmlidXRlc1thUHJvcGVydGllc1tqXV0gJiYgdHlwZW9mIG9BdHRyaWJ1dGVzW2FQcm9wZXJ0aWVzW2pdXSA9PT0gXCJvYmplY3RcIikge1xuXHRcdFx0XHRcdFx0dGhpcy5yZW1vdmVTZW5zaXRpdmVEYXRhKG9BdHRyaWJ1dGVzW2FQcm9wZXJ0aWVzW2pdXSwgYCR7c01ldGFQYXRofS8ke2FQcm9wZXJ0aWVzW2pdfWApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjb25zdCBzUHJvcCA9IGFQcm9wZXJ0aWVzW2pdO1xuXHRcdFx0XHRcdGlmIChzUHJvcC5pbmRleE9mKFwiQG9kYXRhLnR5cGVcIikgPiAtMSkge1xuXHRcdFx0XHRcdFx0ZGVsZXRlIG9BdHRyaWJ1dGVzW2FQcm9wZXJ0aWVzW2pdXTtcblx0XHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHR0aGlzLl9kZWxldGVBZ2dyZWdhdGVzKFsuLi50cmFuc0FnZ3JlZ2F0aW9ucywgLi4uY3VzdG9tQWdncmVnYXRlc10sIGFQcm9wZXJ0aWVzW2pdLCBvQXR0cmlidXRlcyk7XG5cdFx0XHRcdFx0Y29uc3QgYVByb3BlcnR5QW5ub3RhdGlvbnMgPSB0aGlzLl9nZXRQcm9wZXJ0eUFubm90YXRpb25zKHNQcm9wLCBzTWV0YVBhdGgsIG9BdHRyaWJ1dGVzLCB0aGlzLl9vTWV0YU1vZGVsKTtcblx0XHRcdFx0XHRpZiAoYVByb3BlcnR5QW5ub3RhdGlvbnMpIHtcblx0XHRcdFx0XHRcdGlmIChcblx0XHRcdFx0XHRcdFx0YVByb3BlcnR5QW5ub3RhdGlvbnNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5QZXJzb25hbERhdGEudjEuSXNQb3RlbnRpYWxseVNlbnNpdGl2ZVwiXSB8fFxuXHRcdFx0XHRcdFx0XHRhUHJvcGVydHlBbm5vdGF0aW9uc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkV4Y2x1ZGVGcm9tTmF2aWdhdGlvbkNvbnRleHRcIl0gfHxcblx0XHRcdFx0XHRcdFx0YVByb3BlcnR5QW5ub3RhdGlvbnNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5BbmFseXRpY3MudjEuTWVhc3VyZVwiXVxuXHRcdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHRcdGRlbGV0ZSBvQXR0cmlidXRlc1tzUHJvcF07XG5cdFx0XHRcdFx0XHR9IGVsc2UgaWYgKGFQcm9wZXJ0eUFubm90YXRpb25zW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkZpZWxkQ29udHJvbFwiXSkge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBvRmllbGRDb250cm9sID0gYVByb3BlcnR5QW5ub3RhdGlvbnNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRmllbGRDb250cm9sXCJdO1xuXHRcdFx0XHRcdFx0XHRpZiAob0ZpZWxkQ29udHJvbFtcIiRFbnVtTWVtYmVyXCJdICYmIG9GaWVsZENvbnRyb2xbXCIkRW51bU1lbWJlclwiXS5zcGxpdChcIi9cIilbMV0gPT09IFwiSW5hcHBsaWNhYmxlXCIpIHtcblx0XHRcdFx0XHRcdFx0XHRkZWxldGUgb0F0dHJpYnV0ZXNbc1Byb3BdO1xuXHRcdFx0XHRcdFx0XHR9IGVsc2UgaWYgKFxuXHRcdFx0XHRcdFx0XHRcdG9GaWVsZENvbnRyb2xbXCIkUGF0aFwiXSAmJlxuXHRcdFx0XHRcdFx0XHRcdHRoaXMuX2lzRmllbGRDb250cm9sUGF0aEluYXBwbGljYWJsZShvRmllbGRDb250cm9sW1wiJFBhdGhcIl0sIG9BdHRyaWJ1dGVzKVxuXHRcdFx0XHRcdFx0XHQpIHtcblx0XHRcdFx0XHRcdFx0XHRkZWxldGUgb0F0dHJpYnV0ZXNbc1Byb3BdO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBvQXR0cmlidXRlcztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmUgdGhlIGF0dHJpYnV0ZSBmcm9tIG5hdmlnYXRpb24gZGF0YSBpZiBpdCBpcyBhIG1lYXN1cmUuXG5cdCAqXG5cdCAqIEBwYXJhbSBhZ2dyZWdhdGVzIEFycmF5IG9mIEFnZ3JlZ2F0ZXNcblx0ICogQHBhcmFtIHNQcm9wIEF0dHJpYnV0ZSBuYW1lXG5cdCAqIEBwYXJhbSBvQXR0cmlidXRlcyBTZW1hbnRpY0F0dHJpYnV0ZXNcblx0ICovXG5cdF9kZWxldGVBZ2dyZWdhdGVzKGFnZ3JlZ2F0ZXM6IHN0cmluZ1tdIHwgdW5kZWZpbmVkLCBzUHJvcDogc3RyaW5nLCBvQXR0cmlidXRlczogYW55KSB7XG5cdFx0aWYgKGFnZ3JlZ2F0ZXMgJiYgYWdncmVnYXRlcy5pbmRleE9mKHNQcm9wKSA+IC0xKSB7XG5cdFx0XHRkZWxldGUgb0F0dHJpYnV0ZXNbc1Byb3BdO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBwcm9wZXJ0eSBhbm5vdGF0aW9ucy5cblx0ICpcblx0ICogQHBhcmFtIHNQcm9wXG5cdCAqIEBwYXJhbSBzTWV0YVBhdGhcblx0ICogQHBhcmFtIG9BdHRyaWJ1dGVzXG5cdCAqIEBwYXJhbSBvTWV0YU1vZGVsXG5cdCAqIEByZXR1cm5zIC0gVGhlIHByb3BlcnR5IGFubm90YXRpb25zXG5cdCAqL1xuXHRfZ2V0UHJvcGVydHlBbm5vdGF0aW9ucyhzUHJvcDogc3RyaW5nLCBzTWV0YVBhdGg6IHN0cmluZywgb0F0dHJpYnV0ZXM6IGFueSwgb01ldGFNb2RlbDogT0RhdGFNZXRhTW9kZWwpIHtcblx0XHRpZiAob0F0dHJpYnV0ZXNbc1Byb3BdICYmIHNNZXRhUGF0aCAmJiAhc01ldGFQYXRoLmluY2x1ZGVzKFwidW5kZWZpbmVkXCIpKSB7XG5cdFx0XHRjb25zdCBvQ29udGV4dCA9IG9NZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoYCR7c01ldGFQYXRofS8ke3NQcm9wfWApIGFzIE9EYXRhVjRDb250ZXh0O1xuXHRcdFx0Y29uc3Qgb0Z1bGxDb250ZXh0ID0gTWV0YU1vZGVsQ29udmVydGVyLmdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyhvQ29udGV4dCk7XG5cdFx0XHRyZXR1cm4gb0Z1bGxDb250ZXh0Py50YXJnZXRPYmplY3Q/LmFubm90YXRpb25zPy5fYW5ub3RhdGlvbnM7XG5cdFx0fVxuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGFnZ3JlZ2F0ZXMgcGFydCBvZiB0aGUgRW50aXR5U2V0IG9yIEVudGl0eVR5cGUuXG5cdCAqXG5cdCAqIEBwYXJhbSBzTWV0YVBhdGhcblx0ICogQHBhcmFtIG9WaWV3XG5cdCAqIEBwYXJhbSBvRGlhZ25vc3RpY3Ncblx0ICogQHJldHVybnMgLSBUaGUgYWdncmVnYXRlc1xuXHQgKi9cblx0X2dldEFnZ3JlZ2F0ZXMoc01ldGFQYXRoOiBzdHJpbmcsIG9WaWV3OiBWaWV3LCBvRGlhZ25vc3RpY3M6IERpYWdub3N0aWNzKSB7XG5cdFx0Y29uc3QgY29udmVydGVyQ29udGV4dCA9IHRoaXMuX2dldENvbnZlcnRlckNvbnRleHQoc01ldGFQYXRoLCBvVmlldywgb0RpYWdub3N0aWNzKTtcblx0XHRjb25zdCBhZ2dyZWdhdGlvbkhlbHBlciA9IG5ldyBBZ2dyZWdhdGlvbkhlbHBlcihjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVR5cGUoKSwgY29udmVydGVyQ29udGV4dCk7XG5cdFx0Y29uc3QgaXNBbmFseXRpY3NTdXBwb3J0ZWQgPSBhZ2dyZWdhdGlvbkhlbHBlci5pc0FuYWx5dGljc1N1cHBvcnRlZCgpO1xuXHRcdGxldCB0cmFuc0FnZ3JlZ2F0aW9ucyA9IFtdLFxuXHRcdFx0Y3VzdG9tQWdncmVnYXRlcyA9IFtdO1xuXHRcdGlmIChpc0FuYWx5dGljc1N1cHBvcnRlZCkge1xuXHRcdFx0dHJhbnNBZ2dyZWdhdGlvbnMgPSBhZ2dyZWdhdGlvbkhlbHBlci5nZXRUcmFuc0FnZ3JlZ2F0aW9ucygpO1xuXHRcdFx0aWYgKHRyYW5zQWdncmVnYXRpb25zLmxlbmd0aCkge1xuXHRcdFx0XHR0cmFuc0FnZ3JlZ2F0aW9ucyA9IHRyYW5zQWdncmVnYXRpb25zLm1hcCgodHJhbnNBZ2c6IGFueSkgPT4ge1xuXHRcdFx0XHRcdHJldHVybiB0cmFuc0FnZy5OYW1lIHx8IHRyYW5zQWdnLlZhbHVlO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdGN1c3RvbUFnZ3JlZ2F0ZXMgPSBhZ2dyZWdhdGlvbkhlbHBlci5nZXRDdXN0b21BZ2dyZWdhdGVEZWZpbml0aW9ucygpO1xuXHRcdFx0aWYgKGN1c3RvbUFnZ3JlZ2F0ZXMubGVuZ3RoKSB7XG5cdFx0XHRcdGN1c3RvbUFnZ3JlZ2F0ZXMgPSBjdXN0b21BZ2dyZWdhdGVzLm1hcCgoY3VzdG9tQWdncmVnYXRlOiBhbnkpID0+IHtcblx0XHRcdFx0XHRyZXR1cm4gY3VzdG9tQWdncmVnYXRlLnF1YWxpZmllcjtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiB7IHRyYW5zQWdncmVnYXRpb25zLCBjdXN0b21BZ2dyZWdhdGVzIH07XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyBjb252ZXJ0ZXJDb250ZXh0LlxuXHQgKlxuXHQgKiBAcGFyYW0gc01ldGFQYXRoXG5cdCAqIEBwYXJhbSBvVmlld1xuXHQgKiBAcGFyYW0gb0RpYWdub3N0aWNzXG5cdCAqIEByZXR1cm5zIC0gQ29udmVydGVyQ29udGV4dFxuXHQgKi9cblx0X2dldENvbnZlcnRlckNvbnRleHQoc01ldGFQYXRoOiBzdHJpbmcsIG9WaWV3OiBWaWV3LCBvRGlhZ25vc3RpY3M6IERpYWdub3N0aWNzKSB7XG5cdFx0Y29uc3Qgb1ZpZXdEYXRhOiBhbnkgPSBvVmlldy5nZXRWaWV3RGF0YSgpO1xuXHRcdGxldCBzRW50aXR5U2V0ID0gb1ZpZXdEYXRhLmVudGl0eVNldDtcblx0XHRjb25zdCBzQ29udGV4dFBhdGggPSBvVmlld0RhdGEuY29udGV4dFBhdGg7XG5cdFx0aWYgKHNDb250ZXh0UGF0aCAmJiAoIXNFbnRpdHlTZXQgfHwgc0VudGl0eVNldC5pbmNsdWRlcyhcIi9cIikpKSB7XG5cdFx0XHRzRW50aXR5U2V0ID0gb1ZpZXdEYXRhPy5mdWxsQ29udGV4dFBhdGguc3BsaXQoXCIvXCIpWzFdO1xuXHRcdH1cblx0XHRyZXR1cm4gQ29tbW9uVXRpbHMuZ2V0Q29udmVydGVyQ29udGV4dEZvclBhdGgoXG5cdFx0XHRzTWV0YVBhdGgsXG5cdFx0XHRvVmlldy5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpIGFzIE9EYXRhTWV0YU1vZGVsLFxuXHRcdFx0c0VudGl0eVNldCxcblx0XHRcdG9EaWFnbm9zdGljc1xuXHRcdCk7XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2sgaWYgcGF0aC1iYXNlZCBGaWVsZENvbnRyb2wgZXZhbHVhdGVzIHRvIGluYXBwbGljYWJsZS5cblx0ICpcblx0ICogQHBhcmFtIHNGaWVsZENvbnRyb2xQYXRoIEZpZWxkIGNvbnRyb2wgcGF0aFxuXHQgKiBAcGFyYW0gb0F0dHJpYnV0ZSBTZW1hbnRpY0F0dHJpYnV0ZXNcblx0ICogQHJldHVybnMgYHRydWVgIGlmIGluYXBwbGljYWJsZVxuXHQgKi9cblx0X2lzRmllbGRDb250cm9sUGF0aEluYXBwbGljYWJsZShzRmllbGRDb250cm9sUGF0aDogc3RyaW5nLCBvQXR0cmlidXRlOiBhbnkpIHtcblx0XHRsZXQgYkluYXBwbGljYWJsZSA9IGZhbHNlO1xuXHRcdGNvbnN0IGFQYXJ0cyA9IHNGaWVsZENvbnRyb2xQYXRoLnNwbGl0KFwiL1wiKTtcblx0XHQvLyBzZW5zaXRpdmUgZGF0YSBpcyByZW1vdmVkIG9ubHkgaWYgdGhlIHBhdGggaGFzIGFscmVhZHkgYmVlbiByZXNvbHZlZC5cblx0XHRpZiAoYVBhcnRzLmxlbmd0aCA+IDEpIHtcblx0XHRcdGJJbmFwcGxpY2FibGUgPVxuXHRcdFx0XHRvQXR0cmlidXRlW2FQYXJ0c1swXV0gJiYgb0F0dHJpYnV0ZVthUGFydHNbMF1dLmhhc093blByb3BlcnR5KGFQYXJ0c1sxXSkgJiYgb0F0dHJpYnV0ZVthUGFydHNbMF1dW2FQYXJ0c1sxXV0gPT09IDA7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGJJbmFwcGxpY2FibGUgPSBvQXR0cmlidXRlW3NGaWVsZENvbnRyb2xQYXRoXSA9PT0gMDtcblx0XHR9XG5cdFx0cmV0dXJuIGJJbmFwcGxpY2FibGU7XG5cdH1cblx0LyoqXG5cdCAqIE1ldGhvZCB0byByZXBsYWNlIExvY2FsIFByb3BlcnRpZXMgd2l0aCBTZW1hbnRpYyBPYmplY3QgbWFwcGluZ3MuXG5cdCAqXG5cdCAqIEBwYXJhbSBvU2VsZWN0aW9uVmFyaWFudCBTZWxlY3Rpb25WYXJpYW50IGNvbnNpc3Rpbmcgb2YgZmlsdGVyYmFyLCBUYWJsZSBhbmQgUGFnZSBDb250ZXh0XG5cdCAqIEBwYXJhbSB2TWFwcGluZ3MgQSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2Ygc2VtYW50aWMgb2JqZWN0IG1hcHBpbmdcblx0ICogQHJldHVybnMgLSBNb2RpZmllZCBTZWxlY3Rpb25WYXJpYW50IHdpdGggTG9jYWxQcm9wZXJ0eSByZXBsYWNlZCB3aXRoIFNlbWFudGljT2JqZWN0UHJvcGVydGllcy5cblx0ICovXG5cdF9hcHBseVNlbWFudGljT2JqZWN0TWFwcGluZ3Mob1NlbGVjdGlvblZhcmlhbnQ6IFNlbGVjdGlvblZhcmlhbnQsIHZNYXBwaW5nczogb2JqZWN0IHwgc3RyaW5nKSB7XG5cdFx0Y29uc3Qgb01hcHBpbmdzID0gdHlwZW9mIHZNYXBwaW5ncyA9PT0gXCJzdHJpbmdcIiA/IEpTT04ucGFyc2Uodk1hcHBpbmdzKSA6IHZNYXBwaW5ncztcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IG9NYXBwaW5ncy5sZW5ndGg7IGkrKykge1xuXHRcdFx0Y29uc3Qgc0xvY2FsUHJvcGVydHkgPVxuXHRcdFx0XHQob01hcHBpbmdzW2ldW1wiTG9jYWxQcm9wZXJ0eVwiXSAmJiBvTWFwcGluZ3NbaV1bXCJMb2NhbFByb3BlcnR5XCJdW1wiJFByb3BlcnR5UGF0aFwiXSkgfHxcblx0XHRcdFx0KG9NYXBwaW5nc1tpXVtcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuTG9jYWxQcm9wZXJ0eVwiXSAmJlxuXHRcdFx0XHRcdG9NYXBwaW5nc1tpXVtcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuTG9jYWxQcm9wZXJ0eVwiXVtcIiRQYXRoXCJdKTtcblx0XHRcdGNvbnN0IHNTZW1hbnRpY09iamVjdFByb3BlcnR5ID1cblx0XHRcdFx0b01hcHBpbmdzW2ldW1wiU2VtYW50aWNPYmplY3RQcm9wZXJ0eVwiXSB8fCBvTWFwcGluZ3NbaV1bXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlNlbWFudGljT2JqZWN0UHJvcGVydHlcIl07XG5cdFx0XHRjb25zdCBvU2VsZWN0T3B0aW9uID0gb1NlbGVjdGlvblZhcmlhbnQuZ2V0U2VsZWN0T3B0aW9uKHNMb2NhbFByb3BlcnR5KTtcblx0XHRcdGlmIChvU2VsZWN0T3B0aW9uKSB7XG5cdFx0XHRcdC8vQ3JlYXRlIGEgbmV3IFNlbGVjdE9wdGlvbiB3aXRoIHNTZW1hbnRpY09iamVjdFByb3BlcnR5IGFzIHRoZSBwcm9wZXJ0eSBOYW1lIGFuZCByZW1vdmUgdGhlIG9sZGVyIG9uZVxuXHRcdFx0XHRvU2VsZWN0aW9uVmFyaWFudC5yZW1vdmVTZWxlY3RPcHRpb24oc0xvY2FsUHJvcGVydHkpO1xuXHRcdFx0XHRvU2VsZWN0aW9uVmFyaWFudC5tYXNzQWRkU2VsZWN0T3B0aW9uKHNTZW1hbnRpY09iamVjdFByb3BlcnR5LCBvU2VsZWN0T3B0aW9uKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG9TZWxlY3Rpb25WYXJpYW50O1xuXHR9XG5cdC8qKlxuXHQgKiBOYXZpZ2F0ZXMgdG8gYW4gT3V0Ym91bmQgcHJvdmlkZWQgaW4gdGhlIG1hbmlmZXN0LlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQHBhcmFtIHNPdXRib3VuZCBJZGVudGlmaWVyIHRvIGxvY2F0aW9uIHRoZSBvdXRib3VuZCBpbiB0aGUgbWFuaWZlc3Rcblx0ICogQHBhcmFtIG1OYXZpZ2F0aW9uUGFyYW1ldGVycyBPcHRpb25hbCBtYXAgY29udGFpbmluZyBrZXkvdmFsdWUgcGFpcnMgdG8gYmUgcGFzc2VkIHRvIHRoZSBpbnRlbnRcblx0ICogQGFsaWFzIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkludGVudEJhc2VkTmF2aWdhdGlvbiNuYXZpZ2F0ZU91dGJvdW5kXG5cdCAqIEBzaW5jZSAxLjg2LjBcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRuYXZpZ2F0ZU91dGJvdW5kKHNPdXRib3VuZDogc3RyaW5nLCBtTmF2aWdhdGlvblBhcmFtZXRlcnM6IGFueSkge1xuXHRcdGxldCBhTmF2UGFyYW1zOiBhbnlbXSB8IHVuZGVmaW5lZDtcblx0XHRjb25zdCBvTWFuaWZlc3RFbnRyeSA9IHRoaXMuYmFzZS5nZXRBcHBDb21wb25lbnQoKS5nZXRNYW5pZmVzdEVudHJ5KFwic2FwLmFwcFwiKSxcblx0XHRcdG9PdXRib3VuZCA9IG9NYW5pZmVzdEVudHJ5LmNyb3NzTmF2aWdhdGlvbj8ub3V0Ym91bmRzPy5bc091dGJvdW5kXTtcblx0XHRpZiAoIW9PdXRib3VuZCkge1xuXHRcdFx0TG9nLmVycm9yKFwiT3V0Ym91bmQgaXMgbm90IGRlZmluZWQgaW4gbWFuaWZlc3QhIVwiKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Y29uc3Qgc1NlbWFudGljT2JqZWN0ID0gb091dGJvdW5kLnNlbWFudGljT2JqZWN0LFxuXHRcdFx0c0FjdGlvbiA9IG9PdXRib3VuZC5hY3Rpb24sXG5cdFx0XHRvdXRib3VuZFBhcmFtcyA9IG9PdXRib3VuZC5wYXJhbWV0ZXJzICYmIHRoaXMuZ2V0T3V0Ym91bmRQYXJhbXMob091dGJvdW5kLnBhcmFtZXRlcnMpO1xuXG5cdFx0aWYgKG1OYXZpZ2F0aW9uUGFyYW1ldGVycykge1xuXHRcdFx0YU5hdlBhcmFtcyA9IFtdO1xuXHRcdFx0T2JqZWN0LmtleXMobU5hdmlnYXRpb25QYXJhbWV0ZXJzKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXk6IHN0cmluZykge1xuXHRcdFx0XHRsZXQgb1BhcmFtczogYW55O1xuXHRcdFx0XHRpZiAoQXJyYXkuaXNBcnJheShtTmF2aWdhdGlvblBhcmFtZXRlcnNba2V5XSkpIHtcblx0XHRcdFx0XHRjb25zdCBhVmFsdWVzID0gbU5hdmlnYXRpb25QYXJhbWV0ZXJzW2tleV07XG5cdFx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhVmFsdWVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHRvUGFyYW1zID0ge307XG5cdFx0XHRcdFx0XHRvUGFyYW1zW2tleV0gPSBhVmFsdWVzW2ldO1xuXHRcdFx0XHRcdFx0YU5hdlBhcmFtcz8ucHVzaChvUGFyYW1zKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0b1BhcmFtcyA9IHt9O1xuXHRcdFx0XHRcdG9QYXJhbXNba2V5XSA9IG1OYXZpZ2F0aW9uUGFyYW1ldGVyc1trZXldO1xuXHRcdFx0XHRcdGFOYXZQYXJhbXM/LnB1c2gob1BhcmFtcyk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0XHRpZiAoYU5hdlBhcmFtcyB8fCBvdXRib3VuZFBhcmFtcykge1xuXHRcdFx0bU5hdmlnYXRpb25QYXJhbWV0ZXJzID0ge1xuXHRcdFx0XHRuYXZpZ2F0aW9uQ29udGV4dHM6IHtcblx0XHRcdFx0XHRkYXRhOiBhTmF2UGFyYW1zIHx8IG91dGJvdW5kUGFyYW1zXG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0fVxuXHRcdHRoaXMuYmFzZS5faW50ZW50QmFzZWROYXZpZ2F0aW9uLm5hdmlnYXRlKHNTZW1hbnRpY09iamVjdCwgc0FjdGlvbiwgbU5hdmlnYXRpb25QYXJhbWV0ZXJzKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gYXBwbHkgb3V0Ym91bmQgcGFyYW1ldGVycyBkZWZpbmVkIGluIHRoZSBtYW5pZmVzdC5cblx0ICpcblx0ICogQHBhcmFtIG9TZWxlY3Rpb25WYXJpYW50IFNlbGVjdGlvblZhcmlhbnQgY29uc2lzdGluZyBvZiBhIGZpbHRlciBiYXIsIGEgdGFibGUsIGFuZCBhIHBhZ2UgY29udGV4dFxuXHQgKiBAcGFyYW0gdk91dGJvdW5kUGFyYW1zIE91dGJvdW5kIFByb3BlcnRpZXMgZGVmaW5lZCBpbiB0aGUgbWFuaWZlc3Rcblx0ICogQHJldHVybnMgLSBUaGUgbW9kaWZpZWQgU2VsZWN0aW9uVmFyaWFudCB3aXRoIG91dGJvdW5kIHBhcmFtZXRlcnMuXG5cdCAqL1xuXHRfYXBwbHlPdXRib3VuZFBhcmFtcyhvU2VsZWN0aW9uVmFyaWFudDogU2VsZWN0aW9uVmFyaWFudCwgdk91dGJvdW5kUGFyYW1zOiBhbnkpIHtcblx0XHRjb25zdCBhUGFyYW1ldGVycyA9IE9iamVjdC5rZXlzKHZPdXRib3VuZFBhcmFtcyk7XG5cdFx0Y29uc3QgYVNlbGVjdFByb3BlcnRpZXMgPSBvU2VsZWN0aW9uVmFyaWFudC5nZXRTZWxlY3RPcHRpb25zUHJvcGVydHlOYW1lcygpO1xuXHRcdGFQYXJhbWV0ZXJzLmZvckVhY2goZnVuY3Rpb24gKGtleTogc3RyaW5nKSB7XG5cdFx0XHRpZiAoIWFTZWxlY3RQcm9wZXJ0aWVzLmluY2x1ZGVzKGtleSkpIHtcblx0XHRcdFx0b1NlbGVjdGlvblZhcmlhbnQuYWRkU2VsZWN0T3B0aW9uKGtleSwgXCJJXCIsIFwiRVFcIiwgdk91dGJvdW5kUGFyYW1zW2tleV0pO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHJldHVybiBvU2VsZWN0aW9uVmFyaWFudDtcblx0fVxuXHQvKipcblx0ICogTWV0aG9kIHRvIGdldCB0aGUgb3V0Ym91bmQgcGFyYW1ldGVycyBkZWZpbmVkIGluIHRoZSBtYW5pZmVzdC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBwYXJhbSBvT3V0Ym91bmRQYXJhbXMgUGFyYW1ldGVycyBkZWZpbmVkIGluIHRoZSBvdXRib3VuZHMuIE9ubHkgXCJwbGFpblwiIGlzIHN1cHBvcnRlZFxuXHQgKiBAcmV0dXJucyBQYXJhbWV0ZXJzIHdpdGggdGhlIGtleS1WYWx1ZSBwYWlyXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0Z2V0T3V0Ym91bmRQYXJhbXMob091dGJvdW5kUGFyYW1zOiBhbnkpIHtcblx0XHRjb25zdCBvUGFyYW1zTWFwcGluZzogYW55ID0ge307XG5cdFx0aWYgKG9PdXRib3VuZFBhcmFtcykge1xuXHRcdFx0Y29uc3QgYVBhcmFtZXRlcnMgPSBPYmplY3Qua2V5cyhvT3V0Ym91bmRQYXJhbXMpIHx8IFtdO1xuXHRcdFx0aWYgKGFQYXJhbWV0ZXJzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0YVBhcmFtZXRlcnMuZm9yRWFjaChmdW5jdGlvbiAoa2V5OiBzdHJpbmcpIHtcblx0XHRcdFx0XHRjb25zdCBvTWFwcGluZyA9IG9PdXRib3VuZFBhcmFtc1trZXldO1xuXHRcdFx0XHRcdGlmIChvTWFwcGluZy52YWx1ZSAmJiBvTWFwcGluZy52YWx1ZS52YWx1ZSAmJiBvTWFwcGluZy52YWx1ZS5mb3JtYXQgPT09IFwicGxhaW5cIikge1xuXHRcdFx0XHRcdFx0aWYgKCFvUGFyYW1zTWFwcGluZ1trZXldKSB7XG5cdFx0XHRcdFx0XHRcdG9QYXJhbXNNYXBwaW5nW2tleV0gPSBvTWFwcGluZy52YWx1ZS52YWx1ZTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gb1BhcmFtc01hcHBpbmc7XG5cdH1cblxuXHQvKipcblx0ICogVHJpZ2dlcnMgYW4gb3V0Ym91bmQgbmF2aWdhdGlvbiB3aGVuIGEgdXNlciBjaG9vc2VzIHRoZSBjaGV2cm9uLlxuXHQgKlxuXHQgKiBAcGFyYW0ge29iamVjdH0gb0NvbnRyb2xsZXJcblx0ICogQHBhcmFtIHtzdHJpbmd9IHNPdXRib3VuZFRhcmdldCBOYW1lIG9mIHRoZSBvdXRib3VuZCB0YXJnZXQgKG5lZWRzIHRvIGJlIGRlZmluZWQgaW4gdGhlIG1hbmlmZXN0KVxuXHQgKiBAcGFyYW0ge3NhcC51aS5tb2RlbC5vZGF0YS52NC5Db250ZXh0fSBvQ29udGV4dCBUaGUgY29udGV4dCB0aGF0IGNvbnRhaW5zIHRoZSBkYXRhIGZvciB0aGUgdGFyZ2V0IGFwcFxuXHQgKiBAcGFyYW0ge3N0cmluZ30gc0NyZWF0ZVBhdGggQ3JlYXRlIHBhdGggd2hlbiB0aGUgY2hldnJvbiBpcyBjcmVhdGVkLlxuXHQgKiBAcmV0dXJucyB7UHJvbWlzZX0gUHJvbWlzZSB3aGljaCBpcyByZXNvbHZlZCBvbmNlIHRoZSBuYXZpZ2F0aW9uIGlzIHRyaWdnZXJlZFxuXHQgKi9cblxuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0b25DaGV2cm9uUHJlc3NOYXZpZ2F0ZU91dEJvdW5kKG9Db250cm9sbGVyOiBQYWdlQ29udHJvbGxlciwgc091dGJvdW5kVGFyZ2V0OiBzdHJpbmcsIG9Db250ZXh0OiBhbnksIHNDcmVhdGVQYXRoOiBzdHJpbmcpIHtcblx0XHRjb25zdCBvT3V0Ym91bmRzID0gKG9Db250cm9sbGVyLmdldEFwcENvbXBvbmVudCgpIGFzIGFueSkuZ2V0Um91dGluZ1NlcnZpY2UoKS5nZXRPdXRib3VuZHMoKTtcblx0XHRjb25zdCBvRGlzcGxheU91dGJvdW5kID0gb091dGJvdW5kc1tzT3V0Ym91bmRUYXJnZXRdO1xuXHRcdGxldCBhZGRpdGlvbmFsTmF2aWdhdGlvblBhcmFtZXRlcnM7XG5cdFx0aWYgKG9EaXNwbGF5T3V0Ym91bmQgJiYgb0Rpc3BsYXlPdXRib3VuZC5zZW1hbnRpY09iamVjdCAmJiBvRGlzcGxheU91dGJvdW5kLmFjdGlvbikge1xuXHRcdFx0Y29uc3Qgb1JlZnJlc2hTdHJhdGVnaWVzOiBhbnkgPSB7XG5cdFx0XHRcdGludGVudHM6IHt9XG5cdFx0XHR9O1xuXHRcdFx0Y29uc3Qgb0RlZmF1bHRSZWZyZXNoU3RyYXRlZ3k6IGFueSA9IHt9O1xuXHRcdFx0bGV0IHNNZXRhUGF0aDtcblxuXHRcdFx0aWYgKG9Db250ZXh0KSB7XG5cdFx0XHRcdGlmIChvQ29udGV4dC5pc0EgJiYgb0NvbnRleHQuaXNBKFwic2FwLnVpLm1vZGVsLm9kYXRhLnY0LkNvbnRleHRcIikpIHtcblx0XHRcdFx0XHRzTWV0YVBhdGggPSBNb2RlbEhlbHBlci5nZXRNZXRhUGF0aEZvckNvbnRleHQob0NvbnRleHQpO1xuXHRcdFx0XHRcdG9Db250ZXh0ID0gW29Db250ZXh0XTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRzTWV0YVBhdGggPSBNb2RlbEhlbHBlci5nZXRNZXRhUGF0aEZvckNvbnRleHQob0NvbnRleHRbMF0pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdG9EZWZhdWx0UmVmcmVzaFN0cmF0ZWd5W3NNZXRhUGF0aF0gPSBcInNlbGZcIjtcblx0XHRcdFx0b1JlZnJlc2hTdHJhdGVnaWVzW1wiX2ZlRGVmYXVsdFwiXSA9IG9EZWZhdWx0UmVmcmVzaFN0cmF0ZWd5O1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoc0NyZWF0ZVBhdGgpIHtcblx0XHRcdFx0Y29uc3Qgc0tleSA9IGAke29EaXNwbGF5T3V0Ym91bmQuc2VtYW50aWNPYmplY3R9LSR7b0Rpc3BsYXlPdXRib3VuZC5hY3Rpb259YDtcblx0XHRcdFx0b1JlZnJlc2hTdHJhdGVnaWVzLmludGVudHNbc0tleV0gPSB7fTtcblx0XHRcdFx0b1JlZnJlc2hTdHJhdGVnaWVzLmludGVudHNbc0tleV1bc0NyZWF0ZVBhdGhdID0gXCJzZWxmXCI7XG5cdFx0XHR9XG5cdFx0XHRpZiAob0Rpc3BsYXlPdXRib3VuZCAmJiBvRGlzcGxheU91dGJvdW5kLnBhcmFtZXRlcnMpIHtcblx0XHRcdFx0Y29uc3Qgb1BhcmFtcyA9IG9EaXNwbGF5T3V0Ym91bmQucGFyYW1ldGVycyAmJiB0aGlzLmdldE91dGJvdW5kUGFyYW1zKG9EaXNwbGF5T3V0Ym91bmQucGFyYW1ldGVycyk7XG5cdFx0XHRcdGlmIChPYmplY3Qua2V5cyhvUGFyYW1zKS5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0YWRkaXRpb25hbE5hdmlnYXRpb25QYXJhbWV0ZXJzID0gb1BhcmFtcztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRvQ29udHJvbGxlci5faW50ZW50QmFzZWROYXZpZ2F0aW9uLm5hdmlnYXRlKG9EaXNwbGF5T3V0Ym91bmQuc2VtYW50aWNPYmplY3QsIG9EaXNwbGF5T3V0Ym91bmQuYWN0aW9uLCB7XG5cdFx0XHRcdG5hdmlnYXRpb25Db250ZXh0czogb0NvbnRleHQsXG5cdFx0XHRcdHJlZnJlc2hTdHJhdGVnaWVzOiBvUmVmcmVzaFN0cmF0ZWdpZXMsXG5cdFx0XHRcdGFkZGl0aW9uYWxOYXZpZ2F0aW9uUGFyYW1ldGVyczogYWRkaXRpb25hbE5hdmlnYXRpb25QYXJhbWV0ZXJzXG5cdFx0XHR9KTtcblxuXHRcdFx0Ly9UT0RPOiBjaGVjayB3aHkgcmV0dXJuaW5nIGEgcHJvbWlzZSBpcyByZXF1aXJlZFxuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoYG91dGJvdW5kIHRhcmdldCAke3NPdXRib3VuZFRhcmdldH0gbm90IGZvdW5kIGluIGNyb3NzIG5hdmlnYXRpb24gZGVmaW5pdGlvbiBvZiBtYW5pZmVzdGApO1xuXHRcdH1cblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBJbnRlcm5hbEludGVudEJhc2VkTmF2aWdhdGlvbjtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7O0VBa0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFQQSxJQVNNQSw2QkFBNkIsV0FEbENDLGNBQWMsQ0FBQyxrRUFBa0UsQ0FBQyxVQU9qRkMsY0FBYyxFQUFFLFVBa0NoQkMsZUFBZSxFQUFFLFVBQ2pCQyxjQUFjLEVBQUUsVUErSmhCRCxlQUFlLEVBQUUsVUFDakJDLGNBQWMsRUFBRSxVQW1IaEJELGVBQWUsRUFBRSxVQUNqQkMsY0FBYyxFQUFFLFVBMEZoQkQsZUFBZSxFQUFFLFdBQ2pCRSxVQUFVLENBQUNDLGlCQUFpQixDQUFDQyxPQUFPLENBQUMsV0E0QnJDSixlQUFlLEVBQUUsV0FDakJDLGNBQWMsRUFBRSxXQXVGaEJJLGdCQUFnQixFQUFFLFdBYWxCTCxlQUFlLEVBQUUsV0FDakJDLGNBQWMsRUFBRSxXQTJMaEJELGVBQWUsRUFBRSxXQUNqQkMsY0FBYyxFQUFFLFdBaUVoQkQsZUFBZSxFQUFFLFdBQ2pCQyxjQUFjLEVBQUUsV0E2QmhCRCxlQUFlLEVBQUUsV0FDakJDLGNBQWMsRUFBRTtJQUFBO0lBQUE7TUFBQTtJQUFBO0lBQUE7SUFBQSxPQS95QmpCSyxNQUFNLEdBRE4sa0JBQ1M7TUFDUixJQUFJLENBQUNDLGNBQWMsR0FBRyxJQUFJLENBQUNDLElBQUksQ0FBQ0MsZUFBZSxFQUFFO01BQ2pELElBQUksQ0FBQ0MsV0FBVyxHQUFHLElBQUksQ0FBQ0gsY0FBYyxDQUFDSSxRQUFRLEVBQUUsQ0FBQ0MsWUFBWSxFQUFvQjtNQUNsRixJQUFJLENBQUNDLG1CQUFtQixHQUFHLElBQUksQ0FBQ04sY0FBYyxDQUFDTyxvQkFBb0IsRUFBRTtNQUNyRSxJQUFJLENBQUNDLE1BQU0sR0FBRyxJQUFJLENBQUNQLElBQUksQ0FBQ1EsT0FBTyxFQUFFO0lBQ2xDOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0F6QkM7SUFBQSxPQTRCQUMsUUFBUSxHQUZSLGtCQUdDQyxlQUF1QixFQUN2QkMsT0FBZSxFQUNmQyxxQkFRWSxFQUNYO01BQ0QsTUFBTUMsV0FBVyxHQUFJQyxRQUFjLElBQUs7UUFDdkMsTUFBTUMsbUJBQW1CLEdBQUdILHFCQUFxQixJQUFJQSxxQkFBcUIsQ0FBQ0ksa0JBQWtCO1VBQzVGQyxtQkFBbUIsR0FDbEJGLG1CQUFtQixJQUFJLENBQUNHLEtBQUssQ0FBQ0MsT0FBTyxDQUFDSixtQkFBbUIsQ0FBQyxHQUFHLENBQUNBLG1CQUFtQixDQUFDLEdBQUdBLG1CQUFtQjtVQUN6R0ssc0JBQXNCLEdBQUdSLHFCQUFxQixJQUFJQSxxQkFBcUIsQ0FBQ1MscUJBQXFCO1VBQzdGQyxlQUFlLEdBQUdWLHFCQUFxQixJQUFJQSxxQkFBcUIsQ0FBQ1csOEJBQThCO1VBQy9GQyxXQUFnQixHQUFHO1lBQ2xCQyxjQUFjLEVBQUVmLGVBQWU7WUFDL0JnQixNQUFNLEVBQUVmO1VBQ1QsQ0FBQztVQUNEZ0IsS0FBSyxHQUFHLElBQUksQ0FBQzNCLElBQUksQ0FBQ1EsT0FBTyxFQUFFO1VBQzNCb0IsV0FBVyxHQUFHRCxLQUFLLENBQUNFLGFBQWEsRUFBb0I7UUFFdEQsSUFBSWYsUUFBUSxFQUFFO1VBQ2IsSUFBSSxDQUFDUCxNQUFNLENBQUN1QixpQkFBaUIsQ0FBQ2hCLFFBQVEsQ0FBQztRQUN4QztRQUVBLElBQUlKLGVBQWUsSUFBSUMsT0FBTyxFQUFFO1VBQy9CLElBQUlvQixtQkFBMEIsR0FBRyxFQUFFO1lBQ2xDQyxpQkFBc0IsR0FBRyxJQUFJQyxnQkFBZ0IsRUFBRTtVQUNoRDtVQUNBLElBQUloQixtQkFBbUIsSUFBSUEsbUJBQW1CLENBQUNpQixNQUFNLEVBQUU7WUFDdERqQixtQkFBbUIsQ0FBQ2tCLE9BQU8sQ0FBRUMsa0JBQXVCLElBQUs7Y0FDeEQ7Y0FDQTtjQUNBLElBQUlBLGtCQUFrQixDQUFDQyxHQUFHLElBQUlELGtCQUFrQixDQUFDQyxHQUFHLENBQUMsK0JBQStCLENBQUMsRUFBRTtnQkFDdEY7Z0JBQ0EsSUFBSUMsbUJBQW1CLEdBQUdGLGtCQUFrQixDQUFDRyxTQUFTLEVBQUU7Z0JBQ3hELE1BQU1DLFNBQVMsR0FBRyxJQUFJLENBQUN0QyxXQUFXLENBQUN1QyxXQUFXLENBQUNMLGtCQUFrQixDQUFDTSxPQUFPLEVBQUUsQ0FBQztnQkFDNUU7Z0JBQ0FKLG1CQUFtQixHQUFHLElBQUksQ0FBQ0ssbUJBQW1CLENBQUNMLG1CQUFtQixFQUFFRSxTQUFTLENBQUM7Z0JBQzlFLE1BQU1JLFdBQVcsR0FBRyxJQUFJLENBQUNDLG1DQUFtQyxDQUFDUCxtQkFBbUIsRUFBRUYsa0JBQWtCLENBQUM7Z0JBQ3JHWixXQUFXLENBQUMsMkJBQTJCLENBQUMsR0FBR29CLFdBQVcsQ0FBQ0UseUJBQXlCO2dCQUNoRmYsbUJBQW1CLENBQUNnQixJQUFJLENBQUNILFdBQVcsQ0FBQ0ksa0JBQWtCLENBQUM7Y0FDekQsQ0FBQyxNQUFNLElBQ04sRUFBRVosa0JBQWtCLElBQUlsQixLQUFLLENBQUNDLE9BQU8sQ0FBQ2lCLGtCQUFrQixDQUFDYSxJQUFJLENBQUMsQ0FBQyxJQUMvRCxPQUFPYixrQkFBa0IsS0FBSyxRQUFRLEVBQ3JDO2dCQUNEO2dCQUNBTCxtQkFBbUIsQ0FBQ2dCLElBQUksQ0FBQyxJQUFJLENBQUNKLG1CQUFtQixDQUFDUCxrQkFBa0IsQ0FBQ2EsSUFBSSxFQUFFYixrQkFBa0IsQ0FBQ2MsUUFBUSxDQUFDLENBQUM7Y0FDekcsQ0FBQyxNQUFNLElBQUlkLGtCQUFrQixJQUFJbEIsS0FBSyxDQUFDQyxPQUFPLENBQUNpQixrQkFBa0IsQ0FBQ2EsSUFBSSxDQUFDLEVBQUU7Z0JBQ3hFO2dCQUNBO2dCQUNBbEIsbUJBQW1CLEdBQUcsSUFBSSxDQUFDWSxtQkFBbUIsQ0FBQ1Asa0JBQWtCLENBQUNhLElBQUksRUFBRWIsa0JBQWtCLENBQUNjLFFBQVEsQ0FBQztjQUNyRztZQUNELENBQUMsQ0FBQztVQUNIO1VBQ0E7VUFDQSxJQUFJbkIsbUJBQW1CLElBQUlBLG1CQUFtQixDQUFDRyxNQUFNLEVBQUU7WUFDdERGLGlCQUFpQixHQUFHLElBQUksQ0FBQzNCLG1CQUFtQixDQUFDOEMsZ0NBQWdDLENBQzVFcEIsbUJBQW1CLEVBQ25CQyxpQkFBaUIsQ0FBQ29CLFlBQVksRUFBRSxDQUNoQztVQUNGOztVQUVBO1VBQ0EsTUFBTUMsTUFBTSxHQUFHLElBQUksQ0FBQzlDLE1BQU0sQ0FBQ0osUUFBUSxFQUFFO1lBQ3BDbUQsVUFBVSxHQUFHLElBQUksQ0FBQ0MsWUFBWSxFQUFFO1lBQ2hDQyxXQUFXLEdBQUdGLFVBQVUsR0FBRyxJQUFJLENBQUNqRCxtQkFBbUIsQ0FBQ29ELG1CQUFtQixDQUFDSCxVQUFVLEVBQUVELE1BQU0sQ0FBQyxHQUFHSyxTQUFTO1VBQ3hHLElBQUlGLFdBQVcsRUFBRTtZQUNoQnhCLGlCQUFpQixDQUFDMkIsbUJBQW1CLENBQUNILFdBQVcsQ0FBQztVQUNuRDs7VUFFQTtVQUNBLElBQUlsQyxlQUFlLEVBQUU7WUFDcEIsSUFBSSxDQUFDc0Msb0JBQW9CLENBQUM1QixpQkFBaUIsRUFBRVYsZUFBZSxDQUFDO1VBQzlEOztVQUVBO1VBQ0FNLFdBQVcsQ0FBQ2lDLHFCQUFxQixDQUFDQyxzQkFBc0IsQ0FBQzlCLGlCQUFpQixFQUFFUixXQUFXLENBQUM7O1VBRXhGO1VBQ0EsSUFBSUosc0JBQXNCLEVBQUU7WUFDM0IsSUFBSSxDQUFDMkMsNEJBQTRCLENBQUMvQixpQkFBaUIsRUFBRVosc0JBQXNCLENBQUM7VUFDN0U7O1VBRUE7VUFDQSxJQUFJLENBQUM0QywwQkFBMEIsQ0FBQ2hDLGlCQUFpQixDQUFDOztVQUVsRDtVQUNBLE1BQU1pQyxRQUFRLEdBQUdyQyxXQUFXLENBQUNzQyxzQkFBc0IsQ0FBQ0MsaUJBQWlCLEVBQUU7O1VBRXZFO1VBQ0EsTUFBTUMsa0JBQWtCLEdBQUl4RCxxQkFBcUIsSUFBSUEscUJBQXFCLENBQUN5RCxpQkFBaUIsSUFBSyxDQUFDLENBQUM7WUFDbEdDLGNBQWMsR0FBRzNDLEtBQUssQ0FBQ3hCLFFBQVEsQ0FBQyxVQUFVLENBQWM7VUFDekQsSUFBSW1FLGNBQWMsRUFBRTtZQUNuQixJQUFJLENBQUMzQyxLQUFLLElBQUtBLEtBQUssQ0FBQzRDLFdBQVcsRUFBVSxFQUFFQywyQkFBMkIsRUFBRTtjQUN4RSxNQUFNQyxzQkFBc0IsR0FBSTlDLEtBQUssQ0FBQzRDLFdBQVcsRUFBRSxDQUFTQywyQkFBMkIsSUFBSSxDQUFDLENBQUM7Y0FDN0ZFLFlBQVksQ0FBQ04sa0JBQWtCLEVBQUVLLHNCQUFzQixDQUFDO1lBQ3pEO1lBQ0EsTUFBTUUsZ0JBQWdCLEdBQUdDLGVBQWUsQ0FBQ0MsMkJBQTJCLENBQUNULGtCQUFrQixFQUFFMUQsZUFBZSxFQUFFQyxPQUFPLENBQUM7WUFDbEgsSUFBSWdFLGdCQUFnQixFQUFFO2NBQ3JCTCxjQUFjLENBQUNRLFdBQVcsQ0FBQyw4QkFBOEIsRUFBRUgsZ0JBQWdCLENBQUM7WUFDN0U7VUFDRDs7VUFFQTtVQUNBLE1BQU1JLE9BQU8sR0FBRyxZQUFZO1lBQzNCQyxHQUFHLENBQUNDLEVBQUUsQ0FBQ0MsT0FBTyxDQUFDLENBQUMsa0JBQWtCLENBQUMsRUFBRSxVQUFVQyxVQUFlLEVBQUU7Y0FDL0QsTUFBTUMsZUFBZSxHQUFHQyxJQUFJLENBQUNDLHdCQUF3QixDQUFDLGFBQWEsQ0FBQztjQUNwRUgsVUFBVSxDQUFDSSxLQUFLLENBQUNILGVBQWUsQ0FBQ0ksT0FBTyxDQUFDLDBDQUEwQyxDQUFDLEVBQUU7Z0JBQ3JGQyxLQUFLLEVBQUVMLGVBQWUsQ0FBQ0ksT0FBTyxDQUFDLHNCQUFzQjtjQUN0RCxDQUFDLENBQUM7WUFDSCxDQUFDLENBQUM7VUFDSCxDQUFDO1VBQ0QsSUFBSSxDQUFDbkYsbUJBQW1CLENBQUNJLFFBQVEsQ0FDaENDLGVBQWUsRUFDZkMsT0FBTyxFQUNQcUIsaUJBQWlCLENBQUNvQixZQUFZLEVBQUUsRUFDaENNLFNBQVMsRUFDVHFCLE9BQU8sRUFDUHJCLFNBQVMsRUFDVE8sUUFBUSxDQUNSO1FBQ0YsQ0FBQyxNQUFNO1VBQ04sTUFBTSxJQUFJeUIsS0FBSyxDQUFDLHdDQUF3QyxDQUFDO1FBQzFEO01BQ0QsQ0FBQztNQUNELE1BQU1DLGVBQWUsR0FBRyxJQUFJLENBQUMzRixJQUFJLENBQUNRLE9BQU8sRUFBRSxDQUFDb0YsaUJBQWlCLEVBQUU7TUFDL0QsTUFBTUMsVUFBVSxHQUFHRixlQUFlLElBQUtBLGVBQWUsQ0FBQ3hGLFFBQVEsRUFBRSxDQUFDQyxZQUFZLEVBQXFCO01BQ25HLElBQ0UsSUFBSSxDQUFDSSxPQUFPLEVBQUUsQ0FBQytELFdBQVcsRUFBRSxDQUFTdUIsYUFBYSxLQUFLLFlBQVksSUFDcEVELFVBQVUsSUFDVixDQUFDRSxXQUFXLENBQUNDLHdCQUF3QixDQUFDSCxVQUFVLENBQUMsRUFDaEQ7UUFDREksS0FBSyxDQUFDQyx5Q0FBeUMsQ0FDOUNyRixXQUFXLENBQUNzRixJQUFJLENBQUMsSUFBSSxDQUFDLEVBQ3RCQyxRQUFRLENBQUNDLFNBQVMsRUFDbEIsSUFBSSxDQUFDckcsSUFBSSxDQUFDUSxPQUFPLEVBQUUsQ0FBQ29GLGlCQUFpQixFQUFFLEVBQ3ZDLElBQUksQ0FBQzVGLElBQUksQ0FBQ1EsT0FBTyxFQUFFLENBQUNxQixhQUFhLEVBQUUsRUFDbkMsSUFBSSxFQUNKb0UsS0FBSyxDQUFDSyxjQUFjLENBQUNDLGlCQUFpQixDQUN0QztNQUNGLENBQUMsTUFBTTtRQUNOMUYsV0FBVyxFQUFFO01BQ2Q7SUFDRDs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQU5DO0lBQUEsT0FTQWdDLG1DQUFtQyxHQUZuQyw2Q0FFb0NQLG1CQUF3QixFQUFFeEIsUUFBaUIsRUFBRTtNQUNoRjtNQUNBO01BQ0EsTUFBTTBGLGFBQWtCLEdBQUcsQ0FBQyxDQUFDO1FBQzVCQyxZQUFZLEdBQUczRixRQUFRLENBQUM0QixPQUFPLEVBQUU7UUFDakNtRCxVQUFVLEdBQUcvRSxRQUFRLENBQUNYLFFBQVEsRUFBRSxDQUFDQyxZQUFZLEVBQW9CO1FBQ2pFb0MsU0FBUyxHQUFHcUQsVUFBVSxDQUFDcEQsV0FBVyxDQUFDZ0UsWUFBWSxDQUFDO1FBQ2hEQyxjQUFjLEdBQUdsRSxTQUFTLENBQUNtRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUNDLE1BQU0sQ0FBQ0MsT0FBTyxDQUFDO01BRXRELFNBQVNDLHlCQUF5QixDQUFDQyxZQUFpQixFQUFFQyxxQkFBMEIsRUFBRTtRQUNqRixLQUFLLE1BQU1DLElBQUksSUFBSUYsWUFBWSxFQUFFO1VBQ2hDO1VBQ0EsSUFBSUEsWUFBWSxDQUFDRSxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksT0FBT0YsWUFBWSxDQUFDRSxJQUFJLENBQUMsS0FBSyxRQUFRLEVBQUU7WUFDMUUsSUFBSSxDQUFDVCxhQUFhLENBQUNTLElBQUksQ0FBQyxFQUFFO2NBQ3pCO2NBQ0FULGFBQWEsQ0FBQ1MsSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUN6QjtZQUNBO1lBQ0FULGFBQWEsQ0FBQ1MsSUFBSSxDQUFDLENBQUNsRSxJQUFJLENBQUNpRSxxQkFBcUIsQ0FBQztVQUNoRCxDQUFDLE1BQU07WUFDTjtZQUNBLE1BQU1FLGdCQUFnQixHQUFHSCxZQUFZLENBQUNFLElBQUksQ0FBQztZQUMzQ0gseUJBQXlCLENBQUNJLGdCQUFnQixFQUFHLEdBQUVGLHFCQUFzQixJQUFHQyxJQUFLLEVBQUMsQ0FBQztVQUNoRjtRQUNEO01BQ0Q7TUFFQUgseUJBQXlCLENBQUN4RSxtQkFBbUIsRUFBRUUsU0FBUyxDQUFDOztNQUV6RDtNQUNBLE1BQU0yRSxrQkFBa0IsR0FBR1QsY0FBYyxDQUFDLENBQUMsQ0FBQztRQUMzQ1UsbUJBQW1CLEdBQUd2QixVQUFVLENBQUN0RCxTQUFTLENBQUUsSUFBRzRFLGtCQUFtQixjQUFhLENBQUM7UUFDaEZFLDBCQUErQixHQUFHLENBQUMsQ0FBQztNQUNyQyxJQUFJQyxvQkFBb0IsRUFBRUMsaUJBQWlCLEVBQUVDLGNBQWM7TUFDM0QsS0FBSyxNQUFNQyxZQUFZLElBQUlqQixhQUFhLEVBQUU7UUFDekMsTUFBTWtCLGlCQUFpQixHQUFHbEIsYUFBYSxDQUFDaUIsWUFBWSxDQUFDO1FBQ3JELElBQUlFLGdCQUFnQjtRQUNwQjs7UUFFQTtRQUNBO1FBQ0E7UUFDQSxJQUFJRCxpQkFBaUIsQ0FBQ3hGLE1BQU0sR0FBRyxDQUFDLEVBQUU7VUFDakM7VUFDQSxLQUFLLElBQUkwRixDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLElBQUlGLGlCQUFpQixDQUFDeEYsTUFBTSxHQUFHLENBQUMsRUFBRTBGLENBQUMsRUFBRSxFQUFFO1lBQ3ZELE1BQU1DLEtBQUssR0FBR0gsaUJBQWlCLENBQUNFLENBQUMsQ0FBQztZQUNsQyxJQUFJRSxjQUFjLEdBQUdELEtBQUssQ0FBQ0UsT0FBTyxDQUFDRixLQUFLLEtBQUtyRixTQUFTLEdBQUdBLFNBQVMsR0FBSSxHQUFFQSxTQUFVLEdBQUUsRUFBRSxFQUFFLENBQUM7WUFDekZzRixjQUFjLEdBQUcsQ0FBQ0EsY0FBYyxLQUFLLEVBQUUsR0FBR0EsY0FBYyxHQUFJLEdBQUVBLGNBQWUsR0FBRSxJQUFJTCxZQUFZO1lBQy9GLE1BQU1PLGVBQWUsR0FBR25DLFVBQVUsQ0FBQ3RELFNBQVMsQ0FBRSxHQUFFc0YsS0FBTSxjQUFhLENBQUM7WUFDcEU7O1lBRUE7WUFDQSxJQUFJRyxlQUFlLEtBQUtaLG1CQUFtQixFQUFFO2NBQzVDRSxvQkFBb0IsR0FBR1EsY0FBYztZQUN0Qzs7WUFFQTtZQUNBLElBQUlELEtBQUssS0FBS3JGLFNBQVMsRUFBRTtjQUN4QitFLGlCQUFpQixHQUFHTyxjQUFjO1lBQ25DOztZQUVBO1lBQ0FOLGNBQWMsR0FBR00sY0FBYzs7WUFFL0I7WUFDQTtZQUNBeEYsbUJBQW1CLENBQ2pCLEdBQUVFLFNBQVUsSUFBR3NGLGNBQWUsRUFBQyxDQUM5Qm5CLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FDVkMsTUFBTSxDQUFDLFVBQVVxQixNQUFjLEVBQUU7Y0FDakMsT0FBT0EsTUFBTSxJQUFJLEVBQUU7WUFDcEIsQ0FBQyxDQUFDLENBQ0RDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FDWCxHQUFHcEgsUUFBUSxDQUFDcUgsV0FBVyxDQUFDTCxjQUFjLENBQUM7VUFDekM7VUFDQTtVQUNBSCxnQkFBZ0IsR0FBR0wsb0JBQW9CLElBQUlDLGlCQUFpQixJQUFJQyxjQUFjO1VBQzlFbEYsbUJBQW1CLENBQUNtRixZQUFZLENBQUMsR0FBRzNHLFFBQVEsQ0FBQ3FILFdBQVcsQ0FBQ1IsZ0JBQWdCLENBQUM7VUFDMUVMLG9CQUFvQixHQUFHNUQsU0FBUztVQUNoQzZELGlCQUFpQixHQUFHN0QsU0FBUztVQUM3QjhELGNBQWMsR0FBRzlELFNBQVM7UUFDM0IsQ0FBQyxNQUFNO1VBQ047VUFDQSxNQUFNbUUsS0FBSyxHQUFHSCxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1VBQ3BDLElBQUlJLGNBQWMsR0FBR0QsS0FBSyxDQUFDRSxPQUFPLENBQUNGLEtBQUssS0FBS3JGLFNBQVMsR0FBR0EsU0FBUyxHQUFJLEdBQUVBLFNBQVUsR0FBRSxFQUFFLEVBQUUsQ0FBQztVQUN6RnNGLGNBQWMsR0FBRyxDQUFDQSxjQUFjLEtBQUssRUFBRSxHQUFHQSxjQUFjLEdBQUksR0FBRUEsY0FBZSxHQUFFLElBQUlMLFlBQVk7VUFDL0ZuRixtQkFBbUIsQ0FBQ21GLFlBQVksQ0FBQyxHQUFHM0csUUFBUSxDQUFDcUgsV0FBVyxDQUFDTCxjQUFjLENBQUM7VUFDeEVULDBCQUEwQixDQUFDSSxZQUFZLENBQUMsR0FBSSxHQUFFakYsU0FBVSxJQUFHc0YsY0FBZSxFQUFDLENBQ3pFbkIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUNWQyxNQUFNLENBQUMsVUFBVXFCLE1BQWMsRUFBRTtZQUNqQyxPQUFPQSxNQUFNLElBQUksRUFBRTtVQUNwQixDQUFDLENBQUMsQ0FDREMsSUFBSSxDQUFDLEdBQUcsQ0FBQztRQUNaO01BQ0Q7TUFDQTtNQUNBLEtBQUssTUFBTUUsU0FBUyxJQUFJOUYsbUJBQW1CLEVBQUU7UUFDNUMsSUFBSUEsbUJBQW1CLENBQUM4RixTQUFTLENBQUMsS0FBSyxJQUFJLElBQUksT0FBTzlGLG1CQUFtQixDQUFDOEYsU0FBUyxDQUFDLEtBQUssUUFBUSxFQUFFO1VBQ2xHLE9BQU85RixtQkFBbUIsQ0FBQzhGLFNBQVMsQ0FBQztRQUN0QztNQUNEO01BQ0EsT0FBTztRQUNOcEYsa0JBQWtCLEVBQUVWLG1CQUFtQjtRQUN2Q1EseUJBQXlCLEVBQUV1RTtNQUM1QixDQUFDO0lBQ0Y7SUFDQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BUEM7SUFBQSxPQVVBZ0IsbUNBQW1DLEdBRm5DLDZDQUVvQ0Msb0JBQXlCLEVBQUVDLFNBQWlCLEVBQUVDLFdBQW1CLEVBQUU7TUFDdEcsSUFBSVgsS0FBSztNQUNULE1BQU1yQixhQUFrQixHQUFHLENBQUMsQ0FBQztNQUM3QixNQUFNaUMsZ0NBQXFDLEdBQUcsQ0FBQyxDQUFDO01BQ2hELElBQUluQixvQkFBb0IsRUFBRUMsaUJBQWlCLEVBQUVtQixnQkFBZ0IsRUFBRWYsZ0JBQWdCLEVBQUVHLGNBQWM7TUFFL0YsU0FBU2hCLHlCQUF5QixDQUFDQyxZQUFpQixFQUFFO1FBQ3JELElBQUlDLHFCQUFxQjtRQUN6QixLQUFLLElBQUlDLElBQUksSUFBSUYsWUFBWSxFQUFFO1VBQzlCLElBQUlBLFlBQVksQ0FBQ0UsSUFBSSxDQUFDLEVBQUU7WUFDdkIsSUFBSUEsSUFBSSxDQUFDMEIsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO2NBQ3ZCM0IscUJBQXFCLEdBQUdDLElBQUksQ0FBQyxDQUFDO2NBQzlCLE1BQU0yQixVQUFVLEdBQUczQixJQUFJLENBQUNOLEtBQUssQ0FBQyxHQUFHLENBQUM7Y0FDbENNLElBQUksR0FBRzJCLFVBQVUsQ0FBQ0EsVUFBVSxDQUFDMUcsTUFBTSxHQUFHLENBQUMsQ0FBQztZQUN6QyxDQUFDLE1BQU07Y0FDTjhFLHFCQUFxQixHQUFHdUIsU0FBUztZQUNsQztZQUNBLElBQUksQ0FBQy9CLGFBQWEsQ0FBQ1MsSUFBSSxDQUFDLEVBQUU7Y0FDekI7Y0FDQVQsYUFBYSxDQUFDUyxJQUFJLENBQUMsR0FBRyxFQUFFO1lBQ3pCOztZQUVBO1lBQ0FULGFBQWEsQ0FBQ1MsSUFBSSxDQUFDLENBQUNsRSxJQUFJLENBQUNpRSxxQkFBcUIsQ0FBQztVQUNoRDtRQUNEO01BQ0Q7TUFFQUYseUJBQXlCLENBQUN3QixvQkFBb0IsQ0FBQztNQUMvQyxLQUFLLE1BQU1iLFlBQVksSUFBSWpCLGFBQWEsRUFBRTtRQUN6QyxNQUFNa0IsaUJBQWlCLEdBQUdsQixhQUFhLENBQUNpQixZQUFZLENBQUM7UUFFckQsSUFBSUMsaUJBQWlCLENBQUN4RixNQUFNLEdBQUcsQ0FBQyxFQUFFO1VBQ2pDO1VBQ0EsS0FBSyxJQUFJMEYsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxJQUFJRixpQkFBaUIsQ0FBQ3hGLE1BQU0sR0FBRyxDQUFDLEVBQUUwRixDQUFDLEVBQUUsRUFBRTtZQUN2REMsS0FBSyxHQUFHSCxpQkFBaUIsQ0FBQ0UsQ0FBQyxDQUFDO1lBQzVCLElBQUlDLEtBQUssS0FBS1UsU0FBUyxFQUFFO2NBQ3hCRyxnQkFBZ0IsR0FBSSxHQUFFSCxTQUFVLElBQUdkLFlBQWEsRUFBQztjQUNqREssY0FBYyxHQUFHTCxZQUFZO2NBQzdCSCxvQkFBb0IsR0FBR0csWUFBWTtjQUNuQyxJQUFJZSxXQUFXLElBQUlBLFdBQVcsQ0FBQ0csUUFBUSxDQUFDbEIsWUFBWSxDQUFDLEVBQUU7Z0JBQ3REYSxvQkFBb0IsQ0FBRSxjQUFhYixZQUFhLEVBQUMsQ0FBQyxHQUFHYSxvQkFBb0IsQ0FBQ2IsWUFBWSxDQUFDO2NBQ3hGO1lBQ0QsQ0FBQyxNQUFNO2NBQ05LLGNBQWMsR0FBR0QsS0FBSztjQUN0QmEsZ0JBQWdCLEdBQUssR0FBRUgsU0FBVSxJQUFHVixLQUFNLEVBQUMsQ0FBU2dCLFVBQVUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDO2NBQ3pFdEIsaUJBQWlCLEdBQUdNLEtBQUs7WUFDMUI7WUFDQVMsb0JBQW9CLENBQ25CSSxnQkFBZ0IsQ0FDZC9CLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FDVkMsTUFBTSxDQUFDLFVBQVVxQixNQUFXLEVBQUU7Y0FDOUIsT0FBT0EsTUFBTSxJQUFJLEVBQUU7WUFDcEIsQ0FBQyxDQUFDLENBQ0RDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FDWCxHQUFHSSxvQkFBb0IsQ0FBQ1IsY0FBYyxDQUFDO1lBQ3hDLE9BQU9RLG9CQUFvQixDQUFDVCxLQUFLLENBQUM7VUFDbkM7VUFFQUYsZ0JBQWdCLEdBQUdMLG9CQUFvQixJQUFJQyxpQkFBaUI7VUFDNURlLG9CQUFvQixDQUFDYixZQUFZLENBQUMsR0FBR2Esb0JBQW9CLENBQUNYLGdCQUFnQixDQUFDO1FBQzVFLENBQUMsTUFBTTtVQUNOO1VBQ0FFLEtBQUssR0FBR0gsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO1VBQzVCZ0IsZ0JBQWdCLEdBQ2ZiLEtBQUssS0FBS1UsU0FBUyxHQUFJLEdBQUVBLFNBQVUsSUFBR2QsWUFBYSxFQUFDLEdBQUssR0FBRWMsU0FBVSxJQUFHVixLQUFNLEVBQUMsQ0FBU2dCLFVBQVUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDO1VBQzVHSixnQ0FBZ0MsQ0FBQ2hCLFlBQVksQ0FBQyxHQUFHaUIsZ0JBQWdCLENBQy9EL0IsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUNWQyxNQUFNLENBQUMsVUFBVXFCLE1BQVcsRUFBRTtZQUM5QixPQUFPQSxNQUFNLElBQUksRUFBRTtVQUNwQixDQUFDLENBQUMsQ0FDREMsSUFBSSxDQUFDLEdBQUcsQ0FBQztVQUNYLElBQUlNLFdBQVcsSUFBSUEsV0FBVyxDQUFDRyxRQUFRLENBQUNsQixZQUFZLENBQUMsRUFBRTtZQUN0RGEsb0JBQW9CLENBQUUsY0FBYWIsWUFBYSxFQUFDLENBQUMsR0FBR2Esb0JBQW9CLENBQUNiLFlBQVksQ0FBQztVQUN4RjtRQUNEO01BQ0Q7TUFFQSxPQUFPO1FBQ05xQixnQkFBZ0IsRUFBRVIsb0JBQW9CO1FBQ3RDUywrQkFBK0IsRUFBRU47TUFDbEMsQ0FBQztJQUNGOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsT0FKQztJQUFBLE9BT0F0RSxpQkFBaUIsR0FGakIsNkJBRW9CO01BQ25CLE9BQU9ULFNBQVM7SUFDakI7SUFDQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0F2QkM7SUFBQSxPQTBCQXNGLDhCQUE4QixHQUY5Qix3Q0FHQ3RJLGVBQXVCLEVBQ3ZCQyxPQUFlLEVBQ2ZDLHFCQU1DLEVBQ0E7TUFBQTtNQUNELElBQUlBLHFCQUFxQixhQUFyQkEscUJBQXFCLGVBQXJCQSxxQkFBcUIsQ0FBRXFJLHFCQUFxQixJQUFJLDBCQUFBckkscUJBQXFCLENBQUNxSSxxQkFBcUIsMERBQTNDLHNCQUE2Qy9HLE1BQU0sS0FBSSxDQUFDLEVBQUU7UUFDN0csSUFBSWdILHdCQUFnQztRQUNwQyxNQUFNdEgsV0FBVyxHQUFHO1VBQ25CdUgsT0FBTyxFQUFFLFlBQVk7WUFDcEI7WUFDQUQsd0JBQXdCLENBQUNFLEtBQUssRUFBRTtVQUNqQyxDQUFDO1VBQ0RDLFVBQVUsRUFBRSxNQUFNO1lBQ2pCO1lBQ0F6SSxxQkFBcUIsQ0FBQ0ksa0JBQWtCLEdBQUdKLHFCQUFxQixDQUFDMEksa0JBQWtCO1lBQ25GSix3QkFBd0IsQ0FBQ0UsS0FBSyxFQUFFO1lBQ2hDLElBQUksQ0FBQzNJLFFBQVEsQ0FBQ0MsZUFBZSxFQUFFQyxPQUFPLEVBQUVDLHFCQUFxQixDQUFDO1VBQy9EO1FBQ0QsQ0FBQztRQUNELE1BQU0ySSxtQkFBbUIsR0FBRyxZQUFZO1VBQ3ZDLElBQUlDLGNBQWM7VUFDbEIsTUFBTUMsY0FBYyxHQUFHN0kscUJBQXFCLENBQUNxSSxxQkFBcUIsQ0FBQy9HLE1BQU07WUFDeEV3SCxtQkFBbUIsR0FBRyxFQUFFO1VBQ3pCLEtBQUssSUFBSTlCLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR2hILHFCQUFxQixDQUFDcUkscUJBQXFCLENBQUMvRyxNQUFNLEVBQUUwRixDQUFDLEVBQUUsRUFBRTtZQUM1RTRCLGNBQWMsR0FBRzVJLHFCQUFxQixDQUFDcUkscUJBQXFCLENBQUNyQixDQUFDLENBQUMsQ0FBQ3JGLFNBQVMsRUFBRTtZQUMzRW1ILG1CQUFtQixDQUFDM0csSUFBSSxDQUFDeUcsY0FBYyxDQUFDO1VBQ3pDO1VBQ0EsTUFBTUcsd0JBQXdCLEdBQUcsSUFBSUMsU0FBUyxDQUFDRixtQkFBbUIsQ0FBQztVQUNuRSxNQUFNRyxPQUFPLEdBQUcsSUFBSUQsU0FBUyxDQUFDO1lBQUVFLEtBQUssRUFBRUwsY0FBYztZQUFFTSxLQUFLLEVBQUVuSixxQkFBcUIsQ0FBQ21KO1VBQU0sQ0FBQyxDQUFDO1VBQzVGYix3QkFBd0IsQ0FBQ2MsUUFBUSxDQUFDTCx3QkFBd0IsRUFBRSxlQUFlLENBQUM7VUFDNUVULHdCQUF3QixDQUFDYyxRQUFRLENBQUNILE9BQU8sRUFBRSxRQUFRLENBQUM7VUFDcERYLHdCQUF3QixDQUFDZSxJQUFJLEVBQUU7UUFDaEMsQ0FBQztRQUNEO1FBQ0EsTUFBTUMsYUFBYSxHQUFHLG9DQUFvQztRQUMxRCxNQUFNQyxlQUFlLEdBQUdDLG9CQUFvQixDQUFDQyxZQUFZLENBQUNILGFBQWEsRUFBRSxVQUFVLENBQUM7UUFDcEYsTUFBTTdHLE1BQU0sR0FBRyxJQUFJLENBQUM5QyxNQUFNLENBQUNKLFFBQVEsRUFBRTtRQUNyQyxNQUFNMEYsVUFBVSxHQUFHeEMsTUFBTSxDQUFDakQsWUFBWSxFQUFvQjtRQUMxRCxNQUFNa0ssY0FBYyxHQUFHMUoscUJBQXFCLENBQUNxSSxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQ3NCLGdCQUFnQixFQUFFO1FBQ3hGLE1BQU1qSCxVQUFVLEdBQUksR0FBRWdILGNBQWMsQ0FBQ0UsTUFBTSxDQUFDLENBQUMsRUFBRUYsY0FBYyxDQUFDRyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUUsR0FBRTtRQUM5RUMsT0FBTyxDQUFDQyxPQUFPLENBQ2RDLGVBQWUsQ0FBQ0MsT0FBTyxDQUN0QlYsZUFBZSxFQUNmO1VBQUVXLElBQUksRUFBRVo7UUFBYyxDQUFDLEVBQ3ZCO1VBQ0NhLGVBQWUsRUFBRTtZQUNoQkMsVUFBVSxFQUFFbkYsVUFBVSxDQUFDb0Ysb0JBQW9CLENBQUMzSCxVQUFVO1VBQ3ZELENBQUM7VUFDRDRILE1BQU0sRUFBRTtZQUNQRixVQUFVLEVBQUVuRixVQUFVO1lBQ3RCc0YsU0FBUyxFQUFFdEY7VUFDWjtRQUNELENBQUMsQ0FDRCxDQUNELENBQ0N1RixJQUFJLENBQUMsVUFBVUMsU0FBYyxFQUFFO1VBQy9CLE9BQU9DLFFBQVEsQ0FBQ0MsSUFBSSxDQUFDO1lBQUVDLFVBQVUsRUFBRUgsU0FBUztZQUFFSSxVQUFVLEVBQUU3SjtVQUFZLENBQUMsQ0FBQztRQUN6RSxDQUFDLENBQUMsQ0FDRHdKLElBQUksQ0FBRU0sUUFBYSxJQUFLO1VBQ3hCeEMsd0JBQXdCLEdBQUd3QyxRQUFRO1VBQ25DLElBQUksQ0FBQ2xMLE9BQU8sRUFBRSxDQUFDbUwsWUFBWSxDQUFDRCxRQUFRLENBQUM7VUFDckNuQyxtQkFBbUIsRUFBRTtRQUN0QixDQUFDLENBQUMsQ0FDRHFDLEtBQUssQ0FBQyxZQUFZO1VBQ2xCQyxHQUFHLENBQUN0RyxLQUFLLENBQUMsT0FBTyxDQUFDO1FBQ25CLENBQUMsQ0FBQztNQUNKLENBQUMsTUFBTTtRQUNOLElBQUksQ0FBQzlFLFFBQVEsQ0FBQ0MsZUFBZSxFQUFFQyxPQUFPLEVBQUVDLHFCQUFxQixDQUFDO01BQy9EO0lBQ0QsQ0FBQztJQUFBLE9BQ0RvRCwwQkFBMEIsR0FBMUIsb0NBQTJCaEMsaUJBQXNCLEVBQUU7TUFDbERBLGlCQUFpQixDQUFDOEosa0JBQWtCLENBQUMsZ0JBQWdCLENBQUM7TUFDdEQ5SixpQkFBaUIsQ0FBQzhKLGtCQUFrQixDQUFDLHFCQUFxQixDQUFDO01BQzNEOUosaUJBQWlCLENBQUM4SixrQkFBa0IsQ0FBQyxlQUFlLENBQUM7SUFDdEQ7SUFDQTtBQUNEO0FBQ0E7QUFDQTtBQUNBLE9BSkM7SUFBQSxPQU1BdkksWUFBWSxHQURaLHdCQUNlO01BQ2QsT0FBUSxJQUFJLENBQUNoRCxNQUFNLENBQUNnRSxXQUFXLEVBQUUsQ0FBU3dILFNBQVM7SUFDcEQ7SUFDQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0M7SUFBQTtJQUFBLE9BR0FwSixtQkFBbUIsR0FGbkIsNkJBRW9CcUosV0FBZ0IsRUFBRXhKLFNBQWlCLEVBQUU7TUFDeEQsSUFBSXdKLFdBQVcsRUFBRTtRQUNoQixNQUFNO1VBQUVDLGlCQUFpQjtVQUFFQztRQUFpQixDQUFDLEdBQUcsSUFBSSxDQUFDQyxjQUFjLENBQ2xFM0osU0FBUyxFQUNULElBQUksQ0FBQ3hDLElBQUksQ0FBQ1EsT0FBTyxFQUFFLEVBQ25CLElBQUksQ0FBQ1IsSUFBSSxDQUFDQyxlQUFlLEVBQUUsQ0FBQ21NLGNBQWMsRUFBRSxDQUM1QztRQUNELE1BQU1DLFdBQVcsR0FBR0MsTUFBTSxDQUFDQyxJQUFJLENBQUNQLFdBQVcsQ0FBQztRQUM1QyxJQUFJSyxXQUFXLENBQUNuSyxNQUFNLEVBQUU7VUFDdkIsT0FBTzhKLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQztVQUNwQyxPQUFPQSxXQUFXLENBQUMscUJBQXFCLENBQUM7VUFDekMsT0FBT0EsV0FBVyxDQUFDLGVBQWUsQ0FBQztVQUNuQyxLQUFLLElBQUlRLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR0gsV0FBVyxDQUFDbkssTUFBTSxFQUFFc0ssQ0FBQyxFQUFFLEVBQUU7WUFDNUMsSUFBSVIsV0FBVyxDQUFDSyxXQUFXLENBQUNHLENBQUMsQ0FBQyxDQUFDLElBQUksT0FBT1IsV0FBVyxDQUFDSyxXQUFXLENBQUNHLENBQUMsQ0FBQyxDQUFDLEtBQUssUUFBUSxFQUFFO2NBQ25GLElBQUksQ0FBQzdKLG1CQUFtQixDQUFDcUosV0FBVyxDQUFDSyxXQUFXLENBQUNHLENBQUMsQ0FBQyxDQUFDLEVBQUcsR0FBRWhLLFNBQVUsSUFBRzZKLFdBQVcsQ0FBQ0csQ0FBQyxDQUFFLEVBQUMsQ0FBQztZQUN4RjtZQUNBLE1BQU1DLEtBQUssR0FBR0osV0FBVyxDQUFDRyxDQUFDLENBQUM7WUFDNUIsSUFBSUMsS0FBSyxDQUFDaEMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO2NBQ3RDLE9BQU91QixXQUFXLENBQUNLLFdBQVcsQ0FBQ0csQ0FBQyxDQUFDLENBQUM7Y0FDbEM7WUFDRDtZQUNBLElBQUksQ0FBQ0UsaUJBQWlCLENBQUMsQ0FBQyxHQUFHVCxpQkFBaUIsRUFBRSxHQUFHQyxnQkFBZ0IsQ0FBQyxFQUFFRyxXQUFXLENBQUNHLENBQUMsQ0FBQyxFQUFFUixXQUFXLENBQUM7WUFDaEcsTUFBTVcsb0JBQW9CLEdBQUcsSUFBSSxDQUFDQyx1QkFBdUIsQ0FBQ0gsS0FBSyxFQUFFakssU0FBUyxFQUFFd0osV0FBVyxFQUFFLElBQUksQ0FBQzlMLFdBQVcsQ0FBQztZQUMxRyxJQUFJeU0sb0JBQW9CLEVBQUU7Y0FDekIsSUFDQ0Esb0JBQW9CLENBQUMsNkRBQTZELENBQUMsSUFDbkZBLG9CQUFvQixDQUFDLHlEQUF5RCxDQUFDLElBQy9FQSxvQkFBb0IsQ0FBQywyQ0FBMkMsQ0FBQyxFQUNoRTtnQkFDRCxPQUFPWCxXQUFXLENBQUNTLEtBQUssQ0FBQztjQUMxQixDQUFDLE1BQU0sSUFBSUUsb0JBQW9CLENBQUMsNkNBQTZDLENBQUMsRUFBRTtnQkFDL0UsTUFBTUUsYUFBYSxHQUFHRixvQkFBb0IsQ0FBQyw2Q0FBNkMsQ0FBQztnQkFDekYsSUFBSUUsYUFBYSxDQUFDLGFBQWEsQ0FBQyxJQUFJQSxhQUFhLENBQUMsYUFBYSxDQUFDLENBQUNsRyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssY0FBYyxFQUFFO2tCQUNsRyxPQUFPcUYsV0FBVyxDQUFDUyxLQUFLLENBQUM7Z0JBQzFCLENBQUMsTUFBTSxJQUNOSSxhQUFhLENBQUMsT0FBTyxDQUFDLElBQ3RCLElBQUksQ0FBQ0MsK0JBQStCLENBQUNELGFBQWEsQ0FBQyxPQUFPLENBQUMsRUFBRWIsV0FBVyxDQUFDLEVBQ3hFO2tCQUNELE9BQU9BLFdBQVcsQ0FBQ1MsS0FBSyxDQUFDO2dCQUMxQjtjQUNEO1lBQ0Q7VUFDRDtRQUNEO01BQ0Q7TUFDQSxPQUFPVCxXQUFXO0lBQ25COztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BTkM7SUFBQSxPQU9BVSxpQkFBaUIsR0FBakIsMkJBQWtCSyxVQUFnQyxFQUFFTixLQUFhLEVBQUVULFdBQWdCLEVBQUU7TUFDcEYsSUFBSWUsVUFBVSxJQUFJQSxVQUFVLENBQUN0QyxPQUFPLENBQUNnQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtRQUNqRCxPQUFPVCxXQUFXLENBQUNTLEtBQUssQ0FBQztNQUMxQjtJQUNEOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQVJDO0lBQUEsT0FTQUcsdUJBQXVCLEdBQXZCLGlDQUF3QkgsS0FBYSxFQUFFakssU0FBaUIsRUFBRXdKLFdBQWdCLEVBQUVuRyxVQUEwQixFQUFFO01BQ3ZHLElBQUltRyxXQUFXLENBQUNTLEtBQUssQ0FBQyxJQUFJakssU0FBUyxJQUFJLENBQUNBLFNBQVMsQ0FBQ21HLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRTtRQUFBO1FBQ3hFLE1BQU03SCxRQUFRLEdBQUcrRSxVQUFVLENBQUNvRixvQkFBb0IsQ0FBRSxHQUFFekksU0FBVSxJQUFHaUssS0FBTSxFQUFDLENBQW1CO1FBQzNGLE1BQU1PLFlBQVksR0FBR0Msa0JBQWtCLENBQUNDLDJCQUEyQixDQUFDcE0sUUFBUSxDQUFDO1FBQzdFLE9BQU9rTSxZQUFZLGFBQVpBLFlBQVksZ0RBQVpBLFlBQVksQ0FBRUcsWUFBWSxvRkFBMUIsc0JBQTRCQyxXQUFXLDJEQUF2Qyx1QkFBeUNDLFlBQVk7TUFDN0Q7TUFDQSxPQUFPLElBQUk7SUFDWjs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BUEM7SUFBQSxPQVFBbEIsY0FBYyxHQUFkLHdCQUFlM0osU0FBaUIsRUFBRWIsS0FBVyxFQUFFMkwsWUFBeUIsRUFBRTtNQUN6RSxNQUFNQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUNDLG9CQUFvQixDQUFDaEwsU0FBUyxFQUFFYixLQUFLLEVBQUUyTCxZQUFZLENBQUM7TUFDbEYsTUFBTUcsaUJBQWlCLEdBQUcsSUFBSUMsaUJBQWlCLENBQUNILGdCQUFnQixDQUFDSSxhQUFhLEVBQUUsRUFBRUosZ0JBQWdCLENBQUM7TUFDbkcsTUFBTUssb0JBQW9CLEdBQUdILGlCQUFpQixDQUFDRyxvQkFBb0IsRUFBRTtNQUNyRSxJQUFJM0IsaUJBQWlCLEdBQUcsRUFBRTtRQUN6QkMsZ0JBQWdCLEdBQUcsRUFBRTtNQUN0QixJQUFJMEIsb0JBQW9CLEVBQUU7UUFDekIzQixpQkFBaUIsR0FBR3dCLGlCQUFpQixDQUFDSSxvQkFBb0IsRUFBRTtRQUM1RCxJQUFJNUIsaUJBQWlCLENBQUMvSixNQUFNLEVBQUU7VUFDN0IrSixpQkFBaUIsR0FBR0EsaUJBQWlCLENBQUM2QixHQUFHLENBQUVDLFFBQWEsSUFBSztZQUM1RCxPQUFPQSxRQUFRLENBQUNDLElBQUksSUFBSUQsUUFBUSxDQUFDRSxLQUFLO1VBQ3ZDLENBQUMsQ0FBQztRQUNIO1FBQ0EvQixnQkFBZ0IsR0FBR3VCLGlCQUFpQixDQUFDUyw2QkFBNkIsRUFBRTtRQUNwRSxJQUFJaEMsZ0JBQWdCLENBQUNoSyxNQUFNLEVBQUU7VUFDNUJnSyxnQkFBZ0IsR0FBR0EsZ0JBQWdCLENBQUM0QixHQUFHLENBQUVLLGVBQW9CLElBQUs7WUFDakUsT0FBT0EsZUFBZSxDQUFDQyxTQUFTO1VBQ2pDLENBQUMsQ0FBQztRQUNIO01BQ0Q7TUFDQSxPQUFPO1FBQUVuQyxpQkFBaUI7UUFBRUM7TUFBaUIsQ0FBQztJQUMvQzs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BUEM7SUFBQSxPQVFBc0Isb0JBQW9CLEdBQXBCLDhCQUFxQmhMLFNBQWlCLEVBQUViLEtBQVcsRUFBRTJMLFlBQXlCLEVBQUU7TUFDL0UsTUFBTWUsU0FBYyxHQUFHMU0sS0FBSyxDQUFDNEMsV0FBVyxFQUFFO01BQzFDLElBQUlqQixVQUFVLEdBQUcrSyxTQUFTLENBQUN0QyxTQUFTO01BQ3BDLE1BQU10RixZQUFZLEdBQUc0SCxTQUFTLENBQUNDLFdBQVc7TUFDMUMsSUFBSTdILFlBQVksS0FBSyxDQUFDbkQsVUFBVSxJQUFJQSxVQUFVLENBQUNxRixRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtRQUM5RHJGLFVBQVUsR0FBRytLLFNBQVMsYUFBVEEsU0FBUyx1QkFBVEEsU0FBUyxDQUFFRSxlQUFlLENBQUM1SCxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO01BQ3REO01BQ0EsT0FBTzZILFdBQVcsQ0FBQ0MsMEJBQTBCLENBQzVDak0sU0FBUyxFQUNUYixLQUFLLENBQUN4QixRQUFRLEVBQUUsQ0FBQ0MsWUFBWSxFQUFFLEVBQy9Ca0QsVUFBVSxFQUNWZ0ssWUFBWSxDQUNaO0lBQ0Y7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FOQztJQUFBLE9BT0FSLCtCQUErQixHQUEvQix5Q0FBZ0M0QixpQkFBeUIsRUFBRUMsVUFBZSxFQUFFO01BQzNFLElBQUlDLGFBQWEsR0FBRyxLQUFLO01BQ3pCLE1BQU1DLE1BQU0sR0FBR0gsaUJBQWlCLENBQUMvSCxLQUFLLENBQUMsR0FBRyxDQUFDO01BQzNDO01BQ0EsSUFBSWtJLE1BQU0sQ0FBQzNNLE1BQU0sR0FBRyxDQUFDLEVBQUU7UUFDdEIwTSxhQUFhLEdBQ1pELFVBQVUsQ0FBQ0UsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUlGLFVBQVUsQ0FBQ0UsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUNDLGNBQWMsQ0FBQ0QsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUlGLFVBQVUsQ0FBQ0UsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUNBLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7TUFDcEgsQ0FBQyxNQUFNO1FBQ05ELGFBQWEsR0FBR0QsVUFBVSxDQUFDRCxpQkFBaUIsQ0FBQyxLQUFLLENBQUM7TUFDcEQ7TUFDQSxPQUFPRSxhQUFhO0lBQ3JCO0lBQ0E7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FOQztJQUFBLE9BT0E3Syw0QkFBNEIsR0FBNUIsc0NBQTZCL0IsaUJBQW1DLEVBQUUrTSxTQUEwQixFQUFFO01BQzdGLE1BQU1DLFNBQVMsR0FBRyxPQUFPRCxTQUFTLEtBQUssUUFBUSxHQUFHRSxJQUFJLENBQUNDLEtBQUssQ0FBQ0gsU0FBUyxDQUFDLEdBQUdBLFNBQVM7TUFDbkYsS0FBSyxJQUFJbkgsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHb0gsU0FBUyxDQUFDOU0sTUFBTSxFQUFFMEYsQ0FBQyxFQUFFLEVBQUU7UUFDMUMsTUFBTXVILGNBQWMsR0FDbEJILFNBQVMsQ0FBQ3BILENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxJQUFJb0gsU0FBUyxDQUFDcEgsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsZUFBZSxDQUFDLElBQy9Fb0gsU0FBUyxDQUFDcEgsQ0FBQyxDQUFDLENBQUMsK0NBQStDLENBQUMsSUFDN0RvSCxTQUFTLENBQUNwSCxDQUFDLENBQUMsQ0FBQywrQ0FBK0MsQ0FBQyxDQUFDLE9BQU8sQ0FBRTtRQUN6RSxNQUFNd0gsdUJBQXVCLEdBQzVCSixTQUFTLENBQUNwSCxDQUFDLENBQUMsQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJb0gsU0FBUyxDQUFDcEgsQ0FBQyxDQUFDLENBQUMsd0RBQXdELENBQUM7UUFDakgsTUFBTXlILGFBQWEsR0FBR3JOLGlCQUFpQixDQUFDc04sZUFBZSxDQUFDSCxjQUFjLENBQUM7UUFDdkUsSUFBSUUsYUFBYSxFQUFFO1VBQ2xCO1VBQ0FyTixpQkFBaUIsQ0FBQzhKLGtCQUFrQixDQUFDcUQsY0FBYyxDQUFDO1VBQ3BEbk4saUJBQWlCLENBQUN1TixtQkFBbUIsQ0FBQ0gsdUJBQXVCLEVBQUVDLGFBQWEsQ0FBQztRQUM5RTtNQUNEO01BQ0EsT0FBT3JOLGlCQUFpQjtJQUN6QjtJQUNBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQVJDO0lBQUEsT0FXQXdOLGdCQUFnQixHQUZoQiwwQkFFaUJDLFNBQWlCLEVBQUU3TyxxQkFBMEIsRUFBRTtNQUFBO01BQy9ELElBQUk4TyxVQUE2QjtNQUNqQyxNQUFNQyxjQUFjLEdBQUcsSUFBSSxDQUFDM1AsSUFBSSxDQUFDQyxlQUFlLEVBQUUsQ0FBQzJQLGdCQUFnQixDQUFDLFNBQVMsQ0FBQztRQUM3RUMsU0FBUyw0QkFBR0YsY0FBYyxDQUFDRyxlQUFlLG9GQUE5QixzQkFBZ0NDLFNBQVMsMkRBQXpDLHVCQUE0Q04sU0FBUyxDQUFDO01BQ25FLElBQUksQ0FBQ0ksU0FBUyxFQUFFO1FBQ2ZoRSxHQUFHLENBQUN0RyxLQUFLLENBQUMsdUNBQXVDLENBQUM7UUFDbEQ7TUFDRDtNQUNBLE1BQU03RSxlQUFlLEdBQUdtUCxTQUFTLENBQUNwTyxjQUFjO1FBQy9DZCxPQUFPLEdBQUdrUCxTQUFTLENBQUNuTyxNQUFNO1FBQzFCc08sY0FBYyxHQUFHSCxTQUFTLENBQUNJLFVBQVUsSUFBSSxJQUFJLENBQUNDLGlCQUFpQixDQUFDTCxTQUFTLENBQUNJLFVBQVUsQ0FBQztNQUV0RixJQUFJclAscUJBQXFCLEVBQUU7UUFDMUI4TyxVQUFVLEdBQUcsRUFBRTtRQUNmcEQsTUFBTSxDQUFDQyxJQUFJLENBQUMzTCxxQkFBcUIsQ0FBQyxDQUFDdUIsT0FBTyxDQUFDLFVBQVVnTyxHQUFXLEVBQUU7VUFDakUsSUFBSUMsT0FBWTtVQUNoQixJQUFJbFAsS0FBSyxDQUFDQyxPQUFPLENBQUNQLHFCQUFxQixDQUFDdVAsR0FBRyxDQUFDLENBQUMsRUFBRTtZQUM5QyxNQUFNRSxPQUFPLEdBQUd6UCxxQkFBcUIsQ0FBQ3VQLEdBQUcsQ0FBQztZQUMxQyxLQUFLLElBQUl2SSxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUd5SSxPQUFPLENBQUNuTyxNQUFNLEVBQUUwRixDQUFDLEVBQUUsRUFBRTtjQUFBO2NBQ3hDd0ksT0FBTyxHQUFHLENBQUMsQ0FBQztjQUNaQSxPQUFPLENBQUNELEdBQUcsQ0FBQyxHQUFHRSxPQUFPLENBQUN6SSxDQUFDLENBQUM7Y0FDekIsZUFBQThILFVBQVUsZ0RBQVYsWUFBWTNNLElBQUksQ0FBQ3FOLE9BQU8sQ0FBQztZQUMxQjtVQUNELENBQUMsTUFBTTtZQUFBO1lBQ05BLE9BQU8sR0FBRyxDQUFDLENBQUM7WUFDWkEsT0FBTyxDQUFDRCxHQUFHLENBQUMsR0FBR3ZQLHFCQUFxQixDQUFDdVAsR0FBRyxDQUFDO1lBQ3pDLGdCQUFBVCxVQUFVLGlEQUFWLGFBQVkzTSxJQUFJLENBQUNxTixPQUFPLENBQUM7VUFDMUI7UUFDRCxDQUFDLENBQUM7TUFDSDtNQUNBLElBQUlWLFVBQVUsSUFBSU0sY0FBYyxFQUFFO1FBQ2pDcFAscUJBQXFCLEdBQUc7VUFDdkJJLGtCQUFrQixFQUFFO1lBQ25CaUMsSUFBSSxFQUFFeU0sVUFBVSxJQUFJTTtVQUNyQjtRQUNELENBQUM7TUFDRjtNQUNBLElBQUksQ0FBQ2hRLElBQUksQ0FBQ2tFLHNCQUFzQixDQUFDekQsUUFBUSxDQUFDQyxlQUFlLEVBQUVDLE9BQU8sRUFBRUMscUJBQXFCLENBQUM7SUFDM0Y7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FOQztJQUFBLE9BT0FnRCxvQkFBb0IsR0FBcEIsOEJBQXFCNUIsaUJBQW1DLEVBQUVWLGVBQW9CLEVBQUU7TUFDL0UsTUFBTWtILFdBQVcsR0FBRzhELE1BQU0sQ0FBQ0MsSUFBSSxDQUFDakwsZUFBZSxDQUFDO01BQ2hELE1BQU1nUCxpQkFBaUIsR0FBR3RPLGlCQUFpQixDQUFDdU8sNkJBQTZCLEVBQUU7TUFDM0UvSCxXQUFXLENBQUNyRyxPQUFPLENBQUMsVUFBVWdPLEdBQVcsRUFBRTtRQUMxQyxJQUFJLENBQUNHLGlCQUFpQixDQUFDM0gsUUFBUSxDQUFDd0gsR0FBRyxDQUFDLEVBQUU7VUFDckNuTyxpQkFBaUIsQ0FBQ3dPLGVBQWUsQ0FBQ0wsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUU3TyxlQUFlLENBQUM2TyxHQUFHLENBQUMsQ0FBQztRQUN4RTtNQUNELENBQUMsQ0FBQztNQUNGLE9BQU9uTyxpQkFBaUI7SUFDekI7SUFDQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQU5DO0lBQUEsT0FTQWtPLGlCQUFpQixHQUZqQiwyQkFFa0JPLGVBQW9CLEVBQUU7TUFDdkMsTUFBTUMsY0FBbUIsR0FBRyxDQUFDLENBQUM7TUFDOUIsSUFBSUQsZUFBZSxFQUFFO1FBQ3BCLE1BQU1qSSxXQUFXLEdBQUc4RCxNQUFNLENBQUNDLElBQUksQ0FBQ2tFLGVBQWUsQ0FBQyxJQUFJLEVBQUU7UUFDdEQsSUFBSWpJLFdBQVcsQ0FBQ3RHLE1BQU0sR0FBRyxDQUFDLEVBQUU7VUFDM0JzRyxXQUFXLENBQUNyRyxPQUFPLENBQUMsVUFBVWdPLEdBQVcsRUFBRTtZQUMxQyxNQUFNUSxRQUFRLEdBQUdGLGVBQWUsQ0FBQ04sR0FBRyxDQUFDO1lBQ3JDLElBQUlRLFFBQVEsQ0FBQ0MsS0FBSyxJQUFJRCxRQUFRLENBQUNDLEtBQUssQ0FBQ0EsS0FBSyxJQUFJRCxRQUFRLENBQUNDLEtBQUssQ0FBQ0MsTUFBTSxLQUFLLE9BQU8sRUFBRTtjQUNoRixJQUFJLENBQUNILGNBQWMsQ0FBQ1AsR0FBRyxDQUFDLEVBQUU7Z0JBQ3pCTyxjQUFjLENBQUNQLEdBQUcsQ0FBQyxHQUFHUSxRQUFRLENBQUNDLEtBQUssQ0FBQ0EsS0FBSztjQUMzQztZQUNEO1VBQ0QsQ0FBQyxDQUFDO1FBQ0g7TUFDRDtNQUNBLE9BQU9GLGNBQWM7SUFDdEI7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BUkM7SUFBQSxPQVlBSSw4QkFBOEIsR0FGOUIsd0NBRStCbFAsV0FBMkIsRUFBRW1QLGVBQXVCLEVBQUVqUSxRQUFhLEVBQUVrUSxXQUFtQixFQUFFO01BQ3hILE1BQU1DLFVBQVUsR0FBSXJQLFdBQVcsQ0FBQzNCLGVBQWUsRUFBRSxDQUFTaVIsaUJBQWlCLEVBQUUsQ0FBQ0MsWUFBWSxFQUFFO01BQzVGLE1BQU1DLGdCQUFnQixHQUFHSCxVQUFVLENBQUNGLGVBQWUsQ0FBQztNQUNwRCxJQUFJeFAsOEJBQThCO01BQ2xDLElBQUk2UCxnQkFBZ0IsSUFBSUEsZ0JBQWdCLENBQUMzUCxjQUFjLElBQUkyUCxnQkFBZ0IsQ0FBQzFQLE1BQU0sRUFBRTtRQUNuRixNQUFNMlAsa0JBQXVCLEdBQUc7VUFDL0JDLE9BQU8sRUFBRSxDQUFDO1FBQ1gsQ0FBQztRQUNELE1BQU1DLHVCQUE0QixHQUFHLENBQUMsQ0FBQztRQUN2QyxJQUFJL08sU0FBUztRQUViLElBQUkxQixRQUFRLEVBQUU7VUFDYixJQUFJQSxRQUFRLENBQUN1QixHQUFHLElBQUl2QixRQUFRLENBQUN1QixHQUFHLENBQUMsK0JBQStCLENBQUMsRUFBRTtZQUNsRUcsU0FBUyxHQUFHdUQsV0FBVyxDQUFDeUwscUJBQXFCLENBQUMxUSxRQUFRLENBQUM7WUFDdkRBLFFBQVEsR0FBRyxDQUFDQSxRQUFRLENBQUM7VUFDdEIsQ0FBQyxNQUFNO1lBQ04wQixTQUFTLEdBQUd1RCxXQUFXLENBQUN5TCxxQkFBcUIsQ0FBQzFRLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztVQUMzRDtVQUNBeVEsdUJBQXVCLENBQUMvTyxTQUFTLENBQUMsR0FBRyxNQUFNO1VBQzNDNk8sa0JBQWtCLENBQUMsWUFBWSxDQUFDLEdBQUdFLHVCQUF1QjtRQUMzRDtRQUVBLElBQUlQLFdBQVcsRUFBRTtVQUNoQixNQUFNL0osSUFBSSxHQUFJLEdBQUVtSyxnQkFBZ0IsQ0FBQzNQLGNBQWUsSUFBRzJQLGdCQUFnQixDQUFDMVAsTUFBTyxFQUFDO1VBQzVFMlAsa0JBQWtCLENBQUNDLE9BQU8sQ0FBQ3JLLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztVQUNyQ29LLGtCQUFrQixDQUFDQyxPQUFPLENBQUNySyxJQUFJLENBQUMsQ0FBQytKLFdBQVcsQ0FBQyxHQUFHLE1BQU07UUFDdkQ7UUFDQSxJQUFJSSxnQkFBZ0IsSUFBSUEsZ0JBQWdCLENBQUNuQixVQUFVLEVBQUU7VUFDcEQsTUFBTUcsT0FBTyxHQUFHZ0IsZ0JBQWdCLENBQUNuQixVQUFVLElBQUksSUFBSSxDQUFDQyxpQkFBaUIsQ0FBQ2tCLGdCQUFnQixDQUFDbkIsVUFBVSxDQUFDO1VBQ2xHLElBQUkzRCxNQUFNLENBQUNDLElBQUksQ0FBQzZELE9BQU8sQ0FBQyxDQUFDbE8sTUFBTSxHQUFHLENBQUMsRUFBRTtZQUNwQ1gsOEJBQThCLEdBQUc2TyxPQUFPO1VBQ3pDO1FBQ0Q7UUFFQXhPLFdBQVcsQ0FBQ3NDLHNCQUFzQixDQUFDekQsUUFBUSxDQUFDMlEsZ0JBQWdCLENBQUMzUCxjQUFjLEVBQUUyUCxnQkFBZ0IsQ0FBQzFQLE1BQU0sRUFBRTtVQUNyR1Ysa0JBQWtCLEVBQUVGLFFBQVE7VUFDNUJ1RCxpQkFBaUIsRUFBRWdOLGtCQUFrQjtVQUNyQzlQLDhCQUE4QixFQUFFQTtRQUNqQyxDQUFDLENBQUM7O1FBRUY7UUFDQSxPQUFPbUosT0FBTyxDQUFDQyxPQUFPLEVBQUU7TUFDekIsQ0FBQyxNQUFNO1FBQ04sTUFBTSxJQUFJakYsS0FBSyxDQUFFLG1CQUFrQnFMLGVBQWdCLHVEQUFzRCxDQUFDO01BQzNHO0lBQ0QsQ0FBQztJQUFBO0VBQUEsRUFwMkIwQ1UsbUJBQW1CO0VBQUEsT0F1MkJoRHBTLDZCQUE2QjtBQUFBIn0=