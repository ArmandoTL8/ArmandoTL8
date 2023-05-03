/*
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap, Promise*/
sap.ui.define(
  "sap/sac/df/utils/ErrorHandler",
  [
    "sap/base/Log",
    "sap/m/MessageBox"
  ],
  function (Log, MessageBox) {
    function ErrorHander() {
      var that = this;
      that.handleWithPopUp = function (e, bReject) {
        Log.error(e);
        Log.error(e.stack);
        var fResolve, fReject;
        function handleDialog(resolve, reject) {
          fResolve = resolve;
          fReject = reject;
        }
        MessageBox.error(
          e.message, {
            details: e.stack,
            actions: [MessageBox.Action.CLOSE],
            onClose: function () {
              if (bReject) {
                fReject(e);
              } else {
                fResolve(null);
              }
            }
          }
        );
        return new Promise(handleDialog);
      };
    }
    return new ErrorHander();
  }
);
