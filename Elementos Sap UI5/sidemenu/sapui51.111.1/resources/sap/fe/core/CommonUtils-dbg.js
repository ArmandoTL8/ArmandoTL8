/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/array/uniqueSort", "sap/base/util/merge", "sap/fe/core/converters/ConverterContext", "sap/fe/core/converters/helpers/IssueManager", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/SemanticDateOperators", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/type/EDM", "sap/fe/core/type/TypeUtil", "sap/fe/macros/ODataMetaModelUtil", "sap/ui/core/Component", "sap/ui/core/Core", "sap/ui/core/Fragment", "sap/ui/core/util/XMLPreprocessor", "sap/ui/core/XMLTemplateProcessor", "sap/ui/Device", "sap/ui/mdc/condition/FilterOperatorUtil", "sap/ui/mdc/condition/RangeOperator", "./controls/AnyElement", "./templating/FilterHelper"], function (Log, uniqueSort, mergeObjects, ConverterContext, IssueManager, MetaModelConverter, BindingToolkit, ModelHelper, SemanticDateOperators, StableIdHelper, EDM, TypeUtil, metaModelUtil, Component, Core, Fragment, XMLPreprocessor, XMLTemplateProcessor, Device, FilterOperatorUtil, RangeOperator, AnyElement, FilterHelper) {
  "use strict";

  var _exports = {};
  var getConditions = FilterHelper.getConditions;
  var system = Device.system;
  var isTypeFilterable = EDM.isTypeFilterable;
  var generate = StableIdHelper.generate;
  var pathInModel = BindingToolkit.pathInModel;
  var or = BindingToolkit.or;
  var not = BindingToolkit.not;
  var compileExpression = BindingToolkit.compileExpression;
  var IssueSeverity = IssueManager.IssueSeverity;
  var IssueCategoryType = IssueManager.IssueCategoryType;
  var IssueCategory = IssueManager.IssueCategory;
  function normalizeSearchTerm(sSearchTerm) {
    if (!sSearchTerm) {
      return undefined;
    }
    return sSearchTerm.replace(/"/g, " ").replace(/\\/g, "\\\\") //escape backslash characters. Can be removed if odata/binding handles backend errors responds.
    .split(/\s+/).reduce(function (sNormalized, sCurrentWord) {
      if (sCurrentWord !== "") {
        sNormalized = `${sNormalized ? `${sNormalized} ` : ""}"${sCurrentWord}"`;
      }
      return sNormalized;
    }, undefined);
  }
  function getPropertyDataType(oNavigationContext) {
    let sDataType = oNavigationContext.getProperty("$Type");
    // if $kind exists, it's not a DataField and we have the final type already
    if (!oNavigationContext.getProperty("$kind")) {
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
          sDataType = oNavigationContext.getProperty("Value/$Path/$Type");
          break;
        case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
        default:
          const sAnnotationPath = oNavigationContext.getProperty("Target/$AnnotationPath");
          if (sAnnotationPath) {
            if (sAnnotationPath.indexOf("com.sap.vocabularies.Communication.v1.Contact") > -1) {
              sDataType = oNavigationContext.getProperty("Target/$AnnotationPath/fn/$Path/$Type");
            } else if (sAnnotationPath.indexOf("com.sap.vocabularies.UI.v1.DataPoint") > -1) {
              sDataType = oNavigationContext.getProperty("Value/$Path/$Type");
            } else {
              // e.g. FieldGroup or Chart
              sDataType = undefined;
            }
          } else {
            sDataType = undefined;
          }
          break;
      }
    }
    return sDataType;
  }
  async function waitForContextRequested(bindingContext) {
    var _dataModel$targetEnti;
    const model = bindingContext.getModel();
    const metaModel = model.getMetaModel();
    const entityPath = metaModel.getMetaPath(bindingContext.getPath());
    const dataModel = MetaModelConverter.getInvolvedDataModelObjects(metaModel.getContext(entityPath));
    await bindingContext.requestProperty((_dataModel$targetEnti = dataModel.targetEntityType.keys[0]) === null || _dataModel$targetEnti === void 0 ? void 0 : _dataModel$targetEnti.name);
  }
  function fnHasTransientContexts(oListBinding) {
    let bHasTransientContexts = false;
    if (oListBinding) {
      oListBinding.getCurrentContexts().forEach(function (oContext) {
        if (oContext && oContext.isTransient()) {
          bHasTransientContexts = true;
        }
      });
    }
    return bHasTransientContexts;
  }
  function getSearchRestrictions(sFullPath, oMetaModelContext) {
    let oSearchRestrictions;
    let oNavigationSearchRestrictions;
    const navigationText = "$NavigationPropertyBinding";
    const searchRestrictionsTerm = "@Org.OData.Capabilities.V1.SearchRestrictions";
    const entityTypePathParts = sFullPath.replaceAll("%2F", "/").split("/").filter(ModelHelper.filterOutNavPropBinding);
    const entitySetPath = ModelHelper.getEntitySetPath(sFullPath, oMetaModelContext);
    const entitySetPathParts = entitySetPath.split("/").filter(ModelHelper.filterOutNavPropBinding);
    const isContainment = oMetaModelContext.getObject(`/${entityTypePathParts.join("/")}/$ContainsTarget`);
    const containmentNavPath = isContainment && entityTypePathParts[entityTypePathParts.length - 1];

    //LEAST PRIORITY - Search restrictions directly at Entity Set
    //e.g. FR in "NS.EntityContainer/SalesOrderManage" ContextPath: /SalesOrderManage
    if (!isContainment) {
      oSearchRestrictions = oMetaModelContext.getObject(`${entitySetPath}${searchRestrictionsTerm}`);
    }
    if (entityTypePathParts.length > 1) {
      const navPath = isContainment ? containmentNavPath : entitySetPathParts[entitySetPathParts.length - 1];
      // In case of containment we take entitySet provided as parent. And in case of normal we would remove the last navigation from entitySetPath.
      const parentEntitySetPath = isContainment ? entitySetPath : `/${entitySetPathParts.slice(0, -1).join(`/${navigationText}/`)}`;

      //HIGHEST priority - Navigation restrictions
      //e.g. Parent "/Customer" with NavigationPropertyPath="Set" ContextPath: Customer/Set
      const oNavigationRestrictions = CommonUtils.getNavigationRestrictions(oMetaModelContext, parentEntitySetPath, navPath.replaceAll("%2F", "/"));
      oNavigationSearchRestrictions = oNavigationRestrictions && oNavigationRestrictions["SearchRestrictions"];
    }
    return oNavigationSearchRestrictions || oSearchRestrictions;
  }
  function getNavigationRestrictions(oMetaModelContext, sEntitySetPath, sNavigationPath) {
    const oNavigationRestrictions = oMetaModelContext.getObject(`${sEntitySetPath}@Org.OData.Capabilities.V1.NavigationRestrictions`);
    const aRestrictedProperties = oNavigationRestrictions && oNavigationRestrictions.RestrictedProperties;
    return aRestrictedProperties && aRestrictedProperties.find(function (oRestrictedProperty) {
      return oRestrictedProperty && oRestrictedProperty.NavigationProperty && oRestrictedProperty.NavigationProperty.$NavigationPropertyPath === sNavigationPath;
    });
  }
  function _isInNonFilterableProperties(metamodelContext, sEntitySetPath, sContextPath) {
    let bIsNotFilterable = false;
    const oAnnotation = metamodelContext.getObject(`${sEntitySetPath}@Org.OData.Capabilities.V1.FilterRestrictions`);
    if (oAnnotation && oAnnotation.NonFilterableProperties) {
      bIsNotFilterable = oAnnotation.NonFilterableProperties.some(function (property) {
        return property.$NavigationPropertyPath === sContextPath || property.$PropertyPath === sContextPath;
      });
    }
    return bIsNotFilterable;
  }
  function _isCustomAggregate(metamodelContext, sEntitySetPath, sContextPath) {
    let bCustomAggregate = false;
    const bApplySupported = metamodelContext !== null && metamodelContext !== void 0 && metamodelContext.getObject(sEntitySetPath + "@Org.OData.Aggregation.V1.ApplySupported") ? true : false;
    if (bApplySupported) {
      const oAnnotations = metamodelContext.getObject(`${sEntitySetPath}@`);
      const oCustomAggreggates = metaModelUtil.getAllCustomAggregates(oAnnotations);
      const aCustomAggregates = oCustomAggreggates ? Object.keys(oCustomAggreggates) : undefined;
      if (aCustomAggregates && (aCustomAggregates === null || aCustomAggregates === void 0 ? void 0 : aCustomAggregates.indexOf(sContextPath)) > -1) {
        bCustomAggregate = true;
      }
    }
    return bCustomAggregate;
  }

  // TODO rework this!
  function _isContextPathFilterable(oModelContext, sEntitySetPath, sContexPath) {
    const sFullPath = `${sEntitySetPath}/${sContexPath}`,
      aESParts = sFullPath.split("/").splice(0, 2),
      aContext = sFullPath.split("/").splice(2);
    let bIsNotFilterable = false,
      sContext = "";
    sEntitySetPath = aESParts.join("/");
    bIsNotFilterable = aContext.some(function (item, index, array) {
      if (sContext.length > 0) {
        sContext += `/${item}`;
      } else {
        sContext = item;
      }
      if (index === array.length - 2) {
        // In case of "/Customer/Set/Property" this is to check navigation restrictions of "Customer" for non-filterable properties in "Set"
        const oNavigationRestrictions = getNavigationRestrictions(oModelContext, sEntitySetPath, item);
        const oFilterRestrictions = oNavigationRestrictions && oNavigationRestrictions.FilterRestrictions;
        const aNonFilterableProperties = oFilterRestrictions && oFilterRestrictions.NonFilterableProperties;
        const sTargetPropertyPath = array[array.length - 1];
        if (aNonFilterableProperties && aNonFilterableProperties.find(function (oPropertyPath) {
          return oPropertyPath.$PropertyPath === sTargetPropertyPath;
        })) {
          return true;
        }
      }
      if (index === array.length - 1) {
        //last path segment
        bIsNotFilterable = _isInNonFilterableProperties(oModelContext, sEntitySetPath, sContext);
      } else if (oModelContext.getObject(`${sEntitySetPath}/$NavigationPropertyBinding/${item}`)) {
        //check existing context path and initialize it
        bIsNotFilterable = _isInNonFilterableProperties(oModelContext, sEntitySetPath, sContext);
        sContext = "";
        //set the new EntitySet
        sEntitySetPath = `/${oModelContext.getObject(`${sEntitySetPath}/$NavigationPropertyBinding/${item}`)}`;
      }
      return bIsNotFilterable === true;
    });
    return bIsNotFilterable;
  }

  // TODO check used places and rework this
  function isPropertyFilterable(metaModelContext, sEntitySetPath, sProperty, bSkipHiddenFilter) {
    var _metaModelContext$get;
    if (typeof sProperty !== "string") {
      throw new Error("sProperty parameter must be a string");
    }
    let bIsFilterable;

    // Parameters should be rendered as filterfields
    if (((_metaModelContext$get = metaModelContext.getObject(`${sEntitySetPath}/@com.sap.vocabularies.Common.v1.ResultContext`)) === null || _metaModelContext$get === void 0 ? void 0 : _metaModelContext$get.valueOf()) === true) {
      return true;
    }
    const oNavigationContext = metaModelContext.createBindingContext(`${sEntitySetPath}/${sProperty}`);
    if (!bSkipHiddenFilter) {
      if (oNavigationContext.getProperty("@com.sap.vocabularies.UI.v1.Hidden") === true || oNavigationContext.getProperty("@com.sap.vocabularies.UI.v1.HiddenFilter") === true) {
        return false;
      }
      const sHiddenPath = oNavigationContext.getProperty("@com.sap.vocabularies.UI.v1.Hidden/$Path");
      const sHiddenFilterPath = oNavigationContext.getProperty("@com.sap.vocabularies.UI.v1.HiddenFilter/$Path");
      if (sHiddenPath && sHiddenFilterPath) {
        return compileExpression(not(or(pathInModel(sHiddenPath), pathInModel(sHiddenFilterPath))));
      } else if (sHiddenPath) {
        return compileExpression(not(pathInModel(sHiddenPath)));
      } else if (sHiddenFilterPath) {
        return compileExpression(not(pathInModel(sHiddenFilterPath)));
      }
    }

    // there is no navigation in entitySet path and property path
    bIsFilterable = sEntitySetPath.split("/").length === 2 && sProperty.indexOf("/") < 0 ? !_isInNonFilterableProperties(metaModelContext, sEntitySetPath, sProperty) && !_isCustomAggregate(metaModelContext, sEntitySetPath, sProperty) : !_isContextPathFilterable(metaModelContext, sEntitySetPath, sProperty);
    // check if type can be used for filtering
    if (bIsFilterable && oNavigationContext) {
      const sPropertyDataType = getPropertyDataType(oNavigationContext);
      if (sPropertyDataType) {
        bIsFilterable = sPropertyDataType ? isTypeFilterable(sPropertyDataType) : false;
      } else {
        bIsFilterable = false;
      }
    }
    return bIsFilterable;
  }
  function getShellServices(oControl) {
    return getAppComponent(oControl).getShellServices();
  }
  function getHash() {
    const sHash = window.location.hash;
    return sHash.split("&")[0];
  }
  async function _getSOIntents(oShellServiceHelper, oObjectPageLayout, oSemanticObject, oParam) {
    return oShellServiceHelper.getLinks({
      semanticObject: oSemanticObject,
      params: oParam
    });
  }

  // TO-DO add this as part of applySemanticObjectmappings logic in IntentBasednavigation controller extension
  function _createMappings(oMapping) {
    const aSOMappings = [];
    const aMappingKeys = Object.keys(oMapping);
    let oSemanticMapping;
    for (let i = 0; i < aMappingKeys.length; i++) {
      oSemanticMapping = {
        LocalProperty: {
          $PropertyPath: aMappingKeys[i]
        },
        SemanticObjectProperty: oMapping[aMappingKeys[i]]
      };
      aSOMappings.push(oSemanticMapping);
    }
    return aSOMappings;
  }
  /**
   * @param aLinks
   * @param aExcludedActions
   * @param oTargetParams
   * @param aItems
   * @param aAllowedActions
   */
  function _getRelatedAppsMenuItems(aLinks, aExcludedActions, oTargetParams, aItems, aAllowedActions) {
    for (let i = 0; i < aLinks.length; i++) {
      const oLink = aLinks[i];
      const sIntent = oLink.intent;
      const sAction = sIntent.split("-")[1].split("?")[0];
      if (aAllowedActions && aAllowedActions.includes(sAction)) {
        aItems.push({
          text: oLink.text,
          targetSemObject: sIntent.split("#")[1].split("-")[0],
          targetAction: sAction.split("~")[0],
          targetParams: oTargetParams
        });
      } else if (!aAllowedActions && aExcludedActions && aExcludedActions.indexOf(sAction) === -1) {
        aItems.push({
          text: oLink.text,
          targetSemObject: sIntent.split("#")[1].split("-")[0],
          targetAction: sAction.split("~")[0],
          targetParams: oTargetParams
        });
      }
    }
  }
  function _getRelatedIntents(oAdditionalSemanticObjects, oBindingContext, aManifestSOItems, aLinks) {
    if (aLinks && aLinks.length > 0) {
      const aAllowedActions = oAdditionalSemanticObjects.allowedActions || undefined;
      const aExcludedActions = oAdditionalSemanticObjects.unavailableActions ? oAdditionalSemanticObjects.unavailableActions : [];
      const aSOMappings = oAdditionalSemanticObjects.mapping ? _createMappings(oAdditionalSemanticObjects.mapping) : [];
      const oTargetParams = {
        navigationContexts: oBindingContext,
        semanticObjectMapping: aSOMappings
      };
      _getRelatedAppsMenuItems(aLinks, aExcludedActions, oTargetParams, aManifestSOItems, aAllowedActions);
    }
  }
  async function updateRelateAppsModel(oBindingContext, oEntry, oObjectPageLayout, aSemKeys, oMetaModel, oMetaPath) {
    const oShellServiceHelper = getShellServices(oObjectPageLayout);
    const oParam = {};
    let sCurrentSemObj = "",
      sCurrentAction = "";
    let oSemanticObjectAnnotations;
    let aRelatedAppsMenuItems = [];
    let aExcludedActions = [];
    let aManifestSOKeys;
    async function fnGetParseShellHashAndGetLinks() {
      const oParsedUrl = oShellServiceHelper.parseShellHash(document.location.hash);
      sCurrentSemObj = oParsedUrl.semanticObject; // Current Semantic Object
      sCurrentAction = oParsedUrl.action;
      return _getSOIntents(oShellServiceHelper, oObjectPageLayout, sCurrentSemObj, oParam);
    }
    try {
      if (oEntry) {
        if (aSemKeys && aSemKeys.length > 0) {
          for (let j = 0; j < aSemKeys.length; j++) {
            const sSemKey = aSemKeys[j].$PropertyPath;
            if (!oParam[sSemKey]) {
              oParam[sSemKey] = {
                value: oEntry[sSemKey]
              };
            }
          }
        } else {
          // fallback to Technical Keys if no Semantic Key is present
          const aTechnicalKeys = oMetaModel.getObject(`${oMetaPath}/$Type/$Key`);
          for (const key in aTechnicalKeys) {
            const sObjKey = aTechnicalKeys[key];
            if (!oParam[sObjKey]) {
              oParam[sObjKey] = {
                value: oEntry[sObjKey]
              };
            }
          }
        }
      }
      // Logic to read additional SO from manifest and updated relatedapps model

      const oManifestData = getTargetView(oObjectPageLayout).getViewData();
      const aManifestSOItems = [];
      let semanticObjectIntents;
      if (oManifestData.additionalSemanticObjects) {
        aManifestSOKeys = Object.keys(oManifestData.additionalSemanticObjects);
        for (let key = 0; key < aManifestSOKeys.length; key++) {
          semanticObjectIntents = await Promise.resolve(_getSOIntents(oShellServiceHelper, oObjectPageLayout, aManifestSOKeys[key], oParam));
          _getRelatedIntents(oManifestData.additionalSemanticObjects[aManifestSOKeys[key]], oBindingContext, aManifestSOItems, semanticObjectIntents);
        }
      }
      const internalModelContext = oObjectPageLayout.getBindingContext("internal");
      const aLinks = await fnGetParseShellHashAndGetLinks();
      if (aLinks) {
        if (aLinks.length > 0) {
          var _oManifestData$additi;
          let isSemanticObjectHasSameTargetInManifest = false;
          const oTargetParams = {};
          const aAnnotationsSOItems = [];
          const sEntitySetPath = `${oMetaPath}@`;
          const sEntityTypePath = `${oMetaPath}/@`;
          const oEntitySetAnnotations = oMetaModel.getObject(sEntitySetPath);
          oSemanticObjectAnnotations = CommonUtils.getSemanticObjectAnnotations(oEntitySetAnnotations, sCurrentSemObj);
          if (!oSemanticObjectAnnotations.bHasEntitySetSO) {
            const oEntityTypeAnnotations = oMetaModel.getObject(sEntityTypePath);
            oSemanticObjectAnnotations = CommonUtils.getSemanticObjectAnnotations(oEntityTypeAnnotations, sCurrentSemObj);
          }
          aExcludedActions = oSemanticObjectAnnotations.aUnavailableActions;
          //Skip same application from Related Apps
          aExcludedActions.push(sCurrentAction);
          oTargetParams.navigationContexts = oBindingContext;
          oTargetParams.semanticObjectMapping = oSemanticObjectAnnotations.aMappings;
          _getRelatedAppsMenuItems(aLinks, aExcludedActions, oTargetParams, aAnnotationsSOItems);
          aManifestSOItems.forEach(function (_ref) {
            let {
              targetSemObject
            } = _ref;
            if (aAnnotationsSOItems[0].targetSemObject === targetSemObject) {
              isSemanticObjectHasSameTargetInManifest = true;
            }
          });

          // remove all actions from current hash application if manifest contains empty allowedActions
          if (oManifestData.additionalSemanticObjects && oManifestData.additionalSemanticObjects[aAnnotationsSOItems[0].targetSemObject] && ((_oManifestData$additi = oManifestData.additionalSemanticObjects[aAnnotationsSOItems[0].targetSemObject].allowedActions) === null || _oManifestData$additi === void 0 ? void 0 : _oManifestData$additi.length) === 0) {
            isSemanticObjectHasSameTargetInManifest = true;
          }
          aRelatedAppsMenuItems = isSemanticObjectHasSameTargetInManifest ? aManifestSOItems : aManifestSOItems.concat(aAnnotationsSOItems);
          // If no app in list, related apps button will be hidden
          internalModelContext.setProperty("relatedApps/visibility", aRelatedAppsMenuItems.length > 0);
          internalModelContext.setProperty("relatedApps/items", aRelatedAppsMenuItems);
        } else {
          internalModelContext.setProperty("relatedApps/visibility", false);
        }
      } else {
        internalModelContext.setProperty("relatedApps/visibility", false);
      }
    } catch (error) {
      Log.error("Cannot read links", error);
    }
    return aRelatedAppsMenuItems;
  }
  function _getSemanticObjectAnnotations(oEntityAnnotations, sCurrentSemObj) {
    const oSemanticObjectAnnotations = {
      bHasEntitySetSO: false,
      aAllowedActions: [],
      aUnavailableActions: [],
      aMappings: []
    };
    let sAnnotationMappingTerm, sAnnotationActionTerm;
    let sQualifier;
    for (const key in oEntityAnnotations) {
      if (key.indexOf("com.sap.vocabularies.Common.v1.SemanticObject") > -1 && oEntityAnnotations[key] === sCurrentSemObj) {
        oSemanticObjectAnnotations.bHasEntitySetSO = true;
        sAnnotationMappingTerm = `@${"com.sap.vocabularies.Common.v1.SemanticObjectMapping"}`;
        sAnnotationActionTerm = `@${"com.sap.vocabularies.Common.v1.SemanticObjectUnavailableActions"}`;
        if (key.indexOf("#") > -1) {
          sQualifier = key.split("#")[1];
          sAnnotationMappingTerm = `${sAnnotationMappingTerm}#${sQualifier}`;
          sAnnotationActionTerm = `${sAnnotationActionTerm}#${sQualifier}`;
        }
        if (oEntityAnnotations[sAnnotationMappingTerm]) {
          oSemanticObjectAnnotations.aMappings = oSemanticObjectAnnotations.aMappings.concat(oEntityAnnotations[sAnnotationMappingTerm]);
        }
        if (oEntityAnnotations[sAnnotationActionTerm]) {
          oSemanticObjectAnnotations.aUnavailableActions = oSemanticObjectAnnotations.aUnavailableActions.concat(oEntityAnnotations[sAnnotationActionTerm]);
        }
        break;
      }
    }
    return oSemanticObjectAnnotations;
  }
  function fnUpdateRelatedAppsDetails(oObjectPageLayout) {
    const oMetaModel = oObjectPageLayout.getModel().getMetaModel();
    const oBindingContext = oObjectPageLayout.getBindingContext();
    const path = oBindingContext && oBindingContext.getPath() || "";
    const oMetaPath = oMetaModel.getMetaPath(path);
    // Semantic Key Vocabulary
    const sSemanticKeyVocabulary = `${oMetaPath}/` + `@com.sap.vocabularies.Common.v1.SemanticKey`;
    //Semantic Keys
    const aSemKeys = oMetaModel.getObject(sSemanticKeyVocabulary);
    // Unavailable Actions
    const oEntry = oBindingContext === null || oBindingContext === void 0 ? void 0 : oBindingContext.getObject();
    if (!oEntry && oBindingContext) {
      oBindingContext.requestObject().then(async function (requestedObject) {
        return updateRelateAppsModel(oBindingContext, requestedObject, oObjectPageLayout, aSemKeys, oMetaModel, oMetaPath);
      }).catch(function (oError) {
        Log.error("Cannot update the related app details", oError);
      });
    } else {
      return updateRelateAppsModel(oBindingContext, oEntry, oObjectPageLayout, aSemKeys, oMetaModel, oMetaPath);
    }
  }

  /**
   * @param oButton
   */
  function fnFireButtonPress(oButton) {
    if (oButton && oButton.isA(["sap.m.Button", "sap.m.OverflowToolbarButton"]) && oButton.getVisible() && oButton.getEnabled()) {
      oButton.firePress();
    }
  }
  function fnResolveStringtoBoolean(sValue) {
    if (sValue === "true" || sValue === true) {
      return true;
    } else {
      return false;
    }
  }
  function getAppComponent(oControl) {
    if (oControl.isA("sap.fe.core.AppComponent")) {
      return oControl;
    }
    const oOwner = Component.getOwnerComponentFor(oControl);
    if (!oOwner) {
      throw new Error("There should be a sap.fe.core.AppComponent as owner of the control");
    } else {
      return getAppComponent(oOwner);
    }
  }
  function getCurrentPageView(oAppComponent) {
    const rootViewController = oAppComponent.getRootViewController();
    return rootViewController.isFclEnabled() ? rootViewController.getRightmostView() : CommonUtils.getTargetView(oAppComponent.getRootContainer().getCurrentPage());
  }
  function getTargetView(oControl) {
    if (oControl && oControl.isA("sap.ui.core.ComponentContainer")) {
      const oComponent = oControl.getComponentInstance();
      oControl = oComponent && oComponent.getRootControl();
    }
    while (oControl && !oControl.isA("sap.ui.core.mvc.View")) {
      oControl = oControl.getParent();
    }
    return oControl;
  }
  function isFieldControlPathInapplicable(sFieldControlPath, oAttribute) {
    let bInapplicable = false;
    const aParts = sFieldControlPath.split("/");
    // sensitive data is removed only if the path has already been resolved.
    if (aParts.length > 1) {
      bInapplicable = oAttribute[aParts[0]] !== undefined && oAttribute[aParts[0]].hasOwnProperty(aParts[1]) && oAttribute[aParts[0]][aParts[1]] === 0;
    } else {
      bInapplicable = oAttribute[sFieldControlPath] === 0;
    }
    return bInapplicable;
  }
  function removeSensitiveData(aAttributes, oMetaModel) {
    const aOutAttributes = [];
    for (let i = 0; i < aAttributes.length; i++) {
      const sEntitySet = aAttributes[i].entitySet,
        oAttribute = aAttributes[i].contextData;
      delete oAttribute["@odata.context"];
      delete oAttribute["%40odata.context"];
      delete oAttribute["@odata.metadataEtag"];
      delete oAttribute["%40odata.metadataEtag"];
      delete oAttribute["SAP__Messages"];
      const aProperties = Object.keys(oAttribute);
      for (let j = 0; j < aProperties.length; j++) {
        const sProp = aProperties[j],
          aPropertyAnnotations = oMetaModel.getObject(`/${sEntitySet}/${sProp}@`);
        if (aPropertyAnnotations) {
          if (aPropertyAnnotations["@com.sap.vocabularies.PersonalData.v1.IsPotentiallySensitive"] || aPropertyAnnotations["@com.sap.vocabularies.UI.v1.ExcludeFromNavigationContext"] || aPropertyAnnotations["@com.sap.vocabularies.Analytics.v1.Measure"]) {
            delete oAttribute[sProp];
          } else if (aPropertyAnnotations["@com.sap.vocabularies.Common.v1.FieldControl"]) {
            const oFieldControl = aPropertyAnnotations["@com.sap.vocabularies.Common.v1.FieldControl"];
            if (oFieldControl["$EnumMember"] && oFieldControl["$EnumMember"].split("/")[1] === "Inapplicable") {
              delete oAttribute[sProp];
            } else if (oFieldControl["$Path"] && CommonUtils.isFieldControlPathInapplicable(oFieldControl["$Path"], oAttribute)) {
              delete oAttribute[sProp];
            }
          }
        }
      }
      aOutAttributes.push(oAttribute);
    }
    return aOutAttributes;
  }
  function _fnCheckIsMatch(oObject, oKeysToCheck) {
    for (const sKey in oKeysToCheck) {
      if (oKeysToCheck[sKey] !== oObject[sKey]) {
        return false;
      }
    }
    return true;
  }
  function fnGetContextPathProperties(metaModelContext, sContextPath, oFilter) {
    const oEntityType = metaModelContext.getObject(`${sContextPath}/`) || {},
      oProperties = {};
    for (const sKey in oEntityType) {
      if (oEntityType.hasOwnProperty(sKey) && !/^\$/i.test(sKey) && oEntityType[sKey].$kind && _fnCheckIsMatch(oEntityType[sKey], oFilter || {
        $kind: "Property"
      })) {
        oProperties[sKey] = oEntityType[sKey];
      }
    }
    return oProperties;
  }
  function fnGetMandatoryFilterFields(oMetaModel, sContextPath) {
    let aMandatoryFilterFields = [];
    if (oMetaModel && sContextPath) {
      aMandatoryFilterFields = oMetaModel.getObject(`${sContextPath}@Org.OData.Capabilities.V1.FilterRestrictions/RequiredProperties`);
    }
    return aMandatoryFilterFields;
  }
  function fnGetIBNActions(oControl, aIBNActions) {
    const aActions = oControl && oControl.getActions();
    if (aActions) {
      aActions.forEach(function (oAction) {
        if (oAction.isA("sap.ui.mdc.actiontoolbar.ActionToolbarAction")) {
          oAction = oAction.getAction();
        }
        if (oAction.isA("sap.m.MenuButton")) {
          const oMenu = oAction.getMenu();
          const aItems = oMenu.getItems();
          aItems.forEach(oItem => {
            if (oItem.data("IBNData")) {
              aIBNActions.push(oItem);
            }
          });
        } else if (oAction.data("IBNData")) {
          aIBNActions.push(oAction);
        }
      });
    }
    return aIBNActions;
  }

  /**
   * @param aIBNActions
   * @param oView
   */
  function fnUpdateDataFieldForIBNButtonsVisibility(aIBNActions, oView) {
    const oParams = {};
    const isSticky = ModelHelper.isStickySessionSupported(oView.getModel().getMetaModel());
    const fnGetLinks = function (oData) {
      if (oData) {
        const aKeys = Object.keys(oData);
        aKeys.forEach(function (sKey) {
          if (sKey.indexOf("_") !== 0 && sKey.indexOf("odata.context") === -1) {
            oParams[sKey] = {
              value: oData[sKey]
            };
          }
        });
      }
      if (aIBNActions.length) {
        aIBNActions.forEach(function (oIBNAction) {
          const sSemanticObject = oIBNAction.data("IBNData").semanticObject;
          const sAction = oIBNAction.data("IBNData").action;
          CommonUtils.getShellServices(oView).getLinks({
            semanticObject: sSemanticObject,
            action: sAction,
            params: oParams
          }).then(function (aLink) {
            oIBNAction.setVisible(oIBNAction.getVisible() && aLink && aLink.length === 1);
            if (isSticky) {
              oIBNAction.getBindingContext("internal").setProperty(oIBNAction.getId().split("--")[1], {
                shellNavigationNotAvailable: !(aLink && aLink.length === 1)
              });
            }
          }).catch(function (oError) {
            Log.error("Cannot retrieve the links from the shell service", oError);
          });
        });
      }
    };
    if (oView && oView.getBindingContext()) {
      var _oView$getBindingCont;
      (_oView$getBindingCont = oView.getBindingContext()) === null || _oView$getBindingCont === void 0 ? void 0 : _oView$getBindingCont.requestObject().then(function (oData) {
        return fnGetLinks(oData);
      }).catch(function (oError) {
        Log.error("Cannot retrieve the links from the shell service", oError);
      });
    } else {
      fnGetLinks();
    }
  }
  function getTranslatedText(sFrameworkKey, oResourceBundle, parameters, sEntitySetName) {
    let sResourceKey = sFrameworkKey;
    if (oResourceBundle) {
      if (sEntitySetName) {
        // There are console errors logged when making calls to getText for keys that are not defined in the resource bundle
        // for instance keys which are supposed to be provided by the application, e.g, <key>|<entitySet> to override instance specific text
        // hence check if text exists (using "hasText") in the resource bundle before calling "getText"

        // "hasText" only checks for the key in the immediate resource bundle and not it's custom bundles
        // hence we need to do this recurrsively to check if the key exists in any of the bundles the forms the FE resource bundle
        const bResourceKeyExists = checkIfResourceKeyExists(oResourceBundle.aCustomBundles, `${sFrameworkKey}|${sEntitySetName}`);

        // if resource key with entity set name for instance specific text overriding is provided by the application
        // then use the same key otherwise use the Framework key
        sResourceKey = bResourceKeyExists ? `${sFrameworkKey}|${sEntitySetName}` : sFrameworkKey;
      }
      return oResourceBundle.getText(sResourceKey, parameters);
    }

    // do not allow override so get text from the internal bundle directly
    oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core");
    return oResourceBundle.getText(sResourceKey, parameters);
  }
  function checkIfResourceKeyExists(aCustomBundles, sKey) {
    if (aCustomBundles.length) {
      for (let i = aCustomBundles.length - 1; i >= 0; i--) {
        const sValue = aCustomBundles[i].hasText(sKey);
        // text found return true
        if (sValue) {
          return true;
        }
        checkIfResourceKeyExists(aCustomBundles[i].aCustomBundles, sKey);
      }
    }
    return false;
  }
  function getActionPath(actionContext, bReturnOnlyPath, sActionName, bCheckStaticValue) {
    sActionName = !sActionName ? actionContext.getObject(actionContext.getPath()).toString() : sActionName;
    let sContextPath = actionContext.getPath().split("/@")[0];
    const sEntityTypeName = actionContext.getObject(sContextPath).$Type;
    const sEntityName = getEntitySetName(actionContext.getModel(), sEntityTypeName);
    if (sEntityName) {
      sContextPath = `/${sEntityName}`;
    }
    if (bCheckStaticValue) {
      return actionContext.getObject(`${sContextPath}/${sActionName}@Org.OData.Core.V1.OperationAvailable`);
    }
    if (bReturnOnlyPath) {
      return `${sContextPath}/${sActionName}`;
    } else {
      return {
        sContextPath: sContextPath,
        sProperty: actionContext.getObject(`${sContextPath}/${sActionName}@Org.OData.Core.V1.OperationAvailable/$Path`),
        sBindingParameter: actionContext.getObject(`${sContextPath}/${sActionName}/@$ui5.overload/0/$Parameter/0/$Name`)
      };
    }
  }
  function getEntitySetName(oMetaModel, sEntityType) {
    const oEntityContainer = oMetaModel.getObject("/");
    for (const key in oEntityContainer) {
      if (typeof oEntityContainer[key] === "object" && oEntityContainer[key].$Type === sEntityType) {
        return key;
      }
    }
  }
  function computeDisplayMode(oPropertyAnnotations, oCollectionAnnotations) {
    const oTextAnnotation = oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"],
      oTextArrangementAnnotation = oTextAnnotation && (oPropertyAnnotations && oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement"] || oCollectionAnnotations && oCollectionAnnotations["@com.sap.vocabularies.UI.v1.TextArrangement"]);
    if (oTextArrangementAnnotation) {
      if (oTextArrangementAnnotation.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly") {
        return "Description";
      } else if (oTextArrangementAnnotation.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextLast") {
        return "ValueDescription";
      } else if (oTextArrangementAnnotation.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextSeparate") {
        return "Value";
      }
      //Default should be TextFirst if there is a Text annotation and neither TextOnly nor TextLast are set
      return "DescriptionValue";
    }
    return oTextAnnotation ? "DescriptionValue" : "Value";
  }
  function _getEntityType(oContext) {
    const oMetaModel = oContext.getModel().getMetaModel();
    return oMetaModel.getObject(`${oMetaModel.getMetaPath(oContext.getPath())}/$Type`);
  }
  async function _requestObject(sAction, oSelectedContext, sProperty) {
    let oContext = oSelectedContext;
    const nBracketIndex = sAction.indexOf("(");
    if (nBracketIndex > -1) {
      const sTargetType = sAction.slice(nBracketIndex + 1, -1);
      let sCurrentType = _getEntityType(oContext);
      while (sCurrentType !== sTargetType) {
        // Find parent binding context and retrieve entity type
        oContext = oContext.getBinding().getContext();
        if (oContext) {
          sCurrentType = _getEntityType(oContext);
        } else {
          Log.warning("Cannot determine target type to request property value for bound action invocation");
          return Promise.resolve(undefined);
        }
      }
    }
    return oContext.requestObject(sProperty);
  }
  async function requestProperty(oSelectedContext, sAction, sProperty, sDynamicActionEnabledPath) {
    const oPromise = sProperty && sProperty.indexOf("/") === 0 ? requestSingletonProperty(sProperty, oSelectedContext.getModel()) : _requestObject(sAction, oSelectedContext, sProperty);
    return oPromise.then(async function (vPropertyValue) {
      return Promise.resolve({
        vPropertyValue: vPropertyValue,
        oSelectedContext: oSelectedContext,
        sAction: sAction,
        sDynamicActionEnabledPath: sDynamicActionEnabledPath
      });
    });
  }
  async function setContextsBasedOnOperationAvailable(oInternalModelContext, aRequestPromises) {
    return Promise.all(aRequestPromises).then(function (aResults) {
      if (aResults.length) {
        const aApplicableContexts = [],
          aNotApplicableContexts = [];
        aResults.forEach(function (aResult) {
          if (aResult) {
            if (aResult.vPropertyValue) {
              oInternalModelContext.getModel().setProperty(aResult.sDynamicActionEnabledPath, true);
              aApplicableContexts.push(aResult.oSelectedContext);
            } else {
              aNotApplicableContexts.push(aResult.oSelectedContext);
            }
          }
        });
        setDynamicActionContexts(oInternalModelContext, aResults[0].sAction, aApplicableContexts, aNotApplicableContexts);
      }
    }).catch(function (oError) {
      Log.trace("Cannot retrieve property value from path", oError);
    });
  }

  /**
   * @param oInternalModelContext
   * @param sAction
   * @param aApplicable
   * @param aNotApplicable
   */
  function setDynamicActionContexts(oInternalModelContext, sAction, aApplicable, aNotApplicable) {
    const sDynamicActionPathPrefix = `${oInternalModelContext.getPath()}/dynamicActions/${sAction}`,
      oInternalModel = oInternalModelContext.getModel();
    oInternalModel.setProperty(`${sDynamicActionPathPrefix}/aApplicable`, aApplicable);
    oInternalModel.setProperty(`${sDynamicActionPathPrefix}/aNotApplicable`, aNotApplicable);
  }
  function _getDefaultOperators(sPropertyType) {
    // mdc defines the full set of operations that are meaningful for each Edm Type
    // TODO Replace with model / internal way of retrieving the actual model type used for the property
    const oDataClass = TypeUtil.getDataTypeClassName(sPropertyType);
    // TODO need to pass proper formatOptions, constraints here
    const oBaseType = TypeUtil.getBaseType(oDataClass, {}, {});
    return FilterOperatorUtil.getOperatorsForType(oBaseType);
  }
  function _getRestrictions(aDefaultOps, aExpressionOps) {
    // From the default set of Operators for the Base Type, select those that are defined in the Allowed Value.
    // In case that no operators are found, return undefined so that the default set is used.
    return aDefaultOps.filter(function (sElement) {
      return aExpressionOps.indexOf(sElement) > -1;
    });
  }
  function getSpecificAllowedExpression(aExpressions) {
    const aAllowedExpressionsPriority = CommonUtils.AllowedExpressionsPrio;
    aExpressions.sort(function (a, b) {
      return aAllowedExpressionsPriority.indexOf(a) - aAllowedExpressionsPriority.indexOf(b);
    });
    return aExpressions[0];
  }

  /**
   * Method to fetch the correct operators based on the filter restrictions that can be annotated on an entity set or a navigation property.
   * We return the correct operators based on the specified restriction and also check for the operators defined in the manifest to include or exclude them.
   *
   * @param sProperty String name of the property
   * @param sEntitySetPath String path to the entity set
   * @param oContext Context used during templating
   * @param sType String data type od the property, for example edm.Date
   * @param bUseSemanticDateRange Boolean passed from the manifest for semantic date range
   * @param sSettings Stringified object of the property settings
   * @returns An array of strings representing operators for filtering
   */
  function getOperatorsForProperty(sProperty, sEntitySetPath, oContext, sType, bUseSemanticDateRange, sSettings) {
    const oFilterRestrictions = CommonUtils.getFilterRestrictionsByPath(sEntitySetPath, oContext);
    const aEqualsOps = ["EQ"];
    const aSingleRangeOps = ["EQ", "GE", "LE", "LT", "GT", "BT", "NOTLE", "NOTLT", "NOTGE", "NOTGT"];
    const aSingleRangeDTBasicOps = ["EQ", "BT"];
    const aSingleValueDateOps = ["TODAY", "TOMORROW", "YESTERDAY", "DATE", "FIRSTDAYWEEK", "LASTDAYWEEK", "FIRSTDAYMONTH", "LASTDAYMONTH", "FIRSTDAYQUARTER", "LASTDAYQUARTER", "FIRSTDAYYEAR", "LASTDAYYEAR"];
    const aBasicDateTimeOps = ["EQ", "BT"];
    const aMultiRangeOps = ["EQ", "GE", "LE", "LT", "GT", "BT", "NE", "NOTBT", "NOTLE", "NOTLT", "NOTGE", "NOTGT"];
    const aSearchExpressionOps = ["Contains", "NotContains", "StartsWith", "NotStartsWith", "EndsWith", "NotEndsWith"];
    const aSemanticDateOpsExt = SemanticDateOperators.getSupportedOperations();
    const bSemanticDateRange = bUseSemanticDateRange === "true" || bUseSemanticDateRange === true;
    let aSemanticDateOps = [];
    const oSettings = sSettings && typeof sSettings === "string" ? JSON.parse(sSettings).customData : sSettings;
    if (oContext.getObject(`${sEntitySetPath}/@com.sap.vocabularies.Common.v1.ResultContext`) === true) {
      return aEqualsOps;
    }
    if (oSettings && oSettings.operatorConfiguration && oSettings.operatorConfiguration.length > 0) {
      aSemanticDateOps = SemanticDateOperators.getFilterOperations(oSettings.operatorConfiguration);
    } else {
      aSemanticDateOps = SemanticDateOperators.getSemanticDateOperations();
    }
    // Get the default Operators for this Property Type
    let aDefaultOperators = _getDefaultOperators(sType);
    if (bSemanticDateRange) {
      aDefaultOperators = aSemanticDateOpsExt.concat(aDefaultOperators);
    }
    let restrictions = [];

    // Is there a Filter Restriction defined for this property?
    if (oFilterRestrictions && oFilterRestrictions.FilterAllowedExpressions && oFilterRestrictions.FilterAllowedExpressions[sProperty]) {
      // Extending the default operators list with Semantic Date options DATERANGE, DATE, FROM and TO
      const sAllowedExpression = CommonUtils.getSpecificAllowedExpression(oFilterRestrictions.FilterAllowedExpressions[sProperty]);
      // In case more than one Allowed Expressions has been defined for a property
      // choose the most restrictive Allowed Expression

      // MultiValue has same Operator as SingleValue, but there can be more than one (maxConditions)
      switch (sAllowedExpression) {
        case "SingleValue":
          const aSingleValueOps = sType === "Edm.Date" && bSemanticDateRange ? aSingleValueDateOps : aEqualsOps;
          restrictions = _getRestrictions(aDefaultOperators, aSingleValueOps);
          break;
        case "MultiValue":
          restrictions = _getRestrictions(aDefaultOperators, aEqualsOps);
          break;
        case "SingleRange":
          let aExpressionOps;
          if (bSemanticDateRange) {
            if (sType === "Edm.Date") {
              aExpressionOps = aSemanticDateOps;
            } else if (sType === "Edm.DateTimeOffset") {
              aExpressionOps = aSemanticDateOps.concat(aBasicDateTimeOps);
            } else {
              aExpressionOps = aSingleRangeOps;
            }
          } else if (sType === "Edm.DateTimeOffset") {
            aExpressionOps = aSingleRangeDTBasicOps;
          } else {
            aExpressionOps = aSingleRangeOps;
          }
          const sOperators = _getRestrictions(aDefaultOperators, aExpressionOps);
          restrictions = sOperators;
          break;
        case "MultiRange":
          restrictions = _getRestrictions(aDefaultOperators, aMultiRangeOps);
          break;
        case "SearchExpression":
          restrictions = _getRestrictions(aDefaultOperators, aSearchExpressionOps);
          break;
        case "MultiRangeOrSearchExpression":
          restrictions = _getRestrictions(aDefaultOperators, aSearchExpressionOps.concat(aMultiRangeOps));
          break;
        default:
          break;
      }
      // In case AllowedExpressions is not recognised, undefined in return results in the default set of
      // operators for the type.
    }

    return restrictions;
  }

  /**
   * Method to return allowed operators for type Guid.
   *
   * @function
   * @name getOperatorsForGuidProperty
   * @returns Allowed operators for type Guid
   */
  _exports.getOperatorsForProperty = getOperatorsForProperty;
  function getOperatorsForGuidProperty() {
    const allowedOperatorsForGuid = ["EQ", "NE"];
    return allowedOperatorsForGuid.toString();
  }
  function getOperatorsForDateProperty(propertyType) {
    // In case AllowedExpressions is not provided for type Edm.Date then all the default
    // operators for the type should be returned excluding semantic operators from the list.
    const aDefaultOperators = _getDefaultOperators(propertyType);
    const aMultiRangeOps = ["EQ", "GE", "LE", "LT", "GT", "BT", "NE", "NOTBT", "NOTLE", "NOTLT", "NOTGE", "NOTGT"];
    return _getRestrictions(aDefaultOperators, aMultiRangeOps);
  }
  function getParameterInfo(metaModelContext, sContextPath) {
    const sParameterContextPath = sContextPath.substring(0, sContextPath.lastIndexOf("/"));
    const bResultContext = metaModelContext.getObject(`${sParameterContextPath}/@com.sap.vocabularies.Common.v1.ResultContext`);
    const oParameterInfo = {};
    if (bResultContext && sParameterContextPath !== sContextPath) {
      oParameterInfo.contextPath = sParameterContextPath;
      oParameterInfo.parameterProperties = CommonUtils.getContextPathProperties(metaModelContext, sParameterContextPath);
    }
    return oParameterInfo;
  }

  /**
   * Method to add the select Options to filter conditions.
   *
   * @function
   * @name addSelectOptionToConditions
   * @param oPropertyMetadata Property metadata information
   * @param aValidOperators Operators for all the data types
   * @param aSemanticDateOperators Operators for the Date type
   * @param aCumulativeConditions Filter conditions
   * @param oSelectOption Selectoption of selection variant
   * @returns The filter conditions
   */
  function addSelectOptionToConditions(oPropertyMetadata, aValidOperators, aSemanticDateOperators, aCumulativeConditions, oSelectOption) {
    var _oSelectOption$Semant;
    const oCondition = getConditions(oSelectOption, oPropertyMetadata);
    if (oSelectOption !== null && oSelectOption !== void 0 && oSelectOption.SemanticDates && aSemanticDateOperators && aSemanticDateOperators.indexOf(oSelectOption === null || oSelectOption === void 0 ? void 0 : (_oSelectOption$Semant = oSelectOption.SemanticDates) === null || _oSelectOption$Semant === void 0 ? void 0 : _oSelectOption$Semant.operator) > -1) {
      const semanticDates = CommonUtils.addSemanticDatesToConditions(oSelectOption === null || oSelectOption === void 0 ? void 0 : oSelectOption.SemanticDates);
      if (semanticDates && Object.keys(semanticDates).length > 0) {
        aCumulativeConditions.push(semanticDates);
      }
    } else if (oCondition) {
      if (aValidOperators.length === 0 || aValidOperators.indexOf(oCondition.operator) > -1) {
        aCumulativeConditions.push(oCondition);
      }
    }
    return aCumulativeConditions;
  }

  /**
   * Method to add the semantic dates to filter conditions
   *
   * @function
   * @name addSemanticDatesToConditions
   * @param oSemanticDates Semantic date infomation
   * @returns The filter conditions containing semantic dates
   */

  function addSemanticDatesToConditions(oSemanticDates) {
    const values = [];
    if (oSemanticDates !== null && oSemanticDates !== void 0 && oSemanticDates.high) {
      values.push(oSemanticDates === null || oSemanticDates === void 0 ? void 0 : oSemanticDates.high);
    }
    if (oSemanticDates !== null && oSemanticDates !== void 0 && oSemanticDates.low) {
      values.push(oSemanticDates === null || oSemanticDates === void 0 ? void 0 : oSemanticDates.low);
    }
    return {
      values: values,
      operator: oSemanticDates === null || oSemanticDates === void 0 ? void 0 : oSemanticDates.operator,
      isEmpty: undefined
    };
  }
  function addSelectOptionsToConditions(sContextPath, oSelectionVariant, sSelectOptionProp, oConditions, sConditionPath, sConditionProp, oValidProperties, metaModelContext, isParameter, bIsFLPValuePresent, bUseSemanticDateRange, oViewData) {
    let aConditions = [],
      aSelectOptions,
      aValidOperators,
      aSemanticDateOperators = [];
    if (isParameter || CommonUtils.isPropertyFilterable(metaModelContext, sContextPath, sConditionProp, true)) {
      const oPropertyMetadata = oValidProperties[sConditionProp];
      aSelectOptions = oSelectionVariant.getSelectOption(sSelectOptionProp);
      const settings = getFilterConfigurationSetting(oViewData, sConditionProp);
      aValidOperators = isParameter ? ["EQ"] : CommonUtils.getOperatorsForProperty(sConditionProp, sContextPath, metaModelContext);
      if (bUseSemanticDateRange) {
        aSemanticDateOperators = isParameter ? ["EQ"] : CommonUtils.getOperatorsForProperty(sConditionProp, sContextPath, metaModelContext, oPropertyMetadata === null || oPropertyMetadata === void 0 ? void 0 : oPropertyMetadata.$Type, bUseSemanticDateRange, settings);
      }
      // Create conditions for all the selectOptions of the property
      aConditions = isParameter ? CommonUtils.addSelectOptionToConditions(oPropertyMetadata, aValidOperators, aSemanticDateOperators, aConditions, aSelectOptions[0]) : aSelectOptions.reduce(CommonUtils.addSelectOptionToConditions.bind(null, oPropertyMetadata, aValidOperators, aSemanticDateOperators), aConditions);
      if (aConditions.length) {
        if (sConditionPath) {
          oConditions[sConditionPath + sConditionProp] = oConditions.hasOwnProperty(sConditionPath + sConditionProp) ? oConditions[sConditionPath + sConditionProp].concat(aConditions) : aConditions;
        } else if (bIsFLPValuePresent) {
          // If FLP values are present replace it with FLP values
          aConditions.forEach(element => {
            element["filtered"] = true;
          });
          if (oConditions.hasOwnProperty(sConditionProp)) {
            oConditions[sConditionProp].forEach(element => {
              element["filtered"] = false;
            });
            oConditions[sConditionProp] = oConditions[sConditionProp].concat(aConditions);
          } else {
            oConditions[sConditionProp] = aConditions;
          }
        } else {
          oConditions[sConditionProp] = oConditions.hasOwnProperty(sConditionProp) ? oConditions[sConditionProp].concat(aConditions) : aConditions;
        }
      }
    }
  }

  /**
   * Method to create the semantic dates from filter conditions
   *
   * @function
   * @name createSemanticDatesFromConditions
   * @param oCondition Filter field condition
   * @param sFilterName Filter Field Path
   * @returns The Semantic date conditions
   */

  function createSemanticDatesFromConditions(oCondition) {
    var _oCondition$values, _oCondition$values2;
    return {
      high: (oCondition === null || oCondition === void 0 ? void 0 : (_oCondition$values = oCondition.values) === null || _oCondition$values === void 0 ? void 0 : _oCondition$values[0]) || null,
      low: (oCondition === null || oCondition === void 0 ? void 0 : (_oCondition$values2 = oCondition.values) === null || _oCondition$values2 === void 0 ? void 0 : _oCondition$values2[1]) || null,
      operator: oCondition === null || oCondition === void 0 ? void 0 : oCondition.operator
    };
  }

  /**
   * Method to Return the filter configuration
   *
   * @function
   * @name getFilterConfigurationSetting
   * @param oViewData manifest Configuration
   * @param sProperty Filter Field Path
   * @returns The Filter Field Configuration
   */

  function getFilterConfigurationSetting() {
    var _oConfig$ComSapVoc, _filterConfig$sProper;
    let oViewData = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    let sProperty = arguments.length > 1 ? arguments[1] : undefined;
    const oConfig = oViewData === null || oViewData === void 0 ? void 0 : oViewData.controlConfiguration;
    const filterConfig = oConfig && ((_oConfig$ComSapVoc = oConfig["@com.sap.vocabularies.UI.v1.SelectionFields"]) === null || _oConfig$ComSapVoc === void 0 ? void 0 : _oConfig$ComSapVoc.filterFields);
    return filterConfig !== null && filterConfig !== void 0 && filterConfig[sProperty] ? (_filterConfig$sProper = filterConfig[sProperty]) === null || _filterConfig$sProper === void 0 ? void 0 : _filterConfig$sProper.settings : undefined;
  }
  function addSelectionVariantToConditions(oSelectionVariant, oConditions, oMetaModelContext, sContextPath, bIsFLPValues, bUseSemanticDateRange, oViewData) {
    const aSelectOptionsPropertyNames = oSelectionVariant.getSelectOptionsPropertyNames(),
      oValidProperties = CommonUtils.getContextPathProperties(oMetaModelContext, sContextPath),
      aMetadatProperties = Object.keys(oValidProperties),
      oParameterInfo = CommonUtils.getParameterInfo(oMetaModelContext, sContextPath),
      sParameterContextPath = oParameterInfo.contextPath,
      oValidParameterProperties = oParameterInfo.parameterProperties;
    if (sParameterContextPath !== undefined && oValidParameterProperties && Object.keys(oValidParameterProperties).length > 0) {
      const aMetadataParameters = Object.keys(oValidParameterProperties);
      aMetadataParameters.forEach(function (sMetadataParameter) {
        let sSelectOptionName;
        if (aSelectOptionsPropertyNames.includes(`$Parameter.${sMetadataParameter}`)) {
          sSelectOptionName = `$Parameter.${sMetadataParameter}`;
        } else if (aSelectOptionsPropertyNames.includes(sMetadataParameter)) {
          sSelectOptionName = sMetadataParameter;
        } else if (sMetadataParameter.startsWith("P_") && aSelectOptionsPropertyNames.includes(`$Parameter.${sMetadataParameter.slice(2, sMetadataParameter.length)}`)) {
          sSelectOptionName = `$Parameter.${sMetadataParameter.slice(2, sMetadataParameter.length)}`;
        } else if (sMetadataParameter.startsWith("P_") && aSelectOptionsPropertyNames.includes(sMetadataParameter.slice(2, sMetadataParameter.length))) {
          sSelectOptionName = sMetadataParameter.slice(2, sMetadataParameter.length);
        } else if (aSelectOptionsPropertyNames.includes(`$Parameter.P_${sMetadataParameter}`)) {
          sSelectOptionName = `$Parameter.P_${sMetadataParameter}`;
        } else if (aSelectOptionsPropertyNames.includes(`P_${sMetadataParameter}`)) {
          sSelectOptionName = `P_${sMetadataParameter}`;
        }
        if (sSelectOptionName) {
          addSelectOptionsToConditions(sParameterContextPath, oSelectionVariant, sSelectOptionName, oConditions, undefined, sMetadataParameter, oValidParameterProperties, oMetaModelContext, true, bIsFLPValues, bUseSemanticDateRange, oViewData);
        }
      });
    }
    aMetadatProperties.forEach(function (sMetadataProperty) {
      let sSelectOptionName;
      if (aSelectOptionsPropertyNames.includes(sMetadataProperty)) {
        sSelectOptionName = sMetadataProperty;
      } else if (sMetadataProperty.startsWith("P_") && aSelectOptionsPropertyNames.includes(sMetadataProperty.slice(2, sMetadataProperty.length))) {
        sSelectOptionName = sMetadataProperty.slice(2, sMetadataProperty.length);
      } else if (aSelectOptionsPropertyNames.includes(`P_${sMetadataProperty}`)) {
        sSelectOptionName = `P_${sMetadataProperty}`;
      }
      if (sSelectOptionName) {
        addSelectOptionsToConditions(sContextPath, oSelectionVariant, sSelectOptionName, oConditions, undefined, sMetadataProperty, oValidProperties, oMetaModelContext, false, bIsFLPValues, bUseSemanticDateRange, oViewData);
      }
    });
    aSelectOptionsPropertyNames.forEach(function (sSelectOption) {
      if (sSelectOption.indexOf(".") > 0 && !sSelectOption.includes("$Parameter")) {
        const sReplacedOption = sSelectOption.replaceAll(".", "/");
        const sFullContextPath = `/${sReplacedOption}`.startsWith(sContextPath) ? `/${sReplacedOption}` : `${sContextPath}/${sReplacedOption}`; // check if the full path, eg SalesOrderManage._Item.Material exists in the metamodel
        if (oMetaModelContext.getObject(sFullContextPath.replace("P_", ""))) {
          _createConditionsForNavProperties(sFullContextPath, sContextPath, oSelectionVariant, sSelectOption, oMetaModelContext, oConditions, bIsFLPValues, bUseSemanticDateRange, oViewData);
        }
      }
    });
    return oConditions;
  }
  function _createConditionsForNavProperties(sFullContextPath, sMainEntitySetPath, oSelectionVariant, sSelectOption, oMetaModelContext, oConditions, bIsFLPValuePresent, bSemanticDateRange, oViewData) {
    let aNavObjectNames = sSelectOption.split(".");
    // Eg: "SalesOrderManage._Item._Material.Material" or "_Item.Material"
    if (`/${sSelectOption.replaceAll(".", "/")}`.startsWith(sMainEntitySetPath)) {
      const sFullPath = `/${sSelectOption}`.replaceAll(".", "/"),
        sNavPath = sFullPath.replace(`${sMainEntitySetPath}/`, "");
      aNavObjectNames = sNavPath.split("/");
    }
    let sConditionPath = "";
    const sPropertyName = aNavObjectNames[aNavObjectNames.length - 1]; // Material from SalesOrderManage._Item.Material
    for (let i = 0; i < aNavObjectNames.length - 1; i++) {
      if (oMetaModelContext.getObject(`${sMainEntitySetPath}/${aNavObjectNames[i].replace("P_", "")}`).$isCollection) {
        sConditionPath = `${sConditionPath + aNavObjectNames[i]}*/`; // _Item*/ in case of 1:n cardinality
      } else {
        sConditionPath = `${sConditionPath + aNavObjectNames[i]}/`; // _Item/ in case of 1:1 cardinality
      }

      sMainEntitySetPath = `${sMainEntitySetPath}/${aNavObjectNames[i]}`;
    }
    const sNavPropertyPath = sFullContextPath.slice(0, sFullContextPath.lastIndexOf("/")),
      oValidProperties = CommonUtils.getContextPathProperties(oMetaModelContext, sNavPropertyPath),
      aSelectOptionsPropertyNames = oSelectionVariant.getSelectOptionsPropertyNames();
    let sSelectOptionName = sPropertyName;
    if (oValidProperties[sPropertyName]) {
      sSelectOptionName = sPropertyName;
    } else if (sPropertyName.startsWith("P_") && oValidProperties[sPropertyName.replace("P_", "")]) {
      sSelectOptionName = sPropertyName.replace("P_", "");
    } else if (oValidProperties[`P_${sPropertyName}`] && aSelectOptionsPropertyNames.includes(`P_${sPropertyName}`)) {
      sSelectOptionName = `P_${sPropertyName}`;
    }
    if (sPropertyName.startsWith("P_") && oConditions[sConditionPath + sSelectOptionName]) {
      // if there is no SalesOrderManage._Item.Material yet in the oConditions
    } else if (!sPropertyName.startsWith("P_") && oConditions[sConditionPath + sSelectOptionName]) {
      delete oConditions[sConditionPath + sSelectOptionName];
      addSelectOptionsToConditions(sNavPropertyPath, oSelectionVariant, sSelectOption, oConditions, sConditionPath, sSelectOptionName, oValidProperties, oMetaModelContext, false, bIsFLPValuePresent, bSemanticDateRange, oViewData);
    } else {
      addSelectOptionsToConditions(sNavPropertyPath, oSelectionVariant, sSelectOption, oConditions, sConditionPath, sSelectOptionName, oValidProperties, oMetaModelContext, false, bIsFLPValuePresent, bSemanticDateRange, oViewData);
    }
  }
  function addPageContextToSelectionVariant(oSelectionVariant, mPageContext, oView) {
    const oAppComponent = CommonUtils.getAppComponent(oView);
    const oNavigationService = oAppComponent.getNavigationService();
    return oNavigationService.mixAttributesAndSelectionVariant(mPageContext, oSelectionVariant.toJSONString());
  }
  function addExternalStateFiltersToSelectionVariant(oSelectionVariant, mFilters, oTargetInfo, oFilterBar) {
    let sFilter;
    const fnGetSignAndOption = function (sOperator, sLowValue, sHighValue) {
      const oSelectOptionState = {
        option: "",
        sign: "I",
        low: sLowValue,
        high: sHighValue
      };
      switch (sOperator) {
        case "Contains":
          oSelectOptionState.option = "CP";
          break;
        case "StartsWith":
          oSelectOptionState.option = "CP";
          oSelectOptionState.low += "*";
          break;
        case "EndsWith":
          oSelectOptionState.option = "CP";
          oSelectOptionState.low = `*${oSelectOptionState.low}`;
          break;
        case "BT":
        case "LE":
        case "LT":
        case "GT":
        case "NE":
        case "EQ":
          oSelectOptionState.option = sOperator;
          break;
        case "DATE":
          oSelectOptionState.option = "EQ";
          break;
        case "DATERANGE":
          oSelectOptionState.option = "BT";
          break;
        case "FROM":
          oSelectOptionState.option = "GE";
          break;
        case "TO":
          oSelectOptionState.option = "LE";
          break;
        case "EEQ":
          oSelectOptionState.option = "EQ";
          break;
        case "Empty":
          oSelectOptionState.option = "EQ";
          oSelectOptionState.low = "";
          break;
        case "NotContains":
          oSelectOptionState.option = "CP";
          oSelectOptionState.sign = "E";
          break;
        case "NOTBT":
          oSelectOptionState.option = "BT";
          oSelectOptionState.sign = "E";
          break;
        case "NotStartsWith":
          oSelectOptionState.option = "CP";
          oSelectOptionState.low += "*";
          oSelectOptionState.sign = "E";
          break;
        case "NotEndsWith":
          oSelectOptionState.option = "CP";
          oSelectOptionState.low = `*${oSelectOptionState.low}`;
          oSelectOptionState.sign = "E";
          break;
        case "NotEmpty":
          oSelectOptionState.option = "NE";
          oSelectOptionState.low = "";
          break;
        case "NOTLE":
          oSelectOptionState.option = "LE";
          oSelectOptionState.sign = "E";
          break;
        case "NOTGE":
          oSelectOptionState.option = "GE";
          oSelectOptionState.sign = "E";
          break;
        case "NOTLT":
          oSelectOptionState.option = "LT";
          oSelectOptionState.sign = "E";
          break;
        case "NOTGT":
          oSelectOptionState.option = "GT";
          oSelectOptionState.sign = "E";
          break;
        default:
          Log.warning(`${sOperator} is not supported. ${sFilter} could not be added to the navigation context`);
      }
      return oSelectOptionState;
    };
    const oFilterConditions = mFilters.filterConditions;
    const oFiltersWithoutConflict = mFilters.filterConditionsWithoutConflict ? mFilters.filterConditionsWithoutConflict : {};
    const oTablePropertiesWithoutConflict = oTargetInfo.propertiesWithoutConflict ? oTargetInfo.propertiesWithoutConflict : {};
    const addFiltersToSelectionVariant = function (selectionVariant, sFilterName, sPath) {
      const aConditions = oFilterConditions[sFilterName];
      const oPropertyInfo = oFilterBar && oFilterBar.getPropertyHelper().getProperty(sFilterName);
      const oTypeConfig = oPropertyInfo === null || oPropertyInfo === void 0 ? void 0 : oPropertyInfo.typeConfig;
      const oTypeUtil = oFilterBar && oFilterBar.getControlDelegate().getTypeUtil();
      for (const item in aConditions) {
        const oCondition = aConditions[item];
        let option = "",
          sign = "I",
          low = "",
          high = null,
          semanticDates;
        const oOperator = FilterOperatorUtil.getOperator(oCondition.operator);
        if (oOperator instanceof RangeOperator) {
          var _oModelFilter$getFilt;
          semanticDates = CommonUtils.createSemanticDatesFromConditions(oCondition);
          // handling of Date RangeOperators
          const oModelFilter = oOperator.getModelFilter(oCondition, sFilterName, oTypeConfig === null || oTypeConfig === void 0 ? void 0 : oTypeConfig.typeInstance, false, oTypeConfig === null || oTypeConfig === void 0 ? void 0 : oTypeConfig.baseType);
          if (!(oModelFilter !== null && oModelFilter !== void 0 && oModelFilter.getFilters()) && !(oModelFilter !== null && oModelFilter !== void 0 && (_oModelFilter$getFilt = oModelFilter.getFilters()) !== null && _oModelFilter$getFilt !== void 0 && _oModelFilter$getFilt.length)) {
            sign = oOperator.exclude ? "E" : "I";
            low = oTypeUtil.externalizeValue(oModelFilter.getValue1(), oTypeConfig.typeInstance);
            high = oTypeUtil.externalizeValue(oModelFilter.getValue2(), oTypeConfig.typeInstance);
            option = oModelFilter.getOperator();
          }
        } else {
          const aSemanticDateOpsExt = SemanticDateOperators.getSupportedOperations();
          if (aSemanticDateOpsExt.includes(oCondition === null || oCondition === void 0 ? void 0 : oCondition.operator)) {
            semanticDates = CommonUtils.createSemanticDatesFromConditions(oCondition);
          }
          const value1 = oCondition.values[0] && oCondition.values[0].toString() || "";
          const value2 = oCondition.values[1] && oCondition.values[1].toString() || null;
          const oSelectOption = fnGetSignAndOption(oCondition.operator, value1, value2);
          sign = oOperator !== null && oOperator !== void 0 && oOperator.exclude ? "E" : "I";
          low = oSelectOption === null || oSelectOption === void 0 ? void 0 : oSelectOption.low;
          high = oSelectOption === null || oSelectOption === void 0 ? void 0 : oSelectOption.high;
          option = oSelectOption === null || oSelectOption === void 0 ? void 0 : oSelectOption.option;
        }
        if (option && semanticDates) {
          selectionVariant.addSelectOption(sPath ? sPath : sFilterName, sign, option, low, high, undefined, semanticDates);
        } else if (option) {
          selectionVariant.addSelectOption(sPath ? sPath : sFilterName, sign, option, low, high);
        }
      }
    };
    for (sFilter in oFilterConditions) {
      // only add the filter values if it is not already present in the SV already
      if (!oSelectionVariant.getSelectOption(sFilter)) {
        // TODO : custom filters should be ignored more generically
        if (sFilter === "$editState") {
          continue;
        }
        addFiltersToSelectionVariant(oSelectionVariant, sFilter);
      } else {
        if (oTablePropertiesWithoutConflict && sFilter in oTablePropertiesWithoutConflict) {
          addFiltersToSelectionVariant(oSelectionVariant, sFilter, oTablePropertiesWithoutConflict[sFilter]);
        }
        // if property was without conflict in page context then add path from page context to SV
        if (sFilter in oFiltersWithoutConflict) {
          addFiltersToSelectionVariant(oSelectionVariant, sFilter, oFiltersWithoutConflict[sFilter]);
        }
      }
    }
    return oSelectionVariant;
  }
  function isStickyEditMode(oControl) {
    const bIsStickyMode = ModelHelper.isStickySessionSupported(oControl.getModel().getMetaModel());
    const bUIEditable = oControl.getModel("ui").getProperty("/isEditable");
    return bIsStickyMode && bUIEditable;
  }

  /**
   * @param aMandatoryFilterFields
   * @param oSelectionVariant
   * @param oSelectionVariantDefaults
   */
  function addDefaultDisplayCurrency(aMandatoryFilterFields, oSelectionVariant, oSelectionVariantDefaults) {
    if (oSelectionVariant && aMandatoryFilterFields && aMandatoryFilterFields.length) {
      for (let i = 0; i < aMandatoryFilterFields.length; i++) {
        const aSVOption = oSelectionVariant.getSelectOption("DisplayCurrency"),
          aDefaultSVOption = oSelectionVariantDefaults && oSelectionVariantDefaults.getSelectOption("DisplayCurrency");
        if (aMandatoryFilterFields[i].$PropertyPath === "DisplayCurrency" && (!aSVOption || !aSVOption.length) && aDefaultSVOption && aDefaultSVOption.length) {
          const displayCurrencySelectOption = aDefaultSVOption[0];
          const sSign = displayCurrencySelectOption["Sign"];
          const sOption = displayCurrencySelectOption["Option"];
          const sLow = displayCurrencySelectOption["Low"];
          const sHigh = displayCurrencySelectOption["High"];
          oSelectionVariant.addSelectOption("DisplayCurrency", sSign, sOption, sLow, sHigh);
        }
      }
    }
  }
  function getNonComputedVisibleFields(metaModelContext, sPath, oView) {
    const aTechnicalKeys = metaModelContext.getObject(`${sPath}/`).$Key;
    const aNonComputedVisibleFields = [];
    const aImmutableVisibleFields = [];
    const oEntityType = metaModelContext.getObject(`${sPath}/`);
    for (const item in oEntityType) {
      if (oEntityType[item].$kind && oEntityType[item].$kind === "Property") {
        const oAnnotations = metaModelContext.getObject(`${sPath}/${item}@`) || {},
          bIsKey = aTechnicalKeys.indexOf(item) > -1,
          bIsImmutable = oAnnotations["@Org.OData.Core.V1.Immutable"],
          bIsNonComputed = !oAnnotations["@Org.OData.Core.V1.Computed"],
          bIsVisible = !oAnnotations["@com.sap.vocabularies.UI.v1.Hidden"],
          bIsComputedDefaultValue = oAnnotations["@Org.OData.Core.V1.ComputedDefaultValue"],
          bIsKeyComputedDefaultValueWithText = bIsKey && oEntityType[item].$Type === "Edm.Guid" ? bIsComputedDefaultValue && oAnnotations["@com.sap.vocabularies.Common.v1.Text"] : false;
        if ((bIsKeyComputedDefaultValueWithText || bIsKey && oEntityType[item].$Type !== "Edm.Guid") && bIsNonComputed && bIsVisible) {
          aNonComputedVisibleFields.push(item);
        } else if (bIsImmutable && bIsNonComputed && bIsVisible) {
          aImmutableVisibleFields.push(item);
        }
        if (!bIsNonComputed && bIsComputedDefaultValue && oView) {
          var _IssueCategoryType$An;
          const oDiagnostics = getAppComponent(oView).getDiagnostics();
          const sMessage = "Core.ComputedDefaultValue is ignored as Core.Computed is already set to true";
          oDiagnostics.addIssue(IssueCategory.Annotation, IssueSeverity.Medium, sMessage, IssueCategoryType, IssueCategoryType === null || IssueCategoryType === void 0 ? void 0 : (_IssueCategoryType$An = IssueCategoryType.Annotations) === null || _IssueCategoryType$An === void 0 ? void 0 : _IssueCategoryType$An.IgnoredAnnotation);
        }
      }
    }
    const aRequiredProperties = CommonUtils.getRequiredPropertiesFromInsertRestrictions(sPath, metaModelContext);
    if (aRequiredProperties.length) {
      aRequiredProperties.forEach(function (sProperty) {
        const oAnnotations = metaModelContext.getObject(`${sPath}/${sProperty}@`),
          bIsVisible = !oAnnotations || !oAnnotations["@com.sap.vocabularies.UI.v1.Hidden"];
        if (bIsVisible && aNonComputedVisibleFields.indexOf(sProperty) === -1 && aImmutableVisibleFields.indexOf(sProperty) === -1) {
          aNonComputedVisibleFields.push(sProperty);
        }
      });
    }
    return aNonComputedVisibleFields.concat(aImmutableVisibleFields);
  }
  function getRequiredProperties(sPath, metaModelContext) {
    let bCheckUpdateRestrictions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    const aRequiredProperties = [];
    let aRequiredPropertiesWithPaths = [];
    const navigationText = "$NavigationPropertyBinding";
    let oEntitySetAnnotations;
    if (sPath.endsWith("$")) {
      // if sPath comes with a $ in the end, removing it as it is of no significance
      sPath = sPath.replace("/$", "");
    }
    const entityTypePathParts = sPath.replaceAll("%2F", "/").split("/").filter(ModelHelper.filterOutNavPropBinding);
    const entitySetPath = ModelHelper.getEntitySetPath(sPath, metaModelContext);
    const entitySetPathParts = entitySetPath.split("/").filter(ModelHelper.filterOutNavPropBinding);
    const isContainment = metaModelContext.getObject(`/${entityTypePathParts.join("/")}/$ContainsTarget`);
    const containmentNavPath = isContainment && entityTypePathParts[entityTypePathParts.length - 1];

    //Restrictions directly at Entity Set
    //e.g. FR in "NS.EntityContainer/SalesOrderManage" ContextPath: /SalesOrderManage
    if (!isContainment) {
      oEntitySetAnnotations = metaModelContext.getObject(`${entitySetPath}@`);
    }
    if (entityTypePathParts.length > 1) {
      const navPath = isContainment ? containmentNavPath : entitySetPathParts[entitySetPathParts.length - 1];
      const parentEntitySetPath = isContainment ? entitySetPath : `/${entitySetPathParts.slice(0, -1).join(`/${navigationText}/`)}`;
      //Navigation restrictions
      //e.g. Parent "/Customer" with NavigationPropertyPath="Set" ContextPath: Customer/Set
      const oNavRest = CommonUtils.getNavigationRestrictions(metaModelContext, parentEntitySetPath, navPath.replaceAll("%2F", "/"));
      if (oNavRest !== undefined && CommonUtils.hasRestrictedPropertiesInAnnotations(oNavRest, true, bCheckUpdateRestrictions)) {
        aRequiredPropertiesWithPaths = bCheckUpdateRestrictions ? oNavRest["UpdateRestrictions"].RequiredProperties || [] : oNavRest["InsertRestrictions"].RequiredProperties || [];
      }
      if ((!aRequiredPropertiesWithPaths || !aRequiredPropertiesWithPaths.length) && CommonUtils.hasRestrictedPropertiesInAnnotations(oEntitySetAnnotations, false, bCheckUpdateRestrictions)) {
        aRequiredPropertiesWithPaths = CommonUtils.getRequiredPropertiesFromAnnotations(oEntitySetAnnotations, bCheckUpdateRestrictions);
      }
    } else if (CommonUtils.hasRestrictedPropertiesInAnnotations(oEntitySetAnnotations, false, bCheckUpdateRestrictions)) {
      aRequiredPropertiesWithPaths = CommonUtils.getRequiredPropertiesFromAnnotations(oEntitySetAnnotations, bCheckUpdateRestrictions);
    }
    aRequiredPropertiesWithPaths.forEach(function (oRequiredProperty) {
      const sProperty = oRequiredProperty.$PropertyPath;
      aRequiredProperties.push(sProperty);
    });
    return aRequiredProperties;
  }
  function getRequiredPropertiesFromInsertRestrictions(sPath, oMetaModelContext) {
    return CommonUtils.getRequiredProperties(sPath, oMetaModelContext);
  }
  function getRequiredPropertiesFromUpdateRestrictions(sPath, oMetaModelContext) {
    return CommonUtils.getRequiredProperties(sPath, oMetaModelContext, true);
  }
  function getRequiredPropertiesFromAnnotations(oAnnotations) {
    var _oAnnotations$OrgOD2;
    let bCheckUpdateRestrictions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    if (bCheckUpdateRestrictions) {
      var _oAnnotations$OrgOD;
      return ((_oAnnotations$OrgOD = oAnnotations["@Org.OData.Capabilities.V1.UpdateRestrictions"]) === null || _oAnnotations$OrgOD === void 0 ? void 0 : _oAnnotations$OrgOD.RequiredProperties) || [];
    }
    return ((_oAnnotations$OrgOD2 = oAnnotations["@Org.OData.Capabilities.V1.InsertRestrictions"]) === null || _oAnnotations$OrgOD2 === void 0 ? void 0 : _oAnnotations$OrgOD2.RequiredProperties) || [];
  }
  function hasRestrictedPropertiesInAnnotations(oAnnotations) {
    let bIsNavigationRestrictions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    let bCheckUpdateRestrictions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    if (bIsNavigationRestrictions) {
      const oNavAnnotations = oAnnotations;
      if (bCheckUpdateRestrictions) {
        return oNavAnnotations && oNavAnnotations["UpdateRestrictions"] && oNavAnnotations["UpdateRestrictions"].RequiredProperties ? true : false;
      }
      return oNavAnnotations && oNavAnnotations["InsertRestrictions"] && oNavAnnotations["InsertRestrictions"].RequiredProperties ? true : false;
    } else if (bCheckUpdateRestrictions) {
      const oEntityAnnotation = oAnnotations;
      return oEntityAnnotation && oEntityAnnotation["@Org.OData.Capabilities.V1.UpdateRestrictions"] && oEntityAnnotation["@Org.OData.Capabilities.V1.UpdateRestrictions"].RequiredProperties ? true : false;
    }
    const oEntityAnnotation = oAnnotations;
    return oEntityAnnotation && oEntityAnnotation["@Org.OData.Capabilities.V1.InsertRestrictions"] && oEntityAnnotation["@Org.OData.Capabilities.V1.InsertRestrictions"].RequiredProperties ? true : false;
  }
  async function setUserDefaults(oAppComponent, aParameters, oModel, bIsAction, bIsCreate, oActionDefaultValues) {
    return new Promise(function (resolve) {
      const oComponentData = oAppComponent.getComponentData(),
        oStartupParameters = oComponentData && oComponentData.startupParameters || {},
        oShellServices = oAppComponent.getShellServices();
      if (!oShellServices.hasUShell()) {
        aParameters.forEach(function (oParameter) {
          var _oParameter$getPath;
          const sPropertyName = bIsAction ? `/${oParameter.$Name}` : (_oParameter$getPath = oParameter.getPath) === null || _oParameter$getPath === void 0 ? void 0 : _oParameter$getPath.call(oParameter).slice(oParameter.getPath().lastIndexOf("/") + 1);
          const sParameterName = bIsAction ? sPropertyName.slice(1) : sPropertyName;
          if (oActionDefaultValues && bIsCreate) {
            if (oActionDefaultValues[sParameterName]) {
              oModel.setProperty(sPropertyName, oActionDefaultValues[sParameterName]);
            }
          } else if (oStartupParameters[sParameterName]) {
            oModel.setProperty(sPropertyName, oStartupParameters[sParameterName][0]);
          }
        });
        return resolve(true);
      }
      return oShellServices.getStartupAppState(oAppComponent).then(function (oStartupAppState) {
        const oData = (oStartupAppState === null || oStartupAppState === void 0 ? void 0 : oStartupAppState.getData()) || {},
          aExtendedParameters = oData.selectionVariant && oData.selectionVariant.SelectOptions || [];
        aParameters.forEach(function (oParameter) {
          var _oParameter$getPath2;
          const sPropertyName = bIsAction ? `/${oParameter.$Name}` : (_oParameter$getPath2 = oParameter.getPath) === null || _oParameter$getPath2 === void 0 ? void 0 : _oParameter$getPath2.call(oParameter).slice(oParameter.getPath().lastIndexOf("/") + 1);
          const sParameterName = bIsAction ? sPropertyName.slice(1) : sPropertyName;
          if (oActionDefaultValues && bIsCreate) {
            if (oActionDefaultValues[sParameterName]) {
              oModel.setProperty(sPropertyName, oActionDefaultValues[sParameterName]);
            }
          } else if (oStartupParameters[sParameterName]) {
            oModel.setProperty(sPropertyName, oStartupParameters[sParameterName][0]);
          } else if (aExtendedParameters.length > 0) {
            for (const i in aExtendedParameters) {
              const oExtendedParameter = aExtendedParameters[i];
              if (oExtendedParameter.PropertyName === sParameterName) {
                const oRange = oExtendedParameter.Ranges.length ? oExtendedParameter.Ranges[oExtendedParameter.Ranges.length - 1] : undefined;
                if (oRange && oRange.Sign === "I" && oRange.Option === "EQ") {
                  oModel.setProperty(sPropertyName, oRange.Low); // high is ignored when Option=EQ
                }
              }
            }
          }
        });

        return resolve(true);
      });
    });
  }
  function getAdditionalParamsForCreate(oStartupParameters, oInboundParameters) {
    const oInbounds = oInboundParameters,
      aCreateParameters = oInbounds !== undefined ? Object.keys(oInbounds).filter(function (sParameter) {
        return oInbounds[sParameter].useForCreate;
      }) : [];
    let oRet;
    for (let i = 0; i < aCreateParameters.length; i++) {
      const sCreateParameter = aCreateParameters[i];
      const aValues = oStartupParameters && oStartupParameters[sCreateParameter];
      if (aValues && aValues.length === 1) {
        oRet = oRet || Object.create(null);
        oRet[sCreateParameter] = aValues[0];
      }
    }
    return oRet;
  }
  function getSemanticObjectMapping(oOutbound) {
    const aSemanticObjectMapping = [];
    if (oOutbound.parameters) {
      const aParameters = Object.keys(oOutbound.parameters) || [];
      if (aParameters.length > 0) {
        aParameters.forEach(function (sParam) {
          const oMapping = oOutbound.parameters[sParam];
          if (oMapping.value && oMapping.value.value && oMapping.value.format === "binding") {
            // using the format of UI.Mapping
            const oSemanticMapping = {
              LocalProperty: {
                $PropertyPath: oMapping.value.value
              },
              SemanticObjectProperty: sParam
            };
            if (aSemanticObjectMapping.length > 0) {
              // To check if the semanticObject Mapping is done for the same local property more that once then first one will be considered
              for (let i = 0; i < aSemanticObjectMapping.length; i++) {
                var _aSemanticObjectMappi;
                if (((_aSemanticObjectMappi = aSemanticObjectMapping[i].LocalProperty) === null || _aSemanticObjectMappi === void 0 ? void 0 : _aSemanticObjectMappi.$PropertyPath) !== oSemanticMapping.LocalProperty.$PropertyPath) {
                  aSemanticObjectMapping.push(oSemanticMapping);
                }
              }
            } else {
              aSemanticObjectMapping.push(oSemanticMapping);
            }
          }
        });
      }
    }
    return aSemanticObjectMapping;
  }
  function getHeaderFacetItemConfigForExternalNavigation(oViewData, oCrossNav) {
    const oHeaderFacetItems = {};
    let sId;
    const oControlConfig = oViewData.controlConfiguration;
    for (const config in oControlConfig) {
      if (config.indexOf("@com.sap.vocabularies.UI.v1.DataPoint") > -1 || config.indexOf("@com.sap.vocabularies.UI.v1.Chart") > -1) {
        var _oControlConfig$confi, _oControlConfig$confi2;
        const sOutbound = (_oControlConfig$confi = oControlConfig[config].navigation) === null || _oControlConfig$confi === void 0 ? void 0 : (_oControlConfig$confi2 = _oControlConfig$confi.targetOutbound) === null || _oControlConfig$confi2 === void 0 ? void 0 : _oControlConfig$confi2.outbound;
        if (sOutbound !== undefined) {
          const oOutbound = oCrossNav[sOutbound];
          if (oOutbound.semanticObject && oOutbound.action) {
            if (config.indexOf("Chart") > -1) {
              sId = generate(["fe", "MicroChartLink", config]);
            } else {
              sId = generate(["fe", "HeaderDPLink", config]);
            }
            const aSemanticObjectMapping = CommonUtils.getSemanticObjectMapping(oOutbound);
            oHeaderFacetItems[sId] = {
              semanticObject: oOutbound.semanticObject,
              action: oOutbound.action,
              semanticObjectMapping: aSemanticObjectMapping
            };
          } else {
            Log.error(`Cross navigation outbound is configured without semantic object and action for ${sOutbound}`);
          }
        }
      }
    }
    return oHeaderFacetItems;
  }
  function setSemanticObjectMappings(oSelectionVariant, vMappings) {
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
  async function fnGetSemanticObjectsFromPath(oMetaModel, sPath, sQualifier) {
    return new Promise(function (resolve) {
      let sSemanticObject, aSemanticObjectUnavailableActions;
      if (sQualifier === "") {
        sSemanticObject = oMetaModel.getObject(`${sPath}@${"com.sap.vocabularies.Common.v1.SemanticObject"}`);
        aSemanticObjectUnavailableActions = oMetaModel.getObject(`${sPath}@${"com.sap.vocabularies.Common.v1.SemanticObjectUnavailableActions"}`);
      } else {
        sSemanticObject = oMetaModel.getObject(`${sPath}@${"com.sap.vocabularies.Common.v1.SemanticObject"}#${sQualifier}`);
        aSemanticObjectUnavailableActions = oMetaModel.getObject(`${sPath}@${"com.sap.vocabularies.Common.v1.SemanticObjectUnavailableActions"}#${sQualifier}`);
      }
      const aSemanticObjectForGetLinks = [{
        semanticObject: sSemanticObject
      }];
      const oSemanticObject = {
        semanticObject: sSemanticObject
      };
      resolve({
        semanticObjectPath: sPath,
        semanticObjectForGetLinks: aSemanticObjectForGetLinks,
        semanticObject: oSemanticObject,
        unavailableActions: aSemanticObjectUnavailableActions
      });
    });
  }
  async function fnUpdateSemanticTargetsModel(aGetLinksPromises, aSemanticObjects, oInternalModelContext, sCurrentHash) {
    return Promise.all(aGetLinksPromises).then(function (aValues) {
      let aLinks,
        _oLink,
        _sLinkIntentAction,
        aFinalLinks = [];
      let oFinalSemanticObjects = {};
      const bIntentHasActions = function (sIntent, aActions) {
        for (const intent in aActions) {
          if (intent === sIntent) {
            return true;
          } else {
            return false;
          }
        }
      };
      for (let k = 0; k < aValues.length; k++) {
        aLinks = aValues[k];
        if (aLinks && aLinks.length > 0 && aLinks[0] !== undefined) {
          const oSemanticObject = {};
          let oTmp;
          let sAlternatePath;
          for (let i = 0; i < aLinks.length; i++) {
            aFinalLinks.push([]);
            let hasTargetsNotFiltered = false;
            let hasTargets = false;
            for (let iLinkCount = 0; iLinkCount < aLinks[i][0].length; iLinkCount++) {
              _oLink = aLinks[i][0][iLinkCount];
              _sLinkIntentAction = _oLink && _oLink.intent.split("?")[0].split("-")[1];
              if (!(_oLink && _oLink.intent && _oLink.intent.indexOf(sCurrentHash) === 0)) {
                hasTargetsNotFiltered = true;
                if (!bIntentHasActions(_sLinkIntentAction, aSemanticObjects[k].unavailableActions)) {
                  aFinalLinks[i].push(_oLink);
                  hasTargets = true;
                }
              }
            }
            oTmp = {
              semanticObject: aSemanticObjects[k].semanticObject,
              path: aSemanticObjects[k].path,
              HasTargets: hasTargets,
              HasTargetsNotFiltered: hasTargetsNotFiltered
            };
            if (oSemanticObject[aSemanticObjects[k].semanticObject] === undefined) {
              oSemanticObject[aSemanticObjects[k].semanticObject] = {};
            }
            sAlternatePath = aSemanticObjects[k].path.replace(/\//g, "_");
            if (oSemanticObject[aSemanticObjects[k].semanticObject][sAlternatePath] === undefined) {
              oSemanticObject[aSemanticObjects[k].semanticObject][sAlternatePath] = {};
            }
            oSemanticObject[aSemanticObjects[k].semanticObject][sAlternatePath] = Object.assign(oSemanticObject[aSemanticObjects[k].semanticObject][sAlternatePath], oTmp);
          }
          const sSemanticObjectName = Object.keys(oSemanticObject)[0];
          if (Object.keys(oFinalSemanticObjects).includes(sSemanticObjectName)) {
            oFinalSemanticObjects[sSemanticObjectName] = Object.assign(oFinalSemanticObjects[sSemanticObjectName], oSemanticObject[sSemanticObjectName]);
          } else {
            oFinalSemanticObjects = Object.assign(oFinalSemanticObjects, oSemanticObject);
          }
          aFinalLinks = [];
        }
      }
      if (Object.keys(oFinalSemanticObjects).length > 0) {
        oInternalModelContext.setProperty("semanticsTargets", mergeObjects(oFinalSemanticObjects, oInternalModelContext.getProperty("semanticsTargets")));
        return oFinalSemanticObjects;
      }
    }).catch(function (oError) {
      Log.error("fnUpdateSemanticTargetsModel: Cannot read links", oError);
    });
  }
  async function fnGetSemanticObjectPromise(oAppComponent, oView, oMetaModel, sPath, sQualifier) {
    return CommonUtils.getSemanticObjectsFromPath(oMetaModel, sPath, sQualifier);
  }
  function fnPrepareSemanticObjectsPromises(_oAppComponent, _oView, _oMetaModel, _aSemanticObjectsFound, _aSemanticObjectsPromises) {
    let _Keys, sPath;
    let sQualifier, regexResult;
    for (let i = 0; i < _aSemanticObjectsFound.length; i++) {
      sPath = _aSemanticObjectsFound[i];
      _Keys = Object.keys(_oMetaModel.getObject(sPath + "@"));
      for (let index = 0; index < _Keys.length; index++) {
        if (_Keys[index].indexOf(`@${"com.sap.vocabularies.Common.v1.SemanticObject"}`) === 0 && _Keys[index].indexOf(`@${"com.sap.vocabularies.Common.v1.SemanticObjectMapping"}`) === -1 && _Keys[index].indexOf(`@${"com.sap.vocabularies.Common.v1.SemanticObjectUnavailableActions"}`) === -1) {
          regexResult = /#(.*)/.exec(_Keys[index]);
          sQualifier = regexResult ? regexResult[1] : "";
          _aSemanticObjectsPromises.push(CommonUtils.getSemanticObjectPromise(_oAppComponent, _oView, _oMetaModel, sPath, sQualifier));
        }
      }
    }
  }
  function fnGetSemanticTargetsFromPageModel(oController, sPageModel) {
    const _fnfindValuesHelper = function (obj, key, list) {
      if (!obj) {
        return list;
      }
      if (obj instanceof Array) {
        for (const i in obj) {
          list = list.concat(_fnfindValuesHelper(obj[i], key, []));
        }
        return list;
      }
      if (obj[key]) {
        list.push(obj[key]);
      }
      if (typeof obj == "object" && obj !== null) {
        const children = Object.keys(obj);
        if (children.length > 0) {
          for (let i = 0; i < children.length; i++) {
            list = list.concat(_fnfindValuesHelper(obj[children[i]], key, []));
          }
        }
      }
      return list;
    };
    const _fnfindValues = function (obj, key) {
      return _fnfindValuesHelper(obj, key, []);
    };
    const _fnDeleteDuplicateSemanticObjects = function (aSemanticObjectPath) {
      return aSemanticObjectPath.filter(function (value, index) {
        return aSemanticObjectPath.indexOf(value) === index;
      });
    };
    const oView = oController.getView();
    const oInternalModelContext = oView.getBindingContext("internal");
    if (oInternalModelContext) {
      const aSemanticObjectsPromises = [];
      const oComponent = oController.getOwnerComponent();
      const oAppComponent = Component.getOwnerComponentFor(oComponent);
      const oMetaModel = oAppComponent.getMetaModel();
      let oPageModel = oComponent.getModel(sPageModel).getData();
      if (JSON.stringify(oPageModel) === "{}") {
        oPageModel = oComponent.getModel(sPageModel)._getObject("/", undefined);
      }
      let aSemanticObjectsFound = _fnfindValues(oPageModel, "semanticObjectPath");
      aSemanticObjectsFound = _fnDeleteDuplicateSemanticObjects(aSemanticObjectsFound);
      const oShellServiceHelper = CommonUtils.getShellServices(oAppComponent);
      let sCurrentHash = CommonUtils.getHash();
      const aSemanticObjectsForGetLinks = [];
      const aSemanticObjects = [];
      let _oSemanticObject;
      if (sCurrentHash && sCurrentHash.indexOf("?") !== -1) {
        // sCurrentHash can contain query string, cut it off!
        sCurrentHash = sCurrentHash.split("?")[0];
      }
      fnPrepareSemanticObjectsPromises(oAppComponent, oView, oMetaModel, aSemanticObjectsFound, aSemanticObjectsPromises);
      if (aSemanticObjectsPromises.length === 0) {
        return Promise.resolve();
      } else {
        Promise.all(aSemanticObjectsPromises).then(async function (aValues) {
          const aGetLinksPromises = [];
          let sSemObjExpression;
          const aSemanticObjectsResolved = aValues.filter(function (element) {
            if (element.semanticObject !== undefined && element.semanticObject.semanticObject && typeof element.semanticObject.semanticObject === "object") {
              sSemObjExpression = compileExpression(pathInModel(element.semanticObject.semanticObject.$Path));
              element.semanticObject.semanticObject = sSemObjExpression;
              element.semanticObjectForGetLinks[0].semanticObject = sSemObjExpression;
              return true;
            } else if (element) {
              return element.semanticObject !== undefined;
            } else {
              return false;
            }
          });
          for (let j = 0; j < aSemanticObjectsResolved.length; j++) {
            _oSemanticObject = aSemanticObjectsResolved[j];
            if (_oSemanticObject && _oSemanticObject.semanticObject && !(_oSemanticObject.semanticObject.semanticObject.indexOf("{") === 0)) {
              aSemanticObjectsForGetLinks.push(_oSemanticObject.semanticObjectForGetLinks);
              aSemanticObjects.push({
                semanticObject: _oSemanticObject.semanticObject.semanticObject,
                unavailableActions: _oSemanticObject.unavailableActions,
                path: aSemanticObjectsResolved[j].semanticObjectPath
              });
              aGetLinksPromises.push(oShellServiceHelper.getLinksWithCache([_oSemanticObject.semanticObjectForGetLinks]));
            }
          }
          return CommonUtils.updateSemanticTargets(aGetLinksPromises, aSemanticObjects, oInternalModelContext, sCurrentHash);
        }).catch(function (oError) {
          Log.error("fnGetSemanticTargetsFromTable: Cannot get Semantic Objects", oError);
        });
      }
    } else {
      return Promise.resolve();
    }
  }
  function getFilterAllowedExpression(oFilterRestrictionsAnnotation) {
    const mAllowedExpressions = {};
    if (oFilterRestrictionsAnnotation && oFilterRestrictionsAnnotation.FilterExpressionRestrictions !== undefined) {
      oFilterRestrictionsAnnotation.FilterExpressionRestrictions.forEach(function (oProperty) {
        if (oProperty.Property && oProperty.AllowedExpressions !== undefined) {
          //SingleValue | MultiValue | SingleRange | MultiRange | SearchExpression | MultiRangeOrSearchExpression
          if (mAllowedExpressions[oProperty.Property.$PropertyPath] !== undefined) {
            mAllowedExpressions[oProperty.Property.$PropertyPath].push(oProperty.AllowedExpressions);
          } else {
            mAllowedExpressions[oProperty.Property.$PropertyPath] = [oProperty.AllowedExpressions];
          }
        }
      });
    }
    return mAllowedExpressions;
  }
  function getFilterRestrictions(oFilterRestrictionsAnnotation, sRestriction) {
    let aProps = [];
    if (oFilterRestrictionsAnnotation && oFilterRestrictionsAnnotation[sRestriction]) {
      aProps = oFilterRestrictionsAnnotation[sRestriction].map(function (oProperty) {
        return oProperty.$PropertyPath;
      });
    }
    return aProps;
  }
  function _fetchPropertiesForNavPath(paths, navPath, props) {
    const navPathPrefix = navPath + "/";
    return paths.reduce((outPaths, pathToCheck) => {
      if (pathToCheck.startsWith(navPathPrefix)) {
        const outPath = pathToCheck.replace(navPathPrefix, "");
        if (outPaths.indexOf(outPath) === -1) {
          outPaths.push(outPath);
        }
      }
      return outPaths;
    }, props);
  }
  function getFilterRestrictionsByPath(entityPath, oContext) {
    const oRet = {
      RequiredProperties: [],
      NonFilterableProperties: [],
      FilterAllowedExpressions: {}
    };
    let oFilterRestrictions;
    const navigationText = "$NavigationPropertyBinding";
    const frTerm = "@Org.OData.Capabilities.V1.FilterRestrictions";
    const entityTypePathParts = entityPath.replaceAll("%2F", "/").split("/").filter(ModelHelper.filterOutNavPropBinding);
    const entityTypePath = `/${entityTypePathParts.join("/")}/`;
    const entitySetPath = ModelHelper.getEntitySetPath(entityPath, oContext);
    const entitySetPathParts = entitySetPath.split("/").filter(ModelHelper.filterOutNavPropBinding);
    const isContainment = oContext.getObject(`${entityTypePath}$ContainsTarget`);
    const containmentNavPath = isContainment && entityTypePathParts[entityTypePathParts.length - 1];

    //LEAST PRIORITY - Filter restrictions directly at Entity Set
    //e.g. FR in "NS.EntityContainer/SalesOrderManage" ContextPath: /SalesOrderManage
    if (!isContainment) {
      oFilterRestrictions = oContext.getObject(`${entitySetPath}${frTerm}`);
      oRet.RequiredProperties = getFilterRestrictions(oFilterRestrictions, "RequiredProperties") || [];
      const resultContextCheck = oContext.getObject(`${entityTypePath}@com.sap.vocabularies.Common.v1.ResultContext`);
      if (!resultContextCheck) {
        oRet.NonFilterableProperties = getFilterRestrictions(oFilterRestrictions, "NonFilterableProperties") || [];
      }
      //SingleValue | MultiValue | SingleRange | MultiRange | SearchExpression | MultiRangeOrSearchExpression
      oRet.FilterAllowedExpressions = getFilterAllowedExpression(oFilterRestrictions) || {};
    }
    if (entityTypePathParts.length > 1) {
      const navPath = isContainment ? containmentNavPath : entitySetPathParts[entitySetPathParts.length - 1];
      // In case of containment we take entitySet provided as parent. And in case of normal we would remove the last navigation from entitySetPath.
      const parentEntitySetPath = isContainment ? entitySetPath : `/${entitySetPathParts.slice(0, -1).join(`/${navigationText}/`)}`;
      //THIRD HIGHEST PRIORITY - Reading property path restrictions - Annotation at main entity but directly on navigation property path
      //e.g. Parent Customer with PropertyPath="Set/CityName" ContextPath: Customer/Set
      const oParentRet = {
        RequiredProperties: [],
        NonFilterableProperties: [],
        FilterAllowedExpressions: {}
      };
      if (!navPath.includes("%2F")) {
        const oParentFR = oContext.getObject(`${parentEntitySetPath}${frTerm}`);
        oRet.RequiredProperties = _fetchPropertiesForNavPath(getFilterRestrictions(oParentFR, "RequiredProperties") || [], navPath, oRet.RequiredProperties || []);
        oRet.NonFilterableProperties = _fetchPropertiesForNavPath(getFilterRestrictions(oParentFR, "NonFilterableProperties") || [], navPath, oRet.NonFilterableProperties || []);
        //SingleValue | MultiValue | SingleRange | MultiRange | SearchExpression | MultiRangeOrSearchExpression
        const completeAllowedExps = getFilterAllowedExpression(oParentFR) || {};
        oParentRet.FilterAllowedExpressions = Object.keys(completeAllowedExps).reduce((outProp, propPath) => {
          if (propPath.startsWith(navPath + "/")) {
            const outPropPath = propPath.replace(navPath + "/", "");
            outProp[outPropPath] = completeAllowedExps[propPath];
          }
          return outProp;
        }, {});
      }

      //SingleValue | MultiValue | SingleRange | MultiRange | SearchExpression | MultiRangeOrSearchExpression
      oRet.FilterAllowedExpressions = mergeObjects({}, oRet.FilterAllowedExpressions || {}, oParentRet.FilterAllowedExpressions || {});

      //SECOND HIGHEST priority - Navigation restrictions
      //e.g. Parent "/Customer" with NavigationPropertyPath="Set" ContextPath: Customer/Set
      const oNavRestrictions = CommonUtils.getNavigationRestrictions(oContext, parentEntitySetPath, navPath.replaceAll("%2F", "/"));
      const oNavFilterRest = oNavRestrictions && oNavRestrictions["FilterRestrictions"];
      const navResReqProps = getFilterRestrictions(oNavFilterRest, "RequiredProperties") || [];
      oRet.RequiredProperties = uniqueSort(oRet.RequiredProperties.concat(navResReqProps));
      const navNonFilterProps = getFilterRestrictions(oNavFilterRest, "NonFilterableProperties") || [];
      oRet.NonFilterableProperties = uniqueSort(oRet.NonFilterableProperties.concat(navNonFilterProps));
      //SingleValue | MultiValue | SingleRange | MultiRange | SearchExpression | MultiRangeOrSearchExpression
      oRet.FilterAllowedExpressions = mergeObjects({}, oRet.FilterAllowedExpressions || {}, getFilterAllowedExpression(oNavFilterRest) || {});

      //HIGHEST priority - Restrictions having target with navigation association entity
      // e.g. FR in "CustomerParameters/Set" ContextPath: "Customer/Set"
      const navAssociationEntityRest = oContext.getObject(`/${entityTypePathParts.join("/")}${frTerm}`);
      const navAssocReqProps = getFilterRestrictions(navAssociationEntityRest, "RequiredProperties") || [];
      oRet.RequiredProperties = uniqueSort(oRet.RequiredProperties.concat(navAssocReqProps));
      const navAssocNonFilterProps = getFilterRestrictions(navAssociationEntityRest, "NonFilterableProperties") || [];
      oRet.NonFilterableProperties = uniqueSort(oRet.NonFilterableProperties.concat(navAssocNonFilterProps));
      //SingleValue | MultiValue | SingleRange | MultiRange | SearchExpression | MultiRangeOrSearchExpression
      oRet.FilterAllowedExpressions = mergeObjects({}, oRet.FilterAllowedExpressions, getFilterAllowedExpression(navAssociationEntityRest) || {});
    }
    return oRet;
  }
  async function templateControlFragment(sFragmentName, oPreprocessorSettings, oOptions, oModifier) {
    oOptions = oOptions || {};
    if (oModifier) {
      return oModifier.templateControlFragment(sFragmentName, oPreprocessorSettings, oOptions.view).then(function (oFragment) {
        // This is required as Flex returns an HTMLCollection as templating result in XML time.
        return oModifier.targets === "xmlTree" && oFragment.length > 0 ? oFragment[0] : oFragment;
      });
    } else {
      return loadMacroLibrary().then(async function () {
        return XMLPreprocessor.process(XMLTemplateProcessor.loadTemplate(sFragmentName, "fragment"), {
          name: sFragmentName
        }, oPreprocessorSettings);
      }).then(async function (oFragment) {
        const oControl = oFragment.firstElementChild;
        if (!!oOptions.isXML && oControl) {
          return Promise.resolve(oControl);
        }
        return Fragment.load({
          id: oOptions.id,
          definition: oFragment,
          controller: oOptions.controller
        });
      });
    }
  }
  function getSingletonPath(path, metaModel) {
    const parts = path.split("/").filter(Boolean),
      propertyName = parts.pop(),
      navigationPath = parts.join("/"),
      entitySet = navigationPath && metaModel.getObject(`/${navigationPath}`);
    if ((entitySet === null || entitySet === void 0 ? void 0 : entitySet.$kind) === "Singleton") {
      const singletonName = parts[parts.length - 1];
      return `/${singletonName}/${propertyName}`;
    }
    return undefined;
  }
  async function requestSingletonProperty(path, model) {
    if (!path || !model) {
      return Promise.resolve(null);
    }
    const metaModel = model.getMetaModel();
    // Find the underlying entity set from the property path and check whether it is a singleton.
    const resolvedPath = getSingletonPath(path, metaModel);
    if (resolvedPath) {
      const propertyBinding = model.bindProperty(resolvedPath);
      return propertyBinding.requestValue();
    }
    return Promise.resolve(null);
  }
  function addEventToBindingInfo(oControl, sEventName, fHandler) {
    let oBindingInfo;
    const setBindingInfo = function () {
      if (oBindingInfo) {
        if (!oBindingInfo.events) {
          oBindingInfo.events = {};
        }
        if (!oBindingInfo.events[sEventName]) {
          oBindingInfo.events[sEventName] = fHandler;
        } else {
          const fOriginalHandler = oBindingInfo.events[sEventName];
          oBindingInfo.events[sEventName] = function () {
            for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
              args[_key] = arguments[_key];
            }
            fHandler.apply(this, ...args);
            fOriginalHandler.apply(this, ...args);
          };
        }
      }
    };
    if (oControl.isA("sap.ui.mdc.Chart")) {
      oControl.innerChartBound().then(function () {
        oBindingInfo = oControl.getControlDelegate()._getChart(oControl).getBindingInfo("data");
        setBindingInfo();
      }).catch(function (sError) {
        Log.error(sError);
      });
    } else {
      oBindingInfo = oControl.data("rowsBindingInfo");
      setBindingInfo();
    }
  }
  async function loadMacroLibrary() {
    return new Promise(function (resolve) {
      sap.ui.require(["sap/fe/macros/macroLibrary"], function /*macroLibrary*/
      () {
        resolve();
      });
    });
  }

  // Get the path for action parameters that is needed to read the annotations
  function getParameterPath(sPath, sParameter) {
    let sContext;
    if (sPath.indexOf("@$ui5.overload") > -1) {
      sContext = sPath.split("@$ui5.overload")[0];
    } else {
      // For Unbound Actions in Action Parameter Dialogs
      const aAction = sPath.split("/0")[0].split(".");
      sContext = `/${aAction[aAction.length - 1]}/`;
    }
    return sContext + sParameter;
  }

  /**
   * Get resolved expression binding used for texts at runtime.
   *
   * @param expBinding
   * @param control
   * @function
   * @static
   * @memberof sap.fe.core.CommonUtils
   * @returns A string after resolution.
   * @ui5-restricted
   */
  function _fntranslatedTextFromExpBindingString(expBinding, control) {
    // The idea here is to create dummy element with the expresion binding.
    // Adding it as dependent to the view/control would propagate all the models to the dummy element and resolve the binding.
    // We remove the dummy element after that and destroy it.

    const anyResourceText = new AnyElement({
      anyText: expBinding
    });
    control.addDependent(anyResourceText);
    const resultText = anyResourceText.getAnyText();
    control.removeDependent(anyResourceText);
    anyResourceText.destroy();
    return resultText;
  }
  /**
   * Check if the current device has a small screen.
   *
   * @returns A Boolean.
   * @private
   */
  function isSmallDevice() {
    return !system.desktop || Device.resize.width <= 320;
  }
  function getConverterContextForPath(sMetaPath, oMetaModel, sEntitySet, oDiagnostics) {
    const oContext = oMetaModel.createBindingContext(sMetaPath);
    return ConverterContext === null || ConverterContext === void 0 ? void 0 : ConverterContext.createConverterContextForMacro(sEntitySet, oContext || oMetaModel, oDiagnostics, mergeObjects, undefined);
  }
  const CommonUtils = {
    isPropertyFilterable: isPropertyFilterable,
    isFieldControlPathInapplicable: isFieldControlPathInapplicable,
    removeSensitiveData: removeSensitiveData,
    fireButtonPress: fnFireButtonPress,
    getTargetView: getTargetView,
    getCurrentPageView: getCurrentPageView,
    hasTransientContext: fnHasTransientContexts,
    updateRelatedAppsDetails: fnUpdateRelatedAppsDetails,
    resolveStringtoBoolean: fnResolveStringtoBoolean,
    getAppComponent: getAppComponent,
    getMandatoryFilterFields: fnGetMandatoryFilterFields,
    getContextPathProperties: fnGetContextPathProperties,
    getParameterInfo: getParameterInfo,
    updateDataFieldForIBNButtonsVisibility: fnUpdateDataFieldForIBNButtonsVisibility,
    getTranslatedText: getTranslatedText,
    getEntitySetName: getEntitySetName,
    getActionPath: getActionPath,
    computeDisplayMode: computeDisplayMode,
    isStickyEditMode: isStickyEditMode,
    getOperatorsForProperty: getOperatorsForProperty,
    getOperatorsForDateProperty: getOperatorsForDateProperty,
    getOperatorsForGuidProperty: getOperatorsForGuidProperty,
    addSelectionVariantToConditions: addSelectionVariantToConditions,
    addExternalStateFiltersToSelectionVariant: addExternalStateFiltersToSelectionVariant,
    addPageContextToSelectionVariant: addPageContextToSelectionVariant,
    addDefaultDisplayCurrency: addDefaultDisplayCurrency,
    getNonComputedVisibleFields: getNonComputedVisibleFields,
    setUserDefaults: setUserDefaults,
    getShellServices: getShellServices,
    getHash: getHash,
    getIBNActions: fnGetIBNActions,
    getHeaderFacetItemConfigForExternalNavigation: getHeaderFacetItemConfigForExternalNavigation,
    getSemanticObjectMapping: getSemanticObjectMapping,
    setSemanticObjectMappings: setSemanticObjectMappings,
    getSemanticObjectPromise: fnGetSemanticObjectPromise,
    getSemanticTargetsFromPageModel: fnGetSemanticTargetsFromPageModel,
    getSemanticObjectsFromPath: fnGetSemanticObjectsFromPath,
    updateSemanticTargets: fnUpdateSemanticTargetsModel,
    getPropertyDataType: getPropertyDataType,
    waitForContextRequested: waitForContextRequested,
    getNavigationRestrictions: getNavigationRestrictions,
    getSearchRestrictions: getSearchRestrictions,
    getFilterRestrictionsByPath: getFilterRestrictionsByPath,
    getSpecificAllowedExpression: getSpecificAllowedExpression,
    getAdditionalParamsForCreate: getAdditionalParamsForCreate,
    requestSingletonProperty: requestSingletonProperty,
    templateControlFragment: templateControlFragment,
    addEventToBindingInfo: addEventToBindingInfo,
    FilterRestrictions: {
      REQUIRED_PROPERTIES: "RequiredProperties",
      NON_FILTERABLE_PROPERTIES: "NonFilterableProperties",
      ALLOWED_EXPRESSIONS: "FilterAllowedExpressions"
    },
    AllowedExpressionsPrio: ["SingleValue", "MultiValue", "SingleRange", "MultiRange", "SearchExpression", "MultiRangeOrSearchExpression"],
    normalizeSearchTerm: normalizeSearchTerm,
    getSingletonPath: getSingletonPath,
    getRequiredPropertiesFromUpdateRestrictions: getRequiredPropertiesFromUpdateRestrictions,
    getRequiredPropertiesFromInsertRestrictions: getRequiredPropertiesFromInsertRestrictions,
    hasRestrictedPropertiesInAnnotations: hasRestrictedPropertiesInAnnotations,
    getRequiredPropertiesFromAnnotations: getRequiredPropertiesFromAnnotations,
    getRequiredProperties: getRequiredProperties,
    checkIfResourceKeyExists: checkIfResourceKeyExists,
    setContextsBasedOnOperationAvailable: setContextsBasedOnOperationAvailable,
    setDynamicActionContexts: setDynamicActionContexts,
    requestProperty: requestProperty,
    getParameterPath: getParameterPath,
    getRelatedAppsMenuItems: _getRelatedAppsMenuItems,
    getTranslatedTextFromExpBindingString: _fntranslatedTextFromExpBindingString,
    addSemanticDatesToConditions: addSemanticDatesToConditions,
    addSelectOptionToConditions: addSelectOptionToConditions,
    createSemanticDatesFromConditions: createSemanticDatesFromConditions,
    updateRelateAppsModel: updateRelateAppsModel,
    getSemanticObjectAnnotations: _getSemanticObjectAnnotations,
    isCustomAggregate: _isCustomAggregate,
    isSmallDevice,
    getConverterContextForPath
  };
  return CommonUtils;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJub3JtYWxpemVTZWFyY2hUZXJtIiwic1NlYXJjaFRlcm0iLCJ1bmRlZmluZWQiLCJyZXBsYWNlIiwic3BsaXQiLCJyZWR1Y2UiLCJzTm9ybWFsaXplZCIsInNDdXJyZW50V29yZCIsImdldFByb3BlcnR5RGF0YVR5cGUiLCJvTmF2aWdhdGlvbkNvbnRleHQiLCJzRGF0YVR5cGUiLCJnZXRQcm9wZXJ0eSIsInNBbm5vdGF0aW9uUGF0aCIsImluZGV4T2YiLCJ3YWl0Rm9yQ29udGV4dFJlcXVlc3RlZCIsImJpbmRpbmdDb250ZXh0IiwibW9kZWwiLCJnZXRNb2RlbCIsIm1ldGFNb2RlbCIsImdldE1ldGFNb2RlbCIsImVudGl0eVBhdGgiLCJnZXRNZXRhUGF0aCIsImdldFBhdGgiLCJkYXRhTW9kZWwiLCJNZXRhTW9kZWxDb252ZXJ0ZXIiLCJnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMiLCJnZXRDb250ZXh0IiwicmVxdWVzdFByb3BlcnR5IiwidGFyZ2V0RW50aXR5VHlwZSIsImtleXMiLCJuYW1lIiwiZm5IYXNUcmFuc2llbnRDb250ZXh0cyIsIm9MaXN0QmluZGluZyIsImJIYXNUcmFuc2llbnRDb250ZXh0cyIsImdldEN1cnJlbnRDb250ZXh0cyIsImZvckVhY2giLCJvQ29udGV4dCIsImlzVHJhbnNpZW50IiwiZ2V0U2VhcmNoUmVzdHJpY3Rpb25zIiwic0Z1bGxQYXRoIiwib01ldGFNb2RlbENvbnRleHQiLCJvU2VhcmNoUmVzdHJpY3Rpb25zIiwib05hdmlnYXRpb25TZWFyY2hSZXN0cmljdGlvbnMiLCJuYXZpZ2F0aW9uVGV4dCIsInNlYXJjaFJlc3RyaWN0aW9uc1Rlcm0iLCJlbnRpdHlUeXBlUGF0aFBhcnRzIiwicmVwbGFjZUFsbCIsImZpbHRlciIsIk1vZGVsSGVscGVyIiwiZmlsdGVyT3V0TmF2UHJvcEJpbmRpbmciLCJlbnRpdHlTZXRQYXRoIiwiZ2V0RW50aXR5U2V0UGF0aCIsImVudGl0eVNldFBhdGhQYXJ0cyIsImlzQ29udGFpbm1lbnQiLCJnZXRPYmplY3QiLCJqb2luIiwiY29udGFpbm1lbnROYXZQYXRoIiwibGVuZ3RoIiwibmF2UGF0aCIsInBhcmVudEVudGl0eVNldFBhdGgiLCJzbGljZSIsIm9OYXZpZ2F0aW9uUmVzdHJpY3Rpb25zIiwiQ29tbW9uVXRpbHMiLCJnZXROYXZpZ2F0aW9uUmVzdHJpY3Rpb25zIiwic0VudGl0eVNldFBhdGgiLCJzTmF2aWdhdGlvblBhdGgiLCJhUmVzdHJpY3RlZFByb3BlcnRpZXMiLCJSZXN0cmljdGVkUHJvcGVydGllcyIsImZpbmQiLCJvUmVzdHJpY3RlZFByb3BlcnR5IiwiTmF2aWdhdGlvblByb3BlcnR5IiwiJE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgiLCJfaXNJbk5vbkZpbHRlcmFibGVQcm9wZXJ0aWVzIiwibWV0YW1vZGVsQ29udGV4dCIsInNDb250ZXh0UGF0aCIsImJJc05vdEZpbHRlcmFibGUiLCJvQW5ub3RhdGlvbiIsIk5vbkZpbHRlcmFibGVQcm9wZXJ0aWVzIiwic29tZSIsInByb3BlcnR5IiwiJFByb3BlcnR5UGF0aCIsIl9pc0N1c3RvbUFnZ3JlZ2F0ZSIsImJDdXN0b21BZ2dyZWdhdGUiLCJiQXBwbHlTdXBwb3J0ZWQiLCJvQW5ub3RhdGlvbnMiLCJvQ3VzdG9tQWdncmVnZ2F0ZXMiLCJtZXRhTW9kZWxVdGlsIiwiZ2V0QWxsQ3VzdG9tQWdncmVnYXRlcyIsImFDdXN0b21BZ2dyZWdhdGVzIiwiT2JqZWN0IiwiX2lzQ29udGV4dFBhdGhGaWx0ZXJhYmxlIiwib01vZGVsQ29udGV4dCIsInNDb250ZXhQYXRoIiwiYUVTUGFydHMiLCJzcGxpY2UiLCJhQ29udGV4dCIsInNDb250ZXh0IiwiaXRlbSIsImluZGV4IiwiYXJyYXkiLCJvRmlsdGVyUmVzdHJpY3Rpb25zIiwiRmlsdGVyUmVzdHJpY3Rpb25zIiwiYU5vbkZpbHRlcmFibGVQcm9wZXJ0aWVzIiwic1RhcmdldFByb3BlcnR5UGF0aCIsIm9Qcm9wZXJ0eVBhdGgiLCJpc1Byb3BlcnR5RmlsdGVyYWJsZSIsIm1ldGFNb2RlbENvbnRleHQiLCJzUHJvcGVydHkiLCJiU2tpcEhpZGRlbkZpbHRlciIsIkVycm9yIiwiYklzRmlsdGVyYWJsZSIsInZhbHVlT2YiLCJjcmVhdGVCaW5kaW5nQ29udGV4dCIsInNIaWRkZW5QYXRoIiwic0hpZGRlbkZpbHRlclBhdGgiLCJjb21waWxlRXhwcmVzc2lvbiIsIm5vdCIsIm9yIiwicGF0aEluTW9kZWwiLCJzUHJvcGVydHlEYXRhVHlwZSIsImlzVHlwZUZpbHRlcmFibGUiLCJnZXRTaGVsbFNlcnZpY2VzIiwib0NvbnRyb2wiLCJnZXRBcHBDb21wb25lbnQiLCJnZXRIYXNoIiwic0hhc2giLCJ3aW5kb3ciLCJsb2NhdGlvbiIsImhhc2giLCJfZ2V0U09JbnRlbnRzIiwib1NoZWxsU2VydmljZUhlbHBlciIsIm9PYmplY3RQYWdlTGF5b3V0Iiwib1NlbWFudGljT2JqZWN0Iiwib1BhcmFtIiwiZ2V0TGlua3MiLCJzZW1hbnRpY09iamVjdCIsInBhcmFtcyIsIl9jcmVhdGVNYXBwaW5ncyIsIm9NYXBwaW5nIiwiYVNPTWFwcGluZ3MiLCJhTWFwcGluZ0tleXMiLCJvU2VtYW50aWNNYXBwaW5nIiwiaSIsIkxvY2FsUHJvcGVydHkiLCJTZW1hbnRpY09iamVjdFByb3BlcnR5IiwicHVzaCIsIl9nZXRSZWxhdGVkQXBwc01lbnVJdGVtcyIsImFMaW5rcyIsImFFeGNsdWRlZEFjdGlvbnMiLCJvVGFyZ2V0UGFyYW1zIiwiYUl0ZW1zIiwiYUFsbG93ZWRBY3Rpb25zIiwib0xpbmsiLCJzSW50ZW50IiwiaW50ZW50Iiwic0FjdGlvbiIsImluY2x1ZGVzIiwidGV4dCIsInRhcmdldFNlbU9iamVjdCIsInRhcmdldEFjdGlvbiIsInRhcmdldFBhcmFtcyIsIl9nZXRSZWxhdGVkSW50ZW50cyIsIm9BZGRpdGlvbmFsU2VtYW50aWNPYmplY3RzIiwib0JpbmRpbmdDb250ZXh0IiwiYU1hbmlmZXN0U09JdGVtcyIsImFsbG93ZWRBY3Rpb25zIiwidW5hdmFpbGFibGVBY3Rpb25zIiwibWFwcGluZyIsIm5hdmlnYXRpb25Db250ZXh0cyIsInNlbWFudGljT2JqZWN0TWFwcGluZyIsInVwZGF0ZVJlbGF0ZUFwcHNNb2RlbCIsIm9FbnRyeSIsImFTZW1LZXlzIiwib01ldGFNb2RlbCIsIm9NZXRhUGF0aCIsInNDdXJyZW50U2VtT2JqIiwic0N1cnJlbnRBY3Rpb24iLCJvU2VtYW50aWNPYmplY3RBbm5vdGF0aW9ucyIsImFSZWxhdGVkQXBwc01lbnVJdGVtcyIsImFNYW5pZmVzdFNPS2V5cyIsImZuR2V0UGFyc2VTaGVsbEhhc2hBbmRHZXRMaW5rcyIsIm9QYXJzZWRVcmwiLCJwYXJzZVNoZWxsSGFzaCIsImRvY3VtZW50IiwiYWN0aW9uIiwiaiIsInNTZW1LZXkiLCJ2YWx1ZSIsImFUZWNobmljYWxLZXlzIiwia2V5Iiwic09iaktleSIsIm9NYW5pZmVzdERhdGEiLCJnZXRUYXJnZXRWaWV3IiwiZ2V0Vmlld0RhdGEiLCJzZW1hbnRpY09iamVjdEludGVudHMiLCJhZGRpdGlvbmFsU2VtYW50aWNPYmplY3RzIiwiUHJvbWlzZSIsInJlc29sdmUiLCJpbnRlcm5hbE1vZGVsQ29udGV4dCIsImdldEJpbmRpbmdDb250ZXh0IiwiaXNTZW1hbnRpY09iamVjdEhhc1NhbWVUYXJnZXRJbk1hbmlmZXN0IiwiYUFubm90YXRpb25zU09JdGVtcyIsInNFbnRpdHlUeXBlUGF0aCIsIm9FbnRpdHlTZXRBbm5vdGF0aW9ucyIsImdldFNlbWFudGljT2JqZWN0QW5ub3RhdGlvbnMiLCJiSGFzRW50aXR5U2V0U08iLCJvRW50aXR5VHlwZUFubm90YXRpb25zIiwiYVVuYXZhaWxhYmxlQWN0aW9ucyIsImFNYXBwaW5ncyIsImNvbmNhdCIsInNldFByb3BlcnR5IiwiZXJyb3IiLCJMb2ciLCJfZ2V0U2VtYW50aWNPYmplY3RBbm5vdGF0aW9ucyIsIm9FbnRpdHlBbm5vdGF0aW9ucyIsInNBbm5vdGF0aW9uTWFwcGluZ1Rlcm0iLCJzQW5ub3RhdGlvbkFjdGlvblRlcm0iLCJzUXVhbGlmaWVyIiwiZm5VcGRhdGVSZWxhdGVkQXBwc0RldGFpbHMiLCJwYXRoIiwic1NlbWFudGljS2V5Vm9jYWJ1bGFyeSIsInJlcXVlc3RPYmplY3QiLCJ0aGVuIiwicmVxdWVzdGVkT2JqZWN0IiwiY2F0Y2giLCJvRXJyb3IiLCJmbkZpcmVCdXR0b25QcmVzcyIsIm9CdXR0b24iLCJpc0EiLCJnZXRWaXNpYmxlIiwiZ2V0RW5hYmxlZCIsImZpcmVQcmVzcyIsImZuUmVzb2x2ZVN0cmluZ3RvQm9vbGVhbiIsInNWYWx1ZSIsIm9Pd25lciIsIkNvbXBvbmVudCIsImdldE93bmVyQ29tcG9uZW50Rm9yIiwiZ2V0Q3VycmVudFBhZ2VWaWV3Iiwib0FwcENvbXBvbmVudCIsInJvb3RWaWV3Q29udHJvbGxlciIsImdldFJvb3RWaWV3Q29udHJvbGxlciIsImlzRmNsRW5hYmxlZCIsImdldFJpZ2h0bW9zdFZpZXciLCJnZXRSb290Q29udGFpbmVyIiwiZ2V0Q3VycmVudFBhZ2UiLCJvQ29tcG9uZW50IiwiZ2V0Q29tcG9uZW50SW5zdGFuY2UiLCJnZXRSb290Q29udHJvbCIsImdldFBhcmVudCIsImlzRmllbGRDb250cm9sUGF0aEluYXBwbGljYWJsZSIsInNGaWVsZENvbnRyb2xQYXRoIiwib0F0dHJpYnV0ZSIsImJJbmFwcGxpY2FibGUiLCJhUGFydHMiLCJoYXNPd25Qcm9wZXJ0eSIsInJlbW92ZVNlbnNpdGl2ZURhdGEiLCJhQXR0cmlidXRlcyIsImFPdXRBdHRyaWJ1dGVzIiwic0VudGl0eVNldCIsImVudGl0eVNldCIsImNvbnRleHREYXRhIiwiYVByb3BlcnRpZXMiLCJzUHJvcCIsImFQcm9wZXJ0eUFubm90YXRpb25zIiwib0ZpZWxkQ29udHJvbCIsIl9mbkNoZWNrSXNNYXRjaCIsIm9PYmplY3QiLCJvS2V5c1RvQ2hlY2siLCJzS2V5IiwiZm5HZXRDb250ZXh0UGF0aFByb3BlcnRpZXMiLCJvRmlsdGVyIiwib0VudGl0eVR5cGUiLCJvUHJvcGVydGllcyIsInRlc3QiLCIka2luZCIsImZuR2V0TWFuZGF0b3J5RmlsdGVyRmllbGRzIiwiYU1hbmRhdG9yeUZpbHRlckZpZWxkcyIsImZuR2V0SUJOQWN0aW9ucyIsImFJQk5BY3Rpb25zIiwiYUFjdGlvbnMiLCJnZXRBY3Rpb25zIiwib0FjdGlvbiIsImdldEFjdGlvbiIsIm9NZW51IiwiZ2V0TWVudSIsImdldEl0ZW1zIiwib0l0ZW0iLCJkYXRhIiwiZm5VcGRhdGVEYXRhRmllbGRGb3JJQk5CdXR0b25zVmlzaWJpbGl0eSIsIm9WaWV3Iiwib1BhcmFtcyIsImlzU3RpY2t5IiwiaXNTdGlja3lTZXNzaW9uU3VwcG9ydGVkIiwiZm5HZXRMaW5rcyIsIm9EYXRhIiwiYUtleXMiLCJvSUJOQWN0aW9uIiwic1NlbWFudGljT2JqZWN0IiwiYUxpbmsiLCJzZXRWaXNpYmxlIiwiZ2V0SWQiLCJzaGVsbE5hdmlnYXRpb25Ob3RBdmFpbGFibGUiLCJnZXRUcmFuc2xhdGVkVGV4dCIsInNGcmFtZXdvcmtLZXkiLCJvUmVzb3VyY2VCdW5kbGUiLCJwYXJhbWV0ZXJzIiwic0VudGl0eVNldE5hbWUiLCJzUmVzb3VyY2VLZXkiLCJiUmVzb3VyY2VLZXlFeGlzdHMiLCJjaGVja0lmUmVzb3VyY2VLZXlFeGlzdHMiLCJhQ3VzdG9tQnVuZGxlcyIsImdldFRleHQiLCJDb3JlIiwiZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlIiwiaGFzVGV4dCIsImdldEFjdGlvblBhdGgiLCJhY3Rpb25Db250ZXh0IiwiYlJldHVybk9ubHlQYXRoIiwic0FjdGlvbk5hbWUiLCJiQ2hlY2tTdGF0aWNWYWx1ZSIsInRvU3RyaW5nIiwic0VudGl0eVR5cGVOYW1lIiwiJFR5cGUiLCJzRW50aXR5TmFtZSIsImdldEVudGl0eVNldE5hbWUiLCJzQmluZGluZ1BhcmFtZXRlciIsInNFbnRpdHlUeXBlIiwib0VudGl0eUNvbnRhaW5lciIsImNvbXB1dGVEaXNwbGF5TW9kZSIsIm9Qcm9wZXJ0eUFubm90YXRpb25zIiwib0NvbGxlY3Rpb25Bbm5vdGF0aW9ucyIsIm9UZXh0QW5ub3RhdGlvbiIsIm9UZXh0QXJyYW5nZW1lbnRBbm5vdGF0aW9uIiwiJEVudW1NZW1iZXIiLCJfZ2V0RW50aXR5VHlwZSIsIl9yZXF1ZXN0T2JqZWN0Iiwib1NlbGVjdGVkQ29udGV4dCIsIm5CcmFja2V0SW5kZXgiLCJzVGFyZ2V0VHlwZSIsInNDdXJyZW50VHlwZSIsImdldEJpbmRpbmciLCJ3YXJuaW5nIiwic0R5bmFtaWNBY3Rpb25FbmFibGVkUGF0aCIsIm9Qcm9taXNlIiwicmVxdWVzdFNpbmdsZXRvblByb3BlcnR5IiwidlByb3BlcnR5VmFsdWUiLCJzZXRDb250ZXh0c0Jhc2VkT25PcGVyYXRpb25BdmFpbGFibGUiLCJvSW50ZXJuYWxNb2RlbENvbnRleHQiLCJhUmVxdWVzdFByb21pc2VzIiwiYWxsIiwiYVJlc3VsdHMiLCJhQXBwbGljYWJsZUNvbnRleHRzIiwiYU5vdEFwcGxpY2FibGVDb250ZXh0cyIsImFSZXN1bHQiLCJzZXREeW5hbWljQWN0aW9uQ29udGV4dHMiLCJ0cmFjZSIsImFBcHBsaWNhYmxlIiwiYU5vdEFwcGxpY2FibGUiLCJzRHluYW1pY0FjdGlvblBhdGhQcmVmaXgiLCJvSW50ZXJuYWxNb2RlbCIsIl9nZXREZWZhdWx0T3BlcmF0b3JzIiwic1Byb3BlcnR5VHlwZSIsIm9EYXRhQ2xhc3MiLCJUeXBlVXRpbCIsImdldERhdGFUeXBlQ2xhc3NOYW1lIiwib0Jhc2VUeXBlIiwiZ2V0QmFzZVR5cGUiLCJGaWx0ZXJPcGVyYXRvclV0aWwiLCJnZXRPcGVyYXRvcnNGb3JUeXBlIiwiX2dldFJlc3RyaWN0aW9ucyIsImFEZWZhdWx0T3BzIiwiYUV4cHJlc3Npb25PcHMiLCJzRWxlbWVudCIsImdldFNwZWNpZmljQWxsb3dlZEV4cHJlc3Npb24iLCJhRXhwcmVzc2lvbnMiLCJhQWxsb3dlZEV4cHJlc3Npb25zUHJpb3JpdHkiLCJBbGxvd2VkRXhwcmVzc2lvbnNQcmlvIiwic29ydCIsImEiLCJiIiwiZ2V0T3BlcmF0b3JzRm9yUHJvcGVydHkiLCJzVHlwZSIsImJVc2VTZW1hbnRpY0RhdGVSYW5nZSIsInNTZXR0aW5ncyIsImdldEZpbHRlclJlc3RyaWN0aW9uc0J5UGF0aCIsImFFcXVhbHNPcHMiLCJhU2luZ2xlUmFuZ2VPcHMiLCJhU2luZ2xlUmFuZ2VEVEJhc2ljT3BzIiwiYVNpbmdsZVZhbHVlRGF0ZU9wcyIsImFCYXNpY0RhdGVUaW1lT3BzIiwiYU11bHRpUmFuZ2VPcHMiLCJhU2VhcmNoRXhwcmVzc2lvbk9wcyIsImFTZW1hbnRpY0RhdGVPcHNFeHQiLCJTZW1hbnRpY0RhdGVPcGVyYXRvcnMiLCJnZXRTdXBwb3J0ZWRPcGVyYXRpb25zIiwiYlNlbWFudGljRGF0ZVJhbmdlIiwiYVNlbWFudGljRGF0ZU9wcyIsIm9TZXR0aW5ncyIsIkpTT04iLCJwYXJzZSIsImN1c3RvbURhdGEiLCJvcGVyYXRvckNvbmZpZ3VyYXRpb24iLCJnZXRGaWx0ZXJPcGVyYXRpb25zIiwiZ2V0U2VtYW50aWNEYXRlT3BlcmF0aW9ucyIsImFEZWZhdWx0T3BlcmF0b3JzIiwicmVzdHJpY3Rpb25zIiwiRmlsdGVyQWxsb3dlZEV4cHJlc3Npb25zIiwic0FsbG93ZWRFeHByZXNzaW9uIiwiYVNpbmdsZVZhbHVlT3BzIiwic09wZXJhdG9ycyIsImdldE9wZXJhdG9yc0Zvckd1aWRQcm9wZXJ0eSIsImFsbG93ZWRPcGVyYXRvcnNGb3JHdWlkIiwiZ2V0T3BlcmF0b3JzRm9yRGF0ZVByb3BlcnR5IiwicHJvcGVydHlUeXBlIiwiZ2V0UGFyYW1ldGVySW5mbyIsInNQYXJhbWV0ZXJDb250ZXh0UGF0aCIsInN1YnN0cmluZyIsImxhc3RJbmRleE9mIiwiYlJlc3VsdENvbnRleHQiLCJvUGFyYW1ldGVySW5mbyIsImNvbnRleHRQYXRoIiwicGFyYW1ldGVyUHJvcGVydGllcyIsImdldENvbnRleHRQYXRoUHJvcGVydGllcyIsImFkZFNlbGVjdE9wdGlvblRvQ29uZGl0aW9ucyIsIm9Qcm9wZXJ0eU1ldGFkYXRhIiwiYVZhbGlkT3BlcmF0b3JzIiwiYVNlbWFudGljRGF0ZU9wZXJhdG9ycyIsImFDdW11bGF0aXZlQ29uZGl0aW9ucyIsIm9TZWxlY3RPcHRpb24iLCJvQ29uZGl0aW9uIiwiZ2V0Q29uZGl0aW9ucyIsIlNlbWFudGljRGF0ZXMiLCJvcGVyYXRvciIsInNlbWFudGljRGF0ZXMiLCJhZGRTZW1hbnRpY0RhdGVzVG9Db25kaXRpb25zIiwib1NlbWFudGljRGF0ZXMiLCJ2YWx1ZXMiLCJoaWdoIiwibG93IiwiaXNFbXB0eSIsImFkZFNlbGVjdE9wdGlvbnNUb0NvbmRpdGlvbnMiLCJvU2VsZWN0aW9uVmFyaWFudCIsInNTZWxlY3RPcHRpb25Qcm9wIiwib0NvbmRpdGlvbnMiLCJzQ29uZGl0aW9uUGF0aCIsInNDb25kaXRpb25Qcm9wIiwib1ZhbGlkUHJvcGVydGllcyIsImlzUGFyYW1ldGVyIiwiYklzRkxQVmFsdWVQcmVzZW50Iiwib1ZpZXdEYXRhIiwiYUNvbmRpdGlvbnMiLCJhU2VsZWN0T3B0aW9ucyIsImdldFNlbGVjdE9wdGlvbiIsInNldHRpbmdzIiwiZ2V0RmlsdGVyQ29uZmlndXJhdGlvblNldHRpbmciLCJiaW5kIiwiZWxlbWVudCIsImNyZWF0ZVNlbWFudGljRGF0ZXNGcm9tQ29uZGl0aW9ucyIsIm9Db25maWciLCJjb250cm9sQ29uZmlndXJhdGlvbiIsImZpbHRlckNvbmZpZyIsImZpbHRlckZpZWxkcyIsImFkZFNlbGVjdGlvblZhcmlhbnRUb0NvbmRpdGlvbnMiLCJiSXNGTFBWYWx1ZXMiLCJhU2VsZWN0T3B0aW9uc1Byb3BlcnR5TmFtZXMiLCJnZXRTZWxlY3RPcHRpb25zUHJvcGVydHlOYW1lcyIsImFNZXRhZGF0UHJvcGVydGllcyIsIm9WYWxpZFBhcmFtZXRlclByb3BlcnRpZXMiLCJhTWV0YWRhdGFQYXJhbWV0ZXJzIiwic01ldGFkYXRhUGFyYW1ldGVyIiwic1NlbGVjdE9wdGlvbk5hbWUiLCJzdGFydHNXaXRoIiwic01ldGFkYXRhUHJvcGVydHkiLCJzU2VsZWN0T3B0aW9uIiwic1JlcGxhY2VkT3B0aW9uIiwic0Z1bGxDb250ZXh0UGF0aCIsIl9jcmVhdGVDb25kaXRpb25zRm9yTmF2UHJvcGVydGllcyIsInNNYWluRW50aXR5U2V0UGF0aCIsImFOYXZPYmplY3ROYW1lcyIsInNOYXZQYXRoIiwic1Byb3BlcnR5TmFtZSIsIiRpc0NvbGxlY3Rpb24iLCJzTmF2UHJvcGVydHlQYXRoIiwiYWRkUGFnZUNvbnRleHRUb1NlbGVjdGlvblZhcmlhbnQiLCJtUGFnZUNvbnRleHQiLCJvTmF2aWdhdGlvblNlcnZpY2UiLCJnZXROYXZpZ2F0aW9uU2VydmljZSIsIm1peEF0dHJpYnV0ZXNBbmRTZWxlY3Rpb25WYXJpYW50IiwidG9KU09OU3RyaW5nIiwiYWRkRXh0ZXJuYWxTdGF0ZUZpbHRlcnNUb1NlbGVjdGlvblZhcmlhbnQiLCJtRmlsdGVycyIsIm9UYXJnZXRJbmZvIiwib0ZpbHRlckJhciIsInNGaWx0ZXIiLCJmbkdldFNpZ25BbmRPcHRpb24iLCJzT3BlcmF0b3IiLCJzTG93VmFsdWUiLCJzSGlnaFZhbHVlIiwib1NlbGVjdE9wdGlvblN0YXRlIiwib3B0aW9uIiwic2lnbiIsIm9GaWx0ZXJDb25kaXRpb25zIiwiZmlsdGVyQ29uZGl0aW9ucyIsIm9GaWx0ZXJzV2l0aG91dENvbmZsaWN0IiwiZmlsdGVyQ29uZGl0aW9uc1dpdGhvdXRDb25mbGljdCIsIm9UYWJsZVByb3BlcnRpZXNXaXRob3V0Q29uZmxpY3QiLCJwcm9wZXJ0aWVzV2l0aG91dENvbmZsaWN0IiwiYWRkRmlsdGVyc1RvU2VsZWN0aW9uVmFyaWFudCIsInNlbGVjdGlvblZhcmlhbnQiLCJzRmlsdGVyTmFtZSIsInNQYXRoIiwib1Byb3BlcnR5SW5mbyIsImdldFByb3BlcnR5SGVscGVyIiwib1R5cGVDb25maWciLCJ0eXBlQ29uZmlnIiwib1R5cGVVdGlsIiwiZ2V0Q29udHJvbERlbGVnYXRlIiwiZ2V0VHlwZVV0aWwiLCJvT3BlcmF0b3IiLCJnZXRPcGVyYXRvciIsIlJhbmdlT3BlcmF0b3IiLCJvTW9kZWxGaWx0ZXIiLCJnZXRNb2RlbEZpbHRlciIsInR5cGVJbnN0YW5jZSIsImJhc2VUeXBlIiwiZ2V0RmlsdGVycyIsImV4Y2x1ZGUiLCJleHRlcm5hbGl6ZVZhbHVlIiwiZ2V0VmFsdWUxIiwiZ2V0VmFsdWUyIiwidmFsdWUxIiwidmFsdWUyIiwiYWRkU2VsZWN0T3B0aW9uIiwiaXNTdGlja3lFZGl0TW9kZSIsImJJc1N0aWNreU1vZGUiLCJiVUlFZGl0YWJsZSIsImFkZERlZmF1bHREaXNwbGF5Q3VycmVuY3kiLCJvU2VsZWN0aW9uVmFyaWFudERlZmF1bHRzIiwiYVNWT3B0aW9uIiwiYURlZmF1bHRTVk9wdGlvbiIsImRpc3BsYXlDdXJyZW5jeVNlbGVjdE9wdGlvbiIsInNTaWduIiwic09wdGlvbiIsInNMb3ciLCJzSGlnaCIsImdldE5vbkNvbXB1dGVkVmlzaWJsZUZpZWxkcyIsIiRLZXkiLCJhTm9uQ29tcHV0ZWRWaXNpYmxlRmllbGRzIiwiYUltbXV0YWJsZVZpc2libGVGaWVsZHMiLCJiSXNLZXkiLCJiSXNJbW11dGFibGUiLCJiSXNOb25Db21wdXRlZCIsImJJc1Zpc2libGUiLCJiSXNDb21wdXRlZERlZmF1bHRWYWx1ZSIsImJJc0tleUNvbXB1dGVkRGVmYXVsdFZhbHVlV2l0aFRleHQiLCJvRGlhZ25vc3RpY3MiLCJnZXREaWFnbm9zdGljcyIsInNNZXNzYWdlIiwiYWRkSXNzdWUiLCJJc3N1ZUNhdGVnb3J5IiwiQW5ub3RhdGlvbiIsIklzc3VlU2V2ZXJpdHkiLCJNZWRpdW0iLCJJc3N1ZUNhdGVnb3J5VHlwZSIsIkFubm90YXRpb25zIiwiSWdub3JlZEFubm90YXRpb24iLCJhUmVxdWlyZWRQcm9wZXJ0aWVzIiwiZ2V0UmVxdWlyZWRQcm9wZXJ0aWVzRnJvbUluc2VydFJlc3RyaWN0aW9ucyIsImdldFJlcXVpcmVkUHJvcGVydGllcyIsImJDaGVja1VwZGF0ZVJlc3RyaWN0aW9ucyIsImFSZXF1aXJlZFByb3BlcnRpZXNXaXRoUGF0aHMiLCJlbmRzV2l0aCIsIm9OYXZSZXN0IiwiaGFzUmVzdHJpY3RlZFByb3BlcnRpZXNJbkFubm90YXRpb25zIiwiUmVxdWlyZWRQcm9wZXJ0aWVzIiwiZ2V0UmVxdWlyZWRQcm9wZXJ0aWVzRnJvbUFubm90YXRpb25zIiwib1JlcXVpcmVkUHJvcGVydHkiLCJnZXRSZXF1aXJlZFByb3BlcnRpZXNGcm9tVXBkYXRlUmVzdHJpY3Rpb25zIiwiYklzTmF2aWdhdGlvblJlc3RyaWN0aW9ucyIsIm9OYXZBbm5vdGF0aW9ucyIsIm9FbnRpdHlBbm5vdGF0aW9uIiwic2V0VXNlckRlZmF1bHRzIiwiYVBhcmFtZXRlcnMiLCJvTW9kZWwiLCJiSXNBY3Rpb24iLCJiSXNDcmVhdGUiLCJvQWN0aW9uRGVmYXVsdFZhbHVlcyIsIm9Db21wb25lbnREYXRhIiwiZ2V0Q29tcG9uZW50RGF0YSIsIm9TdGFydHVwUGFyYW1ldGVycyIsInN0YXJ0dXBQYXJhbWV0ZXJzIiwib1NoZWxsU2VydmljZXMiLCJoYXNVU2hlbGwiLCJvUGFyYW1ldGVyIiwiJE5hbWUiLCJzUGFyYW1ldGVyTmFtZSIsImdldFN0YXJ0dXBBcHBTdGF0ZSIsIm9TdGFydHVwQXBwU3RhdGUiLCJnZXREYXRhIiwiYUV4dGVuZGVkUGFyYW1ldGVycyIsIlNlbGVjdE9wdGlvbnMiLCJvRXh0ZW5kZWRQYXJhbWV0ZXIiLCJQcm9wZXJ0eU5hbWUiLCJvUmFuZ2UiLCJSYW5nZXMiLCJTaWduIiwiT3B0aW9uIiwiTG93IiwiZ2V0QWRkaXRpb25hbFBhcmFtc0ZvckNyZWF0ZSIsIm9JbmJvdW5kUGFyYW1ldGVycyIsIm9JbmJvdW5kcyIsImFDcmVhdGVQYXJhbWV0ZXJzIiwic1BhcmFtZXRlciIsInVzZUZvckNyZWF0ZSIsIm9SZXQiLCJzQ3JlYXRlUGFyYW1ldGVyIiwiYVZhbHVlcyIsImNyZWF0ZSIsImdldFNlbWFudGljT2JqZWN0TWFwcGluZyIsIm9PdXRib3VuZCIsImFTZW1hbnRpY09iamVjdE1hcHBpbmciLCJzUGFyYW0iLCJmb3JtYXQiLCJnZXRIZWFkZXJGYWNldEl0ZW1Db25maWdGb3JFeHRlcm5hbE5hdmlnYXRpb24iLCJvQ3Jvc3NOYXYiLCJvSGVhZGVyRmFjZXRJdGVtcyIsInNJZCIsIm9Db250cm9sQ29uZmlnIiwiY29uZmlnIiwic091dGJvdW5kIiwibmF2aWdhdGlvbiIsInRhcmdldE91dGJvdW5kIiwib3V0Ym91bmQiLCJnZW5lcmF0ZSIsInNldFNlbWFudGljT2JqZWN0TWFwcGluZ3MiLCJ2TWFwcGluZ3MiLCJvTWFwcGluZ3MiLCJzTG9jYWxQcm9wZXJ0eSIsInNTZW1hbnRpY09iamVjdFByb3BlcnR5IiwicmVtb3ZlU2VsZWN0T3B0aW9uIiwibWFzc0FkZFNlbGVjdE9wdGlvbiIsImZuR2V0U2VtYW50aWNPYmplY3RzRnJvbVBhdGgiLCJhU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMiLCJhU2VtYW50aWNPYmplY3RGb3JHZXRMaW5rcyIsInNlbWFudGljT2JqZWN0UGF0aCIsInNlbWFudGljT2JqZWN0Rm9yR2V0TGlua3MiLCJmblVwZGF0ZVNlbWFudGljVGFyZ2V0c01vZGVsIiwiYUdldExpbmtzUHJvbWlzZXMiLCJhU2VtYW50aWNPYmplY3RzIiwic0N1cnJlbnRIYXNoIiwiX29MaW5rIiwiX3NMaW5rSW50ZW50QWN0aW9uIiwiYUZpbmFsTGlua3MiLCJvRmluYWxTZW1hbnRpY09iamVjdHMiLCJiSW50ZW50SGFzQWN0aW9ucyIsImsiLCJvVG1wIiwic0FsdGVybmF0ZVBhdGgiLCJoYXNUYXJnZXRzTm90RmlsdGVyZWQiLCJoYXNUYXJnZXRzIiwiaUxpbmtDb3VudCIsIkhhc1RhcmdldHMiLCJIYXNUYXJnZXRzTm90RmlsdGVyZWQiLCJhc3NpZ24iLCJzU2VtYW50aWNPYmplY3ROYW1lIiwibWVyZ2VPYmplY3RzIiwiZm5HZXRTZW1hbnRpY09iamVjdFByb21pc2UiLCJnZXRTZW1hbnRpY09iamVjdHNGcm9tUGF0aCIsImZuUHJlcGFyZVNlbWFudGljT2JqZWN0c1Byb21pc2VzIiwiX29BcHBDb21wb25lbnQiLCJfb1ZpZXciLCJfb01ldGFNb2RlbCIsIl9hU2VtYW50aWNPYmplY3RzRm91bmQiLCJfYVNlbWFudGljT2JqZWN0c1Byb21pc2VzIiwiX0tleXMiLCJyZWdleFJlc3VsdCIsImV4ZWMiLCJnZXRTZW1hbnRpY09iamVjdFByb21pc2UiLCJmbkdldFNlbWFudGljVGFyZ2V0c0Zyb21QYWdlTW9kZWwiLCJvQ29udHJvbGxlciIsInNQYWdlTW9kZWwiLCJfZm5maW5kVmFsdWVzSGVscGVyIiwib2JqIiwibGlzdCIsIkFycmF5IiwiY2hpbGRyZW4iLCJfZm5maW5kVmFsdWVzIiwiX2ZuRGVsZXRlRHVwbGljYXRlU2VtYW50aWNPYmplY3RzIiwiYVNlbWFudGljT2JqZWN0UGF0aCIsImdldFZpZXciLCJhU2VtYW50aWNPYmplY3RzUHJvbWlzZXMiLCJnZXRPd25lckNvbXBvbmVudCIsIm9QYWdlTW9kZWwiLCJzdHJpbmdpZnkiLCJfZ2V0T2JqZWN0IiwiYVNlbWFudGljT2JqZWN0c0ZvdW5kIiwiYVNlbWFudGljT2JqZWN0c0ZvckdldExpbmtzIiwiX29TZW1hbnRpY09iamVjdCIsInNTZW1PYmpFeHByZXNzaW9uIiwiYVNlbWFudGljT2JqZWN0c1Jlc29sdmVkIiwiJFBhdGgiLCJnZXRMaW5rc1dpdGhDYWNoZSIsInVwZGF0ZVNlbWFudGljVGFyZ2V0cyIsImdldEZpbHRlckFsbG93ZWRFeHByZXNzaW9uIiwib0ZpbHRlclJlc3RyaWN0aW9uc0Fubm90YXRpb24iLCJtQWxsb3dlZEV4cHJlc3Npb25zIiwiRmlsdGVyRXhwcmVzc2lvblJlc3RyaWN0aW9ucyIsIm9Qcm9wZXJ0eSIsIlByb3BlcnR5IiwiQWxsb3dlZEV4cHJlc3Npb25zIiwiZ2V0RmlsdGVyUmVzdHJpY3Rpb25zIiwic1Jlc3RyaWN0aW9uIiwiYVByb3BzIiwibWFwIiwiX2ZldGNoUHJvcGVydGllc0Zvck5hdlBhdGgiLCJwYXRocyIsInByb3BzIiwibmF2UGF0aFByZWZpeCIsIm91dFBhdGhzIiwicGF0aFRvQ2hlY2siLCJvdXRQYXRoIiwiZnJUZXJtIiwiZW50aXR5VHlwZVBhdGgiLCJyZXN1bHRDb250ZXh0Q2hlY2siLCJvUGFyZW50UmV0Iiwib1BhcmVudEZSIiwiY29tcGxldGVBbGxvd2VkRXhwcyIsIm91dFByb3AiLCJwcm9wUGF0aCIsIm91dFByb3BQYXRoIiwib05hdlJlc3RyaWN0aW9ucyIsIm9OYXZGaWx0ZXJSZXN0IiwibmF2UmVzUmVxUHJvcHMiLCJ1bmlxdWVTb3J0IiwibmF2Tm9uRmlsdGVyUHJvcHMiLCJuYXZBc3NvY2lhdGlvbkVudGl0eVJlc3QiLCJuYXZBc3NvY1JlcVByb3BzIiwibmF2QXNzb2NOb25GaWx0ZXJQcm9wcyIsInRlbXBsYXRlQ29udHJvbEZyYWdtZW50Iiwic0ZyYWdtZW50TmFtZSIsIm9QcmVwcm9jZXNzb3JTZXR0aW5ncyIsIm9PcHRpb25zIiwib01vZGlmaWVyIiwidmlldyIsIm9GcmFnbWVudCIsInRhcmdldHMiLCJsb2FkTWFjcm9MaWJyYXJ5IiwiWE1MUHJlcHJvY2Vzc29yIiwicHJvY2VzcyIsIlhNTFRlbXBsYXRlUHJvY2Vzc29yIiwibG9hZFRlbXBsYXRlIiwiZmlyc3RFbGVtZW50Q2hpbGQiLCJpc1hNTCIsIkZyYWdtZW50IiwibG9hZCIsImlkIiwiZGVmaW5pdGlvbiIsImNvbnRyb2xsZXIiLCJnZXRTaW5nbGV0b25QYXRoIiwicGFydHMiLCJCb29sZWFuIiwicHJvcGVydHlOYW1lIiwicG9wIiwibmF2aWdhdGlvblBhdGgiLCJzaW5nbGV0b25OYW1lIiwicmVzb2x2ZWRQYXRoIiwicHJvcGVydHlCaW5kaW5nIiwiYmluZFByb3BlcnR5IiwicmVxdWVzdFZhbHVlIiwiYWRkRXZlbnRUb0JpbmRpbmdJbmZvIiwic0V2ZW50TmFtZSIsImZIYW5kbGVyIiwib0JpbmRpbmdJbmZvIiwic2V0QmluZGluZ0luZm8iLCJldmVudHMiLCJmT3JpZ2luYWxIYW5kbGVyIiwiYXJncyIsImFwcGx5IiwiaW5uZXJDaGFydEJvdW5kIiwiX2dldENoYXJ0IiwiZ2V0QmluZGluZ0luZm8iLCJzRXJyb3IiLCJzYXAiLCJ1aSIsInJlcXVpcmUiLCJnZXRQYXJhbWV0ZXJQYXRoIiwiYUFjdGlvbiIsIl9mbnRyYW5zbGF0ZWRUZXh0RnJvbUV4cEJpbmRpbmdTdHJpbmciLCJleHBCaW5kaW5nIiwiY29udHJvbCIsImFueVJlc291cmNlVGV4dCIsIkFueUVsZW1lbnQiLCJhbnlUZXh0IiwiYWRkRGVwZW5kZW50IiwicmVzdWx0VGV4dCIsImdldEFueVRleHQiLCJyZW1vdmVEZXBlbmRlbnQiLCJkZXN0cm95IiwiaXNTbWFsbERldmljZSIsInN5c3RlbSIsImRlc2t0b3AiLCJEZXZpY2UiLCJyZXNpemUiLCJ3aWR0aCIsImdldENvbnZlcnRlckNvbnRleHRGb3JQYXRoIiwic01ldGFQYXRoIiwiQ29udmVydGVyQ29udGV4dCIsImNyZWF0ZUNvbnZlcnRlckNvbnRleHRGb3JNYWNybyIsImZpcmVCdXR0b25QcmVzcyIsImhhc1RyYW5zaWVudENvbnRleHQiLCJ1cGRhdGVSZWxhdGVkQXBwc0RldGFpbHMiLCJyZXNvbHZlU3RyaW5ndG9Cb29sZWFuIiwiZ2V0TWFuZGF0b3J5RmlsdGVyRmllbGRzIiwidXBkYXRlRGF0YUZpZWxkRm9ySUJOQnV0dG9uc1Zpc2liaWxpdHkiLCJnZXRJQk5BY3Rpb25zIiwiZ2V0U2VtYW50aWNUYXJnZXRzRnJvbVBhZ2VNb2RlbCIsIlJFUVVJUkVEX1BST1BFUlRJRVMiLCJOT05fRklMVEVSQUJMRV9QUk9QRVJUSUVTIiwiQUxMT1dFRF9FWFBSRVNTSU9OUyIsImdldFJlbGF0ZWRBcHBzTWVudUl0ZW1zIiwiZ2V0VHJhbnNsYXRlZFRleHRGcm9tRXhwQmluZGluZ1N0cmluZyIsImlzQ3VzdG9tQWdncmVnYXRlIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJDb21tb25VdGlscy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSAqIGFzIEVkbSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvRWRtXCI7XG5pbXBvcnQgdHlwZSB7XG5cdEZpbHRlclJlc3RyaWN0aW9uc1R5cGUsXG5cdE5hdmlnYXRpb25Qcm9wZXJ0eVJlc3RyaWN0aW9uVHlwZXMsXG5cdE5hdmlnYXRpb25SZXN0cmljdGlvbnNUeXBlLFxuXHRTZWFyY2hSZXN0cmljdGlvbnNUeXBlXG59IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvQ2FwYWJpbGl0aWVzXCI7XG5pbXBvcnQgdHlwZSB7IFNlbWFudGljT2JqZWN0TWFwcGluZ1R5cGUsIFNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9Db21tb25cIjtcbmltcG9ydCB7IENvbW1vbkFubm90YXRpb25UZXJtcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvQ29tbW9uXCI7XG5pbXBvcnQgdHlwZSB7IFRleHRBcnJhbmdlbWVudCB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlcIjtcbmltcG9ydCB0eXBlIFJlc291cmNlQnVuZGxlIGZyb20gXCJzYXAvYmFzZS9pMThuL1Jlc291cmNlQnVuZGxlXCI7XG5pbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCB1bmlxdWVTb3J0IGZyb20gXCJzYXAvYmFzZS91dGlsL2FycmF5L3VuaXF1ZVNvcnRcIjtcbmltcG9ydCBtZXJnZU9iamVjdHMgZnJvbSBcInNhcC9iYXNlL3V0aWwvbWVyZ2VcIjtcbmltcG9ydCB0eXBlIEFwcENvbXBvbmVudCBmcm9tIFwic2FwL2ZlL2NvcmUvQXBwQ29tcG9uZW50XCI7XG5pbXBvcnQgQ29udmVydGVyQ29udGV4dCBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9Db252ZXJ0ZXJDb250ZXh0XCI7XG5pbXBvcnQgeyBJc3N1ZUNhdGVnb3J5LCBJc3N1ZUNhdGVnb3J5VHlwZSwgSXNzdWVTZXZlcml0eSB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvSXNzdWVNYW5hZ2VyXCI7XG5pbXBvcnQgKiBhcyBNZXRhTW9kZWxDb252ZXJ0ZXIgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvTWV0YU1vZGVsQ29udmVydGVyXCI7XG5pbXBvcnQgdHlwZSB7IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCB7IGNvbXBpbGVFeHByZXNzaW9uLCBub3QsIG9yLCBwYXRoSW5Nb2RlbCB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQgdHlwZSB7IEludGVybmFsTW9kZWxDb250ZXh0IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTW9kZWxIZWxwZXJcIjtcbmltcG9ydCBNb2RlbEhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Nb2RlbEhlbHBlclwiO1xuaW1wb3J0IFNlbWFudGljRGF0ZU9wZXJhdG9ycyBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9TZW1hbnRpY0RhdGVPcGVyYXRvcnNcIjtcbmltcG9ydCB7IGdlbmVyYXRlIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvU3RhYmxlSWRIZWxwZXJcIjtcbmltcG9ydCB0eXBlIFBhZ2VDb250cm9sbGVyIGZyb20gXCJzYXAvZmUvY29yZS9QYWdlQ29udHJvbGxlclwiO1xuaW1wb3J0IHR5cGUgeyBJU2hlbGxTZXJ2aWNlcyB9IGZyb20gXCJzYXAvZmUvY29yZS9zZXJ2aWNlcy9TaGVsbFNlcnZpY2VzRmFjdG9yeVwiO1xuaW1wb3J0IERpYWdub3N0aWNzIGZyb20gXCJzYXAvZmUvY29yZS9zdXBwb3J0L0RpYWdub3N0aWNzXCI7XG5pbXBvcnQgeyBEZWZhdWx0VHlwZUZvckVkbVR5cGUsIGlzVHlwZUZpbHRlcmFibGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvdHlwZS9FRE1cIjtcbmltcG9ydCBUeXBlVXRpbCBmcm9tIFwic2FwL2ZlL2NvcmUvdHlwZS9UeXBlVXRpbFwiO1xuaW1wb3J0IG1ldGFNb2RlbFV0aWwgZnJvbSBcInNhcC9mZS9tYWNyb3MvT0RhdGFNZXRhTW9kZWxVdGlsXCI7XG5pbXBvcnQgdHlwZSBTZWxlY3Rpb25WYXJpYW50IGZyb20gXCJzYXAvZmUvbmF2aWdhdGlvbi9TZWxlY3Rpb25WYXJpYW50XCI7XG5pbXBvcnQgdHlwZSB7IFNlbGVjdE9wdGlvbiwgU2VtYW50aWNEYXRlQ29uZmlndXJhdGlvbiB9IGZyb20gXCJzYXAvZmUvbmF2aWdhdGlvbi9TZWxlY3Rpb25WYXJpYW50XCI7XG5pbXBvcnQgdHlwZSBCdXR0b24gZnJvbSBcInNhcC9tL0J1dHRvblwiO1xuaW1wb3J0IHR5cGUgTWVudUJ1dHRvbiBmcm9tIFwic2FwL20vTWVudUJ1dHRvblwiO1xuaW1wb3J0IHR5cGUgTmF2Q29udGFpbmVyIGZyb20gXCJzYXAvbS9OYXZDb250YWluZXJcIjtcbmltcG9ydCB0eXBlIE92ZXJmbG93VG9vbGJhckJ1dHRvbiBmcm9tIFwic2FwL20vT3ZlcmZsb3dUb29sYmFyQnV0dG9uXCI7XG5pbXBvcnQgdHlwZSBNYW5hZ2VkT2JqZWN0IGZyb20gXCJzYXAvdWkvYmFzZS9NYW5hZ2VkT2JqZWN0XCI7XG5pbXBvcnQgdHlwZSB7IEFnZ3JlZ2F0aW9uQmluZGluZ0luZm8gfSBmcm9tIFwic2FwL3VpL2Jhc2UvTWFuYWdlZE9iamVjdFwiO1xuaW1wb3J0IENvbXBvbmVudCBmcm9tIFwic2FwL3VpL2NvcmUvQ29tcG9uZW50XCI7XG5pbXBvcnQgdHlwZSBDb21wb25lbnRDb250YWluZXIgZnJvbSBcInNhcC91aS9jb3JlL0NvbXBvbmVudENvbnRhaW5lclwiO1xuaW1wb3J0IHR5cGUgQ29udHJvbCBmcm9tIFwic2FwL3VpL2NvcmUvQ29udHJvbFwiO1xuaW1wb3J0IENvcmUgZnJvbSBcInNhcC91aS9jb3JlL0NvcmVcIjtcbmltcG9ydCB0eXBlIFVJNUVsZW1lbnQgZnJvbSBcInNhcC91aS9jb3JlL0VsZW1lbnRcIjtcbmltcG9ydCBGcmFnbWVudCBmcm9tIFwic2FwL3VpL2NvcmUvRnJhZ21lbnRcIjtcbmltcG9ydCB0eXBlIENvbnRyb2xsZXIgZnJvbSBcInNhcC91aS9jb3JlL212Yy9Db250cm9sbGVyXCI7XG5pbXBvcnQgdHlwZSBWaWV3IGZyb20gXCJzYXAvdWkvY29yZS9tdmMvVmlld1wiO1xuaW1wb3J0IFhNTFByZXByb2Nlc3NvciBmcm9tIFwic2FwL3VpL2NvcmUvdXRpbC9YTUxQcmVwcm9jZXNzb3JcIjtcbmltcG9ydCBYTUxUZW1wbGF0ZVByb2Nlc3NvciBmcm9tIFwic2FwL3VpL2NvcmUvWE1MVGVtcGxhdGVQcm9jZXNzb3JcIjtcbmltcG9ydCBEZXZpY2UsIHsgc3lzdGVtIH0gZnJvbSBcInNhcC91aS9EZXZpY2VcIjtcbmltcG9ydCB0eXBlIEFjdGlvblRvb2xiYXJBY3Rpb24gZnJvbSBcInNhcC91aS9tZGMvYWN0aW9udG9vbGJhci9BY3Rpb25Ub29sYmFyQWN0aW9uXCI7XG5pbXBvcnQgdHlwZSBDaGFydCBmcm9tIFwic2FwL3VpL21kYy9DaGFydFwiO1xuaW1wb3J0IHR5cGUgeyBDb25kaXRpb25PYmplY3QgfSBmcm9tIFwic2FwL3VpL21kYy9jb25kaXRpb24vQ29uZGl0aW9uXCI7XG5pbXBvcnQgRmlsdGVyT3BlcmF0b3JVdGlsIGZyb20gXCJzYXAvdWkvbWRjL2NvbmRpdGlvbi9GaWx0ZXJPcGVyYXRvclV0aWxcIjtcbmltcG9ydCBSYW5nZU9wZXJhdG9yIGZyb20gXCJzYXAvdWkvbWRjL2NvbmRpdGlvbi9SYW5nZU9wZXJhdG9yXCI7XG5pbXBvcnQgdHlwZSBGaWx0ZXJCYXIgZnJvbSBcInNhcC91aS9tZGMvRmlsdGVyQmFyXCI7XG5pbXBvcnQgdHlwZSBEZWxlZ2F0ZU1peGluIGZyb20gXCJzYXAvdWkvbWRjL21peGluL0RlbGVnYXRlTWl4aW5cIjtcbmltcG9ydCB0eXBlIFRhYmxlIGZyb20gXCJzYXAvdWkvbWRjL1RhYmxlXCI7XG5pbXBvcnQgdHlwZSBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvQ29udGV4dFwiO1xuaW1wb3J0IHR5cGUgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcbmltcG9ydCB0eXBlIE9EYXRhVjRDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvQ29udGV4dFwiO1xuaW1wb3J0IHR5cGUgT0RhdGFMaXN0QmluZGluZyBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTGlzdEJpbmRpbmdcIjtcbmltcG9ydCB0eXBlIE9EYXRhTWV0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFNZXRhTW9kZWxcIjtcbmltcG9ydCB0eXBlIE9EYXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1vZGVsXCI7XG5pbXBvcnQgdHlwZSBPYmplY3RQYWdlRHluYW1pY0hlYWRlclRpdGxlIGZyb20gXCJzYXAvdXhhcC9PYmplY3RQYWdlRHluYW1pY0hlYWRlclRpdGxlXCI7XG5pbXBvcnQgdHlwZSBPYmplY3RQYWdlTGF5b3V0IGZyb20gXCJzYXAvdXhhcC9PYmplY3RQYWdlTGF5b3V0XCI7XG5pbXBvcnQgdHlwZSB7IFY0Q29udGV4dCB9IGZyb20gXCJ0eXBlcy9leHRlbnNpb25fdHlwZXNcIjtcbmltcG9ydCB0eXBlIHtcblx0RXhwYW5kUGF0aFR5cGUsXG5cdE1ldGFNb2RlbEVudGl0eVNldEFubm90YXRpb24sXG5cdE1ldGFNb2RlbEVudGl0eVR5cGUsXG5cdE1ldGFNb2RlbEVudW0sXG5cdE1ldGFNb2RlbE5hdlByb3BlcnR5LFxuXHRNZXRhTW9kZWxQcm9wZXJ0eSxcblx0TWV0YU1vZGVsVHlwZVxufSBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vLi4vdHlwZXMvZXh0ZW5zaW9uX3R5cGVzXCI7XG5pbXBvcnQgQW55RWxlbWVudCBmcm9tIFwiLi9jb250cm9scy9BbnlFbGVtZW50XCI7XG5pbXBvcnQgeyBnZXRDb25kaXRpb25zIH0gZnJvbSBcIi4vdGVtcGxhdGluZy9GaWx0ZXJIZWxwZXJcIjtcblxudHlwZSBJbnRlcm5hbFJlc291cmNlQnVuZGxlID0gUmVzb3VyY2VCdW5kbGUgJiB7XG5cdGFDdXN0b21CdW5kbGVzOiBJbnRlcm5hbFJlc291cmNlQnVuZGxlW107XG59O1xuXG50eXBlIENvbmRpdGlvblR5cGUgPSB7XG5cdG9wZXJhdG9yOiBzdHJpbmc7XG5cdHZhbHVlczogQXJyYXk8dW5rbm93bj4gfCB1bmRlZmluZWQ7XG5cdHZhbGlkYXRlZD86IHN0cmluZztcbn07XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZVNlYXJjaFRlcm0oc1NlYXJjaFRlcm06IHN0cmluZykge1xuXHRpZiAoIXNTZWFyY2hUZXJtKSB7XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXG5cdHJldHVybiBzU2VhcmNoVGVybVxuXHRcdC5yZXBsYWNlKC9cIi9nLCBcIiBcIilcblx0XHQucmVwbGFjZSgvXFxcXC9nLCBcIlxcXFxcXFxcXCIpIC8vZXNjYXBlIGJhY2tzbGFzaCBjaGFyYWN0ZXJzLiBDYW4gYmUgcmVtb3ZlZCBpZiBvZGF0YS9iaW5kaW5nIGhhbmRsZXMgYmFja2VuZCBlcnJvcnMgcmVzcG9uZHMuXG5cdFx0LnNwbGl0KC9cXHMrLylcblx0XHQucmVkdWNlKGZ1bmN0aW9uIChzTm9ybWFsaXplZDogc3RyaW5nIHwgdW5kZWZpbmVkLCBzQ3VycmVudFdvcmQ6IHN0cmluZykge1xuXHRcdFx0aWYgKHNDdXJyZW50V29yZCAhPT0gXCJcIikge1xuXHRcdFx0XHRzTm9ybWFsaXplZCA9IGAke3NOb3JtYWxpemVkID8gYCR7c05vcm1hbGl6ZWR9IGAgOiBcIlwifVwiJHtzQ3VycmVudFdvcmR9XCJgO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHNOb3JtYWxpemVkO1xuXHRcdH0sIHVuZGVmaW5lZCk7XG59XG5cbmZ1bmN0aW9uIGdldFByb3BlcnR5RGF0YVR5cGUob05hdmlnYXRpb25Db250ZXh0OiBDb250ZXh0KSB7XG5cdGxldCBzRGF0YVR5cGUgPSBvTmF2aWdhdGlvbkNvbnRleHQuZ2V0UHJvcGVydHkoXCIkVHlwZVwiKTtcblx0Ly8gaWYgJGtpbmQgZXhpc3RzLCBpdCdzIG5vdCBhIERhdGFGaWVsZCBhbmQgd2UgaGF2ZSB0aGUgZmluYWwgdHlwZSBhbHJlYWR5XG5cdGlmICghb05hdmlnYXRpb25Db250ZXh0LmdldFByb3BlcnR5KFwiJGtpbmRcIikpIHtcblx0XHRzd2l0Y2ggKHNEYXRhVHlwZSkge1xuXHRcdFx0Y2FzZSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZEZvckFjdGlvblwiOlxuXHRcdFx0Y2FzZSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvblwiOlxuXHRcdFx0XHRzRGF0YVR5cGUgPSB1bmRlZmluZWQ7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkXCI6XG5cdFx0XHRjYXNlIFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkV2l0aE5hdmlnYXRpb25QYXRoXCI6XG5cdFx0XHRjYXNlIFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkV2l0aFVybFwiOlxuXHRcdFx0Y2FzZSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZFdpdGhJbnRlbnRCYXNlZE5hdmlnYXRpb25cIjpcblx0XHRcdGNhc2UgXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRXaXRoQWN0aW9uXCI6XG5cdFx0XHRcdHNEYXRhVHlwZSA9IG9OYXZpZ2F0aW9uQ29udGV4dC5nZXRQcm9wZXJ0eShcIlZhbHVlLyRQYXRoLyRUeXBlXCIpO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZEZvckFubm90YXRpb25cIjpcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdGNvbnN0IHNBbm5vdGF0aW9uUGF0aCA9IG9OYXZpZ2F0aW9uQ29udGV4dC5nZXRQcm9wZXJ0eShcIlRhcmdldC8kQW5ub3RhdGlvblBhdGhcIik7XG5cdFx0XHRcdGlmIChzQW5ub3RhdGlvblBhdGgpIHtcblx0XHRcdFx0XHRpZiAoc0Fubm90YXRpb25QYXRoLmluZGV4T2YoXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tdW5pY2F0aW9uLnYxLkNvbnRhY3RcIikgPiAtMSkge1xuXHRcdFx0XHRcdFx0c0RhdGFUeXBlID0gb05hdmlnYXRpb25Db250ZXh0LmdldFByb3BlcnR5KFwiVGFyZ2V0LyRBbm5vdGF0aW9uUGF0aC9mbi8kUGF0aC8kVHlwZVwiKTtcblx0XHRcdFx0XHR9IGVsc2UgaWYgKHNBbm5vdGF0aW9uUGF0aC5pbmRleE9mKFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YVBvaW50XCIpID4gLTEpIHtcblx0XHRcdFx0XHRcdHNEYXRhVHlwZSA9IG9OYXZpZ2F0aW9uQ29udGV4dC5nZXRQcm9wZXJ0eShcIlZhbHVlLyRQYXRoLyRUeXBlXCIpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHQvLyBlLmcuIEZpZWxkR3JvdXAgb3IgQ2hhcnRcblx0XHRcdFx0XHRcdHNEYXRhVHlwZSA9IHVuZGVmaW5lZDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0c0RhdGFUeXBlID0gdW5kZWZpbmVkO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBzRGF0YVR5cGU7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHdhaXRGb3JDb250ZXh0UmVxdWVzdGVkKGJpbmRpbmdDb250ZXh0OiBWNENvbnRleHQpIHtcblx0Y29uc3QgbW9kZWwgPSBiaW5kaW5nQ29udGV4dC5nZXRNb2RlbCgpO1xuXHRjb25zdCBtZXRhTW9kZWwgPSBtb2RlbC5nZXRNZXRhTW9kZWwoKTtcblx0Y29uc3QgZW50aXR5UGF0aCA9IG1ldGFNb2RlbC5nZXRNZXRhUGF0aChiaW5kaW5nQ29udGV4dC5nZXRQYXRoKCkpO1xuXHRjb25zdCBkYXRhTW9kZWwgPSBNZXRhTW9kZWxDb252ZXJ0ZXIuZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKG1ldGFNb2RlbC5nZXRDb250ZXh0KGVudGl0eVBhdGgpKTtcblx0YXdhaXQgYmluZGluZ0NvbnRleHQucmVxdWVzdFByb3BlcnR5KGRhdGFNb2RlbC50YXJnZXRFbnRpdHlUeXBlLmtleXNbMF0/Lm5hbWUpO1xufVxuXG5mdW5jdGlvbiBmbkhhc1RyYW5zaWVudENvbnRleHRzKG9MaXN0QmluZGluZzogT0RhdGFMaXN0QmluZGluZykge1xuXHRsZXQgYkhhc1RyYW5zaWVudENvbnRleHRzID0gZmFsc2U7XG5cdGlmIChvTGlzdEJpbmRpbmcpIHtcblx0XHRvTGlzdEJpbmRpbmcuZ2V0Q3VycmVudENvbnRleHRzKCkuZm9yRWFjaChmdW5jdGlvbiAob0NvbnRleHQ6IE9EYXRhVjRDb250ZXh0KSB7XG5cdFx0XHRpZiAob0NvbnRleHQgJiYgb0NvbnRleHQuaXNUcmFuc2llbnQoKSkge1xuXHRcdFx0XHRiSGFzVHJhbnNpZW50Q29udGV4dHMgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cdHJldHVybiBiSGFzVHJhbnNpZW50Q29udGV4dHM7XG59XG5cbmZ1bmN0aW9uIGdldFNlYXJjaFJlc3RyaWN0aW9ucyhzRnVsbFBhdGg6IHN0cmluZywgb01ldGFNb2RlbENvbnRleHQ6IE9EYXRhTWV0YU1vZGVsKSB7XG5cdGxldCBvU2VhcmNoUmVzdHJpY3Rpb25zO1xuXHRsZXQgb05hdmlnYXRpb25TZWFyY2hSZXN0cmljdGlvbnM7XG5cdGNvbnN0IG5hdmlnYXRpb25UZXh0ID0gXCIkTmF2aWdhdGlvblByb3BlcnR5QmluZGluZ1wiO1xuXHRjb25zdCBzZWFyY2hSZXN0cmljdGlvbnNUZXJtID0gXCJAT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5TZWFyY2hSZXN0cmljdGlvbnNcIjtcblx0Y29uc3QgZW50aXR5VHlwZVBhdGhQYXJ0cyA9IHNGdWxsUGF0aC5yZXBsYWNlQWxsKFwiJTJGXCIsIFwiL1wiKS5zcGxpdChcIi9cIikuZmlsdGVyKE1vZGVsSGVscGVyLmZpbHRlck91dE5hdlByb3BCaW5kaW5nKTtcblx0Y29uc3QgZW50aXR5U2V0UGF0aCA9IE1vZGVsSGVscGVyLmdldEVudGl0eVNldFBhdGgoc0Z1bGxQYXRoLCBvTWV0YU1vZGVsQ29udGV4dCk7XG5cdGNvbnN0IGVudGl0eVNldFBhdGhQYXJ0cyA9IGVudGl0eVNldFBhdGguc3BsaXQoXCIvXCIpLmZpbHRlcihNb2RlbEhlbHBlci5maWx0ZXJPdXROYXZQcm9wQmluZGluZyk7XG5cdGNvbnN0IGlzQ29udGFpbm1lbnQgPSBvTWV0YU1vZGVsQ29udGV4dC5nZXRPYmplY3QoYC8ke2VudGl0eVR5cGVQYXRoUGFydHMuam9pbihcIi9cIil9LyRDb250YWluc1RhcmdldGApO1xuXHRjb25zdCBjb250YWlubWVudE5hdlBhdGggPSBpc0NvbnRhaW5tZW50ICYmIGVudGl0eVR5cGVQYXRoUGFydHNbZW50aXR5VHlwZVBhdGhQYXJ0cy5sZW5ndGggLSAxXTtcblxuXHQvL0xFQVNUIFBSSU9SSVRZIC0gU2VhcmNoIHJlc3RyaWN0aW9ucyBkaXJlY3RseSBhdCBFbnRpdHkgU2V0XG5cdC8vZS5nLiBGUiBpbiBcIk5TLkVudGl0eUNvbnRhaW5lci9TYWxlc09yZGVyTWFuYWdlXCIgQ29udGV4dFBhdGg6IC9TYWxlc09yZGVyTWFuYWdlXG5cdGlmICghaXNDb250YWlubWVudCkge1xuXHRcdG9TZWFyY2hSZXN0cmljdGlvbnMgPSBvTWV0YU1vZGVsQ29udGV4dC5nZXRPYmplY3QoYCR7ZW50aXR5U2V0UGF0aH0ke3NlYXJjaFJlc3RyaWN0aW9uc1Rlcm19YCkgYXNcblx0XHRcdHwgTWV0YU1vZGVsVHlwZTxTZWFyY2hSZXN0cmljdGlvbnNUeXBlPlxuXHRcdFx0fCB1bmRlZmluZWQ7XG5cdH1cblx0aWYgKGVudGl0eVR5cGVQYXRoUGFydHMubGVuZ3RoID4gMSkge1xuXHRcdGNvbnN0IG5hdlBhdGggPSBpc0NvbnRhaW5tZW50ID8gY29udGFpbm1lbnROYXZQYXRoIDogZW50aXR5U2V0UGF0aFBhcnRzW2VudGl0eVNldFBhdGhQYXJ0cy5sZW5ndGggLSAxXTtcblx0XHQvLyBJbiBjYXNlIG9mIGNvbnRhaW5tZW50IHdlIHRha2UgZW50aXR5U2V0IHByb3ZpZGVkIGFzIHBhcmVudC4gQW5kIGluIGNhc2Ugb2Ygbm9ybWFsIHdlIHdvdWxkIHJlbW92ZSB0aGUgbGFzdCBuYXZpZ2F0aW9uIGZyb20gZW50aXR5U2V0UGF0aC5cblx0XHRjb25zdCBwYXJlbnRFbnRpdHlTZXRQYXRoID0gaXNDb250YWlubWVudCA/IGVudGl0eVNldFBhdGggOiBgLyR7ZW50aXR5U2V0UGF0aFBhcnRzLnNsaWNlKDAsIC0xKS5qb2luKGAvJHtuYXZpZ2F0aW9uVGV4dH0vYCl9YDtcblxuXHRcdC8vSElHSEVTVCBwcmlvcml0eSAtIE5hdmlnYXRpb24gcmVzdHJpY3Rpb25zXG5cdFx0Ly9lLmcuIFBhcmVudCBcIi9DdXN0b21lclwiIHdpdGggTmF2aWdhdGlvblByb3BlcnR5UGF0aD1cIlNldFwiIENvbnRleHRQYXRoOiBDdXN0b21lci9TZXRcblx0XHRjb25zdCBvTmF2aWdhdGlvblJlc3RyaWN0aW9ucyA9IENvbW1vblV0aWxzLmdldE5hdmlnYXRpb25SZXN0cmljdGlvbnMoXG5cdFx0XHRvTWV0YU1vZGVsQ29udGV4dCxcblx0XHRcdHBhcmVudEVudGl0eVNldFBhdGgsXG5cdFx0XHRuYXZQYXRoLnJlcGxhY2VBbGwoXCIlMkZcIiwgXCIvXCIpXG5cdFx0KTtcblx0XHRvTmF2aWdhdGlvblNlYXJjaFJlc3RyaWN0aW9ucyA9IG9OYXZpZ2F0aW9uUmVzdHJpY3Rpb25zICYmIG9OYXZpZ2F0aW9uUmVzdHJpY3Rpb25zW1wiU2VhcmNoUmVzdHJpY3Rpb25zXCJdO1xuXHR9XG5cdHJldHVybiBvTmF2aWdhdGlvblNlYXJjaFJlc3RyaWN0aW9ucyB8fCBvU2VhcmNoUmVzdHJpY3Rpb25zO1xufVxuXG5mdW5jdGlvbiBnZXROYXZpZ2F0aW9uUmVzdHJpY3Rpb25zKG9NZXRhTW9kZWxDb250ZXh0OiBPRGF0YU1ldGFNb2RlbCwgc0VudGl0eVNldFBhdGg6IHN0cmluZywgc05hdmlnYXRpb25QYXRoOiBzdHJpbmcpIHtcblx0Y29uc3Qgb05hdmlnYXRpb25SZXN0cmljdGlvbnMgPSBvTWV0YU1vZGVsQ29udGV4dC5nZXRPYmplY3QoYCR7c0VudGl0eVNldFBhdGh9QE9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuTmF2aWdhdGlvblJlc3RyaWN0aW9uc2ApIGFzXG5cdFx0fCBNZXRhTW9kZWxUeXBlPE5hdmlnYXRpb25SZXN0cmljdGlvbnNUeXBlPlxuXHRcdHwgdW5kZWZpbmVkO1xuXHRjb25zdCBhUmVzdHJpY3RlZFByb3BlcnRpZXMgPSBvTmF2aWdhdGlvblJlc3RyaWN0aW9ucyAmJiBvTmF2aWdhdGlvblJlc3RyaWN0aW9ucy5SZXN0cmljdGVkUHJvcGVydGllcztcblx0cmV0dXJuIChcblx0XHRhUmVzdHJpY3RlZFByb3BlcnRpZXMgJiZcblx0XHRhUmVzdHJpY3RlZFByb3BlcnRpZXMuZmluZChmdW5jdGlvbiAob1Jlc3RyaWN0ZWRQcm9wZXJ0eSkge1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0b1Jlc3RyaWN0ZWRQcm9wZXJ0eSAmJlxuXHRcdFx0XHRvUmVzdHJpY3RlZFByb3BlcnR5Lk5hdmlnYXRpb25Qcm9wZXJ0eSAmJlxuXHRcdFx0XHRvUmVzdHJpY3RlZFByb3BlcnR5Lk5hdmlnYXRpb25Qcm9wZXJ0eS4kTmF2aWdhdGlvblByb3BlcnR5UGF0aCA9PT0gc05hdmlnYXRpb25QYXRoXG5cdFx0XHQpO1xuXHRcdH0pXG5cdCk7XG59XG5cbmZ1bmN0aW9uIF9pc0luTm9uRmlsdGVyYWJsZVByb3BlcnRpZXMobWV0YW1vZGVsQ29udGV4dDogT0RhdGFNZXRhTW9kZWwsIHNFbnRpdHlTZXRQYXRoOiBzdHJpbmcsIHNDb250ZXh0UGF0aDogc3RyaW5nKSB7XG5cdGxldCBiSXNOb3RGaWx0ZXJhYmxlID0gZmFsc2U7XG5cdGNvbnN0IG9Bbm5vdGF0aW9uID0gbWV0YW1vZGVsQ29udGV4dC5nZXRPYmplY3QoYCR7c0VudGl0eVNldFBhdGh9QE9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuRmlsdGVyUmVzdHJpY3Rpb25zYCkgYXNcblx0XHR8IE1ldGFNb2RlbFR5cGU8RmlsdGVyUmVzdHJpY3Rpb25zVHlwZT5cblx0XHR8IHVuZGVmaW5lZDtcblx0aWYgKG9Bbm5vdGF0aW9uICYmIG9Bbm5vdGF0aW9uLk5vbkZpbHRlcmFibGVQcm9wZXJ0aWVzKSB7XG5cdFx0YklzTm90RmlsdGVyYWJsZSA9IG9Bbm5vdGF0aW9uLk5vbkZpbHRlcmFibGVQcm9wZXJ0aWVzLnNvbWUoZnVuY3Rpb24gKHByb3BlcnR5KSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQocHJvcGVydHkgYXMgdW5rbm93biBhcyBFeHBhbmRQYXRoVHlwZTxFZG0uTmF2aWdhdGlvblByb3BlcnR5UGF0aD4pLiROYXZpZ2F0aW9uUHJvcGVydHlQYXRoID09PSBzQ29udGV4dFBhdGggfHxcblx0XHRcdFx0cHJvcGVydHkuJFByb3BlcnR5UGF0aCA9PT0gc0NvbnRleHRQYXRoXG5cdFx0XHQpO1xuXHRcdH0pO1xuXHR9XG5cdHJldHVybiBiSXNOb3RGaWx0ZXJhYmxlO1xufVxuXG5mdW5jdGlvbiBfaXNDdXN0b21BZ2dyZWdhdGUobWV0YW1vZGVsQ29udGV4dDogT0RhdGFNZXRhTW9kZWwsIHNFbnRpdHlTZXRQYXRoOiBzdHJpbmcsIHNDb250ZXh0UGF0aDogc3RyaW5nKSB7XG5cdGxldCBiQ3VzdG9tQWdncmVnYXRlID0gZmFsc2U7XG5cdGNvbnN0IGJBcHBseVN1cHBvcnRlZCA9IG1ldGFtb2RlbENvbnRleHQ/LmdldE9iamVjdChzRW50aXR5U2V0UGF0aCArIFwiQE9yZy5PRGF0YS5BZ2dyZWdhdGlvbi5WMS5BcHBseVN1cHBvcnRlZFwiKSA/IHRydWUgOiBmYWxzZTtcblx0aWYgKGJBcHBseVN1cHBvcnRlZCkge1xuXHRcdGNvbnN0IG9Bbm5vdGF0aW9ucyA9IG1ldGFtb2RlbENvbnRleHQuZ2V0T2JqZWN0KGAke3NFbnRpdHlTZXRQYXRofUBgKTtcblx0XHRjb25zdCBvQ3VzdG9tQWdncmVnZ2F0ZXMgPSBtZXRhTW9kZWxVdGlsLmdldEFsbEN1c3RvbUFnZ3JlZ2F0ZXMob0Fubm90YXRpb25zKTtcblx0XHRjb25zdCBhQ3VzdG9tQWdncmVnYXRlcyA9IG9DdXN0b21BZ2dyZWdnYXRlcyA/IE9iamVjdC5rZXlzKG9DdXN0b21BZ2dyZWdnYXRlcykgOiB1bmRlZmluZWQ7XG5cdFx0aWYgKGFDdXN0b21BZ2dyZWdhdGVzICYmIGFDdXN0b21BZ2dyZWdhdGVzPy5pbmRleE9mKHNDb250ZXh0UGF0aCkgPiAtMSkge1xuXHRcdFx0YkN1c3RvbUFnZ3JlZ2F0ZSA9IHRydWU7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBiQ3VzdG9tQWdncmVnYXRlO1xufVxuXG4vLyBUT0RPIHJld29yayB0aGlzIVxuZnVuY3Rpb24gX2lzQ29udGV4dFBhdGhGaWx0ZXJhYmxlKG9Nb2RlbENvbnRleHQ6IE9EYXRhTWV0YU1vZGVsLCBzRW50aXR5U2V0UGF0aDogc3RyaW5nLCBzQ29udGV4UGF0aDogc3RyaW5nKSB7XG5cdGNvbnN0IHNGdWxsUGF0aCA9IGAke3NFbnRpdHlTZXRQYXRofS8ke3NDb250ZXhQYXRofWAsXG5cdFx0YUVTUGFydHMgPSBzRnVsbFBhdGguc3BsaXQoXCIvXCIpLnNwbGljZSgwLCAyKSxcblx0XHRhQ29udGV4dCA9IHNGdWxsUGF0aC5zcGxpdChcIi9cIikuc3BsaWNlKDIpO1xuXHRsZXQgYklzTm90RmlsdGVyYWJsZSA9IGZhbHNlLFxuXHRcdHNDb250ZXh0ID0gXCJcIjtcblxuXHRzRW50aXR5U2V0UGF0aCA9IGFFU1BhcnRzLmpvaW4oXCIvXCIpO1xuXG5cdGJJc05vdEZpbHRlcmFibGUgPSBhQ29udGV4dC5zb21lKGZ1bmN0aW9uIChpdGVtOiBzdHJpbmcsIGluZGV4OiBudW1iZXIsIGFycmF5OiBzdHJpbmdbXSkge1xuXHRcdGlmIChzQ29udGV4dC5sZW5ndGggPiAwKSB7XG5cdFx0XHRzQ29udGV4dCArPSBgLyR7aXRlbX1gO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzQ29udGV4dCA9IGl0ZW07XG5cdFx0fVxuXHRcdGlmIChpbmRleCA9PT0gYXJyYXkubGVuZ3RoIC0gMikge1xuXHRcdFx0Ly8gSW4gY2FzZSBvZiBcIi9DdXN0b21lci9TZXQvUHJvcGVydHlcIiB0aGlzIGlzIHRvIGNoZWNrIG5hdmlnYXRpb24gcmVzdHJpY3Rpb25zIG9mIFwiQ3VzdG9tZXJcIiBmb3Igbm9uLWZpbHRlcmFibGUgcHJvcGVydGllcyBpbiBcIlNldFwiXG5cdFx0XHRjb25zdCBvTmF2aWdhdGlvblJlc3RyaWN0aW9ucyA9IGdldE5hdmlnYXRpb25SZXN0cmljdGlvbnMob01vZGVsQ29udGV4dCwgc0VudGl0eVNldFBhdGgsIGl0ZW0pO1xuXHRcdFx0Y29uc3Qgb0ZpbHRlclJlc3RyaWN0aW9ucyA9IG9OYXZpZ2F0aW9uUmVzdHJpY3Rpb25zICYmIG9OYXZpZ2F0aW9uUmVzdHJpY3Rpb25zLkZpbHRlclJlc3RyaWN0aW9ucztcblx0XHRcdGNvbnN0IGFOb25GaWx0ZXJhYmxlUHJvcGVydGllcyA9IG9GaWx0ZXJSZXN0cmljdGlvbnMgJiYgb0ZpbHRlclJlc3RyaWN0aW9ucy5Ob25GaWx0ZXJhYmxlUHJvcGVydGllcztcblx0XHRcdGNvbnN0IHNUYXJnZXRQcm9wZXJ0eVBhdGggPSBhcnJheVthcnJheS5sZW5ndGggLSAxXTtcblx0XHRcdGlmIChcblx0XHRcdFx0YU5vbkZpbHRlcmFibGVQcm9wZXJ0aWVzICYmXG5cdFx0XHRcdGFOb25GaWx0ZXJhYmxlUHJvcGVydGllcy5maW5kKGZ1bmN0aW9uIChvUHJvcGVydHlQYXRoKSB7XG5cdFx0XHRcdFx0cmV0dXJuIG9Qcm9wZXJ0eVBhdGguJFByb3BlcnR5UGF0aCA9PT0gc1RhcmdldFByb3BlcnR5UGF0aDtcblx0XHRcdFx0fSlcblx0XHRcdCkge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKGluZGV4ID09PSBhcnJheS5sZW5ndGggLSAxKSB7XG5cdFx0XHQvL2xhc3QgcGF0aCBzZWdtZW50XG5cdFx0XHRiSXNOb3RGaWx0ZXJhYmxlID0gX2lzSW5Ob25GaWx0ZXJhYmxlUHJvcGVydGllcyhvTW9kZWxDb250ZXh0LCBzRW50aXR5U2V0UGF0aCwgc0NvbnRleHQpO1xuXHRcdH0gZWxzZSBpZiAob01vZGVsQ29udGV4dC5nZXRPYmplY3QoYCR7c0VudGl0eVNldFBhdGh9LyROYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nLyR7aXRlbX1gKSkge1xuXHRcdFx0Ly9jaGVjayBleGlzdGluZyBjb250ZXh0IHBhdGggYW5kIGluaXRpYWxpemUgaXRcblx0XHRcdGJJc05vdEZpbHRlcmFibGUgPSBfaXNJbk5vbkZpbHRlcmFibGVQcm9wZXJ0aWVzKG9Nb2RlbENvbnRleHQsIHNFbnRpdHlTZXRQYXRoLCBzQ29udGV4dCk7XG5cdFx0XHRzQ29udGV4dCA9IFwiXCI7XG5cdFx0XHQvL3NldCB0aGUgbmV3IEVudGl0eVNldFxuXHRcdFx0c0VudGl0eVNldFBhdGggPSBgLyR7b01vZGVsQ29udGV4dC5nZXRPYmplY3QoYCR7c0VudGl0eVNldFBhdGh9LyROYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nLyR7aXRlbX1gKX1gO1xuXHRcdH1cblx0XHRyZXR1cm4gYklzTm90RmlsdGVyYWJsZSA9PT0gdHJ1ZTtcblx0fSk7XG5cdHJldHVybiBiSXNOb3RGaWx0ZXJhYmxlO1xufVxuXG4vLyBUT0RPIGNoZWNrIHVzZWQgcGxhY2VzIGFuZCByZXdvcmsgdGhpc1xuZnVuY3Rpb24gaXNQcm9wZXJ0eUZpbHRlcmFibGUoXG5cdG1ldGFNb2RlbENvbnRleHQ6IE9EYXRhTWV0YU1vZGVsLFxuXHRzRW50aXR5U2V0UGF0aDogc3RyaW5nLFxuXHRzUHJvcGVydHk6IHN0cmluZyxcblx0YlNraXBIaWRkZW5GaWx0ZXI/OiBib29sZWFuXG4pOiBib29sZWFuIHwgQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24ge1xuXHRpZiAodHlwZW9mIHNQcm9wZXJ0eSAhPT0gXCJzdHJpbmdcIikge1xuXHRcdHRocm93IG5ldyBFcnJvcihcInNQcm9wZXJ0eSBwYXJhbWV0ZXIgbXVzdCBiZSBhIHN0cmluZ1wiKTtcblx0fVxuXHRsZXQgYklzRmlsdGVyYWJsZTtcblxuXHQvLyBQYXJhbWV0ZXJzIHNob3VsZCBiZSByZW5kZXJlZCBhcyBmaWx0ZXJmaWVsZHNcblx0aWYgKG1ldGFNb2RlbENvbnRleHQuZ2V0T2JqZWN0KGAke3NFbnRpdHlTZXRQYXRofS9AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlJlc3VsdENvbnRleHRgKT8udmFsdWVPZigpID09PSB0cnVlKSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHRjb25zdCBvTmF2aWdhdGlvbkNvbnRleHQgPSBtZXRhTW9kZWxDb250ZXh0LmNyZWF0ZUJpbmRpbmdDb250ZXh0KGAke3NFbnRpdHlTZXRQYXRofS8ke3NQcm9wZXJ0eX1gKSBhcyBDb250ZXh0O1xuXG5cdGlmICghYlNraXBIaWRkZW5GaWx0ZXIpIHtcblx0XHRpZiAoXG5cdFx0XHRvTmF2aWdhdGlvbkNvbnRleHQuZ2V0UHJvcGVydHkoXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuSGlkZGVuXCIpID09PSB0cnVlIHx8XG5cdFx0XHRvTmF2aWdhdGlvbkNvbnRleHQuZ2V0UHJvcGVydHkoXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuSGlkZGVuRmlsdGVyXCIpID09PSB0cnVlXG5cdFx0KSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdGNvbnN0IHNIaWRkZW5QYXRoID0gb05hdmlnYXRpb25Db250ZXh0LmdldFByb3BlcnR5KFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhpZGRlbi8kUGF0aFwiKTtcblx0XHRjb25zdCBzSGlkZGVuRmlsdGVyUGF0aCA9IG9OYXZpZ2F0aW9uQ29udGV4dC5nZXRQcm9wZXJ0eShcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IaWRkZW5GaWx0ZXIvJFBhdGhcIik7XG5cblx0XHRpZiAoc0hpZGRlblBhdGggJiYgc0hpZGRlbkZpbHRlclBhdGgpIHtcblx0XHRcdHJldHVybiBjb21waWxlRXhwcmVzc2lvbihub3Qob3IocGF0aEluTW9kZWwoc0hpZGRlblBhdGgpLCBwYXRoSW5Nb2RlbChzSGlkZGVuRmlsdGVyUGF0aCkpKSk7XG5cdFx0fSBlbHNlIGlmIChzSGlkZGVuUGF0aCkge1xuXHRcdFx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKG5vdChwYXRoSW5Nb2RlbChzSGlkZGVuUGF0aCkpKTtcblx0XHR9IGVsc2UgaWYgKHNIaWRkZW5GaWx0ZXJQYXRoKSB7XG5cdFx0XHRyZXR1cm4gY29tcGlsZUV4cHJlc3Npb24obm90KHBhdGhJbk1vZGVsKHNIaWRkZW5GaWx0ZXJQYXRoKSkpO1xuXHRcdH1cblx0fVxuXG5cdC8vIHRoZXJlIGlzIG5vIG5hdmlnYXRpb24gaW4gZW50aXR5U2V0IHBhdGggYW5kIHByb3BlcnR5IHBhdGhcblx0YklzRmlsdGVyYWJsZSA9XG5cdFx0c0VudGl0eVNldFBhdGguc3BsaXQoXCIvXCIpLmxlbmd0aCA9PT0gMiAmJiBzUHJvcGVydHkuaW5kZXhPZihcIi9cIikgPCAwXG5cdFx0XHQ/ICFfaXNJbk5vbkZpbHRlcmFibGVQcm9wZXJ0aWVzKG1ldGFNb2RlbENvbnRleHQsIHNFbnRpdHlTZXRQYXRoLCBzUHJvcGVydHkpICYmXG5cdFx0XHQgICFfaXNDdXN0b21BZ2dyZWdhdGUobWV0YU1vZGVsQ29udGV4dCwgc0VudGl0eVNldFBhdGgsIHNQcm9wZXJ0eSlcblx0XHRcdDogIV9pc0NvbnRleHRQYXRoRmlsdGVyYWJsZShtZXRhTW9kZWxDb250ZXh0LCBzRW50aXR5U2V0UGF0aCwgc1Byb3BlcnR5KTtcblx0Ly8gY2hlY2sgaWYgdHlwZSBjYW4gYmUgdXNlZCBmb3IgZmlsdGVyaW5nXG5cdGlmIChiSXNGaWx0ZXJhYmxlICYmIG9OYXZpZ2F0aW9uQ29udGV4dCkge1xuXHRcdGNvbnN0IHNQcm9wZXJ0eURhdGFUeXBlID0gZ2V0UHJvcGVydHlEYXRhVHlwZShvTmF2aWdhdGlvbkNvbnRleHQpO1xuXHRcdGlmIChzUHJvcGVydHlEYXRhVHlwZSkge1xuXHRcdFx0YklzRmlsdGVyYWJsZSA9IHNQcm9wZXJ0eURhdGFUeXBlID8gaXNUeXBlRmlsdGVyYWJsZShzUHJvcGVydHlEYXRhVHlwZSBhcyBrZXlvZiB0eXBlb2YgRGVmYXVsdFR5cGVGb3JFZG1UeXBlKSA6IGZhbHNlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRiSXNGaWx0ZXJhYmxlID0gZmFsc2U7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIGJJc0ZpbHRlcmFibGU7XG59XG5mdW5jdGlvbiBnZXRTaGVsbFNlcnZpY2VzKG9Db250cm9sOiBDb250cm9sIHwgQ29tcG9uZW50KTogSVNoZWxsU2VydmljZXMge1xuXHRyZXR1cm4gZ2V0QXBwQ29tcG9uZW50KG9Db250cm9sKS5nZXRTaGVsbFNlcnZpY2VzKCk7XG59XG5cbmZ1bmN0aW9uIGdldEhhc2goKTogc3RyaW5nIHtcblx0Y29uc3Qgc0hhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaDtcblx0cmV0dXJuIHNIYXNoLnNwbGl0KFwiJlwiKVswXTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gX2dldFNPSW50ZW50cyhcblx0b1NoZWxsU2VydmljZUhlbHBlcjogSVNoZWxsU2VydmljZXMsXG5cdG9PYmplY3RQYWdlTGF5b3V0OiBPYmplY3RQYWdlTGF5b3V0LFxuXHRvU2VtYW50aWNPYmplY3Q6IHVua25vd24sXG5cdG9QYXJhbTogdW5rbm93blxuKTogUHJvbWlzZTxMaW5rRGVmaW5pdGlvbltdPiB7XG5cdHJldHVybiBvU2hlbGxTZXJ2aWNlSGVscGVyLmdldExpbmtzKHtcblx0XHRzZW1hbnRpY09iamVjdDogb1NlbWFudGljT2JqZWN0LFxuXHRcdHBhcmFtczogb1BhcmFtXG5cdH0pIGFzIFByb21pc2U8TGlua0RlZmluaXRpb25bXT47XG59XG5cbi8vIFRPLURPIGFkZCB0aGlzIGFzIHBhcnQgb2YgYXBwbHlTZW1hbnRpY09iamVjdG1hcHBpbmdzIGxvZ2ljIGluIEludGVudEJhc2VkbmF2aWdhdGlvbiBjb250cm9sbGVyIGV4dGVuc2lvblxuZnVuY3Rpb24gX2NyZWF0ZU1hcHBpbmdzKG9NYXBwaW5nOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikge1xuXHRjb25zdCBhU09NYXBwaW5ncyA9IFtdO1xuXHRjb25zdCBhTWFwcGluZ0tleXMgPSBPYmplY3Qua2V5cyhvTWFwcGluZyk7XG5cdGxldCBvU2VtYW50aWNNYXBwaW5nO1xuXHRmb3IgKGxldCBpID0gMDsgaSA8IGFNYXBwaW5nS2V5cy5sZW5ndGg7IGkrKykge1xuXHRcdG9TZW1hbnRpY01hcHBpbmcgPSB7XG5cdFx0XHRMb2NhbFByb3BlcnR5OiB7XG5cdFx0XHRcdCRQcm9wZXJ0eVBhdGg6IGFNYXBwaW5nS2V5c1tpXVxuXHRcdFx0fSxcblx0XHRcdFNlbWFudGljT2JqZWN0UHJvcGVydHk6IG9NYXBwaW5nW2FNYXBwaW5nS2V5c1tpXV1cblx0XHR9O1xuXHRcdGFTT01hcHBpbmdzLnB1c2gob1NlbWFudGljTWFwcGluZyk7XG5cdH1cblxuXHRyZXR1cm4gYVNPTWFwcGluZ3M7XG59XG50eXBlIExpbmtEZWZpbml0aW9uID0ge1xuXHRpbnRlbnQ6IHN0cmluZztcblx0dGV4dDogc3RyaW5nO1xufTtcbnR5cGUgU2VtYW50aWNJdGVtID0ge1xuXHR0ZXh0OiBzdHJpbmc7XG5cdHRhcmdldFNlbU9iamVjdDogc3RyaW5nO1xuXHR0YXJnZXRBY3Rpb246IHN0cmluZztcblx0dGFyZ2V0UGFyYW1zOiB1bmtub3duO1xufTtcbi8qKlxuICogQHBhcmFtIGFMaW5rc1xuICogQHBhcmFtIGFFeGNsdWRlZEFjdGlvbnNcbiAqIEBwYXJhbSBvVGFyZ2V0UGFyYW1zXG4gKiBAcGFyYW0gYUl0ZW1zXG4gKiBAcGFyYW0gYUFsbG93ZWRBY3Rpb25zXG4gKi9cbmZ1bmN0aW9uIF9nZXRSZWxhdGVkQXBwc01lbnVJdGVtcyhcblx0YUxpbmtzOiBMaW5rRGVmaW5pdGlvbltdLFxuXHRhRXhjbHVkZWRBY3Rpb25zOiB1bmtub3duW10sXG5cdG9UYXJnZXRQYXJhbXM6IHVua25vd24sXG5cdGFJdGVtczogU2VtYW50aWNJdGVtW10sXG5cdGFBbGxvd2VkQWN0aW9ucz86IHVua25vd25bXVxuKSB7XG5cdGZvciAobGV0IGkgPSAwOyBpIDwgYUxpbmtzLmxlbmd0aDsgaSsrKSB7XG5cdFx0Y29uc3Qgb0xpbmsgPSBhTGlua3NbaV07XG5cdFx0Y29uc3Qgc0ludGVudCA9IG9MaW5rLmludGVudDtcblx0XHRjb25zdCBzQWN0aW9uID0gc0ludGVudC5zcGxpdChcIi1cIilbMV0uc3BsaXQoXCI/XCIpWzBdO1xuXHRcdGlmIChhQWxsb3dlZEFjdGlvbnMgJiYgYUFsbG93ZWRBY3Rpb25zLmluY2x1ZGVzKHNBY3Rpb24pKSB7XG5cdFx0XHRhSXRlbXMucHVzaCh7XG5cdFx0XHRcdHRleHQ6IG9MaW5rLnRleHQsXG5cdFx0XHRcdHRhcmdldFNlbU9iamVjdDogc0ludGVudC5zcGxpdChcIiNcIilbMV0uc3BsaXQoXCItXCIpWzBdLFxuXHRcdFx0XHR0YXJnZXRBY3Rpb246IHNBY3Rpb24uc3BsaXQoXCJ+XCIpWzBdLFxuXHRcdFx0XHR0YXJnZXRQYXJhbXM6IG9UYXJnZXRQYXJhbXNcblx0XHRcdH0pO1xuXHRcdH0gZWxzZSBpZiAoIWFBbGxvd2VkQWN0aW9ucyAmJiBhRXhjbHVkZWRBY3Rpb25zICYmIGFFeGNsdWRlZEFjdGlvbnMuaW5kZXhPZihzQWN0aW9uKSA9PT0gLTEpIHtcblx0XHRcdGFJdGVtcy5wdXNoKHtcblx0XHRcdFx0dGV4dDogb0xpbmsudGV4dCxcblx0XHRcdFx0dGFyZ2V0U2VtT2JqZWN0OiBzSW50ZW50LnNwbGl0KFwiI1wiKVsxXS5zcGxpdChcIi1cIilbMF0sXG5cdFx0XHRcdHRhcmdldEFjdGlvbjogc0FjdGlvbi5zcGxpdChcIn5cIilbMF0sXG5cdFx0XHRcdHRhcmdldFBhcmFtczogb1RhcmdldFBhcmFtc1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG59XG5cbnR5cGUgU2VtYW50aWNPYmplY3QgPSB7XG5cdGFsbG93ZWRBY3Rpb25zPzogdW5rbm93bltdO1xuXHR1bmF2YWlsYWJsZUFjdGlvbnM/OiB1bmtub3duW107XG5cdHNlbWFudGljT2JqZWN0OiBzdHJpbmc7XG5cdHBhdGg6IHN0cmluZztcblx0bWFwcGluZz86IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG59O1xuXG5mdW5jdGlvbiBfZ2V0UmVsYXRlZEludGVudHMoXG5cdG9BZGRpdGlvbmFsU2VtYW50aWNPYmplY3RzOiBTZW1hbnRpY09iamVjdCxcblx0b0JpbmRpbmdDb250ZXh0OiBDb250ZXh0LFxuXHRhTWFuaWZlc3RTT0l0ZW1zOiBTZW1hbnRpY0l0ZW1bXSxcblx0YUxpbmtzOiBMaW5rRGVmaW5pdGlvbltdXG4pIHtcblx0aWYgKGFMaW5rcyAmJiBhTGlua3MubGVuZ3RoID4gMCkge1xuXHRcdGNvbnN0IGFBbGxvd2VkQWN0aW9ucyA9IG9BZGRpdGlvbmFsU2VtYW50aWNPYmplY3RzLmFsbG93ZWRBY3Rpb25zIHx8IHVuZGVmaW5lZDtcblx0XHRjb25zdCBhRXhjbHVkZWRBY3Rpb25zID0gb0FkZGl0aW9uYWxTZW1hbnRpY09iamVjdHMudW5hdmFpbGFibGVBY3Rpb25zID8gb0FkZGl0aW9uYWxTZW1hbnRpY09iamVjdHMudW5hdmFpbGFibGVBY3Rpb25zIDogW107XG5cdFx0Y29uc3QgYVNPTWFwcGluZ3MgPSBvQWRkaXRpb25hbFNlbWFudGljT2JqZWN0cy5tYXBwaW5nID8gX2NyZWF0ZU1hcHBpbmdzKG9BZGRpdGlvbmFsU2VtYW50aWNPYmplY3RzLm1hcHBpbmcpIDogW107XG5cdFx0Y29uc3Qgb1RhcmdldFBhcmFtcyA9IHsgbmF2aWdhdGlvbkNvbnRleHRzOiBvQmluZGluZ0NvbnRleHQsIHNlbWFudGljT2JqZWN0TWFwcGluZzogYVNPTWFwcGluZ3MgfTtcblx0XHRfZ2V0UmVsYXRlZEFwcHNNZW51SXRlbXMoYUxpbmtzLCBhRXhjbHVkZWRBY3Rpb25zLCBvVGFyZ2V0UGFyYW1zLCBhTWFuaWZlc3RTT0l0ZW1zLCBhQWxsb3dlZEFjdGlvbnMpO1xuXHR9XG59XG5cbnR5cGUgU2VtYW50aWNPYmplY3RDb25maWcgPSB7XG5cdGFkZGl0aW9uYWxTZW1hbnRpY09iamVjdHM6IFJlY29yZDxzdHJpbmcsIFNlbWFudGljT2JqZWN0Pjtcbn07XG50eXBlIFJlbGF0ZWRBcHBzQ29uZmlnID0ge1xuXHR0ZXh0OiBzdHJpbmc7XG5cdHRhcmdldFNlbU9iamVjdDogc3RyaW5nO1xuXHR0YXJnZXRBY3Rpb246IHN0cmluZztcbn07XG5hc3luYyBmdW5jdGlvbiB1cGRhdGVSZWxhdGVBcHBzTW9kZWwoXG5cdG9CaW5kaW5nQ29udGV4dDogQ29udGV4dCxcblx0b0VudHJ5OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IHVuZGVmaW5lZCxcblx0b09iamVjdFBhZ2VMYXlvdXQ6IE9iamVjdFBhZ2VMYXlvdXQsXG5cdGFTZW1LZXlzOiB7ICRQcm9wZXJ0eVBhdGg6IHN0cmluZyB9W10sXG5cdG9NZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsLFxuXHRvTWV0YVBhdGg6IHN0cmluZ1xuKTogUHJvbWlzZTxSZWxhdGVkQXBwc0NvbmZpZ1tdPiB7XG5cdGNvbnN0IG9TaGVsbFNlcnZpY2VIZWxwZXI6IElTaGVsbFNlcnZpY2VzID0gZ2V0U2hlbGxTZXJ2aWNlcyhvT2JqZWN0UGFnZUxheW91dCk7XG5cdGNvbnN0IG9QYXJhbTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7fTtcblx0bGV0IHNDdXJyZW50U2VtT2JqID0gXCJcIixcblx0XHRzQ3VycmVudEFjdGlvbiA9IFwiXCI7XG5cdGxldCBvU2VtYW50aWNPYmplY3RBbm5vdGF0aW9ucztcblx0bGV0IGFSZWxhdGVkQXBwc01lbnVJdGVtczogUmVsYXRlZEFwcHNDb25maWdbXSA9IFtdO1xuXHRsZXQgYUV4Y2x1ZGVkQWN0aW9uczogdW5rbm93bltdID0gW107XG5cdGxldCBhTWFuaWZlc3RTT0tleXM6IHN0cmluZ1tdO1xuXG5cdGFzeW5jIGZ1bmN0aW9uIGZuR2V0UGFyc2VTaGVsbEhhc2hBbmRHZXRMaW5rcygpIHtcblx0XHRjb25zdCBvUGFyc2VkVXJsID0gb1NoZWxsU2VydmljZUhlbHBlci5wYXJzZVNoZWxsSGFzaChkb2N1bWVudC5sb2NhdGlvbi5oYXNoKTtcblx0XHRzQ3VycmVudFNlbU9iaiA9IG9QYXJzZWRVcmwuc2VtYW50aWNPYmplY3Q7IC8vIEN1cnJlbnQgU2VtYW50aWMgT2JqZWN0XG5cdFx0c0N1cnJlbnRBY3Rpb24gPSBvUGFyc2VkVXJsLmFjdGlvbjtcblx0XHRyZXR1cm4gX2dldFNPSW50ZW50cyhvU2hlbGxTZXJ2aWNlSGVscGVyLCBvT2JqZWN0UGFnZUxheW91dCwgc0N1cnJlbnRTZW1PYmosIG9QYXJhbSk7XG5cdH1cblxuXHR0cnkge1xuXHRcdGlmIChvRW50cnkpIHtcblx0XHRcdGlmIChhU2VtS2V5cyAmJiBhU2VtS2V5cy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdGZvciAobGV0IGogPSAwOyBqIDwgYVNlbUtleXMubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0XHRjb25zdCBzU2VtS2V5ID0gYVNlbUtleXNbal0uJFByb3BlcnR5UGF0aDtcblx0XHRcdFx0XHRpZiAoIW9QYXJhbVtzU2VtS2V5XSkge1xuXHRcdFx0XHRcdFx0b1BhcmFtW3NTZW1LZXldID0geyB2YWx1ZTogb0VudHJ5W3NTZW1LZXldIH07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBmYWxsYmFjayB0byBUZWNobmljYWwgS2V5cyBpZiBubyBTZW1hbnRpYyBLZXkgaXMgcHJlc2VudFxuXHRcdFx0XHRjb25zdCBhVGVjaG5pY2FsS2V5cyA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke29NZXRhUGF0aH0vJFR5cGUvJEtleWApO1xuXHRcdFx0XHRmb3IgKGNvbnN0IGtleSBpbiBhVGVjaG5pY2FsS2V5cykge1xuXHRcdFx0XHRcdGNvbnN0IHNPYmpLZXkgPSBhVGVjaG5pY2FsS2V5c1trZXldO1xuXHRcdFx0XHRcdGlmICghb1BhcmFtW3NPYmpLZXldKSB7XG5cdFx0XHRcdFx0XHRvUGFyYW1bc09iaktleV0gPSB7IHZhbHVlOiBvRW50cnlbc09iaktleV0gfTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0Ly8gTG9naWMgdG8gcmVhZCBhZGRpdGlvbmFsIFNPIGZyb20gbWFuaWZlc3QgYW5kIHVwZGF0ZWQgcmVsYXRlZGFwcHMgbW9kZWxcblxuXHRcdGNvbnN0IG9NYW5pZmVzdERhdGEgPSBnZXRUYXJnZXRWaWV3KG9PYmplY3RQYWdlTGF5b3V0KS5nZXRWaWV3RGF0YSgpIGFzIFNlbWFudGljT2JqZWN0Q29uZmlnO1xuXHRcdGNvbnN0IGFNYW5pZmVzdFNPSXRlbXM6IFNlbWFudGljSXRlbVtdID0gW107XG5cdFx0bGV0IHNlbWFudGljT2JqZWN0SW50ZW50cztcblx0XHRpZiAob01hbmlmZXN0RGF0YS5hZGRpdGlvbmFsU2VtYW50aWNPYmplY3RzKSB7XG5cdFx0XHRhTWFuaWZlc3RTT0tleXMgPSBPYmplY3Qua2V5cyhvTWFuaWZlc3REYXRhLmFkZGl0aW9uYWxTZW1hbnRpY09iamVjdHMpO1xuXHRcdFx0Zm9yIChsZXQga2V5ID0gMDsga2V5IDwgYU1hbmlmZXN0U09LZXlzLmxlbmd0aDsga2V5KyspIHtcblx0XHRcdFx0c2VtYW50aWNPYmplY3RJbnRlbnRzID0gYXdhaXQgUHJvbWlzZS5yZXNvbHZlKFxuXHRcdFx0XHRcdF9nZXRTT0ludGVudHMob1NoZWxsU2VydmljZUhlbHBlciwgb09iamVjdFBhZ2VMYXlvdXQsIGFNYW5pZmVzdFNPS2V5c1trZXldLCBvUGFyYW0pXG5cdFx0XHRcdCk7XG5cdFx0XHRcdF9nZXRSZWxhdGVkSW50ZW50cyhcblx0XHRcdFx0XHRvTWFuaWZlc3REYXRhLmFkZGl0aW9uYWxTZW1hbnRpY09iamVjdHNbYU1hbmlmZXN0U09LZXlzW2tleV1dLFxuXHRcdFx0XHRcdG9CaW5kaW5nQ29udGV4dCxcblx0XHRcdFx0XHRhTWFuaWZlc3RTT0l0ZW1zLFxuXHRcdFx0XHRcdHNlbWFudGljT2JqZWN0SW50ZW50c1xuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRjb25zdCBpbnRlcm5hbE1vZGVsQ29udGV4dCA9IG9PYmplY3RQYWdlTGF5b3V0LmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIikgYXMgSW50ZXJuYWxNb2RlbENvbnRleHQ7XG5cdFx0Y29uc3QgYUxpbmtzID0gYXdhaXQgZm5HZXRQYXJzZVNoZWxsSGFzaEFuZEdldExpbmtzKCk7XG5cdFx0aWYgKGFMaW5rcykge1xuXHRcdFx0aWYgKGFMaW5rcy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdGxldCBpc1NlbWFudGljT2JqZWN0SGFzU2FtZVRhcmdldEluTWFuaWZlc3QgPSBmYWxzZTtcblx0XHRcdFx0Y29uc3Qgb1RhcmdldFBhcmFtczoge1xuXHRcdFx0XHRcdG5hdmlnYXRpb25Db250ZXh0cz86IENvbnRleHQ7XG5cdFx0XHRcdFx0c2VtYW50aWNPYmplY3RNYXBwaW5nPzogTWV0YU1vZGVsVHlwZTxTZW1hbnRpY09iamVjdE1hcHBpbmdUeXBlPltdO1xuXHRcdFx0XHR9ID0ge307XG5cdFx0XHRcdGNvbnN0IGFBbm5vdGF0aW9uc1NPSXRlbXM6IFNlbWFudGljSXRlbVtdID0gW107XG5cdFx0XHRcdGNvbnN0IHNFbnRpdHlTZXRQYXRoID0gYCR7b01ldGFQYXRofUBgO1xuXHRcdFx0XHRjb25zdCBzRW50aXR5VHlwZVBhdGggPSBgJHtvTWV0YVBhdGh9L0BgO1xuXHRcdFx0XHRjb25zdCBvRW50aXR5U2V0QW5ub3RhdGlvbnMgPSBvTWV0YU1vZGVsLmdldE9iamVjdChzRW50aXR5U2V0UGF0aCk7XG5cdFx0XHRcdG9TZW1hbnRpY09iamVjdEFubm90YXRpb25zID0gQ29tbW9uVXRpbHMuZ2V0U2VtYW50aWNPYmplY3RBbm5vdGF0aW9ucyhvRW50aXR5U2V0QW5ub3RhdGlvbnMsIHNDdXJyZW50U2VtT2JqKTtcblx0XHRcdFx0aWYgKCFvU2VtYW50aWNPYmplY3RBbm5vdGF0aW9ucy5iSGFzRW50aXR5U2V0U08pIHtcblx0XHRcdFx0XHRjb25zdCBvRW50aXR5VHlwZUFubm90YXRpb25zID0gb01ldGFNb2RlbC5nZXRPYmplY3Qoc0VudGl0eVR5cGVQYXRoKTtcblx0XHRcdFx0XHRvU2VtYW50aWNPYmplY3RBbm5vdGF0aW9ucyA9IENvbW1vblV0aWxzLmdldFNlbWFudGljT2JqZWN0QW5ub3RhdGlvbnMob0VudGl0eVR5cGVBbm5vdGF0aW9ucywgc0N1cnJlbnRTZW1PYmopO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGFFeGNsdWRlZEFjdGlvbnMgPSBvU2VtYW50aWNPYmplY3RBbm5vdGF0aW9ucy5hVW5hdmFpbGFibGVBY3Rpb25zO1xuXHRcdFx0XHQvL1NraXAgc2FtZSBhcHBsaWNhdGlvbiBmcm9tIFJlbGF0ZWQgQXBwc1xuXHRcdFx0XHRhRXhjbHVkZWRBY3Rpb25zLnB1c2goc0N1cnJlbnRBY3Rpb24pO1xuXHRcdFx0XHRvVGFyZ2V0UGFyYW1zLm5hdmlnYXRpb25Db250ZXh0cyA9IG9CaW5kaW5nQ29udGV4dDtcblx0XHRcdFx0b1RhcmdldFBhcmFtcy5zZW1hbnRpY09iamVjdE1hcHBpbmcgPSBvU2VtYW50aWNPYmplY3RBbm5vdGF0aW9ucy5hTWFwcGluZ3M7XG5cdFx0XHRcdF9nZXRSZWxhdGVkQXBwc01lbnVJdGVtcyhhTGlua3MsIGFFeGNsdWRlZEFjdGlvbnMsIG9UYXJnZXRQYXJhbXMsIGFBbm5vdGF0aW9uc1NPSXRlbXMpO1xuXG5cdFx0XHRcdGFNYW5pZmVzdFNPSXRlbXMuZm9yRWFjaChmdW5jdGlvbiAoeyB0YXJnZXRTZW1PYmplY3QgfSkge1xuXHRcdFx0XHRcdGlmIChhQW5ub3RhdGlvbnNTT0l0ZW1zWzBdLnRhcmdldFNlbU9iamVjdCA9PT0gdGFyZ2V0U2VtT2JqZWN0KSB7XG5cdFx0XHRcdFx0XHRpc1NlbWFudGljT2JqZWN0SGFzU2FtZVRhcmdldEluTWFuaWZlc3QgPSB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0Ly8gcmVtb3ZlIGFsbCBhY3Rpb25zIGZyb20gY3VycmVudCBoYXNoIGFwcGxpY2F0aW9uIGlmIG1hbmlmZXN0IGNvbnRhaW5zIGVtcHR5IGFsbG93ZWRBY3Rpb25zXG5cdFx0XHRcdGlmIChcblx0XHRcdFx0XHRvTWFuaWZlc3REYXRhLmFkZGl0aW9uYWxTZW1hbnRpY09iamVjdHMgJiZcblx0XHRcdFx0XHRvTWFuaWZlc3REYXRhLmFkZGl0aW9uYWxTZW1hbnRpY09iamVjdHNbYUFubm90YXRpb25zU09JdGVtc1swXS50YXJnZXRTZW1PYmplY3RdICYmXG5cdFx0XHRcdFx0b01hbmlmZXN0RGF0YS5hZGRpdGlvbmFsU2VtYW50aWNPYmplY3RzW2FBbm5vdGF0aW9uc1NPSXRlbXNbMF0udGFyZ2V0U2VtT2JqZWN0XS5hbGxvd2VkQWN0aW9ucz8ubGVuZ3RoID09PSAwXG5cdFx0XHRcdCkge1xuXHRcdFx0XHRcdGlzU2VtYW50aWNPYmplY3RIYXNTYW1lVGFyZ2V0SW5NYW5pZmVzdCA9IHRydWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRhUmVsYXRlZEFwcHNNZW51SXRlbXMgPSBpc1NlbWFudGljT2JqZWN0SGFzU2FtZVRhcmdldEluTWFuaWZlc3Rcblx0XHRcdFx0XHQ/IGFNYW5pZmVzdFNPSXRlbXNcblx0XHRcdFx0XHQ6IGFNYW5pZmVzdFNPSXRlbXMuY29uY2F0KGFBbm5vdGF0aW9uc1NPSXRlbXMpO1xuXHRcdFx0XHQvLyBJZiBubyBhcHAgaW4gbGlzdCwgcmVsYXRlZCBhcHBzIGJ1dHRvbiB3aWxsIGJlIGhpZGRlblxuXHRcdFx0XHRpbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcInJlbGF0ZWRBcHBzL3Zpc2liaWxpdHlcIiwgYVJlbGF0ZWRBcHBzTWVudUl0ZW1zLmxlbmd0aCA+IDApO1xuXHRcdFx0XHRpbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcInJlbGF0ZWRBcHBzL2l0ZW1zXCIsIGFSZWxhdGVkQXBwc01lbnVJdGVtcyk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcInJlbGF0ZWRBcHBzL3Zpc2liaWxpdHlcIiwgZmFsc2UpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRpbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcInJlbGF0ZWRBcHBzL3Zpc2liaWxpdHlcIiwgZmFsc2UpO1xuXHRcdH1cblx0fSBjYXRjaCAoZXJyb3I6IHVua25vd24pIHtcblx0XHRMb2cuZXJyb3IoXCJDYW5ub3QgcmVhZCBsaW5rc1wiLCBlcnJvciBhcyBzdHJpbmcpO1xuXHR9XG5cdHJldHVybiBhUmVsYXRlZEFwcHNNZW51SXRlbXM7XG59XG5cbmZ1bmN0aW9uIF9nZXRTZW1hbnRpY09iamVjdEFubm90YXRpb25zKG9FbnRpdHlBbm5vdGF0aW9uczogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sIHNDdXJyZW50U2VtT2JqOiBzdHJpbmcpIHtcblx0Y29uc3Qgb1NlbWFudGljT2JqZWN0QW5ub3RhdGlvbnMgPSB7XG5cdFx0Ykhhc0VudGl0eVNldFNPOiBmYWxzZSxcblx0XHRhQWxsb3dlZEFjdGlvbnM6IFtdLFxuXHRcdGFVbmF2YWlsYWJsZUFjdGlvbnM6IFtdIGFzIE1ldGFNb2RlbFR5cGU8U2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnM+W10sXG5cdFx0YU1hcHBpbmdzOiBbXSBhcyBNZXRhTW9kZWxUeXBlPFNlbWFudGljT2JqZWN0TWFwcGluZ1R5cGU+W11cblx0fTtcblx0bGV0IHNBbm5vdGF0aW9uTWFwcGluZ1Rlcm0sIHNBbm5vdGF0aW9uQWN0aW9uVGVybTtcblx0bGV0IHNRdWFsaWZpZXI7XG5cdGZvciAoY29uc3Qga2V5IGluIG9FbnRpdHlBbm5vdGF0aW9ucykge1xuXHRcdGlmIChrZXkuaW5kZXhPZihDb21tb25Bbm5vdGF0aW9uVGVybXMuU2VtYW50aWNPYmplY3QpID4gLTEgJiYgb0VudGl0eUFubm90YXRpb25zW2tleV0gPT09IHNDdXJyZW50U2VtT2JqKSB7XG5cdFx0XHRvU2VtYW50aWNPYmplY3RBbm5vdGF0aW9ucy5iSGFzRW50aXR5U2V0U08gPSB0cnVlO1xuXHRcdFx0c0Fubm90YXRpb25NYXBwaW5nVGVybSA9IGBAJHtDb21tb25Bbm5vdGF0aW9uVGVybXMuU2VtYW50aWNPYmplY3RNYXBwaW5nfWA7XG5cdFx0XHRzQW5ub3RhdGlvbkFjdGlvblRlcm0gPSBgQCR7Q29tbW9uQW5ub3RhdGlvblRlcm1zLlNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zfWA7XG5cblx0XHRcdGlmIChrZXkuaW5kZXhPZihcIiNcIikgPiAtMSkge1xuXHRcdFx0XHRzUXVhbGlmaWVyID0ga2V5LnNwbGl0KFwiI1wiKVsxXTtcblx0XHRcdFx0c0Fubm90YXRpb25NYXBwaW5nVGVybSA9IGAke3NBbm5vdGF0aW9uTWFwcGluZ1Rlcm19IyR7c1F1YWxpZmllcn1gO1xuXHRcdFx0XHRzQW5ub3RhdGlvbkFjdGlvblRlcm0gPSBgJHtzQW5ub3RhdGlvbkFjdGlvblRlcm19IyR7c1F1YWxpZmllcn1gO1xuXHRcdFx0fVxuXHRcdFx0aWYgKG9FbnRpdHlBbm5vdGF0aW9uc1tzQW5ub3RhdGlvbk1hcHBpbmdUZXJtXSkge1xuXHRcdFx0XHRvU2VtYW50aWNPYmplY3RBbm5vdGF0aW9ucy5hTWFwcGluZ3MgPSBvU2VtYW50aWNPYmplY3RBbm5vdGF0aW9ucy5hTWFwcGluZ3MuY29uY2F0KFxuXHRcdFx0XHRcdG9FbnRpdHlBbm5vdGF0aW9uc1tzQW5ub3RhdGlvbk1hcHBpbmdUZXJtXSBhcyBNZXRhTW9kZWxUeXBlPFNlbWFudGljT2JqZWN0TWFwcGluZ1R5cGU+XG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChvRW50aXR5QW5ub3RhdGlvbnNbc0Fubm90YXRpb25BY3Rpb25UZXJtXSkge1xuXHRcdFx0XHRvU2VtYW50aWNPYmplY3RBbm5vdGF0aW9ucy5hVW5hdmFpbGFibGVBY3Rpb25zID0gb1NlbWFudGljT2JqZWN0QW5ub3RhdGlvbnMuYVVuYXZhaWxhYmxlQWN0aW9ucy5jb25jYXQoXG5cdFx0XHRcdFx0b0VudGl0eUFubm90YXRpb25zW3NBbm5vdGF0aW9uQWN0aW9uVGVybV0gYXMgTWV0YU1vZGVsVHlwZTxTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucz5cblx0XHRcdFx0KTtcblx0XHRcdH1cblxuXHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBvU2VtYW50aWNPYmplY3RBbm5vdGF0aW9ucztcbn1cblxuZnVuY3Rpb24gZm5VcGRhdGVSZWxhdGVkQXBwc0RldGFpbHMob09iamVjdFBhZ2VMYXlvdXQ6IE9iamVjdFBhZ2VMYXlvdXQpIHtcblx0Y29uc3Qgb01ldGFNb2RlbCA9IG9PYmplY3RQYWdlTGF5b3V0LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCkgYXMgT0RhdGFNZXRhTW9kZWw7XG5cdGNvbnN0IG9CaW5kaW5nQ29udGV4dCA9IG9PYmplY3RQYWdlTGF5b3V0LmdldEJpbmRpbmdDb250ZXh0KCkgYXMgVjRDb250ZXh0O1xuXHRjb25zdCBwYXRoID0gKG9CaW5kaW5nQ29udGV4dCAmJiBvQmluZGluZ0NvbnRleHQuZ2V0UGF0aCgpKSB8fCBcIlwiO1xuXHRjb25zdCBvTWV0YVBhdGggPSBvTWV0YU1vZGVsLmdldE1ldGFQYXRoKHBhdGgpO1xuXHQvLyBTZW1hbnRpYyBLZXkgVm9jYWJ1bGFyeVxuXHRjb25zdCBzU2VtYW50aWNLZXlWb2NhYnVsYXJ5ID0gYCR7b01ldGFQYXRofS9gICsgYEBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuU2VtYW50aWNLZXlgO1xuXHQvL1NlbWFudGljIEtleXNcblx0Y29uc3QgYVNlbUtleXMgPSBvTWV0YU1vZGVsLmdldE9iamVjdChzU2VtYW50aWNLZXlWb2NhYnVsYXJ5KTtcblx0Ly8gVW5hdmFpbGFibGUgQWN0aW9uc1xuXHRjb25zdCBvRW50cnkgPSBvQmluZGluZ0NvbnRleHQ/LmdldE9iamVjdCgpO1xuXHRpZiAoIW9FbnRyeSAmJiBvQmluZGluZ0NvbnRleHQpIHtcblx0XHRvQmluZGluZ0NvbnRleHRcblx0XHRcdC5yZXF1ZXN0T2JqZWN0KClcblx0XHRcdC50aGVuKGFzeW5jIGZ1bmN0aW9uIChyZXF1ZXN0ZWRPYmplY3Q6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgdW5kZWZpbmVkKSB7XG5cdFx0XHRcdHJldHVybiB1cGRhdGVSZWxhdGVBcHBzTW9kZWwob0JpbmRpbmdDb250ZXh0LCByZXF1ZXN0ZWRPYmplY3QsIG9PYmplY3RQYWdlTGF5b3V0LCBhU2VtS2V5cywgb01ldGFNb2RlbCwgb01ldGFQYXRoKTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24gKG9FcnJvcjogdW5rbm93bikge1xuXHRcdFx0XHRMb2cuZXJyb3IoXCJDYW5ub3QgdXBkYXRlIHRoZSByZWxhdGVkIGFwcCBkZXRhaWxzXCIsIG9FcnJvciBhcyBzdHJpbmcpO1xuXHRcdFx0fSk7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIHVwZGF0ZVJlbGF0ZUFwcHNNb2RlbChvQmluZGluZ0NvbnRleHQsIG9FbnRyeSwgb09iamVjdFBhZ2VMYXlvdXQsIGFTZW1LZXlzLCBvTWV0YU1vZGVsLCBvTWV0YVBhdGgpO1xuXHR9XG59XG5cbi8qKlxuICogQHBhcmFtIG9CdXR0b25cbiAqL1xuZnVuY3Rpb24gZm5GaXJlQnV0dG9uUHJlc3Mob0J1dHRvbjogQ29udHJvbCkge1xuXHRpZiAoXG5cdFx0b0J1dHRvbiAmJlxuXHRcdG9CdXR0b24uaXNBPEJ1dHRvbiB8IE92ZXJmbG93VG9vbGJhckJ1dHRvbj4oW1wic2FwLm0uQnV0dG9uXCIsIFwic2FwLm0uT3ZlcmZsb3dUb29sYmFyQnV0dG9uXCJdKSAmJlxuXHRcdG9CdXR0b24uZ2V0VmlzaWJsZSgpICYmXG5cdFx0b0J1dHRvbi5nZXRFbmFibGVkKClcblx0KSB7XG5cdFx0b0J1dHRvbi5maXJlUHJlc3MoKTtcblx0fVxufVxuXG5mdW5jdGlvbiBmblJlc29sdmVTdHJpbmd0b0Jvb2xlYW4oc1ZhbHVlOiBzdHJpbmcgfCBib29sZWFuKSB7XG5cdGlmIChzVmFsdWUgPT09IFwidHJ1ZVwiIHx8IHNWYWx1ZSA9PT0gdHJ1ZSkge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxufVxuXG5mdW5jdGlvbiBnZXRBcHBDb21wb25lbnQob0NvbnRyb2w6IENvbnRyb2wgfCBDb21wb25lbnQpOiBBcHBDb21wb25lbnQge1xuXHRpZiAob0NvbnRyb2wuaXNBPEFwcENvbXBvbmVudD4oXCJzYXAuZmUuY29yZS5BcHBDb21wb25lbnRcIikpIHtcblx0XHRyZXR1cm4gb0NvbnRyb2w7XG5cdH1cblx0Y29uc3Qgb093bmVyID0gQ29tcG9uZW50LmdldE93bmVyQ29tcG9uZW50Rm9yKG9Db250cm9sKTtcblx0aWYgKCFvT3duZXIpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJUaGVyZSBzaG91bGQgYmUgYSBzYXAuZmUuY29yZS5BcHBDb21wb25lbnQgYXMgb3duZXIgb2YgdGhlIGNvbnRyb2xcIik7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIGdldEFwcENvbXBvbmVudChvT3duZXIpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGdldEN1cnJlbnRQYWdlVmlldyhvQXBwQ29tcG9uZW50OiBBcHBDb21wb25lbnQpIHtcblx0Y29uc3Qgcm9vdFZpZXdDb250cm9sbGVyID0gb0FwcENvbXBvbmVudC5nZXRSb290Vmlld0NvbnRyb2xsZXIoKTtcblx0cmV0dXJuIHJvb3RWaWV3Q29udHJvbGxlci5pc0ZjbEVuYWJsZWQoKVxuXHRcdD8gcm9vdFZpZXdDb250cm9sbGVyLmdldFJpZ2h0bW9zdFZpZXcoKVxuXHRcdDogQ29tbW9uVXRpbHMuZ2V0VGFyZ2V0Vmlldygob0FwcENvbXBvbmVudC5nZXRSb290Q29udGFpbmVyKCkgYXMgTmF2Q29udGFpbmVyKS5nZXRDdXJyZW50UGFnZSgpKTtcbn1cblxuZnVuY3Rpb24gZ2V0VGFyZ2V0VmlldyhvQ29udHJvbDogTWFuYWdlZE9iamVjdCB8IG51bGwpOiBWaWV3IHtcblx0aWYgKG9Db250cm9sICYmIG9Db250cm9sLmlzQTxDb21wb25lbnRDb250YWluZXI+KFwic2FwLnVpLmNvcmUuQ29tcG9uZW50Q29udGFpbmVyXCIpKSB7XG5cdFx0Y29uc3Qgb0NvbXBvbmVudCA9IG9Db250cm9sLmdldENvbXBvbmVudEluc3RhbmNlKCk7XG5cdFx0b0NvbnRyb2wgPSBvQ29tcG9uZW50ICYmIG9Db21wb25lbnQuZ2V0Um9vdENvbnRyb2woKTtcblx0fVxuXHR3aGlsZSAob0NvbnRyb2wgJiYgIW9Db250cm9sLmlzQTxWaWV3PihcInNhcC51aS5jb3JlLm12Yy5WaWV3XCIpKSB7XG5cdFx0b0NvbnRyb2wgPSBvQ29udHJvbC5nZXRQYXJlbnQoKTtcblx0fVxuXHRyZXR1cm4gb0NvbnRyb2whO1xufVxuXG5mdW5jdGlvbiBpc0ZpZWxkQ29udHJvbFBhdGhJbmFwcGxpY2FibGUoc0ZpZWxkQ29udHJvbFBhdGg6IHN0cmluZywgb0F0dHJpYnV0ZTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pIHtcblx0bGV0IGJJbmFwcGxpY2FibGUgPSBmYWxzZTtcblx0Y29uc3QgYVBhcnRzID0gc0ZpZWxkQ29udHJvbFBhdGguc3BsaXQoXCIvXCIpO1xuXHQvLyBzZW5zaXRpdmUgZGF0YSBpcyByZW1vdmVkIG9ubHkgaWYgdGhlIHBhdGggaGFzIGFscmVhZHkgYmVlbiByZXNvbHZlZC5cblx0aWYgKGFQYXJ0cy5sZW5ndGggPiAxKSB7XG5cdFx0YkluYXBwbGljYWJsZSA9XG5cdFx0XHRvQXR0cmlidXRlW2FQYXJ0c1swXV0gIT09IHVuZGVmaW5lZCAmJlxuXHRcdFx0KG9BdHRyaWJ1dGVbYVBhcnRzWzBdXSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikuaGFzT3duUHJvcGVydHkoYVBhcnRzWzFdKSAmJlxuXHRcdFx0KG9BdHRyaWJ1dGVbYVBhcnRzWzBdXSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPilbYVBhcnRzWzFdXSA9PT0gMDtcblx0fSBlbHNlIHtcblx0XHRiSW5hcHBsaWNhYmxlID0gb0F0dHJpYnV0ZVtzRmllbGRDb250cm9sUGF0aF0gPT09IDA7XG5cdH1cblx0cmV0dXJuIGJJbmFwcGxpY2FibGU7XG59XG50eXBlIFVua25vd25PRGF0YU9iamVjdCA9IHtcblx0ZW50aXR5U2V0Pzogc3RyaW5nO1xuXHRjb250ZXh0RGF0YToge1xuXHRcdFwiQG9kYXRhLmNvbnRleHRcIj86IHN0cmluZztcblx0XHRcIiU0MG9kYXRhLmNvbnRleHRcIj86IHN0cmluZztcblx0XHRcIkBvZGF0YS5tZXRhZGF0YUV0YWdcIj86IHN0cmluZztcblx0XHRcIiU0MG9kYXRhLm1ldGFkYXRhRXRhZ1wiPzogc3RyaW5nO1xuXHRcdFNBUF9fTWVzc2FnZXM/OiBzdHJpbmc7XG5cdFx0W1M6IHN0cmluZ106IHN0cmluZyB8IHVuZGVmaW5lZDtcblx0fTtcbn07XG5mdW5jdGlvbiByZW1vdmVTZW5zaXRpdmVEYXRhKGFBdHRyaWJ1dGVzOiBVbmtub3duT0RhdGFPYmplY3RbXSwgb01ldGFNb2RlbDogT0RhdGFNZXRhTW9kZWwpIHtcblx0Y29uc3QgYU91dEF0dHJpYnV0ZXMgPSBbXTtcblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhQXR0cmlidXRlcy5sZW5ndGg7IGkrKykge1xuXHRcdGNvbnN0IHNFbnRpdHlTZXQgPSBhQXR0cmlidXRlc1tpXS5lbnRpdHlTZXQsXG5cdFx0XHRvQXR0cmlidXRlID0gYUF0dHJpYnV0ZXNbaV0uY29udGV4dERhdGE7XG5cblx0XHRkZWxldGUgb0F0dHJpYnV0ZVtcIkBvZGF0YS5jb250ZXh0XCJdO1xuXHRcdGRlbGV0ZSBvQXR0cmlidXRlW1wiJTQwb2RhdGEuY29udGV4dFwiXTtcblx0XHRkZWxldGUgb0F0dHJpYnV0ZVtcIkBvZGF0YS5tZXRhZGF0YUV0YWdcIl07XG5cdFx0ZGVsZXRlIG9BdHRyaWJ1dGVbXCIlNDBvZGF0YS5tZXRhZGF0YUV0YWdcIl07XG5cdFx0ZGVsZXRlIG9BdHRyaWJ1dGVbXCJTQVBfX01lc3NhZ2VzXCJdO1xuXHRcdGNvbnN0IGFQcm9wZXJ0aWVzID0gT2JqZWN0LmtleXMob0F0dHJpYnV0ZSk7XG5cdFx0Zm9yIChsZXQgaiA9IDA7IGogPCBhUHJvcGVydGllcy5sZW5ndGg7IGorKykge1xuXHRcdFx0Y29uc3Qgc1Byb3AgPSBhUHJvcGVydGllc1tqXSxcblx0XHRcdFx0YVByb3BlcnR5QW5ub3RhdGlvbnMgPSBvTWV0YU1vZGVsLmdldE9iamVjdChgLyR7c0VudGl0eVNldH0vJHtzUHJvcH1AYCk7XG5cdFx0XHRpZiAoYVByb3BlcnR5QW5ub3RhdGlvbnMpIHtcblx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdGFQcm9wZXJ0eUFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlBlcnNvbmFsRGF0YS52MS5Jc1BvdGVudGlhbGx5U2Vuc2l0aXZlXCJdIHx8XG5cdFx0XHRcdFx0YVByb3BlcnR5QW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRXhjbHVkZUZyb21OYXZpZ2F0aW9uQ29udGV4dFwiXSB8fFxuXHRcdFx0XHRcdGFQcm9wZXJ0eUFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkFuYWx5dGljcy52MS5NZWFzdXJlXCJdXG5cdFx0XHRcdCkge1xuXHRcdFx0XHRcdGRlbGV0ZSBvQXR0cmlidXRlW3NQcm9wXTtcblx0XHRcdFx0fSBlbHNlIGlmIChhUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRmllbGRDb250cm9sXCJdKSB7XG5cdFx0XHRcdFx0Y29uc3Qgb0ZpZWxkQ29udHJvbCA9IGFQcm9wZXJ0eUFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5GaWVsZENvbnRyb2xcIl07XG5cdFx0XHRcdFx0aWYgKG9GaWVsZENvbnRyb2xbXCIkRW51bU1lbWJlclwiXSAmJiBvRmllbGRDb250cm9sW1wiJEVudW1NZW1iZXJcIl0uc3BsaXQoXCIvXCIpWzFdID09PSBcIkluYXBwbGljYWJsZVwiKSB7XG5cdFx0XHRcdFx0XHRkZWxldGUgb0F0dHJpYnV0ZVtzUHJvcF07XG5cdFx0XHRcdFx0fSBlbHNlIGlmIChvRmllbGRDb250cm9sW1wiJFBhdGhcIl0gJiYgQ29tbW9uVXRpbHMuaXNGaWVsZENvbnRyb2xQYXRoSW5hcHBsaWNhYmxlKG9GaWVsZENvbnRyb2xbXCIkUGF0aFwiXSwgb0F0dHJpYnV0ZSkpIHtcblx0XHRcdFx0XHRcdGRlbGV0ZSBvQXR0cmlidXRlW3NQcm9wXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0YU91dEF0dHJpYnV0ZXMucHVzaChvQXR0cmlidXRlKTtcblx0fVxuXG5cdHJldHVybiBhT3V0QXR0cmlidXRlcztcbn1cblxuZnVuY3Rpb24gX2ZuQ2hlY2tJc01hdGNoKG9PYmplY3Q6IG9iamVjdCwgb0tleXNUb0NoZWNrOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikge1xuXHRmb3IgKGNvbnN0IHNLZXkgaW4gb0tleXNUb0NoZWNrKSB7XG5cdFx0aWYgKG9LZXlzVG9DaGVja1tzS2V5XSAhPT0gb09iamVjdFtzS2V5IGFzIGtleW9mIHR5cGVvZiBvT2JqZWN0XSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gZm5HZXRDb250ZXh0UGF0aFByb3BlcnRpZXMoXG5cdG1ldGFNb2RlbENvbnRleHQ6IE9EYXRhTWV0YU1vZGVsLFxuXHRzQ29udGV4dFBhdGg6IHN0cmluZyxcblx0b0ZpbHRlcj86IFJlY29yZDxzdHJpbmcsIHVua25vd24+XG4pOiBSZWNvcmQ8c3RyaW5nLCBNZXRhTW9kZWxQcm9wZXJ0eT4gfCBSZWNvcmQ8c3RyaW5nLCBNZXRhTW9kZWxOYXZQcm9wZXJ0eT4ge1xuXHRjb25zdCBvRW50aXR5VHlwZTogTWV0YU1vZGVsRW50aXR5VHlwZSA9IChtZXRhTW9kZWxDb250ZXh0LmdldE9iamVjdChgJHtzQ29udGV4dFBhdGh9L2ApIHx8IHt9KSBhcyBNZXRhTW9kZWxFbnRpdHlUeXBlLFxuXHRcdG9Qcm9wZXJ0aWVzOiBSZWNvcmQ8c3RyaW5nLCBNZXRhTW9kZWxQcm9wZXJ0eT4gfCBSZWNvcmQ8c3RyaW5nLCBNZXRhTW9kZWxOYXZQcm9wZXJ0eT4gPSB7fTtcblxuXHRmb3IgKGNvbnN0IHNLZXkgaW4gb0VudGl0eVR5cGUpIHtcblx0XHRpZiAoXG5cdFx0XHRvRW50aXR5VHlwZS5oYXNPd25Qcm9wZXJ0eShzS2V5KSAmJlxuXHRcdFx0IS9eXFwkL2kudGVzdChzS2V5KSAmJlxuXHRcdFx0b0VudGl0eVR5cGVbc0tleV0uJGtpbmQgJiZcblx0XHRcdF9mbkNoZWNrSXNNYXRjaChvRW50aXR5VHlwZVtzS2V5XSwgb0ZpbHRlciB8fCB7ICRraW5kOiBcIlByb3BlcnR5XCIgfSlcblx0XHQpIHtcblx0XHRcdG9Qcm9wZXJ0aWVzW3NLZXldID0gb0VudGl0eVR5cGVbc0tleV07XG5cdFx0fVxuXHR9XG5cdHJldHVybiBvUHJvcGVydGllcztcbn1cblxuZnVuY3Rpb24gZm5HZXRNYW5kYXRvcnlGaWx0ZXJGaWVsZHMob01ldGFNb2RlbDogT0RhdGFNZXRhTW9kZWwsIHNDb250ZXh0UGF0aDogc3RyaW5nKSB7XG5cdGxldCBhTWFuZGF0b3J5RmlsdGVyRmllbGRzOiBFeHBhbmRQYXRoVHlwZTxFZG0uUHJvcGVydHlQYXRoPltdID0gW107XG5cdGlmIChvTWV0YU1vZGVsICYmIHNDb250ZXh0UGF0aCkge1xuXHRcdGFNYW5kYXRvcnlGaWx0ZXJGaWVsZHMgPSBvTWV0YU1vZGVsLmdldE9iamVjdChcblx0XHRcdGAke3NDb250ZXh0UGF0aH1AT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5GaWx0ZXJSZXN0cmljdGlvbnMvUmVxdWlyZWRQcm9wZXJ0aWVzYFxuXHRcdCkgYXMgRXhwYW5kUGF0aFR5cGU8RWRtLlByb3BlcnR5UGF0aD5bXTtcblx0fVxuXHRyZXR1cm4gYU1hbmRhdG9yeUZpbHRlckZpZWxkcztcbn1cblxuZnVuY3Rpb24gZm5HZXRJQk5BY3Rpb25zKG9Db250cm9sOiBUYWJsZSB8IE9iamVjdFBhZ2VEeW5hbWljSGVhZGVyVGl0bGUsIGFJQk5BY3Rpb25zOiB1bmtub3duW10pIHtcblx0Y29uc3QgYUFjdGlvbnMgPSBvQ29udHJvbCAmJiBvQ29udHJvbC5nZXRBY3Rpb25zKCk7XG5cdGlmIChhQWN0aW9ucykge1xuXHRcdGFBY3Rpb25zLmZvckVhY2goZnVuY3Rpb24gKG9BY3Rpb24pIHtcblx0XHRcdGlmIChvQWN0aW9uLmlzQTxBY3Rpb25Ub29sYmFyQWN0aW9uPihcInNhcC51aS5tZGMuYWN0aW9udG9vbGJhci5BY3Rpb25Ub29sYmFyQWN0aW9uXCIpKSB7XG5cdFx0XHRcdG9BY3Rpb24gPSBvQWN0aW9uLmdldEFjdGlvbigpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKG9BY3Rpb24uaXNBPE1lbnVCdXR0b24+KFwic2FwLm0uTWVudUJ1dHRvblwiKSkge1xuXHRcdFx0XHRjb25zdCBvTWVudSA9IG9BY3Rpb24uZ2V0TWVudSgpO1xuXHRcdFx0XHRjb25zdCBhSXRlbXMgPSBvTWVudS5nZXRJdGVtcygpO1xuXHRcdFx0XHRhSXRlbXMuZm9yRWFjaCgob0l0ZW0pID0+IHtcblx0XHRcdFx0XHRpZiAob0l0ZW0uZGF0YShcIklCTkRhdGFcIikpIHtcblx0XHRcdFx0XHRcdGFJQk5BY3Rpb25zLnB1c2gob0l0ZW0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9IGVsc2UgaWYgKG9BY3Rpb24uZGF0YShcIklCTkRhdGFcIikpIHtcblx0XHRcdFx0YUlCTkFjdGlvbnMucHVzaChvQWN0aW9uKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXHRyZXR1cm4gYUlCTkFjdGlvbnM7XG59XG5cbi8qKlxuICogQHBhcmFtIGFJQk5BY3Rpb25zXG4gKiBAcGFyYW0gb1ZpZXdcbiAqL1xuZnVuY3Rpb24gZm5VcGRhdGVEYXRhRmllbGRGb3JJQk5CdXR0b25zVmlzaWJpbGl0eShhSUJOQWN0aW9uczogQ29udHJvbFtdLCBvVmlldzogVmlldykge1xuXHRjb25zdCBvUGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCB7IHZhbHVlOiB1bmtub3duIH0+ID0ge307XG5cdGNvbnN0IGlzU3RpY2t5ID0gTW9kZWxIZWxwZXIuaXNTdGlja3lTZXNzaW9uU3VwcG9ydGVkKChvVmlldy5nZXRNb2RlbCgpIGFzIE9EYXRhTW9kZWwpLmdldE1ldGFNb2RlbCgpKTtcblx0Y29uc3QgZm5HZXRMaW5rcyA9IGZ1bmN0aW9uIChvRGF0YT86IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgdW5kZWZpbmVkKSB7XG5cdFx0aWYgKG9EYXRhKSB7XG5cdFx0XHRjb25zdCBhS2V5cyA9IE9iamVjdC5rZXlzKG9EYXRhKTtcblx0XHRcdGFLZXlzLmZvckVhY2goZnVuY3Rpb24gKHNLZXk6IHN0cmluZykge1xuXHRcdFx0XHRpZiAoc0tleS5pbmRleE9mKFwiX1wiKSAhPT0gMCAmJiBzS2V5LmluZGV4T2YoXCJvZGF0YS5jb250ZXh0XCIpID09PSAtMSkge1xuXHRcdFx0XHRcdG9QYXJhbXNbc0tleV0gPSB7IHZhbHVlOiBvRGF0YVtzS2V5XSB9O1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0aWYgKGFJQk5BY3Rpb25zLmxlbmd0aCkge1xuXHRcdFx0YUlCTkFjdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAob0lCTkFjdGlvbikge1xuXHRcdFx0XHRjb25zdCBzU2VtYW50aWNPYmplY3QgPSBvSUJOQWN0aW9uLmRhdGEoXCJJQk5EYXRhXCIpLnNlbWFudGljT2JqZWN0O1xuXHRcdFx0XHRjb25zdCBzQWN0aW9uID0gb0lCTkFjdGlvbi5kYXRhKFwiSUJORGF0YVwiKS5hY3Rpb247XG5cdFx0XHRcdENvbW1vblV0aWxzLmdldFNoZWxsU2VydmljZXMob1ZpZXcpXG5cdFx0XHRcdFx0LmdldExpbmtzKHtcblx0XHRcdFx0XHRcdHNlbWFudGljT2JqZWN0OiBzU2VtYW50aWNPYmplY3QsXG5cdFx0XHRcdFx0XHRhY3Rpb246IHNBY3Rpb24sXG5cdFx0XHRcdFx0XHRwYXJhbXM6IG9QYXJhbXNcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdC50aGVuKGZ1bmN0aW9uIChhTGluaykge1xuXHRcdFx0XHRcdFx0b0lCTkFjdGlvbi5zZXRWaXNpYmxlKG9JQk5BY3Rpb24uZ2V0VmlzaWJsZSgpICYmIGFMaW5rICYmIGFMaW5rLmxlbmd0aCA9PT0gMSk7XG5cdFx0XHRcdFx0XHRpZiAoaXNTdGlja3kpIHtcblx0XHRcdFx0XHRcdFx0KG9JQk5BY3Rpb24uZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSBhcyBJbnRlcm5hbE1vZGVsQ29udGV4dCkuc2V0UHJvcGVydHkoXG5cdFx0XHRcdFx0XHRcdFx0b0lCTkFjdGlvbi5nZXRJZCgpLnNwbGl0KFwiLS1cIilbMV0sXG5cdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0c2hlbGxOYXZpZ2F0aW9uTm90QXZhaWxhYmxlOiAhKGFMaW5rICYmIGFMaW5rLmxlbmd0aCA9PT0gMSlcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24gKG9FcnJvcjogdW5rbm93bikge1xuXHRcdFx0XHRcdFx0TG9nLmVycm9yKFwiQ2Fubm90IHJldHJpZXZlIHRoZSBsaW5rcyBmcm9tIHRoZSBzaGVsbCBzZXJ2aWNlXCIsIG9FcnJvciBhcyBzdHJpbmcpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9O1xuXHRpZiAob1ZpZXcgJiYgb1ZpZXcuZ2V0QmluZGluZ0NvbnRleHQoKSkge1xuXHRcdChvVmlldy5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIE9EYXRhVjRDb250ZXh0KVxuXHRcdFx0Py5yZXF1ZXN0T2JqZWN0KClcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChvRGF0YTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCB1bmRlZmluZWQpIHtcblx0XHRcdFx0cmV0dXJuIGZuR2V0TGlua3Mob0RhdGEpO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbiAob0Vycm9yOiB1bmtub3duKSB7XG5cdFx0XHRcdExvZy5lcnJvcihcIkNhbm5vdCByZXRyaWV2ZSB0aGUgbGlua3MgZnJvbSB0aGUgc2hlbGwgc2VydmljZVwiLCBvRXJyb3IgYXMgc3RyaW5nKTtcblx0XHRcdH0pO1xuXHR9IGVsc2Uge1xuXHRcdGZuR2V0TGlua3MoKTtcblx0fVxufVxuXG5mdW5jdGlvbiBnZXRUcmFuc2xhdGVkVGV4dChzRnJhbWV3b3JrS2V5OiBzdHJpbmcsIG9SZXNvdXJjZUJ1bmRsZTogUmVzb3VyY2VCdW5kbGUsIHBhcmFtZXRlcnM/OiB1bmtub3duW10sIHNFbnRpdHlTZXROYW1lPzogc3RyaW5nKSB7XG5cdGxldCBzUmVzb3VyY2VLZXkgPSBzRnJhbWV3b3JrS2V5O1xuXHRpZiAob1Jlc291cmNlQnVuZGxlKSB7XG5cdFx0aWYgKHNFbnRpdHlTZXROYW1lKSB7XG5cdFx0XHQvLyBUaGVyZSBhcmUgY29uc29sZSBlcnJvcnMgbG9nZ2VkIHdoZW4gbWFraW5nIGNhbGxzIHRvIGdldFRleHQgZm9yIGtleXMgdGhhdCBhcmUgbm90IGRlZmluZWQgaW4gdGhlIHJlc291cmNlIGJ1bmRsZVxuXHRcdFx0Ly8gZm9yIGluc3RhbmNlIGtleXMgd2hpY2ggYXJlIHN1cHBvc2VkIHRvIGJlIHByb3ZpZGVkIGJ5IHRoZSBhcHBsaWNhdGlvbiwgZS5nLCA8a2V5Pnw8ZW50aXR5U2V0PiB0byBvdmVycmlkZSBpbnN0YW5jZSBzcGVjaWZpYyB0ZXh0XG5cdFx0XHQvLyBoZW5jZSBjaGVjayBpZiB0ZXh0IGV4aXN0cyAodXNpbmcgXCJoYXNUZXh0XCIpIGluIHRoZSByZXNvdXJjZSBidW5kbGUgYmVmb3JlIGNhbGxpbmcgXCJnZXRUZXh0XCJcblxuXHRcdFx0Ly8gXCJoYXNUZXh0XCIgb25seSBjaGVja3MgZm9yIHRoZSBrZXkgaW4gdGhlIGltbWVkaWF0ZSByZXNvdXJjZSBidW5kbGUgYW5kIG5vdCBpdCdzIGN1c3RvbSBidW5kbGVzXG5cdFx0XHQvLyBoZW5jZSB3ZSBuZWVkIHRvIGRvIHRoaXMgcmVjdXJyc2l2ZWx5IHRvIGNoZWNrIGlmIHRoZSBrZXkgZXhpc3RzIGluIGFueSBvZiB0aGUgYnVuZGxlcyB0aGUgZm9ybXMgdGhlIEZFIHJlc291cmNlIGJ1bmRsZVxuXHRcdFx0Y29uc3QgYlJlc291cmNlS2V5RXhpc3RzID0gY2hlY2tJZlJlc291cmNlS2V5RXhpc3RzKFxuXHRcdFx0XHQob1Jlc291cmNlQnVuZGxlIGFzIEludGVybmFsUmVzb3VyY2VCdW5kbGUpLmFDdXN0b21CdW5kbGVzLFxuXHRcdFx0XHRgJHtzRnJhbWV3b3JrS2V5fXwke3NFbnRpdHlTZXROYW1lfWBcblx0XHRcdCk7XG5cblx0XHRcdC8vIGlmIHJlc291cmNlIGtleSB3aXRoIGVudGl0eSBzZXQgbmFtZSBmb3IgaW5zdGFuY2Ugc3BlY2lmaWMgdGV4dCBvdmVycmlkaW5nIGlzIHByb3ZpZGVkIGJ5IHRoZSBhcHBsaWNhdGlvblxuXHRcdFx0Ly8gdGhlbiB1c2UgdGhlIHNhbWUga2V5IG90aGVyd2lzZSB1c2UgdGhlIEZyYW1ld29yayBrZXlcblx0XHRcdHNSZXNvdXJjZUtleSA9IGJSZXNvdXJjZUtleUV4aXN0cyA/IGAke3NGcmFtZXdvcmtLZXl9fCR7c0VudGl0eVNldE5hbWV9YCA6IHNGcmFtZXdvcmtLZXk7XG5cdFx0fVxuXHRcdHJldHVybiBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChzUmVzb3VyY2VLZXksIHBhcmFtZXRlcnMpO1xuXHR9XG5cblx0Ly8gZG8gbm90IGFsbG93IG92ZXJyaWRlIHNvIGdldCB0ZXh0IGZyb20gdGhlIGludGVybmFsIGJ1bmRsZSBkaXJlY3RseVxuXHRvUmVzb3VyY2VCdW5kbGUgPSBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5jb3JlXCIpO1xuXHRyZXR1cm4gb1Jlc291cmNlQnVuZGxlLmdldFRleHQoc1Jlc291cmNlS2V5LCBwYXJhbWV0ZXJzKTtcbn1cblxuZnVuY3Rpb24gY2hlY2tJZlJlc291cmNlS2V5RXhpc3RzKGFDdXN0b21CdW5kbGVzOiBJbnRlcm5hbFJlc291cmNlQnVuZGxlW10sIHNLZXk6IHN0cmluZykge1xuXHRpZiAoYUN1c3RvbUJ1bmRsZXMubGVuZ3RoKSB7XG5cdFx0Zm9yIChsZXQgaSA9IGFDdXN0b21CdW5kbGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG5cdFx0XHRjb25zdCBzVmFsdWUgPSBhQ3VzdG9tQnVuZGxlc1tpXS5oYXNUZXh0KHNLZXkpO1xuXHRcdFx0Ly8gdGV4dCBmb3VuZCByZXR1cm4gdHJ1ZVxuXHRcdFx0aWYgKHNWYWx1ZSkge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHRcdGNoZWNrSWZSZXNvdXJjZUtleUV4aXN0cyhhQ3VzdG9tQnVuZGxlc1tpXS5hQ3VzdG9tQnVuZGxlcywgc0tleSk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gZ2V0QWN0aW9uUGF0aChhY3Rpb25Db250ZXh0OiBDb250ZXh0LCBiUmV0dXJuT25seVBhdGg6IGJvb2xlYW4sIHNBY3Rpb25OYW1lPzogc3RyaW5nLCBiQ2hlY2tTdGF0aWNWYWx1ZT86IGJvb2xlYW4pIHtcblx0c0FjdGlvbk5hbWUgPSAhc0FjdGlvbk5hbWUgPyBhY3Rpb25Db250ZXh0LmdldE9iamVjdChhY3Rpb25Db250ZXh0LmdldFBhdGgoKSkudG9TdHJpbmcoKSA6IHNBY3Rpb25OYW1lO1xuXHRsZXQgc0NvbnRleHRQYXRoID0gYWN0aW9uQ29udGV4dC5nZXRQYXRoKCkuc3BsaXQoXCIvQFwiKVswXTtcblx0Y29uc3Qgc0VudGl0eVR5cGVOYW1lID0gKGFjdGlvbkNvbnRleHQuZ2V0T2JqZWN0KHNDb250ZXh0UGF0aCkgYXMgTWV0YU1vZGVsRW50aXR5VHlwZSkuJFR5cGU7XG5cdGNvbnN0IHNFbnRpdHlOYW1lID0gZ2V0RW50aXR5U2V0TmFtZShhY3Rpb25Db250ZXh0LmdldE1vZGVsKCkgYXMgT0RhdGFNZXRhTW9kZWwsIHNFbnRpdHlUeXBlTmFtZSk7XG5cdGlmIChzRW50aXR5TmFtZSkge1xuXHRcdHNDb250ZXh0UGF0aCA9IGAvJHtzRW50aXR5TmFtZX1gO1xuXHR9XG5cdGlmIChiQ2hlY2tTdGF0aWNWYWx1ZSkge1xuXHRcdHJldHVybiBhY3Rpb25Db250ZXh0LmdldE9iamVjdChgJHtzQ29udGV4dFBhdGh9LyR7c0FjdGlvbk5hbWV9QE9yZy5PRGF0YS5Db3JlLlYxLk9wZXJhdGlvbkF2YWlsYWJsZWApO1xuXHR9XG5cdGlmIChiUmV0dXJuT25seVBhdGgpIHtcblx0XHRyZXR1cm4gYCR7c0NvbnRleHRQYXRofS8ke3NBY3Rpb25OYW1lfWA7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHNDb250ZXh0UGF0aDogc0NvbnRleHRQYXRoLFxuXHRcdFx0c1Byb3BlcnR5OiBhY3Rpb25Db250ZXh0LmdldE9iamVjdChgJHtzQ29udGV4dFBhdGh9LyR7c0FjdGlvbk5hbWV9QE9yZy5PRGF0YS5Db3JlLlYxLk9wZXJhdGlvbkF2YWlsYWJsZS8kUGF0aGApLFxuXHRcdFx0c0JpbmRpbmdQYXJhbWV0ZXI6IGFjdGlvbkNvbnRleHQuZ2V0T2JqZWN0KGAke3NDb250ZXh0UGF0aH0vJHtzQWN0aW9uTmFtZX0vQCR1aTUub3ZlcmxvYWQvMC8kUGFyYW1ldGVyLzAvJE5hbWVgKVxuXHRcdH07XG5cdH1cbn1cblxuZnVuY3Rpb24gZ2V0RW50aXR5U2V0TmFtZShvTWV0YU1vZGVsOiBPRGF0YU1ldGFNb2RlbCwgc0VudGl0eVR5cGU6IHN0cmluZykge1xuXHRjb25zdCBvRW50aXR5Q29udGFpbmVyID0gb01ldGFNb2RlbC5nZXRPYmplY3QoXCIvXCIpO1xuXHRmb3IgKGNvbnN0IGtleSBpbiBvRW50aXR5Q29udGFpbmVyKSB7XG5cdFx0aWYgKHR5cGVvZiBvRW50aXR5Q29udGFpbmVyW2tleV0gPT09IFwib2JqZWN0XCIgJiYgb0VudGl0eUNvbnRhaW5lcltrZXldLiRUeXBlID09PSBzRW50aXR5VHlwZSkge1xuXHRcdFx0cmV0dXJuIGtleTtcblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gY29tcHV0ZURpc3BsYXlNb2RlKG9Qcm9wZXJ0eUFubm90YXRpb25zOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiwgb0NvbGxlY3Rpb25Bbm5vdGF0aW9ucz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KSB7XG5cdGNvbnN0IG9UZXh0QW5ub3RhdGlvbiA9IG9Qcm9wZXJ0eUFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5UZXh0XCJdLFxuXHRcdG9UZXh0QXJyYW5nZW1lbnRBbm5vdGF0aW9uID0gKG9UZXh0QW5ub3RhdGlvbiAmJlxuXHRcdFx0KChvUHJvcGVydHlBbm5vdGF0aW9ucyAmJlxuXHRcdFx0XHRvUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGV4dEBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5UZXh0QXJyYW5nZW1lbnRcIl0pIHx8XG5cdFx0XHRcdChvQ29sbGVjdGlvbkFubm90YXRpb25zICYmXG5cdFx0XHRcdFx0b0NvbGxlY3Rpb25Bbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5UZXh0QXJyYW5nZW1lbnRcIl0pKSkgYXMgTWV0YU1vZGVsRW51bTxUZXh0QXJyYW5nZW1lbnQ+O1xuXG5cdGlmIChvVGV4dEFycmFuZ2VtZW50QW5ub3RhdGlvbikge1xuXHRcdGlmIChvVGV4dEFycmFuZ2VtZW50QW5ub3RhdGlvbi4kRW51bU1lbWJlciA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5UZXh0QXJyYW5nZW1lbnRUeXBlL1RleHRPbmx5XCIpIHtcblx0XHRcdHJldHVybiBcIkRlc2NyaXB0aW9uXCI7XG5cdFx0fSBlbHNlIGlmIChvVGV4dEFycmFuZ2VtZW50QW5ub3RhdGlvbi4kRW51bU1lbWJlciA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5UZXh0QXJyYW5nZW1lbnRUeXBlL1RleHRMYXN0XCIpIHtcblx0XHRcdHJldHVybiBcIlZhbHVlRGVzY3JpcHRpb25cIjtcblx0XHR9IGVsc2UgaWYgKG9UZXh0QXJyYW5nZW1lbnRBbm5vdGF0aW9uLiRFbnVtTWVtYmVyID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlRleHRBcnJhbmdlbWVudFR5cGUvVGV4dFNlcGFyYXRlXCIpIHtcblx0XHRcdHJldHVybiBcIlZhbHVlXCI7XG5cdFx0fVxuXHRcdC8vRGVmYXVsdCBzaG91bGQgYmUgVGV4dEZpcnN0IGlmIHRoZXJlIGlzIGEgVGV4dCBhbm5vdGF0aW9uIGFuZCBuZWl0aGVyIFRleHRPbmx5IG5vciBUZXh0TGFzdCBhcmUgc2V0XG5cdFx0cmV0dXJuIFwiRGVzY3JpcHRpb25WYWx1ZVwiO1xuXHR9XG5cdHJldHVybiBvVGV4dEFubm90YXRpb24gPyBcIkRlc2NyaXB0aW9uVmFsdWVcIiA6IFwiVmFsdWVcIjtcbn1cblxuZnVuY3Rpb24gX2dldEVudGl0eVR5cGUob0NvbnRleHQ6IE9EYXRhVjRDb250ZXh0KSB7XG5cdGNvbnN0IG9NZXRhTW9kZWwgPSBvQ29udGV4dC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpO1xuXHRyZXR1cm4gb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7b01ldGFNb2RlbC5nZXRNZXRhUGF0aChvQ29udGV4dC5nZXRQYXRoKCkpfS8kVHlwZWApO1xufVxuXG5hc3luYyBmdW5jdGlvbiBfcmVxdWVzdE9iamVjdChzQWN0aW9uOiBzdHJpbmcsIG9TZWxlY3RlZENvbnRleHQ6IE9EYXRhVjRDb250ZXh0LCBzUHJvcGVydHk6IHN0cmluZykge1xuXHRsZXQgb0NvbnRleHQgPSBvU2VsZWN0ZWRDb250ZXh0O1xuXHRjb25zdCBuQnJhY2tldEluZGV4ID0gc0FjdGlvbi5pbmRleE9mKFwiKFwiKTtcblxuXHRpZiAobkJyYWNrZXRJbmRleCA+IC0xKSB7XG5cdFx0Y29uc3Qgc1RhcmdldFR5cGUgPSBzQWN0aW9uLnNsaWNlKG5CcmFja2V0SW5kZXggKyAxLCAtMSk7XG5cdFx0bGV0IHNDdXJyZW50VHlwZSA9IF9nZXRFbnRpdHlUeXBlKG9Db250ZXh0KTtcblxuXHRcdHdoaWxlIChzQ3VycmVudFR5cGUgIT09IHNUYXJnZXRUeXBlKSB7XG5cdFx0XHQvLyBGaW5kIHBhcmVudCBiaW5kaW5nIGNvbnRleHQgYW5kIHJldHJpZXZlIGVudGl0eSB0eXBlXG5cdFx0XHRvQ29udGV4dCA9IG9Db250ZXh0LmdldEJpbmRpbmcoKS5nZXRDb250ZXh0KCkgYXMgT0RhdGFWNENvbnRleHQ7XG5cdFx0XHRpZiAob0NvbnRleHQpIHtcblx0XHRcdFx0c0N1cnJlbnRUeXBlID0gX2dldEVudGl0eVR5cGUob0NvbnRleHQpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0TG9nLndhcm5pbmcoXCJDYW5ub3QgZGV0ZXJtaW5lIHRhcmdldCB0eXBlIHRvIHJlcXVlc3QgcHJvcGVydHkgdmFsdWUgZm9yIGJvdW5kIGFjdGlvbiBpbnZvY2F0aW9uXCIpO1xuXHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHVuZGVmaW5lZCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIG9Db250ZXh0LnJlcXVlc3RPYmplY3Qoc1Byb3BlcnR5KTtcbn1cblxuZXhwb3J0IHR5cGUgX1JlcXVlc3RlZFByb3BlcnR5ID0ge1xuXHR2UHJvcGVydHlWYWx1ZTogdW5rbm93bjtcblx0b1NlbGVjdGVkQ29udGV4dDogQ29udGV4dDtcblx0c0FjdGlvbjogc3RyaW5nO1xuXHRzRHluYW1pY0FjdGlvbkVuYWJsZWRQYXRoOiBzdHJpbmc7XG59O1xuYXN5bmMgZnVuY3Rpb24gcmVxdWVzdFByb3BlcnR5KFxuXHRvU2VsZWN0ZWRDb250ZXh0OiBWNENvbnRleHQsXG5cdHNBY3Rpb246IHN0cmluZyxcblx0c1Byb3BlcnR5OiBzdHJpbmcsXG5cdHNEeW5hbWljQWN0aW9uRW5hYmxlZFBhdGg6IHN0cmluZ1xuKTogUHJvbWlzZTxfUmVxdWVzdGVkUHJvcGVydHk+IHtcblx0Y29uc3Qgb1Byb21pc2UgPVxuXHRcdHNQcm9wZXJ0eSAmJiBzUHJvcGVydHkuaW5kZXhPZihcIi9cIikgPT09IDBcblx0XHRcdD8gcmVxdWVzdFNpbmdsZXRvblByb3BlcnR5KHNQcm9wZXJ0eSwgb1NlbGVjdGVkQ29udGV4dC5nZXRNb2RlbCgpKVxuXHRcdFx0OiBfcmVxdWVzdE9iamVjdChzQWN0aW9uLCBvU2VsZWN0ZWRDb250ZXh0LCBzUHJvcGVydHkpO1xuXG5cdHJldHVybiBvUHJvbWlzZS50aGVuKGFzeW5jIGZ1bmN0aW9uICh2UHJvcGVydHlWYWx1ZTogdW5rbm93bikge1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoe1xuXHRcdFx0dlByb3BlcnR5VmFsdWU6IHZQcm9wZXJ0eVZhbHVlLFxuXHRcdFx0b1NlbGVjdGVkQ29udGV4dDogb1NlbGVjdGVkQ29udGV4dCxcblx0XHRcdHNBY3Rpb246IHNBY3Rpb24sXG5cdFx0XHRzRHluYW1pY0FjdGlvbkVuYWJsZWRQYXRoOiBzRHluYW1pY0FjdGlvbkVuYWJsZWRQYXRoXG5cdFx0fSk7XG5cdH0pO1xufVxuXG5hc3luYyBmdW5jdGlvbiBzZXRDb250ZXh0c0Jhc2VkT25PcGVyYXRpb25BdmFpbGFibGUoXG5cdG9JbnRlcm5hbE1vZGVsQ29udGV4dDogSW50ZXJuYWxNb2RlbENvbnRleHQsXG5cdGFSZXF1ZXN0UHJvbWlzZXM6IFByb21pc2U8X1JlcXVlc3RlZFByb3BlcnR5PltdXG4pIHtcblx0cmV0dXJuIFByb21pc2UuYWxsKGFSZXF1ZXN0UHJvbWlzZXMpXG5cdFx0LnRoZW4oZnVuY3Rpb24gKGFSZXN1bHRzKSB7XG5cdFx0XHRpZiAoYVJlc3VsdHMubGVuZ3RoKSB7XG5cdFx0XHRcdGNvbnN0IGFBcHBsaWNhYmxlQ29udGV4dHM6IHVua25vd25bXSA9IFtdLFxuXHRcdFx0XHRcdGFOb3RBcHBsaWNhYmxlQ29udGV4dHM6IHVua25vd25bXSA9IFtdO1xuXHRcdFx0XHRhUmVzdWx0cy5mb3JFYWNoKGZ1bmN0aW9uIChhUmVzdWx0KSB7XG5cdFx0XHRcdFx0aWYgKGFSZXN1bHQpIHtcblx0XHRcdFx0XHRcdGlmIChhUmVzdWx0LnZQcm9wZXJ0eVZhbHVlKSB7XG5cdFx0XHRcdFx0XHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5nZXRNb2RlbCgpLnNldFByb3BlcnR5KGFSZXN1bHQuc0R5bmFtaWNBY3Rpb25FbmFibGVkUGF0aCwgdHJ1ZSk7XG5cdFx0XHRcdFx0XHRcdGFBcHBsaWNhYmxlQ29udGV4dHMucHVzaChhUmVzdWx0Lm9TZWxlY3RlZENvbnRleHQpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0YU5vdEFwcGxpY2FibGVDb250ZXh0cy5wdXNoKGFSZXN1bHQub1NlbGVjdGVkQ29udGV4dCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdFx0c2V0RHluYW1pY0FjdGlvbkNvbnRleHRzKG9JbnRlcm5hbE1vZGVsQ29udGV4dCwgYVJlc3VsdHNbMF0uc0FjdGlvbiwgYUFwcGxpY2FibGVDb250ZXh0cywgYU5vdEFwcGxpY2FibGVDb250ZXh0cyk7XG5cdFx0XHR9XG5cdFx0fSlcblx0XHQuY2F0Y2goZnVuY3Rpb24gKG9FcnJvcjogdW5rbm93bikge1xuXHRcdFx0TG9nLnRyYWNlKFwiQ2Fubm90IHJldHJpZXZlIHByb3BlcnR5IHZhbHVlIGZyb20gcGF0aFwiLCBvRXJyb3IgYXMgc3RyaW5nKTtcblx0XHR9KTtcbn1cblxuLyoqXG4gKiBAcGFyYW0gb0ludGVybmFsTW9kZWxDb250ZXh0XG4gKiBAcGFyYW0gc0FjdGlvblxuICogQHBhcmFtIGFBcHBsaWNhYmxlXG4gKiBAcGFyYW0gYU5vdEFwcGxpY2FibGVcbiAqL1xuZnVuY3Rpb24gc2V0RHluYW1pY0FjdGlvbkNvbnRleHRzKFxuXHRvSW50ZXJuYWxNb2RlbENvbnRleHQ6IEludGVybmFsTW9kZWxDb250ZXh0LFxuXHRzQWN0aW9uOiBzdHJpbmcsXG5cdGFBcHBsaWNhYmxlOiB1bmtub3duW10sXG5cdGFOb3RBcHBsaWNhYmxlOiB1bmtub3duW11cbikge1xuXHRjb25zdCBzRHluYW1pY0FjdGlvblBhdGhQcmVmaXggPSBgJHtvSW50ZXJuYWxNb2RlbENvbnRleHQuZ2V0UGF0aCgpfS9keW5hbWljQWN0aW9ucy8ke3NBY3Rpb259YCxcblx0XHRvSW50ZXJuYWxNb2RlbCA9IG9JbnRlcm5hbE1vZGVsQ29udGV4dC5nZXRNb2RlbCgpO1xuXHRvSW50ZXJuYWxNb2RlbC5zZXRQcm9wZXJ0eShgJHtzRHluYW1pY0FjdGlvblBhdGhQcmVmaXh9L2FBcHBsaWNhYmxlYCwgYUFwcGxpY2FibGUpO1xuXHRvSW50ZXJuYWxNb2RlbC5zZXRQcm9wZXJ0eShgJHtzRHluYW1pY0FjdGlvblBhdGhQcmVmaXh9L2FOb3RBcHBsaWNhYmxlYCwgYU5vdEFwcGxpY2FibGUpO1xufVxuXG5mdW5jdGlvbiBfZ2V0RGVmYXVsdE9wZXJhdG9ycyhzUHJvcGVydHlUeXBlPzogc3RyaW5nKSB7XG5cdC8vIG1kYyBkZWZpbmVzIHRoZSBmdWxsIHNldCBvZiBvcGVyYXRpb25zIHRoYXQgYXJlIG1lYW5pbmdmdWwgZm9yIGVhY2ggRWRtIFR5cGVcblx0Ly8gVE9ETyBSZXBsYWNlIHdpdGggbW9kZWwgLyBpbnRlcm5hbCB3YXkgb2YgcmV0cmlldmluZyB0aGUgYWN0dWFsIG1vZGVsIHR5cGUgdXNlZCBmb3IgdGhlIHByb3BlcnR5XG5cdGNvbnN0IG9EYXRhQ2xhc3MgPSBUeXBlVXRpbC5nZXREYXRhVHlwZUNsYXNzTmFtZShzUHJvcGVydHlUeXBlKTtcblx0Ly8gVE9ETyBuZWVkIHRvIHBhc3MgcHJvcGVyIGZvcm1hdE9wdGlvbnMsIGNvbnN0cmFpbnRzIGhlcmVcblx0Y29uc3Qgb0Jhc2VUeXBlID0gVHlwZVV0aWwuZ2V0QmFzZVR5cGUob0RhdGFDbGFzcywge30sIHt9KTtcblx0cmV0dXJuIEZpbHRlck9wZXJhdG9yVXRpbC5nZXRPcGVyYXRvcnNGb3JUeXBlKG9CYXNlVHlwZSk7XG59XG5cbmZ1bmN0aW9uIF9nZXRSZXN0cmljdGlvbnMoYURlZmF1bHRPcHM6IHN0cmluZ1tdLCBhRXhwcmVzc2lvbk9wczogc3RyaW5nW10pOiBzdHJpbmdbXSB7XG5cdC8vIEZyb20gdGhlIGRlZmF1bHQgc2V0IG9mIE9wZXJhdG9ycyBmb3IgdGhlIEJhc2UgVHlwZSwgc2VsZWN0IHRob3NlIHRoYXQgYXJlIGRlZmluZWQgaW4gdGhlIEFsbG93ZWQgVmFsdWUuXG5cdC8vIEluIGNhc2UgdGhhdCBubyBvcGVyYXRvcnMgYXJlIGZvdW5kLCByZXR1cm4gdW5kZWZpbmVkIHNvIHRoYXQgdGhlIGRlZmF1bHQgc2V0IGlzIHVzZWQuXG5cdHJldHVybiBhRGVmYXVsdE9wcy5maWx0ZXIoZnVuY3Rpb24gKHNFbGVtZW50KSB7XG5cdFx0cmV0dXJuIGFFeHByZXNzaW9uT3BzLmluZGV4T2Yoc0VsZW1lbnQpID4gLTE7XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBnZXRTcGVjaWZpY0FsbG93ZWRFeHByZXNzaW9uKGFFeHByZXNzaW9uczogc3RyaW5nW10pIHtcblx0Y29uc3QgYUFsbG93ZWRFeHByZXNzaW9uc1ByaW9yaXR5ID0gQ29tbW9uVXRpbHMuQWxsb3dlZEV4cHJlc3Npb25zUHJpbztcblxuXHRhRXhwcmVzc2lvbnMuc29ydChmdW5jdGlvbiAoYTogc3RyaW5nLCBiOiBzdHJpbmcpIHtcblx0XHRyZXR1cm4gYUFsbG93ZWRFeHByZXNzaW9uc1ByaW9yaXR5LmluZGV4T2YoYSkgLSBhQWxsb3dlZEV4cHJlc3Npb25zUHJpb3JpdHkuaW5kZXhPZihiKTtcblx0fSk7XG5cblx0cmV0dXJuIGFFeHByZXNzaW9uc1swXTtcbn1cblxuLyoqXG4gKiBNZXRob2QgdG8gZmV0Y2ggdGhlIGNvcnJlY3Qgb3BlcmF0b3JzIGJhc2VkIG9uIHRoZSBmaWx0ZXIgcmVzdHJpY3Rpb25zIHRoYXQgY2FuIGJlIGFubm90YXRlZCBvbiBhbiBlbnRpdHkgc2V0IG9yIGEgbmF2aWdhdGlvbiBwcm9wZXJ0eS5cbiAqIFdlIHJldHVybiB0aGUgY29ycmVjdCBvcGVyYXRvcnMgYmFzZWQgb24gdGhlIHNwZWNpZmllZCByZXN0cmljdGlvbiBhbmQgYWxzbyBjaGVjayBmb3IgdGhlIG9wZXJhdG9ycyBkZWZpbmVkIGluIHRoZSBtYW5pZmVzdCB0byBpbmNsdWRlIG9yIGV4Y2x1ZGUgdGhlbS5cbiAqXG4gKiBAcGFyYW0gc1Byb3BlcnR5IFN0cmluZyBuYW1lIG9mIHRoZSBwcm9wZXJ0eVxuICogQHBhcmFtIHNFbnRpdHlTZXRQYXRoIFN0cmluZyBwYXRoIHRvIHRoZSBlbnRpdHkgc2V0XG4gKiBAcGFyYW0gb0NvbnRleHQgQ29udGV4dCB1c2VkIGR1cmluZyB0ZW1wbGF0aW5nXG4gKiBAcGFyYW0gc1R5cGUgU3RyaW5nIGRhdGEgdHlwZSBvZCB0aGUgcHJvcGVydHksIGZvciBleGFtcGxlIGVkbS5EYXRlXG4gKiBAcGFyYW0gYlVzZVNlbWFudGljRGF0ZVJhbmdlIEJvb2xlYW4gcGFzc2VkIGZyb20gdGhlIG1hbmlmZXN0IGZvciBzZW1hbnRpYyBkYXRlIHJhbmdlXG4gKiBAcGFyYW0gc1NldHRpbmdzIFN0cmluZ2lmaWVkIG9iamVjdCBvZiB0aGUgcHJvcGVydHkgc2V0dGluZ3NcbiAqIEByZXR1cm5zIEFuIGFycmF5IG9mIHN0cmluZ3MgcmVwcmVzZW50aW5nIG9wZXJhdG9ycyBmb3IgZmlsdGVyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRPcGVyYXRvcnNGb3JQcm9wZXJ0eShcblx0c1Byb3BlcnR5OiBzdHJpbmcsXG5cdHNFbnRpdHlTZXRQYXRoOiBzdHJpbmcsXG5cdG9Db250ZXh0OiBPRGF0YU1ldGFNb2RlbCxcblx0c1R5cGU/OiBzdHJpbmcsXG5cdGJVc2VTZW1hbnRpY0RhdGVSYW5nZT86IGJvb2xlYW4gfCBzdHJpbmcsXG5cdHNTZXR0aW5ncz86IHN0cmluZ1xuKTogc3RyaW5nW10ge1xuXHRjb25zdCBvRmlsdGVyUmVzdHJpY3Rpb25zID0gQ29tbW9uVXRpbHMuZ2V0RmlsdGVyUmVzdHJpY3Rpb25zQnlQYXRoKHNFbnRpdHlTZXRQYXRoLCBvQ29udGV4dCk7XG5cdGNvbnN0IGFFcXVhbHNPcHMgPSBbXCJFUVwiXTtcblx0Y29uc3QgYVNpbmdsZVJhbmdlT3BzID0gW1wiRVFcIiwgXCJHRVwiLCBcIkxFXCIsIFwiTFRcIiwgXCJHVFwiLCBcIkJUXCIsIFwiTk9UTEVcIiwgXCJOT1RMVFwiLCBcIk5PVEdFXCIsIFwiTk9UR1RcIl07XG5cdGNvbnN0IGFTaW5nbGVSYW5nZURUQmFzaWNPcHMgPSBbXCJFUVwiLCBcIkJUXCJdO1xuXHRjb25zdCBhU2luZ2xlVmFsdWVEYXRlT3BzID0gW1xuXHRcdFwiVE9EQVlcIixcblx0XHRcIlRPTU9SUk9XXCIsXG5cdFx0XCJZRVNURVJEQVlcIixcblx0XHRcIkRBVEVcIixcblx0XHRcIkZJUlNUREFZV0VFS1wiLFxuXHRcdFwiTEFTVERBWVdFRUtcIixcblx0XHRcIkZJUlNUREFZTU9OVEhcIixcblx0XHRcIkxBU1REQVlNT05USFwiLFxuXHRcdFwiRklSU1REQVlRVUFSVEVSXCIsXG5cdFx0XCJMQVNUREFZUVVBUlRFUlwiLFxuXHRcdFwiRklSU1REQVlZRUFSXCIsXG5cdFx0XCJMQVNUREFZWUVBUlwiXG5cdF07XG5cdGNvbnN0IGFCYXNpY0RhdGVUaW1lT3BzID0gW1wiRVFcIiwgXCJCVFwiXTtcblx0Y29uc3QgYU11bHRpUmFuZ2VPcHMgPSBbXCJFUVwiLCBcIkdFXCIsIFwiTEVcIiwgXCJMVFwiLCBcIkdUXCIsIFwiQlRcIiwgXCJORVwiLCBcIk5PVEJUXCIsIFwiTk9UTEVcIiwgXCJOT1RMVFwiLCBcIk5PVEdFXCIsIFwiTk9UR1RcIl07XG5cdGNvbnN0IGFTZWFyY2hFeHByZXNzaW9uT3BzID0gW1wiQ29udGFpbnNcIiwgXCJOb3RDb250YWluc1wiLCBcIlN0YXJ0c1dpdGhcIiwgXCJOb3RTdGFydHNXaXRoXCIsIFwiRW5kc1dpdGhcIiwgXCJOb3RFbmRzV2l0aFwiXTtcblx0Y29uc3QgYVNlbWFudGljRGF0ZU9wc0V4dCA9IFNlbWFudGljRGF0ZU9wZXJhdG9ycy5nZXRTdXBwb3J0ZWRPcGVyYXRpb25zKCk7XG5cdGNvbnN0IGJTZW1hbnRpY0RhdGVSYW5nZSA9IGJVc2VTZW1hbnRpY0RhdGVSYW5nZSA9PT0gXCJ0cnVlXCIgfHwgYlVzZVNlbWFudGljRGF0ZVJhbmdlID09PSB0cnVlO1xuXHRsZXQgYVNlbWFudGljRGF0ZU9wczogc3RyaW5nW10gPSBbXTtcblx0Y29uc3Qgb1NldHRpbmdzID0gc1NldHRpbmdzICYmIHR5cGVvZiBzU2V0dGluZ3MgPT09IFwic3RyaW5nXCIgPyBKU09OLnBhcnNlKHNTZXR0aW5ncykuY3VzdG9tRGF0YSA6IHNTZXR0aW5ncztcblxuXHRpZiAoKG9Db250ZXh0LmdldE9iamVjdChgJHtzRW50aXR5U2V0UGF0aH0vQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5SZXN1bHRDb250ZXh0YCkgYXMgdW5rbm93bikgPT09IHRydWUpIHtcblx0XHRyZXR1cm4gYUVxdWFsc09wcztcblx0fVxuXG5cdGlmIChvU2V0dGluZ3MgJiYgb1NldHRpbmdzLm9wZXJhdG9yQ29uZmlndXJhdGlvbiAmJiBvU2V0dGluZ3Mub3BlcmF0b3JDb25maWd1cmF0aW9uLmxlbmd0aCA+IDApIHtcblx0XHRhU2VtYW50aWNEYXRlT3BzID0gU2VtYW50aWNEYXRlT3BlcmF0b3JzLmdldEZpbHRlck9wZXJhdGlvbnMob1NldHRpbmdzLm9wZXJhdG9yQ29uZmlndXJhdGlvbik7XG5cdH0gZWxzZSB7XG5cdFx0YVNlbWFudGljRGF0ZU9wcyA9IFNlbWFudGljRGF0ZU9wZXJhdG9ycy5nZXRTZW1hbnRpY0RhdGVPcGVyYXRpb25zKCk7XG5cdH1cblx0Ly8gR2V0IHRoZSBkZWZhdWx0IE9wZXJhdG9ycyBmb3IgdGhpcyBQcm9wZXJ0eSBUeXBlXG5cdGxldCBhRGVmYXVsdE9wZXJhdG9ycyA9IF9nZXREZWZhdWx0T3BlcmF0b3JzKHNUeXBlKTtcblx0aWYgKGJTZW1hbnRpY0RhdGVSYW5nZSkge1xuXHRcdGFEZWZhdWx0T3BlcmF0b3JzID0gYVNlbWFudGljRGF0ZU9wc0V4dC5jb25jYXQoYURlZmF1bHRPcGVyYXRvcnMpO1xuXHR9XG5cdGxldCByZXN0cmljdGlvbnM6IHN0cmluZ1tdID0gW107XG5cblx0Ly8gSXMgdGhlcmUgYSBGaWx0ZXIgUmVzdHJpY3Rpb24gZGVmaW5lZCBmb3IgdGhpcyBwcm9wZXJ0eT9cblx0aWYgKG9GaWx0ZXJSZXN0cmljdGlvbnMgJiYgb0ZpbHRlclJlc3RyaWN0aW9ucy5GaWx0ZXJBbGxvd2VkRXhwcmVzc2lvbnMgJiYgb0ZpbHRlclJlc3RyaWN0aW9ucy5GaWx0ZXJBbGxvd2VkRXhwcmVzc2lvbnNbc1Byb3BlcnR5XSkge1xuXHRcdC8vIEV4dGVuZGluZyB0aGUgZGVmYXVsdCBvcGVyYXRvcnMgbGlzdCB3aXRoIFNlbWFudGljIERhdGUgb3B0aW9ucyBEQVRFUkFOR0UsIERBVEUsIEZST00gYW5kIFRPXG5cdFx0Y29uc3Qgc0FsbG93ZWRFeHByZXNzaW9uID0gQ29tbW9uVXRpbHMuZ2V0U3BlY2lmaWNBbGxvd2VkRXhwcmVzc2lvbihvRmlsdGVyUmVzdHJpY3Rpb25zLkZpbHRlckFsbG93ZWRFeHByZXNzaW9uc1tzUHJvcGVydHldKTtcblx0XHQvLyBJbiBjYXNlIG1vcmUgdGhhbiBvbmUgQWxsb3dlZCBFeHByZXNzaW9ucyBoYXMgYmVlbiBkZWZpbmVkIGZvciBhIHByb3BlcnR5XG5cdFx0Ly8gY2hvb3NlIHRoZSBtb3N0IHJlc3RyaWN0aXZlIEFsbG93ZWQgRXhwcmVzc2lvblxuXG5cdFx0Ly8gTXVsdGlWYWx1ZSBoYXMgc2FtZSBPcGVyYXRvciBhcyBTaW5nbGVWYWx1ZSwgYnV0IHRoZXJlIGNhbiBiZSBtb3JlIHRoYW4gb25lIChtYXhDb25kaXRpb25zKVxuXHRcdHN3aXRjaCAoc0FsbG93ZWRFeHByZXNzaW9uKSB7XG5cdFx0XHRjYXNlIFwiU2luZ2xlVmFsdWVcIjpcblx0XHRcdFx0Y29uc3QgYVNpbmdsZVZhbHVlT3BzID0gc1R5cGUgPT09IFwiRWRtLkRhdGVcIiAmJiBiU2VtYW50aWNEYXRlUmFuZ2UgPyBhU2luZ2xlVmFsdWVEYXRlT3BzIDogYUVxdWFsc09wcztcblx0XHRcdFx0cmVzdHJpY3Rpb25zID0gX2dldFJlc3RyaWN0aW9ucyhhRGVmYXVsdE9wZXJhdG9ycywgYVNpbmdsZVZhbHVlT3BzKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiTXVsdGlWYWx1ZVwiOlxuXHRcdFx0XHRyZXN0cmljdGlvbnMgPSBfZ2V0UmVzdHJpY3Rpb25zKGFEZWZhdWx0T3BlcmF0b3JzLCBhRXF1YWxzT3BzKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiU2luZ2xlUmFuZ2VcIjpcblx0XHRcdFx0bGV0IGFFeHByZXNzaW9uT3BzOiBzdHJpbmdbXTtcblx0XHRcdFx0aWYgKGJTZW1hbnRpY0RhdGVSYW5nZSkge1xuXHRcdFx0XHRcdGlmIChzVHlwZSA9PT0gXCJFZG0uRGF0ZVwiKSB7XG5cdFx0XHRcdFx0XHRhRXhwcmVzc2lvbk9wcyA9IGFTZW1hbnRpY0RhdGVPcHM7XG5cdFx0XHRcdFx0fSBlbHNlIGlmIChzVHlwZSA9PT0gXCJFZG0uRGF0ZVRpbWVPZmZzZXRcIikge1xuXHRcdFx0XHRcdFx0YUV4cHJlc3Npb25PcHMgPSBhU2VtYW50aWNEYXRlT3BzLmNvbmNhdChhQmFzaWNEYXRlVGltZU9wcyk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGFFeHByZXNzaW9uT3BzID0gYVNpbmdsZVJhbmdlT3BzO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIGlmIChzVHlwZSA9PT0gXCJFZG0uRGF0ZVRpbWVPZmZzZXRcIikge1xuXHRcdFx0XHRcdGFFeHByZXNzaW9uT3BzID0gYVNpbmdsZVJhbmdlRFRCYXNpY09wcztcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRhRXhwcmVzc2lvbk9wcyA9IGFTaW5nbGVSYW5nZU9wcztcblx0XHRcdFx0fVxuXHRcdFx0XHRjb25zdCBzT3BlcmF0b3JzID0gX2dldFJlc3RyaWN0aW9ucyhhRGVmYXVsdE9wZXJhdG9ycywgYUV4cHJlc3Npb25PcHMpO1xuXHRcdFx0XHRyZXN0cmljdGlvbnMgPSBzT3BlcmF0b3JzO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJNdWx0aVJhbmdlXCI6XG5cdFx0XHRcdHJlc3RyaWN0aW9ucyA9IF9nZXRSZXN0cmljdGlvbnMoYURlZmF1bHRPcGVyYXRvcnMsIGFNdWx0aVJhbmdlT3BzKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiU2VhcmNoRXhwcmVzc2lvblwiOlxuXHRcdFx0XHRyZXN0cmljdGlvbnMgPSBfZ2V0UmVzdHJpY3Rpb25zKGFEZWZhdWx0T3BlcmF0b3JzLCBhU2VhcmNoRXhwcmVzc2lvbk9wcyk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIk11bHRpUmFuZ2VPclNlYXJjaEV4cHJlc3Npb25cIjpcblx0XHRcdFx0cmVzdHJpY3Rpb25zID0gX2dldFJlc3RyaWN0aW9ucyhhRGVmYXVsdE9wZXJhdG9ycywgYVNlYXJjaEV4cHJlc3Npb25PcHMuY29uY2F0KGFNdWx0aVJhbmdlT3BzKSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHRcdC8vIEluIGNhc2UgQWxsb3dlZEV4cHJlc3Npb25zIGlzIG5vdCByZWNvZ25pc2VkLCB1bmRlZmluZWQgaW4gcmV0dXJuIHJlc3VsdHMgaW4gdGhlIGRlZmF1bHQgc2V0IG9mXG5cdFx0Ly8gb3BlcmF0b3JzIGZvciB0aGUgdHlwZS5cblx0fVxuXHRyZXR1cm4gcmVzdHJpY3Rpb25zO1xufVxuXG4vKipcbiAqIE1ldGhvZCB0byByZXR1cm4gYWxsb3dlZCBvcGVyYXRvcnMgZm9yIHR5cGUgR3VpZC5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBuYW1lIGdldE9wZXJhdG9yc0Zvckd1aWRQcm9wZXJ0eVxuICogQHJldHVybnMgQWxsb3dlZCBvcGVyYXRvcnMgZm9yIHR5cGUgR3VpZFxuICovXG5mdW5jdGlvbiBnZXRPcGVyYXRvcnNGb3JHdWlkUHJvcGVydHkoKTogc3RyaW5nIHtcblx0Y29uc3QgYWxsb3dlZE9wZXJhdG9yc0Zvckd1aWQgPSBbXCJFUVwiLCBcIk5FXCJdO1xuXHRyZXR1cm4gYWxsb3dlZE9wZXJhdG9yc0Zvckd1aWQudG9TdHJpbmcoKTtcbn1cblxuZnVuY3Rpb24gZ2V0T3BlcmF0b3JzRm9yRGF0ZVByb3BlcnR5KHByb3BlcnR5VHlwZTogc3RyaW5nKTogc3RyaW5nW10ge1xuXHQvLyBJbiBjYXNlIEFsbG93ZWRFeHByZXNzaW9ucyBpcyBub3QgcHJvdmlkZWQgZm9yIHR5cGUgRWRtLkRhdGUgdGhlbiBhbGwgdGhlIGRlZmF1bHRcblx0Ly8gb3BlcmF0b3JzIGZvciB0aGUgdHlwZSBzaG91bGQgYmUgcmV0dXJuZWQgZXhjbHVkaW5nIHNlbWFudGljIG9wZXJhdG9ycyBmcm9tIHRoZSBsaXN0LlxuXHRjb25zdCBhRGVmYXVsdE9wZXJhdG9ycyA9IF9nZXREZWZhdWx0T3BlcmF0b3JzKHByb3BlcnR5VHlwZSk7XG5cdGNvbnN0IGFNdWx0aVJhbmdlT3BzID0gW1wiRVFcIiwgXCJHRVwiLCBcIkxFXCIsIFwiTFRcIiwgXCJHVFwiLCBcIkJUXCIsIFwiTkVcIiwgXCJOT1RCVFwiLCBcIk5PVExFXCIsIFwiTk9UTFRcIiwgXCJOT1RHRVwiLCBcIk5PVEdUXCJdO1xuXHRyZXR1cm4gX2dldFJlc3RyaWN0aW9ucyhhRGVmYXVsdE9wZXJhdG9ycywgYU11bHRpUmFuZ2VPcHMpO1xufVxuXG50eXBlIFBhcmFtZXRlckluZm8gPSB7XG5cdGNvbnRleHRQYXRoPzogc3RyaW5nO1xuXHRwYXJhbWV0ZXJQcm9wZXJ0aWVzPzogUmVjb3JkPHN0cmluZywgTWV0YU1vZGVsUHJvcGVydHk+O1xufTtcbmZ1bmN0aW9uIGdldFBhcmFtZXRlckluZm8obWV0YU1vZGVsQ29udGV4dDogT0RhdGFNZXRhTW9kZWwsIHNDb250ZXh0UGF0aDogc3RyaW5nKSB7XG5cdGNvbnN0IHNQYXJhbWV0ZXJDb250ZXh0UGF0aCA9IHNDb250ZXh0UGF0aC5zdWJzdHJpbmcoMCwgc0NvbnRleHRQYXRoLmxhc3RJbmRleE9mKFwiL1wiKSk7XG5cdGNvbnN0IGJSZXN1bHRDb250ZXh0ID0gbWV0YU1vZGVsQ29udGV4dC5nZXRPYmplY3QoYCR7c1BhcmFtZXRlckNvbnRleHRQYXRofS9AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlJlc3VsdENvbnRleHRgKTtcblx0Y29uc3Qgb1BhcmFtZXRlckluZm86IFBhcmFtZXRlckluZm8gPSB7fTtcblx0aWYgKGJSZXN1bHRDb250ZXh0ICYmIHNQYXJhbWV0ZXJDb250ZXh0UGF0aCAhPT0gc0NvbnRleHRQYXRoKSB7XG5cdFx0b1BhcmFtZXRlckluZm8uY29udGV4dFBhdGggPSBzUGFyYW1ldGVyQ29udGV4dFBhdGg7XG5cdFx0b1BhcmFtZXRlckluZm8ucGFyYW1ldGVyUHJvcGVydGllcyA9IENvbW1vblV0aWxzLmdldENvbnRleHRQYXRoUHJvcGVydGllcyhtZXRhTW9kZWxDb250ZXh0LCBzUGFyYW1ldGVyQ29udGV4dFBhdGgpO1xuXHR9XG5cdHJldHVybiBvUGFyYW1ldGVySW5mbztcbn1cblxuLyoqXG4gKiBNZXRob2QgdG8gYWRkIHRoZSBzZWxlY3QgT3B0aW9ucyB0byBmaWx0ZXIgY29uZGl0aW9ucy5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBuYW1lIGFkZFNlbGVjdE9wdGlvblRvQ29uZGl0aW9uc1xuICogQHBhcmFtIG9Qcm9wZXJ0eU1ldGFkYXRhIFByb3BlcnR5IG1ldGFkYXRhIGluZm9ybWF0aW9uXG4gKiBAcGFyYW0gYVZhbGlkT3BlcmF0b3JzIE9wZXJhdG9ycyBmb3IgYWxsIHRoZSBkYXRhIHR5cGVzXG4gKiBAcGFyYW0gYVNlbWFudGljRGF0ZU9wZXJhdG9ycyBPcGVyYXRvcnMgZm9yIHRoZSBEYXRlIHR5cGVcbiAqIEBwYXJhbSBhQ3VtdWxhdGl2ZUNvbmRpdGlvbnMgRmlsdGVyIGNvbmRpdGlvbnNcbiAqIEBwYXJhbSBvU2VsZWN0T3B0aW9uIFNlbGVjdG9wdGlvbiBvZiBzZWxlY3Rpb24gdmFyaWFudFxuICogQHJldHVybnMgVGhlIGZpbHRlciBjb25kaXRpb25zXG4gKi9cbmZ1bmN0aW9uIGFkZFNlbGVjdE9wdGlvblRvQ29uZGl0aW9ucyhcblx0b1Byb3BlcnR5TWV0YWRhdGE6IHVua25vd24sXG5cdGFWYWxpZE9wZXJhdG9yczogc3RyaW5nW10sXG5cdGFTZW1hbnRpY0RhdGVPcGVyYXRvcnM6IHN0cmluZ1tdLFxuXHRhQ3VtdWxhdGl2ZUNvbmRpdGlvbnM6IENvbmRpdGlvbk9iamVjdFtdLFxuXHRvU2VsZWN0T3B0aW9uOiBTZWxlY3RPcHRpb25cbikge1xuXHRjb25zdCBvQ29uZGl0aW9uID0gZ2V0Q29uZGl0aW9ucyhvU2VsZWN0T3B0aW9uLCBvUHJvcGVydHlNZXRhZGF0YSk7XG5cdGlmIChcblx0XHRvU2VsZWN0T3B0aW9uPy5TZW1hbnRpY0RhdGVzICYmXG5cdFx0YVNlbWFudGljRGF0ZU9wZXJhdG9ycyAmJlxuXHRcdGFTZW1hbnRpY0RhdGVPcGVyYXRvcnMuaW5kZXhPZihvU2VsZWN0T3B0aW9uPy5TZW1hbnRpY0RhdGVzPy5vcGVyYXRvcikgPiAtMVxuXHQpIHtcblx0XHRjb25zdCBzZW1hbnRpY0RhdGVzID0gQ29tbW9uVXRpbHMuYWRkU2VtYW50aWNEYXRlc1RvQ29uZGl0aW9ucyhvU2VsZWN0T3B0aW9uPy5TZW1hbnRpY0RhdGVzKTtcblx0XHRpZiAoc2VtYW50aWNEYXRlcyAmJiBPYmplY3Qua2V5cyhzZW1hbnRpY0RhdGVzKS5sZW5ndGggPiAwKSB7XG5cdFx0XHRhQ3VtdWxhdGl2ZUNvbmRpdGlvbnMucHVzaChzZW1hbnRpY0RhdGVzKTtcblx0XHR9XG5cdH0gZWxzZSBpZiAob0NvbmRpdGlvbikge1xuXHRcdGlmIChhVmFsaWRPcGVyYXRvcnMubGVuZ3RoID09PSAwIHx8IGFWYWxpZE9wZXJhdG9ycy5pbmRleE9mKG9Db25kaXRpb24ub3BlcmF0b3IpID4gLTEpIHtcblx0XHRcdGFDdW11bGF0aXZlQ29uZGl0aW9ucy5wdXNoKG9Db25kaXRpb24pO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gYUN1bXVsYXRpdmVDb25kaXRpb25zO1xufVxuXG4vKipcbiAqIE1ldGhvZCB0byBhZGQgdGhlIHNlbWFudGljIGRhdGVzIHRvIGZpbHRlciBjb25kaXRpb25zXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAbmFtZSBhZGRTZW1hbnRpY0RhdGVzVG9Db25kaXRpb25zXG4gKiBAcGFyYW0gb1NlbWFudGljRGF0ZXMgU2VtYW50aWMgZGF0ZSBpbmZvbWF0aW9uXG4gKiBAcmV0dXJucyBUaGUgZmlsdGVyIGNvbmRpdGlvbnMgY29udGFpbmluZyBzZW1hbnRpYyBkYXRlc1xuICovXG5cbmZ1bmN0aW9uIGFkZFNlbWFudGljRGF0ZXNUb0NvbmRpdGlvbnMob1NlbWFudGljRGF0ZXM6IFNlbWFudGljRGF0ZUNvbmZpZ3VyYXRpb24pOiBDb25kaXRpb25PYmplY3Qge1xuXHRjb25zdCB2YWx1ZXM6IHVua25vd25bXSA9IFtdO1xuXHRpZiAob1NlbWFudGljRGF0ZXM/LmhpZ2gpIHtcblx0XHR2YWx1ZXMucHVzaChvU2VtYW50aWNEYXRlcz8uaGlnaCk7XG5cdH1cblx0aWYgKG9TZW1hbnRpY0RhdGVzPy5sb3cpIHtcblx0XHR2YWx1ZXMucHVzaChvU2VtYW50aWNEYXRlcz8ubG93KTtcblx0fVxuXHRyZXR1cm4ge1xuXHRcdHZhbHVlczogdmFsdWVzLFxuXHRcdG9wZXJhdG9yOiBvU2VtYW50aWNEYXRlcz8ub3BlcmF0b3IsXG5cdFx0aXNFbXB0eTogdW5kZWZpbmVkXG5cdH07XG59XG5cbmZ1bmN0aW9uIGFkZFNlbGVjdE9wdGlvbnNUb0NvbmRpdGlvbnMoXG5cdHNDb250ZXh0UGF0aDogc3RyaW5nLFxuXHRvU2VsZWN0aW9uVmFyaWFudDogU2VsZWN0aW9uVmFyaWFudCxcblx0c1NlbGVjdE9wdGlvblByb3A6IHN0cmluZyxcblx0b0NvbmRpdGlvbnM6IFJlY29yZDxzdHJpbmcsIENvbmRpdGlvbk9iamVjdFtdPixcblx0c0NvbmRpdGlvblBhdGg6IHN0cmluZyB8IHVuZGVmaW5lZCxcblx0c0NvbmRpdGlvblByb3A6IHN0cmluZyxcblx0b1ZhbGlkUHJvcGVydGllczogUmVjb3JkPHN0cmluZywgTWV0YU1vZGVsUHJvcGVydHk+LFxuXHRtZXRhTW9kZWxDb250ZXh0OiBPRGF0YU1ldGFNb2RlbCxcblx0aXNQYXJhbWV0ZXI6IGJvb2xlYW4sXG5cdGJJc0ZMUFZhbHVlUHJlc2VudD86IGJvb2xlYW4sXG5cdGJVc2VTZW1hbnRpY0RhdGVSYW5nZT86IGJvb2xlYW4gfCBzdHJpbmcsXG5cdG9WaWV3RGF0YT86IG9iamVjdFxuKSB7XG5cdGxldCBhQ29uZGl0aW9uczogQ29uZGl0aW9uT2JqZWN0W10gPSBbXSxcblx0XHRhU2VsZWN0T3B0aW9uczogU2VsZWN0T3B0aW9uW10sXG5cdFx0YVZhbGlkT3BlcmF0b3JzOiBzdHJpbmdbXSxcblx0XHRhU2VtYW50aWNEYXRlT3BlcmF0b3JzOiBzdHJpbmdbXSA9IFtdO1xuXG5cdGlmIChpc1BhcmFtZXRlciB8fCBDb21tb25VdGlscy5pc1Byb3BlcnR5RmlsdGVyYWJsZShtZXRhTW9kZWxDb250ZXh0LCBzQ29udGV4dFBhdGgsIHNDb25kaXRpb25Qcm9wLCB0cnVlKSkge1xuXHRcdGNvbnN0IG9Qcm9wZXJ0eU1ldGFkYXRhID0gb1ZhbGlkUHJvcGVydGllc1tzQ29uZGl0aW9uUHJvcF07XG5cdFx0YVNlbGVjdE9wdGlvbnMgPSBvU2VsZWN0aW9uVmFyaWFudC5nZXRTZWxlY3RPcHRpb24oc1NlbGVjdE9wdGlvblByb3ApIGFzIFNlbGVjdE9wdGlvbltdO1xuXHRcdGNvbnN0IHNldHRpbmdzID0gZ2V0RmlsdGVyQ29uZmlndXJhdGlvblNldHRpbmcob1ZpZXdEYXRhLCBzQ29uZGl0aW9uUHJvcCk7XG5cdFx0YVZhbGlkT3BlcmF0b3JzID0gaXNQYXJhbWV0ZXIgPyBbXCJFUVwiXSA6IENvbW1vblV0aWxzLmdldE9wZXJhdG9yc0ZvclByb3BlcnR5KHNDb25kaXRpb25Qcm9wLCBzQ29udGV4dFBhdGgsIG1ldGFNb2RlbENvbnRleHQpO1xuXHRcdGlmIChiVXNlU2VtYW50aWNEYXRlUmFuZ2UpIHtcblx0XHRcdGFTZW1hbnRpY0RhdGVPcGVyYXRvcnMgPSBpc1BhcmFtZXRlclxuXHRcdFx0XHQ/IFtcIkVRXCJdXG5cdFx0XHRcdDogQ29tbW9uVXRpbHMuZ2V0T3BlcmF0b3JzRm9yUHJvcGVydHkoXG5cdFx0XHRcdFx0XHRzQ29uZGl0aW9uUHJvcCxcblx0XHRcdFx0XHRcdHNDb250ZXh0UGF0aCxcblx0XHRcdFx0XHRcdG1ldGFNb2RlbENvbnRleHQsXG5cdFx0XHRcdFx0XHRvUHJvcGVydHlNZXRhZGF0YT8uJFR5cGUsXG5cdFx0XHRcdFx0XHRiVXNlU2VtYW50aWNEYXRlUmFuZ2UsXG5cdFx0XHRcdFx0XHRzZXR0aW5nc1xuXHRcdFx0XHQgICk7XG5cdFx0fVxuXHRcdC8vIENyZWF0ZSBjb25kaXRpb25zIGZvciBhbGwgdGhlIHNlbGVjdE9wdGlvbnMgb2YgdGhlIHByb3BlcnR5XG5cdFx0YUNvbmRpdGlvbnMgPSBpc1BhcmFtZXRlclxuXHRcdFx0PyBDb21tb25VdGlscy5hZGRTZWxlY3RPcHRpb25Ub0NvbmRpdGlvbnMoXG5cdFx0XHRcdFx0b1Byb3BlcnR5TWV0YWRhdGEsXG5cdFx0XHRcdFx0YVZhbGlkT3BlcmF0b3JzLFxuXHRcdFx0XHRcdGFTZW1hbnRpY0RhdGVPcGVyYXRvcnMsXG5cdFx0XHRcdFx0YUNvbmRpdGlvbnMsXG5cdFx0XHRcdFx0YVNlbGVjdE9wdGlvbnNbMF1cblx0XHRcdCAgKVxuXHRcdFx0OiBhU2VsZWN0T3B0aW9ucy5yZWR1Y2UoXG5cdFx0XHRcdFx0Q29tbW9uVXRpbHMuYWRkU2VsZWN0T3B0aW9uVG9Db25kaXRpb25zLmJpbmQobnVsbCwgb1Byb3BlcnR5TWV0YWRhdGEsIGFWYWxpZE9wZXJhdG9ycywgYVNlbWFudGljRGF0ZU9wZXJhdG9ycyksXG5cdFx0XHRcdFx0YUNvbmRpdGlvbnNcblx0XHRcdCAgKTtcblx0XHRpZiAoYUNvbmRpdGlvbnMubGVuZ3RoKSB7XG5cdFx0XHRpZiAoc0NvbmRpdGlvblBhdGgpIHtcblx0XHRcdFx0b0NvbmRpdGlvbnNbc0NvbmRpdGlvblBhdGggKyBzQ29uZGl0aW9uUHJvcF0gPSBvQ29uZGl0aW9ucy5oYXNPd25Qcm9wZXJ0eShzQ29uZGl0aW9uUGF0aCArIHNDb25kaXRpb25Qcm9wKVxuXHRcdFx0XHRcdD8gb0NvbmRpdGlvbnNbc0NvbmRpdGlvblBhdGggKyBzQ29uZGl0aW9uUHJvcF0uY29uY2F0KGFDb25kaXRpb25zKVxuXHRcdFx0XHRcdDogYUNvbmRpdGlvbnM7XG5cdFx0XHR9IGVsc2UgaWYgKGJJc0ZMUFZhbHVlUHJlc2VudCkge1xuXHRcdFx0XHQvLyBJZiBGTFAgdmFsdWVzIGFyZSBwcmVzZW50IHJlcGxhY2UgaXQgd2l0aCBGTFAgdmFsdWVzXG5cdFx0XHRcdGFDb25kaXRpb25zLmZvckVhY2goKGVsZW1lbnQpID0+IHtcblx0XHRcdFx0XHRlbGVtZW50W1wiZmlsdGVyZWRcIl0gPSB0cnVlO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0aWYgKG9Db25kaXRpb25zLmhhc093blByb3BlcnR5KHNDb25kaXRpb25Qcm9wKSkge1xuXHRcdFx0XHRcdG9Db25kaXRpb25zW3NDb25kaXRpb25Qcm9wXS5mb3JFYWNoKChlbGVtZW50KSA9PiB7XG5cdFx0XHRcdFx0XHRlbGVtZW50W1wiZmlsdGVyZWRcIl0gPSBmYWxzZTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRvQ29uZGl0aW9uc1tzQ29uZGl0aW9uUHJvcF0gPSBvQ29uZGl0aW9uc1tzQ29uZGl0aW9uUHJvcF0uY29uY2F0KGFDb25kaXRpb25zKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRvQ29uZGl0aW9uc1tzQ29uZGl0aW9uUHJvcF0gPSBhQ29uZGl0aW9ucztcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0b0NvbmRpdGlvbnNbc0NvbmRpdGlvblByb3BdID0gb0NvbmRpdGlvbnMuaGFzT3duUHJvcGVydHkoc0NvbmRpdGlvblByb3ApXG5cdFx0XHRcdFx0PyBvQ29uZGl0aW9uc1tzQ29uZGl0aW9uUHJvcF0uY29uY2F0KGFDb25kaXRpb25zKVxuXHRcdFx0XHRcdDogYUNvbmRpdGlvbnM7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59XG5cbi8qKlxuICogTWV0aG9kIHRvIGNyZWF0ZSB0aGUgc2VtYW50aWMgZGF0ZXMgZnJvbSBmaWx0ZXIgY29uZGl0aW9uc1xuICpcbiAqIEBmdW5jdGlvblxuICogQG5hbWUgY3JlYXRlU2VtYW50aWNEYXRlc0Zyb21Db25kaXRpb25zXG4gKiBAcGFyYW0gb0NvbmRpdGlvbiBGaWx0ZXIgZmllbGQgY29uZGl0aW9uXG4gKiBAcGFyYW0gc0ZpbHRlck5hbWUgRmlsdGVyIEZpZWxkIFBhdGhcbiAqIEByZXR1cm5zIFRoZSBTZW1hbnRpYyBkYXRlIGNvbmRpdGlvbnNcbiAqL1xuXG5mdW5jdGlvbiBjcmVhdGVTZW1hbnRpY0RhdGVzRnJvbUNvbmRpdGlvbnMob0NvbmRpdGlvbjogQ29uZGl0aW9uVHlwZSk6IFNlbWFudGljRGF0ZUNvbmZpZ3VyYXRpb24ge1xuXHRyZXR1cm4ge1xuXHRcdGhpZ2g6IChvQ29uZGl0aW9uPy52YWx1ZXM/LlswXSBhcyBzdHJpbmcpIHx8IG51bGwsXG5cdFx0bG93OiAob0NvbmRpdGlvbj8udmFsdWVzPy5bMV0gYXMgc3RyaW5nKSB8fCBudWxsLFxuXHRcdG9wZXJhdG9yOiBvQ29uZGl0aW9uPy5vcGVyYXRvclxuXHR9O1xufVxuXG4vKipcbiAqIE1ldGhvZCB0byBSZXR1cm4gdGhlIGZpbHRlciBjb25maWd1cmF0aW9uXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAbmFtZSBnZXRGaWx0ZXJDb25maWd1cmF0aW9uU2V0dGluZ1xuICogQHBhcmFtIG9WaWV3RGF0YSBtYW5pZmVzdCBDb25maWd1cmF0aW9uXG4gKiBAcGFyYW0gc1Byb3BlcnR5IEZpbHRlciBGaWVsZCBQYXRoXG4gKiBAcmV0dXJucyBUaGUgRmlsdGVyIEZpZWxkIENvbmZpZ3VyYXRpb25cbiAqL1xudHlwZSBWaWV3RGF0YSA9IHtcblx0Y29udHJvbENvbmZpZ3VyYXRpb24/OiBSZWNvcmQ8c3RyaW5nLCBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPj47XG59O1xuZnVuY3Rpb24gZ2V0RmlsdGVyQ29uZmlndXJhdGlvblNldHRpbmcob1ZpZXdEYXRhOiBWaWV3RGF0YSA9IHt9LCBzUHJvcGVydHk6IHN0cmluZykge1xuXHRjb25zdCBvQ29uZmlnID0gb1ZpZXdEYXRhPy5jb250cm9sQ29uZmlndXJhdGlvbjtcblx0Y29uc3QgZmlsdGVyQ29uZmlnID1cblx0XHRvQ29uZmlnICYmIChvQ29uZmlnW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlNlbGVjdGlvbkZpZWxkc1wiXT8uZmlsdGVyRmllbGRzIGFzIFJlY29yZDxzdHJpbmcsIHsgc2V0dGluZ3M6IHN0cmluZyB9Pik7XG5cdHJldHVybiBmaWx0ZXJDb25maWc/LltzUHJvcGVydHldID8gZmlsdGVyQ29uZmlnW3NQcm9wZXJ0eV0/LnNldHRpbmdzIDogdW5kZWZpbmVkO1xufVxuZnVuY3Rpb24gYWRkU2VsZWN0aW9uVmFyaWFudFRvQ29uZGl0aW9ucyhcblx0b1NlbGVjdGlvblZhcmlhbnQ6IFNlbGVjdGlvblZhcmlhbnQsXG5cdG9Db25kaXRpb25zOiBSZWNvcmQ8c3RyaW5nLCBDb25kaXRpb25PYmplY3RbXT4sXG5cdG9NZXRhTW9kZWxDb250ZXh0OiBPRGF0YU1ldGFNb2RlbCxcblx0c0NvbnRleHRQYXRoOiBzdHJpbmcsXG5cdGJJc0ZMUFZhbHVlcz86IGJvb2xlYW4sXG5cdGJVc2VTZW1hbnRpY0RhdGVSYW5nZT86IGJvb2xlYW4sXG5cdG9WaWV3RGF0YT86IG9iamVjdFxuKSB7XG5cdGNvbnN0IGFTZWxlY3RPcHRpb25zUHJvcGVydHlOYW1lcyA9IG9TZWxlY3Rpb25WYXJpYW50LmdldFNlbGVjdE9wdGlvbnNQcm9wZXJ0eU5hbWVzKCksXG5cdFx0b1ZhbGlkUHJvcGVydGllcyA9IENvbW1vblV0aWxzLmdldENvbnRleHRQYXRoUHJvcGVydGllcyhvTWV0YU1vZGVsQ29udGV4dCwgc0NvbnRleHRQYXRoKSxcblx0XHRhTWV0YWRhdFByb3BlcnRpZXMgPSBPYmplY3Qua2V5cyhvVmFsaWRQcm9wZXJ0aWVzKSxcblx0XHRvUGFyYW1ldGVySW5mbyA9IENvbW1vblV0aWxzLmdldFBhcmFtZXRlckluZm8ob01ldGFNb2RlbENvbnRleHQsIHNDb250ZXh0UGF0aCksXG5cdFx0c1BhcmFtZXRlckNvbnRleHRQYXRoID0gb1BhcmFtZXRlckluZm8uY29udGV4dFBhdGgsXG5cdFx0b1ZhbGlkUGFyYW1ldGVyUHJvcGVydGllcyA9IG9QYXJhbWV0ZXJJbmZvLnBhcmFtZXRlclByb3BlcnRpZXM7XG5cblx0aWYgKHNQYXJhbWV0ZXJDb250ZXh0UGF0aCAhPT0gdW5kZWZpbmVkICYmIG9WYWxpZFBhcmFtZXRlclByb3BlcnRpZXMgJiYgT2JqZWN0LmtleXMob1ZhbGlkUGFyYW1ldGVyUHJvcGVydGllcykubGVuZ3RoID4gMCkge1xuXHRcdGNvbnN0IGFNZXRhZGF0YVBhcmFtZXRlcnMgPSBPYmplY3Qua2V5cyhvVmFsaWRQYXJhbWV0ZXJQcm9wZXJ0aWVzKTtcblx0XHRhTWV0YWRhdGFQYXJhbWV0ZXJzLmZvckVhY2goZnVuY3Rpb24gKHNNZXRhZGF0YVBhcmFtZXRlcjogc3RyaW5nKSB7XG5cdFx0XHRsZXQgc1NlbGVjdE9wdGlvbk5hbWU7XG5cdFx0XHRpZiAoYVNlbGVjdE9wdGlvbnNQcm9wZXJ0eU5hbWVzLmluY2x1ZGVzKGAkUGFyYW1ldGVyLiR7c01ldGFkYXRhUGFyYW1ldGVyfWApKSB7XG5cdFx0XHRcdHNTZWxlY3RPcHRpb25OYW1lID0gYCRQYXJhbWV0ZXIuJHtzTWV0YWRhdGFQYXJhbWV0ZXJ9YDtcblx0XHRcdH0gZWxzZSBpZiAoYVNlbGVjdE9wdGlvbnNQcm9wZXJ0eU5hbWVzLmluY2x1ZGVzKHNNZXRhZGF0YVBhcmFtZXRlcikpIHtcblx0XHRcdFx0c1NlbGVjdE9wdGlvbk5hbWUgPSBzTWV0YWRhdGFQYXJhbWV0ZXI7XG5cdFx0XHR9IGVsc2UgaWYgKFxuXHRcdFx0XHRzTWV0YWRhdGFQYXJhbWV0ZXIuc3RhcnRzV2l0aChcIlBfXCIpICYmXG5cdFx0XHRcdGFTZWxlY3RPcHRpb25zUHJvcGVydHlOYW1lcy5pbmNsdWRlcyhgJFBhcmFtZXRlci4ke3NNZXRhZGF0YVBhcmFtZXRlci5zbGljZSgyLCBzTWV0YWRhdGFQYXJhbWV0ZXIubGVuZ3RoKX1gKVxuXHRcdFx0KSB7XG5cdFx0XHRcdHNTZWxlY3RPcHRpb25OYW1lID0gYCRQYXJhbWV0ZXIuJHtzTWV0YWRhdGFQYXJhbWV0ZXIuc2xpY2UoMiwgc01ldGFkYXRhUGFyYW1ldGVyLmxlbmd0aCl9YDtcblx0XHRcdH0gZWxzZSBpZiAoXG5cdFx0XHRcdHNNZXRhZGF0YVBhcmFtZXRlci5zdGFydHNXaXRoKFwiUF9cIikgJiZcblx0XHRcdFx0YVNlbGVjdE9wdGlvbnNQcm9wZXJ0eU5hbWVzLmluY2x1ZGVzKHNNZXRhZGF0YVBhcmFtZXRlci5zbGljZSgyLCBzTWV0YWRhdGFQYXJhbWV0ZXIubGVuZ3RoKSlcblx0XHRcdCkge1xuXHRcdFx0XHRzU2VsZWN0T3B0aW9uTmFtZSA9IHNNZXRhZGF0YVBhcmFtZXRlci5zbGljZSgyLCBzTWV0YWRhdGFQYXJhbWV0ZXIubGVuZ3RoKTtcblx0XHRcdH0gZWxzZSBpZiAoYVNlbGVjdE9wdGlvbnNQcm9wZXJ0eU5hbWVzLmluY2x1ZGVzKGAkUGFyYW1ldGVyLlBfJHtzTWV0YWRhdGFQYXJhbWV0ZXJ9YCkpIHtcblx0XHRcdFx0c1NlbGVjdE9wdGlvbk5hbWUgPSBgJFBhcmFtZXRlci5QXyR7c01ldGFkYXRhUGFyYW1ldGVyfWA7XG5cdFx0XHR9IGVsc2UgaWYgKGFTZWxlY3RPcHRpb25zUHJvcGVydHlOYW1lcy5pbmNsdWRlcyhgUF8ke3NNZXRhZGF0YVBhcmFtZXRlcn1gKSkge1xuXHRcdFx0XHRzU2VsZWN0T3B0aW9uTmFtZSA9IGBQXyR7c01ldGFkYXRhUGFyYW1ldGVyfWA7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChzU2VsZWN0T3B0aW9uTmFtZSkge1xuXHRcdFx0XHRhZGRTZWxlY3RPcHRpb25zVG9Db25kaXRpb25zKFxuXHRcdFx0XHRcdHNQYXJhbWV0ZXJDb250ZXh0UGF0aCxcblx0XHRcdFx0XHRvU2VsZWN0aW9uVmFyaWFudCxcblx0XHRcdFx0XHRzU2VsZWN0T3B0aW9uTmFtZSxcblx0XHRcdFx0XHRvQ29uZGl0aW9ucyxcblx0XHRcdFx0XHR1bmRlZmluZWQsXG5cdFx0XHRcdFx0c01ldGFkYXRhUGFyYW1ldGVyLFxuXHRcdFx0XHRcdG9WYWxpZFBhcmFtZXRlclByb3BlcnRpZXMsXG5cdFx0XHRcdFx0b01ldGFNb2RlbENvbnRleHQsXG5cdFx0XHRcdFx0dHJ1ZSxcblx0XHRcdFx0XHRiSXNGTFBWYWx1ZXMsXG5cdFx0XHRcdFx0YlVzZVNlbWFudGljRGF0ZVJhbmdlLFxuXHRcdFx0XHRcdG9WaWV3RGF0YVxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cdGFNZXRhZGF0UHJvcGVydGllcy5mb3JFYWNoKGZ1bmN0aW9uIChzTWV0YWRhdGFQcm9wZXJ0eTogc3RyaW5nKSB7XG5cdFx0bGV0IHNTZWxlY3RPcHRpb25OYW1lO1xuXHRcdGlmIChhU2VsZWN0T3B0aW9uc1Byb3BlcnR5TmFtZXMuaW5jbHVkZXMoc01ldGFkYXRhUHJvcGVydHkpKSB7XG5cdFx0XHRzU2VsZWN0T3B0aW9uTmFtZSA9IHNNZXRhZGF0YVByb3BlcnR5O1xuXHRcdH0gZWxzZSBpZiAoXG5cdFx0XHRzTWV0YWRhdGFQcm9wZXJ0eS5zdGFydHNXaXRoKFwiUF9cIikgJiZcblx0XHRcdGFTZWxlY3RPcHRpb25zUHJvcGVydHlOYW1lcy5pbmNsdWRlcyhzTWV0YWRhdGFQcm9wZXJ0eS5zbGljZSgyLCBzTWV0YWRhdGFQcm9wZXJ0eS5sZW5ndGgpKVxuXHRcdCkge1xuXHRcdFx0c1NlbGVjdE9wdGlvbk5hbWUgPSBzTWV0YWRhdGFQcm9wZXJ0eS5zbGljZSgyLCBzTWV0YWRhdGFQcm9wZXJ0eS5sZW5ndGgpO1xuXHRcdH0gZWxzZSBpZiAoYVNlbGVjdE9wdGlvbnNQcm9wZXJ0eU5hbWVzLmluY2x1ZGVzKGBQXyR7c01ldGFkYXRhUHJvcGVydHl9YCkpIHtcblx0XHRcdHNTZWxlY3RPcHRpb25OYW1lID0gYFBfJHtzTWV0YWRhdGFQcm9wZXJ0eX1gO1xuXHRcdH1cblx0XHRpZiAoc1NlbGVjdE9wdGlvbk5hbWUpIHtcblx0XHRcdGFkZFNlbGVjdE9wdGlvbnNUb0NvbmRpdGlvbnMoXG5cdFx0XHRcdHNDb250ZXh0UGF0aCxcblx0XHRcdFx0b1NlbGVjdGlvblZhcmlhbnQsXG5cdFx0XHRcdHNTZWxlY3RPcHRpb25OYW1lLFxuXHRcdFx0XHRvQ29uZGl0aW9ucyxcblx0XHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0XHRzTWV0YWRhdGFQcm9wZXJ0eSxcblx0XHRcdFx0b1ZhbGlkUHJvcGVydGllcyxcblx0XHRcdFx0b01ldGFNb2RlbENvbnRleHQsXG5cdFx0XHRcdGZhbHNlLFxuXHRcdFx0XHRiSXNGTFBWYWx1ZXMsXG5cdFx0XHRcdGJVc2VTZW1hbnRpY0RhdGVSYW5nZSxcblx0XHRcdFx0b1ZpZXdEYXRhXG5cdFx0XHQpO1xuXHRcdH1cblx0fSk7XG5cblx0YVNlbGVjdE9wdGlvbnNQcm9wZXJ0eU5hbWVzLmZvckVhY2goZnVuY3Rpb24gKHNTZWxlY3RPcHRpb246IHN0cmluZykge1xuXHRcdGlmIChzU2VsZWN0T3B0aW9uLmluZGV4T2YoXCIuXCIpID4gMCAmJiAhc1NlbGVjdE9wdGlvbi5pbmNsdWRlcyhcIiRQYXJhbWV0ZXJcIikpIHtcblx0XHRcdGNvbnN0IHNSZXBsYWNlZE9wdGlvbiA9IHNTZWxlY3RPcHRpb24ucmVwbGFjZUFsbChcIi5cIiwgXCIvXCIpO1xuXHRcdFx0Y29uc3Qgc0Z1bGxDb250ZXh0UGF0aCA9IGAvJHtzUmVwbGFjZWRPcHRpb259YC5zdGFydHNXaXRoKHNDb250ZXh0UGF0aClcblx0XHRcdFx0PyBgLyR7c1JlcGxhY2VkT3B0aW9ufWBcblx0XHRcdFx0OiBgJHtzQ29udGV4dFBhdGh9LyR7c1JlcGxhY2VkT3B0aW9ufWA7IC8vIGNoZWNrIGlmIHRoZSBmdWxsIHBhdGgsIGVnIFNhbGVzT3JkZXJNYW5hZ2UuX0l0ZW0uTWF0ZXJpYWwgZXhpc3RzIGluIHRoZSBtZXRhbW9kZWxcblx0XHRcdGlmIChvTWV0YU1vZGVsQ29udGV4dC5nZXRPYmplY3Qoc0Z1bGxDb250ZXh0UGF0aC5yZXBsYWNlKFwiUF9cIiwgXCJcIikpKSB7XG5cdFx0XHRcdF9jcmVhdGVDb25kaXRpb25zRm9yTmF2UHJvcGVydGllcyhcblx0XHRcdFx0XHRzRnVsbENvbnRleHRQYXRoLFxuXHRcdFx0XHRcdHNDb250ZXh0UGF0aCxcblx0XHRcdFx0XHRvU2VsZWN0aW9uVmFyaWFudCxcblx0XHRcdFx0XHRzU2VsZWN0T3B0aW9uLFxuXHRcdFx0XHRcdG9NZXRhTW9kZWxDb250ZXh0LFxuXHRcdFx0XHRcdG9Db25kaXRpb25zLFxuXHRcdFx0XHRcdGJJc0ZMUFZhbHVlcyxcblx0XHRcdFx0XHRiVXNlU2VtYW50aWNEYXRlUmFuZ2UsXG5cdFx0XHRcdFx0b1ZpZXdEYXRhXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcblx0cmV0dXJuIG9Db25kaXRpb25zO1xufVxuXG5mdW5jdGlvbiBfY3JlYXRlQ29uZGl0aW9uc0Zvck5hdlByb3BlcnRpZXMoXG5cdHNGdWxsQ29udGV4dFBhdGg6IHN0cmluZyxcblx0c01haW5FbnRpdHlTZXRQYXRoOiBzdHJpbmcsXG5cdG9TZWxlY3Rpb25WYXJpYW50OiBTZWxlY3Rpb25WYXJpYW50LFxuXHRzU2VsZWN0T3B0aW9uOiBzdHJpbmcsXG5cdG9NZXRhTW9kZWxDb250ZXh0OiBPRGF0YU1ldGFNb2RlbCxcblx0b0NvbmRpdGlvbnM6IFJlY29yZDxzdHJpbmcsIENvbmRpdGlvbk9iamVjdFtdPixcblx0YklzRkxQVmFsdWVQcmVzZW50PzogYm9vbGVhbixcblx0YlNlbWFudGljRGF0ZVJhbmdlPzogYm9vbGVhbixcblx0b1ZpZXdEYXRhPzogb2JqZWN0XG4pIHtcblx0bGV0IGFOYXZPYmplY3ROYW1lcyA9IHNTZWxlY3RPcHRpb24uc3BsaXQoXCIuXCIpO1xuXHQvLyBFZzogXCJTYWxlc09yZGVyTWFuYWdlLl9JdGVtLl9NYXRlcmlhbC5NYXRlcmlhbFwiIG9yIFwiX0l0ZW0uTWF0ZXJpYWxcIlxuXHRpZiAoYC8ke3NTZWxlY3RPcHRpb24ucmVwbGFjZUFsbChcIi5cIiwgXCIvXCIpfWAuc3RhcnRzV2l0aChzTWFpbkVudGl0eVNldFBhdGgpKSB7XG5cdFx0Y29uc3Qgc0Z1bGxQYXRoID0gYC8ke3NTZWxlY3RPcHRpb259YC5yZXBsYWNlQWxsKFwiLlwiLCBcIi9cIiksXG5cdFx0XHRzTmF2UGF0aCA9IHNGdWxsUGF0aC5yZXBsYWNlKGAke3NNYWluRW50aXR5U2V0UGF0aH0vYCwgXCJcIik7XG5cdFx0YU5hdk9iamVjdE5hbWVzID0gc05hdlBhdGguc3BsaXQoXCIvXCIpO1xuXHR9XG5cdGxldCBzQ29uZGl0aW9uUGF0aCA9IFwiXCI7XG5cdGNvbnN0IHNQcm9wZXJ0eU5hbWUgPSBhTmF2T2JqZWN0TmFtZXNbYU5hdk9iamVjdE5hbWVzLmxlbmd0aCAtIDFdOyAvLyBNYXRlcmlhbCBmcm9tIFNhbGVzT3JkZXJNYW5hZ2UuX0l0ZW0uTWF0ZXJpYWxcblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhTmF2T2JqZWN0TmFtZXMubGVuZ3RoIC0gMTsgaSsrKSB7XG5cdFx0aWYgKG9NZXRhTW9kZWxDb250ZXh0LmdldE9iamVjdChgJHtzTWFpbkVudGl0eVNldFBhdGh9LyR7YU5hdk9iamVjdE5hbWVzW2ldLnJlcGxhY2UoXCJQX1wiLCBcIlwiKX1gKS4kaXNDb2xsZWN0aW9uKSB7XG5cdFx0XHRzQ29uZGl0aW9uUGF0aCA9IGAke3NDb25kaXRpb25QYXRoICsgYU5hdk9iamVjdE5hbWVzW2ldfSovYDsgLy8gX0l0ZW0qLyBpbiBjYXNlIG9mIDE6biBjYXJkaW5hbGl0eVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRzQ29uZGl0aW9uUGF0aCA9IGAke3NDb25kaXRpb25QYXRoICsgYU5hdk9iamVjdE5hbWVzW2ldfS9gOyAvLyBfSXRlbS8gaW4gY2FzZSBvZiAxOjEgY2FyZGluYWxpdHlcblx0XHR9XG5cdFx0c01haW5FbnRpdHlTZXRQYXRoID0gYCR7c01haW5FbnRpdHlTZXRQYXRofS8ke2FOYXZPYmplY3ROYW1lc1tpXX1gO1xuXHR9XG5cdGNvbnN0IHNOYXZQcm9wZXJ0eVBhdGggPSBzRnVsbENvbnRleHRQYXRoLnNsaWNlKDAsIHNGdWxsQ29udGV4dFBhdGgubGFzdEluZGV4T2YoXCIvXCIpKSxcblx0XHRvVmFsaWRQcm9wZXJ0aWVzID0gQ29tbW9uVXRpbHMuZ2V0Q29udGV4dFBhdGhQcm9wZXJ0aWVzKG9NZXRhTW9kZWxDb250ZXh0LCBzTmF2UHJvcGVydHlQYXRoKSxcblx0XHRhU2VsZWN0T3B0aW9uc1Byb3BlcnR5TmFtZXMgPSBvU2VsZWN0aW9uVmFyaWFudC5nZXRTZWxlY3RPcHRpb25zUHJvcGVydHlOYW1lcygpO1xuXHRsZXQgc1NlbGVjdE9wdGlvbk5hbWUgPSBzUHJvcGVydHlOYW1lO1xuXHRpZiAob1ZhbGlkUHJvcGVydGllc1tzUHJvcGVydHlOYW1lXSkge1xuXHRcdHNTZWxlY3RPcHRpb25OYW1lID0gc1Byb3BlcnR5TmFtZTtcblx0fSBlbHNlIGlmIChzUHJvcGVydHlOYW1lLnN0YXJ0c1dpdGgoXCJQX1wiKSAmJiBvVmFsaWRQcm9wZXJ0aWVzW3NQcm9wZXJ0eU5hbWUucmVwbGFjZShcIlBfXCIsIFwiXCIpXSkge1xuXHRcdHNTZWxlY3RPcHRpb25OYW1lID0gc1Byb3BlcnR5TmFtZS5yZXBsYWNlKFwiUF9cIiwgXCJcIik7XG5cdH0gZWxzZSBpZiAob1ZhbGlkUHJvcGVydGllc1tgUF8ke3NQcm9wZXJ0eU5hbWV9YF0gJiYgYVNlbGVjdE9wdGlvbnNQcm9wZXJ0eU5hbWVzLmluY2x1ZGVzKGBQXyR7c1Byb3BlcnR5TmFtZX1gKSkge1xuXHRcdHNTZWxlY3RPcHRpb25OYW1lID0gYFBfJHtzUHJvcGVydHlOYW1lfWA7XG5cdH1cblx0aWYgKHNQcm9wZXJ0eU5hbWUuc3RhcnRzV2l0aChcIlBfXCIpICYmIG9Db25kaXRpb25zW3NDb25kaXRpb25QYXRoICsgc1NlbGVjdE9wdGlvbk5hbWVdKSB7XG5cdFx0Ly8gaWYgdGhlcmUgaXMgbm8gU2FsZXNPcmRlck1hbmFnZS5fSXRlbS5NYXRlcmlhbCB5ZXQgaW4gdGhlIG9Db25kaXRpb25zXG5cdH0gZWxzZSBpZiAoIXNQcm9wZXJ0eU5hbWUuc3RhcnRzV2l0aChcIlBfXCIpICYmIG9Db25kaXRpb25zW3NDb25kaXRpb25QYXRoICsgc1NlbGVjdE9wdGlvbk5hbWVdKSB7XG5cdFx0ZGVsZXRlIG9Db25kaXRpb25zW3NDb25kaXRpb25QYXRoICsgc1NlbGVjdE9wdGlvbk5hbWVdO1xuXHRcdGFkZFNlbGVjdE9wdGlvbnNUb0NvbmRpdGlvbnMoXG5cdFx0XHRzTmF2UHJvcGVydHlQYXRoLFxuXHRcdFx0b1NlbGVjdGlvblZhcmlhbnQsXG5cdFx0XHRzU2VsZWN0T3B0aW9uLFxuXHRcdFx0b0NvbmRpdGlvbnMsXG5cdFx0XHRzQ29uZGl0aW9uUGF0aCxcblx0XHRcdHNTZWxlY3RPcHRpb25OYW1lLFxuXHRcdFx0b1ZhbGlkUHJvcGVydGllcyxcblx0XHRcdG9NZXRhTW9kZWxDb250ZXh0LFxuXHRcdFx0ZmFsc2UsXG5cdFx0XHRiSXNGTFBWYWx1ZVByZXNlbnQsXG5cdFx0XHRiU2VtYW50aWNEYXRlUmFuZ2UsXG5cdFx0XHRvVmlld0RhdGFcblx0XHQpO1xuXHR9IGVsc2Uge1xuXHRcdGFkZFNlbGVjdE9wdGlvbnNUb0NvbmRpdGlvbnMoXG5cdFx0XHRzTmF2UHJvcGVydHlQYXRoLFxuXHRcdFx0b1NlbGVjdGlvblZhcmlhbnQsXG5cdFx0XHRzU2VsZWN0T3B0aW9uLFxuXHRcdFx0b0NvbmRpdGlvbnMsXG5cdFx0XHRzQ29uZGl0aW9uUGF0aCxcblx0XHRcdHNTZWxlY3RPcHRpb25OYW1lLFxuXHRcdFx0b1ZhbGlkUHJvcGVydGllcyxcblx0XHRcdG9NZXRhTW9kZWxDb250ZXh0LFxuXHRcdFx0ZmFsc2UsXG5cdFx0XHRiSXNGTFBWYWx1ZVByZXNlbnQsXG5cdFx0XHRiU2VtYW50aWNEYXRlUmFuZ2UsXG5cdFx0XHRvVmlld0RhdGFcblx0XHQpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGFkZFBhZ2VDb250ZXh0VG9TZWxlY3Rpb25WYXJpYW50KG9TZWxlY3Rpb25WYXJpYW50OiBTZWxlY3Rpb25WYXJpYW50LCBtUGFnZUNvbnRleHQ6IHVua25vd25bXSwgb1ZpZXc6IFZpZXcpIHtcblx0Y29uc3Qgb0FwcENvbXBvbmVudCA9IENvbW1vblV0aWxzLmdldEFwcENvbXBvbmVudChvVmlldyk7XG5cdGNvbnN0IG9OYXZpZ2F0aW9uU2VydmljZSA9IG9BcHBDb21wb25lbnQuZ2V0TmF2aWdhdGlvblNlcnZpY2UoKTtcblx0cmV0dXJuIG9OYXZpZ2F0aW9uU2VydmljZS5taXhBdHRyaWJ1dGVzQW5kU2VsZWN0aW9uVmFyaWFudChtUGFnZUNvbnRleHQsIG9TZWxlY3Rpb25WYXJpYW50LnRvSlNPTlN0cmluZygpKTtcbn1cblxuZnVuY3Rpb24gYWRkRXh0ZXJuYWxTdGF0ZUZpbHRlcnNUb1NlbGVjdGlvblZhcmlhbnQoXG5cdG9TZWxlY3Rpb25WYXJpYW50OiBTZWxlY3Rpb25WYXJpYW50LFxuXHRtRmlsdGVyczoge1xuXHRcdGZpbHRlckNvbmRpdGlvbnM6IFJlY29yZDxzdHJpbmcsIFJlY29yZDxzdHJpbmcsIENvbmRpdGlvbk9iamVjdD4+O1xuXHRcdGZpbHRlckNvbmRpdGlvbnNXaXRob3V0Q29uZmxpY3Q6IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG5cdH0sXG5cdG9UYXJnZXRJbmZvOiB7XG5cdFx0cHJvcGVydGllc1dpdGhvdXRDb25mbGljdD86IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG5cdH0sXG5cdG9GaWx0ZXJCYXI/OiBGaWx0ZXJCYXJcbikge1xuXHRsZXQgc0ZpbHRlcjogc3RyaW5nO1xuXHRjb25zdCBmbkdldFNpZ25BbmRPcHRpb24gPSBmdW5jdGlvbiAoc09wZXJhdG9yOiBzdHJpbmcsIHNMb3dWYWx1ZTogc3RyaW5nLCBzSGlnaFZhbHVlOiBzdHJpbmcpIHtcblx0XHRjb25zdCBvU2VsZWN0T3B0aW9uU3RhdGUgPSB7XG5cdFx0XHRvcHRpb246IFwiXCIsXG5cdFx0XHRzaWduOiBcIklcIixcblx0XHRcdGxvdzogc0xvd1ZhbHVlLFxuXHRcdFx0aGlnaDogc0hpZ2hWYWx1ZVxuXHRcdH07XG5cdFx0c3dpdGNoIChzT3BlcmF0b3IpIHtcblx0XHRcdGNhc2UgXCJDb250YWluc1wiOlxuXHRcdFx0XHRvU2VsZWN0T3B0aW9uU3RhdGUub3B0aW9uID0gXCJDUFwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJTdGFydHNXaXRoXCI6XG5cdFx0XHRcdG9TZWxlY3RPcHRpb25TdGF0ZS5vcHRpb24gPSBcIkNQXCI7XG5cdFx0XHRcdG9TZWxlY3RPcHRpb25TdGF0ZS5sb3cgKz0gXCIqXCI7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkVuZHNXaXRoXCI6XG5cdFx0XHRcdG9TZWxlY3RPcHRpb25TdGF0ZS5vcHRpb24gPSBcIkNQXCI7XG5cdFx0XHRcdG9TZWxlY3RPcHRpb25TdGF0ZS5sb3cgPSBgKiR7b1NlbGVjdE9wdGlvblN0YXRlLmxvd31gO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJCVFwiOlxuXHRcdFx0Y2FzZSBcIkxFXCI6XG5cdFx0XHRjYXNlIFwiTFRcIjpcblx0XHRcdGNhc2UgXCJHVFwiOlxuXHRcdFx0Y2FzZSBcIk5FXCI6XG5cdFx0XHRjYXNlIFwiRVFcIjpcblx0XHRcdFx0b1NlbGVjdE9wdGlvblN0YXRlLm9wdGlvbiA9IHNPcGVyYXRvcjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiREFURVwiOlxuXHRcdFx0XHRvU2VsZWN0T3B0aW9uU3RhdGUub3B0aW9uID0gXCJFUVwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJEQVRFUkFOR0VcIjpcblx0XHRcdFx0b1NlbGVjdE9wdGlvblN0YXRlLm9wdGlvbiA9IFwiQlRcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiRlJPTVwiOlxuXHRcdFx0XHRvU2VsZWN0T3B0aW9uU3RhdGUub3B0aW9uID0gXCJHRVwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJUT1wiOlxuXHRcdFx0XHRvU2VsZWN0T3B0aW9uU3RhdGUub3B0aW9uID0gXCJMRVwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJFRVFcIjpcblx0XHRcdFx0b1NlbGVjdE9wdGlvblN0YXRlLm9wdGlvbiA9IFwiRVFcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiRW1wdHlcIjpcblx0XHRcdFx0b1NlbGVjdE9wdGlvblN0YXRlLm9wdGlvbiA9IFwiRVFcIjtcblx0XHRcdFx0b1NlbGVjdE9wdGlvblN0YXRlLmxvdyA9IFwiXCI7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIk5vdENvbnRhaW5zXCI6XG5cdFx0XHRcdG9TZWxlY3RPcHRpb25TdGF0ZS5vcHRpb24gPSBcIkNQXCI7XG5cdFx0XHRcdG9TZWxlY3RPcHRpb25TdGF0ZS5zaWduID0gXCJFXCI7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIk5PVEJUXCI6XG5cdFx0XHRcdG9TZWxlY3RPcHRpb25TdGF0ZS5vcHRpb24gPSBcIkJUXCI7XG5cdFx0XHRcdG9TZWxlY3RPcHRpb25TdGF0ZS5zaWduID0gXCJFXCI7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIk5vdFN0YXJ0c1dpdGhcIjpcblx0XHRcdFx0b1NlbGVjdE9wdGlvblN0YXRlLm9wdGlvbiA9IFwiQ1BcIjtcblx0XHRcdFx0b1NlbGVjdE9wdGlvblN0YXRlLmxvdyArPSBcIipcIjtcblx0XHRcdFx0b1NlbGVjdE9wdGlvblN0YXRlLnNpZ24gPSBcIkVcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiTm90RW5kc1dpdGhcIjpcblx0XHRcdFx0b1NlbGVjdE9wdGlvblN0YXRlLm9wdGlvbiA9IFwiQ1BcIjtcblx0XHRcdFx0b1NlbGVjdE9wdGlvblN0YXRlLmxvdyA9IGAqJHtvU2VsZWN0T3B0aW9uU3RhdGUubG93fWA7XG5cdFx0XHRcdG9TZWxlY3RPcHRpb25TdGF0ZS5zaWduID0gXCJFXCI7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIk5vdEVtcHR5XCI6XG5cdFx0XHRcdG9TZWxlY3RPcHRpb25TdGF0ZS5vcHRpb24gPSBcIk5FXCI7XG5cdFx0XHRcdG9TZWxlY3RPcHRpb25TdGF0ZS5sb3cgPSBcIlwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJOT1RMRVwiOlxuXHRcdFx0XHRvU2VsZWN0T3B0aW9uU3RhdGUub3B0aW9uID0gXCJMRVwiO1xuXHRcdFx0XHRvU2VsZWN0T3B0aW9uU3RhdGUuc2lnbiA9IFwiRVwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJOT1RHRVwiOlxuXHRcdFx0XHRvU2VsZWN0T3B0aW9uU3RhdGUub3B0aW9uID0gXCJHRVwiO1xuXHRcdFx0XHRvU2VsZWN0T3B0aW9uU3RhdGUuc2lnbiA9IFwiRVwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJOT1RMVFwiOlxuXHRcdFx0XHRvU2VsZWN0T3B0aW9uU3RhdGUub3B0aW9uID0gXCJMVFwiO1xuXHRcdFx0XHRvU2VsZWN0T3B0aW9uU3RhdGUuc2lnbiA9IFwiRVwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJOT1RHVFwiOlxuXHRcdFx0XHRvU2VsZWN0T3B0aW9uU3RhdGUub3B0aW9uID0gXCJHVFwiO1xuXHRcdFx0XHRvU2VsZWN0T3B0aW9uU3RhdGUuc2lnbiA9IFwiRVwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdExvZy53YXJuaW5nKGAke3NPcGVyYXRvcn0gaXMgbm90IHN1cHBvcnRlZC4gJHtzRmlsdGVyfSBjb3VsZCBub3QgYmUgYWRkZWQgdG8gdGhlIG5hdmlnYXRpb24gY29udGV4dGApO1xuXHRcdH1cblx0XHRyZXR1cm4gb1NlbGVjdE9wdGlvblN0YXRlO1xuXHR9O1xuXHRjb25zdCBvRmlsdGVyQ29uZGl0aW9ucyA9IG1GaWx0ZXJzLmZpbHRlckNvbmRpdGlvbnM7XG5cdGNvbnN0IG9GaWx0ZXJzV2l0aG91dENvbmZsaWN0ID0gbUZpbHRlcnMuZmlsdGVyQ29uZGl0aW9uc1dpdGhvdXRDb25mbGljdCA/IG1GaWx0ZXJzLmZpbHRlckNvbmRpdGlvbnNXaXRob3V0Q29uZmxpY3QgOiB7fTtcblx0Y29uc3Qgb1RhYmxlUHJvcGVydGllc1dpdGhvdXRDb25mbGljdCA9IG9UYXJnZXRJbmZvLnByb3BlcnRpZXNXaXRob3V0Q29uZmxpY3QgPyBvVGFyZ2V0SW5mby5wcm9wZXJ0aWVzV2l0aG91dENvbmZsaWN0IDoge307XG5cdGNvbnN0IGFkZEZpbHRlcnNUb1NlbGVjdGlvblZhcmlhbnQgPSBmdW5jdGlvbiAoc2VsZWN0aW9uVmFyaWFudDogU2VsZWN0aW9uVmFyaWFudCwgc0ZpbHRlck5hbWU6IHN0cmluZywgc1BhdGg/OiBzdHJpbmcpIHtcblx0XHRjb25zdCBhQ29uZGl0aW9ucyA9IG9GaWx0ZXJDb25kaXRpb25zW3NGaWx0ZXJOYW1lXTtcblx0XHRjb25zdCBvUHJvcGVydHlJbmZvID0gb0ZpbHRlckJhciAmJiBvRmlsdGVyQmFyLmdldFByb3BlcnR5SGVscGVyKCkuZ2V0UHJvcGVydHkoc0ZpbHRlck5hbWUpO1xuXHRcdGNvbnN0IG9UeXBlQ29uZmlnID0gb1Byb3BlcnR5SW5mbz8udHlwZUNvbmZpZztcblx0XHRjb25zdCBvVHlwZVV0aWwgPSBvRmlsdGVyQmFyICYmIG9GaWx0ZXJCYXIuZ2V0Q29udHJvbERlbGVnYXRlKCkuZ2V0VHlwZVV0aWwoKTtcblxuXHRcdGZvciAoY29uc3QgaXRlbSBpbiBhQ29uZGl0aW9ucykge1xuXHRcdFx0Y29uc3Qgb0NvbmRpdGlvbiA9IGFDb25kaXRpb25zW2l0ZW1dO1xuXG5cdFx0XHRsZXQgb3B0aW9uOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBcIlwiLFxuXHRcdFx0XHRzaWduID0gXCJJXCIsXG5cdFx0XHRcdGxvdyA9IFwiXCIsXG5cdFx0XHRcdGhpZ2ggPSBudWxsLFxuXHRcdFx0XHRzZW1hbnRpY0RhdGVzO1xuXG5cdFx0XHRjb25zdCBvT3BlcmF0b3IgPSBGaWx0ZXJPcGVyYXRvclV0aWwuZ2V0T3BlcmF0b3Iob0NvbmRpdGlvbi5vcGVyYXRvcik7XG5cdFx0XHRpZiAob09wZXJhdG9yIGluc3RhbmNlb2YgUmFuZ2VPcGVyYXRvcikge1xuXHRcdFx0XHRzZW1hbnRpY0RhdGVzID0gQ29tbW9uVXRpbHMuY3JlYXRlU2VtYW50aWNEYXRlc0Zyb21Db25kaXRpb25zKG9Db25kaXRpb24pO1xuXHRcdFx0XHQvLyBoYW5kbGluZyBvZiBEYXRlIFJhbmdlT3BlcmF0b3JzXG5cdFx0XHRcdGNvbnN0IG9Nb2RlbEZpbHRlciA9IG9PcGVyYXRvci5nZXRNb2RlbEZpbHRlcihcblx0XHRcdFx0XHRvQ29uZGl0aW9uLFxuXHRcdFx0XHRcdHNGaWx0ZXJOYW1lLFxuXHRcdFx0XHRcdG9UeXBlQ29uZmlnPy50eXBlSW5zdGFuY2UsXG5cdFx0XHRcdFx0ZmFsc2UsXG5cdFx0XHRcdFx0b1R5cGVDb25maWc/LmJhc2VUeXBlXG5cdFx0XHRcdCk7XG5cdFx0XHRcdGlmICghb01vZGVsRmlsdGVyPy5nZXRGaWx0ZXJzKCkgJiYgIW9Nb2RlbEZpbHRlcj8uZ2V0RmlsdGVycygpPy5sZW5ndGgpIHtcblx0XHRcdFx0XHRzaWduID0gb09wZXJhdG9yLmV4Y2x1ZGUgPyBcIkVcIiA6IFwiSVwiO1xuXHRcdFx0XHRcdGxvdyA9IG9UeXBlVXRpbC5leHRlcm5hbGl6ZVZhbHVlKG9Nb2RlbEZpbHRlci5nZXRWYWx1ZTEoKSwgb1R5cGVDb25maWcudHlwZUluc3RhbmNlKTtcblx0XHRcdFx0XHRoaWdoID0gb1R5cGVVdGlsLmV4dGVybmFsaXplVmFsdWUob01vZGVsRmlsdGVyLmdldFZhbHVlMigpLCBvVHlwZUNvbmZpZy50eXBlSW5zdGFuY2UpO1xuXHRcdFx0XHRcdG9wdGlvbiA9IG9Nb2RlbEZpbHRlci5nZXRPcGVyYXRvcigpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCBhU2VtYW50aWNEYXRlT3BzRXh0ID0gU2VtYW50aWNEYXRlT3BlcmF0b3JzLmdldFN1cHBvcnRlZE9wZXJhdGlvbnMoKTtcblx0XHRcdFx0aWYgKGFTZW1hbnRpY0RhdGVPcHNFeHQuaW5jbHVkZXMob0NvbmRpdGlvbj8ub3BlcmF0b3IpKSB7XG5cdFx0XHRcdFx0c2VtYW50aWNEYXRlcyA9IENvbW1vblV0aWxzLmNyZWF0ZVNlbWFudGljRGF0ZXNGcm9tQ29uZGl0aW9ucyhvQ29uZGl0aW9uKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRjb25zdCB2YWx1ZTEgPSAob0NvbmRpdGlvbi52YWx1ZXNbMF0gJiYgb0NvbmRpdGlvbi52YWx1ZXNbMF0udG9TdHJpbmcoKSkgfHwgXCJcIjtcblx0XHRcdFx0Y29uc3QgdmFsdWUyID0gKG9Db25kaXRpb24udmFsdWVzWzFdICYmIG9Db25kaXRpb24udmFsdWVzWzFdLnRvU3RyaW5nKCkpIHx8IG51bGw7XG5cdFx0XHRcdGNvbnN0IG9TZWxlY3RPcHRpb24gPSBmbkdldFNpZ25BbmRPcHRpb24ob0NvbmRpdGlvbi5vcGVyYXRvciwgdmFsdWUxLCB2YWx1ZTIpO1xuXHRcdFx0XHRzaWduID0gb09wZXJhdG9yPy5leGNsdWRlID8gXCJFXCIgOiBcIklcIjtcblx0XHRcdFx0bG93ID0gb1NlbGVjdE9wdGlvbj8ubG93O1xuXHRcdFx0XHRoaWdoID0gb1NlbGVjdE9wdGlvbj8uaGlnaDtcblx0XHRcdFx0b3B0aW9uID0gb1NlbGVjdE9wdGlvbj8ub3B0aW9uO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAob3B0aW9uICYmIHNlbWFudGljRGF0ZXMpIHtcblx0XHRcdFx0c2VsZWN0aW9uVmFyaWFudC5hZGRTZWxlY3RPcHRpb24oc1BhdGggPyBzUGF0aCA6IHNGaWx0ZXJOYW1lLCBzaWduLCBvcHRpb24sIGxvdywgaGlnaCwgdW5kZWZpbmVkLCBzZW1hbnRpY0RhdGVzKTtcblx0XHRcdH0gZWxzZSBpZiAob3B0aW9uKSB7XG5cdFx0XHRcdHNlbGVjdGlvblZhcmlhbnQuYWRkU2VsZWN0T3B0aW9uKHNQYXRoID8gc1BhdGggOiBzRmlsdGVyTmFtZSwgc2lnbiwgb3B0aW9uLCBsb3csIGhpZ2gpO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcblxuXHRmb3IgKHNGaWx0ZXIgaW4gb0ZpbHRlckNvbmRpdGlvbnMpIHtcblx0XHQvLyBvbmx5IGFkZCB0aGUgZmlsdGVyIHZhbHVlcyBpZiBpdCBpcyBub3QgYWxyZWFkeSBwcmVzZW50IGluIHRoZSBTViBhbHJlYWR5XG5cdFx0aWYgKCFvU2VsZWN0aW9uVmFyaWFudC5nZXRTZWxlY3RPcHRpb24oc0ZpbHRlcikpIHtcblx0XHRcdC8vIFRPRE8gOiBjdXN0b20gZmlsdGVycyBzaG91bGQgYmUgaWdub3JlZCBtb3JlIGdlbmVyaWNhbGx5XG5cdFx0XHRpZiAoc0ZpbHRlciA9PT0gXCIkZWRpdFN0YXRlXCIpIHtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cdFx0XHRhZGRGaWx0ZXJzVG9TZWxlY3Rpb25WYXJpYW50KG9TZWxlY3Rpb25WYXJpYW50LCBzRmlsdGVyKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKG9UYWJsZVByb3BlcnRpZXNXaXRob3V0Q29uZmxpY3QgJiYgc0ZpbHRlciBpbiBvVGFibGVQcm9wZXJ0aWVzV2l0aG91dENvbmZsaWN0KSB7XG5cdFx0XHRcdGFkZEZpbHRlcnNUb1NlbGVjdGlvblZhcmlhbnQob1NlbGVjdGlvblZhcmlhbnQsIHNGaWx0ZXIsIG9UYWJsZVByb3BlcnRpZXNXaXRob3V0Q29uZmxpY3Rbc0ZpbHRlcl0pO1xuXHRcdFx0fVxuXHRcdFx0Ly8gaWYgcHJvcGVydHkgd2FzIHdpdGhvdXQgY29uZmxpY3QgaW4gcGFnZSBjb250ZXh0IHRoZW4gYWRkIHBhdGggZnJvbSBwYWdlIGNvbnRleHQgdG8gU1Zcblx0XHRcdGlmIChzRmlsdGVyIGluIG9GaWx0ZXJzV2l0aG91dENvbmZsaWN0KSB7XG5cdFx0XHRcdGFkZEZpbHRlcnNUb1NlbGVjdGlvblZhcmlhbnQob1NlbGVjdGlvblZhcmlhbnQsIHNGaWx0ZXIsIG9GaWx0ZXJzV2l0aG91dENvbmZsaWN0W3NGaWx0ZXJdKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0cmV0dXJuIG9TZWxlY3Rpb25WYXJpYW50O1xufVxuXG5mdW5jdGlvbiBpc1N0aWNreUVkaXRNb2RlKG9Db250cm9sOiBDb250cm9sKSB7XG5cdGNvbnN0IGJJc1N0aWNreU1vZGUgPSBNb2RlbEhlbHBlci5pc1N0aWNreVNlc3Npb25TdXBwb3J0ZWQoKG9Db250cm9sLmdldE1vZGVsKCkgYXMgT0RhdGFNb2RlbCkuZ2V0TWV0YU1vZGVsKCkpO1xuXHRjb25zdCBiVUlFZGl0YWJsZSA9IG9Db250cm9sLmdldE1vZGVsKFwidWlcIikuZ2V0UHJvcGVydHkoXCIvaXNFZGl0YWJsZVwiKTtcblx0cmV0dXJuIGJJc1N0aWNreU1vZGUgJiYgYlVJRWRpdGFibGU7XG59XG5cbi8qKlxuICogQHBhcmFtIGFNYW5kYXRvcnlGaWx0ZXJGaWVsZHNcbiAqIEBwYXJhbSBvU2VsZWN0aW9uVmFyaWFudFxuICogQHBhcmFtIG9TZWxlY3Rpb25WYXJpYW50RGVmYXVsdHNcbiAqL1xuZnVuY3Rpb24gYWRkRGVmYXVsdERpc3BsYXlDdXJyZW5jeShcblx0YU1hbmRhdG9yeUZpbHRlckZpZWxkczogRXhwYW5kUGF0aFR5cGU8RWRtLlByb3BlcnR5UGF0aD5bXSxcblx0b1NlbGVjdGlvblZhcmlhbnQ6IFNlbGVjdGlvblZhcmlhbnQsXG5cdG9TZWxlY3Rpb25WYXJpYW50RGVmYXVsdHM6IFNlbGVjdGlvblZhcmlhbnRcbikge1xuXHRpZiAob1NlbGVjdGlvblZhcmlhbnQgJiYgYU1hbmRhdG9yeUZpbHRlckZpZWxkcyAmJiBhTWFuZGF0b3J5RmlsdGVyRmllbGRzLmxlbmd0aCkge1xuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgYU1hbmRhdG9yeUZpbHRlckZpZWxkcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0Y29uc3QgYVNWT3B0aW9uID0gb1NlbGVjdGlvblZhcmlhbnQuZ2V0U2VsZWN0T3B0aW9uKFwiRGlzcGxheUN1cnJlbmN5XCIpLFxuXHRcdFx0XHRhRGVmYXVsdFNWT3B0aW9uID0gb1NlbGVjdGlvblZhcmlhbnREZWZhdWx0cyAmJiBvU2VsZWN0aW9uVmFyaWFudERlZmF1bHRzLmdldFNlbGVjdE9wdGlvbihcIkRpc3BsYXlDdXJyZW5jeVwiKTtcblx0XHRcdGlmIChcblx0XHRcdFx0YU1hbmRhdG9yeUZpbHRlckZpZWxkc1tpXS4kUHJvcGVydHlQYXRoID09PSBcIkRpc3BsYXlDdXJyZW5jeVwiICYmXG5cdFx0XHRcdCghYVNWT3B0aW9uIHx8ICFhU1ZPcHRpb24ubGVuZ3RoKSAmJlxuXHRcdFx0XHRhRGVmYXVsdFNWT3B0aW9uICYmXG5cdFx0XHRcdGFEZWZhdWx0U1ZPcHRpb24ubGVuZ3RoXG5cdFx0XHQpIHtcblx0XHRcdFx0Y29uc3QgZGlzcGxheUN1cnJlbmN5U2VsZWN0T3B0aW9uID0gYURlZmF1bHRTVk9wdGlvblswXTtcblx0XHRcdFx0Y29uc3Qgc1NpZ24gPSBkaXNwbGF5Q3VycmVuY3lTZWxlY3RPcHRpb25bXCJTaWduXCJdO1xuXHRcdFx0XHRjb25zdCBzT3B0aW9uID0gZGlzcGxheUN1cnJlbmN5U2VsZWN0T3B0aW9uW1wiT3B0aW9uXCJdO1xuXHRcdFx0XHRjb25zdCBzTG93ID0gZGlzcGxheUN1cnJlbmN5U2VsZWN0T3B0aW9uW1wiTG93XCJdO1xuXHRcdFx0XHRjb25zdCBzSGlnaCA9IGRpc3BsYXlDdXJyZW5jeVNlbGVjdE9wdGlvbltcIkhpZ2hcIl07XG5cdFx0XHRcdG9TZWxlY3Rpb25WYXJpYW50LmFkZFNlbGVjdE9wdGlvbihcIkRpc3BsYXlDdXJyZW5jeVwiLCBzU2lnbiwgc09wdGlvbiwgc0xvdywgc0hpZ2gpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBnZXROb25Db21wdXRlZFZpc2libGVGaWVsZHMobWV0YU1vZGVsQ29udGV4dDogT0RhdGFNZXRhTW9kZWwsIHNQYXRoOiBzdHJpbmcsIG9WaWV3PzogVmlldykge1xuXHRjb25zdCBhVGVjaG5pY2FsS2V5cyA9IG1ldGFNb2RlbENvbnRleHQuZ2V0T2JqZWN0KGAke3NQYXRofS9gKS4kS2V5O1xuXHRjb25zdCBhTm9uQ29tcHV0ZWRWaXNpYmxlRmllbGRzOiB1bmtub3duW10gPSBbXTtcblx0Y29uc3QgYUltbXV0YWJsZVZpc2libGVGaWVsZHM6IHVua25vd25bXSA9IFtdO1xuXHRjb25zdCBvRW50aXR5VHlwZSA9IG1ldGFNb2RlbENvbnRleHQuZ2V0T2JqZWN0KGAke3NQYXRofS9gKTtcblx0Zm9yIChjb25zdCBpdGVtIGluIG9FbnRpdHlUeXBlKSB7XG5cdFx0aWYgKG9FbnRpdHlUeXBlW2l0ZW1dLiRraW5kICYmIG9FbnRpdHlUeXBlW2l0ZW1dLiRraW5kID09PSBcIlByb3BlcnR5XCIpIHtcblx0XHRcdGNvbnN0IG9Bbm5vdGF0aW9ucyA9IChtZXRhTW9kZWxDb250ZXh0LmdldE9iamVjdChgJHtzUGF0aH0vJHtpdGVtfUBgKSB8fCB7fSkgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4sXG5cdFx0XHRcdGJJc0tleSA9IGFUZWNobmljYWxLZXlzLmluZGV4T2YoaXRlbSkgPiAtMSxcblx0XHRcdFx0YklzSW1tdXRhYmxlID0gb0Fubm90YXRpb25zW1wiQE9yZy5PRGF0YS5Db3JlLlYxLkltbXV0YWJsZVwiXSxcblx0XHRcdFx0YklzTm9uQ29tcHV0ZWQgPSAhb0Fubm90YXRpb25zW1wiQE9yZy5PRGF0YS5Db3JlLlYxLkNvbXB1dGVkXCJdLFxuXHRcdFx0XHRiSXNWaXNpYmxlID0gIW9Bbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IaWRkZW5cIl0sXG5cdFx0XHRcdGJJc0NvbXB1dGVkRGVmYXVsdFZhbHVlID0gb0Fubm90YXRpb25zW1wiQE9yZy5PRGF0YS5Db3JlLlYxLkNvbXB1dGVkRGVmYXVsdFZhbHVlXCJdLFxuXHRcdFx0XHRiSXNLZXlDb21wdXRlZERlZmF1bHRWYWx1ZVdpdGhUZXh0ID1cblx0XHRcdFx0XHRiSXNLZXkgJiYgb0VudGl0eVR5cGVbaXRlbV0uJFR5cGUgPT09IFwiRWRtLkd1aWRcIlxuXHRcdFx0XHRcdFx0PyBiSXNDb21wdXRlZERlZmF1bHRWYWx1ZSAmJiBvQW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHRcIl1cblx0XHRcdFx0XHRcdDogZmFsc2U7XG5cdFx0XHRpZiAoXG5cdFx0XHRcdChiSXNLZXlDb21wdXRlZERlZmF1bHRWYWx1ZVdpdGhUZXh0IHx8IChiSXNLZXkgJiYgb0VudGl0eVR5cGVbaXRlbV0uJFR5cGUgIT09IFwiRWRtLkd1aWRcIikpICYmXG5cdFx0XHRcdGJJc05vbkNvbXB1dGVkICYmXG5cdFx0XHRcdGJJc1Zpc2libGVcblx0XHRcdCkge1xuXHRcdFx0XHRhTm9uQ29tcHV0ZWRWaXNpYmxlRmllbGRzLnB1c2goaXRlbSk7XG5cdFx0XHR9IGVsc2UgaWYgKGJJc0ltbXV0YWJsZSAmJiBiSXNOb25Db21wdXRlZCAmJiBiSXNWaXNpYmxlKSB7XG5cdFx0XHRcdGFJbW11dGFibGVWaXNpYmxlRmllbGRzLnB1c2goaXRlbSk7XG5cdFx0XHR9XG5cblx0XHRcdGlmICghYklzTm9uQ29tcHV0ZWQgJiYgYklzQ29tcHV0ZWREZWZhdWx0VmFsdWUgJiYgb1ZpZXcpIHtcblx0XHRcdFx0Y29uc3Qgb0RpYWdub3N0aWNzID0gZ2V0QXBwQ29tcG9uZW50KG9WaWV3KS5nZXREaWFnbm9zdGljcygpO1xuXHRcdFx0XHRjb25zdCBzTWVzc2FnZSA9IFwiQ29yZS5Db21wdXRlZERlZmF1bHRWYWx1ZSBpcyBpZ25vcmVkIGFzIENvcmUuQ29tcHV0ZWQgaXMgYWxyZWFkeSBzZXQgdG8gdHJ1ZVwiO1xuXHRcdFx0XHRvRGlhZ25vc3RpY3MuYWRkSXNzdWUoXG5cdFx0XHRcdFx0SXNzdWVDYXRlZ29yeS5Bbm5vdGF0aW9uLFxuXHRcdFx0XHRcdElzc3VlU2V2ZXJpdHkuTWVkaXVtLFxuXHRcdFx0XHRcdHNNZXNzYWdlLFxuXHRcdFx0XHRcdElzc3VlQ2F0ZWdvcnlUeXBlLFxuXHRcdFx0XHRcdElzc3VlQ2F0ZWdvcnlUeXBlPy5Bbm5vdGF0aW9ucz8uSWdub3JlZEFubm90YXRpb25cblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0Y29uc3QgYVJlcXVpcmVkUHJvcGVydGllcyA9IENvbW1vblV0aWxzLmdldFJlcXVpcmVkUHJvcGVydGllc0Zyb21JbnNlcnRSZXN0cmljdGlvbnMoc1BhdGgsIG1ldGFNb2RlbENvbnRleHQpO1xuXHRpZiAoYVJlcXVpcmVkUHJvcGVydGllcy5sZW5ndGgpIHtcblx0XHRhUmVxdWlyZWRQcm9wZXJ0aWVzLmZvckVhY2goZnVuY3Rpb24gKHNQcm9wZXJ0eTogc3RyaW5nKSB7XG5cdFx0XHRjb25zdCBvQW5ub3RhdGlvbnMgPSBtZXRhTW9kZWxDb250ZXh0LmdldE9iamVjdChgJHtzUGF0aH0vJHtzUHJvcGVydHl9QGApIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+LFxuXHRcdFx0XHRiSXNWaXNpYmxlID0gIW9Bbm5vdGF0aW9ucyB8fCAhb0Fubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhpZGRlblwiXTtcblx0XHRcdGlmIChiSXNWaXNpYmxlICYmIGFOb25Db21wdXRlZFZpc2libGVGaWVsZHMuaW5kZXhPZihzUHJvcGVydHkpID09PSAtMSAmJiBhSW1tdXRhYmxlVmlzaWJsZUZpZWxkcy5pbmRleE9mKHNQcm9wZXJ0eSkgPT09IC0xKSB7XG5cdFx0XHRcdGFOb25Db21wdXRlZFZpc2libGVGaWVsZHMucHVzaChzUHJvcGVydHkpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cdHJldHVybiBhTm9uQ29tcHV0ZWRWaXNpYmxlRmllbGRzLmNvbmNhdChhSW1tdXRhYmxlVmlzaWJsZUZpZWxkcyk7XG59XG5cbmZ1bmN0aW9uIGdldFJlcXVpcmVkUHJvcGVydGllcyhzUGF0aDogc3RyaW5nLCBtZXRhTW9kZWxDb250ZXh0OiBPRGF0YU1ldGFNb2RlbCwgYkNoZWNrVXBkYXRlUmVzdHJpY3Rpb25zID0gZmFsc2UpIHtcblx0Y29uc3QgYVJlcXVpcmVkUHJvcGVydGllczogc3RyaW5nW10gPSBbXTtcblx0bGV0IGFSZXF1aXJlZFByb3BlcnRpZXNXaXRoUGF0aHM6IHsgJFByb3BlcnR5UGF0aDogc3RyaW5nIH1bXSA9IFtdO1xuXHRjb25zdCBuYXZpZ2F0aW9uVGV4dCA9IFwiJE5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmdcIjtcblx0bGV0IG9FbnRpdHlTZXRBbm5vdGF0aW9ucztcblx0aWYgKHNQYXRoLmVuZHNXaXRoKFwiJFwiKSkge1xuXHRcdC8vIGlmIHNQYXRoIGNvbWVzIHdpdGggYSAkIGluIHRoZSBlbmQsIHJlbW92aW5nIGl0IGFzIGl0IGlzIG9mIG5vIHNpZ25pZmljYW5jZVxuXHRcdHNQYXRoID0gc1BhdGgucmVwbGFjZShcIi8kXCIsIFwiXCIpO1xuXHR9XG5cdGNvbnN0IGVudGl0eVR5cGVQYXRoUGFydHMgPSBzUGF0aC5yZXBsYWNlQWxsKFwiJTJGXCIsIFwiL1wiKS5zcGxpdChcIi9cIikuZmlsdGVyKE1vZGVsSGVscGVyLmZpbHRlck91dE5hdlByb3BCaW5kaW5nKTtcblx0Y29uc3QgZW50aXR5U2V0UGF0aCA9IE1vZGVsSGVscGVyLmdldEVudGl0eVNldFBhdGgoc1BhdGgsIG1ldGFNb2RlbENvbnRleHQpO1xuXHRjb25zdCBlbnRpdHlTZXRQYXRoUGFydHMgPSBlbnRpdHlTZXRQYXRoLnNwbGl0KFwiL1wiKS5maWx0ZXIoTW9kZWxIZWxwZXIuZmlsdGVyT3V0TmF2UHJvcEJpbmRpbmcpO1xuXHRjb25zdCBpc0NvbnRhaW5tZW50ID0gbWV0YU1vZGVsQ29udGV4dC5nZXRPYmplY3QoYC8ke2VudGl0eVR5cGVQYXRoUGFydHMuam9pbihcIi9cIil9LyRDb250YWluc1RhcmdldGApO1xuXHRjb25zdCBjb250YWlubWVudE5hdlBhdGggPSBpc0NvbnRhaW5tZW50ICYmIGVudGl0eVR5cGVQYXRoUGFydHNbZW50aXR5VHlwZVBhdGhQYXJ0cy5sZW5ndGggLSAxXTtcblxuXHQvL1Jlc3RyaWN0aW9ucyBkaXJlY3RseSBhdCBFbnRpdHkgU2V0XG5cdC8vZS5nLiBGUiBpbiBcIk5TLkVudGl0eUNvbnRhaW5lci9TYWxlc09yZGVyTWFuYWdlXCIgQ29udGV4dFBhdGg6IC9TYWxlc09yZGVyTWFuYWdlXG5cdGlmICghaXNDb250YWlubWVudCkge1xuXHRcdG9FbnRpdHlTZXRBbm5vdGF0aW9ucyA9IG1ldGFNb2RlbENvbnRleHQuZ2V0T2JqZWN0KGAke2VudGl0eVNldFBhdGh9QGApO1xuXHR9XG5cdGlmIChlbnRpdHlUeXBlUGF0aFBhcnRzLmxlbmd0aCA+IDEpIHtcblx0XHRjb25zdCBuYXZQYXRoID0gaXNDb250YWlubWVudCA/IGNvbnRhaW5tZW50TmF2UGF0aCA6IGVudGl0eVNldFBhdGhQYXJ0c1tlbnRpdHlTZXRQYXRoUGFydHMubGVuZ3RoIC0gMV07XG5cdFx0Y29uc3QgcGFyZW50RW50aXR5U2V0UGF0aCA9IGlzQ29udGFpbm1lbnQgPyBlbnRpdHlTZXRQYXRoIDogYC8ke2VudGl0eVNldFBhdGhQYXJ0cy5zbGljZSgwLCAtMSkuam9pbihgLyR7bmF2aWdhdGlvblRleHR9L2ApfWA7XG5cdFx0Ly9OYXZpZ2F0aW9uIHJlc3RyaWN0aW9uc1xuXHRcdC8vZS5nLiBQYXJlbnQgXCIvQ3VzdG9tZXJcIiB3aXRoIE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGg9XCJTZXRcIiBDb250ZXh0UGF0aDogQ3VzdG9tZXIvU2V0XG5cdFx0Y29uc3Qgb05hdlJlc3QgPSBDb21tb25VdGlscy5nZXROYXZpZ2F0aW9uUmVzdHJpY3Rpb25zKG1ldGFNb2RlbENvbnRleHQsIHBhcmVudEVudGl0eVNldFBhdGgsIG5hdlBhdGgucmVwbGFjZUFsbChcIiUyRlwiLCBcIi9cIikpO1xuXG5cdFx0aWYgKG9OYXZSZXN0ICE9PSB1bmRlZmluZWQgJiYgQ29tbW9uVXRpbHMuaGFzUmVzdHJpY3RlZFByb3BlcnRpZXNJbkFubm90YXRpb25zKG9OYXZSZXN0LCB0cnVlLCBiQ2hlY2tVcGRhdGVSZXN0cmljdGlvbnMpKSB7XG5cdFx0XHRhUmVxdWlyZWRQcm9wZXJ0aWVzV2l0aFBhdGhzID0gYkNoZWNrVXBkYXRlUmVzdHJpY3Rpb25zXG5cdFx0XHRcdD8gb05hdlJlc3RbXCJVcGRhdGVSZXN0cmljdGlvbnNcIl0hLlJlcXVpcmVkUHJvcGVydGllcyB8fCBbXVxuXHRcdFx0XHQ6IG9OYXZSZXN0W1wiSW5zZXJ0UmVzdHJpY3Rpb25zXCJdIS5SZXF1aXJlZFByb3BlcnRpZXMgfHwgW107XG5cdFx0fVxuXHRcdGlmIChcblx0XHRcdCghYVJlcXVpcmVkUHJvcGVydGllc1dpdGhQYXRocyB8fCAhYVJlcXVpcmVkUHJvcGVydGllc1dpdGhQYXRocy5sZW5ndGgpICYmXG5cdFx0XHRDb21tb25VdGlscy5oYXNSZXN0cmljdGVkUHJvcGVydGllc0luQW5ub3RhdGlvbnMob0VudGl0eVNldEFubm90YXRpb25zLCBmYWxzZSwgYkNoZWNrVXBkYXRlUmVzdHJpY3Rpb25zKVxuXHRcdCkge1xuXHRcdFx0YVJlcXVpcmVkUHJvcGVydGllc1dpdGhQYXRocyA9IENvbW1vblV0aWxzLmdldFJlcXVpcmVkUHJvcGVydGllc0Zyb21Bbm5vdGF0aW9ucyhcblx0XHRcdFx0b0VudGl0eVNldEFubm90YXRpb25zLFxuXHRcdFx0XHRiQ2hlY2tVcGRhdGVSZXN0cmljdGlvbnNcblx0XHRcdCk7XG5cdFx0fVxuXHR9IGVsc2UgaWYgKENvbW1vblV0aWxzLmhhc1Jlc3RyaWN0ZWRQcm9wZXJ0aWVzSW5Bbm5vdGF0aW9ucyhvRW50aXR5U2V0QW5ub3RhdGlvbnMsIGZhbHNlLCBiQ2hlY2tVcGRhdGVSZXN0cmljdGlvbnMpKSB7XG5cdFx0YVJlcXVpcmVkUHJvcGVydGllc1dpdGhQYXRocyA9IENvbW1vblV0aWxzLmdldFJlcXVpcmVkUHJvcGVydGllc0Zyb21Bbm5vdGF0aW9ucyhvRW50aXR5U2V0QW5ub3RhdGlvbnMsIGJDaGVja1VwZGF0ZVJlc3RyaWN0aW9ucyk7XG5cdH1cblx0YVJlcXVpcmVkUHJvcGVydGllc1dpdGhQYXRocy5mb3JFYWNoKGZ1bmN0aW9uIChvUmVxdWlyZWRQcm9wZXJ0eSkge1xuXHRcdGNvbnN0IHNQcm9wZXJ0eSA9IG9SZXF1aXJlZFByb3BlcnR5LiRQcm9wZXJ0eVBhdGg7XG5cdFx0YVJlcXVpcmVkUHJvcGVydGllcy5wdXNoKHNQcm9wZXJ0eSk7XG5cdH0pO1xuXHRyZXR1cm4gYVJlcXVpcmVkUHJvcGVydGllcztcbn1cblxuZnVuY3Rpb24gZ2V0UmVxdWlyZWRQcm9wZXJ0aWVzRnJvbUluc2VydFJlc3RyaWN0aW9ucyhzUGF0aDogc3RyaW5nLCBvTWV0YU1vZGVsQ29udGV4dDogT0RhdGFNZXRhTW9kZWwpIHtcblx0cmV0dXJuIENvbW1vblV0aWxzLmdldFJlcXVpcmVkUHJvcGVydGllcyhzUGF0aCwgb01ldGFNb2RlbENvbnRleHQpO1xufVxuXG5mdW5jdGlvbiBnZXRSZXF1aXJlZFByb3BlcnRpZXNGcm9tVXBkYXRlUmVzdHJpY3Rpb25zKHNQYXRoOiBzdHJpbmcsIG9NZXRhTW9kZWxDb250ZXh0OiBPRGF0YU1ldGFNb2RlbCkge1xuXHRyZXR1cm4gQ29tbW9uVXRpbHMuZ2V0UmVxdWlyZWRQcm9wZXJ0aWVzKHNQYXRoLCBvTWV0YU1vZGVsQ29udGV4dCwgdHJ1ZSk7XG59XG5cbmZ1bmN0aW9uIGdldFJlcXVpcmVkUHJvcGVydGllc0Zyb21Bbm5vdGF0aW9ucyhvQW5ub3RhdGlvbnM6IE1ldGFNb2RlbEVudGl0eVNldEFubm90YXRpb24sIGJDaGVja1VwZGF0ZVJlc3RyaWN0aW9ucyA9IGZhbHNlKSB7XG5cdGlmIChiQ2hlY2tVcGRhdGVSZXN0cmljdGlvbnMpIHtcblx0XHRyZXR1cm4gb0Fubm90YXRpb25zW1wiQE9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuVXBkYXRlUmVzdHJpY3Rpb25zXCJdPy5SZXF1aXJlZFByb3BlcnRpZXMgfHwgW107XG5cdH1cblx0cmV0dXJuIG9Bbm5vdGF0aW9uc1tcIkBPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkluc2VydFJlc3RyaWN0aW9uc1wiXT8uUmVxdWlyZWRQcm9wZXJ0aWVzIHx8IFtdO1xufVxuXG5mdW5jdGlvbiBoYXNSZXN0cmljdGVkUHJvcGVydGllc0luQW5ub3RhdGlvbnMoXG5cdG9Bbm5vdGF0aW9uczogTWV0YU1vZGVsVHlwZTxOYXZpZ2F0aW9uUHJvcGVydHlSZXN0cmljdGlvblR5cGVzPiB8IE1ldGFNb2RlbEVudGl0eVNldEFubm90YXRpb24gfCB1bmRlZmluZWQsXG5cdGJJc05hdmlnYXRpb25SZXN0cmljdGlvbnMgPSBmYWxzZSxcblx0YkNoZWNrVXBkYXRlUmVzdHJpY3Rpb25zID0gZmFsc2Vcbikge1xuXHRpZiAoYklzTmF2aWdhdGlvblJlc3RyaWN0aW9ucykge1xuXHRcdGNvbnN0IG9OYXZBbm5vdGF0aW9ucyA9IG9Bbm5vdGF0aW9ucyBhcyBNZXRhTW9kZWxUeXBlPE5hdmlnYXRpb25Qcm9wZXJ0eVJlc3RyaWN0aW9uVHlwZXM+O1xuXHRcdGlmIChiQ2hlY2tVcGRhdGVSZXN0cmljdGlvbnMpIHtcblx0XHRcdHJldHVybiBvTmF2QW5ub3RhdGlvbnMgJiYgb05hdkFubm90YXRpb25zW1wiVXBkYXRlUmVzdHJpY3Rpb25zXCJdICYmIG9OYXZBbm5vdGF0aW9uc1tcIlVwZGF0ZVJlc3RyaWN0aW9uc1wiXS5SZXF1aXJlZFByb3BlcnRpZXNcblx0XHRcdFx0PyB0cnVlXG5cdFx0XHRcdDogZmFsc2U7XG5cdFx0fVxuXHRcdHJldHVybiBvTmF2QW5ub3RhdGlvbnMgJiYgb05hdkFubm90YXRpb25zW1wiSW5zZXJ0UmVzdHJpY3Rpb25zXCJdICYmIG9OYXZBbm5vdGF0aW9uc1tcIkluc2VydFJlc3RyaWN0aW9uc1wiXS5SZXF1aXJlZFByb3BlcnRpZXNcblx0XHRcdD8gdHJ1ZVxuXHRcdFx0OiBmYWxzZTtcblx0fSBlbHNlIGlmIChiQ2hlY2tVcGRhdGVSZXN0cmljdGlvbnMpIHtcblx0XHRjb25zdCBvRW50aXR5QW5ub3RhdGlvbiA9IG9Bbm5vdGF0aW9ucyBhcyBNZXRhTW9kZWxFbnRpdHlTZXRBbm5vdGF0aW9uO1xuXHRcdHJldHVybiBvRW50aXR5QW5ub3RhdGlvbiAmJlxuXHRcdFx0b0VudGl0eUFubm90YXRpb25bXCJAT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5VcGRhdGVSZXN0cmljdGlvbnNcIl0gJiZcblx0XHRcdG9FbnRpdHlBbm5vdGF0aW9uW1wiQE9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuVXBkYXRlUmVzdHJpY3Rpb25zXCJdLlJlcXVpcmVkUHJvcGVydGllc1xuXHRcdFx0PyB0cnVlXG5cdFx0XHQ6IGZhbHNlO1xuXHR9XG5cdGNvbnN0IG9FbnRpdHlBbm5vdGF0aW9uID0gb0Fubm90YXRpb25zIGFzIE1ldGFNb2RlbEVudGl0eVNldEFubm90YXRpb247XG5cdHJldHVybiBvRW50aXR5QW5ub3RhdGlvbiAmJlxuXHRcdG9FbnRpdHlBbm5vdGF0aW9uW1wiQE9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuSW5zZXJ0UmVzdHJpY3Rpb25zXCJdICYmXG5cdFx0b0VudGl0eUFubm90YXRpb25bXCJAT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5JbnNlcnRSZXN0cmljdGlvbnNcIl0uUmVxdWlyZWRQcm9wZXJ0aWVzXG5cdFx0PyB0cnVlXG5cdFx0OiBmYWxzZTtcbn1cblxudHlwZSBVc2VyRGVmYXVsdFBhcmFtZXRlciA9IHtcblx0JE5hbWU6IHN0cmluZztcblx0Z2V0UGF0aD8oKTogc3RyaW5nO1xufTtcbmFzeW5jIGZ1bmN0aW9uIHNldFVzZXJEZWZhdWx0cyhcblx0b0FwcENvbXBvbmVudDogQXBwQ29tcG9uZW50LFxuXHRhUGFyYW1ldGVyczogVXNlckRlZmF1bHRQYXJhbWV0ZXJbXSxcblx0b01vZGVsOiBKU09OTW9kZWwgfCBPRGF0YVY0Q29udGV4dCxcblx0YklzQWN0aW9uOiBib29sZWFuLFxuXHRiSXNDcmVhdGU/OiBib29sZWFuLFxuXHRvQWN0aW9uRGVmYXVsdFZhbHVlcz86IFJlY29yZDxzdHJpbmcsIHN0cmluZz5cbikge1xuXHRyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmU6IEZ1bmN0aW9uKSB7XG5cdFx0Y29uc3Qgb0NvbXBvbmVudERhdGEgPSBvQXBwQ29tcG9uZW50LmdldENvbXBvbmVudERhdGEoKSxcblx0XHRcdG9TdGFydHVwUGFyYW1ldGVycyA9IChvQ29tcG9uZW50RGF0YSAmJiBvQ29tcG9uZW50RGF0YS5zdGFydHVwUGFyYW1ldGVycykgfHwge30sXG5cdFx0XHRvU2hlbGxTZXJ2aWNlcyA9IG9BcHBDb21wb25lbnQuZ2V0U2hlbGxTZXJ2aWNlcygpO1xuXHRcdGlmICghb1NoZWxsU2VydmljZXMuaGFzVVNoZWxsKCkpIHtcblx0XHRcdGFQYXJhbWV0ZXJzLmZvckVhY2goZnVuY3Rpb24gKG9QYXJhbWV0ZXIpIHtcblx0XHRcdFx0Y29uc3Qgc1Byb3BlcnR5TmFtZSA9IGJJc0FjdGlvblxuXHRcdFx0XHRcdD8gYC8ke29QYXJhbWV0ZXIuJE5hbWV9YFxuXHRcdFx0XHRcdDogKG9QYXJhbWV0ZXIuZ2V0UGF0aD8uKCkuc2xpY2Uob1BhcmFtZXRlci5nZXRQYXRoKCkubGFzdEluZGV4T2YoXCIvXCIpICsgMSkgYXMgc3RyaW5nKTtcblx0XHRcdFx0Y29uc3Qgc1BhcmFtZXRlck5hbWUgPSBiSXNBY3Rpb24gPyBzUHJvcGVydHlOYW1lLnNsaWNlKDEpIDogc1Byb3BlcnR5TmFtZTtcblx0XHRcdFx0aWYgKG9BY3Rpb25EZWZhdWx0VmFsdWVzICYmIGJJc0NyZWF0ZSkge1xuXHRcdFx0XHRcdGlmIChvQWN0aW9uRGVmYXVsdFZhbHVlc1tzUGFyYW1ldGVyTmFtZV0pIHtcblx0XHRcdFx0XHRcdG9Nb2RlbC5zZXRQcm9wZXJ0eShzUHJvcGVydHlOYW1lLCBvQWN0aW9uRGVmYXVsdFZhbHVlc1tzUGFyYW1ldGVyTmFtZV0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIGlmIChvU3RhcnR1cFBhcmFtZXRlcnNbc1BhcmFtZXRlck5hbWVdKSB7XG5cdFx0XHRcdFx0b01vZGVsLnNldFByb3BlcnR5KHNQcm9wZXJ0eU5hbWUsIG9TdGFydHVwUGFyYW1ldGVyc1tzUGFyYW1ldGVyTmFtZV1bMF0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiByZXNvbHZlKHRydWUpO1xuXHRcdH1cblx0XHRyZXR1cm4gb1NoZWxsU2VydmljZXMuZ2V0U3RhcnR1cEFwcFN0YXRlKG9BcHBDb21wb25lbnQpLnRoZW4oZnVuY3Rpb24gKG9TdGFydHVwQXBwU3RhdGUpIHtcblx0XHRcdGNvbnN0IG9EYXRhID0gb1N0YXJ0dXBBcHBTdGF0ZT8uZ2V0RGF0YSgpIHx8IHt9LFxuXHRcdFx0XHRhRXh0ZW5kZWRQYXJhbWV0ZXJzID0gKG9EYXRhLnNlbGVjdGlvblZhcmlhbnQgJiYgb0RhdGEuc2VsZWN0aW9uVmFyaWFudC5TZWxlY3RPcHRpb25zKSB8fCBbXTtcblx0XHRcdGFQYXJhbWV0ZXJzLmZvckVhY2goZnVuY3Rpb24gKG9QYXJhbWV0ZXIpIHtcblx0XHRcdFx0Y29uc3Qgc1Byb3BlcnR5TmFtZSA9IGJJc0FjdGlvblxuXHRcdFx0XHRcdD8gYC8ke29QYXJhbWV0ZXIuJE5hbWV9YFxuXHRcdFx0XHRcdDogKG9QYXJhbWV0ZXIuZ2V0UGF0aD8uKCkuc2xpY2Uob1BhcmFtZXRlci5nZXRQYXRoKCkubGFzdEluZGV4T2YoXCIvXCIpICsgMSkgYXMgc3RyaW5nKTtcblx0XHRcdFx0Y29uc3Qgc1BhcmFtZXRlck5hbWUgPSBiSXNBY3Rpb24gPyBzUHJvcGVydHlOYW1lLnNsaWNlKDEpIDogc1Byb3BlcnR5TmFtZTtcblx0XHRcdFx0aWYgKG9BY3Rpb25EZWZhdWx0VmFsdWVzICYmIGJJc0NyZWF0ZSkge1xuXHRcdFx0XHRcdGlmIChvQWN0aW9uRGVmYXVsdFZhbHVlc1tzUGFyYW1ldGVyTmFtZV0pIHtcblx0XHRcdFx0XHRcdG9Nb2RlbC5zZXRQcm9wZXJ0eShzUHJvcGVydHlOYW1lLCBvQWN0aW9uRGVmYXVsdFZhbHVlc1tzUGFyYW1ldGVyTmFtZV0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIGlmIChvU3RhcnR1cFBhcmFtZXRlcnNbc1BhcmFtZXRlck5hbWVdKSB7XG5cdFx0XHRcdFx0b01vZGVsLnNldFByb3BlcnR5KHNQcm9wZXJ0eU5hbWUsIG9TdGFydHVwUGFyYW1ldGVyc1tzUGFyYW1ldGVyTmFtZV1bMF0pO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGFFeHRlbmRlZFBhcmFtZXRlcnMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdGZvciAoY29uc3QgaSBpbiBhRXh0ZW5kZWRQYXJhbWV0ZXJzKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBvRXh0ZW5kZWRQYXJhbWV0ZXIgPSBhRXh0ZW5kZWRQYXJhbWV0ZXJzW2ldO1xuXHRcdFx0XHRcdFx0aWYgKG9FeHRlbmRlZFBhcmFtZXRlci5Qcm9wZXJ0eU5hbWUgPT09IHNQYXJhbWV0ZXJOYW1lKSB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IG9SYW5nZSA9IG9FeHRlbmRlZFBhcmFtZXRlci5SYW5nZXMubGVuZ3RoXG5cdFx0XHRcdFx0XHRcdFx0PyBvRXh0ZW5kZWRQYXJhbWV0ZXIuUmFuZ2VzW29FeHRlbmRlZFBhcmFtZXRlci5SYW5nZXMubGVuZ3RoIC0gMV1cblx0XHRcdFx0XHRcdFx0XHQ6IHVuZGVmaW5lZDtcblx0XHRcdFx0XHRcdFx0aWYgKG9SYW5nZSAmJiBvUmFuZ2UuU2lnbiA9PT0gXCJJXCIgJiYgb1JhbmdlLk9wdGlvbiA9PT0gXCJFUVwiKSB7XG5cdFx0XHRcdFx0XHRcdFx0b01vZGVsLnNldFByb3BlcnR5KHNQcm9wZXJ0eU5hbWUsIG9SYW5nZS5Mb3cpOyAvLyBoaWdoIGlzIGlnbm9yZWQgd2hlbiBPcHRpb249RVFcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm4gcmVzb2x2ZSh0cnVlKTtcblx0XHR9KTtcblx0fSk7XG59XG5leHBvcnQgdHlwZSBJbmJvdW5kUGFyYW1ldGVyID0ge1xuXHR1c2VGb3JDcmVhdGU6IGJvb2xlYW47XG59O1xuZnVuY3Rpb24gZ2V0QWRkaXRpb25hbFBhcmFtc0ZvckNyZWF0ZShcblx0b1N0YXJ0dXBQYXJhbWV0ZXJzOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duW10+LFxuXHRvSW5ib3VuZFBhcmFtZXRlcnM/OiBSZWNvcmQ8c3RyaW5nLCBJbmJvdW5kUGFyYW1ldGVyPlxuKSB7XG5cdGNvbnN0IG9JbmJvdW5kcyA9IG9JbmJvdW5kUGFyYW1ldGVycyxcblx0XHRhQ3JlYXRlUGFyYW1ldGVycyA9XG5cdFx0XHRvSW5ib3VuZHMgIT09IHVuZGVmaW5lZFxuXHRcdFx0XHQ/IE9iamVjdC5rZXlzKG9JbmJvdW5kcykuZmlsdGVyKGZ1bmN0aW9uIChzUGFyYW1ldGVyOiBzdHJpbmcpIHtcblx0XHRcdFx0XHRcdHJldHVybiBvSW5ib3VuZHNbc1BhcmFtZXRlcl0udXNlRm9yQ3JlYXRlO1xuXHRcdFx0XHQgIH0pXG5cdFx0XHRcdDogW107XG5cdGxldCBvUmV0O1xuXHRmb3IgKGxldCBpID0gMDsgaSA8IGFDcmVhdGVQYXJhbWV0ZXJzLmxlbmd0aDsgaSsrKSB7XG5cdFx0Y29uc3Qgc0NyZWF0ZVBhcmFtZXRlciA9IGFDcmVhdGVQYXJhbWV0ZXJzW2ldO1xuXHRcdGNvbnN0IGFWYWx1ZXMgPSBvU3RhcnR1cFBhcmFtZXRlcnMgJiYgb1N0YXJ0dXBQYXJhbWV0ZXJzW3NDcmVhdGVQYXJhbWV0ZXJdO1xuXHRcdGlmIChhVmFsdWVzICYmIGFWYWx1ZXMubGVuZ3RoID09PSAxKSB7XG5cdFx0XHRvUmV0ID0gb1JldCB8fCBPYmplY3QuY3JlYXRlKG51bGwpO1xuXHRcdFx0b1JldFtzQ3JlYXRlUGFyYW1ldGVyXSA9IGFWYWx1ZXNbMF07XG5cdFx0fVxuXHR9XG5cdHJldHVybiBvUmV0O1xufVxudHlwZSBPdXRib3VuZFBhcmFtZXRlciA9IHtcblx0cGFyYW1ldGVyczogUmVjb3JkPHN0cmluZywgT3V0Ym91bmRQYXJhbWV0ZXJWYWx1ZT47XG5cdHNlbWFudGljT2JqZWN0Pzogc3RyaW5nO1xuXHRhY3Rpb24/OiBzdHJpbmc7XG59O1xudHlwZSBPdXRib3VuZFBhcmFtZXRlclZhbHVlID0ge1xuXHR2YWx1ZT86IHtcblx0XHR2YWx1ZT86IHN0cmluZztcblx0XHRmb3JtYXQ/OiBzdHJpbmc7XG5cdH07XG59O1xuZnVuY3Rpb24gZ2V0U2VtYW50aWNPYmplY3RNYXBwaW5nKG9PdXRib3VuZDogT3V0Ym91bmRQYXJhbWV0ZXIpIHtcblx0Y29uc3QgYVNlbWFudGljT2JqZWN0TWFwcGluZzogTWV0YU1vZGVsVHlwZTxTZW1hbnRpY09iamVjdE1hcHBpbmdUeXBlPltdID0gW107XG5cdGlmIChvT3V0Ym91bmQucGFyYW1ldGVycykge1xuXHRcdGNvbnN0IGFQYXJhbWV0ZXJzID0gT2JqZWN0LmtleXMob091dGJvdW5kLnBhcmFtZXRlcnMpIHx8IFtdO1xuXHRcdGlmIChhUGFyYW1ldGVycy5sZW5ndGggPiAwKSB7XG5cdFx0XHRhUGFyYW1ldGVycy5mb3JFYWNoKGZ1bmN0aW9uIChzUGFyYW06IHN0cmluZykge1xuXHRcdFx0XHRjb25zdCBvTWFwcGluZyA9IG9PdXRib3VuZC5wYXJhbWV0ZXJzW3NQYXJhbV07XG5cdFx0XHRcdGlmIChvTWFwcGluZy52YWx1ZSAmJiBvTWFwcGluZy52YWx1ZS52YWx1ZSAmJiBvTWFwcGluZy52YWx1ZS5mb3JtYXQgPT09IFwiYmluZGluZ1wiKSB7XG5cdFx0XHRcdFx0Ly8gdXNpbmcgdGhlIGZvcm1hdCBvZiBVSS5NYXBwaW5nXG5cdFx0XHRcdFx0Y29uc3Qgb1NlbWFudGljTWFwcGluZyA9IHtcblx0XHRcdFx0XHRcdExvY2FsUHJvcGVydHk6IHtcblx0XHRcdFx0XHRcdFx0JFByb3BlcnR5UGF0aDogb01hcHBpbmcudmFsdWUudmFsdWVcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRTZW1hbnRpY09iamVjdFByb3BlcnR5OiBzUGFyYW1cblx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0aWYgKGFTZW1hbnRpY09iamVjdE1hcHBpbmcubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdFx0Ly8gVG8gY2hlY2sgaWYgdGhlIHNlbWFudGljT2JqZWN0IE1hcHBpbmcgaXMgZG9uZSBmb3IgdGhlIHNhbWUgbG9jYWwgcHJvcGVydHkgbW9yZSB0aGF0IG9uY2UgdGhlbiBmaXJzdCBvbmUgd2lsbCBiZSBjb25zaWRlcmVkXG5cdFx0XHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGFTZW1hbnRpY09iamVjdE1hcHBpbmcubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdFx0aWYgKGFTZW1hbnRpY09iamVjdE1hcHBpbmdbaV0uTG9jYWxQcm9wZXJ0eT8uJFByb3BlcnR5UGF0aCAhPT0gb1NlbWFudGljTWFwcGluZy5Mb2NhbFByb3BlcnR5LiRQcm9wZXJ0eVBhdGgpIHtcblx0XHRcdFx0XHRcdFx0XHRhU2VtYW50aWNPYmplY3RNYXBwaW5nLnB1c2gob1NlbWFudGljTWFwcGluZyk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0YVNlbWFudGljT2JqZWN0TWFwcGluZy5wdXNoKG9TZW1hbnRpY01hcHBpbmcpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBhU2VtYW50aWNPYmplY3RNYXBwaW5nO1xufVxuXG5mdW5jdGlvbiBnZXRIZWFkZXJGYWNldEl0ZW1Db25maWdGb3JFeHRlcm5hbE5hdmlnYXRpb24ob1ZpZXdEYXRhOiBWaWV3RGF0YSwgb0Nyb3NzTmF2OiBSZWNvcmQ8c3RyaW5nLCBPdXRib3VuZFBhcmFtZXRlcj4pIHtcblx0Y29uc3Qgb0hlYWRlckZhY2V0SXRlbXM6IFJlY29yZDxcblx0XHRzdHJpbmcsXG5cdFx0e1xuXHRcdFx0c2VtYW50aWNPYmplY3Q6IHN0cmluZztcblx0XHRcdGFjdGlvbjogc3RyaW5nO1xuXHRcdFx0c2VtYW50aWNPYmplY3RNYXBwaW5nOiBNZXRhTW9kZWxUeXBlPFNlbWFudGljT2JqZWN0TWFwcGluZ1R5cGU+W107XG5cdFx0fVxuXHQ+ID0ge307XG5cdGxldCBzSWQ7XG5cdGNvbnN0IG9Db250cm9sQ29uZmlnID0gb1ZpZXdEYXRhLmNvbnRyb2xDb25maWd1cmF0aW9uIGFzIFJlY29yZDxcblx0XHRzdHJpbmcsXG5cdFx0e1xuXHRcdFx0bmF2aWdhdGlvbj86IHtcblx0XHRcdFx0dGFyZ2V0T3V0Ym91bmQ/OiB7XG5cdFx0XHRcdFx0b3V0Ym91bmQ6IHN0cmluZztcblx0XHRcdFx0fTtcblx0XHRcdH07XG5cdFx0fVxuXHQ+O1xuXHRmb3IgKGNvbnN0IGNvbmZpZyBpbiBvQ29udHJvbENvbmZpZykge1xuXHRcdGlmIChjb25maWcuaW5kZXhPZihcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhUG9pbnRcIikgPiAtMSB8fCBjb25maWcuaW5kZXhPZihcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydFwiKSA+IC0xKSB7XG5cdFx0XHRjb25zdCBzT3V0Ym91bmQgPSBvQ29udHJvbENvbmZpZ1tjb25maWddLm5hdmlnYXRpb24/LnRhcmdldE91dGJvdW5kPy5vdXRib3VuZDtcblx0XHRcdGlmIChzT3V0Ym91bmQgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRjb25zdCBvT3V0Ym91bmQgPSBvQ3Jvc3NOYXZbc091dGJvdW5kXTtcblx0XHRcdFx0aWYgKG9PdXRib3VuZC5zZW1hbnRpY09iamVjdCAmJiBvT3V0Ym91bmQuYWN0aW9uKSB7XG5cdFx0XHRcdFx0aWYgKGNvbmZpZy5pbmRleE9mKFwiQ2hhcnRcIikgPiAtMSkge1xuXHRcdFx0XHRcdFx0c0lkID0gZ2VuZXJhdGUoW1wiZmVcIiwgXCJNaWNyb0NoYXJ0TGlua1wiLCBjb25maWddKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0c0lkID0gZ2VuZXJhdGUoW1wiZmVcIiwgXCJIZWFkZXJEUExpbmtcIiwgY29uZmlnXSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNvbnN0IGFTZW1hbnRpY09iamVjdE1hcHBpbmcgPSBDb21tb25VdGlscy5nZXRTZW1hbnRpY09iamVjdE1hcHBpbmcob091dGJvdW5kKTtcblx0XHRcdFx0XHRvSGVhZGVyRmFjZXRJdGVtc1tzSWRdID0ge1xuXHRcdFx0XHRcdFx0c2VtYW50aWNPYmplY3Q6IG9PdXRib3VuZC5zZW1hbnRpY09iamVjdCxcblx0XHRcdFx0XHRcdGFjdGlvbjogb091dGJvdW5kLmFjdGlvbixcblx0XHRcdFx0XHRcdHNlbWFudGljT2JqZWN0TWFwcGluZzogYVNlbWFudGljT2JqZWN0TWFwcGluZ1xuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0TG9nLmVycm9yKGBDcm9zcyBuYXZpZ2F0aW9uIG91dGJvdW5kIGlzIGNvbmZpZ3VyZWQgd2l0aG91dCBzZW1hbnRpYyBvYmplY3QgYW5kIGFjdGlvbiBmb3IgJHtzT3V0Ym91bmR9YCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblx0cmV0dXJuIG9IZWFkZXJGYWNldEl0ZW1zO1xufVxuXG5mdW5jdGlvbiBzZXRTZW1hbnRpY09iamVjdE1hcHBpbmdzKG9TZWxlY3Rpb25WYXJpYW50OiBTZWxlY3Rpb25WYXJpYW50LCB2TWFwcGluZ3M6IHVua25vd24pIHtcblx0Y29uc3Qgb01hcHBpbmdzID0gdHlwZW9mIHZNYXBwaW5ncyA9PT0gXCJzdHJpbmdcIiA/IEpTT04ucGFyc2Uodk1hcHBpbmdzKSA6IHZNYXBwaW5ncztcblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBvTWFwcGluZ3MubGVuZ3RoOyBpKyspIHtcblx0XHRjb25zdCBzTG9jYWxQcm9wZXJ0eSA9XG5cdFx0XHQob01hcHBpbmdzW2ldW1wiTG9jYWxQcm9wZXJ0eVwiXSAmJiBvTWFwcGluZ3NbaV1bXCJMb2NhbFByb3BlcnR5XCJdW1wiJFByb3BlcnR5UGF0aFwiXSkgfHxcblx0XHRcdChvTWFwcGluZ3NbaV1bXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkxvY2FsUHJvcGVydHlcIl0gJiZcblx0XHRcdFx0b01hcHBpbmdzW2ldW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Mb2NhbFByb3BlcnR5XCJdW1wiJFBhdGhcIl0pO1xuXHRcdGNvbnN0IHNTZW1hbnRpY09iamVjdFByb3BlcnR5ID1cblx0XHRcdG9NYXBwaW5nc1tpXVtcIlNlbWFudGljT2JqZWN0UHJvcGVydHlcIl0gfHwgb01hcHBpbmdzW2ldW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5TZW1hbnRpY09iamVjdFByb3BlcnR5XCJdO1xuXHRcdGNvbnN0IG9TZWxlY3RPcHRpb24gPSBvU2VsZWN0aW9uVmFyaWFudC5nZXRTZWxlY3RPcHRpb24oc0xvY2FsUHJvcGVydHkpO1xuXHRcdGlmIChvU2VsZWN0T3B0aW9uKSB7XG5cdFx0XHQvL0NyZWF0ZSBhIG5ldyBTZWxlY3RPcHRpb24gd2l0aCBzU2VtYW50aWNPYmplY3RQcm9wZXJ0eSBhcyB0aGUgcHJvcGVydHkgTmFtZSBhbmQgcmVtb3ZlIHRoZSBvbGRlciBvbmVcblx0XHRcdG9TZWxlY3Rpb25WYXJpYW50LnJlbW92ZVNlbGVjdE9wdGlvbihzTG9jYWxQcm9wZXJ0eSk7XG5cdFx0XHRvU2VsZWN0aW9uVmFyaWFudC5tYXNzQWRkU2VsZWN0T3B0aW9uKHNTZW1hbnRpY09iamVjdFByb3BlcnR5LCBvU2VsZWN0T3B0aW9uKTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIG9TZWxlY3Rpb25WYXJpYW50O1xufVxuXG50eXBlIFNlbWFudGljT2JqZWN0RnJvbVBhdGggPSB7XG5cdHNlbWFudGljT2JqZWN0UGF0aDogc3RyaW5nO1xuXHRzZW1hbnRpY09iamVjdEZvckdldExpbmtzOiB7IHNlbWFudGljT2JqZWN0OiBzdHJpbmcgfVtdO1xuXHRzZW1hbnRpY09iamVjdDoge1xuXHRcdHNlbWFudGljT2JqZWN0OiB7ICRQYXRoOiBzdHJpbmcgfTtcblx0fTtcblx0dW5hdmFpbGFibGVBY3Rpb25zOiBzdHJpbmdbXTtcbn07XG5hc3luYyBmdW5jdGlvbiBmbkdldFNlbWFudGljT2JqZWN0c0Zyb21QYXRoKG9NZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsLCBzUGF0aDogc3RyaW5nLCBzUXVhbGlmaWVyOiBzdHJpbmcpIHtcblx0cmV0dXJuIG5ldyBQcm9taXNlPFNlbWFudGljT2JqZWN0RnJvbVBhdGg+KGZ1bmN0aW9uIChyZXNvbHZlKSB7XG5cdFx0bGV0IHNTZW1hbnRpY09iamVjdCwgYVNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zO1xuXHRcdGlmIChzUXVhbGlmaWVyID09PSBcIlwiKSB7XG5cdFx0XHRzU2VtYW50aWNPYmplY3QgPSBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzUGF0aH1AJHtDb21tb25Bbm5vdGF0aW9uVGVybXMuU2VtYW50aWNPYmplY3R9YCk7XG5cdFx0XHRhU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMgPSBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzUGF0aH1AJHtDb21tb25Bbm5vdGF0aW9uVGVybXMuU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnN9YCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNTZW1hbnRpY09iamVjdCA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NQYXRofUAke0NvbW1vbkFubm90YXRpb25UZXJtcy5TZW1hbnRpY09iamVjdH0jJHtzUXVhbGlmaWVyfWApO1xuXHRcdFx0YVNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zID0gb01ldGFNb2RlbC5nZXRPYmplY3QoXG5cdFx0XHRcdGAke3NQYXRofUAke0NvbW1vbkFubm90YXRpb25UZXJtcy5TZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uc30jJHtzUXVhbGlmaWVyfWBcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgYVNlbWFudGljT2JqZWN0Rm9yR2V0TGlua3MgPSBbeyBzZW1hbnRpY09iamVjdDogc1NlbWFudGljT2JqZWN0IH1dO1xuXHRcdGNvbnN0IG9TZW1hbnRpY09iamVjdCA9IHtcblx0XHRcdHNlbWFudGljT2JqZWN0OiBzU2VtYW50aWNPYmplY3Rcblx0XHR9O1xuXHRcdHJlc29sdmUoe1xuXHRcdFx0c2VtYW50aWNPYmplY3RQYXRoOiBzUGF0aCxcblx0XHRcdHNlbWFudGljT2JqZWN0Rm9yR2V0TGlua3M6IGFTZW1hbnRpY09iamVjdEZvckdldExpbmtzLFxuXHRcdFx0c2VtYW50aWNPYmplY3Q6IG9TZW1hbnRpY09iamVjdCxcblx0XHRcdHVuYXZhaWxhYmxlQWN0aW9uczogYVNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zXG5cdFx0fSk7XG5cdH0pO1xufVxuXG5hc3luYyBmdW5jdGlvbiBmblVwZGF0ZVNlbWFudGljVGFyZ2V0c01vZGVsKFxuXHRhR2V0TGlua3NQcm9taXNlczogUHJvbWlzZTxMaW5rRGVmaW5pdGlvbltdW11bXT5bXSxcblx0YVNlbWFudGljT2JqZWN0czogU2VtYW50aWNPYmplY3RbXSxcblx0b0ludGVybmFsTW9kZWxDb250ZXh0OiBJbnRlcm5hbE1vZGVsQ29udGV4dCxcblx0c0N1cnJlbnRIYXNoOiBzdHJpbmdcbikge1xuXHR0eXBlIFNlbWFudGljT2JqZWN0SW5mbyA9IHsgc2VtYW50aWNPYmplY3Q6IHN0cmluZzsgcGF0aDogc3RyaW5nOyBIYXNUYXJnZXRzOiBib29sZWFuOyBIYXNUYXJnZXRzTm90RmlsdGVyZWQ6IGJvb2xlYW4gfTtcblx0cmV0dXJuIFByb21pc2UuYWxsKGFHZXRMaW5rc1Byb21pc2VzKVxuXHRcdC50aGVuKGZ1bmN0aW9uIChhVmFsdWVzKSB7XG5cdFx0XHRsZXQgYUxpbmtzOiBMaW5rRGVmaW5pdGlvbltdW11bXSxcblx0XHRcdFx0X29MaW5rLFxuXHRcdFx0XHRfc0xpbmtJbnRlbnRBY3Rpb24sXG5cdFx0XHRcdGFGaW5hbExpbmtzOiBMaW5rRGVmaW5pdGlvbltdW10gPSBbXTtcblx0XHRcdGxldCBvRmluYWxTZW1hbnRpY09iamVjdHM6IFJlY29yZDxzdHJpbmcsIFNlbWFudGljT2JqZWN0SW5mbz4gPSB7fTtcblx0XHRcdGNvbnN0IGJJbnRlbnRIYXNBY3Rpb25zID0gZnVuY3Rpb24gKHNJbnRlbnQ6IHN0cmluZywgYUFjdGlvbnM/OiB1bmtub3duW10pIHtcblx0XHRcdFx0Zm9yIChjb25zdCBpbnRlbnQgaW4gYUFjdGlvbnMpIHtcblx0XHRcdFx0XHRpZiAoaW50ZW50ID09PSBzSW50ZW50KSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fTtcblxuXHRcdFx0Zm9yIChsZXQgayA9IDA7IGsgPCBhVmFsdWVzLmxlbmd0aDsgaysrKSB7XG5cdFx0XHRcdGFMaW5rcyA9IGFWYWx1ZXNba107XG5cdFx0XHRcdGlmIChhTGlua3MgJiYgYUxpbmtzLmxlbmd0aCA+IDAgJiYgYUxpbmtzWzBdICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRjb25zdCBvU2VtYW50aWNPYmplY3Q6IFJlY29yZDxzdHJpbmcsIFJlY29yZDxzdHJpbmcsIFNlbWFudGljT2JqZWN0SW5mbz4+ID0ge307XG5cdFx0XHRcdFx0bGV0IG9UbXA6IFNlbWFudGljT2JqZWN0SW5mbztcblx0XHRcdFx0XHRsZXQgc0FsdGVybmF0ZVBhdGg7XG5cdFx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhTGlua3MubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdGFGaW5hbExpbmtzLnB1c2goW10pO1xuXHRcdFx0XHRcdFx0bGV0IGhhc1RhcmdldHNOb3RGaWx0ZXJlZCA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0bGV0IGhhc1RhcmdldHMgPSBmYWxzZTtcblx0XHRcdFx0XHRcdGZvciAobGV0IGlMaW5rQ291bnQgPSAwOyBpTGlua0NvdW50IDwgYUxpbmtzW2ldWzBdLmxlbmd0aDsgaUxpbmtDb3VudCsrKSB7XG5cdFx0XHRcdFx0XHRcdF9vTGluayA9IGFMaW5rc1tpXVswXVtpTGlua0NvdW50XTtcblx0XHRcdFx0XHRcdFx0X3NMaW5rSW50ZW50QWN0aW9uID0gX29MaW5rICYmIF9vTGluay5pbnRlbnQuc3BsaXQoXCI/XCIpWzBdLnNwbGl0KFwiLVwiKVsxXTtcblxuXHRcdFx0XHRcdFx0XHRpZiAoIShfb0xpbmsgJiYgX29MaW5rLmludGVudCAmJiBfb0xpbmsuaW50ZW50LmluZGV4T2Yoc0N1cnJlbnRIYXNoKSA9PT0gMCkpIHtcblx0XHRcdFx0XHRcdFx0XHRoYXNUYXJnZXRzTm90RmlsdGVyZWQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRcdGlmICghYkludGVudEhhc0FjdGlvbnMoX3NMaW5rSW50ZW50QWN0aW9uLCBhU2VtYW50aWNPYmplY3RzW2tdLnVuYXZhaWxhYmxlQWN0aW9ucykpIHtcblx0XHRcdFx0XHRcdFx0XHRcdGFGaW5hbExpbmtzW2ldLnB1c2goX29MaW5rKTtcblx0XHRcdFx0XHRcdFx0XHRcdGhhc1RhcmdldHMgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0b1RtcCA9IHtcblx0XHRcdFx0XHRcdFx0c2VtYW50aWNPYmplY3Q6IGFTZW1hbnRpY09iamVjdHNba10uc2VtYW50aWNPYmplY3QsXG5cdFx0XHRcdFx0XHRcdHBhdGg6IGFTZW1hbnRpY09iamVjdHNba10ucGF0aCxcblx0XHRcdFx0XHRcdFx0SGFzVGFyZ2V0czogaGFzVGFyZ2V0cyxcblx0XHRcdFx0XHRcdFx0SGFzVGFyZ2V0c05vdEZpbHRlcmVkOiBoYXNUYXJnZXRzTm90RmlsdGVyZWRcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRpZiAob1NlbWFudGljT2JqZWN0W2FTZW1hbnRpY09iamVjdHNba10uc2VtYW50aWNPYmplY3RdID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRcdFx0b1NlbWFudGljT2JqZWN0W2FTZW1hbnRpY09iamVjdHNba10uc2VtYW50aWNPYmplY3RdID0ge307XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRzQWx0ZXJuYXRlUGF0aCA9IGFTZW1hbnRpY09iamVjdHNba10ucGF0aC5yZXBsYWNlKC9cXC8vZywgXCJfXCIpO1xuXHRcdFx0XHRcdFx0aWYgKG9TZW1hbnRpY09iamVjdFthU2VtYW50aWNPYmplY3RzW2tdLnNlbWFudGljT2JqZWN0XVtzQWx0ZXJuYXRlUGF0aF0gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdFx0XHRvU2VtYW50aWNPYmplY3RbYVNlbWFudGljT2JqZWN0c1trXS5zZW1hbnRpY09iamVjdF1bc0FsdGVybmF0ZVBhdGhdID0ge30gYXMgU2VtYW50aWNPYmplY3RJbmZvO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0b1NlbWFudGljT2JqZWN0W2FTZW1hbnRpY09iamVjdHNba10uc2VtYW50aWNPYmplY3RdW3NBbHRlcm5hdGVQYXRoXSA9IE9iamVjdC5hc3NpZ24oXG5cdFx0XHRcdFx0XHRcdG9TZW1hbnRpY09iamVjdFthU2VtYW50aWNPYmplY3RzW2tdLnNlbWFudGljT2JqZWN0XVtzQWx0ZXJuYXRlUGF0aF0sXG5cdFx0XHRcdFx0XHRcdG9UbXBcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNvbnN0IHNTZW1hbnRpY09iamVjdE5hbWUgPSBPYmplY3Qua2V5cyhvU2VtYW50aWNPYmplY3QpWzBdO1xuXHRcdFx0XHRcdGlmIChPYmplY3Qua2V5cyhvRmluYWxTZW1hbnRpY09iamVjdHMpLmluY2x1ZGVzKHNTZW1hbnRpY09iamVjdE5hbWUpKSB7XG5cdFx0XHRcdFx0XHRvRmluYWxTZW1hbnRpY09iamVjdHNbc1NlbWFudGljT2JqZWN0TmFtZV0gPSBPYmplY3QuYXNzaWduKFxuXHRcdFx0XHRcdFx0XHRvRmluYWxTZW1hbnRpY09iamVjdHNbc1NlbWFudGljT2JqZWN0TmFtZV0sXG5cdFx0XHRcdFx0XHRcdG9TZW1hbnRpY09iamVjdFtzU2VtYW50aWNPYmplY3ROYW1lXVxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0b0ZpbmFsU2VtYW50aWNPYmplY3RzID0gT2JqZWN0LmFzc2lnbihvRmluYWxTZW1hbnRpY09iamVjdHMsIG9TZW1hbnRpY09iamVjdCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGFGaW5hbExpbmtzID0gW107XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmIChPYmplY3Qua2V5cyhvRmluYWxTZW1hbnRpY09iamVjdHMpLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFxuXHRcdFx0XHRcdFwic2VtYW50aWNzVGFyZ2V0c1wiLFxuXHRcdFx0XHRcdG1lcmdlT2JqZWN0cyhvRmluYWxTZW1hbnRpY09iamVjdHMsIG9JbnRlcm5hbE1vZGVsQ29udGV4dC5nZXRQcm9wZXJ0eShcInNlbWFudGljc1RhcmdldHNcIikpXG5cdFx0XHRcdCk7XG5cdFx0XHRcdHJldHVybiBvRmluYWxTZW1hbnRpY09iamVjdHM7XG5cdFx0XHR9XG5cdFx0fSlcblx0XHQuY2F0Y2goZnVuY3Rpb24gKG9FcnJvcjogdW5rbm93bikge1xuXHRcdFx0TG9nLmVycm9yKFwiZm5VcGRhdGVTZW1hbnRpY1RhcmdldHNNb2RlbDogQ2Fubm90IHJlYWQgbGlua3NcIiwgb0Vycm9yIGFzIHN0cmluZyk7XG5cdFx0fSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGZuR2V0U2VtYW50aWNPYmplY3RQcm9taXNlKFxuXHRvQXBwQ29tcG9uZW50OiBBcHBDb21wb25lbnQsXG5cdG9WaWV3OiBWaWV3LFxuXHRvTWV0YU1vZGVsOiBPRGF0YU1ldGFNb2RlbCxcblx0c1BhdGg6IHN0cmluZyxcblx0c1F1YWxpZmllcjogc3RyaW5nXG4pIHtcblx0cmV0dXJuIENvbW1vblV0aWxzLmdldFNlbWFudGljT2JqZWN0c0Zyb21QYXRoKG9NZXRhTW9kZWwsIHNQYXRoLCBzUXVhbGlmaWVyKTtcbn1cblxuZnVuY3Rpb24gZm5QcmVwYXJlU2VtYW50aWNPYmplY3RzUHJvbWlzZXMoXG5cdF9vQXBwQ29tcG9uZW50OiBBcHBDb21wb25lbnQsXG5cdF9vVmlldzogVmlldyxcblx0X29NZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsLFxuXHRfYVNlbWFudGljT2JqZWN0c0ZvdW5kOiBzdHJpbmdbXSxcblx0X2FTZW1hbnRpY09iamVjdHNQcm9taXNlczogUHJvbWlzZTxTZW1hbnRpY09iamVjdEZyb21QYXRoPltdXG4pIHtcblx0bGV0IF9LZXlzOiBzdHJpbmdbXSwgc1BhdGg7XG5cdGxldCBzUXVhbGlmaWVyOiBzdHJpbmcsIHJlZ2V4UmVzdWx0O1xuXHRmb3IgKGxldCBpID0gMDsgaSA8IF9hU2VtYW50aWNPYmplY3RzRm91bmQubGVuZ3RoOyBpKyspIHtcblx0XHRzUGF0aCA9IF9hU2VtYW50aWNPYmplY3RzRm91bmRbaV07XG5cdFx0X0tleXMgPSBPYmplY3Qua2V5cyhfb01ldGFNb2RlbC5nZXRPYmplY3Qoc1BhdGggKyBcIkBcIikpO1xuXHRcdGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBfS2V5cy5sZW5ndGg7IGluZGV4KyspIHtcblx0XHRcdGlmIChcblx0XHRcdFx0X0tleXNbaW5kZXhdLmluZGV4T2YoYEAke0NvbW1vbkFubm90YXRpb25UZXJtcy5TZW1hbnRpY09iamVjdH1gKSA9PT0gMCAmJlxuXHRcdFx0XHRfS2V5c1tpbmRleF0uaW5kZXhPZihgQCR7Q29tbW9uQW5ub3RhdGlvblRlcm1zLlNlbWFudGljT2JqZWN0TWFwcGluZ31gKSA9PT0gLTEgJiZcblx0XHRcdFx0X0tleXNbaW5kZXhdLmluZGV4T2YoYEAke0NvbW1vbkFubm90YXRpb25UZXJtcy5TZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uc31gKSA9PT0gLTFcblx0XHRcdCkge1xuXHRcdFx0XHRyZWdleFJlc3VsdCA9IC8jKC4qKS8uZXhlYyhfS2V5c1tpbmRleF0pO1xuXHRcdFx0XHRzUXVhbGlmaWVyID0gcmVnZXhSZXN1bHQgPyByZWdleFJlc3VsdFsxXSA6IFwiXCI7XG5cdFx0XHRcdF9hU2VtYW50aWNPYmplY3RzUHJvbWlzZXMucHVzaChcblx0XHRcdFx0XHRDb21tb25VdGlscy5nZXRTZW1hbnRpY09iamVjdFByb21pc2UoX29BcHBDb21wb25lbnQsIF9vVmlldywgX29NZXRhTW9kZWwsIHNQYXRoLCBzUXVhbGlmaWVyKVxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxufVxuXG50eXBlIEludGVybmFsSlNPTk1vZGVsID0ge1xuXHRfZ2V0T2JqZWN0KHZhbDogc3RyaW5nLCBjb250ZXh0PzogQ29udGV4dCk6IG9iamVjdDtcbn07XG5mdW5jdGlvbiBmbkdldFNlbWFudGljVGFyZ2V0c0Zyb21QYWdlTW9kZWwob0NvbnRyb2xsZXI6IFBhZ2VDb250cm9sbGVyLCBzUGFnZU1vZGVsOiBzdHJpbmcpIHtcblx0Y29uc3QgX2ZuZmluZFZhbHVlc0hlbHBlciA9IGZ1bmN0aW9uIChcblx0XHRvYmo6IHVuZGVmaW5lZCB8IG51bGwgfCBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+W10gfCBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcblx0XHRrZXk6IHN0cmluZyxcblx0XHRsaXN0OiBzdHJpbmdbXVxuXHQpIHtcblx0XHRpZiAoIW9iaikge1xuXHRcdFx0cmV0dXJuIGxpc3Q7XG5cdFx0fVxuXHRcdGlmIChvYmogaW5zdGFuY2VvZiBBcnJheSkge1xuXHRcdFx0Zm9yIChjb25zdCBpIGluIG9iaikge1xuXHRcdFx0XHRsaXN0ID0gbGlzdC5jb25jYXQoX2ZuZmluZFZhbHVlc0hlbHBlcihvYmpbaV0sIGtleSwgW10pKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBsaXN0O1xuXHRcdH1cblx0XHRpZiAob2JqW2tleV0pIHtcblx0XHRcdGxpc3QucHVzaChvYmpba2V5XSBhcyBzdHJpbmcpO1xuXHRcdH1cblxuXHRcdGlmICh0eXBlb2Ygb2JqID09IFwib2JqZWN0XCIgJiYgb2JqICE9PSBudWxsKSB7XG5cdFx0XHRjb25zdCBjaGlsZHJlbiA9IE9iamVjdC5rZXlzKG9iaik7XG5cdFx0XHRpZiAoY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0bGlzdCA9IGxpc3QuY29uY2F0KF9mbmZpbmRWYWx1ZXNIZWxwZXIob2JqW2NoaWxkcmVuW2ldXSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiwga2V5LCBbXSkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBsaXN0O1xuXHR9O1xuXHRjb25zdCBfZm5maW5kVmFsdWVzID0gZnVuY3Rpb24gKG9iajogdW5kZWZpbmVkIHwgbnVsbCB8IFJlY29yZDxzdHJpbmcsIHN0cmluZz5bXSB8IFJlY29yZDxzdHJpbmcsIHVua25vd24+LCBrZXk6IHN0cmluZykge1xuXHRcdHJldHVybiBfZm5maW5kVmFsdWVzSGVscGVyKG9iaiwga2V5LCBbXSk7XG5cdH07XG5cdGNvbnN0IF9mbkRlbGV0ZUR1cGxpY2F0ZVNlbWFudGljT2JqZWN0cyA9IGZ1bmN0aW9uIChhU2VtYW50aWNPYmplY3RQYXRoOiBzdHJpbmdbXSkge1xuXHRcdHJldHVybiBhU2VtYW50aWNPYmplY3RQYXRoLmZpbHRlcihmdW5jdGlvbiAodmFsdWU6IHN0cmluZywgaW5kZXg6IG51bWJlcikge1xuXHRcdFx0cmV0dXJuIGFTZW1hbnRpY09iamVjdFBhdGguaW5kZXhPZih2YWx1ZSkgPT09IGluZGV4O1xuXHRcdH0pO1xuXHR9O1xuXHRjb25zdCBvVmlldyA9IG9Db250cm9sbGVyLmdldFZpZXcoKTtcblx0Y29uc3Qgb0ludGVybmFsTW9kZWxDb250ZXh0ID0gb1ZpZXcuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSBhcyBJbnRlcm5hbE1vZGVsQ29udGV4dDtcblxuXHRpZiAob0ludGVybmFsTW9kZWxDb250ZXh0KSB7XG5cdFx0Y29uc3QgYVNlbWFudGljT2JqZWN0c1Byb21pc2VzOiBQcm9taXNlPFNlbWFudGljT2JqZWN0RnJvbVBhdGg+W10gPSBbXTtcblx0XHRjb25zdCBvQ29tcG9uZW50ID0gb0NvbnRyb2xsZXIuZ2V0T3duZXJDb21wb25lbnQoKTtcblx0XHRjb25zdCBvQXBwQ29tcG9uZW50ID0gQ29tcG9uZW50LmdldE93bmVyQ29tcG9uZW50Rm9yKG9Db21wb25lbnQpIGFzIEFwcENvbXBvbmVudDtcblx0XHRjb25zdCBvTWV0YU1vZGVsID0gb0FwcENvbXBvbmVudC5nZXRNZXRhTW9kZWwoKTtcblx0XHRsZXQgb1BhZ2VNb2RlbCA9IChvQ29tcG9uZW50LmdldE1vZGVsKHNQYWdlTW9kZWwpIGFzIEpTT05Nb2RlbCkuZ2V0RGF0YSgpO1xuXHRcdGlmIChKU09OLnN0cmluZ2lmeShvUGFnZU1vZGVsKSA9PT0gXCJ7fVwiKSB7XG5cdFx0XHRvUGFnZU1vZGVsID0gKG9Db21wb25lbnQuZ2V0TW9kZWwoc1BhZ2VNb2RlbCkgYXMgdW5rbm93biBhcyBJbnRlcm5hbEpTT05Nb2RlbCkuX2dldE9iamVjdChcIi9cIiwgdW5kZWZpbmVkKTtcblx0XHR9XG5cdFx0bGV0IGFTZW1hbnRpY09iamVjdHNGb3VuZCA9IF9mbmZpbmRWYWx1ZXMob1BhZ2VNb2RlbCwgXCJzZW1hbnRpY09iamVjdFBhdGhcIik7XG5cdFx0YVNlbWFudGljT2JqZWN0c0ZvdW5kID0gX2ZuRGVsZXRlRHVwbGljYXRlU2VtYW50aWNPYmplY3RzKGFTZW1hbnRpY09iamVjdHNGb3VuZCk7XG5cdFx0Y29uc3Qgb1NoZWxsU2VydmljZUhlbHBlciA9IENvbW1vblV0aWxzLmdldFNoZWxsU2VydmljZXMob0FwcENvbXBvbmVudCk7XG5cdFx0bGV0IHNDdXJyZW50SGFzaCA9IENvbW1vblV0aWxzLmdldEhhc2goKTtcblx0XHRjb25zdCBhU2VtYW50aWNPYmplY3RzRm9yR2V0TGlua3MgPSBbXTtcblx0XHRjb25zdCBhU2VtYW50aWNPYmplY3RzOiBTZW1hbnRpY09iamVjdFtdID0gW107XG5cdFx0bGV0IF9vU2VtYW50aWNPYmplY3Q7XG5cblx0XHRpZiAoc0N1cnJlbnRIYXNoICYmIHNDdXJyZW50SGFzaC5pbmRleE9mKFwiP1wiKSAhPT0gLTEpIHtcblx0XHRcdC8vIHNDdXJyZW50SGFzaCBjYW4gY29udGFpbiBxdWVyeSBzdHJpbmcsIGN1dCBpdCBvZmYhXG5cdFx0XHRzQ3VycmVudEhhc2ggPSBzQ3VycmVudEhhc2guc3BsaXQoXCI/XCIpWzBdO1xuXHRcdH1cblxuXHRcdGZuUHJlcGFyZVNlbWFudGljT2JqZWN0c1Byb21pc2VzKG9BcHBDb21wb25lbnQsIG9WaWV3LCBvTWV0YU1vZGVsLCBhU2VtYW50aWNPYmplY3RzRm91bmQsIGFTZW1hbnRpY09iamVjdHNQcm9taXNlcyk7XG5cblx0XHRpZiAoYVNlbWFudGljT2JqZWN0c1Byb21pc2VzLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRQcm9taXNlLmFsbChhU2VtYW50aWNPYmplY3RzUHJvbWlzZXMpXG5cdFx0XHRcdC50aGVuKGFzeW5jIGZ1bmN0aW9uIChhVmFsdWVzKSB7XG5cdFx0XHRcdFx0Y29uc3QgYUdldExpbmtzUHJvbWlzZXMgPSBbXTtcblx0XHRcdFx0XHRsZXQgc1NlbU9iakV4cHJlc3Npb247XG5cdFx0XHRcdFx0dHlwZSBTZW1hbnRpY09iamVjdFJlc29sdmVkID0ge1xuXHRcdFx0XHRcdFx0c2VtYW50aWNPYmplY3RQYXRoOiBzdHJpbmc7XG5cdFx0XHRcdFx0XHRzZW1hbnRpY09iamVjdEZvckdldExpbmtzOiB7IHNlbWFudGljT2JqZWN0OiBzdHJpbmcgfVtdO1xuXHRcdFx0XHRcdFx0c2VtYW50aWNPYmplY3Q6IHtcblx0XHRcdFx0XHRcdFx0c2VtYW50aWNPYmplY3Q6IHN0cmluZztcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHR1bmF2YWlsYWJsZUFjdGlvbnM6IHN0cmluZ1tdO1xuXHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0Y29uc3QgYVNlbWFudGljT2JqZWN0c1Jlc29sdmVkOiBTZW1hbnRpY09iamVjdFJlc29sdmVkW10gPSBhVmFsdWVzLmZpbHRlcihmdW5jdGlvbiAoZWxlbWVudCkge1xuXHRcdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0XHRlbGVtZW50LnNlbWFudGljT2JqZWN0ICE9PSB1bmRlZmluZWQgJiZcblx0XHRcdFx0XHRcdFx0ZWxlbWVudC5zZW1hbnRpY09iamVjdC5zZW1hbnRpY09iamVjdCAmJlxuXHRcdFx0XHRcdFx0XHR0eXBlb2YgZWxlbWVudC5zZW1hbnRpY09iamVjdC5zZW1hbnRpY09iamVjdCA9PT0gXCJvYmplY3RcIlxuXHRcdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHRcdHNTZW1PYmpFeHByZXNzaW9uID0gY29tcGlsZUV4cHJlc3Npb24ocGF0aEluTW9kZWwoZWxlbWVudC5zZW1hbnRpY09iamVjdC5zZW1hbnRpY09iamVjdC4kUGF0aCkpITtcblx0XHRcdFx0XHRcdFx0KGVsZW1lbnQgYXMgdW5rbm93biBhcyBTZW1hbnRpY09iamVjdFJlc29sdmVkKS5zZW1hbnRpY09iamVjdC5zZW1hbnRpY09iamVjdCA9IHNTZW1PYmpFeHByZXNzaW9uO1xuXHRcdFx0XHRcdFx0XHRlbGVtZW50LnNlbWFudGljT2JqZWN0Rm9yR2V0TGlua3NbMF0uc2VtYW50aWNPYmplY3QgPSBzU2VtT2JqRXhwcmVzc2lvbjtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0XHR9IGVsc2UgaWYgKGVsZW1lbnQpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIGVsZW1lbnQuc2VtYW50aWNPYmplY3QgIT09IHVuZGVmaW5lZDtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KSBhcyB1bmtub3duIGFzIFNlbWFudGljT2JqZWN0UmVzb2x2ZWRbXTtcblx0XHRcdFx0XHRmb3IgKGxldCBqID0gMDsgaiA8IGFTZW1hbnRpY09iamVjdHNSZXNvbHZlZC5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRcdFx0X29TZW1hbnRpY09iamVjdCA9IGFTZW1hbnRpY09iamVjdHNSZXNvbHZlZFtqXTtcblx0XHRcdFx0XHRcdGlmIChcblx0XHRcdFx0XHRcdFx0X29TZW1hbnRpY09iamVjdCAmJlxuXHRcdFx0XHRcdFx0XHRfb1NlbWFudGljT2JqZWN0LnNlbWFudGljT2JqZWN0ICYmXG5cdFx0XHRcdFx0XHRcdCEoX29TZW1hbnRpY09iamVjdC5zZW1hbnRpY09iamVjdC5zZW1hbnRpY09iamVjdC5pbmRleE9mKFwie1wiKSA9PT0gMClcblx0XHRcdFx0XHRcdCkge1xuXHRcdFx0XHRcdFx0XHRhU2VtYW50aWNPYmplY3RzRm9yR2V0TGlua3MucHVzaChfb1NlbWFudGljT2JqZWN0LnNlbWFudGljT2JqZWN0Rm9yR2V0TGlua3MpO1xuXHRcdFx0XHRcdFx0XHRhU2VtYW50aWNPYmplY3RzLnB1c2goe1xuXHRcdFx0XHRcdFx0XHRcdHNlbWFudGljT2JqZWN0OiBfb1NlbWFudGljT2JqZWN0LnNlbWFudGljT2JqZWN0LnNlbWFudGljT2JqZWN0LFxuXHRcdFx0XHRcdFx0XHRcdHVuYXZhaWxhYmxlQWN0aW9uczogX29TZW1hbnRpY09iamVjdC51bmF2YWlsYWJsZUFjdGlvbnMsXG5cdFx0XHRcdFx0XHRcdFx0cGF0aDogYVNlbWFudGljT2JqZWN0c1Jlc29sdmVkW2pdLnNlbWFudGljT2JqZWN0UGF0aFxuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0YUdldExpbmtzUHJvbWlzZXMucHVzaChvU2hlbGxTZXJ2aWNlSGVscGVyLmdldExpbmtzV2l0aENhY2hlKFtfb1NlbWFudGljT2JqZWN0LnNlbWFudGljT2JqZWN0Rm9yR2V0TGlua3NdKSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiBDb21tb25VdGlscy51cGRhdGVTZW1hbnRpY1RhcmdldHMoYUdldExpbmtzUHJvbWlzZXMsIGFTZW1hbnRpY09iamVjdHMsIG9JbnRlcm5hbE1vZGVsQ29udGV4dCwgc0N1cnJlbnRIYXNoKTtcblx0XHRcdFx0fSlcblx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChvRXJyb3I6IHVua25vd24pIHtcblx0XHRcdFx0XHRMb2cuZXJyb3IoXCJmbkdldFNlbWFudGljVGFyZ2V0c0Zyb21UYWJsZTogQ2Fubm90IGdldCBTZW1hbnRpYyBPYmplY3RzXCIsIG9FcnJvciBhcyBzdHJpbmcpO1xuXHRcdFx0XHR9KTtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGdldEZpbHRlckFsbG93ZWRFeHByZXNzaW9uKG9GaWx0ZXJSZXN0cmljdGlvbnNBbm5vdGF0aW9uPzogTWV0YU1vZGVsVHlwZTxGaWx0ZXJSZXN0cmljdGlvbnNUeXBlPikge1xuXHRjb25zdCBtQWxsb3dlZEV4cHJlc3Npb25zOiBfRmlsdGVyQWxsb3dlZEV4cHJlc3Npb25zID0ge307XG5cdGlmIChvRmlsdGVyUmVzdHJpY3Rpb25zQW5ub3RhdGlvbiAmJiBvRmlsdGVyUmVzdHJpY3Rpb25zQW5ub3RhdGlvbi5GaWx0ZXJFeHByZXNzaW9uUmVzdHJpY3Rpb25zICE9PSB1bmRlZmluZWQpIHtcblx0XHRvRmlsdGVyUmVzdHJpY3Rpb25zQW5ub3RhdGlvbi5GaWx0ZXJFeHByZXNzaW9uUmVzdHJpY3Rpb25zLmZvckVhY2goZnVuY3Rpb24gKG9Qcm9wZXJ0eSkge1xuXHRcdFx0aWYgKG9Qcm9wZXJ0eS5Qcm9wZXJ0eSAmJiBvUHJvcGVydHkuQWxsb3dlZEV4cHJlc3Npb25zICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0Ly9TaW5nbGVWYWx1ZSB8IE11bHRpVmFsdWUgfCBTaW5nbGVSYW5nZSB8IE11bHRpUmFuZ2UgfCBTZWFyY2hFeHByZXNzaW9uIHwgTXVsdGlSYW5nZU9yU2VhcmNoRXhwcmVzc2lvblxuXHRcdFx0XHRpZiAobUFsbG93ZWRFeHByZXNzaW9uc1tvUHJvcGVydHkuUHJvcGVydHkuJFByb3BlcnR5UGF0aF0gIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdG1BbGxvd2VkRXhwcmVzc2lvbnNbb1Byb3BlcnR5LlByb3BlcnR5LiRQcm9wZXJ0eVBhdGhdLnB1c2gob1Byb3BlcnR5LkFsbG93ZWRFeHByZXNzaW9ucyBhcyBzdHJpbmcpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG1BbGxvd2VkRXhwcmVzc2lvbnNbb1Byb3BlcnR5LlByb3BlcnR5LiRQcm9wZXJ0eVBhdGhdID0gW29Qcm9wZXJ0eS5BbGxvd2VkRXhwcmVzc2lvbnMgYXMgc3RyaW5nXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cdHJldHVybiBtQWxsb3dlZEV4cHJlc3Npb25zO1xufVxuZnVuY3Rpb24gZ2V0RmlsdGVyUmVzdHJpY3Rpb25zKFxuXHRvRmlsdGVyUmVzdHJpY3Rpb25zQW5ub3RhdGlvbj86IE1ldGFNb2RlbFR5cGU8RmlsdGVyUmVzdHJpY3Rpb25zVHlwZT4sXG5cdHNSZXN0cmljdGlvbj86IFwiUmVxdWlyZWRQcm9wZXJ0aWVzXCIgfCBcIk5vbkZpbHRlcmFibGVQcm9wZXJ0aWVzXCJcbikge1xuXHRsZXQgYVByb3BzOiBzdHJpbmdbXSA9IFtdO1xuXHRpZiAob0ZpbHRlclJlc3RyaWN0aW9uc0Fubm90YXRpb24gJiYgb0ZpbHRlclJlc3RyaWN0aW9uc0Fubm90YXRpb25bc1Jlc3RyaWN0aW9uIGFzIGtleW9mIE1ldGFNb2RlbFR5cGU8RmlsdGVyUmVzdHJpY3Rpb25zVHlwZT5dKSB7XG5cdFx0YVByb3BzID0gKFxuXHRcdFx0b0ZpbHRlclJlc3RyaWN0aW9uc0Fubm90YXRpb25bc1Jlc3RyaWN0aW9uIGFzIGtleW9mIE1ldGFNb2RlbFR5cGU8RmlsdGVyUmVzdHJpY3Rpb25zVHlwZT5dIGFzIEV4cGFuZFBhdGhUeXBlPEVkbS5Qcm9wZXJ0eVBhdGg+W11cblx0XHQpLm1hcChmdW5jdGlvbiAob1Byb3BlcnR5OiBFeHBhbmRQYXRoVHlwZTxFZG0uUHJvcGVydHlQYXRoPikge1xuXHRcdFx0cmV0dXJuIG9Qcm9wZXJ0eS4kUHJvcGVydHlQYXRoO1xuXHRcdH0pO1xuXHR9XG5cdHJldHVybiBhUHJvcHM7XG59XG5cbmZ1bmN0aW9uIF9mZXRjaFByb3BlcnRpZXNGb3JOYXZQYXRoKHBhdGhzOiBzdHJpbmdbXSwgbmF2UGF0aDogc3RyaW5nLCBwcm9wczogc3RyaW5nW10pIHtcblx0Y29uc3QgbmF2UGF0aFByZWZpeCA9IG5hdlBhdGggKyBcIi9cIjtcblx0cmV0dXJuIHBhdGhzLnJlZHVjZSgob3V0UGF0aHM6IHN0cmluZ1tdLCBwYXRoVG9DaGVjazogc3RyaW5nKSA9PiB7XG5cdFx0aWYgKHBhdGhUb0NoZWNrLnN0YXJ0c1dpdGgobmF2UGF0aFByZWZpeCkpIHtcblx0XHRcdGNvbnN0IG91dFBhdGggPSBwYXRoVG9DaGVjay5yZXBsYWNlKG5hdlBhdGhQcmVmaXgsIFwiXCIpO1xuXHRcdFx0aWYgKG91dFBhdGhzLmluZGV4T2Yob3V0UGF0aCkgPT09IC0xKSB7XG5cdFx0XHRcdG91dFBhdGhzLnB1c2gob3V0UGF0aCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBvdXRQYXRocztcblx0fSwgcHJvcHMpO1xufVxudHlwZSBfRmlsdGVyQWxsb3dlZEV4cHJlc3Npb25zID0gUmVjb3JkPHN0cmluZywgc3RyaW5nW10+O1xudHlwZSBfRmlsdGVyUmVzdHJpY3Rpb25zID0ge1xuXHRSZXF1aXJlZFByb3BlcnRpZXM6IHN0cmluZ1tdO1xuXHROb25GaWx0ZXJhYmxlUHJvcGVydGllczogc3RyaW5nW107XG5cdEZpbHRlckFsbG93ZWRFeHByZXNzaW9uczogX0ZpbHRlckFsbG93ZWRFeHByZXNzaW9ucztcbn07XG5mdW5jdGlvbiBnZXRGaWx0ZXJSZXN0cmljdGlvbnNCeVBhdGgoZW50aXR5UGF0aDogc3RyaW5nLCBvQ29udGV4dDogT0RhdGFNZXRhTW9kZWwpIHtcblx0Y29uc3Qgb1JldDogX0ZpbHRlclJlc3RyaWN0aW9ucyA9IHtcblx0XHRSZXF1aXJlZFByb3BlcnRpZXM6IFtdLFxuXHRcdE5vbkZpbHRlcmFibGVQcm9wZXJ0aWVzOiBbXSxcblx0XHRGaWx0ZXJBbGxvd2VkRXhwcmVzc2lvbnM6IHt9XG5cdH07XG5cdGxldCBvRmlsdGVyUmVzdHJpY3Rpb25zO1xuXHRjb25zdCBuYXZpZ2F0aW9uVGV4dCA9IFwiJE5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmdcIjtcblx0Y29uc3QgZnJUZXJtID0gXCJAT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5GaWx0ZXJSZXN0cmljdGlvbnNcIjtcblx0Y29uc3QgZW50aXR5VHlwZVBhdGhQYXJ0cyA9IGVudGl0eVBhdGgucmVwbGFjZUFsbChcIiUyRlwiLCBcIi9cIikuc3BsaXQoXCIvXCIpLmZpbHRlcihNb2RlbEhlbHBlci5maWx0ZXJPdXROYXZQcm9wQmluZGluZyk7XG5cdGNvbnN0IGVudGl0eVR5cGVQYXRoID0gYC8ke2VudGl0eVR5cGVQYXRoUGFydHMuam9pbihcIi9cIil9L2A7XG5cdGNvbnN0IGVudGl0eVNldFBhdGggPSBNb2RlbEhlbHBlci5nZXRFbnRpdHlTZXRQYXRoKGVudGl0eVBhdGgsIG9Db250ZXh0KTtcblx0Y29uc3QgZW50aXR5U2V0UGF0aFBhcnRzID0gZW50aXR5U2V0UGF0aC5zcGxpdChcIi9cIikuZmlsdGVyKE1vZGVsSGVscGVyLmZpbHRlck91dE5hdlByb3BCaW5kaW5nKTtcblx0Y29uc3QgaXNDb250YWlubWVudCA9IG9Db250ZXh0LmdldE9iamVjdChgJHtlbnRpdHlUeXBlUGF0aH0kQ29udGFpbnNUYXJnZXRgKTtcblx0Y29uc3QgY29udGFpbm1lbnROYXZQYXRoID0gaXNDb250YWlubWVudCAmJiBlbnRpdHlUeXBlUGF0aFBhcnRzW2VudGl0eVR5cGVQYXRoUGFydHMubGVuZ3RoIC0gMV07XG5cblx0Ly9MRUFTVCBQUklPUklUWSAtIEZpbHRlciByZXN0cmljdGlvbnMgZGlyZWN0bHkgYXQgRW50aXR5IFNldFxuXHQvL2UuZy4gRlIgaW4gXCJOUy5FbnRpdHlDb250YWluZXIvU2FsZXNPcmRlck1hbmFnZVwiIENvbnRleHRQYXRoOiAvU2FsZXNPcmRlck1hbmFnZVxuXHRpZiAoIWlzQ29udGFpbm1lbnQpIHtcblx0XHRvRmlsdGVyUmVzdHJpY3Rpb25zID0gb0NvbnRleHQuZ2V0T2JqZWN0KGAke2VudGl0eVNldFBhdGh9JHtmclRlcm19YCkgYXMgTWV0YU1vZGVsVHlwZTxGaWx0ZXJSZXN0cmljdGlvbnNUeXBlPiB8IHVuZGVmaW5lZDtcblx0XHRvUmV0LlJlcXVpcmVkUHJvcGVydGllcyA9IGdldEZpbHRlclJlc3RyaWN0aW9ucyhvRmlsdGVyUmVzdHJpY3Rpb25zLCBcIlJlcXVpcmVkUHJvcGVydGllc1wiKSB8fCBbXTtcblx0XHRjb25zdCByZXN1bHRDb250ZXh0Q2hlY2sgPSBvQ29udGV4dC5nZXRPYmplY3QoYCR7ZW50aXR5VHlwZVBhdGh9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5SZXN1bHRDb250ZXh0YCk7XG5cdFx0aWYgKCFyZXN1bHRDb250ZXh0Q2hlY2spIHtcblx0XHRcdG9SZXQuTm9uRmlsdGVyYWJsZVByb3BlcnRpZXMgPSBnZXRGaWx0ZXJSZXN0cmljdGlvbnMob0ZpbHRlclJlc3RyaWN0aW9ucywgXCJOb25GaWx0ZXJhYmxlUHJvcGVydGllc1wiKSB8fCBbXTtcblx0XHR9XG5cdFx0Ly9TaW5nbGVWYWx1ZSB8IE11bHRpVmFsdWUgfCBTaW5nbGVSYW5nZSB8IE11bHRpUmFuZ2UgfCBTZWFyY2hFeHByZXNzaW9uIHwgTXVsdGlSYW5nZU9yU2VhcmNoRXhwcmVzc2lvblxuXHRcdG9SZXQuRmlsdGVyQWxsb3dlZEV4cHJlc3Npb25zID0gZ2V0RmlsdGVyQWxsb3dlZEV4cHJlc3Npb24ob0ZpbHRlclJlc3RyaWN0aW9ucykgfHwge307XG5cdH1cblxuXHRpZiAoZW50aXR5VHlwZVBhdGhQYXJ0cy5sZW5ndGggPiAxKSB7XG5cdFx0Y29uc3QgbmF2UGF0aCA9IGlzQ29udGFpbm1lbnQgPyBjb250YWlubWVudE5hdlBhdGggOiBlbnRpdHlTZXRQYXRoUGFydHNbZW50aXR5U2V0UGF0aFBhcnRzLmxlbmd0aCAtIDFdO1xuXHRcdC8vIEluIGNhc2Ugb2YgY29udGFpbm1lbnQgd2UgdGFrZSBlbnRpdHlTZXQgcHJvdmlkZWQgYXMgcGFyZW50LiBBbmQgaW4gY2FzZSBvZiBub3JtYWwgd2Ugd291bGQgcmVtb3ZlIHRoZSBsYXN0IG5hdmlnYXRpb24gZnJvbSBlbnRpdHlTZXRQYXRoLlxuXHRcdGNvbnN0IHBhcmVudEVudGl0eVNldFBhdGggPSBpc0NvbnRhaW5tZW50ID8gZW50aXR5U2V0UGF0aCA6IGAvJHtlbnRpdHlTZXRQYXRoUGFydHMuc2xpY2UoMCwgLTEpLmpvaW4oYC8ke25hdmlnYXRpb25UZXh0fS9gKX1gO1xuXHRcdC8vVEhJUkQgSElHSEVTVCBQUklPUklUWSAtIFJlYWRpbmcgcHJvcGVydHkgcGF0aCByZXN0cmljdGlvbnMgLSBBbm5vdGF0aW9uIGF0IG1haW4gZW50aXR5IGJ1dCBkaXJlY3RseSBvbiBuYXZpZ2F0aW9uIHByb3BlcnR5IHBhdGhcblx0XHQvL2UuZy4gUGFyZW50IEN1c3RvbWVyIHdpdGggUHJvcGVydHlQYXRoPVwiU2V0L0NpdHlOYW1lXCIgQ29udGV4dFBhdGg6IEN1c3RvbWVyL1NldFxuXHRcdGNvbnN0IG9QYXJlbnRSZXQ6IF9GaWx0ZXJSZXN0cmljdGlvbnMgPSB7XG5cdFx0XHRSZXF1aXJlZFByb3BlcnRpZXM6IFtdLFxuXHRcdFx0Tm9uRmlsdGVyYWJsZVByb3BlcnRpZXM6IFtdLFxuXHRcdFx0RmlsdGVyQWxsb3dlZEV4cHJlc3Npb25zOiB7fVxuXHRcdH07XG5cdFx0aWYgKCFuYXZQYXRoLmluY2x1ZGVzKFwiJTJGXCIpKSB7XG5cdFx0XHRjb25zdCBvUGFyZW50RlIgPSBvQ29udGV4dC5nZXRPYmplY3QoYCR7cGFyZW50RW50aXR5U2V0UGF0aH0ke2ZyVGVybX1gKSBhcyBNZXRhTW9kZWxUeXBlPEZpbHRlclJlc3RyaWN0aW9uc1R5cGU+IHwgdW5kZWZpbmVkO1xuXHRcdFx0b1JldC5SZXF1aXJlZFByb3BlcnRpZXMgPSBfZmV0Y2hQcm9wZXJ0aWVzRm9yTmF2UGF0aChcblx0XHRcdFx0Z2V0RmlsdGVyUmVzdHJpY3Rpb25zKG9QYXJlbnRGUiwgXCJSZXF1aXJlZFByb3BlcnRpZXNcIikgfHwgW10sXG5cdFx0XHRcdG5hdlBhdGgsXG5cdFx0XHRcdG9SZXQuUmVxdWlyZWRQcm9wZXJ0aWVzIHx8IFtdXG5cdFx0XHQpO1xuXHRcdFx0b1JldC5Ob25GaWx0ZXJhYmxlUHJvcGVydGllcyA9IF9mZXRjaFByb3BlcnRpZXNGb3JOYXZQYXRoKFxuXHRcdFx0XHRnZXRGaWx0ZXJSZXN0cmljdGlvbnMob1BhcmVudEZSLCBcIk5vbkZpbHRlcmFibGVQcm9wZXJ0aWVzXCIpIHx8IFtdLFxuXHRcdFx0XHRuYXZQYXRoLFxuXHRcdFx0XHRvUmV0Lk5vbkZpbHRlcmFibGVQcm9wZXJ0aWVzIHx8IFtdXG5cdFx0XHQpO1xuXHRcdFx0Ly9TaW5nbGVWYWx1ZSB8IE11bHRpVmFsdWUgfCBTaW5nbGVSYW5nZSB8IE11bHRpUmFuZ2UgfCBTZWFyY2hFeHByZXNzaW9uIHwgTXVsdGlSYW5nZU9yU2VhcmNoRXhwcmVzc2lvblxuXHRcdFx0Y29uc3QgY29tcGxldGVBbGxvd2VkRXhwcyA9IGdldEZpbHRlckFsbG93ZWRFeHByZXNzaW9uKG9QYXJlbnRGUikgfHwge307XG5cdFx0XHRvUGFyZW50UmV0LkZpbHRlckFsbG93ZWRFeHByZXNzaW9ucyA9IE9iamVjdC5rZXlzKGNvbXBsZXRlQWxsb3dlZEV4cHMpLnJlZHVjZShcblx0XHRcdFx0KG91dFByb3A6IFJlY29yZDxzdHJpbmcsIHN0cmluZ1tdPiwgcHJvcFBhdGg6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRcdGlmIChwcm9wUGF0aC5zdGFydHNXaXRoKG5hdlBhdGggKyBcIi9cIikpIHtcblx0XHRcdFx0XHRcdGNvbnN0IG91dFByb3BQYXRoID0gcHJvcFBhdGgucmVwbGFjZShuYXZQYXRoICsgXCIvXCIsIFwiXCIpO1xuXHRcdFx0XHRcdFx0b3V0UHJvcFtvdXRQcm9wUGF0aF0gPSBjb21wbGV0ZUFsbG93ZWRFeHBzW3Byb3BQYXRoXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmV0dXJuIG91dFByb3A7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHt9IGFzIFJlY29yZDxzdHJpbmcsIHN0cmluZ1tdPlxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHQvL1NpbmdsZVZhbHVlIHwgTXVsdGlWYWx1ZSB8IFNpbmdsZVJhbmdlIHwgTXVsdGlSYW5nZSB8IFNlYXJjaEV4cHJlc3Npb24gfCBNdWx0aVJhbmdlT3JTZWFyY2hFeHByZXNzaW9uXG5cdFx0b1JldC5GaWx0ZXJBbGxvd2VkRXhwcmVzc2lvbnMgPSBtZXJnZU9iamVjdHMoXG5cdFx0XHR7fSxcblx0XHRcdG9SZXQuRmlsdGVyQWxsb3dlZEV4cHJlc3Npb25zIHx8IHt9LFxuXHRcdFx0b1BhcmVudFJldC5GaWx0ZXJBbGxvd2VkRXhwcmVzc2lvbnMgfHwge31cblx0XHQpIGFzIFJlY29yZDxzdHJpbmcsIHN0cmluZ1tdPjtcblxuXHRcdC8vU0VDT05EIEhJR0hFU1QgcHJpb3JpdHkgLSBOYXZpZ2F0aW9uIHJlc3RyaWN0aW9uc1xuXHRcdC8vZS5nLiBQYXJlbnQgXCIvQ3VzdG9tZXJcIiB3aXRoIE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGg9XCJTZXRcIiBDb250ZXh0UGF0aDogQ3VzdG9tZXIvU2V0XG5cdFx0Y29uc3Qgb05hdlJlc3RyaWN0aW9ucyA9IENvbW1vblV0aWxzLmdldE5hdmlnYXRpb25SZXN0cmljdGlvbnMob0NvbnRleHQsIHBhcmVudEVudGl0eVNldFBhdGgsIG5hdlBhdGgucmVwbGFjZUFsbChcIiUyRlwiLCBcIi9cIikpO1xuXHRcdGNvbnN0IG9OYXZGaWx0ZXJSZXN0ID0gb05hdlJlc3RyaWN0aW9ucyAmJiAob05hdlJlc3RyaWN0aW9uc1tcIkZpbHRlclJlc3RyaWN0aW9uc1wiXSBhcyBNZXRhTW9kZWxUeXBlPEZpbHRlclJlc3RyaWN0aW9uc1R5cGU+KTtcblx0XHRjb25zdCBuYXZSZXNSZXFQcm9wcyA9IGdldEZpbHRlclJlc3RyaWN0aW9ucyhvTmF2RmlsdGVyUmVzdCwgXCJSZXF1aXJlZFByb3BlcnRpZXNcIikgfHwgW107XG5cdFx0b1JldC5SZXF1aXJlZFByb3BlcnRpZXMgPSB1bmlxdWVTb3J0KG9SZXQuUmVxdWlyZWRQcm9wZXJ0aWVzLmNvbmNhdChuYXZSZXNSZXFQcm9wcykpO1xuXHRcdGNvbnN0IG5hdk5vbkZpbHRlclByb3BzID0gZ2V0RmlsdGVyUmVzdHJpY3Rpb25zKG9OYXZGaWx0ZXJSZXN0LCBcIk5vbkZpbHRlcmFibGVQcm9wZXJ0aWVzXCIpIHx8IFtdO1xuXHRcdG9SZXQuTm9uRmlsdGVyYWJsZVByb3BlcnRpZXMgPSB1bmlxdWVTb3J0KG9SZXQuTm9uRmlsdGVyYWJsZVByb3BlcnRpZXMuY29uY2F0KG5hdk5vbkZpbHRlclByb3BzKSk7XG5cdFx0Ly9TaW5nbGVWYWx1ZSB8IE11bHRpVmFsdWUgfCBTaW5nbGVSYW5nZSB8IE11bHRpUmFuZ2UgfCBTZWFyY2hFeHByZXNzaW9uIHwgTXVsdGlSYW5nZU9yU2VhcmNoRXhwcmVzc2lvblxuXHRcdG9SZXQuRmlsdGVyQWxsb3dlZEV4cHJlc3Npb25zID0gbWVyZ2VPYmplY3RzKFxuXHRcdFx0e30sXG5cdFx0XHRvUmV0LkZpbHRlckFsbG93ZWRFeHByZXNzaW9ucyB8fCB7fSxcblx0XHRcdGdldEZpbHRlckFsbG93ZWRFeHByZXNzaW9uKG9OYXZGaWx0ZXJSZXN0KSB8fCB7fVxuXHRcdCkgYXMgUmVjb3JkPHN0cmluZywgc3RyaW5nW10+O1xuXG5cdFx0Ly9ISUdIRVNUIHByaW9yaXR5IC0gUmVzdHJpY3Rpb25zIGhhdmluZyB0YXJnZXQgd2l0aCBuYXZpZ2F0aW9uIGFzc29jaWF0aW9uIGVudGl0eVxuXHRcdC8vIGUuZy4gRlIgaW4gXCJDdXN0b21lclBhcmFtZXRlcnMvU2V0XCIgQ29udGV4dFBhdGg6IFwiQ3VzdG9tZXIvU2V0XCJcblx0XHRjb25zdCBuYXZBc3NvY2lhdGlvbkVudGl0eVJlc3QgPSBvQ29udGV4dC5nZXRPYmplY3QoXG5cdFx0XHRgLyR7ZW50aXR5VHlwZVBhdGhQYXJ0cy5qb2luKFwiL1wiKX0ke2ZyVGVybX1gXG5cdFx0KSBhcyBNZXRhTW9kZWxUeXBlPEZpbHRlclJlc3RyaWN0aW9uc1R5cGU+O1xuXHRcdGNvbnN0IG5hdkFzc29jUmVxUHJvcHMgPSBnZXRGaWx0ZXJSZXN0cmljdGlvbnMobmF2QXNzb2NpYXRpb25FbnRpdHlSZXN0LCBcIlJlcXVpcmVkUHJvcGVydGllc1wiKSB8fCBbXTtcblx0XHRvUmV0LlJlcXVpcmVkUHJvcGVydGllcyA9IHVuaXF1ZVNvcnQob1JldC5SZXF1aXJlZFByb3BlcnRpZXMuY29uY2F0KG5hdkFzc29jUmVxUHJvcHMpKTtcblx0XHRjb25zdCBuYXZBc3NvY05vbkZpbHRlclByb3BzID0gZ2V0RmlsdGVyUmVzdHJpY3Rpb25zKG5hdkFzc29jaWF0aW9uRW50aXR5UmVzdCwgXCJOb25GaWx0ZXJhYmxlUHJvcGVydGllc1wiKSB8fCBbXTtcblx0XHRvUmV0Lk5vbkZpbHRlcmFibGVQcm9wZXJ0aWVzID0gdW5pcXVlU29ydChvUmV0Lk5vbkZpbHRlcmFibGVQcm9wZXJ0aWVzLmNvbmNhdChuYXZBc3NvY05vbkZpbHRlclByb3BzKSk7XG5cdFx0Ly9TaW5nbGVWYWx1ZSB8IE11bHRpVmFsdWUgfCBTaW5nbGVSYW5nZSB8IE11bHRpUmFuZ2UgfCBTZWFyY2hFeHByZXNzaW9uIHwgTXVsdGlSYW5nZU9yU2VhcmNoRXhwcmVzc2lvblxuXHRcdG9SZXQuRmlsdGVyQWxsb3dlZEV4cHJlc3Npb25zID0gbWVyZ2VPYmplY3RzKFxuXHRcdFx0e30sXG5cdFx0XHRvUmV0LkZpbHRlckFsbG93ZWRFeHByZXNzaW9ucyxcblx0XHRcdGdldEZpbHRlckFsbG93ZWRFeHByZXNzaW9uKG5hdkFzc29jaWF0aW9uRW50aXR5UmVzdCkgfHwge31cblx0XHQpIGFzIF9GaWx0ZXJBbGxvd2VkRXhwcmVzc2lvbnM7XG5cdH1cblx0cmV0dXJuIG9SZXQ7XG59XG5cbnR5cGUgUHJlcHJvY2Vzc29yU2V0dGluZ3MgPSB7XG5cdGJpbmRpbmdDb250ZXh0czogb2JqZWN0O1xuXHRtb2RlbHM6IG9iamVjdDtcbn07XG50eXBlIEJhc2VUcmVlTW9kaWZpZXIgPSB7XG5cdHRlbXBsYXRlQ29udHJvbEZyYWdtZW50KFxuXHRcdHNGcmFnbWVudE5hbWU6IHN0cmluZyxcblx0XHRtUHJlcHJvY2Vzc29yU2V0dGluZ3M6IFByZXByb2Nlc3NvclNldHRpbmdzLFxuXHRcdG9WaWV3PzogVmlld1xuXHQpOiBQcm9taXNlPFVJNUVsZW1lbnRbXSB8IEVsZW1lbnRbXT47XG5cdHRhcmdldHM6IHN0cmluZztcbn07XG5cbmFzeW5jIGZ1bmN0aW9uIHRlbXBsYXRlQ29udHJvbEZyYWdtZW50KFxuXHRzRnJhZ21lbnROYW1lOiBzdHJpbmcsXG5cdG9QcmVwcm9jZXNzb3JTZXR0aW5nczogUHJlcHJvY2Vzc29yU2V0dGluZ3MsXG5cdG9PcHRpb25zOiB7IHZpZXc/OiBWaWV3OyBpc1hNTD86IGJvb2xlYW47IGlkOiBzdHJpbmc7IGNvbnRyb2xsZXI6IENvbnRyb2xsZXIgfSxcblx0b01vZGlmaWVyPzogQmFzZVRyZWVNb2RpZmllclxuKTogUHJvbWlzZTxFbGVtZW50IHwgVUk1RWxlbWVudCB8IEVsZW1lbnRbXSB8IFVJNUVsZW1lbnRbXT4ge1xuXHRvT3B0aW9ucyA9IG9PcHRpb25zIHx8IHt9O1xuXHRpZiAob01vZGlmaWVyKSB7XG5cdFx0cmV0dXJuIG9Nb2RpZmllci50ZW1wbGF0ZUNvbnRyb2xGcmFnbWVudChzRnJhZ21lbnROYW1lLCBvUHJlcHJvY2Vzc29yU2V0dGluZ3MsIG9PcHRpb25zLnZpZXcpLnRoZW4oZnVuY3Rpb24gKG9GcmFnbWVudCkge1xuXHRcdFx0Ly8gVGhpcyBpcyByZXF1aXJlZCBhcyBGbGV4IHJldHVybnMgYW4gSFRNTENvbGxlY3Rpb24gYXMgdGVtcGxhdGluZyByZXN1bHQgaW4gWE1MIHRpbWUuXG5cdFx0XHRyZXR1cm4gb01vZGlmaWVyLnRhcmdldHMgPT09IFwieG1sVHJlZVwiICYmIG9GcmFnbWVudC5sZW5ndGggPiAwID8gb0ZyYWdtZW50WzBdIDogb0ZyYWdtZW50O1xuXHRcdH0pO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBsb2FkTWFjcm9MaWJyYXJ5KClcblx0XHRcdC50aGVuKGFzeW5jIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0cmV0dXJuIFhNTFByZXByb2Nlc3Nvci5wcm9jZXNzKFxuXHRcdFx0XHRcdFhNTFRlbXBsYXRlUHJvY2Vzc29yLmxvYWRUZW1wbGF0ZShzRnJhZ21lbnROYW1lLCBcImZyYWdtZW50XCIpLFxuXHRcdFx0XHRcdHsgbmFtZTogc0ZyYWdtZW50TmFtZSB9LFxuXHRcdFx0XHRcdG9QcmVwcm9jZXNzb3JTZXR0aW5nc1xuXHRcdFx0XHQpO1xuXHRcdFx0fSlcblx0XHRcdC50aGVuKGFzeW5jIGZ1bmN0aW9uIChvRnJhZ21lbnQ6IEVsZW1lbnQpOiBQcm9taXNlPEVsZW1lbnQgfCBDb250cm9sIHwgQ29udHJvbFtdPiB7XG5cdFx0XHRcdGNvbnN0IG9Db250cm9sID0gb0ZyYWdtZW50LmZpcnN0RWxlbWVudENoaWxkO1xuXHRcdFx0XHRpZiAoISFvT3B0aW9ucy5pc1hNTCAmJiBvQ29udHJvbCkge1xuXHRcdFx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUob0NvbnRyb2wpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBGcmFnbWVudC5sb2FkKHtcblx0XHRcdFx0XHRpZDogb09wdGlvbnMuaWQsXG5cdFx0XHRcdFx0ZGVmaW5pdGlvbjogb0ZyYWdtZW50IGFzIHVua25vd24gYXMgc3RyaW5nLFxuXHRcdFx0XHRcdGNvbnRyb2xsZXI6IG9PcHRpb25zLmNvbnRyb2xsZXJcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblx0fVxufVxuXG5mdW5jdGlvbiBnZXRTaW5nbGV0b25QYXRoKHBhdGg6IHN0cmluZywgbWV0YU1vZGVsOiBPRGF0YU1ldGFNb2RlbCk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG5cdGNvbnN0IHBhcnRzID0gcGF0aC5zcGxpdChcIi9cIikuZmlsdGVyKEJvb2xlYW4pLFxuXHRcdHByb3BlcnR5TmFtZSA9IHBhcnRzLnBvcCgpLFxuXHRcdG5hdmlnYXRpb25QYXRoID0gcGFydHMuam9pbihcIi9cIiksXG5cdFx0ZW50aXR5U2V0ID0gbmF2aWdhdGlvblBhdGggJiYgbWV0YU1vZGVsLmdldE9iamVjdChgLyR7bmF2aWdhdGlvblBhdGh9YCk7XG5cdGlmIChlbnRpdHlTZXQ/LiRraW5kID09PSBcIlNpbmdsZXRvblwiKSB7XG5cdFx0Y29uc3Qgc2luZ2xldG9uTmFtZSA9IHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdO1xuXHRcdHJldHVybiBgLyR7c2luZ2xldG9uTmFtZX0vJHtwcm9wZXJ0eU5hbWV9YDtcblx0fVxuXHRyZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5hc3luYyBmdW5jdGlvbiByZXF1ZXN0U2luZ2xldG9uUHJvcGVydHkocGF0aDogc3RyaW5nLCBtb2RlbDogT0RhdGFNb2RlbCkge1xuXHRpZiAoIXBhdGggfHwgIW1vZGVsKSB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShudWxsKTtcblx0fVxuXHRjb25zdCBtZXRhTW9kZWwgPSBtb2RlbC5nZXRNZXRhTW9kZWwoKTtcblx0Ly8gRmluZCB0aGUgdW5kZXJseWluZyBlbnRpdHkgc2V0IGZyb20gdGhlIHByb3BlcnR5IHBhdGggYW5kIGNoZWNrIHdoZXRoZXIgaXQgaXMgYSBzaW5nbGV0b24uXG5cdGNvbnN0IHJlc29sdmVkUGF0aCA9IGdldFNpbmdsZXRvblBhdGgocGF0aCwgbWV0YU1vZGVsKTtcblx0aWYgKHJlc29sdmVkUGF0aCkge1xuXHRcdGNvbnN0IHByb3BlcnR5QmluZGluZyA9IG1vZGVsLmJpbmRQcm9wZXJ0eShyZXNvbHZlZFBhdGgpO1xuXHRcdHJldHVybiBwcm9wZXJ0eUJpbmRpbmcucmVxdWVzdFZhbHVlKCk7XG5cdH1cblxuXHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG51bGwpO1xufVxuXG5mdW5jdGlvbiBhZGRFdmVudFRvQmluZGluZ0luZm8ob0NvbnRyb2w6IENvbnRyb2wsIHNFdmVudE5hbWU6IHN0cmluZywgZkhhbmRsZXI6IEZ1bmN0aW9uKSB7XG5cdGxldCBvQmluZGluZ0luZm86IEFnZ3JlZ2F0aW9uQmluZGluZ0luZm87XG5cdGNvbnN0IHNldEJpbmRpbmdJbmZvID0gZnVuY3Rpb24gKCkge1xuXHRcdGlmIChvQmluZGluZ0luZm8pIHtcblx0XHRcdGlmICghb0JpbmRpbmdJbmZvLmV2ZW50cykge1xuXHRcdFx0XHRvQmluZGluZ0luZm8uZXZlbnRzID0ge307XG5cdFx0XHR9XG5cdFx0XHRpZiAoIW9CaW5kaW5nSW5mby5ldmVudHNbc0V2ZW50TmFtZV0pIHtcblx0XHRcdFx0b0JpbmRpbmdJbmZvLmV2ZW50c1tzRXZlbnROYW1lXSA9IGZIYW5kbGVyO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc3QgZk9yaWdpbmFsSGFuZGxlciA9IG9CaW5kaW5nSW5mby5ldmVudHNbc0V2ZW50TmFtZV07XG5cdFx0XHRcdG9CaW5kaW5nSW5mby5ldmVudHNbc0V2ZW50TmFtZV0gPSBmdW5jdGlvbiAoLi4uYXJnczogdW5rbm93bltdKSB7XG5cdFx0XHRcdFx0ZkhhbmRsZXIuYXBwbHkodGhpcywgLi4uYXJncyk7XG5cdFx0XHRcdFx0Zk9yaWdpbmFsSGFuZGxlci5hcHBseSh0aGlzLCAuLi5hcmdzKTtcblx0XHRcdFx0fTtcblx0XHRcdH1cblx0XHR9XG5cdH07XG5cdGlmIChvQ29udHJvbC5pc0E8Q2hhcnQgJiBEZWxlZ2F0ZU1peGluPihcInNhcC51aS5tZGMuQ2hhcnRcIikpIHtcblx0XHRvQ29udHJvbFxuXHRcdFx0LmlubmVyQ2hhcnRCb3VuZCgpXG5cdFx0XHQudGhlbihmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdG9CaW5kaW5nSW5mbyA9IG9Db250cm9sLmdldENvbnRyb2xEZWxlZ2F0ZSgpLl9nZXRDaGFydChvQ29udHJvbCkuZ2V0QmluZGluZ0luZm8oXCJkYXRhXCIpO1xuXHRcdFx0XHRzZXRCaW5kaW5nSW5mbygpO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbiAoc0Vycm9yOiB1bmtub3duKSB7XG5cdFx0XHRcdExvZy5lcnJvcihzRXJyb3IgYXMgc3RyaW5nKTtcblx0XHRcdH0pO1xuXHR9IGVsc2Uge1xuXHRcdG9CaW5kaW5nSW5mbyA9IG9Db250cm9sLmRhdGEoXCJyb3dzQmluZGluZ0luZm9cIik7XG5cdFx0c2V0QmluZGluZ0luZm8oKTtcblx0fVxufVxuXG5hc3luYyBmdW5jdGlvbiBsb2FkTWFjcm9MaWJyYXJ5KCkge1xuXHRyZXR1cm4gbmV3IFByb21pc2U8dm9pZD4oZnVuY3Rpb24gKHJlc29sdmUpIHtcblx0XHRzYXAudWkucmVxdWlyZShbXCJzYXAvZmUvbWFjcm9zL21hY3JvTGlicmFyeVwiXSwgZnVuY3Rpb24gKC8qbWFjcm9MaWJyYXJ5Ki8pIHtcblx0XHRcdHJlc29sdmUoKTtcblx0XHR9KTtcblx0fSk7XG59XG5cbi8vIEdldCB0aGUgcGF0aCBmb3IgYWN0aW9uIHBhcmFtZXRlcnMgdGhhdCBpcyBuZWVkZWQgdG8gcmVhZCB0aGUgYW5ub3RhdGlvbnNcbmZ1bmN0aW9uIGdldFBhcmFtZXRlclBhdGgoc1BhdGg6IHN0cmluZywgc1BhcmFtZXRlcjogc3RyaW5nKSB7XG5cdGxldCBzQ29udGV4dDtcblx0aWYgKHNQYXRoLmluZGV4T2YoXCJAJHVpNS5vdmVybG9hZFwiKSA+IC0xKSB7XG5cdFx0c0NvbnRleHQgPSBzUGF0aC5zcGxpdChcIkAkdWk1Lm92ZXJsb2FkXCIpWzBdO1xuXHR9IGVsc2Uge1xuXHRcdC8vIEZvciBVbmJvdW5kIEFjdGlvbnMgaW4gQWN0aW9uIFBhcmFtZXRlciBEaWFsb2dzXG5cdFx0Y29uc3QgYUFjdGlvbiA9IHNQYXRoLnNwbGl0KFwiLzBcIilbMF0uc3BsaXQoXCIuXCIpO1xuXHRcdHNDb250ZXh0ID0gYC8ke2FBY3Rpb25bYUFjdGlvbi5sZW5ndGggLSAxXX0vYDtcblx0fVxuXHRyZXR1cm4gc0NvbnRleHQgKyBzUGFyYW1ldGVyO1xufVxuXG4vKipcbiAqIEdldCByZXNvbHZlZCBleHByZXNzaW9uIGJpbmRpbmcgdXNlZCBmb3IgdGV4dHMgYXQgcnVudGltZS5cbiAqXG4gKiBAcGFyYW0gZXhwQmluZGluZ1xuICogQHBhcmFtIGNvbnRyb2xcbiAqIEBmdW5jdGlvblxuICogQHN0YXRpY1xuICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLkNvbW1vblV0aWxzXG4gKiBAcmV0dXJucyBBIHN0cmluZyBhZnRlciByZXNvbHV0aW9uLlxuICogQHVpNS1yZXN0cmljdGVkXG4gKi9cbmZ1bmN0aW9uIF9mbnRyYW5zbGF0ZWRUZXh0RnJvbUV4cEJpbmRpbmdTdHJpbmcoZXhwQmluZGluZzogc3RyaW5nLCBjb250cm9sOiBDb250cm9sKSB7XG5cdC8vIFRoZSBpZGVhIGhlcmUgaXMgdG8gY3JlYXRlIGR1bW15IGVsZW1lbnQgd2l0aCB0aGUgZXhwcmVzaW9uIGJpbmRpbmcuXG5cdC8vIEFkZGluZyBpdCBhcyBkZXBlbmRlbnQgdG8gdGhlIHZpZXcvY29udHJvbCB3b3VsZCBwcm9wYWdhdGUgYWxsIHRoZSBtb2RlbHMgdG8gdGhlIGR1bW15IGVsZW1lbnQgYW5kIHJlc29sdmUgdGhlIGJpbmRpbmcuXG5cdC8vIFdlIHJlbW92ZSB0aGUgZHVtbXkgZWxlbWVudCBhZnRlciB0aGF0IGFuZCBkZXN0cm95IGl0LlxuXG5cdGNvbnN0IGFueVJlc291cmNlVGV4dCA9IG5ldyBBbnlFbGVtZW50KHsgYW55VGV4dDogZXhwQmluZGluZyB9KTtcblx0Y29udHJvbC5hZGREZXBlbmRlbnQoYW55UmVzb3VyY2VUZXh0KTtcblx0Y29uc3QgcmVzdWx0VGV4dCA9IGFueVJlc291cmNlVGV4dC5nZXRBbnlUZXh0KCk7XG5cdGNvbnRyb2wucmVtb3ZlRGVwZW5kZW50KGFueVJlc291cmNlVGV4dCk7XG5cdGFueVJlc291cmNlVGV4dC5kZXN0cm95KCk7XG5cblx0cmV0dXJuIHJlc3VsdFRleHQ7XG59XG4vKipcbiAqIENoZWNrIGlmIHRoZSBjdXJyZW50IGRldmljZSBoYXMgYSBzbWFsbCBzY3JlZW4uXG4gKlxuICogQHJldHVybnMgQSBCb29sZWFuLlxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gaXNTbWFsbERldmljZSgpIHtcblx0cmV0dXJuICFzeXN0ZW0uZGVza3RvcCB8fCBEZXZpY2UucmVzaXplLndpZHRoIDw9IDMyMDtcbn1cblxuZnVuY3Rpb24gZ2V0Q29udmVydGVyQ29udGV4dEZvclBhdGgoc01ldGFQYXRoOiBzdHJpbmcsIG9NZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsLCBzRW50aXR5U2V0OiBzdHJpbmcsIG9EaWFnbm9zdGljczogRGlhZ25vc3RpY3MpIHtcblx0Y29uc3Qgb0NvbnRleHQgPSBvTWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KHNNZXRhUGF0aCkgYXMgT0RhdGFWNENvbnRleHQ7XG5cdHJldHVybiBDb252ZXJ0ZXJDb250ZXh0Py5jcmVhdGVDb252ZXJ0ZXJDb250ZXh0Rm9yTWFjcm8oc0VudGl0eVNldCwgb0NvbnRleHQgfHwgb01ldGFNb2RlbCwgb0RpYWdub3N0aWNzLCBtZXJnZU9iamVjdHMsIHVuZGVmaW5lZCk7XG59XG5cbmNvbnN0IENvbW1vblV0aWxzID0ge1xuXHRpc1Byb3BlcnR5RmlsdGVyYWJsZTogaXNQcm9wZXJ0eUZpbHRlcmFibGUsXG5cdGlzRmllbGRDb250cm9sUGF0aEluYXBwbGljYWJsZTogaXNGaWVsZENvbnRyb2xQYXRoSW5hcHBsaWNhYmxlLFxuXHRyZW1vdmVTZW5zaXRpdmVEYXRhOiByZW1vdmVTZW5zaXRpdmVEYXRhLFxuXHRmaXJlQnV0dG9uUHJlc3M6IGZuRmlyZUJ1dHRvblByZXNzLFxuXHRnZXRUYXJnZXRWaWV3OiBnZXRUYXJnZXRWaWV3LFxuXHRnZXRDdXJyZW50UGFnZVZpZXc6IGdldEN1cnJlbnRQYWdlVmlldyxcblx0aGFzVHJhbnNpZW50Q29udGV4dDogZm5IYXNUcmFuc2llbnRDb250ZXh0cyxcblx0dXBkYXRlUmVsYXRlZEFwcHNEZXRhaWxzOiBmblVwZGF0ZVJlbGF0ZWRBcHBzRGV0YWlscyxcblx0cmVzb2x2ZVN0cmluZ3RvQm9vbGVhbjogZm5SZXNvbHZlU3RyaW5ndG9Cb29sZWFuLFxuXHRnZXRBcHBDb21wb25lbnQ6IGdldEFwcENvbXBvbmVudCxcblx0Z2V0TWFuZGF0b3J5RmlsdGVyRmllbGRzOiBmbkdldE1hbmRhdG9yeUZpbHRlckZpZWxkcyxcblx0Z2V0Q29udGV4dFBhdGhQcm9wZXJ0aWVzOiBmbkdldENvbnRleHRQYXRoUHJvcGVydGllcyxcblx0Z2V0UGFyYW1ldGVySW5mbzogZ2V0UGFyYW1ldGVySW5mbyxcblx0dXBkYXRlRGF0YUZpZWxkRm9ySUJOQnV0dG9uc1Zpc2liaWxpdHk6IGZuVXBkYXRlRGF0YUZpZWxkRm9ySUJOQnV0dG9uc1Zpc2liaWxpdHksXG5cdGdldFRyYW5zbGF0ZWRUZXh0OiBnZXRUcmFuc2xhdGVkVGV4dCxcblx0Z2V0RW50aXR5U2V0TmFtZTogZ2V0RW50aXR5U2V0TmFtZSxcblx0Z2V0QWN0aW9uUGF0aDogZ2V0QWN0aW9uUGF0aCxcblx0Y29tcHV0ZURpc3BsYXlNb2RlOiBjb21wdXRlRGlzcGxheU1vZGUsXG5cdGlzU3RpY2t5RWRpdE1vZGU6IGlzU3RpY2t5RWRpdE1vZGUsXG5cdGdldE9wZXJhdG9yc0ZvclByb3BlcnR5OiBnZXRPcGVyYXRvcnNGb3JQcm9wZXJ0eSxcblx0Z2V0T3BlcmF0b3JzRm9yRGF0ZVByb3BlcnR5OiBnZXRPcGVyYXRvcnNGb3JEYXRlUHJvcGVydHksXG5cdGdldE9wZXJhdG9yc0Zvckd1aWRQcm9wZXJ0eTogZ2V0T3BlcmF0b3JzRm9yR3VpZFByb3BlcnR5LFxuXHRhZGRTZWxlY3Rpb25WYXJpYW50VG9Db25kaXRpb25zOiBhZGRTZWxlY3Rpb25WYXJpYW50VG9Db25kaXRpb25zLFxuXHRhZGRFeHRlcm5hbFN0YXRlRmlsdGVyc1RvU2VsZWN0aW9uVmFyaWFudDogYWRkRXh0ZXJuYWxTdGF0ZUZpbHRlcnNUb1NlbGVjdGlvblZhcmlhbnQsXG5cdGFkZFBhZ2VDb250ZXh0VG9TZWxlY3Rpb25WYXJpYW50OiBhZGRQYWdlQ29udGV4dFRvU2VsZWN0aW9uVmFyaWFudCxcblx0YWRkRGVmYXVsdERpc3BsYXlDdXJyZW5jeTogYWRkRGVmYXVsdERpc3BsYXlDdXJyZW5jeSxcblx0Z2V0Tm9uQ29tcHV0ZWRWaXNpYmxlRmllbGRzOiBnZXROb25Db21wdXRlZFZpc2libGVGaWVsZHMsXG5cdHNldFVzZXJEZWZhdWx0czogc2V0VXNlckRlZmF1bHRzLFxuXHRnZXRTaGVsbFNlcnZpY2VzOiBnZXRTaGVsbFNlcnZpY2VzLFxuXHRnZXRIYXNoOiBnZXRIYXNoLFxuXHRnZXRJQk5BY3Rpb25zOiBmbkdldElCTkFjdGlvbnMsXG5cdGdldEhlYWRlckZhY2V0SXRlbUNvbmZpZ0ZvckV4dGVybmFsTmF2aWdhdGlvbjogZ2V0SGVhZGVyRmFjZXRJdGVtQ29uZmlnRm9yRXh0ZXJuYWxOYXZpZ2F0aW9uLFxuXHRnZXRTZW1hbnRpY09iamVjdE1hcHBpbmc6IGdldFNlbWFudGljT2JqZWN0TWFwcGluZyxcblx0c2V0U2VtYW50aWNPYmplY3RNYXBwaW5nczogc2V0U2VtYW50aWNPYmplY3RNYXBwaW5ncyxcblx0Z2V0U2VtYW50aWNPYmplY3RQcm9taXNlOiBmbkdldFNlbWFudGljT2JqZWN0UHJvbWlzZSxcblx0Z2V0U2VtYW50aWNUYXJnZXRzRnJvbVBhZ2VNb2RlbDogZm5HZXRTZW1hbnRpY1RhcmdldHNGcm9tUGFnZU1vZGVsLFxuXHRnZXRTZW1hbnRpY09iamVjdHNGcm9tUGF0aDogZm5HZXRTZW1hbnRpY09iamVjdHNGcm9tUGF0aCxcblx0dXBkYXRlU2VtYW50aWNUYXJnZXRzOiBmblVwZGF0ZVNlbWFudGljVGFyZ2V0c01vZGVsLFxuXHRnZXRQcm9wZXJ0eURhdGFUeXBlOiBnZXRQcm9wZXJ0eURhdGFUeXBlLFxuXHR3YWl0Rm9yQ29udGV4dFJlcXVlc3RlZDogd2FpdEZvckNvbnRleHRSZXF1ZXN0ZWQsXG5cdGdldE5hdmlnYXRpb25SZXN0cmljdGlvbnM6IGdldE5hdmlnYXRpb25SZXN0cmljdGlvbnMsXG5cdGdldFNlYXJjaFJlc3RyaWN0aW9uczogZ2V0U2VhcmNoUmVzdHJpY3Rpb25zLFxuXHRnZXRGaWx0ZXJSZXN0cmljdGlvbnNCeVBhdGg6IGdldEZpbHRlclJlc3RyaWN0aW9uc0J5UGF0aCxcblx0Z2V0U3BlY2lmaWNBbGxvd2VkRXhwcmVzc2lvbjogZ2V0U3BlY2lmaWNBbGxvd2VkRXhwcmVzc2lvbixcblx0Z2V0QWRkaXRpb25hbFBhcmFtc0ZvckNyZWF0ZTogZ2V0QWRkaXRpb25hbFBhcmFtc0ZvckNyZWF0ZSxcblx0cmVxdWVzdFNpbmdsZXRvblByb3BlcnR5OiByZXF1ZXN0U2luZ2xldG9uUHJvcGVydHksXG5cdHRlbXBsYXRlQ29udHJvbEZyYWdtZW50OiB0ZW1wbGF0ZUNvbnRyb2xGcmFnbWVudCxcblx0YWRkRXZlbnRUb0JpbmRpbmdJbmZvOiBhZGRFdmVudFRvQmluZGluZ0luZm8sXG5cdEZpbHRlclJlc3RyaWN0aW9uczoge1xuXHRcdFJFUVVJUkVEX1BST1BFUlRJRVM6IFwiUmVxdWlyZWRQcm9wZXJ0aWVzXCIsXG5cdFx0Tk9OX0ZJTFRFUkFCTEVfUFJPUEVSVElFUzogXCJOb25GaWx0ZXJhYmxlUHJvcGVydGllc1wiLFxuXHRcdEFMTE9XRURfRVhQUkVTU0lPTlM6IFwiRmlsdGVyQWxsb3dlZEV4cHJlc3Npb25zXCJcblx0fSxcblx0QWxsb3dlZEV4cHJlc3Npb25zUHJpbzogW1wiU2luZ2xlVmFsdWVcIiwgXCJNdWx0aVZhbHVlXCIsIFwiU2luZ2xlUmFuZ2VcIiwgXCJNdWx0aVJhbmdlXCIsIFwiU2VhcmNoRXhwcmVzc2lvblwiLCBcIk11bHRpUmFuZ2VPclNlYXJjaEV4cHJlc3Npb25cIl0sXG5cdG5vcm1hbGl6ZVNlYXJjaFRlcm06IG5vcm1hbGl6ZVNlYXJjaFRlcm0sXG5cdGdldFNpbmdsZXRvblBhdGg6IGdldFNpbmdsZXRvblBhdGgsXG5cdGdldFJlcXVpcmVkUHJvcGVydGllc0Zyb21VcGRhdGVSZXN0cmljdGlvbnM6IGdldFJlcXVpcmVkUHJvcGVydGllc0Zyb21VcGRhdGVSZXN0cmljdGlvbnMsXG5cdGdldFJlcXVpcmVkUHJvcGVydGllc0Zyb21JbnNlcnRSZXN0cmljdGlvbnM6IGdldFJlcXVpcmVkUHJvcGVydGllc0Zyb21JbnNlcnRSZXN0cmljdGlvbnMsXG5cdGhhc1Jlc3RyaWN0ZWRQcm9wZXJ0aWVzSW5Bbm5vdGF0aW9uczogaGFzUmVzdHJpY3RlZFByb3BlcnRpZXNJbkFubm90YXRpb25zLFxuXHRnZXRSZXF1aXJlZFByb3BlcnRpZXNGcm9tQW5ub3RhdGlvbnM6IGdldFJlcXVpcmVkUHJvcGVydGllc0Zyb21Bbm5vdGF0aW9ucyxcblx0Z2V0UmVxdWlyZWRQcm9wZXJ0aWVzOiBnZXRSZXF1aXJlZFByb3BlcnRpZXMsXG5cdGNoZWNrSWZSZXNvdXJjZUtleUV4aXN0czogY2hlY2tJZlJlc291cmNlS2V5RXhpc3RzLFxuXHRzZXRDb250ZXh0c0Jhc2VkT25PcGVyYXRpb25BdmFpbGFibGU6IHNldENvbnRleHRzQmFzZWRPbk9wZXJhdGlvbkF2YWlsYWJsZSxcblx0c2V0RHluYW1pY0FjdGlvbkNvbnRleHRzOiBzZXREeW5hbWljQWN0aW9uQ29udGV4dHMsXG5cdHJlcXVlc3RQcm9wZXJ0eTogcmVxdWVzdFByb3BlcnR5LFxuXHRnZXRQYXJhbWV0ZXJQYXRoOiBnZXRQYXJhbWV0ZXJQYXRoLFxuXHRnZXRSZWxhdGVkQXBwc01lbnVJdGVtczogX2dldFJlbGF0ZWRBcHBzTWVudUl0ZW1zLFxuXHRnZXRUcmFuc2xhdGVkVGV4dEZyb21FeHBCaW5kaW5nU3RyaW5nOiBfZm50cmFuc2xhdGVkVGV4dEZyb21FeHBCaW5kaW5nU3RyaW5nLFxuXHRhZGRTZW1hbnRpY0RhdGVzVG9Db25kaXRpb25zOiBhZGRTZW1hbnRpY0RhdGVzVG9Db25kaXRpb25zLFxuXHRhZGRTZWxlY3RPcHRpb25Ub0NvbmRpdGlvbnM6IGFkZFNlbGVjdE9wdGlvblRvQ29uZGl0aW9ucyxcblx0Y3JlYXRlU2VtYW50aWNEYXRlc0Zyb21Db25kaXRpb25zOiBjcmVhdGVTZW1hbnRpY0RhdGVzRnJvbUNvbmRpdGlvbnMsXG5cdHVwZGF0ZVJlbGF0ZUFwcHNNb2RlbDogdXBkYXRlUmVsYXRlQXBwc01vZGVsLFxuXHRnZXRTZW1hbnRpY09iamVjdEFubm90YXRpb25zOiBfZ2V0U2VtYW50aWNPYmplY3RBbm5vdGF0aW9ucyxcblx0aXNDdXN0b21BZ2dyZWdhdGU6IF9pc0N1c3RvbUFnZ3JlZ2F0ZSxcblx0aXNTbWFsbERldmljZSxcblx0Z2V0Q29udmVydGVyQ29udGV4dEZvclBhdGhcbn07XG5cbmV4cG9y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