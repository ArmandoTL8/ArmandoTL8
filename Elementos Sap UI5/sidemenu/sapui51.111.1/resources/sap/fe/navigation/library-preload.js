//@ui5-bundle sap/fe/navigation/library-preload.js
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/navigation/NavError-dbg", ["sap/ui/base/Object"], function (BaseObject) {
  "use strict";

  var _exports = {};
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  /**
   * This is the successor of {@link sap.ui.generic.app.navigation.service.NavError}.<br> An object that provides error handling information during runtime.
   *
   * @public
   * @class
   * @param {string} errorCode The code for an internal error of a consumer that allows you to track the source locations
   * @extends sap.ui.base.Object
   * @since 1.83.0
   * @name sap.fe.navigation.NavError
   */
  let NavError = /*#__PURE__*/function (_BaseObject) {
    _inheritsLoose(NavError, _BaseObject);
    /**
     * Constructor requiring the error code as input.
     *
     * @param errorCode String based error code.
     */
    function NavError(errorCode) {
      var _this;
      _this = _BaseObject.call(this) || this;
      _this._sErrorCode = errorCode;
      return _this;
    }

    /**
     * Returns the error code with which the instance has been created.
     *
     * @public
     * @returns {string} The error code of the error
     */
    _exports.NavError = NavError;
    var _proto = NavError.prototype;
    _proto.getErrorCode = function getErrorCode() {
      return this._sErrorCode;
    };
    return NavError;
  }(BaseObject); // Exporting the class as properly typed UI5Class
  _exports.NavError = NavError;
  const UI5Class = BaseObject.extend("sap.fe.navigation.NavError", NavError.prototype);
  return UI5Class;
}, false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/navigation/NavError", ["sap/ui/base/Object"],function(t){"use strict";var r={};function o(t,r){t.prototype=Object.create(r.prototype);t.prototype.constructor=t;e(t,r)}function e(t,r){e=Object.setPrototypeOf?Object.setPrototypeOf.bind():function t(r,o){r.__proto__=o;return r};return e(t,r)}let n=function(t){o(e,t);function e(r){var o;o=t.call(this)||this;o._sErrorCode=r;return o}r.NavError=e;var n=e.prototype;n.getErrorCode=function t(){return this._sErrorCode};return e}(t);r.NavError=n;const c=t.extend("sap.fe.navigation.NavError",n.prototype);return c},false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/navigation/NavigationHandler-dbg", ["sap/base/assert", "sap/base/Log", "sap/base/util/extend", "sap/base/util/isEmptyObject", "sap/base/util/merge", "sap/ui/base/Object", "sap/ui/core/routing/HashChanger", "sap/ui/core/UIComponent", "sap/ui/thirdparty/URI", "sap/ui/util/openWindow", "./library", "./NavError", "./SelectionVariant"], function (assert, Log, extend, isEmptyObject, merge, BaseObject, HashChanger, UIComponent, URI, openWindow, NavLibrary, NavError, SelectionVariant) {
  "use strict";

  var _exports = {};
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  // shortcuts for sap.ui.generic.app enums
  const NavType = NavLibrary.NavType;
  const ParamHandlingMode = NavLibrary.ParamHandlingMode;
  const SuppressionBehavior = NavLibrary.SuppressionBehavior;
  const Mode = NavLibrary.Mode;
  const IAPP_STATE = "sap-iapp-state";
  const DEFAULTED_PARAMETER_PROPERTY = "sap-ushell-defaultedParameterNames";

  /**
   * This is the successor of {@link sap.ui.generic.app.navigation.service.NavigationHandler}.<br> Creates a new NavigationHandler class by providing the required environment. <br>
   * The <code>NavigationHandler</code> supports the verification of sensitive information. All properties that are part of
   * <code>selectionVariant</code> and <code>valueTexts</code> will be verified if they are annotated as
   * <code>com.sap.vocabularies.PersonalData.v1.IsPotentiallySensitive</code> or
   * <code>com.sap.vocabularies.UI.v1.ExcludeFromNavigationContext</code> and will be removed before the data is persisted as the app
   * state.<br>
   * Also, all properties annotated as <code>com.sap.vocabularies.Analytics.v1.Measure</code> will be removed from the data stored as the
   * xapp state.<br>
   * To verify the information to be removed, the <code>NavigationHandler</code> requires an unnamed model of type
   * {@link sap.ui.model.odata.v2.ODataModel} on component level. It is possible to set such a model using the <code>setModel</code>
   * method.<br>
   * <b>Note:</b> The check for excluded data requires that the OData metadata has already been loaded completely.<br>
   * If the OData metadata model has not been loaded completely, all properties are removed from the application context.<br>
   * <b>Note:</b> This class requires that the UShell {@link sap.ushell.services.CrossApplicationNavigation} is available and initialized.
   *
   * @public
   * @class
   * @extends sap.ui.base.Object
   * @since 1.83.0
   * @name sap.fe.navigation.NavigationHandler
   */
  let NavigationHandler = /*#__PURE__*/function (_BaseObject) {
    _inheritsLoose(NavigationHandler, _BaseObject);
    // list of technical parameters

    /*
     * There exists a generation of "old" sap-iapp-states which are based on the following URL schema:
     * #SemObj-action&/route/sap-iapp-state=ABC12345678 The new URL schema is: #SemObj-action&/route?sap-iapp-state=ABC12345678 (mind the
     * difference between / and ? above), i.e. the sap-iapp-state has become a parameter of the query parameter section in the AppHash string.
     * Yet, this tool shall be able to deal even with old sap-iapp-states. Therefore, we use two Regular Expressions (rIAppStateOld and
     * rIAppStateOldAtStart) as defined below to scan for these old variants. The new variant is being scanned using rIAppStateNew as Regular
     * Expression search string. Compatibility is centrally ensured by the two methods _getInnerAppStateKey and _replaceInnerAppStateKey (see
     * below). Never use these RegExp in a method on your own, as it typically indicates that you will fall into the compatibility trap!
     */
    // Warning! Do not use GLOBAL flags here; RegExp in GLOBAL mode store the lastIndex value
    // Therefore, repeated calls to the RegExp will then only start beginning with that stored
    // lastIndex. Thus, multiple calls therefore could yield strange results.
    // Moreover, there shall only be exactly one IAPP_STATE per RegExp in an AppHash.
    // Therefore, GLOBAL search should be superfluous.

    /*
     * Regular Expression in words: Search for something that either starts with ? or &, followed by the term "sap-iapp-state". That one is
     * followed by an equal sign (=). The stuff that is after the equal sign forms the first regexp group. This group consists of at least one
     * (or arbitrary many) characters, as long as it is not an ampersand sign (&). Characters after such an ampersand would be ignored and do
     * not belong to the group. Alternatively, the string also may end.
     */

    /**
     * Temporarily added again because an application was (illegially) relying on it. Should be removed again, once the app is corrected
     */

    /**
     * Constructor requiring a controller/component owning the navigation handler.
     *
     * @param {object} oController UI5 controller that contains a router and a component; typically the main controller of your application, for
     *        example, a subclass of the sap.ca.scfld.md.controller.BaseFullscreenController if scaffolding is used
     * @param {string} [sMode=sap.fe.navigation.Mode.ODataV4] Mode to be used to indicates the Odata version used for runnning the Navigation Handler,
     *        see {@link sap.fe.navigation.Mode}.<br>
     * 		  Note: Mode has to be sap.fe.navigation.Mode.ODataV2 whenever this constructor is used to initialize a OData V2 based service.
     * @param {string} [sParamHandlingMode=SelVarWins] Mode to be used to handle conflicts when merging URL parameters and the SelectionVariant class,
     *        see {@link sap.fe.navigation.ParamHandlingMode}
     * @throws An instance of {@link sap.fe.navigation.NavError} in case of input errors. Valid error codes are: <table>
     *         <tr>
     *         <th align="left">NavError code</th>
     *         <th align="left">Description</th>
     *         </tr>
     *         <tr>
     *         <td>NavigationHandler.INVALID_INPUT</td>
     *         <td>Indicates that the input parameter is invalid</td>
     *         </tr>
     *         </table>
     */
    function NavigationHandler(oController, sMode, sParamHandlingMode) {
      var _this;
      _this = _BaseObject.call(this) || this;
      _this._aTechnicalParamaters = ["hcpApplicationId"];
      _this._oLastSavedInnerAppData = {
        sAppStateKey: "",
        oAppData: {},
        iCacheHit: 0,
        iCacheMiss: 0
      };
      _this._rIAppStateOld = new RegExp("/" + IAPP_STATE + "=([^/?]+)");
      _this._rIAppStateOldAtStart = new RegExp("^" + IAPP_STATE + "=([^/?]+)");
      _this._rIAppStateNew = new RegExp("[?&]" + IAPP_STATE + "=([^&]+)");
      _this.IAPP_STATE = IAPP_STATE;
      if (!oController) {
        throw new NavError("NavigationHandler.INVALID_INPUT");
      }
      if (oController instanceof UIComponent) {
        _this.oRouter = oController.getRouter();
        _this.oComponent = oController;
      } else {
        if (typeof oController.getOwnerComponent !== "function") {
          throw new NavError("NavigationHandler.INVALID_INPUT");
        }
        _this.oRouter = _this._getRouter(oController);
        _this.oComponent = oController.getOwnerComponent();
      }

      // special handling for SmartTemplates
      if (_this.oComponent && _this.oComponent.getAppComponent) {
        _this.oComponent = _this.oComponent.getAppComponent();
      }
      if (typeof _this.oRouter === "undefined" || typeof _this.oComponent === "undefined" || typeof _this.oComponent.getComponentData !== "function") {
        throw new NavError("NavigationHandler.INVALID_INPUT");
      }
      if (sParamHandlingMode === ParamHandlingMode.URLParamWins || sParamHandlingMode === ParamHandlingMode.InsertInSelOpt) {
        _this.sParamHandlingMode = sParamHandlingMode;
      } else {
        _this.sParamHandlingMode = ParamHandlingMode.SelVarWins; // default
      }

      if (sMode === Mode.ODataV2) {
        _this._sMode = sMode;
      }
      return _this;
    }

    /**
     * Retrieves the shell navigation service.
     *
     * @returns The Navigation service
     * @private
     */
    _exports.NavigationHandler = NavigationHandler;
    var _proto = NavigationHandler.prototype;
    _proto._getAppNavigationService = function _getAppNavigationService() {
      return sap.ushell.Container.getService("CrossApplicationNavigation");
    }

    /**
     * Retrieves the shell navigation service.
     *
     * @returns The Navigation service
     * @private
     */;
    _proto._getAppNavigationServiceAsync = function _getAppNavigationServiceAsync() {
      return sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function (oCrossAppNavService) {
        return oCrossAppNavService;
      }).catch(function () {
        Log.error("NavigationHandler: CrossApplicationNavigation is not available.");
        throw new NavError("NavigationHandler.NO.XAPPSERVICE");
      });
    }

    /**
     * Retrieves the reference to the router object for navigation for this given Controller.
     *
     * @param oController The reference to the Controller for which the Router instance shall be determined.
     * @returns The Router for the given Controller
     * @private
     */;
    _proto._getRouter = function _getRouter(oController) {
      return UIComponent.getRouterFor(oController);
    }

    /**
     * This method is to be used only by FE V2 to get access to toExternal promise.
     *
     * @param fnCallback Callback to be called by 'navigate' method in case of toExternal is used to navigate.
     * @private
     */;
    _proto.registerNavigateCallback = function registerNavigateCallback(fnCallback) {
      this._navigateCallback = fnCallback;
    }

    /**
     * Triggers a cross-app navigation after saving the inner and the cross-app states. The navigation mode based on
     * <code>sap-ushell-next-navmode</code> is taken into account. If set to <code>explace</code> the inner app state will not be changed.
     * <b>Note:</b> The <code>sNavMode</code> argument can be used to overwrite the SAP Fiori launchpad default navigation for opening a URL
     * in-place or ex-place.
     * <br>
     * <b>Node:</b> If the <code>oExternalAppData</code> parameter is not supplied, the external app data will be calculated based on
     * the <code>oInnerAppData</code> data.<br>
     * SmartFilterBar control <b>Parameters:</b> <table>
     * <tr>
     * <td align="center">{object}</td>
     * <td><b>oError</b></td>
     * <td>NavError object (instance of {@link sap.fe.navigation.NavError}) that describes which kind of error occurred</td>
     * <tr>
     * <td align="center">{string}</td>
     * <td><b>oError.errorCode</b></td>
     * <td>Code to identify the error</td>
     * <tr>
     * <td align="center">{string}</td>
     * <td><b>oError.type</b></td>
     * <td>Severity of the error (info/warning/error)</td>
     * <tr>
     * <td align="center">{array}</td>
     * <td><b>oError.params</b></td>
     * <td>An array of objects (typically strings) that describe additional value parameters required for generating the message</td>
     * </table>.
     *
     * @public
     * @function navigate
     * @memberof sap.fe.navigation.NavigationHandler.prototype
     * @param sSemanticObject Name of the semantic object of the target app
     * @param sActionName Name of the action of the target app
     * @param vNavigationParameters Navigation parameters as an object with key/value pairs or as a string representation of such an object. If passed as an object, the properties are not checked against the <code>IsPotentialSensitive</code> or <code>Measure</code> type.
     * @param oInnerAppData Object for storing current state of the app
     * @param fnOnError Callback that is called if an error occurs during navigation <br>
     * @param oExternalAppData Object for storing the state which will be forwarded to the target component.
     * @param oExternalAppData.presentationVariant Object containing the current ui state of the app which will be forwarded to the
     *        target component.
     * @param oExternalAppData.valueTexts Object containing value descriptions which will be forwarded to the target component.
     * @param oExternalAppData.selectionVariant Stringified JSON object, which will be forwarded to the target component. If not
     *        provided the selectionVariant will be constructed based on the vNavigationParameters.
     * @param sNavMode Argument is used to overwrite the FLP-configured target for opening a URL. If used, only the
     *        <code>explace</code> or <code>inplace</code> values are allowed. Any other value will lead to an exception
     *        <code>NavigationHandler.INVALID_NAV_MODE</code>.
     * @example <code>
     * sap.ui.define(["sap/fe/navigation/NavigationHandler", "sap/fe/navigation/SelectionVariant"], function (NavigationHandler, SelectionVariant) {
     * 	var oNavigationHandler = new NavigationHandler(oController);
     * 	var sSemanticObject = "SalesOrder";
     * 	var sActionName = "create";
     *
     * 	//simple parameters as Object
     * 	var vNavigationParameters = {
     * 		CompanyCode : "0001",
     * 		Customer : "C0001"
     * 	};
     *
     * 	//or as selection variant
     * 	var oSelectionVariant = new SelectionVariant();
     *	 oSelectionVariant.addSelectOption("CompanyCode", "I", "EQ", "0001");
     * 	oSelectionVariant.addSelectOption("Customer", "I", "EQ", "C0001");
     * 	vNavigationParameters = oSelectionVariant.toJSONString();
     *
     * 	//or directly from SmartFilterBar
     * 	vNavigationParameters = oSmartFilterBar.getDataSuiteFormat();
     *
     * 	//app state for back navigation
     *	 var oInnerAppData = {
     * 		selectionVariant : oSmartFilterBar.getDataSuiteFormat(),
     * 		tableVariantId : oSmartTable.getCurrentVariantId(),
     * 		customData : oMyCustomData
     * 	};
     *
     * 	// callback function in case of errors
     * 	var fnOnError = function(oError){
     * 		var oi18n = oController.getView().getModel("i18n").getResourceBundle();
     * 		oError.setUIText({oi18n : oi18n, sTextKey : "OUTBOUND_NAV_ERROR"});
     * 		oError.showMessageBox();
     * 	};
     *
     * 	oNavigationHandler.navigate(sSemanticObject, sActionName, vNavigationParameters, oInnerAppData, fnOnError);
     * });
     * </code>
     */;
    _proto.navigate = function navigate(sSemanticObject, sActionName, vNavigationParameters, oInnerAppData, fnOnError, oExternalAppData, sNavMode) {
      let sSelectionVariant,
        mParameters,
        oXAppDataObj,
        oStartupParameters,
        bExPlace = false,
        oTmpData = {};
      const oNavHandler = this;
      const oComponentData = this.oComponent.getComponentData();
      /*
       * There are some race conditions where the oComponentData may not be set, for example in case the UShell was not initialized properly. To
       * make sure that we do not dump here with an exception, we take this special error handling behavior:
       */
      if (oComponentData) {
        oStartupParameters = oComponentData.startupParameters;
        if (oStartupParameters && oStartupParameters["sap-ushell-next-navmode"] && oStartupParameters["sap-ushell-next-navmode"].length > 0) {
          // bExPlace = (JSON.parse(oStartupParameters["sap-ushell-next-navmode"][0]) === "explace");
          bExPlace = oStartupParameters["sap-ushell-next-navmode"][0] === "explace";
        }
      }

      // only nav-mode 'inplace' or 'explace' are supported. Any other value will lead to an exception.
      if (sNavMode && (sNavMode === "inplace" || sNavMode === "explace")) {
        bExPlace = sNavMode === "explace";
      } else if (sNavMode) {
        throw new NavError("NavigationHandler.INVALID_NAV_MODE");
      }
      if (oExternalAppData === undefined || oExternalAppData === null) {
        oXAppDataObj = {};
      } else {
        oXAppDataObj = oExternalAppData;
      }

      // for navigation we need URL parameters (legacy navigation) and sap-xapp-state, therefore we need to create the missing one from the
      // passed one
      if (typeof vNavigationParameters === "string") {
        sSelectionVariant = vNavigationParameters;
      } else if (typeof vNavigationParameters === "object") {
        const oEnrichedSelVar = this._splitInboundNavigationParameters(new SelectionVariant(), vNavigationParameters, []).oNavigationSelVar;
        sSelectionVariant = oEnrichedSelVar.toJSONString();
      } else {
        throw new NavError("NavigationHandler.INVALID_INPUT");
      }
      oTmpData.selectionVariant = new SelectionVariant(sSelectionVariant);
      if (typeof vNavigationParameters === "string") {
        oTmpData.selectionVariant = this._removeTechnicalParameters(oTmpData.selectionVariant);
      }
      oTmpData.selectionVariant = oTmpData.selectionVariant && oTmpData.selectionVariant.toJSONObject();
      oTmpData = this._removeMeasureBasedInformation(oTmpData); // remove eventual measures
      oTmpData = this._checkIsPotentiallySensitive(oTmpData); // remove eventual sensitive data

      if (oTmpData.selectionVariant) {
        mParameters = this._getURLParametersFromSelectionVariant(new SelectionVariant(oTmpData.selectionVariant));
        sSelectionVariant = new SelectionVariant(oTmpData.selectionVariant).toJSONString();
      } else {
        mParameters = {};
        sSelectionVariant = null;
      }
      const oNavArguments = {
        target: {
          semanticObject: sSemanticObject,
          action: sActionName
        },
        params: mParameters || {}
      };
      const fnNavigate = function (oCrossAppNavService) {
        if (!oXAppDataObj.selectionVariant) {
          oXAppDataObj.selectionVariant = sSelectionVariant;
        }
        const fnNavExplace = function () {
          const sNewHrefPromise = oCrossAppNavService.hrefForExternalAsync(oNavArguments, oNavHandler.oComponent);
          sNewHrefPromise.then(function (sNewHref) {
            openWindow(sNewHref);
          }).catch(function (oError) {
            Log.error("Error while retireving hrefForExternal : " + oError);
          });
        };
        oXAppDataObj = oNavHandler._removeMeasureBasedInformation(oXAppDataObj);
        return oNavHandler._fnSaveAppStateAsync(oXAppDataObj, fnOnError).then(function (oSaveAppStateReturn) {
          if (oSaveAppStateReturn) {
            oNavArguments.appStateKey = oSaveAppStateReturn.appStateKey;

            // Remark:
            // The Cross App Service takes care of encoding parameter keys and values. Example:
            // mParams = { "$@%" : "&/=" } results in the URL parameter %2524%2540%2525=%2526%252F%253D
            // Note the double encoding, this is correct.

            // toExternal sets sap-xapp-state in the URL if appStateKey is provided in oNavArguments
            // toExternal has issues on sticky apps FIORITECHP1-14400, temp fix using hrefForExternal
            if (sNavMode == "explace") {
              fnNavExplace();
            } else {
              const ptoExt = oCrossAppNavService.toExternal(oNavArguments, oNavHandler.oComponent);
              // TODO: This is just a temporary solution to allow FE V2 to use toExternal promise.
              if (oNavHandler._navigateCallback) {
                oNavHandler._navigateCallback(ptoExt);
              }
            }
          } // else : error was already reported
        });
      };

      const fnStoreAndNavigate = function (oCrossAppNavService) {
        oNavHandler.storeInnerAppStateAsync(oInnerAppData, true).then(function (sAppStateKey) {
          if (sAppStateKey) {
            oNavHandler.replaceHash(sAppStateKey);
          }
          return fnNavigate(oCrossAppNavService);
        }).catch(function (oError) {
          if (fnOnError) {
            fnOnError(oError);
          }
        });
      };
      if (sNavMode) {
        oNavArguments.params["sap-ushell-navmode"] = bExPlace ? "explace" : "inplace";
      }
      oNavHandler._getAppNavigationServiceAsync().then(function (oCrossAppNavService) {
        const oSupportedPromise = oCrossAppNavService.isNavigationSupported([oNavArguments], oNavHandler.oComponent);
        oSupportedPromise.done(function (oTargets) {
          if (oTargets[0].supported) {
            if (!bExPlace) {
              fnStoreAndNavigate(oCrossAppNavService);
            } else {
              fnNavigate(oCrossAppNavService);
            }
          } else if (fnOnError) {
            // intent is not supported
            const oError = new NavError("NavigationHandler.isIntentSupported.notSupported");
            fnOnError(oError);
          }
        });
        if (fnOnError) {
          oSupportedPromise.fail(function () {
            // technical error: could not determine if intent is supported
            const oError = oNavHandler._createTechnicalError("NavigationHandler.isIntentSupported.failed");
            fnOnError(oError);
          });
        }
      }).catch(function (oError) {
        if (fnOnError) {
          fnOnError(oError);
        }
      });
    }

    /**
     * Parses the incoming URL and returns a Promise. If this method detects a back navigation, the inner app state is returned in the resolved
     * Promise. Otherwise startup parameters will be merged into the app state provided by cross app navigation, and a combined app state will be
     * returned. The conflict resolution can be influenced with sParamHandlingMode defined in the constructor.
     *
     * @returns A Promise object to monitor when all the actions of the function have been executed. If the execution is successful, the
     *          extracted app state, the startup parameters, and the type of navigation are returned, see also the example above. The app state is
     *          an object that contains the following information:
     *          <ul>
     *          <li><code>oAppData.oSelectionVariant</code>: An instance of {@link sap.fe.navigation.SelectionVariant}
     *          containing only parameters/select options that are related to navigation</li>
     *          <li><code>oAppData.selectionVariant</code>: The navigation-related selection variant as a JSON-formatted string</li>
     *          <li><code>oAppData.oDefaultedSelectionVariant</code>: An instance of
     *          {@link sap.fe.navigation.SelectionVariant} containing only the parameters/select options that are set by user
     *          default data</li>
     *          <li><code>oAppData.bNavSelVarHasDefaultsOnly</code>: A Boolean flag that indicates whether only defaulted parameters and no
     *          navigation parameters are present.<br>
     *          <b>Note:</b> If no navigation parameters are available, <code>bNavSelVarHasDefaultsOnly</code> is set to <code>true</code>,
     *          even though parameters without default might be available as well.</li>
     *          </ul>
     *          If the navigation-related selection variant is empty, it is replaced by a copy of the defaulted selection variant.<br>
     *          The navigation type is an enumeration type of type {@link sap.fe.navigation.NavType} (possible values are
     *          initial, URLParams, xAppState, and iAppState).<br>
     *          <b>Note:</b> If the navigation type is {@link sap.fe.navigation.NavType.iAppState} oAppData has two
     *          additional properties
     *          <ul>
     *          <li><code>oAppData.tableVariantId</code></li>
     *          <li><code>oAppData.customData</code></li>
     *          </ul>
     *          which return the inner app data as stored in {@link #.navigate navigate} or {@link #.storeInnerAppStateAsync storeInnerAppStateAsync}.
     *          <code>oAppData.oDefaultedSelectionVariant</code> is an empty selection variant and
     *          <code>oAppData.bNavSelVarHasDefaultsOnly</code> is <code>false</code> in this case.<br>
     *          <b>Note:</b> If the navigation type is {@link sap.fe.navigation.NavType.initial} oAppData is an empty object!<br>
     *          If an error occurs, an error object of type {@link sap.fe.navigation.NavError}, URL parameters (if available)
     *          and the type of navigation are returned.
     * @public
     * @example <code>
     * sap.ui.define(["sap/fe/navigation/NavigationHandler"], function (NavigationHandler) {
     * 	var oNavigationHandler = new NavigationHandler(oController);
     * 	var oParseNavigationPromise = oNavigationHandler.parseNavigation();
     *
     * 	oParseNavigationPromise.done(function(oAppData, oStartupParameters, sNavType){
     * 			oSmartFilterBar.setDataSuiteFormat(oAppData.selectionVariant);
     * 			// oAppData.oSelectionVariant can be used to manipulate the selection variant
     * 			// oAppData.oDefaultedSelectionVariant contains the parameters which are set by user defaults
     * 			// oAppData.bNavSelVarHasDefaultsOnly indicates whether only defaulted parameters and no navigation parameters are present
     * 	});
     * 	oParseNavigationPromise.fail(function(oError, oURLParameters, sNavType){
     * 		// if e.g. the xapp state could not be loaded, nevertheless there may be URL parameters available
     * 		//some error handling
     * 	});
     * });
     * </code>
     */;
    _proto.parseNavigation = function parseNavigation() {
      const sAppHash = HashChanger.getInstance().getHash();
      /*
       * use .getHash() here instead of .getAppHash() to also be able dealing with environments where only SAPUI5 is loaded and the UShell is
       * not initialized properly.
       */
      const sIAppState = this._getInnerAppStateKey(sAppHash);
      let oComponentData = this.oComponent.getComponentData();
      /*
       * There are some race conditions where the oComponentData may not be set, for example in case the UShell was not initialized properly. To
       * make sure that we do not dump here with an exception, we take this special error handling behavior:
       */
      if (oComponentData === undefined) {
        Log.warning("The navigation Component's data was not set properly; assuming instead that no parameters are provided.");
        oComponentData = {};
      }

      // Remark:
      // The startup parameters are already decoded. Example:
      // The original URL parameter %2524%2540%2525=%2526%252F%253D results in oStartupParameters = { "$@%" : "&/=" }
      // Note the double encoding in the URL, this is correct. An URL parameter like xyz=%25 causes an "URI malformed" error.
      // If the decoded value should be e.g. "%25", the parameter in the URL needs to be: xyz=%252525
      const oStartupParameters = oComponentData.startupParameters;
      let aDefaultedParameters = [];
      if (oStartupParameters && oStartupParameters[DEFAULTED_PARAMETER_PROPERTY] && oStartupParameters[DEFAULTED_PARAMETER_PROPERTY].length > 0) {
        aDefaultedParameters = JSON.parse(oStartupParameters[DEFAULTED_PARAMETER_PROPERTY][0]);
      }
      const oMyDeferred = jQuery.Deferred();
      const oNavHandler = this;
      const parseUrlParams = function (oSubStartupParameters, aSubDefaultedParameters, oSubMyDeferred, sNavType) {
        // standard URL navigation
        const oSelVars = oNavHandler._splitInboundNavigationParameters(new SelectionVariant(), oSubStartupParameters, aSubDefaultedParameters);
        if (oSelVars.oNavigationSelVar.isEmpty() && oSelVars.oDefaultedSelVar.isEmpty()) {
          // Startup parameters contain only technical parameters (SAP system) which were filtered out.
          // oNavigationSelVar and oDefaultedSelVar are empty.
          // Thus, consider this type of navigation as an initial navigation.
          if (sNavType === NavType.xAppState) {
            const oError = oNavHandler._createTechnicalError("NavigationHandler.getDataFromAppState.failed");
            oSubMyDeferred.reject(oError, oSubStartupParameters || {}, NavType.xAppState);
          } else {
            oSubMyDeferred.resolve({}, oSubStartupParameters, NavType.initial);
          }
        } else {
          const oAppStateData = {};
          oAppStateData.selectionVariant = oSelVars.oNavigationSelVar.toJSONString();
          oAppStateData.oSelectionVariant = oSelVars.oNavigationSelVar;
          oAppStateData.oDefaultedSelectionVariant = oSelVars.oDefaultedSelVar;
          oAppStateData.bNavSelVarHasDefaultsOnly = oSelVars.bNavSelVarHasDefaultsOnly;
          oSubMyDeferred.resolve(oAppStateData, oSubStartupParameters, sNavType);
        }
      };
      if (sIAppState) {
        // inner app state is available in the AppHash (back navigation); extract the parameter value
        this._loadAppState(sIAppState, oMyDeferred);
      } else {
        // no back navigation
        const bIsXappStateNavigation = oComponentData["sap-xapp-state"] !== undefined;
        if (bIsXappStateNavigation) {
          const that = this;
          // inner app state was not found in the AppHash, but xapp state => try to read the xapp state
          this._getAppNavigationServiceAsync().then(function (oCrossAppNavService) {
            const oStartupPromise = oCrossAppNavService.getStartupAppState(that.oComponent);
            oStartupPromise.done(function (oAppState) {
              // get app state from sap-xapp-state,
              // create a copy, not only a reference, because we want to modify the object
              let oAppStateData = oAppState.getData();
              let oError;
              if (oAppStateData) {
                try {
                  oAppStateData = JSON.parse(JSON.stringify(oAppStateData));
                } catch (x) {
                  oError = oNavHandler._createTechnicalError("NavigationHandler.AppStateData.parseError");
                  oMyDeferred.reject(oError, oStartupParameters, NavType.xAppState);
                  return oMyDeferred.promise();
                }
              }
              if (oAppStateData) {
                const oSelVar = new SelectionVariant(oAppStateData.selectionVariant);
                const oSelVars = oNavHandler._splitInboundNavigationParameters(oSelVar, oStartupParameters, aDefaultedParameters);
                oAppStateData.selectionVariant = oSelVars.oNavigationSelVar.toJSONString();
                oAppStateData.oSelectionVariant = oSelVars.oNavigationSelVar;
                oAppStateData.oDefaultedSelectionVariant = oSelVars.oDefaultedSelVar;
                oAppStateData.bNavSelVarHasDefaultsOnly = oSelVars.bNavSelVarHasDefaultsOnly;
                oMyDeferred.resolve(oAppStateData, oStartupParameters, NavType.xAppState);
              } else if (oStartupParameters) {
                parseUrlParams(oStartupParameters, aDefaultedParameters, oMyDeferred, NavType.xAppState);
              } else {
                // sap-xapp-state navigation, but ID has already expired, but URL parameters available
                oError = oNavHandler._createTechnicalError("NavigationHandler.getDataFromAppState.failed");
                oMyDeferred.reject(oError, oStartupParameters || {}, NavType.xAppState);
              }
            });
            oStartupPromise.fail(function () {
              const oError = oNavHandler._createTechnicalError("NavigationHandler.getStartupState.failed");
              oMyDeferred.reject(oError, {}, NavType.xAppState);
            });
          }).catch(function () {
            const oError = oNavHandler._createTechnicalError("NavigationHandler._getAppNavigationServiceAsync.failed");
            oMyDeferred.reject(oError, {}, NavType.xAppState);
          });
        } else if (oStartupParameters) {
          // no sap-xapp-state
          parseUrlParams(oStartupParameters, aDefaultedParameters, oMyDeferred, NavType.URLParams);
        } else {
          // initial navigation
          oMyDeferred.resolve({}, {}, NavType.initial);
        }
      }
      return oMyDeferred.promise();
    }

    /**
     * Sets the application specific technical parameters. Technical parameters will not be added to the selection variant passed to the
     * application. As a default the following values are considered as technical parameters:
     * <ul>
     * <li><code>sap-system</code></li>
     * <li><code>sap-ushell-defaultedParameterNames</code></li>
     * <li><code>"hcpApplicationId"</code></li>
     * </ul>.
     *
     * @public
     * @function setTechnicalParameters
     * @memberof sap.fe.navigation.NavigationHandler.prototype
     * @param {Array} aTechnicalParameters List of parameter names to be considered as technical parameters. <code>null</code> or
     *        <code>undefined</code> may be used to reset the complete list.
     */;
    _proto.setTechnicalParameters = function setTechnicalParameters(aTechnicalParameters) {
      if (!aTechnicalParameters) {
        aTechnicalParameters = [];
      }
      if (!Array.isArray(aTechnicalParameters)) {
        Log.error("NavigationHandler: parameter incorrect, array of strings expected");
        throw new NavError("NavigationHandler.INVALID_INPUT");
      }
      this._aTechnicalParamaters = aTechnicalParameters;
    }

    /**
     * Gets the application specific technical parameters. Technical parameters will not be added to the selection variant passed to the
     * application. As a default the following values are considered as technical parameters:
     * <ul>
     * <li><code>sap-system</code></li>
     * <li><code>sap-ushell-defaultedParameterNames</code></li>
     * <li><code>"hcpApplicationId"</code></li>
     * </ul>.
     *
     * @public
     * @function getTechnicalParameters
     * @memberof sap.fe.navigation.NavigationHandler.prototype
     * @returns {Array} Containing the technical parameters.
     */;
    _proto.getTechnicalParameters = function getTechnicalParameters() {
      return this._aTechnicalParamaters.concat([]);
    }

    /**
     * Checks if the passed parameter is considered as technical parameter.
     *
     * @param sParameterName Name of a request parameter, considered as technical parameter.
     * @returns Indicates if the parameter is considered as technical parameter or not.
     * @private
     */;
    _proto._isTechnicalParameter = function _isTechnicalParameter(sParameterName) {
      if (sParameterName) {
        if (!(sParameterName === "sap-ui-fe-variant-id" || sParameterName === "sap-ui-fe-table-variant-id" || sParameterName === "sap-ui-fe-chart-variant-id" || sParameterName === "sap-ui-fe-filterbar-variant-id")) {
          if (sParameterName.toLowerCase().indexOf("sap-") === 0) {
            return true;
          } else if (this._aTechnicalParamaters.indexOf(sParameterName) >= 0) {
            return true;
          }
        }
      }
      return false;
    };
    _proto._isFEParameter = function _isFEParameter(sParameterName) {
      return sParameterName.toLowerCase().indexOf("sap-ui-fe") === 0;
    }

    /**
     * Rmoves if the passed parameter is considered as technical parameter.
     *
     * @param oSelectionVariant Selection Variant which consists of technical Parameters.
     * @returns Selection Variant without technical Parameters.
     * @private
     */;
    _proto._removeTechnicalParameters = function _removeTechnicalParameters(oSelectionVariant) {
      let sPropName, i;
      const aSelVarPropNames = oSelectionVariant.getSelectOptionsPropertyNames();
      for (i = 0; i < aSelVarPropNames.length; i++) {
        sPropName = aSelVarPropNames[i];
        if (this._isTechnicalParameter(sPropName)) {
          oSelectionVariant.removeSelectOption(sPropName);
        }
      }
      return oSelectionVariant;
    }

    /**
     * Splits the parameters provided during inbound navigation and separates the contextual information between defaulted parameter values and
     * navigation parameters.
     *
     * @param oSelectionVariant Instance of {@link sap.fe.navigation.SelectionVariant} containing navigation data of
     *        the app
     * @param oStartupParameters Object containing startup parameters of the app (derived from the component)
     * @param aDefaultedParameters Array containing defaulted parameter names
     * @returns Object containing two SelectionVariants, one for navigation (oNavigationSelVar) and one for defaulted startup parameters
     *          (oDefaultedSelVar), and a flag (bNavSelVarHasDefaultsOnly) indicating whether all parameters were defaulted. The function is
     *          handed two objects containing parameters (names and their corresponding values), oSelectionVariant and oStartupParameters. A
     *          parameter could be stored in just one of these two objects or in both of them simultaneously. Because of the latter case a
     *          parameter could be associated with conflicting values and it is the job of this function to resolve any such conflict. Parameters
     *          are assigned to the two returned SelectionVariants, oNavigationSelVar and oDefaultedSelVar, as follows: | parameter NOT in |
     *          parameter in | oSelectionVariant | oSelectionVariant ---------------------------------------|------------------ parameter NOT in |
     *          nothing to do | Add parameter oStartupParameters | here | (see below) ----------------------------------------------------------
     *          parameter in | Add parameter | Conflict resolution oStartupParameters | (see below) | (see below) Add parameter: if parameter in
     *          aDefaultedParameters: add parameter to oDefaultedSelVar else: add parameter to oNavigationSelVar Conflict resolution: if parameter
     *          in aDefaultedParameters: add parameter value from oSelectionVariant to oNavigationSelVar add parameter value from
     *          oStartupParameters to oDefaultedSelVar Note: This case only occurs in UI5 1.32. In later versions UShell stores any defaulted
     *          parameter either in oSelectionVariant or oStartupParameters but never simultaneously in both. else: Choose 1 of the following
     *          options based on given handling mode (this.sParamHandlingMode). -> add parameter value from oStartupParameters to
     *          oNavigationSelVar | -> add parameter value from oAppState.selectionVariant to oNavigationSelVar -> add both parameter values to
     *          navigationSelVar If navigationSelVar is still empty at the end of execution, navigationSelVar is replaced by a copy of
     *          oDefaultedSelVar and the flag bNavSelVarHasDefaultsOnly is set to true. The selection variant oDefaultedSelVar itself is always
     *          returned as is.
     * @private
     */;
    _proto._splitInboundNavigationParameters = function _splitInboundNavigationParameters(oSelectionVariant, oStartupParameters, aDefaultedParameters) {
      if (!Array.isArray(aDefaultedParameters)) {
        throw new NavError("NavigationHandler.INVALID_INPUT");
      }
      let sPropName, i;
      // First we do some parsing of the StartUp Parameters.
      const oStartupParametersAdjusted = {};
      for (sPropName in oStartupParameters) {
        if (!oStartupParameters.hasOwnProperty(sPropName)) {
          continue;
        }

        // if (sPropName === SAP_SYSTEM_PROPERTY || sPropName === DEFAULTED_PARAMETER_PROPERTY) {
        if (this._isTechnicalParameter(sPropName) || this._isFEParameter(sPropName)) {
          // Do not add the SAP system parameter to the selection variant as it is a technical parameter
          // not relevant for the selection variant.
          // Do not add the startup parameter for default values to the selection variant. The information, which parameters
          // are defaulted, is available in the defaulted selection variant.
          // In case, FE Parameters we shall skip it.(the application needs to fetch it from URL params)
          continue;
        }

        // We support parameters as a map with strings and as a map with value arrays
        if (typeof oStartupParameters[sPropName] === "string") {
          oStartupParametersAdjusted[sPropName] = oStartupParameters[sPropName];
        } else if (Array.isArray(oStartupParameters[sPropName]) && oStartupParameters[sPropName].length === 1) {
          oStartupParametersAdjusted[sPropName] = oStartupParameters[sPropName][0]; // single-valued parameters
        } else if (Array.isArray(oStartupParameters[sPropName]) && oStartupParameters[sPropName].length > 1) {
          oStartupParametersAdjusted[sPropName] = oStartupParameters[sPropName]; // multi-valued parameters
        } else {
          throw new NavError("NavigationHandler.INVALID_INPUT");
        }
      }

      // Construct two selection variants for defaults and navigation to be returned by the function.
      const oDefaultedSelVar = new SelectionVariant();
      const oNavigationSelVar = new SelectionVariant();
      const aSelVarPropNames = oSelectionVariant.getParameterNames().concat(oSelectionVariant.getSelectOptionsPropertyNames());
      for (i = 0; i < aSelVarPropNames.length; i++) {
        sPropName = aSelVarPropNames[i];
        if (sPropName in oStartupParametersAdjusted) {
          // Resolve conflict.
          if (aDefaultedParameters.indexOf(sPropName) > -1) {
            oNavigationSelVar.massAddSelectOption(sPropName, oSelectionVariant.getValue(sPropName));
            this._addParameterValues(oDefaultedSelVar, sPropName, "I", "EQ", oStartupParametersAdjusted[sPropName]);
          } else {
            switch (this.sParamHandlingMode) {
              case ParamHandlingMode.SelVarWins:
                oNavigationSelVar.massAddSelectOption(sPropName, oSelectionVariant.getValue(sPropName));
                break;
              case ParamHandlingMode.URLParamWins:
                this._addParameterValues(oNavigationSelVar, sPropName, "I", "EQ", oStartupParametersAdjusted[sPropName]);
                break;
              case ParamHandlingMode.InsertInSelOpt:
                oNavigationSelVar.massAddSelectOption(sPropName, oSelectionVariant.getValue(sPropName));
                this._addParameterValues(oNavigationSelVar, sPropName, "I", "EQ", oStartupParametersAdjusted[sPropName]);
                break;
              default:
                throw new NavError("NavigationHandler.INVALID_INPUT");
            }
          }
        } else if (aDefaultedParameters.indexOf(sPropName) > -1) {
          // parameter only in SelVar
          oDefaultedSelVar.massAddSelectOption(sPropName, oSelectionVariant.getValue(sPropName));
        } else {
          oNavigationSelVar.massAddSelectOption(sPropName, oSelectionVariant.getValue(sPropName));
        }
      }
      for (sPropName in oStartupParametersAdjusted) {
        // The case where the parameter appears twice has already been taken care of above so we skip it here.
        if (aSelVarPropNames.indexOf(sPropName) > -1) {
          continue;
        }
        if (aDefaultedParameters.indexOf(sPropName) > -1) {
          this._addParameterValues(oDefaultedSelVar, sPropName, "I", "EQ", oStartupParametersAdjusted[sPropName]);
        } else {
          this._addParameterValues(oNavigationSelVar, sPropName, "I", "EQ", oStartupParametersAdjusted[sPropName]);
        }
      }

      // the selection variant used for navigation should be filled with defaults in case that only defaults exist
      let bNavSelVarHasDefaultsOnly = false;
      if (oNavigationSelVar.isEmpty()) {
        bNavSelVarHasDefaultsOnly = true;
        const aPropNames = oDefaultedSelVar.getSelectOptionsPropertyNames();
        for (i = 0; i < aPropNames.length; i++) {
          oNavigationSelVar.massAddSelectOption(aPropNames[i], oDefaultedSelVar.getValue(aPropNames[i]));
        }
      }
      return {
        oNavigationSelVar: oNavigationSelVar,
        oDefaultedSelVar: oDefaultedSelVar,
        bNavSelVarHasDefaultsOnly: bNavSelVarHasDefaultsOnly
      };
    };
    _proto._addParameterValues = function _addParameterValues(oSelVariant, sPropName, sSign, sOption, oValues) {
      if (Array.isArray(oValues)) {
        for (let i = 0; i < oValues.length; i++) {
          oSelVariant.addSelectOption(sPropName, sSign, sOption, oValues[i]);
        }
      } else {
        oSelVariant.addSelectOption(sPropName, sSign, sOption, oValues);
      }
    }

    /**
     * Changes the URL according to the current sAppStateKey. As an reaction route change event will be triggered.
     *
     * @param sAppStateKey The new app state key.
     * @public
     */;
    _proto.replaceHash = function replaceHash(sAppStateKey) {
      const oHashChanger = this.oRouter.oHashChanger ? this.oRouter.oHashChanger : HashChanger.getInstance();
      const sAppHashOld = oHashChanger.getHash();
      /*
       * use .getHash() here instead of .getAppHash() to also be able dealing with environments where only SAPUI5 is loaded and the UShell is
       * not initialized properly.
       */
      const sAppHashNew = this._replaceInnerAppStateKey(sAppHashOld, sAppStateKey);
      oHashChanger.replaceHash(sAppHashNew);
    }

    /**
     * Changes the URL according to the current app state and stores the app state for later retrieval.
     *
     * @param mInnerAppData Object containing the current state of the app
     * @param bImmediateHashReplace If set to false, the inner app hash will not be replaced until storing is successful; do not
     *        set to false if you cannot react to the resolution of the Promise, for example, when calling the beforeLinkPressed event
     * @param bSkipHashReplace If set to true, the inner app hash will not be replaced in the storeInnerAppStateAsync. Also the bImmediateHashReplace
     * 		  will be ignored.
     * @returns A Promise object to monitor when all the actions of the function have been executed; if the execution is successful, the
     *          app state key is returned; if an error occurs, an object of type {@link sap.fe.navigation.NavError} is
     *          returned
     * @public
     * @example <code>
     * sap.ui.define(["sap/fe/navigation/NavigationHandler"], function (NavigationHandler) {
     * 	var oNavigationHandler = new NavigationHandler(oController);
     * 	var mInnerAppData = {
     * 		selectionVariant : oSmartFilterBar.getDataSuiteFormat(),
     * 		tableVariantId : oSmartTable.getCurrentVariantId(),
     * 		customData : oMyCustomData
     * 	};
     *
     * 	var oStoreInnerAppStatePromise = oNavigationHandler.storeInnerAppStateAsync(mInnerAppData);
     *
     * 	oStoreInnerAppStatePromise.done(function(sAppStateKey){
     * 		//your inner app state is saved now, sAppStateKey was added to URL
     * 		//perform actions that must run after save
     * 	});
     *
     * 	oStoreInnerAppStatePromise.fail(function(oError){
     * 		//some error handling
     * 	});
     * });
     * </code>
     */;
    _proto.storeInnerAppStateAsync = function storeInnerAppStateAsync(mInnerAppData, bImmediateHashReplace, bSkipHashReplace) {
      if (typeof bImmediateHashReplace !== "boolean") {
        bImmediateHashReplace = true; // default
      }

      const oNavHandler = this;
      const oMyDeferred = jQuery.Deferred();
      const fnReplaceHash = function (sAppStateKey) {
        const oHashChanger = oNavHandler.oRouter.oHashChanger ? oNavHandler.oRouter.oHashChanger : HashChanger.getInstance();
        const sAppHashOld = oHashChanger.getHash();
        /*
         * use .getHash() here instead of .getAppHash() to also be able dealing with environments where only SAPUI5 is loaded and the UShell
         * is not initialized properly.
         */
        const sAppHashNew = oNavHandler._replaceInnerAppStateKey(sAppHashOld, sAppStateKey);
        oHashChanger.replaceHash(sAppHashNew);
      };

      // in case mInnerAppState is empty, do not overwrite the last saved state
      if (isEmptyObject(mInnerAppData)) {
        oMyDeferred.resolve("");
        return oMyDeferred.promise();
      }

      // check if we already saved the same data
      const sAppStateKeyCached = this._oLastSavedInnerAppData.sAppStateKey;
      const bInnerAppDataEqual = JSON.stringify(mInnerAppData) === JSON.stringify(this._oLastSavedInnerAppData.oAppData);
      if (bInnerAppDataEqual && sAppStateKeyCached) {
        // passed inner app state found in cache
        this._oLastSavedInnerAppData.iCacheHit++;

        // replace inner app hash with cached appStateKey in url (just in case the app has changed the hash in meantime)
        fnReplaceHash(sAppStateKeyCached);
        oMyDeferred.resolve(sAppStateKeyCached);
        return oMyDeferred.promise();
      }

      // passed inner app state not found in cache
      this._oLastSavedInnerAppData.iCacheMiss++;
      const fnOnAfterSave = function (sAppStateKey) {
        // replace inner app hash with new appStateKey in url
        if (!bSkipHashReplace && !bImmediateHashReplace) {
          fnReplaceHash(sAppStateKey);
        }

        // remember last saved state
        oNavHandler._oLastSavedInnerAppData.oAppData = mInnerAppData;
        oNavHandler._oLastSavedInnerAppData.sAppStateKey = sAppStateKey;
        oMyDeferred.resolve(sAppStateKey);
      };
      const fnOnError = function (oError) {
        oMyDeferred.reject(oError);
      };
      this._saveAppStateAsync(mInnerAppData, fnOnAfterSave, fnOnError).then(function (sAppStateKey) {
        /* Note that _sapAppState may return 'undefined' in case that the parsing has failed. In this case, we should not trigger the replacement
         * of the App Hash with the generated key, as the container was not written before. Note as well that the error handling has already
         * happened before by making the oMyDeferred promise fail (see fnOnError above).
         */
        if (sAppStateKey !== undefined) {
          // replace inner app hash with new appStateKey in url
          // note: we do not wait for the save to be completed: this asynchronously behaviour is necessary if
          // this method is called e.g. in a onLinkPressed event with no possibility to wait for the promise resolution
          if (!bSkipHashReplace && bImmediateHashReplace) {
            fnReplaceHash(sAppStateKey);
          }
        }
      }).catch(function () {
        Log.error("NavigationHandler._saveAppStateAsync failed");
      });
      return oMyDeferred.promise();
    }

    /**
     * Changes the URL according to the current app state and stores the app state for later retrieval.
     *
     * @param mInnerAppData Object containing the current state of the app
     * @param bImmediateHashReplace If set to false, the inner app hash will not be replaced until storing is successful; do not
     *        set to false if you cannot react to the resolution of the Promise, for example, when calling the beforeLinkPressed event
     * @returns A Promise object to monitor when all the actions of the function have been executed; if the execution is successful, the
     *          app state key is returned; if an error occurs, an object of type {@link sap.fe.navigation.NavError} is
     *          returned
     * @public
     * @example <code>
     * sap.ui.define(["sap/fe/navigation/NavigationHandler"], function (NavigationHandler) {
     * 	var oNavigationHandler = new NavigationHandler(oController);
     * 	var mInnerAppData = {
     * 		selectionVariant : oSmartFilterBar.getDataSuiteFormat(),
     * 		tableVariantId : oSmartTable.getCurrentVariantId(),
     * 		customData : oMyCustomData
     * 	};
     *
     * 	var oStoreInnerAppStatePromise = oNavigationHandler.storeInnerAppState(mInnerAppData);
     *
     * 	oStoreInnerAppStatePromise.done(function(sAppStateKey){
     * 		//your inner app state is saved now, sAppStateKey was added to URL
     * 		//perform actions that must run after save
     * 	});
     *
     * 	oStoreInnerAppStatePromise.fail(function(oError){
     * 		//some error handling
     * 	});
     * });
     * </code>
     * @deprecated as of version 1.104. Use the {@link sap.fe.navigation.NavigationHandler.storeInnerAppStateAsync} instead.
     */;
    _proto.storeInnerAppState = function storeInnerAppState(mInnerAppData, bImmediateHashReplace) {
      Log.error("Deprecated API call of 'sap.fe.navigation.NavigationHandler.storeInnerAppState'. Please use 'storeInnerAppStateAsync' instead", undefined, "sap.fe.navigation.NavigationHandler");
      if (typeof bImmediateHashReplace !== "boolean") {
        bImmediateHashReplace = true; // default
      }

      const oNavHandler = this;
      const oMyDeferred = jQuery.Deferred();
      const fnReplaceHash = function (sAppStateKey) {
        const oHashChanger = oNavHandler.oRouter.oHashChanger ? oNavHandler.oRouter.oHashChanger : HashChanger.getInstance();
        const sAppHashOld = oHashChanger.getHash();
        /*
         * use .getHash() here instead of .getAppHash() to also be able dealing with environments where only SAPUI5 is loaded and the UShell
         * is not initialized properly.
         */
        const sAppHashNew = oNavHandler._replaceInnerAppStateKey(sAppHashOld, sAppStateKey);
        oHashChanger.replaceHash(sAppHashNew);
      };

      // in case mInnerAppState is empty, do not overwrite the last saved state
      if (isEmptyObject(mInnerAppData)) {
        oMyDeferred.resolve("");
        return oMyDeferred.promise();
      }

      // check if we already saved the same data
      const sAppStateKeyCached = this._oLastSavedInnerAppData.sAppStateKey;
      const bInnerAppDataEqual = JSON.stringify(mInnerAppData) === JSON.stringify(this._oLastSavedInnerAppData.oAppData);
      if (bInnerAppDataEqual && sAppStateKeyCached) {
        // passed inner app state found in cache
        this._oLastSavedInnerAppData.iCacheHit++;

        // replace inner app hash with cached appStateKey in url (just in case the app has changed the hash in meantime)
        fnReplaceHash(sAppStateKeyCached);
        oMyDeferred.resolve(sAppStateKeyCached);
        return oMyDeferred.promise();
      }

      // passed inner app state not found in cache
      this._oLastSavedInnerAppData.iCacheMiss++;
      const fnOnAfterSave = function (sAppStateKey) {
        // replace inner app hash with new appStateKey in url
        if (!bImmediateHashReplace) {
          fnReplaceHash(sAppStateKey);
        }

        // remember last saved state
        oNavHandler._oLastSavedInnerAppData.oAppData = mInnerAppData;
        oNavHandler._oLastSavedInnerAppData.sAppStateKey = sAppStateKey;
        oMyDeferred.resolve(sAppStateKey);
      };
      const fnOnError = function (oError) {
        oMyDeferred.reject(oError);
      };
      const sAppStateKey = this._saveAppState(mInnerAppData, fnOnAfterSave, fnOnError);
      /*
       * Note that _sapAppState may return 'undefined' in case that the parsing has failed. In this case, we should not trigger the replacement
       * of the App Hash with the generated key, as the container was not written before. Note as well that the error handling has already
       * happened before by making the oMyDeferred promise fail (see fnOnError above).
       */
      if (sAppStateKey !== undefined) {
        // replace inner app hash with new appStateKey in url
        // note: we do not wait for the save to be completed: this asynchronously behaviour is necessary if
        // this method is called e.g. in a onLinkPressed event with no possibility to wait for the promise resolution
        if (bImmediateHashReplace) {
          fnReplaceHash(sAppStateKey);
        }
      }
      return oMyDeferred.promise();
    }

    /**
     * Changes the URL according to the current app state and stores the app state for later retrieval.
     *
     * @param mInnerAppData Object containing the current state of the app
     * @param bImmediateHashReplace If set to false, the inner app hash will not be replaced until storing is successful; do not
     *        set to false if you cannot react to the resolution of the Promise, for example, when calling the beforeLinkPressed event. <b>Note:</b>If
     *        not provided it will be treated as set to false. <b>Note:</b>If set to true, the calling instance has to ensure that a follow-on
     *        call to <code>replaceHash</code> will take place!
     * @returns An object containing the appStateId and a promise object to monitor when all the actions of the function have been
     *          executed; Please note that the appStateKey may be undefined or empty.
     * @example <code>
     * sap.ui.define(["sap/fe/navigation/NavigationHandler"], function (NavigationHandler) {
     * 	var oNavigationHandler = new NavigationHandler(oController);
     * 	var mInnerAppData = {
     * 		selectionVariant : oSmartFilterBar.getDataSuiteFormat(),
     * 		tableVariantId : oSmartTable.getCurrentVariantId(),
     * 		customData : oMyCustomData
     * 	};
     *
     * 	var oStoreInnerAppState = storeInnerAppStateWithNonDelayedReturn(mInnerAppData);
     * 	var sAppStateKey = oStoreInnerAppState.appStateKey;
     * 	if (!sAppStateKey) {
     *    // no appStateKey obtained...
     * 	};
     * 	var oStoreInnerAppStatePromise = oStoreInnerAppState.promise;
     *
     * 	oStoreInnerAppStatePromise.done(function(sAppStateKey){
     * 		//your inner app state is saved now, sAppStateKey was added to URL
     * 		//perform actions that must run after save
     * 	});
     *
     * 	oStoreInnerAppStatePromise.fail(function(oError){
     * 		//some error handling
     * 	});
     * });
     * </code>
     * @public
     * @deprecated as of version 1.104. Use the {@link sap.fe.navigation.NavigationHandler.storeInnerAppStateAsync} instead.
     */;
    _proto.storeInnerAppStateWithImmediateReturn = function storeInnerAppStateWithImmediateReturn(mInnerAppData, bImmediateHashReplace) {
      Log.error("Deprecated API call of 'sap.fe.navigation.NavigationHandler.storeInnerAppStateWithImmediateReturn'. Please use 'storeInnerAppStateAsync' instead", undefined, "sap.fe.navigation.NavigationHandler");
      if (typeof bImmediateHashReplace !== "boolean") {
        bImmediateHashReplace = false; // default
      }

      const oNavHandler = this;
      const oAppStatePromise = jQuery.Deferred();

      // in case mInnerAppState is empty, do not overwrite the last saved state
      if (isEmptyObject(mInnerAppData)) {
        return {
          appStateKey: "",
          promise: oAppStatePromise.resolve("")
        };
      }

      // check if we already saved the same data
      const sAppStateKeyCached = this._oLastSavedInnerAppData.sAppStateKey;
      const bInnerAppDataEqual = JSON.stringify(mInnerAppData) === JSON.stringify(this._oLastSavedInnerAppData.oAppData);
      if (bInnerAppDataEqual && sAppStateKeyCached) {
        // passed inner app state found in cache
        this._oLastSavedInnerAppData.iCacheHit++;
        return {
          appStateKey: sAppStateKeyCached,
          promise: oAppStatePromise.resolve(sAppStateKeyCached)
        };
      }

      // passed inner app state not found in cache
      this._oLastSavedInnerAppData.iCacheMiss++;
      const fnOnAfterSave = function (sAppStateKey) {
        // replace inner app hash with new appStateKey in url
        if (!bImmediateHashReplace) {
          oNavHandler.replaceHash(sAppStateKey);
        }

        // remember last saved state
        oNavHandler._oLastSavedInnerAppData.oAppData = mInnerAppData;
        oNavHandler._oLastSavedInnerAppData.sAppStateKey = sAppStateKey;
        oAppStatePromise.resolve(sAppStateKey);
      };
      const fnOnError = function (oError) {
        oAppStatePromise.reject(oError);
      };
      const sAppStateKey = this._saveAppState(mInnerAppData, fnOnAfterSave, fnOnError);
      /*
       * Note that _sapAppState may return 'undefined' in case that the parsing has failed. In this case, we should not trigger the replacement
       * of the App Hash with the generated key, as the container was not written before. Note as well that the error handling has already
       * happened before by making the oMyDeferred promise fail (see fnOnError above).
       */
      // if (sAppStateKey !== undefined) {
      // //replace inner app hash with new appStateKey in url
      // //note: we do not wait for the save to be completed: this asynchronously behaviour is necessary if
      // //this method is called e.g. in a onLinkPressed event with no possibility to wait for the promise resolution
      // if (bImmediateHashReplace) {
      // fnReplaceHash(sAppStateKey);
      // }
      // }
      return {
        appStateKey: sAppStateKey,
        promise: oAppStatePromise.promise()
      };
    }

    /**
     * Processes navigation-related tasks related to beforePopoverOpens event handling for the SmartLink control and returns a Promise object. In
     * particular, the following tasks are performed before the SmartLink popover can be opened:
     * <ul>
     * <li>If <code>mInnerAppData</code> is provided, this inner app state is saved for back navigation at a later time.</li>
     * <li>The table event parameters (semantic attributes) and the selection variant data are combined by calling the method
     * {@link #.mixAttributesAndSelectionVariant mixAttributesAndSelectionVariant}.</li>
     * <li>The combined data is saved as the cross app state to be handed over to the target app, and the corresponding sap-xapp-state key is set
     * in the URL.</li>
     * <li>All single selections ("including equal") of the combined selection data are passed to the SmartLink popover as semantic attributes.</li>
     * <li>The method <code>oTableEventParameters.open()</code> is called. Note that this does not really open the popover, but the SmartLink
     * control proceeds with firing the event <code>navigationTargetsObtained</code>.</li>
     * </ul>.
     * <br>
     * <b>Node:</b> If the <code>oExternalAppData</code> parameter is not supplied, the external app data will be calculated based on
     * the <code>mInnerAppData</code> data.<br>.
     *
     * @param oTableEventParameters The parameters made available by the SmartTable control when the SmartLink control has been clicked,
     *        an instance of a PopOver object
     * @param sSelectionVariant Stringified JSON object as returned, for example, from getDataSuiteFormat() of the SmartFilterBar control
     * @param mInnerAppData Object containing the current state of the app. If provided, opening the Popover is deferred until the
     *        inner app data is saved in a consistent way.
     * @param oExternalAppData Object containing the state which will be passed to the target screen.
     * @param oExternalAppData.selectionVariant Object containing selectionVariant, which will be passed to the target screen. If not
     *        set the sSelectionVariant will be used.
     * @param oExternalAppData.presentationVariant Object containing the current ui presentationVariant of the app, which will be
     *        passed to the target screen
     * @param oExternalAppData.valueTexts Object containing value descriptions, which will be passed to the target screen
     * @returns A Promise object to monitor when all actions of the function have been executed; if the execution is successful, the
     *          modified oTableEventParameters is returned; if an error occurs, an error object of type
     *          {@link sap.fe.navigation.NavError} is returned
     * @public
     * @example <code>
     * sap.ui.define(["sap/fe/navigation/NavigationHandler", "sap/fe/navigation/SelectionVariant"], function (NavigationHandler, SelectionVariant) {
     * 	//event handler for the smart link event "beforePopoverOpens"
     * 		onBeforePopoverOpens: function(oEvent) {
     * 			var oTableEventParameters = oEvent.getParameters();
     *
     * 			var mInnerAppData = {
     * 				selectionVariant : oSmartFilterBar.getDataSuiteFormat(),
     * 				tableVariantId : oSmartTable.getCurrentVariantId(),
     * 				customData : oMyCustomData
     * 			};
     *
     * 			var oSelectionVariant = new SelectionVariant();
     * 			oSelectionVariant.addSelectOption("CompanyCode", "I", "EQ", "0001");
     * 			oSelectionVariant.addSelectOption("Customer", "I", "EQ", "C0001");
     * 			var sSelectionVariant= oSelectionVariant.toJSONString();
     *
     * 			var oNavigationHandler = new NavigationHandler(oController);
     * 			var oSmartLinkPromise = oNavigationHandler.processBeforeSmartLinkPopoverOpens(oTableEventParameters, sSelectionVariant, mInnerAppData);
     *
     * 			oSmartLinkPromise.done(function(oTableEventParameters){
     * 				// here you can add coding that should run after all app states are saved and the semantic attributes are set
     * 			});
     *
     * 			oSmartLinkPromise.fail(function(oError){
     * 			//some error handling
     * 			});
     * 		};
     * 	});
     * </code>
     */;
    _proto.processBeforeSmartLinkPopoverOpens = function processBeforeSmartLinkPopoverOpens(oTableEventParameters, sSelectionVariant, mInnerAppData, oExternalAppData) {
      const oMyDeferred = jQuery.Deferred();
      let mSemanticAttributes;
      if (oTableEventParameters != undefined) {
        mSemanticAttributes = oTableEventParameters.semanticAttributes;
      }
      let oXAppDataObj;
      const oNavHandler = this;
      if (oExternalAppData === undefined) {
        oXAppDataObj = {};
      } else {
        oXAppDataObj = oExternalAppData;
      }
      const fnStoreXappAndCallOpen = function (mSubSemanticAttributes, sSubSelectionVariant) {
        // mix the semantic attributes (e.g. from the row line) with the selection variant (e.g. from the filter bar)
        sSubSelectionVariant = oXAppDataObj.selectionVariant || sSubSelectionVariant || "{}";
        const iSuppressionBehavior = SuppressionBehavior.raiseErrorOnNull | SuppressionBehavior.raiseErrorOnUndefined;
        /*
         * compatiblity: Until SAPUI5 1.28.5 (or even later) the Smart Link in a Smart Table is filtering all null- and undefined values.
         * Therefore, mSemanticAttributes are already reduced appropriately -- this does not need to be done by
         * mixAttributesAndSelectionVariant again. To ensure that we still have the old behaviour (i.e. an NavError is raised in case that
         * behaviour of the Smart Link control has changed), the "old" Suppression Behaviour is retained.
         */

        const oMixedSelVar = oNavHandler.mixAttributesAndSelectionVariant(mSubSemanticAttributes, sSubSelectionVariant, iSuppressionBehavior);
        sSubSelectionVariant = oMixedSelVar.toJSONString();

        // enrich the semantic attributes with single selections from the selection variant
        let oTmpData = {};
        oTmpData.selectionVariant = oMixedSelVar.toJSONObject();
        oTmpData = oNavHandler._removeMeasureBasedInformation(oTmpData);
        oTmpData = oNavHandler._checkIsPotentiallySensitive(oTmpData);
        mSubSemanticAttributes = oTmpData.selectionVariant ? oNavHandler._getURLParametersFromSelectionVariant(new SelectionVariant(oTmpData.selectionVariant)) : {};
        const fnOnContainerSave = function (sAppStateKey) {
          if (oTableEventParameters === undefined) {
            // If oTableEventParameters is undefined, return both semanticAttributes and appStatekey
            oMyDeferred.resolve(mSubSemanticAttributes, sAppStateKey);
          } else {
            // set the stored data in popover and call open()
            oTableEventParameters.setSemanticAttributes(mSubSemanticAttributes);
            oTableEventParameters.setAppStateKey(sAppStateKey);
            oTableEventParameters.open(); // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Note that "open" does not open the popover, but proceeds
            // with firing the onNavTargetsObtained event.
            oMyDeferred.resolve(oTableEventParameters);
          }
        };
        const fnOnError = function (oError) {
          oMyDeferred.reject(oError);
        };
        oXAppDataObj.selectionVariant = sSubSelectionVariant;
        oXAppDataObj = oNavHandler._removeMeasureBasedInformation(oXAppDataObj);
        oNavHandler._saveAppStateAsync(oXAppDataObj, fnOnContainerSave, fnOnError);
      };
      if (mInnerAppData) {
        const oStoreInnerAppStatePromise = this.storeInnerAppStateAsync(mInnerAppData, true);

        // if the inner app state was successfully stored, store also the xapp-state
        oStoreInnerAppStatePromise.done(function () {
          fnStoreXappAndCallOpen(mSemanticAttributes, sSelectionVariant);
        });
        oStoreInnerAppStatePromise.fail(function (oError) {
          oMyDeferred.reject(oError);
        });
      } else {
        // there is no inner app state to save, just put the parameters into xapp-state
        fnStoreXappAndCallOpen(mSemanticAttributes, sSelectionVariant);
      }
      return oMyDeferred.promise();
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
     * sap.ui.define(["sap/fe/navigation/NavigationHandler", "sap/fe/navigation/SelectionVariant"], function (NavigationHandler, SelectionVariant) {
     * 		var oSelectionVariant = new SelectionVariant();
     * 		oSelectionVariant.addSelectOption("CompanyCode", "I", "EQ", "0001");
     * 		oSelectionVariant.addSelectOption("Customer", "I", "EQ", "C0001");
     * 		var sSelectionVariant= oSelectionVariant.toJSONString();
     *
     * 		var oNavigationHandler = new NavigationHandler(oController);
     * 		var oPromiseObject = oNavigationHandler._getAppStateKeyAndUrlParameters(sSelectionVariant);
     *
     * 		oPromiseObject.done(function(oSemanticAttributes, sAppStateKey){
     * 			// here you can add coding that should run after all app state and the semantic attributes have been returned.
     * 		});
     *
     * 		oPromiseObject.fail(function(oError){
     * 			//some error handling
     * 		});
     *	});
     * </code>
     * @private
     * @ui5-restricted
     */;
    _proto._getAppStateKeyAndUrlParameters = function _getAppStateKeyAndUrlParameters(sSelectionVariant) {
      return this.processBeforeSmartLinkPopoverOpens(undefined, sSelectionVariant, undefined, undefined);
    };
    _proto._mixAttributesToSelVariant = function _mixAttributesToSelVariant(mSemanticAttributes, oSelVariant, iSuppressionBehavior) {
      // add all semantic attributes to the mixed selection variant
      for (const sPropertyName in mSemanticAttributes) {
        if (mSemanticAttributes.hasOwnProperty(sPropertyName)) {
          // A value of a semantic attribute may not be a string, but can be e.g. a date.
          // Since the selection variant accepts only a string, we have to convert it in dependence of the type.
          let vSemanticAttributeValue = mSemanticAttributes[sPropertyName];
          if (vSemanticAttributeValue instanceof Date) {
            // use the same conversion method for dates as the SmartFilterBar: toJSON()
            vSemanticAttributeValue = vSemanticAttributeValue.toJSON();
          } else if (Array.isArray(vSemanticAttributeValue) || vSemanticAttributeValue && typeof vSemanticAttributeValue === "object") {
            vSemanticAttributeValue = JSON.stringify(vSemanticAttributeValue);
          } else if (typeof vSemanticAttributeValue === "number" || typeof vSemanticAttributeValue === "boolean") {
            vSemanticAttributeValue = vSemanticAttributeValue.toString();
          }
          if (vSemanticAttributeValue === "") {
            if (iSuppressionBehavior & SuppressionBehavior.ignoreEmptyString) {
              Log.info("Semantic attribute " + sPropertyName + " is an empty string and due to the chosen Suppression Behiavour is being ignored.");
              continue;
            }
          }
          if (vSemanticAttributeValue === null) {
            if (iSuppressionBehavior & SuppressionBehavior.raiseErrorOnNull) {
              throw new NavError("NavigationHandler.INVALID_INPUT");
            } else {
              Log.warning("Semantic attribute " + sPropertyName + " is null and ignored for mix in to selection variant");
              continue; // ignore!
            }
          }

          if (vSemanticAttributeValue === undefined) {
            if (iSuppressionBehavior & SuppressionBehavior.raiseErrorOnUndefined) {
              throw new NavError("NavigationHandler.INVALID_INPUT");
            } else {
              Log.warning("Semantic attribute " + sPropertyName + " is undefined and ignored for mix in to selection variant");
              continue;
            }
          }
          if (typeof vSemanticAttributeValue === "string" || vSemanticAttributeValue instanceof String) {
            oSelVariant.addSelectOption(sPropertyName, "I", "EQ", vSemanticAttributeValue);
          } else {
            throw new NavError("NavigationHandler.INVALID_INPUT");
          }
        }
      }
      return oSelVariant;
    }

    /**
     * Combines the given parameters and selection variant into a new selection variant containing properties from both, with the parameters
     * overriding existing properties in the selection variant. The new selection variant does not contain any parameters. All parameters are
     * merged into select options. The output of this function, converted to a JSON string, can be used for the
     * {@link #.navigate NavigationHandler.navigate} method.
     *
     * @param vSemanticAttributes Object/(Array of Objects) containing key/value pairs
     * @param sSelectionVariant The selection variant in string format as provided by the SmartFilterBar control
     * @param [iSuppressionBehavior=sap.fe.navigation.SuppressionBehavior.standard] Indicates whether semantic
     *        attributes with special values (see {@link sap.fe.navigation.SuppressionBehavior suppression behavior}) must be
     *        suppressed before they are combined with the selection variant; several
     *        {@link sap.fe.navigation.SuppressionBehavior suppression behaviors} can be combined with the bitwise OR operator
     *        (|)
     * @returns Instance of {@link sap.fe.navigation.SelectionVariant}
     * @public
     * @example <code>
     * sap.ui.define(["sap/fe/navigation/NavigationHandler", "sap/fe/navigation/SelectionVariant"], function (NavigationHandler, SelectionVariant) {
     * 	var vSemanticAttributes = { "Customer" : "C0001" };
     * 	or
     * 	var vSemanticAttributes = [{ "Customer" : "C0001" },{ "Customer" : "C0002" }];
     * 	var sSelectionVariant = oSmartFilterBar.getDataSuiteFormat();
     * 	var oNavigationHandler = new NavigationHandler(oController);
     * 	var sNavigationSelectionVariant = oNavigationHandler.mixAttributesAndSelectionVariant(vSemanticAttributes, sSelectionVariant).toJSONString();
     * 	// In case of an vSemanticAttributes being an array, the semanticAttributes are merged to a single SV and compared against the sSelectionVariant(second agrument).
     * 	// Optionally, you can specify one or several suppression behaviors. Several suppression behaviors are combined with the bitwise OR operator, e.g.
     * 	// var iSuppressionBehavior = sap.fe.navigation.SuppressionBehavior.raiseErrorOnNull | sap.fe.navigation.SuppressionBehavior.raiseErrorOnUndefined;
     * 	// var sNavigationSelectionVariant = oNavigationHandler.mixAttributesAndSelectionVariant(mSemanticAttributes, sSelectionVariant, iSuppressionBehavior).toJSONString();
     *
     * 	oNavigationHandler.navigate("SalesOrder", "create", sNavigationSelectionVariant);
     * });
     * </code>
     */;
    _proto.mixAttributesAndSelectionVariant = function mixAttributesAndSelectionVariant(vSemanticAttributes, sSelectionVariant, iSuppressionBehavior) {
      const oSelectionVariant = new SelectionVariant(sSelectionVariant);
      const oNewSelVariant = new SelectionVariant();
      const oNavHandler = this;
      const filterUrl = oSelectionVariant.getFilterContextUrl();
      if (filterUrl) {
        oNewSelVariant.setFilterContextUrl(filterUrl);
      }
      const contextUrl = oSelectionVariant.getParameterContextUrl();
      if (contextUrl) {
        oNewSelVariant.setParameterContextUrl(contextUrl);
      }
      if (Array.isArray(vSemanticAttributes)) {
        vSemanticAttributes.forEach(function (mSemanticAttributes) {
          oNavHandler._mixAttributesToSelVariant(mSemanticAttributes, oNewSelVariant, iSuppressionBehavior);
        });
      } else {
        this._mixAttributesToSelVariant(vSemanticAttributes, oNewSelVariant, iSuppressionBehavior);
      }

      // add parameters that are not part of the oNewSelVariant yet
      const aParameters = oSelectionVariant.getParameterNames();
      let i;
      for (i = 0; i < aParameters.length; i++) {
        if (!oNewSelVariant.getSelectOption(aParameters[i])) {
          oNewSelVariant.addSelectOption(aParameters[i], "I", "EQ", oSelectionVariant.getParameter(aParameters[i]));
        }
      }

      // add selOptions that are not part of the oNewSelVariant yet
      const aSelOptionNames = oSelectionVariant.getSelectOptionsPropertyNames();
      for (i = 0; i < aSelOptionNames.length; i++) {
        // add selOptions that are not part of the oNewSelVariant yet
        const aSelectOption = oSelectionVariant.getSelectOption(aSelOptionNames[i]);
        if (!oNewSelVariant.getSelectOption(aSelOptionNames[i])) {
          for (let j = 0; j < aSelectOption.length; j++) {
            oNewSelVariant.addSelectOption(aSelOptionNames[i], aSelectOption[j].Sign, aSelectOption[j].Option, aSelectOption[j].Low, aSelectOption[j].High);
          }
        }
      }
      return oNewSelVariant;
    };
    _proto._ensureSelectionVariantFormatString = function _ensureSelectionVariantFormatString(vSelectionVariant) {
      /*
       * There are legacy AppStates where the SelectionVariant is being stored as a string. However, that is not compliant to the specification,
       * which states that a standard JS object shall be provided. Internally, however, the selectionVariant is always of type string. Situation
       * Persistency internal API ---------------- ------------------ --------------------- legacy string string new approach (JSON) object
       * string
       */

      if (vSelectionVariant === undefined) {
        return undefined;
      }
      let vConvertedSelectionVariant = vSelectionVariant;
      if (typeof vSelectionVariant === "object") {
        vConvertedSelectionVariant = JSON.stringify(vSelectionVariant);
      }
      return vConvertedSelectionVariant;
    };
    _proto._fnHandleAppStatePromise = function _fnHandleAppStatePromise(oReturn, fnOnAfterSave, fnOnError) {
      oReturn.promise.done(function () {
        if (fnOnAfterSave) {
          fnOnAfterSave(oReturn.appStateKey);
        }
      });
      if (fnOnError) {
        const oNavHandler = this;
        oReturn.promise.fail(function () {
          const oError = oNavHandler._createTechnicalError("NavigationHandler.AppStateSave.failed");
          fnOnError(oError);
        });
      }
    };
    _proto._saveAppStateAsync = function _saveAppStateAsync(oAppData, fnOnAfterSave, fnOnError) {
      const oNavHandler = this;
      return this._fnSaveAppStateAsync(oAppData, fnOnError).then(function (oReturn) {
        if (oReturn) {
          oNavHandler._fnHandleAppStatePromise(oReturn, fnOnAfterSave, fnOnError);
          return oReturn.appStateKey;
        }
        return undefined;
      });
    };
    _proto._saveAppState = function _saveAppState(oAppData, fnOnAfterSave, fnOnError) {
      const oReturn = this._saveAppStateWithImmediateReturn(oAppData, fnOnError);
      if (oReturn) {
        this._fnHandleAppStatePromise(oReturn, fnOnAfterSave, fnOnError);
        return oReturn.appStateKey;
      }
      return undefined;
    };
    _proto._fnSaveAppStateWithImmediateReturn = function _fnSaveAppStateWithImmediateReturn(oAppData, oAppState, fnOnError) {
      const sAppStateKey = oAppState.getKey();
      const oAppDataForSave = this._fetchAppDataForSave(oAppData, fnOnError);
      if (!oAppDataForSave) {
        return undefined;
      }
      oAppState.setData(oAppDataForSave);
      const oSavePromise = oAppState.save();
      return {
        appStateKey: sAppStateKey,
        promise: oSavePromise.promise()
      };
    };
    _proto._fetchAppDataForSave = function _fetchAppDataForSave(oAppData, fnOnError) {
      let oAppDataForSave = {};
      if (oAppData.hasOwnProperty("selectionVariant")) {
        oAppDataForSave.selectionVariant = oAppData.selectionVariant;
        if (oAppData.selectionVariant) {
          /*
           * The specification states that Selection Variants need to be JSON objects. However, internally, we work with strings for
           * "selectionVariant". Therefore, in case that this is a string, we need to JSON-parse the data.
           */
          if (typeof oAppData.selectionVariant === "string") {
            try {
              oAppDataForSave.selectionVariant = JSON.parse(oAppData.selectionVariant);
            } catch (x) {
              const oError = this._createTechnicalError("NavigationHandler.AppStateSave.parseError");
              if (fnOnError) {
                fnOnError(oError);
              }
              return undefined;
            }
          }
        }
      }
      if (this._sMode === Mode.ODataV2) {
        oAppDataForSave = extend({
          selectionVariant: {},
          tableVariantId: "",
          customData: {}
        }, oAppDataForSave);
        if (oAppData.tableVariantId) {
          oAppDataForSave.tableVariantId = oAppData.tableVariantId;
        }
        if (oAppData.customData) {
          oAppDataForSave.customData = oAppData.customData;
        }
        if (oAppData.presentationVariant) {
          oAppDataForSave.presentationVariant = oAppData.presentationVariant;
        }
        if (oAppData.valueTexts) {
          oAppDataForSave.valueTexts = oAppData.valueTexts;
        }
        if (oAppData.semanticDates) {
          oAppDataForSave.semanticDates = oAppData.semanticDates;
        }
      } else {
        const oAppDataClone = Object.assign({}, oAppData);
        oAppDataForSave = merge(oAppDataClone, oAppDataForSave);
      }
      oAppDataForSave = this._checkIsPotentiallySensitive(oAppDataForSave);
      return oAppDataForSave;
    };
    _proto._fnSaveAppStateAsync = function _fnSaveAppStateAsync(oAppData, fnOnError) {
      const oNavHandler = this;
      return this._getAppNavigationServiceAsync().then(function (oCrossAppNavService) {
        return oCrossAppNavService.createEmptyAppStateAsync(oNavHandler.oComponent);
      }).then(function (oAppState) {
        return oNavHandler._fnSaveAppStateWithImmediateReturn(oAppData, oAppState, fnOnError);
      }).catch(function (oError) {
        if (fnOnError) {
          fnOnError(oError);
        }
      });
    };
    _proto._saveAppStateWithImmediateReturn = function _saveAppStateWithImmediateReturn(oAppData, fnOnError) {
      const oAppState = this._getAppNavigationService().createEmptyAppState(this.oComponent);
      return this._fnSaveAppStateWithImmediateReturn(oAppData, oAppState, fnOnError);
    };
    _proto._loadAppState = function _loadAppState(sAppStateKey, oDeferred) {
      const oNavHandler = this;
      this._getAppNavigationServiceAsync().then(function (oCrossAppNavService) {
        const oAppStatePromise = oCrossAppNavService.getAppState(oNavHandler.oComponent, sAppStateKey);
        oAppStatePromise.done(function (oAppState) {
          let oAppData = {};
          const oAppDataLoaded = oAppState.getData();
          if (typeof oAppDataLoaded === "undefined") {
            const oError = oNavHandler._createTechnicalError("NavigationHandler.getDataFromAppState.failed");
            oDeferred.reject(oError, {}, NavType.iAppState);
          } else if (oNavHandler._sMode === Mode.ODataV2) {
            oAppData = {
              selectionVariant: "{}",
              oSelectionVariant: new SelectionVariant(),
              oDefaultedSelectionVariant: new SelectionVariant(),
              bNavSelVarHasDefaultsOnly: false,
              tableVariantId: "",
              customData: {},
              appStateKey: sAppStateKey,
              presentationVariant: {},
              valueTexts: {},
              semanticDates: {}
            };
            if (oAppDataLoaded.selectionVariant) {
              /*
               * In case that we get an object from the stored AppData (=persistency), we need to stringify the JSON object.
               */
              oAppData.selectionVariant = oNavHandler._ensureSelectionVariantFormatString(oAppDataLoaded.selectionVariant);
              oAppData.oSelectionVariant = new SelectionVariant(oAppData.selectionVariant);
            }
            if (oAppDataLoaded.tableVariantId) {
              oAppData.tableVariantId = oAppDataLoaded.tableVariantId;
            }
            if (oAppDataLoaded.customData) {
              oAppData.customData = oAppDataLoaded.customData;
            }
            if (oAppDataLoaded.presentationVariant) {
              oAppData.presentationVariant = oAppDataLoaded.presentationVariant;
            }
            if (oAppDataLoaded.valueTexts) {
              oAppData.valueTexts = oAppDataLoaded.valueTexts;
            }
            if (oAppDataLoaded.semanticDates) {
              oAppData.semanticDates = oAppDataLoaded.semanticDates;
            }
          } else {
            oAppData = merge(oAppData, oAppDataLoaded);
            if (oAppDataLoaded.selectionVariant) {
              /*
               * In case that we get an object from the stored AppData (=persistency), we need to stringify the JSON object.
               */
              oAppData.selectionVariant = oNavHandler._ensureSelectionVariantFormatString(oAppDataLoaded.selectionVariant);
              oAppData.oSelectionVariant = new SelectionVariant(oAppData.selectionVariant);
            }
          }

          // resolve is called on passed Deferred object to trigger a call of the done method, if implemented
          // the done method will receive the loaded appState and the navigation type as parameters
          oDeferred.resolve(oAppData, {}, NavType.iAppState);
        });
        oAppStatePromise.fail(function () {
          const oError = oNavHandler._createTechnicalError("NavigationHandler.getAppState.failed");
          oDeferred.reject(oError, {}, NavType.iAppState);
        });
      }).catch(function () {
        const oError = oNavHandler._createTechnicalError("NavigationHandler._getAppNavigationServiceAsync.failed");
        oDeferred.reject(oError, {}, NavType.iAppState);
      });
    }

    /**
     * Retrieves the parameter value of the sap-iapp-state (the internal apps) from the AppHash string. It automatically takes care about
     * compatibility between the old and the new approach of the sap-iapp-state. Precedence is that the new approach is favoured against the old
     * approach.
     *
     * @param sAppHash The AppHash, which may contain a sap-iapp-state parameter (both old and/or new approach)
     * @returns The value of sap-iapp-state (i.e. the name of the container to retrieve the parameters), or <code>undefined</code> in
     *         case that no sap-iapp-state was found in <code>sAppHash</code>.
     * @private
     */;
    _proto._getInnerAppStateKey = function _getInnerAppStateKey(sAppHash) {
      // trivial case: no app hash available at all.
      if (!sAppHash) {
        return undefined;
      }

      /* new approach: separated via question mark / part of the query parameter of the AppHash */
      let aMatches = this._rIAppStateNew.exec(sAppHash);

      /* old approach: spearated via slashes / i.e. part of the route itself */
      if (aMatches === null) {
        aMatches = this._rIAppStateOld.exec(sAppHash);
      }

      /*
       * old approach: special case: if there is no deep route/key defined, the sap-iapp-state may be at the beginning of the string, without
       * any separation with the slashes
       */
      if (aMatches === null) {
        aMatches = this._rIAppStateOldAtStart.exec(sAppHash);
      }
      if (aMatches === null) {
        // there is no (valid) sap-iapp-state in the App Hash
        return undefined;
      }
      return aMatches[1];
    }

    /**
     * Replaces (or inserts) a parameter value (an AppStateKey) for the sap-iapp-state into an existing AppHash string. Other routes/parameters
     * are ignored and returned without modification ("environmental agnostic" property). Only the new approach (sap-iapp-state as query parameter
     * in the AppHash) is being issued.
     *
     * @param sAppHash The AppHash into which the sap-iapp-state parameter shall be made available
     * @param sAppStateKey The key value of the AppState which shall be stored as parameter value of the sap-iapp-state property.
     * @returns The modified sAppHash string, such that the sap-iapp-state has been set based on the new (query option-based)
     *         sap-iapp-state. If a sap-iapp-state has been specified before, the key is replaced. If <code>sAppHash</code> was of the old
     *         format (sap-iapp-state as part of the keys/route), the format is converted to the new format before the result is returned.
     * @private
     */;
    _proto._replaceInnerAppStateKey = function _replaceInnerAppStateKey(sAppHash, sAppStateKey) {
      const sNewIAppState = IAPP_STATE + "=" + sAppStateKey;

      /*
       * generate sap-iapp-states with the new way
       */
      if (!sAppHash) {
        // there's no sAppHash key yet
        return "?" + sNewIAppState;
      }
      const fnAppendToQueryParameter = function (sSubAppHash) {
        // there is an AppHash available, but it does not contain a sap-iapp-state parameter yet - we need to append one

        // new approach: we need to check, if a set of query parameters is already available
        if (sSubAppHash.indexOf("?") !== -1) {
          // there are already query parameters available - append it as another parameter
          return sSubAppHash + "&" + sNewIAppState;
        }
        // there are no a query parameters available yet; create a set with a single parameter
        return sSubAppHash + "?" + sNewIAppState;
      };
      if (!this._getInnerAppStateKey(sAppHash)) {
        return fnAppendToQueryParameter(sAppHash);
      }
      // There is an AppHash available and there is already an sap-iapp-state in the AppHash

      if (this._rIAppStateNew.test(sAppHash)) {
        // the new approach is being used
        return sAppHash.replace(this._rIAppStateNew, function (sNeedle) {
          return sNeedle.replace(/\=.*/gi, "=" + sAppStateKey);
        });
      }

      // we need to remove the old AppHash entirely and replace it with a new one.

      const fnReplaceOldApproach = function (rOldApproach, sSubAppHash) {
        sSubAppHash = sSubAppHash.replace(rOldApproach, "");
        return fnAppendToQueryParameter(sSubAppHash);
      };
      if (this._rIAppStateOld.test(sAppHash)) {
        return fnReplaceOldApproach(this._rIAppStateOld, sAppHash);
      }
      if (this._rIAppStateOldAtStart.test(sAppHash)) {
        return fnReplaceOldApproach(this._rIAppStateOldAtStart, sAppHash);
      }
      assert(false, "internal inconsistency: Approach of sap-iapp-state not known, but _getInnerAppStateKey returned it");
      return undefined;
    };
    _proto._getURLParametersFromSelectionVariant = function _getURLParametersFromSelectionVariant(vSelectionVariant) {
      const mURLParameters = {};
      let i = 0;
      let oSelectionVariant;
      if (typeof vSelectionVariant === "string") {
        oSelectionVariant = new SelectionVariant(vSelectionVariant);
      } else if (typeof vSelectionVariant === "object") {
        oSelectionVariant = vSelectionVariant;
      } else {
        throw new NavError("NavigationHandler.INVALID_INPUT");
      }

      // add URLs parameters from SelectionVariant.SelectOptions (if single value)
      const aSelectProperties = oSelectionVariant.getSelectOptionsPropertyNames();
      for (i = 0; i < aSelectProperties.length; i++) {
        const aSelectOptions = oSelectionVariant.getSelectOption(aSelectProperties[i]);
        if (aSelectOptions.length === 1 && aSelectOptions[0].Sign === "I" && aSelectOptions[0].Option === "EQ") {
          mURLParameters[aSelectProperties[i]] = aSelectOptions[0].Low;
        }
      }

      // add parameters from SelectionVariant.Parameters
      const aParameterNames = oSelectionVariant.getParameterNames();
      for (i = 0; i < aParameterNames.length; i++) {
        const sParameterValue = oSelectionVariant.getParameter(aParameterNames[i]);
        mURLParameters[aParameterNames[i]] = sParameterValue;
      }
      return mURLParameters;
    };
    _proto._createTechnicalError = function _createTechnicalError(sErrorCode) {
      return new NavError(sErrorCode);
    }

    /**
     * Sets the model that is used for verification of sensitive information. If the model is not set, the unnamed component model is used for the
     * verification of sensitive information.
     *
     * @public
     * @param oModel For checking sensitive information
     */;
    _proto.setModel = function setModel(oModel) {
      this._oModel = oModel;
    };
    _proto._getModel = function _getModel() {
      return this._oModel || this.oComponent.getModel();
    };
    _proto._removeAllProperties = function _removeAllProperties(oData) {
      if (oData) {
        if (oData.selectionVariant) {
          oData.selectionVariant = null;
        }
        if (oData.valueTexts) {
          oData.valueTexts = null;
        }
        if (oData.semanticDates) {
          oData.semanticDates = null;
        }
      }
    };
    _proto._removeProperties = function _removeProperties(aFilterName, aParameterName, oData) {
      if (aFilterName.length && oData && (oData.selectionVariant || oData.valueTexts || oData.semanticDates)) {
        aFilterName.forEach(function (sName) {
          if (oData.selectionVariant.SelectOptions) {
            oData.selectionVariant.SelectOptions.some(function (oValue, nIdx) {
              if (sName === oValue.PropertyName) {
                oData.selectionVariant.SelectOptions.splice(nIdx, 1);
                return true;
              }
              return false;
            });
          }
          if (oData.valueTexts && oData.valueTexts.Texts) {
            oData.valueTexts.Texts.forEach(function (oTexts) {
              if (oTexts.PropertyTexts) {
                oTexts.PropertyTexts.some(function (oValue, nIdx) {
                  if (sName === oValue.PropertyName) {
                    oTexts.PropertyTexts.splice(nIdx, 1);
                    return true;
                  }
                  return false;
                });
              }
            });
          }
          if (oData.semanticDates && oData.semanticDates.Dates) {
            oData.semanticDates.Dates.forEach(function (oDates, nIdx) {
              if (sName === oDates.PropertyName) {
                oData.semanticDates.Dates.splice(nIdx, 1);
              }
            });
          }
        });
      }
      if (aParameterName.length && oData && oData.selectionVariant && oData.selectionVariant.Parameters) {
        aParameterName.forEach(function (sName) {
          oData.selectionVariant.Parameters.some(function (oValue, nIdx) {
            if (sName === oValue.PropertyName || "$Parameter." + sName === oValue.PropertyName) {
              oData.selectionVariant.Parameters.splice(nIdx, 1);
              return true;
            }
            return false;
          });
        });
      }
    };
    _proto._isTermTrue = function _isTermTrue(oProperty, sTerm) {
      const fIsTermDefaultTrue = function (oTerm) {
        if (oTerm) {
          return oTerm.Bool ? oTerm.Bool !== "false" : true;
        }
        return false;
      };
      return !!oProperty[sTerm] && fIsTermDefaultTrue(oProperty[sTerm]);
    };
    _proto._isExcludedFromNavigationContext = function _isExcludedFromNavigationContext(oProperty) {
      return this._isTermTrue(oProperty, "com.sap.vocabularies.UI.v1.ExcludeFromNavigationContext");
    };
    _proto._isPotentiallySensitive = function _isPotentiallySensitive(oProperty) {
      return this._isTermTrue(oProperty, "com.sap.vocabularies.PersonalData.v1.IsPotentiallySensitive");
    };
    _proto._isMeasureProperty = function _isMeasureProperty(oProperty) {
      return this._isTermTrue(oProperty, "com.sap.vocabularies.Analytics.v1.Measure");
    };
    _proto._isToBeExcluded = function _isToBeExcluded(oProperty) {
      return this._isPotentiallySensitive(oProperty) || this._isExcludedFromNavigationContext(oProperty);
    }

    /**
     * The method creates a context url based on provided data. This context url can either be used as
     * {@link sap.fe.navigation.NavigationHandler#setParameterContextUrl ParameterContextUrl} or
     * {@link sap.fe.navigation.NavigationHandler#setFilterContextUrl FilterContextUrl}.
     *
     * @param sEntitySetName Used for url determination
     * @param [oModel] Used for url determination. If omitted, the NavigationHandler model is used.
     * @throws An instance of {@link sap.fe.navigation.NavError} in case of missing or wrong passed parameters
     * @returns The context url for the given entities
     * @protected
     */;
    _proto.constructContextUrl = function constructContextUrl(sEntitySetName, oModel) {
      if (!sEntitySetName) {
        throw new NavError("NavigationHandler.NO_ENTITY_SET_PROVIDED");
      }
      if (oModel === undefined) {
        oModel = this._getModel();
      }
      return this._constructContextUrl(oModel) + "#" + sEntitySetName;
    };
    _proto._constructContextUrl = function _constructContextUrl(oModel) {
      let sServerUrl;
      if (oModel.isA("sap.ui.model.odata.v2.ODataModel")) {
        sServerUrl = oModel._getServerUrl();
      } else if (oModel.isA("sap.ui.model.odata.v4.ODataModel")) {
        const oServiceURI = new URI(oModel.sServiceUrl).absoluteTo(document.baseURI);
        sServerUrl = new URI("/").absoluteTo(oServiceURI).toString();
      }
      if (sServerUrl && sServerUrl.lastIndexOf("/") === sServerUrl.length - 1) {
        sServerUrl = sServerUrl.substr(0, sServerUrl.length - 1);
      }
      return sServerUrl + oModel.sServiceUrl + "/$metadata";
    }

    /**
     * The method verifies, if any of the passed parameters/filters are marked as sensitive, and if this is the case remove those from the app
     * data. <b>Note:</b> To use this method, the metadata must be loaded first.
     *
     * @param oData With potential sensitive information (for OData, external representation using
     * <code>oSelectionVariant.toJSONObject()</code> must be used), with the <code>FilterContextUrl</code> or
     * <code>ParameterContextUrl</code> property.
     * @returns Data without properties marked as sensitive or an empty object if the OData metadata is not fully loaded yet
     * @private
     */;
    _proto._checkIsPotentiallySensitive = function _checkIsPotentiallySensitive(oData) {
      let oAdaptedData = oData;
      if (oData && oData.selectionVariant && (oData.selectionVariant.FilterContextUrl && oData.selectionVariant.SelectOptions || oData.selectionVariant.ParameterContextUrl && oData.selectionVariant.Parameters)) {
        const oModel = this._getModel();
        if (this.oComponent && oModel && oModel.isA("sap.ui.model.odata.v2.ODataModel")) {
          const aSensitiveFilterName = [];
          const aSensitiveParameterName = [];
          let i,
            oEntitySet,
            oEntityDef,
            oSubEntityDef,
            oEndRole,
            aFilterContextPart = [],
            aParamContextPart = [];
          const oMetaModel = oModel.getMetaModel();
          if (oModel.getServiceMetadata() && oMetaModel !== null && oMetaModel !== void 0 && oMetaModel.oModel) {
            if (oData.selectionVariant.FilterContextUrl) {
              aFilterContextPart = oData.selectionVariant.FilterContextUrl.split("#");
            }
            if (aFilterContextPart.length === 2 && oData.selectionVariant.SelectOptions && this._constructContextUrl(oModel).indexOf(aFilterContextPart[0]) === 0) {
              oEntitySet = oMetaModel.getODataEntitySet(aFilterContextPart[1]);
              if (oEntitySet) {
                oEntityDef = oMetaModel.getODataEntityType(oEntitySet.entityType);
              } else {
                oEntityDef = oMetaModel.getODataEntityType(aFilterContextPart[1]);
              }
              if (oEntityDef) {
                if (oEntityDef && oEntityDef.property) {
                  for (i = 0; i < oEntityDef.property.length; i++) {
                    if (this._isToBeExcluded(oEntityDef.property[i])) {
                      aSensitiveFilterName.push(oEntityDef.property[i].name);
                    }
                  }
                }
                if (oEntityDef.navigationProperty) {
                  for (i = 0; i < oEntityDef.navigationProperty.length; i++) {
                    oEndRole = oMetaModel.getODataAssociationEnd(oEntityDef, oEntityDef.navigationProperty[i].name);
                    if (!oEndRole || oEndRole.type === oData.selectionVariant.FilterContextUrl) {
                      continue;
                    }
                    // check if the end role has cardinality 0..1 or 1
                    if (oEndRole.multiplicity === "1" || oEndRole.multiplicity === "0..1") {
                      oSubEntityDef = oMetaModel.getODataEntityType(oEndRole.type);
                      if (oSubEntityDef && oSubEntityDef.property) {
                        for (let j = 0; j < oSubEntityDef.property.length; j++) {
                          if (this._isToBeExcluded(oSubEntityDef.property[j])) {
                            aSensitiveFilterName.push(oEntityDef.navigationProperty[i].name + "." + oSubEntityDef.property[j].name);
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
            if (oData.selectionVariant.ParameterContextUrl) {
              aParamContextPart = oData.selectionVariant.ParameterContextUrl.split("#");
            }
            if (aParamContextPart.length === 2 && oData.selectionVariant.Parameters && this._constructContextUrl(oModel).indexOf(aParamContextPart[0]) === 0) {
              oEntitySet = oMetaModel.getODataEntitySet(aParamContextPart[1]);
              if (oEntitySet) {
                oEntityDef = oMetaModel.getODataEntityType(oEntitySet.entityType);
              } else {
                oEntityDef = oMetaModel.getODataEntityType(aFilterContextPart[1]);
              }
              if (oEntityDef) {
                if (oEntityDef.property) {
                  for (i = 0; i < oEntityDef.property.length; i++) {
                    if (this._isToBeExcluded(oEntityDef.property[i])) {
                      aSensitiveParameterName.push(oEntityDef.property[i].name);
                    }
                  }
                }
              }
            }
            if (aSensitiveFilterName.length || aSensitiveParameterName.length) {
              oAdaptedData = extend(true, {}, oAdaptedData);
              this._removeProperties(aSensitiveFilterName, aSensitiveParameterName, oAdaptedData);
            }
          } else {
            // annotations are not loaded

            this._removeAllProperties(oAdaptedData);
            Log.error("NavigationHandler: oMetadata are not fully loaded!");
          }
        } else if (this.oComponent && oModel && oModel.isA("sap.ui.model.odata.v4.ODataModel")) {
          return this._removeSensitiveDataForODataV4(oAdaptedData);
        }
      }
      return oAdaptedData;
    };
    _proto._removeMeasureBasedInformation = function _removeMeasureBasedInformation(oAppData) {
      let oAppDataForSave = oAppData;
      if (oAppData.selectionVariant) {
        /*
         * The specification states that Selection Variants need to be JSON objects. However, internally, we work with strings for
         * "selectionVariant". Therefore, in case that this is a string, we need to JSON-parse the data.
         */
        if (typeof oAppData.selectionVariant === "string") {
          try {
            oAppDataForSave.selectionVariant = JSON.parse(oAppData.selectionVariant);
          } catch (x) {
            Log.error("NavigationHandler: _removeMeasureBasedInformation parse error");
          }
        }
        oAppDataForSave = this._removeMeasureBasedProperties(oAppDataForSave);
      }
      return oAppDataForSave;
    }

    /**
     * The method verifies if any of the passed parameters/filters are marked as a measure. If this is the case, they are removed from the xapp
     * app data. <b>Note:</b> To use this method, the metadata must be loaded first.
     *
     * @param oData With potential sensitive information (for OData, external representation using
     * <code>oSelectionVariant.toJSONObject()</code> must be used), with the <code>FilterContextUrl</code> or
     * <code>ParameterContextUrl</code> property.
     * @returns Data without properties marked as measures or an empty object if the OData metadata is not fully loaded yet
     * @private
     */;
    _proto._removeMeasureBasedProperties = function _removeMeasureBasedProperties(oData) {
      let oAdaptedData = oData;
      const aMeasureFilterName = [];
      const aMeasureParameterName = [];
      let i,
        oModel,
        oMetaModel,
        oEntitySet,
        oEntityDef,
        oSubEntityDef,
        oEndRole,
        aFilterContextPart = [],
        aParamContextPart = [];
      if (oData && oData.selectionVariant && (oData.selectionVariant.FilterContextUrl && oData.selectionVariant.SelectOptions || oData.selectionVariant.ParameterContextUrl && oData.selectionVariant.Parameters)) {
        oModel = this._getModel();
        if (this.oComponent && oModel && oModel.isA("sap.ui.model.odata.v2.ODataModel")) {
          oMetaModel = oModel.getMetaModel();
          if (oModel.getServiceMetadata() && oMetaModel && oMetaModel.oModel) {
            if (oData.selectionVariant.FilterContextUrl) {
              aFilterContextPart = oData.selectionVariant.FilterContextUrl.split("#");
            }
            if (aFilterContextPart.length === 2 && oData.selectionVariant.SelectOptions && this._constructContextUrl(oModel).indexOf(aFilterContextPart[0]) === 0) {
              oEntitySet = oMetaModel.getODataEntitySet(aFilterContextPart[1]);
              if (oEntitySet) {
                oEntityDef = oMetaModel.getODataEntityType(oEntitySet.entityType);
              } else {
                oEntityDef = oMetaModel.getODataEntityType(aFilterContextPart[1]);
              }
              if (oEntityDef) {
                if (oEntityDef && oEntityDef.property) {
                  for (i = 0; i < oEntityDef.property.length; i++) {
                    if (this._isMeasureProperty(oEntityDef.property[i])) {
                      aMeasureFilterName.push(oEntityDef.property[i].name);
                    }
                  }
                }
                if (oEntityDef.navigationProperty) {
                  for (i = 0; i < oEntityDef.navigationProperty.length; i++) {
                    oEndRole = oMetaModel.getODataAssociationEnd(oEntityDef, oEntityDef.navigationProperty[i].name);
                    if (!oEndRole || oEndRole.type === oData.selectionVariant.FilterContextUrl) {
                      continue;
                    }
                    // check if the end role has cardinality 0..1 or 1
                    if (oEndRole.multiplicity === "1" || oEndRole.multiplicity === "0..1") {
                      oSubEntityDef = oMetaModel.getODataEntityType(oEndRole.type);
                      if (oSubEntityDef && oSubEntityDef.property) {
                        for (let j = 0; j < oSubEntityDef.property.length; j++) {
                          if (this._isMeasureProperty(oSubEntityDef.property[j])) {
                            aMeasureFilterName.push(oEntityDef.navigationProperty[i].name + "." + oSubEntityDef.property[j].name);
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
            if (oData.selectionVariant.ParameterContextUrl) {
              aParamContextPart = oData.selectionVariant.ParameterContextUrl.split("#");
            }
            if (aParamContextPart.length === 2 && oData.selectionVariant.Parameters && this._constructContextUrl(oModel).indexOf(aParamContextPart[0]) === 0) {
              oEntitySet = oMetaModel.getODataEntitySet(aParamContextPart[1]);
              if (oEntitySet) {
                oEntityDef = oMetaModel.getODataEntityType(oEntitySet.entityType);
              } else {
                oEntityDef = oMetaModel.getODataEntityType(aFilterContextPart[1]);
              }
              if (oEntityDef) {
                if (oEntityDef.property) {
                  for (i = 0; i < oEntityDef.property.length; i++) {
                    if (this._isMeasureProperty(oEntityDef.property[i])) {
                      aMeasureParameterName.push(oEntityDef.property[i].name);
                    }
                  }
                }
              }
            }
            if (aMeasureFilterName.length || aMeasureParameterName.length) {
              // TQ: needs attention
              oAdaptedData = extend(true, {}, oAdaptedData);
              this._removeProperties(aMeasureFilterName, aMeasureParameterName, oAdaptedData);
            }
          } else {
            // annotations are not loaded

            this._removeAllProperties(oAdaptedData);
            Log.error("NavigationHandler: oMetadata are not fully loaded!");
          }
        } else if (this.oComponent && oModel && oModel.isA("sap.ui.model.odata.v4.ODataModel")) {
          return this._removeSensitiveDataForODataV4(oAdaptedData, true);
        }
      }
      return oAdaptedData;
    }

    /**
     * Removes sensitive data from the navigation context.
     *
     * @param oData Selection variant
     * @param bMeasure Should measures be removed
     * @returns The selection variant after sensitive data has been removed
     */;
    _proto._removeSensitiveDataForODataV4 = function _removeSensitiveDataForODataV4(oData, bMeasure) {
      var _aFilterContextPart;
      const oNavHandler = this,
        oSV = new SelectionVariant(oData.selectionVariant),
        oModel = this._getModel();
      let aFilterContextPart;
      if (!oModel.getMetaModel().getObject("/")) {
        // annotations are not loaded
        this._removeAllProperties(oData);
        Log.error("NavigationHandler: oMetadata are not fully loaded!");
        return oData;
      }
      if (oData.selectionVariant.FilterContextUrl) {
        aFilterContextPart = oData.selectionVariant.FilterContextUrl.split("#");
      }
      if (((_aFilterContextPart = aFilterContextPart) === null || _aFilterContextPart === void 0 ? void 0 : _aFilterContextPart.length) === 2 && oData.selectionVariant.SelectOptions && this._constructContextUrl(oModel).indexOf(aFilterContextPart[0]) === 0) {
        oSV.removeSelectOption("@odata.context");
        oSV.removeSelectOption("@odata.metadataEtag");
        oSV.removeSelectOption("SAP__Messages");
        const sEntitySet = aFilterContextPart[1],
          oMetaModel = oModel.getMetaModel(),
          aPropertyNames = oSV.getPropertyNames() || [],
          fnIsSensitiveData = function (sProp, esName) {
            esName = esName || sEntitySet;
            const aPropertyAnnotations = oMetaModel.getObject("/" + esName + "/" + sProp + "@");
            if (aPropertyAnnotations) {
              if (bMeasure && aPropertyAnnotations["@com.sap.vocabularies.Analytics.v1.Measure"] || oNavHandler._checkPropertyAnnotationsForSensitiveData(aPropertyAnnotations)) {
                return true;
              } else if (aPropertyAnnotations["@com.sap.vocabularies.Common.v1.FieldControl"]) {
                const oFieldControl = aPropertyAnnotations["@com.sap.vocabularies.Common.v1.FieldControl"];
                if (oFieldControl["$EnumMember"] && oFieldControl["$EnumMember"].split("/")[1] === "Inapplicable") {
                  return true;
                }
              }
            }
            return false;
          };
        for (let k = 0; k < aPropertyNames.length; k++) {
          const sProperty = aPropertyNames[k];
          // properties of the entity set
          if (fnIsSensitiveData(sProperty, sEntitySet)) {
            oSV.removeSelectOption(sProperty);
          }
        }
        oData.selectionVariant = oSV.toJSONObject();
      }
      return oData;
    };
    _proto._checkPropertyAnnotationsForSensitiveData = function _checkPropertyAnnotationsForSensitiveData(aPropertyAnnotations) {
      return aPropertyAnnotations["@com.sap.vocabularies.PersonalData.v1.IsPotentiallySensitive"] || aPropertyAnnotations["@com.sap.vocabularies.UI.v1.ExcludeFromNavigationContext"];
    };
    return NavigationHandler;
  }(BaseObject); // Exporting the class as properly typed UI5Class
  _exports.NavigationHandler = NavigationHandler;
  const NavigationHandlerUI5Class = BaseObject.extend("sap.fe.navigation.NavigationHandler", NavigationHandler.prototype);
  return NavigationHandlerUI5Class;
}, false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/navigation/NavigationHandler", ["sap/base/assert","sap/base/Log","sap/base/util/extend","sap/base/util/isEmptyObject","sap/base/util/merge","sap/ui/base/Object","sap/ui/core/routing/HashChanger","sap/ui/core/UIComponent","sap/ui/thirdparty/URI","sap/ui/util/openWindow","./library","./NavError","./SelectionVariant"],function(e,t,n,a,i,r,o,s,l,c,p,f,u){"use strict";var d={};function h(e,t){e.prototype=Object.create(t.prototype);e.prototype.constructor=e;g(e,t)}function g(e,t){g=Object.setPrototypeOf?Object.setPrototypeOf.bind():function e(t,n){t.__proto__=n;return t};return g(e,t)}const m=p.NavType;const S=p.ParamHandlingMode;const v=p.SuppressionBehavior;const y=p.Mode;const A="sap-iapp-state";const _="sap-ushell-defaultedParameterNames";let V=function(r){h(p,r);function p(e,t,n){var a;a=r.call(this)||this;a._aTechnicalParamaters=["hcpApplicationId"];a._oLastSavedInnerAppData={sAppStateKey:"",oAppData:{},iCacheHit:0,iCacheMiss:0};a._rIAppStateOld=new RegExp("/"+A+"=([^/?]+)");a._rIAppStateOldAtStart=new RegExp("^"+A+"=([^/?]+)");a._rIAppStateNew=new RegExp("[?&]"+A+"=([^&]+)");a.IAPP_STATE=A;if(!e){throw new f("NavigationHandler.INVALID_INPUT")}if(e instanceof s){a.oRouter=e.getRouter();a.oComponent=e}else{if(typeof e.getOwnerComponent!=="function"){throw new f("NavigationHandler.INVALID_INPUT")}a.oRouter=a._getRouter(e);a.oComponent=e.getOwnerComponent()}if(a.oComponent&&a.oComponent.getAppComponent){a.oComponent=a.oComponent.getAppComponent()}if(typeof a.oRouter==="undefined"||typeof a.oComponent==="undefined"||typeof a.oComponent.getComponentData!=="function"){throw new f("NavigationHandler.INVALID_INPUT")}if(n===S.URLParamWins||n===S.InsertInSelOpt){a.sParamHandlingMode=n}else{a.sParamHandlingMode=S.SelVarWins}if(t===y.ODataV2){a._sMode=t}return a}d.NavigationHandler=p;var g=p.prototype;g._getAppNavigationService=function e(){return sap.ushell.Container.getService("CrossApplicationNavigation")};g._getAppNavigationServiceAsync=function e(){return sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function(e){return e}).catch(function(){t.error("NavigationHandler: CrossApplicationNavigation is not available.");throw new f("NavigationHandler.NO.XAPPSERVICE")})};g._getRouter=function e(t){return s.getRouterFor(t)};g.registerNavigateCallback=function e(t){this._navigateCallback=t};g.navigate=function e(n,a,i,r,o,s,l){let p,d,h,g,m=false,S={};const v=this;const y=this.oComponent.getComponentData();if(y){g=y.startupParameters;if(g&&g["sap-ushell-next-navmode"]&&g["sap-ushell-next-navmode"].length>0){m=g["sap-ushell-next-navmode"][0]==="explace"}}if(l&&(l==="inplace"||l==="explace")){m=l==="explace"}else if(l){throw new f("NavigationHandler.INVALID_NAV_MODE")}if(s===undefined||s===null){h={}}else{h=s}if(typeof i==="string"){p=i}else if(typeof i==="object"){const e=this._splitInboundNavigationParameters(new u,i,[]).oNavigationSelVar;p=e.toJSONString()}else{throw new f("NavigationHandler.INVALID_INPUT")}S.selectionVariant=new u(p);if(typeof i==="string"){S.selectionVariant=this._removeTechnicalParameters(S.selectionVariant)}S.selectionVariant=S.selectionVariant&&S.selectionVariant.toJSONObject();S=this._removeMeasureBasedInformation(S);S=this._checkIsPotentiallySensitive(S);if(S.selectionVariant){d=this._getURLParametersFromSelectionVariant(new u(S.selectionVariant));p=new u(S.selectionVariant).toJSONString()}else{d={};p=null}const A={target:{semanticObject:n,action:a},params:d||{}};const _=function(e){if(!h.selectionVariant){h.selectionVariant=p}const n=function(){const n=e.hrefForExternalAsync(A,v.oComponent);n.then(function(e){c(e)}).catch(function(e){t.error("Error while retireving hrefForExternal : "+e)})};h=v._removeMeasureBasedInformation(h);return v._fnSaveAppStateAsync(h,o).then(function(t){if(t){A.appStateKey=t.appStateKey;if(l=="explace"){n()}else{const t=e.toExternal(A,v.oComponent);if(v._navigateCallback){v._navigateCallback(t)}}}})};const V=function(e){v.storeInnerAppStateAsync(r,true).then(function(t){if(t){v.replaceHash(t)}return _(e)}).catch(function(e){if(o){o(e)}})};if(l){A.params["sap-ushell-navmode"]=m?"explace":"inplace"}v._getAppNavigationServiceAsync().then(function(e){const t=e.isNavigationSupported([A],v.oComponent);t.done(function(t){if(t[0].supported){if(!m){V(e)}else{_(e)}}else if(o){const e=new f("NavigationHandler.isIntentSupported.notSupported");o(e)}});if(o){t.fail(function(){const e=v._createTechnicalError("NavigationHandler.isIntentSupported.failed");o(e)})}}).catch(function(e){if(o){o(e)}})};g.parseNavigation=function e(){const n=o.getInstance().getHash();const a=this._getInnerAppStateKey(n);let i=this.oComponent.getComponentData();if(i===undefined){t.warning("The navigation Component's data was not set properly; assuming instead that no parameters are provided.");i={}}const r=i.startupParameters;let s=[];if(r&&r[_]&&r[_].length>0){s=JSON.parse(r[_][0])}const l=jQuery.Deferred();const c=this;const p=function(e,t,n,a){const i=c._splitInboundNavigationParameters(new u,e,t);if(i.oNavigationSelVar.isEmpty()&&i.oDefaultedSelVar.isEmpty()){if(a===m.xAppState){const t=c._createTechnicalError("NavigationHandler.getDataFromAppState.failed");n.reject(t,e||{},m.xAppState)}else{n.resolve({},e,m.initial)}}else{const t={};t.selectionVariant=i.oNavigationSelVar.toJSONString();t.oSelectionVariant=i.oNavigationSelVar;t.oDefaultedSelectionVariant=i.oDefaultedSelVar;t.bNavSelVarHasDefaultsOnly=i.bNavSelVarHasDefaultsOnly;n.resolve(t,e,a)}};if(a){this._loadAppState(a,l)}else{const e=i["sap-xapp-state"]!==undefined;if(e){const e=this;this._getAppNavigationServiceAsync().then(function(t){const n=t.getStartupAppState(e.oComponent);n.done(function(e){let t=e.getData();let n;if(t){try{t=JSON.parse(JSON.stringify(t))}catch(e){n=c._createTechnicalError("NavigationHandler.AppStateData.parseError");l.reject(n,r,m.xAppState);return l.promise()}}if(t){const e=new u(t.selectionVariant);const n=c._splitInboundNavigationParameters(e,r,s);t.selectionVariant=n.oNavigationSelVar.toJSONString();t.oSelectionVariant=n.oNavigationSelVar;t.oDefaultedSelectionVariant=n.oDefaultedSelVar;t.bNavSelVarHasDefaultsOnly=n.bNavSelVarHasDefaultsOnly;l.resolve(t,r,m.xAppState)}else if(r){p(r,s,l,m.xAppState)}else{n=c._createTechnicalError("NavigationHandler.getDataFromAppState.failed");l.reject(n,r||{},m.xAppState)}});n.fail(function(){const e=c._createTechnicalError("NavigationHandler.getStartupState.failed");l.reject(e,{},m.xAppState)})}).catch(function(){const e=c._createTechnicalError("NavigationHandler._getAppNavigationServiceAsync.failed");l.reject(e,{},m.xAppState)})}else if(r){p(r,s,l,m.URLParams)}else{l.resolve({},{},m.initial)}}return l.promise()};g.setTechnicalParameters=function e(n){if(!n){n=[]}if(!Array.isArray(n)){t.error("NavigationHandler: parameter incorrect, array of strings expected");throw new f("NavigationHandler.INVALID_INPUT")}this._aTechnicalParamaters=n};g.getTechnicalParameters=function e(){return this._aTechnicalParamaters.concat([])};g._isTechnicalParameter=function e(t){if(t){if(!(t==="sap-ui-fe-variant-id"||t==="sap-ui-fe-table-variant-id"||t==="sap-ui-fe-chart-variant-id"||t==="sap-ui-fe-filterbar-variant-id")){if(t.toLowerCase().indexOf("sap-")===0){return true}else if(this._aTechnicalParamaters.indexOf(t)>=0){return true}}}return false};g._isFEParameter=function e(t){return t.toLowerCase().indexOf("sap-ui-fe")===0};g._removeTechnicalParameters=function e(t){let n,a;const i=t.getSelectOptionsPropertyNames();for(a=0;a<i.length;a++){n=i[a];if(this._isTechnicalParameter(n)){t.removeSelectOption(n)}}return t};g._splitInboundNavigationParameters=function e(t,n,a){if(!Array.isArray(a)){throw new f("NavigationHandler.INVALID_INPUT")}let i,r;const o={};for(i in n){if(!n.hasOwnProperty(i)){continue}if(this._isTechnicalParameter(i)||this._isFEParameter(i)){continue}if(typeof n[i]==="string"){o[i]=n[i]}else if(Array.isArray(n[i])&&n[i].length===1){o[i]=n[i][0]}else if(Array.isArray(n[i])&&n[i].length>1){o[i]=n[i]}else{throw new f("NavigationHandler.INVALID_INPUT")}}const s=new u;const l=new u;const c=t.getParameterNames().concat(t.getSelectOptionsPropertyNames());for(r=0;r<c.length;r++){i=c[r];if(i in o){if(a.indexOf(i)>-1){l.massAddSelectOption(i,t.getValue(i));this._addParameterValues(s,i,"I","EQ",o[i])}else{switch(this.sParamHandlingMode){case S.SelVarWins:l.massAddSelectOption(i,t.getValue(i));break;case S.URLParamWins:this._addParameterValues(l,i,"I","EQ",o[i]);break;case S.InsertInSelOpt:l.massAddSelectOption(i,t.getValue(i));this._addParameterValues(l,i,"I","EQ",o[i]);break;default:throw new f("NavigationHandler.INVALID_INPUT")}}}else if(a.indexOf(i)>-1){s.massAddSelectOption(i,t.getValue(i))}else{l.massAddSelectOption(i,t.getValue(i))}}for(i in o){if(c.indexOf(i)>-1){continue}if(a.indexOf(i)>-1){this._addParameterValues(s,i,"I","EQ",o[i])}else{this._addParameterValues(l,i,"I","EQ",o[i])}}let p=false;if(l.isEmpty()){p=true;const e=s.getSelectOptionsPropertyNames();for(r=0;r<e.length;r++){l.massAddSelectOption(e[r],s.getValue(e[r]))}}return{oNavigationSelVar:l,oDefaultedSelVar:s,bNavSelVarHasDefaultsOnly:p}};g._addParameterValues=function e(t,n,a,i,r){if(Array.isArray(r)){for(let e=0;e<r.length;e++){t.addSelectOption(n,a,i,r[e])}}else{t.addSelectOption(n,a,i,r)}};g.replaceHash=function e(t){const n=this.oRouter.oHashChanger?this.oRouter.oHashChanger:o.getInstance();const a=n.getHash();const i=this._replaceInnerAppStateKey(a,t);n.replaceHash(i)};g.storeInnerAppStateAsync=function e(n,i,r){if(typeof i!=="boolean"){i=true}const s=this;const l=jQuery.Deferred();const c=function(e){const t=s.oRouter.oHashChanger?s.oRouter.oHashChanger:o.getInstance();const n=t.getHash();const a=s._replaceInnerAppStateKey(n,e);t.replaceHash(a)};if(a(n)){l.resolve("");return l.promise()}const p=this._oLastSavedInnerAppData.sAppStateKey;const f=JSON.stringify(n)===JSON.stringify(this._oLastSavedInnerAppData.oAppData);if(f&&p){this._oLastSavedInnerAppData.iCacheHit++;c(p);l.resolve(p);return l.promise()}this._oLastSavedInnerAppData.iCacheMiss++;const u=function(e){if(!r&&!i){c(e)}s._oLastSavedInnerAppData.oAppData=n;s._oLastSavedInnerAppData.sAppStateKey=e;l.resolve(e)};const d=function(e){l.reject(e)};this._saveAppStateAsync(n,u,d).then(function(e){if(e!==undefined){if(!r&&i){c(e)}}}).catch(function(){t.error("NavigationHandler._saveAppStateAsync failed")});return l.promise()};g.storeInnerAppState=function e(n,i){t.error("Deprecated API call of 'sap.fe.navigation.NavigationHandler.storeInnerAppState'. Please use 'storeInnerAppStateAsync' instead",undefined,"sap.fe.navigation.NavigationHandler");if(typeof i!=="boolean"){i=true}const r=this;const s=jQuery.Deferred();const l=function(e){const t=r.oRouter.oHashChanger?r.oRouter.oHashChanger:o.getInstance();const n=t.getHash();const a=r._replaceInnerAppStateKey(n,e);t.replaceHash(a)};if(a(n)){s.resolve("");return s.promise()}const c=this._oLastSavedInnerAppData.sAppStateKey;const p=JSON.stringify(n)===JSON.stringify(this._oLastSavedInnerAppData.oAppData);if(p&&c){this._oLastSavedInnerAppData.iCacheHit++;l(c);s.resolve(c);return s.promise()}this._oLastSavedInnerAppData.iCacheMiss++;const f=function(e){if(!i){l(e)}r._oLastSavedInnerAppData.oAppData=n;r._oLastSavedInnerAppData.sAppStateKey=e;s.resolve(e)};const u=function(e){s.reject(e)};const d=this._saveAppState(n,f,u);if(d!==undefined){if(i){l(d)}}return s.promise()};g.storeInnerAppStateWithImmediateReturn=function e(n,i){t.error("Deprecated API call of 'sap.fe.navigation.NavigationHandler.storeInnerAppStateWithImmediateReturn'. Please use 'storeInnerAppStateAsync' instead",undefined,"sap.fe.navigation.NavigationHandler");if(typeof i!=="boolean"){i=false}const r=this;const o=jQuery.Deferred();if(a(n)){return{appStateKey:"",promise:o.resolve("")}}const s=this._oLastSavedInnerAppData.sAppStateKey;const l=JSON.stringify(n)===JSON.stringify(this._oLastSavedInnerAppData.oAppData);if(l&&s){this._oLastSavedInnerAppData.iCacheHit++;return{appStateKey:s,promise:o.resolve(s)}}this._oLastSavedInnerAppData.iCacheMiss++;const c=function(e){if(!i){r.replaceHash(e)}r._oLastSavedInnerAppData.oAppData=n;r._oLastSavedInnerAppData.sAppStateKey=e;o.resolve(e)};const p=function(e){o.reject(e)};const f=this._saveAppState(n,c,p);return{appStateKey:f,promise:o.promise()}};g.processBeforeSmartLinkPopoverOpens=function e(t,n,a,i){const r=jQuery.Deferred();let o;if(t!=undefined){o=t.semanticAttributes}let s;const l=this;if(i===undefined){s={}}else{s=i}const c=function(e,n){n=s.selectionVariant||n||"{}";const a=v.raiseErrorOnNull|v.raiseErrorOnUndefined;const i=l.mixAttributesAndSelectionVariant(e,n,a);n=i.toJSONString();let o={};o.selectionVariant=i.toJSONObject();o=l._removeMeasureBasedInformation(o);o=l._checkIsPotentiallySensitive(o);e=o.selectionVariant?l._getURLParametersFromSelectionVariant(new u(o.selectionVariant)):{};const c=function(n){if(t===undefined){r.resolve(e,n)}else{t.setSemanticAttributes(e);t.setAppStateKey(n);t.open();r.resolve(t)}};const p=function(e){r.reject(e)};s.selectionVariant=n;s=l._removeMeasureBasedInformation(s);l._saveAppStateAsync(s,c,p)};if(a){const e=this.storeInnerAppStateAsync(a,true);e.done(function(){c(o,n)});e.fail(function(e){r.reject(e)})}else{c(o,n)}return r.promise()};g._getAppStateKeyAndUrlParameters=function e(t){return this.processBeforeSmartLinkPopoverOpens(undefined,t,undefined,undefined)};g._mixAttributesToSelVariant=function e(n,a,i){for(const e in n){if(n.hasOwnProperty(e)){let r=n[e];if(r instanceof Date){r=r.toJSON()}else if(Array.isArray(r)||r&&typeof r==="object"){r=JSON.stringify(r)}else if(typeof r==="number"||typeof r==="boolean"){r=r.toString()}if(r===""){if(i&v.ignoreEmptyString){t.info("Semantic attribute "+e+" is an empty string and due to the chosen Suppression Behiavour is being ignored.");continue}}if(r===null){if(i&v.raiseErrorOnNull){throw new f("NavigationHandler.INVALID_INPUT")}else{t.warning("Semantic attribute "+e+" is null and ignored for mix in to selection variant");continue}}if(r===undefined){if(i&v.raiseErrorOnUndefined){throw new f("NavigationHandler.INVALID_INPUT")}else{t.warning("Semantic attribute "+e+" is undefined and ignored for mix in to selection variant");continue}}if(typeof r==="string"||r instanceof String){a.addSelectOption(e,"I","EQ",r)}else{throw new f("NavigationHandler.INVALID_INPUT")}}}return a};g.mixAttributesAndSelectionVariant=function e(t,n,a){const i=new u(n);const r=new u;const o=this;const s=i.getFilterContextUrl();if(s){r.setFilterContextUrl(s)}const l=i.getParameterContextUrl();if(l){r.setParameterContextUrl(l)}if(Array.isArray(t)){t.forEach(function(e){o._mixAttributesToSelVariant(e,r,a)})}else{this._mixAttributesToSelVariant(t,r,a)}const c=i.getParameterNames();let p;for(p=0;p<c.length;p++){if(!r.getSelectOption(c[p])){r.addSelectOption(c[p],"I","EQ",i.getParameter(c[p]))}}const f=i.getSelectOptionsPropertyNames();for(p=0;p<f.length;p++){const e=i.getSelectOption(f[p]);if(!r.getSelectOption(f[p])){for(let t=0;t<e.length;t++){r.addSelectOption(f[p],e[t].Sign,e[t].Option,e[t].Low,e[t].High)}}}return r};g._ensureSelectionVariantFormatString=function e(t){if(t===undefined){return undefined}let n=t;if(typeof t==="object"){n=JSON.stringify(t)}return n};g._fnHandleAppStatePromise=function e(t,n,a){t.promise.done(function(){if(n){n(t.appStateKey)}});if(a){const e=this;t.promise.fail(function(){const t=e._createTechnicalError("NavigationHandler.AppStateSave.failed");a(t)})}};g._saveAppStateAsync=function e(t,n,a){const i=this;return this._fnSaveAppStateAsync(t,a).then(function(e){if(e){i._fnHandleAppStatePromise(e,n,a);return e.appStateKey}return undefined})};g._saveAppState=function e(t,n,a){const i=this._saveAppStateWithImmediateReturn(t,a);if(i){this._fnHandleAppStatePromise(i,n,a);return i.appStateKey}return undefined};g._fnSaveAppStateWithImmediateReturn=function e(t,n,a){const i=n.getKey();const r=this._fetchAppDataForSave(t,a);if(!r){return undefined}n.setData(r);const o=n.save();return{appStateKey:i,promise:o.promise()}};g._fetchAppDataForSave=function e(t,a){let r={};if(t.hasOwnProperty("selectionVariant")){r.selectionVariant=t.selectionVariant;if(t.selectionVariant){if(typeof t.selectionVariant==="string"){try{r.selectionVariant=JSON.parse(t.selectionVariant)}catch(e){const t=this._createTechnicalError("NavigationHandler.AppStateSave.parseError");if(a){a(t)}return undefined}}}}if(this._sMode===y.ODataV2){r=n({selectionVariant:{},tableVariantId:"",customData:{}},r);if(t.tableVariantId){r.tableVariantId=t.tableVariantId}if(t.customData){r.customData=t.customData}if(t.presentationVariant){r.presentationVariant=t.presentationVariant}if(t.valueTexts){r.valueTexts=t.valueTexts}if(t.semanticDates){r.semanticDates=t.semanticDates}}else{const e=Object.assign({},t);r=i(e,r)}r=this._checkIsPotentiallySensitive(r);return r};g._fnSaveAppStateAsync=function e(t,n){const a=this;return this._getAppNavigationServiceAsync().then(function(e){return e.createEmptyAppStateAsync(a.oComponent)}).then(function(e){return a._fnSaveAppStateWithImmediateReturn(t,e,n)}).catch(function(e){if(n){n(e)}})};g._saveAppStateWithImmediateReturn=function e(t,n){const a=this._getAppNavigationService().createEmptyAppState(this.oComponent);return this._fnSaveAppStateWithImmediateReturn(t,a,n)};g._loadAppState=function e(t,n){const a=this;this._getAppNavigationServiceAsync().then(function(e){const r=e.getAppState(a.oComponent,t);r.done(function(e){let r={};const o=e.getData();if(typeof o==="undefined"){const e=a._createTechnicalError("NavigationHandler.getDataFromAppState.failed");n.reject(e,{},m.iAppState)}else if(a._sMode===y.ODataV2){r={selectionVariant:"{}",oSelectionVariant:new u,oDefaultedSelectionVariant:new u,bNavSelVarHasDefaultsOnly:false,tableVariantId:"",customData:{},appStateKey:t,presentationVariant:{},valueTexts:{},semanticDates:{}};if(o.selectionVariant){r.selectionVariant=a._ensureSelectionVariantFormatString(o.selectionVariant);r.oSelectionVariant=new u(r.selectionVariant)}if(o.tableVariantId){r.tableVariantId=o.tableVariantId}if(o.customData){r.customData=o.customData}if(o.presentationVariant){r.presentationVariant=o.presentationVariant}if(o.valueTexts){r.valueTexts=o.valueTexts}if(o.semanticDates){r.semanticDates=o.semanticDates}}else{r=i(r,o);if(o.selectionVariant){r.selectionVariant=a._ensureSelectionVariantFormatString(o.selectionVariant);r.oSelectionVariant=new u(r.selectionVariant)}}n.resolve(r,{},m.iAppState)});r.fail(function(){const e=a._createTechnicalError("NavigationHandler.getAppState.failed");n.reject(e,{},m.iAppState)})}).catch(function(){const e=a._createTechnicalError("NavigationHandler._getAppNavigationServiceAsync.failed");n.reject(e,{},m.iAppState)})};g._getInnerAppStateKey=function e(t){if(!t){return undefined}let n=this._rIAppStateNew.exec(t);if(n===null){n=this._rIAppStateOld.exec(t)}if(n===null){n=this._rIAppStateOldAtStart.exec(t)}if(n===null){return undefined}return n[1]};g._replaceInnerAppStateKey=function t(n,a){const i=A+"="+a;if(!n){return"?"+i}const r=function(e){if(e.indexOf("?")!==-1){return e+"&"+i}return e+"?"+i};if(!this._getInnerAppStateKey(n)){return r(n)}if(this._rIAppStateNew.test(n)){return n.replace(this._rIAppStateNew,function(e){return e.replace(/\=.*/gi,"="+a)})}const o=function(e,t){t=t.replace(e,"");return r(t)};if(this._rIAppStateOld.test(n)){return o(this._rIAppStateOld,n)}if(this._rIAppStateOldAtStart.test(n)){return o(this._rIAppStateOldAtStart,n)}e(false,"internal inconsistency: Approach of sap-iapp-state not known, but _getInnerAppStateKey returned it");return undefined};g._getURLParametersFromSelectionVariant=function e(t){const n={};let a=0;let i;if(typeof t==="string"){i=new u(t)}else if(typeof t==="object"){i=t}else{throw new f("NavigationHandler.INVALID_INPUT")}const r=i.getSelectOptionsPropertyNames();for(a=0;a<r.length;a++){const e=i.getSelectOption(r[a]);if(e.length===1&&e[0].Sign==="I"&&e[0].Option==="EQ"){n[r[a]]=e[0].Low}}const o=i.getParameterNames();for(a=0;a<o.length;a++){const e=i.getParameter(o[a]);n[o[a]]=e}return n};g._createTechnicalError=function e(t){return new f(t)};g.setModel=function e(t){this._oModel=t};g._getModel=function e(){return this._oModel||this.oComponent.getModel()};g._removeAllProperties=function e(t){if(t){if(t.selectionVariant){t.selectionVariant=null}if(t.valueTexts){t.valueTexts=null}if(t.semanticDates){t.semanticDates=null}}};g._removeProperties=function e(t,n,a){if(t.length&&a&&(a.selectionVariant||a.valueTexts||a.semanticDates)){t.forEach(function(e){if(a.selectionVariant.SelectOptions){a.selectionVariant.SelectOptions.some(function(t,n){if(e===t.PropertyName){a.selectionVariant.SelectOptions.splice(n,1);return true}return false})}if(a.valueTexts&&a.valueTexts.Texts){a.valueTexts.Texts.forEach(function(t){if(t.PropertyTexts){t.PropertyTexts.some(function(n,a){if(e===n.PropertyName){t.PropertyTexts.splice(a,1);return true}return false})}})}if(a.semanticDates&&a.semanticDates.Dates){a.semanticDates.Dates.forEach(function(t,n){if(e===t.PropertyName){a.semanticDates.Dates.splice(n,1)}})}})}if(n.length&&a&&a.selectionVariant&&a.selectionVariant.Parameters){n.forEach(function(e){a.selectionVariant.Parameters.some(function(t,n){if(e===t.PropertyName||"$Parameter."+e===t.PropertyName){a.selectionVariant.Parameters.splice(n,1);return true}return false})})}};g._isTermTrue=function e(t,n){const a=function(e){if(e){return e.Bool?e.Bool!=="false":true}return false};return!!t[n]&&a(t[n])};g._isExcludedFromNavigationContext=function e(t){return this._isTermTrue(t,"com.sap.vocabularies.UI.v1.ExcludeFromNavigationContext")};g._isPotentiallySensitive=function e(t){return this._isTermTrue(t,"com.sap.vocabularies.PersonalData.v1.IsPotentiallySensitive")};g._isMeasureProperty=function e(t){return this._isTermTrue(t,"com.sap.vocabularies.Analytics.v1.Measure")};g._isToBeExcluded=function e(t){return this._isPotentiallySensitive(t)||this._isExcludedFromNavigationContext(t)};g.constructContextUrl=function e(t,n){if(!t){throw new f("NavigationHandler.NO_ENTITY_SET_PROVIDED")}if(n===undefined){n=this._getModel()}return this._constructContextUrl(n)+"#"+t};g._constructContextUrl=function e(t){let n;if(t.isA("sap.ui.model.odata.v2.ODataModel")){n=t._getServerUrl()}else if(t.isA("sap.ui.model.odata.v4.ODataModel")){const e=new l(t.sServiceUrl).absoluteTo(document.baseURI);n=new l("/").absoluteTo(e).toString()}if(n&&n.lastIndexOf("/")===n.length-1){n=n.substr(0,n.length-1)}return n+t.sServiceUrl+"/$metadata"};g._checkIsPotentiallySensitive=function e(a){let i=a;if(a&&a.selectionVariant&&(a.selectionVariant.FilterContextUrl&&a.selectionVariant.SelectOptions||a.selectionVariant.ParameterContextUrl&&a.selectionVariant.Parameters)){const e=this._getModel();if(this.oComponent&&e&&e.isA("sap.ui.model.odata.v2.ODataModel")){const r=[];const o=[];let s,l,c,p,f,u=[],d=[];const h=e.getMetaModel();if(e.getServiceMetadata()&&h!==null&&h!==void 0&&h.oModel){if(a.selectionVariant.FilterContextUrl){u=a.selectionVariant.FilterContextUrl.split("#")}if(u.length===2&&a.selectionVariant.SelectOptions&&this._constructContextUrl(e).indexOf(u[0])===0){l=h.getODataEntitySet(u[1]);if(l){c=h.getODataEntityType(l.entityType)}else{c=h.getODataEntityType(u[1])}if(c){if(c&&c.property){for(s=0;s<c.property.length;s++){if(this._isToBeExcluded(c.property[s])){r.push(c.property[s].name)}}}if(c.navigationProperty){for(s=0;s<c.navigationProperty.length;s++){f=h.getODataAssociationEnd(c,c.navigationProperty[s].name);if(!f||f.type===a.selectionVariant.FilterContextUrl){continue}if(f.multiplicity==="1"||f.multiplicity==="0..1"){p=h.getODataEntityType(f.type);if(p&&p.property){for(let e=0;e<p.property.length;e++){if(this._isToBeExcluded(p.property[e])){r.push(c.navigationProperty[s].name+"."+p.property[e].name)}}}}}}}}if(a.selectionVariant.ParameterContextUrl){d=a.selectionVariant.ParameterContextUrl.split("#")}if(d.length===2&&a.selectionVariant.Parameters&&this._constructContextUrl(e).indexOf(d[0])===0){l=h.getODataEntitySet(d[1]);if(l){c=h.getODataEntityType(l.entityType)}else{c=h.getODataEntityType(u[1])}if(c){if(c.property){for(s=0;s<c.property.length;s++){if(this._isToBeExcluded(c.property[s])){o.push(c.property[s].name)}}}}}if(r.length||o.length){i=n(true,{},i);this._removeProperties(r,o,i)}}else{this._removeAllProperties(i);t.error("NavigationHandler: oMetadata are not fully loaded!")}}else if(this.oComponent&&e&&e.isA("sap.ui.model.odata.v4.ODataModel")){return this._removeSensitiveDataForODataV4(i)}}return i};g._removeMeasureBasedInformation=function e(n){let a=n;if(n.selectionVariant){if(typeof n.selectionVariant==="string"){try{a.selectionVariant=JSON.parse(n.selectionVariant)}catch(e){t.error("NavigationHandler: _removeMeasureBasedInformation parse error")}}a=this._removeMeasureBasedProperties(a)}return a};g._removeMeasureBasedProperties=function e(a){let i=a;const r=[];const o=[];let s,l,c,p,f,u,d,h=[],g=[];if(a&&a.selectionVariant&&(a.selectionVariant.FilterContextUrl&&a.selectionVariant.SelectOptions||a.selectionVariant.ParameterContextUrl&&a.selectionVariant.Parameters)){l=this._getModel();if(this.oComponent&&l&&l.isA("sap.ui.model.odata.v2.ODataModel")){c=l.getMetaModel();if(l.getServiceMetadata()&&c&&c.oModel){if(a.selectionVariant.FilterContextUrl){h=a.selectionVariant.FilterContextUrl.split("#")}if(h.length===2&&a.selectionVariant.SelectOptions&&this._constructContextUrl(l).indexOf(h[0])===0){p=c.getODataEntitySet(h[1]);if(p){f=c.getODataEntityType(p.entityType)}else{f=c.getODataEntityType(h[1])}if(f){if(f&&f.property){for(s=0;s<f.property.length;s++){if(this._isMeasureProperty(f.property[s])){r.push(f.property[s].name)}}}if(f.navigationProperty){for(s=0;s<f.navigationProperty.length;s++){d=c.getODataAssociationEnd(f,f.navigationProperty[s].name);if(!d||d.type===a.selectionVariant.FilterContextUrl){continue}if(d.multiplicity==="1"||d.multiplicity==="0..1"){u=c.getODataEntityType(d.type);if(u&&u.property){for(let e=0;e<u.property.length;e++){if(this._isMeasureProperty(u.property[e])){r.push(f.navigationProperty[s].name+"."+u.property[e].name)}}}}}}}}if(a.selectionVariant.ParameterContextUrl){g=a.selectionVariant.ParameterContextUrl.split("#")}if(g.length===2&&a.selectionVariant.Parameters&&this._constructContextUrl(l).indexOf(g[0])===0){p=c.getODataEntitySet(g[1]);if(p){f=c.getODataEntityType(p.entityType)}else{f=c.getODataEntityType(h[1])}if(f){if(f.property){for(s=0;s<f.property.length;s++){if(this._isMeasureProperty(f.property[s])){o.push(f.property[s].name)}}}}}if(r.length||o.length){i=n(true,{},i);this._removeProperties(r,o,i)}}else{this._removeAllProperties(i);t.error("NavigationHandler: oMetadata are not fully loaded!")}}else if(this.oComponent&&l&&l.isA("sap.ui.model.odata.v4.ODataModel")){return this._removeSensitiveDataForODataV4(i,true)}}return i};g._removeSensitiveDataForODataV4=function e(n,a){var i;const r=this,o=new u(n.selectionVariant),s=this._getModel();let l;if(!s.getMetaModel().getObject("/")){this._removeAllProperties(n);t.error("NavigationHandler: oMetadata are not fully loaded!");return n}if(n.selectionVariant.FilterContextUrl){l=n.selectionVariant.FilterContextUrl.split("#")}if(((i=l)===null||i===void 0?void 0:i.length)===2&&n.selectionVariant.SelectOptions&&this._constructContextUrl(s).indexOf(l[0])===0){o.removeSelectOption("@odata.context");o.removeSelectOption("@odata.metadataEtag");o.removeSelectOption("SAP__Messages");const e=l[1],t=s.getMetaModel(),i=o.getPropertyNames()||[],c=function(n,i){i=i||e;const o=t.getObject("/"+i+"/"+n+"@");if(o){if(a&&o["@com.sap.vocabularies.Analytics.v1.Measure"]||r._checkPropertyAnnotationsForSensitiveData(o)){return true}else if(o["@com.sap.vocabularies.Common.v1.FieldControl"]){const e=o["@com.sap.vocabularies.Common.v1.FieldControl"];if(e["$EnumMember"]&&e["$EnumMember"].split("/")[1]==="Inapplicable"){return true}}}return false};for(let t=0;t<i.length;t++){const n=i[t];if(c(n,e)){o.removeSelectOption(n)}}n.selectionVariant=o.toJSONObject()}return n};g._checkPropertyAnnotationsForSensitiveData=function e(t){return t["@com.sap.vocabularies.PersonalData.v1.IsPotentiallySensitive"]||t["@com.sap.vocabularies.UI.v1.ExcludeFromNavigationContext"]};return p}(r);d.NavigationHandler=V;const N=r.extend("sap.fe.navigation.NavigationHandler",V.prototype);return N},false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/navigation/PresentationVariant-dbg", ["sap/base/Log", "sap/ui/base/Object", "./NavError"], function (Log, BaseObject, NavError) {
  "use strict";

  var _exports = {};
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  /**
   * This is the successor of {@link sap.ui.generic.app.navigation.service.PresentationVariant}.<br> Creates a new instance of a PresentationVariant class. If no parameter is passed, an new empty instance is created whose ID has been set to <code>""</code>. Passing a JSON-serialized string complying to the Selection Variant Specification will parse it, and the newly created instance will contain the same information.
   *
   * @public
   * @name sap.fe.navigation.PresentationVariant
   * @class This is the successor of {@link sap.ui.generic.app.navigation.service.PresentationVariant}.
   * @extends sap.ui.base.Object
   * @since 1.83.0
   */
  let PresentationVariant = /*#__PURE__*/function (_BaseObject) {
    _inheritsLoose(PresentationVariant, _BaseObject);
    /**
     * If no parameter is passed, a new empty instance is created whose ID has been set to <code>""</code>.
     * Passing a JSON-serialized string complying to the Selection Variant Specification will parse it,
     * and the newly created instance will contain the same information.
     *
     * @param presentationVariant If of type <code>string</code>, the selection variant is JSON-formatted;
     * if of type <code>object</code>, the object represents a selection variant
     * @throws An instance of {@link sap.fe.navigation.NavError} in case of input errors. Valid error codes are:
     * <table>
     * <tr><th>NavError code</th><th>Description</th></tr>
     * <tr><td>PresentationVariant.INVALID_INPUT_TYPE</td><td>Indicates that the data format of the selection variant provided is inconsistent</td></tr>
     * <tr><td>PresentationVariant.UNABLE_TO_PARSE_INPUT</td><td>Indicates that the provided string is not a JSON-formatted string</td></tr>
     * <tr><td>PresentationVariant.INPUT_DOES_NOT_CONTAIN_SELECTIONVARIANT_ID</td><td>Indicates that the PresentationVariantID cannot be retrieved</td></tr>
     * <tr><td>PresentationVariant.PARAMETER_WITHOUT_VALUE</td><td>Indicates that there was an attempt to specify a parameter, but without providing any value (not even an empty value)</td></tr>
     * <tr><td>PresentationVariant.SELECT_OPTION_WITHOUT_PROPERTY_NAME</td><td>Indicates that a selection option has been defined, but the Ranges definition is missing</td></tr>
     * <tr><td>PresentationVariant.SELECT_OPTION_RANGES_NOT_ARRAY</td><td>Indicates that the Ranges definition is not an array</td></tr>
     * </table>
     * These exceptions can only be thrown if the parameter <code>vPresentationVariant</code> has been provided.
     */
    function PresentationVariant(presentationVariant) {
      var _this;
      _this = _BaseObject.call(this) || this;
      _this.id = "";
      if (presentationVariant !== undefined) {
        if (typeof presentationVariant === "string") {
          _this.parseFromString(presentationVariant);
        } else if (typeof presentationVariant === "object") {
          _this.parseFromObject(presentationVariant);
        } else {
          throw new NavError("PresentationVariant.INVALID_INPUT_TYPE");
        }
      }
      return _this;
    }

    /**
     * Returns the identification of the selection variant.
     *
     * @returns The identification of the selection variant as made available during construction
     * @public
     */
    _exports.PresentationVariant = PresentationVariant;
    var _proto = PresentationVariant.prototype;
    _proto.getID = function getID() {
      return this.id;
    }

    /**
     * Sets the identification of the selection variant.
     *
     * @param id The new identification of the selection variant
     * @public
     */;
    _proto.setID = function setID(id) {
      this.id = id;
    }

    /**
     * Sets the text / description of the selection variant.
     *
     * @param newText The new description to be used
     * @public
     * @throws An instance of {@link sap.fe.navigation.NavError} in case of input errors. Valid error codes are:
     * <table>
     * <tr><th>NavError code</th><th>Description</th></tr>
     * <tr><td>PresentationVariant.INVALID_INPUT_TYPE</td><td>Indicates that an input parameter has an invalid type</td></tr>
     * </table>
     */;
    _proto.setText = function setText(newText) {
      if (typeof newText !== "string") {
        throw new NavError("PresentationVariant.INVALID_INPUT_TYPE");
      }
      this.text = newText;
    }

    /**
     * Returns the current text / description of this selection variant.
     *
     * @returns The current description of this selection variant.
     * @public
     */;
    _proto.getText = function getText() {
      return this.text;
    }

    /**
     * Sets the context URL.
     *
     * @param url The URL of the context
     * @public
     * @throws An instance of {@link sap.fe.navigation.NavError} in case of input errors. Valid error codes are:
     * <table>
     * <tr><th>NavError code</th><th>Description</th></tr>
     * <tr><td>PresentationVariant.INVALID_INPUT_TYPE</td><td>Indicates that an input parameter has an invalid type</td></tr>
     * </table>
     */;
    _proto.setContextUrl = function setContextUrl(url) {
      if (typeof url !== "string") {
        throw new NavError("PresentationVariant.INVALID_INPUT_TYPE");
      }
      this.ctxUrl = url;
    }

    /**
     * Gets the current context URL intended for the query.
     *
     * @returns The current context URL for the query
     * @public
     */;
    _proto.getContextUrl = function getContextUrl() {
      return this.ctxUrl;
    }

    /**
     * Returns <code>true</code> if the presentation variant does not contain any properties.
     * nor ranges.
     *
     * @returns If set to <code>true</code> there are no current properties set; <code>false</code> otherwise.
     * @public
     */;
    _proto.isEmpty = function isEmpty() {
      return Object.keys(this.getTableVisualization() ?? {}).length === 0 && Object.keys(this.getChartVisualization() ?? {}).length === 0 && Object.keys(this.getProperties() ?? {}).length === 0;
    }

    /**
     * Sets the more trivial properties. Basically all properties with the exception of the Visualization.
     *
     * @param properties The properties to be used.
     * @public
     */;
    _proto.setProperties = function setProperties(properties) {
      this.properties = Object.assign({}, properties);
    }

    /**
     * Gets the more trivial properties. Basically all properties with the exception of the Visualization.
     *
     * @returns The current properties.
     * @public
     */;
    _proto.getProperties = function getProperties() {
      return this.properties;
    }

    /**
     * Sets the table visualization property.
     *
     * @param properties An object containing the properties to be used for the table visualization.
     * @public
     */;
    _proto.setTableVisualization = function setTableVisualization(properties) {
      this.visTable = Object.assign({}, properties);
    }

    /**
     * Gets the table visualization property.
     *
     * @returns An object containing the properties to be used for the table visualization.
     * @public
     */;
    _proto.getTableVisualization = function getTableVisualization() {
      return this.visTable;
    }

    /**
     * Sets the chart visualization property.
     *
     * @param properties An object containing the properties to be used for the chart visualization.
     * @public
     */;
    _proto.setChartVisualization = function setChartVisualization(properties) {
      this.visChart = Object.assign({}, properties);
    }

    /**
     * Gets the chart visualization property.
     *
     * @returns An object containing the properties to be used for the chart visualization.
     * @public
     */;
    _proto.getChartVisualization = function getChartVisualization() {
      return this.visChart;
    }

    /**
     * Returns the external representation of the selection variant as JSON object.
     *
     * @returns The external representation of this instance as a JSON object
     * @public
     */;
    _proto.toJSONObject = function toJSONObject() {
      const externalPresentationVariant = {
        Version: {
          // Version attributes are not part of the official specification,
          Major: "1",
          // but could be helpful later for implementing a proper lifecycle/interoperability
          Minor: "0",
          Patch: "0"
        },
        PresentationVariantID: this.id
      };
      if (this.ctxUrl) {
        externalPresentationVariant.ContextUrl = this.ctxUrl;
      }
      if (this.text) {
        externalPresentationVariant.Text = this.text;
      } else {
        externalPresentationVariant.Text = "Presentation Variant with ID " + this.id;
      }
      this.serializeProperties(externalPresentationVariant);
      this.serializeVisualizations(externalPresentationVariant);
      return externalPresentationVariant;
    }

    /**
     * Serializes this instance into a JSON-formatted string.
     *
     * @returns The JSON-formatted representation of this instance in stringified format
     * @public
     */;
    _proto.toJSONString = function toJSONString() {
      return JSON.stringify(this.toJSONObject());
    };
    _proto.serializeProperties = function serializeProperties(externalPresentationVariant) {
      if (this.properties) {
        Object.assign(externalPresentationVariant, this.properties);
      }
    };
    _proto.serializeVisualizations = function serializeVisualizations(externalPresentationVariant) {
      if (this.visTable) {
        if (!externalPresentationVariant.Visualizations) {
          externalPresentationVariant.Visualizations = [];
        }
        externalPresentationVariant.Visualizations.push(this.visTable);
      }
      if (this.visChart) {
        if (!externalPresentationVariant.Visualizations) {
          externalPresentationVariant.Visualizations = [];
        }
        externalPresentationVariant.Visualizations.push(this.visChart);
      }
    };
    _proto.parseFromString = function parseFromString(jsonString) {
      if (jsonString === undefined) {
        throw new NavError("PresentationVariant.UNABLE_TO_PARSE_INPUT");
      }
      if (typeof jsonString !== "string") {
        throw new NavError("PresentationVariant.INVALID_INPUT_TYPE");
      }
      this.parseFromObject(JSON.parse(jsonString));
    };
    _proto.parseFromObject = function parseFromObject(input) {
      if (input.PresentationVariantID === undefined) {
        // Do not throw an error, but only write a warning into the log.
        // The PresentationVariantID is mandatory according to the specification document version 1.0,
        // but this document is not a universally valid standard.
        // It is said that the "implementation of the SmartFilterBar" may supersede the specification.
        // Thus, also allow an initial PresentationVariantID.
        //		throw new sap.fe.navigation.NavError("PresentationVariant.INPUT_DOES_NOT_CONTAIN_SELECTIONVARIANT_ID");
        Log.warning("PresentationVariantID is not defined");
        input.PresentationVariantID = "";
      }
      const inputCopy = Object.assign({}, input);
      delete inputCopy.Version;
      this.setID(input.PresentationVariantID);
      delete inputCopy.PresentationVariantID;
      if (input.ContextUrl !== undefined && input.ContextUrl !== "") {
        this.setContextUrl(input.ContextUrl);
        delete input.ContextUrl;
      }
      if (input.Text !== undefined) {
        this.setText(input.Text);
        delete input.Text;
      }
      if (input.Visualizations) {
        this.parseVisualizations(input.Visualizations);
        delete inputCopy.Visualizations;
      }
      this.setProperties(inputCopy);
    };
    _proto.parseVisualizations = function parseVisualizations(visualizations) {
      if (!Array.isArray(visualizations)) {
        throw new NavError("PresentationVariant.INVALID_INPUT_TYPE");
      }
      for (const visualization of visualizations) {
        if (visualization !== null && visualization !== void 0 && visualization.Type && visualization.Type.indexOf("Chart") >= 0) {
          this.setChartVisualization(visualization);
        } else {
          this.setTableVisualization(visualization);
        }
      }
    };
    return PresentationVariant;
  }(BaseObject); // Exporting the class as properly typed UI5Class
  _exports.PresentationVariant = PresentationVariant;
  const UI5Class = BaseObject.extend("sap.fe.navigation.PresentationVariant", PresentationVariant.prototype);
  return UI5Class;
}, false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/navigation/PresentationVariant", ["sap/base/Log","sap/ui/base/Object","./NavError"],function(t,i,e){"use strict";var n={};function s(t,i){t.prototype=Object.create(i.prototype);t.prototype.constructor=t;r(t,i)}function r(t,i){r=Object.setPrototypeOf?Object.setPrototypeOf.bind():function t(i,e){i.__proto__=e;return i};return r(t,i)}let a=function(i){s(r,i);function r(t){var n;n=i.call(this)||this;n.id="";if(t!==undefined){if(typeof t==="string"){n.parseFromString(t)}else if(typeof t==="object"){n.parseFromObject(t)}else{throw new e("PresentationVariant.INVALID_INPUT_TYPE")}}return n}n.PresentationVariant=r;var a=r.prototype;a.getID=function t(){return this.id};a.setID=function t(i){this.id=i};a.setText=function t(i){if(typeof i!=="string"){throw new e("PresentationVariant.INVALID_INPUT_TYPE")}this.text=i};a.getText=function t(){return this.text};a.setContextUrl=function t(i){if(typeof i!=="string"){throw new e("PresentationVariant.INVALID_INPUT_TYPE")}this.ctxUrl=i};a.getContextUrl=function t(){return this.ctxUrl};a.isEmpty=function t(){return Object.keys(this.getTableVisualization()??{}).length===0&&Object.keys(this.getChartVisualization()??{}).length===0&&Object.keys(this.getProperties()??{}).length===0};a.setProperties=function t(i){this.properties=Object.assign({},i)};a.getProperties=function t(){return this.properties};a.setTableVisualization=function t(i){this.visTable=Object.assign({},i)};a.getTableVisualization=function t(){return this.visTable};a.setChartVisualization=function t(i){this.visChart=Object.assign({},i)};a.getChartVisualization=function t(){return this.visChart};a.toJSONObject=function t(){const i={Version:{Major:"1",Minor:"0",Patch:"0"},PresentationVariantID:this.id};if(this.ctxUrl){i.ContextUrl=this.ctxUrl}if(this.text){i.Text=this.text}else{i.Text="Presentation Variant with ID "+this.id}this.serializeProperties(i);this.serializeVisualizations(i);return i};a.toJSONString=function t(){return JSON.stringify(this.toJSONObject())};a.serializeProperties=function t(i){if(this.properties){Object.assign(i,this.properties)}};a.serializeVisualizations=function t(i){if(this.visTable){if(!i.Visualizations){i.Visualizations=[]}i.Visualizations.push(this.visTable)}if(this.visChart){if(!i.Visualizations){i.Visualizations=[]}i.Visualizations.push(this.visChart)}};a.parseFromString=function t(i){if(i===undefined){throw new e("PresentationVariant.UNABLE_TO_PARSE_INPUT")}if(typeof i!=="string"){throw new e("PresentationVariant.INVALID_INPUT_TYPE")}this.parseFromObject(JSON.parse(i))};a.parseFromObject=function i(e){if(e.PresentationVariantID===undefined){t.warning("PresentationVariantID is not defined");e.PresentationVariantID=""}const n=Object.assign({},e);delete n.Version;this.setID(e.PresentationVariantID);delete n.PresentationVariantID;if(e.ContextUrl!==undefined&&e.ContextUrl!==""){this.setContextUrl(e.ContextUrl);delete e.ContextUrl}if(e.Text!==undefined){this.setText(e.Text);delete e.Text}if(e.Visualizations){this.parseVisualizations(e.Visualizations);delete n.Visualizations}this.setProperties(n)};a.parseVisualizations=function t(i){if(!Array.isArray(i)){throw new e("PresentationVariant.INVALID_INPUT_TYPE")}for(const t of i){if(t!==null&&t!==void 0&&t.Type&&t.Type.indexOf("Chart")>=0){this.setChartVisualization(t)}else{this.setTableVisualization(t)}}};return r}(i);n.PresentationVariant=a;const o=i.extend("sap.fe.navigation.PresentationVariant",a.prototype);return o},false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/navigation/SelectionVariant-dbg", ["sap/base/Log", "sap/base/util/each", "sap/ui/base/Object", "./NavError"], function (Log, each, BaseObject, NavError) {
  "use strict";

  var _exports = {};
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  const VALIDATE_SIGN = new RegExp("[E|I]");
  const VALIDATE_OPTION = new RegExp("EQ|NE|LE|GE|LT|GT|BT|CP");

  /**
   * @public
   * @name sap.fe.navigation.SelectionVariant
   * @class
   * This is the successor of {@link sap.ui.generic.app.navigation.service.SelectionVariant}.<br>
   * Creates a new instance of a SelectionVariant class. If no parameter is passed,
   * an new empty instance is created whose ID has been set to <code>""</code>.
   * Passing a JSON-serialized string complying to the Selection Variant Specification will parse it,
   * and the newly created instance will contain the same information.
   * @extends sap.ui.base.Object
   * @since 1.83.0
   * @param {string|object} [vSelectionVariant] If of type <code>string</code>, the selection variant is JSON-formatted;
   * if of type <code>object</code>, the object represents a selection variant
   * @throws An instance of {@link sap.fe.navigation.NavError} in case of input errors. Valid error codes are:
   * <table>
   * <tr><th>NavError code</th><th>Description</th></tr>
   * <tr><td>SelectionVariant.INVALID_INPUT_TYPE</td><td>Indicates that the data format of the selection variant provided is inconsistent</td></tr>
   * <tr><td>SelectionVariant.UNABLE_TO_PARSE_INPUT</td><td>Indicates that the provided string is not a JSON-formatted string</td></tr>
   * <tr><td>SelectionVariant.INPUT_DOES_NOT_CONTAIN_SELECTIONVARIANT_ID</td><td>Indicates that the SelectionVariantID cannot be retrieved</td></tr>
   * <tr><td>SelectionVariant.PARAMETER_WITHOUT_VALUE</td><td>Indicates that there was an attempt to specify a parameter, but without providing any value (not even an empty value)</td></tr>
   * <tr><td>SelectionVariant.SELECT_OPTION_WITHOUT_PROPERTY_NAME</td><td>Indicates that a selection option has been defined, but the Ranges definition is missing</td></tr>
   * <tr><td>SelectionVariant.SELECT_OPTION_RANGES_NOT_ARRAY</td><td>Indicates that the Ranges definition is not an array</td></tr>
   * </table>
   * These exceptions can only be thrown if the parameter <code>vSelectionVariant</code> has been provided.
   */
  let SelectionVariant = /*#__PURE__*/function (_BaseObject) {
    _inheritsLoose(SelectionVariant, _BaseObject);
    /**
     * Creates an instance of a selection variant based on the optional serialized input.
     *
     * @param selectionVariant Serialized selection variant as string or object.
     */
    function SelectionVariant(selectionVariant) {
      var _this;
      _this = _BaseObject.call(this) || this;
      _this.id = "";
      _this.parameters = {};
      _this.selectOptions = {};
      if (selectionVariant !== undefined) {
        if (typeof selectionVariant === "string") {
          _this.parseFromString(selectionVariant);
        } else if (typeof selectionVariant === "object") {
          _this.parseFromObject(selectionVariant);
        } else {
          throw new NavError("SelectionVariant.INVALID_INPUT_TYPE");
        }
      }
      return _this;
    }

    /**
     * Returns the identification of the selection variant.
     *
     * @public
     * @function getID
     * @memberof sap.fe.navigation.SelectionVariant.prototype
     * @returns {string} The identification of the selection variant as made available during construction
     */
    _exports.SelectionVariant = SelectionVariant;
    var _proto = SelectionVariant.prototype;
    _proto.getID = function getID() {
      return this.id;
    }

    /**
     * Sets the identification of the selection variant.
     *
     * @param id The new identification of the selection variant
     * @public
     */;
    _proto.setID = function setID(id) {
      this.id = id;
    }

    /**
     * Sets the text / description of the selection variant.
     *
     * @param newText The new description to be used
     * @public
     * @throws An instance of {@link sap.fe.navigation.NavError} in case of input errors. Valid error codes are:
     * <table>
     * <tr><th>NavError code</th><th>Description</th></tr>
     * <tr><td>PresentationVariant.INVALID_INPUT_TYPE</td><td>Indicates that an input parameter has an invalid type</td></tr>
     * </table>
     */;
    _proto.setText = function setText(newText) {
      if (typeof newText !== "string") {
        throw new NavError("PresentationVariant.INVALID_INPUT_TYPE");
      }
      this.text = newText;
    }

    /**
     * Returns the current text / description of this selection variant.
     *
     * @returns The current description of this selection variant.
     * @public
     */;
    _proto.getText = function getText() {
      return this.text;
    }

    /**
     * Sets the context URL intended for the parameters.
     *
     * @param sURL The URL of the parameter context
     * @public
     * @throws An instance of {@link sap.fe.navigation.NavError} in case of input errors. Valid error codes are:
     * <table>
     * <tr><th>NavError code</th><th>Description</th></tr>
     * <tr><td>SelectionVariant.INVALID_INPUT_TYPE</td><td>Indicates that an input parameter has an invalid type</td></tr>
     * </table>
     */;
    _proto.setParameterContextUrl = function setParameterContextUrl(sURL) {
      if (typeof sURL !== "string") {
        throw new NavError("SelectionVariant.INVALID_INPUT_TYPE");
      }
      this.parameterCtxUrl = sURL;
    }

    /**
     * Gets the current context URL intended for the parameters.
     *
     * @returns The current context URL for the parameters
     * @public
     */;
    _proto.getParameterContextUrl = function getParameterContextUrl() {
      return this.parameterCtxUrl;
    }

    /**
     * Gets the current context URL intended for the filters.
     *
     * @returns The current context URL for the filters
     * @public
     */;
    _proto.getFilterContextUrl = function getFilterContextUrl() {
      return this.filterCtxUrl;
    }

    /**
     * Sets the context URL intended for the filters.
     *
     * @param sURL The URL of the filters
     * @public
     * @throws An instance of {@link sap.fe.navigation.NavError} in case of input errors. Valid error codes are:
     * <table>
     * <tr><th>NavError code</th><th>Description</th></tr>
     * <tr><td>SelectionVariant.INVALID_INPUT_TYPE</td><td>Indicates that an input parameter has an invalid type</td></tr>
     * </table>
     */;
    _proto.setFilterContextUrl = function setFilterContextUrl(sURL) {
      if (typeof sURL !== "string") {
        throw new NavError("SelectionVariant.INVALID_INPUT_TYPE");
      }
      this.filterCtxUrl = sURL;
    }
    /**
     * Sets the value of a parameter called <code>sName</code> to the new value <code>sValue</code>.
     * If the parameter has already been set before, its value is overwritten.
     *
     * @param sName The name of the parameter to be set; the <code>null</code> value is not allowed
     * @param sValue The value of the parameter to be set
     * @returns This instance to allow method chaining
     * @public
     * @throws An instance of {@link sap.fe.navigation.NavError} in case of input errors. Valid error codes are:
     * <table>
     * <tr><th>NavError code</th><th>Description</th></tr>
     * <tr><td>SelectionVariant.PARAMETER_WITHOUT_NAME</td><td>Indicates that the name of the parameter has not been specified</td></tr>
     * <tr><td>SelectionVariant.INVALID_INPUT_TYPE</td><td>Indicates that an input parameter has an invalid type or the value is set to <code>null</code></td></tr>
     * <tr><td>SelectionVariant.PARAMETER_SELOPT_COLLISION</td><td>Indicates that another SelectOption with the same name as the parameter already exists</td></tr>
     * </table>
     */;
    _proto.addParameter = function addParameter(sName, sValue) {
      /*
       *  {string} sName The name of the parameter to be set; the <code>null</code> value is not allowed
       * (see specification "Selection Variants for UI Navigation in Fiori", section 2.4.2.1)
       */
      if (typeof sName !== "string") {
        throw new NavError("SelectionVariant.INVALID_INPUT_TYPE");
      }
      if (typeof sValue !== "string") {
        throw new NavError("SelectionVariant.INVALID_INPUT_TYPE");
      }
      if (sName === "") {
        throw new NavError("SelectionVariant.PARAMETER_WITHOUT_NAME");
      }
      if (this.selectOptions[sName]) {
        throw new NavError("SelectionVariant.PARAMETER_SELOPT_COLLISION");
      }
      this.parameters[sName] = sValue;
      return this;
    }

    /**
     * Removes a parameter called <code>sName</code> from the selection variant.
     *
     * @param sName The name of the parameter to be removed
     * @returns This instance to allow method chaining
     * @public
     * @throws An instance of {@link sap.fe.navigation.NavError} in case of input errors. Valid error codes are:
     * <table>
     * <tr><th>NavError code</th><th>Description</th></tr>
     * <tr><td>SelectionVariant.PARAMETER_WITHOUT_NAME</td><td>Indicates that name of the parameter has not been specified</td></tr>
     * <tr><td>SelectionVariant.INVALID_INPUT_TYPE</td><td>Indicates that an input parameter has an invalid type</td></tr>
     * </table>
     */;
    _proto.removeParameter = function removeParameter(sName) {
      if (typeof sName !== "string") {
        throw new NavError("SelectionVariant.INVALID_INPUT_TYPE");
      }
      if (sName === "") {
        throw new NavError("SelectionVariant.PARAMETER_WITHOUT_NAME");
      }
      delete this.parameters[sName];
      return this;
    }

    /**
     * Renames a parameter called <code>sNameOld</code> to <code>sNameNew</code>. If a parameter or a select option with
     * the name <code>sNameNew</code> already exist, an error is thrown. If a parameter with the name <code>sNameOld</code>
     * does not exist, nothing is changed.
     *
     * @param sNameOld The current name of the parameter to be renamed
     * @param sNameNew The new name of the parameter
     * @returns This instance to allow method chaining
     * @public
     * @throws An instance of {@link sap.fe.navigation.NavError} in case of input errors. Valid error codes are:
     * <table>
     * <tr><th>NavError code</th><th>Description</th></tr>
     * <tr><td>SelectionVariant.PARAMETER_WITHOUT_NAME</td><td>Indicates that the name of a parameter has not been specified</td></tr>
     * <tr><td>SelectionVariant.INVALID_INPUT_TYPE</td><td>Indicates that an input parameter has an invalid type</td></tr>
     * <tr><td>SelectionVariant.PARAMETER_SELOPT_COLLISION</td><td>Indicates that another select option with the same new name already exists</td></tr>
     * <tr><td>SelectionVariant.PARAMETER_COLLISION</td><td>Indicates that another parameter with the same new name already exists</td></tr>
     * </table>
     */;
    _proto.renameParameter = function renameParameter(sNameOld, sNameNew) {
      if (typeof sNameOld !== "string" || typeof sNameNew !== "string") {
        throw new NavError("SelectionVariant.INVALID_INPUT_TYPE");
      }
      if (sNameOld === "" || sNameNew === "") {
        throw new NavError("SelectionVariant.PARAMETER_WITHOUT_NAME");
      }
      if (this.parameters[sNameOld] !== undefined) {
        if (this.selectOptions[sNameNew]) {
          throw new NavError("SelectionVariant.PARAMETER_SELOPT_COLLISION");
        }
        if (this.parameters[sNameNew]) {
          throw new NavError("SelectionVariant.PARAMETER_COLLISION");
        }
        this.parameters[sNameNew] = this.parameters[sNameOld];
        delete this.parameters[sNameOld];
      }
      return this;
    }

    /**
     * Returns the value of the parameter called <code>sName</code> if it has been set.
     * If the parameter has never been set or has been removed, <code>undefined</code> is returned.
     *
     * @param sName The name of the parameter to be returned
     * @returns The value of parameter <code>sName</code>; returning the value <code>null</code> not possible
     * @public
     * @throws An instance of {@link sap.fe.navigation.NavError} in case of input errors. Valid error codes are:
     * <table>
     * <tr><th>NavError code</th><th>Description</th></tr>
     * <tr><td>SelectionVariant.INVALID_INPUT_TYPE</td><td>Indicates that an input parameter has an invalid type</td></tr>
     * </table>
     */;
    _proto.getParameter = function getParameter(sName) {
      if (typeof sName !== "string") {
        throw new NavError("SelectionVariant.INVALID_INPUT_TYPE");
      }
      return this.parameters[sName];
    }

    /**
     * Returns the set of parameter names available in this selection variant.
     *
     * @returns The list of parameter names which are valid
     * @public
     */;
    _proto.getParameterNames = function getParameterNames() {
      return Object.keys(this.parameters);
    }

    /**
     * Adds a new range to the list of select options for a given parameter.
     *
     * @param sPropertyName The name of the property for which the selection range is added
     * @param sSign The sign of the range (<b>I</b>nclude or <b>E</b>xclude)
     * @param sOption The option of the range (<b>EQ</b> for "equals", <b>NE</b> for "not equals",
     * <b>LE</b> for "less or equals", <b>GE</b> for "greater or equals", <b>LT</b> for "less than" (and not equals),
     * <b>GT</b> for "greater than" (and not equals), <b>BT</b> for "between", or <b>CP</b> for "contains pattern"
     * (ABAP-styled pattern matching with the asterisk as wildcard)
     * @param sLow The single value or the lower boundary of the interval; the <code>null</code> value is not allowed
     * @param sHigh Set only if sOption is <b>BT</b>: the upper boundary of the interval;
     * @param sText Text representing the SelectOption. This is an optional parameter. For an example in most Fiori applications if the text is not provided, it is fetched based on the ID.
     * must be <code>undefined</code> or <code>null</code> in all other cases
     * @param semanticDates Object containing semanticDates filter information
     * @returns This instance to allow method chaining.
     * @public
     * @throws An instance of {@link sap.fe.navigation.NavError} in case of input errors. Valid error codes are:
     * <table>
     * <tr><th>NavError code</th><th>Description</th></tr>
     * <tr><td>SelectionVariant.INVALID_SIGN</td><td>Indicates that the 'sign' is an invalid expression</td></tr>
     * <tr><td>SelectionVariant.INVALID_OPTION</td><td>Indicates that the option is an invalid expression</td></tr>
     * <tr><td>SelectionVariant.HIGH_PROVIDED_THOUGH_NOT_ALLOWED</td><td>Indicates that the upper boundary has been specified, even though the option is not 'BT'</td></tr>
     * <tr><td>SelectionVariant.INVALID_INPUT_TYPE</td><td>Indicates that an input parameter has an invalid type or the value is set to <code>null</code></td></tr>
     * <tr><td>SelectionVariant.INVALID_PROPERTY_NAME</td><td>Indicates that the property name is invalid, for example if it has not been specified</td></tr>
     * <tr><td>SelectionVariant.PARAMETER_SELOPT_COLLISION</td><td>Indicates that another parameter with the same name as the property name already exists</td></tr>
     * </table>
     */;
    _proto.addSelectOption = function addSelectOption(sPropertyName, sSign, sOption, sLow, sHigh, sText, semanticDates) {
      /* {string} sLow The single value or the lower boundary of the interval; the <code>null</code> value is not allowed
       * (see specification "Selection Variants for UI Navigation in Fiori", section 2.4.2.1)
       */
      if (typeof sPropertyName !== "string") {
        throw new NavError("SelectionVariant.INVALID_INPUT_TYPE");
      }
      if (sPropertyName === "") {
        throw new NavError("SelectionVariant.INVALID_PROPERTY_NAME");
      }
      if (typeof sSign !== "string") {
        throw new NavError("SelectionVariant.INVALID_INPUT_TYPE");
      }
      if (typeof sOption !== "string") {
        throw new NavError("SelectionVariant.INVALID_INPUT_TYPE");
      }
      if (typeof sLow !== "string") {
        throw new NavError("SelectionVariant.INVALID_INPUT_TYPE");
      }
      if (sOption === "BT" && typeof sHigh !== "string") {
        throw new NavError("SelectionVariant.INVALID_INPUT_TYPE");
      }
      if (!VALIDATE_SIGN.test(sSign.toUpperCase())) {
        throw new NavError("SelectionVariant.INVALID_SIGN");
      }
      if (!VALIDATE_OPTION.test(sOption.toUpperCase())) {
        throw new NavError("SelectionVariant.INVALID_OPTION");
      }
      if (this.parameters[sPropertyName]) {
        throw new NavError("SelectionVariant.PARAMETER_SELOPT_COLLISION");
      }
      if (sOption !== "BT") {
        // only "Between" has two parameters; for all others, sHigh may not be filled
        if (sHigh !== undefined && sHigh !== "" && sHigh !== null) {
          throw new NavError("SelectionVariant.HIGH_PROVIDED_THOUGH_NOT_ALLOWED");
        }
      }

      // check, if there's already an entry for this property
      if (this.selectOptions[sPropertyName] === undefined) {
        // if not, create a new set of entries
        this.selectOptions[sPropertyName] = [];
      }
      const oEntry = {
        Sign: sSign.toUpperCase(),
        Option: sOption.toUpperCase(),
        Low: sLow
      };
      if (sText) {
        // Add Text property only in case it is passed by the consumer of the API.
        // Otherwise keep the structure as is.
        oEntry.Text = sText;
      }
      if (sOption === "BT") {
        oEntry.High = sHigh;
      } else {
        oEntry.High = null; // Note this special case in the specification!
        // The specification requires that the "High" attribute is always
        // available. In case that no high value is necessary, yet the value
        // may not be empty, but needs to be set to "null"
      }

      if (semanticDates) {
        // Add SemanticDate property only in case it is passed, Otherwise keep the structure as is.
        oEntry.SemanticDates = semanticDates;
      }

      //check if it is necessary to add select option
      for (let i = 0; i < this.selectOptions[sPropertyName].length; i++) {
        const oExistingEntry = this.selectOptions[sPropertyName][i];
        if (oExistingEntry.Sign === oEntry.Sign && oExistingEntry.Option === oEntry.Option && oExistingEntry.Low === oEntry.Low && oExistingEntry.High === oEntry.High) {
          return this;
        }
      }
      this.selectOptions[sPropertyName].push(oEntry);
      return this;
    }

    /**
     * Removes a select option called <code>sName</code> from the selection variant.
     *
     * @param sName The name of the select option to be removed
     * @returns This instance to allow method chaining.
     * @public
     * @throws An instance of {@link sap.fe.navigation.NavError} in case of input errors. Valid error codes are:
     * <table>
     * <tr><th>NavError code</th><th>Description</th></tr>
     * <tr><td>SelectionVariant.SELOPT_WITHOUT_NAME</td><td>Indicates that name of the select option has not been specified</td></tr>
     * <tr><td>SelectionVariant.SELOPT_WRONG_TYPE</td><td>Indicates that the name of the parameter <code>sName</code> has an invalid type</td></tr>
     * </table>
     */;
    _proto.removeSelectOption = function removeSelectOption(sName) {
      if (typeof sName !== "string") {
        throw new NavError("SelectionVariant.SELOPT_WRONG_TYPE");
      }
      if (sName === "") {
        throw new NavError("SelectionVariant.SELOPT_WITHOUT_NAME");
      }
      delete this.selectOptions[sName];
      return this;
    }

    /**
     * Renames a select option called <code>sNameOld</code> to <code>sNameNew</code>. If a select option or a parameter
     * with the name <code>sNameNew</code> already exist, an error is thrown. If a select option with the name <code>sNameOld</code>
     * does not exist, nothing is changed.
     *
     * @param sNameOld The current name of the select option property to be renamed
     * @param sNameNew The new name of the select option property
     * @returns This instance to allow method chaining
     * @public
     * @throws An instance of {@link sap.fe.navigation.NavError} in case of input errors. Valid error codes are:
     * <table>
     * <tr><th>NavError code</th><th>Description</th></tr>
     * <tr><td>SelectionVariant.SELOPT_WITHOUT_NAME</td><td>Indicates that the name of a select option has not been specified</td></tr>
     * <tr><td>SelectionVariant.SELOPT_WRONG_TYPE</td><td>Indicates that a select option has an invalid type</td></tr>
     * <tr><td>SelectionVariant.PARAMETER_SELOPT_COLLISION</td><td>Indicates that another parameter with the same new name already exists</td></tr>
     * <tr><td>SelectionVariant.SELOPT_COLLISION</td><td>Indicates that another select option with the same new name already exists</td></tr>
     * </table>
     */;
    _proto.renameSelectOption = function renameSelectOption(sNameOld, sNameNew) {
      if (typeof sNameOld !== "string" || typeof sNameNew !== "string") {
        throw new NavError("SelectionVariant.SELOPT_WRONG_TYPE");
      }
      if (sNameOld === "" || sNameNew === "") {
        throw new NavError("SelectionVariant.SELOPT_WITHOUT_NAME");
      }
      if (this.selectOptions[sNameOld] !== undefined) {
        if (this.selectOptions[sNameNew]) {
          throw new NavError("SelectionVariant.SELOPT_COLLISION");
        }
        if (this.parameters[sNameNew]) {
          throw new NavError("SelectionVariant.PARAMETER_SELOPT_COLLISION");
        }
        this.selectOptions[sNameNew] = this.selectOptions[sNameOld];
        delete this.selectOptions[sNameOld];
      }
      return this;
    }

    /**
     * Returns the set of select options/ranges available for a given property name.
     *
     * @param sPropertyName The name of the property for which the set of select options/ranges is returned
     * @returns If <code>sPropertyName</code> is an invalid name of a property or no range exists, <code>undefined</code>
     * is returned; otherwise, an immutable array of ranges is returned. Each entry of the array is an object with the
     * following properties:
     * <ul>
     * <li><code>Sign</code>: The sign of the range</li>
     * <li><code>Option</code>: The option of the range</li>
     * <li><code>Low</code>: The low value of the range; returning value <code>null</code> is not possible</li>
     * <li><code>High</code>: The high value of the range; if this value is not necessary, <code>null</code> is used</li>
     * </ul>
     * For further information about the meaning of the attributes, refer to method <code>addSelectOption</code>.
     * @public
     * @throws An instance of {@link sap.fe.navigation.NavError} in case of input errors. Valid error codes are:
     * <table>
     * <tr><th>NavError code</th><th>Description</th></tr>
     * <tr><td>SelectionVariant.INVALID_INPUT_TYPE</td><td>Indicates that an input parameter has an invalid type</td></tr>
     * <tr><td>SelectionVariant.INVALID_PROPERTY_NAME</td><td>Indicates that the property name is invalid, for example, it has not been specified</td></tr>
     * </table>
     */;
    _proto.getSelectOption = function getSelectOption(sPropertyName) {
      if (typeof sPropertyName !== "string") {
        throw new NavError("SelectionVariant.INVALID_INPUT_TYPE");
      }
      if (sPropertyName === "") {
        throw new NavError("SelectionVariant.INVALID_PROPERTY_NAME");
      }
      const oEntries = this.selectOptions[sPropertyName];
      if (!oEntries) {
        return undefined;
      }
      return JSON.parse(JSON.stringify(oEntries)); // create an immutable clone of data to prevent obfuscation by caller.
    }

    /**
     * Returns the names of the properties available for this instance.
     *
     * @returns The list of property names available for this instance
     * @public
     */;
    _proto.getSelectOptionsPropertyNames = function getSelectOptionsPropertyNames() {
      return Object.keys(this.selectOptions);
    }

    /**
     * Returns the names of the parameter and select option properties available for this instance.
     *
     * @returns The list of parameter and select option property names available for this instance
     * @public
     */;
    _proto.getPropertyNames = function getPropertyNames() {
      return this.getParameterNames().concat(this.getSelectOptionsPropertyNames());
    }

    /**
     * Adds a set of select options to the list of select options for a given parameter.
     *
     * @param sPropertyName The name of the property for which the set of select options is added
     * @param aSelectOptions Set of select options to be added
     * @returns This instance to allow method chaining
     * @throws An instance of {@link sap.fe.navigation.NavError} in case of input errors. Valid error codes are:
     * <table>
     * <tr><th>NavError code</th><th>Description</th></tr>
     * <tr><td>SelectionVariant.INVALID_INPUT_TYPE</td><td>Indicates that an input parameter has an invalid type</td></tr>
     * </table>
     * @public
     */;
    _proto.massAddSelectOption = function massAddSelectOption(sPropertyName, aSelectOptions) {
      if (!Array.isArray(aSelectOptions)) {
        throw new NavError("SelectionVariant.INVALID_INPUT_TYPE");
      }
      for (let i = 0; i < aSelectOptions.length; i++) {
        const oSelectOption = aSelectOptions[i];
        this.addSelectOption(sPropertyName, oSelectOption.Sign, oSelectOption.Option, oSelectOption.Low, oSelectOption.High, oSelectOption.Text, oSelectOption.SemanticDates);
      }
      return this;
    }

    /**
     * First tries to retrieve the set of select options or ranges available for <code>sName</code> as the property name. If successful,
     * this array of selections is returned. If it fails, an attempt to find a parameter with the name <code>sName</code> is used. If the latter succeeds, the single value is converted to fit into an array of selections to make it
     * type compatible with ranges. This array is then returned. <br />
     * If neither a select option nor a parameter could be found, <code>undefined</code> is returned.
     *
     * @param sName The name of the attribute for which the value is retrieved
     * @returns The ranges in the select options for the specified property or a range-converted representation of a parameter is returned.
     * If both lookups fail, <code>undefined</code> is returned. <br />
     * The returned ranges have the format:
     * <ul>
     * <li><code>Sign</code>: The sign of the range</li>
     * <li><code>Option</code>: The option of the range</li>
     * <li><code>Low</code>: The low value of the range; returning the value <code>null</code> is not possible</li>
     * <li><code>High</code>: The high value of the range; if this value is not necessary, <code>null</code> (but does exist)</li>
     * </ul>
     * For further information on the meaning of the attributes, refer to method {@link #.addSelectOption addSelectOption}.
     * @public
     * @throws An instance of {@link sap.fe.navigation.NavError} in case of input errors. Valid error codes are:
     * <table>
     * <tr><th>NavError code</th><th>Description</th></tr>
     * <tr><td>SelectionVariant.INVALID_INPUT_TYPE</td><td>Indicates that an input parameter has an invalid type</td></tr>
     * <tr><td>SelectionVariant.INVALID_PROPERTY_NAME</td><td>Indicates that the property name is invalid, for example, it has not been specified</td></tr>
     * </table>
     */;
    _proto.getValue = function getValue(sName) {
      let aValue = this.getSelectOption(sName);
      if (aValue !== undefined) {
        // a range for the selection option is provided; so this is the leading one
        return aValue;
      }
      const sParamValue = this.getParameter(sName);
      if (sParamValue !== undefined) {
        // a parameter value has been provided; we need to convert it to the range format
        aValue = [{
          Sign: "I",
          Option: "EQ",
          Low: sParamValue,
          High: null
        }];
        return aValue;
      }
      return undefined;
    }

    /**
     * Returns <code>true</code> if the selection variant does neither contain parameters
     * nor ranges.
     *
     * @returns If set to <code>true</code>  there are no parameters and no select options available in
     * the selection variant; <code>false</code> otherwise.
     * @public
     */;
    _proto.isEmpty = function isEmpty() {
      return this.getParameterNames().length === 0 && this.getSelectOptionsPropertyNames().length === 0;
    }

    /**
     * Returns the external representation of the selection variant as JSON object.
     *
     * @returns The external representation of this instance as a JSON object
     * @public
     */;
    _proto.toJSONObject = function toJSONObject() {
      const oExternalSelectionVariant = {
        Version: {
          // Version attributes are not part of the official specification,
          Major: "1",
          // but could be helpful later for implementing a proper lifecycle/interoperability
          Minor: "0",
          Patch: "0"
        },
        SelectionVariantID: this.id
      };
      if (this.parameterCtxUrl) {
        oExternalSelectionVariant.ParameterContextUrl = this.parameterCtxUrl;
      }
      if (this.filterCtxUrl) {
        oExternalSelectionVariant.FilterContextUrl = this.filterCtxUrl;
      }
      if (this.text) {
        oExternalSelectionVariant.Text = this.text;
      } else {
        oExternalSelectionVariant.Text = "Selection Variant with ID " + this.id;
      }
      this.determineODataFilterExpression(oExternalSelectionVariant);
      this.serializeParameters(oExternalSelectionVariant);
      this.serializeSelectOptions(oExternalSelectionVariant);
      return oExternalSelectionVariant;
    }

    /**
     * Serializes this instance into a JSON-formatted string.
     *
     * @returns The JSON-formatted representation of this instance in stringified format
     * @public
     */;
    _proto.toJSONString = function toJSONString() {
      return JSON.stringify(this.toJSONObject());
    };
    _proto.determineODataFilterExpression = function determineODataFilterExpression(oExternalSelectionVariant) {
      // TODO - specification does not indicate what is expected here in detail
      oExternalSelectionVariant.ODataFilterExpression = ""; // not supported yet - it's allowed to be optional
    };
    _proto.serializeParameters = function serializeParameters(oExternalSelectionVariant) {
      // Note: Parameters section is optional (see specification section 2.4.2.1)
      oExternalSelectionVariant.Parameters = [];
      for (const name in this.parameters) {
        oExternalSelectionVariant.Parameters.push({
          PropertyName: name,
          PropertyValue: this.parameters[name]
        });
      }
    };
    _proto.serializeSelectOptions = function serializeSelectOptions(oExternalSelectionVariant) {
      if (this.selectOptions.length === 0) {
        return;
      }
      oExternalSelectionVariant.SelectOptions = [];
      each(this.selectOptions, function (sPropertyName, aEntries) {
        const oSelectOption = {
          PropertyName: sPropertyName,
          Ranges: aEntries
        };
        oExternalSelectionVariant.SelectOptions.push(oSelectOption);
      });
    };
    _proto.parseFromString = function parseFromString(sJSONString) {
      if (sJSONString === undefined) {
        throw new NavError("SelectionVariant.UNABLE_TO_PARSE_INPUT");
      }
      if (typeof sJSONString !== "string") {
        throw new NavError("SelectionVariant.INVALID_INPUT_TYPE");
      }
      const oInput = JSON.parse(sJSONString);
      // the input needs to be an JSON string by specification

      this.parseFromObject(oInput);
    };
    _proto.parseFromObject = function parseFromObject(oInput) {
      if (!oInput) {
        oInput = {};
      }
      if (oInput.SelectionVariantID === undefined) {
        // Do not throw an error, but only write a warning into the log.
        // The SelectionVariantID is mandatory according to the specification document version 1.0,
        // but this document is not a universally valid standard.
        // It is said that the "implementation of the SmartFilterBar" may supersede the specification.
        // Thus, also allow an initial SelectionVariantID.
        //		throw new sap.fe.navigation.NavError("SelectionVariant.INPUT_DOES_NOT_CONTAIN_SELECTIONVARIANT_ID");
        Log.warning("SelectionVariantID is not defined");
        oInput.SelectionVariantID = "";
      }
      this.setID(oInput.SelectionVariantID);
      if (oInput.ParameterContextUrl !== undefined && oInput.ParameterContextUrl !== "") {
        this.setParameterContextUrl(oInput.ParameterContextUrl);
      }
      if (oInput.FilterContextUrl !== undefined && oInput.FilterContextUrl !== "") {
        this.setFilterContextUrl(oInput.FilterContextUrl);
      }
      if (oInput.Text !== undefined) {
        this.setText(oInput.Text);
      }

      // note that ODataFilterExpression is ignored right now - not supported yet!

      if (oInput.Parameters) {
        this.parseFromStringParameters(oInput.Parameters);
      }
      if (oInput.SelectOptions) {
        this.parseFromStringSelectOptions(oInput.SelectOptions);
      }
    };
    _proto.parseFromStringParameters = function parseFromStringParameters(parameters) {
      for (const parameter of parameters) {
        this.addParameter(parameter.PropertyName, parameter.PropertyValue);
      }
    };
    _proto.parseFromStringSelectOptions = function parseFromStringSelectOptions(selectOptions) {
      for (const option of selectOptions) {
        if (option.Ranges) {
          if (!Array.isArray(option.Ranges)) {
            throw new NavError("SelectionVariant.SELECT_OPTION_RANGES_NOT_ARRAY");
          }
          for (const range of option.Ranges) {
            this.addSelectOption(option.PropertyName, range.Sign, range.Option, range.Low, range.High, range.Text, range.SemanticDates);
          }
        } else {
          Log.warning("Select Option object does not contain a Ranges entry; ignoring entry");
        }
      }
    };
    return SelectionVariant;
  }(BaseObject); // Exporting the class as properly typed UI5Class
  _exports.SelectionVariant = SelectionVariant;
  const UI5Class = BaseObject.extend("sap.fe.navigation.SelectionVariant", SelectionVariant.prototype);
  return UI5Class;
}, false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/navigation/SelectionVariant", ["sap/base/Log","sap/base/util/each","sap/ui/base/Object","./NavError"],function(t,e,i,n){"use strict";var r={};function o(t,e){t.prototype=Object.create(e.prototype);t.prototype.constructor=t;s(t,e)}function s(t,e){s=Object.setPrototypeOf?Object.setPrototypeOf.bind():function t(e,i){e.__proto__=i;return e};return s(t,e)}const a=new RegExp("[E|I]");const c=new RegExp("EQ|NE|LE|GE|LT|GT|BT|CP");let f=function(i){o(s,i);function s(t){var e;e=i.call(this)||this;e.id="";e.parameters={};e.selectOptions={};if(t!==undefined){if(typeof t==="string"){e.parseFromString(t)}else if(typeof t==="object"){e.parseFromObject(t)}else{throw new n("SelectionVariant.INVALID_INPUT_TYPE")}}return e}r.SelectionVariant=s;var f=s.prototype;f.getID=function t(){return this.id};f.setID=function t(e){this.id=e};f.setText=function t(e){if(typeof e!=="string"){throw new n("PresentationVariant.INVALID_INPUT_TYPE")}this.text=e};f.getText=function t(){return this.text};f.setParameterContextUrl=function t(e){if(typeof e!=="string"){throw new n("SelectionVariant.INVALID_INPUT_TYPE")}this.parameterCtxUrl=e};f.getParameterContextUrl=function t(){return this.parameterCtxUrl};f.getFilterContextUrl=function t(){return this.filterCtxUrl};f.setFilterContextUrl=function t(e){if(typeof e!=="string"){throw new n("SelectionVariant.INVALID_INPUT_TYPE")}this.filterCtxUrl=e};f.addParameter=function t(e,i){if(typeof e!=="string"){throw new n("SelectionVariant.INVALID_INPUT_TYPE")}if(typeof i!=="string"){throw new n("SelectionVariant.INVALID_INPUT_TYPE")}if(e===""){throw new n("SelectionVariant.PARAMETER_WITHOUT_NAME")}if(this.selectOptions[e]){throw new n("SelectionVariant.PARAMETER_SELOPT_COLLISION")}this.parameters[e]=i;return this};f.removeParameter=function t(e){if(typeof e!=="string"){throw new n("SelectionVariant.INVALID_INPUT_TYPE")}if(e===""){throw new n("SelectionVariant.PARAMETER_WITHOUT_NAME")}delete this.parameters[e];return this};f.renameParameter=function t(e,i){if(typeof e!=="string"||typeof i!=="string"){throw new n("SelectionVariant.INVALID_INPUT_TYPE")}if(e===""||i===""){throw new n("SelectionVariant.PARAMETER_WITHOUT_NAME")}if(this.parameters[e]!==undefined){if(this.selectOptions[i]){throw new n("SelectionVariant.PARAMETER_SELOPT_COLLISION")}if(this.parameters[i]){throw new n("SelectionVariant.PARAMETER_COLLISION")}this.parameters[i]=this.parameters[e];delete this.parameters[e]}return this};f.getParameter=function t(e){if(typeof e!=="string"){throw new n("SelectionVariant.INVALID_INPUT_TYPE")}return this.parameters[e]};f.getParameterNames=function t(){return Object.keys(this.parameters)};f.addSelectOption=function t(e,i,r,o,s,f,l){if(typeof e!=="string"){throw new n("SelectionVariant.INVALID_INPUT_TYPE")}if(e===""){throw new n("SelectionVariant.INVALID_PROPERTY_NAME")}if(typeof i!=="string"){throw new n("SelectionVariant.INVALID_INPUT_TYPE")}if(typeof r!=="string"){throw new n("SelectionVariant.INVALID_INPUT_TYPE")}if(typeof o!=="string"){throw new n("SelectionVariant.INVALID_INPUT_TYPE")}if(r==="BT"&&typeof s!=="string"){throw new n("SelectionVariant.INVALID_INPUT_TYPE")}if(!a.test(i.toUpperCase())){throw new n("SelectionVariant.INVALID_SIGN")}if(!c.test(r.toUpperCase())){throw new n("SelectionVariant.INVALID_OPTION")}if(this.parameters[e]){throw new n("SelectionVariant.PARAMETER_SELOPT_COLLISION")}if(r!=="BT"){if(s!==undefined&&s!==""&&s!==null){throw new n("SelectionVariant.HIGH_PROVIDED_THOUGH_NOT_ALLOWED")}}if(this.selectOptions[e]===undefined){this.selectOptions[e]=[]}const p={Sign:i.toUpperCase(),Option:r.toUpperCase(),Low:o};if(f){p.Text=f}if(r==="BT"){p.High=s}else{p.High=null}if(l){p.SemanticDates=l}for(let t=0;t<this.selectOptions[e].length;t++){const i=this.selectOptions[e][t];if(i.Sign===p.Sign&&i.Option===p.Option&&i.Low===p.Low&&i.High===p.High){return this}}this.selectOptions[e].push(p);return this};f.removeSelectOption=function t(e){if(typeof e!=="string"){throw new n("SelectionVariant.SELOPT_WRONG_TYPE")}if(e===""){throw new n("SelectionVariant.SELOPT_WITHOUT_NAME")}delete this.selectOptions[e];return this};f.renameSelectOption=function t(e,i){if(typeof e!=="string"||typeof i!=="string"){throw new n("SelectionVariant.SELOPT_WRONG_TYPE")}if(e===""||i===""){throw new n("SelectionVariant.SELOPT_WITHOUT_NAME")}if(this.selectOptions[e]!==undefined){if(this.selectOptions[i]){throw new n("SelectionVariant.SELOPT_COLLISION")}if(this.parameters[i]){throw new n("SelectionVariant.PARAMETER_SELOPT_COLLISION")}this.selectOptions[i]=this.selectOptions[e];delete this.selectOptions[e]}return this};f.getSelectOption=function t(e){if(typeof e!=="string"){throw new n("SelectionVariant.INVALID_INPUT_TYPE")}if(e===""){throw new n("SelectionVariant.INVALID_PROPERTY_NAME")}const i=this.selectOptions[e];if(!i){return undefined}return JSON.parse(JSON.stringify(i))};f.getSelectOptionsPropertyNames=function t(){return Object.keys(this.selectOptions)};f.getPropertyNames=function t(){return this.getParameterNames().concat(this.getSelectOptionsPropertyNames())};f.massAddSelectOption=function t(e,i){if(!Array.isArray(i)){throw new n("SelectionVariant.INVALID_INPUT_TYPE")}for(let t=0;t<i.length;t++){const n=i[t];this.addSelectOption(e,n.Sign,n.Option,n.Low,n.High,n.Text,n.SemanticDates)}return this};f.getValue=function t(e){let i=this.getSelectOption(e);if(i!==undefined){return i}const n=this.getParameter(e);if(n!==undefined){i=[{Sign:"I",Option:"EQ",Low:n,High:null}];return i}return undefined};f.isEmpty=function t(){return this.getParameterNames().length===0&&this.getSelectOptionsPropertyNames().length===0};f.toJSONObject=function t(){const e={Version:{Major:"1",Minor:"0",Patch:"0"},SelectionVariantID:this.id};if(this.parameterCtxUrl){e.ParameterContextUrl=this.parameterCtxUrl}if(this.filterCtxUrl){e.FilterContextUrl=this.filterCtxUrl}if(this.text){e.Text=this.text}else{e.Text="Selection Variant with ID "+this.id}this.determineODataFilterExpression(e);this.serializeParameters(e);this.serializeSelectOptions(e);return e};f.toJSONString=function t(){return JSON.stringify(this.toJSONObject())};f.determineODataFilterExpression=function t(e){e.ODataFilterExpression=""};f.serializeParameters=function t(e){e.Parameters=[];for(const t in this.parameters){e.Parameters.push({PropertyName:t,PropertyValue:this.parameters[t]})}};f.serializeSelectOptions=function t(i){if(this.selectOptions.length===0){return}i.SelectOptions=[];e(this.selectOptions,function(t,e){const n={PropertyName:t,Ranges:e};i.SelectOptions.push(n)})};f.parseFromString=function t(e){if(e===undefined){throw new n("SelectionVariant.UNABLE_TO_PARSE_INPUT")}if(typeof e!=="string"){throw new n("SelectionVariant.INVALID_INPUT_TYPE")}const i=JSON.parse(e);this.parseFromObject(i)};f.parseFromObject=function e(i){if(!i){i={}}if(i.SelectionVariantID===undefined){t.warning("SelectionVariantID is not defined");i.SelectionVariantID=""}this.setID(i.SelectionVariantID);if(i.ParameterContextUrl!==undefined&&i.ParameterContextUrl!==""){this.setParameterContextUrl(i.ParameterContextUrl)}if(i.FilterContextUrl!==undefined&&i.FilterContextUrl!==""){this.setFilterContextUrl(i.FilterContextUrl)}if(i.Text!==undefined){this.setText(i.Text)}if(i.Parameters){this.parseFromStringParameters(i.Parameters)}if(i.SelectOptions){this.parseFromStringSelectOptions(i.SelectOptions)}};f.parseFromStringParameters=function t(e){for(const t of e){this.addParameter(t.PropertyName,t.PropertyValue)}};f.parseFromStringSelectOptions=function e(i){for(const e of i){if(e.Ranges){if(!Array.isArray(e.Ranges)){throw new n("SelectionVariant.SELECT_OPTION_RANGES_NOT_ARRAY")}for(const t of e.Ranges){this.addSelectOption(e.PropertyName,t.Sign,t.Option,t.Low,t.High,t.Text,t.SemanticDates)}}else{t.warning("Select Option object does not contain a Ranges entry; ignoring entry")}}};return s}(i);r.SelectionVariant=f;const l=i.extend("sap.fe.navigation.SelectionVariant",f.prototype);return l},false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/navigation/library-dbg", ["sap/ui/core/Core", "sap/ui/core/library"], function (Core, _library) {
  "use strict";

  const ParamHandlingMode = {
    /**
     * The conflict resolution favors the SelectionVariant over URL parameters
     *
     * @public
     */
    SelVarWins: "SelVarWins",
    /**
     * The conflict resolution favors the URL parameters over the SelectionVariant. Caution: In case of cross-app navigation
     * a navigation parameter value from the source app is overwritten by a default, if a default is maintained in the launchpad
     * designer for this parameter in the target app!
     *
     * @public
     */
    URLParamWins: "URLParamWins",
    /**
     * The conflict resolution adds URL parameters to the SelectionVariant
     *
     * @public
     */
    InsertInSelOpt: "InsertInSelOpt"
  };
  const NavType = {
    /**
     * Initial startup without any navigation or default parameters
     *
     * @public
     */
    initial: "initial",
    /**
     * Basic cross-app navigation with URL parameters only (without sap-xapp-state) or initial start with default parameters
     *
     * @public
     */
    URLParams: "URLParams",
    /**
     * Cross-app navigation with sap-xapp-state parameter (and URL parameters), defaulted parameters may be added
     *
     * @public
     */
    xAppState: "xAppState",
    /**
     * Back navigation with sap-iapp-state parameter
     *
     * @public
     */
    iAppState: "iAppState"
  };
  const SuppressionBehavior = {
    /**
     * Standard suppression behavior: semantic attributes with a <code>null</code> or an <code>undefined</code> value are ignored,
     * the remaining attributes are mixed in to the selection variant
     *
     * @public
     */
    standard: 0,
    /**
     * Semantic attributes with an empty string are ignored, the remaining attributes are mixed in to the selection variant.
     * Warning! Consider the impact on Boolean variable values!
     *
     * @public
     */
    ignoreEmptyString: 1,
    /**
     * Semantic attributes with a <code>null</code> value lead to an {@link sap.fin.central.lib.error.Error error} of type NavigationHandler.INVALID_INPUT
     *
     * @public
     */
    raiseErrorOnNull: 2,
    /**
     * Semantic attributes with an <code>undefined</code> value lead to an {@link sap.fin.central.lib.error.Error error} of type NavigationHandler.INVALID_INPUT
     *
     * @public
     */
    raiseErrorOnUndefined: 4
  };
  const Mode = {
    /**
     * This is used for ODataV2 services to do some internal tasks like creation of appstate, removal of sensitive data etc.,
     *
     * @public
     */
    ODataV2: "ODataV2",
    /**
     * This is used for ODataV4 services to do some internal tasks like creation of appstate, removal of sensitive data etc.,
     *
     * @public
     */
    ODataV4: "ODataV4"
  };

  /**
   * Common library for all cross-application navigation functions.
   *
   * @public
   * @name sap.fe.navigation
   * @namespace
   * @since 1.83.0
   */
  const thisLib = Core.initLibrary({
    name: "sap.fe.navigation",
    // eslint-disable-next-line no-template-curly-in-string
    version: "1.111.1",
    dependencies: ["sap.ui.core"],
    types: ["sap.fe.navigation.NavType", "sap.fe.navigation.ParamHandlingMode", "sap.fe.navigation.SuppressionBehavior"],
    interfaces: [],
    controls: [],
    elements: [],
    noLibraryCSS: true
  });

  /**
   * This is the successor of {@link sap.ui.generic.app.navigation.service.ParamHandlingMode}.<br>
   * A static enumeration type which indicates the conflict resolution method when merging URL parameters into select options.
   *
   * @public
   * @name sap.fe.navigation.ParamHandlingMode
   * @enum {string}
   * @readonly
   * @since 1.83.0
   */
  thisLib.ParamHandlingMode = ParamHandlingMode;

  /**
   * This is the successor of {@link sap.ui.generic.app.navigation.service.NavType}.<br>
   * A static enumeration type which indicates the type of inbound navigation.
   *
   * @public
   * @name sap.fe.navigation.NavType
   * @enum {string}
   * @readonly
   * @since 1.83.0
   */
  thisLib.NavType = NavType;

  /**
   * This is the successor of {@link sap.ui.generic.app.navigation.service.SuppressionBehavior}.<br>
   * A static enumeration type which indicates whether semantic attributes with values <code>null</code>,
   * <code>undefined</code> or <code>""</code> (empty string) shall be suppressed, before they are mixed in to the selection variant in the
   * method {@link sap.fe.navigation.NavigationHandler.mixAttributesAndSelectionVariant mixAttributesAndSelectionVariant}
   * of the {@link sap.fe.navigation.NavigationHandler NavigationHandler}.
   *
   * @public
   * @name sap.fe.navigation.SuppressionBehavior
   * @enum {string}
   * @readonly
   * @since 1.83.0
   */
  thisLib.SuppressionBehavior = SuppressionBehavior;

  /**
   * A static enumeration type which indicates the Odata version used for runnning the Navigation Handler.
   *
   * @public
   * @name sap.fe.navigation.Mode
   * @enum {string}
   * @readonly
   * @since 1.83.0
   */
  thisLib.Mode = Mode;
  return thisLib;
}, false);
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.predefine("sap/fe/navigation/library", ["sap/ui/core/Core","sap/ui/core/library"],function(a,e){"use strict";const n={SelVarWins:"SelVarWins",URLParamWins:"URLParamWins",InsertInSelOpt:"InsertInSelOpt"};const i={initial:"initial",URLParams:"URLParams",xAppState:"xAppState",iAppState:"iAppState"};const r={standard:0,ignoreEmptyString:1,raiseErrorOnNull:2,raiseErrorOnUndefined:4};const t={ODataV2:"ODataV2",ODataV4:"ODataV4"};const s=a.initLibrary({name:"sap.fe.navigation",version:"1.111.1",dependencies:["sap.ui.core"],types:["sap.fe.navigation.NavType","sap.fe.navigation.ParamHandlingMode","sap.fe.navigation.SuppressionBehavior"],interfaces:[],controls:[],elements:[],noLibraryCSS:true});s.ParamHandlingMode=n;s.NavType=i;s.SuppressionBehavior=r;s.Mode=t;return s},false);
sap.ui.require.preload({
	"sap/fe/navigation/manifest.json":'{"_version":"1.21.0","sap.app":{"id":"sap.fe.navigation","type":"library","embeds":[],"applicationVersion":{"version":"1.111.1"},"title":"UI5 library: sap.fe.navigation","description":"UI5 library: sap.fe.navigation","ach":"CA-UI5-FE-NAV","resources":"resources.json","offline":true},"sap.ui":{"technology":"UI5","supportedThemes":[]},"sap.ui5":{"dependencies":{"libs":{"sap.ui.core":{}}},"library":{"i18n":false,"content":{"controls":[],"elements":[],"types":[],"interfaces":[]}}}}'
});
//# sourceMappingURL=library-preload.js.map
