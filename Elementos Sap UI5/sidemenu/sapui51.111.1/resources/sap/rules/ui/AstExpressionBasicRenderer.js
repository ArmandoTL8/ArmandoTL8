/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2016 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/thirdparty/jquery","sap/ui/core/syncStyleClass"],function(jQuery,e){"use strict";var t={apiVersion:2};t.render=function(t,a){if(a.getParent()instanceof jQuery){e("sapUiSizeCozy",a.getParent(),this.oControl)}var r=sap.ui.getCore().getLibraryResourceBundle("sap.rules.ui.i18n");var s=r.getText("ctrlSpaceCue");if(sap.ui.Device.os.name=="mac"){s=r.getText("optionSpaceCue")}if(s.length>50&&a.getParent().getId()==="popover"){s=s.substring(0,50)+" ..."}var i='contenteditable="true"';var n='data-placeholder="'+s+'"';var p='aria-placeholder="'+s+'"';t.openStart("div",a);t.class("sapAstExpressionInputWrapper");t.openEnd();t.openStart("pre");t.class("sapAstExpressionPreSpaceMargin");t.openEnd();t.openStart("div");t.accessibilityState(a,{role:"textbox",labelledBy:"",placeholder:s});t.attr("id",a.getId()+"-input");t.attr("data-placeholder",s);t.attr("contenteditable","true");t.attr("spellcheck","false");t.class("sapAstExpressionInput");t.openEnd();t.close("div");t.close("pre");t.close("div")};return t},true);
//# sourceMappingURL=AstExpressionBasicRenderer.js.map