/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2013 SAP AG. All rights reserved
 */
sap.ui.define(["sap/landvisz/library"],function(e){"use strict";var i=e.EntityCSSSize;var a={};a.render=function(e,a){var n=sap.ui.getCore().getLibraryResourceBundle("sap.landvisz");if(!this.initializationDone){a.initControls();a.initializationDone=true;e.write("<div");e.writeControlData(a);e.addClass("sapLandviszLongTextSizeCommon");if(a.getRenderingSize()==i.RegularSmall)e.addClass("sapLandviszLongTextRegularSmallSize");if(a.getRenderingSize()==i.Regular)e.addClass("sapLandviszLongTextRegularSize");if(a.getRenderingSize()==i.Medium)e.addClass("sapLandviszLongTextMediumSize");if(a.getRenderingSize()==i.Large)e.addClass("sapLandviszLongTextLargeSize");e.writeClasses();e.write(">");var t=a.getText();a.oLongText.setWrapping(true);a.oLongText.setText(t);e.renderControl(a.oLongText);e.write("</div>")}};return a},true);
//# sourceMappingURL=LongTextFieldRenderer.js.map