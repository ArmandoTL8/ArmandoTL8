/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/merge", "sap/fe/core/CommonUtils", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/KeepAliveHelper", "sap/fe/core/helpers/ModelHelper", "sap/fe/navigation/library", "sap/ui/core/mvc/ControllerExtension", "sap/ui/core/mvc/OverrideExecution", "sap/ui/fl/apply/api/ControlVariantApplyAPI", "sap/ui/mdc/p13n/StateUtil"], function (Log, mergeObjects, CommonUtils, ClassSupport, KeepAliveHelper, ModelHelper, NavLibrary, ControllerExtension, OverrideExecution, ControlVariantApplyAPI, StateUtil) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _dec31, _dec32, _dec33, _dec34, _dec35, _dec36, _dec37, _dec38, _dec39, _dec40, _dec41, _dec42, _dec43, _dec44, _dec45, _dec46, _dec47, _class, _class2;
  var publicExtension = ClassSupport.publicExtension;
  var privateExtension = ClassSupport.privateExtension;
  var finalExtension = ClassSupport.finalExtension;
  var extensible = ClassSupport.extensible;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  // additionalStates are stored next to control IDs, so name clash avoidance needed. Fortunately IDs have restrictions:
  // "Allowed is a sequence of characters (capital/lowercase), digits, underscores, dashes, points and/or colons."
  // Therefore adding a symbol like # or @
  const ADDITIONAL_STATES_KEY = "#additionalStates",
    NavType = NavLibrary.NavType;

  /**
   * Definition of a custom action to be used inside the table toolbar
   *
   * @alias sap.fe.core.controllerextensions.NavigationParameter
   * @public
   */

  ///////////////////////////////////////////////////////////////////
  // methods to retrieve & apply states for the different controls //
  ///////////////////////////////////////////////////////////////////

  const _mControlStateHandlerMap = {
    "sap.ui.fl.variants.VariantManagement": {
      retrieve: function (oVM) {
        return {
          variantId: oVM.getCurrentVariantKey()
        };
      },
      apply: async function (oVM, controlState) {
        try {
          if (controlState && controlState.variantId !== undefined && controlState.variantId !== oVM.getCurrentVariantKey()) {
            const isVariantIdAvailable = this._checkIfVariantIdIsAvailable(oVM, controlState.variantId);
            let sVariantReference;
            if (isVariantIdAvailable) {
              sVariantReference = controlState.variantId;
            } else {
              sVariantReference = oVM.getStandardVariantKey();
              this.controlsVariantIdUnavailable.push(...oVM.getFor());
            }
            try {
              await ControlVariantApplyAPI.activateVariant({
                element: oVM,
                variantReference: sVariantReference
              });
              await this._setInitialStatesForDeltaCompute(oVM);
            } catch (error) {
              Log.error(error);
            }
          } else {
            this._setInitialStatesForDeltaCompute(oVM);
          }
        } catch (error) {
          Log.error(error);
        }
      }
    },
    "sap.m.IconTabBar": {
      retrieve: function (oTabBar) {
        return {
          selectedKey: oTabBar.getSelectedKey()
        };
      },
      apply: function (oTabBar, oControlState) {
        if (oControlState && oControlState.selectedKey) {
          const oSelectedItem = oTabBar.getItems().find(function (oItem) {
            return oItem.getKey() === oControlState.selectedKey;
          });
          if (oSelectedItem) {
            oTabBar.setSelectedItem(oSelectedItem);
          }
        }
      }
    },
    "sap.ui.mdc.FilterBar": {
      retrieve: async function (filterBar) {
        const controlStateKey = this.getStateKey(filterBar);
        const filterBarState = await StateUtil.retrieveExternalState(filterBar);
        // remove sensitive or view state irrelevant fields
        const propertiesInfo = filterBar.getPropertyInfoSet();
        const filter = filterBarState.filter || {};
        propertiesInfo.filter(function (PropertyInfo) {
          return Object.keys(filter).length > 0 && PropertyInfo.path && filter[PropertyInfo.path] && (PropertyInfo.removeFromAppState || filter[PropertyInfo.path].length === 0);
        }).forEach(function (PropertyInfo) {
          if (PropertyInfo.path) {
            delete filter[PropertyInfo.path];
          }
        });
        return this._getControlState(controlStateKey, filterBarState);
      },
      apply: async function (filterBar, controlState) {
        try {
          if (controlState) {
            if (controlState !== null && controlState !== void 0 && controlState.initialState && this.controlsVariantIdUnavailable.indexOf(filterBar.getId()) === -1) {
              const diffState = await StateUtil.diffState(filterBar, controlState.initialState, controlState.fullState);
              return StateUtil.applyExternalState(filterBar, diffState);
            } else {
              return StateUtil.applyExternalState(filterBar, (controlState === null || controlState === void 0 ? void 0 : controlState.fullState) ?? controlState);
            }
          }
        } catch (error) {
          Log.error(error);
        }
      }
    },
    "sap.ui.mdc.Table": {
      retrieve: async function (table) {
        const controlStateKey = this.getStateKey(table);
        const tableState = await StateUtil.retrieveExternalState(table);
        return this._getControlState(controlStateKey, tableState);
      },
      apply: async function (table, controlState) {
        try {
          if (controlState) {
            // Extra condition added to apply the diff state logic for mdc control
            if (controlState !== null && controlState !== void 0 && controlState.initialState && this.controlsVariantIdUnavailable.indexOf(table.getId()) === -1) {
              var _controlState$initial;
              if (!((_controlState$initial = controlState.initialState) !== null && _controlState$initial !== void 0 && _controlState$initial.supplementaryConfig)) {
                controlState.initialState.supplementaryConfig = {};
              }
              const oDiffState = await StateUtil.diffState(table, controlState.initialState, controlState.fullState);
              return StateUtil.applyExternalState(table, oDiffState);
            } else {
              if (!controlState.supplementaryConfig) {
                controlState.supplementaryConfig = {};
              }
              return StateUtil.applyExternalState(table, (controlState === null || controlState === void 0 ? void 0 : controlState.fullState) ?? controlState);
            }
          }
        } catch (error) {
          Log.error(error);
        }
      },
      refreshBinding: function (oTable) {
        const oTableBinding = oTable.getRowBinding();
        if (oTableBinding) {
          const oRootBinding = oTableBinding.getRootBinding();
          if (oRootBinding === oTableBinding) {
            // absolute binding
            oTableBinding.refresh();
          } else {
            // relative binding
            const oHeaderContext = oTableBinding.getHeaderContext();
            const sGroupId = oTableBinding.getGroupId();
            if (oHeaderContext) {
              oHeaderContext.requestSideEffects([{
                $NavigationPropertyPath: ""
              }], sGroupId);
            }
          }
        } else {
          Log.info(`Table: ${oTable.getId()} was not refreshed. No binding found!`);
        }
      }
    },
    "sap.ui.mdc.Chart": {
      retrieve: function (oChart) {
        return StateUtil.retrieveExternalState(oChart);
      },
      apply: function (oChart, oControlState) {
        if (oControlState) {
          return StateUtil.applyExternalState(oChart, oControlState);
        }
      }
      // TODO: uncomment after mdc fix is merged
      /* retrieve: async function (chart: Chart) {
      	const controlStateKey = this.getStateKey(chart);
      	const chartState = await StateUtil.retrieveExternalState(chart);
      		return this._getControlState(controlStateKey, chartState);
      },
      apply: async function (chart: Chart, controlState: ControlState) {
      	try {
      		if (controlState) {
      			// Extra condition added to apply the diff state logic for mdc control
      			if (controlState?.initialState && this.controlsVariantIdUnavailable.indexOf(chart.getId()) === -1) {
      				const diffState = await StateUtil.diffState(
      					chart,
      					controlState.initialState as object,
      					controlState.fullState as object
      				);
      				return await StateUtil.applyExternalState(chart, diffState);
      			} else {
      				return await StateUtil.applyExternalState(chart, controlState?.fullState ?? controlState);
      			}
      		}
      	} catch (error) {
      		Log.error(error as string);
      	}
      } */
    },

    "sap.uxap.ObjectPageLayout": {
      retrieve: function (oOPLayout) {
        return {
          selectedSection: oOPLayout.getSelectedSection()
        };
      },
      apply: function (oOPLayout, oControlState) {
        if (oControlState) {
          oOPLayout.setSelectedSection(oControlState.selectedSection);
        }
      },
      refreshBinding: function (oOPLayout) {
        const oBindingContext = oOPLayout.getBindingContext();
        const oBinding = oBindingContext && oBindingContext.getBinding();
        if (oBinding) {
          const sMetaPath = ModelHelper.getMetaPathForContext(oBindingContext);
          const sStrategy = KeepAliveHelper.getControlRefreshStrategyForContextPath(oOPLayout, sMetaPath);
          if (sStrategy === "self") {
            // Refresh main context and 1-1 navigation properties or OP
            const oModel = oBindingContext.getModel(),
              oMetaModel = oModel.getMetaModel(),
              oNavigationProperties = CommonUtils.getContextPathProperties(oMetaModel, sMetaPath, {
                $kind: "NavigationProperty"
              }) || {},
              aNavPropertiesToRequest = Object.keys(oNavigationProperties).reduce(function (aPrev, sNavProp) {
                if (oNavigationProperties[sNavProp].$isCollection !== true) {
                  aPrev.push({
                    $NavigationPropertyPath: sNavProp
                  });
                }
                return aPrev;
              }, []),
              aProperties = [{
                $PropertyPath: "*"
              }],
              sGroupId = oBinding.getGroupId();
            oBindingContext.requestSideEffects(aProperties.concat(aNavPropertiesToRequest), sGroupId);
          } else if (sStrategy === "includingDependents") {
            // Complete refresh
            oBinding.refresh();
          }
        } else {
          Log.info(`ObjectPage: ${oOPLayout.getId()} was not refreshed. No binding found!`);
        }
      }
    },
    "sap.fe.macros.table.QuickFilterContainer": {
      retrieve: function (oQuickFilter) {
        return {
          selectedKey: oQuickFilter.getSelectorKey()
        };
      },
      apply: function (oQuickFilter, oControlState) {
        if (oControlState) {
          oQuickFilter.setSelectorKey(oControlState.selectedKey);
        }
      }
    },
    "sap.m.SegmentedButton": {
      retrieve: function (oSegmentedButton) {
        return {
          selectedKey: oSegmentedButton.getSelectedKey()
        };
      },
      apply: function (oSegmentedButton, oControlState) {
        if (oControlState) {
          oSegmentedButton.setSelectedKey(oControlState.selectedKey);
        }
      }
    },
    "sap.m.Select": {
      retrieve: function (oSelect) {
        return {
          selectedKey: oSelect.getSelectedKey()
        };
      },
      apply: function (oSelect, oControlState) {
        if (oControlState) {
          oSelect.setSelectedKey(oControlState.selectedKey);
        }
      }
    },
    "sap.f.DynamicPage": {
      retrieve: function (oDynamicPage) {
        return {
          headerExpanded: oDynamicPage.getHeaderExpanded()
        };
      },
      apply: function (oDynamicPage, oControlState) {
        if (oControlState) {
          oDynamicPage.setHeaderExpanded(oControlState.headerExpanded);
        }
      }
    },
    "sap.ui.core.mvc.View": {
      retrieve: function (oView) {
        const oController = oView.getController();
        if (oController && oController.viewState) {
          return oController.viewState.retrieveViewState(oController.viewState);
        }
        return {};
      },
      apply: function (oView, oControlState, oNavParameters) {
        const oController = oView.getController();
        if (oController && oController.viewState) {
          return oController.viewState.applyViewState(oControlState, oNavParameters);
        }
      },
      refreshBinding: function (oView) {
        const oController = oView.getController();
        if (oController && oController.viewState) {
          return oController.viewState.refreshViewBindings();
        }
      }
    },
    "sap.ui.core.ComponentContainer": {
      retrieve: function (oComponentContainer) {
        const oComponent = oComponentContainer.getComponentInstance();
        if (oComponent) {
          return this.retrieveControlState(oComponent.getRootControl());
        }
        return {};
      },
      apply: function (oComponentContainer, oControlState, oNavParameters) {
        const oComponent = oComponentContainer.getComponentInstance();
        if (oComponent) {
          return this.applyControlState(oComponent.getRootControl(), oControlState, oNavParameters);
        }
      }
    }
  };
  /**
   * A controller extension offering hooks for state handling
   *
   * If you need to maintain a specific state for your application, you can use the controller extension.
   *
   * @hideconstructor
   * @public
   * @since 1.85.0
   */
  let ViewState = (_dec = defineUI5Class("sap.fe.core.controllerextensions.ViewState"), _dec2 = publicExtension(), _dec3 = finalExtension(), _dec4 = publicExtension(), _dec5 = extensible(OverrideExecution.After), _dec6 = privateExtension(), _dec7 = finalExtension(), _dec8 = privateExtension(), _dec9 = finalExtension(), _dec10 = publicExtension(), _dec11 = extensible(OverrideExecution.After), _dec12 = publicExtension(), _dec13 = extensible(OverrideExecution.After), _dec14 = publicExtension(), _dec15 = extensible(OverrideExecution.After), _dec16 = privateExtension(), _dec17 = finalExtension(), _dec18 = publicExtension(), _dec19 = extensible(OverrideExecution.After), _dec20 = privateExtension(), _dec21 = finalExtension(), _dec22 = publicExtension(), _dec23 = extensible(OverrideExecution.After), _dec24 = publicExtension(), _dec25 = finalExtension(), _dec26 = publicExtension(), _dec27 = finalExtension(), _dec28 = publicExtension(), _dec29 = extensible(OverrideExecution.After), _dec30 = privateExtension(), _dec31 = finalExtension(), _dec32 = publicExtension(), _dec33 = extensible(OverrideExecution.Instead), _dec34 = publicExtension(), _dec35 = finalExtension(), _dec36 = privateExtension(), _dec37 = publicExtension(), _dec38 = extensible(OverrideExecution.After), _dec39 = publicExtension(), _dec40 = extensible(OverrideExecution.After), _dec41 = publicExtension(), _dec42 = extensible(OverrideExecution.After), _dec43 = privateExtension(), _dec44 = publicExtension(), _dec45 = extensible(OverrideExecution.After), _dec46 = privateExtension(), _dec47 = finalExtension(), _dec(_class = (_class2 = /*#__PURE__*/function (_ControllerExtension) {
    _inheritsLoose(ViewState, _ControllerExtension);
    /**
     * Constructor.
     */
    function ViewState() {
      var _this;
      _this = _ControllerExtension.call(this) || this;
      _this.initialControlStatesMapper = {};
      _this.controlsVariantIdUnavailable = [];
      _this.viewStateControls = [];
      _this._setInitialStatesForDeltaCompute = async variantManagement => {
        try {
          const adaptControls = _this.viewStateControls;
          const externalStatePromises = [];
          const controlStateKey = [];
          let initialControlStates = [];
          const variantControls = (variantManagement === null || variantManagement === void 0 ? void 0 : variantManagement.getFor()) ?? [];
          adaptControls.filter(function (control) {
            return control && (!variantManagement || variantControls.indexOf(control.getId()) > -1) && (control.isA("sap.ui.mdc.Table") || control.isA("sap.ui.mdc.FilterBar") || control.isA("sap.ui.mdc.Chart"));
          }).forEach(control => {
            if (variantManagement) {
              _this._addEventListenersToVariantManagement(variantManagement, variantControls);
            }
            const externalStatePromise = StateUtil.retrieveExternalState(control);
            externalStatePromises.push(externalStatePromise);
            controlStateKey.push(_this.getStateKey(control));
          });
          initialControlStates = await Promise.all(externalStatePromises);
          initialControlStates.forEach((initialControlState, i) => {
            _this.initialControlStatesMapper[controlStateKey[i]] = initialControlState;
          });
        } catch (e) {
          Log.error(e);
        }
      };
      _this._iRetrievingStateCounter = 0;
      _this._pInitialStateApplied = new Promise(resolve => {
        _this._pInitialStateAppliedResolve = resolve;
      });
      return _this;
    }
    var _proto = ViewState.prototype;
    _proto.refreshViewBindings = async function refreshViewBindings() {
      const aControls = await this.collectResults(this.base.viewState.adaptBindingRefreshControls);
      let oPromiseChain = Promise.resolve();
      aControls.filter(oControl => {
        return oControl && oControl.isA && oControl.isA("sap.ui.base.ManagedObject");
      }).forEach(oControl => {
        oPromiseChain = oPromiseChain.then(this.refreshControlBinding.bind(this, oControl));
      });
      return oPromiseChain;
    }
    /**
     * This function should add all controls relevant for refreshing to the provided control array.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param aCollectedControls The collected controls
     * @alias sap.fe.core.controllerextensions.ViewState#adaptBindingRefreshControls
     * @protected
     */;
    _proto.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    adaptBindingRefreshControls = function adaptBindingRefreshControls(aCollectedControls) {
      // to be overriden
    };
    _proto.refreshControlBinding = function refreshControlBinding(oControl) {
      const oControlRefreshBindingHandler = this.getControlRefreshBindingHandler(oControl);
      let oPromiseChain = Promise.resolve();
      if (typeof oControlRefreshBindingHandler.refreshBinding !== "function") {
        Log.info(`refreshBinding handler for control: ${oControl.getMetadata().getName()} is not provided`);
      } else {
        oPromiseChain = oPromiseChain.then(oControlRefreshBindingHandler.refreshBinding.bind(this, oControl));
      }
      return oPromiseChain;
    }

    /**
     * Returns a map of <code>refreshBinding</code> function for a certain control.
     *
     * @param {sap.ui.base.ManagedObject} oControl The control to get state handler for
     * @returns {object} A plain object with one function: <code>refreshBinding</code>
     */;
    _proto.getControlRefreshBindingHandler = function getControlRefreshBindingHandler(oControl) {
      const oRefreshBindingHandler = {};
      if (oControl) {
        for (const sType in _mControlStateHandlerMap) {
          if (oControl.isA(sType)) {
            // pass only the refreshBinding handler in an object so that :
            // 1. Application has access only to refreshBinding and not apply and reterive at this stage
            // 2. Application modifications to the object will be reflected here (as we pass by reference)
            oRefreshBindingHandler["refreshBinding"] = _mControlStateHandlerMap[sType].refreshBinding || {};
            break;
          }
        }
      }
      this.base.viewState.adaptBindingRefreshHandler(oControl, oRefreshBindingHandler);
      return oRefreshBindingHandler;
    }
    /**
     * Customize the <code>refreshBinding</code> function for a certain control.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param oControl The control for which the refresh handler is adapted.
     * @param oControlHandler A plain object which can have one function: <code>refreshBinding</code>
     * @alias sap.fe.core.controllerextensions.ViewState#adaptBindingRefreshHandler
     * @protected
     */;
    _proto.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    adaptBindingRefreshHandler = function adaptBindingRefreshHandler(oControl, oControlHandler) {
      // to be overriden
    }

    /**
     * Called when the application is suspended due to keep-alive mode.
     *
     * @alias sap.fe.core.controllerextensions.ViewState#onSuspend
     * @public
     */;
    _proto.onSuspend = function onSuspend() {
      // to be overriden
    }

    /**
     * Called when the application is restored due to keep-alive mode.
     *
     * @alias sap.fe.core.controllerextensions.ViewState#onRestore
     * @public
     */;
    _proto.onRestore = function onRestore() {
      // to be overriden
    }

    /**
     * Destructor method for objects.
     */;
    _proto.destroy = function destroy() {
      delete this._pInitialStateAppliedResolve;
      _ControllerExtension.prototype.destroy.call(this);
    }

    /**
     * Helper function to enable multi override. It is adding an additional parameter (array) to the provided
     * function (and its parameters), that will be evaluated via <code>Promise.all</code>.
     *
     * @param fnCall The function to be called
     * @param args
     * @returns A promise to be resolved with the result of all overrides
     */;
    _proto.collectResults = function collectResults(fnCall) {
      const aResults = [];
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }
      args.push(aResults);
      fnCall.apply(this, args);
      return Promise.all(aResults);
    }

    /**
     * Customize the <code>retrieve</code> and <code>apply</code> functions for a certain control.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param oControl The control to get state handler for
     * @param aControlHandler A list of plain objects with two functions: <code>retrieve</code> and <code>apply</code>
     * @alias sap.fe.core.controllerextensions.ViewState#adaptControlStateHandler
     * @protected
     */;
    _proto.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    adaptControlStateHandler = function adaptControlStateHandler(oControl, aControlHandler) {
      // to be overridden if needed
    }

    /**
     * Returns a map of <code>retrieve</code> and <code>apply</code> functions for a certain control.
     *
     * @param oControl The control to get state handler for
     * @returns A plain object with two functions: <code>retrieve</code> and <code>apply</code>
     */;
    _proto.getControlStateHandler = function getControlStateHandler(oControl) {
      const aInternalControlStateHandler = [],
        aCustomControlStateHandler = [];
      if (oControl) {
        for (const sType in _mControlStateHandlerMap) {
          if (oControl.isA(sType)) {
            // avoid direct manipulation of internal _mControlStateHandlerMap
            aInternalControlStateHandler.push(Object.assign({}, _mControlStateHandlerMap[sType]));
            break;
          }
        }
      }
      this.base.viewState.adaptControlStateHandler(oControl, aCustomControlStateHandler);
      return aInternalControlStateHandler.concat(aCustomControlStateHandler);
    }

    /**
     * This function should add all controls for given view that should be considered for the state handling to the provided control array.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param aCollectedControls The collected controls
     * @alias sap.fe.core.controllerextensions.ViewState#adaptStateControls
     * @protected
     */;
    _proto.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    adaptStateControls = function adaptStateControls(aCollectedControls) {
      // to be overridden if needed
    }

    /**
     * Returns the key to be used for given control.
     *
     * @param oControl The control to get state key for
     * @returns The key to be used for storing the controls state
     */;
    _proto.getStateKey = function getStateKey(oControl) {
      return this.getView().getLocalId(oControl.getId()) || oControl.getId();
    }

    /**
     * Retrieve the view state of this extensions view.
     * When this function is called more than once before finishing, all but the final response will resolve to <code>undefined</code>.
     *
     * @returns A promise resolving the view state
     * @alias sap.fe.core.controllerextensions.ViewState#retrieveViewState
     * @public
     */;
    _proto.retrieveViewState = async function retrieveViewState() {
      ++this._iRetrievingStateCounter;
      let oViewState;
      try {
        await this._pInitialStateApplied;
        const aControls = await this.collectResults(this.base.viewState.adaptStateControls);
        const aResolvedStates = await Promise.all(aControls.filter(function (oControl) {
          return oControl && oControl.isA && oControl.isA("sap.ui.base.ManagedObject");
        }).map(oControl => {
          return this.retrieveControlState(oControl).then(vResult => {
            return {
              key: this.getStateKey(oControl),
              value: vResult
            };
          });
        }));
        oViewState = aResolvedStates.reduce(function (oStates, mState) {
          const oCurrentState = {};
          oCurrentState[mState.key] = mState.value;
          return mergeObjects(oStates, oCurrentState);
        }, {});
        const mAdditionalStates = await Promise.resolve(this._retrieveAdditionalStates());
        if (mAdditionalStates && Object.keys(mAdditionalStates).length) {
          oViewState[ADDITIONAL_STATES_KEY] = mAdditionalStates;
        }
      } finally {
        --this._iRetrievingStateCounter;
      }
      return this._iRetrievingStateCounter === 0 ? oViewState : undefined;
    }

    /**
     * Extend the map of additional states (not control bound) to be added to the current view state of the given view.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param mAdditionalStates The additional state
     * @alias sap.fe.core.controllerextensions.ViewState#retrieveAdditionalStates
     * @protected
     */;
    _proto.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    retrieveAdditionalStates = function retrieveAdditionalStates(mAdditionalStates) {
      // to be overridden if needed
    }

    /**
     * Returns a map of additional states (not control bound) to be added to the current view state of the given view.
     *
     * @returns Additional view states
     */;
    _proto._retrieveAdditionalStates = function _retrieveAdditionalStates() {
      const mAdditionalStates = {};
      this.base.viewState.retrieveAdditionalStates(mAdditionalStates);
      return mAdditionalStates;
    }

    /**
     * Returns the current state for the given control.
     *
     * @param oControl The object to get the state for
     * @returns The state for the given control
     */;
    _proto.retrieveControlState = function retrieveControlState(oControl) {
      const aControlStateHandlers = this.getControlStateHandler(oControl);
      return Promise.all(aControlStateHandlers.map(mControlStateHandler => {
        if (typeof mControlStateHandler.retrieve !== "function") {
          throw new Error(`controlStateHandler.retrieve is not a function for control: ${oControl.getMetadata().getName()}`);
        }
        return mControlStateHandler.retrieve.call(this, oControl);
      })).then(aStates => {
        return aStates.reduce(function (oFinalState, oCurrentState) {
          return mergeObjects(oFinalState, oCurrentState);
        }, {});
      });
    }

    /**
     * Defines whether the view state should only be applied once initially.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.Instead}.
     *
     * Important:
     * You should only override this method for custom pages and not for the standard ListReportPage and ObjectPage!
     *
     * @returns If <code>true</code>, only the initial view state is applied once,
     * else any new view state is also applied on follow-up calls (default)
     * @alias sap.fe.core.controllerextensions.ViewState#applyInitialStateOnly
     * @protected
     */;
    _proto.applyInitialStateOnly = function applyInitialStateOnly() {
      return true;
    }

    /**
     * Applies the given view state to this extensions view.
     *
     * @param oViewState The view state to apply (can be undefined)
     * @param oNavParameter The current navigation parameter
     * @param oNavParameter.navigationType The actual navigation type
     * @param oNavParameter.selectionVariant The selectionVariant from the navigation
     * @param oNavParameter.selectionVariantDefaults The selectionVariant defaults from the navigation
     * @param oNavParameter.requiresStandardVariant Defines whether the standard variant must be used in variant management
     * @returns Promise for async state handling
     * @alias sap.fe.core.controllerextensions.ViewState#applyViewState
     * @public
     */;
    _proto.applyViewState = async function applyViewState(oViewState, oNavParameter) {
      if (this.base.viewState.applyInitialStateOnly() && this._getInitialStateApplied()) {
        return;
      }
      try {
        await this.collectResults(this.base.viewState.onBeforeStateApplied);
        const aControls = await this.collectResults(this.base.viewState.adaptStateControls);
        this.viewStateControls = aControls;
        let oPromiseChain = Promise.resolve();
        let hasVariantManagement = false;
        /**
         * this ensures that variantManagement control is applied first to calculate initial state for delta logic
         */
        const sortedAdaptStateControls = aControls.reduce((modifiedControls, control) => {
          if (!control) {
            return modifiedControls;
          }
          const isVariantManagementControl = control.isA("sap.ui.fl.variants.VariantManagement");
          if (!hasVariantManagement) {
            hasVariantManagement = isVariantManagementControl;
          }
          modifiedControls = isVariantManagementControl ? [control, ...modifiedControls] : [...modifiedControls, control];
          return modifiedControls;
        }, []);

        // In case of no Variant Management, this ensures that initial states is set
        if (!hasVariantManagement) {
          this._setInitialStatesForDeltaCompute();
        }
        sortedAdaptStateControls.filter(function (oControl) {
          return oControl.isA("sap.ui.base.ManagedObject");
        }).forEach(oControl => {
          const sKey = this.getStateKey(oControl);
          oPromiseChain = oPromiseChain.then(this.applyControlState.bind(this, oControl, oViewState ? oViewState[sKey] : undefined, oNavParameter));
        });
        await oPromiseChain;
        if (oNavParameter.navigationType === NavType.iAppState) {
          await this.collectResults(this.base.viewState.applyAdditionalStates, oViewState ? oViewState[ADDITIONAL_STATES_KEY] : undefined);
        } else {
          await this.collectResults(this.base.viewState.applyNavigationParameters, oNavParameter);
          await this.collectResults(this.base.viewState._applyNavigationParametersToFilterbar, oNavParameter);
        }
      } finally {
        try {
          await this.collectResults(this.base.viewState.onAfterStateApplied);
          this._setInitialStateApplied();
        } catch (e) {
          Log.error(e);
        }
      }
    };
    _proto._checkIfVariantIdIsAvailable = function _checkIfVariantIdIsAvailable(oVM, sVariantId) {
      const aVariants = oVM.getVariants();
      let bIsControlStateVariantAvailable = false;
      aVariants.forEach(function (oVariant) {
        if (oVariant.key === sVariantId) {
          bIsControlStateVariantAvailable = true;
        }
      });
      return bIsControlStateVariantAvailable;
    };
    _proto._setInitialStateApplied = function _setInitialStateApplied() {
      if (this._pInitialStateAppliedResolve) {
        const pInitialStateAppliedResolve = this._pInitialStateAppliedResolve;
        delete this._pInitialStateAppliedResolve;
        pInitialStateAppliedResolve();
      }
    };
    _proto._getInitialStateApplied = function _getInitialStateApplied() {
      return !this._pInitialStateAppliedResolve;
    }

    /**
     * Hook to react before a state for given view is applied.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param aPromises Extensible array of promises to be resolved before continuing
     * @alias sap.fe.core.controllerextensions.ViewState#onBeforeStateApplied
     * @protected
     */;
    _proto.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onBeforeStateApplied = function onBeforeStateApplied(aPromises) {
      // to be overriden
    }

    /**
     * Hook to react when state for given view was applied.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param aPromises Extensible array of promises to be resolved before continuing
     * @alias sap.fe.core.controllerextensions.ViewState#onAfterStateApplied
     * @protected
     */;
    _proto.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onAfterStateApplied = function onAfterStateApplied(aPromises) {
      // to be overriden
    }

    /**
     * Applying additional, not control related, states - is called only if navigation type is iAppState.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param oViewState The current view state
     * @param aPromises Extensible array of promises to be resolved before continuing
     * @alias sap.fe.core.controllerextensions.ViewState#applyAdditionalStates
     * @protected
     */;
    _proto.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    applyAdditionalStates = function applyAdditionalStates(oViewState, aPromises) {
      // to be overridden if needed
    };
    _proto._applyNavigationParametersToFilterbar = function _applyNavigationParametersToFilterbar(_oNavParameter, _aPromises) {
      // to be overridden if needed
    }

    /**
     * Apply navigation parameters is not called if the navigation type is iAppState
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param oNavParameter The current navigation parameter
     * @param oNavParameter.navigationType The actual navigation type
     * @param [oNavParameter.selectionVariant] The selectionVariant from the navigation
     * @param [oNavParameter.selectionVariantDefaults] The selectionVariant defaults from the navigation
     * @param [oNavParameter.requiresStandardVariant] Defines whether the standard variant must be used in variant management
     * @param aPromises Extensible array of promises to be resolved before continuing
     * @alias sap.fe.core.controllerextensions.ViewState#applyNavigationParameters
     * @protected
     */;
    _proto.applyNavigationParameters = function applyNavigationParameters(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    oNavParameter,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    aPromises) {
      // to be overridden if needed
    }

    /**
     * Applying the given state to the given control.
     *
     * @param oControl The object to apply the given state
     * @param oControlState The state for the given control
     * @param [oNavParameters] The current navigation parameters
     * @returns Return a promise for async state handling
     */;
    _proto.applyControlState = function applyControlState(oControl, oControlState, oNavParameters) {
      const aControlStateHandlers = this.getControlStateHandler(oControl);
      let oPromiseChain = Promise.resolve();
      aControlStateHandlers.forEach(mControlStateHandler => {
        if (typeof mControlStateHandler.apply !== "function") {
          throw new Error(`controlStateHandler.apply is not a function for control: ${oControl.getMetadata().getName()}`);
        }
        oPromiseChain = oPromiseChain.then(mControlStateHandler.apply.bind(this, oControl, oControlState, oNavParameters));
      });
      return oPromiseChain;
    };
    _proto.getInterface = function getInterface() {
      return this;
    }
    // method to get the control state for mdc controls applying the delta logic
    ;
    _proto._getControlState = function _getControlState(controlStateKey, controlState) {
      const initialControlStatesMapper = this.initialControlStatesMapper;
      if (Object.keys(initialControlStatesMapper).length > 0 && initialControlStatesMapper[controlStateKey]) {
        if (Object.keys(initialControlStatesMapper[controlStateKey]).length === 0) {
          initialControlStatesMapper[controlStateKey] = {
            ...controlState
          };
        }
        return {
          fullState: controlState,
          initialState: initialControlStatesMapper[controlStateKey]
        };
      }
      return controlState;
    }

    //method to store the initial states for delta computation of mdc controls
    ;
    // Attach event to save and select of Variant Management to update the initial Control States on variant change
    _proto._addEventListenersToVariantManagement = function _addEventListenersToVariantManagement(variantManagement, variantControls) {
      const oPayload = {
        variantManagedControls: variantControls
      };
      const fnEvent = () => {
        this._updateInitialStatesOnVariantChange(variantControls);
      };
      variantManagement.attachSave(oPayload, fnEvent, {});
      variantManagement.attachSelect(oPayload, fnEvent, {});
    };
    _proto._updateInitialStatesOnVariantChange = function _updateInitialStatesOnVariantChange(vmAssociatedControlsToReset) {
      const initialControlStatesMapper = this.initialControlStatesMapper;
      Object.keys(initialControlStatesMapper).forEach(controlKey => {
        for (const vmAssociatedcontrolKey of vmAssociatedControlsToReset) {
          if (vmAssociatedcontrolKey.indexOf(controlKey) > -1) {
            initialControlStatesMapper[controlKey] = {};
          }
        }
      });
    };
    return ViewState;
  }(ControllerExtension), (_applyDecoratedDescriptor(_class2.prototype, "refreshViewBindings", [_dec2, _dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "refreshViewBindings"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "adaptBindingRefreshControls", [_dec4, _dec5], Object.getOwnPropertyDescriptor(_class2.prototype, "adaptBindingRefreshControls"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "refreshControlBinding", [_dec6, _dec7], Object.getOwnPropertyDescriptor(_class2.prototype, "refreshControlBinding"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getControlRefreshBindingHandler", [_dec8, _dec9], Object.getOwnPropertyDescriptor(_class2.prototype, "getControlRefreshBindingHandler"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "adaptBindingRefreshHandler", [_dec10, _dec11], Object.getOwnPropertyDescriptor(_class2.prototype, "adaptBindingRefreshHandler"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onSuspend", [_dec12, _dec13], Object.getOwnPropertyDescriptor(_class2.prototype, "onSuspend"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onRestore", [_dec14, _dec15], Object.getOwnPropertyDescriptor(_class2.prototype, "onRestore"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "collectResults", [_dec16, _dec17], Object.getOwnPropertyDescriptor(_class2.prototype, "collectResults"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "adaptControlStateHandler", [_dec18, _dec19], Object.getOwnPropertyDescriptor(_class2.prototype, "adaptControlStateHandler"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getControlStateHandler", [_dec20, _dec21], Object.getOwnPropertyDescriptor(_class2.prototype, "getControlStateHandler"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "adaptStateControls", [_dec22, _dec23], Object.getOwnPropertyDescriptor(_class2.prototype, "adaptStateControls"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getStateKey", [_dec24, _dec25], Object.getOwnPropertyDescriptor(_class2.prototype, "getStateKey"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "retrieveViewState", [_dec26, _dec27], Object.getOwnPropertyDescriptor(_class2.prototype, "retrieveViewState"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "retrieveAdditionalStates", [_dec28, _dec29], Object.getOwnPropertyDescriptor(_class2.prototype, "retrieveAdditionalStates"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "retrieveControlState", [_dec30, _dec31], Object.getOwnPropertyDescriptor(_class2.prototype, "retrieveControlState"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "applyInitialStateOnly", [_dec32, _dec33], Object.getOwnPropertyDescriptor(_class2.prototype, "applyInitialStateOnly"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "applyViewState", [_dec34, _dec35], Object.getOwnPropertyDescriptor(_class2.prototype, "applyViewState"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "_checkIfVariantIdIsAvailable", [_dec36], Object.getOwnPropertyDescriptor(_class2.prototype, "_checkIfVariantIdIsAvailable"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onBeforeStateApplied", [_dec37, _dec38], Object.getOwnPropertyDescriptor(_class2.prototype, "onBeforeStateApplied"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onAfterStateApplied", [_dec39, _dec40], Object.getOwnPropertyDescriptor(_class2.prototype, "onAfterStateApplied"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "applyAdditionalStates", [_dec41, _dec42], Object.getOwnPropertyDescriptor(_class2.prototype, "applyAdditionalStates"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "_applyNavigationParametersToFilterbar", [_dec43], Object.getOwnPropertyDescriptor(_class2.prototype, "_applyNavigationParametersToFilterbar"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "applyNavigationParameters", [_dec44, _dec45], Object.getOwnPropertyDescriptor(_class2.prototype, "applyNavigationParameters"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "applyControlState", [_dec46, _dec47], Object.getOwnPropertyDescriptor(_class2.prototype, "applyControlState"), _class2.prototype)), _class2)) || _class);
  return ViewState;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBRERJVElPTkFMX1NUQVRFU19LRVkiLCJOYXZUeXBlIiwiTmF2TGlicmFyeSIsIl9tQ29udHJvbFN0YXRlSGFuZGxlck1hcCIsInJldHJpZXZlIiwib1ZNIiwidmFyaWFudElkIiwiZ2V0Q3VycmVudFZhcmlhbnRLZXkiLCJhcHBseSIsImNvbnRyb2xTdGF0ZSIsInVuZGVmaW5lZCIsImlzVmFyaWFudElkQXZhaWxhYmxlIiwiX2NoZWNrSWZWYXJpYW50SWRJc0F2YWlsYWJsZSIsInNWYXJpYW50UmVmZXJlbmNlIiwiZ2V0U3RhbmRhcmRWYXJpYW50S2V5IiwiY29udHJvbHNWYXJpYW50SWRVbmF2YWlsYWJsZSIsInB1c2giLCJnZXRGb3IiLCJDb250cm9sVmFyaWFudEFwcGx5QVBJIiwiYWN0aXZhdGVWYXJpYW50IiwiZWxlbWVudCIsInZhcmlhbnRSZWZlcmVuY2UiLCJfc2V0SW5pdGlhbFN0YXRlc0ZvckRlbHRhQ29tcHV0ZSIsImVycm9yIiwiTG9nIiwib1RhYkJhciIsInNlbGVjdGVkS2V5IiwiZ2V0U2VsZWN0ZWRLZXkiLCJvQ29udHJvbFN0YXRlIiwib1NlbGVjdGVkSXRlbSIsImdldEl0ZW1zIiwiZmluZCIsIm9JdGVtIiwiZ2V0S2V5Iiwic2V0U2VsZWN0ZWRJdGVtIiwiZmlsdGVyQmFyIiwiY29udHJvbFN0YXRlS2V5IiwiZ2V0U3RhdGVLZXkiLCJmaWx0ZXJCYXJTdGF0ZSIsIlN0YXRlVXRpbCIsInJldHJpZXZlRXh0ZXJuYWxTdGF0ZSIsInByb3BlcnRpZXNJbmZvIiwiZ2V0UHJvcGVydHlJbmZvU2V0IiwiZmlsdGVyIiwiUHJvcGVydHlJbmZvIiwiT2JqZWN0Iiwia2V5cyIsImxlbmd0aCIsInBhdGgiLCJyZW1vdmVGcm9tQXBwU3RhdGUiLCJmb3JFYWNoIiwiX2dldENvbnRyb2xTdGF0ZSIsImluaXRpYWxTdGF0ZSIsImluZGV4T2YiLCJnZXRJZCIsImRpZmZTdGF0ZSIsImZ1bGxTdGF0ZSIsImFwcGx5RXh0ZXJuYWxTdGF0ZSIsInRhYmxlIiwidGFibGVTdGF0ZSIsInN1cHBsZW1lbnRhcnlDb25maWciLCJvRGlmZlN0YXRlIiwicmVmcmVzaEJpbmRpbmciLCJvVGFibGUiLCJvVGFibGVCaW5kaW5nIiwiZ2V0Um93QmluZGluZyIsIm9Sb290QmluZGluZyIsImdldFJvb3RCaW5kaW5nIiwicmVmcmVzaCIsIm9IZWFkZXJDb250ZXh0IiwiZ2V0SGVhZGVyQ29udGV4dCIsInNHcm91cElkIiwiZ2V0R3JvdXBJZCIsInJlcXVlc3RTaWRlRWZmZWN0cyIsIiROYXZpZ2F0aW9uUHJvcGVydHlQYXRoIiwiaW5mbyIsIm9DaGFydCIsIm9PUExheW91dCIsInNlbGVjdGVkU2VjdGlvbiIsImdldFNlbGVjdGVkU2VjdGlvbiIsInNldFNlbGVjdGVkU2VjdGlvbiIsIm9CaW5kaW5nQ29udGV4dCIsImdldEJpbmRpbmdDb250ZXh0Iiwib0JpbmRpbmciLCJnZXRCaW5kaW5nIiwic01ldGFQYXRoIiwiTW9kZWxIZWxwZXIiLCJnZXRNZXRhUGF0aEZvckNvbnRleHQiLCJzU3RyYXRlZ3kiLCJLZWVwQWxpdmVIZWxwZXIiLCJnZXRDb250cm9sUmVmcmVzaFN0cmF0ZWd5Rm9yQ29udGV4dFBhdGgiLCJvTW9kZWwiLCJnZXRNb2RlbCIsIm9NZXRhTW9kZWwiLCJnZXRNZXRhTW9kZWwiLCJvTmF2aWdhdGlvblByb3BlcnRpZXMiLCJDb21tb25VdGlscyIsImdldENvbnRleHRQYXRoUHJvcGVydGllcyIsIiRraW5kIiwiYU5hdlByb3BlcnRpZXNUb1JlcXVlc3QiLCJyZWR1Y2UiLCJhUHJldiIsInNOYXZQcm9wIiwiJGlzQ29sbGVjdGlvbiIsImFQcm9wZXJ0aWVzIiwiJFByb3BlcnR5UGF0aCIsImNvbmNhdCIsIm9RdWlja0ZpbHRlciIsImdldFNlbGVjdG9yS2V5Iiwic2V0U2VsZWN0b3JLZXkiLCJvU2VnbWVudGVkQnV0dG9uIiwic2V0U2VsZWN0ZWRLZXkiLCJvU2VsZWN0Iiwib0R5bmFtaWNQYWdlIiwiaGVhZGVyRXhwYW5kZWQiLCJnZXRIZWFkZXJFeHBhbmRlZCIsInNldEhlYWRlckV4cGFuZGVkIiwib1ZpZXciLCJvQ29udHJvbGxlciIsImdldENvbnRyb2xsZXIiLCJ2aWV3U3RhdGUiLCJyZXRyaWV2ZVZpZXdTdGF0ZSIsIm9OYXZQYXJhbWV0ZXJzIiwiYXBwbHlWaWV3U3RhdGUiLCJyZWZyZXNoVmlld0JpbmRpbmdzIiwib0NvbXBvbmVudENvbnRhaW5lciIsIm9Db21wb25lbnQiLCJnZXRDb21wb25lbnRJbnN0YW5jZSIsInJldHJpZXZlQ29udHJvbFN0YXRlIiwiZ2V0Um9vdENvbnRyb2wiLCJhcHBseUNvbnRyb2xTdGF0ZSIsIlZpZXdTdGF0ZSIsImRlZmluZVVJNUNsYXNzIiwicHVibGljRXh0ZW5zaW9uIiwiZmluYWxFeHRlbnNpb24iLCJleHRlbnNpYmxlIiwiT3ZlcnJpZGVFeGVjdXRpb24iLCJBZnRlciIsInByaXZhdGVFeHRlbnNpb24iLCJJbnN0ZWFkIiwiaW5pdGlhbENvbnRyb2xTdGF0ZXNNYXBwZXIiLCJ2aWV3U3RhdGVDb250cm9scyIsInZhcmlhbnRNYW5hZ2VtZW50IiwiYWRhcHRDb250cm9scyIsImV4dGVybmFsU3RhdGVQcm9taXNlcyIsImluaXRpYWxDb250cm9sU3RhdGVzIiwidmFyaWFudENvbnRyb2xzIiwiY29udHJvbCIsImlzQSIsIl9hZGRFdmVudExpc3RlbmVyc1RvVmFyaWFudE1hbmFnZW1lbnQiLCJleHRlcm5hbFN0YXRlUHJvbWlzZSIsIlByb21pc2UiLCJhbGwiLCJpbml0aWFsQ29udHJvbFN0YXRlIiwiaSIsImUiLCJfaVJldHJpZXZpbmdTdGF0ZUNvdW50ZXIiLCJfcEluaXRpYWxTdGF0ZUFwcGxpZWQiLCJyZXNvbHZlIiwiX3BJbml0aWFsU3RhdGVBcHBsaWVkUmVzb2x2ZSIsImFDb250cm9scyIsImNvbGxlY3RSZXN1bHRzIiwiYmFzZSIsImFkYXB0QmluZGluZ1JlZnJlc2hDb250cm9scyIsIm9Qcm9taXNlQ2hhaW4iLCJvQ29udHJvbCIsInRoZW4iLCJyZWZyZXNoQ29udHJvbEJpbmRpbmciLCJiaW5kIiwiYUNvbGxlY3RlZENvbnRyb2xzIiwib0NvbnRyb2xSZWZyZXNoQmluZGluZ0hhbmRsZXIiLCJnZXRDb250cm9sUmVmcmVzaEJpbmRpbmdIYW5kbGVyIiwiZ2V0TWV0YWRhdGEiLCJnZXROYW1lIiwib1JlZnJlc2hCaW5kaW5nSGFuZGxlciIsInNUeXBlIiwiYWRhcHRCaW5kaW5nUmVmcmVzaEhhbmRsZXIiLCJvQ29udHJvbEhhbmRsZXIiLCJvblN1c3BlbmQiLCJvblJlc3RvcmUiLCJkZXN0cm95IiwiZm5DYWxsIiwiYVJlc3VsdHMiLCJhcmdzIiwiYWRhcHRDb250cm9sU3RhdGVIYW5kbGVyIiwiYUNvbnRyb2xIYW5kbGVyIiwiZ2V0Q29udHJvbFN0YXRlSGFuZGxlciIsImFJbnRlcm5hbENvbnRyb2xTdGF0ZUhhbmRsZXIiLCJhQ3VzdG9tQ29udHJvbFN0YXRlSGFuZGxlciIsImFzc2lnbiIsImFkYXB0U3RhdGVDb250cm9scyIsImdldFZpZXciLCJnZXRMb2NhbElkIiwib1ZpZXdTdGF0ZSIsImFSZXNvbHZlZFN0YXRlcyIsIm1hcCIsInZSZXN1bHQiLCJrZXkiLCJ2YWx1ZSIsIm9TdGF0ZXMiLCJtU3RhdGUiLCJvQ3VycmVudFN0YXRlIiwibWVyZ2VPYmplY3RzIiwibUFkZGl0aW9uYWxTdGF0ZXMiLCJfcmV0cmlldmVBZGRpdGlvbmFsU3RhdGVzIiwicmV0cmlldmVBZGRpdGlvbmFsU3RhdGVzIiwiYUNvbnRyb2xTdGF0ZUhhbmRsZXJzIiwibUNvbnRyb2xTdGF0ZUhhbmRsZXIiLCJFcnJvciIsImNhbGwiLCJhU3RhdGVzIiwib0ZpbmFsU3RhdGUiLCJhcHBseUluaXRpYWxTdGF0ZU9ubHkiLCJvTmF2UGFyYW1ldGVyIiwiX2dldEluaXRpYWxTdGF0ZUFwcGxpZWQiLCJvbkJlZm9yZVN0YXRlQXBwbGllZCIsImhhc1ZhcmlhbnRNYW5hZ2VtZW50Iiwic29ydGVkQWRhcHRTdGF0ZUNvbnRyb2xzIiwibW9kaWZpZWRDb250cm9scyIsImlzVmFyaWFudE1hbmFnZW1lbnRDb250cm9sIiwic0tleSIsIm5hdmlnYXRpb25UeXBlIiwiaUFwcFN0YXRlIiwiYXBwbHlBZGRpdGlvbmFsU3RhdGVzIiwiYXBwbHlOYXZpZ2F0aW9uUGFyYW1ldGVycyIsIl9hcHBseU5hdmlnYXRpb25QYXJhbWV0ZXJzVG9GaWx0ZXJiYXIiLCJvbkFmdGVyU3RhdGVBcHBsaWVkIiwiX3NldEluaXRpYWxTdGF0ZUFwcGxpZWQiLCJzVmFyaWFudElkIiwiYVZhcmlhbnRzIiwiZ2V0VmFyaWFudHMiLCJiSXNDb250cm9sU3RhdGVWYXJpYW50QXZhaWxhYmxlIiwib1ZhcmlhbnQiLCJwSW5pdGlhbFN0YXRlQXBwbGllZFJlc29sdmUiLCJhUHJvbWlzZXMiLCJfb05hdlBhcmFtZXRlciIsIl9hUHJvbWlzZXMiLCJnZXRJbnRlcmZhY2UiLCJvUGF5bG9hZCIsInZhcmlhbnRNYW5hZ2VkQ29udHJvbHMiLCJmbkV2ZW50IiwiX3VwZGF0ZUluaXRpYWxTdGF0ZXNPblZhcmlhbnRDaGFuZ2UiLCJhdHRhY2hTYXZlIiwiYXR0YWNoU2VsZWN0Iiwidm1Bc3NvY2lhdGVkQ29udHJvbHNUb1Jlc2V0IiwiY29udHJvbEtleSIsInZtQXNzb2NpYXRlZGNvbnRyb2xLZXkiLCJDb250cm9sbGVyRXh0ZW5zaW9uIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJWaWV3U3RhdGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgbWVyZ2VPYmplY3RzIGZyb20gXCJzYXAvYmFzZS91dGlsL21lcmdlXCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgeyBkZWZpbmVVSTVDbGFzcywgZXh0ZW5zaWJsZSwgZmluYWxFeHRlbnNpb24sIHByaXZhdGVFeHRlbnNpb24sIHB1YmxpY0V4dGVuc2lvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IEtlZXBBbGl2ZUhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9LZWVwQWxpdmVIZWxwZXJcIjtcbmltcG9ydCBNb2RlbEhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Nb2RlbEhlbHBlclwiO1xuaW1wb3J0IHR5cGUgUGFnZUNvbnRyb2xsZXIgZnJvbSBcInNhcC9mZS9jb3JlL1BhZ2VDb250cm9sbGVyXCI7XG5pbXBvcnQgTmF2TGlicmFyeSBmcm9tIFwic2FwL2ZlL25hdmlnYXRpb24vbGlicmFyeVwiO1xuaW1wb3J0IHR5cGUgTWFuYWdlZE9iamVjdCBmcm9tIFwic2FwL3VpL2Jhc2UvTWFuYWdlZE9iamVjdFwiO1xuaW1wb3J0IHR5cGUgQmFzZU9iamVjdCBmcm9tIFwic2FwL3VpL2Jhc2UvT2JqZWN0XCI7XG5pbXBvcnQgQ29udHJvbGxlckV4dGVuc2lvbiBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL0NvbnRyb2xsZXJFeHRlbnNpb25cIjtcbmltcG9ydCBPdmVycmlkZUV4ZWN1dGlvbiBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL092ZXJyaWRlRXhlY3V0aW9uXCI7XG5pbXBvcnQgQ29udHJvbFZhcmlhbnRBcHBseUFQSSBmcm9tIFwic2FwL3VpL2ZsL2FwcGx5L2FwaS9Db250cm9sVmFyaWFudEFwcGx5QVBJXCI7XG4vLyBpbXBvcnQgQ2hhcnQgZnJvbSBcInNhcC91aS9tZGMvQ2hhcnRcIjtcbmltcG9ydCB0eXBlIEZpbHRlckJhciBmcm9tIFwic2FwL3VpL21kYy9GaWx0ZXJCYXJcIjtcbmltcG9ydCB0eXBlIEZpbHRlckJhckJhc2UgZnJvbSBcInNhcC91aS9tZGMvZmlsdGVyYmFyL0ZpbHRlckJhckJhc2VcIjtcbmltcG9ydCBTdGF0ZVV0aWwgZnJvbSBcInNhcC91aS9tZGMvcDEzbi9TdGF0ZVV0aWxcIjtcbmltcG9ydCB0eXBlIFRhYmxlIGZyb20gXCJzYXAvdWkvbWRjL1RhYmxlXCI7XG5pbXBvcnQgdHlwZSB7IFByb3BlcnR5SW5mbyB9IGZyb20gXCJzYXAvdWkvbWRjL3V0aWwvUHJvcGVydHlIZWxwZXJcIjtcbmltcG9ydCB0eXBlIHsgTWV0YU1vZGVsTmF2UHJvcGVydHksIFZhcmlhbnRNYW5hZ2VtZW50IH0gZnJvbSBcInR5cGVzL2V4dGVuc2lvbl90eXBlc1wiO1xuXG4vLyBhZGRpdGlvbmFsU3RhdGVzIGFyZSBzdG9yZWQgbmV4dCB0byBjb250cm9sIElEcywgc28gbmFtZSBjbGFzaCBhdm9pZGFuY2UgbmVlZGVkLiBGb3J0dW5hdGVseSBJRHMgaGF2ZSByZXN0cmljdGlvbnM6XG4vLyBcIkFsbG93ZWQgaXMgYSBzZXF1ZW5jZSBvZiBjaGFyYWN0ZXJzIChjYXBpdGFsL2xvd2VyY2FzZSksIGRpZ2l0cywgdW5kZXJzY29yZXMsIGRhc2hlcywgcG9pbnRzIGFuZC9vciBjb2xvbnMuXCJcbi8vIFRoZXJlZm9yZSBhZGRpbmcgYSBzeW1ib2wgbGlrZSAjIG9yIEBcbmNvbnN0IEFERElUSU9OQUxfU1RBVEVTX0tFWSA9IFwiI2FkZGl0aW9uYWxTdGF0ZXNcIixcblx0TmF2VHlwZSA9IE5hdkxpYnJhcnkuTmF2VHlwZTtcblxuLyoqXG4gKiBEZWZpbml0aW9uIG9mIGEgY3VzdG9tIGFjdGlvbiB0byBiZSB1c2VkIGluc2lkZSB0aGUgdGFibGUgdG9vbGJhclxuICpcbiAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5OYXZpZ2F0aW9uUGFyYW1ldGVyXG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCB0eXBlIE5hdmlnYXRpb25QYXJhbWV0ZXIgPSB7XG5cdC8qKlxuXHQgKiAgVGhlIGFjdHVhbCBuYXZpZ2F0aW9uIHR5cGUuXG5cdCAqXG5cdCAqICBAcHVibGljXG5cdCAqL1xuXHRuYXZpZ2F0aW9uVHlwZTogc3RyaW5nO1xuXHQvKipcblx0ICogVGhlIHNlbGVjdGlvblZhcmlhbnQgZnJvbSB0aGUgbmF2aWdhdGlvbi5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0c2VsZWN0aW9uVmFyaWFudD86IG9iamVjdDtcblx0LyoqXG5cdCAqIFRoZSBzZWxlY3Rpb25WYXJpYW50IGRlZmF1bHRzIGZyb20gdGhlIG5hdmlnYXRpb25cblx0ICpcblx0ICogIEBwdWJsaWNcblx0ICovXG5cdHNlbGVjdGlvblZhcmlhbnREZWZhdWx0cz86IG9iamVjdDtcblx0LyoqXG5cdCAqIERlZmluZXMgd2hldGhlciB0aGUgc3RhbmRhcmQgdmFyaWFudCBtdXN0IGJlIHVzZWQgaW4gdmFyaWFudCBtYW5hZ2VtZW50XG5cdCAqXG5cdCAqICBAcHVibGljXG5cdCAqL1xuXHRyZXF1aXJlc1N0YW5kYXJkVmFyaWFudD86IGJvb2xlYW47XG59O1xuXG5leHBvcnQgdHlwZSBDb250cm9sU3RhdGUgPVxuXHR8ICh7XG5cdFx0XHRpbml0aWFsU3RhdGU/OiB7XG5cdFx0XHRcdHN1cHBsZW1lbnRhcnlDb25maWc6IG9iamVjdDtcblx0XHRcdH07XG5cdFx0XHRmdWxsU3RhdGU/OiBvYmplY3Q7XG5cdCAgfSAmIFJlY29yZDxzdHJpbmcsIHVua25vd24+KVxuXHR8IHVuZGVmaW5lZDtcblxuZXhwb3J0IHR5cGUgRmlsdGVyQmFyU3RhdGUgPSB7XG5cdGZpbHRlcj86IFJlY29yZDxzdHJpbmcsIEFycmF5PG9iamVjdD4+O1xufSAmIFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBtZXRob2RzIHRvIHJldHJpZXZlICYgYXBwbHkgc3RhdGVzIGZvciB0aGUgZGlmZmVyZW50IGNvbnRyb2xzIC8vXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbmNvbnN0IF9tQ29udHJvbFN0YXRlSGFuZGxlck1hcDogUmVjb3JkPHN0cmluZywgYW55PiA9IHtcblx0XCJzYXAudWkuZmwudmFyaWFudHMuVmFyaWFudE1hbmFnZW1lbnRcIjoge1xuXHRcdHJldHJpZXZlOiBmdW5jdGlvbiAob1ZNOiBWYXJpYW50TWFuYWdlbWVudCk6IHsgdmFyaWFudElkOiBzdHJpbmcgfCBudWxsIH0ge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0dmFyaWFudElkOiBvVk0uZ2V0Q3VycmVudFZhcmlhbnRLZXkoKVxuXHRcdFx0fTtcblx0XHR9LFxuXHRcdGFwcGx5OiBhc3luYyBmdW5jdGlvbiAob1ZNOiBWYXJpYW50TWFuYWdlbWVudCwgY29udHJvbFN0YXRlOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB8IHVuZGVmaW5lZCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0aWYgKGNvbnRyb2xTdGF0ZSAmJiBjb250cm9sU3RhdGUudmFyaWFudElkICE9PSB1bmRlZmluZWQgJiYgY29udHJvbFN0YXRlLnZhcmlhbnRJZCAhPT0gb1ZNLmdldEN1cnJlbnRWYXJpYW50S2V5KCkpIHtcblx0XHRcdFx0XHRjb25zdCBpc1ZhcmlhbnRJZEF2YWlsYWJsZSA9IHRoaXMuX2NoZWNrSWZWYXJpYW50SWRJc0F2YWlsYWJsZShvVk0sIGNvbnRyb2xTdGF0ZS52YXJpYW50SWQpO1xuXHRcdFx0XHRcdGxldCBzVmFyaWFudFJlZmVyZW5jZTtcblx0XHRcdFx0XHRpZiAoaXNWYXJpYW50SWRBdmFpbGFibGUpIHtcblx0XHRcdFx0XHRcdHNWYXJpYW50UmVmZXJlbmNlID0gY29udHJvbFN0YXRlLnZhcmlhbnRJZDtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0c1ZhcmlhbnRSZWZlcmVuY2UgPSBvVk0uZ2V0U3RhbmRhcmRWYXJpYW50S2V5KCk7XG5cdFx0XHRcdFx0XHR0aGlzLmNvbnRyb2xzVmFyaWFudElkVW5hdmFpbGFibGUucHVzaCguLi5vVk0uZ2V0Rm9yKCkpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0YXdhaXQgQ29udHJvbFZhcmlhbnRBcHBseUFQSS5hY3RpdmF0ZVZhcmlhbnQoe1xuXHRcdFx0XHRcdFx0XHRlbGVtZW50OiBvVk0sXG5cdFx0XHRcdFx0XHRcdHZhcmlhbnRSZWZlcmVuY2U6IHNWYXJpYW50UmVmZXJlbmNlIGFzIHN0cmluZ1xuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdGF3YWl0IHRoaXMuX3NldEluaXRpYWxTdGF0ZXNGb3JEZWx0YUNvbXB1dGUob1ZNKTtcblx0XHRcdFx0XHR9IGNhdGNoIChlcnJvciA6IHVua25vd24pIHtcblx0XHRcdFx0XHRcdExvZy5lcnJvcihlcnJvciBhcyBzdHJpbmcpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRoaXMuX3NldEluaXRpYWxTdGF0ZXNGb3JEZWx0YUNvbXB1dGUob1ZNKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBjYXRjaCAoZXJyb3I6IHVua25vd24pIHtcblx0XHRcdFx0TG9nLmVycm9yKGVycm9yIGFzIHN0cmluZyk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRcInNhcC5tLkljb25UYWJCYXJcIjoge1xuXHRcdHJldHJpZXZlOiBmdW5jdGlvbiAob1RhYkJhcjogYW55KSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRzZWxlY3RlZEtleTogb1RhYkJhci5nZXRTZWxlY3RlZEtleSgpXG5cdFx0XHR9O1xuXHRcdH0sXG5cdFx0YXBwbHk6IGZ1bmN0aW9uIChvVGFiQmFyOiBhbnksIG9Db250cm9sU3RhdGU6IGFueSkge1xuXHRcdFx0aWYgKG9Db250cm9sU3RhdGUgJiYgb0NvbnRyb2xTdGF0ZS5zZWxlY3RlZEtleSkge1xuXHRcdFx0XHRjb25zdCBvU2VsZWN0ZWRJdGVtID0gb1RhYkJhci5nZXRJdGVtcygpLmZpbmQoZnVuY3Rpb24gKG9JdGVtOiBhbnkpIHtcblx0XHRcdFx0XHRyZXR1cm4gb0l0ZW0uZ2V0S2V5KCkgPT09IG9Db250cm9sU3RhdGUuc2VsZWN0ZWRLZXk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRpZiAob1NlbGVjdGVkSXRlbSkge1xuXHRcdFx0XHRcdG9UYWJCYXIuc2V0U2VsZWN0ZWRJdGVtKG9TZWxlY3RlZEl0ZW0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRcInNhcC51aS5tZGMuRmlsdGVyQmFyXCI6IHtcblx0XHRyZXRyaWV2ZTogYXN5bmMgZnVuY3Rpb24gKGZpbHRlckJhcjogRmlsdGVyQmFyQmFzZSkge1xuXHRcdFx0Y29uc3QgY29udHJvbFN0YXRlS2V5ID0gdGhpcy5nZXRTdGF0ZUtleShmaWx0ZXJCYXIpO1xuXHRcdFx0Y29uc3QgZmlsdGVyQmFyU3RhdGUgPSBhd2FpdCBTdGF0ZVV0aWwucmV0cmlldmVFeHRlcm5hbFN0YXRlKGZpbHRlckJhcik7XG5cdFx0XHQvLyByZW1vdmUgc2Vuc2l0aXZlIG9yIHZpZXcgc3RhdGUgaXJyZWxldmFudCBmaWVsZHNcblx0XHRcdGNvbnN0IHByb3BlcnRpZXNJbmZvID0gZmlsdGVyQmFyLmdldFByb3BlcnR5SW5mb1NldCgpO1xuXHRcdFx0Y29uc3QgZmlsdGVyID0gZmlsdGVyQmFyU3RhdGUuZmlsdGVyIHx8IHt9O1xuXHRcdFx0cHJvcGVydGllc0luZm9cblx0XHRcdFx0LmZpbHRlcihmdW5jdGlvbiAoUHJvcGVydHlJbmZvOiBQcm9wZXJ0eUluZm8pIHtcblx0XHRcdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHRcdFx0T2JqZWN0LmtleXMoZmlsdGVyKS5sZW5ndGggPiAwICYmXG5cdFx0XHRcdFx0XHRQcm9wZXJ0eUluZm8ucGF0aCAmJlxuXHRcdFx0XHRcdFx0ZmlsdGVyW1Byb3BlcnR5SW5mby5wYXRoXSAmJlxuXHRcdFx0XHRcdFx0KFByb3BlcnR5SW5mby5yZW1vdmVGcm9tQXBwU3RhdGUgfHwgZmlsdGVyW1Byb3BlcnR5SW5mby5wYXRoXS5sZW5ndGggPT09IDApXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fSlcblx0XHRcdFx0LmZvckVhY2goZnVuY3Rpb24gKFByb3BlcnR5SW5mbzogUHJvcGVydHlJbmZvKSB7XG5cdFx0XHRcdFx0aWYgKFByb3BlcnR5SW5mby5wYXRoKSB7XG5cdFx0XHRcdFx0XHRkZWxldGUgZmlsdGVyW1Byb3BlcnR5SW5mby5wYXRoXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIHRoaXMuX2dldENvbnRyb2xTdGF0ZShjb250cm9sU3RhdGVLZXksIGZpbHRlckJhclN0YXRlKTtcblx0XHR9LFxuXHRcdGFwcGx5OiBhc3luYyBmdW5jdGlvbiAoZmlsdGVyQmFyOiBGaWx0ZXJCYXIsIGNvbnRyb2xTdGF0ZTogQ29udHJvbFN0YXRlKSB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRpZiAoY29udHJvbFN0YXRlKSB7XG5cdFx0XHRcdFx0aWYgKGNvbnRyb2xTdGF0ZT8uaW5pdGlhbFN0YXRlICYmIHRoaXMuY29udHJvbHNWYXJpYW50SWRVbmF2YWlsYWJsZS5pbmRleE9mKGZpbHRlckJhci5nZXRJZCgpKSA9PT0gLTEpIHtcblx0XHRcdFx0XHRcdGNvbnN0IGRpZmZTdGF0ZTogb2JqZWN0ID0gYXdhaXQgU3RhdGVVdGlsLmRpZmZTdGF0ZShcblx0XHRcdFx0XHRcdFx0ZmlsdGVyQmFyLFxuXHRcdFx0XHRcdFx0XHRjb250cm9sU3RhdGUuaW5pdGlhbFN0YXRlIGFzIG9iamVjdCxcblx0XHRcdFx0XHRcdFx0Y29udHJvbFN0YXRlLmZ1bGxTdGF0ZSBhcyBvYmplY3Rcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRyZXR1cm4gU3RhdGVVdGlsLmFwcGx5RXh0ZXJuYWxTdGF0ZShmaWx0ZXJCYXIsIGRpZmZTdGF0ZSk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHJldHVybiBTdGF0ZVV0aWwuYXBwbHlFeHRlcm5hbFN0YXRlKGZpbHRlckJhciwgY29udHJvbFN0YXRlPy5mdWxsU3RhdGUgPz8gY29udHJvbFN0YXRlKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0gY2F0Y2ggKGVycm9yOiB1bmtub3duKSB7XG5cdFx0XHRcdExvZy5lcnJvcihlcnJvciBhcyBzdHJpbmcpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0XCJzYXAudWkubWRjLlRhYmxlXCI6IHtcblx0XHRyZXRyaWV2ZTogYXN5bmMgZnVuY3Rpb24gKHRhYmxlOiBUYWJsZSkge1xuXHRcdFx0Y29uc3QgY29udHJvbFN0YXRlS2V5ID0gdGhpcy5nZXRTdGF0ZUtleSh0YWJsZSk7XG5cdFx0XHRjb25zdCB0YWJsZVN0YXRlID0gYXdhaXQgU3RhdGVVdGlsLnJldHJpZXZlRXh0ZXJuYWxTdGF0ZSh0YWJsZSk7XG5cdFx0XHRyZXR1cm4gdGhpcy5fZ2V0Q29udHJvbFN0YXRlKGNvbnRyb2xTdGF0ZUtleSwgdGFibGVTdGF0ZSk7XG5cdFx0fSxcblx0XHRhcHBseTogYXN5bmMgZnVuY3Rpb24gKHRhYmxlOiBUYWJsZSwgY29udHJvbFN0YXRlOiBDb250cm9sU3RhdGUpIHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdGlmIChjb250cm9sU3RhdGUpIHtcblx0XHRcdFx0XHQvLyBFeHRyYSBjb25kaXRpb24gYWRkZWQgdG8gYXBwbHkgdGhlIGRpZmYgc3RhdGUgbG9naWMgZm9yIG1kYyBjb250cm9sXG5cdFx0XHRcdFx0aWYgKGNvbnRyb2xTdGF0ZT8uaW5pdGlhbFN0YXRlICYmIHRoaXMuY29udHJvbHNWYXJpYW50SWRVbmF2YWlsYWJsZS5pbmRleE9mKHRhYmxlLmdldElkKCkpID09PSAtMSkge1xuXHRcdFx0XHRcdFx0aWYgKCFjb250cm9sU3RhdGUuaW5pdGlhbFN0YXRlPy5zdXBwbGVtZW50YXJ5Q29uZmlnKSB7XG5cdFx0XHRcdFx0XHRcdGNvbnRyb2xTdGF0ZS5pbml0aWFsU3RhdGUuc3VwcGxlbWVudGFyeUNvbmZpZyA9IHt9O1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Y29uc3Qgb0RpZmZTdGF0ZSA9IGF3YWl0IFN0YXRlVXRpbC5kaWZmU3RhdGUoXG5cdFx0XHRcdFx0XHRcdHRhYmxlLFxuXHRcdFx0XHRcdFx0XHRjb250cm9sU3RhdGUuaW5pdGlhbFN0YXRlIGFzIG9iamVjdCxcblx0XHRcdFx0XHRcdFx0Y29udHJvbFN0YXRlLmZ1bGxTdGF0ZSBhcyBvYmplY3Rcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRyZXR1cm4gU3RhdGVVdGlsLmFwcGx5RXh0ZXJuYWxTdGF0ZSh0YWJsZSwgb0RpZmZTdGF0ZSk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGlmICghY29udHJvbFN0YXRlLnN1cHBsZW1lbnRhcnlDb25maWcpIHtcblx0XHRcdFx0XHRcdFx0Y29udHJvbFN0YXRlLnN1cHBsZW1lbnRhcnlDb25maWcgPSB7fTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHJldHVybiBTdGF0ZVV0aWwuYXBwbHlFeHRlcm5hbFN0YXRlKHRhYmxlLCBjb250cm9sU3RhdGU/LmZ1bGxTdGF0ZSA/PyBjb250cm9sU3RhdGUpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdFx0TG9nLmVycm9yKGVycm9yIGFzIHN0cmluZyk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRyZWZyZXNoQmluZGluZzogZnVuY3Rpb24gKG9UYWJsZTogYW55KSB7XG5cdFx0XHRjb25zdCBvVGFibGVCaW5kaW5nID0gb1RhYmxlLmdldFJvd0JpbmRpbmcoKTtcblx0XHRcdGlmIChvVGFibGVCaW5kaW5nKSB7XG5cdFx0XHRcdGNvbnN0IG9Sb290QmluZGluZyA9IG9UYWJsZUJpbmRpbmcuZ2V0Um9vdEJpbmRpbmcoKTtcblx0XHRcdFx0aWYgKG9Sb290QmluZGluZyA9PT0gb1RhYmxlQmluZGluZykge1xuXHRcdFx0XHRcdC8vIGFic29sdXRlIGJpbmRpbmdcblx0XHRcdFx0XHRvVGFibGVCaW5kaW5nLnJlZnJlc2goKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyByZWxhdGl2ZSBiaW5kaW5nXG5cdFx0XHRcdFx0Y29uc3Qgb0hlYWRlckNvbnRleHQgPSBvVGFibGVCaW5kaW5nLmdldEhlYWRlckNvbnRleHQoKTtcblx0XHRcdFx0XHRjb25zdCBzR3JvdXBJZCA9IG9UYWJsZUJpbmRpbmcuZ2V0R3JvdXBJZCgpO1xuXG5cdFx0XHRcdFx0aWYgKG9IZWFkZXJDb250ZXh0KSB7XG5cdFx0XHRcdFx0XHRvSGVhZGVyQ29udGV4dC5yZXF1ZXN0U2lkZUVmZmVjdHMoW3sgJE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGg6IFwiXCIgfV0sIHNHcm91cElkKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdExvZy5pbmZvKGBUYWJsZTogJHtvVGFibGUuZ2V0SWQoKX0gd2FzIG5vdCByZWZyZXNoZWQuIE5vIGJpbmRpbmcgZm91bmQhYCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRcInNhcC51aS5tZGMuQ2hhcnRcIjoge1xuXHRcdHJldHJpZXZlOiBmdW5jdGlvbiAob0NoYXJ0OiBhbnkpIHtcblx0XHRcdHJldHVybiBTdGF0ZVV0aWwucmV0cmlldmVFeHRlcm5hbFN0YXRlKG9DaGFydCk7XG5cdFx0fSxcblx0XHRhcHBseTogZnVuY3Rpb24gKG9DaGFydDogYW55LCBvQ29udHJvbFN0YXRlOiBhbnkpIHtcblx0XHRcdGlmIChvQ29udHJvbFN0YXRlKSB7XG5cdFx0XHRcdHJldHVybiBTdGF0ZVV0aWwuYXBwbHlFeHRlcm5hbFN0YXRlKG9DaGFydCwgb0NvbnRyb2xTdGF0ZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8vIFRPRE86IHVuY29tbWVudCBhZnRlciBtZGMgZml4IGlzIG1lcmdlZFxuXHRcdC8qIHJldHJpZXZlOiBhc3luYyBmdW5jdGlvbiAoY2hhcnQ6IENoYXJ0KSB7XG5cdFx0XHRjb25zdCBjb250cm9sU3RhdGVLZXkgPSB0aGlzLmdldFN0YXRlS2V5KGNoYXJ0KTtcblx0XHRcdGNvbnN0IGNoYXJ0U3RhdGUgPSBhd2FpdCBTdGF0ZVV0aWwucmV0cmlldmVFeHRlcm5hbFN0YXRlKGNoYXJ0KTtcblxuXHRcdFx0cmV0dXJuIHRoaXMuX2dldENvbnRyb2xTdGF0ZShjb250cm9sU3RhdGVLZXksIGNoYXJ0U3RhdGUpO1xuXHRcdH0sXG5cdFx0YXBwbHk6IGFzeW5jIGZ1bmN0aW9uIChjaGFydDogQ2hhcnQsIGNvbnRyb2xTdGF0ZTogQ29udHJvbFN0YXRlKSB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRpZiAoY29udHJvbFN0YXRlKSB7XG5cdFx0XHRcdFx0Ly8gRXh0cmEgY29uZGl0aW9uIGFkZGVkIHRvIGFwcGx5IHRoZSBkaWZmIHN0YXRlIGxvZ2ljIGZvciBtZGMgY29udHJvbFxuXHRcdFx0XHRcdGlmIChjb250cm9sU3RhdGU/LmluaXRpYWxTdGF0ZSAmJiB0aGlzLmNvbnRyb2xzVmFyaWFudElkVW5hdmFpbGFibGUuaW5kZXhPZihjaGFydC5nZXRJZCgpKSA9PT0gLTEpIHtcblx0XHRcdFx0XHRcdGNvbnN0IGRpZmZTdGF0ZSA9IGF3YWl0IFN0YXRlVXRpbC5kaWZmU3RhdGUoXG5cdFx0XHRcdFx0XHRcdGNoYXJ0LFxuXHRcdFx0XHRcdFx0XHRjb250cm9sU3RhdGUuaW5pdGlhbFN0YXRlIGFzIG9iamVjdCxcblx0XHRcdFx0XHRcdFx0Y29udHJvbFN0YXRlLmZ1bGxTdGF0ZSBhcyBvYmplY3Rcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRyZXR1cm4gYXdhaXQgU3RhdGVVdGlsLmFwcGx5RXh0ZXJuYWxTdGF0ZShjaGFydCwgZGlmZlN0YXRlKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0cmV0dXJuIGF3YWl0IFN0YXRlVXRpbC5hcHBseUV4dGVybmFsU3RhdGUoY2hhcnQsIGNvbnRyb2xTdGF0ZT8uZnVsbFN0YXRlID8/IGNvbnRyb2xTdGF0ZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0XHRMb2cuZXJyb3IoZXJyb3IgYXMgc3RyaW5nKTtcblx0XHRcdH1cblx0XHR9ICovXG5cdH0sXG5cdFwic2FwLnV4YXAuT2JqZWN0UGFnZUxheW91dFwiOiB7XG5cdFx0cmV0cmlldmU6IGZ1bmN0aW9uIChvT1BMYXlvdXQ6IGFueSkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0c2VsZWN0ZWRTZWN0aW9uOiBvT1BMYXlvdXQuZ2V0U2VsZWN0ZWRTZWN0aW9uKClcblx0XHRcdH07XG5cdFx0fSxcblx0XHRhcHBseTogZnVuY3Rpb24gKG9PUExheW91dDogYW55LCBvQ29udHJvbFN0YXRlOiBhbnkpIHtcblx0XHRcdGlmIChvQ29udHJvbFN0YXRlKSB7XG5cdFx0XHRcdG9PUExheW91dC5zZXRTZWxlY3RlZFNlY3Rpb24ob0NvbnRyb2xTdGF0ZS5zZWxlY3RlZFNlY3Rpb24pO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0cmVmcmVzaEJpbmRpbmc6IGZ1bmN0aW9uIChvT1BMYXlvdXQ6IGFueSkge1xuXHRcdFx0Y29uc3Qgb0JpbmRpbmdDb250ZXh0ID0gb09QTGF5b3V0LmdldEJpbmRpbmdDb250ZXh0KCk7XG5cdFx0XHRjb25zdCBvQmluZGluZyA9IG9CaW5kaW5nQ29udGV4dCAmJiBvQmluZGluZ0NvbnRleHQuZ2V0QmluZGluZygpO1xuXHRcdFx0aWYgKG9CaW5kaW5nKSB7XG5cdFx0XHRcdGNvbnN0IHNNZXRhUGF0aCA9IE1vZGVsSGVscGVyLmdldE1ldGFQYXRoRm9yQ29udGV4dChvQmluZGluZ0NvbnRleHQpO1xuXHRcdFx0XHRjb25zdCBzU3RyYXRlZ3kgPSBLZWVwQWxpdmVIZWxwZXIuZ2V0Q29udHJvbFJlZnJlc2hTdHJhdGVneUZvckNvbnRleHRQYXRoKG9PUExheW91dCwgc01ldGFQYXRoKTtcblx0XHRcdFx0aWYgKHNTdHJhdGVneSA9PT0gXCJzZWxmXCIpIHtcblx0XHRcdFx0XHQvLyBSZWZyZXNoIG1haW4gY29udGV4dCBhbmQgMS0xIG5hdmlnYXRpb24gcHJvcGVydGllcyBvciBPUFxuXHRcdFx0XHRcdGNvbnN0IG9Nb2RlbCA9IG9CaW5kaW5nQ29udGV4dC5nZXRNb2RlbCgpLFxuXHRcdFx0XHRcdFx0b01ldGFNb2RlbCA9IG9Nb2RlbC5nZXRNZXRhTW9kZWwoKSxcblx0XHRcdFx0XHRcdG9OYXZpZ2F0aW9uUHJvcGVydGllczogUmVjb3JkPHN0cmluZywgTWV0YU1vZGVsTmF2UHJvcGVydHk+ID1cblx0XHRcdFx0XHRcdFx0KENvbW1vblV0aWxzLmdldENvbnRleHRQYXRoUHJvcGVydGllcyhvTWV0YU1vZGVsLCBzTWV0YVBhdGgsIHtcblx0XHRcdFx0XHRcdFx0XHQka2luZDogXCJOYXZpZ2F0aW9uUHJvcGVydHlcIlxuXHRcdFx0XHRcdFx0XHR9KSBhcyBSZWNvcmQ8c3RyaW5nLCBNZXRhTW9kZWxOYXZQcm9wZXJ0eT4pIHx8IHt9LFxuXHRcdFx0XHRcdFx0YU5hdlByb3BlcnRpZXNUb1JlcXVlc3QgPSBPYmplY3Qua2V5cyhvTmF2aWdhdGlvblByb3BlcnRpZXMpLnJlZHVjZShmdW5jdGlvbiAoYVByZXY6IGFueVtdLCBzTmF2UHJvcDogc3RyaW5nKSB7XG5cdFx0XHRcdFx0XHRcdGlmIChvTmF2aWdhdGlvblByb3BlcnRpZXNbc05hdlByb3BdLiRpc0NvbGxlY3Rpb24gIT09IHRydWUpIHtcblx0XHRcdFx0XHRcdFx0XHRhUHJldi5wdXNoKHsgJE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGg6IHNOYXZQcm9wIH0pO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdHJldHVybiBhUHJldjtcblx0XHRcdFx0XHRcdH0sIFtdKSxcblx0XHRcdFx0XHRcdGFQcm9wZXJ0aWVzID0gW3sgJFByb3BlcnR5UGF0aDogXCIqXCIgfV0sXG5cdFx0XHRcdFx0XHRzR3JvdXBJZCA9IG9CaW5kaW5nLmdldEdyb3VwSWQoKTtcblxuXHRcdFx0XHRcdG9CaW5kaW5nQ29udGV4dC5yZXF1ZXN0U2lkZUVmZmVjdHMoYVByb3BlcnRpZXMuY29uY2F0KGFOYXZQcm9wZXJ0aWVzVG9SZXF1ZXN0KSwgc0dyb3VwSWQpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKHNTdHJhdGVneSA9PT0gXCJpbmNsdWRpbmdEZXBlbmRlbnRzXCIpIHtcblx0XHRcdFx0XHQvLyBDb21wbGV0ZSByZWZyZXNoXG5cdFx0XHRcdFx0b0JpbmRpbmcucmVmcmVzaCgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRMb2cuaW5mbyhgT2JqZWN0UGFnZTogJHtvT1BMYXlvdXQuZ2V0SWQoKX0gd2FzIG5vdCByZWZyZXNoZWQuIE5vIGJpbmRpbmcgZm91bmQhYCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRcInNhcC5mZS5tYWNyb3MudGFibGUuUXVpY2tGaWx0ZXJDb250YWluZXJcIjoge1xuXHRcdHJldHJpZXZlOiBmdW5jdGlvbiAob1F1aWNrRmlsdGVyOiBhbnkpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHNlbGVjdGVkS2V5OiBvUXVpY2tGaWx0ZXIuZ2V0U2VsZWN0b3JLZXkoKVxuXHRcdFx0fTtcblx0XHR9LFxuXHRcdGFwcGx5OiBmdW5jdGlvbiAob1F1aWNrRmlsdGVyOiBhbnksIG9Db250cm9sU3RhdGU6IGFueSkge1xuXHRcdFx0aWYgKG9Db250cm9sU3RhdGUpIHtcblx0XHRcdFx0b1F1aWNrRmlsdGVyLnNldFNlbGVjdG9yS2V5KG9Db250cm9sU3RhdGUuc2VsZWN0ZWRLZXkpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0XCJzYXAubS5TZWdtZW50ZWRCdXR0b25cIjoge1xuXHRcdHJldHJpZXZlOiBmdW5jdGlvbiAob1NlZ21lbnRlZEJ1dHRvbjogYW55KSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRzZWxlY3RlZEtleTogb1NlZ21lbnRlZEJ1dHRvbi5nZXRTZWxlY3RlZEtleSgpXG5cdFx0XHR9O1xuXHRcdH0sXG5cdFx0YXBwbHk6IGZ1bmN0aW9uIChvU2VnbWVudGVkQnV0dG9uOiBhbnksIG9Db250cm9sU3RhdGU6IGFueSkge1xuXHRcdFx0aWYgKG9Db250cm9sU3RhdGUpIHtcblx0XHRcdFx0b1NlZ21lbnRlZEJ1dHRvbi5zZXRTZWxlY3RlZEtleShvQ29udHJvbFN0YXRlLnNlbGVjdGVkS2V5KTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdFwic2FwLm0uU2VsZWN0XCI6IHtcblx0XHRyZXRyaWV2ZTogZnVuY3Rpb24gKG9TZWxlY3Q6IGFueSkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0c2VsZWN0ZWRLZXk6IG9TZWxlY3QuZ2V0U2VsZWN0ZWRLZXkoKVxuXHRcdFx0fTtcblx0XHR9LFxuXHRcdGFwcGx5OiBmdW5jdGlvbiAob1NlbGVjdDogYW55LCBvQ29udHJvbFN0YXRlOiBhbnkpIHtcblx0XHRcdGlmIChvQ29udHJvbFN0YXRlKSB7XG5cdFx0XHRcdG9TZWxlY3Quc2V0U2VsZWN0ZWRLZXkob0NvbnRyb2xTdGF0ZS5zZWxlY3RlZEtleSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRcInNhcC5mLkR5bmFtaWNQYWdlXCI6IHtcblx0XHRyZXRyaWV2ZTogZnVuY3Rpb24gKG9EeW5hbWljUGFnZTogYW55KSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRoZWFkZXJFeHBhbmRlZDogb0R5bmFtaWNQYWdlLmdldEhlYWRlckV4cGFuZGVkKClcblx0XHRcdH07XG5cdFx0fSxcblx0XHRhcHBseTogZnVuY3Rpb24gKG9EeW5hbWljUGFnZTogYW55LCBvQ29udHJvbFN0YXRlOiBhbnkpIHtcblx0XHRcdGlmIChvQ29udHJvbFN0YXRlKSB7XG5cdFx0XHRcdG9EeW5hbWljUGFnZS5zZXRIZWFkZXJFeHBhbmRlZChvQ29udHJvbFN0YXRlLmhlYWRlckV4cGFuZGVkKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdFwic2FwLnVpLmNvcmUubXZjLlZpZXdcIjoge1xuXHRcdHJldHJpZXZlOiBmdW5jdGlvbiAob1ZpZXc6IGFueSkge1xuXHRcdFx0Y29uc3Qgb0NvbnRyb2xsZXIgPSBvVmlldy5nZXRDb250cm9sbGVyKCk7XG5cdFx0XHRpZiAob0NvbnRyb2xsZXIgJiYgb0NvbnRyb2xsZXIudmlld1N0YXRlKSB7XG5cdFx0XHRcdHJldHVybiBvQ29udHJvbGxlci52aWV3U3RhdGUucmV0cmlldmVWaWV3U3RhdGUob0NvbnRyb2xsZXIudmlld1N0YXRlKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiB7fTtcblx0XHR9LFxuXHRcdGFwcGx5OiBmdW5jdGlvbiAob1ZpZXc6IGFueSwgb0NvbnRyb2xTdGF0ZTogYW55LCBvTmF2UGFyYW1ldGVyczogYW55KSB7XG5cdFx0XHRjb25zdCBvQ29udHJvbGxlciA9IG9WaWV3LmdldENvbnRyb2xsZXIoKTtcblx0XHRcdGlmIChvQ29udHJvbGxlciAmJiBvQ29udHJvbGxlci52aWV3U3RhdGUpIHtcblx0XHRcdFx0cmV0dXJuIG9Db250cm9sbGVyLnZpZXdTdGF0ZS5hcHBseVZpZXdTdGF0ZShvQ29udHJvbFN0YXRlLCBvTmF2UGFyYW1ldGVycyk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRyZWZyZXNoQmluZGluZzogZnVuY3Rpb24gKG9WaWV3OiBhbnkpIHtcblx0XHRcdGNvbnN0IG9Db250cm9sbGVyID0gb1ZpZXcuZ2V0Q29udHJvbGxlcigpO1xuXHRcdFx0aWYgKG9Db250cm9sbGVyICYmIG9Db250cm9sbGVyLnZpZXdTdGF0ZSkge1xuXHRcdFx0XHRyZXR1cm4gb0NvbnRyb2xsZXIudmlld1N0YXRlLnJlZnJlc2hWaWV3QmluZGluZ3MoKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdFwic2FwLnVpLmNvcmUuQ29tcG9uZW50Q29udGFpbmVyXCI6IHtcblx0XHRyZXRyaWV2ZTogZnVuY3Rpb24gKG9Db21wb25lbnRDb250YWluZXI6IGFueSkge1xuXHRcdFx0Y29uc3Qgb0NvbXBvbmVudCA9IG9Db21wb25lbnRDb250YWluZXIuZ2V0Q29tcG9uZW50SW5zdGFuY2UoKTtcblx0XHRcdGlmIChvQ29tcG9uZW50KSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLnJldHJpZXZlQ29udHJvbFN0YXRlKG9Db21wb25lbnQuZ2V0Um9vdENvbnRyb2woKSk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4ge307XG5cdFx0fSxcblx0XHRhcHBseTogZnVuY3Rpb24gKG9Db21wb25lbnRDb250YWluZXI6IGFueSwgb0NvbnRyb2xTdGF0ZTogYW55LCBvTmF2UGFyYW1ldGVyczogYW55KSB7XG5cdFx0XHRjb25zdCBvQ29tcG9uZW50ID0gb0NvbXBvbmVudENvbnRhaW5lci5nZXRDb21wb25lbnRJbnN0YW5jZSgpO1xuXHRcdFx0aWYgKG9Db21wb25lbnQpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuYXBwbHlDb250cm9sU3RhdGUob0NvbXBvbmVudC5nZXRSb290Q29udHJvbCgpLCBvQ29udHJvbFN0YXRlLCBvTmF2UGFyYW1ldGVycyk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59O1xuLyoqXG4gKiBBIGNvbnRyb2xsZXIgZXh0ZW5zaW9uIG9mZmVyaW5nIGhvb2tzIGZvciBzdGF0ZSBoYW5kbGluZ1xuICpcbiAqIElmIHlvdSBuZWVkIHRvIG1haW50YWluIGEgc3BlY2lmaWMgc3RhdGUgZm9yIHlvdXIgYXBwbGljYXRpb24sIHlvdSBjYW4gdXNlIHRoZSBjb250cm9sbGVyIGV4dGVuc2lvbi5cbiAqXG4gKiBAaGlkZWNvbnN0cnVjdG9yXG4gKiBAcHVibGljXG4gKiBAc2luY2UgMS44NS4wXG4gKi9cbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLlZpZXdTdGF0ZVwiKVxuY2xhc3MgVmlld1N0YXRlIGV4dGVuZHMgQ29udHJvbGxlckV4dGVuc2lvbiB7XG5cdHByaXZhdGUgX2lSZXRyaWV2aW5nU3RhdGVDb3VudGVyOiBudW1iZXI7XG5cblx0cHJpdmF0ZSBfcEluaXRpYWxTdGF0ZUFwcGxpZWQ6IFByb21pc2U8dW5rbm93bj47XG5cblx0cHJpdmF0ZSBfcEluaXRpYWxTdGF0ZUFwcGxpZWRSZXNvbHZlPzogRnVuY3Rpb247XG5cblx0cHJpdmF0ZSBiYXNlITogUGFnZUNvbnRyb2xsZXI7XG5cblx0aW5pdGlhbENvbnRyb2xTdGF0ZXNNYXBwZXI6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0ge307XG5cblx0Y29udHJvbHNWYXJpYW50SWRVbmF2YWlsYWJsZTogc3RyaW5nW10gPSBbXTtcblxuXHR2aWV3U3RhdGVDb250cm9sczogKE1hbmFnZWRPYmplY3QpW10gPSBbXTtcblxuXHQvKipcblx0ICogQ29uc3RydWN0b3IuXG5cdCAqL1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcigpO1xuXHRcdHRoaXMuX2lSZXRyaWV2aW5nU3RhdGVDb3VudGVyID0gMDtcblx0XHR0aGlzLl9wSW5pdGlhbFN0YXRlQXBwbGllZCA9IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG5cdFx0XHR0aGlzLl9wSW5pdGlhbFN0YXRlQXBwbGllZFJlc29sdmUgPSByZXNvbHZlO1xuXHRcdH0pO1xuXHR9XG5cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdGFzeW5jIHJlZnJlc2hWaWV3QmluZGluZ3MoKSB7XG5cdFx0Y29uc3QgYUNvbnRyb2xzID0gYXdhaXQgdGhpcy5jb2xsZWN0UmVzdWx0cyh0aGlzLmJhc2Uudmlld1N0YXRlLmFkYXB0QmluZGluZ1JlZnJlc2hDb250cm9scyk7XG5cdFx0bGV0IG9Qcm9taXNlQ2hhaW4gPSBQcm9taXNlLnJlc29sdmUoKTtcblx0XHRhQ29udHJvbHNcblx0XHRcdC5maWx0ZXIoKG9Db250cm9sOiBhbnkpID0+IHtcblx0XHRcdFx0cmV0dXJuIG9Db250cm9sICYmIG9Db250cm9sLmlzQSAmJiBvQ29udHJvbC5pc0EoXCJzYXAudWkuYmFzZS5NYW5hZ2VkT2JqZWN0XCIpO1xuXHRcdFx0fSlcblx0XHRcdC5mb3JFYWNoKChvQ29udHJvbDogYW55KSA9PiB7XG5cdFx0XHRcdG9Qcm9taXNlQ2hhaW4gPSBvUHJvbWlzZUNoYWluLnRoZW4odGhpcy5yZWZyZXNoQ29udHJvbEJpbmRpbmcuYmluZCh0aGlzLCBvQ29udHJvbCkpO1xuXHRcdFx0fSk7XG5cdFx0cmV0dXJuIG9Qcm9taXNlQ2hhaW47XG5cdH1cblx0LyoqXG5cdCAqIFRoaXMgZnVuY3Rpb24gc2hvdWxkIGFkZCBhbGwgY29udHJvbHMgcmVsZXZhbnQgZm9yIHJlZnJlc2hpbmcgdG8gdGhlIHByb3ZpZGVkIGNvbnRyb2wgYXJyYXkuXG5cdCAqXG5cdCAqIFRoaXMgZnVuY3Rpb24gaXMgbWVhbnQgdG8gYmUgaW5kaXZpZHVhbGx5IG92ZXJyaWRkZW4gYnkgY29uc3VtaW5nIGNvbnRyb2xsZXJzLCBidXQgbm90IHRvIGJlIGNhbGxlZCBkaXJlY3RseS5cblx0ICogVGhlIG92ZXJyaWRlIGV4ZWN1dGlvbiBpczoge0BsaW5rIHNhcC51aS5jb3JlLm12Yy5PdmVycmlkZUV4ZWN1dGlvbi5BZnRlcn0uXG5cdCAqXG5cdCAqIEBwYXJhbSBhQ29sbGVjdGVkQ29udHJvbHMgVGhlIGNvbGxlY3RlZCBjb250cm9sc1xuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuVmlld1N0YXRlI2FkYXB0QmluZGluZ1JlZnJlc2hDb250cm9sc1xuXHQgKiBAcHJvdGVjdGVkXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGV4dGVuc2libGUoT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXIpXG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcblx0YWRhcHRCaW5kaW5nUmVmcmVzaENvbnRyb2xzKGFDb2xsZWN0ZWRDb250cm9sczogTWFuYWdlZE9iamVjdFtdKSB7XG5cdFx0Ly8gdG8gYmUgb3ZlcnJpZGVuXG5cdH1cblxuXHRAcHJpdmF0ZUV4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdHJlZnJlc2hDb250cm9sQmluZGluZyhvQ29udHJvbDogYW55KSB7XG5cdFx0Y29uc3Qgb0NvbnRyb2xSZWZyZXNoQmluZGluZ0hhbmRsZXIgPSB0aGlzLmdldENvbnRyb2xSZWZyZXNoQmluZGluZ0hhbmRsZXIob0NvbnRyb2wpO1xuXHRcdGxldCBvUHJvbWlzZUNoYWluID0gUHJvbWlzZS5yZXNvbHZlKCk7XG5cdFx0aWYgKHR5cGVvZiBvQ29udHJvbFJlZnJlc2hCaW5kaW5nSGFuZGxlci5yZWZyZXNoQmluZGluZyAhPT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRMb2cuaW5mbyhgcmVmcmVzaEJpbmRpbmcgaGFuZGxlciBmb3IgY29udHJvbDogJHtvQ29udHJvbC5nZXRNZXRhZGF0YSgpLmdldE5hbWUoKX0gaXMgbm90IHByb3ZpZGVkYCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG9Qcm9taXNlQ2hhaW4gPSBvUHJvbWlzZUNoYWluLnRoZW4ob0NvbnRyb2xSZWZyZXNoQmluZGluZ0hhbmRsZXIucmVmcmVzaEJpbmRpbmcuYmluZCh0aGlzLCBvQ29udHJvbCkpO1xuXHRcdH1cblx0XHRyZXR1cm4gb1Byb21pc2VDaGFpbjtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGEgbWFwIG9mIDxjb2RlPnJlZnJlc2hCaW5kaW5nPC9jb2RlPiBmdW5jdGlvbiBmb3IgYSBjZXJ0YWluIGNvbnRyb2wuXG5cdCAqXG5cdCAqIEBwYXJhbSB7c2FwLnVpLmJhc2UuTWFuYWdlZE9iamVjdH0gb0NvbnRyb2wgVGhlIGNvbnRyb2wgdG8gZ2V0IHN0YXRlIGhhbmRsZXIgZm9yXG5cdCAqIEByZXR1cm5zIHtvYmplY3R9IEEgcGxhaW4gb2JqZWN0IHdpdGggb25lIGZ1bmN0aW9uOiA8Y29kZT5yZWZyZXNoQmluZGluZzwvY29kZT5cblx0ICovXG5cblx0QHByaXZhdGVFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRnZXRDb250cm9sUmVmcmVzaEJpbmRpbmdIYW5kbGVyKG9Db250cm9sOiBhbnkpOiBhbnkge1xuXHRcdGNvbnN0IG9SZWZyZXNoQmluZGluZ0hhbmRsZXI6IGFueSA9IHt9O1xuXHRcdGlmIChvQ29udHJvbCkge1xuXHRcdFx0Zm9yIChjb25zdCBzVHlwZSBpbiBfbUNvbnRyb2xTdGF0ZUhhbmRsZXJNYXApIHtcblx0XHRcdFx0aWYgKG9Db250cm9sLmlzQShzVHlwZSkpIHtcblx0XHRcdFx0XHQvLyBwYXNzIG9ubHkgdGhlIHJlZnJlc2hCaW5kaW5nIGhhbmRsZXIgaW4gYW4gb2JqZWN0IHNvIHRoYXQgOlxuXHRcdFx0XHRcdC8vIDEuIEFwcGxpY2F0aW9uIGhhcyBhY2Nlc3Mgb25seSB0byByZWZyZXNoQmluZGluZyBhbmQgbm90IGFwcGx5IGFuZCByZXRlcml2ZSBhdCB0aGlzIHN0YWdlXG5cdFx0XHRcdFx0Ly8gMi4gQXBwbGljYXRpb24gbW9kaWZpY2F0aW9ucyB0byB0aGUgb2JqZWN0IHdpbGwgYmUgcmVmbGVjdGVkIGhlcmUgKGFzIHdlIHBhc3MgYnkgcmVmZXJlbmNlKVxuXHRcdFx0XHRcdG9SZWZyZXNoQmluZGluZ0hhbmRsZXJbXCJyZWZyZXNoQmluZGluZ1wiXSA9IF9tQ29udHJvbFN0YXRlSGFuZGxlck1hcFtzVHlwZV0ucmVmcmVzaEJpbmRpbmcgfHwge307XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0dGhpcy5iYXNlLnZpZXdTdGF0ZS5hZGFwdEJpbmRpbmdSZWZyZXNoSGFuZGxlcihvQ29udHJvbCwgb1JlZnJlc2hCaW5kaW5nSGFuZGxlcik7XG5cdFx0cmV0dXJuIG9SZWZyZXNoQmluZGluZ0hhbmRsZXI7XG5cdH1cblx0LyoqXG5cdCAqIEN1c3RvbWl6ZSB0aGUgPGNvZGU+cmVmcmVzaEJpbmRpbmc8L2NvZGU+IGZ1bmN0aW9uIGZvciBhIGNlcnRhaW4gY29udHJvbC5cblx0ICpcblx0ICogVGhpcyBmdW5jdGlvbiBpcyBtZWFudCB0byBiZSBpbmRpdmlkdWFsbHkgb3ZlcnJpZGRlbiBieSBjb25zdW1pbmcgY29udHJvbGxlcnMsIGJ1dCBub3QgdG8gYmUgY2FsbGVkIGRpcmVjdGx5LlxuXHQgKiBUaGUgb3ZlcnJpZGUgZXhlY3V0aW9uIGlzOiB7QGxpbmsgc2FwLnVpLmNvcmUubXZjLk92ZXJyaWRlRXhlY3V0aW9uLkFmdGVyfS5cblx0ICpcblx0ICogQHBhcmFtIG9Db250cm9sIFRoZSBjb250cm9sIGZvciB3aGljaCB0aGUgcmVmcmVzaCBoYW5kbGVyIGlzIGFkYXB0ZWQuXG5cdCAqIEBwYXJhbSBvQ29udHJvbEhhbmRsZXIgQSBwbGFpbiBvYmplY3Qgd2hpY2ggY2FuIGhhdmUgb25lIGZ1bmN0aW9uOiA8Y29kZT5yZWZyZXNoQmluZGluZzwvY29kZT5cblx0ICogQGFsaWFzIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLlZpZXdTdGF0ZSNhZGFwdEJpbmRpbmdSZWZyZXNoSGFuZGxlclxuXHQgKiBAcHJvdGVjdGVkXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGV4dGVuc2libGUoT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXIpXG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcblx0YWRhcHRCaW5kaW5nUmVmcmVzaEhhbmRsZXIob0NvbnRyb2w6IE1hbmFnZWRPYmplY3QsIG9Db250cm9sSGFuZGxlcjogYW55W10pIHtcblx0XHQvLyB0byBiZSBvdmVycmlkZW5cblx0fVxuXG5cdC8qKlxuXHQgKiBDYWxsZWQgd2hlbiB0aGUgYXBwbGljYXRpb24gaXMgc3VzcGVuZGVkIGR1ZSB0byBrZWVwLWFsaXZlIG1vZGUuXG5cdCAqXG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5WaWV3U3RhdGUjb25TdXNwZW5kXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZXh0ZW5zaWJsZShPdmVycmlkZUV4ZWN1dGlvbi5BZnRlcilcblx0b25TdXNwZW5kKCkge1xuXHRcdC8vIHRvIGJlIG92ZXJyaWRlblxuXHR9XG5cblx0LyoqXG5cdCAqIENhbGxlZCB3aGVuIHRoZSBhcHBsaWNhdGlvbiBpcyByZXN0b3JlZCBkdWUgdG8ga2VlcC1hbGl2ZSBtb2RlLlxuXHQgKlxuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuVmlld1N0YXRlI29uUmVzdG9yZVxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGV4dGVuc2libGUoT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXIpXG5cdG9uUmVzdG9yZSgpIHtcblx0XHQvLyB0byBiZSBvdmVycmlkZW5cblx0fVxuXG5cdC8qKlxuXHQgKiBEZXN0cnVjdG9yIG1ldGhvZCBmb3Igb2JqZWN0cy5cblx0ICovXG5cdGRlc3Ryb3koKSB7XG5cdFx0ZGVsZXRlIHRoaXMuX3BJbml0aWFsU3RhdGVBcHBsaWVkUmVzb2x2ZTtcblx0XHRzdXBlci5kZXN0cm95KCk7XG5cdH1cblxuXHQvKipcblx0ICogSGVscGVyIGZ1bmN0aW9uIHRvIGVuYWJsZSBtdWx0aSBvdmVycmlkZS4gSXQgaXMgYWRkaW5nIGFuIGFkZGl0aW9uYWwgcGFyYW1ldGVyIChhcnJheSkgdG8gdGhlIHByb3ZpZGVkXG5cdCAqIGZ1bmN0aW9uIChhbmQgaXRzIHBhcmFtZXRlcnMpLCB0aGF0IHdpbGwgYmUgZXZhbHVhdGVkIHZpYSA8Y29kZT5Qcm9taXNlLmFsbDwvY29kZT4uXG5cdCAqXG5cdCAqIEBwYXJhbSBmbkNhbGwgVGhlIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZFxuXHQgKiBAcGFyYW0gYXJnc1xuXHQgKiBAcmV0dXJucyBBIHByb21pc2UgdG8gYmUgcmVzb2x2ZWQgd2l0aCB0aGUgcmVzdWx0IG9mIGFsbCBvdmVycmlkZXNcblx0ICovXG5cdEBwcml2YXRlRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0Y29sbGVjdFJlc3VsdHMoZm5DYWxsOiBGdW5jdGlvbiwgLi4uYXJnczogYW55W10pIHtcblx0XHRjb25zdCBhUmVzdWx0czogYW55W10gPSBbXTtcblx0XHRhcmdzLnB1c2goYVJlc3VsdHMpO1xuXHRcdGZuQ2FsbC5hcHBseSh0aGlzLCBhcmdzKTtcblx0XHRyZXR1cm4gUHJvbWlzZS5hbGwoYVJlc3VsdHMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEN1c3RvbWl6ZSB0aGUgPGNvZGU+cmV0cmlldmU8L2NvZGU+IGFuZCA8Y29kZT5hcHBseTwvY29kZT4gZnVuY3Rpb25zIGZvciBhIGNlcnRhaW4gY29udHJvbC5cblx0ICpcblx0ICogVGhpcyBmdW5jdGlvbiBpcyBtZWFudCB0byBiZSBpbmRpdmlkdWFsbHkgb3ZlcnJpZGRlbiBieSBjb25zdW1pbmcgY29udHJvbGxlcnMsIGJ1dCBub3QgdG8gYmUgY2FsbGVkIGRpcmVjdGx5LlxuXHQgKiBUaGUgb3ZlcnJpZGUgZXhlY3V0aW9uIGlzOiB7QGxpbmsgc2FwLnVpLmNvcmUubXZjLk92ZXJyaWRlRXhlY3V0aW9uLkFmdGVyfS5cblx0ICpcblx0ICogQHBhcmFtIG9Db250cm9sIFRoZSBjb250cm9sIHRvIGdldCBzdGF0ZSBoYW5kbGVyIGZvclxuXHQgKiBAcGFyYW0gYUNvbnRyb2xIYW5kbGVyIEEgbGlzdCBvZiBwbGFpbiBvYmplY3RzIHdpdGggdHdvIGZ1bmN0aW9uczogPGNvZGU+cmV0cmlldmU8L2NvZGU+IGFuZCA8Y29kZT5hcHBseTwvY29kZT5cblx0ICogQGFsaWFzIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLlZpZXdTdGF0ZSNhZGFwdENvbnRyb2xTdGF0ZUhhbmRsZXJcblx0ICogQHByb3RlY3RlZFxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBleHRlbnNpYmxlKE92ZXJyaWRlRXhlY3V0aW9uLkFmdGVyKVxuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG5cdGFkYXB0Q29udHJvbFN0YXRlSGFuZGxlcihvQ29udHJvbDogTWFuYWdlZE9iamVjdCwgYUNvbnRyb2xIYW5kbGVyOiBvYmplY3RbXSkge1xuXHRcdC8vIHRvIGJlIG92ZXJyaWRkZW4gaWYgbmVlZGVkXG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyBhIG1hcCBvZiA8Y29kZT5yZXRyaWV2ZTwvY29kZT4gYW5kIDxjb2RlPmFwcGx5PC9jb2RlPiBmdW5jdGlvbnMgZm9yIGEgY2VydGFpbiBjb250cm9sLlxuXHQgKlxuXHQgKiBAcGFyYW0gb0NvbnRyb2wgVGhlIGNvbnRyb2wgdG8gZ2V0IHN0YXRlIGhhbmRsZXIgZm9yXG5cdCAqIEByZXR1cm5zIEEgcGxhaW4gb2JqZWN0IHdpdGggdHdvIGZ1bmN0aW9uczogPGNvZGU+cmV0cmlldmU8L2NvZGU+IGFuZCA8Y29kZT5hcHBseTwvY29kZT5cblx0ICovXG5cdEBwcml2YXRlRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0Z2V0Q29udHJvbFN0YXRlSGFuZGxlcihvQ29udHJvbDogYW55KSB7XG5cdFx0Y29uc3QgYUludGVybmFsQ29udHJvbFN0YXRlSGFuZGxlciA9IFtdLFxuXHRcdFx0YUN1c3RvbUNvbnRyb2xTdGF0ZUhhbmRsZXI6IGFueVtdID0gW107XG5cdFx0aWYgKG9Db250cm9sKSB7XG5cdFx0XHRmb3IgKGNvbnN0IHNUeXBlIGluIF9tQ29udHJvbFN0YXRlSGFuZGxlck1hcCkge1xuXHRcdFx0XHRpZiAob0NvbnRyb2wuaXNBKHNUeXBlKSkge1xuXHRcdFx0XHRcdC8vIGF2b2lkIGRpcmVjdCBtYW5pcHVsYXRpb24gb2YgaW50ZXJuYWwgX21Db250cm9sU3RhdGVIYW5kbGVyTWFwXG5cdFx0XHRcdFx0YUludGVybmFsQ29udHJvbFN0YXRlSGFuZGxlci5wdXNoKE9iamVjdC5hc3NpZ24oe30sIF9tQ29udHJvbFN0YXRlSGFuZGxlck1hcFtzVHlwZV0pKTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHR0aGlzLmJhc2Uudmlld1N0YXRlLmFkYXB0Q29udHJvbFN0YXRlSGFuZGxlcihvQ29udHJvbCwgYUN1c3RvbUNvbnRyb2xTdGF0ZUhhbmRsZXIpO1xuXHRcdHJldHVybiBhSW50ZXJuYWxDb250cm9sU3RhdGVIYW5kbGVyLmNvbmNhdChhQ3VzdG9tQ29udHJvbFN0YXRlSGFuZGxlcik7XG5cdH1cblxuXHQvKipcblx0ICogVGhpcyBmdW5jdGlvbiBzaG91bGQgYWRkIGFsbCBjb250cm9scyBmb3IgZ2l2ZW4gdmlldyB0aGF0IHNob3VsZCBiZSBjb25zaWRlcmVkIGZvciB0aGUgc3RhdGUgaGFuZGxpbmcgdG8gdGhlIHByb3ZpZGVkIGNvbnRyb2wgYXJyYXkuXG5cdCAqXG5cdCAqIFRoaXMgZnVuY3Rpb24gaXMgbWVhbnQgdG8gYmUgaW5kaXZpZHVhbGx5IG92ZXJyaWRkZW4gYnkgY29uc3VtaW5nIGNvbnRyb2xsZXJzLCBidXQgbm90IHRvIGJlIGNhbGxlZCBkaXJlY3RseS5cblx0ICogVGhlIG92ZXJyaWRlIGV4ZWN1dGlvbiBpczoge0BsaW5rIHNhcC51aS5jb3JlLm12Yy5PdmVycmlkZUV4ZWN1dGlvbi5BZnRlcn0uXG5cdCAqXG5cdCAqIEBwYXJhbSBhQ29sbGVjdGVkQ29udHJvbHMgVGhlIGNvbGxlY3RlZCBjb250cm9sc1xuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuVmlld1N0YXRlI2FkYXB0U3RhdGVDb250cm9sc1xuXHQgKiBAcHJvdGVjdGVkXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGV4dGVuc2libGUoT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXIpXG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcblx0YWRhcHRTdGF0ZUNvbnRyb2xzKGFDb2xsZWN0ZWRDb250cm9sczogTWFuYWdlZE9iamVjdFtdKSB7XG5cdFx0Ly8gdG8gYmUgb3ZlcnJpZGRlbiBpZiBuZWVkZWRcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBrZXkgdG8gYmUgdXNlZCBmb3IgZ2l2ZW4gY29udHJvbC5cblx0ICpcblx0ICogQHBhcmFtIG9Db250cm9sIFRoZSBjb250cm9sIHRvIGdldCBzdGF0ZSBrZXkgZm9yXG5cdCAqIEByZXR1cm5zIFRoZSBrZXkgdG8gYmUgdXNlZCBmb3Igc3RvcmluZyB0aGUgY29udHJvbHMgc3RhdGVcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRnZXRTdGF0ZUtleShvQ29udHJvbDogYW55KSB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0VmlldygpLmdldExvY2FsSWQob0NvbnRyb2wuZ2V0SWQoKSkgfHwgb0NvbnRyb2wuZ2V0SWQoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXRyaWV2ZSB0aGUgdmlldyBzdGF0ZSBvZiB0aGlzIGV4dGVuc2lvbnMgdmlldy5cblx0ICogV2hlbiB0aGlzIGZ1bmN0aW9uIGlzIGNhbGxlZCBtb3JlIHRoYW4gb25jZSBiZWZvcmUgZmluaXNoaW5nLCBhbGwgYnV0IHRoZSBmaW5hbCByZXNwb25zZSB3aWxsIHJlc29sdmUgdG8gPGNvZGU+dW5kZWZpbmVkPC9jb2RlPi5cblx0ICpcblx0ICogQHJldHVybnMgQSBwcm9taXNlIHJlc29sdmluZyB0aGUgdmlldyBzdGF0ZVxuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuVmlld1N0YXRlI3JldHJpZXZlVmlld1N0YXRlXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRhc3luYyByZXRyaWV2ZVZpZXdTdGF0ZSgpIHtcblx0XHQrK3RoaXMuX2lSZXRyaWV2aW5nU3RhdGVDb3VudGVyO1xuXHRcdGxldCBvVmlld1N0YXRlOiBhbnk7XG5cblx0XHR0cnkge1xuXHRcdFx0YXdhaXQgdGhpcy5fcEluaXRpYWxTdGF0ZUFwcGxpZWQ7XG5cdFx0XHRjb25zdCBhQ29udHJvbHM6IChNYW5hZ2VkT2JqZWN0IHwgdW5kZWZpbmVkKVtdID0gYXdhaXQgdGhpcy5jb2xsZWN0UmVzdWx0cyh0aGlzLmJhc2Uudmlld1N0YXRlLmFkYXB0U3RhdGVDb250cm9scyk7XG5cdFx0XHRjb25zdCBhUmVzb2x2ZWRTdGF0ZXMgPSBhd2FpdCBQcm9taXNlLmFsbChcblx0XHRcdFx0YUNvbnRyb2xzXG5cdFx0XHRcdFx0LmZpbHRlcihmdW5jdGlvbiAob0NvbnRyb2w6IGFueSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIG9Db250cm9sICYmIG9Db250cm9sLmlzQSAmJiBvQ29udHJvbC5pc0EoXCJzYXAudWkuYmFzZS5NYW5hZ2VkT2JqZWN0XCIpO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0Lm1hcCgob0NvbnRyb2w6IGFueSkgPT4ge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHRoaXMucmV0cmlldmVDb250cm9sU3RhdGUob0NvbnRyb2wpLnRoZW4oKHZSZXN1bHQ6IGFueSkgPT4ge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0XHRcdGtleTogdGhpcy5nZXRTdGF0ZUtleShvQ29udHJvbCksXG5cdFx0XHRcdFx0XHRcdFx0dmFsdWU6IHZSZXN1bHRcblx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHQpO1xuXHRcdFx0b1ZpZXdTdGF0ZSA9IGFSZXNvbHZlZFN0YXRlcy5yZWR1Y2UoZnVuY3Rpb24gKG9TdGF0ZXM6IGFueSwgbVN0YXRlOiBhbnkpIHtcblx0XHRcdFx0Y29uc3Qgb0N1cnJlbnRTdGF0ZTogYW55ID0ge307XG5cdFx0XHRcdG9DdXJyZW50U3RhdGVbbVN0YXRlLmtleV0gPSBtU3RhdGUudmFsdWU7XG5cdFx0XHRcdHJldHVybiBtZXJnZU9iamVjdHMob1N0YXRlcywgb0N1cnJlbnRTdGF0ZSk7XG5cdFx0XHR9LCB7fSk7XG5cdFx0XHRjb25zdCBtQWRkaXRpb25hbFN0YXRlcyA9IGF3YWl0IFByb21pc2UucmVzb2x2ZSh0aGlzLl9yZXRyaWV2ZUFkZGl0aW9uYWxTdGF0ZXMoKSk7XG5cdFx0XHRpZiAobUFkZGl0aW9uYWxTdGF0ZXMgJiYgT2JqZWN0LmtleXMobUFkZGl0aW9uYWxTdGF0ZXMpLmxlbmd0aCkge1xuXHRcdFx0XHRvVmlld1N0YXRlW0FERElUSU9OQUxfU1RBVEVTX0tFWV0gPSBtQWRkaXRpb25hbFN0YXRlcztcblx0XHRcdH1cblx0XHR9IGZpbmFsbHkge1xuXHRcdFx0LS10aGlzLl9pUmV0cmlldmluZ1N0YXRlQ291bnRlcjtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5faVJldHJpZXZpbmdTdGF0ZUNvdW50ZXIgPT09IDAgPyBvVmlld1N0YXRlIDogdW5kZWZpbmVkO1xuXHR9XG5cblx0LyoqXG5cdCAqIEV4dGVuZCB0aGUgbWFwIG9mIGFkZGl0aW9uYWwgc3RhdGVzIChub3QgY29udHJvbCBib3VuZCkgdG8gYmUgYWRkZWQgdG8gdGhlIGN1cnJlbnQgdmlldyBzdGF0ZSBvZiB0aGUgZ2l2ZW4gdmlldy5cblx0ICpcblx0ICogVGhpcyBmdW5jdGlvbiBpcyBtZWFudCB0byBiZSBpbmRpdmlkdWFsbHkgb3ZlcnJpZGRlbiBieSBjb25zdW1pbmcgY29udHJvbGxlcnMsIGJ1dCBub3QgdG8gYmUgY2FsbGVkIGRpcmVjdGx5LlxuXHQgKiBUaGUgb3ZlcnJpZGUgZXhlY3V0aW9uIGlzOiB7QGxpbmsgc2FwLnVpLmNvcmUubXZjLk92ZXJyaWRlRXhlY3V0aW9uLkFmdGVyfS5cblx0ICpcblx0ICogQHBhcmFtIG1BZGRpdGlvbmFsU3RhdGVzIFRoZSBhZGRpdGlvbmFsIHN0YXRlXG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5WaWV3U3RhdGUjcmV0cmlldmVBZGRpdGlvbmFsU3RhdGVzXG5cdCAqIEBwcm90ZWN0ZWRcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZXh0ZW5zaWJsZShPdmVycmlkZUV4ZWN1dGlvbi5BZnRlcilcblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuXHRyZXRyaWV2ZUFkZGl0aW9uYWxTdGF0ZXMobUFkZGl0aW9uYWxTdGF0ZXM6IG9iamVjdCkge1xuXHRcdC8vIHRvIGJlIG92ZXJyaWRkZW4gaWYgbmVlZGVkXG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyBhIG1hcCBvZiBhZGRpdGlvbmFsIHN0YXRlcyAobm90IGNvbnRyb2wgYm91bmQpIHRvIGJlIGFkZGVkIHRvIHRoZSBjdXJyZW50IHZpZXcgc3RhdGUgb2YgdGhlIGdpdmVuIHZpZXcuXG5cdCAqXG5cdCAqIEByZXR1cm5zIEFkZGl0aW9uYWwgdmlldyBzdGF0ZXNcblx0ICovXG5cdF9yZXRyaWV2ZUFkZGl0aW9uYWxTdGF0ZXMoKSB7XG5cdFx0Y29uc3QgbUFkZGl0aW9uYWxTdGF0ZXMgPSB7fTtcblx0XHR0aGlzLmJhc2Uudmlld1N0YXRlLnJldHJpZXZlQWRkaXRpb25hbFN0YXRlcyhtQWRkaXRpb25hbFN0YXRlcyk7XG5cdFx0cmV0dXJuIG1BZGRpdGlvbmFsU3RhdGVzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGN1cnJlbnQgc3RhdGUgZm9yIHRoZSBnaXZlbiBjb250cm9sLlxuXHQgKlxuXHQgKiBAcGFyYW0gb0NvbnRyb2wgVGhlIG9iamVjdCB0byBnZXQgdGhlIHN0YXRlIGZvclxuXHQgKiBAcmV0dXJucyBUaGUgc3RhdGUgZm9yIHRoZSBnaXZlbiBjb250cm9sXG5cdCAqL1xuXHRAcHJpdmF0ZUV4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdHJldHJpZXZlQ29udHJvbFN0YXRlKG9Db250cm9sOiBhbnkpIHtcblx0XHRjb25zdCBhQ29udHJvbFN0YXRlSGFuZGxlcnMgPSB0aGlzLmdldENvbnRyb2xTdGF0ZUhhbmRsZXIob0NvbnRyb2wpO1xuXHRcdHJldHVybiBQcm9taXNlLmFsbChcblx0XHRcdGFDb250cm9sU3RhdGVIYW5kbGVycy5tYXAoKG1Db250cm9sU3RhdGVIYW5kbGVyOiBhbnkpID0+IHtcblx0XHRcdFx0aWYgKHR5cGVvZiBtQ29udHJvbFN0YXRlSGFuZGxlci5yZXRyaWV2ZSAhPT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGBjb250cm9sU3RhdGVIYW5kbGVyLnJldHJpZXZlIGlzIG5vdCBhIGZ1bmN0aW9uIGZvciBjb250cm9sOiAke29Db250cm9sLmdldE1ldGFkYXRhKCkuZ2V0TmFtZSgpfWApO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBtQ29udHJvbFN0YXRlSGFuZGxlci5yZXRyaWV2ZS5jYWxsKHRoaXMsIG9Db250cm9sKTtcblx0XHRcdH0pXG5cdFx0KS50aGVuKChhU3RhdGVzOiBhbnlbXSkgPT4ge1xuXHRcdFx0cmV0dXJuIGFTdGF0ZXMucmVkdWNlKGZ1bmN0aW9uIChvRmluYWxTdGF0ZTogYW55LCBvQ3VycmVudFN0YXRlOiBhbnkpIHtcblx0XHRcdFx0cmV0dXJuIG1lcmdlT2JqZWN0cyhvRmluYWxTdGF0ZSwgb0N1cnJlbnRTdGF0ZSk7XG5cdFx0XHR9LCB7fSk7XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogRGVmaW5lcyB3aGV0aGVyIHRoZSB2aWV3IHN0YXRlIHNob3VsZCBvbmx5IGJlIGFwcGxpZWQgb25jZSBpbml0aWFsbHkuXG5cdCAqXG5cdCAqIFRoaXMgZnVuY3Rpb24gaXMgbWVhbnQgdG8gYmUgaW5kaXZpZHVhbGx5IG92ZXJyaWRkZW4gYnkgY29uc3VtaW5nIGNvbnRyb2xsZXJzLCBidXQgbm90IHRvIGJlIGNhbGxlZCBkaXJlY3RseS5cblx0ICogVGhlIG92ZXJyaWRlIGV4ZWN1dGlvbiBpczoge0BsaW5rIHNhcC51aS5jb3JlLm12Yy5PdmVycmlkZUV4ZWN1dGlvbi5JbnN0ZWFkfS5cblx0ICpcblx0ICogSW1wb3J0YW50OlxuXHQgKiBZb3Ugc2hvdWxkIG9ubHkgb3ZlcnJpZGUgdGhpcyBtZXRob2QgZm9yIGN1c3RvbSBwYWdlcyBhbmQgbm90IGZvciB0aGUgc3RhbmRhcmQgTGlzdFJlcG9ydFBhZ2UgYW5kIE9iamVjdFBhZ2UhXG5cdCAqXG5cdCAqIEByZXR1cm5zIElmIDxjb2RlPnRydWU8L2NvZGU+LCBvbmx5IHRoZSBpbml0aWFsIHZpZXcgc3RhdGUgaXMgYXBwbGllZCBvbmNlLFxuXHQgKiBlbHNlIGFueSBuZXcgdmlldyBzdGF0ZSBpcyBhbHNvIGFwcGxpZWQgb24gZm9sbG93LXVwIGNhbGxzIChkZWZhdWx0KVxuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuVmlld1N0YXRlI2FwcGx5SW5pdGlhbFN0YXRlT25seVxuXHQgKiBAcHJvdGVjdGVkXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGV4dGVuc2libGUoT3ZlcnJpZGVFeGVjdXRpb24uSW5zdGVhZClcblx0YXBwbHlJbml0aWFsU3RhdGVPbmx5KCkge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFwcGxpZXMgdGhlIGdpdmVuIHZpZXcgc3RhdGUgdG8gdGhpcyBleHRlbnNpb25zIHZpZXcuXG5cdCAqXG5cdCAqIEBwYXJhbSBvVmlld1N0YXRlIFRoZSB2aWV3IHN0YXRlIHRvIGFwcGx5IChjYW4gYmUgdW5kZWZpbmVkKVxuXHQgKiBAcGFyYW0gb05hdlBhcmFtZXRlciBUaGUgY3VycmVudCBuYXZpZ2F0aW9uIHBhcmFtZXRlclxuXHQgKiBAcGFyYW0gb05hdlBhcmFtZXRlci5uYXZpZ2F0aW9uVHlwZSBUaGUgYWN0dWFsIG5hdmlnYXRpb24gdHlwZVxuXHQgKiBAcGFyYW0gb05hdlBhcmFtZXRlci5zZWxlY3Rpb25WYXJpYW50IFRoZSBzZWxlY3Rpb25WYXJpYW50IGZyb20gdGhlIG5hdmlnYXRpb25cblx0ICogQHBhcmFtIG9OYXZQYXJhbWV0ZXIuc2VsZWN0aW9uVmFyaWFudERlZmF1bHRzIFRoZSBzZWxlY3Rpb25WYXJpYW50IGRlZmF1bHRzIGZyb20gdGhlIG5hdmlnYXRpb25cblx0ICogQHBhcmFtIG9OYXZQYXJhbWV0ZXIucmVxdWlyZXNTdGFuZGFyZFZhcmlhbnQgRGVmaW5lcyB3aGV0aGVyIHRoZSBzdGFuZGFyZCB2YXJpYW50IG11c3QgYmUgdXNlZCBpbiB2YXJpYW50IG1hbmFnZW1lbnRcblx0ICogQHJldHVybnMgUHJvbWlzZSBmb3IgYXN5bmMgc3RhdGUgaGFuZGxpbmdcblx0ICogQGFsaWFzIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLlZpZXdTdGF0ZSNhcHBseVZpZXdTdGF0ZVxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0YXN5bmMgYXBwbHlWaWV3U3RhdGUob1ZpZXdTdGF0ZTogYW55LCBvTmF2UGFyYW1ldGVyOiBOYXZpZ2F0aW9uUGFyYW1ldGVyKTogUHJvbWlzZTxhbnk+IHtcblx0XHRpZiAodGhpcy5iYXNlLnZpZXdTdGF0ZS5hcHBseUluaXRpYWxTdGF0ZU9ubHkoKSAmJiB0aGlzLl9nZXRJbml0aWFsU3RhdGVBcHBsaWVkKCkpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR0cnkge1xuXHRcdFx0YXdhaXQgdGhpcy5jb2xsZWN0UmVzdWx0cyh0aGlzLmJhc2Uudmlld1N0YXRlLm9uQmVmb3JlU3RhdGVBcHBsaWVkKTtcblx0XHRcdGNvbnN0IGFDb250cm9sczogTWFuYWdlZE9iamVjdFtdID0gYXdhaXQgdGhpcy5jb2xsZWN0UmVzdWx0cyh0aGlzLmJhc2Uudmlld1N0YXRlLmFkYXB0U3RhdGVDb250cm9scyk7XG5cdFx0XHR0aGlzLnZpZXdTdGF0ZUNvbnRyb2xzID0gYUNvbnRyb2xzO1xuXHRcdFx0bGV0IG9Qcm9taXNlQ2hhaW4gPSBQcm9taXNlLnJlc29sdmUoKTtcblx0XHRcdGxldCBoYXNWYXJpYW50TWFuYWdlbWVudCA9IGZhbHNlO1xuXHRcdFx0LyoqXG5cdFx0XHQgKiB0aGlzIGVuc3VyZXMgdGhhdCB2YXJpYW50TWFuYWdlbWVudCBjb250cm9sIGlzIGFwcGxpZWQgZmlyc3QgdG8gY2FsY3VsYXRlIGluaXRpYWwgc3RhdGUgZm9yIGRlbHRhIGxvZ2ljXG5cdFx0XHQgKi9cblx0XHRcdGNvbnN0IHNvcnRlZEFkYXB0U3RhdGVDb250cm9scyA9IGFDb250cm9scy5yZWR1Y2UoKG1vZGlmaWVkQ29udHJvbHM6IE1hbmFnZWRPYmplY3RbXSwgY29udHJvbCkgPT4ge1xuXHRcdFx0XHRpZiAoIWNvbnRyb2wpIHtcblx0XHRcdFx0XHRyZXR1cm4gbW9kaWZpZWRDb250cm9scztcblx0XHRcdFx0fVxuXHRcdFx0XHRjb25zdCBpc1ZhcmlhbnRNYW5hZ2VtZW50Q29udHJvbCA9IGNvbnRyb2wuaXNBKFwic2FwLnVpLmZsLnZhcmlhbnRzLlZhcmlhbnRNYW5hZ2VtZW50XCIpO1xuXHRcdFx0XHRpZiAoIWhhc1ZhcmlhbnRNYW5hZ2VtZW50KSB7XG5cdFx0XHRcdFx0aGFzVmFyaWFudE1hbmFnZW1lbnQgPSBpc1ZhcmlhbnRNYW5hZ2VtZW50Q29udHJvbDtcblx0XHRcdFx0fVxuXHRcdFx0XHRtb2RpZmllZENvbnRyb2xzID0gaXNWYXJpYW50TWFuYWdlbWVudENvbnRyb2wgPyBbY29udHJvbCwgLi4ubW9kaWZpZWRDb250cm9sc10gOiBbLi4ubW9kaWZpZWRDb250cm9scywgY29udHJvbF07XG5cdFx0XHRcdHJldHVybiBtb2RpZmllZENvbnRyb2xzO1xuXHRcdFx0fSwgW10pO1xuXG5cdFx0XHQvLyBJbiBjYXNlIG9mIG5vIFZhcmlhbnQgTWFuYWdlbWVudCwgdGhpcyBlbnN1cmVzIHRoYXQgaW5pdGlhbCBzdGF0ZXMgaXMgc2V0XG5cdFx0XHRpZiAoIWhhc1ZhcmlhbnRNYW5hZ2VtZW50KSB7XG5cdFx0XHRcdHRoaXMuX3NldEluaXRpYWxTdGF0ZXNGb3JEZWx0YUNvbXB1dGUoKTtcblx0XHRcdH1cblxuXHRcdFx0c29ydGVkQWRhcHRTdGF0ZUNvbnRyb2xzXG5cdFx0XHRcdC5maWx0ZXIoZnVuY3Rpb24gKG9Db250cm9sKSB7XG5cdFx0XHRcdFx0cmV0dXJuIG9Db250cm9sLmlzQShcInNhcC51aS5iYXNlLk1hbmFnZWRPYmplY3RcIik7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5mb3JFYWNoKChvQ29udHJvbCkgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IHNLZXkgPSB0aGlzLmdldFN0YXRlS2V5KG9Db250cm9sKTtcblx0XHRcdFx0XHRvUHJvbWlzZUNoYWluID0gb1Byb21pc2VDaGFpbi50aGVuKFxuXHRcdFx0XHRcdFx0dGhpcy5hcHBseUNvbnRyb2xTdGF0ZS5iaW5kKHRoaXMsIG9Db250cm9sLCBvVmlld1N0YXRlID8gb1ZpZXdTdGF0ZVtzS2V5XSA6IHVuZGVmaW5lZCwgb05hdlBhcmFtZXRlcilcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0YXdhaXQgb1Byb21pc2VDaGFpbjtcblx0XHRcdGlmIChvTmF2UGFyYW1ldGVyLm5hdmlnYXRpb25UeXBlID09PSBOYXZUeXBlLmlBcHBTdGF0ZSkge1xuXHRcdFx0XHRhd2FpdCB0aGlzLmNvbGxlY3RSZXN1bHRzKFxuXHRcdFx0XHRcdHRoaXMuYmFzZS52aWV3U3RhdGUuYXBwbHlBZGRpdGlvbmFsU3RhdGVzLFxuXHRcdFx0XHRcdG9WaWV3U3RhdGUgPyBvVmlld1N0YXRlW0FERElUSU9OQUxfU1RBVEVTX0tFWV0gOiB1bmRlZmluZWRcblx0XHRcdFx0KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGF3YWl0IHRoaXMuY29sbGVjdFJlc3VsdHModGhpcy5iYXNlLnZpZXdTdGF0ZS5hcHBseU5hdmlnYXRpb25QYXJhbWV0ZXJzLCBvTmF2UGFyYW1ldGVyKTtcblx0XHRcdFx0YXdhaXQgdGhpcy5jb2xsZWN0UmVzdWx0cyh0aGlzLmJhc2Uudmlld1N0YXRlLl9hcHBseU5hdmlnYXRpb25QYXJhbWV0ZXJzVG9GaWx0ZXJiYXIsIG9OYXZQYXJhbWV0ZXIpO1xuXHRcdFx0fVxuXHRcdH0gZmluYWxseSB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRhd2FpdCB0aGlzLmNvbGxlY3RSZXN1bHRzKHRoaXMuYmFzZS52aWV3U3RhdGUub25BZnRlclN0YXRlQXBwbGllZCk7XG5cdFx0XHRcdHRoaXMuX3NldEluaXRpYWxTdGF0ZUFwcGxpZWQoKTtcblx0XHRcdH0gY2F0Y2ggKGU6IGFueSkge1xuXHRcdFx0XHRMb2cuZXJyb3IoZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0QHByaXZhdGVFeHRlbnNpb24oKVxuXHRfY2hlY2tJZlZhcmlhbnRJZElzQXZhaWxhYmxlKG9WTTogYW55LCBzVmFyaWFudElkOiBhbnkpIHtcblx0XHRjb25zdCBhVmFyaWFudHMgPSBvVk0uZ2V0VmFyaWFudHMoKTtcblx0XHRsZXQgYklzQ29udHJvbFN0YXRlVmFyaWFudEF2YWlsYWJsZSA9IGZhbHNlO1xuXHRcdGFWYXJpYW50cy5mb3JFYWNoKGZ1bmN0aW9uIChvVmFyaWFudDogYW55KSB7XG5cdFx0XHRpZiAob1ZhcmlhbnQua2V5ID09PSBzVmFyaWFudElkKSB7XG5cdFx0XHRcdGJJc0NvbnRyb2xTdGF0ZVZhcmlhbnRBdmFpbGFibGUgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHJldHVybiBiSXNDb250cm9sU3RhdGVWYXJpYW50QXZhaWxhYmxlO1xuXHR9XG5cblx0X3NldEluaXRpYWxTdGF0ZUFwcGxpZWQoKSB7XG5cdFx0aWYgKHRoaXMuX3BJbml0aWFsU3RhdGVBcHBsaWVkUmVzb2x2ZSkge1xuXHRcdFx0Y29uc3QgcEluaXRpYWxTdGF0ZUFwcGxpZWRSZXNvbHZlID0gdGhpcy5fcEluaXRpYWxTdGF0ZUFwcGxpZWRSZXNvbHZlO1xuXHRcdFx0ZGVsZXRlIHRoaXMuX3BJbml0aWFsU3RhdGVBcHBsaWVkUmVzb2x2ZTtcblx0XHRcdHBJbml0aWFsU3RhdGVBcHBsaWVkUmVzb2x2ZSgpO1xuXHRcdH1cblx0fVxuXHRfZ2V0SW5pdGlhbFN0YXRlQXBwbGllZCgpIHtcblx0XHRyZXR1cm4gIXRoaXMuX3BJbml0aWFsU3RhdGVBcHBsaWVkUmVzb2x2ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBIb29rIHRvIHJlYWN0IGJlZm9yZSBhIHN0YXRlIGZvciBnaXZlbiB2aWV3IGlzIGFwcGxpZWQuXG5cdCAqXG5cdCAqIFRoaXMgZnVuY3Rpb24gaXMgbWVhbnQgdG8gYmUgaW5kaXZpZHVhbGx5IG92ZXJyaWRkZW4gYnkgY29uc3VtaW5nIGNvbnRyb2xsZXJzLCBidXQgbm90IHRvIGJlIGNhbGxlZCBkaXJlY3RseS5cblx0ICogVGhlIG92ZXJyaWRlIGV4ZWN1dGlvbiBpczoge0BsaW5rIHNhcC51aS5jb3JlLm12Yy5PdmVycmlkZUV4ZWN1dGlvbi5BZnRlcn0uXG5cdCAqXG5cdCAqIEBwYXJhbSBhUHJvbWlzZXMgRXh0ZW5zaWJsZSBhcnJheSBvZiBwcm9taXNlcyB0byBiZSByZXNvbHZlZCBiZWZvcmUgY29udGludWluZ1xuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuVmlld1N0YXRlI29uQmVmb3JlU3RhdGVBcHBsaWVkXG5cdCAqIEBwcm90ZWN0ZWRcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZXh0ZW5zaWJsZShPdmVycmlkZUV4ZWN1dGlvbi5BZnRlcilcblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuXHRvbkJlZm9yZVN0YXRlQXBwbGllZChhUHJvbWlzZXM6IFByb21pc2U8YW55Pikge1xuXHRcdC8vIHRvIGJlIG92ZXJyaWRlblxuXHR9XG5cblx0LyoqXG5cdCAqIEhvb2sgdG8gcmVhY3Qgd2hlbiBzdGF0ZSBmb3IgZ2l2ZW4gdmlldyB3YXMgYXBwbGllZC5cblx0ICpcblx0ICogVGhpcyBmdW5jdGlvbiBpcyBtZWFudCB0byBiZSBpbmRpdmlkdWFsbHkgb3ZlcnJpZGRlbiBieSBjb25zdW1pbmcgY29udHJvbGxlcnMsIGJ1dCBub3QgdG8gYmUgY2FsbGVkIGRpcmVjdGx5LlxuXHQgKiBUaGUgb3ZlcnJpZGUgZXhlY3V0aW9uIGlzOiB7QGxpbmsgc2FwLnVpLmNvcmUubXZjLk92ZXJyaWRlRXhlY3V0aW9uLkFmdGVyfS5cblx0ICpcblx0ICogQHBhcmFtIGFQcm9taXNlcyBFeHRlbnNpYmxlIGFycmF5IG9mIHByb21pc2VzIHRvIGJlIHJlc29sdmVkIGJlZm9yZSBjb250aW51aW5nXG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5WaWV3U3RhdGUjb25BZnRlclN0YXRlQXBwbGllZFxuXHQgKiBAcHJvdGVjdGVkXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGV4dGVuc2libGUoT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXIpXG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcblx0b25BZnRlclN0YXRlQXBwbGllZChhUHJvbWlzZXM6IFByb21pc2U8YW55Pikge1xuXHRcdC8vIHRvIGJlIG92ZXJyaWRlblxuXHR9XG5cblx0LyoqXG5cdCAqIEFwcGx5aW5nIGFkZGl0aW9uYWwsIG5vdCBjb250cm9sIHJlbGF0ZWQsIHN0YXRlcyAtIGlzIGNhbGxlZCBvbmx5IGlmIG5hdmlnYXRpb24gdHlwZSBpcyBpQXBwU3RhdGUuXG5cdCAqXG5cdCAqIFRoaXMgZnVuY3Rpb24gaXMgbWVhbnQgdG8gYmUgaW5kaXZpZHVhbGx5IG92ZXJyaWRkZW4gYnkgY29uc3VtaW5nIGNvbnRyb2xsZXJzLCBidXQgbm90IHRvIGJlIGNhbGxlZCBkaXJlY3RseS5cblx0ICogVGhlIG92ZXJyaWRlIGV4ZWN1dGlvbiBpczoge0BsaW5rIHNhcC51aS5jb3JlLm12Yy5PdmVycmlkZUV4ZWN1dGlvbi5BZnRlcn0uXG5cdCAqXG5cdCAqIEBwYXJhbSBvVmlld1N0YXRlIFRoZSBjdXJyZW50IHZpZXcgc3RhdGVcblx0ICogQHBhcmFtIGFQcm9taXNlcyBFeHRlbnNpYmxlIGFycmF5IG9mIHByb21pc2VzIHRvIGJlIHJlc29sdmVkIGJlZm9yZSBjb250aW51aW5nXG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5WaWV3U3RhdGUjYXBwbHlBZGRpdGlvbmFsU3RhdGVzXG5cdCAqIEBwcm90ZWN0ZWRcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZXh0ZW5zaWJsZShPdmVycmlkZUV4ZWN1dGlvbi5BZnRlcilcblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuXHRhcHBseUFkZGl0aW9uYWxTdGF0ZXMob1ZpZXdTdGF0ZTogb2JqZWN0LCBhUHJvbWlzZXM6IFByb21pc2U8YW55Pikge1xuXHRcdC8vIHRvIGJlIG92ZXJyaWRkZW4gaWYgbmVlZGVkXG5cdH1cblxuXHRAcHJpdmF0ZUV4dGVuc2lvbigpXG5cdF9hcHBseU5hdmlnYXRpb25QYXJhbWV0ZXJzVG9GaWx0ZXJiYXIoXG5cdFx0X29OYXZQYXJhbWV0ZXI6IHtcblx0XHRcdG5hdmlnYXRpb25UeXBlOiBhbnk7XG5cdFx0XHRzZWxlY3Rpb25WYXJpYW50Pzogb2JqZWN0IHwgdW5kZWZpbmVkO1xuXHRcdFx0c2VsZWN0aW9uVmFyaWFudERlZmF1bHRzPzogb2JqZWN0IHwgdW5kZWZpbmVkO1xuXHRcdFx0cmVxdWlyZXNTdGFuZGFyZFZhcmlhbnQ/OiBib29sZWFuIHwgdW5kZWZpbmVkO1xuXHRcdH0sXG5cdFx0X2FQcm9taXNlczogUHJvbWlzZTxhbnk+XG5cdCkge1xuXHRcdC8vIHRvIGJlIG92ZXJyaWRkZW4gaWYgbmVlZGVkXG5cdH1cblxuXHQvKipcblx0ICogQXBwbHkgbmF2aWdhdGlvbiBwYXJhbWV0ZXJzIGlzIG5vdCBjYWxsZWQgaWYgdGhlIG5hdmlnYXRpb24gdHlwZSBpcyBpQXBwU3RhdGVcblx0ICpcblx0ICogVGhpcyBmdW5jdGlvbiBpcyBtZWFudCB0byBiZSBpbmRpdmlkdWFsbHkgb3ZlcnJpZGRlbiBieSBjb25zdW1pbmcgY29udHJvbGxlcnMsIGJ1dCBub3QgdG8gYmUgY2FsbGVkIGRpcmVjdGx5LlxuXHQgKiBUaGUgb3ZlcnJpZGUgZXhlY3V0aW9uIGlzOiB7QGxpbmsgc2FwLnVpLmNvcmUubXZjLk92ZXJyaWRlRXhlY3V0aW9uLkFmdGVyfS5cblx0ICpcblx0ICogQHBhcmFtIG9OYXZQYXJhbWV0ZXIgVGhlIGN1cnJlbnQgbmF2aWdhdGlvbiBwYXJhbWV0ZXJcblx0ICogQHBhcmFtIG9OYXZQYXJhbWV0ZXIubmF2aWdhdGlvblR5cGUgVGhlIGFjdHVhbCBuYXZpZ2F0aW9uIHR5cGVcblx0ICogQHBhcmFtIFtvTmF2UGFyYW1ldGVyLnNlbGVjdGlvblZhcmlhbnRdIFRoZSBzZWxlY3Rpb25WYXJpYW50IGZyb20gdGhlIG5hdmlnYXRpb25cblx0ICogQHBhcmFtIFtvTmF2UGFyYW1ldGVyLnNlbGVjdGlvblZhcmlhbnREZWZhdWx0c10gVGhlIHNlbGVjdGlvblZhcmlhbnQgZGVmYXVsdHMgZnJvbSB0aGUgbmF2aWdhdGlvblxuXHQgKiBAcGFyYW0gW29OYXZQYXJhbWV0ZXIucmVxdWlyZXNTdGFuZGFyZFZhcmlhbnRdIERlZmluZXMgd2hldGhlciB0aGUgc3RhbmRhcmQgdmFyaWFudCBtdXN0IGJlIHVzZWQgaW4gdmFyaWFudCBtYW5hZ2VtZW50XG5cdCAqIEBwYXJhbSBhUHJvbWlzZXMgRXh0ZW5zaWJsZSBhcnJheSBvZiBwcm9taXNlcyB0byBiZSByZXNvbHZlZCBiZWZvcmUgY29udGludWluZ1xuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuVmlld1N0YXRlI2FwcGx5TmF2aWdhdGlvblBhcmFtZXRlcnNcblx0ICogQHByb3RlY3RlZFxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBleHRlbnNpYmxlKE92ZXJyaWRlRXhlY3V0aW9uLkFmdGVyKVxuXHRhcHBseU5hdmlnYXRpb25QYXJhbWV0ZXJzKFxuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcblx0XHRvTmF2UGFyYW1ldGVyOiB7XG5cdFx0XHRuYXZpZ2F0aW9uVHlwZTogYW55O1xuXHRcdFx0c2VsZWN0aW9uVmFyaWFudD86IG9iamVjdCB8IHVuZGVmaW5lZDtcblx0XHRcdHNlbGVjdGlvblZhcmlhbnREZWZhdWx0cz86IG9iamVjdCB8IHVuZGVmaW5lZDtcblx0XHRcdHJlcXVpcmVzU3RhbmRhcmRWYXJpYW50PzogYm9vbGVhbiB8IHVuZGVmaW5lZDtcblx0XHR9LFxuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcblx0XHRhUHJvbWlzZXM6IFByb21pc2U8YW55PlxuXHQpIHtcblx0XHQvLyB0byBiZSBvdmVycmlkZGVuIGlmIG5lZWRlZFxuXHR9XG5cblx0LyoqXG5cdCAqIEFwcGx5aW5nIHRoZSBnaXZlbiBzdGF0ZSB0byB0aGUgZ2l2ZW4gY29udHJvbC5cblx0ICpcblx0ICogQHBhcmFtIG9Db250cm9sIFRoZSBvYmplY3QgdG8gYXBwbHkgdGhlIGdpdmVuIHN0YXRlXG5cdCAqIEBwYXJhbSBvQ29udHJvbFN0YXRlIFRoZSBzdGF0ZSBmb3IgdGhlIGdpdmVuIGNvbnRyb2xcblx0ICogQHBhcmFtIFtvTmF2UGFyYW1ldGVyc10gVGhlIGN1cnJlbnQgbmF2aWdhdGlvbiBwYXJhbWV0ZXJzXG5cdCAqIEByZXR1cm5zIFJldHVybiBhIHByb21pc2UgZm9yIGFzeW5jIHN0YXRlIGhhbmRsaW5nXG5cdCAqL1xuXHRAcHJpdmF0ZUV4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdGFwcGx5Q29udHJvbFN0YXRlKG9Db250cm9sOiBhbnksIG9Db250cm9sU3RhdGU6IG9iamVjdCwgb05hdlBhcmFtZXRlcnM/OiBvYmplY3QpIHtcblx0XHRjb25zdCBhQ29udHJvbFN0YXRlSGFuZGxlcnMgPSB0aGlzLmdldENvbnRyb2xTdGF0ZUhhbmRsZXIob0NvbnRyb2wpO1xuXHRcdGxldCBvUHJvbWlzZUNoYWluID0gUHJvbWlzZS5yZXNvbHZlKCk7XG5cdFx0YUNvbnRyb2xTdGF0ZUhhbmRsZXJzLmZvckVhY2goKG1Db250cm9sU3RhdGVIYW5kbGVyOiBhbnkpID0+IHtcblx0XHRcdGlmICh0eXBlb2YgbUNvbnRyb2xTdGF0ZUhhbmRsZXIuYXBwbHkgIT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYGNvbnRyb2xTdGF0ZUhhbmRsZXIuYXBwbHkgaXMgbm90IGEgZnVuY3Rpb24gZm9yIGNvbnRyb2w6ICR7b0NvbnRyb2wuZ2V0TWV0YWRhdGEoKS5nZXROYW1lKCl9YCk7XG5cdFx0XHR9XG5cdFx0XHRvUHJvbWlzZUNoYWluID0gb1Byb21pc2VDaGFpbi50aGVuKG1Db250cm9sU3RhdGVIYW5kbGVyLmFwcGx5LmJpbmQodGhpcywgb0NvbnRyb2wsIG9Db250cm9sU3RhdGUsIG9OYXZQYXJhbWV0ZXJzKSk7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIG9Qcm9taXNlQ2hhaW47XG5cdH1cblx0Z2V0SW50ZXJmYWNlKCkge1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cdC8vIG1ldGhvZCB0byBnZXQgdGhlIGNvbnRyb2wgc3RhdGUgZm9yIG1kYyBjb250cm9scyBhcHBseWluZyB0aGUgZGVsdGEgbG9naWNcblx0X2dldENvbnRyb2xTdGF0ZShjb250cm9sU3RhdGVLZXk6IHN0cmluZywgY29udHJvbFN0YXRlOiBDb250cm9sU3RhdGUpIHtcblx0XHRjb25zdCBpbml0aWFsQ29udHJvbFN0YXRlc01hcHBlciA9IHRoaXMuaW5pdGlhbENvbnRyb2xTdGF0ZXNNYXBwZXI7XG5cdFx0aWYgKE9iamVjdC5rZXlzKGluaXRpYWxDb250cm9sU3RhdGVzTWFwcGVyKS5sZW5ndGggPiAwICYmIGluaXRpYWxDb250cm9sU3RhdGVzTWFwcGVyW2NvbnRyb2xTdGF0ZUtleV0pIHtcblx0XHRcdGlmIChPYmplY3Qua2V5cyhpbml0aWFsQ29udHJvbFN0YXRlc01hcHBlcltjb250cm9sU3RhdGVLZXldIGFzIG9iamVjdCkubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRcdGluaXRpYWxDb250cm9sU3RhdGVzTWFwcGVyW2NvbnRyb2xTdGF0ZUtleV0gPSB7IC4uLmNvbnRyb2xTdGF0ZSB9O1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHsgZnVsbFN0YXRlOiBjb250cm9sU3RhdGUsIGluaXRpYWxTdGF0ZTogaW5pdGlhbENvbnRyb2xTdGF0ZXNNYXBwZXJbY29udHJvbFN0YXRlS2V5XSB9O1xuXHRcdH1cblx0XHRyZXR1cm4gY29udHJvbFN0YXRlO1xuXHR9XG5cblx0Ly9tZXRob2QgdG8gc3RvcmUgdGhlIGluaXRpYWwgc3RhdGVzIGZvciBkZWx0YSBjb21wdXRhdGlvbiBvZiBtZGMgY29udHJvbHNcblx0X3NldEluaXRpYWxTdGF0ZXNGb3JEZWx0YUNvbXB1dGUgPSBhc3luYyAodmFyaWFudE1hbmFnZW1lbnQ/OiBWYXJpYW50TWFuYWdlbWVudCkgPT4ge1xuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCBhZGFwdENvbnRyb2xzID0gdGhpcy52aWV3U3RhdGVDb250cm9scztcblxuXHRcdFx0Y29uc3QgZXh0ZXJuYWxTdGF0ZVByb21pc2VzOiBQcm9taXNlPG9iamVjdD5bXSA9IFtdO1xuXHRcdFx0Y29uc3QgY29udHJvbFN0YXRlS2V5OiBzdHJpbmdbXSA9IFtdO1xuXHRcdFx0bGV0IGluaXRpYWxDb250cm9sU3RhdGVzOiBvYmplY3RbXSA9IFtdO1xuXHRcdFx0Y29uc3QgdmFyaWFudENvbnRyb2xzOiBzdHJpbmdbXSA9IHZhcmlhbnRNYW5hZ2VtZW50Py5nZXRGb3IoKSA/PyBbXTtcblxuXHRcdFx0YWRhcHRDb250cm9sc1xuXHRcdFx0XHQuZmlsdGVyKGZ1bmN0aW9uIChjb250cm9sKSB7XG5cdFx0XHRcdFx0cmV0dXJuIChcblx0XHRcdFx0XHRcdGNvbnRyb2wgJiZcblx0XHRcdFx0XHRcdCghdmFyaWFudE1hbmFnZW1lbnQgfHwgdmFyaWFudENvbnRyb2xzLmluZGV4T2YoY29udHJvbC5nZXRJZCgpKSA+IC0xKSAmJlxuXHRcdFx0XHRcdFx0KGNvbnRyb2wuaXNBKFwic2FwLnVpLm1kYy5UYWJsZVwiKSB8fFxuXHRcdFx0XHRcdFx0XHQoY29udHJvbCBhcyBCYXNlT2JqZWN0KS5pc0EoXCJzYXAudWkubWRjLkZpbHRlckJhclwiKSB8fFxuXHRcdFx0XHRcdFx0XHQoY29udHJvbCBhcyBCYXNlT2JqZWN0KS5pc0EoXCJzYXAudWkubWRjLkNoYXJ0XCIpKVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5mb3JFYWNoKChjb250cm9sKSA9PiB7XG5cdFx0XHRcdFx0aWYgKHZhcmlhbnRNYW5hZ2VtZW50KSB7XG5cdFx0XHRcdFx0XHR0aGlzLl9hZGRFdmVudExpc3RlbmVyc1RvVmFyaWFudE1hbmFnZW1lbnQodmFyaWFudE1hbmFnZW1lbnQsIHZhcmlhbnRDb250cm9scyk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Y29uc3QgZXh0ZXJuYWxTdGF0ZVByb21pc2UgPSBTdGF0ZVV0aWwucmV0cmlldmVFeHRlcm5hbFN0YXRlKGNvbnRyb2wgYXMgb2JqZWN0KTtcblx0XHRcdFx0XHRleHRlcm5hbFN0YXRlUHJvbWlzZXMucHVzaChleHRlcm5hbFN0YXRlUHJvbWlzZSk7XG5cdFx0XHRcdFx0Y29udHJvbFN0YXRlS2V5LnB1c2godGhpcy5nZXRTdGF0ZUtleShjb250cm9sKSk7XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRpbml0aWFsQ29udHJvbFN0YXRlcyA9IGF3YWl0IFByb21pc2UuYWxsKGV4dGVybmFsU3RhdGVQcm9taXNlcyk7XG5cdFx0XHRpbml0aWFsQ29udHJvbFN0YXRlcy5mb3JFYWNoKChpbml0aWFsQ29udHJvbFN0YXRlOiBvYmplY3QsIGk6IG51bWJlcikgPT4ge1xuXHRcdFx0XHR0aGlzLmluaXRpYWxDb250cm9sU3RhdGVzTWFwcGVyW2NvbnRyb2xTdGF0ZUtleVtpXV0gPSBpbml0aWFsQ29udHJvbFN0YXRlO1xuXHRcdFx0fSk7XG5cdFx0fSBjYXRjaCAoZTogdW5rbm93bikge1xuXHRcdFx0TG9nLmVycm9yKGUgYXMgc3RyaW5nKTtcblx0XHR9XG5cdH07XG5cblx0Ly8gQXR0YWNoIGV2ZW50IHRvIHNhdmUgYW5kIHNlbGVjdCBvZiBWYXJpYW50IE1hbmFnZW1lbnQgdG8gdXBkYXRlIHRoZSBpbml0aWFsIENvbnRyb2wgU3RhdGVzIG9uIHZhcmlhbnQgY2hhbmdlXG5cdF9hZGRFdmVudExpc3RlbmVyc1RvVmFyaWFudE1hbmFnZW1lbnQodmFyaWFudE1hbmFnZW1lbnQ6IFZhcmlhbnRNYW5hZ2VtZW50LCB2YXJpYW50Q29udHJvbHM6IHN0cmluZ1tdKSB7XG5cdFx0Y29uc3Qgb1BheWxvYWQgPSB7IHZhcmlhbnRNYW5hZ2VkQ29udHJvbHM6IHZhcmlhbnRDb250cm9scyB9O1xuXHRcdGNvbnN0IGZuRXZlbnQgPSAoKSA9PiB7XG5cdFx0XHRcdHRoaXMuX3VwZGF0ZUluaXRpYWxTdGF0ZXNPblZhcmlhbnRDaGFuZ2UodmFyaWFudENvbnRyb2xzKTtcblx0XHR9O1xuXHRcdHZhcmlhbnRNYW5hZ2VtZW50LmF0dGFjaFNhdmUob1BheWxvYWQsIGZuRXZlbnQsIHt9KTtcblx0XHR2YXJpYW50TWFuYWdlbWVudC5hdHRhY2hTZWxlY3Qob1BheWxvYWQsIGZuRXZlbnQsIHt9KTtcblx0fVxuXG5cdF91cGRhdGVJbml0aWFsU3RhdGVzT25WYXJpYW50Q2hhbmdlKHZtQXNzb2NpYXRlZENvbnRyb2xzVG9SZXNldDogc3RyaW5nW10pIHtcblx0XHRjb25zdCBpbml0aWFsQ29udHJvbFN0YXRlc01hcHBlciA9IHRoaXMuaW5pdGlhbENvbnRyb2xTdGF0ZXNNYXBwZXI7XG5cdFx0T2JqZWN0LmtleXMoaW5pdGlhbENvbnRyb2xTdGF0ZXNNYXBwZXIpLmZvckVhY2goKGNvbnRyb2xLZXkpID0+IHtcblx0XHRcdGZvciAoY29uc3Qgdm1Bc3NvY2lhdGVkY29udHJvbEtleSBvZiB2bUFzc29jaWF0ZWRDb250cm9sc1RvUmVzZXQpIHtcblx0XHRcdFx0aWYgKHZtQXNzb2NpYXRlZGNvbnRyb2xLZXkuaW5kZXhPZihjb250cm9sS2V5KSA+IC0xKSB7XG5cdFx0XHRcdFx0aW5pdGlhbENvbnRyb2xTdGF0ZXNNYXBwZXJbY29udHJvbEtleV0gPSB7fTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFZpZXdTdGF0ZTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7OztFQXFCQTtFQUNBO0VBQ0E7RUFDQSxNQUFNQSxxQkFBcUIsR0FBRyxtQkFBbUI7SUFDaERDLE9BQU8sR0FBR0MsVUFBVSxDQUFDRCxPQUFPOztFQUU3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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