/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */

/*global sap*/
sap.ui.define(["sap/sac/df/firefly/ff0040.commons"], function (oFF) {
  "use strict";

  oFF.env = oFF.env || {};
  oFF.XSystemUtils = {
    s_environmentProperties: null,
    getSystemTimezoneOffsetInMilliseconds: function getSystemTimezoneOffsetInMilliseconds() {
      return new Date().getTimezoneOffset() * 60 * 1000 * -1;
    },
    getCurrentTimeInMilliseconds: function getCurrentTimeInMilliseconds() {
      // number of milliseconds since 1 January 1970 00:00:00 UTC
      return new Date().getTime();
    },
    waitMillis: function waitMillis(waitTimeInMillis) {
      if (waitTimeInMillis < 0) {
        throw new Error("Illegal Argument: illegal wait time");
      }

      var startTime = this.getCurrentTimeInMilliseconds();
      var currentTime = startTime;

      while (currentTime - startTime < waitTimeInMillis) {
        currentTime = this.getCurrentTimeInMilliseconds();
      }
    },
    processQueuedCallback: function processQueuedCallback(nativeQueue, callback) {
      if (nativeQueue === null) {
        throw new Error("Illegal Argument: illegal queue");
      }

      if (callback === null) {
        throw new Error("Illegal Argument: illegal callback");
      }

      nativeQueue.call("queued call", function (callbacks) {
        var nativeErrorCallback = callbacks.addErrback(function () {});
        var errorCallbackHandle = oFF.QueuedCallbackProcessorHandle.create(nativeErrorCallback, true);
        setTimeout(function () {
          callback.processCallback(errorCallbackHandle);
        }, 0);
        var nativeCallback = callbacks.add(function () {});
        var callbackHandle = oFF.QueuedCallbackProcessorHandle.create(nativeCallback, false);
        setTimeout(function () {
          callback.processCallback(callbackHandle);
        }, 0);
      });
      return true;
    },
    sleepMillisNonBlocking: function sleepMillisNonBlocking(sleepTimeInMillis, callback, customIdentifier) {
      if (sleepTimeInMillis < 0) {
        throw new Error("Illegal Argument: illegal sleep time");
      }

      if (callback === null) {
        throw new Error("Illegal Argument: illegal callback");
      }

      setTimeout(function () {
        callback.processCallback(customIdentifier);
      }, sleepTimeInMillis);
      return true;
    },
    getNativeEnvironment: function getNativeEnvironment() {
      var oSystemUtils = oFF.XSystemUtils;
      var map;

      if (this.isNode()) {
        // Node.js
        map = oSystemUtils.getNativeEnvironmentNodeJs();
      } else if (this.isBrowser()) {
        // browser
        map = oSystemUtils.getNativeEnvironmentBrowser();
      } else {
        map = oFF.XHashMapOfStringByString.create();
      }

      oSystemUtils.addWiredEnvironment(map);
      return map;
    },
    getNativeEnvironmentBrowser: function getNativeEnvironmentBrowser() {
      var map = oFF.XHashMapOfStringByString.create();
      var search = new RegExp("([^&=]+)=?([^&]*)", "g");

      var decode = function decode(s) {
        return decodeURIComponent(s.replace(/[+]/g, " "));
      };

      var query = window.location.search.substring(1);
      var match;
      var shouldContinue = true;

      while (shouldContinue) {
        match = search.exec(query);

        if (match === null) {
          break;
        }

        map.put(decode(match[1]), decode(match[2]));
      }

      return map;
    },
    getNativeEnvironmentNodeJs: function getNativeEnvironmentNodeJs() {
      var oPrUtils = oFF.PrUtils;
      var parameters = oFF.XHashMapOfStringByString.create(); // eslint-disable-next-line no-undef

      var json = process.env;
      var jsonElementVariables = oFF.XJson.extractJsonContent(json);
      var jsonStructureVariables = oFF.PrStructure.createDeepCopy(jsonElementVariables);
      var variableNames = jsonStructureVariables.getKeysAsReadOnlyListOfString();

      if (variableNames !== null) {
        var len = variableNames.size();

        for (var variableIndex = 0; variableIndex < len; variableIndex++) {
          var variableName = variableNames.get(variableIndex);
          var variableValueString = oPrUtils.getStringProperty(jsonStructureVariables, variableName);

          if (variableValueString !== null) {
            parameters.put(variableName, variableValueString.getString());
          }
        }
      } // eslint-disable-next-line no-undef


      process.argv.forEach(function (val) {
        var argument = val;
        var argumentSeparatorIndex = argument.indexOf("=");
        var argumentName;
        var argumentValue; // node arguments

        if (argumentSeparatorIndex > -1) {
          argumentName = argument.substring(0, argumentSeparatorIndex);
          argumentValue = argument.substring(argumentSeparatorIndex + 1, argument.length);
          parameters.put(argumentName, argumentValue);
        }
      });
      return parameters;
    },
    addWiredEnvironment: function addWiredEnvironment(map) {
      var oFireflyEnv = oFF.env;

      for (var key in oFireflyEnv) {
        if (oFireflyEnv.hasOwnProperty(key)) {
          map.put(key, oFireflyEnv[key]);
        }
      }
    },
    isNode: function isNode() {
      if (this.isNodeDetected === undefined) {
        try {
          // eslint-disable-next-line no-undef
          this.isNodeDetected = Object.prototype.toString.call(typeof process !== "undefined" ? process : 0) === "[object process]";
        } catch (e) {
          this.isNodeDetected = false;
        }
      }

      return this.isNodeDetected;
    },
    isXS: function isXS() {
      if (this.isXSDetected === undefined) {
        try {
          this.isXSDetected = typeof $ !== "undefined" && $.db && $.db.ina && $.trace;
        } catch (e) {
          this.isXSDetected = false;
        }
      }

      return this.isXSDetected;
    },
    isBrowser: function isBrowser() {
      return typeof window !== "undefined" && window.location !== undefined && window.location.search !== undefined;
    },
    isGoogleAppsScript: function isGoogleAppsScript() {
      return oFF.GoogleUrlFetchApp !== undefined;
    },
    exit: function exit(exitCode) {
      if (oFF.XSystemUtils.isNode()) {
        // eslint-disable-next-line no-undef
        process.exit(exitCode);
      }
    },
    getOsName: function getOsName() {
      if (oFF.XSystemUtils.isNode()) {
        return require("os").release();
      } else if (oFF.XSystemUtils.isXS()) {
        return "XS";
      } else if (oFF.XSystemUtils.isGoogleAppsScript()) {
        return "Google Apps";
      }

      var os = "Unknown";
      var userAgent = window.navigator.userAgent;

      if (userAgent.indexOf("Windows NT 10.0") !== -1) {
        os = "Windows 10";
      } else if (userAgent.indexOf("Mac") !== -1) {
        os = "Mac/iOS";
      } else if (userAgent.indexOf("Linux") !== -1) {
        os = "Linux";
      } else if (userAgent.indexOf("X11") !== -1) {
        os = "UNIX";
      } else if (userAgent.indexOf("Windows NT 5.1") !== -1) {
        os = "Windows XP";
      } else if (userAgent.indexOf("Windows NT 6.0") !== -1) {
        os = "Windows Vista";
      } else if (userAgent.indexOf("Windows NT 6.1") !== -1) {
        os = "Windows 7";
      } else if (userAgent.indexOf("Windows NT 6.2") !== -1) {
        os = "Windows 8";
      } else {
        os = "Other";
      }

      return os;
    }
  };
  oFF.XErrorHelper = {
    convertToString: function convertToString(error) {
      var sb = new oFF.XStringBuffer();

      if (error.hasCode()) {
        sb.append(error.getCode().toString()).appendNewLine();
      }

      var errorText = error.getText();

      if (errorText !== null) {
        sb.append(errorText).appendNewLine();
      }

      if (error.hasErrorCause()) {
        sb.append(error.getErrorCause().toString()).appendNewLine();
      }

      if (error.hasStackTrace()) {
        sb.append(error.getStackTrace().toString()).appendNewLine();
      }

      if (error.hasExtendedInfo()) {
        sb.append("Error with extended info").appendNewLine();
      }

      return sb.toString();
    },
    convertExceptionToString: function convertExceptionToString(throwable) {
      var sb = new oFF.XStringBuffer();

      if (throwable !== null) {
        if (typeof throwable.toString === "function") {
          sb.append(throwable.toString()).appendNewLine();
        }

        var json = JSON.stringify(throwable);

        if ("{}" !== json) {
          sb.append(json);
          sb.appendNewLine();
        }
      }

      return sb.toString();
    }
  };

  oFF.XStackTrace = function () {
    this.m_traces = new oFF.XListOfString();
    this._ff_c = "XStackTrace";
  };

  oFF.XStackTrace.prototype = new oFF.XObject();

  oFF.XStackTrace.create = function (removeLineCount) {
    var newError = new Error();
    var stackArray = newError.stack.split("\n");
    var len = stackArray.length;

    if (len > 1) {
      var newObj = new oFF.XStackTrace();

      if (len - 1 - removeLineCount > 0) {
        for (var i = 1 + removeLineCount; i < len; i++) {
          newObj.m_traces.add(stackArray[i].trim());
        }
      }

      return newObj;
    }
  };

  oFF.XStackTrace.supportsStackTrace = function () {
    // Error.prototype.stack does not exist in IE
    return false;
  };

  oFF.XStackTrace.prototype.releaseObject = function () {
    this.m_traces = oFF.XObjectExt.release(this.m_traces);
    oFF.XStackTrace.$superclass.releaseObject.call(this);
  };

  oFF.XStackTrace.prototype.getStackTraceLines = function () {
    return this.m_traces.getValuesAsReadOnlyListOfString();
  };

  oFF.XStackTrace.prototype.toString = function () {
    return "";
  };
  /**
  * Standard i/o.
   */


  oFF.XNativeStdio = function () {};

  oFF.XNativeStdio.prototype = new oFF.DfStdio();
  /**
  * Static setup.
   */

  oFF.XNativeStdio.staticSetup = function () {
    oFF.XStdio.setInstance(new oFF.XNativeStdio());
  };

  oFF.XNativeStdio.prototype.println = function (text) {
    if (oFF.XSystemUtils.isXS()) {
      // XSJS
      $.trace.debug("Firefly: " + text);
    } else if (typeof sap.ff !== "undefined" && sap.ff.ui5.Log) {
      sap.ff.ui5.Log.info(text);
    } else if (console) {
      // Workaround fo sapui5 eslist
      var tempConsole = console; // Node.js && Browser

      tempConsole.log(text);
    }
  };

  oFF.XNativeStdio.prototype.print = function (text) {};

  oFF.Base64 = {
    s_keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    encode: function encode(input) {
      var win = typeof window !== "undefined" ? window : {};

      if (typeof win.btoa !== "undefined") {
        //we need to escape for unicode
        return win.btoa(encodeURIComponent(input).replace(/%([0-9A-F]{2})/g, function (match, p1) {
          return String.fromCharCode("0x" + p1);
        }));
      } //XS-Engine


      var output = "";
      var i = 0;
      var keyStr = oFF.Base64.s_keyStr;

      do {
        var chr1 = input.charCodeAt(i++);
        var chr2 = input.charCodeAt(i++);
        var chr3 = input.charCodeAt(i++);
        var enc1 = chr1 >> 2;
        var enc2 = (chr1 & 3) << 4 | chr2 >> 4;
        var enc3 = (chr2 & 15) << 2 | chr3 >> 6;
        var enc4 = chr3 & 63;

        if (isNaN(chr2)) {
          enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
          enc4 = 64;
        }

        output += keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
      } while (i < input.length);

      return output;
    }
  };
  /** HTTP utilities. */

  oFF.XHttpUtils = {
    s_reg1: new RegExp("[\\\\]", "g"),
    // .replace(/[\\]/g, "\\\\")
    s_reg2: new RegExp("[\\\"]", "g"),
    // .replace(/[\"]/g, "\\\"")
    s_reg3: new RegExp("[\\/]", "g"),
    // .replace(/[\/]/g, "\\/")
    s_reg4: new RegExp("[\\b]", "g"),
    // .replace(/[\b]/g, "\\b")
    s_reg5: new RegExp("[\\f]", "g"),
    // .replace(/[\f]/g, "\\f")
    s_reg6: new RegExp("[\\n]", "g"),
    // .replace(/[\n]/g, "\\n")
    s_reg7: new RegExp("[\\r]", "g"),
    // .replace(/[\r]/g, "\\r")
    s_reg8: new RegExp("[\\t]", "g"),
    // .replace(/[\t]/g, "\\t");

    /**
     * Escape a URL.
     * @param unescaped the non-escaped URL.
     * @return the escaped URL.
     */
    encodeURIComponent: function (_encodeURIComponent) {
      function encodeURIComponent(_x) {
        return _encodeURIComponent.apply(this, arguments);
      }

      encodeURIComponent.toString = function () {
        return _encodeURIComponent.toString();
      };

      return encodeURIComponent;
    }(function (unescaped) {
      return encodeURIComponent(unescaped);
    }),

    /**
     * Unescape a URL.
     * @param escaped the escaped URL.
     * @return the non-escaped URL.
     */
    decodeURIComponent: function (_decodeURIComponent) {
      function decodeURIComponent(_x2) {
        return _decodeURIComponent.apply(this, arguments);
      }

      decodeURIComponent.toString = function () {
        return _decodeURIComponent.toString();
      };

      return decodeURIComponent;
    }(function (escaped) {
      return decodeURIComponent(escaped);
    }),

    /**
     * Encode byte array to base 64 string.
     * @param byteArray a byte array.
     * @return the base 64 encoded string.
     */
    encodeByteArrayToBase64: function encodeByteArrayToBase64(byteArray) {
      var nativeString = oFF.XByteArray.convertToString(byteArray);
      var encodedString; // eslint-disable-next-line no-undef

      if (typeof Buffer !== "undefined" && typeof module !== "undefined" && this.module !== module && module.exports) {
        // Node.js
        // eslint-disable-next-line no-undef
        encodedString = new Buffer(nativeString, "utf8").toString("base64");
      } else if (typeof window !== "undefined") {
        // browser
        encodedString = window.btoa(oFF.XString.utf8Encode(nativeString));
      }

      return encodedString;
    },

    /**
     * Decode base 64 string to byte array.
     * @param base64 a base 64 encoded string.
     * @return the byte array.
     */
    decodeBase64ToByteArray: function decodeBase64ToByteArray(base64) {
      var decodedString = ""; // eslint-disable-next-line no-undef

      if (typeof Buffer !== "undefined" && typeof module !== "undefined" && this.module !== module && module.exports) {
        // Node.js
        // eslint-disable-next-line no-undef
        decodedString = new Buffer(base64, "base64").toString();
      } else if (typeof window !== "undefined") {
        // browser
        decodedString = oFF.XString.utf8Decode(window.atob(base64));
      }

      return oFF.XByteArray.convertFromString(decodedString);
    },

    /**
     * Escape the json string
     * @param value the unescape json string
     * @return the escaped json string
     */
    escapeToJsonString: function escapeToJsonString(value) {
      var ref = oFF.XHttpUtils;

      if (value.indexOf("\\") !== -1) {
        value = value.replace(ref.s_reg1, "\\\\");
      }

      if (value.indexOf("\"") !== -1) {
        value = value.replace(ref.s_reg2, "\\\"");
      }

      if (value.indexOf("/") !== -1) {
        value = value.replace(ref.s_reg3, "\\/");
      }

      if (value.indexOf("\b") !== -1) {
        value = value.replace(ref.s_reg4, "\\b");
      }

      if (value.indexOf("\f") !== -1) {
        value = value.replace(ref.s_reg5, "\\f");
      }

      if (value.indexOf("\n") !== -1) {
        value = value.replace(ref.s_reg6, "\\n");
      }

      if (value.indexOf("\r") !== -1) {
        value = value.replace(ref.s_reg7, "\\r");
      }

      if (value.indexOf("\t") !== -1) {
        value = value.replace(ref.s_reg8, "\\t");
      }

      return value;
    }
  };
  oFF.XStringTokenizer = {
    splitString: function splitString(string, _splitString) {
      if (string === null || _splitString === null) {
        return null;
      }

      var splittedStrings = string.split(_splitString);

      if (splittedStrings === null) {
        return null;
      }

      return new oFF.XListOfString(splittedStrings);
    }
  };
  oFF.XGuid = {
    getGuid: function getGuid() {
      var S4 = function S4() {
        return ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
      };

      return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
    }
  };
  /** SHA1 utility. */

  oFF.XSha1 = {
    /**
     *  Secure Hash Algorithm (SHA1)
     **/
    createSHA1: function createSHA1(text) {
      if (text === null) {
        return null;
      }

      var blockstart;
      var i;
      var W = [];
      var H0 = 0x67452301;
      var H1 = 0xEFCDAB89;
      var H2 = 0x98BADCFE;
      var H3 = 0x10325476;
      var H4 = 0xC3D2E1F0;
      var A, B, C, D, E;
      var temp;
      var XSha1 = oFF.XSha1;
      var fnRotateLeft = XSha1.rotateLeft;
      var fnCvtHex = XSha1.cvtHex;
      var msg = oFF.XString.utf8Encode(text);
      var msgLen = msg.length;
      var wordArray = [];

      for (i = 0; i < msgLen - 3; i += 4) {
        wordArray.push(msg.charCodeAt(i) << 24 | msg.charCodeAt(i + 1) << 16 | msg.charCodeAt(i + 2) << 8 | msg.charCodeAt(i + 3));
      }

      switch (msgLen % 4) {
        case 0:
          {
            wordArray.push(0x080000000);
            break;
          }

        case 1:
          {
            wordArray.push(msg.charCodeAt(msgLen - 1) << 24 | 0x0800000);
            break;
          }

        case 2:
          {
            wordArray.push(msg.charCodeAt(msgLen - 2) << 24 | msg.charCodeAt(msgLen - 1) << 16 | 0x08000);
            break;
          }

        default:
          {
            wordArray.push(msg.charCodeAt(msgLen - 3) << 24 | msg.charCodeAt(msgLen - 2) << 16 | msg.charCodeAt(msgLen - 1) << 8 | 0x80);
            break;
          }
      }

      while (wordArray.length % 16 !== 14) {
        wordArray.push(0);
      }

      wordArray.push(msgLen >>> 29);
      wordArray.push(msgLen << 3 & 0x0ffffffff);
      var wordArrayLen = wordArray.length;

      for (blockstart = 0; blockstart < wordArrayLen; blockstart += 16) {
        for (i = 0; i < 16; i++) {
          W[i] = wordArray[blockstart + i];
        }

        for (i = 16; i <= 79; i++) {
          W[i] = fnRotateLeft(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);
        }

        A = H0;
        B = H1;
        C = H2;
        D = H3;
        E = H4;

        for (i = 0; i <= 19; i++) {
          temp = fnRotateLeft(A, 5) + (B & C | ~B & D) + E + W[i] + 0x5A827999 & 0x0ffffffff;
          E = D;
          D = C;
          C = fnRotateLeft(B, 30);
          B = A;
          A = temp;
        }

        for (i = 20; i <= 39; i++) {
          temp = fnRotateLeft(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1 & 0x0ffffffff;
          E = D;
          D = C;
          C = fnRotateLeft(B, 30);
          B = A;
          A = temp;
        }

        for (i = 40; i <= 59; i++) {
          temp = fnRotateLeft(A, 5) + (B & C | B & D | C & D) + E + W[i] + 0x8F1BBCDC & 0x0ffffffff;
          E = D;
          D = C;
          C = fnRotateLeft(B, 30);
          B = A;
          A = temp;
        }

        for (i = 60; i <= 79; i++) {
          temp = fnRotateLeft(A, 5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6 & 0x0ffffffff;
          E = D;
          D = C;
          C = fnRotateLeft(B, 30);
          B = A;
          A = temp;
        }

        H0 = H0 + A & 0x0ffffffff;
        H1 = H1 + B & 0x0ffffffff;
        H2 = H2 + C & 0x0ffffffff;
        H3 = H3 + D & 0x0ffffffff;
        H4 = H4 + E & 0x0ffffffff;
      }

      return (fnCvtHex(H0) + fnCvtHex(H1) + fnCvtHex(H2) + fnCvtHex(H3) + fnCvtHex(H4)).toLowerCase();
    },
    cvtHex: function cvtHex(val) {
      var str = "";
      var i;
      var v;

      for (i = 7; i >= 0; i--) {
        v = val >>> i * 4 & 0x0f;
        str += v.toString(16);
      }

      return str;
    },
    rotateLeft: function rotateLeft(n, s) {
      return n << s | n >>> 32 - s;
    }
  };
  oFF.XReflection = {
    getMethods: function getMethods(clazz) {
      var list = oFF.XList.create();
      var currentTarget = clazz.getNativeElement();
      currentTarget = currentTarget.prototype;

      function addFunction(name) {
        // skip restricted property names
        if (name === "caller" || name === "callee" || name === "arguments") {
          return;
        }

        if (typeof currentTarget[name] === "function") {
          list.add(oFF.XMethod.create(name, oFF.XAccessModifier.PUBLIC));
        }
      }

      while (currentTarget) {
        Object.getOwnPropertyNames(currentTarget).forEach(addFunction);
        currentTarget = Object.getPrototypeOf(currentTarget);
      }

      return list;
    },
    getMembers: function getMembers() {
      return null;
    },
    invokeMethod: function invokeMethod(target, methodName) {
      var result = target[methodName]();
      return this.getBandungObject(result);
    },
    invokeMethodWithArgs: function invokeMethodWithArgs(target, methodName, args) {
      var paramValues = [];

      for (var i = 0; i < args.size(); i++) {
        paramValues.push(this.getNativeObject(args.get(i)));
      }

      var result = target[methodName].apply(target, paramValues);
      return this.getBandungObject(result);
    },
    getNativeObject: function getNativeObject(param) {
      var obj = param.getValue();

      if (obj !== null && obj !== undefined && param.isWrapped()) {
        if (obj instanceof oFF.XStringValue) {
          return obj.getString();
        }

        if (obj instanceof oFF.XDoubleValue) {
          return obj.getDouble();
        }

        if (obj instanceof oFF.XIntegerValue) {
          return obj.getInteger();
        }

        if (obj instanceof oFF.XBooleanValue) {
          return obj.getBoolean();
        }

        if (obj instanceof oFF.XLongValue) {
          return obj.getLong();
        }
      }

      return obj;
    },
    getBandungObject: function getBandungObject(obj) {
      if (typeof obj === "string") {
        return oFF.XReflectionParam.createString(obj);
      } else if (typeof obj === "boolean") {
        return oFF.XReflectionParam.createBoolean(obj);
      } else if (typeof obj === "number") {
        if (Number.isInteger(obj)) {
          return oFF.XReflectionParam.createInteger(obj);
        } else {
          return oFF.XReflectionParam.createDouble(obj);
        }
      } else {
        return oFF.XReflectionParam.create(obj);
      }
    }
  };

  oFF.XEncryption = function () {
    this._ff_c = "XEncryption";
  };

  oFF.XEncryption.prototype = new oFF.XObject();

  oFF.XEncryption.getEncryptionType = function () {
    return null;
  };

  oFF.XEncryption.encrypt = function (password, value) {
    return value;
  };

  oFF.XEncryption.decrypt = function (password, value) {
    return value;
  };

  oFF.CommonsNativeModule = function () {
    oFF.DfModule.call(this);
    this._ff_c = "CommonsNativeModule";
  };

  oFF.CommonsNativeModule.prototype = new oFF.DfModule();
  oFF.CommonsNativeModule.s_module = null;

  oFF.CommonsNativeModule.getInstance = function () {
    if (oFF.CommonsNativeModule.s_module === null) {
      if (oFF.CommonsModule.getInstance() === null) {
        throw new Error("Initialization Exception");
      }

      oFF.CommonsNativeModule.s_module = oFF.DfModule.startExt(new oFF.CommonsNativeModule());
      oFF.XNativeStdio.staticSetup();
      oFF.DfModule.stopExt(oFF.CommonsNativeModule.s_module);
    }

    return oFF.CommonsNativeModule.s_module;
  };

  oFF.CommonsNativeModule.prototype.getName = function () {
    return "ff0050.commons.native";
  };

  oFF.CommonsNativeModule.getInstance();
  return sap.firefly;
});