/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/core/Locale", "sap/ui/core/LocaleData"], function (Locale, LocaleData) {
  "use strict";

  var _exports = {};
  /**
   * Constructor for a new FiscalFormat
   *
   * @param formatOptions Object that defines format options
   * @param formatOptions.format String with fiscal format
   * @param formatOptions.calendarType String with calendar type
   * @class
   * <h3>Overview</h3>
   *
   * Formatting, Validating and Parsing Fiscal Dates
   * @author SAP SE
   * @version 1.111.1
   * @experimental This module is only for internal/experimental use!
   * @hideconstructor
   */
  let FiscalFormat = /*#__PURE__*/function () {
    function FiscalFormat(formatOptions) {
      const locale = new Locale(sap.ui.getCore().getConfiguration().getLanguage()),
        localeData = new LocaleData(locale);
      let format = formatOptions.format;
      if (formatOptions.format.length > 4) {
        format = "yM";
      } else if (formatOptions.format === "PPP") {
        format = "M";
      }
      let pattern = localeData.getCustomDateTimePattern(format, formatOptions.calendarType);
      pattern = pattern.replace(/([\u4e00-\u9faf\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uffef])+/gi, "");
      // Parsing the "yM" format pattern to the pattern that would match the passed format
      if (formatOptions.format.length > 4) {
        pattern = pattern.replace(/y+/i, formatOptions.format.slice(0, formatOptions.format.lastIndexOf("Y") + 1));
        pattern = pattern.replace(/m+/i, formatOptions.format.slice(formatOptions.format.lastIndexOf("Y") + 1));
      } else if (formatOptions.format === "PPP") {
        pattern = "PPP";
      }
      const formatArray = this.parseCalendarDatePattern(pattern);
      this.pattern = formatArray.length > 1 ? pattern : undefined;
      this._setFormatRegex(formatArray);
      this._setParseRegex(formatArray);
      this._setValidationRegex(formatArray);
    }

    /**
     * Get a date instance of the <code>FiscalFormat</code> class, which can be used for formatting.
     *
     * @param formatOptions Object that defines format options
     * @param formatOptions.format Fiscal format
     * @param formatOptions.calendarType Calendar type
     * @returns Instance of the FiscalFormat
     */
    _exports = FiscalFormat;
    FiscalFormat.getDateInstance = function getDateInstance(formatOptions) {
      return new FiscalFormat(formatOptions);
    };
    var _proto = FiscalFormat.prototype;
    _proto.getPattern = function getPattern() {
      return this.pattern;
    }

    /**
     * Format the raw fiscal data to a locale-dependent format.
     *
     * @param value The parameter containing a raw fiscal value
     * @returns The formatted value
     */;
    _proto.format = function format(value) {
      if (value == null) {
        return "";
      }
      if (typeof value !== "string") {
        return value;
      }
      return value.replace(this.formatRegExPattern, this.formatRegExGroups);
    }

    /**
     * Parse from a locale-dependent format to a raw value.
     *
     * @param value The string containing a parsed fiscal data value
     * @returns The raw value
     */;
    _proto.parse = function parse(value) {
      if (!value) {
        return "";
      }
      return value.replace(this.parseRegExPattern, this.parseRegExReplacer);
    }

    /**
     * Validates the data input.
     *
     * @param value The raw fiscal data
     * @returns If <code>true</code> the validation passes, otherwise <code>false</code>
     */;
    _proto.validate = function validate(value) {
      return this.validationRegExPattern.test(value);
    }

    /**
     * Parse the date pattern string and create a format array from it.
     * Array is used for data parsing and formatting.
     *
     * @param pattern The calendar date pattern string
     * @returns Format array
     */;
    _proto.parseCalendarDatePattern = function parseCalendarDatePattern(pattern) {
      const formatArray = [];
      let char,
        currentObject = {
          digits: 0,
          value: "",
          symbol: ""
        };
      for (const curChar of pattern) {
        if (char !== curChar) {
          currentObject = {
            digits: 0,
            value: "",
            symbol: ""
          };
        } else {
          currentObject.digits += 1;
          continue;
        }
        if (typeof FiscalFormat.symbols[curChar] === "undefined") {
          currentObject.value = curChar;
        } else {
          currentObject.symbol = curChar;
          currentObject.digits = 1;
        }
        char = curChar;
        formatArray.push(currentObject);
      }
      return formatArray;
    }

    /**
     * Creates the formatting regular expression based on the locale-dependent format.
     *
     * @param formatArray An array with the locale-dependent format
     */;
    _proto._setFormatRegex = function _setFormatRegex(formatArray) {
      const regExPattern = [],
        regExGroups = [];
      let part, symbol, regex, year;
      for (let i = 0; i < formatArray.length; i++) {
        part = formatArray[i];
        symbol = part.symbol;
        regex = FiscalFormat.symbols[symbol].format;
        if (symbol === "") {
          regExGroups[i] = part.value;
        } else if (symbol.toLocaleLowerCase() === "y") {
          regExPattern.unshift("(" + regex.source + ")");
          regExGroups[i] = "$" + 1;
        } else {
          regExPattern.push("(" + regex.source + ")");
          year = formatArray.some(function (partEntry) {
            return partEntry.symbol.toLowerCase() === "y";
          });
          regExGroups[i] = year ? "$" + 2 : "$" + 1;
        }
      }
      this.formatRegExPattern = new RegExp(regExPattern.join(""));
      this.formatRegExGroups = regExGroups.join("");
    }

    /**
     * Creates the parsing regular expression based on the locale-dependent format.
     *
     * @param formatArray An array with the locale-dependent format
     */;
    _proto._setParseRegex = function _setParseRegex(formatArray) {
      const regExPattern = [],
        filteredFormat = {};
      let symbol,
        regex,
        currGroup,
        group = 0;
      for (const part of formatArray) {
        symbol = part.symbol;
        if (symbol === "") {
          regExPattern.push("\\D+?");
        } else {
          regex = FiscalFormat.symbols[symbol].parse;
          regExPattern.push("(" + regex.source + ")");
          currGroup = ++group;
          filteredFormat[currGroup] = part;
        }
      }
      this.parseRegExPattern = new RegExp("^" + regExPattern.join("") + "$");
      this.parseRegExReplacer = this.getRegExReplacer(filteredFormat);
    }

    /**
     * Creates a function that is used to replace strings and then performs raw string parsing.
     *
     * @param filteredFormat An array with the locale-dependent format
     * @returns Function that can be passed into the string.replace function
     */;
    _proto.getRegExReplacer = function getRegExReplacer(filteredFormat) {
      return function () {
        const result = [];
        let valuePart, stringGroup;
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        for (const key in filteredFormat) {
          valuePart = filteredFormat[key];
          stringGroup = args[parseInt(key, 10)];
          if (stringGroup.length < valuePart.digits) {
            if (valuePart.symbol.toLowerCase() === "y") {
              stringGroup = parseYear(stringGroup);
            } else {
              stringGroup = stringGroup.padStart(valuePart.digits, "0");
            }
          }
          if (valuePart.symbol.toLowerCase() === "y") {
            result.unshift(stringGroup);
          } else {
            result.push(stringGroup);
          }
        }
        return result.join("");
      };
    }

    /**
     * Creates the validation regular expression based on the format.
     *
     * @param formatArray An array with the locale-dependent format
     */;
    _proto._setValidationRegex = function _setValidationRegex(formatArray) {
      const regExPattern = [];
      let symbol, regex;
      for (const part of formatArray) {
        symbol = part.symbol;
        regex = FiscalFormat.symbols[symbol].format;
        if (symbol === "") {
          continue;
        } else if (symbol.toLowerCase() === "y") {
          regExPattern.unshift(regex.source);
        } else {
          regExPattern.push(regex.source);
        }
      }
      this.validationRegExPattern = new RegExp("^(" + regExPattern.join(")(") + ")$");
    }

    /**
     * Regular expression patterns used to format fiscal date strings
     */;
    return FiscalFormat;
  }();
  /**
   * Parses the Year format. This is how the DateFormat parses years, except those years consisting of 3 digits, since currency fiscal dates support only years consisting of 4 digits.
   *
   * @param year Year string
   * @returns Year number
   */
  FiscalFormat.regexFormatPatterns = {
    year: /[1-9]\d{3}/,
    period: /\d{3}/,
    quarter: /[1-4]/,
    week: /0[1-9]|[1-4]\d|5[0-3]/,
    day: /371|370|3[0-6]\d|[1-2]\d{2}|[1-9]\d|[1-9]/
  };
  _exports = FiscalFormat;
  FiscalFormat.regexParsePatterns = {
    year: /\d{1,4}/,
    period: /\d{1,3}/,
    quarter: /[1-4]/,
    week: /\d{1,2}/,
    day: /[1-9]/
  };
  FiscalFormat.symbols = {
    "": {
      format: / /,
      parse: / /
    },
    // "text"
    y: {
      format: FiscalFormat.regexFormatPatterns.year,
      parse: FiscalFormat.regexParsePatterns.year
    },
    // "year"
    Y: {
      format: FiscalFormat.regexFormatPatterns.year,
      parse: FiscalFormat.regexParsePatterns.year
    },
    // "weekYear"
    P: {
      format: FiscalFormat.regexFormatPatterns.period,
      parse: FiscalFormat.regexParsePatterns.period
    },
    // "period"
    W: {
      format: FiscalFormat.regexFormatPatterns.week,
      parse: FiscalFormat.regexParsePatterns.week
    },
    // "weekInYear"
    d: {
      format: FiscalFormat.regexFormatPatterns.day,
      parse: FiscalFormat.regexParsePatterns.day
    },
    // "dayInYear"
    Q: {
      format: FiscalFormat.regexFormatPatterns.quarter,
      parse: FiscalFormat.regexParsePatterns.quarter
    },
    // "quarter"
    q: {
      format: FiscalFormat.regexFormatPatterns.quarter,
      parse: FiscalFormat.regexParsePatterns.quarter
    } //"quarterStandalone"
  };

  function parseYear(year) {
    let parsedYear = Number.parseInt(year, 10);
    const currentYear = new Date().getUTCFullYear(),
      currentCentury = Math.floor(currentYear / 100),
      yearDiff = currentCentury * 100 + parsedYear - currentYear;
    if (year.length === 3) {
      parsedYear += Math.floor((currentCentury - 1) / 10) * 1000;
    } else if (yearDiff < -70) {
      parsedYear += (currentCentury + 1) * 100; // Take next century if "year" is 30 years in the future. Current year 1999 and we enter 28 it will we 2028
    } else if (yearDiff < 30) {
      parsedYear += currentCentury * 100; // Take next century if "year" is 30 years in the future. Current year 2000 and we enter 29 it will we 2029
    } else {
      parsedYear += (currentCentury - 1) * 100; // Any entered "year" that is more than 30 years in the future will be treated as from previous century
    }

    return parsedYear;
  }
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGaXNjYWxGb3JtYXQiLCJmb3JtYXRPcHRpb25zIiwibG9jYWxlIiwiTG9jYWxlIiwic2FwIiwidWkiLCJnZXRDb3JlIiwiZ2V0Q29uZmlndXJhdGlvbiIsImdldExhbmd1YWdlIiwibG9jYWxlRGF0YSIsIkxvY2FsZURhdGEiLCJmb3JtYXQiLCJsZW5ndGgiLCJwYXR0ZXJuIiwiZ2V0Q3VzdG9tRGF0ZVRpbWVQYXR0ZXJuIiwiY2FsZW5kYXJUeXBlIiwicmVwbGFjZSIsInNsaWNlIiwibGFzdEluZGV4T2YiLCJmb3JtYXRBcnJheSIsInBhcnNlQ2FsZW5kYXJEYXRlUGF0dGVybiIsInVuZGVmaW5lZCIsIl9zZXRGb3JtYXRSZWdleCIsIl9zZXRQYXJzZVJlZ2V4IiwiX3NldFZhbGlkYXRpb25SZWdleCIsImdldERhdGVJbnN0YW5jZSIsImdldFBhdHRlcm4iLCJ2YWx1ZSIsImZvcm1hdFJlZ0V4UGF0dGVybiIsImZvcm1hdFJlZ0V4R3JvdXBzIiwicGFyc2UiLCJwYXJzZVJlZ0V4UGF0dGVybiIsInBhcnNlUmVnRXhSZXBsYWNlciIsInZhbGlkYXRlIiwidmFsaWRhdGlvblJlZ0V4UGF0dGVybiIsInRlc3QiLCJjaGFyIiwiY3VycmVudE9iamVjdCIsImRpZ2l0cyIsInN5bWJvbCIsImN1ckNoYXIiLCJzeW1ib2xzIiwicHVzaCIsInJlZ0V4UGF0dGVybiIsInJlZ0V4R3JvdXBzIiwicGFydCIsInJlZ2V4IiwieWVhciIsImkiLCJ0b0xvY2FsZUxvd2VyQ2FzZSIsInVuc2hpZnQiLCJzb3VyY2UiLCJzb21lIiwicGFydEVudHJ5IiwidG9Mb3dlckNhc2UiLCJSZWdFeHAiLCJqb2luIiwiZmlsdGVyZWRGb3JtYXQiLCJjdXJyR3JvdXAiLCJncm91cCIsImdldFJlZ0V4UmVwbGFjZXIiLCJyZXN1bHQiLCJ2YWx1ZVBhcnQiLCJzdHJpbmdHcm91cCIsImFyZ3MiLCJrZXkiLCJwYXJzZUludCIsInBhcnNlWWVhciIsInBhZFN0YXJ0IiwicmVnZXhGb3JtYXRQYXR0ZXJucyIsInBlcmlvZCIsInF1YXJ0ZXIiLCJ3ZWVrIiwiZGF5IiwicmVnZXhQYXJzZVBhdHRlcm5zIiwieSIsIlkiLCJQIiwiVyIsImQiLCJRIiwicSIsInBhcnNlZFllYXIiLCJOdW1iZXIiLCJjdXJyZW50WWVhciIsIkRhdGUiLCJnZXRVVENGdWxsWWVhciIsImN1cnJlbnRDZW50dXJ5IiwiTWF0aCIsImZsb29yIiwieWVhckRpZmYiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkZpc2NhbEZvcm1hdC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQ2FsZW5kYXJUeXBlIGZyb20gXCJzYXAvdWkvY29yZS9DYWxlbmRhclR5cGVcIjtcbmltcG9ydCBMb2NhbGUgZnJvbSBcInNhcC91aS9jb3JlL0xvY2FsZVwiO1xuaW1wb3J0IExvY2FsZURhdGEgZnJvbSBcInNhcC91aS9jb3JlL0xvY2FsZURhdGFcIjtcblxuLyoqXG4gKiBDb25zdHJ1Y3RvciBmb3IgYSBuZXcgRmlzY2FsRm9ybWF0XG4gKlxuICogQHBhcmFtIGZvcm1hdE9wdGlvbnMgT2JqZWN0IHRoYXQgZGVmaW5lcyBmb3JtYXQgb3B0aW9uc1xuICogQHBhcmFtIGZvcm1hdE9wdGlvbnMuZm9ybWF0IFN0cmluZyB3aXRoIGZpc2NhbCBmb3JtYXRcbiAqIEBwYXJhbSBmb3JtYXRPcHRpb25zLmNhbGVuZGFyVHlwZSBTdHJpbmcgd2l0aCBjYWxlbmRhciB0eXBlXG4gKiBAY2xhc3NcbiAqIDxoMz5PdmVydmlldzwvaDM+XG4gKlxuICogRm9ybWF0dGluZywgVmFsaWRhdGluZyBhbmQgUGFyc2luZyBGaXNjYWwgRGF0ZXNcbiAqIEBhdXRob3IgU0FQIFNFXG4gKiBAdmVyc2lvbiAke3ZlcnNpb259XG4gKiBAZXhwZXJpbWVudGFsIFRoaXMgbW9kdWxlIGlzIG9ubHkgZm9yIGludGVybmFsL2V4cGVyaW1lbnRhbCB1c2UhXG4gKiBAaGlkZWNvbnN0cnVjdG9yXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZpc2NhbEZvcm1hdCB7XG5cdHByaXZhdGUgcGF0dGVybjogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXHRwcml2YXRlIGZvcm1hdFJlZ0V4UGF0dGVybiE6IFJlZ0V4cDtcblx0cHJpdmF0ZSBmb3JtYXRSZWdFeEdyb3VwcyE6IHN0cmluZztcblx0cHJpdmF0ZSBwYXJzZVJlZ0V4UGF0dGVybiE6IFJlZ0V4cDtcblx0cHJpdmF0ZSB2YWxpZGF0aW9uUmVnRXhQYXR0ZXJuITogUmVnRXhwO1xuXHRwcml2YXRlIHBhcnNlUmVnRXhSZXBsYWNlciE6IChzdWJzdHJpbmc6IHN0cmluZywgLi4uYXJnczogYW55W10pID0+IHN0cmluZztcblxuXHRjb25zdHJ1Y3Rvcihmb3JtYXRPcHRpb25zOiB7IGZvcm1hdDogc3RyaW5nOyBjYWxlbmRhclR5cGU6IENhbGVuZGFyVHlwZSB9KSB7XG5cdFx0Y29uc3QgbG9jYWxlID0gbmV3IExvY2FsZShzYXAudWkuZ2V0Q29yZSgpLmdldENvbmZpZ3VyYXRpb24oKS5nZXRMYW5ndWFnZSgpKSxcblx0XHRcdGxvY2FsZURhdGEgPSBuZXcgTG9jYWxlRGF0YShsb2NhbGUpO1xuXG5cdFx0bGV0IGZvcm1hdCA9IGZvcm1hdE9wdGlvbnMuZm9ybWF0O1xuXHRcdGlmIChmb3JtYXRPcHRpb25zLmZvcm1hdC5sZW5ndGggPiA0KSB7XG5cdFx0XHRmb3JtYXQgPSBcInlNXCI7XG5cdFx0fSBlbHNlIGlmIChmb3JtYXRPcHRpb25zLmZvcm1hdCA9PT0gXCJQUFBcIikge1xuXHRcdFx0Zm9ybWF0ID0gXCJNXCI7XG5cdFx0fVxuXG5cdFx0bGV0IHBhdHRlcm4gPSBsb2NhbGVEYXRhLmdldEN1c3RvbURhdGVUaW1lUGF0dGVybihmb3JtYXQsIGZvcm1hdE9wdGlvbnMuY2FsZW5kYXJUeXBlKTtcblx0XHRwYXR0ZXJuID0gcGF0dGVybi5yZXBsYWNlKC8oW1xcdTRlMDAtXFx1OWZhZlxcdTMwMDAtXFx1MzAzZlxcdTMwNDAtXFx1MzA5ZlxcdTMwYTAtXFx1MzBmZlxcdWZmMDAtXFx1ZmZlZl0pKy9naSwgXCJcIik7XG5cdFx0Ly8gUGFyc2luZyB0aGUgXCJ5TVwiIGZvcm1hdCBwYXR0ZXJuIHRvIHRoZSBwYXR0ZXJuIHRoYXQgd291bGQgbWF0Y2ggdGhlIHBhc3NlZCBmb3JtYXRcblx0XHRpZiAoZm9ybWF0T3B0aW9ucy5mb3JtYXQubGVuZ3RoID4gNCkge1xuXHRcdFx0cGF0dGVybiA9IHBhdHRlcm4ucmVwbGFjZSgveSsvaSwgZm9ybWF0T3B0aW9ucy5mb3JtYXQuc2xpY2UoMCwgZm9ybWF0T3B0aW9ucy5mb3JtYXQubGFzdEluZGV4T2YoXCJZXCIpICsgMSkpO1xuXHRcdFx0cGF0dGVybiA9IHBhdHRlcm4ucmVwbGFjZSgvbSsvaSwgZm9ybWF0T3B0aW9ucy5mb3JtYXQuc2xpY2UoZm9ybWF0T3B0aW9ucy5mb3JtYXQubGFzdEluZGV4T2YoXCJZXCIpICsgMSkpO1xuXHRcdH0gZWxzZSBpZiAoZm9ybWF0T3B0aW9ucy5mb3JtYXQgPT09IFwiUFBQXCIpIHtcblx0XHRcdHBhdHRlcm4gPSBcIlBQUFwiO1xuXHRcdH1cblxuXHRcdGNvbnN0IGZvcm1hdEFycmF5ID0gdGhpcy5wYXJzZUNhbGVuZGFyRGF0ZVBhdHRlcm4ocGF0dGVybik7XG5cdFx0dGhpcy5wYXR0ZXJuID0gZm9ybWF0QXJyYXkubGVuZ3RoID4gMSA/IHBhdHRlcm4gOiB1bmRlZmluZWQ7XG5cdFx0dGhpcy5fc2V0Rm9ybWF0UmVnZXgoZm9ybWF0QXJyYXkpO1xuXHRcdHRoaXMuX3NldFBhcnNlUmVnZXgoZm9ybWF0QXJyYXkpO1xuXHRcdHRoaXMuX3NldFZhbGlkYXRpb25SZWdleChmb3JtYXRBcnJheSk7XG5cdH1cblxuXHQvKipcblx0ICogR2V0IGEgZGF0ZSBpbnN0YW5jZSBvZiB0aGUgPGNvZGU+RmlzY2FsRm9ybWF0PC9jb2RlPiBjbGFzcywgd2hpY2ggY2FuIGJlIHVzZWQgZm9yIGZvcm1hdHRpbmcuXG5cdCAqXG5cdCAqIEBwYXJhbSBmb3JtYXRPcHRpb25zIE9iamVjdCB0aGF0IGRlZmluZXMgZm9ybWF0IG9wdGlvbnNcblx0ICogQHBhcmFtIGZvcm1hdE9wdGlvbnMuZm9ybWF0IEZpc2NhbCBmb3JtYXRcblx0ICogQHBhcmFtIGZvcm1hdE9wdGlvbnMuY2FsZW5kYXJUeXBlIENhbGVuZGFyIHR5cGVcblx0ICogQHJldHVybnMgSW5zdGFuY2Ugb2YgdGhlIEZpc2NhbEZvcm1hdFxuXHQgKi9cblx0cHVibGljIHN0YXRpYyBnZXREYXRlSW5zdGFuY2UoZm9ybWF0T3B0aW9uczogeyBmb3JtYXQ6IHN0cmluZzsgY2FsZW5kYXJUeXBlOiBDYWxlbmRhclR5cGUgfSk6IEZpc2NhbEZvcm1hdCB7XG5cdFx0cmV0dXJuIG5ldyBGaXNjYWxGb3JtYXQoZm9ybWF0T3B0aW9ucyk7XG5cdH1cblxuXHRwdWJsaWMgZ2V0UGF0dGVybigpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuXHRcdHJldHVybiB0aGlzLnBhdHRlcm47XG5cdH1cblxuXHQvKipcblx0ICogRm9ybWF0IHRoZSByYXcgZmlzY2FsIGRhdGEgdG8gYSBsb2NhbGUtZGVwZW5kZW50IGZvcm1hdC5cblx0ICpcblx0ICogQHBhcmFtIHZhbHVlIFRoZSBwYXJhbWV0ZXIgY29udGFpbmluZyBhIHJhdyBmaXNjYWwgdmFsdWVcblx0ICogQHJldHVybnMgVGhlIGZvcm1hdHRlZCB2YWx1ZVxuXHQgKi9cblx0cHVibGljIGZvcm1hdCh2YWx1ZTogc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbik6IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4ge1xuXHRcdGlmICh2YWx1ZSA9PSBudWxsKSB7XG5cdFx0XHRyZXR1cm4gXCJcIjtcblx0XHR9XG5cdFx0aWYgKHR5cGVvZiB2YWx1ZSAhPT0gXCJzdHJpbmdcIikge1xuXHRcdFx0cmV0dXJuIHZhbHVlO1xuXHRcdH1cblxuXHRcdHJldHVybiB2YWx1ZS5yZXBsYWNlKHRoaXMuZm9ybWF0UmVnRXhQYXR0ZXJuLCB0aGlzLmZvcm1hdFJlZ0V4R3JvdXBzKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBQYXJzZSBmcm9tIGEgbG9jYWxlLWRlcGVuZGVudCBmb3JtYXQgdG8gYSByYXcgdmFsdWUuXG5cdCAqXG5cdCAqIEBwYXJhbSB2YWx1ZSBUaGUgc3RyaW5nIGNvbnRhaW5pbmcgYSBwYXJzZWQgZmlzY2FsIGRhdGEgdmFsdWVcblx0ICogQHJldHVybnMgVGhlIHJhdyB2YWx1ZVxuXHQgKi9cblx0cHVibGljIHBhcnNlKHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xuXHRcdGlmICghdmFsdWUpIHtcblx0XHRcdHJldHVybiBcIlwiO1xuXHRcdH1cblx0XHRyZXR1cm4gdmFsdWUucmVwbGFjZSh0aGlzLnBhcnNlUmVnRXhQYXR0ZXJuLCB0aGlzLnBhcnNlUmVnRXhSZXBsYWNlcik7XG5cdH1cblxuXHQvKipcblx0ICogVmFsaWRhdGVzIHRoZSBkYXRhIGlucHV0LlxuXHQgKlxuXHQgKiBAcGFyYW0gdmFsdWUgVGhlIHJhdyBmaXNjYWwgZGF0YVxuXHQgKiBAcmV0dXJucyBJZiA8Y29kZT50cnVlPC9jb2RlPiB0aGUgdmFsaWRhdGlvbiBwYXNzZXMsIG90aGVyd2lzZSA8Y29kZT5mYWxzZTwvY29kZT5cblx0ICovXG5cdHB1YmxpYyB2YWxpZGF0ZSh2YWx1ZTogc3RyaW5nKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMudmFsaWRhdGlvblJlZ0V4UGF0dGVybi50ZXN0KHZhbHVlKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBQYXJzZSB0aGUgZGF0ZSBwYXR0ZXJuIHN0cmluZyBhbmQgY3JlYXRlIGEgZm9ybWF0IGFycmF5IGZyb20gaXQuXG5cdCAqIEFycmF5IGlzIHVzZWQgZm9yIGRhdGEgcGFyc2luZyBhbmQgZm9ybWF0dGluZy5cblx0ICpcblx0ICogQHBhcmFtIHBhdHRlcm4gVGhlIGNhbGVuZGFyIGRhdGUgcGF0dGVybiBzdHJpbmdcblx0ICogQHJldHVybnMgRm9ybWF0IGFycmF5XG5cdCAqL1xuXHRwcml2YXRlIHBhcnNlQ2FsZW5kYXJEYXRlUGF0dGVybihwYXR0ZXJuOiBzdHJpbmcpOiB7IGRpZ2l0czogbnVtYmVyOyB2YWx1ZTogc3RyaW5nOyBzeW1ib2w6IHN0cmluZyB9W10ge1xuXHRcdGNvbnN0IGZvcm1hdEFycmF5ID0gW107XG5cdFx0bGV0IGNoYXIsXG5cdFx0XHRjdXJyZW50T2JqZWN0ID0geyBkaWdpdHM6IDAsIHZhbHVlOiBcIlwiLCBzeW1ib2w6IFwiXCIgfTtcblxuXHRcdGZvciAoY29uc3QgY3VyQ2hhciBvZiBwYXR0ZXJuKSB7XG5cdFx0XHRpZiAoY2hhciAhPT0gY3VyQ2hhcikge1xuXHRcdFx0XHRjdXJyZW50T2JqZWN0ID0geyBkaWdpdHM6IDAsIHZhbHVlOiBcIlwiLCBzeW1ib2w6IFwiXCIgfTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGN1cnJlbnRPYmplY3QuZGlnaXRzICs9IDE7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAodHlwZW9mIEZpc2NhbEZvcm1hdC5zeW1ib2xzW2N1ckNoYXIgYXMga2V5b2YgdHlwZW9mIEZpc2NhbEZvcm1hdC5zeW1ib2xzXSA9PT0gXCJ1bmRlZmluZWRcIikge1xuXHRcdFx0XHRjdXJyZW50T2JqZWN0LnZhbHVlID0gY3VyQ2hhcjtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGN1cnJlbnRPYmplY3Quc3ltYm9sID0gY3VyQ2hhcjtcblx0XHRcdFx0Y3VycmVudE9iamVjdC5kaWdpdHMgPSAxO1xuXHRcdFx0fVxuXHRcdFx0Y2hhciA9IGN1ckNoYXI7XG5cdFx0XHRmb3JtYXRBcnJheS5wdXNoKGN1cnJlbnRPYmplY3QpO1xuXHRcdH1cblxuXHRcdHJldHVybiBmb3JtYXRBcnJheTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIHRoZSBmb3JtYXR0aW5nIHJlZ3VsYXIgZXhwcmVzc2lvbiBiYXNlZCBvbiB0aGUgbG9jYWxlLWRlcGVuZGVudCBmb3JtYXQuXG5cdCAqXG5cdCAqIEBwYXJhbSBmb3JtYXRBcnJheSBBbiBhcnJheSB3aXRoIHRoZSBsb2NhbGUtZGVwZW5kZW50IGZvcm1hdFxuXHQgKi9cblx0cHJpdmF0ZSBfc2V0Rm9ybWF0UmVnZXgoZm9ybWF0QXJyYXk6IHsgZGlnaXRzOiBudW1iZXI7IHZhbHVlOiBzdHJpbmc7IHN5bWJvbDogc3RyaW5nIH1bXSk6IHZvaWQge1xuXHRcdGNvbnN0IHJlZ0V4UGF0dGVybiA9IFtdLFxuXHRcdFx0cmVnRXhHcm91cHMgPSBbXTtcblx0XHRsZXQgcGFydCwgc3ltYm9sLCByZWdleCwgeWVhcjtcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGZvcm1hdEFycmF5Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRwYXJ0ID0gZm9ybWF0QXJyYXlbaV07XG5cdFx0XHRzeW1ib2wgPSBwYXJ0LnN5bWJvbDtcblx0XHRcdHJlZ2V4ID0gRmlzY2FsRm9ybWF0LnN5bWJvbHNbc3ltYm9sIGFzIGtleW9mIHR5cGVvZiBGaXNjYWxGb3JtYXQuc3ltYm9sc10uZm9ybWF0O1xuXG5cdFx0XHRpZiAoc3ltYm9sID09PSBcIlwiKSB7XG5cdFx0XHRcdHJlZ0V4R3JvdXBzW2ldID0gcGFydC52YWx1ZTtcblx0XHRcdH0gZWxzZSBpZiAoc3ltYm9sLnRvTG9jYWxlTG93ZXJDYXNlKCkgPT09IFwieVwiKSB7XG5cdFx0XHRcdHJlZ0V4UGF0dGVybi51bnNoaWZ0KFwiKFwiICsgcmVnZXguc291cmNlICsgXCIpXCIpO1xuXHRcdFx0XHRyZWdFeEdyb3Vwc1tpXSA9IFwiJFwiICsgMTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJlZ0V4UGF0dGVybi5wdXNoKFwiKFwiICsgcmVnZXguc291cmNlICsgXCIpXCIpO1xuXHRcdFx0XHR5ZWFyID0gZm9ybWF0QXJyYXkuc29tZShmdW5jdGlvbiAocGFydEVudHJ5KSB7XG5cdFx0XHRcdFx0cmV0dXJuIHBhcnRFbnRyeS5zeW1ib2wudG9Mb3dlckNhc2UoKSA9PT0gXCJ5XCI7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRyZWdFeEdyb3Vwc1tpXSA9IHllYXIgPyBcIiRcIiArIDIgOiBcIiRcIiArIDE7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy5mb3JtYXRSZWdFeFBhdHRlcm4gPSBuZXcgUmVnRXhwKHJlZ0V4UGF0dGVybi5qb2luKFwiXCIpKTtcblx0XHR0aGlzLmZvcm1hdFJlZ0V4R3JvdXBzID0gcmVnRXhHcm91cHMuam9pbihcIlwiKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIHRoZSBwYXJzaW5nIHJlZ3VsYXIgZXhwcmVzc2lvbiBiYXNlZCBvbiB0aGUgbG9jYWxlLWRlcGVuZGVudCBmb3JtYXQuXG5cdCAqXG5cdCAqIEBwYXJhbSBmb3JtYXRBcnJheSBBbiBhcnJheSB3aXRoIHRoZSBsb2NhbGUtZGVwZW5kZW50IGZvcm1hdFxuXHQgKi9cblx0cHJpdmF0ZSBfc2V0UGFyc2VSZWdleChmb3JtYXRBcnJheTogeyBkaWdpdHM6IG51bWJlcjsgdmFsdWU6IHN0cmluZzsgc3ltYm9sOiBzdHJpbmcgfVtdKTogdm9pZCB7XG5cdFx0Y29uc3QgcmVnRXhQYXR0ZXJuID0gW10sXG5cdFx0XHRmaWx0ZXJlZEZvcm1hdDogeyBbaW5kZXg6IHN0cmluZ106IHsgZGlnaXRzOiBudW1iZXI7IHZhbHVlOiBzdHJpbmc7IHN5bWJvbDogc3RyaW5nIH0gfSA9IHt9O1xuXHRcdGxldCBzeW1ib2wsXG5cdFx0XHRyZWdleCxcblx0XHRcdGN1cnJHcm91cDogbnVtYmVyLFxuXHRcdFx0Z3JvdXAgPSAwO1xuXHRcdGZvciAoY29uc3QgcGFydCBvZiBmb3JtYXRBcnJheSkge1xuXHRcdFx0c3ltYm9sID0gcGFydC5zeW1ib2w7XG5cblx0XHRcdGlmIChzeW1ib2wgPT09IFwiXCIpIHtcblx0XHRcdFx0cmVnRXhQYXR0ZXJuLnB1c2goXCJcXFxcRCs/XCIpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmVnZXggPSBGaXNjYWxGb3JtYXQuc3ltYm9sc1tzeW1ib2wgYXMga2V5b2YgdHlwZW9mIEZpc2NhbEZvcm1hdC5zeW1ib2xzXS5wYXJzZTtcblx0XHRcdFx0cmVnRXhQYXR0ZXJuLnB1c2goXCIoXCIgKyByZWdleC5zb3VyY2UgKyBcIilcIik7XG5cdFx0XHRcdGN1cnJHcm91cCA9ICsrZ3JvdXA7XG5cdFx0XHRcdGZpbHRlcmVkRm9ybWF0W2N1cnJHcm91cF0gPSBwYXJ0O1xuXHRcdFx0fVxuXHRcdH1cblx0XHR0aGlzLnBhcnNlUmVnRXhQYXR0ZXJuID0gbmV3IFJlZ0V4cChcIl5cIiArIHJlZ0V4UGF0dGVybi5qb2luKFwiXCIpICsgXCIkXCIpO1xuXHRcdHRoaXMucGFyc2VSZWdFeFJlcGxhY2VyID0gdGhpcy5nZXRSZWdFeFJlcGxhY2VyKGZpbHRlcmVkRm9ybWF0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgZnVuY3Rpb24gdGhhdCBpcyB1c2VkIHRvIHJlcGxhY2Ugc3RyaW5ncyBhbmQgdGhlbiBwZXJmb3JtcyByYXcgc3RyaW5nIHBhcnNpbmcuXG5cdCAqXG5cdCAqIEBwYXJhbSBmaWx0ZXJlZEZvcm1hdCBBbiBhcnJheSB3aXRoIHRoZSBsb2NhbGUtZGVwZW5kZW50IGZvcm1hdFxuXHQgKiBAcmV0dXJucyBGdW5jdGlvbiB0aGF0IGNhbiBiZSBwYXNzZWQgaW50byB0aGUgc3RyaW5nLnJlcGxhY2UgZnVuY3Rpb25cblx0ICovXG5cdHByaXZhdGUgZ2V0UmVnRXhSZXBsYWNlcihmaWx0ZXJlZEZvcm1hdDoge1xuXHRcdFtpbmRleDogc3RyaW5nXTogeyBkaWdpdHM6IG51bWJlcjsgdmFsdWU6IHN0cmluZzsgc3ltYm9sOiBzdHJpbmcgfTtcblx0fSk6IChzdWJzdHJpbmc6IHN0cmluZywgLi4uYXJnczogYW55W10pID0+IHN0cmluZyB7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uICguLi5hcmdzOiBhbnlbXSkge1xuXHRcdFx0Y29uc3QgcmVzdWx0ID0gW107XG5cdFx0XHRsZXQgdmFsdWVQYXJ0LCBzdHJpbmdHcm91cDtcblx0XHRcdGZvciAoY29uc3Qga2V5IGluIGZpbHRlcmVkRm9ybWF0KSB7XG5cdFx0XHRcdHZhbHVlUGFydCA9IGZpbHRlcmVkRm9ybWF0W2tleV07XG5cdFx0XHRcdHN0cmluZ0dyb3VwID0gYXJnc1twYXJzZUludChrZXksIDEwKV07XG5cdFx0XHRcdGlmIChzdHJpbmdHcm91cC5sZW5ndGggPCB2YWx1ZVBhcnQuZGlnaXRzKSB7XG5cdFx0XHRcdFx0aWYgKHZhbHVlUGFydC5zeW1ib2wudG9Mb3dlckNhc2UoKSA9PT0gXCJ5XCIpIHtcblx0XHRcdFx0XHRcdHN0cmluZ0dyb3VwID0gcGFyc2VZZWFyKHN0cmluZ0dyb3VwKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0c3RyaW5nR3JvdXAgPSBzdHJpbmdHcm91cC5wYWRTdGFydCh2YWx1ZVBhcnQuZGlnaXRzLCBcIjBcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICh2YWx1ZVBhcnQuc3ltYm9sLnRvTG93ZXJDYXNlKCkgPT09IFwieVwiKSB7XG5cdFx0XHRcdFx0cmVzdWx0LnVuc2hpZnQoc3RyaW5nR3JvdXApO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJlc3VsdC5wdXNoKHN0cmluZ0dyb3VwKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gcmVzdWx0LmpvaW4oXCJcIik7XG5cdFx0fTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIHRoZSB2YWxpZGF0aW9uIHJlZ3VsYXIgZXhwcmVzc2lvbiBiYXNlZCBvbiB0aGUgZm9ybWF0LlxuXHQgKlxuXHQgKiBAcGFyYW0gZm9ybWF0QXJyYXkgQW4gYXJyYXkgd2l0aCB0aGUgbG9jYWxlLWRlcGVuZGVudCBmb3JtYXRcblx0ICovXG5cdHByaXZhdGUgX3NldFZhbGlkYXRpb25SZWdleChmb3JtYXRBcnJheTogeyBkaWdpdHM6IG51bWJlcjsgdmFsdWU6IHN0cmluZzsgc3ltYm9sOiBzdHJpbmcgfVtdKTogdm9pZCB7XG5cdFx0Y29uc3QgcmVnRXhQYXR0ZXJuID0gW107XG5cdFx0bGV0IHN5bWJvbCwgcmVnZXg7XG5cdFx0Zm9yIChjb25zdCBwYXJ0IG9mIGZvcm1hdEFycmF5KSB7XG5cdFx0XHRzeW1ib2wgPSBwYXJ0LnN5bWJvbDtcblx0XHRcdHJlZ2V4ID0gRmlzY2FsRm9ybWF0LnN5bWJvbHNbc3ltYm9sIGFzIGtleW9mIHR5cGVvZiBGaXNjYWxGb3JtYXQuc3ltYm9sc10uZm9ybWF0O1xuXHRcdFx0aWYgKHN5bWJvbCA9PT0gXCJcIikge1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH0gZWxzZSBpZiAoc3ltYm9sLnRvTG93ZXJDYXNlKCkgPT09IFwieVwiKSB7XG5cdFx0XHRcdHJlZ0V4UGF0dGVybi51bnNoaWZ0KHJlZ2V4LnNvdXJjZSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZWdFeFBhdHRlcm4ucHVzaChyZWdleC5zb3VyY2UpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHR0aGlzLnZhbGlkYXRpb25SZWdFeFBhdHRlcm4gPSBuZXcgUmVnRXhwKFwiXihcIiArIHJlZ0V4UGF0dGVybi5qb2luKFwiKShcIikgKyBcIikkXCIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlZ3VsYXIgZXhwcmVzc2lvbiBwYXR0ZXJucyB1c2VkIHRvIGZvcm1hdCBmaXNjYWwgZGF0ZSBzdHJpbmdzXG5cdCAqL1xuXHRwcml2YXRlIHN0YXRpYyByZWdleEZvcm1hdFBhdHRlcm5zID0ge1xuXHRcdHllYXI6IC9bMS05XVxcZHszfS8sXG5cdFx0cGVyaW9kOiAvXFxkezN9Lyxcblx0XHRxdWFydGVyOiAvWzEtNF0vLFxuXHRcdHdlZWs6IC8wWzEtOV18WzEtNF1cXGR8NVswLTNdLyxcblx0XHRkYXk6IC8zNzF8MzcwfDNbMC02XVxcZHxbMS0yXVxcZHsyfXxbMS05XVxcZHxbMS05XS9cblx0fTtcblxuXHQvKipcblx0ICogUmVndWxhciBleHByZXNzaW9uIHBhdHRlcm5zIHVzZWQgZm9yIHJhdyBkYXRhIHBhcnNpbmcgYW5kIHZhbGlkYXRpb25cblx0ICovXG5cdHByaXZhdGUgc3RhdGljIHJlZ2V4UGFyc2VQYXR0ZXJucyA9IHtcblx0XHR5ZWFyOiAvXFxkezEsNH0vLFxuXHRcdHBlcmlvZDogL1xcZHsxLDN9Lyxcblx0XHRxdWFydGVyOiAvWzEtNF0vLFxuXHRcdHdlZWs6IC9cXGR7MSwyfS8sXG5cdFx0ZGF5OiAvWzEtOV0vXG5cdH07XG5cblx0LyoqXG5cdCAqIE1hcHBpbmcgZnJvbSBzcGVjaWZpYyBjYWxlbmRhciB0eXBlIHRvIGNvcnJlc3BvbmRpbmcgZm9ybWF0dGluZy9wYXJzaW5nIGV4cHJlc3Npb25cblx0ICovXG5cdHByaXZhdGUgc3RhdGljIHN5bWJvbHMgPSB7XG5cdFx0XCJcIjogeyBmb3JtYXQ6IC8gLywgcGFyc2U6IC8gLyB9LCAvLyBcInRleHRcIlxuXHRcdHk6IHsgZm9ybWF0OiBGaXNjYWxGb3JtYXQucmVnZXhGb3JtYXRQYXR0ZXJucy55ZWFyLCBwYXJzZTogRmlzY2FsRm9ybWF0LnJlZ2V4UGFyc2VQYXR0ZXJucy55ZWFyIH0sIC8vIFwieWVhclwiXG5cdFx0WTogeyBmb3JtYXQ6IEZpc2NhbEZvcm1hdC5yZWdleEZvcm1hdFBhdHRlcm5zLnllYXIsIHBhcnNlOiBGaXNjYWxGb3JtYXQucmVnZXhQYXJzZVBhdHRlcm5zLnllYXIgfSwgLy8gXCJ3ZWVrWWVhclwiXG5cdFx0UDogeyBmb3JtYXQ6IEZpc2NhbEZvcm1hdC5yZWdleEZvcm1hdFBhdHRlcm5zLnBlcmlvZCwgcGFyc2U6IEZpc2NhbEZvcm1hdC5yZWdleFBhcnNlUGF0dGVybnMucGVyaW9kIH0sIC8vIFwicGVyaW9kXCJcblx0XHRXOiB7IGZvcm1hdDogRmlzY2FsRm9ybWF0LnJlZ2V4Rm9ybWF0UGF0dGVybnMud2VlaywgcGFyc2U6IEZpc2NhbEZvcm1hdC5yZWdleFBhcnNlUGF0dGVybnMud2VlayB9LCAvLyBcIndlZWtJblllYXJcIlxuXHRcdGQ6IHsgZm9ybWF0OiBGaXNjYWxGb3JtYXQucmVnZXhGb3JtYXRQYXR0ZXJucy5kYXksIHBhcnNlOiBGaXNjYWxGb3JtYXQucmVnZXhQYXJzZVBhdHRlcm5zLmRheSB9LCAvLyBcImRheUluWWVhclwiXG5cdFx0UTogeyBmb3JtYXQ6IEZpc2NhbEZvcm1hdC5yZWdleEZvcm1hdFBhdHRlcm5zLnF1YXJ0ZXIsIHBhcnNlOiBGaXNjYWxGb3JtYXQucmVnZXhQYXJzZVBhdHRlcm5zLnF1YXJ0ZXIgfSwgLy8gXCJxdWFydGVyXCJcblx0XHRxOiB7IGZvcm1hdDogRmlzY2FsRm9ybWF0LnJlZ2V4Rm9ybWF0UGF0dGVybnMucXVhcnRlciwgcGFyc2U6IEZpc2NhbEZvcm1hdC5yZWdleFBhcnNlUGF0dGVybnMucXVhcnRlciB9IC8vXCJxdWFydGVyU3RhbmRhbG9uZVwiXG5cdH07XG59XG5cbi8qKlxuICogUGFyc2VzIHRoZSBZZWFyIGZvcm1hdC4gVGhpcyBpcyBob3cgdGhlIERhdGVGb3JtYXQgcGFyc2VzIHllYXJzLCBleGNlcHQgdGhvc2UgeWVhcnMgY29uc2lzdGluZyBvZiAzIGRpZ2l0cywgc2luY2UgY3VycmVuY3kgZmlzY2FsIGRhdGVzIHN1cHBvcnQgb25seSB5ZWFycyBjb25zaXN0aW5nIG9mIDQgZGlnaXRzLlxuICpcbiAqIEBwYXJhbSB5ZWFyIFllYXIgc3RyaW5nXG4gKiBAcmV0dXJucyBZZWFyIG51bWJlclxuICovXG5mdW5jdGlvbiBwYXJzZVllYXIoeWVhcjogc3RyaW5nKTogbnVtYmVyIHtcblx0bGV0IHBhcnNlZFllYXIgPSBOdW1iZXIucGFyc2VJbnQoeWVhciwgMTApO1xuXHRjb25zdCBjdXJyZW50WWVhciA9IG5ldyBEYXRlKCkuZ2V0VVRDRnVsbFllYXIoKSxcblx0XHRjdXJyZW50Q2VudHVyeSA9IE1hdGguZmxvb3IoY3VycmVudFllYXIgLyAxMDApLFxuXHRcdHllYXJEaWZmID0gY3VycmVudENlbnR1cnkgKiAxMDAgKyBwYXJzZWRZZWFyIC0gY3VycmVudFllYXI7XG5cblx0aWYgKHllYXIubGVuZ3RoID09PSAzKSB7XG5cdFx0cGFyc2VkWWVhciArPSBNYXRoLmZsb29yKChjdXJyZW50Q2VudHVyeSAtIDEpIC8gMTApICogMTAwMDtcblx0fSBlbHNlIGlmICh5ZWFyRGlmZiA8IC03MCkge1xuXHRcdHBhcnNlZFllYXIgKz0gKGN1cnJlbnRDZW50dXJ5ICsgMSkgKiAxMDA7IC8vIFRha2UgbmV4dCBjZW50dXJ5IGlmIFwieWVhclwiIGlzIDMwIHllYXJzIGluIHRoZSBmdXR1cmUuIEN1cnJlbnQgeWVhciAxOTk5IGFuZCB3ZSBlbnRlciAyOCBpdCB3aWxsIHdlIDIwMjhcblx0fSBlbHNlIGlmICh5ZWFyRGlmZiA8IDMwKSB7XG5cdFx0cGFyc2VkWWVhciArPSBjdXJyZW50Q2VudHVyeSAqIDEwMDsgLy8gVGFrZSBuZXh0IGNlbnR1cnkgaWYgXCJ5ZWFyXCIgaXMgMzAgeWVhcnMgaW4gdGhlIGZ1dHVyZS4gQ3VycmVudCB5ZWFyIDIwMDAgYW5kIHdlIGVudGVyIDI5IGl0IHdpbGwgd2UgMjAyOVxuXHR9IGVsc2Uge1xuXHRcdHBhcnNlZFllYXIgKz0gKGN1cnJlbnRDZW50dXJ5IC0gMSkgKiAxMDA7IC8vIEFueSBlbnRlcmVkIFwieWVhclwiIHRoYXQgaXMgbW9yZSB0aGFuIDMwIHllYXJzIGluIHRoZSBmdXR1cmUgd2lsbCBiZSB0cmVhdGVkIGFzIGZyb20gcHJldmlvdXMgY2VudHVyeVxuXHR9XG5cdHJldHVybiBwYXJzZWRZZWFyO1xufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7OztFQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQWRBLElBZXFCQSxZQUFZO0lBUWhDLHNCQUFZQyxhQUE2RCxFQUFFO01BQzFFLE1BQU1DLE1BQU0sR0FBRyxJQUFJQyxNQUFNLENBQUNDLEdBQUcsQ0FBQ0MsRUFBRSxDQUFDQyxPQUFPLEVBQUUsQ0FBQ0MsZ0JBQWdCLEVBQUUsQ0FBQ0MsV0FBVyxFQUFFLENBQUM7UUFDM0VDLFVBQVUsR0FBRyxJQUFJQyxVQUFVLENBQUNSLE1BQU0sQ0FBQztNQUVwQyxJQUFJUyxNQUFNLEdBQUdWLGFBQWEsQ0FBQ1UsTUFBTTtNQUNqQyxJQUFJVixhQUFhLENBQUNVLE1BQU0sQ0FBQ0MsTUFBTSxHQUFHLENBQUMsRUFBRTtRQUNwQ0QsTUFBTSxHQUFHLElBQUk7TUFDZCxDQUFDLE1BQU0s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