/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/deepClone", "sap/base/util/deepEqual", "sap/base/util/isPlainObject", "sap/fe/core/CommonUtils", "sap/fe/core/helpers/KeepAliveHelper", "sap/fe/core/helpers/ToES6Promise", "sap/fe/core/templating/SemanticObjectHelper", "sap/fe/macros/field/FieldHelper", "sap/fe/macros/field/FieldRuntime", "sap/fe/navigation/SelectionVariant", "sap/ui/core/Core", "sap/ui/core/Fragment", "sap/ui/core/util/XMLPreprocessor", "sap/ui/core/XMLTemplateProcessor", "sap/ui/mdc/link/Factory", "sap/ui/mdc/link/LinkItem", "sap/ui/mdc/link/SemanticObjectMapping", "sap/ui/mdc/link/SemanticObjectMappingItem", "sap/ui/mdc/link/SemanticObjectUnavailableAction", "sap/ui/mdc/LinkDelegate", "sap/ui/model/json/JSONModel"], function (Log, deepClone, deepEqual, isPlainObject, CommonUtils, KeepAliveHelper, toES6Promise, SemanticObjectHelper, FieldHelper, FieldRuntime, SelectionVariant, Core, Fragment, XMLPreprocessor, XMLTemplateProcessor, Factory, LinkItem, SemanticObjectMapping, SemanticObjectMappingItem, SemanticObjectUnavailableAction, LinkDelegate, JSONModel) {
  "use strict";

  var getDynamicPathFromSemanticObject = SemanticObjectHelper.getDynamicPathFromSemanticObject;
  const SimpleLinkDelegate = Object.assign({}, LinkDelegate);
  const CONSTANTS = {
    iLinksShownInPopup: 3,
    sapmLink: "sap.m.Link",
    sapuimdcLink: "sap.ui.mdc.Link",
    sapuimdclinkLinkItem: "sap.ui.mdc.link.LinkItem",
    sapmObjectIdentifier: "sap.m.ObjectIdentifier",
    sapmObjectStatus: "sap.m.ObjectStatus"
  };
  SimpleLinkDelegate.getConstants = function () {
    return CONSTANTS;
  };
  /**
   * This will return an array of the SemanticObjects as strings given by the payload.
   *
   * @private
   * @param oPayload The payload defined by the application
   * @param oMetaModel The ODataMetaModel received from the Link
   * @returns The context pointing to the current EntityType.
   */
  SimpleLinkDelegate._getEntityType = function (oPayload, oMetaModel) {
    if (oMetaModel) {
      return oMetaModel.createBindingContext(oPayload.entityType);
    } else {
      return undefined;
    }
  };
  /**
   * This will return an array of the SemanticObjects as strings given by the payload.
   *
   * @private
   * @param oPayload The payload defined by the application
   * @param oMetaModel The ODataMetaModel received from the Link
   * @returns A model containing the payload information
   */
  SimpleLinkDelegate._getSemanticsModel = function (oPayload, oMetaModel) {
    if (oMetaModel) {
      return new JSONModel(oPayload);
    } else {
      return undefined;
    }
  };
  /**
   * This will return an array of the SemanticObjects as strings given by the payload.
   *
   * @private
   * @param oPayload The payload defined by the application
   * @param oMetaModel The ODataMetaModel received from the Link
   * @returns An array containing SemanticObjects based of the payload
   */
  SimpleLinkDelegate._getDataField = function (oPayload, oMetaModel) {
    return oMetaModel.createBindingContext(oPayload.dataField);
  };
  /**
   * This will return an array of the SemanticObjects as strings given by the payload.
   *
   * @private
   * @param oPayload The payload defined by the application
   * @param oMetaModel The ODataMetaModel received from the Link
   * @returns Ancontaining SemanticObjects based of the payload
   */
  SimpleLinkDelegate._getContact = function (oPayload, oMetaModel) {
    return oMetaModel.createBindingContext(oPayload.contact);
  };
  SimpleLinkDelegate.fnTemplateFragment = function () {
    let sFragmentName, titleLinkHref;
    const oFragmentModel = {};
    let oPayloadToUse;

    // payload has been modified by fetching Semantic Objects names with path
    if (this.resolvedpayload) {
      oPayloadToUse = this.resolvedpayload;
    } else {
      oPayloadToUse = this.payload;
    }
    if (oPayloadToUse && !oPayloadToUse.LinkId) {
      oPayloadToUse.LinkId = this.oControl && this.oControl.isA(CONSTANTS.sapuimdcLink) ? this.oControl.getId() : undefined;
    }
    if (oPayloadToUse.LinkId) {
      titleLinkHref = this.oControl.getModel("$sapuimdcLink").getProperty("/titleLinkHref");
      oPayloadToUse.titlelink = titleLinkHref;
    }
    const oSemanticsModel = this._getSemanticsModel(oPayloadToUse, this.oMetaModel);
    this.semanticModel = oSemanticsModel;
    if (oPayloadToUse.entityType && this._getEntityType(oPayloadToUse, this.oMetaModel)) {
      sFragmentName = "sap.fe.macros.quickView.fragments.EntityQuickView";
      oFragmentModel.bindingContexts = {
        entityType: this._getEntityType(oPayloadToUse, this.oMetaModel),
        semantic: oSemanticsModel.createBindingContext("/")
      };
      oFragmentModel.models = {
        entityType: this.oMetaModel,
        semantic: oSemanticsModel
      };
    } else if (oPayloadToUse.dataField && this._getDataField(oPayloadToUse, this.oMetaModel)) {
      sFragmentName = "sap.fe.macros.quickView.fragments.DataFieldQuickView";
      oFragmentModel.bindingContexts = {
        dataField: this._getDataField(oPayloadToUse, this.oMetaModel),
        semantic: oSemanticsModel.createBindingContext("/")
      };
      oFragmentModel.models = {
        dataField: this.oMetaModel,
        semantic: oSemanticsModel
      };
    }
    oFragmentModel.models.entitySet = this.oMetaModel;
    oFragmentModel.models.metaModel = this.oMetaModel;
    if (this.oControl && this.oControl.getModel("viewData")) {
      oFragmentModel.models.viewData = this.oControl.getModel("viewData");
      oFragmentModel.bindingContexts.viewData = this.oControl.getModel("viewData").createBindingContext("/");
    }
    const oFragment = XMLTemplateProcessor.loadTemplate(sFragmentName, "fragment");
    return Promise.resolve(XMLPreprocessor.process(oFragment, {
      name: sFragmentName
    }, oFragmentModel)).then(_internalFragment => {
      return Fragment.load({
        definition: _internalFragment,
        controller: this
      });
    }).then(oPopoverContent => {
      if (oPopoverContent) {
        if (oFragmentModel.models && oFragmentModel.models.semantic) {
          oPopoverContent.setModel(oFragmentModel.models.semantic, "semantic");
          oPopoverContent.setBindingContext(oFragmentModel.bindingContexts.semantic, "semantic");
        }
        if (oFragmentModel.bindingContexts && oFragmentModel.bindingContexts.entityType) {
          oPopoverContent.setModel(oFragmentModel.models.entityType, "entityType");
          oPopoverContent.setBindingContext(oFragmentModel.bindingContexts.entityType, "entityType");
        }
      }
      this.resolvedpayload = undefined;
      return oPopoverContent;
    });
  };
  SimpleLinkDelegate.fetchAdditionalContent = function (oPayLoad, oMdcLinkControl) {
    var _oPayLoad$navigationP;
    this.oControl = oMdcLinkControl;
    const aNavigateRegexpMatch = oPayLoad === null || oPayLoad === void 0 ? void 0 : (_oPayLoad$navigationP = oPayLoad.navigationPath) === null || _oPayLoad$navigationP === void 0 ? void 0 : _oPayLoad$navigationP.match(/{(.*?)}/);
    const oBindingContext = aNavigateRegexpMatch && aNavigateRegexpMatch.length > 1 && aNavigateRegexpMatch[1] ? oMdcLinkControl.getModel().bindContext(aNavigateRegexpMatch[1], oMdcLinkControl.getBindingContext(), {
      $$ownRequest: true
    }) : null;
    this.payload = oPayLoad;
    if (oMdcLinkControl && oMdcLinkControl.isA(CONSTANTS.sapuimdcLink)) {
      this.oMetaModel = oMdcLinkControl.getModel().getMetaModel();
      return this.fnTemplateFragment().then(function (oPopoverContent) {
        if (oBindingContext) {
          oPopoverContent.setBindingContext(oBindingContext.getBoundContext());
        }
        return [oPopoverContent];
      });
    }
    return Promise.resolve([]);
  };
  SimpleLinkDelegate._fetchLinkCustomData = function (_oLink) {
    if (_oLink.getParent() && _oLink.isA(CONSTANTS.sapuimdcLink) && (_oLink.getParent().isA(CONSTANTS.sapmLink) || _oLink.getParent().isA(CONSTANTS.sapmObjectIdentifier) || _oLink.getParent().isA(CONSTANTS.sapmObjectStatus))) {
      return _oLink.getCustomData();
    } else {
      return undefined;
    }
  };
  /**
   * Fetches the relevant {@link sap.ui.mdc.link.LinkItem} for the Link and returns them.
   *
   * @public
   * @param oPayload The Payload of the Link given by the application
   * @param oBindingContext The ContextObject of the Link
   * @param oInfoLog The InfoLog of the Link
   * @returns Once resolved an array of {@link sap.ui.mdc.link.LinkItem} is returned
   */
  SimpleLinkDelegate.fetchLinkItems = function (oPayload, oBindingContext, oInfoLog) {
    if (oBindingContext && SimpleLinkDelegate._getSemanticObjects(oPayload)) {
      const oContextObject = oBindingContext.getObject();
      if (oInfoLog) {
        oInfoLog.initialize(SimpleLinkDelegate._getSemanticObjects(oPayload));
      }
      const _oLinkCustomData = this._link && this._fetchLinkCustomData(this._link);
      this.aLinkCustomData = _oLinkCustomData && this._fetchLinkCustomData(this._link).map(function (linkItem) {
        return linkItem.mProperties.value;
      });
      const oSemanticAttributesResolved = SimpleLinkDelegate._calculateSemanticAttributes(oContextObject, oPayload, oInfoLog, this._link);
      const oSemanticAttributes = oSemanticAttributesResolved.results;
      const oPayloadResolved = oSemanticAttributesResolved.payload;
      return SimpleLinkDelegate._retrieveNavigationTargets("", oSemanticAttributes, oPayloadResolved, oInfoLog, this._link).then(function (aLinks) {
        return aLinks.length === 0 ? null : aLinks;
      });
    } else {
      return Promise.resolve(null);
    }
  };

  /**
   * Find the type of the link.
   *
   * @param payload The payload of the mdc link.
   * @param aLinkItems Links returned by call to mdc _retrieveUnmodifiedLinkItems.
   * @returns The type of the link as defined by mdc.
   */
  SimpleLinkDelegate._findLinkType = function (payload, aLinkItems) {
    let nLinkType, oLinkItem;
    if ((aLinkItems === null || aLinkItems === void 0 ? void 0 : aLinkItems.length) === 1) {
      oLinkItem = new LinkItem({
        text: aLinkItems[0].getText(),
        href: aLinkItems[0].getHref()
      });
      nLinkType = payload.hasQuickViewFacets === "false" ? 1 : 2;
    } else if (payload.hasQuickViewFacets === "false" && (aLinkItems === null || aLinkItems === void 0 ? void 0 : aLinkItems.length) === 0) {
      nLinkType = 0;
    } else {
      nLinkType = 2;
    }
    return {
      linkType: nLinkType,
      linkItem: oLinkItem
    };
  };
  SimpleLinkDelegate.fetchLinkType = async function (oPayload, oLink) {
    const _oCurrentLink = oLink;
    const _oPayload = Object.assign({}, oPayload);
    const oDefaultInitialType = {
      initialType: {
        type: 2,
        directLink: undefined
      },
      runtimeType: undefined
    };
    // clean appStateKeyMap storage
    if (!this.appStateKeyMap) {
      this.appStateKeyMap = {};
    }
    try {
      var _oPayload$contact;
      if (_oPayload !== null && _oPayload !== void 0 && _oPayload.semanticObjects) {
        this._link = oLink;
        const aLinkItems = await _oCurrentLink._retrieveUnmodifiedLinkItems();
        const _LinkType = SimpleLinkDelegate._findLinkType(_oPayload, aLinkItems);
        return {
          initialType: {
            type: _LinkType.linkType,
            directLink: _LinkType.linkItem ? _LinkType.linkItem : undefined
          },
          runtimeType: undefined
        };
      } else if ((_oPayload === null || _oPayload === void 0 ? void 0 : (_oPayload$contact = _oPayload.contact) === null || _oPayload$contact === void 0 ? void 0 : _oPayload$contact.length) > 0) {
        return oDefaultInitialType;
      } else if (_oPayload !== null && _oPayload !== void 0 && _oPayload.entityType && _oPayload !== null && _oPayload !== void 0 && _oPayload.navigationPath) {
        return oDefaultInitialType;
      }
      throw new Error("no payload or semanticObjects found");
    } catch (oError) {
      Log.error("Error in SimpleLinkDelegate.fetchLinkType: ", oError);
    }
  };
  SimpleLinkDelegate._RemoveTitleLinkFromTargets = function (_aLinkItems, _bTitleHasLink, _aTitleLink) {
    let _sTitleLinkHref, _oMDCLink;
    let bResult = false;
    if (_bTitleHasLink && _aTitleLink && _aTitleLink[0]) {
      let linkIsPrimaryAction, _sLinkIntentWithoutParameters;
      const _sTitleIntent = _aTitleLink[0].intent.split("?")[0];
      if (_aLinkItems && _aLinkItems[0]) {
        _sLinkIntentWithoutParameters = `#${_aLinkItems[0].getProperty("key")}`;
        linkIsPrimaryAction = _sTitleIntent === _sLinkIntentWithoutParameters;
        if (linkIsPrimaryAction) {
          _sTitleLinkHref = _aLinkItems[0].getProperty("href");
          this.payload.titlelinkhref = _sTitleLinkHref;
          if (_aLinkItems[0].isA(CONSTANTS.sapuimdclinkLinkItem)) {
            _oMDCLink = _aLinkItems[0].getParent();
            _oMDCLink.getModel("$sapuimdcLink").setProperty("/titleLinkHref", _sTitleLinkHref);
            const aMLinkItems = _oMDCLink.getModel("$sapuimdcLink").getProperty("/linkItems").filter(function (oLinkItem) {
              if (`#${oLinkItem.key}` !== _sLinkIntentWithoutParameters) {
                return oLinkItem;
              }
            });
            if (aMLinkItems && aMLinkItems.length > 0) {
              _oMDCLink.getModel("$sapuimdcLink").setProperty("/linkItems/", aMLinkItems);
            }
            bResult = true;
          }
        }
      }
    }
    return bResult;
  };
  SimpleLinkDelegate._IsSemanticObjectDynamic = function (aNewLinkCustomData, oThis) {
    if (aNewLinkCustomData && oThis.aLinkCustomData) {
      return oThis.aLinkCustomData.filter(function (link) {
        return aNewLinkCustomData.filter(function (otherLink) {
          return otherLink !== link;
        }).length > 0;
      }).length > 0;
    } else {
      return false;
    }
  };
  SimpleLinkDelegate._getLineContext = function (oView, mLineContext) {
    if (!mLineContext) {
      if (oView.getAggregation("content")[0] && oView.getAggregation("content")[0].getBindingContext()) {
        return oView.getAggregation("content")[0].getBindingContext();
      }
    }
    return mLineContext;
  };
  SimpleLinkDelegate._setFilterContextUrlForSelectionVariant = function (oView, oSelectionVariant, oNavigationService) {
    if (oView.getViewData().entitySet && oSelectionVariant) {
      const sContextUrl = oNavigationService.constructContextUrl(oView.getViewData().entitySet, oView.getModel());
      oSelectionVariant.setFilterContextUrl(sContextUrl);
    }
    return oSelectionVariant;
  };
  SimpleLinkDelegate._setObjectMappings = function (sSemanticObject, oParams, aSemanticObjectMappings, oSelectionVariant) {
    let hasChanged = false;
    const modifiedSelectionVariant = new SelectionVariant(oSelectionVariant.toJSONObject());
    // if semanticObjectMappings has items with dynamic semanticObjects we need to resolve them using oParams
    aSemanticObjectMappings.forEach(function (mapping) {
      let mappingSemanticObject = mapping.semanticObject;
      const mappingSemanticObjectPath = getDynamicPathFromSemanticObject(mapping.semanticObject);
      if (mappingSemanticObjectPath && oParams[mappingSemanticObjectPath]) {
        mappingSemanticObject = oParams[mappingSemanticObjectPath];
      }
      if (sSemanticObject === mappingSemanticObject) {
        const oMappings = mapping.items;
        for (const i in oMappings) {
          const sLocalProperty = oMappings[i].key;
          const sSemanticObjectProperty = oMappings[i].value;
          if (sLocalProperty !== sSemanticObjectProperty) {
            if (oParams[sLocalProperty]) {
              modifiedSelectionVariant.removeParameter(sSemanticObjectProperty);
              modifiedSelectionVariant.removeSelectOption(sSemanticObjectProperty);
              modifiedSelectionVariant.renameParameter(sLocalProperty, sSemanticObjectProperty);
              modifiedSelectionVariant.renameSelectOption(sLocalProperty, sSemanticObjectProperty);
              oParams[sSemanticObjectProperty] = oParams[sLocalProperty];
              delete oParams[sLocalProperty];
              hasChanged = true;
            }
            // We remove the parameter as there is no value

            // The local property comes from a navigation property
            else if (sLocalProperty.split("/").length > 1) {
              // find the property to be removed
              const propertyToBeRemoved = sLocalProperty.split("/").slice(-1)[0];
              // The navigation property has no value
              if (!oParams[propertyToBeRemoved]) {
                delete oParams[propertyToBeRemoved];
                modifiedSelectionVariant.removeParameter(propertyToBeRemoved);
                modifiedSelectionVariant.removeSelectOption(propertyToBeRemoved);
              } else if (propertyToBeRemoved !== sSemanticObjectProperty) {
                // The navigation property has a value and properties names are different
                modifiedSelectionVariant.renameParameter(propertyToBeRemoved, sSemanticObjectProperty);
                modifiedSelectionVariant.renameSelectOption(propertyToBeRemoved, sSemanticObjectProperty);
                oParams[sSemanticObjectProperty] = oParams[propertyToBeRemoved];
                delete oParams[propertyToBeRemoved];
              }
            } else {
              delete oParams[sLocalProperty];
              modifiedSelectionVariant.removeParameter(sSemanticObjectProperty);
              modifiedSelectionVariant.removeSelectOption(sSemanticObjectProperty);
            }
          }
        }
      }
    });
    return {
      params: oParams,
      hasChanged,
      selectionVariant: modifiedSelectionVariant
    };
  };

  /**
   * Call getAppStateKeyAndUrlParameters in navigation service and cache its results.
   *
   * @param _this The instance of quickviewdelegate.
   * @param navigationService The navigation service.
   * @param selectionVariant The current selection variant.
   * @param semanticObject The current semanticObject.
   */
  SimpleLinkDelegate._getAppStateKeyAndUrlParameters = async function (_this, navigationService, selectionVariant, semanticObject) {
    var _this$appStateKeyMap$;
    let aValues = [];

    // check if default cache contains already the unmodified selectionVariant
    if (deepEqual(selectionVariant, (_this$appStateKeyMap$ = _this.appStateKeyMap[""]) === null || _this$appStateKeyMap$ === void 0 ? void 0 : _this$appStateKeyMap$.selectionVariant)) {
      const defaultCache = _this.appStateKeyMap[""];
      return [defaultCache.semanticAttributes, defaultCache.appstatekey];
    }
    // update url parameters because there is a change in selection variant
    if (_this.appStateKeyMap[`${semanticObject}`] === undefined || !deepEqual(_this.appStateKeyMap[`${semanticObject}`].selectionVariant, selectionVariant)) {
      aValues = await toES6Promise(navigationService.getAppStateKeyAndUrlParameters(selectionVariant.toJSONString()));
      _this.appStateKeyMap[`${semanticObject}`] = {
        semanticAttributes: aValues[0],
        appstatekey: aValues[1],
        selectionVariant: selectionVariant
      };
    } else {
      const cache = _this.appStateKeyMap[`${semanticObject}`];
      aValues = [cache.semanticAttributes, cache.appstatekey];
    }
    return aValues;
  };
  SimpleLinkDelegate._getLinkItemWithNewParameter = async function (_that, _bTitleHasLink, _aTitleLink, _oLinkItem, _oShellServices, _oPayload, _oParams, _sAppStateKey, _oSelectionVariant, _oNavigationService) {
    return _oShellServices.expandCompactHash(_oLinkItem.getHref()).then(async function (sHash) {
      const oShellHash = _oShellServices.parseShellHash(sHash);
      const params = Object.assign({}, _oParams);
      const {
        params: oNewParams,
        hasChanged,
        selectionVariant: newSelectionVariant
      } = SimpleLinkDelegate._setObjectMappings(oShellHash.semanticObject, params, _oPayload.semanticObjectMappings, _oSelectionVariant);
      if (hasChanged) {
        const aValues = await SimpleLinkDelegate._getAppStateKeyAndUrlParameters(_that, _oNavigationService, newSelectionVariant, oShellHash.semanticObject);
        _sAppStateKey = aValues[1];
      }
      const oNewShellHash = {
        target: {
          semanticObject: oShellHash.semanticObject,
          action: oShellHash.action
        },
        params: oNewParams,
        appStateKey: _sAppStateKey
      };
      delete oNewShellHash.params["sap-xapp-state"];
      _oLinkItem.setHref(`#${_oShellServices.constructShellHash(oNewShellHash)}`);
      _oPayload.aSemanticLinks.push(_oLinkItem.getHref());
      // The link is removed from the target list because the title link has same target.
      return SimpleLinkDelegate._RemoveTitleLinkFromTargets.bind(_that)([_oLinkItem], _bTitleHasLink, _aTitleLink);
    });
  };
  SimpleLinkDelegate._removeEmptyLinkItem = function (aLinkItems) {
    return aLinkItems.filter(linkItem => {
      return linkItem !== undefined;
    });
  };
  /**
   * Enables the modification of LinkItems before the popover opens. This enables additional parameters
   * to be added to the link.
   *
   * @param oPayload The payload of the Link given by the application
   * @param oBindingContext The binding context of the Link
   * @param aLinkItems The LinkItems of the Link that can be modified
   * @returns Once resolved an array of {@link sap.ui.mdc.link.LinkItem} is returned
   */
  SimpleLinkDelegate.modifyLinkItems = async function (oPayload, oBindingContext, aLinkItems) {
    const primaryActionIsActive = await FieldHelper.checkPrimaryActions(oPayload, true);
    const aTitleLink = primaryActionIsActive.titleLink;
    const bTitleHasLink = primaryActionIsActive.hasTitleLink;
    if (aLinkItems.length !== 0) {
      this.payload = oPayload;
      const oLink = aLinkItems[0].getParent();
      const oView = CommonUtils.getTargetView(oLink);
      const oAppComponent = CommonUtils.getAppComponent(oView);
      const oShellServices = oAppComponent.getShellServices();
      if (!oShellServices.hasUShell()) {
        Log.error("QuickViewDelegate: Cannot retrieve the shell services");
        return Promise.reject();
      }
      const oMetaModel = oView.getModel().getMetaModel();
      let mLineContext = oLink.getBindingContext();
      const oTargetInfo = {
        semanticObject: oPayload.mainSemanticObject,
        action: ""
      };
      try {
        const aNewLinkCustomData = oLink && this._fetchLinkCustomData(oLink).map(function (linkItem) {
          return linkItem.mProperties.value;
        });
        // check if all link items in this.aLinkCustomData are also present in aNewLinkCustomData
        if (SimpleLinkDelegate._IsSemanticObjectDynamic(aNewLinkCustomData, this)) {
          // if the customData changed there are different LinkItems to display
          const oSemanticAttributesResolved = SimpleLinkDelegate._calculateSemanticAttributes(oBindingContext.getObject(), oPayload, undefined, this._link);
          const oSemanticAttributes = oSemanticAttributesResolved.results;
          const oPayloadResolved = oSemanticAttributesResolved.payload;
          aLinkItems = await SimpleLinkDelegate._retrieveNavigationTargets("", oSemanticAttributes, oPayloadResolved, undefined, this._link);
        }
        const oNavigationService = oAppComponent.getNavigationService();
        const oController = oView.getController();
        let oSelectionVariant;
        let mLineContextData;
        mLineContext = SimpleLinkDelegate._getLineContext(oView, mLineContext);
        const sMetaPath = oMetaModel.getMetaPath(mLineContext.getPath());
        mLineContextData = oController._intentBasedNavigation.removeSensitiveData(mLineContext.getObject(), sMetaPath);
        mLineContextData = oController._intentBasedNavigation.prepareContextForExternalNavigation(mLineContextData, mLineContext);
        oSelectionVariant = oNavigationService.mixAttributesAndSelectionVariant(mLineContextData.semanticAttributes, {});
        oTargetInfo.propertiesWithoutConflict = mLineContextData.propertiesWithoutConflict;
        //TO modify the selection variant from the Extension API
        oController.intentBasedNavigation.adaptNavigationContext(oSelectionVariant, oTargetInfo);
        SimpleLinkDelegate._removeTechnicalParameters(oSelectionVariant);
        oSelectionVariant = SimpleLinkDelegate._setFilterContextUrlForSelectionVariant(oView, oSelectionVariant, oNavigationService);
        const aValues = await SimpleLinkDelegate._getAppStateKeyAndUrlParameters(this, oNavigationService, oSelectionVariant, "");
        const oParams = aValues[0];
        const appStateKey = aValues[1];
        let titleLinktoBeRemove;
        oPayload.aSemanticLinks = [];
        aLinkItems = SimpleLinkDelegate._removeEmptyLinkItem(aLinkItems);
        for (const index in aLinkItems) {
          titleLinktoBeRemove = await SimpleLinkDelegate._getLinkItemWithNewParameter(this, bTitleHasLink, aTitleLink, aLinkItems[index], oShellServices, oPayload, oParams, appStateKey, oSelectionVariant, oNavigationService);
          if (titleLinktoBeRemove === true) {
            aLinkItems[index] = undefined;
          }
        }
        return SimpleLinkDelegate._removeEmptyLinkItem(aLinkItems);
      } catch (oError) {
        Log.error("Error while getting the navigation service", oError);
        return undefined;
      }
    } else {
      return aLinkItems;
    }
  };
  SimpleLinkDelegate.beforeNavigationCallback = function (oPayload, oEvent) {
    const oSource = oEvent.getSource(),
      sHref = oEvent.getParameter("href"),
      oURLParsing = Factory.getService("URLParsing"),
      oHash = sHref && oURLParsing.parseShellHash(sHref);
    KeepAliveHelper.storeControlRefreshStrategyForHash(oSource, oHash);
    return Promise.resolve(true);
  };
  SimpleLinkDelegate._removeTechnicalParameters = function (oSelectionVariant) {
    oSelectionVariant.removeSelectOption("@odata.context");
    oSelectionVariant.removeSelectOption("@odata.metadataEtag");
    oSelectionVariant.removeSelectOption("SAP__Messages");
  };
  SimpleLinkDelegate._getSemanticObjectCustomDataValue = function (aLinkCustomData, oSemanticObjectsResolved) {
    let sPropertyName, sCustomDataValue;
    for (let iCustomDataCount = 0; iCustomDataCount < aLinkCustomData.length; iCustomDataCount++) {
      sPropertyName = aLinkCustomData[iCustomDataCount].getKey();
      sCustomDataValue = aLinkCustomData[iCustomDataCount].getValue();
      oSemanticObjectsResolved[sPropertyName] = {
        value: sCustomDataValue
      };
    }
  };

  /**
   * Check the semantic object name if it is dynamic or not.
   *
   * @private
   * @param pathOrValue The semantic object path or name
   * @returns True if semantic object is dynamic
   */
  SimpleLinkDelegate._isDynamicPath = function (pathOrValue) {
    if (pathOrValue && pathOrValue.indexOf("{") === 0 && pathOrValue.indexOf("}") === pathOrValue.length - 1) {
      return true;
    } else {
      return false;
    }
  };

  /**
   * Update the payload with semantic object values from custom data of Link.
   *
   * @private
   * @param payload The payload of the mdc link.
   * @param newPayload The new updated payload.
   * @param semanticObjectName The semantic object name resolved.
   */
  SimpleLinkDelegate._updatePayloadWithResolvedSemanticObjectValue = function (payload, newPayload, semanticObjectName) {
    var _newPayload$semanticO;
    if (SimpleLinkDelegate._isDynamicPath(payload.mainSemanticObject)) {
      if (semanticObjectName) {
        newPayload.mainSemanticObject = semanticObjectName;
      } else {
        // no value from Custom Data, so removing mainSemanticObject
        newPayload.mainSemanticObject = undefined;
      }
    }
    switch (typeof semanticObjectName) {
      case "string":
        (_newPayload$semanticO = newPayload.semanticObjectsResolved) === null || _newPayload$semanticO === void 0 ? void 0 : _newPayload$semanticO.push(semanticObjectName);
        newPayload.semanticObjects.push(semanticObjectName);
        break;
      case "object":
        for (const j in semanticObjectName) {
          var _newPayload$semanticO2;
          (_newPayload$semanticO2 = newPayload.semanticObjectsResolved) === null || _newPayload$semanticO2 === void 0 ? void 0 : _newPayload$semanticO2.push(semanticObjectName[j]);
          newPayload.semanticObjects.push(semanticObjectName[j]);
        }
        break;
      default:
    }
  };
  SimpleLinkDelegate._createNewPayloadWithDynamicSemanticObjectsResolved = function (payload, semanticObjectsResolved, newPayload) {
    let semanticObjectName, tmpPropertyName;
    for (const i in payload.semanticObjects) {
      semanticObjectName = payload.semanticObjects[i];
      if (SimpleLinkDelegate._isDynamicPath(semanticObjectName)) {
        tmpPropertyName = semanticObjectName.substr(1, semanticObjectName.indexOf("}") - 1);
        semanticObjectName = semanticObjectsResolved[tmpPropertyName].value;
        SimpleLinkDelegate._updatePayloadWithResolvedSemanticObjectValue(payload, newPayload, semanticObjectName);
      } else {
        newPayload.semanticObjects.push(semanticObjectName);
      }
    }
  };

  /**
   * Update the semantic object name from the resolved value for the mappings attributes.
   *
   * @private
   * @param mdcPayload The payload given by the application.
   * @param mdcPayloadWithDynamicSemanticObjectsResolved The payload with the resolved value for the semantic object name.
   * @param newPayload The new updated payload.
   */
  SimpleLinkDelegate._updateSemanticObjectsForMappings = function (mdcPayload, mdcPayloadWithDynamicSemanticObjectsResolved, newPayload) {
    // update the semantic object name from the resolved ones in the semantic object mappings.
    mdcPayloadWithDynamicSemanticObjectsResolved.semanticObjectMappings.forEach(function (semanticObjectMapping) {
      if (semanticObjectMapping.semanticObject && SimpleLinkDelegate._isDynamicPath(semanticObjectMapping.semanticObject)) {
        semanticObjectMapping.semanticObject = newPayload.semanticObjects[mdcPayload.semanticObjects.indexOf(semanticObjectMapping.semanticObject)];
      }
    });
  };

  /**
   * Update the semantic object name from the resolved value for the unavailable actions.
   *
   * @private
   * @param mdcPayload The payload given by the application.
   * @param mdcPayloadSemanticObjectUnavailableActions The unavailable actions given by the application.
   * @param mdcPayloadWithDynamicSemanticObjectsResolved The updated payload with the resolved value for the semantic object name for the unavailable actions.
   */
  SimpleLinkDelegate._updateSemanticObjectsUnavailableActions = function (mdcPayload, mdcPayloadSemanticObjectUnavailableActions, mdcPayloadWithDynamicSemanticObjectsResolved) {
    let _Index;
    mdcPayloadSemanticObjectUnavailableActions.forEach(function (semanticObjectUnavailableAction) {
      // Dynamic SemanticObject has an unavailable action
      if (semanticObjectUnavailableAction !== null && semanticObjectUnavailableAction !== void 0 && semanticObjectUnavailableAction.semanticObject && SimpleLinkDelegate._isDynamicPath(semanticObjectUnavailableAction.semanticObject)) {
        _Index = mdcPayload.semanticObjects.findIndex(function (semanticObject) {
          return semanticObject === semanticObjectUnavailableAction.semanticObject;
        });
        if (_Index !== undefined) {
          // Get the SemanticObject name resolved to a value
          semanticObjectUnavailableAction.semanticObject = mdcPayloadWithDynamicSemanticObjectsResolved.semanticObjects[_Index];
        }
      }
    });
  };

  /**
   * Update the semantic object name from the resolved value for the unavailable actions.
   *
   * @private
   * @param mdcPayload The updated payload with the information from custom data provided in the link.
   * @param mdcPayloadWithDynamicSemanticObjectsResolved The payload updated with resolved semantic objects names.
   */
  SimpleLinkDelegate._updateSemanticObjectsWithResolvedValue = function (mdcPayload, mdcPayloadWithDynamicSemanticObjectsResolved) {
    for (let newSemanticObjectsCount = 0; newSemanticObjectsCount < mdcPayload.semanticObjects.length; newSemanticObjectsCount++) {
      if (mdcPayloadWithDynamicSemanticObjectsResolved.mainSemanticObject === (mdcPayload.semanticObjectsResolved && mdcPayload.semanticObjectsResolved[newSemanticObjectsCount])) {
        mdcPayloadWithDynamicSemanticObjectsResolved.mainSemanticObject = mdcPayload.semanticObjects[newSemanticObjectsCount];
      }
      if (mdcPayloadWithDynamicSemanticObjectsResolved.semanticObjects[newSemanticObjectsCount]) {
        mdcPayloadWithDynamicSemanticObjectsResolved.semanticObjects[newSemanticObjectsCount] = mdcPayload.semanticObjects[newSemanticObjectsCount];
      } else {
        // no Custom Data value for a Semantic Object name with path
        mdcPayloadWithDynamicSemanticObjectsResolved.semanticObjects.splice(newSemanticObjectsCount, 1);
      }
    }
  };

  /**
   * Remove empty semantic object mappings and if there is no semantic object name, link to it.
   *
   * @private
   * @param mdcPayloadWithDynamicSemanticObjectsResolved The payload used to check the mappings of the semantic objects.
   */
  SimpleLinkDelegate._removeEmptySemanticObjectsMappings = function (mdcPayloadWithDynamicSemanticObjectsResolved) {
    // remove undefined Semantic Object Mapping
    for (let mappingsCount = 0; mappingsCount < mdcPayloadWithDynamicSemanticObjectsResolved.semanticObjectMappings.length; mappingsCount++) {
      if (mdcPayloadWithDynamicSemanticObjectsResolved.semanticObjectMappings[mappingsCount] && mdcPayloadWithDynamicSemanticObjectsResolved.semanticObjectMappings[mappingsCount].semanticObject === undefined) {
        mdcPayloadWithDynamicSemanticObjectsResolved.semanticObjectMappings.splice(mappingsCount, 1);
      }
    }
  };
  SimpleLinkDelegate._setPayloadWithDynamicSemanticObjectsResolved = function (payload, newPayload) {
    let oPayloadWithDynamicSemanticObjectsResolved;
    if (newPayload.semanticObjectsResolved && newPayload.semanticObjectsResolved.length > 0) {
      oPayloadWithDynamicSemanticObjectsResolved = {
        entityType: payload.entityType,
        dataField: payload.dataField,
        contact: payload.contact,
        mainSemanticObject: payload.mainSemanticObject,
        navigationPath: payload.navigationPath,
        propertyPathLabel: payload.propertyPathLabel,
        semanticObjectMappings: deepClone(payload.semanticObjectMappings),
        semanticObjects: newPayload.semanticObjects
      };
      SimpleLinkDelegate._updateSemanticObjectsForMappings(payload, oPayloadWithDynamicSemanticObjectsResolved, newPayload);
      const _SemanticObjectUnavailableActions = deepClone(payload.semanticObjectUnavailableActions);
      SimpleLinkDelegate._updateSemanticObjectsUnavailableActions(payload, _SemanticObjectUnavailableActions, oPayloadWithDynamicSemanticObjectsResolved);
      oPayloadWithDynamicSemanticObjectsResolved.semanticObjectUnavailableActions = _SemanticObjectUnavailableActions;
      if (newPayload.mainSemanticObject) {
        oPayloadWithDynamicSemanticObjectsResolved.mainSemanticObject = newPayload.mainSemanticObject;
      } else {
        oPayloadWithDynamicSemanticObjectsResolved.mainSemanticObject = undefined;
      }
      SimpleLinkDelegate._updateSemanticObjectsWithResolvedValue(newPayload, oPayloadWithDynamicSemanticObjectsResolved);
      SimpleLinkDelegate._removeEmptySemanticObjectsMappings(oPayloadWithDynamicSemanticObjectsResolved);
      return oPayloadWithDynamicSemanticObjectsResolved;
    } else {
      return {};
    }
  };
  SimpleLinkDelegate._getPayloadWithDynamicSemanticObjectsResolved = function (payload, linkCustomData) {
    let oPayloadWithDynamicSemanticObjectsResolved;
    const oSemanticObjectsResolved = {};
    const newPayload = {
      semanticObjects: [],
      semanticObjectsResolved: [],
      semanticObjectMappings: []
    };
    if (payload.semanticObjects) {
      // sap.m.Link has custom data with Semantic Objects names resolved
      if (linkCustomData && linkCustomData.length > 0) {
        SimpleLinkDelegate._getSemanticObjectCustomDataValue(linkCustomData, oSemanticObjectsResolved);
        SimpleLinkDelegate._createNewPayloadWithDynamicSemanticObjectsResolved(payload, oSemanticObjectsResolved, newPayload);
        oPayloadWithDynamicSemanticObjectsResolved = SimpleLinkDelegate._setPayloadWithDynamicSemanticObjectsResolved(payload, newPayload);
        return oPayloadWithDynamicSemanticObjectsResolved;
      }
    } else {
      return undefined;
    }
  };
  SimpleLinkDelegate._updatePayloadWithSemanticAttributes = function (aSemanticObjects, oInfoLog, oContextObject, oResults, mSemanticObjectMappings) {
    aSemanticObjects.forEach(function (sSemanticObject) {
      if (oInfoLog) {
        oInfoLog.addContextObject(sSemanticObject, oContextObject);
      }
      oResults[sSemanticObject] = {};
      for (const sAttributeName in oContextObject) {
        let oAttribute = null,
          oTransformationAdditional = null;
        if (oInfoLog) {
          oAttribute = oInfoLog.getSemanticObjectAttribute(sSemanticObject, sAttributeName);
          if (!oAttribute) {
            oAttribute = oInfoLog.createAttributeStructure();
            oInfoLog.addSemanticObjectAttribute(sSemanticObject, sAttributeName, oAttribute);
          }
        }
        // Ignore undefined and null values
        if (oContextObject[sAttributeName] === undefined || oContextObject[sAttributeName] === null) {
          if (oAttribute) {
            oAttribute.transformations.push({
              value: undefined,
              description: "\u2139 Undefined and null values have been removed in SimpleLinkDelegate."
            });
          }
          continue;
        }
        // Ignore plain objects (BCP 1770496639)
        if (isPlainObject(oContextObject[sAttributeName])) {
          if (mSemanticObjectMappings && mSemanticObjectMappings[sSemanticObject]) {
            const aKeys = Object.keys(mSemanticObjectMappings[sSemanticObject]);
            let sNewAttributeNameMapped, sNewAttributeName, sValue, sKey;
            for (let index = 0; index < aKeys.length; index++) {
              sKey = aKeys[index];
              if (sKey.indexOf(sAttributeName) === 0) {
                sNewAttributeNameMapped = mSemanticObjectMappings[sSemanticObject][sKey];
                sNewAttributeName = sKey.split("/")[sKey.split("/").length - 1];
                sValue = oContextObject[sAttributeName][sNewAttributeName];
                if (sNewAttributeNameMapped && sNewAttributeName && sValue) {
                  oResults[sSemanticObject][sNewAttributeNameMapped] = sValue;
                }
              }
            }
          }
          if (oAttribute) {
            oAttribute.transformations.push({
              value: undefined,
              description: "\u2139 Plain objects has been removed in SimpleLinkDelegate."
            });
          }
          continue;
        }

        // Map the attribute name only if 'semanticObjectMapping' is defined.
        // Note: under defined 'semanticObjectMapping' we also mean an empty annotation or an annotation with empty record
        const sAttributeNameMapped = mSemanticObjectMappings && mSemanticObjectMappings[sSemanticObject] && mSemanticObjectMappings[sSemanticObject][sAttributeName] ? mSemanticObjectMappings[sSemanticObject][sAttributeName] : sAttributeName;
        if (oAttribute && sAttributeName !== sAttributeNameMapped) {
          oTransformationAdditional = {
            value: undefined,
            description: `\u2139 The attribute ${sAttributeName} has been renamed to ${sAttributeNameMapped} in SimpleLinkDelegate.`,
            reason: `\ud83d\udd34 A com.sap.vocabularies.Common.v1.SemanticObjectMapping annotation is defined for semantic object ${sSemanticObject} with source attribute ${sAttributeName} and target attribute ${sAttributeNameMapped}. You can modify the annotation if the mapping result is not what you expected.`
          };
        }

        // If more then one local property maps to the same target property (clash situation)
        // we take the value of the last property and write an error log
        if (oResults[sSemanticObject][sAttributeNameMapped]) {
          Log.error(`SimpleLinkDelegate: The attribute ${sAttributeName} can not be renamed to the attribute ${sAttributeNameMapped} due to a clash situation. This can lead to wrong navigation later on.`);
        }

        // Copy the value replacing the attribute name by semantic object name
        oResults[sSemanticObject][sAttributeNameMapped] = oContextObject[sAttributeName];
        if (oAttribute) {
          if (oTransformationAdditional) {
            oAttribute.transformations.push(oTransformationAdditional);
            const aAttributeNew = oInfoLog.createAttributeStructure();
            aAttributeNew.transformations.push({
              value: oContextObject[sAttributeName],
              description: `\u2139 The attribute ${sAttributeNameMapped} with the value ${oContextObject[sAttributeName]} has been added due to a mapping rule regarding the attribute ${sAttributeName} in SimpleLinkDelegate.`
            });
            oInfoLog.addSemanticObjectAttribute(sSemanticObject, sAttributeNameMapped, aAttributeNew);
          }
        }
      }
    });
  };

  /**
   * Checks which attributes of the ContextObject belong to which SemanticObject and maps them into a two dimensional array.
   *
   * @private
   * @param oContextObject The BindingContext of the SourceControl of the Link / of the Link itself if not set
   * @param oPayload The payload given by the application
   * @param oInfoLog The corresponding InfoLog of the Link
   * @param oLink The corresponding Link
   * @returns A two dimensional array which maps a given SemanticObject name together with a given attribute name to the value of that given attribute
   */
  SimpleLinkDelegate._calculateSemanticAttributes = function (oContextObject, oPayload, oInfoLog, oLink) {
    const aLinkCustomData = oLink && this._fetchLinkCustomData(oLink);
    const oPayloadWithDynamicSemanticObjectsResolved = SimpleLinkDelegate._getPayloadWithDynamicSemanticObjectsResolved(oPayload, aLinkCustomData);
    const oPayloadResolved = oPayloadWithDynamicSemanticObjectsResolved ? oPayloadWithDynamicSemanticObjectsResolved : oPayload;
    this.resolvedpayload = oPayloadWithDynamicSemanticObjectsResolved;
    const aSemanticObjects = SimpleLinkDelegate._getSemanticObjects(oPayloadResolved);
    const mSemanticObjectMappings = SimpleLinkDelegate._convertSemanticObjectMapping(SimpleLinkDelegate._getSemanticObjectMappings(oPayloadResolved));
    if (!aSemanticObjects.length) {
      return {
        payload: oPayloadResolved,
        results: {}
      };
    }
    const oResults = {};
    SimpleLinkDelegate._updatePayloadWithSemanticAttributes(aSemanticObjects, oInfoLog, oContextObject, oResults, mSemanticObjectMappings);
    return {
      payload: oPayloadResolved,
      results: oResults
    };
  };
  /**
   * Retrieves the actual targets for the navigation of the link. This uses the UShell loaded by the {@link sap.ui.mdc.link.Factory} to retrieve
   * the navigation targets from the FLP service.
   *
   * @private
   * @param sAppStateKey Key of the appstate (not used yet)
   * @param oSemanticAttributes The calculated by _calculateSemanticAttributes
   * @param oPayload The payload given by the application
   * @param oInfoLog The corresponding InfoLog of the Link
   * @param oLink The corresponding Link
   * @returns Resolving into availableAtions and ownNavigation containing an array of {@link sap.ui.mdc.link.LinkItem}
   */
  SimpleLinkDelegate._retrieveNavigationTargets = function (sAppStateKey, oSemanticAttributes, oPayload, oInfoLog, oLink) {
    if (!oPayload.semanticObjects) {
      return Promise.resolve([]);
    }
    const aSemanticObjects = oPayload.semanticObjects;
    const oNavigationTargets = {
      ownNavigation: undefined,
      availableActions: []
    };
    let iSuperiorActionLinksFound = 0;
    return Core.loadLibrary("sap.ui.fl", {
      async: true
    }).then(() => {
      return new Promise(resolve => {
        sap.ui.require(["sap/ui/fl/Utils"], async Utils => {
          const oAppComponent = Utils.getAppComponentForControl(oLink === undefined ? this.oControl : oLink);
          const oShellServices = oAppComponent ? oAppComponent.getShellServices() : null;
          if (!oShellServices) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            resolve(oNavigationTargets.availableActions, oNavigationTargets.ownNavigation);
          }
          if (!oShellServices.hasUShell()) {
            Log.error("SimpleLinkDelegate: Service 'CrossApplicationNavigation' or 'URLParsing' could not be obtained");
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            resolve(oNavigationTargets.availableActions, oNavigationTargets.ownNavigation);
          }
          const aParams = aSemanticObjects.map(function (sSemanticObject) {
            return [{
              semanticObject: sSemanticObject,
              params: oSemanticAttributes ? oSemanticAttributes[sSemanticObject] : undefined,
              appStateKey: sAppStateKey,
              sortResultsBy: "text"
            }];
          });
          try {
            const aLinks = await oShellServices.getLinks(aParams);
            let bHasLinks = false;
            for (let i = 0; i < aLinks.length; i++) {
              for (let j = 0; j < aLinks[i].length; j++) {
                if (aLinks[i][j].length > 0) {
                  bHasLinks = true;
                  break;
                }
                if (bHasLinks) {
                  break;
                }
              }
            }
            if (!aLinks || !aLinks.length || !bHasLinks) {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              resolve(oNavigationTargets.availableActions, oNavigationTargets.ownNavigation);
            }
            const aSemanticObjectUnavailableActions = SimpleLinkDelegate._getSemanticObjectUnavailableActions(oPayload);
            const oUnavailableActions = SimpleLinkDelegate._convertSemanticObjectUnavailableAction(aSemanticObjectUnavailableActions);
            let sCurrentHash = FieldRuntime._fnFixHashQueryString(CommonUtils.getHash());
            if (sCurrentHash) {
              // BCP 1770315035: we have to set the end-point '?' of action in order to avoid matching of "#SalesOrder-manage" in "#SalesOrder-manageFulfillment"
              sCurrentHash += "?";
            }
            const fnIsUnavailableAction = function (sSemanticObject, sAction) {
              return !!oUnavailableActions && !!oUnavailableActions[sSemanticObject] && oUnavailableActions[sSemanticObject].indexOf(sAction) > -1;
            };
            const fnAddLink = function (_oLink) {
              const oShellHash = oShellServices.parseShellHash(_oLink.intent);
              if (fnIsUnavailableAction(oShellHash.semanticObject, oShellHash.action)) {
                return;
              }
              const sHref = `#${oShellServices.constructShellHash({
                target: {
                  shellHash: _oLink.intent
                }
              })}`;
              if (_oLink.intent && _oLink.intent.indexOf(sCurrentHash) === 0) {
                // Prevent current app from being listed
                // NOTE: If the navigation target exists in
                // multiple contexts (~XXXX in hash) they will all be skipped
                oNavigationTargets.ownNavigation = new LinkItem({
                  href: sHref,
                  text: _oLink.text
                });
                return;
              }
              const oLinkItem = new LinkItem({
                // As the retrieveNavigationTargets method can be called several time we can not create the LinkItem instance with the same id
                key: oShellHash.semanticObject && oShellHash.action ? `${oShellHash.semanticObject}-${oShellHash.action}` : undefined,
                text: _oLink.text,
                description: undefined,
                href: sHref,
                // target: not supported yet
                icon: undefined,
                //_oLink.icon,
                initiallyVisible: _oLink.tags && _oLink.tags.indexOf("superiorAction") > -1
              });
              if (oLinkItem.getProperty("initiallyVisible")) {
                iSuperiorActionLinksFound++;
              }
              oNavigationTargets.availableActions.push(oLinkItem);
              if (oInfoLog) {
                oInfoLog.addSemanticObjectIntent(oShellHash.semanticObject, {
                  intent: oLinkItem.getHref(),
                  text: oLinkItem.getText()
                });
              }
            };
            for (let n = 0; n < aSemanticObjects.length; n++) {
              aLinks[n][0].forEach(fnAddLink);
            }
            if (iSuperiorActionLinksFound === 0) {
              for (let iLinkItemIndex = 0; iLinkItemIndex < oNavigationTargets.availableActions.length; iLinkItemIndex++) {
                if (iLinkItemIndex < this.getConstants().iLinksShownInPopup) {
                  oNavigationTargets.availableActions[iLinkItemIndex].setProperty("initiallyVisible", true);
                } else {
                  break;
                }
              }
            }
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            resolve(oNavigationTargets.availableActions, oNavigationTargets.ownNavigation);
          } catch (oError) {
            Log.error("SimpleLinkDelegate: '_retrieveNavigationTargets' failed executing getLinks method");
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            resolve(oNavigationTargets.availableActions, oNavigationTargets.ownNavigation);
          }
        });
      });
    });
  };
  SimpleLinkDelegate._getSemanticObjects = function (oPayload) {
    return oPayload.semanticObjects ? oPayload.semanticObjects : [];
  };
  SimpleLinkDelegate._getSemanticObjectUnavailableActions = function (oPayload) {
    const aSemanticObjectUnavailableActions = [];
    if (oPayload.semanticObjectUnavailableActions) {
      oPayload.semanticObjectUnavailableActions.forEach(function (oSemanticObjectUnavailableAction) {
        aSemanticObjectUnavailableActions.push(new SemanticObjectUnavailableAction({
          semanticObject: oSemanticObjectUnavailableAction.semanticObject,
          actions: oSemanticObjectUnavailableAction.actions
        }));
      });
    }
    return aSemanticObjectUnavailableActions;
  };

  /**
   * This will return an array of {@link sap.ui.mdc.link.SemanticObjectMapping} depending on the given payload.
   *
   * @private
   * @param oPayload The payload defined by the application
   * @returns An array of semantic object mappings.
   */
  SimpleLinkDelegate._getSemanticObjectMappings = function (oPayload) {
    const aSemanticObjectMappings = [];
    let aSemanticObjectMappingItems = [];
    if (oPayload.semanticObjectMappings) {
      oPayload.semanticObjectMappings.forEach(function (oSemanticObjectMapping) {
        aSemanticObjectMappingItems = [];
        if (oSemanticObjectMapping.items) {
          oSemanticObjectMapping.items.forEach(function (oSemanticObjectMappingItem) {
            aSemanticObjectMappingItems.push(new SemanticObjectMappingItem({
              key: oSemanticObjectMappingItem.key,
              value: oSemanticObjectMappingItem.value
            }));
          });
        }
        aSemanticObjectMappings.push(new SemanticObjectMapping({
          semanticObject: oSemanticObjectMapping.semanticObject,
          items: aSemanticObjectMappingItems
        }));
      });
    }
    return aSemanticObjectMappings;
  };
  /**
   * Converts a given array of SemanticObjectMapping into a Map containing SemanticObjects as Keys and a Map of it's corresponding SemanticObjectMappings as values.
   *
   * @private
   * @param aSemanticObjectMappings An array of SemanticObjectMappings.
   * @returns The converterd SemanticObjectMappings
   */
  SimpleLinkDelegate._convertSemanticObjectMapping = function (aSemanticObjectMappings) {
    if (!aSemanticObjectMappings.length) {
      return undefined;
    }
    const mSemanticObjectMappings = {};
    aSemanticObjectMappings.forEach(function (oSemanticObjectMapping) {
      if (!oSemanticObjectMapping.getSemanticObject()) {
        throw Error(`SimpleLinkDelegate: 'semanticObject' property with value '${oSemanticObjectMapping.getSemanticObject()}' is not valid`);
      }
      mSemanticObjectMappings[oSemanticObjectMapping.getSemanticObject()] = oSemanticObjectMapping.getItems().reduce(function (oMap, oItem) {
        oMap[oItem.getKey()] = oItem.getValue();
        return oMap;
      }, {});
    });
    return mSemanticObjectMappings;
  };
  /**
   * Converts a given array of SemanticObjectUnavailableActions into a map containing SemanticObjects as keys and a map of its corresponding SemanticObjectUnavailableActions as values.
   *
   * @private
   * @param aSemanticObjectUnavailableActions The SemanticObjectUnavailableActions converted
   * @returns The map containing the converted SemanticObjectUnavailableActions
   */
  SimpleLinkDelegate._convertSemanticObjectUnavailableAction = function (aSemanticObjectUnavailableActions) {
    let _SemanticObjectName;
    let _SemanticObjectHasAlreadyUnavailableActions;
    let _UnavailableActions = [];
    if (!aSemanticObjectUnavailableActions.length) {
      return undefined;
    }
    const mSemanticObjectUnavailableActions = {};
    aSemanticObjectUnavailableActions.forEach(function (oSemanticObjectUnavailableActions) {
      _SemanticObjectName = oSemanticObjectUnavailableActions.getSemanticObject();
      if (!_SemanticObjectName) {
        throw Error(`SimpleLinkDelegate: 'semanticObject' property with value '${_SemanticObjectName}' is not valid`);
      }
      _UnavailableActions = oSemanticObjectUnavailableActions.getActions();
      if (mSemanticObjectUnavailableActions[_SemanticObjectName] === undefined) {
        mSemanticObjectUnavailableActions[_SemanticObjectName] = _UnavailableActions;
      } else {
        _SemanticObjectHasAlreadyUnavailableActions = mSemanticObjectUnavailableActions[_SemanticObjectName];
        _UnavailableActions.forEach(function (UnavailableAction) {
          _SemanticObjectHasAlreadyUnavailableActions.push(UnavailableAction);
        });
        mSemanticObjectUnavailableActions[_SemanticObjectName] = _SemanticObjectHasAlreadyUnavailableActions;
      }
    });
    return mSemanticObjectUnavailableActions;
  };
  return SimpleLinkDelegate;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaW1wbGVMaW5rRGVsZWdhdGUiLCJPYmplY3QiLCJhc3NpZ24iLCJMaW5rRGVsZWdhdGUiLCJDT05TVEFOVFMiLCJpTGlua3NTaG93bkluUG9wdXAiLCJzYXBtTGluayIsInNhcHVpbWRjTGluayIsInNhcHVpbWRjbGlua0xpbmtJdGVtIiwic2FwbU9iamVjdElkZW50aWZpZXIiLCJzYXBtT2JqZWN0U3RhdHVzIiwiZ2V0Q29uc3RhbnRzIiwiX2dldEVudGl0eVR5cGUiLCJvUGF5bG9hZCIsIm9NZXRhTW9kZWwiLCJjcmVhdGVCaW5kaW5nQ29udGV4dCIsImVudGl0eVR5cGUiLCJ1bmRlZmluZWQiLCJfZ2V0U2VtYW50aWNzTW9kZWwiLCJKU09OTW9kZWwiLCJfZ2V0RGF0YUZpZWxkIiwiZGF0YUZpZWxkIiwiX2dldENvbnRhY3QiLCJjb250YWN0IiwiZm5UZW1wbGF0ZUZyYWdtZW50Iiwic0ZyYWdtZW50TmFtZSIsInRpdGxlTGlua0hyZWYiLCJvRnJhZ21lbnRNb2RlbCIsIm9QYXlsb2FkVG9Vc2UiLCJyZXNvbHZlZHBheWxvYWQiLCJwYXlsb2FkIiwiTGlua0lkIiwib0NvbnRyb2wiLCJpc0EiLCJnZXRJZCIsImdldE1vZGVsIiwiZ2V0UHJvcGVydHkiLCJ0aXRsZWxpbmsiLCJvU2VtYW50aWNzTW9kZWwiLCJzZW1hbnRpY01vZGVsIiwiYmluZGluZ0NvbnRleHRzIiwic2VtYW50aWMiLCJtb2RlbHMiLCJlbnRpdHlTZXQiLCJtZXRhTW9kZWwiLCJ2aWV3RGF0YSIsIm9GcmFnbWVudCIsIlhNTFRlbXBsYXRlUHJvY2Vzc29yIiwibG9hZFRlbXBsYXRlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJYTUxQcmVwcm9jZXNzb3IiLCJwcm9jZXNzIiwibmFtZSIsInRoZW4iLCJfaW50ZXJuYWxGcmFnbWVudCIsIkZyYWdtZW50IiwibG9hZCIsImRlZmluaXRpb24iLCJjb250cm9sbGVyIiwib1BvcG92ZXJDb250ZW50Iiwic2V0TW9kZWwiLCJzZXRCaW5kaW5nQ29udGV4dCIsImZldGNoQWRkaXRpb25hbENvbnRlbnQiLCJvUGF5TG9hZCIsIm9NZGNMaW5rQ29udHJvbCIsImFOYXZpZ2F0ZVJlZ2V4cE1hdGNoIiwibmF2aWdhdGlvblBhdGgiLCJtYXRjaCIsIm9CaW5kaW5nQ29udGV4dCIsImxlbmd0aCIsImJpbmRDb250ZXh0IiwiZ2V0QmluZGluZ0NvbnRleHQiLCIkJG93blJlcXVlc3QiLCJnZXRNZXRhTW9kZWwiLCJnZXRCb3VuZENvbnRleHQiLCJfZmV0Y2hMaW5rQ3VzdG9tRGF0YSIsIl9vTGluayIsImdldFBhcmVudCIsImdldEN1c3RvbURhdGEiLCJmZXRjaExpbmtJdGVtcyIsIm9JbmZvTG9nIiwiX2dldFNlbWFudGljT2JqZWN0cyIsIm9Db250ZXh0T2JqZWN0IiwiZ2V0T2JqZWN0IiwiaW5pdGlhbGl6ZSIsIl9vTGlua0N1c3RvbURhdGEiLCJfbGluayIsImFMaW5rQ3VzdG9tRGF0YSIsIm1hcCIsImxpbmtJdGVtIiwibVByb3BlcnRpZXMiLCJ2YWx1ZSIsIm9TZW1hbnRpY0F0dHJpYnV0ZXNSZXNvbHZlZCIsIl9jYWxjdWxhdGVTZW1hbnRpY0F0dHJpYnV0ZXMiLCJvU2VtYW50aWNBdHRyaWJ1dGVzIiwicmVzdWx0cyIsIm9QYXlsb2FkUmVzb2x2ZWQiLCJfcmV0cmlldmVOYXZpZ2F0aW9uVGFyZ2V0cyIsImFMaW5rcyIsIl9maW5kTGlua1R5cGUiLCJhTGlua0l0ZW1zIiwibkxpbmtUeXBlIiwib0xpbmtJdGVtIiwiTGlua0l0ZW0iLCJ0ZXh0IiwiZ2V0VGV4dCIsImhyZWYiLCJnZXRIcmVmIiwiaGFzUXVpY2tWaWV3RmFjZXRzIiwibGlua1R5cGUiLCJmZXRjaExpbmtUeXBlIiwib0xpbmsiLCJfb0N1cnJlbnRMaW5rIiwiX29QYXlsb2FkIiwib0RlZmF1bHRJbml0aWFsVHlwZSIsImluaXRpYWxUeXBlIiwidHlwZSIsImRpcmVjdExpbmsiLCJydW50aW1lVHlwZSIsImFwcFN0YXRlS2V5TWFwIiwic2VtYW50aWNPYmplY3RzIiwiX3JldHJpZXZlVW5tb2RpZmllZExpbmtJdGVtcyIsIl9MaW5rVHlwZSIsIkVycm9yIiwib0Vycm9yIiwiTG9nIiwiZXJyb3IiLCJfUmVtb3ZlVGl0bGVMaW5rRnJvbVRhcmdldHMiLCJfYUxpbmtJdGVtcyIsIl9iVGl0bGVIYXNMaW5rIiwiX2FUaXRsZUxpbmsiLCJfc1RpdGxlTGlua0hyZWYiLCJfb01EQ0xpbmsiLCJiUmVzdWx0IiwibGlua0lzUHJpbWFyeUFjdGlvbiIsIl9zTGlua0ludGVudFdpdGhvdXRQYXJhbWV0ZXJzIiwiX3NUaXRsZUludGVudCIsImludGVudCIsInNwbGl0IiwidGl0bGVsaW5raHJlZiIsInNldFByb3BlcnR5IiwiYU1MaW5rSXRlbXMiLCJmaWx0ZXIiLCJrZXkiLCJfSXNTZW1hbnRpY09iamVjdER5bmFtaWMiLCJhTmV3TGlua0N1c3RvbURhdGEiLCJvVGhpcyIsImxpbmsiLCJvdGhlckxpbmsiLCJfZ2V0TGluZUNvbnRleHQiLCJvVmlldyIsIm1MaW5lQ29udGV4dCIsImdldEFnZ3JlZ2F0aW9uIiwiX3NldEZpbHRlckNvbnRleHRVcmxGb3JTZWxlY3Rpb25WYXJpYW50Iiwib1NlbGVjdGlvblZhcmlhbnQiLCJvTmF2aWdhdGlvblNlcnZpY2UiLCJnZXRWaWV3RGF0YSIsInNDb250ZXh0VXJsIiwiY29uc3RydWN0Q29udGV4dFVybCIsInNldEZpbHRlckNvbnRleHRVcmwiLCJfc2V0T2JqZWN0TWFwcGluZ3MiLCJzU2VtYW50aWNPYmplY3QiLCJvUGFyYW1zIiwiYVNlbWFudGljT2JqZWN0TWFwcGluZ3MiLCJoYXNDaGFuZ2VkIiwibW9kaWZpZWRTZWxlY3Rpb25WYXJpYW50IiwiU2VsZWN0aW9uVmFyaWFudCIsInRvSlNPTk9iamVjdCIsImZvckVhY2giLCJtYXBwaW5nIiwibWFwcGluZ1NlbWFudGljT2JqZWN0Iiwic2VtYW50aWNPYmplY3QiLCJtYXBwaW5nU2VtYW50aWNPYmplY3RQYXRoIiwiZ2V0RHluYW1pY1BhdGhGcm9tU2VtYW50aWNPYmplY3QiLCJvTWFwcGluZ3MiLCJpdGVtcyIsImkiLCJzTG9jYWxQcm9wZXJ0eSIsInNTZW1hbnRpY09iamVjdFByb3BlcnR5IiwicmVtb3ZlUGFyYW1ldGVyIiwicmVtb3ZlU2VsZWN0T3B0aW9uIiwicmVuYW1lUGFyYW1ldGVyIiwicmVuYW1lU2VsZWN0T3B0aW9uIiwicHJvcGVydHlUb0JlUmVtb3ZlZCIsInNsaWNlIiwicGFyYW1zIiwic2VsZWN0aW9uVmFyaWFudCIsIl9nZXRBcHBTdGF0ZUtleUFuZFVybFBhcmFtZXRlcnMiLCJfdGhpcyIsIm5hdmlnYXRpb25TZXJ2aWNlIiwiYVZhbHVlcyIsImRlZXBFcXVhbCIsImRlZmF1bHRDYWNoZSIsInNlbWFudGljQXR0cmlidXRlcyIsImFwcHN0YXRla2V5IiwidG9FUzZQcm9taXNlIiwiZ2V0QXBwU3RhdGVLZXlBbmRVcmxQYXJhbWV0ZXJzIiwidG9KU09OU3RyaW5nIiwiY2FjaGUiLCJfZ2V0TGlua0l0ZW1XaXRoTmV3UGFyYW1ldGVyIiwiX3RoYXQiLCJfb0xpbmtJdGVtIiwiX29TaGVsbFNlcnZpY2VzIiwiX29QYXJhbXMiLCJfc0FwcFN0YXRlS2V5IiwiX29TZWxlY3Rpb25WYXJpYW50IiwiX29OYXZpZ2F0aW9uU2VydmljZSIsImV4cGFuZENvbXBhY3RIYXNoIiwic0hhc2giLCJvU2hlbGxIYXNoIiwicGFyc2VTaGVsbEhhc2giLCJvTmV3UGFyYW1zIiwibmV3U2VsZWN0aW9uVmFyaWFudCIsInNlbWFudGljT2JqZWN0TWFwcGluZ3MiLCJvTmV3U2hlbGxIYXNoIiwidGFyZ2V0IiwiYWN0aW9uIiwiYXBwU3RhdGVLZXkiLCJzZXRIcmVmIiwiY29uc3RydWN0U2hlbGxIYXNoIiwiYVNlbWFudGljTGlua3MiLCJwdXNoIiwiYmluZCIsIl9yZW1vdmVFbXB0eUxpbmtJdGVtIiwibW9kaWZ5TGlua0l0ZW1zIiwicHJpbWFyeUFjdGlvbklzQWN0aXZlIiwiRmllbGRIZWxwZXIiLCJjaGVja1ByaW1hcnlBY3Rpb25zIiwiYVRpdGxlTGluayIsInRpdGxlTGluayIsImJUaXRsZUhhc0xpbmsiLCJoYXNUaXRsZUxpbmsiLCJDb21tb25VdGlscyIsImdldFRhcmdldFZpZXciLCJvQXBwQ29tcG9uZW50IiwiZ2V0QXBwQ29tcG9uZW50Iiwib1NoZWxsU2VydmljZXMiLCJnZXRTaGVsbFNlcnZpY2VzIiwiaGFzVVNoZWxsIiwicmVqZWN0Iiwib1RhcmdldEluZm8iLCJtYWluU2VtYW50aWNPYmplY3QiLCJnZXROYXZpZ2F0aW9uU2VydmljZSIsIm9Db250cm9sbGVyIiwiZ2V0Q29udHJvbGxlciIsIm1MaW5lQ29udGV4dERhdGEiLCJzTWV0YVBhdGgiLCJnZXRNZXRhUGF0aCIsImdldFBhdGgiLCJfaW50ZW50QmFzZWROYXZpZ2F0aW9uIiwicmVtb3ZlU2Vuc2l0aXZlRGF0YSIsInByZXBhcmVDb250ZXh0Rm9yRXh0ZXJuYWxOYXZpZ2F0aW9uIiwibWl4QXR0cmlidXRlc0FuZFNlbGVjdGlvblZhcmlhbnQiLCJwcm9wZXJ0aWVzV2l0aG91dENvbmZsaWN0IiwiaW50ZW50QmFzZWROYXZpZ2F0aW9uIiwiYWRhcHROYXZpZ2F0aW9uQ29udGV4dCIsIl9yZW1vdmVUZWNobmljYWxQYXJhbWV0ZXJzIiwidGl0bGVMaW5rdG9CZVJlbW92ZSIsImluZGV4IiwiYmVmb3JlTmF2aWdhdGlvbkNhbGxiYWNrIiwib0V2ZW50Iiwib1NvdXJjZSIsImdldFNvdXJjZSIsInNIcmVmIiwiZ2V0UGFyYW1ldGVyIiwib1VSTFBhcnNpbmciLCJGYWN0b3J5IiwiZ2V0U2VydmljZSIsIm9IYXNoIiwiS2VlcEFsaXZlSGVscGVyIiwic3RvcmVDb250cm9sUmVmcmVzaFN0cmF0ZWd5Rm9ySGFzaCIsIl9nZXRTZW1hbnRpY09iamVjdEN1c3RvbURhdGFWYWx1ZSIsIm9TZW1hbnRpY09iamVjdHNSZXNvbHZlZCIsInNQcm9wZXJ0eU5hbWUiLCJzQ3VzdG9tRGF0YVZhbHVlIiwiaUN1c3RvbURhdGFDb3VudCIsImdldEtleSIsImdldFZhbHVlIiwiX2lzRHluYW1pY1BhdGgiLCJwYXRoT3JWYWx1ZSIsImluZGV4T2YiLCJfdXBkYXRlUGF5bG9hZFdpdGhSZXNvbHZlZFNlbWFudGljT2JqZWN0VmFsdWUiLCJuZXdQYXlsb2FkIiwic2VtYW50aWNPYmplY3ROYW1lIiwic2VtYW50aWNPYmplY3RzUmVzb2x2ZWQiLCJqIiwiX2NyZWF0ZU5ld1BheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkIiwidG1wUHJvcGVydHlOYW1lIiwic3Vic3RyIiwiX3VwZGF0ZVNlbWFudGljT2JqZWN0c0Zvck1hcHBpbmdzIiwibWRjUGF5bG9hZCIsIm1kY1BheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkIiwic2VtYW50aWNPYmplY3RNYXBwaW5nIiwiX3VwZGF0ZVNlbWFudGljT2JqZWN0c1VuYXZhaWxhYmxlQWN0aW9ucyIsIm1kY1BheWxvYWRTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucyIsIl9JbmRleCIsInNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb24iLCJmaW5kSW5kZXgiLCJfdXBkYXRlU2VtYW50aWNPYmplY3RzV2l0aFJlc29sdmVkVmFsdWUiLCJuZXdTZW1hbnRpY09iamVjdHNDb3VudCIsInNwbGljZSIsIl9yZW1vdmVFbXB0eVNlbWFudGljT2JqZWN0c01hcHBpbmdzIiwibWFwcGluZ3NDb3VudCIsIl9zZXRQYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZCIsIm9QYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZCIsInByb3BlcnR5UGF0aExhYmVsIiwiZGVlcENsb25lIiwiX1NlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zIiwic2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMiLCJfZ2V0UGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQiLCJsaW5rQ3VzdG9tRGF0YSIsIl91cGRhdGVQYXlsb2FkV2l0aFNlbWFudGljQXR0cmlidXRlcyIsImFTZW1hbnRpY09iamVjdHMiLCJvUmVzdWx0cyIsIm1TZW1hbnRpY09iamVjdE1hcHBpbmdzIiwiYWRkQ29udGV4dE9iamVjdCIsInNBdHRyaWJ1dGVOYW1lIiwib0F0dHJpYnV0ZSIsIm9UcmFuc2Zvcm1hdGlvbkFkZGl0aW9uYWwiLCJnZXRTZW1hbnRpY09iamVjdEF0dHJpYnV0ZSIsImNyZWF0ZUF0dHJpYnV0ZVN0cnVjdHVyZSIsImFkZFNlbWFudGljT2JqZWN0QXR0cmlidXRlIiwidHJhbnNmb3JtYXRpb25zIiwiZGVzY3JpcHRpb24iLCJpc1BsYWluT2JqZWN0IiwiYUtleXMiLCJrZXlzIiwic05ld0F0dHJpYnV0ZU5hbWVNYXBwZWQiLCJzTmV3QXR0cmlidXRlTmFtZSIsInNWYWx1ZSIsInNLZXkiLCJzQXR0cmlidXRlTmFtZU1hcHBlZCIsInJlYXNvbiIsImFBdHRyaWJ1dGVOZXciLCJfY29udmVydFNlbWFudGljT2JqZWN0TWFwcGluZyIsIl9nZXRTZW1hbnRpY09iamVjdE1hcHBpbmdzIiwic0FwcFN0YXRlS2V5Iiwib05hdmlnYXRpb25UYXJnZXRzIiwib3duTmF2aWdhdGlvbiIsImF2YWlsYWJsZUFjdGlvbnMiLCJpU3VwZXJpb3JBY3Rpb25MaW5rc0ZvdW5kIiwiQ29yZSIsImxvYWRMaWJyYXJ5IiwiYXN5bmMiLCJzYXAiLCJ1aSIsInJlcXVpcmUiLCJVdGlscyIsImdldEFwcENvbXBvbmVudEZvckNvbnRyb2wiLCJhUGFyYW1zIiwic29ydFJlc3VsdHNCeSIsImdldExpbmtzIiwiYkhhc0xpbmtzIiwiYVNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zIiwiX2dldFNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zIiwib1VuYXZhaWxhYmxlQWN0aW9ucyIsIl9jb252ZXJ0U2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbiIsInNDdXJyZW50SGFzaCIsIkZpZWxkUnVudGltZSIsIl9mbkZpeEhhc2hRdWVyeVN0cmluZyIsImdldEhhc2giLCJmbklzVW5hdmFpbGFibGVBY3Rpb24iLCJzQWN0aW9uIiwiZm5BZGRMaW5rIiwic2hlbGxIYXNoIiwiaWNvbiIsImluaXRpYWxseVZpc2libGUiLCJ0YWdzIiwiYWRkU2VtYW50aWNPYmplY3RJbnRlbnQiLCJuIiwiaUxpbmtJdGVtSW5kZXgiLCJvU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbiIsIlNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb24iLCJhY3Rpb25zIiwiYVNlbWFudGljT2JqZWN0TWFwcGluZ0l0ZW1zIiwib1NlbWFudGljT2JqZWN0TWFwcGluZyIsIm9TZW1hbnRpY09iamVjdE1hcHBpbmdJdGVtIiwiU2VtYW50aWNPYmplY3RNYXBwaW5nSXRlbSIsIlNlbWFudGljT2JqZWN0TWFwcGluZyIsImdldFNlbWFudGljT2JqZWN0IiwiZ2V0SXRlbXMiLCJyZWR1Y2UiLCJvTWFwIiwib0l0ZW0iLCJfU2VtYW50aWNPYmplY3ROYW1lIiwiX1NlbWFudGljT2JqZWN0SGFzQWxyZWFkeVVuYXZhaWxhYmxlQWN0aW9ucyIsIl9VbmF2YWlsYWJsZUFjdGlvbnMiLCJtU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMiLCJvU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMiLCJnZXRBY3Rpb25zIiwiVW5hdmFpbGFibGVBY3Rpb24iXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlF1aWNrVmlld0RlbGVnYXRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IGRlZXBDbG9uZSBmcm9tIFwic2FwL2Jhc2UvdXRpbC9kZWVwQ2xvbmVcIjtcbmltcG9ydCBkZWVwRXF1YWwgZnJvbSBcInNhcC9iYXNlL3V0aWwvZGVlcEVxdWFsXCI7XG5pbXBvcnQgaXNQbGFpbk9iamVjdCBmcm9tIFwic2FwL2Jhc2UvdXRpbC9pc1BsYWluT2JqZWN0XCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgS2VlcEFsaXZlSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0tlZXBBbGl2ZUhlbHBlclwiO1xuaW1wb3J0IHRvRVM2UHJvbWlzZSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Ub0VTNlByb21pc2VcIjtcbmltcG9ydCBQYWdlQ29udHJvbGxlciBmcm9tIFwic2FwL2ZlL2NvcmUvUGFnZUNvbnRyb2xsZXJcIjtcbmltcG9ydCB7IE5hdmlnYXRpb25TZXJ2aWNlIH0gZnJvbSBcInNhcC9mZS9jb3JlL3NlcnZpY2VzL05hdmlnYXRpb25TZXJ2aWNlRmFjdG9yeVwiO1xuaW1wb3J0IHsgZ2V0RHluYW1pY1BhdGhGcm9tU2VtYW50aWNPYmplY3QgfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9TZW1hbnRpY09iamVjdEhlbHBlclwiO1xuaW1wb3J0IEZpZWxkSGVscGVyIGZyb20gXCJzYXAvZmUvbWFjcm9zL2ZpZWxkL0ZpZWxkSGVscGVyXCI7XG5pbXBvcnQgRmllbGRSdW50aW1lIGZyb20gXCJzYXAvZmUvbWFjcm9zL2ZpZWxkL0ZpZWxkUnVudGltZVwiO1xuaW1wb3J0IFNlbGVjdGlvblZhcmlhbnQgZnJvbSBcInNhcC9mZS9uYXZpZ2F0aW9uL1NlbGVjdGlvblZhcmlhbnRcIjtcbmltcG9ydCBDb3JlIGZyb20gXCJzYXAvdWkvY29yZS9Db3JlXCI7XG5pbXBvcnQgRnJhZ21lbnQgZnJvbSBcInNhcC91aS9jb3JlL0ZyYWdtZW50XCI7XG5pbXBvcnQgWE1MUHJlcHJvY2Vzc29yIGZyb20gXCJzYXAvdWkvY29yZS91dGlsL1hNTFByZXByb2Nlc3NvclwiO1xuaW1wb3J0IFhNTFRlbXBsYXRlUHJvY2Vzc29yIGZyb20gXCJzYXAvdWkvY29yZS9YTUxUZW1wbGF0ZVByb2Nlc3NvclwiO1xuaW1wb3J0IEZhY3RvcnkgZnJvbSBcInNhcC91aS9tZGMvbGluay9GYWN0b3J5XCI7XG5pbXBvcnQgTGlua0l0ZW0gZnJvbSBcInNhcC91aS9tZGMvbGluay9MaW5rSXRlbVwiO1xuaW1wb3J0IFNlbWFudGljT2JqZWN0TWFwcGluZyBmcm9tIFwic2FwL3VpL21kYy9saW5rL1NlbWFudGljT2JqZWN0TWFwcGluZ1wiO1xuaW1wb3J0IFNlbWFudGljT2JqZWN0TWFwcGluZ0l0ZW0gZnJvbSBcInNhcC91aS9tZGMvbGluay9TZW1hbnRpY09iamVjdE1hcHBpbmdJdGVtXCI7XG5pbXBvcnQgU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbiBmcm9tIFwic2FwL3VpL21kYy9saW5rL1NlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25cIjtcbmltcG9ydCBMaW5rRGVsZWdhdGUgZnJvbSBcInNhcC91aS9tZGMvTGlua0RlbGVnYXRlXCI7XG5pbXBvcnQgdHlwZSBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvQ29udGV4dFwiO1xuaW1wb3J0IEpTT05Nb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL2pzb24vSlNPTk1vZGVsXCI7XG5pbXBvcnQgdHlwZSBPRGF0YU1ldGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTWV0YU1vZGVsXCI7XG5cbmV4cG9ydCB0eXBlIFJlZ2lzdGVyZWRTZW1hbnRpY09iamVjdE1hcHBpbmcgPSB7IHNlbWFudGljT2JqZWN0OiBzdHJpbmc7IGl0ZW1zOiB7IGtleTogc3RyaW5nOyB2YWx1ZTogc3RyaW5nIH1bXSB9O1xudHlwZSBSZWdpc3RlcmVkU2VtYW50aWNPYmplY3RNYXBwaW5ncyA9IFJlZ2lzdGVyZWRTZW1hbnRpY09iamVjdE1hcHBpbmdbXTtcbmV4cG9ydCB0eXBlIFJlZ2lzdGVyZWRQYXlsb2FkID0ge1xuXHRtYWluU2VtYW50aWNPYmplY3Q/OiBzdHJpbmc7XG5cdHNlbWFudGljT2JqZWN0czogc3RyaW5nW107XG5cdHNlbWFudGljT2JqZWN0c1Jlc29sdmVkPzogc3RyaW5nW107XG5cdHNlbWFudGljT2JqZWN0TWFwcGluZ3M6IFJlZ2lzdGVyZWRTZW1hbnRpY09iamVjdE1hcHBpbmdzO1xuXHRzZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucz86IFJlZ2lzdGVyZWRTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucztcblx0ZW50aXR5VHlwZT86IHN0cmluZztcblx0ZGF0YUZpZWxkPzogc3RyaW5nO1xuXHRjb250YWN0Pzogc3RyaW5nO1xuXHRuYXZpZ2F0aW9uUGF0aD86IHN0cmluZztcblx0cHJvcGVydHlQYXRoTGFiZWw/OiBzdHJpbmc7XG5cdGhhc1F1aWNrVmlld0ZhY2V0cz86IHN0cmluZztcbn07XG5cbmV4cG9ydCB0eXBlIFJlZ2lzdGVyZWRTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucyA9IHtcblx0c2VtYW50aWNPYmplY3Q6IHN0cmluZztcblx0YWN0aW9uczogc3RyaW5nW107XG59W107XG5cbmNvbnN0IFNpbXBsZUxpbmtEZWxlZ2F0ZSA9IE9iamVjdC5hc3NpZ24oe30sIExpbmtEZWxlZ2F0ZSkgYXMgYW55O1xuY29uc3QgQ09OU1RBTlRTID0ge1xuXHRpTGlua3NTaG93bkluUG9wdXA6IDMsXG5cdHNhcG1MaW5rOiBcInNhcC5tLkxpbmtcIixcblx0c2FwdWltZGNMaW5rOiBcInNhcC51aS5tZGMuTGlua1wiLFxuXHRzYXB1aW1kY2xpbmtMaW5rSXRlbTogXCJzYXAudWkubWRjLmxpbmsuTGlua0l0ZW1cIixcblx0c2FwbU9iamVjdElkZW50aWZpZXI6IFwic2FwLm0uT2JqZWN0SWRlbnRpZmllclwiLFxuXHRzYXBtT2JqZWN0U3RhdHVzOiBcInNhcC5tLk9iamVjdFN0YXR1c1wiXG59O1xuU2ltcGxlTGlua0RlbGVnYXRlLmdldENvbnN0YW50cyA9IGZ1bmN0aW9uICgpIHtcblx0cmV0dXJuIENPTlNUQU5UUztcbn07XG4vKipcbiAqIFRoaXMgd2lsbCByZXR1cm4gYW4gYXJyYXkgb2YgdGhlIFNlbWFudGljT2JqZWN0cyBhcyBzdHJpbmdzIGdpdmVuIGJ5IHRoZSBwYXlsb2FkLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0gb1BheWxvYWQgVGhlIHBheWxvYWQgZGVmaW5lZCBieSB0aGUgYXBwbGljYXRpb25cbiAqIEBwYXJhbSBvTWV0YU1vZGVsIFRoZSBPRGF0YU1ldGFNb2RlbCByZWNlaXZlZCBmcm9tIHRoZSBMaW5rXG4gKiBAcmV0dXJucyBUaGUgY29udGV4dCBwb2ludGluZyB0byB0aGUgY3VycmVudCBFbnRpdHlUeXBlLlxuICovXG5TaW1wbGVMaW5rRGVsZWdhdGUuX2dldEVudGl0eVR5cGUgPSBmdW5jdGlvbiAob1BheWxvYWQ6IGFueSwgb01ldGFNb2RlbDogT0RhdGFNZXRhTW9kZWwpIHtcblx0aWYgKG9NZXRhTW9kZWwpIHtcblx0XHRyZXR1cm4gb01ldGFNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChvUGF5bG9hZC5lbnRpdHlUeXBlKTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG59O1xuLyoqXG4gKiBUaGlzIHdpbGwgcmV0dXJuIGFuIGFycmF5IG9mIHRoZSBTZW1hbnRpY09iamVjdHMgYXMgc3RyaW5ncyBnaXZlbiBieSB0aGUgcGF5bG9hZC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIG9QYXlsb2FkIFRoZSBwYXlsb2FkIGRlZmluZWQgYnkgdGhlIGFwcGxpY2F0aW9uXG4gKiBAcGFyYW0gb01ldGFNb2RlbCBUaGUgT0RhdGFNZXRhTW9kZWwgcmVjZWl2ZWQgZnJvbSB0aGUgTGlua1xuICogQHJldHVybnMgQSBtb2RlbCBjb250YWluaW5nIHRoZSBwYXlsb2FkIGluZm9ybWF0aW9uXG4gKi9cblNpbXBsZUxpbmtEZWxlZ2F0ZS5fZ2V0U2VtYW50aWNzTW9kZWwgPSBmdW5jdGlvbiAob1BheWxvYWQ6IG9iamVjdCwgb01ldGFNb2RlbDogb2JqZWN0KSB7XG5cdGlmIChvTWV0YU1vZGVsKSB7XG5cdFx0cmV0dXJuIG5ldyBKU09OTW9kZWwob1BheWxvYWQpO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cbn07XG4vKipcbiAqIFRoaXMgd2lsbCByZXR1cm4gYW4gYXJyYXkgb2YgdGhlIFNlbWFudGljT2JqZWN0cyBhcyBzdHJpbmdzIGdpdmVuIGJ5IHRoZSBwYXlsb2FkLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0gb1BheWxvYWQgVGhlIHBheWxvYWQgZGVmaW5lZCBieSB0aGUgYXBwbGljYXRpb25cbiAqIEBwYXJhbSBvTWV0YU1vZGVsIFRoZSBPRGF0YU1ldGFNb2RlbCByZWNlaXZlZCBmcm9tIHRoZSBMaW5rXG4gKiBAcmV0dXJucyBBbiBhcnJheSBjb250YWluaW5nIFNlbWFudGljT2JqZWN0cyBiYXNlZCBvZiB0aGUgcGF5bG9hZFxuICovXG5TaW1wbGVMaW5rRGVsZWdhdGUuX2dldERhdGFGaWVsZCA9IGZ1bmN0aW9uIChvUGF5bG9hZDogYW55LCBvTWV0YU1vZGVsOiBPRGF0YU1ldGFNb2RlbCkge1xuXHRyZXR1cm4gb01ldGFNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChvUGF5bG9hZC5kYXRhRmllbGQpO1xufTtcbi8qKlxuICogVGhpcyB3aWxsIHJldHVybiBhbiBhcnJheSBvZiB0aGUgU2VtYW50aWNPYmplY3RzIGFzIHN0cmluZ3MgZ2l2ZW4gYnkgdGhlIHBheWxvYWQuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSBvUGF5bG9hZCBUaGUgcGF5bG9hZCBkZWZpbmVkIGJ5IHRoZSBhcHBsaWNhdGlvblxuICogQHBhcmFtIG9NZXRhTW9kZWwgVGhlIE9EYXRhTWV0YU1vZGVsIHJlY2VpdmVkIGZyb20gdGhlIExpbmtcbiAqIEByZXR1cm5zIEFuY29udGFpbmluZyBTZW1hbnRpY09iamVjdHMgYmFzZWQgb2YgdGhlIHBheWxvYWRcbiAqL1xuU2ltcGxlTGlua0RlbGVnYXRlLl9nZXRDb250YWN0ID0gZnVuY3Rpb24gKG9QYXlsb2FkOiBhbnksIG9NZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsKSB7XG5cdHJldHVybiBvTWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KG9QYXlsb2FkLmNvbnRhY3QpO1xufTtcblNpbXBsZUxpbmtEZWxlZ2F0ZS5mblRlbXBsYXRlRnJhZ21lbnQgPSBmdW5jdGlvbiAoKSB7XG5cdGxldCBzRnJhZ21lbnROYW1lOiBzdHJpbmcsIHRpdGxlTGlua0hyZWY7XG5cdGNvbnN0IG9GcmFnbWVudE1vZGVsOiBhbnkgPSB7fTtcblx0bGV0IG9QYXlsb2FkVG9Vc2U7XG5cblx0Ly8gcGF5bG9hZCBoYXMgYmVlbiBtb2RpZmllZCBieSBmZXRjaGluZyBTZW1hbnRpYyBPYmplY3RzIG5hbWVzIHdpdGggcGF0aFxuXHRpZiAodGhpcy5yZXNvbHZlZHBheWxvYWQpIHtcblx0XHRvUGF5bG9hZFRvVXNlID0gdGhpcy5yZXNvbHZlZHBheWxvYWQ7XG5cdH0gZWxzZSB7XG5cdFx0b1BheWxvYWRUb1VzZSA9IHRoaXMucGF5bG9hZDtcblx0fVxuXG5cdGlmIChvUGF5bG9hZFRvVXNlICYmICFvUGF5bG9hZFRvVXNlLkxpbmtJZCkge1xuXHRcdG9QYXlsb2FkVG9Vc2UuTGlua0lkID0gdGhpcy5vQ29udHJvbCAmJiB0aGlzLm9Db250cm9sLmlzQShDT05TVEFOVFMuc2FwdWltZGNMaW5rKSA/IHRoaXMub0NvbnRyb2wuZ2V0SWQoKSA6IHVuZGVmaW5lZDtcblx0fVxuXG5cdGlmIChvUGF5bG9hZFRvVXNlLkxpbmtJZCkge1xuXHRcdHRpdGxlTGlua0hyZWYgPSB0aGlzLm9Db250cm9sLmdldE1vZGVsKFwiJHNhcHVpbWRjTGlua1wiKS5nZXRQcm9wZXJ0eShcIi90aXRsZUxpbmtIcmVmXCIpO1xuXHRcdG9QYXlsb2FkVG9Vc2UudGl0bGVsaW5rID0gdGl0bGVMaW5rSHJlZjtcblx0fVxuXG5cdGNvbnN0IG9TZW1hbnRpY3NNb2RlbCA9IHRoaXMuX2dldFNlbWFudGljc01vZGVsKG9QYXlsb2FkVG9Vc2UsIHRoaXMub01ldGFNb2RlbCk7XG5cdHRoaXMuc2VtYW50aWNNb2RlbCA9IG9TZW1hbnRpY3NNb2RlbDtcblxuXHRpZiAob1BheWxvYWRUb1VzZS5lbnRpdHlUeXBlICYmIHRoaXMuX2dldEVudGl0eVR5cGUob1BheWxvYWRUb1VzZSwgdGhpcy5vTWV0YU1vZGVsKSkge1xuXHRcdHNGcmFnbWVudE5hbWUgPSBcInNhcC5mZS5tYWNyb3MucXVpY2tWaWV3LmZyYWdtZW50cy5FbnRpdHlRdWlja1ZpZXdcIjtcblx0XHRvRnJhZ21lbnRNb2RlbC5iaW5kaW5nQ29udGV4dHMgPSB7XG5cdFx0XHRlbnRpdHlUeXBlOiB0aGlzLl9nZXRFbnRpdHlUeXBlKG9QYXlsb2FkVG9Vc2UsIHRoaXMub01ldGFNb2RlbCksXG5cdFx0XHRzZW1hbnRpYzogb1NlbWFudGljc01vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KFwiL1wiKVxuXHRcdH07XG5cdFx0b0ZyYWdtZW50TW9kZWwubW9kZWxzID0ge1xuXHRcdFx0ZW50aXR5VHlwZTogdGhpcy5vTWV0YU1vZGVsLFxuXHRcdFx0c2VtYW50aWM6IG9TZW1hbnRpY3NNb2RlbFxuXHRcdH07XG5cdH0gZWxzZSBpZiAob1BheWxvYWRUb1VzZS5kYXRhRmllbGQgJiYgdGhpcy5fZ2V0RGF0YUZpZWxkKG9QYXlsb2FkVG9Vc2UsIHRoaXMub01ldGFNb2RlbCkpIHtcblx0XHRzRnJhZ21lbnROYW1lID0gXCJzYXAuZmUubWFjcm9zLnF1aWNrVmlldy5mcmFnbWVudHMuRGF0YUZpZWxkUXVpY2tWaWV3XCI7XG5cdFx0b0ZyYWdtZW50TW9kZWwuYmluZGluZ0NvbnRleHRzID0ge1xuXHRcdFx0ZGF0YUZpZWxkOiB0aGlzLl9nZXREYXRhRmllbGQob1BheWxvYWRUb1VzZSwgdGhpcy5vTWV0YU1vZGVsKSxcblx0XHRcdHNlbWFudGljOiBvU2VtYW50aWNzTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoXCIvXCIpXG5cdFx0fTtcblx0XHRvRnJhZ21lbnRNb2RlbC5tb2RlbHMgPSB7XG5cdFx0XHRkYXRhRmllbGQ6IHRoaXMub01ldGFNb2RlbCxcblx0XHRcdHNlbWFudGljOiBvU2VtYW50aWNzTW9kZWxcblx0XHR9O1xuXHR9XG5cdG9GcmFnbWVudE1vZGVsLm1vZGVscy5lbnRpdHlTZXQgPSB0aGlzLm9NZXRhTW9kZWw7XG5cdG9GcmFnbWVudE1vZGVsLm1vZGVscy5tZXRhTW9kZWwgPSB0aGlzLm9NZXRhTW9kZWw7XG5cdGlmICh0aGlzLm9Db250cm9sICYmIHRoaXMub0NvbnRyb2wuZ2V0TW9kZWwoXCJ2aWV3RGF0YVwiKSkge1xuXHRcdG9GcmFnbWVudE1vZGVsLm1vZGVscy52aWV3RGF0YSA9IHRoaXMub0NvbnRyb2wuZ2V0TW9kZWwoXCJ2aWV3RGF0YVwiKTtcblx0XHRvRnJhZ21lbnRNb2RlbC5iaW5kaW5nQ29udGV4dHMudmlld0RhdGEgPSB0aGlzLm9Db250cm9sLmdldE1vZGVsKFwidmlld0RhdGFcIikuY3JlYXRlQmluZGluZ0NvbnRleHQoXCIvXCIpO1xuXHR9XG5cblx0Y29uc3Qgb0ZyYWdtZW50ID0gWE1MVGVtcGxhdGVQcm9jZXNzb3IubG9hZFRlbXBsYXRlKHNGcmFnbWVudE5hbWUhLCBcImZyYWdtZW50XCIpO1xuXG5cdHJldHVybiBQcm9taXNlLnJlc29sdmUoWE1MUHJlcHJvY2Vzc29yLnByb2Nlc3Mob0ZyYWdtZW50LCB7IG5hbWU6IHNGcmFnbWVudE5hbWUhIH0sIG9GcmFnbWVudE1vZGVsKSlcblx0XHQudGhlbigoX2ludGVybmFsRnJhZ21lbnQ6IGFueSkgPT4ge1xuXHRcdFx0cmV0dXJuIEZyYWdtZW50LmxvYWQoe1xuXHRcdFx0XHRkZWZpbml0aW9uOiBfaW50ZXJuYWxGcmFnbWVudCxcblx0XHRcdFx0Y29udHJvbGxlcjogdGhpc1xuXHRcdFx0fSk7XG5cdFx0fSlcblx0XHQudGhlbigob1BvcG92ZXJDb250ZW50OiBhbnkpID0+IHtcblx0XHRcdGlmIChvUG9wb3ZlckNvbnRlbnQpIHtcblx0XHRcdFx0aWYgKG9GcmFnbWVudE1vZGVsLm1vZGVscyAmJiBvRnJhZ21lbnRNb2RlbC5tb2RlbHMuc2VtYW50aWMpIHtcblx0XHRcdFx0XHRvUG9wb3ZlckNvbnRlbnQuc2V0TW9kZWwob0ZyYWdtZW50TW9kZWwubW9kZWxzLnNlbWFudGljLCBcInNlbWFudGljXCIpO1xuXHRcdFx0XHRcdG9Qb3BvdmVyQ29udGVudC5zZXRCaW5kaW5nQ29udGV4dChvRnJhZ21lbnRNb2RlbC5iaW5kaW5nQ29udGV4dHMuc2VtYW50aWMsIFwic2VtYW50aWNcIik7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAob0ZyYWdtZW50TW9kZWwuYmluZGluZ0NvbnRleHRzICYmIG9GcmFnbWVudE1vZGVsLmJpbmRpbmdDb250ZXh0cy5lbnRpdHlUeXBlKSB7XG5cdFx0XHRcdFx0b1BvcG92ZXJDb250ZW50LnNldE1vZGVsKG9GcmFnbWVudE1vZGVsLm1vZGVscy5lbnRpdHlUeXBlLCBcImVudGl0eVR5cGVcIik7XG5cdFx0XHRcdFx0b1BvcG92ZXJDb250ZW50LnNldEJpbmRpbmdDb250ZXh0KG9GcmFnbWVudE1vZGVsLmJpbmRpbmdDb250ZXh0cy5lbnRpdHlUeXBlLCBcImVudGl0eVR5cGVcIik7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHRoaXMucmVzb2x2ZWRwYXlsb2FkID0gdW5kZWZpbmVkO1xuXHRcdFx0cmV0dXJuIG9Qb3BvdmVyQ29udGVudDtcblx0XHR9KTtcbn07XG5TaW1wbGVMaW5rRGVsZWdhdGUuZmV0Y2hBZGRpdGlvbmFsQ29udGVudCA9IGZ1bmN0aW9uIChvUGF5TG9hZDogYW55LCBvTWRjTGlua0NvbnRyb2w6IGFueSkge1xuXHR0aGlzLm9Db250cm9sID0gb01kY0xpbmtDb250cm9sO1xuXHRjb25zdCBhTmF2aWdhdGVSZWdleHBNYXRjaCA9IG9QYXlMb2FkPy5uYXZpZ2F0aW9uUGF0aD8ubWF0Y2goL3soLio/KX0vKTtcblx0Y29uc3Qgb0JpbmRpbmdDb250ZXh0ID1cblx0XHRhTmF2aWdhdGVSZWdleHBNYXRjaCAmJiBhTmF2aWdhdGVSZWdleHBNYXRjaC5sZW5ndGggPiAxICYmIGFOYXZpZ2F0ZVJlZ2V4cE1hdGNoWzFdXG5cdFx0XHQ/IG9NZGNMaW5rQ29udHJvbC5nZXRNb2RlbCgpLmJpbmRDb250ZXh0KGFOYXZpZ2F0ZVJlZ2V4cE1hdGNoWzFdLCBvTWRjTGlua0NvbnRyb2wuZ2V0QmluZGluZ0NvbnRleHQoKSwgeyAkJG93blJlcXVlc3Q6IHRydWUgfSlcblx0XHRcdDogbnVsbDtcblx0dGhpcy5wYXlsb2FkID0gb1BheUxvYWQ7XG5cdGlmIChvTWRjTGlua0NvbnRyb2wgJiYgb01kY0xpbmtDb250cm9sLmlzQShDT05TVEFOVFMuc2FwdWltZGNMaW5rKSkge1xuXHRcdHRoaXMub01ldGFNb2RlbCA9IG9NZGNMaW5rQ29udHJvbC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpO1xuXHRcdHJldHVybiB0aGlzLmZuVGVtcGxhdGVGcmFnbWVudCgpLnRoZW4oZnVuY3Rpb24gKG9Qb3BvdmVyQ29udGVudDogYW55KSB7XG5cdFx0XHRpZiAob0JpbmRpbmdDb250ZXh0KSB7XG5cdFx0XHRcdG9Qb3BvdmVyQ29udGVudC5zZXRCaW5kaW5nQ29udGV4dChvQmluZGluZ0NvbnRleHQuZ2V0Qm91bmRDb250ZXh0KCkpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIFtvUG9wb3ZlckNvbnRlbnRdO1xuXHRcdH0pO1xuXHR9XG5cdHJldHVybiBQcm9taXNlLnJlc29sdmUoW10pO1xufTtcblNpbXBsZUxpbmtEZWxlZ2F0ZS5fZmV0Y2hMaW5rQ3VzdG9tRGF0YSA9IGZ1bmN0aW9uIChfb0xpbms6IGFueSkge1xuXHRpZiAoXG5cdFx0X29MaW5rLmdldFBhcmVudCgpICYmXG5cdFx0X29MaW5rLmlzQShDT05TVEFOVFMuc2FwdWltZGNMaW5rKSAmJlxuXHRcdChfb0xpbmsuZ2V0UGFyZW50KCkuaXNBKENPTlNUQU5UUy5zYXBtTGluaykgfHxcblx0XHRcdF9vTGluay5nZXRQYXJlbnQoKS5pc0EoQ09OU1RBTlRTLnNhcG1PYmplY3RJZGVudGlmaWVyKSB8fFxuXHRcdFx0X29MaW5rLmdldFBhcmVudCgpLmlzQShDT05TVEFOVFMuc2FwbU9iamVjdFN0YXR1cykpXG5cdCkge1xuXHRcdHJldHVybiBfb0xpbmsuZ2V0Q3VzdG9tRGF0YSgpO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cbn07XG4vKipcbiAqIEZldGNoZXMgdGhlIHJlbGV2YW50IHtAbGluayBzYXAudWkubWRjLmxpbmsuTGlua0l0ZW19IGZvciB0aGUgTGluayBhbmQgcmV0dXJucyB0aGVtLlxuICpcbiAqIEBwdWJsaWNcbiAqIEBwYXJhbSBvUGF5bG9hZCBUaGUgUGF5bG9hZCBvZiB0aGUgTGluayBnaXZlbiBieSB0aGUgYXBwbGljYXRpb25cbiAqIEBwYXJhbSBvQmluZGluZ0NvbnRleHQgVGhlIENvbnRleHRPYmplY3Qgb2YgdGhlIExpbmtcbiAqIEBwYXJhbSBvSW5mb0xvZyBUaGUgSW5mb0xvZyBvZiB0aGUgTGlua1xuICogQHJldHVybnMgT25jZSByZXNvbHZlZCBhbiBhcnJheSBvZiB7QGxpbmsgc2FwLnVpLm1kYy5saW5rLkxpbmtJdGVtfSBpcyByZXR1cm5lZFxuICovXG5TaW1wbGVMaW5rRGVsZWdhdGUuZmV0Y2hMaW5rSXRlbXMgPSBmdW5jdGlvbiAob1BheWxvYWQ6IGFueSwgb0JpbmRpbmdDb250ZXh0OiBDb250ZXh0LCBvSW5mb0xvZzogYW55KSB7XG5cdGlmIChvQmluZGluZ0NvbnRleHQgJiYgU2ltcGxlTGlua0RlbGVnYXRlLl9nZXRTZW1hbnRpY09iamVjdHMob1BheWxvYWQpKSB7XG5cdFx0Y29uc3Qgb0NvbnRleHRPYmplY3QgPSBvQmluZGluZ0NvbnRleHQuZ2V0T2JqZWN0KCk7XG5cdFx0aWYgKG9JbmZvTG9nKSB7XG5cdFx0XHRvSW5mb0xvZy5pbml0aWFsaXplKFNpbXBsZUxpbmtEZWxlZ2F0ZS5fZ2V0U2VtYW50aWNPYmplY3RzKG9QYXlsb2FkKSk7XG5cdFx0fVxuXHRcdGNvbnN0IF9vTGlua0N1c3RvbURhdGEgPSB0aGlzLl9saW5rICYmIHRoaXMuX2ZldGNoTGlua0N1c3RvbURhdGEodGhpcy5fbGluayk7XG5cdFx0dGhpcy5hTGlua0N1c3RvbURhdGEgPVxuXHRcdFx0X29MaW5rQ3VzdG9tRGF0YSAmJlxuXHRcdFx0dGhpcy5fZmV0Y2hMaW5rQ3VzdG9tRGF0YSh0aGlzLl9saW5rKS5tYXAoZnVuY3Rpb24gKGxpbmtJdGVtOiBhbnkpIHtcblx0XHRcdFx0cmV0dXJuIGxpbmtJdGVtLm1Qcm9wZXJ0aWVzLnZhbHVlO1xuXHRcdFx0fSk7XG5cblx0XHRjb25zdCBvU2VtYW50aWNBdHRyaWJ1dGVzUmVzb2x2ZWQgPSBTaW1wbGVMaW5rRGVsZWdhdGUuX2NhbGN1bGF0ZVNlbWFudGljQXR0cmlidXRlcyhvQ29udGV4dE9iamVjdCwgb1BheWxvYWQsIG9JbmZvTG9nLCB0aGlzLl9saW5rKTtcblx0XHRjb25zdCBvU2VtYW50aWNBdHRyaWJ1dGVzID0gb1NlbWFudGljQXR0cmlidXRlc1Jlc29sdmVkLnJlc3VsdHM7XG5cdFx0Y29uc3Qgb1BheWxvYWRSZXNvbHZlZCA9IG9TZW1hbnRpY0F0dHJpYnV0ZXNSZXNvbHZlZC5wYXlsb2FkO1xuXG5cdFx0cmV0dXJuIFNpbXBsZUxpbmtEZWxlZ2F0ZS5fcmV0cmlldmVOYXZpZ2F0aW9uVGFyZ2V0cyhcIlwiLCBvU2VtYW50aWNBdHRyaWJ1dGVzLCBvUGF5bG9hZFJlc29sdmVkLCBvSW5mb0xvZywgdGhpcy5fbGluaykudGhlbihcblx0XHRcdGZ1bmN0aW9uIChhTGlua3M6IGFueSAvKm9Pd25OYXZpZ2F0aW9uTGluazogYW55Ki8pIHtcblx0XHRcdFx0cmV0dXJuIGFMaW5rcy5sZW5ndGggPT09IDAgPyBudWxsIDogYUxpbmtzO1xuXHRcdFx0fVxuXHRcdCk7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShudWxsKTtcblx0fVxufTtcblxuLyoqXG4gKiBGaW5kIHRoZSB0eXBlIG9mIHRoZSBsaW5rLlxuICpcbiAqIEBwYXJhbSBwYXlsb2FkIFRoZSBwYXlsb2FkIG9mIHRoZSBtZGMgbGluay5cbiAqIEBwYXJhbSBhTGlua0l0ZW1zIExpbmtzIHJldHVybmVkIGJ5IGNhbGwgdG8gbWRjIF9yZXRyaWV2ZVVubW9kaWZpZWRMaW5rSXRlbXMuXG4gKiBAcmV0dXJucyBUaGUgdHlwZSBvZiB0aGUgbGluayBhcyBkZWZpbmVkIGJ5IG1kYy5cbiAqL1xuU2ltcGxlTGlua0RlbGVnYXRlLl9maW5kTGlua1R5cGUgPSBmdW5jdGlvbiAocGF5bG9hZDogYW55LCBhTGlua0l0ZW1zOiBhbnlbXSk6IGFueSB7XG5cdGxldCBuTGlua1R5cGUsIG9MaW5rSXRlbTtcblx0aWYgKGFMaW5rSXRlbXM/Lmxlbmd0aCA9PT0gMSkge1xuXHRcdG9MaW5rSXRlbSA9IG5ldyBMaW5rSXRlbSh7XG5cdFx0XHR0ZXh0OiBhTGlua0l0ZW1zWzBdLmdldFRleHQoKSxcblx0XHRcdGhyZWY6IGFMaW5rSXRlbXNbMF0uZ2V0SHJlZigpXG5cdFx0fSk7XG5cdFx0bkxpbmtUeXBlID0gcGF5bG9hZC5oYXNRdWlja1ZpZXdGYWNldHMgPT09IFwiZmFsc2VcIiA/IDEgOiAyO1xuXHR9IGVsc2UgaWYgKHBheWxvYWQuaGFzUXVpY2tWaWV3RmFjZXRzID09PSBcImZhbHNlXCIgJiYgYUxpbmtJdGVtcz8ubGVuZ3RoID09PSAwKSB7XG5cdFx0bkxpbmtUeXBlID0gMDtcblx0fSBlbHNlIHtcblx0XHRuTGlua1R5cGUgPSAyO1xuXHR9XG5cdHJldHVybiB7XG5cdFx0bGlua1R5cGU6IG5MaW5rVHlwZSxcblx0XHRsaW5rSXRlbTogb0xpbmtJdGVtXG5cdH07XG59O1xuU2ltcGxlTGlua0RlbGVnYXRlLmZldGNoTGlua1R5cGUgPSBhc3luYyBmdW5jdGlvbiAob1BheWxvYWQ6IGFueSwgb0xpbms6IGFueSkge1xuXHRjb25zdCBfb0N1cnJlbnRMaW5rID0gb0xpbms7XG5cdGNvbnN0IF9vUGF5bG9hZCA9IE9iamVjdC5hc3NpZ24oe30sIG9QYXlsb2FkKTtcblx0Y29uc3Qgb0RlZmF1bHRJbml0aWFsVHlwZSA9IHtcblx0XHRpbml0aWFsVHlwZToge1xuXHRcdFx0dHlwZTogMixcblx0XHRcdGRpcmVjdExpbms6IHVuZGVmaW5lZFxuXHRcdH0sXG5cdFx0cnVudGltZVR5cGU6IHVuZGVmaW5lZFxuXHR9O1xuXHQvLyBjbGVhbiBhcHBTdGF0ZUtleU1hcCBzdG9yYWdlXG5cdGlmICghdGhpcy5hcHBTdGF0ZUtleU1hcCkge1xuXHRcdHRoaXMuYXBwU3RhdGVLZXlNYXAgPSB7fTtcblx0fVxuXG5cdHRyeSB7XG5cdFx0aWYgKF9vUGF5bG9hZD8uc2VtYW50aWNPYmplY3RzKSB7XG5cdFx0XHR0aGlzLl9saW5rID0gb0xpbms7XG5cdFx0XHRjb25zdCBhTGlua0l0ZW1zID0gYXdhaXQgX29DdXJyZW50TGluay5fcmV0cmlldmVVbm1vZGlmaWVkTGlua0l0ZW1zKCk7XG5cdFx0XHRjb25zdCBfTGlua1R5cGUgPSBTaW1wbGVMaW5rRGVsZWdhdGUuX2ZpbmRMaW5rVHlwZShfb1BheWxvYWQsIGFMaW5rSXRlbXMpO1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0aW5pdGlhbFR5cGU6IHtcblx0XHRcdFx0XHR0eXBlOiBfTGlua1R5cGUubGlua1R5cGUsXG5cdFx0XHRcdFx0ZGlyZWN0TGluazogX0xpbmtUeXBlLmxpbmtJdGVtID8gX0xpbmtUeXBlLmxpbmtJdGVtIDogdW5kZWZpbmVkXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHJ1bnRpbWVUeXBlOiB1bmRlZmluZWRcblx0XHRcdH07XG5cdFx0fSBlbHNlIGlmIChfb1BheWxvYWQ/LmNvbnRhY3Q/Lmxlbmd0aCA+IDApIHtcblx0XHRcdHJldHVybiBvRGVmYXVsdEluaXRpYWxUeXBlO1xuXHRcdH0gZWxzZSBpZiAoX29QYXlsb2FkPy5lbnRpdHlUeXBlICYmIF9vUGF5bG9hZD8ubmF2aWdhdGlvblBhdGgpIHtcblx0XHRcdHJldHVybiBvRGVmYXVsdEluaXRpYWxUeXBlO1xuXHRcdH1cblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJubyBwYXlsb2FkIG9yIHNlbWFudGljT2JqZWN0cyBmb3VuZFwiKTtcblx0fSBjYXRjaCAob0Vycm9yOiBhbnkpIHtcblx0XHRMb2cuZXJyb3IoXCJFcnJvciBpbiBTaW1wbGVMaW5rRGVsZWdhdGUuZmV0Y2hMaW5rVHlwZTogXCIsIG9FcnJvcik7XG5cdH1cbn07XG5cblNpbXBsZUxpbmtEZWxlZ2F0ZS5fUmVtb3ZlVGl0bGVMaW5rRnJvbVRhcmdldHMgPSBmdW5jdGlvbiAoX2FMaW5rSXRlbXM6IGFueVtdLCBfYlRpdGxlSGFzTGluazogYm9vbGVhbiwgX2FUaXRsZUxpbms6IGFueSk6IGFueSB7XG5cdGxldCBfc1RpdGxlTGlua0hyZWYsIF9vTURDTGluaztcblx0bGV0IGJSZXN1bHQ6IGJvb2xlYW4gPSBmYWxzZTtcblx0aWYgKF9iVGl0bGVIYXNMaW5rICYmIF9hVGl0bGVMaW5rICYmIF9hVGl0bGVMaW5rWzBdKSB7XG5cdFx0bGV0IGxpbmtJc1ByaW1hcnlBY3Rpb246IGJvb2xlYW4sIF9zTGlua0ludGVudFdpdGhvdXRQYXJhbWV0ZXJzOiBzdHJpbmc7XG5cdFx0Y29uc3QgX3NUaXRsZUludGVudCA9IF9hVGl0bGVMaW5rWzBdLmludGVudC5zcGxpdChcIj9cIilbMF07XG5cdFx0aWYgKF9hTGlua0l0ZW1zICYmIF9hTGlua0l0ZW1zWzBdKSB7XG5cdFx0XHRfc0xpbmtJbnRlbnRXaXRob3V0UGFyYW1ldGVycyA9IGAjJHtfYUxpbmtJdGVtc1swXS5nZXRQcm9wZXJ0eShcImtleVwiKX1gO1xuXHRcdFx0bGlua0lzUHJpbWFyeUFjdGlvbiA9IF9zVGl0bGVJbnRlbnQgPT09IF9zTGlua0ludGVudFdpdGhvdXRQYXJhbWV0ZXJzO1xuXHRcdFx0aWYgKGxpbmtJc1ByaW1hcnlBY3Rpb24pIHtcblx0XHRcdFx0X3NUaXRsZUxpbmtIcmVmID0gX2FMaW5rSXRlbXNbMF0uZ2V0UHJvcGVydHkoXCJocmVmXCIpO1xuXHRcdFx0XHR0aGlzLnBheWxvYWQudGl0bGVsaW5raHJlZiA9IF9zVGl0bGVMaW5rSHJlZjtcblx0XHRcdFx0aWYgKF9hTGlua0l0ZW1zWzBdLmlzQShDT05TVEFOVFMuc2FwdWltZGNsaW5rTGlua0l0ZW0pKSB7XG5cdFx0XHRcdFx0X29NRENMaW5rID0gX2FMaW5rSXRlbXNbMF0uZ2V0UGFyZW50KCk7XG5cdFx0XHRcdFx0X29NRENMaW5rLmdldE1vZGVsKFwiJHNhcHVpbWRjTGlua1wiKS5zZXRQcm9wZXJ0eShcIi90aXRsZUxpbmtIcmVmXCIsIF9zVGl0bGVMaW5rSHJlZik7XG5cdFx0XHRcdFx0Y29uc3QgYU1MaW5rSXRlbXMgPSBfb01EQ0xpbmtcblx0XHRcdFx0XHRcdC5nZXRNb2RlbChcIiRzYXB1aW1kY0xpbmtcIilcblx0XHRcdFx0XHRcdC5nZXRQcm9wZXJ0eShcIi9saW5rSXRlbXNcIilcblx0XHRcdFx0XHRcdC5maWx0ZXIoZnVuY3Rpb24gKG9MaW5rSXRlbTogYW55KSB7XG5cdFx0XHRcdFx0XHRcdGlmIChgIyR7b0xpbmtJdGVtLmtleX1gICE9PSBfc0xpbmtJbnRlbnRXaXRob3V0UGFyYW1ldGVycykge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBvTGlua0l0ZW07XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdGlmIChhTUxpbmtJdGVtcyAmJiBhTUxpbmtJdGVtcy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0XHRfb01EQ0xpbmsuZ2V0TW9kZWwoXCIkc2FwdWltZGNMaW5rXCIpLnNldFByb3BlcnR5KFwiL2xpbmtJdGVtcy9cIiwgYU1MaW5rSXRlbXMpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRiUmVzdWx0ID0gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gYlJlc3VsdDtcbn07XG5TaW1wbGVMaW5rRGVsZWdhdGUuX0lzU2VtYW50aWNPYmplY3REeW5hbWljID0gZnVuY3Rpb24gKGFOZXdMaW5rQ3VzdG9tRGF0YTogYW55LCBvVGhpczogYW55KSB7XG5cdGlmIChhTmV3TGlua0N1c3RvbURhdGEgJiYgb1RoaXMuYUxpbmtDdXN0b21EYXRhKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdG9UaGlzLmFMaW5rQ3VzdG9tRGF0YS5maWx0ZXIoZnVuY3Rpb24gKGxpbms6IGFueSkge1xuXHRcdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHRcdGFOZXdMaW5rQ3VzdG9tRGF0YS5maWx0ZXIoZnVuY3Rpb24gKG90aGVyTGluazogYW55KSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gb3RoZXJMaW5rICE9PSBsaW5rO1xuXHRcdFx0XHRcdH0pLmxlbmd0aCA+IDBcblx0XHRcdFx0KTtcblx0XHRcdH0pLmxlbmd0aCA+IDBcblx0XHQpO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxufTtcblNpbXBsZUxpbmtEZWxlZ2F0ZS5fZ2V0TGluZUNvbnRleHQgPSBmdW5jdGlvbiAob1ZpZXc6IGFueSwgbUxpbmVDb250ZXh0OiBhbnkpIHtcblx0aWYgKCFtTGluZUNvbnRleHQpIHtcblx0XHRpZiAob1ZpZXcuZ2V0QWdncmVnYXRpb24oXCJjb250ZW50XCIpWzBdICYmIG9WaWV3LmdldEFnZ3JlZ2F0aW9uKFwiY29udGVudFwiKVswXS5nZXRCaW5kaW5nQ29udGV4dCgpKSB7XG5cdFx0XHRyZXR1cm4gb1ZpZXcuZ2V0QWdncmVnYXRpb24oXCJjb250ZW50XCIpWzBdLmdldEJpbmRpbmdDb250ZXh0KCk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBtTGluZUNvbnRleHQ7XG59O1xuU2ltcGxlTGlua0RlbGVnYXRlLl9zZXRGaWx0ZXJDb250ZXh0VXJsRm9yU2VsZWN0aW9uVmFyaWFudCA9IGZ1bmN0aW9uIChcblx0b1ZpZXc6IGFueSxcblx0b1NlbGVjdGlvblZhcmlhbnQ6IFNlbGVjdGlvblZhcmlhbnQsXG5cdG9OYXZpZ2F0aW9uU2VydmljZTogYW55XG4pOiBTZWxlY3Rpb25WYXJpYW50IHtcblx0aWYgKG9WaWV3LmdldFZpZXdEYXRhKCkuZW50aXR5U2V0ICYmIG9TZWxlY3Rpb25WYXJpYW50KSB7XG5cdFx0Y29uc3Qgc0NvbnRleHRVcmwgPSBvTmF2aWdhdGlvblNlcnZpY2UuY29uc3RydWN0Q29udGV4dFVybChvVmlldy5nZXRWaWV3RGF0YSgpLmVudGl0eVNldCwgb1ZpZXcuZ2V0TW9kZWwoKSk7XG5cdFx0b1NlbGVjdGlvblZhcmlhbnQuc2V0RmlsdGVyQ29udGV4dFVybChzQ29udGV4dFVybCk7XG5cdH1cblx0cmV0dXJuIG9TZWxlY3Rpb25WYXJpYW50O1xufTtcblxuU2ltcGxlTGlua0RlbGVnYXRlLl9zZXRPYmplY3RNYXBwaW5ncyA9IGZ1bmN0aW9uIChcblx0c1NlbWFudGljT2JqZWN0OiBzdHJpbmcsXG5cdG9QYXJhbXM6IGFueSxcblx0YVNlbWFudGljT2JqZWN0TWFwcGluZ3M6IFJlZ2lzdGVyZWRTZW1hbnRpY09iamVjdE1hcHBpbmdzLFxuXHRvU2VsZWN0aW9uVmFyaWFudDogU2VsZWN0aW9uVmFyaWFudFxuKSB7XG5cdGxldCBoYXNDaGFuZ2VkID0gZmFsc2U7XG5cdGNvbnN0IG1vZGlmaWVkU2VsZWN0aW9uVmFyaWFudCA9IG5ldyBTZWxlY3Rpb25WYXJpYW50KG9TZWxlY3Rpb25WYXJpYW50LnRvSlNPTk9iamVjdCgpKTtcblx0Ly8gaWYgc2VtYW50aWNPYmplY3RNYXBwaW5ncyBoYXMgaXRlbXMgd2l0aCBkeW5hbWljIHNlbWFudGljT2JqZWN0cyB3ZSBuZWVkIHRvIHJlc29sdmUgdGhlbSB1c2luZyBvUGFyYW1zXG5cdGFTZW1hbnRpY09iamVjdE1hcHBpbmdzLmZvckVhY2goZnVuY3Rpb24gKG1hcHBpbmcpIHtcblx0XHRsZXQgbWFwcGluZ1NlbWFudGljT2JqZWN0ID0gbWFwcGluZy5zZW1hbnRpY09iamVjdDtcblx0XHRjb25zdCBtYXBwaW5nU2VtYW50aWNPYmplY3RQYXRoID0gZ2V0RHluYW1pY1BhdGhGcm9tU2VtYW50aWNPYmplY3QobWFwcGluZy5zZW1hbnRpY09iamVjdCk7XG5cdFx0aWYgKG1hcHBpbmdTZW1hbnRpY09iamVjdFBhdGggJiYgb1BhcmFtc1ttYXBwaW5nU2VtYW50aWNPYmplY3RQYXRoXSkge1xuXHRcdFx0bWFwcGluZ1NlbWFudGljT2JqZWN0ID0gb1BhcmFtc1ttYXBwaW5nU2VtYW50aWNPYmplY3RQYXRoXTtcblx0XHR9XG5cdFx0aWYgKHNTZW1hbnRpY09iamVjdCA9PT0gbWFwcGluZ1NlbWFudGljT2JqZWN0KSB7XG5cdFx0XHRjb25zdCBvTWFwcGluZ3MgPSBtYXBwaW5nLml0ZW1zO1xuXHRcdFx0Zm9yIChjb25zdCBpIGluIG9NYXBwaW5ncykge1xuXHRcdFx0XHRjb25zdCBzTG9jYWxQcm9wZXJ0eSA9IG9NYXBwaW5nc1tpXS5rZXk7XG5cdFx0XHRcdGNvbnN0IHNTZW1hbnRpY09iamVjdFByb3BlcnR5ID0gb01hcHBpbmdzW2ldLnZhbHVlO1xuXHRcdFx0XHRpZiAoc0xvY2FsUHJvcGVydHkgIT09IHNTZW1hbnRpY09iamVjdFByb3BlcnR5KSB7XG5cdFx0XHRcdFx0aWYgKG9QYXJhbXNbc0xvY2FsUHJvcGVydHldKSB7XG5cdFx0XHRcdFx0XHRtb2RpZmllZFNlbGVjdGlvblZhcmlhbnQucmVtb3ZlUGFyYW1ldGVyKHNTZW1hbnRpY09iamVjdFByb3BlcnR5KTtcblx0XHRcdFx0XHRcdG1vZGlmaWVkU2VsZWN0aW9uVmFyaWFudC5yZW1vdmVTZWxlY3RPcHRpb24oc1NlbWFudGljT2JqZWN0UHJvcGVydHkpO1xuXHRcdFx0XHRcdFx0bW9kaWZpZWRTZWxlY3Rpb25WYXJpYW50LnJlbmFtZVBhcmFtZXRlcihzTG9jYWxQcm9wZXJ0eSwgc1NlbWFudGljT2JqZWN0UHJvcGVydHkpO1xuXHRcdFx0XHRcdFx0bW9kaWZpZWRTZWxlY3Rpb25WYXJpYW50LnJlbmFtZVNlbGVjdE9wdGlvbihzTG9jYWxQcm9wZXJ0eSwgc1NlbWFudGljT2JqZWN0UHJvcGVydHkpO1xuXHRcdFx0XHRcdFx0b1BhcmFtc1tzU2VtYW50aWNPYmplY3RQcm9wZXJ0eV0gPSBvUGFyYW1zW3NMb2NhbFByb3BlcnR5XTtcblx0XHRcdFx0XHRcdGRlbGV0ZSBvUGFyYW1zW3NMb2NhbFByb3BlcnR5XTtcblx0XHRcdFx0XHRcdGhhc0NoYW5nZWQgPSB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvLyBXZSByZW1vdmUgdGhlIHBhcmFtZXRlciBhcyB0aGVyZSBpcyBubyB2YWx1ZVxuXG5cdFx0XHRcdFx0Ly8gVGhlIGxvY2FsIHByb3BlcnR5IGNvbWVzIGZyb20gYSBuYXZpZ2F0aW9uIHByb3BlcnR5XG5cdFx0XHRcdFx0ZWxzZSBpZiAoc0xvY2FsUHJvcGVydHkuc3BsaXQoXCIvXCIpLmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0XHRcdC8vIGZpbmQgdGhlIHByb3BlcnR5IHRvIGJlIHJlbW92ZWRcblx0XHRcdFx0XHRcdGNvbnN0IHByb3BlcnR5VG9CZVJlbW92ZWQgPSBzTG9jYWxQcm9wZXJ0eS5zcGxpdChcIi9cIikuc2xpY2UoLTEpWzBdO1xuXHRcdFx0XHRcdFx0Ly8gVGhlIG5hdmlnYXRpb24gcHJvcGVydHkgaGFzIG5vIHZhbHVlXG5cdFx0XHRcdFx0XHRpZiAoIW9QYXJhbXNbcHJvcGVydHlUb0JlUmVtb3ZlZF0pIHtcblx0XHRcdFx0XHRcdFx0ZGVsZXRlIG9QYXJhbXNbcHJvcGVydHlUb0JlUmVtb3ZlZF07XG5cdFx0XHRcdFx0XHRcdG1vZGlmaWVkU2VsZWN0aW9uVmFyaWFudC5yZW1vdmVQYXJhbWV0ZXIocHJvcGVydHlUb0JlUmVtb3ZlZCk7XG5cdFx0XHRcdFx0XHRcdG1vZGlmaWVkU2VsZWN0aW9uVmFyaWFudC5yZW1vdmVTZWxlY3RPcHRpb24ocHJvcGVydHlUb0JlUmVtb3ZlZCk7XG5cdFx0XHRcdFx0XHR9IGVsc2UgaWYgKHByb3BlcnR5VG9CZVJlbW92ZWQgIT09IHNTZW1hbnRpY09iamVjdFByb3BlcnR5KSB7XG5cdFx0XHRcdFx0XHRcdC8vIFRoZSBuYXZpZ2F0aW9uIHByb3BlcnR5IGhhcyBhIHZhbHVlIGFuZCBwcm9wZXJ0aWVzIG5hbWVzIGFyZSBkaWZmZXJlbnRcblx0XHRcdFx0XHRcdFx0bW9kaWZpZWRTZWxlY3Rpb25WYXJpYW50LnJlbmFtZVBhcmFtZXRlcihwcm9wZXJ0eVRvQmVSZW1vdmVkLCBzU2VtYW50aWNPYmplY3RQcm9wZXJ0eSk7XG5cdFx0XHRcdFx0XHRcdG1vZGlmaWVkU2VsZWN0aW9uVmFyaWFudC5yZW5hbWVTZWxlY3RPcHRpb24ocHJvcGVydHlUb0JlUmVtb3ZlZCwgc1NlbWFudGljT2JqZWN0UHJvcGVydHkpO1xuXHRcdFx0XHRcdFx0XHRvUGFyYW1zW3NTZW1hbnRpY09iamVjdFByb3BlcnR5XSA9IG9QYXJhbXNbcHJvcGVydHlUb0JlUmVtb3ZlZF07XG5cdFx0XHRcdFx0XHRcdGRlbGV0ZSBvUGFyYW1zW3Byb3BlcnR5VG9CZVJlbW92ZWRdO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRkZWxldGUgb1BhcmFtc1tzTG9jYWxQcm9wZXJ0eV07XG5cdFx0XHRcdFx0XHRtb2RpZmllZFNlbGVjdGlvblZhcmlhbnQucmVtb3ZlUGFyYW1ldGVyKHNTZW1hbnRpY09iamVjdFByb3BlcnR5KTtcblx0XHRcdFx0XHRcdG1vZGlmaWVkU2VsZWN0aW9uVmFyaWFudC5yZW1vdmVTZWxlY3RPcHRpb24oc1NlbWFudGljT2JqZWN0UHJvcGVydHkpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG5cdHJldHVybiB7IHBhcmFtczogb1BhcmFtcywgaGFzQ2hhbmdlZCwgc2VsZWN0aW9uVmFyaWFudDogbW9kaWZpZWRTZWxlY3Rpb25WYXJpYW50IH07XG59O1xuXG4vKipcbiAqIENhbGwgZ2V0QXBwU3RhdGVLZXlBbmRVcmxQYXJhbWV0ZXJzIGluIG5hdmlnYXRpb24gc2VydmljZSBhbmQgY2FjaGUgaXRzIHJlc3VsdHMuXG4gKlxuICogQHBhcmFtIF90aGlzIFRoZSBpbnN0YW5jZSBvZiBxdWlja3ZpZXdkZWxlZ2F0ZS5cbiAqIEBwYXJhbSBuYXZpZ2F0aW9uU2VydmljZSBUaGUgbmF2aWdhdGlvbiBzZXJ2aWNlLlxuICogQHBhcmFtIHNlbGVjdGlvblZhcmlhbnQgVGhlIGN1cnJlbnQgc2VsZWN0aW9uIHZhcmlhbnQuXG4gKiBAcGFyYW0gc2VtYW50aWNPYmplY3QgVGhlIGN1cnJlbnQgc2VtYW50aWNPYmplY3QuXG4gKi9cblNpbXBsZUxpbmtEZWxlZ2F0ZS5fZ2V0QXBwU3RhdGVLZXlBbmRVcmxQYXJhbWV0ZXJzID0gYXN5bmMgZnVuY3Rpb24gKFxuXHRfdGhpczogdHlwZW9mIFNpbXBsZUxpbmtEZWxlZ2F0ZSxcblx0bmF2aWdhdGlvblNlcnZpY2U6IGFueSxcblx0c2VsZWN0aW9uVmFyaWFudDogU2VsZWN0aW9uVmFyaWFudCxcblx0c2VtYW50aWNPYmplY3Q6IHN0cmluZ1xuKTogUHJvbWlzZTxzdHJpbmdbXT4ge1xuXHRsZXQgYVZhbHVlcyA9IFtdO1xuXG5cdC8vIGNoZWNrIGlmIGRlZmF1bHQgY2FjaGUgY29udGFpbnMgYWxyZWFkeSB0aGUgdW5tb2RpZmllZCBzZWxlY3Rpb25WYXJpYW50XG5cdGlmIChkZWVwRXF1YWwoc2VsZWN0aW9uVmFyaWFudCwgX3RoaXMuYXBwU3RhdGVLZXlNYXBbXCJcIl0/LnNlbGVjdGlvblZhcmlhbnQpKSB7XG5cdFx0Y29uc3QgZGVmYXVsdENhY2hlID0gX3RoaXMuYXBwU3RhdGVLZXlNYXBbXCJcIl07XG5cdFx0cmV0dXJuIFtkZWZhdWx0Q2FjaGUuc2VtYW50aWNBdHRyaWJ1dGVzLCBkZWZhdWx0Q2FjaGUuYXBwc3RhdGVrZXldO1xuXHR9XG5cdC8vIHVwZGF0ZSB1cmwgcGFyYW1ldGVycyBiZWNhdXNlIHRoZXJlIGlzIGEgY2hhbmdlIGluIHNlbGVjdGlvbiB2YXJpYW50XG5cdGlmIChcblx0XHRfdGhpcy5hcHBTdGF0ZUtleU1hcFtgJHtzZW1hbnRpY09iamVjdH1gXSA9PT0gdW5kZWZpbmVkIHx8XG5cdFx0IWRlZXBFcXVhbChfdGhpcy5hcHBTdGF0ZUtleU1hcFtgJHtzZW1hbnRpY09iamVjdH1gXS5zZWxlY3Rpb25WYXJpYW50LCBzZWxlY3Rpb25WYXJpYW50KVxuXHQpIHtcblx0XHRhVmFsdWVzID0gYXdhaXQgdG9FUzZQcm9taXNlKG5hdmlnYXRpb25TZXJ2aWNlLmdldEFwcFN0YXRlS2V5QW5kVXJsUGFyYW1ldGVycyhzZWxlY3Rpb25WYXJpYW50LnRvSlNPTlN0cmluZygpKSk7XG5cdFx0X3RoaXMuYXBwU3RhdGVLZXlNYXBbYCR7c2VtYW50aWNPYmplY3R9YF0gPSB7XG5cdFx0XHRzZW1hbnRpY0F0dHJpYnV0ZXM6IGFWYWx1ZXNbMF0sXG5cdFx0XHRhcHBzdGF0ZWtleTogYVZhbHVlc1sxXSxcblx0XHRcdHNlbGVjdGlvblZhcmlhbnQ6IHNlbGVjdGlvblZhcmlhbnRcblx0XHR9O1xuXHR9IGVsc2Uge1xuXHRcdGNvbnN0IGNhY2hlID0gX3RoaXMuYXBwU3RhdGVLZXlNYXBbYCR7c2VtYW50aWNPYmplY3R9YF07XG5cdFx0YVZhbHVlcyA9IFtjYWNoZS5zZW1hbnRpY0F0dHJpYnV0ZXMsIGNhY2hlLmFwcHN0YXRla2V5XTtcblx0fVxuXHRyZXR1cm4gYVZhbHVlcztcbn07XG5cblNpbXBsZUxpbmtEZWxlZ2F0ZS5fZ2V0TGlua0l0ZW1XaXRoTmV3UGFyYW1ldGVyID0gYXN5bmMgZnVuY3Rpb24gKFxuXHRfdGhhdDogYW55LFxuXHRfYlRpdGxlSGFzTGluazogYm9vbGVhbixcblx0X2FUaXRsZUxpbms6IHN0cmluZ1tdLFxuXHRfb0xpbmtJdGVtOiBhbnksXG5cdF9vU2hlbGxTZXJ2aWNlczogYW55LFxuXHRfb1BheWxvYWQ6IGFueSxcblx0X29QYXJhbXM6IGFueSxcblx0X3NBcHBTdGF0ZUtleTogc3RyaW5nLFxuXHRfb1NlbGVjdGlvblZhcmlhbnQ6IFNlbGVjdGlvblZhcmlhbnQsXG5cdF9vTmF2aWdhdGlvblNlcnZpY2U6IE5hdmlnYXRpb25TZXJ2aWNlXG4pOiBQcm9taXNlPGFueT4ge1xuXHRyZXR1cm4gX29TaGVsbFNlcnZpY2VzLmV4cGFuZENvbXBhY3RIYXNoKF9vTGlua0l0ZW0uZ2V0SHJlZigpKS50aGVuKGFzeW5jIGZ1bmN0aW9uIChzSGFzaDogYW55KSB7XG5cdFx0Y29uc3Qgb1NoZWxsSGFzaCA9IF9vU2hlbGxTZXJ2aWNlcy5wYXJzZVNoZWxsSGFzaChzSGFzaCk7XG5cdFx0Y29uc3QgcGFyYW1zID0gT2JqZWN0LmFzc2lnbih7fSwgX29QYXJhbXMpO1xuXHRcdGNvbnN0IHtcblx0XHRcdHBhcmFtczogb05ld1BhcmFtcyxcblx0XHRcdGhhc0NoYW5nZWQsXG5cdFx0XHRzZWxlY3Rpb25WYXJpYW50OiBuZXdTZWxlY3Rpb25WYXJpYW50XG5cdFx0fSA9IFNpbXBsZUxpbmtEZWxlZ2F0ZS5fc2V0T2JqZWN0TWFwcGluZ3Mob1NoZWxsSGFzaC5zZW1hbnRpY09iamVjdCwgcGFyYW1zLCBfb1BheWxvYWQuc2VtYW50aWNPYmplY3RNYXBwaW5ncywgX29TZWxlY3Rpb25WYXJpYW50KTtcblx0XHRpZiAoaGFzQ2hhbmdlZCkge1xuXHRcdFx0Y29uc3QgYVZhbHVlcyA9IGF3YWl0IFNpbXBsZUxpbmtEZWxlZ2F0ZS5fZ2V0QXBwU3RhdGVLZXlBbmRVcmxQYXJhbWV0ZXJzKFxuXHRcdFx0XHRfdGhhdCxcblx0XHRcdFx0X29OYXZpZ2F0aW9uU2VydmljZSxcblx0XHRcdFx0bmV3U2VsZWN0aW9uVmFyaWFudCxcblx0XHRcdFx0b1NoZWxsSGFzaC5zZW1hbnRpY09iamVjdFxuXHRcdFx0KTtcblxuXHRcdFx0X3NBcHBTdGF0ZUtleSA9IGFWYWx1ZXNbMV07XG5cdFx0fVxuXHRcdGNvbnN0IG9OZXdTaGVsbEhhc2ggPSB7XG5cdFx0XHR0YXJnZXQ6IHtcblx0XHRcdFx0c2VtYW50aWNPYmplY3Q6IG9TaGVsbEhhc2guc2VtYW50aWNPYmplY3QsXG5cdFx0XHRcdGFjdGlvbjogb1NoZWxsSGFzaC5hY3Rpb25cblx0XHRcdH0sXG5cdFx0XHRwYXJhbXM6IG9OZXdQYXJhbXMsXG5cdFx0XHRhcHBTdGF0ZUtleTogX3NBcHBTdGF0ZUtleVxuXHRcdH07XG5cdFx0ZGVsZXRlIG9OZXdTaGVsbEhhc2gucGFyYW1zW1wic2FwLXhhcHAtc3RhdGVcIl07XG5cdFx0X29MaW5rSXRlbS5zZXRIcmVmKGAjJHtfb1NoZWxsU2VydmljZXMuY29uc3RydWN0U2hlbGxIYXNoKG9OZXdTaGVsbEhhc2gpfWApO1xuXHRcdF9vUGF5bG9hZC5hU2VtYW50aWNMaW5rcy5wdXNoKF9vTGlua0l0ZW0uZ2V0SHJlZigpKTtcblx0XHQvLyBUaGUgbGluayBpcyByZW1vdmVkIGZyb20gdGhlIHRhcmdldCBsaXN0IGJlY2F1c2UgdGhlIHRpdGxlIGxpbmsgaGFzIHNhbWUgdGFyZ2V0LlxuXHRcdHJldHVybiBTaW1wbGVMaW5rRGVsZWdhdGUuX1JlbW92ZVRpdGxlTGlua0Zyb21UYXJnZXRzLmJpbmQoX3RoYXQpKFtfb0xpbmtJdGVtXSwgX2JUaXRsZUhhc0xpbmssIF9hVGl0bGVMaW5rKTtcblx0fSk7XG59O1xuU2ltcGxlTGlua0RlbGVnYXRlLl9yZW1vdmVFbXB0eUxpbmtJdGVtID0gZnVuY3Rpb24gKGFMaW5rSXRlbXM6IGFueSk6IGFueVtdIHtcblx0cmV0dXJuIGFMaW5rSXRlbXMuZmlsdGVyKChsaW5rSXRlbTogYW55KSA9PiB7XG5cdFx0cmV0dXJuIGxpbmtJdGVtICE9PSB1bmRlZmluZWQ7XG5cdH0pO1xufTtcbi8qKlxuICogRW5hYmxlcyB0aGUgbW9kaWZpY2F0aW9uIG9mIExpbmtJdGVtcyBiZWZvcmUgdGhlIHBvcG92ZXIgb3BlbnMuIFRoaXMgZW5hYmxlcyBhZGRpdGlvbmFsIHBhcmFtZXRlcnNcbiAqIHRvIGJlIGFkZGVkIHRvIHRoZSBsaW5rLlxuICpcbiAqIEBwYXJhbSBvUGF5bG9hZCBUaGUgcGF5bG9hZCBvZiB0aGUgTGluayBnaXZlbiBieSB0aGUgYXBwbGljYXRpb25cbiAqIEBwYXJhbSBvQmluZGluZ0NvbnRleHQgVGhlIGJpbmRpbmcgY29udGV4dCBvZiB0aGUgTGlua1xuICogQHBhcmFtIGFMaW5rSXRlbXMgVGhlIExpbmtJdGVtcyBvZiB0aGUgTGluayB0aGF0IGNhbiBiZSBtb2RpZmllZFxuICogQHJldHVybnMgT25jZSByZXNvbHZlZCBhbiBhcnJheSBvZiB7QGxpbmsgc2FwLnVpLm1kYy5saW5rLkxpbmtJdGVtfSBpcyByZXR1cm5lZFxuICovXG5TaW1wbGVMaW5rRGVsZWdhdGUubW9kaWZ5TGlua0l0ZW1zID0gYXN5bmMgZnVuY3Rpb24gKG9QYXlsb2FkOiBhbnksIG9CaW5kaW5nQ29udGV4dDogQ29udGV4dCwgYUxpbmtJdGVtczogYW55KSB7XG5cdGNvbnN0IHByaW1hcnlBY3Rpb25Jc0FjdGl2ZSA9IChhd2FpdCBGaWVsZEhlbHBlci5jaGVja1ByaW1hcnlBY3Rpb25zKG9QYXlsb2FkLCB0cnVlKSkgYXMgYW55O1xuXHRjb25zdCBhVGl0bGVMaW5rID0gcHJpbWFyeUFjdGlvbklzQWN0aXZlLnRpdGxlTGluaztcblx0Y29uc3QgYlRpdGxlSGFzTGluazogYm9vbGVhbiA9IHByaW1hcnlBY3Rpb25Jc0FjdGl2ZS5oYXNUaXRsZUxpbms7XG5cdGlmIChhTGlua0l0ZW1zLmxlbmd0aCAhPT0gMCkge1xuXHRcdHRoaXMucGF5bG9hZCA9IG9QYXlsb2FkO1xuXHRcdGNvbnN0IG9MaW5rID0gYUxpbmtJdGVtc1swXS5nZXRQYXJlbnQoKTtcblx0XHRjb25zdCBvVmlldyA9IENvbW1vblV0aWxzLmdldFRhcmdldFZpZXcob0xpbmspO1xuXHRcdGNvbnN0IG9BcHBDb21wb25lbnQgPSBDb21tb25VdGlscy5nZXRBcHBDb21wb25lbnQob1ZpZXcpO1xuXHRcdGNvbnN0IG9TaGVsbFNlcnZpY2VzID0gb0FwcENvbXBvbmVudC5nZXRTaGVsbFNlcnZpY2VzKCk7XG5cdFx0aWYgKCFvU2hlbGxTZXJ2aWNlcy5oYXNVU2hlbGwoKSkge1xuXHRcdFx0TG9nLmVycm9yKFwiUXVpY2tWaWV3RGVsZWdhdGU6IENhbm5vdCByZXRyaWV2ZSB0aGUgc2hlbGwgc2VydmljZXNcIik7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QoKTtcblx0XHR9XG5cdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG9WaWV3LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCkgYXMgT0RhdGFNZXRhTW9kZWw7XG5cdFx0bGV0IG1MaW5lQ29udGV4dCA9IG9MaW5rLmdldEJpbmRpbmdDb250ZXh0KCk7XG5cdFx0Y29uc3Qgb1RhcmdldEluZm86IGFueSA9IHtcblx0XHRcdHNlbWFudGljT2JqZWN0OiBvUGF5bG9hZC5tYWluU2VtYW50aWNPYmplY3QsXG5cdFx0XHRhY3Rpb246IFwiXCJcblx0XHR9O1xuXG5cdFx0dHJ5IHtcblx0XHRcdGNvbnN0IGFOZXdMaW5rQ3VzdG9tRGF0YSA9XG5cdFx0XHRcdG9MaW5rICYmXG5cdFx0XHRcdHRoaXMuX2ZldGNoTGlua0N1c3RvbURhdGEob0xpbmspLm1hcChmdW5jdGlvbiAobGlua0l0ZW06IGFueSkge1xuXHRcdFx0XHRcdHJldHVybiBsaW5rSXRlbS5tUHJvcGVydGllcy52YWx1ZTtcblx0XHRcdFx0fSk7XG5cdFx0XHQvLyBjaGVjayBpZiBhbGwgbGluayBpdGVtcyBpbiB0aGlzLmFMaW5rQ3VzdG9tRGF0YSBhcmUgYWxzbyBwcmVzZW50IGluIGFOZXdMaW5rQ3VzdG9tRGF0YVxuXHRcdFx0aWYgKFNpbXBsZUxpbmtEZWxlZ2F0ZS5fSXNTZW1hbnRpY09iamVjdER5bmFtaWMoYU5ld0xpbmtDdXN0b21EYXRhLCB0aGlzKSkge1xuXHRcdFx0XHQvLyBpZiB0aGUgY3VzdG9tRGF0YSBjaGFuZ2VkIHRoZXJlIGFyZSBkaWZmZXJlbnQgTGlua0l0ZW1zIHRvIGRpc3BsYXlcblx0XHRcdFx0Y29uc3Qgb1NlbWFudGljQXR0cmlidXRlc1Jlc29sdmVkID0gU2ltcGxlTGlua0RlbGVnYXRlLl9jYWxjdWxhdGVTZW1hbnRpY0F0dHJpYnV0ZXMoXG5cdFx0XHRcdFx0b0JpbmRpbmdDb250ZXh0LmdldE9iamVjdCgpLFxuXHRcdFx0XHRcdG9QYXlsb2FkLFxuXHRcdFx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdFx0XHR0aGlzLl9saW5rXG5cdFx0XHRcdCk7XG5cdFx0XHRcdGNvbnN0IG9TZW1hbnRpY0F0dHJpYnV0ZXMgPSBvU2VtYW50aWNBdHRyaWJ1dGVzUmVzb2x2ZWQucmVzdWx0cztcblx0XHRcdFx0Y29uc3Qgb1BheWxvYWRSZXNvbHZlZCA9IG9TZW1hbnRpY0F0dHJpYnV0ZXNSZXNvbHZlZC5wYXlsb2FkO1xuXHRcdFx0XHRhTGlua0l0ZW1zID0gYXdhaXQgU2ltcGxlTGlua0RlbGVnYXRlLl9yZXRyaWV2ZU5hdmlnYXRpb25UYXJnZXRzKFxuXHRcdFx0XHRcdFwiXCIsXG5cdFx0XHRcdFx0b1NlbWFudGljQXR0cmlidXRlcyxcblx0XHRcdFx0XHRvUGF5bG9hZFJlc29sdmVkLFxuXHRcdFx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdFx0XHR0aGlzLl9saW5rXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0XHRjb25zdCBvTmF2aWdhdGlvblNlcnZpY2UgPSBvQXBwQ29tcG9uZW50LmdldE5hdmlnYXRpb25TZXJ2aWNlKCk7XG5cdFx0XHRjb25zdCBvQ29udHJvbGxlciA9IG9WaWV3LmdldENvbnRyb2xsZXIoKSBhcyBQYWdlQ29udHJvbGxlcjtcblx0XHRcdGxldCBvU2VsZWN0aW9uVmFyaWFudDtcblx0XHRcdGxldCBtTGluZUNvbnRleHREYXRhO1xuXHRcdFx0bUxpbmVDb250ZXh0ID0gU2ltcGxlTGlua0RlbGVnYXRlLl9nZXRMaW5lQ29udGV4dChvVmlldywgbUxpbmVDb250ZXh0KTtcblx0XHRcdGNvbnN0IHNNZXRhUGF0aCA9IG9NZXRhTW9kZWwuZ2V0TWV0YVBhdGgobUxpbmVDb250ZXh0LmdldFBhdGgoKSk7XG5cdFx0XHRtTGluZUNvbnRleHREYXRhID0gb0NvbnRyb2xsZXIuX2ludGVudEJhc2VkTmF2aWdhdGlvbi5yZW1vdmVTZW5zaXRpdmVEYXRhKG1MaW5lQ29udGV4dC5nZXRPYmplY3QoKSwgc01ldGFQYXRoKTtcblx0XHRcdG1MaW5lQ29udGV4dERhdGEgPSBvQ29udHJvbGxlci5faW50ZW50QmFzZWROYXZpZ2F0aW9uLnByZXBhcmVDb250ZXh0Rm9yRXh0ZXJuYWxOYXZpZ2F0aW9uKG1MaW5lQ29udGV4dERhdGEsIG1MaW5lQ29udGV4dCk7XG5cdFx0XHRvU2VsZWN0aW9uVmFyaWFudCA9IG9OYXZpZ2F0aW9uU2VydmljZS5taXhBdHRyaWJ1dGVzQW5kU2VsZWN0aW9uVmFyaWFudChtTGluZUNvbnRleHREYXRhLnNlbWFudGljQXR0cmlidXRlcywge30pO1xuXHRcdFx0b1RhcmdldEluZm8ucHJvcGVydGllc1dpdGhvdXRDb25mbGljdCA9IG1MaW5lQ29udGV4dERhdGEucHJvcGVydGllc1dpdGhvdXRDb25mbGljdDtcblx0XHRcdC8vVE8gbW9kaWZ5IHRoZSBzZWxlY3Rpb24gdmFyaWFudCBmcm9tIHRoZSBFeHRlbnNpb24gQVBJXG5cdFx0XHRvQ29udHJvbGxlci5pbnRlbnRCYXNlZE5hdmlnYXRpb24uYWRhcHROYXZpZ2F0aW9uQ29udGV4dChvU2VsZWN0aW9uVmFyaWFudCwgb1RhcmdldEluZm8pO1xuXHRcdFx0U2ltcGxlTGlua0RlbGVnYXRlLl9yZW1vdmVUZWNobmljYWxQYXJhbWV0ZXJzKG9TZWxlY3Rpb25WYXJpYW50KTtcblx0XHRcdG9TZWxlY3Rpb25WYXJpYW50ID0gU2ltcGxlTGlua0RlbGVnYXRlLl9zZXRGaWx0ZXJDb250ZXh0VXJsRm9yU2VsZWN0aW9uVmFyaWFudChvVmlldywgb1NlbGVjdGlvblZhcmlhbnQsIG9OYXZpZ2F0aW9uU2VydmljZSk7XG5cdFx0XHRjb25zdCBhVmFsdWVzID0gYXdhaXQgU2ltcGxlTGlua0RlbGVnYXRlLl9nZXRBcHBTdGF0ZUtleUFuZFVybFBhcmFtZXRlcnModGhpcywgb05hdmlnYXRpb25TZXJ2aWNlLCBvU2VsZWN0aW9uVmFyaWFudCwgXCJcIik7XG5cdFx0XHRjb25zdCBvUGFyYW1zID0gYVZhbHVlc1swXTtcblx0XHRcdGNvbnN0IGFwcFN0YXRlS2V5ID0gYVZhbHVlc1sxXTtcblx0XHRcdGxldCB0aXRsZUxpbmt0b0JlUmVtb3ZlOiBhbnk7XG5cdFx0XHRvUGF5bG9hZC5hU2VtYW50aWNMaW5rcyA9IFtdO1xuXHRcdFx0YUxpbmtJdGVtcyA9IFNpbXBsZUxpbmtEZWxlZ2F0ZS5fcmVtb3ZlRW1wdHlMaW5rSXRlbShhTGlua0l0ZW1zKTtcblx0XHRcdGZvciAoY29uc3QgaW5kZXggaW4gYUxpbmtJdGVtcykge1xuXHRcdFx0XHR0aXRsZUxpbmt0b0JlUmVtb3ZlID0gYXdhaXQgU2ltcGxlTGlua0RlbGVnYXRlLl9nZXRMaW5rSXRlbVdpdGhOZXdQYXJhbWV0ZXIoXG5cdFx0XHRcdFx0dGhpcyxcblx0XHRcdFx0XHRiVGl0bGVIYXNMaW5rLFxuXHRcdFx0XHRcdGFUaXRsZUxpbmssXG5cdFx0XHRcdFx0YUxpbmtJdGVtc1tpbmRleF0sXG5cdFx0XHRcdFx0b1NoZWxsU2VydmljZXMsXG5cdFx0XHRcdFx0b1BheWxvYWQsXG5cdFx0XHRcdFx0b1BhcmFtcyxcblx0XHRcdFx0XHRhcHBTdGF0ZUtleSxcblx0XHRcdFx0XHRvU2VsZWN0aW9uVmFyaWFudCxcblx0XHRcdFx0XHRvTmF2aWdhdGlvblNlcnZpY2Vcblx0XHRcdFx0KTtcblx0XHRcdFx0aWYgKHRpdGxlTGlua3RvQmVSZW1vdmUgPT09IHRydWUpIHtcblx0XHRcdFx0XHRhTGlua0l0ZW1zW2luZGV4XSA9IHVuZGVmaW5lZDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIFNpbXBsZUxpbmtEZWxlZ2F0ZS5fcmVtb3ZlRW1wdHlMaW5rSXRlbShhTGlua0l0ZW1zKTtcblx0XHR9IGNhdGNoIChvRXJyb3I6IGFueSkge1xuXHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgZ2V0dGluZyB0aGUgbmF2aWdhdGlvbiBzZXJ2aWNlXCIsIG9FcnJvcik7XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gYUxpbmtJdGVtcztcblx0fVxufTtcblNpbXBsZUxpbmtEZWxlZ2F0ZS5iZWZvcmVOYXZpZ2F0aW9uQ2FsbGJhY2sgPSBmdW5jdGlvbiAob1BheWxvYWQ6IGFueSwgb0V2ZW50OiBhbnkpIHtcblx0Y29uc3Qgb1NvdXJjZSA9IG9FdmVudC5nZXRTb3VyY2UoKSxcblx0XHRzSHJlZiA9IG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJocmVmXCIpLFxuXHRcdG9VUkxQYXJzaW5nID0gRmFjdG9yeS5nZXRTZXJ2aWNlKFwiVVJMUGFyc2luZ1wiKSxcblx0XHRvSGFzaCA9IHNIcmVmICYmIG9VUkxQYXJzaW5nLnBhcnNlU2hlbGxIYXNoKHNIcmVmKTtcblxuXHRLZWVwQWxpdmVIZWxwZXIuc3RvcmVDb250cm9sUmVmcmVzaFN0cmF0ZWd5Rm9ySGFzaChvU291cmNlLCBvSGFzaCk7XG5cblx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSh0cnVlKTtcbn07XG5TaW1wbGVMaW5rRGVsZWdhdGUuX3JlbW92ZVRlY2huaWNhbFBhcmFtZXRlcnMgPSBmdW5jdGlvbiAob1NlbGVjdGlvblZhcmlhbnQ6IGFueSkge1xuXHRvU2VsZWN0aW9uVmFyaWFudC5yZW1vdmVTZWxlY3RPcHRpb24oXCJAb2RhdGEuY29udGV4dFwiKTtcblx0b1NlbGVjdGlvblZhcmlhbnQucmVtb3ZlU2VsZWN0T3B0aW9uKFwiQG9kYXRhLm1ldGFkYXRhRXRhZ1wiKTtcblx0b1NlbGVjdGlvblZhcmlhbnQucmVtb3ZlU2VsZWN0T3B0aW9uKFwiU0FQX19NZXNzYWdlc1wiKTtcbn07XG5cblNpbXBsZUxpbmtEZWxlZ2F0ZS5fZ2V0U2VtYW50aWNPYmplY3RDdXN0b21EYXRhVmFsdWUgPSBmdW5jdGlvbiAoYUxpbmtDdXN0b21EYXRhOiBhbnksIG9TZW1hbnRpY09iamVjdHNSZXNvbHZlZDogYW55KTogdm9pZCB7XG5cdGxldCBzUHJvcGVydHlOYW1lOiBzdHJpbmcsIHNDdXN0b21EYXRhVmFsdWU6IHN0cmluZztcblx0Zm9yIChsZXQgaUN1c3RvbURhdGFDb3VudCA9IDA7IGlDdXN0b21EYXRhQ291bnQgPCBhTGlua0N1c3RvbURhdGEubGVuZ3RoOyBpQ3VzdG9tRGF0YUNvdW50KyspIHtcblx0XHRzUHJvcGVydHlOYW1lID0gYUxpbmtDdXN0b21EYXRhW2lDdXN0b21EYXRhQ291bnRdLmdldEtleSgpO1xuXHRcdHNDdXN0b21EYXRhVmFsdWUgPSBhTGlua0N1c3RvbURhdGFbaUN1c3RvbURhdGFDb3VudF0uZ2V0VmFsdWUoKTtcblx0XHRvU2VtYW50aWNPYmplY3RzUmVzb2x2ZWRbc1Byb3BlcnR5TmFtZV0gPSB7IHZhbHVlOiBzQ3VzdG9tRGF0YVZhbHVlIH07XG5cdH1cbn07XG5cbi8qKlxuICogQ2hlY2sgdGhlIHNlbWFudGljIG9iamVjdCBuYW1lIGlmIGl0IGlzIGR5bmFtaWMgb3Igbm90LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0gcGF0aE9yVmFsdWUgVGhlIHNlbWFudGljIG9iamVjdCBwYXRoIG9yIG5hbWVcbiAqIEByZXR1cm5zIFRydWUgaWYgc2VtYW50aWMgb2JqZWN0IGlzIGR5bmFtaWNcbiAqL1xuU2ltcGxlTGlua0RlbGVnYXRlLl9pc0R5bmFtaWNQYXRoID0gZnVuY3Rpb24gKHBhdGhPclZhbHVlOiBzdHJpbmcpOiBib29sZWFuIHtcblx0aWYgKHBhdGhPclZhbHVlICYmIHBhdGhPclZhbHVlLmluZGV4T2YoXCJ7XCIpID09PSAwICYmIHBhdGhPclZhbHVlLmluZGV4T2YoXCJ9XCIpID09PSBwYXRoT3JWYWx1ZS5sZW5ndGggLSAxKSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG59O1xuXG4vKipcbiAqIFVwZGF0ZSB0aGUgcGF5bG9hZCB3aXRoIHNlbWFudGljIG9iamVjdCB2YWx1ZXMgZnJvbSBjdXN0b20gZGF0YSBvZiBMaW5rLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0gcGF5bG9hZCBUaGUgcGF5bG9hZCBvZiB0aGUgbWRjIGxpbmsuXG4gKiBAcGFyYW0gbmV3UGF5bG9hZCBUaGUgbmV3IHVwZGF0ZWQgcGF5bG9hZC5cbiAqIEBwYXJhbSBzZW1hbnRpY09iamVjdE5hbWUgVGhlIHNlbWFudGljIG9iamVjdCBuYW1lIHJlc29sdmVkLlxuICovXG5TaW1wbGVMaW5rRGVsZWdhdGUuX3VwZGF0ZVBheWxvYWRXaXRoUmVzb2x2ZWRTZW1hbnRpY09iamVjdFZhbHVlID0gZnVuY3Rpb24gKFxuXHRwYXlsb2FkOiBSZWdpc3RlcmVkUGF5bG9hZCxcblx0bmV3UGF5bG9hZDogUmVnaXN0ZXJlZFBheWxvYWQsXG5cdHNlbWFudGljT2JqZWN0TmFtZTogc3RyaW5nXG4pOiB2b2lkIHtcblx0aWYgKFNpbXBsZUxpbmtEZWxlZ2F0ZS5faXNEeW5hbWljUGF0aChwYXlsb2FkLm1haW5TZW1hbnRpY09iamVjdCkpIHtcblx0XHRpZiAoc2VtYW50aWNPYmplY3ROYW1lKSB7XG5cdFx0XHRuZXdQYXlsb2FkLm1haW5TZW1hbnRpY09iamVjdCA9IHNlbWFudGljT2JqZWN0TmFtZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gbm8gdmFsdWUgZnJvbSBDdXN0b20gRGF0YSwgc28gcmVtb3ZpbmcgbWFpblNlbWFudGljT2JqZWN0XG5cdFx0XHRuZXdQYXlsb2FkLm1haW5TZW1hbnRpY09iamVjdCA9IHVuZGVmaW5lZDtcblx0XHR9XG5cdH1cblx0c3dpdGNoICh0eXBlb2Ygc2VtYW50aWNPYmplY3ROYW1lKSB7XG5cdFx0Y2FzZSBcInN0cmluZ1wiOlxuXHRcdFx0bmV3UGF5bG9hZC5zZW1hbnRpY09iamVjdHNSZXNvbHZlZD8ucHVzaChzZW1hbnRpY09iamVjdE5hbWUpO1xuXHRcdFx0bmV3UGF5bG9hZC5zZW1hbnRpY09iamVjdHMucHVzaChzZW1hbnRpY09iamVjdE5hbWUpO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBcIm9iamVjdFwiOlxuXHRcdFx0Zm9yIChjb25zdCBqIGluIHNlbWFudGljT2JqZWN0TmFtZSBhcyBzdHJpbmdbXSkge1xuXHRcdFx0XHRuZXdQYXlsb2FkLnNlbWFudGljT2JqZWN0c1Jlc29sdmVkPy5wdXNoKHNlbWFudGljT2JqZWN0TmFtZVtqXSk7XG5cdFx0XHRcdG5ld1BheWxvYWQuc2VtYW50aWNPYmplY3RzLnB1c2goc2VtYW50aWNPYmplY3ROYW1lW2pdKTtcblx0XHRcdH1cblx0XHRcdGJyZWFrO1xuXHRcdGRlZmF1bHQ6XG5cdH1cbn07XG5cblNpbXBsZUxpbmtEZWxlZ2F0ZS5fY3JlYXRlTmV3UGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQgPSBmdW5jdGlvbiAoXG5cdHBheWxvYWQ6IFJlZ2lzdGVyZWRQYXlsb2FkLFxuXHRzZW1hbnRpY09iamVjdHNSZXNvbHZlZDogYW55LFxuXHRuZXdQYXlsb2FkOiBSZWdpc3RlcmVkUGF5bG9hZFxuKTogdm9pZCB7XG5cdGxldCBzZW1hbnRpY09iamVjdE5hbWU6IHN0cmluZywgdG1wUHJvcGVydHlOYW1lOiBzdHJpbmc7XG5cdGZvciAoY29uc3QgaSBpbiBwYXlsb2FkLnNlbWFudGljT2JqZWN0cykge1xuXHRcdHNlbWFudGljT2JqZWN0TmFtZSA9IHBheWxvYWQuc2VtYW50aWNPYmplY3RzW2ldO1xuXHRcdGlmIChTaW1wbGVMaW5rRGVsZWdhdGUuX2lzRHluYW1pY1BhdGgoc2VtYW50aWNPYmplY3ROYW1lKSkge1xuXHRcdFx0dG1wUHJvcGVydHlOYW1lID0gc2VtYW50aWNPYmplY3ROYW1lLnN1YnN0cigxLCBzZW1hbnRpY09iamVjdE5hbWUuaW5kZXhPZihcIn1cIikgLSAxKTtcblx0XHRcdHNlbWFudGljT2JqZWN0TmFtZSA9IHNlbWFudGljT2JqZWN0c1Jlc29sdmVkW3RtcFByb3BlcnR5TmFtZV0udmFsdWU7XG5cdFx0XHRTaW1wbGVMaW5rRGVsZWdhdGUuX3VwZGF0ZVBheWxvYWRXaXRoUmVzb2x2ZWRTZW1hbnRpY09iamVjdFZhbHVlKHBheWxvYWQsIG5ld1BheWxvYWQsIHNlbWFudGljT2JqZWN0TmFtZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG5ld1BheWxvYWQuc2VtYW50aWNPYmplY3RzLnB1c2goc2VtYW50aWNPYmplY3ROYW1lKTtcblx0XHR9XG5cdH1cbn07XG5cbi8qKlxuICogVXBkYXRlIHRoZSBzZW1hbnRpYyBvYmplY3QgbmFtZSBmcm9tIHRoZSByZXNvbHZlZCB2YWx1ZSBmb3IgdGhlIG1hcHBpbmdzIGF0dHJpYnV0ZXMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSBtZGNQYXlsb2FkIFRoZSBwYXlsb2FkIGdpdmVuIGJ5IHRoZSBhcHBsaWNhdGlvbi5cbiAqIEBwYXJhbSBtZGNQYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZCBUaGUgcGF5bG9hZCB3aXRoIHRoZSByZXNvbHZlZCB2YWx1ZSBmb3IgdGhlIHNlbWFudGljIG9iamVjdCBuYW1lLlxuICogQHBhcmFtIG5ld1BheWxvYWQgVGhlIG5ldyB1cGRhdGVkIHBheWxvYWQuXG4gKi9cblNpbXBsZUxpbmtEZWxlZ2F0ZS5fdXBkYXRlU2VtYW50aWNPYmplY3RzRm9yTWFwcGluZ3MgPSBmdW5jdGlvbiAoXG5cdG1kY1BheWxvYWQ6IFJlZ2lzdGVyZWRQYXlsb2FkLFxuXHRtZGNQYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZDogUmVnaXN0ZXJlZFBheWxvYWQsXG5cdG5ld1BheWxvYWQ6IFJlZ2lzdGVyZWRQYXlsb2FkXG4pOiB2b2lkIHtcblx0Ly8gdXBkYXRlIHRoZSBzZW1hbnRpYyBvYmplY3QgbmFtZSBmcm9tIHRoZSByZXNvbHZlZCBvbmVzIGluIHRoZSBzZW1hbnRpYyBvYmplY3QgbWFwcGluZ3MuXG5cdG1kY1BheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkLnNlbWFudGljT2JqZWN0TWFwcGluZ3MuZm9yRWFjaChmdW5jdGlvbiAoXG5cdFx0c2VtYW50aWNPYmplY3RNYXBwaW5nOiBSZWdpc3RlcmVkU2VtYW50aWNPYmplY3RNYXBwaW5nXG5cdCkge1xuXHRcdGlmIChzZW1hbnRpY09iamVjdE1hcHBpbmcuc2VtYW50aWNPYmplY3QgJiYgU2ltcGxlTGlua0RlbGVnYXRlLl9pc0R5bmFtaWNQYXRoKHNlbWFudGljT2JqZWN0TWFwcGluZy5zZW1hbnRpY09iamVjdCkpIHtcblx0XHRcdHNlbWFudGljT2JqZWN0TWFwcGluZy5zZW1hbnRpY09iamVjdCA9XG5cdFx0XHRcdG5ld1BheWxvYWQuc2VtYW50aWNPYmplY3RzW21kY1BheWxvYWQuc2VtYW50aWNPYmplY3RzLmluZGV4T2Yoc2VtYW50aWNPYmplY3RNYXBwaW5nLnNlbWFudGljT2JqZWN0KV07XG5cdFx0fVxuXHR9KTtcbn07XG5cbi8qKlxuICogVXBkYXRlIHRoZSBzZW1hbnRpYyBvYmplY3QgbmFtZSBmcm9tIHRoZSByZXNvbHZlZCB2YWx1ZSBmb3IgdGhlIHVuYXZhaWxhYmxlIGFjdGlvbnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSBtZGNQYXlsb2FkIFRoZSBwYXlsb2FkIGdpdmVuIGJ5IHRoZSBhcHBsaWNhdGlvbi5cbiAqIEBwYXJhbSBtZGNQYXlsb2FkU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMgVGhlIHVuYXZhaWxhYmxlIGFjdGlvbnMgZ2l2ZW4gYnkgdGhlIGFwcGxpY2F0aW9uLlxuICogQHBhcmFtIG1kY1BheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkIFRoZSB1cGRhdGVkIHBheWxvYWQgd2l0aCB0aGUgcmVzb2x2ZWQgdmFsdWUgZm9yIHRoZSBzZW1hbnRpYyBvYmplY3QgbmFtZSBmb3IgdGhlIHVuYXZhaWxhYmxlIGFjdGlvbnMuXG4gKi9cblNpbXBsZUxpbmtEZWxlZ2F0ZS5fdXBkYXRlU2VtYW50aWNPYmplY3RzVW5hdmFpbGFibGVBY3Rpb25zID0gZnVuY3Rpb24gKFxuXHRtZGNQYXlsb2FkOiBSZWdpc3RlcmVkUGF5bG9hZCxcblx0bWRjUGF5bG9hZFNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zOiBSZWdpc3RlcmVkU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMsXG5cdG1kY1BheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkOiBSZWdpc3RlcmVkUGF5bG9hZFxuKTogdm9pZCB7XG5cdGxldCBfSW5kZXg6IGFueTtcblx0bWRjUGF5bG9hZFNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zLmZvckVhY2goZnVuY3Rpb24gKHNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb246IGFueSkge1xuXHRcdC8vIER5bmFtaWMgU2VtYW50aWNPYmplY3QgaGFzIGFuIHVuYXZhaWxhYmxlIGFjdGlvblxuXHRcdGlmIChcblx0XHRcdHNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb24/LnNlbWFudGljT2JqZWN0ICYmXG5cdFx0XHRTaW1wbGVMaW5rRGVsZWdhdGUuX2lzRHluYW1pY1BhdGgoc2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbi5zZW1hbnRpY09iamVjdClcblx0XHQpIHtcblx0XHRcdF9JbmRleCA9IG1kY1BheWxvYWQuc2VtYW50aWNPYmplY3RzLmZpbmRJbmRleChmdW5jdGlvbiAoc2VtYW50aWNPYmplY3Q6IHN0cmluZykge1xuXHRcdFx0XHRyZXR1cm4gc2VtYW50aWNPYmplY3QgPT09IHNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb24uc2VtYW50aWNPYmplY3Q7XG5cdFx0XHR9KTtcblx0XHRcdGlmIChfSW5kZXggIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHQvLyBHZXQgdGhlIFNlbWFudGljT2JqZWN0IG5hbWUgcmVzb2x2ZWQgdG8gYSB2YWx1ZVxuXHRcdFx0XHRzZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uLnNlbWFudGljT2JqZWN0ID0gbWRjUGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQuc2VtYW50aWNPYmplY3RzW19JbmRleF07XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcbn07XG5cbi8qKlxuICogVXBkYXRlIHRoZSBzZW1hbnRpYyBvYmplY3QgbmFtZSBmcm9tIHRoZSByZXNvbHZlZCB2YWx1ZSBmb3IgdGhlIHVuYXZhaWxhYmxlIGFjdGlvbnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSBtZGNQYXlsb2FkIFRoZSB1cGRhdGVkIHBheWxvYWQgd2l0aCB0aGUgaW5mb3JtYXRpb24gZnJvbSBjdXN0b20gZGF0YSBwcm92aWRlZCBpbiB0aGUgbGluay5cbiAqIEBwYXJhbSBtZGNQYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZCBUaGUgcGF5bG9hZCB1cGRhdGVkIHdpdGggcmVzb2x2ZWQgc2VtYW50aWMgb2JqZWN0cyBuYW1lcy5cbiAqL1xuU2ltcGxlTGlua0RlbGVnYXRlLl91cGRhdGVTZW1hbnRpY09iamVjdHNXaXRoUmVzb2x2ZWRWYWx1ZSA9IGZ1bmN0aW9uIChcblx0bWRjUGF5bG9hZDogUmVnaXN0ZXJlZFBheWxvYWQsXG5cdG1kY1BheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkOiBSZWdpc3RlcmVkUGF5bG9hZFxuKTogdm9pZCB7XG5cdGZvciAobGV0IG5ld1NlbWFudGljT2JqZWN0c0NvdW50ID0gMDsgbmV3U2VtYW50aWNPYmplY3RzQ291bnQgPCBtZGNQYXlsb2FkLnNlbWFudGljT2JqZWN0cy5sZW5ndGg7IG5ld1NlbWFudGljT2JqZWN0c0NvdW50KyspIHtcblx0XHRpZiAoXG5cdFx0XHRtZGNQYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZC5tYWluU2VtYW50aWNPYmplY3QgPT09XG5cdFx0XHQobWRjUGF5bG9hZC5zZW1hbnRpY09iamVjdHNSZXNvbHZlZCAmJiBtZGNQYXlsb2FkLnNlbWFudGljT2JqZWN0c1Jlc29sdmVkW25ld1NlbWFudGljT2JqZWN0c0NvdW50XSlcblx0XHQpIHtcblx0XHRcdG1kY1BheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkLm1haW5TZW1hbnRpY09iamVjdCA9IG1kY1BheWxvYWQuc2VtYW50aWNPYmplY3RzW25ld1NlbWFudGljT2JqZWN0c0NvdW50XTtcblx0XHR9XG5cdFx0aWYgKG1kY1BheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkLnNlbWFudGljT2JqZWN0c1tuZXdTZW1hbnRpY09iamVjdHNDb3VudF0pIHtcblx0XHRcdG1kY1BheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkLnNlbWFudGljT2JqZWN0c1tuZXdTZW1hbnRpY09iamVjdHNDb3VudF0gPVxuXHRcdFx0XHRtZGNQYXlsb2FkLnNlbWFudGljT2JqZWN0c1tuZXdTZW1hbnRpY09iamVjdHNDb3VudF07XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIG5vIEN1c3RvbSBEYXRhIHZhbHVlIGZvciBhIFNlbWFudGljIE9iamVjdCBuYW1lIHdpdGggcGF0aFxuXHRcdFx0bWRjUGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQuc2VtYW50aWNPYmplY3RzLnNwbGljZShuZXdTZW1hbnRpY09iamVjdHNDb3VudCwgMSk7XG5cdFx0fVxuXHR9XG59O1xuXG4vKipcbiAqIFJlbW92ZSBlbXB0eSBzZW1hbnRpYyBvYmplY3QgbWFwcGluZ3MgYW5kIGlmIHRoZXJlIGlzIG5vIHNlbWFudGljIG9iamVjdCBuYW1lLCBsaW5rIHRvIGl0LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0gbWRjUGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQgVGhlIHBheWxvYWQgdXNlZCB0byBjaGVjayB0aGUgbWFwcGluZ3Mgb2YgdGhlIHNlbWFudGljIG9iamVjdHMuXG4gKi9cblNpbXBsZUxpbmtEZWxlZ2F0ZS5fcmVtb3ZlRW1wdHlTZW1hbnRpY09iamVjdHNNYXBwaW5ncyA9IGZ1bmN0aW9uIChtZGNQYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZDogUmVnaXN0ZXJlZFBheWxvYWQpOiB2b2lkIHtcblx0Ly8gcmVtb3ZlIHVuZGVmaW5lZCBTZW1hbnRpYyBPYmplY3QgTWFwcGluZ1xuXHRmb3IgKFxuXHRcdGxldCBtYXBwaW5nc0NvdW50ID0gMDtcblx0XHRtYXBwaW5nc0NvdW50IDwgbWRjUGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQuc2VtYW50aWNPYmplY3RNYXBwaW5ncy5sZW5ndGg7XG5cdFx0bWFwcGluZ3NDb3VudCsrXG5cdCkge1xuXHRcdGlmIChcblx0XHRcdG1kY1BheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkLnNlbWFudGljT2JqZWN0TWFwcGluZ3NbbWFwcGluZ3NDb3VudF0gJiZcblx0XHRcdG1kY1BheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkLnNlbWFudGljT2JqZWN0TWFwcGluZ3NbbWFwcGluZ3NDb3VudF0uc2VtYW50aWNPYmplY3QgPT09IHVuZGVmaW5lZFxuXHRcdCkge1xuXHRcdFx0bWRjUGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQuc2VtYW50aWNPYmplY3RNYXBwaW5ncy5zcGxpY2UobWFwcGluZ3NDb3VudCwgMSk7XG5cdFx0fVxuXHR9XG59O1xuXG5TaW1wbGVMaW5rRGVsZWdhdGUuX3NldFBheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkID0gZnVuY3Rpb24gKFxuXHRwYXlsb2FkOiBhbnksXG5cdG5ld1BheWxvYWQ6IFJlZ2lzdGVyZWRQYXlsb2FkXG4pOiBSZWdpc3RlcmVkUGF5bG9hZCB7XG5cdGxldCBvUGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQ6IFJlZ2lzdGVyZWRQYXlsb2FkO1xuXHRpZiAobmV3UGF5bG9hZC5zZW1hbnRpY09iamVjdHNSZXNvbHZlZCAmJiBuZXdQYXlsb2FkLnNlbWFudGljT2JqZWN0c1Jlc29sdmVkLmxlbmd0aCA+IDApIHtcblx0XHRvUGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQgPSB7XG5cdFx0XHRlbnRpdHlUeXBlOiBwYXlsb2FkLmVudGl0eVR5cGUsXG5cdFx0XHRkYXRhRmllbGQ6IHBheWxvYWQuZGF0YUZpZWxkLFxuXHRcdFx0Y29udGFjdDogcGF5bG9hZC5jb250YWN0LFxuXHRcdFx0bWFpblNlbWFudGljT2JqZWN0OiBwYXlsb2FkLm1haW5TZW1hbnRpY09iamVjdCxcblx0XHRcdG5hdmlnYXRpb25QYXRoOiBwYXlsb2FkLm5hdmlnYXRpb25QYXRoLFxuXHRcdFx0cHJvcGVydHlQYXRoTGFiZWw6IHBheWxvYWQucHJvcGVydHlQYXRoTGFiZWwsXG5cdFx0XHRzZW1hbnRpY09iamVjdE1hcHBpbmdzOiBkZWVwQ2xvbmUocGF5bG9hZC5zZW1hbnRpY09iamVjdE1hcHBpbmdzKSxcblx0XHRcdHNlbWFudGljT2JqZWN0czogbmV3UGF5bG9hZC5zZW1hbnRpY09iamVjdHNcblx0XHR9O1xuXHRcdFNpbXBsZUxpbmtEZWxlZ2F0ZS5fdXBkYXRlU2VtYW50aWNPYmplY3RzRm9yTWFwcGluZ3MocGF5bG9hZCwgb1BheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkLCBuZXdQYXlsb2FkKTtcblx0XHRjb25zdCBfU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnM6IFJlZ2lzdGVyZWRTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucyA9IGRlZXBDbG9uZShcblx0XHRcdHBheWxvYWQuc2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnNcblx0XHQpO1xuXHRcdFNpbXBsZUxpbmtEZWxlZ2F0ZS5fdXBkYXRlU2VtYW50aWNPYmplY3RzVW5hdmFpbGFibGVBY3Rpb25zKFxuXHRcdFx0cGF5bG9hZCxcblx0XHRcdF9TZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucyxcblx0XHRcdG9QYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZFxuXHRcdCk7XG5cdFx0b1BheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkLnNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zID0gX1NlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zO1xuXHRcdGlmIChuZXdQYXlsb2FkLm1haW5TZW1hbnRpY09iamVjdCkge1xuXHRcdFx0b1BheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkLm1haW5TZW1hbnRpY09iamVjdCA9IG5ld1BheWxvYWQubWFpblNlbWFudGljT2JqZWN0O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRvUGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQubWFpblNlbWFudGljT2JqZWN0ID0gdW5kZWZpbmVkO1xuXHRcdH1cblx0XHRTaW1wbGVMaW5rRGVsZWdhdGUuX3VwZGF0ZVNlbWFudGljT2JqZWN0c1dpdGhSZXNvbHZlZFZhbHVlKG5ld1BheWxvYWQsIG9QYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZCk7XG5cdFx0U2ltcGxlTGlua0RlbGVnYXRlLl9yZW1vdmVFbXB0eVNlbWFudGljT2JqZWN0c01hcHBpbmdzKG9QYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZCk7XG5cdFx0cmV0dXJuIG9QYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZDtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4ge30gYXMgYW55O1xuXHR9XG59O1xuXG5TaW1wbGVMaW5rRGVsZWdhdGUuX2dldFBheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkID0gZnVuY3Rpb24gKHBheWxvYWQ6IGFueSwgbGlua0N1c3RvbURhdGE6IGFueSk6IGFueSB7XG5cdGxldCBvUGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQ6IGFueTtcblx0Y29uc3Qgb1NlbWFudGljT2JqZWN0c1Jlc29sdmVkOiBhbnkgPSB7fTtcblx0Y29uc3QgbmV3UGF5bG9hZDogUmVnaXN0ZXJlZFBheWxvYWQgPSB7IHNlbWFudGljT2JqZWN0czogW10sIHNlbWFudGljT2JqZWN0c1Jlc29sdmVkOiBbXSwgc2VtYW50aWNPYmplY3RNYXBwaW5nczogW10gfTtcblx0aWYgKHBheWxvYWQuc2VtYW50aWNPYmplY3RzKSB7XG5cdFx0Ly8gc2FwLm0uTGluayBoYXMgY3VzdG9tIGRhdGEgd2l0aCBTZW1hbnRpYyBPYmplY3RzIG5hbWVzIHJlc29sdmVkXG5cdFx0aWYgKGxpbmtDdXN0b21EYXRhICYmIGxpbmtDdXN0b21EYXRhLmxlbmd0aCA+IDApIHtcblx0XHRcdFNpbXBsZUxpbmtEZWxlZ2F0ZS5fZ2V0U2VtYW50aWNPYmplY3RDdXN0b21EYXRhVmFsdWUobGlua0N1c3RvbURhdGEsIG9TZW1hbnRpY09iamVjdHNSZXNvbHZlZCk7XG5cdFx0XHRTaW1wbGVMaW5rRGVsZWdhdGUuX2NyZWF0ZU5ld1BheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkKHBheWxvYWQsIG9TZW1hbnRpY09iamVjdHNSZXNvbHZlZCwgbmV3UGF5bG9hZCk7XG5cdFx0XHRvUGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQgPSBTaW1wbGVMaW5rRGVsZWdhdGUuX3NldFBheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkKFxuXHRcdFx0XHRwYXlsb2FkLFxuXHRcdFx0XHRuZXdQYXlsb2FkXG5cdFx0XHQpO1xuXHRcdFx0cmV0dXJuIG9QYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZDtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxufTtcblxuU2ltcGxlTGlua0RlbGVnYXRlLl91cGRhdGVQYXlsb2FkV2l0aFNlbWFudGljQXR0cmlidXRlcyA9IGZ1bmN0aW9uIChcblx0YVNlbWFudGljT2JqZWN0czogYW55LFxuXHRvSW5mb0xvZzogYW55LFxuXHRvQ29udGV4dE9iamVjdDogYW55LFxuXHRvUmVzdWx0czogYW55LFxuXHRtU2VtYW50aWNPYmplY3RNYXBwaW5nczogYW55XG4pOiB2b2lkIHtcblx0YVNlbWFudGljT2JqZWN0cy5mb3JFYWNoKGZ1bmN0aW9uIChzU2VtYW50aWNPYmplY3Q6IGFueSkge1xuXHRcdGlmIChvSW5mb0xvZykge1xuXHRcdFx0b0luZm9Mb2cuYWRkQ29udGV4dE9iamVjdChzU2VtYW50aWNPYmplY3QsIG9Db250ZXh0T2JqZWN0KTtcblx0XHR9XG5cdFx0b1Jlc3VsdHNbc1NlbWFudGljT2JqZWN0XSA9IHt9O1xuXHRcdGZvciAoY29uc3Qgc0F0dHJpYnV0ZU5hbWUgaW4gb0NvbnRleHRPYmplY3QpIHtcblx0XHRcdGxldCBvQXR0cmlidXRlID0gbnVsbCxcblx0XHRcdFx0b1RyYW5zZm9ybWF0aW9uQWRkaXRpb25hbCA9IG51bGw7XG5cdFx0XHRpZiAob0luZm9Mb2cpIHtcblx0XHRcdFx0b0F0dHJpYnV0ZSA9IG9JbmZvTG9nLmdldFNlbWFudGljT2JqZWN0QXR0cmlidXRlKHNTZW1hbnRpY09iamVjdCwgc0F0dHJpYnV0ZU5hbWUpO1xuXHRcdFx0XHRpZiAoIW9BdHRyaWJ1dGUpIHtcblx0XHRcdFx0XHRvQXR0cmlidXRlID0gb0luZm9Mb2cuY3JlYXRlQXR0cmlidXRlU3RydWN0dXJlKCk7XG5cdFx0XHRcdFx0b0luZm9Mb2cuYWRkU2VtYW50aWNPYmplY3RBdHRyaWJ1dGUoc1NlbWFudGljT2JqZWN0LCBzQXR0cmlidXRlTmFtZSwgb0F0dHJpYnV0ZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdC8vIElnbm9yZSB1bmRlZmluZWQgYW5kIG51bGwgdmFsdWVzXG5cdFx0XHRpZiAob0NvbnRleHRPYmplY3Rbc0F0dHJpYnV0ZU5hbWVdID09PSB1bmRlZmluZWQgfHwgb0NvbnRleHRPYmplY3Rbc0F0dHJpYnV0ZU5hbWVdID09PSBudWxsKSB7XG5cdFx0XHRcdGlmIChvQXR0cmlidXRlKSB7XG5cdFx0XHRcdFx0b0F0dHJpYnV0ZS50cmFuc2Zvcm1hdGlvbnMucHVzaCh7XG5cdFx0XHRcdFx0XHR2YWx1ZTogdW5kZWZpbmVkLFxuXHRcdFx0XHRcdFx0ZGVzY3JpcHRpb246IFwiXFx1MjEzOSBVbmRlZmluZWQgYW5kIG51bGwgdmFsdWVzIGhhdmUgYmVlbiByZW1vdmVkIGluIFNpbXBsZUxpbmtEZWxlZ2F0ZS5cIlxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXHRcdFx0Ly8gSWdub3JlIHBsYWluIG9iamVjdHMgKEJDUCAxNzcwNDk2NjM5KVxuXHRcdFx0aWYgKGlzUGxhaW5PYmplY3Qob0NvbnRleHRPYmplY3Rbc0F0dHJpYnV0ZU5hbWVdKSkge1xuXHRcdFx0XHRpZiAobVNlbWFudGljT2JqZWN0TWFwcGluZ3MgJiYgbVNlbWFudGljT2JqZWN0TWFwcGluZ3Nbc1NlbWFudGljT2JqZWN0XSkge1xuXHRcdFx0XHRcdGNvbnN0IGFLZXlzID0gT2JqZWN0LmtleXMobVNlbWFudGljT2JqZWN0TWFwcGluZ3Nbc1NlbWFudGljT2JqZWN0XSk7XG5cdFx0XHRcdFx0bGV0IHNOZXdBdHRyaWJ1dGVOYW1lTWFwcGVkLCBzTmV3QXR0cmlidXRlTmFtZSwgc1ZhbHVlLCBzS2V5O1xuXHRcdFx0XHRcdGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBhS2V5cy5sZW5ndGg7IGluZGV4KyspIHtcblx0XHRcdFx0XHRcdHNLZXkgPSBhS2V5c1tpbmRleF07XG5cdFx0XHRcdFx0XHRpZiAoc0tleS5pbmRleE9mKHNBdHRyaWJ1dGVOYW1lKSA9PT0gMCkge1xuXHRcdFx0XHRcdFx0XHRzTmV3QXR0cmlidXRlTmFtZU1hcHBlZCA9IG1TZW1hbnRpY09iamVjdE1hcHBpbmdzW3NTZW1hbnRpY09iamVjdF1bc0tleV07XG5cdFx0XHRcdFx0XHRcdHNOZXdBdHRyaWJ1dGVOYW1lID0gc0tleS5zcGxpdChcIi9cIilbc0tleS5zcGxpdChcIi9cIikubGVuZ3RoIC0gMV07XG5cdFx0XHRcdFx0XHRcdHNWYWx1ZSA9IG9Db250ZXh0T2JqZWN0W3NBdHRyaWJ1dGVOYW1lXVtzTmV3QXR0cmlidXRlTmFtZV07XG5cdFx0XHRcdFx0XHRcdGlmIChzTmV3QXR0cmlidXRlTmFtZU1hcHBlZCAmJiBzTmV3QXR0cmlidXRlTmFtZSAmJiBzVmFsdWUpIHtcblx0XHRcdFx0XHRcdFx0XHRvUmVzdWx0c1tzU2VtYW50aWNPYmplY3RdW3NOZXdBdHRyaWJ1dGVOYW1lTWFwcGVkXSA9IHNWYWx1ZTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAob0F0dHJpYnV0ZSkge1xuXHRcdFx0XHRcdG9BdHRyaWJ1dGUudHJhbnNmb3JtYXRpb25zLnB1c2goe1xuXHRcdFx0XHRcdFx0dmFsdWU6IHVuZGVmaW5lZCxcblx0XHRcdFx0XHRcdGRlc2NyaXB0aW9uOiBcIlxcdTIxMzkgUGxhaW4gb2JqZWN0cyBoYXMgYmVlbiByZW1vdmVkIGluIFNpbXBsZUxpbmtEZWxlZ2F0ZS5cIlxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBNYXAgdGhlIGF0dHJpYnV0ZSBuYW1lIG9ubHkgaWYgJ3NlbWFudGljT2JqZWN0TWFwcGluZycgaXMgZGVmaW5lZC5cblx0XHRcdC8vIE5vdGU6IHVuZGVyIGRlZmluZWQgJ3NlbWFudGljT2JqZWN0TWFwcGluZycgd2UgYWxzbyBtZWFuIGFuIGVtcHR5IGFubm90YXRpb24gb3IgYW4gYW5ub3RhdGlvbiB3aXRoIGVtcHR5IHJlY29yZFxuXHRcdFx0Y29uc3Qgc0F0dHJpYnV0ZU5hbWVNYXBwZWQgPVxuXHRcdFx0XHRtU2VtYW50aWNPYmplY3RNYXBwaW5ncyAmJlxuXHRcdFx0XHRtU2VtYW50aWNPYmplY3RNYXBwaW5nc1tzU2VtYW50aWNPYmplY3RdICYmXG5cdFx0XHRcdG1TZW1hbnRpY09iamVjdE1hcHBpbmdzW3NTZW1hbnRpY09iamVjdF1bc0F0dHJpYnV0ZU5hbWVdXG5cdFx0XHRcdFx0PyBtU2VtYW50aWNPYmplY3RNYXBwaW5nc1tzU2VtYW50aWNPYmplY3RdW3NBdHRyaWJ1dGVOYW1lXVxuXHRcdFx0XHRcdDogc0F0dHJpYnV0ZU5hbWU7XG5cblx0XHRcdGlmIChvQXR0cmlidXRlICYmIHNBdHRyaWJ1dGVOYW1lICE9PSBzQXR0cmlidXRlTmFtZU1hcHBlZCkge1xuXHRcdFx0XHRvVHJhbnNmb3JtYXRpb25BZGRpdGlvbmFsID0ge1xuXHRcdFx0XHRcdHZhbHVlOiB1bmRlZmluZWQsXG5cdFx0XHRcdFx0ZGVzY3JpcHRpb246IGBcXHUyMTM5IFRoZSBhdHRyaWJ1dGUgJHtzQXR0cmlidXRlTmFtZX0gaGFzIGJlZW4gcmVuYW1lZCB0byAke3NBdHRyaWJ1dGVOYW1lTWFwcGVkfSBpbiBTaW1wbGVMaW5rRGVsZWdhdGUuYCxcblx0XHRcdFx0XHRyZWFzb246IGBcXHVkODNkXFx1ZGQzNCBBIGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5TZW1hbnRpY09iamVjdE1hcHBpbmcgYW5ub3RhdGlvbiBpcyBkZWZpbmVkIGZvciBzZW1hbnRpYyBvYmplY3QgJHtzU2VtYW50aWNPYmplY3R9IHdpdGggc291cmNlIGF0dHJpYnV0ZSAke3NBdHRyaWJ1dGVOYW1lfSBhbmQgdGFyZ2V0IGF0dHJpYnV0ZSAke3NBdHRyaWJ1dGVOYW1lTWFwcGVkfS4gWW91IGNhbiBtb2RpZnkgdGhlIGFubm90YXRpb24gaWYgdGhlIG1hcHBpbmcgcmVzdWx0IGlzIG5vdCB3aGF0IHlvdSBleHBlY3RlZC5gXG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cblx0XHRcdC8vIElmIG1vcmUgdGhlbiBvbmUgbG9jYWwgcHJvcGVydHkgbWFwcyB0byB0aGUgc2FtZSB0YXJnZXQgcHJvcGVydHkgKGNsYXNoIHNpdHVhdGlvbilcblx0XHRcdC8vIHdlIHRha2UgdGhlIHZhbHVlIG9mIHRoZSBsYXN0IHByb3BlcnR5IGFuZCB3cml0ZSBhbiBlcnJvciBsb2dcblx0XHRcdGlmIChvUmVzdWx0c1tzU2VtYW50aWNPYmplY3RdW3NBdHRyaWJ1dGVOYW1lTWFwcGVkXSkge1xuXHRcdFx0XHRMb2cuZXJyb3IoXG5cdFx0XHRcdFx0YFNpbXBsZUxpbmtEZWxlZ2F0ZTogVGhlIGF0dHJpYnV0ZSAke3NBdHRyaWJ1dGVOYW1lfSBjYW4gbm90IGJlIHJlbmFtZWQgdG8gdGhlIGF0dHJpYnV0ZSAke3NBdHRyaWJ1dGVOYW1lTWFwcGVkfSBkdWUgdG8gYSBjbGFzaCBzaXR1YXRpb24uIFRoaXMgY2FuIGxlYWQgdG8gd3JvbmcgbmF2aWdhdGlvbiBsYXRlciBvbi5gXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIENvcHkgdGhlIHZhbHVlIHJlcGxhY2luZyB0aGUgYXR0cmlidXRlIG5hbWUgYnkgc2VtYW50aWMgb2JqZWN0IG5hbWVcblx0XHRcdG9SZXN1bHRzW3NTZW1hbnRpY09iamVjdF1bc0F0dHJpYnV0ZU5hbWVNYXBwZWRdID0gb0NvbnRleHRPYmplY3Rbc0F0dHJpYnV0ZU5hbWVdO1xuXG5cdFx0XHRpZiAob0F0dHJpYnV0ZSkge1xuXHRcdFx0XHRpZiAob1RyYW5zZm9ybWF0aW9uQWRkaXRpb25hbCkge1xuXHRcdFx0XHRcdG9BdHRyaWJ1dGUudHJhbnNmb3JtYXRpb25zLnB1c2gob1RyYW5zZm9ybWF0aW9uQWRkaXRpb25hbCk7XG5cdFx0XHRcdFx0Y29uc3QgYUF0dHJpYnV0ZU5ldyA9IG9JbmZvTG9nLmNyZWF0ZUF0dHJpYnV0ZVN0cnVjdHVyZSgpO1xuXHRcdFx0XHRcdGFBdHRyaWJ1dGVOZXcudHJhbnNmb3JtYXRpb25zLnB1c2goe1xuXHRcdFx0XHRcdFx0dmFsdWU6IG9Db250ZXh0T2JqZWN0W3NBdHRyaWJ1dGVOYW1lXSxcblx0XHRcdFx0XHRcdGRlc2NyaXB0aW9uOiBgXFx1MjEzOSBUaGUgYXR0cmlidXRlICR7c0F0dHJpYnV0ZU5hbWVNYXBwZWR9IHdpdGggdGhlIHZhbHVlICR7b0NvbnRleHRPYmplY3Rbc0F0dHJpYnV0ZU5hbWVdfSBoYXMgYmVlbiBhZGRlZCBkdWUgdG8gYSBtYXBwaW5nIHJ1bGUgcmVnYXJkaW5nIHRoZSBhdHRyaWJ1dGUgJHtzQXR0cmlidXRlTmFtZX0gaW4gU2ltcGxlTGlua0RlbGVnYXRlLmBcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRvSW5mb0xvZy5hZGRTZW1hbnRpY09iamVjdEF0dHJpYnV0ZShzU2VtYW50aWNPYmplY3QsIHNBdHRyaWJ1dGVOYW1lTWFwcGVkLCBhQXR0cmlidXRlTmV3KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG59O1xuXG4vKipcbiAqIENoZWNrcyB3aGljaCBhdHRyaWJ1dGVzIG9mIHRoZSBDb250ZXh0T2JqZWN0IGJlbG9uZyB0byB3aGljaCBTZW1hbnRpY09iamVjdCBhbmQgbWFwcyB0aGVtIGludG8gYSB0d28gZGltZW5zaW9uYWwgYXJyYXkuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSBvQ29udGV4dE9iamVjdCBUaGUgQmluZGluZ0NvbnRleHQgb2YgdGhlIFNvdXJjZUNvbnRyb2wgb2YgdGhlIExpbmsgLyBvZiB0aGUgTGluayBpdHNlbGYgaWYgbm90IHNldFxuICogQHBhcmFtIG9QYXlsb2FkIFRoZSBwYXlsb2FkIGdpdmVuIGJ5IHRoZSBhcHBsaWNhdGlvblxuICogQHBhcmFtIG9JbmZvTG9nIFRoZSBjb3JyZXNwb25kaW5nIEluZm9Mb2cgb2YgdGhlIExpbmtcbiAqIEBwYXJhbSBvTGluayBUaGUgY29ycmVzcG9uZGluZyBMaW5rXG4gKiBAcmV0dXJucyBBIHR3byBkaW1lbnNpb25hbCBhcnJheSB3aGljaCBtYXBzIGEgZ2l2ZW4gU2VtYW50aWNPYmplY3QgbmFtZSB0b2dldGhlciB3aXRoIGEgZ2l2ZW4gYXR0cmlidXRlIG5hbWUgdG8gdGhlIHZhbHVlIG9mIHRoYXQgZ2l2ZW4gYXR0cmlidXRlXG4gKi9cblNpbXBsZUxpbmtEZWxlZ2F0ZS5fY2FsY3VsYXRlU2VtYW50aWNBdHRyaWJ1dGVzID0gZnVuY3Rpb24gKG9Db250ZXh0T2JqZWN0OiBhbnksIG9QYXlsb2FkOiBhbnksIG9JbmZvTG9nOiBhbnksIG9MaW5rOiBhbnkpIHtcblx0Y29uc3QgYUxpbmtDdXN0b21EYXRhID0gb0xpbmsgJiYgdGhpcy5fZmV0Y2hMaW5rQ3VzdG9tRGF0YShvTGluayk7XG5cdGNvbnN0IG9QYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZDogYW55ID0gU2ltcGxlTGlua0RlbGVnYXRlLl9nZXRQYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZChcblx0XHRvUGF5bG9hZCxcblx0XHRhTGlua0N1c3RvbURhdGFcblx0KTtcblx0Y29uc3Qgb1BheWxvYWRSZXNvbHZlZCA9IG9QYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZCA/IG9QYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZCA6IG9QYXlsb2FkO1xuXHR0aGlzLnJlc29sdmVkcGF5bG9hZCA9IG9QYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZDtcblx0Y29uc3QgYVNlbWFudGljT2JqZWN0cyA9IFNpbXBsZUxpbmtEZWxlZ2F0ZS5fZ2V0U2VtYW50aWNPYmplY3RzKG9QYXlsb2FkUmVzb2x2ZWQpO1xuXHRjb25zdCBtU2VtYW50aWNPYmplY3RNYXBwaW5ncyA9IFNpbXBsZUxpbmtEZWxlZ2F0ZS5fY29udmVydFNlbWFudGljT2JqZWN0TWFwcGluZyhcblx0XHRTaW1wbGVMaW5rRGVsZWdhdGUuX2dldFNlbWFudGljT2JqZWN0TWFwcGluZ3Mob1BheWxvYWRSZXNvbHZlZClcblx0KTtcblx0aWYgKCFhU2VtYW50aWNPYmplY3RzLmxlbmd0aCkge1xuXHRcdHJldHVybiB7IHBheWxvYWQ6IG9QYXlsb2FkUmVzb2x2ZWQsIHJlc3VsdHM6IHt9IH07XG5cdH1cblx0Y29uc3Qgb1Jlc3VsdHM6IGFueSA9IHt9O1xuXHRTaW1wbGVMaW5rRGVsZWdhdGUuX3VwZGF0ZVBheWxvYWRXaXRoU2VtYW50aWNBdHRyaWJ1dGVzKGFTZW1hbnRpY09iamVjdHMsIG9JbmZvTG9nLCBvQ29udGV4dE9iamVjdCwgb1Jlc3VsdHMsIG1TZW1hbnRpY09iamVjdE1hcHBpbmdzKTtcblx0cmV0dXJuIHsgcGF5bG9hZDogb1BheWxvYWRSZXNvbHZlZCwgcmVzdWx0czogb1Jlc3VsdHMgfTtcbn07XG4vKipcbiAqIFJldHJpZXZlcyB0aGUgYWN0dWFsIHRhcmdldHMgZm9yIHRoZSBuYXZpZ2F0aW9uIG9mIHRoZSBsaW5rLiBUaGlzIHVzZXMgdGhlIFVTaGVsbCBsb2FkZWQgYnkgdGhlIHtAbGluayBzYXAudWkubWRjLmxpbmsuRmFjdG9yeX0gdG8gcmV0cmlldmVcbiAqIHRoZSBuYXZpZ2F0aW9uIHRhcmdldHMgZnJvbSB0aGUgRkxQIHNlcnZpY2UuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSBzQXBwU3RhdGVLZXkgS2V5IG9mIHRoZSBhcHBzdGF0ZSAobm90IHVzZWQgeWV0KVxuICogQHBhcmFtIG9TZW1hbnRpY0F0dHJpYnV0ZXMgVGhlIGNhbGN1bGF0ZWQgYnkgX2NhbGN1bGF0ZVNlbWFudGljQXR0cmlidXRlc1xuICogQHBhcmFtIG9QYXlsb2FkIFRoZSBwYXlsb2FkIGdpdmVuIGJ5IHRoZSBhcHBsaWNhdGlvblxuICogQHBhcmFtIG9JbmZvTG9nIFRoZSBjb3JyZXNwb25kaW5nIEluZm9Mb2cgb2YgdGhlIExpbmtcbiAqIEBwYXJhbSBvTGluayBUaGUgY29ycmVzcG9uZGluZyBMaW5rXG4gKiBAcmV0dXJucyBSZXNvbHZpbmcgaW50byBhdmFpbGFibGVBdGlvbnMgYW5kIG93bk5hdmlnYXRpb24gY29udGFpbmluZyBhbiBhcnJheSBvZiB7QGxpbmsgc2FwLnVpLm1kYy5saW5rLkxpbmtJdGVtfVxuICovXG5TaW1wbGVMaW5rRGVsZWdhdGUuX3JldHJpZXZlTmF2aWdhdGlvblRhcmdldHMgPSBmdW5jdGlvbiAoXG5cdHNBcHBTdGF0ZUtleTogc3RyaW5nLFxuXHRvU2VtYW50aWNBdHRyaWJ1dGVzOiBhbnksXG5cdG9QYXlsb2FkOiBhbnksXG5cdG9JbmZvTG9nOiBhbnksXG5cdG9MaW5rOiBhbnlcbikge1xuXHRpZiAoIW9QYXlsb2FkLnNlbWFudGljT2JqZWN0cykge1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoW10pO1xuXHR9XG5cdGNvbnN0IGFTZW1hbnRpY09iamVjdHMgPSBvUGF5bG9hZC5zZW1hbnRpY09iamVjdHM7XG5cdGNvbnN0IG9OYXZpZ2F0aW9uVGFyZ2V0czogYW55ID0ge1xuXHRcdG93bk5hdmlnYXRpb246IHVuZGVmaW5lZCxcblx0XHRhdmFpbGFibGVBY3Rpb25zOiBbXVxuXHR9O1xuXHRsZXQgaVN1cGVyaW9yQWN0aW9uTGlua3NGb3VuZCA9IDA7XG5cdHJldHVybiBDb3JlLmxvYWRMaWJyYXJ5KFwic2FwLnVpLmZsXCIsIHtcblx0XHRhc3luYzogdHJ1ZVxuXHR9KS50aGVuKCgpID0+IHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcblx0XHRcdHNhcC51aS5yZXF1aXJlKFtcInNhcC91aS9mbC9VdGlsc1wiXSwgYXN5bmMgKFV0aWxzOiBhbnkpID0+IHtcblx0XHRcdFx0Y29uc3Qgb0FwcENvbXBvbmVudCA9IFV0aWxzLmdldEFwcENvbXBvbmVudEZvckNvbnRyb2wob0xpbmsgPT09IHVuZGVmaW5lZCA/IHRoaXMub0NvbnRyb2wgOiBvTGluayk7XG5cdFx0XHRcdGNvbnN0IG9TaGVsbFNlcnZpY2VzID0gb0FwcENvbXBvbmVudCA/IG9BcHBDb21wb25lbnQuZ2V0U2hlbGxTZXJ2aWNlcygpIDogbnVsbDtcblx0XHRcdFx0aWYgKCFvU2hlbGxTZXJ2aWNlcykge1xuXHRcdFx0XHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcblx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0cmVzb2x2ZShvTmF2aWdhdGlvblRhcmdldHMuYXZhaWxhYmxlQWN0aW9ucywgb05hdmlnYXRpb25UYXJnZXRzLm93bk5hdmlnYXRpb24pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICghb1NoZWxsU2VydmljZXMuaGFzVVNoZWxsKCkpIHtcblx0XHRcdFx0XHRMb2cuZXJyb3IoXCJTaW1wbGVMaW5rRGVsZWdhdGU6IFNlcnZpY2UgJ0Nyb3NzQXBwbGljYXRpb25OYXZpZ2F0aW9uJyBvciAnVVJMUGFyc2luZycgY291bGQgbm90IGJlIG9idGFpbmVkXCIpO1xuXHRcdFx0XHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcblx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0cmVzb2x2ZShvTmF2aWdhdGlvblRhcmdldHMuYXZhaWxhYmxlQWN0aW9ucywgb05hdmlnYXRpb25UYXJnZXRzLm93bk5hdmlnYXRpb24pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNvbnN0IGFQYXJhbXMgPSBhU2VtYW50aWNPYmplY3RzLm1hcChmdW5jdGlvbiAoc1NlbWFudGljT2JqZWN0OiBhbnkpIHtcblx0XHRcdFx0XHRyZXR1cm4gW1xuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRzZW1hbnRpY09iamVjdDogc1NlbWFudGljT2JqZWN0LFxuXHRcdFx0XHRcdFx0XHRwYXJhbXM6IG9TZW1hbnRpY0F0dHJpYnV0ZXMgPyBvU2VtYW50aWNBdHRyaWJ1dGVzW3NTZW1hbnRpY09iamVjdF0gOiB1bmRlZmluZWQsXG5cdFx0XHRcdFx0XHRcdGFwcFN0YXRlS2V5OiBzQXBwU3RhdGVLZXksXG5cdFx0XHRcdFx0XHRcdHNvcnRSZXN1bHRzQnk6IFwidGV4dFwiXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0Y29uc3QgYUxpbmtzID0gYXdhaXQgb1NoZWxsU2VydmljZXMuZ2V0TGlua3MoYVBhcmFtcyk7XG5cdFx0XHRcdFx0bGV0IGJIYXNMaW5rcyA9IGZhbHNlO1xuXHRcdFx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgYUxpbmtzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHRmb3IgKGxldCBqID0gMDsgaiA8IGFMaW5rc1tpXS5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRcdFx0XHRpZiAoYUxpbmtzW2ldW2pdLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRcdFx0XHRiSGFzTGlua3MgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGlmIChiSGFzTGlua3MpIHtcblx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmICghYUxpbmtzIHx8ICFhTGlua3MubGVuZ3RoIHx8ICFiSGFzTGlua3MpIHtcblx0XHRcdFx0XHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcblx0XHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRcdHJlc29sdmUob05hdmlnYXRpb25UYXJnZXRzLmF2YWlsYWJsZUFjdGlvbnMsIG9OYXZpZ2F0aW9uVGFyZ2V0cy5vd25OYXZpZ2F0aW9uKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRjb25zdCBhU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMgPSBTaW1wbGVMaW5rRGVsZWdhdGUuX2dldFNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zKG9QYXlsb2FkKTtcblx0XHRcdFx0XHRjb25zdCBvVW5hdmFpbGFibGVBY3Rpb25zID1cblx0XHRcdFx0XHRcdFNpbXBsZUxpbmtEZWxlZ2F0ZS5fY29udmVydFNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb24oYVNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zKTtcblx0XHRcdFx0XHRsZXQgc0N1cnJlbnRIYXNoID0gRmllbGRSdW50aW1lLl9mbkZpeEhhc2hRdWVyeVN0cmluZyhDb21tb25VdGlscy5nZXRIYXNoKCkpO1xuXG5cdFx0XHRcdFx0aWYgKHNDdXJyZW50SGFzaCkge1xuXHRcdFx0XHRcdFx0Ly8gQkNQIDE3NzAzMTUwMzU6IHdlIGhhdmUgdG8gc2V0IHRoZSBlbmQtcG9pbnQgJz8nIG9mIGFjdGlvbiBpbiBvcmRlciB0byBhdm9pZCBtYXRjaGluZyBvZiBcIiNTYWxlc09yZGVyLW1hbmFnZVwiIGluIFwiI1NhbGVzT3JkZXItbWFuYWdlRnVsZmlsbG1lbnRcIlxuXHRcdFx0XHRcdFx0c0N1cnJlbnRIYXNoICs9IFwiP1wiO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGNvbnN0IGZuSXNVbmF2YWlsYWJsZUFjdGlvbiA9IGZ1bmN0aW9uIChzU2VtYW50aWNPYmplY3Q6IGFueSwgc0FjdGlvbjogYW55KSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHRcdFx0XHQhIW9VbmF2YWlsYWJsZUFjdGlvbnMgJiZcblx0XHRcdFx0XHRcdFx0ISFvVW5hdmFpbGFibGVBY3Rpb25zW3NTZW1hbnRpY09iamVjdF0gJiZcblx0XHRcdFx0XHRcdFx0b1VuYXZhaWxhYmxlQWN0aW9uc1tzU2VtYW50aWNPYmplY3RdLmluZGV4T2Yoc0FjdGlvbikgPiAtMVxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdGNvbnN0IGZuQWRkTGluayA9IGZ1bmN0aW9uIChfb0xpbms6IGFueSkge1xuXHRcdFx0XHRcdFx0Y29uc3Qgb1NoZWxsSGFzaCA9IG9TaGVsbFNlcnZpY2VzLnBhcnNlU2hlbGxIYXNoKF9vTGluay5pbnRlbnQpO1xuXHRcdFx0XHRcdFx0aWYgKGZuSXNVbmF2YWlsYWJsZUFjdGlvbihvU2hlbGxIYXNoLnNlbWFudGljT2JqZWN0LCBvU2hlbGxIYXNoLmFjdGlvbikpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Y29uc3Qgc0hyZWYgPSBgIyR7b1NoZWxsU2VydmljZXMuY29uc3RydWN0U2hlbGxIYXNoKHsgdGFyZ2V0OiB7IHNoZWxsSGFzaDogX29MaW5rLmludGVudCB9IH0pfWA7XG5cblx0XHRcdFx0XHRcdGlmIChfb0xpbmsuaW50ZW50ICYmIF9vTGluay5pbnRlbnQuaW5kZXhPZihzQ3VycmVudEhhc2gpID09PSAwKSB7XG5cdFx0XHRcdFx0XHRcdC8vIFByZXZlbnQgY3VycmVudCBhcHAgZnJvbSBiZWluZyBsaXN0ZWRcblx0XHRcdFx0XHRcdFx0Ly8gTk9URTogSWYgdGhlIG5hdmlnYXRpb24gdGFyZ2V0IGV4aXN0cyBpblxuXHRcdFx0XHRcdFx0XHQvLyBtdWx0aXBsZSBjb250ZXh0cyAoflhYWFggaW4gaGFzaCkgdGhleSB3aWxsIGFsbCBiZSBza2lwcGVkXG5cdFx0XHRcdFx0XHRcdG9OYXZpZ2F0aW9uVGFyZ2V0cy5vd25OYXZpZ2F0aW9uID0gbmV3IExpbmtJdGVtKHtcblx0XHRcdFx0XHRcdFx0XHRocmVmOiBzSHJlZixcblx0XHRcdFx0XHRcdFx0XHR0ZXh0OiBfb0xpbmsudGV4dFxuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Y29uc3Qgb0xpbmtJdGVtID0gbmV3IExpbmtJdGVtKHtcblx0XHRcdFx0XHRcdFx0Ly8gQXMgdGhlIHJldHJpZXZlTmF2aWdhdGlvblRhcmdldHMgbWV0aG9kIGNhbiBiZSBjYWxsZWQgc2V2ZXJhbCB0aW1lIHdlIGNhbiBub3QgY3JlYXRlIHRoZSBMaW5rSXRlbSBpbnN0YW5jZSB3aXRoIHRoZSBzYW1lIGlkXG5cdFx0XHRcdFx0XHRcdGtleTpcblx0XHRcdFx0XHRcdFx0XHRvU2hlbGxIYXNoLnNlbWFudGljT2JqZWN0ICYmIG9TaGVsbEhhc2guYWN0aW9uXG5cdFx0XHRcdFx0XHRcdFx0XHQ/IGAke29TaGVsbEhhc2guc2VtYW50aWNPYmplY3R9LSR7b1NoZWxsSGFzaC5hY3Rpb259YFxuXHRcdFx0XHRcdFx0XHRcdFx0OiB1bmRlZmluZWQsXG5cdFx0XHRcdFx0XHRcdHRleHQ6IF9vTGluay50ZXh0LFxuXHRcdFx0XHRcdFx0XHRkZXNjcmlwdGlvbjogdW5kZWZpbmVkLFxuXHRcdFx0XHRcdFx0XHRocmVmOiBzSHJlZixcblx0XHRcdFx0XHRcdFx0Ly8gdGFyZ2V0OiBub3Qgc3VwcG9ydGVkIHlldFxuXHRcdFx0XHRcdFx0XHRpY29uOiB1bmRlZmluZWQsIC8vX29MaW5rLmljb24sXG5cdFx0XHRcdFx0XHRcdGluaXRpYWxseVZpc2libGU6IF9vTGluay50YWdzICYmIF9vTGluay50YWdzLmluZGV4T2YoXCJzdXBlcmlvckFjdGlvblwiKSA+IC0xXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdGlmIChvTGlua0l0ZW0uZ2V0UHJvcGVydHkoXCJpbml0aWFsbHlWaXNpYmxlXCIpKSB7XG5cdFx0XHRcdFx0XHRcdGlTdXBlcmlvckFjdGlvbkxpbmtzRm91bmQrKztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdG9OYXZpZ2F0aW9uVGFyZ2V0cy5hdmFpbGFibGVBY3Rpb25zLnB1c2gob0xpbmtJdGVtKTtcblxuXHRcdFx0XHRcdFx0aWYgKG9JbmZvTG9nKSB7XG5cdFx0XHRcdFx0XHRcdG9JbmZvTG9nLmFkZFNlbWFudGljT2JqZWN0SW50ZW50KG9TaGVsbEhhc2guc2VtYW50aWNPYmplY3QsIHtcblx0XHRcdFx0XHRcdFx0XHRpbnRlbnQ6IG9MaW5rSXRlbS5nZXRIcmVmKCksXG5cdFx0XHRcdFx0XHRcdFx0dGV4dDogb0xpbmtJdGVtLmdldFRleHQoKVxuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdGZvciAobGV0IG4gPSAwOyBuIDwgYVNlbWFudGljT2JqZWN0cy5sZW5ndGg7IG4rKykge1xuXHRcdFx0XHRcdFx0YUxpbmtzW25dWzBdLmZvckVhY2goZm5BZGRMaW5rKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKGlTdXBlcmlvckFjdGlvbkxpbmtzRm91bmQgPT09IDApIHtcblx0XHRcdFx0XHRcdGZvciAobGV0IGlMaW5rSXRlbUluZGV4ID0gMDsgaUxpbmtJdGVtSW5kZXggPCBvTmF2aWdhdGlvblRhcmdldHMuYXZhaWxhYmxlQWN0aW9ucy5sZW5ndGg7IGlMaW5rSXRlbUluZGV4KyspIHtcblx0XHRcdFx0XHRcdFx0aWYgKGlMaW5rSXRlbUluZGV4IDwgdGhpcy5nZXRDb25zdGFudHMoKS5pTGlua3NTaG93bkluUG9wdXApIHtcblx0XHRcdFx0XHRcdFx0XHRvTmF2aWdhdGlvblRhcmdldHMuYXZhaWxhYmxlQWN0aW9uc1tpTGlua0l0ZW1JbmRleF0uc2V0UHJvcGVydHkoXCJpbml0aWFsbHlWaXNpYmxlXCIsIHRydWUpO1xuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcblx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0cmVzb2x2ZShvTmF2aWdhdGlvblRhcmdldHMuYXZhaWxhYmxlQWN0aW9ucywgb05hdmlnYXRpb25UYXJnZXRzLm93bk5hdmlnYXRpb24pO1xuXHRcdFx0XHR9IGNhdGNoIChvRXJyb3IpIHtcblx0XHRcdFx0XHRMb2cuZXJyb3IoXCJTaW1wbGVMaW5rRGVsZWdhdGU6ICdfcmV0cmlldmVOYXZpZ2F0aW9uVGFyZ2V0cycgZmFpbGVkIGV4ZWN1dGluZyBnZXRMaW5rcyBtZXRob2RcIik7XG5cdFx0XHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHMtY29tbWVudFxuXHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRyZXNvbHZlKG9OYXZpZ2F0aW9uVGFyZ2V0cy5hdmFpbGFibGVBY3Rpb25zLCBvTmF2aWdhdGlvblRhcmdldHMub3duTmF2aWdhdGlvbik7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9KTtcbn07XG5TaW1wbGVMaW5rRGVsZWdhdGUuX2dldFNlbWFudGljT2JqZWN0cyA9IGZ1bmN0aW9uIChvUGF5bG9hZDogYW55KSB7XG5cdHJldHVybiBvUGF5bG9hZC5zZW1hbnRpY09iamVjdHMgPyBvUGF5bG9hZC5zZW1hbnRpY09iamVjdHMgOiBbXTtcbn07XG5TaW1wbGVMaW5rRGVsZWdhdGUuX2dldFNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zID0gZnVuY3Rpb24gKG9QYXlsb2FkOiBhbnkpIHtcblx0Y29uc3QgYVNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zOiBhbnlbXSA9IFtdO1xuXHRpZiAob1BheWxvYWQuc2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMpIHtcblx0XHRvUGF5bG9hZC5zZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChvU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbjogYW55KSB7XG5cdFx0XHRhU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMucHVzaChcblx0XHRcdFx0bmV3IFNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb24oe1xuXHRcdFx0XHRcdHNlbWFudGljT2JqZWN0OiBvU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbi5zZW1hbnRpY09iamVjdCxcblx0XHRcdFx0XHRhY3Rpb25zOiBvU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbi5hY3Rpb25zXG5cdFx0XHRcdH0pXG5cdFx0XHQpO1xuXHRcdH0pO1xuXHR9XG5cdHJldHVybiBhU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnM7XG59O1xuXG4vKipcbiAqIFRoaXMgd2lsbCByZXR1cm4gYW4gYXJyYXkgb2Yge0BsaW5rIHNhcC51aS5tZGMubGluay5TZW1hbnRpY09iamVjdE1hcHBpbmd9IGRlcGVuZGluZyBvbiB0aGUgZ2l2ZW4gcGF5bG9hZC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIG9QYXlsb2FkIFRoZSBwYXlsb2FkIGRlZmluZWQgYnkgdGhlIGFwcGxpY2F0aW9uXG4gKiBAcmV0dXJucyBBbiBhcnJheSBvZiBzZW1hbnRpYyBvYmplY3QgbWFwcGluZ3MuXG4gKi9cblNpbXBsZUxpbmtEZWxlZ2F0ZS5fZ2V0U2VtYW50aWNPYmplY3RNYXBwaW5ncyA9IGZ1bmN0aW9uIChvUGF5bG9hZDogYW55KSB7XG5cdGNvbnN0IGFTZW1hbnRpY09iamVjdE1hcHBpbmdzOiBhbnlbXSA9IFtdO1xuXHRsZXQgYVNlbWFudGljT2JqZWN0TWFwcGluZ0l0ZW1zOiBhbnlbXSA9IFtdO1xuXHRpZiAob1BheWxvYWQuc2VtYW50aWNPYmplY3RNYXBwaW5ncykge1xuXHRcdG9QYXlsb2FkLnNlbWFudGljT2JqZWN0TWFwcGluZ3MuZm9yRWFjaChmdW5jdGlvbiAob1NlbWFudGljT2JqZWN0TWFwcGluZzogYW55KSB7XG5cdFx0XHRhU2VtYW50aWNPYmplY3RNYXBwaW5nSXRlbXMgPSBbXTtcblx0XHRcdGlmIChvU2VtYW50aWNPYmplY3RNYXBwaW5nLml0ZW1zKSB7XG5cdFx0XHRcdG9TZW1hbnRpY09iamVjdE1hcHBpbmcuaXRlbXMuZm9yRWFjaChmdW5jdGlvbiAob1NlbWFudGljT2JqZWN0TWFwcGluZ0l0ZW06IGFueSkge1xuXHRcdFx0XHRcdGFTZW1hbnRpY09iamVjdE1hcHBpbmdJdGVtcy5wdXNoKFxuXHRcdFx0XHRcdFx0bmV3IFNlbWFudGljT2JqZWN0TWFwcGluZ0l0ZW0oe1xuXHRcdFx0XHRcdFx0XHRrZXk6IG9TZW1hbnRpY09iamVjdE1hcHBpbmdJdGVtLmtleSxcblx0XHRcdFx0XHRcdFx0dmFsdWU6IG9TZW1hbnRpY09iamVjdE1hcHBpbmdJdGVtLnZhbHVlXG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0YVNlbWFudGljT2JqZWN0TWFwcGluZ3MucHVzaChcblx0XHRcdFx0bmV3IFNlbWFudGljT2JqZWN0TWFwcGluZyh7XG5cdFx0XHRcdFx0c2VtYW50aWNPYmplY3Q6IG9TZW1hbnRpY09iamVjdE1hcHBpbmcuc2VtYW50aWNPYmplY3QsXG5cdFx0XHRcdFx0aXRlbXM6IGFTZW1hbnRpY09iamVjdE1hcHBpbmdJdGVtc1xuXHRcdFx0XHR9KVxuXHRcdFx0KTtcblx0XHR9KTtcblx0fVxuXHRyZXR1cm4gYVNlbWFudGljT2JqZWN0TWFwcGluZ3M7XG59O1xuLyoqXG4gKiBDb252ZXJ0cyBhIGdpdmVuIGFycmF5IG9mIFNlbWFudGljT2JqZWN0TWFwcGluZyBpbnRvIGEgTWFwIGNvbnRhaW5pbmcgU2VtYW50aWNPYmplY3RzIGFzIEtleXMgYW5kIGEgTWFwIG9mIGl0J3MgY29ycmVzcG9uZGluZyBTZW1hbnRpY09iamVjdE1hcHBpbmdzIGFzIHZhbHVlcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIGFTZW1hbnRpY09iamVjdE1hcHBpbmdzIEFuIGFycmF5IG9mIFNlbWFudGljT2JqZWN0TWFwcGluZ3MuXG4gKiBAcmV0dXJucyBUaGUgY29udmVydGVyZCBTZW1hbnRpY09iamVjdE1hcHBpbmdzXG4gKi9cblNpbXBsZUxpbmtEZWxlZ2F0ZS5fY29udmVydFNlbWFudGljT2JqZWN0TWFwcGluZyA9IGZ1bmN0aW9uIChhU2VtYW50aWNPYmplY3RNYXBwaW5nczogYW55W10pIHtcblx0aWYgKCFhU2VtYW50aWNPYmplY3RNYXBwaW5ncy5sZW5ndGgpIHtcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cdGNvbnN0IG1TZW1hbnRpY09iamVjdE1hcHBpbmdzOiBhbnkgPSB7fTtcblx0YVNlbWFudGljT2JqZWN0TWFwcGluZ3MuZm9yRWFjaChmdW5jdGlvbiAob1NlbWFudGljT2JqZWN0TWFwcGluZzogYW55KSB7XG5cdFx0aWYgKCFvU2VtYW50aWNPYmplY3RNYXBwaW5nLmdldFNlbWFudGljT2JqZWN0KCkpIHtcblx0XHRcdHRocm93IEVycm9yKFxuXHRcdFx0XHRgU2ltcGxlTGlua0RlbGVnYXRlOiAnc2VtYW50aWNPYmplY3QnIHByb3BlcnR5IHdpdGggdmFsdWUgJyR7b1NlbWFudGljT2JqZWN0TWFwcGluZy5nZXRTZW1hbnRpY09iamVjdCgpfScgaXMgbm90IHZhbGlkYFxuXHRcdFx0KTtcblx0XHR9XG5cdFx0bVNlbWFudGljT2JqZWN0TWFwcGluZ3Nbb1NlbWFudGljT2JqZWN0TWFwcGluZy5nZXRTZW1hbnRpY09iamVjdCgpXSA9IG9TZW1hbnRpY09iamVjdE1hcHBpbmdcblx0XHRcdC5nZXRJdGVtcygpXG5cdFx0XHQucmVkdWNlKGZ1bmN0aW9uIChvTWFwOiBhbnksIG9JdGVtOiBhbnkpIHtcblx0XHRcdFx0b01hcFtvSXRlbS5nZXRLZXkoKV0gPSBvSXRlbS5nZXRWYWx1ZSgpO1xuXHRcdFx0XHRyZXR1cm4gb01hcDtcblx0XHRcdH0sIHt9KTtcblx0fSk7XG5cdHJldHVybiBtU2VtYW50aWNPYmplY3RNYXBwaW5ncztcbn07XG4vKipcbiAqIENvbnZlcnRzIGEgZ2l2ZW4gYXJyYXkgb2YgU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMgaW50byBhIG1hcCBjb250YWluaW5nIFNlbWFudGljT2JqZWN0cyBhcyBrZXlzIGFuZCBhIG1hcCBvZiBpdHMgY29ycmVzcG9uZGluZyBTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucyBhcyB2YWx1ZXMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSBhU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMgVGhlIFNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zIGNvbnZlcnRlZFxuICogQHJldHVybnMgVGhlIG1hcCBjb250YWluaW5nIHRoZSBjb252ZXJ0ZWQgU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnNcbiAqL1xuU2ltcGxlTGlua0RlbGVnYXRlLl9jb252ZXJ0U2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbiA9IGZ1bmN0aW9uIChhU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnM6IGFueVtdKSB7XG5cdGxldCBfU2VtYW50aWNPYmplY3ROYW1lOiBhbnk7XG5cdGxldCBfU2VtYW50aWNPYmplY3RIYXNBbHJlYWR5VW5hdmFpbGFibGVBY3Rpb25zOiBhbnk7XG5cdGxldCBfVW5hdmFpbGFibGVBY3Rpb25zOiBhbnlbXSA9IFtdO1xuXHRpZiAoIWFTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucy5sZW5ndGgpIHtcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cdGNvbnN0IG1TZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uczogYW55ID0ge307XG5cdGFTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChvU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnM6IGFueSkge1xuXHRcdF9TZW1hbnRpY09iamVjdE5hbWUgPSBvU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMuZ2V0U2VtYW50aWNPYmplY3QoKTtcblx0XHRpZiAoIV9TZW1hbnRpY09iamVjdE5hbWUpIHtcblx0XHRcdHRocm93IEVycm9yKGBTaW1wbGVMaW5rRGVsZWdhdGU6ICdzZW1hbnRpY09iamVjdCcgcHJvcGVydHkgd2l0aCB2YWx1ZSAnJHtfU2VtYW50aWNPYmplY3ROYW1lfScgaXMgbm90IHZhbGlkYCk7XG5cdFx0fVxuXHRcdF9VbmF2YWlsYWJsZUFjdGlvbnMgPSBvU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMuZ2V0QWN0aW9ucygpO1xuXHRcdGlmIChtU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnNbX1NlbWFudGljT2JqZWN0TmFtZV0gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0bVNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zW19TZW1hbnRpY09iamVjdE5hbWVdID0gX1VuYXZhaWxhYmxlQWN0aW9ucztcblx0XHR9IGVsc2Uge1xuXHRcdFx0X1NlbWFudGljT2JqZWN0SGFzQWxyZWFkeVVuYXZhaWxhYmxlQWN0aW9ucyA9IG1TZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uc1tfU2VtYW50aWNPYmplY3ROYW1lXTtcblx0XHRcdF9VbmF2YWlsYWJsZUFjdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAoVW5hdmFpbGFibGVBY3Rpb246IHN0cmluZykge1xuXHRcdFx0XHRfU2VtYW50aWNPYmplY3RIYXNBbHJlYWR5VW5hdmFpbGFibGVBY3Rpb25zLnB1c2goVW5hdmFpbGFibGVBY3Rpb24pO1xuXHRcdFx0fSk7XG5cdFx0XHRtU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnNbX1NlbWFudGljT2JqZWN0TmFtZV0gPSBfU2VtYW50aWNPYmplY3RIYXNBbHJlYWR5VW5hdmFpbGFibGVBY3Rpb25zO1xuXHRcdH1cblx0fSk7XG5cdHJldHVybiBtU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnM7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBTaW1wbGVMaW5rRGVsZWdhdGU7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7O0VBZ0RBLE1BQU1BLGtCQUFrQixHQUFHQyxNQUFNLENBQUNDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRUMsWUFBWSxDQUFRO0VBQ2pFLE1BQU1DLFNBQVMsR0FBRztJQUNqQkMsa0JBQWtCLEVBQUUsQ0FBQztJQUNyQkMsUUFBUSxFQUFFLFlBQVk7SUFDdEJDLFlBQVksRUFBRSxpQkFBaUI7SUFDL0JDLG9CQUFvQixFQUFFLDBCQUEwQjtJQUNoREMsb0JBQW9CLEVBQUUsd0JBQXdCO0lBQzlDQyxnQkFBZ0IsRUFBRTtFQUNuQixDQUFDO0VBQ0RWLGtCQUFrQixDQUFDVyxZQUFZLEdBQUcsWUFBWTtJQUM3QyxPQUFPUCxTQUFTO0VBQ2pCLENBQUM7RUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0FKLGtCQUFrQixDQUFDWSxjQUFjLEdBQUcsVUFBVUMsUUFBYSxFQUFFQyxVQUEwQixFQUFFO0lBQ3hGLElBQUlBLFVBQVUsRUFBRTtNQUNmLE9BQU9BLFVBQVUsQ0FBQ0Msb0JBQW9CLENBQUNGLFFBQVEsQ0FBQ0csVUFBVSxDQUFDO0lBQzVELENBQUMsTUFBTTtNQUNOLE9BQU9DLFNBQVM7SUFDakI7RUFDRCxDQUFDO0VBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBakIsa0JBQWtCLENBQUNrQixrQkFBa0IsR0FBRyxVQUFV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