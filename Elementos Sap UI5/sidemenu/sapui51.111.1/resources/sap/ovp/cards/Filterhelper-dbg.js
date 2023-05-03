sap.ui.define([
    "sap/base/util/isEmptyObject",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/model/odata/ODataMetadata",
    "sap/ui/model/Filter",
    "sap/ovp/cards/v4/V4AnnotationHelper"
], function (
    isEmptyObject,
    ODataModel,
    ODataMetadata,
    Filter,
    V4AnnotationHelper
) {
    "use strict";

    function getSeletionAnnotaionPath(oCard) {
        var annotationPath;
        if (oCard) {
            if (oCard.settings.tabs) {
                var iIndex = 0;
                var iSelectedKey = oCard.settings.selectedKey;
                if (iSelectedKey && oCard.settings.tabs.length >= iSelectedKey) {
                    iIndex = iSelectedKey - 1;
                }
                annotationPath = oCard.settings.tabs[iIndex]["selectionAnnotationPath"];
            } else {
                annotationPath = oCard.settings["selectionAnnotationPath"];
            }
        }
        return annotationPath;
    }

    return {
        _getEntityRelevantFilters: function (oEntityType, aFilters) {
            var oReturnFilterWrap = [];
            if (aFilters.length > 0 && oEntityType) {
                var oReturnFilter = this._checkRelevantFiltersRecursive(oEntityType, aFilters[0]);

                //Wrap the return filter in an array
                if (oReturnFilter) {
                    oReturnFilterWrap.push(oReturnFilter);
                }
            }
            return oReturnFilterWrap;
        },
        _checkRelevantFiltersRecursive: function (aEntityProperties, oFilterDetails) {
            if (!oFilterDetails._bMultiFilter) {
                //End point of recursion (base case)
                oFilterDetails.sPath = oFilterDetails.sPath.split("/").pop();
                //Get the mapping property. This would return the same property name in case a match is found
                //or else a property that is mapped in annotations. If nothing is found, then it returns null
                var sMappedProperty = this._getPropertyMapping(aEntityProperties, oFilterDetails.sPath);
                if (sMappedProperty) {
                    oFilterDetails.sPath = sMappedProperty;
                    return oFilterDetails;
                }
            } else {
                //For multifilter cases, there are deep structures
                var aDeepFilters = oFilterDetails.aFilters;
                var oSelectedFilter,
                    aSelectedFilters = [];

                if (aDeepFilters) {
                    for (var i = 0; i < aDeepFilters.length; i++) {
                        //Get the relevant filter object for each internal filter
                        oSelectedFilter = this._checkRelevantFiltersRecursive(aEntityProperties, aDeepFilters[i]);
                        if (oSelectedFilter) {
                            aSelectedFilters.push(oSelectedFilter);
                        }
                    }
                    if (aSelectedFilters.length > 0) {
                        return new Filter(aSelectedFilters, oFilterDetails.bAnd);
                    }
                }
            }
        },
        _getPropertyMapping: function (aEntityProperties, sTargetProperty) {
            if (sTargetProperty in aEntityProperties) {
                return sTargetProperty;
            }
        },
        mergeFilters: function (entityRelevantFilters, selectionFilters) {
            // no selectionFilters and no entityRelevantFilters exit
            if (
                selectionFilters &&
                selectionFilters.length === 0 &&
                selectionFilters &&
                entityRelevantFilters.length === 0
            ) {
                return [];
            }
            var aFilters = [];
            //the filters returned from V4AnnotationHelper getFilters  are filter objets not sap filter type they need to be converted
            if (selectionFilters && selectionFilters.length > 0) {
                var aTempFilter = [];
                var pathFilterMapping = {};
                selectionFilters.forEach(function (filterObj) {
                    if (pathFilterMapping[filterObj.path]) {
                        pathFilterMapping[filterObj.path].push(new Filter(filterObj));
                    } else {
                        pathFilterMapping[filterObj.path] = [new Filter(filterObj)];
                    }
                });
                Object.keys(pathFilterMapping).forEach(function (path) {
                    aTempFilter.push(new Filter({ filters: pathFilterMapping[path], and: false }));
                });
                aFilters.push(new Filter({ filters: aTempFilter, and: true }));
            }
            //the filters from relevant filters are already multifilters merge the above
            if (!isEmptyObject(entityRelevantFilters[0])) {
                aFilters.push(entityRelevantFilters[0]);
            }
            return new Filter({ filters: aFilters, and: true });
        },
        getSelectionVariantFilters: function (cardmanifestModel, oOVPCardPropertiesModel, entityType) {
            var propertiesModeldata = oOVPCardPropertiesModel.getData(),
                currentCardManifestModel = cardmanifestModel.filter(function (el) {
                    return el.id === propertiesModeldata.cardId;
                })[0],
                //selectionAnnotationPath = "@" + currentCardManifestModel.settings['selectionAnnotationPath'],
                selectionAnnotationPath = "@" + getSeletionAnnotaionPath(currentCardManifestModel),
                oSelectionVariant = entityType[selectionAnnotationPath];
            return oSelectionVariant
                ? V4AnnotationHelper.getFilters(oOVPCardPropertiesModel, oSelectionVariant)
                : [];
        },
        formatLiteral: function (vValue, sType) {
            var rSingleQuote = /'/g;
            if (vValue === undefined) {
                throw new Error("Illegal value: undefined");
            }
            if (vValue === null) {
                return "null";
            }

            switch (sType) {
                case "Edm.Binary":
                    return "binary'" + vValue + "'";
                case "Edm.Boolean":
                case "Edm.Byte":
                case "Edm.Double":
                case "Edm.Int16":
                case "Edm.Int32":
                case "Edm.SByte":
                case "Edm.Single":
                    return String(vValue);
                case "Edm.Date":
                case "Edm.DateTimeOffset":
                case "Edm.Decimal":
                case "Edm.Guid":
                case "Edm.Int64":
                case "Edm.TimeOfDay":
                    return vValue;
                case "Edm.Duration":
                    return "duration'" + vValue + "'";
                case "Edm.String":
                    return "'" + vValue.replace(rSingleQuote, "''") + "'";
                default:
                    throw new Error("Unsupported type: " + sType);
            }
        }
    };
}, /* bExport= */ true);
