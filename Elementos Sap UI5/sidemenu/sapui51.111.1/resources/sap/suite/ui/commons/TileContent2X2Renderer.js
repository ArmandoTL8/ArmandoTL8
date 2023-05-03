/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define([],function(){"use strict";var t={};t.render=function(t,e){var i=e.getTooltip_AsString();var r=e.getAltText?e.getAltText():"";t.write("<div");t.writeControlData(e);t.addClass("sapSuiteTileCnt");t.addClass(e._getContentType());t.addClass(e.getSize());t.addClass("ft-"+"TwoByTwo");if(i){t.writeAttributeEscaped("title",i)}t.writeAttribute("aria-describedby",e.getId()+"-info");t.writeClasses();t.write(">");this.renderContent(t,e);this.renderFooter(t,e);t.write("<div");t.writeAttribute("id",e.getId()+"-info");t.addStyle("display","none");t.writeAttribute("aria-hidden","true");t.writeStyles();t.write(">");t.writeEscaped(r);t.write("</div>");t.write("</div>")};t.renderContent=function(t,e){var i=e.getContent();t.write("<div");t.addClass("sapSuiteTileCntContent");t.addClass(e.getSize());t.addClass("ft-"+"TwoByTwo");t.writeClasses();t.writeAttribute("id",e.getId()+"-content");t.write(">");if(i&&!i.hasStyleClass("sapSuiteUiTcInnerMarker")){i.addStyleClass("sapSuiteUiTcInnerMarker")}t.renderControl(i);t.write("</div>")};t.renderFooter=function(t,e){var i=e._getFooterText(t,e);t.write("<div");t.addClass("sapSuiteTileCntFtrTxt");t.addClass(e.getSize());t.writeClasses();t.writeAttribute("id",e.getId()+"-footer-text");t.writeAttributeEscaped("title",i);t.write(">");t.writeEscaped(i);t.write("</div>")};return t},true);
//# sourceMappingURL=TileContent2X2Renderer.js.map