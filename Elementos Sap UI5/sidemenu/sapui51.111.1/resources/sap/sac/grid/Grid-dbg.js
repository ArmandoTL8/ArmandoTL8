/*
 * SAPUI5
  (c) Copyright 2009-2020 SAP SE. All rights reserved
 */
sap.ui.define(
  [
    "sap/ui/core/Control",
    "sap/ui/core/HTML",
    "sap/ui/core/ResizeHandler",
    "sap/sac/grid/utils/GridUtils",
    "sap/sac/grid/Format",
    "sap/sac/grid/utils/Utilities",
    "sap/sac/grid/GridRenderer"
  ],
  function (
    Control, HTML, ResizeHandler, GridUtils, Format, Utilities, GridRenderer
  ) {
    "use strict";
    /**
     * Constructor for a new <code>Grid</code>.
     *
     * @class
     * Enables users to view and edit data in a grid. The grid is mimicking the familiar display of spreadsheets.
     *
     * <h3>Overview</h3>
     *
     * The user can view the data in the grid, trigger actions via a context menu, enter data into input ready
     * cells.
     *
     * <h3>Usage</h3>
     *
     * The <code>Grid</code> is mainly intended as a helper control for the <code>PivotTable</code>.
     * @extends sap.ui.core.Control
     *
     * @private
     * @ui5-restricted sap.sac.df
     *
     * @author SAP SE
     * @version 1.111.0
     *
     * @constructor
     * @param {string} [sId] ID for the new control, generated automatically if no ID is given
     * @param {object} [mSettings] Initial settings for the new control
     *
     * @alias sap.sac.grid.Grid
     **/
    var Grid = Control.extend(
      "sap.sac.grid.Grid", {
      renderer: GridRenderer,
      metadata: {
        properties: {
          /**
           * Maximum of rows to be displayed in the <code>Grid<code>
           */
          maxRows: {
            type: "int",
            group: "Dimension",
            defaultValue: 15
          },
          /**
           * Available rows in which the user can scroll
           */
          virtualRows: {
            type: "int",
            group: "Dimension"
          },
          /**
           * Uniform height of a row in the <code>Grid<code>.
           */
          rowHeight: {
            type: "int",
            group: "Dimension",
            defaultValue: 31
          },
          /**
           * Maximum of columns to be displayed in the <code>Grid<code>.
           */
          maxColumns: {
            type: "int",
            defaultValue: 20
          },
          /**
           * Available columns in which the user can scroll
           */
          virtualColumns: {
            type: "int"
          },
          /**
           * The limit of columns transported to the fronted
           */
          columnLimit: {
            type: "int",
            defaultValue: 20
          },
          /**
          * The limit of rows transported to the fronted
          */
          rowLimit: {
            type: "int",
            defaultValue: 125
          },
          /**
           * Indicator whether the grid should support data entry
           */
          input: {
            type: "boolean",
            defaultValue: false
          },
          /**
           * Number of fixed header rows
           */
          fixedRows: {
            type: "int",
            defaultValue: 0
          },
          /**
           * Number of fixed header columns
           */
          fixedColumns: {
            type: "int",
            defaultValue: 0
          },
          /**
           * offset column (handled specially, since a change needs to suppress invalidation of <code>UIArea</code>
           */
          offsetColumn: {
            type: "int",
            defaultValue: 0
          },
          /**
           * offset row (handled specially, since a change needs to suppress invalidation of <code>UIArea</code>
           */
          offsetRow: {
            type: "int",
            defaultValue: 0
          },
          /**
           *  Property for different table formats
           */
          format: {
            type: "sap.sac.grid.Format",
            multiple: false,
            defaultValue: Format.ExcelStyle
          },
          /**
           * Property that accepts a JSON object according to the following structure.
           * This property represents also the new API which is also closely aligned with the exposed events.
           * Here is an example of what this object could look like:
           * {
           *     "id": "__grid0",
           *     "widgetHeight": 384,
           *     "widgetWidth": 384,
           *     "showGrid": true,
           *     "showCoordinateHeader": false,
           *     "rows": [
           *         {
           *             "id": "2d69617f2d",
           *             "row": 0,
           *             "fixed": false,
           *             "cells": [
           *                 {
           *                     "id": "2d2ccedc14",
           *                     "column": 0,
           *                     "row": 0,
           *                     "context": {
           *                         "dimensions": [],
           *                         "originalDimension": ""
           *                     },
           *                     "editable": true,
           *                     "formatted": "1,00",
           *                     "plain": "1",
           *                     "isInHierarchy": false,
           *                     "cellType": 23,
           *                     "style": {
           *                         "font": {},
           *                         "alignment": {
           *                             "vertical": 1,
           *                             "horizontal": 1
           *                         },
           *                         "wrap": false,
           *                         "lines": []
           *                     },
           *                     "styleUpdatedByUser": true
           *                 }
           *             ],
           *             "height": 35
           *         }
           *     ],
           *     "columnSettings": [
           *         {
           *             "id": "2d7eb5998c",
           *             "column": 0,
           *             "width": 100,
           *             "minWidth": 100,
           *             "fixed": false,
           *             "hasWrapCell": false,
           *             "emptyColumn": false
           *         }
           *     ],
           *     "totalHeight": 36,
           *     "totalWidth": 100,
           *     "hasFixedRowsCols": false,
           *     "dataRegionStartCol": 0,
           *     "dataRegionStartRow": 0,
           *     "dataRegionEndCol": 0,
           *     "dataRegionEndRow": 0,
           *     "dataRegionCornerCol": -1,
           *     "dataRegionCornerRow": -1,
           *     "lastRowIndex": 0,
           *     "dimensionCellCoordinatesInHeader": {},
           *     "rowHeightSetting": 0,
           *     "scrollPosition": {
           *         "scrollLeft": 0,
           *         "scrollTop": 0
           *     }
           * }
           */
          tableData: {
            type: "object",
            defaultValue: null
          }
        },
        aggregations: {
          /**
           * Cells to be displayed
           */
          cells: {
            "type": "sap.sac.grid.Cell",
            multiple: true,
            bindable: "bindable"
          },
          /**
           * Sematic Styles to be applied for cell, representing a given member
           */
          semanticStyles: {
            "type": "sap.sac.grid.SemanticStyle",
            multiple: true,
            bindable: "bindable"
          }
        },
        defaultAggregation: "cells",
        events: {
          /**
           * Fired when the user scrolls out of the area between available rows and virtual rows
           *
           * @deprecated Since version 1.105.0. The new API is using tableData rather than sap.sac.grid.Cell. Use event "verticalLimitReached" instead.
           */
          requestMoreRows: {
            parameters: {
              /**
               * Number of current row
               */
              currentRow: "int",
              /**
               * Promise Resolver to be resolved or rejected when data was fetched
               */
              defered: "object"
            }
          },
          /**
           * Fired when the user scrolls out of the area between available columns and virtual columns
           *
           * @deprecated Since version 1.105.0. The new API is using tableData rather than sap.sac.grid.Cell. Use event "horizontalLimitReached" instead.
           */
          requestMoreColumns: {
            parameters: {
              /**
               * Number of current column
               */
              currentColumn: "int",
              /**
               * Promise Resolver to be resolved or rejected when data was fetched
               */
              defered: "object"
            }
          },
          /**
           * Is fired on click, the Pivot table displays the context menu
           *
           * @deprecated Since version 1.105.0. The new API is using tableData rather than sap.sac.grid.Cell. Use event "contextMenu", "cellMouseDown" or "cellMouseUp" instead.
           */
          rightClick: {
            parameters: {
              /**
               * The cell on which the user clicked
               */
              cell: "sap.sac.grid.Cell",
              /**
               * The link which renders the clicked cell
               */
              link: "sap.m.Link"
            }
          },
          /**
           * Is fired on click on an icon (typically a collapse or expand) symbol
           *
           * @deprecated Since version 1.105.0. The new API is using tableData rather than sap.sac.grid.Cell. Use event "drillIconClick" instead.
           */
          drill: {
            parameters: {
              /**
               * The cell  with the icon
               */
              cell: "sap.sac.grid.Cell"
            }
          },
          /**
           * event to notify when the table was initially mounted, only fired once
           */
          initialMount: {},
          /**
           * mouse down event on a cell or the title
           */
          cellMouseDown: {
            parameters: {
              /**
               * browser mouse down event
               */
              nativeEvent: "MouseEvent",
              /**
               * the row index of the cell where mouse down was triggered
               */
              row: "int",
              /**
               * the colum index of the cell where mouse down was triggered
               */
              column: "int",
              /**
               * the context of the target cell
               */
              cellContext: "object",
              /**
               * description of the target element, e.g. A1, B2, C3... or "title"
               */
              targetDescription: "string"
            }
          },
          /**
           * mouse up event on a cell element
           */
          cellMouseUp: {
            parameters: {
              /**
               * browser mouse event
               */
              nativeEvent: "MouseEvent",
              /**
               * the row index of the cell where mouse up was triggered
               */
              row: "int",
              /**
               * the column index of the cell where mouse up was triggered
               */
              column: "int",
              /**
               * the cell type enum value
               */
              cellType: "int",
              /**
               * the context of the target cell
               */
              cellContext: "object"
            }
          },
          /**
           * event for changes to the selection, fired for both mouse and keyboard changes to selection.
           */
          selectionChanged: {
            /**
             * array of selection areas
             */
            newSelection: "object[]",
            /**
             * context of selection
             */
            selectionContext: "int"
          },
          /**
           * event for click on the hierarchy drill icon in dimension member cells
           */
          drillIconClick: {
            parameters: {
               /**
               * the row index of the cell where drill was triggered
               */
              row: "int",
               /**
               * the column index of the cell where drill was triggered
               */
              column: "int",
              /**
               * browser mouse event
               */
              nativeEvent: "MouseEvent",
              /**
               * description of the target element, e.g. A1, B2, C3... or "title"
               */
              targetDescription: "string"
            }
          },
          /**
           * event for click on custom defined icons in dimension header cells
           */
          customCellIconClick: {
            parameters: {
               /**
               * the row index of the cell where icon click triggered
               */
              row: "int",
               /**
               * the column index of the cell where icon click triggered
               */
              column: "int",
              /**
               * class names of the icon that was clicked
               */
              className: "string",
              /**
               * data attributes of the icon that was clicked
               */
              dataAttributes: "object",
              /**
               * charCode of the icon
               */
              iconCharCode: "int"
            }
          },
          /**
           * event for click on a hyperlink text in cells
           */
          cellLinkPressed: {
            /**
             * row index of the cell where link was clicked
             */
            row: "int",
            /**
             * column index of the cell where link was clicked
             */
            column: "int",
            /**
             * generated dom-id of the clicked hyperlink
             */
            cellHyperlinkId: "string"
          },
          /**
           * event for click on the commenting icon of a cell
           */
          commentIconClicked: {
            /**
             * row index of the cell where commenting icon was clicked
             */
            row: "int",
            /**
             * column index of the cell where commenting icon was clicked
             */
            column: "int"
          },
          /**
           * event for drag and drop of external objects. fired when external object is dropped into a cell.
           */
          externalElementDropped: {
            /**
             * drag event data that can be passed into the enableDragDrop, can be any data type
             */
            externalData: "any",
            /**
             * row index of the cell where element was dropped
             */
            targetRow: "int",
            /**
             * column index of the cell where element was dropped
             */
            targetColumn: "int",
            /**
             * boolean to know if it was dropped in the "before" drop area
             */
            placedBeforeCell: "boolean"
          },
          /**
           * event for drag and drop of dimension header cells. fired when a dragged cell is dropped.
           */
          cellDropped: {
            parameters: {
              /**
               * row index of the drag source cell
               */
              sourceRow: "int",
              /**
               * column index of the drag source cell
               */
              sourceColumn: "int",
              /**
               * row index of the drag end cell
               */
              targetRow: "int",
              /**
               * column index of the drag end cell
               */
              targetColumn: "int",
              /**
               * boolean to know if it was dropped in the "before" drop area
               */
              placedBeforeCell: "boolean"
            }
          },
          /**
           * event for using the drag-copy-dot, fired when user releases the drag dot.
           */
          dragCopyEnd: {
            parameters: {
              /**
               * selection area when drag copy was started
               */
              originalSelection: "object",
              /**
               * selection area when drag copy was finished
               */
              newSelection: "object"
            }
          },
          /**
           * event for keyboard shortcuts (e.g. CTRL+C,CTRL+V...)
           */
          keyboardShortcut: {
            parameters: {
              /**
               * selection area after keyboard shortcut
               */
              currentSelection: "object",
              /**
               * browser key event
               */
              nativeEvent: "KeyboardEvent",
              /**
               * indicates whether the keyboard shortcut was triggered from key up event. E.g. on mac, paste CMD+V is only triggered on keyup event
               */
              keyUp: "boolean"
            }
          },
          /**
           * event for resizing of columns(1 or more)
           */
          changeColumnWidth: {
            parameters: {
              /**
               * array of index->width objects
               */
              newColumnWidths: "object[]"
            }
          },
          /**
           * event for resizing of rows(1 or more)
           */
          changeRowHeight: {
            parameters: {
              /**
               * array of index->height objects
               */
              newRowHeights: "object[]"
            }
          },
          /**
           * event for resizing the title
           */
          changeTitleHeight: {
            parameters: {
              /**
               * new height of title
               */
              newHeight: "int"
            }
          },
          /**
           * event for requesting of additional rows.
           * Triggered when user scrolled down and reaches the end of rendered/available rows.
           * Can be used to append more data only when requested.
           * The listener has to make a call to update the table data to ensure correct scrolling/appending of data.
           */
          verticalLimitReached: {
            parameters: {
              /**
               * scrollTop value where the event is triggered
               */
              scrollTop: "int",
              /**
               * indicates whether user scrolled down
               */
              scrollDown: "boolean"
            }
          },
          /**
           * event for requesting of additional column.
           * Triggered when user scrolled right and reaches the end of rendered/available column.
           * Can be used to append more data only when requested.
           * The listener has to make a call to update the table data to ensure correct scrolling/appending of data.
           */
          horizontalLimitReached: {
            parameters: {
              /**
               * scrollLeft value where event was triggered
               */
              scrollLeft: "int",
              /**
               * indicates whether the user scrolled right
               */
              scrollToRight: "boolean"
            }
          },
          /**
           * event for context menu
           */
          contextMenu: {
            parameters: {
              /**
               * row index of the cell where context menu was triggered
               */
              row: "int",
              /**
               * column index of the cell where context menu was triggered
               */
              column: "int",
              /**
               * browser event for contextmenu
               */
              nativeEvent: "MouseEvent",
              /**
               * description of the target element, e.g. A1, B2, C3... or "title"
               */
              targetDescription: "string",
              /**
               * selection areas of the current selection
               */
              currentSelectionAreas: "object",
              /**
               * indicates whether context menu was triggered on title
               */
              isTitle: "boolean"
            }
          }
        }
      },

      init: function () {
        this.reactTableContainer = this.getReactTableDivContainer(this.getId());
      },

      getReactTableDivContainer: function (sId) {
        var $Div = document.createElement('div');
        $Div.setAttribute('id', sId + '-reactNode');
        $Div.className = "sapUiSACReactNode";
        $Div.className = "reactTableComponent sapSacGridTheming";
        return $Div;
      },

      onAfterRendering: function () {
        var that = this;
        GridUtils.renderSACGrid(that);
        var oSACGridControl = that;

        if (!this._iResizeHandlerId) {
          that.AnchorElement = GridUtils.findAnchorElement(that);
          if (!that.AnchorElement) {
            that.AnchorElement = oSACGridControl;
          }
          var bIsValidParent = that.AnchorElement instanceof sap.ui.core.Control ||
            that.AnchorElement instanceof sap.ui.core.Element ||
            that.AnchorElement instanceof Element;
          if (bIsValidParent) {
            that._iResizeHandlerId = ResizeHandler.register(that.AnchorElement, function (oEvent) {
              var oTableModel = oSACGridControl.mSacTable && oSACGridControl.mSacTable.cachedData;
              if (oTableModel) {
                Utilities.decideWidgetDimensions(oSACGridControl, oTableModel, true);
                Utilities.updateTableData(oSACGridControl, oTableModel);
              }
            });
          }
          // Listen to the theme changes - since we are handling the theme params from javascript
          sap.ui.getCore().attachThemeChanged(function (event) {
            GridUtils.renderSACGrid(that);
          });
        }

      },

      /**
       * internal method that tells the current Grid Format
       * fetches and compares with Pivot tables format to keep the consistency
       * @returns {string} Current Grid Format - Excel style / Business Style
       */
       _getFormat: function() {
        var sGridFormat = this.getFormat();
        var PivotTableControl = this.getParent() && this.getParent().getPivotTable && this.getParent().getPivotTable();
        var sPivotTableFormat = PivotTableControl && PivotTableControl.getFormat && PivotTableControl.getFormat();
        if (sPivotTableFormat && sGridFormat != sPivotTableFormat) {
          sGridFormat = sPivotTableFormat;
        }
        return sGridFormat;
      },

      /**
       * internal method that tells if the current Grid Format
       * is configured by the user to be excel style
       * @returns {boolean} whether the grid is in excel style (with borders around all cells)
       */
      _isExcelStyle: function() {
        return this._getFormat() === Format.ExcelStyle;
      },

      /**
       * internal method that tells the row height completly with border height in excel style
       * @returns {number} complete row height
       */
      _completeRowHeight: function() {
        var iBorderHeight = this._isExcelStyle() ? 1 : 0;
        return this.getRowHeight() + iBorderHeight;
      }

    }
    );
    return Grid;
  }
);
