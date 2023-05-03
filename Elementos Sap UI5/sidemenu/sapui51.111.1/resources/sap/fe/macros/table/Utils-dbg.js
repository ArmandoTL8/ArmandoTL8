/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/helpers/BindingToolkit", "sap/fe/macros/DelegateUtil", "sap/fe/macros/field/FieldRuntime", "sap/fe/macros/filter/FilterUtils", "sap/ui/core/Component", "sap/ui/core/format/NumberFormat", "sap/ui/model/Filter"], function (Log, CommonUtils, BindingToolkit, DelegateUtil, FieldRuntime, FilterUtils, Component, NumberFormat, Filter) {
  "use strict";

  var pathInModel = BindingToolkit.pathInModel;
  var compileExpression = BindingToolkit.compileExpression;
  /**
   * Get filter information for a SelectionVariant annotation.
   *
   * @param oTable The table instance
   * @param sSvPath Relative SelectionVariant annotation path
   * @returns Information on filters
   *  filters: array of sap.ui.model.filters
   * text: selection Variant text property
   * @private
   * @ui5-restricted
   */
  function getFiltersInfoForSV(oTable, sSvPath) {
    const sEntityTypePath = oTable.data("entityType"),
      oMetaModel = CommonUtils.getAppComponent(oTable).getMetaModel(),
      oSelectionVariant = oMetaModel.getObject(`${sEntityTypePath}${sSvPath}`),
      mPropertyFilters = {},
      aFilters = [],
      aPaths = [];
    let sText = "";
    if (oSelectionVariant) {
      sText = oSelectionVariant.Text;
      (oSelectionVariant.SelectOptions || []).filter(function (oSelectOption) {
        return oSelectOption && oSelectOption.PropertyName && oSelectOption.PropertyName.$PropertyPath;
      }).forEach(function (oSelectOption) {
        const sPath = oSelectOption.PropertyName.$PropertyPath;
        if (!aPaths.includes(sPath)) {
          aPaths.push(sPath);
        }
        for (const j in oSelectOption.Ranges) {
          const oRange = oSelectOption.Ranges[j];
          mPropertyFilters[sPath] = (mPropertyFilters[sPath] || []).concat(new Filter(sPath, oRange.Option.$EnumMember.split("/").pop(), oRange.Low, oRange.High));
        }
      });
      for (const sPropertyPath in mPropertyFilters) {
        aFilters.push(new Filter({
          filters: mPropertyFilters[sPropertyPath],
          and: false
        }));
      }
    }
    return {
      properties: aPaths,
      filters: aFilters,
      text: sText
    };
  }
  function getHiddenFilters(oTable) {
    let aFilters = [];
    const hiddenFilters = oTable.data("hiddenFilters");
    if (hiddenFilters && Array.isArray(hiddenFilters.paths)) {
      hiddenFilters.paths.forEach(function (mPath) {
        const oSvFilter = getFiltersInfoForSV(oTable, mPath.annotationPath);
        aFilters = aFilters.concat(oSvFilter.filters);
      });
    }
    return aFilters;
  }
  function getQuickFilter(oTable) {
    let aFilters = [];
    const sQuickFilterKey = DelegateUtil.getCustomData(oTable, "quickFilterKey");
    if (sQuickFilterKey) {
      aFilters = aFilters.concat(getFiltersInfoForSV(oTable, sQuickFilterKey).filters);
    }
    return aFilters;
  }
  function getTableFilters(oTable) {
    return getQuickFilter(oTable).concat(getHiddenFilters(oTable));
  }
  function getListBindingForCount(oTable, oPageBinding, oParams) {
    let countBinding;
    const oBindingInfo = oTable.data("rowsBindingInfo"),
      oDataModel = oTable.getModel();
    const sBatchId = oParams.batchGroupId || "",
      oFilterInfo = getFilterInfo(oTable);
    let aFilters = Array.isArray(oParams.additionalFilters) ? oParams.additionalFilters : [];
    const sBindingPath = oFilterInfo.bindingPath ? oFilterInfo.bindingPath : oBindingInfo.path;
    aFilters = aFilters.concat(oFilterInfo.filters).concat(getP13nFilters(oTable));
    const oTableContextFilter = new Filter({
      filters: aFilters,
      and: true
    });

    // Need to pass by a temporary ListBinding in order to get $filter query option (as string) thanks to fetchFilter of OdataListBinding
    const oListBinding = oDataModel.bindList((oPageBinding ? `${oPageBinding.getPath()}/` : "") + sBindingPath, oTable.getBindingContext(), [], oTableContextFilter);
    return oListBinding.fetchFilter(oListBinding.getContext()).then(function (aStringFilters) {
      countBinding = oDataModel.bindProperty(`${oListBinding.getPath()}/$count`, oListBinding.getContext(), {
        $$groupId: sBatchId || "$auto",
        $filter: aStringFilters[0],
        $search: oFilterInfo.search
      });
      return countBinding.requestValue();
    }).then(function (iValue) {
      countBinding.destroy();
      oListBinding.destroy();
      return iValue;
    });
  }
  function getCountFormatted(iCount) {
    const oCountFormatter = NumberFormat.getIntegerInstance({
      groupingEnabled: true
    });
    return oCountFormatter.format(iCount);
  }
  function getFilterInfo(oTable) {
    const oTableDefinition = oTable.getParent().getTableDefinition();
    let aIgnoreProperties = [];
    function _getRelativePathArrayFromAggregates(oSubTable) {
      const mAggregates = oSubTable.getParent().getTableDefinition().aggregates;
      return Object.keys(mAggregates).map(function (sAggregateName) {
        return mAggregates[sAggregateName].relativePath;
      });
    }
    if (oTableDefinition.enableAnalytics) {
      aIgnoreProperties = aIgnoreProperties.concat(_getRelativePathArrayFromAggregates(oTable));
      if (!oTableDefinition.enableAnalyticsSearch) {
        // Search isn't allow as a $apply transformation for this table
        aIgnoreProperties = aIgnoreProperties.concat(["search"]);
      }
    }
    return FilterUtils.getFilterInfo(oTable.getFilter(), {
      ignoredProperties: aIgnoreProperties,
      targetControl: oTable
    });
  }

  /**
   * Retrieves all filters configured in Table filter personalization dialog.
   *
   * @param oTable Table instance
   * @returns Filters configured in table personalization dialog
   * @private
   * @ui5-restricted
   */
  function getP13nFilters(oTable) {
    const aP13nMode = oTable.getP13nMode();
    if (aP13nMode && aP13nMode.indexOf("Filter") > -1) {
      const aP13nProperties = (DelegateUtil.getCustomData(oTable, "sap_fe_TableDelegate_propertyInfoMap") || []).filter(function (oTableProperty) {
          return oTableProperty && !(oTableProperty.filterable === false);
        }),
        oFilterInfo = FilterUtils.getFilterInfo(oTable, {
          propertiesMetadata: aP13nProperties
        });
      if (oFilterInfo && oFilterInfo.filters) {
        return oFilterInfo.filters;
      }
    }
    return [];
  }
  function getAllFilterInfo(oTable) {
    const oIFilterInfo = getFilterInfo(oTable);
    return {
      filters: oIFilterInfo.filters.concat(getTableFilters(oTable), getP13nFilters(oTable)),
      search: oIFilterInfo.search,
      bindingPath: oIFilterInfo.bindingPath
    };
  }

  /**
   * Returns a promise that is resolved with the table itself when the table was bound.
   *
   * @param oTable The table to check for binding
   * @returns A Promise that will be resolved when table is bound
   */
  function whenBound(oTable) {
    return _getOrCreateBoundPromiseInfo(oTable).promise;
  }

  /**
   * If not yet happened, it resolves the table bound promise.
   *
   * @param oTable The table that was bound
   */
  function onTableBound(oTable) {
    const oBoundPromiseInfo = _getOrCreateBoundPromiseInfo(oTable);
    if (oBoundPromiseInfo.resolve) {
      oBoundPromiseInfo.resolve(oTable);
      oTable.data("boundPromiseResolve", null);
    }
  }
  function _getOrCreateBoundPromiseInfo(oTable) {
    if (!oTable.data("boundPromise")) {
      let fnResolve;
      oTable.data("boundPromise", new Promise(function (resolve) {
        fnResolve = resolve;
      }));
      if (oTable.isBound()) {
        fnResolve(oTable);
      } else {
        oTable.data("boundPromiseResolve", fnResolve);
      }
    }
    return {
      promise: oTable.data("boundPromise"),
      resolve: oTable.data("boundPromiseResolve")
    };
  }
  function updateBindingInfo(oBindingInfo, oFilterInfo, oFilter) {
    oBindingInfo.filters = oFilter;
    if (oFilterInfo.search) {
      oBindingInfo.parameters.$search = CommonUtils.normalizeSearchTerm(oFilterInfo.search);
    } else {
      oBindingInfo.parameters.$search = undefined;
    }
  }
  function fnGetSemanticTargetsFromTable(oController, oTable) {
    const oView = oController.getView();
    const oInternalModelContext = oView.getBindingContext("internal");
    if (oInternalModelContext) {
      const sEntitySet = DelegateUtil.getCustomData(oTable, "targetCollectionPath");
      if (sEntitySet) {
        const oComponent = oController.getOwnerComponent();
        const oAppComponent = Component.getOwnerComponentFor(oComponent);
        const oMetaModel = oAppComponent.getMetaModel();
        const oShellServiceHelper = CommonUtils.getShellServices(oAppComponent);
        const sCurrentHash = FieldRuntime._fnFixHashQueryString(CommonUtils.getHash());
        const oColumns = oTable.getParent().getTableDefinition().columns;
        const aSemanticObjectsForGetLinks = [];
        const aSemanticObjects = [];
        const aPathAlreadyProcessed = [];
        let sPath = "",
          sAnnotationPath,
          oProperty;
        let _oSemanticObject;
        const aSemanticObjectsPromises = [];
        let sQualifier, regexResult;
        for (let i = 0; i < oColumns.length; i++) {
          sAnnotationPath = oColumns[i].annotationPath;
          //this check is required in cases where custom columns are configured via manifest where there is no provision for an annotation path.
          if (sAnnotationPath) {
            oProperty = oMetaModel.getObject(sAnnotationPath);
            if (oProperty && oProperty.$kind === "Property") {
              sPath = oColumns[i].annotationPath;
            } else if (oProperty && oProperty.$Type === "com.sap.vocabularies.UI.v1.DataField") {
              sPath = `${sEntitySet}/${oMetaModel.getObject(`${sAnnotationPath}/Value/$Path`)}`;
            }
          }
          if (sPath !== "") {
            const _Keys = Object.keys(oMetaModel.getObject(sPath + "@"));
            for (let index = 0; index < _Keys.length; index++) {
              if (!aPathAlreadyProcessed.includes(sPath) && _Keys[index].indexOf(`@${"com.sap.vocabularies.Common.v1.SemanticObject"}`) === 0 && _Keys[index].indexOf(`@${"com.sap.vocabularies.Common.v1.SemanticObjectMapping"}`) === -1 && _Keys[index].indexOf(`@${"com.sap.vocabularies.Common.v1.SemanticObjectUnavailableActions"}`) === -1) {
                regexResult = /#(.*)/.exec(_Keys[index]);
                sQualifier = regexResult ? regexResult[1] : "";
                aSemanticObjectsPromises.push(CommonUtils.getSemanticObjectPromise(oAppComponent, oView, oMetaModel, sPath, sQualifier));
                aPathAlreadyProcessed.push(sPath);
              }
            }
          }
          sPath = "";
        }
        if (aSemanticObjectsPromises.length === 0) {
          return Promise.resolve();
        } else {
          Promise.all(aSemanticObjectsPromises).then(function (aValues) {
            const aGetLinksPromises = [];
            let sSemObjExpression;
            const aSemanticObjectsResolved = aValues.filter(function (element) {
              if (element.semanticObject && typeof element.semanticObject.semanticObject === "object") {
                sSemObjExpression = compileExpression(pathInModel(element.semanticObject.semanticObject.$Path));
                element.semanticObject.semanticObject = sSemObjExpression;
                element.semanticObjectForGetLinks[0].semanticObject = sSemObjExpression;
                return true;
              } else if (element) {
                return element.semanticObject !== undefined;
              } else {
                return false;
              }
            });
            for (let j = 0; j < aSemanticObjectsResolved.length; j++) {
              _oSemanticObject = aSemanticObjectsResolved[j];
              if (_oSemanticObject && _oSemanticObject.semanticObject && !(_oSemanticObject.semanticObject.semanticObject.indexOf("{") === 0)) {
                aSemanticObjectsForGetLinks.push(_oSemanticObject.semanticObjectForGetLinks);
                aSemanticObjects.push({
                  semanticObject: _oSemanticObject.semanticObject && _oSemanticObject.semanticObject.semanticObject,
                  unavailableActions: _oSemanticObject.unavailableActions,
                  path: aSemanticObjectsResolved[j].semanticObjectPath
                });
                aGetLinksPromises.push(oShellServiceHelper.getLinksWithCache([_oSemanticObject.semanticObjectForGetLinks])); //aSemanticObjectsForGetLinks));
              }
            }

            return CommonUtils.updateSemanticTargets(aGetLinksPromises, aSemanticObjects, oInternalModelContext, sCurrentHash);
          }).catch(function (oError) {
            Log.error("fnGetSemanticTargetsFromTable: Cannot get Semantic Objects", oError);
          });
        }
      }
    }
  }
  function clearSelection(oTable) {
    oTable.clearSelection();
    const oInternalModelContext = oTable.getBindingContext("internal");
    if (oInternalModelContext) {
      oInternalModelContext.setProperty("deleteEnabled", false);
      oInternalModelContext.setProperty("numberOfSelectedContexts", 0);
      oInternalModelContext.setProperty("selectedContexts", []);
      oInternalModelContext.setProperty("deletableContexts", []);
    }
  }
  const oTableUtils = {
    getCountFormatted: getCountFormatted,
    getHiddenFilters: getHiddenFilters,
    getFiltersInfoForSV: getFiltersInfoForSV,
    getTableFilters: getTableFilters,
    getListBindingForCount: getListBindingForCount,
    getFilterInfo: getFilterInfo,
    getP13nFilters: getP13nFilters,
    getAllFilterInfo: getAllFilterInfo,
    whenBound: whenBound,
    onTableBound: onTableBound,
    getSemanticTargetsFromTable: fnGetSemanticTargetsFromTable,
    updateBindingInfo: updateBindingInfo,
    clearSelection: clearSelection
  };
  return oTableUtils;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRGaWx0ZXJzSW5mb0ZvclNWIiwib1RhYmxlIiwic1N2UGF0aCIsInNFbnRpdHlUeXBlUGF0aCIsImRhdGEiLCJvTWV0YU1vZGVsIiwiQ29tbW9uVXRpbHMiLCJnZXRBcHBDb21wb25lbnQiLCJnZXRNZXRhTW9kZWwiLCJvU2VsZWN0aW9uVmFyaWFudCIsImdldE9iamVjdCIsIm1Qcm9wZXJ0eUZpbHRlcnMiLCJhRmlsdGVycyIsImFQYXRocyIsInNUZXh0IiwiVGV4dCIsIlNlbGVjdE9wdGlvbnMiLCJmaWx0ZXIiLCJvU2VsZWN0T3B0aW9uIiwiUHJvcGVydHlOYW1lIiwiJFByb3BlcnR5UGF0aCIsImZvckVhY2giLCJzUGF0aCIsImluY2x1ZGVzIiwicHVzaCIsImoiLCJSYW5nZXMiLCJvUmFuZ2UiLCJjb25jYXQiLCJGaWx0ZXIiLCJPcHRpb24iLCIkRW51bU1lbWJlciIsInNwbGl0IiwicG9wIiwiTG93IiwiSGlnaCIsInNQcm9wZXJ0eVBhdGgiLCJmaWx0ZXJzIiwiYW5kIiwicHJvcGVydGllcyIsInRleHQiLCJnZXRIaWRkZW5GaWx0ZXJzIiwiaGlkZGVuRmlsdGVycyIsIkFycmF5IiwiaXNBcnJheSIsInBhdGhzIiwibVBhdGgiLCJvU3ZGaWx0ZXIiLCJhbm5vdGF0aW9uUGF0aCIsImdldFF1aWNrRmlsdGVyIiwic1F1aWNrRmlsdGVyS2V5IiwiRGVsZWdhdGVVdGlsIiwiZ2V0Q3VzdG9tRGF0YSIsImdldFRhYmxlRmlsdGVycyIsImdldExpc3RCaW5kaW5nRm9yQ291bnQiLCJvUGFnZUJpbmRpbmciLCJvUGFyYW1zIiwiY291bnRCaW5kaW5nIiwib0JpbmRpbmdJbmZvIiwib0RhdGFNb2RlbCIsImdldE1vZGVsIiwic0JhdGNoSWQiLCJiYXRjaEdyb3VwSWQiLCJvRmlsdGVySW5mbyIsImdldEZpbHRlckluZm8iLCJhZGRpdGlvbmFsRmlsdGVycyIsInNCaW5kaW5nUGF0aCIsImJpbmRpbmdQYXRoIiwicGF0aCIsImdldFAxM25GaWx0ZXJzIiwib1RhYmxlQ29udGV4dEZpbHRlciIsIm9MaXN0QmluZGluZyIsImJpbmRMaXN0IiwiZ2V0UGF0aCIsImdldEJpbmRpbmdDb250ZXh0IiwiZmV0Y2hGaWx0ZXIiLCJnZXRDb250ZXh0IiwidGhlbiIsImFTdHJpbmdGaWx0ZXJzIiwiYmluZFByb3BlcnR5IiwiJCRncm91cElkIiwiJGZpbHRlciIsIiRzZWFyY2giLCJzZWFyY2giLCJyZXF1ZXN0VmFsdWUiLCJpVmFsdWUiLCJkZXN0cm95IiwiZ2V0Q291bnRGb3JtYXR0ZWQiLCJpQ291bnQiLCJvQ291bnRGb3JtYXR0ZXIiLCJOdW1iZXJGb3JtYXQiLCJnZXRJbnRlZ2VySW5zdGFuY2UiLCJncm91cGluZ0VuYWJsZWQiLCJmb3JtYXQiLCJvVGFibGVEZWZpbml0aW9uIiwiZ2V0UGFyZW50IiwiZ2V0VGFibGVEZWZpbml0aW9uIiwiYUlnbm9yZVByb3BlcnRpZXMiLCJfZ2V0UmVsYXRpdmVQYXRoQXJyYXlGcm9tQWdncmVnYXRlcyIsIm9TdWJUYWJsZSIsIm1BZ2dyZWdhdGVzIiwiYWdncmVnYXRlcyIsIk9iamVjdCIsImtleXMiLCJtYXAiLCJzQWdncmVnYXRlTmFtZSIsInJlbGF0aXZlUGF0aCIsImVuYWJsZUFuYWx5dGljcyIsImVuYWJsZUFuYWx5dGljc1NlYXJjaCIsIkZpbHRlclV0aWxzIiwiZ2V0RmlsdGVyIiwiaWdub3JlZFByb3BlcnRpZXMiLCJ0YXJnZXRDb250cm9sIiwiYVAxM25Nb2RlIiwiZ2V0UDEzbk1vZGUiLCJpbmRleE9mIiwiYVAxM25Qcm9wZXJ0aWVzIiwib1RhYmxlUHJvcGVydHkiLCJmaWx0ZXJhYmxlIiwicHJvcGVydGllc01ldGFkYXRhIiwiZ2V0QWxsRmlsdGVySW5mbyIsIm9JRmlsdGVySW5mbyIsIndoZW5Cb3VuZCIsIl9nZXRPckNyZWF0ZUJvdW5kUHJvbWlzZUluZm8iLCJwcm9taXNlIiwib25UYWJsZUJvdW5kIiwib0JvdW5kUHJvbWlzZUluZm8iLCJyZXNvbHZlIiwiZm5SZXNvbHZlIiwiUHJvbWlzZSIsImlzQm91bmQiLCJ1cGRhdGVCaW5kaW5nSW5mbyIsIm9GaWx0ZXIiLCJwYXJhbWV0ZXJzIiwibm9ybWFsaXplU2VhcmNoVGVybSIsInVuZGVmaW5lZCIsImZuR2V0U2VtYW50aWNUYXJnZXRzRnJvbVRhYmxlIiwib0NvbnRyb2xsZXIiLCJvVmlldyIsImdldFZpZXciLCJvSW50ZXJuYWxNb2RlbENvbnRleHQiLCJzRW50aXR5U2V0Iiwib0NvbXBvbmVudCIsImdldE93bmVyQ29tcG9uZW50Iiwib0FwcENvbXBvbmVudCIsIkNvbXBvbmVudCIsImdldE93bmVyQ29tcG9uZW50Rm9yIiwib1NoZWxsU2VydmljZUhlbHBlciIsImdldFNoZWxsU2VydmljZXMiLCJzQ3VycmVudEhhc2giLCJGaWVsZFJ1bnRpbWUiLCJfZm5GaXhIYXNoUXVlcnlTdHJpbmciLCJnZXRIYXNoIiwib0NvbHVtbnMiLCJjb2x1bW5zIiwiYVNlbWFudGljT2JqZWN0c0ZvckdldExpbmtzIiwiYVNlbWFudGljT2JqZWN0cyIsImFQYXRoQWxyZWFkeVByb2Nlc3NlZCIsInNBbm5vdGF0aW9uUGF0aCIsIm9Qcm9wZXJ0eSIsIl9vU2VtYW50aWNPYmplY3QiLCJhU2VtYW50aWNPYmplY3RzUHJvbWlzZXMiLCJzUXVhbGlmaWVyIiwicmVnZXhSZXN1bHQiLCJpIiwibGVuZ3RoIiwiJGtpbmQiLCIkVHlwZSIsIl9LZXlzIiwiaW5kZXgiLCJleGVjIiwiZ2V0U2VtYW50aWNPYmplY3RQcm9taXNlIiwiYWxsIiwiYVZhbHVlcyIsImFHZXRMaW5rc1Byb21pc2VzIiwic1NlbU9iakV4cHJlc3Npb24iLCJhU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQiLCJlbGVtZW50Iiwic2VtYW50aWNPYmplY3QiLCJjb21waWxlRXhwcmVzc2lvbiIsInBhdGhJbk1vZGVsIiwiJFBhdGgiLCJzZW1hbnRpY09iamVjdEZvckdldExpbmtzIiwidW5hdmFpbGFibGVBY3Rpb25zIiwic2VtYW50aWNPYmplY3RQYXRoIiwiZ2V0TGlua3NXaXRoQ2FjaGUiLCJ1cGRhdGVTZW1hbnRpY1RhcmdldHMiLCJjYXRjaCIsIm9FcnJvciIsIkxvZyIsImVycm9yIiwiY2xlYXJTZWxlY3Rpb24iLCJzZXRQcm9wZXJ0eSIsIm9UYWJsZVV0aWxzIiwiZ2V0U2VtYW50aWNUYXJnZXRzRnJvbVRhYmxlIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJVdGlscy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21tb25Bbm5vdGF0aW9uVGVybXMgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL0NvbW1vblwiO1xuaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgdHlwZSBBcHBDb21wb25lbnQgZnJvbSBcInNhcC9mZS9jb3JlL0FwcENvbXBvbmVudFwiO1xuaW1wb3J0IENvbW1vblV0aWxzIGZyb20gXCJzYXAvZmUvY29yZS9Db21tb25VdGlsc1wiO1xuaW1wb3J0IHsgY29tcGlsZUV4cHJlc3Npb24sIHBhdGhJbk1vZGVsIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCB7IEludGVybmFsTW9kZWxDb250ZXh0IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTW9kZWxIZWxwZXJcIjtcbmltcG9ydCB0eXBlIFBhZ2VDb250cm9sbGVyIGZyb20gXCJzYXAvZmUvY29yZS9QYWdlQ29udHJvbGxlclwiO1xuaW1wb3J0IERlbGVnYXRlVXRpbCBmcm9tIFwic2FwL2ZlL21hY3Jvcy9EZWxlZ2F0ZVV0aWxcIjtcbmltcG9ydCBGaWVsZFJ1bnRpbWUgZnJvbSBcInNhcC9mZS9tYWNyb3MvZmllbGQvRmllbGRSdW50aW1lXCI7XG5pbXBvcnQgRmlsdGVyVXRpbHMgZnJvbSBcInNhcC9mZS9tYWNyb3MvZmlsdGVyL0ZpbHRlclV0aWxzXCI7XG5pbXBvcnQgdHlwZSBUYWJsZUFQSSBmcm9tIFwic2FwL2ZlL21hY3Jvcy90YWJsZS9UYWJsZUFQSVwiO1xuaW1wb3J0IENvbXBvbmVudCBmcm9tIFwic2FwL3VpL2NvcmUvQ29tcG9uZW50XCI7XG5pbXBvcnQgdHlwZSBDb250cm9sIGZyb20gXCJzYXAvdWkvY29yZS9Db250cm9sXCI7XG5pbXBvcnQgTnVtYmVyRm9ybWF0IGZyb20gXCJzYXAvdWkvY29yZS9mb3JtYXQvTnVtYmVyRm9ybWF0XCI7XG5pbXBvcnQgdHlwZSBUYWJsZSBmcm9tIFwic2FwL3VpL21kYy9UYWJsZVwiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL0NvbnRleHRcIjtcbmltcG9ydCBGaWx0ZXIgZnJvbSBcInNhcC91aS9tb2RlbC9GaWx0ZXJcIjtcbmltcG9ydCB0eXBlIE9EYXRhVjRMaXN0QmluZGluZyBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTGlzdEJpbmRpbmdcIjtcblxuLyoqXG4gKiBHZXQgZmlsdGVyIGluZm9ybWF0aW9uIGZvciBhIFNlbGVjdGlvblZhcmlhbnQgYW5ub3RhdGlvbi5cbiAqXG4gKiBAcGFyYW0gb1RhYmxlIFRoZSB0YWJsZSBpbnN0YW5jZVxuICogQHBhcmFtIHNTdlBhdGggUmVsYXRpdmUgU2VsZWN0aW9uVmFyaWFudCBhbm5vdGF0aW9uIHBhdGhcbiAqIEByZXR1cm5zIEluZm9ybWF0aW9uIG9uIGZpbHRlcnNcbiAqICBmaWx0ZXJzOiBhcnJheSBvZiBzYXAudWkubW9kZWwuZmlsdGVyc1xuICogdGV4dDogc2VsZWN0aW9uIFZhcmlhbnQgdGV4dCBwcm9wZXJ0eVxuICogQHByaXZhdGVcbiAqIEB1aTUtcmVzdHJpY3RlZFxuICovXG5mdW5jdGlvbiBnZXRGaWx0ZXJzSW5mb0ZvclNWKG9UYWJsZTogYW55LCBzU3ZQYXRoOiBzdHJpbmcpIHtcblx0Y29uc3Qgc0VudGl0eVR5cGVQYXRoID0gb1RhYmxlLmRhdGEoXCJlbnRpdHlUeXBlXCIpLFxuXHRcdG9NZXRhTW9kZWwgPSBDb21tb25VdGlscy5nZXRBcHBDb21wb25lbnQob1RhYmxlKS5nZXRNZXRhTW9kZWwoKSxcblx0XHRvU2VsZWN0aW9uVmFyaWFudCA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NFbnRpdHlUeXBlUGF0aH0ke3NTdlBhdGh9YCksXG5cdFx0bVByb3BlcnR5RmlsdGVyczogYW55ID0ge30sXG5cdFx0YUZpbHRlcnMgPSBbXSxcblx0XHRhUGF0aHM6IGFueVtdID0gW107XG5cdGxldCBzVGV4dCA9IFwiXCI7XG5cdGlmIChvU2VsZWN0aW9uVmFyaWFudCkge1xuXHRcdHNUZXh0ID0gb1NlbGVjdGlvblZhcmlhbnQuVGV4dDtcblx0XHQob1NlbGVjdGlvblZhcmlhbnQuU2VsZWN0T3B0aW9ucyB8fCBbXSlcblx0XHRcdC5maWx0ZXIoZnVuY3Rpb24gKG9TZWxlY3RPcHRpb246IGFueSkge1xuXHRcdFx0XHRyZXR1cm4gb1NlbGVjdE9wdGlvbiAmJiBvU2VsZWN0T3B0aW9uLlByb3BlcnR5TmFtZSAmJiBvU2VsZWN0T3B0aW9uLlByb3BlcnR5TmFtZS4kUHJvcGVydHlQYXRoO1xuXHRcdFx0fSlcblx0XHRcdC5mb3JFYWNoKGZ1bmN0aW9uIChvU2VsZWN0T3B0aW9uOiBhbnkpIHtcblx0XHRcdFx0Y29uc3Qgc1BhdGggPSBvU2VsZWN0T3B0aW9uLlByb3BlcnR5TmFtZS4kUHJvcGVydHlQYXRoO1xuXHRcdFx0XHRpZiAoIWFQYXRocy5pbmNsdWRlcyhzUGF0aCkpIHtcblx0XHRcdFx0XHRhUGF0aHMucHVzaChzUGF0aCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Zm9yIChjb25zdCBqIGluIG9TZWxlY3RPcHRpb24uUmFuZ2VzKSB7XG5cdFx0XHRcdFx0Y29uc3Qgb1JhbmdlID0gb1NlbGVjdE9wdGlvbi5SYW5nZXNbal07XG5cdFx0XHRcdFx0bVByb3BlcnR5RmlsdGVyc1tzUGF0aF0gPSAobVByb3BlcnR5RmlsdGVyc1tzUGF0aF0gfHwgW10pLmNvbmNhdChcblx0XHRcdFx0XHRcdG5ldyBGaWx0ZXIoc1BhdGgsIG9SYW5nZS5PcHRpb24uJEVudW1NZW1iZXIuc3BsaXQoXCIvXCIpLnBvcCgpLCBvUmFuZ2UuTG93LCBvUmFuZ2UuSGlnaClcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdGZvciAoY29uc3Qgc1Byb3BlcnR5UGF0aCBpbiBtUHJvcGVydHlGaWx0ZXJzKSB7XG5cdFx0XHRhRmlsdGVycy5wdXNoKFxuXHRcdFx0XHRuZXcgRmlsdGVyKHtcblx0XHRcdFx0XHRmaWx0ZXJzOiBtUHJvcGVydHlGaWx0ZXJzW3NQcm9wZXJ0eVBhdGhdLFxuXHRcdFx0XHRcdGFuZDogZmFsc2Vcblx0XHRcdFx0fSlcblx0XHRcdCk7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHtcblx0XHRwcm9wZXJ0aWVzOiBhUGF0aHMsXG5cdFx0ZmlsdGVyczogYUZpbHRlcnMsXG5cdFx0dGV4dDogc1RleHRcblx0fTtcbn1cbmZ1bmN0aW9uIGdldEhpZGRlbkZpbHRlcnMob1RhYmxlOiBDb250cm9sKSB7XG5cdGxldCBhRmlsdGVyczogYW55W10gPSBbXTtcblx0Y29uc3QgaGlkZGVuRmlsdGVycyA9IG9UYWJsZS5kYXRhKFwiaGlkZGVuRmlsdGVyc1wiKTtcblx0aWYgKGhpZGRlbkZpbHRlcnMgJiYgQXJyYXkuaXNBcnJheShoaWRkZW5GaWx0ZXJzLnBhdGhzKSkge1xuXHRcdGhpZGRlbkZpbHRlcnMucGF0aHMuZm9yRWFjaChmdW5jdGlvbiAobVBhdGg6IGFueSkge1xuXHRcdFx0Y29uc3Qgb1N2RmlsdGVyID0gZ2V0RmlsdGVyc0luZm9Gb3JTVihvVGFibGUsIG1QYXRoLmFubm90YXRpb25QYXRoKTtcblx0XHRcdGFGaWx0ZXJzID0gYUZpbHRlcnMuY29uY2F0KG9TdkZpbHRlci5maWx0ZXJzKTtcblx0XHR9KTtcblx0fVxuXHRyZXR1cm4gYUZpbHRlcnM7XG59XG5mdW5jdGlvbiBnZXRRdWlja0ZpbHRlcihvVGFibGU6IENvbnRyb2wpIHtcblx0bGV0IGFGaWx0ZXJzOiBhbnlbXSA9IFtdO1xuXHRjb25zdCBzUXVpY2tGaWx0ZXJLZXkgPSBEZWxlZ2F0ZVV0aWwuZ2V0Q3VzdG9tRGF0YShvVGFibGUsIFwicXVpY2tGaWx0ZXJLZXlcIik7XG5cdGlmIChzUXVpY2tGaWx0ZXJLZXkpIHtcblx0XHRhRmlsdGVycyA9IGFGaWx0ZXJzLmNvbmNhdChnZXRGaWx0ZXJzSW5mb0ZvclNWKG9UYWJsZSwgc1F1aWNrRmlsdGVyS2V5KS5maWx0ZXJzKTtcblx0fVxuXHRyZXR1cm4gYUZpbHRlcnM7XG59XG5mdW5jdGlvbiBnZXRUYWJsZUZpbHRlcnMob1RhYmxlOiBDb250cm9sKSB7XG5cdHJldHVybiBnZXRRdWlja0ZpbHRlcihvVGFibGUpLmNvbmNhdChnZXRIaWRkZW5GaWx0ZXJzKG9UYWJsZSkpO1xufVxuZnVuY3Rpb24gZ2V0TGlzdEJpbmRpbmdGb3JDb3VudChvVGFibGU6IFRhYmxlLCBvUGFnZUJpbmRpbmc6IGFueSwgb1BhcmFtczogYW55KSB7XG5cdGxldCBjb3VudEJpbmRpbmchOiBhbnk7XG5cdGNvbnN0IG9CaW5kaW5nSW5mbyA9IG9UYWJsZS5kYXRhKFwicm93c0JpbmRpbmdJbmZvXCIpLFxuXHRcdG9EYXRhTW9kZWwgPSBvVGFibGUuZ2V0TW9kZWwoKTtcblx0Y29uc3Qgc0JhdGNoSWQgPSBvUGFyYW1zLmJhdGNoR3JvdXBJZCB8fCBcIlwiLFxuXHRcdG9GaWx0ZXJJbmZvID0gZ2V0RmlsdGVySW5mbyhvVGFibGUpO1xuXHRsZXQgYUZpbHRlcnMgPSBBcnJheS5pc0FycmF5KG9QYXJhbXMuYWRkaXRpb25hbEZpbHRlcnMpID8gb1BhcmFtcy5hZGRpdGlvbmFsRmlsdGVycyA6IFtdO1xuXHRjb25zdCBzQmluZGluZ1BhdGggPSBvRmlsdGVySW5mby5iaW5kaW5nUGF0aCA/IG9GaWx0ZXJJbmZvLmJpbmRpbmdQYXRoIDogb0JpbmRpbmdJbmZvLnBhdGg7XG5cblx0YUZpbHRlcnMgPSBhRmlsdGVycy5jb25jYXQob0ZpbHRlckluZm8uZmlsdGVycykuY29uY2F0KGdldFAxM25GaWx0ZXJzKG9UYWJsZSkpO1xuXHRjb25zdCBvVGFibGVDb250ZXh0RmlsdGVyID0gbmV3IEZpbHRlcih7XG5cdFx0ZmlsdGVyczogYUZpbHRlcnMsXG5cdFx0YW5kOiB0cnVlXG5cdH0pO1xuXG5cdC8vIE5lZWQgdG8gcGFzcyBieSBhIHRlbXBvcmFyeSBMaXN0QmluZGluZyBpbiBvcmRlciB0byBnZXQgJGZpbHRlciBxdWVyeSBvcHRpb24gKGFzIHN0cmluZykgdGhhbmtzIHRvIGZldGNoRmlsdGVyIG9mIE9kYXRhTGlzdEJpbmRpbmdcblx0Y29uc3Qgb0xpc3RCaW5kaW5nID0gb0RhdGFNb2RlbC5iaW5kTGlzdChcblx0XHQob1BhZ2VCaW5kaW5nID8gYCR7b1BhZ2VCaW5kaW5nLmdldFBhdGgoKX0vYCA6IFwiXCIpICsgc0JpbmRpbmdQYXRoLFxuXHRcdG9UYWJsZS5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIENvbnRleHQsXG5cdFx0W10sXG5cdFx0b1RhYmxlQ29udGV4dEZpbHRlclxuXHQpIGFzIE9EYXRhVjRMaXN0QmluZGluZztcblxuXHRyZXR1cm4gKG9MaXN0QmluZGluZyBhcyBhbnkpXG5cdFx0LmZldGNoRmlsdGVyKG9MaXN0QmluZGluZy5nZXRDb250ZXh0KCkpXG5cdFx0LnRoZW4oZnVuY3Rpb24gKGFTdHJpbmdGaWx0ZXJzOiBzdHJpbmdbXSkge1xuXHRcdFx0Y291bnRCaW5kaW5nID0gb0RhdGFNb2RlbC5iaW5kUHJvcGVydHkoYCR7b0xpc3RCaW5kaW5nLmdldFBhdGgoKX0vJGNvdW50YCwgb0xpc3RCaW5kaW5nLmdldENvbnRleHQoKSwge1xuXHRcdFx0XHQkJGdyb3VwSWQ6IHNCYXRjaElkIHx8IFwiJGF1dG9cIixcblx0XHRcdFx0JGZpbHRlcjogYVN0cmluZ0ZpbHRlcnNbMF0sXG5cdFx0XHRcdCRzZWFyY2g6IG9GaWx0ZXJJbmZvLnNlYXJjaFxuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm4gY291bnRCaW5kaW5nLnJlcXVlc3RWYWx1ZSgpO1xuXHRcdH0pXG5cdFx0LnRoZW4oZnVuY3Rpb24gKGlWYWx1ZTogYW55KSB7XG5cdFx0XHRjb3VudEJpbmRpbmcuZGVzdHJveSgpO1xuXHRcdFx0b0xpc3RCaW5kaW5nLmRlc3Ryb3koKTtcblx0XHRcdHJldHVybiBpVmFsdWU7XG5cdFx0fSk7XG59XG5mdW5jdGlvbiBnZXRDb3VudEZvcm1hdHRlZChpQ291bnQ6IGFueSkge1xuXHRjb25zdCBvQ291bnRGb3JtYXR0ZXIgPSBOdW1iZXJGb3JtYXQuZ2V0SW50ZWdlckluc3RhbmNlKHsgZ3JvdXBpbmdFbmFibGVkOiB0cnVlIH0pO1xuXHRyZXR1cm4gb0NvdW50Rm9ybWF0dGVyLmZvcm1hdChpQ291bnQpO1xufVxuZnVuY3Rpb24gZ2V0RmlsdGVySW5mbyhvVGFibGU6IGFueSkge1xuXHRjb25zdCBvVGFibGVEZWZpbml0aW9uID0gb1RhYmxlLmdldFBhcmVudCgpLmdldFRhYmxlRGVmaW5pdGlvbigpO1xuXHRsZXQgYUlnbm9yZVByb3BlcnRpZXM6IGFueVtdID0gW107XG5cblx0ZnVuY3Rpb24gX2dldFJlbGF0aXZlUGF0aEFycmF5RnJvbUFnZ3JlZ2F0ZXMob1N1YlRhYmxlOiBUYWJsZSkge1xuXHRcdGNvbnN0IG1BZ2dyZWdhdGVzID0gKG9TdWJUYWJsZS5nZXRQYXJlbnQoKSBhcyBUYWJsZUFQSSkuZ2V0VGFibGVEZWZpbml0aW9uKCkuYWdncmVnYXRlcyBhcyBhbnk7XG5cdFx0cmV0dXJuIE9iamVjdC5rZXlzKG1BZ2dyZWdhdGVzKS5tYXAoZnVuY3Rpb24gKHNBZ2dyZWdhdGVOYW1lKSB7XG5cdFx0XHRyZXR1cm4gbUFnZ3JlZ2F0ZXNbc0FnZ3JlZ2F0ZU5hbWVdLnJlbGF0aXZlUGF0aDtcblx0XHR9KTtcblx0fVxuXG5cdGlmIChvVGFibGVEZWZpbml0aW9uLmVuYWJsZUFuYWx5dGljcykge1xuXHRcdGFJZ25vcmVQcm9wZXJ0aWVzID0gYUlnbm9yZVByb3BlcnRpZXMuY29uY2F0KF9nZXRSZWxhdGl2ZVBhdGhBcnJheUZyb21BZ2dyZWdhdGVzKG9UYWJsZSkpO1xuXG5cdFx0aWYgKCFvVGFibGVEZWZpbml0aW9uLmVuYWJsZUFuYWx5dGljc1NlYXJjaCkge1xuXHRcdFx0Ly8gU2VhcmNoIGlzbid0IGFsbG93IGFzIGEgJGFwcGx5IHRyYW5zZm9ybWF0aW9uIGZvciB0aGlzIHRhYmxlXG5cdFx0XHRhSWdub3JlUHJvcGVydGllcyA9IGFJZ25vcmVQcm9wZXJ0aWVzLmNvbmNhdChbXCJzZWFyY2hcIl0pO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gRmlsdGVyVXRpbHMuZ2V0RmlsdGVySW5mbyhvVGFibGUuZ2V0RmlsdGVyKCksIHtcblx0XHRpZ25vcmVkUHJvcGVydGllczogYUlnbm9yZVByb3BlcnRpZXMsXG5cdFx0dGFyZ2V0Q29udHJvbDogb1RhYmxlXG5cdH0pO1xufVxuXG4vKipcbiAqIFJldHJpZXZlcyBhbGwgZmlsdGVycyBjb25maWd1cmVkIGluIFRhYmxlIGZpbHRlciBwZXJzb25hbGl6YXRpb24gZGlhbG9nLlxuICpcbiAqIEBwYXJhbSBvVGFibGUgVGFibGUgaW5zdGFuY2VcbiAqIEByZXR1cm5zIEZpbHRlcnMgY29uZmlndXJlZCBpbiB0YWJsZSBwZXJzb25hbGl6YXRpb24gZGlhbG9nXG4gKiBAcHJpdmF0ZVxuICogQHVpNS1yZXN0cmljdGVkXG4gKi9cbmZ1bmN0aW9uIGdldFAxM25GaWx0ZXJzKG9UYWJsZTogVGFibGUpIHtcblx0Y29uc3QgYVAxM25Nb2RlID0gb1RhYmxlLmdldFAxM25Nb2RlKCk7XG5cdGlmIChhUDEzbk1vZGUgJiYgYVAxM25Nb2RlLmluZGV4T2YoXCJGaWx0ZXJcIikgPiAtMSkge1xuXHRcdGNvbnN0IGFQMTNuUHJvcGVydGllcyA9IChEZWxlZ2F0ZVV0aWwuZ2V0Q3VzdG9tRGF0YShvVGFibGUsIFwic2FwX2ZlX1RhYmxlRGVsZWdhdGVfcHJvcGVydHlJbmZvTWFwXCIpIHx8IFtdKS5maWx0ZXIoZnVuY3Rpb24gKFxuXHRcdFx0XHRvVGFibGVQcm9wZXJ0eTogYW55XG5cdFx0XHQpIHtcblx0XHRcdFx0cmV0dXJuIG9UYWJsZVByb3BlcnR5ICYmICEob1RhYmxlUHJvcGVydHkuZmlsdGVyYWJsZSA9PT0gZmFsc2UpO1xuXHRcdFx0fSksXG5cdFx0XHRvRmlsdGVySW5mbyA9IEZpbHRlclV0aWxzLmdldEZpbHRlckluZm8ob1RhYmxlLCB7IHByb3BlcnRpZXNNZXRhZGF0YTogYVAxM25Qcm9wZXJ0aWVzIH0pO1xuXHRcdGlmIChvRmlsdGVySW5mbyAmJiBvRmlsdGVySW5mby5maWx0ZXJzKSB7XG5cdFx0XHRyZXR1cm4gb0ZpbHRlckluZm8uZmlsdGVycztcblx0XHR9XG5cdH1cblx0cmV0dXJuIFtdO1xufVxuXG5mdW5jdGlvbiBnZXRBbGxGaWx0ZXJJbmZvKG9UYWJsZTogVGFibGUpIHtcblx0Y29uc3Qgb0lGaWx0ZXJJbmZvID0gZ2V0RmlsdGVySW5mbyhvVGFibGUpO1xuXHRyZXR1cm4ge1xuXHRcdGZpbHRlcnM6IG9JRmlsdGVySW5mby5maWx0ZXJzLmNvbmNhdChnZXRUYWJsZUZpbHRlcnMob1RhYmxlKSwgZ2V0UDEzbkZpbHRlcnMob1RhYmxlKSksXG5cdFx0c2VhcmNoOiBvSUZpbHRlckluZm8uc2VhcmNoLFxuXHRcdGJpbmRpbmdQYXRoOiBvSUZpbHRlckluZm8uYmluZGluZ1BhdGhcblx0fTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgcHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdpdGggdGhlIHRhYmxlIGl0c2VsZiB3aGVuIHRoZSB0YWJsZSB3YXMgYm91bmQuXG4gKlxuICogQHBhcmFtIG9UYWJsZSBUaGUgdGFibGUgdG8gY2hlY2sgZm9yIGJpbmRpbmdcbiAqIEByZXR1cm5zIEEgUHJvbWlzZSB0aGF0IHdpbGwgYmUgcmVzb2x2ZWQgd2hlbiB0YWJsZSBpcyBib3VuZFxuICovXG5mdW5jdGlvbiB3aGVuQm91bmQob1RhYmxlOiBUYWJsZSkge1xuXHRyZXR1cm4gX2dldE9yQ3JlYXRlQm91bmRQcm9taXNlSW5mbyhvVGFibGUpLnByb21pc2U7XG59XG5cbi8qKlxuICogSWYgbm90IHlldCBoYXBwZW5lZCwgaXQgcmVzb2x2ZXMgdGhlIHRhYmxlIGJvdW5kIHByb21pc2UuXG4gKlxuICogQHBhcmFtIG9UYWJsZSBUaGUgdGFibGUgdGhhdCB3YXMgYm91bmRcbiAqL1xuZnVuY3Rpb24gb25UYWJsZUJvdW5kKG9UYWJsZTogVGFibGUpIHtcblx0Y29uc3Qgb0JvdW5kUHJvbWlzZUluZm8gPSBfZ2V0T3JDcmVhdGVCb3VuZFByb21pc2VJbmZvKG9UYWJsZSk7XG5cdGlmIChvQm91bmRQcm9taXNlSW5mby5yZXNvbHZlKSB7XG5cdFx0b0JvdW5kUHJvbWlzZUluZm8ucmVzb2x2ZShvVGFibGUpO1xuXHRcdG9UYWJsZS5kYXRhKFwiYm91bmRQcm9taXNlUmVzb2x2ZVwiLCBudWxsKTtcblx0fVxufVxuXG5mdW5jdGlvbiBfZ2V0T3JDcmVhdGVCb3VuZFByb21pc2VJbmZvKG9UYWJsZTogVGFibGUpIHtcblx0aWYgKCFvVGFibGUuZGF0YShcImJvdW5kUHJvbWlzZVwiKSkge1xuXHRcdGxldCBmblJlc29sdmU6IGFueTtcblx0XHRvVGFibGUuZGF0YShcblx0XHRcdFwiYm91bmRQcm9taXNlXCIsXG5cdFx0XHRuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSkge1xuXHRcdFx0XHRmblJlc29sdmUgPSByZXNvbHZlO1xuXHRcdFx0fSlcblx0XHQpO1xuXHRcdGlmICgob1RhYmxlIGFzIGFueSkuaXNCb3VuZCgpKSB7XG5cdFx0XHRmblJlc29sdmUob1RhYmxlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0b1RhYmxlLmRhdGEoXCJib3VuZFByb21pc2VSZXNvbHZlXCIsIGZuUmVzb2x2ZSk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiB7IHByb21pc2U6IG9UYWJsZS5kYXRhKFwiYm91bmRQcm9taXNlXCIpLCByZXNvbHZlOiBvVGFibGUuZGF0YShcImJvdW5kUHJvbWlzZVJlc29sdmVcIikgfTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlQmluZGluZ0luZm8ob0JpbmRpbmdJbmZvOiBhbnksIG9GaWx0ZXJJbmZvOiBhbnksIG9GaWx0ZXI6IGFueSkge1xuXHRvQmluZGluZ0luZm8uZmlsdGVycyA9IG9GaWx0ZXI7XG5cdGlmIChvRmlsdGVySW5mby5zZWFyY2gpIHtcblx0XHRvQmluZGluZ0luZm8ucGFyYW1ldGVycy4kc2VhcmNoID0gQ29tbW9uVXRpbHMubm9ybWFsaXplU2VhcmNoVGVybShvRmlsdGVySW5mby5zZWFyY2gpO1xuXHR9IGVsc2Uge1xuXHRcdG9CaW5kaW5nSW5mby5wYXJhbWV0ZXJzLiRzZWFyY2ggPSB1bmRlZmluZWQ7XG5cdH1cbn1cblxuZnVuY3Rpb24gZm5HZXRTZW1hbnRpY1RhcmdldHNGcm9tVGFibGUob0NvbnRyb2xsZXI6IFBhZ2VDb250cm9sbGVyLCBvVGFibGU6IFRhYmxlKSB7XG5cdGNvbnN0IG9WaWV3ID0gb0NvbnRyb2xsZXIuZ2V0VmlldygpO1xuXHRjb25zdCBvSW50ZXJuYWxNb2RlbENvbnRleHQgPSBvVmlldy5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpIGFzIEludGVybmFsTW9kZWxDb250ZXh0O1xuXHRpZiAob0ludGVybmFsTW9kZWxDb250ZXh0KSB7XG5cdFx0Y29uc3Qgc0VudGl0eVNldCA9IERlbGVnYXRlVXRpbC5nZXRDdXN0b21EYXRhKG9UYWJsZSwgXCJ0YXJnZXRDb2xsZWN0aW9uUGF0aFwiKTtcblx0XHRpZiAoc0VudGl0eVNldCkge1xuXHRcdFx0Y29uc3Qgb0NvbXBvbmVudCA9IG9Db250cm9sbGVyLmdldE93bmVyQ29tcG9uZW50KCk7XG5cdFx0XHRjb25zdCBvQXBwQ29tcG9uZW50ID0gQ29tcG9uZW50LmdldE93bmVyQ29tcG9uZW50Rm9yKG9Db21wb25lbnQpIGFzIEFwcENvbXBvbmVudDtcblx0XHRcdGNvbnN0IG9NZXRhTW9kZWwgPSBvQXBwQ29tcG9uZW50LmdldE1ldGFNb2RlbCgpO1xuXHRcdFx0Y29uc3Qgb1NoZWxsU2VydmljZUhlbHBlciA9IENvbW1vblV0aWxzLmdldFNoZWxsU2VydmljZXMob0FwcENvbXBvbmVudCk7XG5cdFx0XHRjb25zdCBzQ3VycmVudEhhc2ggPSBGaWVsZFJ1bnRpbWUuX2ZuRml4SGFzaFF1ZXJ5U3RyaW5nKENvbW1vblV0aWxzLmdldEhhc2goKSk7XG5cdFx0XHRjb25zdCBvQ29sdW1ucyA9IChvVGFibGUuZ2V0UGFyZW50KCkgYXMgVGFibGVBUEkpLmdldFRhYmxlRGVmaW5pdGlvbigpLmNvbHVtbnM7XG5cdFx0XHRjb25zdCBhU2VtYW50aWNPYmplY3RzRm9yR2V0TGlua3MgPSBbXTtcblx0XHRcdGNvbnN0IGFTZW1hbnRpY09iamVjdHM6IGFueVtdID0gW107XG5cdFx0XHRjb25zdCBhUGF0aEFscmVhZHlQcm9jZXNzZWQ6IHN0cmluZ1tdID0gW107XG5cdFx0XHRsZXQgc1BhdGg6IHN0cmluZyA9IFwiXCIsXG5cdFx0XHRcdHNBbm5vdGF0aW9uUGF0aCxcblx0XHRcdFx0b1Byb3BlcnR5O1xuXHRcdFx0bGV0IF9vU2VtYW50aWNPYmplY3Q7XG5cdFx0XHRjb25zdCBhU2VtYW50aWNPYmplY3RzUHJvbWlzZXM6IFByb21pc2U8YW55PltdID0gW107XG5cdFx0XHRsZXQgc1F1YWxpZmllcjogc3RyaW5nLCByZWdleFJlc3VsdDtcblxuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBvQ29sdW1ucy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRzQW5ub3RhdGlvblBhdGggPSAob0NvbHVtbnNbaV0gYXMgYW55KS5hbm5vdGF0aW9uUGF0aDtcblx0XHRcdFx0Ly90aGlzIGNoZWNrIGlzIHJlcXVpcmVkIGluIGNhc2VzIHdoZXJlIGN1c3RvbSBjb2x1bW5zIGFyZSBjb25maWd1cmVkIHZpYSBtYW5pZmVzdCB3aGVyZSB0aGVyZSBpcyBubyBwcm92aXNpb24gZm9yIGFuIGFubm90YXRpb24gcGF0aC5cblx0XHRcdFx0aWYgKHNBbm5vdGF0aW9uUGF0aCkge1xuXHRcdFx0XHRcdG9Qcm9wZXJ0eSA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KHNBbm5vdGF0aW9uUGF0aCk7XG5cdFx0XHRcdFx0aWYgKG9Qcm9wZXJ0eSAmJiBvUHJvcGVydHkuJGtpbmQgPT09IFwiUHJvcGVydHlcIikge1xuXHRcdFx0XHRcdFx0c1BhdGggPSAob0NvbHVtbnNbaV0gYXMgYW55KS5hbm5vdGF0aW9uUGF0aDtcblx0XHRcdFx0XHR9IGVsc2UgaWYgKG9Qcm9wZXJ0eSAmJiBvUHJvcGVydHkuJFR5cGUgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkXCIpIHtcblx0XHRcdFx0XHRcdHNQYXRoID0gYCR7c0VudGl0eVNldH0vJHtvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzQW5ub3RhdGlvblBhdGh9L1ZhbHVlLyRQYXRoYCl9YDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHNQYXRoICE9PSBcIlwiKSB7XG5cdFx0XHRcdFx0Y29uc3QgX0tleXMgPSBPYmplY3Qua2V5cyhvTWV0YU1vZGVsLmdldE9iamVjdChzUGF0aCArIFwiQFwiKSk7XG5cdFx0XHRcdFx0Zm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IF9LZXlzLmxlbmd0aDsgaW5kZXgrKykge1xuXHRcdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0XHQhYVBhdGhBbHJlYWR5UHJvY2Vzc2VkLmluY2x1ZGVzKHNQYXRoKSAmJlxuXHRcdFx0XHRcdFx0XHRfS2V5c1tpbmRleF0uaW5kZXhPZihgQCR7Q29tbW9uQW5ub3RhdGlvblRlcm1zLlNlbWFudGljT2JqZWN0fWApID09PSAwICYmXG5cdFx0XHRcdFx0XHRcdF9LZXlzW2luZGV4XS5pbmRleE9mKGBAJHtDb21tb25Bbm5vdGF0aW9uVGVybXMuU2VtYW50aWNPYmplY3RNYXBwaW5nfWApID09PSAtMSAmJlxuXHRcdFx0XHRcdFx0XHRfS2V5c1tpbmRleF0uaW5kZXhPZihgQCR7Q29tbW9uQW5ub3RhdGlvblRlcm1zLlNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zfWApID09PSAtMVxuXHRcdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHRcdHJlZ2V4UmVzdWx0ID0gLyMoLiopLy5leGVjKF9LZXlzW2luZGV4XSk7XG5cdFx0XHRcdFx0XHRcdHNRdWFsaWZpZXIgPSByZWdleFJlc3VsdCA/IHJlZ2V4UmVzdWx0WzFdIDogXCJcIjtcblx0XHRcdFx0XHRcdFx0YVNlbWFudGljT2JqZWN0c1Byb21pc2VzLnB1c2goXG5cdFx0XHRcdFx0XHRcdFx0Q29tbW9uVXRpbHMuZ2V0U2VtYW50aWNPYmplY3RQcm9taXNlKG9BcHBDb21wb25lbnQsIG9WaWV3LCBvTWV0YU1vZGVsLCBzUGF0aCwgc1F1YWxpZmllcilcblx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdFx0YVBhdGhBbHJlYWR5UHJvY2Vzc2VkLnB1c2goc1BhdGgpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRzUGF0aCA9IFwiXCI7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChhU2VtYW50aWNPYmplY3RzUHJvbWlzZXMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFByb21pc2UuYWxsKGFTZW1hbnRpY09iamVjdHNQcm9taXNlcylcblx0XHRcdFx0XHQudGhlbihmdW5jdGlvbiAoYVZhbHVlczogYW55W10pIHtcblx0XHRcdFx0XHRcdGNvbnN0IGFHZXRMaW5rc1Byb21pc2VzID0gW107XG5cdFx0XHRcdFx0XHRsZXQgc1NlbU9iakV4cHJlc3Npb247XG5cdFx0XHRcdFx0XHRjb25zdCBhU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQgPSBhVmFsdWVzLmZpbHRlcihmdW5jdGlvbiAoZWxlbWVudDogYW55KSB7XG5cdFx0XHRcdFx0XHRcdGlmIChlbGVtZW50LnNlbWFudGljT2JqZWN0ICYmIHR5cGVvZiBlbGVtZW50LnNlbWFudGljT2JqZWN0LnNlbWFudGljT2JqZWN0ID09PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRcdFx0XHRcdFx0c1NlbU9iakV4cHJlc3Npb24gPSBjb21waWxlRXhwcmVzc2lvbihwYXRoSW5Nb2RlbChlbGVtZW50LnNlbWFudGljT2JqZWN0LnNlbWFudGljT2JqZWN0LiRQYXRoKSk7XG5cdFx0XHRcdFx0XHRcdFx0ZWxlbWVudC5zZW1hbnRpY09iamVjdC5zZW1hbnRpY09iamVjdCA9IHNTZW1PYmpFeHByZXNzaW9uO1xuXHRcdFx0XHRcdFx0XHRcdGVsZW1lbnQuc2VtYW50aWNPYmplY3RGb3JHZXRMaW5rc1swXS5zZW1hbnRpY09iamVjdCA9IHNTZW1PYmpFeHByZXNzaW9uO1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHRcdFx0XHR9IGVsc2UgaWYgKGVsZW1lbnQpIHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gZWxlbWVudC5zZW1hbnRpY09iamVjdCAhPT0gdW5kZWZpbmVkO1xuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRmb3IgKGxldCBqID0gMDsgaiA8IGFTZW1hbnRpY09iamVjdHNSZXNvbHZlZC5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRcdFx0XHRfb1NlbWFudGljT2JqZWN0ID0gYVNlbWFudGljT2JqZWN0c1Jlc29sdmVkW2pdO1xuXHRcdFx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRcdFx0X29TZW1hbnRpY09iamVjdCAmJlxuXHRcdFx0XHRcdFx0XHRcdF9vU2VtYW50aWNPYmplY3Quc2VtYW50aWNPYmplY3QgJiZcblx0XHRcdFx0XHRcdFx0XHQhKF9vU2VtYW50aWNPYmplY3Quc2VtYW50aWNPYmplY3Quc2VtYW50aWNPYmplY3QuaW5kZXhPZihcIntcIikgPT09IDApXG5cdFx0XHRcdFx0XHRcdCkge1xuXHRcdFx0XHRcdFx0XHRcdGFTZW1hbnRpY09iamVjdHNGb3JHZXRMaW5rcy5wdXNoKF9vU2VtYW50aWNPYmplY3Quc2VtYW50aWNPYmplY3RGb3JHZXRMaW5rcyk7XG5cdFx0XHRcdFx0XHRcdFx0YVNlbWFudGljT2JqZWN0cy5wdXNoKHtcblx0XHRcdFx0XHRcdFx0XHRcdHNlbWFudGljT2JqZWN0OiBfb1NlbWFudGljT2JqZWN0LnNlbWFudGljT2JqZWN0ICYmIF9vU2VtYW50aWNPYmplY3Quc2VtYW50aWNPYmplY3Quc2VtYW50aWNPYmplY3QsXG5cdFx0XHRcdFx0XHRcdFx0XHR1bmF2YWlsYWJsZUFjdGlvbnM6IF9vU2VtYW50aWNPYmplY3QudW5hdmFpbGFibGVBY3Rpb25zLFxuXHRcdFx0XHRcdFx0XHRcdFx0cGF0aDogYVNlbWFudGljT2JqZWN0c1Jlc29sdmVkW2pdLnNlbWFudGljT2JqZWN0UGF0aFxuXHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHRcdGFHZXRMaW5rc1Byb21pc2VzLnB1c2gob1NoZWxsU2VydmljZUhlbHBlci5nZXRMaW5rc1dpdGhDYWNoZShbX29TZW1hbnRpY09iamVjdC5zZW1hbnRpY09iamVjdEZvckdldExpbmtzXSkpOyAvL2FTZW1hbnRpY09iamVjdHNGb3JHZXRMaW5rcykpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRyZXR1cm4gQ29tbW9uVXRpbHMudXBkYXRlU2VtYW50aWNUYXJnZXRzKGFHZXRMaW5rc1Byb21pc2VzLCBhU2VtYW50aWNPYmplY3RzLCBvSW50ZXJuYWxNb2RlbENvbnRleHQsIHNDdXJyZW50SGFzaCk7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24gKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdFx0XHRMb2cuZXJyb3IoXCJmbkdldFNlbWFudGljVGFyZ2V0c0Zyb21UYWJsZTogQ2Fubm90IGdldCBTZW1hbnRpYyBPYmplY3RzXCIsIG9FcnJvcik7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59XG5mdW5jdGlvbiBjbGVhclNlbGVjdGlvbihvVGFibGU6IGFueSkge1xuXHRvVGFibGUuY2xlYXJTZWxlY3Rpb24oKTtcblx0Y29uc3Qgb0ludGVybmFsTW9kZWxDb250ZXh0ID0gb1RhYmxlLmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIik7XG5cdGlmIChvSW50ZXJuYWxNb2RlbENvbnRleHQpIHtcblx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoXCJkZWxldGVFbmFibGVkXCIsIGZhbHNlKTtcblx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoXCJudW1iZXJPZlNlbGVjdGVkQ29udGV4dHNcIiwgMCk7XG5cdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwic2VsZWN0ZWRDb250ZXh0c1wiLCBbXSk7XG5cdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwiZGVsZXRhYmxlQ29udGV4dHNcIiwgW10pO1xuXHR9XG59XG5cbmNvbnN0IG9UYWJsZVV0aWxzID0ge1xuXHRnZXRDb3VudEZvcm1hdHRlZDogZ2V0Q291bnRGb3JtYXR0ZWQsXG5cdGdldEhpZGRlbkZpbHRlcnM6IGdldEhpZGRlbkZpbHRlcnMsXG5cdGdldEZpbHRlcnNJbmZvRm9yU1Y6IGdldEZpbHRlcnNJbmZvRm9yU1YsXG5cdGdldFRhYmxlRmlsdGVyczogZ2V0VGFibGVGaWx0ZXJzLFxuXHRnZXRMaXN0QmluZGluZ0ZvckNvdW50OiBnZXRMaXN0QmluZGluZ0ZvckNvdW50LFxuXHRnZXRGaWx0ZXJJbmZvOiBnZXRGaWx0ZXJJbmZvLFxuXHRnZXRQMTNuRmlsdGVyczogZ2V0UDEzbkZpbHRlcnMsXG5cdGdldEFsbEZpbHRlckluZm86IGdldEFsbEZpbHRlckluZm8sXG5cdHdoZW5Cb3VuZDogd2hlbkJvdW5kLFxuXHRvblRhYmxlQm91bmQ6IG9uVGFibGVCb3VuZCxcblx0Z2V0U2VtYW50aWNUYXJnZXRzRnJvbVRhYmxlOiBmbkdldFNlbWFudGljVGFyZ2V0c0Zyb21UYWJsZSxcblx0dXBkYXRlQmluZGluZ0luZm86IHVwZGF0ZUJpbmRpbmdJbmZvLFxuXHRjbGVhclNlbGVjdGlvbjogY2xlYXJTZWxlY3Rpb25cbn07XG5cbmV4cG9ydCBkZWZhdWx0IG9UYWJsZVV0aWxzO1xu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