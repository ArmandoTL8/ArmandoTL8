/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/ModelHelper", "sap/m/library", "sap/ui/Device", "sap/ui/mdc/enum/EditMode", "sap/ui/model/Context", "sap/ui/model/odata/v4/AnnotationHelper"], function (Log, CommonUtils, BindingToolkit, ModelHelper, mLibrary, Device, EditMode, Context, ODataModelAnnotationHelper) {
  "use strict";

  var system = Device.system;
  var ref = BindingToolkit.ref;
  var fn = BindingToolkit.fn;
  var compileExpression = BindingToolkit.compileExpression;
  const ValueColor = mLibrary.ValueColor;
  const CommonHelper = {
    getPathToKey: function (oCtx) {
      return oCtx.getObject();
    },
    /**
     * Determines if a field is visible.
     *
     * @param target Target instance
     * @param oInterface Interface instance
     * @returns Returns true, false, or expression with path
     */
    isVisible: function (target, oInterface) {
      const oModel = oInterface.context.getModel(),
        sPropertyPath = oInterface.context.getPath(),
        oAnnotations = oModel.getObject(`${sPropertyPath}@`),
        hidden = oAnnotations["@com.sap.vocabularies.UI.v1.Hidden"];
      return typeof hidden === "object" ? "{= !${" + hidden.$Path + "} }" : !hidden;
    },
    /**
     * Determine if the action opens up a dialog.
     *
     * @param oActionContext
     * @param oInterface
     * @returns `Dialog` | `None` if a dialog is needed
     */
    isDialog: function (oActionContext, oInterface) {
      const oModel = oInterface.context.getModel(),
        sPropertyPath = oInterface.context.getPath(),
        isCritical = oModel.getObject(`${sPropertyPath}/@$ui5.overload@com.sap.vocabularies.Common.v1.IsActionCritical`);
      if (isCritical) {
        return "Dialog";
      } else if (oActionContext) {
        const oAction = Array.isArray(oActionContext) ? oActionContext[0] : oActionContext;
        if (oAction.$Parameter && oAction.$Parameter.length > 1) {
          return "Dialog";
        } else {
          return "None";
        }
      }
      return undefined;
    },
    /**
     * Determine if field is editable.
     *
     * @param target Target instance
     * @param oInterface Interface instance
     * @returns A Binding Expression to determine if a field should be editable or not.
     */
    getParameterEditMode: function (target, oInterface) {
      const oModel = oInterface.context.getModel(),
        sPropertyPath = oInterface.context.getPath(),
        oAnnotations = oModel.getObject(`${sPropertyPath}@`),
        fieldControl = oAnnotations["@com.sap.vocabularies.Common.v1.FieldControl"],
        immutable = oAnnotations["@Org.OData.Core.V1.Immutable"],
        computed = oAnnotations["@Org.OData.Core.V1.Computed"];
      let sEditMode = EditMode.Editable;
      if (immutable || computed) {
        sEditMode = EditMode.ReadOnly;
      } else if (fieldControl) {
        if (fieldControl.$EnumMember) {
          if (fieldControl.$EnumMember === "com.sap.vocabularies.Common.v1.FieldControlType/ReadOnly") {
            sEditMode = EditMode.ReadOnly;
          }
          if (fieldControl.$EnumMember === "com.sap.vocabularies.Common.v1.FieldControlType/Inapplicable" || fieldControl.$EnumMember === "com.sap.vocabularies.Common.v1.FieldControlType/Hidden") {
            sEditMode = EditMode.Disabled;
          }
        }
        if (fieldControl.$Path) {
          sEditMode = "{= %{" + fieldControl.$Path + "} < 3 ? (%{" + fieldControl.$Path + "} === 0 ? '" + EditMode.Disabled + "' : '" + EditMode.ReadOnly + "') : '" + EditMode.Editable + "'}";
        }
      }
      return sEditMode;
    },
    /**
     * Get the complete metapath to the target.
     *
     * @param target
     * @param oInterface
     * @returns The metapath
     */
    getMetaPath: function (target, oInterface) {
      return oInterface && oInterface.context && oInterface.context.getPath() || undefined;
    },
    isDesktop: function () {
      return system.desktop === true;
    },
    getTargetCollection: function (oContext, navCollection) {
      let sPath = oContext.getPath();
      if (oContext.getMetadata().getName() === "sap.ui.model.Context" && (oContext.getObject("$kind") === "EntitySet" || oContext.getObject("$ContainsTarget") === true)) {
        return sPath;
      }
      if (oContext.getModel) {
        sPath = oContext.getModel().getMetaPath && oContext.getModel().getMetaPath(sPath) || oContext.getModel().getMetaModel().getMetaPath(sPath);
      }
      //Supporting sPath of any format, either '/<entitySet>/<navigationCollection>' <OR> '/<entitySet>/$Type/<navigationCollection>'
      const aParts = sPath.split("/").filter(function (sPart) {
        return sPart && sPart != "$Type";
      }); //filter out empty strings and parts referring to '$Type'
      const entitySet = `/${aParts[0]}`;
      if (aParts.length === 1) {
        return entitySet;
      }
      const navigationCollection = navCollection === undefined ? aParts.slice(1).join("/$NavigationPropertyBinding/") : navCollection;
      return `${entitySet}/$NavigationPropertyBinding/${navigationCollection}`; // used in gotoTargetEntitySet method in the same file
    },

    isPropertyFilterable: function (context, oDataField) {
      const oModel = context.getModel(),
        sPropertyPath = context.getPath(),
        // LoacationPath would be the prefix of sPropertyPath, example: sPropertyPath = '/Customer/Set/Name' -> sPropertyLocationPath = '/Customer/Set'
        sPropertyLocationPath = CommonHelper.getLocationForPropertyPath(oModel, sPropertyPath),
        sProperty = sPropertyPath.replace(`${sPropertyLocationPath}/`, "");
      if (oDataField && (oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction" || oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation")) {
        return false;
      }
      return CommonUtils.isPropertyFilterable(oModel, sPropertyLocationPath, sProperty);
    },
    getLocationForPropertyPath: function (oModel, sPropertyPath) {
      let iLength;
      let sCollectionPath = sPropertyPath.slice(0, sPropertyPath.lastIndexOf("/"));
      if (oModel.getObject(`${sCollectionPath}/$kind`) === "EntityContainer") {
        iLength = sCollectionPath.length + 1;
        sCollectionPath = sPropertyPath.slice(iLength, sPropertyPath.indexOf("/", iLength));
      }
      return sCollectionPath;
    },
    gotoActionParameter: function (oContext) {
      const sPath = oContext.getPath(),
        sPropertyName = oContext.getObject(`${sPath}/$Name`);
      return CommonUtils.getParameterPath(sPath, sPropertyName);
    },
    /**
     * Returns the entity set name from the entity type name.
     *
     * @param oMetaModel OData v4 metamodel instance
     * @param sEntityType EntityType of the actiom
     * @returns The EntitySet of the bound action
     * @private
     * @ui5-restricted
     */
    getEntitySetName: function (oMetaModel, sEntityType) {
      const oEntityContainer = oMetaModel.getObject("/");
      for (const key in oEntityContainer) {
        if (typeof oEntityContainer[key] === "object" && oEntityContainer[key].$Type === sEntityType) {
          return key;
        }
      }
      return undefined;
    },
    /**
     * Returns the metamodel path correctly for bound actions if used with bReturnOnlyPath as true,
     * else returns an object which has 3 properties related to the action. They are the entity set name,
     * the $Path value of the OperationAvailable annotation and the binding parameter name. If
     * bCheckStaticValue is true, returns the static value of OperationAvailable annotation, if present.
     * e.g. for bound action someNameSpace.SomeBoundAction
     * of entity set SomeEntitySet, the string "/SomeEntitySet/someNameSpace.SomeBoundAction" is returned.
     *
     * @param oAction The context object of the action
     * @param bReturnOnlyPath If false, additional info is returned along with metamodel path to the bound action
     * @param sActionName The name of the bound action of the form someNameSpace.SomeBoundAction
     * @param bCheckStaticValue If true, the static value of OperationAvailable is returned, if present
     * @returns The string or object as specified by bReturnOnlyPath
     * @private
     * @ui5-restricted
     */
    getActionPath: function (oAction, bReturnOnlyPath, sActionName, bCheckStaticValue) {
      let sContextPath = oAction.getPath().split("/@")[0];
      sActionName = !sActionName ? oAction.getObject(oAction.getPath()) : sActionName;
      if (sActionName && sActionName.indexOf("(") > -1) {
        // action bound to another entity type
        sActionName = sActionName.split("(")[0];
      } else if (oAction.getObject(sContextPath)) {
        // TODO: this logic sounds wrong, to be corrected
        const sEntityTypeName = oAction.getObject(sContextPath).$Type;
        const sEntityName = this.getEntitySetName(oAction.getModel(), sEntityTypeName);
        if (sEntityName) {
          sContextPath = `/${sEntityName}`;
        }
      } else {
        return sContextPath;
      }
      if (bCheckStaticValue) {
        return oAction.getObject(`${sContextPath}/${sActionName}@Org.OData.Core.V1.OperationAvailable`);
      }
      if (bReturnOnlyPath) {
        return `${sContextPath}/${sActionName}`;
      } else {
        return {
          sContextPath: sContextPath,
          sProperty: oAction.getObject(`${sContextPath}/${sActionName}@Org.OData.Core.V1.OperationAvailable/$Path`),
          sBindingParameter: oAction.getObject(`${sContextPath}/${sActionName}/@$ui5.overload/0/$Parameter/0/$Name`)
        };
      }
    },
    getNavigationContext: function (oContext) {
      return ODataModelAnnotationHelper.getNavigationPath(oContext.getPath());
    },
    /**
     * Returns the path without the entity type (potentially first) and property (last) part (optional).
     * The result can be an empty string if it is a simple direct property.
     *
     * If and only if the given property path starts with a slash (/), it is considered that the entity type
     * is part of the path and will be stripped away.
     *
     * @param sPropertyPath
     * @param bKeepProperty
     * @returns The navigation path
     */
    getNavigationPath: function (sPropertyPath, bKeepProperty) {
      const bStartsWithEntityType = sPropertyPath.startsWith("/");
      const aParts = sPropertyPath.split("/").filter(function (part) {
        return !!part;
      });
      if (bStartsWithEntityType) {
        aParts.shift();
      }
      if (!bKeepProperty) {
        aParts.pop();
      }
      return aParts.join("/");
    },
    /**
     * Returns the correct metamodel path for bound actions.
     *
     * Since this method is called irrespective of the action type, this will be applied to unbound actions.
     * In such a case, if an incorrect path is returned, it is ignored during templating.
     *
     * Example: for the bound action someNameSpace.SomeBoundAction of entity set SomeEntitySet,
     * the string "/SomeEntitySet/someNameSpace.SomeBoundAction" is returned.
     *
     * @function
     * @static
     * @name sap.fe.macros.CommonHelper.getActionContext
     * @memberof sap.fe.macros.CommonHelper
     * @param oAction Context object for the action
     * @returns Correct metamodel path for bound and incorrect path for unbound actions
     * @private
     * @ui5-restricted
     */
    getActionContext: function (oAction) {
      return CommonHelper.getActionPath(oAction, true);
    },
    /**
     * Returns the metamodel path correctly for overloaded bound actions. For unbound actions,
     * the incorrect path is returned, but ignored during templating.
     * e.g. for bound action someNameSpace.SomeBoundAction of entity set SomeEntitySet,
     * the string "/SomeEntitySet/someNameSpace.SomeBoundAction/@$ui5.overload/0" is returned.
     *
     * @function
     * @static
     * @name sap.fe.macros.CommonHelper.getPathToBoundActionOverload
     * @memberof sap.fe.macros.CommonHelper
     * @param oAction The context object for the action
     * @returns The correct metamodel path for bound action overload and incorrect path for unbound actions
     * @private
     * @ui5-restricted
     */
    getPathToBoundActionOverload: function (oAction) {
      const sPath = CommonHelper.getActionPath(oAction, true);
      return `${sPath}/@$ui5.overload/0`;
    },
    /**
     * Returns the string with single quotes.
     *
     * @function
     * @memberof sap.fe.macros.CommonHelper
     * @param sValue Some string that needs to be converted into single quotes
     * @param [bEscape] Should the string be escaped beforehand
     * @returns - String with single quotes
     */
    addSingleQuotes: function (sValue, bEscape) {
      if (bEscape && sValue) {
        sValue = this.escapeSingleQuotes(sValue);
      }
      return `'${sValue}'`;
    },
    /**
     * Returns the string with escaped single quotes.
     *
     * @function
     * @memberof sap.fe.macros.CommonHelper
     * @param sValue Some string that needs escaping of single quotes
     * @returns - String with escaped single quotes
     */
    escapeSingleQuotes: function (sValue) {
      return sValue.replace(/[']/g, "\\'");
    },
    /**
     * Returns the function string
     * The first argument of generateFunction is name of the generated function string.
     * Remaining arguments of generateFunction are arguments of the newly generated function string.
     *
     * @function
     * @memberof sap.fe.macros.CommonHelper
     * @param sFuncName Some string for the function name
     * @param args The remaining arguments
     * @returns - Function string depends on arguments passed
     */
    generateFunction: function (sFuncName) {
      let sParams = "";
      for (let i = 0; i < (arguments.length <= 1 ? 0 : arguments.length - 1); i++) {
        sParams += i + 1 < 1 || arguments.length <= i + 1 ? undefined : arguments[i + 1];
        if (i < (arguments.length <= 1 ? 0 : arguments.length - 1) - 1) {
          sParams += ", ";
        }
      }
      let sFunction = `${sFuncName}()`;
      if (sParams) {
        sFunction = `${sFuncName}(${sParams})`;
      }
      return sFunction;
    },
    /*
     * Returns the visibility expression for datapoint title/link
     *
     * @function
     * @param {string} [sPath] annotation path of data point or Microchart
     * @param {boolean} [bLink] true if link visibility is being determined, false if title visibility is being determined
     * @param {boolean} [bFieldVisibility] true if field is vsiible, false otherwise
     * @returns  {string} sVisibilityExp Used to get the  visibility binding for DataPoints title in the Header.
     *
     */

    getHeaderDataPointLinkVisibility: function (sPath, bLink, bFieldVisibility) {
      let sVisibilityExp;
      if (bFieldVisibility) {
        sVisibilityExp = bLink ? "{= ${internal>isHeaderDPLinkVisible/" + sPath + "} === true && " + bFieldVisibility + "}" : "{= ${internal>isHeaderDPLinkVisible/" + sPath + "} !== true && " + bFieldVisibility + "}";
      } else {
        sVisibilityExp = bLink ? "{= ${internal>isHeaderDPLinkVisible/" + sPath + "} === true}" : "{= ${internal>isHeaderDPLinkVisible/" + sPath + "} !== true}";
      }
      return sVisibilityExp;
    },
    /**
     * Converts object to string(different from JSON.stringify or.toString).
     *
     * @function
     * @memberof sap.fe.macros.CommonHelper
     * @param oParams Some object
     * @returns - Object string
     */
    objectToString: function (oParams) {
      let iNumberOfKeys = Object.keys(oParams).length,
        sParams = "";
      for (const sKey in oParams) {
        let sValue = oParams[sKey];
        if (sValue && typeof sValue === "object") {
          sValue = this.objectToString(sValue);
        }
        sParams += `${sKey}: ${sValue}`;
        if (iNumberOfKeys > 1) {
          --iNumberOfKeys;
          sParams += ", ";
        }
      }
      return `{ ${sParams}}`;
    },
    /**
     * Removes escape characters (\) from an expression.
     *
     * @function
     * @memberof sap.fe.macros.CommonHelper
     * @param sExpression An expression with escape characters
     * @returns Expression string without escape characters or undefined
     */
    removeEscapeCharacters: function (sExpression) {
      return sExpression ? sExpression.replace(/\\?\\([{}])/g, "$1") : undefined;
    },
    /**
     * Makes updates to a stringified object so that it works properly in a template by adding ui5Object:true.
     *
     * @param sStringified
     * @returns The updated string representation of the object
     */
    stringifyObject: function (sStringified) {
      if (!sStringified) {
        return undefined;
      } else {
        const oObject = JSON.parse(sStringified);
        if (typeof oObject === "object" && !Array.isArray(oObject)) {
          const oUI5Object = {
            ui5object: true
          };
          Object.assign(oUI5Object, oObject);
          return JSON.stringify(oUI5Object);
        } else {
          const sType = Array.isArray(oObject) ? "Array" : typeof oObject;
          Log.error(`Unexpected object type in stringifyObject (${sType}) - only works with object`);
          throw new Error("stringifyObject only works with objects!");
        }
      }
    },
    /**
     * Create a string representation of the given data, taking care that it is not treated as a binding expression.
     *
     * @param vData The data to stringify
     * @returns The string representation of the data.
     */
    stringifyCustomData: function (vData) {
      const oObject = {
        ui5object: true
      };
      oObject["customData"] = vData instanceof Context ? vData.getObject() : vData;
      return JSON.stringify(oObject);
    },
    /**
     * Parses the given data, potentially unwraps the data.
     *
     * @param vData The data to parse
     * @returns The result of the data parsing
     */
    parseCustomData: function (vData) {
      vData = typeof vData === "string" ? JSON.parse(vData) : vData;
      if (vData && vData.hasOwnProperty("customData")) {
        return vData["customData"];
      }
      return vData;
    },
    getContextPath: function (oValue, oInterface) {
      const sPath = oInterface && oInterface.context && oInterface.context.getPath();
      return sPath[sPath.length - 1] === "/" ? sPath.slice(0, -1) : sPath;
    },
    /**
     * Returns a stringified JSON object containing  Presentation Variant sort conditions.
     *
     * @param oContext
     * @param oPresentationVariant Presentation variant Annotation
     * @param sPresentationVariantPath
     * @returns Stringified JSON object
     */
    getSortConditions: function (oContext, oPresentationVariant, sPresentationVariantPath) {
      if (oPresentationVariant && CommonHelper._isPresentationVariantAnnotation(sPresentationVariantPath) && oPresentationVariant.SortOrder) {
        const aSortConditions = {
          sorters: []
        };
        const sEntityPath = oContext.getPath(0).split("@")[0];
        oPresentationVariant.SortOrder.forEach(function () {
          let oCondition = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          let oSortProperty = {};
          const oSorter = {};
          if (oCondition.DynamicProperty) {
            var _oContext$getModel$ge;
            oSortProperty = (_oContext$getModel$ge = oContext.getModel(0).getObject(sEntityPath + oCondition.DynamicProperty.$AnnotationPath)) === null || _oContext$getModel$ge === void 0 ? void 0 : _oContext$getModel$ge.Name;
          } else if (oCondition.Property) {
            oSortProperty = oCondition.Property.$PropertyPath;
          }
          if (oSortProperty) {
            oSorter.name = oSortProperty;
            oSorter.descending = !!oCondition.Descending;
            aSortConditions.sorters.push(oSorter);
          } else {
            throw new Error("Please define the right path to the sort property");
          }
        });
        return JSON.stringify(aSortConditions);
      }
      return undefined;
    },
    _isPresentationVariantAnnotation: function (sAnnotationPath) {
      return sAnnotationPath.indexOf("@com.sap.vocabularies.UI.v1.PresentationVariant") > -1 || sAnnotationPath.indexOf("@com.sap.vocabularies.UI.v1.SelectionPresentationVariant") > -1;
    },
    createPresentationPathContext: function (oPresentationContext) {
      const aPaths = oPresentationContext.sPath.split("@") || [];
      const oModel = oPresentationContext.getModel();
      if (aPaths.length && aPaths[aPaths.length - 1].indexOf("com.sap.vocabularies.UI.v1.SelectionPresentationVariant") > -1) {
        const sPath = oPresentationContext.sPath.split("/PresentationVariant")[0];
        return oModel.createBindingContext(`${sPath}@sapui.name`);
      }
      return oModel.createBindingContext(`${oPresentationContext.sPath}@sapui.name`);
    },
    getPressHandlerForDataFieldForIBN: function (oDataField, sContext, bNavigateWithConfirmationDialog) {
      const mNavigationParameters = {
        navigationContexts: sContext ? sContext : "${$source>/}.getBindingContext()"
      };
      if (oDataField.RequiresContext && !oDataField.Inline && bNavigateWithConfirmationDialog) {
        mNavigationParameters.applicableContexts = "${internal>ibn/" + oDataField.SemanticObject + "-" + oDataField.Action + "/aApplicable/}";
        mNavigationParameters.notApplicableContexts = "${internal>ibn/" + oDataField.SemanticObject + "-" + oDataField.Action + "/aNotApplicable/}";
        mNavigationParameters.label = this.addSingleQuotes(oDataField.Label, true);
      }
      if (oDataField.Mapping) {
        mNavigationParameters.semanticObjectMapping = this.addSingleQuotes(JSON.stringify(oDataField.Mapping));
      }
      return this.generateFunction(bNavigateWithConfirmationDialog ? "._intentBasedNavigation.navigateWithConfirmationDialog" : "._intentBasedNavigation.navigate", this.addSingleQuotes(oDataField.SemanticObject), this.addSingleQuotes(oDataField.Action), this.objectToString(mNavigationParameters));
    },
    getEntitySet: function (oContext) {
      const sPath = oContext.getPath();
      return ModelHelper.getEntitySetPath(sPath);
    },
    /**
     * Handles the visibility of form menu actions both in path based and static value scenarios.
     *
     * @function
     * @memberof sap.fe.macros.CommonHelper
     * @param sVisibleValue Either static boolean values or Array of path expressions for visibility of menu button.
     * @returns The binding expression determining the visibility of menu actions.
     */
    handleVisibilityOfMenuActions: function (sVisibleValue) {
      const combinedConditions = [];
      if (Array.isArray(sVisibleValue)) {
        for (let i = 0; i < sVisibleValue.length; i++) {
          if (sVisibleValue[i].indexOf("{") > -1 && sVisibleValue[i].indexOf("{=") === -1) {
            sVisibleValue[i] = "{=" + sVisibleValue[i] + "}";
          }
          if (sVisibleValue[i].split("{=").length > 0) {
            sVisibleValue[i] = sVisibleValue[i].split("{=")[1].slice(0, -1);
          }
          combinedConditions.push(`(${sVisibleValue[i]})`);
        }
      }
      return combinedConditions.length > 0 ? `{= ${combinedConditions.join(" || ")}}` : sVisibleValue;
    },
    /**
     * Method to do the calculation of criticality in case CriticalityCalculation present in the annotation
     *
     * The calculation is done by comparing a value to the threshold values relevant for the specified improvement direction.
     * For improvement direction Target, the criticality is calculated using both low and high threshold values. It will be
     *
     * - Positive if the value is greater than or equal to AcceptanceRangeLowValue and lower than or equal to AcceptanceRangeHighValue
     * - Neutral if the value is greater than or equal to ToleranceRangeLowValue and lower than AcceptanceRangeLowValue OR greater than AcceptanceRangeHighValue and lower than or equal to ToleranceRangeHighValue
     * - Critical if the value is greater than or equal to DeviationRangeLowValue and lower than ToleranceRangeLowValue OR greater than ToleranceRangeHighValue and lower than or equal to DeviationRangeHighValue
     * - Negative if the value is lower than DeviationRangeLowValue or greater than DeviationRangeHighValue
     *
     * For improvement direction Minimize, the criticality is calculated using the high threshold values. It is
     * - Positive if the value is lower than or equal to AcceptanceRangeHighValue
     * - Neutral if the value is greater than AcceptanceRangeHighValue and lower than or equal to ToleranceRangeHighValue
     * - Critical if the value is greater than ToleranceRangeHighValue and lower than or equal to DeviationRangeHighValue
     * - Negative if the value is greater than DeviationRangeHighValue
     *
     * For improvement direction Maximize, the criticality is calculated using the low threshold values. It is
     *
     * - Positive if the value is greater than or equal to AcceptanceRangeLowValue
     * - Neutral if the value is less than AcceptanceRangeLowValue and greater than or equal to ToleranceRangeLowValue
     * - Critical if the value is lower than ToleranceRangeLowValue and greater than or equal to DeviationRangeLowValue
     * - Negative if the value is lower than DeviationRangeLowValue
     *
     * Thresholds are optional. For unassigned values, defaults are determined in this order:
     *
     * - For DeviationRange, an omitted LowValue translates into the smallest possible number (-INF), an omitted HighValue translates into the largest possible number (+INF)
     * - For ToleranceRange, an omitted LowValue will be initialized with DeviationRangeLowValue, an omitted HighValue will be initialized with DeviationRangeHighValue
     * - For AcceptanceRange, an omitted LowValue will be initialized with ToleranceRangeLowValue, an omitted HighValue will be initialized with ToleranceRangeHighValue.
     *
     * @param sImprovementDirection ImprovementDirection to be used for creating the criticality binding
     * @param sValue Value from Datapoint to be measured
     * @param sDeviationLow ExpressionBinding for Lower Deviation level
     * @param sToleranceLow ExpressionBinding for Lower Tolerance level
     * @param sAcceptanceLow ExpressionBinding for Lower Acceptance level
     * @param sAcceptanceHigh ExpressionBinding for Higher Acceptance level
     * @param sToleranceHigh ExpressionBinding for Higher Tolerance level
     * @param sDeviationHigh ExpressionBinding for Higher Deviation level
     * @returns Returns criticality calculation as expression binding
     */
    getCriticalityCalculationBinding: function (sImprovementDirection, sValue, sDeviationLow, sToleranceLow, sAcceptanceLow, sAcceptanceHigh, sToleranceHigh, sDeviationHigh) {
      let sCriticalityExpression = ValueColor.Neutral; // Default Criticality State

      sValue = `%${sValue}`;

      // Setting Unassigned Values
      sDeviationLow = sDeviationLow || -Infinity;
      sToleranceLow = sToleranceLow || sDeviationLow;
      sAcceptanceLow = sAcceptanceLow || sToleranceLow;
      sDeviationHigh = sDeviationHigh || Infinity;
      sToleranceHigh = sToleranceHigh || sDeviationHigh;
      sAcceptanceHigh = sAcceptanceHigh || sToleranceHigh;

      // Dealing with Decimal and Path based bingdings
      sDeviationLow = sDeviationLow && (+sDeviationLow ? +sDeviationLow : `%${sDeviationLow}`);
      sToleranceLow = sToleranceLow && (+sToleranceLow ? +sToleranceLow : `%${sToleranceLow}`);
      sAcceptanceLow = sAcceptanceLow && (+sAcceptanceLow ? +sAcceptanceLow : `%${sAcceptanceLow}`);
      sAcceptanceHigh = sAcceptanceHigh && (+sAcceptanceHigh ? +sAcceptanceHigh : `%${sAcceptanceHigh}`);
      sToleranceHigh = sToleranceHigh && (+sToleranceHigh ? +sToleranceHigh : `%${sToleranceHigh}`);
      sDeviationHigh = sDeviationHigh && (+sDeviationHigh ? +sDeviationHigh : `%${sDeviationHigh}`);

      // Creating runtime expression binding from criticality calculation for Criticality State
      if (sImprovementDirection.indexOf("Minimize") > -1) {
        sCriticalityExpression = "{= " + sValue + " <= " + sAcceptanceHigh + " ? '" + ValueColor.Good + "' : " + sValue + " <= " + sToleranceHigh + " ? '" + ValueColor.Neutral + "' : " + "(" + sDeviationHigh + " && " + sValue + " <= " + sDeviationHigh + ") ? '" + ValueColor.Critical + "' : '" + ValueColor.Error + "' }";
      } else if (sImprovementDirection.indexOf("Maximize") > -1) {
        sCriticalityExpression = "{= " + sValue + " >= " + sAcceptanceLow + " ? '" + ValueColor.Good + "' : " + sValue + " >= " + sToleranceLow + " ? '" + ValueColor.Neutral + "' : " + "(" + sDeviationLow + " && " + sValue + " >= " + sDeviationLow + ") ? '" + ValueColor.Critical + "' : '" + ValueColor.Error + "' }";
      } else if (sImprovementDirection.indexOf("Target") > -1) {
        sCriticalityExpression = "{= (" + sValue + " <= " + sAcceptanceHigh + " && " + sValue + " >= " + sAcceptanceLow + ") ? '" + ValueColor.Good + "' : " + "((" + sValue + " >= " + sToleranceLow + " && " + sValue + " < " + sAcceptanceLow + ") || (" + sValue + " > " + sAcceptanceHigh + " && " + sValue + " <= " + sToleranceHigh + ")) ? '" + ValueColor.Neutral + "' : " + "((" + sDeviationLow + " && (" + sValue + " >= " + sDeviationLow + ") && (" + sValue + " < " + sToleranceLow + ")) || ((" + sValue + " > " + sToleranceHigh + ") && " + sDeviationHigh + " && (" + sValue + " <= " + sDeviationHigh + "))) ? '" + ValueColor.Critical + "' : '" + ValueColor.Error + "' }";
      } else {
        Log.warning("Case not supported, returning the default Value Neutral");
      }
      return sCriticalityExpression;
    },
    /**
     * This function returns the criticality indicator from annotations if criticality is EnumMember.
     *
     * @param sCriticality Criticality provided in the annotations
     * @returns Return the indicator for criticality
     * @private
     */
    _getCriticalityFromEnum: function (sCriticality) {
      let sIndicator;
      if (sCriticality === "com.sap.vocabularies.UI.v1.CriticalityType/Negative") {
        sIndicator = ValueColor.Error;
      } else if (sCriticality === "com.sap.vocabularies.UI.v1.CriticalityType/Positive") {
        sIndicator = ValueColor.Good;
      } else if (sCriticality === "com.sap.vocabularies.UI.v1.CriticalityType/Critical") {
        sIndicator = ValueColor.Critical;
      } else {
        sIndicator = ValueColor.Neutral;
      }
      return sIndicator;
    },
    getValueCriticality: function (sDimension, aValueCriticality) {
      let sResult;
      const aValues = [];
      if (aValueCriticality && aValueCriticality.length > 0) {
        aValueCriticality.forEach(function (oVC) {
          if (oVC.Value && oVC.Criticality.$EnumMember) {
            const sValue = "${" + sDimension + "} === '" + oVC.Value + "' ? '" + CommonHelper._getCriticalityFromEnum(oVC.Criticality.$EnumMember) + "'";
            aValues.push(sValue);
          }
        });
        sResult = aValues.length > 0 && aValues.join(" : ") + " : undefined";
      }
      return sResult ? "{= " + sResult + " }" : undefined;
    },
    /**
     * To fetch measure attribute index.
     *
     * @param iMeasure Chart Annotations
     * @param oChartAnnotations Chart Annotations
     * @returns MeasureAttribute index.
     * @private
     */
    getMeasureAttributeIndex: function (iMeasure, oChartAnnotations) {
      var _oChartAnnotations$Me, _oChartAnnotations$Dy;
      let aMeasures, sMeasurePropertyPath;
      if ((oChartAnnotations === null || oChartAnnotations === void 0 ? void 0 : (_oChartAnnotations$Me = oChartAnnotations.Measures) === null || _oChartAnnotations$Me === void 0 ? void 0 : _oChartAnnotations$Me.length) > 0) {
        aMeasures = oChartAnnotations.Measures;
        sMeasurePropertyPath = aMeasures[iMeasure].$PropertyPath;
      } else if ((oChartAnnotations === null || oChartAnnotations === void 0 ? void 0 : (_oChartAnnotations$Dy = oChartAnnotations.DynamicMeasures) === null || _oChartAnnotations$Dy === void 0 ? void 0 : _oChartAnnotations$Dy.length) > 0) {
        aMeasures = oChartAnnotations.DynamicMeasures;
        sMeasurePropertyPath = aMeasures[iMeasure].$AnnotationPath;
      }
      let bMeasureAttributeExists;
      const aMeasureAttributes = oChartAnnotations.MeasureAttributes;
      let iMeasureAttribute = -1;
      const fnCheckMeasure = function (sMeasurePath, oMeasureAttribute, index) {
        if (oMeasureAttribute) {
          if (oMeasureAttribute.Measure && oMeasureAttribute.Measure.$PropertyPath === sMeasurePath) {
            iMeasureAttribute = index;
            return true;
          } else if (oMeasureAttribute.DynamicMeasure && oMeasureAttribute.DynamicMeasure.$AnnotationPath === sMeasurePath) {
            iMeasureAttribute = index;
            return true;
          }
        }
      };
      if (aMeasureAttributes) {
        bMeasureAttributeExists = aMeasureAttributes.some(fnCheckMeasure.bind(null, sMeasurePropertyPath));
      }
      return bMeasureAttributeExists && iMeasureAttribute > -1 && iMeasureAttribute;
    },
    getMeasureAttribute: function (oContext) {
      const oMetaModel = oContext.getModel(),
        sChartAnnotationPath = oContext.getPath();
      return oMetaModel.requestObject(sChartAnnotationPath).then(function (oChartAnnotations) {
        const aMeasureAttributes = oChartAnnotations.MeasureAttributes,
          iMeasureAttribute = CommonHelper.getMeasureAttributeIndex(0, oChartAnnotations);
        const sMeasureAttributePath = iMeasureAttribute > -1 && aMeasureAttributes[iMeasureAttribute] && aMeasureAttributes[iMeasureAttribute].DataPoint ? `${sChartAnnotationPath}/MeasureAttributes/${iMeasureAttribute}/` : undefined;
        if (sMeasureAttributePath === undefined) {
          Log.warning("DataPoint missing for the measure");
        }
        return sMeasureAttributePath ? `${sMeasureAttributePath}DataPoint/$AnnotationPath/` : sMeasureAttributePath;
      });
    },
    /**
     * This function returns the measureAttribute for the measure.
     *
     * @param oContext Context to the measure annotation
     * @returns Path to the measureAttribute of the measure
     */
    getMeasureAttributeForMeasure: function (oContext) {
      const oMetaModel = oContext.getModel(),
        sMeasurePath = oContext.getPath(),
        sChartAnnotationPath = sMeasurePath.substring(0, sMeasurePath.lastIndexOf("Measure")),
        iMeasure = sMeasurePath.replace(/.*\//, "");
      return oMetaModel.requestObject(sChartAnnotationPath).then(function (oChartAnnotations) {
        const aMeasureAttributes = oChartAnnotations.MeasureAttributes,
          iMeasureAttribute = CommonHelper.getMeasureAttributeIndex(iMeasure, oChartAnnotations);
        const sMeasureAttributePath = iMeasureAttribute > -1 && aMeasureAttributes[iMeasureAttribute] && aMeasureAttributes[iMeasureAttribute].DataPoint ? `${sChartAnnotationPath}MeasureAttributes/${iMeasureAttribute}/` : undefined;
        if (sMeasureAttributePath === undefined) {
          Log.warning("DataPoint missing for the measure");
        }
        return sMeasureAttributePath ? `${sMeasureAttributePath}DataPoint/$AnnotationPath/` : sMeasureAttributePath;
      });
    },
    /**
     * Method to determine if the contained navigation property has a draft root/node parent entitySet.
     *
     * @function
     * @name isDraftParentEntityForContainment
     * @param oTargetCollectionContainsTarget Target collection has ContainsTarget property
     * @param oTableMetadata Table metadata for which draft support shall be checked
     * @returns Returns true if draft
     */
    isDraftParentEntityForContainment: function (oTargetCollectionContainsTarget, oTableMetadata) {
      if (oTargetCollectionContainsTarget) {
        if (oTableMetadata && oTableMetadata.parentEntitySet && oTableMetadata.parentEntitySet.sPath) {
          const sParentEntitySetPath = oTableMetadata.parentEntitySet.sPath;
          const oDraftRoot = oTableMetadata.parentEntitySet.oModel.getObject(`${sParentEntitySetPath}@com.sap.vocabularies.Common.v1.DraftRoot`);
          const oDraftNode = oTableMetadata.parentEntitySet.oModel.getObject(`${sParentEntitySetPath}@com.sap.vocabularies.Common.v1.DraftNode`);
          if (oDraftRoot || oDraftNode) {
            return true;
          } else {
            return false;
          }
        }
      }
      return false;
    },
    /**
     * Ensures the data is processed as defined in the template.
     * Since the property Data is of the type 'object', it may not be in the same order as required by the template.
     *
     * @function
     * @memberof sap.fe.macros.CommonHelper
     * @param dataElement The data that is currently being processed.
     * @returns The correct path according to the template.
     */
    getDataFromTemplate: function (dataElement) {
      const splitPath = dataElement.getPath().split("/");
      const dataKey = splitPath[splitPath.length - 1];
      const connectedDataPath = `/${splitPath.slice(1, -2).join("/")}/@`;
      const connectedObject = dataElement.getObject(connectedDataPath);
      const template = connectedObject.Template;
      const splitTemp = template.split("}");
      const tempArray = [];
      for (let i = 0; i < splitTemp.length - 1; i++) {
        const key = splitTemp[i].split("{")[1].trim();
        tempArray.push(key);
      }
      Object.keys(connectedObject.Data).forEach(function (sKey) {
        if (sKey.startsWith("$")) {
          delete connectedObject.Data[sKey];
        }
      });
      const index = Object.keys(connectedObject.Data).indexOf(dataKey);
      return `/${splitPath.slice(1, -2).join("/")}/Data/${tempArray[index]}`;
    },
    /**
     * Checks if the end of the template has been reached.
     *
     * @function
     * @memberof sap.fe.macros.CommonHelper
     * @param target The target of the connected fields.
     * @param element The element that is currently being processed.
     * @returns True or False (depending on the template index).
     */
    notLastIndex: function (target, element) {
      const template = target.Template;
      const splitTemp = template.split("}");
      const tempArray = [];
      let isLastIndex = false;
      for (let i = 0; i < splitTemp.length - 1; i++) {
        const dataKey = splitTemp[i].split("{")[1].trim();
        tempArray.push(dataKey);
      }
      tempArray.forEach(function (templateInfo) {
        if (target.Data[templateInfo] === element && tempArray.indexOf(templateInfo) !== tempArray.length - 1) {
          isLastIndex = true;
        }
      });
      return isLastIndex;
    },
    /**
     * Determines the delimiter from the template.
     *
     * @function
     * @memberof sap.fe.macros.CommonHelper
     * @param template The template string.
     * @returns The delimiter in the template string.
     */
    getDelimiter: function (template) {
      return template.split("}")[1].split("{")[0].trim();
    },
    oMetaModel: undefined,
    setMetaModel: function (oMetaModel) {
      this.oMetaModel = oMetaModel;
    },
    getMetaModel: function (oContext, oInterface) {
      if (oContext) {
        return oInterface.context.getModel();
      }
      return this.oMetaModel;
    },
    getParameters: function (oContext, oInterface) {
      if (oContext) {
        const oMetaModel = oInterface.context.getModel();
        const sPath = oInterface.context.getPath();
        const oParameterInfo = CommonUtils.getParameterInfo(oMetaModel, sPath);
        if (oParameterInfo.parameterProperties) {
          return Object.keys(oParameterInfo.parameterProperties);
        }
      }
      return [];
    },
    /**
     * Build an expression calling an action handler via the FPM helper's actionWrapper function
     *
     * This function assumes that the 'FPM.actionWrapper()' function is available at runtime.
     *
     * @param oAction Action metadata
     * @param oAction.handlerModule Module containing the action handler method
     * @param oAction.handlerMethod Action handler method name
     * @param [oThis] `this` (if the function is called from a macro)
     * @param oThis.id The table's ID
     * @returns The action wrapper binding	expression
     */
    buildActionWrapper: function (oAction, oThis) {
      const aParams = [ref("$event"), oAction.handlerModule, oAction.handlerMethod];
      if (oThis && oThis.id) {
        const oAdditionalParams = {
          contexts: ref("${internal>selectedContexts}")
        };
        aParams.push(oAdditionalParams);
      }
      return compileExpression(fn("FPM.actionWrapper", aParams));
    },
    /**
     * Returns the value whether or not the element should be visible depending on the Hidden annotation.
     * It is inverted as the UI elements have a visible property instead of an hidden one.
     *
     * @param dataFieldAnnotations The dataField Object
     * @returns A path or a boolean
     */
    getHiddenPathExpression: function (dataFieldAnnotations) {
      if (dataFieldAnnotations["@com.sap.vocabularies.UI.v1.Hidden"] !== null) {
        const hidden = dataFieldAnnotations["@com.sap.vocabularies.UI.v1.Hidden"];
        return typeof hidden === "object" ? "{= !${" + hidden.$Path + "} }" : !hidden;
      }
      return true;
    }
  };
  CommonHelper.getSortConditions.requiresIContext = true;
  return CommonHelper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWYWx1ZUNvbG9yIiwibUxpYnJhcnkiLCJDb21tb25IZWxwZXIiLCJnZXRQYXRoVG9LZXkiLCJvQ3R4IiwiZ2V0T2JqZWN0IiwiaXNWaXNpYmxlIiwidGFyZ2V0Iiwib0ludGVyZmFjZSIsIm9Nb2RlbCIsImNvbnRleHQiLCJnZXRNb2RlbCIsInNQcm9wZXJ0eVBhdGgiLCJnZXRQYXRoIiwib0Fubm90YXRpb25zIiwiaGlkZGVuIiwiJFBhdGgiLCJpc0RpYWxvZyIsIm9BY3Rpb25Db250ZXh0IiwiaXNDcml0aWNhbCIsIm9BY3Rpb24iLCJBcnJheSIsImlzQXJyYXkiLCIkUGFyYW1ldGVyIiwibGVuZ3RoIiwidW5kZWZpbmVkIiwiZ2V0UGFyYW1ldGVyRWRpdE1vZGUiLCJmaWVsZENvbnRyb2wiLCJpbW11dGFibGUiLCJjb21wdXRlZCIsInNFZGl0TW9kZSIsIkVkaXRNb2RlIiwiRWRpdGFibGUiLCJSZWFkT25seSIsIiRFbnVtTWVtYmVyIiwiRGlzYWJsZWQiLCJnZXRNZXRhUGF0aCIsImlzRGVza3RvcCIsInN5c3RlbSIsImRlc2t0b3AiLCJnZXRUYXJnZXRDb2xsZWN0aW9uIiwib0NvbnRleHQiLCJuYXZDb2xsZWN0aW9uIiwic1BhdGgiLCJnZXRNZXRhZGF0YSIsImdldE5hbWUiLCJnZXRNZXRhTW9kZWwiLCJhUGFydHMiLCJzcGxpdCIsImZpbHRlciIsInNQYXJ0IiwiZW50aXR5U2V0IiwibmF2aWdhdGlvbkNvbGxlY3Rpb24iLCJzbGljZSIsImpvaW4iLCJpc1Byb3BlcnR5RmlsdGVyYWJsZSIsIm9EYXRhRmllbGQiLCJzUHJvcGVydHlMb2NhdGlvblBhdGgiLCJnZXRMb2NhdGlvbkZvclByb3BlcnR5UGF0aCIsInNQcm9wZXJ0eSIsInJlcGxhY2UiLCIkVHlwZSIsIkNvbW1vblV0aWxzIiwiaUxlbmd0aCIsInNDb2xsZWN0aW9uUGF0aCIsImxhc3RJbmRleE9mIiwiaW5kZXhPZiIsImdvdG9BY3Rpb25QYXJhbWV0ZXIiLCJzUHJvcGVydHlOYW1lIiwiZ2V0UGFyYW1ldGVyUGF0aCIsImdldEVudGl0eVNldE5hbWUiLCJvTWV0YU1vZGVsIiwic0VudGl0eVR5cGUiLCJvRW50aXR5Q29udGFpbmVyIiwia2V5IiwiZ2V0QWN0aW9uUGF0aCIsImJSZXR1cm5Pbmx5UGF0aCIsInNBY3Rpb25OYW1lIiwiYkNoZWNrU3RhdGljVmFsdWUiLCJzQ29udGV4dFBhdGgiLCJzRW50aXR5VHlwZU5hbWUiLCJzRW50aXR5TmFtZSIsInNCaW5kaW5nUGFyYW1ldGVyIiwiZ2V0TmF2aWdhdGlvbkNvbnRleHQiLCJPRGF0YU1vZGVsQW5ub3RhdGlvbkhlbHBlciIsImdldE5hdmlnYXRpb25QYXRoIiwiYktlZXBQcm9wZXJ0eSIsImJTdGFydHNXaXRoRW50aXR5VHlwZSIsInN0YXJ0c1dpdGgiLCJwYXJ0Iiwic2hpZnQiLCJwb3AiLCJnZXRBY3Rpb25Db250ZXh0IiwiZ2V0UGF0aFRvQm91bmRBY3Rpb25PdmVybG9hZCIsImFkZFNpbmdsZVF1b3RlcyIsInNWYWx1ZSIsImJFc2NhcGUiLCJlc2NhcGVTaW5nbGVRdW90ZXMiLCJnZW5lcmF0ZUZ1bmN0aW9uIiwic0Z1bmNOYW1lIiwic1BhcmFtcyIsImkiLCJzRnVuY3Rpb24iLCJnZXRIZWFkZXJEYXRhUG9pbnRMaW5rVmlzaWJpbGl0eSIsImJMaW5rIiwiYkZpZWxkVmlzaWJpbGl0eSIsInNWaXNpYmlsaXR5RXhwIiwib2JqZWN0VG9TdHJpbmciLCJvUGFyYW1zIiwiaU51bWJlck9mS2V5cyIsIk9iamVjdCIsImtleXMiLCJzS2V5IiwicmVtb3ZlRXNjYXBlQ2hhcmFjdGVycyIsInNFeHByZXNzaW9uIiwic3RyaW5naWZ5T2JqZWN0Iiwic1N0cmluZ2lmaWVkIiwib09iamVjdCIsIkpTT04iLCJwYXJzZSIsIm9VSTVPYmplY3QiLCJ1aTVvYmplY3QiLCJhc3NpZ24iLCJzdHJpbmdpZnkiLCJzVHlwZSIsIkxvZyIsImVycm9yIiwiRXJyb3IiLCJzdHJpbmdpZnlDdXN0b21EYXRhIiwidkRhdGEiLCJDb250ZXh0IiwicGFyc2VDdXN0b21EYXRhIiwiaGFzT3duUHJvcGVydHkiLCJnZXRDb250ZXh0UGF0aCIsIm9WYWx1ZSIsImdldFNvcnRDb25kaXRpb25zIiwib1ByZXNlbnRhdGlvblZhcmlhbnQiLCJzUHJlc2VudGF0aW9uVmFyaWFudFBhdGgiLCJfaXNQcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbiIsIlNvcnRPcmRlciIsImFTb3J0Q29uZGl0aW9ucyIsInNvcnRlcnMiLCJzRW50aXR5UGF0aCIsImZvckVhY2giLCJvQ29uZGl0aW9uIiwib1NvcnRQcm9wZXJ0eSIsIm9Tb3J0ZXIiLCJEeW5hbWljUHJvcGVydHkiLCIkQW5ub3RhdGlvblBhdGgiLCJOYW1lIiwiUHJvcGVydHkiLCIkUHJvcGVydHlQYXRoIiwibmFtZSIsImRlc2NlbmRpbmciLCJEZXNjZW5kaW5nIiwicHVzaCIsInNBbm5vdGF0aW9uUGF0aCIsImNyZWF0ZVByZXNlbnRhdGlvblBhdGhDb250ZXh0Iiwib1ByZXNlbnRhdGlvbkNvbnRleHQiLCJhUGF0aHMiLCJjcmVhdGVCaW5kaW5nQ29udGV4dCIsImdldFByZXNzSGFuZGxlckZvckRhdGFGaWVsZEZvcklCTiIsInNDb250ZXh0IiwiYk5hdmlnYXRlV2l0aENvbmZpcm1hdGlvbkRpYWxvZyIsIm1OYXZpZ2F0aW9uUGFyYW1ldGVycyIsIm5hdmlnYXRpb25Db250ZXh0cyIsIlJlcXVpcmVzQ29udGV4dCIsIklubGluZSIsImFwcGxpY2FibGVDb250ZXh0cyIsIlNlbWFudGljT2JqZWN0IiwiQWN0aW9uIiwibm90QXBwbGljYWJsZUNvbnRleHRzIiwibGFiZWwiLCJMYWJlbCIsIk1hcHBpbmciLCJzZW1hbnRpY09iamVjdE1hcHBpbmciLCJnZXRFbnRpdHlTZXQiLCJNb2RlbEhlbHBlciIsImdldEVudGl0eVNldFBhdGgiLCJoYW5kbGVWaXNpYmlsaXR5T2ZNZW51QWN0aW9ucyIsInNWaXNpYmxlVmFsdWUiLCJjb21iaW5lZENvbmRpdGlvbnMiLCJnZXRDcml0aWNhbGl0eUNhbGN1bGF0aW9uQmluZGluZyIsInNJbXByb3ZlbWVudERpcmVjdGlvbiIsInNEZXZpYXRpb25Mb3ciLCJzVG9sZXJhbmNlTG93Iiwic0FjY2VwdGFuY2VMb3ciLCJzQWNjZXB0YW5jZUhpZ2giLCJzVG9sZXJhbmNlSGlnaCIsInNEZXZpYXRpb25IaWdoIiwic0NyaXRpY2FsaXR5RXhwcmVzc2lvbiIsIk5ldXRyYWwiLCJJbmZpbml0eSIsIkdvb2QiLCJDcml0aWNhbCIsIndhcm5pbmciLCJfZ2V0Q3JpdGljYWxpdHlGcm9tRW51bSIsInNDcml0aWNhbGl0eSIsInNJbmRpY2F0b3IiLCJnZXRWYWx1ZUNyaXRpY2FsaXR5Iiwic0RpbWVuc2lvbiIsImFWYWx1ZUNyaXRpY2FsaXR5Iiwic1Jlc3VsdCIsImFWYWx1ZXMiLCJvVkMiLCJWYWx1ZSIsIkNyaXRpY2FsaXR5IiwiZ2V0TWVhc3VyZUF0dHJpYnV0ZUluZGV4IiwiaU1lYXN1cmUiLCJvQ2hhcnRBbm5vdGF0aW9ucyIsImFNZWFzdXJlcyIsInNNZWFzdXJlUHJvcGVydHlQYXRoIiwiTWVhc3VyZXMiLCJEeW5hbWljTWVhc3VyZXMiLCJiTWVhc3VyZUF0dHJpYnV0ZUV4aXN0cyIsImFNZWFzdXJlQXR0cmlidXRlcyIsIk1lYXN1cmVBdHRyaWJ1dGVzIiwiaU1lYXN1cmVBdHRyaWJ1dGUiLCJmbkNoZWNrTWVhc3VyZSIsInNNZWFzdXJlUGF0aCIsIm9NZWFzdXJlQXR0cmlidXRlIiwiaW5kZXgiLCJNZWFzdXJlIiwiRHluYW1pY01lYXN1cmUiLCJzb21lIiwiYmluZCIsImdldE1lYXN1cmVBdHRyaWJ1dGUiLCJzQ2hhcnRBbm5vdGF0aW9uUGF0aCIsInJlcXVlc3RPYmplY3QiLCJ0aGVuIiwic01lYXN1cmVBdHRyaWJ1dGVQYXRoIiwiRGF0YVBvaW50IiwiZ2V0TWVhc3VyZUF0dHJpYnV0ZUZvck1lYXN1cmUiLCJzdWJzdHJpbmciLCJpc0RyYWZ0UGFyZW50RW50aXR5Rm9yQ29udGFpbm1lbnQiLCJvVGFyZ2V0Q29sbGVjdGlvbkNvbnRhaW5zVGFyZ2V0Iiwib1RhYmxlTWV0YWRhdGEiLCJwYXJlbnRFbnRpdHlTZXQiLCJzUGFyZW50RW50aXR5U2V0UGF0aCIsIm9EcmFmdFJvb3QiLCJvRHJhZnROb2RlIiwiZ2V0RGF0YUZyb21UZW1wbGF0ZSIsImRhdGFFbGVtZW50Iiwic3BsaXRQYXRoIiwiZGF0YUtleSIsImNvbm5lY3RlZERhdGFQYXRoIiwiY29ubmVjdGVkT2JqZWN0IiwidGVtcGxhdGUiLCJUZW1wbGF0ZSIsInNwbGl0VGVtcCIsInRlbXBBcnJheSIsInRyaW0iLCJEYXRhIiwibm90TGFzdEluZGV4IiwiZWxlbWVudCIsImlzTGFzdEluZGV4IiwidGVtcGxhdGVJbmZvIiwiZ2V0RGVsaW1pdGVyIiwic2V0TWV0YU1vZGVsIiwiZ2V0UGFyYW1ldGVycyIsIm9QYXJhbWV0ZXJJbmZvIiwiZ2V0UGFyYW1ldGVySW5mbyIsInBhcmFtZXRlclByb3BlcnRpZXMiLCJidWlsZEFjdGlvbldyYXBwZXIiLCJvVGhpcyIsImFQYXJhbXMiLCJyZWYiLCJoYW5kbGVyTW9kdWxlIiwiaGFuZGxlck1ldGhvZCIsImlkIiwib0FkZGl0aW9uYWxQYXJhbXMiLCJjb250ZXh0cyIsImNvbXBpbGVFeHByZXNzaW9uIiwiZm4iLCJnZXRIaWRkZW5QYXRoRXhwcmVzc2lvbiIsImRhdGFGaWVsZEFubm90YXRpb25zIiwicmVxdWlyZXNJQ29udGV4dCJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiQ29tbW9uSGVscGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IENvbW1vblV0aWxzIGZyb20gXCJzYXAvZmUvY29yZS9Db21tb25VdGlsc1wiO1xuaW1wb3J0IHsgY29tcGlsZUV4cHJlc3Npb24sIGZuLCByZWYgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IE1vZGVsSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL01vZGVsSGVscGVyXCI7XG5pbXBvcnQgbUxpYnJhcnkgZnJvbSBcInNhcC9tL2xpYnJhcnlcIjtcbmltcG9ydCB7IHN5c3RlbSB9IGZyb20gXCJzYXAvdWkvRGV2aWNlXCI7XG5pbXBvcnQgRWRpdE1vZGUgZnJvbSBcInNhcC91aS9tZGMvZW51bS9FZGl0TW9kZVwiO1xuaW1wb3J0IENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9Db250ZXh0XCI7XG5pbXBvcnQgT0RhdGFNb2RlbEFubm90YXRpb25IZWxwZXIgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Bbm5vdGF0aW9uSGVscGVyXCI7XG5pbXBvcnQgdHlwZSBPRGF0YU1ldGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTWV0YU1vZGVsXCI7XG5cbmNvbnN0IFZhbHVlQ29sb3IgPSBtTGlicmFyeS5WYWx1ZUNvbG9yO1xuY29uc3QgQ29tbW9uSGVscGVyID0ge1xuXHRnZXRQYXRoVG9LZXk6IGZ1bmN0aW9uIChvQ3R4OiBhbnkpIHtcblx0XHRyZXR1cm4gb0N0eC5nZXRPYmplY3QoKTtcblx0fSxcblxuXHQvKipcblx0ICogRGV0ZXJtaW5lcyBpZiBhIGZpZWxkIGlzIHZpc2libGUuXG5cdCAqXG5cdCAqIEBwYXJhbSB0YXJnZXQgVGFyZ2V0IGluc3RhbmNlXG5cdCAqIEBwYXJhbSBvSW50ZXJmYWNlIEludGVyZmFjZSBpbnN0YW5jZVxuXHQgKiBAcmV0dXJucyBSZXR1cm5zIHRydWUsIGZhbHNlLCBvciBleHByZXNzaW9uIHdpdGggcGF0aFxuXHQgKi9cblx0aXNWaXNpYmxlOiBmdW5jdGlvbiAodGFyZ2V0OiBvYmplY3QsIG9JbnRlcmZhY2U6IGFueSkge1xuXHRcdGNvbnN0IG9Nb2RlbCA9IG9JbnRlcmZhY2UuY29udGV4dC5nZXRNb2RlbCgpLFxuXHRcdFx0c1Byb3BlcnR5UGF0aCA9IG9JbnRlcmZhY2UuY29udGV4dC5nZXRQYXRoKCksXG5cdFx0XHRvQW5ub3RhdGlvbnMgPSBvTW9kZWwuZ2V0T2JqZWN0KGAke3NQcm9wZXJ0eVBhdGh9QGApLFxuXHRcdFx0aGlkZGVuID0gb0Fubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhpZGRlblwiXTtcblxuXHRcdHJldHVybiB0eXBlb2YgaGlkZGVuID09PSBcIm9iamVjdFwiID8gXCJ7PSAhJHtcIiArIGhpZGRlbi4kUGF0aCArIFwifSB9XCIgOiAhaGlkZGVuO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBEZXRlcm1pbmUgaWYgdGhlIGFjdGlvbiBvcGVucyB1cCBhIGRpYWxvZy5cblx0ICpcblx0ICogQHBhcmFtIG9BY3Rpb25Db250ZXh0XG5cdCAqIEBwYXJhbSBvSW50ZXJmYWNlXG5cdCAqIEByZXR1cm5zIGBEaWFsb2dgIHwgYE5vbmVgIGlmIGEgZGlhbG9nIGlzIG5lZWRlZFxuXHQgKi9cblx0aXNEaWFsb2c6IGZ1bmN0aW9uIChvQWN0aW9uQ29udGV4dDogYW55LCBvSW50ZXJmYWNlOiBhbnkpIHtcblx0XHRjb25zdCBvTW9kZWwgPSBvSW50ZXJmYWNlLmNvbnRleHQuZ2V0TW9kZWwoKSxcblx0XHRcdHNQcm9wZXJ0eVBhdGggPSBvSW50ZXJmYWNlLmNvbnRleHQuZ2V0UGF0aCgpLFxuXHRcdFx0aXNDcml0aWNhbCA9IG9Nb2RlbC5nZXRPYmplY3QoYCR7c1Byb3BlcnR5UGF0aH0vQCR1aTUub3ZlcmxvYWRAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLklzQWN0aW9uQ3JpdGljYWxgKTtcblx0XHRpZiAoaXNDcml0aWNhbCkge1xuXHRcdFx0cmV0dXJuIFwiRGlhbG9nXCI7XG5cdFx0fSBlbHNlIGlmIChvQWN0aW9uQ29udGV4dCkge1xuXHRcdFx0Y29uc3Qgb0FjdGlvbiA9IEFycmF5LmlzQXJyYXkob0FjdGlvbkNvbnRleHQpID8gb0FjdGlvbkNvbnRleHRbMF0gOiBvQWN0aW9uQ29udGV4dDtcblx0XHRcdGlmIChvQWN0aW9uLiRQYXJhbWV0ZXIgJiYgb0FjdGlvbi4kUGFyYW1ldGVyLmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0cmV0dXJuIFwiRGlhbG9nXCI7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gXCJOb25lXCI7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH0sXG5cdC8qKlxuXHQgKiBEZXRlcm1pbmUgaWYgZmllbGQgaXMgZWRpdGFibGUuXG5cdCAqXG5cdCAqIEBwYXJhbSB0YXJnZXQgVGFyZ2V0IGluc3RhbmNlXG5cdCAqIEBwYXJhbSBvSW50ZXJmYWNlIEludGVyZmFjZSBpbnN0YW5jZVxuXHQgKiBAcmV0dXJucyBBIEJpbmRpbmcgRXhwcmVzc2lvbiB0byBkZXRlcm1pbmUgaWYgYSBmaWVsZCBzaG91bGQgYmUgZWRpdGFibGUgb3Igbm90LlxuXHQgKi9cblx0Z2V0UGFyYW1ldGVyRWRpdE1vZGU6IGZ1bmN0aW9uICh0YXJnZXQ6IG9iamVjdCwgb0ludGVyZmFjZTogYW55KSB7XG5cdFx0Y29uc3Qgb01vZGVsID0gb0ludGVyZmFjZS5jb250ZXh0LmdldE1vZGVsKCksXG5cdFx0XHRzUHJvcGVydHlQYXRoID0gb0ludGVyZmFjZS5jb250ZXh0LmdldFBhdGgoKSxcblx0XHRcdG9Bbm5vdGF0aW9ucyA9IG9Nb2RlbC5nZXRPYmplY3QoYCR7c1Byb3BlcnR5UGF0aH1AYCksXG5cdFx0XHRmaWVsZENvbnRyb2wgPSBvQW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkZpZWxkQ29udHJvbFwiXSxcblx0XHRcdGltbXV0YWJsZSA9IG9Bbm5vdGF0aW9uc1tcIkBPcmcuT0RhdGEuQ29yZS5WMS5JbW11dGFibGVcIl0sXG5cdFx0XHRjb21wdXRlZCA9IG9Bbm5vdGF0aW9uc1tcIkBPcmcuT0RhdGEuQ29yZS5WMS5Db21wdXRlZFwiXTtcblxuXHRcdGxldCBzRWRpdE1vZGU6IEVkaXRNb2RlIHwgc3RyaW5nID0gRWRpdE1vZGUuRWRpdGFibGU7XG5cblx0XHRpZiAoaW1tdXRhYmxlIHx8IGNvbXB1dGVkKSB7XG5cdFx0XHRzRWRpdE1vZGUgPSBFZGl0TW9kZS5SZWFkT25seTtcblx0XHR9IGVsc2UgaWYgKGZpZWxkQ29udHJvbCkge1xuXHRcdFx0aWYgKGZpZWxkQ29udHJvbC4kRW51bU1lbWJlcikge1xuXHRcdFx0XHRpZiAoZmllbGRDb250cm9sLiRFbnVtTWVtYmVyID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5GaWVsZENvbnRyb2xUeXBlL1JlYWRPbmx5XCIpIHtcblx0XHRcdFx0XHRzRWRpdE1vZGUgPSBFZGl0TW9kZS5SZWFkT25seTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0ZmllbGRDb250cm9sLiRFbnVtTWVtYmVyID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5GaWVsZENvbnRyb2xUeXBlL0luYXBwbGljYWJsZVwiIHx8XG5cdFx0XHRcdFx0ZmllbGRDb250cm9sLiRFbnVtTWVtYmVyID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5GaWVsZENvbnRyb2xUeXBlL0hpZGRlblwiXG5cdFx0XHRcdCkge1xuXHRcdFx0XHRcdHNFZGl0TW9kZSA9IEVkaXRNb2RlLkRpc2FibGVkO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRpZiAoZmllbGRDb250cm9sLiRQYXRoKSB7XG5cdFx0XHRcdHNFZGl0TW9kZSA9XG5cdFx0XHRcdFx0XCJ7PSAle1wiICtcblx0XHRcdFx0XHRmaWVsZENvbnRyb2wuJFBhdGggK1xuXHRcdFx0XHRcdFwifSA8IDMgPyAoJXtcIiArXG5cdFx0XHRcdFx0ZmllbGRDb250cm9sLiRQYXRoICtcblx0XHRcdFx0XHRcIn0gPT09IDAgPyAnXCIgK1xuXHRcdFx0XHRcdEVkaXRNb2RlLkRpc2FibGVkICtcblx0XHRcdFx0XHRcIicgOiAnXCIgK1xuXHRcdFx0XHRcdEVkaXRNb2RlLlJlYWRPbmx5ICtcblx0XHRcdFx0XHRcIicpIDogJ1wiICtcblx0XHRcdFx0XHRFZGl0TW9kZS5FZGl0YWJsZSArXG5cdFx0XHRcdFx0XCInfVwiO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBzRWRpdE1vZGU7XG5cdH0sXG5cdC8qKlxuXHQgKiBHZXQgdGhlIGNvbXBsZXRlIG1ldGFwYXRoIHRvIHRoZSB0YXJnZXQuXG5cdCAqXG5cdCAqIEBwYXJhbSB0YXJnZXRcblx0ICogQHBhcmFtIG9JbnRlcmZhY2Vcblx0ICogQHJldHVybnMgVGhlIG1ldGFwYXRoXG5cdCAqL1xuXHRnZXRNZXRhUGF0aDogZnVuY3Rpb24gKHRhcmdldDogYW55LCBvSW50ZXJmYWNlOiBhbnkpIHtcblx0XHRyZXR1cm4gKG9JbnRlcmZhY2UgJiYgb0ludGVyZmFjZS5jb250ZXh0ICYmIG9JbnRlcmZhY2UuY29udGV4dC5nZXRQYXRoKCkpIHx8IHVuZGVmaW5lZDtcblx0fSxcblx0aXNEZXNrdG9wOiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIHN5c3RlbS5kZXNrdG9wID09PSB0cnVlO1xuXHR9LFxuXHRnZXRUYXJnZXRDb2xsZWN0aW9uOiBmdW5jdGlvbiAob0NvbnRleHQ6IGFueSwgbmF2Q29sbGVjdGlvbj86IGFueSkge1xuXHRcdGxldCBzUGF0aCA9IG9Db250ZXh0LmdldFBhdGgoKTtcblx0XHRpZiAoXG5cdFx0XHRvQ29udGV4dC5nZXRNZXRhZGF0YSgpLmdldE5hbWUoKSA9PT0gXCJzYXAudWkubW9kZWwuQ29udGV4dFwiICYmXG5cdFx0XHQob0NvbnRleHQuZ2V0T2JqZWN0KFwiJGtpbmRcIikgPT09IFwiRW50aXR5U2V0XCIgfHwgb0NvbnRleHQuZ2V0T2JqZWN0KFwiJENvbnRhaW5zVGFyZ2V0XCIpID09PSB0cnVlKVxuXHRcdCkge1xuXHRcdFx0cmV0dXJuIHNQYXRoO1xuXHRcdH1cblx0XHRpZiAob0NvbnRleHQuZ2V0TW9kZWwpIHtcblx0XHRcdHNQYXRoID1cblx0XHRcdFx0KG9Db250ZXh0LmdldE1vZGVsKCkuZ2V0TWV0YVBhdGggJiYgb0NvbnRleHQuZ2V0TW9kZWwoKS5nZXRNZXRhUGF0aChzUGF0aCkpIHx8XG5cdFx0XHRcdG9Db250ZXh0LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCkuZ2V0TWV0YVBhdGgoc1BhdGgpO1xuXHRcdH1cblx0XHQvL1N1cHBvcnRpbmcgc1BhdGggb2YgYW55IGZvcm1hdCwgZWl0aGVyICcvPGVudGl0eVNldD4vPG5hdmlnYXRpb25Db2xsZWN0aW9uPicgPE9SPiAnLzxlbnRpdHlTZXQ+LyRUeXBlLzxuYXZpZ2F0aW9uQ29sbGVjdGlvbj4nXG5cdFx0Y29uc3QgYVBhcnRzID0gc1BhdGguc3BsaXQoXCIvXCIpLmZpbHRlcihmdW5jdGlvbiAoc1BhcnQ6IGFueSkge1xuXHRcdFx0cmV0dXJuIHNQYXJ0ICYmIHNQYXJ0ICE9IFwiJFR5cGVcIjtcblx0XHR9KTsgLy9maWx0ZXIgb3V0IGVtcHR5IHN0cmluZ3MgYW5kIHBhcnRzIHJlZmVycmluZyB0byAnJFR5cGUnXG5cdFx0Y29uc3QgZW50aXR5U2V0ID0gYC8ke2FQYXJ0c1swXX1gO1xuXHRcdGlmIChhUGFydHMubGVuZ3RoID09PSAxKSB7XG5cdFx0XHRyZXR1cm4gZW50aXR5U2V0O1xuXHRcdH1cblx0XHRjb25zdCBuYXZpZ2F0aW9uQ29sbGVjdGlvbiA9IG5hdkNvbGxlY3Rpb24gPT09IHVuZGVmaW5lZCA/IGFQYXJ0cy5zbGljZSgxKS5qb2luKFwiLyROYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nL1wiKSA6IG5hdkNvbGxlY3Rpb247XG5cdFx0cmV0dXJuIGAke2VudGl0eVNldH0vJE5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmcvJHtuYXZpZ2F0aW9uQ29sbGVjdGlvbn1gOyAvLyB1c2VkIGluIGdvdG9UYXJnZXRFbnRpdHlTZXQgbWV0aG9kIGluIHRoZSBzYW1lIGZpbGVcblx0fSxcblxuXHRpc1Byb3BlcnR5RmlsdGVyYWJsZTogZnVuY3Rpb24gKGNvbnRleHQ6IENvbnRleHQsIG9EYXRhRmllbGQ/OiBhbnkpIHtcblx0XHRjb25zdCBvTW9kZWwgPSBjb250ZXh0LmdldE1vZGVsKCkgYXMgT0RhdGFNZXRhTW9kZWwsXG5cdFx0XHRzUHJvcGVydHlQYXRoID0gY29udGV4dC5nZXRQYXRoKCksXG5cdFx0XHQvLyBMb2FjYXRpb25QYXRoIHdvdWxkIGJlIHRoZSBwcmVmaXggb2Ygc1Byb3BlcnR5UGF0aCwgZXhhbXBsZTogc1Byb3BlcnR5UGF0aCA9ICcvQ3VzdG9tZXIvU2V0L05hbWUnIC0+IHNQcm9wZXJ0eUxvY2F0aW9uUGF0aCA9ICcvQ3VzdG9tZXIvU2V0J1xuXHRcdFx0c1Byb3BlcnR5TG9jYXRpb25QYXRoID0gQ29tbW9uSGVscGVyLmdldExvY2F0aW9uRm9yUHJvcGVydHlQYXRoKG9Nb2RlbCwgc1Byb3BlcnR5UGF0aCksXG5cdFx0XHRzUHJvcGVydHkgPSBzUHJvcGVydHlQYXRoLnJlcGxhY2UoYCR7c1Byb3BlcnR5TG9jYXRpb25QYXRofS9gLCBcIlwiKTtcblxuXHRcdGlmIChcblx0XHRcdG9EYXRhRmllbGQgJiZcblx0XHRcdChvRGF0YUZpZWxkLiRUeXBlID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZEZvckFjdGlvblwiIHx8XG5cdFx0XHRcdG9EYXRhRmllbGQuJFR5cGUgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uXCIpXG5cdFx0KSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIENvbW1vblV0aWxzLmlzUHJvcGVydHlGaWx0ZXJhYmxlKG9Nb2RlbCwgc1Byb3BlcnR5TG9jYXRpb25QYXRoLCBzUHJvcGVydHkpO1xuXHR9LFxuXG5cdGdldExvY2F0aW9uRm9yUHJvcGVydHlQYXRoOiBmdW5jdGlvbiAob01vZGVsOiBhbnksIHNQcm9wZXJ0eVBhdGg6IGFueSkge1xuXHRcdGxldCBpTGVuZ3RoO1xuXHRcdGxldCBzQ29sbGVjdGlvblBhdGggPSBzUHJvcGVydHlQYXRoLnNsaWNlKDAsIHNQcm9wZXJ0eVBhdGgubGFzdEluZGV4T2YoXCIvXCIpKTtcblx0XHRpZiAob01vZGVsLmdldE9iamVjdChgJHtzQ29sbGVjdGlvblBhdGh9LyRraW5kYCkgPT09IFwiRW50aXR5Q29udGFpbmVyXCIpIHtcblx0XHRcdGlMZW5ndGggPSBzQ29sbGVjdGlvblBhdGgubGVuZ3RoICsgMTtcblx0XHRcdHNDb2xsZWN0aW9uUGF0aCA9IHNQcm9wZXJ0eVBhdGguc2xpY2UoaUxlbmd0aCwgc1Byb3BlcnR5UGF0aC5pbmRleE9mKFwiL1wiLCBpTGVuZ3RoKSk7XG5cdFx0fVxuXHRcdHJldHVybiBzQ29sbGVjdGlvblBhdGg7XG5cdH0sXG5cdGdvdG9BY3Rpb25QYXJhbWV0ZXI6IGZ1bmN0aW9uIChvQ29udGV4dDogYW55KSB7XG5cdFx0Y29uc3Qgc1BhdGggPSBvQ29udGV4dC5nZXRQYXRoKCksXG5cdFx0XHRzUHJvcGVydHlOYW1lID0gb0NvbnRleHQuZ2V0T2JqZWN0KGAke3NQYXRofS8kTmFtZWApO1xuXG5cdFx0cmV0dXJuIENvbW1vblV0aWxzLmdldFBhcmFtZXRlclBhdGgoc1BhdGgsIHNQcm9wZXJ0eU5hbWUpO1xuXHR9LFxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgZW50aXR5IHNldCBuYW1lIGZyb20gdGhlIGVudGl0eSB0eXBlIG5hbWUuXG5cdCAqXG5cdCAqIEBwYXJhbSBvTWV0YU1vZGVsIE9EYXRhIHY0IG1ldGFtb2RlbCBpbnN0YW5jZVxuXHQgKiBAcGFyYW0gc0VudGl0eVR5cGUgRW50aXR5VHlwZSBvZiB0aGUgYWN0aW9tXG5cdCAqIEByZXR1cm5zIFRoZSBFbnRpdHlTZXQgb2YgdGhlIGJvdW5kIGFjdGlvblxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICovXG5cdGdldEVudGl0eVNldE5hbWU6IGZ1bmN0aW9uIChvTWV0YU1vZGVsOiBPRGF0YU1ldGFNb2RlbCwgc0VudGl0eVR5cGU6IHN0cmluZykge1xuXHRcdGNvbnN0IG9FbnRpdHlDb250YWluZXIgPSBvTWV0YU1vZGVsLmdldE9iamVjdChcIi9cIik7XG5cdFx0Zm9yIChjb25zdCBrZXkgaW4gb0VudGl0eUNvbnRhaW5lcikge1xuXHRcdFx0aWYgKHR5cGVvZiBvRW50aXR5Q29udGFpbmVyW2tleV0gPT09IFwib2JqZWN0XCIgJiYgb0VudGl0eUNvbnRhaW5lcltrZXldLiRUeXBlID09PSBzRW50aXR5VHlwZSkge1xuXHRcdFx0XHRyZXR1cm4ga2V5O1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9LFxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgbWV0YW1vZGVsIHBhdGggY29ycmVjdGx5IGZvciBib3VuZCBhY3Rpb25zIGlmIHVzZWQgd2l0aCBiUmV0dXJuT25seVBhdGggYXMgdHJ1ZSxcblx0ICogZWxzZSByZXR1cm5zIGFuIG9iamVjdCB3aGljaCBoYXMgMyBwcm9wZXJ0aWVzIHJlbGF0ZWQgdG8gdGhlIGFjdGlvbi4gVGhleSBhcmUgdGhlIGVudGl0eSBzZXQgbmFtZSxcblx0ICogdGhlICRQYXRoIHZhbHVlIG9mIHRoZSBPcGVyYXRpb25BdmFpbGFibGUgYW5ub3RhdGlvbiBhbmQgdGhlIGJpbmRpbmcgcGFyYW1ldGVyIG5hbWUuIElmXG5cdCAqIGJDaGVja1N0YXRpY1ZhbHVlIGlzIHRydWUsIHJldHVybnMgdGhlIHN0YXRpYyB2YWx1ZSBvZiBPcGVyYXRpb25BdmFpbGFibGUgYW5ub3RhdGlvbiwgaWYgcHJlc2VudC5cblx0ICogZS5nLiBmb3IgYm91bmQgYWN0aW9uIHNvbWVOYW1lU3BhY2UuU29tZUJvdW5kQWN0aW9uXG5cdCAqIG9mIGVudGl0eSBzZXQgU29tZUVudGl0eVNldCwgdGhlIHN0cmluZyBcIi9Tb21lRW50aXR5U2V0L3NvbWVOYW1lU3BhY2UuU29tZUJvdW5kQWN0aW9uXCIgaXMgcmV0dXJuZWQuXG5cdCAqXG5cdCAqIEBwYXJhbSBvQWN0aW9uIFRoZSBjb250ZXh0IG9iamVjdCBvZiB0aGUgYWN0aW9uXG5cdCAqIEBwYXJhbSBiUmV0dXJuT25seVBhdGggSWYgZmFsc2UsIGFkZGl0aW9uYWwgaW5mbyBpcyByZXR1cm5lZCBhbG9uZyB3aXRoIG1ldGFtb2RlbCBwYXRoIHRvIHRoZSBib3VuZCBhY3Rpb25cblx0ICogQHBhcmFtIHNBY3Rpb25OYW1lIFRoZSBuYW1lIG9mIHRoZSBib3VuZCBhY3Rpb24gb2YgdGhlIGZvcm0gc29tZU5hbWVTcGFjZS5Tb21lQm91bmRBY3Rpb25cblx0ICogQHBhcmFtIGJDaGVja1N0YXRpY1ZhbHVlIElmIHRydWUsIHRoZSBzdGF0aWMgdmFsdWUgb2YgT3BlcmF0aW9uQXZhaWxhYmxlIGlzIHJldHVybmVkLCBpZiBwcmVzZW50XG5cdCAqIEByZXR1cm5zIFRoZSBzdHJpbmcgb3Igb2JqZWN0IGFzIHNwZWNpZmllZCBieSBiUmV0dXJuT25seVBhdGhcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRnZXRBY3Rpb25QYXRoOiBmdW5jdGlvbiAob0FjdGlvbjogYW55LCBiUmV0dXJuT25seVBhdGg6IGJvb2xlYW4sIHNBY3Rpb25OYW1lPzogc3RyaW5nLCBiQ2hlY2tTdGF0aWNWYWx1ZT86IGJvb2xlYW4pIHtcblx0XHRsZXQgc0NvbnRleHRQYXRoID0gb0FjdGlvbi5nZXRQYXRoKCkuc3BsaXQoXCIvQFwiKVswXTtcblxuXHRcdHNBY3Rpb25OYW1lID0gIXNBY3Rpb25OYW1lID8gb0FjdGlvbi5nZXRPYmplY3Qob0FjdGlvbi5nZXRQYXRoKCkpIDogc0FjdGlvbk5hbWU7XG5cblx0XHRpZiAoc0FjdGlvbk5hbWUgJiYgc0FjdGlvbk5hbWUuaW5kZXhPZihcIihcIikgPiAtMSkge1xuXHRcdFx0Ly8gYWN0aW9uIGJvdW5kIHRvIGFub3RoZXIgZW50aXR5IHR5cGVcblx0XHRcdHNBY3Rpb25OYW1lID0gc0FjdGlvbk5hbWUuc3BsaXQoXCIoXCIpWzBdO1xuXHRcdH0gZWxzZSBpZiAob0FjdGlvbi5nZXRPYmplY3Qoc0NvbnRleHRQYXRoKSkge1xuXHRcdFx0Ly8gVE9ETzogdGhpcyBsb2dpYyBzb3VuZHMgd3JvbmcsIHRvIGJlIGNvcnJlY3RlZFxuXHRcdFx0Y29uc3Qgc0VudGl0eVR5cGVOYW1lID0gb0FjdGlvbi5nZXRPYmplY3Qoc0NvbnRleHRQYXRoKS4kVHlwZTtcblx0XHRcdGNvbnN0IHNFbnRpdHlOYW1lID0gdGhpcy5nZXRFbnRpdHlTZXROYW1lKG9BY3Rpb24uZ2V0TW9kZWwoKSwgc0VudGl0eVR5cGVOYW1lKTtcblx0XHRcdGlmIChzRW50aXR5TmFtZSkge1xuXHRcdFx0XHRzQ29udGV4dFBhdGggPSBgLyR7c0VudGl0eU5hbWV9YDtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHNDb250ZXh0UGF0aDtcblx0XHR9XG5cblx0XHRpZiAoYkNoZWNrU3RhdGljVmFsdWUpIHtcblx0XHRcdHJldHVybiBvQWN0aW9uLmdldE9iamVjdChgJHtzQ29udGV4dFBhdGh9LyR7c0FjdGlvbk5hbWV9QE9yZy5PRGF0YS5Db3JlLlYxLk9wZXJhdGlvbkF2YWlsYWJsZWApO1xuXHRcdH1cblx0XHRpZiAoYlJldHVybk9ubHlQYXRoKSB7XG5cdFx0XHRyZXR1cm4gYCR7c0NvbnRleHRQYXRofS8ke3NBY3Rpb25OYW1lfWA7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHNDb250ZXh0UGF0aDogc0NvbnRleHRQYXRoLFxuXHRcdFx0XHRzUHJvcGVydHk6IG9BY3Rpb24uZ2V0T2JqZWN0KGAke3NDb250ZXh0UGF0aH0vJHtzQWN0aW9uTmFtZX1AT3JnLk9EYXRhLkNvcmUuVjEuT3BlcmF0aW9uQXZhaWxhYmxlLyRQYXRoYCksXG5cdFx0XHRcdHNCaW5kaW5nUGFyYW1ldGVyOiBvQWN0aW9uLmdldE9iamVjdChgJHtzQ29udGV4dFBhdGh9LyR7c0FjdGlvbk5hbWV9L0AkdWk1Lm92ZXJsb2FkLzAvJFBhcmFtZXRlci8wLyROYW1lYClcblx0XHRcdH07XG5cdFx0fVxuXHR9LFxuXG5cdGdldE5hdmlnYXRpb25Db250ZXh0OiBmdW5jdGlvbiAob0NvbnRleHQ6IGFueSkge1xuXHRcdHJldHVybiBPRGF0YU1vZGVsQW5ub3RhdGlvbkhlbHBlci5nZXROYXZpZ2F0aW9uUGF0aChvQ29udGV4dC5nZXRQYXRoKCkpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBwYXRoIHdpdGhvdXQgdGhlIGVudGl0eSB0eXBlIChwb3RlbnRpYWxseSBmaXJzdCkgYW5kIHByb3BlcnR5IChsYXN0KSBwYXJ0IChvcHRpb25hbCkuXG5cdCAqIFRoZSByZXN1bHQgY2FuIGJlIGFuIGVtcHR5IHN0cmluZyBpZiBpdCBpcyBhIHNpbXBsZSBkaXJlY3QgcHJvcGVydHkuXG5cdCAqXG5cdCAqIElmIGFuZCBvbmx5IGlmIHRoZSBnaXZlbiBwcm9wZXJ0eSBwYXRoIHN0YXJ0cyB3aXRoIGEgc2xhc2ggKC8pLCBpdCBpcyBjb25zaWRlcmVkIHRoYXQgdGhlIGVudGl0eSB0eXBlXG5cdCAqIGlzIHBhcnQgb2YgdGhlIHBhdGggYW5kIHdpbGwgYmUgc3RyaXBwZWQgYXdheS5cblx0ICpcblx0ICogQHBhcmFtIHNQcm9wZXJ0eVBhdGhcblx0ICogQHBhcmFtIGJLZWVwUHJvcGVydHlcblx0ICogQHJldHVybnMgVGhlIG5hdmlnYXRpb24gcGF0aFxuXHQgKi9cblx0Z2V0TmF2aWdhdGlvblBhdGg6IGZ1bmN0aW9uIChzUHJvcGVydHlQYXRoOiBhbnksIGJLZWVwUHJvcGVydHk/OiBib29sZWFuKSB7XG5cdFx0Y29uc3QgYlN0YXJ0c1dpdGhFbnRpdHlUeXBlID0gc1Byb3BlcnR5UGF0aC5zdGFydHNXaXRoKFwiL1wiKTtcblx0XHRjb25zdCBhUGFydHMgPSBzUHJvcGVydHlQYXRoLnNwbGl0KFwiL1wiKS5maWx0ZXIoZnVuY3Rpb24gKHBhcnQ6IGFueSkge1xuXHRcdFx0cmV0dXJuICEhcGFydDtcblx0XHR9KTtcblx0XHRpZiAoYlN0YXJ0c1dpdGhFbnRpdHlUeXBlKSB7XG5cdFx0XHRhUGFydHMuc2hpZnQoKTtcblx0XHR9XG5cdFx0aWYgKCFiS2VlcFByb3BlcnR5KSB7XG5cdFx0XHRhUGFydHMucG9wKCk7XG5cdFx0fVxuXHRcdHJldHVybiBhUGFydHMuam9pbihcIi9cIik7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGNvcnJlY3QgbWV0YW1vZGVsIHBhdGggZm9yIGJvdW5kIGFjdGlvbnMuXG5cdCAqXG5cdCAqIFNpbmNlIHRoaXMgbWV0aG9kIGlzIGNhbGxlZCBpcnJlc3BlY3RpdmUgb2YgdGhlIGFjdGlvbiB0eXBlLCB0aGlzIHdpbGwgYmUgYXBwbGllZCB0byB1bmJvdW5kIGFjdGlvbnMuXG5cdCAqIEluIHN1Y2ggYSBjYXNlLCBpZiBhbiBpbmNvcnJlY3QgcGF0aCBpcyByZXR1cm5lZCwgaXQgaXMgaWdub3JlZCBkdXJpbmcgdGVtcGxhdGluZy5cblx0ICpcblx0ICogRXhhbXBsZTogZm9yIHRoZSBib3VuZCBhY3Rpb24gc29tZU5hbWVTcGFjZS5Tb21lQm91bmRBY3Rpb24gb2YgZW50aXR5IHNldCBTb21lRW50aXR5U2V0LFxuXHQgKiB0aGUgc3RyaW5nIFwiL1NvbWVFbnRpdHlTZXQvc29tZU5hbWVTcGFjZS5Tb21lQm91bmRBY3Rpb25cIiBpcyByZXR1cm5lZC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBzdGF0aWNcblx0ICogQG5hbWUgc2FwLmZlLm1hY3Jvcy5Db21tb25IZWxwZXIuZ2V0QWN0aW9uQ29udGV4dFxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLm1hY3Jvcy5Db21tb25IZWxwZXJcblx0ICogQHBhcmFtIG9BY3Rpb24gQ29udGV4dCBvYmplY3QgZm9yIHRoZSBhY3Rpb25cblx0ICogQHJldHVybnMgQ29ycmVjdCBtZXRhbW9kZWwgcGF0aCBmb3IgYm91bmQgYW5kIGluY29ycmVjdCBwYXRoIGZvciB1bmJvdW5kIGFjdGlvbnNcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRnZXRBY3Rpb25Db250ZXh0OiBmdW5jdGlvbiAob0FjdGlvbjogb2JqZWN0KSB7XG5cdFx0cmV0dXJuIENvbW1vbkhlbHBlci5nZXRBY3Rpb25QYXRoKG9BY3Rpb24sIHRydWUpO1xuXHR9LFxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgbWV0YW1vZGVsIHBhdGggY29ycmVjdGx5IGZvciBvdmVybG9hZGVkIGJvdW5kIGFjdGlvbnMuIEZvciB1bmJvdW5kIGFjdGlvbnMsXG5cdCAqIHRoZSBpbmNvcnJlY3QgcGF0aCBpcyByZXR1cm5lZCwgYnV0IGlnbm9yZWQgZHVyaW5nIHRlbXBsYXRpbmcuXG5cdCAqIGUuZy4gZm9yIGJvdW5kIGFjdGlvbiBzb21lTmFtZVNwYWNlLlNvbWVCb3VuZEFjdGlvbiBvZiBlbnRpdHkgc2V0IFNvbWVFbnRpdHlTZXQsXG5cdCAqIHRoZSBzdHJpbmcgXCIvU29tZUVudGl0eVNldC9zb21lTmFtZVNwYWNlLlNvbWVCb3VuZEFjdGlvbi9AJHVpNS5vdmVybG9hZC8wXCIgaXMgcmV0dXJuZWQuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAc3RhdGljXG5cdCAqIEBuYW1lIHNhcC5mZS5tYWNyb3MuQ29tbW9uSGVscGVyLmdldFBhdGhUb0JvdW5kQWN0aW9uT3ZlcmxvYWRcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5tYWNyb3MuQ29tbW9uSGVscGVyXG5cdCAqIEBwYXJhbSBvQWN0aW9uIFRoZSBjb250ZXh0IG9iamVjdCBmb3IgdGhlIGFjdGlvblxuXHQgKiBAcmV0dXJucyBUaGUgY29ycmVjdCBtZXRhbW9kZWwgcGF0aCBmb3IgYm91bmQgYWN0aW9uIG92ZXJsb2FkIGFuZCBpbmNvcnJlY3QgcGF0aCBmb3IgdW5ib3VuZCBhY3Rpb25zXG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKi9cblx0Z2V0UGF0aFRvQm91bmRBY3Rpb25PdmVybG9hZDogZnVuY3Rpb24gKG9BY3Rpb246IG9iamVjdCkge1xuXHRcdGNvbnN0IHNQYXRoID0gQ29tbW9uSGVscGVyLmdldEFjdGlvblBhdGgob0FjdGlvbiwgdHJ1ZSk7XG5cdFx0cmV0dXJuIGAke3NQYXRofS9AJHVpNS5vdmVybG9hZC8wYDtcblx0fSxcblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgc3RyaW5nIHdpdGggc2luZ2xlIHF1b3Rlcy5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUubWFjcm9zLkNvbW1vbkhlbHBlclxuXHQgKiBAcGFyYW0gc1ZhbHVlIFNvbWUgc3RyaW5nIHRoYXQgbmVlZHMgdG8gYmUgY29udmVydGVkIGludG8gc2luZ2xlIHF1b3Rlc1xuXHQgKiBAcGFyYW0gW2JFc2NhcGVdIFNob3VsZCB0aGUgc3RyaW5nIGJlIGVzY2FwZWQgYmVmb3JlaGFuZFxuXHQgKiBAcmV0dXJucyAtIFN0cmluZyB3aXRoIHNpbmdsZSBxdW90ZXNcblx0ICovXG5cdGFkZFNpbmdsZVF1b3RlczogZnVuY3Rpb24gKHNWYWx1ZTogc3RyaW5nLCBiRXNjYXBlPzogYm9vbGVhbikge1xuXHRcdGlmIChiRXNjYXBlICYmIHNWYWx1ZSkge1xuXHRcdFx0c1ZhbHVlID0gdGhpcy5lc2NhcGVTaW5nbGVRdW90ZXMoc1ZhbHVlKTtcblx0XHR9XG5cdFx0cmV0dXJuIGAnJHtzVmFsdWV9J2A7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIHN0cmluZyB3aXRoIGVzY2FwZWQgc2luZ2xlIHF1b3Rlcy5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUubWFjcm9zLkNvbW1vbkhlbHBlclxuXHQgKiBAcGFyYW0gc1ZhbHVlIFNvbWUgc3RyaW5nIHRoYXQgbmVlZHMgZXNjYXBpbmcgb2Ygc2luZ2xlIHF1b3Rlc1xuXHQgKiBAcmV0dXJucyAtIFN0cmluZyB3aXRoIGVzY2FwZWQgc2luZ2xlIHF1b3Rlc1xuXHQgKi9cblx0ZXNjYXBlU2luZ2xlUXVvdGVzOiBmdW5jdGlvbiAoc1ZhbHVlOiBzdHJpbmcpIHtcblx0XHRyZXR1cm4gc1ZhbHVlLnJlcGxhY2UoL1snXS9nLCBcIlxcXFwnXCIpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBmdW5jdGlvbiBzdHJpbmdcblx0ICogVGhlIGZpcnN0IGFyZ3VtZW50IG9mIGdlbmVyYXRlRnVuY3Rpb24gaXMgbmFtZSBvZiB0aGUgZ2VuZXJhdGVkIGZ1bmN0aW9uIHN0cmluZy5cblx0ICogUmVtYWluaW5nIGFyZ3VtZW50cyBvZiBnZW5lcmF0ZUZ1bmN0aW9uIGFyZSBhcmd1bWVudHMgb2YgdGhlIG5ld2x5IGdlbmVyYXRlZCBmdW5jdGlvbiBzdHJpbmcuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLm1hY3Jvcy5Db21tb25IZWxwZXJcblx0ICogQHBhcmFtIHNGdW5jTmFtZSBTb21lIHN0cmluZyBmb3IgdGhlIGZ1bmN0aW9uIG5hbWVcblx0ICogQHBhcmFtIGFyZ3MgVGhlIHJlbWFpbmluZyBhcmd1bWVudHNcblx0ICogQHJldHVybnMgLSBGdW5jdGlvbiBzdHJpbmcgZGVwZW5kcyBvbiBhcmd1bWVudHMgcGFzc2VkXG5cdCAqL1xuXHRnZW5lcmF0ZUZ1bmN0aW9uOiBmdW5jdGlvbiAoc0Z1bmNOYW1lOiBzdHJpbmcsIC4uLmFyZ3M6IHN0cmluZ1tdKSB7XG5cdFx0bGV0IHNQYXJhbXMgPSBcIlwiO1xuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuXHRcdFx0c1BhcmFtcyArPSBhcmdzW2ldO1xuXHRcdFx0aWYgKGkgPCBhcmdzLmxlbmd0aCAtIDEpIHtcblx0XHRcdFx0c1BhcmFtcyArPSBcIiwgXCI7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0bGV0IHNGdW5jdGlvbiA9IGAke3NGdW5jTmFtZX0oKWA7XG5cdFx0aWYgKHNQYXJhbXMpIHtcblx0XHRcdHNGdW5jdGlvbiA9IGAke3NGdW5jTmFtZX0oJHtzUGFyYW1zfSlgO1xuXHRcdH1cblx0XHRyZXR1cm4gc0Z1bmN0aW9uO1xuXHR9LFxuXHQvKlxuXHQgKiBSZXR1cm5zIHRoZSB2aXNpYmlsaXR5IGV4cHJlc3Npb24gZm9yIGRhdGFwb2ludCB0aXRsZS9saW5rXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAcGFyYW0ge3N0cmluZ30gW3NQYXRoXSBhbm5vdGF0aW9uIHBhdGggb2YgZGF0YSBwb2ludCBvciBNaWNyb2NoYXJ0XG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gW2JMaW5rXSB0cnVlIGlmIGxpbmsgdmlzaWJpbGl0eSBpcyBiZWluZyBkZXRlcm1pbmVkLCBmYWxzZSBpZiB0aXRsZSB2aXNpYmlsaXR5IGlzIGJlaW5nIGRldGVybWluZWRcblx0ICogQHBhcmFtIHtib29sZWFufSBbYkZpZWxkVmlzaWJpbGl0eV0gdHJ1ZSBpZiBmaWVsZCBpcyB2c2lpYmxlLCBmYWxzZSBvdGhlcndpc2Vcblx0ICogQHJldHVybnMgIHtzdHJpbmd9IHNWaXNpYmlsaXR5RXhwIFVzZWQgdG8gZ2V0IHRoZSAgdmlzaWJpbGl0eSBiaW5kaW5nIGZvciBEYXRhUG9pbnRzIHRpdGxlIGluIHRoZSBIZWFkZXIuXG5cdCAqXG5cdCAqL1xuXG5cdGdldEhlYWRlckRhdGFQb2ludExpbmtWaXNpYmlsaXR5OiBmdW5jdGlvbiAoc1BhdGg6IGFueSwgYkxpbms6IGFueSwgYkZpZWxkVmlzaWJpbGl0eTogYW55KSB7XG5cdFx0bGV0IHNWaXNpYmlsaXR5RXhwO1xuXHRcdGlmIChiRmllbGRWaXNpYmlsaXR5KSB7XG5cdFx0XHRzVmlzaWJpbGl0eUV4cCA9IGJMaW5rXG5cdFx0XHRcdD8gXCJ7PSAke2ludGVybmFsPmlzSGVhZGVyRFBMaW5rVmlzaWJsZS9cIiArIHNQYXRoICsgXCJ9ID09PSB0cnVlICYmIFwiICsgYkZpZWxkVmlzaWJpbGl0eSArIFwifVwiXG5cdFx0XHRcdDogXCJ7PSAke2ludGVybmFsPmlzSGVhZGVyRFBMaW5rVmlzaWJsZS9cIiArIHNQYXRoICsgXCJ9ICE9PSB0cnVlICYmIFwiICsgYkZpZWxkVmlzaWJpbGl0eSArIFwifVwiO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzVmlzaWJpbGl0eUV4cCA9IGJMaW5rXG5cdFx0XHRcdD8gXCJ7PSAke2ludGVybmFsPmlzSGVhZGVyRFBMaW5rVmlzaWJsZS9cIiArIHNQYXRoICsgXCJ9ID09PSB0cnVlfVwiXG5cdFx0XHRcdDogXCJ7PSAke2ludGVybmFsPmlzSGVhZGVyRFBMaW5rVmlzaWJsZS9cIiArIHNQYXRoICsgXCJ9ICE9PSB0cnVlfVwiO1xuXHRcdH1cblx0XHRyZXR1cm4gc1Zpc2liaWxpdHlFeHA7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIG9iamVjdCB0byBzdHJpbmcoZGlmZmVyZW50IGZyb20gSlNPTi5zdHJpbmdpZnkgb3IudG9TdHJpbmcpLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG1lbWJlcm9mIHNhcC5mZS5tYWNyb3MuQ29tbW9uSGVscGVyXG5cdCAqIEBwYXJhbSBvUGFyYW1zIFNvbWUgb2JqZWN0XG5cdCAqIEByZXR1cm5zIC0gT2JqZWN0IHN0cmluZ1xuXHQgKi9cblx0b2JqZWN0VG9TdHJpbmc6IGZ1bmN0aW9uIChvUGFyYW1zOiBhbnkpIHtcblx0XHRsZXQgaU51bWJlck9mS2V5cyA9IE9iamVjdC5rZXlzKG9QYXJhbXMpLmxlbmd0aCxcblx0XHRcdHNQYXJhbXMgPSBcIlwiO1xuXG5cdFx0Zm9yIChjb25zdCBzS2V5IGluIG9QYXJhbXMpIHtcblx0XHRcdGxldCBzVmFsdWUgPSBvUGFyYW1zW3NLZXldO1xuXHRcdFx0aWYgKHNWYWx1ZSAmJiB0eXBlb2Ygc1ZhbHVlID09PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRcdHNWYWx1ZSA9IHRoaXMub2JqZWN0VG9TdHJpbmcoc1ZhbHVlKTtcblx0XHRcdH1cblx0XHRcdHNQYXJhbXMgKz0gYCR7c0tleX06ICR7c1ZhbHVlfWA7XG5cdFx0XHRpZiAoaU51bWJlck9mS2V5cyA+IDEpIHtcblx0XHRcdFx0LS1pTnVtYmVyT2ZLZXlzO1xuXHRcdFx0XHRzUGFyYW1zICs9IFwiLCBcIjtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gYHsgJHtzUGFyYW1zfX1gO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIGVzY2FwZSBjaGFyYWN0ZXJzIChcXCkgZnJvbSBhbiBleHByZXNzaW9uLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG1lbWJlcm9mIHNhcC5mZS5tYWNyb3MuQ29tbW9uSGVscGVyXG5cdCAqIEBwYXJhbSBzRXhwcmVzc2lvbiBBbiBleHByZXNzaW9uIHdpdGggZXNjYXBlIGNoYXJhY3RlcnNcblx0ICogQHJldHVybnMgRXhwcmVzc2lvbiBzdHJpbmcgd2l0aG91dCBlc2NhcGUgY2hhcmFjdGVycyBvciB1bmRlZmluZWRcblx0ICovXG5cdHJlbW92ZUVzY2FwZUNoYXJhY3RlcnM6IGZ1bmN0aW9uIChzRXhwcmVzc2lvbjogc3RyaW5nKSB7XG5cdFx0cmV0dXJuIHNFeHByZXNzaW9uID8gc0V4cHJlc3Npb24ucmVwbGFjZSgvXFxcXD9cXFxcKFt7fV0pL2csIFwiJDFcIikgOiB1bmRlZmluZWQ7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ha2VzIHVwZGF0ZXMgdG8gYSBzdHJpbmdpZmllZCBvYmplY3Qgc28gdGhhdCBpdCB3b3JrcyBwcm9wZXJseSBpbiBhIHRlbXBsYXRlIGJ5IGFkZGluZyB1aTVPYmplY3Q6dHJ1ZS5cblx0ICpcblx0ICogQHBhcmFtIHNTdHJpbmdpZmllZFxuXHQgKiBAcmV0dXJucyBUaGUgdXBkYXRlZCBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIG9iamVjdFxuXHQgKi9cblx0c3RyaW5naWZ5T2JqZWN0OiBmdW5jdGlvbiAoc1N0cmluZ2lmaWVkOiBzdHJpbmcpIHtcblx0XHRpZiAoIXNTdHJpbmdpZmllZCkge1xuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc3Qgb09iamVjdCA9IEpTT04ucGFyc2Uoc1N0cmluZ2lmaWVkKTtcblx0XHRcdGlmICh0eXBlb2Ygb09iamVjdCA9PT0gXCJvYmplY3RcIiAmJiAhQXJyYXkuaXNBcnJheShvT2JqZWN0KSkge1xuXHRcdFx0XHRjb25zdCBvVUk1T2JqZWN0ID0ge1xuXHRcdFx0XHRcdHVpNW9iamVjdDogdHJ1ZVxuXHRcdFx0XHR9O1xuXHRcdFx0XHRPYmplY3QuYXNzaWduKG9VSTVPYmplY3QsIG9PYmplY3QpO1xuXHRcdFx0XHRyZXR1cm4gSlNPTi5zdHJpbmdpZnkob1VJNU9iamVjdCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCBzVHlwZSA9IEFycmF5LmlzQXJyYXkob09iamVjdCkgPyBcIkFycmF5XCIgOiB0eXBlb2Ygb09iamVjdDtcblx0XHRcdFx0TG9nLmVycm9yKGBVbmV4cGVjdGVkIG9iamVjdCB0eXBlIGluIHN0cmluZ2lmeU9iamVjdCAoJHtzVHlwZX0pIC0gb25seSB3b3JrcyB3aXRoIG9iamVjdGApO1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJzdHJpbmdpZnlPYmplY3Qgb25seSB3b3JrcyB3aXRoIG9iamVjdHMhXCIpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogQ3JlYXRlIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBnaXZlbiBkYXRhLCB0YWtpbmcgY2FyZSB0aGF0IGl0IGlzIG5vdCB0cmVhdGVkIGFzIGEgYmluZGluZyBleHByZXNzaW9uLlxuXHQgKlxuXHQgKiBAcGFyYW0gdkRhdGEgVGhlIGRhdGEgdG8gc3RyaW5naWZ5XG5cdCAqIEByZXR1cm5zIFRoZSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIGRhdGEuXG5cdCAqL1xuXHRzdHJpbmdpZnlDdXN0b21EYXRhOiBmdW5jdGlvbiAodkRhdGE6IG9iamVjdCkge1xuXHRcdGNvbnN0IG9PYmplY3Q6IGFueSA9IHtcblx0XHRcdHVpNW9iamVjdDogdHJ1ZVxuXHRcdH07XG5cdFx0b09iamVjdFtcImN1c3RvbURhdGFcIl0gPSB2RGF0YSBpbnN0YW5jZW9mIENvbnRleHQgPyB2RGF0YS5nZXRPYmplY3QoKSA6IHZEYXRhO1xuXHRcdHJldHVybiBKU09OLnN0cmluZ2lmeShvT2JqZWN0KTtcblx0fSxcblxuXHQvKipcblx0ICogUGFyc2VzIHRoZSBnaXZlbiBkYXRhLCBwb3RlbnRpYWxseSB1bndyYXBzIHRoZSBkYXRhLlxuXHQgKlxuXHQgKiBAcGFyYW0gdkRhdGEgVGhlIGRhdGEgdG8gcGFyc2Vcblx0ICogQHJldHVybnMgVGhlIHJlc3VsdCBvZiB0aGUgZGF0YSBwYXJzaW5nXG5cdCAqL1xuXHRwYXJzZUN1c3RvbURhdGE6IGZ1bmN0aW9uICh2RGF0YTogYW55KSB7XG5cdFx0dkRhdGEgPSB0eXBlb2YgdkRhdGEgPT09IFwic3RyaW5nXCIgPyBKU09OLnBhcnNlKHZEYXRhKSA6IHZEYXRhO1xuXHRcdGlmICh2RGF0YSAmJiB2RGF0YS5oYXNPd25Qcm9wZXJ0eShcImN1c3RvbURhdGFcIikpIHtcblx0XHRcdHJldHVybiB2RGF0YVtcImN1c3RvbURhdGFcIl07XG5cdFx0fVxuXHRcdHJldHVybiB2RGF0YTtcblx0fSxcblx0Z2V0Q29udGV4dFBhdGg6IGZ1bmN0aW9uIChvVmFsdWU6IGFueSwgb0ludGVyZmFjZTogYW55KSB7XG5cdFx0Y29uc3Qgc1BhdGggPSBvSW50ZXJmYWNlICYmIG9JbnRlcmZhY2UuY29udGV4dCAmJiBvSW50ZXJmYWNlLmNvbnRleHQuZ2V0UGF0aCgpO1xuXHRcdHJldHVybiBzUGF0aFtzUGF0aC5sZW5ndGggLSAxXSA9PT0gXCIvXCIgPyBzUGF0aC5zbGljZSgwLCAtMSkgOiBzUGF0aDtcblx0fSxcblx0LyoqXG5cdCAqIFJldHVybnMgYSBzdHJpbmdpZmllZCBKU09OIG9iamVjdCBjb250YWluaW5nICBQcmVzZW50YXRpb24gVmFyaWFudCBzb3J0IGNvbmRpdGlvbnMuXG5cdCAqXG5cdCAqIEBwYXJhbSBvQ29udGV4dFxuXHQgKiBAcGFyYW0gb1ByZXNlbnRhdGlvblZhcmlhbnQgUHJlc2VudGF0aW9uIHZhcmlhbnQgQW5ub3RhdGlvblxuXHQgKiBAcGFyYW0gc1ByZXNlbnRhdGlvblZhcmlhbnRQYXRoXG5cdCAqIEByZXR1cm5zIFN0cmluZ2lmaWVkIEpTT04gb2JqZWN0XG5cdCAqL1xuXHRnZXRTb3J0Q29uZGl0aW9uczogZnVuY3Rpb24gKG9Db250ZXh0OiBhbnksIG9QcmVzZW50YXRpb25WYXJpYW50OiBhbnksIHNQcmVzZW50YXRpb25WYXJpYW50UGF0aDogc3RyaW5nKSB7XG5cdFx0aWYgKFxuXHRcdFx0b1ByZXNlbnRhdGlvblZhcmlhbnQgJiZcblx0XHRcdENvbW1vbkhlbHBlci5faXNQcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbihzUHJlc2VudGF0aW9uVmFyaWFudFBhdGgpICYmXG5cdFx0XHRvUHJlc2VudGF0aW9uVmFyaWFudC5Tb3J0T3JkZXJcblx0XHQpIHtcblx0XHRcdGNvbnN0IGFTb3J0Q29uZGl0aW9uczogYW55ID0ge1xuXHRcdFx0XHRzb3J0ZXJzOiBbXVxuXHRcdFx0fTtcblxuXHRcdFx0Y29uc3Qgc0VudGl0eVBhdGggPSBvQ29udGV4dC5nZXRQYXRoKDApLnNwbGl0KFwiQFwiKVswXTtcblx0XHRcdG9QcmVzZW50YXRpb25WYXJpYW50LlNvcnRPcmRlci5mb3JFYWNoKGZ1bmN0aW9uIChvQ29uZGl0aW9uOiBhbnkgPSB7fSkge1xuXHRcdFx0XHRsZXQgb1NvcnRQcm9wZXJ0eTogYW55ID0ge307XG5cdFx0XHRcdGNvbnN0IG9Tb3J0ZXI6IGFueSA9IHt9O1xuXHRcdFx0XHRpZiAob0NvbmRpdGlvbi5EeW5hbWljUHJvcGVydHkpIHtcblx0XHRcdFx0XHRvU29ydFByb3BlcnR5ID0gb0NvbnRleHQuZ2V0TW9kZWwoMCkuZ2V0T2JqZWN0KHNFbnRpdHlQYXRoICsgb0NvbmRpdGlvbi5EeW5hbWljUHJvcGVydHkuJEFubm90YXRpb25QYXRoKT8uTmFtZTtcblx0XHRcdFx0fSBlbHNlIGlmIChvQ29uZGl0aW9uLlByb3BlcnR5KSB7XG5cdFx0XHRcdFx0b1NvcnRQcm9wZXJ0eSA9IG9Db25kaXRpb24uUHJvcGVydHkuJFByb3BlcnR5UGF0aDtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAob1NvcnRQcm9wZXJ0eSkge1xuXHRcdFx0XHRcdG9Tb3J0ZXIubmFtZSA9IG9Tb3J0UHJvcGVydHk7XG5cdFx0XHRcdFx0b1NvcnRlci5kZXNjZW5kaW5nID0gISFvQ29uZGl0aW9uLkRlc2NlbmRpbmc7XG5cdFx0XHRcdFx0YVNvcnRDb25kaXRpb25zLnNvcnRlcnMucHVzaChvU29ydGVyKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJQbGVhc2UgZGVmaW5lIHRoZSByaWdodCBwYXRoIHRvIHRoZSBzb3J0IHByb3BlcnR5XCIpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBKU09OLnN0cmluZ2lmeShhU29ydENvbmRpdGlvbnMpO1xuXHRcdH1cblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9LFxuXHRfaXNQcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbjogZnVuY3Rpb24gKHNBbm5vdGF0aW9uUGF0aDogc3RyaW5nKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdHNBbm5vdGF0aW9uUGF0aC5pbmRleE9mKFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlByZXNlbnRhdGlvblZhcmlhbnRcIikgPiAtMSB8fFxuXHRcdFx0c0Fubm90YXRpb25QYXRoLmluZGV4T2YoXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuU2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudFwiKSA+IC0xXG5cdFx0KTtcblx0fSxcblx0Y3JlYXRlUHJlc2VudGF0aW9uUGF0aENvbnRleHQ6IGZ1bmN0aW9uIChvUHJlc2VudGF0aW9uQ29udGV4dDogYW55KSB7XG5cdFx0Y29uc3QgYVBhdGhzID0gb1ByZXNlbnRhdGlvbkNvbnRleHQuc1BhdGguc3BsaXQoXCJAXCIpIHx8IFtdO1xuXHRcdGNvbnN0IG9Nb2RlbCA9IG9QcmVzZW50YXRpb25Db250ZXh0LmdldE1vZGVsKCk7XG5cdFx0aWYgKGFQYXRocy5sZW5ndGggJiYgYVBhdGhzW2FQYXRocy5sZW5ndGggLSAxXS5pbmRleE9mKFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuU2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudFwiKSA+IC0xKSB7XG5cdFx0XHRjb25zdCBzUGF0aCA9IG9QcmVzZW50YXRpb25Db250ZXh0LnNQYXRoLnNwbGl0KFwiL1ByZXNlbnRhdGlvblZhcmlhbnRcIilbMF07XG5cdFx0XHRyZXR1cm4gb01vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KGAke3NQYXRofUBzYXB1aS5uYW1lYCk7XG5cdFx0fVxuXHRcdHJldHVybiBvTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoYCR7b1ByZXNlbnRhdGlvbkNvbnRleHQuc1BhdGh9QHNhcHVpLm5hbWVgKTtcblx0fSxcblx0Z2V0UHJlc3NIYW5kbGVyRm9yRGF0YUZpZWxkRm9ySUJOOiBmdW5jdGlvbiAob0RhdGFGaWVsZDogYW55LCBzQ29udGV4dDogc3RyaW5nLCBiTmF2aWdhdGVXaXRoQ29uZmlybWF0aW9uRGlhbG9nOiBib29sZWFuKSB7XG5cdFx0Y29uc3QgbU5hdmlnYXRpb25QYXJhbWV0ZXJzOiBhbnkgPSB7XG5cdFx0XHRuYXZpZ2F0aW9uQ29udGV4dHM6IHNDb250ZXh0ID8gc0NvbnRleHQgOiBcIiR7JHNvdXJjZT4vfS5nZXRCaW5kaW5nQ29udGV4dCgpXCJcblx0XHR9O1xuXHRcdGlmIChvRGF0YUZpZWxkLlJlcXVpcmVzQ29udGV4dCAmJiAhb0RhdGFGaWVsZC5JbmxpbmUgJiYgYk5hdmlnYXRlV2l0aENvbmZpcm1hdGlvbkRpYWxvZykge1xuXHRcdFx0bU5hdmlnYXRpb25QYXJhbWV0ZXJzLmFwcGxpY2FibGVDb250ZXh0cyA9XG5cdFx0XHRcdFwiJHtpbnRlcm5hbD5pYm4vXCIgKyBvRGF0YUZpZWxkLlNlbWFudGljT2JqZWN0ICsgXCItXCIgKyBvRGF0YUZpZWxkLkFjdGlvbiArIFwiL2FBcHBsaWNhYmxlL31cIjtcblx0XHRcdG1OYXZpZ2F0aW9uUGFyYW1ldGVycy5ub3RBcHBsaWNhYmxlQ29udGV4dHMgPVxuXHRcdFx0XHRcIiR7aW50ZXJuYWw+aWJuL1wiICsgb0RhdGFGaWVsZC5TZW1hbnRpY09iamVjdCArIFwiLVwiICsgb0RhdGFGaWVsZC5BY3Rpb24gKyBcIi9hTm90QXBwbGljYWJsZS99XCI7XG5cdFx0XHRtTmF2aWdhdGlvblBhcmFtZXRlcnMubGFiZWwgPSB0aGlzLmFkZFNpbmdsZVF1b3RlcyhvRGF0YUZpZWxkLkxhYmVsLCB0cnVlKTtcblx0XHR9XG5cdFx0aWYgKG9EYXRhRmllbGQuTWFwcGluZykge1xuXHRcdFx0bU5hdmlnYXRpb25QYXJhbWV0ZXJzLnNlbWFudGljT2JqZWN0TWFwcGluZyA9IHRoaXMuYWRkU2luZ2xlUXVvdGVzKEpTT04uc3RyaW5naWZ5KG9EYXRhRmllbGQuTWFwcGluZykpO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5nZW5lcmF0ZUZ1bmN0aW9uKFxuXHRcdFx0Yk5hdmlnYXRlV2l0aENvbmZpcm1hdGlvbkRpYWxvZyA/IFwiLl9pbnRlbnRCYXNlZE5hdmlnYXRpb24ubmF2aWdhdGVXaXRoQ29uZmlybWF0aW9uRGlhbG9nXCIgOiBcIi5faW50ZW50QmFzZWROYXZpZ2F0aW9uLm5hdmlnYXRlXCIsXG5cdFx0XHR0aGlzLmFkZFNpbmdsZVF1b3RlcyhvRGF0YUZpZWxkLlNlbWFudGljT2JqZWN0KSxcblx0XHRcdHRoaXMuYWRkU2luZ2xlUXVvdGVzKG9EYXRhRmllbGQuQWN0aW9uKSxcblx0XHRcdHRoaXMub2JqZWN0VG9TdHJpbmcobU5hdmlnYXRpb25QYXJhbWV0ZXJzKVxuXHRcdCk7XG5cdH0sXG5cdGdldEVudGl0eVNldDogZnVuY3Rpb24gKG9Db250ZXh0OiBhbnkpIHtcblx0XHRjb25zdCBzUGF0aCA9IG9Db250ZXh0LmdldFBhdGgoKTtcblx0XHRyZXR1cm4gTW9kZWxIZWxwZXIuZ2V0RW50aXR5U2V0UGF0aChzUGF0aCk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEhhbmRsZXMgdGhlIHZpc2liaWxpdHkgb2YgZm9ybSBtZW51IGFjdGlvbnMgYm90aCBpbiBwYXRoIGJhc2VkIGFuZCBzdGF0aWMgdmFsdWUgc2NlbmFyaW9zLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG1lbWJlcm9mIHNhcC5mZS5tYWNyb3MuQ29tbW9uSGVscGVyXG5cdCAqIEBwYXJhbSBzVmlzaWJsZVZhbHVlIEVpdGhlciBzdGF0aWMgYm9vbGVhbiB2YWx1ZXMgb3IgQXJyYXkgb2YgcGF0aCBleHByZXNzaW9ucyBmb3IgdmlzaWJpbGl0eSBvZiBtZW51IGJ1dHRvbi5cblx0ICogQHJldHVybnMgVGhlIGJpbmRpbmcgZXhwcmVzc2lvbiBkZXRlcm1pbmluZyB0aGUgdmlzaWJpbGl0eSBvZiBtZW51IGFjdGlvbnMuXG5cdCAqL1xuXHRoYW5kbGVWaXNpYmlsaXR5T2ZNZW51QWN0aW9uczogZnVuY3Rpb24gKHNWaXNpYmxlVmFsdWU6IGFueSkge1xuXHRcdGNvbnN0IGNvbWJpbmVkQ29uZGl0aW9ucyA9IFtdO1xuXHRcdGlmIChBcnJheS5pc0FycmF5KHNWaXNpYmxlVmFsdWUpKSB7XG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHNWaXNpYmxlVmFsdWUubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYgKHNWaXNpYmxlVmFsdWVbaV0uaW5kZXhPZihcIntcIikgPiAtMSAmJiBzVmlzaWJsZVZhbHVlW2ldLmluZGV4T2YoXCJ7PVwiKSA9PT0gLTEpIHtcblx0XHRcdFx0XHRzVmlzaWJsZVZhbHVlW2ldID0gXCJ7PVwiICsgc1Zpc2libGVWYWx1ZVtpXSArIFwifVwiO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChzVmlzaWJsZVZhbHVlW2ldLnNwbGl0KFwiez1cIikubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdHNWaXNpYmxlVmFsdWVbaV0gPSBzVmlzaWJsZVZhbHVlW2ldLnNwbGl0KFwiez1cIilbMV0uc2xpY2UoMCwgLTEpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNvbWJpbmVkQ29uZGl0aW9ucy5wdXNoKGAoJHtzVmlzaWJsZVZhbHVlW2ldfSlgKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGNvbWJpbmVkQ29uZGl0aW9ucy5sZW5ndGggPiAwID8gYHs9ICR7Y29tYmluZWRDb25kaXRpb25zLmpvaW4oXCIgfHwgXCIpfX1gIDogc1Zpc2libGVWYWx1ZTtcblx0fSxcblx0LyoqXG5cdCAqIE1ldGhvZCB0byBkbyB0aGUgY2FsY3VsYXRpb24gb2YgY3JpdGljYWxpdHkgaW4gY2FzZSBDcml0aWNhbGl0eUNhbGN1bGF0aW9uIHByZXNlbnQgaW4gdGhlIGFubm90YXRpb25cblx0ICpcblx0ICogVGhlIGNhbGN1bGF0aW9uIGlzIGRvbmUgYnkgY29tcGFyaW5nIGEgdmFsdWUgdG8gdGhlIHRocmVzaG9sZCB2YWx1ZXMgcmVsZXZhbnQgZm9yIHRoZSBzcGVjaWZpZWQgaW1wcm92ZW1lbnQgZGlyZWN0aW9uLlxuXHQgKiBGb3IgaW1wcm92ZW1lbnQgZGlyZWN0aW9uIFRhcmdldCwgdGhlIGNyaXRpY2FsaXR5IGlzIGNhbGN1bGF0ZWQgdXNpbmcgYm90aCBsb3cgYW5kIGhpZ2ggdGhyZXNob2xkIHZhbHVlcy4gSXQgd2lsbCBiZVxuXHQgKlxuXHQgKiAtIFBvc2l0aXZlIGlmIHRoZSB2YWx1ZSBpcyBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gQWNjZXB0YW5jZVJhbmdlTG93VmFsdWUgYW5kIGxvd2VyIHRoYW4gb3IgZXF1YWwgdG8gQWNjZXB0YW5jZVJhbmdlSGlnaFZhbHVlXG5cdCAqIC0gTmV1dHJhbCBpZiB0aGUgdmFsdWUgaXMgZ3JlYXRlciB0aGFuIG9yIGVxdWFsIHRvIFRvbGVyYW5jZVJhbmdlTG93VmFsdWUgYW5kIGxvd2VyIHRoYW4gQWNjZXB0YW5jZVJhbmdlTG93VmFsdWUgT1IgZ3JlYXRlciB0aGFuIEFjY2VwdGFuY2VSYW5nZUhpZ2hWYWx1ZSBhbmQgbG93ZXIgdGhhbiBvciBlcXVhbCB0byBUb2xlcmFuY2VSYW5nZUhpZ2hWYWx1ZVxuXHQgKiAtIENyaXRpY2FsIGlmIHRoZSB2YWx1ZSBpcyBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gRGV2aWF0aW9uUmFuZ2VMb3dWYWx1ZSBhbmQgbG93ZXIgdGhhbiBUb2xlcmFuY2VSYW5nZUxvd1ZhbHVlIE9SIGdyZWF0ZXIgdGhhbiBUb2xlcmFuY2VSYW5nZUhpZ2hWYWx1ZSBhbmQgbG93ZXIgdGhhbiBvciBlcXVhbCB0byBEZXZpYXRpb25SYW5nZUhpZ2hWYWx1ZVxuXHQgKiAtIE5lZ2F0aXZlIGlmIHRoZSB2YWx1ZSBpcyBsb3dlciB0aGFuIERldmlhdGlvblJhbmdlTG93VmFsdWUgb3IgZ3JlYXRlciB0aGFuIERldmlhdGlvblJhbmdlSGlnaFZhbHVlXG5cdCAqXG5cdCAqIEZvciBpbXByb3ZlbWVudCBkaXJlY3Rpb24gTWluaW1pemUsIHRoZSBjcml0aWNhbGl0eSBpcyBjYWxjdWxhdGVkIHVzaW5nIHRoZSBoaWdoIHRocmVzaG9sZCB2YWx1ZXMuIEl0IGlzXG5cdCAqIC0gUG9zaXRpdmUgaWYgdGhlIHZhbHVlIGlzIGxvd2VyIHRoYW4gb3IgZXF1YWwgdG8gQWNjZXB0YW5jZVJhbmdlSGlnaFZhbHVlXG5cdCAqIC0gTmV1dHJhbCBpZiB0aGUgdmFsdWUgaXMgZ3JlYXRlciB0aGFuIEFjY2VwdGFuY2VSYW5nZUhpZ2hWYWx1ZSBhbmQgbG93ZXIgdGhhbiBvciBlcXVhbCB0byBUb2xlcmFuY2VSYW5nZUhpZ2hWYWx1ZVxuXHQgKiAtIENyaXRpY2FsIGlmIHRoZSB2YWx1ZSBpcyBncmVhdGVyIHRoYW4gVG9sZXJhbmNlUmFuZ2VIaWdoVmFsdWUgYW5kIGxvd2VyIHRoYW4gb3IgZXF1YWwgdG8gRGV2aWF0aW9uUmFuZ2VIaWdoVmFsdWVcblx0ICogLSBOZWdhdGl2ZSBpZiB0aGUgdmFsdWUgaXMgZ3JlYXRlciB0aGFuIERldmlhdGlvblJhbmdlSGlnaFZhbHVlXG5cdCAqXG5cdCAqIEZvciBpbXByb3ZlbWVudCBkaXJlY3Rpb24gTWF4aW1pemUsIHRoZSBjcml0aWNhbGl0eSBpcyBjYWxjdWxhdGVkIHVzaW5nIHRoZSBsb3cgdGhyZXNob2xkIHZhbHVlcy4gSXQgaXNcblx0ICpcblx0ICogLSBQb3NpdGl2ZSBpZiB0aGUgdmFsdWUgaXMgZ3JlYXRlciB0aGFuIG9yIGVxdWFsIHRvIEFjY2VwdGFuY2VSYW5nZUxvd1ZhbHVlXG5cdCAqIC0gTmV1dHJhbCBpZiB0aGUgdmFsdWUgaXMgbGVzcyB0aGFuIEFjY2VwdGFuY2VSYW5nZUxvd1ZhbHVlIGFuZCBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gVG9sZXJhbmNlUmFuZ2VMb3dWYWx1ZVxuXHQgKiAtIENyaXRpY2FsIGlmIHRoZSB2YWx1ZSBpcyBsb3dlciB0aGFuIFRvbGVyYW5jZVJhbmdlTG93VmFsdWUgYW5kIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0byBEZXZpYXRpb25SYW5nZUxvd1ZhbHVlXG5cdCAqIC0gTmVnYXRpdmUgaWYgdGhlIHZhbHVlIGlzIGxvd2VyIHRoYW4gRGV2aWF0aW9uUmFuZ2VMb3dWYWx1ZVxuXHQgKlxuXHQgKiBUaHJlc2hvbGRzIGFyZSBvcHRpb25hbC4gRm9yIHVuYXNzaWduZWQgdmFsdWVzLCBkZWZhdWx0cyBhcmUgZGV0ZXJtaW5lZCBpbiB0aGlzIG9yZGVyOlxuXHQgKlxuXHQgKiAtIEZvciBEZXZpYXRpb25SYW5nZSwgYW4gb21pdHRlZCBMb3dWYWx1ZSB0cmFuc2xhdGVzIGludG8gdGhlIHNtYWxsZXN0IHBvc3NpYmxlIG51bWJlciAoLUlORiksIGFuIG9taXR0ZWQgSGlnaFZhbHVlIHRyYW5zbGF0ZXMgaW50byB0aGUgbGFyZ2VzdCBwb3NzaWJsZSBudW1iZXIgKCtJTkYpXG5cdCAqIC0gRm9yIFRvbGVyYW5jZVJhbmdlLCBhbiBvbWl0dGVkIExvd1ZhbHVlIHdpbGwgYmUgaW5pdGlhbGl6ZWQgd2l0aCBEZXZpYXRpb25SYW5nZUxvd1ZhbHVlLCBhbiBvbWl0dGVkIEhpZ2hWYWx1ZSB3aWxsIGJlIGluaXRpYWxpemVkIHdpdGggRGV2aWF0aW9uUmFuZ2VIaWdoVmFsdWVcblx0ICogLSBGb3IgQWNjZXB0YW5jZVJhbmdlLCBhbiBvbWl0dGVkIExvd1ZhbHVlIHdpbGwgYmUgaW5pdGlhbGl6ZWQgd2l0aCBUb2xlcmFuY2VSYW5nZUxvd1ZhbHVlLCBhbiBvbWl0dGVkIEhpZ2hWYWx1ZSB3aWxsIGJlIGluaXRpYWxpemVkIHdpdGggVG9sZXJhbmNlUmFuZ2VIaWdoVmFsdWUuXG5cdCAqXG5cdCAqIEBwYXJhbSBzSW1wcm92ZW1lbnREaXJlY3Rpb24gSW1wcm92ZW1lbnREaXJlY3Rpb24gdG8gYmUgdXNlZCBmb3IgY3JlYXRpbmcgdGhlIGNyaXRpY2FsaXR5IGJpbmRpbmdcblx0ICogQHBhcmFtIHNWYWx1ZSBWYWx1ZSBmcm9tIERhdGFwb2ludCB0byBiZSBtZWFzdXJlZFxuXHQgKiBAcGFyYW0gc0RldmlhdGlvbkxvdyBFeHByZXNzaW9uQmluZGluZyBmb3IgTG93ZXIgRGV2aWF0aW9uIGxldmVsXG5cdCAqIEBwYXJhbSBzVG9sZXJhbmNlTG93IEV4cHJlc3Npb25CaW5kaW5nIGZvciBMb3dlciBUb2xlcmFuY2UgbGV2ZWxcblx0ICogQHBhcmFtIHNBY2NlcHRhbmNlTG93IEV4cHJlc3Npb25CaW5kaW5nIGZvciBMb3dlciBBY2NlcHRhbmNlIGxldmVsXG5cdCAqIEBwYXJhbSBzQWNjZXB0YW5jZUhpZ2ggRXhwcmVzc2lvbkJpbmRpbmcgZm9yIEhpZ2hlciBBY2NlcHRhbmNlIGxldmVsXG5cdCAqIEBwYXJhbSBzVG9sZXJhbmNlSGlnaCBFeHByZXNzaW9uQmluZGluZyBmb3IgSGlnaGVyIFRvbGVyYW5jZSBsZXZlbFxuXHQgKiBAcGFyYW0gc0RldmlhdGlvbkhpZ2ggRXhwcmVzc2lvbkJpbmRpbmcgZm9yIEhpZ2hlciBEZXZpYXRpb24gbGV2ZWxcblx0ICogQHJldHVybnMgUmV0dXJucyBjcml0aWNhbGl0eSBjYWxjdWxhdGlvbiBhcyBleHByZXNzaW9uIGJpbmRpbmdcblx0ICovXG5cdGdldENyaXRpY2FsaXR5Q2FsY3VsYXRpb25CaW5kaW5nOiBmdW5jdGlvbiAoXG5cdFx0c0ltcHJvdmVtZW50RGlyZWN0aW9uOiBzdHJpbmcsXG5cdFx0c1ZhbHVlOiBzdHJpbmcsXG5cdFx0c0RldmlhdGlvbkxvdzogc3RyaW5nIHwgbnVtYmVyLFxuXHRcdHNUb2xlcmFuY2VMb3c6IHN0cmluZyB8IG51bWJlcixcblx0XHRzQWNjZXB0YW5jZUxvdzogc3RyaW5nIHwgbnVtYmVyLFxuXHRcdHNBY2NlcHRhbmNlSGlnaDogc3RyaW5nIHwgbnVtYmVyLFxuXHRcdHNUb2xlcmFuY2VIaWdoOiBzdHJpbmcgfCBudW1iZXIsXG5cdFx0c0RldmlhdGlvbkhpZ2g6IHN0cmluZyB8IG51bWJlclxuXHQpIHtcblx0XHRsZXQgc0NyaXRpY2FsaXR5RXhwcmVzc2lvbjogdHlwZW9mIFZhbHVlQ29sb3IgfCBzdHJpbmcgPSBWYWx1ZUNvbG9yLk5ldXRyYWw7IC8vIERlZmF1bHQgQ3JpdGljYWxpdHkgU3RhdGVcblxuXHRcdHNWYWx1ZSA9IGAlJHtzVmFsdWV9YDtcblxuXHRcdC8vIFNldHRpbmcgVW5hc3NpZ25lZCBWYWx1ZXNcblx0XHRzRGV2aWF0aW9uTG93ID0gc0RldmlhdGlvbkxvdyB8fCAtSW5maW5pdHk7XG5cdFx0c1RvbGVyYW5jZUxvdyA9IHNUb2xlcmFuY2VMb3cgfHwgc0RldmlhdGlvbkxvdztcblx0XHRzQWNjZXB0YW5jZUxvdyA9IHNBY2NlcHRhbmNlTG93IHx8IHNUb2xlcmFuY2VMb3c7XG5cdFx0c0RldmlhdGlvbkhpZ2ggPSBzRGV2aWF0aW9uSGlnaCB8fCBJbmZpbml0eTtcblx0XHRzVG9sZXJhbmNlSGlnaCA9IHNUb2xlcmFuY2VIaWdoIHx8IHNEZXZpYXRpb25IaWdoO1xuXHRcdHNBY2NlcHRhbmNlSGlnaCA9IHNBY2NlcHRhbmNlSGlnaCB8fCBzVG9sZXJhbmNlSGlnaDtcblxuXHRcdC8vIERlYWxpbmcgd2l0aCBEZWNpbWFsIGFuZCBQYXRoIGJhc2VkIGJpbmdkaW5nc1xuXHRcdHNEZXZpYXRpb25Mb3cgPSBzRGV2aWF0aW9uTG93ICYmICgrc0RldmlhdGlvbkxvdyA/ICtzRGV2aWF0aW9uTG93IDogYCUke3NEZXZpYXRpb25Mb3d9YCk7XG5cdFx0c1RvbGVyYW5jZUxvdyA9IHNUb2xlcmFuY2VMb3cgJiYgKCtzVG9sZXJhbmNlTG93ID8gK3NUb2xlcmFuY2VMb3cgOiBgJSR7c1RvbGVyYW5jZUxvd31gKTtcblx0XHRzQWNjZXB0YW5jZUxvdyA9IHNBY2NlcHRhbmNlTG93ICYmICgrc0FjY2VwdGFuY2VMb3cgPyArc0FjY2VwdGFuY2VMb3cgOiBgJSR7c0FjY2VwdGFuY2VMb3d9YCk7XG5cdFx0c0FjY2VwdGFuY2VIaWdoID0gc0FjY2VwdGFuY2VIaWdoICYmICgrc0FjY2VwdGFuY2VIaWdoID8gK3NBY2NlcHRhbmNlSGlnaCA6IGAlJHtzQWNjZXB0YW5jZUhpZ2h9YCk7XG5cdFx0c1RvbGVyYW5jZUhpZ2ggPSBzVG9sZXJhbmNlSGlnaCAmJiAoK3NUb2xlcmFuY2VIaWdoID8gK3NUb2xlcmFuY2VIaWdoIDogYCUke3NUb2xlcmFuY2VIaWdofWApO1xuXHRcdHNEZXZpYXRpb25IaWdoID0gc0RldmlhdGlvbkhpZ2ggJiYgKCtzRGV2aWF0aW9uSGlnaCA/ICtzRGV2aWF0aW9uSGlnaCA6IGAlJHtzRGV2aWF0aW9uSGlnaH1gKTtcblxuXHRcdC8vIENyZWF0aW5nIHJ1bnRpbWUgZXhwcmVzc2lvbiBiaW5kaW5nIGZyb20gY3JpdGljYWxpdHkgY2FsY3VsYXRpb24gZm9yIENyaXRpY2FsaXR5IFN0YXRlXG5cdFx0aWYgKHNJbXByb3ZlbWVudERpcmVjdGlvbi5pbmRleE9mKFwiTWluaW1pemVcIikgPiAtMSkge1xuXHRcdFx0c0NyaXRpY2FsaXR5RXhwcmVzc2lvbiA9XG5cdFx0XHRcdFwiez0gXCIgK1xuXHRcdFx0XHRzVmFsdWUgK1xuXHRcdFx0XHRcIiA8PSBcIiArXG5cdFx0XHRcdHNBY2NlcHRhbmNlSGlnaCArXG5cdFx0XHRcdFwiID8gJ1wiICtcblx0XHRcdFx0VmFsdWVDb2xvci5Hb29kICtcblx0XHRcdFx0XCInIDogXCIgK1xuXHRcdFx0XHRzVmFsdWUgK1xuXHRcdFx0XHRcIiA8PSBcIiArXG5cdFx0XHRcdHNUb2xlcmFuY2VIaWdoICtcblx0XHRcdFx0XCIgPyAnXCIgK1xuXHRcdFx0XHRWYWx1ZUNvbG9yLk5ldXRyYWwgK1xuXHRcdFx0XHRcIicgOiBcIiArXG5cdFx0XHRcdFwiKFwiICtcblx0XHRcdFx0c0RldmlhdGlvbkhpZ2ggK1xuXHRcdFx0XHRcIiAmJiBcIiArXG5cdFx0XHRcdHNWYWx1ZSArXG5cdFx0XHRcdFwiIDw9IFwiICtcblx0XHRcdFx0c0RldmlhdGlvbkhpZ2ggK1xuXHRcdFx0XHRcIikgPyAnXCIgK1xuXHRcdFx0XHRWYWx1ZUNvbG9yLkNyaXRpY2FsICtcblx0XHRcdFx0XCInIDogJ1wiICtcblx0XHRcdFx0VmFsdWVDb2xvci5FcnJvciArXG5cdFx0XHRcdFwiJyB9XCI7XG5cdFx0fSBlbHNlIGlmIChzSW1wcm92ZW1lbnREaXJlY3Rpb24uaW5kZXhPZihcIk1heGltaXplXCIpID4gLTEpIHtcblx0XHRcdHNDcml0aWNhbGl0eUV4cHJlc3Npb24gPVxuXHRcdFx0XHRcIns9IFwiICtcblx0XHRcdFx0c1ZhbHVlICtcblx0XHRcdFx0XCIgPj0gXCIgK1xuXHRcdFx0XHRzQWNjZXB0YW5jZUxvdyArXG5cdFx0XHRcdFwiID8gJ1wiICtcblx0XHRcdFx0VmFsdWVDb2xvci5Hb29kICtcblx0XHRcdFx0XCInIDogXCIgK1xuXHRcdFx0XHRzVmFsdWUgK1xuXHRcdFx0XHRcIiA+PSBcIiArXG5cdFx0XHRcdHNUb2xlcmFuY2VMb3cgK1xuXHRcdFx0XHRcIiA/ICdcIiArXG5cdFx0XHRcdFZhbHVlQ29sb3IuTmV1dHJhbCArXG5cdFx0XHRcdFwiJyA6IFwiICtcblx0XHRcdFx0XCIoXCIgK1xuXHRcdFx0XHRzRGV2aWF0aW9uTG93ICtcblx0XHRcdFx0XCIgJiYgXCIgK1xuXHRcdFx0XHRzVmFsdWUgK1xuXHRcdFx0XHRcIiA+PSBcIiArXG5cdFx0XHRcdHNEZXZpYXRpb25Mb3cgK1xuXHRcdFx0XHRcIikgPyAnXCIgK1xuXHRcdFx0XHRWYWx1ZUNvbG9yLkNyaXRpY2FsICtcblx0XHRcdFx0XCInIDogJ1wiICtcblx0XHRcdFx0VmFsdWVDb2xvci5FcnJvciArXG5cdFx0XHRcdFwiJyB9XCI7XG5cdFx0fSBlbHNlIGlmIChzSW1wcm92ZW1lbnREaXJlY3Rpb24uaW5kZXhPZihcIlRhcmdldFwiKSA+IC0xKSB7XG5cdFx0XHRzQ3JpdGljYWxpdHlFeHByZXNzaW9uID1cblx0XHRcdFx0XCJ7PSAoXCIgK1xuXHRcdFx0XHRzVmFsdWUgK1xuXHRcdFx0XHRcIiA8PSBcIiArXG5cdFx0XHRcdHNBY2NlcHRhbmNlSGlnaCArXG5cdFx0XHRcdFwiICYmIFwiICtcblx0XHRcdFx0c1ZhbHVlICtcblx0XHRcdFx0XCIgPj0gXCIgK1xuXHRcdFx0XHRzQWNjZXB0YW5jZUxvdyArXG5cdFx0XHRcdFwiKSA/ICdcIiArXG5cdFx0XHRcdFZhbHVlQ29sb3IuR29vZCArXG5cdFx0XHRcdFwiJyA6IFwiICtcblx0XHRcdFx0XCIoKFwiICtcblx0XHRcdFx0c1ZhbHVlICtcblx0XHRcdFx0XCIgPj0gXCIgK1xuXHRcdFx0XHRzVG9sZXJhbmNlTG93ICtcblx0XHRcdFx0XCIgJiYgXCIgK1xuXHRcdFx0XHRzVmFsdWUgK1xuXHRcdFx0XHRcIiA8IFwiICtcblx0XHRcdFx0c0FjY2VwdGFuY2VMb3cgK1xuXHRcdFx0XHRcIikgfHwgKFwiICtcblx0XHRcdFx0c1ZhbHVlICtcblx0XHRcdFx0XCIgPiBcIiArXG5cdFx0XHRcdHNBY2NlcHRhbmNlSGlnaCArXG5cdFx0XHRcdFwiICYmIFwiICtcblx0XHRcdFx0c1ZhbHVlICtcblx0XHRcdFx0XCIgPD0gXCIgK1xuXHRcdFx0XHRzVG9sZXJhbmNlSGlnaCArXG5cdFx0XHRcdFwiKSkgPyAnXCIgK1xuXHRcdFx0XHRWYWx1ZUNvbG9yLk5ldXRyYWwgK1xuXHRcdFx0XHRcIicgOiBcIiArXG5cdFx0XHRcdFwiKChcIiArXG5cdFx0XHRcdHNEZXZpYXRpb25Mb3cgK1xuXHRcdFx0XHRcIiAmJiAoXCIgK1xuXHRcdFx0XHRzVmFsdWUgK1xuXHRcdFx0XHRcIiA+PSBcIiArXG5cdFx0XHRcdHNEZXZpYXRpb25Mb3cgK1xuXHRcdFx0XHRcIikgJiYgKFwiICtcblx0XHRcdFx0c1ZhbHVlICtcblx0XHRcdFx0XCIgPCBcIiArXG5cdFx0XHRcdHNUb2xlcmFuY2VMb3cgK1xuXHRcdFx0XHRcIikpIHx8ICgoXCIgK1xuXHRcdFx0XHRzVmFsdWUgK1xuXHRcdFx0XHRcIiA+IFwiICtcblx0XHRcdFx0c1RvbGVyYW5jZUhpZ2ggK1xuXHRcdFx0XHRcIikgJiYgXCIgK1xuXHRcdFx0XHRzRGV2aWF0aW9uSGlnaCArXG5cdFx0XHRcdFwiICYmIChcIiArXG5cdFx0XHRcdHNWYWx1ZSArXG5cdFx0XHRcdFwiIDw9IFwiICtcblx0XHRcdFx0c0RldmlhdGlvbkhpZ2ggK1xuXHRcdFx0XHRcIikpKSA/ICdcIiArXG5cdFx0XHRcdFZhbHVlQ29sb3IuQ3JpdGljYWwgK1xuXHRcdFx0XHRcIicgOiAnXCIgK1xuXHRcdFx0XHRWYWx1ZUNvbG9yLkVycm9yICtcblx0XHRcdFx0XCInIH1cIjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0TG9nLndhcm5pbmcoXCJDYXNlIG5vdCBzdXBwb3J0ZWQsIHJldHVybmluZyB0aGUgZGVmYXVsdCBWYWx1ZSBOZXV0cmFsXCIpO1xuXHRcdH1cblxuXHRcdHJldHVybiBzQ3JpdGljYWxpdHlFeHByZXNzaW9uO1xuXHR9LFxuXHQvKipcblx0ICogVGhpcyBmdW5jdGlvbiByZXR1cm5zIHRoZSBjcml0aWNhbGl0eSBpbmRpY2F0b3IgZnJvbSBhbm5vdGF0aW9ucyBpZiBjcml0aWNhbGl0eSBpcyBFbnVtTWVtYmVyLlxuXHQgKlxuXHQgKiBAcGFyYW0gc0NyaXRpY2FsaXR5IENyaXRpY2FsaXR5IHByb3ZpZGVkIGluIHRoZSBhbm5vdGF0aW9uc1xuXHQgKiBAcmV0dXJucyBSZXR1cm4gdGhlIGluZGljYXRvciBmb3IgY3JpdGljYWxpdHlcblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9nZXRDcml0aWNhbGl0eUZyb21FbnVtOiBmdW5jdGlvbiAoc0NyaXRpY2FsaXR5OiBzdHJpbmcpIHtcblx0XHRsZXQgc0luZGljYXRvcjtcblx0XHRpZiAoc0NyaXRpY2FsaXR5ID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNyaXRpY2FsaXR5VHlwZS9OZWdhdGl2ZVwiKSB7XG5cdFx0XHRzSW5kaWNhdG9yID0gVmFsdWVDb2xvci5FcnJvcjtcblx0XHR9IGVsc2UgaWYgKHNDcml0aWNhbGl0eSA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5Dcml0aWNhbGl0eVR5cGUvUG9zaXRpdmVcIikge1xuXHRcdFx0c0luZGljYXRvciA9IFZhbHVlQ29sb3IuR29vZDtcblx0XHR9IGVsc2UgaWYgKHNDcml0aWNhbGl0eSA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5Dcml0aWNhbGl0eVR5cGUvQ3JpdGljYWxcIikge1xuXHRcdFx0c0luZGljYXRvciA9IFZhbHVlQ29sb3IuQ3JpdGljYWw7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNJbmRpY2F0b3IgPSBWYWx1ZUNvbG9yLk5ldXRyYWw7XG5cdFx0fVxuXHRcdHJldHVybiBzSW5kaWNhdG9yO1xuXHR9LFxuXHRnZXRWYWx1ZUNyaXRpY2FsaXR5OiBmdW5jdGlvbiAoc0RpbWVuc2lvbjogYW55LCBhVmFsdWVDcml0aWNhbGl0eTogYW55KSB7XG5cdFx0bGV0IHNSZXN1bHQ7XG5cdFx0Y29uc3QgYVZhbHVlczogYW55W10gPSBbXTtcblx0XHRpZiAoYVZhbHVlQ3JpdGljYWxpdHkgJiYgYVZhbHVlQ3JpdGljYWxpdHkubGVuZ3RoID4gMCkge1xuXHRcdFx0YVZhbHVlQ3JpdGljYWxpdHkuZm9yRWFjaChmdW5jdGlvbiAob1ZDOiBhbnkpIHtcblx0XHRcdFx0aWYgKG9WQy5WYWx1ZSAmJiBvVkMuQ3JpdGljYWxpdHkuJEVudW1NZW1iZXIpIHtcblx0XHRcdFx0XHRjb25zdCBzVmFsdWUgPVxuXHRcdFx0XHRcdFx0XCIke1wiICtcblx0XHRcdFx0XHRcdHNEaW1lbnNpb24gK1xuXHRcdFx0XHRcdFx0XCJ9ID09PSAnXCIgK1xuXHRcdFx0XHRcdFx0b1ZDLlZhbHVlICtcblx0XHRcdFx0XHRcdFwiJyA/ICdcIiArXG5cdFx0XHRcdFx0XHRDb21tb25IZWxwZXIuX2dldENyaXRpY2FsaXR5RnJvbUVudW0ob1ZDLkNyaXRpY2FsaXR5LiRFbnVtTWVtYmVyKSArXG5cdFx0XHRcdFx0XHRcIidcIjtcblx0XHRcdFx0XHRhVmFsdWVzLnB1c2goc1ZhbHVlKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0XHRzUmVzdWx0ID0gYVZhbHVlcy5sZW5ndGggPiAwICYmIGFWYWx1ZXMuam9pbihcIiA6IFwiKSArIFwiIDogdW5kZWZpbmVkXCI7XG5cdFx0fVxuXHRcdHJldHVybiBzUmVzdWx0ID8gXCJ7PSBcIiArIHNSZXN1bHQgKyBcIiB9XCIgOiB1bmRlZmluZWQ7XG5cdH0sXG5cdC8qKlxuXHQgKiBUbyBmZXRjaCBtZWFzdXJlIGF0dHJpYnV0ZSBpbmRleC5cblx0ICpcblx0ICogQHBhcmFtIGlNZWFzdXJlIENoYXJ0IEFubm90YXRpb25zXG5cdCAqIEBwYXJhbSBvQ2hhcnRBbm5vdGF0aW9ucyBDaGFydCBBbm5vdGF0aW9uc1xuXHQgKiBAcmV0dXJucyBNZWFzdXJlQXR0cmlidXRlIGluZGV4LlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0Z2V0TWVhc3VyZUF0dHJpYnV0ZUluZGV4OiBmdW5jdGlvbiAoaU1lYXN1cmU6IGFueSwgb0NoYXJ0QW5ub3RhdGlvbnM6IGFueSkge1xuXHRcdGxldCBhTWVhc3VyZXMsIHNNZWFzdXJlUHJvcGVydHlQYXRoO1xuXHRcdGlmIChvQ2hhcnRBbm5vdGF0aW9ucz8uTWVhc3VyZXM/Lmxlbmd0aCA+IDApIHtcblx0XHRcdGFNZWFzdXJlcyA9IG9DaGFydEFubm90YXRpb25zLk1lYXN1cmVzO1xuXHRcdFx0c01lYXN1cmVQcm9wZXJ0eVBhdGggPSBhTWVhc3VyZXNbaU1lYXN1cmVdLiRQcm9wZXJ0eVBhdGg7XG5cdFx0fSBlbHNlIGlmIChvQ2hhcnRBbm5vdGF0aW9ucz8uRHluYW1pY01lYXN1cmVzPy5sZW5ndGggPiAwKSB7XG5cdFx0XHRhTWVhc3VyZXMgPSBvQ2hhcnRBbm5vdGF0aW9ucy5EeW5hbWljTWVhc3VyZXM7XG5cdFx0XHRzTWVhc3VyZVByb3BlcnR5UGF0aCA9IGFNZWFzdXJlc1tpTWVhc3VyZV0uJEFubm90YXRpb25QYXRoO1xuXHRcdH1cblx0XHRsZXQgYk1lYXN1cmVBdHRyaWJ1dGVFeGlzdHM7XG5cdFx0Y29uc3QgYU1lYXN1cmVBdHRyaWJ1dGVzID0gb0NoYXJ0QW5ub3RhdGlvbnMuTWVhc3VyZUF0dHJpYnV0ZXM7XG5cdFx0bGV0IGlNZWFzdXJlQXR0cmlidXRlID0gLTE7XG5cdFx0Y29uc3QgZm5DaGVja01lYXN1cmUgPSBmdW5jdGlvbiAoc01lYXN1cmVQYXRoOiBhbnksIG9NZWFzdXJlQXR0cmlidXRlOiBhbnksIGluZGV4OiBhbnkpIHtcblx0XHRcdGlmIChvTWVhc3VyZUF0dHJpYnV0ZSkge1xuXHRcdFx0XHRpZiAob01lYXN1cmVBdHRyaWJ1dGUuTWVhc3VyZSAmJiBvTWVhc3VyZUF0dHJpYnV0ZS5NZWFzdXJlLiRQcm9wZXJ0eVBhdGggPT09IHNNZWFzdXJlUGF0aCkge1xuXHRcdFx0XHRcdGlNZWFzdXJlQXR0cmlidXRlID0gaW5kZXg7XG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdH0gZWxzZSBpZiAob01lYXN1cmVBdHRyaWJ1dGUuRHluYW1pY01lYXN1cmUgJiYgb01lYXN1cmVBdHRyaWJ1dGUuRHluYW1pY01lYXN1cmUuJEFubm90YXRpb25QYXRoID09PSBzTWVhc3VyZVBhdGgpIHtcblx0XHRcdFx0XHRpTWVhc3VyZUF0dHJpYnV0ZSA9IGluZGV4O1xuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblx0XHRpZiAoYU1lYXN1cmVBdHRyaWJ1dGVzKSB7XG5cdFx0XHRiTWVhc3VyZUF0dHJpYnV0ZUV4aXN0cyA9IGFNZWFzdXJlQXR0cmlidXRlcy5zb21lKGZuQ2hlY2tNZWFzdXJlLmJpbmQobnVsbCwgc01lYXN1cmVQcm9wZXJ0eVBhdGgpKTtcblx0XHR9XG5cdFx0cmV0dXJuIGJNZWFzdXJlQXR0cmlidXRlRXhpc3RzICYmIGlNZWFzdXJlQXR0cmlidXRlID4gLTEgJiYgaU1lYXN1cmVBdHRyaWJ1dGU7XG5cdH0sXG5cblx0Z2V0TWVhc3VyZUF0dHJpYnV0ZTogZnVuY3Rpb24gKG9Db250ZXh0OiBDb250ZXh0KSB7XG5cdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG9Db250ZXh0LmdldE1vZGVsKCkgYXMgT0RhdGFNZXRhTW9kZWwsXG5cdFx0XHRzQ2hhcnRBbm5vdGF0aW9uUGF0aCA9IG9Db250ZXh0LmdldFBhdGgoKTtcblx0XHRyZXR1cm4gb01ldGFNb2RlbC5yZXF1ZXN0T2JqZWN0KHNDaGFydEFubm90YXRpb25QYXRoKS50aGVuKGZ1bmN0aW9uIChvQ2hhcnRBbm5vdGF0aW9uczogYW55KSB7XG5cdFx0XHRjb25zdCBhTWVhc3VyZUF0dHJpYnV0ZXMgPSBvQ2hhcnRBbm5vdGF0aW9ucy5NZWFzdXJlQXR0cmlidXRlcyxcblx0XHRcdFx0aU1lYXN1cmVBdHRyaWJ1dGUgPSBDb21tb25IZWxwZXIuZ2V0TWVhc3VyZUF0dHJpYnV0ZUluZGV4KDAsIG9DaGFydEFubm90YXRpb25zKTtcblx0XHRcdGNvbnN0IHNNZWFzdXJlQXR0cmlidXRlUGF0aCA9XG5cdFx0XHRcdGlNZWFzdXJlQXR0cmlidXRlID4gLTEgJiYgYU1lYXN1cmVBdHRyaWJ1dGVzW2lNZWFzdXJlQXR0cmlidXRlXSAmJiBhTWVhc3VyZUF0dHJpYnV0ZXNbaU1lYXN1cmVBdHRyaWJ1dGVdLkRhdGFQb2ludFxuXHRcdFx0XHRcdD8gYCR7c0NoYXJ0QW5ub3RhdGlvblBhdGh9L01lYXN1cmVBdHRyaWJ1dGVzLyR7aU1lYXN1cmVBdHRyaWJ1dGV9L2Bcblx0XHRcdFx0XHQ6IHVuZGVmaW5lZDtcblx0XHRcdGlmIChzTWVhc3VyZUF0dHJpYnV0ZVBhdGggPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRMb2cud2FybmluZyhcIkRhdGFQb2ludCBtaXNzaW5nIGZvciB0aGUgbWVhc3VyZVwiKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBzTWVhc3VyZUF0dHJpYnV0ZVBhdGggPyBgJHtzTWVhc3VyZUF0dHJpYnV0ZVBhdGh9RGF0YVBvaW50LyRBbm5vdGF0aW9uUGF0aC9gIDogc01lYXN1cmVBdHRyaWJ1dGVQYXRoO1xuXHRcdH0pO1xuXHR9LFxuXHQvKipcblx0ICogVGhpcyBmdW5jdGlvbiByZXR1cm5zIHRoZSBtZWFzdXJlQXR0cmlidXRlIGZvciB0aGUgbWVhc3VyZS5cblx0ICpcblx0ICogQHBhcmFtIG9Db250ZXh0IENvbnRleHQgdG8gdGhlIG1lYXN1cmUgYW5ub3RhdGlvblxuXHQgKiBAcmV0dXJucyBQYXRoIHRvIHRoZSBtZWFzdXJlQXR0cmlidXRlIG9mIHRoZSBtZWFzdXJlXG5cdCAqL1xuXHRnZXRNZWFzdXJlQXR0cmlidXRlRm9yTWVhc3VyZTogZnVuY3Rpb24gKG9Db250ZXh0OiBDb250ZXh0KSB7XG5cdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG9Db250ZXh0LmdldE1vZGVsKCkgYXMgT0RhdGFNZXRhTW9kZWwsXG5cdFx0XHRzTWVhc3VyZVBhdGggPSBvQ29udGV4dC5nZXRQYXRoKCksXG5cdFx0XHRzQ2hhcnRBbm5vdGF0aW9uUGF0aCA9IHNNZWFzdXJlUGF0aC5zdWJzdHJpbmcoMCwgc01lYXN1cmVQYXRoLmxhc3RJbmRleE9mKFwiTWVhc3VyZVwiKSksXG5cdFx0XHRpTWVhc3VyZSA9IHNNZWFzdXJlUGF0aC5yZXBsYWNlKC8uKlxcLy8sIFwiXCIpO1xuXG5cdFx0cmV0dXJuIG9NZXRhTW9kZWwucmVxdWVzdE9iamVjdChzQ2hhcnRBbm5vdGF0aW9uUGF0aCkudGhlbihmdW5jdGlvbiAob0NoYXJ0QW5ub3RhdGlvbnM6IGFueSkge1xuXHRcdFx0Y29uc3QgYU1lYXN1cmVBdHRyaWJ1dGVzID0gb0NoYXJ0QW5ub3RhdGlvbnMuTWVhc3VyZUF0dHJpYnV0ZXMsXG5cdFx0XHRcdGlNZWFzdXJlQXR0cmlidXRlID0gQ29tbW9uSGVscGVyLmdldE1lYXN1cmVBdHRyaWJ1dGVJbmRleChpTWVhc3VyZSwgb0NoYXJ0QW5ub3RhdGlvbnMpO1xuXHRcdFx0Y29uc3Qgc01lYXN1cmVBdHRyaWJ1dGVQYXRoID1cblx0XHRcdFx0aU1lYXN1cmVBdHRyaWJ1dGUgPiAtMSAmJiBhTWVhc3VyZUF0dHJpYnV0ZXNbaU1lYXN1cmVBdHRyaWJ1dGVdICYmIGFNZWFzdXJlQXR0cmlidXRlc1tpTWVhc3VyZUF0dHJpYnV0ZV0uRGF0YVBvaW50XG5cdFx0XHRcdFx0PyBgJHtzQ2hhcnRBbm5vdGF0aW9uUGF0aH1NZWFzdXJlQXR0cmlidXRlcy8ke2lNZWFzdXJlQXR0cmlidXRlfS9gXG5cdFx0XHRcdFx0OiB1bmRlZmluZWQ7XG5cdFx0XHRpZiAoc01lYXN1cmVBdHRyaWJ1dGVQYXRoID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0TG9nLndhcm5pbmcoXCJEYXRhUG9pbnQgbWlzc2luZyBmb3IgdGhlIG1lYXN1cmVcIik7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gc01lYXN1cmVBdHRyaWJ1dGVQYXRoID8gYCR7c01lYXN1cmVBdHRyaWJ1dGVQYXRofURhdGFQb2ludC8kQW5ub3RhdGlvblBhdGgvYCA6IHNNZWFzdXJlQXR0cmlidXRlUGF0aDtcblx0XHR9KTtcblx0fSxcblx0LyoqXG5cdCAqIE1ldGhvZCB0byBkZXRlcm1pbmUgaWYgdGhlIGNvbnRhaW5lZCBuYXZpZ2F0aW9uIHByb3BlcnR5IGhhcyBhIGRyYWZ0IHJvb3Qvbm9kZSBwYXJlbnQgZW50aXR5U2V0LlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgaXNEcmFmdFBhcmVudEVudGl0eUZvckNvbnRhaW5tZW50XG5cdCAqIEBwYXJhbSBvVGFyZ2V0Q29sbGVjdGlvbkNvbnRhaW5zVGFyZ2V0IFRhcmdldCBjb2xsZWN0aW9uIGhhcyBDb250YWluc1RhcmdldCBwcm9wZXJ0eVxuXHQgKiBAcGFyYW0gb1RhYmxlTWV0YWRhdGEgVGFibGUgbWV0YWRhdGEgZm9yIHdoaWNoIGRyYWZ0IHN1cHBvcnQgc2hhbGwgYmUgY2hlY2tlZFxuXHQgKiBAcmV0dXJucyBSZXR1cm5zIHRydWUgaWYgZHJhZnRcblx0ICovXG5cdGlzRHJhZnRQYXJlbnRFbnRpdHlGb3JDb250YWlubWVudDogZnVuY3Rpb24gKG9UYXJnZXRDb2xsZWN0aW9uQ29udGFpbnNUYXJnZXQ6IG9iamVjdCwgb1RhYmxlTWV0YWRhdGE6IGFueSkge1xuXHRcdGlmIChvVGFyZ2V0Q29sbGVjdGlvbkNvbnRhaW5zVGFyZ2V0KSB7XG5cdFx0XHRpZiAob1RhYmxlTWV0YWRhdGEgJiYgb1RhYmxlTWV0YWRhdGEucGFyZW50RW50aXR5U2V0ICYmIG9UYWJsZU1ldGFkYXRhLnBhcmVudEVudGl0eVNldC5zUGF0aCkge1xuXHRcdFx0XHRjb25zdCBzUGFyZW50RW50aXR5U2V0UGF0aCA9IG9UYWJsZU1ldGFkYXRhLnBhcmVudEVudGl0eVNldC5zUGF0aDtcblx0XHRcdFx0Y29uc3Qgb0RyYWZ0Um9vdCA9IG9UYWJsZU1ldGFkYXRhLnBhcmVudEVudGl0eVNldC5vTW9kZWwuZ2V0T2JqZWN0KFxuXHRcdFx0XHRcdGAke3NQYXJlbnRFbnRpdHlTZXRQYXRofUBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRHJhZnRSb290YFxuXHRcdFx0XHQpO1xuXHRcdFx0XHRjb25zdCBvRHJhZnROb2RlID0gb1RhYmxlTWV0YWRhdGEucGFyZW50RW50aXR5U2V0Lm9Nb2RlbC5nZXRPYmplY3QoXG5cdFx0XHRcdFx0YCR7c1BhcmVudEVudGl0eVNldFBhdGh9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5EcmFmdE5vZGVgXG5cdFx0XHRcdCk7XG5cdFx0XHRcdGlmIChvRHJhZnRSb290IHx8IG9EcmFmdE5vZGUpIHtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBFbnN1cmVzIHRoZSBkYXRhIGlzIHByb2Nlc3NlZCBhcyBkZWZpbmVkIGluIHRoZSB0ZW1wbGF0ZS5cblx0ICogU2luY2UgdGhlIHByb3BlcnR5IERhdGEgaXMgb2YgdGhlIHR5cGUgJ29iamVjdCcsIGl0IG1heSBub3QgYmUgaW4gdGhlIHNhbWUgb3JkZXIgYXMgcmVxdWlyZWQgYnkgdGhlIHRlbXBsYXRlLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG1lbWJlcm9mIHNhcC5mZS5tYWNyb3MuQ29tbW9uSGVscGVyXG5cdCAqIEBwYXJhbSBkYXRhRWxlbWVudCBUaGUgZGF0YSB0aGF0IGlzIGN1cnJlbnRseSBiZWluZyBwcm9jZXNzZWQuXG5cdCAqIEByZXR1cm5zIFRoZSBjb3JyZWN0IHBhdGggYWNjb3JkaW5nIHRvIHRoZSB0ZW1wbGF0ZS5cblx0ICovXG5cdGdldERhdGFGcm9tVGVtcGxhdGU6IGZ1bmN0aW9uIChkYXRhRWxlbWVudDogQ29udGV4dCkge1xuXHRcdGNvbnN0IHNwbGl0UGF0aCA9IGRhdGFFbGVtZW50LmdldFBhdGgoKS5zcGxpdChcIi9cIik7XG5cdFx0Y29uc3QgZGF0YUtleSA9IHNwbGl0UGF0aFtzcGxpdFBhdGgubGVuZ3RoIC0gMV07XG5cdFx0Y29uc3QgY29ubmVjdGVkRGF0YVBhdGggPSBgLyR7c3BsaXRQYXRoLnNsaWNlKDEsIC0yKS5qb2luKFwiL1wiKX0vQGA7XG5cdFx0Y29uc3QgY29ubmVjdGVkT2JqZWN0ID0gZGF0YUVsZW1lbnQuZ2V0T2JqZWN0KGNvbm5lY3RlZERhdGFQYXRoKTtcblx0XHRjb25zdCB0ZW1wbGF0ZSA9IGNvbm5lY3RlZE9iamVjdC5UZW1wbGF0ZTtcblx0XHRjb25zdCBzcGxpdFRlbXAgPSB0ZW1wbGF0ZS5zcGxpdChcIn1cIik7XG5cdFx0Y29uc3QgdGVtcEFycmF5ID0gW107XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBzcGxpdFRlbXAubGVuZ3RoIC0gMTsgaSsrKSB7XG5cdFx0XHRjb25zdCBrZXkgPSBzcGxpdFRlbXBbaV0uc3BsaXQoXCJ7XCIpWzFdLnRyaW0oKTtcblx0XHRcdHRlbXBBcnJheS5wdXNoKGtleSk7XG5cdFx0fVxuXHRcdE9iamVjdC5rZXlzKGNvbm5lY3RlZE9iamVjdC5EYXRhKS5mb3JFYWNoKGZ1bmN0aW9uIChzS2V5OiBzdHJpbmcpIHtcblx0XHRcdGlmIChzS2V5LnN0YXJ0c1dpdGgoXCIkXCIpKSB7XG5cdFx0XHRcdGRlbGV0ZSBjb25uZWN0ZWRPYmplY3QuRGF0YVtzS2V5XTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRjb25zdCBpbmRleCA9IE9iamVjdC5rZXlzKGNvbm5lY3RlZE9iamVjdC5EYXRhKS5pbmRleE9mKGRhdGFLZXkpO1xuXHRcdHJldHVybiBgLyR7c3BsaXRQYXRoLnNsaWNlKDEsIC0yKS5qb2luKFwiL1wiKX0vRGF0YS8ke3RlbXBBcnJheVtpbmRleF19YDtcblx0fSxcblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIHRoZSBlbmQgb2YgdGhlIHRlbXBsYXRlIGhhcyBiZWVuIHJlYWNoZWQuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLm1hY3Jvcy5Db21tb25IZWxwZXJcblx0ICogQHBhcmFtIHRhcmdldCBUaGUgdGFyZ2V0IG9mIHRoZSBjb25uZWN0ZWQgZmllbGRzLlxuXHQgKiBAcGFyYW0gZWxlbWVudCBUaGUgZWxlbWVudCB0aGF0IGlzIGN1cnJlbnRseSBiZWluZyBwcm9jZXNzZWQuXG5cdCAqIEByZXR1cm5zIFRydWUgb3IgRmFsc2UgKGRlcGVuZGluZyBvbiB0aGUgdGVtcGxhdGUgaW5kZXgpLlxuXHQgKi9cblx0bm90TGFzdEluZGV4OiBmdW5jdGlvbiAodGFyZ2V0OiBhbnksIGVsZW1lbnQ6IG9iamVjdCkge1xuXHRcdGNvbnN0IHRlbXBsYXRlID0gdGFyZ2V0LlRlbXBsYXRlO1xuXHRcdGNvbnN0IHNwbGl0VGVtcCA9IHRlbXBsYXRlLnNwbGl0KFwifVwiKTtcblx0XHRjb25zdCB0ZW1wQXJyYXk6IGFueVtdID0gW107XG5cdFx0bGV0IGlzTGFzdEluZGV4ID0gZmFsc2U7XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBzcGxpdFRlbXAubGVuZ3RoIC0gMTsgaSsrKSB7XG5cdFx0XHRjb25zdCBkYXRhS2V5ID0gc3BsaXRUZW1wW2ldLnNwbGl0KFwie1wiKVsxXS50cmltKCk7XG5cdFx0XHR0ZW1wQXJyYXkucHVzaChkYXRhS2V5KTtcblx0XHR9XG5cblx0XHR0ZW1wQXJyYXkuZm9yRWFjaChmdW5jdGlvbiAodGVtcGxhdGVJbmZvOiBhbnkpIHtcblx0XHRcdGlmICh0YXJnZXQuRGF0YVt0ZW1wbGF0ZUluZm9dID09PSBlbGVtZW50ICYmIHRlbXBBcnJheS5pbmRleE9mKHRlbXBsYXRlSW5mbykgIT09IHRlbXBBcnJheS5sZW5ndGggLSAxKSB7XG5cdFx0XHRcdGlzTGFzdEluZGV4ID0gdHJ1ZTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRyZXR1cm4gaXNMYXN0SW5kZXg7XG5cdH0sXG5cblx0LyoqXG5cdCAqIERldGVybWluZXMgdGhlIGRlbGltaXRlciBmcm9tIHRoZSB0ZW1wbGF0ZS5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUubWFjcm9zLkNvbW1vbkhlbHBlclxuXHQgKiBAcGFyYW0gdGVtcGxhdGUgVGhlIHRlbXBsYXRlIHN0cmluZy5cblx0ICogQHJldHVybnMgVGhlIGRlbGltaXRlciBpbiB0aGUgdGVtcGxhdGUgc3RyaW5nLlxuXHQgKi9cblx0Z2V0RGVsaW1pdGVyOiBmdW5jdGlvbiAodGVtcGxhdGU6IHN0cmluZykge1xuXHRcdHJldHVybiB0ZW1wbGF0ZS5zcGxpdChcIn1cIilbMV0uc3BsaXQoXCJ7XCIpWzBdLnRyaW0oKTtcblx0fSxcblxuXHRvTWV0YU1vZGVsOiB1bmRlZmluZWQgYXMgYW55LFxuXHRzZXRNZXRhTW9kZWw6IGZ1bmN0aW9uIChvTWV0YU1vZGVsOiBPRGF0YU1ldGFNb2RlbCkge1xuXHRcdHRoaXMub01ldGFNb2RlbCA9IG9NZXRhTW9kZWw7XG5cdH0sXG5cblx0Z2V0TWV0YU1vZGVsOiBmdW5jdGlvbiAob0NvbnRleHQ/OiBhbnksIG9JbnRlcmZhY2U/OiBhbnkpIHtcblx0XHRpZiAob0NvbnRleHQpIHtcblx0XHRcdHJldHVybiBvSW50ZXJmYWNlLmNvbnRleHQuZ2V0TW9kZWwoKTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMub01ldGFNb2RlbDtcblx0fSxcblxuXHRnZXRQYXJhbWV0ZXJzOiBmdW5jdGlvbiAob0NvbnRleHQ6IGFueSwgb0ludGVyZmFjZTogYW55KSB7XG5cdFx0aWYgKG9Db250ZXh0KSB7XG5cdFx0XHRjb25zdCBvTWV0YU1vZGVsID0gb0ludGVyZmFjZS5jb250ZXh0LmdldE1vZGVsKCk7XG5cdFx0XHRjb25zdCBzUGF0aCA9IG9JbnRlcmZhY2UuY29udGV4dC5nZXRQYXRoKCk7XG5cdFx0XHRjb25zdCBvUGFyYW1ldGVySW5mbyA9IENvbW1vblV0aWxzLmdldFBhcmFtZXRlckluZm8ob01ldGFNb2RlbCwgc1BhdGgpO1xuXHRcdFx0aWYgKG9QYXJhbWV0ZXJJbmZvLnBhcmFtZXRlclByb3BlcnRpZXMpIHtcblx0XHRcdFx0cmV0dXJuIE9iamVjdC5rZXlzKG9QYXJhbWV0ZXJJbmZvLnBhcmFtZXRlclByb3BlcnRpZXMpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gW107XG5cdH0sXG5cblx0LyoqXG5cdCAqIEJ1aWxkIGFuIGV4cHJlc3Npb24gY2FsbGluZyBhbiBhY3Rpb24gaGFuZGxlciB2aWEgdGhlIEZQTSBoZWxwZXIncyBhY3Rpb25XcmFwcGVyIGZ1bmN0aW9uXG5cdCAqXG5cdCAqIFRoaXMgZnVuY3Rpb24gYXNzdW1lcyB0aGF0IHRoZSAnRlBNLmFjdGlvbldyYXBwZXIoKScgZnVuY3Rpb24gaXMgYXZhaWxhYmxlIGF0IHJ1bnRpbWUuXG5cdCAqXG5cdCAqIEBwYXJhbSBvQWN0aW9uIEFjdGlvbiBtZXRhZGF0YVxuXHQgKiBAcGFyYW0gb0FjdGlvbi5oYW5kbGVyTW9kdWxlIE1vZHVsZSBjb250YWluaW5nIHRoZSBhY3Rpb24gaGFuZGxlciBtZXRob2Rcblx0ICogQHBhcmFtIG9BY3Rpb24uaGFuZGxlck1ldGhvZCBBY3Rpb24gaGFuZGxlciBtZXRob2QgbmFtZVxuXHQgKiBAcGFyYW0gW29UaGlzXSBgdGhpc2AgKGlmIHRoZSBmdW5jdGlvbiBpcyBjYWxsZWQgZnJvbSBhIG1hY3JvKVxuXHQgKiBAcGFyYW0gb1RoaXMuaWQgVGhlIHRhYmxlJ3MgSURcblx0ICogQHJldHVybnMgVGhlIGFjdGlvbiB3cmFwcGVyIGJpbmRpbmdcdGV4cHJlc3Npb25cblx0ICovXG5cdGJ1aWxkQWN0aW9uV3JhcHBlcjogZnVuY3Rpb24gKG9BY3Rpb246IHsgaGFuZGxlck1vZHVsZTogc3RyaW5nOyBoYW5kbGVyTWV0aG9kOiBzdHJpbmcgfSwgb1RoaXM6IHsgaWQ6IHN0cmluZyB9IHwgdW5kZWZpbmVkKSB7XG5cdFx0Y29uc3QgYVBhcmFtczogYW55W10gPSBbcmVmKFwiJGV2ZW50XCIpLCBvQWN0aW9uLmhhbmRsZXJNb2R1bGUsIG9BY3Rpb24uaGFuZGxlck1ldGhvZF07XG5cblx0XHRpZiAob1RoaXMgJiYgb1RoaXMuaWQpIHtcblx0XHRcdGNvbnN0IG9BZGRpdGlvbmFsUGFyYW1zID0ge1xuXHRcdFx0XHRjb250ZXh0czogcmVmKFwiJHtpbnRlcm5hbD5zZWxlY3RlZENvbnRleHRzfVwiKVxuXHRcdFx0fTtcblx0XHRcdGFQYXJhbXMucHVzaChvQWRkaXRpb25hbFBhcmFtcyk7XG5cdFx0fVxuXHRcdHJldHVybiBjb21waWxlRXhwcmVzc2lvbihmbihcIkZQTS5hY3Rpb25XcmFwcGVyXCIsIGFQYXJhbXMpKTtcblx0fSxcblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIHZhbHVlIHdoZXRoZXIgb3Igbm90IHRoZSBlbGVtZW50IHNob3VsZCBiZSB2aXNpYmxlIGRlcGVuZGluZyBvbiB0aGUgSGlkZGVuIGFubm90YXRpb24uXG5cdCAqIEl0IGlzIGludmVydGVkIGFzIHRoZSBVSSBlbGVtZW50cyBoYXZlIGEgdmlzaWJsZSBwcm9wZXJ0eSBpbnN0ZWFkIG9mIGFuIGhpZGRlbiBvbmUuXG5cdCAqXG5cdCAqIEBwYXJhbSBkYXRhRmllbGRBbm5vdGF0aW9ucyBUaGUgZGF0YUZpZWxkIE9iamVjdFxuXHQgKiBAcmV0dXJucyBBIHBhdGggb3IgYSBib29sZWFuXG5cdCAqL1xuXHRnZXRIaWRkZW5QYXRoRXhwcmVzc2lvbjogZnVuY3Rpb24gKGRhdGFGaWVsZEFubm90YXRpb25zOiBhbnkpIHtcblx0XHRpZiAoZGF0YUZpZWxkQW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuSGlkZGVuXCJdICE9PSBudWxsKSB7XG5cdFx0XHRjb25zdCBoaWRkZW4gPSBkYXRhRmllbGRBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IaWRkZW5cIl07XG5cdFx0XHRyZXR1cm4gdHlwZW9mIGhpZGRlbiA9PT0gXCJvYmplY3RcIiA/IFwiez0gISR7XCIgKyBoaWRkZW4uJFBhdGggKyBcIn0gfVwiIDogIWhpZGRlbjtcblx0XHR9XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cbn07XG4oQ29tbW9uSGVscGVyLmdldFNvcnRDb25kaXRpb25zIGFzIGFueSkucmVxdWlyZXNJQ29udGV4dCA9IHRydWU7XG5cbmV4cG9ydCBkZWZhdWx0IENvbW1vbkhlbHBlcjtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7RUFXQSxNQUFNQSxVQUFVLEdBQUdDLFFBQVEsQ0FBQ0QsVUFBVTtFQUN0QyxNQUFNRSxZQUFZLEdBQUc7SUFDcEJDLFlBQVksRUFBRSxVQUFVQyxJQUFTLEVBQUU7TUFDbEMsT0FBT0EsSUFBSSxDQUFDQyxTQUFTLEVBQUU7SUFDeEIsQ0FBQztJQUVEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0NDLFNBQVMsRUFBRSxVQUFVQyxNQUFjLEVBQUVDLFVBQWUsRUFBRTtNQUNyRCxNQUFNQyxNQUFNLEdBQUdELFVBQVUsQ0FBQ0UsT0FBTyxDQUFDQyxRQUFRLEVBQUU7UUFDM0NDLGFBQWEsR0FBR0osVUFBVSxDQUFDRSxPQUFPLENBQUNHLE9BQU8sRUFBRTtRQUM1Q0MsWUFBWSxHQUFHTCxNQUFNLENBQUNKLFNBQVMsQ0FBRSxHQUFFTyxhQUFjLEdBQUUsQ0FBQztRQUNwREcsTUFBTSxHQUFHRCxZQUFZLENBQUMsb0NBQW9DLENBQUM7TUFFNUQsT0FBTyxPQUFPQyxNQUFNLEtBQUssUUFB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