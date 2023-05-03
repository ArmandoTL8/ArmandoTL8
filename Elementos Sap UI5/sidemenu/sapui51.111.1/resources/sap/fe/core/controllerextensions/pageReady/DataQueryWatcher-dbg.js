/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/macros/table/Utils"], function (Log, Utils) {
  "use strict";

  let DataQueryWatcher = /*#__PURE__*/function () {
    function DataQueryWatcher(_oEventProvider, _fnOnFinished) {
      this._aBindingRegistrations = [];
      this._aOtherEventSources = [];
      this._isSearchPending = false;
      this._aMDCTables = [];
      this._aMDCCharts = [];
      this._oEventProvider = _oEventProvider;
      this._fnOnFinished = _fnOnFinished;
    }
    // Accessors
    var _proto = DataQueryWatcher.prototype;
    _proto.isSearchPending = function isSearchPending() {
      return this._isSearchPending;
    };
    _proto.isDataReceived = function isDataReceived() {
      return this._isDataReceived;
    };
    _proto.resetDataReceived = function resetDataReceived() {
      this._isDataReceived = undefined;
    }
    /**
     * Reset the state: unsubscribe to all data events and remove all registered objects.
     */;
    _proto.reset = function reset() {
      // Remove all remaining callbacks
      this._aBindingRegistrations.forEach(reg => {
        reg.binding.detachEvent("dataRequested", this.onDataRequested, this);
        reg.binding.detachEvent("dataReceived", this.onDataReceived, this);
      });
      this._aOtherEventSources.forEach(oElement => {
        oElement.detachEvent("search", this.onSearch, this);
        oElement.detachEvent("bindingUpdated", this.register, this);
      });
      this._aBindingRegistrations = [];
      this._aOtherEventSources = [];
      this._aMDCTables = [];
      this._aMDCCharts = [];
      this._isSearchPending = false;
      this._isDataReceived = undefined;
    }
    // //////////////////////////////////////////////////
    // Callback when data is received on a binding.
    ;
    _proto.onDataReceived = function onDataReceived(oEvent, params) {
      // Look for the corresponding binding registration
      const binding = oEvent.getSource();
      const bindingRegistration = this._aBindingRegistrations.find(reg => {
        return reg.binding === binding;
      });
      if (!bindingRegistration) {
        Log.error("PageReady - data received on an unregistered binding");
        return;
      }
      switch (binding.getGroupId()) {
        case "$auto.Workers":
          this._oEventProvider.fireEvent("workersBatchReceived");
          break;
        case "$auto.Heroes":
          this._oEventProvider.fireEvent("heroesBatchReceived");
          break;
        default:
      }
      bindingRegistration.receivedCount++;
      if (bindingRegistration.receivedCount < bindingRegistration.requestedCount) {
        // There are other request pending --> resubscribe to wait until they return
        binding.attachEventOnce("dataReceived", {
          triggeredBySearch: params.triggeredBySearch
        }, this.onDataReceived, this);
        return;
      }
      // Check if at least one binding has requested data, and all bindings that have requested data have received it
      const bAllDone = this._aBindingRegistrations.some(reg => {
        return reg.requestedCount !== 0;
      }) && this._aBindingRegistrations.every(reg => {
        return reg.requestedCount === 0 || reg.receivedCount >= reg.requestedCount;
      });
      if (params.triggeredBySearch || bindingRegistration.receivedCount >= bindingRegistration.requestedCount) {
        this._isSearchPending = false;
      }
      if (bAllDone) {
        this._isDataReceived = true;
        this._fnOnFinished();
      }
    }
    // //////////////////////////////////////////////////
    // Callback when data is requested on a binding.
    ;
    _proto.onDataRequested = function onDataRequested(oEvent, params) {
      // Look for the corresponding binding registration
      const binding = oEvent.getSource();
      const bindingRegistration = this._aBindingRegistrations.find(reg => {
        return reg.binding === binding;
      });
      if (!bindingRegistration) {
        Log.error("PageReady - data requested on an unregistered binding");
        return;
      }
      bindingRegistration.requestedCount++;
      this._isDataReceived = false;
      if (bindingRegistration.requestedCount - bindingRegistration.receivedCount === 1) {
        // Listen to dataReceived only if there's no other request pending
        // Otherwise the 'dataReceived' handler would be called several times when the first query returns
        // and we wouldn't wait for all queries to be finished
        // (we will resubscribe to the dataReceived event in onDataReceived if necessary)
        binding.attachEventOnce("dataReceived", {
          triggeredBySearch: params.triggeredBySearch
        }, this.onDataReceived, this);
      }
    }
    // //////////////////////////////////////////////////
    // Callback when a search is triggered from a filterbar
    ;
    _proto.onSearch = function onSearch(oEvent) {
      const aMDCTableLinkedToFilterBar = this._aMDCTables.filter(oTable => {
        var _oTable$getParent;
        return oEvent.getSource().sId === oTable.getFilter() && oTable.getVisible() && !((_oTable$getParent = oTable.getParent()) !== null && _oTable$getParent !== void 0 && _oTable$getParent.getProperty("bindingSuspended"));
      });
      const aMDCChartsLinkedToFilterBar = this._aMDCCharts.filter(oChart => {
        return oEvent.getSource().sId === oChart.getFilter() && oChart.getVisible();
      });
      if (aMDCTableLinkedToFilterBar.length > 0 || aMDCChartsLinkedToFilterBar.length > 0) {
        this._isSearchPending = true;
      }
      aMDCTableLinkedToFilterBar.forEach(oTable => {
        this.registerTable(oTable, true);
      });
      aMDCChartsLinkedToFilterBar.forEach(async oChart => {
        try {
          if (oChart.innerChartBoundPromise) {
            await oChart.innerChartBoundPromise;
          }
          this.registerChart(oChart, true);
        } catch (oError) {
          Log.error("Cannot find a inner bound chart", oError);
        }
      });
    }
    // //////////////////////////////////////////////////
    // Register a binding (with an optional table/chart)
    // and attach callbacks on dateRequested/dataReceived events
    ;
    _proto.register = function register(_event, data) {
      var _data$table, _data$chart;
      const binding = data.binding || ((_data$table = data.table) === null || _data$table === void 0 ? void 0 : _data$table.getRowBinding()) || ((_data$chart = data.chart) === null || _data$chart === void 0 ? void 0 : _data$chart.getControlDelegate().getInnerChart(data.chart).getBinding("data"));
      const boundControl = data.table || data.chart;
      if (!binding) {
        return;
      }
      // Check if the binding is already registered
      let bindingRegistration = this._aBindingRegistrations.find(reg => {
        return reg.binding === binding;
      });
      if (bindingRegistration) {
        if (boundControl) {
          // The binding was already registerd without boundControl information --> update boundControl
          bindingRegistration.boundControl = boundControl;
        }
        // This binding has already requested data, but we're registering it again (on search) --> attach to dataRequested again
        if (bindingRegistration.requestedCount > 0) {
          binding.detachEvent("dataRequested", this.onDataRequested, this);
          binding.attachEventOnce("dataRequested", {
            triggeredBySearch: data.triggeredBySearch
          }, this.onDataRequested, this);
        }
        return;
      }
      if (boundControl) {
        // Check if there's a different binding registered for the bound control
        bindingRegistration = this._aBindingRegistrations.find(reg => {
          return reg.boundControl === boundControl;
        });
        if (bindingRegistration && bindingRegistration.binding !== binding) {
          // The control had a different binding. This can happen in case of MDC charts who recreated their binding after search
          // The previous binding is destroyed, we can replace it with the new and reset counters
          bindingRegistration.binding = binding;
          bindingRegistration.requestedCount = 0;
          bindingRegistration.receivedCount = 0;
        }
      }
      if (!bindingRegistration) {
        bindingRegistration = {
          binding: binding,
          boundControl: boundControl,
          requestedCount: 0,
          receivedCount: 0
        };
        this._aBindingRegistrations.push(bindingRegistration);
      }
      binding.detachEvent("dataRequested", this.onDataRequested, this);
      binding.attachEventOnce("dataRequested", {
        triggeredBySearch: data.triggeredBySearch
      }, this.onDataRequested, this);
    }
    /**
     * Registers a binding for watching its data events (dataRequested and dataReceived).
     *
     * @param binding The binding
     */;
    _proto.registerBinding = function registerBinding(binding) {
      this.register(null, {
        binding,
        triggeredBySearch: false
      });
    }
    /**
     * Registers an MDCTable for watching the data events on its row binding (dataRequested and dataReceived).
     *
     * @param table The table
     * @param triggeredBySearch True if this registration is triggered by a filterBar search
     */;
    _proto.registerTable = function registerTable(table) {
      let triggeredBySearch = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      if (this._aMDCTables.indexOf(table) < 0) {
        this._aMDCTables.push(table);
      }
      const oRowBinding = table.getRowBinding();
      if (oRowBinding) {
        this.register(null, {
          table,
          triggeredBySearch
        });
      }
      if (this._aOtherEventSources.indexOf(table) === -1) {
        table.attachEvent("bindingUpdated", {
          table,
          triggeredBySearch
        }, this.register, this);
        this._aOtherEventSources.push(table);
      }
    }
    /**
     * Registers an MDCChart for watching the data events on its inner data binding (dataRequested and dataReceived).
     *
     * @param chart The chart
     * @param triggeredBySearch True if this registration is triggered by a filterBar search
     */;
    _proto.registerChart = function registerChart(chart) {
      let triggeredBySearch = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      if (this._aMDCCharts.indexOf(chart) < 0) {
        this._aMDCCharts.push(chart);
      }
      const oInnerChart = chart.getControlDelegate().getInnerChart(chart);
      const binding = oInnerChart === null || oInnerChart === void 0 ? void 0 : oInnerChart.getBinding("data");
      if (binding) {
        this.register(null, {
          chart,
          triggeredBySearch
        });
      }
      if (this._aOtherEventSources.indexOf(chart) === -1) {
        chart.attachEvent("bindingUpdated", {
          chart,
          triggeredBySearch
        }, this.register, this);
        this._aOtherEventSources.push(chart);
      }
    }
    /**
     * Registers an MDCTable or MDCChart for watching the data events on its inner data binding (dataRequested and dataReceived).
     *
     * @param element  The table or chart
     */;
    _proto.registerTableOrChart = async function registerTableOrChart(element) {
      if (!element.isA("sap.ui.mdc.Table") && !element.isA("sap.ui.mdc.Chart")) {
        return;
      }
      try {
        await element.initialized(); // access binding only after table/chart is bound
        if (element.isA("sap.ui.mdc.Table")) {
          this.registerTable(element);
          //If the autoBindOnInit is enabled, the table will be rebound
          //Then we need to wait for this rebind to occur to ensure the pageReady will also wait for the data to be received
          if (element.getAutoBindOnInit() && element.getDomRef()) {
            await Utils.whenBound(element);
          }
        } else {
          this.registerChart(element);
        }
      } catch (oError) {
        Log.error("PageReady - Cannot register a table or a chart", oError);
      }
    }
    /**
     * Registers an MDCFilterBar for watching its search event.
     *
     * @param filterBar The filter bar
     */;
    _proto.registerFilterBar = function registerFilterBar(filterBar) {
      filterBar.attachEvent("search", this.onSearch, this);
      this._aOtherEventSources.push(filterBar);
    };
    return DataQueryWatcher;
  }();
  return DataQueryWatcher;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEYXRhUXVlcnlXYXRjaGVyIiwiX29FdmVudFByb3ZpZGVyIiwiX2ZuT25GaW5pc2hlZCIsIl9hQmluZGluZ1JlZ2lzdHJhdGlvbnMiLCJfYU90aGVyRXZlbnRTb3VyY2VzIiwiX2lzU2VhcmNoUGVuZGluZyIsIl9hTURDVGFibGVzIiwiX2FNRENDaGFydHMiLCJpc1NlYXJjaFBlbmRpbmciLCJpc0RhdGFSZWNlaXZlZCIsIl9pc0RhdGFSZWNlaXZlZCIsInJlc2V0RGF0YVJlY2VpdmVkIiwidW5kZWZpbmVkIiwicmVzZXQiLCJmb3JFYWNoIiwicmVnIiwiYmluZGluZyIsImRldGFjaEV2ZW50Iiwib25EYXRhUmVxdWVzdGVkIiwib25EYXRhUmVjZWl2ZWQiLCJvRWxlbWVudCIsIm9uU2VhcmNoIiwicmVnaXN0ZXIiLCJvRXZlbnQiLCJwYXJhbXMiLCJnZXRTb3VyY2UiLCJiaW5kaW5nUmVnaXN0cmF0aW9uIiwiZmluZCIsIkxvZyIsImVycm9yIiwiZ2V0R3JvdXBJZCIsImZpcmVFdmVudCIsInJlY2VpdmVkQ291bnQiLCJyZXF1ZXN0ZWRDb3VudCIsImF0dGFjaEV2ZW50T25jZSIsInRyaWdnZXJlZEJ5U2VhcmNoIiwiYkFsbERvbmUiLCJzb21lIiwiZXZlcnkiLCJhTURDVGFibGVMaW5rZWRUb0ZpbHRlckJhciIsImZpbHRlciIsIm9UYWJsZSIsInNJZCIsImdldEZpbHRlciIsImdldFZpc2libGUiLCJnZXRQYXJlbnQiLCJnZXRQcm9wZXJ0eSIsImFNRENDaGFydHNMaW5rZWRUb0ZpbHRlckJhciIsIm9DaGFydCIsImxlbmd0aCIsInJlZ2lzdGVyVGFibGUiLCJpbm5lckNoYXJ0Qm91bmRQcm9taXNlIiwicmVnaXN0ZXJDaGFydCIsIm9FcnJvciIsIl9ldmVudCIsImRhdGEiLCJ0YWJsZSIsImdldFJvd0JpbmRpbmciLCJjaGFydCIsImdldENvbnRyb2xEZWxlZ2F0ZSIsImdldElubmVyQ2hhcnQiLCJnZXRCaW5kaW5nIiwiYm91bmRDb250cm9sIiwicHVzaCIsInJlZ2lzdGVyQmluZGluZyIsImluZGV4T2YiLCJvUm93QmluZGluZyIsImF0dGFjaEV2ZW50Iiwib0lubmVyQ2hhcnQiLCJyZWdpc3RlclRhYmxlT3JDaGFydCIsImVsZW1lbnQiLCJpc0EiLCJpbml0aWFsaXplZCIsImdldEF1dG9CaW5kT25Jbml0IiwiZ2V0RG9tUmVmIiwiVXRpbHMiLCJ3aGVuQm91bmQiLCJyZWdpc3RlckZpbHRlckJhciIsImZpbHRlckJhciJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiRGF0YVF1ZXJ5V2F0Y2hlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBVdGlscyBmcm9tIFwic2FwL2ZlL21hY3Jvcy90YWJsZS9VdGlsc1wiO1xuaW1wb3J0IHR5cGUgRXZlbnQgZnJvbSBcInNhcC91aS9iYXNlL0V2ZW50XCI7XG5pbXBvcnQgdHlwZSBFdmVudFByb3ZpZGVyIGZyb20gXCJzYXAvdWkvYmFzZS9FdmVudFByb3ZpZGVyXCI7XG5pbXBvcnQgdHlwZSBDb250cm9sIGZyb20gXCJzYXAvdWkvY29yZS9Db250cm9sXCI7XG5pbXBvcnQgdHlwZSBDaGFydCBmcm9tIFwic2FwL3VpL21kYy9DaGFydFwiO1xuaW1wb3J0IHR5cGUgRmlsdGVyQmFyIGZyb20gXCJzYXAvdWkvbWRjL0ZpbHRlckJhclwiO1xuaW1wb3J0IHR5cGUgVGFibGUgZnJvbSBcInNhcC91aS9tZGMvVGFibGVcIjtcbmltcG9ydCB0eXBlIEJpbmRpbmcgZnJvbSBcInNhcC91aS9tb2RlbC9CaW5kaW5nXCI7XG5cbmNsYXNzIERhdGFRdWVyeVdhdGNoZXIge1xuXHRwcm90ZWN0ZWQgX2FCaW5kaW5nUmVnaXN0cmF0aW9uczogeyBiaW5kaW5nOiBCaW5kaW5nOyBib3VuZENvbnRyb2w/OiBDb250cm9sOyByZXF1ZXN0ZWRDb3VudDogbnVtYmVyOyByZWNlaXZlZENvdW50OiBudW1iZXIgfVtdID0gW107XG5cdHByb3RlY3RlZCBfYU90aGVyRXZlbnRTb3VyY2VzOiBFdmVudFByb3ZpZGVyW10gPSBbXTtcblx0cHJvdGVjdGVkIF9pc1NlYXJjaFBlbmRpbmcgPSBmYWxzZTtcblx0cHJvdGVjdGVkIF9pc0RhdGFSZWNlaXZlZD86IGJvb2xlYW47XG5cdHByb3RlY3RlZCBfYU1EQ1RhYmxlczogVGFibGVbXSA9IFtdO1xuXHRwcm90ZWN0ZWQgX2FNRENDaGFydHM6IENoYXJ0W10gPSBbXTtcblx0cHVibGljIGNvbnN0cnVjdG9yKHByb3RlY3RlZCBfb0V2ZW50UHJvdmlkZXI6IEV2ZW50UHJvdmlkZXIsIHByb3RlY3RlZCBfZm5PbkZpbmlzaGVkOiAoKSA9PiB2b2lkKSB7fVxuXHQvLyBBY2Nlc3NvcnNcblx0cHVibGljIGlzU2VhcmNoUGVuZGluZygpIHtcblx0XHRyZXR1cm4gdGhpcy5faXNTZWFyY2hQZW5kaW5nO1xuXHR9XG5cdHB1YmxpYyBpc0RhdGFSZWNlaXZlZCgpIHtcblx0XHRyZXR1cm4gdGhpcy5faXNEYXRhUmVjZWl2ZWQ7XG5cdH1cblx0cHVibGljIHJlc2V0RGF0YVJlY2VpdmVkKCkge1xuXHRcdHRoaXMuX2lzRGF0YVJlY2VpdmVkID0gdW5kZWZpbmVkO1xuXHR9XG5cdC8qKlxuXHQgKiBSZXNldCB0aGUgc3RhdGU6IHVuc3Vic2NyaWJlIHRvIGFsbCBkYXRhIGV2ZW50cyBhbmQgcmVtb3ZlIGFsbCByZWdpc3RlcmVkIG9iamVjdHMuXG5cdCAqL1xuXHRwdWJsaWMgcmVzZXQoKTogdm9pZCB7XG5cdFx0Ly8gUmVtb3ZlIGFsbCByZW1haW5pbmcgY2FsbGJhY2tzXG5cdFx0dGhpcy5fYUJpbmRpbmdSZWdpc3RyYXRpb25zLmZvckVhY2goKHJlZykgPT4ge1xuXHRcdFx0cmVnLmJpbmRpbmcuZGV0YWNoRXZlbnQoXCJkYXRhUmVxdWVzdGVkXCIsIHRoaXMub25EYXRhUmVxdWVzdGVkLCB0aGlzKTtcblx0XHRcdHJlZy5iaW5kaW5nLmRldGFjaEV2ZW50KFwiZGF0YVJlY2VpdmVkXCIsIHRoaXMub25EYXRhUmVjZWl2ZWQsIHRoaXMpO1xuXHRcdH0pO1xuXHRcdHRoaXMuX2FPdGhlckV2ZW50U291cmNlcy5mb3JFYWNoKChvRWxlbWVudDogYW55KSA9PiB7XG5cdFx0XHRvRWxlbWVudC5kZXRhY2hFdmVudChcInNlYXJjaFwiLCB0aGlzLm9uU2VhcmNoLCB0aGlzKTtcblx0XHRcdG9FbGVtZW50LmRldGFjaEV2ZW50KFwiYmluZGluZ1VwZGF0ZWRcIiwgdGhpcy5yZWdpc3RlciwgdGhpcyk7XG5cdFx0fSk7XG5cdFx0dGhpcy5fYUJpbmRpbmdSZWdpc3RyYXRpb25zID0gW107XG5cdFx0dGhpcy5fYU90aGVyRXZlbnRTb3VyY2VzID0gW107XG5cdFx0dGhpcy5fYU1EQ1RhYmxlcyA9IFtdO1xuXHRcdHRoaXMuX2FNRENDaGFydHMgPSBbXTtcblx0XHR0aGlzLl9pc1NlYXJjaFBlbmRpbmcgPSBmYWxzZTtcblx0XHR0aGlzLl9pc0RhdGFSZWNlaXZlZCA9IHVuZGVmaW5lZDtcblx0fVxuXHQvLyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHQvLyBDYWxsYmFjayB3aGVuIGRhdGEgaXMgcmVjZWl2ZWQgb24gYSBiaW5kaW5nLlxuXHRwcm90ZWN0ZWQgb25EYXRhUmVjZWl2ZWQob0V2ZW50OiBFdmVudCwgcGFyYW1zOiB7IHRyaWdnZXJlZEJ5U2VhcmNoOiBib29sZWFuIH0pOiB2b2lkIHtcblx0XHQvLyBMb29rIGZvciB0aGUgY29ycmVzcG9uZGluZyBiaW5kaW5nIHJlZ2lzdHJhdGlvblxuXHRcdGNvbnN0IGJpbmRpbmcgPSBvRXZlbnQuZ2V0U291cmNlKCkgYXMgQmluZGluZztcblx0XHRjb25zdCBiaW5kaW5nUmVnaXN0cmF0aW9uID0gdGhpcy5fYUJpbmRpbmdSZWdpc3RyYXRpb25zLmZpbmQoKHJlZykgPT4ge1xuXHRcdFx0cmV0dXJuIHJlZy5iaW5kaW5nID09PSBiaW5kaW5nO1xuXHRcdH0pO1xuXHRcdGlmICghYmluZGluZ1JlZ2lzdHJhdGlvbikge1xuXHRcdFx0TG9nLmVycm9yKFwiUGFnZVJlYWR5IC0gZGF0YSByZWNlaXZlZCBvbiBhbiB1bnJlZ2lzdGVyZWQgYmluZGluZ1wiKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0c3dpdGNoICgoYmluZGluZyBhcyBhbnkpLmdldEdyb3VwSWQoKSkge1xuXHRcdFx0Y2FzZSBcIiRhdXRvLldvcmtlcnNcIjpcblx0XHRcdFx0dGhpcy5fb0V2ZW50UHJvdmlkZXIuZmlyZUV2ZW50KFwid29ya2Vyc0JhdGNoUmVjZWl2ZWRcIik7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIiRhdXRvLkhlcm9lc1wiOlxuXHRcdFx0XHR0aGlzLl9vRXZlbnRQcm92aWRlci5maXJlRXZlbnQoXCJoZXJvZXNCYXRjaFJlY2VpdmVkXCIpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGRlZmF1bHQ6XG5cdFx0fVxuXHRcdGJpbmRpbmdSZWdpc3RyYXRpb24ucmVjZWl2ZWRDb3VudCsrO1xuXHRcdGlmIChiaW5kaW5nUmVnaXN0cmF0aW9uLnJlY2VpdmVkQ291bnQgPCBiaW5kaW5nUmVnaXN0cmF0aW9uLnJlcXVlc3RlZENvdW50KSB7XG5cdFx0XHQvLyBUaGVyZSBhcmUgb3RoZXIgcmVxdWVzdCBwZW5kaW5nIC0tPiByZXN1YnNjcmliZSB0byB3YWl0IHVudGlsIHRoZXkgcmV0dXJuXG5cdFx0XHRiaW5kaW5nLmF0dGFjaEV2ZW50T25jZShcImRhdGFSZWNlaXZlZFwiLCB7IHRyaWdnZXJlZEJ5U2VhcmNoOiBwYXJhbXMudHJpZ2dlcmVkQnlTZWFyY2ggfSwgdGhpcy5vbkRhdGFSZWNlaXZlZCwgdGhpcyk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdC8vIENoZWNrIGlmIGF0IGxlYXN0IG9uZSBiaW5kaW5nIGhhcyByZXF1ZXN0ZWQgZGF0YSwgYW5kIGFsbCBiaW5kaW5ncyB0aGF0IGhhdmUgcmVxdWVzdGVkIGRhdGEgaGF2ZSByZWNlaXZlZCBpdFxuXHRcdGNvbnN0IGJBbGxEb25lID1cblx0XHRcdHRoaXMuX2FCaW5kaW5nUmVnaXN0cmF0aW9ucy5zb21lKChyZWcpID0+IHtcblx0XHRcdFx0cmV0dXJuIHJlZy5yZXF1ZXN0ZWRDb3VudCAhPT0gMDtcblx0XHRcdH0pICYmXG5cdFx0XHR0aGlzLl9hQmluZGluZ1JlZ2lzdHJhdGlvbnMuZXZlcnkoKHJlZykgPT4ge1xuXHRcdFx0XHRyZXR1cm4gcmVnLnJlcXVlc3RlZENvdW50ID09PSAwIHx8IHJlZy5yZWNlaXZlZENvdW50ID49IHJlZy5yZXF1ZXN0ZWRDb3VudDtcblx0XHRcdH0pO1xuXHRcdGlmIChwYXJhbXMudHJpZ2dlcmVkQnlTZWFyY2ggfHwgYmluZGluZ1JlZ2lzdHJhdGlvbi5yZWNlaXZlZENvdW50ID49IGJpbmRpbmdSZWdpc3RyYXRpb24ucmVxdWVzdGVkQ291bnQpIHtcblx0XHRcdHRoaXMuX2lzU2VhcmNoUGVuZGluZyA9IGZhbHNlO1xuXHRcdH1cblx0XHRpZiAoYkFsbERvbmUpIHtcblx0XHRcdHRoaXMuX2lzRGF0YVJlY2VpdmVkID0gdHJ1ZTtcblx0XHRcdHRoaXMuX2ZuT25GaW5pc2hlZCgpO1xuXHRcdH1cblx0fVxuXHQvLyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHQvLyBDYWxsYmFjayB3aGVuIGRhdGEgaXMgcmVxdWVzdGVkIG9uIGEgYmluZGluZy5cblx0cHJvdGVjdGVkIG9uRGF0YVJlcXVlc3RlZChvRXZlbnQ6IEV2ZW50LCBwYXJhbXM6IHsgdHJpZ2dlcmVkQnlTZWFyY2g6IGJvb2xlYW4gfSk6IHZvaWQge1xuXHRcdC8vIExvb2sgZm9yIHRoZSBjb3JyZXNwb25kaW5nIGJpbmRpbmcgcmVnaXN0cmF0aW9uXG5cdFx0Y29uc3QgYmluZGluZyA9IG9FdmVudC5nZXRTb3VyY2UoKSBhcyBCaW5kaW5nO1xuXHRcdGNvbnN0IGJpbmRpbmdSZWdpc3RyYXRpb24gPSB0aGlzLl9hQmluZGluZ1JlZ2lzdHJhdGlvbnMuZmluZCgocmVnKSA9PiB7XG5cdFx0XHRyZXR1cm4gcmVnLmJpbmRpbmcgPT09IGJpbmRpbmc7XG5cdFx0fSk7XG5cdFx0aWYgKCFiaW5kaW5nUmVnaXN0cmF0aW9uKSB7XG5cdFx0XHRMb2cuZXJyb3IoXCJQYWdlUmVhZHkgLSBkYXRhIHJlcXVlc3RlZCBvbiBhbiB1bnJlZ2lzdGVyZWQgYmluZGluZ1wiKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0YmluZGluZ1JlZ2lzdHJhdGlvbi5yZXF1ZXN0ZWRDb3VudCsrO1xuXHRcdHRoaXMuX2lzRGF0YVJlY2VpdmVkID0gZmFsc2U7XG5cdFx0aWYgKGJpbmRpbmdSZWdpc3RyYXRpb24ucmVxdWVzdGVkQ291bnQgLSBiaW5kaW5nUmVnaXN0cmF0aW9uLnJlY2VpdmVkQ291bnQgPT09IDEpIHtcblx0XHRcdC8vIExpc3RlbiB0byBkYXRhUmVjZWl2ZWQgb25seSBpZiB0aGVyZSdzIG5vIG90aGVyIHJlcXVlc3QgcGVuZGluZ1xuXHRcdFx0Ly8gT3RoZXJ3aXNlIHRoZSAnZGF0YVJlY2VpdmVkJyBoYW5kbGVyIHdvdWxkIGJlIGNhbGxlZCBzZXZlcmFsIHRpbWVzIHdoZW4gdGhlIGZpcnN0IHF1ZXJ5IHJldHVybnNcblx0XHRcdC8vIGFuZCB3ZSB3b3VsZG4ndCB3YWl0IGZvciBhbGwgcXVlcmllcyB0byBiZSBmaW5pc2hlZFxuXHRcdFx0Ly8gKHdlIHdpbGwgcmVzdWJzY3JpYmUgdG8gdGhlIGRhdGFSZWNlaXZlZCBldmVudCBpbiBvbkRhdGFSZWNlaXZlZCBpZiBuZWNlc3NhcnkpXG5cdFx0XHRiaW5kaW5nLmF0dGFjaEV2ZW50T25jZShcImRhdGFSZWNlaXZlZFwiLCB7IHRyaWdnZXJlZEJ5U2VhcmNoOiBwYXJhbXMudHJpZ2dlcmVkQnlTZWFyY2ggfSwgdGhpcy5vbkRhdGFSZWNlaXZlZCwgdGhpcyk7XG5cdFx0fVxuXHR9XG5cdC8vIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdC8vIENhbGxiYWNrIHdoZW4gYSBzZWFyY2ggaXMgdHJpZ2dlcmVkIGZyb20gYSBmaWx0ZXJiYXJcblx0cHJvdGVjdGVkIG9uU2VhcmNoKG9FdmVudDogRXZlbnQpOiB2b2lkIHtcblx0XHRjb25zdCBhTURDVGFibGVMaW5rZWRUb0ZpbHRlckJhciA9IHRoaXMuX2FNRENUYWJsZXMuZmlsdGVyKChvVGFibGUpID0+IHtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdChvRXZlbnQuZ2V0U291cmNlKCkgYXMgYW55KS5zSWQgPT09IG9UYWJsZS5nZXRGaWx0ZXIoKSAmJlxuXHRcdFx0XHRvVGFibGUuZ2V0VmlzaWJsZSgpICYmXG5cdFx0XHRcdCFvVGFibGUuZ2V0UGFyZW50KCk/LmdldFByb3BlcnR5KFwiYmluZGluZ1N1c3BlbmRlZFwiKVxuXHRcdFx0KTtcblx0XHR9KTtcblx0XHRjb25zdCBhTURDQ2hhcnRzTGlua2VkVG9GaWx0ZXJCYXIgPSB0aGlzLl9hTURDQ2hhcnRzLmZpbHRlcigob0NoYXJ0KSA9PiB7XG5cdFx0XHRyZXR1cm4gKG9FdmVudC5nZXRTb3VyY2UoKSBhcyBhbnkpLnNJZCA9PT0gb0NoYXJ0LmdldEZpbHRlcigpICYmIG9DaGFydC5nZXRWaXNpYmxlKCk7XG5cdFx0fSk7XG5cdFx0aWYgKGFNRENUYWJsZUxpbmtlZFRvRmlsdGVyQmFyLmxlbmd0aCA+IDAgfHwgYU1EQ0NoYXJ0c0xpbmtlZFRvRmlsdGVyQmFyLmxlbmd0aCA+IDApIHtcblx0XHRcdHRoaXMuX2lzU2VhcmNoUGVuZGluZyA9IHRydWU7XG5cdFx0fVxuXHRcdGFNRENUYWJsZUxpbmtlZFRvRmlsdGVyQmFyLmZvckVhY2goKG9UYWJsZSkgPT4ge1xuXHRcdFx0dGhpcy5yZWdpc3RlclRhYmxlKG9UYWJsZSwgdHJ1ZSk7XG5cdFx0fSk7XG5cdFx0YU1EQ0NoYXJ0c0xpbmtlZFRvRmlsdGVyQmFyLmZvckVhY2goYXN5bmMgKG9DaGFydDogYW55KSA9PiB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRpZiAob0NoYXJ0LmlubmVyQ2hhcnRCb3VuZFByb21pc2UpIHtcblx0XHRcdFx0XHRhd2FpdCBvQ2hhcnQuaW5uZXJDaGFydEJvdW5kUHJvbWlzZTtcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLnJlZ2lzdGVyQ2hhcnQob0NoYXJ0LCB0cnVlKTtcblx0XHRcdH0gY2F0Y2ggKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdExvZy5lcnJvcihcIkNhbm5vdCBmaW5kIGEgaW5uZXIgYm91bmQgY2hhcnRcIiwgb0Vycm9yKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXHQvLyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHQvLyBSZWdpc3RlciBhIGJpbmRpbmcgKHdpdGggYW4gb3B0aW9uYWwgdGFibGUvY2hhcnQpXG5cdC8vIGFuZCBhdHRhY2ggY2FsbGJhY2tzIG9uIGRhdGVSZXF1ZXN0ZWQvZGF0YVJlY2VpdmVkIGV2ZW50c1xuXHRwdWJsaWMgcmVnaXN0ZXIoX2V2ZW50OiBFdmVudCB8IG51bGwsIGRhdGE6IHsgYmluZGluZz86IEJpbmRpbmc7IHRhYmxlPzogVGFibGU7IGNoYXJ0PzogQ2hhcnQ7IHRyaWdnZXJlZEJ5U2VhcmNoOiBib29sZWFuIH0pOiB2b2lkIHtcblx0XHRjb25zdCBiaW5kaW5nOiBCaW5kaW5nIHwgdW5kZWZpbmVkID1cblx0XHRcdGRhdGEuYmluZGluZyB8fFxuXHRcdFx0ZGF0YS50YWJsZT8uZ2V0Um93QmluZGluZygpIHx8XG5cdFx0XHQoZGF0YS5jaGFydCBhcyBhbnkpPy5nZXRDb250cm9sRGVsZWdhdGUoKS5nZXRJbm5lckNoYXJ0KGRhdGEuY2hhcnQpLmdldEJpbmRpbmcoXCJkYXRhXCIpO1xuXHRcdGNvbnN0IGJvdW5kQ29udHJvbCA9IChkYXRhLnRhYmxlIHx8IGRhdGEuY2hhcnQpIGFzIENvbnRyb2wgfCB1bmRlZmluZWQ7XG5cdFx0aWYgKCFiaW5kaW5nKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdC8vIENoZWNrIGlmIHRoZSBiaW5kaW5nIGlzIGFscmVhZHkgcmVnaXN0ZXJlZFxuXHRcdGxldCBiaW5kaW5nUmVnaXN0cmF0aW9uID0gdGhpcy5fYUJpbmRpbmdSZWdpc3RyYXRpb25zLmZpbmQoKHJlZykgPT4ge1xuXHRcdFx0cmV0dXJuIHJlZy5iaW5kaW5nID09PSBiaW5kaW5nO1xuXHRcdH0pO1xuXHRcdGlmIChiaW5kaW5nUmVnaXN0cmF0aW9uKSB7XG5cdFx0XHRpZiAoYm91bmRDb250cm9sKSB7XG5cdFx0XHRcdC8vIFRoZSBiaW5kaW5nIHdhcyBhbHJlYWR5IHJlZ2lzdGVyZCB3aXRob3V0IGJvdW5kQ29udHJvbCBpbmZvcm1hdGlvbiAtLT4gdXBkYXRlIGJvdW5kQ29udHJvbFxuXHRcdFx0XHRiaW5kaW5nUmVnaXN0cmF0aW9uLmJvdW5kQ29udHJvbCA9IGJvdW5kQ29udHJvbDtcblx0XHRcdH1cblx0XHRcdC8vIFRoaXMgYmluZGluZyBoYXMgYWxyZWFkeSByZXF1ZXN0ZWQgZGF0YSwgYnV0IHdlJ3JlIHJlZ2lzdGVyaW5nIGl0IGFnYWluIChvbiBzZWFyY2gpIC0tPiBhdHRhY2ggdG8gZGF0YVJlcXVlc3RlZCBhZ2FpblxuXHRcdFx0aWYgKGJpbmRpbmdSZWdpc3RyYXRpb24ucmVxdWVzdGVkQ291bnQgPiAwKSB7XG5cdFx0XHRcdGJpbmRpbmcuZGV0YWNoRXZlbnQoXCJkYXRhUmVxdWVzdGVkXCIsIHRoaXMub25EYXRhUmVxdWVzdGVkLCB0aGlzKTtcblx0XHRcdFx0YmluZGluZy5hdHRhY2hFdmVudE9uY2UoXCJkYXRhUmVxdWVzdGVkXCIsIHsgdHJpZ2dlcmVkQnlTZWFyY2g6IGRhdGEudHJpZ2dlcmVkQnlTZWFyY2ggfSwgdGhpcy5vbkRhdGFSZXF1ZXN0ZWQsIHRoaXMpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRpZiAoYm91bmRDb250cm9sKSB7XG5cdFx0XHQvLyBDaGVjayBpZiB0aGVyZSdzIGEgZGlmZmVyZW50IGJpbmRpbmcgcmVnaXN0ZXJlZCBmb3IgdGhlIGJvdW5kIGNvbnRyb2xcblx0XHRcdGJpbmRpbmdSZWdpc3RyYXRpb24gPSB0aGlzLl9hQmluZGluZ1JlZ2lzdHJhdGlvbnMuZmluZCgocmVnKSA9PiB7XG5cdFx0XHRcdHJldHVybiByZWcuYm91bmRDb250cm9sID09PSBib3VuZENvbnRyb2w7XG5cdFx0XHR9KTtcblx0XHRcdGlmIChiaW5kaW5nUmVnaXN0cmF0aW9uICYmIGJpbmRpbmdSZWdpc3RyYXRpb24uYmluZGluZyAhPT0gYmluZGluZykge1xuXHRcdFx0XHQvLyBUaGUgY29udHJvbCBoYWQgYSBkaWZmZXJlbnQgYmluZGluZy4gVGhpcyBjYW4gaGFwcGVuIGluIGNhc2Ugb2YgTURDIGNoYXJ0cyB3aG8gcmVjcmVhdGVkIHRoZWlyIGJpbmRpbmcgYWZ0ZXIgc2VhcmNoXG5cdFx0XHRcdC8vIFRoZSBwcmV2aW91cyBiaW5kaW5nIGlzIGRlc3Ryb3llZCwgd2UgY2FuIHJlcGxhY2UgaXQgd2l0aCB0aGUgbmV3IGFuZCByZXNldCBjb3VudGVyc1xuXHRcdFx0XHRiaW5kaW5nUmVnaXN0cmF0aW9uLmJpbmRpbmcgPSBiaW5kaW5nO1xuXHRcdFx0XHRiaW5kaW5nUmVnaXN0cmF0aW9uLnJlcXVlc3RlZENvdW50ID0gMDtcblx0XHRcdFx0YmluZGluZ1JlZ2lzdHJhdGlvbi5yZWNlaXZlZENvdW50ID0gMDtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKCFiaW5kaW5nUmVnaXN0cmF0aW9uKSB7XG5cdFx0XHRiaW5kaW5nUmVnaXN0cmF0aW9uID0ge1xuXHRcdFx0XHRiaW5kaW5nOiBiaW5kaW5nLFxuXHRcdFx0XHRib3VuZENvbnRyb2w6IGJvdW5kQ29udHJvbCxcblx0XHRcdFx0cmVxdWVzdGVkQ291bnQ6IDAsXG5cdFx0XHRcdHJlY2VpdmVkQ291bnQ6IDBcblx0XHRcdH07XG5cdFx0XHR0aGlzLl9hQmluZGluZ1JlZ2lzdHJhdGlvbnMucHVzaChiaW5kaW5nUmVnaXN0cmF0aW9uKTtcblx0XHR9XG5cdFx0YmluZGluZy5kZXRhY2hFdmVudChcImRhdGFSZXF1ZXN0ZWRcIiwgdGhpcy5vbkRhdGFSZXF1ZXN0ZWQsIHRoaXMpO1xuXHRcdGJpbmRpbmcuYXR0YWNoRXZlbnRPbmNlKFwiZGF0YVJlcXVlc3RlZFwiLCB7IHRyaWdnZXJlZEJ5U2VhcmNoOiBkYXRhLnRyaWdnZXJlZEJ5U2VhcmNoIH0sIHRoaXMub25EYXRhUmVxdWVzdGVkLCB0aGlzKTtcblx0fVxuXHQvKipcblx0ICogUmVnaXN0ZXJzIGEgYmluZGluZyBmb3Igd2F0Y2hpbmcgaXRzIGRhdGEgZXZlbnRzIChkYXRhUmVxdWVzdGVkIGFuZCBkYXRhUmVjZWl2ZWQpLlxuXHQgKlxuXHQgKiBAcGFyYW0gYmluZGluZyBUaGUgYmluZGluZ1xuXHQgKi9cblx0cHVibGljIHJlZ2lzdGVyQmluZGluZyhiaW5kaW5nOiBCaW5kaW5nKSB7XG5cdFx0dGhpcy5yZWdpc3RlcihudWxsLCB7IGJpbmRpbmcsIHRyaWdnZXJlZEJ5U2VhcmNoOiBmYWxzZSB9KTtcblx0fVxuXHQvKipcblx0ICogUmVnaXN0ZXJzIGFuIE1EQ1RhYmxlIGZvciB3YXRjaGluZyB0aGUgZGF0YSBldmVudHMgb24gaXRzIHJvdyBiaW5kaW5nIChkYXRhUmVxdWVzdGVkIGFuZCBkYXRhUmVjZWl2ZWQpLlxuXHQgKlxuXHQgKiBAcGFyYW0gdGFibGUgVGhlIHRhYmxlXG5cdCAqIEBwYXJhbSB0cmlnZ2VyZWRCeVNlYXJjaCBUcnVlIGlmIHRoaXMgcmVnaXN0cmF0aW9uIGlzIHRyaWdnZXJlZCBieSBhIGZpbHRlckJhciBzZWFyY2hcblx0ICovXG5cdHByb3RlY3RlZCByZWdpc3RlclRhYmxlKHRhYmxlOiBUYWJsZSwgdHJpZ2dlcmVkQnlTZWFyY2ggPSBmYWxzZSkge1xuXHRcdGlmICh0aGlzLl9hTURDVGFibGVzLmluZGV4T2YodGFibGUpIDwgMCkge1xuXHRcdFx0dGhpcy5fYU1EQ1RhYmxlcy5wdXNoKHRhYmxlKTtcblx0XHR9XG5cdFx0Y29uc3Qgb1Jvd0JpbmRpbmcgPSB0YWJsZS5nZXRSb3dCaW5kaW5nKCk7XG5cdFx0aWYgKG9Sb3dCaW5kaW5nKSB7XG5cdFx0XHR0aGlzLnJlZ2lzdGVyKG51bGwsIHsgdGFibGUsIHRyaWdnZXJlZEJ5U2VhcmNoIH0pO1xuXHRcdH1cblx0XHRpZiAodGhpcy5fYU90aGVyRXZlbnRTb3VyY2VzLmluZGV4T2YodGFibGUpID09PSAtMSkge1xuXHRcdFx0dGFibGUuYXR0YWNoRXZlbnQoXCJiaW5kaW5nVXBkYXRlZFwiLCB7IHRhYmxlLCB0cmlnZ2VyZWRCeVNlYXJjaCB9LCB0aGlzLnJlZ2lzdGVyLCB0aGlzKTtcblx0XHRcdHRoaXMuX2FPdGhlckV2ZW50U291cmNlcy5wdXNoKHRhYmxlKTtcblx0XHR9XG5cdH1cblx0LyoqXG5cdCAqIFJlZ2lzdGVycyBhbiBNRENDaGFydCBmb3Igd2F0Y2hpbmcgdGhlIGRhdGEgZXZlbnRzIG9uIGl0cyBpbm5lciBkYXRhIGJpbmRpbmcgKGRhdGFSZXF1ZXN0ZWQgYW5kIGRhdGFSZWNlaXZlZCkuXG5cdCAqXG5cdCAqIEBwYXJhbSBjaGFydCBUaGUgY2hhcnRcblx0ICogQHBhcmFtIHRyaWdnZXJlZEJ5U2VhcmNoIFRydWUgaWYgdGhpcyByZWdpc3RyYXRpb24gaXMgdHJpZ2dlcmVkIGJ5IGEgZmlsdGVyQmFyIHNlYXJjaFxuXHQgKi9cblx0cHJvdGVjdGVkIHJlZ2lzdGVyQ2hhcnQoY2hhcnQ6IENoYXJ0LCB0cmlnZ2VyZWRCeVNlYXJjaCA9IGZhbHNlKSB7XG5cdFx0aWYgKHRoaXMuX2FNRENDaGFydHMuaW5kZXhPZihjaGFydCkgPCAwKSB7XG5cdFx0XHR0aGlzLl9hTURDQ2hhcnRzLnB1c2goY2hhcnQpO1xuXHRcdH1cblx0XHRjb25zdCBvSW5uZXJDaGFydCA9IChjaGFydCBhcyBhbnkpLmdldENvbnRyb2xEZWxlZ2F0ZSgpLmdldElubmVyQ2hhcnQoY2hhcnQpO1xuXHRcdGNvbnN0IGJpbmRpbmcgPSBvSW5uZXJDaGFydD8uZ2V0QmluZGluZyhcImRhdGFcIik7XG5cdFx0aWYgKGJpbmRpbmcpIHtcblx0XHRcdHRoaXMucmVnaXN0ZXIobnVsbCwgeyBjaGFydCwgdHJpZ2dlcmVkQnlTZWFyY2ggfSk7XG5cdFx0fVxuXHRcdGlmICh0aGlzLl9hT3RoZXJFdmVudFNvdXJjZXMuaW5kZXhPZihjaGFydCkgPT09IC0xKSB7XG5cdFx0XHRjaGFydC5hdHRhY2hFdmVudChcImJpbmRpbmdVcGRhdGVkXCIsIHsgY2hhcnQsIHRyaWdnZXJlZEJ5U2VhcmNoIH0sIHRoaXMucmVnaXN0ZXIsIHRoaXMpO1xuXHRcdFx0dGhpcy5fYU90aGVyRXZlbnRTb3VyY2VzLnB1c2goY2hhcnQpO1xuXHRcdH1cblx0fVxuXHQvKipcblx0ICogUmVnaXN0ZXJzIGFuIE1EQ1RhYmxlIG9yIE1EQ0NoYXJ0IGZvciB3YXRjaGluZyB0aGUgZGF0YSBldmVudHMgb24gaXRzIGlubmVyIGRhdGEgYmluZGluZyAoZGF0YVJlcXVlc3RlZCBhbmQgZGF0YVJlY2VpdmVkKS5cblx0ICpcblx0ICogQHBhcmFtIGVsZW1lbnQgIFRoZSB0YWJsZSBvciBjaGFydFxuXHQgKi9cblx0cHVibGljIGFzeW5jIHJlZ2lzdGVyVGFibGVPckNoYXJ0KGVsZW1lbnQ6IFRhYmxlIHwgQ2hhcnQpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRpZiAoIWVsZW1lbnQuaXNBPFRhYmxlPihcInNhcC51aS5tZGMuVGFibGVcIikgJiYgIWVsZW1lbnQuaXNBPENoYXJ0PihcInNhcC51aS5tZGMuQ2hhcnRcIikpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0dHJ5IHtcblx0XHRcdGF3YWl0IGVsZW1lbnQuaW5pdGlhbGl6ZWQoKTsgLy8gYWNjZXNzIGJpbmRpbmcgb25seSBhZnRlciB0YWJsZS9jaGFydCBpcyBib3VuZFxuXHRcdFx0aWYgKGVsZW1lbnQuaXNBPFRhYmxlPihcInNhcC51aS5tZGMuVGFibGVcIikpIHtcblx0XHRcdFx0dGhpcy5yZWdpc3RlclRhYmxlKGVsZW1lbnQpO1xuXHRcdFx0XHQvL0lmIHRoZSBhdXRvQmluZE9uSW5pdCBpcyBlbmFibGVkLCB0aGUgdGFibGUgd2lsbCBiZSByZWJvdW5kXG5cdFx0XHRcdC8vVGhlbiB3ZSBuZWVkIHRvIHdhaXQgZm9yIHRoaXMgcmViaW5kIHRvIG9jY3VyIHRvIGVuc3VyZSB0aGUgcGFnZVJlYWR5IHdpbGwgYWxzbyB3YWl0IGZvciB0aGUgZGF0YSB0byBiZSByZWNlaXZlZFxuXHRcdFx0XHRpZiAoZWxlbWVudC5nZXRBdXRvQmluZE9uSW5pdCgpICYmIGVsZW1lbnQuZ2V0RG9tUmVmKCkpIHtcblx0XHRcdFx0XHRhd2FpdCBVdGlscy53aGVuQm91bmQoZWxlbWVudCk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMucmVnaXN0ZXJDaGFydChlbGVtZW50KTtcblx0XHRcdH1cblx0XHR9IGNhdGNoIChvRXJyb3I6IGFueSkge1xuXHRcdFx0TG9nLmVycm9yKFwiUGFnZVJlYWR5IC0gQ2Fubm90IHJlZ2lzdGVyIGEgdGFibGUgb3IgYSBjaGFydFwiLCBvRXJyb3IpO1xuXHRcdH1cblx0fVxuXHQvKipcblx0ICogUmVnaXN0ZXJzIGFuIE1EQ0ZpbHRlckJhciBmb3Igd2F0Y2hpbmcgaXRzIHNlYXJjaCBldmVudC5cblx0ICpcblx0ICogQHBhcmFtIGZpbHRlckJhciBUaGUgZmlsdGVyIGJhclxuXHQgKi9cblx0cHVibGljIHJlZ2lzdGVyRmlsdGVyQmFyKGZpbHRlckJhcjogRmlsdGVyQmFyKSB7XG5cdFx0ZmlsdGVyQmFyLmF0dGFjaEV2ZW50KFwic2VhcmNoXCIsIHRoaXMub25TZWFyY2gsIHRoaXMpO1xuXHRcdHRoaXMuX2FPdGhlckV2ZW50U291cmNlcy5wdXNoKGZpbHRlckJhcik7XG5cdH1cbn1cbmV4cG9ydCBkZWZhdWx0IERhdGFRdWVyeVdhdGNoZXI7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7TUFVTUEsZ0JBQWdCO0lBT3JCLDBCQUE2QkMsZUFBOEIsRUFBWUMsYUFBeUIsRUFBRTtNQUFBLEtBTnhGQyxzQkFBc0IsR0FBa0csRUFBRTtNQUFBLEtBQzFIQyxtQkFBbUIsR0FBb0IsRUFBRTtNQUFBLEtBQ3pDQyxnQkFBZ0IsR0FBRyxLQUFLO01BQUEsS0FFeEJDLFdBQVcsR0FBWSxFQUFFO01BQUEsS0FDekJDLFdBQVcsR0FBWSxFQUFFO01BQUEsS0FDTk4sZUFBOEIsR0FBOUJBLGVBQThCO01BQUEsS0FBWUMsYUFBeUIsR0FBekJBLGFBQXlCO0lBQUc7SUFDbkc7SUFBQTtJQUFBLE9BQ09NLGVBQWUsR0FBdEIsMkJBQXlCO01BQ3hCLE9BQU8sSUFBSSxDQUFDSCxnQkFBZ0I7SUFDN0IsQ0FBQztJQUFBLE9BQ01JLGNBQWMsR0FBckIsMEJBQXdCO01BQ3ZCLE9BQU8sSUFBSSxDQUFDQyxlQUFlO0lBQzVCLENBQUM7SUFBQSxPQUNNQyxpQkFBaUIsR0FBeEIsNkJBQTJCO01BQzFCLElBQUksQ0FBQ0QsZUFBZSxHQUFHRSxTQUFTO0lBQ2pDO0lBQ0E7QUFDRDtBQUNBLE9BRkM7SUFBQSxPQUdPQyxLQUFLLEdBQVosaUJBQXFCO01BQ3BCO01BQ0EsSUFBSSxDQUFDVixzQkFBc0IsQ0FBQ1csT0FBTyxDQUFFQyxHQUFHLElBQUs7UUFDNUNBLEdBQUcsQ0FBQ0MsT0FBTyxDQUFDQyxXQUFXLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQ0MsZUFBZSxFQUFFLElBQUksQ0FBQztRQUNwRUgsR0FBRyxDQUFDQyxPQUFPLENBQUNDLFdBQVcsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDRSxjQUFjLEVBQUUsSUFBSSxDQUFDO01BQ25FLENBQUMsQ0FBQztNQUNGLElBQUksQ0FBQ2YsbUJBQW1CLENBQUNVLE9BQU8sQ0FBRU0sUUFBYSxJQUFLO1FBQ25EQSxRQUFRLENBQUNILFdBQVcsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDSSxRQUFRLEVBQUUsSUFBSSxDQUFDO1FBQ25ERCxRQUFRLENBQUNILFdBQVcsQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUNLLFFBQVEsRUFBRSxJQUFJLENBQUM7TUFDNUQsQ0FBQyxDQUFDO01BQ0YsSUFBSSxDQUFDbkIsc0JBQXNCLEdBQUcsRUFBRTtNQUNoQyxJQUFJLENBQUNDLG1CQUFtQixHQUFHLEVBQUU7TUFDN0IsSUFBSSxDQUFDRSxXQUFXLEdBQUcsRUFBRTtNQUNyQixJQUFJLENBQUNDLFdBQVcsR0FBRyxFQUFFO01BQ3JCLElBQUksQ0FBQ0YsZ0JBQWdCLEdBQUcsS0FBSztNQUM3QixJQUFJLENBQUNLLGVBQWUsR0FBR0UsU0FBUztJQUNqQztJQUNBO0lBQ0E7SUFBQTtJQUFBLE9BQ1VPLGNBQWMsR0FBeEIsd0JBQXlCSSxNQUFhLEVBQUVDLE1BQXNDLEVBQVE7TUFDckY7TUFDQSxNQUFNUixPQUFPLEdBQUdPLE1BQU0sQ0FBQ0UsU0FBUyxFQUFhO01BQzdDLE1BQU1DLG1CQUFtQixHQUFHLElBQUksQ0FBQ3ZCLHNCQUFzQixDQUFDd0IsSUFBSSxDQUFFWixHQUFHLElBQUs7UUFDckUsT0FBT0EsR0FBRyxDQUFDQyxPQUFPLEtBQUtBLE9BQU87TUFDL0IsQ0FBQyxDQUFDO01BQ0YsSUFBSSxDQUFDVSxtQkFBbUIsRUFBRTtRQUN6QkUsR0FBRyxDQUFDQyxLQUFLLENBQUMsc0RBQXNELENBQUM7UUFDakU7TUFDRDtNQUNBLFFBQVNiLE9BQU8sQ0FBU2MsVUFBVSxFQUFFO1FBQ3BDLEtBQUssZUFBZTtVQUNuQixJQUFJLENBQUM3QixlQUFlLENBQUM4QixTQUFTLENBQUMsc0JBQXNCLENBQUM7VUFDdEQ7UUFDRCxLQUFLLGNBQWM7VUFDbEIsSUFBSSxDQUFDOUIsZUFBZSxDQUFDOEIsU0FBUyxDQUFDLHFCQUFxQixDQUFDO1VBQ3JEO1FBQ0Q7TUFBUTtNQUVUTCxtQkFBbUIsQ0FBQ00sYUFBYSxFQUFFO01BQ25DLElBQUlOLG1CQUFtQixDQUFDTSxhQUFhLEdBQUdOLG1CQUFtQixDQUFDTyxjQUFjLEVBQUU7UUFDM0U7UUFDQWpCLE9BQU8sQ0FBQ2tCLGVBQWUsQ0FBQyxjQUFjLEVBQUU7VUFBRUMsaUJBQWlCLEVBQUVYLE1BQU0sQ0FBQ1c7UUFBa0IsQ0FBQyxFQUFFLElBQUksQ0FBQ2hCLGNBQWMsRUFBRSxJQUFJLENBQUM7UUFDbkg7TUFDRDtNQUNBO01BQ0EsTUFBTWlCLFFBQVEsR0FDYixJQUFJLENBQUNqQyxzQkFBc0IsQ0FBQ2tDLElBQUksQ0FBRXRCLEdBQUcsSUFBSztRQUN6QyxPQUFPQSxHQUFHLENBQUNrQixjQUFjLEtBQUssQ0FBQztNQUNoQyxDQUFDLENBQUMsSUFDRixJQUFJLENBQUM5QixzQkFBc0IsQ0FBQ21DLEtBQUssQ0FBRXZCLEdBQUcsSUFBSztRQUMxQyxPQUFPQSxHQUFHLENBQUNrQixjQUFjLEtBQUssQ0FBQyxJQUFJbEIsR0FBRyxDQUFDaUIsYUFBYSxJQUFJakIsR0FBRyxDQUFDa0IsY0FBYztNQUMzRSxDQUFDLENBQUM7TUFDSCxJQUFJVCxNQUFNLENBQUNXLGlCQUFpQixJQUFJVCxtQkFBbUIsQ0FBQ00sYUFBYSxJQUFJTixtQkFBbUIsQ0FBQ08sY0FBYyxFQUFFO1FBQ3hHLElBQUksQ0FBQzVCLGdCQUFnQixHQUFHLEtBQUs7TUFDOUI7TUFDQSxJQUFJK0IsUUFBUSxFQUFFO1FBQ2IsSUFBSSxDQUFDMUIsZUFBZSxHQUFHLElBQUk7UUFDM0IsSUFBSSxDQUFDUixhQUFhLEVBQUU7TUFDckI7SUFDRDtJQUNBO0lBQ0E7SUFBQTtJQUFBLE9BQ1VnQixlQUFlLEdBQXpCLHlCQUEwQkssTUFBYSxFQUFFQyxNQUFzQyxFQUFRO01BQ3RGO01BQ0EsTUFBTVIsT0FBTyxHQUFHTyxNQUFNLENBQUNFLFNBQVMsRUFBYTtNQUM3QyxNQUFNQyxtQkFBbUIsR0FBRyxJQUFJLENBQUN2QixzQkFBc0IsQ0FBQ3dCLElBQUksQ0FBRVosR0FBRyxJQUFLO1FBQ3JFLE9BQU9BLEdBQUcsQ0FBQ0MsT0FBTyxLQUFLQSxPQUFPO01BQy9CLENBQUMsQ0FBQztNQUNGLElBQUksQ0FBQ1UsbUJBQW1CLEVBQUU7UUFDekJFLEdBQUcsQ0FBQ0MsS0FBSyxDQUFDLHVEQUF1RCxDQUFDO1FBQ2xFO01BQ0Q7TUFDQUgsbUJBQW1CLENBQUNPLGNBQWMsRUFBRTtNQUNwQyxJQUFJLENBQUN2QixlQUFlLEdBQUcsS0FBSztNQUM1QixJQUFJZ0IsbUJBQW1CLENBQUNPLGNBQWMsR0FBR1AsbUJBQW1CLENBQUNNLGFBQWEsS0FBSyxDQUFDLEVBQUU7UUFDakY7UUFDQTtRQUNBO1FBQ0E7UUFDQWhCLE9BQU8sQ0FBQ2tCLGVBQWUsQ0FBQyxjQUFjLEVBQUU7VUFBRUMsaUJBQWlCLEVBQUVYLE1BQU0sQ0FBQ1c7UUFBa0IsQ0FBQyxFQUFFLElBQUksQ0FBQ2hCLGNBQWMsRUFBRSxJQUFJLENBQUM7TUFDcEg7SUFDRDtJQUNBO0lBQ0E7SUFBQTtJQUFBLE9BQ1VFLFFBQVEsR0FBbEIsa0JBQW1CRSxNQUFhLEVBQVE7TUFDdkMsTUFBTWdCLDBCQUEwQixHQUFHLElBQUksQ0FBQ2pDLFdBQVcsQ0FBQ2tDLE1BQU0sQ0FBRUMsTUFBTSxJQUFLO1FBQUE7UUFDdEUsT0FDRWxCLE1BQU0sQ0FBQ0UsU0FBUyxFQUFFLENBQVNpQixHQUFHLEtBQUtELE1BQU0sQ0FBQ0UsU0FBUyxFQUFFLElBQ3RERixNQUFNLENBQUNHLFVBQVUsRUFBRSxJQUNuQix1QkFBQ0gsTUFBTSxDQUFDSSxTQUFTLEVBQUUsOENBQWxCLGtCQUFvQkMsV0FBVyxDQUFDLGtCQUFrQixDQUFDO01BRXRELENBQUMsQ0FBQztNQUNGLE1BQU1DLDJCQUEyQixHQUFHLElBQUksQ0FBQ3hDLFdBQVcsQ0FBQ2lDLE1BQU0sQ0FBRVEsTUFBTSxJQUFLO1FBQ3ZFLE9BQVF6QixNQUFNLENBQUNFLFNBQVMsRUFBRSxDQUFTaUIsR0FBRyxLQUFLTSxNQUFNLENBQUNMLFNBQVMsRUFBRSxJQUFJSyxNQUFNLENBQUNKLFVBQVUsRUFBRTtNQUNyRixDQUFDLENBQUM7TUFDRixJQUFJTCwwQkFBMEIsQ0FBQ1UsTUFBTSxHQUFHLENBQUMsSUFBSUYsMkJBQTJCLENBQUNFLE1BQU0sR0FBRyxDQUFDLEVBQUU7UUFDcEYsSUFBSSxDQUFDNUMsZ0JBQWdCLEdBQUcsSUFBSTtNQUM3QjtNQUNBa0MsMEJBQTBCLENBQUN6QixPQUFPLENBQUUyQixNQUFNLElBQUs7UUFDOUMsSUFBSSxDQUFDUyxhQUFhLENBQUNULE1BQU0sRUFBRSxJQUFJLENBQUM7TUFDakMsQ0FBQyxDQUFDO01BQ0ZNLDJCQUEyQixDQUFDakMsT0FBTyxDQUFDLE1BQU9rQyxNQUFXLElBQUs7UUFDMUQsSUFBSTtVQUNILElBQUlBLE1BQU0sQ0FBQ0csc0JBQXNCLEVBQUU7WUFDbEMsTUFBTUgsTUFBTSxDQUFDRyxzQkFBc0I7VUFDcEM7VUFDQSxJQUFJLENBQUNDLGFBQWEsQ0FBQ0osTUFBTSxFQUFFLElBQUksQ0FBQztRQUNqQyxDQUFDLENBQUMsT0FBT0ssTUFBVyxFQUFFO1VBQ3JCekIsR0FBRyxDQUFDQyxLQUFLLENBQUMsaUNBQWlDLEVBQUV3QixNQUFNLENBQUM7UUFDckQ7TUFDRCxDQUFDLENBQUM7SUFDSDtJQUNBO0lBQ0E7SUFDQTtJQUFBO0lBQUEsT0FDTy9CLFFBQVEsR0FBZixrQkFBZ0JnQyxNQUFvQixFQUFFQyxJQUFxRixFQUFRO01BQUE7TUFDbEksTUFBTXZDLE9BQTRCLEdBQ2pDdUMsSUFBSSxDQUFDdkMsT0FBTyxvQkFDWnVDLElBQUksQ0FBQ0MsS0FBSyxnREFBVixZQUFZQyxhQUFhLEVBQUUscUJBQzFCRixJQUFJLENBQUNHLEtBQUssZ0RBQVgsWUFBcUJDLGtCQUFrQixFQUFFLENBQUNDLGFBQWEsQ0FBQ0wsSUFBSSxDQUFDRyxLQUFLLENBQUMsQ0FBQ0csVUFBVSxDQUFDLE1BQU0sQ0FBQztNQUN2RixNQUFNQyxZQUFZLEdBQUlQLElBQUksQ0FBQ0MsS0FBSyxJQUFJRCxJQUFJLENBQUNHLEtBQTZCO01BQ3RFLElBQUksQ0FBQzFDLE9BQU8sRUFBRTtRQUNiO01BQ0Q7TUFDQTtNQUNBLElBQUlVLG1CQUFtQixHQUFHLElBQUksQ0FBQ3ZCLHNCQUFzQixDQUFDd0IsSUFBSSxDQUFFWixHQUFHLElBQUs7UUFDbkUsT0FBT0EsR0FBRyxDQUFDQyxPQUFPLEtBQUtBLE9BQU87TUFDL0IsQ0FBQyxDQUFDO01BQ0YsSUFBSVUsbUJBQW1CLEVBQUU7UUFDeEIsSUFBSW9DLFlBQVksRUFBRTtVQUNqQjtVQUNBcEMsbUJBQW1CLENBQUNvQyxZQUFZLEdBQUdBLFlBQVk7UUFDaEQ7UUFDQTtRQUNBLElBQUlwQyxtQkFBbUIsQ0FBQ08sY0FBYyxHQUFHLENBQUMsRUFBRTtVQUMzQ2pCLE9BQU8sQ0FBQ0MsV0FBVyxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUNDLGVBQWUsRUFBRSxJQUFJLENBQUM7VUFDaEVGLE9BQU8sQ0FBQ2tCLGVBQWUsQ0FBQyxlQUFlLEVBQUU7WUFBRUMsaUJBQWlCLEVBQUVvQixJQUFJLENBQUNwQjtVQUFrQixDQUFDLEVBQUUsSUFBSSxDQUFDakIsZUFBZSxFQUFFLElBQUksQ0FBQztRQUNwSDtRQUNBO01BQ0Q7TUFDQSxJQUFJNEMsWUFBWSxFQUFFO1FBQ2pCO1FBQ0FwQyxtQkFBbUIsR0FBRyxJQUFJLENBQUN2QixzQkFBc0IsQ0FBQ3dCLElBQUksQ0FBRVosR0FBRyxJQUFLO1VBQy9ELE9BQU9BLEdBQUcsQ0FBQytDLFlBQVksS0FBS0EsWUFBWTtRQUN6QyxDQUFDLENBQUM7UUFDRixJQUFJcEMsbUJBQW1CLElBQUlBLG1CQUFtQixDQUFDVixPQUFPLEtBQUtBLE9BQU8sRUFBRTtVQUNuRTtVQUNBO1VBQ0FVLG1CQUFtQixDQUFDVixPQUFPLEdBQUdBLE9BQU87VUFDckNVLG1CQUFtQixDQUFDTyxjQUFjLEdBQUcsQ0FBQztVQUN0Q1AsbUJBQW1CLENBQUNNLGFBQWEsR0FBRyxDQUFDO1FBQ3RDO01BQ0Q7TUFDQSxJQUFJLENBQUNOLG1CQUFtQixFQUFFO1FBQ3pCQSxtQkFBbUIsR0FBRztVQUNyQlYsT0FBTyxFQUFFQSxPQUFPO1VBQ2hCOEMsWUFBWSxFQUFFQSxZQUFZO1VBQzFCN0IsY0FBYyxFQUFFLENBQUM7VUFDakJELGFBQWEsRUFBRTtRQUNoQixDQUFDO1FBQ0QsSUFBSSxDQUFDN0Isc0JBQXNCLENBQUM0RCxJQUFJLENBQUNyQyxtQkFBbUIsQ0FBQztNQUN0RDtNQUNBVixPQUFPLENBQUNDLFdBQVcsQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDQyxlQUFlLEVBQUUsSUFBSSxDQUFDO01BQ2hFRixPQUFPLENBQUNrQixlQUFlLENBQUMsZUFBZSxFQUFFO1FBQUVDLGlCQUFpQixFQUFFb0IsSUFBSSxDQUFDcEI7TUFBa0IsQ0FBQyxFQUFFLElBQUksQ0FBQ2pCLGVBQWUsRUFBRSxJQUFJLENBQUM7SUFDcEg7SUFDQTtBQUNEO0FBQ0E7QUFDQTtBQUNBLE9BSkM7SUFBQSxPQUtPOEMsZUFBZSxHQUF0Qix5QkFBdUJoRCxPQUFnQixFQUFFO01BQ3hDLElBQUksQ0FBQ00sUUFBUSxDQUFDLElBQUksRUFBRTtRQUFFTixPQUFPO1FBQUVtQixpQkFBaUIsRUFBRTtNQUFNLENBQUMsQ0FBQztJQUMzRDtJQUNBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUxDO0lBQUEsT0FNVWUsYUFBYSxHQUF2Qix1QkFBd0JNLEtBQVksRUFBNkI7TUFBQSxJQUEzQnJCLGlCQUFpQix1RUFBRyxLQUFLO01BQzlELElBQUksSUFBSSxDQUFDN0IsV0FBVyxDQUFDMkQsT0FBTyxDQUFDVCxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUU7UUFDeEMsSUFBSSxDQUFDbEQsV0FBVyxDQUFDeUQsSUFBSSxDQUFDUCxLQUFLLENBQUM7TUFDN0I7TUFDQSxNQUFNVSxXQUFXLEdBQUdWLEtBQUssQ0FBQ0MsYUFBYSxFQUFFO01BQ3pDLElBQUlTLFdBQVcsRUFBRTtRQUNoQixJQUFJLENBQUM1QyxRQUFRLENBQUMsSUFBSSxFQUFFO1VBQUVrQyxLQUFLO1VBQUVyQjtRQUFrQixDQUFDLENBQUM7TUFDbEQ7TUFDQSxJQUFJLElBQUksQ0FBQy9CLG1CQUFtQixDQUFDNkQsT0FBTyxDQUFDVCxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtRQUNuREEsS0FBSyxDQUFDVyxXQUFXLENBQUMsZ0JBQWdCLEVBQUU7VUFBRVgsS0FBSztVQUFFckI7UUFBa0IsQ0FBQyxFQUFFLElBQUksQ0FBQ2IsUUFBUSxFQUFFLElBQUksQ0FBQztRQUN0RixJQUFJLENBQUNsQixtQkFBbUIsQ0FBQzJELElBQUksQ0FBQ1AsS0FBSyxDQUFDO01BQ3JDO0lBQ0Q7SUFDQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FMQztJQUFBLE9BTVVKLGFBQWEsR0FBdkIsdUJBQXdCTSxLQUFZLEVBQTZCO01BQUEsSUFBM0J2QixpQkFBaUIsdUVBQUcsS0FBSztNQUM5RCxJQUFJLElBQUksQ0FBQzVCLFdBQVcsQ0FBQzBELE9BQU8sQ0FBQ1AsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1FBQ3hDLElBQUksQ0FBQ25ELFdBQVcsQ0FBQ3dELElBQUksQ0FBQ0wsS0FBSyxDQUFDO01BQzdCO01BQ0EsTUFBTVUsV0FBVyxHQUFJVixLQUFLLENBQVNDLGtCQUFrQixFQUFFLENBQUNDLGFBQWEsQ0FBQ0YsS0FBSyxDQUFDO01BQzVFLE1BQU0xQyxPQUFPLEdBQUdvRCxXQUFXLGFBQVhBLFdBQVcsdUJBQVhBLFdBQVcsQ0FBRVAsVUFBVSxDQUFDLE1BQU0sQ0FBQztNQUMvQyxJQUFJN0MsT0FBTyxFQUFFO1FBQ1osSUFBSSxDQUFDTSxRQUFRLENBQUMsSUFBSSxFQUFFO1VBQUVvQyxLQUFLO1VBQUV2QjtRQUFrQixDQUFDLENBQUM7TUFDbEQ7TUFDQSxJQUFJLElBQUksQ0FBQy9CLG1CQUFtQixDQUFDNkQsT0FBTyxDQUFDUCxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtRQUNuREEsS0FBSyxDQUFDUyxXQUFXLENBQUMsZ0JBQWdCLEVBQUU7VUFBRVQsS0FBSztVQUFFdkI7UUFBa0IsQ0FBQyxFQUFFLElBQUksQ0FBQ2IsUUFBUSxFQUFFLElBQUksQ0FBQztRQUN0RixJQUFJLENBQUNsQixtQkFBbUIsQ0FBQzJELElBQUksQ0FBQ0wsS0FBSyxDQUFDO01BQ3JDO0lBQ0Q7SUFDQTtBQUNEO0FBQ0E7QUFDQTtBQUNBLE9BSkM7SUFBQSxPQUthVyxvQkFBb0IsR0FBakMsb0NBQWtDQyxPQUFzQixFQUFpQjtNQUN4RSxJQUFJLENBQUNBLE9BQU8sQ0FBQ0MsR0FBRyxDQUFRLGtCQUFrQixDQUFDLElBQUksQ0FBQ0QsT0FBTyxDQUFDQyxHQUFHLENBQVEsa0JBQWtCLENBQUMsRUFBRTtRQUN2RjtNQUNEO01BQ0EsSUFBSTtRQUNILE1BQU1ELE9BQU8sQ0FBQ0UsV0FBVyxFQUFFLENBQUMsQ0FBQztRQUM3QixJQUFJRixPQUFPLENBQUNDLEdBQUcsQ0FBUSxrQkFBa0IsQ0FBQyxFQUFFO1VBQzNDLElBQUksQ0FBQ3JCLGFBQWEsQ0FBQ29CLE9BQU8sQ0FBQztVQUMzQjtVQUNBO1VBQ0EsSUFBSUEsT0FBTyxDQUFDRyxpQkFBaUIsRUFBRSxJQUFJSCxPQUFPLENBQUNJLFNBQVMsRUFBRSxFQUFFO1lBQ3ZELE1BQU1DLEtBQUssQ0FBQ0MsU0FBUyxDQUFDTixPQUFPLENBQUM7VUFDL0I7UUFDRCxDQUFDLE1BQU07VUFDTixJQUFJLENBQUNsQixhQUFhLENBQUNrQixPQUFPLENBQUM7UUFDNUI7TUFDRCxDQUFDLENBQUMsT0FBT2pCLE1BQVcsRUFBRTtRQUNyQnpCLEdBQUcsQ0FBQ0MsS0FBSyxDQUFDLGdEQUFnRCxFQUFFd0IsTUFBTSxDQUFDO01BQ3BFO0lBQ0Q7SUFDQTtBQUNEO0FBQ0E7QUFDQTtBQUNBLE9BSkM7SUFBQSxPQUtPd0IsaUJBQWlCLEdBQXhCLDJCQUF5QkMsU0FBb0IsRUFBRTtNQUM5Q0EsU0FBUyxDQUFDWCxXQUFXLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQzlDLFFBQVEsRUFBRSxJQUFJLENBQUM7TUFDcEQsSUFBSSxDQUFDakIsbUJBQW1CLENBQUMyRCxJQUFJLENBQUNlLFNBQVMsQ0FBQztJQUN6QyxDQUFDO0lBQUE7RUFBQTtFQUFBLE9BRWE5RSxnQkFBZ0I7QUFBQSJ9