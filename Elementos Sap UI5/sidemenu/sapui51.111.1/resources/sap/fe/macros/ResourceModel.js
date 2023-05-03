/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/core/Core","sap/ui/model/resource/ResourceModel"],function(e,t){"use strict";const r=new t({bundleName:"sap.fe.macros.messagebundle",async:true}),s=e.getLibraryResourceBundle("sap.fe.macros");let u;const n={getModel(){return r},getText(e,t,r){let n=e;let o;if(u){if(r){n=`${e}|${r}`}o=u.getText(n,t,true);return o?o:s.getText(e,t)}return s.getText(e,t)},setApplicationI18nBundle(e){u=e}};return n},false);
//# sourceMappingURL=ResourceModel.js.map