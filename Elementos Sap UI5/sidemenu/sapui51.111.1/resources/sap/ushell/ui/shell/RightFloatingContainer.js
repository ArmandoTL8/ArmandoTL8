// Copyright (c) 2009-2022 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/core/Control","sap/ui/thirdparty/jquery","sap/ui/core/Configuration","sap/ushell/library"],function(e,jQuery,t){"use strict";var i=e.extend("sap.ushell.ui.shell.RightFloatingContainer",{metadata:{library:"sap.ushell",properties:{size:{type:"sap.ui.core.CSSSize",group:"Appearance",defaultValue:"56px"},top:{type:"string",group:"Appearance",defaultValue:"0"},right:{type:"string",group:"Appearance",defaultValue:"0"},textVisible:{type:"boolean",group:"Appearance",defaultValue:true},insertItemsWithAnimation:{type:"boolean",group:"Appearance",defaultValue:true,deprecated:true},hideItemsAfterPresentation:{type:"boolean",group:"Appearance",defaultValue:false},enableBounceAnimations:{type:"boolean",group:"Appearance",defaultValue:false},actAsPreviewContainer:{type:"boolean",group:"Appearance",defaultValue:false}},aggregations:{floatingContainerItems:{type:"sap.ui.core.Control",multiple:true}},events:{afterRendering:{}}},renderer:{apiVersion:2,render:function(e,i){var n=t.getRTL();e.openStart("div",i);e.class("sapUshellRightFloatingContainer");e.style("top",i.getTop()+"rem");e.style(n?"left":"right",i.getRight());e.attr("data-role","alert");e.openEnd();e.openStart("ul");e.class("sapUshellNotificationListContainer");e.attr("role","list");e.openEnd();this.renderFloatingContainerItems(e,i);e.close("ul");e.close("div")},renderFloatingContainerItems:function(e,t){var i=t.getInsertItemsWithAnimation(),n=t.getActAsPreviewContainer(),a=t.getFloatingContainerItems(),s;for(s=0;s<a.length;s++){if(n&&!i){a[s].addStyleClass("sapUshellNonAnimatedNotificationListItem")}else if(a[s].hasStyleClass("sapUshellNonAnimatedNotificationListItem")){a[s].addStyleClass("sapUshellNotificationsListItem");a[s].addStyleClass("sapUshellRightFloatingContainerItemBackToViewport");a[s].addStyleClass("sapUshellRightFloatingContainerItemHidden");a[s].addStyleClass("sapUshellRightFloatingContainerItmHeightVisible");a[s].removeStyleClass("sapUshellNonAnimatedNotificationListItem")}e.renderControl(a[s])}}}});i.prototype.init=function(){var e;jQuery(window).bind("resize",function(){clearTimeout(e);e=setTimeout(this._handleResize.bind(this),100)}.bind(this));this.iRequiredItemsNumber=5};i.prototype.onBeforeRendering=function(){};i.prototype._setSize=function(){};i.prototype._handleResize=function(){if(this.getDomRef()&&this.getFloatingContainerItems().length){var e=this.iRequiredItemsNumber,t=window.innerHeight,i=this.getDomRef(),n=i.getBoundingClientRect().top,a=jQuery(".sapUiSizeCompact").length>0?56:64,s=this.$().find("li").eq(0),o,l;if(!s.length){return}o=s[0].clientHeight;var r=jQuery("#sapUshellDashboardFooter").outerHeight();this.iRequiredItemsNumber=Math.min(parseInt((t-n-a-r)/o,10),5);if(e!==this.iRequiredItemsNumber){l=this.getFloatingContainerItems();for(var u=0;u<l.length;u++){if(u<this.iRequiredItemsNumber||isNaN(this.iRequiredItemsNumber)){l[u].removeStyleClass("sapUshellShellHidden")}else{l[u].addStyleClass("sapUshellShellHidden")}}}}};i.prototype.onAfterRendering=function(){this.fireAfterRendering();setTimeout(function(){this._handleResize()}.bind(this),500);this.addStyleClass("sapContrastPlus");this.addStyleClass("sapContrast");this.addStyleClass("sapUshellNotificationsListItem")};i.prototype.setVisible=function(e){this.setProperty("visible",e,true);if(e){jQuery(this.getDomRef()).css("visibility","visible")}else{jQuery(this.getDomRef()).css("visibility","hidden")}};i.prototype.setFloatingContainerItemsVisiblity=function(e){var t=this.getFloatingContainerItems(),i=e?300:0,n=this.getInsertItemsWithAnimation(),a=function(i){if(e){t[i].removeStyleClass("sapUshellRightFloatingContainerItemBounceOut").addStyleClass("sapUshellRightFloatingContainerItemBounceIn")}else{t[i].removeStyleClass("sapUshellRightFloatingContainerItemBounceIn").addStyleClass("sapUshellRightFloatingContainerItemBounceOut")}};for(var s=0;s<t.length;s++){(function(s){return function(){if(n){setTimeout(function(){a(s)},i+s*100)}else{t[s].setVisible(e)}}})(s)()}};i.prototype._animationBouncer=function e(t){var i=function(){if(!e._animationQueue.length){e._itemTimeoutId=undefined;return}var t=e._animationQueue.shift();t.addStyleClass("sapUshellRightFloatingContainerItmHeightVisible").addStyleClass("sapUshellRightFloatingContainerItemBounceIn");e._itemTimeoutId=setTimeout(i,100)};if(!e._animationQueue){e._animationQueue=[]}e._animationQueue.push(t);if(e._mainTimeoutId||e._itemTimeoutId){return}e._mainTimeoutId=setTimeout(function(){e._mainTimeoutId=undefined;i()},500)};i.prototype.addFloatingContainerItem=function(e){this.addAggregation("floatingContainerItems",e);e.addStyleClass("sapContrastPlus");if(this.getInsertItemsWithAnimation()){e.addStyleClass("sapUshellNotificationsListItem");e.addStyleClass("sapUshellRightFloatingContainerItemHidden");if(this.getEnableBounceAnimations()){i.prototype._animationBouncer(e)}else{setTimeout(function(){var t=this.getFloatingContainerItems();if(t.length>5){var i=t[t.length-1];i.addStyleClass("sapUshellRightFloatingContainerHideLastItem")}e.addStyleClass("sapUshellRightFloatingContainerItemBackToViewport").addStyleClass("sapUshellRightFloatingContainerItmHeightVisible")}.bind(this),500)}}else if(this.getActAsPreviewContainer()){e.addStyleClass("sapUshellNonAnimatedNotificationListItem")}if(this.getHideItemsAfterPresentation()){setTimeout(function(){e.removeStyleClass("sapUshellRightFloatingContainerItemBackToViewport")},5e3)}};return i});
//# sourceMappingURL=RightFloatingContainer.js.map