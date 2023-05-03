/*
 * SAPUI5
  (c) Copyright 2009-2020 SAP SE. All rights reserved
 */
sap.ui.define(["sap/sac/grid/Format", "sap/sac/grid/utils/CellStyle"], function (Format, CellStyle) {
    "use strict";
    function ModelHelper() {
        var that = this;

        /**
         * returns the enum value for a react table cell type
         *
         * @param {string} sSACTableCellType type of react table cell
         * @returns {number} enum value corresponding to the react table cell
         */
        that.fetchSACTableCellTypeEnum = function (sSACTableCellType) {
            var sacTableCellTypeMap = {
                "Value": 0,
                "Header": 1,
                "Input": 2,
                "Chart": 3,
                "ColumnCoordinate": 10,
                "RowCoordinate": 11,
                "RowDimHeader": 14,
                "ColDimHeader": 15,
                "ColDimMember": 16,
                "RowDimMember": 17,
                "AttributeRowDimHeader": 18,
                "AttributeColDimHeader": 19,
                "AttributeRowDimMember": 20,
                "AttributeColDimMember": 21,
                "Custom": 23,
                "Comment": 25,
                "Image": 31
            };
            return sacTableCellTypeMap[sSACTableCellType];
        };

        /**
        * returs the table model in the format needed by thirdtparty react table
        * @param {string} sControlId Id of the Grid control
        * @returns {object} the table model expected by the third party react table
        */
        that.fetchInitialTableModel = function (sControlId) {
            return {
                id: sControlId + '-reactNode',
                hasFixedRowsCols: true,
                featureToggles: {
                    dimHeaderCellsWithIcons: true,
                    accessibilityKeyboardSupport: true
                },
                reversedHierarchy: true,
                freezeEndRow: 0,
                freezeEndCol: 0,
                classesToIgnore: [],
                showGrid: true,
                showCoordinateHeader: false,
                showFreezeLines: false,
                title: {
                    titleStyle: {
                        height: 0 // have to pass this height as 0, otherwise vertical scroll doesnt come
                    },
                    titleVisible: false,
                    subtitleVisible: false
                },
                rows: [],
                columnSettings: [],
                totalHeight: 0,
                totalWidth: 0,
                dataRegionStartCol: 0,
                dataRegionStartRow: 0,
                dataRegionEndCol: 0,
                dataRegionEndRow: 0,
                dataRegionCornerCol: 0,
                dataRegionCornerRow: 0,
                lastRowIndex: 0,
                dimensionCellCoordinatesInHeader: {},
                rowHeightSetting: "Compact",
                scrollPosition: {
                    scrollLeft: 0,
                    scrollTop: 0
                }
            };
        };

        /**
         * Returns react table cell object with default values
         * @param {number} iRow row number
         * @param {number} iCol column number
         * @param {string} sStyleFormat Excel or Business Style of grid
         * @param {number} iFixedRows no of fixed rows
         * @param {string} cellBackgroundColor cell backgorund color for List Header
         * @returns {object} cell object with default values
         */
        that.getEmptyCellValues = function (iRow, iCol, sStyleFormat, iFixedRows, cellBackgroundColor) {
            var oEmptyCell = {
                row: iRow,
                column: iCol,
                formatted: "",
                expanded: false,
                showDrillIcon: false,
                level: 0,
                isInATotalsContext: false,
                hierarchyPaddingLeft: 0,
                cellType: 16,
                ColumnWidth: 150
            };
            if (sStyleFormat == Format.BusinessStyle) {
                oEmptyCell.style = {
                    "fillColor": (iRow < iFixedRows) ? cellBackgroundColor : 'transparent' // for column Headers and Titles
                };
                oEmptyCell.styleUpdatedByUser = true;
            }
            return oEmptyCell;
        };

        /**
         * table model for react table to show no data available text in a single cell
         *
         * @param {string} sDisplayText no data text to be shown
         * @param {string} sControlId id of grid control
         * @returns {object} with properties to render a single cell sac table
         */
        that.getTableModelForNoData = function (sDisplayText, sControlId) {
            return {
                id: sControlId + '-reactNode',
                widgetHeight: 400,
                widgetWidth: 800,
                totalHeight: 200,
                totalWidth: 400,
                showGrid: true,
                hasFixedRowsCols: true,
                rows: [{
                    "row": 0,
                    "fixed": true,
                    "cells": [{
                        "row": 0,
                        "column": 0,
                        "formatted": sDisplayText,
                        "cellType": 1,
                        "style": {},
                        "isInATotalsContext": true
                    }],
                    "height": 40
                }],
                columnSettings: [{
                    "column": 0,
                    "width": 200,
                    "fixed": true
                }]
            };
        };

        /**
         * returns default values of hierarchy information properties of a react table cell
         * @param {number} iRow row number of a cell
         * @param {number} iCol column number of a cell
         * @param {string} sCellText text to be displayed in the cell
         * @returns {object} hierarchy information to be filled for a react table cell
         */
        that.fetchCellHierarchyProperties = function (iRow, iCol, sCellText) {
            return {
                row: iRow,
                column: iCol,
                formatted: sCellText,
                expanded: false,
                showDrillIcon: false,
                level: 0,
                isInATotalsContext: false,
                hierarchyPaddingLeft: 0,
                isOverallResults: false,
                showStyleLinesForDataLevel: false
            };
        };
    }
    return new ModelHelper();
}
);
