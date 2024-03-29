/*
 * SAPUI5
  (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
/*global sap*/
sap.ui.define(
  [
    "jquery.sap.global",
    "sap/sac/df/thirdparty/lodash",
    "sap/zen/dsh/widgets/utils/info_chart_exception",
    "sap/zen/dsh/utils/BaseHandler"
  ],
  function(jQuery,_,InfoChartException) {
    "use strict";
    var DEFAULT_ERROR_KEY = "error.default";
    var ERROR_LEVELS = {
      "control.nodatasource": "warn",
      "mapper.nodata": "warn"
    };
    var PROPERTIES_URL = sap.zen.dsh.sapbizen_hybridmode ? (sap.zen.dsh.sapbi_page.staticMimeUrlPrefix + "/zen_rt_components_infochart/langs/localization.properties") : (sap.ui.resource("sap.zen.dsh","i18n/langs/localization.properties"));
    // XXX Looks like we don't have any descriptons -> refactor?
    var RESOURCE_MAP = {
      "infochart.control.nodatasource.title": "NO_DATA_SOURCE",
      "infochart.mapper.nodata.title": "NO_DATA",
      "infochart.error.generic.title": "GENERIC_ERROR",
      "infochart.error.default.title": "GENERIC_ERROR",
      "infochart.bindings.missing.measuresAndDimensions.title": "ADD_MORE_MEASURES_OR_DIMENSIONS",
      "infochart.bindings.missing.measures.title": "ADD_MORE_MEASURES",
      "infochart.bindings.missing.dimensions.title":  "ADD_MORE_DIMENSIONS",
      "infochart.bindings.error.title": "ADD_MORE_MEASURES_OR_DIMENSIONS",
      "infochart.control.invalidChartType.title": "INVALID_CHART_TYPE"
    };
    ERROR_LEVELS[DEFAULT_ERROR_KEY] = "error";

    //sap.zen.designmode
    function ErrorLookup(isDesignTime, infoChartLocale, getResourceString) {
      this.isDesignTime = !!isDesignTime;
      this.getResourceString = getResourceString || function(str) {
        var resourceKey = RESOURCE_MAP[str];
        return resourceKey && infoChartLocale.getBundle(PROPERTIES_URL).getText(resourceKey);
      };
    }

    ErrorLookup.prototype.get = function(e) {
      var key = "error.generic";
      var description;
      if (e instanceof InfoChartException) {
        key = e.message;
      } else {
        description = e ? e.message || e : null;
      }
      return {
        "title": getTitle(this, key),
        "description": description || getDescription(this, key),
        "level": ERROR_LEVELS[key] || ERROR_LEVELS[DEFAULT_ERROR_KEY]
      };
    };

    function getTitle(self, key) {
      return getInfoChartStringOrDefault(self, key, ".title");
    }

    function getDescription(self, key) {
      return getInfoChartStringOrDefault(self, key, ".description");
    }

    function getInfoChartStringOrDefault(self, key, suffix) {
      return getInfoChartString(self, key, suffix) ||
        getInfoChartString(self, DEFAULT_ERROR_KEY, suffix);
    }

    function getInfoChartString(self, key, suffix) {
      return self.getResourceString("infochart." + key + suffix);
    }

    return ErrorLookup;
  }
);
