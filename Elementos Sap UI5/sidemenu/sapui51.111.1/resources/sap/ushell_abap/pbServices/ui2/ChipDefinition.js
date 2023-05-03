// Copyright (c) 2009-2022 SAP SE, All Rights Reserved
sap.ui.define(["sap/ushell_abap/pbServices/ui2/Error"],function(t){"use strict";var e="http://schemas.sap.com/sapui2/services/Chip/1";function i(t){return t.localName||t.baseName}function n(t,e){var n,a,s,r;if(typeof t.getAttributeNS==="function"){return t.getAttributeNS(null,e)}a=t.attributes;for(s=0,r=a.length;s<r;s+=1){n=a[s];if(!n.namespaceURI&&i(n)===e){return n.nodeValue}}return""}function a(t){return t.textContent||t.text||""}function s(t,n,a){var s,r=n.childNodes,c,o,u;for(o=0,u=r.length;o<u;o+=1){s=r[o];if(s.namespaceURI===e){c=a[i(s)];if(c){c.call(t,s)}}}}var r=function(c){var o=this;if(c instanceof r){c=JSON.parse(JSON.stringify(c));["appearance","contracts","id","implementation"].forEach(function(t){if(Object.prototype.hasOwnProperty.call(c,t)){o[t]=c[t]}});return}if(i(c.documentElement)!=="chip"||c.documentElement.namespaceURI!==e){throw new t("Missing root <chip>","ChipDefinition")}s(this,c.documentElement,{appearance:function(t){this.appearance={};s(this.appearance,t,{description:function(t){this.description=a(t)},title:function(t){this.title=a(t)}})},contracts:function(t){this.contracts={};s(this.contracts,t,{consume:function(t){var e=n(t,"id");this[e]={};s(this[e],t,{parameters:function(t){this.parameters={};s(this.parameters,t,{parameter:function(t){var e=n(t,"name");this[e]=a(t)}})}})}})},id:function(t){this.id=a(t)},implementation:function(t){this.implementation={};s(this.implementation,t,{sapui5:function(t){this.sapui5={basePath:"."};var e;s(this.sapui5,t,{basePath:function(t){this.basePath=a(t)},componentName:function(t){this.componentName=a(t);e=n(t,"virtualNamespace")},viewName:function(t){this.viewName=a(t);e=n(t,"virtualNamespace")}});if(e){this.sapui5.virtualNamespace=e==="true"}}})}});c=null};return r});
//# sourceMappingURL=ChipDefinition.js.map