// Copyright (c) 2009-2022 SAP SE, All Rights Reserved

/**
 * @fileOverview This module communicates with the content API graphql service to retrieve and save workpage and visualization data.
 * @version 1.111.1
 */
sap.ui.define([
    "sap/ui/core/Core",
    "sap/ushell/utils/HttpClient",
    "sap/base/util/ObjectPath",
    "sap/ushell/Config",
    "sap/base/Log"
], function (
    Core,
    HttpClient,
    ObjectPath,
    Config,
    Log
) {
    "use strict";

    /**
     * Service for loading WorkPages.
     *
     * @namespace sap.ushell.components.workPageRuntime.services.WorkPage
     *
     * @constructor
     * @class
     * @since 1.72.0
     *
     * @private
     */
    var WorkPage = function () {
        this.httpClient = new HttpClient();
        this._sBaseUrl = Config.last("/core/workPages/contentApiUrl");
    };


    /**
     * Validates the given page data. Returns a rejected promise if validation fails.
     * @param {object} oPageData The page data.
     * @return {Promise} A promise, that is resolved if the page data is valid, else it is rejected.
     * @private
     */
    WorkPage.prototype._validateData = function (oPageData) {
        Log.debug("cep/editMode: load Page: validate", "Work Page service");
        if (oPageData.errors && oPageData.errors.length > 0) {
            return Promise.reject(oPageData.errors
                .map(function (oError) { return oError.message; })
                .join(",\n"));

        }
        if (!ObjectPath.get("data.WorkPage", oPageData)) {
            Log.debug("cep/editMode: load Page: validate: reject: data is empty", "Work Page service");
            return Promise.reject("Work Page data is empty");
        }
        return Promise.resolve(oPageData);
    };

    /**
     * Load the WorkPage data for the given page Id.
     * Additionally, load the visualizations used on that WorkPage.
     *
     * @param {string} sSiteId The site id.
     * @param {string} sPageId The WorkPage id.
     * @return {Promise<{ WorkPage: {UsedVisualizations: { nodes: object[] }, Editable: boolean}}>} A promise resolving with the loaded work page and visualizations.
     */
    WorkPage.prototype.loadWorkPageAndVisualizations = function (sSiteId, sPageId) {
        var sQuery = "{" +
                    "WorkPage(" +
                      "SiteId:\"" + sSiteId + "\"," +
                      "WorkPageId:\"" + sPageId + "\"" +
                    ") {" +
                        "Id," +
                        "Contents," +
                        "Editable," +
                        "UsedVisualizations{" +
                        "nodes{" +
                            "Id," +
                            "Type," +
                            "Descriptor," +
                            "DescriptorResources{" +
                                "BaseUrl," +
                                "DescriptorPath" +
                            "}" +
                        "}" +
                    "}" +
                "}" +
            "}";
        return this._doRequest(sQuery)
            .then(this._validateData)
            .then(function (oPageData) {
                var oWorkPageData = ObjectPath.get("data.WorkPage.Contents", oPageData);
                var aVizData = ObjectPath.get("data.WorkPage.UsedVisualizations.nodes", oPageData) || [];
                var bEditable = ObjectPath.get("data.WorkPage.Editable", oPageData) === true;
                return {
                    WorkPage: {
                        Contents: oWorkPageData,
                        UsedVisualizations: { nodes: aVizData },
                        Editable: bEditable
                    }
                };
            });
    };

    /**
     * Save the WorkPage data for the given page Id.
     * @param {string} sPageId The page id.
     * @param {object} oPageData Data object with page data.
     * @return {Promise<{ WorkPage: {UsedVisualizations: { nodes: object[] }, Editable: boolean}}>} A promise resolving with the returned work page and visualizations.
     */
    WorkPage.prototype.updateWorkPage = function (sPageId, oPageData) {

        // Workaround until the service is updated to correctly accept the DescriptorSchemaId field
        function _findDescriptorSchemaVersion (obj) {
            for (var i in obj) {
                if (obj[i] !== null && typeof obj[i] === "object") {
                    if (obj.DescriptorSchemaVersion) {
                        return obj.DescriptorSchemaVersion; // we believe it is always the same
                    }
                    return _findDescriptorSchemaVersion(obj[i]); // traverse recursively
                }
            }
            return "";
        }
        var sDescriptorSchemaVersion = _findDescriptorSchemaVersion(oPageData);
        function _fixPageData (obj, bCheckDescriptor) {
            if (obj && obj.DescriptorSchemaId) {
                delete obj.DescriptorSchemaId; // the DescriptorSchemaId field is not accepted by the server
            }
            for (var i in obj) {
                if (obj[i] !== null && typeof obj[i] === "object") {
                    _fixPageData(obj[i], !isNaN(i)); // traverse recursively, check descriptors for all array items
                }
            }
            if (obj && bCheckDescriptor) { // make sure the required fields are present
                obj.Descriptor = obj.Descriptor || {};
                obj.DescriptorSchemaVersion = obj.DescriptorSchemaVersion || sDescriptorSchemaVersion;
            }
        }

        // Workaround because the backend does not return an empty Cells array when querying the page, but expects one when saving the page.
        function _fixEmptyColumns (obj) {
            if (obj.Rows) {
                obj.Rows.forEach(function (oRow) {
                    if (oRow.Columns) {
                        oRow.Columns.forEach(function (oCol) {
                            if (!oCol.Cells) {
                                oCol.Cells = [];
                            }
                        });
                    }
                });
            }
        }
        _fixPageData(oPageData, true);
        _fixEmptyColumns(oPageData);
        // End of workarounds

        var sQuery = "mutation updateWorkPage($WorkPageId: String!, $Contents: JSON) {" +
                        "updateWorkPage(WorkPageId: $WorkPageId, Contents: $Contents ) {" +
                            // return Id and new Contents
                            "Id," +
                            "Contents," +
                            "Editable," +
                            "UsedVisualizations{" +
                                "nodes{" +
                                    "Id," +
                                    "Type," +
                                    "Descriptor," +
                                    "DescriptorResources{" +
                                        "BaseUrl," +
                                        "DescriptorPath" +
                                    "}" +
                                "}" +
                            "}" +
                        "}" +
                    "}";
        var oRequestData = {
            query: sQuery,
            variables: {
                WorkPageId: sPageId,
                Contents: oPageData
            }
        };

        return this.httpClient.post(this._sBaseUrl, {
            data: oRequestData,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "Accept-Language": Core.getConfiguration().getLanguageTag()
            }
        }).then(function (oResponse) {
            if (oResponse.status < 200 || oResponse.status >= 300) {
                return Promise.reject({
                    statusText: "HTTP request failed with status: " + oResponse.status,
                    responseText: oResponse.statusText
                });
            }
            var oResponseData = {};
            try {
                oResponseData = JSON.parse(oResponse.responseText || "{}");
            } catch (error) {
                return Promise.reject({
                    statusText: undefined,
                    responseText: oResponse.responseText
                });
            }
            var sTitle;
            var sErrorMsg;
            if (oResponseData.errors) {
                // Try to format the graphql error response to a more readable state
                try {
                    var aErr = oResponseData.errors[0].split("[");
                    sTitle = aErr[0];
                    var aErrors = JSON.parse("[" + aErr[1]);
                    sErrorMsg = JSON.stringify(aErrors, null, "  ");
                } catch (error) {
                    sTitle = null;
                    sErrorMsg = oResponseData.errors;
                }
                return Promise.reject({
                    statusText: sTitle,
                    responseText: sErrorMsg
                });
            }
            return oResponseData;
        }).then(function (oReturnedPageData) {
            var oWorkPageData = ObjectPath.get("data.updateWorkPage.Contents", oReturnedPageData);
            var aVizData = ObjectPath.get("data.updateWorkPage.UsedVisualizations.nodes", oReturnedPageData) || [];
            var bEditable = ObjectPath.get("data.updateWorkPage.Editable", oReturnedPageData) === true;
            return {
                WorkPage: {
                    Contents: oWorkPageData,
                    UsedVisualizations: { nodes: aVizData },
                    Editable: bEditable
                }
            };
        });
    };

    /**
     * Load the visualizations for the given type in the given siteId.
     * @param {string} sSiteId The site id.
     * @param {string[]} aTypes The viz Types.
     * @return {Promise<{Visualizations: {nodes: object[]}}>} Promise that resolves with an object containing the array of visualizations.
     */

    WorkPage.prototype.loadFilteredVisualizations = function (sSiteId, aTypes) {
        var sTypes = aTypes.map(function (sType) { return "\"" + sType + "\""; }).join(",");
        var sQuery = "{" +
                "Visualizations(" +
                    "SiteId:\"" + sSiteId + "\"," +
                    "QueryInput:{filter:{Type:{in:[" + sTypes + "]}}}" +
                ") {" +
                    "nodes{" +
                        "Id," +
                        "Type," +
                        "Descriptor," +
                        "DescriptorResources{" +
                            "BaseUrl," +
                            "DescriptorPath" +
                        "}" +
                    "}" +
                "}" +
            "}";

        return this._doRequest(sQuery).then(function (oResult) {
            var aVizData = ObjectPath.get("data.Visualizations.nodes", oResult) || [];
            return { Visualizations: { nodes: aVizData } };
        });
    };

    /**
     * Do the XHR request with the given query.
     *
     * @param {string} sQuery The query.
     * @return {Promise} Promise that resolves with the parsed JSON response if the request was successful, otherwise it is rejected.
     * @private
     */
    WorkPage.prototype._doRequest = function (sQuery) {
        return this.httpClient.get(this._sBaseUrl + "?query=" + sQuery, {
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "Accept-Language": Core.getConfiguration().getLanguageTag()
            }
        }).then(function (oResponse) {
            if (oResponse.status < 200 || oResponse.status >= 300) {
                return Promise.reject("HTTP request failed with status: " + oResponse.status + " - " + oResponse.statusText);
            }
            return JSON.parse(oResponse.responseText || "{}");
        });
    };

    return WorkPage;
}, /*export=*/ true);
