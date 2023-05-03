// Copyright (c) 2009-2022 SAP SE, All Rights Reserved
sap.ui.define(["sap/base/util/Version","sap/ui/thirdparty/jquery","sap/base/util/deepExtend","sap/base/Log"],function(e,jQuery,t,r){"use strict";var s=function(s,n,i){this._oAdapterConfig=i&&i.config;var o=sap.ushell.Container,a="";if(o){a=o.getLogonSystem().getProductName()||""}this._oLocalSystemAlias={http:{host:"",port:0,pathPrefix:"/sap/bc/"},https:{host:"",port:0,pathPrefix:"/sap/bc/"},rfc:{systemId:"",host:"",service:0,loginGroup:"",sncNameR3:"",sncQoPR3:""},id:"",label:"local",client:"",language:"",properties:{productName:a}};this.getInbounds=function(){var t=this;if(!this._getInboundsDeferred){this._getInboundsDeferred=new jQuery.Deferred;sap.ushell.Container.getServiceAsync("CommonDataModel").then(function(e){return e.getSiteWithoutPersonalization()}).then(function(r){var s=r._version&&e(r._version).getMajor()===3?"sap/ushell/adapters/cdm/v3/utilsCdm":"sap/ushell/utils/utilsCdm";sap.ui.require([s],function(e){var s=e.formatSite(r)||[];t._getInboundsDeferred.resolve(s)})},function(e){t._getInboundsDeferred.reject(e)})}return this._getInboundsDeferred.promise()};this._createSIDMap=function(e){return Object.keys(e).sort().reduce(function(t,r){var s=e[r];var n="SID("+s.systemId+"."+s.client+")";if(!t.hasOwnProperty(n)&&s.hasOwnProperty("systemId")&&s.hasOwnProperty("client")){t[n]=r}return t},{})};this._getSystemAliases=function(){var e=this;if(!this.oSystemAliasesDeferred){this.oSystemAliasesDeferred=new jQuery.Deferred;sap.ushell.Container.getServiceAsync("CommonDataModel").then(function(e){return e.getSiteWithoutPersonalization()}).then(function(r){var s=t({},r.systemAliases||{});Object.keys(s).forEach(function(e){s[e].id=e});e.oSystemAliasesDeferred.resolve(s)},function(t){e.oSystemAliasesDeferred.reject(t)})}return this.oSystemAliasesDeferred.promise()};this.resolveSystemAlias=function(e){var s=new jQuery.Deferred,n=this;this._getSystemAliases().done(function(i){var o,a;if(i.hasOwnProperty(e)){a=i[e];if(e===""){a.properties=t({},n._oLocalSystemAlias.properties,a.properties||{})}s.resolve(a);return}if(e===""){s.resolve(n._oLocalSystemAlias);return}e=e.toUpperCase(e);if(!n._oSIDMap){n._oSIDMap=n._createSIDMap(i)}if(n._oSIDMap.hasOwnProperty(e)){var u=i[n._oSIDMap[e]];s.resolve(u);return}o="Cannot resolve system alias "+e;r.warning(o,"The system alias cannot be found in the site response","sap.ushell.adapters.cdm.ClientSideTargetResolutionAdapter");s.reject(o)}).fail(function(e){s.reject(e)});return s.promise()};this.getContentProviderDataOriginsLookup=function(){var e=this;if(!this.oContentProviderDataOriginsDeferred){this.oContentProviderDataOriginsDeferred=new jQuery.Deferred;sap.ushell.Container.getServiceAsync("CommonDataModel").then(function(e){return e.getSiteWithoutPersonalization()}).then(function(r){var s=null;if(r.contentProviderDataOrigins){s=t({},r.contentProviderDataOrigins)}e.oContentProviderDataOriginsDeferred.resolve(s)},function(t){e.oContentProviderDataOriginsDeferred.reject(t)})}return this.oContentProviderDataOriginsDeferred.promise()}};return s},false);
//# sourceMappingURL=ClientSideTargetResolutionAdapter.js.map