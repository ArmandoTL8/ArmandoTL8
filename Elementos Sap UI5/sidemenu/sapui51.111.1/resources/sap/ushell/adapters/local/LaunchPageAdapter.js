// Copyright (c) 2009-2022 SAP SE, All Rights Reserved
sap.ui.define(["sap/base/Log","sap/base/util/deepExtend","sap/base/util/ObjectPath","sap/m/GenericTile","sap/m/ImageContent","sap/m/library","sap/m/NumericContent","sap/m/TileContent","sap/ui/core/ComponentContainer","sap/ui/core/Configuration","sap/ui/core/Core","sap/ui/core/library","sap/ui/core/mvc/View","sap/ui/Device","sap/ui/model/resource/ResourceModel","sap/ui/thirdparty/datajs","sap/ui/thirdparty/hasher","sap/ui/thirdparty/jquery","sap/ushell/Config","sap/ushell/library","sap/ushell/resources","sap/ushell/utils","sap/ushell/utils/WindowUtils"],function(e,t,i,r,n,s,o,a,l,p,u,c,f,d,h,T,g,jQuery,v,m,w,y,b){"use strict";var C=c.mvc.ViewType;var L=s.GenericTileMode;var _=m.AppType;function U(e){var t={};t[e.namespace.replace(/\./g,"/")]=e.path||".";sap.ui.loader.config({paths:t})}var k=function(s,c,m){var R=t([],m.config.groups);var S=0;var D=10;var G=10;var z=10;var I;var P={};for(var F=0;F<R.length;F++){if(R[F].isDefaultGroup===true){I=R[F];break}}if(!I&&R.length>0){I=R[0];I.isDefaultGroup=true}this.translationBundle=w.i18n;this.TileType={Tile:"tile",Link:"link",Card:"card"};var V;var j;if(m.config.pathToLocalizedContentResources){j=new h({bundleUrl:m.config.pathToLocalizedContentResources,bundleLocale:p.getLanguage()});V=j.getResourceBundle()}function M(e){if(V){return V.getText(e)}return e}var N=m.config.catalogs||[];N.forEach(function(e){if(V){e.title=M(e.title)}e.tiles.forEach(function(e){e.getTitle=function(){return e.title};e.getChip=function(){return{getBaseChipId:function(){return e.chipId}}}})});R.forEach(function(e){if(V){e.title=M(e.title)}e.tiles.forEach(function(e){q(e,true)})});function A(){return 100*Math.random()<S}function H(){return 100*Math.random()<D}function B(){return G+z*Math.random()}function E(e,t){var i;for(i=0;i<e.tiles.length;i=i+1){if(t.id===e.tiles[i].id){return i}}return-1}function x(e,t){var i;for(i=0;i<e.length;i=i+1){if(t.id===e[i].id){return i}}return-1}function O(e){var t=new jQuery.Deferred;window.setTimeout(function(){t.resolve(e)},B());return t.promise()}function q(t,i){if(t.tileType!=="sap.ushell.ui.tile.DynamicTile"||!t.properties||!t.properties.serviceUrl){return}if(t.intervalTimer){window.clearInterval(t.intervalTimer);t.intervalTimer=undefined}if(i){var r=t.serviceRefreshInterval;if(r){r=r*1e3}else{r=1e4}t.intervalTimer=window.setInterval(function(){T.read(t.properties.serviceUrl+"?id="+t.id+"&t="+(new Date).getTime(),function(){e.debug("Dynamic tile service call succeed for tile "+t.id)},function(i){e.debug("Dynamic tile service call failed for tile "+t.id+", error message:"+i)})},y.sanitizeTimeoutDelay(r))}}this.getGroups=function(){var e=new jQuery.Deferred;window.setTimeout(function(){e.resolve(R.slice(0))},B());return e.promise()};this.getDefaultGroup=function(){var e=new jQuery.Deferred;e.resolve(I);return e.promise()};this.addGroup=function(e){var t=new jQuery.Deferred;var i=A();window.setTimeout(function(){if(!i){var r={id:"group_"+R.length,title:e,tiles:[]};R.push(r);t.resolve(r)}else{this.getGroups().done(function(e){t.reject(e)}).fail(function(){t.reject()})}}.bind(this),B());return t.promise()};this.getGroupTitle=function(e){return e.title};this.setGroupTitle=function(e,t){var i=new jQuery.Deferred;var r=A();window.setTimeout(function(){if(!r){e.title=t;i.resolve()}else{O(e).done(function(e){i.reject(e.title)}).fail(function(){i.reject()})}},B());return i.promise()};this.getGroupId=function(e){return e.id};this.hideGroups=function(e){if(e&&R){for(var t=0;t<R.length;t++){if(e.indexOf(R[t].id)!==-1){R[t].isVisible=false}else{R[t].isVisible=true}}}return(new jQuery.Deferred).resolve()};this.isGroupVisible=function(e){return e&&(e.isVisible===undefined?true:e.isVisible)};this.moveGroup=function(e,t){var i=new jQuery.Deferred;var r=A();window.setTimeout(function(){if(!r){R.splice(t,0,R.splice(x(R,e),1)[0]);i.resolve()}else{this.getGroups().done(function(e){i.reject(e)}).fail(function(){i.reject()})}}.bind(this),B());return i.promise()};this.removeGroup=function(e){var t=new jQuery.Deferred;var i=A();window.setTimeout(function(){if(!i){R.splice(x(R,e),1);e.tiles.forEach(function(e){q(e,false)});t.resolve()}else{this.getGroups().done(function(e){t.reject(e)}).fail(function(){t.reject()})}}.bind(this),B());return t.promise()};this.resetGroup=function(e){var i=new jQuery.Deferred;var r=A();window.setTimeout(function(){if(!r){e.tiles.forEach(function(e){q(e,false)});e=t({},m.config.groups[x(m.config.groups,e)]);R.splice(x(R,e),1,e);e.tiles.forEach(function(e){q(e,true)});i.resolve(e)}else{this.getGroups().done(function(e){i.reject(e)}).fail(function(){i.reject()})}}.bind(this),B());return i.promise()};this.isGroupRemovable=function(e){return e&&!e.isPreset};this.isGroupLocked=function(e){return e.isGroupLocked};this.isGroupFeatured=function(e){return e.isFeatured};this.getGroupTiles=function(e){return e.tiles};this.getLinkTiles=function(e){return e.links};this.getTileTitle=function(e){return e.title};this.getTileType=function(e){if(e.isLink){return this.TileType.Link}if(e.isCard){return this.TileType.Card}return this.TileType.Tile};this.getTileId=function(e){return e.id};this.getTileSize=function(e){return e.size};this.getTileTarget=function(e){var t;if(e.properties){t=e.properties.href||e.properties.targetURL}return e.target_url||t||""};this.isTileIntentSupported=function(e){if(e&&e.formFactor){var t=e.formFactor;var i=d.system;var r;if(i.desktop){r="Desktop"}else if(i.tablet){r="Tablet"}else if(i.phone){r="Phone"}if(t.indexOf(r)===-1){return false}}return true};this.isLinkPersonalizationSupported=function(e){if(e){return e.isLinkPersonalizationSupported}return true};this.getTileView=function(e){var t=new jQuery.Deferred;var i=A();if(H()){window.setTimeout(function(){if(!i){this._getTileView(e).done(function(e){t.resolve(e)})}else{t.reject()}}.bind(this),B())}else if(!i){this._getTileView(e).done(function(e){t.resolve(e)})}else{t.reject()}return t.promise()};this._getTileView=function(e){var t;var i;var n="unknown error";var s=this.getTileType(e)==="link";var o=new jQuery.Deferred;this._translateTileProperties(e);if(e.namespace&&e.path&&e.moduleType){U(e);if(e.moduleType==="UIComponent"){t=new l({component:u.createComponent({componentData:{properties:e.properties},name:e.moduleName}),height:"100%",width:"100%"});o.resolve(t)}else{f.create({viewName:e.moduleName,type:C[e.moduleType],viewData:{properties:e.properties},height:"100%"}).then(function(e){o.resolve(e)})}return o.promise()}else if(e.tileType){i=s?"Link":e.tileType;if(i){try{this._createTileInstance(e,i).done(function(e){t=e;this._handleTilePress(t);this._applyDynamicTileIfoState(t);o.resolve(t)}.bind(this));return o.promise()}catch(t){o.resolve(new r({header:t&&t.name+": "+t.message||this.translationBundle.getText("failedTileCreationMsg"),frameType:this._parseTileSizeToGenericTileFormat(e.size)}));return o.promise()}}else{n="TileType: "+e.tileType+" not found!"}}else{n="No TileType defined!"}o.resolve(new r({header:n,frameType:this._parseTileSizeToGenericTileFormat(e.size)}));return o.promise()};this._getCatalogTileViewAsync=function(e){var t=new jQuery.Deferred;var i;var n="unknown error";var s;var o;var a=this.getTileType(e)==="link";this._translateTileProperties(e);if(e.namespace&&e.path&&e.moduleType){U(e);if(e.moduleType==="UIComponent"){s=new l({component:u.createComponent({componentData:{properties:e.properties},name:e.moduleName}),height:"100%",width:"100%"});t.resolve(s)}else{f.create({viewName:e.moduleName,type:C[e.moduleType],viewData:{properties:e.properties},height:"100%"}).then(function(e){t.resolve(e)})}return t.promise()}else if(e.tileType){o=a?"Link":e.tileType;if(o){try{i=this._createCatalogTileInstanceAsync(e,o);i.done(function(e){this._handleTilePress(e);this._applyDynamicTileIfoState(e);t.resolve(e)}.bind(this))}catch(i){t.resolve(new r({header:i&&i.name+": "+i.message||this.translationBundle.getText("failedTileCreationMsg"),frameType:this._parseTileSizeToGenericTileFormat(e.size)}))}}else{n="TileType: "+e.tileType+" not found!"}return t.promise()}n="No TileType defined!";t.resolve(new r({header:n,frameType:this._parseTileSizeToGenericTileFormat(e.size)}));return t.promise()};this._createTileInstance=function(e,t){var n;var s=new jQuery.Deferred;var l=this._getImageContent({src:e.properties.icon});l.addStyleClass("sapUshellFullWidth");switch(t){case"sap.ushell.ui.tile.DynamicTile":n=new r({header:e.properties.title,subheader:e.properties.subtitle,frameType:this._parseTileSizeToGenericTileFormat(e.size),url:b.getLeanURL(e.properties.targetURL),tileContent:new a({frameType:this._parseTileSizeToGenericTileFormat(e.size),footer:e.properties.info,unit:e.properties.numberUnit,content:new o({scale:e.properties.numberFactor,value:e.properties.numberValue,truncateValueTo:5,indicator:e.properties.stateArrow,valueColor:this._parseTileValueColor(e.properties.numberState),icon:e.properties.icon,width:"100%"})}),press:this._genericTilePressHandler.bind(this,e)});P[e.id]=n;s.resolve(n);break;case"sap.ushell.ui.tile.StaticTile":n=new r({mode:e.mode||(e.properties.icon?L.ContentMode:L.HeaderMode),header:e.properties.title,subheader:e.properties.subtitle,frameType:this._parseTileSizeToGenericTileFormat(e.size),url:b.getLeanURL(e.properties.targetURL),tileContent:new a({frameType:this._parseTileSizeToGenericTileFormat(e.size),footer:e.properties.info,content:l}),press:this._genericTilePressHandler.bind(this,e)});P[e.id]=n;s.resolve(n);break;case"Link":n=new r({mode:L.LineMode,subheader:e.properties.subtitle,header:e.properties.title,url:b.getLeanURL(e.properties.targetURL,e.properties.href),press:function(t){this._genericTilePressHandler(e,t)}.bind(this)});P[e.id]=n;s.resolve(n);break;default:var p=e.tileType.replace(/\./g,"/");sap.ui.require([p],function(){var t=i.get(e.tileType);n=new t(e.properties||{});P[e.id]=n;s.resolve(n)})}return s.promise()};this.getCardManifest=function(e){var t=JSON.parse(JSON.stringify(e.manifest));return t};this._createCatalogTileInstanceAsync=function(e,t){var i=new jQuery.Deferred;var n;var s=this._getImageContent({src:e.properties.icon});s.addStyleClass("sapUshellFullWidth");switch(t){case"sap.ushell.ui.tile.DynamicTile":n=new r({header:e.properties.title,subheader:e.properties.subtitle,frameType:this._parseTileSizeToGenericTileFormat(e.size),url:b.getLeanURL(e.properties.targetURL),tileContent:new a({frameType:this._parseTileSizeToGenericTileFormat(e.size),footer:e.properties.info,unit:e.properties.numberUnit,content:new o({scale:e.properties.numberFactor,value:e.properties.numberValue,truncateValueTo:5,indicator:e.properties.stateArrow,valueColor:this._parseTileValueColor(e.properties.numberState),icon:e.properties.icon,width:"100%"})}),press:function(t){this._genericTilePressHandler(e,t)}.bind(this)});break;case"sap.ushell.ui.tile.StaticTile":n=new r({mode:e.mode||(e.properties.icon?L.ContentMode:L.HeaderMode),header:e.properties.title,subheader:e.properties.subtitle,frameType:this._parseTileSizeToGenericTileFormat(e.size),url:b.getLeanURL(e.properties.targetURL),tileContent:new a({frameType:this._parseTileSizeToGenericTileFormat(e.size),footer:e.properties.info,content:s}),press:function(t){this._genericTilePressHandler(e,t)}.bind(this)});break;case"Link":n=new r({mode:L.LineMode,subheader:e.properties.subtitle,header:e.properties.title,url:b.getLeanURL(e.properties.targetURL,e.properties.href),press:function(t){this._genericTilePressHandler(e,t)}.bind(this)});break;default:t=e.tileType&&e.tileType.replace(/\./g,"/");sap.ui.require([t],function(t){n=new t(e.properties||{});i.resolve(n)})}i.resolve(n);return i.promise()};this._createCatalogTileInstance=function(t,n){var s;var l;var p;var u=this._getImageContent({src:t.properties.icon});u.addStyleClass("sapUshellFullWidth");switch(n){case"sap.ushell.ui.tile.DynamicTile":s=new r({header:t.properties.title,subheader:t.properties.subtitle,frameType:this._parseTileSizeToGenericTileFormat(t.size),url:b.getLeanURL(t.properties.targetURL),tileContent:new a({frameType:this._parseTileSizeToGenericTileFormat(t.size),footer:t.properties.info,unit:t.properties.numberUnit,content:new o({scale:t.properties.numberFactor,value:t.properties.numberValue,truncateValueTo:5,indicator:t.properties.stateArrow,valueColor:this._parseTileValueColor(t.properties.numberState),icon:t.properties.icon,width:"100%"})}),press:function(e){this._genericTilePressHandler(t,e)}.bind(this)});break;case"sap.ushell.ui.tile.StaticTile":s=new r({mode:t.mode||(t.properties.icon?L.ContentMode:L.HeaderMode),header:t.properties.title,subheader:t.properties.subtitle,frameType:this._parseTileSizeToGenericTileFormat(t.size),url:b.getLeanURL(t.properties.targetURL),tileContent:new a({frameType:this._parseTileSizeToGenericTileFormat(t.size),footer:t.properties.info,content:u}),press:function(e){this._genericTilePressHandler(t,e)}.bind(this)});break;case"Link":s=new r({mode:L.LineMode,subheader:t.properties.subtitle,header:t.properties.title,url:b.getLeanURL(t.properties.targetURL,t.properties.href),press:function(e){this._genericTilePressHandler(t,e)}.bind(this)});break;default:l=t.tileType.replace(/\./g,"/");p=sap.ui.require(l);if(!p){if(!i.get(t.tileType)){e.error("FLP: local LaunchPageAdapter. The resource is used before being loaded: "+l);sap.ui.requireSync(l)}p=i.get(t.tileType)}s=new p(t.properties||{})}return s};this._genericTilePressHandler=function(e,t){if(t.getSource().getScope&&t.getSource().getScope()==="Display"){if(e.properties.targetURL){if(e.properties.targetURL[0]==="#"){g.setHash(e.properties.targetURL)}else{var i=v.last("/core/shell/enableRecentActivity")&&v.last("/core/shell/enableRecentActivityLogging");if(i){var r={title:e.properties.title,appType:_.URL,url:e.properties.targetURL,appId:e.properties.targetURL};sap.ushell.Container.getRenderer("fiori2").logRecentActivity(r)}b.openURL(e.properties.targetURL,"_blank")}}}};this._parseTileSizeToGenericTileFormat=function(e){return e==="1x2"?"TwoByOne":"OneByOne"};this._parseTileValueColor=function(e){var t=e;switch(e){case"Positive":t="Good";break;case"Negative":t="Critical";break}return t};this._applyDynamicTileIfoState=function(e){var t=e.onAfterRendering;e.onAfterRendering=function(){if(t){t.apply(this,arguments)}var e=this.getModel();var i;var r;var n;if(!e){return}i=e.getProperty("/data/display_info_state");r=this.getDomRef();n=r.getElementsByClassName("sapMTileCntFtrTxt")[0];switch(i){case"Negative":n.classList.add("sapUshellTileFooterInfoNegative");break;case"Neutral":n.classList.add("sapUshellTileFooterInfoNeutral");break;case"Positive":n.classList.add("sapUshellTileFooterInfoPositive");break;case"Critical":n.classList.add("sapUshellTileFooterInfoCritical");break;default:return}}};this._handleTilePress=function(e){if(typeof e.attachPress==="function"){e.attachPress(function(){if(typeof e.getTargetURL==="function"){var t=e.getTargetURL();if(t){if(t[0]==="#"){g.setHash(t)}else{b.openURL(t,"_blank")}}}})}};this._translateTileProperties=function(e){if(this.translationBundle&&V&&!e._isTranslated){var t=e.properties;var i=e.keywords;t.title=M(t.title);t.subtitle=M(t.subtitle);t.info=M(t.info);if(i){for(var r=0;r<i.length;r++){i[r]=M(i[r])}}e._isTranslated=true}};this.refreshTile=function(){};this.setTileVisible=function(e,t){q(e,t)};this.addTile=function(e,i){if(!i){i=I}var r=new jQuery.Deferred;var n=A();window.setTimeout(function(){if(!n){var s=t({title:"A new tile was added",size:"1x1"},e,{id:"tile_0"+e.chipId});i.tiles.push(s);q(s,true);r.resolve(s)}else{this.getGroups().done(function(e){r.reject(e)}).fail(function(){r.reject()})}}.bind(this),B());return r.promise()};this.removeTile=function(e,t){var i=new jQuery.Deferred;var r=A();window.setTimeout(function(){if(!r){e.tiles.splice(E(e,t),1);q(t,false);i.resolve()}else{this.getGroups().done(function(e){i.reject(e)}).fail(function(){i.reject()})}}.bind(this),B());return i.promise()};this.moveTile=function(e,t,i,r,n,s){var o=new jQuery.Deferred;var a=A();window.setTimeout(function(){if(!a){if(n===undefined){n=r}e.isLink=s?s===this.TileType.Link:e.isLink;r.tiles.splice(t,1);n.tiles.splice(i,0,e);o.resolve(e)}else{this.getGroups().done(function(e){o.reject(e)}).fail(function(){o.reject()})}}.bind(this),B());return o.promise()};this.getTile=function(){var e=new jQuery.Deferred;return e.promise()};this.getCatalogs=function(){var e=new jQuery.Deferred;N.forEach(function(t){window.setTimeout(function(){e.notify(t)},300)});window.setTimeout(function(){e.resolve(N)},1500);return e.promise()};this.isCatalogsValid=function(){return true};this.getCatalogError=function(){return};this.getCatalogId=function(e){return e.id};this.getCatalogTitle=function(e){return e.title};this.getCatalogTiles=function(e){var t=new jQuery.Deferred;window.setTimeout(function(){t.resolve(e.tiles)},B());return t.promise()};this.getCatalogTileId=function(e){if(e.chipId){return e.chipId}return"UnknownCatalogTileId"};this.getStableCatalogTileId=function(e){if(e.referenceChipId){return e.referenceChipId}if(e.chipId){return e.chipId}return"UnknownCatalogTileId"};this.getCatalogTileTitle=function(e){return e.title};this.getCatalogTileSize=function(e){return e.size};this.getCatalogTileViewControl=function(e){return this._getCatalogTileViewAsync(e)};this.getCatalogTileTargetURL=function(e){return e.properties&&e.properties.targetURL||null};this.getCatalogTilePreviewTitle=function(e){return e.properties&&e.properties.title||null};this.getCatalogTilePreviewInfo=function(e){return e.properties&&e.properties.info||null};this.getCatalogTilePreviewIndicatorDataSource=function(e){var t;if(e.properties&&e.properties.serviceUrl){t={path:e.properties.serviceUrl,refresh:e.properties.serviceRefreshInterval}}return t};this.getCatalogTilePreviewSubtitle=function(e){return e.properties&&e.properties.subtitle||null};this.getCatalogTilePreviewIcon=function(e){return e.properties&&e.properties.icon||null};this.getCatalogTileKeywords=function(e){return[e.title,e.properties&&e.properties.subtitle,e.properties&&e.properties.info,e.keywords].flat().filter(function(e){return e})};this.getCatalogTileTags=function(e){return e&&e.tags||[]};this.addBookmark=function(e,t){var i=t||I;var r=new jQuery.Deferred;var n=A();var s=e.title;var o=e.subtitle;var a=e.info;var l=e.url;var p=this.isLinkPersonalizationSupported();window.setTimeout(function(){if(!n){var e={title:s,size:"1x1",chipId:"tile_0"+i.tiles.length,tileType:"sap.ushell.ui.tile.StaticTile",id:"tile_0"+i.tiles.length,isLinkPersonalizationSupported:p,keywords:[],properties:{icon:"sap-icon://time-entry-request",info:a,subtitle:o,title:s,targetURL:l}};i.tiles.push(e);q(e,true);r.resolve(e)}else{this.getGroups().done(function(e){r.reject(e)}).fail(function(){r.reject()})}}.bind(this),B());return r.promise()};this.updateBookmarks=function(e,t){var i=new jQuery.Deferred;var r=0;var n=this.getGroups();n.done(function(n){n.forEach(function(i){i.tiles.forEach(function(i){if(i.properties&&i.properties.targetURL===e){for(var n in t){if(t.hasOwnProperty(n)){i.properties[n]=t[n]}}var s=P[i.id];if(s!==undefined){s.setHeader(i.properties.title);s.setSubheader(i.properties.subtitle)}r++}})});i.resolve(r)});n.fail(function(){i.reject()});return i.promise()};this.deleteBookmarks=function(e){var t=new jQuery.Deferred;var i=0;var r;var n;for(var s=0;s<R.length;s++){r=R[s];for(var o=r.tiles.length-1;o>=0;o--){n=r.tiles[o];if(n.properties.targetURL===e){r.tiles.splice(o,1);i++}}}t.resolve(i);return t.promise()};this.countBookmarks=function(e){var t=new jQuery.Deferred;var i=0;var r;var n;for(var s=0;s<R.length;s++){r=R[s];for(var o=0;o<r.tiles.length;o++){n=r.tiles[o];if(n.properties.targetURL===e){i++}}}t.resolve(i);return t.promise()};this._getImageContent=function(e){return new n(e)};this.onCatalogTileAdded=function(){};this.getTileActions=function(e){return e&&e.actions||null};k.prototype._getCatalogTileIndex=function(){var e={};return Promise.resolve(e)};this.getCatalogTileNumberUnit=function(e){return e.properties?e.properties.numberUnit:undefined}};return k},false);
//# sourceMappingURL=LaunchPageAdapter.js.map