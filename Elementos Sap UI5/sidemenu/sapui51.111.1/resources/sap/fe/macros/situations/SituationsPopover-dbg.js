/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/BusyLocker", "sap/fe/macros/ResourceModel", "sap/fe/macros/situations/SituationsText", "sap/m/Button", "sap/m/CustomListItem", "sap/m/HBox", "sap/m/Label", "sap/m/List", "sap/m/ObjectIdentifier", "sap/m/ObjectStatus", "sap/m/ResponsivePopover", "sap/m/Text", "sap/m/Toolbar", "sap/m/VBox"], function (CommonUtils, BusyLocker, ResourceModel, SituationsText, Button, CustomListItem, HBox, Label, List, ObjectIdentifier, ObjectStatus, ResponsivePopover, Text, Toolbar, VBox) {
  "use strict";

  var _exports = {};
  var bindText = SituationsText.bindText;
  function bindTimestamp(timestampPropertyPath) {
    return {
      path: timestampPropertyPath,
      type: "sap.ui.model.odata.type.DateTimeOffset",
      constraints: {
        precision: 7
      },
      formatOptions: {
        relative: true
      }
    };
  }
  let currentSituationIndicator;
  function createListPopover(controller, expectedNumberOfSituations) {
    let listDetailsPopover = null;
    const listPopover = new ResponsivePopover({
      showHeader: false,
      contentHeight: `${expectedNumberOfSituations * 4.5}em`,
      contentWidth: "25em",
      busyIndicatorDelay: 200,
      placement: "Horizontal",
      content: [new List({
        items: {
          path: "_Instance",
          events: {
            dataReceived: () => {
              listPopover.setContentHeight();
            }
          },
          parameters: {
            $orderby: "SitnInstceLastChgdAtDateTime desc",
            $expand: "_InstanceAttribute($expand=_InstanceAttributeValue)" // required for formatting the texts
          },

          template: new CustomListItem({
            type: "Navigation",
            press: goToDetails,
            content: [new HBox({
              items: [new ObjectStatus({
                icon: "sap-icon://alert",
                state: "Warning",
                tooltip: ResourceModel.getText("situation")
              }).addStyleClass("sapUiTinyMarginEnd"), new ObjectIdentifier({
                title: bindText("SituationTitle"),
                text: bindTimestamp("SitnInstceLastChgdAtDateTime")
              })]
            }).addStyleClass("sapUiSmallMarginBeginEnd").addStyleClass("sapUiSmallMarginTopBottom")]
          }),
          templateShareable: false
        },
        showNoData: false
      })]
    });
    function goToList() {
      if (listDetailsPopover) {
        listDetailsPopover.unbindObject();
        listDetailsPopover.close();
      }
      if (currentSituationIndicator) {
        listPopover.openBy(currentSituationIndicator);
      }
    }
    async function goToDetails(event) {
      const pressedItem = event.getSource();
      const context = pressedItem.getBindingContext();
      if (context && currentSituationIndicator) {
        if (listDetailsPopover === null) {
          listDetailsPopover = await createPreviewPopover(controller, goToList);
          controller.getView().addDependent(listDetailsPopover);
        }
        listDetailsPopover.bindElement({
          path: context.getPath(),
          parameters: {
            $expand: "_InstanceAttribute($expand=_InstanceAttributeValue)"
          },
          events: {
            dataReceived: () => {
              BusyLocker.unlock(listDetailsPopover);
            }
          }
        });
        listPopover.close();
        BusyLocker.lock(listDetailsPopover);
        listDetailsPopover.openBy(currentSituationIndicator);
      }
    }
    return listPopover;
  }
  async function createPreviewPopover(controller, back) {
    const toolBarContent = [];
    if (back) {
      toolBarContent.push(new Button({
        type: "Back",
        tooltip: ResourceModel.getText("back"),
        press: back
      }).addStyleClass("sapUiNoMarginEnd"));
    }
    toolBarContent.push(new ObjectStatus({
      state: "Warning",
      icon: "sap-icon://alert",
      tooltip: ResourceModel.getText("situationIconTooltip")
    }).addStyleClass("sapUiSmallMarginBegin"));
    toolBarContent.push(new ObjectIdentifier({
      titleActive: false,
      title: bindText("SituationTitle")
    }).addStyleClass("sapUiSmallMarginEnd"));
    const popoverSettings = {
      contentWidth: "25em",
      contentHeight: "7em",
      placement: "Horizontal",
      customHeader: new Toolbar({
        content: toolBarContent
      }),
      busyIndicatorDelay: 100,
      content: [new VBox({
        items: [new Label({
          text: bindTimestamp("SitnInstceLastChgdAtDateTime")
        }), new Text({
          text: bindText("SituationText")
        }).addStyleClass("sapUiTinyMarginTop")]
      })]
    };
    const shellServices = CommonUtils.getShellServices(controller.getView());
    const navigationArguments = {
      target: {
        action: "displayExtended",
        semanticObject: "SituationInstance"
      }
    };
    const isNavigationSupported = await shellServices.isNavigationSupported([navigationArguments]);
    if (isNavigationSupported[0].supported) {
      popoverSettings.endButton = new Button({
        text: ResourceModel.getText("showDetails"),
        press: event => {
          var _getBindingContext;
          const situationKey = (_getBindingContext = event.getSource().getBindingContext()) === null || _getBindingContext === void 0 ? void 0 : _getBindingContext.getObject(`SitnInstceKey`);
          if (situationKey !== undefined && situationKey !== null && shellServices.crossAppNavService) {
            navigationArguments.params = {
              SitnInstceKey: situationKey
            };
            shellServices.crossAppNavService.toExternal(navigationArguments);
          }
        }
      });
    }
    return new ResponsivePopover(popoverSettings).addStyleClass("sapUiPopupWithPadding").addStyleClass("sapUiResponsivePadding--header");
  }
  async function showPopover(controller, event, situationsNavigationProperty) {
    currentSituationIndicator = event.getSource();
    const bindingContext = currentSituationIndicator.getBindingContext(),
      numberOfSituations = bindingContext.getObject(`${situationsNavigationProperty}/SitnNumberOfInstances`);
    let popover;
    const context = bindingContext.getModel().bindContext(situationsNavigationProperty, bindingContext, {
      $expand: "_Instance($expand=_InstanceAttribute($expand=_InstanceAttributeValue))"
    }).getBoundContext();
    if (numberOfSituations <= 1) {
      popover = await createPreviewPopover(controller);
      popover.setBindingContext(context);
      popover.bindElement({
        path: "_Instance/0"
      });
    } else {
      popover = createListPopover(controller, numberOfSituations);
      popover.setBindingContext(context);
    }
    controller.getView().addDependent(popover);
    popover.openBy(currentSituationIndicator);
  }
  _exports.showPopover = showPopover;
  showPopover.__functionName = "rt.showPopover";
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJiaW5kVGltZXN0YW1wIiwidGltZXN0YW1wUHJvcGVydHlQYXRoIiwicGF0aCIsInR5cGUiLCJjb25zdHJhaW50cyIsInByZWNpc2lvbiIsImZvcm1hdE9wdGlvbnMiLCJyZWxhdGl2ZSIsImN1cnJlbnRTaXR1YXRpb25JbmRpY2F0b3IiLCJjcmVhdGVMaXN0UG9wb3ZlciIsImNvbnRyb2xsZXIiLCJleHBlY3RlZE51bWJlck9mU2l0dWF0aW9ucyIsImxpc3REZXRhaWxzUG9wb3ZlciIsImxpc3RQb3BvdmVyIiwiUmVzcG9uc2l2ZVBvcG92ZXIiLCJzaG93SGVhZGVyIiwiY29udGVudEhlaWdodCIsImNvbnRlbnRXaWR0aCIsImJ1c3lJbmRpY2F0b3JEZWxheSIsInBsYWNlbWVudCIsImNvbnRlbnQiLCJMaXN0IiwiaXRlbXMiLCJldmVudHMiLCJkYXRhUmVjZWl2ZWQiLCJzZXRDb250ZW50SGVpZ2h0IiwicGFyYW1ldGVycyIsIiRvcmRlcmJ5IiwiJGV4cGFuZCIsInRlbXBsYXRlIiwiQ3VzdG9tTGlzdEl0ZW0iLCJwcmVzcyIsImdvVG9EZXRhaWxzIiwiSEJveCIsIk9iamVjdFN0YXR1cyIsImljb24iLCJzdGF0ZSIsInRvb2x0aXAiLCJSZXNvdXJjZU1vZGVsIiwiZ2V0VGV4dCIsImFkZFN0eWxlQ2xhc3MiLCJPYmplY3RJZGVudGlmaWVyIiwidGl0bGUiLCJiaW5kVGV4dCIsInRleHQiLCJ0ZW1wbGF0ZVNoYXJlYWJsZSIsInNob3dOb0RhdGEiLCJnb1RvTGlzdCIsInVuYmluZE9iamVjdCIsImNsb3NlIiwib3BlbkJ5IiwiZXZlbnQiLCJwcmVzc2VkSXRlbSIsImdldFNvdXJjZSIsImNvbnRleHQiLCJnZXRCaW5kaW5nQ29udGV4dCIsImNyZWF0ZVByZXZpZXdQb3BvdmVyIiwiZ2V0VmlldyIsImFkZERlcGVuZGVudCIsImJpbmRFbGVtZW50IiwiZ2V0UGF0aCIsIkJ1c3lMb2NrZXIiLCJ1bmxvY2siLCJsb2NrIiwiYmFjayIsInRvb2xCYXJDb250ZW50IiwicHVzaCIsIkJ1dHRvbiIsInRpdGxlQWN0aXZlIiwicG9wb3ZlclNldHRpbmdzIiwiY3VzdG9tSGVhZGVyIiwiVG9vbGJhciIsIlZCb3giLCJMYWJlbCIsIlRleHQiLCJzaGVsbFNlcnZpY2VzIiwiQ29tbW9uVXRpbHMiLCJnZXRTaGVsbFNlcnZpY2VzIiwibmF2aWdhdGlvbkFyZ3VtZW50cyIsInRhcmdldCIsImFjdGlvbiIsInNlbWFudGljT2JqZWN0IiwiaXNOYXZpZ2F0aW9uU3VwcG9ydGVkIiwic3VwcG9ydGVkIiwiZW5kQnV0dG9uIiwic2l0dWF0aW9uS2V5IiwiZ2V0T2JqZWN0IiwidW5kZWZpbmVkIiwiY3Jvc3NBcHBOYXZTZXJ2aWNlIiwicGFyYW1zIiwiU2l0bkluc3RjZUtleSIsInRvRXh0ZXJuYWwiLCJzaG93UG9wb3ZlciIsInNpdHVhdGlvbnNOYXZpZ2F0aW9uUHJvcGVydHkiLCJiaW5kaW5nQ29udGV4dCIsIm51bWJlck9mU2l0dWF0aW9ucyIsInBvcG92ZXIiLCJnZXRNb2RlbCIsImJpbmRDb250ZXh0IiwiZ2V0Qm91bmRDb250ZXh0Iiwic2V0QmluZGluZ0NvbnRleHQiLCJfX2Z1bmN0aW9uTmFtZSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiU2l0dWF0aW9uc1BvcG92ZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IENvbW1vblV0aWxzIGZyb20gXCJzYXAvZmUvY29yZS9Db21tb25VdGlsc1wiO1xuaW1wb3J0IEJ1c3lMb2NrZXIgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL0J1c3lMb2NrZXJcIjtcbmltcG9ydCBQYWdlQ29udHJvbGxlciBmcm9tIFwic2FwL2ZlL2NvcmUvUGFnZUNvbnRyb2xsZXJcIjtcbmltcG9ydCBSZXNvdXJjZU1vZGVsIGZyb20gXCJzYXAvZmUvbWFjcm9zL1Jlc291cmNlTW9kZWxcIjtcbmltcG9ydCB7IGJpbmRUZXh0IH0gZnJvbSBcInNhcC9mZS9tYWNyb3Mvc2l0dWF0aW9ucy9TaXR1YXRpb25zVGV4dFwiO1xuaW1wb3J0IEJ1dHRvbiBmcm9tIFwic2FwL20vQnV0dG9uXCI7XG5pbXBvcnQgQ3VzdG9tTGlzdEl0ZW0gZnJvbSBcInNhcC9tL0N1c3RvbUxpc3RJdGVtXCI7XG5pbXBvcnQgSEJveCBmcm9tIFwic2FwL20vSEJveFwiO1xuaW1wb3J0IExhYmVsIGZyb20gXCJzYXAvbS9MYWJlbFwiO1xuaW1wb3J0IExpc3QgZnJvbSBcInNhcC9tL0xpc3RcIjtcbmltcG9ydCBPYmplY3RJZGVudGlmaWVyIGZyb20gXCJzYXAvbS9PYmplY3RJZGVudGlmaWVyXCI7XG5pbXBvcnQgT2JqZWN0U3RhdHVzIGZyb20gXCJzYXAvbS9PYmplY3RTdGF0dXNcIjtcbmltcG9ydCB0eXBlIHsgJFJlc3BvbnNpdmVQb3BvdmVyU2V0dGluZ3MgfSBmcm9tIFwic2FwL20vUmVzcG9uc2l2ZVBvcG92ZXJcIjtcbmltcG9ydCBSZXNwb25zaXZlUG9wb3ZlciBmcm9tIFwic2FwL20vUmVzcG9uc2l2ZVBvcG92ZXJcIjtcbmltcG9ydCBUZXh0IGZyb20gXCJzYXAvbS9UZXh0XCI7XG5pbXBvcnQgVG9vbGJhciBmcm9tIFwic2FwL20vVG9vbGJhclwiO1xuaW1wb3J0IFZCb3ggZnJvbSBcInNhcC9tL1ZCb3hcIjtcbmltcG9ydCB0eXBlIFVJNUV2ZW50IGZyb20gXCJzYXAvdWkvYmFzZS9FdmVudFwiO1xuaW1wb3J0IHR5cGUgeyBBZ2dyZWdhdGlvbkJpbmRpbmdJbmZvLCBQcm9wZXJ0eUJpbmRpbmdJbmZvIH0gZnJvbSBcInNhcC91aS9iYXNlL01hbmFnZWRPYmplY3RcIjtcbmltcG9ydCB0eXBlIENvbnRyb2wgZnJvbSBcInNhcC91aS9jb3JlL0NvbnRyb2xcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Db250ZXh0XCI7XG5cbmZ1bmN0aW9uIGJpbmRUaW1lc3RhbXAodGltZXN0YW1wUHJvcGVydHlQYXRoOiBzdHJpbmcpOiBQcm9wZXJ0eUJpbmRpbmdJbmZvIHtcblx0cmV0dXJuIHtcblx0XHRwYXRoOiB0aW1lc3RhbXBQcm9wZXJ0eVBhdGgsXG5cdFx0dHlwZTogXCJzYXAudWkubW9kZWwub2RhdGEudHlwZS5EYXRlVGltZU9mZnNldFwiLFxuXHRcdGNvbnN0cmFpbnRzOiB7IHByZWNpc2lvbjogNyB9LFxuXHRcdGZvcm1hdE9wdGlvbnM6IHsgcmVsYXRpdmU6IHRydWUgfVxuXHR9O1xufVxuXG5sZXQgY3VycmVudFNpdHVhdGlvbkluZGljYXRvcjogQ29udHJvbCB8IHVuZGVmaW5lZDtcblxuZnVuY3Rpb24gY3JlYXRlTGlzdFBvcG92ZXIoY29udHJvbGxlcjogUGFnZUNvbnRyb2xsZXIsIGV4cGVjdGVkTnVtYmVyT2ZTaXR1YXRpb25zOiBudW1iZXIpIHtcblx0bGV0IGxpc3REZXRhaWxzUG9wb3ZlcjogUmVzcG9uc2l2ZVBvcG92ZXIgfCBudWxsID0gbnVsbDtcblxuXHRjb25zdCBsaXN0UG9wb3ZlciA9IG5ldyBSZXNwb25zaXZlUG9wb3Zlcih7XG5cdFx0c2hvd0hlYWRlcjogZmFsc2UsXG5cdFx0Y29udGVudEhlaWdodDogYCR7ZXhwZWN0ZWROdW1iZXJPZlNpdHVhdGlvbnMgKiA0LjV9ZW1gLFxuXHRcdGNvbnRlbnRXaWR0aDogXCIyNWVtXCIsXG5cdFx0YnVzeUluZGljYXRvckRlbGF5OiAyMDAsXG5cdFx0cGxhY2VtZW50OiBcIkhvcml6b250YWxcIixcblx0XHRjb250ZW50OiBbXG5cdFx0XHRuZXcgTGlzdCh7XG5cdFx0XHRcdGl0ZW1zOiB7XG5cdFx0XHRcdFx0cGF0aDogXCJfSW5zdGFuY2VcIixcblx0XHRcdFx0XHRldmVudHM6IHtcblx0XHRcdFx0XHRcdGRhdGFSZWNlaXZlZDogKCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRsaXN0UG9wb3Zlci5zZXRDb250ZW50SGVpZ2h0KCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRwYXJhbWV0ZXJzOiB7XG5cdFx0XHRcdFx0XHQkb3JkZXJieTogXCJTaXRuSW5zdGNlTGFzdENoZ2RBdERhdGVUaW1lIGRlc2NcIixcblx0XHRcdFx0XHRcdCRleHBhbmQ6IFwiX0luc3RhbmNlQXR0cmlidXRlKCRleHBhbmQ9X0luc3RhbmNlQXR0cmlidXRlVmFsdWUpXCIgLy8gcmVxdWlyZWQgZm9yIGZvcm1hdHRpbmcgdGhlIHRleHRzXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHR0ZW1wbGF0ZTogbmV3IEN1c3RvbUxpc3RJdGVtKHtcblx0XHRcdFx0XHRcdHR5cGU6IFwiTmF2aWdhdGlvblwiLFxuXHRcdFx0XHRcdFx0cHJlc3M6IGdvVG9EZXRhaWxzLFxuXHRcdFx0XHRcdFx0Y29udGVudDogW1xuXHRcdFx0XHRcdFx0XHRuZXcgSEJveCh7XG5cdFx0XHRcdFx0XHRcdFx0aXRlbXM6IFtcblx0XHRcdFx0XHRcdFx0XHRcdG5ldyBPYmplY3RTdGF0dXMoe1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRpY29uOiBcInNhcC1pY29uOi8vYWxlcnRcIixcblx0XHRcdFx0XHRcdFx0XHRcdFx0c3RhdGU6IFwiV2FybmluZ1wiLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHR0b29sdGlwOiBSZXNvdXJjZU1vZGVsLmdldFRleHQoXCJzaXR1YXRpb25cIilcblx0XHRcdFx0XHRcdFx0XHRcdH0pLmFkZFN0eWxlQ2xhc3MoXCJzYXBVaVRpbnlNYXJnaW5FbmRcIiksXG5cdFx0XHRcdFx0XHRcdFx0XHRuZXcgT2JqZWN0SWRlbnRpZmllcih7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHRpdGxlOiBiaW5kVGV4dChcIlNpdHVhdGlvblRpdGxlXCIpLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHR0ZXh0OiBiaW5kVGltZXN0YW1wKFwiU2l0bkluc3RjZUxhc3RDaGdkQXREYXRlVGltZVwiKVxuXHRcdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0XHRdXG5cdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdFx0LmFkZFN0eWxlQ2xhc3MoXCJzYXBVaVNtYWxsTWFyZ2luQmVnaW5FbmRcIilcblx0XHRcdFx0XHRcdFx0XHQuYWRkU3R5bGVDbGFzcyhcInNhcFVpU21hbGxNYXJnaW5Ub3BCb3R0b21cIilcblx0XHRcdFx0XHRcdF1cblx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XHR0ZW1wbGF0ZVNoYXJlYWJsZTogZmFsc2Vcblx0XHRcdFx0fSBhcyBBZ2dyZWdhdGlvbkJpbmRpbmdJbmZvLFxuXHRcdFx0XHRzaG93Tm9EYXRhOiBmYWxzZVxuXHRcdFx0fSlcblx0XHRdXG5cdH0pO1xuXG5cdGZ1bmN0aW9uIGdvVG9MaXN0KCkge1xuXHRcdGlmIChsaXN0RGV0YWlsc1BvcG92ZXIpIHtcblx0XHRcdGxpc3REZXRhaWxzUG9wb3Zlci51bmJpbmRPYmplY3QoKTtcblx0XHRcdGxpc3REZXRhaWxzUG9wb3Zlci5jbG9zZSgpO1xuXHRcdH1cblx0XHRpZiAoY3VycmVudFNpdHVhdGlvbkluZGljYXRvcikge1xuXHRcdFx0bGlzdFBvcG92ZXIub3BlbkJ5KGN1cnJlbnRTaXR1YXRpb25JbmRpY2F0b3IpO1xuXHRcdH1cblx0fVxuXG5cdGFzeW5jIGZ1bmN0aW9uIGdvVG9EZXRhaWxzKGV2ZW50OiBVSTVFdmVudCkge1xuXHRcdGNvbnN0IHByZXNzZWRJdGVtID0gZXZlbnQuZ2V0U291cmNlKCkgYXMgQ29udHJvbDtcblx0XHRjb25zdCBjb250ZXh0ID0gcHJlc3NlZEl0ZW0uZ2V0QmluZGluZ0NvbnRleHQoKTtcblxuXHRcdGlmIChjb250ZXh0ICYmIGN1cnJlbnRTaXR1YXRpb25JbmRpY2F0b3IpIHtcblx0XHRcdGlmIChsaXN0RGV0YWlsc1BvcG92ZXIgPT09IG51bGwpIHtcblx0XHRcdFx0bGlzdERldGFpbHNQb3BvdmVyID0gYXdhaXQgY3JlYXRlUHJldmlld1BvcG92ZXIoY29udHJvbGxlciwgZ29Ub0xpc3QpO1xuXHRcdFx0XHRjb250cm9sbGVyLmdldFZpZXcoKS5hZGREZXBlbmRlbnQobGlzdERldGFpbHNQb3BvdmVyKTtcblx0XHRcdH1cblxuXHRcdFx0bGlzdERldGFpbHNQb3BvdmVyLmJpbmRFbGVtZW50KHtcblx0XHRcdFx0cGF0aDogY29udGV4dC5nZXRQYXRoKCksXG5cdFx0XHRcdHBhcmFtZXRlcnM6IHsgJGV4cGFuZDogXCJfSW5zdGFuY2VBdHRyaWJ1dGUoJGV4cGFuZD1fSW5zdGFuY2VBdHRyaWJ1dGVWYWx1ZSlcIiB9LFxuXHRcdFx0XHRldmVudHM6IHtcblx0XHRcdFx0XHRkYXRhUmVjZWl2ZWQ6ICgpID0+IHtcblx0XHRcdFx0XHRcdEJ1c3lMb2NrZXIudW5sb2NrKGxpc3REZXRhaWxzUG9wb3Zlcik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0bGlzdFBvcG92ZXIuY2xvc2UoKTtcblxuXHRcdFx0QnVzeUxvY2tlci5sb2NrKGxpc3REZXRhaWxzUG9wb3Zlcik7XG5cdFx0XHRsaXN0RGV0YWlsc1BvcG92ZXIub3BlbkJ5KGN1cnJlbnRTaXR1YXRpb25JbmRpY2F0b3IpO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBsaXN0UG9wb3Zlcjtcbn1cblxuYXN5bmMgZnVuY3Rpb24gY3JlYXRlUHJldmlld1BvcG92ZXIoY29udHJvbGxlcjogUGFnZUNvbnRyb2xsZXIsIGJhY2s/OiAoZXZlbnQ6IFVJNUV2ZW50KSA9PiB2b2lkKSB7XG5cdGNvbnN0IHRvb2xCYXJDb250ZW50OiBDb250cm9sW10gPSBbXTtcblxuXHRpZiAoYmFjaykge1xuXHRcdHRvb2xCYXJDb250ZW50LnB1c2goXG5cdFx0XHRuZXcgQnV0dG9uKHtcblx0XHRcdFx0dHlwZTogXCJCYWNrXCIsXG5cdFx0XHRcdHRvb2x0aXA6IFJlc291cmNlTW9kZWwuZ2V0VGV4dChcImJhY2tcIiksXG5cdFx0XHRcdHByZXNzOiBiYWNrXG5cdFx0XHR9KS5hZGRTdHlsZUNsYXNzKFwic2FwVWlOb01hcmdpbkVuZFwiKVxuXHRcdCk7XG5cdH1cblxuXHR0b29sQmFyQ29udGVudC5wdXNoKFxuXHRcdG5ldyBPYmplY3RTdGF0dXMoe1xuXHRcdFx0c3RhdGU6IFwiV2FybmluZ1wiLFxuXHRcdFx0aWNvbjogXCJzYXAtaWNvbjovL2FsZXJ0XCIsXG5cdFx0XHR0b29sdGlwOiBSZXNvdXJjZU1vZGVsLmdldFRleHQoXCJzaXR1YXRpb25JY29uVG9vbHRpcFwiKVxuXHRcdH0pLmFkZFN0eWxlQ2xhc3MoXCJzYXBVaVNtYWxsTWFyZ2luQmVnaW5cIilcblx0KTtcblxuXHR0b29sQmFyQ29udGVudC5wdXNoKFxuXHRcdG5ldyBPYmplY3RJZGVudGlmaWVyKHtcblx0XHRcdHRpdGxlQWN0aXZlOiBmYWxzZSxcblx0XHRcdHRpdGxlOiBiaW5kVGV4dChcIlNpdHVhdGlvblRpdGxlXCIpXG5cdFx0fSkuYWRkU3R5bGVDbGFzcyhcInNhcFVpU21hbGxNYXJnaW5FbmRcIilcblx0KTtcblxuXHRjb25zdCBwb3BvdmVyU2V0dGluZ3M6ICRSZXNwb25zaXZlUG9wb3ZlclNldHRpbmdzID0ge1xuXHRcdGNvbnRlbnRXaWR0aDogXCIyNWVtXCIsXG5cdFx0Y29udGVudEhlaWdodDogXCI3ZW1cIixcblx0XHRwbGFjZW1lbnQ6IFwiSG9yaXpvbnRhbFwiLFxuXHRcdGN1c3RvbUhlYWRlcjogbmV3IFRvb2xiYXIoeyBjb250ZW50OiB0b29sQmFyQ29udGVudCB9KSxcblx0XHRidXN5SW5kaWNhdG9yRGVsYXk6IDEwMCxcblx0XHRjb250ZW50OiBbXG5cdFx0XHRuZXcgVkJveCh7XG5cdFx0XHRcdGl0ZW1zOiBbXG5cdFx0XHRcdFx0bmV3IExhYmVsKHsgdGV4dDogYmluZFRpbWVzdGFtcChcIlNpdG5JbnN0Y2VMYXN0Q2hnZEF0RGF0ZVRpbWVcIikgfSksXG5cdFx0XHRcdFx0bmV3IFRleHQoeyB0ZXh0OiBiaW5kVGV4dChcIlNpdHVhdGlvblRleHRcIikgfSkuYWRkU3R5bGVDbGFzcyhcInNhcFVpVGlueU1hcmdpblRvcFwiKVxuXHRcdFx0XHRdXG5cdFx0XHR9KVxuXHRcdF1cblx0fTtcblxuXHRjb25zdCBzaGVsbFNlcnZpY2VzID0gQ29tbW9uVXRpbHMuZ2V0U2hlbGxTZXJ2aWNlcyhjb250cm9sbGVyLmdldFZpZXcoKSk7XG5cdGNvbnN0IG5hdmlnYXRpb25Bcmd1bWVudHM6IGFueSA9IHtcblx0XHR0YXJnZXQ6IHtcblx0XHRcdGFjdGlvbjogXCJkaXNwbGF5RXh0ZW5kZWRcIixcblx0XHRcdHNlbWFudGljT2JqZWN0OiBcIlNpdHVhdGlvbkluc3RhbmNlXCJcblx0XHR9XG5cdH07XG5cdGNvbnN0IGlzTmF2aWdhdGlvblN1cHBvcnRlZCA9IGF3YWl0IHNoZWxsU2VydmljZXMuaXNOYXZpZ2F0aW9uU3VwcG9ydGVkKFtuYXZpZ2F0aW9uQXJndW1lbnRzXSk7XG5cblx0aWYgKGlzTmF2aWdhdGlvblN1cHBvcnRlZFswXS5zdXBwb3J0ZWQpIHtcblx0XHRwb3BvdmVyU2V0dGluZ3MuZW5kQnV0dG9uID0gbmV3IEJ1dHRvbih7XG5cdFx0XHR0ZXh0OiBSZXNvdXJjZU1vZGVsLmdldFRleHQoXCJzaG93RGV0YWlsc1wiKSxcblxuXHRcdFx0cHJlc3M6IChldmVudDogVUk1RXZlbnQpID0+IHtcblx0XHRcdFx0Y29uc3Qgc2l0dWF0aW9uS2V5ID0gKGV2ZW50LmdldFNvdXJjZSgpIGFzIENvbnRyb2wpLmdldEJpbmRpbmdDb250ZXh0KCk/LmdldE9iamVjdChgU2l0bkluc3RjZUtleWApO1xuXG5cdFx0XHRcdGlmIChzaXR1YXRpb25LZXkgIT09IHVuZGVmaW5lZCAmJiBzaXR1YXRpb25LZXkgIT09IG51bGwgJiYgc2hlbGxTZXJ2aWNlcy5jcm9zc0FwcE5hdlNlcnZpY2UpIHtcblx0XHRcdFx0XHRuYXZpZ2F0aW9uQXJndW1lbnRzLnBhcmFtcyA9IHsgU2l0bkluc3RjZUtleTogc2l0dWF0aW9uS2V5IH07XG5cdFx0XHRcdFx0c2hlbGxTZXJ2aWNlcy5jcm9zc0FwcE5hdlNlcnZpY2UudG9FeHRlcm5hbChuYXZpZ2F0aW9uQXJndW1lbnRzKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0cmV0dXJuIG5ldyBSZXNwb25zaXZlUG9wb3Zlcihwb3BvdmVyU2V0dGluZ3MpLmFkZFN0eWxlQ2xhc3MoXCJzYXBVaVBvcHVwV2l0aFBhZGRpbmdcIikuYWRkU3R5bGVDbGFzcyhcInNhcFVpUmVzcG9uc2l2ZVBhZGRpbmctLWhlYWRlclwiKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNob3dQb3BvdmVyKGNvbnRyb2xsZXI6IFBhZ2VDb250cm9sbGVyLCBldmVudDogVUk1RXZlbnQsIHNpdHVhdGlvbnNOYXZpZ2F0aW9uUHJvcGVydHk6IHN0cmluZykge1xuXHRjdXJyZW50U2l0dWF0aW9uSW5kaWNhdG9yID0gZXZlbnQuZ2V0U291cmNlKCkgYXMgQ29udHJvbDtcblxuXHRjb25zdCBiaW5kaW5nQ29udGV4dCA9IGN1cnJlbnRTaXR1YXRpb25JbmRpY2F0b3IuZ2V0QmluZGluZ0NvbnRleHQoKSBhcyBDb250ZXh0LFxuXHRcdG51bWJlck9mU2l0dWF0aW9ucyA9IGJpbmRpbmdDb250ZXh0LmdldE9iamVjdChgJHtzaXR1YXRpb25zTmF2aWdhdGlvblByb3BlcnR5fS9TaXRuTnVtYmVyT2ZJbnN0YW5jZXNgKTtcblxuXHRsZXQgcG9wb3ZlcjogUmVzcG9uc2l2ZVBvcG92ZXI7XG5cdGNvbnN0IGNvbnRleHQgPSBiaW5kaW5nQ29udGV4dFxuXHRcdC5nZXRNb2RlbCgpXG5cdFx0LmJpbmRDb250ZXh0KHNpdHVhdGlvbnNOYXZpZ2F0aW9uUHJvcGVydHksIGJpbmRpbmdDb250ZXh0LCB7XG5cdFx0XHQkZXhwYW5kOiBcIl9JbnN0YW5jZSgkZXhwYW5kPV9JbnN0YW5jZUF0dHJpYnV0ZSgkZXhwYW5kPV9JbnN0YW5jZUF0dHJpYnV0ZVZhbHVlKSlcIlxuXHRcdH0gYXMgYW55KVxuXHRcdC5nZXRCb3VuZENvbnRleHQoKTtcblxuXHRpZiAobnVtYmVyT2ZTaXR1YXRpb25zIDw9IDEpIHtcblx0XHRwb3BvdmVyID0gYXdhaXQgY3JlYXRlUHJldmlld1BvcG92ZXIoY29udHJvbGxlcik7XG5cdFx0cG9wb3Zlci5zZXRCaW5kaW5nQ29udGV4dChjb250ZXh0KTtcblx0XHRwb3BvdmVyLmJpbmRFbGVtZW50KHsgcGF0aDogXCJfSW5zdGFuY2UvMFwiIH0pO1xuXHR9IGVsc2Uge1xuXHRcdHBvcG92ZXIgPSBjcmVhdGVMaXN0UG9wb3Zlcihjb250cm9sbGVyLCBudW1iZXJPZlNpdHVhdGlvbnMpO1xuXHRcdHBvcG92ZXIuc2V0QmluZGluZ0NvbnRleHQoY29udGV4dCk7XG5cdH1cblxuXHRjb250cm9sbGVyLmdldFZpZXcoKS5hZGREZXBlbmRlbnQocG9wb3Zlcik7XG5cdHBvcG92ZXIub3BlbkJ5KGN1cnJlbnRTaXR1YXRpb25JbmRpY2F0b3IpO1xufVxuXG5zaG93UG9wb3Zlci5fX2Z1bmN0aW9uTmFtZSA9IFwicnQuc2hvd1BvcG92ZXJcIjtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7O0VBc0JBLFNBQVNBLGFBQWEsQ0FBQ0MscUJBQTZCLEVBQXVCO0lBQzFFLE9BQU87TUFDTkMsSUFBSSxFQUFFRCxxQkFBcUI7TUFDM0JFLElBQUksRUFBRSx3Q0FBd0M7TUFDOUNDLFdBQVcsRUFBRTtRQUFFQyxTQUFTLEVBQUU7TUFBRSxDQUFDO01BQzdCQyxhQUFhLEVBQUU7UUFBRUMsUUFBUSxFQUFFO01BQUs7SUFDakMsQ0FBQztFQUNGO0VBRUEsSUFBSUMseUJBQThDO0VBRWxELFNBQVNDLGlCQUFpQixDQUFDQyxVQUEwQixFQUFFQywwQkFBa0MsRUFBRTtJQUMxRixJQUFJQyxrQkFBNEMsR0FBRyxJQUFJO0lBRXZELE1BQU1DLFdBQVcsR0FBRyxJQUFJQyxpQkFBaUIsQ0FBQztNQUN6Q0MsVUFBVSxFQUFFLEtBQUs7TUFDakJDLGFBQWEsRUFBRyxHQUFFTCwwQkFBMEIsR0FBRyxHQUFJLElBQUc7TUFDdERNLFlBQVksRUFBRSxNQUFNO01BQ3BCQyxrQkFBa0IsRUFBRSxHQUFHO01BQ3ZCQyxTQUFTLEVBQUUsWUFBWTtNQUN2QkMsT0FBTyxFQUFFLENBQ1IsSUFBSUMsSUFBSSxDQUFDO1FBQ1JDLEtBQUssRUFBRTtVQUNOcEIsSUFBSSxFQUFFLFdBQVc7VUFDakJxQixNQUFNLEVBQUU7WUFDUEMsWUFB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