/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/core/Core", "sap/ui/model/resource/ResourceModel"], function (Core, UI5ResourceModel) {
  "use strict";

  const oResourceModel = new UI5ResourceModel({
      bundleName: "sap.fe.macros.messagebundle",
      async: true
    }),
    oResourceBundle = Core.getLibraryResourceBundle("sap.fe.macros");
  let oApplicationResourceBundle;
  const ResourceModel = {
    /**
     * Returns the resource model for the library.
     *
     * @private
     * @returns The resource model for this library
     */
    getModel() {
      return oResourceModel;
    },
    /**
     * Returns a text from the resource bundle of this library.
     *
     * @param sText Text
     * @param aParameter Parameter
     * @param sEntitySetName Entity set name
     * @returns Text from resource bundle
     */
    getText(sText, aParameter, sEntitySetName) {
      let sResourceKey = sText;
      let sBundleText;
      if (oApplicationResourceBundle) {
        if (sEntitySetName) {
          //Create resource key appended with the entity set name
          sResourceKey = `${sText}|${sEntitySetName}`;
        }
        sBundleText = oApplicationResourceBundle.getText(sResourceKey, aParameter, true);
        return sBundleText ? sBundleText : oResourceBundle.getText(sText, aParameter);
      }
      return oResourceBundle.getText(sText, aParameter);
    },
    /**
     * Sets the resource bundle of the application.
     *
     * @param oApplicationi18nBundle Resource bundle of the application
     */
    setApplicationI18nBundle(oApplicationi18nBundle) {
      oApplicationResourceBundle = oApplicationi18nBundle;
    }
  };
  return ResourceModel;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvUmVzb3VyY2VNb2RlbCIsIlVJNVJlc291cmNlTW9kZWwiLCJidW5kbGVOYW1lIiwiYXN5bmMiLCJvUmVzb3VyY2VCdW5kbGUiLCJDb3JlIiwiZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlIiwib0FwcGxpY2F0aW9uUmVzb3VyY2VCdW5kbGUiLCJSZXNvdXJjZU1vZGVsIiwiZ2V0TW9kZWwiLCJnZXRUZXh0Iiwic1RleHQiLCJhUGFyYW1ldGVyIiwic0VudGl0eVNldE5hbWUiLCJzUmVzb3VyY2VLZXkiLCJzQnVuZGxlVGV4dCIsInNldEFwcGxpY2F0aW9uSTE4bkJ1bmRsZSIsIm9BcHBsaWNhdGlvbmkxOG5CdW5kbGUiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlJlc291cmNlTW9kZWwudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgUmVzb3VyY2VCdW5kbGUgZnJvbSBcInNhcC9iYXNlL2kxOG4vUmVzb3VyY2VCdW5kbGVcIjtcbmltcG9ydCBDb3JlIGZyb20gXCJzYXAvdWkvY29yZS9Db3JlXCI7XG5pbXBvcnQgVUk1UmVzb3VyY2VNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL3Jlc291cmNlL1Jlc291cmNlTW9kZWxcIjtcblxuY29uc3Qgb1Jlc291cmNlTW9kZWwgPSBuZXcgVUk1UmVzb3VyY2VNb2RlbCh7IGJ1bmRsZU5hbWU6IFwic2FwLmZlLm1hY3Jvcy5tZXNzYWdlYnVuZGxlXCIsIGFzeW5jOiB0cnVlIH0pLFxuXHRvUmVzb3VyY2VCdW5kbGUgPSBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5tYWNyb3NcIik7XG5sZXQgb0FwcGxpY2F0aW9uUmVzb3VyY2VCdW5kbGU6IFJlc291cmNlQnVuZGxlO1xuXG5jb25zdCBSZXNvdXJjZU1vZGVsID0ge1xuXHQvKipcblx0ICogUmV0dXJucyB0aGUgcmVzb3VyY2UgbW9kZWwgZm9yIHRoZSBsaWJyYXJ5LlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcmV0dXJucyBUaGUgcmVzb3VyY2UgbW9kZWwgZm9yIHRoaXMgbGlicmFyeVxuXHQgKi9cblx0Z2V0TW9kZWwoKSB7XG5cdFx0cmV0dXJuIG9SZXNvdXJjZU1vZGVsO1xuXHR9LFxuXHQvKipcblx0ICogUmV0dXJucyBhIHRleHQgZnJvbSB0aGUgcmVzb3VyY2UgYnVuZGxlIG9mIHRoaXMgbGlicmFyeS5cblx0ICpcblx0ICogQHBhcmFtIHNUZXh0IFRleHRcblx0ICogQHBhcmFtIGFQYXJhbWV0ZXIgUGFyYW1ldGVyXG5cdCAqIEBwYXJhbSBzRW50aXR5U2V0TmFtZSBFbnRpdHkgc2V0IG5hbWVcblx0ICogQHJldHVybnMgVGV4dCBmcm9tIHJlc291cmNlIGJ1bmRsZVxuXHQgKi9cblx0Z2V0VGV4dChzVGV4dDogc3RyaW5nLCBhUGFyYW1ldGVyPzogYW55W10sIHNFbnRpdHlTZXROYW1lPzogc3RyaW5nKSB7XG5cdFx0bGV0IHNSZXNvdXJjZUtleSA9IHNUZXh0O1xuXHRcdGxldCBzQnVuZGxlVGV4dDtcblx0XHRpZiAob0FwcGxpY2F0aW9uUmVzb3VyY2VCdW5kbGUpIHtcblx0XHRcdGlmIChzRW50aXR5U2V0TmFtZSkge1xuXHRcdFx0XHQvL0NyZWF0ZSByZXNvdXJjZSBrZXkgYXBwZW5kZWQgd2l0aCB0aGUgZW50aXR5IHNldCBuYW1lXG5cdFx0XHRcdHNSZXNvdXJjZUtleSA9IGAke3NUZXh0fXwke3NFbnRpdHlTZXROYW1lfWA7XG5cdFx0XHR9XG5cdFx0XHRzQnVuZGxlVGV4dCA9IG9BcHBsaWNhdGlvblJlc291cmNlQnVuZGxlLmdldFRleHQoc1Jlc291cmNlS2V5LCBhUGFyYW1ldGVyLCB0cnVlKTtcblx0XHRcdHJldHVybiBzQnVuZGxlVGV4dCA/IHNCdW5kbGVUZXh0IDogb1Jlc291cmNlQnVuZGxlLmdldFRleHQoc1RleHQsIGFQYXJhbWV0ZXIpO1xuXHRcdH1cblx0XHRyZXR1cm4gb1Jlc291cmNlQnVuZGxlLmdldFRleHQoc1RleHQsIGFQYXJhbWV0ZXIpO1xuXHR9LFxuXHQvKipcblx0ICogU2V0cyB0aGUgcmVzb3VyY2UgYnVuZGxlIG9mIHRoZSBhcHBsaWNhdGlvbi5cblx0ICpcblx0ICogQHBhcmFtIG9BcHBsaWNhdGlvbmkxOG5CdW5kbGUgUmVzb3VyY2UgYnVuZGxlIG9mIHRoZSBhcHBsaWNhdGlvblxuXHQgKi9cblx0c2V0QXBwbGljYXRpb25JMThuQnVuZGxlKG9BcHBsaWNhdGlvbmkxOG5CdW5kbGU6IFJlc291cmNlQnVuZGxlKSB7XG5cdFx0b0FwcGxpY2F0aW9uUmVzb3VyY2VCdW5kbGUgPSBvQXBwbGljYXRpb25pMThuQnVuZGxlO1xuXHR9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBSZXNvdXJjZU1vZGVsO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7O0VBSUEsTUFBTUEsY0FBYyxHQUFHLElBQUlDLGdCQUFnQixDQUFDO01BQUVDLFVBQVUsRUFBRSw2QkFBNkI7TUFBRUMsS0FBSyxFQUFFO0lBQUssQ0FBQyxDQUFDO0lBQ3RHQyxlQUFlLEdBQUdDLElBQUksQ0FBQ0Msd0JBQXdCLENBQUMsZUFBZSxDQUFDO0VBQ2pFLElBQUlDLDBCQUEwQztFQUU5QyxNQUFNQyxhQUFhLEdBQUc7SUFDckI7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0NDLFFBQVEsR0FBRztNQUNWLE9BQU9ULGNBQWM7SUFDdEIsQ0FBQztJQUNEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ1UsT0FBTyxDQUFDQyxLQUFhLEVBQUVDLFVBQWtCLEVBQUVDLGNBQXVCLEVBQUU7TUFDbkUsSUFBSUMsWUFBWSxHQUFHSCxLQUFLO01BQ3hCLElBQUlJLFdBQVc7TUFDZixJQUFJUiwwQkFBMEIsRUFBRTtRQUMvQixJQUFJTSxjQUFjLEVBQUU7VUFDbkI7VUFDQUMsWUFBWSxHQUFJLEdBQUVILEtBQU0sSUFBR0UsY0FBZSxFQUFDO1FBQzVDO1FBQ0FFLFdBQVcsR0FBR1IsMEJBQTBCLENBQUNHLE9BQU8sQ0FBQ0ksWUFBWSxFQUFFRixVQUFVLEVBQUUsSUFBSSxDQUFDO1FBQ2hGLE9BQU9HLFdBQVcsR0FBR0EsV0FBVyxHQUFHWCxlQUFlLENBQUNNLE9BQU8sQ0FBQ0MsS0FBSyxFQUFFQyxVQUFVLENBQUM7TUFDOUU7TUFDQSxPQUFPUixlQUFlLENBQUNNLE9BQU8sQ0FBQ0MsS0FBSyxFQUFFQyxVQUFVLENBQUM7SUFDbEQsQ0FBQztJQUNEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7SUFDQ0ksd0JBQXdCLENBQUNDLHNCQUFzQyxFQUFFO01BQ2hFViwwQkFBMEIsR0FBR1Usc0JBQXNCO0lBQ3BEO0VBQ0QsQ0FBQztFQUFDLE9BRWFULGFBQWE7QUFBQSJ9