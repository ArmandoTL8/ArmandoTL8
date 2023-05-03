import type AppComponent from "sap/fe/core/AppComponent";
import Button from "sap/m/Button";
import Dialog from "sap/m/Dialog";
import mLibrary from "sap/m/library";
import Component from "sap/ui/core/Component";
import Core from "sap/ui/core/Core";
import HTML from "sap/ui/core/HTML";
import jQuery from "sap/ui/thirdparty/jquery";

const ButtonType = mLibrary.ButtonType;
const TableFullScreenUtil = {
	onFullScreenToggle: function (oFullScreenButton: any) {
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
				const oComponent = Component.getOwnerComponentFor(oTable)!;
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
					(oComponent as AppComponent).getRootControl().addDependent(oTable._oFullScreenDialog);
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
						const oAppComponent = Component.getOwnerComponentFor(oComponent) as AppComponent;
						oFullScreenButton.focus();
						// trigger the automatic scroll to the latest navigated row :
						(oAppComponent.getRootViewController().getView().getController() as any)._scrollTablesToLastNavigatedItems();
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
				if (
					oTable._oGrowingDelegate &&
					oTable._oGrowingDelegate.getGrowingScrollToLoad &&
					oTable._oGrowingDelegate.getGrowingScrollToLoad()
				) {
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

export default TableFullScreenUtil;
