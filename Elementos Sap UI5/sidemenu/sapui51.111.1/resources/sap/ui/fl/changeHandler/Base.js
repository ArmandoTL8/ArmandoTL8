/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/base/util/LoaderExtensions"],function(e){"use strict";var t={setTextInChange:function(e,t,n,r){if(!e.texts){e.texts={}}if(!e.texts[t]){e.texts[t]={}}e.texts[t].value=n;e.texts[t].type=r},instantiateFragment:function(t,n){var r=t.getFlexObjectMetadata();var a=r.moduleName;if(!a){return Promise.reject(new Error("The module name of the fragment is not set. This should happen in the backend"))}var i=n.viewId?n.viewId+"--":"";var o=r.projectId||"";var s=t.getExtensionPointInfo&&t.getExtensionPointInfo()&&t.getExtensionPointInfo().fragmentId||"";var u=o&&s?".":"";var f=i+o+u+s;var c=n.modifier;var v=n.view;return Promise.resolve().then(function(){var t=e.loadResource(a,{dataType:"text"});return c.instantiateFragment(t,f,v).catch(function(e){throw new Error("The following XML Fragment could not be instantiated: "+t+" Reason: "+e.message)})})},markAsNotApplicable:function(e,t){var n={message:e};if(!t){throw n}return Promise.reject(n)}};return t},true);
//# sourceMappingURL=Base.js.map