/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */

/*global sap*/
sap.ui.define([], function () {
  "use strict";

  var $Global;

  if (Object.prototype.toString.call(typeof process !== "undefined" ? process : 0) === "[object process]") {
    // node.js
    $Global = module.exports;
  } else if (typeof window !== "undefined") {
    // browser
    $Global = this;
  } else {
    // other environments
    $Global = $Global || {};
  } // create the global object sap to calm lint down


  var sap = sap || $Global.sap || {};

  if (!sap.firefly) {
    sap["firefly"] = {};
  } // Google Apps Script


  var UrlFetchApp = UrlFetchApp || undefined; // calm lint down

  if (typeof UrlFetchApp !== "undefined") {
    sap.firefly["GoogleUrlFetchApp"] = UrlFetchApp;
  }

  $Global.sap = sap;

  sap.firefly.isNull = function (o) {
    return o === null || o === undefined;
  };

  sap.firefly.notNull = function (o) {
    return o !== undefined && o !== null;
  };

  sap.firefly.noSupport = function () {
    throw new Error("Unsupported Operation Exception");
  };
  /** Default implementation for the root object.*/


  sap.firefly.XObject = function () {};

  sap.firefly.XObject.prototype = {
    _ff_c: "XObject",
    m_isReleased: false,
    setup: function setup() {
      this.m_isReleased = false;
    },
    releaseObject: function releaseObject() {
      this.m_isReleased = true;
    },
    destructor: function destructor() {},
    isReleaseLocked: function isReleaseLocked() {
      return false;
    },
    isReleased: function isReleased() {
      return this.m_isReleased;
    },
    addOwnership: function addOwnership() {},
    isEqualTo: function isEqualTo(other) {
      return this === other;
    },
    copyFrom: function copyFrom(other, flags) {},
    getObjectId: function getObjectId() {
      return null;
    },
    getClassName: function getClassName() {
      return this._ff_c;
    },
    compareTo: sap.firefly.noSupport,
    cloneExt: function cloneExt(flags) {},
    clone: function clone() {
      return this.cloneExt(null);
    },
    toString: function toString() {
      return "[???]";
    }
  };
  /**
   * Cast the given native object into a Firefly object.
   * @param object the native object.
   * @return the Firefly object.
   */

  sap.firefly.XObject.castFromNative = function (nativeObject) {
    return nativeObject;
  };
  /** Weak reference. */


  sap.firefly.XWeakReference = function (reference) {
    this.m_reference = reference;
    this._ff_c = "XWeakReference";
  };

  sap.firefly.XWeakReference.prototype = new sap.firefly.XObject();
  /**
   * Create a new weak reference.
   * @param reference a reference.
   * @return the new weak reference.
   */

  sap.firefly.XWeakReference.create = function (reference) {
    return new sap.firefly.XWeakReference(reference);
  };

  sap.firefly.XWeakReference.prototype.releaseObject = function () {
    this.m_reference = null;
    sap.firefly.XObject.prototype.releaseObject.call(this);
  };

  sap.firefly.XWeakReference.prototype.getReference = function () {
    return this.m_reference;
  };

  sap.firefly.XWeakReference.prototype.toString = function () {
    return this.m_reference && this.m_reference.toString();
  };
  /** Runtime Exception. */


  sap.firefly.XException = {
    createInitializationException: function createInitializationException() {
      return new Error("Initialization Exception");
    },
    createUnsupportedOperationException: sap.firefly.noSupport,
    createRuntimeException: function createRuntimeException(message) {
      return new Error("Runtime Exception: " + message);
    },
    createIllegalStateException: function createIllegalStateException(message) {
      return new Error("Illegal State: " + message);
    },
    createIllegalArgumentException: function createIllegalArgumentException(message) {
      return new Error("Illegal Argument: " + message);
    },
    supportsStackTrace: function supportsStackTrace() {
      return true;
    },
    getStackTrace: function getStackTrace(excp) {
      if (excp.stack === undefined) {
        return excp.message + "\r\n(No call stack available; please search source code for exception message)";
      }

      return excp.stack;
    },
    getMessage: function getMessage(excp) {
      return excp.message;
    }
  };
  /** String utilities. */

  sap.firefly.XString = {
    /**
    * Checks for string equal.
    * @param firstValue the first value.
    * @param secondValue the second value.
    * @return true if both strings are equal
    */
    isEqual: function isEqual(firstValue, secondValue) {
      return firstValue === secondValue;
    },
    getCharAt: function getCharAt(value, index) {
      return value.charCodeAt(index);
    },

    /**
     * Replace a search pattern with a new replace value
     *
     * Replace a search pattern with a new replace value. Wildcards are not allowed. The replacement
     * starts from the beginning and runs to the end. For example, value="mmm", searchPattern="mm", replaceValue="x"
     * results in "xm".
     * @param value the origin value
     * @param searchPattern the search pattern
     * @param replaceValue the replace value
     * @return the new string
     */
    replace: function replace(value, searchPattern, replaceValue) {
      return value && value.split(searchPattern).join(replaceValue);
    },

    /**
     * Check if one is contained in another string.
     * @param s1 first string
     * @param s2 second string
     * @return true if string1 cointains string 2
     */
    containsString: function containsString(s1, s2) {
      if (s1 === null && s2 === null) {
        return true;
      }

      if (s1 === null) {
        return false;
      }

      if (s2 === null) {
        return true;
      }

      return s1.indexOf(s2) !== -1;
    },

    /**
     * Returns true if a string starts with a certain string, false otherwise.
     * @param value the string to check
     * @param startsWithString the starting pattern
     * @return true if a string starts with a certain string, false otherwise.
     */
    startsWith: function startsWith(value, startsWithString) {
      return value.indexOf(startsWithString) === 0;
    },

    /**
     * Returns true if a string starts with a certain string, false otherwise.
     * @param value the string to check
     * @param endsWithString the starting pattern
     * @return true if a string ends with a certain string, false otherwise.
     */
    endsWith: function endsWith(value, endsWithString) {
      var lastIndexOf = value.lastIndexOf(endsWithString);

      if (lastIndexOf === -1) {
        return false;
      }

      if (lastIndexOf + endsWithString.length === value.length) {
        return true;
      }

      return false;
    },

    /**
     * Get the size of a string.
     * @param value the string
     * @return the size of a string.
     */
    size: function size(value) {
      return value.length;
    },

    /**
     * Compare 2 strings.
     * @param value the first string.
     * @param compareTo the second string.
     * @return true if strings are equal, false otherwise.
     */
    compare: function compare(value, compareTo) {
      if (value === compareTo) {
        return 0;
      }

      if (value === null) {
        return -1;
      }

      if (compareTo === null) {
        return 1;
      }

      return value > compareTo ? 1 : -1;
    },

    /**
     * Get the index of a pattern in the text or -1, if the pattern cannot be found.
     * @param text the text.
     * @param pattern the pattern.
     * @return the index or -1, if the pattern cannot be found.
     */
    indexOf: function indexOf(text, pattern) {
      return text.indexOf(pattern);
    },

    /**
     * Get the index of a pattern in the text or -1, if the pattern cannot be found.
     * @param text the text.
     * @param pattern the pattern.
     * @param fromIndex index to start from.
     * @return the index or -1, if the pattern cannot be found.
     */
    indexOfFrom: function indexOfFrom(text, pattern, fromIndex) {
      return text.indexOf(pattern, fromIndex);
    },

    /**
     * Get the last index of a pattern in the text or -1, if the pattern cannot be found.
     * @param text the text.
     * @param pattern the pattern
     * @return the index or -1, if the pattern cannot be found.
     */
    lastIndexOf: function lastIndexOf(text, pattern) {
      return text.lastIndexOf(pattern);
    },

    /**
     * Get the last index of a pattern in the text or -1, if the pattern cannot be found.
     * @param text the text
     * @param pattern the pattern
     * @param indexFrom index to start from
     * @return the index or -1, if the pattern cannot be found.
     */
    lastIndexOfFrom: function lastIndexOfFrom(text, pattern, indexFrom) {
      return text.lastIndexOf(pattern, indexFrom);
    },

    /**
     * Create a substring.
     * @param text the text
     * @param beginIndex the start index
     * @param endIndex the end index. If the rest of the string should be used, the parameter must be set to -1.
     * @return the substring.
     */
    substring: function substring(text, beginIndex, endIndex) {
      if (endIndex === -1) {
        return text.substring(beginIndex);
      }

      return text.substring(beginIndex, endIndex);
    },

    /**
     * Convert a string to lower case.
     * @param value the value.
     * @return the lower-case string.
     */
    toLowerCase: function toLowerCase(value) {
      return value && value.toLowerCase();
    },

    /**
     * Convert a string to upper case.
     * @param value the value.
     * @return the upper-case string.
     */
    toUpperCase: function toUpperCase(value) {
      return value && value.toUpperCase();
    },

    /**
     * Trims a string.
     * @param value the value
     * @return the value without leading and trailing spaces
     */
    trim: function trim(value) {
      return value && value.trim();
    },

    /**
     * Returns whether or not the string matches the given regular expression.
     * @param value the value
     * @param pattern the regular expression
     * @return true if a string matches the regular expression, false otherwise.
     */
    match: function match(value, pattern) {
      if (value && pattern) {
        var regex = new RegExp(pattern);
        return regex.test(value);
      }

      return false;
    },
    getStringResource: function getStringResource() {
      return null;
    },
    utf8Encode: function utf8Encode(value) {
      return unescape(encodeURIComponent(value));
    },
    utf8Decode: function utf8Decode(value) {
      return decodeURIComponent(escape(value));
    },
    asString: function asString(value) {
      // don't use if(!value) as this would be true for 0 as well
      if (value === null || value === undefined) {
        return value;
      }

      return value.toString();
    }
  };
  /** Boolean utilities. */

  sap.firefly.XBoolean = {
    TRUE: "true",
    FALSE: "false",
    convertToString: function convertToString(value) {
      if (value === true) {
        return this.TRUE;
      }

      return this.FALSE;
    },
    convertFromString: function convertFromString(value) {
      if (this.TRUE === value) {
        return true;
      }

      if (this.FALSE === value) {
        return false;
      }

      throw new Error("Illegal Argument:" + value);
    },
    convertFromStringWithDefault: function convertFromStringWithDefault(value, defaultValue) {
      if (this.TRUE === value) {
        return true;
      }

      if (this.FALSE === value) {
        return false;
      }

      return defaultValue;
    }
  };
  /** Integer utilities. */

  sap.firefly.XInteger = {
    /**
     * convert an integer value to a string.
     * @param value the value.
     * @returns the integer as string.
     * @exception XIllegalArgumentException if the value cannot be converted.
     */
    convertToString: function convertToString(value) {
      if (value === null || value === undefined) {
        return null;
      }

      return value.toString();
    },

    /**
     * Convert a string value to an integer.
     * @param value the value.
     * @return the string as integer.
     * @exception XIllegalArgumentException if the value cannot be converted.
     */
    convertFromString: function convertFromString(value) {
      return sap.firefly.XInteger.convertFromStringWithRadix(value, 10);
    },

    /**
     * Convert a string value to an integer.
     * @param value the value.
     * @return the string as integer
     * @exception XIllegalArgumentException if the value cannot be converted.
     */
    convertFromStringWithRadix: function convertFromStringWithRadix(value, radix, defaultValue) {
      if (typeof value === "number") {
        return parseInt(value, radix);
      }

      var hasDefault = typeof defaultValue !== "undefined";
      var v = sap.firefly.isNull(value) ? "" : value.trim();

      if ("" === v || !/(^[\-+]?\d*\.?\d*$)|(^[0-9a-fA-F]*$)/.test(v)) {
        if (hasDefault) {
          return defaultValue;
        }

        throw new Error("Value is not a number");
      }

      var intValue = parseInt(v, radix);

      if (isNaN(intValue)) {
        if (hasDefault) {
          return defaultValue;
        }

        throw new Error("Value is not a number: " + value);
      }

      return intValue;
    },

    /**
     * Convert a string value to an integer
     * @param value the value
     * @param defaultValue the default value
     * @return the string as integer
     */
    convertFromStringWithDefault: function convertFromStringWithDefault(value, defaultValue) {
      return sap.firefly.XInteger.convertFromStringWithRadix(value, 10, defaultValue);
    },
    convertToDouble: function convertToDouble(value) {
      return value;
    },
    convertToInt: function convertToInt(value) {
      return value;
    },

    /**
     * Convert an int value to a uppercase hex string.
     * @param intValue the int value.
     * @return the hex string value.
     */
    convertToHexString: function convertToHexString(value) {
      var hexStr = Number(value).toString(16).toUpperCase();
      return hexStr.length === 1 ? "0" + hexStr : hexStr;
    },

    /**
     * get the Nth least significant byte of this integer.
     * @param intValue the int value to examine.
     * @param bytePosition the nth least significant byte to extract
     * @return the value of the the nth least significant byte.
     */
    getNthLeastSignificantByte: function getNthLeastSignificantByte(intValue, bytePosition) {
      return intValue >> bytePosition * 8 & 0x000000FF;
    }
  };
  /** Long utilities. */

  sap.firefly.XLong = sap.firefly.XInteger;
  sap.firefly.XDouble = {
    /**
     * Convert a double value to a string.
     * @param value the value.
     * @return the double as string.
     */
    convertToString: function convertToString(value) {
      if (value === null || value === undefined) {
        return null;
      }

      return value.toString();
    },

    /**
     * Convert a string value to an double.
     * @param value the value.
     * @return the string as double.
     * @exception XIllegalArgumentException if the value cannot be converted.
     */
    convertFromString: function convertFromString(value) {
      if (value === null || value.length === 0 || isNaN(value)) {
        throw new Error("Illegal Argument: Value is not a number: " + value);
      }

      var numberValue = parseFloat(value);

      if (isNaN(numberValue)) {
        throw new Error("Illegal Argument: Value is not a number: " + value);
      }

      return numberValue;
    },

    /**
     * Convert a string value to a double with a default value.
     * @param value the value.
     * @param defaultValue the default value.
     * @return the string as double.
     */
    convertFromStringWithDefault: function convertFromStringWithDefault(value, defaultValue) {
      if (value === null || value.length === 0 || isNaN(value)) {
        return defaultValue;
      }

      var numberValue = parseFloat(value);

      if (isNaN(numberValue)) {
        return defaultValue;
      }

      return numberValue;
    },
    convertToLong: function convertToLong(value) {
      return value > 0 ? Math.floor(value) : Math.ceil(value);
    },
    convertToInt: function convertToInt(value) {
      return parseInt(value, 10);
    }
  };
  /** String buffer. */

  sap.firefly.XStringBuffer = function () {
    this._ff_c = "XStringBuffer";
    this.m_stringBuffer = "";
  };

  sap.firefly.XStringBuffer.prototype = new sap.firefly.XObject();
  /**
   * Create a string buffer.
   * @return a string buffer.
   */

  sap.firefly.XStringBuffer.create = function () {
    return new sap.firefly.XStringBuffer();
  };

  sap.firefly.XStringBuffer.prototype.releaseObject = function () {
    this.m_isReleased = true;
    this.m_stringBuffer = null;
  };

  sap.firefly.XStringBuffer.prototype.isReleaseLocked = function () {
    return false;
  };

  sap.firefly.XStringBuffer.prototype.isReleased = function () {
    return this.m_stringBuffer === null;
  };

  sap.firefly.XStringBuffer.prototype.appendLine = function (value) {
    return this.append(value).appendNewLine();
  };

  sap.firefly.XStringBuffer.prototype.append = function (value) {
    if (value !== null) {
      this.m_stringBuffer = this.m_stringBuffer.concat(value);
    }

    return this;
  };

  sap.firefly.XStringBuffer.prototype.appendChar = function (value) {
    this.m_stringBuffer = this.m_stringBuffer.concat(String.fromCharCode(value));
    return this;
  };

  sap.firefly.XStringBuffer.prototype.appendInt = sap.firefly.XStringBuffer.prototype.append;
  sap.firefly.XStringBuffer.prototype.appendDouble = sap.firefly.XStringBuffer.prototype.append;
  sap.firefly.XStringBuffer.prototype.appendLong = sap.firefly.XStringBuffer.prototype.append;

  sap.firefly.XStringBuffer.prototype.appendBoolean = function (value) {
    return this.append(sap.firefly.XBoolean.convertToString(value));
  };

  sap.firefly.XStringBuffer.prototype.appendObject = function (value) {
    if (value !== null) {
      this.append(value.toString());
    } else {
      this.append("null");
    }
  };

  sap.firefly.XStringBuffer.prototype.appendNewLine = function () {
    this.append("\n");
    return this;
  };

  sap.firefly.XStringBuffer.prototype.toString = function () {
    return this.m_stringBuffer;
  };

  sap.firefly.XStringBuffer.prototype.length = function () {
    return this.m_stringBuffer.length;
  };

  sap.firefly.XStringBuffer.prototype.clear = function () {
    this.m_stringBuffer = "";
  };

  sap.firefly.XStringBuffer.prototype.flush = function () {};

  sap.firefly.XClass = function (clazzDefinition) {
    this.m_clazzDefinition = clazzDefinition;
    this._ff_c = "XClass";
  };

  sap.firefly.XClass.prototype = new sap.firefly.XObject();

  sap.firefly.XClass.create = function (clazzDefinition) {
    return new sap.firefly.XClass(clazzDefinition);
  };

  sap.firefly.XClass.createByName = function (clazzName) {
    var theNewXClass = null;

    if (clazzName !== null && clazzName !== undefined) {
      var myClass = sap.firefly[clazzName];

      if (myClass !== null && myClass !== undefined) {
        theNewXClass = this.create(myClass);
      }
    }

    return theNewXClass;
  };
  /**
   * Get the canonical class name.
   * @param object the object.
   * @return the canonical class name.
   */


  sap.firefly.XClass.getCanonicalClassName = function (object) {
    if (object === undefined || object._ff_c === undefined) {
      return "[unknown class]";
    }

    return object._ff_c;
  };

  sap.firefly.XClass.isXObjectReleased = function (targetObject) {
    if (targetObject === null) {
      return true;
    }

    return targetObject.isReleased ? targetObject.isReleased() : false;
  };

  sap.firefly.XClass.callFunction = function (functionObj, param1, param2, param3) {
    var getType = {};
    var isFunction = functionObj && getType.toString.call(functionObj) === "[object Function]";

    if (isFunction) {
      if (param1 === null && param2 === null && param3 === null) {
        functionObj();
      } else {
        functionObj(param1, param2, param3);
      }

      return true;
    }

    return false;
  };

  sap.firefly.XClass.initializeClass = function () {// do nothing, classes are all automatically initialized
  };

  sap.firefly.XClass.prototype.releaseObject = function () {
    this.m_clazzDefinition = null;
    sap.firefly.XObject.prototype.releaseObject.call(this);
  };

  sap.firefly.XClass.prototype.getNativeName = function () {
    return "Prototype";
  };

  sap.firefly.XClass.prototype.getNativeElement = function () {
    return this.m_clazzDefinition;
  };

  sap.firefly.XClass.prototype.newInstance = function () {
    var F = function F() {};

    F.prototype = this.m_clazzDefinition.prototype;
    return new F();
  };

  sap.firefly.XClass.prototype.toString = function () {
    return "Prototype";
  };
  /** The charset */


  sap.firefly.XCharset = {
    USASCII: 0,
    _USASCII: "US-ASCII",
    UTF8: 1,
    _UTF8: "UTF-8",

    /**
     * Lookup the native string representation.
     * @param theConstant the constant.
     * @return the string representation.
     */
    lookupCharsetName: function lookupCharsetName(theConstant) {
      if (theConstant === this.UTF8) {
        return this._UTF8;
      }

      return this._USASCII;
    }
  };
  /** Byte Array wrapper. */
  // eslint-disable-next-line no-undef

  var isNode = typeof Buffer !== "undefined" && typeof module !== "undefined" && this.module !== module && module.exports;

  sap.firefly.XByteArray = function (nativeByteArrayObject) {
    this.m_nativeByteArray = nativeByteArrayObject;
    this._ff_c = "XByteArray";
  };

  sap.firefly.XByteArray.prototype = new sap.firefly.XObject();

  sap.firefly.XByteArray.create = function (nativeByteArrayObject, size) {
    if (nativeByteArrayObject === null) {
      var byteArray;

      if (isNode) {
        // eslint-disable-next-line no-undef
        byteArray = Buffer.alloc(size, 0);
      } else {
        byteArray = new Array(size); // default value of a byte should be 0 as in other languages

        for (var i = 0; i < size; i++) {
          byteArray[i] = 0;
        }
      }

      return new sap.firefly.XByteArray(byteArray);
    }

    return new sap.firefly.XByteArray(nativeByteArrayObject);
  };

  sap.firefly.XByteArray.copy = function (src, srcPos, dest, destPos, length) {
    var srcBytes = src.getNative();
    var destBytes = dest.getNative();
    var srcIndex = srcPos;
    var destIndex = destPos;
    var count = 0;

    while (count++ < length) {
      destBytes[destIndex++] = srcBytes[srcIndex++];
    }
  };

  sap.firefly.XByteArray.convertFromString = function (value) {
    return sap.firefly.XByteArray.convertFromStringWithCharset(value, sap.firefly.XCharset.UTF8);
  };

  sap.firefly.XByteArray.convertFromStringWithCharset = function (value, charset) {
    var array = []; // be gracefull, so that logging works always

    if (charset === sap.firefly.XCharset.UTF8) {
      if (isNode) {
        // eslint-disable-next-line no-undef
        array = Buffer.from(value, "utf8");
      } else {
        var c;

        for (var n = 0; n < value.length; n++) {
          // get unicode value
          c = value.charCodeAt(n);

          if (c < 128) {
            // 0-127 => 1byte
            array.push(c);
          } else if (c > 127 && c < 2048) {
            // 127 bis 2047 => 2byte
            array.push(c >> 6 | 192);
            array.push(c & 63 | 128);
          } else {
            // 2048 bis 66536 => 3byte
            array.push(c >> 12 | 224);
            array.push(c >> 6 & 63 | 128);
            array.push(c & 63 | 128);
          }
        }
      }
    }

    return new sap.firefly.XByteArray(array);
  };

  sap.firefly.XByteArray.convertToString = function (byteArray) {
    return sap.firefly.XByteArray.convertToStringWithCharset(byteArray, sap.firefly.XCharset.UTF8);
  };

  sap.firefly.XByteArray.convertToStringWithCharset = function (byteArray, charset) {
    if (sap.firefly.XCharset.UTF8 !== charset) {
      throw new Error("Runtime Exception: Unsupported charset");
    }

    var array = byteArray.getNative();

    if (isNode) {
      // eslint-disable-next-line no-undef
      return new Buffer(array, "binary").toString("utf8");
    }

    var buffer = new sap.firefly.XStringBuffer();
    var i = 0;
    var c1 = 0;
    var c2 = 0;
    var c3 = 0;

    while (i < array.length) {
      c1 = array[i];

      if (c1 < 128) {
        buffer.append(String.fromCharCode(c1));
        ++i;
      } else if (c1 > 191 && c1 < 224) {
        c2 = array[i + 1];
        buffer.append(String.fromCharCode((c1 & 31) << 6 | c2 & 63));
        i += 2;
      } else {
        c2 = array[i + 1];
        c3 = array[i + 2];
        buffer.append(String.fromCharCode((c1 & 15) << 12 | (c2 & 63) << 6 | c3 & 63));
        i += 3;
      }
    }

    return buffer.toString();
  };

  sap.firefly.XByteArray.isEqual = function (firstValue, secondValue) {
    return firstValue === secondValue;
  };

  sap.firefly.XByteArray.prototype.releaseObject = function () {
    this.m_nativeByteArray = null;
    sap.firefly.XObject.prototype.releaseObject.call(this);
  };

  sap.firefly.XByteArray.prototype.size = function () {
    if (this.m_nativeByteArray === null) {
      return 0;
    }

    return this.m_nativeByteArray.length;
  };

  sap.firefly.XByteArray.prototype.getByteAt = function (index) {
    return this.m_nativeByteArray[index];
  };

  sap.firefly.XByteArray.prototype.setByteAt = function (index, value) {
    this.m_nativeByteArray[index] = value;
  };

  sap.firefly.XByteArray.prototype.getNative = function () {
    return this.m_nativeByteArray;
  };

  sap.firefly.XByteArray.prototype.setNative = function (nativeByteArrayObject) {
    this.m_nativeByteArray = nativeByteArrayObject;
  };

  sap.firefly.XByteArray.prototype.resetValue = sap.firefly.XObject.noSupport;
  sap.firefly.XByteArray.prototype.toString = sap.firefly.XObject.noSupport;
  sap.firefly.XMath = {
    isNaN: function (_isNaN) {
      function isNaN(_x) {
        return _isNaN.apply(this, arguments);
      }

      isNaN.toString = function () {
        return _isNaN.toString();
      };

      return isNaN;
    }(function (value) {
      //isNaN does an implicit Number(value) which will convert null to 0.
      if (value === null || value === undefined) {
        return true;
      }

      return isNaN(value);
    }),
    abs: function abs(value) {
      return Math.abs(value);
    },
    mod: function mod(i1, i2) {
      if (i2 === 0) {
        throw new Error("Illegal Argument: division by 0");
      }

      if (i1 === 0) {
        return 0;
      }

      return i1 % i2;
    },
    longMod: function longMod(l1, l2) {
      if (l2 === 0) {
        throw new Error("Illegal Argument: division by 0");
      }

      if (l1 === 0) {
        return 0;
      }

      return l1 % l2;
    },
    div: function div(i1, i2) {
      if (i2 === 0) {
        throw new Error("Illegal Argument: division by 0");
      }

      if (i1 === 0) {
        return 0;
      } //Basically XOR. If only one of the values is negative we round up, else we round down


      if (i1 < 0 !== i2 < 0) {
        return Math.ceil(i1 / i2);
      }

      return Math.floor(i1 / i2);
    },
    longDiv: function longDiv(i1, i2) {
      if (i2 === 0) {
        throw new Error("Illegal Argument: division by 0");
      }

      if (i1 === 0) {
        return 0;
      } //Basically XOR. If only one of the values is negative we round up, else we round down


      if (i1 < 0 !== i2 < 0) {
        return Math.ceil(i1 / i2);
      }

      return Math.floor(i1 / i2);
    },
    binaryAnd: function binaryAnd(value1, value2) {
      return value1 & value2;
    },
    binaryOr: function binaryOr(value1, value2) {
      return value1 | value2;
    },
    binaryXOr: function binaryXOr(value1, value2) {
      return value1 ^ value2;
    },
    min: function min(firstInteger, secondInteger) {
      if (firstInteger > secondInteger) {
        return secondInteger;
      }

      return firstInteger;
    },
    max: function max(firstInteger, secondInteger) {
      if (firstInteger > secondInteger) {
        return firstInteger;
      }

      return secondInteger;
    },
    clamp: function clamp(lowerBound, upperBound, value) {
      var xMath = sap.firefly.XMath;
      var lowerBoundary = xMath.min(lowerBound, upperBound);
      var upperBoundary = xMath.max(lowerBound, upperBound);
      return xMath.max(lowerBoundary, xMath.min(value, upperBoundary));
    },
    pow: function pow(a, b) {
      return Math.pow(a, b);
    },
    random: function random(upperBound) {
      return Math.floor(Math.random() * upperBound);
    },
    round: function round(doubleValue, decPlaces) {
      if (decPlaces < 0) {
        throw new Error("Number of decimal places cannot be negative");
      }

      var pow_10 = Math.pow(10, decPlaces);
      return Math.round(doubleValue * pow_10) / pow_10;
    },
    // Rounds a number up to the next largest integer.
    ceil: function ceil(doubleValue) {
      return Math.ceil(doubleValue);
    }
  };
  return sap.firefly;
});