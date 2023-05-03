/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
sap.ui.define(["sap/apf/core/request"],function(e){"use strict";var t=function(e,t,r,a){var i=e.instances.coreApi;var n=e.instances.messageHandler;this.type="readRequestByRequiredFilter";this.send=function(e,s,u){var d;var o;var c=function(e,t){var r;var a;var i=[];if(e&&e.type&&e.type==="messageObject"){n.putMessage(e);r=e}else{i=e.data;a=e.metadata}s(i,a,r)};i.getMetadata(r).done(function(r){var n=r.getParameterEntitySetKeyProperties(a);var s="";var f=r.getEntityTypeAnnotations(a);if(f.requiresFilter!==undefined&&f.requiresFilter==="true"){if(f.requiredProperties!==undefined){s=f.requiredProperties}}var p=s.split(",");n.forEach(function(e){p.push(e.name)});i.getCumulativeFilter().done(function(r){o=r.restrictToProperties(p);if(e){d=e.getInternalFilter();d.addAnd(o)}else{d=o}t.sendGetInBatch(d,c,u)})})};this.getMetadataFacade=function(){return i.getMetadataFacade(r)}};sap.apf.core.readRequestByRequiredFilter=t;return t},true);
//# sourceMappingURL=readRequestByRequiredFilter.js.map