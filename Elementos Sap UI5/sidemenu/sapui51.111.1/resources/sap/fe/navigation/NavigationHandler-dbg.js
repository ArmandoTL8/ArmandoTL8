/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/assert", "sap/base/Log", "sap/base/util/extend", "sap/base/util/isEmptyObject", "sap/base/util/merge", "sap/ui/base/Object", "sap/ui/core/routing/HashChanger", "sap/ui/core/UIComponent", "sap/ui/thirdparty/URI", "sap/ui/util/openWindow", "./library", "./NavError", "./SelectionVariant"], function (assert, Log, extend, isEmptyObject, merge, BaseObject, HashChanger, UIComponent, URI, openWindow, NavLibrary, NavError, SelectionVariant) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOYXZUeXBlIiwiTmF2TGlicmFyeSIsIlBhcmFtSGFuZGxpbmdNb2RlIiwiU3VwcHJlc3Npb25CZWhhdmlvciIsIk1vZGUiLCJJQVBQX1NUQVRFIiwiREVGQVVMVEVEX1BBUkFNRVRFUl9QUk9QRVJUWSIsIk5hdmlnYXRpb25IYW5kbGVyIiwib0NvbnRyb2xsZXIiLCJzTW9kZSIsInNQYXJhbUhhbmRsaW5nTW9kZSIsIl9hVGVjaG5pY2FsUGFyYW1hdGVycyIsIl9vTGFzdFNhdmVkSW5uZXJBcHBEYXRhIiwic0FwcFN0YXRlS2V5Iiwib0FwcERhdGEiLCJpQ2FjaGVIaXQiLCJpQ2FjaGVNaXNzIiwiX3JJQXBwU3RhdGVPbGQiLCJSZWdFeHAiLCJfcklBcHBTdGF0ZU9sZEF0U3RhcnQiLCJfcklBcHBTdGF0ZU5ldyIsIk5hdkVycm9yIiwiVUlDb21wb25lbnQiLCJvUm91dGVyIiwiZ2V0Um91dGVyIiwib0NvbXBvbmVudCIsImdldE93bmVyQ29tcG9uZW50IiwiX2dldFJvdXRlciIsImdldEFwcENvbXBvbmVudCIsImdldENvbXBvbmVudERhdGEiLCJVUkxQYXJhbVdpbnMiLCJJbnNlcnRJblNlbE9wdCIsIlNlbFZhcldpbnMiLCJPRGF0YVYyIiwiX3NNb2RlIiwiX2dldEFwcE5hdmlnYXRpb25TZXJ2aWNlIiwic2FwIiwidXNoZWxsIiwiQ29udGFpbmVyIiwiZ2V0U2VydmljZSIsIl9nZXRBcHBOYXZpZ2F0aW9uU2VydmljZUFzeW5jIiwiZ2V0U2VydmljZUFzeW5jIiwidGhlbiIsIm9Dcm9zc0FwcE5hdlNlcnZpY2UiLCJjYXRjaCIsIkxvZyIsImVycm9yIiwiZ2V0Um91dGVyRm9yIiwicmVnaXN0ZXJOYXZpZ2F0ZUNhbGxiYWNrIiwiZm5DYWxsYmFjayIsIl9uYXZpZ2F0ZUNhbGxiYWNrIiwibmF2aWdhdGUiLCJzU2VtYW50aWNPYmplY3QiLCJzQWN0aW9uTmFtZSIsInZOYXZpZ2F0aW9uUGFyYW1ldGVycyIsIm9Jbm5lckFwcERhdGEiLCJmbk9uRXJyb3IiLCJvRXh0ZXJuYWxBcHBEYXRhIiwic05hdk1vZGUiLCJzU2VsZWN0aW9uVmFyaWFudCIsIm1QYXJhbWV0ZXJzIiwib1hBcHBEYXRhT2JqIiwib1N0YXJ0dXBQYXJhbWV0ZXJzIiwiYkV4UGxhY2UiLCJvVG1wRGF0YSIsIm9OYXZIYW5kbGVyIiwib0NvbXBvbmVudERhdGEiLCJzdGFydHVwUGFyYW1ldGVycyIsImxlbmd0aCIsInVuZGVmaW5lZCIsIm9FbnJpY2hlZFNlbFZhciIsIl9zcGxpdEluYm91bmROYXZpZ2F0aW9uUGFyYW1ldGVycyIsIlNlbGVjdGlvblZhcmlhbnQiLCJvTmF2aWdhdGlvblNlbFZhciIsInRvSlNPTlN0cmluZyIsInNlbGVjdGlvblZhcmlhbnQiLCJfcmVtb3ZlVGVjaG5pY2FsUGFyYW1ldGVycyIsInRvSlNPTk9iamVjdCIsIl9yZW1vdmVNZWFzdXJlQmFzZWRJbmZvcm1hdGlvbiIsIl9jaGVja0lzUG90ZW50aWFsbHlTZW5zaXRpdmUiLCJfZ2V0VVJMUGFyYW1ldGVyc0Zyb21TZWxlY3Rpb25WYXJpYW50Iiwib05hdkFyZ3VtZW50cyIsInRhcmdldCIsInNlbWFudGljT2JqZWN0IiwiYWN0aW9uIiwicGFyYW1zIiwiZm5OYXZpZ2F0ZSIsImZuTmF2RXhwbGFjZSIsInNOZXdIcmVmUHJvbWlzZSIsImhyZWZGb3JFeHRlcm5hbEFzeW5jIiwic05ld0hyZWYiLCJvcGVuV2luZG93Iiwib0Vycm9yIiwiX2ZuU2F2ZUFwcFN0YXRlQXN5bmMiLCJvU2F2ZUFwcFN0YXRlUmV0dXJuIiwiYXBwU3RhdGVLZXkiLCJwdG9FeHQiLCJ0b0V4dGVybmFsIiwiZm5TdG9yZUFuZE5hdmlnYXRlIiwic3RvcmVJbm5lckFwcFN0YXRlQXN5bmMiLCJyZXBsYWNlSGFzaCIsIm9TdXBwb3J0ZWRQcm9taXNlIiwiaXNOYXZpZ2F0aW9uU3VwcG9ydGVkIiwiZG9uZSIsIm9UYXJnZXRzIiwic3VwcG9ydGVkIiwiZmFpbCIsIl9jcmVhdGVUZWNobmljYWxFcnJvciIsInBhcnNlTmF2aWdhdGlvbiIsInNBcHBIYXNoIiwiSGFzaENoYW5nZXIiLCJnZXRJbnN0YW5jZSIsImdldEhhc2giLCJzSUFwcFN0YXRlIiwiX2dldElubmVyQXBwU3RhdGVLZXkiLCJ3YXJuaW5nIiwiYURlZmF1bHRlZFBhcmFtZXRlcnMiLCJKU09OIiwicGFyc2UiLCJvTXlEZWZlcnJlZCIsImpRdWVyeSIsIkRlZmVycmVkIiwicGFyc2VVcmxQYXJhbXMiLCJvU3ViU3RhcnR1cFBhcmFtZXRlcnMiLCJhU3ViRGVmYXVsdGVkUGFyYW1ldGVycyIsIm9TdWJNeURlZmVycmVkIiwic05hdlR5cGUiLCJvU2VsVmFycyIsImlzRW1wdHkiLCJvRGVmYXVsdGVkU2VsVmFyIiwieEFwcFN0YXRlIiwicmVqZWN0IiwicmVzb2x2ZSIsImluaXRpYWwiLCJvQXBwU3RhdGVEYXRhIiwib1NlbGVjdGlvblZhcmlhbnQiLCJvRGVmYXVsdGVkU2VsZWN0aW9uVmFyaWFudCIsImJOYXZTZWxWYXJIYXNEZWZhdWx0c09ubHkiLCJfbG9hZEFwcFN0YXRlIiwiYklzWGFwcFN0YXRlTmF2aWdhdGlvbiIsInRoYXQiLCJvU3RhcnR1cFByb21pc2UiLCJnZXRTdGFydHVwQXBwU3RhdGUiLCJvQXBwU3RhdGUiLCJnZXREYXRhIiwic3RyaW5naWZ5IiwieCIsInByb21pc2UiLCJvU2VsVmFyIiwiVVJMUGFyYW1zIiwic2V0VGVjaG5pY2FsUGFyYW1ldGVycyIsImFUZWNobmljYWxQYXJhbWV0ZXJzIiwiQXJyYXkiLCJpc0FycmF5IiwiZ2V0VGVjaG5pY2FsUGFyYW1ldGVycyIsImNvbmNhdCIsIl9pc1RlY2huaWNhbFBhcmFtZXRlciIsInNQYXJhbWV0ZXJOYW1lIiwidG9Mb3dlckNhc2UiLCJpbmRleE9mIiwiX2lzRkVQYXJhbWV0ZXIiLCJzUHJvcE5hbWUiLCJpIiwiYVNlbFZhclByb3BOYW1lcyIsImdldFNlbGVjdE9wdGlvbnNQcm9wZXJ0eU5hbWVzIiwicmVtb3ZlU2VsZWN0T3B0aW9uIiwib1N0YXJ0dXBQYXJhbWV0ZXJzQWRqdXN0ZWQiLCJoYXNPd25Qcm9wZXJ0eSIsImdldFBhcmFtZXRlck5hbWVzIiwibWFzc0FkZFNlbGVjdE9wdGlvbiIsImdldFZhbHVlIiwiX2FkZFBhcmFtZXRlclZhbHVlcyIsImFQcm9wTmFtZXMiLCJvU2VsVmFyaWFudCIsInNTaWduIiwic09wdGlvbiIsIm9WYWx1ZXMiLCJhZGRTZWxlY3RPcHRpb24iLCJvSGFzaENoYW5nZXIiLCJzQXBwSGFzaE9sZCIsInNBcHBIYXNoTmV3IiwiX3JlcGxhY2VJbm5lckFwcFN0YXRlS2V5IiwibUlubmVyQXBwRGF0YSIsImJJbW1lZGlhdGVIYXNoUmVwbGFjZSIsImJTa2lwSGFzaFJlcGxhY2UiLCJmblJlcGxhY2VIYXNoIiwiaXNFbXB0eU9iamVjdCIsInNBcHBTdGF0ZUtleUNhY2hlZCIsImJJbm5lckFwcERhdGFFcXVhbCIsImZuT25BZnRlclNhdmUiLCJfc2F2ZUFwcFN0YXRlQXN5bmMiLCJzdG9yZUlubmVyQXBwU3RhdGUiLCJfc2F2ZUFwcFN0YXRlIiwic3RvcmVJbm5lckFwcFN0YXRlV2l0aEltbWVkaWF0ZVJldHVybiIsIm9BcHBTdGF0ZVByb21pc2UiLCJwcm9jZXNzQmVmb3JlU21hcnRMaW5rUG9wb3Zlck9wZW5zIiwib1RhYmxlRXZlbnRQYXJhbWV0ZXJzIiwibVNlbWFudGljQXR0cmlidXRlcyIsInNlbWFudGljQXR0cmlidXRlcyIsImZuU3RvcmVYYXBwQW5kQ2FsbE9wZW4iLCJtU3ViU2VtYW50aWNBdHRyaWJ1dGVzIiwic1N1YlNlbGVjdGlvblZhcmlhbnQiLCJpU3VwcHJlc3Npb25CZWhhdmlvciIsInJhaXNlRXJyb3JPbk51bGwiLCJyYWlzZUVycm9yT25VbmRlZmluZWQiLCJvTWl4ZWRTZWxWYXIiLCJtaXhBdHRyaWJ1dGVzQW5kU2VsZWN0aW9uVmFyaWFudCIsImZuT25Db250YWluZXJTYXZlIiwic2V0U2VtYW50aWNBdHRyaWJ1dGVzIiwic2V0QXBwU3RhdGVLZXkiLCJvcGVuIiwib1N0b3JlSW5uZXJBcHBTdGF0ZVByb21pc2UiLCJfZ2V0QXBwU3RhdGVLZXlBbmRVcmxQYXJhbWV0ZXJzIiwiX21peEF0dHJpYnV0ZXNUb1NlbFZhcmlhbnQiLCJzUHJvcGVydHlOYW1lIiwidlNlbWFudGljQXR0cmlidXRlVmFsdWUiLCJEYXRlIiwidG9KU09OIiwidG9TdHJpbmciLCJpZ25vcmVFbXB0eVN0cmluZyIsImluZm8iLCJTdHJpbmciLCJ2U2VtYW50aWNBdHRyaWJ1dGVzIiwib05ld1NlbFZhcmlhbnQiLCJmaWx0ZXJVcmwiLCJnZXRGaWx0ZXJDb250ZXh0VXJsIiwic2V0RmlsdGVyQ29udGV4dFVybCIsImNvbnRleHRVcmwiLCJnZXRQYXJhbWV0ZXJDb250ZXh0VXJsIiwic2V0UGFyYW1ldGVyQ29udGV4dFVybCIsImZvckVhY2giLCJhUGFyYW1ldGVycyIsImdldFNlbGVjdE9wdGlvbiIsImdldFBhcmFtZXRlciIsImFTZWxPcHRpb25OYW1lcyIsImFTZWxlY3RPcHRpb24iLCJqIiwiU2lnbiIsIk9wdGlvbiIsIkxvdyIsIkhpZ2giLCJfZW5zdXJlU2VsZWN0aW9uVmFyaWFudEZvcm1hdFN0cmluZyIsInZTZWxlY3Rpb25WYXJpYW50IiwidkNvbnZlcnRlZFNlbGVjdGlvblZhcmlhbnQiLCJfZm5IYW5kbGVBcHBTdGF0ZVByb21pc2UiLCJvUmV0dXJuIiwiX3NhdmVBcHBTdGF0ZVdpdGhJbW1lZGlhdGVSZXR1cm4iLCJfZm5TYXZlQXBwU3RhdGVXaXRoSW1tZWRpYXRlUmV0dXJuIiwiZ2V0S2V5Iiwib0FwcERhdGFGb3JTYXZlIiwiX2ZldGNoQXBwRGF0YUZvclNhdmUiLCJzZXREYXRhIiwib1NhdmVQcm9taXNlIiwic2F2ZSIsImV4dGVuZCIsInRhYmxlVmFyaWFudElkIiwiY3VzdG9tRGF0YSIsInByZXNlbnRhdGlvblZhcmlhbnQiLCJ2YWx1ZVRleHRzIiwic2VtYW50aWNEYXRlcyIsIm9BcHBEYXRhQ2xvbmUiLCJPYmplY3QiLCJhc3NpZ24iLCJtZXJnZSIsImNyZWF0ZUVtcHR5QXBwU3RhdGVBc3luYyIsImNyZWF0ZUVtcHR5QXBwU3RhdGUiLCJvRGVmZXJyZWQiLCJnZXRBcHBTdGF0ZSIsIm9BcHBEYXRhTG9hZGVkIiwiaUFwcFN0YXRlIiwiYU1hdGNoZXMiLCJleGVjIiwic05ld0lBcHBTdGF0ZSIsImZuQXBwZW5kVG9RdWVyeVBhcmFtZXRlciIsInNTdWJBcHBIYXNoIiwidGVzdCIsInJlcGxhY2UiLCJzTmVlZGxlIiwiZm5SZXBsYWNlT2xkQXBwcm9hY2giLCJyT2xkQXBwcm9hY2giLCJhc3NlcnQiLCJtVVJMUGFyYW1ldGVycyIsImFTZWxlY3RQcm9wZXJ0aWVzIiwiYVNlbGVjdE9wdGlvbnMiLCJhUGFyYW1ldGVyTmFtZXMiLCJzUGFyYW1ldGVyVmFsdWUiLCJzRXJyb3JDb2RlIiwic2V0TW9kZWwiLCJvTW9kZWwiLCJfb01vZGVsIiwiX2dldE1vZGVsIiwiZ2V0TW9kZWwiLCJfcmVtb3ZlQWxsUHJvcGVydGllcyIsIm9EYXRhIiwiX3JlbW92ZVByb3BlcnRpZXMiLCJhRmlsdGVyTmFtZSIsImFQYXJhbWV0ZXJOYW1lIiwic05hbWUiLCJTZWxlY3RPcHRpb25zIiwic29tZSIsIm9WYWx1ZSIsIm5JZHgiLCJQcm9wZXJ0eU5hbWUiLCJzcGxpY2UiLCJUZXh0cyIsIm9UZXh0cyIsIlByb3BlcnR5VGV4dHMiLCJEYXRlcyIsIm9EYXRlcyIsIlBhcmFtZXRlcnMiLCJfaXNUZXJtVHJ1ZSIsIm9Qcm9wZXJ0eSIsInNUZXJtIiwiZklzVGVybURlZmF1bHRUcnVlIiwib1Rlcm0iLCJCb29sIiwiX2lzRXhjbHVkZWRGcm9tTmF2aWdhdGlvbkNvbnRleHQiLCJfaXNQb3RlbnRpYWxseVNlbnNpdGl2ZSIsIl9pc01lYXN1cmVQcm9wZXJ0eSIsIl9pc1RvQmVFeGNsdWRlZCIsImNvbnN0cnVjdENvbnRleHRVcmwiLCJzRW50aXR5U2V0TmFtZSIsIl9jb25zdHJ1Y3RDb250ZXh0VXJsIiwic1NlcnZlclVybCIsImlzQSIsIl9nZXRTZXJ2ZXJVcmwiLCJvU2VydmljZVVSSSIsIlVSSSIsInNTZXJ2aWNlVXJsIiwiYWJzb2x1dGVUbyIsImRvY3VtZW50IiwiYmFzZVVSSSIsImxhc3RJbmRleE9mIiwic3Vic3RyIiwib0FkYXB0ZWREYXRhIiwiRmlsdGVyQ29udGV4dFVybCIsIlBhcmFtZXRlckNvbnRleHRVcmwiLCJhU2Vuc2l0aXZlRmlsdGVyTmFtZSIsImFTZW5zaXRpdmVQYXJhbWV0ZXJOYW1lIiwib0VudGl0eVNldCIsIm9FbnRpdHlEZWYiLCJvU3ViRW50aXR5RGVmIiwib0VuZFJvbGUiLCJhRmlsdGVyQ29udGV4dFBhcnQiLCJhUGFyYW1Db250ZXh0UGFydCIsIm9NZXRhTW9kZWwiLCJnZXRNZXRhTW9kZWwiLCJnZXRTZXJ2aWNlTWV0YWRhdGEiLCJzcGxpdCIsImdldE9EYXRhRW50aXR5U2V0IiwiZ2V0T0RhdGFFbnRpdHlUeXBlIiwiZW50aXR5VHlwZSIsInByb3BlcnR5IiwicHVzaCIsIm5hbWUiLCJuYXZpZ2F0aW9uUHJvcGVydHkiLCJnZXRPRGF0YUFzc29jaWF0aW9uRW5kIiwidHlwZSIsIm11bHRpcGxpY2l0eSIsIl9yZW1vdmVTZW5zaXRpdmVEYXRhRm9yT0RhdGFWNCIsIl9yZW1vdmVNZWFzdXJlQmFzZWRQcm9wZXJ0aWVzIiwiYU1lYXN1cmVGaWx0ZXJOYW1lIiwiYU1lYXN1cmVQYXJhbWV0ZXJOYW1lIiwiYk1lYXN1cmUiLCJvU1YiLCJnZXRPYmplY3QiLCJzRW50aXR5U2V0IiwiYVByb3BlcnR5TmFtZXMiLCJnZXRQcm9wZXJ0eU5hbWVzIiwiZm5Jc1NlbnNpdGl2ZURhdGEiLCJzUHJvcCIsImVzTmFtZSIsImFQcm9wZXJ0eUFubm90YXRpb25zIiwiX2NoZWNrUHJvcGVydHlBbm5vdGF0aW9uc0ZvclNlbnNpdGl2ZURhdGEiLCJvRmllbGRDb250cm9sIiwiayIsInNQcm9wZXJ0eSIsIkJhc2VPYmplY3QiLCJOYXZpZ2F0aW9uSGFuZGxlclVJNUNsYXNzIiwicHJvdG90eXBlIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJOYXZpZ2F0aW9uSGFuZGxlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgYXNzZXJ0IGZyb20gXCJzYXAvYmFzZS9hc3NlcnRcIjtcbmltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IGV4dGVuZCBmcm9tIFwic2FwL2Jhc2UvdXRpbC9leHRlbmRcIjtcbmltcG9ydCBpc0VtcHR5T2JqZWN0IGZyb20gXCJzYXAvYmFzZS91dGlsL2lzRW1wdHlPYmplY3RcIjtcbmltcG9ydCBtZXJnZSBmcm9tIFwic2FwL2Jhc2UvdXRpbC9tZXJnZVwiO1xuaW1wb3J0IEJhc2VPYmplY3QgZnJvbSBcInNhcC91aS9iYXNlL09iamVjdFwiO1xuaW1wb3J0IHR5cGUgQ29udHJvbGxlciBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL0NvbnRyb2xsZXJcIjtcbmltcG9ydCBIYXNoQ2hhbmdlciBmcm9tIFwic2FwL3VpL2NvcmUvcm91dGluZy9IYXNoQ2hhbmdlclwiO1xuaW1wb3J0IFVJQ29tcG9uZW50IGZyb20gXCJzYXAvdWkvY29yZS9VSUNvbXBvbmVudFwiO1xuaW1wb3J0IFYyT0RhdGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3YyL09EYXRhTW9kZWxcIjtcbmltcG9ydCBWNE9EYXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1vZGVsXCI7XG5pbXBvcnQgVVJJIGZyb20gXCJzYXAvdWkvdGhpcmRwYXJ0eS9VUklcIjtcbmltcG9ydCBvcGVuV2luZG93IGZyb20gXCJzYXAvdWkvdXRpbC9vcGVuV2luZG93XCI7XG5pbXBvcnQgTmF2TGlicmFyeSBmcm9tIFwiLi9saWJyYXJ5XCI7XG5pbXBvcnQgTmF2RXJyb3IgZnJvbSBcIi4vTmF2RXJyb3JcIjtcbmltcG9ydCB0eXBlIHsgU2VyaWFsaXplZFNlbGVjdGlvblZhcmlhbnQgfSBmcm9tIFwiLi9TZWxlY3Rpb25WYXJpYW50XCI7XG5pbXBvcnQgU2VsZWN0aW9uVmFyaWFudCBmcm9tIFwiLi9TZWxlY3Rpb25WYXJpYW50XCI7XG5cbi8qKlxuICogU3RydWN0dXJlIG9mIHN0b3JlZCBhcHAgc3RhdGUuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSW5uZXJBcHBEYXRhIHtcblx0W2tleTogc3RyaW5nXTogdW5rbm93bjtcblx0LyoqXG5cdCAqIFNyaW5naWZpZWQgSlNPTiBvYmplY3QgYXMgcmV0dXJuZWQsIGZvciBleGFtcGxlLCBmcm9tIGdldERhdGFTdWl0ZUZvcm1hdCgpIG9mIHRoZSBTbWFydEZpbHRlckJhciBjb250cm9sXG5cdCAqL1xuXHRzZWxlY3Rpb25WYXJpYW50Pzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBJRCBvZiB0aGUgU21hcnRUYWJsZSB2YXJpYW50LlxuXHQgKi9cblx0dGFibGVWYXJpYW50SWQ/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIE9iamVjdCB0aGF0IGNhbiBiZSB1c2VkIHRvIHN0b3JlIGFyYml0cmFyeSBkYXRhLlxuXHQgKi9cblx0Y3VzdG9tRGF0YT86IG9iamVjdDtcblxuXHQvKipcblx0ICogT2JqZWN0IGNvbnRhaW5pbmcgdGhlIGN1cnJlbnQgdWkgc3RhdGUgb2YgdGhlIGFwcC5cblx0ICovXG5cdHByZXNlbnRhdGlvblZhcmlhbnQ/OiBvYmplY3Q7XG5cblx0LyoqXG5cdCAqIE9iamVjdCBjb250YWluaW5nIHZhbHVlIGRlc2NyaXB0aW9ucy5cblx0ICovXG5cdHZhbHVlVGV4dHM/OiBvYmplY3Q7XG5cblx0LyoqXG5cdCAqIE9iamVjdCBjb250YWluaW5nIHNlbWFudGljRGF0ZXMgZmlsdGVyIGluZm9ybWF0aW9uLlxuXHQgKi9cblx0c2VtYW50aWNEYXRlcz86IG9iamVjdDtcbn1cblxuLy8gc2hvcnRjdXRzIGZvciBzYXAudWkuZ2VuZXJpYy5hcHAgZW51bXNcbmNvbnN0IE5hdlR5cGUgPSBOYXZMaWJyYXJ5Lk5hdlR5cGU7XG5jb25zdCBQYXJhbUhhbmRsaW5nTW9kZSA9IE5hdkxpYnJhcnkuUGFyYW1IYW5kbGluZ01vZGU7XG5jb25zdCBTdXBwcmVzc2lvbkJlaGF2aW9yID0gTmF2TGlicmFyeS5TdXBwcmVzc2lvbkJlaGF2aW9yO1xuY29uc3QgTW9kZSA9IE5hdkxpYnJhcnkuTW9kZTtcblxuY29uc3QgSUFQUF9TVEFURSA9IFwic2FwLWlhcHAtc3RhdGVcIjtcbmNvbnN0IERFRkFVTFRFRF9QQVJBTUVURVJfUFJPUEVSVFkgPSBcInNhcC11c2hlbGwtZGVmYXVsdGVkUGFyYW1ldGVyTmFtZXNcIjtcblxuLyoqXG4gKiBUaGlzIGlzIHRoZSBzdWNjZXNzb3Igb2Yge0BsaW5rIHNhcC51aS5nZW5lcmljLmFwcC5uYXZpZ2F0aW9uLnNlcnZpY2UuTmF2aWdhdGlvbkhhbmRsZXJ9Ljxicj4gQ3JlYXRlcyBhIG5ldyBOYXZpZ2F0aW9uSGFuZGxlciBjbGFzcyBieSBwcm92aWRpbmcgdGhlIHJlcXVpcmVkIGVudmlyb25tZW50LiA8YnI+XG4gKiBUaGUgPGNvZGU+TmF2aWdhdGlvbkhhbmRsZXI8L2NvZGU+IHN1cHBvcnRzIHRoZSB2ZXJpZmljYXRpb24gb2Ygc2Vuc2l0aXZlIGluZm9ybWF0aW9uLiBBbGwgcHJvcGVydGllcyB0aGF0IGFyZSBwYXJ0IG9mXG4gKiA8Y29kZT5zZWxlY3Rpb25WYXJpYW50PC9jb2RlPiBhbmQgPGNvZGU+dmFsdWVUZXh0czwvY29kZT4gd2lsbCBiZSB2ZXJpZmllZCBpZiB0aGV5IGFyZSBhbm5vdGF0ZWQgYXNcbiAqIDxjb2RlPmNvbS5zYXAudm9jYWJ1bGFyaWVzLlBlcnNvbmFsRGF0YS52MS5Jc1BvdGVudGlhbGx5U2Vuc2l0aXZlPC9jb2RlPiBvclxuICogPGNvZGU+Y29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRXhjbHVkZUZyb21OYXZpZ2F0aW9uQ29udGV4dDwvY29kZT4gYW5kIHdpbGwgYmUgcmVtb3ZlZCBiZWZvcmUgdGhlIGRhdGEgaXMgcGVyc2lzdGVkIGFzIHRoZSBhcHBcbiAqIHN0YXRlLjxicj5cbiAqIEFsc28sIGFsbCBwcm9wZXJ0aWVzIGFubm90YXRlZCBhcyA8Y29kZT5jb20uc2FwLnZvY2FidWxhcmllcy5BbmFseXRpY3MudjEuTWVhc3VyZTwvY29kZT4gd2lsbCBiZSByZW1vdmVkIGZyb20gdGhlIGRhdGEgc3RvcmVkIGFzIHRoZVxuICogeGFwcCBzdGF0ZS48YnI+XG4gKiBUbyB2ZXJpZnkgdGhlIGluZm9ybWF0aW9uIHRvIGJlIHJlbW92ZWQsIHRoZSA8Y29kZT5OYXZpZ2F0aW9uSGFuZGxlcjwvY29kZT4gcmVxdWlyZXMgYW4gdW5uYW1lZCBtb2RlbCBvZiB0eXBlXG4gKiB7QGxpbmsgc2FwLnVpLm1vZGVsLm9kYXRhLnYyLk9EYXRhTW9kZWx9IG9uIGNvbXBvbmVudCBsZXZlbC4gSXQgaXMgcG9zc2libGUgdG8gc2V0IHN1Y2ggYSBtb2RlbCB1c2luZyB0aGUgPGNvZGU+c2V0TW9kZWw8L2NvZGU+XG4gKiBtZXRob2QuPGJyPlxuICogPGI+Tm90ZTo8L2I+IFRoZSBjaGVjayBmb3IgZXhjbHVkZWQgZGF0YSByZXF1aXJlcyB0aGF0IHRoZSBPRGF0YSBtZXRhZGF0YSBoYXMgYWxyZWFkeSBiZWVuIGxvYWRlZCBjb21wbGV0ZWx5Ljxicj5cbiAqIElmIHRoZSBPRGF0YSBtZXRhZGF0YSBtb2RlbCBoYXMgbm90IGJlZW4gbG9hZGVkIGNvbXBsZXRlbHksIGFsbCBwcm9wZXJ0aWVzIGFyZSByZW1vdmVkIGZyb20gdGhlIGFwcGxpY2F0aW9uIGNvbnRleHQuPGJyPlxuICogPGI+Tm90ZTo8L2I+IFRoaXMgY2xhc3MgcmVxdWlyZXMgdGhhdCB0aGUgVVNoZWxsIHtAbGluayBzYXAudXNoZWxsLnNlcnZpY2VzLkNyb3NzQXBwbGljYXRpb25OYXZpZ2F0aW9ufSBpcyBhdmFpbGFibGUgYW5kIGluaXRpYWxpemVkLlxuICpcbiAqIEBwdWJsaWNcbiAqIEBjbGFzc1xuICogQGV4dGVuZHMgc2FwLnVpLmJhc2UuT2JqZWN0XG4gKiBAc2luY2UgMS44My4wXG4gKiBAbmFtZSBzYXAuZmUubmF2aWdhdGlvbi5OYXZpZ2F0aW9uSGFuZGxlclxuICovXG5leHBvcnQgY2xhc3MgTmF2aWdhdGlvbkhhbmRsZXIgZXh0ZW5kcyBCYXNlT2JqZWN0IHtcblx0cHJpdmF0ZSBvUm91dGVyOiBhbnk7XG5cdHByaXZhdGUgb0NvbXBvbmVudDogYW55O1xuXHRwcml2YXRlIF9vTW9kZWw6IGFueTtcblxuXHRwcml2YXRlIHNQYXJhbUhhbmRsaW5nTW9kZTogc3RyaW5nO1xuXHRwcml2YXRlIF9zTW9kZTogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXG5cdC8vIGxpc3Qgb2YgdGVjaG5pY2FsIHBhcmFtZXRlcnNcblx0cHJpdmF0ZSBfYVRlY2huaWNhbFBhcmFtYXRlcnMgPSBbXCJoY3BBcHBsaWNhdGlvbklkXCJdO1xuXG5cdHByaXZhdGUgX29MYXN0U2F2ZWRJbm5lckFwcERhdGE6IGFueSA9IHtcblx0XHRzQXBwU3RhdGVLZXk6IFwiXCIsXG5cdFx0b0FwcERhdGE6IHt9LFxuXHRcdGlDYWNoZUhpdDogMCxcblx0XHRpQ2FjaGVNaXNzOiAwXG5cdH07XG5cblx0Lypcblx0ICogVGhlcmUgZXhpc3RzIGEgZ2VuZXJhdGlvbiBvZiBcIm9sZFwiIHNhcC1pYXBwLXN0YXRlcyB3aGljaCBhcmUgYmFzZWQgb24gdGhlIGZvbGxvd2luZyBVUkwgc2NoZW1hOlxuXHQgKiAjU2VtT2JqLWFjdGlvbiYvcm91dGUvc2FwLWlhcHAtc3RhdGU9QUJDMTIzNDU2NzggVGhlIG5ldyBVUkwgc2NoZW1hIGlzOiAjU2VtT2JqLWFjdGlvbiYvcm91dGU/c2FwLWlhcHAtc3RhdGU9QUJDMTIzNDU2NzggKG1pbmQgdGhlXG5cdCAqIGRpZmZlcmVuY2UgYmV0d2VlbiAvIGFuZCA/IGFib3ZlKSwgaS5lLiB0aGUgc2FwLWlhcHAtc3RhdGUgaGFzIGJlY29tZSBhIHBhcmFtZXRlciBvZiB0aGUgcXVlcnkgcGFyYW1ldGVyIHNlY3Rpb24gaW4gdGhlIEFwcEhhc2ggc3RyaW5nLlxuXHQgKiBZZXQsIHRoaXMgdG9vbCBzaGFsbCBiZSBhYmxlIHRvIGRlYWwgZXZlbiB3aXRoIG9sZCBzYXAtaWFwcC1zdGF0ZXMuIFRoZXJlZm9yZSwgd2UgdXNlIHR3byBSZWd1bGFyIEV4cHJlc3Npb25zIChySUFwcFN0YXRlT2xkIGFuZFxuXHQgKiBySUFwcFN0YXRlT2xkQXRTdGFydCkgYXMgZGVmaW5lZCBiZWxvdyB0byBzY2FuIGZvciB0aGVzZSBvbGQgdmFyaWFudHMuIFRoZSBuZXcgdmFyaWFudCBpcyBiZWluZyBzY2FubmVkIHVzaW5nIHJJQXBwU3RhdGVOZXcgYXMgUmVndWxhclxuXHQgKiBFeHByZXNzaW9uIHNlYXJjaCBzdHJpbmcuIENvbXBhdGliaWxpdHkgaXMgY2VudHJhbGx5IGVuc3VyZWQgYnkgdGhlIHR3byBtZXRob2RzIF9nZXRJbm5lckFwcFN0YXRlS2V5IGFuZCBfcmVwbGFjZUlubmVyQXBwU3RhdGVLZXkgKHNlZVxuXHQgKiBiZWxvdykuIE5ldmVyIHVzZSB0aGVzZSBSZWdFeHAgaW4gYSBtZXRob2Qgb24geW91ciBvd24sIGFzIGl0IHR5cGljYWxseSBpbmRpY2F0ZXMgdGhhdCB5b3Ugd2lsbCBmYWxsIGludG8gdGhlIGNvbXBhdGliaWxpdHkgdHJhcCFcblx0ICovXG5cdC8vIFdhcm5pbmchIERvIG5vdCB1c2UgR0xPQkFMIGZsYWdzIGhlcmU7IFJlZ0V4cCBpbiBHTE9CQUwgbW9kZSBzdG9yZSB0aGUgbGFzdEluZGV4IHZhbHVlXG5cdC8vIFRoZXJlZm9yZSwgcmVwZWF0ZWQgY2FsbHMgdG8gdGhlIFJlZ0V4cCB3aWxsIHRoZW4gb25seSBzdGFydCBiZWdpbm5pbmcgd2l0aCB0aGF0IHN0b3JlZFxuXHQvLyBsYXN0SW5kZXguIFRodXMsIG11bHRpcGxlIGNhbGxzIHRoZXJlZm9yZSBjb3VsZCB5aWVsZCBzdHJhbmdlIHJlc3VsdHMuXG5cdC8vIE1vcmVvdmVyLCB0aGVyZSBzaGFsbCBvbmx5IGJlIGV4YWN0bHkgb25lIElBUFBfU1RBVEUgcGVyIFJlZ0V4cCBpbiBhbiBBcHBIYXNoLlxuXHQvLyBUaGVyZWZvcmUsIEdMT0JBTCBzZWFyY2ggc2hvdWxkIGJlIHN1cGVyZmx1b3VzLlxuXHRwcml2YXRlIF9ySUFwcFN0YXRlT2xkID0gbmV3IFJlZ0V4cChcIi9cIiArIElBUFBfU1RBVEUgKyBcIj0oW14vP10rKVwiKTtcblx0cHJpdmF0ZSBfcklBcHBTdGF0ZU9sZEF0U3RhcnQgPSBuZXcgUmVnRXhwKFwiXlwiICsgSUFQUF9TVEFURSArIFwiPShbXi8/XSspXCIpO1xuXG5cdC8qXG5cdCAqIFJlZ3VsYXIgRXhwcmVzc2lvbiBpbiB3b3JkczogU2VhcmNoIGZvciBzb21ldGhpbmcgdGhhdCBlaXRoZXIgc3RhcnRzIHdpdGggPyBvciAmLCBmb2xsb3dlZCBieSB0aGUgdGVybSBcInNhcC1pYXBwLXN0YXRlXCIuIFRoYXQgb25lIGlzXG5cdCAqIGZvbGxvd2VkIGJ5IGFuIGVxdWFsIHNpZ24gKD0pLiBUaGUgc3R1ZmYgdGhhdCBpcyBhZnRlciB0aGUgZXF1YWwgc2lnbiBmb3JtcyB0aGUgZmlyc3QgcmVnZXhwIGdyb3VwLiBUaGlzIGdyb3VwIGNvbnNpc3RzIG9mIGF0IGxlYXN0IG9uZVxuXHQgKiAob3IgYXJiaXRyYXJ5IG1hbnkpIGNoYXJhY3RlcnMsIGFzIGxvbmcgYXMgaXQgaXMgbm90IGFuIGFtcGVyc2FuZCBzaWduICgmKS4gQ2hhcmFjdGVycyBhZnRlciBzdWNoIGFuIGFtcGVyc2FuZCB3b3VsZCBiZSBpZ25vcmVkIGFuZCBkb1xuXHQgKiBub3QgYmVsb25nIHRvIHRoZSBncm91cC4gQWx0ZXJuYXRpdmVseSwgdGhlIHN0cmluZyBhbHNvIG1heSBlbmQuXG5cdCAqL1xuXHRwcml2YXRlIF9ySUFwcFN0YXRlTmV3ID0gbmV3IFJlZ0V4cChcIls/Jl1cIiArIElBUFBfU1RBVEUgKyBcIj0oW14mXSspXCIpO1xuXG5cdHByaXZhdGUgX25hdmlnYXRlQ2FsbGJhY2s6IEZ1bmN0aW9uIHwgdW5kZWZpbmVkO1xuXG5cdC8qKlxuXHQgKiBUZW1wb3JhcmlseSBhZGRlZCBhZ2FpbiBiZWNhdXNlIGFuIGFwcGxpY2F0aW9uIHdhcyAoaWxsZWdpYWxseSkgcmVseWluZyBvbiBpdC4gU2hvdWxkIGJlIHJlbW92ZWQgYWdhaW4sIG9uY2UgdGhlIGFwcCBpcyBjb3JyZWN0ZWRcblx0ICovXG5cdHByaXZhdGUgSUFQUF9TVEFURSA9IElBUFBfU1RBVEU7XG5cblx0LyoqXG5cdCAqIENvbnN0cnVjdG9yIHJlcXVpcmluZyBhIGNvbnRyb2xsZXIvY29tcG9uZW50IG93bmluZyB0aGUgbmF2aWdhdGlvbiBoYW5kbGVyLlxuXHQgKlxuXHQgKiBAcGFyYW0ge29iamVjdH0gb0NvbnRyb2xsZXIgVUk1IGNvbnRyb2xsZXIgdGhhdCBjb250YWlucyBhIHJvdXRlciBhbmQgYSBjb21wb25lbnQ7IHR5cGljYWxseSB0aGUgbWFpbiBjb250cm9sbGVyIG9mIHlvdXIgYXBwbGljYXRpb24sIGZvclxuXHQgKiAgICAgICAgZXhhbXBsZSwgYSBzdWJjbGFzcyBvZiB0aGUgc2FwLmNhLnNjZmxkLm1kLmNvbnRyb2xsZXIuQmFzZUZ1bGxzY3JlZW5Db250cm9sbGVyIGlmIHNjYWZmb2xkaW5nIGlzIHVzZWRcblx0ICogQHBhcmFtIHtzdHJpbmd9IFtzTW9kZT1zYXAuZmUubmF2aWdhdGlvbi5Nb2RlLk9EYXRhVjRdIE1vZGUgdG8gYmUgdXNlZCB0byBpbmRpY2F0ZXMgdGhlIE9kYXRhIHZlcnNpb24gdXNlZCBmb3IgcnVubm5pbmcgdGhlIE5hdmlnYXRpb24gSGFuZGxlcixcblx0ICogICAgICAgIHNlZSB7QGxpbmsgc2FwLmZlLm5hdmlnYXRpb24uTW9kZX0uPGJyPlxuXHQgKiBcdFx0ICBOb3RlOiBNb2RlIGhhcyB0byBiZSBzYXAuZmUubmF2aWdhdGlvbi5Nb2RlLk9EYXRhVjIgd2hlbmV2ZXIgdGhpcyBjb25zdHJ1Y3RvciBpcyB1c2VkIHRvIGluaXRpYWxpemUgYSBPRGF0YSBWMiBiYXNlZCBzZXJ2aWNlLlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gW3NQYXJhbUhhbmRsaW5nTW9kZT1TZWxWYXJXaW5zXSBNb2RlIHRvIGJlIHVzZWQgdG8gaGFuZGxlIGNvbmZsaWN0cyB3aGVuIG1lcmdpbmcgVVJMIHBhcmFtZXRlcnMgYW5kIHRoZSBTZWxlY3Rpb25WYXJpYW50IGNsYXNzLFxuXHQgKiAgICAgICAgc2VlIHtAbGluayBzYXAuZmUubmF2aWdhdGlvbi5QYXJhbUhhbmRsaW5nTW9kZX1cblx0ICogQHRocm93cyBBbiBpbnN0YW5jZSBvZiB7QGxpbmsgc2FwLmZlLm5hdmlnYXRpb24uTmF2RXJyb3J9IGluIGNhc2Ugb2YgaW5wdXQgZXJyb3JzLiBWYWxpZCBlcnJvciBjb2RlcyBhcmU6IDx0YWJsZT5cblx0ICogICAgICAgICA8dHI+XG5cdCAqICAgICAgICAgPHRoIGFsaWduPVwibGVmdFwiPk5hdkVycm9yIGNvZGU8L3RoPlxuXHQgKiAgICAgICAgIDx0aCBhbGlnbj1cImxlZnRcIj5EZXNjcmlwdGlvbjwvdGg+XG5cdCAqICAgICAgICAgPC90cj5cblx0ICogICAgICAgICA8dHI+XG5cdCAqICAgICAgICAgPHRkPk5hdmlnYXRpb25IYW5kbGVyLklOVkFMSURfSU5QVVQ8L3RkPlxuXHQgKiAgICAgICAgIDx0ZD5JbmRpY2F0ZXMgdGhhdCB0aGUgaW5wdXQgcGFyYW1ldGVyIGlzIGludmFsaWQ8L3RkPlxuXHQgKiAgICAgICAgIDwvdHI+XG5cdCAqICAgICAgICAgPC90YWJsZT5cblx0ICovXG5cdGNvbnN0cnVjdG9yKG9Db250cm9sbGVyOiBDb250cm9sbGVyIHwgVUlDb21wb25lbnQsIHNNb2RlPzogc3RyaW5nLCBzUGFyYW1IYW5kbGluZ01vZGU/OiBzdHJpbmcpIHtcblx0XHRzdXBlcigpO1xuXHRcdGlmICghb0NvbnRyb2xsZXIpIHtcblx0XHRcdHRocm93IG5ldyBOYXZFcnJvcihcIk5hdmlnYXRpb25IYW5kbGVyLklOVkFMSURfSU5QVVRcIik7XG5cdFx0fVxuXG5cdFx0aWYgKG9Db250cm9sbGVyIGluc3RhbmNlb2YgVUlDb21wb25lbnQpIHtcblx0XHRcdHRoaXMub1JvdXRlciA9IG9Db250cm9sbGVyLmdldFJvdXRlcigpO1xuXHRcdFx0dGhpcy5vQ29tcG9uZW50ID0gb0NvbnRyb2xsZXI7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmICh0eXBlb2Ygb0NvbnRyb2xsZXIuZ2V0T3duZXJDb21wb25lbnQgIT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0XHR0aHJvdyBuZXcgTmF2RXJyb3IoXCJOYXZpZ2F0aW9uSGFuZGxlci5JTlZBTElEX0lOUFVUXCIpO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLm9Sb3V0ZXIgPSB0aGlzLl9nZXRSb3V0ZXIob0NvbnRyb2xsZXIpO1xuXHRcdFx0dGhpcy5vQ29tcG9uZW50ID0gb0NvbnRyb2xsZXIuZ2V0T3duZXJDb21wb25lbnQoKTtcblx0XHR9XG5cblx0XHQvLyBzcGVjaWFsIGhhbmRsaW5nIGZvciBTbWFydFRlbXBsYXRlc1xuXHRcdGlmICh0aGlzLm9Db21wb25lbnQgJiYgdGhpcy5vQ29tcG9uZW50LmdldEFwcENvbXBvbmVudCkge1xuXHRcdFx0dGhpcy5vQ29tcG9uZW50ID0gdGhpcy5vQ29tcG9uZW50LmdldEFwcENvbXBvbmVudCgpO1xuXHRcdH1cblxuXHRcdGlmIChcblx0XHRcdHR5cGVvZiB0aGlzLm9Sb3V0ZXIgPT09IFwidW5kZWZpbmVkXCIgfHxcblx0XHRcdHR5cGVvZiB0aGlzLm9Db21wb25lbnQgPT09IFwidW5kZWZpbmVkXCIgfHxcblx0XHRcdHR5cGVvZiB0aGlzLm9Db21wb25lbnQuZ2V0Q29tcG9uZW50RGF0YSAhPT0gXCJmdW5jdGlvblwiXG5cdFx0KSB7XG5cdFx0XHR0aHJvdyBuZXcgTmF2RXJyb3IoXCJOYXZpZ2F0aW9uSGFuZGxlci5JTlZBTElEX0lOUFVUXCIpO1xuXHRcdH1cblxuXHRcdGlmIChzUGFyYW1IYW5kbGluZ01vZGUgPT09IFBhcmFtSGFuZGxpbmdNb2RlLlVSTFBhcmFtV2lucyB8fCBzUGFyYW1IYW5kbGluZ01vZGUgPT09IFBhcmFtSGFuZGxpbmdNb2RlLkluc2VydEluU2VsT3B0KSB7XG5cdFx0XHR0aGlzLnNQYXJhbUhhbmRsaW5nTW9kZSA9IHNQYXJhbUhhbmRsaW5nTW9kZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5zUGFyYW1IYW5kbGluZ01vZGUgPSBQYXJhbUhhbmRsaW5nTW9kZS5TZWxWYXJXaW5zOyAvLyBkZWZhdWx0XG5cdFx0fVxuXHRcdGlmIChzTW9kZSA9PT0gTW9kZS5PRGF0YVYyKSB7XG5cdFx0XHR0aGlzLl9zTW9kZSA9IHNNb2RlO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBSZXRyaWV2ZXMgdGhlIHNoZWxsIG5hdmlnYXRpb24gc2VydmljZS5cblx0ICpcblx0ICogQHJldHVybnMgVGhlIE5hdmlnYXRpb24gc2VydmljZVxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X2dldEFwcE5hdmlnYXRpb25TZXJ2aWNlKCkge1xuXHRcdHJldHVybiBzYXAudXNoZWxsLkNvbnRhaW5lci5nZXRTZXJ2aWNlKFwiQ3Jvc3NBcHBsaWNhdGlvbk5hdmlnYXRpb25cIik7XG5cdH1cblxuXHQvKipcblx0ICogUmV0cmlldmVzIHRoZSBzaGVsbCBuYXZpZ2F0aW9uIHNlcnZpY2UuXG5cdCAqXG5cdCAqIEByZXR1cm5zIFRoZSBOYXZpZ2F0aW9uIHNlcnZpY2Vcblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9nZXRBcHBOYXZpZ2F0aW9uU2VydmljZUFzeW5jKCkge1xuXHRcdHJldHVybiBzYXAudXNoZWxsLkNvbnRhaW5lci5nZXRTZXJ2aWNlQXN5bmMoXCJDcm9zc0FwcGxpY2F0aW9uTmF2aWdhdGlvblwiKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKG9Dcm9zc0FwcE5hdlNlcnZpY2U6IGFueSkge1xuXHRcdFx0XHRyZXR1cm4gb0Nyb3NzQXBwTmF2U2VydmljZTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRMb2cuZXJyb3IoXCJOYXZpZ2F0aW9uSGFuZGxlcjogQ3Jvc3NBcHBsaWNhdGlvbk5hdmlnYXRpb24gaXMgbm90IGF2YWlsYWJsZS5cIik7XG5cdFx0XHRcdHRocm93IG5ldyBOYXZFcnJvcihcIk5hdmlnYXRpb25IYW5kbGVyLk5PLlhBUFBTRVJWSUNFXCIpO1xuXHRcdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0cmlldmVzIHRoZSByZWZlcmVuY2UgdG8gdGhlIHJvdXRlciBvYmplY3QgZm9yIG5hdmlnYXRpb24gZm9yIHRoaXMgZ2l2ZW4gQ29udHJvbGxlci5cblx0ICpcblx0ICogQHBhcmFtIG9Db250cm9sbGVyIFRoZSByZWZlcmVuY2UgdG8gdGhlIENvbnRyb2xsZXIgZm9yIHdoaWNoIHRoZSBSb3V0ZXIgaW5zdGFuY2Ugc2hhbGwgYmUgZGV0ZXJtaW5lZC5cblx0ICogQHJldHVybnMgVGhlIFJvdXRlciBmb3IgdGhlIGdpdmVuIENvbnRyb2xsZXJcblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9nZXRSb3V0ZXIob0NvbnRyb2xsZXI6IENvbnRyb2xsZXIpIHtcblx0XHRyZXR1cm4gVUlDb21wb25lbnQuZ2V0Um91dGVyRm9yKG9Db250cm9sbGVyKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGlzIG1ldGhvZCBpcyB0byBiZSB1c2VkIG9ubHkgYnkgRkUgVjIgdG8gZ2V0IGFjY2VzcyB0byB0b0V4dGVybmFsIHByb21pc2UuXG5cdCAqXG5cdCAqIEBwYXJhbSBmbkNhbGxiYWNrIENhbGxiYWNrIHRvIGJlIGNhbGxlZCBieSAnbmF2aWdhdGUnIG1ldGhvZCBpbiBjYXNlIG9mIHRvRXh0ZXJuYWwgaXMgdXNlZCB0byBuYXZpZ2F0ZS5cblx0ICogQHByaXZhdGVcblx0ICovXG5cdHJlZ2lzdGVyTmF2aWdhdGVDYWxsYmFjayhmbkNhbGxiYWNrOiBGdW5jdGlvbikge1xuXHRcdHRoaXMuX25hdmlnYXRlQ2FsbGJhY2sgPSBmbkNhbGxiYWNrO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRyaWdnZXJzIGEgY3Jvc3MtYXBwIG5hdmlnYXRpb24gYWZ0ZXIgc2F2aW5nIHRoZSBpbm5lciBhbmQgdGhlIGNyb3NzLWFwcCBzdGF0ZXMuIFRoZSBuYXZpZ2F0aW9uIG1vZGUgYmFzZWQgb25cblx0ICogPGNvZGU+c2FwLXVzaGVsbC1uZXh0LW5hdm1vZGU8L2NvZGU+IGlzIHRha2VuIGludG8gYWNjb3VudC4gSWYgc2V0IHRvIDxjb2RlPmV4cGxhY2U8L2NvZGU+IHRoZSBpbm5lciBhcHAgc3RhdGUgd2lsbCBub3QgYmUgY2hhbmdlZC5cblx0ICogPGI+Tm90ZTo8L2I+IFRoZSA8Y29kZT5zTmF2TW9kZTwvY29kZT4gYXJndW1lbnQgY2FuIGJlIHVzZWQgdG8gb3ZlcndyaXRlIHRoZSBTQVAgRmlvcmkgbGF1bmNocGFkIGRlZmF1bHQgbmF2aWdhdGlvbiBmb3Igb3BlbmluZyBhIFVSTFxuXHQgKiBpbi1wbGFjZSBvciBleC1wbGFjZS5cblx0ICogPGJyPlxuXHQgKiA8Yj5Ob2RlOjwvYj4gSWYgdGhlIDxjb2RlPm9FeHRlcm5hbEFwcERhdGE8L2NvZGU+IHBhcmFtZXRlciBpcyBub3Qgc3VwcGxpZWQsIHRoZSBleHRlcm5hbCBhcHAgZGF0YSB3aWxsIGJlIGNhbGN1bGF0ZWQgYmFzZWQgb25cblx0ICogdGhlIDxjb2RlPm9Jbm5lckFwcERhdGE8L2NvZGU+IGRhdGEuPGJyPlxuXHQgKiBTbWFydEZpbHRlckJhciBjb250cm9sIDxiPlBhcmFtZXRlcnM6PC9iPiA8dGFibGU+XG5cdCAqIDx0cj5cblx0ICogPHRkIGFsaWduPVwiY2VudGVyXCI+e29iamVjdH08L3RkPlxuXHQgKiA8dGQ+PGI+b0Vycm9yPC9iPjwvdGQ+XG5cdCAqIDx0ZD5OYXZFcnJvciBvYmplY3QgKGluc3RhbmNlIG9mIHtAbGluayBzYXAuZmUubmF2aWdhdGlvbi5OYXZFcnJvcn0pIHRoYXQgZGVzY3JpYmVzIHdoaWNoIGtpbmQgb2YgZXJyb3Igb2NjdXJyZWQ8L3RkPlxuXHQgKiA8dHI+XG5cdCAqIDx0ZCBhbGlnbj1cImNlbnRlclwiPntzdHJpbmd9PC90ZD5cblx0ICogPHRkPjxiPm9FcnJvci5lcnJvckNvZGU8L2I+PC90ZD5cblx0ICogPHRkPkNvZGUgdG8gaWRlbnRpZnkgdGhlIGVycm9yPC90ZD5cblx0ICogPHRyPlxuXHQgKiA8dGQgYWxpZ249XCJjZW50ZXJcIj57c3RyaW5nfTwvdGQ+XG5cdCAqIDx0ZD48Yj5vRXJyb3IudHlwZTwvYj48L3RkPlxuXHQgKiA8dGQ+U2V2ZXJpdHkgb2YgdGhlIGVycm9yIChpbmZvL3dhcm5pbmcvZXJyb3IpPC90ZD5cblx0ICogPHRyPlxuXHQgKiA8dGQgYWxpZ249XCJjZW50ZXJcIj57YXJyYXl9PC90ZD5cblx0ICogPHRkPjxiPm9FcnJvci5wYXJhbXM8L2I+PC90ZD5cblx0ICogPHRkPkFuIGFycmF5IG9mIG9iamVjdHMgKHR5cGljYWxseSBzdHJpbmdzKSB0aGF0IGRlc2NyaWJlIGFkZGl0aW9uYWwgdmFsdWUgcGFyYW1ldGVycyByZXF1aXJlZCBmb3IgZ2VuZXJhdGluZyB0aGUgbWVzc2FnZTwvdGQ+XG5cdCAqIDwvdGFibGU+LlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqIEBmdW5jdGlvbiBuYXZpZ2F0ZVxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLm5hdmlnYXRpb24uTmF2aWdhdGlvbkhhbmRsZXIucHJvdG90eXBlXG5cdCAqIEBwYXJhbSBzU2VtYW50aWNPYmplY3QgTmFtZSBvZiB0aGUgc2VtYW50aWMgb2JqZWN0IG9mIHRoZSB0YXJnZXQgYXBwXG5cdCAqIEBwYXJhbSBzQWN0aW9uTmFtZSBOYW1lIG9mIHRoZSBhY3Rpb24gb2YgdGhlIHRhcmdldCBhcHBcblx0ICogQHBhcmFtIHZOYXZpZ2F0aW9uUGFyYW1ldGVycyBOYXZpZ2F0aW9uIHBhcmFtZXRlcnMgYXMgYW4gb2JqZWN0IHdpdGgga2V5L3ZhbHVlIHBhaXJzIG9yIGFzIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHN1Y2ggYW4gb2JqZWN0LiBJZiBwYXNzZWQgYXMgYW4gb2JqZWN0LCB0aGUgcHJvcGVydGllcyBhcmUgbm90IGNoZWNrZWQgYWdhaW5zdCB0aGUgPGNvZGU+SXNQb3RlbnRpYWxTZW5zaXRpdmU8L2NvZGU+IG9yIDxjb2RlPk1lYXN1cmU8L2NvZGU+IHR5cGUuXG5cdCAqIEBwYXJhbSBvSW5uZXJBcHBEYXRhIE9iamVjdCBmb3Igc3RvcmluZyBjdXJyZW50IHN0YXRlIG9mIHRoZSBhcHBcblx0ICogQHBhcmFtIGZuT25FcnJvciBDYWxsYmFjayB0aGF0IGlzIGNhbGxlZCBpZiBhbiBlcnJvciBvY2N1cnMgZHVyaW5nIG5hdmlnYXRpb24gPGJyPlxuXHQgKiBAcGFyYW0gb0V4dGVybmFsQXBwRGF0YSBPYmplY3QgZm9yIHN0b3JpbmcgdGhlIHN0YXRlIHdoaWNoIHdpbGwgYmUgZm9yd2FyZGVkIHRvIHRoZSB0YXJnZXQgY29tcG9uZW50LlxuXHQgKiBAcGFyYW0gb0V4dGVybmFsQXBwRGF0YS5wcmVzZW50YXRpb25WYXJpYW50IE9iamVjdCBjb250YWluaW5nIHRoZSBjdXJyZW50IHVpIHN0YXRlIG9mIHRoZSBhcHAgd2hpY2ggd2lsbCBiZSBmb3J3YXJkZWQgdG8gdGhlXG5cdCAqICAgICAgICB0YXJnZXQgY29tcG9uZW50LlxuXHQgKiBAcGFyYW0gb0V4dGVybmFsQXBwRGF0YS52YWx1ZVRleHRzIE9iamVjdCBjb250YWluaW5nIHZhbHVlIGRlc2NyaXB0aW9ucyB3aGljaCB3aWxsIGJlIGZvcndhcmRlZCB0byB0aGUgdGFyZ2V0IGNvbXBvbmVudC5cblx0ICogQHBhcmFtIG9FeHRlcm5hbEFwcERhdGEuc2VsZWN0aW9uVmFyaWFudCBTdHJpbmdpZmllZCBKU09OIG9iamVjdCwgd2hpY2ggd2lsbCBiZSBmb3J3YXJkZWQgdG8gdGhlIHRhcmdldCBjb21wb25lbnQuIElmIG5vdFxuXHQgKiAgICAgICAgcHJvdmlkZWQgdGhlIHNlbGVjdGlvblZhcmlhbnQgd2lsbCBiZSBjb25zdHJ1Y3RlZCBiYXNlZCBvbiB0aGUgdk5hdmlnYXRpb25QYXJhbWV0ZXJzLlxuXHQgKiBAcGFyYW0gc05hdk1vZGUgQXJndW1lbnQgaXMgdXNlZCB0byBvdmVyd3JpdGUgdGhlIEZMUC1jb25maWd1cmVkIHRhcmdldCBmb3Igb3BlbmluZyBhIFVSTC4gSWYgdXNlZCwgb25seSB0aGVcblx0ICogICAgICAgIDxjb2RlPmV4cGxhY2U8L2NvZGU+IG9yIDxjb2RlPmlucGxhY2U8L2NvZGU+IHZhbHVlcyBhcmUgYWxsb3dlZC4gQW55IG90aGVyIHZhbHVlIHdpbGwgbGVhZCB0byBhbiBleGNlcHRpb25cblx0ICogICAgICAgIDxjb2RlPk5hdmlnYXRpb25IYW5kbGVyLklOVkFMSURfTkFWX01PREU8L2NvZGU+LlxuXHQgKiBAZXhhbXBsZSA8Y29kZT5cblx0ICogc2FwLnVpLmRlZmluZShbXCJzYXAvZmUvbmF2aWdhdGlvbi9OYXZpZ2F0aW9uSGFuZGxlclwiLCBcInNhcC9mZS9uYXZpZ2F0aW9uL1NlbGVjdGlvblZhcmlhbnRcIl0sIGZ1bmN0aW9uIChOYXZpZ2F0aW9uSGFuZGxlciwgU2VsZWN0aW9uVmFyaWFudCkge1xuXHQgKiBcdHZhciBvTmF2aWdhdGlvbkhhbmRsZXIgPSBuZXcgTmF2aWdhdGlvbkhhbmRsZXIob0NvbnRyb2xsZXIpO1xuXHQgKiBcdHZhciBzU2VtYW50aWNPYmplY3QgPSBcIlNhbGVzT3JkZXJcIjtcblx0ICogXHR2YXIgc0FjdGlvbk5hbWUgPSBcImNyZWF0ZVwiO1xuXHQgKlxuXHQgKiBcdC8vc2ltcGxlIHBhcmFtZXRlcnMgYXMgT2JqZWN0XG5cdCAqIFx0dmFyIHZOYXZpZ2F0aW9uUGFyYW1ldGVycyA9IHtcblx0ICogXHRcdENvbXBhbnlDb2RlIDogXCIwMDAxXCIsXG5cdCAqIFx0XHRDdXN0b21lciA6IFwiQzAwMDFcIlxuXHQgKiBcdH07XG5cdCAqXG5cdCAqIFx0Ly9vciBhcyBzZWxlY3Rpb24gdmFyaWFudFxuXHQgKiBcdHZhciBvU2VsZWN0aW9uVmFyaWFudCA9IG5ldyBTZWxlY3Rpb25WYXJpYW50KCk7XG5cdCAqXHQgb1NlbGVjdGlvblZhcmlhbnQuYWRkU2VsZWN0T3B0aW9uKFwiQ29tcGFueUNvZGVcIiwgXCJJXCIsIFwiRVFcIiwgXCIwMDAxXCIpO1xuXHQgKiBcdG9TZWxlY3Rpb25WYXJpYW50LmFkZFNlbGVjdE9wdGlvbihcIkN1c3RvbWVyXCIsIFwiSVwiLCBcIkVRXCIsIFwiQzAwMDFcIik7XG5cdCAqIFx0dk5hdmlnYXRpb25QYXJhbWV0ZXJzID0gb1NlbGVjdGlvblZhcmlhbnQudG9KU09OU3RyaW5nKCk7XG5cdCAqXG5cdCAqIFx0Ly9vciBkaXJlY3RseSBmcm9tIFNtYXJ0RmlsdGVyQmFyXG5cdCAqIFx0dk5hdmlnYXRpb25QYXJhbWV0ZXJzID0gb1NtYXJ0RmlsdGVyQmFyLmdldERhdGFTdWl0ZUZvcm1hdCgpO1xuXHQgKlxuXHQgKiBcdC8vYXBwIHN0YXRlIGZvciBiYWNrIG5hdmlnYXRpb25cblx0ICpcdCB2YXIgb0lubmVyQXBwRGF0YSA9IHtcblx0ICogXHRcdHNlbGVjdGlvblZhcmlhbnQgOiBvU21hcnRGaWx0ZXJCYXIuZ2V0RGF0YVN1aXRlRm9ybWF0KCksXG5cdCAqIFx0XHR0YWJsZVZhcmlhbnRJZCA6IG9TbWFydFRhYmxlLmdldEN1cnJlbnRWYXJpYW50SWQoKSxcblx0ICogXHRcdGN1c3RvbURhdGEgOiBvTXlDdXN0b21EYXRhXG5cdCAqIFx0fTtcblx0ICpcblx0ICogXHQvLyBjYWxsYmFjayBmdW5jdGlvbiBpbiBjYXNlIG9mIGVycm9yc1xuXHQgKiBcdHZhciBmbk9uRXJyb3IgPSBmdW5jdGlvbihvRXJyb3Ipe1xuXHQgKiBcdFx0dmFyIG9pMThuID0gb0NvbnRyb2xsZXIuZ2V0VmlldygpLmdldE1vZGVsKFwiaTE4blwiKS5nZXRSZXNvdXJjZUJ1bmRsZSgpO1xuXHQgKiBcdFx0b0Vycm9yLnNldFVJVGV4dCh7b2kxOG4gOiBvaTE4biwgc1RleHRLZXkgOiBcIk9VVEJPVU5EX05BVl9FUlJPUlwifSk7XG5cdCAqIFx0XHRvRXJyb3Iuc2hvd01lc3NhZ2VCb3goKTtcblx0ICogXHR9O1xuXHQgKlxuXHQgKiBcdG9OYXZpZ2F0aW9uSGFuZGxlci5uYXZpZ2F0ZShzU2VtYW50aWNPYmplY3QsIHNBY3Rpb25OYW1lLCB2TmF2aWdhdGlvblBhcmFtZXRlcnMsIG9Jbm5lckFwcERhdGEsIGZuT25FcnJvcik7XG5cdCAqIH0pO1xuXHQgKiA8L2NvZGU+XG5cdCAqL1xuXHRuYXZpZ2F0ZShcblx0XHRzU2VtYW50aWNPYmplY3Q6IHN0cmluZyxcblx0XHRzQWN0aW9uTmFtZTogc3RyaW5nLFxuXHRcdHZOYXZpZ2F0aW9uUGFyYW1ldGVyczogb2JqZWN0IHwgc3RyaW5nLFxuXHRcdG9Jbm5lckFwcERhdGE/OiBJbm5lckFwcERhdGEsXG5cdFx0Zm5PbkVycm9yPzogRnVuY3Rpb24sXG5cdFx0b0V4dGVybmFsQXBwRGF0YT86IHtcblx0XHRcdHZhbHVlVGV4dHM/OiBvYmplY3QgfCB1bmRlZmluZWQ7XG5cdFx0XHRwcmVzZW50YXRpb25WYXJpYW50Pzogb2JqZWN0IHwgdW5kZWZpbmVkO1xuXHRcdFx0c2VsZWN0aW9uVmFyaWFudD86IG9iamVjdCB8IHVuZGVmaW5lZDtcblx0XHR9LFxuXHRcdHNOYXZNb2RlPzogc3RyaW5nXG5cdCkge1xuXHRcdGxldCBzU2VsZWN0aW9uVmFyaWFudDogYW55LFxuXHRcdFx0bVBhcmFtZXRlcnMsXG5cdFx0XHRvWEFwcERhdGFPYmo6IGFueSxcblx0XHRcdG9TdGFydHVwUGFyYW1ldGVycyxcblx0XHRcdGJFeFBsYWNlID0gZmFsc2UsXG5cdFx0XHRvVG1wRGF0YTogYW55ID0ge307XG5cdFx0Y29uc3Qgb05hdkhhbmRsZXI6IE5hdmlnYXRpb25IYW5kbGVyID0gdGhpcztcblxuXHRcdGNvbnN0IG9Db21wb25lbnREYXRhID0gdGhpcy5vQ29tcG9uZW50LmdldENvbXBvbmVudERhdGEoKTtcblx0XHQvKlxuXHRcdCAqIFRoZXJlIGFyZSBzb21lIHJhY2UgY29uZGl0aW9ucyB3aGVyZSB0aGUgb0NvbXBvbmVudERhdGEgbWF5IG5vdCBiZSBzZXQsIGZvciBleGFtcGxlIGluIGNhc2UgdGhlIFVTaGVsbCB3YXMgbm90IGluaXRpYWxpemVkIHByb3Blcmx5LiBUb1xuXHRcdCAqIG1ha2Ugc3VyZSB0aGF0IHdlIGRvIG5vdCBkdW1wIGhlcmUgd2l0aCBhbiBleGNlcHRpb24sIHdlIHRha2UgdGhpcyBzcGVjaWFsIGVycm9yIGhhbmRsaW5nIGJlaGF2aW9yOlxuXHRcdCAqL1xuXHRcdGlmIChvQ29tcG9uZW50RGF0YSkge1xuXHRcdFx0b1N0YXJ0dXBQYXJhbWV0ZXJzID0gb0NvbXBvbmVudERhdGEuc3RhcnR1cFBhcmFtZXRlcnM7XG5cblx0XHRcdGlmIChcblx0XHRcdFx0b1N0YXJ0dXBQYXJhbWV0ZXJzICYmXG5cdFx0XHRcdG9TdGFydHVwUGFyYW1ldGVyc1tcInNhcC11c2hlbGwtbmV4dC1uYXZtb2RlXCJdICYmXG5cdFx0XHRcdG9TdGFydHVwUGFyYW1ldGVyc1tcInNhcC11c2hlbGwtbmV4dC1uYXZtb2RlXCJdLmxlbmd0aCA+IDBcblx0XHRcdCkge1xuXHRcdFx0XHQvLyBiRXhQbGFjZSA9IChKU09OLnBhcnNlKG9TdGFydHVwUGFyYW1ldGVyc1tcInNhcC11c2hlbGwtbmV4dC1uYXZtb2RlXCJdWzBdKSA9PT0gXCJleHBsYWNlXCIpO1xuXHRcdFx0XHRiRXhQbGFjZSA9IG9TdGFydHVwUGFyYW1ldGVyc1tcInNhcC11c2hlbGwtbmV4dC1uYXZtb2RlXCJdWzBdID09PSBcImV4cGxhY2VcIjtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBvbmx5IG5hdi1tb2RlICdpbnBsYWNlJyBvciAnZXhwbGFjZScgYXJlIHN1cHBvcnRlZC4gQW55IG90aGVyIHZhbHVlIHdpbGwgbGVhZCB0byBhbiBleGNlcHRpb24uXG5cdFx0aWYgKHNOYXZNb2RlICYmIChzTmF2TW9kZSA9PT0gXCJpbnBsYWNlXCIgfHwgc05hdk1vZGUgPT09IFwiZXhwbGFjZVwiKSkge1xuXHRcdFx0YkV4UGxhY2UgPSBzTmF2TW9kZSA9PT0gXCJleHBsYWNlXCI7XG5cdFx0fSBlbHNlIGlmIChzTmF2TW9kZSkge1xuXHRcdFx0dGhyb3cgbmV3IE5hdkVycm9yKFwiTmF2aWdhdGlvbkhhbmRsZXIuSU5WQUxJRF9OQVZfTU9ERVwiKTtcblx0XHR9XG5cblx0XHRpZiAob0V4dGVybmFsQXBwRGF0YSA9PT0gdW5kZWZpbmVkIHx8IG9FeHRlcm5hbEFwcERhdGEgPT09IG51bGwpIHtcblx0XHRcdG9YQXBwRGF0YU9iaiA9IHt9O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRvWEFwcERhdGFPYmogPSBvRXh0ZXJuYWxBcHBEYXRhO1xuXHRcdH1cblxuXHRcdC8vIGZvciBuYXZpZ2F0aW9uIHdlIG5lZWQgVVJMIHBhcmFtZXRlcnMgKGxlZ2FjeSBuYXZpZ2F0aW9uKSBhbmQgc2FwLXhhcHAtc3RhdGUsIHRoZXJlZm9yZSB3ZSBuZWVkIHRvIGNyZWF0ZSB0aGUgbWlzc2luZyBvbmUgZnJvbSB0aGVcblx0XHQvLyBwYXNzZWQgb25lXG5cdFx0aWYgKHR5cGVvZiB2TmF2aWdhdGlvblBhcmFtZXRlcnMgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdHNTZWxlY3Rpb25WYXJpYW50ID0gdk5hdmlnYXRpb25QYXJhbWV0ZXJzO1xuXHRcdH0gZWxzZSBpZiAodHlwZW9mIHZOYXZpZ2F0aW9uUGFyYW1ldGVycyA9PT0gXCJvYmplY3RcIikge1xuXHRcdFx0Y29uc3Qgb0VucmljaGVkU2VsVmFyID0gdGhpcy5fc3BsaXRJbmJvdW5kTmF2aWdhdGlvblBhcmFtZXRlcnMoXG5cdFx0XHRcdG5ldyBTZWxlY3Rpb25WYXJpYW50KCksXG5cdFx0XHRcdHZOYXZpZ2F0aW9uUGFyYW1ldGVycyxcblx0XHRcdFx0W11cblx0XHRcdCkub05hdmlnYXRpb25TZWxWYXI7XG5cdFx0XHRzU2VsZWN0aW9uVmFyaWFudCA9IG9FbnJpY2hlZFNlbFZhci50b0pTT05TdHJpbmcoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhyb3cgbmV3IE5hdkVycm9yKFwiTmF2aWdhdGlvbkhhbmRsZXIuSU5WQUxJRF9JTlBVVFwiKTtcblx0XHR9XG5cblx0XHRvVG1wRGF0YS5zZWxlY3Rpb25WYXJpYW50ID0gbmV3IFNlbGVjdGlvblZhcmlhbnQoc1NlbGVjdGlvblZhcmlhbnQpO1xuXHRcdGlmICh0eXBlb2Ygdk5hdmlnYXRpb25QYXJhbWV0ZXJzID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRvVG1wRGF0YS5zZWxlY3Rpb25WYXJpYW50ID0gdGhpcy5fcmVtb3ZlVGVjaG5pY2FsUGFyYW1ldGVycyhvVG1wRGF0YS5zZWxlY3Rpb25WYXJpYW50KTtcblx0XHR9XG5cdFx0b1RtcERhdGEuc2VsZWN0aW9uVmFyaWFudCA9IG9UbXBEYXRhLnNlbGVjdGlvblZhcmlhbnQgJiYgb1RtcERhdGEuc2VsZWN0aW9uVmFyaWFudC50b0pTT05PYmplY3QoKTtcblx0XHRvVG1wRGF0YSA9IHRoaXMuX3JlbW92ZU1lYXN1cmVCYXNlZEluZm9ybWF0aW9uKG9UbXBEYXRhKTsgLy8gcmVtb3ZlIGV2ZW50dWFsIG1lYXN1cmVzXG5cdFx0b1RtcERhdGEgPSB0aGlzLl9jaGVja0lzUG90ZW50aWFsbHlTZW5zaXRpdmUob1RtcERhdGEpOyAvLyByZW1vdmUgZXZlbnR1YWwgc2Vuc2l0aXZlIGRhdGFcblxuXHRcdGlmIChvVG1wRGF0YS5zZWxlY3Rpb25WYXJpYW50KSB7XG5cdFx0XHRtUGFyYW1ldGVycyA9IHRoaXMuX2dldFVSTFBhcmFtZXRlcnNGcm9tU2VsZWN0aW9uVmFyaWFudChuZXcgU2VsZWN0aW9uVmFyaWFudChvVG1wRGF0YS5zZWxlY3Rpb25WYXJpYW50KSk7XG5cdFx0XHRzU2VsZWN0aW9uVmFyaWFudCA9IG5ldyBTZWxlY3Rpb25WYXJpYW50KG9UbXBEYXRhLnNlbGVjdGlvblZhcmlhbnQpLnRvSlNPTlN0cmluZygpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRtUGFyYW1ldGVycyA9IHt9O1xuXHRcdFx0c1NlbGVjdGlvblZhcmlhbnQgPSBudWxsO1xuXHRcdH1cblxuXHRcdGNvbnN0IG9OYXZBcmd1bWVudHM6IGFueSA9IHtcblx0XHRcdHRhcmdldDoge1xuXHRcdFx0XHRzZW1hbnRpY09iamVjdDogc1NlbWFudGljT2JqZWN0LFxuXHRcdFx0XHRhY3Rpb246IHNBY3Rpb25OYW1lXG5cdFx0XHR9LFxuXHRcdFx0cGFyYW1zOiBtUGFyYW1ldGVycyB8fCB7fVxuXHRcdH07XG5cblx0XHRjb25zdCBmbk5hdmlnYXRlID0gZnVuY3Rpb24gKG9Dcm9zc0FwcE5hdlNlcnZpY2U6IGFueSkge1xuXHRcdFx0aWYgKCFvWEFwcERhdGFPYmouc2VsZWN0aW9uVmFyaWFudCkge1xuXHRcdFx0XHRvWEFwcERhdGFPYmouc2VsZWN0aW9uVmFyaWFudCA9IHNTZWxlY3Rpb25WYXJpYW50O1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBmbk5hdkV4cGxhY2UgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdGNvbnN0IHNOZXdIcmVmUHJvbWlzZSA9IG9Dcm9zc0FwcE5hdlNlcnZpY2UuaHJlZkZvckV4dGVybmFsQXN5bmMob05hdkFyZ3VtZW50cywgb05hdkhhbmRsZXIub0NvbXBvbmVudCk7XG5cdFx0XHRcdHNOZXdIcmVmUHJvbWlzZVxuXHRcdFx0XHRcdC50aGVuKGZ1bmN0aW9uIChzTmV3SHJlZjogYW55KSB7XG5cdFx0XHRcdFx0XHRvcGVuV2luZG93KHNOZXdIcmVmKTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdC5jYXRjaChmdW5jdGlvbiAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIHJldGlyZXZpbmcgaHJlZkZvckV4dGVybmFsIDogXCIgKyBvRXJyb3IpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0fTtcblxuXHRcdFx0b1hBcHBEYXRhT2JqID0gb05hdkhhbmRsZXIuX3JlbW92ZU1lYXN1cmVCYXNlZEluZm9ybWF0aW9uKG9YQXBwRGF0YU9iaik7XG5cdFx0XHRyZXR1cm4gb05hdkhhbmRsZXIuX2ZuU2F2ZUFwcFN0YXRlQXN5bmMob1hBcHBEYXRhT2JqLCBmbk9uRXJyb3IpLnRoZW4oZnVuY3Rpb24gKG9TYXZlQXBwU3RhdGVSZXR1cm46IGFueSkge1xuXHRcdFx0XHRpZiAob1NhdmVBcHBTdGF0ZVJldHVybikge1xuXHRcdFx0XHRcdG9OYXZBcmd1bWVudHMuYXBwU3RhdGVLZXkgPSBvU2F2ZUFwcFN0YXRlUmV0dXJuLmFwcFN0YXRlS2V5O1xuXG5cdFx0XHRcdFx0Ly8gUmVtYXJrOlxuXHRcdFx0XHRcdC8vIFRoZSBDcm9zcyBBcHAgU2VydmljZSB0YWtlcyBjYXJlIG9mIGVuY29kaW5nIHBhcmFtZXRlciBrZXlzIGFuZCB2YWx1ZXMuIEV4YW1wbGU6XG5cdFx0XHRcdFx0Ly8gbVBhcmFtcyA9IHsgXCIkQCVcIiA6IFwiJi89XCIgfSByZXN1bHRzIGluIHRoZSBVUkwgcGFyYW1ldGVyICUyNTI0JTI1NDAlMjUyNT0lMjUyNiUyNTJGJTI1M0Rcblx0XHRcdFx0XHQvLyBOb3RlIHRoZSBkb3VibGUgZW5jb2RpbmcsIHRoaXMgaXMgY29ycmVjdC5cblxuXHRcdFx0XHRcdC8vIHRvRXh0ZXJuYWwgc2V0cyBzYXAteGFwcC1zdGF0ZSBpbiB0aGUgVVJMIGlmIGFwcFN0YXRlS2V5IGlzIHByb3ZpZGVkIGluIG9OYXZBcmd1bWVudHNcblx0XHRcdFx0XHQvLyB0b0V4dGVybmFsIGhhcyBpc3N1ZXMgb24gc3RpY2t5IGFwcHMgRklPUklURUNIUDEtMTQ0MDAsIHRlbXAgZml4IHVzaW5nIGhyZWZGb3JFeHRlcm5hbFxuXHRcdFx0XHRcdGlmIChzTmF2TW9kZSA9PSBcImV4cGxhY2VcIikge1xuXHRcdFx0XHRcdFx0Zm5OYXZFeHBsYWNlKCk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGNvbnN0IHB0b0V4dCA9IG9Dcm9zc0FwcE5hdlNlcnZpY2UudG9FeHRlcm5hbChvTmF2QXJndW1lbnRzLCBvTmF2SGFuZGxlci5vQ29tcG9uZW50KTtcblx0XHRcdFx0XHRcdC8vIFRPRE86IFRoaXMgaXMganVzdCBhIHRlbXBvcmFyeSBzb2x1dGlvbiB0byBhbGxvdyBGRSBWMiB0byB1c2UgdG9FeHRlcm5hbCBwcm9taXNlLlxuXHRcdFx0XHRcdFx0aWYgKG9OYXZIYW5kbGVyLl9uYXZpZ2F0ZUNhbGxiYWNrKSB7XG5cdFx0XHRcdFx0XHRcdG9OYXZIYW5kbGVyLl9uYXZpZ2F0ZUNhbGxiYWNrKHB0b0V4dCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IC8vIGVsc2UgOiBlcnJvciB3YXMgYWxyZWFkeSByZXBvcnRlZFxuXHRcdFx0fSk7XG5cdFx0fTtcblx0XHRjb25zdCBmblN0b3JlQW5kTmF2aWdhdGUgPSBmdW5jdGlvbiAob0Nyb3NzQXBwTmF2U2VydmljZTogYW55KSB7XG5cdFx0XHRvTmF2SGFuZGxlclxuXHRcdFx0XHQuc3RvcmVJbm5lckFwcFN0YXRlQXN5bmMob0lubmVyQXBwRGF0YSBhcyBhbnksIHRydWUpXG5cdFx0XHRcdC50aGVuKGZ1bmN0aW9uIChzQXBwU3RhdGVLZXk6IGFueSkge1xuXHRcdFx0XHRcdGlmIChzQXBwU3RhdGVLZXkpIHtcblx0XHRcdFx0XHRcdG9OYXZIYW5kbGVyLnJlcGxhY2VIYXNoKHNBcHBTdGF0ZUtleSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiBmbk5hdmlnYXRlKG9Dcm9zc0FwcE5hdlNlcnZpY2UpO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24gKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdFx0aWYgKGZuT25FcnJvcikge1xuXHRcdFx0XHRcdFx0Zm5PbkVycm9yKG9FcnJvcik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHR9O1xuXHRcdGlmIChzTmF2TW9kZSkge1xuXHRcdFx0b05hdkFyZ3VtZW50cy5wYXJhbXNbXCJzYXAtdXNoZWxsLW5hdm1vZGVcIl0gPSBiRXhQbGFjZSA/IFwiZXhwbGFjZVwiIDogXCJpbnBsYWNlXCI7XG5cdFx0fVxuXHRcdG9OYXZIYW5kbGVyXG5cdFx0XHQuX2dldEFwcE5hdmlnYXRpb25TZXJ2aWNlQXN5bmMoKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKG9Dcm9zc0FwcE5hdlNlcnZpY2U6IGFueSkge1xuXHRcdFx0XHRjb25zdCBvU3VwcG9ydGVkUHJvbWlzZSA9IG9Dcm9zc0FwcE5hdlNlcnZpY2UuaXNOYXZpZ2F0aW9uU3VwcG9ydGVkKFtvTmF2QXJndW1lbnRzXSwgb05hdkhhbmRsZXIub0NvbXBvbmVudCk7XG5cdFx0XHRcdG9TdXBwb3J0ZWRQcm9taXNlLmRvbmUoZnVuY3Rpb24gKG9UYXJnZXRzOiBhbnkpIHtcblx0XHRcdFx0XHRpZiAob1RhcmdldHNbMF0uc3VwcG9ydGVkKSB7XG5cdFx0XHRcdFx0XHRpZiAoIWJFeFBsYWNlKSB7XG5cdFx0XHRcdFx0XHRcdGZuU3RvcmVBbmROYXZpZ2F0ZShvQ3Jvc3NBcHBOYXZTZXJ2aWNlKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGZuTmF2aWdhdGUob0Nyb3NzQXBwTmF2U2VydmljZSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSBlbHNlIGlmIChmbk9uRXJyb3IpIHtcblx0XHRcdFx0XHRcdC8vIGludGVudCBpcyBub3Qgc3VwcG9ydGVkXG5cdFx0XHRcdFx0XHRjb25zdCBvRXJyb3IgPSBuZXcgTmF2RXJyb3IoXCJOYXZpZ2F0aW9uSGFuZGxlci5pc0ludGVudFN1cHBvcnRlZC5ub3RTdXBwb3J0ZWRcIik7XG5cdFx0XHRcdFx0XHRmbk9uRXJyb3Iob0Vycm9yKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdGlmIChmbk9uRXJyb3IpIHtcblx0XHRcdFx0XHRvU3VwcG9ydGVkUHJvbWlzZS5mYWlsKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdC8vIHRlY2huaWNhbCBlcnJvcjogY291bGQgbm90IGRldGVybWluZSBpZiBpbnRlbnQgaXMgc3VwcG9ydGVkXG5cdFx0XHRcdFx0XHRjb25zdCBvRXJyb3IgPSBvTmF2SGFuZGxlci5fY3JlYXRlVGVjaG5pY2FsRXJyb3IoXCJOYXZpZ2F0aW9uSGFuZGxlci5pc0ludGVudFN1cHBvcnRlZC5mYWlsZWRcIik7XG5cdFx0XHRcdFx0XHRmbk9uRXJyb3Iob0Vycm9yKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbiAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0aWYgKGZuT25FcnJvcikge1xuXHRcdFx0XHRcdGZuT25FcnJvcihvRXJyb3IpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBQYXJzZXMgdGhlIGluY29taW5nIFVSTCBhbmQgcmV0dXJucyBhIFByb21pc2UuIElmIHRoaXMgbWV0aG9kIGRldGVjdHMgYSBiYWNrIG5hdmlnYXRpb24sIHRoZSBpbm5lciBhcHAgc3RhdGUgaXMgcmV0dXJuZWQgaW4gdGhlIHJlc29sdmVkXG5cdCAqIFByb21pc2UuIE90aGVyd2lzZSBzdGFydHVwIHBhcmFtZXRlcnMgd2lsbCBiZSBtZXJnZWQgaW50byB0aGUgYXBwIHN0YXRlIHByb3ZpZGVkIGJ5IGNyb3NzIGFwcCBuYXZpZ2F0aW9uLCBhbmQgYSBjb21iaW5lZCBhcHAgc3RhdGUgd2lsbCBiZVxuXHQgKiByZXR1cm5lZC4gVGhlIGNvbmZsaWN0IHJlc29sdXRpb24gY2FuIGJlIGluZmx1ZW5jZWQgd2l0aCBzUGFyYW1IYW5kbGluZ01vZGUgZGVmaW5lZCBpbiB0aGUgY29uc3RydWN0b3IuXG5cdCAqXG5cdCAqIEByZXR1cm5zIEEgUHJvbWlzZSBvYmplY3QgdG8gbW9uaXRvciB3aGVuIGFsbCB0aGUgYWN0aW9ucyBvZiB0aGUgZnVuY3Rpb24gaGF2ZSBiZWVuIGV4ZWN1dGVkLiBJZiB0aGUgZXhlY3V0aW9uIGlzIHN1Y2Nlc3NmdWwsIHRoZVxuXHQgKiAgICAgICAgICBleHRyYWN0ZWQgYXBwIHN0YXRlLCB0aGUgc3RhcnR1cCBwYXJhbWV0ZXJzLCBhbmQgdGhlIHR5cGUgb2YgbmF2aWdhdGlvbiBhcmUgcmV0dXJuZWQsIHNlZSBhbHNvIHRoZSBleGFtcGxlIGFib3ZlLiBUaGUgYXBwIHN0YXRlIGlzXG5cdCAqICAgICAgICAgIGFuIG9iamVjdCB0aGF0IGNvbnRhaW5zIHRoZSBmb2xsb3dpbmcgaW5mb3JtYXRpb246XG5cdCAqICAgICAgICAgIDx1bD5cblx0ICogICAgICAgICAgPGxpPjxjb2RlPm9BcHBEYXRhLm9TZWxlY3Rpb25WYXJpYW50PC9jb2RlPjogQW4gaW5zdGFuY2Ugb2Yge0BsaW5rIHNhcC5mZS5uYXZpZ2F0aW9uLlNlbGVjdGlvblZhcmlhbnR9XG5cdCAqICAgICAgICAgIGNvbnRhaW5pbmcgb25seSBwYXJhbWV0ZXJzL3NlbGVjdCBvcHRpb25zIHRoYXQgYXJlIHJlbGF0ZWQgdG8gbmF2aWdhdGlvbjwvbGk+XG5cdCAqICAgICAgICAgIDxsaT48Y29kZT5vQXBwRGF0YS5zZWxlY3Rpb25WYXJpYW50PC9jb2RlPjogVGhlIG5hdmlnYXRpb24tcmVsYXRlZCBzZWxlY3Rpb24gdmFyaWFudCBhcyBhIEpTT04tZm9ybWF0dGVkIHN0cmluZzwvbGk+XG5cdCAqICAgICAgICAgIDxsaT48Y29kZT5vQXBwRGF0YS5vRGVmYXVsdGVkU2VsZWN0aW9uVmFyaWFudDwvY29kZT46IEFuIGluc3RhbmNlIG9mXG5cdCAqICAgICAgICAgIHtAbGluayBzYXAuZmUubmF2aWdhdGlvbi5TZWxlY3Rpb25WYXJpYW50fSBjb250YWluaW5nIG9ubHkgdGhlIHBhcmFtZXRlcnMvc2VsZWN0IG9wdGlvbnMgdGhhdCBhcmUgc2V0IGJ5IHVzZXJcblx0ICogICAgICAgICAgZGVmYXVsdCBkYXRhPC9saT5cblx0ICogICAgICAgICAgPGxpPjxjb2RlPm9BcHBEYXRhLmJOYXZTZWxWYXJIYXNEZWZhdWx0c09ubHk8L2NvZGU+OiBBIEJvb2xlYW4gZmxhZyB0aGF0IGluZGljYXRlcyB3aGV0aGVyIG9ubHkgZGVmYXVsdGVkIHBhcmFtZXRlcnMgYW5kIG5vXG5cdCAqICAgICAgICAgIG5hdmlnYXRpb24gcGFyYW1ldGVycyBhcmUgcHJlc2VudC48YnI+XG5cdCAqICAgICAgICAgIDxiPk5vdGU6PC9iPiBJZiBubyBuYXZpZ2F0aW9uIHBhcmFtZXRlcnMgYXJlIGF2YWlsYWJsZSwgPGNvZGU+Yk5hdlNlbFZhckhhc0RlZmF1bHRzT25seTwvY29kZT4gaXMgc2V0IHRvIDxjb2RlPnRydWU8L2NvZGU+LFxuXHQgKiAgICAgICAgICBldmVuIHRob3VnaCBwYXJhbWV0ZXJzIHdpdGhvdXQgZGVmYXVsdCBtaWdodCBiZSBhdmFpbGFibGUgYXMgd2VsbC48L2xpPlxuXHQgKiAgICAgICAgICA8L3VsPlxuXHQgKiAgICAgICAgICBJZiB0aGUgbmF2aWdhdGlvbi1yZWxhdGVkIHNlbGVjdGlvbiB2YXJpYW50IGlzIGVtcHR5LCBpdCBpcyByZXBsYWNlZCBieSBhIGNvcHkgb2YgdGhlIGRlZmF1bHRlZCBzZWxlY3Rpb24gdmFyaWFudC48YnI+XG5cdCAqICAgICAgICAgIFRoZSBuYXZpZ2F0aW9uIHR5cGUgaXMgYW4gZW51bWVyYXRpb24gdHlwZSBvZiB0eXBlIHtAbGluayBzYXAuZmUubmF2aWdhdGlvbi5OYXZUeXBlfSAocG9zc2libGUgdmFsdWVzIGFyZVxuXHQgKiAgICAgICAgICBpbml0aWFsLCBVUkxQYXJhbXMsIHhBcHBTdGF0ZSwgYW5kIGlBcHBTdGF0ZSkuPGJyPlxuXHQgKiAgICAgICAgICA8Yj5Ob3RlOjwvYj4gSWYgdGhlIG5hdmlnYXRpb24gdHlwZSBpcyB7QGxpbmsgc2FwLmZlLm5hdmlnYXRpb24uTmF2VHlwZS5pQXBwU3RhdGV9IG9BcHBEYXRhIGhhcyB0d29cblx0ICogICAgICAgICAgYWRkaXRpb25hbCBwcm9wZXJ0aWVzXG5cdCAqICAgICAgICAgIDx1bD5cblx0ICogICAgICAgICAgPGxpPjxjb2RlPm9BcHBEYXRhLnRhYmxlVmFyaWFudElkPC9jb2RlPjwvbGk+XG5cdCAqICAgICAgICAgIDxsaT48Y29kZT5vQXBwRGF0YS5jdXN0b21EYXRhPC9jb2RlPjwvbGk+XG5cdCAqICAgICAgICAgIDwvdWw+XG5cdCAqICAgICAgICAgIHdoaWNoIHJldHVybiB0aGUgaW5uZXIgYXBwIGRhdGEgYXMgc3RvcmVkIGluIHtAbGluayAjLm5hdmlnYXRlIG5hdmlnYXRlfSBvciB7QGxpbmsgIy5zdG9yZUlubmVyQXBwU3RhdGVBc3luYyBzdG9yZUlubmVyQXBwU3RhdGVBc3luY30uXG5cdCAqICAgICAgICAgIDxjb2RlPm9BcHBEYXRhLm9EZWZhdWx0ZWRTZWxlY3Rpb25WYXJpYW50PC9jb2RlPiBpcyBhbiBlbXB0eSBzZWxlY3Rpb24gdmFyaWFudCBhbmRcblx0ICogICAgICAgICAgPGNvZGU+b0FwcERhdGEuYk5hdlNlbFZhckhhc0RlZmF1bHRzT25seTwvY29kZT4gaXMgPGNvZGU+ZmFsc2U8L2NvZGU+IGluIHRoaXMgY2FzZS48YnI+XG5cdCAqICAgICAgICAgIDxiPk5vdGU6PC9iPiBJZiB0aGUgbmF2aWdhdGlvbiB0eXBlIGlzIHtAbGluayBzYXAuZmUubmF2aWdhdGlvbi5OYXZUeXBlLmluaXRpYWx9IG9BcHBEYXRhIGlzIGFuIGVtcHR5IG9iamVjdCE8YnI+XG5cdCAqICAgICAgICAgIElmIGFuIGVycm9yIG9jY3VycywgYW4gZXJyb3Igb2JqZWN0IG9mIHR5cGUge0BsaW5rIHNhcC5mZS5uYXZpZ2F0aW9uLk5hdkVycm9yfSwgVVJMIHBhcmFtZXRlcnMgKGlmIGF2YWlsYWJsZSlcblx0ICogICAgICAgICAgYW5kIHRoZSB0eXBlIG9mIG5hdmlnYXRpb24gYXJlIHJldHVybmVkLlxuXHQgKiBAcHVibGljXG5cdCAqIEBleGFtcGxlIDxjb2RlPlxuXHQgKiBzYXAudWkuZGVmaW5lKFtcInNhcC9mZS9uYXZpZ2F0aW9uL05hdmlnYXRpb25IYW5kbGVyXCJdLCBmdW5jdGlvbiAoTmF2aWdhdGlvbkhhbmRsZXIpIHtcblx0ICogXHR2YXIgb05hdmlnYXRpb25IYW5kbGVyID0gbmV3IE5hdmlnYXRpb25IYW5kbGVyKG9Db250cm9sbGVyKTtcblx0ICogXHR2YXIgb1BhcnNlTmF2aWdhdGlvblByb21pc2UgPSBvTmF2aWdhdGlvbkhhbmRsZXIucGFyc2VOYXZpZ2F0aW9uKCk7XG5cdCAqXG5cdCAqIFx0b1BhcnNlTmF2aWdhdGlvblByb21pc2UuZG9uZShmdW5jdGlvbihvQXBwRGF0YSwgb1N0YXJ0dXBQYXJhbWV0ZXJzLCBzTmF2VHlwZSl7XG5cdCAqIFx0XHRcdG9TbWFydEZpbHRlckJhci5zZXREYXRhU3VpdGVGb3JtYXQob0FwcERhdGEuc2VsZWN0aW9uVmFyaWFudCk7XG5cdCAqIFx0XHRcdC8vIG9BcHBEYXRhLm9TZWxlY3Rpb25WYXJpYW50IGNhbiBiZSB1c2VkIHRvIG1hbmlwdWxhdGUgdGhlIHNlbGVjdGlvbiB2YXJpYW50XG5cdCAqIFx0XHRcdC8vIG9BcHBEYXRhLm9EZWZhdWx0ZWRTZWxlY3Rpb25WYXJpYW50IGNvbnRhaW5zIHRoZSBwYXJhbWV0ZXJzIHdoaWNoIGFyZSBzZXQgYnkgdXNlciBkZWZhdWx0c1xuXHQgKiBcdFx0XHQvLyBvQXBwRGF0YS5iTmF2U2VsVmFySGFzRGVmYXVsdHNPbmx5IGluZGljYXRlcyB3aGV0aGVyIG9ubHkgZGVmYXVsdGVkIHBhcmFtZXRlcnMgYW5kIG5vIG5hdmlnYXRpb24gcGFyYW1ldGVycyBhcmUgcHJlc2VudFxuXHQgKiBcdH0pO1xuXHQgKiBcdG9QYXJzZU5hdmlnYXRpb25Qcm9taXNlLmZhaWwoZnVuY3Rpb24ob0Vycm9yLCBvVVJMUGFyYW1ldGVycywgc05hdlR5cGUpe1xuXHQgKiBcdFx0Ly8gaWYgZS5nLiB0aGUgeGFwcCBzdGF0ZSBjb3VsZCBub3QgYmUgbG9hZGVkLCBuZXZlcnRoZWxlc3MgdGhlcmUgbWF5IGJlIFVSTCBwYXJhbWV0ZXJzIGF2YWlsYWJsZVxuXHQgKiBcdFx0Ly9zb21lIGVycm9yIGhhbmRsaW5nXG5cdCAqIFx0fSk7XG5cdCAqIH0pO1xuXHQgKiA8L2NvZGU+XG5cdCAqL1xuXHRwYXJzZU5hdmlnYXRpb24oKSB7XG5cdFx0Y29uc3Qgc0FwcEhhc2ggPSBIYXNoQ2hhbmdlci5nZXRJbnN0YW5jZSgpLmdldEhhc2goKTtcblx0XHQvKlxuXHRcdCAqIHVzZSAuZ2V0SGFzaCgpIGhlcmUgaW5zdGVhZCBvZiAuZ2V0QXBwSGFzaCgpIHRvIGFsc28gYmUgYWJsZSBkZWFsaW5nIHdpdGggZW52aXJvbm1lbnRzIHdoZXJlIG9ubHkgU0FQVUk1IGlzIGxvYWRlZCBhbmQgdGhlIFVTaGVsbCBpc1xuXHRcdCAqIG5vdCBpbml0aWFsaXplZCBwcm9wZXJseS5cblx0XHQgKi9cblx0XHRjb25zdCBzSUFwcFN0YXRlID0gdGhpcy5fZ2V0SW5uZXJBcHBTdGF0ZUtleShzQXBwSGFzaCk7XG5cblx0XHRsZXQgb0NvbXBvbmVudERhdGEgPSB0aGlzLm9Db21wb25lbnQuZ2V0Q29tcG9uZW50RGF0YSgpO1xuXHRcdC8qXG5cdFx0ICogVGhlcmUgYXJlIHNvbWUgcmFjZSBjb25kaXRpb25zIHdoZXJlIHRoZSBvQ29tcG9uZW50RGF0YSBtYXkgbm90IGJlIHNldCwgZm9yIGV4YW1wbGUgaW4gY2FzZSB0aGUgVVNoZWxsIHdhcyBub3QgaW5pdGlhbGl6ZWQgcHJvcGVybHkuIFRvXG5cdFx0ICogbWFrZSBzdXJlIHRoYXQgd2UgZG8gbm90IGR1bXAgaGVyZSB3aXRoIGFuIGV4Y2VwdGlvbiwgd2UgdGFrZSB0aGlzIHNwZWNpYWwgZXJyb3IgaGFuZGxpbmcgYmVoYXZpb3I6XG5cdFx0ICovXG5cdFx0aWYgKG9Db21wb25lbnREYXRhID09PSB1bmRlZmluZWQpIHtcblx0XHRcdExvZy53YXJuaW5nKFwiVGhlIG5hdmlnYXRpb24gQ29tcG9uZW50J3MgZGF0YSB3YXMgbm90IHNldCBwcm9wZXJseTsgYXNzdW1pbmcgaW5zdGVhZCB0aGF0IG5vIHBhcmFtZXRlcnMgYXJlIHByb3ZpZGVkLlwiKTtcblx0XHRcdG9Db21wb25lbnREYXRhID0ge307XG5cdFx0fVxuXG5cdFx0Ly8gUmVtYXJrOlxuXHRcdC8vIFRoZSBzdGFydHVwIHBhcmFtZXRlcnMgYXJlIGFscmVhZHkgZGVjb2RlZC4gRXhhbXBsZTpcblx0XHQvLyBUaGUgb3JpZ2luYWwgVVJMIHBhcmFtZXRlciAlMjUyNCUyNTQwJTI1MjU9JTI1MjYlMjUyRiUyNTNEIHJlc3VsdHMgaW4gb1N0YXJ0dXBQYXJhbWV0ZXJzID0geyBcIiRAJVwiIDogXCImLz1cIiB9XG5cdFx0Ly8gTm90ZSB0aGUgZG91YmxlIGVuY29kaW5nIGluIHRoZSBVUkwsIHRoaXMgaXMgY29ycmVjdC4gQW4gVVJMIHBhcmFtZXRlciBsaWtlIHh5ej0lMjUgY2F1c2VzIGFuIFwiVVJJIG1hbGZvcm1lZFwiIGVycm9yLlxuXHRcdC8vIElmIHRoZSBkZWNvZGVkIHZhbHVlIHNob3VsZCBiZSBlLmcuIFwiJTI1XCIsIHRoZSBwYXJhbWV0ZXIgaW4gdGhlIFVSTCBuZWVkcyB0byBiZTogeHl6PSUyNTI1MjVcblx0XHRjb25zdCBvU3RhcnR1cFBhcmFtZXRlcnMgPSBvQ29tcG9uZW50RGF0YS5zdGFydHVwUGFyYW1ldGVycztcblxuXHRcdGxldCBhRGVmYXVsdGVkUGFyYW1ldGVyczogYW55ID0gW107XG5cdFx0aWYgKFxuXHRcdFx0b1N0YXJ0dXBQYXJhbWV0ZXJzICYmXG5cdFx0XHRvU3RhcnR1cFBhcmFtZXRlcnNbREVGQVVMVEVEX1BBUkFNRVRFUl9QUk9QRVJUWV0gJiZcblx0XHRcdG9TdGFydHVwUGFyYW1ldGVyc1tERUZBVUxURURfUEFSQU1FVEVSX1BST1BFUlRZXS5sZW5ndGggPiAwXG5cdFx0KSB7XG5cdFx0XHRhRGVmYXVsdGVkUGFyYW1ldGVycyA9IEpTT04ucGFyc2Uob1N0YXJ0dXBQYXJhbWV0ZXJzW0RFRkFVTFRFRF9QQVJBTUVURVJfUFJPUEVSVFldWzBdKTtcblx0XHR9XG5cblx0XHRjb25zdCBvTXlEZWZlcnJlZCA9IGpRdWVyeS5EZWZlcnJlZCgpO1xuXHRcdGNvbnN0IG9OYXZIYW5kbGVyID0gdGhpcztcblx0XHRjb25zdCBwYXJzZVVybFBhcmFtcyA9IGZ1bmN0aW9uIChvU3ViU3RhcnR1cFBhcmFtZXRlcnM6IGFueSwgYVN1YkRlZmF1bHRlZFBhcmFtZXRlcnM6IGFueSwgb1N1Yk15RGVmZXJyZWQ6IGFueSwgc05hdlR5cGU6IGFueSkge1xuXHRcdFx0Ly8gc3RhbmRhcmQgVVJMIG5hdmlnYXRpb25cblx0XHRcdGNvbnN0IG9TZWxWYXJzID0gb05hdkhhbmRsZXIuX3NwbGl0SW5ib3VuZE5hdmlnYXRpb25QYXJhbWV0ZXJzKFxuXHRcdFx0XHRuZXcgU2VsZWN0aW9uVmFyaWFudCgpLFxuXHRcdFx0XHRvU3ViU3RhcnR1cFBhcmFtZXRlcnMsXG5cdFx0XHRcdGFTdWJEZWZhdWx0ZWRQYXJhbWV0ZXJzXG5cdFx0XHQpO1xuXHRcdFx0aWYgKG9TZWxWYXJzLm9OYXZpZ2F0aW9uU2VsVmFyLmlzRW1wdHkoKSAmJiBvU2VsVmFycy5vRGVmYXVsdGVkU2VsVmFyLmlzRW1wdHkoKSkge1xuXHRcdFx0XHQvLyBTdGFydHVwIHBhcmFtZXRlcnMgY29udGFpbiBvbmx5IHRlY2huaWNhbCBwYXJhbWV0ZXJzIChTQVAgc3lzdGVtKSB3aGljaCB3ZXJlIGZpbHRlcmVkIG91dC5cblx0XHRcdFx0Ly8gb05hdmlnYXRpb25TZWxWYXIgYW5kIG9EZWZhdWx0ZWRTZWxWYXIgYXJlIGVtcHR5LlxuXHRcdFx0XHQvLyBUaHVzLCBjb25zaWRlciB0aGlzIHR5cGUgb2YgbmF2aWdhdGlvbiBhcyBhbiBpbml0aWFsIG5hdmlnYXRpb24uXG5cdFx0XHRcdGlmIChzTmF2VHlwZSA9PT0gTmF2VHlwZS54QXBwU3RhdGUpIHtcblx0XHRcdFx0XHRjb25zdCBvRXJyb3IgPSBvTmF2SGFuZGxlci5fY3JlYXRlVGVjaG5pY2FsRXJyb3IoXCJOYXZpZ2F0aW9uSGFuZGxlci5nZXREYXRhRnJvbUFwcFN0YXRlLmZhaWxlZFwiKTtcblx0XHRcdFx0XHRvU3ViTXlEZWZlcnJlZC5yZWplY3Qob0Vycm9yLCBvU3ViU3RhcnR1cFBhcmFtZXRlcnMgfHwge30sIE5hdlR5cGUueEFwcFN0YXRlKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRvU3ViTXlEZWZlcnJlZC5yZXNvbHZlKHt9LCBvU3ViU3RhcnR1cFBhcmFtZXRlcnMsIE5hdlR5cGUuaW5pdGlhbCk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnN0IG9BcHBTdGF0ZURhdGE6IGFueSA9IHt9O1xuXHRcdFx0XHRvQXBwU3RhdGVEYXRhLnNlbGVjdGlvblZhcmlhbnQgPSBvU2VsVmFycy5vTmF2aWdhdGlvblNlbFZhci50b0pTT05TdHJpbmcoKTtcblx0XHRcdFx0b0FwcFN0YXRlRGF0YS5vU2VsZWN0aW9uVmFyaWFudCA9IG9TZWxWYXJzLm9OYXZpZ2F0aW9uU2VsVmFyO1xuXHRcdFx0XHRvQXBwU3RhdGVEYXRhLm9EZWZhdWx0ZWRTZWxlY3Rpb25WYXJpYW50ID0gb1NlbFZhcnMub0RlZmF1bHRlZFNlbFZhcjtcblx0XHRcdFx0b0FwcFN0YXRlRGF0YS5iTmF2U2VsVmFySGFzRGVmYXVsdHNPbmx5ID0gb1NlbFZhcnMuYk5hdlNlbFZhckhhc0RlZmF1bHRzT25seTtcblx0XHRcdFx0b1N1Yk15RGVmZXJyZWQucmVzb2x2ZShvQXBwU3RhdGVEYXRhLCBvU3ViU3RhcnR1cFBhcmFtZXRlcnMsIHNOYXZUeXBlKTtcblx0XHRcdH1cblx0XHR9O1xuXHRcdGlmIChzSUFwcFN0YXRlKSB7XG5cdFx0XHQvLyBpbm5lciBhcHAgc3RhdGUgaXMgYXZhaWxhYmxlIGluIHRoZSBBcHBIYXNoIChiYWNrIG5hdmlnYXRpb24pOyBleHRyYWN0IHRoZSBwYXJhbWV0ZXIgdmFsdWVcblx0XHRcdHRoaXMuX2xvYWRBcHBTdGF0ZShzSUFwcFN0YXRlLCBvTXlEZWZlcnJlZCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIG5vIGJhY2sgbmF2aWdhdGlvblxuXHRcdFx0Y29uc3QgYklzWGFwcFN0YXRlTmF2aWdhdGlvbiA9IG9Db21wb25lbnREYXRhW1wic2FwLXhhcHAtc3RhdGVcIl0gIT09IHVuZGVmaW5lZDtcblx0XHRcdGlmIChiSXNYYXBwU3RhdGVOYXZpZ2F0aW9uKSB7XG5cdFx0XHRcdGNvbnN0IHRoYXQgPSB0aGlzO1xuXHRcdFx0XHQvLyBpbm5lciBhcHAgc3RhdGUgd2FzIG5vdCBmb3VuZCBpbiB0aGUgQXBwSGFzaCwgYnV0IHhhcHAgc3RhdGUgPT4gdHJ5IHRvIHJlYWQgdGhlIHhhcHAgc3RhdGVcblx0XHRcdFx0dGhpcy5fZ2V0QXBwTmF2aWdhdGlvblNlcnZpY2VBc3luYygpXG5cdFx0XHRcdFx0LnRoZW4oZnVuY3Rpb24gKG9Dcm9zc0FwcE5hdlNlcnZpY2U6IGFueSkge1xuXHRcdFx0XHRcdFx0Y29uc3Qgb1N0YXJ0dXBQcm9taXNlID0gb0Nyb3NzQXBwTmF2U2VydmljZS5nZXRTdGFydHVwQXBwU3RhdGUodGhhdC5vQ29tcG9uZW50KTtcblx0XHRcdFx0XHRcdG9TdGFydHVwUHJvbWlzZS5kb25lKGZ1bmN0aW9uIChvQXBwU3RhdGU6IGFueSkge1xuXHRcdFx0XHRcdFx0XHQvLyBnZXQgYXBwIHN0YXRlIGZyb20gc2FwLXhhcHAtc3RhdGUsXG5cdFx0XHRcdFx0XHRcdC8vIGNyZWF0ZSBhIGNvcHksIG5vdCBvbmx5IGEgcmVmZXJlbmNlLCBiZWNhdXNlIHdlIHdhbnQgdG8gbW9kaWZ5IHRoZSBvYmplY3Rcblx0XHRcdFx0XHRcdFx0bGV0IG9BcHBTdGF0ZURhdGEgPSBvQXBwU3RhdGUuZ2V0RGF0YSgpO1xuXHRcdFx0XHRcdFx0XHRsZXQgb0Vycm9yO1xuXHRcdFx0XHRcdFx0XHRpZiAob0FwcFN0YXRlRGF0YSkge1xuXHRcdFx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRvQXBwU3RhdGVEYXRhID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvQXBwU3RhdGVEYXRhKSk7XG5cdFx0XHRcdFx0XHRcdFx0fSBjYXRjaCAoeCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0b0Vycm9yID0gb05hdkhhbmRsZXIuX2NyZWF0ZVRlY2huaWNhbEVycm9yKFwiTmF2aWdhdGlvbkhhbmRsZXIuQXBwU3RhdGVEYXRhLnBhcnNlRXJyb3JcIik7XG5cdFx0XHRcdFx0XHRcdFx0XHRvTXlEZWZlcnJlZC5yZWplY3Qob0Vycm9yLCBvU3RhcnR1cFBhcmFtZXRlcnMsIE5hdlR5cGUueEFwcFN0YXRlKTtcblx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBvTXlEZWZlcnJlZC5wcm9taXNlKCk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0aWYgKG9BcHBTdGF0ZURhdGEpIHtcblx0XHRcdFx0XHRcdFx0XHRjb25zdCBvU2VsVmFyID0gbmV3IFNlbGVjdGlvblZhcmlhbnQob0FwcFN0YXRlRGF0YS5zZWxlY3Rpb25WYXJpYW50KTtcblxuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IG9TZWxWYXJzID0gb05hdkhhbmRsZXIuX3NwbGl0SW5ib3VuZE5hdmlnYXRpb25QYXJhbWV0ZXJzKFxuXHRcdFx0XHRcdFx0XHRcdFx0b1NlbFZhcixcblx0XHRcdFx0XHRcdFx0XHRcdG9TdGFydHVwUGFyYW1ldGVycyxcblx0XHRcdFx0XHRcdFx0XHRcdGFEZWZhdWx0ZWRQYXJhbWV0ZXJzXG5cdFx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdFx0XHRvQXBwU3RhdGVEYXRhLnNlbGVjdGlvblZhcmlhbnQgPSBvU2VsVmFycy5vTmF2aWdhdGlvblNlbFZhci50b0pTT05TdHJpbmcoKTtcblx0XHRcdFx0XHRcdFx0XHRvQXBwU3RhdGVEYXRhLm9TZWxlY3Rpb25WYXJpYW50ID0gb1NlbFZhcnMub05hdmlnYXRpb25TZWxWYXI7XG5cdFx0XHRcdFx0XHRcdFx0b0FwcFN0YXRlRGF0YS5vRGVmYXVsdGVkU2VsZWN0aW9uVmFyaWFudCA9IG9TZWxWYXJzLm9EZWZhdWx0ZWRTZWxWYXI7XG5cdFx0XHRcdFx0XHRcdFx0b0FwcFN0YXRlRGF0YS5iTmF2U2VsVmFySGFzRGVmYXVsdHNPbmx5ID0gb1NlbFZhcnMuYk5hdlNlbFZhckhhc0RlZmF1bHRzT25seTtcblx0XHRcdFx0XHRcdFx0XHRvTXlEZWZlcnJlZC5yZXNvbHZlKG9BcHBTdGF0ZURhdGEsIG9TdGFydHVwUGFyYW1ldGVycywgTmF2VHlwZS54QXBwU3RhdGUpO1xuXHRcdFx0XHRcdFx0XHR9IGVsc2UgaWYgKG9TdGFydHVwUGFyYW1ldGVycykge1xuXHRcdFx0XHRcdFx0XHRcdHBhcnNlVXJsUGFyYW1zKG9TdGFydHVwUGFyYW1ldGVycywgYURlZmF1bHRlZFBhcmFtZXRlcnMsIG9NeURlZmVycmVkLCBOYXZUeXBlLnhBcHBTdGF0ZSk7XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gc2FwLXhhcHAtc3RhdGUgbmF2aWdhdGlvbiwgYnV0IElEIGhhcyBhbHJlYWR5IGV4cGlyZWQsIGJ1dCBVUkwgcGFyYW1ldGVycyBhdmFpbGFibGVcblx0XHRcdFx0XHRcdFx0XHRvRXJyb3IgPSBvTmF2SGFuZGxlci5fY3JlYXRlVGVjaG5pY2FsRXJyb3IoXCJOYXZpZ2F0aW9uSGFuZGxlci5nZXREYXRhRnJvbUFwcFN0YXRlLmZhaWxlZFwiKTtcblx0XHRcdFx0XHRcdFx0XHRvTXlEZWZlcnJlZC5yZWplY3Qob0Vycm9yLCBvU3RhcnR1cFBhcmFtZXRlcnMgfHwge30sIE5hdlR5cGUueEFwcFN0YXRlKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRvU3RhcnR1cFByb21pc2UuZmFpbChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IG9FcnJvciA9IG9OYXZIYW5kbGVyLl9jcmVhdGVUZWNobmljYWxFcnJvcihcIk5hdmlnYXRpb25IYW5kbGVyLmdldFN0YXJ0dXBTdGF0ZS5mYWlsZWRcIik7XG5cdFx0XHRcdFx0XHRcdG9NeURlZmVycmVkLnJlamVjdChvRXJyb3IsIHt9LCBOYXZUeXBlLnhBcHBTdGF0ZSk7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdC5jYXRjaChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBvRXJyb3IgPSBvTmF2SGFuZGxlci5fY3JlYXRlVGVjaG5pY2FsRXJyb3IoXCJOYXZpZ2F0aW9uSGFuZGxlci5fZ2V0QXBwTmF2aWdhdGlvblNlcnZpY2VBc3luYy5mYWlsZWRcIik7XG5cdFx0XHRcdFx0XHRvTXlEZWZlcnJlZC5yZWplY3Qob0Vycm9yLCB7fSwgTmF2VHlwZS54QXBwU3RhdGUpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0fSBlbHNlIGlmIChvU3RhcnR1cFBhcmFtZXRlcnMpIHtcblx0XHRcdFx0Ly8gbm8gc2FwLXhhcHAtc3RhdGVcblx0XHRcdFx0cGFyc2VVcmxQYXJhbXMob1N0YXJ0dXBQYXJhbWV0ZXJzLCBhRGVmYXVsdGVkUGFyYW1ldGVycywgb015RGVmZXJyZWQsIE5hdlR5cGUuVVJMUGFyYW1zKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIGluaXRpYWwgbmF2aWdhdGlvblxuXHRcdFx0XHRvTXlEZWZlcnJlZC5yZXNvbHZlKHt9LCB7fSwgTmF2VHlwZS5pbml0aWFsKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gb015RGVmZXJyZWQucHJvbWlzZSgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgdGhlIGFwcGxpY2F0aW9uIHNwZWNpZmljIHRlY2huaWNhbCBwYXJhbWV0ZXJzLiBUZWNobmljYWwgcGFyYW1ldGVycyB3aWxsIG5vdCBiZSBhZGRlZCB0byB0aGUgc2VsZWN0aW9uIHZhcmlhbnQgcGFzc2VkIHRvIHRoZVxuXHQgKiBhcHBsaWNhdGlvbi4gQXMgYSBkZWZhdWx0IHRoZSBmb2xsb3dpbmcgdmFsdWVzIGFyZSBjb25zaWRlcmVkIGFzIHRlY2huaWNhbCBwYXJhbWV0ZXJzOlxuXHQgKiA8dWw+XG5cdCAqIDxsaT48Y29kZT5zYXAtc3lzdGVtPC9jb2RlPjwvbGk+XG5cdCAqIDxsaT48Y29kZT5zYXAtdXNoZWxsLWRlZmF1bHRlZFBhcmFtZXRlck5hbWVzPC9jb2RlPjwvbGk+XG5cdCAqIDxsaT48Y29kZT5cImhjcEFwcGxpY2F0aW9uSWRcIjwvY29kZT48L2xpPlxuXHQgKiA8L3VsPi5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKiBAZnVuY3Rpb24gc2V0VGVjaG5pY2FsUGFyYW1ldGVyc1xuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLm5hdmlnYXRpb24uTmF2aWdhdGlvbkhhbmRsZXIucHJvdG90eXBlXG5cdCAqIEBwYXJhbSB7QXJyYXl9IGFUZWNobmljYWxQYXJhbWV0ZXJzIExpc3Qgb2YgcGFyYW1ldGVyIG5hbWVzIHRvIGJlIGNvbnNpZGVyZWQgYXMgdGVjaG5pY2FsIHBhcmFtZXRlcnMuIDxjb2RlPm51bGw8L2NvZGU+IG9yXG5cdCAqICAgICAgICA8Y29kZT51bmRlZmluZWQ8L2NvZGU+IG1heSBiZSB1c2VkIHRvIHJlc2V0IHRoZSBjb21wbGV0ZSBsaXN0LlxuXHQgKi9cblx0c2V0VGVjaG5pY2FsUGFyYW1ldGVycyhhVGVjaG5pY2FsUGFyYW1ldGVycz86IGFueVtdKSB7XG5cdFx0aWYgKCFhVGVjaG5pY2FsUGFyYW1ldGVycykge1xuXHRcdFx0YVRlY2huaWNhbFBhcmFtZXRlcnMgPSBbXTtcblx0XHR9XG5cblx0XHRpZiAoIUFycmF5LmlzQXJyYXkoYVRlY2huaWNhbFBhcmFtZXRlcnMpKSB7XG5cdFx0XHRMb2cuZXJyb3IoXCJOYXZpZ2F0aW9uSGFuZGxlcjogcGFyYW1ldGVyIGluY29ycmVjdCwgYXJyYXkgb2Ygc3RyaW5ncyBleHBlY3RlZFwiKTtcblx0XHRcdHRocm93IG5ldyBOYXZFcnJvcihcIk5hdmlnYXRpb25IYW5kbGVyLklOVkFMSURfSU5QVVRcIik7XG5cdFx0fVxuXG5cdFx0dGhpcy5fYVRlY2huaWNhbFBhcmFtYXRlcnMgPSBhVGVjaG5pY2FsUGFyYW1ldGVycztcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIHRoZSBhcHBsaWNhdGlvbiBzcGVjaWZpYyB0ZWNobmljYWwgcGFyYW1ldGVycy4gVGVjaG5pY2FsIHBhcmFtZXRlcnMgd2lsbCBub3QgYmUgYWRkZWQgdG8gdGhlIHNlbGVjdGlvbiB2YXJpYW50IHBhc3NlZCB0byB0aGVcblx0ICogYXBwbGljYXRpb24uIEFzIGEgZGVmYXVsdCB0aGUgZm9sbG93aW5nIHZhbHVlcyBhcmUgY29uc2lkZXJlZCBhcyB0ZWNobmljYWwgcGFyYW1ldGVyczpcblx0ICogPHVsPlxuXHQgKiA8bGk+PGNvZGU+c2FwLXN5c3RlbTwvY29kZT48L2xpPlxuXHQgKiA8bGk+PGNvZGU+c2FwLXVzaGVsbC1kZWZhdWx0ZWRQYXJhbWV0ZXJOYW1lczwvY29kZT48L2xpPlxuXHQgKiA8bGk+PGNvZGU+XCJoY3BBcHBsaWNhdGlvbklkXCI8L2NvZGU+PC9saT5cblx0ICogPC91bD4uXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICogQGZ1bmN0aW9uIGdldFRlY2huaWNhbFBhcmFtZXRlcnNcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5uYXZpZ2F0aW9uLk5hdmlnYXRpb25IYW5kbGVyLnByb3RvdHlwZVxuXHQgKiBAcmV0dXJucyB7QXJyYXl9IENvbnRhaW5pbmcgdGhlIHRlY2huaWNhbCBwYXJhbWV0ZXJzLlxuXHQgKi9cblx0Z2V0VGVjaG5pY2FsUGFyYW1ldGVycygpIHtcblx0XHRyZXR1cm4gdGhpcy5fYVRlY2huaWNhbFBhcmFtYXRlcnMuY29uY2F0KFtdKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgdGhlIHBhc3NlZCBwYXJhbWV0ZXIgaXMgY29uc2lkZXJlZCBhcyB0ZWNobmljYWwgcGFyYW1ldGVyLlxuXHQgKlxuXHQgKiBAcGFyYW0gc1BhcmFtZXRlck5hbWUgTmFtZSBvZiBhIHJlcXVlc3QgcGFyYW1ldGVyLCBjb25zaWRlcmVkIGFzIHRlY2huaWNhbCBwYXJhbWV0ZXIuXG5cdCAqIEByZXR1cm5zIEluZGljYXRlcyBpZiB0aGUgcGFyYW1ldGVyIGlzIGNvbnNpZGVyZWQgYXMgdGVjaG5pY2FsIHBhcmFtZXRlciBvciBub3QuXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfaXNUZWNobmljYWxQYXJhbWV0ZXIoc1BhcmFtZXRlck5hbWU6IHN0cmluZykge1xuXHRcdGlmIChzUGFyYW1ldGVyTmFtZSkge1xuXHRcdFx0aWYgKFxuXHRcdFx0XHQhKFxuXHRcdFx0XHRcdHNQYXJhbWV0ZXJOYW1lID09PSBcInNhcC11aS1mZS12YXJpYW50LWlkXCIgfHxcblx0XHRcdFx0XHRzUGFyYW1ldGVyTmFtZSA9PT0gXCJzYXAtdWktZmUtdGFibGUtdmFyaWFudC1pZFwiIHx8XG5cdFx0XHRcdFx0c1BhcmFtZXRlck5hbWUgPT09IFwic2FwLXVpLWZlLWNoYXJ0LXZhcmlhbnQtaWRcIiB8fFxuXHRcdFx0XHRcdHNQYXJhbWV0ZXJOYW1lID09PSBcInNhcC11aS1mZS1maWx0ZXJiYXItdmFyaWFudC1pZFwiXG5cdFx0XHRcdClcblx0XHRcdCkge1xuXHRcdFx0XHRpZiAoc1BhcmFtZXRlck5hbWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKFwic2FwLVwiKSA9PT0gMCkge1xuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHR9IGVsc2UgaWYgKHRoaXMuX2FUZWNobmljYWxQYXJhbWF0ZXJzLmluZGV4T2Yoc1BhcmFtZXRlck5hbWUpID49IDApIHtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRfaXNGRVBhcmFtZXRlcihzUGFyYW1ldGVyTmFtZTogYW55KSB7XG5cdFx0cmV0dXJuIHNQYXJhbWV0ZXJOYW1lLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihcInNhcC11aS1mZVwiKSA9PT0gMDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSbW92ZXMgaWYgdGhlIHBhc3NlZCBwYXJhbWV0ZXIgaXMgY29uc2lkZXJlZCBhcyB0ZWNobmljYWwgcGFyYW1ldGVyLlxuXHQgKlxuXHQgKiBAcGFyYW0gb1NlbGVjdGlvblZhcmlhbnQgU2VsZWN0aW9uIFZhcmlhbnQgd2hpY2ggY29uc2lzdHMgb2YgdGVjaG5pY2FsIFBhcmFtZXRlcnMuXG5cdCAqIEByZXR1cm5zIFNlbGVjdGlvbiBWYXJpYW50IHdpdGhvdXQgdGVjaG5pY2FsIFBhcmFtZXRlcnMuXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfcmVtb3ZlVGVjaG5pY2FsUGFyYW1ldGVycyhvU2VsZWN0aW9uVmFyaWFudDogU2VsZWN0aW9uVmFyaWFudCkge1xuXHRcdGxldCBzUHJvcE5hbWUsIGk7XG5cdFx0Y29uc3QgYVNlbFZhclByb3BOYW1lcyA9IG9TZWxlY3Rpb25WYXJpYW50LmdldFNlbGVjdE9wdGlvbnNQcm9wZXJ0eU5hbWVzKCk7XG5cdFx0Zm9yIChpID0gMDsgaSA8IGFTZWxWYXJQcm9wTmFtZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHNQcm9wTmFtZSA9IGFTZWxWYXJQcm9wTmFtZXNbaV07XG5cdFx0XHRpZiAodGhpcy5faXNUZWNobmljYWxQYXJhbWV0ZXIoc1Byb3BOYW1lKSkge1xuXHRcdFx0XHRvU2VsZWN0aW9uVmFyaWFudC5yZW1vdmVTZWxlY3RPcHRpb24oc1Byb3BOYW1lKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG9TZWxlY3Rpb25WYXJpYW50O1xuXHR9XG5cblx0LyoqXG5cdCAqIFNwbGl0cyB0aGUgcGFyYW1ldGVycyBwcm92aWRlZCBkdXJpbmcgaW5ib3VuZCBuYXZpZ2F0aW9uIGFuZCBzZXBhcmF0ZXMgdGhlIGNvbnRleHR1YWwgaW5mb3JtYXRpb24gYmV0d2VlbiBkZWZhdWx0ZWQgcGFyYW1ldGVyIHZhbHVlcyBhbmRcblx0ICogbmF2aWdhdGlvbiBwYXJhbWV0ZXJzLlxuXHQgKlxuXHQgKiBAcGFyYW0gb1NlbGVjdGlvblZhcmlhbnQgSW5zdGFuY2Ugb2Yge0BsaW5rIHNhcC5mZS5uYXZpZ2F0aW9uLlNlbGVjdGlvblZhcmlhbnR9IGNvbnRhaW5pbmcgbmF2aWdhdGlvbiBkYXRhIG9mXG5cdCAqICAgICAgICB0aGUgYXBwXG5cdCAqIEBwYXJhbSBvU3RhcnR1cFBhcmFtZXRlcnMgT2JqZWN0IGNvbnRhaW5pbmcgc3RhcnR1cCBwYXJhbWV0ZXJzIG9mIHRoZSBhcHAgKGRlcml2ZWQgZnJvbSB0aGUgY29tcG9uZW50KVxuXHQgKiBAcGFyYW0gYURlZmF1bHRlZFBhcmFtZXRlcnMgQXJyYXkgY29udGFpbmluZyBkZWZhdWx0ZWQgcGFyYW1ldGVyIG5hbWVzXG5cdCAqIEByZXR1cm5zIE9iamVjdCBjb250YWluaW5nIHR3byBTZWxlY3Rpb25WYXJpYW50cywgb25lIGZvciBuYXZpZ2F0aW9uIChvTmF2aWdhdGlvblNlbFZhcikgYW5kIG9uZSBmb3IgZGVmYXVsdGVkIHN0YXJ0dXAgcGFyYW1ldGVyc1xuXHQgKiAgICAgICAgICAob0RlZmF1bHRlZFNlbFZhciksIGFuZCBhIGZsYWcgKGJOYXZTZWxWYXJIYXNEZWZhdWx0c09ubHkpIGluZGljYXRpbmcgd2hldGhlciBhbGwgcGFyYW1ldGVycyB3ZXJlIGRlZmF1bHRlZC4gVGhlIGZ1bmN0aW9uIGlzXG5cdCAqICAgICAgICAgIGhhbmRlZCB0d28gb2JqZWN0cyBjb250YWluaW5nIHBhcmFtZXRlcnMgKG5hbWVzIGFuZCB0aGVpciBjb3JyZXNwb25kaW5nIHZhbHVlcyksIG9TZWxlY3Rpb25WYXJpYW50IGFuZCBvU3RhcnR1cFBhcmFtZXRlcnMuIEFcblx0ICogICAgICAgICAgcGFyYW1ldGVyIGNvdWxkIGJlIHN0b3JlZCBpbiBqdXN0IG9uZSBvZiB0aGVzZSB0d28gb2JqZWN0cyBvciBpbiBib3RoIG9mIHRoZW0gc2ltdWx0YW5lb3VzbHkuIEJlY2F1c2Ugb2YgdGhlIGxhdHRlciBjYXNlIGFcblx0ICogICAgICAgICAgcGFyYW1ldGVyIGNvdWxkIGJlIGFzc29jaWF0ZWQgd2l0aCBjb25mbGljdGluZyB2YWx1ZXMgYW5kIGl0IGlzIHRoZSBqb2Igb2YgdGhpcyBmdW5jdGlvbiB0byByZXNvbHZlIGFueSBzdWNoIGNvbmZsaWN0LiBQYXJhbWV0ZXJzXG5cdCAqICAgICAgICAgIGFyZSBhc3NpZ25lZCB0byB0aGUgdHdvIHJldHVybmVkIFNlbGVjdGlvblZhcmlhbnRzLCBvTmF2aWdhdGlvblNlbFZhciBhbmQgb0RlZmF1bHRlZFNlbFZhciwgYXMgZm9sbG93czogfCBwYXJhbWV0ZXIgTk9UIGluIHxcblx0ICogICAgICAgICAgcGFyYW1ldGVyIGluIHwgb1NlbGVjdGlvblZhcmlhbnQgfCBvU2VsZWN0aW9uVmFyaWFudCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS18LS0tLS0tLS0tLS0tLS0tLS0tIHBhcmFtZXRlciBOT1QgaW4gfFxuXHQgKiAgICAgICAgICBub3RoaW5nIHRvIGRvIHwgQWRkIHBhcmFtZXRlciBvU3RhcnR1cFBhcmFtZXRlcnMgfCBoZXJlIHwgKHNlZSBiZWxvdykgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQgKiAgICAgICAgICBwYXJhbWV0ZXIgaW4gfCBBZGQgcGFyYW1ldGVyIHwgQ29uZmxpY3QgcmVzb2x1dGlvbiBvU3RhcnR1cFBhcmFtZXRlcnMgfCAoc2VlIGJlbG93KSB8IChzZWUgYmVsb3cpIEFkZCBwYXJhbWV0ZXI6IGlmIHBhcmFtZXRlciBpblxuXHQgKiAgICAgICAgICBhRGVmYXVsdGVkUGFyYW1ldGVyczogYWRkIHBhcmFtZXRlciB0byBvRGVmYXVsdGVkU2VsVmFyIGVsc2U6IGFkZCBwYXJhbWV0ZXIgdG8gb05hdmlnYXRpb25TZWxWYXIgQ29uZmxpY3QgcmVzb2x1dGlvbjogaWYgcGFyYW1ldGVyXG5cdCAqICAgICAgICAgIGluIGFEZWZhdWx0ZWRQYXJhbWV0ZXJzOiBhZGQgcGFyYW1ldGVyIHZhbHVlIGZyb20gb1NlbGVjdGlvblZhcmlhbnQgdG8gb05hdmlnYXRpb25TZWxWYXIgYWRkIHBhcmFtZXRlciB2YWx1ZSBmcm9tXG5cdCAqICAgICAgICAgIG9TdGFydHVwUGFyYW1ldGVycyB0byBvRGVmYXVsdGVkU2VsVmFyIE5vdGU6IFRoaXMgY2FzZSBvbmx5IG9jY3VycyBpbiBVSTUgMS4zMi4gSW4gbGF0ZXIgdmVyc2lvbnMgVVNoZWxsIHN0b3JlcyBhbnkgZGVmYXVsdGVkXG5cdCAqICAgICAgICAgIHBhcmFtZXRlciBlaXRoZXIgaW4gb1NlbGVjdGlvblZhcmlhbnQgb3Igb1N0YXJ0dXBQYXJhbWV0ZXJzIGJ1dCBuZXZlciBzaW11bHRhbmVvdXNseSBpbiBib3RoLiBlbHNlOiBDaG9vc2UgMSBvZiB0aGUgZm9sbG93aW5nXG5cdCAqICAgICAgICAgIG9wdGlvbnMgYmFzZWQgb24gZ2l2ZW4gaGFuZGxpbmcgbW9kZSAodGhpcy5zUGFyYW1IYW5kbGluZ01vZGUpLiAtPiBhZGQgcGFyYW1ldGVyIHZhbHVlIGZyb20gb1N0YXJ0dXBQYXJhbWV0ZXJzIHRvXG5cdCAqICAgICAgICAgIG9OYXZpZ2F0aW9uU2VsVmFyIHwgLT4gYWRkIHBhcmFtZXRlciB2YWx1ZSBmcm9tIG9BcHBTdGF0ZS5zZWxlY3Rpb25WYXJpYW50IHRvIG9OYXZpZ2F0aW9uU2VsVmFyIC0+IGFkZCBib3RoIHBhcmFtZXRlciB2YWx1ZXMgdG9cblx0ICogICAgICAgICAgbmF2aWdhdGlvblNlbFZhciBJZiBuYXZpZ2F0aW9uU2VsVmFyIGlzIHN0aWxsIGVtcHR5IGF0IHRoZSBlbmQgb2YgZXhlY3V0aW9uLCBuYXZpZ2F0aW9uU2VsVmFyIGlzIHJlcGxhY2VkIGJ5IGEgY29weSBvZlxuXHQgKiAgICAgICAgICBvRGVmYXVsdGVkU2VsVmFyIGFuZCB0aGUgZmxhZyBiTmF2U2VsVmFySGFzRGVmYXVsdHNPbmx5IGlzIHNldCB0byB0cnVlLiBUaGUgc2VsZWN0aW9uIHZhcmlhbnQgb0RlZmF1bHRlZFNlbFZhciBpdHNlbGYgaXMgYWx3YXlzXG5cdCAqICAgICAgICAgIHJldHVybmVkIGFzIGlzLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X3NwbGl0SW5ib3VuZE5hdmlnYXRpb25QYXJhbWV0ZXJzKFxuXHRcdG9TZWxlY3Rpb25WYXJpYW50OiBJbnN0YW5jZVR5cGU8dHlwZW9mIFNlbGVjdGlvblZhcmlhbnQ+LFxuXHRcdG9TdGFydHVwUGFyYW1ldGVyczogeyBba2V5OiBzdHJpbmddOiBhbnkgfSxcblx0XHRhRGVmYXVsdGVkUGFyYW1ldGVyczogYW55W11cblx0KSB7XG5cdFx0aWYgKCFBcnJheS5pc0FycmF5KGFEZWZhdWx0ZWRQYXJhbWV0ZXJzKSkge1xuXHRcdFx0dGhyb3cgbmV3IE5hdkVycm9yKFwiTmF2aWdhdGlvbkhhbmRsZXIuSU5WQUxJRF9JTlBVVFwiKTtcblx0XHR9XG5cblx0XHRsZXQgc1Byb3BOYW1lLCBpO1xuXHRcdC8vIEZpcnN0IHdlIGRvIHNvbWUgcGFyc2luZyBvZiB0aGUgU3RhcnRVcCBQYXJhbWV0ZXJzLlxuXHRcdGNvbnN0IG9TdGFydHVwUGFyYW1ldGVyc0FkanVzdGVkOiB7IFtrZXk6IHN0cmluZ106IGFueSB9ID0ge307XG5cdFx0Zm9yIChzUHJvcE5hbWUgaW4gb1N0YXJ0dXBQYXJhbWV0ZXJzKSB7XG5cdFx0XHRpZiAoIW9TdGFydHVwUGFyYW1ldGVycy5oYXNPd25Qcm9wZXJ0eShzUHJvcE5hbWUpKSB7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBpZiAoc1Byb3BOYW1lID09PSBTQVBfU1lTVEVNX1BST1BFUlRZIHx8IHNQcm9wTmFtZSA9PT0gREVGQVVMVEVEX1BBUkFNRVRFUl9QUk9QRVJUWSkge1xuXHRcdFx0aWYgKHRoaXMuX2lzVGVjaG5pY2FsUGFyYW1ldGVyKHNQcm9wTmFtZSkgfHwgdGhpcy5faXNGRVBhcmFtZXRlcihzUHJvcE5hbWUpKSB7XG5cdFx0XHRcdC8vIERvIG5vdCBhZGQgdGhlIFNBUCBzeXN0ZW0gcGFyYW1ldGVyIHRvIHRoZSBzZWxlY3Rpb24gdmFyaWFudCBhcyBpdCBpcyBhIHRlY2huaWNhbCBwYXJhbWV0ZXJcblx0XHRcdFx0Ly8gbm90IHJlbGV2YW50IGZvciB0aGUgc2VsZWN0aW9uIHZhcmlhbnQuXG5cdFx0XHRcdC8vIERvIG5vdCBhZGQgdGhlIHN0YXJ0dXAgcGFyYW1ldGVyIGZvciBkZWZhdWx0IHZhbHVlcyB0byB0aGUgc2VsZWN0aW9uIHZhcmlhbnQuIFRoZSBpbmZvcm1hdGlvbiwgd2hpY2ggcGFyYW1ldGVyc1xuXHRcdFx0XHQvLyBhcmUgZGVmYXVsdGVkLCBpcyBhdmFpbGFibGUgaW4gdGhlIGRlZmF1bHRlZCBzZWxlY3Rpb24gdmFyaWFudC5cblx0XHRcdFx0Ly8gSW4gY2FzZSwgRkUgUGFyYW1ldGVycyB3ZSBzaGFsbCBza2lwIGl0Lih0aGUgYXBwbGljYXRpb24gbmVlZHMgdG8gZmV0Y2ggaXQgZnJvbSBVUkwgcGFyYW1zKVxuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gV2Ugc3VwcG9ydCBwYXJhbWV0ZXJzIGFzIGEgbWFwIHdpdGggc3RyaW5ncyBhbmQgYXMgYSBtYXAgd2l0aCB2YWx1ZSBhcnJheXNcblx0XHRcdGlmICh0eXBlb2Ygb1N0YXJ0dXBQYXJhbWV0ZXJzW3NQcm9wTmFtZV0gPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdFx0b1N0YXJ0dXBQYXJhbWV0ZXJzQWRqdXN0ZWRbc1Byb3BOYW1lXSA9IG9TdGFydHVwUGFyYW1ldGVyc1tzUHJvcE5hbWVdO1xuXHRcdFx0fSBlbHNlIGlmIChBcnJheS5pc0FycmF5KG9TdGFydHVwUGFyYW1ldGVyc1tzUHJvcE5hbWVdKSAmJiBvU3RhcnR1cFBhcmFtZXRlcnNbc1Byb3BOYW1lXS5sZW5ndGggPT09IDEpIHtcblx0XHRcdFx0b1N0YXJ0dXBQYXJhbWV0ZXJzQWRqdXN0ZWRbc1Byb3BOYW1lXSA9IG9TdGFydHVwUGFyYW1ldGVyc1tzUHJvcE5hbWVdWzBdOyAvLyBzaW5nbGUtdmFsdWVkIHBhcmFtZXRlcnNcblx0XHRcdH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShvU3RhcnR1cFBhcmFtZXRlcnNbc1Byb3BOYW1lXSkgJiYgb1N0YXJ0dXBQYXJhbWV0ZXJzW3NQcm9wTmFtZV0ubGVuZ3RoID4gMSkge1xuXHRcdFx0XHRvU3RhcnR1cFBhcmFtZXRlcnNBZGp1c3RlZFtzUHJvcE5hbWVdID0gb1N0YXJ0dXBQYXJhbWV0ZXJzW3NQcm9wTmFtZV07IC8vIG11bHRpLXZhbHVlZCBwYXJhbWV0ZXJzXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aHJvdyBuZXcgTmF2RXJyb3IoXCJOYXZpZ2F0aW9uSGFuZGxlci5JTlZBTElEX0lOUFVUXCIpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIENvbnN0cnVjdCB0d28gc2VsZWN0aW9uIHZhcmlhbnRzIGZvciBkZWZhdWx0cyBhbmQgbmF2aWdhdGlvbiB0byBiZSByZXR1cm5lZCBieSB0aGUgZnVuY3Rpb24uXG5cdFx0Y29uc3Qgb0RlZmF1bHRlZFNlbFZhciA9IG5ldyBTZWxlY3Rpb25WYXJpYW50KCk7XG5cdFx0Y29uc3Qgb05hdmlnYXRpb25TZWxWYXIgPSBuZXcgU2VsZWN0aW9uVmFyaWFudCgpO1xuXG5cdFx0Y29uc3QgYVNlbFZhclByb3BOYW1lcyA9IG9TZWxlY3Rpb25WYXJpYW50LmdldFBhcmFtZXRlck5hbWVzKCkuY29uY2F0KG9TZWxlY3Rpb25WYXJpYW50LmdldFNlbGVjdE9wdGlvbnNQcm9wZXJ0eU5hbWVzKCkpO1xuXHRcdGZvciAoaSA9IDA7IGkgPCBhU2VsVmFyUHJvcE5hbWVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRzUHJvcE5hbWUgPSBhU2VsVmFyUHJvcE5hbWVzW2ldO1xuXHRcdFx0aWYgKHNQcm9wTmFtZSBpbiBvU3RhcnR1cFBhcmFtZXRlcnNBZGp1c3RlZCkge1xuXHRcdFx0XHQvLyBSZXNvbHZlIGNvbmZsaWN0LlxuXHRcdFx0XHRpZiAoYURlZmF1bHRlZFBhcmFtZXRlcnMuaW5kZXhPZihzUHJvcE5hbWUpID4gLTEpIHtcblx0XHRcdFx0XHRvTmF2aWdhdGlvblNlbFZhci5tYXNzQWRkU2VsZWN0T3B0aW9uKHNQcm9wTmFtZSwgb1NlbGVjdGlvblZhcmlhbnQuZ2V0VmFsdWUoc1Byb3BOYW1lKSEpO1xuXHRcdFx0XHRcdHRoaXMuX2FkZFBhcmFtZXRlclZhbHVlcyhvRGVmYXVsdGVkU2VsVmFyLCBzUHJvcE5hbWUsIFwiSVwiLCBcIkVRXCIsIG9TdGFydHVwUGFyYW1ldGVyc0FkanVzdGVkW3NQcm9wTmFtZV0pO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHN3aXRjaCAodGhpcy5zUGFyYW1IYW5kbGluZ01vZGUpIHtcblx0XHRcdFx0XHRcdGNhc2UgUGFyYW1IYW5kbGluZ01vZGUuU2VsVmFyV2luczpcblx0XHRcdFx0XHRcdFx0b05hdmlnYXRpb25TZWxWYXIubWFzc0FkZFNlbGVjdE9wdGlvbihzUHJvcE5hbWUsIG9TZWxlY3Rpb25WYXJpYW50LmdldFZhbHVlKHNQcm9wTmFtZSkhKTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRjYXNlIFBhcmFtSGFuZGxpbmdNb2RlLlVSTFBhcmFtV2luczpcblx0XHRcdFx0XHRcdFx0dGhpcy5fYWRkUGFyYW1ldGVyVmFsdWVzKG9OYXZpZ2F0aW9uU2VsVmFyLCBzUHJvcE5hbWUsIFwiSVwiLCBcIkVRXCIsIG9TdGFydHVwUGFyYW1ldGVyc0FkanVzdGVkW3NQcm9wTmFtZV0pO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdGNhc2UgUGFyYW1IYW5kbGluZ01vZGUuSW5zZXJ0SW5TZWxPcHQ6XG5cdFx0XHRcdFx0XHRcdG9OYXZpZ2F0aW9uU2VsVmFyLm1hc3NBZGRTZWxlY3RPcHRpb24oc1Byb3BOYW1lLCBvU2VsZWN0aW9uVmFyaWFudC5nZXRWYWx1ZShzUHJvcE5hbWUpISk7XG5cdFx0XHRcdFx0XHRcdHRoaXMuX2FkZFBhcmFtZXRlclZhbHVlcyhvTmF2aWdhdGlvblNlbFZhciwgc1Byb3BOYW1lLCBcIklcIiwgXCJFUVwiLCBvU3RhcnR1cFBhcmFtZXRlcnNBZGp1c3RlZFtzUHJvcE5hbWVdKTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0XHR0aHJvdyBuZXcgTmF2RXJyb3IoXCJOYXZpZ2F0aW9uSGFuZGxlci5JTlZBTElEX0lOUFVUXCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmIChhRGVmYXVsdGVkUGFyYW1ldGVycy5pbmRleE9mKHNQcm9wTmFtZSkgPiAtMSkge1xuXHRcdFx0XHQvLyBwYXJhbWV0ZXIgb25seSBpbiBTZWxWYXJcblx0XHRcdFx0b0RlZmF1bHRlZFNlbFZhci5tYXNzQWRkU2VsZWN0T3B0aW9uKHNQcm9wTmFtZSwgb1NlbGVjdGlvblZhcmlhbnQuZ2V0VmFsdWUoc1Byb3BOYW1lKSEpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0b05hdmlnYXRpb25TZWxWYXIubWFzc0FkZFNlbGVjdE9wdGlvbihzUHJvcE5hbWUsIG9TZWxlY3Rpb25WYXJpYW50LmdldFZhbHVlKHNQcm9wTmFtZSkhKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRmb3IgKHNQcm9wTmFtZSBpbiBvU3RhcnR1cFBhcmFtZXRlcnNBZGp1c3RlZCkge1xuXHRcdFx0Ly8gVGhlIGNhc2Ugd2hlcmUgdGhlIHBhcmFtZXRlciBhcHBlYXJzIHR3aWNlIGhhcyBhbHJlYWR5IGJlZW4gdGFrZW4gY2FyZSBvZiBhYm92ZSBzbyB3ZSBza2lwIGl0IGhlcmUuXG5cdFx0XHRpZiAoYVNlbFZhclByb3BOYW1lcy5pbmRleE9mKHNQcm9wTmFtZSkgPiAtMSkge1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGFEZWZhdWx0ZWRQYXJhbWV0ZXJzLmluZGV4T2Yoc1Byb3BOYW1lKSA+IC0xKSB7XG5cdFx0XHRcdHRoaXMuX2FkZFBhcmFtZXRlclZhbHVlcyhvRGVmYXVsdGVkU2VsVmFyLCBzUHJvcE5hbWUsIFwiSVwiLCBcIkVRXCIsIG9TdGFydHVwUGFyYW1ldGVyc0FkanVzdGVkW3NQcm9wTmFtZV0pO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5fYWRkUGFyYW1ldGVyVmFsdWVzKG9OYXZpZ2F0aW9uU2VsVmFyLCBzUHJvcE5hbWUsIFwiSVwiLCBcIkVRXCIsIG9TdGFydHVwUGFyYW1ldGVyc0FkanVzdGVkW3NQcm9wTmFtZV0pO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIHRoZSBzZWxlY3Rpb24gdmFyaWFudCB1c2VkIGZvciBuYXZpZ2F0aW9uIHNob3VsZCBiZSBmaWxsZWQgd2l0aCBkZWZhdWx0cyBpbiBjYXNlIHRoYXQgb25seSBkZWZhdWx0cyBleGlzdFxuXHRcdGxldCBiTmF2U2VsVmFySGFzRGVmYXVsdHNPbmx5ID0gZmFsc2U7XG5cdFx0aWYgKG9OYXZpZ2F0aW9uU2VsVmFyLmlzRW1wdHkoKSkge1xuXHRcdFx0Yk5hdlNlbFZhckhhc0RlZmF1bHRzT25seSA9IHRydWU7XG5cdFx0XHRjb25zdCBhUHJvcE5hbWVzID0gb0RlZmF1bHRlZFNlbFZhci5nZXRTZWxlY3RPcHRpb25zUHJvcGVydHlOYW1lcygpO1xuXHRcdFx0Zm9yIChpID0gMDsgaSA8IGFQcm9wTmFtZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0b05hdmlnYXRpb25TZWxWYXIubWFzc0FkZFNlbGVjdE9wdGlvbihhUHJvcE5hbWVzW2ldLCBvRGVmYXVsdGVkU2VsVmFyLmdldFZhbHVlKGFQcm9wTmFtZXNbaV0pISk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdG9OYXZpZ2F0aW9uU2VsVmFyOiBvTmF2aWdhdGlvblNlbFZhcixcblx0XHRcdG9EZWZhdWx0ZWRTZWxWYXI6IG9EZWZhdWx0ZWRTZWxWYXIsXG5cdFx0XHRiTmF2U2VsVmFySGFzRGVmYXVsdHNPbmx5OiBiTmF2U2VsVmFySGFzRGVmYXVsdHNPbmx5XG5cdFx0fTtcblx0fVxuXG5cdF9hZGRQYXJhbWV0ZXJWYWx1ZXMob1NlbFZhcmlhbnQ6IGFueSwgc1Byb3BOYW1lOiBhbnksIHNTaWduOiBhbnksIHNPcHRpb246IGFueSwgb1ZhbHVlczogYW55KSB7XG5cdFx0aWYgKEFycmF5LmlzQXJyYXkob1ZhbHVlcykpIHtcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgb1ZhbHVlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRvU2VsVmFyaWFudC5hZGRTZWxlY3RPcHRpb24oc1Byb3BOYW1lLCBzU2lnbiwgc09wdGlvbiwgb1ZhbHVlc1tpXSk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdG9TZWxWYXJpYW50LmFkZFNlbGVjdE9wdGlvbihzUHJvcE5hbWUsIHNTaWduLCBzT3B0aW9uLCBvVmFsdWVzKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogQ2hhbmdlcyB0aGUgVVJMIGFjY29yZGluZyB0byB0aGUgY3VycmVudCBzQXBwU3RhdGVLZXkuIEFzIGFuIHJlYWN0aW9uIHJvdXRlIGNoYW5nZSBldmVudCB3aWxsIGJlIHRyaWdnZXJlZC5cblx0ICpcblx0ICogQHBhcmFtIHNBcHBTdGF0ZUtleSBUaGUgbmV3IGFwcCBzdGF0ZSBrZXkuXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdHJlcGxhY2VIYXNoKHNBcHBTdGF0ZUtleTogc3RyaW5nKSB7XG5cdFx0Y29uc3Qgb0hhc2hDaGFuZ2VyID0gdGhpcy5vUm91dGVyLm9IYXNoQ2hhbmdlciA/IHRoaXMub1JvdXRlci5vSGFzaENoYW5nZXIgOiBIYXNoQ2hhbmdlci5nZXRJbnN0YW5jZSgpO1xuXHRcdGNvbnN0IHNBcHBIYXNoT2xkID0gb0hhc2hDaGFuZ2VyLmdldEhhc2goKTtcblx0XHQvKlxuXHRcdCAqIHVzZSAuZ2V0SGFzaCgpIGhlcmUgaW5zdGVhZCBvZiAuZ2V0QXBwSGFzaCgpIHRvIGFsc28gYmUgYWJsZSBkZWFsaW5nIHdpdGggZW52aXJvbm1lbnRzIHdoZXJlIG9ubHkgU0FQVUk1IGlzIGxvYWRlZCBhbmQgdGhlIFVTaGVsbCBpc1xuXHRcdCAqIG5vdCBpbml0aWFsaXplZCBwcm9wZXJseS5cblx0XHQgKi9cblx0XHRjb25zdCBzQXBwSGFzaE5ldyA9IHRoaXMuX3JlcGxhY2VJbm5lckFwcFN0YXRlS2V5KHNBcHBIYXNoT2xkLCBzQXBwU3RhdGVLZXkpO1xuXHRcdG9IYXNoQ2hhbmdlci5yZXBsYWNlSGFzaChzQXBwSGFzaE5ldyk7XG5cdH1cblxuXHQvKipcblx0ICogQ2hhbmdlcyB0aGUgVVJMIGFjY29yZGluZyB0byB0aGUgY3VycmVudCBhcHAgc3RhdGUgYW5kIHN0b3JlcyB0aGUgYXBwIHN0YXRlIGZvciBsYXRlciByZXRyaWV2YWwuXG5cdCAqXG5cdCAqIEBwYXJhbSBtSW5uZXJBcHBEYXRhIE9iamVjdCBjb250YWluaW5nIHRoZSBjdXJyZW50IHN0YXRlIG9mIHRoZSBhcHBcblx0ICogQHBhcmFtIGJJbW1lZGlhdGVIYXNoUmVwbGFjZSBJZiBzZXQgdG8gZmFsc2UsIHRoZSBpbm5lciBhcHAgaGFzaCB3aWxsIG5vdCBiZSByZXBsYWNlZCB1bnRpbCBzdG9yaW5nIGlzIHN1Y2Nlc3NmdWw7IGRvIG5vdFxuXHQgKiAgICAgICAgc2V0IHRvIGZhbHNlIGlmIHlvdSBjYW5ub3QgcmVhY3QgdG8gdGhlIHJlc29sdXRpb24gb2YgdGhlIFByb21pc2UsIGZvciBleGFtcGxlLCB3aGVuIGNhbGxpbmcgdGhlIGJlZm9yZUxpbmtQcmVzc2VkIGV2ZW50XG5cdCAqIEBwYXJhbSBiU2tpcEhhc2hSZXBsYWNlIElmIHNldCB0byB0cnVlLCB0aGUgaW5uZXIgYXBwIGhhc2ggd2lsbCBub3QgYmUgcmVwbGFjZWQgaW4gdGhlIHN0b3JlSW5uZXJBcHBTdGF0ZUFzeW5jLiBBbHNvIHRoZSBiSW1tZWRpYXRlSGFzaFJlcGxhY2Vcblx0ICogXHRcdCAgd2lsbCBiZSBpZ25vcmVkLlxuXHQgKiBAcmV0dXJucyBBIFByb21pc2Ugb2JqZWN0IHRvIG1vbml0b3Igd2hlbiBhbGwgdGhlIGFjdGlvbnMgb2YgdGhlIGZ1bmN0aW9uIGhhdmUgYmVlbiBleGVjdXRlZDsgaWYgdGhlIGV4ZWN1dGlvbiBpcyBzdWNjZXNzZnVsLCB0aGVcblx0ICogICAgICAgICAgYXBwIHN0YXRlIGtleSBpcyByZXR1cm5lZDsgaWYgYW4gZXJyb3Igb2NjdXJzLCBhbiBvYmplY3Qgb2YgdHlwZSB7QGxpbmsgc2FwLmZlLm5hdmlnYXRpb24uTmF2RXJyb3J9IGlzXG5cdCAqICAgICAgICAgIHJldHVybmVkXG5cdCAqIEBwdWJsaWNcblx0ICogQGV4YW1wbGUgPGNvZGU+XG5cdCAqIHNhcC51aS5kZWZpbmUoW1wic2FwL2ZlL25hdmlnYXRpb24vTmF2aWdhdGlvbkhhbmRsZXJcIl0sIGZ1bmN0aW9uIChOYXZpZ2F0aW9uSGFuZGxlcikge1xuXHQgKiBcdHZhciBvTmF2aWdhdGlvbkhhbmRsZXIgPSBuZXcgTmF2aWdhdGlvbkhhbmRsZXIob0NvbnRyb2xsZXIpO1xuXHQgKiBcdHZhciBtSW5uZXJBcHBEYXRhID0ge1xuXHQgKiBcdFx0c2VsZWN0aW9uVmFyaWFudCA6IG9TbWFydEZpbHRlckJhci5nZXREYXRhU3VpdGVGb3JtYXQoKSxcblx0ICogXHRcdHRhYmxlVmFyaWFudElkIDogb1NtYXJ0VGFibGUuZ2V0Q3VycmVudFZhcmlhbnRJZCgpLFxuXHQgKiBcdFx0Y3VzdG9tRGF0YSA6IG9NeUN1c3RvbURhdGFcblx0ICogXHR9O1xuXHQgKlxuXHQgKiBcdHZhciBvU3RvcmVJbm5lckFwcFN0YXRlUHJvbWlzZSA9IG9OYXZpZ2F0aW9uSGFuZGxlci5zdG9yZUlubmVyQXBwU3RhdGVBc3luYyhtSW5uZXJBcHBEYXRhKTtcblx0ICpcblx0ICogXHRvU3RvcmVJbm5lckFwcFN0YXRlUHJvbWlzZS5kb25lKGZ1bmN0aW9uKHNBcHBTdGF0ZUtleSl7XG5cdCAqIFx0XHQvL3lvdXIgaW5uZXIgYXBwIHN0YXRlIGlzIHNhdmVkIG5vdywgc0FwcFN0YXRlS2V5IHdhcyBhZGRlZCB0byBVUkxcblx0ICogXHRcdC8vcGVyZm9ybSBhY3Rpb25zIHRoYXQgbXVzdCBydW4gYWZ0ZXIgc2F2ZVxuXHQgKiBcdH0pO1xuXHQgKlxuXHQgKiBcdG9TdG9yZUlubmVyQXBwU3RhdGVQcm9taXNlLmZhaWwoZnVuY3Rpb24ob0Vycm9yKXtcblx0ICogXHRcdC8vc29tZSBlcnJvciBoYW5kbGluZ1xuXHQgKiBcdH0pO1xuXHQgKiB9KTtcblx0ICogPC9jb2RlPlxuXHQgKi9cblx0c3RvcmVJbm5lckFwcFN0YXRlQXN5bmMoXG5cdFx0bUlubmVyQXBwRGF0YTogSW5uZXJBcHBEYXRhLFxuXHRcdGJJbW1lZGlhdGVIYXNoUmVwbGFjZT86IGJvb2xlYW4sXG5cdFx0YlNraXBIYXNoUmVwbGFjZT86IGJvb2xlYW5cblx0KTogalF1ZXJ5LlByb21pc2U8c3RyaW5nPiB7XG5cdFx0aWYgKHR5cGVvZiBiSW1tZWRpYXRlSGFzaFJlcGxhY2UgIT09IFwiYm9vbGVhblwiKSB7XG5cdFx0XHRiSW1tZWRpYXRlSGFzaFJlcGxhY2UgPSB0cnVlOyAvLyBkZWZhdWx0XG5cdFx0fVxuXHRcdGNvbnN0IG9OYXZIYW5kbGVyID0gdGhpcztcblx0XHRjb25zdCBvTXlEZWZlcnJlZCA9IGpRdWVyeS5EZWZlcnJlZDxzdHJpbmc+KCk7XG5cblx0XHRjb25zdCBmblJlcGxhY2VIYXNoID0gZnVuY3Rpb24gKHNBcHBTdGF0ZUtleTogYW55KSB7XG5cdFx0XHRjb25zdCBvSGFzaENoYW5nZXIgPSBvTmF2SGFuZGxlci5vUm91dGVyLm9IYXNoQ2hhbmdlciA/IG9OYXZIYW5kbGVyLm9Sb3V0ZXIub0hhc2hDaGFuZ2VyIDogSGFzaENoYW5nZXIuZ2V0SW5zdGFuY2UoKTtcblx0XHRcdGNvbnN0IHNBcHBIYXNoT2xkID0gb0hhc2hDaGFuZ2VyLmdldEhhc2goKTtcblx0XHRcdC8qXG5cdFx0XHQgKiB1c2UgLmdldEhhc2goKSBoZXJlIGluc3RlYWQgb2YgLmdldEFwcEhhc2goKSB0byBhbHNvIGJlIGFibGUgZGVhbGluZyB3aXRoIGVudmlyb25tZW50cyB3aGVyZSBvbmx5IFNBUFVJNSBpcyBsb2FkZWQgYW5kIHRoZSBVU2hlbGxcblx0XHRcdCAqIGlzIG5vdCBpbml0aWFsaXplZCBwcm9wZXJseS5cblx0XHRcdCAqL1xuXHRcdFx0Y29uc3Qgc0FwcEhhc2hOZXcgPSBvTmF2SGFuZGxlci5fcmVwbGFjZUlubmVyQXBwU3RhdGVLZXkoc0FwcEhhc2hPbGQsIHNBcHBTdGF0ZUtleSk7XG5cdFx0XHRvSGFzaENoYW5nZXIucmVwbGFjZUhhc2goc0FwcEhhc2hOZXcpO1xuXHRcdH07XG5cblx0XHQvLyBpbiBjYXNlIG1Jbm5lckFwcFN0YXRlIGlzIGVtcHR5LCBkbyBub3Qgb3ZlcndyaXRlIHRoZSBsYXN0IHNhdmVkIHN0YXRlXG5cdFx0aWYgKGlzRW1wdHlPYmplY3QobUlubmVyQXBwRGF0YSBhcyBvYmplY3QpKSB7XG5cdFx0XHRvTXlEZWZlcnJlZC5yZXNvbHZlKFwiXCIpO1xuXHRcdFx0cmV0dXJuIG9NeURlZmVycmVkLnByb21pc2UoKTtcblx0XHR9XG5cblx0XHQvLyBjaGVjayBpZiB3ZSBhbHJlYWR5IHNhdmVkIHRoZSBzYW1lIGRhdGFcblx0XHRjb25zdCBzQXBwU3RhdGVLZXlDYWNoZWQgPSB0aGlzLl9vTGFzdFNhdmVkSW5uZXJBcHBEYXRhLnNBcHBTdGF0ZUtleTtcblxuXHRcdGNvbnN0IGJJbm5lckFwcERhdGFFcXVhbCA9IEpTT04uc3RyaW5naWZ5KG1Jbm5lckFwcERhdGEpID09PSBKU09OLnN0cmluZ2lmeSh0aGlzLl9vTGFzdFNhdmVkSW5uZXJBcHBEYXRhLm9BcHBEYXRhKTtcblx0XHRpZiAoYklubmVyQXBwRGF0YUVxdWFsICYmIHNBcHBTdGF0ZUtleUNhY2hlZCkge1xuXHRcdFx0Ly8gcGFzc2VkIGlubmVyIGFwcCBzdGF0ZSBmb3VuZCBpbiBjYWNoZVxuXHRcdFx0dGhpcy5fb0xhc3RTYXZlZElubmVyQXBwRGF0YS5pQ2FjaGVIaXQrKztcblxuXHRcdFx0Ly8gcmVwbGFjZSBpbm5lciBhcHAgaGFzaCB3aXRoIGNhY2hlZCBhcHBTdGF0ZUtleSBpbiB1cmwgKGp1c3QgaW4gY2FzZSB0aGUgYXBwIGhhcyBjaGFuZ2VkIHRoZSBoYXNoIGluIG1lYW50aW1lKVxuXHRcdFx0Zm5SZXBsYWNlSGFzaChzQXBwU3RhdGVLZXlDYWNoZWQpO1xuXHRcdFx0b015RGVmZXJyZWQucmVzb2x2ZShzQXBwU3RhdGVLZXlDYWNoZWQpO1xuXHRcdFx0cmV0dXJuIG9NeURlZmVycmVkLnByb21pc2UoKTtcblx0XHR9XG5cblx0XHQvLyBwYXNzZWQgaW5uZXIgYXBwIHN0YXRlIG5vdCBmb3VuZCBpbiBjYWNoZVxuXHRcdHRoaXMuX29MYXN0U2F2ZWRJbm5lckFwcERhdGEuaUNhY2hlTWlzcysrO1xuXG5cdFx0Y29uc3QgZm5PbkFmdGVyU2F2ZSA9IGZ1bmN0aW9uIChzQXBwU3RhdGVLZXk6IGFueSkge1xuXHRcdFx0Ly8gcmVwbGFjZSBpbm5lciBhcHAgaGFzaCB3aXRoIG5ldyBhcHBTdGF0ZUtleSBpbiB1cmxcblx0XHRcdGlmICghYlNraXBIYXNoUmVwbGFjZSAmJiAhYkltbWVkaWF0ZUhhc2hSZXBsYWNlKSB7XG5cdFx0XHRcdGZuUmVwbGFjZUhhc2goc0FwcFN0YXRlS2V5KTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gcmVtZW1iZXIgbGFzdCBzYXZlZCBzdGF0ZVxuXHRcdFx0b05hdkhhbmRsZXIuX29MYXN0U2F2ZWRJbm5lckFwcERhdGEub0FwcERhdGEgPSBtSW5uZXJBcHBEYXRhO1xuXHRcdFx0b05hdkhhbmRsZXIuX29MYXN0U2F2ZWRJbm5lckFwcERhdGEuc0FwcFN0YXRlS2V5ID0gc0FwcFN0YXRlS2V5O1xuXHRcdFx0b015RGVmZXJyZWQucmVzb2x2ZShzQXBwU3RhdGVLZXkpO1xuXHRcdH07XG5cblx0XHRjb25zdCBmbk9uRXJyb3IgPSBmdW5jdGlvbiAob0Vycm9yOiBhbnkpIHtcblx0XHRcdG9NeURlZmVycmVkLnJlamVjdChvRXJyb3IpO1xuXHRcdH07XG5cblx0XHR0aGlzLl9zYXZlQXBwU3RhdGVBc3luYyhtSW5uZXJBcHBEYXRhLCBmbk9uQWZ0ZXJTYXZlLCBmbk9uRXJyb3IpXG5cdFx0XHQudGhlbihmdW5jdGlvbiAoc0FwcFN0YXRlS2V5OiBhbnkpIHtcblx0XHRcdFx0LyogTm90ZSB0aGF0IF9zYXBBcHBTdGF0ZSBtYXkgcmV0dXJuICd1bmRlZmluZWQnIGluIGNhc2UgdGhhdCB0aGUgcGFyc2luZyBoYXMgZmFpbGVkLiBJbiB0aGlzIGNhc2UsIHdlIHNob3VsZCBub3QgdHJpZ2dlciB0aGUgcmVwbGFjZW1lbnRcblx0XHRcdFx0ICogb2YgdGhlIEFwcCBIYXNoIHdpdGggdGhlIGdlbmVyYXRlZCBrZXksIGFzIHRoZSBjb250YWluZXIgd2FzIG5vdCB3cml0dGVuIGJlZm9yZS4gTm90ZSBhcyB3ZWxsIHRoYXQgdGhlIGVycm9yIGhhbmRsaW5nIGhhcyBhbHJlYWR5XG5cdFx0XHRcdCAqIGhhcHBlbmVkIGJlZm9yZSBieSBtYWtpbmcgdGhlIG9NeURlZmVycmVkIHByb21pc2UgZmFpbCAoc2VlIGZuT25FcnJvciBhYm92ZSkuXG5cdFx0XHRcdCAqL1xuXHRcdFx0XHRpZiAoc0FwcFN0YXRlS2V5ICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHQvLyByZXBsYWNlIGlubmVyIGFwcCBoYXNoIHdpdGggbmV3IGFwcFN0YXRlS2V5IGluIHVybFxuXHRcdFx0XHRcdC8vIG5vdGU6IHdlIGRvIG5vdCB3YWl0IGZvciB0aGUgc2F2ZSB0byBiZSBjb21wbGV0ZWQ6IHRoaXMgYXN5bmNocm9ub3VzbHkgYmVoYXZpb3VyIGlzIG5lY2Vzc2FyeSBpZlxuXHRcdFx0XHRcdC8vIHRoaXMgbWV0aG9kIGlzIGNhbGxlZCBlLmcuIGluIGEgb25MaW5rUHJlc3NlZCBldmVudCB3aXRoIG5vIHBvc3NpYmlsaXR5IHRvIHdhaXQgZm9yIHRoZSBwcm9taXNlIHJlc29sdXRpb25cblx0XHRcdFx0XHRpZiAoIWJTa2lwSGFzaFJlcGxhY2UgJiYgYkltbWVkaWF0ZUhhc2hSZXBsYWNlKSB7XG5cdFx0XHRcdFx0XHRmblJlcGxhY2VIYXNoKHNBcHBTdGF0ZUtleSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0TG9nLmVycm9yKFwiTmF2aWdhdGlvbkhhbmRsZXIuX3NhdmVBcHBTdGF0ZUFzeW5jIGZhaWxlZFwiKTtcblx0XHRcdH0pO1xuXG5cdFx0cmV0dXJuIG9NeURlZmVycmVkLnByb21pc2UoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGFuZ2VzIHRoZSBVUkwgYWNjb3JkaW5nIHRvIHRoZSBjdXJyZW50IGFwcCBzdGF0ZSBhbmQgc3RvcmVzIHRoZSBhcHAgc3RhdGUgZm9yIGxhdGVyIHJldHJpZXZhbC5cblx0ICpcblx0ICogQHBhcmFtIG1Jbm5lckFwcERhdGEgT2JqZWN0IGNvbnRhaW5pbmcgdGhlIGN1cnJlbnQgc3RhdGUgb2YgdGhlIGFwcFxuXHQgKiBAcGFyYW0gYkltbWVkaWF0ZUhhc2hSZXBsYWNlIElmIHNldCB0byBmYWxzZSwgdGhlIGlubmVyIGFwcCBoYXNoIHdpbGwgbm90IGJlIHJlcGxhY2VkIHVudGlsIHN0b3JpbmcgaXMgc3VjY2Vzc2Z1bDsgZG8gbm90XG5cdCAqICAgICAgICBzZXQgdG8gZmFsc2UgaWYgeW91IGNhbm5vdCByZWFjdCB0byB0aGUgcmVzb2x1dGlvbiBvZiB0aGUgUHJvbWlzZSwgZm9yIGV4YW1wbGUsIHdoZW4gY2FsbGluZyB0aGUgYmVmb3JlTGlua1ByZXNzZWQgZXZlbnRcblx0ICogQHJldHVybnMgQSBQcm9taXNlIG9iamVjdCB0byBtb25pdG9yIHdoZW4gYWxsIHRoZSBhY3Rpb25zIG9mIHRoZSBmdW5jdGlvbiBoYXZlIGJlZW4gZXhlY3V0ZWQ7IGlmIHRoZSBleGVjdXRpb24gaXMgc3VjY2Vzc2Z1bCwgdGhlXG5cdCAqICAgICAgICAgIGFwcCBzdGF0ZSBrZXkgaXMgcmV0dXJuZWQ7IGlmIGFuIGVycm9yIG9jY3VycywgYW4gb2JqZWN0IG9mIHR5cGUge0BsaW5rIHNhcC5mZS5uYXZpZ2F0aW9uLk5hdkVycm9yfSBpc1xuXHQgKiAgICAgICAgICByZXR1cm5lZFxuXHQgKiBAcHVibGljXG5cdCAqIEBleGFtcGxlIDxjb2RlPlxuXHQgKiBzYXAudWkuZGVmaW5lKFtcInNhcC9mZS9uYXZpZ2F0aW9uL05hdmlnYXRpb25IYW5kbGVyXCJdLCBmdW5jdGlvbiAoTmF2aWdhdGlvbkhhbmRsZXIpIHtcblx0ICogXHR2YXIgb05hdmlnYXRpb25IYW5kbGVyID0gbmV3IE5hdmlnYXRpb25IYW5kbGVyKG9Db250cm9sbGVyKTtcblx0ICogXHR2YXIgbUlubmVyQXBwRGF0YSA9IHtcblx0ICogXHRcdHNlbGVjdGlvblZhcmlhbnQgOiBvU21hcnRGaWx0ZXJCYXIuZ2V0RGF0YVN1aXRlRm9ybWF0KCksXG5cdCAqIFx0XHR0YWJsZVZhcmlhbnRJZCA6IG9TbWFydFRhYmxlLmdldEN1cnJlbnRWYXJpYW50SWQoKSxcblx0ICogXHRcdGN1c3RvbURhdGEgOiBvTXlDdXN0b21EYXRhXG5cdCAqIFx0fTtcblx0ICpcblx0ICogXHR2YXIgb1N0b3JlSW5uZXJBcHBTdGF0ZVByb21pc2UgPSBvTmF2aWdhdGlvbkhhbmRsZXIuc3RvcmVJbm5lckFwcFN0YXRlKG1Jbm5lckFwcERhdGEpO1xuXHQgKlxuXHQgKiBcdG9TdG9yZUlubmVyQXBwU3RhdGVQcm9taXNlLmRvbmUoZnVuY3Rpb24oc0FwcFN0YXRlS2V5KXtcblx0ICogXHRcdC8veW91ciBpbm5lciBhcHAgc3RhdGUgaXMgc2F2ZWQgbm93LCBzQXBwU3RhdGVLZXkgd2FzIGFkZGVkIHRvIFVSTFxuXHQgKiBcdFx0Ly9wZXJmb3JtIGFjdGlvbnMgdGhhdCBtdXN0IHJ1biBhZnRlciBzYXZlXG5cdCAqIFx0fSk7XG5cdCAqXG5cdCAqIFx0b1N0b3JlSW5uZXJBcHBTdGF0ZVByb21pc2UuZmFpbChmdW5jdGlvbihvRXJyb3Ipe1xuXHQgKiBcdFx0Ly9zb21lIGVycm9yIGhhbmRsaW5nXG5cdCAqIFx0fSk7XG5cdCAqIH0pO1xuXHQgKiA8L2NvZGU+XG5cdCAqIEBkZXByZWNhdGVkIGFzIG9mIHZlcnNpb24gMS4xMDQuIFVzZSB0aGUge0BsaW5rIHNhcC5mZS5uYXZpZ2F0aW9uLk5hdmlnYXRpb25IYW5kbGVyLnN0b3JlSW5uZXJBcHBTdGF0ZUFzeW5jfSBpbnN0ZWFkLlxuXHQgKi9cblx0c3RvcmVJbm5lckFwcFN0YXRlKG1Jbm5lckFwcERhdGE6IElubmVyQXBwRGF0YSwgYkltbWVkaWF0ZUhhc2hSZXBsYWNlPzogYm9vbGVhbik6IGpRdWVyeS5Qcm9taXNlPHN0cmluZz4ge1xuXHRcdExvZy5lcnJvcihcblx0XHRcdFwiRGVwcmVjYXRlZCBBUEkgY2FsbCBvZiAnc2FwLmZlLm5hdmlnYXRpb24uTmF2aWdhdGlvbkhhbmRsZXIuc3RvcmVJbm5lckFwcFN0YXRlJy4gUGxlYXNlIHVzZSAnc3RvcmVJbm5lckFwcFN0YXRlQXN5bmMnIGluc3RlYWRcIixcblx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdFwic2FwLmZlLm5hdmlnYXRpb24uTmF2aWdhdGlvbkhhbmRsZXJcIlxuXHRcdCk7XG5cdFx0aWYgKHR5cGVvZiBiSW1tZWRpYXRlSGFzaFJlcGxhY2UgIT09IFwiYm9vbGVhblwiKSB7XG5cdFx0XHRiSW1tZWRpYXRlSGFzaFJlcGxhY2UgPSB0cnVlOyAvLyBkZWZhdWx0XG5cdFx0fVxuXHRcdGNvbnN0IG9OYXZIYW5kbGVyID0gdGhpcztcblx0XHRjb25zdCBvTXlEZWZlcnJlZCA9IGpRdWVyeS5EZWZlcnJlZCgpO1xuXG5cdFx0Y29uc3QgZm5SZXBsYWNlSGFzaCA9IGZ1bmN0aW9uIChzQXBwU3RhdGVLZXk6IGFueSkge1xuXHRcdFx0Y29uc3Qgb0hhc2hDaGFuZ2VyID0gb05hdkhhbmRsZXIub1JvdXRlci5vSGFzaENoYW5nZXIgPyBvTmF2SGFuZGxlci5vUm91dGVyLm9IYXNoQ2hhbmdlciA6IEhhc2hDaGFuZ2VyLmdldEluc3RhbmNlKCk7XG5cdFx0XHRjb25zdCBzQXBwSGFzaE9sZCA9IG9IYXNoQ2hhbmdlci5nZXRIYXNoKCk7XG5cdFx0XHQvKlxuXHRcdFx0ICogdXNlIC5nZXRIYXNoKCkgaGVyZSBpbnN0ZWFkIG9mIC5nZXRBcHBIYXNoKCkgdG8gYWxzbyBiZSBhYmxlIGRlYWxpbmcgd2l0aCBlbnZpcm9ubWVudHMgd2hlcmUgb25seSBTQVBVSTUgaXMgbG9hZGVkIGFuZCB0aGUgVVNoZWxsXG5cdFx0XHQgKiBpcyBub3QgaW5pdGlhbGl6ZWQgcHJvcGVybHkuXG5cdFx0XHQgKi9cblx0XHRcdGNvbnN0IHNBcHBIYXNoTmV3ID0gb05hdkhhbmRsZXIuX3JlcGxhY2VJbm5lckFwcFN0YXRlS2V5KHNBcHBIYXNoT2xkLCBzQXBwU3RhdGVLZXkpO1xuXHRcdFx0b0hhc2hDaGFuZ2VyLnJlcGxhY2VIYXNoKHNBcHBIYXNoTmV3KTtcblx0XHR9O1xuXG5cdFx0Ly8gaW4gY2FzZSBtSW5uZXJBcHBTdGF0ZSBpcyBlbXB0eSwgZG8gbm90IG92ZXJ3cml0ZSB0aGUgbGFzdCBzYXZlZCBzdGF0ZVxuXHRcdGlmIChpc0VtcHR5T2JqZWN0KG1Jbm5lckFwcERhdGEgYXMgb2JqZWN0KSkge1xuXHRcdFx0b015RGVmZXJyZWQucmVzb2x2ZShcIlwiKTtcblx0XHRcdHJldHVybiBvTXlEZWZlcnJlZC5wcm9taXNlKCk7XG5cdFx0fVxuXG5cdFx0Ly8gY2hlY2sgaWYgd2UgYWxyZWFkeSBzYXZlZCB0aGUgc2FtZSBkYXRhXG5cdFx0Y29uc3Qgc0FwcFN0YXRlS2V5Q2FjaGVkID0gdGhpcy5fb0xhc3RTYXZlZElubmVyQXBwRGF0YS5zQXBwU3RhdGVLZXk7XG5cblx0XHRjb25zdCBiSW5uZXJBcHBEYXRhRXF1YWwgPSBKU09OLnN0cmluZ2lmeShtSW5uZXJBcHBEYXRhKSA9PT0gSlNPTi5zdHJpbmdpZnkodGhpcy5fb0xhc3RTYXZlZElubmVyQXBwRGF0YS5vQXBwRGF0YSk7XG5cdFx0aWYgKGJJbm5lckFwcERhdGFFcXVhbCAmJiBzQXBwU3RhdGVLZXlDYWNoZWQpIHtcblx0XHRcdC8vIHBhc3NlZCBpbm5lciBhcHAgc3RhdGUgZm91bmQgaW4gY2FjaGVcblx0XHRcdHRoaXMuX29MYXN0U2F2ZWRJbm5lckFwcERhdGEuaUNhY2hlSGl0Kys7XG5cblx0XHRcdC8vIHJlcGxhY2UgaW5uZXIgYXBwIGhhc2ggd2l0aCBjYWNoZWQgYXBwU3RhdGVLZXkgaW4gdXJsIChqdXN0IGluIGNhc2UgdGhlIGFwcCBoYXMgY2hhbmdlZCB0aGUgaGFzaCBpbiBtZWFudGltZSlcblx0XHRcdGZuUmVwbGFjZUhhc2goc0FwcFN0YXRlS2V5Q2FjaGVkKTtcblx0XHRcdG9NeURlZmVycmVkLnJlc29sdmUoc0FwcFN0YXRlS2V5Q2FjaGVkKTtcblx0XHRcdHJldHVybiBvTXlEZWZlcnJlZC5wcm9taXNlKCk7XG5cdFx0fVxuXG5cdFx0Ly8gcGFzc2VkIGlubmVyIGFwcCBzdGF0ZSBub3QgZm91bmQgaW4gY2FjaGVcblx0XHR0aGlzLl9vTGFzdFNhdmVkSW5uZXJBcHBEYXRhLmlDYWNoZU1pc3MrKztcblxuXHRcdGNvbnN0IGZuT25BZnRlclNhdmUgPSBmdW5jdGlvbiAoc0FwcFN0YXRlS2V5OiBhbnkpIHtcblx0XHRcdC8vIHJlcGxhY2UgaW5uZXIgYXBwIGhhc2ggd2l0aCBuZXcgYXBwU3RhdGVLZXkgaW4gdXJsXG5cdFx0XHRpZiAoIWJJbW1lZGlhdGVIYXNoUmVwbGFjZSkge1xuXHRcdFx0XHRmblJlcGxhY2VIYXNoKHNBcHBTdGF0ZUtleSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIHJlbWVtYmVyIGxhc3Qgc2F2ZWQgc3RhdGVcblx0XHRcdG9OYXZIYW5kbGVyLl9vTGFzdFNhdmVkSW5uZXJBcHBEYXRhLm9BcHBEYXRhID0gbUlubmVyQXBwRGF0YTtcblx0XHRcdG9OYXZIYW5kbGVyLl9vTGFzdFNhdmVkSW5uZXJBcHBEYXRhLnNBcHBTdGF0ZUtleSA9IHNBcHBTdGF0ZUtleTtcblx0XHRcdG9NeURlZmVycmVkLnJlc29sdmUoc0FwcFN0YXRlS2V5KTtcblx0XHR9O1xuXG5cdFx0Y29uc3QgZm5PbkVycm9yID0gZnVuY3Rpb24gKG9FcnJvcjogYW55KSB7XG5cdFx0XHRvTXlEZWZlcnJlZC5yZWplY3Qob0Vycm9yKTtcblx0XHR9O1xuXG5cdFx0Y29uc3Qgc0FwcFN0YXRlS2V5ID0gdGhpcy5fc2F2ZUFwcFN0YXRlKG1Jbm5lckFwcERhdGEsIGZuT25BZnRlclNhdmUsIGZuT25FcnJvcik7XG5cdFx0Lypcblx0XHQgKiBOb3RlIHRoYXQgX3NhcEFwcFN0YXRlIG1heSByZXR1cm4gJ3VuZGVmaW5lZCcgaW4gY2FzZSB0aGF0IHRoZSBwYXJzaW5nIGhhcyBmYWlsZWQuIEluIHRoaXMgY2FzZSwgd2Ugc2hvdWxkIG5vdCB0cmlnZ2VyIHRoZSByZXBsYWNlbWVudFxuXHRcdCAqIG9mIHRoZSBBcHAgSGFzaCB3aXRoIHRoZSBnZW5lcmF0ZWQga2V5LCBhcyB0aGUgY29udGFpbmVyIHdhcyBub3Qgd3JpdHRlbiBiZWZvcmUuIE5vdGUgYXMgd2VsbCB0aGF0IHRoZSBlcnJvciBoYW5kbGluZyBoYXMgYWxyZWFkeVxuXHRcdCAqIGhhcHBlbmVkIGJlZm9yZSBieSBtYWtpbmcgdGhlIG9NeURlZmVycmVkIHByb21pc2UgZmFpbCAoc2VlIGZuT25FcnJvciBhYm92ZSkuXG5cdFx0ICovXG5cdFx0aWYgKHNBcHBTdGF0ZUtleSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHQvLyByZXBsYWNlIGlubmVyIGFwcCBoYXNoIHdpdGggbmV3IGFwcFN0YXRlS2V5IGluIHVybFxuXHRcdFx0Ly8gbm90ZTogd2UgZG8gbm90IHdhaXQgZm9yIHRoZSBzYXZlIHRvIGJlIGNvbXBsZXRlZDogdGhpcyBhc3luY2hyb25vdXNseSBiZWhhdmlvdXIgaXMgbmVjZXNzYXJ5IGlmXG5cdFx0XHQvLyB0aGlzIG1ldGhvZCBpcyBjYWxsZWQgZS5nLiBpbiBhIG9uTGlua1ByZXNzZWQgZXZlbnQgd2l0aCBubyBwb3NzaWJpbGl0eSB0byB3YWl0IGZvciB0aGUgcHJvbWlzZSByZXNvbHV0aW9uXG5cdFx0XHRpZiAoYkltbWVkaWF0ZUhhc2hSZXBsYWNlKSB7XG5cdFx0XHRcdGZuUmVwbGFjZUhhc2goc0FwcFN0YXRlS2V5KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gb015RGVmZXJyZWQucHJvbWlzZSgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoYW5nZXMgdGhlIFVSTCBhY2NvcmRpbmcgdG8gdGhlIGN1cnJlbnQgYXBwIHN0YXRlIGFuZCBzdG9yZXMgdGhlIGFwcCBzdGF0ZSBmb3IgbGF0ZXIgcmV0cmlldmFsLlxuXHQgKlxuXHQgKiBAcGFyYW0gbUlubmVyQXBwRGF0YSBPYmplY3QgY29udGFpbmluZyB0aGUgY3VycmVudCBzdGF0ZSBvZiB0aGUgYXBwXG5cdCAqIEBwYXJhbSBiSW1tZWRpYXRlSGFzaFJlcGxhY2UgSWYgc2V0IHRvIGZhbHNlLCB0aGUgaW5uZXIgYXBwIGhhc2ggd2lsbCBub3QgYmUgcmVwbGFjZWQgdW50aWwgc3RvcmluZyBpcyBzdWNjZXNzZnVsOyBkbyBub3Rcblx0ICogICAgICAgIHNldCB0byBmYWxzZSBpZiB5b3UgY2Fubm90IHJlYWN0IHRvIHRoZSByZXNvbHV0aW9uIG9mIHRoZSBQcm9taXNlLCBmb3IgZXhhbXBsZSwgd2hlbiBjYWxsaW5nIHRoZSBiZWZvcmVMaW5rUHJlc3NlZCBldmVudC4gPGI+Tm90ZTo8L2I+SWZcblx0ICogICAgICAgIG5vdCBwcm92aWRlZCBpdCB3aWxsIGJlIHRyZWF0ZWQgYXMgc2V0IHRvIGZhbHNlLiA8Yj5Ob3RlOjwvYj5JZiBzZXQgdG8gdHJ1ZSwgdGhlIGNhbGxpbmcgaW5zdGFuY2UgaGFzIHRvIGVuc3VyZSB0aGF0IGEgZm9sbG93LW9uXG5cdCAqICAgICAgICBjYWxsIHRvIDxjb2RlPnJlcGxhY2VIYXNoPC9jb2RlPiB3aWxsIHRha2UgcGxhY2UhXG5cdCAqIEByZXR1cm5zIEFuIG9iamVjdCBjb250YWluaW5nIHRoZSBhcHBTdGF0ZUlkIGFuZCBhIHByb21pc2Ugb2JqZWN0IHRvIG1vbml0b3Igd2hlbiBhbGwgdGhlIGFjdGlvbnMgb2YgdGhlIGZ1bmN0aW9uIGhhdmUgYmVlblxuXHQgKiAgICAgICAgICBleGVjdXRlZDsgUGxlYXNlIG5vdGUgdGhhdCB0aGUgYXBwU3RhdGVLZXkgbWF5IGJlIHVuZGVmaW5lZCBvciBlbXB0eS5cblx0ICogQGV4YW1wbGUgPGNvZGU+XG5cdCAqIHNhcC51aS5kZWZpbmUoW1wic2FwL2ZlL25hdmlnYXRpb24vTmF2aWdhdGlvbkhhbmRsZXJcIl0sIGZ1bmN0aW9uIChOYXZpZ2F0aW9uSGFuZGxlcikge1xuXHQgKiBcdHZhciBvTmF2aWdhdGlvbkhhbmRsZXIgPSBuZXcgTmF2aWdhdGlvbkhhbmRsZXIob0NvbnRyb2xsZXIpO1xuXHQgKiBcdHZhciBtSW5uZXJBcHBEYXRhID0ge1xuXHQgKiBcdFx0c2VsZWN0aW9uVmFyaWFudCA6IG9TbWFydEZpbHRlckJhci5nZXREYXRhU3VpdGVGb3JtYXQoKSxcblx0ICogXHRcdHRhYmxlVmFyaWFudElkIDogb1NtYXJ0VGFibGUuZ2V0Q3VycmVudFZhcmlhbnRJZCgpLFxuXHQgKiBcdFx0Y3VzdG9tRGF0YSA6IG9NeUN1c3RvbURhdGFcblx0ICogXHR9O1xuXHQgKlxuXHQgKiBcdHZhciBvU3RvcmVJbm5lckFwcFN0YXRlID0gc3RvcmVJbm5lckFwcFN0YXRlV2l0aE5vbkRlbGF5ZWRSZXR1cm4obUlubmVyQXBwRGF0YSk7XG5cdCAqIFx0dmFyIHNBcHBTdGF0ZUtleSA9IG9TdG9yZUlubmVyQXBwU3RhdGUuYXBwU3RhdGVLZXk7XG5cdCAqIFx0aWYgKCFzQXBwU3RhdGVLZXkpIHtcblx0ICogICAgLy8gbm8gYXBwU3RhdGVLZXkgb2J0YWluZWQuLi5cblx0ICogXHR9O1xuXHQgKiBcdHZhciBvU3RvcmVJbm5lckFwcFN0YXRlUHJvbWlzZSA9IG9TdG9yZUlubmVyQXBwU3RhdGUucHJvbWlzZTtcblx0ICpcblx0ICogXHRvU3RvcmVJbm5lckFwcFN0YXRlUHJvbWlzZS5kb25lKGZ1bmN0aW9uKHNBcHBTdGF0ZUtleSl7XG5cdCAqIFx0XHQvL3lvdXIgaW5uZXIgYXBwIHN0YXRlIGlzIHNhdmVkIG5vdywgc0FwcFN0YXRlS2V5IHdhcyBhZGRlZCB0byBVUkxcblx0ICogXHRcdC8vcGVyZm9ybSBhY3Rpb25zIHRoYXQgbXVzdCBydW4gYWZ0ZXIgc2F2ZVxuXHQgKiBcdH0pO1xuXHQgKlxuXHQgKiBcdG9TdG9yZUlubmVyQXBwU3RhdGVQcm9taXNlLmZhaWwoZnVuY3Rpb24ob0Vycm9yKXtcblx0ICogXHRcdC8vc29tZSBlcnJvciBoYW5kbGluZ1xuXHQgKiBcdH0pO1xuXHQgKiB9KTtcblx0ICogPC9jb2RlPlxuXHQgKiBAcHVibGljXG5cdCAqIEBkZXByZWNhdGVkIGFzIG9mIHZlcnNpb24gMS4xMDQuIFVzZSB0aGUge0BsaW5rIHNhcC5mZS5uYXZpZ2F0aW9uLk5hdmlnYXRpb25IYW5kbGVyLnN0b3JlSW5uZXJBcHBTdGF0ZUFzeW5jfSBpbnN0ZWFkLlxuXHQgKi9cblx0c3RvcmVJbm5lckFwcFN0YXRlV2l0aEltbWVkaWF0ZVJldHVybihtSW5uZXJBcHBEYXRhOiBJbm5lckFwcERhdGEsIGJJbW1lZGlhdGVIYXNoUmVwbGFjZT86IGJvb2xlYW4pIHtcblx0XHRMb2cuZXJyb3IoXG5cdFx0XHRcIkRlcHJlY2F0ZWQgQVBJIGNhbGwgb2YgJ3NhcC5mZS5uYXZpZ2F0aW9uLk5hdmlnYXRpb25IYW5kbGVyLnN0b3JlSW5uZXJBcHBTdGF0ZVdpdGhJbW1lZGlhdGVSZXR1cm4nLiBQbGVhc2UgdXNlICdzdG9yZUlubmVyQXBwU3RhdGVBc3luYycgaW5zdGVhZFwiLFxuXHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0XCJzYXAuZmUubmF2aWdhdGlvbi5OYXZpZ2F0aW9uSGFuZGxlclwiXG5cdFx0KTtcblx0XHRpZiAodHlwZW9mIGJJbW1lZGlhdGVIYXNoUmVwbGFjZSAhPT0gXCJib29sZWFuXCIpIHtcblx0XHRcdGJJbW1lZGlhdGVIYXNoUmVwbGFjZSA9IGZhbHNlOyAvLyBkZWZhdWx0XG5cdFx0fVxuXG5cdFx0Y29uc3Qgb05hdkhhbmRsZXIgPSB0aGlzO1xuXHRcdGNvbnN0IG9BcHBTdGF0ZVByb21pc2UgPSBqUXVlcnkuRGVmZXJyZWQoKTtcblxuXHRcdC8vIGluIGNhc2UgbUlubmVyQXBwU3RhdGUgaXMgZW1wdHksIGRvIG5vdCBvdmVyd3JpdGUgdGhlIGxhc3Qgc2F2ZWQgc3RhdGVcblx0XHRpZiAoaXNFbXB0eU9iamVjdChtSW5uZXJBcHBEYXRhKSkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0YXBwU3RhdGVLZXk6IFwiXCIsXG5cdFx0XHRcdHByb21pc2U6IG9BcHBTdGF0ZVByb21pc2UucmVzb2x2ZShcIlwiKVxuXHRcdFx0fTtcblx0XHR9XG5cblx0XHQvLyBjaGVjayBpZiB3ZSBhbHJlYWR5IHNhdmVkIHRoZSBzYW1lIGRhdGFcblx0XHRjb25zdCBzQXBwU3RhdGVLZXlDYWNoZWQgPSB0aGlzLl9vTGFzdFNhdmVkSW5uZXJBcHBEYXRhLnNBcHBTdGF0ZUtleTtcblxuXHRcdGNvbnN0IGJJbm5lckFwcERhdGFFcXVhbCA9IEpTT04uc3RyaW5naWZ5KG1Jbm5lckFwcERhdGEpID09PSBKU09OLnN0cmluZ2lmeSh0aGlzLl9vTGFzdFNhdmVkSW5uZXJBcHBEYXRhLm9BcHBEYXRhKTtcblx0XHRpZiAoYklubmVyQXBwRGF0YUVxdWFsICYmIHNBcHBTdGF0ZUtleUNhY2hlZCkge1xuXHRcdFx0Ly8gcGFzc2VkIGlubmVyIGFwcCBzdGF0ZSBmb3VuZCBpbiBjYWNoZVxuXHRcdFx0dGhpcy5fb0xhc3RTYXZlZElubmVyQXBwRGF0YS5pQ2FjaGVIaXQrKztcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGFwcFN0YXRlS2V5OiBzQXBwU3RhdGVLZXlDYWNoZWQsXG5cdFx0XHRcdHByb21pc2U6IG9BcHBTdGF0ZVByb21pc2UucmVzb2x2ZShzQXBwU3RhdGVLZXlDYWNoZWQpXG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdC8vIHBhc3NlZCBpbm5lciBhcHAgc3RhdGUgbm90IGZvdW5kIGluIGNhY2hlXG5cdFx0dGhpcy5fb0xhc3RTYXZlZElubmVyQXBwRGF0YS5pQ2FjaGVNaXNzKys7XG5cblx0XHRjb25zdCBmbk9uQWZ0ZXJTYXZlID0gZnVuY3Rpb24gKHNBcHBTdGF0ZUtleTogYW55KSB7XG5cdFx0XHQvLyByZXBsYWNlIGlubmVyIGFwcCBoYXNoIHdpdGggbmV3IGFwcFN0YXRlS2V5IGluIHVybFxuXHRcdFx0aWYgKCFiSW1tZWRpYXRlSGFzaFJlcGxhY2UpIHtcblx0XHRcdFx0b05hdkhhbmRsZXIucmVwbGFjZUhhc2goc0FwcFN0YXRlS2V5KTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gcmVtZW1iZXIgbGFzdCBzYXZlZCBzdGF0ZVxuXHRcdFx0b05hdkhhbmRsZXIuX29MYXN0U2F2ZWRJbm5lckFwcERhdGEub0FwcERhdGEgPSBtSW5uZXJBcHBEYXRhO1xuXHRcdFx0b05hdkhhbmRsZXIuX29MYXN0U2F2ZWRJbm5lckFwcERhdGEuc0FwcFN0YXRlS2V5ID0gc0FwcFN0YXRlS2V5O1xuXHRcdFx0b0FwcFN0YXRlUHJvbWlzZS5yZXNvbHZlKHNBcHBTdGF0ZUtleSk7XG5cdFx0fTtcblxuXHRcdGNvbnN0IGZuT25FcnJvciA9IGZ1bmN0aW9uIChvRXJyb3I6IGFueSkge1xuXHRcdFx0b0FwcFN0YXRlUHJvbWlzZS5yZWplY3Qob0Vycm9yKTtcblx0XHR9O1xuXG5cdFx0Y29uc3Qgc0FwcFN0YXRlS2V5ID0gdGhpcy5fc2F2ZUFwcFN0YXRlKG1Jbm5lckFwcERhdGEsIGZuT25BZnRlclNhdmUsIGZuT25FcnJvcik7XG5cdFx0Lypcblx0XHQgKiBOb3RlIHRoYXQgX3NhcEFwcFN0YXRlIG1heSByZXR1cm4gJ3VuZGVmaW5lZCcgaW4gY2FzZSB0aGF0IHRoZSBwYXJzaW5nIGhhcyBmYWlsZWQuIEluIHRoaXMgY2FzZSwgd2Ugc2hvdWxkIG5vdCB0cmlnZ2VyIHRoZSByZXBsYWNlbWVudFxuXHRcdCAqIG9mIHRoZSBBcHAgSGFzaCB3aXRoIHRoZSBnZW5lcmF0ZWQga2V5LCBhcyB0aGUgY29udGFpbmVyIHdhcyBub3Qgd3JpdHRlbiBiZWZvcmUuIE5vdGUgYXMgd2VsbCB0aGF0IHRoZSBlcnJvciBoYW5kbGluZyBoYXMgYWxyZWFkeVxuXHRcdCAqIGhhcHBlbmVkIGJlZm9yZSBieSBtYWtpbmcgdGhlIG9NeURlZmVycmVkIHByb21pc2UgZmFpbCAoc2VlIGZuT25FcnJvciBhYm92ZSkuXG5cdFx0ICovXG5cdFx0Ly8gaWYgKHNBcHBTdGF0ZUtleSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0Ly8gLy9yZXBsYWNlIGlubmVyIGFwcCBoYXNoIHdpdGggbmV3IGFwcFN0YXRlS2V5IGluIHVybFxuXHRcdC8vIC8vbm90ZTogd2UgZG8gbm90IHdhaXQgZm9yIHRoZSBzYXZlIHRvIGJlIGNvbXBsZXRlZDogdGhpcyBhc3luY2hyb25vdXNseSBiZWhhdmlvdXIgaXMgbmVjZXNzYXJ5IGlmXG5cdFx0Ly8gLy90aGlzIG1ldGhvZCBpcyBjYWxsZWQgZS5nLiBpbiBhIG9uTGlua1ByZXNzZWQgZXZlbnQgd2l0aCBubyBwb3NzaWJpbGl0eSB0byB3YWl0IGZvciB0aGUgcHJvbWlzZSByZXNvbHV0aW9uXG5cdFx0Ly8gaWYgKGJJbW1lZGlhdGVIYXNoUmVwbGFjZSkge1xuXHRcdC8vIGZuUmVwbGFjZUhhc2goc0FwcFN0YXRlS2V5KTtcblx0XHQvLyB9XG5cdFx0Ly8gfVxuXHRcdHJldHVybiB7XG5cdFx0XHRhcHBTdGF0ZUtleTogc0FwcFN0YXRlS2V5LFxuXHRcdFx0cHJvbWlzZTogb0FwcFN0YXRlUHJvbWlzZS5wcm9taXNlKClcblx0XHR9O1xuXHR9XG5cblx0LyoqXG5cdCAqIFByb2Nlc3NlcyBuYXZpZ2F0aW9uLXJlbGF0ZWQgdGFza3MgcmVsYXRlZCB0byBiZWZvcmVQb3BvdmVyT3BlbnMgZXZlbnQgaGFuZGxpbmcgZm9yIHRoZSBTbWFydExpbmsgY29udHJvbCBhbmQgcmV0dXJucyBhIFByb21pc2Ugb2JqZWN0LiBJblxuXHQgKiBwYXJ0aWN1bGFyLCB0aGUgZm9sbG93aW5nIHRhc2tzIGFyZSBwZXJmb3JtZWQgYmVmb3JlIHRoZSBTbWFydExpbmsgcG9wb3ZlciBjYW4gYmUgb3BlbmVkOlxuXHQgKiA8dWw+XG5cdCAqIDxsaT5JZiA8Y29kZT5tSW5uZXJBcHBEYXRhPC9jb2RlPiBpcyBwcm92aWRlZCwgdGhpcyBpbm5lciBhcHAgc3RhdGUgaXMgc2F2ZWQgZm9yIGJhY2sgbmF2aWdhdGlvbiBhdCBhIGxhdGVyIHRpbWUuPC9saT5cblx0ICogPGxpPlRoZSB0YWJsZSBldmVudCBwYXJhbWV0ZXJzIChzZW1hbnRpYyBhdHRyaWJ1dGVzKSBhbmQgdGhlIHNlbGVjdGlvbiB2YXJpYW50IGRhdGEgYXJlIGNvbWJpbmVkIGJ5IGNhbGxpbmcgdGhlIG1ldGhvZFxuXHQgKiB7QGxpbmsgIy5taXhBdHRyaWJ1dGVzQW5kU2VsZWN0aW9uVmFyaWFudCBtaXhBdHRyaWJ1dGVzQW5kU2VsZWN0aW9uVmFyaWFudH0uPC9saT5cblx0ICogPGxpPlRoZSBjb21iaW5lZCBkYXRhIGlzIHNhdmVkIGFzIHRoZSBjcm9zcyBhcHAgc3RhdGUgdG8gYmUgaGFuZGVkIG92ZXIgdG8gdGhlIHRhcmdldCBhcHAsIGFuZCB0aGUgY29ycmVzcG9uZGluZyBzYXAteGFwcC1zdGF0ZSBrZXkgaXMgc2V0XG5cdCAqIGluIHRoZSBVUkwuPC9saT5cblx0ICogPGxpPkFsbCBzaW5nbGUgc2VsZWN0aW9ucyAoXCJpbmNsdWRpbmcgZXF1YWxcIikgb2YgdGhlIGNvbWJpbmVkIHNlbGVjdGlvbiBkYXRhIGFyZSBwYXNzZWQgdG8gdGhlIFNtYXJ0TGluayBwb3BvdmVyIGFzIHNlbWFudGljIGF0dHJpYnV0ZXMuPC9saT5cblx0ICogPGxpPlRoZSBtZXRob2QgPGNvZGU+b1RhYmxlRXZlbnRQYXJhbWV0ZXJzLm9wZW4oKTwvY29kZT4gaXMgY2FsbGVkLiBOb3RlIHRoYXQgdGhpcyBkb2VzIG5vdCByZWFsbHkgb3BlbiB0aGUgcG9wb3ZlciwgYnV0IHRoZSBTbWFydExpbmtcblx0ICogY29udHJvbCBwcm9jZWVkcyB3aXRoIGZpcmluZyB0aGUgZXZlbnQgPGNvZGU+bmF2aWdhdGlvblRhcmdldHNPYnRhaW5lZDwvY29kZT4uPC9saT5cblx0ICogPC91bD4uXG5cdCAqIDxicj5cblx0ICogPGI+Tm9kZTo8L2I+IElmIHRoZSA8Y29kZT5vRXh0ZXJuYWxBcHBEYXRhPC9jb2RlPiBwYXJhbWV0ZXIgaXMgbm90IHN1cHBsaWVkLCB0aGUgZXh0ZXJuYWwgYXBwIGRhdGEgd2lsbCBiZSBjYWxjdWxhdGVkIGJhc2VkIG9uXG5cdCAqIHRoZSA8Y29kZT5tSW5uZXJBcHBEYXRhPC9jb2RlPiBkYXRhLjxicj4uXG5cdCAqXG5cdCAqIEBwYXJhbSBvVGFibGVFdmVudFBhcmFtZXRlcnMgVGhlIHBhcmFtZXRlcnMgbWFkZSBhdmFpbGFibGUgYnkgdGhlIFNtYXJ0VGFibGUgY29udHJvbCB3aGVuIHRoZSBTbWFydExpbmsgY29udHJvbCBoYXMgYmVlbiBjbGlja2VkLFxuXHQgKiAgICAgICAgYW4gaW5zdGFuY2Ugb2YgYSBQb3BPdmVyIG9iamVjdFxuXHQgKiBAcGFyYW0gc1NlbGVjdGlvblZhcmlhbnQgU3RyaW5naWZpZWQgSlNPTiBvYmplY3QgYXMgcmV0dXJuZWQsIGZvciBleGFtcGxlLCBmcm9tIGdldERhdGFTdWl0ZUZvcm1hdCgpIG9mIHRoZSBTbWFydEZpbHRlckJhciBjb250cm9sXG5cdCAqIEBwYXJhbSBtSW5uZXJBcHBEYXRhIE9iamVjdCBjb250YWluaW5nIHRoZSBjdXJyZW50IHN0YXRlIG9mIHRoZSBhcHAuIElmIHByb3ZpZGVkLCBvcGVuaW5nIHRoZSBQb3BvdmVyIGlzIGRlZmVycmVkIHVudGlsIHRoZVxuXHQgKiAgICAgICAgaW5uZXIgYXBwIGRhdGEgaXMgc2F2ZWQgaW4gYSBjb25zaXN0ZW50IHdheS5cblx0ICogQHBhcmFtIG9FeHRlcm5hbEFwcERhdGEgT2JqZWN0IGNvbnRhaW5pbmcgdGhlIHN0YXRlIHdoaWNoIHdpbGwgYmUgcGFzc2VkIHRvIHRoZSB0YXJnZXQgc2NyZWVuLlxuXHQgKiBAcGFyYW0gb0V4dGVybmFsQXBwRGF0YS5zZWxlY3Rpb25WYXJpYW50IE9iamVjdCBjb250YWluaW5nIHNlbGVjdGlvblZhcmlhbnQsIHdoaWNoIHdpbGwgYmUgcGFzc2VkIHRvIHRoZSB0YXJnZXQgc2NyZWVuLiBJZiBub3Rcblx0ICogICAgICAgIHNldCB0aGUgc1NlbGVjdGlvblZhcmlhbnQgd2lsbCBiZSB1c2VkLlxuXHQgKiBAcGFyYW0gb0V4dGVybmFsQXBwRGF0YS5wcmVzZW50YXRpb25WYXJpYW50IE9iamVjdCBjb250YWluaW5nIHRoZSBjdXJyZW50IHVpIHByZXNlbnRhdGlvblZhcmlhbnQgb2YgdGhlIGFwcCwgd2hpY2ggd2lsbCBiZVxuXHQgKiAgICAgICAgcGFzc2VkIHRvIHRoZSB0YXJnZXQgc2NyZWVuXG5cdCAqIEBwYXJhbSBvRXh0ZXJuYWxBcHBEYXRhLnZhbHVlVGV4dHMgT2JqZWN0IGNvbnRhaW5pbmcgdmFsdWUgZGVzY3JpcHRpb25zLCB3aGljaCB3aWxsIGJlIHBhc3NlZCB0byB0aGUgdGFyZ2V0IHNjcmVlblxuXHQgKiBAcmV0dXJucyBBIFByb21pc2Ugb2JqZWN0IHRvIG1vbml0b3Igd2hlbiBhbGwgYWN0aW9ucyBvZiB0aGUgZnVuY3Rpb24gaGF2ZSBiZWVuIGV4ZWN1dGVkOyBpZiB0aGUgZXhlY3V0aW9uIGlzIHN1Y2Nlc3NmdWwsIHRoZVxuXHQgKiAgICAgICAgICBtb2RpZmllZCBvVGFibGVFdmVudFBhcmFtZXRlcnMgaXMgcmV0dXJuZWQ7IGlmIGFuIGVycm9yIG9jY3VycywgYW4gZXJyb3Igb2JqZWN0IG9mIHR5cGVcblx0ICogICAgICAgICAge0BsaW5rIHNhcC5mZS5uYXZpZ2F0aW9uLk5hdkVycm9yfSBpcyByZXR1cm5lZFxuXHQgKiBAcHVibGljXG5cdCAqIEBleGFtcGxlIDxjb2RlPlxuXHQgKiBzYXAudWkuZGVmaW5lKFtcInNhcC9mZS9uYXZpZ2F0aW9uL05hdmlnYXRpb25IYW5kbGVyXCIsIFwic2FwL2ZlL25hdmlnYXRpb24vU2VsZWN0aW9uVmFyaWFudFwiXSwgZnVuY3Rpb24gKE5hdmlnYXRpb25IYW5kbGVyLCBTZWxlY3Rpb25WYXJpYW50KSB7XG5cdCAqIFx0Ly9ldmVudCBoYW5kbGVyIGZvciB0aGUgc21hcnQgbGluayBldmVudCBcImJlZm9yZVBvcG92ZXJPcGVuc1wiXG5cdCAqIFx0XHRvbkJlZm9yZVBvcG92ZXJPcGVuczogZnVuY3Rpb24ob0V2ZW50KSB7XG5cdCAqIFx0XHRcdHZhciBvVGFibGVFdmVudFBhcmFtZXRlcnMgPSBvRXZlbnQuZ2V0UGFyYW1ldGVycygpO1xuXHQgKlxuXHQgKiBcdFx0XHR2YXIgbUlubmVyQXBwRGF0YSA9IHtcblx0ICogXHRcdFx0XHRzZWxlY3Rpb25WYXJpYW50IDogb1NtYXJ0RmlsdGVyQmFyLmdldERhdGFTdWl0ZUZvcm1hdCgpLFxuXHQgKiBcdFx0XHRcdHRhYmxlVmFyaWFudElkIDogb1NtYXJ0VGFibGUuZ2V0Q3VycmVudFZhcmlhbnRJZCgpLFxuXHQgKiBcdFx0XHRcdGN1c3RvbURhdGEgOiBvTXlDdXN0b21EYXRhXG5cdCAqIFx0XHRcdH07XG5cdCAqXG5cdCAqIFx0XHRcdHZhciBvU2VsZWN0aW9uVmFyaWFudCA9IG5ldyBTZWxlY3Rpb25WYXJpYW50KCk7XG5cdCAqIFx0XHRcdG9TZWxlY3Rpb25WYXJpYW50LmFkZFNlbGVjdE9wdGlvbihcIkNvbXBhbnlDb2RlXCIsIFwiSVwiLCBcIkVRXCIsIFwiMDAwMVwiKTtcblx0ICogXHRcdFx0b1NlbGVjdGlvblZhcmlhbnQuYWRkU2VsZWN0T3B0aW9uKFwiQ3VzdG9tZXJcIiwgXCJJXCIsIFwiRVFcIiwgXCJDMDAwMVwiKTtcblx0ICogXHRcdFx0dmFyIHNTZWxlY3Rpb25WYXJpYW50PSBvU2VsZWN0aW9uVmFyaWFudC50b0pTT05TdHJpbmcoKTtcblx0ICpcblx0ICogXHRcdFx0dmFyIG9OYXZpZ2F0aW9uSGFuZGxlciA9IG5ldyBOYXZpZ2F0aW9uSGFuZGxlcihvQ29udHJvbGxlcik7XG5cdCAqIFx0XHRcdHZhciBvU21hcnRMaW5rUHJvbWlzZSA9IG9OYXZpZ2F0aW9uSGFuZGxlci5wcm9jZXNzQmVmb3JlU21hcnRMaW5rUG9wb3Zlck9wZW5zKG9UYWJsZUV2ZW50UGFyYW1ldGVycywgc1NlbGVjdGlvblZhcmlhbnQsIG1Jbm5lckFwcERhdGEpO1xuXHQgKlxuXHQgKiBcdFx0XHRvU21hcnRMaW5rUHJvbWlzZS5kb25lKGZ1bmN0aW9uKG9UYWJsZUV2ZW50UGFyYW1ldGVycyl7XG5cdCAqIFx0XHRcdFx0Ly8gaGVyZSB5b3UgY2FuIGFkZCBjb2RpbmcgdGhhdCBzaG91bGQgcnVuIGFmdGVyIGFsbCBhcHAgc3RhdGVzIGFyZSBzYXZlZCBhbmQgdGhlIHNlbWFudGljIGF0dHJpYnV0ZXMgYXJlIHNldFxuXHQgKiBcdFx0XHR9KTtcblx0ICpcblx0ICogXHRcdFx0b1NtYXJ0TGlua1Byb21pc2UuZmFpbChmdW5jdGlvbihvRXJyb3Ipe1xuXHQgKiBcdFx0XHQvL3NvbWUgZXJyb3IgaGFuZGxpbmdcblx0ICogXHRcdFx0fSk7XG5cdCAqIFx0XHR9O1xuXHQgKiBcdH0pO1xuXHQgKiA8L2NvZGU+XG5cdCAqL1xuXHRwcm9jZXNzQmVmb3JlU21hcnRMaW5rUG9wb3Zlck9wZW5zKFxuXHRcdG9UYWJsZUV2ZW50UGFyYW1ldGVyczogYW55LFxuXHRcdHNTZWxlY3Rpb25WYXJpYW50OiBzdHJpbmcsXG5cdFx0bUlubmVyQXBwRGF0YT86IElubmVyQXBwRGF0YSxcblx0XHRvRXh0ZXJuYWxBcHBEYXRhPzoge1xuXHRcdFx0c2VsZWN0aW9uVmFyaWFudD86IG9iamVjdDtcblx0XHRcdHByZXNlbnRhdGlvblZhcmlhbnQ/OiBvYmplY3Q7XG5cdFx0XHR2YWx1ZVRleHRzPzogb2JqZWN0O1xuXHRcdH1cblx0KSB7XG5cdFx0Y29uc3Qgb015RGVmZXJyZWQgPSBqUXVlcnkuRGVmZXJyZWQoKTtcblx0XHRsZXQgbVNlbWFudGljQXR0cmlidXRlczogYW55O1xuXHRcdGlmIChvVGFibGVFdmVudFBhcmFtZXRlcnMgIT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRtU2VtYW50aWNBdHRyaWJ1dGVzID0gb1RhYmxlRXZlbnRQYXJhbWV0ZXJzLnNlbWFudGljQXR0cmlidXRlcztcblx0XHR9XG5cblx0XHRsZXQgb1hBcHBEYXRhT2JqOiBhbnk7XG5cdFx0Y29uc3Qgb05hdkhhbmRsZXI6IE5hdmlnYXRpb25IYW5kbGVyID0gdGhpcztcblxuXHRcdGlmIChvRXh0ZXJuYWxBcHBEYXRhID09PSB1bmRlZmluZWQpIHtcblx0XHRcdG9YQXBwRGF0YU9iaiA9IHt9O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRvWEFwcERhdGFPYmogPSBvRXh0ZXJuYWxBcHBEYXRhO1xuXHRcdH1cblxuXHRcdGNvbnN0IGZuU3RvcmVYYXBwQW5kQ2FsbE9wZW4gPSBmdW5jdGlvbiAobVN1YlNlbWFudGljQXR0cmlidXRlczogYW55LCBzU3ViU2VsZWN0aW9uVmFyaWFudDogYW55KSB7XG5cdFx0XHQvLyBtaXggdGhlIHNlbWFudGljIGF0dHJpYnV0ZXMgKGUuZy4gZnJvbSB0aGUgcm93IGxpbmUpIHdpdGggdGhlIHNlbGVjdGlvbiB2YXJpYW50IChlLmcuIGZyb20gdGhlIGZpbHRlciBiYXIpXG5cdFx0XHRzU3ViU2VsZWN0aW9uVmFyaWFudCA9IG9YQXBwRGF0YU9iai5zZWxlY3Rpb25WYXJpYW50IHx8IHNTdWJTZWxlY3Rpb25WYXJpYW50IHx8IFwie31cIjtcblxuXHRcdFx0Y29uc3QgaVN1cHByZXNzaW9uQmVoYXZpb3IgPSBTdXBwcmVzc2lvbkJlaGF2aW9yLnJhaXNlRXJyb3JPbk51bGwgfCBTdXBwcmVzc2lvbkJlaGF2aW9yLnJhaXNlRXJyb3JPblVuZGVmaW5lZDtcblx0XHRcdC8qXG5cdFx0XHQgKiBjb21wYXRpYmxpdHk6IFVudGlsIFNBUFVJNSAxLjI4LjUgKG9yIGV2ZW4gbGF0ZXIpIHRoZSBTbWFydCBMaW5rIGluIGEgU21hcnQgVGFibGUgaXMgZmlsdGVyaW5nIGFsbCBudWxsLSBhbmQgdW5kZWZpbmVkIHZhbHVlcy5cblx0XHRcdCAqIFRoZXJlZm9yZSwgbVNlbWFudGljQXR0cmlidXRlcyBhcmUgYWxyZWFkeSByZWR1Y2VkIGFwcHJvcHJpYXRlbHkgLS0gdGhpcyBkb2VzIG5vdCBuZWVkIHRvIGJlIGRvbmUgYnlcblx0XHRcdCAqIG1peEF0dHJpYnV0ZXNBbmRTZWxlY3Rpb25WYXJpYW50IGFnYWluLiBUbyBlbnN1cmUgdGhhdCB3ZSBzdGlsbCBoYXZlIHRoZSBvbGQgYmVoYXZpb3VyIChpLmUuIGFuIE5hdkVycm9yIGlzIHJhaXNlZCBpbiBjYXNlIHRoYXRcblx0XHRcdCAqIGJlaGF2aW91ciBvZiB0aGUgU21hcnQgTGluayBjb250cm9sIGhhcyBjaGFuZ2VkKSwgdGhlIFwib2xkXCIgU3VwcHJlc3Npb24gQmVoYXZpb3VyIGlzIHJldGFpbmVkLlxuXHRcdFx0ICovXG5cblx0XHRcdGNvbnN0IG9NaXhlZFNlbFZhciA9IG9OYXZIYW5kbGVyLm1peEF0dHJpYnV0ZXNBbmRTZWxlY3Rpb25WYXJpYW50KFxuXHRcdFx0XHRtU3ViU2VtYW50aWNBdHRyaWJ1dGVzLFxuXHRcdFx0XHRzU3ViU2VsZWN0aW9uVmFyaWFudCxcblx0XHRcdFx0aVN1cHByZXNzaW9uQmVoYXZpb3Jcblx0XHRcdCk7XG5cdFx0XHRzU3ViU2VsZWN0aW9uVmFyaWFudCA9IG9NaXhlZFNlbFZhci50b0pTT05TdHJpbmcoKTtcblxuXHRcdFx0Ly8gZW5yaWNoIHRoZSBzZW1hbnRpYyBhdHRyaWJ1dGVzIHdpdGggc2luZ2xlIHNlbGVjdGlvbnMgZnJvbSB0aGUgc2VsZWN0aW9uIHZhcmlhbnRcblx0XHRcdGxldCBvVG1wRGF0YTogYW55ID0ge307XG5cdFx0XHRvVG1wRGF0YS5zZWxlY3Rpb25WYXJpYW50ID0gb01peGVkU2VsVmFyLnRvSlNPTk9iamVjdCgpO1xuXG5cdFx0XHRvVG1wRGF0YSA9IG9OYXZIYW5kbGVyLl9yZW1vdmVNZWFzdXJlQmFzZWRJbmZvcm1hdGlvbihvVG1wRGF0YSk7XG5cblx0XHRcdG9UbXBEYXRhID0gb05hdkhhbmRsZXIuX2NoZWNrSXNQb3RlbnRpYWxseVNlbnNpdGl2ZShvVG1wRGF0YSk7XG5cblx0XHRcdG1TdWJTZW1hbnRpY0F0dHJpYnV0ZXMgPSBvVG1wRGF0YS5zZWxlY3Rpb25WYXJpYW50XG5cdFx0XHRcdD8gb05hdkhhbmRsZXIuX2dldFVSTFBhcmFtZXRlcnNGcm9tU2VsZWN0aW9uVmFyaWFudChuZXcgU2VsZWN0aW9uVmFyaWFudChvVG1wRGF0YS5zZWxlY3Rpb25WYXJpYW50KSlcblx0XHRcdFx0OiB7fTtcblxuXHRcdFx0Y29uc3QgZm5PbkNvbnRhaW5lclNhdmUgPSBmdW5jdGlvbiAoc0FwcFN0YXRlS2V5OiBhbnkpIHtcblx0XHRcdFx0aWYgKG9UYWJsZUV2ZW50UGFyYW1ldGVycyA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0Ly8gSWYgb1RhYmxlRXZlbnRQYXJhbWV0ZXJzIGlzIHVuZGVmaW5lZCwgcmV0dXJuIGJvdGggc2VtYW50aWNBdHRyaWJ1dGVzIGFuZCBhcHBTdGF0ZWtleVxuXHRcdFx0XHRcdG9NeURlZmVycmVkLnJlc29sdmUobVN1YlNlbWFudGljQXR0cmlidXRlcywgc0FwcFN0YXRlS2V5KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyBzZXQgdGhlIHN0b3JlZCBkYXRhIGluIHBvcG92ZXIgYW5kIGNhbGwgb3BlbigpXG5cdFx0XHRcdFx0b1RhYmxlRXZlbnRQYXJhbWV0ZXJzLnNldFNlbWFudGljQXR0cmlidXRlcyhtU3ViU2VtYW50aWNBdHRyaWJ1dGVzKTtcblx0XHRcdFx0XHRvVGFibGVFdmVudFBhcmFtZXRlcnMuc2V0QXBwU3RhdGVLZXkoc0FwcFN0YXRlS2V5KTtcblx0XHRcdFx0XHRvVGFibGVFdmVudFBhcmFtZXRlcnMub3BlbigpOyAvLyA+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+PiBOb3RlIHRoYXQgXCJvcGVuXCIgZG9lcyBub3Qgb3BlbiB0aGUgcG9wb3ZlciwgYnV0IHByb2NlZWRzXG5cdFx0XHRcdFx0Ly8gd2l0aCBmaXJpbmcgdGhlIG9uTmF2VGFyZ2V0c09idGFpbmVkIGV2ZW50LlxuXHRcdFx0XHRcdG9NeURlZmVycmVkLnJlc29sdmUob1RhYmxlRXZlbnRQYXJhbWV0ZXJzKTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblxuXHRcdFx0Y29uc3QgZm5PbkVycm9yID0gZnVuY3Rpb24gKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdG9NeURlZmVycmVkLnJlamVjdChvRXJyb3IpO1xuXHRcdFx0fTtcblxuXHRcdFx0b1hBcHBEYXRhT2JqLnNlbGVjdGlvblZhcmlhbnQgPSBzU3ViU2VsZWN0aW9uVmFyaWFudDtcblxuXHRcdFx0b1hBcHBEYXRhT2JqID0gb05hdkhhbmRsZXIuX3JlbW92ZU1lYXN1cmVCYXNlZEluZm9ybWF0aW9uKG9YQXBwRGF0YU9iaik7XG5cblx0XHRcdG9OYXZIYW5kbGVyLl9zYXZlQXBwU3RhdGVBc3luYyhvWEFwcERhdGFPYmosIGZuT25Db250YWluZXJTYXZlLCBmbk9uRXJyb3IpO1xuXHRcdH07XG5cblx0XHRpZiAobUlubmVyQXBwRGF0YSkge1xuXHRcdFx0Y29uc3Qgb1N0b3JlSW5uZXJBcHBTdGF0ZVByb21pc2UgPSB0aGlzLnN0b3JlSW5uZXJBcHBTdGF0ZUFzeW5jKG1Jbm5lckFwcERhdGEsIHRydWUpO1xuXG5cdFx0XHQvLyBpZiB0aGUgaW5uZXIgYXBwIHN0YXRlIHdhcyBzdWNjZXNzZnVsbHkgc3RvcmVkLCBzdG9yZSBhbHNvIHRoZSB4YXBwLXN0YXRlXG5cdFx0XHRvU3RvcmVJbm5lckFwcFN0YXRlUHJvbWlzZS5kb25lKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0Zm5TdG9yZVhhcHBBbmRDYWxsT3BlbihtU2VtYW50aWNBdHRyaWJ1dGVzLCBzU2VsZWN0aW9uVmFyaWFudCk7XG5cdFx0XHR9KTtcblxuXHRcdFx0b1N0b3JlSW5uZXJBcHBTdGF0ZVByb21pc2UuZmFpbChmdW5jdGlvbiAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0b015RGVmZXJyZWQucmVqZWN0KG9FcnJvcik7XG5cdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gdGhlcmUgaXMgbm8gaW5uZXIgYXBwIHN0YXRlIHRvIHNhdmUsIGp1c3QgcHV0IHRoZSBwYXJhbWV0ZXJzIGludG8geGFwcC1zdGF0ZVxuXHRcdFx0Zm5TdG9yZVhhcHBBbmRDYWxsT3BlbihtU2VtYW50aWNBdHRyaWJ1dGVzLCBzU2VsZWN0aW9uVmFyaWFudCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG9NeURlZmVycmVkLnByb21pc2UoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBQcm9jZXNzZXMgc2VsZWN0aW9uVmFyaWFudCBzdHJpbmcgYW5kIHJldHVybnMgYSBQcm9taXNlIG9iamVjdCAoc2VtYW50aWNBdHRyaWJ1dGVzIGFuZCBBcHBTdGF0ZUtleSkuXG5cdCAqXG5cdCAqIEBwYXJhbSBzU2VsZWN0aW9uVmFyaWFudCBTdHJpbmdpZmllZCBKU09OIG9iamVjdFxuXHQgKiBAcmV0dXJucyBBIFByb21pc2Ugb2JqZWN0IHRvIG1vbml0b3Igd2hlbiBhbGwgYWN0aW9ucyBvZiB0aGUgZnVuY3Rpb24gaGF2ZSBiZWVuIGV4ZWN1dGVkOyBpZiB0aGUgZXhlY3V0aW9uIGlzIHN1Y2Nlc3NmdWwsIHRoZVxuXHQgKiAgICAgICAgICBzZW1hbnRpY0F0dHJpYnV0ZXMgYXMgd2VsbCBhcyB0aGUgYXBwU3RhdGVLZXkgYXJlIHJldHVybmVkOyBpZiBhbiBlcnJvciBvY2N1cnMsIGFuIGVycm9yIG9iamVjdCBvZiB0eXBlXG5cdCAqICAgICAgICAgIHtAbGluayBzYXAuZmUubmF2aWdhdGlvbi5OYXZFcnJvcn0gaXMgcmV0dXJuZWRcblx0ICogPGJyPlxuXHQgKiBAZXhhbXBsZSA8Y29kZT5cblx0ICogc2FwLnVpLmRlZmluZShbXCJzYXAvZmUvbmF2aWdhdGlvbi9OYXZpZ2F0aW9uSGFuZGxlclwiLCBcInNhcC9mZS9uYXZpZ2F0aW9uL1NlbGVjdGlvblZhcmlhbnRcIl0sIGZ1bmN0aW9uIChOYXZpZ2F0aW9uSGFuZGxlciwgU2VsZWN0aW9uVmFyaWFudCkge1xuXHQgKiBcdFx0dmFyIG9TZWxlY3Rpb25WYXJpYW50ID0gbmV3IFNlbGVjdGlvblZhcmlhbnQoKTtcblx0ICogXHRcdG9TZWxlY3Rpb25WYXJpYW50LmFkZFNlbGVjdE9wdGlvbihcIkNvbXBhbnlDb2RlXCIsIFwiSVwiLCBcIkVRXCIsIFwiMDAwMVwiKTtcblx0ICogXHRcdG9TZWxlY3Rpb25WYXJpYW50LmFkZFNlbGVjdE9wdGlvbihcIkN1c3RvbWVyXCIsIFwiSVwiLCBcIkVRXCIsIFwiQzAwMDFcIik7XG5cdCAqIFx0XHR2YXIgc1NlbGVjdGlvblZhcmlhbnQ9IG9TZWxlY3Rpb25WYXJpYW50LnRvSlNPTlN0cmluZygpO1xuXHQgKlxuXHQgKiBcdFx0dmFyIG9OYXZpZ2F0aW9uSGFuZGxlciA9IG5ldyBOYXZpZ2F0aW9uSGFuZGxlcihvQ29udHJvbGxlcik7XG5cdCAqIFx0XHR2YXIgb1Byb21pc2VPYmplY3QgPSBvTmF2aWdhdGlvbkhhbmRsZXIuX2dldEFwcFN0YXRlS2V5QW5kVXJsUGFyYW1ldGVycyhzU2VsZWN0aW9uVmFyaWFudCk7XG5cdCAqXG5cdCAqIFx0XHRvUHJvbWlzZU9iamVjdC5kb25lKGZ1bmN0aW9uKG9TZW1hbnRpY0F0dHJpYnV0ZXMsIHNBcHBTdGF0ZUtleSl7XG5cdCAqIFx0XHRcdC8vIGhlcmUgeW91IGNhbiBhZGQgY29kaW5nIHRoYXQgc2hvdWxkIHJ1biBhZnRlciBhbGwgYXBwIHN0YXRlIGFuZCB0aGUgc2VtYW50aWMgYXR0cmlidXRlcyBoYXZlIGJlZW4gcmV0dXJuZWQuXG5cdCAqIFx0XHR9KTtcblx0ICpcblx0ICogXHRcdG9Qcm9taXNlT2JqZWN0LmZhaWwoZnVuY3Rpb24ob0Vycm9yKXtcblx0ICogXHRcdFx0Ly9zb21lIGVycm9yIGhhbmRsaW5nXG5cdCAqIFx0XHR9KTtcblx0ICpcdH0pO1xuXHQgKiA8L2NvZGU+XG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKi9cblx0X2dldEFwcFN0YXRlS2V5QW5kVXJsUGFyYW1ldGVycyhzU2VsZWN0aW9uVmFyaWFudDogc3RyaW5nKSB7XG5cdFx0cmV0dXJuIHRoaXMucHJvY2Vzc0JlZm9yZVNtYXJ0TGlua1BvcG92ZXJPcGVucyh1bmRlZmluZWQsIHNTZWxlY3Rpb25WYXJpYW50LCB1bmRlZmluZWQsIHVuZGVmaW5lZCk7XG5cdH1cblxuXHRfbWl4QXR0cmlidXRlc1RvU2VsVmFyaWFudChtU2VtYW50aWNBdHRyaWJ1dGVzOiBhbnksIG9TZWxWYXJpYW50OiBhbnksIGlTdXBwcmVzc2lvbkJlaGF2aW9yOiBhbnkpIHtcblx0XHQvLyBhZGQgYWxsIHNlbWFudGljIGF0dHJpYnV0ZXMgdG8gdGhlIG1peGVkIHNlbGVjdGlvbiB2YXJpYW50XG5cdFx0Zm9yIChjb25zdCBzUHJvcGVydHlOYW1lIGluIG1TZW1hbnRpY0F0dHJpYnV0ZXMpIHtcblx0XHRcdGlmIChtU2VtYW50aWNBdHRyaWJ1dGVzLmhhc093blByb3BlcnR5KHNQcm9wZXJ0eU5hbWUpKSB7XG5cdFx0XHRcdC8vIEEgdmFsdWUgb2YgYSBzZW1hbnRpYyBhdHRyaWJ1dGUgbWF5IG5vdCBiZSBhIHN0cmluZywgYnV0IGNhbiBiZSBlLmcuIGEgZGF0ZS5cblx0XHRcdFx0Ly8gU2luY2UgdGhlIHNlbGVjdGlvbiB2YXJpYW50IGFjY2VwdHMgb25seSBhIHN0cmluZywgd2UgaGF2ZSB0byBjb252ZXJ0IGl0IGluIGRlcGVuZGVuY2Ugb2YgdGhlIHR5cGUuXG5cdFx0XHRcdGxldCB2U2VtYW50aWNBdHRyaWJ1dGVWYWx1ZSA9IG1TZW1hbnRpY0F0dHJpYnV0ZXNbc1Byb3BlcnR5TmFtZV07XG5cdFx0XHRcdGlmICh2U2VtYW50aWNBdHRyaWJ1dGVWYWx1ZSBpbnN0YW5jZW9mIERhdGUpIHtcblx0XHRcdFx0XHQvLyB1c2UgdGhlIHNhbWUgY29udmVyc2lvbiBtZXRob2QgZm9yIGRhdGVzIGFzIHRoZSBTbWFydEZpbHRlckJhcjogdG9KU09OKClcblx0XHRcdFx0XHR2U2VtYW50aWNBdHRyaWJ1dGVWYWx1ZSA9IHZTZW1hbnRpY0F0dHJpYnV0ZVZhbHVlLnRvSlNPTigpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKFxuXHRcdFx0XHRcdEFycmF5LmlzQXJyYXkodlNlbWFudGljQXR0cmlidXRlVmFsdWUpIHx8XG5cdFx0XHRcdFx0KHZTZW1hbnRpY0F0dHJpYnV0ZVZhbHVlICYmIHR5cGVvZiB2U2VtYW50aWNBdHRyaWJ1dGVWYWx1ZSA9PT0gXCJvYmplY3RcIilcblx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0dlNlbWFudGljQXR0cmlidXRlVmFsdWUgPSBKU09OLnN0cmluZ2lmeSh2U2VtYW50aWNBdHRyaWJ1dGVWYWx1ZSk7XG5cdFx0XHRcdH0gZWxzZSBpZiAodHlwZW9mIHZTZW1hbnRpY0F0dHJpYnV0ZVZhbHVlID09PSBcIm51bWJlclwiIHx8IHR5cGVvZiB2U2VtYW50aWNBdHRyaWJ1dGVWYWx1ZSA9PT0gXCJib29sZWFuXCIpIHtcblx0XHRcdFx0XHR2U2VtYW50aWNBdHRyaWJ1dGVWYWx1ZSA9IHZTZW1hbnRpY0F0dHJpYnV0ZVZhbHVlLnRvU3RyaW5nKCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAodlNlbWFudGljQXR0cmlidXRlVmFsdWUgPT09IFwiXCIpIHtcblx0XHRcdFx0XHRpZiAoaVN1cHByZXNzaW9uQmVoYXZpb3IgJiBTdXBwcmVzc2lvbkJlaGF2aW9yLmlnbm9yZUVtcHR5U3RyaW5nKSB7XG5cdFx0XHRcdFx0XHRMb2cuaW5mbyhcblx0XHRcdFx0XHRcdFx0XCJTZW1hbnRpYyBhdHRyaWJ1dGUgXCIgK1xuXHRcdFx0XHRcdFx0XHRcdHNQcm9wZXJ0eU5hbWUgK1xuXHRcdFx0XHRcdFx0XHRcdFwiIGlzIGFuIGVtcHR5IHN0cmluZyBhbmQgZHVlIHRvIHRoZSBjaG9zZW4gU3VwcHJlc3Npb24gQmVoaWF2b3VyIGlzIGJlaW5nIGlnbm9yZWQuXCJcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAodlNlbWFudGljQXR0cmlidXRlVmFsdWUgPT09IG51bGwpIHtcblx0XHRcdFx0XHRpZiAoaVN1cHByZXNzaW9uQmVoYXZpb3IgJiBTdXBwcmVzc2lvbkJlaGF2aW9yLnJhaXNlRXJyb3JPbk51bGwpIHtcblx0XHRcdFx0XHRcdHRocm93IG5ldyBOYXZFcnJvcihcIk5hdmlnYXRpb25IYW5kbGVyLklOVkFMSURfSU5QVVRcIik7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdExvZy53YXJuaW5nKFwiU2VtYW50aWMgYXR0cmlidXRlIFwiICsgc1Byb3BlcnR5TmFtZSArIFwiIGlzIG51bGwgYW5kIGlnbm9yZWQgZm9yIG1peCBpbiB0byBzZWxlY3Rpb24gdmFyaWFudFwiKTtcblx0XHRcdFx0XHRcdGNvbnRpbnVlOyAvLyBpZ25vcmUhXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKHZTZW1hbnRpY0F0dHJpYnV0ZVZhbHVlID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRpZiAoaVN1cHByZXNzaW9uQmVoYXZpb3IgJiBTdXBwcmVzc2lvbkJlaGF2aW9yLnJhaXNlRXJyb3JPblVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IE5hdkVycm9yKFwiTmF2aWdhdGlvbkhhbmRsZXIuSU5WQUxJRF9JTlBVVFwiKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0TG9nLndhcm5pbmcoXCJTZW1hbnRpYyBhdHRyaWJ1dGUgXCIgKyBzUHJvcGVydHlOYW1lICsgXCIgaXMgdW5kZWZpbmVkIGFuZCBpZ25vcmVkIGZvciBtaXggaW4gdG8gc2VsZWN0aW9uIHZhcmlhbnRcIik7XG5cdFx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAodHlwZW9mIHZTZW1hbnRpY0F0dHJpYnV0ZVZhbHVlID09PSBcInN0cmluZ1wiIHx8IHZTZW1hbnRpY0F0dHJpYnV0ZVZhbHVlIGluc3RhbmNlb2YgU3RyaW5nKSB7XG5cdFx0XHRcdFx0b1NlbFZhcmlhbnQuYWRkU2VsZWN0T3B0aW9uKHNQcm9wZXJ0eU5hbWUsIFwiSVwiLCBcIkVRXCIsIHZTZW1hbnRpY0F0dHJpYnV0ZVZhbHVlKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgTmF2RXJyb3IoXCJOYXZpZ2F0aW9uSGFuZGxlci5JTlZBTElEX0lOUFVUXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBvU2VsVmFyaWFudDtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb21iaW5lcyB0aGUgZ2l2ZW4gcGFyYW1ldGVycyBhbmQgc2VsZWN0aW9uIHZhcmlhbnQgaW50byBhIG5ldyBzZWxlY3Rpb24gdmFyaWFudCBjb250YWluaW5nIHByb3BlcnRpZXMgZnJvbSBib3RoLCB3aXRoIHRoZSBwYXJhbWV0ZXJzXG5cdCAqIG92ZXJyaWRpbmcgZXhpc3RpbmcgcHJvcGVydGllcyBpbiB0aGUgc2VsZWN0aW9uIHZhcmlhbnQuIFRoZSBuZXcgc2VsZWN0aW9uIHZhcmlhbnQgZG9lcyBub3QgY29udGFpbiBhbnkgcGFyYW1ldGVycy4gQWxsIHBhcmFtZXRlcnMgYXJlXG5cdCAqIG1lcmdlZCBpbnRvIHNlbGVjdCBvcHRpb25zLiBUaGUgb3V0cHV0IG9mIHRoaXMgZnVuY3Rpb24sIGNvbnZlcnRlZCB0byBhIEpTT04gc3RyaW5nLCBjYW4gYmUgdXNlZCBmb3IgdGhlXG5cdCAqIHtAbGluayAjLm5hdmlnYXRlIE5hdmlnYXRpb25IYW5kbGVyLm5hdmlnYXRlfSBtZXRob2QuXG5cdCAqXG5cdCAqIEBwYXJhbSB2U2VtYW50aWNBdHRyaWJ1dGVzIE9iamVjdC8oQXJyYXkgb2YgT2JqZWN0cykgY29udGFpbmluZyBrZXkvdmFsdWUgcGFpcnNcblx0ICogQHBhcmFtIHNTZWxlY3Rpb25WYXJpYW50IFRoZSBzZWxlY3Rpb24gdmFyaWFudCBpbiBzdHJpbmcgZm9ybWF0IGFzIHByb3ZpZGVkIGJ5IHRoZSBTbWFydEZpbHRlckJhciBjb250cm9sXG5cdCAqIEBwYXJhbSBbaVN1cHByZXNzaW9uQmVoYXZpb3I9c2FwLmZlLm5hdmlnYXRpb24uU3VwcHJlc3Npb25CZWhhdmlvci5zdGFuZGFyZF0gSW5kaWNhdGVzIHdoZXRoZXIgc2VtYW50aWNcblx0ICogICAgICAgIGF0dHJpYnV0ZXMgd2l0aCBzcGVjaWFsIHZhbHVlcyAoc2VlIHtAbGluayBzYXAuZmUubmF2aWdhdGlvbi5TdXBwcmVzc2lvbkJlaGF2aW9yIHN1cHByZXNzaW9uIGJlaGF2aW9yfSkgbXVzdCBiZVxuXHQgKiAgICAgICAgc3VwcHJlc3NlZCBiZWZvcmUgdGhleSBhcmUgY29tYmluZWQgd2l0aCB0aGUgc2VsZWN0aW9uIHZhcmlhbnQ7IHNldmVyYWxcblx0ICogICAgICAgIHtAbGluayBzYXAuZmUubmF2aWdhdGlvbi5TdXBwcmVzc2lvbkJlaGF2aW9yIHN1cHByZXNzaW9uIGJlaGF2aW9yc30gY2FuIGJlIGNvbWJpbmVkIHdpdGggdGhlIGJpdHdpc2UgT1Igb3BlcmF0b3Jcblx0ICogICAgICAgICh8KVxuXHQgKiBAcmV0dXJucyBJbnN0YW5jZSBvZiB7QGxpbmsgc2FwLmZlLm5hdmlnYXRpb24uU2VsZWN0aW9uVmFyaWFudH1cblx0ICogQHB1YmxpY1xuXHQgKiBAZXhhbXBsZSA8Y29kZT5cblx0ICogc2FwLnVpLmRlZmluZShbXCJzYXAvZmUvbmF2aWdhdGlvbi9OYXZpZ2F0aW9uSGFuZGxlclwiLCBcInNhcC9mZS9uYXZpZ2F0aW9uL1NlbGVjdGlvblZhcmlhbnRcIl0sIGZ1bmN0aW9uIChOYXZpZ2F0aW9uSGFuZGxlciwgU2VsZWN0aW9uVmFyaWFudCkge1xuXHQgKiBcdHZhciB2U2VtYW50aWNBdHRyaWJ1dGVzID0geyBcIkN1c3RvbWVyXCIgOiBcIkMwMDAxXCIgfTtcblx0ICogXHRvclxuXHQgKiBcdHZhciB2U2VtYW50aWNBdHRyaWJ1dGVzID0gW3sgXCJDdXN0b21lclwiIDogXCJDMDAwMVwiIH0seyBcIkN1c3RvbWVyXCIgOiBcIkMwMDAyXCIgfV07XG5cdCAqIFx0dmFyIHNTZWxlY3Rpb25WYXJpYW50ID0gb1NtYXJ0RmlsdGVyQmFyLmdldERhdGFTdWl0ZUZvcm1hdCgpO1xuXHQgKiBcdHZhciBvTmF2aWdhdGlvbkhhbmRsZXIgPSBuZXcgTmF2aWdhdGlvbkhhbmRsZXIob0NvbnRyb2xsZXIpO1xuXHQgKiBcdHZhciBzTmF2aWdhdGlvblNlbGVjdGlvblZhcmlhbnQgPSBvTmF2aWdhdGlvbkhhbmRsZXIubWl4QXR0cmlidXRlc0FuZFNlbGVjdGlvblZhcmlhbnQodlNlbWFudGljQXR0cmlidXRlcywgc1NlbGVjdGlvblZhcmlhbnQpLnRvSlNPTlN0cmluZygpO1xuXHQgKiBcdC8vIEluIGNhc2Ugb2YgYW4gdlNlbWFudGljQXR0cmlidXRlcyBiZWluZyBhbiBhcnJheSwgdGhlIHNlbWFudGljQXR0cmlidXRlcyBhcmUgbWVyZ2VkIHRvIGEgc2luZ2xlIFNWIGFuZCBjb21wYXJlZCBhZ2FpbnN0IHRoZSBzU2VsZWN0aW9uVmFyaWFudChzZWNvbmQgYWdydW1lbnQpLlxuXHQgKiBcdC8vIE9wdGlvbmFsbHksIHlvdSBjYW4gc3BlY2lmeSBvbmUgb3Igc2V2ZXJhbCBzdXBwcmVzc2lvbiBiZWhhdmlvcnMuIFNldmVyYWwgc3VwcHJlc3Npb24gYmVoYXZpb3JzIGFyZSBjb21iaW5lZCB3aXRoIHRoZSBiaXR3aXNlIE9SIG9wZXJhdG9yLCBlLmcuXG5cdCAqIFx0Ly8gdmFyIGlTdXBwcmVzc2lvbkJlaGF2aW9yID0gc2FwLmZlLm5hdmlnYXRpb24uU3VwcHJlc3Npb25CZWhhdmlvci5yYWlzZUVycm9yT25OdWxsIHwgc2FwLmZlLm5hdmlnYXRpb24uU3VwcHJlc3Npb25CZWhhdmlvci5yYWlzZUVycm9yT25VbmRlZmluZWQ7XG5cdCAqIFx0Ly8gdmFyIHNOYXZpZ2F0aW9uU2VsZWN0aW9uVmFyaWFudCA9IG9OYXZpZ2F0aW9uSGFuZGxlci5taXhBdHRyaWJ1dGVzQW5kU2VsZWN0aW9uVmFyaWFudChtU2VtYW50aWNBdHRyaWJ1dGVzLCBzU2VsZWN0aW9uVmFyaWFudCwgaVN1cHByZXNzaW9uQmVoYXZpb3IpLnRvSlNPTlN0cmluZygpO1xuXHQgKlxuXHQgKiBcdG9OYXZpZ2F0aW9uSGFuZGxlci5uYXZpZ2F0ZShcIlNhbGVzT3JkZXJcIiwgXCJjcmVhdGVcIiwgc05hdmlnYXRpb25TZWxlY3Rpb25WYXJpYW50KTtcblx0ICogfSk7XG5cdCAqIDwvY29kZT5cblx0ICovXG5cdG1peEF0dHJpYnV0ZXNBbmRTZWxlY3Rpb25WYXJpYW50KFxuXHRcdHZTZW1hbnRpY0F0dHJpYnV0ZXM6IG9iamVjdCB8IGFueVtdLFxuXHRcdHNTZWxlY3Rpb25WYXJpYW50OiBzdHJpbmcgfCBTZXJpYWxpemVkU2VsZWN0aW9uVmFyaWFudCxcblx0XHRpU3VwcHJlc3Npb25CZWhhdmlvcj86IG51bWJlclxuXHQpOiBTZWxlY3Rpb25WYXJpYW50IHtcblx0XHRjb25zdCBvU2VsZWN0aW9uVmFyaWFudCA9IG5ldyBTZWxlY3Rpb25WYXJpYW50KHNTZWxlY3Rpb25WYXJpYW50KTtcblx0XHRjb25zdCBvTmV3U2VsVmFyaWFudCA9IG5ldyBTZWxlY3Rpb25WYXJpYW50KCk7XG5cdFx0Y29uc3Qgb05hdkhhbmRsZXIgPSB0aGlzO1xuXG5cdFx0Y29uc3QgZmlsdGVyVXJsID0gb1NlbGVjdGlvblZhcmlhbnQuZ2V0RmlsdGVyQ29udGV4dFVybCgpO1xuXHRcdGlmIChmaWx0ZXJVcmwpIHtcblx0XHRcdG9OZXdTZWxWYXJpYW50LnNldEZpbHRlckNvbnRleHRVcmwoZmlsdGVyVXJsKTtcblx0XHR9XG5cblx0XHRjb25zdCBjb250ZXh0VXJsID0gb1NlbGVjdGlvblZhcmlhbnQuZ2V0UGFyYW1ldGVyQ29udGV4dFVybCgpO1xuXHRcdGlmIChjb250ZXh0VXJsKSB7XG5cdFx0XHRvTmV3U2VsVmFyaWFudC5zZXRQYXJhbWV0ZXJDb250ZXh0VXJsKGNvbnRleHRVcmwpO1xuXHRcdH1cblx0XHRpZiAoQXJyYXkuaXNBcnJheSh2U2VtYW50aWNBdHRyaWJ1dGVzKSkge1xuXHRcdFx0dlNlbWFudGljQXR0cmlidXRlcy5mb3JFYWNoKGZ1bmN0aW9uIChtU2VtYW50aWNBdHRyaWJ1dGVzOiBhbnkpIHtcblx0XHRcdFx0b05hdkhhbmRsZXIuX21peEF0dHJpYnV0ZXNUb1NlbFZhcmlhbnQobVNlbWFudGljQXR0cmlidXRlcywgb05ld1NlbFZhcmlhbnQsIGlTdXBwcmVzc2lvbkJlaGF2aW9yKTtcblx0XHRcdH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLl9taXhBdHRyaWJ1dGVzVG9TZWxWYXJpYW50KHZTZW1hbnRpY0F0dHJpYnV0ZXMsIG9OZXdTZWxWYXJpYW50LCBpU3VwcHJlc3Npb25CZWhhdmlvcik7XG5cdFx0fVxuXG5cdFx0Ly8gYWRkIHBhcmFtZXRlcnMgdGhhdCBhcmUgbm90IHBhcnQgb2YgdGhlIG9OZXdTZWxWYXJpYW50IHlldFxuXHRcdGNvbnN0IGFQYXJhbWV0ZXJzID0gb1NlbGVjdGlvblZhcmlhbnQuZ2V0UGFyYW1ldGVyTmFtZXMoKTtcblx0XHRsZXQgaTtcblx0XHRmb3IgKGkgPSAwOyBpIDwgYVBhcmFtZXRlcnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGlmICghb05ld1NlbFZhcmlhbnQuZ2V0U2VsZWN0T3B0aW9uKGFQYXJhbWV0ZXJzW2ldKSkge1xuXHRcdFx0XHRvTmV3U2VsVmFyaWFudC5hZGRTZWxlY3RPcHRpb24oYVBhcmFtZXRlcnNbaV0sIFwiSVwiLCBcIkVRXCIsIG9TZWxlY3Rpb25WYXJpYW50LmdldFBhcmFtZXRlcihhUGFyYW1ldGVyc1tpXSkpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIGFkZCBzZWxPcHRpb25zIHRoYXQgYXJlIG5vdCBwYXJ0IG9mIHRoZSBvTmV3U2VsVmFyaWFudCB5ZXRcblx0XHRjb25zdCBhU2VsT3B0aW9uTmFtZXMgPSBvU2VsZWN0aW9uVmFyaWFudC5nZXRTZWxlY3RPcHRpb25zUHJvcGVydHlOYW1lcygpO1xuXHRcdGZvciAoaSA9IDA7IGkgPCBhU2VsT3B0aW9uTmFtZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdC8vIGFkZCBzZWxPcHRpb25zIHRoYXQgYXJlIG5vdCBwYXJ0IG9mIHRoZSBvTmV3U2VsVmFyaWFudCB5ZXRcblx0XHRcdGNvbnN0IGFTZWxlY3RPcHRpb246IGFueVtdID0gb1NlbGVjdGlvblZhcmlhbnQuZ2V0U2VsZWN0T3B0aW9uKGFTZWxPcHRpb25OYW1lc1tpXSkhO1xuXHRcdFx0aWYgKCFvTmV3U2VsVmFyaWFudC5nZXRTZWxlY3RPcHRpb24oYVNlbE9wdGlvbk5hbWVzW2ldKSkge1xuXHRcdFx0XHRmb3IgKGxldCBqID0gMDsgaiA8IGFTZWxlY3RPcHRpb24ubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0XHRvTmV3U2VsVmFyaWFudC5hZGRTZWxlY3RPcHRpb24oXG5cdFx0XHRcdFx0XHRhU2VsT3B0aW9uTmFtZXNbaV0sXG5cdFx0XHRcdFx0XHRhU2VsZWN0T3B0aW9uW2pdLlNpZ24sXG5cdFx0XHRcdFx0XHRhU2VsZWN0T3B0aW9uW2pdLk9wdGlvbixcblx0XHRcdFx0XHRcdGFTZWxlY3RPcHRpb25bal0uTG93LFxuXHRcdFx0XHRcdFx0YVNlbGVjdE9wdGlvbltqXS5IaWdoXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBvTmV3U2VsVmFyaWFudDtcblx0fVxuXG5cdF9lbnN1cmVTZWxlY3Rpb25WYXJpYW50Rm9ybWF0U3RyaW5nKHZTZWxlY3Rpb25WYXJpYW50OiBhbnkpIHtcblx0XHQvKlxuXHRcdCAqIFRoZXJlIGFyZSBsZWdhY3kgQXBwU3RhdGVzIHdoZXJlIHRoZSBTZWxlY3Rpb25WYXJpYW50IGlzIGJlaW5nIHN0b3JlZCBhcyBhIHN0cmluZy4gSG93ZXZlciwgdGhhdCBpcyBub3QgY29tcGxpYW50IHRvIHRoZSBzcGVjaWZpY2F0aW9uLFxuXHRcdCAqIHdoaWNoIHN0YXRlcyB0aGF0IGEgc3RhbmRhcmQgSlMgb2JqZWN0IHNoYWxsIGJlIHByb3ZpZGVkLiBJbnRlcm5hbGx5LCBob3dldmVyLCB0aGUgc2VsZWN0aW9uVmFyaWFudCBpcyBhbHdheXMgb2YgdHlwZSBzdHJpbmcuIFNpdHVhdGlvblxuXHRcdCAqIFBlcnNpc3RlbmN5IGludGVybmFsIEFQSSAtLS0tLS0tLS0tLS0tLS0tIC0tLS0tLS0tLS0tLS0tLS0tLSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0gbGVnYWN5IHN0cmluZyBzdHJpbmcgbmV3IGFwcHJvYWNoIChKU09OKSBvYmplY3Rcblx0XHQgKiBzdHJpbmdcblx0XHQgKi9cblxuXHRcdGlmICh2U2VsZWN0aW9uVmFyaWFudCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblxuXHRcdGxldCB2Q29udmVydGVkU2VsZWN0aW9uVmFyaWFudCA9IHZTZWxlY3Rpb25WYXJpYW50O1xuXG5cdFx0aWYgKHR5cGVvZiB2U2VsZWN0aW9uVmFyaWFudCA9PT0gXCJvYmplY3RcIikge1xuXHRcdFx0dkNvbnZlcnRlZFNlbGVjdGlvblZhcmlhbnQgPSBKU09OLnN0cmluZ2lmeSh2U2VsZWN0aW9uVmFyaWFudCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHZDb252ZXJ0ZWRTZWxlY3Rpb25WYXJpYW50O1xuXHR9XG5cdF9mbkhhbmRsZUFwcFN0YXRlUHJvbWlzZShvUmV0dXJuOiBhbnksIGZuT25BZnRlclNhdmU6IGFueSwgZm5PbkVycm9yOiBhbnkpIHtcblx0XHRvUmV0dXJuLnByb21pc2UuZG9uZShmdW5jdGlvbiAoKSB7XG5cdFx0XHRpZiAoZm5PbkFmdGVyU2F2ZSkge1xuXHRcdFx0XHRmbk9uQWZ0ZXJTYXZlKG9SZXR1cm4uYXBwU3RhdGVLZXkpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0aWYgKGZuT25FcnJvcikge1xuXHRcdFx0Y29uc3Qgb05hdkhhbmRsZXIgPSB0aGlzO1xuXHRcdFx0b1JldHVybi5wcm9taXNlLmZhaWwoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRjb25zdCBvRXJyb3IgPSBvTmF2SGFuZGxlci5fY3JlYXRlVGVjaG5pY2FsRXJyb3IoXCJOYXZpZ2F0aW9uSGFuZGxlci5BcHBTdGF0ZVNhdmUuZmFpbGVkXCIpO1xuXHRcdFx0XHRmbk9uRXJyb3Iob0Vycm9yKTtcblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXHRfc2F2ZUFwcFN0YXRlQXN5bmMob0FwcERhdGE6IGFueSwgZm5PbkFmdGVyU2F2ZTogYW55LCBmbk9uRXJyb3I6IGFueSkge1xuXHRcdGNvbnN0IG9OYXZIYW5kbGVyID0gdGhpcztcblx0XHRyZXR1cm4gdGhpcy5fZm5TYXZlQXBwU3RhdGVBc3luYyhvQXBwRGF0YSwgZm5PbkVycm9yKS50aGVuKGZ1bmN0aW9uIChvUmV0dXJuOiBhbnkpIHtcblx0XHRcdGlmIChvUmV0dXJuKSB7XG5cdFx0XHRcdG9OYXZIYW5kbGVyLl9mbkhhbmRsZUFwcFN0YXRlUHJvbWlzZShvUmV0dXJuLCBmbk9uQWZ0ZXJTYXZlLCBmbk9uRXJyb3IpO1xuXHRcdFx0XHRyZXR1cm4gb1JldHVybi5hcHBTdGF0ZUtleTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9KTtcblx0fVxuXHRfc2F2ZUFwcFN0YXRlKG9BcHBEYXRhOiBhbnksIGZuT25BZnRlclNhdmU6IGFueSwgZm5PbkVycm9yOiBhbnkpIHtcblx0XHRjb25zdCBvUmV0dXJuID0gdGhpcy5fc2F2ZUFwcFN0YXRlV2l0aEltbWVkaWF0ZVJldHVybihvQXBwRGF0YSwgZm5PbkVycm9yKTtcblx0XHRpZiAob1JldHVybikge1xuXHRcdFx0dGhpcy5fZm5IYW5kbGVBcHBTdGF0ZVByb21pc2Uob1JldHVybiwgZm5PbkFmdGVyU2F2ZSwgZm5PbkVycm9yKTtcblx0XHRcdHJldHVybiBvUmV0dXJuLmFwcFN0YXRlS2V5O1xuXHRcdH1cblxuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cblxuXHRfZm5TYXZlQXBwU3RhdGVXaXRoSW1tZWRpYXRlUmV0dXJuKG9BcHBEYXRhOiBhbnksIG9BcHBTdGF0ZTogYW55LCBmbk9uRXJyb3I6IGFueSkge1xuXHRcdGNvbnN0IHNBcHBTdGF0ZUtleSA9IG9BcHBTdGF0ZS5nZXRLZXkoKTtcblx0XHRjb25zdCBvQXBwRGF0YUZvclNhdmUgPSB0aGlzLl9mZXRjaEFwcERhdGFGb3JTYXZlKG9BcHBEYXRhLCBmbk9uRXJyb3IpO1xuXHRcdGlmICghb0FwcERhdGFGb3JTYXZlKSB7XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblx0XHRvQXBwU3RhdGUuc2V0RGF0YShvQXBwRGF0YUZvclNhdmUpO1xuXHRcdGNvbnN0IG9TYXZlUHJvbWlzZSA9IG9BcHBTdGF0ZS5zYXZlKCk7XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0YXBwU3RhdGVLZXk6IHNBcHBTdGF0ZUtleSxcblx0XHRcdHByb21pc2U6IG9TYXZlUHJvbWlzZS5wcm9taXNlKClcblx0XHR9O1xuXHR9XG5cblx0X2ZldGNoQXBwRGF0YUZvclNhdmUob0FwcERhdGE6IElubmVyQXBwRGF0YSwgZm5PbkVycm9yOiBhbnkpIHtcblx0XHRsZXQgb0FwcERhdGFGb3JTYXZlOiBQYXJ0aWFsPElubmVyQXBwRGF0YT4gPSB7fTtcblxuXHRcdGlmIChvQXBwRGF0YS5oYXNPd25Qcm9wZXJ0eShcInNlbGVjdGlvblZhcmlhbnRcIikpIHtcblx0XHRcdG9BcHBEYXRhRm9yU2F2ZS5zZWxlY3Rpb25WYXJpYW50ID0gb0FwcERhdGEuc2VsZWN0aW9uVmFyaWFudDtcblxuXHRcdFx0aWYgKG9BcHBEYXRhLnNlbGVjdGlvblZhcmlhbnQpIHtcblx0XHRcdFx0Lypcblx0XHRcdFx0ICogVGhlIHNwZWNpZmljYXRpb24gc3RhdGVzIHRoYXQgU2VsZWN0aW9uIFZhcmlhbnRzIG5lZWQgdG8gYmUgSlNPTiBvYmplY3RzLiBIb3dldmVyLCBpbnRlcm5hbGx5LCB3ZSB3b3JrIHdpdGggc3RyaW5ncyBmb3Jcblx0XHRcdFx0ICogXCJzZWxlY3Rpb25WYXJpYW50XCIuIFRoZXJlZm9yZSwgaW4gY2FzZSB0aGF0IHRoaXMgaXMgYSBzdHJpbmcsIHdlIG5lZWQgdG8gSlNPTi1wYXJzZSB0aGUgZGF0YS5cblx0XHRcdFx0ICovXG5cdFx0XHRcdGlmICh0eXBlb2Ygb0FwcERhdGEuc2VsZWN0aW9uVmFyaWFudCA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRvQXBwRGF0YUZvclNhdmUuc2VsZWN0aW9uVmFyaWFudCA9IEpTT04ucGFyc2Uob0FwcERhdGEuc2VsZWN0aW9uVmFyaWFudCk7XG5cdFx0XHRcdFx0fSBjYXRjaCAoeCkge1xuXHRcdFx0XHRcdFx0Y29uc3Qgb0Vycm9yID0gdGhpcy5fY3JlYXRlVGVjaG5pY2FsRXJyb3IoXCJOYXZpZ2F0aW9uSGFuZGxlci5BcHBTdGF0ZVNhdmUucGFyc2VFcnJvclwiKTtcblx0XHRcdFx0XHRcdGlmIChmbk9uRXJyb3IpIHtcblx0XHRcdFx0XHRcdFx0Zm5PbkVycm9yKG9FcnJvcik7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmICh0aGlzLl9zTW9kZSA9PT0gTW9kZS5PRGF0YVYyKSB7XG5cdFx0XHRvQXBwRGF0YUZvclNhdmUgPSBleHRlbmQoXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRzZWxlY3Rpb25WYXJpYW50OiB7fSxcblx0XHRcdFx0XHR0YWJsZVZhcmlhbnRJZDogXCJcIixcblx0XHRcdFx0XHRjdXN0b21EYXRhOiB7fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRvQXBwRGF0YUZvclNhdmVcblx0XHRcdCkgYXMgSW5uZXJBcHBEYXRhO1xuXG5cdFx0XHRpZiAob0FwcERhdGEudGFibGVWYXJpYW50SWQpIHtcblx0XHRcdFx0b0FwcERhdGFGb3JTYXZlLnRhYmxlVmFyaWFudElkID0gb0FwcERhdGEudGFibGVWYXJpYW50SWQ7XG5cdFx0XHR9XG5cdFx0XHRpZiAob0FwcERhdGEuY3VzdG9tRGF0YSkge1xuXHRcdFx0XHRvQXBwRGF0YUZvclNhdmUuY3VzdG9tRGF0YSA9IG9BcHBEYXRhLmN1c3RvbURhdGE7XG5cdFx0XHR9XG5cdFx0XHRpZiAob0FwcERhdGEucHJlc2VudGF0aW9uVmFyaWFudCkge1xuXHRcdFx0XHRvQXBwRGF0YUZvclNhdmUucHJlc2VudGF0aW9uVmFyaWFudCA9IG9BcHBEYXRhLnByZXNlbnRhdGlvblZhcmlhbnQ7XG5cdFx0XHR9XG5cdFx0XHRpZiAob0FwcERhdGEudmFsdWVUZXh0cykge1xuXHRcdFx0XHRvQXBwRGF0YUZvclNhdmUudmFsdWVUZXh0cyA9IG9BcHBEYXRhLnZhbHVlVGV4dHM7XG5cdFx0XHR9XG5cdFx0XHRpZiAob0FwcERhdGEuc2VtYW50aWNEYXRlcykge1xuXHRcdFx0XHRvQXBwRGF0YUZvclNhdmUuc2VtYW50aWNEYXRlcyA9IG9BcHBEYXRhLnNlbWFudGljRGF0ZXM7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnN0IG9BcHBEYXRhQ2xvbmUgPSBPYmplY3QuYXNzaWduKHt9LCBvQXBwRGF0YSk7XG5cdFx0XHRvQXBwRGF0YUZvclNhdmUgPSBtZXJnZShvQXBwRGF0YUNsb25lLCBvQXBwRGF0YUZvclNhdmUpO1xuXHRcdH1cblx0XHRvQXBwRGF0YUZvclNhdmUgPSB0aGlzLl9jaGVja0lzUG90ZW50aWFsbHlTZW5zaXRpdmUob0FwcERhdGFGb3JTYXZlKTtcblx0XHRyZXR1cm4gb0FwcERhdGFGb3JTYXZlO1xuXHR9XG5cdF9mblNhdmVBcHBTdGF0ZUFzeW5jKG9BcHBEYXRhOiBhbnksIGZuT25FcnJvcj86IGFueSkge1xuXHRcdGNvbnN0IG9OYXZIYW5kbGVyID0gdGhpcztcblx0XHRyZXR1cm4gdGhpcy5fZ2V0QXBwTmF2aWdhdGlvblNlcnZpY2VBc3luYygpXG5cdFx0XHQudGhlbihmdW5jdGlvbiAob0Nyb3NzQXBwTmF2U2VydmljZTogYW55KSB7XG5cdFx0XHRcdHJldHVybiBvQ3Jvc3NBcHBOYXZTZXJ2aWNlLmNyZWF0ZUVtcHR5QXBwU3RhdGVBc3luYyhvTmF2SGFuZGxlci5vQ29tcG9uZW50KTtcblx0XHRcdH0pXG5cdFx0XHQudGhlbihmdW5jdGlvbiAob0FwcFN0YXRlOiBhbnkpIHtcblx0XHRcdFx0cmV0dXJuIG9OYXZIYW5kbGVyLl9mblNhdmVBcHBTdGF0ZVdpdGhJbW1lZGlhdGVSZXR1cm4ob0FwcERhdGEsIG9BcHBTdGF0ZSwgZm5PbkVycm9yKTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24gKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdGlmIChmbk9uRXJyb3IpIHtcblx0XHRcdFx0XHRmbk9uRXJyb3Iob0Vycm9yKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdH1cblx0X3NhdmVBcHBTdGF0ZVdpdGhJbW1lZGlhdGVSZXR1cm4ob0FwcERhdGE6IGFueSwgZm5PbkVycm9yPzogYW55KSB7XG5cdFx0Y29uc3Qgb0FwcFN0YXRlID0gdGhpcy5fZ2V0QXBwTmF2aWdhdGlvblNlcnZpY2UoKS5jcmVhdGVFbXB0eUFwcFN0YXRlKHRoaXMub0NvbXBvbmVudCk7XG5cdFx0cmV0dXJuIHRoaXMuX2ZuU2F2ZUFwcFN0YXRlV2l0aEltbWVkaWF0ZVJldHVybihvQXBwRGF0YSwgb0FwcFN0YXRlLCBmbk9uRXJyb3IpO1xuXHR9XG5cblx0X2xvYWRBcHBTdGF0ZShzQXBwU3RhdGVLZXk6IGFueSwgb0RlZmVycmVkOiBhbnkpIHtcblx0XHRjb25zdCBvTmF2SGFuZGxlciA9IHRoaXM7XG5cdFx0dGhpcy5fZ2V0QXBwTmF2aWdhdGlvblNlcnZpY2VBc3luYygpXG5cdFx0XHQudGhlbihmdW5jdGlvbiAob0Nyb3NzQXBwTmF2U2VydmljZTogYW55KSB7XG5cdFx0XHRcdGNvbnN0IG9BcHBTdGF0ZVByb21pc2UgPSBvQ3Jvc3NBcHBOYXZTZXJ2aWNlLmdldEFwcFN0YXRlKG9OYXZIYW5kbGVyLm9Db21wb25lbnQsIHNBcHBTdGF0ZUtleSk7XG5cdFx0XHRcdG9BcHBTdGF0ZVByb21pc2UuZG9uZShmdW5jdGlvbiAob0FwcFN0YXRlOiBhbnkpIHtcblx0XHRcdFx0XHRsZXQgb0FwcERhdGE6IGFueSA9IHt9O1xuXHRcdFx0XHRcdGNvbnN0IG9BcHBEYXRhTG9hZGVkID0gb0FwcFN0YXRlLmdldERhdGEoKTtcblxuXHRcdFx0XHRcdGlmICh0eXBlb2Ygb0FwcERhdGFMb2FkZWQgPT09IFwidW5kZWZpbmVkXCIpIHtcblx0XHRcdFx0XHRcdGNvbnN0IG9FcnJvciA9IG9OYXZIYW5kbGVyLl9jcmVhdGVUZWNobmljYWxFcnJvcihcIk5hdmlnYXRpb25IYW5kbGVyLmdldERhdGFGcm9tQXBwU3RhdGUuZmFpbGVkXCIpO1xuXHRcdFx0XHRcdFx0b0RlZmVycmVkLnJlamVjdChvRXJyb3IsIHt9LCBOYXZUeXBlLmlBcHBTdGF0ZSk7XG5cdFx0XHRcdFx0fSBlbHNlIGlmIChvTmF2SGFuZGxlci5fc01vZGUgPT09IE1vZGUuT0RhdGFWMikge1xuXHRcdFx0XHRcdFx0b0FwcERhdGEgPSB7XG5cdFx0XHRcdFx0XHRcdHNlbGVjdGlvblZhcmlhbnQ6IFwie31cIixcblx0XHRcdFx0XHRcdFx0b1NlbGVjdGlvblZhcmlhbnQ6IG5ldyBTZWxlY3Rpb25WYXJpYW50KCksXG5cdFx0XHRcdFx0XHRcdG9EZWZhdWx0ZWRTZWxlY3Rpb25WYXJpYW50OiBuZXcgU2VsZWN0aW9uVmFyaWFudCgpLFxuXHRcdFx0XHRcdFx0XHRiTmF2U2VsVmFySGFzRGVmYXVsdHNPbmx5OiBmYWxzZSxcblx0XHRcdFx0XHRcdFx0dGFibGVWYXJpYW50SWQ6IFwiXCIsXG5cdFx0XHRcdFx0XHRcdGN1c3RvbURhdGE6IHt9LFxuXHRcdFx0XHRcdFx0XHRhcHBTdGF0ZUtleTogc0FwcFN0YXRlS2V5LFxuXHRcdFx0XHRcdFx0XHRwcmVzZW50YXRpb25WYXJpYW50OiB7fSxcblx0XHRcdFx0XHRcdFx0dmFsdWVUZXh0czoge30sXG5cdFx0XHRcdFx0XHRcdHNlbWFudGljRGF0ZXM6IHt9XG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0aWYgKG9BcHBEYXRhTG9hZGVkLnNlbGVjdGlvblZhcmlhbnQpIHtcblx0XHRcdFx0XHRcdFx0Lypcblx0XHRcdFx0XHRcdFx0ICogSW4gY2FzZSB0aGF0IHdlIGdldCBhbiBvYmplY3QgZnJvbSB0aGUgc3RvcmVkIEFwcERhdGEgKD1wZXJzaXN0ZW5jeSksIHdlIG5lZWQgdG8gc3RyaW5naWZ5IHRoZSBKU09OIG9iamVjdC5cblx0XHRcdFx0XHRcdFx0ICovXG5cdFx0XHRcdFx0XHRcdG9BcHBEYXRhLnNlbGVjdGlvblZhcmlhbnQgPSBvTmF2SGFuZGxlci5fZW5zdXJlU2VsZWN0aW9uVmFyaWFudEZvcm1hdFN0cmluZyhvQXBwRGF0YUxvYWRlZC5zZWxlY3Rpb25WYXJpYW50KTtcblx0XHRcdFx0XHRcdFx0b0FwcERhdGEub1NlbGVjdGlvblZhcmlhbnQgPSBuZXcgU2VsZWN0aW9uVmFyaWFudChvQXBwRGF0YS5zZWxlY3Rpb25WYXJpYW50KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGlmIChvQXBwRGF0YUxvYWRlZC50YWJsZVZhcmlhbnRJZCkge1xuXHRcdFx0XHRcdFx0XHRvQXBwRGF0YS50YWJsZVZhcmlhbnRJZCA9IG9BcHBEYXRhTG9hZGVkLnRhYmxlVmFyaWFudElkO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0aWYgKG9BcHBEYXRhTG9hZGVkLmN1c3RvbURhdGEpIHtcblx0XHRcdFx0XHRcdFx0b0FwcERhdGEuY3VzdG9tRGF0YSA9IG9BcHBEYXRhTG9hZGVkLmN1c3RvbURhdGE7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRpZiAob0FwcERhdGFMb2FkZWQucHJlc2VudGF0aW9uVmFyaWFudCkge1xuXHRcdFx0XHRcdFx0XHRvQXBwRGF0YS5wcmVzZW50YXRpb25WYXJpYW50ID0gb0FwcERhdGFMb2FkZWQucHJlc2VudGF0aW9uVmFyaWFudDtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGlmIChvQXBwRGF0YUxvYWRlZC52YWx1ZVRleHRzKSB7XG5cdFx0XHRcdFx0XHRcdG9BcHBEYXRhLnZhbHVlVGV4dHMgPSBvQXBwRGF0YUxvYWRlZC52YWx1ZVRleHRzO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0aWYgKG9BcHBEYXRhTG9hZGVkLnNlbWFudGljRGF0ZXMpIHtcblx0XHRcdFx0XHRcdFx0b0FwcERhdGEuc2VtYW50aWNEYXRlcyA9IG9BcHBEYXRhTG9hZGVkLnNlbWFudGljRGF0ZXM7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdG9BcHBEYXRhID0gbWVyZ2Uob0FwcERhdGEsIG9BcHBEYXRhTG9hZGVkKTtcblx0XHRcdFx0XHRcdGlmIChvQXBwRGF0YUxvYWRlZC5zZWxlY3Rpb25WYXJpYW50KSB7XG5cdFx0XHRcdFx0XHRcdC8qXG5cdFx0XHRcdFx0XHRcdCAqIEluIGNhc2UgdGhhdCB3ZSBnZXQgYW4gb2JqZWN0IGZyb20gdGhlIHN0b3JlZCBBcHBEYXRhICg9cGVyc2lzdGVuY3kpLCB3ZSBuZWVkIHRvIHN0cmluZ2lmeSB0aGUgSlNPTiBvYmplY3QuXG5cdFx0XHRcdFx0XHRcdCAqL1xuXHRcdFx0XHRcdFx0XHRvQXBwRGF0YS5zZWxlY3Rpb25WYXJpYW50ID0gb05hdkhhbmRsZXIuX2Vuc3VyZVNlbGVjdGlvblZhcmlhbnRGb3JtYXRTdHJpbmcob0FwcERhdGFMb2FkZWQuc2VsZWN0aW9uVmFyaWFudCk7XG5cdFx0XHRcdFx0XHRcdG9BcHBEYXRhLm9TZWxlY3Rpb25WYXJpYW50ID0gbmV3IFNlbGVjdGlvblZhcmlhbnQob0FwcERhdGEuc2VsZWN0aW9uVmFyaWFudCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Ly8gcmVzb2x2ZSBpcyBjYWxsZWQgb24gcGFzc2VkIERlZmVycmVkIG9iamVjdCB0byB0cmlnZ2VyIGEgY2FsbCBvZiB0aGUgZG9uZSBtZXRob2QsIGlmIGltcGxlbWVudGVkXG5cdFx0XHRcdFx0Ly8gdGhlIGRvbmUgbWV0aG9kIHdpbGwgcmVjZWl2ZSB0aGUgbG9hZGVkIGFwcFN0YXRlIGFuZCB0aGUgbmF2aWdhdGlvbiB0eXBlIGFzIHBhcmFtZXRlcnNcblx0XHRcdFx0XHRvRGVmZXJyZWQucmVzb2x2ZShvQXBwRGF0YSwge30sIE5hdlR5cGUuaUFwcFN0YXRlKTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdG9BcHBTdGF0ZVByb21pc2UuZmFpbChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0Y29uc3Qgb0Vycm9yID0gb05hdkhhbmRsZXIuX2NyZWF0ZVRlY2huaWNhbEVycm9yKFwiTmF2aWdhdGlvbkhhbmRsZXIuZ2V0QXBwU3RhdGUuZmFpbGVkXCIpO1xuXHRcdFx0XHRcdG9EZWZlcnJlZC5yZWplY3Qob0Vycm9yLCB7fSwgTmF2VHlwZS5pQXBwU3RhdGUpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRjb25zdCBvRXJyb3IgPSBvTmF2SGFuZGxlci5fY3JlYXRlVGVjaG5pY2FsRXJyb3IoXCJOYXZpZ2F0aW9uSGFuZGxlci5fZ2V0QXBwTmF2aWdhdGlvblNlcnZpY2VBc3luYy5mYWlsZWRcIik7XG5cdFx0XHRcdG9EZWZlcnJlZC5yZWplY3Qob0Vycm9yLCB7fSwgTmF2VHlwZS5pQXBwU3RhdGUpO1xuXHRcdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0cmlldmVzIHRoZSBwYXJhbWV0ZXIgdmFsdWUgb2YgdGhlIHNhcC1pYXBwLXN0YXRlICh0aGUgaW50ZXJuYWwgYXBwcykgZnJvbSB0aGUgQXBwSGFzaCBzdHJpbmcuIEl0IGF1dG9tYXRpY2FsbHkgdGFrZXMgY2FyZSBhYm91dFxuXHQgKiBjb21wYXRpYmlsaXR5IGJldHdlZW4gdGhlIG9sZCBhbmQgdGhlIG5ldyBhcHByb2FjaCBvZiB0aGUgc2FwLWlhcHAtc3RhdGUuIFByZWNlZGVuY2UgaXMgdGhhdCB0aGUgbmV3IGFwcHJvYWNoIGlzIGZhdm91cmVkIGFnYWluc3QgdGhlIG9sZFxuXHQgKiBhcHByb2FjaC5cblx0ICpcblx0ICogQHBhcmFtIHNBcHBIYXNoIFRoZSBBcHBIYXNoLCB3aGljaCBtYXkgY29udGFpbiBhIHNhcC1pYXBwLXN0YXRlIHBhcmFtZXRlciAoYm90aCBvbGQgYW5kL29yIG5ldyBhcHByb2FjaClcblx0ICogQHJldHVybnMgVGhlIHZhbHVlIG9mIHNhcC1pYXBwLXN0YXRlIChpLmUuIHRoZSBuYW1lIG9mIHRoZSBjb250YWluZXIgdG8gcmV0cmlldmUgdGhlIHBhcmFtZXRlcnMpLCBvciA8Y29kZT51bmRlZmluZWQ8L2NvZGU+IGluXG5cdCAqICAgICAgICAgY2FzZSB0aGF0IG5vIHNhcC1pYXBwLXN0YXRlIHdhcyBmb3VuZCBpbiA8Y29kZT5zQXBwSGFzaDwvY29kZT4uXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfZ2V0SW5uZXJBcHBTdGF0ZUtleShzQXBwSGFzaDogc3RyaW5nKSB7XG5cdFx0Ly8gdHJpdmlhbCBjYXNlOiBubyBhcHAgaGFzaCBhdmFpbGFibGUgYXQgYWxsLlxuXHRcdGlmICghc0FwcEhhc2gpIHtcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXG5cdFx0LyogbmV3IGFwcHJvYWNoOiBzZXBhcmF0ZWQgdmlhIHF1ZXN0aW9uIG1hcmsgLyBwYXJ0IG9mIHRoZSBxdWVyeSBwYXJhbWV0ZXIgb2YgdGhlIEFwcEhhc2ggKi9cblx0XHRsZXQgYU1hdGNoZXMgPSB0aGlzLl9ySUFwcFN0YXRlTmV3LmV4ZWMoc0FwcEhhc2gpO1xuXG5cdFx0Lyogb2xkIGFwcHJvYWNoOiBzcGVhcmF0ZWQgdmlhIHNsYXNoZXMgLyBpLmUuIHBhcnQgb2YgdGhlIHJvdXRlIGl0c2VsZiAqL1xuXHRcdGlmIChhTWF0Y2hlcyA9PT0gbnVsbCkge1xuXHRcdFx0YU1hdGNoZXMgPSB0aGlzLl9ySUFwcFN0YXRlT2xkLmV4ZWMoc0FwcEhhc2gpO1xuXHRcdH1cblxuXHRcdC8qXG5cdFx0ICogb2xkIGFwcHJvYWNoOiBzcGVjaWFsIGNhc2U6IGlmIHRoZXJlIGlzIG5vIGRlZXAgcm91dGUva2V5IGRlZmluZWQsIHRoZSBzYXAtaWFwcC1zdGF0ZSBtYXkgYmUgYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgc3RyaW5nLCB3aXRob3V0XG5cdFx0ICogYW55IHNlcGFyYXRpb24gd2l0aCB0aGUgc2xhc2hlc1xuXHRcdCAqL1xuXHRcdGlmIChhTWF0Y2hlcyA9PT0gbnVsbCkge1xuXHRcdFx0YU1hdGNoZXMgPSB0aGlzLl9ySUFwcFN0YXRlT2xkQXRTdGFydC5leGVjKHNBcHBIYXNoKTtcblx0XHR9XG5cblx0XHRpZiAoYU1hdGNoZXMgPT09IG51bGwpIHtcblx0XHRcdC8vIHRoZXJlIGlzIG5vICh2YWxpZCkgc2FwLWlhcHAtc3RhdGUgaW4gdGhlIEFwcCBIYXNoXG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblxuXHRcdHJldHVybiBhTWF0Y2hlc1sxXTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXBsYWNlcyAob3IgaW5zZXJ0cykgYSBwYXJhbWV0ZXIgdmFsdWUgKGFuIEFwcFN0YXRlS2V5KSBmb3IgdGhlIHNhcC1pYXBwLXN0YXRlIGludG8gYW4gZXhpc3RpbmcgQXBwSGFzaCBzdHJpbmcuIE90aGVyIHJvdXRlcy9wYXJhbWV0ZXJzXG5cdCAqIGFyZSBpZ25vcmVkIGFuZCByZXR1cm5lZCB3aXRob3V0IG1vZGlmaWNhdGlvbiAoXCJlbnZpcm9ubWVudGFsIGFnbm9zdGljXCIgcHJvcGVydHkpLiBPbmx5IHRoZSBuZXcgYXBwcm9hY2ggKHNhcC1pYXBwLXN0YXRlIGFzIHF1ZXJ5IHBhcmFtZXRlclxuXHQgKiBpbiB0aGUgQXBwSGFzaCkgaXMgYmVpbmcgaXNzdWVkLlxuXHQgKlxuXHQgKiBAcGFyYW0gc0FwcEhhc2ggVGhlIEFwcEhhc2ggaW50byB3aGljaCB0aGUgc2FwLWlhcHAtc3RhdGUgcGFyYW1ldGVyIHNoYWxsIGJlIG1hZGUgYXZhaWxhYmxlXG5cdCAqIEBwYXJhbSBzQXBwU3RhdGVLZXkgVGhlIGtleSB2YWx1ZSBvZiB0aGUgQXBwU3RhdGUgd2hpY2ggc2hhbGwgYmUgc3RvcmVkIGFzIHBhcmFtZXRlciB2YWx1ZSBvZiB0aGUgc2FwLWlhcHAtc3RhdGUgcHJvcGVydHkuXG5cdCAqIEByZXR1cm5zIFRoZSBtb2RpZmllZCBzQXBwSGFzaCBzdHJpbmcsIHN1Y2ggdGhhdCB0aGUgc2FwLWlhcHAtc3RhdGUgaGFzIGJlZW4gc2V0IGJhc2VkIG9uIHRoZSBuZXcgKHF1ZXJ5IG9wdGlvbi1iYXNlZClcblx0ICogICAgICAgICBzYXAtaWFwcC1zdGF0ZS4gSWYgYSBzYXAtaWFwcC1zdGF0ZSBoYXMgYmVlbiBzcGVjaWZpZWQgYmVmb3JlLCB0aGUga2V5IGlzIHJlcGxhY2VkLiBJZiA8Y29kZT5zQXBwSGFzaDwvY29kZT4gd2FzIG9mIHRoZSBvbGRcblx0ICogICAgICAgICBmb3JtYXQgKHNhcC1pYXBwLXN0YXRlIGFzIHBhcnQgb2YgdGhlIGtleXMvcm91dGUpLCB0aGUgZm9ybWF0IGlzIGNvbnZlcnRlZCB0byB0aGUgbmV3IGZvcm1hdCBiZWZvcmUgdGhlIHJlc3VsdCBpcyByZXR1cm5lZC5cblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9yZXBsYWNlSW5uZXJBcHBTdGF0ZUtleShzQXBwSGFzaDogc3RyaW5nLCBzQXBwU3RhdGVLZXk6IHN0cmluZykge1xuXHRcdGNvbnN0IHNOZXdJQXBwU3RhdGUgPSBJQVBQX1NUQVRFICsgXCI9XCIgKyBzQXBwU3RhdGVLZXk7XG5cblx0XHQvKlxuXHRcdCAqIGdlbmVyYXRlIHNhcC1pYXBwLXN0YXRlcyB3aXRoIHRoZSBuZXcgd2F5XG5cdFx0ICovXG5cdFx0aWYgKCFzQXBwSGFzaCkge1xuXHRcdFx0Ly8gdGhlcmUncyBubyBzQXBwSGFzaCBrZXkgeWV0XG5cdFx0XHRyZXR1cm4gXCI/XCIgKyBzTmV3SUFwcFN0YXRlO1xuXHRcdH1cblxuXHRcdGNvbnN0IGZuQXBwZW5kVG9RdWVyeVBhcmFtZXRlciA9IGZ1bmN0aW9uIChzU3ViQXBwSGFzaDogYW55KSB7XG5cdFx0XHQvLyB0aGVyZSBpcyBhbiBBcHBIYXNoIGF2YWlsYWJsZSwgYnV0IGl0IGRvZXMgbm90IGNvbnRhaW4gYSBzYXAtaWFwcC1zdGF0ZSBwYXJhbWV0ZXIgeWV0IC0gd2UgbmVlZCB0byBhcHBlbmQgb25lXG5cblx0XHRcdC8vIG5ldyBhcHByb2FjaDogd2UgbmVlZCB0byBjaGVjaywgaWYgYSBzZXQgb2YgcXVlcnkgcGFyYW1ldGVycyBpcyBhbHJlYWR5IGF2YWlsYWJsZVxuXHRcdFx0aWYgKHNTdWJBcHBIYXNoLmluZGV4T2YoXCI/XCIpICE9PSAtMSkge1xuXHRcdFx0XHQvLyB0aGVyZSBhcmUgYWxyZWFkeSBxdWVyeSBwYXJhbWV0ZXJzIGF2YWlsYWJsZSAtIGFwcGVuZCBpdCBhcyBhbm90aGVyIHBhcmFtZXRlclxuXHRcdFx0XHRyZXR1cm4gc1N1YkFwcEhhc2ggKyBcIiZcIiArIHNOZXdJQXBwU3RhdGU7XG5cdFx0XHR9XG5cdFx0XHQvLyB0aGVyZSBhcmUgbm8gYSBxdWVyeSBwYXJhbWV0ZXJzIGF2YWlsYWJsZSB5ZXQ7IGNyZWF0ZSBhIHNldCB3aXRoIGEgc2luZ2xlIHBhcmFtZXRlclxuXHRcdFx0cmV0dXJuIHNTdWJBcHBIYXNoICsgXCI/XCIgKyBzTmV3SUFwcFN0YXRlO1xuXHRcdH07XG5cblx0XHRpZiAoIXRoaXMuX2dldElubmVyQXBwU3RhdGVLZXkoc0FwcEhhc2gpKSB7XG5cdFx0XHRyZXR1cm4gZm5BcHBlbmRUb1F1ZXJ5UGFyYW1ldGVyKHNBcHBIYXNoKTtcblx0XHR9XG5cdFx0Ly8gVGhlcmUgaXMgYW4gQXBwSGFzaCBhdmFpbGFibGUgYW5kIHRoZXJlIGlzIGFscmVhZHkgYW4gc2FwLWlhcHAtc3RhdGUgaW4gdGhlIEFwcEhhc2hcblxuXHRcdGlmICh0aGlzLl9ySUFwcFN0YXRlTmV3LnRlc3Qoc0FwcEhhc2gpKSB7XG5cdFx0XHQvLyB0aGUgbmV3IGFwcHJvYWNoIGlzIGJlaW5nIHVzZWRcblx0XHRcdHJldHVybiBzQXBwSGFzaC5yZXBsYWNlKHRoaXMuX3JJQXBwU3RhdGVOZXcsIGZ1bmN0aW9uIChzTmVlZGxlOiBzdHJpbmcpIHtcblx0XHRcdFx0cmV0dXJuIHNOZWVkbGUucmVwbGFjZSgvXFw9LiovZ2ksIFwiPVwiICsgc0FwcFN0YXRlS2V5KTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdC8vIHdlIG5lZWQgdG8gcmVtb3ZlIHRoZSBvbGQgQXBwSGFzaCBlbnRpcmVseSBhbmQgcmVwbGFjZSBpdCB3aXRoIGEgbmV3IG9uZS5cblxuXHRcdGNvbnN0IGZuUmVwbGFjZU9sZEFwcHJvYWNoID0gZnVuY3Rpb24gKHJPbGRBcHByb2FjaDogYW55LCBzU3ViQXBwSGFzaDogYW55KSB7XG5cdFx0XHRzU3ViQXBwSGFzaCA9IHNTdWJBcHBIYXNoLnJlcGxhY2Uock9sZEFwcHJvYWNoLCBcIlwiKTtcblx0XHRcdHJldHVybiBmbkFwcGVuZFRvUXVlcnlQYXJhbWV0ZXIoc1N1YkFwcEhhc2gpO1xuXHRcdH07XG5cblx0XHRpZiAodGhpcy5fcklBcHBTdGF0ZU9sZC50ZXN0KHNBcHBIYXNoKSkge1xuXHRcdFx0cmV0dXJuIGZuUmVwbGFjZU9sZEFwcHJvYWNoKHRoaXMuX3JJQXBwU3RhdGVPbGQsIHNBcHBIYXNoKTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5fcklBcHBTdGF0ZU9sZEF0U3RhcnQudGVzdChzQXBwSGFzaCkpIHtcblx0XHRcdHJldHVybiBmblJlcGxhY2VPbGRBcHByb2FjaCh0aGlzLl9ySUFwcFN0YXRlT2xkQXRTdGFydCwgc0FwcEhhc2gpO1xuXHRcdH1cblxuXHRcdGFzc2VydChmYWxzZSwgXCJpbnRlcm5hbCBpbmNvbnNpc3RlbmN5OiBBcHByb2FjaCBvZiBzYXAtaWFwcC1zdGF0ZSBub3Qga25vd24sIGJ1dCBfZ2V0SW5uZXJBcHBTdGF0ZUtleSByZXR1cm5lZCBpdFwiKTtcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cblx0X2dldFVSTFBhcmFtZXRlcnNGcm9tU2VsZWN0aW9uVmFyaWFudCh2U2VsZWN0aW9uVmFyaWFudDogYW55KSB7XG5cdFx0Y29uc3QgbVVSTFBhcmFtZXRlcnM6IGFueSA9IHt9O1xuXHRcdGxldCBpID0gMDtcblx0XHRsZXQgb1NlbGVjdGlvblZhcmlhbnQ7XG5cblx0XHRpZiAodHlwZW9mIHZTZWxlY3Rpb25WYXJpYW50ID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRvU2VsZWN0aW9uVmFyaWFudCA9IG5ldyBTZWxlY3Rpb25WYXJpYW50KHZTZWxlY3Rpb25WYXJpYW50KTtcblx0XHR9IGVsc2UgaWYgKHR5cGVvZiB2U2VsZWN0aW9uVmFyaWFudCA9PT0gXCJvYmplY3RcIikge1xuXHRcdFx0b1NlbGVjdGlvblZhcmlhbnQgPSB2U2VsZWN0aW9uVmFyaWFudDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhyb3cgbmV3IE5hdkVycm9yKFwiTmF2aWdhdGlvbkhhbmRsZXIuSU5WQUxJRF9JTlBVVFwiKTtcblx0XHR9XG5cblx0XHQvLyBhZGQgVVJMcyBwYXJhbWV0ZXJzIGZyb20gU2VsZWN0aW9uVmFyaWFudC5TZWxlY3RPcHRpb25zIChpZiBzaW5nbGUgdmFsdWUpXG5cdFx0Y29uc3QgYVNlbGVjdFByb3BlcnRpZXMgPSBvU2VsZWN0aW9uVmFyaWFudC5nZXRTZWxlY3RPcHRpb25zUHJvcGVydHlOYW1lcygpO1xuXHRcdGZvciAoaSA9IDA7IGkgPCBhU2VsZWN0UHJvcGVydGllcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0Y29uc3QgYVNlbGVjdE9wdGlvbnMgPSBvU2VsZWN0aW9uVmFyaWFudC5nZXRTZWxlY3RPcHRpb24oYVNlbGVjdFByb3BlcnRpZXNbaV0pO1xuXHRcdFx0aWYgKGFTZWxlY3RPcHRpb25zLmxlbmd0aCA9PT0gMSAmJiBhU2VsZWN0T3B0aW9uc1swXS5TaWduID09PSBcIklcIiAmJiBhU2VsZWN0T3B0aW9uc1swXS5PcHRpb24gPT09IFwiRVFcIikge1xuXHRcdFx0XHRtVVJMUGFyYW1ldGVyc1thU2VsZWN0UHJvcGVydGllc1tpXV0gPSBhU2VsZWN0T3B0aW9uc1swXS5Mb3c7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gYWRkIHBhcmFtZXRlcnMgZnJvbSBTZWxlY3Rpb25WYXJpYW50LlBhcmFtZXRlcnNcblx0XHRjb25zdCBhUGFyYW1ldGVyTmFtZXMgPSBvU2VsZWN0aW9uVmFyaWFudC5nZXRQYXJhbWV0ZXJOYW1lcygpO1xuXHRcdGZvciAoaSA9IDA7IGkgPCBhUGFyYW1ldGVyTmFtZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGNvbnN0IHNQYXJhbWV0ZXJWYWx1ZSA9IG9TZWxlY3Rpb25WYXJpYW50LmdldFBhcmFtZXRlcihhUGFyYW1ldGVyTmFtZXNbaV0pO1xuXG5cdFx0XHRtVVJMUGFyYW1ldGVyc1thUGFyYW1ldGVyTmFtZXNbaV1dID0gc1BhcmFtZXRlclZhbHVlO1xuXHRcdH1cblx0XHRyZXR1cm4gbVVSTFBhcmFtZXRlcnM7XG5cdH1cblxuXHRfY3JlYXRlVGVjaG5pY2FsRXJyb3Ioc0Vycm9yQ29kZTogYW55KSB7XG5cdFx0cmV0dXJuIG5ldyBOYXZFcnJvcihzRXJyb3JDb2RlKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIHRoZSBtb2RlbCB0aGF0IGlzIHVzZWQgZm9yIHZlcmlmaWNhdGlvbiBvZiBzZW5zaXRpdmUgaW5mb3JtYXRpb24uIElmIHRoZSBtb2RlbCBpcyBub3Qgc2V0LCB0aGUgdW5uYW1lZCBjb21wb25lbnQgbW9kZWwgaXMgdXNlZCBmb3IgdGhlXG5cdCAqIHZlcmlmaWNhdGlvbiBvZiBzZW5zaXRpdmUgaW5mb3JtYXRpb24uXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICogQHBhcmFtIG9Nb2RlbCBGb3IgY2hlY2tpbmcgc2Vuc2l0aXZlIGluZm9ybWF0aW9uXG5cdCAqL1xuXHRzZXRNb2RlbChvTW9kZWw6IFYyT0RhdGFNb2RlbCB8IFY0T0RhdGFNb2RlbCkge1xuXHRcdHRoaXMuX29Nb2RlbCA9IG9Nb2RlbDtcblx0fVxuXG5cdF9nZXRNb2RlbCgpOiBWMk9EYXRhTW9kZWwgfCBWNE9EYXRhTW9kZWwge1xuXHRcdHJldHVybiB0aGlzLl9vTW9kZWwgfHwgdGhpcy5vQ29tcG9uZW50LmdldE1vZGVsKCk7XG5cdH1cblxuXHRfcmVtb3ZlQWxsUHJvcGVydGllcyhvRGF0YTogYW55KSB7XG5cdFx0aWYgKG9EYXRhKSB7XG5cdFx0XHRpZiAob0RhdGEuc2VsZWN0aW9uVmFyaWFudCkge1xuXHRcdFx0XHRvRGF0YS5zZWxlY3Rpb25WYXJpYW50ID0gbnVsbDtcblx0XHRcdH1cblxuXHRcdFx0aWYgKG9EYXRhLnZhbHVlVGV4dHMpIHtcblx0XHRcdFx0b0RhdGEudmFsdWVUZXh0cyA9IG51bGw7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChvRGF0YS5zZW1hbnRpY0RhdGVzKSB7XG5cdFx0XHRcdG9EYXRhLnNlbWFudGljRGF0ZXMgPSBudWxsO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdF9yZW1vdmVQcm9wZXJ0aWVzKGFGaWx0ZXJOYW1lOiBhbnksIGFQYXJhbWV0ZXJOYW1lOiBhbnksIG9EYXRhOiBhbnkpIHtcblx0XHRpZiAoYUZpbHRlck5hbWUubGVuZ3RoICYmIG9EYXRhICYmIChvRGF0YS5zZWxlY3Rpb25WYXJpYW50IHx8IG9EYXRhLnZhbHVlVGV4dHMgfHwgb0RhdGEuc2VtYW50aWNEYXRlcykpIHtcblx0XHRcdGFGaWx0ZXJOYW1lLmZvckVhY2goZnVuY3Rpb24gKHNOYW1lOiBhbnkpIHtcblx0XHRcdFx0aWYgKG9EYXRhLnNlbGVjdGlvblZhcmlhbnQuU2VsZWN0T3B0aW9ucykge1xuXHRcdFx0XHRcdG9EYXRhLnNlbGVjdGlvblZhcmlhbnQuU2VsZWN0T3B0aW9ucy5zb21lKGZ1bmN0aW9uIChvVmFsdWU6IGFueSwgbklkeDogYW55KSB7XG5cdFx0XHRcdFx0XHRpZiAoc05hbWUgPT09IG9WYWx1ZS5Qcm9wZXJ0eU5hbWUpIHtcblx0XHRcdFx0XHRcdFx0b0RhdGEuc2VsZWN0aW9uVmFyaWFudC5TZWxlY3RPcHRpb25zLnNwbGljZShuSWR4LCAxKTtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChvRGF0YS52YWx1ZVRleHRzICYmIG9EYXRhLnZhbHVlVGV4dHMuVGV4dHMpIHtcblx0XHRcdFx0XHRvRGF0YS52YWx1ZVRleHRzLlRleHRzLmZvckVhY2goZnVuY3Rpb24gKG9UZXh0czogYW55KSB7XG5cdFx0XHRcdFx0XHRpZiAob1RleHRzLlByb3BlcnR5VGV4dHMpIHtcblx0XHRcdFx0XHRcdFx0b1RleHRzLlByb3BlcnR5VGV4dHMuc29tZShmdW5jdGlvbiAob1ZhbHVlOiBhbnksIG5JZHg6IGFueSkge1xuXHRcdFx0XHRcdFx0XHRcdGlmIChzTmFtZSA9PT0gb1ZhbHVlLlByb3BlcnR5TmFtZSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0b1RleHRzLlByb3BlcnR5VGV4dHMuc3BsaWNlKG5JZHgsIDEpO1xuXHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChvRGF0YS5zZW1hbnRpY0RhdGVzICYmIG9EYXRhLnNlbWFudGljRGF0ZXMuRGF0ZXMpIHtcblx0XHRcdFx0XHRvRGF0YS5zZW1hbnRpY0RhdGVzLkRhdGVzLmZvckVhY2goZnVuY3Rpb24gKG9EYXRlczogYW55LCBuSWR4OiBhbnkpIHtcblx0XHRcdFx0XHRcdGlmIChzTmFtZSA9PT0gb0RhdGVzLlByb3BlcnR5TmFtZSkge1xuXHRcdFx0XHRcdFx0XHRvRGF0YS5zZW1hbnRpY0RhdGVzLkRhdGVzLnNwbGljZShuSWR4LCAxKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0aWYgKGFQYXJhbWV0ZXJOYW1lLmxlbmd0aCAmJiBvRGF0YSAmJiBvRGF0YS5zZWxlY3Rpb25WYXJpYW50ICYmIG9EYXRhLnNlbGVjdGlvblZhcmlhbnQuUGFyYW1ldGVycykge1xuXHRcdFx0YVBhcmFtZXRlck5hbWUuZm9yRWFjaChmdW5jdGlvbiAoc05hbWU6IGFueSkge1xuXHRcdFx0XHRvRGF0YS5zZWxlY3Rpb25WYXJpYW50LlBhcmFtZXRlcnMuc29tZShmdW5jdGlvbiAob1ZhbHVlOiBhbnksIG5JZHg6IGFueSkge1xuXHRcdFx0XHRcdGlmIChzTmFtZSA9PT0gb1ZhbHVlLlByb3BlcnR5TmFtZSB8fCBcIiRQYXJhbWV0ZXIuXCIgKyBzTmFtZSA9PT0gb1ZhbHVlLlByb3BlcnR5TmFtZSkge1xuXHRcdFx0XHRcdFx0b0RhdGEuc2VsZWN0aW9uVmFyaWFudC5QYXJhbWV0ZXJzLnNwbGljZShuSWR4LCAxKTtcblx0XHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHRfaXNUZXJtVHJ1ZShvUHJvcGVydHk6IGFueSwgc1Rlcm06IGFueSkge1xuXHRcdGNvbnN0IGZJc1Rlcm1EZWZhdWx0VHJ1ZSA9IGZ1bmN0aW9uIChvVGVybTogYW55KSB7XG5cdFx0XHRpZiAob1Rlcm0pIHtcblx0XHRcdFx0cmV0dXJuIG9UZXJtLkJvb2wgPyBvVGVybS5Cb29sICE9PSBcImZhbHNlXCIgOiB0cnVlO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH07XG5cblx0XHRyZXR1cm4gISFvUHJvcGVydHlbc1Rlcm1dICYmIGZJc1Rlcm1EZWZhdWx0VHJ1ZShvUHJvcGVydHlbc1Rlcm1dKTtcblx0fVxuXG5cdF9pc0V4Y2x1ZGVkRnJvbU5hdmlnYXRpb25Db250ZXh0KG9Qcm9wZXJ0eTogYW55KSB7XG5cdFx0cmV0dXJuIHRoaXMuX2lzVGVybVRydWUob1Byb3BlcnR5LCBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkV4Y2x1ZGVGcm9tTmF2aWdhdGlvbkNvbnRleHRcIik7XG5cdH1cblxuXHRfaXNQb3RlbnRpYWxseVNlbnNpdGl2ZShvUHJvcGVydHk6IGFueSkge1xuXHRcdHJldHVybiB0aGlzLl9pc1Rlcm1UcnVlKG9Qcm9wZXJ0eSwgXCJjb20uc2FwLnZvY2FidWxhcmllcy5QZXJzb25hbERhdGEudjEuSXNQb3RlbnRpYWxseVNlbnNpdGl2ZVwiKTtcblx0fVxuXG5cdF9pc01lYXN1cmVQcm9wZXJ0eShvUHJvcGVydHk6IGFueSkge1xuXHRcdHJldHVybiB0aGlzLl9pc1Rlcm1UcnVlKG9Qcm9wZXJ0eSwgXCJjb20uc2FwLnZvY2FidWxhcmllcy5BbmFseXRpY3MudjEuTWVhc3VyZVwiKTtcblx0fVxuXG5cdF9pc1RvQmVFeGNsdWRlZChvUHJvcGVydHk6IGFueSkge1xuXHRcdHJldHVybiB0aGlzLl9pc1BvdGVudGlhbGx5U2Vuc2l0aXZlKG9Qcm9wZXJ0eSkgfHwgdGhpcy5faXNFeGNsdWRlZEZyb21OYXZpZ2F0aW9uQ29udGV4dChvUHJvcGVydHkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBtZXRob2QgY3JlYXRlcyBhIGNvbnRleHQgdXJsIGJhc2VkIG9uIHByb3ZpZGVkIGRhdGEuIFRoaXMgY29udGV4dCB1cmwgY2FuIGVpdGhlciBiZSB1c2VkIGFzXG5cdCAqIHtAbGluayBzYXAuZmUubmF2aWdhdGlvbi5OYXZpZ2F0aW9uSGFuZGxlciNzZXRQYXJhbWV0ZXJDb250ZXh0VXJsIFBhcmFtZXRlckNvbnRleHRVcmx9IG9yXG5cdCAqIHtAbGluayBzYXAuZmUubmF2aWdhdGlvbi5OYXZpZ2F0aW9uSGFuZGxlciNzZXRGaWx0ZXJDb250ZXh0VXJsIEZpbHRlckNvbnRleHRVcmx9LlxuXHQgKlxuXHQgKiBAcGFyYW0gc0VudGl0eVNldE5hbWUgVXNlZCBmb3IgdXJsIGRldGVybWluYXRpb25cblx0ICogQHBhcmFtIFtvTW9kZWxdIFVzZWQgZm9yIHVybCBkZXRlcm1pbmF0aW9uLiBJZiBvbWl0dGVkLCB0aGUgTmF2aWdhdGlvbkhhbmRsZXIgbW9kZWwgaXMgdXNlZC5cblx0ICogQHRocm93cyBBbiBpbnN0YW5jZSBvZiB7QGxpbmsgc2FwLmZlLm5hdmlnYXRpb24uTmF2RXJyb3J9IGluIGNhc2Ugb2YgbWlzc2luZyBvciB3cm9uZyBwYXNzZWQgcGFyYW1ldGVyc1xuXHQgKiBAcmV0dXJucyBUaGUgY29udGV4dCB1cmwgZm9yIHRoZSBnaXZlbiBlbnRpdGllc1xuXHQgKiBAcHJvdGVjdGVkXG5cdCAqL1xuXHRjb25zdHJ1Y3RDb250ZXh0VXJsKHNFbnRpdHlTZXROYW1lOiBzdHJpbmcsIG9Nb2RlbD86IFYyT0RhdGFNb2RlbCB8IFY0T0RhdGFNb2RlbCkge1xuXHRcdGlmICghc0VudGl0eVNldE5hbWUpIHtcblx0XHRcdHRocm93IG5ldyBOYXZFcnJvcihcIk5hdmlnYXRpb25IYW5kbGVyLk5PX0VOVElUWV9TRVRfUFJPVklERURcIik7XG5cdFx0fVxuXG5cdFx0aWYgKG9Nb2RlbCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRvTW9kZWwgPSB0aGlzLl9nZXRNb2RlbCgpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLl9jb25zdHJ1Y3RDb250ZXh0VXJsKG9Nb2RlbCkgKyBcIiNcIiArIHNFbnRpdHlTZXROYW1lO1xuXHR9XG5cblx0X2NvbnN0cnVjdENvbnRleHRVcmwob01vZGVsOiBWMk9EYXRhTW9kZWwgfCBWNE9EYXRhTW9kZWwpIHtcblx0XHRsZXQgc1NlcnZlclVybDtcblxuXHRcdGlmIChvTW9kZWwuaXNBPFYyT0RhdGFNb2RlbD4oXCJzYXAudWkubW9kZWwub2RhdGEudjIuT0RhdGFNb2RlbFwiKSkge1xuXHRcdFx0c1NlcnZlclVybCA9IG9Nb2RlbC5fZ2V0U2VydmVyVXJsKCk7XG5cdFx0fSBlbHNlIGlmIChvTW9kZWwuaXNBPFY0T0RhdGFNb2RlbD4oXCJzYXAudWkubW9kZWwub2RhdGEudjQuT0RhdGFNb2RlbFwiKSkge1xuXHRcdFx0Y29uc3Qgb1NlcnZpY2VVUkkgPSBuZXcgVVJJKG9Nb2RlbC5zU2VydmljZVVybCkuYWJzb2x1dGVUbyhkb2N1bWVudC5iYXNlVVJJKTtcblx0XHRcdHNTZXJ2ZXJVcmwgPSBuZXcgVVJJKFwiL1wiKS5hYnNvbHV0ZVRvKG9TZXJ2aWNlVVJJKS50b1N0cmluZygpO1xuXHRcdH1cblxuXHRcdGlmIChzU2VydmVyVXJsICYmIHNTZXJ2ZXJVcmwubGFzdEluZGV4T2YoXCIvXCIpID09PSBzU2VydmVyVXJsLmxlbmd0aCAtIDEpIHtcblx0XHRcdHNTZXJ2ZXJVcmwgPSBzU2VydmVyVXJsLnN1YnN0cigwLCBzU2VydmVyVXJsLmxlbmd0aCAtIDEpO1xuXHRcdH1cblxuXHRcdHJldHVybiBzU2VydmVyVXJsICsgb01vZGVsLnNTZXJ2aWNlVXJsICsgXCIvJG1ldGFkYXRhXCI7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIG1ldGhvZCB2ZXJpZmllcywgaWYgYW55IG9mIHRoZSBwYXNzZWQgcGFyYW1ldGVycy9maWx0ZXJzIGFyZSBtYXJrZWQgYXMgc2Vuc2l0aXZlLCBhbmQgaWYgdGhpcyBpcyB0aGUgY2FzZSByZW1vdmUgdGhvc2UgZnJvbSB0aGUgYXBwXG5cdCAqIGRhdGEuIDxiPk5vdGU6PC9iPiBUbyB1c2UgdGhpcyBtZXRob2QsIHRoZSBtZXRhZGF0YSBtdXN0IGJlIGxvYWRlZCBmaXJzdC5cblx0ICpcblx0ICogQHBhcmFtIG9EYXRhIFdpdGggcG90ZW50aWFsIHNlbnNpdGl2ZSBpbmZvcm1hdGlvbiAoZm9yIE9EYXRhLCBleHRlcm5hbCByZXByZXNlbnRhdGlvbiB1c2luZ1xuXHQgKiA8Y29kZT5vU2VsZWN0aW9uVmFyaWFudC50b0pTT05PYmplY3QoKTwvY29kZT4gbXVzdCBiZSB1c2VkKSwgd2l0aCB0aGUgPGNvZGU+RmlsdGVyQ29udGV4dFVybDwvY29kZT4gb3Jcblx0ICogPGNvZGU+UGFyYW1ldGVyQ29udGV4dFVybDwvY29kZT4gcHJvcGVydHkuXG5cdCAqIEByZXR1cm5zIERhdGEgd2l0aG91dCBwcm9wZXJ0aWVzIG1hcmtlZCBhcyBzZW5zaXRpdmUgb3IgYW4gZW1wdHkgb2JqZWN0IGlmIHRoZSBPRGF0YSBtZXRhZGF0YSBpcyBub3QgZnVsbHkgbG9hZGVkIHlldFxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X2NoZWNrSXNQb3RlbnRpYWxseVNlbnNpdGl2ZShvRGF0YTogYW55KSB7XG5cdFx0bGV0IG9BZGFwdGVkRGF0YSA9IG9EYXRhO1xuXHRcdGlmIChcblx0XHRcdG9EYXRhICYmXG5cdFx0XHRvRGF0YS5zZWxlY3Rpb25WYXJpYW50ICYmXG5cdFx0XHQoKG9EYXRhLnNlbGVjdGlvblZhcmlhbnQuRmlsdGVyQ29udGV4dFVybCAmJiBvRGF0YS5zZWxlY3Rpb25WYXJpYW50LlNlbGVjdE9wdGlvbnMpIHx8XG5cdFx0XHRcdChvRGF0YS5zZWxlY3Rpb25WYXJpYW50LlBhcmFtZXRlckNvbnRleHRVcmwgJiYgb0RhdGEuc2VsZWN0aW9uVmFyaWFudC5QYXJhbWV0ZXJzKSlcblx0XHQpIHtcblx0XHRcdGNvbnN0IG9Nb2RlbCA9IHRoaXMuX2dldE1vZGVsKCk7XG5cdFx0XHRpZiAodGhpcy5vQ29tcG9uZW50ICYmIG9Nb2RlbCAmJiBvTW9kZWwuaXNBPFYyT0RhdGFNb2RlbD4oXCJzYXAudWkubW9kZWwub2RhdGEudjIuT0RhdGFNb2RlbFwiKSkge1xuXHRcdFx0XHRjb25zdCBhU2Vuc2l0aXZlRmlsdGVyTmFtZSA9IFtdO1xuXHRcdFx0XHRjb25zdCBhU2Vuc2l0aXZlUGFyYW1ldGVyTmFtZSA9IFtdO1xuXHRcdFx0XHRsZXQgaSxcblx0XHRcdFx0XHRvRW50aXR5U2V0OiBhbnksXG5cdFx0XHRcdFx0b0VudGl0eURlZjogYW55LFxuXHRcdFx0XHRcdG9TdWJFbnRpdHlEZWY6IGFueSxcblx0XHRcdFx0XHRvRW5kUm9sZTogYW55LFxuXHRcdFx0XHRcdGFGaWx0ZXJDb250ZXh0UGFydCA9IFtdLFxuXHRcdFx0XHRcdGFQYXJhbUNvbnRleHRQYXJ0ID0gW107XG5cblx0XHRcdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG9Nb2RlbC5nZXRNZXRhTW9kZWwoKTtcblx0XHRcdFx0aWYgKG9Nb2RlbC5nZXRTZXJ2aWNlTWV0YWRhdGEoKSAmJiBvTWV0YU1vZGVsPy5vTW9kZWwpIHtcblx0XHRcdFx0XHRpZiAob0RhdGEuc2VsZWN0aW9uVmFyaWFudC5GaWx0ZXJDb250ZXh0VXJsKSB7XG5cdFx0XHRcdFx0XHRhRmlsdGVyQ29udGV4dFBhcnQgPSBvRGF0YS5zZWxlY3Rpb25WYXJpYW50LkZpbHRlckNvbnRleHRVcmwuc3BsaXQoXCIjXCIpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmIChcblx0XHRcdFx0XHRcdGFGaWx0ZXJDb250ZXh0UGFydC5sZW5ndGggPT09IDIgJiZcblx0XHRcdFx0XHRcdG9EYXRhLnNlbGVjdGlvblZhcmlhbnQuU2VsZWN0T3B0aW9ucyAmJlxuXHRcdFx0XHRcdFx0dGhpcy5fY29uc3RydWN0Q29udGV4dFVybChvTW9kZWwpLmluZGV4T2YoYUZpbHRlckNvbnRleHRQYXJ0WzBdKSA9PT0gMFxuXHRcdFx0XHRcdCkge1xuXHRcdFx0XHRcdFx0b0VudGl0eVNldCA9IG9NZXRhTW9kZWwuZ2V0T0RhdGFFbnRpdHlTZXQoYUZpbHRlckNvbnRleHRQYXJ0WzFdKTtcblx0XHRcdFx0XHRcdGlmIChvRW50aXR5U2V0KSB7XG5cdFx0XHRcdFx0XHRcdG9FbnRpdHlEZWYgPSBvTWV0YU1vZGVsLmdldE9EYXRhRW50aXR5VHlwZShvRW50aXR5U2V0LmVudGl0eVR5cGUpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0b0VudGl0eURlZiA9IG9NZXRhTW9kZWwuZ2V0T0RhdGFFbnRpdHlUeXBlKGFGaWx0ZXJDb250ZXh0UGFydFsxXSk7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGlmIChvRW50aXR5RGVmKSB7XG5cdFx0XHRcdFx0XHRcdGlmIChvRW50aXR5RGVmICYmIG9FbnRpdHlEZWYucHJvcGVydHkpIHtcblx0XHRcdFx0XHRcdFx0XHRmb3IgKGkgPSAwOyBpIDwgb0VudGl0eURlZi5wcm9wZXJ0eS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKHRoaXMuX2lzVG9CZUV4Y2x1ZGVkKG9FbnRpdHlEZWYucHJvcGVydHlbaV0pKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGFTZW5zaXRpdmVGaWx0ZXJOYW1lLnB1c2gob0VudGl0eURlZi5wcm9wZXJ0eVtpXS5uYW1lKTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRpZiAob0VudGl0eURlZi5uYXZpZ2F0aW9uUHJvcGVydHkpIHtcblx0XHRcdFx0XHRcdFx0XHRmb3IgKGkgPSAwOyBpIDwgb0VudGl0eURlZi5uYXZpZ2F0aW9uUHJvcGVydHkubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdFx0XHRcdG9FbmRSb2xlID0gb01ldGFNb2RlbC5nZXRPRGF0YUFzc29jaWF0aW9uRW5kKG9FbnRpdHlEZWYsIG9FbnRpdHlEZWYubmF2aWdhdGlvblByb3BlcnR5W2ldLm5hbWUpO1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKCFvRW5kUm9sZSB8fCBvRW5kUm9sZS50eXBlID09PSBvRGF0YS5zZWxlY3Rpb25WYXJpYW50LkZpbHRlckNvbnRleHRVcmwpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBjaGVjayBpZiB0aGUgZW5kIHJvbGUgaGFzIGNhcmRpbmFsaXR5IDAuLjEgb3IgMVxuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKG9FbmRSb2xlLm11bHRpcGxpY2l0eSA9PT0gXCIxXCIgfHwgb0VuZFJvbGUubXVsdGlwbGljaXR5ID09PSBcIjAuLjFcIikge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRvU3ViRW50aXR5RGVmID0gb01ldGFNb2RlbC5nZXRPRGF0YUVudGl0eVR5cGUob0VuZFJvbGUudHlwZSk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGlmIChvU3ViRW50aXR5RGVmICYmIG9TdWJFbnRpdHlEZWYucHJvcGVydHkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRmb3IgKGxldCBqID0gMDsgaiA8IG9TdWJFbnRpdHlEZWYucHJvcGVydHkubGVuZ3RoOyBqKyspIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlmICh0aGlzLl9pc1RvQmVFeGNsdWRlZChvU3ViRW50aXR5RGVmLnByb3BlcnR5W2pdKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRhU2Vuc2l0aXZlRmlsdGVyTmFtZS5wdXNoKFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdG9FbnRpdHlEZWYubmF2aWdhdGlvblByb3BlcnR5W2ldLm5hbWUgKyBcIi5cIiArIG9TdWJFbnRpdHlEZWYucHJvcGVydHlbal0ubmFtZVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmIChvRGF0YS5zZWxlY3Rpb25WYXJpYW50LlBhcmFtZXRlckNvbnRleHRVcmwpIHtcblx0XHRcdFx0XHRcdGFQYXJhbUNvbnRleHRQYXJ0ID0gb0RhdGEuc2VsZWN0aW9uVmFyaWFudC5QYXJhbWV0ZXJDb250ZXh0VXJsLnNwbGl0KFwiI1wiKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRhUGFyYW1Db250ZXh0UGFydC5sZW5ndGggPT09IDIgJiZcblx0XHRcdFx0XHRcdG9EYXRhLnNlbGVjdGlvblZhcmlhbnQuUGFyYW1ldGVycyAmJlxuXHRcdFx0XHRcdFx0dGhpcy5fY29uc3RydWN0Q29udGV4dFVybChvTW9kZWwpLmluZGV4T2YoYVBhcmFtQ29udGV4dFBhcnRbMF0pID09PSAwXG5cdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHRvRW50aXR5U2V0ID0gb01ldGFNb2RlbC5nZXRPRGF0YUVudGl0eVNldChhUGFyYW1Db250ZXh0UGFydFsxXSk7XG5cdFx0XHRcdFx0XHRpZiAob0VudGl0eVNldCkge1xuXHRcdFx0XHRcdFx0XHRvRW50aXR5RGVmID0gb01ldGFNb2RlbC5nZXRPRGF0YUVudGl0eVR5cGUob0VudGl0eVNldC5lbnRpdHlUeXBlKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdG9FbnRpdHlEZWYgPSBvTWV0YU1vZGVsLmdldE9EYXRhRW50aXR5VHlwZShhRmlsdGVyQ29udGV4dFBhcnRbMV0pO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRpZiAob0VudGl0eURlZikge1xuXHRcdFx0XHRcdFx0XHRpZiAob0VudGl0eURlZi5wcm9wZXJ0eSkge1xuXHRcdFx0XHRcdFx0XHRcdGZvciAoaSA9IDA7IGkgPCBvRW50aXR5RGVmLnByb3BlcnR5Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAodGhpcy5faXNUb0JlRXhjbHVkZWQob0VudGl0eURlZi5wcm9wZXJ0eVtpXSkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0YVNlbnNpdGl2ZVBhcmFtZXRlck5hbWUucHVzaChvRW50aXR5RGVmLnByb3BlcnR5W2ldLm5hbWUpO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmIChhU2Vuc2l0aXZlRmlsdGVyTmFtZS5sZW5ndGggfHwgYVNlbnNpdGl2ZVBhcmFtZXRlck5hbWUubGVuZ3RoKSB7XG5cdFx0XHRcdFx0XHRvQWRhcHRlZERhdGEgPSBleHRlbmQodHJ1ZSBhcyBhbnksIHt9LCBvQWRhcHRlZERhdGEpO1xuXG5cdFx0XHRcdFx0XHR0aGlzLl9yZW1vdmVQcm9wZXJ0aWVzKGFTZW5zaXRpdmVGaWx0ZXJOYW1lLCBhU2Vuc2l0aXZlUGFyYW1ldGVyTmFtZSwgb0FkYXB0ZWREYXRhKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gYW5ub3RhdGlvbnMgYXJlIG5vdCBsb2FkZWRcblxuXHRcdFx0XHRcdHRoaXMuX3JlbW92ZUFsbFByb3BlcnRpZXMob0FkYXB0ZWREYXRhKTtcblx0XHRcdFx0XHRMb2cuZXJyb3IoXCJOYXZpZ2F0aW9uSGFuZGxlcjogb01ldGFkYXRhIGFyZSBub3QgZnVsbHkgbG9hZGVkIVwiKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmICh0aGlzLm9Db21wb25lbnQgJiYgb01vZGVsICYmIG9Nb2RlbC5pc0EoXCJzYXAudWkubW9kZWwub2RhdGEudjQuT0RhdGFNb2RlbFwiKSkge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5fcmVtb3ZlU2Vuc2l0aXZlRGF0YUZvck9EYXRhVjQob0FkYXB0ZWREYXRhKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gb0FkYXB0ZWREYXRhO1xuXHR9XG5cblx0X3JlbW92ZU1lYXN1cmVCYXNlZEluZm9ybWF0aW9uKG9BcHBEYXRhOiBhbnkpIHtcblx0XHRsZXQgb0FwcERhdGFGb3JTYXZlID0gb0FwcERhdGE7XG5cblx0XHRpZiAob0FwcERhdGEuc2VsZWN0aW9uVmFyaWFudCkge1xuXHRcdFx0Lypcblx0XHRcdCAqIFRoZSBzcGVjaWZpY2F0aW9uIHN0YXRlcyB0aGF0IFNlbGVjdGlvbiBWYXJpYW50cyBuZWVkIHRvIGJlIEpTT04gb2JqZWN0cy4gSG93ZXZlciwgaW50ZXJuYWxseSwgd2Ugd29yayB3aXRoIHN0cmluZ3MgZm9yXG5cdFx0XHQgKiBcInNlbGVjdGlvblZhcmlhbnRcIi4gVGhlcmVmb3JlLCBpbiBjYXNlIHRoYXQgdGhpcyBpcyBhIHN0cmluZywgd2UgbmVlZCB0byBKU09OLXBhcnNlIHRoZSBkYXRhLlxuXHRcdFx0ICovXG5cdFx0XHRpZiAodHlwZW9mIG9BcHBEYXRhLnNlbGVjdGlvblZhcmlhbnQgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRvQXBwRGF0YUZvclNhdmUuc2VsZWN0aW9uVmFyaWFudCA9IEpTT04ucGFyc2Uob0FwcERhdGEuc2VsZWN0aW9uVmFyaWFudCk7XG5cdFx0XHRcdH0gY2F0Y2ggKHgpIHtcblx0XHRcdFx0XHRMb2cuZXJyb3IoXCJOYXZpZ2F0aW9uSGFuZGxlcjogX3JlbW92ZU1lYXN1cmVCYXNlZEluZm9ybWF0aW9uIHBhcnNlIGVycm9yXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdG9BcHBEYXRhRm9yU2F2ZSA9IHRoaXMuX3JlbW92ZU1lYXN1cmVCYXNlZFByb3BlcnRpZXMob0FwcERhdGFGb3JTYXZlKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gb0FwcERhdGFGb3JTYXZlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBtZXRob2QgdmVyaWZpZXMgaWYgYW55IG9mIHRoZSBwYXNzZWQgcGFyYW1ldGVycy9maWx0ZXJzIGFyZSBtYXJrZWQgYXMgYSBtZWFzdXJlLiBJZiB0aGlzIGlzIHRoZSBjYXNlLCB0aGV5IGFyZSByZW1vdmVkIGZyb20gdGhlIHhhcHBcblx0ICogYXBwIGRhdGEuIDxiPk5vdGU6PC9iPiBUbyB1c2UgdGhpcyBtZXRob2QsIHRoZSBtZXRhZGF0YSBtdXN0IGJlIGxvYWRlZCBmaXJzdC5cblx0ICpcblx0ICogQHBhcmFtIG9EYXRhIFdpdGggcG90ZW50aWFsIHNlbnNpdGl2ZSBpbmZvcm1hdGlvbiAoZm9yIE9EYXRhLCBleHRlcm5hbCByZXByZXNlbnRhdGlvbiB1c2luZ1xuXHQgKiA8Y29kZT5vU2VsZWN0aW9uVmFyaWFudC50b0pTT05PYmplY3QoKTwvY29kZT4gbXVzdCBiZSB1c2VkKSwgd2l0aCB0aGUgPGNvZGU+RmlsdGVyQ29udGV4dFVybDwvY29kZT4gb3Jcblx0ICogPGNvZGU+UGFyYW1ldGVyQ29udGV4dFVybDwvY29kZT4gcHJvcGVydHkuXG5cdCAqIEByZXR1cm5zIERhdGEgd2l0aG91dCBwcm9wZXJ0aWVzIG1hcmtlZCBhcyBtZWFzdXJlcyBvciBhbiBlbXB0eSBvYmplY3QgaWYgdGhlIE9EYXRhIG1ldGFkYXRhIGlzIG5vdCBmdWxseSBsb2FkZWQgeWV0XG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfcmVtb3ZlTWVhc3VyZUJhc2VkUHJvcGVydGllcyhvRGF0YTogYW55KSB7XG5cdFx0bGV0IG9BZGFwdGVkRGF0YSA9IG9EYXRhO1xuXHRcdGNvbnN0IGFNZWFzdXJlRmlsdGVyTmFtZSA9IFtdO1xuXHRcdGNvbnN0IGFNZWFzdXJlUGFyYW1ldGVyTmFtZSA9IFtdO1xuXHRcdGxldCBpLFxuXHRcdFx0b01vZGVsLFxuXHRcdFx0b01ldGFNb2RlbCxcblx0XHRcdG9FbnRpdHlTZXQ6IGFueSxcblx0XHRcdG9FbnRpdHlEZWY6IGFueSxcblx0XHRcdG9TdWJFbnRpdHlEZWY6IGFueSxcblx0XHRcdG9FbmRSb2xlOiBhbnksXG5cdFx0XHRhRmlsdGVyQ29udGV4dFBhcnQgPSBbXSxcblx0XHRcdGFQYXJhbUNvbnRleHRQYXJ0ID0gW107XG5cblx0XHRpZiAoXG5cdFx0XHRvRGF0YSAmJlxuXHRcdFx0b0RhdGEuc2VsZWN0aW9uVmFyaWFudCAmJlxuXHRcdFx0KChvRGF0YS5zZWxlY3Rpb25WYXJpYW50LkZpbHRlckNvbnRleHRVcmwgJiYgb0RhdGEuc2VsZWN0aW9uVmFyaWFudC5TZWxlY3RPcHRpb25zKSB8fFxuXHRcdFx0XHQob0RhdGEuc2VsZWN0aW9uVmFyaWFudC5QYXJhbWV0ZXJDb250ZXh0VXJsICYmIG9EYXRhLnNlbGVjdGlvblZhcmlhbnQuUGFyYW1ldGVycykpXG5cdFx0KSB7XG5cdFx0XHRvTW9kZWwgPSB0aGlzLl9nZXRNb2RlbCgpO1xuXHRcdFx0aWYgKHRoaXMub0NvbXBvbmVudCAmJiBvTW9kZWwgJiYgb01vZGVsLmlzQTxWMk9EYXRhTW9kZWw+KFwic2FwLnVpLm1vZGVsLm9kYXRhLnYyLk9EYXRhTW9kZWxcIikpIHtcblx0XHRcdFx0b01ldGFNb2RlbCA9IG9Nb2RlbC5nZXRNZXRhTW9kZWwoKTtcblx0XHRcdFx0aWYgKG9Nb2RlbC5nZXRTZXJ2aWNlTWV0YWRhdGEoKSAmJiBvTWV0YU1vZGVsICYmIG9NZXRhTW9kZWwub01vZGVsKSB7XG5cdFx0XHRcdFx0aWYgKG9EYXRhLnNlbGVjdGlvblZhcmlhbnQuRmlsdGVyQ29udGV4dFVybCkge1xuXHRcdFx0XHRcdFx0YUZpbHRlckNvbnRleHRQYXJ0ID0gb0RhdGEuc2VsZWN0aW9uVmFyaWFudC5GaWx0ZXJDb250ZXh0VXJsLnNwbGl0KFwiI1wiKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRhRmlsdGVyQ29udGV4dFBhcnQubGVuZ3RoID09PSAyICYmXG5cdFx0XHRcdFx0XHRvRGF0YS5zZWxlY3Rpb25WYXJpYW50LlNlbGVjdE9wdGlvbnMgJiZcblx0XHRcdFx0XHRcdHRoaXMuX2NvbnN0cnVjdENvbnRleHRVcmwob01vZGVsKS5pbmRleE9mKGFGaWx0ZXJDb250ZXh0UGFydFswXSkgPT09IDBcblx0XHRcdFx0XHQpIHtcblx0XHRcdFx0XHRcdG9FbnRpdHlTZXQgPSBvTWV0YU1vZGVsLmdldE9EYXRhRW50aXR5U2V0KGFGaWx0ZXJDb250ZXh0UGFydFsxXSk7XG5cdFx0XHRcdFx0XHRpZiAob0VudGl0eVNldCkge1xuXHRcdFx0XHRcdFx0XHRvRW50aXR5RGVmID0gb01ldGFNb2RlbC5nZXRPRGF0YUVudGl0eVR5cGUob0VudGl0eVNldC5lbnRpdHlUeXBlKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdG9FbnRpdHlEZWYgPSBvTWV0YU1vZGVsLmdldE9EYXRhRW50aXR5VHlwZShhRmlsdGVyQ29udGV4dFBhcnRbMV0pO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRpZiAob0VudGl0eURlZikge1xuXHRcdFx0XHRcdFx0XHRpZiAob0VudGl0eURlZiAmJiBvRW50aXR5RGVmLnByb3BlcnR5KSB7XG5cdFx0XHRcdFx0XHRcdFx0Zm9yIChpID0gMDsgaSA8IG9FbnRpdHlEZWYucHJvcGVydHkubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdFx0XHRcdGlmICh0aGlzLl9pc01lYXN1cmVQcm9wZXJ0eShvRW50aXR5RGVmLnByb3BlcnR5W2ldKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRhTWVhc3VyZUZpbHRlck5hbWUucHVzaChvRW50aXR5RGVmLnByb3BlcnR5W2ldLm5hbWUpO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGlmIChvRW50aXR5RGVmLm5hdmlnYXRpb25Qcm9wZXJ0eSkge1xuXHRcdFx0XHRcdFx0XHRcdGZvciAoaSA9IDA7IGkgPCBvRW50aXR5RGVmLm5hdmlnYXRpb25Qcm9wZXJ0eS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFx0XHRcdFx0b0VuZFJvbGUgPSBvTWV0YU1vZGVsLmdldE9EYXRhQXNzb2NpYXRpb25FbmQob0VudGl0eURlZiwgb0VudGl0eURlZi5uYXZpZ2F0aW9uUHJvcGVydHlbaV0ubmFtZSk7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoIW9FbmRSb2xlIHx8IG9FbmRSb2xlLnR5cGUgPT09IG9EYXRhLnNlbGVjdGlvblZhcmlhbnQuRmlsdGVyQ29udGV4dFVybCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdC8vIGNoZWNrIGlmIHRoZSBlbmQgcm9sZSBoYXMgY2FyZGluYWxpdHkgMC4uMSBvciAxXG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAob0VuZFJvbGUubXVsdGlwbGljaXR5ID09PSBcIjFcIiB8fCBvRW5kUm9sZS5tdWx0aXBsaWNpdHkgPT09IFwiMC4uMVwiKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdG9TdWJFbnRpdHlEZWYgPSBvTWV0YU1vZGVsLmdldE9EYXRhRW50aXR5VHlwZShvRW5kUm9sZS50eXBlKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKG9TdWJFbnRpdHlEZWYgJiYgb1N1YkVudGl0eURlZi5wcm9wZXJ0eSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGZvciAobGV0IGogPSAwOyBqIDwgb1N1YkVudGl0eURlZi5wcm9wZXJ0eS5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKHRoaXMuX2lzTWVhc3VyZVByb3BlcnR5KG9TdWJFbnRpdHlEZWYucHJvcGVydHlbal0pKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGFNZWFzdXJlRmlsdGVyTmFtZS5wdXNoKFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdG9FbnRpdHlEZWYubmF2aWdhdGlvblByb3BlcnR5W2ldLm5hbWUgKyBcIi5cIiArIG9TdWJFbnRpdHlEZWYucHJvcGVydHlbal0ubmFtZVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmIChvRGF0YS5zZWxlY3Rpb25WYXJpYW50LlBhcmFtZXRlckNvbnRleHRVcmwpIHtcblx0XHRcdFx0XHRcdGFQYXJhbUNvbnRleHRQYXJ0ID0gb0RhdGEuc2VsZWN0aW9uVmFyaWFudC5QYXJhbWV0ZXJDb250ZXh0VXJsLnNwbGl0KFwiI1wiKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRhUGFyYW1Db250ZXh0UGFydC5sZW5ndGggPT09IDIgJiZcblx0XHRcdFx0XHRcdG9EYXRhLnNlbGVjdGlvblZhcmlhbnQuUGFyYW1ldGVycyAmJlxuXHRcdFx0XHRcdFx0dGhpcy5fY29uc3RydWN0Q29udGV4dFVybChvTW9kZWwpLmluZGV4T2YoYVBhcmFtQ29udGV4dFBhcnRbMF0pID09PSAwXG5cdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHRvRW50aXR5U2V0ID0gb01ldGFNb2RlbC5nZXRPRGF0YUVudGl0eVNldChhUGFyYW1Db250ZXh0UGFydFsxXSk7XG5cdFx0XHRcdFx0XHRpZiAob0VudGl0eVNldCkge1xuXHRcdFx0XHRcdFx0XHRvRW50aXR5RGVmID0gb01ldGFNb2RlbC5nZXRPRGF0YUVudGl0eVR5cGUob0VudGl0eVNldC5lbnRpdHlUeXBlKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdG9FbnRpdHlEZWYgPSBvTWV0YU1vZGVsLmdldE9EYXRhRW50aXR5VHlwZShhRmlsdGVyQ29udGV4dFBhcnRbMV0pO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRpZiAob0VudGl0eURlZikge1xuXHRcdFx0XHRcdFx0XHRpZiAob0VudGl0eURlZi5wcm9wZXJ0eSkge1xuXHRcdFx0XHRcdFx0XHRcdGZvciAoaSA9IDA7IGkgPCBvRW50aXR5RGVmLnByb3BlcnR5Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAodGhpcy5faXNNZWFzdXJlUHJvcGVydHkob0VudGl0eURlZi5wcm9wZXJ0eVtpXSkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0YU1lYXN1cmVQYXJhbWV0ZXJOYW1lLnB1c2gob0VudGl0eURlZi5wcm9wZXJ0eVtpXS5uYW1lKTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoYU1lYXN1cmVGaWx0ZXJOYW1lLmxlbmd0aCB8fCBhTWVhc3VyZVBhcmFtZXRlck5hbWUubGVuZ3RoKSB7XG5cdFx0XHRcdFx0XHQvLyBUUTogbmVlZHMgYXR0ZW50aW9uXG5cdFx0XHRcdFx0XHRvQWRhcHRlZERhdGEgPSBleHRlbmQodHJ1ZSBhcyBhbnksIHt9LCBvQWRhcHRlZERhdGEpO1xuXG5cdFx0XHRcdFx0XHR0aGlzLl9yZW1vdmVQcm9wZXJ0aWVzKGFNZWFzdXJlRmlsdGVyTmFtZSwgYU1lYXN1cmVQYXJhbWV0ZXJOYW1lLCBvQWRhcHRlZERhdGEpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyBhbm5vdGF0aW9ucyBhcmUgbm90IGxvYWRlZFxuXG5cdFx0XHRcdFx0dGhpcy5fcmVtb3ZlQWxsUHJvcGVydGllcyhvQWRhcHRlZERhdGEpO1xuXHRcdFx0XHRcdExvZy5lcnJvcihcIk5hdmlnYXRpb25IYW5kbGVyOiBvTWV0YWRhdGEgYXJlIG5vdCBmdWxseSBsb2FkZWQhXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYgKHRoaXMub0NvbXBvbmVudCAmJiBvTW9kZWwgJiYgb01vZGVsLmlzQShcInNhcC51aS5tb2RlbC5vZGF0YS52NC5PRGF0YU1vZGVsXCIpKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLl9yZW1vdmVTZW5zaXRpdmVEYXRhRm9yT0RhdGFWNChvQWRhcHRlZERhdGEsIHRydWUpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gb0FkYXB0ZWREYXRhO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZXMgc2Vuc2l0aXZlIGRhdGEgZnJvbSB0aGUgbmF2aWdhdGlvbiBjb250ZXh0LlxuXHQgKlxuXHQgKiBAcGFyYW0gb0RhdGEgU2VsZWN0aW9uIHZhcmlhbnRcblx0ICogQHBhcmFtIGJNZWFzdXJlIFNob3VsZCBtZWFzdXJlcyBiZSByZW1vdmVkXG5cdCAqIEByZXR1cm5zIFRoZSBzZWxlY3Rpb24gdmFyaWFudCBhZnRlciBzZW5zaXRpdmUgZGF0YSBoYXMgYmVlbiByZW1vdmVkXG5cdCAqL1xuXHRfcmVtb3ZlU2Vuc2l0aXZlRGF0YUZvck9EYXRhVjQob0RhdGE6IGFueSwgYk1lYXN1cmU/OiBib29sZWFuKSB7XG5cdFx0Y29uc3Qgb05hdkhhbmRsZXIgPSB0aGlzLFxuXHRcdFx0b1NWID0gbmV3IFNlbGVjdGlvblZhcmlhbnQob0RhdGEuc2VsZWN0aW9uVmFyaWFudCksXG5cdFx0XHRvTW9kZWwgPSB0aGlzLl9nZXRNb2RlbCgpO1xuXHRcdGxldCBhRmlsdGVyQ29udGV4dFBhcnQ6IHN0cmluZ1tdIHwgdW5kZWZpbmVkO1xuXG5cdFx0aWYgKCFvTW9kZWwuZ2V0TWV0YU1vZGVsKCkuZ2V0T2JqZWN0KFwiL1wiKSkge1xuXHRcdFx0Ly8gYW5ub3RhdGlvbnMgYXJlIG5vdCBsb2FkZWRcblx0XHRcdHRoaXMuX3JlbW92ZUFsbFByb3BlcnRpZXMob0RhdGEpO1xuXHRcdFx0TG9nLmVycm9yKFwiTmF2aWdhdGlvbkhhbmRsZXI6IG9NZXRhZGF0YSBhcmUgbm90IGZ1bGx5IGxvYWRlZCFcIik7XG5cdFx0XHRyZXR1cm4gb0RhdGE7XG5cdFx0fVxuXG5cdFx0aWYgKG9EYXRhLnNlbGVjdGlvblZhcmlhbnQuRmlsdGVyQ29udGV4dFVybCkge1xuXHRcdFx0YUZpbHRlckNvbnRleHRQYXJ0ID0gb0RhdGEuc2VsZWN0aW9uVmFyaWFudC5GaWx0ZXJDb250ZXh0VXJsLnNwbGl0KFwiI1wiKTtcblx0XHR9XG5cblx0XHRpZiAoXG5cdFx0XHRhRmlsdGVyQ29udGV4dFBhcnQ/Lmxlbmd0aCA9PT0gMiAmJlxuXHRcdFx0b0RhdGEuc2VsZWN0aW9uVmFyaWFudC5TZWxlY3RPcHRpb25zICYmXG5cdFx0XHR0aGlzLl9jb25zdHJ1Y3RDb250ZXh0VXJsKG9Nb2RlbCkuaW5kZXhPZihhRmlsdGVyQ29udGV4dFBhcnRbMF0pID09PSAwXG5cdFx0KSB7XG5cdFx0XHRvU1YucmVtb3ZlU2VsZWN0T3B0aW9uKFwiQG9kYXRhLmNvbnRleHRcIik7XG5cdFx0XHRvU1YucmVtb3ZlU2VsZWN0T3B0aW9uKFwiQG9kYXRhLm1ldGFkYXRhRXRhZ1wiKTtcblx0XHRcdG9TVi5yZW1vdmVTZWxlY3RPcHRpb24oXCJTQVBfX01lc3NhZ2VzXCIpO1xuXG5cdFx0XHRjb25zdCBzRW50aXR5U2V0ID0gYUZpbHRlckNvbnRleHRQYXJ0WzFdLFxuXHRcdFx0XHRvTWV0YU1vZGVsID0gb01vZGVsLmdldE1ldGFNb2RlbCgpLFxuXHRcdFx0XHRhUHJvcGVydHlOYW1lcyA9IG9TVi5nZXRQcm9wZXJ0eU5hbWVzKCkgfHwgW10sXG5cdFx0XHRcdGZuSXNTZW5zaXRpdmVEYXRhID0gZnVuY3Rpb24gKHNQcm9wOiBhbnksIGVzTmFtZTogYW55KSB7XG5cdFx0XHRcdFx0ZXNOYW1lID0gZXNOYW1lIHx8IHNFbnRpdHlTZXQ7XG5cdFx0XHRcdFx0Y29uc3QgYVByb3BlcnR5QW5ub3RhdGlvbnMgPSBvTWV0YU1vZGVsLmdldE9iamVjdChcIi9cIiArIGVzTmFtZSArIFwiL1wiICsgc1Byb3AgKyBcIkBcIik7XG5cdFx0XHRcdFx0aWYgKGFQcm9wZXJ0eUFubm90YXRpb25zKSB7XG5cdFx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRcdChiTWVhc3VyZSAmJiBhUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5BbmFseXRpY3MudjEuTWVhc3VyZVwiXSkgfHxcblx0XHRcdFx0XHRcdFx0b05hdkhhbmRsZXIuX2NoZWNrUHJvcGVydHlBbm5vdGF0aW9uc0ZvclNlbnNpdGl2ZURhdGEoYVByb3BlcnR5QW5ub3RhdGlvbnMpXG5cdFx0XHRcdFx0XHQpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0XHR9IGVsc2UgaWYgKGFQcm9wZXJ0eUFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5GaWVsZENvbnRyb2xcIl0pIHtcblx0XHRcdFx0XHRcdFx0Y29uc3Qgb0ZpZWxkQ29udHJvbCA9IGFQcm9wZXJ0eUFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5GaWVsZENvbnRyb2xcIl07XG5cdFx0XHRcdFx0XHRcdGlmIChvRmllbGRDb250cm9sW1wiJEVudW1NZW1iZXJcIl0gJiYgb0ZpZWxkQ29udHJvbFtcIiRFbnVtTWVtYmVyXCJdLnNwbGl0KFwiL1wiKVsxXSA9PT0gXCJJbmFwcGxpY2FibGVcIikge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fTtcblxuXHRcdFx0Zm9yIChsZXQgayA9IDA7IGsgPCBhUHJvcGVydHlOYW1lcy5sZW5ndGg7IGsrKykge1xuXHRcdFx0XHRjb25zdCBzUHJvcGVydHkgPSBhUHJvcGVydHlOYW1lc1trXTtcblx0XHRcdFx0Ly8gcHJvcGVydGllcyBvZiB0aGUgZW50aXR5IHNldFxuXHRcdFx0XHRpZiAoZm5Jc1NlbnNpdGl2ZURhdGEoc1Byb3BlcnR5LCBzRW50aXR5U2V0KSkge1xuXHRcdFx0XHRcdG9TVi5yZW1vdmVTZWxlY3RPcHRpb24oc1Byb3BlcnR5KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0b0RhdGEuc2VsZWN0aW9uVmFyaWFudCA9IG9TVi50b0pTT05PYmplY3QoKTtcblx0XHR9XG5cdFx0cmV0dXJuIG9EYXRhO1xuXHR9XG5cblx0X2NoZWNrUHJvcGVydHlBbm5vdGF0aW9uc0ZvclNlbnNpdGl2ZURhdGEoYVByb3BlcnR5QW5ub3RhdGlvbnM6IGFueSkge1xuXHRcdHJldHVybiAoXG5cdFx0XHRhUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5QZXJzb25hbERhdGEudjEuSXNQb3RlbnRpYWxseVNlbnNpdGl2ZVwiXSB8fFxuXHRcdFx0YVByb3BlcnR5QW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRXhjbHVkZUZyb21OYXZpZ2F0aW9uQ29udGV4dFwiXVxuXHRcdCk7XG5cdH1cbn1cblxuLy8gRXhwb3J0aW5nIHRoZSBjbGFzcyBhcyBwcm9wZXJseSB0eXBlZCBVSTVDbGFzc1xuXG5jb25zdCBOYXZpZ2F0aW9uSGFuZGxlclVJNUNsYXNzID0gQmFzZU9iamVjdC5leHRlbmQoXG5cdFwic2FwLmZlLm5hdmlnYXRpb24uTmF2aWdhdGlvbkhhbmRsZXJcIixcblx0TmF2aWdhdGlvbkhhbmRsZXIucHJvdG90eXBlIGFzIGFueVxuKSBhcyB0eXBlb2YgTmF2aWdhdGlvbkhhbmRsZXI7XG50eXBlIE5hdmlnYXRpb25IYW5kbGVyVUk1Q2xhc3MgPSBJbnN0YW5jZVR5cGU8dHlwZW9mIE5hdmlnYXRpb25IYW5kbGVyPjtcbmV4cG9ydCBkZWZhdWx0IE5hdmlnYXRpb25IYW5kbGVyVUk1Q2xh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