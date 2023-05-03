/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(
	["./BaseShape", "./RenderUtils", "./GanttUtils", "../misc/Format", "./BaseText"],
	function (BaseShape, RenderUtils, GanttUtils, Format, BaseText) {
		"use strict";

		/**
		 * Creates and initializes a new BaseDeltaRectangle class.
		 *
		 * @param {string} [sId] ID of the new control. This is generated automatically, if ID is not provided.
		 * @param {object} [mAttributes] Initial settings of the new control
		 *
		 * @class
		 * BaseDeltaRectangle represents a basic shape that creates rectangles. It is defined by corner positions, width and height.
		 * The rectangle may have their corners rounded.
		 *
		 * @extends sap.gantt.simple.BaseShape
		 *
		 * @author SAP SE
		 * @version 1.111.0
     	 * @since 1.84
		 *
		 * @constructor
		 * @public
		 * @alias sap.gantt.simple.BaseDeltaRectangle
		 */
		var BaseDeltaRectangle = BaseShape.extend(
			"sap.gantt.simple.BaseDeltaRectangle",
			{
				metadata: {
					properties: {
						/**
						 * Defines the X-axis coordinate in the user coordinate system.
						 */
						x: { type: "sap.gantt.SVGLength" },

						/**
						 * Defines the Y-axis coordinate in the user coordinate system.
						 */
						y: { type: "sap.gantt.SVGLength" },

						/**
						 * Width defines the horizontal length of the rectangle.
						 * Most of time it's calculated by properties <code>time</code> and <code>endTime</code> automatically
						 */
						width: { type: "sap.gantt.SVGLength" },

						/**
						 * Height defines the vertical length of the rectangle.
						 *
						 * By default, the system automatically generates the shape height according to the base row height. You can set the height yourself by using the setter method. However, it cannot exceed the row height.
						 */
						height: { type: "sap.gantt.SVGLength"},

						/**
						 * rx defines the radius of the X-axis.
						 */
						rx: {
							type: "sap.gantt.SVGLength",
							group: "Appearance",
							defaultValue: 0
						},

						/**
						 * ry defines the radius of the Y-axis.
						 */
						ry: {
							type: "sap.gantt.SVGLength",
							group: "Appearance",
							defaultValue: 0
						},
						/**
						 * Title of the rectangle.
						 */
						title: { type: "string", group: "Appearance", defaultValue: null },

						/**
						 * Flag to show or hide the title of the Rectangle.
						 */
						showTitle: {
							type: "boolean",
							group: "Appearance",
							defaultValue: true
						}
					},
					events: {
						press: {},
						mouseEnter: {},
						mouseLeave: {}
					}
				},
				renderer: {
					apiVersion: 2    // enable in-place DOM patching
				}
			}
		);

		var mAttributes = [
			"x",
			"y",
			"width",
			"height",
			"style",
			"rx",
			"ry",
			"filter",
			"opacity",
			"transform"
		];

		/**
		 * Firing event on the mouse hover of BaseDeltaRectangle
		 *
		 * @param {object} oEvent - holding event details of BaseDeltaRectangle
		 */
		BaseDeltaRectangle.prototype.onmouseover = function (oEvent) {
			this.fireMouseEnter(oEvent);
		};

		/**
		 * Firing event on the mouseout of BaseDeltaRectangle
		 *
		 * @param {object} oEvent - holding event details of BaseDeltaRectangle
		 */
		BaseDeltaRectangle.prototype.onmouseout = function (oEvent) {
			this.fireMouseLeave(oEvent);
		};

		/**
		 * Firing event on selecting the BaseDeltaRectangle
		 *
		 * @param {object} oEvent - holding event details of BaseDeltaRectangle
		 */
		BaseDeltaRectangle.prototype.onclick = function (oEvent) {
			this.firePress(oEvent);
		};


		/**
		 * Gets the value of property <code>width</code>.
		 *
		 * Width of the rectangle.
		 *
		 * Usually applications do not set this value. This getter carries out the calculation using properties <code>time</code> and
		 * <code>endTime</code>
		 *
		 * @return {number} Value of property <code>width</code>.
		 * @public
		 */
		BaseDeltaRectangle.prototype.getWidth = function () {
			var iWidth = this.getProperty("width");
			if (iWidth !== null && iWidth !== undefined) {
				return iWidth;
			}

			var oAxisTime = this.getAxisTime();
			if (oAxisTime == null) {
				return 0;
			}

			var nRetVal,
				startTime = oAxisTime.timeToView(
					Format.abapTimestampToDate(this.getTime())
				),
				endTime = oAxisTime.timeToView(
					Format.abapTimestampToDate(this.getEndTime())
				);

			//if nRetVal is not numeric, return itself
			if (!jQuery.isNumeric(startTime) || !jQuery.isNumeric(endTime)) {
				return 0;
			}

			nRetVal = Math.abs(endTime - startTime);

			// set minimum width 1 to at least make the shape visible
			nRetVal = nRetVal <= 0 ? 1 : nRetVal;

			return nRetVal;
		};

		/**
		 * Getting the styles of the property
		 *
		 * @return {object} style of the property.
		 */
		BaseDeltaRectangle.prototype.getStyle = function () {
			var sInheritedStyle = BaseShape.prototype.getStyle.apply(this, arguments);
			var oStyles = {
				fill: this.determineValueColor(this.getFill()),
				"stroke-dasharray": this.getStrokeDasharray(),
				"fill-opacity": this.getFillOpacity(),
				"stroke-opacity": this.getStrokeOpacity()
			};
			return sInheritedStyle + this.getInlineStyle(oStyles);
		};

		/**
		 * Rendering the properties of BaseDeltaRectangle
		 *
		 * @param {object} oRm - Instance of Render Manager
		 * @param {object} oElement  - element which needs to render on Gantt Chart
		 */
		BaseDeltaRectangle.prototype.renderElement = function (oRm, oElement) {
			this.writeElementData(oRm, "rect", false);
			if (this.aCustomStyleClasses) {
				this.aCustomStyleClasses.forEach(function(sClass){
					oRm.class(sClass);
				});
			}
			RenderUtils.renderAttributes(oRm, oElement, mAttributes);
			oRm.openEnd();
			RenderUtils.renderTooltip(oRm, oElement);
			oRm.close("rect");
			// if title had been set, then display in middle of the rectangle
			if (this.getShowTitle()) {
				RenderUtils.renderElementTitle(oRm, oElement, function (mTextSettings) {
					return new BaseText(mTextSettings);
				});
			}
			BaseShape.prototype.renderElement.apply(this, arguments);
		};

		return BaseDeltaRectangle;
	},
	true
);
