// Copyright (c) 2009-2022 SAP SE, All Rights Reserved

/**
 * @fileOverview This module is the search provider main interface
 * @version 1.111.1
 */
sap.ui.define([], function () {
    "use strict";

    var SearchProvider = {
    };

    SearchProvider.GROUP_TYPE = {
        Applications: "applications",
        FrequentApplications: "frequentApplications",
        FrequentProducts: "frequentProducts",
        RecentSearches: "recentSearches",
        HomePageApplications: "homePageApplications",
        ExternalSearchApplications: "externalSearchApplications"
    };

    SearchProvider.ENTRY_TYPE = {
        App: "app",
        Product: "product",
        ExternalLink: "ex-link",
        SearchText: "text"
    };

    return SearchProvider;
}, false);
