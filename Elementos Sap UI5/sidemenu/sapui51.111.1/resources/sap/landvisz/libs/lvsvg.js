/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2013 SAP AG. All rights reserved
 */
sap.ui.define(["sap/ui/thirdparty/d3"],function(t){"use strict";var n=function(){};n.getSVG=function(n,e,a){var r=t.select("#"+a).append("svg").attr("width",n).attr("height",e);return r};n.convertHtmltoCanvas=function(t,n){html2canvas(t,{allowTaint:true,useCORS:true,onrendered:function(t){n.show(1e3);n.css({"background-image":"url("+t.toDataURL("image/png")+")","background-size":"100% 100%"})}})};return n},true);
//# sourceMappingURL=lvsvg.js.map