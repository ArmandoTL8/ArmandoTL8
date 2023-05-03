/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap */
sap.ui.define(
  "sap/sac/df/olap/OlapPropertyBinding",
  [
    "sap/base/util/deepEqual",
    "sap/ui/model/ChangeReason",
    "sap/ui/model/PropertyBinding",
    "sap/sac/df/olap/calculateId",
    "sap/sac/df/thirdparty/lodash"
  ],
  function (deepEqual, ChangeReason, PropertyBinding, calculateId, _) {
    "use strict";
    /**
     * Creates a new OlapPropertyBinding.
     *
     * This constructor should only be called by subclasses or model implementations, not by application or control code.
     * Such code should use {@link sap.sac.df.olap.OlapModel#bindProperty OlapModel#bindProperty} on the corresponding model instance instead.
     *
     * @throws {Error} When one of the features is not (yet) supported by the OlapModel implementation
     *
     * @class
     * Property binding implementation for <code>OlapModel</code>.
     * @version 1.111.0
     * @alias sap.sac.df.olap.OlapPropertyBinding
     * @extends sap.ui.model.ListBinding
     * @protected
     */
    var OlapPropertyBinding = PropertyBinding.extend(
      "sap.sac.df.olap.OlapPropertyBinding", {
        constructor: function (oModel, sPath, oContextGiven, mParameters) {
          var that = this;
          var oContext = oContextGiven;
          var oValue = null;
          PropertyBinding.apply(that, [oModel, sPath, oContext, mParameters]);
          function _getValue() {
            var sRP = oModel.resolve(sPath, oContext);
            return sRP? oModel.getProperty(sRP) : null;
          }
          that.getValue = function () {
            return oValue;
          };
          that.setValue = function (o) {
            var sP = oModel.resolve(sPath, oContext);
            oModel.setProperty(sP, o);
          };
          that.setContext = function (oCtx) {
            if (oContext !== oCtx) {
              sap.ui.getCore().getMessageManager().removeMessages(
                that.getDataState().getControlMessages(), true
              );
              oContext = oCtx;
              that.checkUpdate();
            } else {
              that.checkUpdate();
            }
          };
          that.getId = _.constant(calculateId());
          that.checkUpdate = function (bForceupdate) {
            var oV = _getValue();
            if (bForceupdate || !deepEqual(oV, oValue)) {
              oValue = oV;
              that.getDataState().setValue(oValue);
              that.checkDataState();
              that._fireChange({
                reason: ChangeReason.Change
              });
            }
          };
        }
      }
    );
    return OlapPropertyBinding;
  }
);
