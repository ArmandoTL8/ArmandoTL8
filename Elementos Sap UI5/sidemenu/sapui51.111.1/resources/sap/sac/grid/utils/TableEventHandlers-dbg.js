/*
 * SAPUI5
  (c) Copyright 2009-2020 SAP SE. All rights reserved
 */
sap.ui.define(["sap/sac/grid/utils/Utilities"], function (Utilities) {
  "use strict";
  function TableEventHandlers() {
    var that = this;

    /**
     * maps the grid control's drill event to the react table's drillIconClicked event
     * @param {object} oParams column and row information
     * @param {*} oControl wrapper grid control object
     */
    that.onDrillIconClicked = function (oParams, oControl) {
      var oCellClicked = getClickedCell(oParams, oControl);

      // keepoffset flag to be used by Data provider to fetch resultset with offset
      var bKeepOffset = oParams.row > oControl.getRowLimit();
      if (bKeepOffset) {
        oControl.mergeNewDataWithExisitngData = true;
      }
      if (oCellClicked) {
        oControl.fireEvent("drill", {
          cell: oCellClicked,
          keepOffset: bKeepOffset
        });
      }
    };

    /**
     * maps the grid control's rightclick event to react table's onCellClicked event
     * @param {object} params column, row and source element information
     * source element information is used to open the context menu dialog
     * dialog needs a control to openby - it can be a ui5 control or a DOMRef(in this case)
     * @param {*} oControl wrapper grid control object
     */
    that.onCellClicked = function (params, oControl) {
      var oCellClicked = getClickedCell(params, oControl);
      var oLink = params.event.srcElement;
      if (oCellClicked && oLink) {
        oControl.fireEvent("rightClick", {
          cell: oCellClicked,
          link: oLink
        });
      }
    };

    /**
     * maps the grid contol's requestMoreRows event to react table's onReloadLimitReached event
     * onReloadLimitReached event gets called depending on the no. of rows rendered in the visible area/widget height of react table
     * for example - in a particular resolution- 25 rows are visible in the widget area of react table,
     * then onReloadLimitReached event gets called after every 25(plus-minus-5) rows are scrolled thorugh
     *
     * @param {object} oControl wrapper grid control object
     * @param {object} oParams scrolltop value - in pixels - from top of the table till the vertical scroll
     */
    that.requestMoreRows = function (oControl, oParams) {
      var iFixedRows = oControl.getFixedRows();
      var iCurrentRow = oControl.rowCount - iFixedRows;
      var iMaxVirtualRowsOfDataProvider = oControl.getVirtualRows();

      var bIsScrollDown = Utilities.isScrollDown(oControl);
      var bMoreVirtualRowsAreAvailable = (iCurrentRow < iMaxVirtualRowsOfDataProvider);

      var iRowLimit = oControl.getRowLimit();
      oControl.rowOffset = oControl.rowOffset ? oControl.rowOffset : 0;
      oControl.rowOffsetEnd = oControl.rowOffsetEnd ? oControl.rowOffsetEnd : iRowLimit;

      if (bIsScrollDown && bMoreVirtualRowsAreAvailable &&
        Utilities.nextBatchDataFetchNeeded(oControl, oParams)
      ) {
        oControl.rowOffsetEnd = oControl.rowOffsetEnd + iRowLimit;
        oControl.rowOffset = oControl.rowOffset + iRowLimit;
        oControl.mergeNewDataWithExisitngData = true;
        oControl.fireEvent("requestMoreRows", {
          currentRow: oControl.rowOffset
        });
      } else {
        Utilities.updateTableData(oControl);
      }
    };

    function getClickedCell(params, oControl) {
      if (oControl.gridCells) {
        var iColumnNumber = parseInt(params.col);
        var iRowNumber = parseInt(params.row);
        return oControl.gridCells[iRowNumber][iColumnNumber];
      }
      return null;
    }
  }
  return new TableEventHandlers();
});
