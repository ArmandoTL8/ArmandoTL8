/*
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
sap.ui.define("sap/sac/df/utils/SyncActionHelper",["sap/base/Log","sap/sac/df/utils/ListHelper","sap/sac/df/thirdparty/lodash"],function(e,s,t){e.info("Load SyncAction Helper");function a(){var e=this;function a(e){var a=new Error(e.getSummary());a.getMessages=t.constant(s.arrayFromList(e.getMessages()).map(function(e){var s=e.getSeverity().getName();if(s==="Info"){s="Information"}return{Text:e.getText(),Severity:s,Code:e.getCode(),MessageClass:e.getMessageClass(),LongTextUri:e.getMessageClass()?["/sap/opu/odata/iwbep/message_text;message=LOCAL/T100_longtexts(MSGID='",encodeURIComponent(e.getMessageClass()),"',MSGNO='",encodeURIComponent(e.getCode()),"',MESSAGE_V1='',MESSAGE_V2='',MESSAGE_V3='',MESSAGE_V4='')/$value"].join(""):null}}));return a}e.reject=a;e.syncActionToPromise=function(e,s,n){var o,r;function i(e,s){o=e;r=s}function c(e){if(e.hasErrors()){r(a(e))}else{o(e.getData())}}var g=new Promise(i);e.apply(s,t.concat([sap.firefly.SyncType.NON_BLOCKING,c],n));return g}}return new a});
//# sourceMappingURL=SyncActionHelper.js.map