/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/navigation/NavigationHandler", "sap/ui/core/service/Service", "sap/ui/core/service/ServiceFactory"], function (NavigationHandler, Service, ServiceFactory) {
  "use strict";

  var _exports = {};
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  let NavigationService = /*#__PURE__*/function (_Service) {
    _inheritsLoose(NavigationService, _Service);
    function NavigationService() {
      return _Service.apply(this, arguments) || this;
    }
    _exports.NavigationService = NavigationService;
    var _proto = NavigationService.prototype;
    _proto.init = function init() {
      const oContext = this.getContext(),
        oComponent = oContext && oContext.scopeObject;
      this.oNavHandler = new NavigationHandler(oComponent);
      this.oNavHandler.setModel(oComponent.getModel());
      this.initPromise = Promise.resolve(this);
    };
    _proto.exit = function exit() {
      this.oNavHandler.destroy();
    }

    /**
     * Triggers a cross-app navigation after saving the inner and the cross-app states.
     *
     * @private
     * @ui5-restricted
     * @param sSemanticObject Semantic object of the target app
     * @param sActionName Action of the target app
     * @param [vNavigationParameters] Navigation parameters as an object with key/value pairs or as a string representation of
     *        such an object. If passed as an object, the properties are not checked against the <code>IsPotentialSensitive</code> or
     *        <code>Measure</code> type.
     * @param [oInnerAppData] Object for storing current state of the app
     * @param [fnOnError] Callback that is called if an error occurs during navigation <br>
     * @param [oExternalAppData] Object for storing the state which will be forwarded to the target component.
     * @param [sNavMode] Argument is used to overwrite the FLP-configured target for opening a URL. If used, only the
     *        <code>explace</code> or <code>inplace</code> values are allowed. Any other value will lead to an exception
     *        <code>NavigationHandler.INVALID_NAV_MODE</code>.
     */;
    _proto.navigate = function navigate(sSemanticObject, sActionName, vNavigationParameters, oInnerAppData, fnOnError, oExternalAppData, sNavMode) {
      // TODO: Navigation Handler does not handle navigation without a context
      // but in v4 DataFieldForIBN with requiresContext false can trigger a navigation without any context
      // This should be handled
      this.oNavHandler.navigate(sSemanticObject, sActionName, vNavigationParameters, oInnerAppData, fnOnError, oExternalAppData, sNavMode);
    }
    /**
     * Parses the incoming URL and returns a Promise.
     *
     * @returns A Promise object which returns the
     * extracted app state, the startup parameters, and the type of navigation when execution is successful,
     * @private
     * @ui5-restricted
     */;
    _proto.parseNavigation = function parseNavigation() {
      return this.oNavHandler.parseNavigation();
    }
    /**
     * Processes navigation-related tasks related to beforePopoverOpens event handling for the SmartLink control and returns a Promise object.
     *
     * @param oTableEventParameters The parameters made available by the SmartTable control when the SmartLink control has been clicked,
     *        an instance of a PopOver object
     * @param sSelectionVariant Stringified JSON object as returned, for example, from getDataSuiteFormat() of the SmartFilterBar control
     * @param [mInnerAppData] Object containing the current state of the app. If provided, opening the Popover is deferred until the
     *        inner app data is saved in a consistent way.
     * @returns A Promise object to monitor when all actions of the function have been executed; if the execution is successful, the
     *          modified oTableEventParameters is returned; if an error occurs, an error object of type
     *          {@link sap.fe.navigation.NavError} is returned
     * @private
     */;
    _proto._processBeforeSmartLinkPopoverOpens = function _processBeforeSmartLinkPopoverOpens(oTableEventParameters, sSelectionVariant, mInnerAppData) {
      return this.oNavHandler.processBeforeSmartLinkPopoverOpens(oTableEventParameters, sSelectionVariant, mInnerAppData);
    }

    /**
     * Processes selectionVariant string and returns a Promise object (semanticAttributes and AppStateKey).
     *
     * @param sSelectionVariant Stringified JSON object
     * @returns A Promise object to monitor when all actions of the function have been executed; if the execution is successful, the
     *          semanticAttributes as well as the appStateKey are returned; if an error occurs, an error object of type
     *          {@link sap.fe.navigation.NavError} is returned
     * <br>
     * @example <code>
     *
     * 		var oSelectionVariant = new sap.fe.navigation.SelectionVariant();
     * 		oSelectionVariant.addSelectOption("CompanyCode", "I", "EQ", "0001");
     * 		oSelectionVariant.addSelectOption("Customer", "I", "EQ", "C0001");
     * 		var sSelectionVariant= oSelectionVariant.toJSONString();
     *
     * 		var oNavigationHandler = new sap.fe.navigation.NavigationHandler(oController);
     * 		var oPromiseObject = oNavigationHandler._getAppStateKeyAndUrlParameters(sSelectionVariant);
     *
     * 		oPromiseObject.done(function(oSemanticAttributes, sAppStateKey){
     * 			// here you can add coding that should run after all app state and the semantic attributes have been returned.
     * 		});
     *
     * 		oPromiseObject.fail(function(oError){
     * 			//some error handling
     * 		});
     *
     * </code>
     * @private
     * @ui5-restricted
     */;
    _proto.getAppStateKeyAndUrlParameters = function getAppStateKeyAndUrlParameters(sSelectionVariant) {
      return this.oNavHandler._getAppStateKeyAndUrlParameters(sSelectionVariant);
    }

    /**
     * Gets the application specific technical parameters.
     *
     * @returns Containing the technical parameters.
     * @private
     * @ui5-restricted
     */;
    _proto.getTechnicalParameters = function getTechnicalParameters() {
      return this.oNavHandler.getTechnicalParameters();
    }
    /**
     * Sets the application specific technical parameters. Technical parameters will not be added to the selection variant passed to the
     * application.
     * As a default sap-system, sap-ushell-defaultedParameterNames and hcpApplicationId are considered as technical parameters.
     *
     * @param aTechnicalParameters List of parameter names to be considered as technical parameters. <code>null</code> or
     *        <code>undefined</code> may be used to reset the complete list.
     * @private
     * @ui5-restricted
     */;
    _proto.setTechnicalParameters = function setTechnicalParameters(aTechnicalParameters) {
      this.oNavHandler.setTechnicalParameters(aTechnicalParameters);
    }
    /**
     * Sets the model that is used for verification of sensitive information. If the model is not set, the unnamed component model is used for the
     * verification of sensitive information.
     *
     * @private
     * @ui5-restricted
     * @param oModel Model For checking sensitive information
     */;
    _proto.setModel = function setModel(oModel) {
      this.oNavHandler.setModel(oModel);
    }
    /**
     * Changes the URL according to the current app state and stores the app state for later retrieval.
     *
     * @private
     * @ui5-restricted
     * @param mInnerAppData Object containing the current state of the app
     * @param [bImmediateHashReplace=true] If set to false, the inner app hash will not be replaced until storing is successful; do not
     *        set to false if you cannot react to the resolution of the Promise, for example, when calling the beforeLinkPressed event
     * @param [bSkipHashReplace=false] If set to true, the inner app hash will not be replaced in the storeInnerAppState. Also the bImmediateHashReplace
     * 		  will be ignored.
     * @returns A Promise object to monitor when all the actions of the function have been executed; if the execution is successful, the
     *          app state key is returned; if an error occurs, an object of type {@link sap.fe.navigation.NavError} is
     *          returned
     */;
    _proto.storeInnerAppStateAsync = function storeInnerAppStateAsync(mInnerAppData, bImmediateHashReplace, bSkipHashReplace) {
      // safely converting JQuerry deferred to ES6 promise
      return new Promise((resolve, reject) => this.oNavHandler.storeInnerAppStateAsync(mInnerAppData, bImmediateHashReplace, bSkipHashReplace).then(resolve, reject));
    }
    /**
     * Changes the URL according to the current app state and stores the app state for later retrieval.
     *
     * @private
     * @ui5-restricted
     * @param mInnerAppData Object containing the current state of the app
     * @param [bImmediateHashReplace=false] If set to false, the inner app hash will not be replaced until storing is successful; do not
     * @returns An object containing the appStateId and a promise object to monitor when all the actions of the function have been
     * executed; Please note that the appStateKey may be undefined or empty.
     */;
    _proto.storeInnerAppStateWithImmediateReturn = function storeInnerAppStateWithImmediateReturn(mInnerAppData, bImmediateHashReplace) {
      return this.oNavHandler.storeInnerAppStateWithImmediateReturn(mInnerAppData, bImmediateHashReplace);
    }
    /**
     * Changes the URL according to the current sAppStateKey. As an reaction route change event will be triggered.
     *
     * @private
     * @ui5-restricted
     * @param sAppStateKey The new app state key.
     */;
    _proto.replaceHash = function replaceHash(sAppStateKey) {
      this.oNavHandler.replaceHash(sAppStateKey);
    };
    _proto.replaceInnerAppStateKey = function replaceInnerAppStateKey(sAppHash, sAppStateKey) {
      return this.oNavHandler._replaceInnerAppStateKey(sAppHash, sAppStateKey);
    }
    /**
     * Get single values from SelectionVariant for url parameters.
     *
     * @private
     * @ui5-restricted
     * @param [vSelectionVariant]
     * @param [vSelectionVariant.oUrlParamaters]
     * @returns The url parameters
     */;
    _proto.getUrlParametersFromSelectionVariant = function getUrlParametersFromSelectionVariant(vSelectionVariant) {
      return this.oNavHandler._getURLParametersFromSelectionVariant(vSelectionVariant);
    }

    /**
     * Save app state and return immediately without waiting for response.
     *
     * @private
     * @ui5-restricted
     * @param oInSelectionVariant Instance of sap.fe.navigation.SelectionVariant
     * @returns AppState key
     */;
    _proto.saveAppStateWithImmediateReturn = function saveAppStateWithImmediateReturn(oInSelectionVariant) {
      if (oInSelectionVariant) {
        const sSelectionVariant = oInSelectionVariant.toJSONString(),
          // create an SV for app state in string format
          oSelectionVariant = JSON.parse(sSelectionVariant),
          // convert string into JSON to store in AppState
          oXAppStateObject = {
            selectionVariant: oSelectionVariant
          },
          oReturn = this.oNavHandler._saveAppStateWithImmediateReturn(oXAppStateObject);
        return oReturn !== null && oReturn !== void 0 && oReturn.appStateKey ? oReturn.appStateKey : "";
      } else {
        return undefined;
      }
    }

    /**
     * Mix Attributes and selectionVariant.
     *
     * @param vSemanticAttributes Object/(Array of Objects) containing key/value pairs
     * @param sSelectionVariant The selection variant in string format as provided by the SmartFilterBar control
     * @param [iSuppressionBehavior=sap.fe.navigation.SuppressionBehavior.standard] Indicates whether semantic
     *        attributes with special values (see {@link sap.fe.navigation.SuppressionBehavior suppression behavior}) must be
     *        suppressed before they are combined with the selection variant; several
     *        {@link sap.fe.navigation.SuppressionBehavior suppression behaviors} can be combined with the bitwise OR operator
     *        (|)
     * @returns Instance of {@link sap.fe.navigation.SelectionVariant}
     */;
    _proto.mixAttributesAndSelectionVariant = function mixAttributesAndSelectionVariant(vSemanticAttributes, sSelectionVariant, iSuppressionBehavior) {
      return this.oNavHandler.mixAttributesAndSelectionVariant(vSemanticAttributes, sSelectionVariant, iSuppressionBehavior);
    }

    /**
     * The method creates a context url based on provided data. This context url can either be used as.
     *
     * @param sEntitySetName Used for url determination
     * @param [oModel] The ODataModel used for url determination. If omitted, the NavigationHandler model is used.
     * @returns The context url for the given entities
     */;
    _proto.constructContextUrl = function constructContextUrl(sEntitySetName, oModel) {
      return this.oNavHandler.constructContextUrl(sEntitySetName, oModel);
    };
    _proto.getInterface = function getInterface() {
      return this;
    };
    return NavigationService;
  }(Service);
  _exports.NavigationService = NavigationService;
  function fnGetEmptyObject() {
    return {};
  }
  function fnGetPromise() {
    return Promise.resolve({});
  }
  function fnGetJQueryPromise() {
    const oMyDeffered = jQuery.Deferred();
    oMyDeffered.resolve({}, {}, "initial");
    return oMyDeffered.promise();
  }
  function fnGetEmptyString() {
    return "";
  }
  let NavigationServicesMock = /*#__PURE__*/function () {
    function NavigationServicesMock() {
      this.createEmptyAppState = fnGetEmptyObject;
      this.storeInnerAppStateWithImmediateReturn = fnGetEmptyObject;
      this.mixAttributesAndSelectionVariant = fnGetEmptyObject;
      this.getAppState = fnGetPromise;
      this.getStartupAppState = fnGetPromise;
      this.parseNavigation = fnGetJQueryPromise;
      this.constructContextUrl = fnGetEmptyString;
      this.initPromise = Promise.resolve(this);
    }
    _exports.NavigationServicesMock = NavigationServicesMock;
    var _proto2 = NavigationServicesMock.prototype;
    _proto2.getInterface = function getInterface() {
      return this;
    }

    // return empty object
    ;
    _proto2.replaceInnerAppStateKey = function replaceInnerAppStateKey(sAppHash) {
      return sAppHash ? sAppHash : "";
    };
    _proto2.navigate = function navigate() {
      // Don't do anything
    };
    return NavigationServicesMock;
  }();
  _exports.NavigationServicesMock = NavigationServicesMock;
  let NavigationServiceFactory = /*#__PURE__*/function (_ServiceFactory) {
    _inheritsLoose(NavigationServiceFactory, _ServiceFactory);
    function NavigationServiceFactory() {
      return _ServiceFactory.apply(this, arguments) || this;
    }
    var _proto3 = NavigationServiceFactory.prototype;
    _proto3.createInstance = function createInstance(oServiceContext) {
      const oNavigationService = sap.ushell && sap.ushell.Container ? new NavigationService(oServiceContext) : new NavigationServicesMock();
      // Wait For init
      return oNavigationService.initPromise.then(function (oService) {
        return oService;
      });
    };
    return NavigationServiceFactory;
  }(ServiceFactory);
  return NavigationServiceFactory;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOYXZpZ2F0aW9uU2VydmljZSIsImluaXQiLCJvQ29udGV4dCIsImdldENvbnRleHQiLCJvQ29tcG9uZW50Iiwic2NvcGVPYmplY3QiLCJvTmF2SGFuZGxlciIsIk5hdmlnYXRpb25IYW5kbGVyIiwic2V0TW9kZWwiLCJnZXRNb2RlbCIsImluaXRQcm9taXNlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJleGl0IiwiZGVzdHJveSIsIm5hdmlnYXRlIiwic1NlbWFudGljT2JqZWN0Iiwic0FjdGlvbk5hbWUiLCJ2TmF2aWdhdGlvblBhcmFtZXRlcnMiLCJvSW5uZXJBcHBEYXRhIiwiZm5PbkVycm9yIiwib0V4dGVybmFsQXBwRGF0YSIsInNOYXZNb2RlIiwicGFyc2VOYXZpZ2F0aW9uIiwiX3Byb2Nlc3NCZWZvcmVTbWFydExpbmtQb3BvdmVyT3BlbnMiLCJvVGFibGVFdmVudFBhcmFtZXRlcnMiLCJzU2VsZWN0aW9uVmFyaWFudCIsIm1Jbm5lckFwcERhdGEiLCJwcm9jZXNzQmVmb3JlU21hcnRMaW5rUG9wb3Zlck9wZW5zIiwiZ2V0QXBwU3RhdGVLZXlBbmRVcmxQYXJhbWV0ZXJzIiwiX2dldEFwcFN0YXRlS2V5QW5kVXJsUGFyYW1ldGVycyIsImdldFRlY2huaWNhbFBhcmFtZXRlcnMiLCJzZXRUZWNobmljYWxQYXJhbWV0ZXJzIiwiYVRlY2huaWNhbFBhcmFtZXRlcnMiLCJvTW9kZWwiLCJzdG9yZUlubmVyQXBwU3RhdGVBc3luYyIsImJJbW1lZGlhdGVIYXNoUmVwbGFjZSIsImJTa2lwSGFzaFJlcGxhY2UiLCJyZWplY3QiLCJ0aGVuIiwic3RvcmVJbm5lckFwcFN0YXRlV2l0aEltbWVkaWF0ZVJldHVybiIsInJlcGxhY2VIYXNoIiwic0FwcFN0YXRlS2V5IiwicmVwbGFjZUlubmVyQXBwU3RhdGVLZXkiLCJzQXBwSGFzaCIsIl9yZXBsYWNlSW5uZXJBcHBTdGF0ZUtleSIsImdldFVybFBhcmFtZXRlcnNGcm9tU2VsZWN0aW9uVmFyaWFudCIsInZTZWxlY3Rpb25WYXJpYW50IiwiX2dldFVSTFBhcmFtZXRlcnNGcm9tU2VsZWN0aW9uVmFyaWFudCIsInNhdmVBcHBTdGF0ZVdpdGhJbW1lZGlhdGVSZXR1cm4iLCJvSW5TZWxlY3Rpb25WYXJpYW50IiwidG9KU09OU3RyaW5nIiwib1NlbGVjdGlvblZhcmlhbnQiLCJKU09OIiwicGFyc2UiLCJvWEFwcFN0YXRlT2JqZWN0Iiwic2VsZWN0aW9uVmFyaWFudCIsIm9SZXR1cm4iLCJfc2F2ZUFwcFN0YXRlV2l0aEltbWVkaWF0ZVJldHVybiIsImFwcFN0YXRlS2V5IiwidW5kZWZpbmVkIiwibWl4QXR0cmlidXRlc0FuZFNlbGVjdGlvblZhcmlhbnQiLCJ2U2VtYW50aWNBdHRyaWJ1dGVzIiwiaVN1cHByZXNzaW9uQmVoYXZpb3IiLCJjb25zdHJ1Y3RDb250ZXh0VXJsIiwic0VudGl0eVNldE5hbWUiLCJnZXRJbnRlcmZhY2UiLCJTZXJ2aWNlIiwiZm5HZXRFbXB0eU9iamVjdCIsImZuR2V0UHJvbWlzZSIsImZuR2V0SlF1ZXJ5UHJvbWlzZSIsIm9NeURlZmZlcmVkIiwialF1ZXJ5IiwiRGVmZXJyZWQiLCJwcm9taXNlIiwiZm5HZXRFbXB0eVN0cmluZyIsIk5hdmlnYXRpb25TZXJ2aWNlc01vY2siLCJjcmVhdGVFbXB0eUFwcFN0YXRlIiwiZ2V0QXBwU3RhdGUiLCJnZXRTdGFydHVwQXBwU3RhdGUiLCJOYXZpZ2F0aW9uU2VydmljZUZhY3RvcnkiLCJjcmVhdGVJbnN0YW5jZSIsIm9TZXJ2aWNlQ29udGV4dCIsIm9OYXZpZ2F0aW9uU2VydmljZSIsInNhcCIsInVzaGVsbCIsIkNvbnRhaW5lciIsIm9TZXJ2aWNlIiwiU2VydmljZUZhY3RvcnkiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIk5hdmlnYXRpb25TZXJ2aWNlRmFjdG9yeS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IElubmVyQXBwRGF0YSB9IGZyb20gXCJzYXAvZmUvbmF2aWdhdGlvbi9OYXZpZ2F0aW9uSGFuZGxlclwiO1xuaW1wb3J0IE5hdmlnYXRpb25IYW5kbGVyIGZyb20gXCJzYXAvZmUvbmF2aWdhdGlvbi9OYXZpZ2F0aW9uSGFuZGxlclwiO1xuaW1wb3J0IHR5cGUgU2VsZWN0aW9uVmFyaWFudCBmcm9tIFwic2FwL2ZlL25hdmlnYXRpb24vU2VsZWN0aW9uVmFyaWFudFwiO1xuaW1wb3J0IHR5cGUgeyBTZXJpYWxpemVkU2VsZWN0aW9uVmFyaWFudCB9IGZyb20gXCJzYXAvZmUvbmF2aWdhdGlvbi9TZWxlY3Rpb25WYXJpYW50XCI7XG5pbXBvcnQgU2VydmljZSBmcm9tIFwic2FwL3VpL2NvcmUvc2VydmljZS9TZXJ2aWNlXCI7XG5pbXBvcnQgU2VydmljZUZhY3RvcnkgZnJvbSBcInNhcC91aS9jb3JlL3NlcnZpY2UvU2VydmljZUZhY3RvcnlcIjtcbmltcG9ydCB0eXBlIHsgU2VydmljZUNvbnRleHQgfSBmcm9tIFwidHlwZXMvZXh0ZW5zaW9uX3R5cGVzXCI7XG5cbnR5cGUgTmF2aWdhdGlvblNlcnZpY2VTZXR0aW5ncyA9IHt9O1xuZXhwb3J0IGNsYXNzIE5hdmlnYXRpb25TZXJ2aWNlIGV4dGVuZHMgU2VydmljZTxOYXZpZ2F0aW9uU2VydmljZVNldHRpbmdzPiB7XG5cdGluaXRQcm9taXNlITogUHJvbWlzZTxhbnk+O1xuXHRvTmF2SGFuZGxlciE6IE5hdmlnYXRpb25IYW5kbGVyO1xuXHRpbml0KCkge1xuXHRcdGNvbnN0IG9Db250ZXh0ID0gdGhpcy5nZXRDb250ZXh0KCksXG5cdFx0XHRvQ29tcG9uZW50ID0gb0NvbnRleHQgJiYgb0NvbnRleHQuc2NvcGVPYmplY3Q7XG5cblx0XHR0aGlzLm9OYXZIYW5kbGVyID0gbmV3IE5hdmlnYXRpb25IYW5kbGVyKG9Db21wb25lbnQpO1xuXHRcdHRoaXMub05hdkhhbmRsZXIuc2V0TW9kZWwob0NvbXBvbmVudC5nZXRNb2RlbCgpKTtcblx0XHR0aGlzLmluaXRQcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKHRoaXMpO1xuXHR9XG5cdGV4aXQoKSB7XG5cdFx0dGhpcy5vTmF2SGFuZGxlci5kZXN0cm95KCk7XG5cdH1cblxuXHQvKipcblx0ICogVHJpZ2dlcnMgYSBjcm9zcy1hcHAgbmF2aWdhdGlvbiBhZnRlciBzYXZpbmcgdGhlIGlubmVyIGFuZCB0aGUgY3Jvc3MtYXBwIHN0YXRlcy5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBwYXJhbSBzU2VtYW50aWNPYmplY3QgU2VtYW50aWMgb2JqZWN0IG9mIHRoZSB0YXJnZXQgYXBwXG5cdCAqIEBwYXJhbSBzQWN0aW9uTmFtZSBBY3Rpb24gb2YgdGhlIHRhcmdldCBhcHBcblx0ICogQHBhcmFtIFt2TmF2aWdhdGlvblBhcmFtZXRlcnNdIE5hdmlnYXRpb24gcGFyYW1ldGVycyBhcyBhbiBvYmplY3Qgd2l0aCBrZXkvdmFsdWUgcGFpcnMgb3IgYXMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2Zcblx0ICogICAgICAgIHN1Y2ggYW4gb2JqZWN0LiBJZiBwYXNzZWQgYXMgYW4gb2JqZWN0LCB0aGUgcHJvcGVydGllcyBhcmUgbm90IGNoZWNrZWQgYWdhaW5zdCB0aGUgPGNvZGU+SXNQb3RlbnRpYWxTZW5zaXRpdmU8L2NvZGU+IG9yXG5cdCAqICAgICAgICA8Y29kZT5NZWFzdXJlPC9jb2RlPiB0eXBlLlxuXHQgKiBAcGFyYW0gW29Jbm5lckFwcERhdGFdIE9iamVjdCBmb3Igc3RvcmluZyBjdXJyZW50IHN0YXRlIG9mIHRoZSBhcHBcblx0ICogQHBhcmFtIFtmbk9uRXJyb3JdIENhbGxiYWNrIHRoYXQgaXMgY2FsbGVkIGlmIGFuIGVycm9yIG9jY3VycyBkdXJpbmcgbmF2aWdhdGlvbiA8YnI+XG5cdCAqIEBwYXJhbSBbb0V4dGVybmFsQXBwRGF0YV0gT2JqZWN0IGZvciBzdG9yaW5nIHRoZSBzdGF0ZSB3aGljaCB3aWxsIGJlIGZvcndhcmRlZCB0byB0aGUgdGFyZ2V0IGNvbXBvbmVudC5cblx0ICogQHBhcmFtIFtzTmF2TW9kZV0gQXJndW1lbnQgaXMgdXNlZCB0byBvdmVyd3JpdGUgdGhlIEZMUC1jb25maWd1cmVkIHRhcmdldCBmb3Igb3BlbmluZyBhIFVSTC4gSWYgdXNlZCwgb25seSB0aGVcblx0ICogICAgICAgIDxjb2RlPmV4cGxhY2U8L2NvZGU+IG9yIDxjb2RlPmlucGxhY2U8L2NvZGU+IHZhbHVlcyBhcmUgYWxsb3dlZC4gQW55IG90aGVyIHZhbHVlIHdpbGwgbGVhZCB0byBhbiBleGNlcHRpb25cblx0ICogICAgICAgIDxjb2RlPk5hdmlnYXRpb25IYW5kbGVyLklOVkFMSURfTkFWX01PREU8L2NvZGU+LlxuXHQgKi9cblx0bmF2aWdhdGUoXG5cdFx0c1NlbWFudGljT2JqZWN0OiBzdHJpbmcsXG5cdFx0c0FjdGlvbk5hbWU6IHN0cmluZyxcblx0XHR2TmF2aWdhdGlvblBhcmFtZXRlcnM6IHN0cmluZyB8IG9iamVjdCxcblx0XHRvSW5uZXJBcHBEYXRhPzogSW5uZXJBcHBEYXRhLFxuXHRcdGZuT25FcnJvcj86IEZ1bmN0aW9uLFxuXHRcdG9FeHRlcm5hbEFwcERhdGE/OiBhbnksXG5cdFx0c05hdk1vZGU/OiBzdHJpbmdcblx0KSB7XG5cdFx0Ly8gVE9ETzogTmF2aWdhdGlvbiBIYW5kbGVyIGRvZXMgbm90IGhhbmRsZSBuYXZpZ2F0aW9uIHdpdGhvdXQgYSBjb250ZXh0XG5cdFx0Ly8gYnV0IGluIHY0IERhdGFGaWVsZEZvcklCTiB3aXRoIHJlcXVpcmVzQ29udGV4dCBmYWxzZSBjYW4gdHJpZ2dlciBhIG5hdmlnYXRpb24gd2l0aG91dCBhbnkgY29udGV4dFxuXHRcdC8vIFRoaXMgc2hvdWxkIGJlIGhhbmRsZWRcblx0XHR0aGlzLm9OYXZIYW5kbGVyLm5hdmlnYXRlKFxuXHRcdFx0c1NlbWFudGljT2JqZWN0LFxuXHRcdFx0c0FjdGlvbk5hbWUsXG5cdFx0XHR2TmF2aWdhdGlvblBhcmFtZXRlcnMsXG5cdFx0XHRvSW5uZXJBcHBEYXRhLFxuXHRcdFx0Zm5PbkVycm9yLFxuXHRcdFx0b0V4dGVybmFsQXBwRGF0YSxcblx0XHRcdHNOYXZNb2RlXG5cdFx0KTtcblx0fVxuXHQvKipcblx0ICogUGFyc2VzIHRoZSBpbmNvbWluZyBVUkwgYW5kIHJldHVybnMgYSBQcm9taXNlLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBBIFByb21pc2Ugb2JqZWN0IHdoaWNoIHJldHVybnMgdGhlXG5cdCAqIGV4dHJhY3RlZCBhcHAgc3RhdGUsIHRoZSBzdGFydHVwIHBhcmFtZXRlcnMsIGFuZCB0aGUgdHlwZSBvZiBuYXZpZ2F0aW9uIHdoZW4gZXhlY3V0aW9uIGlzIHN1Y2Nlc3NmdWwsXG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKi9cblx0cGFyc2VOYXZpZ2F0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLm9OYXZIYW5kbGVyLnBhcnNlTmF2aWdhdGlvbigpO1xuXHR9XG5cdC8qKlxuXHQgKiBQcm9jZXNzZXMgbmF2aWdhdGlvbi1yZWxhdGVkIHRhc2tzIHJlbGF0ZWQgdG8gYmVmb3JlUG9wb3Zlck9wZW5zIGV2ZW50IGhhbmRsaW5nIGZvciB0aGUgU21hcnRMaW5rIGNvbnRyb2wgYW5kIHJldHVybnMgYSBQcm9taXNlIG9iamVjdC5cblx0ICpcblx0ICogQHBhcmFtIG9UYWJsZUV2ZW50UGFyYW1ldGVycyBUaGUgcGFyYW1ldGVycyBtYWRlIGF2YWlsYWJsZSBieSB0aGUgU21hcnRUYWJsZSBjb250cm9sIHdoZW4gdGhlIFNtYXJ0TGluayBjb250cm9sIGhhcyBiZWVuIGNsaWNrZWQsXG5cdCAqICAgICAgICBhbiBpbnN0YW5jZSBvZiBhIFBvcE92ZXIgb2JqZWN0XG5cdCAqIEBwYXJhbSBzU2VsZWN0aW9uVmFyaWFudCBTdHJpbmdpZmllZCBKU09OIG9iamVjdCBhcyByZXR1cm5lZCwgZm9yIGV4YW1wbGUsIGZyb20gZ2V0RGF0YVN1aXRlRm9ybWF0KCkgb2YgdGhlIFNtYXJ0RmlsdGVyQmFyIGNvbnRyb2xcblx0ICogQHBhcmFtIFttSW5uZXJBcHBEYXRhXSBPYmplY3QgY29udGFpbmluZyB0aGUgY3VycmVudCBzdGF0ZSBvZiB0aGUgYXBwLiBJZiBwcm92aWRlZCwgb3BlbmluZyB0aGUgUG9wb3ZlciBpcyBkZWZlcnJlZCB1bnRpbCB0aGVcblx0ICogICAgICAgIGlubmVyIGFwcCBkYXRhIGlzIHNhdmVkIGluIGEgY29uc2lzdGVudCB3YXkuXG5cdCAqIEByZXR1cm5zIEEgUHJvbWlzZSBvYmplY3QgdG8gbW9uaXRvciB3aGVuIGFsbCBhY3Rpb25zIG9mIHRoZSBmdW5jdGlvbiBoYXZlIGJlZW4gZXhlY3V0ZWQ7IGlmIHRoZSBleGVjdXRpb24gaXMgc3VjY2Vzc2Z1bCwgdGhlXG5cdCAqICAgICAgICAgIG1vZGlmaWVkIG9UYWJsZUV2ZW50UGFyYW1ldGVycyBpcyByZXR1cm5lZDsgaWYgYW4gZXJyb3Igb2NjdXJzLCBhbiBlcnJvciBvYmplY3Qgb2YgdHlwZVxuXHQgKiAgICAgICAgICB7QGxpbmsgc2FwLmZlLm5hdmlnYXRpb24uTmF2RXJyb3J9IGlzIHJldHVybmVkXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfcHJvY2Vzc0JlZm9yZVNtYXJ0TGlua1BvcG92ZXJPcGVucyhvVGFibGVFdmVudFBhcmFtZXRlcnM6IG9iamVjdCwgc1NlbGVjdGlvblZhcmlhbnQ6IHN0cmluZywgbUlubmVyQXBwRGF0YT86IElubmVyQXBwRGF0YSkge1xuXHRcdHJldHVybiB0aGlzLm9OYXZIYW5kbGVyLnByb2Nlc3NCZWZvcmVTbWFydExpbmtQb3BvdmVyT3BlbnMob1RhYmxlRXZlbnRQYXJhbWV0ZXJzLCBzU2VsZWN0aW9uVmFyaWFudCwgbUlubmVyQXBwRGF0YSk7XG5cdH1cblxuXHQvKipcblx0ICogUHJvY2Vzc2VzIHNlbGVjdGlvblZhcmlhbnQgc3RyaW5nIGFuZCByZXR1cm5zIGEgUHJvbWlzZSBvYmplY3QgKHNlbWFudGljQXR0cmlidXRlcyBhbmQgQXBwU3RhdGVLZXkpLlxuXHQgKlxuXHQgKiBAcGFyYW0gc1NlbGVjdGlvblZhcmlhbnQgU3RyaW5naWZpZWQgSlNPTiBvYmplY3Rcblx0ICogQHJldHVybnMgQSBQcm9taXNlIG9iamVjdCB0byBtb25pdG9yIHdoZW4gYWxsIGFjdGlvbnMgb2YgdGhlIGZ1bmN0aW9uIGhhdmUgYmVlbiBleGVjdXRlZDsgaWYgdGhlIGV4ZWN1dGlvbiBpcyBzdWNjZXNzZnVsLCB0aGVcblx0ICogICAgICAgICAgc2VtYW50aWNBdHRyaWJ1dGVzIGFzIHdlbGwgYXMgdGhlIGFwcFN0YXRlS2V5IGFyZSByZXR1cm5lZDsgaWYgYW4gZXJyb3Igb2NjdXJzLCBhbiBlcnJvciBvYmplY3Qgb2YgdHlwZVxuXHQgKiAgICAgICAgICB7QGxpbmsgc2FwLmZlLm5hdmlnYXRpb24uTmF2RXJyb3J9IGlzIHJldHVybmVkXG5cdCAqIDxicj5cblx0ICogQGV4YW1wbGUgPGNvZGU+XG5cdCAqXG5cdCAqIFx0XHR2YXIgb1NlbGVjdGlvblZhcmlhbnQgPSBuZXcgc2FwLmZlLm5hdmlnYXRpb24uU2VsZWN0aW9uVmFyaWFudCgpO1xuXHQgKiBcdFx0b1NlbGVjdGlvblZhcmlhbnQuYWRkU2VsZWN0T3B0aW9uKFwiQ29tcGFueUNvZGVcIiwgXCJJXCIsIFwiRVFcIiwgXCIwMDAxXCIpO1xuXHQgKiBcdFx0b1NlbGVjdGlvblZhcmlhbnQuYWRkU2VsZWN0T3B0aW9uKFwiQ3VzdG9tZXJcIiwgXCJJXCIsIFwiRVFcIiwgXCJDMDAwMVwiKTtcblx0ICogXHRcdHZhciBzU2VsZWN0aW9uVmFyaWFudD0gb1NlbGVjdGlvblZhcmlhbnQudG9KU09OU3RyaW5nKCk7XG5cdCAqXG5cdCAqIFx0XHR2YXIgb05hdmlnYXRpb25IYW5kbGVyID0gbmV3IHNhcC5mZS5uYXZpZ2F0aW9uLk5hdmlnYXRpb25IYW5kbGVyKG9Db250cm9sbGVyKTtcblx0ICogXHRcdHZhciBvUHJvbWlzZU9iamVjdCA9IG9OYXZpZ2F0aW9uSGFuZGxlci5fZ2V0QXBwU3RhdGVLZXlBbmRVcmxQYXJhbWV0ZXJzKHNTZWxlY3Rpb25WYXJpYW50KTtcblx0ICpcblx0ICogXHRcdG9Qcm9taXNlT2JqZWN0LmRvbmUoZnVuY3Rpb24ob1NlbWFudGljQXR0cmlidXRlcywgc0FwcFN0YXRlS2V5KXtcblx0ICogXHRcdFx0Ly8gaGVyZSB5b3UgY2FuIGFkZCBjb2RpbmcgdGhhdCBzaG91bGQgcnVuIGFmdGVyIGFsbCBhcHAgc3RhdGUgYW5kIHRoZSBzZW1hbnRpYyBhdHRyaWJ1dGVzIGhhdmUgYmVlbiByZXR1cm5lZC5cblx0ICogXHRcdH0pO1xuXHQgKlxuXHQgKiBcdFx0b1Byb21pc2VPYmplY3QuZmFpbChmdW5jdGlvbihvRXJyb3Ipe1xuXHQgKiBcdFx0XHQvL3NvbWUgZXJyb3IgaGFuZGxpbmdcblx0ICogXHRcdH0pO1xuXHQgKlxuXHQgKiA8L2NvZGU+XG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKi9cblx0Z2V0QXBwU3RhdGVLZXlBbmRVcmxQYXJhbWV0ZXJzKHNTZWxlY3Rpb25WYXJpYW50OiBzdHJpbmcpIHtcblx0XHRyZXR1cm4gdGhpcy5vTmF2SGFuZGxlci5fZ2V0QXBwU3RhdGVLZXlBbmRVcmxQYXJhbWV0ZXJzKHNTZWxlY3Rpb25WYXJpYW50KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIHRoZSBhcHBsaWNhdGlvbiBzcGVjaWZpYyB0ZWNobmljYWwgcGFyYW1ldGVycy5cblx0ICpcblx0ICogQHJldHVybnMgQ29udGFpbmluZyB0aGUgdGVjaG5pY2FsIHBhcmFtZXRlcnMuXG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKi9cblx0Z2V0VGVjaG5pY2FsUGFyYW1ldGVycygpIHtcblx0XHRyZXR1cm4gdGhpcy5vTmF2SGFuZGxlci5nZXRUZWNobmljYWxQYXJhbWV0ZXJzKCk7XG5cdH1cblx0LyoqXG5cdCAqIFNldHMgdGhlIGFwcGxpY2F0aW9uIHNwZWNpZmljIHRlY2huaWNhbCBwYXJhbWV0ZXJzLiBUZWNobmljYWwgcGFyYW1ldGVycyB3aWxsIG5vdCBiZSBhZGRlZCB0byB0aGUgc2VsZWN0aW9uIHZhcmlhbnQgcGFzc2VkIHRvIHRoZVxuXHQgKiBhcHBsaWNhdGlvbi5cblx0ICogQXMgYSBkZWZhdWx0IHNhcC1zeXN0ZW0sIHNhcC11c2hlbGwtZGVmYXVsdGVkUGFyYW1ldGVyTmFtZXMgYW5kIGhjcEFwcGxpY2F0aW9uSWQgYXJlIGNvbnNpZGVyZWQgYXMgdGVjaG5pY2FsIHBhcmFtZXRlcnMuXG5cdCAqXG5cdCAqIEBwYXJhbSBhVGVjaG5pY2FsUGFyYW1ldGVycyBMaXN0IG9mIHBhcmFtZXRlciBuYW1lcyB0byBiZSBjb25zaWRlcmVkIGFzIHRlY2huaWNhbCBwYXJhbWV0ZXJzLiA8Y29kZT5udWxsPC9jb2RlPiBvclxuXHQgKiAgICAgICAgPGNvZGU+dW5kZWZpbmVkPC9jb2RlPiBtYXkgYmUgdXNlZCB0byByZXNldCB0aGUgY29tcGxldGUgbGlzdC5cblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRzZXRUZWNobmljYWxQYXJhbWV0ZXJzKGFUZWNobmljYWxQYXJhbWV0ZXJzOiBhbnlbXSkge1xuXHRcdHRoaXMub05hdkhhbmRsZXIuc2V0VGVjaG5pY2FsUGFyYW1ldGVycyhhVGVjaG5pY2FsUGFyYW1ldGVycyk7XG5cdH1cblx0LyoqXG5cdCAqIFNldHMgdGhlIG1vZGVsIHRoYXQgaXMgdXNlZCBmb3IgdmVyaWZpY2F0aW9uIG9mIHNlbnNpdGl2ZSBpbmZvcm1hdGlvbi4gSWYgdGhlIG1vZGVsIGlzIG5vdCBzZXQsIHRoZSB1bm5hbWVkIGNvbXBvbmVudCBtb2RlbCBpcyB1c2VkIGZvciB0aGVcblx0ICogdmVyaWZpY2F0aW9uIG9mIHNlbnNpdGl2ZSBpbmZvcm1hdGlvbi5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBwYXJhbSBvTW9kZWwgTW9kZWwgRm9yIGNoZWNraW5nIHNlbnNpdGl2ZSBpbmZvcm1hdGlvblxuXHQgKi9cblx0c2V0TW9kZWwob01vZGVsOiBhbnkpIHtcblx0XHR0aGlzLm9OYXZIYW5kbGVyLnNldE1vZGVsKG9Nb2RlbCk7XG5cdH1cblx0LyoqXG5cdCAqIENoYW5nZXMgdGhlIFVSTCBhY2NvcmRpbmcgdG8gdGhlIGN1cnJlbnQgYXBwIHN0YXRlIGFuZCBzdG9yZXMgdGhlIGFwcCBzdGF0ZSBmb3IgbGF0ZXIgcmV0cmlldmFsLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQHBhcmFtIG1Jbm5lckFwcERhdGEgT2JqZWN0IGNvbnRhaW5pbmcgdGhlIGN1cnJlbnQgc3RhdGUgb2YgdGhlIGFwcFxuXHQgKiBAcGFyYW0gW2JJbW1lZGlhdGVIYXNoUmVwbGFjZT10cnVlXSBJZiBzZXQgdG8gZmFsc2UsIHRoZSBpbm5lciBhcHAgaGFzaCB3aWxsIG5vdCBiZSByZXBsYWNlZCB1bnRpbCBzdG9yaW5nIGlzIHN1Y2Nlc3NmdWw7IGRvIG5vdFxuXHQgKiAgICAgICAgc2V0IHRvIGZhbHNlIGlmIHlvdSBjYW5ub3QgcmVhY3QgdG8gdGhlIHJlc29sdXRpb24gb2YgdGhlIFByb21pc2UsIGZvciBleGFtcGxlLCB3aGVuIGNhbGxpbmcgdGhlIGJlZm9yZUxpbmtQcmVzc2VkIGV2ZW50XG5cdCAqIEBwYXJhbSBbYlNraXBIYXNoUmVwbGFjZT1mYWxzZV0gSWYgc2V0IHRvIHRydWUsIHRoZSBpbm5lciBhcHAgaGFzaCB3aWxsIG5vdCBiZSByZXBsYWNlZCBpbiB0aGUgc3RvcmVJbm5lckFwcFN0YXRlLiBBbHNvIHRoZSBiSW1tZWRpYXRlSGFzaFJlcGxhY2Vcblx0ICogXHRcdCAgd2lsbCBiZSBpZ25vcmVkLlxuXHQgKiBAcmV0dXJucyBBIFByb21pc2Ugb2JqZWN0IHRvIG1vbml0b3Igd2hlbiBhbGwgdGhlIGFjdGlvbnMgb2YgdGhlIGZ1bmN0aW9uIGhhdmUgYmVlbiBleGVjdXRlZDsgaWYgdGhlIGV4ZWN1dGlvbiBpcyBzdWNjZXNzZnVsLCB0aGVcblx0ICogICAgICAgICAgYXBwIHN0YXRlIGtleSBpcyByZXR1cm5lZDsgaWYgYW4gZXJyb3Igb2NjdXJzLCBhbiBvYmplY3Qgb2YgdHlwZSB7QGxpbmsgc2FwLmZlLm5hdmlnYXRpb24uTmF2RXJyb3J9IGlzXG5cdCAqICAgICAgICAgIHJldHVybmVkXG5cdCAqL1xuXHRzdG9yZUlubmVyQXBwU3RhdGVBc3luYyhtSW5uZXJBcHBEYXRhOiBJbm5lckFwcERhdGEsIGJJbW1lZGlhdGVIYXNoUmVwbGFjZT86IGJvb2xlYW4sIGJTa2lwSGFzaFJlcGxhY2U/OiBib29sZWFuKTogUHJvbWlzZTxzdHJpbmc+IHtcblx0XHQvLyBzYWZlbHkgY29udmVydGluZyBKUXVlcnJ5IGRlZmVycmVkIHRvIEVTNiBwcm9taXNlXG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+XG5cdFx0XHR0aGlzLm9OYXZIYW5kbGVyLnN0b3JlSW5uZXJBcHBTdGF0ZUFzeW5jKG1Jbm5lckFwcERhdGEsIGJJbW1lZGlhdGVIYXNoUmVwbGFjZSwgYlNraXBIYXNoUmVwbGFjZSkudGhlbihyZXNvbHZlLCByZWplY3QpXG5cdFx0KTtcblx0fVxuXHQvKipcblx0ICogQ2hhbmdlcyB0aGUgVVJMIGFjY29yZGluZyB0byB0aGUgY3VycmVudCBhcHAgc3RhdGUgYW5kIHN0b3JlcyB0aGUgYXBwIHN0YXRlIGZvciBsYXRlciByZXRyaWV2YWwuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcGFyYW0gbUlubmVyQXBwRGF0YSBPYmplY3QgY29udGFpbmluZyB0aGUgY3VycmVudCBzdGF0ZSBvZiB0aGUgYXBwXG5cdCAqIEBwYXJhbSBbYkltbWVkaWF0ZUhhc2hSZXBsYWNlPWZhbHNlXSBJZiBzZXQgdG8gZmFsc2UsIHRoZSBpbm5lciBhcHAgaGFzaCB3aWxsIG5vdCBiZSByZXBsYWNlZCB1bnRpbCBzdG9yaW5nIGlzIHN1Y2Nlc3NmdWw7IGRvIG5vdFxuXHQgKiBAcmV0dXJucyBBbiBvYmplY3QgY29udGFpbmluZyB0aGUgYXBwU3RhdGVJZCBhbmQgYSBwcm9taXNlIG9iamVjdCB0byBtb25pdG9yIHdoZW4gYWxsIHRoZSBhY3Rpb25zIG9mIHRoZSBmdW5jdGlvbiBoYXZlIGJlZW5cblx0ICogZXhlY3V0ZWQ7IFBsZWFzZSBub3RlIHRoYXQgdGhlIGFwcFN0YXRlS2V5IG1heSBiZSB1bmRlZmluZWQgb3IgZW1wdHkuXG5cdCAqL1xuXHRzdG9yZUlubmVyQXBwU3RhdGVXaXRoSW1tZWRpYXRlUmV0dXJuKG1Jbm5lckFwcERhdGE6IGFueSwgYkltbWVkaWF0ZUhhc2hSZXBsYWNlOiBib29sZWFuIHwgdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIHRoaXMub05hdkhhbmRsZXIuc3RvcmVJbm5lckFwcFN0YXRlV2l0aEltbWVkaWF0ZVJldHVybihtSW5uZXJBcHBEYXRhLCBiSW1tZWRpYXRlSGFzaFJlcGxhY2UpO1xuXHR9XG5cdC8qKlxuXHQgKiBDaGFuZ2VzIHRoZSBVUkwgYWNjb3JkaW5nIHRvIHRoZSBjdXJyZW50IHNBcHBTdGF0ZUtleS4gQXMgYW4gcmVhY3Rpb24gcm91dGUgY2hhbmdlIGV2ZW50IHdpbGwgYmUgdHJpZ2dlcmVkLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQHBhcmFtIHNBcHBTdGF0ZUtleSBUaGUgbmV3IGFwcCBzdGF0ZSBrZXkuXG5cdCAqL1xuXHRyZXBsYWNlSGFzaChzQXBwU3RhdGVLZXk6IHN0cmluZykge1xuXHRcdHRoaXMub05hdkhhbmRsZXIucmVwbGFjZUhhc2goc0FwcFN0YXRlS2V5KTtcblx0fVxuXHRyZXBsYWNlSW5uZXJBcHBTdGF0ZUtleShzQXBwSGFzaDogYW55LCBzQXBwU3RhdGVLZXk6IGFueSkge1xuXHRcdHJldHVybiB0aGlzLm9OYXZIYW5kbGVyLl9yZXBsYWNlSW5uZXJBcHBTdGF0ZUtleShzQXBwSGFzaCwgc0FwcFN0YXRlS2V5KTtcblx0fVxuXHQvKipcblx0ICogR2V0IHNpbmdsZSB2YWx1ZXMgZnJvbSBTZWxlY3Rpb25WYXJpYW50IGZvciB1cmwgcGFyYW1ldGVycy5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBwYXJhbSBbdlNlbGVjdGlvblZhcmlhbnRdXG5cdCAqIEBwYXJhbSBbdlNlbGVjdGlvblZhcmlhbnQub1VybFBhcmFtYXRlcnNdXG5cdCAqIEByZXR1cm5zIFRoZSB1cmwgcGFyYW1ldGVyc1xuXHQgKi9cblx0Z2V0VXJsUGFyYW1ldGVyc0Zyb21TZWxlY3Rpb25WYXJpYW50KHZTZWxlY3Rpb25WYXJpYW50OiBzdHJpbmcgfCBvYmplY3QgfCB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gdGhpcy5vTmF2SGFuZGxlci5fZ2V0VVJMUGFyYW1ldGVyc0Zyb21TZWxlY3Rpb25WYXJpYW50KHZTZWxlY3Rpb25WYXJpYW50KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTYXZlIGFwcCBzdGF0ZSBhbmQgcmV0dXJuIGltbWVkaWF0ZWx5IHdpdGhvdXQgd2FpdGluZyBmb3IgcmVzcG9uc2UuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcGFyYW0gb0luU2VsZWN0aW9uVmFyaWFudCBJbnN0YW5jZSBvZiBzYXAuZmUubmF2aWdhdGlvbi5TZWxlY3Rpb25WYXJpYW50XG5cdCAqIEByZXR1cm5zIEFwcFN0YXRlIGtleVxuXHQgKi9cblx0c2F2ZUFwcFN0YXRlV2l0aEltbWVkaWF0ZVJldHVybihvSW5TZWxlY3Rpb25WYXJpYW50OiBTZWxlY3Rpb25WYXJpYW50KTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0XHRpZiAob0luU2VsZWN0aW9uVmFyaWFudCkge1xuXHRcdFx0Y29uc3Qgc1NlbGVjdGlvblZhcmlhbnQgPSBvSW5TZWxlY3Rpb25WYXJpYW50LnRvSlNPTlN0cmluZygpLCAvLyBjcmVhdGUgYW4gU1YgZm9yIGFwcCBzdGF0ZSBpbiBzdHJpbmcgZm9ybWF0XG5cdFx0XHRcdG9TZWxlY3Rpb25WYXJpYW50ID0gSlNPTi5wYXJzZShzU2VsZWN0aW9uVmFyaWFudCksIC8vIGNvbnZlcnQgc3RyaW5nIGludG8gSlNPTiB0byBzdG9yZSBpbiBBcHBTdGF0ZVxuXHRcdFx0XHRvWEFwcFN0YXRlT2JqZWN0ID0ge1xuXHRcdFx0XHRcdHNlbGVjdGlvblZhcmlhbnQ6IG9TZWxlY3Rpb25WYXJpYW50XG5cdFx0XHRcdH0sXG5cdFx0XHRcdG9SZXR1cm4gPSB0aGlzLm9OYXZIYW5kbGVyLl9zYXZlQXBwU3RhdGVXaXRoSW1tZWRpYXRlUmV0dXJuKG9YQXBwU3RhdGVPYmplY3QpO1xuXHRcdFx0cmV0dXJuIG9SZXR1cm4/LmFwcFN0YXRlS2V5ID8gb1JldHVybi5hcHBTdGF0ZUtleSA6IFwiXCI7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIE1peCBBdHRyaWJ1dGVzIGFuZCBzZWxlY3Rpb25WYXJpYW50LlxuXHQgKlxuXHQgKiBAcGFyYW0gdlNlbWFudGljQXR0cmlidXRlcyBPYmplY3QvKEFycmF5IG9mIE9iamVjdHMpIGNvbnRhaW5pbmcga2V5L3ZhbHVlIHBhaXJzXG5cdCAqIEBwYXJhbSBzU2VsZWN0aW9uVmFyaWFudCBUaGUgc2VsZWN0aW9uIHZhcmlhbnQgaW4gc3RyaW5nIGZvcm1hdCBhcyBwcm92aWRlZCBieSB0aGUgU21hcnRGaWx0ZXJCYXIgY29udHJvbFxuXHQgKiBAcGFyYW0gW2lTdXBwcmVzc2lvbkJlaGF2aW9yPXNhcC5mZS5uYXZpZ2F0aW9uLlN1cHByZXNzaW9uQmVoYXZpb3Iuc3RhbmRhcmRdIEluZGljYXRlcyB3aGV0aGVyIHNlbWFudGljXG5cdCAqICAgICAgICBhdHRyaWJ1dGVzIHdpdGggc3BlY2lhbCB2YWx1ZXMgKHNlZSB7QGxpbmsgc2FwLmZlLm5hdmlnYXRpb24uU3VwcHJlc3Npb25CZWhhdmlvciBzdXBwcmVzc2lvbiBiZWhhdmlvcn0pIG11c3QgYmVcblx0ICogICAgICAgIHN1cHByZXNzZWQgYmVmb3JlIHRoZXkgYXJlIGNvbWJpbmVkIHdpdGggdGhlIHNlbGVjdGlvbiB2YXJpYW50OyBzZXZlcmFsXG5cdCAqICAgICAgICB7QGxpbmsgc2FwLmZlLm5hdmlnYXRpb24uU3VwcHJlc3Npb25CZWhhdmlvciBzdXBwcmVzc2lvbiBiZWhhdmlvcnN9IGNhbiBiZSBjb21iaW5lZCB3aXRoIHRoZSBiaXR3aXNlIE9SIG9wZXJhdG9yXG5cdCAqICAgICAgICAofClcblx0ICogQHJldHVybnMgSW5zdGFuY2Ugb2Yge0BsaW5rIHNhcC5mZS5uYXZpZ2F0aW9uLlNlbGVjdGlvblZhcmlhbnR9XG5cdCAqL1xuXHRtaXhBdHRyaWJ1dGVzQW5kU2VsZWN0aW9uVmFyaWFudChcblx0XHR2U2VtYW50aWNBdHRyaWJ1dGVzOiBvYmplY3QgfCBhbnlbXSxcblx0XHRzU2VsZWN0aW9uVmFyaWFudDogc3RyaW5nIHwgU2VyaWFsaXplZFNlbGVjdGlvblZhcmlhbnQsXG5cdFx0aVN1cHByZXNzaW9uQmVoYXZpb3I/OiBudW1iZXJcblx0KSB7XG5cdFx0cmV0dXJuIHRoaXMub05hdkhhbmRsZXIubWl4QXR0cmlidXRlc0FuZFNlbGVjdGlvblZhcmlhbnQodlNlbWFudGljQXR0cmlidXRlcywgc1NlbGVjdGlvblZhcmlhbnQsIGlTdXBwcmVzc2lvbkJlaGF2aW9yKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgbWV0aG9kIGNyZWF0ZXMgYSBjb250ZXh0IHVybCBiYXNlZCBvbiBwcm92aWRlZCBkYXRhLiBUaGlzIGNvbnRleHQgdXJsIGNhbiBlaXRoZXIgYmUgdXNlZCBhcy5cblx0ICpcblx0ICogQHBhcmFtIHNFbnRpdHlTZXROYW1lIFVzZWQgZm9yIHVybCBkZXRlcm1pbmF0aW9uXG5cdCAqIEBwYXJhbSBbb01vZGVsXSBUaGUgT0RhdGFNb2RlbCB1c2VkIGZvciB1cmwgZGV0ZXJtaW5hdGlvbi4gSWYgb21pdHRlZCwgdGhlIE5hdmlnYXRpb25IYW5kbGVyIG1vZGVsIGlzIHVzZWQuXG5cdCAqIEByZXR1cm5zIFRoZSBjb250ZXh0IHVybCBmb3IgdGhlIGdpdmVuIGVudGl0aWVzXG5cdCAqL1xuXHRjb25zdHJ1Y3RDb250ZXh0VXJsKHNFbnRpdHlTZXROYW1lOiBzdHJpbmcsIG9Nb2RlbDogYW55KSB7XG5cdFx0cmV0dXJuIHRoaXMub05hdkhhbmRsZXIuY29uc3RydWN0Q29udGV4dFVybChzRW50aXR5U2V0TmFtZSwgb01vZGVsKTtcblx0fVxuXHRnZXRJbnRlcmZhY2UoKSB7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cbn1cbmZ1bmN0aW9uIGZuR2V0RW1wdHlPYmplY3QoKSB7XG5cdHJldHVybiB7fTtcbn1cblxuZnVuY3Rpb24gZm5HZXRQcm9taXNlKCkge1xuXHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHt9KTtcbn1cblxuZnVuY3Rpb24gZm5HZXRKUXVlcnlQcm9taXNlKCkge1xuXHRjb25zdCBvTXlEZWZmZXJlZCA9IGpRdWVyeS5EZWZlcnJlZCgpO1xuXHRvTXlEZWZmZXJlZC5yZXNvbHZlKHt9LCB7fSwgXCJpbml0aWFsXCIpO1xuXHRyZXR1cm4gb015RGVmZmVyZWQucHJvbWlzZSgpO1xufVxuXG5mdW5jdGlvbiBmbkdldEVtcHR5U3RyaW5nKCkge1xuXHRyZXR1cm4gXCJcIjtcbn1cbmV4cG9ydCBjbGFzcyBOYXZpZ2F0aW9uU2VydmljZXNNb2NrIHtcblx0aW5pdFByb21pc2U6IFByb21pc2U8YW55Pjtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5pbml0UHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZSh0aGlzKTtcblx0fVxuXG5cdGdldEludGVyZmFjZSgpIHtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8vIHJldHVybiBlbXB0eSBvYmplY3Rcblx0Y3JlYXRlRW1wdHlBcHBTdGF0ZSA9IGZuR2V0RW1wdHlPYmplY3Q7XG5cdHN0b3JlSW5uZXJBcHBTdGF0ZVdpdGhJbW1lZGlhdGVSZXR1cm4gPSBmbkdldEVtcHR5T2JqZWN0O1xuXHRtaXhBdHRyaWJ1dGVzQW5kU2VsZWN0aW9uVmFyaWFudCA9IGZuR2V0RW1wdHlPYmplY3Q7XG5cblx0Ly8gcmV0dXJuIHByb21pc2Vcblx0Z2V0QXBwU3RhdGUgPSBmbkdldFByb21pc2U7XG5cdGdldFN0YXJ0dXBBcHBTdGF0ZSA9IGZuR2V0UHJvbWlzZTtcblx0cGFyc2VOYXZpZ2F0aW9uID0gZm5HZXRKUXVlcnlQcm9taXNlO1xuXG5cdC8vIHJldHVybiBlbXB0eSBzdHJpbmdcblx0Y29uc3RydWN0Q29udGV4dFVybCA9IGZuR2V0RW1wdHlTdHJpbmc7XG5cblx0cmVwbGFjZUlubmVyQXBwU3RhdGVLZXkoc0FwcEhhc2g6IGFueSkge1xuXHRcdHJldHVybiBzQXBwSGFzaCA/IHNBcHBIYXNoIDogXCJcIjtcblx0fVxuXG5cdG5hdmlnYXRlKCkge1xuXHRcdC8vIERvbid0IGRvIGFueXRoaW5nXG5cdH1cbn1cblxuY2xhc3MgTmF2aWdhdGlvblNlcnZpY2VGYWN0b3J5IGV4dGVuZHMgU2VydmljZUZhY3Rvcnk8TmF2aWdhdGlvblNlcnZpY2VTZXR0aW5ncz4ge1xuXHRjcmVhdGVJbnN0YW5jZShvU2VydmljZUNvbnRleHQ6IFNlcnZpY2VDb250ZXh0PE5hdmlnYXRpb25TZXJ2aWNlU2V0dGluZ3M+KSB7XG5cdFx0Y29uc3Qgb05hdmlnYXRpb25TZXJ2aWNlID1cblx0XHRcdHNhcC51c2hlbGwgJiYgc2FwLnVzaGVsbC5Db250YWluZXIgPyBuZXcgTmF2aWdhdGlvblNlcnZpY2Uob1NlcnZpY2VDb250ZXh0KSA6IG5ldyBOYXZpZ2F0aW9uU2VydmljZXNNb2NrKCk7XG5cdFx0Ly8gV2FpdCBGb3IgaW5pdFxuXHRcdHJldHVybiBvTmF2aWdhdGlvblNlcnZpY2UuaW5pdFByb21pc2UudGhlbihmdW5jdGlvbiAob1NlcnZpY2U6IGFueSkge1xuXHRcdFx0cmV0dXJuIG9TZXJ2aWNlO1xuXHRcdH0pO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE5hdmlnYXRpb25TZXJ2aWNlRmFjdG9yeTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7OztNQVNhQSxpQkFBaUI7SUFBQTtJQUFBO01BQUE7SUFBQTtJQUFBO0lBQUE7SUFBQSxPQUc3QkMsSUFBSSxHQUFKLGdCQUFPO01BQ04sTUFBTUMsUUFBUSxHQUFHLElBQUksQ0FBQ0MsVUFB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