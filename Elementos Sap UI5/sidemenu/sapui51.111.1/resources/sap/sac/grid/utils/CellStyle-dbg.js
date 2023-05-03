sap.ui.define(
    [
        "sap/ui/core/theming/Parameters"
    ],
    function (
        ThemeParams
    ) {
        "use strict";

        var CellStyle = function () {
            var that = this;

            /**
            * Returns array of style object depending on the data level
            * in case of a business style format
            * @param {number} iDataLevel hierarchy level of a cell
            * @param {boolean} bNoPadding if 0 padding for border is needed
            * @returns {array} array of style objects for react table cells
            */
            that.getStyleObjectForHierarchyLevel = function (iDataLevel, bNoPadding) {
                var oStyleObject = {
                    "position": 1, // bottom border
                    "padding": {
                        "right": bNoPadding ? 0 : 1,
                        "left": bNoPadding ? 0 : 1
                    }
                };

                switch (iDataLevel) {
                    case 0:
                        oStyleObject.pattern = that.fetchCellBorderStyleObject("", 10, 0, ThemeParams.get("sapUiChart2"));
                        break;
                    case 1:
                        oStyleObject.pattern = that.fetchCellBorderStyleObject("", 10, 0, ThemeParams.get("sapUiBaseText"));
                        break;
                    case 2:
                        oStyleObject.pattern = that.fetchCellBorderStyleObject("", 10, -1, ThemeParams.get("sapUiBaseText"));
                        break;
                    default:
                }

                return [oStyleObject];
            };

            /**
            * Returns array of style object depending on Semantic Class
            * different scenarios are AC(Actuals), PY(Previous Year), FC(Forecast), PL/BU(Planning/Budget)
            * @param {string} sSemanticClass sceario type
            * @returns {array} array of style objects for react table
            */
            that.getStyleObjectForBusinessScenario = function (sSemanticClass) {
                var oStyleObject = {
                    "position": 1, // Top
                    "padding": {
                        "right": 1,
                        "left": 1
                    }
                };
                switch (sSemanticClass) {
                    case "Actual":
                        // black border
                        oStyleObject.pattern = that.fetchCellBorderStyleObject("", 10, 3, ThemeParams.get("sapUiBlackBorder"), ThemeParams.get("sapUiBaseText"));
                        break;
                    case "Previous":
                        // grey border
                        oStyleObject.pattern = that.fetchCellBorderStyleObject("", 10, 3, ThemeParams.get("sapUiFieldPlaceholderTextColor"));
                        break;
                    case "Forecast":
                        // blue border
                        oStyleObject.pattern = that.fetchCellBorderStyleObject("", 10, 3, ThemeParams.get("sapUiEmphasizedLine", ThemeParams.get("sapUiWhite")));
                        break;
                    case "Budget":
                        // white fill with black border
                        oStyleObject.pattern = that.fetchCellBorderStyleObject("", 10, 3, ThemeParams.get("sapUiWhite"), ThemeParams.get("sapUiBaseText"));
                        break;
                    case "AbsoluteVariance":
                        // light blue border
                        oStyleObject.pattern = that.fetchCellBorderStyleObject("", 10, 3, ThemeParams.get("sapUiSacGridAbsoluteVariance"));
                        break;
                    case "PercentageVariance":
                        // strong blue border
                        oStyleObject.pattern = that.fetchCellBorderStyleObject("", 10, 3, ThemeParams.get("sapUiSacGridPercentageVariance"));
                        break;
                    default:
                }
                return [oStyleObject];
            };

            /**
             * returns the style object of the react table cell border
             *
             * @param {string} sBg background color/image if required or ""
             * @param {number} iStyle style of the border - 10-solid, 11-bg_image, 12-whitefill
             * @param {number} iWidth width of the border
             * @param {string} sColor color fill for the border
             * @param {string} sBorderColor border color of the color fill
             * @returns {object} style object of the cell border
             */
            that.fetchCellBorderStyleObject = function (sBg, iStyle, iWidth, sColor, sBorderColor) {
                return {
                    "background": sBg,
                    "style": iStyle, // 10-solid, 11-bg_image, 12-whitefill
                    "width": iWidth,
                    "color": sColor,
                    "borderColor": sBorderColor
                };
            };

            that.getStyleObjectForAlignmentAndBackGround = function (oCell, iFixedRows) {
                var iCurrentRow = oCell.getRow();
                var sGridCellType = oCell.getCellType();
                var cellBackgroundColor = ThemeParams.get("sapUiListHeaderBackground");
                var oCellCustomData = oCell.data();
                var bNonMeasureStruc = oCellCustomData['cellDimension'] == "NonMeasureStructure";

                var iAlignment = (sGridCellType == "Title" || sGridCellType == "Header") ? -1 : 1;
                iAlignment = (sGridCellType == "Header" && bNonMeasureStruc) ? 0 : iAlignment;
                return {
                    "alignment": {
                        "horizontal": iAlignment
                    },
                    "fillColor": (iCurrentRow < iFixedRows) ? cellBackgroundColor : 'transparent' // for column Headers and Titles
                };
            };
        };

        return new CellStyle();

    });