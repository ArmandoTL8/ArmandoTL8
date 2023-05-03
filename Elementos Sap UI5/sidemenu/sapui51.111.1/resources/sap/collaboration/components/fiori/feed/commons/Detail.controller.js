/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2017 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log","sap/collaboration/components/utils/JamUtil","sap/ui/core/mvc/Controller","sap/collaboration/library"],function(e,i,t,a){"use strict";var o=a.FeedType;var s=a.AppType;sap.ui.controller("sap.collaboration.components.fiori.feed.commons.Detail",{onInit:function(){this.sJamToken=this.getView().getViewData().jamToken;this.sJamURL=this.getView().getViewData().jamURL;this.oLangBundle=this.getView().getViewData().langBundle;this.sPrefixId=this.getView().getViewData().controlId;this.oBusinessObject=this.getView().getViewData().businessObject;this.bJamWidgetInitialized=false;if(this.getView().getViewData().appType===s.split){this.sFeedType=o.follows}else{this.sFeedType=this.getView().getViewData().feedType;this.getView().oDetailPage.setShowHeader(false)}this.oJamUtil=new i},onBeforeRendering:function(){},onAfterRendering:function(){try{this.loadFeedWidget(this.sJamURL)}catch(i){e.error(i,"","sap.collaboration.components.fiori.feed.commons.Detail.onInit()");throw i}},loadFeedWidget:function(i){var t=this;try{var a=t.getView().getViewData().groupIds;var o=this.oJamUtil.prepareWidgetData(t.sJamToken,t.sFeedType,a,t.oBusinessObject);var s=function(i){e.info("Jam Feed Widget Loaded Successfully","sap.collaboration.components.fiori.feed.commons.Detail.onInit()");t.oJamUtil.initializeJamWidget(t.sJamURL);t.bJamWidgetInitialized=true;t.oJamUtil.createJamWidget(t.sPrefixId+"widgetContainer",o)};var n=function(i){e.error(i,"","sap.collaboration.components.fiori.feed.commons.Detail.loadFeedWidgetScript()");throw i};if(this.bJamWidgetInitialized===false){this.oJamUtil.loadFeedWidgetScript(i,s,n)}else{this.oJamUtil.createJamWidget(t.sPrefixId+"widgetContainer",o)}}catch(i){e.error(i,"","sap.collaboration.components.fiori.feed.commons.Detail.loadFeedWidgetScript()");throw i}}})});
//# sourceMappingURL=Detail.controller.js.map