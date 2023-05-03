/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

// Provides helper sap.gantt.simple.GanttUtils
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/base/Log",
	"sap/ui/core/Core",
	"sap/gantt/misc/Utility",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/Locale",
	"sap/m/OverflowToolbar",
	"sap/ui/core/theming/Parameters",
	"sap/ui/Device",
	"./CoordinateUtils",
	"sap/gantt/misc/Format",
	"sap/gantt/library"
], function(jQuery, Log, Core, Utility, DateFormat, Locale, OverflowToolbar, Parameters, Device, CoordinateUtils, Format, library) {
	"use strict";
	var oContextCache = {};
	var shapesWithRowLevels = {};
	var exitShapeTraversingLoop = false;
	var exitRowTraversingLoop = false;
	var GanttUtils = {

		SHAPE_ID_DATASET_KEY          : "data-sap-gantt-shape-id",
		ROW_ID_DATASET_KEY            : "data-sap-gantt-row-id",
		CONNECTABLE_DATASET_KEY       : "data-sap-gantt-connectable",
		SELECT_FOR_DATASET_KEY        : "sap-gantt-select-for",
		SHAPE_CONNECT_FOR_DATASET_KEY : "sap-gantt-shape-connect-for",
		SHAPE_CONNECT_INDICATOR_WIDTH : 10,

		oDateFormat : DateFormat.getDateInstance({pattern: 'yyyyMMddHHmmss'}),

		/**
		 * Try to find the in-row shape instance after rendering
		 */
		shapeElementById: function(sShapeId, sGanttSvgId) {
			var oGanttSvg = window.document.getElementById(sGanttSvgId),
				oShapeContainer = oGanttSvg.querySelector("g.sapGanttChartShapes");

			var aNodeList = oShapeContainer.querySelectorAll("[" + GanttUtils.SHAPE_ID_DATASET_KEY + "='" + sShapeId + "']");
			var oElementNode = aNodeList[0];
			if (oElementNode) {
				return jQuery(oElementNode).control(0);
			}

			return null;
		},

		isRelationshipConnectedToPseudoShapes: function(sShapeId, sGanttSvgId) {
			var oGantt = sap.ui.getCore().byId(sGanttSvgId);
			var oTableRows = oGantt.getTable().getRows();
			var bFoundShapeForRelationship = false, oPseudoShapesForRelationship;
			oTableRows.forEach(function(oTableRow){
				if (!bFoundShapeForRelationship) {
					var oRowSetting = oTableRow.getAggregation("_settings");
					oPseudoShapesForRelationship = oRowSetting.getTasks && oRowSetting.getTasks().filter(function(oTask) {
						return oTask.isPseudoShape;
					}).filter(function(oPseudoShape) {
						return (oPseudoShape.aShapeIds.indexOf(sShapeId) > -1);
					})[0];
					if (oPseudoShapesForRelationship) {
						bFoundShapeForRelationship = true;
					}
				}
			});
			if (bFoundShapeForRelationship && document.getElementById(oPseudoShapesForRelationship.getId())) {
				return oPseudoShapesForRelationship;
			}
		},

		getValueX: function(oShape) {
			var nTimeX;
			var oProp = oShape.getMetadata().getProperty("x");
			if (oProp) {
				nTimeX = oShape.getProperty(oProp.name);
				if (nTimeX !== null && nTimeX !== undefined) {
					return nTimeX;
				}
			}

			var bRTL = Core.getConfiguration().getRTL(),
				vTime = bRTL ? (oShape.getEndTime() || oShape.getTime()) : oShape.getTime();

			if (vTime) {
				nTimeX = oShape.getXByTime(vTime);
			}

			if (!jQuery.isNumeric(nTimeX)) {
				Log.warning("couldn't convert timestamp to x with value: " + vTime);
			}

			return nTimeX;
		},

		/**
		 * get table row by background rect element
		 * @private
		 */
		getRowInstance: function(oEvent, oTable) {
			var iRowIndex = jQuery(oEvent.target).closest("rect.sapGanttBackgroundSVGRow").data("sapUiIndex");
			if (iRowIndex != null) {
				return oTable.getRows()[iRowIndex];
			}
		},

		/**
		 * get table row from Current Shape
		 * @private
		 */
		getRowInstancefromShape: function(oShape) {
			var oRowSettings = oShape.getParentRowSettings();
			if (oRowSettings != null) {
				return oRowSettings.getParentRow();
			}
		},

		/**
		 * Creates context for measuring size of the font and then the context is put
		 * in cache for later use. Every shape used to have its own 2d context,
		 * but IE11 could not handle that. That is why the 2d context is cached
		 * once for all shapes here.
		 * @param {number} iFontSize Size of font
		 * @param {string} sFontFamily Font family
		 * @param {string} sFontWeight Font weight
		 * @returns {CanvasRenderingContext2D} 2d context
		 * @private
		 */
		_get2dContext: function(iFontSize, sFontFamily, sFontWeight) {
			if (!oContextCache.context) {
				/* eslint-disable sap-no-element-creation */
				oContextCache.context
					= document.createElement('canvas').getContext("2d");
				/* eslint-enable sap-no-element-creation */
			}
			if (oContextCache.fontSize !== iFontSize
				|| oContextCache.fontFamily !== sFontFamily || oContextCache.fontWeight !== sFontWeight) {
				oContextCache.context.font = sFontWeight + " " + iFontSize + "px " + sFontFamily;
				oContextCache.fontSize = iFontSize;
				oContextCache.fontFamily = sFontFamily;
				oContextCache.fontWeight = sFontWeight;
			}
			return oContextCache.context;
		},

		/**
		 * Returns width of the shape text
		 * @param {string} sText Text in the shape
		 * @param {number} iFontSize font size
		 * @param {string} sFontFamily Font family
		 * @param {string} sFontWeight Font weight
		 * @returns {number} width of the shape text
		 * @private
		 */
		 getShapeTextWidth: function(sText, iFontSize, sFontFamily, sFontWeight) {
			return this._get2dContext(iFontSize, sFontFamily, sFontWeight)
				.measureText(sText).width;
		},

		getSelectedTableRowSettings: function(oTable, iSelectedIndex) {
			var aAllRows = oTable.getRows(),
				iFirstVisibleRow = oTable.getFirstVisibleRow();

			if (aAllRows.length === 0) {
				// prevent error in below
				return null;
			}
			var iFirstRowIndex = aAllRows[0].getIndex();

			var iIndex = iSelectedIndex - iFirstVisibleRow;
			if (iFirstRowIndex !== iFirstVisibleRow) {
				// Case that variableRowHeight is enabled and table scroll to the bottom
				iIndex += Math.abs(iFirstRowIndex - iFirstVisibleRow);
			}
			if (!aAllRows[iIndex]) {
				return null;
			}
			return aAllRows[iIndex].getAggregation("_settings");
		},

		updateGanttRows: function(oDelegator, aRowState, iIndex) {
			var oGantt = oDelegator.getParent().getParent();
			var $svg = jQuery(document.getElementById(oGantt.getId() + "-svg")),
			$bgRects = $svg.find("rect.sapGanttBackgroundSVGRow");
			if (oGantt.getEnableChartSelectionState()) {
				$bgRects.eq(iIndex).toggleClass("sapGanttBackgroundSVGRowSelected", !!aRowState[iIndex].selected);
			}
			if (oGantt.getEnableChartHoverState()) {
				$bgRects.eq(iIndex).toggleClass("sapGanttBackgroundSVGRowHovered",  !!aRowState[iIndex].hovered);
			}
		},

		/**
		 * Get shapes element with their Uids
		 *
		 * @param  {string} sContainerId        Gantt chart's dom id
		 * @param  {string[]} aShapeUid            Array of shape uid
		 * @return {object[]}                      Array of shape element
		 */
		getShapesWithUid : function (sContainerId, aShapeUid) {
			var fnElementFromShapeId = function (sShapeUid) {
				var oPart = Utility.parseUid(sShapeUid),
					sShapeId = oPart.shapeId;

				var selector = ["[id='", sContainerId, "']", " [" + GanttUtils.SHAPE_ID_DATASET_KEY + "='", sShapeId, "']"].join("");
				return jQuery(selector).control().filter(function (oElement) {
					return oElement.getShapeUid() === sShapeUid;
				})[0];

			};
			return aShapeUid.map(fnElementFromShapeId);
		},

		/**
		 * Get visible shape element from objectId(shapeId)
		 * @param {string} sContainerId Gantt chart's dom id
		 * @param {string[]} shapeId Array of objectId(shapeId)
		 * @returns {object[]} Array of shape element
		 */
		getShapeByShapeId : function (sContainerId, shapeId) {
			var fnElements = [];
			shapeId.forEach(function(sShapeId){
				var selector = ["[id='", sContainerId, "']", " [" + GanttUtils.SHAPE_ID_DATASET_KEY + "='", sShapeId, "']"].join("");
				var sElm = document.querySelector(selector);
				if (sElm) {
					var oShape = sap.ui.getCore().byId(sElm.id);
					fnElements.push(oShape);
				}
			});
			return fnElements;
		},

		getShapesInRowsById : function(sGanttId, rowIds) {
			var oSvg = document.getElementById(sGanttId);
			var shapes = [];
			rowIds.forEach(function(sRowId) {
				if (oSvg) {
					var rowElm = oSvg.querySelector("[data-sap-gantt-row-id='" + sRowId + "']");
					if (rowElm) {
						shapes = Array.from(rowElm.children).filter(function(shape){
							return shape.id !== "";
						})
						.reduce(function(acc,item) {
							return acc.concat(sap.ui.getCore().byId(item.id));
						},shapes);
					}
				}
			});
			return shapes;
		},

		/**
		 * gets objectId from shape UID.
		 * @param {string[]} ShapeUid Array of shape uids.
		 * @returns {string[]} Arrays of object Id.
		 */
		getShapeIdFromShapeUid : function (ShapeUid) {
			return ShapeUid.map(function (sShapeUid) {
				var oPart = Utility.parseUid(sShapeUid);
				return oPart.shapeId;
			});
		},

		/**
		 * Get time formater by lower level of time axis.
		 * Keep the time unit to date if lower level of the time axis is bigger than or equal to date
		 *
		 * @param {object} oGantt  Gantt chart instance
		 *
		 * @return {object} Time formater
		 */
		getTimeFormaterBySmallInterval : function(oGantt) {
			var oAxisTimeStrategy = oGantt.getAxisTimeStrategy(),
				oSmallInterval = oAxisTimeStrategy.getTimeLineOption().smallInterval,
				oUnit = oSmallInterval.unit;

			var oCalendarType = oAxisTimeStrategy.getCalendarType(),
				oCoreLocale = oAxisTimeStrategy.getLocale() ? oAxisTimeStrategy.getLocale() :
					new Locale(Core.getConfiguration().getLanguage().toLowerCase());

			// keep the time unit to date if lower level of the time axis is bigger than or equal to date.
			var sFormat = "yyyyMMMddhhms";
			if (!(oUnit === sap.gantt.config.TimeUnit.minute || oUnit === sap.gantt.config.TimeUnit.hour)) {
				sFormat = "yyyyMMMdd";
			}

			return DateFormat.getDateTimeInstance({
				format: sFormat,
				style: oSmallInterval.style,
				calendarType: oCalendarType
			}, oSmallInterval.locale ? new Locale(oSmallInterval.locale) : oCoreLocale);
		},

		/**
		 * Converts date to FLP timeZone
		 * @param {object} oDate date to be parsed
		 * @returns converted date object
		 */
		getFormatedDateByTimeZone : function (oDate) {
			var sFormattedDate = this.oDateFormat.format(oDate);
			return Format.abapTimestampToDate(sFormattedDate);
		},

		/**
		 * Resets the StrokeDasharray for the Adhoc Lines
		 * @param {sap.gantt.simple.GanttChartWithTable} oGantt
		 */
		resetStrokeDasharray : function(oGantt){
			if (!oGantt) {
				return;
			}
			var aSelectedLine = oGantt.getSimpleAdhocLines().find(function(x){
				return x._getSelected();
			});
			if (aSelectedLine) {
				aSelectedLine._setSelected(false);
				var headerStroke = document.getElementById(aSelectedLine._getHeaderLine().sId);
				var stroke = document.getElementById(aSelectedLine._getLine().sId);
				var marker = document.getElementById(aSelectedLine._getMarker().getId());
				marker.style.cursor = "pointer";
				if (stroke && headerStroke){
					stroke.style.strokeDasharray = aSelectedLine.getStrokeDasharray();
					headerStroke.style.strokeDasharray = aSelectedLine.getStrokeDasharray();
					stroke.style.strokeWidth = aSelectedLine._getStrokeWidth();
					headerStroke.style.strokeWidth = aSelectedLine._getStrokeWidth();
				}
			}

			var aSelectedDeltaLine = oGantt.getDeltaLines().find(function (x) {
				return x._getIsSelected();
			});
			if (aSelectedDeltaLine) {
				var oChartDeltaArea = aSelectedDeltaLine._getChartDeltaArea();
				if (oChartDeltaArea) {
					var $chartdeltaArea = document.getElementById(oChartDeltaArea.sId);
					if (aSelectedDeltaLine._getEnableChartDeltaAreaHighlight() === true) {
						$chartdeltaArea.style.opacity = 0.0;
					}
				}
				var oForwardMarker = document.getElementById(
					aSelectedDeltaLine._getForwardMarker().sId
				);
				var oBackwardMarker = document.getElementById(
					aSelectedDeltaLine._getBackwardMarker().sId
				);
				var oHeaderDeltaArea = document.getElementById(
					aSelectedDeltaLine._getHeaderDeltaArea().sId
				);
				var markerStroke = Parameters.get("sapUiChartDataPointBorderColor");
				if (aSelectedDeltaLine.getVisibleDeltaStartEndLines()) {
					var oStartLine = document.getElementById(aSelectedDeltaLine._getStartLine().sId);
					var oEndLine = document.getElementById(aSelectedDeltaLine._getEndLine().sId);
					var oHeaderStartLine = document.getElementById(
						aSelectedDeltaLine._getHeaderStartLine().sId
					);
					var oHeaderEndLine = document.getElementById(
						aSelectedDeltaLine._getHeaderEndLine().sId
					);
					oStartLine.style.strokeDasharray = aSelectedDeltaLine.getStrokeDasharray();
					oEndLine.style.strokeDasharray = aSelectedDeltaLine.getStrokeDasharray();
					oHeaderStartLine.style.strokeDasharray = aSelectedDeltaLine.getStrokeDasharray();
					oHeaderEndLine.style.strokeDasharray = aSelectedDeltaLine.getStrokeDasharray();
					oStartLine.style.strokeWidth = aSelectedDeltaLine._getStrokeWidth();
					oEndLine.style.strokeWidth = aSelectedDeltaLine._getStrokeWidth();
					oHeaderStartLine.style.strokeWidth = aSelectedDeltaLine._getStrokeWidth();
					oHeaderEndLine.style.strokeWidth = aSelectedDeltaLine._getStrokeWidth();
				}
				oForwardMarker.style.fillOpacity = 0;
				oBackwardMarker.style.fillOpacity = 0;
				oHeaderDeltaArea.style.opacity = 1;
				oHeaderDeltaArea.style.cursor = "pointer";
				oForwardMarker.style.stroke = null;
				oBackwardMarker.style.stroke = null;
				if (aSelectedDeltaLine._getVisibleMarker() === true) {
					oForwardMarker.style.fillOpacity = 1;
					oBackwardMarker.style.fillOpacity = 1;
					oForwardMarker.style.stroke = markerStroke;
					oBackwardMarker.style.stroke = markerStroke;
				}
				var oResizeExtension = oGantt._getResizeExtension();
				oResizeExtension.clearAllDeltaOutline();
				aSelectedDeltaLine._setIsSelected(false);
			}
		},

		/**
		 * returns true if the adhoc lines are present for which the marker type is not none and if they are to be shown from the settings dialog
		 * @param {sap.gantt.simple.GanttChartWithTable} oGantt - Instance of Gantt Chart
		 *
		 * @returns {sap.gantt.simple.AdhocLine} returns adhoc lines are present for which the marker type is not none and if they are to be shown from the settings dialog
		 */
		adhocLinesPresentAndEnabled : function(oGantt){
			return oGantt.getSimpleAdhocLines().filter(function(oAdhocLine){return oAdhocLine.MarkerType != sap.gantt.simple.MarkerType.None; }).length > 0 && oGantt.getEnableAdhocLine();
		},

		/**
		 * Adds the toolbar considering the parameters on the gantt chart
		 * @param {object} oScope scope of the calling function
		 * @param {object} oTable table object of the Gantt Chart
		 * @param {boolean} isExportToExcel boolean to know where the function is called from
		 */
		addToolbarToTable: function (oScope, oTable, isExportToExcel){
			if (isExportToExcel){
				if (oTable.getExtension().length == 0) { //If Table.extension is not present, add a new extension and the Export button.
					var oOverFlowToolBar = new OverflowToolbar();
					oOverFlowToolBar.addContent(oScope.oExportTableToExcelButton);
					oTable.addExtension(oOverFlowToolBar);
				} else {
					oTable.getExtension()[0].addContent(oScope.oExportTableToExcelButton);//Add the Export button to the existing Table.extension.
				}
			}
		},

		findSpaceInLevel: function(level, shape, startTime, endTime) {
			//traverse shapesWithRowLevels object by levels
			// exitRowTraversingLoop = false;
			for (var j = 0; j < shapesWithRowLevels[level].length; j++) {
				//traverse shapes inside a level of shapesWithRowLevels object
				if (exitRowTraversingLoop) {
					return;
				}
				if (shapesWithRowLevels[level].length > 1) {
					//check if shapesWithRowLevels object has more than one shape in a level
					if (j === 0 && (shape[endTime]() <= shapesWithRowLevels[level][j][startTime]() ||
					(shape[endTime]() > shapesWithRowLevels[level][j][startTime]() && (shape[endTime]() - shapesWithRowLevels[level][j][startTime]()) <= 1000)) &&
					!(shape[startTime]().getTime() === shapesWithRowLevels[level][j][startTime]().getTime() && shape[endTime]().getTime() === shapesWithRowLevels[level][j][endTime]().getTime())) {
						//check if incoming shape to be plotted can be plotted before the first shape of a level
						shapesWithRowLevels[level].push(shape);
						exitShapeTraversingLoop = true;
					} else if (shapesWithRowLevels[level][j + 1] !== undefined &&
						((shape[startTime]() >= shapesWithRowLevels[level][j][endTime]() && shape[endTime]() <= shapesWithRowLevels[level][j + 1][startTime]()) ||
						(shape[startTime]() < shapesWithRowLevels[level][j][endTime]() && ((shapesWithRowLevels[level][j][endTime]() - shape[startTime]()) <= 1000) &&
						((shape[endTime]() > shapesWithRowLevels[level][j + 1][startTime]() && ((shape[endTime]() - shapesWithRowLevels[level][j + 1][startTime]()) <= 1000)) ||
						shape[endTime]() <= shapesWithRowLevels[level][j + 1][startTime]())) ||
						(shape[endTime]() > shapesWithRowLevels[level][j + 1][startTime]() && ((shape[endTime]() - shapesWithRowLevels[level][j + 1][startTime]()) <= 1000) &&
						(shape[startTime]() >= shapesWithRowLevels[level][j][endTime]() ||
						(shape[startTime]() < shapesWithRowLevels[level][j][endTime]() && ((shapesWithRowLevels[level][j][endTime]() - shape[startTime]()) <= 1000))))) &&
						!((shape[startTime]().getTime() === shapesWithRowLevels[level][j][startTime]().getTime() && shape[endTime]().getTime() === shapesWithRowLevels[level][j][endTime]().getTime()) ||
						(shape[startTime]().getTime() === shapesWithRowLevels[level][j + 1][startTime]().getTime() && shape[endTime]().getTime() === shapesWithRowLevels[level][j + 1][endTime]().getTime()))) {
						//check if incoming shape to be plotted can be plotted in-between the shapes of a level
						shapesWithRowLevels[level].push(shape);
						exitShapeTraversingLoop = true;
					} else if (j === shapesWithRowLevels[level].length - 1 &&
						(shape[startTime]() >= shapesWithRowLevels[level][j][endTime]() ||
						(shape[startTime]() < shapesWithRowLevels[level][j][endTime]() && ((shapesWithRowLevels[level][j][endTime]() - shape[startTime]()) <= 1000))) &&
						!(shape[startTime]().getTime() === shapesWithRowLevels[level][j][startTime]().getTime() && shape[endTime]().getTime() === shapesWithRowLevels[level][j][endTime]().getTime())) {
						//check if incoming shape to be plotted can be plotted after the last shapes of a level
						shapesWithRowLevels[level].push(shape);
						exitShapeTraversingLoop = true;
					} else if (shape[startTime]().getTime() === shapesWithRowLevels[level][j][startTime]().getTime() && shape[endTime]().getTime() === shapesWithRowLevels[level][j][endTime]().getTime()) {
						//check if incoming shape to be plotted has exactly the same start and end time of the existing shapes
						if (parseInt(level, 10) === Object.keys(shapesWithRowLevels).length - 1) {
							shapesWithRowLevels[parseInt(level, 10) + 1] = [shape];
							exitShapeTraversingLoop = true;
						} else {
							exitShapeTraversingLoop = false;
						}
					} else {
						if (j === shapesWithRowLevels[level].length - 1 && parseInt(level, 10) === Object.keys(shapesWithRowLevels).length - 1) {
							//plot shape in next level if no space has been found in all the levels
							shapesWithRowLevels[parseInt(level, 10) + 1] = [shape];
							exitShapeTraversingLoop = true;
						} else {
							//continue traversing shapesWithRowLevels object to find space for incoming shape
							exitShapeTraversingLoop = false;
						}
					}
				} else {
					//if shapesWithRowLevels object has only one shape in a level
					if (((shape[startTime]() >= shapesWithRowLevels[level][j][endTime]()
					 || (shape[startTime]() < shapesWithRowLevels[level][j][endTime]() && ((shapesWithRowLevels[level][j][endTime]() - shape[startTime]()) <= 1000))) ||
					(shape[endTime]() <= shapesWithRowLevels[level][j][startTime]() || (shape[endTime]() > shapesWithRowLevels[level][j][startTime]() && ((shape[endTime]() - shapesWithRowLevels[level][j][startTime]()) <= 1000)))) &&
					!(shape[startTime]().getTime() === shapesWithRowLevels[level][j][startTime]().getTime() && shape[endTime]().getTime() === shapesWithRowLevels[level][j][endTime]().getTime())) {
						//check if incoming shape to be plotted can be plotted before or after the shape of a level
						shapesWithRowLevels[level].push(shape);
						exitShapeTraversingLoop = true;
					} else if (shape[startTime]().getTime() === shapesWithRowLevels[level][j][startTime]().getTime() && shape[endTime]().getTime() === shapesWithRowLevels[level][j][endTime]().getTime()) {
						//check if incoming shape to be plotted has exactly the same start and end time of the existing shapes
						if (parseInt(level, 10) === Object.keys(shapesWithRowLevels).length - 1) {
							shapesWithRowLevels[parseInt(level, 10) + 1] = [shape];
							exitShapeTraversingLoop = true;
						} else {
							exitShapeTraversingLoop = false;
						}
					} else {
						if (parseInt(level, 10) === Object.keys(shapesWithRowLevels).length - 1) {
							//plot shape in next level if no space is found in all the levels
							shapesWithRowLevels[parseInt(level, 10) + 1] = [shape];
							exitShapeTraversingLoop = true;
						} else {
							//continue traversing shapesWithRowLevels object to find space for incoming shape
							exitShapeTraversingLoop = false;
						}
					}
				}
				if (exitShapeTraversingLoop) {
					//exit traversing shapesWithRowLevels object when space is found
					j = shapesWithRowLevels[level].length;
					exitRowTraversingLoop = true;
					shapesWithRowLevels = this.sortShapesByTime(shapesWithRowLevels, level, startTime);		//sort shapes in a level by ascending time property
				}
			}
		},

		sortShapesByTime: function (sortedShapesWithRowLevels, level, startTime) {
			//sort shapes in a level by ascending time property
			var length = sortedShapesWithRowLevels[level].length;
			var swapped;
			do {
				swapped = false;
				for (var i = 0; i < length; i++) {
					if (sortedShapesWithRowLevels[level][i + 1] !== undefined) {
						if (sortedShapesWithRowLevels[level][i][startTime]() > sortedShapesWithRowLevels[level][i + 1][startTime]()) {
							var temp = sortedShapesWithRowLevels[level][i];
							sortedShapesWithRowLevels[level][i] = sortedShapesWithRowLevels[level][i + 1];
							sortedShapesWithRowLevels[level][i + 1] = temp;
							swapped = true;
						}
					}
				}
			} while (swapped);
			return sortedShapesWithRowLevels;
		},
		/**
		 * This method partitions the shapes into overlapping ranges
		 * @param {array} shapes array of shapes
		 * @param {string} startTimeProperty start time on Gantt chart
		 * @param {string} endTimeProperty end time on Gantt chart
		 * @returns {array} array of array of shapes
		 * @private
		 */
		_partitionShapesIntoOverlappingRanges: function (shapes, startTimeProperty, endTimeProperty) {
			shapesWithRowLevels = {};
			var sGetStartTime = "get" + startTimeProperty.charAt(0).toUpperCase() + startTimeProperty.slice(1);
			var sGetEndTime = "get" + endTimeProperty.charAt(0).toUpperCase() + endTimeProperty.slice(1);
			if (shapes.length > 0) {
				shapesWithRowLevels[0] = [shapes[0]];
			}
			for (var i = 1, l = shapes.length; i < l; i++) {
				//traverse shapes to be plotted
				exitRowTraversingLoop = false;
				for (var level in shapesWithRowLevels) {
					this.findSpaceInLevel(level, shapes[i], sGetStartTime, sGetEndTime);
				}
			}
			return shapesWithRowLevels;
		},

		/**
		 * This method calculates the level of shapes based on start and end time
		 * @param {sap.gantt.simple.BaseShape} allShapes on Gantt chart
		 * @param {string} startTimeProperty start time on Gantt chart
		 * @param {string} endTimeProperty end time on Gantt chart
		 * @returns {object} oResult which contains shapes with the level assigned and maximum level of the shapes
		 */
		calculateLevelForShapes: function (allShapes, startTimeProperty, endTimeProperty) {
			var fnFlatten = function (arr) {
				return arr.reduce(function (flat, toFlatten) {
					return flat.concat(
						Array.isArray(toFlatten) ? fnFlatten(toFlatten) : toFlatten
					);
				}, []);
			};

			var aRanges = this._partitionShapesIntoOverlappingRanges(allShapes, startTimeProperty, endTimeProperty);
			var iMaxLevel = 0;
			var aRangesUpdated = Object.values(aRanges).map(function (shapeGroup, index) {
				shapeGroup.map(function (shape) {
					var iLevel = index + 1;
					if (shape._setLevel) {
						shape._setLevel(iLevel);
					}
					shape._level = iLevel;

					if (iMaxLevel < iLevel) {
						iMaxLevel = iLevel;
					}
					return shape;
				});
				return shapeGroup;
			});

			var aShapes = fnFlatten(aRangesUpdated);
			var oResult = {
				shapes: aShapes,
				maxLevel: iMaxLevel
			};
			return oResult;
		},

			/**
			 * This method partitions the lines into overlapping ranges
			 * @param {array} lines array of lines
			 * @returns {array} array of array of lines
			 * @private
			 */
			_partitionLinesIntoOverlappingRanges: function (lines) {
				lines.sort(function (a, b) {
					if (a.getTimeStamp() < b.getTimeStamp()) { return -1; }
					if (a.getTimeStamp() > b.getTimeStamp()) { return 1; }
					return 0;
				});
				var fnGetMaxEnd = function (ar) {
					if (ar.length == 0) { return false; }
					ar.sort(function (a, b) {
						var sMEnd;
						if (a instanceof sap.gantt.simple.AdhocLine) {
							sMEnd = a.getTimeStamp();
						} else {
							sMEnd = a.getEndTimeStamp();
						}

						var sNEnd;
						if (b instanceof sap.gantt.simple.AdhocLine) {
							sNEnd = b.getTimeStamp();
						} else {
							sNEnd = b.getEndTimeStamp();
						}

						if (sMEnd < sNEnd) { return 1; }
						if (sMEnd > sNEnd) { return -1; }
						return 0;
					});

					if (ar[0] instanceof sap.gantt.simple.AdhocLine) {
						return ar[0].getTimeStamp();
					} else {
						return ar[0].getEndTimeStamp();
					}
				};
				var aRarray = [];
				var iIndex = 0;
				if (lines.length > 0) {
					aRarray[iIndex] = [lines[0]];
				}

				for (var i = 1, l = lines.length; i < l; i++) {
					if (
						lines[i].getTimeStamp() >= lines[i - 1].getTimeStamp() &&
						lines[i].getTimeStamp() < fnGetMaxEnd(aRarray[iIndex])
					) {
						aRarray[iIndex].push(lines[i]);
					} else {
						iIndex++;
						aRarray[iIndex] = [lines[i]];
					}
				}
				return aRarray;
			},

			/**
			 * This method calculates the level of markers for lines to be drawn on header
			 * @param {sap.gantt.simple.AdhocLine} aAdhocLines on Gantt chart
			 * @param {sap.gantt.simple.DeltaLine} aDeltaLines on Gantt chart
			 * @returns {object} oResult which contains lines with level assigned and maximum level of the lines together
			 */
			calculateLevelForMarkers: function (aAdhocLines, aDeltaLines) {
				var fnFlatten = function (arr) {
					return arr.reduce(function (flat, toFlatten) {
						return flat.concat(
							Array.isArray(toFlatten) ? fnFlatten(toFlatten) : toFlatten
						);
					}, []);
				};

				var aAllLines = aAdhocLines.concat(aDeltaLines);
				var aRanges = this._partitionLinesIntoOverlappingRanges(aAllLines);
				var iMaxLevel = 0;
				var aRangesUpdated = aRanges.map(function (subarr) {
					subarr.map(function (row, index) {
						var iLevel = index + 1;
						row._setLevel(iLevel);
						if (iMaxLevel < iLevel) {
							iMaxLevel = iLevel;
						}
						return row;
					});
					return subarr;
				});

				var aAllLinesUpd = fnFlatten(aRangesUpdated);
				var oResult = {
					adhocLines: aAllLinesUpd.filter(function (line) {
						if (sap.gantt.simple.AdhocLine) {
							return line instanceof sap.gantt.simple.AdhocLine;
						}
					}),
					deltaLines: aAllLinesUpd.filter(function (line) {
						if (sap.gantt.simple.DeltaLine) {
							return line instanceof sap.gantt.simple.DeltaLine;
						}
					}),
					maxLevel: iMaxLevel
				};
				return oResult;
			},

			/**
			 * Gets all the immediate successor shapes
			 * @param {object} oShape shape's instance
			 * @param {sap.gantt.simple.GanttChartWithTable} oGantt Gantt's instance
			 * @returns {array} array of the successor shapes
			 */
			getShapeSuccessors: function(oShape, oGantt) {
				var aShapesToSelect = [];

				// Get successors only if chain selection is enabled for the shape
				if (oShape.getEnableChainSelection()) {
					var aVisibleRls = this._getVisibleRelationships(oGantt);
					var aAssociatedRls = aVisibleRls.filter(function(x){
						return  x.getPredecessor() === oShape.getShapeId();
					});

					aAssociatedRls.forEach(function(rel){
						var mShape = rel.getRelatedInRowShapes(oGantt.getId());
						if (mShape.successor) {
							aShapesToSelect.push(mShape.successor);
						}
					});
					aShapesToSelect = Array.from(new Set(aShapesToSelect));
				}
				return aShapesToSelect;
			},

			/**
			 * Gets all the immediate predecessor shapes
			 * @param {object} oShape shape's instance
			 * @param {sap.gantt.simple.GanttChartWithTable} oGantt Gantt's instance
			 * @returns {array} array of the predecessor shapes
			 */
			getShapePredeccessors: function(oShape, oGantt) {
				var aShapesToSelect = [];

				// Get predecessors only if chain selection is enabled for the shape
				if (oShape.getEnableChainSelection()) {
					var aVisibleRls = this._getVisibleRelationships(oGantt);
					var aAssociatedRls = aVisibleRls.filter(function(x){
						return  x.getSuccessor() === oShape.getShapeId();
					});

					aAssociatedRls.forEach(function(rel){
						var mShape = rel.getRelatedInRowShapes(oGantt.getId());
						if (mShape.predecessor) {
							aShapesToSelect.push(mShape.predecessor);
						}
					});
					aShapesToSelect = Array.from(new Set(aShapesToSelect));
				}

				return aShapesToSelect;
			},

			/**
			 * Selects a shape along with its successors and predecessors
			 * @param {object} mParam shape's instance and event parameters
			 * @param {sap.gantt.GanttChartWithTable} oGantt GanttChart's instance
			 * @returns {array} aShapes the array of shapes which got selected
			 */
			selectAssociatedShapes: function(mParam, oGantt) {
				var oSelectedShape = mParam.shape;
				var oDragDropExtension = oGantt._getDragDropExtension();
				var bNewSelected = !oSelectedShape.getSelected();

				// Check if primary shape is selected or deselected
				if (oDragDropExtension.shapeSelectedOnMouseDown && !oDragDropExtension.initiallySelected && !oGantt.getEnableSelectAndDrag()){
					bNewSelected = oDragDropExtension.shapeSelectedOnMouseDown;
				}

				// Fetch shapes that are required to be changed
				var aShapes = [oSelectedShape];
				if (oSelectedShape.getEnableChainSelection()) {
					aShapes = this._getShapesToSelect(oSelectedShape, oGantt);
					// Update them based on selected flag
					aShapes.forEach(function(shape){
						this.oSelection.updateShape(shape.getShapeUid(), {
							selected: bNewSelected,
							ctrl: true,
							draggable: shape.getDraggable(),
							time: shape.getTime(),
							endTime: shape.getEndTime()
						});
					}.bind(oGantt));
				}
				return aShapes;
			},

			/**
			 * Gets all the immediate shapes related to the shape to be selected
			 * @param {object} oSelectedShape shape's instance
			 * @param {sap.gantt.simple.GanttChartWithTable} oGantt Gantt's instance
			 * @returns {array} array of the successor shapes
			 * @private
			 */
			_getShapesToSelect: function(oSelectedShape, oGantt) {
				var aShapesToSelect = [oSelectedShape];
				var aVisibleRls = this._getVisibleRelationships(oGantt);

				// Getting the related first level relationships
				var aAssociatedRls = aVisibleRls.filter(function(x){
					return  x.getPredecessor() === oSelectedShape.getShapeId() || x.getSuccessor() === oSelectedShape.getShapeId();
				});

				// Extract shapes from associated relationships
				aAssociatedRls.forEach(function(rel){
					var mShape = rel.getRelatedInRowShapes(oGantt.getId());
					if (mShape.predecessor && mShape.predecessor.getSelectableInChainSelection()) {
						aShapesToSelect.push(mShape.predecessor);
					}
					if (mShape.successor && mShape.successor.getSelectableInChainSelection()) {
						aShapesToSelect.push(mShape.successor);
					}
				});

				// Remove duplicates, if any
				aShapesToSelect = Array.from(new Set(aShapesToSelect));
				return aShapesToSelect;
			},

			/**
			 * Gets all the visible relationships on the Gantt
			 * @param {sap.gantt.simple.GanttChartWithTable} oGantt Gantt's instance
			 * @returns {array} array of the all visible relatioships on the GanttChart
			 * @private
			 */
			_getVisibleRelationships: function(oGantt){
				var aRelationships = [];
				oGantt.getTable().getRows().forEach(function(row){
					var aRls = row.getAggregation('_settings').getRelationships();
					aRelationships = aRelationships.concat(aRls);
				});
				aRelationships = Array.from(new Set(aRelationships));
				return aRelationships;
			},

			/**
			 * Rerender all relationships associated with the shape
			 * @param {sap.gantt.simple.GanttChartWithTable} oGantt Gantt's instance
			 * @param {object} oShape shape's intance
			 */
			rerenderAssociatedRelationships: function (oGantt, oShape) {
				var oRm = Core.createRenderManager();
				var allConnectedRelationships = [];
				var aVisibleRls = this._getVisibleRelationships(oGantt);
				aVisibleRls.forEach(function (x) {
					if (x.getSuccessor() === oShape.getShapeId() || x.getPredecessor() === oShape.getShapeId()) {
						allConnectedRelationships.push(x);
					}
				});
				allConnectedRelationships.forEach(function (oRlsInst) {
					oRlsInst.renderElement(oRm, oRlsInst, oGantt.getId());
				});
			},

			/**
			 * filter out Dulicate and 'None' Shape Types.
			 * @param {Array} shapeTypes list.
			 * @returns {Array} Filtered List.
			 */
			getFilteredShapeType: function (shapeTypes) {
				shapeTypes = Array.from(new Set(shapeTypes));
				return shapeTypes.filter(function (val) {
					return val !== "None";
				});

			},

			/**
		 	* Takes path with sharp corners and bends them using cubic curves.
		 	* @param {string} sPath path with sharp edges.
		 	* @param {number} fRadius arc radius of bent corners.
		 	* @returns {string} Path with bent corners.
		 	*/
			 getPathCorners: function (sPath, fRadius ) {
				var sTemp = sPath.replace(/([A-Z])/g, ' $1');
				var aResultSteps = [],
				sResult;
				var aPathParts = sTemp.split(/[,\s]/).reduce(function (aParts, sPart) {
				var a = sPart.match("([a-zA-Z])(.+)");
				if (a) {
					aParts.push(a[1]);
					aParts.push(a[2]);
				} else {
					aParts.push(sPart);
				}

				return aParts;
			}, []);

			//Spliting path to each steps
			var aSteps = aPathParts.reduce(function (aSteps, fPart) {
				if (parseFloat(fPart) == fPart && aSteps.length) {
					aSteps[aSteps.length - 1].push(fPart);
				} else {
					aSteps.push([fPart]);
				}

				return aSteps;
			}, []);

			//generates new coordinates for start and end points of curve
			function fnShiftInDirection(oPointFrom, oPointTo, fMagnitude) {
				var fDiffX = oPointTo.x - oPointFrom.x;
				var fDiffY = oPointTo.y - oPointFrom.y;
				var fDist = Math.sqrt(fDiffX * fDiffX + fDiffY * fDiffY);

				return fnPartialShiftInDirection(
					oPointFrom,
					oPointTo,
					Math.min(1, fMagnitude / fDist)
				);
			}

			function fnPartialShiftInDirection(oPointFrom, oPointTo, fPart) {
				return {
					x: oPointFrom.x + (oPointTo.x - oPointFrom.x) * fPart,
					y: oPointFrom.y + (oPointTo.y - oPointFrom.y) * fPart
				};
			}

			// adjusting steps array after adding curved coordinated
			function fnAdjustStep(aStep, oPoint) {
				if (aStep.length > 2) {
					aStep[aStep.length - 2] = oPoint.x;
					aStep[aStep.length - 1] = oPoint.y;
				}
			}

			function fnGetPointOfStep(aStep) {
				return {
					x: parseFloat(aStep[aStep.length - 2]),
					y: parseFloat(aStep[aStep.length - 1])
				};
			}

			if (aSteps.length > 1) {
				var oStartPoint = fnGetPointOfStep(aSteps[0]),
					aCloseLine = null;

				if (aSteps[aSteps.length - 1][0] == "Z" && aSteps[0].length > 2) {
					aCloseLine = ["L", oStartPoint.x, oStartPoint.y];
					aSteps[aSteps.length - 1] = aCloseLine;
				}

				aResultSteps.push(aSteps[0]);

				for (var iStep = 1; iStep < aSteps.length; iStep++) {
					var aPrevStep = aResultSteps[aResultSteps.length - 1],
						aCurrStep = aSteps[iStep],
						aNextStep = aCurrStep == aCloseLine ? aSteps[1] : aSteps[iStep + 1],
						fShiftedRadius = fRadius;
					if (
						aNextStep &&
						aPrevStep &&
						aPrevStep.length > 2 &&
						aCurrStep[0] == "L" &&
						aNextStep.length > 2 &&
						aNextStep[0] == "L"
					) {
						var oPrevPoint = fnGetPointOfStep(aPrevStep),
							oCurrPoint = fnGetPointOfStep(aCurrStep),
							oNextPoint = fnGetPointOfStep(aNextStep),
							oCurveStart,
							oCurveEnd,
							fPrevDistance = Math.abs(oPrevPoint.x - oCurrPoint.x) +
											Math.abs(oPrevPoint.y - oCurrPoint.y),
							fNextDistance = Math.abs(oNextPoint.x - oCurrPoint.x) +
											Math.abs(oNextPoint.y - oCurrPoint.y),
							fRadiusToUse = Math.max(Math.min(fShiftedRadius, fPrevDistance, fNextDistance / 2) , 1);

						oCurveStart = fnShiftInDirection(oCurrPoint, oPrevPoint, fRadiusToUse );
						oCurveEnd = fnShiftInDirection( oCurrPoint, oNextPoint, fRadiusToUse );

						fnAdjustStep(aCurrStep, oCurveStart);
						aCurrStep.origPoint = oCurrPoint;
						aResultSteps.push(aCurrStep);

						var oStartControl = fnPartialShiftInDirection(
								oCurveStart,
								oCurrPoint,
								0.5
							),
							oEndControl = fnPartialShiftInDirection(
								oCurrPoint,
								oCurveEnd,
								0.5
							),
							aCurveStep = [
								"C",
								oStartControl.x,
								oStartControl.y,
								oEndControl.x,
								oEndControl.y,
								oCurveEnd.x,
								oCurveEnd.y
							];

						aCurveStep.origPoint = oCurrPoint;
						aResultSteps.push(aCurveStep);
					} else {
						aResultSteps.push(aCurrStep);
					}
				}

				if (aCloseLine) {
					var oNewStartPoint = fnGetPointOfStep(
						aResultSteps[aResultSteps.length - 1]
					);
					aResultSteps.push(["Z"]);
					fnAdjustStep(aResultSteps[0], oNewStartPoint);
				}
			} else {
				aResultSteps = aSteps;
			}

			sResult = aResultSteps.reduce(function (s, c) {
				return s + c.join(" ") + " ";
			}, "");

			return sResult;
			 },

			 arrayMove: function(arr, oldIdx, newIdx){
				if (newIdx >= arr.length) {
					var k = newIdx - arr.length + 1;
					while (k--) {
						arr.push(undefined);
					}
				}
				arr.splice(newIdx, 0, arr.splice(oldIdx, 1)[0]);
				return arr;
			 },
			//Determines the length to have a bend.
			getEdgePoint: function (oGantt) {
				var edgePoint = 2;
				var existingShapes = ["Arrow", "None"];
				var aVisibleRls = this._getVisibleRelationships(oGantt);
				aVisibleRls.forEach(function (x) {
					if (x.getPredecessor() !== undefined && x.getSuccessor() !== undefined && (x.getShapeTypeStart() !== "None" || existingShapes.indexOf(x.getShapeTypeEnd()) == -1) || oGantt.getRelationshipShapeSize() ==  sap.gantt.simple.relationshipShapeSize.Large) {
						edgePoint = 3;
					}
				});
				return edgePoint;
			},
			/**
			 * get time label using x coordinate
			 * @param oEvent
			 * @param oAxisTime
			 * @param oLocale
			 * @param svg
			 */
			getTimeLabel : function (oEvent, oAxisTime, oLocale, svg) {
				var mPoint = CoordinateUtils.getEventSVGPoint(svg, oEvent),
					sTimeStamp = Format.dateToAbapTimestamp(oAxisTime.viewToTime(mPoint.x)),
					oLocalTime = Format._convertUTCToLocalTime(sTimeStamp, oLocale),
					oZoomStrategy = oAxisTime.getZoomStrategy();
				var sLabel = oZoomStrategy.getLowerRowFormatter().format(oLocalTime);
				return Utility.getLowerCaseLabel(sLabel);
			},

			/**
			 * Find and return all visual elements.
			 * i.e. shapes, adhoclines, deltalines, non-working time etc.
			 * @param {DOM} oSvg Dom refernce of ganttSvg.
			 * @param {string} parentSelector parent selector of visual element.
			 * @param {string} elementSelector selector of the element.
			 * @returns {array} list of visual elements.
			 */
			getVisibleElements: function(oSvg, parentSelector, elementSelector) {
				return Array.from(oSvg.querySelectorAll(parentSelector)).
						reduce(function(acc,item) {
							return acc.concat(Array.from(item.querySelectorAll(elementSelector)));
						},[]);
			},

			/**
			 * return true if horizontalTextAlignment for shape or calendar is dynamic
			 * @returns {boolean}
			 */
			isDynamicText : function () {
				var horizontalTextAlignment = library.simple.horizontalTextAlignment;
				var dynamicText = false;
				var aShapes = Array.from(document.querySelectorAll(".sapGanttChartSvg .sapGanttChartShapes .baseShapeSelection")).filter(function(shape){
					if (!shape.classList.contains("sapGanttTextNoPointerEvents") && shape.tagName != "text"){
						return shape;
					}
				});

				aShapes.forEach(function(oHtmlShape) {
					var iUid = oHtmlShape.closest("[data-sap-ui]").getAttribute("data-sap-ui");
					var oShape = Core.byId(iUid);
					if (oShape && !dynamicText) {
						if (oShape instanceof sap.gantt.simple.BaseConditionalShape) {
							var oActiveShape = oShape._getActiveShapeElement();

							if (oActiveShape instanceof sap.gantt.simple.BaseGroup) {
								oActiveShape.getShapes().forEach(function(oShape) {
									if (oShape.getHorizontalTextAlignment() === horizontalTextAlignment.Dynamic) {
										dynamicText = true;
									}
								});
							} else {
								if (oShape.getHorizontalTextAlignment() === horizontalTextAlignment.Dynamic) {
									dynamicText = true;
								}
							}
						} else if (oShape instanceof sap.gantt.simple.MultiActivityGroup) {
							if (oShape.getTask().getHorizontalTextAlignment() === horizontalTextAlignment.Dynamic) {
								dynamicText = true;
							}
						} else if (oShape instanceof sap.gantt.simple.BaseGroup) {
							oShape.getShapes().forEach(function(oShape) {
								if (oShape.getHorizontalTextAlignment() === horizontalTextAlignment.Dynamic) {
									dynamicText = true;
								}
							});
						} else {
							if (oShape.getHorizontalTextAlignment() === horizontalTextAlignment.Dynamic) {
								dynamicText = true;
							}
						}
					}
				});

				if (!dynamicText) {
					var aCalenders = Array.from(document.querySelectorAll(".sapGanttChartSvg .sapGanttChartCalendar .baseShapeSelection")).filter(function(calendar){
						if (!calendar.classList.contains("sapGanttTextNoPointerEvents") && calendar.tagName != "text"){
							return calendar;
						}
					});

					aCalenders.forEach(function(oHtmlCalendar) {
						if (!dynamicText) {
							var iUid = oHtmlCalendar.closest("[data-sap-ui]").getAttribute("data-sap-ui");
							var oCalendar = Core.byId(iUid);
							if (oCalendar.getHorizontalTextAlignment() === horizontalTextAlignment.Dynamic) {
								dynamicText = true;
							}
						}
					});
				}

				return dynamicText;
			},

			/**
			 * Sets Lmarker value for relationship instance
			 */
			setLmarker: function(oGantt,oRlsInst,bFlag) {
				var x1 = oRlsInst.mAnchors.predecessor.x, y1 = oRlsInst.mAnchors.predecessor.y;
				var x2 = oRlsInst.mAnchors.successor.x, y2 = oRlsInst.mAnchors.successor.y;
				oRlsInst.setProperty("_lMarker", "", true);
				var vType = oRlsInst.getProcessedType();
				var edgePoint = oGantt._edgePoint;
				if (vType === 1 && x1 <= x2 ) {
					if (Core.getConfiguration().getRTL() ? oRlsInst.getLShapeForTypeSF() : oRlsInst.getLShapeForTypeFS()) {
							if ((edgePoint == 2 && oRlsInst.getShapeTypeStart() == 'None') ||
								(edgePoint == 3 && Math.abs(x1 - x2) >= edgePoint * 6)) {
								// Determining up or down connection
								if (y1 > y2) {
									oRlsInst.setProperty("_lMarker", "rightUp", true);
								} else {
									oRlsInst.setProperty("_lMarker", "rightDown", true);
							}
						}
					 }
					} else 	if (vType === 2 && x1 >= x2 ) {
						if (Core.getConfiguration().getRTL() ? oRlsInst.getLShapeForTypeFS() : oRlsInst.getLShapeForTypeSF()) {
							if ((edgePoint == 2 && oRlsInst.getShapeTypeStart() == 'None') ||
								(edgePoint == 3 && Math.abs(x1 - x2) >= edgePoint * 6)) {
								// Determining up or down connection
								if (y1 > y2) {
									oRlsInst.setProperty("_lMarker", "leftUp", true);
								} else {
									oRlsInst.setProperty("_lMarker", "leftDown", true);
								}
							}
						}
					}
					if (bFlag){
						oGantt.relSet[oRlsInst.getShapeId()] = oRlsInst;
					}else {
						oGantt.relSetFake[oRlsInst.getShapeId()] = oRlsInst;
					}

			},
			/**
			 * Calculates shape groups after edit operations performed on shapes inside pseudo shape.
			 */
			pseudoShapeGroupAfterEdit: function(oGantt, trowIndex){
				var aShapeGroups = [], iGroupIndex = 0,  aExpandedShapeIds = oGantt.oOverlapShapeIds && oGantt.oOverlapShapeIds[trowIndex];
				if (aExpandedShapeIds){
					if (aExpandedShapeIds[0]){
						var oShape = GanttUtils.getShapeByShapeId(oGantt.getId(), [aExpandedShapeIds[0]])[0];
						oShape && aShapeGroups.push({
							iShapeCount: 1,
							startTime: oShape.getTime(),
							endTime: oShape.getEndTime()
						});
					}
					for (var i = 1; i < aExpandedShapeIds.length; i++) {
						var oOperation = GanttUtils.getShapeByShapeId(oGantt.getId(), [aExpandedShapeIds[i]])[0];
						if (oOperation){
							var dShapeStartTime = oOperation.getTime(),
							dShapeEndTime = oOperation.getEndTime(),
							oShapeGroup = aShapeGroups[iGroupIndex],
							dExistingShapeStartTime = oShapeGroup.startTime,
							dExistingShapeEndTime = oShapeGroup.endTime;
							if (dShapeStartTime >= dExistingShapeStartTime && dShapeEndTime <= dExistingShapeEndTime) {
								//fully coinciding do nothing to pseudo shape's start and end time
								oShapeGroup.iShapeCount ++;
							} else if (dShapeStartTime >= dExistingShapeStartTime && dShapeStartTime < dExistingShapeEndTime && dShapeEndTime > dExistingShapeEndTime) {
								//when incoming shape partially coincides with pseudo shape
								oShapeGroup.iShapeCount++;
								//update pseudo shape's end time as the incoming shape's end time
								oShapeGroup.endTime = dShapeEndTime;
							} else if (dShapeStartTime >= dExistingShapeEndTime && dShapeEndTime >= dExistingShapeEndTime) {
								//for new pseudo shape, add corresponding object
								iGroupIndex++;
								aShapeGroups.push({
									iShapeCount: 1,
									startTime: dShapeStartTime,
									endTime: dShapeEndTime
								});
							}
						}
					}
				}
				return aShapeGroups;
			},

			/**
			 * Checks if relation instant is valid to be rendered
			 * @returns {boolean}
			 */
			relationexist: function(oGantt,oRlsInst){
				oRlsInst.mRelatedShapes = oRlsInst.getRelatedInRowShapes(oGantt.getId());
				var vType = oRlsInst.getProcessedType();
				oRlsInst.mAnchors = oRlsInst.getRlsAnchors(vType, oRlsInst.mRelatedShapes);
				if (!oRlsInst.getVisible()) { return false; }
				if (!oRlsInst.mRelatedShapes.predecessor && !oRlsInst.mRelatedShapes.successor) { return false; }
				var fnCheckAnchors = function(oAnchor) {
					return !isNaN(parseFloat(oAnchor.x)) && isFinite(oAnchor.x) &&  !isNaN(parseFloat(oAnchor.y)) && isFinite(oAnchor.y);
				};
				if (!fnCheckAnchors(oRlsInst.mAnchors.predecessor) || !fnCheckAnchors(oRlsInst.mAnchors.successor)) {
					return false;
				}
				return true;
			}
	};

	return GanttUtils;

}, /* bExport= */ true);
