function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */

/*global sap*/
sap.ui.define(["sap/sac/df/firefly/ff0200.io"], function (oFF) {
  "use strict";
  /* global process, Buffer */

  if (typeof $ !== "undefined" && $.db && $.db.ina && $.trace) {
    // XSJS
    //Browser-API is not available -> we're most probably running within the XS-Engine.
    //-> provide the browser-API that firefly relies on
    var $Global = $Global || {}; // http://www.w3.org/TR/2006/WD-XMLHttpRequest-20060405/

    $Global.XMLHttpRequest = function () {
      this.headers = {};
    };

    $Global.XMLHttpRequest.clients = {
      "default": new $.net.http.Client()
    };

    $Global.XMLHttpRequest.prototype.open = function (method, url, async) {
      $.trace.debug("Creating request with method=" + method + ", url=" + url + ", async=" + async);
      this.url = url;

      if (method === "GET") {
        this.request = new $.net.http.Request($.net.http.GET, url);
      } else if (method === "POST") {
        this.request = new $.net.http.Request($.net.http.POST, url);
      } else if (method === "PUT") {
        this.request = new $.net.http.Request($.net.http.PUT, url);
      }

      if (this.request === undefined) {
        throw new Error("Illegal State: Couldn't create XS-request for method " + method);
      }
    };

    $Global.XMLHttpRequest.prototype.send = function (data) {
      var str = "";
      var aHeaders = this.request.headers;
      var fnDebug = $.trace.debug;
      var sClient = "default";

      for (var member in this.headers) {
        if (this.headers.hasOwnProperty(member)) {
          aHeaders.set(member, this.headers[member]);
          str += member + "=" + this.headers[member] + "\r\n";

          if (member === oFF.HttpConstants.HD_AUTHORIZATION) {
            sClient = this.headers[member]; // create a new client to ensure that we have a new set of cookies

            if (!$Global.XMLHttpRequest.clients.hasOwnProperty(sClient)) {
              $Global.XMLHttpRequest.clients[sClient] = new $.net.http.Client();
            }
          }
        }
      }

      fnDebug("Request to send, client key:\n" + sClient);
      var oClient = $Global.XMLHttpRequest.clients[sClient];
      fnDebug("Request to send, headers:\n" + str);
      fnDebug("Request to send, body:\n" + data);

      if (data !== null) {
        this.request.setBody(data);
      }

      var e = this.sendInternal(oClient, sClient);

      if (e) {
        // try again with a new Http Client
        delete $Global.XMLHttpRequest.clients[sClient]; //new client won't have any cookies but the old CSRF, therefore the request will be rejected with 403
        // Firefly has re-try logic in RCPHttpFunction to fetch a new X-CSRF-Token in such case

        oClient = new $.net.http.Client();
        $Global.XMLHttpRequest.clients[sClient] = oClient;
        e = this.sendInternal(oClient, sClient);

        if (e) {
          throw e;
        }
      }

      this.readyState = 4;

      if (!this.response.body) {
        this.responseText = "";
      } else {
        this.responseText = this.response.body.asString();
      } //clear the private variable for the request headers


      this.headers = {};
      fnDebug("Received response, header:\n" + this.getAllResponseHeaders());
      fnDebug("Received response, body:\n" + this.responseText);
    };

    $Global.XMLHttpRequest.prototype.setRequestHeader = function (header, value) {
      this.headers[header] = value;
      $.trace.debug("Added field to the header " + header + "=" + value + ", size=" + this.headers.length);
    };

    $Global.XMLHttpRequest.prototype.getAllResponseHeaders = function () {
      var str = "";
      var aHeaders = this.response.headers;
      var len = aHeaders.length;

      for (var i = 0; i < len; ++i) {
        var header = aHeaders[i];
        str += header.name + ": " + header.value + "\r\n";
      }

      return str;
    };

    $Global.XMLHttpRequest.prototype.sendInternal = function (oClient, sClient) {
      try {
        oClient.request(this.request, this.url);
        this.response = oClient.getResponse();
        this.status = this.response.status;
        this.statusText = "";
        return null;
      } catch (e) {
        $.trace.debug("Request failed. Remove client " + sClient + " Exception:" + e);
        return e;
      }
    };
  }
  /**
   * XMLHttpRequest for Node.js
   *
   * XMLHttpRequest:
   * https://xhr.spec.whatwg.org
   * https://dvcs.w3.org/hg/xhr/raw-file/tip/Overview.html
   */


  oFF.NodeJsXMLHttpRequest = function () {
    // Request Variables
    this.readyState = oFF.NodeJsXMLHttpRequest.UNSENT;
    this.m_headers = {};
    this.m_options = {};
    this.m_sendFlag = false;
    this.m_method = null;
    this.m_url = null;
    this.m_async = null; // Response Variables

    this.status = null;
    this.statusText = null;
    this.response = null;
    this.responseText = ""; // Event Handling

    /* https://xhr.spec.whatwg.org/#handler-xhr-onreadystatechange
       onreadystatechange property contains the event handler to be called when the readystatechange event is called.
     */

    this.onreadystatechange = null; // Cookies Management Variables

    this.m_cookies = null;
  };

  oFF.NodeJsXMLHttpRequest.prototype = new oFF.XObject(); // States Variables

  oFF.NodeJsXMLHttpRequest.UNSENT = 0;
  oFF.NodeJsXMLHttpRequest.OPENED = 1;
  oFF.NodeJsXMLHttpRequest.HEADERS_RECEIVED = 2; //oFF.NodeJsXMLHttpRequest.LOADING = 3;

  oFF.NodeJsXMLHttpRequest.DONE = 4; //--------------------------------------------
  // Response Methods

  /**
   * Gets the value from the response header for a key
   * https://xhr.spec.whatwg.org/#the-getresponseheader()-method
   */

  oFF.NodeJsXMLHttpRequest.prototype.getResponseHeader = function (header) {
    if (typeof header === "string" && this.readyState > oFF.NodeJsXMLHttpRequest.OPENED && this.response && this.response.headers) {
      return this.response.headers[header.toLowerCase()];
    }

    return null;
  };
  /**
   * Gets all the response headers values as string
   * https://xhr.spec.whatwg.org/#the-getallresponseheaders()-method
   */


  oFF.NodeJsXMLHttpRequest.prototype.getAllResponseHeaders = function () {
    if (this.readyState < oFF.NodeJsXMLHttpRequest.HEADERS_RECEIVED) {
      return "";
    }

    var result = "";
    var headers = this.response.headers;

    for (var h in headers) {
      if (headers.hasOwnProperty(h)) {
        var headerLower = h.toLowerCase();
        result += headerLower + ": " + headers[headerLower] + "\r\n";
      }
    }

    return result.substr(0, result.length - 2);
  }; //--------------------------------------------
  // Request Methods

  /**
   * Checks if the protocol of a URL is HTTPS
   */


  oFF.NodeJsXMLHttpRequest.prototype.isHttpsProtocol = function (url) {
    var parsedUrl = require("url").parse(url.toString());

    var protocolLower = parsedUrl.protocol.toLowerCase();
    return protocolLower === "https:";
  };
  /**
   * Sets the cookies
   */


  oFF.NodeJsXMLHttpRequest.prototype.setCookies = function (cookies) {
    this.m_cookies = cookies;
  };
  /**
   * Set the request headers as a list of key/value
   * https://dvcs.w3.org/hg/xhr/raw-file/tip/Overview.html#the-setrequestheader()-method
   */


  oFF.NodeJsXMLHttpRequest.prototype.setRequestHeader = function (header, value) {
    var headerLower = header.toLowerCase();

    if (headerLower !== "cookie") {
      if (this.readyState !== oFF.NodeJsXMLHttpRequest.OPENED) {
        throw new Error("Request is not in OPEN state");
      }

      if (this.m_sendFlag) {
        throw new Error("Request has been already sent");
      } //if (validHeader(header))
      //{


      this.m_headers[headerLower] = this.m_headers[headerLower] ? this.m_headers[headerLower] + ", " + value : value; //}
    } else {
      this.m_headers[headerLower] = this.m_headers[headerLower] ? this.m_headers[headerLower] + ", " + value : value;
    }
  };
  /**
   * Sets the connection method, URL & asynchronous flag
   * https://dvcs.w3.org/hg/xhr/raw-file/tip/Overview.html#dom-xmlhttprequest-open
   */


  oFF.NodeJsXMLHttpRequest.prototype.open = function (method, url, async) {
    var methodUpper = method.toUpperCase();

    if (methodUpper !== "POST" && methodUpper !== "GET" && methodUpper !== "PUT") {
      throw new Error("Request method is not supported");
    }

    this.m_async = async;
    this.m_headers = {};
    this.m_method = methodUpper;
    this.m_url = url;
    this.m_sendFlag = false;
    this.readyState = oFF.NodeJsXMLHttpRequest.OPENED;
    this.status = 0;
    this.statusText = "";
  };
  /**
   * Initiate and send the request
   * https://xhr.spec.whatwg.org/#the-send()-method
   * https://dvcs.w3.org/hg/xhr/raw-file/tip/Overview.html#the-send()-method
   */


  oFF.NodeJsXMLHttpRequest.prototype.send = function (body) {
    if (this.readyState !== oFF.NodeJsXMLHttpRequest.OPENED) {
      throw new Error("Request is not in OPEN state");
    }

    if (this.m_sendFlag) {
      throw new Error("Request has been already sent");
    }

    if (this.m_method === "GET") {
      body = null;
    } else if (body) {
      this.setRequestHeader("Content-Length", Buffer.isBuffer(body) ? body.length : Buffer.byteLength(body));
    } else if (this.m_method === "POST") {
      this.setRequestHeader("Content-Length", 0);
    }

    var parsedUrl = require("url").parse(this.m_url);

    var port = parsedUrl.port || (this.isHttpsProtocol(this.m_url) ? 443 : 80);
    var host;
    var hostname;

    switch (parsedUrl.protocol) {
      case "https:":
      case "http:":
        host = parsedUrl.host;
        hostname = parsedUrl.hostname;
        break;

      default:
        throw new Error("Protocol not supported");
    } // Set extra headers


    this.setRequestHeader("Host", host);
    this.setRequestHeader("User-Agent", process.release.name + "/" + process.version + "(" + process.platform + ")");

    if (this.m_cookies !== null) {
      var cookiesList = this.m_cookies.getCookies();

      if (cookiesList.size() !== 0) {
        var cookies = "";

        for (var i = 0; i < cookiesList.size(); i++) {
          cookies += cookiesList.get(i).getName() + "=" + cookiesList.get(i).getValue() + "; ";
        }

        this.setRequestHeader("Cookie", cookies.substring(0, cookies.length - 2));
      }
    }

    this.m_options = {
      "host": host,
      "port": port,
      "path": parsedUrl.path,
      "hostname": hostname,
      "protocol": parsedUrl.protocol,
      "method": this.m_method,
      "headers": this.m_headers
    }; // Proxy Configurations

    var useProxy = false;

    if (useProxy) {
      //process.env.http_proxy = "http://127.0.0.1:8888";
      //process.env.https_proxy = "http://127.0.0.1:8888";
      var proxyHost = "127.0.0.1";
      var proxyPort = 8888;
      this.m_options.host = proxyHost;
      this.m_options.port = proxyPort;
      this.m_options.path = this.m_url;
      delete this.m_options.hostname;
    }

    var handleResponseEnd = function (resp) {
      var response = JSON.parse(resp);
      this.response = response.data;
      this.status = response.data.statusCode;
      this.statusText = response.data.statusMessage;
      this.responseText = response.data.text;
      this.readyState = oFF.NodeJsXMLHttpRequest.DONE;

      if (this.m_async) {
        this.handleEvent("readystatechange");
      }
    }.bind(this);

    var handleResponseError = function (error) {
      this.response = error;
      this.status = 0;
      this.statusText = "";
      this.responseText = "";
      this.readyState = oFF.NodeJsXMLHttpRequest.DONE;
    }.bind(this);

    var handleRequestError = function (error) {
      this.response = null;
      this.status = error.code;
      this.statusText = error.message;
      this.responseText = error.message;
      this.readyState = oFF.NodeJsXMLHttpRequest.DONE;
    }.bind(this);

    var charsetUTF8 = "UTF-8";

    if (this.m_async) {
      // Asynchronous Requests
      this.m_sendFlag = true;
      var responseText = "";

      var request = require("http" + (this.isHttpsProtocol(this.m_url) ? "s" : "")).request;

      var processResponse = function (response) {
        response.setEncoding(charsetUTF8);
        response.on("data", function (data) {
          responseText += data;
        });
        response.on("end", function () {
          handleResponseEnd(JSON.stringify({
            "error": null,
            "data": {
              "statusCode": response.statusCode,
              "statusMessage": response.statusMessage,
              "headers": response.headers,
              "text": responseText
            }
          }));
        });
        response.on("error", function (error) {
          handleResponseError(error);
        });
      }.bind(this);

      var requestPerformer = request(this.m_options, processResponse);
      requestPerformer.on("error", function (error) {
        handleRequestError(error);
      });

      if (body !== null) {
        requestPerformer.write(body);
      }

      requestPerformer.end();
    } else {
      // Synchronous Requests
      var fs = require("fs");

      var syncFile = ".nodeHttpSync_" + process.pid;
      fs.writeFileSync(syncFile, "", charsetUTF8);
      var syncReq = "var request = require(\"http" + (this.isHttpsProtocol(this.m_url) ? "s" : "") + "\").request;" + "var responseText = \"\";" + "var processResponse = function(response) {" + "response.setEncoding(\"" + charsetUTF8 + "\");" + "response.on(\"data\", function(data) {" + "responseText += data;" + "});" + "response.on(\"end\", function() {" + "fs.writeFileSync(\"" + syncFile + "\", " + "JSON.stringify({\"error\": null, \"data\": {\"statusCode\": " + "response.statusCode" + ", \"statusMessage\": " + "response.statusMessage" + ", \"headers\": " + "response.headers" + ", \"text\": " + "responseText" + "}})" + ", \"" + charsetUTF8 + "\");" + "});" + "response.on(\"error\", function(error) {" + "fs.writeFileSync(\"" + syncFile + "\", " + "JSON.stringify({\"error\": " + "error" + "})" + ", \"" + charsetUTF8 + "\");" + "});" + "};" + "var requestPerformer = request(" + JSON.stringify(this.m_options) + ", processResponse);" + "requestPerformer.on(\"error\", function(error) {" + "fs.writeFileSync(\"" + syncFile + "\", " + "JSON.stringify({\"error\": " + "error" + "})" + ", \"" + charsetUTF8 + "\");" + "});" + (body ? "requestPerformer.write(" + JSON.stringify(body) + ");" : "") + "requestPerformer.end();";

      var spawnSync = require("child_process").spawnSync;

      spawnSync(process.argv[0], ["-e", syncReq]);
      var resp = fs.readFileSync(syncFile, charsetUTF8);
      fs.unlinkSync(syncFile);
      var err = JSON.parse(resp).error;

      if (err) {
        handleResponseError(err);
      } else {
        handleResponseEnd(resp);
      }
    }
  };

  oFF.NodeJsXMLHttpRequest.prototype.abort = function () {};

  oFF.NodeJsXMLHttpRequest.prototype.handleEvent = function (event) {
    if (typeof this["on" + event] === "function") {
      this["on" + event]();
    }
  };

  oFF.NativeXFileSystem = function () {
    oFF.DfXFileSystemOS.call(this);
    this._ff_c = "NativeXFileSystem";
  };

  oFF.NativeXFileSystem.prototype = new oFF.DfXFileSystemOS();

  oFF.NativeXFileSystem.create = function (session) {
    var fs = new oFF.NativeXFileSystem();
    fs.setupSessionContext(session);
    return fs;
  };

  oFF.NativeXFileSystem.staticSetup = function () {
    if (oFF.XSystemUtils.isNode()) {
      // node.js
      // var xFile = oFF.XFile;
      // xFile.setFileSystem(new oFF.NativeXFileSystem());
      oFF.DfXFileSystemOS.setNativeSlash(require("path").sep);
    }
  };

  oFF.NativeXFileSystem.prototype.getRoots = function () {
    var paths = new oFF.XListOfString();
    var isWin = /^win/.test(process.platform);

    if (isWin) {
      paths.add("C:\\");
    } else {
      paths.add("/");
    }

    return paths;
  };

  oFF.NativeXFileSystem.prototype.getChildren = function (inputPath) {
    var nativePath = require("path").normalize(inputPath); // var xFile = oFF.XFile;


    if (oFF.XStringUtils.isNullOrEmpty(nativePath)) {
      return this.getRoots();
    }

    var paths = new oFF.XListOfString();

    try {
      var files = require("fs").readdirSync(nativePath);

      for (var i in files) {
        if (files.hasOwnProperty(i)) {
          var path = nativePath + oFF.XUri.PATH_SEPARATOR_NATIVE_FS + files[i];
          paths.add(path);
        }
      }
    } catch (err) {//oFF.XLogger.writelog(err);
    }

    return paths;
  };

  oFF.NativeXFileSystem.prototype.isDirectory = function (inputPath) {
    try {
      var stats = require("fs").statSync(require("path").normalize(inputPath));

      return stats.isDirectory();
    } catch (err) {
      return false;
    }
  };

  oFF.NativeXFileSystem.prototype.isFile = function (inputPath) {
    try {
      var stats = require("fs").statSync(require("path").normalize(inputPath));

      return stats.isFile();
    } catch (err) {
      return false;
    }
  };

  oFF.NativeXFileSystem.prototype.isExisting = function (inputPath) {
    var nativePath = require("path").normalize(inputPath);

    return this.isDirectory(nativePath) || this.isFile(nativePath);
  };

  oFF.NativeXFileSystem.prototype.loadInternal = function (inputPath, messageManager) {
    try {
      var bytes = require("fs").readFileSync(require("path").normalize(inputPath));

      var byteArray = new oFF.XByteArray(bytes);
    } catch (err) {
      messageManager.addError(0, err);
    }

    return byteArray;
  };

  oFF.NativeXFileSystem.prototype.load = function (nativePath) {
    var messageManager = oFF.MessageManagerSimple.createMessageManager();
    var byteArray = this.loadInternal(nativePath, messageManager);
    return oFF.ExtResult.create(byteArray, messageManager);
  };

  oFF.NativeXFileSystem.prototype.loadExt = function (nativePath) {
    var messageManager = oFF.MessageManagerSimple.createMessageManager();
    var byteArray = this.loadInternal(nativePath, messageManager);
    var content = oFF.XFileContent.createFileContent();
    content.setMessageCollection(messageManager);
    content.setContentTypeAutodetect(oFF.ContentType.BINARY, nativePath, false);
    content.setByteArray(byteArray);
    return content;
  };

  oFF.NativeXFileSystem.prototype.loadGzipped = function (inputPath) {
    var messageManager = oFF.MessageManagerSimple.createMessageManager();

    var nativePath = require("path").normalize(inputPath);

    var bytes = [];

    try {
      bytes = require("fs").readFileSync(nativePath);
      bytes = require("zlib").gunzipSync(bytes);
    } catch (err) {
      messageManager.addError(0, err);
    }

    var content = oFF.XFileContent.createFileContent();
    content.setMessageCollection(messageManager);
    content.setContentTypeAutodetect(oFF.ContentType.BINARY, nativePath, true);
    content.setByteArray(new oFF.XByteArray(bytes));
    return content;
  };

  oFF.NativeXFileSystem.prototype.saveGzipped = function (inputPath, data) {
    var messageManager = oFF.MessageManagerSimple.createMessageManager();

    try {
      var nativePath = require("path").normalize(inputPath);

      var bytes = require("zlib").gzipSync(data.getNative());

      require("fs").writeFileSync(nativePath, bytes);
    } catch (err) {
      messageManager.addError(0, err);
    }

    return messageManager;
  };

  oFF.NativeXFileSystem.prototype.save = function (inputPath, data) {
    var messageManager = oFF.MessageManagerSimple.createMessageManager();
    var bytes = data.getNative();

    try {
      var nativePath = require("path").normalize(inputPath);

      require("fs").writeFileSync(nativePath, bytes);
    } catch (err) {
      messageManager.addError(0, err);
    }

    return messageManager;
  };

  oFF.NativeXFileSystem.prototype.mkdirs = function (inputPath) {
    try {
      var pathToCreate = require("path").normalize(inputPath);

      pathToCreate.split(require("path").sep).reduce(function (currentPath, folder) {
        currentPath += folder + require("path").sep;

        if (!require("fs").existsSync(currentPath)) {
          require("fs").mkdirSync(currentPath);
        }

        return currentPath;
      }, "");
    } catch (err) {//oFF.XLogger.writelog(err);
    }
  };

  oFF.NativeXFileSystem.prototype.mkdir = function (inputPath) {
    try {
      var nativePath = require("path").normalize(inputPath);

      require("fs").mkdirSync(nativePath);
    } catch (err) {//oFF.XLogger.writelog(err);
    }
  };

  oFF.NativeXFileSystem.prototype.getLastModifiedTimestamp = function (inputPath) {
    try {
      var nativePath = require("path").normalize(inputPath);

      return require("fs").statSync(nativePath).mtime;
    } catch (err) {
      //oFF.XLogger.writelog(err);
      return 0;
    }
  };

  oFF.NativeXFileSystem.prototype.renameTo = function (inputSourcePath, inputDestPath) {
    try {
      var sourceNativePath = require("path").normalize(inputSourcePath);

      var destNativePath = require("path").normalize(inputDestPath);

      require("fs").renameSync(sourceNativePath, destNativePath);
    } catch (err) {//oFF.XLogger.writelog(err);
    }
  };

  oFF.NativeXFileSystem.prototype.deleteFile = function (inputPath) {
    try {
      var nativePath = require("path").normalize(inputPath);

      if (this.isDirectory(nativePath)) {
        require("fs").rmdirSync(nativePath);
      } else {
        require("fs").unlinkSync(nativePath);
      }
    } catch (err) {}
  };

  oFF.NativeXFileSystemOSFactory = function () {
    oFF.XFileSystemOSFactory.call(this);
    this._ff_c = "NativeXFileSystemOSFactory";
  };

  oFF.NativeXFileSystemOSFactory.prototype = new oFF.XFileSystemOSFactory();

  oFF.NativeXFileSystemOSFactory.staticSetup = function () {
    if (oFF.XSystemUtils.isNode()) {
      oFF.XFileSystemOSFactory.registerFactory(oFF.ProtocolType.FILE, new oFF.NativeXFileSystemOSFactory());
    }
  };

  oFF.NativeXFileSystemOSFactory.prototype.newFileSystem = function (session) {
    return new oFF.NativeXFileSystem.create(session);
  };

  oFF.NativeDispatcher = function () {
    oFF.DfDispatcher.call(this);
    this._ff_c = "NativeDispatcher";
  };

  oFF.NativeDispatcher.prototype = new oFF.DfDispatcher();

  oFF.NativeDispatcher.staticSetup = function () {
    oFF.Dispatcher.replaceInstance(new oFF.NativeDispatcher());
  };

  oFF.NativeDispatcher.prototype.registerInterval = function (milliseconds, listener, customIdentifier) {
    var timerItem = new oFF.JsTimerHandle(milliseconds, listener, customIdentifier, true);
    timerItem.jsHandle = setInterval(function () {
      timerItem.execute();
    }, milliseconds);
    return timerItem;
  };

  oFF.NativeDispatcher.prototype.unregisterInterval = function (handle) {
    clearInterval(handle.jsHandle);
  };

  oFF.NativeDispatcher.prototype.registerTimer = function (milliseconds, listener, customIdentifier) {
    var timerItem = new oFF.JsTimerHandle(milliseconds, listener, customIdentifier, false);
    timerItem.jsHandle = setTimeout(function () {
      timerItem.execute();
    }, milliseconds);
    return timerItem;
  };

  oFF.NativeDispatcher.prototype.unregisterTimer = function (handle) {
    clearTimeout(handle.jsHandle);
  };

  oFF.NativeDispatcher.prototype.getProcessingTimeReceiverCount = function () {
    return -1;
  };

  oFF.NativeDispatcher.prototype.registerProcessingTimeReceiver = function (processingTimeReceiver) {
    return;
  };

  oFF.NativeDispatcher.prototype.unregisterProcessingTimeReceiver = function (processingTimeReceiver) {
    return;
  };

  oFF.NativeDispatcher.prototype.shutdown = function () {
    return;
  };

  oFF.NativeDispatcher.prototype.process = function () {
    return;
  };

  oFF.NativeDispatcher.prototype.getSyncState = function () {
    return oFF.SyncState.IN_SYNC;
  };

  oFF.JsTimerHandle = function (milliseconds, listener, customIdentifier, isInterval) {
    oFF.TimerItem.call(this);
    oFF.TimerItem.prototype.setupExt.call(this, milliseconds, listener, customIdentifier, isInterval);
    this._ff_c = "JsTimerHandle";
  };

  oFF.JsTimerHandle.prototype = new oFF.TimerItem();
  /**
   * XMLHttpRequest for Google Apps Script
   */

  oFF.NativeGoogleHttpRequest = function () {
    this.m_options = {
      "headers": {},
      "followRedirects": false
    };
    this.m_url = null;
    this.m_response = null;
    this.onreadystatechange = null;
    this.readyState = oFF.NativeGoogleHttpRequest.UNSENT;
    this.status = 0;
    this.statusText = null;
    this.responseText = null;
    this._ff_c = "NativeGoogleHttpRequest";
  };

  oFF.NativeGoogleHttpRequest.prototype = new oFF.XObject(); // state variables

  oFF.NativeGoogleHttpRequest.UNSENT = 0;
  oFF.NativeGoogleHttpRequest.OPENED = 1;
  oFF.NativeGoogleHttpRequest.DONE = 4;

  oFF.NativeGoogleHttpRequest.prototype.releaseObject = function () {
    this.m_url = null;
    this.m_response = oFF.XObjectExt.release(this.m_response);
    this.onreadystatechange = null;
    this.statusText = null;
    this.responseText = null;
    oFF.XObject.prototype.releaseObject.call(this);
  };

  oFF.NativeGoogleHttpRequest.prototype.setCookies = function (cookies) {
    var cookieList = cookies.getCookies();

    if (cookieList.size() > 0) {
      var cookieStr = "";

      for (var i = 0; i < cookieList.size(); i++) {
        var cookie = cookieList.get(i);
        cookieStr += cookie.getName() + "=" + cookie.getValue() + "; ";
      }

      this.m_options.headers["Cookie"] = cookieStr.substring(0, cookieStr.length - 2);
    }
  };

  oFF.NativeGoogleHttpRequest.prototype.open = function (requestMethodName, url, isAsync) {
    this.m_options["method"] = requestMethodName.toLowerCase();
    this.m_url = url;
    this.readyState = oFF.NativeGoogleHttpRequest.OPENED;
    this.status = 0;
    this.statusText = null;
    this.responseText = null;
  };

  oFF.NativeGoogleHttpRequest.prototype.setRequestHeader = function (key, value) {
    this.m_options.headers[key] = value;
  };

  oFF.NativeGoogleHttpRequest.prototype.send = function (content) {
    if (content) {
      this.m_options["payload"] = content;
    }

    this.m_response = oFF.GoogleUrlFetchApp.fetch(this.m_url, this.m_options);
    this.readyState = oFF.NativeGoogleHttpRequest.DONE;
    this.status = this.m_response.getResponseCode();
    this.responseText = this.m_response.getContentText();
    this.onreadystatechange();
  };

  oFF.NativeGoogleHttpRequest.prototype.getResponseHeader = function (header) {
    var allHeaders = this.getAllResponseHeaders();
    return allHeaders ? allHeaders[header] : null;
  };

  oFF.NativeGoogleHttpRequest.prototype.getAllResponseHeaders = function () {
    if (this.m_response) {
      return this.m_response.getAllHeaders();
    }

    return null;
  };

  oFF.NativeHttpClient = function (session) {
    oFF.DfHttpClient.call(this);
    this.m_xmlHttpRequest = null;
    this.m_isOnAjaxEventExecuted = false;
    oFF.DfHttpClient.prototype.setupHttpClient.call(this, session);
    this._ff_c = "NativeHttpClient";
  };

  oFF.NativeHttpClient.prototype = new oFF.DfHttpClient();

  oFF.NativeHttpClient.parseResponseHeaders = function (headerStr, headerFields) {
    if (headerStr !== null) {
      if (oFF.XSystemUtils.isGoogleAppsScript()) {
        for (var h in headerStr) {
          if (h !== oFF.HttpConstants.HD_SET_COOKIE) {
            headerFields.put(h, headerStr[h]);
          }
        }
      } else {
        var headerPairs = headerStr.split("\r\n");
        var headerLength = headerPairs.length;
        var oHttpConstants = oFF.HttpConstants;

        for (var i = 0; i < headerLength; i++) {
          var headerPair = headerPairs[i]; // Can't use split() here because it does the wrong thing
          // if the header value has the string ": " in it.

          var index = headerPair.indexOf(": ");

          if (index > 0) {
            // need to clean the key from "\r\n" and "\n" due to a bug in IE 10
            // eslint-disable-next-line no-control-regex
            var key = headerPair.substring(0, index).replace(/(^\u000d\u000a?)|(^\u000a?)/, "");
            var value = headerPair.substring(index + 2);
            headerFields.put(oHttpConstants.lookupCamelCase(key), value);
          }
        }
      }
    }
  };

  oFF.NativeHttpClient.prototype.abort = function () {
    this.m_xmlHttpRequest.abort();
  };

  oFF.NativeHttpClient.prototype.releaseObject = function () {
    this.m_xmlHttpRequest = null;
    this.m_response = oFF.XObjectExt.release(this.m_response);
    this.m_isOnAjaxEventExecuted = null;
    oFF.DfHttpClient.prototype.releaseObject.call(this);
  };

  oFF.NativeHttpClient.prototype.onAjaxEvent = function () {
    var xmlHttpRequest = this.m_xmlHttpRequest;

    if (xmlHttpRequest !== null && xmlHttpRequest.readyState === 4) {
      this.addProfileStep("Receive http response");
      this.m_response = oFF.HttpResponse.createResponse(this.getRequest());
      this.m_isOnAjaxEventExecuted = true;

      if (oFF.XSystemUtils.isNode() || oFF.XSystemUtils.isGoogleAppsScript()) {
        // Node.js cookies
        var cookies = oFF.HttpCookies.create();
        var cookiesResponseHeaders = xmlHttpRequest.getResponseHeader(oFF.HttpConstants.HD_SET_COOKIE);

        for (var h in cookiesResponseHeaders) {
          if (cookiesResponseHeaders.hasOwnProperty(h)) {
            cookies.addByHttpServerResponseValue(cookiesResponseHeaders[h]);
          }
        }

        this.m_response.setCookies(cookies);
        this.m_response.setCookiesMasterStore(this.getRequest().getCookiesMasterStore());
        this.m_response.applyCookiesToMasterStorage();
      }

      this.m_response.setStatusCode(xmlHttpRequest.status);
      this.m_response.setStatusCodeDetails(xmlHttpRequest.statusText);
      var allResponseHeaders = xmlHttpRequest.getAllResponseHeaders();
      var headerFields = this.m_response.getHeaderFieldsBase();
      oFF.NativeHttpClient.parseResponseHeaders(allResponseHeaders, headerFields);
      var contentTypeValue = headerFields.getByKey(oFF.HttpConstants.HD_CONTENT_TYPE);

      if (contentTypeValue !== null) {
        contentTypeValue = contentTypeValue.toLowerCase();
        var delimiter = contentTypeValue.indexOf(";");

        if (delimiter !== -1) {
          contentTypeValue = contentTypeValue.substring(0, delimiter);
        }
      }

      var contentType = oFF.ContentType.lookup(contentTypeValue);

      if (contentType === null) {
        this.m_response.setContentTypeValue(contentTypeValue);
      } else {
        this.m_response.setContentType(contentType);

        if (contentType.isText()) {
          var content = xmlHttpRequest.responseText;
          this.m_response.setString(content);

          if (contentType === oFF.ContentType.APPLICATION_JSON) {
            if (content !== null && content.length > 0) {
              try {
                this.addProfileStep("Parse json");
                var jsonRootElement = JSON.parse(content);
                var ocpRootElement = new oFF.NativeJsonProxyElement(jsonRootElement);
                this.m_response.setJsonObject(ocpRootElement);
              } catch (e) {
                this.addError(oFF.JsonParserErrorCode.JSON_PARSER_ILLEGAL_STATE, e.message);
              }
            }
          }
        }
      }

      if (xmlHttpRequest.status === 0) {
        this.addError(oFF.ErrorCodes.HOST_UNREACHABLE, "Destination host is unreachable!");
      }

      this.setData(this.m_response);
      this.endSync();
      this.m_xmlHttpRequest = null;
    }
  };

  oFF.NativeHttpClient.prototype.processSynchronization = function (syncType) {
    var oHttpConstants = oFF.HttpConstants;
    var oHttpRequestMethod = oFF.HttpRequestMethod;
    var request = this.prepareRequest();
    var url = request.getUrlWithoutAuthentication(); // see http://www.w3.org/TR/2006/WD-XMLHttpRequest-20060405

    this.m_xmlHttpRequest = null;

    if (oFF.XSystemUtils.isXS()) {
      this.m_xmlHttpRequest = new $Global.XMLHttpRequest();
    } else if (oFF.XSystemUtils.isNode()) {
      // Node.js
      this.m_xmlHttpRequest = new oFF.NodeJsXMLHttpRequest();
      var cookies;

      if (typeof window !== "undefined" && window && window.options && window.options.isMobile && oFF.userSession) {
        // set cookies for mobile running in node
        cookies = oFF.HttpCookies.create();
        cookies.addByHttpClientRequestValue(oFF.userSession.cookies);
      } else {
        cookies = this.getRequest().getCookies();
      }

      this.m_xmlHttpRequest.setCookies(cookies);
    } else if (oFF.XSystemUtils.isGoogleAppsScript()) {
      this.m_xmlHttpRequest = new oFF.NativeGoogleHttpRequest();
      this.m_xmlHttpRequest.setCookies(this.getRequest().getCookies());
    } else if (oFF.XSystemUtils.isBrowser() && request.isLogoff() && typeof navigator.sendBeacon !== "undefined") {
      navigator.sendBeacon(url);
      return true;
    } else {
      this.m_xmlHttpRequest = new XMLHttpRequest();
    }

    if (this.m_xmlHttpRequest !== null) {
      var xmlHttpRequest = this.m_xmlHttpRequest;
      var isAsync = syncType === oFF.SyncType.NON_BLOCKING;
      var oRequestMethod = request.getMethod();
      xmlHttpRequest.open(oRequestMethod.getName(), url, isAsync);

      if (oRequestMethod === oHttpRequestMethod.HTTP_POST || oRequestMethod === oHttpRequestMethod.HTTP_PUT) {
        var requestContentType = request.getContentType().getName() + ";charset=UTF-8";
        xmlHttpRequest.setRequestHeader(oHttpConstants.HD_CONTENT_TYPE, requestContentType);
      }

      xmlHttpRequest.setRequestHeader(oHttpConstants.HD_ACCEPT, request.getAcceptContentType().getName()); // we are not allowed to set HD_ACCEPT_CHARSET due to security reasons

      var authType = request.getAuthenticationType(); // Do not set authorization header if both user and password are null as that will set it to null:null

      if (authType === oFF.AuthenticationType.BASIC && (request.getUser() !== null || request.getPassword() !== null)) {
        var valueUnencoded = request.getUser() + ":" + request.getPassword();
        var valueEncoded = oHttpConstants.VA_AUTHORIZATION_BASIC + " " + oFF.Base64.encode(valueUnencoded);
        xmlHttpRequest.setRequestHeader(oHttpConstants.HD_AUTHORIZATION, valueEncoded);

        if (request.isXAuthorizationRequired()) {
          xmlHttpRequest.setRequestHeader(oHttpConstants.HD_X_AUTHORIZATION, valueEncoded);
        }
      } else if (authType === oFF.AuthenticationType.BEARER) {
        var bearer = request.getAccessToken();

        if (bearer === null) {
          bearer = request.getAuthenticationToken().getAccessToken();
        }

        if (bearer !== null) {
          xmlHttpRequest.setRequestHeader(oHttpConstants.HD_AUTHORIZATION, oHttpConstants.VA_AUTHORIZATION_BEARER + " " + bearer);
        }
      } else if (authType === oFF.AuthenticationType.SCP_OPEN_CONNECTORS) {
        // user, organization and element can either be defined on connection or query level
        var user = request.getUser();
        var organization = request.getOrganization();
        var element = request.getElement();
        var authentication = oFF.XStringBuffer.create();
        authentication.append(oHttpConstants.HD_USER).append(" ").append(user);
        authentication.append(", ");
        authentication.append(oHttpConstants.HD_ORGANIZATION).append(" ").append(organization);
        authentication.append(", ");
        authentication.append(oHttpConstants.HD_ELEMENT).append(" ").append(element);
        xmlHttpRequest.setRequestHeader(oHttpConstants.HD_AUTHORIZATION, authentication.toString());
      }

      var lang = request.getLanguage();

      if (lang && lang.length > 0) {
        xmlHttpRequest.setRequestHeader(oHttpConstants.HD_ACCEPT_LANGUAGE, lang);
      }

      var headerFields = request.getHeaderFields();
      var headerKeys = headerFields.getKeysAsIteratorOfString();

      while (headerKeys.hasNext()) {
        var currentKey = headerKeys.next();
        xmlHttpRequest.setRequestHeader(currentKey, headerFields.getByKey(currentKey));
      }

      xmlHttpRequest.onreadystatechange = this.onAjaxEvent.bind(this);

      if (this._sendInternal(request) === false) {
        return false;
      }

      if (!isAsync) {
        // is in blocking mode
        // check now if onreadystatechange was executed
        if (!this.m_isOnAjaxEventExecuted) {
          // probably a browser-bug, onreadystatechange was not executed
          this.onAjaxEvent();
          this.m_xmlHttpRequest = null;
        }
      }

      return true;
    }

    this.addError(oFF.HttpErrorCode.HTTP_MISSING_NATIVE_DRIVER, "XMLHttpRequest not supported");
    return false;
  };

  oFF.NativeHttpClient.prototype._sendInternal = function (request) {
    var oHttpRequestMethod = oFF.HttpRequestMethod;

    try {
      this.m_isOnAjaxEventExecuted = false;
      this.addProfileStep("### SERVER ###");

      if (request.isCorsSecured()) {
        // enable cors: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials
        this.m_xmlHttpRequest.withCredentials = true;
      }

      if (request.getMethod() === oHttpRequestMethod.HTTP_POST || request.getMethod() === oHttpRequestMethod.HTTP_PUT) {
        this.m_xmlHttpRequest.send(request.getString());
      } else {
        this.m_xmlHttpRequest.send(null);
      }

      return true;
    } catch (e) {
      this.addError(oFF.HttpErrorCode.HTTP_IO_EXCEPTION, e.message);
      return false;
    }
  };

  oFF.NativeHttpWebWorkerClient = function (session) {
    oFF.DfHttpClient.call(this);
    this.m_xmlHttpRequest = null;
    this.m_isOnAjaxEventExecuted = false;
    oFF.DfHttpClient.prototype.setupHttpClient.call(this, session);
    this._ff_c = "NativeHttpWebWorkerClient";
    this._ffWebWorker = null;
    oFF.NativeHttpWebWorkerClient.setupWebworker.call(this, session);
  };

  oFF.NativeHttpWebWorkerClient.prototype = new oFF.DfHttpClient();

  oFF.NativeHttpWebWorkerClient.setupWebworker = function (session) {
    var _this = this;

    if (window.SharedWorker) {
      this._ffWebWorker = new SharedWorker("../../../../projects/ff0210.io.native/src/javascript/NativeHttpWebWorker.js").port;

      this._ffWebWorker.onmessage = function (event) {
        return oFF.NativeHttpWebWorkerClient.onMessage.call(_this, event);
      };

      this._ffWebWorker.postMessage({
        cmd: "init",
        environment: session.getEnvironment().toString()
      });
    }
  };

  oFF.NativeHttpWebWorkerClient.onMessage = function (event) {
    if (event.data && event.data.cmd === "init") {
      oFF.XLogger.println("[Sphere Server] Initialization: ".concat(event.data.status));
    }

    if (event.data && event.data.cmd === "http") {
      oFF.XLogger.println("[Sphere Server] Webworker response: ".concat(event.data.message));
      this.m_response = oFF.HttpResponse.createResponse(this.getRequest());
      var jsonRootElement = JSON.parse(event.data.message);
      var ocpRootElement = new oFF.NativeJsonProxyElement(jsonRootElement);
      this.m_response.setJsonObject(ocpRootElement);
      this.setData(this.m_response);
      this.endSync();
    }
  };

  oFF.NativeHttpWebWorkerClient.parseResponseHeaders = function (headerStr, headerFields) {
    if (headerStr !== null) {
      if (oFF.XSystemUtils.isGoogleAppsScript()) {
        for (var h in headerStr) {
          if (h !== oFF.HttpConstants.HD_SET_COOKIE) {
            headerFields.put(h, headerStr[h]);
          }
        }
      } else {
        var headerPairs = headerStr.split("\r\n");
        var headerLength = headerPairs.length;
        var oHttpConstants = oFF.HttpConstants;

        for (var i = 0; i < headerLength; i++) {
          var headerPair = headerPairs[i]; // Can't use split() here because it does the wrong thing
          // if the header value has the string ": " in it.

          var index = headerPair.indexOf(": ");

          if (index > 0) {
            // need to clean the key from "\r\n" and "\n" due to a bug in IE 10
            // eslint-disable-next-line no-control-regex
            var key = headerPair.substring(0, index).replace(/(^\u000d\u000a?)|(^\u000a?)/, "");
            var value = headerPair.substring(index + 2);
            headerFields.put(oHttpConstants.lookupCamelCase(key), value);
          }
        }
      }
    }
  };

  oFF.NativeHttpWebWorkerClient.prototype.abort = function () {
    this.m_xmlHttpRequest.abort();
  };

  oFF.NativeHttpWebWorkerClient.prototype.releaseObject = function () {
    this.m_xmlHttpRequest = null;
    this.m_response = oFF.XObjectExt.release(this.m_response);
    this.m_isOnAjaxEventExecuted = null;
    oFF.DfHttpClient.prototype.releaseObject.call(this);
  };

  oFF.NativeHttpWebWorkerClient.prototype.onAjaxEvent = function () {
    var xmlHttpRequest = this.m_xmlHttpRequest;

    if (xmlHttpRequest !== null && xmlHttpRequest.readyState === 4) {
      this.addProfileStep("Receive http response");
      this.m_response = oFF.HttpResponse.createResponse(this.getRequest());
      this.m_isOnAjaxEventExecuted = true;

      if (oFF.XSystemUtils.isNode() || oFF.XSystemUtils.isGoogleAppsScript()) {
        // Node.js cookies
        var cookies = oFF.HttpCookies.create();
        var cookiesResponseHeaders = xmlHttpRequest.getResponseHeader(oFF.HttpConstants.HD_SET_COOKIE);

        for (var h in cookiesResponseHeaders) {
          if (cookiesResponseHeaders.hasOwnProperty(h)) {
            cookies.addByHttpServerResponseValue(cookiesResponseHeaders[h]);
          }
        }

        this.m_response.setCookies(cookies);
        this.m_response.setCookiesMasterStore(this.getRequest().getCookiesMasterStore());
        this.m_response.applyCookiesToMasterStorage();
      }

      this.m_response.setStatusCode(xmlHttpRequest.status);
      this.m_response.setStatusCodeDetails(xmlHttpRequest.statusText);
      var allResponseHeaders = xmlHttpRequest.getAllResponseHeaders();
      var headerFields = this.m_response.getHeaderFieldsBase();
      oFF.NativeHttpWebWorkerClient.parseResponseHeaders(allResponseHeaders, headerFields);
      var contentTypeValue = headerFields.getByKey(oFF.HttpConstants.HD_CONTENT_TYPE);

      if (contentTypeValue !== null) {
        contentTypeValue = contentTypeValue.toLowerCase();
        var delimiter = contentTypeValue.indexOf(";");

        if (delimiter !== -1) {
          contentTypeValue = contentTypeValue.substring(0, delimiter);
        }
      }

      var contentType = oFF.ContentType.lookup(contentTypeValue);

      if (contentType === null) {
        this.m_response.setContentTypeValue(contentTypeValue);
      } else {
        this.m_response.setContentType(contentType);

        if (contentType.isText()) {
          var content = xmlHttpRequest.responseText;
          this.m_response.setString(content);

          if (contentType === oFF.ContentType.APPLICATION_JSON) {
            if (content !== null && content.length > 0) {
              try {
                this.addProfileStep("Parse json");
                var jsonRootElement = JSON.parse(content);
                var ocpRootElement = new oFF.NativeJsonProxyElement(jsonRootElement);
                this.m_response.setJsonObject(ocpRootElement);
              } catch (e) {
                this.addError(oFF.JsonParserErrorCode.JSON_PARSER_ILLEGAL_STATE, e.message);
              }
            }
          }
        }
      }

      if (xmlHttpRequest.status === 0) {
        this.addError(oFF.ErrorCodes.HOST_UNREACHABLE, "Destination host is unreachable!");
      }

      this.setData(this.m_response);
      this.endSync();
      this.m_xmlHttpRequest = null;
    }
  };

  oFF.NativeHttpWebWorkerClient.prototype.processSynchronization = function (syncType) {
    var oHttpConstants = oFF.HttpConstants;
    var oHttpRequestMethod = oFF.HttpRequestMethod;
    var request = this.prepareRequest();
    var url = request.getUrlWithoutAuthentication(); // see http://www.w3.org/TR/2006/WD-XMLHttpRequest-20060405

    this.m_xmlHttpRequest = null;

    if (oFF.XSystemUtils.isXS()) {
      this.m_xmlHttpRequest = new $Global.XMLHttpRequest();
    } else if (oFF.XSystemUtils.isNode()) {
      // Node.js
      this.m_xmlHttpRequest = new oFF.NodeJsXMLHttpRequest();
      var cookies;

      if (typeof window !== "undefined" && window && window.options && window.options.isMobile && oFF.userSession) {
        // set cookies for mobile running in node
        cookies = oFF.HttpCookies.create();
        cookies.addByHttpClientRequestValue(oFF.userSession.cookies);
      } else {
        cookies = this.getRequest().getCookies();
      }

      this.m_xmlHttpRequest.setCookies(cookies);
    } else if (oFF.XSystemUtils.isGoogleAppsScript()) {
      this.m_xmlHttpRequest = new oFF.NativeGoogleHttpRequest();
      this.m_xmlHttpRequest.setCookies(this.getRequest().getCookies());
    } else if (oFF.XSystemUtils.isBrowser() && request.isLogoff() && typeof navigator.sendBeacon !== "undefined") {
      navigator.sendBeacon(url);
      return true;
    } else {
      this.m_xmlHttpRequest = new XMLHttpRequest();
    }

    if (this.m_xmlHttpRequest !== null) {
      var xmlHttpRequest = this.m_xmlHttpRequest;
      var isAsync = syncType === oFF.SyncType.NON_BLOCKING;
      var oRequestMethod = request.getMethod();
      xmlHttpRequest.open(oRequestMethod.getName(), url, isAsync);

      if (oRequestMethod === oHttpRequestMethod.HTTP_POST || oRequestMethod === oHttpRequestMethod.HTTP_PUT) {
        var requestContentType = request.getContentType().getName() + ";charset=UTF-8";
        xmlHttpRequest.setRequestHeader(oHttpConstants.HD_CONTENT_TYPE, requestContentType);
      }

      xmlHttpRequest.setRequestHeader(oHttpConstants.HD_ACCEPT, request.getAcceptContentType().getName()); // we are not allowed to set HD_ACCEPT_CHARSET due to security reasons

      var authType = request.getAuthenticationType();

      if (authType === oFF.AuthenticationType.BASIC) {
        var valueUnencoded = request.getUser() + ":" + request.getPassword();
        var valueEncoded = oHttpConstants.VA_AUTHORIZATION_BASIC + " " + oFF.Base64.encode(valueUnencoded);
        xmlHttpRequest.setRequestHeader(oHttpConstants.HD_AUTHORIZATION, valueEncoded);
      } else if (authType === oFF.AuthenticationType.BEARER) {
        var bearer = request.getAccessToken();

        if (bearer === null) {
          bearer = request.getAuthenticationToken().getAccessToken();
        }

        if (bearer !== null) {
          xmlHttpRequest.setRequestHeader(oHttpConstants.HD_AUTHORIZATION, oHttpConstants.VA_AUTHORIZATION_BEARER + " " + bearer);
        }
      } else if (authType === oFF.AuthenticationType.SCP_OPEN_CONNECTORS) {
        // user, organization and element can either be defined on connection or query level
        var user = request.getUser();
        var organization = request.getOrganization();
        var element = request.getElement();
        var authentication = oFF.XStringBuffer.create();
        authentication.append(oHttpConstants.HD_USER).append(" ").append(user);
        authentication.append(", ");
        authentication.append(oHttpConstants.HD_ORGANIZATION).append(" ").append(organization);
        authentication.append(", ");
        authentication.append(oHttpConstants.HD_ELEMENT).append(" ").append(element);
        xmlHttpRequest.setRequestHeader(oHttpConstants.HD_AUTHORIZATION, authentication.toString());
      }

      var lang = request.getLanguage();

      if (lang && lang.length > 0) {
        xmlHttpRequest.setRequestHeader(oHttpConstants.HD_ACCEPT_LANGUAGE, lang);
      }

      var headerFields = request.getHeaderFields();
      var headerKeys = headerFields.getKeysAsIteratorOfString();

      while (headerKeys.hasNext()) {
        var currentKey = headerKeys.next();
        xmlHttpRequest.setRequestHeader(currentKey, headerFields.getByKey(currentKey));
      }

      xmlHttpRequest.onreadystatechange = this.onAjaxEvent.bind(this);

      if (this._sendInternal(request) === false) {
        return false;
      }

      if (!isAsync) {
        // is in blocking mode
        // check now if onreadystatechange was executed
        if (!this.m_isOnAjaxEventExecuted) {
          // probably a browser-bug, onreadystatechange was not executed
          this.onAjaxEvent();
          this.m_xmlHttpRequest = null;
        }
      }

      return true;
    }

    this.addError(oFF.HttpErrorCode.HTTP_MISSING_NATIVE_DRIVER, "XMLHttpRequest not supported");
    return false;
  };

  oFF.NativeHttpWebWorkerClient.prototype._sendInternal = function (request) {
    var oHttpRequestMethod = oFF.HttpRequestMethod;

    try {
      this.m_isOnAjaxEventExecuted = false;
      this.addProfileStep("### SERVER ###");

      if (request.isCorsSecured()) {
        // enable cors: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials
        this.m_xmlHttpRequest.withCredentials = true;
      }

      if (request.getMethod() === oHttpRequestMethod.HTTP_POST || request.getMethod() === oHttpRequestMethod.HTTP_PUT) {
        var httpHeaders = oFF.HttpCoreUtils.populateHeaderFromRequest(request, oFF.HttpHeader.create(), request, 0, true);
        var httpRequestString = oFF.HttpCoreUtils.createHttpRequestString(request, httpHeaders);

        this._ffWebWorker.postMessage({
          cmd: "http",
          method: request.getMethod().getName(),
          url: request.getUrlWithoutAuthentication(),
          headers: httpHeaders,
          content: request.getString(),
          httpRequestString: httpRequestString
        });
      } else {
        this._ffWebWorker.postMessage({
          cmd: "http",
          method: request.getMethod().getName(),
          url: request.getUrlWithoutAuthentication(),
          headers: oFF.HttpCoreUtils.populateHeaderFromRequest(request, oFF.HttpHeader.create(), request, 0, true),
          content: null
        });
      }

      return true;
    } catch (e) {
      this.addError(oFF.HttpErrorCode.HTTP_IO_EXCEPTION, e.message);
      return false;
    }
  };

  oFF.NativeHttpClientFactory = function () {
    oFF.HttpClientFactory.call(this);
    this._ff_c = "NativeHttpClientFactory";
  };

  oFF.NativeHttpClientFactory.prototype = new oFF.HttpClientFactory();

  oFF.NativeHttpClientFactory.staticSetup = function () {
    var factory = new oFF.NativeHttpClientFactory();
    oFF.HttpClientFactory.setHttpClientFactoryForProtocol(oFF.ProtocolType.HTTPS, factory);
    oFF.HttpClientFactory.setHttpClientFactoryForProtocol(oFF.ProtocolType.HTTP, factory);
    oFF.HttpClientFactory.setHttpClientFactoryForProtocol(oFF.ProtocolType.WEBWORKER, factory);
  };

  oFF.NativeHttpClientFactory.prototype.newHttpClientInstance = function (session, connection) {
    if (connection.getProtocolType().getName() === "webworker") {
      return new oFF.NativeHttpWebWorkerClient(session);
    }

    return new oFF.NativeHttpClient(session);
  };

  oFF.NativeNetworkEnv = function () {
    oFF.NetworkEnv.call(this);
    this._ff_c = "NativeNetworkEnv";
  };

  oFF.NativeNetworkEnv.prototype = new oFF.NetworkEnv();

  oFF.NativeNetworkEnv.staticSetup = function () {
    oFF.NetworkEnv.setNative(new oFF.NativeNetworkEnv());
  }; /// <summary>Get the location of this environment or <code>null</code> if no one is available.</summary>
  /// <returns>the uri or <code>null</code> if no location is available.</returns>


  oFF.NativeNetworkEnv.prototype.getNativeLocation = function () {
    // var oNetworkEnv = oFF.NetworkEnv;
    var oUri = oFF.XUri.create();

    if (oFF.XSystemUtils.isBrowser()) {
      var location = window.location;
      var protocol = location.protocol;
      var index = protocol.indexOf(":");

      if (index !== -1) {
        protocol = protocol.substring(0, index);
      }

      oUri.setScheme(protocol);
      oUri.setHost(location.hostname);
      var port = 0;

      if (location.port !== null && location.port !== "") {
        port = parseInt(location.port);

        if (isNaN(port)) {
          port = 0;
        }
      }

      oUri.setPort(port);
      oUri.setPath(location.pathname);
      var hash = location.hash;

      if (hash !== null && hash !== "") {
        if (hash.indexOf("#") === 0) {
          hash = hash.substring(1);
        }

        hash = decodeURIComponent(hash);
        oUri.setFragment(hash);
      }

      var search = location.search;

      if (search !== null && search !== "") {
        search = decodeURIComponent(search);
        oUri.setQuery(search);
      }
    }

    return oUri;
  };

  oFF.NativeNetworkEnv.prototype.getNativeFragment = function () {
    return this.getNativeLocation().getFragment();
  };

  oFF.NativeNetworkEnv.prototype.setNativeFragment = function (fragment) {
    if (oFF.XSystemUtils.isBrowser()) {
      if (fragment === null) {
        var uri = window.location.toString();

        if (uri.indexOf("#") > 0) {
          uri = uri.substring(0, uri.indexOf("#"));
        }

        window.history.pushState({}, document.title, uri);
      } else {
        window.location.hash = fragment;
      }
    }
  };

  oFF.NativeNetworkEnv.prototype.setNativeDomain = function (domain) {
    if (oFF.XSystemUtils.isBrowser()) {
      document.domain = domain;
    }
  };

  oFF.NativeSamlUtils = function () {
    oFF.SamlUtils.call(this);
    this._ff_c = "NativeSamlUtils";
  };

  oFF.NativeSamlUtils.prototype = new oFF.SamlUtils();
  oFF.NativeSamlUtils.WINDOW_WIDTH = 800;
  oFF.NativeSamlUtils.WINDOW_HEIGHT = 520;
  oFF.NativeSamlUtils.DEFAULT_AUTH_TIMEOUT = 31000;

  oFF.NativeSamlUtils.staticSetup = function () {
    oFF.SamlUtils.setNative(new oFF.NativeSamlUtils());
  };

  oFF.NativeSamlUtils.prototype.openNativeWindow = function (authUrl, listener) {
    var authWindow = window.open(authUrl, "_blank", "width=".concat(oFF.NativeSamlUtils.WINDOW_WIDTH, ",height=").concat(oFF.NativeSamlUtils.WINDOW_HEIGHT));

    if (!authWindow) {
      return false;
    }

    var authInterval = setInterval(function () {
      if (authWindow && authWindow.closed) {
        clearInterval(authInterval);
        listener.onWindowClose();
      }
    }, 100);
    setTimeout(function () {
      if (authWindow && !authWindow.closed) {
        clearInterval(authInterval);
        authWindow.close();
        listener.onAuthenticationTimeout();
      }
    }, oFF.NativeSamlUtils.DEFAULT_AUTH_TIMEOUT);
    return true;
  };

  oFF.NativeDocumentEnv = function () {
    oFF.DocumentEnv.call(this);
    this._ff_c = "NativeDocumentEnv";
  };

  oFF.NativeDocumentEnv.prototype = new oFF.DocumentEnv();

  oFF.NativeDocumentEnv.staticSetup = function () {
    oFF.DocumentEnv.setNative(new oFF.NativeDocumentEnv());
  };

  oFF.NativeDocumentEnv.prototype.setNativeStringAtId = function (id, value) {
    if (oFF.XSystemUtils.isBrowser()) {
      var docElement = document.getElementById(id);

      if (docElement !== null && docElement !== undefined) {
        docElement.innerHTML = value;
      }
    }
  };

  oFF.NativeXLocalStorage = function (session) {
    oFF.XLocalStorage.call(this);
    this._ff_c = "NativeXLocalStorage";
  };

  oFF.NativeXLocalStorage.prototype = new oFF.XLocalStorage();

  oFF.NativeXLocalStorage.staticSetup = function () {
    if (oFF.XSystemUtils.isBrowser()) {
      //localStorage only available in browser
      oFF.XLocalStorage.setInstance(new oFF.NativeXLocalStorage());
    }
  };

  oFF.NativeXLocalStorage.releaseObject = function () {
    oFF.XLocalStorage.prototype.releaseObject.call(this);
  }; //==============================================================


  oFF.NativeXLocalStorage.prototype.getStringByKey = function (name) {
    return localStorage.getItem(name);
  };

  oFF.NativeXLocalStorage.prototype.getStringByKeyExt = function (name, defaultValue) {
    if (!this.containsKey(name)) {
      return defaultValue;
    }

    return this.getStringByKey(name);
  };

  oFF.NativeXLocalStorage.prototype.putString = function (name, value) {
    localStorage.setItem(name, value);
  }; //==============================================================


  oFF.NativeXLocalStorage.prototype.getBooleanByKey = function (name) {
    return localStorage.getItem(name) === "true";
  };

  oFF.NativeXLocalStorage.prototype.getBooleanByKeyExt = function (name, defaultValue) {
    if (!this.containsKey(name)) {
      return defaultValue;
    }

    return this.getBooleanByKey(name);
  };

  oFF.NativeXLocalStorage.prototype.putBoolean = function (name, value) {
    localStorage.setItem(name, value);
  }; //==============================================================


  oFF.NativeXLocalStorage.prototype.getLongByKey = function (name) {
    return parseInt(localStorage.getItem(name));
  };

  oFF.NativeXLocalStorage.prototype.getLongByKeyExt = function (name, defaultValue) {
    if (!this.containsKey(name)) {
      return defaultValue;
    }

    return this.getLongByKey(name);
  };

  oFF.NativeXLocalStorage.prototype.putLong = function (name, value) {
    localStorage.setItem(name, value);
  }; //==============================================================


  oFF.NativeXLocalStorage.prototype.getIntegerByKey = function (name) {
    return parseInt(localStorage.getItem(name), 10);
  };

  oFF.NativeXLocalStorage.prototype.getIntegerByKeyExt = function (name, defaultValue) {
    if (!this.containsKey(name)) {
      return defaultValue;
    }

    return this.getIntegerByKey(name);
  };

  oFF.NativeXLocalStorage.prototype.putInteger = function (name, value) {
    localStorage.setItem(name, value);
  };

  oFF.NativeXLocalStorage.prototype.getDoubleByKey = function (name) {
    return parseFloat(localStorage.getItem(name));
  };

  oFF.NativeXLocalStorage.prototype.getDoubleByKeyExt = function (name, defaultValue) {
    if (!this.containsKey(name)) {
      return defaultValue;
    }

    return this.getDoubleByKey(name);
  };

  oFF.NativeXLocalStorage.prototype.putDouble = function (name, value) {
    localStorage.setItem(name, value);
  }; //==============================================================


  oFF.NativeXLocalStorage.prototype.removeKey = function (key) {
    localStorage.removeItem(key);
  };

  oFF.NativeXLocalStorage.prototype.containsKey = function (key) {
    return localStorage.getItem(key) !== null && localStorage.getItem(key) !== undefined;
  };

  oFF.NativeXLocalStorage.prototype.clear = function () {
    localStorage.clear();
  };

  oFF.NativeXLocalStorage.prototype.getAllKeys = function () {
    var keyList = oFF.XListOfString.create();

    for (var key in localStorage) {
      keyList.add(key);
    }

    return keyList;
  };

  oFF.NativeXCacheProviderIdbOpenAction = function () {};

  oFF.NativeXCacheProviderIdbOpenAction.prototype = new oFF.SyncAction();
  oFF.NativeXCacheProviderIdbOpenAction.prototype._ff_c = "NativeXCacheProviderIdbOpenAction";
  oFF.NativeXCacheProviderIdbOpenAction.m_openReq = null;

  oFF.NativeXCacheProviderIdbOpenAction.createAndRun = function (syncType, listener, customIdentifier, cacheProvider) {
    var object = new oFF.NativeXCacheProviderIdbOpenAction();
    object.setupActionAndRun(syncType, listener, customIdentifier, cacheProvider);
    return object;
  };

  oFF.NativeXCacheProviderIdbOpenAction.prototype.processSynchronization = function (syncType) {
    var myself = this;
    var cp = this.getActionContext();
    this.setData(cp);
    var indexedDB = cp.getIDB();
    var openReq = indexedDB.open("ff_cache25", 25);

    openReq.onerror = function (event) {// console.log( "[ERROR] Firefly: Cannot open IndexedDB");
    };

    openReq.onupgradeneeded = function (event) {
      // console.log("[INFO] onupgradeneeded");
      var dbChange = event.target.result;

      if (dbChange !== null) {
        if (dbChange.objectStoreNames.contains("main") === false) {
          var os = dbChange.createObjectStore("main", {
            keyPath: ["namespace", "name"]
          });
          os.createIndex("namespace", "namespace", {
            unique: false
          });
          os.createIndex("name", "name", {
            unique: false
          });
          os.createIndex("value", "value", {
            unique: false
          });
        }
      }
    };

    openReq.onsuccess = function (event) {
      // console.log("[info] onsuccess");
      var activeDb = event.target.result;
      cp.setActiveDb(activeDb);
      myself.endSync();
    };

    return true;
  };

  oFF.NativeXCacheProviderIdbOpenAction.prototype.callListener = function (extResult, listener, data, customIdentifier) {
    listener.onCacheProviderOpen(extResult, data, customIdentifier);
  };

  oFF.NativeXCacheProviderIdbWriteAction = function () {};

  oFF.NativeXCacheProviderIdbWriteAction.prototype = new oFF.SyncAction();
  oFF.NativeXCacheProviderIdbWriteAction.prototype._ff_c = "NativeXCacheProviderIdbWriteAction";
  oFF.NativeXCacheProviderIdbWriteAction.prototype.m_namespace = null;
  oFF.NativeXCacheProviderIdbWriteAction.prototype.m_name = null;
  oFF.NativeXCacheProviderIdbWriteAction.prototype.m_content = null;
  oFF.NativeXCacheProviderIdbWriteAction.prototype.m_maxCount = 0;

  oFF.NativeXCacheProviderIdbWriteAction.createAndRun = function (syncType, listener, customIdentifier, cacheProvider, namespace, name, content, maxCount) {
    var object = new oFF.NativeXCacheProviderIdbWriteAction();
    object.m_namespace = namespace;
    object.m_name = name;
    object.m_content = content;
    object.setData(content);
    object.m_maxCount = maxCount;
    object.setupActionAndRun(syncType, listener, customIdentifier, cacheProvider);
    return object;
  };

  oFF.NativeXCacheProviderIdbWriteAction.prototype.processSynchronization = function (syncType) {
    var myself = this;
    var stringValue = this.m_content.getString();
    var cacheProvider = this.getActionContext();
    var activeDb = cacheProvider.getActiveDb();
    var transaction = activeDb.transaction(["main"], "readwrite");
    var store = transaction.objectStore("main");
    var request = store.add({
      namespace: this.m_namespace,
      name: this.m_name,
      value: stringValue
    });

    request.onsuccess = function (event) {
      console.log("The data has been written successfully");
      cacheProvider.incWriteHit(myself.m_namespace);
      myself.endSync();
    };

    request.onerror = function (event) {
      console.log("The data has been written failed");
      myself.endSync();
    };

    return true;
  };

  oFF.NativeXCacheProviderIdbWriteAction.prototype.callListener = function (extResult, listener, data, customIdentifier) {
    listener.onCacheWrite(extResult, data, customIdentifier);
  };

  oFF.NativeXCacheProviderIdbReadAction = function () {};

  oFF.NativeXCacheProviderIdbReadAction.prototype = new oFF.SyncAction();
  oFF.NativeXCacheProviderIdbReadAction.prototype._ff_c = "NativeXCacheProviderIdbReadAction";
  oFF.NativeXCacheProviderIdbReadAction.prototype.m_namespace = null;
  oFF.NativeXCacheProviderIdbReadAction.prototype.m_name = null;
  oFF.NativeXCacheProviderIdbReadAction.prototype.m_validityTime = 0;

  oFF.NativeXCacheProviderIdbReadAction.createAndRun = function (syncType, listener, customIdentifier, cacheProvider, namespace, name, validityTime) {
    var object = new oFF.NativeXCacheProviderIdbReadAction();
    object.m_namespace = namespace;
    object.m_name = name;
    object.m_validityTime = validityTime;
    object.setupActionAndRun(syncType, listener, customIdentifier, cacheProvider);
    return object;
  };

  oFF.NativeXCacheProviderIdbReadAction.prototype.processSynchronization = function (syncType) {
    var myself = this;
    var cacheProvider = this.getActionContext();
    var activeDb = cacheProvider.getActiveDb();
    var transaction = activeDb.transaction(["main"], "readwrite");
    var store = transaction.objectStore("main");
    var request = store.get([this.m_namespace, this.m_name]);

    request.onsuccess = function (event) {
      var result = event.target.result;

      if (result !== undefined) {
        var value = result.value;
        console.log("The data has been read successfully");
        cacheProvider.incHit(myself.m_namespace);
        var content = oFF.XContent.createStringContent(oFF.ContentType.TEXT, value);
        myself.setData(content);
      } else {
        cacheProvider.incMissedHit(myself.m_namespace);
        myself.addError("The data read has been failed");
      }

      myself.endSync();
    };

    request.onerror = function (event) {
      cacheProvider.incMissedHit(myself.m_namespace);
      myself.addError("The data read has been failed");
      myself.endSync();
    };

    return true;
  };

  oFF.NativeXCacheProviderIdbReadAction.prototype.callListener = function (extResult, listener, data, customIdentifier) {
    listener.onCacheRead(extResult, data, customIdentifier);
  };

  oFF.NativeXCacheProviderIdb = function () {
    oFF.DfXCacheProvider.call(this);
    this._ff_c = "NativeXCacheProviderIdb";
  };

  oFF.NativeXCacheProviderIdb.prototype = new oFF.DfXCacheProvider();
  oFF.NativeXCacheProviderIdb.m_indexedDB = null;
  oFF.NativeXCacheProviderIdb.m_activeDb = null;

  oFF.NativeXCacheProviderIdb.create = function (session) {
    var fs = new oFF.NativeXCacheProviderIdb();
    fs.setupSessionContext(session);
    return fs;
  };

  oFF.NativeXCacheProviderIdb.prototype.setupSessionContext = function (session) {
    oFF.DfXCacheProvider.prototype.setupSessionContext.call(this, session);
    var win = typeof window !== "undefined" ? window : {};
    this.m_indexedDB = win.indexedDB || win.mozIndexedDB || win.webkitIndexedDB || win.msIndexedDB;
  };

  oFF.NativeXCacheProviderIdb.prototype.processOpen = function (syncType, listener, customIdentifier) {
    return oFF.NativeXCacheProviderIdbOpenAction.createAndRun(syncType, listener, customIdentifier, this);
  };

  oFF.NativeXCacheProviderIdb.prototype.getPrefix = function () {
    return "";
  };

  oFF.NativeXCacheProviderIdb.prototype.writeStringToCache = function (namespace, name, stringValue, maxCount) {
    // this.s_writeCounter++;
    var request = this.m_activeDb.transaction(["main"], "readwrite").objectStore("main").add({
      namespace: namespace,
      name: name,
      value: stringValue
    });

    request.onsuccess = function (event) {
      console.log("The data has been written successfully");
    };

    request.onerror = function (event) {
      console.log("The data has been written failed");
    };
  };

  oFF.NativeXCacheProviderIdb.prototype.getStringByKey = function (name) {
    // return window.localStorage.getItem( name );
    return null;
  };

  oFF.NativeXCacheProviderIdb.prototype.clearCacheInternal = function (namespace) {// window.localStorage.clear();
  };

  oFF.NativeXCacheProviderIdb.prototype.getIDB = function () {
    return this.m_indexedDB;
  };

  oFF.NativeXCacheProviderIdb.prototype.setActiveDb = function (activeDb) {
    this.m_activeDb = activeDb;
  };

  oFF.NativeXCacheProviderIdb.prototype.getActiveDb = function () {
    return this.m_activeDb;
  };

  oFF.NativeXCacheProviderIdb.prototype.processWrite = function (syncType, listener, customIdentifier, namespace, name, content, maxCount) {
    return oFF.NativeXCacheProviderIdbWriteAction.createAndRun(syncType, listener, customIdentifier, this, namespace, name, content, maxCount);
  };

  oFF.NativeXCacheProviderIdb.prototype.processRead = function (syncType, listener, customIdentifier, namespace, name, validityTime) {
    return oFF.NativeXCacheProviderIdbReadAction.createAndRun(syncType, listener, customIdentifier, this, namespace, name, validityTime);
  };

  oFF.NativeXCacheProviderLs = function () {
    oFF.DfXCacheProvider.call(this);
    this._ff_c = "NativeXCacheProviderLs";
  };

  oFF.NativeXCacheProviderLs.prototype = new oFF.DfXCacheProvider();

  oFF.NativeXCacheProviderLs.create = function (session) {
    var fs = new oFF.NativeXCacheProviderLs();
    fs.setupSessionContext(session);
    return fs;
  };

  oFF.NativeXCacheProviderLs.prototype.getPrefix = function () {
    return "sap.ff";
  };

  oFF.NativeXCacheProviderLs.prototype.putString = function (name, stringValue) {
    try {
      window.localStorage.setItem(name, stringValue);
    } catch (e) {
      this.logError2("Error occured during cache writing: ", e.message);
    }
  };

  oFF.NativeXCacheProviderLs.prototype.getStringByKey = function (name) {
    return window.localStorage.getItem(name);
  };

  oFF.NativeXCacheProviderLs.prototype.clearCacheInternal = function (namespace) {
    window.localStorage.clear();
  };

  oFF.NativeXCacheProviderFactory = function () {
    oFF.XCacheProviderFactory.call(this);
    this._ff_c = "NativeXCacheProviderFactory";
  };

  oFF.NativeXCacheProviderFactory.prototype = new oFF.XCacheProviderFactory();

  oFF.NativeXCacheProviderFactory.staticSetup = function () {
    var win = typeof window !== "undefined" ? window : {};

    if (typeof win.localStorage !== "undefined") {
      var factory = new oFF.NativeXCacheProviderFactory();
      oFF.XCacheProviderFactory.registerFactory(oFF.XCacheProviderFactory.DRIVER_LOCAL_STORAGE, factory);
    }

    var indexedDB = win.indexedDB || win.mozIndexedDB || win.webkitIndexedDB || win.msIndexedDB;

    if (indexedDB !== "undefined" && indexedDB !== null) {
      oFF.XCacheProviderFactory.registerFactory(oFF.XCacheProviderFactory.DRIVER_INDEX_DB, factory);
    }
  };

  oFF.NativeXCacheProviderFactory.prototype.newDeviceCacheAccess = function (session, driverName) {
    var provider = null;

    if (driverName == oFF.XCacheProviderFactory.DRIVER_LOCAL_STORAGE) {
      provider = new oFF.NativeXCacheProviderLs.create(session);
    } else if (driverName == oFF.XCacheProviderFactory.DRIVER_INDEX_DB) {
      provider = new oFF.NativeXCacheProviderIdb.create(session);
    }

    return provider;
  };

  oFF.NativeXPeek = function () {
    oFF.XPeek.call(this);
    this._ff_c = "NativeXPeek";
  };

  oFF.NativeXPeek.prototype = new oFF.XPeek();

  oFF.NativeXPeek.staticSetup = function () {
    if (typeof document !== "undefined") {
      var factory = new oFF.NativeXPeek();
      oFF.XPeek.setInstance(factory);
    }
  };

  oFF.NativeXPeek.prototype.retrieveContent = function (storage, key) {
    var content = null; // IXContent 

    var doc = typeof document !== "undefined" ? document : {};
    var iframe = document.getElementById(key);
    var iframeDoc = iframe.contentDocument || iframe.contentWindow.document; // Check if loading is complete

    if (iframeDoc.readyState == "complete") {
      var theText = iframeDoc.body.innerText;
      content = oFF.XContent.createStringContent(oFF.ContentType.TEXT, theText);
    }

    return content;
  };

  oFF.NativeSqlOpenAction = function () {};

  oFF.NativeSqlOpenAction.prototype = new oFF.SyncAction();
  oFF.NativeSqlOpenAction.prototype._ff_c = "NativeSqlOpenAction";
  oFF.NativeSqlOpenAction.m_openReq = null;

  oFF.NativeSqlOpenAction.createAndRun = function (driver, syncType, listener, customIdentifier, session) {
    var object = new oFF.NativeSqlOpenAction();
    object.m_driver = driver;
    object.setupActionAndRun(syncType, listener, customIdentifier, session);
    return object;
  };

  oFF.NativeSqlOpenAction.initSqlJs = function (config, success, failure) {
    if (typeof window.initSqlJs === "function") {
      return window.initSqlJs(config).then(success)["catch"](failure);
    }

    var importScript = function importScript(src, then) {
      var script = document.createElement("script");
      script.src = src;
      script.crossOrigin = "anonymous";

      if (typeof then === "function") {
        script.onload = then;
      }

      document.getElementsByTagName("head")[0].appendChild(script);
    };

    importScript(config.locateFile("sql-wasm.min.js"), function () {
      if (typeof window.initSqlJs !== "function") {
        failure("Failed to load sql.js");
      } else {
        window.initSqlJs(config).then(success)["catch"](failure);
      }
    });
  };

  oFF.NativeSqlOpenAction.prototype.processSynchronization = function () {
    this.setData(this.m_driver);
    var config = {
      locateFile: function locateFile(filename) {
        return "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.5.0/" + filename;
      }
    };
    var that = this.m_driver;

    if (that.m_SQL) {
      that.m_db = new that.m_SQL.Database();
      return false;
    } else {
      var myself = this;
      oFF.NativeSqlOpenAction.initSqlJs(config, function (SQL) {
        that.m_SQL = SQL;
        that.m_db = new that.m_SQL.Database();
        myself.endSync();
      }, function (message) {
        that.addError(0, message !== undefined ? message.toString() : "Unknown error during sql.js init");
      });
      return true;
    }
  };

  oFF.NativeSqlOpenAction.prototype.callListener = function (extResult, listener, data, customIdentifier) {
    listener.onOpened(extResult, data, customIdentifier);
  };

  oFF.NativeSqlRsMetaData = function () {
    oFF.MessageManager.call(this);
    this._ff_c = "NativeSqlRsMetaData";
  };

  oFF.NativeSqlRsMetaData.prototype = new oFF.DfSqlRsMetaData();

  oFF.NativeSqlRsMetaData.create = function (result) {
    var obj = new oFF.NativeSqlRsMetaData();
    obj.m_columns = [];

    for (var i = 0; i < result.length; i++) {
      for (var j = 0; j < result[i].columns.length; j++) {
        var res = i === 0;

        if (!res) {
          var cur = result[i].columns[j];

          for (var l = 0; l < obj.m_columns.length; l++) {
            if (obj.m_columns[l] === cur) {
              res = true;
              break;
            }
          }
        }

        if (res) {
          var type = null;

          for (var k = 0; k < result[i].values.length; k++) {
            var val = result[i].values[k][j];

            if (val !== null) {
              var ctype = _typeof(val);

              if (type === null) {
                type = ctype;
              } else if (type !== ctype) {
                type = "string";
              }
            }
          }

          obj.m_columns.push({
            name: result[i].columns[j],
            type: type
          });
        }
      }
    }

    return obj;
  };

  oFF.NativeSqlRsMetaData.prototype.get = function (i) {
    return this.m_columns[i].name;
  };

  oFF.NativeSqlRsMetaData.prototype.hasElements = function () {
    return this.m_columns.length !== 0;
  };

  oFF.NativeSqlRsMetaData.prototype.isEmpty = function () {
    return this.m_columns.length === 0;
  };

  oFF.NativeSqlRsMetaData.prototype.size = function () {
    return this.m_columns.length;
  };

  oFF.NativeSqlRsMetaData.prototype.getType = function (i) {
    switch (this.m_columns[i].type) {
      case "string":
        return oFF.SqlResultSetType.STRING;

      case "number":
        return oFF.SqlResultSetType.DOUBLE;

      case "boolean":
        return oFF.SqlResultSetType.BOOLEAN;

      default:
        return oFF.SqlResultSetType.THE_NULL;
    }
  };

  oFF.NativeSqlResultSet = function () {
    this._ff_c = "NativeSqlResultSet";
  };

  oFF.NativeSqlResultSet.prototype = new oFF.DfSqlResultSet();

  oFF.NativeSqlResultSet.create = function (result) {
    var obj = new oFF.NativeSqlResultSet();
    obj.m_result = result;
    obj.m_i = -1;
    obj.m_j = -1;
    return obj;
  };

  oFF.NativeSqlResultSet.prototype.next = function () {
    if (this.m_i === -1 && ++this.m_j >= this.m_result.length) {
      return false;
    }

    if (++this.m_i >= this.m_result[this.m_j].values.length) {
      this.m_i = -1;
      return this.next();
    }

    return true;
  };

  oFF.NativeSqlResultSet.prototype.getByKey = function (key, type) {
    var i = this.m_result[this.m_j].columns.indexOf(key);
    return i === -1 ? null : this.getAt(key, type);
  };

  oFF.NativeSqlResultSet.prototype.getAt = function (i, type) {
    var res = this.m_result[this.m_j].values[this.m_i][i];
    return !type || _typeof(res) === type ? res : null;
  };

  oFF.NativeSqlResultSet.prototype.getStringByKeyExt = function (key, def) {
    var res = this.getByKey(key);
    return res === null ? def : res.toString();
  };

  oFF.NativeSqlResultSet.prototype.getStringByKey = function (key) {
    var res = this.getByKey(key);
    return res === null ? null : res.toString();
  };

  oFF.NativeSqlResultSet.prototype.getIntegerByKeyExt = function (key, def) {
    var res = this.getByKey(key, 'number');
    return res !== null && Math.trunc(res) === res ? res : def;
  };

  oFF.NativeSqlResultSet.prototype.getIntegerByKey = function (key) {
    return this.getIntegerByKeyExt(key, 0);
  };

  oFF.NativeSqlResultSet.prototype.getLongByKeyExt = oFF.NativeSqlResultSet.prototype.getIntegerByKeyExt;
  oFF.NativeSqlResultSet.prototype.getLongByKey = oFF.NativeSqlResultSet.prototype.getIntegerByKey;

  oFF.NativeSqlResultSet.prototype.getDoubleByKeyExt = function (key, def) {
    var res = this.getByKey(key, 'number');
    return res === null ? def : res;
  };

  oFF.NativeSqlResultSet.prototype.getDoubleByKey = function (key) {
    return this.getDoubleByKeyExt(key, 0);
  };

  oFF.NativeSqlResultSet.prototype.getBooleanByKeyExt = function (key, def) {
    var res = this.getByKey(key, 'boolean');
    return res === null ? def : res;
  };

  oFF.NativeSqlResultSet.prototype.getBooleanByKey = function (key) {
    return this.getBooleanByKeyExt(key, false);
  };

  oFF.NativeSqlResultSet.prototype.getStringAtExt = function (key, def) {
    var res = this.getAt(key);
    return res === null ? def : res.toString();
  };

  oFF.NativeSqlResultSet.prototype.getStringAt = function (key) {
    return this.getStringAtExt(key, null);
  };

  oFF.NativeSqlResultSet.prototype.getIntegerAtExt = function (key, def) {
    var res = this.getAt(key, 'number');
    return res !== null && Math.trunc(res) === res ? res : def;
  };

  oFF.NativeSqlResultSet.prototype.getIntegerAt = function (key) {
    return this.getIntegerAtExt(key, 0);
  };

  oFF.NativeSqlResultSet.prototype.getLongAtExt = oFF.NativeSqlResultSet.prototype.getIntegerAtExt;
  oFF.NativeSqlResultSet.prototype.getLongAt = oFF.NativeSqlResultSet.prototype.getIntegerAt;

  oFF.NativeSqlResultSet.prototype.getDoubleAtExt = function (key, def) {
    var res = this.getAt(key, 'number');
    return res === null ? def : res;
  };

  oFF.NativeSqlResultSet.prototype.getDoubleAt = function (key) {
    return this.getDoubleAtExt(key, 0);
  };

  oFF.NativeSqlResultSet.prototype.getBooleanAtExt = function (key, def) {
    var res = this.getAt(key, 'boolean');
    return res === null ? def : res;
  };

  oFF.NativeSqlResultSet.prototype.getBooleanAt = function (key) {
    return this.getBooleanAtExt(key, false);
  };

  oFF.NativeSqlResultSet.prototype.hasNullByKey = function (key) {
    var i = this.m_result[this.m_j].columns.indexOf(key);
    return this.m_result[this.m_j].values[this.m_i][i] === null;
  };

  oFF.NativeSqlResultSet.prototype.getMetaData = function () {
    return oFF.NativeSqlRsMetaData.create(this.m_result);
  };

  oFF.NativeSqlDriver = function () {
    oFF.MessageManager.call(this);
    this._ff_c = "NativeSqlDriver";
  };

  oFF.NativeSqlDriver.prototype = new oFF.MessageManager();

  oFF.NativeSqlDriver.create = function (driverName) {
    var driver = new oFF.NativeSqlDriver();
    driver.setupDriver(driverName);
    return driver;
  };

  oFF.NativeSqlDriver.prototype.setupDriver = function () {
    oFF.MessageManager.prototype.setupSessionContext.call(this);
  };

  oFF.NativeSqlDriver.prototype.open = function (uri) {
    this.m_connectionUri = uri;

    if (this.m_SQL) {
      this.m_db = new this.m_SQL.Database();
    } else {
      this.addError(0, "Synchronious open is not supported by sql.js");
    }
  };

  oFF.NativeSqlDriver.prototype.processOpen = function (syncType, listener, customIdentifier, uri) {
    this.m_connectionUri = uri;
    return oFF.NativeSqlOpenAction.createAndRun(this, syncType, listener, customIdentifier, this.getSession());
  };

  oFF.NativeSqlDriver.prototype.openExt = oFF.NativeSqlDriver.prototype.openExt;
  oFF.NativeSqlDriver.prototype.processOpenExt = oFF.NativeSqlDriver.prototype.processOpen;

  oFF.NativeSqlDriver.prototype.close = function () {};

  oFF.NativeSqlDriver.prototype.executeUpdate = function (sql) {
    try {
      this.m_db.run(sql);
    } catch (e) {
      this.addError(0, e.message);
    }
  };

  oFF.NativeSqlDriver.prototype.executeQuery = function (sql) {
    try {
      var result = this.m_db.exec(sql);
      return oFF.NativeSqlResultSet.create(result);
    } catch (e) {
      this.addError(0, e.message);
    }

    return null;
  };

  oFF.NativeSqlDriver.prototype.getConnection = function () {
    return this.m_connectionUri;
  };

  oFF.NativeSqlDriver.prototype.processExecuteUpdate = function (syncType, listener, customIdentifier, sql) {
    return oFF.SqlSynchroniousUpdateAction.createAndRun(oFF.XIntegerValue.create(this.executeUpdate(sql)), syncType, listener, customIdentifier, this.getSession());
  };

  oFF.NativeSqlDriver.prototype.processExecuteQuery = function (syncType, listener, customIdentifier, sql) {
    return oFF.SqlSynchroniousQueryAction.createAndRun(this.executeQuery(sql), syncType, listener, customIdentifier, this.getSession());
  };

  oFF.NativeSqlDriver.prototype.processGetSchemas = function (syncType, listener, customIdentifier) {
    this.addError(0, "Not supported");
    return oFF.SqlSynchroniousQueryAction.createAndRun(null, syncType, listener, customIdentifier, this.getSession());
  };

  oFF.NativeSqlDriver.prototype.processGetTables = function (syncType, listener, customIdentifier) {
    this.addError(0, "Not supported");
    return oFF.SqlSynchroniousQueryAction.createAndRun(null, syncType, listener, customIdentifier, this.getSession());
  };

  oFF.NativeSqlDriver.prototype.processGetColumns = function (syncType, listener, customIdentifier) {
    this.addError(0, "Not supported");
    return oFF.SqlSynchroniousQueryAction.createAndRun(null, syncType, listener, customIdentifier, this.getSession());
  };

  oFF.NativeSqlDriver.prototype.processGetImportedKeys = function (syncType, listener, customIdentifier) {
    this.addError(0, "Not supported");
    return oFF.SqlSynchroniousQueryAction.createAndRun(null, syncType, listener, customIdentifier, this.getSession());
  };

  oFF.NativeSqlDriverFactory = function () {
    oFF.HttpClientFactory.call(this);
    this._ff_c = "NativeSqlDriverFactory";
  };

  oFF.NativeSqlDriverFactory.prototype = new oFF.SqlDriverFactory();

  oFF.NativeSqlDriverFactory.staticSetup = function () {
    var factory = new oFF.NativeSqlDriverFactory();
    oFF.SqlDriverFactory.registerFactory(factory);
  };

  oFF.NativeSqlDriverFactory.prototype.newSqlDriver = function (drivername) {
    return oFF.NativeSqlDriver.create(drivername);
  }; /// <summary>Initializer for static constants.</summary>


  oFF.IoNativeModule = function () {
    oFF.DfModule.call(this);
    this._ff_c = "IoNativeModule";
  };

  oFF.IoNativeModule.prototype = new oFF.DfModule();
  oFF.IoNativeModule.s_module = null;

  oFF.IoNativeModule.getInstance = function () {
    var oNativeModule = oFF.IoNativeModule;

    if (oNativeModule.s_module === null) {
      if (oFF.IoModule.getInstance() === null) {
        throw new Error("Initialization Exception");
      }

      oNativeModule.s_module = oFF.DfModule.startExt(new oFF.IoNativeModule());
      oFF.NativeNetworkEnv.staticSetup();
      oFF.NativeDispatcher.staticSetup();
      oFF.NativeHttpClientFactory.staticSetup();
      oFF.NativeXLocalStorage.staticSetup();
      oFF.NativeXCacheProviderFactory.staticSetup();
      oFF.NativeSqlDriverFactory.staticSetup();
      oFF.NativeDocumentEnv.staticSetup();
      oFF.NativeXPeek.staticSetup();
      oFF.NativeSamlUtils.staticSetup();

      if (oFF.XSystemUtils.isNode()) {
        oFF.userSession = {};
        oFF.NativeXFileSystem.staticSetup();
        oFF.NativeXFileSystemOSFactory.staticSetup();
      }

      oFF.DfModule.stopExt(oNativeModule.s_module);
    }

    return oNativeModule.s_module;
  };

  oFF.IoNativeModule.prototype.getName = function () {
    return "ff0210.io.native";
  };

  oFF.IoNativeModule.getInstance();
  return sap.firefly;
});