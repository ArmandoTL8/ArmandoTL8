// Copyright (c) 2009-2022 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/base/Object","sap/ui/Device","sap/ushell/Config"],function(e,t,i){"use strict";var n=7;var h=e.extend("sap.ushell.components._HomepageManager.PagingManager",{metadata:{publicMethods:["setElementClass","GetGroupHeight","setContainerSize","getNumberOfAllocatedElements","moveToNextPage","getTileHeight"]},constructor:function(e,t){this.currentPageIndex=0;this.containerHeight=t.containerHeight||0;this.containerWidth=t.containerWidth||0;this.supportedElements=t.supportedElements||"";this.tileHeight=0;this.tileSize={sapUshellTile:{width:100,height:100},sapUshellLinkTile:{width:40,height:20},default:{width:40,height:20}}},getTileHeight:function(){return this.tileHeight},setElementClass:function(e){this.supportedElements=e},_getTileHeight:function(e){return e?148:176},_getTileWidth:function(e,t){if(e){return t?304:360}return t?148:176},getGroupHeight:function(e,h,s){if(!e||e.isGroupVisible===false){return 0}var r=e.tiles,a=e.links,l=t.system.phone||i.last("/core/home/sizeBehavior")==="Small",o=this._getTileWidth(false,l),u=this._getTileWidth(true,l),g=48,c=8,d=this.containerWidth-c;var f=0,p=1,m,E,v;var H=r.some(function(e){return!!e&&e.isTileIntentSupported!==false});if(!H){if(e.isGroupLocked||e.isDefaultGroup||!s||t.system.phone){return 0}return(g+c)/this.containerHeight}var P=c;if(!h){P+=g}if(a&&a.length){P+=44}for(v=0;v<r.length;v++){if(P>this.containerHeight){break}m=r[v];if(!m||m.isTileIntentSupported===false){continue}E=m.long?u:o;if(f>0){f+=n}f+=E;if(f>d){p+=1;f=E}}P+=(this._getTileHeight(l)+n)*p;return P/this.containerHeight},setContainerSize:function(e,t){var i=this.getNumberOfAllocatedElements();this.containerHeight=e;this.containerWidth=t;this._changePageSize(i)},getNumberOfAllocatedElements:function(){return this._calcElementsPerPage()*this.currentPageIndex},_changePageSize:function(e){this.currentPageIndex=Math.ceil(e/this._calcElementsPerPage())},moveToNextPage:function(){this.currentPageIndex++},resetCurrentPageIndex:function(){this.currentPageIndex=0},getSizeofSupportedElementInUnits:function(e){return this.supportedElements[e].sizeInBaseUnits},_calcElementMatrix:function(e){var t=document.createElement("div");t.classList.add(e);document.body.appendChild(t);var i=t.clientHeight;var n=t.clientWidth;var h;if(i<20||n<40){h=this.tileSize[e]||this.tileSize.default}else{h={width:n,height:i}}this.tileHeight=i;t.remove();return h},_calcElementsPerPage:function(){var e,t,i,n,h,s,r;for(e in this.supportedElements){i=this.supportedElements[e];n=this._calcElementMatrix(i.className);i.matrix=n;if(t){t.width=t.width>n.width?n.width:t.width;t.height=t.height>n.height?n.height:t.height}else{t={width:n.width,height:n.height}}}for(e in this.supportedElements){i=this.supportedElements[e];h=i.matrix;i.sizeInBaseUnits=Math.round(h.width/t.width*h.height/t.height)}s=Math.round(this.containerWidth/t.width);r=Math.round(this.containerHeight/t.height);if(!r||!s||s===Infinity||r===Infinity||s===0||r===0){return 10}return r*s}});return h});
//# sourceMappingURL=PagingManager.js.map