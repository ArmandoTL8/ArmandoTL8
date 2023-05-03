/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
sap.ui.define([],function(){"use strict";sap.apf.ui.utils.FacetFilterListConverter=function(){"use strict";this.getFFListDataFromFilterValues=function(t,e,i){var n=[];t.forEach(function(t){var s={};s.key=t[e];s.text=t.formattedValue;s.selected=false;if(i){i.forEach(function(i){if(i instanceof Date&&t[e]instanceof Date){if(i.toISOString()===t[e].toISOString()){s.selected=true}}else if(i==t[e]){s.selected=true}})}n.push(s)});return n}}});
//# sourceMappingURL=facetFilterListConverter.js.map