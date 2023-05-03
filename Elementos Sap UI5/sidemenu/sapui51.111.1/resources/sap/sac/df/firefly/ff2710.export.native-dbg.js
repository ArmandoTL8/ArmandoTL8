/*
* SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
*/

/*global sap*/
sap.ui.define(["sap/sac/df/thirdparty/DataExport", "sap/sac/df/firefly/ff2700.export"], function (DataExport, oFF) {
  "use strict";

  oFF.NativeExportHandler = {
    exportLib: undefined,
    exportCsv: function exportCsv(model) {
      this.exportLib.exportCsv(model.asStructure().convertToNative());
    },
    exportXlsx: function exportXlsx(model) {
      this.exportLib.exportXlsx(model.asStructure().convertToNative());
    },
    exportPdf: function exportPdf(model) {
      this.exportLib.exportPdf(model.asStructure().convertToNative());
    }
  };

  oFF.NativeExportHandlerFactory = function () {
    oFF.ExportHandlerFactory.call(this);
    this._ff_c = "NativeExportHandlerFactory";
  };

  oFF.NativeExportHandlerFactory.prototype = new oFF.ExportHandlerFactory();

  oFF.NativeExportHandlerFactory.staticSetup = function () {
    var factory = new oFF.NativeExportHandlerFactory();
    oFF.ExportHandlerFactory.registerFactory(factory);
  };

  oFF.NativeExportHandlerFactory.prototype.newExportHandler = function () {
    if (!oFF.NativeExportHandler.exportLib) {
      try {
        oFF.NativeExportHandler.exportLib = new DataExport.DataExport();
      } catch (e) {
        console.log("Could not find native export library: ".concat(e));
      }
    }

    return oFF.NativeExportHandler;
  };

  oFF.ExportNativeModule = function () {
    oFF.DfModule.call(this);
    this._ff_c = "ExportNativeModule";
  };

  oFF.ExportNativeModule.prototype = new oFF.DfModule();
  oFF.ExportNativeModule.s_module = null;

  oFF.ExportNativeModule.getInstance = function () {
    if (oFF.ExportNativeModule.s_module === null) {
      if (oFF.ExportModule.getInstance() === null) {
        throw new Error("Initialization Exception");
      }

      oFF.ExportNativeModule.s_module = oFF.DfModule.startExt(new oFF.ExportNativeModule());
      oFF.NativeExportHandlerFactory.staticSetup();
      oFF.DfModule.stopExt(oFF.ExportNativeModule.s_module);
    }

    return oFF.ExportNativeModule.s_module;
  };

  oFF.ExportNativeModule.prototype.getName = function () {
    return "ff2710.export.native";
  };

  oFF.ExportNativeModule.getInstance();
  return sap.firefly;
});