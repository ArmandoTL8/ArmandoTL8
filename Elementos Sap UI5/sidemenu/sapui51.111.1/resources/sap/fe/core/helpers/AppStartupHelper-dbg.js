/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/model/Filter", "sap/ui/model/FilterOperator", "./ModelHelper"], function (Filter, FilterOperator, ModelHelper) {
  "use strict";

  const AppStartupHelper = {
    /**
     * Retrieves a set of key values from startup parameters.
     *
     * @param aKeyNames The array of key names
     * @param oStartupParameters The startup parameters
     * @returns An array of pairs \{name, value\} if all key values could be found in the startup parameters, undefined otherwise
     */
    _getKeysFromStartupParams: function (aKeyNames, oStartupParameters) {
      let bAllFound = true;
      const aKeys = aKeyNames.map(name => {
        if (oStartupParameters[name] && oStartupParameters[name].length === 1) {
          return {
            name,
            value: oStartupParameters[name][0]
          };
        } else {
          // A unique key value couldn't be found in the startup parameters
          bAllFound = false;
          return {
            name,
            value: ""
          };
        }
      });
      return bAllFound ? aKeys : undefined;
    },
    /**
     * Creates a filter from a list of key values.
     *
     * @param aKeys Array of semantic keys or technical keys (with values)
     * @param bDraftMode True if the entity supports draft mode
     * @param oMetaModel The metamodel
     * @returns The filter
     */
    _createFilterFromKeys: function (aKeys, bDraftMode, oMetaModel) {
      const bFilterCaseSensitive = ModelHelper.isFilteringCaseSensitive(oMetaModel);
      let bFilterOnActiveEntity = false;
      const aFilters = aKeys.map(key => {
        if (key.name === "IsActiveEntity") {
          bFilterOnActiveEntity = true;
        }
        return new Filter({
          path: key.name,
          operator: FilterOperator.EQ,
          value1: key.value,
          caseSensitive: bFilterCaseSensitive
        });
      });
      if (bDraftMode && !bFilterOnActiveEntity) {
        const oDraftFilter = new Filter({
          filters: [new Filter("IsActiveEntity", "EQ", false), new Filter("SiblingEntity/IsActiveEntity", "EQ", null)],
          and: false
        });
        aFilters.push(oDraftFilter);
      }
      return new Filter(aFilters, true);
    },
    /**
     * Loads all contexts for a list of page infos.
     *
     * @param aStartupPages The list of page infos
     * @param oModel The model used to load the contexts
     * @returns A Promise for all contexts
     */
    _requestObjectsFromParameters: function (aStartupPages, oModel) {
      // Load the respective objects for all object pages found in aExternallyNavigablePages
      const aContextPromises = aStartupPages.map(pageInfo => {
        const aKeys = pageInfo.semanticKeys || pageInfo.technicalKeys || [];
        const oFilter = this._createFilterFromKeys(aKeys, pageInfo.draftMode, oModel.getMetaModel());

        // only request a minimum of fields to boost backend performance since this is only used to check if an object exists
        const oListBind = oModel.bindList(pageInfo.contextPath, undefined, undefined, oFilter, {
          $select: aKeys.map(key => {
            return key.name;
          }).join(",")
        });
        return oListBind.requestContexts(0, 2);
      });
      return Promise.all(aContextPromises);
    },
    /**
     * Creates a PageInfo from a route if it's reachable from the startup parameters.
     *
     * @param oRoute The route
     * @param oManifestRouting The app manifest routing section
     * @param oStartupParameters The startup parameters
     * @param oMetaModel The app metamodel
     * @returns A page info if the page is reachable, undefined otherwise
     */
    _getReachablePageInfoFromRoute: function (oRoute, oManifestRouting, oStartupParameters, oMetaModel) {
      var _oTarget$options, _oTarget$options$sett;
      // Remove trailing ':?query:' and '/'
      let sPattern = oRoute.pattern.replace(":?query:", "");
      sPattern = sPattern.replace(/\/$/, "");
      if (!sPattern || !sPattern.endsWith(")")) {
        // Ignore level-0 routes (ListReport) or routes corresponding to a 1-1 relation (no keys in the URL in this case)
        return undefined;
      }
      sPattern = sPattern.replace(/\(\{[^\}]*\}\)/g, "(#)"); // Replace keys with #

      // Get the rightmost target for this route
      const sTargetName = Array.isArray(oRoute.target) ? oRoute.target[oRoute.target.length - 1] : oRoute.target;
      const oTarget = oManifestRouting.targets[sTargetName];
      const aPatternSegments = sPattern.split("/");
      const pageLevel = aPatternSegments.length - 1;
      if (pageLevel !== 0 && (oTarget === null || oTarget === void 0 ? void 0 : (_oTarget$options = oTarget.options) === null || _oTarget$options === void 0 ? void 0 : (_oTarget$options$sett = _oTarget$options.settings) === null || _oTarget$options$sett === void 0 ? void 0 : _oTarget$options$sett.allowDeepLinking) !== true) {
        // The first level of object page allows deep linking by default.
        // Otherwise, the target must allow deep linking explicitely in the manifest
        return undefined;
      }
      const sContextPath = oTarget.options.settings.contextPath || oTarget.options.settings.entitySet && `/${oTarget.options.settings.entitySet}`;
      const oEntityType = sContextPath && oMetaModel.getObject(`/$EntityContainer${sContextPath}/`);
      if (!oEntityType) {
        return undefined;
      }

      // Get the semantic key values for the entity
      const aSemanticKeyNames = oMetaModel.getObject(`/$EntityContainer${sContextPath}/@com.sap.vocabularies.Common.v1.SemanticKey`);
      const aSemantickKeys = aSemanticKeyNames ? this._getKeysFromStartupParams(aSemanticKeyNames.map(semKey => {
        return semKey.$PropertyPath;
      }), oStartupParameters) : undefined;

      // Get the technical keys only if we couldn't find the semantic key values, and on first level OP
      const aTechnicalKeys = !aSemantickKeys && pageLevel === 0 ? this._getKeysFromStartupParams(oEntityType["$Key"], oStartupParameters) : undefined;
      if (aSemantickKeys === undefined && aTechnicalKeys === undefined) {
        // We couldn't find the semantic/technical keys in the startup parameters
        return undefined;
      }

      // The startup parameters contain values for all semantic keys (or technical keys) --> we can store the page info in the corresponding level
      const draftMode = oMetaModel.getObject(`/$EntityContainer${sContextPath}@com.sap.vocabularies.Common.v1.DraftRoot`) || oMetaModel.getObject(`/$EntityContainer${sContextPath}@com.sap.vocabularies.Common.v1.DraftNode`) ? true : false;
      return {
        pattern: sPattern,
        contextPath: sContextPath,
        draftMode,
        technicalKeys: aTechnicalKeys,
        semanticKeys: aSemantickKeys,
        target: sTargetName,
        pageLevel
      };
    },
    /**
     * Returns the list of all pages that allow deeplink and that can be reached using the startup parameters.
     *
     * @param oManifestRouting The routing information from the app manifest
     * @param oStartupParameters The startup parameters
     * @param oMetaModel The metamodel
     * @returns The reachable pages
     */
    _getReachablePages: function (oManifestRouting, oStartupParameters, oMetaModel) {
      const aRoutes = oManifestRouting.routes;
      const mPagesByLevel = {};
      aRoutes.forEach(oRoute => {
        const oPageInfo = this._getReachablePageInfoFromRoute(oRoute, oManifestRouting, oStartupParameters, oMetaModel);
        if (oPageInfo) {
          if (!mPagesByLevel[oPageInfo.pageLevel]) {
            mPagesByLevel[oPageInfo.pageLevel] = [];
          }
          mPagesByLevel[oPageInfo.pageLevel].push(oPageInfo);
        }
      });

      // A page is reachable only if all its parents are also reachable
      // So if we couldn't find any pages for a given level, all pages with a higher level won't be reachable anyway
      const aReachablePages = [];
      let level = 0;
      while (mPagesByLevel[level]) {
        aReachablePages.push(mPagesByLevel[level]);
        level++;
      }
      return aReachablePages;
    },
    /**
     * Get the list of startup pages.
     *
     * @param oManifestRouting The routing information from the app manifest
     * @param oStartupParameters The startup parameters
     * @param oMetaModel The metamodel
     * @returns An array of startup page infos
     */
    _getStartupPagesFromStartupParams: function (oManifestRouting, oStartupParameters, oMetaModel) {
      // Find all pages that can be reached with the startup parameters
      const aReachablePages = this._getReachablePages(oManifestRouting, oStartupParameters, oMetaModel);
      if (aReachablePages.length === 0) {
        return [];
      }

      // Find the longest sequence of pages that can be reached (recursively)
      let result = [];
      const current = [];
      function findRecursive(level) {
        const aCurrentLevelPages = aReachablePages[level];
        const lastPage = current.length ? current[current.length - 1] : undefined;
        if (aCurrentLevelPages) {
          aCurrentLevelPages.forEach(function (nextPage) {
            if (!lastPage || nextPage.pattern.indexOf(lastPage.pattern) === 0) {
              // We only consider pages that can be reached from the page at the previous level,
              // --> their pattern must be the pattern of the previous page with another segment appended
              current.push(nextPage);
              findRecursive(level + 1);
              current.pop();
            }
          });
        }
        if (current.length > result.length) {
          result = current.slice(); // We have found a sequence longer than our previous best --> store it as the new longest
        }
      }

      findRecursive(0);
      return result;
    },
    /**
     * Creates the startup object from the list of pages and contexts.
     *
     * @param aStartupPages The pages
     * @param aContexts The contexts
     * @returns An object containing either a hash or a context to navigate to, or an empty object if no deep link was found
     */
    _getDeepLinkObject: function (aStartupPages, aContexts) {
      if (aContexts.length === 1) {
        return {
          context: aContexts[0]
        };
      } else if (aContexts.length > 1) {
        // Navigation to a deeper level --> use the pattern of the deepest object page
        // and replace the parameters by the ID from the contexts
        let hash = aStartupPages[aStartupPages.length - 1].pattern;
        aContexts.forEach(function (oContext) {
          hash = hash.replace("(#)", `(${oContext.getPath().split("(")[1]}`);
        });
        return {
          hash
        };
      } else {
        return {};
      }
    },
    /**
     * Calculates startup parameters for a deeplink case, from startup parameters and routing infoirmation.
     *
     * @param oManifestRouting The routing information from the app manifest
     * @param oStartupParameters The startup parameters
     * @param oModel The OData model
     * @returns An object containing either a hash or a context to navigate to, or an empty object if no deep link was found
     */
    getDeepLinkStartupHash: function (oManifestRouting, oStartupParameters, oModel) {
      let aStartupPages;
      return oModel.getMetaModel().requestObject("/$EntityContainer/").then(() => {
        // Check if semantic keys are present in url parameters for every object page at each level
        aStartupPages = this._getStartupPagesFromStartupParams(oManifestRouting, oStartupParameters, oModel.getMetaModel());
        return this._requestObjectsFromParameters(aStartupPages, oModel);
      }).then(aValues => {
        if (aValues.length) {
          // Make sure we only get 1 context per promise, and flatten the array
          const aContexts = [];
          aValues.forEach(function (aFoundContexts) {
            if (aFoundContexts.length === 1) {
              aContexts.push(aFoundContexts[0]);
            }
          });
          return aContexts.length === aValues.length ? this._getDeepLinkObject(aStartupPages, aContexts) : {};
        } else {
          return {};
        }
      });
    },
    /**
     * Calculates the new hash based on the startup parameters.
     *
     * @param oStartupParameters The startup parameter values (map parameter name -> array of values)
     * @param sContextPath The context path for the startup of the app (generally the path to the main entity set)
     * @param oRouter The router instance
     * @param oMetaModel The meta model
     * @returns A promise containing the hash to navigate to, or an empty string if there's no need to navigate
     */
    getCreateStartupHash: function (oStartupParameters, sContextPath, oRouter, oMetaModel) {
      return oMetaModel.requestObject(`${sContextPath}@`).then(oEntitySetAnnotations => {
        let sMetaPath = "";
        let bCreatable = true;
        if (oEntitySetAnnotations["@com.sap.vocabularies.Common.v1.DraftRoot"] && oEntitySetAnnotations["@com.sap.vocabularies.Common.v1.DraftRoot"]["NewAction"]) {
          sMetaPath = `${sContextPath}@com.sap.vocabularies.Common.v1.DraftRoot/NewAction@Org.OData.Core.V1.OperationAvailable`;
        } else if (oEntitySetAnnotations["@com.sap.vocabularies.Session.v1.StickySessionSupported"] && oEntitySetAnnotations["@com.sap.vocabularies.Session.v1.StickySessionSupported"]["NewAction"]) {
          sMetaPath = `${sContextPath}@com.sap.vocabularies.Session.v1.StickySessionSupported/NewAction@Org.OData.Core.V1.OperationAvailable`;
        }
        if (sMetaPath) {
          const bNewActionOperationAvailable = oMetaModel.getObject(sMetaPath);
          if (bNewActionOperationAvailable === false) {
            bCreatable = false;
          }
        } else {
          const oInsertRestrictions = oEntitySetAnnotations["@Org.OData.Capabilities.V1.InsertRestrictions"];
          if (oInsertRestrictions && oInsertRestrictions.Insertable === false) {
            bCreatable = false;
          }
        }
        if (bCreatable) {
          return this.getDefaultCreateHash(oStartupParameters, sContextPath, oRouter);
        } else {
          return "";
        }
      });
    },
    /**
     * Calculates the hash to create a new object.
     *
     * @param oStartupParameters The startup parameter values (map parameter name -> array of values)
     * @param sContextPath The context path of the entity set to be used for the creation
     * @param oRouter The router instance
     * @returns The hash
     */
    getDefaultCreateHash: function (oStartupParameters, sContextPath, oRouter) {
      let sDefaultCreateHash = oStartupParameters && oStartupParameters.preferredMode ? oStartupParameters.preferredMode[0] : "create";
      let sHash = "";
      sDefaultCreateHash = sDefaultCreateHash.indexOf(":") !== -1 && sDefaultCreateHash.length > sDefaultCreateHash.indexOf(":") + 1 ? sDefaultCreateHash.substr(0, sDefaultCreateHash.indexOf(":")) : "create";
      sHash = `${sContextPath.substring(1)}(...)?i-action=${sDefaultCreateHash}`;
      if (oRouter.getRouteInfoByHash(sHash)) {
        return sHash;
      } else {
        throw new Error(`No route match for creating a new ${sContextPath.substring(1)}`);
      }
    }
  };
  return AppStartupHelper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBcHBTdGFydHVwSGVscGVyIiwiX2dldEtleXNGcm9tU3RhcnR1cFBhcmFtcyIsImFLZXlOYW1lcyIsIm9TdGFydHVwUGFyYW1ldGVycyIsImJBbGxGb3VuZCIsImFLZXlzIiwibWFwIiwibmFtZSIsImxlbmd0aCIsInZhbHVlIiwidW5kZWZpbmVkIiwiX2NyZWF0ZUZpbHRlckZyb21LZXlzIiwiYkRyYWZ0TW9kZSIsIm9NZXRhTW9kZWwiLCJiRmlsdGVyQ2FzZVNlbnNpdGl2ZSIsIk1vZGVsSGVscGVyIiwiaXNGaWx0ZXJpbmdDYXNlU2Vuc2l0aXZlIiwiYkZpbHRlck9uQWN0aXZlRW50aXR5IiwiYUZpbHRlcnMiLCJrZXkiLCJGaWx0ZXIiLCJwYXRoIiwib3BlcmF0b3IiLCJGaWx0ZXJPcGVyYXRvciIsIkVRIiwidmFsdWUxIiwiY2FzZVNlbnNpdGl2ZSIsIm9EcmFmdEZpbHRlciIsImZpbHRlcnMiLCJhbmQiLCJwdXNoIiwiX3JlcXVlc3RPYmplY3RzRnJvbVBhcmFtZXRlcnMiLCJhU3RhcnR1cFBhZ2VzIiwib01vZGVsIiwiYUNvbnRleHRQcm9taXNlcyIsInBhZ2VJbmZvIiwic2VtYW50aWNLZXlzIiwidGVjaG5pY2FsS2V5cyIsIm9GaWx0ZXIiLCJkcmFmdE1vZGUiLCJnZXRNZXRhTW9kZWwiLCJvTGlzdEJpbmQiLCJiaW5kTGlzdCIsImNvbnRleHRQYXRoIiwiJHNlbGVjdCIsImpvaW4iLCJyZXF1ZXN0Q29udGV4dHMiLCJQcm9taXNlIiwiYWxsIiwiX2dldFJlYWNoYWJsZVBhZ2VJbmZvRnJvbVJvdXRlIiwib1JvdXRlIiwib01hbmlmZXN0Um91dGluZyIsInNQYXR0ZXJuIiwicGF0dGVybiIsInJlcGxhY2UiLCJlbmRzV2l0aCIsInNUYXJnZXROYW1lIiwiQXJyYXkiLCJpc0FycmF5IiwidGFyZ2V0Iiwib1RhcmdldCIsInRhcmdldHMiLCJhUGF0dGVyblNlZ21lbnRzIiwic3BsaXQiLCJwYWdlTGV2ZWwiLCJvcHRpb25zIiwic2V0dGluZ3MiLCJhbGxvd0RlZXBMaW5raW5nIiwic0NvbnRleHRQYXRoIiwiZW50aXR5U2V0Iiwib0VudGl0eVR5cGUiLCJnZXRPYmplY3QiLCJhU2VtYW50aWNLZXlOYW1lcyIsImFTZW1hbnRpY2tLZXlzIiwic2VtS2V5IiwiJFByb3BlcnR5UGF0aCIsImFUZWNobmljYWxLZXlzIiwiX2dldFJlYWNoYWJsZVBhZ2VzIiwiYVJvdXRlcyIsInJvdXRlcyIsIm1QYWdlc0J5TGV2ZWwiLCJmb3JFYWNoIiwib1BhZ2VJbmZvIiwiYVJlYWNoYWJsZVBhZ2VzIiwibGV2ZWwiLCJfZ2V0U3RhcnR1cFBhZ2VzRnJvbVN0YXJ0dXBQYXJhbXMiLCJyZXN1bHQiLCJjdXJyZW50IiwiZmluZFJlY3Vyc2l2ZSIsImFDdXJyZW50TGV2ZWxQYWdlcyIsImxhc3RQYWdlIiwibmV4dFBhZ2UiLCJpbmRleE9mIiwicG9wIiwic2xpY2UiLCJfZ2V0RGVlcExpbmtPYmplY3QiLCJhQ29udGV4dHMiLCJjb250ZXh0IiwiaGFzaCIsIm9Db250ZXh0IiwiZ2V0UGF0aCIsImdldERlZXBMaW5rU3RhcnR1cEhhc2giLCJyZXF1ZXN0T2JqZWN0IiwidGhlbiIsImFWYWx1ZXMiLCJhRm91bmRDb250ZXh0cyIsImdldENyZWF0ZVN0YXJ0dXBIYXNoIiwib1JvdXRlciIsIm9FbnRpdHlTZXRBbm5vdGF0aW9ucyIsInNNZXRhUGF0aCIsImJDcmVhdGFibGUiLCJiTmV3QWN0aW9uT3BlcmF0aW9uQXZhaWxhYmxlIiwib0luc2VydFJlc3RyaWN0aW9ucyIsIkluc2VydGFibGUiLCJnZXREZWZhdWx0Q3JlYXRlSGFzaCIsInNEZWZhdWx0Q3JlYXRlSGFzaCIsInByZWZlcnJlZE1vZGUiLCJzSGFzaCIsInN1YnN0ciIsInN1YnN0cmluZyIsImdldFJvdXRlSW5mb0J5SGFzaCIsIkVycm9yIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJBcHBTdGFydHVwSGVscGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIFJvdXRlciBmcm9tIFwic2FwL3VpL2NvcmUvcm91dGluZy9Sb3V0ZXJcIjtcbmltcG9ydCBGaWx0ZXIgZnJvbSBcInNhcC91aS9tb2RlbC9GaWx0ZXJcIjtcbmltcG9ydCBGaWx0ZXJPcGVyYXRvciBmcm9tIFwic2FwL3VpL21vZGVsL0ZpbHRlck9wZXJhdG9yXCI7XG5pbXBvcnQgdHlwZSBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvQ29udGV4dFwiO1xuaW1wb3J0IHR5cGUgT0RhdGFNZXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1ldGFNb2RlbFwiO1xuaW1wb3J0IHR5cGUgT0RhdGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTW9kZWxcIjtcbmltcG9ydCBNb2RlbEhlbHBlciBmcm9tIFwiLi9Nb2RlbEhlbHBlclwiO1xuXG50eXBlIFZhbHVlZEtleSA9IHtcblx0bmFtZTogc3RyaW5nO1xuXHR2YWx1ZTogc3RyaW5nO1xufTtcblxudHlwZSBQYWdlSW5mbyA9IHtcblx0cGF0dGVybjogc3RyaW5nO1xuXHRjb250ZXh0UGF0aDogc3RyaW5nO1xuXHRkcmFmdE1vZGU6IEJvb2xlYW47XG5cdHRlY2huaWNhbEtleXM6IFZhbHVlZEtleVtdIHwgdW5kZWZpbmVkO1xuXHRzZW1hbnRpY0tleXM6IFZhbHVlZEtleVtdIHwgdW5kZWZpbmVkO1xuXHR0YXJnZXQ6IHN0cmluZztcblx0cGFnZUxldmVsOiBudW1iZXI7XG59O1xuXG5jb25zdCBBcHBTdGFydHVwSGVscGVyID0ge1xuXHQvKipcblx0ICogUmV0cmlldmVzIGEgc2V0IG9mIGtleSB2YWx1ZXMgZnJvbSBzdGFydHVwIHBhcmFtZXRlcnMuXG5cdCAqXG5cdCAqIEBwYXJhbSBhS2V5TmFtZXMgVGhlIGFycmF5IG9mIGtleSBuYW1lc1xuXHQgKiBAcGFyYW0gb1N0YXJ0dXBQYXJhbWV0ZXJzIFRoZSBzdGFydHVwIHBhcmFtZXRlcnNcblx0ICogQHJldHVybnMgQW4gYXJyYXkgb2YgcGFpcnMgXFx7bmFtZSwgdmFsdWVcXH0gaWYgYWxsIGtleSB2YWx1ZXMgY291bGQgYmUgZm91bmQgaW4gdGhlIHN0YXJ0dXAgcGFyYW1ldGVycywgdW5kZWZpbmVkIG90aGVyd2lzZVxuXHQgKi9cblx0X2dldEtleXNGcm9tU3RhcnR1cFBhcmFtczogZnVuY3Rpb24gKGFLZXlOYW1lczogc3RyaW5nW10sIG9TdGFydHVwUGFyYW1ldGVyczogYW55KTogVmFsdWVkS2V5W10gfCB1bmRlZmluZWQge1xuXHRcdGxldCBiQWxsRm91bmQgPSB0cnVlO1xuXHRcdGNvbnN0IGFLZXlzID0gYUtleU5hbWVzLm1hcCgobmFtZSkgPT4ge1xuXHRcdFx0aWYgKG9TdGFydHVwUGFyYW1ldGVyc1tuYW1lXSAmJiBvU3RhcnR1cFBhcmFtZXRlcnNbbmFtZV0ubGVuZ3RoID09PSAxKSB7XG5cdFx0XHRcdHJldHVybiB7IG5hbWUsIHZhbHVlOiBvU3RhcnR1cFBhcmFtZXRlcnNbbmFtZV1bMF0gYXMgc3RyaW5nIH07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBBIHVuaXF1ZSBrZXkgdmFsdWUgY291bGRuJ3QgYmUgZm91bmQgaW4gdGhlIHN0YXJ0dXAgcGFyYW1ldGVyc1xuXHRcdFx0XHRiQWxsRm91bmQgPSBmYWxzZTtcblx0XHRcdFx0cmV0dXJuIHsgbmFtZSwgdmFsdWU6IFwiXCIgfTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHJldHVybiBiQWxsRm91bmQgPyBhS2V5cyA6IHVuZGVmaW5lZDtcblx0fSxcblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIGZpbHRlciBmcm9tIGEgbGlzdCBvZiBrZXkgdmFsdWVzLlxuXHQgKlxuXHQgKiBAcGFyYW0gYUtleXMgQXJyYXkgb2Ygc2VtYW50aWMga2V5cyBvciB0ZWNobmljYWwga2V5cyAod2l0aCB2YWx1ZXMpXG5cdCAqIEBwYXJhbSBiRHJhZnRNb2RlIFRydWUgaWYgdGhlIGVudGl0eSBzdXBwb3J0cyBkcmFmdCBtb2RlXG5cdCAqIEBwYXJhbSBvTWV0YU1vZGVsIFRoZSBtZXRhbW9kZWxcblx0ICogQHJldHVybnMgVGhlIGZpbHRlclxuXHQgKi9cblx0X2NyZWF0ZUZpbHRlckZyb21LZXlzOiBmdW5jdGlvbiAoYUtleXM6IFZhbHVlZEtleVtdLCBiRHJhZnRNb2RlOiBCb29sZWFuLCBvTWV0YU1vZGVsOiBPRGF0YU1ldGFNb2RlbCk6IEZpbHRlciB7XG5cdFx0Y29uc3QgYkZpbHRlckNhc2VTZW5zaXRpdmUgPSBNb2RlbEhlbHBlci5pc0ZpbHRlcmluZ0Nhc2VTZW5zaXRpdmUob01ldGFNb2RlbCk7XG5cblx0XHRsZXQgYkZpbHRlck9uQWN0aXZlRW50aXR5ID0gZmFsc2U7XG5cdFx0Y29uc3QgYUZpbHRlcnMgPSBhS2V5cy5tYXAoKGtleSkgPT4ge1xuXHRcdFx0aWYgKGtleS5uYW1lID09PSBcIklzQWN0aXZlRW50aXR5XCIpIHtcblx0XHRcdFx0YkZpbHRlck9uQWN0aXZlRW50aXR5ID0gdHJ1ZTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBuZXcgRmlsdGVyKHtcblx0XHRcdFx0cGF0aDoga2V5Lm5hbWUsXG5cdFx0XHRcdG9wZXJhdG9yOiBGaWx0ZXJPcGVyYXRvci5FUSxcblx0XHRcdFx0dmFsdWUxOiBrZXkudmFsdWUsXG5cdFx0XHRcdGNhc2VTZW5zaXRpdmU6IGJGaWx0ZXJDYXNlU2Vuc2l0aXZlXG5cdFx0XHR9KTtcblx0XHR9KTtcblx0XHRpZiAoYkRyYWZ0TW9kZSAmJiAhYkZpbHRlck9uQWN0aXZlRW50aXR5KSB7XG5cdFx0XHRjb25zdCBvRHJhZnRGaWx0ZXIgPSBuZXcgRmlsdGVyKHtcblx0XHRcdFx0ZmlsdGVyczogW25ldyBGaWx0ZXIoXCJJc0FjdGl2ZUVudGl0eVwiLCBcIkVRXCIsIGZhbHNlKSwgbmV3IEZpbHRlcihcIlNpYmxpbmdFbnRpdHkvSXNBY3RpdmVFbnRpdHlcIiwgXCJFUVwiLCBudWxsKV0sXG5cdFx0XHRcdGFuZDogZmFsc2Vcblx0XHRcdH0pO1xuXHRcdFx0YUZpbHRlcnMucHVzaChvRHJhZnRGaWx0ZXIpO1xuXHRcdH1cblxuXHRcdHJldHVybiBuZXcgRmlsdGVyKGFGaWx0ZXJzLCB0cnVlKTtcblx0fSxcblxuXHQvKipcblx0ICogTG9hZHMgYWxsIGNvbnRleHRzIGZvciBhIGxpc3Qgb2YgcGFnZSBpbmZvcy5cblx0ICpcblx0ICogQHBhcmFtIGFTdGFydHVwUGFnZXMgVGhlIGxpc3Qgb2YgcGFnZSBpbmZvc1xuXHQgKiBAcGFyYW0gb01vZGVsIFRoZSBtb2RlbCB1c2VkIHRvIGxvYWQgdGhlIGNvbnRleHRzXG5cdCAqIEByZXR1cm5zIEEgUHJvbWlzZSBmb3IgYWxsIGNvbnRleHRzXG5cdCAqL1xuXHRfcmVxdWVzdE9iamVjdHNGcm9tUGFyYW1ldGVyczogZnVuY3Rpb24gKGFTdGFydHVwUGFnZXM6IFBhZ2VJbmZvW10sIG9Nb2RlbDogT0RhdGFNb2RlbCk6IFByb21pc2U8Q29udGV4dFtdW10+IHtcblx0XHQvLyBMb2FkIHRoZSByZXNwZWN0aXZlIG9iamVjdHMgZm9yIGFsbCBvYmplY3QgcGFnZXMgZm91bmQgaW4gYUV4dGVybmFsbHlOYXZpZ2FibGVQYWdlc1xuXHRcdGNvbnN0IGFDb250ZXh0UHJvbWlzZXMgPSBhU3RhcnR1cFBhZ2VzLm1hcCgocGFnZUluZm8pID0+IHtcblx0XHRcdGNvbnN0IGFLZXlzID0gcGFnZUluZm8uc2VtYW50aWNLZXlzIHx8IHBhZ2VJbmZvLnRlY2huaWNhbEtleXMgfHwgW107XG5cdFx0XHRjb25zdCBvRmlsdGVyID0gdGhpcy5fY3JlYXRlRmlsdGVyRnJvbUtleXMoYUtleXMsIHBhZ2VJbmZvLmRyYWZ0TW9kZSwgb01vZGVsLmdldE1ldGFNb2RlbCgpKTtcblxuXHRcdFx0Ly8gb25seSByZXF1ZXN0IGEgbWluaW11bSBvZiBmaWVsZHMgdG8gYm9vc3QgYmFja2VuZCBwZXJmb3JtYW5jZSBzaW5jZSB0aGlzIGlzIG9ubHkgdXNlZCB0byBjaGVjayBpZiBhbiBvYmplY3QgZXhpc3RzXG5cdFx0XHRjb25zdCBvTGlzdEJpbmQgPSBvTW9kZWwuYmluZExpc3QocGFnZUluZm8uY29udGV4dFBhdGgsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBvRmlsdGVyLCB7XG5cdFx0XHRcdCRzZWxlY3Q6IGFLZXlzXG5cdFx0XHRcdFx0Lm1hcCgoa2V5KSA9PiB7XG5cdFx0XHRcdFx0XHRyZXR1cm4ga2V5Lm5hbWU7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQuam9pbihcIixcIilcblx0XHRcdH0gYXMgYW55KTtcblx0XHRcdHJldHVybiBvTGlzdEJpbmQucmVxdWVzdENvbnRleHRzKDAsIDIpO1xuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIFByb21pc2UuYWxsKGFDb250ZXh0UHJvbWlzZXMpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgUGFnZUluZm8gZnJvbSBhIHJvdXRlIGlmIGl0J3MgcmVhY2hhYmxlIGZyb20gdGhlIHN0YXJ0dXAgcGFyYW1ldGVycy5cblx0ICpcblx0ICogQHBhcmFtIG9Sb3V0ZSBUaGUgcm91dGVcblx0ICogQHBhcmFtIG9NYW5pZmVzdFJvdXRpbmcgVGhlIGFwcCBtYW5pZmVzdCByb3V0aW5nIHNlY3Rpb25cblx0ICogQHBhcmFtIG9TdGFydHVwUGFyYW1ldGVycyBUaGUgc3RhcnR1cCBwYXJhbWV0ZXJzXG5cdCAqIEBwYXJhbSBvTWV0YU1vZGVsIFRoZSBhcHAgbWV0YW1vZGVsXG5cdCAqIEByZXR1cm5zIEEgcGFnZSBpbmZvIGlmIHRoZSBwYWdlIGlzIHJlYWNoYWJsZSwgdW5kZWZpbmVkIG90aGVyd2lzZVxuXHQgKi9cblx0X2dldFJlYWNoYWJsZVBhZ2VJbmZvRnJvbVJvdXRlOiBmdW5jdGlvbiAoXG5cdFx0b1JvdXRlOiBhbnksXG5cdFx0b01hbmlmZXN0Um91dGluZzogYW55LFxuXHRcdG9TdGFydHVwUGFyYW1ldGVyczogYW55LFxuXHRcdG9NZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsXG5cdCk6IFBhZ2VJbmZvIHwgdW5kZWZpbmVkIHtcblx0XHQvLyBSZW1vdmUgdHJhaWxpbmcgJzo/cXVlcnk6JyBhbmQgJy8nXG5cdFx0bGV0IHNQYXR0ZXJuOiBzdHJpbmcgPSBvUm91dGUucGF0dGVybi5yZXBsYWNlKFwiOj9xdWVyeTpcIiwgXCJcIik7XG5cdFx0c1BhdHRlcm4gPSBzUGF0dGVybi5yZXBsYWNlKC9cXC8kLywgXCJcIik7XG5cblx0XHRpZiAoIXNQYXR0ZXJuIHx8ICFzUGF0dGVybi5lbmRzV2l0aChcIilcIikpIHtcblx0XHRcdC8vIElnbm9yZSBsZXZlbC0wIHJvdXRlcyAoTGlzdFJlcG9ydCkgb3Igcm91dGVzIGNvcnJlc3BvbmRpbmcgdG8gYSAxLTEgcmVsYXRpb24gKG5vIGtleXMgaW4gdGhlIFVSTCBpbiB0aGlzIGNhc2UpXG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblxuXHRcdHNQYXR0ZXJuID0gc1BhdHRlcm4ucmVwbGFjZSgvXFwoXFx7W15cXH1dKlxcfVxcKS9nLCBcIigjKVwiKTsgLy8gUmVwbGFjZSBrZXlzIHdpdGggI1xuXG5cdFx0Ly8gR2V0IHRoZSByaWdodG1vc3QgdGFyZ2V0IGZvciB0aGlzIHJvdXRlXG5cdFx0Y29uc3Qgc1RhcmdldE5hbWU6IHN0cmluZyA9IEFycmF5LmlzQXJyYXkob1JvdXRlLnRhcmdldCkgPyBvUm91dGUudGFyZ2V0W29Sb3V0ZS50YXJnZXQubGVuZ3RoIC0gMV0gOiBvUm91dGUudGFyZ2V0O1xuXHRcdGNvbnN0IG9UYXJnZXQgPSBvTWFuaWZlc3RSb3V0aW5nLnRhcmdldHNbc1RhcmdldE5hbWVdO1xuXG5cdFx0Y29uc3QgYVBhdHRlcm5TZWdtZW50cyA9IHNQYXR0ZXJuLnNwbGl0KFwiL1wiKTtcblx0XHRjb25zdCBwYWdlTGV2ZWwgPSBhUGF0dGVyblNlZ21lbnRzLmxlbmd0aCAtIDE7XG5cblx0XHRpZiAocGFnZUxldmVsICE9PSAwICYmIG9UYXJnZXQ/Lm9wdGlvbnM/LnNldHRpbmdzPy5hbGxvd0RlZXBMaW5raW5nICE9PSB0cnVlKSB7XG5cdFx0XHQvLyBUaGUgZmlyc3QgbGV2ZWwgb2Ygb2JqZWN0IHBhZ2UgYWxsb3dzIGRlZXAgbGlua2luZyBieSBkZWZhdWx0LlxuXHRcdFx0Ly8gT3RoZXJ3aXNlLCB0aGUgdGFyZ2V0IG11c3QgYWxsb3cgZGVlcCBsaW5raW5nIGV4cGxpY2l0ZWx5IGluIHRoZSBtYW5pZmVzdFxuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cblx0XHRjb25zdCBzQ29udGV4dFBhdGg6IHN0cmluZyA9XG5cdFx0XHRvVGFyZ2V0Lm9wdGlvbnMuc2V0dGluZ3MuY29udGV4dFBhdGggfHwgKG9UYXJnZXQub3B0aW9ucy5zZXR0aW5ncy5lbnRpdHlTZXQgJiYgYC8ke29UYXJnZXQub3B0aW9ucy5zZXR0aW5ncy5lbnRpdHlTZXR9YCk7XG5cdFx0Y29uc3Qgb0VudGl0eVR5cGUgPSBzQ29udGV4dFBhdGggJiYgb01ldGFNb2RlbC5nZXRPYmplY3QoYC8kRW50aXR5Q29udGFpbmVyJHtzQ29udGV4dFBhdGh9L2ApO1xuXG5cdFx0aWYgKCFvRW50aXR5VHlwZSkge1xuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cblx0XHQvLyBHZXQgdGhlIHNlbWFudGljIGtleSB2YWx1ZXMgZm9yIHRoZSBlbnRpdHlcblx0XHRjb25zdCBhU2VtYW50aWNLZXlOYW1lczogYW55ID0gb01ldGFNb2RlbC5nZXRPYmplY3QoYC8kRW50aXR5Q29udGFpbmVyJHtzQ29udGV4dFBhdGh9L0Bjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuU2VtYW50aWNLZXlgKTtcblxuXHRcdGNvbnN0IGFTZW1hbnRpY2tLZXlzID0gYVNlbWFudGljS2V5TmFtZXNcblx0XHRcdD8gdGhpcy5fZ2V0S2V5c0Zyb21TdGFydHVwUGFyYW1zKFxuXHRcdFx0XHRcdGFTZW1hbnRpY0tleU5hbWVzLm1hcCgoc2VtS2V5OiBhbnkpID0+IHtcblx0XHRcdFx0XHRcdHJldHVybiBzZW1LZXkuJFByb3BlcnR5UGF0aCBhcyBzdHJpbmc7XG5cdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0b1N0YXJ0dXBQYXJhbWV0ZXJzXG5cdFx0XHQgIClcblx0XHRcdDogdW5kZWZpbmVkO1xuXG5cdFx0Ly8gR2V0IHRoZSB0ZWNobmljYWwga2V5cyBvbmx5IGlmIHdlIGNvdWxkbid0IGZpbmQgdGhlIHNlbWFudGljIGtleSB2YWx1ZXMsIGFuZCBvbiBmaXJzdCBsZXZlbCBPUFxuXHRcdGNvbnN0IGFUZWNobmljYWxLZXlzID1cblx0XHRcdCFhU2VtYW50aWNrS2V5cyAmJiBwYWdlTGV2ZWwgPT09IDAgPyB0aGlzLl9nZXRLZXlzRnJvbVN0YXJ0dXBQYXJhbXMob0VudGl0eVR5cGVbXCIkS2V5XCJdLCBvU3RhcnR1cFBhcmFtZXRlcnMpIDogdW5kZWZpbmVkO1xuXG5cdFx0aWYgKGFTZW1hbnRpY2tLZXlzID09PSB1bmRlZmluZWQgJiYgYVRlY2huaWNhbEtleXMgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Ly8gV2UgY291bGRuJ3QgZmluZCB0aGUgc2VtYW50aWMvdGVjaG5pY2FsIGtleXMgaW4gdGhlIHN0YXJ0dXAgcGFyYW1ldGVyc1xuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cblx0XHQvLyBUaGUgc3RhcnR1cCBwYXJhbWV0ZXJzIGNvbnRhaW4gdmFsdWVzIGZvciBhbGwgc2VtYW50aWMga2V5cyAob3IgdGVjaG5pY2FsIGtleXMpIC0tPiB3ZSBjYW4gc3RvcmUgdGhlIHBhZ2UgaW5mbyBpbiB0aGUgY29ycmVzcG9uZGluZyBsZXZlbFxuXHRcdGNvbnN0IGRyYWZ0TW9kZSA9XG5cdFx0XHRvTWV0YU1vZGVsLmdldE9iamVjdChgLyRFbnRpdHlDb250YWluZXIke3NDb250ZXh0UGF0aH1AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkRyYWZ0Um9vdGApIHx8XG5cdFx0XHRvTWV0YU1vZGVsLmdldE9iamVjdChgLyRFbnRpdHlDb250YWluZXIke3NDb250ZXh0UGF0aH1AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkRyYWZ0Tm9kZWApXG5cdFx0XHRcdD8gdHJ1ZVxuXHRcdFx0XHQ6IGZhbHNlO1xuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHBhdHRlcm46IHNQYXR0ZXJuLFxuXHRcdFx0Y29udGV4dFBhdGg6IHNDb250ZXh0UGF0aCxcblx0XHRcdGRyYWZ0TW9kZSxcblx0XHRcdHRlY2huaWNhbEtleXM6IGFUZWNobmljYWxLZXlzLFxuXHRcdFx0c2VtYW50aWNLZXlzOiBhU2VtYW50aWNrS2V5cyxcblx0XHRcdHRhcmdldDogc1RhcmdldE5hbWUsXG5cdFx0XHRwYWdlTGV2ZWxcblx0XHR9O1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBsaXN0IG9mIGFsbCBwYWdlcyB0aGF0IGFsbG93IGRlZXBsaW5rIGFuZCB0aGF0IGNhbiBiZSByZWFjaGVkIHVzaW5nIHRoZSBzdGFydHVwIHBhcmFtZXRlcnMuXG5cdCAqXG5cdCAqIEBwYXJhbSBvTWFuaWZlc3RSb3V0aW5nIFRoZSByb3V0aW5nIGluZm9ybWF0aW9uIGZyb20gdGhlIGFwcCBtYW5pZmVzdFxuXHQgKiBAcGFyYW0gb1N0YXJ0dXBQYXJhbWV0ZXJzIFRoZSBzdGFydHVwIHBhcmFtZXRlcnNcblx0ICogQHBhcmFtIG9NZXRhTW9kZWwgVGhlIG1ldGFtb2RlbFxuXHQgKiBAcmV0dXJucyBUaGUgcmVhY2hhYmxlIHBhZ2VzXG5cdCAqL1xuXHRfZ2V0UmVhY2hhYmxlUGFnZXM6IGZ1bmN0aW9uIChvTWFuaWZlc3RSb3V0aW5nOiBhbnksIG9TdGFydHVwUGFyYW1ldGVyczogYW55LCBvTWV0YU1vZGVsOiBPRGF0YU1ldGFNb2RlbCk6IFBhZ2VJbmZvW11bXSB7XG5cdFx0Y29uc3QgYVJvdXRlczogYW55W10gPSBvTWFuaWZlc3RSb3V0aW5nLnJvdXRlcztcblx0XHRjb25zdCBtUGFnZXNCeUxldmVsOiBSZWNvcmQ8bnVtYmVyLCBQYWdlSW5mb1tdPiA9IHt9O1xuXG5cdFx0YVJvdXRlcy5mb3JFYWNoKChvUm91dGUpID0+IHtcblx0XHRcdGNvbnN0IG9QYWdlSW5mbyA9IHRoaXMuX2dldFJlYWNoYWJsZVBhZ2VJbmZvRnJvbVJvdXRlKG9Sb3V0ZSwgb01hbmlmZXN0Um91dGluZywgb1N0YXJ0dXBQYXJhbWV0ZXJzLCBvTWV0YU1vZGVsKTtcblxuXHRcdFx0aWYgKG9QYWdlSW5mbykge1xuXHRcdFx0XHRpZiAoIW1QYWdlc0J5TGV2ZWxbb1BhZ2VJbmZvLnBhZ2VMZXZlbF0pIHtcblx0XHRcdFx0XHRtUGFnZXNCeUxldmVsW29QYWdlSW5mby5wYWdlTGV2ZWxdID0gW107XG5cdFx0XHRcdH1cblx0XHRcdFx0bVBhZ2VzQnlMZXZlbFtvUGFnZUluZm8ucGFnZUxldmVsXS5wdXNoKG9QYWdlSW5mbyk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHQvLyBBIHBhZ2UgaXMgcmVhY2hhYmxlIG9ubHkgaWYgYWxsIGl0cyBwYXJlbnRzIGFyZSBhbHNvIHJlYWNoYWJsZVxuXHRcdC8vIFNvIGlmIHdlIGNvdWxkbid0IGZpbmQgYW55IHBhZ2VzIGZvciBhIGdpdmVuIGxldmVsLCBhbGwgcGFnZXMgd2l0aCBhIGhpZ2hlciBsZXZlbCB3b24ndCBiZSByZWFjaGFibGUgYW55d2F5XG5cdFx0Y29uc3QgYVJlYWNoYWJsZVBhZ2VzOiBQYWdlSW5mb1tdW10gPSBbXTtcblx0XHRsZXQgbGV2ZWwgPSAwO1xuXHRcdHdoaWxlIChtUGFnZXNCeUxldmVsW2xldmVsXSkge1xuXHRcdFx0YVJlYWNoYWJsZVBhZ2VzLnB1c2gobVBhZ2VzQnlMZXZlbFtsZXZlbF0pO1xuXHRcdFx0bGV2ZWwrKztcblx0XHR9XG5cblx0XHRyZXR1cm4gYVJlYWNoYWJsZVBhZ2VzO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBHZXQgdGhlIGxpc3Qgb2Ygc3RhcnR1cCBwYWdlcy5cblx0ICpcblx0ICogQHBhcmFtIG9NYW5pZmVzdFJvdXRpbmcgVGhlIHJvdXRpbmcgaW5mb3JtYXRpb24gZnJvbSB0aGUgYXBwIG1hbmlmZXN0XG5cdCAqIEBwYXJhbSBvU3RhcnR1cFBhcmFtZXRlcnMgVGhlIHN0YXJ0dXAgcGFyYW1ldGVyc1xuXHQgKiBAcGFyYW0gb01ldGFNb2RlbCBUaGUgbWV0YW1vZGVsXG5cdCAqIEByZXR1cm5zIEFuIGFycmF5IG9mIHN0YXJ0dXAgcGFnZSBpbmZvc1xuXHQgKi9cblx0X2dldFN0YXJ0dXBQYWdlc0Zyb21TdGFydHVwUGFyYW1zOiBmdW5jdGlvbiAob01hbmlmZXN0Um91dGluZzogYW55LCBvU3RhcnR1cFBhcmFtZXRlcnM6IGFueSwgb01ldGFNb2RlbDogT0RhdGFNZXRhTW9kZWwpOiBQYWdlSW5mb1tdIHtcblx0XHQvLyBGaW5kIGFsbCBwYWdlcyB0aGF0IGNhbiBiZSByZWFjaGVkIHdpdGggdGhlIHN0YXJ0dXAgcGFyYW1ldGVyc1xuXHRcdGNvbnN0IGFSZWFjaGFibGVQYWdlcyA9IHRoaXMuX2dldFJlYWNoYWJsZVBhZ2VzKG9NYW5pZmVzdFJvdXRpbmcsIG9TdGFydHVwUGFyYW1ldGVycywgb01ldGFNb2RlbCk7XG5cblx0XHRpZiAoYVJlYWNoYWJsZVBhZ2VzLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0cmV0dXJuIFtdO1xuXHRcdH1cblxuXHRcdC8vIEZpbmQgdGhlIGxvbmdlc3Qgc2VxdWVuY2Ugb2YgcGFnZXMgdGhhdCBjYW4gYmUgcmVhY2hlZCAocmVjdXJzaXZlbHkpXG5cdFx0bGV0IHJlc3VsdDogUGFnZUluZm9bXSA9IFtdO1xuXHRcdGNvbnN0IGN1cnJlbnQ6IFBhZ2VJbmZvW10gPSBbXTtcblxuXHRcdGZ1bmN0aW9uIGZpbmRSZWN1cnNpdmUobGV2ZWw6IG51bWJlcikge1xuXHRcdFx0Y29uc3QgYUN1cnJlbnRMZXZlbFBhZ2VzID0gYVJlYWNoYWJsZVBhZ2VzW2xldmVsXTtcblx0XHRcdGNvbnN0IGxhc3RQYWdlID0gY3VycmVudC5sZW5ndGggPyBjdXJyZW50W2N1cnJlbnQubGVuZ3RoIC0gMV0gOiB1bmRlZmluZWQ7XG5cblx0XHRcdGlmIChhQ3VycmVudExldmVsUGFnZXMpIHtcblx0XHRcdFx0YUN1cnJlbnRMZXZlbFBhZ2VzLmZvckVhY2goZnVuY3Rpb24gKG5leHRQYWdlKSB7XG5cdFx0XHRcdFx0aWYgKCFsYXN0UGFnZSB8fCBuZXh0UGFnZS5wYXR0ZXJuLmluZGV4T2YobGFzdFBhZ2UucGF0dGVybikgPT09IDApIHtcblx0XHRcdFx0XHRcdC8vIFdlIG9ubHkgY29uc2lkZXIgcGFnZXMgdGhhdCBjYW4gYmUgcmVhY2hlZCBmcm9tIHRoZSBwYWdlIGF0IHRoZSBwcmV2aW91cyBsZXZlbCxcblx0XHRcdFx0XHRcdC8vIC0tPiB0aGVpciBwYXR0ZXJuIG11c3QgYmUgdGhlIHBhdHRlcm4gb2YgdGhlIHByZXZpb3VzIHBhZ2Ugd2l0aCBhbm90aGVyIHNlZ21lbnQgYXBwZW5kZWRcblx0XHRcdFx0XHRcdGN1cnJlbnQucHVzaChuZXh0UGFnZSk7XG5cdFx0XHRcdFx0XHRmaW5kUmVjdXJzaXZlKGxldmVsICsgMSk7XG5cdFx0XHRcdFx0XHRjdXJyZW50LnBvcCgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoY3VycmVudC5sZW5ndGggPiByZXN1bHQubGVuZ3RoKSB7XG5cdFx0XHRcdHJlc3VsdCA9IGN1cnJlbnQuc2xpY2UoKTsgLy8gV2UgaGF2ZSBmb3VuZCBhIHNlcXVlbmNlIGxvbmdlciB0aGFuIG91ciBwcmV2aW91cyBiZXN0IC0tPiBzdG9yZSBpdCBhcyB0aGUgbmV3IGxvbmdlc3Rcblx0XHRcdH1cblx0XHR9XG5cblx0XHRmaW5kUmVjdXJzaXZlKDApO1xuXG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fSxcblxuXHQvKipcblx0ICogQ3JlYXRlcyB0aGUgc3RhcnR1cCBvYmplY3QgZnJvbSB0aGUgbGlzdCBvZiBwYWdlcyBhbmQgY29udGV4dHMuXG5cdCAqXG5cdCAqIEBwYXJhbSBhU3RhcnR1cFBhZ2VzIFRoZSBwYWdlc1xuXHQgKiBAcGFyYW0gYUNvbnRleHRzIFRoZSBjb250ZXh0c1xuXHQgKiBAcmV0dXJucyBBbiBvYmplY3QgY29udGFpbmluZyBlaXRoZXIgYSBoYXNoIG9yIGEgY29udGV4dCB0byBuYXZpZ2F0ZSB0bywgb3IgYW4gZW1wdHkgb2JqZWN0IGlmIG5vIGRlZXAgbGluayB3YXMgZm91bmRcblx0ICovXG5cdF9nZXREZWVwTGlua09iamVjdDogZnVuY3Rpb24gKGFTdGFydHVwUGFnZXM6IFBhZ2VJbmZvW10sIGFDb250ZXh0czogQ29udGV4dFtdKTogeyBoYXNoPzogc3RyaW5nOyBjb250ZXh0PzogQ29udGV4dCB9IHtcblx0XHRpZiAoYUNvbnRleHRzLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0cmV0dXJuIHsgY29udGV4dDogYUNvbnRleHRzWzBdIH07XG5cdFx0fSBlbHNlIGlmIChhQ29udGV4dHMubGVuZ3RoID4gMSkge1xuXHRcdFx0Ly8gTmF2aWdhdGlvbiB0byBhIGRlZXBlciBsZXZlbCAtLT4gdXNlIHRoZSBwYXR0ZXJuIG9mIHRoZSBkZWVwZXN0IG9iamVjdCBwYWdlXG5cdFx0XHQvLyBhbmQgcmVwbGFjZSB0aGUgcGFyYW1ldGVycyBieSB0aGUgSUQgZnJvbSB0aGUgY29udGV4dHNcblx0XHRcdGxldCBoYXNoID0gYVN0YXJ0dXBQYWdlc1thU3RhcnR1cFBhZ2VzLmxlbmd0aCAtIDFdLnBhdHRlcm47XG5cdFx0XHRhQ29udGV4dHMuZm9yRWFjaChmdW5jdGlvbiAob0NvbnRleHQpIHtcblx0XHRcdFx0aGFzaCA9IGhhc2gucmVwbGFjZShcIigjKVwiLCBgKCR7b0NvbnRleHQuZ2V0UGF0aCgpLnNwbGl0KFwiKFwiKVsxXX1gKTtcblx0XHRcdH0pO1xuXG5cdFx0XHRyZXR1cm4geyBoYXNoIH07XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB7fTtcblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIENhbGN1bGF0ZXMgc3RhcnR1cCBwYXJhbWV0ZXJzIGZvciBhIGRlZXBsaW5rIGNhc2UsIGZyb20gc3RhcnR1cCBwYXJhbWV0ZXJzIGFuZCByb3V0aW5nIGluZm9pcm1hdGlvbi5cblx0ICpcblx0ICogQHBhcmFtIG9NYW5pZmVzdFJvdXRpbmcgVGhlIHJvdXRpbmcgaW5mb3JtYXRpb24gZnJvbSB0aGUgYXBwIG1hbmlmZXN0XG5cdCAqIEBwYXJhbSBvU3RhcnR1cFBhcmFtZXRlcnMgVGhlIHN0YXJ0dXAgcGFyYW1ldGVyc1xuXHQgKiBAcGFyYW0gb01vZGVsIFRoZSBPRGF0YSBtb2RlbFxuXHQgKiBAcmV0dXJucyBBbiBvYmplY3QgY29udGFpbmluZyBlaXRoZXIgYSBoYXNoIG9yIGEgY29udGV4dCB0byBuYXZpZ2F0ZSB0bywgb3IgYW4gZW1wdHkgb2JqZWN0IGlmIG5vIGRlZXAgbGluayB3YXMgZm91bmRcblx0ICovXG5cdGdldERlZXBMaW5rU3RhcnR1cEhhc2g6IGZ1bmN0aW9uIChcblx0XHRvTWFuaWZlc3RSb3V0aW5nOiBhbnksXG5cdFx0b1N0YXJ0dXBQYXJhbWV0ZXJzOiBhbnksXG5cdFx0b01vZGVsOiBPRGF0YU1vZGVsXG5cdCk6IFByb21pc2U8eyBoYXNoPzogc3RyaW5nOyBjb250ZXh0PzogQ29udGV4dCB9PiB7XG5cdFx0bGV0IGFTdGFydHVwUGFnZXM6IFBhZ2VJbmZvW107XG5cblx0XHRyZXR1cm4gb01vZGVsXG5cdFx0XHQuZ2V0TWV0YU1vZGVsKClcblx0XHRcdC5yZXF1ZXN0T2JqZWN0KFwiLyRFbnRpdHlDb250YWluZXIvXCIpXG5cdFx0XHQudGhlbigoKSA9PiB7XG5cdFx0XHRcdC8vIENoZWNrIGlmIHNlbWFudGljIGtleXMgYXJlIHByZXNlbnQgaW4gdXJsIHBhcmFtZXRlcnMgZm9yIGV2ZXJ5IG9iamVjdCBwYWdlIGF0IGVhY2ggbGV2ZWxcblx0XHRcdFx0YVN0YXJ0dXBQYWdlcyA9IHRoaXMuX2dldFN0YXJ0dXBQYWdlc0Zyb21TdGFydHVwUGFyYW1zKG9NYW5pZmVzdFJvdXRpbmcsIG9TdGFydHVwUGFyYW1ldGVycywgb01vZGVsLmdldE1ldGFNb2RlbCgpKTtcblxuXHRcdFx0XHRyZXR1cm4gdGhpcy5fcmVxdWVzdE9iamVjdHNGcm9tUGFyYW1ldGVycyhhU3RhcnR1cFBhZ2VzLCBvTW9kZWwpO1xuXHRcdFx0fSlcblx0XHRcdC50aGVuKChhVmFsdWVzOiBDb250ZXh0W11bXSkgPT4ge1xuXHRcdFx0XHRpZiAoYVZhbHVlcy5sZW5ndGgpIHtcblx0XHRcdFx0XHQvLyBNYWtlIHN1cmUgd2Ugb25seSBnZXQgMSBjb250ZXh0IHBlciBwcm9taXNlLCBhbmQgZmxhdHRlbiB0aGUgYXJyYXlcblx0XHRcdFx0XHRjb25zdCBhQ29udGV4dHM6IENvbnRleHRbXSA9IFtdO1xuXHRcdFx0XHRcdGFWYWx1ZXMuZm9yRWFjaChmdW5jdGlvbiAoYUZvdW5kQ29udGV4dHMpIHtcblx0XHRcdFx0XHRcdGlmIChhRm91bmRDb250ZXh0cy5sZW5ndGggPT09IDEpIHtcblx0XHRcdFx0XHRcdFx0YUNvbnRleHRzLnB1c2goYUZvdW5kQ29udGV4dHNbMF0pO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0cmV0dXJuIGFDb250ZXh0cy5sZW5ndGggPT09IGFWYWx1ZXMubGVuZ3RoID8gdGhpcy5fZ2V0RGVlcExpbmtPYmplY3QoYVN0YXJ0dXBQYWdlcywgYUNvbnRleHRzKSA6IHt9O1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJldHVybiB7fTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENhbGN1bGF0ZXMgdGhlIG5ldyBoYXNoIGJhc2VkIG9uIHRoZSBzdGFydHVwIHBhcmFtZXRlcnMuXG5cdCAqXG5cdCAqIEBwYXJhbSBvU3RhcnR1cFBhcmFtZXRlcnMgVGhlIHN0YXJ0dXAgcGFyYW1ldGVyIHZhbHVlcyAobWFwIHBhcmFtZXRlciBuYW1lIC0+IGFycmF5IG9mIHZhbHVlcylcblx0ICogQHBhcmFtIHNDb250ZXh0UGF0aCBUaGUgY29udGV4dCBwYXRoIGZvciB0aGUgc3RhcnR1cCBvZiB0aGUgYXBwIChnZW5lcmFsbHkgdGhlIHBhdGggdG8gdGhlIG1haW4gZW50aXR5IHNldClcblx0ICogQHBhcmFtIG9Sb3V0ZXIgVGhlIHJvdXRlciBpbnN0YW5jZVxuXHQgKiBAcGFyYW0gb01ldGFNb2RlbCBUaGUgbWV0YSBtb2RlbFxuXHQgKiBAcmV0dXJucyBBIHByb21pc2UgY29udGFpbmluZyB0aGUgaGFzaCB0byBuYXZpZ2F0ZSB0bywgb3IgYW4gZW1wdHkgc3RyaW5nIGlmIHRoZXJlJ3Mgbm8gbmVlZCB0byBuYXZpZ2F0ZVxuXHQgKi9cblx0Z2V0Q3JlYXRlU3RhcnR1cEhhc2g6IGZ1bmN0aW9uIChcblx0XHRvU3RhcnR1cFBhcmFtZXRlcnM6IGFueSxcblx0XHRzQ29udGV4dFBhdGg6IHN0cmluZyxcblx0XHRvUm91dGVyOiBSb3V0ZXIsXG5cdFx0b01ldGFNb2RlbDogT0RhdGFNZXRhTW9kZWxcblx0KTogUHJvbWlzZTxTdHJpbmc+IHtcblx0XHRyZXR1cm4gb01ldGFNb2RlbC5yZXF1ZXN0T2JqZWN0KGAke3NDb250ZXh0UGF0aH1AYCkudGhlbigob0VudGl0eVNldEFubm90YXRpb25zOiBhbnkpID0+IHtcblx0XHRcdGxldCBzTWV0YVBhdGggPSBcIlwiO1xuXHRcdFx0bGV0IGJDcmVhdGFibGUgPSB0cnVlO1xuXG5cdFx0XHRpZiAoXG5cdFx0XHRcdG9FbnRpdHlTZXRBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRHJhZnRSb290XCJdICYmXG5cdFx0XHRcdG9FbnRpdHlTZXRBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRHJhZnRSb290XCJdW1wiTmV3QWN0aW9uXCJdXG5cdFx0XHQpIHtcblx0XHRcdFx0c01ldGFQYXRoID0gYCR7c0NvbnRleHRQYXRofUBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRHJhZnRSb290L05ld0FjdGlvbkBPcmcuT0RhdGEuQ29yZS5WMS5PcGVyYXRpb25BdmFpbGFibGVgO1xuXHRcdFx0fSBlbHNlIGlmIChcblx0XHRcdFx0b0VudGl0eVNldEFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlNlc3Npb24udjEuU3RpY2t5U2Vzc2lvblN1cHBvcnRlZFwiXSAmJlxuXHRcdFx0XHRvRW50aXR5U2V0QW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuU2Vzc2lvbi52MS5TdGlja3lTZXNzaW9uU3VwcG9ydGVkXCJdW1wiTmV3QWN0aW9uXCJdXG5cdFx0XHQpIHtcblx0XHRcdFx0c01ldGFQYXRoID0gYCR7c0NvbnRleHRQYXRofUBjb20uc2FwLnZvY2FidWxhcmllcy5TZXNzaW9uLnYxLlN0aWNreVNlc3Npb25TdXBwb3J0ZWQvTmV3QWN0aW9uQE9yZy5PRGF0YS5Db3JlLlYxLk9wZXJhdGlvbkF2YWlsYWJsZWA7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChzTWV0YVBhdGgpIHtcblx0XHRcdFx0Y29uc3QgYk5ld0FjdGlvbk9wZXJhdGlvbkF2YWlsYWJsZSA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KHNNZXRhUGF0aCk7XG5cdFx0XHRcdGlmIChiTmV3QWN0aW9uT3BlcmF0aW9uQXZhaWxhYmxlID09PSBmYWxzZSkge1xuXHRcdFx0XHRcdGJDcmVhdGFibGUgPSBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc3Qgb0luc2VydFJlc3RyaWN0aW9ucyA9IG9FbnRpdHlTZXRBbm5vdGF0aW9uc1tcIkBPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkluc2VydFJlc3RyaWN0aW9uc1wiXTtcblx0XHRcdFx0aWYgKG9JbnNlcnRSZXN0cmljdGlvbnMgJiYgb0luc2VydFJlc3RyaWN0aW9ucy5JbnNlcnRhYmxlID09PSBmYWxzZSkge1xuXHRcdFx0XHRcdGJDcmVhdGFibGUgPSBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYgKGJDcmVhdGFibGUpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuZ2V0RGVmYXVsdENyZWF0ZUhhc2gob1N0YXJ0dXBQYXJhbWV0ZXJzLCBzQ29udGV4dFBhdGgsIG9Sb3V0ZXIpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIFwiXCI7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENhbGN1bGF0ZXMgdGhlIGhhc2ggdG8gY3JlYXRlIGEgbmV3IG9iamVjdC5cblx0ICpcblx0ICogQHBhcmFtIG9TdGFydHVwUGFyYW1ldGVycyBUaGUgc3RhcnR1cCBwYXJhbWV0ZXIgdmFsdWVzIChtYXAgcGFyYW1ldGVyIG5hbWUgLT4gYXJyYXkgb2YgdmFsdWVzKVxuXHQgKiBAcGFyYW0gc0NvbnRleHRQYXRoIFRoZSBjb250ZXh0IHBhdGggb2YgdGhlIGVudGl0eSBzZXQgdG8gYmUgdXNlZCBmb3IgdGhlIGNyZWF0aW9uXG5cdCAqIEBwYXJhbSBvUm91dGVyIFRoZSByb3V0ZXIgaW5zdGFuY2Vcblx0ICogQHJldHVybnMgVGhlIGhhc2hcblx0ICovXG5cdGdldERlZmF1bHRDcmVhdGVIYXNoOiBmdW5jdGlvbiAob1N0YXJ0dXBQYXJhbWV0ZXJzOiBhbnksIHNDb250ZXh0UGF0aDogc3RyaW5nLCBvUm91dGVyOiBSb3V0ZXIpOiBzdHJpbmcge1xuXHRcdGxldCBzRGVmYXVsdENyZWF0ZUhhc2ggPVxuXHRcdFx0b1N0YXJ0dXBQYXJhbWV0ZXJzICYmIG9TdGFydHVwUGFyYW1ldGVycy5wcmVmZXJyZWRNb2RlID8gKG9TdGFydHVwUGFyYW1ldGVycy5wcmVmZXJyZWRNb2RlWzBdIGFzIHN0cmluZykgOiBcImNyZWF0ZVwiO1xuXHRcdGxldCBzSGFzaCA9IFwiXCI7XG5cblx0XHRzRGVmYXVsdENyZWF0ZUhhc2ggPVxuXHRcdFx0c0RlZmF1bHRDcmVhdGVIYXNoLmluZGV4T2YoXCI6XCIpICE9PSAtMSAmJiBzRGVmYXVsdENyZWF0ZUhhc2gubGVuZ3RoID4gc0RlZmF1bHRDcmVhdGVIYXNoLmluZGV4T2YoXCI6XCIpICsgMVxuXHRcdFx0XHQ/IHNEZWZhdWx0Q3JlYXRlSGFzaC5zdWJzdHIoMCwgc0RlZmF1bHRDcmVhdGVIYXNoLmluZGV4T2YoXCI6XCIpKVxuXHRcdFx0XHQ6IFwiY3JlYXRlXCI7XG5cdFx0c0hhc2ggPSBgJHtzQ29udGV4dFBhdGguc3Vic3RyaW5nKDEpfSguLi4pP2ktYWN0aW9uPSR7c0RlZmF1bHRDcmVhdGVIYXNofWA7XG5cdFx0aWYgKG9Sb3V0ZXIuZ2V0Um91dGVJbmZvQnlIYXNoKHNIYXNoKSkge1xuXHRcdFx0cmV0dXJuIHNIYXNoO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoYE5vIHJvdXRlIG1hdGNoIGZvciBjcmVhdGluZyBhIG5ldyAke3NDb250ZXh0UGF0aC5zdWJzdHJpbmcoMSl9YCk7XG5cdFx0fVxuXHR9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBBcHBTdGFydHVwSGVscGVyO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7O0VBdUJBLE1BQU1BLGdCQUFnQixHQUFHO0lBQ3hCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0NDLHlCQUF5QixFQUFFLFVBQVVDLFNBQW1CLEVBQUVDLGtCQUF1QixFQUEyQjtNQUMzRyxJQUFJQyxTQUFTLEdBQUcsSUFBSTtNQUNwQixNQUFNQyxLQUFLLEdBQUdILFNBQVMsQ0FBQ0ksR0FBRyxDQUFFQyxJQUFJLElBQUs7UUFDckMsSUFBSUosa0JBQWtCLENBQUNJLElBQUksQ0FBQyxJQUFJSixrQkFBa0IsQ0FBQ0ksSUFBSSxDQUFDLENBQUNDLE1BQU0sS0FBSyxDQUFDLEVBQUU7VUFDdEUsT0FBTztZQUFFRCxJQUFJO1lBQUVFLEtBQUssRUFBRU4sa0JBQWtCLENBQUNJLElBQUksQ0FBQyxDQUFDLENBQUM7VUFBWSxDQUFDO1FBQzlELENBQUMsTUFBTTtVQUNOO1VBQ0FILFNBQVMsR0FBRyxLQUFLO1VBQ2pCLE9BQU87WUFBRUcsSUFBSTtZQUFFRSxLQUFLLEVBQUU7VUFBRyxDQUFDO1FBQzNCO01BQ0QsQ0FBQyxDQUFDO01BRUYsT0FBT0wsU0FBUyxHQUFHQyxLQUFLLEdBQUdLLFNBQVM7SUFDckMsQ0FBQztJQUVEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ0MscUJBQXFCLEVBQUUsVUFBVU4sS0FBa0IsRUFBRU8sVUFBbUIsRUFBRUMsVUFBMEIsRUFBVTtNQUM3RyxNQUFNQyxvQkFBb0IsR0FBR0MsV0FBVyxDQUFDQyx3QkFBd0IsQ0FBQ0gsVUFBVSxDQUFDO01BRTdF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