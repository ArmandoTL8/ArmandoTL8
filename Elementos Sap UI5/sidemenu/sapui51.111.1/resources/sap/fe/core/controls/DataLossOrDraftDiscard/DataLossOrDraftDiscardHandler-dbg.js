/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/ui/core/Fragment", "sap/ui/core/util/XMLPreprocessor", "sap/ui/core/XMLTemplateProcessor", "sap/ui/model/json/JSONModel"], function (Log, Fragment, XMLPreprocessor, XMLTemplateProcessor, JSONModel) {
  "use strict";

  var _exports = {};
  var DraftDataLossOptions;
  (function (DraftDataLossOptions) {
    DraftDataLossOptions["Save"] = "draftDataLossOptionSave";
    DraftDataLossOptions["Keep"] = "draftDataLossOptionKeep";
    DraftDataLossOptions["Discard"] = "draftDataLossOptionDiscard";
  })(DraftDataLossOptions || (DraftDataLossOptions = {}));
  let onDataLossConfirmedFollowUpFunction;
  let onDataLossCancelFollowUpFunction;
  function fnDataLossConfirmation(fnOnDataLossOk, fnOnDataLossCancel, controller, skipBindingToView) {
    // Open the data loss popup and after processing the selected function finally call
    // onDataLossConfirmed which resolves the promise and leads to processing of the originally
    // triggered action like e.g. a back navigation
    let dataLossPopup;
    onDataLossConfirmedFollowUpFunction = fnOnDataLossOk;
    onDataLossCancelFollowUpFunction = fnOnDataLossCancel;
    const fragmentName = "sap.fe.core.controls.DataLossOrDraftDiscard.DataLossDraft";
    const view = controller.getView();
    const fragmentController = {
      onDataLossOk: function () {
        handleDataLossOk(dataLossPopup, controller, onDataLossConfirmedFollowUpFunction, skipBindingToView);
      },
      onDataLossCancel: function () {
        onDataLossCancelFollowUpFunction();
        dataLossPopup.close();
      },
      setDataLossPopup: function (inDataLossPopup) {
        controller.dataLossPopup = inDataLossPopup;
      }
    };
    const localThisModel = new JSONModel({}),
      preprocessorSettings = {
        bindingContexts: {
          this: localThisModel.createBindingContext("/")
        },
        models: {
          this: localThisModel
        }
      };
    if (controller.dataLossPopup) {
      dataLossPopup = controller.dataLossPopup;
      dataLossPopup.open();
      selectAndFocusFirstEntry(dataLossPopup);
    } else {
      const dialogFragment = XMLTemplateProcessor.loadTemplate(fragmentName, "fragment");
      Promise.resolve(XMLPreprocessor.process(dialogFragment, {
        name: fragmentName
      }, preprocessorSettings)).then(fragment => {
        return Fragment.load({
          definition: fragment,
          controller: fragmentController
        });
      }).then(popup => {
        dataLossPopup = popup;
        selectAndFocusFirstEntry(dataLossPopup);
        popup.addEventDelegate({
          onsapenter: function () {
            handleDataLossOk(dataLossPopup, controller, onDataLossConfirmedFollowUpFunction, skipBindingToView);
          }
        });
        view.addDependent(dataLossPopup);
        dataLossPopup.open();
        fragmentController.setDataLossPopup(dataLossPopup);
      }).catch(function (error) {
        Log.error("Error while opening the Discard Dialog fragment", error);
      });
    }
  }
  function performAfterDiscardorKeepDraft(processFunctionOnDatalossOk, processFunctionOnDatalossCancel, controller, skipBindingToView) {
    // Depending on if the user closed the data loss popup with Ok or Cancel,
    // execute the provided follow-up function and resolve or reject the promise
    return new Promise(function (resolve, reject) {
      const dataLossPopupOk = function (context) {
        const returnValue = processFunctionOnDatalossOk(context);
        resolve(returnValue);
      };
      const dataLossPopupCancel = function () {
        processFunctionOnDatalossCancel();
        reject();
      };
      fnDataLossConfirmation(dataLossPopupOk, dataLossPopupCancel, controller, skipBindingToView);
    });
  }
  _exports.performAfterDiscardorKeepDraft = performAfterDiscardorKeepDraft;
  function discardDraft(controller, skipBindingToView) {
    const context = controller.getView().getBindingContext();
    const params = {
      skipBackNavigation: true,
      skipDiscardPopover: true,
      skipBindingToView: skipBindingToView !== undefined ? skipBindingToView : true
    };
    return controller.editFlow.cancelDocument(context, params);
  }
  _exports.discardDraft = discardDraft;
  function saveDocument(controller) {
    const context = controller.getView().getBindingContext();
    // We check if we are on the OP and then call the internal _saveDocument from the OP controller
    // since here some special handling is done for creationRow before editFlow.saveDocument is called.
    // In case of a custom controller we directly call saveDocument from the editFlow
    if (controller.isA("sap.fe.templates.ObjectPage.ObjectPageController")) {
      return controller._saveDocument(context);
    } else {
      return controller.editFlow.saveDocument(context);
    }
  }
  _exports.saveDocument = saveDocument;
  function getSelectedKey(dataLossPopup) {
    // For not using control IDs we introduced customData in the fragment and
    // use it here for finding the correct list in the dialog and for
    // determining the selected option from the list
    const dataLossOptionsList = dataLossPopup.getContent().find(element => element.data("listIdentifier") === "draftDataLossOptionsList");
    return dataLossOptionsList.getSelectedItem().data("itemKey");
  }
  _exports.getSelectedKey = getSelectedKey;
  function selectAndFocusFirstEntry(dataLossPopup) {
    // For not using control IDs we introduced customData in the fragment and
    // use it here for finding the correct list in the dialog.
    const dataLossOptionsList = dataLossPopup.getContent().find(element => element.data("listIdentifier") === "draftDataLossOptionsList");
    // Preselect the first entry in the list
    const firstListItemOption = dataLossOptionsList.getItems()[0];
    dataLossOptionsList.setSelectedItem(firstListItemOption);
    // By default set the focus on the first list item of the dialog
    // We do not set the focus on the button, but catch the ENTER key in the dialog
    // and process it as Ok, since focusing the button was reported as an ACC issue
    firstListItemOption === null || firstListItemOption === void 0 ? void 0 : firstListItemOption.focus();
  }

  /**
   * Executes the logic when the data loss dialog is confirmed.
   *
   * @param dataLossPopup Reference to the data loss dialog
   * @param controller Reference to the controller
   * @param dataLossConfirmationFollowUpFunction The action to be performed after the selected option has been executed
   * @param skipBindingToView Forwarded to discardDraft
   */
  _exports.selectAndFocusFirstEntry = selectAndFocusFirstEntry;
  function handleDataLossOk(dataLossPopup, controller, dataLossConfirmationFollowUpFunction, skipBindingToView) {
    const selectedKey = getSelectedKey(dataLossPopup);
    if (selectedKey === DraftDataLossOptions.Save) {
      saveDocument(controller).then(dataLossConfirmationFollowUpFunction).catch(function (error) {
        Log.error("Error while saving document", error);
      });
      dataLossPopup.close();
    } else if (selectedKey === DraftDataLossOptions.Keep) {
      dataLossConfirmationFollowUpFunction();
      dataLossPopup.close();
    } else if (selectedKey === DraftDataLossOptions.Discard) {
      discardDraft(controller, skipBindingToView).then(dataLossConfirmationFollowUpFunction).catch(function (error) {
        Log.error("Error while discarding draft", error);
      });
      dataLossPopup.close();
    }
  }
  _exports.handleDataLossOk = handleDataLossOk;
  return {
    performAfterDiscardorKeepDraft,
    discardDraft,
    saveDocument,
    getSelectedKey,
    selectAndFocusFirstEntry
  };
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEcmFmdERhdGFMb3NzT3B0aW9ucyIsIm9uRGF0YUxvc3NDb25maXJtZWRGb2xsb3dVcEZ1bmN0aW9uIiwib25EYXRhTG9zc0NhbmNlbEZvbGxvd1VwRnVuY3Rpb24iLCJmbkRhdGFMb3NzQ29uZmlybWF0aW9uIiwiZm5PbkRhdGFMb3NzT2siLCJmbk9uRGF0YUxvc3NDYW5jZWwiLCJjb250cm9sbGVyIiwic2tpcEJpbmRpbmdUb1ZpZXciLCJkYXRhTG9zc1BvcHVwIiwiZnJhZ21lbnROYW1lIiwidmlldyIsImdldFZpZXciLCJmcmFnbWVudENvbnRyb2xsZXIiLCJvbkRhdGFMb3NzT2siLCJoYW5kbGVEYXRhTG9zc09rIiwib25EYXRhTG9zc0NhbmNlbCIsImNsb3NlIiwic2V0RGF0YUxvc3NQb3B1cCIsImluRGF0YUxvc3NQb3B1cCIsImxvY2FsVGhpc01vZGVsIiwiSlNPTk1vZGVsIiwicHJlcHJvY2Vzc29yU2V0dGluZ3MiLCJiaW5kaW5nQ29udGV4dHMiLCJ0aGlzIiwiY3JlYXRlQmluZGluZ0NvbnRleHQiLCJtb2RlbHMiLCJvcGVuIiwic2VsZWN0QW5kRm9jdXNGaXJzdEVudHJ5IiwiZGlhbG9nRnJhZ21lbnQiLCJYTUxUZW1wbGF0ZVByb2Nlc3NvciIsImxvYWRUZW1wbGF0ZSIsIlByb21pc2UiLCJyZXNvbHZlIiwiWE1MUHJlcHJvY2Vzc29yIiwicHJvY2VzcyIsIm5hbWUiLCJ0aGVuIiwiZnJhZ21lbnQiLCJGcmFnbWVudCIsImxvYWQiLCJkZWZpbml0aW9uIiwicG9wdXAiLCJhZGRFdmVudERlbGVnYXRlIiwib25zYXBlbnRlciIsImFkZERlcGVuZGVudCIsImNhdGNoIiwiZXJyb3IiLCJMb2ciLCJwZXJmb3JtQWZ0ZXJEaXNjYXJkb3JLZWVwRHJhZnQiLCJwcm9jZXNzRnVuY3Rpb25PbkRhdGFsb3NzT2siLCJwcm9jZXNzRnVuY3Rpb25PbkRhdGFsb3NzQ2FuY2VsIiwicmVqZWN0IiwiZGF0YUxvc3NQb3B1cE9rIiwiY29udGV4dCIsInJldHVyblZhbHVlIiwiZGF0YUxvc3NQb3B1cENhbmNlbCIsImRpc2NhcmREcmFmdCIsImdldEJpbmRpbmdDb250ZXh0IiwicGFyYW1zIiwic2tpcEJhY2tOYXZpZ2F0aW9uIiwic2tpcERpc2NhcmRQb3BvdmVyIiwidW5kZWZpbmVkIiwiZWRpdEZsb3ciLCJjYW5jZWxEb2N1bWVudCIsInNhdmVEb2N1bWVudCIsImlzQSIsIl9zYXZlRG9jdW1lbnQiLCJnZXRTZWxlY3RlZEtleSIsImRhdGFMb3NzT3B0aW9uc0xpc3QiLCJnZXRDb250ZW50IiwiZmluZCIsImVsZW1lbnQiLCJkYXRhIiwiZ2V0U2VsZWN0ZWRJdGVtIiwiZmlyc3RMaXN0SXRlbU9wdGlvbiIsImdldEl0ZW1zIiwic2V0U2VsZWN0ZWRJdGVtIiwiZm9jdXMiLCJkYXRhTG9zc0NvbmZpcm1hdGlvbkZvbGxvd1VwRnVuY3Rpb24iLCJzZWxlY3RlZEtleSIsIlNhdmUiLCJLZWVwIiwiRGlzY2FyZCJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiRGF0YUxvc3NPckRyYWZ0RGlzY2FyZEhhbmRsZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgdHlwZSBDdXN0b21MaXN0SXRlbSBmcm9tIFwic2FwL20vQ3VzdG9tTGlzdEl0ZW1cIjtcbmltcG9ydCB0eXBlIERpYWxvZyBmcm9tIFwic2FwL20vRGlhbG9nXCI7XG5pbXBvcnQgdHlwZSBMaXN0IGZyb20gXCJzYXAvbS9MaXN0XCI7XG5pbXBvcnQgRnJhZ21lbnQgZnJvbSBcInNhcC91aS9jb3JlL0ZyYWdtZW50XCI7XG5pbXBvcnQgWE1MUHJlcHJvY2Vzc29yIGZyb20gXCJzYXAvdWkvY29yZS91dGlsL1hNTFByZXByb2Nlc3NvclwiO1xuaW1wb3J0IFhNTFRlbXBsYXRlUHJvY2Vzc29yIGZyb20gXCJzYXAvdWkvY29yZS9YTUxUZW1wbGF0ZVByb2Nlc3NvclwiO1xuaW1wb3J0IEpTT05Nb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL2pzb24vSlNPTk1vZGVsXCI7XG5cbmVudW0gRHJhZnREYXRhTG9zc09wdGlvbnMge1xuXHRTYXZlID0gXCJkcmFmdERhdGFMb3NzT3B0aW9uU2F2ZVwiLFxuXHRLZWVwID0gXCJkcmFmdERhdGFMb3NzT3B0aW9uS2VlcFwiLFxuXHREaXNjYXJkID0gXCJkcmFmdERhdGFMb3NzT3B0aW9uRGlzY2FyZFwiXG59XG5cbmxldCBvbkRhdGFMb3NzQ29uZmlybWVkRm9sbG93VXBGdW5jdGlvbjogRnVuY3Rpb247XG5sZXQgb25EYXRhTG9zc0NhbmNlbEZvbGxvd1VwRnVuY3Rpb246IEZ1bmN0aW9uO1xuZnVuY3Rpb24gZm5EYXRhTG9zc0NvbmZpcm1hdGlvbihmbk9uRGF0YUxvc3NPazogYW55LCBmbk9uRGF0YUxvc3NDYW5jZWw6IGFueSwgY29udHJvbGxlcjogYW55LCBza2lwQmluZGluZ1RvVmlldzogYW55KSB7XG5cdC8vIE9wZW4gdGhlIGRhdGEgbG9zcyBwb3B1cCBhbmQgYWZ0ZXIgcHJvY2Vzc2luZyB0aGUgc2VsZWN0ZWQgZnVuY3Rpb24gZmluYWxseSBjYWxsXG5cdC8vIG9uRGF0YUxvc3NDb25maXJtZWQgd2hpY2ggcmVzb2x2ZXMgdGhlIHByb21pc2UgYW5kIGxlYWRzIHRvIHByb2Nlc3Npbmcgb2YgdGhlIG9yaWdpbmFsbHlcblx0Ly8gdHJpZ2dlcmVkIGFjdGlvbiBsaWtlIGUuZy4gYSBiYWNrIG5hdmlnYXRpb25cblx0bGV0IGRhdGFMb3NzUG9wdXA6IERpYWxvZztcblx0b25EYXRhTG9zc0NvbmZpcm1lZEZvbGxvd1VwRnVuY3Rpb24gPSBmbk9uRGF0YUxvc3NPaztcblx0b25EYXRhTG9zc0NhbmNlbEZvbGxvd1VwRnVuY3Rpb24gPSBmbk9uRGF0YUxvc3NDYW5jZWw7XG5cdGNvbnN0IGZyYWdtZW50TmFtZSA9IFwic2FwLmZlLmNvcmUuY29udHJvbHMuRGF0YUxvc3NPckRyYWZ0RGlzY2FyZC5EYXRhTG9zc0RyYWZ0XCI7XG5cdGNvbnN0IHZpZXcgPSBjb250cm9sbGVyLmdldFZpZXcoKTtcblx0Y29uc3QgZnJhZ21lbnRDb250cm9sbGVyOiBhbnkgPSB7XG5cdFx0b25EYXRhTG9zc09rOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRoYW5kbGVEYXRhTG9zc09rKGRhdGFMb3NzUG9wdXAsIGNvbnRyb2xsZXIsIG9uRGF0YUxvc3NDb25maXJtZWRGb2xsb3dVcEZ1bmN0aW9uLCBza2lwQmluZGluZ1RvVmlldyk7XG5cdFx0fSxcblx0XHRvbkRhdGFMb3NzQ2FuY2VsOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRvbkRhdGFMb3NzQ2FuY2VsRm9sbG93VXBGdW5jdGlvbigpO1xuXHRcdFx0ZGF0YUxvc3NQb3B1cC5jbG9zZSgpO1xuXHRcdH0sXG5cdFx0c2V0RGF0YUxvc3NQb3B1cDogZnVuY3Rpb24gKGluRGF0YUxvc3NQb3B1cDogRGlhbG9nKSB7XG5cdFx0XHRjb250cm9sbGVyLmRhdGFMb3NzUG9wdXAgPSBpbkRhdGFMb3NzUG9wdXA7XG5cdFx0fVxuXHR9O1xuXG5cdGNvbnN0IGxvY2FsVGhpc01vZGVsID0gbmV3IEpTT05Nb2RlbCh7fSksXG5cdFx0cHJlcHJvY2Vzc29yU2V0dGluZ3MgPSB7XG5cdFx0XHRiaW5kaW5nQ29udGV4dHM6IHtcblx0XHRcdFx0dGhpczogbG9jYWxUaGlzTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoXCIvXCIpXG5cdFx0XHR9LFxuXHRcdFx0bW9kZWxzOiB7XG5cdFx0XHRcdHRoaXM6IGxvY2FsVGhpc01vZGVsXG5cdFx0XHR9XG5cdFx0fTtcblxuXHRpZiAoY29udHJvbGxlci5kYXRhTG9zc1BvcHVwKSB7XG5cdFx0ZGF0YUxvc3NQb3B1cCA9IGNvbnRyb2xsZXIuZGF0YUxvc3NQb3B1cDtcblx0XHRkYXRhTG9zc1BvcHVwLm9wZW4oKTtcblx0XHRzZWxlY3RBbmRGb2N1c0ZpcnN0RW50cnkoZGF0YUxvc3NQb3B1cCk7XG5cdH0gZWxzZSB7XG5cdFx0Y29uc3QgZGlhbG9nRnJhZ21lbnQgPSBYTUxUZW1wbGF0ZVByb2Nlc3Nvci5sb2FkVGVtcGxhdGUoZnJhZ21lbnROYW1lLCBcImZyYWdtZW50XCIpO1xuXHRcdFByb21pc2UucmVzb2x2ZShYTUxQcmVwcm9jZXNzb3IucHJvY2VzcyhkaWFsb2dGcmFnbWVudCwgeyBuYW1lOiBmcmFnbWVudE5hbWUgfSwgcHJlcHJvY2Vzc29yU2V0dGluZ3MpKVxuXHRcdFx0LnRoZW4oKGZyYWdtZW50KSA9PiB7XG5cdFx0XHRcdHJldHVybiBGcmFnbWVudC5sb2FkKHsgZGVmaW5pdGlvbjogZnJhZ21lbnQsIGNvbnRyb2xsZXI6IGZyYWdtZW50Q29udHJvbGxlciB9KTtcblx0XHRcdH0pXG5cdFx0XHQudGhlbigocG9wdXA6IGFueSkgPT4ge1xuXHRcdFx0XHRkYXRhTG9zc1BvcHVwID0gcG9wdXA7XG5cdFx0XHRcdHNlbGVjdEFuZEZvY3VzRmlyc3RFbnRyeShkYXRhTG9zc1BvcHVwKTtcblx0XHRcdFx0cG9wdXAuYWRkRXZlbnREZWxlZ2F0ZSh7XG5cdFx0XHRcdFx0b25zYXBlbnRlcjogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0aGFuZGxlRGF0YUxvc3NPayhkYXRhTG9zc1BvcHVwLCBjb250cm9sbGVyLCBvbkRhdGFMb3NzQ29uZmlybWVkRm9sbG93VXBGdW5jdGlvbiwgc2tpcEJpbmRpbmdUb1ZpZXcpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHRcdHZpZXcuYWRkRGVwZW5kZW50KGRhdGFMb3NzUG9wdXApO1xuXHRcdFx0XHRkYXRhTG9zc1BvcHVwLm9wZW4oKTtcblx0XHRcdFx0ZnJhZ21lbnRDb250cm9sbGVyLnNldERhdGFMb3NzUG9wdXAoZGF0YUxvc3NQb3B1cCk7XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChlcnJvcjogYW55KSB7XG5cdFx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIG9wZW5pbmcgdGhlIERpc2NhcmQgRGlhbG9nIGZyYWdtZW50XCIsIGVycm9yKTtcblx0XHRcdH0pO1xuXHR9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwZXJmb3JtQWZ0ZXJEaXNjYXJkb3JLZWVwRHJhZnQoXG5cdHByb2Nlc3NGdW5jdGlvbk9uRGF0YWxvc3NPazogYW55LFxuXHRwcm9jZXNzRnVuY3Rpb25PbkRhdGFsb3NzQ2FuY2VsOiBhbnksXG5cdGNvbnRyb2xsZXI6IGFueSxcblx0c2tpcEJpbmRpbmdUb1ZpZXc6IGFueVxuKSB7XG5cdC8vIERlcGVuZGluZyBvbiBpZiB0aGUgdXNlciBjbG9zZWQgdGhlIGRhdGEgbG9zcyBwb3B1cCB3aXRoIE9rIG9yIENhbmNlbCxcblx0Ly8gZXhlY3V0ZSB0aGUgcHJvdmlkZWQgZm9sbG93LXVwIGZ1bmN0aW9uIGFuZCByZXNvbHZlIG9yIHJlamVjdCB0aGUgcHJvbWlzZVxuXHRyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmU6ICh2YWx1ZTogYW55KSA9PiB2b2lkLCByZWplY3Q6IChyZWFzb24/OiBhbnkpID0+IHZvaWQpIHtcblx0XHRjb25zdCBkYXRhTG9zc1BvcHVwT2sgPSBmdW5jdGlvbiAoY29udGV4dDogYW55KSB7XG5cdFx0XHRjb25zdCByZXR1cm5WYWx1ZSA9IHByb2Nlc3NGdW5jdGlvbk9uRGF0YWxvc3NPayhjb250ZXh0KTtcblx0XHRcdHJlc29sdmUocmV0dXJuVmFsdWUpO1xuXHRcdH07XG5cdFx0Y29uc3QgZGF0YUxvc3NQb3B1cENhbmNlbCA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdHByb2Nlc3NGdW5jdGlvbk9uRGF0YWxvc3NDYW5jZWwoKTtcblx0XHRcdHJlamVjdCgpO1xuXHRcdH07XG5cdFx0Zm5EYXRhTG9zc0NvbmZpcm1hdGlvbihkYXRhTG9zc1BvcHVwT2ssIGRhdGFMb3NzUG9wdXBDYW5jZWwsIGNvbnRyb2xsZXIsIHNraXBCaW5kaW5nVG9WaWV3KTtcblx0fSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkaXNjYXJkRHJhZnQoY29udHJvbGxlcjogYW55LCBza2lwQmluZGluZ1RvVmlldzogYW55KSB7XG5cdGNvbnN0IGNvbnRleHQgPSBjb250cm9sbGVyLmdldFZpZXcoKS5nZXRCaW5kaW5nQ29udGV4dCgpO1xuXHRjb25zdCBwYXJhbXMgPSB7XG5cdFx0c2tpcEJhY2tOYXZpZ2F0aW9uOiB0cnVlLFxuXHRcdHNraXBEaXNjYXJkUG9wb3ZlcjogdHJ1ZSxcblx0XHRza2lwQmluZGluZ1RvVmlldzogc2tpcEJpbmRpbmdUb1ZpZXcgIT09IHVuZGVmaW5lZCA/IHNraXBCaW5kaW5nVG9WaWV3IDogdHJ1ZVxuXHR9O1xuXHRyZXR1cm4gY29udHJvbGxlci5lZGl0Rmxvdy5jYW5jZWxEb2N1bWVudChjb250ZXh0LCBwYXJhbXMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2F2ZURvY3VtZW50KGNvbnRyb2xsZXI6IGFueSkge1xuXHRjb25zdCBjb250ZXh0ID0gY29udHJvbGxlci5nZXRWaWV3KCkuZ2V0QmluZGluZ0NvbnRleHQoKTtcblx0Ly8gV2UgY2hlY2sgaWYgd2UgYXJlIG9uIHRoZSBPUCBhbmQgdGhlbiBjYWxsIHRoZSBpbnRlcm5hbCBfc2F2ZURvY3VtZW50IGZyb20gdGhlIE9QIGNvbnRyb2xsZXJcblx0Ly8gc2luY2UgaGVyZSBzb21lIHNwZWNpYWwgaGFuZGxpbmcgaXMgZG9uZSBmb3IgY3JlYXRpb25Sb3cgYmVmb3JlIGVkaXRGbG93LnNhdmVEb2N1bWVudCBpcyBjYWxsZWQuXG5cdC8vIEluIGNhc2Ugb2YgYSBjdXN0b20gY29udHJvbGxlciB3ZSBkaXJlY3RseSBjYWxsIHNhdmVEb2N1bWVudCBmcm9tIHRoZSBlZGl0Rmxvd1xuXHRpZiAoY29udHJvbGxlci5pc0EoXCJzYXAuZmUudGVtcGxhdGVzLk9iamVjdFBhZ2UuT2JqZWN0UGFnZUNvbnRyb2xsZXJcIikpIHtcblx0XHRyZXR1cm4gY29udHJvbGxlci5fc2F2ZURvY3VtZW50KGNvbnRleHQpO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBjb250cm9sbGVyLmVkaXRGbG93LnNhdmVEb2N1bWVudChjb250ZXh0KTtcblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2VsZWN0ZWRLZXkoZGF0YUxvc3NQb3B1cDogRGlhbG9nKSB7XG5cdC8vIEZvciBub3QgdXNpbmcgY29udHJvbCBJRHMgd2UgaW50cm9kdWNlZCBjdXN0b21EYXRhIGluIHRoZSBmcmFnbWVudCBhbmRcblx0Ly8gdXNlIGl0IGhlcmUgZm9yIGZpbmRpbmcgdGhlIGNvcnJlY3QgbGlzdCBpbiB0aGUgZGlhbG9nIGFuZCBmb3Jcblx0Ly8gZGV0ZXJtaW5pbmcgdGhlIHNlbGVjdGVkIG9wdGlvbiBmcm9tIHRoZSBsaXN0XG5cdGNvbnN0IGRhdGFMb3NzT3B0aW9uc0xpc3Q6IExpc3QgPSBkYXRhTG9zc1BvcHVwXG5cdFx0LmdldENvbnRlbnQoKVxuXHRcdC5maW5kKChlbGVtZW50KSA9PiBlbGVtZW50LmRhdGEoXCJsaXN0SWRlbnRpZmllclwiKSA9PT0gXCJkcmFmdERhdGFMb3NzT3B0aW9uc0xpc3RcIikgYXMgTGlzdDtcblx0cmV0dXJuIGRhdGFMb3NzT3B0aW9uc0xpc3QuZ2V0U2VsZWN0ZWRJdGVtKCkuZGF0YShcIml0ZW1LZXlcIik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZWxlY3RBbmRGb2N1c0ZpcnN0RW50cnkoZGF0YUxvc3NQb3B1cDogRGlhbG9nKSB7XG5cdC8vIEZvciBub3QgdXNpbmcgY29udHJvbCBJRHMgd2UgaW50cm9kdWNlZCBjdXN0b21EYXRhIGluIHRoZSBmcmFnbWVudCBhbmRcblx0Ly8gdXNlIGl0IGhlcmUgZm9yIGZpbmRpbmcgdGhlIGNvcnJlY3QgbGlzdCBpbiB0aGUgZGlhbG9nLlxuXHRjb25zdCBkYXRhTG9zc09wdGlvbnNMaXN0OiBMaXN0ID0gZGF0YUxvc3NQb3B1cFxuXHRcdC5nZXRDb250ZW50KClcblx0XHQuZmluZCgoZWxlbWVudCkgPT4gZWxlbWVudC5kYXRhKFwibGlzdElkZW50aWZpZXJcIikgPT09IFwiZHJhZnREYXRhTG9zc09wdGlvbnNMaXN0XCIpIGFzIExpc3Q7XG5cdC8vIFByZXNlbGVjdCB0aGUgZmlyc3QgZW50cnkgaW4gdGhlIGxpc3Rcblx0Y29uc3QgZmlyc3RMaXN0SXRlbU9wdGlvbjogQ3VzdG9tTGlzdEl0ZW0gPSBkYXRhTG9zc09wdGlvbnNMaXN0LmdldEl0ZW1zKClbMF0gYXMgQ3VzdG9tTGlzdEl0ZW07XG5cdGRhdGFMb3NzT3B0aW9uc0xpc3Quc2V0U2VsZWN0ZWRJdGVtKGZpcnN0TGlzdEl0ZW1PcHRpb24pO1xuXHQvLyBCeSBkZWZhdWx0IHNldCB0aGUgZm9jdXMgb24gdGhlIGZpcnN0IGxpc3QgaXRlbSBvZiB0aGUgZGlhbG9nXG5cdC8vIFdlIGRvIG5vdCBzZXQgdGhlIGZvY3VzIG9uIHRoZSBidXR0b24sIGJ1dCBjYXRjaCB0aGUgRU5URVIga2V5IGluIHRoZSBkaWFsb2dcblx0Ly8gYW5kIHByb2Nlc3MgaXQgYXMgT2ssIHNpbmNlIGZvY3VzaW5nIHRoZSBidXR0b24gd2FzIHJlcG9ydGVkIGFzIGFuIEFDQyBpc3N1ZVxuXHRmaXJzdExpc3RJdGVtT3B0aW9uPy5mb2N1cygpO1xufVxuXG4vKipcbiAqIEV4ZWN1dGVzIHRoZSBsb2dpYyB3aGVuIHRoZSBkYXRhIGxvc3MgZGlhbG9nIGlzIGNvbmZpcm1lZC5cbiAqXG4gKiBAcGFyYW0gZGF0YUxvc3NQb3B1cCBSZWZlcmVuY2UgdG8gdGhlIGRhdGEgbG9zcyBkaWFsb2dcbiAqIEBwYXJhbSBjb250cm9sbGVyIFJlZmVyZW5jZSB0byB0aGUgY29udHJvbGxlclxuICogQHBhcmFtIGRhdGFMb3NzQ29uZmlybWF0aW9uRm9sbG93VXBGdW5jdGlvbiBUaGUgYWN0aW9uIHRvIGJlIHBlcmZvcm1lZCBhZnRlciB0aGUgc2VsZWN0ZWQgb3B0aW9uIGhhcyBiZWVuIGV4ZWN1dGVkXG4gKiBAcGFyYW0gc2tpcEJpbmRpbmdUb1ZpZXcgRm9yd2FyZGVkIHRvIGRpc2NhcmREcmFmdFxuICovXG5leHBvcnQgZnVuY3Rpb24gaGFuZGxlRGF0YUxvc3NPayhcblx0ZGF0YUxvc3NQb3B1cDogRGlhbG9nLFxuXHRjb250cm9sbGVyOiBhbnksXG5cdGRhdGFMb3NzQ29uZmlybWF0aW9uRm9sbG93VXBGdW5jdGlvbjogRnVuY3Rpb24sXG5cdHNraXBCaW5kaW5nVG9WaWV3OiBib29sZWFuXG4pIHtcblx0Y29uc3Qgc2VsZWN0ZWRLZXkgPSBnZXRTZWxlY3RlZEtleShkYXRhTG9zc1BvcHVwKTtcblx0aWYgKHNlbGVjdGVkS2V5ID09PSBEcmFmdERhdGFMb3NzT3B0aW9ucy5TYXZlKSB7XG5cdFx0c2F2ZURvY3VtZW50KGNvbnRyb2xsZXIpXG5cdFx0XHQudGhlbihkYXRhTG9zc0NvbmZpcm1hdGlvbkZvbGxvd1VwRnVuY3Rpb24pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24gKGVycm9yOiBhbnkpIHtcblx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgc2F2aW5nIGRvY3VtZW50XCIsIGVycm9yKTtcblx0XHRcdH0pO1xuXHRcdGRhdGFMb3NzUG9wdXAuY2xvc2UoKTtcblx0fSBlbHNlIGlmIChzZWxlY3RlZEtleSA9PT0gRHJhZnREYXRhTG9zc09wdGlvbnMuS2VlcCkge1xuXHRcdGRhdGFMb3NzQ29uZmlybWF0aW9uRm9sbG93VXBGdW5jdGlvbigpO1xuXHRcdGRhdGFMb3NzUG9wdXAuY2xvc2UoKTtcblx0fSBlbHNlIGlmIChzZWxlY3RlZEtleSA9PT0gRHJhZnREYXRhTG9zc09wdGlvbnMuRGlzY2FyZCkge1xuXHRcdGRpc2NhcmREcmFmdChjb250cm9sbGVyLCBza2lwQmluZGluZ1RvVmlldylcblx0XHRcdC50aGVuKGRhdGFMb3NzQ29uZmlybWF0aW9uRm9sbG93VXBGdW5jdGlvbilcblx0XHRcdC5jYXRjaChmdW5jdGlvbiAoZXJyb3I6IGFueSkge1xuXHRcdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSBkaXNjYXJkaW5nIGRyYWZ0XCIsIGVycm9yKTtcblx0XHRcdH0pO1xuXHRcdGRhdGFMb3NzUG9wdXAuY2xvc2UoKTtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCB7IHBlcmZvcm1BZnRlckRpc2NhcmRvcktlZXBEcmFmdCwgZGlzY2FyZERyYWZ0LCBzYXZlRG9jdW1lbnQsIGdldFNlbGVjdGVkS2V5LCBz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