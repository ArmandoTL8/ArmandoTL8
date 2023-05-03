/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/m/Button", "sap/m/Dialog", "sap/m/library", "sap/ui/core/Component", "sap/ui/core/Core", "sap/ui/core/HTML", "sap/ui/thirdparty/jquery"], function (Button, Dialog, mLibrary, Component, Core, HTML, jQuery) {
  "use strict";

  const ButtonType = mLibrary.ButtonType;
  const TableFullScreenUtil = {
    onFullScreenToggle: function (oFullScreenButton) {
      let oTable = oFullScreenButton.getParent().getParent().getParent().getParent();
      let $oTableContent;
      oFullScreenButton._enteringFullScreen = !oFullScreenButton._enteringFullScreen;
      const fnOnFullScreenToggle = this.onFullScreenToggle.bind(this, oFullScreenButton);
      const oMessageBundle = Core.getLibraryResourceBundle("sap.fe.macros");
      if (oFullScreenButton._enteringFullScreen === true) {
        // change the button icon and text
        oFullScreenButton.setIcon("sap-icon://exit-full-screen");
        oFullScreenButton.setTooltip(oMessageBundle.getText("M_COMMON_TABLE_FULLSCREEN_MINIMIZE"));
        // if the table is a responsive table, switch to load on scroll
        // get the dom reference of the control
        $oTableContent = oTable.$();
        // add 100% height to the FlexBox container for the Control to rendering in full screen
        $oTableContent.css("height", "100%");
        // Create an HTML element to add the controls DOM content in the FullScreen dialog
        if (!oTable._oHTML) {
          oTable._oHTML = new HTML({
            preferDOM: false,
            afterRendering: function () {
              if (oTable && oTable._oHTML) {
                const $oHTMLContent = oTable._oHTML.$();
                let oChildren;
                // Get the current HTML Dom content
                if ($oHTMLContent) {
                  // remove any old child content
                  oChildren = $oHTMLContent.children();
                  oChildren.remove();
                  // stretch the content to occupy the whole space
                  $oHTMLContent.css("height", "100%");
                  // append the control dom to HTML content
                  $oHTMLContent.append(oTable.getDomRef());
                }
              }
            }
          });
        }

        // Create and set a fullscreen Dialog (without headers) on the registered control instance
        if (!oTable._oFullScreenDialog) {
          const oComponent = Component.getOwnerComponentFor(oTable);
          oComponent.runAsOwner(function () {
            oTable._oFullScreenDialog = new Dialog({
              showHeader: false,
              stretch: true,
              beforeClose: function () {
                // In case fullscreen dialog was closed due to navigation to another page/view/app, "Esc" click, etc. The dialog close
                // would be triggered externally and we need to clean up and replace the DOM content back to the original location
                if (oTable && oTable._$placeHolder) {
                  fnOnFullScreenToggle();
                }
              },
              endButton: new Button({
                text: oMessageBundle.getText("M_COMMON_TABLE_FULLSCREEN_CLOSE"),
                type: ButtonType.Transparent,
                press: function () {
                  // Just close the dialog here, all the needed processing is triggered
                  // in beforeClose.
                  // This ensures, that we only do it once event if the user presses the
                  // ESC key and the Close button simultaneously
                  oTable._oFullScreenDialog.close();
                }
              }),
              content: [oTable._oHTML]
            });
            oTable._oFullScreenDialog.data("FullScreenDialog", true);
            oComponent.getRootControl().addDependent(oTable._oFullScreenDialog);
          });

          // Set focus back on full-screen button of control
          if (oFullScreenButton) {
            oTable._oFullScreenDialog.attachAfterOpen(function () {
              oFullScreenButton.focus();
              // Hack to update scroll of sap.m.List/ResponsiveTable - 2/2
              if (oTable._oGrowingDelegate && oTable._oGrowingDelegate.onAfterRendering) {
                // Temporarily change the parent of control to Fullscreen Dialog
                oTable._oOldParent = oTable.oParent;
                oTable.oParent = oTable._oFullScreenDialog;
                // update delegate to enable scroll with new parent
                oTable._oGrowingDelegate.onAfterRendering();
                // restore parent
                oTable.oParent = oTable._oOldParent;
                // delete unnecessary props
                delete oTable._oOldParent;
              }
              // Add 100% height to scroll container
              oTable._oFullScreenDialog.$().find(".sapMDialogScroll").css("height", "100%");
            });
            oTable._oFullScreenDialog.attachAfterClose(function () {
              const oAppComponent = Component.getOwnerComponentFor(oComponent);
              oFullScreenButton.focus();
              // trigger the automatic scroll to the latest navigated row :
              oAppComponent.getRootViewController().getView().getController()._scrollTablesToLastNavigatedItems();
            });
          }
          // add the style class from control to the dialog
          oTable._oFullScreenDialog.addStyleClass($oTableContent.closest(".sapUiSizeCompact").length ? "sapUiSizeCompact" : "");
          // add style class to make the scroll container height as 100% (required to stretch UI to 100% e.g. for SmartChart)
          oTable._oFullScreenDialog.addStyleClass("sapUiCompSmartFullScreenDialog");
        }
        // create a dummy div node (place holder)
        oTable._$placeHolder = jQuery(document.createElement("div"));
        // Set the place holder before the current content
        $oTableContent.before(oTable._$placeHolder);
        // Add a dummy div as content of the HTML control
        oTable._oHTML.setContent("<div/>");
        // Hack to update scroll of sap.m.List/ResponsiveTable - 1/2
        if (!oTable._oGrowingDelegate) {
          oTable._oGrowingDelegate = oTable._oTable || oTable._oList;
          if (oTable._oGrowingDelegate && oTable._oGrowingDelegate.getGrowingScrollToLoad && oTable._oGrowingDelegate.getGrowingScrollToLoad()) {
            oTable._oGrowingDelegate = oTable._oGrowingDelegate._oGrowingDelegate;
          } else {
            oTable._oGrowingDelegate = null;
          }
        }
        // open the full screen Dialog
        oTable._oFullScreenDialog.open();
      } else {
        // change the button icon
        oFullScreenButton.setIcon("sap-icon://full-screen");
        oFullScreenButton.setTooltip(oMessageBundle.getText("M_COMMON_TABLE_FULLSCREEN_MAXIMIZE"));
        // Get reference to table
        oTable = oFullScreenButton.getParent().getParent().getParent().getParent();

        // get the HTML controls content --> as it should contain the control's current DOM ref
        $oTableContent = oTable._oHTML.$();
        // Replace the place holder with the Controls DOM ref (child of HTML)
        oTable._$placeHolder.replaceWith($oTableContent.children());
        oTable._$placeHolder = null;
        $oTableContent = null;

        // close the full screen Dialog
        if (oTable._oFullScreenDialog) {
          oTable._oFullScreenDialog.close();
        }
      }
    }
  };
  return TableFullScreenUtil;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCdXR0b25UeXBlIiwibUxpYnJhcnkiLCJUYWJsZUZ1bGxTY3JlZW5VdGlsIiwib25GdWxsU2NyZWVuVG9nZ2xlIiwib0Z1bGxTY3JlZW5CdXR0b24iLCJvVGFibGUiLCJnZXRQYXJlbnQiLCIkb1RhYmxlQ29udGVudCIsIl9lbnRlcmluZ0Z1bGxTY3JlZW4iLCJmbk9uRnVsbFNjcmVlblRvZ2dsZSIsImJpbmQiLCJvTWVzc2FnZUJ1bmRsZSIsIkNvcmUiLCJnZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUiLCJzZXRJY29uIiwic2V0VG9vbHRpcCIsImdldFRleHQiLCIkIiwiY3NzIiwiX29IVE1MIiwiSFRNTCIsInByZWZlckRPTSIsImFmdGVyUmVuZGVyaW5nIiwiJG9IVE1MQ29udGVudCIsIm9DaGlsZHJlbiIsImNoaWxkcmVuIiwicmVtb3ZlIiwiYXBwZW5kIiwiZ2V0RG9tUmVmIiwiX29GdWxsU2NyZWVuRGlhbG9nIiwib0NvbXBvbmVudCIsIkNvbXBvbmVudCIsImdldE93bmVyQ29tcG9uZW50Rm9yIiwicnVuQXNPd25lciIsIkRpYWxvZyIsInNob3dIZWFkZXIiLCJzdHJldGNoIiwiYmVmb3JlQ2xvc2UiLCJfJHBsYWNlSG9sZGVyIiwiZW5kQnV0dG9uIiwiQnV0dG9uIiwidGV4dCIsInR5cGUiLCJUcmFuc3BhcmVudCIsInByZXNzIiwiY2xvc2UiLCJjb250ZW50IiwiZGF0YSIsImdldFJvb3RDb250cm9sIiwiYWRkRGVwZW5kZW50IiwiYXR0YWNoQWZ0ZXJPcGVuIiwiZm9jdXMiLCJfb0dyb3dpbmdEZWxlZ2F0ZSIsIm9uQWZ0ZXJSZW5kZXJpbmciLCJfb09sZFBhcmVudCIsIm9QYXJlbnQiLCJmaW5kIiwiYXR0YWNoQWZ0ZXJDbG9zZSIsIm9BcHBDb21wb25lbnQiLCJnZXRSb290Vmlld0NvbnRyb2xsZXIiLCJnZXRWaWV3IiwiZ2V0Q29udHJvbGxlciIsIl9zY3JvbGxUYWJsZXNUb0xhc3ROYXZpZ2F0ZWRJdGVtcyIsImFkZFN0eWxlQ2xhc3MiLCJjbG9zZXN0IiwibGVuZ3RoIiwialF1ZXJ5IiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiYmVmb3JlIiwic2V0Q29udGVudCIsIl9vVGFibGUiLCJfb0xpc3QiLCJnZXRHcm93aW5nU2Nyb2xsVG9Mb2FkIiwib3BlbiIsInJlcGxhY2VXaXRoIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJUYWJsZUZ1bGxTY3JlZW5VdGlsLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIEFwcENvbXBvbmVudCBmcm9tIFwic2FwL2ZlL2NvcmUvQXBwQ29tcG9uZW50XCI7XG5pbXBvcnQgQnV0dG9uIGZyb20gXCJzYXAvbS9CdXR0b25cIjtcbmltcG9ydCBEaWFsb2cgZnJvbSBcInNhcC9tL0RpYWxvZ1wiO1xuaW1wb3J0IG1MaWJyYXJ5IGZyb20gXCJzYXAvbS9saWJyYXJ5XCI7XG5pbXBvcnQgQ29tcG9uZW50IGZyb20gXCJzYXAvdWkvY29yZS9Db21wb25lbnRcIjtcbmltcG9ydCBDb3JlIGZyb20gXCJzYXAvdWkvY29yZS9Db3JlXCI7XG5pbXBvcnQgSFRNTCBmcm9tIFwic2FwL3VpL2NvcmUvSFRNTFwiO1xuaW1wb3J0IGpRdWVyeSBmcm9tIFwic2FwL3VpL3RoaXJkcGFydHkvanF1ZXJ5XCI7XG5cbmNvbnN0IEJ1dHRvblR5cGUgPSBtTGlicmFyeS5CdXR0b25UeXBlO1xuY29uc3QgVGFibGVGdWxsU2NyZWVuVXRpbCA9IHtcblx0b25GdWxsU2NyZWVuVG9nZ2xlOiBmdW5jdGlvbiAob0Z1bGxTY3JlZW5CdXR0b246IGFueSkge1xuXHRcdGxldCBvVGFibGUgPSBvRnVsbFNjcmVlbkJ1dHRvbi5nZXRQYXJlbnQoKS5nZXRQYXJlbnQoKS5nZXRQYXJlbnQoKS5nZXRQYXJlbnQoKTtcblx0XHRsZXQgJG9UYWJsZUNvbnRlbnQ7XG5cdFx0b0Z1bGxTY3JlZW5CdXR0b24uX2VudGVyaW5nRnVsbFNjcmVlbiA9ICFvRnVsbFNjcmVlbkJ1dHRvbi5fZW50ZXJpbmdGdWxsU2NyZWVuO1xuXHRcdGNvbnN0IGZuT25GdWxsU2NyZWVuVG9nZ2xlID0gdGhpcy5vbkZ1bGxTY3JlZW5Ub2dnbGUuYmluZCh0aGlzLCBvRnVsbFNjcmVlbkJ1dHRvbik7XG5cdFx0Y29uc3Qgb01lc3NhZ2VCdW5kbGUgPSBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5tYWNyb3NcIik7XG5cblx0XHRpZiAob0Z1bGxTY3JlZW5CdXR0b24uX2VudGVyaW5nRnVsbFNjcmVlbiA9PT0gdHJ1ZSkge1xuXHRcdFx0Ly8gY2hhbmdlIHRoZSBidXR0b24gaWNvbiBhbmQgdGV4dFxuXHRcdFx0b0Z1bGxTY3JlZW5CdXR0b24uc2V0SWNvbihcInNhcC1pY29uOi8vZXhpdC1mdWxsLXNjcmVlblwiKTtcblx0XHRcdG9GdWxsU2NyZWVuQnV0dG9uLnNldFRvb2x0aXAob01lc3NhZ2VCdW5kbGUuZ2V0VGV4dChcIk1fQ09NTU9OX1RBQkxFX0ZVTExTQ1JFRU5fTUlOSU1JWkVcIikpO1xuXHRcdFx0Ly8gaWYgdGhlIHRhYmxlIGlzIGEgcmVzcG9uc2l2ZSB0YWJsZSwgc3dpdGNoIHRvIGxvYWQgb24gc2Nyb2xsXG5cdFx0XHQvLyBnZXQgdGhlIGRvbSByZWZlcmVuY2Ugb2YgdGhlIGNvbnRyb2xcblx0XHRcdCRvVGFibGVDb250ZW50ID0gb1RhYmxlLiQoKTtcblx0XHRcdC8vIGFkZCAxMDAlIGhlaWdodCB0byB0aGUgRmxleEJveCBjb250YWluZXIgZm9yIHRoZSBDb250cm9sIHRvIHJlbmRlcmluZyBpbiBmdWxsIHNjcmVlblxuXHRcdFx0JG9UYWJsZUNvbnRlbnQuY3NzKFwiaGVpZ2h0XCIsIFwiMTAwJVwiKTtcblx0XHRcdC8vIENyZWF0ZSBhbiBIVE1MIGVsZW1lbnQgdG8gYWRkIHRoZSBjb250cm9scyBET00gY29udGVudCBpbiB0aGUgRnVsbFNjcmVlbiBkaWFsb2dcblx0XHRcdGlmICghb1RhYmxlLl9vSFRNTCkge1xuXHRcdFx0XHRvVGFibGUuX29IVE1MID0gbmV3IEhUTUwoe1xuXHRcdFx0XHRcdHByZWZlckRPTTogZmFsc2UsXG5cdFx0XHRcdFx0YWZ0ZXJSZW5kZXJpbmc6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdGlmIChvVGFibGUgJiYgb1RhYmxlLl9vSFRNTCkge1xuXHRcdFx0XHRcdFx0XHRjb25zdCAkb0hUTUxDb250ZW50ID0gb1RhYmxlLl9vSFRNTC4kKCk7XG5cdFx0XHRcdFx0XHRcdGxldCBvQ2hpbGRyZW47XG5cdFx0XHRcdFx0XHRcdC8vIEdldCB0aGUgY3VycmVudCBIVE1MIERvbSBjb250ZW50XG5cdFx0XHRcdFx0XHRcdGlmICgkb0hUTUxDb250ZW50KSB7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gcmVtb3ZlIGFueSBvbGQgY2hpbGQgY29udGVudFxuXHRcdFx0XHRcdFx0XHRcdG9DaGlsZHJlbiA9ICRvSFRNTENvbnRlbnQuY2hpbGRyZW4oKTtcblx0XHRcdFx0XHRcdFx0XHRvQ2hpbGRyZW4ucmVtb3ZlKCk7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gc3RyZXRjaCB0aGUgY29udGVudCB0byBvY2N1cHkgdGhlIHdob2xlIHNwYWNlXG5cdFx0XHRcdFx0XHRcdFx0JG9IVE1MQ29udGVudC5jc3MoXCJoZWlnaHRcIiwgXCIxMDAlXCIpO1xuXHRcdFx0XHRcdFx0XHRcdC8vIGFwcGVuZCB0aGUgY29udHJvbCBkb20gdG8gSFRNTCBjb250ZW50XG5cdFx0XHRcdFx0XHRcdFx0JG9IVE1MQ29udGVudC5hcHBlbmQob1RhYmxlLmdldERvbVJlZigpKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIENyZWF0ZSBhbmQgc2V0IGEgZnVsbHNjcmVlbiBEaWFsb2cgKHdpdGhvdXQgaGVhZGVycykgb24gdGhlIHJlZ2lzdGVyZWQgY29udHJvbCBpbnN0YW5jZVxuXHRcdFx0aWYgKCFvVGFibGUuX29GdWxsU2NyZWVuRGlhbG9nKSB7XG5cdFx0XHRcdGNvbnN0IG9Db21wb25lbnQgPSBDb21wb25lbnQuZ2V0T3duZXJDb21wb25lbnRGb3Iob1RhYmxlKSE7XG5cdFx0XHRcdG9Db21wb25lbnQucnVuQXNPd25lcihmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0b1RhYmxlLl9vRnVsbFNjcmVlbkRpYWxvZyA9IG5ldyBEaWFsb2coe1xuXHRcdFx0XHRcdFx0c2hvd0hlYWRlcjogZmFsc2UsXG5cdFx0XHRcdFx0XHRzdHJldGNoOiB0cnVlLFxuXHRcdFx0XHRcdFx0YmVmb3JlQ2xvc2U6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdFx0Ly8gSW4gY2FzZSBmdWxsc2NyZWVuIGRpYWxvZyB3YXMgY2xvc2VkIGR1ZSB0byBuYXZpZ2F0aW9uIHRvIGFub3RoZXIgcGFnZS92aWV3L2FwcCwgXCJFc2NcIiBjbGljaywgZXRjLiBUaGUgZGlhbG9nIGNsb3NlXG5cdFx0XHRcdFx0XHRcdC8vIHdvdWxkIGJlIHRyaWdnZXJlZCBleHRlcm5hbGx5IGFuZCB3ZSBuZWVkIHRvIGNsZWFuIHVwIGFuZCByZXBsYWNlIHRoZSBET00gY29udGVudCBiYWNrIHRvIHRoZSBvcmlnaW5hbCBsb2NhdGlvblxuXHRcdFx0XHRcdFx0XHRpZiAob1RhYmxlICYmIG9UYWJsZS5fJHBsYWNlSG9sZGVyKSB7XG5cdFx0XHRcdFx0XHRcdFx0Zm5PbkZ1bGxTY3JlZW5Ub2dnbGUoKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdGVuZEJ1dHRvbjogbmV3IEJ1dHRvbih7XG5cdFx0XHRcdFx0XHRcdHRleHQ6IG9NZXNzYWdlQnVuZGxlLmdldFRleHQoXCJNX0NPTU1PTl9UQUJMRV9GVUxMU0NSRUVOX0NMT1NFXCIpLFxuXHRcdFx0XHRcdFx0XHR0eXBlOiBCdXR0b25UeXBlLlRyYW5zcGFyZW50LFxuXHRcdFx0XHRcdFx0XHRwcmVzczogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0XHRcdC8vIEp1c3QgY2xvc2UgdGhlIGRpYWxvZyBoZXJlLCBhbGwgdGhlIG5lZWRlZCBwcm9jZXNzaW5nIGlzIHRyaWdnZXJlZFxuXHRcdFx0XHRcdFx0XHRcdC8vIGluIGJlZm9yZUNsb3NlLlxuXHRcdFx0XHRcdFx0XHRcdC8vIFRoaXMgZW5zdXJlcywgdGhhdCB3ZSBvbmx5IGRvIGl0IG9uY2UgZXZlbnQgaWYgdGhlIHVzZXIgcHJlc3NlcyB0aGVcblx0XHRcdFx0XHRcdFx0XHQvLyBFU0Mga2V5IGFuZCB0aGUgQ2xvc2UgYnV0dG9uIHNpbXVsdGFuZW91c2x5XG5cdFx0XHRcdFx0XHRcdFx0b1RhYmxlLl9vRnVsbFNjcmVlbkRpYWxvZy5jbG9zZSgpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XHRcdGNvbnRlbnQ6IFtvVGFibGUuX29IVE1MXVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdG9UYWJsZS5fb0Z1bGxTY3JlZW5EaWFsb2cuZGF0YShcIkZ1bGxTY3JlZW5EaWFsb2dcIiwgdHJ1ZSk7XG5cdFx0XHRcdFx0KG9Db21wb25lbnQgYXMgQXBwQ29tcG9uZW50KS5nZXRSb290Q29udHJvbCgpLmFkZERlcGVuZGVudChvVGFibGUuX29GdWxsU2NyZWVuRGlhbG9nKTtcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0Ly8gU2V0IGZvY3VzIGJhY2sgb24gZnVsbC1zY3JlZW4gYnV0dG9uIG9mIGNvbnRyb2xcblx0XHRcdFx0aWYgKG9GdWxsU2NyZWVuQnV0dG9uKSB7XG5cdFx0XHRcdFx0b1RhYmxlLl9vRnVsbFNjcmVlbkRpYWxvZy5hdHRhY2hBZnRlck9wZW4oZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0b0Z1bGxTY3JlZW5CdXR0b24uZm9jdXMoKTtcblx0XHRcdFx0XHRcdC8vIEhhY2sgdG8gdXBkYXRlIHNjcm9sbCBvZiBzYXAubS5MaXN0L1Jlc3BvbnNpdmVUYWJsZSAtIDIvMlxuXHRcdFx0XHRcdFx0aWYgKG9UYWJsZS5fb0dyb3dpbmdEZWxlZ2F0ZSAmJiBvVGFibGUuX29Hcm93aW5nRGVsZWdhdGUub25BZnRlclJlbmRlcmluZykge1xuXHRcdFx0XHRcdFx0XHQvLyBUZW1wb3JhcmlseSBjaGFuZ2UgdGhlIHBhcmVudCBvZiBjb250cm9sIHRvIEZ1bGxzY3JlZW4gRGlhbG9nXG5cdFx0XHRcdFx0XHRcdG9UYWJsZS5fb09sZFBhcmVudCA9IG9UYWJsZS5vUGFyZW50O1xuXHRcdFx0XHRcdFx0XHRvVGFibGUub1BhcmVudCA9IG9UYWJsZS5fb0Z1bGxTY3JlZW5EaWFsb2c7XG5cdFx0XHRcdFx0XHRcdC8vIHVwZGF0ZSBkZWxlZ2F0ZSB0byBlbmFibGUgc2Nyb2xsIHdpdGggbmV3IHBhcmVudFxuXHRcdFx0XHRcdFx0XHRvVGFibGUuX29Hcm93aW5nRGVsZWdhdGUub25BZnRlclJlbmRlcmluZygpO1xuXHRcdFx0XHRcdFx0XHQvLyByZXN0b3JlIHBhcmVudFxuXHRcdFx0XHRcdFx0XHRvVGFibGUub1BhcmVudCA9IG9UYWJsZS5fb09sZFBhcmVudDtcblx0XHRcdFx0XHRcdFx0Ly8gZGVsZXRlIHVubmVjZXNzYXJ5IHByb3BzXG5cdFx0XHRcdFx0XHRcdGRlbGV0ZSBvVGFibGUuX29PbGRQYXJlbnQ7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHQvLyBBZGQgMTAwJSBoZWlnaHQgdG8gc2Nyb2xsIGNvbnRhaW5lclxuXHRcdFx0XHRcdFx0b1RhYmxlLl9vRnVsbFNjcmVlbkRpYWxvZy4kKCkuZmluZChcIi5zYXBNRGlhbG9nU2Nyb2xsXCIpLmNzcyhcImhlaWdodFwiLCBcIjEwMCVcIik7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0b1RhYmxlLl9vRnVsbFNjcmVlbkRpYWxvZy5hdHRhY2hBZnRlckNsb3NlKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdGNvbnN0IG9BcHBDb21wb25lbnQgPSBDb21wb25lbnQuZ2V0T3duZXJDb21wb25lbnRGb3Iob0NvbXBvbmVudCkgYXMgQXBwQ29tcG9uZW50O1xuXHRcdFx0XHRcdFx0b0Z1bGxTY3JlZW5CdXR0b24uZm9jdXMoKTtcblx0XHRcdFx0XHRcdC8vIHRyaWdnZXIgdGhlIGF1dG9tYXRpYyBzY3JvbGwgdG8gdGhlIGxhdGVzdCBuYXZpZ2F0ZWQgcm93IDpcblx0XHRcdFx0XHRcdChvQXBwQ29tcG9uZW50LmdldFJvb3RWaWV3Q29udHJvbGxlcigpLmdldFZpZXcoKS5nZXRDb250cm9sbGVyKCkgYXMgYW55KS5fc2Nyb2xsVGFibGVzVG9MYXN0TmF2aWdhdGVkSXRlbXMoKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0XHQvLyBhZGQgdGhlIHN0eWxlIGNsYXNzIGZyb20gY29udHJvbCB0byB0aGUgZGlhbG9nXG5cdFx0XHRcdG9UYWJsZS5fb0Z1bGxTY3JlZW5EaWFsb2cuYWRkU3R5bGVDbGFzcygkb1RhYmxlQ29udGVudC5jbG9zZXN0KFwiLnNhcFVpU2l6ZUNvbXBhY3RcIikubGVuZ3RoID8gXCJzYXBVaVNpemVDb21wYWN0XCIgOiBcIlwiKTtcblx0XHRcdFx0Ly8gYWRkIHN0eWxlIGNsYXNzIHRvIG1ha2UgdGhlIHNjcm9sbCBjb250YWluZXIgaGVpZ2h0IGFzIDEwMCUgKHJlcXVpcmVkIHRvIHN0cmV0Y2ggVUkgdG8gMTAwJSBlLmcuIGZvciBTbWFydENoYXJ0KVxuXHRcdFx0XHRvVGFibGUuX29GdWxsU2NyZWVuRGlhbG9nLmFkZFN0eWxlQ2xhc3MoXCJzYXBVaUNvbXBTbWFydEZ1bGxTY3JlZW5EaWFsb2dcIik7XG5cdFx0XHR9XG5cdFx0XHQvLyBjcmVhdGUgYSBkdW1teSBkaXYgbm9kZSAocGxhY2UgaG9sZGVyKVxuXHRcdFx0b1RhYmxlLl8kcGxhY2VIb2xkZXIgPSBqUXVlcnkoZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKSk7XG5cdFx0XHQvLyBTZXQgdGhlIHBsYWNlIGhvbGRlciBiZWZvcmUgdGhlIGN1cnJlbnQgY29udGVudFxuXHRcdFx0JG9UYWJsZUNvbnRlbnQuYmVmb3JlKG9UYWJsZS5fJHBsYWNlSG9sZGVyKTtcblx0XHRcdC8vIEFkZCBhIGR1bW15IGRpdiBhcyBjb250ZW50IG9mIHRoZSBIVE1MIGNvbnRyb2xcblx0XHRcdG9UYWJsZS5fb0hUTUwuc2V0Q29udGVudChcIjxkaXYvPlwiKTtcblx0XHRcdC8vIEhhY2sgdG8gdXBkYXRlIHNjcm9sbCBvZiBzYXAubS5MaXN0L1Jlc3BvbnNpdmVUYWJsZSAtIDEvMlxuXHRcdFx0aWYgKCFvVGFibGUuX29Hcm93aW5nRGVsZWdhdGUpIHtcblx0XHRcdFx0b1RhYmxlLl9vR3Jvd2luZ0RlbGVnYXRlID0gb1RhYmxlLl9vVGFibGUgfHwgb1RhYmxlLl9vTGlzdDtcblx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdG9UYWJsZS5fb0dyb3dpbmdEZWxlZ2F0ZSAmJlxuXHRcdFx0XHRcdG9UYWJsZS5fb0dyb3dpbmdEZWxlZ2F0ZS5nZXRHcm93aW5nU2Nyb2xsVG9Mb2FkICYmXG5cdFx0XHRcdFx0b1RhYmxlLl9vR3Jvd2luZ0RlbGVnYXRlLmdldEdyb3dpbmdTY3JvbGxUb0xvYWQoKVxuXHRcdFx0XHQpIHtcblx0XHRcdFx0XHRvVGFibGUuX29Hcm93aW5nRGVsZWdhdGUgPSBvVGFibGUuX29Hcm93aW5nRGVsZWdhdGUuX29Hcm93aW5nRGVsZWdhdGU7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0b1RhYmxlLl9vR3Jvd2luZ0RlbGVnYXRlID0gbnVsbDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Ly8gb3BlbiB0aGUgZnVsbCBzY3JlZW4gRGlhbG9nXG5cdFx0XHRvVGFibGUuX29GdWxsU2NyZWVuRGlhbG9nLm9wZW4oKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gY2hhbmdlIHRoZSBidXR0b24gaWNvblxuXHRcdFx0b0Z1bGxTY3JlZW5CdXR0b24uc2V0SWNvbihcInNhcC1pY29uOi8vZnVsbC1zY3JlZW5cIik7XG5cdFx0XHRvRnVsbFNjcmVlbkJ1dHRvbi5zZXRUb29sdGlwKG9NZXNzYWdlQnVuZGxlLmdldFRleHQoXCJNX0NPTU1PTl9UQUJMRV9GVUxMU0NSRUVOX01BWElNSVpFXCIpKTtcblx0XHRcdC8vIEdldCByZWZlcmVuY2UgdG8gdGFibGVcblx0XHRcdG9UYWJsZSA9IG9GdWxsU2NyZWVuQnV0dG9uLmdldFBhcmVudCgpLmdldFBhcmVudCgpLmdldFBhcmVudCgpLmdldFBhcmVudCgpO1xuXG5cdFx0XHQvLyBnZXQgdGhlIEhUTUwgY29udHJvbHMgY29udGVudCAtLT4gYXMgaXQgc2hvdWxkIGNvbnRhaW4gdGhlIGNvbnRyb2wncyBjdXJyZW50IERPTSByZWZcblx0XHRcdCRvVGFibGVDb250ZW50ID0gb1RhYmxlLl9vSFRNTC4kKCk7XG5cdFx0XHQvLyBSZXBsYWNlIHRoZSBwbGFjZSBob2xkZXIgd2l0aCB0aGUgQ29udHJvbHMgRE9NIHJlZiAoY2hpbGQgb2YgSFRNTClcblx0XHRcdG9UYWJsZS5fJHBsYWNlSG9sZGVyLnJlcGxhY2VXaXRoKCRvVGFibGVDb250ZW50LmNoaWxkcmVuKCkpO1xuXG5cdFx0XHRvVGFibGUuXyRwbGFjZUhvbGRlciA9IG51bGw7XG5cdFx0XHQkb1RhYmxlQ29udGVudCA9IG51bGw7XG5cblx0XHRcdC8vIGNsb3NlIHRoZSBmdWxsIHNjcmVlbiBEaWFsb2dcblx0XHRcdGlmIChvVGFibGUuX29GdWxsU2NyZWVuRGlhbG9nKSB7XG5cdFx0XHRcdG9UYWJsZS5fb0Z1bGxTY3JlZW5EaWFsb2cuY2xvc2UoKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IFRhYmxlRnVsbFNjcmVlblV0aWw7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7RUFTQSxNQUFNQSxVQUFVLEdBQUdDLFFBQVEsQ0FBQ0QsVUFBVTtFQUN0QyxNQUFNRSxtQkFBbUIsR0FBRztJQUMzQkMsa0JBQWtCLEVBQUUsVUFBVUMsaUJBQXNCLEVBQUU7TUFDckQsSUFBSUMsTUFBTSxHQUFHRCxpQkFBaUIsQ0FBQ0UsU0FBUyxFQUFFLENBQUNBLFNBQVMsRUFBRSxDQUFDQSxTQUFTLEVBQUUsQ0FBQ0EsU0FBUyxFQUFFO01BQzlFLElBQUlDLGNBQWM7TUFDbEJILGlCQUFpQixDQUFDSSxtQkFBbUIsR0FBRyxDQUFDSixpQkFBaUIsQ0FB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