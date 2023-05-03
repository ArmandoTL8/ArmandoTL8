/*global sap*/
sap.ui.define("sap/sac/df/variablebar/FilterBarHandler", [
  "sap/ui/mdc/FilterField",
  "sap/ui/base/ManagedObjectObserver",
  "sap/ui/mdc/p13n/StateUtil",
  "sap/sac/df/variablebar/TypeUtil",
  "sap/sac/df/thirdparty/lodash"
], function (FilterField, ManagedObjectObserver, StateUtil, TypeUtil, _) {
  "use strict";

  return {
    initialise: function (oFilterBar) {
      this._oFilterBar = oFilterBar;
      this._initialiseFilterBar();
      return this;
    },

    _initialiseFilterBar: function () {
      var oFilterState = {};
      this._setPathToVariables();
      _.forEach(this._getVariables(), function (oVariable) {
        oVariable = oVariable.MergedVariable ? oVariable.MergedVariable : oVariable;
        this.addFilterItem(oVariable);
        if (oVariable.MemberFilter && oVariable.MemberFilter.length > 0) {
          oFilterState[oVariable.Name] = this.getFilterConditions(oVariable);
        }
      }.bind(this));
      this.updateAllConditions(oFilterState);
      this.changeEventsHandlerInAdaptFilter();
    },

    _setPathToVariables: function () {
      if (this._oFilterBar.getProperty("mode") === "VariableGroups") {
        this._pathToVariables = "/VariableGroups";
      } else {
        this._pathToVariables = "/DataProvider/" + this._getDataProviderName() + "/Variables";
      }
    },

    _getPathToVariables: function () {
      return this._pathToVariables;
    },

    _getPathToVariable: function (sVariableName) {
      return this._oFilterBar.getProperty("mode") === "VariableGroups"
        ? this._getPathToVariables() + "/" + sVariableName + "/MergedVariable"
        : this._getPathToVariables() + "/" + sVariableName;
    },

    _getMultiDimModel: function () {
      var oModel = this._oFilterBar.getModel();
      return oModel ? oModel : this._oFilterBar.getParent().getModel(this._oFilterBar.getMultiDimModelId());
    },

    _getDataProviderName: function () {
      var aDataProvider = this._getMultiDimModel().getProperty("/DataProvider");
      return aDataProvider && Object.keys(aDataProvider)[0];
    },

    _getDataProvider: function () {
      return this._getMultiDimModel().getProperty("/DataProvider/" + this._getDataProviderName());
    },

    _getVariables: function () {
      return this._getMultiDimModel().getProperty(this._pathToVariables);
    },

    _getVariable: function (sVariableName) {
      return this._getMultiDimModel().getProperty(this._getPathToVariable(sVariableName));
    },

    addFilterItem: function (oVariable) {
      var oFilterField = this.createFilterField(oVariable);
      this._oFilterBar.addFilterItem(oFilterField);
      return oFilterField;
    },

    updateAllConditions: function (oFilterState) {
      var oState = {};
      oState.filter = oFilterState;
      StateUtil.applyExternalState(this._oFilterBar, oState);
    },

    getFilterConditions: function (oVariable) {
      var aFilters = [];
      oVariable.MemberFilter.forEach(function (oMemberFilter) {
        var oFilter = {
          operator: "EQ",
          validated: "Validated"
        };
        oFilter.values = [oMemberFilter.Low];
        if (oVariable.ValueType !== "Date") {
          var sText = oMemberFilter.Text && oMemberFilter.Low !== oMemberFilter.Text ? oMemberFilter.Text : "";
          oFilter.values.push(sText);
        }
        aFilters.push(oFilter);
      });
      return aFilters;
    },

    changeEventsHandlerInAdaptFilter: function () {
      var oObserver = this._getObserver();
      this._oFilterBar.retrieveInbuiltFilter().then(function (oP13nFilter) {
        oObserver.observe(oP13nFilter, {
          aggregations: ["filterItems"]
        });
      });

      oObserver.observe(this._oFilterBar, {
        aggregations: ["dependents"]
      });
    },

    createFilterField: function (oVariable) {
      var bIsDate = oVariable.ValueType === "Date";
      var oDateFormatOptions = {
        source: {
          format: "yyyy-MM-dd",
          pattern: "yyyy-MM-dd"
        }
      };
      var mControlSettings = {
        dataType: TypeUtil.getDataTypeClassName(oVariable.ValueType),
        dataTypeFormatOptions: bIsDate ? oDateFormatOptions : null,
        delegate: {
          name: bIsDate || !oVariable.SupportsValueHelp ? "sap/ui/mdc/field/FieldBaseDelegate" : "sap/sac/df/variablebar/FieldBaseDelegate",
          payload: {
            valueType: oVariable.ValueType,
            supportsValueHelp: oVariable.SupportsValueHelp
          }
        },
        label: oVariable.Description,
        tooltip: oVariable.Description,
        required: oVariable.Mandatory,
        display: bIsDate || !oVariable.SupportsValueHelp ? "Value" : "ValueDescription",
        conditions: "{$filters>/conditions/" + oVariable.Name + "}",
        maxConditions: bIsDate || !oVariable.SupportsMultipleValues ? 1 : -1,
        operators: oVariable.SupportsValueHelp && !bIsDate ? [] : ["EQ"]

      };
      var oFilterField = new FilterField(this.getFilterFieldId(oVariable.Name), mControlSettings);
      if (!bIsDate) {
        this._getObserver().observe(oFilterField, {
          aggregations: ["_content"]
        });
      }
      return oFilterField;
    },

    getFilterFieldId: function (sPropertyName) {
      return this._oFilterBar.getId() + "::FilterField::" + sPropertyName;
    },

    _getObserver: function () {
      if (!this._oObserver) {
        this._oObserver = new ManagedObjectObserver(this._observeChanges.bind(this));
      }
      return this._oObserver;
    },

    _observeChanges: function (oChanges) {
      if (oChanges.name === "_content") {
        this._onFieldChange(oChanges.object, true);
      }

      if (oChanges.name === "filterItems") {
        this._onFieldChange(oChanges.child, false);
      }

      if (oChanges.name === "dependents" && oChanges.mutation === "insert" && oChanges.child && oChanges.child.isA("sap.m.p13n.Popup")) {
        this._onCloseAdaptFilterDialog(oChanges.child);
      }
    },

    _onFieldChange: function (oFilterField, bIsFromFilterbar) {
      var oFieldMultiInput = oFilterField.getAggregation("_content") && oFilterField.getAggregation("_content")[0];
      if (oFieldMultiInput) {
        var mEventRegistry = oFieldMultiInput.mEventRegistry;
        while (mEventRegistry.valueHelpRequest && mEventRegistry.valueHelpRequest.length) {
          var oEvent = mEventRegistry.valueHelpRequest[0];
          oFieldMultiInput.detachValueHelpRequest(oEvent.fFunction, oEvent.oListener);
        }
        if (oFieldMultiInput.attachValueHelpRequest) {
          oFieldMultiInput.attachValueHelpRequest(null, this._onValueHelpRequest, this);
        }
        if (bIsFromFilterbar) {
          this._getObserver().unobserve(oFilterField, {
            aggregations: ["_content"]
          });
        }
      }
    },

    _onCloseAdaptFilterDialog: function (oP13nPopup) {
      this._oVariables = {};
      _.forEach(this._getVariables(), function (oVariable) {
        this._oVariables[oVariable.Name] = {
          Name: oVariable.Name, MemberFilter: [].concat(oVariable.MemberFilter)
        };
      }.bind(this));
      var fnPressCancelButton = function (oEvent) {
        if (oEvent.getParameters().reason === "Cancel") {
          var oDataProvider = this._getDataProvider();
          _.forEach(this._oVariables, function (oVariable) {
            var aMemberFilter = oVariable.MemberFilter ? oVariable.MemberFilter : [];
            oDataProvider.setVariableValue(oVariable.Name, aMemberFilter);
          }.bind(this));
        }
        this._oVariables = undefined;
      };
      oP13nPopup.attachClose(null, fnPressCancelButton, this);
    },

    _onValueHelpRequest: function (oEvent) {
      var oFilterField = oEvent.getSource().getParent();
      var oFilterBar = oFilterField.getParent();
      var sVariableName = oFilterField.getFieldPath();
      this._getDataProvider().openVariableSelector(sVariableName)
        .then(function (bFilterIsChanged) {
          if (bFilterIsChanged) {
            var oVariable = this._getVariable(sVariableName);
            this.updateConditionsForSingleField(oVariable, oFilterBar);
          }
        }.bind(this));
    },

    updateConditionsForSingleField: function (oVariable, oFilterBar) {
      var oState = {
        filter: {}
      };
      oState.filter[oVariable.Name] = this.getFilterConditions(oVariable);
      return StateUtil.retrieveExternalState(oFilterBar).then(function (oFilterState) {
        if (oFilterState.filter[oVariable.Name]) {
          return StateUtil.diffState(oFilterBar, oFilterState.filter[oVariable.Name], oState);
        }
        return null;
      }).then(function (oDiffState) {
        if (oDiffState && oDiffState.filter && oDiffState.filter[oVariable.Name]) {
          oState.filter[oVariable.Name] = oDiffState.filter[oVariable.Name];
        }
        return StateUtil.applyExternalState(oFilterBar, oState);
      });
    }
  };
});
