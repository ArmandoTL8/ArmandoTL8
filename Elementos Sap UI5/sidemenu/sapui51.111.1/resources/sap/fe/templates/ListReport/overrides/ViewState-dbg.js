/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/helpers/KeepAliveHelper", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/library", "sap/fe/core/templating/PropertyFormatters", "sap/fe/macros/DelegateUtil", "sap/fe/macros/filter/FilterUtils", "sap/fe/navigation/library", "sap/ui/Device", "sap/ui/fl/apply/api/ControlVariantApplyAPI", "sap/ui/mdc/enum/ConditionValidated", "sap/ui/mdc/p13n/StateUtil"], function (Log, CommonUtils, KeepAliveHelper, ModelHelper, CoreLibrary, PropertyFormatters, DelegateUtil, FilterUtils, NavLibrary, Device, ControlVariantApplyAPI, ConditionValidated, StateUtil) {
  "use strict";

  var system = Device.system;
  const NavType = NavLibrary.NavType,
    VariantManagementType = CoreLibrary.VariantManagement,
    TemplateContentView = CoreLibrary.TemplateContentView,
    InitialLoadMode = CoreLibrary.InitialLoadMode,
    CONDITION_PATH_TO_PROPERTY_PATH_REGEX = /\+|\*/g;
  const ViewStateOverride = {
    _bSearchTriggered: false,
    applyInitialStateOnly: function () {
      return true;
    },
    onBeforeStateApplied: function (aPromises) {
      const oView = this.getView(),
        oController = oView.getController(),
        oFilterBar = oController._getFilterBarControl(),
        aTables = oController._getControls("table");
      if (oFilterBar) {
        oFilterBar.setSuspendSelection(true);
        aPromises.push(oFilterBar.waitForInitialization());
      }
      aTables.forEach(function (oTable) {
        aPromises.push(oTable.initialized());
      });
      delete this._bSearchTriggered;
    },
    onAfterStateApplied: function () {
      const oController = this.getView().getController();
      const oFilterBar = oController._getFilterBarControl();
      if (oFilterBar) {
        oFilterBar.setSuspendSelection(false);
      } else if (oController._isFilterBarHidden()) {
        const oInternalModelContext = oController.getView().getBindingContext("internal");
        oInternalModelContext.setProperty("hasPendingFilters", false);
        if (oController._isMultiMode()) {
          oController._getMultiModeControl().setCountsOutDated(true);
        }
      }
    },
    adaptBindingRefreshControls: function (aControls) {
      const oView = this.getView(),
        oController = oView.getController(),
        aViewControls = oController._getControls(),
        aControlsToRefresh = KeepAliveHelper.getControlsForRefresh(oView, aViewControls);
      Array.prototype.push.apply(aControls, aControlsToRefresh);
    },
    adaptStateControls: function (aStateControls) {
      const oView = this.getView(),
        oController = oView.getController(),
        oViewData = oView.getViewData(),
        bControlVM = oViewData.variantManagement === VariantManagementType.Control;
      const oFilterBarVM = this._getFilterBarVM(oView);
      if (oFilterBarVM) {
        aStateControls.push(oFilterBarVM);
      }
      if (oController._isMultiMode()) {
        aStateControls.push(oController._getMultiModeControl());
      }
      oController._getControls("table").forEach(function (oTable) {
        const oQuickFilter = oTable.getQuickFilter();
        if (oQuickFilter) {
          aStateControls.push(oQuickFilter);
        }
        if (bControlVM) {
          aStateControls.push(oTable.getVariant());
        }
        aStateControls.push(oTable);
      });
      if (oController._getControls("Chart")) {
        oController._getControls("Chart").forEach(function (oChart) {
          if (bControlVM) {
            aStateControls.push(oChart.getVariant());
          }
          aStateControls.push(oChart);
        });
      }
      if (oController._hasMultiVisualizations()) {
        aStateControls.push(oController._getSegmentedButton(TemplateContentView.Chart));
        aStateControls.push(oController._getSegmentedButton(TemplateContentView.Table));
      }
      const oFilterBar = oController._getFilterBarControl();
      if (oFilterBar) {
        aStateControls.push(oFilterBar);
      }
      aStateControls.push(oView.byId("fe::ListReport"));
    },
    retrieveAdditionalStates: function (mAdditionalStates) {
      const oView = this.getView(),
        oController = oView.getController(),
        bPendingFilter = oView.getBindingContext("internal").getProperty("hasPendingFilters");
      mAdditionalStates.dataLoaded = !bPendingFilter || !!this._bSearchTriggered;
      if (oController._hasMultiVisualizations()) {
        const sAlpContentView = oView.getBindingContext("internal").getProperty("alpContentView");
        mAdditionalStates.alpContentView = sAlpContentView;
      }
      delete this._bSearchTriggered;
    },
    applyAdditionalStates: function (oAdditionalStates) {
      const oView = this.getView(),
        oController = oView.getController(),
        oFilterBar = oController._getFilterBarControl();
      if (oAdditionalStates) {
        // explicit check for boolean values - 'undefined' should not alter the triggered search property
        if (oAdditionalStates.dataLoaded === false && oFilterBar) {
          // without this, the data is loaded on navigating back
          oFilterBar._bSearchTriggered = false;
        } else if (oAdditionalStates.dataLoaded === true) {
          if (oFilterBar) {
            oFilterBar.triggerSearch();
          }
          this._bSearchTriggered = true;
        }
        if (oController._hasMultiVisualizations()) {
          const oInternalModelContext = oView.getBindingContext("internal");
          if (!system.desktop && oAdditionalStates.alpContentView == TemplateContentView.Hybrid) {
            oAdditionalStates.alpContentView = TemplateContentView.Chart;
          }
          oInternalModelContext.getModel().setProperty(`${oInternalModelContext.getPath()}/alpContentView`, oAdditionalStates.alpContentView);
        }
      }
    },
    _applyNavigationParametersToFilterbar: function (oNavigationParameter, aResults) {
      const oView = this.getView();
      const oController = oView.getController();
      const oAppComponent = oController.getAppComponent();
      const oComponentData = oAppComponent.getComponentData();
      const oStartupParameters = oComponentData && oComponentData.startupParameters || {};
      const oVariantPromise = this.handleVariantIdPassedViaURLParams(oStartupParameters);
      let bFilterVariantApplied;
      aResults.push(oVariantPromise.then(aVariants => {
        if (aVariants && aVariants.length > 0) {
          if (aVariants[0] === true || aVariants[1] === true) {
            bFilterVariantApplied = true;
          }
        }
        return this._applySelectionVariant(oView, oNavigationParameter, bFilterVariantApplied);
      }).then(() => {
        const oDynamicPage = oController._getDynamicListReportControl();
        let bPreventInitialSearch = false;
        const oFilterBarVM = this._getFilterBarVM(oView);
        const oFilterBarControl = oController._getFilterBarControl();
        if (oFilterBarControl) {
          if (oNavigationParameter.navigationType !== NavType.initial && oNavigationParameter.requiresStandardVariant || !oFilterBarVM && oView.getViewData().initialLoad === InitialLoadMode.Enabled || oController._shouldAutoTriggerSearch(oFilterBarVM)) {
            oFilterBarControl.triggerSearch();
          } else {
            bPreventInitialSearch = this._preventInitialSearch(oFilterBarVM);
          }
          // reset the suspend selection on filter bar to allow loading of data when needed (was set on LR Init)
          oFilterBarControl.setSuspendSelection(false);
          this._bSearchTriggered = !bPreventInitialSearch;
          oDynamicPage.setHeaderExpanded(system.desktop || bPreventInitialSearch);
        }
      }).catch(function () {
        Log.error("Variant ID cannot be applied");
      }));
    },
    handleVariantIdPassedViaURLParams: function (oUrlParams) {
      const aPageVariantId = oUrlParams["sap-ui-fe-variant-id"],
        aFilterBarVariantId = oUrlParams["sap-ui-fe-filterbar-variant-id"],
        aTableVariantId = oUrlParams["sap-ui-fe-table-variant-id"],
        aChartVariantId = oUrlParams["sap-ui-fe-chart-variant-id"];
      let oVariantIDs;
      if (aPageVariantId || aFilterBarVariantId || aTableVariantId || aChartVariantId) {
        oVariantIDs = {
          sPageVariantId: aPageVariantId && aPageVariantId[0],
          sFilterBarVariantId: aFilterBarVariantId && aFilterBarVariantId[0],
          sTableVariantId: aTableVariantId && aTableVariantId[0],
          sChartVariantId: aChartVariantId && aChartVariantId[0]
        };
      }
      return this._handleControlVariantId(oVariantIDs);
    },
    _handleControlVariantId: function (oVariantIDs) {
      let oVM;
      const oView = this.getView(),
        aPromises = [];
      const sVariantManagement = oView.getViewData().variantManagement;
      if (oVariantIDs && oVariantIDs.sPageVariantId && sVariantManagement === "Page") {
        oVM = oView.byId("fe::PageVariantManagement");
        this._handlePageVariantId(oVariantIDs, oVM, aPromises);
      } else if (oVariantIDs && sVariantManagement === "Control") {
        if (oVariantIDs.sFilterBarVariantId) {
          oVM = oView.getController()._getFilterBarVariantControl();
          this._handleFilterBarVariantControlId(oVariantIDs, oVM, aPromises);
        }
        if (oVariantIDs.sTableVariantId) {
          const oController = oView.getController();
          this._handleTableControlVariantId(oVariantIDs, oController, aPromises);
        }
        if (oVariantIDs.sChartVariantId) {
          const oController = oView.getController();
          this._handleChartControlVariantId(oVariantIDs, oController, aPromises);
        }
      }
      return Promise.all(aPromises);
    },
    /*
     * Handles page level variant and passes the variant to the function that pushes the promise to the promise array
     *
     * @param oVarinatIDs contains an object of all variant IDs
     * @param oVM contains the vairant management object for the page variant
     * @param aPromises is an array of all promises
     * @private
     */
    _handlePageVariantId: function (oVariantIDs, oVM, aPromises) {
      oVM.getVariants().forEach(oVariant => {
        this._findAndPushVariantToPromise(oVariant, oVariantIDs.sPageVariantId, oVM, aPromises, true);
      });
    },
    /*
     * Handles control level variant for filter bar and passes the variant to the function that pushes the promise to the promise array
     *
     * @param oVarinatIDs contains an object of all variant IDs
     * @param oVM contains the vairant management object for the filter bar
     * @param aPromises is an array of all promises
     * @private
     */

    _handleFilterBarVariantControlId: function (oVariantIDs, oVM, aPromises) {
      if (oVM) {
        oVM.getVariants().forEach(oVariant => {
          this._findAndPushVariantToPromise(oVariant, oVariantIDs.sFilterBarVariantId, oVM, aPromises, true);
        });
      }
    },
    /*
     * Handles control level variant for table and passes the variant to the function that pushes the promise to the promise array
     *
     * @param oVarinatIDs contains an object of all variant IDs
     * @param oController has the list report controller object
     * @param aPromises is an array of all promises
     * @private
     */
    _handleTableControlVariantId: function (oVariantIDs, oController, aPromises) {
      const aTables = oController._getControls("table");
      aTables.forEach(oTable => {
        const oTableVariant = oTable.getVariant();
        if (oTable && oTableVariant) {
          oTableVariant.getVariants().forEach(oVariant => {
            this._findAndPushVariantToPromise(oVariant, oVariantIDs.sTableVariantId, oTableVariant, aPromises);
          });
        }
      });
    },
    /*
     * Handles control level variant for chart and passes the variant to the function that pushes the promise to the promise array
     *
     * @param oVarinatIDs contains an object of all variant IDs
     * @param oController has the list report controller object
     * @param aPromises is an array of all promises
     * @private
     */
    _handleChartControlVariantId: function (oVariantIDs, oController, aPromises) {
      const aCharts = oController._getControls("Chart");
      aCharts.forEach(oChart => {
        const oChartVariant = oChart.getVariant();
        const aVariants = oChartVariant.getVariants();
        if (aVariants) {
          aVariants.forEach(oVariant => {
            this._findAndPushVariantToPromise(oVariant, oVariantIDs.sChartVariantId, oChartVariant, aPromises);
          });
        }
      });
    },
    /*
     * Matches the variant ID provided in the url to the available vairant IDs and pushes the appropriate promise to the promise array
     *
     * @param oVariant is an object for a specific variant
     * @param sVariantId is the variant ID provided in the url
     * @param oVM is the variant management object for the specfic variant
     * @param aPromises is an array of promises
     * @param bFilterVariantApplied is an optional parameter which is set to ture in case the filter variant is applied
     * @private
     */
    _findAndPushVariantToPromise: function (oVariant, sVariantId, oVM, aPromises, bFilterVariantApplied) {
      if (oVariant.key === sVariantId) {
        aPromises.push(this._applyControlVariant(oVM, sVariantId, bFilterVariantApplied));
      }
    },
    _applyControlVariant: function (oVariant, sVariantID, bFilterVariantApplied) {
      const sVariantReference = this._checkIfVariantIdIsAvailable(oVariant, sVariantID) ? sVariantID : oVariant.getStandardVariantKey();
      const oVM = ControlVariantApplyAPI.activateVariant({
        element: oVariant,
        variantReference: sVariantReference
      });
      return oVM.then(function () {
        return bFilterVariantApplied;
      });
    },
    /************************************* private helper *****************************************/

    _getFilterBarVM: function (oView) {
      const oViewData = oView.getViewData();
      switch (oViewData.variantManagement) {
        case VariantManagementType.Page:
          return oView.byId("fe::PageVariantManagement");
        case VariantManagementType.Control:
          return oView.getController()._getFilterBarVariantControl();
        case VariantManagementType.None:
          return null;
        default:
          throw new Error(`unhandled variant setting: ${oViewData.variantManagement}`);
      }
    },
    _preventInitialSearch: function (oVariantManagement) {
      if (!oVariantManagement) {
        return true;
      }
      const aVariants = oVariantManagement.getVariants();
      const oCurrentVariant = aVariants.find(function (oItem) {
        return oItem.key === oVariantManagement.getCurrentVariantKey();
      });
      return !oCurrentVariant.executeOnSelect;
    },
    _applySelectionVariant: function (oView, oNavigationParameter, bFilterVariantApplied) {
      const oFilterBar = oView.getController()._getFilterBarControl(),
        oSelectionVariant = oNavigationParameter.selectionVariant,
        oSelectionVariantDefaults = oNavigationParameter.selectionVariantDefaults;
      if (!oFilterBar || !oSelectionVariant) {
        return Promise.resolve();
      }
      let oConditions = {};
      const oMetaModel = oView.getModel().getMetaModel();
      const oViewData = oView.getViewData();
      const sContextPath = oViewData.contextPath || `/${oViewData.entitySet}`;
      const aMandatoryFilterFields = CommonUtils.getMandatoryFilterFields(oMetaModel, sContextPath);
      const bUseSemanticDateRange = oFilterBar.data("useSemanticDateRange");
      let oVariant;
      switch (oViewData.variantManagement) {
        case VariantManagementType.Page:
          oVariant = oView.byId("fe::PageVariantManagement");
          break;
        case VariantManagementType.Control:
          oVariant = oView.getController()._getFilterBarVariantControl();
          break;
        case VariantManagementType.None:
        default:
          break;
      }
      const bRequiresStandardVariant = oNavigationParameter.requiresStandardVariant;
      // check if FLP default values are there and is it standard variant
      const bIsFLPValuePresent = oSelectionVariantDefaults && oSelectionVariantDefaults.getSelectOptionsPropertyNames().length > 0 && oVariant.getDefaultVariantKey() === oVariant.getStandardVariantKey() && oNavigationParameter.bNavSelVarHasDefaultsOnly;

      // get conditions when FLP value is present
      if (bFilterVariantApplied || bIsFLPValuePresent) {
        oConditions = oFilterBar.getConditions();
      }
      CommonUtils.addDefaultDisplayCurrency(aMandatoryFilterFields, oSelectionVariant, oSelectionVariantDefaults);
      CommonUtils.addSelectionVariantToConditions(oSelectionVariant, oConditions, oMetaModel, sContextPath, bIsFLPValuePresent, bUseSemanticDateRange, oViewData);
      return this._activateSelectionVariant(oFilterBar, oConditions, oVariant, bRequiresStandardVariant, bFilterVariantApplied, bIsFLPValuePresent);
    },
    _activateSelectionVariant: function (oFilterBar, oConditions, oVariant, bRequiresStandardVariant, bFilterVariantApplied, bIsFLPValuePresent) {
      let oPromise;
      if (oVariant && !bFilterVariantApplied) {
        let oVariantKey = bRequiresStandardVariant ? oVariant.getStandardVariantKey() : oVariant.getDefaultVariantKey();
        if (oVariantKey === null) {
          oVariantKey = oVariant.getId();
        }
        oPromise = ControlVariantApplyAPI.activateVariant({
          element: oVariant,
          variantReference: oVariantKey
        }).then(function () {
          return bRequiresStandardVariant || oVariant.getDefaultVariantKey() === oVariant.getStandardVariantKey();
        });
      } else {
        oPromise = Promise.resolve(true);
      }
      return oPromise.then(bClearFilterAndReplaceWithAppState => {
        if (bClearFilterAndReplaceWithAppState) {
          return this._fnApplyConditions(oFilterBar, oConditions, bIsFLPValuePresent);
        }
      });
    },
    /*
     * Sets filtered: false flag to every field so that it can be cleared out
     *
     * @param oFilterBar filterbar control is used to display filter properties in a user-friendly manner to populate values for a query
     * @returns promise which will be resolved to object
     * @private
     */
    _fnClearStateBeforexAppNav: async function (oFilterBar) {
      return await StateUtil.retrieveExternalState(oFilterBar).then(oExternalState => {
        const oCondition = oExternalState.filter;
        for (const field in oCondition) {
          if (field !== "$editState" && field !== "$search") {
            oCondition[field][0]["filtered"] = false;
          }
        }
        return Promise.resolve(oCondition);
      }).catch(function (oError) {
        Log.error("Error while retrieving the external state", oError);
      });
    },
    _fnApplyConditions: async function (oFilterBar, oConditions, bIsFLPValuePresent) {
      const mFilter = {},
        aItems = [],
        fnAdjustValueHelpCondition = function (oCondition) {
          // in case the condition is meant for a field having a VH, the format required by MDC differs
          oCondition.validated = ConditionValidated.Validated;
          if (oCondition.operator === "Empty") {
            oCondition.operator = "EQ";
            oCondition.values = [""];
          } else if (oCondition.operator === "NotEmpty") {
            oCondition.operator = "NE";
            oCondition.values = [""];
          }
          delete oCondition.isEmpty;
        };
      const fnGetPropertyInfo = function (oFilterControl, sEntityTypePath) {
        const sEntitySetPath = ModelHelper.getEntitySetPath(sEntityTypePath),
          oMetaModel = oFilterControl.getModel().getMetaModel(),
          oFR = CommonUtils.getFilterRestrictionsByPath(sEntitySetPath, oMetaModel),
          aNonFilterableProps = oFR.NonFilterableProperties,
          mFilterFields = FilterUtils.getConvertedFilterFields(oFilterControl, sEntityTypePath),
          aPropertyInfo = [];
        Object.keys(mFilterFields).forEach(function (sFilterFieldKey) {
          const oConvertedProperty = mFilterFields[sFilterFieldKey];
          const sPropertyPath = oConvertedProperty.conditionPath.replace(CONDITION_PATH_TO_PROPERTY_PATH_REGEX, "");
          if (aNonFilterableProps.indexOf(sPropertyPath) === -1) {
            const sAnnotationPath = oConvertedProperty.annotationPath;
            const oPropertyContext = oMetaModel.createBindingContext(sAnnotationPath);
            aPropertyInfo.push({
              path: oConvertedProperty.conditionPath,
              hiddenFilter: oConvertedProperty.availability === "Hidden",
              hasValueHelp: !sAnnotationPath ? false : PropertyFormatters.hasValueHelp(oPropertyContext.getObject(), {
                context: oPropertyContext
              })
            });
          }
        });
        return aPropertyInfo;
      };
      return oFilterBar.waitForInitialization().then(async () => {
        const sEntityTypePath = DelegateUtil.getCustomData(oFilterBar, "entityType");
        // During external app navigation, we have to clear the existing conditions to avoid merging of values coming from annotation and context
        // Condition !bIsFLPValuePresent indicates it's external app navigation
        if (!bIsFLPValuePresent) {
          const oClearConditions = await this._fnClearStateBeforexAppNav(oFilterBar);
          await StateUtil.applyExternalState(oFilterBar, {
            filter: oClearConditions,
            items: aItems
          });
        }
        const aPropertyInfo = fnGetPropertyInfo(oFilterBar, sEntityTypePath);
        aPropertyInfo.filter(function (oPropertyInfo) {
          return oPropertyInfo.path !== "$editState" && oPropertyInfo.path !== "$search";
        }).forEach(function (oPropertyInfo) {
          if (oPropertyInfo.path in oConditions) {
            mFilter[oPropertyInfo.path] = oConditions[oPropertyInfo.path];
            if (!oPropertyInfo.hiddenFilter) {
              aItems.push({
                name: oPropertyInfo.path
              });
            }
            if (oPropertyInfo.hasValueHelp) {
              mFilter[oPropertyInfo.path].forEach(fnAdjustValueHelpCondition);
            } else {
              mFilter[oPropertyInfo.path].forEach(function (oCondition) {
                oCondition.validated = oCondition.filtered ? ConditionValidated.NotValidated : oCondition.validated;
              });
            }
          } else {
            mFilter[oPropertyInfo.path] = [];
          }
        });
        return StateUtil.applyExternalState(oFilterBar, {
          filter: mFilter,
          items: aItems
        });
      });
    }
  };
  return ViewStateOverride;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOYXZUeXBlIiwiTmF2TGlicmFyeSIsIlZhcmlhbnRNYW5hZ2VtZW50VHlwZSIsIkNvcmVMaWJyYXJ5IiwiVmFyaWFudE1hbmFnZW1lbnQiLCJUZW1wbGF0ZUNvbnRlbnRWaWV3IiwiSW5pdGlhbExvYWRNb2RlIiwiQ09ORElUSU9OX1BBVEhfVE9fUFJPUEVSVFlfUEFUSF9SRUdFWCIsIlZpZXdTdGF0ZU92ZXJyaWRlIiwiX2JTZWFyY2hUcmlnZ2VyZWQiLCJhcHBseUluaXRpYWxTdGF0ZU9ubHkiLCJvbkJlZm9yZVN0YXRlQXBwbGllZCIsImFQcm9taXNlcyIsIm9WaWV3IiwiZ2V0VmlldyIsIm9Db250cm9sbGVyIiwiZ2V0Q29udHJvbGxlciIsIm9GaWx0ZXJCYXIiLCJfZ2V0RmlsdGVyQmFyQ29udHJvbCIsImFUYWJsZXMiLCJfZ2V0Q29udHJvbHMiLCJzZXRTdXNwZW5kU2VsZWN0aW9uIiwicHVzaCIsIndhaXRGb3JJbml0aWFsaXphdGlvbiIsImZvckVhY2giLCJvVGFibGUiLCJpbml0aWFsaXplZCIsIm9uQWZ0ZXJTdGF0ZUFwcGxpZWQiLCJfaXNGaWx0ZXJCYXJIaWRkZW4iLCJvSW50ZXJuYWxNb2RlbENvbnRleHQiLCJnZXRCaW5kaW5nQ29udGV4dCIsInNldFByb3BlcnR5IiwiX2lzTXVsdGlNb2RlIiwiX2dldE11bHRpTW9kZUNvbnRyb2wiLCJzZXRDb3VudHNPdXREYXRlZCIsImFkYXB0QmluZGluZ1JlZnJlc2hDb250cm9scyIsImFDb250cm9scyIsImFWaWV3Q29udHJvbHMiLCJhQ29udHJvbHNUb1JlZnJlc2giLCJLZWVwQWxpdmVIZWxwZXIiLCJnZXRDb250cm9sc0ZvclJlZnJlc2giLCJBcnJheSIsInByb3RvdHlwZSIsImFwcGx5IiwiYWRhcHRTdGF0ZUNvbnRyb2xzIiwiYVN0YXRlQ29udHJvbHMiLCJvVmlld0RhdGEiLCJnZXRWaWV3RGF0YSIsImJDb250cm9sVk0iLCJ2YXJpYW50TWFuYWdlbWVudCIsIkNvbnRyb2wiLCJvRmlsdGVyQmFyVk0iLCJfZ2V0RmlsdGVyQmFyVk0iLCJvUXVpY2tGaWx0ZXIiLCJnZXRRdWlja0ZpbHRlciIsImdldFZhcmlhbnQiLCJvQ2hhcnQiLCJfaGFzTXVsdGlWaXN1YWxpemF0aW9ucyIsIl9nZXRTZWdtZW50ZWRCdXR0b24iLCJDaGFydCIsIlRhYmxlIiwiYnlJZCIsInJldHJpZXZlQWRkaXRpb25hbFN0YXRlcyIsIm1BZGRpdGlvbmFsU3RhdGVzIiwiYlBlbmRpbmdGaWx0ZXIiLCJnZXRQcm9wZXJ0eSIsImRhdGFMb2FkZWQiLCJzQWxwQ29udGVudFZpZXciLCJhbHBDb250ZW50VmlldyIsImFwcGx5QWRkaXRpb25hbFN0YXRlcyIsIm9BZGRpdGlvbmFsU3RhdGVzIiwidHJpZ2dlclNlYXJjaCIsInN5c3RlbSIsImRlc2t0b3AiLCJIeWJyaWQiLCJnZXRNb2RlbCIsImdldFBhdGgiLCJfYXBwbHlOYXZpZ2F0aW9uUGFyYW1ldGVyc1RvRmlsdGVyYmFyIiwib05hdmlnYXRpb25QYXJhbWV0ZXIiLCJhUmVzdWx0cyIsIm9BcHBDb21wb25lbnQiLCJnZXRBcHBDb21wb25lbnQiLCJvQ29tcG9uZW50RGF0YSIsImdldENvbXBvbmVudERhdGEiLCJvU3RhcnR1cFBhcmFtZXRlcnMiLCJzdGFydHVwUGFyYW1ldGVycyIsIm9WYXJpYW50UHJvbWlzZSIsImhhbmRsZVZhcmlhbnRJZFBhc3NlZFZpYVVSTFBhcmFtcyIsImJGaWx0ZXJWYXJpYW50QXBwbGllZCIsInRoZW4iLCJhVmFyaWFudHMiLCJsZW5ndGgiLCJfYXBwbHlTZWxlY3Rpb25WYXJpYW50Iiwib0R5bmFtaWNQYWdlIiwiX2dldER5bmFtaWNMaXN0UmVwb3J0Q29udHJvbCIsImJQcmV2ZW50SW5pdGlhbFNlYXJjaCIsIm9GaWx0ZXJCYXJDb250cm9sIiwibmF2aWdhdGlvblR5cGUiLCJpbml0aWFsIiwicmVxdWlyZXNTdGFuZGFyZFZhcmlhbnQiLCJpbml0aWFsTG9hZCIsIkVuYWJsZWQiLCJfc2hvdWxkQXV0b1RyaWdnZXJTZWFyY2giLCJfcHJldmVudEluaXRpYWxTZWFyY2giLCJzZXRIZWFkZXJFeHBhbmRlZCIsImNhdGNoIiwiTG9nIiwiZXJyb3IiLCJvVXJsUGFyYW1zIiwiYVBhZ2VWYXJpYW50SWQiLCJhRmlsdGVyQmFyVmFyaWFudElkIiwiYVRhYmxlVmFyaWFudElkIiwiYUNoYXJ0VmFyaWFudElkIiwib1ZhcmlhbnRJRHMiLCJzUGFnZVZhcmlhbnRJZCIsInNGaWx0ZXJCYXJWYXJpYW50SWQiLCJzVGFibGVWYXJpYW50SWQiLCJzQ2hhcnRWYXJpYW50SWQiLCJfaGFuZGxlQ29udHJvbFZhcmlhbnRJZCIsIm9WTSIsInNWYXJpYW50TWFuYWdlbWVudCIsIl9oYW5kbGVQYWdlVmFyaWFudElkIiwiX2dldEZpbHRlckJhclZhcmlhbnRDb250cm9sIiwiX2hhbmRsZUZpbHRlckJhclZhcmlhbnRDb250cm9sSWQiLCJfaGFuZGxlVGFibGVDb250cm9sVmFyaWFudElkIiwiX2hhbmRsZUNoYXJ0Q29udHJvbFZhcmlhbnRJZCIsIlByb21pc2UiLCJhbGwiLCJnZXRWYXJpYW50cyIsIm9WYXJpYW50IiwiX2ZpbmRBbmRQdXNoVmFyaWFudFRvUHJvbWlzZSIsIm9UYWJsZVZhcmlhbnQiLCJhQ2hhcnRzIiwib0NoYXJ0VmFyaWFudCIsInNWYXJpYW50SWQiLCJrZXkiLCJfYXBwbHlDb250cm9sVmFyaWFudCIsInNWYXJpYW50SUQiLCJzVmFyaWFudFJlZmVyZW5jZSIsIl9jaGVja0lmVmFyaWFudElkSXNBdmFpbGFibGUiLCJnZXRTdGFuZGFyZFZhcmlhbnRLZXkiLCJDb250cm9sVmFyaWFudEFwcGx5QVBJIiwiYWN0aXZhdGVWYXJpYW50IiwiZWxlbWVudCIsInZhcmlhbnRSZWZlcmVuY2UiLCJQYWdlIiwiTm9uZSIsIkVycm9yIiwib1ZhcmlhbnRNYW5hZ2VtZW50Iiwib0N1cnJlbnRWYXJpYW50IiwiZmluZCIsIm9JdGVtIiwiZ2V0Q3VycmVudFZhcmlhbnRLZXkiLCJleGVjdXRlT25TZWxlY3QiLCJvU2VsZWN0aW9uVmFyaWFudCIsInNlbGVjdGlvblZhcmlhbnQiLCJvU2VsZWN0aW9uVmFyaWFudERlZmF1bHRzIiwic2VsZWN0aW9uVmFyaWFudERlZmF1bHRzIiwicmVzb2x2ZSIsIm9Db25kaXRpb25zIiwib01ldGFNb2RlbCIsImdldE1ldGFNb2RlbCIsInNDb250ZXh0UGF0aCIsImNvbnRleHRQYXRoIiwiZW50aXR5U2V0IiwiYU1hbmRhdG9yeUZpbHRlckZpZWxkcyIsIkNvbW1vblV0aWxzIiwiZ2V0TWFuZGF0b3J5RmlsdGVyRmllbGRzIiwiYlVzZVNlbWFudGljRGF0ZVJhbmdlIiwiZGF0YSIsImJSZXF1aXJlc1N0YW5kYXJkVmFyaWFudCIsImJJc0ZMUFZhbHVlUHJlc2VudCIsImdldFNlbGVjdE9wdGlvbnNQcm9wZXJ0eU5hbWVzIiwiZ2V0RGVmYXVsdFZhcmlhbnRLZXkiLCJiTmF2U2VsVmFySGFzRGVmYXVsdHNPbmx5IiwiZ2V0Q29uZGl0aW9ucyIsImFkZERlZmF1bHREaXNwbGF5Q3VycmVuY3kiLCJhZGRTZWxlY3Rpb25WYXJpYW50VG9Db25kaXRpb25zIiwiX2FjdGl2YXRlU2VsZWN0aW9uVmFyaWFudCIsIm9Qcm9taXNlIiwib1ZhcmlhbnRLZXkiLCJnZXRJZCIsImJDbGVhckZpbHRlckFuZFJlcGxhY2VXaXRoQXBwU3RhdGUiLCJfZm5BcHBseUNvbmRpdGlvbnMiLCJfZm5DbGVhclN0YXRlQmVmb3JleEFwcE5hdiIsIlN0YXRlVXRpbCIsInJldHJpZXZlRXh0ZXJuYWxTdGF0ZSIsIm9FeHRlcm5hbFN0YXRlIiwib0NvbmRpdGlvbiIsImZpbHRlciIsImZpZWxkIiwib0Vycm9yIiwibUZpbHRlciIsImFJdGVtcyIsImZuQWRqdXN0VmFsdWVIZWxwQ29uZGl0aW9uIiwidmFsaWRhdGVkIiwiQ29uZGl0aW9uVmFsaWRhdGVkIiwiVmFsaWRhdGVkIiwib3BlcmF0b3IiLCJ2YWx1ZXMiLCJpc0VtcHR5IiwiZm5HZXRQcm9wZXJ0eUluZm8iLCJvRmlsdGVyQ29udHJvbCIsInNFbnRpdHlUeXBlUGF0aCIsInNFbnRpdHlTZXRQYXRoIiwiTW9kZWxIZWxwZXIiLCJnZXRFbnRpdHlTZXRQYXRoIiwib0ZSIiwiZ2V0RmlsdGVyUmVzdHJpY3Rpb25zQnlQYXRoIiwiYU5vbkZpbHRlcmFibGVQcm9wcyIsIk5vbkZpbHRlcmFibGVQcm9wZXJ0aWVzIiwibUZpbHRlckZpZWxkcyIsIkZpbHRlclV0aWxzIiwiZ2V0Q29udmVydGVkRmlsdGVyRmllbGRzIiwiYVByb3BlcnR5SW5mbyIsIk9iamVjdCIsImtleXMiLCJzRmlsdGVyRmllbGRLZXkiLCJvQ29udmVydGVkUHJvcGVydHkiLCJzUHJvcGVydHlQYXRoIiwiY29uZGl0aW9uUGF0aCIsInJlcGxhY2UiLCJpbmRleE9mIiwic0Fubm90YXRpb25QYXRoIiwiYW5ub3RhdGlvblBhdGgiLCJvUHJvcGVydHlDb250ZXh0IiwiY3JlYXRlQmluZGluZ0NvbnRleHQiLCJwYXRoIiwiaGlkZGVuRmlsdGVyIiwiYXZhaWxhYmlsaXR5IiwiaGFzVmFsdWVIZWxwIiwiUHJvcGVydHlGb3JtYXR0ZXJzIiwiZ2V0T2JqZWN0IiwiY29udGV4dCIsIkRlbGVnYXRlVXRpbCIsImdldEN1c3RvbURhdGEiLCJvQ2xlYXJDb25kaXRpb25zIiwiYXBwbHlFeHRlcm5hbFN0YXRlIiwiaXRlbXMiLCJvUHJvcGVydHlJbmZvIiwibmFtZSIsImZpbHRlcmVkIiwiTm90VmFsaWRhdGVkIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJWaWV3U3RhdGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgdHlwZSBWaWV3U3RhdGUgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL1ZpZXdTdGF0ZVwiO1xuaW1wb3J0IEtlZXBBbGl2ZUhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9LZWVwQWxpdmVIZWxwZXJcIjtcbmltcG9ydCB0eXBlIHsgSW50ZXJuYWxNb2RlbENvbnRleHQgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Nb2RlbEhlbHBlclwiO1xuaW1wb3J0IE1vZGVsSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL01vZGVsSGVscGVyXCI7XG5pbXBvcnQgQ29yZUxpYnJhcnkgZnJvbSBcInNhcC9mZS9jb3JlL2xpYnJhcnlcIjtcbmltcG9ydCAqIGFzIFByb3BlcnR5Rm9ybWF0dGVycyBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9Qcm9wZXJ0eUZvcm1hdHRlcnNcIjtcbmltcG9ydCBEZWxlZ2F0ZVV0aWwgZnJvbSBcInNhcC9mZS9tYWNyb3MvRGVsZWdhdGVVdGlsXCI7XG5pbXBvcnQgRmlsdGVyVXRpbHMgZnJvbSBcInNhcC9mZS9tYWNyb3MvZmlsdGVyL0ZpbHRlclV0aWxzXCI7XG5pbXBvcnQgTmF2TGlicmFyeSBmcm9tIFwic2FwL2ZlL25hdmlnYXRpb24vbGlicmFyeVwiO1xuaW1wb3J0IHR5cGUgTGlzdFJlcG9ydENvbnRyb2xsZXIgZnJvbSBcInNhcC9mZS90ZW1wbGF0ZXMvTGlzdFJlcG9ydC9MaXN0UmVwb3J0Q29udHJvbGxlci5jb250cm9sbGVyXCI7XG5pbXBvcnQgeyBzeXN0ZW0gfSBmcm9tIFwic2FwL3VpL0RldmljZVwiO1xuaW1wb3J0IENvbnRyb2xWYXJpYW50QXBwbHlBUEkgZnJvbSBcInNhcC91aS9mbC9hcHBseS9hcGkvQ29udHJvbFZhcmlhbnRBcHBseUFQSVwiO1xuaW1wb3J0IHR5cGUgVmFyaWFudE1hbmFnZW1lbnQgZnJvbSBcInNhcC91aS9mbC92YXJpYW50cy9WYXJpYW50TWFuYWdlbWVudFwiO1xuaW1wb3J0IENoYXJ0IGZyb20gXCJzYXAvdWkvbWRjL0NoYXJ0XCI7XG5pbXBvcnQgQ29uZGl0aW9uVmFsaWRhdGVkIGZyb20gXCJzYXAvdWkvbWRjL2VudW0vQ29uZGl0aW9uVmFsaWRhdGVkXCI7XG5pbXBvcnQgRmlsdGVyQmFyIGZyb20gXCJzYXAvdWkvbWRjL0ZpbHRlckJhclwiO1xuaW1wb3J0IFN0YXRlVXRpbCBmcm9tIFwic2FwL3VpL21kYy9wMTNuL1N0YXRlVXRpbFwiO1xuaW1wb3J0IFRhYmxlIGZyb20gXCJzYXAvdWkvbWRjL1RhYmxlXCI7XG5cbnR5cGUgVmFyaWFudE9iamVjdCA9IHtcblx0YXV0aG9yOiBTdHJpbmc7XG5cdGNoYW5nZTogYm9vbGVhbjtcblx0Y29udGV4dHM6IG9iamVjdDtcblx0ZXhlY3V0ZU9uU2VsZWN0OiBib29sZWFuO1xuXHRmYXZvcml0ZTogYm9vbGVhbjtcblx0a2V5OiBTdHJpbmc7XG5cdG9yaWdpbmFsQ29udGV4dHM6IG9iamVjdDtcblx0b3JpZ2luYWxFeGVjdXRlT25TZWxlY3Q6IGJvb2xlYW47XG5cdG9yaWdpbmFsRmF2b3JpdGU6IGJvb2xlYW47XG5cdG9yaWdpbmFsVGl0bGU6IFN0cmluZztcblx0b3JpZ2luYWxWaXNpYmxlOiBib29sZWFuO1xuXHRyZW1vdmU6IGJvb2xlYW47XG5cdHJlbmFtZTogYm9vbGVhbjtcblx0c2hhcmluZzogU3RyaW5nO1xuXHR0aXRsZTogU3RyaW5nO1xuXHR2aXNpYmxlOiBib29sZWFuO1xufTtcblxudHlwZSBWYXJpYW50SURzID0ge1xuXHRzUGFnZVZhcmlhbnRJZDogU3RyaW5nO1xuXHRzRmlsdGVyQmFyVmFyaWFudElkOiBTdHJpbmc7XG5cdHNUYWJsZVZhcmlhbnRJZDogU3RyaW5nO1xuXHRzQ2hhcnRWYXJpYW50SWQ6IFN0cmluZztcbn07XG5cbmNvbnN0IE5hdlR5cGUgPSBOYXZMaWJyYXJ5Lk5hdlR5cGUsXG5cdFZhcmlhbnRNYW5hZ2VtZW50VHlwZSA9IENvcmVMaWJyYXJ5LlZhcmlhbnRNYW5hZ2VtZW50LFxuXHRUZW1wbGF0ZUNvbnRlbnRWaWV3ID0gQ29yZUxpYnJhcnkuVGVtcGxhdGVDb250ZW50Vmlldyxcblx0SW5pdGlhbExvYWRNb2RlID0gQ29yZUxpYnJhcnkuSW5pdGlhbExvYWRNb2RlLFxuXHRDT05ESVRJT05fUEFUSF9UT19QUk9QRVJUWV9QQVRIX1JFR0VYID0gL1xcK3xcXCovZztcblxuY29uc3QgVmlld1N0YXRlT3ZlcnJpZGU6IGFueSA9IHtcblx0X2JTZWFyY2hUcmlnZ2VyZWQ6IGZhbHNlLFxuXHRhcHBseUluaXRpYWxTdGF0ZU9ubHk6IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSxcblx0b25CZWZvcmVTdGF0ZUFwcGxpZWQ6IGZ1bmN0aW9uICh0aGlzOiBWaWV3U3RhdGUgJiB0eXBlb2YgVmlld1N0YXRlT3ZlcnJpZGUsIGFQcm9taXNlczogYW55KSB7XG5cdFx0Y29uc3Qgb1ZpZXcgPSB0aGlzLmdldFZpZXcoKSxcblx0XHRcdG9Db250cm9sbGVyID0gb1ZpZXcuZ2V0Q29udHJvbGxlcigpIGFzIExpc3RSZXBvcnRDb250cm9sbGVyLFxuXHRcdFx0b0ZpbHRlckJhciA9IG9Db250cm9sbGVyLl9nZXRGaWx0ZXJCYXJDb250cm9sKCksXG5cdFx0XHRhVGFibGVzID0gb0NvbnRyb2xsZXIuX2dldENvbnRyb2xzKFwidGFibGVcIik7XG5cdFx0aWYgKG9GaWx0ZXJCYXIpIHtcblx0XHRcdG9GaWx0ZXJCYXIuc2V0U3VzcGVuZFNlbGVjdGlvbih0cnVlKTtcblx0XHRcdGFQcm9taXNlcy5wdXNoKChvRmlsdGVyQmFyIGFzIGFueSkud2FpdEZvckluaXRpYWxpemF0aW9uKCkpO1xuXHRcdH1cblx0XHRhVGFibGVzLmZvckVhY2goZnVuY3Rpb24gKG9UYWJsZTogYW55KSB7XG5cdFx0XHRhUHJvbWlzZXMucHVzaChvVGFibGUuaW5pdGlhbGl6ZWQoKSk7XG5cdFx0fSk7XG5cblx0XHRkZWxldGUgdGhpcy5fYlNlYXJjaFRyaWdnZXJlZDtcblx0fSxcblx0b25BZnRlclN0YXRlQXBwbGllZDogZnVuY3Rpb24gKHRoaXM6IFZpZXdTdGF0ZSkge1xuXHRcdGNvbnN0IG9Db250cm9sbGVyID0gdGhpcy5nZXRWaWV3KCkuZ2V0Q29udHJvbGxlcigpIGFzIExpc3RSZXBvcnRDb250cm9sbGVyO1xuXHRcdGNvbnN0IG9GaWx0ZXJCYXIgPSBvQ29udHJvbGxlci5fZ2V0RmlsdGVyQmFyQ29udHJvbCgpO1xuXHRcdGlmIChvRmlsdGVyQmFyKSB7XG5cdFx0XHRvRmlsdGVyQmFyLnNldFN1c3BlbmRTZWxlY3Rpb24oZmFsc2UpO1xuXHRcdH0gZWxzZSBpZiAob0NvbnRyb2xsZXIuX2lzRmlsdGVyQmFySGlkZGVuKCkpIHtcblx0XHRcdGNvbnN0IG9JbnRlcm5hbE1vZGVsQ29udGV4dCA9IG9Db250cm9sbGVyLmdldFZpZXcoKS5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpIGFzIEludGVybmFsTW9kZWxDb250ZXh0O1xuXHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwiaGFzUGVuZGluZ0ZpbHRlcnNcIiwgZmFsc2UpO1xuXHRcdFx0aWYgKG9Db250cm9sbGVyLl9pc011bHRpTW9kZSgpKSB7XG5cdFx0XHRcdG9Db250cm9sbGVyLl9nZXRNdWx0aU1vZGVDb250cm9sKCkuc2V0Q291bnRzT3V0RGF0ZWQodHJ1ZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRhZGFwdEJpbmRpbmdSZWZyZXNoQ29udHJvbHM6IGZ1bmN0aW9uICh0aGlzOiBWaWV3U3RhdGUsIGFDb250cm9sczogYW55KSB7XG5cdFx0Y29uc3Qgb1ZpZXcgPSB0aGlzLmdldFZpZXcoKSxcblx0XHRcdG9Db250cm9sbGVyID0gb1ZpZXcuZ2V0Q29udHJvbGxlcigpIGFzIExpc3RSZXBvcnRDb250cm9sbGVyLFxuXHRcdFx0YVZpZXdDb250cm9scyA9IG9Db250cm9sbGVyLl9nZXRDb250cm9scygpLFxuXHRcdFx0YUNvbnRyb2xzVG9SZWZyZXNoID0gS2VlcEFsaXZlSGVscGVyLmdldENvbnRyb2xzRm9yUmVmcmVzaChvVmlldywgYVZpZXdDb250cm9scyk7XG5cblx0XHRBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseShhQ29udHJvbHMsIGFDb250cm9sc1RvUmVmcmVzaCk7XG5cdH0sXG5cdGFkYXB0U3RhdGVDb250cm9sczogZnVuY3Rpb24gKHRoaXM6IFZpZXdTdGF0ZSAmIHR5cGVvZiBWaWV3U3RhdGVPdmVycmlkZSwgYVN0YXRlQ29udHJvbHM6IGFueSkge1xuXHRcdGNvbnN0IG9WaWV3ID0gdGhpcy5nZXRWaWV3KCksXG5cdFx0XHRvQ29udHJvbGxlciA9IG9WaWV3LmdldENvbnRyb2xsZXIoKSBhcyBMaXN0UmVwb3J0Q29udHJvbGxlcixcblx0XHRcdG9WaWV3RGF0YSA9IG9WaWV3LmdldFZpZXdEYXRhKCksXG5cdFx0XHRiQ29udHJvbFZNID0gb1ZpZXdEYXRhLnZhcmlhbnRNYW5hZ2VtZW50ID09PSBWYXJpYW50TWFuYWdlbWVudFR5cGUuQ29udHJvbDtcblxuXHRcdGNvbnN0IG9GaWx0ZXJCYXJWTSA9IHRoaXMuX2dldEZpbHRlckJhclZNKG9WaWV3KTtcblx0XHRpZiAob0ZpbHRlckJhclZNKSB7XG5cdFx0XHRhU3RhdGVDb250cm9scy5wdXNoKG9GaWx0ZXJCYXJWTSk7XG5cdFx0fVxuXHRcdGlmIChvQ29udHJvbGxlci5faXNNdWx0aU1vZGUoKSkge1xuXHRcdFx0YVN0YXRlQ29udHJvbHMucHVzaChvQ29udHJvbGxlci5fZ2V0TXVsdGlNb2RlQ29udHJvbCgpKTtcblx0XHR9XG5cdFx0b0NvbnRyb2xsZXIuX2dldENvbnRyb2xzKFwidGFibGVcIikuZm9yRWFjaChmdW5jdGlvbiAob1RhYmxlOiBhbnkpIHtcblx0XHRcdGNvbnN0IG9RdWlja0ZpbHRlciA9IG9UYWJsZS5nZXRRdWlja0ZpbHRlcigpO1xuXHRcdFx0aWYgKG9RdWlja0ZpbHRlcikge1xuXHRcdFx0XHRhU3RhdGVDb250cm9scy5wdXNoKG9RdWlja0ZpbHRlcik7XG5cdFx0XHR9XG5cdFx0XHRpZiAoYkNvbnRyb2xWTSkge1xuXHRcdFx0XHRhU3RhdGVDb250cm9scy5wdXNoKG9UYWJsZS5nZXRWYXJpYW50KCkpO1xuXHRcdFx0fVxuXHRcdFx0YVN0YXRlQ29udHJvbHMucHVzaChvVGFibGUpO1xuXHRcdH0pO1xuXHRcdGlmIChvQ29udHJvbGxlci5fZ2V0Q29udHJvbHMoXCJDaGFydFwiKSkge1xuXHRcdFx0b0NvbnRyb2xsZXIuX2dldENvbnRyb2xzKFwiQ2hhcnRcIikuZm9yRWFjaChmdW5jdGlvbiAob0NoYXJ0OiBhbnkpIHtcblx0XHRcdFx0aWYgKGJDb250cm9sVk0pIHtcblx0XHRcdFx0XHRhU3RhdGVDb250cm9scy5wdXNoKG9DaGFydC5nZXRWYXJpYW50KCkpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGFTdGF0ZUNvbnRyb2xzLnB1c2gob0NoYXJ0KTtcblx0XHRcdH0pO1xuXHRcdH1cblx0XHRpZiAob0NvbnRyb2xsZXIuX2hhc011bHRpVmlzdWFsaXphdGlvbnMoKSkge1xuXHRcdFx0YVN0YXRlQ29udHJvbHMucHVzaChvQ29udHJvbGxlci5fZ2V0U2VnbWVudGVkQnV0dG9uKFRlbXBsYXRlQ29udGVudFZpZXcuQ2hhcnQpKTtcblx0XHRcdGFTdGF0ZUNvbnRyb2xzLnB1c2gob0NvbnRyb2xsZXIuX2dldFNlZ21lbnRlZEJ1dHRvbihUZW1wbGF0ZUNvbnRlbnRWaWV3LlRhYmxlKSk7XG5cdFx0fVxuXHRcdGNvbnN0IG9GaWx0ZXJCYXIgPSBvQ29udHJvbGxlci5fZ2V0RmlsdGVyQmFyQ29udHJvbCgpO1xuXHRcdGlmIChvRmlsdGVyQmFyKSB7XG5cdFx0XHRhU3RhdGVDb250cm9scy5wdXNoKG9GaWx0ZXJCYXIpO1xuXHRcdH1cblx0XHRhU3RhdGVDb250cm9scy5wdXNoKG9WaWV3LmJ5SWQoXCJmZTo6TGlzdFJlcG9ydFwiKSk7XG5cdH0sXG5cdHJldHJpZXZlQWRkaXRpb25hbFN0YXRlczogZnVuY3Rpb24gKHRoaXM6IFZpZXdTdGF0ZSAmIHR5cGVvZiBWaWV3U3RhdGVPdmVycmlkZSwgbUFkZGl0aW9uYWxTdGF0ZXM6IGFueSkge1xuXHRcdGNvbnN0IG9WaWV3ID0gdGhpcy5nZXRWaWV3KCksXG5cdFx0XHRvQ29udHJvbGxlciA9IG9WaWV3LmdldENvbnRyb2xsZXIoKSBhcyBMaXN0UmVwb3J0Q29udHJvbGxlcixcblx0XHRcdGJQZW5kaW5nRmlsdGVyID0gKG9WaWV3LmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIikgYXMgSW50ZXJuYWxNb2RlbENvbnRleHQpLmdldFByb3BlcnR5KFwiaGFzUGVuZGluZ0ZpbHRlcnNcIik7XG5cblx0XHRtQWRkaXRpb25hbFN0YXRlcy5kYXRhTG9hZGVkID0gIWJQZW5kaW5nRmlsdGVyIHx8ICEhdGhpcy5fYlNlYXJjaFRyaWdnZXJlZDtcblx0XHRpZiAob0NvbnRyb2xsZXIuX2hhc011bHRpVmlzdWFsaXphdGlvbnMoKSkge1xuXHRcdFx0Y29uc3Qgc0FscENvbnRlbnRWaWV3ID0gb1ZpZXcuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKS5nZXRQcm9wZXJ0eShcImFscENvbnRlbnRWaWV3XCIpO1xuXHRcdFx0bUFkZGl0aW9uYWxTdGF0ZXMuYWxwQ29udGVudFZpZXcgPSBzQWxwQ29udGVudFZpZXc7XG5cdFx0fVxuXG5cdFx0ZGVsZXRlIHRoaXMuX2JTZWFyY2hUcmlnZ2VyZWQ7XG5cdH0sXG5cdGFwcGx5QWRkaXRpb25hbFN0YXRlczogZnVuY3Rpb24gKHRoaXM6IFZpZXdTdGF0ZSAmIHR5cGVvZiBWaWV3U3RhdGVPdmVycmlkZSwgb0FkZGl0aW9uYWxTdGF0ZXM6IGFueSkge1xuXHRcdGNvbnN0IG9WaWV3ID0gdGhpcy5nZXRWaWV3KCksXG5cdFx0XHRvQ29udHJvbGxlciA9IG9WaWV3LmdldENvbnRyb2xsZXIoKSBhcyBMaXN0UmVwb3J0Q29udHJvbGxlcixcblx0XHRcdG9GaWx0ZXJCYXIgPSBvQ29udHJvbGxlci5fZ2V0RmlsdGVyQmFyQ29udHJvbCgpO1xuXG5cdFx0aWYgKG9BZGRpdGlvbmFsU3RhdGVzKSB7XG5cdFx0XHQvLyBleHBsaWNpdCBjaGVjayBmb3IgYm9vbGVhbiB2YWx1ZXMgLSAndW5kZWZpbmVkJyBzaG91bGQgbm90IGFsdGVyIHRoZSB0cmlnZ2VyZWQgc2VhcmNoIHByb3BlcnR5XG5cdFx0XHRpZiAob0FkZGl0aW9uYWxTdGF0ZXMuZGF0YUxvYWRlZCA9PT0gZmFsc2UgJiYgb0ZpbHRlckJhcikge1xuXHRcdFx0XHQvLyB3aXRob3V0IHRoaXMsIHRoZSBkYXRhIGlzIGxvYWRlZCBvbiBuYXZpZ2F0aW5nIGJhY2tcblx0XHRcdFx0KG9GaWx0ZXJCYXIgYXMgYW55KS5fYlNlYXJjaFRyaWdnZXJlZCA9IGZhbHNlO1xuXHRcdFx0fSBlbHNlIGlmIChvQWRkaXRpb25hbFN0YXRlcy5kYXRhTG9hZGVkID09PSB0cnVlKSB7XG5cdFx0XHRcdGlmIChvRmlsdGVyQmFyKSB7XG5cdFx0XHRcdFx0b0ZpbHRlckJhci50cmlnZ2VyU2VhcmNoKCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5fYlNlYXJjaFRyaWdnZXJlZCA9IHRydWU7XG5cdFx0XHR9XG5cdFx0XHRpZiAob0NvbnRyb2xsZXIuX2hhc011bHRpVmlzdWFsaXphdGlvbnMoKSkge1xuXHRcdFx0XHRjb25zdCBvSW50ZXJuYWxNb2RlbENvbnRleHQgPSBvVmlldy5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpIGFzIEludGVybmFsTW9kZWxDb250ZXh0O1xuXHRcdFx0XHRpZiAoIXN5c3RlbS5kZXNrdG9wICYmIG9BZGRpdGlvbmFsU3RhdGVzLmFscENvbnRlbnRWaWV3ID09IFRlbXBsYXRlQ29udGVudFZpZXcuSHlicmlkKSB7XG5cdFx0XHRcdFx0b0FkZGl0aW9uYWxTdGF0ZXMuYWxwQ29udGVudFZpZXcgPSBUZW1wbGF0ZUNvbnRlbnRWaWV3LkNoYXJ0O1xuXHRcdFx0XHR9XG5cdFx0XHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dFxuXHRcdFx0XHRcdC5nZXRNb2RlbCgpXG5cdFx0XHRcdFx0LnNldFByb3BlcnR5KGAke29JbnRlcm5hbE1vZGVsQ29udGV4dC5nZXRQYXRoKCl9L2FscENvbnRlbnRWaWV3YCwgb0FkZGl0aW9uYWxTdGF0ZXMuYWxwQ29udGVudFZpZXcpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0X2FwcGx5TmF2aWdhdGlvblBhcmFtZXRlcnNUb0ZpbHRlcmJhcjogZnVuY3Rpb24gKHRoaXM6IFZpZXdTdGF0ZSAmIHR5cGVvZiBWaWV3U3RhdGVPdmVycmlkZSwgb05hdmlnYXRpb25QYXJhbWV0ZXI6IGFueSwgYVJlc3VsdHM6IGFueSkge1xuXHRcdGNvbnN0IG9WaWV3ID0gdGhpcy5nZXRWaWV3KCk7XG5cdFx0Y29uc3Qgb0NvbnRyb2xsZXIgPSBvVmlldy5nZXRDb250cm9sbGVyKCkgYXMgTGlzdFJlcG9ydENvbnRyb2xsZXI7XG5cdFx0Y29uc3Qgb0FwcENvbXBvbmVudCA9IG9Db250cm9sbGVyLmdldEFwcENvbXBvbmVudCgpO1xuXHRcdGNvbnN0IG9Db21wb25lbnREYXRhID0gb0FwcENvbXBvbmVudC5nZXRDb21wb25lbnREYXRhKCk7XG5cdFx0Y29uc3Qgb1N0YXJ0dXBQYXJhbWV0ZXJzID0gKG9Db21wb25lbnREYXRhICYmIG9Db21wb25lbnREYXRhLnN0YXJ0dXBQYXJhbWV0ZXJzKSB8fCB7fTtcblx0XHRjb25zdCBvVmFyaWFudFByb21pc2UgPSB0aGlzLmhhbmRsZVZhcmlhbnRJZFBhc3NlZFZpYVVSTFBhcmFtcyhvU3RhcnR1cFBhcmFtZXRlcnMpO1xuXHRcdGxldCBiRmlsdGVyVmFyaWFudEFwcGxpZWQ6IGJvb2xlYW47XG5cdFx0YVJlc3VsdHMucHVzaChcblx0XHRcdG9WYXJpYW50UHJvbWlzZVxuXHRcdFx0XHQudGhlbigoYVZhcmlhbnRzOiBhbnlbXSkgPT4ge1xuXHRcdFx0XHRcdGlmIChhVmFyaWFudHMgJiYgYVZhcmlhbnRzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRcdGlmIChhVmFyaWFudHNbMF0gPT09IHRydWUgfHwgYVZhcmlhbnRzWzFdID09PSB0cnVlKSB7XG5cdFx0XHRcdFx0XHRcdGJGaWx0ZXJWYXJpYW50QXBwbGllZCA9IHRydWU7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiB0aGlzLl9hcHBseVNlbGVjdGlvblZhcmlhbnQob1ZpZXcsIG9OYXZpZ2F0aW9uUGFyYW1ldGVyLCBiRmlsdGVyVmFyaWFudEFwcGxpZWQpO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQudGhlbigoKSA9PiB7XG5cdFx0XHRcdFx0Y29uc3Qgb0R5bmFtaWNQYWdlID0gb0NvbnRyb2xsZXIuX2dldER5bmFtaWNMaXN0UmVwb3J0Q29udHJvbCgpO1xuXHRcdFx0XHRcdGxldCBiUHJldmVudEluaXRpYWxTZWFyY2ggPSBmYWxzZTtcblx0XHRcdFx0XHRjb25zdCBvRmlsdGVyQmFyVk0gPSB0aGlzLl9nZXRGaWx0ZXJCYXJWTShvVmlldyk7XG5cdFx0XHRcdFx0Y29uc3Qgb0ZpbHRlckJhckNvbnRyb2wgPSBvQ29udHJvbGxlci5fZ2V0RmlsdGVyQmFyQ29udHJvbCgpO1xuXHRcdFx0XHRcdGlmIChvRmlsdGVyQmFyQ29udHJvbCkge1xuXHRcdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0XHQob05hdmlnYXRpb25QYXJhbWV0ZXIubmF2aWdhdGlvblR5cGUgIT09IE5hdlR5cGUuaW5pdGlhbCAmJiBvTmF2aWdhdGlvblBhcmFtZXRlci5yZXF1aXJlc1N0YW5kYXJkVmFyaWFudCkgfHxcblx0XHRcdFx0XHRcdFx0KCFvRmlsdGVyQmFyVk0gJiYgb1ZpZXcuZ2V0Vmlld0RhdGEoKS5pbml0aWFsTG9hZCA9PT0gSW5pdGlhbExvYWRNb2RlLkVuYWJsZWQpIHx8XG5cdFx0XHRcdFx0XHRcdG9Db250cm9sbGVyLl9zaG91bGRBdXRvVHJpZ2dlclNlYXJjaChvRmlsdGVyQmFyVk0pXG5cdFx0XHRcdFx0XHQpIHtcblx0XHRcdFx0XHRcdFx0b0ZpbHRlckJhckNvbnRyb2wudHJpZ2dlclNlYXJjaCgpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0YlByZXZlbnRJbml0aWFsU2VhcmNoID0gdGhpcy5fcHJldmVudEluaXRpYWxTZWFyY2gob0ZpbHRlckJhclZNKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdC8vIHJlc2V0IHRoZSBzdXNwZW5kIHNlbGVjdGlvbiBvbiBmaWx0ZXIgYmFyIHRvIGFsbG93IGxvYWRpbmcgb2YgZGF0YSB3aGVuIG5lZWRlZCAod2FzIHNldCBvbiBMUiBJbml0KVxuXHRcdFx0XHRcdFx0b0ZpbHRlckJhckNvbnRyb2wuc2V0U3VzcGVuZFNlbGVjdGlvbihmYWxzZSk7XG5cdFx0XHRcdFx0XHR0aGlzLl9iU2VhcmNoVHJpZ2dlcmVkID0gIWJQcmV2ZW50SW5pdGlhbFNlYXJjaDtcblx0XHRcdFx0XHRcdG9EeW5hbWljUGFnZS5zZXRIZWFkZXJFeHBhbmRlZChzeXN0ZW0uZGVza3RvcCB8fCBiUHJldmVudEluaXRpYWxTZWFyY2gpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSlcblx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRMb2cuZXJyb3IoXCJWYXJpYW50IElEIGNhbm5vdCBiZSBhcHBsaWVkXCIpO1xuXHRcdFx0XHR9KVxuXHRcdCk7XG5cdH0sXG5cblx0aGFuZGxlVmFyaWFudElkUGFzc2VkVmlhVVJMUGFyYW1zOiBmdW5jdGlvbiAodGhpczogVmlld1N0YXRlICYgdHlwZW9mIFZpZXdTdGF0ZU92ZXJyaWRlLCBvVXJsUGFyYW1zOiBhbnkpIHtcblx0XHRjb25zdCBhUGFnZVZhcmlhbnRJZCA9IG9VcmxQYXJhbXNbXCJzYXAtdWktZmUtdmFyaWFudC1pZFwiXSxcblx0XHRcdGFGaWx0ZXJCYXJWYXJpYW50SWQgPSBvVXJsUGFyYW1zW1wic2FwLXVpLWZlLWZpbHRlcmJhci12YXJpYW50LWlkXCJdLFxuXHRcdFx0YVRhYmxlVmFyaWFudElkID0gb1VybFBhcmFtc1tcInNhcC11aS1mZS10YWJsZS12YXJpYW50LWlkXCJdLFxuXHRcdFx0YUNoYXJ0VmFyaWFudElkID0gb1VybFBhcmFtc1tcInNhcC11aS1mZS1jaGFydC12YXJpYW50LWlkXCJdO1xuXHRcdGxldCBvVmFyaWFudElEcztcblx0XHRpZiAoYVBhZ2VWYXJpYW50SWQgfHwgYUZpbHRlckJhclZhcmlhbnRJZCB8fCBhVGFibGVWYXJpYW50SWQgfHwgYUNoYXJ0VmFyaWFudElkKSB7XG5cdFx0XHRvVmFyaWFudElEcyA9IHtcblx0XHRcdFx0c1BhZ2VWYXJpYW50SWQ6IGFQYWdlVmFyaWFudElkICYmIGFQYWdlVmFyaWFudElkWzBdLFxuXHRcdFx0XHRzRmlsdGVyQmFyVmFyaWFudElkOiBhRmlsdGVyQmFyVmFyaWFudElkICYmIGFGaWx0ZXJCYXJWYXJpYW50SWRbMF0sXG5cdFx0XHRcdHNUYWJsZVZhcmlhbnRJZDogYVRhYmxlVmFyaWFudElkICYmIGFUYWJsZVZhcmlhbnRJZFswXSxcblx0XHRcdFx0c0NoYXJ0VmFyaWFudElkOiBhQ2hhcnRWYXJpYW50SWQgJiYgYUNoYXJ0VmFyaWFudElkWzBdXG5cdFx0XHR9O1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5faGFuZGxlQ29udHJvbFZhcmlhbnRJZChvVmFyaWFudElEcyk7XG5cdH0sXG5cblx0X2hhbmRsZUNvbnRyb2xWYXJpYW50SWQ6IGZ1bmN0aW9uICh0aGlzOiBWaWV3U3RhdGUgJiB0eXBlb2YgVmlld1N0YXRlT3ZlcnJpZGUsIG9WYXJpYW50SURzOiBWYXJpYW50SURzKSB7XG5cdFx0bGV0IG9WTTogVmFyaWFudE1hbmFnZW1lbnQ7XG5cdFx0Y29uc3Qgb1ZpZXcgPSB0aGlzLmdldFZpZXcoKSxcblx0XHRcdGFQcm9taXNlczogVmFyaWFudE1hbmFnZW1lbnRbXSA9IFtdO1xuXHRcdGNvbnN0IHNWYXJpYW50TWFuYWdlbWVudCA9IG9WaWV3LmdldFZpZXdEYXRhKCkudmFyaWFudE1hbmFnZW1lbnQ7XG5cdFx0aWYgKG9WYXJpYW50SURzICYmIG9WYXJpYW50SURzLnNQYWdlVmFyaWFudElkICYmIHNWYXJpYW50TWFuYWdlbWVudCA9PT0gXCJQYWdlXCIpIHtcblx0XHRcdG9WTSA9IG9WaWV3LmJ5SWQoXCJmZTo6UGFnZVZhcmlhbnRNYW5hZ2VtZW50XCIpO1xuXHRcdFx0dGhpcy5faGFuZGxlUGFnZVZhcmlhbnRJZChvVmFyaWFudElEcywgb1ZNLCBhUHJvbWlzZXMpO1xuXHRcdH0gZWxzZSBpZiAob1ZhcmlhbnRJRHMgJiYgc1ZhcmlhbnRNYW5hZ2VtZW50ID09PSBcIkNvbnRyb2xcIikge1xuXHRcdFx0aWYgKG9WYXJpYW50SURzLnNGaWx0ZXJCYXJWYXJpYW50SWQpIHtcblx0XHRcdFx0b1ZNID0gb1ZpZXcuZ2V0Q29udHJvbGxlcigpLl9nZXRGaWx0ZXJCYXJWYXJpYW50Q29udHJvbCgpO1xuXHRcdFx0XHR0aGlzLl9oYW5kbGVGaWx0ZXJCYXJWYXJpYW50Q29udHJvbElkKG9WYXJpYW50SURzLCBvVk0sIGFQcm9taXNlcyk7XG5cdFx0XHR9XG5cdFx0XHRpZiAob1ZhcmlhbnRJRHMuc1RhYmxlVmFyaWFudElkKSB7XG5cdFx0XHRcdGNvbnN0IG9Db250cm9sbGVyID0gb1ZpZXcuZ2V0Q29udHJvbGxlcigpIGFzIExpc3RSZXBvcnRDb250cm9sbGVyO1xuXHRcdFx0XHR0aGlzLl9oYW5kbGVUYWJsZUNvbnRyb2xWYXJpYW50SWQob1ZhcmlhbnRJRHMsIG9Db250cm9sbGVyLCBhUHJvbWlzZXMpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAob1ZhcmlhbnRJRHMuc0NoYXJ0VmFyaWFudElkKSB7XG5cdFx0XHRcdGNvbnN0IG9Db250cm9sbGVyID0gb1ZpZXcuZ2V0Q29udHJvbGxlcigpIGFzIExpc3RSZXBvcnRDb250cm9sbGVyO1xuXHRcdFx0XHR0aGlzLl9oYW5kbGVDaGFydENvbnRyb2xWYXJpYW50SWQob1ZhcmlhbnRJRHMsIG9Db250cm9sbGVyLCBhUHJvbWlzZXMpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gUHJvbWlzZS5hbGwoYVByb21pc2VzKTtcblx0fSxcblx0Lypcblx0ICogSGFuZGxlcyBwYWdlIGxldmVsIHZhcmlhbnQgYW5kIHBhc3NlcyB0aGUgdmFyaWFudCB0byB0aGUgZnVuY3Rpb24gdGhhdCBwdXNoZXMgdGhlIHByb21pc2UgdG8gdGhlIHByb21pc2UgYXJyYXlcblx0ICpcblx0ICogQHBhcmFtIG9WYXJpbmF0SURzIGNvbnRhaW5zIGFuIG9iamVjdCBvZiBhbGwgdmFyaWFudCBJRHNcblx0ICogQHBhcmFtIG9WTSBjb250YWlucyB0aGUgdmFpcmFudCBtYW5hZ2VtZW50IG9iamVjdCBmb3IgdGhlIHBhZ2UgdmFyaWFudFxuXHQgKiBAcGFyYW0gYVByb21pc2VzIGlzIGFuIGFycmF5IG9mIGFsbCBwcm9taXNlc1xuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X2hhbmRsZVBhZ2VWYXJpYW50SWQ6IGZ1bmN0aW9uIChcblx0XHR0aGlzOiBWaWV3U3RhdGUgJiB0eXBlb2YgVmlld1N0YXRlT3ZlcnJpZGUsXG5cdFx0b1ZhcmlhbnRJRHM6IFZhcmlhbnRJRHMsXG5cdFx0b1ZNOiBWYXJpYW50TWFuYWdlbWVudCxcblx0XHRhUHJvbWlzZXM6IFZhcmlhbnRNYW5hZ2VtZW50W11cblx0KSB7XG5cdFx0b1ZNLmdldFZhcmlhbnRzKCkuZm9yRWFjaCgob1ZhcmlhbnQ6IFZhcmlhbnRPYmplY3QpID0+IHtcblx0XHRcdHRoaXMuX2ZpbmRBbmRQdXNoVmFyaWFudFRvUHJvbWlzZShvVmFyaWFudCwgb1ZhcmlhbnRJRHMuc1BhZ2VWYXJpYW50SWQsIG9WTSwgYVByb21pc2VzLCB0cnVlKTtcblx0XHR9KTtcblx0fSxcblxuXHQvKlxuXHQgKiBIYW5kbGVzIGNvbnRyb2wgbGV2ZWwgdmFyaWFudCBmb3IgZmlsdGVyIGJhciBhbmQgcGFzc2VzIHRoZSB2YXJpYW50IHRvIHRoZSBmdW5jdGlvbiB0aGF0IHB1c2hlcyB0aGUgcHJvbWlzZSB0byB0aGUgcHJvbWlzZSBhcnJheVxuXHQgKlxuXHQgKiBAcGFyYW0gb1ZhcmluYXRJRHMgY29udGFpbnMgYW4gb2JqZWN0IG9mIGFsbCB2YXJpYW50IElEc1xuXHQgKiBAcGFyYW0gb1ZNIGNvbnRhaW5zIHRoZSB2YWlyYW50IG1hbmFnZW1lbnQgb2JqZWN0IGZvciB0aGUgZmlsdGVyIGJhclxuXHQgKiBAcGFyYW0gYVByb21pc2VzIGlzIGFuIGFycmF5IG9mIGFsbCBwcm9taXNlc1xuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblxuXHRfaGFuZGxlRmlsdGVyQmFyVmFyaWFudENvbnRyb2xJZDogZnVuY3Rpb24gKFxuXHRcdHRoaXM6IFZpZXdTdGF0ZSAmIHR5cGVvZiBWaWV3U3RhdGVPdmVycmlkZSxcblx0XHRvVmFyaWFudElEczogVmFyaWFudElEcyxcblx0XHRvVk06IFZhcmlhbnRNYW5hZ2VtZW50LFxuXHRcdGFQcm9taXNlczogVmFyaWFudE1hbmFnZW1lbnRbXVxuXHQpIHtcblx0XHRpZiAob1ZNKSB7XG5cdFx0XHRvVk0uZ2V0VmFyaWFudHMoKS5mb3JFYWNoKChvVmFyaWFudDogVmFyaWFudE9iamVjdCkgPT4ge1xuXHRcdFx0XHR0aGlzLl9maW5kQW5kUHVzaFZhcmlhbnRUb1Byb21pc2Uob1ZhcmlhbnQsIG9WYXJpYW50SURzLnNGaWx0ZXJCYXJWYXJpYW50SWQsIG9WTSwgYVByb21pc2VzLCB0cnVlKTtcblx0XHRcdH0pO1xuXHRcdH1cblx0fSxcblxuXHQvKlxuXHQgKiBIYW5kbGVzIGNvbnRyb2wgbGV2ZWwgdmFyaWFudCBmb3IgdGFibGUgYW5kIHBhc3NlcyB0aGUgdmFyaWFudCB0byB0aGUgZnVuY3Rpb24gdGhhdCBwdXNoZXMgdGhlIHByb21pc2UgdG8gdGhlIHByb21pc2UgYXJyYXlcblx0ICpcblx0ICogQHBhcmFtIG9WYXJpbmF0SURzIGNvbnRhaW5zIGFuIG9iamVjdCBvZiBhbGwgdmFyaWFudCBJRHNcblx0ICogQHBhcmFtIG9Db250cm9sbGVyIGhhcyB0aGUgbGlzdCByZXBvcnQgY29udHJvbGxlciBvYmplY3Rcblx0ICogQHBhcmFtIGFQcm9taXNlcyBpcyBhbiBhcnJheSBvZiBhbGwgcHJvbWlzZXNcblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9oYW5kbGVUYWJsZUNvbnRyb2xWYXJpYW50SWQ6IGZ1bmN0aW9uIChcblx0XHR0aGlzOiBWaWV3U3RhdGUgJiB0eXBlb2YgVmlld1N0YXRlT3ZlcnJpZGUsXG5cdFx0b1ZhcmlhbnRJRHM6IFZhcmlhbnRJRHMsXG5cdFx0b0NvbnRyb2xsZXI6IExpc3RSZXBvcnRDb250cm9sbGVyLFxuXHRcdGFQcm9taXNlczogVmFyaWFudE1hbmFnZW1lbnRbXVxuXHQpIHtcblx0XHRjb25zdCBhVGFibGVzID0gb0NvbnRyb2xsZXIuX2dldENvbnRyb2xzKFwidGFibGVcIik7XG5cdFx0YVRhYmxlcy5mb3JFYWNoKChvVGFibGU6IFRhYmxlKSA9PiB7XG5cdFx0XHRjb25zdCBvVGFibGVWYXJpYW50ID0gb1RhYmxlLmdldFZhcmlhbnQoKTtcblx0XHRcdGlmIChvVGFibGUgJiYgb1RhYmxlVmFyaWFudCkge1xuXHRcdFx0XHRvVGFibGVWYXJpYW50LmdldFZhcmlhbnRzKCkuZm9yRWFjaCgob1ZhcmlhbnQ6IFZhcmlhbnRPYmplY3QpID0+IHtcblx0XHRcdFx0XHR0aGlzLl9maW5kQW5kUHVzaFZhcmlhbnRUb1Byb21pc2Uob1ZhcmlhbnQsIG9WYXJpYW50SURzLnNUYWJsZVZhcmlhbnRJZCwgb1RhYmxlVmFyaWFudCwgYVByb21pc2VzKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cblx0Lypcblx0ICogSGFuZGxlcyBjb250cm9sIGxldmVsIHZhcmlhbnQgZm9yIGNoYXJ0IGFuZCBwYXNzZXMgdGhlIHZhcmlhbnQgdG8gdGhlIGZ1bmN0aW9uIHRoYXQgcHVzaGVzIHRoZSBwcm9taXNlIHRvIHRoZSBwcm9taXNlIGFycmF5XG5cdCAqXG5cdCAqIEBwYXJhbSBvVmFyaW5hdElEcyBjb250YWlucyBhbiBvYmplY3Qgb2YgYWxsIHZhcmlhbnQgSURzXG5cdCAqIEBwYXJhbSBvQ29udHJvbGxlciBoYXMgdGhlIGxpc3QgcmVwb3J0IGNvbnRyb2xsZXIgb2JqZWN0XG5cdCAqIEBwYXJhbSBhUHJvbWlzZXMgaXMgYW4gYXJyYXkgb2YgYWxsIHByb21pc2VzXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfaGFuZGxlQ2hhcnRDb250cm9sVmFyaWFudElkOiBmdW5jdGlvbiAoXG5cdFx0dGhpczogVmlld1N0YXRlICYgdHlwZW9mIFZpZXdTdGF0ZU92ZXJyaWRlLFxuXHRcdG9WYXJpYW50SURzOiBWYXJpYW50SURzLFxuXHRcdG9Db250cm9sbGVyOiBMaXN0UmVwb3J0Q29udHJvbGxlcixcblx0XHRhUHJvbWlzZXM6IFZhcmlhbnRNYW5hZ2VtZW50W11cblx0KSB7XG5cdFx0Y29uc3QgYUNoYXJ0cyA9IG9Db250cm9sbGVyLl9nZXRDb250cm9scyhcIkNoYXJ0XCIpO1xuXHRcdGFDaGFydHMuZm9yRWFjaCgob0NoYXJ0OiBDaGFydCkgPT4ge1xuXHRcdFx0Y29uc3Qgb0NoYXJ0VmFyaWFudCA9IG9DaGFydC5nZXRWYXJpYW50KCk7XG5cdFx0XHRjb25zdCBhVmFyaWFudHMgPSBvQ2hhcnRWYXJpYW50LmdldFZhcmlhbnRzKCk7XG5cdFx0XHRpZiAoYVZhcmlhbnRzKSB7XG5cdFx0XHRcdGFWYXJpYW50cy5mb3JFYWNoKChvVmFyaWFudDogVmFyaWFudE9iamVjdCkgPT4ge1xuXHRcdFx0XHRcdHRoaXMuX2ZpbmRBbmRQdXNoVmFyaWFudFRvUHJvbWlzZShvVmFyaWFudCwgb1ZhcmlhbnRJRHMuc0NoYXJ0VmFyaWFudElkLCBvQ2hhcnRWYXJpYW50LCBhUHJvbWlzZXMpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSxcblx0Lypcblx0ICogTWF0Y2hlcyB0aGUgdmFyaWFudCBJRCBwcm92aWRlZCBpbiB0aGUgdXJsIHRvIHRoZSBhdmFpbGFibGUgdmFpcmFudCBJRHMgYW5kIHB1c2hlcyB0aGUgYXBwcm9wcmlhdGUgcHJvbWlzZSB0byB0aGUgcHJvbWlzZSBhcnJheVxuXHQgKlxuXHQgKiBAcGFyYW0gb1ZhcmlhbnQgaXMgYW4gb2JqZWN0IGZvciBhIHNwZWNpZmljIHZhcmlhbnRcblx0ICogQHBhcmFtIHNWYXJpYW50SWQgaXMgdGhlIHZhcmlhbnQgSUQgcHJvdmlkZWQgaW4gdGhlIHVybFxuXHQgKiBAcGFyYW0gb1ZNIGlzIHRoZSB2YXJpYW50IG1hbmFnZW1lbnQgb2JqZWN0IGZvciB0aGUgc3BlY2ZpYyB2YXJpYW50XG5cdCAqIEBwYXJhbSBhUHJvbWlzZXMgaXMgYW4gYXJyYXkgb2YgcHJvbWlzZXNcblx0ICogQHBhcmFtIGJGaWx0ZXJWYXJpYW50QXBwbGllZCBpcyBhbiBvcHRpb25hbCBwYXJhbWV0ZXIgd2hpY2ggaXMgc2V0IHRvIHR1cmUgaW4gY2FzZSB0aGUgZmlsdGVyIHZhcmlhbnQgaXMgYXBwbGllZFxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X2ZpbmRBbmRQdXNoVmFyaWFudFRvUHJvbWlzZTogZnVuY3Rpb24gKFxuXHRcdC8vVGhpcyBmdW5jdGlvbiBmaW5kcyB0aGUgc3VpdGFibGUgdmFyaWFudCBmb3IgdGhlIHZhcmlhbnRJRCBwcm92aWRlZCBpbiB0aGUgdXJsIGFuZCBwdXNoZXMgdGhlbSB0byB0aGUgcHJvbWlzZSBhcnJheVxuXHRcdHRoaXM6IFZpZXdTdGF0ZSAmIHR5cGVvZiBWaWV3U3RhdGVPdmVycmlkZSxcblx0XHRvVmFyaWFudDogVmFyaWFudE9iamVjdCxcblx0XHRzVmFyaWFudElkOiBTdHJpbmcsXG5cdFx0b1ZNOiBWYXJpYW50TWFuYWdlbWVudCxcblx0XHRhUHJvbWlzZXM6IFZhcmlhbnRNYW5hZ2VtZW50W10sXG5cdFx0YkZpbHRlclZhcmlhbnRBcHBsaWVkPzogYm9vbGVhblxuXHQpIHtcblx0XHRpZiAob1ZhcmlhbnQua2V5ID09PSBzVmFyaWFudElkKSB7XG5cdFx0XHRhUHJvbWlzZXMucHVzaCh0aGlzLl9hcHBseUNvbnRyb2xWYXJpYW50KG9WTSwgc1ZhcmlhbnRJZCwgYkZpbHRlclZhcmlhbnRBcHBsaWVkKSk7XG5cdFx0fVxuXHR9LFxuXG5cdF9hcHBseUNvbnRyb2xWYXJpYW50OiBmdW5jdGlvbiAob1ZhcmlhbnQ6IGFueSwgc1ZhcmlhbnRJRDogYW55LCBiRmlsdGVyVmFyaWFudEFwcGxpZWQ6IGFueSkge1xuXHRcdGNvbnN0IHNWYXJpYW50UmVmZXJlbmNlID0gdGhpcy5fY2hlY2tJZlZhcmlhbnRJZElzQXZhaWxhYmxlKG9WYXJpYW50LCBzVmFyaWFudElEKSA/IHNWYXJpYW50SUQgOiBvVmFyaWFudC5nZXRTdGFuZGFyZFZhcmlhbnRLZXkoKTtcblx0XHRjb25zdCBvVk0gPSBDb250cm9sVmFyaWFudEFwcGx5QVBJLmFjdGl2YXRlVmFyaWFudCh7XG5cdFx0XHRlbGVtZW50OiBvVmFyaWFudCxcblx0XHRcdHZhcmlhbnRSZWZlcmVuY2U6IHNWYXJpYW50UmVmZXJlbmNlXG5cdFx0fSk7XG5cdFx0cmV0dXJuIG9WTS50aGVuKGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiBiRmlsdGVyVmFyaWFudEFwcGxpZWQ7XG5cdFx0fSk7XG5cdH0sXG5cdC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIHByaXZhdGUgaGVscGVyICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG5cdF9nZXRGaWx0ZXJCYXJWTTogZnVuY3Rpb24gKG9WaWV3OiBhbnkpIHtcblx0XHRjb25zdCBvVmlld0RhdGEgPSBvVmlldy5nZXRWaWV3RGF0YSgpO1xuXHRcdHN3aXRjaCAob1ZpZXdEYXRhLnZhcmlhbnRNYW5hZ2VtZW50KSB7XG5cdFx0XHRjYXNlIFZhcmlhbnRNYW5hZ2VtZW50VHlwZS5QYWdlOlxuXHRcdFx0XHRyZXR1cm4gb1ZpZXcuYnlJZChcImZlOjpQYWdlVmFyaWFudE1hbmFnZW1lbnRcIik7XG5cdFx0XHRjYXNlIFZhcmlhbnRNYW5hZ2VtZW50VHlwZS5Db250cm9sOlxuXHRcdFx0XHRyZXR1cm4gb1ZpZXcuZ2V0Q29udHJvbGxlcigpLl9nZXRGaWx0ZXJCYXJWYXJpYW50Q29udHJvbCgpO1xuXHRcdFx0Y2FzZSBWYXJpYW50TWFuYWdlbWVudFR5cGUuTm9uZTpcblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYHVuaGFuZGxlZCB2YXJpYW50IHNldHRpbmc6ICR7b1ZpZXdEYXRhLnZhcmlhbnRNYW5hZ2VtZW50fWApO1xuXHRcdH1cblx0fSxcblxuXHRfcHJldmVudEluaXRpYWxTZWFyY2g6IGZ1bmN0aW9uIChvVmFyaWFudE1hbmFnZW1lbnQ6IGFueSkge1xuXHRcdGlmICghb1ZhcmlhbnRNYW5hZ2VtZW50KSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdFx0Y29uc3QgYVZhcmlhbnRzID0gb1ZhcmlhbnRNYW5hZ2VtZW50LmdldFZhcmlhbnRzKCk7XG5cdFx0Y29uc3Qgb0N1cnJlbnRWYXJpYW50ID0gYVZhcmlhbnRzLmZpbmQoZnVuY3Rpb24gKG9JdGVtOiBhbnkpIHtcblx0XHRcdHJldHVybiBvSXRlbS5rZXkgPT09IG9WYXJpYW50TWFuYWdlbWVudC5nZXRDdXJyZW50VmFyaWFudEtleSgpO1xuXHRcdH0pO1xuXHRcdHJldHVybiAhb0N1cnJlbnRWYXJpYW50LmV4ZWN1dGVPblNlbGVjdDtcblx0fSxcblxuXHRfYXBwbHlTZWxlY3Rpb25WYXJpYW50OiBmdW5jdGlvbiAob1ZpZXc6IGFueSwgb05hdmlnYXRpb25QYXJhbWV0ZXI6IGFueSwgYkZpbHRlclZhcmlhbnRBcHBsaWVkOiBhbnkpIHtcblx0XHRjb25zdCBvRmlsdGVyQmFyID0gb1ZpZXcuZ2V0Q29udHJvbGxlcigpLl9nZXRGaWx0ZXJCYXJDb250cm9sKCksXG5cdFx0XHRvU2VsZWN0aW9uVmFyaWFudCA9IG9OYXZpZ2F0aW9uUGFyYW1ldGVyLnNlbGVjdGlvblZhcmlhbnQsXG5cdFx0XHRvU2VsZWN0aW9uVmFyaWFudERlZmF1bHRzID0gb05hdmlnYXRpb25QYXJhbWV0ZXIuc2VsZWN0aW9uVmFyaWFudERlZmF1bHRzO1xuXHRcdGlmICghb0ZpbHRlckJhciB8fCAhb1NlbGVjdGlvblZhcmlhbnQpIHtcblx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblx0XHR9XG5cdFx0bGV0IG9Db25kaXRpb25zID0ge307XG5cdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG9WaWV3LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCk7XG5cdFx0Y29uc3Qgb1ZpZXdEYXRhID0gb1ZpZXcuZ2V0Vmlld0RhdGEoKTtcblx0XHRjb25zdCBzQ29udGV4dFBhdGggPSBvVmlld0RhdGEuY29udGV4dFBhdGggfHwgYC8ke29WaWV3RGF0YS5lbnRpdHlTZXR9YDtcblx0XHRjb25zdCBhTWFuZGF0b3J5RmlsdGVyRmllbGRzID0gQ29tbW9uVXRpbHMuZ2V0TWFuZGF0b3J5RmlsdGVyRmllbGRzKG9NZXRhTW9kZWwsIHNDb250ZXh0UGF0aCk7XG5cdFx0Y29uc3QgYlVzZVNlbWFudGljRGF0ZVJhbmdlID0gb0ZpbHRlckJhci5kYXRhKFwidXNlU2VtYW50aWNEYXRlUmFuZ2VcIik7XG5cdFx0bGV0IG9WYXJpYW50O1xuXHRcdHN3aXRjaCAob1ZpZXdEYXRhLnZhcmlhbnRNYW5hZ2VtZW50KSB7XG5cdFx0XHRjYXNlIFZhcmlhbnRNYW5hZ2VtZW50VHlwZS5QYWdlOlxuXHRcdFx0XHRvVmFyaWFudCA9IG9WaWV3LmJ5SWQoXCJmZTo6UGFnZVZhcmlhbnRNYW5hZ2VtZW50XCIpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgVmFyaWFudE1hbmFnZW1lbnRUeXBlLkNvbnRyb2w6XG5cdFx0XHRcdG9WYXJpYW50ID0gb1ZpZXcuZ2V0Q29udHJvbGxlcigpLl9nZXRGaWx0ZXJCYXJWYXJpYW50Q29udHJvbCgpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgVmFyaWFudE1hbmFnZW1lbnRUeXBlLk5vbmU6XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdFx0Y29uc3QgYlJlcXVpcmVzU3RhbmRhcmRWYXJpYW50ID0gb05hdmlnYXRpb25QYXJhbWV0ZXIucmVxdWlyZXNTdGFuZGFyZFZhcmlhbnQ7XG5cdFx0Ly8gY2hlY2sgaWYgRkxQIGRlZmF1bHQgdmFsdWVzIGFyZSB0aGVyZSBhbmQgaXMgaXQgc3RhbmRhcmQgdmFyaWFudFxuXHRcdGNvbnN0IGJJc0ZMUFZhbHVlUHJlc2VudDogYm9vbGVhbiA9XG5cdFx0XHRvU2VsZWN0aW9uVmFyaWFudERlZmF1bHRzICYmXG5cdFx0XHRvU2VsZWN0aW9uVmFyaWFudERlZmF1bHRzLmdldFNlbGVjdE9wdGlvbnNQcm9wZXJ0eU5hbWVzKCkubGVuZ3RoID4gMCAmJlxuXHRcdFx0b1ZhcmlhbnQuZ2V0RGVmYXVsdFZhcmlhbnRLZXkoKSA9PT0gb1ZhcmlhbnQuZ2V0U3RhbmRhcmRWYXJpYW50S2V5KCkgJiZcblx0XHRcdG9OYXZpZ2F0aW9uUGFyYW1ldGVyLmJOYXZTZWxWYXJIYXNEZWZhdWx0c09ubHk7XG5cblx0XHQvLyBnZXQgY29uZGl0aW9ucyB3aGVuIEZMUCB2YWx1ZSBpcyBwcmVzZW50XG5cdFx0aWYgKGJGaWx0ZXJWYXJpYW50QXBwbGllZCB8fCBiSXNGTFBWYWx1ZVByZXNlbnQpIHtcblx0XHRcdG9Db25kaXRpb25zID0gb0ZpbHRlckJhci5nZXRDb25kaXRpb25zKCk7XG5cdFx0fVxuXHRcdENvbW1vblV0aWxzLmFkZERlZmF1bHREaXNwbGF5Q3VycmVuY3koYU1hbmRhdG9yeUZpbHRlckZpZWxkcywgb1NlbGVjdGlvblZhcmlhbnQsIG9TZWxlY3Rpb25WYXJpYW50RGVmYXVsdHMpO1xuXHRcdENvbW1vblV0aWxzLmFkZFNlbGVjdGlvblZhcmlhbnRUb0NvbmRpdGlvbnMoXG5cdFx0XHRvU2VsZWN0aW9uVmFyaWFudCxcblx0XHRcdG9Db25kaXRpb25zLFxuXHRcdFx0b01ldGFNb2RlbCxcblx0XHRcdHNDb250ZXh0UGF0aCxcblx0XHRcdGJJc0ZMUFZhbHVlUHJlc2VudCxcblx0XHRcdGJVc2VTZW1hbnRpY0RhdGVSYW5nZSxcblx0XHRcdG9WaWV3RGF0YVxuXHRcdCk7XG5cblx0XHRyZXR1cm4gdGhpcy5fYWN0aXZhdGVTZWxlY3Rpb25WYXJpYW50KFxuXHRcdFx0b0ZpbHRlckJhcixcblx0XHRcdG9Db25kaXRpb25zLFxuXHRcdFx0b1ZhcmlhbnQsXG5cdFx0XHRiUmVxdWlyZXNTdGFuZGFyZFZhcmlhbnQsXG5cdFx0XHRiRmlsdGVyVmFyaWFudEFwcGxpZWQsXG5cdFx0XHRiSXNGTFBWYWx1ZVByZXNlbnRcblx0XHQpO1xuXHR9LFxuXHRfYWN0aXZhdGVTZWxlY3Rpb25WYXJpYW50OiBmdW5jdGlvbiAoXG5cdFx0b0ZpbHRlckJhcjogYW55LFxuXHRcdG9Db25kaXRpb25zOiBhbnksXG5cdFx0b1ZhcmlhbnQ6IGFueSxcblx0XHRiUmVxdWlyZXNTdGFuZGFyZFZhcmlhbnQ6IGFueSxcblx0XHRiRmlsdGVyVmFyaWFudEFwcGxpZWQ6IGFueSxcblx0XHRiSXNGTFBWYWx1ZVByZXNlbnQ/OiBib29sZWFuXG5cdCkge1xuXHRcdGxldCBvUHJvbWlzZTtcblxuXHRcdGlmIChvVmFyaWFudCAmJiAhYkZpbHRlclZhcmlhbnRBcHBsaWVkKSB7XG5cdFx0XHRsZXQgb1ZhcmlhbnRLZXkgPSBiUmVxdWlyZXNTdGFuZGFyZFZhcmlhbnQgPyBvVmFyaWFudC5nZXRTdGFuZGFyZFZhcmlhbnRLZXkoKSA6IG9WYXJpYW50LmdldERlZmF1bHRWYXJpYW50S2V5KCk7XG5cdFx0XHRpZiAob1ZhcmlhbnRLZXkgPT09IG51bGwpIHtcblx0XHRcdFx0b1ZhcmlhbnRLZXkgPSBvVmFyaWFudC5nZXRJZCgpO1xuXHRcdFx0fVxuXHRcdFx0b1Byb21pc2UgPSBDb250cm9sVmFyaWFudEFwcGx5QVBJLmFjdGl2YXRlVmFyaWFudCh7XG5cdFx0XHRcdGVsZW1lbnQ6IG9WYXJpYW50LFxuXHRcdFx0XHR2YXJpYW50UmVmZXJlbmNlOiBvVmFyaWFudEtleVxuXHRcdFx0fSkudGhlbihmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHJldHVybiBiUmVxdWlyZXNTdGFuZGFyZFZhcmlhbnQgfHwgb1ZhcmlhbnQuZ2V0RGVmYXVsdFZhcmlhbnRLZXkoKSA9PT0gb1ZhcmlhbnQuZ2V0U3RhbmRhcmRWYXJpYW50S2V5KCk7XG5cdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0b1Byb21pc2UgPSBQcm9taXNlLnJlc29sdmUodHJ1ZSk7XG5cdFx0fVxuXHRcdHJldHVybiBvUHJvbWlzZS50aGVuKChiQ2xlYXJGaWx0ZXJBbmRSZXBsYWNlV2l0aEFwcFN0YXRlOiBhbnkpID0+IHtcblx0XHRcdGlmIChiQ2xlYXJGaWx0ZXJBbmRSZXBsYWNlV2l0aEFwcFN0YXRlKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLl9mbkFwcGx5Q29uZGl0aW9ucyhvRmlsdGVyQmFyLCBvQ29uZGl0aW9ucywgYklzRkxQVmFsdWVQcmVzZW50KTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSxcblxuXHQvKlxuXHQgKiBTZXRzIGZpbHRlcmVkOiBmYWxzZSBmbGFnIHRvIGV2ZXJ5IGZpZWxkIHNvIHRoYXQgaXQgY2FuIGJlIGNsZWFyZWQgb3V0XG5cdCAqXG5cdCAqIEBwYXJhbSBvRmlsdGVyQmFyIGZpbHRlcmJhciBjb250cm9sIGlzIHVzZWQgdG8gZGlzcGxheSBmaWx0ZXIgcHJvcGVydGllcyBpbiBhIHVzZXItZnJpZW5kbHkgbWFubmVyIHRvIHBvcHVsYXRlIHZhbHVlcyBmb3IgYSBxdWVyeVxuXHQgKiBAcmV0dXJucyBwcm9taXNlIHdoaWNoIHdpbGwgYmUgcmVzb2x2ZWQgdG8gb2JqZWN0XG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfZm5DbGVhclN0YXRlQmVmb3JleEFwcE5hdjogYXN5bmMgZnVuY3Rpb24gKG9GaWx0ZXJCYXI6IEZpbHRlckJhcikge1xuXHRcdHJldHVybiBhd2FpdCBTdGF0ZVV0aWwucmV0cmlldmVFeHRlcm5hbFN0YXRlKG9GaWx0ZXJCYXIpXG5cdFx0XHQudGhlbigob0V4dGVybmFsU3RhdGU6IGFueSkgPT4ge1xuXHRcdFx0XHRjb25zdCBvQ29uZGl0aW9uID0gb0V4dGVybmFsU3RhdGUuZmlsdGVyO1xuXHRcdFx0XHRmb3IgKGNvbnN0IGZpZWxkIGluIG9Db25kaXRpb24pIHtcblx0XHRcdFx0XHRpZiAoZmllbGQgIT09IFwiJGVkaXRTdGF0ZVwiICYmIGZpZWxkICE9PSBcIiRzZWFyY2hcIikge1xuXHRcdFx0XHRcdFx0b0NvbmRpdGlvbltmaWVsZF1bMF1bXCJmaWx0ZXJlZFwiXSA9IGZhbHNlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG9Db25kaXRpb24pO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbiAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgcmV0cmlldmluZyB0aGUgZXh0ZXJuYWwgc3RhdGVcIiwgb0Vycm9yKTtcblx0XHRcdH0pO1xuXHR9LFxuXG5cdF9mbkFwcGx5Q29uZGl0aW9uczogYXN5bmMgZnVuY3Rpb24gKG9GaWx0ZXJCYXI6IGFueSwgb0NvbmRpdGlvbnM6IGFueSwgYklzRkxQVmFsdWVQcmVzZW50PzogYm9vbGVhbikge1xuXHRcdGNvbnN0IG1GaWx0ZXI6IGFueSA9IHt9LFxuXHRcdFx0YUl0ZW1zOiBhbnlbXSA9IFtdLFxuXHRcdFx0Zm5BZGp1c3RWYWx1ZUhlbHBDb25kaXRpb24gPSBmdW5jdGlvbiAob0NvbmRpdGlvbjogYW55KSB7XG5cdFx0XHRcdC8vIGluIGNhc2UgdGhlIGNvbmRpdGlvbiBpcyBtZWFudCBmb3IgYSBmaWVsZCBoYXZpbmcgYSBWSCwgdGhlIGZvcm1hdCByZXF1aXJlZCBieSBNREMgZGlmZmVyc1xuXHRcdFx0XHRvQ29uZGl0aW9uLnZhbGlkYXRlZCA9IENvbmRpdGlvblZhbGlkYXRlZC5WYWxpZGF0ZWQ7XG5cdFx0XHRcdGlmIChvQ29uZGl0aW9uLm9wZXJhdG9yID09PSBcIkVtcHR5XCIpIHtcblx0XHRcdFx0XHRvQ29uZGl0aW9uLm9wZXJhdG9yID0gXCJFUVwiO1xuXHRcdFx0XHRcdG9Db25kaXRpb24udmFsdWVzID0gW1wiXCJdO1xuXHRcdFx0XHR9IGVsc2UgaWYgKG9Db25kaXRpb24ub3BlcmF0b3IgPT09IFwiTm90RW1wdHlcIikge1xuXHRcdFx0XHRcdG9Db25kaXRpb24ub3BlcmF0b3IgPSBcIk5FXCI7XG5cdFx0XHRcdFx0b0NvbmRpdGlvbi52YWx1ZXMgPSBbXCJcIl07XG5cdFx0XHRcdH1cblx0XHRcdFx0ZGVsZXRlIG9Db25kaXRpb24uaXNFbXB0eTtcblx0XHRcdH07XG5cdFx0Y29uc3QgZm5HZXRQcm9wZXJ0eUluZm8gPSBmdW5jdGlvbiAob0ZpbHRlckNvbnRyb2w6IGFueSwgc0VudGl0eVR5cGVQYXRoOiBhbnkpIHtcblx0XHRcdGNvbnN0IHNFbnRpdHlTZXRQYXRoID0gTW9kZWxIZWxwZXIuZ2V0RW50aXR5U2V0UGF0aChzRW50aXR5VHlwZVBhdGgpLFxuXHRcdFx0XHRvTWV0YU1vZGVsID0gb0ZpbHRlckNvbnRyb2wuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSxcblx0XHRcdFx0b0ZSID0gQ29tbW9uVXRpbHMuZ2V0RmlsdGVyUmVzdHJpY3Rpb25zQnlQYXRoKHNFbnRpdHlTZXRQYXRoLCBvTWV0YU1vZGVsKSxcblx0XHRcdFx0YU5vbkZpbHRlcmFibGVQcm9wcyA9IG9GUi5Ob25GaWx0ZXJhYmxlUHJvcGVydGllcyxcblx0XHRcdFx0bUZpbHRlckZpZWxkcyA9IEZpbHRlclV0aWxzLmdldENvbnZlcnRlZEZpbHRlckZpZWxkcyhvRmlsdGVyQ29udHJvbCwgc0VudGl0eVR5cGVQYXRoKSxcblx0XHRcdFx0YVByb3BlcnR5SW5mbzogYW55W10gPSBbXTtcblx0XHRcdE9iamVjdC5rZXlzKG1GaWx0ZXJGaWVsZHMpLmZvckVhY2goZnVuY3Rpb24gKHNGaWx0ZXJGaWVsZEtleTogc3RyaW5nKSB7XG5cdFx0XHRcdGNvbnN0IG9Db252ZXJ0ZWRQcm9wZXJ0eSA9IG1GaWx0ZXJGaWVsZHNbc0ZpbHRlckZpZWxkS2V5XTtcblx0XHRcdFx0Y29uc3Qgc1Byb3BlcnR5UGF0aCA9IG9Db252ZXJ0ZWRQcm9wZXJ0eS5jb25kaXRpb25QYXRoLnJlcGxhY2UoQ09ORElUSU9OX1BBVEhfVE9fUFJPUEVSVFlfUEFUSF9SRUdFWCwgXCJcIik7XG5cdFx0XHRcdGlmIChhTm9uRmlsdGVyYWJsZVByb3BzLmluZGV4T2Yoc1Byb3BlcnR5UGF0aCkgPT09IC0xKSB7XG5cdFx0XHRcdFx0Y29uc3Qgc0Fubm90YXRpb25QYXRoID0gb0NvbnZlcnRlZFByb3BlcnR5LmFubm90YXRpb25QYXRoO1xuXHRcdFx0XHRcdGNvbnN0IG9Qcm9wZXJ0eUNvbnRleHQgPSBvTWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KHNBbm5vdGF0aW9uUGF0aCk7XG5cdFx0XHRcdFx0YVByb3BlcnR5SW5mby5wdXNoKHtcblx0XHRcdFx0XHRcdHBhdGg6IG9Db252ZXJ0ZWRQcm9wZXJ0eS5jb25kaXRpb25QYXRoLFxuXHRcdFx0XHRcdFx0aGlkZGVuRmlsdGVyOiBvQ29udmVydGVkUHJvcGVydHkuYXZhaWxhYmlsaXR5ID09PSBcIkhpZGRlblwiLFxuXHRcdFx0XHRcdFx0aGFzVmFsdWVIZWxwOiAhc0Fubm90YXRpb25QYXRoXG5cdFx0XHRcdFx0XHRcdD8gZmFsc2Vcblx0XHRcdFx0XHRcdFx0OiBQcm9wZXJ0eUZvcm1hdHRlcnMuaGFzVmFsdWVIZWxwKG9Qcm9wZXJ0eUNvbnRleHQuZ2V0T2JqZWN0KCksIHsgY29udGV4dDogb1Byb3BlcnR5Q29udGV4dCB9KVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBhUHJvcGVydHlJbmZvO1xuXHRcdH07XG5cblx0XHRyZXR1cm4gb0ZpbHRlckJhci53YWl0Rm9ySW5pdGlhbGl6YXRpb24oKS50aGVuKGFzeW5jICgpID0+IHtcblx0XHRcdGNvbnN0IHNFbnRpdHlUeXBlUGF0aCA9IERlbGVnYXRlVXRpbC5nZXRDdXN0b21EYXRhKG9GaWx0ZXJCYXIsIFwiZW50aXR5VHlwZVwiKTtcblx0XHRcdC8vIER1cmluZyBleHRlcm5hbCBhcHAgbmF2aWdhdGlvbiwgd2UgaGF2ZSB0byBjbGVhciB0aGUgZXhpc3RpbmcgY29uZGl0aW9ucyB0byBhdm9pZCBtZXJnaW5nIG9mIHZhbHVlcyBjb21pbmcgZnJvbSBhbm5vdGF0aW9uIGFuZCBjb250ZXh0XG5cdFx0XHQvLyBDb25kaXRpb24gIWJJc0ZMUFZhbHVlUHJlc2VudCBpbmRpY2F0ZXMgaXQncyBleHRlcm5hbCBhcHAgbmF2aWdhdGlvblxuXHRcdFx0aWYgKCFiSXNGTFBWYWx1ZVByZXNlbnQpIHtcblx0XHRcdFx0Y29uc3Qgb0NsZWFyQ29uZGl0aW9ucyA9IGF3YWl0IHRoaXMuX2ZuQ2xlYXJTdGF0ZUJlZm9yZXhBcHBOYXYob0ZpbHRlckJhcik7XG5cdFx0XHRcdGF3YWl0IFN0YXRlVXRpbC5hcHBseUV4dGVybmFsU3RhdGUob0ZpbHRlckJhciwge1xuXHRcdFx0XHRcdGZpbHRlcjogb0NsZWFyQ29uZGl0aW9ucyxcblx0XHRcdFx0XHRpdGVtczogYUl0ZW1zXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0Y29uc3QgYVByb3BlcnR5SW5mbyA9IGZuR2V0UHJvcGVydHlJbmZvKG9GaWx0ZXJCYXIsIHNFbnRpdHlUeXBlUGF0aCk7XG5cdFx0XHRhUHJvcGVydHlJbmZvXG5cdFx0XHRcdC5maWx0ZXIoZnVuY3Rpb24gKG9Qcm9wZXJ0eUluZm86IGFueSkge1xuXHRcdFx0XHRcdHJldHVybiBvUHJvcGVydHlJbmZvLnBhdGggIT09IFwiJGVkaXRTdGF0ZVwiICYmIG9Qcm9wZXJ0eUluZm8ucGF0aCAhPT0gXCIkc2VhcmNoXCI7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5mb3JFYWNoKGZ1bmN0aW9uIChvUHJvcGVydHlJbmZvOiBhbnkpIHtcblx0XHRcdFx0XHRpZiAob1Byb3BlcnR5SW5mby5wYXRoIGluIG9Db25kaXRpb25zKSB7XG5cdFx0XHRcdFx0XHRtRmlsdGVyW29Qcm9wZXJ0eUluZm8ucGF0aF0gPSBvQ29uZGl0aW9uc1tvUHJvcGVydHlJbmZvLnBhdGhdO1xuXHRcdFx0XHRcdFx0aWYgKCFvUHJvcGVydHlJbmZvLmhpZGRlbkZpbHRlcikge1xuXHRcdFx0XHRcdFx0XHRhSXRlbXMucHVzaCh7IG5hbWU6IG9Qcm9wZXJ0eUluZm8ucGF0aCB9KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGlmIChvUHJvcGVydHlJbmZvLmhhc1ZhbHVlSGVscCkge1xuXHRcdFx0XHRcdFx0XHRtRmlsdGVyW29Qcm9wZXJ0eUluZm8ucGF0aF0uZm9yRWFjaChmbkFkanVzdFZhbHVlSGVscENvbmRpdGlvbik7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRtRmlsdGVyW29Qcm9wZXJ0eUluZm8ucGF0aF0uZm9yRWFjaChmdW5jdGlvbiAob0NvbmRpdGlvbjogYW55KSB7XG5cdFx0XHRcdFx0XHRcdFx0b0NvbmRpdGlvbi52YWxpZGF0ZWQgPSBvQ29uZGl0aW9uLmZpbHRlcmVkID8gQ29uZGl0aW9uVmFsaWRhdGVkLk5vdFZhbGlkYXRlZCA6IG9Db25kaXRpb24udmFsaWRhdGVkO1xuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0bUZpbHRlcltvUHJvcGVydHlJbmZvLnBhdGhdID0gW107XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdHJldHVybiBTdGF0ZVV0aWwuYXBwbHlFeHRlcm5hbFN0YXRlKG9GaWx0ZXJCYXIsIHsgZmlsdGVyOiBtRmlsdGVyLCBpdGVtczogYUl0ZW1zIH0pO1xuXHRcdH0pO1xuXHR9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBWaWV3U3RhdGVPdmVycmlkZTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7RUErQ0EsTUFBTUEsT0FBTyxHQUFHQyxVQUFVLENBQUNELE9BQU87SUFDakNFLHFCQUFxQixHQUFHQyxXQUFXLENBQUNDLGlCQUFpQjtJQUNyREMsbUJBQW1CLEdBQUdGLFdBQVcsQ0FBQ0UsbUJBQW1CO0lBQ3JEQyxlQUFlLEdBQUdILFdBQVcsQ0FBQ0csZUFBZTtJQUM3Q0MscUNBQXFDLEdBQUcsUUFBUTtFQUVqRCxNQUFNQyxpQkFBc0IsR0FBRztJQUM5QkMsaUJBQWlCLEVBQUUsS0FBSztJQUN4QkMscUJBQXFCLEVBQUUsWUFBWTtNQUNsQyxPQUFPLElBQUk7SUFDWixDQUFDO0lBQ0RDLG9CQUFvQixFQUFFLFVBQXNEQyxTQUFjLEVBQUU7TUFDM0YsTUFBTUMsS0FBSyxHQUFHLElBQUksQ0FBQ0MsT0FBTyxFQUFFO1FBQzNCQyxXQUFXLEdBQUdGLEtBQUss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