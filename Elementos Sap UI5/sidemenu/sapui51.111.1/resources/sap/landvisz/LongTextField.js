/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2013 SAP AG. All rights reserved
 */
sap.ui.define(["sap/landvisz/library","sap/ui/core/Control","sap/ui/commons/TextView","./LongTextFieldRenderer"],function(e,t,i,n){"use strict";var o=t.extend("sap.landvisz.LongTextField",{metadata:{library:"sap.landvisz",properties:{text:{type:"string",group:"Data",defaultValue:null},renderingSize:{type:"sap.landvisz.EntityCSSSize",group:"Dimension",defaultValue:null}}}});o.prototype.init=function(){};o.prototype.exit=function(){this.oLinearRowFieldLabel&&this.oLinearRowFieldLabel.destroy()};o.prototype.initControls=function(){var e=this.getId();if(!this.oLongText)this.oLongText=new i(e+"-CLVConValue")};return o});
//# sourceMappingURL=LongTextField.js.map