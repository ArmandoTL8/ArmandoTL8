// Copyright (c) 2009-2022 SAP SE, All Rights Reserved
sap.ui.define(["sap/ushell_abap/pbServices/ui2/Chip","sap/ushell_abap/pbServices/ui2/Error","sap/ushell_abap/pbServices/ui2/Catalog","sap/ushell_abap/pbServices/ui2/ChipDefinition","sap/ushell_abap/pbServices/ui2/PageBuildingService","sap/ushell_abap/pbServices/ui2/ChipInstance","sap/ushell_abap/pbServices/ui2/Page","sap/ushell_abap/pbServices/ui2/PageSet","sap/ushell_abap/pbServices/ui2/Utils","sap/base/Log","sap/base/util/LoaderExtensions"],function(e,a,t,i,n,r,l,s,o,c,u){"use strict";var p=function(n){var p={},h={},g={},d,f=this;this.addRemoteCatalogService=function(e,t){if(!e){throw new a("Invalid base URL","sap.ushell_abap.pbServices.ui2.Factory")}if(typeof t.readChips!=="function"){throw new a("Invalid remote catalog service","sap.ushell_abap.pbServices.ui2.Factory")}e=e.replace(/\/$/,"");if(d.containsKey(e)){throw new a("Base URL '"+e+"' already registered","sap.ushell_abap.pbServices.ui2.Factory")}d.put(e,t)};this.createCatalog=function(e,a,i){var n=this,r,l=typeof e==="object"?e.id:e;function s(){var e;i=i||n.getPageBuildingService().getDefaultErrorHandler();if(i){e=Array.prototype.slice.call(arguments);e.splice(1,0,r);i.apply(null,e)}}function c(){s.apply(null,r.getCachedRemoteFailureArguments())}if(Object.prototype.hasOwnProperty.call(h,l)){r=h[l].catalog;if(typeof e==="object"&&r.getCatalogData()===undefined){t.call(r,this,e)}}else{r=new t(this,e);h[l]={catalog:r,chips:{}}}if(a){if(r.isStub()){r.load(a.bind(null,r),s)}else if(r.getCachedRemoteFailureArguments()!==undefined){o.callHandler(c,c,true)}else{o.callHandler(a.bind(null,r),s,true)}}return r};this.createChip=function(a,t,i){var n=a.remoteCatalogId,r=a.id,l,s;if(n){this.createCatalog(n);l=h[n].chips}else{l=p}if(Object.prototype.hasOwnProperty.call(l,r)){s=l[r];s.update(a)}else{s=new e(a,this);l[r]=s}if(t){if(s.isStub()){s.load(t.bind(null,s),i)}else{i=i||this.getPageBuildingService().getDefaultErrorHandler();o.callHandler(t.bind(null,s),i,true)}}return s};this.createChipDefinition=function(e,t,n){var r,l;function s(e,a,t,n){o.callHandler(a.bind(null,new i(e)),t,n)}function c(a){var t,n;var r=new i(a);g[e]=r;for(t=0,n=l.length;t<n;t+=2){s(r,l[t],l[t+1],false)}}function p(a){var t,i,n;if(typeof a==="string"){n=a}else{n=a.message}g[e]=n;for(t=0,i=l.length;t<i;t+=2){l[t+1](n)}}if(!e){throw new a("Missing URL","Factory")}if(typeof t!=="function"){throw new a("Missing success handler","Factory")}n=n||this.getPageBuildingService().getDefaultErrorHandler();e=o.addCacheBusterTokenUsingUshellConfig(e);if(Object.prototype.hasOwnProperty.call(g,e)){r=l=g[e];if(o.isArray(l)){l.push(t,n)}else if(r instanceof i){s(r,t,n,true)}else{o.callHandler(n.bind(null,r),null,true)}return}l=[t,n];g[e]=l;u.loadResource({dataType:"xml",url:e,async:true}).then(c).catch(p)};this.createChipInstance=function(e,a,t,i){var n,l;e.Chip=e.Chip||{$proxy:true};e.Chip.id=e.Chip.id||e.chipId;e.Chip.remoteCatalogId=e.Chip.remoteCatalogId||e.remoteCatalogId;if(e.RemoteCatalog&&e.RemoteCatalog.id){this.createCatalog(e.RemoteCatalog)}n=this.createChip(e.Chip);l=new r(this,e,n,i);if(a){l.load(a.bind(null,l),t)}return l};this.createNewCatalog=function(e,a,t){this.getPageBuildingService().createCatalog(e,function(e){var i=f.createCatalog(e);i.load(a.bind(null,i),function(e,a){t(e,i,a)})},function(e,a){t(e,undefined,a)})};this.createNewPageBasedCatalog=function(e,a,t,i){this.getPageBuildingService().createPageBasedCatalog(e,a,function(e){f.createCatalog(e,t,i)},i)};this.createPage=function(e,a,t,i){var n;n=new l(this,e);if(a){n.load(a.bind(null,n),t,i)}return n};this.createPageSet=function(e,a,t){var i;i=new s(this,e);if(a){i.load(a.bind(null,i),t)}return i};this.forgetCatalog=function(e){delete h[e.getId()]};this.getPageBuildingService=function(){return n};this.getRemoteCatalogService=function(e){var a=e.type==="H"?"/sap/hba/apps/kpi/s/odata/hana_chip_catalog.xsodata":e.baseUrl;return a?d.get(a.replace(/\/$/,"")):undefined};this.toString=function(e){var a=["Factory({oPbs:",n.toString(e)];if(e){a.push(",mChips:",JSON.stringify(p))}a.push("})");return a.join("")};d=new o.Map;if(!n){throw new a("Missing page building service","Factory")}c.debug("Created: "+this,null,"Factory")};p.createFactory=function(e,a,t,i){return new p(n.createPageBuildingService(e,a,t,i))};return p});
//# sourceMappingURL=Factory.js.map