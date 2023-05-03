/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/thirdparty/jquery","sap/ui/Device","sap/ui/core/Configuration","sap/ui/dom/jquery/zIndex","sap/ui/dom/jquery/scrollLeftRTL"],function(jQuery,e,t){"use strict";var r={};r.getOffset=function(e){var t=e.getBoundingClientRect();var r=document.documentElement;return{top:t.top+window.scrollY-r.clientTop,left:t.left+window.scrollX-r.clientLeft}};r.getParents=function(e,t){var r=[];while((e=e.parentNode)&&e!==document){if(!t||e.matches(t)){r.unshift(e)}}return r};r.getSize=function(e){var t=e.getBoundingClientRect();return{width:t.width,height:t.height}};r.getOffsetFromParent=function(o,n){var l=n?n.scrollTop:null;var i=n?r.getScrollLeft(n):null;var a=n?this.getOffset(n):null;var s={left:o.position.left,top:o.position.top};if(a){s.left-=a.left-(i||0);s.top-=a.top-(l||0)}if(t.getRTL()){var f=n?n.offsetWidth:window.innerWidth;if(e.browser.safari&&!e.browser.mobile&&r.hasVerticalScrollBar(n)){s.left-=r.getScrollbarWidth()}s.left=s.left-(f-o.size.width)}return s};r.getScrollLeft=function(e){if(!t.getRTL()||!r.hasHorizontalScrollBar(e)){return e.scrollLeft}var o=jQuery(e).scrollLeftRTL();var n=e.scrollWidth-e.clientWidth;return o-n};r.getZIndex=function(e){var t;var r=jQuery(e);if(r.length){t=r.zIndex()||r.css("z-index")}return t};r._getElementDimensions=function(e,t,r){var o=e[0]||e;var n=o["offset"+t];var l=0;for(var i=0;i<2;i++){var a=window.getComputedStyle(o,null)["border"+r[i]+t];l-=a?parseInt(a.slice(0,-2)):0}return n+l};r._getElementWidth=function(e){return r._getElementDimensions(e,"Width",["Right","Left"])};r._getElementHeight=function(e){return r._getElementDimensions(e,"Height",["Top","Bottom"])};r.hasVerticalScrollBar=function(e){var t=window.getComputedStyle(e)["overflow-y"]==="auto"||window.getComputedStyle(e)["overflow-y"]==="scroll";return t&&e.scrollHeight>r._getElementHeight(e)};r.hasHorizontalScrollBar=function(e){var t=window.getComputedStyle(e)["overflow-x"]==="auto"||window.getComputedStyle(e)["overflow-x"]==="scroll";return t&&e.scrollWidth>r._getElementWidth(e)};r.hasScrollBar=function(e){return r.hasVerticalScrollBar(e)||r.hasHorizontalScrollBar(e)};r.getScrollbarWidth=function(){if(typeof r.getScrollbarWidth._cache==="undefined"){var e=document.createElement("div");e.style.position="absolute";e.style.top="-9999px";e.style.left="-9999px";e.style.width="100px";document.body.append(e);var t=e.offsetWidth;e.style.overflow="scroll";var o=document.createElement("div");o.style.width="100%";e.append(o);var n=o.offsetWidth;e.remove();r.getScrollbarWidth._cache=t-n}return r.getScrollbarWidth._cache};r.getOverflows=function(e){return{overflowX:window.getComputedStyle(e)["overflow-x"],overflowY:window.getComputedStyle(e)["overflow-y"]}};r.getGeometry=function(e,t){if(e){var r=this.getOffset(e);if(t){r.left=r.left-window.scrollX;r.top=r.top-window.scrollY}return{domRef:e,size:this.getSize(e),position:r,visible:this.isVisible(e)}}};r.syncScroll=function(e,t){var r=t.scrollTop;var o=t.scrollLeft;var n=e.scrollTop;var l=e.scrollLeft;if(n!==r){t.scrollTop=n}if(l!==o){t.scrollLeft=l}};r.getDomRefForCSSSelector=function(e,t){if(t&&e){var r=jQuery(e);if(t===":sap-domref"){return r}if(t.indexOf(":sap-domref")>-1){return r.find(t.replace(/:sap-domref/g,""))}return r.find(t)}return jQuery()};r.isVisible=function(e){if(e){var t=e.getBBox&&e.getBBox();var r=t?t.width:e.offsetWidth;var o=t?t.height:e.offsetHeight;return r>0&&o>0}return false};r.setDraggable=function(e,t){e.setAttribute("draggable",t)};r.getDraggable=function(e){switch(e.getAttribute("draggable")){case"true":return true;case"false":return false;default:return}};r._copyStylesTo=function(e,t){var r="";var o="";var n=e.length;for(var l=0;l<n;l++){o=e[l];r=r+o+":"+e.getPropertyValue(o)+";"}t.style.cssText=r};r._copyPseudoElement=function(e,t,o){var n=window.getComputedStyle(t,e);var l=n.getPropertyValue("content");if(l&&l!=="none"){l=String(l).trim();if(l.indexOf("attr(")===0){l=l.replace("attr(","");if(l.length){l=l.substring(0,l.length-1)}l=t.getAttribute(l)||""}var i=jQuery("<span></span>");if(e===":after"){i.appendTo(o)}else{i.prependTo(o)}i.text(l.replace(/(^['"])|(['"]$)/g,""));r._copyStylesTo(n,i.get(0));i.css("display","inline")}};r.copyComputedStyle=function(e,t){var o=window.getComputedStyle(e);if(o.getPropertyValue("display")==="none"){t.style.display="none";return}r._copyStylesTo(o,t);this._copyPseudoElement(":after",e,t);this._copyPseudoElement(":before",e,t)};r.copyComputedStyles=function(e,t){for(var r=0;r<e.children.length;r++){this.copyComputedStyles(e.children[r],t.children[r])}t.removeAttribute("class");t.setAttribute("id","");t.setAttribute("role","");t.setAttribute("data-sap-ui","");t.setAttribute("for","");t.setAttribute("tabindex",-1);this.copyComputedStyle(e,t)};r.cloneDOMAndStyles=function(e,t){var r=e.cloneNode(true);this.copyComputedStyles(e,r);t.append(r)};r.contains=function(e,t){var r=document.getElementById(e);return!!r&&r.contains(t)};r.appendChild=function(e,t){var r=t.scrollTop;var o=t.scrollLeft;e.appendChild(t);t.scrollTop=r;t.scrollLeft=o};return r},true);
//# sourceMappingURL=DOMUtil.js.map