/*!
 * Copyright (c) 2009-2022 SAP SE, All Rights Reserved
 */

sap.ui.define([
  "sap/ui/core/Control",
  "sap/m/ToggleButton",
  "sap/ui/core/delegate/ItemNavigation",
  "sap/ushell/components/cepsearchresult/app/util/appendStyleVars",
  "sap/ui/dom/includeStylesheet"
  ], function (
  Control,
  Button,
  ItemNavigation,
  appendStyleVars,
  includeStylesheet
) {
  "use strict";

  // Append the style vars for css
  appendStyleVars([
    "sapUiBaseText",
    "sapUiButtonBackground"
  ]);

  // Include the css for the control once
  includeStylesheet(sap.ui.require.toUrl("sap/ushell/components/cepsearchresult/app/cards/searchresultwidget/controls/Paginator.css"));

  /**
   * Paginator for the Search Result List
   *
   * @private
   */
  var Paginator = Control.extend(
    "sap.ushell.components.cepsearchresult.app.cards.searchresultwidget.controls.Paginator", /** @lends sap.ushell.components.cepsearchresult.app.cards.serchresult.controls.Paginator.prototype */ {
    metadata: {
      properties: {
        pageSize: {
          type: "int",
          defaultValue: 5
        },
        count: {
          type: "int",
          defaultValue: 100
        },
        currentPage: {
          type: "int",
          defaultValue: 1
        },
        segmentSize: {
          type: "int",
          defaultValue: 6
        }

      },
      aggregations: {
        _buttons: {
          type: "sap.m.Button",
          multiple: true,
          hidden: true
        }
        },
        events: {
          selectPage: {}
        }
    },
    renderer: function (rm, oControl) {
      rm.openStart("div", oControl);
      rm.class("sapUiCEPCatPag");
      rm.openEnd();
      var aButtons = oControl.getAggregation("_buttons") || [];
      for (var i = 0; i < aButtons.length; i++) {
        rm.renderControl(aButtons[i]);
      }
      rm.close("div");
    }
  });

  // Sets the current page and fires the SelectPage event
  Paginator.prototype._setCurrentPageWithEvent = function (iValue) {
    this.setCurrentPage(iValue);
    var iPageIndex = iValue - 1;
    var iPageSize = this.getPageSize();
    this.fireSelectPage({
      page: iValue,
      startIndex: iPageIndex * iPageSize,
      endIndex: (iPageIndex + 1) * iPageSize - 1
    });
  };

  // Adds the buttons to the paginator. Currently this is
  Paginator.prototype._addButtons = function () {

    // remove the existing buttons
    this.destroyAggregation("_buttons");

    // get some vars to avoid getter calls for all calculations
    var iPageSize = this.getPageSize();
    var iPages = Math.ceil(this.getCount() / iPageSize);
    var iCurrentPage = this.getCurrentPage();
    var iSegmentSize = this.getSegmentSize();
    var iSegments = Math.ceil(iPages / iSegmentSize);
    var iCurrentSegment = Math.ceil(iCurrentPage / iSegmentSize);

     // left arrow
    var oLeftArrow = new Button({
      icon: "sap-icon://navigation-left-arrow",
      enabled: iCurrentPage > 1,
      visible: iPages > 1,
      press: function () {
        this._setCurrentPageWithEvent(iCurrentPage - 1);
      }.bind(this)
    });
    this.addAggregation("_buttons", oLeftArrow);

    // numbered paging buttons, starts with 1
    for (var i = 1; i <= iPages; i++) {
      var oButton = new Button({
        text: "" + i,
        pressed: i === iCurrentPage,
        enabled: i !== iCurrentPage,
        visible: iPages > 1 && (Math.ceil(i / iSegmentSize) === iCurrentSegment ||
          (iCurrentSegment === iSegments && i > iPages - iSegmentSize)),
        press: (function (oPaginator, iPage) {
          return function () {
            oPaginator._setCurrentPageWithEvent(iPage);
          };
        })(this, i)
      });
      oButton.addStyleClass("sapUiCEPCatPagNumber");
      this.addAggregation("_buttons", oButton);
    }

    // right arrow
    var oRightArrow = new Button({
      icon: "sap-icon://navigation-right-arrow",
      enabled: iCurrentPage < iPages,
      visible: iPages > 1,
      press: function () {
        this._setCurrentPageWithEvent(iCurrentPage + 1);
      }.bind(this)
    });
    this.addAggregation("_buttons", oRightArrow);
  };

  Paginator.prototype._removeKeyboardNavigation = function () {
    if (this._oItemNavigation) {
      this.removeDelegate(this._oItemNavigation);
      this._oItemNavigation.destroy();
      this._oItemNavigation = null;
    }
  };

  Paginator.prototype._initNavigation = function () {
    // remove old
    this._removeKeyboardNavigation();

    // create new
    this._oItemNavigation = new ItemNavigation();

    this._oItemNavigation
      .setCycling(false)
      .setTableMode(true, true)
      .setColumns(this.getAggregation("_buttons").length)
      .setRootDomRef(this.getDomRef());

    var aNavigationItems = Array.from(this.getDomRef().querySelectorAll(".sapMBtn"));
    this._oItemNavigation.setItemDomRefs(aNavigationItems);
    // eslint-disable-next-line eqeqeq
    if (this._oItemNavigation.getFocusedIndex() == -1) {
      this._oItemNavigation.setFocusedIndex(this.getCurrentPage() - 1 + 1); //first button is the arrow button
    }
    this.addDelegate(this._oItemNavigation);
  };

  // Before rendering handing
  Paginator.prototype.onBeforeRendering = function () {
    // add the buttons
    this._addButtons();
  };

  // After rendering handing
  Paginator.prototype.onAfterRendering = function () {
    this._initNavigation();
  };

  // Destroy
  Paginator.prototype.destroy = function () {
    this._removeKeyboardNavigation();
    this.destroyAggregation("_buttons");
  };

  return Paginator;
});
