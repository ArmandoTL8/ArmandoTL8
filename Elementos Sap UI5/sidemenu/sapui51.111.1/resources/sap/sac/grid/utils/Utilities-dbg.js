/*
 * SAPUI5
  (c) Copyright 2009-2020 SAP SE. All rights reserved
 */
sap.ui.define(
  [
    "sap/sac/grid/Format",
    "sap/sac/grid/utils/ModelHelper",
    "sap/ui/core/theming/Parameters"
  ],
  function (
    Format, ModelHelper, ThemeParams
  ) {
    "use strict";

    var Utilities = function () {
      var that = this;

      /**
       * returns enum of sac react table cell type
       * @param {string} sGridCellType cell type - Title/Header/Result/Standard
       * @param {*} bInATotalsContext if it needs to be shown in bold
       * @returns {number} enum of sac react table cell type
       */
      that.cellTypeMapping = function (sGridCellType, bInATotalsContext) {
        var sSACTableCellType;

        switch (sGridCellType) {
          case "Title":
            sSACTableCellType = 'RowDimHeader';
            break;

          case "Header":
            sSACTableCellType = 'RowDimMember';
            break;

          case "Result":
          case "Standard":
            sSACTableCellType = bInATotalsContext ? 'ColDimHeader' : 'ColDimMember';
            break;

          default:
            sSACTableCellType = bInATotalsContext ? 'ColDimHeader' : 'ColDimMember';
        }

        return ModelHelper.fetchSACTableCellTypeEnum(sSACTableCellType);
      };

      /**
       * canvas text metrics object
       * @param {object} oParams diaply text and bold font information
       * @returns {object} text metrics object
       */
      function getTextMetrics(oParams) {
        var sText = oParams.displayText;
        var canvas = document.createElement("canvas");
        var context = canvas.getContext("2d");

        if (oParams.isBold) {
          context.font = "bold 16px arial";
        } else {
          context.font = "16px arial";
        }
        return context.measureText(sText);
      }

      /**
       * calcuates the text width from text metrics object
       * @param {object} oTextMetrics canvas text metrics object
       * @returns {number} width of the display text for each cell
       */
      function getTextWidthFromTextMetrics(oTextMetrics) {
        /*When measuring the x-direction of a piece of text, the sum of actualBoundingBoxLeft and actualBoundingBoxRight can be wider than
          the width of the inline box (width), due to slanted/italic fonts where characters overhang their advance width.
          It can therefore be useful to use the sum of actualBoundingBoxLeft and actualBoundingBoxRight as a more accurate way to get the
          absolute text width
          https://developer.mozilla.org/en-US/docs/Web/API/TextMetrics*/
        var iTextWidth = oTextMetrics.width;
        if (oTextMetrics.actualBoundingBoxLeft !== undefined && oTextMetrics.actualBoundingBoxRight !== undefined) {
          /* Only supported in new browsers (e.g. Chrome since 77) https://developer.mozilla.org/en-US/docs/Web/API/TextMetrics*/
          iTextWidth = Math.abs(oTextMetrics.actualBoundingBoxLeft) + Math.abs(oTextMetrics.actualBoundingBoxRight);
        }
        return Math.ceil(iTextWidth);
      }

      /**
       * calculates the width of the display text for each cell
       * uses the Text Metrics api to calculate width
       * @param {object} oParams display text of cells and whther it is bold or not
       * @returns {number} width of display text
       */
      that.calculateColumnWidth = function (oParams) {
        var oTextMetrics = getTextMetrics(oParams);
        return getTextWidthFromTextMetrics(oTextMetrics) + oParams.hierarchyPaddingLeft;
      };

      /**
       * calculates the sac react table width and height
       *
       * widget height and width are the dimesnions of the visible area available for the table
       * whereas total height/width is the sum of the height/width of all the rows/columns(including the ones which will load on scoll)
       *
       * @param {object} oGridControl the wrapper grid control
       * @param {object} oTableModel object with information on rows and columns of react table
       * @param {boolean} bResizeHandlerCall if method is called from grid resizeHandler event
       */
      that.decideWidgetDimensions = function (oGridControl, oTableModel, bResizeHandlerCall) {

        var iTotalWidth = 0, iTotalHeight = 0;
        var bIsExcelStyle = oGridControl._isExcelStyle();

        var iTotalCols = oTableModel.columnSettings && oTableModel.columnSettings.length;
        var aTableColumns = oTableModel.columnSettings;
        iTotalWidth = this.calculateTotalWidth(iTotalCols, aTableColumns, bIsExcelStyle);

        var iTotalRows = oTableModel.rows && oTableModel.rows.length;
        var iRowHeight = oGridControl._completeRowHeight();
        iTotalHeight = this.calculateTotalHeight(iTotalRows, iRowHeight, bIsExcelStyle);

        //Anchor element is mostly a flex control like VBox, inside which the PivotTable is placed.
        //From the available visible dimensions of the Anchor element the widget height and width for the sac table is calculated
        var oAnchorDimensions = this.getAnchorDimensions(oGridControl, bResizeHandlerCall);
        //set the height to sac react table component / reactTableComponent DOM element
        var $ReactTable = this.getReactTableComponentOfGrid(oGridControl);
        if ($ReactTable) {
          jQuery($ReactTable).css('height', oAnchorDimensions.anchorHeight);
        }

        //widget height and width are the dimesnions of the visible area available for the table
        //calculated from the available width and height of the anchor element
        oTableModel.widgetWidth = oAnchorDimensions.anchorWidth;
        oTableModel.widgetHeight = oAnchorDimensions.anchorHeight;

        //whereas total height/width is the sum of the height/width of all the rows/columns(including the ones which will load on scoll)
        //calculated by doing a sum total of all rows/columns
        oTableModel.totalHeight = iTotalHeight;
        oTableModel.totalWidth = iTotalWidth;

      };

      /**
       * returns the dimensions of Anchor element, mostly a flex control like VBox, inside which the PivotTable is placed
       *
       * @param {object} oGridControl wrapper grid control object
       * @param {boolean} bResizeHandlerCall if method is called from grid resizeHandler event
       * @returns {object} height and width of the Anchor element
       */
      that.getAnchorDimensions = function (oGridControl, bResizeHandlerCall) {
        var oAnchorElement = oGridControl.AnchorElement ? oGridControl.AnchorElement : oGridControl;
        var iAnchorWidth, iAnchorHeight;
        if (oAnchorElement && oAnchorElement.getDomRef) {
          var $AnchorElement = jQuery(oAnchorElement.getDomRef());
          iAnchorWidth = $AnchorElement.width();
          iAnchorHeight = $AnchorElement.height();
        }
        var oPreviousAnchorDimensions = oGridControl.AnchorDimensions ? oGridControl.AnchorDimensions : { anchorWidth: 0, anchorHeight: 0 };

        if (!bResizeHandlerCall) {
          iAnchorHeight = (oPreviousAnchorDimensions.anchorHeight > iAnchorHeight) ? oPreviousAnchorDimensions.anchorHeight : iAnchorHeight;
        }
        oGridControl.AnchorDimensions = {
          anchorWidth: iAnchorWidth, // maximum available width
          anchorHeight: iAnchorHeight
        };
        return oGridControl.AnchorDimensions;
      };

      /**
       * Calculates the total height of the SAC React table
       * @param {number} iTotalRows Totals rows of react table
       * @param {number} iRowHeight height of each row
       * @param {boolean} bIsExcelStyle if grid control format is excel style
       * @returns {number} total height - sum of height of all rows
       */
      that.calculateTotalHeight = function (iTotalRows, iRowHeight, bIsExcelStyle) {
        if (bIsExcelStyle) {
          return (iTotalRows * (iRowHeight + 1)); // 1px extra for grid style
        } else {
          return (iTotalRows * iRowHeight);
        }
      };

      /**
       * Calculates the total width of the SAC React table
       * @param {number} iTotalCols Total columns of the react table
       * @param {number} aTableColumns array of columns from which we get the width of each column
       * @param {boolean} bIsExcelStyle if grid control format is excel style
       * @returns {number} total width - sum of width of all columns
       */
      that.calculateTotalWidth = function (iTotalCols, aTableColumns, bIsExcelStyle) {
        var iTotalWidth = 0;
        aTableColumns.forEach(function (element) {
          iTotalWidth = iTotalWidth + element.width;
        });
        if (bIsExcelStyle) {
          return iTotalWidth + (iTotalCols * 1); // 1px extra for grid style
        } else {
          return iTotalWidth;
        }
      };

      /**
       * updates the react table with new data and also re-applies the previous scroll position
       * @param {object} oGridControl wrapper grid control object
       * @param {object} oTableModel object with all the table properties expected by react table
       */
      that.updateTableData = function (oGridControl, oTableModel) {
        if (oGridControl.mSacTable) {
          var fCallback = function () {
            document.getElementById(oGridControl.getId()).appendChild(oGridControl.reactTableContainer);
            oGridControl.mSacTable.reapplyScrollPosition();

            //set the height to sac react table component / reactTableComponent DOM element
            var oAnchorDimensions = oGridControl.AnchorDimensions;
            var $ReactTable = that.getReactTableComponentOfGrid(oGridControl);
            if ($ReactTable && oAnchorDimensions) {
              jQuery($ReactTable).css('height', oAnchorDimensions.anchorHeight);
            }

          };
          var oTableData = oTableModel ? oTableModel : oGridControl.mSacTable.cachedData;
          oGridControl.mSacTable.updateTableData(
            oTableData, fCallback
          );
        }
      };

      /**
       * Returns if a cell is expanded or collapsed.
       *
       * @param {string} sIcon icon type
       * @return {string} Exapnded or Collapsed based on icon type.
       */
      that.getDrillState = function (sIcon) {
        var sDrillState;
        if (sIcon == "sap-icon://slim-arrow-down" || sIcon == "sap-icon://slim-arrow-up") {
          sDrillState = 'Expanded';
        } else if (sIcon == "sap-icon://slim-arrow-right") {
          sDrillState = 'Collapsed';
        }
        return sDrillState;
      };

      /**
       * Returns cell heirarchy details of the react table.
       * @param {string} sStyleFormat Grid Excel Style or Business Style
       * @param {object} oCell GridCell
       * @param {object} oRowCellObject object with rows which are array of cells
       * @param {number} iFixedColumns integer, no of fixed columns
       * @param {number} iFixedRows integer, no of fixed rows
       * @param {object} oOverallResultCells object stores info on which cells are type of Overall Results
       * @return {object} object with cell heirarchy details
       */
      that.getHierarchyInfo = function (sStyleFormat, oCell, oRowCellObject, iFixedColumns, iFixedRows, oOverallResultCells) {
        var iRow = oCell.getRow(); var iCol = oCell.getColumn();
        var sCellText = oCell.getDisplayValue(); var iIndex = 0;
        var oCellCustomData = oCell.data();

        var oHierarchyInfo = ModelHelper.fetchCellHierarchyProperties(iRow, iCol, sCellText);

        // decide the drill state of the cell and type of hierarchy
        // in a reversed hierarchy the expand happens from bottom to top
        var sIcon = oCell.getIcon();
        var sDrillState = this.getDrillState(sIcon); var iDisplayLevel = oCell.getDisplayLevel();

        oHierarchyInfo['expanded'] = (sDrillState === 'Expanded') ? true : false;
        oHierarchyInfo['showDrillIcon'] = (typeof (sIcon) != 'undefined' && sIcon != '') ? true : false;
        oHierarchyInfo['level'] = iDisplayLevel;
        oHierarchyInfo['isInATotalsContext'] = oHierarchyInfo['showDrillIcon'];
        // deciding when to show style lines in Business style,
        // 1.when a cell has drill-icon(expandable/collapsable) and is not a fixed row cell
        // 2. all other cells of that row
        if (oHierarchyInfo['showDrillIcon'] && iRow >= iFixedRows) {
          oHierarchyInfo['isInATotalsContext'] = true;
          oHierarchyInfo['showStyleLinesForDataLevel'] = true;
        } else {
          //check if any of the cells in fixed columns isInATotalsContext
          for (iIndex = 0; iIndex < iFixedColumns; iIndex++) {
            if (oRowCellObject[iRow][iIndex] && oRowCellObject[iRow][iIndex].isInATotalsContext && !oRowCellObject[iRow][iIndex].isOverallResults) {
              oHierarchyInfo['isInATotalsContext'] = true;
              oHierarchyInfo['level'] = oRowCellObject[iRow][iIndex].level;
              oHierarchyInfo['showStyleLinesForDataLevel'] = true;
              break;
            }
          }
        }
        oHierarchyInfo['hierarchyPaddingLeft'] = (iDisplayLevel === 0) ? 8 : (2 * iDisplayLevel * 8);
        oHierarchyInfo['isInHierarchy'] = (iDisplayLevel === 0) ? false : true;

        // for business style mark the NonMeasureStructures as bold
        if (sStyleFormat == Format.BusinessStyle) {
          var bNonMeasureStruc = oCellCustomData['cellDimension'] == "NonMeasureStructure";
          if (bNonMeasureStruc) {
            oHierarchyInfo['isInATotalsContext'] = true;
          }
        }
        // check if cell is overall result
        var sCellMember = oCellCustomData['cellMember'];
        if (sCellMember && (sCellMember.toLowerCase() == 'total' || sCellMember == '!SUMME')) {
          oHierarchyInfo['isInATotalsContext'] = true;
          oHierarchyInfo['isOverallResults'] = true;
          if (iRow < iFixedRows) {
            oOverallResultCells['columns'].push(iCol);
          } else {
            oOverallResultCells['rows'].push(iRow);
          }
        } else {
          oHierarchyInfo['isOverallResults'] = oOverallResultCells['columns'].includes(iCol) || oOverallResultCells['rows'].includes(iRow);
          oHierarchyInfo['isInATotalsContext'] = oHierarchyInfo['isInATotalsContext'] ? oHierarchyInfo['isInATotalsContext'] : oHierarchyInfo['isOverallResults'];
        }
        return oHierarchyInfo;
      };

      /**
       * Fills the missing indexes of grid cells with empty values
       *
       * @param {object} oGridControl wrapper grid control
       * @param {object} oRowsWithCells rows and cells of react table
       */
      that.fillMissingIndexes = function (oGridControl, oRowsWithCells) {
        var sStyle = oGridControl._getFormat();
        var iFixedRows = oGridControl.getFixedRows();
        var sCellBg = ThemeParams.get('sapUiListHeaderBackground');
        for (var iRowIndex in oRowsWithCells) {
          var aRowCells = oRowsWithCells[iRowIndex];
          for (var iColIndex = 0; iColIndex < oGridControl.columnCount; iColIndex++) {
            if (aRowCells[iColIndex] == undefined) {
              aRowCells[iColIndex] = ModelHelper.getEmptyCellValues(parseInt(iRowIndex), iColIndex, sStyle, iFixedRows, sCellBg);
            }
          }
        }
      };

      /**
       * returns the total number of rows of the Grid
       * @param {object} oGridControl wrapper grid control
       * @returns {number} total rows in the grid control
       */
      that.getRowCount = function (oGridControl) {
        if (oGridControl.rowCount) {
          return oGridControl.rowCount;
        } else {
          var iFixedRows = oGridControl.getFixedRows();
          var iVirtualRows = oGridControl.getVirtualRows();
          var iMaxRows = oGridControl.getRowLimit();

          return (iFixedRows + iVirtualRows) < iMaxRows ? (iFixedRows + iVirtualRows) : iMaxRows;
        }
      };

      that.getMaxRows = function (oGridControl) {
        var iFixedRows = oGridControl.getFixedRows();
        var iVirtualRows = oGridControl.getVirtualRows();

        return (iFixedRows + iVirtualRows);
      };


      /**
       * returns the total number of columns of the Grid
       * @param {object} oGridControl wrapper grid control object
       * @returns {number} total columns in the grid control
       */
      that.getColumnCount = function (oGridControl) {
        if (oGridControl.columnCount) {
          return oGridControl.columnCount;
        } else {
          var iFixedCols = oGridControl.getFixedColumns();
          var iVirtualCols = oGridControl.getVirtualColumns();
          var iMaxCols = oGridControl.getColumLimit();

          return ((iFixedCols + iVirtualCols) < iMaxCols) ? (iFixedCols + iVirtualCols) : iMaxCols;
        }
      };

      that.getMaxColumns = function (oGridControl) {
        var iFixedCols = oGridControl.getFixedColumns();
        var iVirtualCols = oGridControl.getVirtualColumns();

        return (iFixedCols + iVirtualCols);
      };

      /**
       * sets a single cell sac table to show no data
       *
       * @param {string} sDisplayText No data display text
       * @param {object} oGridControl the grid control object
       */
      that.showNoDataInSacTable = function (sDisplayText, oGridControl) {
        var oTableModel = ModelHelper.getTableModelForNoData(sDisplayText, oGridControl.getId());
        this.storePropertiesToControl(oGridControl, false, 0, 0, {});
        this.updateTableData(oGridControl, oTableModel);
        this.addRemoveCssClassToReactTable(true, "noDataInTable", oGridControl);
      };

      /**
       * Adds or removes a css class to the sac's react table component
       *
       * @param {boolean} bAddClass true - add class, false - remove style class
       * @param {string} sClassName name of the class to be added or removed
       * @param {object} oGridControl the grid control object
       */
      that.addRemoveCssClassToReactTable = function (bAddClass, sClassName, oGridControl) {
        var $ReactTable = this.getReactTableComponentOfGrid(oGridControl);
        if (bAddClass && $ReactTable) {
          $ReactTable.classList.add(sClassName);
        } else if ($ReactTable) {
          $ReactTable.classList.remove(sClassName);
        }
      };

      /**
       * adds some calculated properties of the grid to the grid control object, for later use
       *
       * @param {object} oGridControl the grid control object
       * @param {boolean} bReversedHierarchy if the table hierarchy is reversed - bottom to top instead of top to bottom
       * @param {number} iMaxColumnIndex index of last column of sac table
       * @param {number} iMaxRowIndex index of last row of sac table
       * @param {object} oGridRowsWithCells stores the cells information in a row column structure instead of a plain array
       */
      that.storePropertiesToControl = function (oGridControl, bReversedHierarchy, iMaxColumnIndex, iMaxRowIndex, oGridRowsWithCells) {
        oGridControl.reversedHierarchy = bReversedHierarchy;
        oGridControl.columnCount = iMaxColumnIndex + 1;
        oGridControl.rowCount = iMaxRowIndex + 1;
        oGridControl.gridCells = oGridRowsWithCells;
      };

      /**
       * adds the rows and columnSettings property to the tableModel object
       *
       * @param {object} oGridControl the wrapper Grid control object
       * @param {object} oTableModel object with all the table properties expected by react table
       * @param {array} aSacCelllInfo rows along with cells in the structure needed by react table model
       */
      that.addRowsAndColumnSettingsToTableModel = function (oGridControl, oTableModel, aSacCelllInfo) {
        //adding rows property to tableModel
        var iRowHeight = oGridControl.getRowHeight();
        var iFixedRows = oGridControl.getFixedRows();
        // when more data is fetched on scroll or drill - append the new data fetched to the old data
        if (oGridControl.mergeNewDataWithExisitngData) {
          var aPreviousRowsFetched = oTableModel.rows;
          var aNewRowsFetched = this.formTableDataRowsArray(aSacCelllInfo, iRowHeight, iFixedRows);
          // since fixed rows are fetched everytime, remove the old fixed rows and append the newly fetched fixed rows
          var aFixedRows = aNewRowsFetched.splice(0, iFixedRows);
          Array.prototype.splice.apply(aPreviousRowsFetched, [0,iFixedRows].concat(aFixedRows));

          var iNewRowsStartIndex = aNewRowsFetched[0].row;
          aPreviousRowsFetched.splice(iNewRowsStartIndex);
          oTableModel.rows = aPreviousRowsFetched.concat(aNewRowsFetched);
        } else {
          oTableModel.rows = this.formTableDataRowsArray(aSacCelllInfo, iRowHeight, iFixedRows);
        }

        // sync the column width for each column, with the maximum width of any cell of that column
        syncColumnWidth(oTableModel.rows);
        //adding columnSettings property to tableModel
        var iNoOfColumns = this.getColumnCount(oGridControl);
        var iFixedColumns = oGridControl.getFixedColumns();
        oTableModel.columnSettings = this.formTableDataColumnSettingsArray(oTableModel.rows, iNoOfColumns, iFixedColumns);
      };

      /**
       * forms the react tableData's rows array in the format expected by the table
       *
       * @param {array} aSacCelllInfo array of cells in rows format
       * @param {number} iRowHeight height of grid row
       * @param {number} iFixedRows number of fixed rows
       * @returns {array} rows array in the format expected by react table
       */
      that.formTableDataRowsArray = function (aSacCelllInfo, iRowHeight, iFixedRows) {
        return Object.keys(aSacCelllInfo).map(function (key, iIndex) {
          return {
            row: parseInt(key),
            height: iRowHeight,
            cells: aSacCelllInfo[key],
            fixed: parseInt(key) < iFixedRows
          };
        });
      };

      /**
       * forms the react tableData's column Settings array in the format expected by the table
       *
       * @param {array} aSacCelllInfo array of cells in rows format
       * @param {number} iNoOfColumns total columns to be rendered
       * @param {number} iFixedColumns no. of fixed columns
       * @returns {array} column settings array in the format expected by react table
       */
      that.formTableDataColumnSettingsArray = function (aSacCelllInfo, iNoOfColumns, iFixedColumns) {
        return Array.from(Array(iNoOfColumns).keys()).map(
          function (n) {
            return {
              column: n,
              minWidth: 150,
              width: aSacCelllInfo[0].cells[n] ? aSacCelllInfo[0].cells[n].ColumnWidth : 150,
              id: n.toString(),
              fixed: n < iFixedColumns,
              hasWrapCell: false,
              emptyColumn: false
            };
          }
        );
      };

      /**
       * loops throguh each cell and finds the maximum columnwidth and stores in row 0 for each column
       *
       * @param {array} aTableCells array of the table cells in rows and columns format
       */
      function syncColumnWidth(aTableCells) {
        var aRow0Cells = aTableCells[0].cells;
        for (var iRowIndex = 1; iRowIndex < aTableCells.length; iRowIndex++) {
          var aTableRowCells = aTableCells[iRowIndex].cells;
          for (var iColIndex = 0; iColIndex < aTableRowCells.length; iColIndex++) {
            var oCell = aTableRowCells[iColIndex];
            if (!aRow0Cells[iColIndex]) {
              aRow0Cells[iColIndex] = ModelHelper.getEmptyCellValues(0, iColIndex);
              aRow0Cells[iColIndex].ColumnWidth = 150;
            }
            if (!oCell.ColumnWidth || oCell.ColumnWidth > aRow0Cells[iColIndex].ColumnWidth) {
              aRow0Cells[iColIndex].ColumnWidth = oCell.ColumnWidth;
            }
          }
        }
      }

      /**
       * adds the data region properties to sac tableModel object
       * @param {object} oGridControl the wrapper Grid control object
       * @param {*} oTableModel object with all the table properties expected by react table
       */
      that.addDataRegionPropertiesToTableModel = function (oGridControl, oTableModel) {
        oTableModel.reversedHierarchy = oGridControl.reversedHierarchy;

        oTableModel.dataRegionEndCol = oTableModel.columnSettings.length - 1;
        oTableModel.dataRegionEndRow = oTableModel.rows.length - 1;
        oTableModel.lastRowIndex = oTableModel.rows.length - 1;
        oTableModel.dataRegionStartCol = 0;
        oTableModel.dataRegionStartRow = 0;

        oTableModel.dataRegionCornerCol = oGridControl.getFixedColumns();
        oTableModel.dataRegionCornerRow = oGridControl.getFixedRows();
        oTableModel.freezeEndRow = oGridControl.getFixedRows() - 1;
        oTableModel.freezeEndCol = oGridControl.getFixedColumns() - 1;
      };

      /**
       * this method returns the react table component DOM reference, rendered as a child of grid control
       *
       * @param {object} oGridControl the wrapper Grid control object
       * @returns {object} DOM ref of the SAC react table component
       */
      that.getReactTableComponentOfGrid = function (oGridControl) {
        var $ReactTable;
        if (oGridControl) {
          var aReactTable = oGridControl.getDomRef() && oGridControl.getDomRef().getElementsByClassName('reactTableComponent');
          if (aReactTable && aReactTable.length > 0) {
            $ReactTable = aReactTable[0];
          }
        }
        return $ReactTable;
      };

      /**
       * extracts the required information from grid cell object to store in the control,
       * later appending to more data fetched on scroll
       *
       * @param {object} oCell cell object of wrapper grid control
       * @returns {object} after extracting all the required information from cell
       */
      that.extractUsefulInfoFromCell = function (oCell) {
        var oCellInfo = {};
        oCellInfo.cellCustomata = jQuery.extend(true, {}, oCell.data());
        oCellInfo = Object.assign(oCellInfo, oCell.mProperties);

        oCellInfo.data = function (sProperty) {
          if (sProperty) {
            return oCellInfo.cellCustomata[sProperty];
          } else {
            return oCellInfo.cellCustomata;
          }
        };
        oCellInfo.getCellType = function () {
          return oCellInfo.cellType;
        };

        return jQuery.extend(true, {}, oCellInfo);
      };

      /**
       * method called during scroll -,
       * decides if more data needs to be fetched from the backend data provider
       * logic used - taking into account all rows loaded till now, this method lets user scroll until,
       * the last 3 full scroll rows are left to be rendered.
       * example - if in a particular resolution 25 grid rows load at a time, then when last 75 rows are left to be rendered,
       * by the react table, fire the next backend call, if needed, to fetch more data.
       * With current row limit of 125 in OLAP Model, during the scroll process, when around 50 or more rows are rendered by react table,
       * then in the next call to this method will return true.
       *
       * @param {object} oGridControl the wrapper Grid control object
       * @param {object} oParams scrolltop value - in pixels - from top of the table till the vertical scroll
       * @returns {boolean} telling if it is already the time to fetch the next set of data
       */
      that.nextBatchDataFetchNeeded = function (oGridControl, oParams) {
        var bFetchMoreData = false;
        var iFixedRows = oGridControl.getFixedRows();
        var iCurrentRow = oGridControl.rowCount - iFixedRows;
        var iNextDataEndIndex = iCurrentRow;
        // when all but rows of 3 full scrolls are left to be rendered - fire next data call
        var iRowHeight = oGridControl._completeRowHeight();
        var iEstimateCurrentRowOffset = Math.ceil(oParams / iRowHeight); //current row based on scrollposition

        var iReactTableWidgetHeight = oGridControl.AnchorDimensions && oGridControl.AnchorDimensions.anchorHeight;
        var iNoOfRowsOnScreen = Math.ceil(iReactTableWidgetHeight / iRowHeight);
        var iRowsLoadedOn3FullScrolls = 3 * iNoOfRowsOnScreen;

        if (iEstimateCurrentRowOffset > (iNextDataEndIndex - iRowsLoadedOn3FullScrolls)) {
          bFetchMoreData = true;
        }

        return bFetchMoreData;
      };

      /**
       * from the scrollTop value determines whether scroll is moving down or not
       *
       * @param {object} oGridControl the wrapper Grid control object
       * @returns {boolean} tells whether user is scrolling down or not in the grid
       */
      that.isScrollDown = function (oGridControl) {
        var oOldScrollPosition = oGridControl.oldScrollPosition ? oGridControl.oldScrollPosition : { scrollTop: 0, scrollLeft: 0 };
        var oNewScrollPositon = oGridControl.mSacTable.scrollPosition ? oGridControl.mSacTable.scrollPosition : { scrollTop: 0, scrollLeft: 0 };
        // user scrolling down
        if (oOldScrollPosition.scrollTop < oNewScrollPositon.scrollTop) {
          oGridControl.oldScrollPosition = oGridControl.mSacTable.scrollPosition;
          return true;
        }
        oGridControl.oldScrollPosition = oGridControl.mSacTable.scrollPosition;
        return false;
      };

    };
    return new Utilities();
  }
);
