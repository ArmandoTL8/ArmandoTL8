/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define([
	"./MultiActivityGroup",
	"sap/gantt/simple/BaseRectangle",
	"sap/ui/core/theming/Parameters",
	"sap/gantt/simple/BaseImage",
    "sap/gantt/def/gradient/LinearGradient",
    "sap/gantt/misc/Format",
    "sap/gantt/def/gradient/Stop",
    "sap/ui/core/Core",
    "sap/gantt/library"
], function (MultiActivityGroup, BaseRectangle, Parameters, BaseImage, LinearGradient, Format, Stop, Core, library) {
	"use strict";
	/**
	 * Creates and initializes a new BasePseudoShape class.
	 *
	 * @param {string} [sId] This is the ID of the new control. It is generated automatically if an ID is not provided.
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Base PseudoShape class uses SVG tag 'g'. It is a shape container. Any other shapes can be aggregated under this group. This extends from the MultiActivityGroup.
	 *
	 * @extends sap.gantt.simple.MultiActivityGroup
	 *
	 * @author SAP SE
	 * @version 1.111.0
	 * @since 1.109
	 *
	 * @constructor
	 * @private
	 * @alias sap.gantt.simple.BasePseudoShape
	 */
	var BasePseudoShape = MultiActivityGroup.extend("sap.gantt.simple.BasePseudoShape", {
		metadata: {
			properties: {
				/**
				 * The title of pseudo shape when it is expanded
				 * @private since 1.110
				 */
				expandTitle: {
					type: "string",
					defaultValue: "Show Details"
				},

				/**
				 * The title of pseudo shape when it is collapsed
				 * @private since 1.110
				 */
				collapseTitle: {
					type: "string",
					defaultValue: "Show Less"
				},

				/**
				 * The color for overlap indicator/gradient part.
				 * @private since 1.110
				 */
				overlapFill: {
					type: "sap.gantt.ValueSVGPaintServer",
					defaultValue: "@sapChart_OrderedColor_11"
				},
				/**
				 * The color for pseudo shape.
				 * @private since 1.110
				 */
				fill: {
					type: "sap.gantt.ValueSVGPaintServer",
					defaultValue: "@sapChart_OrderedColor_1"
				},

				/**
				 * Explains how the overlapping shapes are indicated, such as in the form of a gradient, indicator or both
				 * @private since 1.110
				 */
				typeOfOverlapIndicator:{
					type: "string", defaultValue: library.simple.typeOfOverlapIndicator.Gradient
				}
			},
			aggregations: {
				/**
				 *  Button to expand or collapse the pseudo shape
				 * @private since 1.110
				 */
				button: {
					type: "sap.gantt.simple.BaseShape",
					sapGanttOrder: 2
				}
			}
		}
	});
	/**
	 * Handles the expanding and collapsing function when the pseudo shape is clicked
	 *
	 * @param {object} oEvent Pseudo shape click event data
	 * @private
	 */
	BasePseudoShape.prototype.onclick = function (oEvent) {
		if (oEvent && oEvent.target.getAttribute("class").indexOf("pseudoShapeIcon") == -1) {
			return;
		}
		var oGantt = this.getGanttChartBase();
		var oTable = oGantt.getTable();
		var oRowSettingsTemplate = oTable.getRowSettingsTemplate();
		var aRows = oTable.getRows();
		var iRowIndex = this.getParentRowSettings().getParent().getIndex() - aRows[0].getIndex();
		var oRow = aRows[iRowIndex];
		oGantt.oOverlapShapeIds = oGantt.oOverlapShapeIds ? oGantt.oOverlapShapeIds : {};
		var oOverlapShapeIdsInRow = oGantt.oOverlapShapeIds && oGantt.oOverlapShapeIds[oRow.getIndex()] ? oGantt.oOverlapShapeIds && oGantt.oOverlapShapeIds[oRow.getIndex()] : [];
		var bIsExpandRequired = (this.aShapeIds.length > 0 && (oOverlapShapeIdsInRow.length == 0 || this.aShapeIds.indexOf(oOverlapShapeIdsInRow[0]) == -1));
		var iIndex = oRow.getIndex();
		var sScheme;
		if (oOverlapShapeIdsInRow && oGantt._aExpandedIndices.length > 0 && oGantt._aExpandedIndices.indexOf(iIndex) > -1) {
			oGantt._collapse(sScheme, iIndex, true);
		}

		if (bIsExpandRequired) {
			var sModelName = oTable.getBindingInfo("rows").model;
			var oTaskBindingInfo = oRowSettingsTemplate.getBindingInfo("tasks");
			var oSettings = oRow.getAggregation("_settings");
			var iCloneIndex = oSettings.getAggregation("tasks").length;
			oGantt.oOverlapShapeIds[oRow.getIndex()] = [];
			this.aShapeContexts.forEach(function (oContext) {
				var oClone = oTaskBindingInfo.template.clone();
				oClone.setBindingContext(oContext, sModelName);
				oSettings.addAggregation("tasks", oClone, true);
				oGantt.oOverlapShapeIds[oRow.getIndex()].push(oSettings.getAggregation("tasks")[iCloneIndex].getShapeId());
				iCloneIndex++;
			});

			oGantt._expand(sScheme, iIndex, true);
		}
	};

	/**
	 * Creates a pseudo shape for the provided binding information
	 * @private
	 */
	BasePseudoShape.prototype._createPseudoShape = function (oShapeGroup, oTaskBindingInfo, oRow,oGantt,expanded) {
		var startTimeformatterMethod = oTaskBindingInfo.template.getBindingInfo("time").formatter;
		var endTimeformatterMethod = oTaskBindingInfo.template.getBindingInfo("endTime").formatter;
		var horizontalTextAlignment = sap.gantt.simple.horizontalTextAlignment,
			oPseudoShapeIcon;
			var obasePseudo = new BasePseudoShape();
		var createIcon = function (sIconSrc, oTask) {
			return new BaseImage({
				height: parseFloat(Parameters.get("sapUiChartAxisTitleFontSize"), 100) * 16,
				fontWeight: Parameters.get("sapUiChartTitleFontWeight"),
				src: sIconSrc,
				fill: Parameters.get("sapUiChartReferenceLineLabelColor"),
				horizontalTextAlignment: oTask.getHorizontalTextAlignment(),
				time: oTask.getTime(),
				endTime: oTask.getEndTime()
			});
		};
		obasePseudo.setAggregation("task", new BaseRectangle({
			time: startTimeformatterMethod ? startTimeformatterMethod.call(obasePseudo, oShapeGroup.startTime) : oShapeGroup.startTime,
			endTime: endTimeformatterMethod ? endTimeformatterMethod.call(obasePseudo, oShapeGroup.endTime) : oShapeGroup.endTime,
			horizontalTextAlignment: horizontalTextAlignment.Start,
			fontSize: parseFloat(Parameters.get("sapUiChartAxisTitleFontSize"), 100) * 16,
			fontWeight: Parameters.get("sapUiChartTitleFontWeight")
		}));
		var oTask = obasePseudo.getTask();
		oShapeGroup.overlaps.forEach(function (overlap) {
			if (obasePseudo.getTypeOfOverlapIndicator() != "Gradient") {
				oTask._iBaseRowHeight = oGantt._oExpandModel.getBaseRowHeight() ? oGantt._oExpandModel.getBaseRowHeight() : oTask._iBaseRowHeight;
				var iShapeHeight = oTask.getHeight();
				obasePseudo.addAggregation("indicators",  new BaseRectangle({
					time: startTimeformatterMethod ? startTimeformatterMethod.call(obasePseudo, overlap.startTime) : overlap.startTime,
					endTime: endTimeformatterMethod ? endTimeformatterMethod.call(obasePseudo, overlap.endTime) : overlap.endTime,
					yBias: iShapeHeight + 2
				}).addStyleClass("sapGanttPseudoShapeOverlapIndicatorStyle"));
			}
		});
		if (expanded && oGantt.oOverlapShapeIds && oGantt.oOverlapShapeIds[oRow.getIndex()] && oShapeGroup.aShapeIds && oShapeGroup.aShapeIds.some(function (shapeId) {
				return oGantt.oOverlapShapeIds[oRow.getIndex()].includes(shapeId);
			})) {
			oPseudoShapeIcon = createIcon("sap-icon://collapse", oTask);
			oTask.setTitle(obasePseudo.getCollapseTitle());
		} else {
			oPseudoShapeIcon = createIcon("sap-icon://expand", oTask);
			oTask.setTitle(obasePseudo.getExpandTitle());
		}
		oTask.setTitleColor(Parameters.get("sapUiChartReferenceLineLabelColor"));
		oPseudoShapeIcon.aCustomStyleClasses = ["pseudoShapeIcon"];
		obasePseudo.addAggregation("button", oPseudoShapeIcon);
		return obasePseudo;
	};

	/**
	 * Creates a linear gradient.
	 * @private
	 */
    BasePseudoShape.prototype._fnCreateLinearGradient = function (aPoints, oPseudoShape) {
		var aStops = [], shapeFill = oPseudoShape.shapeFill ? oPseudoShape.shapeFill : "@sapChart_OrderedColor_1",
		overlapIndicatorFill = oPseudoShape.overlapIndicatorFill ? oPseudoShape.overlapIndicatorFill : "@sapChart_OrderedColor_11";
		var bRtl = Core.getConfiguration().getRTL();
		if (bRtl){
			for (var i = aPoints.length - 1; i >= 0;i--){
				aStops.push(new Stop({
					offSet: String(100 - aPoints[i] + "%"),
					stopColor: (i % 2 == 0) ? overlapIndicatorFill : shapeFill
				}));
				aStops.push(new Stop({
					offSet: String(100 - aPoints[i - 1] + "%"),
					stopColor: (i % 2 == 0) ? overlapIndicatorFill : shapeFill
				}));
			}
		} else {
			for (var i = 0; i < aPoints.length - 1;i++){
				aStops.push(new Stop({
					offSet: String(aPoints[i] + "%"),
					stopColor: (i % 2 == 0) ? shapeFill : overlapIndicatorFill
				}));
				aStops.push(new Stop({
					offSet: String(aPoints[i + 1] + "%"),
					stopColor: (i % 2 == 0) ? shapeFill : overlapIndicatorFill
				}));
			}
		}
		return aStops;
	};
	/**
	 * Create shapes for the provided binding information from the context
	 * @private
	 */
	BasePseudoShape.prototype._createShapesFromContext = function(aContext, oRow,oTaskBindingInfo,oGantt,expanded,index, needGradientCalculations){
		var oSettings = oRow.getAggregation("_settings");
        var oAxisTime = oGantt.getAxisTime();
		var oPseudoShapeTemplate = oSettings.getPseudoShapeTemplate();
		var startTimeformatterMethod = oTaskBindingInfo.template.getBindingInfo("time").formatter;
		var endTimeformatterMethod = oTaskBindingInfo.template.getBindingInfo("endTime").formatter;
		var sModelName = oGantt.getTable().getBindingInfo("rows").model;
		// Getting start and end time and indicator binding.
		var oStartTimeBindingInfo = oTaskBindingInfo.template.getBindingInfo("time"),
		oEndTimeBindingIndo = oTaskBindingInfo.template.getBindingInfo("endTime"),
		oShapeIdBinding = oTaskBindingInfo.template.getBindingInfo("shapeId");
		var oShapePropertyPaths  = {
			endTime: oEndTimeBindingIndo.parts[0].path || oEndTimeBindingIndo.path,
			startTime: oStartTimeBindingInfo.parts[0].path || oStartTimeBindingInfo.path,
			shapeId: oShapeIdBinding.parts[0].path || oShapeIdBinding.path
		};
		var getIcon = function(sIconSrc, oTask){
			return new BaseImage( {
				height:parseFloat(Parameters.get("sapUiChartAxisTitleFontSize"), 100) * 16,
				fontWeight: Parameters.get("sapUiChartTitleFontWeight"),
				src: sIconSrc,
				fill: Parameters.get("sapUiChartReferenceLineLabelColor"),
				horizontalTextAlignment: oTask.getHorizontalTextAlignment(),
				time: oTask.getTime(),
				endTime: oTask.getEndTime()
			});
		};
		aContext.sort(function(oContext1, oContext2){return oContext1.getProperty(oShapePropertyPaths.startTime) - oContext2.getProperty(oShapePropertyPaths.startTime);});
		var aFinalShapeGroupArray = this._findPseudoShapeContextArray(aContext, oShapePropertyPaths ,oRow, oGantt);
		var title, oTask, oPseudoShapeIcon;
		oRow.aFinalShapeGroupArray = aFinalShapeGroupArray;
		aFinalShapeGroupArray.forEach(function(oShapeGroup) {
			//for each shape group, create the pseudo shape if there are overlaps
			if (oShapeGroup.iShapeCount > 1) {
				var oShapeClone;
				if (oPseudoShapeTemplate){
					oShapeClone = oPseudoShapeTemplate.clone();
					oTask = oShapeClone.getTask();
					oShapeGroup.shapeFill = oTask.getFill() ? oTask.getFill() : oShapeClone.getFill();
					oTask.setTime(startTimeformatterMethod ? startTimeformatterMethod.call(this,oShapeGroup.startTime) : oShapeGroup.startTime);
					oTask.setEndTime(endTimeformatterMethod ? endTimeformatterMethod.call(this,oShapeGroup.endTime) : oShapeGroup.endTime);
					oTask.setSelectable(true);
					if (expanded && oGantt.oOverlapShapeIds && oGantt.oOverlapShapeIds[oRow.getIndex()] && oShapeGroup.aShapeIds &&  oShapeGroup.aShapeIds.some(function(shapeId){return oGantt.oOverlapShapeIds[oRow.getIndex()].includes(shapeId);})){
							oPseudoShapeIcon = getIcon("sap-icon://collapse", oTask);
							title = oShapeClone.getCollapseTitle() ? oShapeClone.getCollapseTitle() : "Show Less";
					} else {
							oPseudoShapeIcon = getIcon("sap-icon://expand", oTask);
							title = oShapeClone.getExpandTitle() ? oShapeClone.getExpandTitle() : "Show Details";
					}
					oTask.setTitle(title);
					oShapeGroup.overlaps.forEach(function(overlap) {
						var indicator = oShapeClone.getIndicators()[0].clone();
						indicator.addStyleClass("sapGanttPseudoShapeOverlapIndicatorStyle");
						oShapeGroup.overlapIndicatorFill = indicator.getFill() ? indicator.getFill() : oShapeClone.getOverlapFill();
						if (oShapeClone.getTypeOfOverlapIndicator() != "Gradient"){
							indicator.setTime(startTimeformatterMethod ? startTimeformatterMethod.call(this,overlap.startTime) : overlap.startTime);
							indicator.setEndTime(endTimeformatterMethod ? endTimeformatterMethod.call(this,overlap.endTime) : overlap.endTime);
							oShapeClone.addAggregation("indicators",indicator);
						}
					}.bind(this));
					oPseudoShapeIcon.aCustomStyleClasses = ["pseudoShapeIcon"];
					oShapeClone.addAggregation("button",oPseudoShapeIcon);
				} else {
					oShapeClone = this._createPseudoShape(oShapeGroup,oTaskBindingInfo,oRow,oGantt,expanded);
					oTask = oShapeClone.getTask();
				}
				oShapeClone.isPseudoShape = true;
				oShapeClone.aShapeContexts = oShapeGroup.aShapeContexts;
				oShapeClone.aShapeIds = oShapeGroup.aShapeIds;
				oShapeClone.getTask().addStyleClass("sapGanttPseudoShapeColor");
				if (oShapeClone.getTypeOfOverlapIndicator() != "Indicator"){
					oShapeClone.getTask().setFill('url(#' + oShapeGroup.id + ')');
				}
				oSettings.addAggregation("tasks", oShapeClone, true);
				oShapeClone._birdEye(oTaskBindingInfo,oGantt,oShapeClone,oRow,index > -1 ? oGantt._aExpandedIndices.indexOf(oRow.getIndex()) == -1 : true);
                if (needGradientCalculations){
                    var pseudoShapeStartTime = oShapeGroup.startTime,
                    pseudoShapeEndTime = oShapeGroup.endTime;
                    var pseudoShapeStartTimeSec = pseudoShapeStartTime.getTime(),
                    pseudoShapeEndTimeSec = pseudoShapeEndTime.getTime();
                    var total = pseudoShapeEndTimeSec - pseudoShapeStartTimeSec,
                        aPoints = [0];
                    for (var iIndex = 0; iIndex < oShapeGroup.overlaps.length; iIndex++){
                        var oOverlap = oShapeGroup.overlaps[iIndex];
                        var start = ((oOverlap.startTime.getTime() - pseudoShapeStartTimeSec) / total) * 100;
                        var stop = ((oOverlap.endTime.getTime() - pseudoShapeStartTimeSec) / total) * 100;
                        aPoints.push(start);
                        if ((stop - start) < 1){// If overlap diff is less than 1% then making default shade as 1% of pseudo shape
                            var endTime = oAxisTime.timeToView(Format.abapTimestampToDate(pseudoShapeEndTime)),
                                startTime = oAxisTime.timeToView(Format.abapTimestampToDate(pseudoShapeStartTime));
                            var nRetVal = Math.abs(endTime - startTime);
                            stop = start + ((1 / nRetVal) * 100);
                        }
                        aPoints.push(stop);
                    }
                    aPoints.push(100);
                    var aStops = this._fnCreateLinearGradient(aPoints, oShapeGroup);
					var oDefAlreadyExist = oGantt._oSvgDefs && oGantt._oSvgDefs.getAggregation("defs") && oGantt._oSvgDefs.getAggregation("defs").find(function(def){
						return def.getId() == oShapeGroup.id;
					});
                    if (!oDefAlreadyExist){
                        oGantt._oSvgDefs && oGantt._oSvgDefs.addAggregation("defs", new LinearGradient(oShapeGroup.id, {
                            x1: "0%",
                            y1: "0%",
                            x2: "100%",
                            y2: "0%",
                            stops: aStops
                        }), true);
                    }
                }
            } else {
				//if there are no overlaps, create original shape
				if (oShapeGroup.iShapeCount === 1) {
					var oClone = oTaskBindingInfo.template.clone();
					oClone.setBindingContext(oShapeGroup.aShapeContexts[0], sModelName);
					// add back to the rows aggregation
					oSettings.addAggregation("tasks", oClone, true);
					var cloneIndex = oSettings.getAggregation("tasks").length - 1;
					var iIndex = oRow.getIndex();
					var overlapIndex = oGantt.oOverlapShapeIds && oGantt.oOverlapShapeIds[iIndex] && oGantt.oOverlapShapeIds[iIndex].indexOf(oSettings.getAggregation("tasks")[cloneIndex].getShapeId());
					if (overlapIndex > -1){
						if (oGantt.oOverlapShapeIds[iIndex].length > 1){
							oGantt.oOverlapShapeIds[iIndex].splice(overlapIndex,1);
						} else if (oGantt.oOverlapShapeIds) {
							delete oGantt.oOverlapShapeIds[iIndex];
						}
					}

				}
			}
		}.bind(this));

	};

	/**
	 * Creates shape groups for the provided binding information from the context
	 * @private
	 */
	BasePseudoShape.prototype._findPseudoShapeContextArray  = function(aContext, oShapePropertyPaths ,oRow, oGantt) {
		var aShapeGroups = [], iGroupIndex = 0, iOverlapIndex = 0, oGanttId = oGantt.getId();
		// Verified that operations are sorted in ascending order of their start time. If not, we need to sort it that way.
		if (aContext[0]){
			aShapeGroups.push({
				id: oGanttId + "_row-" + oRow.getIndex() + "group-" + iGroupIndex,
				iShapeCount: 1, //number of overlapping shapes
				startTime: aContext[0].getProperty(oShapePropertyPaths.startTime), //start time of pseudo shape
				endTime: aContext[0].getProperty(oShapePropertyPaths.endTime), //end time of pseudo shape
				overlaps: [], //array of overlap start and end time objects
				aShapeContexts: [aContext[0]], //mostly not needed in original implementation, adding so you get all necessary info here
				aShapeIds: [aContext[0].getProperty(oShapePropertyPaths.shapeId)]
			});
		}
		for (var i = 1; i < aContext.length; i++) {
			var oOperation = aContext[i];
			//check for complete overlaps
			//incoming shape's start and end time
			var dShapeStartTime = oOperation.getProperty(oShapePropertyPaths.startTime),
			dShapeEndTime = oOperation.getProperty(oShapePropertyPaths.endTime),
			//Pseudo shape's start and end time
			oShapeGroup = aShapeGroups[iGroupIndex],
			dExistingShapeStartTime = oShapeGroup.startTime,
			dExistingShapeEndTime = oShapeGroup.endTime;
			var dExistingOverlapShapeStartTime = oShapeGroup.overlaps[iOverlapIndex] && oShapeGroup.overlaps[iOverlapIndex].startTime,
					dExistingOverlapShapeEndTime = oShapeGroup.overlaps[iOverlapIndex] && oShapeGroup.overlaps[iOverlapIndex].endTime;
			//when incoming shape is completely coincided by pseudo shape
			if (dShapeStartTime >= dExistingShapeStartTime && dShapeEndTime <= dExistingShapeEndTime) {
				//fully coinciding do nothing to pseudo shape's start and end time
				oShapeGroup.aShapeContexts.push(oOperation);
				oShapeGroup.iShapeCount ++;
				oShapeGroup.aShapeIds.push(oOperation.getProperty(oShapePropertyPaths.shapeId));
				//if overlap are not there yet, add first overlap
				//start time of overlap -> start time of incoming shape, end time of overlap -> end time of incoming shape
				if (oShapeGroup.overlaps.length === 0) {
					oShapeGroup.overlaps.push({
						startTime: dShapeStartTime,
						endTime: dShapeEndTime
					});
				} else {
					//if overlap already exists
					//oexisting verlap's start and end time
					//if incoming shape lies withing the existing overlap, do nothing
					if (dShapeStartTime >= dExistingOverlapShapeStartTime && dShapeEndTime <= dExistingOverlapShapeEndTime) {
						//do nothing
					} else if (dShapeStartTime >= dExistingOverlapShapeStartTime && dShapeStartTime < dExistingOverlapShapeEndTime && dShapeEndTime > dExistingOverlapShapeEndTime) {
						//if incoming shape partially coincide with the overlap,extend the overlap's end time to the endtime of the incoming shape
						oShapeGroup.overlaps[iOverlapIndex].endTime = dShapeEndTime;
					} else if (dShapeStartTime > dExistingOverlapShapeEndTime && dShapeEndTime > dExistingOverlapShapeEndTime) {
						//if incoming shape does not coincide with the existing overlap at all, create a new overlap object
						oShapeGroup.overlaps.push({
							startTime: dShapeStartTime,
							endTime: dShapeEndTime
						});
						iOverlapIndex++;
					}
				}
			} else if (dShapeStartTime >= dExistingShapeStartTime && dShapeStartTime < dExistingShapeEndTime && dShapeEndTime > dExistingShapeEndTime) {
				//when incoming shape partially coincides with pseudo shape
				oShapeGroup.aShapeContexts.push(oOperation);
				oShapeGroup.iShapeCount++;
				oShapeGroup.aShapeIds.push(oOperation.getProperty(oShapePropertyPaths.shapeId));
				//indicator endtime update
				if (oShapeGroup.overlaps.length === 0) {
					//if overlap are not there yet, add first overlap
					//start time of overlap -> start time of incoming shape, end time of overlap -> end time of pseudo shape

					oShapeGroup.overlaps.push({
						startTime: dShapeStartTime,
						endTime: oShapeGroup.endTime
					});
				} else {
					//if overlap already exists
					//existing verlap's start and end time
					if (dShapeStartTime >= dExistingOverlapShapeStartTime && dExistingShapeEndTime <= dExistingOverlapShapeEndTime) {
						//if incoming shape lies withing the existing overlap, do nothing
						//do nothing
					} else if (dShapeStartTime >= dExistingOverlapShapeStartTime && dShapeStartTime < dExistingOverlapShapeEndTime && dExistingShapeEndTime > dExistingOverlapShapeEndTime) {
						//if incoming shape partially coincides with the overlap
						// if incoming shape starts before overlap ends and the pseudo shape end's after overlap (the new overlap will be till end of pseudo shape)
						// then make the existing overlap's end time as the pseudo shape's end time
						oShapeGroup.overlaps[iOverlapIndex].endTime = oShapeGroup.endTime;
					} else if (dShapeStartTime > dExistingOverlapShapeEndTime && dExistingShapeEndTime > dExistingOverlapShapeEndTime) {
						// for new overlaps, add the corresponding object
						oShapeGroup.overlaps.push({
							startTime: dShapeStartTime,
							endTime: oShapeGroup.endTime
						});
						iOverlapIndex++;
					}
				}
				//update pseudo shape's end time as the incoming shape's end time
				oShapeGroup.endTime = dShapeEndTime;
			} else if (dShapeStartTime >= dExistingShapeEndTime && dShapeEndTime >= dExistingShapeEndTime) {
				//for new pseudo shape, add corresponding object
				iGroupIndex++;
				iOverlapIndex = 0;
				aShapeGroups.push({
					id: oGanttId + "_row-" + oRow.getIndex() + "group-" + iGroupIndex,
					iShapeCount: 1,
					startTime: dShapeStartTime,
					endTime: dShapeEndTime,
					overlaps: [],
					aShapeContexts: [oOperation],
					aShapeIds: [oOperation.getProperty(oShapePropertyPaths.shapeId)]
				});
			}
		}
		return aShapeGroups;
	};

	/**
	 *Calculates bird eye ranges
	 * @private
	 */
	BasePseudoShape.prototype._birdEye = function (oTaskBindingInfo, oGantt, oShapeClone, oRow,expanded) {
		var iRowIndex = oRow.getIndex(),
		oSettings = oRow.getAggregation("_settings");
		var countInBirdEyeBindingInfo = oTaskBindingInfo.template.getBindingInfo("countInBirdEye"),
			countInBirdEyeVal;
		if (countInBirdEyeBindingInfo) {
			countInBirdEyeVal = countInBirdEyeBindingInfo.parts[0].path || countInBirdEyeBindingInfo.path;
		} else {
			countInBirdEyeVal = oTaskBindingInfo.template.getCountInBirdEye();
		}
		if (typeof (countInBirdEyeVal) == "boolean") {
			oShapeClone.setCountInBirdEye(countInBirdEyeVal);
			oShapeClone.groupBirdEyeRangeStartTime = oShapeClone.getAggregation("task").getTime();
			oShapeClone.groupBirdEyeRangeEndTime = oShapeClone.getAggregation("task").getEndTime();
		}
		var calculateBirdEyeRange = function () {
			var pseudoCountInBirdEye = false,
				startTime, endTime;
			for (var i = 0; i < oShapeClone.aShapeContexts.length; i++) {
				var oShape = oShapeClone.aShapeContexts[i];
				if (oShape.getProperty(countInBirdEyeVal)) {
					pseudoCountInBirdEye = true;
					var oCurrentStartTime = oShape.getProperty("StartDate");
					var oCurrentEndTime = oShape.getProperty("EndDate");
					if (!startTime || oCurrentStartTime < startTime) {
						startTime = oCurrentStartTime;
					}
					if (!endTime || endTime < oCurrentEndTime) {
						endTime = oCurrentEndTime;
					}
				}
			}
			return {
				startTime: startTime,
				endTime: endTime,
				pseudoCountInBirdEye: pseudoCountInBirdEye
			};
		};
		if (oGantt.oOverlapShapeIds && oGantt.oOverlapShapeIds[iRowIndex] &&
			oShapeClone.aShapeIds.some(function (shapeId) {
				return oGantt.oOverlapShapeIds[iRowIndex].includes(shapeId);
			}) && expanded) {
			var sModelName = oGantt.getTable().getBindingInfo("rows").model;
			var aTasks = oSettings.getAggregation("tasks");
			var cloneIndex = aTasks ? aTasks.length : 0;
			var pseudoCountInBirdEye = false,
				startTime, endTime;
				oShapeClone.aShapeContexts.forEach(function (oContext) {
				if (typeof (countInBirdEyeVal) != "boolean") {
					if (oContext.getProperty(countInBirdEyeVal)) {
						pseudoCountInBirdEye = true;
						var oCurrentStartTime = oContext.getProperty("StartDate");
						var oCurrentEndTime = oContext.getProperty("EndDate");
						if (!startTime || oCurrentStartTime < startTime) {
							startTime = oCurrentStartTime;
						}
						if (!endTime || endTime < oCurrentEndTime) {
							endTime = oCurrentEndTime;
						}
					}
				}
				var oClone = oTaskBindingInfo.template.clone();
				oClone.setBindingContext(oContext, sModelName);
				oClone._parent = oShapeClone.getAggregation("task");
				// add back to the rows aggregation
				oSettings.addAggregation("tasks", oClone, true);
				oSettings.getAggregation("tasks")[cloneIndex].isPartOfExpandedPseudoShape = true;
				var index = index > -1 ? index : iRowIndex;
				oGantt.oOverlapShapeIds[index] = oShapeClone.aShapeIds;
				cloneIndex++;
			});
			if (typeof (countInBirdEyeVal) != "boolean") {
				oShapeClone.groupBirdEyeRangeStartTime = startTime;
				oShapeClone.groupBirdEyeRangeEndTime = endTime;
				oShapeClone.setCountInBirdEye(pseudoCountInBirdEye);
			}
		} else if (typeof (countInBirdEyeVal) != "boolean") {
			var oBirdEyeCalculationInfo = calculateBirdEyeRange();
			oShapeClone.groupBirdEyeRangeStartTime = oBirdEyeCalculationInfo.startTime;
			oShapeClone.groupBirdEyeRangeEndTime = oBirdEyeCalculationInfo.endTime;
			oShapeClone.setCountInBirdEye(oBirdEyeCalculationInfo.pseudoCountInBirdEye);
		}
	};
	return BasePseudoShape;
}, true);
