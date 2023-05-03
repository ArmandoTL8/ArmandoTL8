/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */

/*global sap*/
sap.ui.define(["sap/sac/df/firefly/ff1030.kernel.impl"], function (oFF) {
  "use strict";
  /**RPC function Ina DB*/

  oFF.RpcFunctionInaDB = function () {
    oFF.DfRpcFunction.call(this);
    this.m_name = null;
    this._ff_c = "RpcFunctionInaDB";
  };

  oFF.RpcFunctionInaDB.prototype = new oFF.DfRpcFunction();

  oFF.RpcFunctionInaDB.prototype.setupRpcFunction = function (connection, name) {
    this.m_name = name;
    this.setupFunction(connection, null);
  };

  oFF.RpcFunctionInaDB.prototype.releaseObject = function () {
    this.m_name = null;
    oFF.DfRpcFunction.prototype.releaseObject.call(this);
  };

  oFF.RpcFunctionInaDB.prototype.getName = function () {
    return this.m_name;
  };

  oFF.RpcFunctionInaDB.prototype.processSynchronization = function () {
    var path = this.getName();
    var request;
    var response;
    var requestStructure;
    var requestJsonString;
    var responseJsonString = null;
    var jsonParser;
    var jsonElement;
    var fnDebug = $.trace.debug;

    if (oFF.XStringUtils.isNullOrEmpty(path)) {
      this.addError(1001, " path null");
      return false;
    }

    request = this.getRequest();

    if (request === null) {
      this.addError(1002, "request null");
      return false;
    }

    response = this.getResponse();

    if (response === null) {
      this.addError(1003, "response null");
      return false;
    }

    requestStructure = request.getRequestStructure();

    if (requestStructure === null) {
      requestJsonString = "{}";
    } else {
      requestJsonString = oFF.PrUtils.serialize(requestStructure, false, false, 0);
    }

    if (path === "\/sap\/bc\/ina\/service\/v2\/GetServerInfo") {
      fnDebug("Ina-Request:");
      fnDebug(requestJsonString);
      responseJsonString = $.db.ina.getServiceInfo(requestJsonString);
      fnDebug("Ina-Response:");
      fnDebug(responseJsonString);
    } else {
      if (path === "\/sap\/bc\/ina\/service\/v2\/GetResponse") {
        fnDebug("Ina-Request:");
        fnDebug(requestJsonString);
        responseJsonString = $.db.ina.getResponse(requestJsonString);
        fnDebug("Ina-Response:");
        fnDebug(responseJsonString);
      } else {
        if (path !== "\/sap\/hana\/xs\/formLogin\/logout.xscfunc") {
          this.addError(1004, "illegal path");
          return false;
        }

        responseJsonString = null;
      }
    } // parse response JSON string


    if (oFF.XStringUtils.isNotNullAndNotEmpty(responseJsonString)) {
      jsonParser = oFF.JsonParserFactory.newInstance();
      jsonElement = jsonParser.parse(responseJsonString);

      if (jsonParser.hasErrors()) {
        this.addAllMessages(jsonParser);
        return false;
      } else if (jsonElement !== null) {
        if (jsonElement.getType() !== oFF.PrElementType.STRUCTURE) {
          this.addError(1005, "wrong json response type");
          return false;
        } else {
          response.setRootElement(jsonElement);
        }
      }
    }

    this.setData(response);
    return false;
  };
  /**RPC function Ina DB*/


  oFF.RpcFunctionInaSql = function () {
    oFF.DfRpcFunction.call(this);
    this.m_name = null;
    this._ff_c = "RpcFunctionInaSql";
  };

  oFF.RpcFunctionInaSql.prototype = new oFF.DfRpcFunction();

  oFF.RpcFunctionInaSql.prototype.setupRpcFunction = function (connection, name) {
    this.m_name = name;
    this.setupFunction(connection, null);
  };

  oFF.RpcFunctionInaSql.prototype.releaseObject = function () {
    this.m_name = null;
    oFF.DfRpcFunction.prototype.releaseObject.call(this);
  };

  oFF.RpcFunctionInaSql.prototype.getName = function () {
    return this.m_name;
  };

  oFF.RpcFunctionInaSql.prototype.processSynchronization = function () {
    var path = this.getName();
    var request;
    var response;
    var requestJsonString;
    var responseJsonString;
    var jsonParser;
    var jsonElement;
    var connection;
    var call;

    if (oFF.XStringUtils.isNullOrEmpty(path)) {
      this.addError(1001, " path null");
      return false;
    }

    request = this.getRequest();

    if (request === null) {
      this.addError(1002, "request null");
      return false;
    }

    response = this.getResponse();

    if (response === null) {
      this.addError(1003, "response null");
      return false;
    }

    connection = request.getConnectionInfo().getNativeConnection(); // duck type check for $.db connection; $.hdb does not have a prepareCall function and is not supported

    if (typeof connection.prepareCall !== "function") {
      this.addError(1004, "Native connection has to be a $.db connection");
      return false;
    }

    if (path === "\/sap\/bc\/ina\/service\/v2\/GetServerInfo") {
      call = connection.prepareCall("CALL SYS.EXECUTE_MDS('GetServerInfo', '', '', '', '', '', ?)");
      call.execute();
      responseJsonString = call.getNClob(1);
    } else if (path === "\/sap\/bc\/ina\/service\/v2\/GetResponse") {
      /*
          EXECUTE_MDS (
              IN method VARCHAR(32)
              IN schema_name NVARCHAR(256)
              IN package_name NVARCHAR(256)
              IN object_name NVARCHAR(256)
              IN datasource_type VARCHAR(32)
              IN request NCLOB
              OUT response NCLOB
          )
      */
      var requestType = request.getRequestType();

      if (requestType === oFF.HttpSemanticRequestType.NONE) {
        this.addError(1005, "No request structure was set");
        return false;
      } else if (requestType === oFF.HttpSemanticRequestType.UNKNOWN) {
        this.addError(1006, "Unknown request type: " + requestJsonString);
        return false;
      } else if (requestType === oFF.HttpSemanticRequestType.BATCH) {
        // edge case: for batch requests, we still use the analytics type.
        requestType = oFF.HttpSemanticRequestType.ANALYTICS;
      }

      requestJsonString = oFF.PrUtils.serialize(request.getRequestStructure(), false, false, 0);
      call = connection.prepareCall("CALL EXECUTE_MDS('" + requestType.getName() + "', '', '', '', '', ?, ?)");
      call.setNClob(1, requestJsonString);
      call.execute();
      responseJsonString = call.getNClob(2);
    } else if (path === "\/sap\/hana\/xs\/formLogin\/logout.xscfunc") {
      responseJsonString = null;
    } else {
      this.addError(1007, "illegal path");
      return false;
    } // parse response JSON string


    if (oFF.XStringUtils.isNotNullAndNotEmpty(responseJsonString)) {
      jsonParser = oFF.JsonParserFactory.newInstance();
      jsonElement = jsonParser.parse(responseJsonString);

      if (jsonParser.hasErrors()) {
        this.addAllMessages(jsonParser);
        return false;
      } else if (jsonElement !== null) {
        if (jsonElement.getType() !== oFF.PrElementType.STRUCTURE) {
          this.addError(1008, "wrong json response type");
          return false;
        } else {
          response.setRootElement(jsonElement);
        }
      }
    }

    this.setData(response);
    return false;
  };
  /** RPC function in XS */


  oFF.RpcFunctionInaServerFactory = function () {
    oFF.RpcFunctionFactory.call(this);
    this._ff_c = "RpcFunctionInaServerFactory";
  };

  oFF.RpcFunctionInaServerFactory.prototype = new oFF.RpcFunctionFactory();

  oFF.RpcFunctionInaServerFactory.staticSetup = function () {
    // do static setup if INA_DB context is available
    if (typeof $ !== "undefined" && $.db !== undefined && $.db.ina !== undefined) {
      var newFactory = new oFF.RpcFunctionInaServerFactory();
      oFF.RpcFunctionFactory.registerFactory(oFF.ProtocolType.INA_DB, null, newFactory);
      oFF.RpcFunctionFactory.registerFactory(oFF.ProtocolType.INA_SQL, null, newFactory);
    }
  };

  oFF.RpcFunctionInaServerFactory.prototype.newRpcFunction = function (context, name, systemType, protocolType) {
    var rpcFunction = null;

    if (protocolType === oFF.ProtocolType.INA_DB) {
      rpcFunction = new oFF.RpcFunctionInaDB();
    } else if (protocolType === oFF.ProtocolType.INA_SQL) {
      rpcFunction = new oFF.RpcFunctionInaSql();
    }

    rpcFunction.setupRpcFunction(context, name);
    return rpcFunction;
  };
  /**RPC function Ina DB*/


  var prm = typeof window !== "undefined" && window.Promise ? window.Promise : null;

  oFF.RpcFunctionWasabi = function () {
    oFF.DfRpcFunction.call(this);
    this.m_name = null;
    this._ff_c = "RpcFunctionWasabi";
  };

  oFF.RpcFunctionWasabi.prototype = new oFF.DfRpcFunction();

  oFF.RpcFunctionWasabi.prototype.setupRpcFunction = function (connection, name) {
    this.m_name = name;
    this.setupFunction(connection, null);
  };

  oFF.RpcFunctionWasabi.prototype.releaseObject = function () {
    this.m_name = null;
    oFF.DfRpcFunction.prototype.releaseObject.call(this);
  };

  oFF.RpcFunctionWasabi.prototype.getName = function () {
    return this.m_name;
  };

  oFF.RpcFunctionWasabi.prototype.processSynchronization = function () {
    var path = this.getName();
    var request;
    var response;
    var requestStructure;
    var requestJsonString;
    var jsonParser;
    var jsonElement;
    var that = this;

    function setResp(responseJsonString) {
      if (oFF.XStringUtils.isNotNullAndNotEmpty(responseJsonString)) {
        jsonParser = oFF.JsonParserFactory.newInstance();
        jsonElement = jsonParser.parse(responseJsonString);

        if (jsonParser.hasErrors()) {
          that.addAllMessages(jsonParser);
          return false;
        } else if (jsonElement !== null) {
          if (jsonElement.getType() !== oFF.PrElementType.STRUCTURE) {
            that.addError(1005, "wrong json response type");
            return false;
          } else {
            response.setRootElement(jsonElement);
          }
        }
      }

      return null;
    }

    if (oFF.XStringUtils.isNullOrEmpty(path)) {
      that.addError(1001, " path null");
      return false;
    }

    request = that.getRequest();

    if (request === null) {
      that.addError(1002, "request null");
      return false;
    }

    response = that.getResponse();

    if (response === null) {
      that.addError(1003, "response null");
      return false;
    }

    requestStructure = request.getRequestStructure();

    if (requestStructure === null) {
      requestJsonString = "{}";
    } else {
      requestJsonString = oFF.PrUtils.serialize(requestStructure, false, false, 0);
    }

    if (path === "/gsaInfo") {
      //oFF.XLogger.println("Ina-Request:");
      //oFF.XLogger.println(requestJsonString);
      prm.resolve(null).then(function () {
        if (sap.zen && sap.zen.commons && sap.zen.commons.getServerInfo) {
          return sap.zen.commons.getServerInfo();
        }

        throw new Error("Wasabi is not available");
      }).then(function (s) {
        setResp(s);
        that.setData(response);
        that.endSync();
      })["catch"](function (e) {
        that.addError(1005, "exception: " + e.stack);
        that.endSync();
      });
      return true;
    } else if (path === "/gsaIna") {
      prm.resolve(null).then(function () {
        if (sap.zen && sap.zen.commons && sap.zen.commons.getResponse) {
          return sap.zen.commons.getResponse(requestJsonString);
        }

        throw new Error("Wasabi is not available");
      }).then(function (s) {
        setResp(s);
        that.setData(response);
        that.endSync();
      })["catch"](function (e) {
        oFF.XLogger.println(e.message);
        that.addError(1005, "exception: " + e.stack);
        that.endSync();
      });
    } else {
      if (sap.zen && sap.zen.commons && sap.zen.commons.logoff) {
        sap.zen.commons.logoff();
      }

      return false;
    }

    return true;
  };
  /** RPC function in XS */


  oFF.RpcFunctionWasabiFactory = function () {
    oFF.RpcFunctionFactory.call(this);
    this._ff_c = "RpcFunctionWasabiFactory";
  };

  oFF.RpcFunctionWasabiFactory.prototype = new oFF.RpcFunctionFactory();

  oFF.RpcFunctionWasabiFactory.staticSetup = function () {
    // do static setup if INA_DB context is available
    if (typeof window !== "undefined" && window && window.Promise) {
      var newFactory = new oFF.RpcFunctionWasabiFactory();
      oFF.RpcFunctionFactory.registerFactory(oFF.ProtocolType.WASABI, null, newFactory);
    }
  };

  oFF.RpcFunctionWasabiFactory.prototype.newRpcFunction = function (context, name, systemType, protocolType) {
    var rpcFunction = null;

    if (protocolType === oFF.ProtocolType.WASABI) {
      rpcFunction = new oFF.RpcFunctionWasabi();
    }

    rpcFunction.setupRpcFunction(context, name);
    return rpcFunction;
  };
  /**
  * Module loader.
   */


  oFF.NativeModuleLoader = function () {};

  oFF.NativeModuleLoader.prototype = new oFF.XObject();
  oFF.NativeModuleLoader.prototype._ff_c = "NativeModuleLoader";
  /**
  * Static setup.
   */

  oFF.NativeModuleLoader.staticSetup = function () {
    oFF.ModuleManager.registerModuleLoader(new oFF.NativeModuleLoader());
  };

  oFF.NativeModuleLoader.prototype.processModuleLoad = function (session, moduleDef, listener, cachebusterId) {
    var messages = oFF.MessageManagerSimple.createMessageManager();
    var win = typeof window !== "undefined" ? window : {};

    if (typeof win.document !== "undefined") {
      var doc = win.document;
      var script = doc.createElement("script");
      script.type = "text/javascript";
      script.async = true;

      script.onload = function () {
        // remote script has loaded
        listener.onModuleLoaded(messages, moduleDef.getName(), true);
      };

      var uri = moduleDef.getResolvedUri(session);
      var uriCopy = oFF.XUri.createFromOther(uri);

      if (cachebusterId !== null) {
        uriCopy.addQueryElement("v", cachebusterId);
      }

      var url = uriCopy.getUrl();
      script.src = url;
      doc.getElementsByTagName("head")[0].appendChild(script);
    } else if (!!self && self instanceof WorkerGlobalScope && !!self.importScripts) {
      var _uri = moduleDef.getResolvedUri(session);

      self.importScripts(_uri.getUrl());
      listener.onModuleLoaded(messages, moduleDef.getName(), true);
    }
  }; /// <summary>Initializer for static constants.</summary>


  oFF.KernelNativeModule = function () {
    oFF.DfModule.call(this);
    this._ff_c = "KernelNativeModule";
  };

  oFF.KernelNativeModule.prototype = new oFF.DfModule();
  oFF.KernelNativeModule.s_module = null;

  oFF.KernelNativeModule.getInstance = function () {
    var oNativeModule = oFF.KernelNativeModule;

    if (oNativeModule.s_module === null) {
      if (oFF.KernelImplModule.getInstance() === null) {
        throw new Error("Initialization Exception");
      }

      oNativeModule.s_module = oFF.DfModule.startExt(new oFF.KernelNativeModule());
      oFF.RpcFunctionInaServerFactory.staticSetup();

      if (!oFF.XSystemUtils.isXS()) {
        oFF.RpcFunctionWasabiFactory.staticSetup();
        oFF.NativeModuleLoader.staticSetup();
      }

      oFF.DfModule.stopExt(oNativeModule.s_module);
    }

    return oNativeModule.s_module;
  };

  oFF.KernelNativeModule.prototype.getName = function () {
    return "ff1040.kernel.native";
  };

  oFF.KernelNativeModule.getInstance();
  return sap.firefly;
});