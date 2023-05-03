/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
sap.ui.define(["sap/apf/ui/utils/formatter"],function(t){"use strict";sap.apf.ui.utils.FacetFilterValueFormatter=function(t,e){"use strict";this.getFormattedFFData=function(a,i,n){var u,r;var o=new sap.apf.ui.utils.formatter({getEventCallback:t.getEventCallback.bind(t),getTextNotHtmlEncoded:e.getTextNotHtmlEncoded,getExits:t.getCustomFormatExit()},n,a);var f=n.text;a.forEach(function(t){u=o.getFormattedValue(i,t[i]);r=u;if(f!==undefined&&t[f]!==undefined){r=u+" - "+t[f]}t.formattedValue=r});return a}}});
//# sourceMappingURL=facetFilterValueFormatter.js.map