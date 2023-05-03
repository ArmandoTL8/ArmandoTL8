/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["./BaseShape","./BaseRectangle","./RenderUtils"],function(t,e,r){"use strict";var a=t.extend("sap.gantt.simple.BaseLine",{metadata:{library:"sap.gantt",properties:{x1:{type:"sap.gantt.SVGLength",defaultValue:0},y1:{type:"sap.gantt.SVGLength",defaultValue:0},x2:{type:"sap.gantt.SVGLength",defaultValue:0},y2:{type:"sap.gantt.SVGLength",defaultValue:0}}},renderer:{apiVersion:2}});a.prototype.applySettings=function(r,a){t.prototype.applySettings.apply(this,arguments);this.oDelegator=new e({},a)};var n=["x1","y1","x2","y2","stroke","stroke-width","transform","style","opacity"];a.prototype.getX1=function(){var t=this.getProperty("x1");if(t||t===0){return t}return this.oDelegator.getX()};a.prototype.getY1=function(){var t=this.getProperty("y1");if(t||t===0){return t}return this.oDelegator.getRowYCenter()};a.prototype.getX2=function(){var t=this.getProperty("x2");if(t||t===0){return t}var e=this.oDelegator.getWidth();return this.getX1()+e};a.prototype.getY2=function(){var t=this.getProperty("y2");if(t||t===0){return t}return this.getY1()};a.prototype.getStyle=function(){var e=t.prototype.getStyle.apply(this,arguments);var r={"stroke-dasharray":this.getStrokeDasharray(),"fill-opacity":this.getFillOpacity(),"stroke-opacity":this.getStrokeOpacity()};return e+this.getInlineStyle(r)};a.prototype.renderElement=function(e,a){this.writeElementData(e,"line",true);if(this.aCustomStyleClasses){this.aCustomStyleClasses.forEach(function(t){e.class(t)})}r.renderAttributes(e,a,n);e.openEnd();r.renderTooltip(e,a);if(this.getShowAnimation()){r.renderElementAnimation(e,a)}e.close("line");t.prototype.renderElement.apply(this,arguments)};return a},true);
//# sourceMappingURL=BaseLine.js.map