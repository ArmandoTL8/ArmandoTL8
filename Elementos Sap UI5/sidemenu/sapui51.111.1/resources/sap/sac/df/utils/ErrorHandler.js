/*
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
sap.ui.define("sap/sac/df/utils/ErrorHandler",["sap/base/Log","sap/m/MessageBox"],function(e,n){function r(){var r=this;r.handleWithPopUp=function(r,s){e.error(r);e.error(r.stack);var o,a;function i(e,n){o=e;a=n}n.error(r.message,{details:r.stack,actions:[n.Action.CLOSE],onClose:function(){if(s){a(r)}else{o(null)}}});return new Promise(i)}}return new r});
//# sourceMappingURL=ErrorHandler.js.map