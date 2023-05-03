/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap */
sap.ui.define(
  "sap/sac/df/olap/OlapListBinding",
  [
    "sap/base/Log",
    "jquery.sap.global",
    "sap/ui/model/ChangeReason",
    "sap/ui/model/ListBinding",
    "sap/sac/df/olap/calculateId",
    "sap/sac/df/thirdparty/lodash"
  ],
  function (Log, jQuery, ChangeReason, ListBinding, calculateId, _) {
    "use strict";
    /**
     * Creates a new OlapListBinding.
     *
     * This constructor should only be called by subclasses or model implementations, not by application or control code.
     * Such code should use {@link sap.sac.df.olap.OlapModel#bindList OlapModel#bindList} on the corresponding model instance instead.
     *
     * @throws {Error} When one of the features is not (yet) supported by the OlapModel implementation
     *
     * @class
     * List binding implementation for <code>OlapModel</code>.
     * @version 1.111.0
     * @alias sap.sac.df.olap.OlapListBinding
     * @extends sap.ui.model.ListBinding
     * @protected
     */
    var OlapListBinding = ListBinding.extend(
      "sap.sac.df.olap.OlapListBinding", {
        constructor: function (oModel, sPath, oContextGiven, aSorters, aFilters, mParameters) {
          var that = this;
          var nLength = null;
          var aIndices = [];
          var oList = null;
          that.oContext = oContextGiven;
          var iLastStartIndex = null;
          var iLastEndIndex = null;
          var iLastLength = null;
          var aLastContextData = null;
          var aLastContexts = null;
          ListBinding.apply(
            that, [oModel, sPath, that.oContext, aSorters, aFilters, mParameters]
          );

          function _getContexts(iSI, iL) {
            var iStartIndex = iSI;
            var iLength = iL;
            if (!iStartIndex) {
              iStartIndex = 0;
            }
            if (!iLength) {
              iLength = nLength;
            }
            var iEndIndex = Math.min(iStartIndex + iLength, aIndices.length);
            var sPrefix = oModel.resolve(sPath, that.oContext);
            if (sPrefix && !sPrefix.endsWith( "/")) {
              sPrefix += "/";
            }
            return _.map(
              _.range(iStartIndex, iEndIndex),
              function (nIndex) {
                try{
                  return oModel.getContext(sPrefix + aIndices[nIndex]);
                }catch(oError){
                  Log.error(oError);
                }
              }
            );
          }
          that.setContext = function (oCtx) {
            if (that.oContext !== oCtx) {
              that.oContext = oCtx;
              if (that.isRelative()) {
                that.update();
                that._fireChange({
                  reason: ChangeReason.Context
                });
              }
            }
          };
          that.getLength = function () {
            return nLength;
          };
          function _getLength() {
            return aIndices.length;
          }
          that.updateIndices = function () {
            aIndices = _.map(
              oList,
              function (o, n) {
                return n;
              }
            );
          };
          that.sort = function () {
            throw new Error(
              "OlapListBinding does not support client side sort"
            );
          };
          that.applySort = function () {
            throw new Error(
              "OlapListBinding does not support client side sort"
            );
          };
          that.filter = function () {
            throw new Error(
              "OlapListBinding does not support client side filter"
            );
          };
          that.applyFilter = function () {
            throw new Error("OlapListBinding does not support client side filter");
          };
          that.getDistinctValues = function (sPath1) {
            var oMap = {};
            return _.reduce(
              oList,
              function (aResult, oContext1) {
                var sValue = oModel.getProperty(sPath1, oContext1);
                if (!oMap[sValue]) {
                  oMap[sValue] = true;
                  aResult.push(sValue);
                }
                return aResult;
              },
              []
            );
          };
          that.getId = _.constant(calculateId());
          that.getContexts = function (iSI, iL) {
            var iLength = iL;
            var iStartIndex = iSI;
            iLastStartIndex = iStartIndex;
            iLastLength = iLength;
            if (!iStartIndex) {
              iStartIndex = 0;
            }
            if (!iLength) {
              iLength = nLength;
            }
            var aContexts = _getContexts(iStartIndex, iLength);
            var aContextData = null;
            try {
              aContextData = _.map(
                aContexts,
                function (oContext1) {
                  try{
                    return that.getContextData(oContext1);
                  }catch(oError){
                    Log.error(oError);
                  }
                }
              );
              //Check diff
              if (aLastContextData && iStartIndex < iLastEndIndex) {
                delete aContexts.diff;
              }
              iLastEndIndex = iStartIndex + iLength;
              aLastContexts = aContexts.slice(0);
              aLastContextData = aContextData.slice(0);
            } catch (oError) {
              Log.warning(
                "OlapListBinding: Cyclic dependency"
              );
              Log.error(oError);
              throw new Error("Cyclic dependeny");
            }
            return aContexts;
          };
          that.getCurrentContexts = function () {
            return aLastContexts || [];
          };
          that.updateIndices = function () {
            aIndices = _.map(
              oList,
              function (o, nIndex) {
                return nIndex;
              }
            );
          };
          that.update = function () {
            var oL = oModel.getProperty(sPath, that.oContext);
            if (oL) {
              oList = jQuery.extend(true, (Array.isArray(oL) ? [] : {}), oL);
              that.updateIndices();
              nLength = _getLength();
            } else {
              oList = [];
              aIndices = [];
              nLength = 0;
            }
          };
          that.checkUpdate = function (bForceupdate) {
            var oL = null;
            if (that.bSuspended && !that.bIgnoreSuspend && !bForceupdate) {
              return;
            }
            var bChangeDetected = false;
            oL = oModel.getProperty(that.sPath, that.oContext);
            if( !(oL && oL.length === 0 && !oList)&& (
              oL &&( (!oList || oList.length !== oL.length))
            )){
              bChangeDetected = true;
            }
            if (!jQuery.sap.equal(oList, oL)) {
              that.update();
            }
            var aContexts = _getContexts(iLastStartIndex, iLastLength);
            if (aLastContexts) {
              bChangeDetected = ( aLastContexts.length !== aContexts.length) ? true : _.some(
                aLastContextData,
                function (oLastData, nIndex) {
                  return that.getContextData(aContexts[nIndex]) !== oLastData;
                }
              );
            } else {
              bChangeDetected = aContexts && aContexts.length;
            }
            if (bChangeDetected || bForceupdate) {
              that._fireChange({
                reason: ChangeReason.Change
              });
            }
          };
          ListBinding.apply(that, arguments);
        }
      }
    );
    return OlapListBinding;
  }
);
