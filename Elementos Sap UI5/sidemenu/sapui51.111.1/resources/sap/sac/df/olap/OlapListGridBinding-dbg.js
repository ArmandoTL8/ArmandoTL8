/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap */
sap.ui.define(
  "sap/sac/df/olap/OlapListGridBinding",
  [
    "jquery.sap.global",
    "sap/ui/model/ChangeReason",
    "sap/ui/model/Context",
    "sap/ui/model/ListBinding",
    "sap/sac/df/olap/calculateId",
    "sap/sac/df/thirdparty/lodash"
  ],
  function (jQuery, ChangeReason, Context, ListBinding, calculateId, _) {
    "use strict";

    function checkIsContext(oContext) {
      return oContext instanceof Context || typeof oContext === "undefined";
    }
    /**
     * Creates a new OlapListGridBinding.
     *
     * This constructor should only be called by subclasses or model implementations, not by application or control code.
     * Such code should use {@link sap.sac.df.OlapModel#bindList OlapModel#bindList} on the corresponding model instance instead.
     *
     * @throws {Error} When one of the features is not (yet) supported by the OlapModel implementation
     *
     * @class
     * List binding implementation for <code>OlapModel</code>.
     * @alias sap.sac.df.olap.OlapListGridBinding
     * @extends sap.ui.model.ListBinding
     * @version 1.111.0
     * @protected
     */
    var OlapListGridBinding = ListBinding.extend(
      "sap.sac.df.olap.OlapListGridBinding", {
        constructor: function (oModel, sPath, oContextGiven, aSorters, aFilters, mParameters) {
          var that = this;
          var oContext = oContextGiven;
          var oList = [];
          var aLastContexts = [];
          ListBinding.apply(
            that, [oModel, sPath, oContext, aSorters, aFilters, mParameters]
          );

          function _getContexts() {
            var sPrefix = oModel.resolve(sPath, oContext);
            var a = oModel.getProperty(sPrefix) || [];
            if (sPrefix && !jQuery.sap.endsWith(sPrefix, "/")) {
              sPrefix += "/";
            }
            var oLimit = oModel.getLimit();
            return _.filter(
              _.range(a.length),
              function (nIndex) {
                return a[nIndex].x <= oLimit.ColLimit && a[nIndex].y <= oLimit.RowLimit;
              }
            ).map(
              function (nIndex) {
                return oModel.getContext(sPrefix + nIndex);
              }
            );
          }
          that.setContext = function (oCtx) {
            if (!checkIsContext(oCtx)) {
              throw new Error("Context expected ");
            }
            if (oContext !== oCtx) {
              oContext = oCtx;
              if (that.isRelative()) {
                that.update();
                that._fireChange({
                  reason: ChangeReason.Context
                });
              }
            }
          };
          that.getLength = function () {
            return _getContexts().length;
          };
          that.sort = function () {
            throw new Error("OlapListBinding does not support client side sort");
          };
          that.applySort = function () {
            throw new Error("OlapListBinding does not support client side sort");
          };
          that.filter = function () {
            throw new Error("OlapListBinding does not support client side filter");
          };
          that.applyFilter = function () {
            throw new Error("OlapListBinding does not support client side filter");

          };
          that.getDistinctValues = function () {
            throw new Error("Not supported");
          };
          that.getId = _.constant(calculateId());
          that.getContexts = function () {
            return _getContexts();
          };
          that.getCurrentContexts = function () {
            return aLastContexts || [];
          };
          that.update = function () {
            oList = oModel.getProperty(sPath, oContext);
            aLastContexts = _getContexts();
          };
          that.checkUpdate = function () {
            var aL = oModel.getProperty(that.sPath, that.oContext);
            var aC = _getContexts();
            var bChangeDetected = !(aL === oList && aLastContexts === aC);
            if (bChangeDetected) {
              _.forEach(
                aC,
                function (o) {
                  o.setUpdated(true);
                }
              );
              that.update();
            }
            if (bChangeDetected) {
              that._fireChange({
                reason: ChangeReason.Change
              });
            }
          };
          ListBinding.apply(that, arguments);
        }
      }
    );
    return OlapListGridBinding;
  }
);
