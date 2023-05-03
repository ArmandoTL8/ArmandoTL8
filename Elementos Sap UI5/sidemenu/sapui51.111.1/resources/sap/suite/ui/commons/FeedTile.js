/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/thirdparty/jquery","./library","sap/ui/core/Control","sap/suite/ui/commons/util/FeedItemUtils","sap/base/Log","sap/base/security/encodeCSS","sap/base/security/encodeXML","sap/base/security/URLListValidator","./FeedTileRenderer"],function(jQuery,e,t,i,s,a,n,r,d){"use strict";var l=t.extend("sap.suite.ui.commons.FeedTile",{metadata:{deprecated:true,library:"sap.suite.ui.commons",properties:{displayDuration:{type:"int",group:"Misc",defaultValue:5},displayArticleImage:{type:"boolean",group:"Behavior",defaultValue:true},source:{type:"string",group:"Misc",defaultValue:null},defaultImages:{type:"sap.ui.core.URI[]",group:"Misc",defaultValue:null}},aggregations:{items:{type:"sap.suite.ui.commons.FeedItem",multiple:true,singularName:"item"}},events:{press:{}}}});l.prototype.init=function(){this._currentItemIndex=0;this._stagedModel=null;this._defaultImageIndex=-1};l.prototype.cycle=function(){if(this._stagedModel){s.debug("FeedTile: Updating news tile with new model");this.setModel(this._stagedModel);this._stagedModel=null;var e=this.getItems().length;if(this._currentItemIndex>=e){this._currentItemIndex=0}return}var t=this.getItems();this._currentItemIndex=(this._currentItemIndex+1)%t.length;var i=jQuery("#"+this.getId()+"-next-feedTileImage");var a=jQuery("#"+this.getId()+"-feedTileImage");if(jQuery.support.cssTransitions){i.addClass("sapSuiteFTItemRight").removeClass("sapSuiteFTItemHidden");a.addClass("sapSuiteFTItemCenter");setTimeout(function(){var e=false;var t=null;t=function(){jQuery(this).off("webkitTransitionEnd transitionend");if(!e){e=true}else{i.removeClass("sapSuiteFTItemSliding");a.removeClass("sapSuiteFTItemSliding").addClass("sapSuiteFTItemHidden").removeClass("sapSuiteFTItemLeft").addClass("sapSuiteFTItemRight");a.detach();i.after(a);this.flipIds(i,a);setTimeout(function(){this.setNextItemValues(this)}.bind(this),100);this._timeoutId=setTimeout(function(){this.cycle()}.bind(this),this.getDisplayDuration()*1e3)}};a.on("webkitTransitionEnd transitionend",t.bind(this));i.on("webkitTransitionEnd transitionend",t.bind(this));a.addClass("sapSuiteFTItemSliding").removeClass("sapSuiteFTItemCenter").addClass("sapSuiteFTItemLeft");i.addClass("sapSuiteFTItemSliding").removeClass("sapSuiteFTItemRight").addClass("sapSuiteFTItemCenter")}.bind(this),60)}else{i.css("left","100%");i.removeClass("sapSuiteFTItemHidden");i.animate({left:"0%"},400);a.animate({left:"-100%"},400,function(){a.addClass("sapSuiteFTItemHidden");a.css("left","0");this.flipIds(i,a);setTimeout(function(){this.setNextItemValues(this)}.bind(this),100);this._timeoutId=setTimeout(function(){this.cycle()}.bind(this),this.getDisplayDuration()*1e3)}.bind(this))}};l.prototype.onAfterRendering=function(){var e=this.getDisplayDuration()*1e3;if(this.getItems().length>1){if(typeof this._timeoutId==="number"){clearTimeout(this._timeoutId);delete this._timeoutId}this._timeoutId=setTimeout(function(){this.cycle()}.bind(this),e)}};l.prototype.onclick=function(e){var t=this.getCurrentItem();var i="";if(t&&t.getId()){i=t.getId()}this.firePress({itemId:i})};l.prototype.getCurrentItem=function(){var e=this.getItems();if(e.length){return e[this._currentItemIndex]}};l.prototype.getNextItem=function(){var e=this.getItems();if(e.length&&e.length>1){return e[(this._currentItemIndex+1)%e.length]}};l.prototype.setNextItemValues=function(){var e=this.getNextItem();var t=this.getId();var s=e.getImage();if(!s||!this.getDisplayArticleImage()){s=this.getDefaultImage()}jQuery("#"+t+"-next-feedTileImage").css("background-image","url("+a(s)+")");jQuery("#"+t+"-next-feedTileTitle").html(n(e.getTitle()));jQuery("#"+t+"-next-feedTileSource").html(n(e.getSource()));jQuery("#"+t+"-next-feedTileAge").html(n(i.calculateFeedItemAge(e.getPublicationDate())));return this};l.prototype.flipIds=function(e,t){var i=this.getId();t.attr("id",i+"-next-feedTileImage");t.find("#"+i+"-feedTileText").attr("id",i+"-next-feedTileText");t.find("#"+i+"-feedTileTitle").attr("id",i+"-next-feedTileTitle");t.find("#"+i+"-feedTileSource").attr("id",i+"-next-feedTileSource");t.find("#"+i+"-feedTileAge").attr("id",i+"-next-feedTileAge");e.attr("id",i+"-feedTileImage");e.find("#"+i+"-next-feedTileText").attr("id",i+"-feedTileText");e.find("#"+i+"-next-feedTileTitle").attr("id",i+"-feedTileTitle");e.find("#"+i+"-next-feedTileSource").attr("id",i+"-feedTileSource");e.find("#"+i+"-next-feedTileAge").attr("id",i+"-feedTileAge")};l.prototype.setDisplayDuration=function(e){if(e<3){e=3;s.error("FeedTile: displayDuration should be equal or more than 3 seconds.")}this.setProperty("displayDuration",e);return this};l.prototype.stageModel=function(e){this._stagedModel=e};l.prototype.getDefaultImage=function(){var e="";var t=this.getDefaultImages();if(t&&t.length>0){var i=t.length;if(this._defaultImageIndex===-1){var s=Math.floor(Math.random()*i);this._defaultImageIndex=s;e=t[s]}else{var a=this._defaultImageIndex+1>=i?0:this._defaultImageIndex+1;this._defaultImageIndex=a;e=t[a]}}return e};l.prototype.setDefaultImages=function(e){if(e&&e.length>0){var t=[];var i=null;for(var a=0;a<e.length;a++){i=e[a];var n=r.validate(i);if(n){t.push(i)}else{s.error("Invalid Url:'"+i)}}if(t.length<=0){s.error("Default Images are not set because supplied Urls are invalid")}else{this.setProperty("defaultImages",t)}}return this};return l});
//# sourceMappingURL=FeedTile.js.map