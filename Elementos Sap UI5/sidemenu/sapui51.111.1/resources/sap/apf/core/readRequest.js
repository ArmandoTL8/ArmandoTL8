/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
sap.ui.define(["sap/apf/core/request"],function(e){"use strict";sap.apf.core.ReadRequest=function(e,t,a,s){var n=e.instances.coreApi;var i=e.instances.messageHandler;this.type="readRequest";this.send=function(e,a,s){var n;var r=function(e,t){var s;var n;var r=[];if(e&&e.type&&e.type==="messageObject"){i.putMessage(e);s=e}else{r=e.data;n=e.metadata}a(r,n,s)};if(e){n=e.getInternalFilter()}else{n=new sap.apf.core.utils.Filter(i)}t.sendGetInBatch(n,r,s)};this.getMetadata=function(){return n.getEntityTypeMetadata(a,s)};this.getMetadataFacade=function(){return n.getMetadataFacade(a)}}});
//# sourceMappingURL=readRequest.js.map