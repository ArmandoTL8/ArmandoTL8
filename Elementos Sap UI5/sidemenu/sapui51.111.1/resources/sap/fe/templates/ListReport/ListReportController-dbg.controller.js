/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/ObjectPath", "sap/fe/core/ActionRuntime", "sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/IntentBasedNavigation", "sap/fe/core/controllerextensions/InternalIntentBasedNavigation", "sap/fe/core/controllerextensions/InternalRouting", "sap/fe/core/controllerextensions/KPIManagement", "sap/fe/core/controllerextensions/MassEdit", "sap/fe/core/controllerextensions/Placeholder", "sap/fe/core/controllerextensions/Share", "sap/fe/core/controllerextensions/SideEffects", "sap/fe/core/controllerextensions/ViewState", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/DeleteHelper", "sap/fe/core/helpers/EditState", "sap/fe/core/helpers/MessageStrip", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/library", "sap/fe/core/PageController", "sap/fe/macros/chart/ChartUtils", "sap/fe/macros/CommonHelper", "sap/fe/macros/DelegateUtil", "sap/fe/macros/filter/FilterUtils", "sap/fe/templates/ListReport/ExtensionAPI", "sap/fe/templates/TableScroller", "sap/ui/core/mvc/OverrideExecution", "sap/ui/Device", "sap/ui/mdc/p13n/StateUtil", "sap/ui/thirdparty/hasher", "./ListReportTemplating", "./overrides/IntentBasedNavigation", "./overrides/Share", "./overrides/ViewState"], function (Log, ObjectPath, ActionRuntime, CommonUtils, IntentBasedNavigation, InternalIntentBasedNavigation, InternalRouting, KPIManagement, MassEdit, Placeholder, Share, SideEffects, ViewState, ClassSupport, DeleteHelper, EditState, MessageStrip, StableIdHelper, CoreLibrary, PageController, ChartUtils, CommonHelper, DelegateUtil, FilterUtils, ExtensionAPI, TableScroller, OverrideExecution, Device, StateUtil, hasher, ListReportTemplating, IntentBasedNavigationOverride, ShareOverrides, ViewStateOverrides) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9;
  var system = Device.system;
  var usingExtension = ClassSupport.usingExtension;
  var publicExtension = ClassSupport.publicExtension;
  var privateExtension = ClassSupport.privateExtension;
  var finalExtension = ClassSupport.finalExtension;
  var extensible = ClassSupport.extensible;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  const TemplateContentView = CoreLibrary.TemplateContentView,
    InitialLoadMode = CoreLibrary.InitialLoadMode;

  /**
   * Controller class for the list report page, used inside an SAP Fiori elements application.
   *
   * @hideconstructor
   * @public
   */
  let ListReportController = (_dec = defineUI5Class("sap.fe.templates.ListReport.ListReportController"), _dec2 = usingExtension(InternalRouting.override({
    onAfterBinding: function () {
      this.getView().getController()._onAfterBinding();
    }
  })), _dec3 = usingExtension(InternalIntentBasedNavigation.override({
    getEntitySet: function () {
      return this.base.getCurrentEntitySet();
    }
  })), _dec4 = usingExtension(SideEffects), _dec5 = usingExtension(IntentBasedNavigation.override(IntentBasedNavigationOverride)), _dec6 = usingExtension(Share.override(ShareOverrides)), _dec7 = usingExtension(ViewState.override(ViewStateOverrides)), _dec8 = usingExtension(KPIManagement), _dec9 = usingExtension(Placeholder), _dec10 = usingExtension(MassEdit), _dec11 = publicExtension(), _dec12 = finalExtension(), _dec13 = privateExtension(), _dec14 = extensible(OverrideExecution.After), _dec15 = publicExtension(), _dec16 = extensible(OverrideExecution.After), _dec17 = publicExtension(), _dec18 = extensible(OverrideExecution.After), _dec19 = publicExtension(), _dec20 = extensible(OverrideExecution.After), _dec(_class = (_class2 = /*#__PURE__*/function (_PageController) {
    _inheritsLoose(ListReportController, _PageController);
    function ListReportController() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _PageController.call(this, ...args) || this;
      _initializerDefineProperty(_this, "_routing", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "_intentBasedNavigation", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "sideEffects", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "intentBasedNavigation", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "share", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "viewState", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "kpiManagement", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "placeholder", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "massEdit", _descriptor9, _assertThisInitialized(_this));
      _this.handlers = {
        onFilterSearch() {
          this._getFilterBarControl().triggerSearch();
        },
        onFiltersChanged(oEvent) {
          const oFilterBar = this._getFilterBarControl();
          if (oFilterBar) {
            const oInternalModelContext = this.getView().getBindingContext("internal");
            // Pending filters into FilterBar to be used for custom views
            this.onPendingFilters();
            oInternalModelContext.setProperty("appliedFilters", oFilterBar.getAssignedFiltersText().filtersText);
            if (oEvent.getParameter("conditionsBased")) {
              oInternalModelContext.setProperty("hasPendingFilters", true);
            }
          }
        },
        onVariantSelected(oEvent) {
          const oVM = oEvent.getSource();
          const currentVariantKey = oEvent.getParameter("key");
          const oMultiModeControl = this._getMultiModeControl();
          oMultiModeControl === null || oMultiModeControl === void 0 ? void 0 : oMultiModeControl.invalidateContent();
          oMultiModeControl === null || oMultiModeControl === void 0 ? void 0 : oMultiModeControl.setFreezeContent(true);

          // setTimeout cause the variant needs to be applied before judging the auto search or updating the app state
          setTimeout(() => {
            if (this._shouldAutoTriggerSearch(oVM)) {
              // the app state will be updated via onSearch handler
              return this._getFilterBarControl().triggerSearch();
            } else if (!this._getApplyAutomaticallyOnVariant(oVM, currentVariantKey)) {
              this.getExtensionAPI().updateAppState();
            }
          }, 0);
        },
        onVariantSaved() {
          //TODO: Should remove this setTimeOut once Variant Management provides an api to fetch the current variant key on save!!!
          setTimeout(() => {
            this.getExtensionAPI().updateAppState();
          }, 1000);
        },
        onSearch() {
          const oFilterBar = this._getFilterBarControl();
          const oInternalModelContext = this.getView().getBindingContext("internal");
          const oMdcChart = this.getChartControl();
          const bHideDraft = FilterUtils.getEditStateIsHideDraft(oFilterBar.getConditions());
          oInternalModelContext.setProperty("hasPendingFilters", false);
          oInternalModelContext.setProperty("hideDraftInfo", bHideDraft);
          if (!this._getMultiModeControl()) {
            this._updateALPNotApplicableFields(oInternalModelContext, oFilterBar);
          }
          if (oMdcChart) {
            // disable bound actions TODO: this clears everything for the chart?
            oMdcChart.getBindingContext("internal").setProperty("", {});
            const oPageInternalModelContext = oMdcChart.getBindingContext("pageInternal");
            const sTemplateContentView = oPageInternalModelContext.getProperty(`${oPageInternalModelContext.getPath()}/alpContentView`);
            if (sTemplateContentView === TemplateContentView.Chart) {
              this.hasPendingChartChanges = true;
            }
            if (sTemplateContentView === TemplateContentView.Table) {
              this.hasPendingTableChanges = true;
            }
          }
          // store filter bar conditions to use later while navigation
          StateUtil.retrieveExternalState(oFilterBar).then(oExternalState => {
            this.filterBarConditions = oExternalState.filter;
          }).catch(function (oError) {
            Log.error("Error while retrieving the external state", oError);
          });
          if (this.getView().getViewData().liveMode === false) {
            this.getExtensionAPI().updateAppState();
          }
          if (system.phone) {
            const oDynamicPage = this._getDynamicListReportControl();
            oDynamicPage.setHeaderExpanded(false);
          }
        },
        /**
         * Triggers an outbound navigation when a user chooses the chevron.
         *
         * @param oController
         * @param sOutboundTarget Name of the outbound target (needs to be defined in the manifest)
         * @param oContext The context that contains the data for the target app
         * @param sCreatePath Create path when the chevron is created.
         * @returns Promise which is resolved once the navigation is triggered
         * @ui5-restricted
         * @final
         */
        onChevronPressNavigateOutBound(oController, sOutboundTarget, oContext, sCreatePath) {
          return oController._intentBasedNavigation.onChevronPressNavigateOutBound(oController, sOutboundTarget, oContext, sCreatePath);
        },
        onChartSelectionChanged(oEvent) {
          const oMdcChart = oEvent.getSource().getContent(),
            oTable = this._getTable(),
            aData = oEvent.getParameter("data"),
            oInternalModelContext = this.getView().getBindingContext("internal");
          if (aData) {
            ChartUtils.setChartFilters(oMdcChart);
          }
          const sTemplateContentView = oInternalModelContext.getProperty(`${oInternalModelContext.getPath()}/alpContentView`);
          if (sTemplateContentView === TemplateContentView.Chart) {
            this.hasPendingChartChanges = true;
          } else if (oTable) {
            oTable.rebind();
            this.hasPendingChartChanges = false;
          }
        },
        onSegmentedButtonPressed(oEvent) {
          const sSelectedKey = oEvent.mParameters.key ? oEvent.mParameters.key : null;
          const oInternalModelContext = this.getView().getBindingContext("internal");
          oInternalModelContext.setProperty("alpContentView", sSelectedKey);
          const oChart = this.getChartControl();
          const oTable = this._getTable();
          const oSegmentedButtonDelegate = {
            onAfterRendering() {
              const aItems = oSegmentedButton.getItems();
              aItems.forEach(function (oItem) {
                if (oItem.getKey() === sSelectedKey) {
                  oItem.focus();
                }
              });
              oSegmentedButton.removeEventDelegate(oSegmentedButtonDelegate);
            }
          };
          const oSegmentedButton = sSelectedKey === TemplateContentView.Table ? this._getSegmentedButton("Table") : this._getSegmentedButton("Chart");
          if (oSegmentedButton !== oEvent.getSource()) {
            oSegmentedButton.addEventDelegate(oSegmentedButtonDelegate);
          }
          switch (sSelectedKey) {
            case TemplateContentView.Table:
              this._updateTable(oTable);
              break;
            case TemplateContentView.Chart:
              this._updateChart(oChart);
              break;
            case TemplateContentView.Hybrid:
              this._updateTable(oTable);
              this._updateChart(oChart);
              break;
            default:
              break;
          }
          this.getExtensionAPI().updateAppState();
        },
        onFiltersSegmentedButtonPressed(oEvent) {
          const isCompact = oEvent.getParameter("key") === "Compact";
          this._getFilterBarControl().setVisible(isCompact);
          this._getVisualFilterBarControl().setVisible(!isCompact);
        },
        onStateChange() {
          this.getExtensionAPI().updateAppState();
        },
        onDynamicPageTitleStateChanged(oEvent) {
          const filterBar = this._getFilterBarControl();
          if (filterBar && filterBar.getSegmentedButton()) {
            if (oEvent.getParameter("isExpanded")) {
              filterBar.getSegmentedButton().setVisible(true);
            } else {
              filterBar.getSegmentedButton().setVisible(false);
            }
          }
        }
      };
      _this.formatters = {
        setALPControlMessageStrip(aIgnoredFields, bIsChart, oApplySupported) {
          let sText = "";
          bIsChart = bIsChart === "true" || bIsChart === true;
          const oFilterBar = this._getFilterBarControl();
          if (oFilterBar && Array.isArray(aIgnoredFields) && aIgnoredFields.length > 0 && bIsChart) {
            const aIgnoredLabels = MessageStrip.getLabels(aIgnoredFields, oFilterBar.data("entityType"), oFilterBar, this.oResourceBundle);
            const bIsSearchIgnored = !oApplySupported.enableSearch;
            sText = bIsChart ? MessageStrip.getALPText(aIgnoredLabels, oFilterBar, bIsSearchIgnored) : MessageStrip.getText(aIgnoredLabels, oFilterBar, "", DelegateUtil.getLocalizedText);
            return sText;
          }
        }
      };
      return _this;
    }
    var _proto = ListReportController.prototype;
    /**
     * Get the extension API for the current page.
     *
     * @public
     * @returns The extension API.
     */
    _proto.getExtensionAPI = function getExtensionAPI() {
      if (!this.extensionAPI) {
        this.extensionAPI = new ExtensionAPI(this);
      }
      return this.extensionAPI;
    };
    _proto.onInit = function onInit() {
      PageController.prototype.onInit.apply(this);
      const oInternalModelContext = this.getView().getBindingContext("internal");
      oInternalModelContext.setProperty("hasPendingFilters", true);
      oInternalModelContext.setProperty("appliedFilters", "");
      oInternalModelContext.setProperty("hideDraftInfo", false);
      oInternalModelContext.setProperty("uom", {});
      oInternalModelContext.setProperty("scalefactor", {});
      oInternalModelContext.setProperty("scalefactorNumber", {});
      oInternalModelContext.setProperty("currency", {});
      if (this._hasMultiVisualizations()) {
        let alpContentView = this._getDefaultPath();
        if (!system.desktop && alpContentView === TemplateContentView.Hybrid) {
          alpContentView = TemplateContentView.Chart;
        }
        oInternalModelContext.setProperty("alpContentView", alpContentView);
      }

      // Store conditions from filter bar
      // this is later used before navigation to get conditions applied on the filter bar
      this.filterBarConditions = {};

      // As AppStateHandler.applyAppState triggers a navigation we want to make sure it will
      // happen after the routeMatch event has been processed (otherwise the router gets broken)
      this.getAppComponent().getRouterProxy().waitForRouteMatchBeforeNavigation();

      // Configure the initial load settings
      this._setInitLoad();
    };
    _proto.onExit = function onExit() {
      delete this.filterBarConditions;
      if (this.extensionAPI) {
        this.extensionAPI.destroy();
      }
      delete this.extensionAPI;
    };
    _proto._onAfterBinding = function _onAfterBinding() {
      const aTables = this._getControls("table");
      if (EditState.isEditStateDirty()) {
        var _this$_getMultiModeCo, _this$_getTable;
        (_this$_getMultiModeCo = this._getMultiModeControl()) === null || _this$_getMultiModeCo === void 0 ? void 0 : _this$_getMultiModeCo.invalidateContent();
        const oTableBinding = (_this$_getTable = this._getTable()) === null || _this$_getTable === void 0 ? void 0 : _this$_getTable.getRowBinding();
        if (oTableBinding) {
          if (CommonUtils.getAppComponent(this.getView())._isFclEnabled()) {
            // there is an issue if we use a timeout with a kept alive context used on another page
            oTableBinding.refresh();
          } else {
            if (!this.sUpdateTimer) {
              this.sUpdateTimer = setTimeout(() => {
                oTableBinding.refresh();
                delete this.sUpdateTimer;
              }, 0);
            }

            // Update action enablement and visibility upon table data update.
            const fnUpdateTableActions = () => {
              this._updateTableActions(aTables);
              oTableBinding.detachDataReceived(fnUpdateTableActions);
            };
            oTableBinding.attachDataReceived(fnUpdateTableActions);
          }
        }
        EditState.setEditStateProcessed();
      }
      if (!this.sUpdateTimer) {
        this._updateTableActions(aTables);
      }
      const internalModelContext = this.getView().getBindingContext("internal");
      if (!internalModelContext.getProperty("initialVariantApplied")) {
        const viewId = this.getView().getId();
        this.pageReady.waitFor(this.getAppComponent().getAppStateHandler().applyAppState(viewId, this.getView()));
        internalModelContext.setProperty("initialVariantApplied", true);
      }
    };
    _proto.onBeforeRendering = function onBeforeRendering() {
      PageController.prototype.onBeforeRendering.apply(this);
    };
    _proto.onAfterRendering = function onAfterRendering() {
      this.getView().getModel("sap.fe.i18n").getResourceBundle().then(response => {
        this.oResourceBundle = response;
        const aTables = this._getControls();
        const sEntitySet = this.getView().getViewData().entitySet;
        const sText = CommonUtils.getTranslatedText("T_TABLE_AND_CHART_NO_DATA_TEXT", this.oResourceBundle, undefined, sEntitySet);
        aTables.forEach(function (oTable) {
          oTable.setNoData(sText);
        });
      }).catch(function (oError) {
        Log.error("Error while retrieving the resource bundle", oError);
      });
    };
    _proto.onPageReady = function onPageReady(mParameters) {
      if (mParameters.forceFocus) {
        this._setInitialFocus();
      }
      // Remove the handler on back navigation that displays Draft confirmation
      this.getAppComponent().getShellServices().setBackNavigation(undefined);
    }

    /**
     * Method called when the content of a custom view used in a list report needs to be refreshed.
     * This happens either when there is a change on the FilterBar and the search is triggered,
     * or when a tab with custom content is selected.
     * This method can be overwritten by the controller extension in case of customization.
     *
     * @param mParameters Map containing the filter conditions of the FilterBar, the currentTabID
     * and the view refresh cause (tabChanged or search).
     * The map looks like this:
     * <code><pre>
     * 	{
     * 		filterConditions: {
     * 			Country: [
     * 				{
     * 					operator: "EQ"
     *					validated: "NotValidated"
     *					values: ["Germany", ...]
     * 				},
     * 				...
     * 			]
     * 			...
     * 		},
     *		currentTabId: "fe::CustomTab::tab1",
     *		refreshCause: "tabChanged" | "search"
     *	}
     * </pre></code>
     * @public
     */;
    _proto.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onViewNeedsRefresh = function onViewNeedsRefresh(mParameters) {
      /* To be overriden */
    }

    /**
     * Method called when a filter or search value has been changed in the FilterBar,
     * but has not been validated yet by the end user (with the 'Go' or 'Search' button).
     * Typically, the content of the current tab is greyed out until the filters are validated.
     * This method can be overwritten by the controller extension in case of customization.
     *
     * @public
     */;
    _proto.onPendingFilters = function onPendingFilters() {
      /* To be overriden */
    };
    _proto.getCurrentEntitySet = function getCurrentEntitySet() {
      var _this$_getTable2;
      return (_this$_getTable2 = this._getTable()) === null || _this$_getTable2 === void 0 ? void 0 : _this$_getTable2.data("targetCollectionPath").slice(1);
    }

    /**
     * Method called when the 'Clear' button on the FilterBar is pressed.
     *
     * @public
     */;
    _proto.onAfterClear = function onAfterClear() {
      /* To be overriden */
    }

    /**
     * This method initiates the update of the enabled state of the DataFieldForAction and the visible state of the DataFieldForIBN buttons.
     *
     * @param aTables Array of tables in the list report
     * @private
     */;
    _proto._updateTableActions = function _updateTableActions(aTables) {
      let aIBNActions = [];
      aTables.forEach(function (oTable) {
        aIBNActions = CommonUtils.getIBNActions(oTable, aIBNActions);
        // Update 'enabled' property of DataFieldForAction buttons on table toolbar
        // The same is also performed on Table selectionChange event
        const oInternalModelContext = oTable.getBindingContext("internal"),
          oActionOperationAvailableMap = JSON.parse(CommonHelper.parseCustomData(DelegateUtil.getCustomData(oTable, "operationAvailableMap"))),
          aSelectedContexts = oTable.getSelectedContexts();
        oInternalModelContext.setProperty("selectedContexts", aSelectedContexts);
        oInternalModelContext.setProperty("numberOfSelectedContexts", aSelectedContexts.length);
        // Refresh enablement of delete button
        DeleteHelper.updateDeleteInfoForSelectedContexts(oInternalModelContext, aSelectedContexts);
        ActionRuntime.setActionEnablement(oInternalModelContext, oActionOperationAvailableMap, aSelectedContexts, "table");
      });
      CommonUtils.updateDataFieldForIBNButtonsVisibility(aIBNActions, this.getView());
    }

    /**
     * This method scrolls to a specific row on all the available tables.
     *
     * @function
     * @name sap.fe.templates.ListReport.ListReportController.controller#_scrollTablesToRow
     * @param sRowPath The path of the table row context to be scrolled to
     */;
    _proto._scrollTablesToRow = function _scrollTablesToRow(sRowPath) {
      this._getControls("table").forEach(function (oTable) {
        TableScroller.scrollTableToRow(oTable, sRowPath);
      });
    }

    /**
     * This method set the initial focus within the List Report according to the UX guide lines.
     *
     * @function
     * @name sap.fe.templates.ListReport.ListReportController.controller#_setInitialFocus
     */;
    _proto._setInitialFocus = function _setInitialFocus() {
      const dynamicPage = this._getDynamicListReportControl(),
        isHeaderExpanded = dynamicPage.getHeaderExpanded(),
        filterBar = this._getFilterBarControl();
      if (filterBar) {
        if (isHeaderExpanded) {
          //Enabling mandatory filter fields message dialog
          if (!filterBar.getShowMessages()) {
            filterBar.setShowMessages(true);
          }
          const firstEmptyMandatoryField = filterBar.getFilterItems().find(function (oFilterItem) {
            return oFilterItem.getRequired() && oFilterItem.getConditions().length === 0;
          });
          //Focusing on the first empty mandatory filter field, or on the first filter field if the table data is loaded
          if (firstEmptyMandatoryField) {
            firstEmptyMandatoryField.focus();
          } else if (this._isInitLoadEnabled() && filterBar.getFilterItems().length > 0) {
            //BCP: 2380008406 Add check for available filterItems
            filterBar.getFilterItems()[0].focus();
          } else {
            var _this$getView$byId;
            //Focusing on the Go button
            (_this$getView$byId = this.getView().byId(`${this._getFilterBarControlId()}-btnSearch`)) === null || _this$getView$byId === void 0 ? void 0 : _this$getView$byId.focus();
          }
        } else if (this._isInitLoadEnabled()) {
          var _this$_getTable3;
          (_this$_getTable3 = this._getTable()) === null || _this$_getTable3 === void 0 ? void 0 : _this$_getTable3.focusRow(0);
        }
      } else {
        var _this$_getTable4;
        (_this$_getTable4 = this._getTable()) === null || _this$_getTable4 === void 0 ? void 0 : _this$_getTable4.focusRow(0);
      }
    };
    _proto._getPageTitleInformation = function _getPageTitleInformation() {
      const oManifestEntry = this.getAppComponent().getManifestEntry("sap.app");
      return {
        title: oManifestEntry.title,
        subtitle: oManifestEntry.subTitle || "",
        intent: "",
        icon: ""
      };
    };
    _proto._getFilterBarControl = function _getFilterBarControl() {
      return this.getView().byId(this._getFilterBarControlId());
    };
    _proto._getDynamicListReportControl = function _getDynamicListReportControl() {
      return this.getView().byId(this._getDynamicListReportControlId());
    };
    _proto._getAdaptationFilterBarControl = function _getAdaptationFilterBarControl() {
      // If the adaptation filter bar is part of the DOM tree, the "Adapt Filter" dialog is open,
      // and we return the adaptation filter bar as an active control (visible for the user)
      const adaptationFilterBar = this._getFilterBarControl().getInbuiltFilter();
      return adaptationFilterBar !== null && adaptationFilterBar !== void 0 && adaptationFilterBar.getParent() ? adaptationFilterBar : undefined;
    };
    _proto._getSegmentedButton = function _getSegmentedButton(sControl) {
      var _ref;
      const sSegmentedButtonId = (_ref = sControl === "Chart" ? this.getChartControl() : this._getTable()) === null || _ref === void 0 ? void 0 : _ref.data("segmentedButtonId");
      return this.getView().byId(sSegmentedButtonId);
    };
    _proto._getControlFromPageModelProperty = function _getControlFromPageModelProperty(sPath) {
      var _this$_getPageModel;
      const controlId = (_this$_getPageModel = this._getPageModel()) === null || _this$_getPageModel === void 0 ? void 0 : _this$_getPageModel.getProperty(sPath);
      return controlId && this.getView().byId(controlId);
    };
    _proto._getDynamicListReportControlId = function _getDynamicListReportControlId() {
      var _this$_getPageModel2;
      return ((_this$_getPageModel2 = this._getPageModel()) === null || _this$_getPageModel2 === void 0 ? void 0 : _this$_getPageModel2.getProperty("/dynamicListReportId")) || "";
    };
    _proto._getFilterBarControlId = function _getFilterBarControlId() {
      var _this$_getPageModel3;
      return ((_this$_getPageModel3 = this._getPageModel()) === null || _this$_getPageModel3 === void 0 ? void 0 : _this$_getPageModel3.getProperty("/filterBarId")) || "";
    };
    _proto.getChartControl = function getChartControl() {
      return this._getControlFromPageModelProperty("/singleChartId");
    };
    _proto._getVisualFilterBarControl = function _getVisualFilterBarControl() {
      const sVisualFilterBarId = StableIdHelper.generate(["visualFilter", this._getFilterBarControlId()]);
      return sVisualFilterBarId && this.getView().byId(sVisualFilterBarId);
    };
    _proto._getFilterBarVariantControl = function _getFilterBarVariantControl() {
      return this._getControlFromPageModelProperty("/variantManagement/id");
    };
    _proto._getMultiModeControl = function _getMultiModeControl() {
      return this.getView().byId("fe::TabMultipleMode::Control");
    };
    _proto._getTable = function _getTable() {
      if (this._isMultiMode()) {
        var _this$_getMultiModeCo2, _this$_getMultiModeCo3;
        const oControl = (_this$_getMultiModeCo2 = this._getMultiModeControl()) === null || _this$_getMultiModeCo2 === void 0 ? void 0 : (_this$_getMultiModeCo3 = _this$_getMultiModeCo2.getSelectedInnerControl()) === null || _this$_getMultiModeCo3 === void 0 ? void 0 : _this$_getMultiModeCo3.content;
        return oControl !== null && oControl !== void 0 && oControl.isA("sap.ui.mdc.Table") ? oControl : undefined;
      } else {
        return this._getControlFromPageModelProperty("/singleTableId");
      }
    };
    _proto._getControls = function _getControls(sKey) {
      if (this._isMultiMode()) {
        const aControls = [];
        const oTabMultiMode = this._getMultiModeControl().content;
        oTabMultiMode.getItems().forEach(oItem => {
          const oControl = this.getView().byId(oItem.getKey());
          if (oControl && sKey) {
            if (oItem.getKey().indexOf(`fe::${sKey}`) > -1) {
              aControls.push(oControl);
            }
          } else if (oControl !== undefined && oControl !== null) {
            aControls.push(oControl);
          }
        });
        return aControls;
      } else if (sKey === "Chart") {
        const oChart = this.getChartControl();
        return oChart ? [oChart] : [];
      } else {
        const oTable = this._getTable();
        return oTable ? [oTable] : [];
      }
    };
    _proto._getDefaultPath = function _getDefaultPath() {
      var _this$_getPageModel4;
      const defaultPath = ListReportTemplating.getDefaultPath(((_this$_getPageModel4 = this._getPageModel()) === null || _this$_getPageModel4 === void 0 ? void 0 : _this$_getPageModel4.getProperty("/views")) || []);
      switch (defaultPath) {
        case "primary":
          return TemplateContentView.Chart;
        case "secondary":
          return TemplateContentView.Table;
        case "both":
        default:
          return TemplateContentView.Hybrid;
      }
    }

    /**
     * Method to know if ListReport is configured with Multiple Table mode.
     *
     * @function
     * @name _isMultiMode
     * @returns Is Multiple Table mode set?
     */;
    _proto._isMultiMode = function _isMultiMode() {
      var _this$_getPageModel5;
      return !!((_this$_getPageModel5 = this._getPageModel()) !== null && _this$_getPageModel5 !== void 0 && _this$_getPageModel5.getProperty("/multiViewsControl"));
    }

    /**
     * Method to know if ListReport is configured to load data at start up.
     *
     * @function
     * @name _isInitLoadDisabled
     * @returns Is InitLoad enabled?
     */;
    _proto._isInitLoadEnabled = function _isInitLoadEnabled() {
      const initLoadMode = this.getView().getViewData().initialLoad;
      return initLoadMode === InitialLoadMode.Enabled;
    };
    _proto._hasMultiVisualizations = function _hasMultiVisualizations() {
      var _this$_getPageModel6;
      return (_this$_getPageModel6 = this._getPageModel()) === null || _this$_getPageModel6 === void 0 ? void 0 : _this$_getPageModel6.getProperty("/hasMultiVisualizations");
    }

    /**
     * Method to suspend search on the filter bar. The initial loading of data is disabled based on the manifest configuration InitLoad - Disabled/Auto.
     * It is enabled later when the view state is set, when it is possible to realize if there are default filters.
     */;
    _proto._disableInitLoad = function _disableInitLoad() {
      const filterBar = this._getFilterBarControl();
      // check for filter bar hidden
      if (filterBar) {
        filterBar.setSuspendSelection(true);
      }
    }

    /**
     * Method called by flex to determine if the applyAutomatically setting on the variant is valid.
     * Called only for Standard Variant and only when there is display text set for applyAutomatically (FE only sets it for Auto).
     *
     * @returns Boolean true if data should be loaded automatically, false otherwise
     */;
    _proto._applyAutomaticallyOnStandardVariant = function _applyAutomaticallyOnStandardVariant() {
      // We always return false and take care of it when view state is set
      return false;
    }

    /**
     * Configure the settings for initial load based on
     * - manifest setting initLoad - Enabled/Disabled/Auto
     * - user's setting of applyAutomatically on variant
     * - if there are default filters
     * We disable the filter bar search at the beginning and enable it when view state is set.
     */;
    _proto._setInitLoad = function _setInitLoad() {
      // if initLoad is Disabled or Auto, switch off filter bar search temporarily at start
      if (!this._isInitLoadEnabled()) {
        this._disableInitLoad();
      }
      // set hook for flex for when standard variant is set (at start or by user at runtime)
      // required to override the user setting 'apply automatically' behaviour if there are no filters
      const variantManagementId = ListReportTemplating.getVariantBackReference(this.getView().getViewData(), this._getPageModel());
      const variantManagement = variantManagementId && this.getView().byId(variantManagementId);
      if (variantManagement) {
        variantManagement.registerApplyAutomaticallyOnStandardVariant(this._applyAutomaticallyOnStandardVariant.bind(this));
      }
    };
    _proto._setShareModel = function _setShareModel() {
      // TODO: deactivated for now - currently there is no _templPriv anymore, to be discussed
      // this method is currently not called anymore from the init method

      const fnGetUser = ObjectPath.get("sap.ushell.Container.getUser");
      //var oManifest = this.getOwnerComponent().getAppComponent().getMetadata().getManifestEntry("sap.ui");
      //var sBookmarkIcon = (oManifest && oManifest.icons && oManifest.icons.icon) || "";

      //shareModel: Holds all the sharing relevant information and info used in XML view
      const oShareInfo = {
        bookmarkTitle: document.title,
        //To name the bookmark according to the app title.
        bookmarkCustomUrl: function () {
          const sHash = hasher.getHash();
          return sHash ? `#${sHash}` : window.location.href;
        },
        /*
        				To be activated once the FLP shows the count - see comment above
        				bookmarkServiceUrl: function() {
        					//var oTable = oTable.getInnerTable(); oTable is already the sap.fe table (but not the inner one)
        					// we should use table.getListBindingInfo instead of the binding
        					var oBinding = oTable.getBinding("rows") || oTable.getBinding("items");
        					return oBinding ? fnGetDownloadUrl(oBinding) : "";
        				},*/
        isShareInJamActive: !!fnGetUser && fnGetUser().isJamActive()
      };
      const oTemplatePrivateModel = this.getOwnerComponent().getModel("_templPriv");
      oTemplatePrivateModel.setProperty("/listReport/share", oShareInfo);
    }

    /**
     * Method to update the local UI model of the page with the fields that are not applicable to the filter bar (this is specific to the ALP scenario).
     *
     * @param oInternalModelContext The internal model context
     * @param oFilterBar MDC filter bar
     */;
    _proto._updateALPNotApplicableFields = function _updateALPNotApplicableFields(oInternalModelContext, oFilterBar) {
      const mCache = {};
      const ignoredFields = {},
        aTables = this._getControls("table"),
        aCharts = this._getControls("Chart");
      if (!aTables.length || !aCharts.length) {
        // If there's not a table and a chart, we're not in the ALP case
        return;
      }

      // For the moment, there's nothing for tables...
      aCharts.forEach(function (oChart) {
        const sChartEntityPath = oChart.data("targetCollectionPath"),
          sChartEntitySet = sChartEntityPath.slice(1),
          sCacheKey = `${sChartEntitySet}Chart`;
        if (!mCache[sCacheKey]) {
          mCache[sCacheKey] = FilterUtils.getNotApplicableFilters(oFilterBar, oChart);
        }
        ignoredFields[sCacheKey] = mCache[sCacheKey];
      });
      oInternalModelContext.setProperty("controls/ignoredFields", ignoredFields);
    };
    _proto._isFilterBarHidden = function _isFilterBarHidden() {
      return this.getView().getViewData().hideFilterBar;
    };
    _proto._getApplyAutomaticallyOnVariant = function _getApplyAutomaticallyOnVariant(VariantManagement, key) {
      if (!VariantManagement || !key) {
        return false;
      }
      const variants = VariantManagement.getVariants();
      const currentVariant = variants.find(function (variant) {
        return variant && variant.key === key;
      });
      return currentVariant && currentVariant.executeOnSelect || false;
    };
    _proto._shouldAutoTriggerSearch = function _shouldAutoTriggerSearch(oVM) {
      if (this.getView().getViewData().initialLoad === InitialLoadMode.Auto && (!oVM || oVM.getStandardVariantKey() === oVM.getCurrentVariantKey())) {
        const oFilterBar = this._getFilterBarControl();
        if (oFilterBar) {
          const oConditions = oFilterBar.getConditions();
          for (const sKey in oConditions) {
            // ignore filters starting with $ (e.g. $search, $editState)
            if (!sKey.startsWith("$") && Array.isArray(oConditions[sKey]) && oConditions[sKey].length) {
              // load data as per user's setting of applyAutomatically on the variant
              const standardVariant = oVM.getVariants().find(variant => {
                return variant.key === oVM.getCurrentVariantKey();
              });
              return standardVariant && standardVariant.executeOnSelect;
            }
          }
        }
      }
      return false;
    };
    _proto._updateTable = function _updateTable(oTable) {
      if (!oTable.isTableBound() || this.hasPendingChartChanges) {
        oTable.rebind();
        this.hasPendingChartChanges = false;
      }
    };
    _proto._updateChart = function _updateChart(oChart) {
      const oInnerChart = oChart.getControlDelegate()._getChart(oChart);
      if (!(oInnerChart && oInnerChart.isBound("data")) || this.hasPendingTableChanges) {
        oChart.getControlDelegate().rebind(oChart, oInnerChart.getBindingInfo("data"));
        this.hasPendingTableChanges = false;
      }
    };
    return ListReportController;
  }(PageController), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "_routing", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "_intentBasedNavigation", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "sideEffects", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "intentBasedNavigation", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "share", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "viewState", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "kpiManagement", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "placeholder", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "massEdit", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _applyDecoratedDescriptor(_class2.prototype, "getExtensionAPI", [_dec11, _dec12], Object.getOwnPropertyDescriptor(_class2.prototype, "getExtensionAPI"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onPageReady", [_dec13, _dec14], Object.getOwnPropertyDescriptor(_class2.prototype, "onPageReady"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onViewNeedsRefresh", [_dec15, _dec16], Object.getOwnPropertyDescriptor(_class2.prototype, "onViewNeedsRefresh"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onPendingFilters", [_dec17, _dec18], Object.getOwnPropertyDescriptor(_class2.prototype, "onPendingFilters"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onAfterClear", [_dec19, _dec20], Object.getOwnPropertyDescriptor(_class2.prototype, "onAfterClear"), _class2.prototype)), _class2)) || _class);
  return ListReportController;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUZW1wbGF0ZUNvbnRlbnRWaWV3IiwiQ29yZUxpYnJhcnkiLCJJbml0aWFsTG9hZE1vZGUiLCJMaXN0UmVwb3J0Q29udHJvbGxlciIsImRlZmluZVVJNUNsYXNzIiwidXNpbmdFeHRlbnNpb24iLCJJbnRlcm5hbFJvdXRpbmciLCJvdmVycmlkZSIsIm9uQWZ0ZXJCaW5kaW5nIiwiZ2V0VmlldyIsImdldENvbnRyb2xsZXIiLCJfb25BZnRlckJpbmRpbmciLCJJbnRlcm5hbEludGVudEJhc2VkTmF2aWdhdGlvbiIsImdldEVudGl0eVNldCIsImJhc2UiLCJnZXRDdXJyZW50RW50aXR5U2V0IiwiU2lkZUVmZmVjdHMiLCJJbnRlbnRCYXNlZE5hdmlnYXRpb24iLCJJbnRlbnRCYXNlZE5hdmlnYXRpb25PdmVycmlkZSIsIlNoYXJlIiwiU2hhcmVPdmVycmlkZXMiLCJWaWV3U3RhdGUiLCJWaWV3U3RhdGVPdmVycmlkZXMiLCJLUElNYW5hZ2VtZW50IiwiUGxhY2Vob2xkZXIiLCJNYXNzRWRpdCIsInB1YmxpY0V4dGVuc2lvbiIsImZpbmFsRXh0ZW5zaW9uIiwicHJpdmF0ZUV4dGVuc2lvbiIsImV4dGVuc2libGUiLCJPdmVycmlkZUV4ZWN1dGlvbiIsIkFmdGVyIiwiaGFuZGxlcnMiLCJvbkZpbHRlclNlYXJjaCIsIl9nZXRGaWx0ZXJCYXJDb250cm9sIiwidHJpZ2dlclNlYXJjaCIsIm9uRmlsdGVyc0NoYW5nZWQiLCJvRXZlbnQiLCJvRmlsdGVyQmFyIiwib0ludGVybmFsTW9kZWxDb250ZXh0IiwiZ2V0QmluZGluZ0NvbnRleHQiLCJvblBlbmRpbmdGaWx0ZXJzIiwic2V0UHJvcGVydHkiLCJnZXRBc3NpZ25lZEZpbHRlcnNUZXh0IiwiZmlsdGVyc1RleHQiLCJnZXRQYXJhbWV0ZXIiLCJvblZhcmlhbnRTZWxlY3RlZCIsIm9WTSIsImdldFNvdXJjZSIsImN1cnJlbnRWYXJpYW50S2V5Iiwib011bHRpTW9kZUNvbnRyb2wiLCJfZ2V0TXVsdGlNb2RlQ29udHJvbCIsImludmFsaWRhdGVDb250ZW50Iiwic2V0RnJlZXplQ29udGVudCIsInNldFRpbWVvdXQiLCJfc2hvdWxkQXV0b1RyaWdnZXJTZWFyY2giLCJfZ2V0QXBwbHlBdXRvbWF0aWNhbGx5T25WYXJpYW50IiwiZ2V0RXh0ZW5zaW9uQVBJIiwidXBkYXRlQXBwU3RhdGUiLCJvblZhcmlhbnRTYXZlZCIsIm9uU2VhcmNoIiwib01kY0NoYXJ0IiwiZ2V0Q2hhcnRDb250cm9sIiwiYkhpZGVEcmFmdCIsIkZpbHRlclV0aWxzIiwiZ2V0RWRpdFN0YXRlSXNIaWRlRHJhZnQiLCJnZXRDb25kaXRpb25zIiwiX3VwZGF0ZUFMUE5vdEFwcGxpY2FibGVGaWVsZHMiLCJvUGFnZUludGVybmFsTW9kZWxDb250ZXh0Iiwic1RlbXBsYXRlQ29udGVudFZpZXciLCJnZXRQcm9wZXJ0eSIsImdldFBhdGgiLCJDaGFydCIsImhhc1BlbmRpbmdDaGFydENoYW5nZXMiLCJUYWJsZSIsImhhc1BlbmRpbmdUYWJsZUNoYW5nZXMiLCJTdGF0ZVV0aWwiLCJyZXRyaWV2ZUV4dGVybmFsU3RhdGUiLCJ0aGVuIiwib0V4dGVybmFsU3RhdGUiLCJmaWx0ZXJCYXJDb25kaXRpb25zIiwiZmlsdGVyIiwiY2F0Y2giLCJvRXJyb3IiLCJMb2ciLCJlcnJvciIsImdldFZpZXdEYXRhIiwibGl2ZU1vZGUiLCJzeXN0ZW0iLCJwaG9uZSIsIm9EeW5hbWljUGFnZSIsIl9nZXREeW5hbWljTGlzdFJlcG9ydENvbnRyb2wiLCJzZXRIZWFkZXJFeHBhbmRlZCIsIm9uQ2hldnJvblByZXNzTmF2aWdhdGVPdXRCb3VuZCIsIm9Db250cm9sbGVyIiwic091dGJvdW5kVGFyZ2V0Iiwib0NvbnRleHQiLCJzQ3JlYXRlUGF0aCIsIl9pbnRlbnRCYXNlZE5hdmlnYXRpb24iLCJvbkNoYXJ0U2VsZWN0aW9uQ2hhbmdlZCIsImdldENvbnRlbnQiLCJvVGFibGUiLCJfZ2V0VGFibGUiLCJhRGF0YSIsIkNoYXJ0VXRpbHMiLCJzZXRDaGFydEZpbHRlcnMiLCJyZWJpbmQiLCJvblNlZ21lbnRlZEJ1dHRvblByZXNzZWQiLCJzU2VsZWN0ZWRLZXkiLCJtUGFyYW1ldGVycyIsImtleSIsIm9DaGFydCIsIm9TZWdtZW50ZWRCdXR0b25EZWxlZ2F0ZSIsIm9uQWZ0ZXJSZW5kZXJpbmciLCJhSXRlbXMiLCJvU2VnbWVudGVkQnV0dG9uIiwiZ2V0SXRlbXMiLCJmb3JFYWNoIiwib0l0ZW0iLCJnZXRLZXkiLCJmb2N1cyIsInJlbW92ZUV2ZW50RGVsZWdhdGUiLCJfZ2V0U2VnbWVudGVkQnV0dG9uIiwiYWRkRXZlbnREZWxlZ2F0ZSIsIl91cGRhdGVUYWJsZSIsIl91cGRhdGVDaGFydCIsIkh5YnJpZCIsIm9uRmlsdGVyc1NlZ21lbnRlZEJ1dHRvblByZXNzZWQiLCJpc0NvbXBhY3QiLCJzZXRWaXNpYmxlIiwiX2dldFZpc3VhbEZpbHRlckJhckNvbnRyb2wiLCJvblN0YXRlQ2hhbmdlIiwib25EeW5hbWljUGFnZVRpdGxlU3RhdGVDaGFuZ2VkIiwiZmlsdGVyQmFyIiwiZ2V0U2VnbWVudGVkQnV0dG9uIiwiZm9ybWF0dGVycyIsInNldEFMUENvbnRyb2xNZXNzYWdlU3RyaXAiLCJhSWdub3JlZEZpZWxkcyIsImJJc0NoYXJ0Iiwib0FwcGx5U3VwcG9ydGVkIiwic1RleHQiLCJBcnJheSIsImlzQXJyYXkiLCJsZW5ndGgiLCJhSWdub3JlZExhYmVscyIsIk1lc3NhZ2VTdHJpcCIsImdldExhYmVscyIsImRhdGEiLCJvUmVzb3VyY2VCdW5kbGUiLCJiSXNTZWFyY2hJZ25vcmVkIiwiZW5hYmxlU2VhcmNoIiwiZ2V0QUxQVGV4dCIsImdldFRleHQiLCJEZWxlZ2F0ZVV0aWwiLCJnZXRMb2NhbGl6ZWRUZXh0IiwiZXh0ZW5zaW9uQVBJIiwiRXh0ZW5zaW9uQVBJIiwib25Jbml0IiwiUGFnZUNvbnRyb2xsZXIiLCJwcm90b3R5cGUiLCJhcHBseSIsIl9oYXNNdWx0aVZpc3VhbGl6YXRpb25zIiwiYWxwQ29udGVudFZpZXciLCJfZ2V0RGVmYXVsdFBhdGgiLCJkZXNrdG9wIiwiZ2V0QXBwQ29tcG9uZW50IiwiZ2V0Um91dGVyUHJveHkiLCJ3YWl0Rm9yUm91dGVNYXRjaEJlZm9yZU5hdmlnYXRpb24iLCJfc2V0SW5pdExvYWQiLCJvbkV4aXQiLCJkZXN0cm95IiwiYVRhYmxlcyIsIl9nZXRDb250cm9scyIsIkVkaXRTdGF0ZSIsImlzRWRpdFN0YXRlRGlydHkiLCJvVGFibGVCaW5kaW5nIiwiZ2V0Um93QmluZGluZyIsIkNvbW1vblV0aWxzIiwiX2lzRmNsRW5hYmxlZCIsInJlZnJlc2giLCJzVXBkYXRlVGltZXIiLCJmblVwZGF0ZVRhYmxlQWN0aW9ucyIsIl91cGRhdGVUYWJsZUFjdGlvbnMiLCJkZXRhY2hEYXRhUmVjZWl2ZWQiLCJhdHRhY2hEYXRhUmVjZWl2ZWQiLCJzZXRFZGl0U3RhdGVQcm9jZXNzZWQiLCJpbnRlcm5hbE1vZGVsQ29udGV4dCIsInZpZXdJZCIsImdldElkIiwicGFnZVJlYWR5Iiwid2FpdEZvciIsImdldEFwcFN0YXRlSGFuZGxlciIsImFwcGx5QXBwU3RhdGUiLCJvbkJlZm9yZVJlbmRlcmluZyIsImdldE1vZGVsIiwiZ2V0UmVzb3VyY2VCdW5kbGUiLCJyZXNwb25zZSIsInNFbnRpdHlTZXQiLCJlbnRpdHlTZXQiLCJnZXRUcmFuc2xhdGVkVGV4dCIsInVuZGVmaW5lZCIsInNldE5vRGF0YSIsIm9uUGFnZVJlYWR5IiwiZm9yY2VGb2N1cyIsIl9zZXRJbml0aWFsRm9jdXMiLCJnZXRTaGVsbFNlcnZpY2VzIiwic2V0QmFja05hdmlnYXRpb24iLCJvblZpZXdOZWVkc1JlZnJlc2giLCJzbGljZSIsIm9uQWZ0ZXJDbGVhciIsImFJQk5BY3Rpb25zIiwiZ2V0SUJOQWN0aW9ucyIsIm9BY3Rpb25PcGVyYXRpb25BdmFpbGFibGVNYXAiLCJKU09OIiwicGFyc2UiLCJDb21tb25IZWxwZXIiLCJwYXJzZUN1c3RvbURhdGEiLCJnZXRDdXN0b21EYXRhIiwiYVNlbGVjdGVkQ29udGV4dHMiLCJnZXRTZWxlY3RlZENvbnRleHRzIiwiRGVsZXRlSGVscGVyIiwidXBkYXRlRGVsZXRlSW5mb0ZvclNlbGVjdGVkQ29udGV4dHMiLCJBY3Rpb25SdW50aW1lIiwic2V0QWN0aW9uRW5hYmxlbWVudCIsInVwZGF0ZURhdGFGaWVsZEZvcklCTkJ1dHRvbnNWaXNpYmlsaXR5IiwiX3Njcm9sbFRhYmxlc1RvUm93Iiwic1Jvd1BhdGgiLCJUYWJsZVNjcm9sbGVyIiwic2Nyb2xsVGFibGVUb1JvdyIsImR5bmFtaWNQYWdlIiwiaXNIZWFkZXJFeHBhbmRlZCIsImdldEhlYWRlckV4cGFuZGVkIiwiZ2V0U2hvd01lc3NhZ2VzIiwic2V0U2hvd01lc3NhZ2VzIiwiZmlyc3RFbXB0eU1hbmRhdG9yeUZpZWxkIiwiZ2V0RmlsdGVySXRlbXMiLCJmaW5kIiwib0ZpbHRlckl0ZW0iLCJnZXRSZXF1aXJlZCIsIl9pc0luaXRMb2FkRW5hYmxlZCIsImJ5SWQiLCJfZ2V0RmlsdGVyQmFyQ29udHJvbElkIiwiZm9jdXNSb3ciLCJfZ2V0UGFnZVRpdGxlSW5mb3JtYXRpb24iLCJvTWFuaWZlc3RFbnRyeSIsImdldE1hbmlmZXN0RW50cnkiLCJ0aXRsZSIsInN1YnRpdGxlIiwic3ViVGl0bGUiLCJpbnRlbnQiLCJpY29uIiwiX2dldER5bmFtaWNMaXN0UmVwb3J0Q29udHJvbElkIiwiX2dldEFkYXB0YXRpb25GaWx0ZXJCYXJDb250cm9sIiwiYWRhcHRhdGlvbkZpbHRlckJhciIsImdldEluYnVpbHRGaWx0ZXIiLCJnZXRQYXJlbnQiLCJzQ29udHJvbCIsInNTZWdtZW50ZWRCdXR0b25JZCIsIl9nZXRDb250cm9sRnJvbVBhZ2VNb2RlbFByb3BlcnR5Iiwic1BhdGgiLCJjb250cm9sSWQiLCJfZ2V0UGFnZU1vZGVsIiwic1Zpc3VhbEZpbHRlckJhcklkIiwiU3RhYmxlSWRIZWxwZXIiLCJnZW5lcmF0ZSIsIl9nZXRGaWx0ZXJCYXJWYXJpYW50Q29udHJvbCIsIl9pc011bHRpTW9kZSIsIm9Db250cm9sIiwiZ2V0U2VsZWN0ZWRJbm5lckNvbnRyb2wiLCJjb250ZW50IiwiaXNBIiwic0tleSIsImFDb250cm9scyIsIm9UYWJNdWx0aU1vZGUiLCJpbmRleE9mIiwicHVzaCIsImRlZmF1bHRQYXRoIiwiTGlzdFJlcG9ydFRlbXBsYXRpbmciLCJnZXREZWZhdWx0UGF0aCIsImluaXRMb2FkTW9kZSIsImluaXRpYWxMb2FkIiwiRW5hYmxlZCIsIl9kaXNhYmxlSW5pdExvYWQiLCJzZXRTdXNwZW5kU2VsZWN0aW9uIiwiX2FwcGx5QXV0b21hdGljYWxseU9uU3RhbmRhcmRWYXJpYW50IiwidmFyaWFudE1hbmFnZW1lbnRJZCIsImdldFZhcmlhbnRCYWNrUmVmZXJlbmNlIiwidmFyaWFudE1hbmFnZW1lbnQiLCJyZWdpc3RlckFwcGx5QXV0b21hdGljYWxseU9uU3RhbmRhcmRWYXJpYW50IiwiYmluZCIsIl9zZXRTaGFyZU1vZGVsIiwiZm5HZXRVc2VyIiwiT2JqZWN0UGF0aCIsImdldCIsIm9TaGFyZUluZm8iLCJib29rbWFya1RpdGxlIiwiZG9jdW1lbnQiLCJib29rbWFya0N1c3RvbVVybCIsInNIYXNoIiwiaGFzaGVyIiwiZ2V0SGFzaCIsIndpbmRvdyIsImxvY2F0aW9uIiwiaHJlZiIsImlzU2hhcmVJbkphbUFjdGl2ZSIsImlzSmFtQWN0aXZlIiwib1RlbXBsYXRlUHJpdmF0ZU1vZGVsIiwiZ2V0T3duZXJDb21wb25lbnQiLCJtQ2FjaGUiLCJpZ25vcmVkRmllbGRzIiwiYUNoYXJ0cyIsInNDaGFydEVudGl0eVBhdGgiLCJzQ2hhcnRFbnRpdHlTZXQiLCJzQ2FjaGVLZXkiLCJnZXROb3RBcHBsaWNhYmxlRmlsdGVycyIsIl9pc0ZpbHRlckJhckhpZGRlbiIsImhpZGVGaWx0ZXJCYXIiLCJWYXJpYW50TWFuYWdlbWVudCIsInZhcmlhbnRzIiwiZ2V0VmFyaWFudHMiLCJjdXJyZW50VmFyaWFudCIsInZhcmlhbnQiLCJleGVjdXRlT25TZWxlY3QiLCJBdXRvIiwiZ2V0U3RhbmRhcmRWYXJpYW50S2V5IiwiZ2V0Q3VycmVudFZhcmlhbnRLZXkiLCJvQ29uZGl0aW9ucyIsInN0YXJ0c1dpdGgiLCJzdGFuZGFyZFZhcmlhbnQiLCJpc1RhYmxlQm91bmQiLCJvSW5uZXJDaGFydCIsImdldENvbnRyb2xEZWxlZ2F0ZSIsIl9nZXRDaGFydCIsImlzQm91bmQiLCJnZXRCaW5kaW5nSW5mbyJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiTGlzdFJlcG9ydENvbnRyb2xsZXIuY29udHJvbGxlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSBSZXNvdXJjZUJ1bmRsZSBmcm9tIFwic2FwL2Jhc2UvaTE4bi9SZXNvdXJjZUJ1bmRsZVwiO1xuaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgT2JqZWN0UGF0aCBmcm9tIFwic2FwL2Jhc2UvdXRpbC9PYmplY3RQYXRoXCI7XG5pbXBvcnQgdHlwZSBEeW5hbWljUGFnZSBmcm9tIFwic2FwL2YvRHluYW1pY1BhZ2VcIjtcbmltcG9ydCBBY3Rpb25SdW50aW1lIGZyb20gXCJzYXAvZmUvY29yZS9BY3Rpb25SdW50aW1lXCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgSW50ZW50QmFzZWROYXZpZ2F0aW9uIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9JbnRlbnRCYXNlZE5hdmlnYXRpb25cIjtcbmltcG9ydCBJbnRlcm5hbEludGVudEJhc2VkTmF2aWdhdGlvbiBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvSW50ZXJuYWxJbnRlbnRCYXNlZE5hdmlnYXRpb25cIjtcbmltcG9ydCBJbnRlcm5hbFJvdXRpbmcgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL0ludGVybmFsUm91dGluZ1wiO1xuaW1wb3J0IEtQSU1hbmFnZW1lbnQgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL0tQSU1hbmFnZW1lbnRcIjtcbmltcG9ydCBNYXNzRWRpdCBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvTWFzc0VkaXRcIjtcbmltcG9ydCBQbGFjZWhvbGRlciBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvUGxhY2Vob2xkZXJcIjtcbmltcG9ydCBTaGFyZSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvU2hhcmVcIjtcbmltcG9ydCBTaWRlRWZmZWN0cyBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvU2lkZUVmZmVjdHNcIjtcbmltcG9ydCBWaWV3U3RhdGUgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL1ZpZXdTdGF0ZVwiO1xuaW1wb3J0IHR5cGUgRmlsdGVyQmFyIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9scy9GaWx0ZXJCYXJcIjtcbmltcG9ydCB7XG5cdGRlZmluZVVJNUNsYXNzLFxuXHRleHRlbnNpYmxlLFxuXHRmaW5hbEV4dGVuc2lvbixcblx0cHJpdmF0ZUV4dGVuc2lvbixcblx0cHVibGljRXh0ZW5zaW9uLFxuXHR1c2luZ0V4dGVuc2lvblxufSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCBEZWxldGVIZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvRGVsZXRlSGVscGVyXCI7XG5pbXBvcnQgRWRpdFN0YXRlIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0VkaXRTdGF0ZVwiO1xuaW1wb3J0IE1lc3NhZ2VTdHJpcCBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9NZXNzYWdlU3RyaXBcIjtcbmltcG9ydCB7IEludGVybmFsTW9kZWxDb250ZXh0IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTW9kZWxIZWxwZXJcIjtcbmltcG9ydCAqIGFzIFN0YWJsZUlkSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1N0YWJsZUlkSGVscGVyXCI7XG5pbXBvcnQgQ29yZUxpYnJhcnkgZnJvbSBcInNhcC9mZS9jb3JlL2xpYnJhcnlcIjtcbmltcG9ydCBQYWdlQ29udHJvbGxlciBmcm9tIFwic2FwL2ZlL2NvcmUvUGFnZUNvbnRyb2xsZXJcIjtcbmltcG9ydCBDaGFydFV0aWxzIGZyb20gXCJzYXAvZmUvbWFjcm9zL2NoYXJ0L0NoYXJ0VXRpbHNcIjtcbmltcG9ydCBDb21tb25IZWxwZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvQ29tbW9uSGVscGVyXCI7XG5pbXBvcnQgRGVsZWdhdGVVdGlsIGZyb20gXCJzYXAvZmUvbWFjcm9zL0RlbGVnYXRlVXRpbFwiO1xuaW1wb3J0IEZpbHRlclV0aWxzIGZyb20gXCJzYXAvZmUvbWFjcm9zL2ZpbHRlci9GaWx0ZXJVdGlsc1wiO1xuaW1wb3J0IE11bHRpcGxlTW9kZUNvbnRyb2wgZnJvbSBcInNhcC9mZS90ZW1wbGF0ZXMvTGlzdFJlcG9ydC9jb250cm9scy9NdWx0aXBsZU1vZGVDb250cm9sXCI7XG5pbXBvcnQgRXh0ZW5zaW9uQVBJIGZyb20gXCJzYXAvZmUvdGVtcGxhdGVzL0xpc3RSZXBvcnQvRXh0ZW5zaW9uQVBJXCI7XG5pbXBvcnQgVGFibGVTY3JvbGxlciBmcm9tIFwic2FwL2ZlL3RlbXBsYXRlcy9UYWJsZVNjcm9sbGVyXCI7XG5pbXBvcnQgdHlwZSBTZWdtZW50ZWRCdXR0b24gZnJvbSBcInNhcC9tL1NlZ21lbnRlZEJ1dHRvblwiO1xuaW1wb3J0IHR5cGUgQ29udHJvbCBmcm9tIFwic2FwL3VpL2NvcmUvQ29udHJvbFwiO1xuaW1wb3J0IE92ZXJyaWRlRXhlY3V0aW9uIGZyb20gXCJzYXAvdWkvY29yZS9tdmMvT3ZlcnJpZGVFeGVjdXRpb25cIjtcbmltcG9ydCB7IHN5c3RlbSB9IGZyb20gXCJzYXAvdWkvRGV2aWNlXCI7XG5pbXBvcnQgU3RhdGVVdGlsIGZyb20gXCJzYXAvdWkvbWRjL3AxM24vU3RhdGVVdGlsXCI7XG5pbXBvcnQgdHlwZSBUYWJsZSBmcm9tIFwic2FwL3VpL21kYy9UYWJsZVwiO1xuaW1wb3J0IHR5cGUgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcbmltcG9ydCB0eXBlIFJlc291cmNlTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9yZXNvdXJjZS9SZXNvdXJjZU1vZGVsXCI7XG5pbXBvcnQgaGFzaGVyIGZyb20gXCJzYXAvdWkvdGhpcmRwYXJ0eS9oYXNoZXJcIjtcbmltcG9ydCB0eXBlIHsgVjRDb250ZXh0IH0gZnJvbSBcInR5cGVzL2V4dGVuc2lvbl90eXBlc1wiO1xuaW1wb3J0ICogYXMgTGlzdFJlcG9ydFRlbXBsYXRpbmcgZnJvbSBcIi4vTGlzdFJlcG9ydFRlbXBsYXRpbmdcIjtcbmltcG9ydCBJbnRlbnRCYXNlZE5hdmlnYXRpb25PdmVycmlkZSBmcm9tIFwiLi9vdmVycmlkZXMvSW50ZW50QmFzZWROYXZpZ2F0aW9uXCI7XG5pbXBvcnQgU2hhcmVPdmVycmlkZXMgZnJvbSBcIi4vb3ZlcnJpZGVzL1NoYXJlXCI7XG5pbXBvcnQgVmlld1N0YXRlT3ZlcnJpZGVzIGZyb20gXCIuL292ZXJyaWRlcy9WaWV3U3RhdGVcIjtcblxuY29uc3QgVGVtcGxhdGVDb250ZW50VmlldyA9IENvcmVMaWJyYXJ5LlRlbXBsYXRlQ29udGVudFZpZXcsXG5cdEluaXRpYWxMb2FkTW9kZSA9IENvcmVMaWJyYXJ5LkluaXRpYWxMb2FkTW9kZTtcblxuLyoqXG4gKiBDb250cm9sbGVyIGNsYXNzIGZvciB0aGUgbGlzdCByZXBvcnQgcGFnZSwgdXNlZCBpbnNpZGUgYW4gU0FQIEZpb3JpIGVsZW1lbnRzIGFwcGxpY2F0aW9uLlxuICpcbiAqIEBoaWRlY29uc3RydWN0b3JcbiAqIEBwdWJsaWNcbiAqL1xuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLnRlbXBsYXRlcy5MaXN0UmVwb3J0Lkxpc3RSZXBvcnRDb250cm9sbGVyXCIpXG5jbGFzcyBMaXN0UmVwb3J0Q29udHJvbGxlciBleHRlbmRzIFBhZ2VDb250cm9sbGVyIHtcblx0QHVzaW5nRXh0ZW5zaW9uKFxuXHRcdEludGVybmFsUm91dGluZy5vdmVycmlkZSh7XG5cdFx0XHRvbkFmdGVyQmluZGluZzogZnVuY3Rpb24gKHRoaXM6IEludGVybmFsUm91dGluZykge1xuXHRcdFx0XHQodGhpcy5nZXRWaWV3KCkuZ2V0Q29udHJvbGxlcigpIGFzIExpc3RSZXBvcnRDb250cm9sbGVyKS5fb25BZnRlckJpbmRpbmcoKTtcblx0XHRcdH1cblx0XHR9KVxuXHQpXG5cdF9yb3V0aW5nITogSW50ZXJuYWxSb3V0aW5nO1xuXHRAdXNpbmdFeHRlbnNpb24oXG5cdFx0SW50ZXJuYWxJbnRlbnRCYXNlZE5hdmlnYXRpb24ub3ZlcnJpZGUoe1xuXHRcdFx0Z2V0RW50aXR5U2V0OiBmdW5jdGlvbiAodGhpczogSW50ZXJuYWxJbnRlbnRCYXNlZE5hdmlnYXRpb24pIHtcblx0XHRcdFx0cmV0dXJuICh0aGlzLmJhc2UgYXMgTGlzdFJlcG9ydENvbnRyb2xsZXIpLmdldEN1cnJlbnRFbnRpdHlTZXQoKTtcblx0XHRcdH1cblx0XHR9KVxuXHQpXG5cdF9pbnRlbnRCYXNlZE5hdmlnYXRpb24hOiBJbnRlcm5hbEludGVudEJhc2VkTmF2aWdhdGlvbjtcblx0QHVzaW5nRXh0ZW5zaW9uKFNpZGVFZmZlY3RzKVxuXHRzaWRlRWZmZWN0cyE6IFNpZGVFZmZlY3RzO1xuXG5cdEB1c2luZ0V4dGVuc2lvbihJbnRlbnRCYXNlZE5hdmlnYXRpb24ub3ZlcnJpZGUoSW50ZW50QmFzZWROYXZpZ2F0aW9uT3ZlcnJpZGUpKVxuXHRpbnRlbnRCYXNlZE5hdmlnYXRpb24hOiBJbnRlbnRCYXNlZE5hdmlnYXRpb247XG5cblx0QHVzaW5nRXh0ZW5zaW9uKFNoYXJlLm92ZXJyaWRlKFNoYXJlT3ZlcnJpZGVzKSlcblx0c2hhcmUhOiBTaGFyZTtcblxuXHRAdXNpbmdFeHRlbnNpb24oVmlld1N0YXRlLm92ZXJyaWRlKFZpZXdTdGF0ZU92ZXJyaWRlcykpXG5cdHZpZXdTdGF0ZSE6IFZpZXdTdGF0ZTtcblxuXHRAdXNpbmdFeHRlbnNpb24oS1BJTWFuYWdlbWVudClcblx0a3BpTWFuYWdlbWVudCE6IEtQSU1hbmFnZW1lbnQ7XG5cdEB1c2luZ0V4dGVuc2lvbihQbGFjZWhvbGRlcilcblx0cGxhY2Vob2xkZXIhOiBQbGFjZWhvbGRlcjtcblx0QHVzaW5nRXh0ZW5zaW9uKE1hc3NFZGl0KVxuXHRtYXNzRWRpdCE6IE1hc3NFZGl0O1xuXHRwcm90ZWN0ZWQgZXh0ZW5zaW9uQVBJPzogRXh0ZW5zaW9uQVBJO1xuXHRwcml2YXRlIGZpbHRlckJhckNvbmRpdGlvbnM/OiBhbnk7XG5cdHByaXZhdGUgc1VwZGF0ZVRpbWVyPzogYW55O1xuXHRwcml2YXRlIG9SZXNvdXJjZUJ1bmRsZT86IFJlc291cmNlQnVuZGxlO1xuXHRwcml2YXRlIGhhc1BlbmRpbmdDaGFydENoYW5nZXM/OiBib29sZWFuO1xuXHRwcml2YXRlIGhhc1BlbmRpbmdUYWJsZUNoYW5nZXM/OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBHZXQgdGhlIGV4dGVuc2lvbiBBUEkgZm9yIHRoZSBjdXJyZW50IHBhZ2UuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICogQHJldHVybnMgVGhlIGV4dGVuc2lvbiBBUEkuXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0Z2V0RXh0ZW5zaW9uQVBJKCk6IEV4dGVuc2lvbkFQSSB7XG5cdFx0aWYgKCF0aGlzLmV4dGVuc2lvbkFQSSkge1xuXHRcdFx0dGhpcy5leHRlbnNpb25BUEkgPSBuZXcgRXh0ZW5zaW9uQVBJKHRoaXMpO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5leHRlbnNpb25BUEk7XG5cdH1cblxuXHRvbkluaXQoKSB7XG5cdFx0UGFnZUNvbnRyb2xsZXIucHJvdG90eXBlLm9uSW5pdC5hcHBseSh0aGlzKTtcblx0XHRjb25zdCBvSW50ZXJuYWxNb2RlbENvbnRleHQgPSB0aGlzLmdldFZpZXcoKS5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpIGFzIEludGVybmFsTW9kZWxDb250ZXh0O1xuXG5cdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwiaGFzUGVuZGluZ0ZpbHRlcnNcIiwgdHJ1ZSk7XG5cdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwiYXBwbGllZEZpbHRlcnNcIiwgXCJcIik7XG5cdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwiaGlkZURyYWZ0SW5mb1wiLCBmYWxzZSk7XG5cdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwidW9tXCIsIHt9KTtcblx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoXCJzY2FsZWZhY3RvclwiLCB7fSk7XG5cdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwic2NhbGVmYWN0b3JOdW1iZXJcIiwge30pO1xuXHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcImN1cnJlbmN5XCIsIHt9KTtcblxuXHRcdGlmICh0aGlzLl9oYXNNdWx0aVZpc3VhbGl6YXRpb25zKCkpIHtcblx0XHRcdGxldCBhbHBDb250ZW50VmlldyA9IHRoaXMuX2dldERlZmF1bHRQYXRoKCk7XG5cdFx0XHRpZiAoIXN5c3RlbS5kZXNrdG9wICYmIGFscENvbnRlbnRWaWV3ID09PSBUZW1wbGF0ZUNvbnRlbnRWaWV3Lkh5YnJpZCkge1xuXHRcdFx0XHRhbHBDb250ZW50VmlldyA9IFRlbXBsYXRlQ29udGVudFZpZXcuQ2hhcnQ7XG5cdFx0XHR9XG5cdFx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoXCJhbHBDb250ZW50Vmlld1wiLCBhbHBDb250ZW50Vmlldyk7XG5cdFx0fVxuXG5cdFx0Ly8gU3RvcmUgY29uZGl0aW9ucyBmcm9tIGZpbHRlciBiYXJcblx0XHQvLyB0aGlzIGlzIGxhdGVyIHVzZWQgYmVmb3JlIG5hdmlnYXRpb24gdG8gZ2V0IGNvbmRpdGlvbnMgYXBwbGllZCBvbiB0aGUgZmlsdGVyIGJhclxuXHRcdHRoaXMuZmlsdGVyQmFyQ29uZGl0aW9ucyA9IHt9O1xuXG5cdFx0Ly8gQXMgQXBwU3RhdGVIYW5kbGVyLmFwcGx5QXBwU3RhdGUgdHJpZ2dlcnMgYSBuYXZpZ2F0aW9uIHdlIHdhbnQgdG8gbWFrZSBzdXJlIGl0IHdpbGxcblx0XHQvLyBoYXBwZW4gYWZ0ZXIgdGhlIHJvdXRlTWF0Y2ggZXZlbnQgaGFzIGJlZW4gcHJvY2Vzc2VkIChvdGhlcndpc2UgdGhlIHJvdXRlciBnZXRzIGJyb2tlbilcblx0XHR0aGlzLmdldEFwcENvbXBvbmVudCgpLmdldFJvdXRlclByb3h5KCkud2FpdEZvclJvdXRlTWF0Y2hCZWZvcmVOYXZpZ2F0aW9uKCk7XG5cblx0XHQvLyBDb25maWd1cmUgdGhlIGluaXRpYWwgbG9hZCBzZXR0aW5nc1xuXHRcdHRoaXMuX3NldEluaXRMb2FkKCk7XG5cdH1cblxuXHRvbkV4aXQoKSB7XG5cdFx0ZGVsZXRlIHRoaXMuZmlsdGVyQmFyQ29uZGl0aW9ucztcblx0XHRpZiAodGhpcy5leHRlbnNpb25BUEkpIHtcblx0XHRcdHRoaXMuZXh0ZW5zaW9uQVBJLmRlc3Ryb3koKTtcblx0XHR9XG5cdFx0ZGVsZXRlIHRoaXMuZXh0ZW5zaW9uQVBJO1xuXHR9XG5cblx0X29uQWZ0ZXJCaW5kaW5nKCkge1xuXHRcdGNvbnN0IGFUYWJsZXMgPSB0aGlzLl9nZXRDb250cm9scyhcInRhYmxlXCIpO1xuXHRcdGlmIChFZGl0U3RhdGUuaXNFZGl0U3RhdGVEaXJ0eSgpKSB7XG5cdFx0XHR0aGlzLl9nZXRNdWx0aU1vZGVDb250cm9sKCk/LmludmFsaWRhdGVDb250ZW50KCk7XG5cdFx0XHRjb25zdCBvVGFibGVCaW5kaW5nID0gdGhpcy5fZ2V0VGFibGUoKT8uZ2V0Um93QmluZGluZygpO1xuXHRcdFx0aWYgKG9UYWJsZUJpbmRpbmcpIHtcblx0XHRcdFx0aWYgKENvbW1vblV0aWxzLmdldEFwcENvbXBvbmVudCh0aGlzLmdldFZpZXcoKSkuX2lzRmNsRW5hYmxlZCgpKSB7XG5cdFx0XHRcdFx0Ly8gdGhlcmUgaXMgYW4gaXNzdWUgaWYgd2UgdXNlIGEgdGltZW91dCB3aXRoIGEga2VwdCBhbGl2ZSBjb250ZXh0IHVzZWQgb24gYW5vdGhlciBwYWdlXG5cdFx0XHRcdFx0b1RhYmxlQmluZGluZy5yZWZyZXNoKCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0aWYgKCF0aGlzLnNVcGRhdGVUaW1lcikge1xuXHRcdFx0XHRcdFx0dGhpcy5zVXBkYXRlVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdFx0XHRcdFx0b1RhYmxlQmluZGluZy5yZWZyZXNoKCk7XG5cdFx0XHRcdFx0XHRcdGRlbGV0ZSB0aGlzLnNVcGRhdGVUaW1lcjtcblx0XHRcdFx0XHRcdH0sIDApO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdC8vIFVwZGF0ZSBhY3Rpb24gZW5hYmxlbWVudCBhbmQgdmlzaWJpbGl0eSB1cG9uIHRhYmxlIGRhdGEgdXBkYXRlLlxuXHRcdFx0XHRcdGNvbnN0IGZuVXBkYXRlVGFibGVBY3Rpb25zID0gKCkgPT4ge1xuXHRcdFx0XHRcdFx0dGhpcy5fdXBkYXRlVGFibGVBY3Rpb25zKGFUYWJsZXMpO1xuXHRcdFx0XHRcdFx0b1RhYmxlQmluZGluZy5kZXRhY2hEYXRhUmVjZWl2ZWQoZm5VcGRhdGVUYWJsZUFjdGlvbnMpO1xuXHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0b1RhYmxlQmluZGluZy5hdHRhY2hEYXRhUmVjZWl2ZWQoZm5VcGRhdGVUYWJsZUFjdGlvbnMpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRFZGl0U3RhdGUuc2V0RWRpdFN0YXRlUHJvY2Vzc2VkKCk7XG5cdFx0fVxuXG5cdFx0aWYgKCF0aGlzLnNVcGRhdGVUaW1lcikge1xuXHRcdFx0dGhpcy5fdXBkYXRlVGFibGVBY3Rpb25zKGFUYWJsZXMpO1xuXHRcdH1cblxuXHRcdGNvbnN0IGludGVybmFsTW9kZWxDb250ZXh0ID0gdGhpcy5nZXRWaWV3KCkuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSBhcyBJbnRlcm5hbE1vZGVsQ29udGV4dDtcblx0XHRpZiAoIWludGVybmFsTW9kZWxDb250ZXh0LmdldFByb3BlcnR5KFwiaW5pdGlhbFZhcmlhbnRBcHBsaWVkXCIpKSB7XG5cdFx0XHRjb25zdCB2aWV3SWQgPSB0aGlzLmdldFZpZXcoKS5nZXRJZCgpO1xuXHRcdFx0dGhpcy5wYWdlUmVhZHkud2FpdEZvcih0aGlzLmdldEFwcENvbXBvbmVudCgpLmdldEFwcFN0YXRlSGFuZGxlcigpLmFwcGx5QXBwU3RhdGUodmlld0lkLCB0aGlzLmdldFZpZXcoKSkpO1xuXHRcdFx0aW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoXCJpbml0aWFsVmFyaWFudEFwcGxpZWRcIiwgdHJ1ZSk7XG5cdFx0fVxuXHR9XG5cblx0b25CZWZvcmVSZW5kZXJpbmcoKSB7XG5cdFx0UGFnZUNvbnRyb2xsZXIucHJvdG90eXBlLm9uQmVmb3JlUmVuZGVyaW5nLmFwcGx5KHRoaXMpO1xuXHR9XG5cblx0b25BZnRlclJlbmRlcmluZygpIHtcblx0XHQoKHRoaXMuZ2V0VmlldygpLmdldE1vZGVsKFwic2FwLmZlLmkxOG5cIikgYXMgUmVzb3VyY2VNb2RlbCkuZ2V0UmVzb3VyY2VCdW5kbGUoKSBhcyBQcm9taXNlPFJlc291cmNlQnVuZGxlPilcblx0XHRcdC50aGVuKChyZXNwb25zZTogYW55KSA9PiB7XG5cdFx0XHRcdHRoaXMub1Jlc291cmNlQnVuZGxlID0gcmVzcG9uc2U7XG5cdFx0XHRcdGNvbnN0IGFUYWJsZXMgPSB0aGlzLl9nZXRDb250cm9scygpIGFzIFRhYmxlW107XG5cdFx0XHRcdGNvbnN0IHNFbnRpdHlTZXQgPSAodGhpcy5nZXRWaWV3KCkuZ2V0Vmlld0RhdGEoKSBhcyBhbnkpLmVudGl0eVNldDtcblx0XHRcdFx0Y29uc3Qgc1RleHQgPSBDb21tb25VdGlscy5nZXRUcmFuc2xhdGVkVGV4dChcblx0XHRcdFx0XHRcIlRfVEFCTEVfQU5EX0NIQVJUX05PX0RBVEFfVEVYVFwiLFxuXHRcdFx0XHRcdHRoaXMub1Jlc291cmNlQnVuZGxlIGFzIFJlc291cmNlQnVuZGxlLFxuXHRcdFx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdFx0XHRzRW50aXR5U2V0XG5cdFx0XHRcdCk7XG5cdFx0XHRcdGFUYWJsZXMuZm9yRWFjaChmdW5jdGlvbiAob1RhYmxlOiBUYWJsZSkge1xuXHRcdFx0XHRcdG9UYWJsZS5zZXROb0RhdGEoc1RleHQpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24gKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIHJldHJpZXZpbmcgdGhlIHJlc291cmNlIGJ1bmRsZVwiLCBvRXJyb3IpO1xuXHRcdFx0fSk7XG5cdH1cblxuXHRAcHJpdmF0ZUV4dGVuc2lvbigpXG5cdEBleHRlbnNpYmxlKE92ZXJyaWRlRXhlY3V0aW9uLkFmdGVyKVxuXHRvblBhZ2VSZWFkeShtUGFyYW1ldGVyczogYW55KSB7XG5cdFx0aWYgKG1QYXJhbWV0ZXJzLmZvcmNlRm9jdXMpIHtcblx0XHRcdHRoaXMuX3NldEluaXRpYWxGb2N1cygpO1xuXHRcdH1cblx0XHQvLyBSZW1vdmUgdGhlIGhhbmRsZXIgb24gYmFjayBuYXZpZ2F0aW9uIHRoYXQgZGlzcGxheXMgRHJhZnQgY29uZmlybWF0aW9uXG5cdFx0dGhpcy5nZXRBcHBDb21wb25lbnQoKS5nZXRTaGVsbFNlcnZpY2VzKCkuc2V0QmFja05hdmlnYXRpb24odW5kZWZpbmVkKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBNZXRob2QgY2FsbGVkIHdoZW4gdGhlIGNvbnRlbnQgb2YgYSBjdXN0b20gdmlldyB1c2VkIGluIGEgbGlzdCByZXBvcnQgbmVlZHMgdG8gYmUgcmVmcmVzaGVkLlxuXHQgKiBUaGlzIGhhcHBlbnMgZWl0aGVyIHdoZW4gdGhlcmUgaXMgYSBjaGFuZ2Ugb24gdGhlIEZpbHRlckJhciBhbmQgdGhlIHNlYXJjaCBpcyB0cmlnZ2VyZWQsXG5cdCAqIG9yIHdoZW4gYSB0YWIgd2l0aCBjdXN0b20gY29udGVudCBpcyBzZWxlY3RlZC5cblx0ICogVGhpcyBtZXRob2QgY2FuIGJlIG92ZXJ3cml0dGVuIGJ5IHRoZSBjb250cm9sbGVyIGV4dGVuc2lvbiBpbiBjYXNlIG9mIGN1c3RvbWl6YXRpb24uXG5cdCAqXG5cdCAqIEBwYXJhbSBtUGFyYW1ldGVycyBNYXAgY29udGFpbmluZyB0aGUgZmlsdGVyIGNvbmRpdGlvbnMgb2YgdGhlIEZpbHRlckJhciwgdGhlIGN1cnJlbnRUYWJJRFxuXHQgKiBhbmQgdGhlIHZpZXcgcmVmcmVzaCBjYXVzZSAodGFiQ2hhbmdlZCBvciBzZWFyY2gpLlxuXHQgKiBUaGUgbWFwIGxvb2tzIGxpa2UgdGhpczpcblx0ICogPGNvZGU+PHByZT5cblx0ICogXHR7XG5cdCAqIFx0XHRmaWx0ZXJDb25kaXRpb25zOiB7XG5cdCAqIFx0XHRcdENvdW50cnk6IFtcblx0ICogXHRcdFx0XHR7XG5cdCAqIFx0XHRcdFx0XHRvcGVyYXRvcjogXCJFUVwiXG5cdCAqXHRcdFx0XHRcdHZhbGlkYXRlZDogXCJOb3RWYWxpZGF0ZWRcIlxuXHQgKlx0XHRcdFx0XHR2YWx1ZXM6IFtcIkdlcm1hbnlcIiwgLi4uXVxuXHQgKiBcdFx0XHRcdH0sXG5cdCAqIFx0XHRcdFx0Li4uXG5cdCAqIFx0XHRcdF1cblx0ICogXHRcdFx0Li4uXG5cdCAqIFx0XHR9LFxuXHQgKlx0XHRjdXJyZW50VGFiSWQ6IFwiZmU6OkN1c3RvbVRhYjo6dGFiMVwiLFxuXHQgKlx0XHRyZWZyZXNoQ2F1c2U6IFwidGFiQ2hhbmdlZFwiIHwgXCJzZWFyY2hcIlxuXHQgKlx0fVxuXHQgKiA8L3ByZT48L2NvZGU+XG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZXh0ZW5zaWJsZShPdmVycmlkZUV4ZWN1dGlvbi5BZnRlcilcblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuXHRvblZpZXdOZWVkc1JlZnJlc2gobVBhcmFtZXRlcnM6IGFueSkge1xuXHRcdC8qIFRvIGJlIG92ZXJyaWRlbiAqL1xuXHR9XG5cblx0LyoqXG5cdCAqIE1ldGhvZCBjYWxsZWQgd2hlbiBhIGZpbHRlciBvciBzZWFyY2ggdmFsdWUgaGFzIGJlZW4gY2hhbmdlZCBpbiB0aGUgRmlsdGVyQmFyLFxuXHQgKiBidXQgaGFzIG5vdCBiZWVuIHZhbGlkYXRlZCB5ZXQgYnkgdGhlIGVuZCB1c2VyICh3aXRoIHRoZSAnR28nIG9yICdTZWFyY2gnIGJ1dHRvbikuXG5cdCAqIFR5cGljYWxseSwgdGhlIGNvbnRlbnQgb2YgdGhlIGN1cnJlbnQgdGFiIGlzIGdyZXllZCBvdXQgdW50aWwgdGhlIGZpbHRlcnMgYXJlIHZhbGlkYXRlZC5cblx0ICogVGhpcyBtZXRob2QgY2FuIGJlIG92ZXJ3cml0dGVuIGJ5IHRoZSBjb250cm9sbGVyIGV4dGVuc2lvbiBpbiBjYXNlIG9mIGN1c3RvbWl6YXRpb24uXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZXh0ZW5zaWJsZShPdmVycmlkZUV4ZWN1dGlvbi5BZnRlcilcblx0b25QZW5kaW5nRmlsdGVycygpIHtcblx0XHQvKiBUbyBiZSBvdmVycmlkZW4gKi9cblx0fVxuXG5cdGdldEN1cnJlbnRFbnRpdHlTZXQoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX2dldFRhYmxlKCk/LmRhdGEoXCJ0YXJnZXRDb2xsZWN0aW9uUGF0aFwiKS5zbGljZSgxKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBNZXRob2QgY2FsbGVkIHdoZW4gdGhlICdDbGVhcicgYnV0dG9uIG9uIHRoZSBGaWx0ZXJCYXIgaXMgcHJlc3NlZC5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBleHRlbnNpYmxlKE92ZXJyaWRlRXhlY3V0aW9uLkFmdGVyKVxuXHRvbkFmdGVyQ2xlYXIoKSB7XG5cdFx0LyogVG8gYmUgb3ZlcnJpZGVuICovXG5cdH1cblxuXHQvKipcblx0ICogVGhpcyBtZXRob2QgaW5pdGlhdGVzIHRoZSB1cGRhdGUgb2YgdGhlIGVuYWJsZWQgc3RhdGUgb2YgdGhlIERhdGFGaWVsZEZvckFjdGlvbiBhbmQgdGhlIHZpc2libGUgc3RhdGUgb2YgdGhlIERhdGFGaWVsZEZvcklCTiBidXR0b25zLlxuXHQgKlxuXHQgKiBAcGFyYW0gYVRhYmxlcyBBcnJheSBvZiB0YWJsZXMgaW4gdGhlIGxpc3QgcmVwb3J0XG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfdXBkYXRlVGFibGVBY3Rpb25zKGFUYWJsZXM6IGFueSkge1xuXHRcdGxldCBhSUJOQWN0aW9uczogYW55W10gPSBbXTtcblx0XHRhVGFibGVzLmZvckVhY2goZnVuY3Rpb24gKG9UYWJsZTogYW55KSB7XG5cdFx0XHRhSUJOQWN0aW9ucyA9IENvbW1vblV0aWxzLmdldElCTkFjdGlvbnMob1RhYmxlLCBhSUJOQWN0aW9ucyk7XG5cdFx0XHQvLyBVcGRhdGUgJ2VuYWJsZWQnIHByb3BlcnR5IG9mIERhdGFGaWVsZEZvckFjdGlvbiBidXR0b25zIG9uIHRhYmxlIHRvb2xiYXJcblx0XHRcdC8vIFRoZSBzYW1lIGlzIGFsc28gcGVyZm9ybWVkIG9uIFRhYmxlIHNlbGVjdGlvbkNoYW5nZSBldmVudFxuXHRcdFx0Y29uc3Qgb0ludGVybmFsTW9kZWxDb250ZXh0ID0gb1RhYmxlLmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIiksXG5cdFx0XHRcdG9BY3Rpb25PcGVyYXRpb25BdmFpbGFibGVNYXAgPSBKU09OLnBhcnNlKFxuXHRcdFx0XHRcdENvbW1vbkhlbHBlci5wYXJzZUN1c3RvbURhdGEoRGVsZWdhdGVVdGlsLmdldEN1c3RvbURhdGEob1RhYmxlLCBcIm9wZXJhdGlvbkF2YWlsYWJsZU1hcFwiKSlcblx0XHRcdFx0KSxcblx0XHRcdFx0YVNlbGVjdGVkQ29udGV4dHMgPSBvVGFibGUuZ2V0U2VsZWN0ZWRDb250ZXh0cygpO1xuXG5cdFx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoXCJzZWxlY3RlZENvbnRleHRzXCIsIGFTZWxlY3RlZENvbnRleHRzKTtcblx0XHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcIm51bWJlck9mU2VsZWN0ZWRDb250ZXh0c1wiLCBhU2VsZWN0ZWRDb250ZXh0cy5sZW5ndGgpO1xuXHRcdFx0Ly8gUmVmcmVzaCBlbmFibGVtZW50IG9mIGRlbGV0ZSBidXR0b25cblx0XHRcdERlbGV0ZUhlbHBlci51cGRhdGVEZWxldGVJbmZvRm9yU2VsZWN0ZWRDb250ZXh0cyhvSW50ZXJuYWxNb2RlbENvbnRleHQsIGFTZWxlY3RlZENvbnRleHRzKTtcblxuXHRcdFx0QWN0aW9uUnVudGltZS5zZXRBY3Rpb25FbmFibGVtZW50KG9JbnRlcm5hbE1vZGVsQ29udGV4dCwgb0FjdGlvbk9wZXJhdGlvbkF2YWlsYWJsZU1hcCwgYVNlbGVjdGVkQ29udGV4dHMsIFwidGFibGVcIik7XG5cdFx0fSk7XG5cdFx0Q29tbW9uVXRpbHMudXBkYXRlRGF0YUZpZWxkRm9ySUJOQnV0dG9uc1Zpc2liaWxpdHkoYUlCTkFjdGlvbnMsIHRoaXMuZ2V0VmlldygpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGlzIG1ldGhvZCBzY3JvbGxzIHRvIGEgc3BlY2lmaWMgcm93IG9uIGFsbCB0aGUgYXZhaWxhYmxlIHRhYmxlcy5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIHNhcC5mZS50ZW1wbGF0ZXMuTGlzdFJlcG9ydC5MaXN0UmVwb3J0Q29udHJvbGxlci5jb250cm9sbGVyI19zY3JvbGxUYWJsZXNUb1Jvd1xuXHQgKiBAcGFyYW0gc1Jvd1BhdGggVGhlIHBhdGggb2YgdGhlIHRhYmxlIHJvdyBjb250ZXh0IHRvIGJlIHNjcm9sbGVkIHRvXG5cdCAqL1xuXHRfc2Nyb2xsVGFibGVzVG9Sb3coc1Jvd1BhdGg6IHN0cmluZykge1xuXHRcdHRoaXMuX2dldENvbnRyb2xzKFwidGFibGVcIikuZm9yRWFjaChmdW5jdGlvbiAob1RhYmxlOiBhbnkpIHtcblx0XHRcdFRhYmxlU2Nyb2xsZXIuc2Nyb2xsVGFibGVUb1JvdyhvVGFibGUsIHNSb3dQYXRoKTtcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGlzIG1ldGhvZCBzZXQgdGhlIGluaXRpYWwgZm9jdXMgd2l0aGluIHRoZSBMaXN0IFJlcG9ydCBhY2NvcmRpbmcgdG8gdGhlIFVYIGd1aWRlIGxpbmVzLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgc2FwLmZlLnRlbXBsYXRlcy5MaXN0UmVwb3J0Lkxpc3RSZXBvcnRDb250cm9sbGVyLmNvbnRyb2xsZXIjX3NldEluaXRpYWxGb2N1c1xuXHQgKi9cblx0X3NldEluaXRpYWxGb2N1cygpIHtcblx0XHRjb25zdCBkeW5hbWljUGFnZSA9IHRoaXMuX2dldER5bmFtaWNMaXN0UmVwb3J0Q29udHJvbCgpLFxuXHRcdFx0aXNIZWFkZXJFeHBhbmRlZCA9IGR5bmFtaWNQYWdlLmdldEhlYWRlckV4cGFuZGVkKCksXG5cdFx0XHRmaWx0ZXJCYXIgPSB0aGlzLl9nZXRGaWx0ZXJCYXJDb250cm9sKCkgYXMgYW55O1xuXHRcdGlmIChmaWx0ZXJCYXIpIHtcblx0XHRcdGlmIChpc0hlYWRlckV4cGFuZGVkKSB7XG5cdFx0XHRcdC8vRW5hYmxpbmcgbWFuZGF0b3J5IGZpbHRlciBmaWVsZHMgbWVzc2FnZSBkaWFsb2dcblx0XHRcdFx0aWYgKCFmaWx0ZXJCYXIuZ2V0U2hvd01lc3NhZ2VzKCkpIHtcblx0XHRcdFx0XHRmaWx0ZXJCYXIuc2V0U2hvd01lc3NhZ2VzKHRydWUpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNvbnN0IGZpcnN0RW1wdHlNYW5kYXRvcnlGaWVsZCA9IGZpbHRlckJhci5nZXRGaWx0ZXJJdGVtcygpLmZpbmQoZnVuY3Rpb24gKG9GaWx0ZXJJdGVtOiBhbnkpIHtcblx0XHRcdFx0XHRyZXR1cm4gb0ZpbHRlckl0ZW0uZ2V0UmVxdWlyZWQoKSAmJiBvRmlsdGVySXRlbS5nZXRDb25kaXRpb25zKCkubGVuZ3RoID09PSAwO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0Ly9Gb2N1c2luZyBvbiB0aGUgZmlyc3QgZW1wdHkgbWFuZGF0b3J5IGZpbHRlciBmaWVsZCwgb3Igb24gdGhlIGZpcnN0IGZpbHRlciBmaWVsZCBpZiB0aGUgdGFibGUgZGF0YSBpcyBsb2FkZWRcblx0XHRcdFx0aWYgKGZpcnN0RW1wdHlNYW5kYXRvcnlGaWVsZCkge1xuXHRcdFx0XHRcdGZpcnN0RW1wdHlNYW5kYXRvcnlGaWVsZC5mb2N1cygpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKHRoaXMuX2lzSW5pdExvYWRFbmFibGVkKCkgJiYgZmlsdGVyQmFyLmdldEZpbHRlckl0ZW1zKCkubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdC8vQkNQOiAyMzgwMDA4NDA2IEFkZCBjaGVjayBmb3IgYXZhaWxhYmxlIGZpbHRlckl0ZW1zXG5cdFx0XHRcdFx0ZmlsdGVyQmFyLmdldEZpbHRlckl0ZW1zKClbMF0uZm9jdXMoKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvL0ZvY3VzaW5nIG9uIHRoZSBHbyBidXR0b25cblx0XHRcdFx0XHR0aGlzLmdldFZpZXcoKS5ieUlkKGAke3RoaXMuX2dldEZpbHRlckJhckNvbnRyb2xJZCgpfS1idG5TZWFyY2hgKT8uZm9jdXMoKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmICh0aGlzLl9pc0luaXRMb2FkRW5hYmxlZCgpKSB7XG5cdFx0XHRcdHRoaXMuX2dldFRhYmxlKCk/LmZvY3VzUm93KDApO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLl9nZXRUYWJsZSgpPy5mb2N1c1JvdygwKTtcblx0XHR9XG5cdH1cblxuXHRfZ2V0UGFnZVRpdGxlSW5mb3JtYXRpb24oKSB7XG5cdFx0Y29uc3Qgb01hbmlmZXN0RW50cnkgPSB0aGlzLmdldEFwcENvbXBvbmVudCgpLmdldE1hbmlmZXN0RW50cnkoXCJzYXAuYXBwXCIpO1xuXHRcdHJldHVybiB7XG5cdFx0XHR0aXRsZTogb01hbmlmZXN0RW50cnkudGl0bGUsXG5cdFx0XHRzdWJ0aXRsZTogb01hbmlmZXN0RW50cnkuc3ViVGl0bGUgfHwgXCJcIixcblx0XHRcdGludGVudDogXCJcIixcblx0XHRcdGljb246IFwiXCJcblx0XHR9O1xuXHR9XG5cblx0X2dldEZpbHRlckJhckNvbnRyb2woKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0VmlldygpLmJ5SWQodGhpcy5fZ2V0RmlsdGVyQmFyQ29udHJvbElkKCkpIGFzIEZpbHRlckJhcjtcblx0fVxuXG5cdF9nZXREeW5hbWljTGlzdFJlcG9ydENvbnRyb2woKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0VmlldygpLmJ5SWQodGhpcy5fZ2V0RHluYW1pY0xpc3RSZXBvcnRDb250cm9sSWQoKSkgYXMgRHluYW1pY1BhZ2U7XG5cdH1cblxuXHRfZ2V0QWRhcHRhdGlvbkZpbHRlckJhckNvbnRyb2woKSB7XG5cdFx0Ly8gSWYgdGhlIGFkYXB0YXRpb24gZmlsdGVyIGJhciBpcyBwYXJ0IG9mIHRoZSBET00gdHJlZSwgdGhlIFwiQWRhcHQgRmlsdGVyXCIgZGlhbG9nIGlzIG9wZW4sXG5cdFx0Ly8gYW5kIHdlIHJldHVybiB0aGUgYWRhcHRhdGlvbiBmaWx0ZXIgYmFyIGFzIGFuIGFjdGl2ZSBjb250cm9sICh2aXNpYmxlIGZvciB0aGUgdXNlcilcblx0XHRjb25zdCBhZGFwdGF0aW9uRmlsdGVyQmFyID0gKHRoaXMuX2dldEZpbHRlckJhckNvbnRyb2woKSBhcyBhbnkpLmdldEluYnVpbHRGaWx0ZXIoKTtcblx0XHRyZXR1cm4gYWRhcHRhdGlvbkZpbHRlckJhcj8uZ2V0UGFyZW50KCkgPyBhZGFwdGF0aW9uRmlsdGVyQmFyIDogdW5kZWZpbmVkO1xuXHR9XG5cblx0X2dldFNlZ21lbnRlZEJ1dHRvbihzQ29udHJvbDogYW55KSB7XG5cdFx0Y29uc3Qgc1NlZ21lbnRlZEJ1dHRvbklkID0gKHNDb250cm9sID09PSBcIkNoYXJ0XCIgPyB0aGlzLmdldENoYXJ0Q29udHJvbCgpIDogdGhpcy5fZ2V0VGFibGUoKSk/LmRhdGEoXCJzZWdtZW50ZWRCdXR0b25JZFwiKTtcblx0XHRyZXR1cm4gdGhpcy5nZXRWaWV3KCkuYnlJZChzU2VnbWVudGVkQnV0dG9uSWQpO1xuXHR9XG5cblx0X2dldENvbnRyb2xGcm9tUGFnZU1vZGVsUHJvcGVydHkoc1BhdGg6IHN0cmluZykge1xuXHRcdGNvbnN0IGNvbnRyb2xJZCA9IHRoaXMuX2dldFBhZ2VNb2RlbCgpPy5nZXRQcm9wZXJ0eShzUGF0aCk7XG5cdFx0cmV0dXJuIGNvbnRyb2xJZCAmJiB0aGlzLmdldFZpZXcoKS5ieUlkKGNvbnRyb2xJZCk7XG5cdH1cblxuXHRfZ2V0RHluYW1pY0xpc3RSZXBvcnRDb250cm9sSWQoKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gdGhpcy5fZ2V0UGFnZU1vZGVsKCk/LmdldFByb3BlcnR5KFwiL2R5bmFtaWNMaXN0UmVwb3J0SWRcIikgfHwgXCJcIjtcblx0fVxuXG5cdF9nZXRGaWx0ZXJCYXJDb250cm9sSWQoKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gdGhpcy5fZ2V0UGFnZU1vZGVsKCk/LmdldFByb3BlcnR5KFwiL2ZpbHRlckJhcklkXCIpIHx8IFwiXCI7XG5cdH1cblxuXHRnZXRDaGFydENvbnRyb2woKSB7XG5cdFx0cmV0dXJuIHRoaXMuX2dldENvbnRyb2xGcm9tUGFnZU1vZGVsUHJvcGVydHkoXCIvc2luZ2xlQ2hhcnRJZFwiKTtcblx0fVxuXG5cdF9nZXRWaXN1YWxGaWx0ZXJCYXJDb250cm9sKCkge1xuXHRcdGNvbnN0IHNWaXN1YWxGaWx0ZXJCYXJJZCA9IFN0YWJsZUlkSGVscGVyLmdlbmVyYXRlKFtcInZpc3VhbEZpbHRlclwiLCB0aGlzLl9nZXRGaWx0ZXJCYXJDb250cm9sSWQoKV0pO1xuXHRcdHJldHVybiBzVmlzdWFsRmlsdGVyQmFySWQgJiYgdGhpcy5nZXRWaWV3KCkuYnlJZChzVmlzdWFsRmlsdGVyQmFySWQpO1xuXHR9XG5cdF9nZXRGaWx0ZXJCYXJWYXJpYW50Q29udHJvbCgpIHtcblx0XHRyZXR1cm4gdGhpcy5fZ2V0Q29udHJvbEZyb21QYWdlTW9kZWxQcm9wZXJ0eShcIi92YXJpYW50TWFuYWdlbWVudC9pZFwiKTtcblx0fVxuXG5cdF9nZXRNdWx0aU1vZGVDb250cm9sKCkge1xuXHRcdHJldHVybiB0aGlzLmdldFZpZXcoKS5ieUlkKFwiZmU6OlRhYk11bHRpcGxlTW9kZTo6Q29udHJvbFwiKSBhcyBNdWx0aXBsZU1vZGVDb250cm9sO1xuXHR9XG5cblx0X2dldFRhYmxlKCk6IFRhYmxlIHwgdW5kZWZpbmVkIHtcblx0XHRpZiAodGhpcy5faXNNdWx0aU1vZGUoKSkge1xuXHRcdFx0Y29uc3Qgb0NvbnRyb2wgPSB0aGlzLl9nZXRNdWx0aU1vZGVDb250cm9sKCk/LmdldFNlbGVjdGVkSW5uZXJDb250cm9sKCk/LmNvbnRlbnQ7XG5cdFx0XHRyZXR1cm4gb0NvbnRyb2w/LmlzQShcInNhcC51aS5tZGMuVGFibGVcIikgPyAob0NvbnRyb2wgYXMgVGFibGUpIDogdW5kZWZpbmVkO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fZ2V0Q29udHJvbEZyb21QYWdlTW9kZWxQcm9wZXJ0eShcIi9zaW5nbGVUYWJsZUlkXCIpIGFzIFRhYmxlO1xuXHRcdH1cblx0fVxuXHRfZ2V0Q29udHJvbHMoc0tleT86IGFueSkge1xuXHRcdGlmICh0aGlzLl9pc011bHRpTW9kZSgpKSB7XG5cdFx0XHRjb25zdCBhQ29udHJvbHM6IGFueVtdID0gW107XG5cdFx0XHRjb25zdCBvVGFiTXVsdGlNb2RlID0gdGhpcy5fZ2V0TXVsdGlNb2RlQ29udHJvbCgpLmNvbnRlbnQ7XG5cdFx0XHRvVGFiTXVsdGlNb2RlLmdldEl0ZW1zKCkuZm9yRWFjaCgob0l0ZW06IGFueSkgPT4ge1xuXHRcdFx0XHRjb25zdCBvQ29udHJvbCA9IHRoaXMuZ2V0VmlldygpLmJ5SWQob0l0ZW0uZ2V0S2V5KCkpO1xuXHRcdFx0XHRpZiAob0NvbnRyb2wgJiYgc0tleSkge1xuXHRcdFx0XHRcdGlmIChvSXRlbS5nZXRLZXkoKS5pbmRleE9mKGBmZTo6JHtzS2V5fWApID4gLTEpIHtcblx0XHRcdFx0XHRcdGFDb250cm9scy5wdXNoKG9Db250cm9sKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSBpZiAob0NvbnRyb2wgIT09IHVuZGVmaW5lZCAmJiBvQ29udHJvbCAhPT0gbnVsbCkge1xuXHRcdFx0XHRcdGFDb250cm9scy5wdXNoKG9Db250cm9sKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm4gYUNvbnRyb2xzO1xuXHRcdH0gZWxzZSBpZiAoc0tleSA9PT0gXCJDaGFydFwiKSB7XG5cdFx0XHRjb25zdCBvQ2hhcnQgPSB0aGlzLmdldENoYXJ0Q29udHJvbCgpO1xuXHRcdFx0cmV0dXJuIG9DaGFydCA/IFtvQ2hhcnRdIDogW107XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnN0IG9UYWJsZSA9IHRoaXMuX2dldFRhYmxlKCk7XG5cdFx0XHRyZXR1cm4gb1RhYmxlID8gW29UYWJsZV0gOiBbXTtcblx0XHR9XG5cdH1cblxuXHRfZ2V0RGVmYXVsdFBhdGgoKSB7XG5cdFx0Y29uc3QgZGVmYXVsdFBhdGggPSBMaXN0UmVwb3J0VGVtcGxhdGluZy5nZXREZWZhdWx0UGF0aCh0aGlzLl9nZXRQYWdlTW9kZWwoKT8uZ2V0UHJvcGVydHkoXCIvdmlld3NcIikgfHwgW10pO1xuXHRcdHN3aXRjaCAoZGVmYXVsdFBhdGgpIHtcblx0XHRcdGNhc2UgXCJwcmltYXJ5XCI6XG5cdFx0XHRcdHJldHVybiBUZW1wbGF0ZUNvbnRlbnRWaWV3LkNoYXJ0O1xuXHRcdFx0Y2FzZSBcInNlY29uZGFyeVwiOlxuXHRcdFx0XHRyZXR1cm4gVGVtcGxhdGVDb250ZW50Vmlldy5UYWJsZTtcblx0XHRcdGNhc2UgXCJib3RoXCI6XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gVGVtcGxhdGVDb250ZW50Vmlldy5IeWJyaWQ7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIE1ldGhvZCB0byBrbm93IGlmIExpc3RSZXBvcnQgaXMgY29uZmlndXJlZCB3aXRoIE11bHRpcGxlIFRhYmxlIG1vZGUuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBfaXNNdWx0aU1vZGVcblx0ICogQHJldHVybnMgSXMgTXVsdGlwbGUgVGFibGUgbW9kZSBzZXQ/XG5cdCAqL1xuXHRfaXNNdWx0aU1vZGUoKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuICEhdGhpcy5fZ2V0UGFnZU1vZGVsKCk/LmdldFByb3BlcnR5KFwiL211bHRpVmlld3NDb250cm9sXCIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIE1ldGhvZCB0byBrbm93IGlmIExpc3RSZXBvcnQgaXMgY29uZmlndXJlZCB0byBsb2FkIGRhdGEgYXQgc3RhcnQgdXAuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBfaXNJbml0TG9hZERpc2FibGVkXG5cdCAqIEByZXR1cm5zIElzIEluaXRMb2FkIGVuYWJsZWQ/XG5cdCAqL1xuXHRfaXNJbml0TG9hZEVuYWJsZWQoKTogYm9vbGVhbiB7XG5cdFx0Y29uc3QgaW5pdExvYWRNb2RlID0gKHRoaXMuZ2V0VmlldygpLmdldFZpZXdEYXRhKCkgYXMgYW55KS5pbml0aWFsTG9hZDtcblx0XHRyZXR1cm4gaW5pdExvYWRNb2RlID09PSBJbml0aWFsTG9hZE1vZGUuRW5hYmxlZDtcblx0fVxuXG5cdF9oYXNNdWx0aVZpc3VhbGl6YXRpb25zKCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLl9nZXRQYWdlTW9kZWwoKT8uZ2V0UHJvcGVydHkoXCIvaGFzTXVsdGlWaXN1YWxpemF0aW9uc1wiKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gc3VzcGVuZCBzZWFyY2ggb24gdGhlIGZpbHRlciBiYXIuIFRoZSBpbml0aWFsIGxvYWRpbmcgb2YgZGF0YSBpcyBkaXNhYmxlZCBiYXNlZCBvbiB0aGUgbWFuaWZlc3QgY29uZmlndXJhdGlvbiBJbml0TG9hZCAtIERpc2FibGVkL0F1dG8uXG5cdCAqIEl0IGlzIGVuYWJsZWQgbGF0ZXIgd2hlbiB0aGUgdmlldyBzdGF0ZSBpcyBzZXQsIHdoZW4gaXQgaXMgcG9zc2libGUgdG8gcmVhbGl6ZSBpZiB0aGVyZSBhcmUgZGVmYXVsdCBmaWx0ZXJzLlxuXHQgKi9cblx0X2Rpc2FibGVJbml0TG9hZCgpIHtcblx0XHRjb25zdCBmaWx0ZXJCYXIgPSB0aGlzLl9nZXRGaWx0ZXJCYXJDb250cm9sKCk7XG5cdFx0Ly8gY2hlY2sgZm9yIGZpbHRlciBiYXIgaGlkZGVuXG5cdFx0aWYgKGZpbHRlckJhcikge1xuXHRcdFx0ZmlsdGVyQmFyLnNldFN1c3BlbmRTZWxlY3Rpb24odHJ1ZSk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIE1ldGhvZCBjYWxsZWQgYnkgZmxleCB0byBkZXRlcm1pbmUgaWYgdGhlIGFwcGx5QXV0b21hdGljYWxseSBzZXR0aW5nIG9uIHRoZSB2YXJpYW50IGlzIHZhbGlkLlxuXHQgKiBDYWxsZWQgb25seSBmb3IgU3RhbmRhcmQgVmFyaWFudCBhbmQgb25seSB3aGVuIHRoZXJlIGlzIGRpc3BsYXkgdGV4dCBzZXQgZm9yIGFwcGx5QXV0b21hdGljYWxseSAoRkUgb25seSBzZXRzIGl0IGZvciBBdXRvKS5cblx0ICpcblx0ICogQHJldHVybnMgQm9vbGVhbiB0cnVlIGlmIGRhdGEgc2hvdWxkIGJlIGxvYWRlZCBhdXRvbWF0aWNhbGx5LCBmYWxzZSBvdGhlcndpc2Vcblx0ICovXG5cdF9hcHBseUF1dG9tYXRpY2FsbHlPblN0YW5kYXJkVmFyaWFudCgpIHtcblx0XHQvLyBXZSBhbHdheXMgcmV0dXJuIGZhbHNlIGFuZCB0YWtlIGNhcmUgb2YgaXQgd2hlbiB2aWV3IHN0YXRlIGlzIHNldFxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb25maWd1cmUgdGhlIHNldHRpbmdzIGZvciBpbml0aWFsIGxvYWQgYmFzZWQgb25cblx0ICogLSBtYW5pZmVzdCBzZXR0aW5nIGluaXRMb2FkIC0gRW5hYmxlZC9EaXNhYmxlZC9BdXRvXG5cdCAqIC0gdXNlcidzIHNldHRpbmcgb2YgYXBwbHlBdXRvbWF0aWNhbGx5IG9uIHZhcmlhbnRcblx0ICogLSBpZiB0aGVyZSBhcmUgZGVmYXVsdCBmaWx0ZXJzXG5cdCAqIFdlIGRpc2FibGUgdGhlIGZpbHRlciBiYXIgc2VhcmNoIGF0IHRoZSBiZWdpbm5pbmcgYW5kIGVuYWJsZSBpdCB3aGVuIHZpZXcgc3RhdGUgaXMgc2V0LlxuXHQgKi9cblx0X3NldEluaXRMb2FkKCkge1xuXHRcdC8vIGlmIGluaXRMb2FkIGlzIERpc2FibGVkIG9yIEF1dG8sIHN3aXRjaCBvZmYgZmlsdGVyIGJhciBzZWFyY2ggdGVtcG9yYXJpbHkgYXQgc3RhcnRcblx0XHRpZiAoIXRoaXMuX2lzSW5pdExvYWRFbmFibGVkKCkpIHtcblx0XHRcdHRoaXMuX2Rpc2FibGVJbml0TG9hZCgpO1xuXHRcdH1cblx0XHQvLyBzZXQgaG9vayBmb3IgZmxleCBmb3Igd2hlbiBzdGFuZGFyZCB2YXJpYW50IGlzIHNldCAoYXQgc3RhcnQgb3IgYnkgdXNlciBhdCBydW50aW1lKVxuXHRcdC8vIHJlcXVpcmVkIHRvIG92ZXJyaWRlIHRoZSB1c2VyIHNldHRpbmcgJ2FwcGx5IGF1dG9tYXRpY2FsbHknIGJlaGF2aW91ciBpZiB0aGVyZSBhcmUgbm8gZmlsdGVyc1xuXHRcdGNvbnN0IHZhcmlhbnRNYW5hZ2VtZW50SWQ6IGFueSA9IExpc3RSZXBvcnRUZW1wbGF0aW5nLmdldFZhcmlhbnRCYWNrUmVmZXJlbmNlKHRoaXMuZ2V0VmlldygpLmdldFZpZXdEYXRhKCksIHRoaXMuX2dldFBhZ2VNb2RlbCgpKTtcblx0XHRjb25zdCB2YXJpYW50TWFuYWdlbWVudCA9IHZhcmlhbnRNYW5hZ2VtZW50SWQgJiYgdGhpcy5nZXRWaWV3KCkuYnlJZCh2YXJpYW50TWFuYWdlbWVudElkKTtcblx0XHRpZiAodmFyaWFudE1hbmFnZW1lbnQpIHtcblx0XHRcdHZhcmlhbnRNYW5hZ2VtZW50LnJlZ2lzdGVyQXBwbHlBdXRvbWF0aWNhbGx5T25TdGFuZGFyZFZhcmlhbnQodGhpcy5fYXBwbHlBdXRvbWF0aWNhbGx5T25TdGFuZGFyZFZhcmlhbnQuYmluZCh0aGlzKSk7XG5cdFx0fVxuXHR9XG5cblx0X3NldFNoYXJlTW9kZWwoKSB7XG5cdFx0Ly8gVE9ETzogZGVhY3RpdmF0ZWQgZm9yIG5vdyAtIGN1cnJlbnRseSB0aGVyZSBpcyBubyBfdGVtcGxQcml2IGFueW1vcmUsIHRvIGJlIGRpc2N1c3NlZFxuXHRcdC8vIHRoaXMgbWV0aG9kIGlzIGN1cnJlbnRseSBub3QgY2FsbGVkIGFueW1vcmUgZnJvbSB0aGUgaW5pdCBtZXRob2RcblxuXHRcdGNvbnN0IGZuR2V0VXNlciA9IE9iamVjdFBhdGguZ2V0KFwic2FwLnVzaGVsbC5Db250YWluZXIuZ2V0VXNlclwiKTtcblx0XHQvL3ZhciBvTWFuaWZlc3QgPSB0aGlzLmdldE93bmVyQ29tcG9uZW50KCkuZ2V0QXBwQ29tcG9uZW50KCkuZ2V0TWV0YWRhdGEoKS5nZXRNYW5pZmVzdEVudHJ5KFwic2FwLnVpXCIpO1xuXHRcdC8vdmFyIHNCb29rbWFya0ljb24gPSAob01hbmlmZXN0ICYmIG9NYW5pZmVzdC5pY29ucyAmJiBvTWFuaWZlc3QuaWNvbnMuaWNvbikgfHwgXCJcIjtcblxuXHRcdC8vc2hhcmVNb2RlbDogSG9sZHMgYWxsIHRoZSBzaGFyaW5nIHJlbGV2YW50IGluZm9ybWF0aW9uIGFuZCBpbmZvIHVzZWQgaW4gWE1MIHZpZXdcblx0XHRjb25zdCBvU2hhcmVJbmZvID0ge1xuXHRcdFx0Ym9va21hcmtUaXRsZTogZG9jdW1lbnQudGl0bGUsIC8vVG8gbmFtZSB0aGUgYm9va21hcmsgYWNjb3JkaW5nIHRvIHRoZSBhcHAgdGl0bGUuXG5cdFx0XHRib29rbWFya0N1c3RvbVVybDogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRjb25zdCBzSGFzaCA9IGhhc2hlci5nZXRIYXNoKCk7XG5cdFx0XHRcdHJldHVybiBzSGFzaCA/IGAjJHtzSGFzaH1gIDogd2luZG93LmxvY2F0aW9uLmhyZWY7XG5cdFx0XHR9LFxuXHRcdFx0Lypcblx0XHRcdFx0XHRcdFx0VG8gYmUgYWN0aXZhdGVkIG9uY2UgdGhlIEZMUCBzaG93cyB0aGUgY291bnQgLSBzZWUgY29tbWVudCBhYm92ZVxuXHRcdFx0XHRcdFx0XHRib29rbWFya1NlcnZpY2VVcmw6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHRcdC8vdmFyIG9UYWJsZSA9IG9UYWJsZS5nZXRJbm5lclRhYmxlKCk7IG9UYWJsZSBpcyBhbHJlYWR5IHRoZSBzYXAuZmUgdGFibGUgKGJ1dCBub3QgdGhlIGlubmVyIG9uZSlcblx0XHRcdFx0XHRcdFx0XHQvLyB3ZSBzaG91bGQgdXNlIHRhYmxlLmdldExpc3RCaW5kaW5nSW5mbyBpbnN0ZWFkIG9mIHRoZSBiaW5kaW5nXG5cdFx0XHRcdFx0XHRcdFx0dmFyIG9CaW5kaW5nID0gb1RhYmxlLmdldEJpbmRpbmcoXCJyb3dzXCIpIHx8IG9UYWJsZS5nZXRCaW5kaW5nKFwiaXRlbXNcIik7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIG9CaW5kaW5nID8gZm5HZXREb3dubG9hZFVybChvQmluZGluZykgOiBcIlwiO1xuXHRcdFx0XHRcdFx0XHR9LCovXG5cdFx0XHRpc1NoYXJlSW5KYW1BY3RpdmU6ICEhZm5HZXRVc2VyICYmIGZuR2V0VXNlcigpLmlzSmFtQWN0aXZlKClcblx0XHR9O1xuXG5cdFx0Y29uc3Qgb1RlbXBsYXRlUHJpdmF0ZU1vZGVsID0gdGhpcy5nZXRPd25lckNvbXBvbmVudCgpLmdldE1vZGVsKFwiX3RlbXBsUHJpdlwiKSBhcyBKU09OTW9kZWw7XG5cdFx0b1RlbXBsYXRlUHJpdmF0ZU1vZGVsLnNldFByb3BlcnR5KFwiL2xpc3RSZXBvcnQvc2hhcmVcIiwgb1NoYXJlSW5mbyk7XG5cdH1cblxuXHQvKipcblx0ICogTWV0aG9kIHRvIHVwZGF0ZSB0aGUgbG9jYWwgVUkgbW9kZWwgb2YgdGhlIHBhZ2Ugd2l0aCB0aGUgZmllbGRzIHRoYXQgYXJlIG5vdCBhcHBsaWNhYmxlIHRvIHRoZSBmaWx0ZXIgYmFyICh0aGlzIGlzIHNwZWNpZmljIHRvIHRoZSBBTFAgc2NlbmFyaW8pLlxuXHQgKlxuXHQgKiBAcGFyYW0gb0ludGVybmFsTW9kZWxDb250ZXh0IFRoZSBpbnRlcm5hbCBtb2RlbCBjb250ZXh0XG5cdCAqIEBwYXJhbSBvRmlsdGVyQmFyIE1EQyBmaWx0ZXIgYmFyXG5cdCAqL1xuXHRfdXBkYXRlQUxQTm90QXBwbGljYWJsZUZpZWxkcyhvSW50ZXJuYWxNb2RlbENvbnRleHQ6IEludGVybmFsTW9kZWxDb250ZXh0LCBvRmlsdGVyQmFyOiBGaWx0ZXJCYXIpIHtcblx0XHRjb25zdCBtQ2FjaGU6IGFueSA9IHt9O1xuXHRcdGNvbnN0IGlnbm9yZWRGaWVsZHM6IGFueSA9IHt9LFxuXHRcdFx0YVRhYmxlcyA9IHRoaXMuX2dldENvbnRyb2xzKFwidGFibGVcIiksXG5cdFx0XHRhQ2hhcnRzID0gdGhpcy5fZ2V0Q29udHJvbHMoXCJDaGFydFwiKTtcblxuXHRcdGlmICghYVRhYmxlcy5sZW5ndGggfHwgIWFDaGFydHMubGVuZ3RoKSB7XG5cdFx0XHQvLyBJZiB0aGVyZSdzIG5vdCBhIHRhYmxlIGFuZCBhIGNoYXJ0LCB3ZSdyZSBub3QgaW4gdGhlIEFMUCBjYXNlXG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gRm9yIHRoZSBtb21lbnQsIHRoZXJlJ3Mgbm90aGluZyBmb3IgdGFibGVzLi4uXG5cdFx0YUNoYXJ0cy5mb3JFYWNoKGZ1bmN0aW9uIChvQ2hhcnQ6IGFueSkge1xuXHRcdFx0Y29uc3Qgc0NoYXJ0RW50aXR5UGF0aCA9IG9DaGFydC5kYXRhKFwidGFyZ2V0Q29sbGVjdGlvblBhdGhcIiksXG5cdFx0XHRcdHNDaGFydEVudGl0eVNldCA9IHNDaGFydEVudGl0eVBhdGguc2xpY2UoMSksXG5cdFx0XHRcdHNDYWNoZUtleSA9IGAke3NDaGFydEVudGl0eVNldH1DaGFydGA7XG5cdFx0XHRpZiAoIW1DYWNoZVtzQ2FjaGVLZXldKSB7XG5cdFx0XHRcdG1DYWNoZVtzQ2FjaGVLZXldID0gRmlsdGVyVXRpbHMuZ2V0Tm90QXBwbGljYWJsZUZpbHRlcnMob0ZpbHRlckJhciwgb0NoYXJ0KTtcblx0XHRcdH1cblx0XHRcdGlnbm9yZWRGaWVsZHNbc0NhY2hlS2V5XSA9IG1DYWNoZVtzQ2FjaGVLZXldO1xuXHRcdH0pO1xuXHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcImNvbnRyb2xzL2lnbm9yZWRGaWVsZHNcIiwgaWdub3JlZEZpZWxkcyk7XG5cdH1cblxuXHRfaXNGaWx0ZXJCYXJIaWRkZW4oKSB7XG5cdFx0cmV0dXJuICh0aGlzLmdldFZpZXcoKS5nZXRWaWV3RGF0YSgpIGFzIGFueSkuaGlkZUZpbHRlckJhcjtcblx0fVxuXG5cdF9nZXRBcHBseUF1dG9tYXRpY2FsbHlPblZhcmlhbnQoVmFyaWFudE1hbmFnZW1lbnQ6IGFueSwga2V5OiBzdHJpbmcpOiBCb29sZWFuIHtcblx0XHRpZiAoIVZhcmlhbnRNYW5hZ2VtZW50IHx8ICFrZXkpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0Y29uc3QgdmFyaWFudHMgPSBWYXJpYW50TWFuYWdlbWVudC5nZXRWYXJpYW50cygpO1xuXHRcdGNvbnN0IGN1cnJlbnRWYXJpYW50ID0gdmFyaWFudHMuZmluZChmdW5jdGlvbiAodmFyaWFudDogYW55KSB7XG5cdFx0XHRyZXR1cm4gdmFyaWFudCAmJiB2YXJpYW50LmtleSA9PT0ga2V5O1xuXHRcdH0pO1xuXHRcdHJldHVybiAoY3VycmVudFZhcmlhbnQgJiYgY3VycmVudFZhcmlhbnQuZXhlY3V0ZU9uU2VsZWN0KSB8fCBmYWxzZTtcblx0fVxuXG5cdF9zaG91bGRBdXRvVHJpZ2dlclNlYXJjaChvVk06IGFueSkge1xuXHRcdGlmIChcblx0XHRcdCh0aGlzLmdldFZpZXcoKS5nZXRWaWV3RGF0YSgpIGFzIGFueSkuaW5pdGlhbExvYWQgPT09IEluaXRpYWxMb2FkTW9kZS5BdXRvICYmXG5cdFx0XHQoIW9WTSB8fCBvVk0uZ2V0U3RhbmRhcmRWYXJpYW50S2V5KCkgPT09IG9WTS5nZXRDdXJyZW50VmFyaWFudEtleSgpKVxuXHRcdCkge1xuXHRcdFx0Y29uc3Qgb0ZpbHRlckJhciA9IHRoaXMuX2dldEZpbHRlckJhckNvbnRyb2woKTtcblx0XHRcdGlmIChvRmlsdGVyQmFyKSB7XG5cdFx0XHRcdGNvbnN0IG9Db25kaXRpb25zID0gb0ZpbHRlckJhci5nZXRDb25kaXRpb25zKCk7XG5cdFx0XHRcdGZvciAoY29uc3Qgc0tleSBpbiBvQ29uZGl0aW9ucykge1xuXHRcdFx0XHRcdC8vIGlnbm9yZSBmaWx0ZXJzIHN0YXJ0aW5nIHdpdGggJCAoZS5nLiAkc2VhcmNoLCAkZWRpdFN0YXRlKVxuXHRcdFx0XHRcdGlmICghc0tleS5zdGFydHNXaXRoKFwiJFwiKSAmJiBBcnJheS5pc0FycmF5KG9Db25kaXRpb25zW3NLZXldKSAmJiBvQ29uZGl0aW9uc1tzS2V5XS5sZW5ndGgpIHtcblx0XHRcdFx0XHRcdC8vIGxvYWQgZGF0YSBhcyBwZXIgdXNlcidzIHNldHRpbmcgb2YgYXBwbHlBdXRvbWF0aWNhbGx5IG9uIHRoZSB2YXJpYW50XG5cdFx0XHRcdFx0XHRjb25zdCBzdGFuZGFyZFZhcmlhbnQ6IGFueSA9IG9WTS5nZXRWYXJpYW50cygpLmZpbmQoKHZhcmlhbnQ6IGFueSkgPT4ge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gdmFyaWFudC5rZXkgPT09IG9WTS5nZXRDdXJyZW50VmFyaWFudEtleSgpO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRyZXR1cm4gc3RhbmRhcmRWYXJpYW50ICYmIHN0YW5kYXJkVmFyaWFudC5leGVjdXRlT25TZWxlY3Q7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdF91cGRhdGVUYWJsZShvVGFibGU6IGFueSkge1xuXHRcdGlmICghb1RhYmxlLmlzVGFibGVCb3VuZCgpIHx8IHRoaXMuaGFzUGVuZGluZ0NoYXJ0Q2hhbmdlcykge1xuXHRcdFx0b1RhYmxlLnJlYmluZCgpO1xuXHRcdFx0dGhpcy5oYXNQZW5kaW5nQ2hhcnRDaGFuZ2VzID0gZmFsc2U7XG5cdFx0fVxuXHR9XG5cblx0X3VwZGF0ZUNoYXJ0KG9DaGFydDogYW55KSB7XG5cdFx0Y29uc3Qgb0lubmVyQ2hhcnQgPSBvQ2hhcnQuZ2V0Q29udHJvbERlbGVnYXRlKCkuX2dldENoYXJ0KG9DaGFydCk7XG5cdFx0aWYgKCEob0lubmVyQ2hhcnQgJiYgb0lubmVyQ2hhcnQuaXNCb3VuZChcImRhdGFcIikpIHx8IHRoaXMuaGFzUGVuZGluZ1RhYmxlQ2hhbmdlcykge1xuXHRcdFx0b0NoYXJ0LmdldENvbnRyb2xEZWxlZ2F0ZSgpLnJlYmluZChvQ2hhcnQsIG9Jbm5lckNoYXJ0LmdldEJpbmRpbmdJbmZvKFwiZGF0YVwiKSk7XG5cdFx0XHR0aGlzLmhhc1BlbmRpbmdUYWJsZUNoYW5nZXMgPSBmYWxzZTtcblx0XHR9XG5cdH1cblxuXHRoYW5kbGVycyA9IHtcblx0XHRvbkZpbHRlclNlYXJjaCh0aGlzOiBMaXN0UmVwb3J0Q29udHJvbGxlcikge1xuXHRcdFx0dGhpcy5fZ2V0RmlsdGVyQmFyQ29udHJvbCgpLnRyaWdnZXJTZWFyY2goKTtcblx0XHR9LFxuXHRcdG9uRmlsdGVyc0NoYW5nZWQodGhpczogTGlzdFJlcG9ydENvbnRyb2xsZXIsIG9FdmVudDogYW55KSB7XG5cdFx0XHRjb25zdCBvRmlsdGVyQmFyID0gdGhpcy5fZ2V0RmlsdGVyQmFyQ29udHJvbCgpO1xuXHRcdFx0aWYgKG9GaWx0ZXJCYXIpIHtcblx0XHRcdFx0Y29uc3Qgb0ludGVybmFsTW9kZWxDb250ZXh0ID0gdGhpcy5nZXRWaWV3KCkuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSBhcyBJbnRlcm5hbE1vZGVsQ29udGV4dDtcblx0XHRcdFx0Ly8gUGVuZGluZyBmaWx0ZXJzIGludG8gRmlsdGVyQmFyIHRvIGJlIHVzZWQgZm9yIGN1c3RvbSB2aWV3c1xuXHRcdFx0XHR0aGlzLm9uUGVuZGluZ0ZpbHRlcnMoKTtcblx0XHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwiYXBwbGllZEZpbHRlcnNcIiwgb0ZpbHRlckJhci5nZXRBc3NpZ25lZEZpbHRlcnNUZXh0KCkuZmlsdGVyc1RleHQpO1xuXHRcdFx0XHRpZiAob0V2ZW50LmdldFBhcmFtZXRlcihcImNvbmRpdGlvbnNCYXNlZFwiKSkge1xuXHRcdFx0XHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcImhhc1BlbmRpbmdGaWx0ZXJzXCIsIHRydWUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRvblZhcmlhbnRTZWxlY3RlZCh0aGlzOiBMaXN0UmVwb3J0Q29udHJvbGxlciwgb0V2ZW50OiBhbnkpIHtcblx0XHRcdGNvbnN0IG9WTSA9IG9FdmVudC5nZXRTb3VyY2UoKTtcblx0XHRcdGNvbnN0IGN1cnJlbnRWYXJpYW50S2V5ID0gb0V2ZW50LmdldFBhcmFtZXRlcihcImtleVwiKTtcblx0XHRcdGNvbnN0IG9NdWx0aU1vZGVDb250cm9sID0gdGhpcy5fZ2V0TXVsdGlNb2RlQ29udHJvbCgpO1xuXG5cdFx0XHRvTXVsdGlNb2RlQ29udHJvbD8uaW52YWxpZGF0ZUNvbnRlbnQoKTtcblx0XHRcdG9NdWx0aU1vZGVDb250cm9sPy5zZXRGcmVlemVDb250ZW50KHRydWUpO1xuXG5cdFx0XHQvLyBzZXRUaW1lb3V0IGNhdXNlIHRoZSB2YXJpYW50IG5lZWRzIHRvIGJlIGFwcGxpZWQgYmVmb3JlIGp1ZGdpbmcgdGhlIGF1dG8gc2VhcmNoIG9yIHVwZGF0aW5nIHRoZSBhcHAgc3RhdGVcblx0XHRcdHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0XHRpZiAodGhpcy5fc2hvdWxkQXV0b1RyaWdnZXJTZWFyY2gob1ZNKSkge1xuXHRcdFx0XHRcdC8vIHRoZSBhcHAgc3RhdGUgd2lsbCBiZSB1cGRhdGVkIHZpYSBvblNlYXJjaCBoYW5kbGVyXG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuX2dldEZpbHRlckJhckNvbnRyb2woKS50cmlnZ2VyU2VhcmNoKCk7XG5cdFx0XHRcdH0gZWxzZSBpZiAoIXRoaXMuX2dldEFwcGx5QXV0b21hdGljYWxseU9uVmFyaWFudChvVk0sIGN1cnJlbnRWYXJpYW50S2V5KSkge1xuXHRcdFx0XHRcdHRoaXMuZ2V0RXh0ZW5zaW9uQVBJKCkudXBkYXRlQXBwU3RhdGUoKTtcblx0XHRcdFx0fVxuXHRcdFx0fSwgMCk7XG5cdFx0fSxcblx0XHRvblZhcmlhbnRTYXZlZCh0aGlzOiBMaXN0UmVwb3J0Q29udHJvbGxlcikge1xuXHRcdFx0Ly9UT0RPOiBTaG91bGQgcmVtb3ZlIHRoaXMgc2V0VGltZU91dCBvbmNlIFZhcmlhbnQgTWFuYWdlbWVudCBwcm92aWRlcyBhbiBhcGkgdG8gZmV0Y2ggdGhlIGN1cnJlbnQgdmFyaWFudCBrZXkgb24gc2F2ZSEhIVxuXHRcdFx0c2V0VGltZW91dCgoKSA9PiB7XG5cdFx0XHRcdHRoaXMuZ2V0RXh0ZW5zaW9uQVBJKCkudXBkYXRlQXBwU3RhdGUoKTtcblx0XHRcdH0sIDEwMDApO1xuXHRcdH0sXG5cdFx0b25TZWFyY2godGhpczogTGlzdFJlcG9ydENvbnRyb2xsZXIpIHtcblx0XHRcdGNvbnN0IG9GaWx0ZXJCYXIgPSB0aGlzLl9nZXRGaWx0ZXJCYXJDb250cm9sKCk7XG5cdFx0XHRjb25zdCBvSW50ZXJuYWxNb2RlbENvbnRleHQgPSB0aGlzLmdldFZpZXcoKS5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpIGFzIEludGVybmFsTW9kZWxDb250ZXh0O1xuXHRcdFx0Y29uc3Qgb01kY0NoYXJ0ID0gdGhpcy5nZXRDaGFydENvbnRyb2woKTtcblx0XHRcdGNvbnN0IGJIaWRlRHJhZnQgPSBGaWx0ZXJVdGlscy5nZXRFZGl0U3RhdGVJc0hpZGVEcmFmdChvRmlsdGVyQmFyLmdldENvbmRpdGlvbnMoKSk7XG5cdFx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoXCJoYXNQZW5kaW5nRmlsdGVyc1wiLCBmYWxzZSk7XG5cdFx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoXCJoaWRlRHJhZnRJbmZvXCIsIGJIaWRlRHJhZnQpO1xuXG5cdFx0XHRpZiAoIXRoaXMuX2dldE11bHRpTW9kZUNvbnRyb2woKSkge1xuXHRcdFx0XHR0aGlzLl91cGRhdGVBTFBOb3RBcHBsaWNhYmxlRmllbGRzKG9JbnRlcm5hbE1vZGVsQ29udGV4dCwgb0ZpbHRlckJhcik7XG5cdFx0XHR9XG5cdFx0XHRpZiAob01kY0NoYXJ0KSB7XG5cdFx0XHRcdC8vIGRpc2FibGUgYm91bmQgYWN0aW9ucyBUT0RPOiB0aGlzIGNsZWFycyBldmVyeXRoaW5nIGZvciB0aGUgY2hhcnQ/XG5cdFx0XHRcdChvTWRjQ2hhcnQuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSBhcyBJbnRlcm5hbE1vZGVsQ29udGV4dCkuc2V0UHJvcGVydHkoXCJcIiwge30pO1xuXG5cdFx0XHRcdGNvbnN0IG9QYWdlSW50ZXJuYWxNb2RlbENvbnRleHQgPSBvTWRjQ2hhcnQuZ2V0QmluZGluZ0NvbnRleHQoXCJwYWdlSW50ZXJuYWxcIikgYXMgSW50ZXJuYWxNb2RlbENvbnRleHQ7XG5cdFx0XHRcdGNvbnN0IHNUZW1wbGF0ZUNvbnRlbnRWaWV3ID0gb1BhZ2VJbnRlcm5hbE1vZGVsQ29udGV4dC5nZXRQcm9wZXJ0eShgJHtvUGFnZUludGVybmFsTW9kZWxDb250ZXh0LmdldFBhdGgoKX0vYWxwQ29udGVudFZpZXdgKTtcblx0XHRcdFx0aWYgKHNUZW1wbGF0ZUNvbnRlbnRWaWV3ID09PSBUZW1wbGF0ZUNvbnRlbnRWaWV3LkNoYXJ0KSB7XG5cdFx0XHRcdFx0dGhpcy5oYXNQZW5kaW5nQ2hhcnRDaGFuZ2VzID0gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoc1RlbXBsYXRlQ29udGVudFZpZXcgPT09IFRlbXBsYXRlQ29udGVudFZpZXcuVGFibGUpIHtcblx0XHRcdFx0XHR0aGlzLmhhc1BlbmRpbmdUYWJsZUNoYW5nZXMgPSB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHQvLyBzdG9yZSBmaWx0ZXIgYmFyIGNvbmRpdGlvbnMgdG8gdXNlIGxhdGVyIHdoaWxlIG5hdmlnYXRpb25cblx0XHRcdFN0YXRlVXRpbC5yZXRyaWV2ZUV4dGVybmFsU3RhdGUob0ZpbHRlckJhcilcblx0XHRcdFx0LnRoZW4oKG9FeHRlcm5hbFN0YXRlOiBhbnkpID0+IHtcblx0XHRcdFx0XHR0aGlzLmZpbHRlckJhckNvbmRpdGlvbnMgPSBvRXh0ZXJuYWxTdGF0ZS5maWx0ZXI7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5jYXRjaChmdW5jdGlvbiAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSByZXRyaWV2aW5nIHRoZSBleHRlcm5hbCBzdGF0ZVwiLCBvRXJyb3IpO1xuXHRcdFx0XHR9KTtcblx0XHRcdGlmICgodGhpcy5nZXRWaWV3KCkuZ2V0Vmlld0RhdGEoKSBhcyBhbnkpLmxpdmVNb2RlID09PSBmYWxzZSkge1xuXHRcdFx0XHR0aGlzLmdldEV4dGVuc2lvbkFQSSgpLnVwZGF0ZUFwcFN0YXRlKCk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChzeXN0ZW0ucGhvbmUpIHtcblx0XHRcdFx0Y29uc3Qgb0R5bmFtaWNQYWdlID0gdGhpcy5fZ2V0RHluYW1pY0xpc3RSZXBvcnRDb250cm9sKCk7XG5cdFx0XHRcdG9EeW5hbWljUGFnZS5zZXRIZWFkZXJFeHBhbmRlZChmYWxzZSk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHQvKipcblx0XHQgKiBUcmlnZ2VycyBhbiBvdXRib3VuZCBuYXZpZ2F0aW9uIHdoZW4gYSB1c2VyIGNob29zZXMgdGhlIGNoZXZyb24uXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gb0NvbnRyb2xsZXJcblx0XHQgKiBAcGFyYW0gc091dGJvdW5kVGFyZ2V0IE5hbWUgb2YgdGhlIG91dGJvdW5kIHRhcmdldCAobmVlZHMgdG8gYmUgZGVmaW5lZCBpbiB0aGUgbWFuaWZlc3QpXG5cdFx0ICogQHBhcmFtIG9Db250ZXh0IFRoZSBjb250ZXh0IHRoYXQgY29udGFpbnMgdGhlIGRhdGEgZm9yIHRoZSB0YXJnZXQgYXBwXG5cdFx0ICogQHBhcmFtIHNDcmVhdGVQYXRoIENyZWF0ZSBwYXRoIHdoZW4gdGhlIGNoZXZyb24gaXMgY3JlYXRlZC5cblx0XHQgKiBAcmV0dXJucyBQcm9taXNlIHdoaWNoIGlzIHJlc29sdmVkIG9uY2UgdGhlIG5hdmlnYXRpb24gaXMgdHJpZ2dlcmVkXG5cdFx0ICogQHVpNS1yZXN0cmljdGVkXG5cdFx0ICogQGZpbmFsXG5cdFx0ICovXG5cdFx0b25DaGV2cm9uUHJlc3NOYXZpZ2F0ZU91dEJvdW5kKFxuXHRcdFx0b0NvbnRyb2xsZXI6IExpc3RSZXBvcnRDb250cm9sbGVyLFxuXHRcdFx0c091dGJvdW5kVGFyZ2V0OiBzdHJpbmcsXG5cdFx0XHRvQ29udGV4dDogVjRDb250ZXh0LFxuXHRcdFx0c0NyZWF0ZVBhdGg6IHN0cmluZ1xuXHRcdCkge1xuXHRcdFx0cmV0dXJuIG9Db250cm9sbGVyLl9pbnRlbnRCYXNlZE5hdmlnYXRpb24ub25DaGV2cm9uUHJlc3NOYXZpZ2F0ZU91dEJvdW5kKG9Db250cm9sbGVyLCBzT3V0Ym91bmRUYXJnZXQsIG9Db250ZXh0LCBzQ3JlYXRlUGF0aCk7XG5cdFx0fSxcblx0XHRvbkNoYXJ0U2VsZWN0aW9uQ2hhbmdlZCh0aGlzOiBMaXN0UmVwb3J0Q29udHJvbGxlciwgb0V2ZW50OiBhbnkpIHtcblx0XHRcdGNvbnN0IG9NZGNDaGFydCA9IG9FdmVudC5nZXRTb3VyY2UoKS5nZXRDb250ZW50KCksXG5cdFx0XHRcdG9UYWJsZSA9IHRoaXMuX2dldFRhYmxlKCksXG5cdFx0XHRcdGFEYXRhID0gb0V2ZW50LmdldFBhcmFtZXRlcihcImRhdGFcIiksXG5cdFx0XHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dCA9IHRoaXMuZ2V0VmlldygpLmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIikgYXMgSW50ZXJuYWxNb2RlbENvbnRleHQ7XG5cdFx0XHRpZiAoYURhdGEpIHtcblx0XHRcdFx0Q2hhcnRVdGlscy5zZXRDaGFydEZpbHRlcnMob01kY0NoYXJ0KTtcblx0XHRcdH1cblx0XHRcdGNvbnN0IHNUZW1wbGF0ZUNvbnRlbnRWaWV3ID0gb0ludGVybmFsTW9kZWxDb250ZXh0LmdldFByb3BlcnR5KGAke29JbnRlcm5hbE1vZGVsQ29udGV4dC5nZXRQYXRoKCl9L2FscENvbnRlbnRWaWV3YCk7XG5cdFx0XHRpZiAoc1RlbXBsYXRlQ29udGVudFZpZXcgPT09IFRlbXBsYXRlQ29udGVudFZpZXcuQ2hhcnQpIHtcblx0XHRcdFx0dGhpcy5oYXNQZW5kaW5nQ2hhcnRDaGFuZ2VzID0gdHJ1ZTtcblx0XHRcdH0gZWxzZSBpZiAob1RhYmxlKSB7XG5cdFx0XHRcdChvVGFibGUgYXMgYW55KS5yZWJpbmQoKTtcblx0XHRcdFx0dGhpcy5oYXNQZW5kaW5nQ2hhcnRDaGFuZ2VzID0gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRvblNlZ21lbnRlZEJ1dHRvblByZXNzZWQodGhpczogTGlzdFJlcG9ydENvbnRyb2xsZXIsIG9FdmVudDogYW55KSB7XG5cdFx0XHRjb25zdCBzU2VsZWN0ZWRLZXkgPSBvRXZlbnQubVBhcmFtZXRlcnMua2V5ID8gb0V2ZW50Lm1QYXJhbWV0ZXJzLmtleSA6IG51bGw7XG5cdFx0XHRjb25zdCBvSW50ZXJuYWxNb2RlbENvbnRleHQgPSB0aGlzLmdldFZpZXcoKS5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpIGFzIEludGVybmFsTW9kZWxDb250ZXh0O1xuXHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwiYWxwQ29udGVudFZpZXdcIiwgc1NlbGVjdGVkS2V5KTtcblx0XHRcdGNvbnN0IG9DaGFydCA9IHRoaXMuZ2V0Q2hhcnRDb250cm9sKCk7XG5cdFx0XHRjb25zdCBvVGFibGUgPSB0aGlzLl9nZXRUYWJsZSgpO1xuXHRcdFx0Y29uc3Qgb1NlZ21lbnRlZEJ1dHRvbkRlbGVnYXRlID0ge1xuXHRcdFx0XHRvbkFmdGVyUmVuZGVyaW5nKCkge1xuXHRcdFx0XHRcdGNvbnN0IGFJdGVtcyA9IG9TZWdtZW50ZWRCdXR0b24uZ2V0SXRlbXMoKTtcblx0XHRcdFx0XHRhSXRlbXMuZm9yRWFjaChmdW5jdGlvbiAob0l0ZW06IGFueSkge1xuXHRcdFx0XHRcdFx0aWYgKG9JdGVtLmdldEtleSgpID09PSBzU2VsZWN0ZWRLZXkpIHtcblx0XHRcdFx0XHRcdFx0b0l0ZW0uZm9jdXMoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRvU2VnbWVudGVkQnV0dG9uLnJlbW92ZUV2ZW50RGVsZWdhdGUob1NlZ21lbnRlZEJ1dHRvbkRlbGVnYXRlKTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHRcdGNvbnN0IG9TZWdtZW50ZWRCdXR0b24gPSAoXG5cdFx0XHRcdHNTZWxlY3RlZEtleSA9PT0gVGVtcGxhdGVDb250ZW50Vmlldy5UYWJsZSA/IHRoaXMuX2dldFNlZ21lbnRlZEJ1dHRvbihcIlRhYmxlXCIpIDogdGhpcy5fZ2V0U2VnbWVudGVkQnV0dG9uKFwiQ2hhcnRcIilcblx0XHRcdCkgYXMgU2VnbWVudGVkQnV0dG9uO1xuXHRcdFx0aWYgKG9TZWdtZW50ZWRCdXR0b24gIT09IG9FdmVudC5nZXRTb3VyY2UoKSkge1xuXHRcdFx0XHRvU2VnbWVudGVkQnV0dG9uLmFkZEV2ZW50RGVsZWdhdGUob1NlZ21lbnRlZEJ1dHRvbkRlbGVnYXRlKTtcblx0XHRcdH1cblx0XHRcdHN3aXRjaCAoc1NlbGVjdGVkS2V5KSB7XG5cdFx0XHRcdGNhc2UgVGVtcGxhdGVDb250ZW50Vmlldy5UYWJsZTpcblx0XHRcdFx0XHR0aGlzLl91cGRhdGVUYWJsZShvVGFibGUpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFRlbXBsYXRlQ29udGVudFZpZXcuQ2hhcnQ6XG5cdFx0XHRcdFx0dGhpcy5fdXBkYXRlQ2hhcnQob0NoYXJ0KTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBUZW1wbGF0ZUNvbnRlbnRWaWV3Lkh5YnJpZDpcblx0XHRcdFx0XHR0aGlzLl91cGRhdGVUYWJsZShvVGFibGUpO1xuXHRcdFx0XHRcdHRoaXMuX3VwZGF0ZUNoYXJ0KG9DaGFydCk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLmdldEV4dGVuc2lvbkFQSSgpLnVwZGF0ZUFwcFN0YXRlKCk7XG5cdFx0fSxcblx0XHRvbkZpbHRlcnNTZWdtZW50ZWRCdXR0b25QcmVzc2VkKHRoaXM6IExpc3RSZXBvcnRDb250cm9sbGVyLCBvRXZlbnQ6IGFueSkge1xuXHRcdFx0Y29uc3QgaXNDb21wYWN0ID0gb0V2ZW50LmdldFBhcmFtZXRlcihcImtleVwiKSA9PT0gXCJDb21wYWN0XCI7XG5cdFx0XHR0aGlzLl9nZXRGaWx0ZXJCYXJDb250cm9sKCkuc2V0VmlzaWJsZShpc0NvbXBhY3QpO1xuXHRcdFx0KHRoaXMuX2dldFZpc3VhbEZpbHRlckJhckNvbnRyb2woKSBhcyBDb250cm9sKS5zZXRWaXNpYmxlKCFpc0NvbXBhY3QpO1xuXHRcdH0sXG5cdFx0b25TdGF0ZUNoYW5nZSh0aGlzOiBMaXN0UmVwb3J0Q29udHJvbGxlcikge1xuXHRcdFx0dGhpcy5nZXRFeHRlbnNpb25BUEkoKS51cGRhdGVBcHBTdGF0ZSgpO1xuXHRcdH0sXG5cdFx0b25EeW5hbWljUGFnZVRpdGxlU3RhdGVDaGFuZ2VkKHRoaXM6IExpc3RSZXBvcnRDb250cm9sbGVyLCBvRXZlbnQ6IGFueSkge1xuXHRcdFx0Y29uc3QgZmlsdGVyQmFyOiBhbnkgPSB0aGlzLl9nZXRGaWx0ZXJCYXJDb250cm9sKCk7XG5cdFx0XHRpZiAoZmlsdGVyQmFyICYmIGZpbHRlckJhci5nZXRTZWdtZW50ZWRCdXR0b24oKSkge1xuXHRcdFx0XHRpZiAob0V2ZW50LmdldFBhcmFtZXRlcihcImlzRXhwYW5kZWRcIikpIHtcblx0XHRcdFx0XHRmaWx0ZXJCYXIuZ2V0U2VnbWVudGVkQnV0dG9uKCkuc2V0VmlzaWJsZSh0cnVlKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRmaWx0ZXJCYXIuZ2V0U2VnbWVudGVkQnV0dG9uKCkuc2V0VmlzaWJsZShmYWxzZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH07XG5cdGZvcm1hdHRlcnMgPSB7XG5cdFx0c2V0QUxQQ29udHJvbE1lc3NhZ2VTdHJpcCh0aGlzOiBMaXN0UmVwb3J0Q29udHJvbGxlciwgYUlnbm9yZWRGaWVsZHM6IGFueVtdLCBiSXNDaGFydDogYW55LCBvQXBwbHlTdXBwb3J0ZWQ/OiBhbnkpIHtcblx0XHRcdGxldCBzVGV4dCA9IFwiXCI7XG5cdFx0XHRiSXNDaGFydCA9IGJJc0NoYXJ0ID09PSBcInRydWVcIiB8fCBiSXNDaGFydCA9PT0gdHJ1ZTtcblx0XHRcdGNvbnN0IG9GaWx0ZXJCYXIgPSB0aGlzLl9nZXRGaWx0ZXJCYXJDb250cm9sKCk7XG5cdFx0XHRpZiAob0ZpbHRlckJhciAmJiBBcnJheS5pc0FycmF5KGFJZ25vcmVkRmllbGRzKSAmJiBhSWdub3JlZEZpZWxkcy5sZW5ndGggPiAwICYmIGJJc0NoYXJ0KSB7XG5cdFx0XHRcdGNvbnN0IGFJZ25vcmVkTGFiZWxzID0gTWVzc2FnZVN0cmlwLmdldExhYmVscyhcblx0XHRcdFx0XHRhSWdub3JlZEZpZWxkcyxcblx0XHRcdFx0XHRvRmlsdGVyQmFyLmRhdGEoXCJlbnRpdHlUeXBlXCIpLFxuXHRcdFx0XHRcdG9GaWx0ZXJCYXIsXG5cdFx0XHRcdFx0dGhpcy5vUmVzb3VyY2VCdW5kbGUgYXMgUmVzb3VyY2VCdW5kbGVcblx0XHRcdFx0KTtcblx0XHRcdFx0Y29uc3QgYklzU2VhcmNoSWdub3JlZCA9ICFvQXBwbHlTdXBwb3J0ZWQuZW5hYmxlU2VhcmNoO1xuXHRcdFx0XHRzVGV4dCA9IGJJc0NoYXJ0XG5cdFx0XHRcdFx0PyBNZXNzYWdlU3RyaXAuZ2V0QUxQVGV4dChhSWdub3JlZExhYmVscywgb0ZpbHRlckJhciwgYklzU2VhcmNoSWdub3JlZClcblx0XHRcdFx0XHQ6IE1lc3NhZ2VTdHJpcC5nZXRUZXh0KGFJZ25vcmVkTGFiZWxzLCBvRmlsdGVyQmFyLCBcIlwiLCBEZWxlZ2F0ZVV0aWwuZ2V0TG9jYWxpemVkVGV4dCk7XG5cdFx0XHRcdHJldHVybiBzVGV4dDtcblx0XHRcdH1cblx0XHR9XG5cdH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IExpc3RSZXBvcnRDb250cm9sbGVyO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFxREEsTUFBTUEsbUJBQW1CLEdBQUdDLFdBQVcsQ0FBQ0QsbUJBQW1CO0lBQzFERSxlQUFlLEdBQUdELFdBQVcsQ0FBQ0MsZUFBZTs7RUFFOUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBTEEsSUFPTUMsb0JBQW9CLFdBRHpCQyxjQUFjLENBQUMsa0RBQWtELENBQUMsVUFFakVDLGNBQWMsQ0FDZEMsZUFBZSxDQUFDQyxRQUFRLENBQUM7SUFDeEJDLGNBQWMsRUFBRSxZQUFpQztNQUMvQyxJQUFJLENBQUNDLE9BQU8sRUFBRSxDQUFDQyxhQUFhLEVBQUUsQ0FBMEJDLGVBQWUsRUFBRTtJQUMzRTtFQUNELENBQUMsQ0FBQyxDQUNGLFVBRUFOLGNBQWMsQ0FDZE8sNkJBQTZCLENBQUNMLFFBQVEsQ0FBQztJQUN0Q00sWUFBWSxFQUFFLFlBQStDO01BQzVELE9BQVEsSUFBSSxDQUFDQyxJQUFJLENBQTBCQyxtQkFBbUIsRUFBRTtJQUNqRTtFQUNELENBQUMsQ0FBQyxDQUNGLFVBRUFWLGNBQWMsQ0FBQ1csV0FBVyxDQUFDLFVBRzNCWCxjQUFjLENBQUNZLHFCQUFxQixDQUFDVixRQUFRLENBQUNXLDZCQUE2QixDQUFDLENBQUMsVUFHN0ViLGNBQWMsQ0FBQ2MsS0FBSyxDQUFDWixRQUFRLENBQUNhLGNBQWMsQ0FBQyxDQUFDLFVBRzlDZixjQUFjLENBQUNnQixTQUFTLENBQUNkLFFBQVEsQ0FBQ2Usa0JBQWtCLENBQUMsQ0FBQyxVQUd0RGpCLGNBQWMsQ0FBQ2tCLGFB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Q0EsTUFBTXlMLGVBQW9CLEdBQUd6UixHQUFHLENBQUNnUixXQUFXLEVBQUUsQ0FBQ25GLElBQUksQ0FBRXFGLE9BQVksSUFBSztnQkFDckUsT0FBT0EsT0FBTyxDQUFDbk4sR0FBRyxLQUFLL0QsR0FBRyxDQUFDc1Isb0JBQW9CLEVBQUU7Y0FDbEQsQ0FBQyxDQUFDO2NBQ0YsT0FBT0csZUFBZSxJQUFJQSxlQUFlLENBQUNOLGVBQWU7WUFDMUQ7VUFDRDtRQUNEO01BQ0Q7TUFDQSxPQUFPLEtBQUs7SUFDYixDQUFDO0lBQUEsT0FFRHRNLFlBQVksR0FBWixzQkFBYXZCLE1BQVcsRUFBRTtNQUN6QixJQUFJLENBQUNBLE1BQU0sQ0FBQ29PLFlBQVksRUFBRSxJQUFJLElBQUksQ0FBQ2hRLHNCQUFzQixFQUFFO1FBQzFENEIsTUFBTSxDQUFDSyxNQUFNLEVBQUU7UUFDZixJQUFJLENBQUNqQyxzQkFBc0IsR0FBRyxLQUFLO01BQ3BDO0lBQ0QsQ0FBQztJQUFBLE9BRURvRCxZQUFZLEdBQVosc0JBQWFkLE1BQVcsRUFBRTtNQUN6QixNQUFNMk4sV0FBVyxHQUFHM04sTUFBTSxDQUFDNE4sa0JBQWtCLEVBQUUsQ0FBQ0MsU0FBUyxDQUFDN04sTUFBTSxDQUFDO01BQ2pFLElBQUksRUFBRTJOLFdBQVcsSUFBSUEsV0FBVyxDQUFDRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUNsUSxzQkFBc0IsRUFBRTtRQUNqRm9DLE1BQU0sQ0FBQzROLGtCQUFrQixFQUFFLENBQUNqTyxNQUFNLENBQUNLLE1BQU0sRUFBRTJOLFdBQVcsQ0FBQ0ksY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzlFLElBQUksQ0FBQ25RLHNCQUFzQixHQUFHLEtBQUs7TUFDcEM7SUFDRCxDQUFDO0lBQUE7RUFBQSxFQXhsQmlDbUYsY0FBYztJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtFQUFBLE9BOHhCbEMzSixvQkFBb0I7QUFBQSJ9