/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/core/Fragment", "sap/ui/core/util/XMLPreprocessor", "sap/ui/core/XMLTemplateProcessor", "sap/ui/mdc/LinkDelegate"], function (Fragment, XMLPreprocessor, XMLTemplateProcessor, LinkDelegate) {
  "use strict";

  return Object.assign({}, LinkDelegate, {
    /**
     * Method called to do the templating of the popover content.
     *
     * @param payload
     * @param metaModel
     * @returns  A promise containing the popover content
     */
    _fnTemplateFragment: async function (payload, metaModel) {
      const fragmentName = "sap.fe.macros.contact.ContactQuickView";
      const preProcessorSettings = {
        bindingContexts: {},
        models: {}
      };
      const contactContext = metaModel.createBindingContext(payload.contact);
      if (payload.contact && contactContext) {
        preProcessorSettings.bindingContexts = {
          contact: contactContext
        };
        preProcessorSettings.models = {
          contact: metaModel
        };
      }
      const fragment = XMLTemplateProcessor.loadTemplate(fragmentName, "fragment");
      const templatedFragment = await XMLPreprocessor.process(fragment, {
        name: fragmentName
      }, preProcessorSettings);
      return Fragment.load({
        definition: templatedFragment,
        controller: this
      });
    },
    /**
     * Method calls by the mdc.field to determine what should be the content of the popup when mdcLink#open is called.
     *
     * @param payload
     * @param mdcLinkControl
     * @returns A promise containing the popover content
     */
    fetchAdditionalContent: async function (payload, mdcLinkControl) {
      var _payload$navigationPa;
      const navigateRegexpMatch = (_payload$navigationPa = payload.navigationPath) === null || _payload$navigationPa === void 0 ? void 0 : _payload$navigationPa.match(/{(.*?)}/);
      const bindingContext = navigateRegexpMatch && navigateRegexpMatch.length > 1 && navigateRegexpMatch[1] ? mdcLinkControl.getModel().bindContext(navigateRegexpMatch[1], mdcLinkControl.getBindingContext(), {
        $$ownRequest: true
      }) : null;
      if (mdcLinkControl.isA("sap.ui.mdc.Link")) {
        const metaModel = mdcLinkControl.getModel().getMetaModel();
        const popoverContent = await this._fnTemplateFragment(payload, metaModel);
        if (bindingContext) {
          popoverContent.setBindingContext(bindingContext.getBoundContext());
        }
        return [popoverContent];
      }
      return Promise.resolve([]);
    },
    fetchLinkType: async function () {
      return {
        initialType: {
          type: 2,
          // this means mdcLink.open will open a popup which shows content retrieved by fetchAdditionalContent
          directLink: undefined
        },
        runtimeType: undefined
      };
    }
  });
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJPYmplY3QiLCJhc3NpZ24iLCJMaW5rRGVsZWdhdGUiLCJfZm5UZW1wbGF0ZUZyYWdtZW50IiwicGF5bG9hZCIsIm1ldGFNb2RlbCIsImZyYWdtZW50TmFtZSIsInByZVByb2Nlc3NvclNldHRpbmdzIiwiYmluZGluZ0NvbnRleHRzIiwibW9kZWxzIiwiY29udGFjdENvbnRleHQiLCJjcmVhdGVCaW5kaW5nQ29udGV4dCIsImNvbnRhY3QiLCJmcmFnbWVudCIsIlhNTFRlbXBsYXRlUHJvY2Vzc29yIiwibG9hZFRlbXBsYXRlIiwidGVtcGxhdGVkRnJhZ21lbnQiLCJYTUxQcmVwcm9jZXNzb3IiLCJwcm9jZXNzIiwibmFtZSIsIkZyYWdtZW50IiwibG9hZCIsImRlZmluaXRpb24iLCJjb250cm9sbGVyIiwiZmV0Y2hBZGRpdGlvbmFsQ29udGVudCIsIm1kY0xpbmtDb250cm9sIiwibmF2aWdhdGVSZWdleHBNYXRjaCIsIm5hdmlnYXRpb25QYXRoIiwibWF0Y2giLCJiaW5kaW5nQ29udGV4dCIsImxlbmd0aCIsImdldE1vZGVsIiwiYmluZENvbnRleHQiLCJnZXRCaW5kaW5nQ29udGV4dCIsIiQkb3duUmVxdWVzdCIsImlzQSIsImdldE1ldGFNb2RlbCIsInBvcG92ZXJDb250ZW50Iiwic2V0QmluZGluZ0NvbnRleHQiLCJnZXRCb3VuZENvbnRleHQiLCJQcm9taXNlIiwicmVzb2x2ZSIsImZldGNoTGlua1R5cGUiLCJpbml0aWFsVHlwZSIsInR5cGUiLCJkaXJlY3RMaW5rIiwidW5kZWZpbmVkIiwicnVudGltZVR5cGUiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkNvbnRhY3REZWxlZ2F0ZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgRnJhZ21lbnQgZnJvbSBcInNhcC91aS9jb3JlL0ZyYWdtZW50XCI7XG5pbXBvcnQgWE1MUHJlcHJvY2Vzc29yIGZyb20gXCJzYXAvdWkvY29yZS91dGlsL1hNTFByZXByb2Nlc3NvclwiO1xuaW1wb3J0IFhNTFRlbXBsYXRlUHJvY2Vzc29yIGZyb20gXCJzYXAvdWkvY29yZS9YTUxUZW1wbGF0ZVByb2Nlc3NvclwiO1xuXG5pbXBvcnQgdHlwZSBDb250cm9sIGZyb20gXCJzYXAvdWkvY29yZS9Db250cm9sXCI7XG5pbXBvcnQgTGlua0RlbGVnYXRlIGZyb20gXCJzYXAvdWkvbWRjL0xpbmtEZWxlZ2F0ZVwiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L0NvbnRleHRcIjtcbmltcG9ydCB0eXBlIE9EYXRhTWV0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFNZXRhTW9kZWxcIjtcblxudHlwZSBDb250YWN0UGF5bG9hZCA9IHsgbmF2aWdhdGlvblBhdGg6IHN0cmluZzsgY29udGFjdDogc3RyaW5nIH07XG5cbmV4cG9ydCBkZWZhdWx0IE9iamVjdC5hc3NpZ24oe30sIExpbmtEZWxlZ2F0ZSwge1xuXHQvKipcblx0ICogTWV0aG9kIGNhbGxlZCB0byBkbyB0aGUgdGVtcGxhdGluZyBvZiB0aGUgcG9wb3ZlciBjb250ZW50LlxuXHQgKlxuXHQgKiBAcGFyYW0gcGF5bG9hZFxuXHQgKiBAcGFyYW0gbWV0YU1vZGVsXG5cdCAqIEByZXR1cm5zICBBIHByb21pc2UgY29udGFpbmluZyB0aGUgcG9wb3ZlciBjb250ZW50XG5cdCAqL1xuXHRfZm5UZW1wbGF0ZUZyYWdtZW50OiBhc3luYyBmdW5jdGlvbiAocGF5bG9hZDogQ29udGFjdFBheWxvYWQsIG1ldGFNb2RlbDogT0RhdGFNZXRhTW9kZWwpIHtcblx0XHRjb25zdCBmcmFnbWVudE5hbWUgPSBcInNhcC5mZS5tYWNyb3MuY29udGFjdC5Db250YWN0UXVpY2tWaWV3XCI7XG5cdFx0Y29uc3QgcHJlUHJvY2Vzc29yU2V0dGluZ3M6IHsgYmluZGluZ0NvbnRleHRzOiBvYmplY3Q7IG1vZGVsczogb2JqZWN0IH0gPSB7IGJpbmRpbmdDb250ZXh0czoge30sIG1vZGVsczoge30gfTtcblx0XHRjb25zdCBjb250YWN0Q29udGV4dCA9IG1ldGFNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChwYXlsb2FkLmNvbnRhY3QpO1xuXHRcdGlmIChwYXlsb2FkLmNvbnRhY3QgJiYgY29udGFjdENvbnRleHQpIHtcblx0XHRcdHByZVByb2Nlc3NvclNldHRpbmdzLmJpbmRpbmdDb250ZXh0cyA9IHtcblx0XHRcdFx0Y29udGFjdDogY29udGFjdENvbnRleHRcblx0XHRcdH07XG5cdFx0XHRwcmVQcm9jZXNzb3JTZXR0aW5ncy5tb2RlbHMgPSB7XG5cdFx0XHRcdGNvbnRhY3Q6IG1ldGFNb2RlbFxuXHRcdFx0fTtcblx0XHR9XG5cblx0XHRjb25zdCBmcmFnbWVudCA9IFhNTFRlbXBsYXRlUHJvY2Vzc29yLmxvYWRUZW1wbGF0ZShmcmFnbWVudE5hbWUsIFwiZnJhZ21lbnRcIik7XG5cdFx0Y29uc3QgdGVtcGxhdGVkRnJhZ21lbnQgPSBhd2FpdCBYTUxQcmVwcm9jZXNzb3IucHJvY2VzcyhmcmFnbWVudCwgeyBuYW1lOiBmcmFnbWVudE5hbWUgfSwgcHJlUHJvY2Vzc29yU2V0dGluZ3MpO1xuXHRcdHJldHVybiBGcmFnbWVudC5sb2FkKHtcblx0XHRcdGRlZmluaXRpb246IHRlbXBsYXRlZEZyYWdtZW50LFxuXHRcdFx0Y29udHJvbGxlcjogdGhpc1xuXHRcdH0pO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBNZXRob2QgY2FsbHMgYnkgdGhlIG1kYy5maWVsZCB0byBkZXRlcm1pbmUgd2hhdCBzaG91bGQgYmUgdGhlIGNvbnRlbnQgb2YgdGhlIHBvcHVwIHdoZW4gbWRjTGluayNvcGVuIGlzIGNhbGxlZC5cblx0ICpcblx0ICogQHBhcmFtIHBheWxvYWRcblx0ICogQHBhcmFtIG1kY0xpbmtDb250cm9sXG5cdCAqIEByZXR1cm5zIEEgcHJvbWlzZSBjb250YWluaW5nIHRoZSBwb3BvdmVyIGNvbnRlbnRcblx0ICovXG5cdGZldGNoQWRkaXRpb25hbENvbnRlbnQ6IGFzeW5jIGZ1bmN0aW9uIChwYXlsb2FkOiBDb250YWN0UGF5bG9hZCwgbWRjTGlua0NvbnRyb2w6IENvbnRyb2wpIHtcblx0XHRjb25zdCBuYXZpZ2F0ZVJlZ2V4cE1hdGNoID0gcGF5bG9hZC5uYXZpZ2F0aW9uUGF0aD8ubWF0Y2goL3soLio/KX0vKTtcblx0XHRjb25zdCBiaW5kaW5nQ29udGV4dCA9XG5cdFx0XHRuYXZpZ2F0ZVJlZ2V4cE1hdGNoICYmIG5hdmlnYXRlUmVnZXhwTWF0Y2gubGVuZ3RoID4gMSAmJiBuYXZpZ2F0ZVJlZ2V4cE1hdGNoWzFdXG5cdFx0XHRcdD8gbWRjTGlua0NvbnRyb2xcblx0XHRcdFx0XHRcdC5nZXRNb2RlbCgpXG5cdFx0XHRcdFx0XHQuYmluZENvbnRleHQobmF2aWdhdGVSZWdleHBNYXRjaFsxXSwgbWRjTGlua0NvbnRyb2wuZ2V0QmluZGluZ0NvbnRleHQoKSBhcyBDb250ZXh0LCB7ICQkb3duUmVxdWVzdDogdHJ1ZSB9KVxuXHRcdFx0XHQ6IG51bGw7XG5cdFx0aWYgKG1kY0xpbmtDb250cm9sLmlzQShcInNhcC51aS5tZGMuTGlua1wiKSkge1xuXHRcdFx0Y29uc3QgbWV0YU1vZGVsID0gbWRjTGlua0NvbnRyb2wuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSBhcyBPRGF0YU1ldGFNb2RlbDtcblx0XHRcdGNvbnN0IHBvcG92ZXJDb250ZW50ID0gKGF3YWl0IHRoaXMuX2ZuVGVtcGxhdGVGcmFnbWVudChwYXlsb2FkLCBtZXRhTW9kZWwpKSBhcyBDb250cm9sO1xuXHRcdFx0aWYgKGJpbmRpbmdDb250ZXh0KSB7XG5cdFx0XHRcdHBvcG92ZXJDb250ZW50LnNldEJpbmRpbmdDb250ZXh0KGJpbmRpbmdDb250ZXh0LmdldEJvdW5kQ29udGV4dCgpIGFzIENvbnRleHQpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIFtwb3BvdmVyQ29udGVudF07XG5cdFx0fVxuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoW10pO1xuXHR9LFxuXG5cdGZldGNoTGlua1R5cGU6IGFzeW5jIGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0aW5pdGlhbFR5cGU6IHtcblx0XHRcdFx0dHlwZTogMiwgLy8gdGhpcyBtZWFucyBtZGNMaW5rLm9wZW4gd2lsbCBvcGVuIGEgcG9wdXAgd2hpY2ggc2hvd3MgY29udGVudCByZXRyaWV2ZWQgYnkgZmV0Y2hBZGRpdGlvbmFsQ29udGVudFxuXHRcdFx0XHRkaXJlY3RMaW5rOiB1bmRlZmluZWRcblx0XHRcdH0sXG5cdFx0XHRydW50aW1lVHlwZTogdW5kZWZpbmVkXG5cdFx0fTtcblx0fVxufSk7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7U0FXZUEsTUFBTSxDQUFDQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUVDLFlBQVksRUFBRTtJQUM5QztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDQyxtQkFBbUIsRUFBRSxnQkFBZ0JDLE9BQXVCLEVBQUVDLFNBQXlCLEVBQUU7TUFDeEYsTUFBTUMsWUFBWSxHQUFHLHdDQUF3QztNQUM3RCxNQUFNQyxvQkFBaUUsR0FBRztRQUFFQyxlQUFlLEVBQUUsQ0FBQyxDQUFDO1FBQUVDLE1BQU0sRUFBRSxDQUFDO01BQUUsQ0FBQztNQUM3RyxNQUFNQyxjQUFjLEdBQUdMLFNBQVMsQ0FBQ00sb0JBQW9CLENBQUNQLE9BQU8sQ0FBQ1EsT0FBTyxDQUFDO01BQ3RFLElBQUlSLE9BQU8sQ0FBQ1EsT0FBTyxJQUFJRixjQUFjLEVBQUU7UUFDdENILG9CQUFvQixDQUFDQyxlQUFlLEdBQUc7VUFDdENJLE9BQU8sRUFBRUY7UUFDVixDQUFDO1FBQ0RILG9CQUFvQixDQUFDRSxNQUFNLEdBQUc7VUFDN0JHLE9BQU8sRUFBRVA7UUFDVixDQUFDO01BQ0Y7TUFFQSxNQUFNUSxRQUFRLEdBQUdDLG9CQUFvQixDQUFDQyxZQUFZLENBQUNULFlBQVksRUFBRSxVQUFVLENBQUM7TUFDNUUsTUFBTVUsaUJBQWlCLEdBQUcsTUFBTUMsZUFBZSxDQUFDQyxPQUFPLENBQUNMLFFBQVEsRUFBRTtRQUFFTSxJQUFJLEVBQUViO01BQWEsQ0FBQyxFQUFFQyxvQkFBb0IsQ0FBQztNQUMvRyxPQUFPYSxRQUFRLENBQUNDLElBQUksQ0FBQztRQUNwQkMsVUFBVSxFQUFFTixpQkFBaUI7UUFDN0JPLFVBQVUsRUFBRTtNQUNiLENBQUMsQ0FBQztJQUNILENBQUM7SUFFRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDQyxzQkFBc0IsRUFBRSxnQkFBZ0JwQixPQUF1QixFQUFFcUIsY0FBdUIsRUFBRTtNQUFBO01BQ3pGLE1BQU1DLG1CQUFtQiw0QkFBR3RCLE9BQU8sQ0FBQ3VCLGNBQWMsMERBQXRCLHNCQUF3QkMsS0FBSyxDQUFDLFNBQVMsQ0FBQztNQUNwRSxNQUFNQyxjQUFjLEdBQ25CSCxtQkFBbUIsSUFBSUEsbUJBQW1CLENBQUNJLE1BQU0sR0FBRyxDQUFDLElBQUlKLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxHQUM1RUQsY0FBYyxDQUNiTSxRQUFRLEVBQUUsQ0FDVkMsV0FBVyxDQUFDTixtQkFBbUIsQ0FBQyxDQUFDLENBQUMsRUFBRUQsY0FBYyxDQUFDUSxpQkFBaUIsRUFBRSxFQUFhO1FBQUVDLFlBQVksRUFBRTtNQUFLLENBQUMsQ0FBQyxHQUMzRyxJQUFJO01BQ1IsSUFBSVQsY0FBYyxDQUFDVSxHQUFHLENBQUMsaUJBQWlCLENBQUMsRUFBRTtRQUMxQyxNQUFNOUIsU0FBUyxHQUFHb0IsY0FBYyxDQUFDTSxRQUFRLEVBQUUsQ0FBQ0ssWUFBWSxFQUFvQjtRQUM1RSxNQUFNQyxjQUFjLEdBQUksTUFBTSxJQUFJLENBQUNsQyxtQkFBbUIsQ0FBQ0MsT0FBTyxFQUFFQyxTQUFTLENBQWE7UUFDdEYsSUFBSXdCLGNBQWMsRUFBRTtVQUNuQlEsY0FBYyxDQUFDQyxpQkFBaUIsQ0FBQ1QsY0FBYyxDQUFDVSxlQUFlLEVBQUUsQ0FBWTtRQUM5RTtRQUNBLE9BQU8sQ0FBQ0YsY0FBYyxDQUFDO01BQ3hCO01BQ0EsT0FBT0csT0FBTyxDQUFDQyxPQUFPLENBQUMsRUFBRSxDQUFDO0lBQzNCLENBQUM7SUFFREMsYUFBYSxFQUFFLGtCQUFrQjtNQUNoQyxPQUFPO1FBQ05DLFdBQVcsRUFBRTtVQUNaQyxJQUFJLEVBQUUsQ0FBQztVQUFFO1VBQ1RDLFVBQVUsRUFBRUM7UUFDYixDQUFDO1FBQ0RDLFdBQVcsRUFBRUQ7TUFDZCxDQUFDO0lBQ0Y7RUFDRCxDQUFDLENBQUM7QUFBQSJ9