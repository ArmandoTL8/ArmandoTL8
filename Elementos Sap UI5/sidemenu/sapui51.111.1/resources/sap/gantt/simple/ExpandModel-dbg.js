/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/base/assert",
	"sap/ui/base/ManagedObject",
	"./AggregationUtils",
	"./GanttUtils"
],
	function(jQuery, assert, ManagedObject, AggregationUtils, GanttUtils) {
	"use strict";

	/**
	 * Creates and initializes a new ExpandModel class.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * ExpandModel manages the internal states on expand charts
	 *
	 * @extends sap.gantt.simple.ExpandModel
	 *
	 * @author SAP SE
	 * @version 1.111.0
	 *
	 * @constructor
	 * @private
	 * @alias sap.gantt.simple.ExpandModel
	 */
	var ExpandModel = ManagedObject.extend("sap.gantt.simple.ExpandModel", /** @lends sap.gantt.simple.ExpandModel.prototype */ {
		metadata: {
			properties: {
				baseRowHeight: {type : "int", group : "Appearance", defaultValue : null}
			}
		},
		constructor : function() {
			ManagedObject.apply(this, arguments);

			/***
			 * {
			 *   "row_uid_1": [
			 *   	 {scheme: "ac_main", metadata: {rowSpan: 1, main: true, rowSpanSum: 4}},
			 *   	 {scheme: "ac_overlap", metadata: { rowSpan: 1, main: false, numberOfRows: 3}},
			 *   	 {scheme: "ac_utilization", metadata: { rowSpan: 3, main: false, numberOfRows: 1}}
			 *   ]
			 *   ...
			 * }
			 */
			this.mExpanded = {};
		}
	});

	ExpandModel.prototype.isTableRowHeightNeedChange = function(bExpanded, oTable, aSelectedIndices, oPrimaryScheme, oExpandScheme) {
		var bExpandToggled = false;
		this.rowMaxLevelMap = {};
		var sShapeScheme = oExpandScheme && oExpandScheme.getKey();
		for (var iIndex = 0; iIndex < aSelectedIndices.length; iIndex++) {
			var iSelectedIndex = aSelectedIndices[iIndex];

			var oRowSettings = GanttUtils.getSelectedTableRowSettings(oTable, iSelectedIndex);
			var oGantt = oTable.getParent(),
			bUseParentShapesOnExpand = oGantt.getUseParentShapeOnExpand();
			if (!oGantt._bExpandRows && (oRowSettings == null)) {
				// possible that the Control haven't been placed At anywhere
				break;
			} else if (oRowSettings != null) {
				var aExpandableShapes = oRowSettings.getAllExpandableShapes(oGantt);
				if (aExpandableShapes.length === 0 && !bExpanded) {
					this.toggle(bExpanded, oRowSettings, oPrimaryScheme, oExpandScheme, 0);
					bExpandToggled = true;
					return bExpandToggled;
				}
				var aLength = [];
				var aChild = [];
				var childArraay = [];
				var aChildWithLevels = [];
				var sStartDate;
				var sEndDate;

				aExpandableShapes.forEach(function(oMainshape){ // eslint-disable-line
					if (bUseParentShapesOnExpand) {
						//experimental code
						aChild = AggregationUtils.getNonLazyElementsByScheme(oMainshape, sShapeScheme);
						aChild.forEach(function(oChild) {
							//For BaseConditionalShape
							if (oChild instanceof sap.gantt.simple.BaseConditionalShape) {
								var oActiveShape = oChild._getActiveShapeElement();

								if (oActiveShape instanceof sap.gantt.simple.BaseGroup) {
									sStartDate = null;
									sEndDate = null;
									oActiveShape.getShapes().forEach(function(oShape) {
										if (!sStartDate && !sEndDate) {
											sStartDate = oShape.getTime();
											sEndDate = oShape.getEndTime();
										} else {
											if (oShape.getTime() >= sStartDate) {
												sStartDate = sStartDate;
											} else {
												sStartDate = oShape.getTime();
											}
											if (oShape.getEndTime() >= sEndDate) {
												sEndDate = oShape.getEndTime();
											} else {
												sEndDate = sEndDate;
											}
										}
									});
									oActiveShape.setProperty("time", sStartDate, true);
									oActiveShape.setProperty("endTime", sEndDate, true);
									childArraay = childArraay.concat(oActiveShape);
								} else if (oActiveShape) {
									childArraay = childArraay.concat(oActiveShape);
									}
							} else if (oChild instanceof sap.gantt.simple.BaseGroup) {	//For BaseGroup
								sStartDate = null;
								sEndDate = null;
								oChild.getShapes().forEach(function(oShape) {
									if (!sStartDate && !sEndDate) {
										sStartDate = oShape.getTime();
										sEndDate = oShape.getEndTime();
									} else {
										if (oShape.getTime() >= sStartDate) {
											sStartDate = sStartDate;
										} else {
											sStartDate = oShape.getTime();
										}
										if (oShape.getEndTime() >= sEndDate) {
											sEndDate = oShape.getEndTime();
										} else {
											sEndDate = sEndDate;
										}
									}
								});
								oChild.setProperty("time", sStartDate, true);
								oChild.setProperty("endTime", sEndDate, true);
								childArraay = childArraay.concat(oChild);
							} else {
								childArraay = childArraay.concat(oChild);
							}
						});
					} else if (oMainshape.mBindingInfos.hasOwnProperty("subTasks") || (typeof oMainshape.getSubTasks === "function" && oMainshape.getSubTasks())) {
						aChild = AggregationUtils.getLazyElementsByScheme(oMainshape, sShapeScheme);
						aChild.forEach(function(oChild) {
							//For BaseConditionalShape
							if (oChild instanceof sap.gantt.simple.BaseConditionalShape) {
								var oActiveShape = oChild._getActiveShapeElement();

								if (oActiveShape instanceof sap.gantt.simple.BaseGroup) {
									sStartDate = null;
									sEndDate = null;
									oActiveShape.getShapes().forEach(function(oShape) {
										if (!sStartDate && !sEndDate) {
											sStartDate = oShape.getTime();
											sEndDate = oShape.getEndTime();
										} else {
											if (oShape.getTime() >= sStartDate) {
												sStartDate = sStartDate;
											} else {
												sStartDate = oShape.getTime();
											}
											if (oShape.getEndTime() >= sEndDate) {
												sEndDate = oShape.getEndTime();
											} else {
												sEndDate = sEndDate;
											}
										}
									});
									oActiveShape.setProperty("time", sStartDate, true);
									oActiveShape.setProperty("endTime", sEndDate, true);
									childArraay = childArraay.concat(oActiveShape);
								} else if (oActiveShape) {
									childArraay = childArraay.concat(oActiveShape);
									}
							} else if (oChild instanceof sap.gantt.simple.BaseGroup) {	//For BaseGroup
								sStartDate = null;
								sEndDate = null;
								oChild.getShapes().forEach(function(oShape) {
									if (!sStartDate && !sEndDate) {
										sStartDate = oShape.getTime();
										sEndDate = oShape.getEndTime();
									} else {
										if (oShape.getTime() >= sStartDate) {
											sStartDate = sStartDate;
										} else {
											sStartDate = oShape.getTime();
										}
										if (oShape.getEndTime() >= sEndDate) {
											sEndDate = oShape.getEndTime();
										} else {
											sEndDate = sEndDate;
										}
									}
								});
								oChild.setProperty("time", sStartDate, true);
								oChild.setProperty("endTime", sEndDate, true);
								childArraay = childArraay.concat(oChild);
							} else {
								childArraay = childArraay.concat(oChild);
							}
						});
					} else {
						aChild = AggregationUtils.getLazyElementsByScheme(oMainshape, sShapeScheme);
						aChildWithLevels = GanttUtils.calculateLevelForShapes(aChild, "time", "endTime");
						aLength.push(aChildWithLevels.maxLevel);
					}
				});
				if (childArraay.length !== 0) {
					aChildWithLevels = GanttUtils.calculateLevelForShapes(childArraay, "time", "endTime");
					aLength.push(aChildWithLevels.maxLevel);
				}
				aChildWithLevels = GanttUtils.calculateLevelForShapes(childArraay, "time", "endTime");
				aLength.push(aChildWithLevels.maxLevel);
				var iMaxLength = Math.max.apply(null, aLength);
				if (iMaxLength > 0) {
					this.toggle(bExpanded, oRowSettings, oPrimaryScheme, oExpandScheme, iMaxLength, bUseParentShapesOnExpand);
					this.rowMaxLevelMap["row" + iSelectedIndex] = iMaxLength;
					bExpandToggled = true;
				}
			}
		}

		return bExpandToggled;
	};

	ExpandModel.prototype.refreshRowYAxis = function(oTable) {
		if (this.hasExpandedRows() === false) {
			return;
		}
		var oGantt = oTable.getParent();
		var aRows = oTable.getRows();

		var aRowHeight = oTable.getParent().getTableRowHeights();

		var fAccumulateHeight = 0;
		for (var i = 0; i < aRows.length; i++) {
			var oRow = aRows[i],
				oRowSettings = oRow.getAggregation("_settings"),
				sRowUid = oRowSettings.getRowUid();

			fAccumulateHeight += (aRowHeight[i - 1] || 0);

			if (!this.isRowExpanded(sRowUid)) {
				continue;
			}

			var iRowHeight = this.getBaseRowHeight();
			if (oGantt.getExpandedRowHeight()){
			iRowHeight = oGantt.getExpandedRowHeight();
			}

			this.calcExpandRowYAxis({
				uid: oRowSettings.getRowUid(),
				rowIndex: i,
				rowY: fAccumulateHeight,
				baseRowHeight: iRowHeight,
				allRowHeights: aRowHeight
			});
		}

		return this.getBaseRowHeight();
	};

	ExpandModel.prototype.toggle = function(bExpanded, oRowSettings, oMainScheme, oExpandScheme, iMaxLength, bUseOnlyParentShapesOnExpand) {
		if (bExpanded) {
			this.expand(oRowSettings, oMainScheme, oExpandScheme, iMaxLength, bUseOnlyParentShapesOnExpand);
		} else {
			this.collapse(oRowSettings, oExpandScheme);
		}
	};

	ExpandModel.prototype.expand = function(oRowSettings, oMainScheme, oExpandScheme, iMaxNumberOfDetails, bUseOnlyParentShapesOnExpand) {
		assert(typeof iMaxNumberOfDetails === "number", "iMaxNumberOfDetails must be a number");
		var sUid = oRowSettings.getRowUid(),
			oGantt = oRowSettings.getParentGantt(),
			sMainSchemeKey = oMainScheme.getKey(),
			iMainRowSpan = oMainScheme.getRowSpan();

		var sExpandSchemeKey = oExpandScheme && oExpandScheme.getKey(),
			iExpandRowSpan = oExpandScheme && oExpandScheme.getRowSpan();

		var aItems = this.mExpanded[sUid];
		if (bUseOnlyParentShapesOnExpand) {
			//experimental code block
			if (oGantt.oOverlapShapeIds && oGantt.oOverlapShapeIds[oRowSettings.getParent().getIndex()] &&  oGantt.oOverlapShapeIds[oRowSettings.getParent().getIndex()].length > 0){
				if (!aItems || aItems.length === 0) {
					this.mExpanded[sUid] = [{
						scheme: "",
						metadata: {
							rowSpan: iMainRowSpan,
							numberOfRows: iMaxNumberOfDetails,
							main: true
						}
					},{
						expandSchemeShape: true,
						metadata: {
							numberOfRows: iMaxNumberOfDetails,
							rowSpan: iMainRowSpan,
							useParentOnExpand: true
						}
					}
					];
				} else {
					this.mExpanded[sUid][1].metadata.numberOfRows = iMaxNumberOfDetails;
				}
			} else {
				if (!aItems || aItems.length === 0) {
					this.mExpanded[sUid] = [{
						scheme: sExpandSchemeKey,
						metadata: {
							numberOfRows: iMaxNumberOfDetails,
							rowSpan: iMainRowSpan,
							useParentOnExpand: true,
							main: true
						}
					}];
				}
			}
		} else {
			if (!aItems || aItems.length === 0) {
				this.mExpanded[sUid] = [{
					scheme: sMainSchemeKey,
					metadata: {rowSpan: iMainRowSpan, main: true }
				}];
			}

			if (!this.hasExpandScheme(sUid, sExpandSchemeKey)) {
				this.mExpanded[sUid].push({
					scheme: sExpandSchemeKey,
					metadata: {
						numberOfRows: iMaxNumberOfDetails,
						rowSpan: iExpandRowSpan
					}
				});
			}
		}

		this.updateVisibleRowSpan(sUid);
	};

	ExpandModel.prototype.collapse = function(oRowSettings, oExpandScheme) {
		var sUid = oRowSettings.getRowUid();
		if (!sUid && !this.mExpanded[sUid]) {
			// the row haven't been expanded, thus return immediately
			return;
		}

		var sExpandScheme = oExpandScheme && oExpandScheme.getKey();

		var aItems = this.mExpanded[sUid];
		for (var iIndex = 0; iIndex < aItems.length; iIndex++) {
			var oItem = aItems[iIndex];
			if (oItem.scheme === sExpandScheme || (!oItem.scheme && oItem.expandSchemeShape)) {
				aItems.splice(iIndex, 1);
			}
			if (this.hasNoExpandRows(sUid)) {
				delete this.mExpanded[sUid];
				break;
			} else {
				this.updateVisibleRowSpan(sUid);
			}
		}
	};

	ExpandModel.prototype.hasExpandScheme = function(sUid, sScheme) {
		return this.mExpanded[sUid].filter(function(oItem){
			return oItem.scheme === sScheme;
		}).length > 0;
	};

	ExpandModel.prototype.hasExpandedRows = function() {
		return !jQuery.isEmptyObject(this.mExpanded);
	};

	ExpandModel.prototype.isRowExpanded = function(sUid) {
		return !this.hasNoExpandRows(sUid);
	};

	ExpandModel.prototype.hasNoExpandRows = function(sUid) {
		var aItems = this.mExpanded[sUid] || [];
		return aItems.every(function(oItem){
			return (oItem.metadata.main && !oItem.metadata.useParentOnExpand);
		});
	};

	ExpandModel.prototype.updateVisibleRowSpan = function(sUid) {
		var aItems = this.mExpanded[sUid] || [];

		var sMainKey, oMain, iNumberofSubRows = 0;
		for (var iIndex = 0; iIndex < aItems.length; iIndex++) {
			var oItem = aItems[iIndex];
			var sKey = oItem.scheme;
			var oValue = oItem.metadata;
			if (oValue.main) {
				sMainKey = sKey;
				oMain = oValue;
				if (oValue.useParentOnExpand) {
					iNumberofSubRows = oValue.rowSpan * (oValue.numberOfRows || 1);
				}
			} else {
				iNumberofSubRows = oValue.rowSpan * (oValue.numberOfRows || 1);
			}
		}

		oMain.numberOfSubRows = iNumberofSubRows;
		this.mExpanded[sUid][0] = {
			scheme: sMainKey,
			metadata: oMain
		};
	};

	ExpandModel.prototype.getMainRowScheme = function(sUid) {
		var aItems = this.mExpanded[sUid] || [];
		return aItems.filter(function(oItem){
			return oItem.metadata.main;
		}).map(function(oMain){
			return {
				key: oMain.scheme,
				value: oMain.metadata
			};
		})[0];
	};

	ExpandModel.prototype.getExpandSchemeKeys = function(sUid) {
		var aItems = this.mExpanded[sUid] || [];
		return aItems.filter(function(oItem){
			return !oItem.metadata.main;
		}).map(function(oItem){
			return oItem.scheme;
		});
	};

	/**
	 * Calculate the row height based on the row expand scheme and fallback to default row height
	 * if row has not expanded
	 *
	 * @private
	 * @param {@sap.gantt.GanttRowSettings} oRowSettings RowSettings
	 * @param {int} iBaseRowHeight the fallback rowheight if row is not expanded
	 * @param {object} oTable Object of Ganttchart table
	 * @returns {int} return the calculated the row height on expand chart
	 */
ExpandModel.prototype.getCalculatedRowHeight = function(oRowSettings, iBaseRowHeight, oTable) {
		var iResult = iBaseRowHeight;
		var oGantt = oTable.getParent(),
			iExpandedRowHeight = oGantt.getExpandedRowHeight();
		var iRowIndex = oRowSettings.getParent().getIndex(),
		bIncludePseudoShape = oGantt.oOverlapShapeIds && oGantt.oOverlapShapeIds[iRowIndex] && oGantt.oOverlapShapeIds[iRowIndex].length > 0;
		var bShowParentRowOnExpand = (oGantt.getShowParentRowOnExpand() && !oGantt.getUseParentShapeOnExpand()) || (oGantt._aExpandedIndices.indexOf(iRowIndex) > -1 && bIncludePseudoShape );

		if (this.hasExpandedRows()) {
			var sUid = oRowSettings.getRowUid();
			if (!sUid) { return iResult; }

			var aItems = this.mExpanded[sUid];
			if (aItems) {
				var oMain = this.getMainRowScheme(sUid);
				if (!iExpandedRowHeight){
					iResult = bShowParentRowOnExpand ? (iBaseRowHeight * (oMain.value.rowSpan + oMain.value.numberOfSubRows)) : (iBaseRowHeight * (oMain.value.numberOfSubRows));
				} else {
					if (!bShowParentRowOnExpand) {
						//check if row has a single subrow and expanded row height is less than the default row height
						if (iExpandedRowHeight < iBaseRowHeight && oMain.value.numberOfSubRows === 1) {
							iResult = oMain.value.numberOfSubRows * iBaseRowHeight;
						} else {
							iResult = oMain.value.numberOfSubRows * iExpandedRowHeight + 0.5;
						}
					} else {
						iResult = (iBaseRowHeight * oMain.value.rowSpan) + (oMain.value.numberOfSubRows * iExpandedRowHeight) + 0.5;
					}
				}
			}
		}
		return iResult;
	};

	ExpandModel.prototype.getRowHeightByIndex = function(oTable, iIndex, iTableRowHeight) {
		if (oTable == null) {
			return iTableRowHeight;
		}

		var aRows = oTable.getRows(),
			oRowSettings = aRows[iIndex].getAggregation("_settings");
		return this.getCalculatedRowHeight(oRowSettings, iTableRowHeight, oTable);
	};

	ExpandModel.prototype.calcExpandRowYAxis = function(mParam) {
		var sUid = mParam.uid,
			iBaseRowHeight = mParam.baseRowHeight;

		var iFirstStartY = mParam.rowY;

		var oMainRowScheme,
			sMainSchemeKey,
			aExpandSchemeKey = [];

		var aExpandSchemes = [];

		var aItems = this.mExpanded[sUid];
		if (jQuery.isEmptyObject(aItems)) { return; }

		for (var iIndex = 0; iIndex < aItems.length; iIndex++) {
			var oExpandItem = aItems[iIndex],
				sKey = oExpandItem.scheme,
				oValue = oExpandItem.metadata;
			if (oValue.main) {
				oMainRowScheme = oValue;
				sMainSchemeKey = sKey;
				if (oValue.useParentOnExpand) {
					aExpandSchemes.push(oValue);
					aExpandSchemeKey.push(sKey);
				}
			} else {
				aExpandSchemes.push(oValue);
				aExpandSchemeKey.push(sKey);
			}
		}
		var iMainRowSpan = oMainRowScheme ? oMainRowScheme.rowSpan : 1;

		var oItem = {};
		oItem[sMainSchemeKey] = [iMainRowSpan];
		var aRowSpans = [oItem];

		for (var i = 0; i < aExpandSchemes.length; i++) {
			var oExpandScheme = aExpandSchemes[i],
				iRowSpan = oExpandScheme.rowSpan,
				iMaxLength = oExpandScheme.numberOfRows;
			var aSpans = [];
			for (var j = 0; j < iMaxLength; j++) {
				aSpans.push(iRowSpan);
			}
			oItem = {};
			oItem[aExpandSchemeKey[i]] = aSpans;
			aRowSpans.push(oItem);
		}

		var iRelativeY = iFirstStartY;
		for (var m = 0; m < aRowSpans.length; m++) {
			var oSpanItem = aRowSpans[m],
				sScheme = Object.keys(oSpanItem)[0],
				aSubSpans = oSpanItem[sScheme];

			if (m === 0) {
				this._updateRowYAxis(sUid, sScheme, {
					rowYAxis: [iRelativeY].slice()
				});
			} else {
				var aSubRowYStart = [];

				if (aSubSpans.length === 1) {
					aSubRowYStart.push(iRelativeY + this.getBaseRowHeight());
					iRelativeY += (aSubSpans[0] * iBaseRowHeight);
				} else {
					for (var n = 0; n < aSubSpans.length; n++) {
						if (n === 0){
							if (this.getBaseRowHeight() !== iBaseRowHeight){
								iRelativeY = iRelativeY + (aSubSpans[n] * this.getBaseRowHeight());
							} else {
								iRelativeY = iRelativeY + (aSubSpans[n] * iBaseRowHeight);
							}
						} else {
							iRelativeY = iRelativeY + (aSubSpans[n] * iBaseRowHeight);
						}
						aSubRowYStart.push(iRelativeY);
					}
				}

				//expand row
				this._updateRowYAxis(sUid, sScheme, {
					rowYAxis: aSubRowYStart.slice()
				});
			}
		}

	};

	ExpandModel.prototype._updateRowYAxis = function(sUid, sSchemeKey, vValue) {
		var aRowYAxis = vValue.rowYAxis;
		var aItems = this.mExpanded[sUid] || [];
		for (var iIndex = 0; iIndex < aItems.length; iIndex++) {
			var oItem = aItems[iIndex];
			if (oItem.scheme === sSchemeKey || (!oItem.scheme && oItem.expandSchemeShape)) {
				oItem.metadata.yAxis = aRowYAxis;
				break;
			}
		}
	};

	ExpandModel.prototype.getRowYCenterByUid = function(sUid, iMainRowYCenter, sSchemeKey, iExpandIndex, oGantt, iRowIndex) {
		var bRowExpanded = this.isRowExpanded(sUid);
		if (bRowExpanded === false) {
			// non expand mode
			return iMainRowYCenter;
		}

		var aItems = this.mExpanded[sUid],
			sScheme = sSchemeKey || this.getMainRowScheme(sUid).key;
		for (var iIndex = 0; iIndex < aItems.length; iIndex++) {
			var oItem = aItems[iIndex];
			if (oItem.scheme === sScheme || (!oItem.scheme && oItem.expandSchemeShape)) {
				var iBaseRowHeight = this.getBaseRowHeight();
				var aYAxis = oItem.metadata.yAxis,
				bIncludePseudoShape = oGantt.oOverlapShapeIds && oGantt.oOverlapShapeIds[iRowIndex] &&  oGantt.oOverlapShapeIds[iRowIndex].length > 0;
				var bShowParentRowOnExpand = (oGantt.getShowParentRowOnExpand() && !oGantt.getUseParentShapeOnExpand()) || (oGantt._aExpandedIndices.indexOf(iRowIndex) > -1 && bIncludePseudoShape),
				iExpandedRowHeight = oGantt.getExpandedRowHeight();

				if (iExpandedRowHeight && !(oItem.metadata.main && !oItem.metadata.useParentOnExpand)) {
					//check if it's a single subrow whose parent row is hidden and expanded row height is less than the default row height
					if (aYAxis.length === 1 && iExpandedRowHeight < iBaseRowHeight && !bShowParentRowOnExpand) {
						iBaseRowHeight =  this.getBaseRowHeight();
					} else {
						iBaseRowHeight = iExpandedRowHeight;
					}
				}
				var iShapeHeight = iBaseRowHeight * oItem.metadata.rowSpan;
				var aRowYCenters = aYAxis.map(function(iValue) {//eslint-disable-line
					return iValue + (iShapeHeight / 2);
				});

				var i = iExpandIndex === undefined ? 0 : iExpandIndex;
				return aRowYCenters[i];
			}
		}
	};

	ExpandModel.prototype.getExpandShapeHeightByUid = function(sUid, sShapeScheme, iFallbackHeight) {
		var aItems = this.mExpanded[sUid];
		var oFoundItem = aItems && aItems.filter(function(oItem){
			return oItem.scheme === sShapeScheme  ||  (!oItem.scheme && oItem.expandSchemeShape);
		})[0];
		return oFoundItem ? oFoundItem.metadata.rowSpan * this.getBaseRowHeight() : iFallbackHeight;
	};

	ExpandModel.prototype.intersectRows = function(aLeft, aRight) {
		return jQuery.grep(aLeft, function(sLeft){
			return jQuery.inArray(sLeft, aRight) > -1;
		});
	};

	ExpandModel.prototype.collectExpandedBgData = function(aRowUid, iExpandedRowHeight, bShowParentRowOnExpand) {
		var aIntersectRows = this.intersectRows(aRowUid, Object.keys(this.mExpanded));
		if (jQuery.isEmptyObject(this.mExpanded)
				|| jQuery.isEmptyObject(aRowUid)
				|| jQuery.isEmptyObject(aIntersectRows)) {
			return [];
		}

		var iRowHeight = this.getBaseRowHeight();
		var aResult = [];
		for (var iIndex = 0; iIndex < aIntersectRows.length; iIndex++) {
			var sUid = aIntersectRows[iIndex],
				aItems = this.mExpanded[sUid] || [];

			for (var i = 0; i < aItems.length; i++) {
				var oItem = aItems[i],
					aYAxis = oItem.metadata.yAxis || [],
					bMain = oItem.metadata.main;
				if (!bMain || oItem.metadata.useParentOnExpand) {
					var aSubResult = [];
					if (iExpandedRowHeight){
						//check if it's a single subrow whose parent row is hidden and expanded row height is less than the default row height
						if (aYAxis.length === 1 && !bShowParentRowOnExpand && (iExpandedRowHeight < this.getBaseRowHeight())) {
							iRowHeight = this.getBaseRowHeight();
						} else {
							iRowHeight = iExpandedRowHeight;
						}
					}
					aYAxis.forEach(function(iY){ //eslint-disable-line
						aSubResult.push({
							x: 0,
							y: iY,
							rowUid: sUid,
							rowHeight: iRowHeight * oItem.metadata.rowSpan
						});
					});

					aResult.push(aSubResult);
				}
			}
		}
		return aResult;
	};

	return ExpandModel;

}, true /**bExport*/);
