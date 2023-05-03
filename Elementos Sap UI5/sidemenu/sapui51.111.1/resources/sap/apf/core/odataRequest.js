/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
sap.ui.define(["sap/apf/core/utils/checkForTimeout","sap/ui/model/odata/ODataUtils"],function(e,t){"use strict";sap.apf.core.odataRequestWrapper=function(e,t,a,r,s){var i=e.instances.datajs;function u(e,t){var s=sap.apf.core.utils.checkForTimeout(t);var i={};if(s){i.messageObject=s;r(i)}else{a(e,t)}}function c(e){var t=sap.apf.core.utils.checkForTimeout(e);if(t){e.messageObject=t}r(e)}var o=t.serviceMetadata;var n=e.functions.getSapSystem();if(n&&!t.isSemanticObjectRequest){var f=/(\/[^\/]+)$/g;if(t.requestUri&&t.requestUri[t.requestUri.length-1]==="/"){t.requestUri=t.requestUri.substring(0,t.requestUri.length-1)}var p=t.requestUri.match(f)[0];var l=t.requestUri.split(p);var q=sap.ui.model.odata.ODataUtils.setOrigin(l[0],{force:true,alias:n});t.requestUri=q+p}i.request(t,u,c,s,undefined,o)}});
//# sourceMappingURL=odataRequest.js.map