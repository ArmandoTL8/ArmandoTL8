/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/helpers/BindingHelper", "sap/fe/core/helpers/BindingToolkit", "sap/fe/macros/CommonHelper"], function (BindingHelper, BindingToolkit, CommonHelper) {
  "use strict";

  var isPathInModelExpression = BindingToolkit.isPathInModelExpression;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var bindingContextPathVisitor = BindingHelper.bindingContextPathVisitor;
  const ActionHelper = {
    /**
     * Returns an array of actions that are not enabled with a multiple selection.
     *
     * @function
     * @name getMultiSelectDisabledActions
     * @param aCollection Array of records
     * @param oContext The context object of the control
     * @returns An array of action paths
     * @ui5-restricted
     */
    getMultiSelectDisabledActions(aCollection, oContext) {
      const aMultiSelectDisabledActions = [];
      let sActionPath, sActionName, sAnnotationPath, oParameterAnnotations, oAction;
      if (aCollection) {
        const aActionMetadata = aCollection.filter(function (oItem) {
          return oItem.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction";
        });
        aActionMetadata.forEach(function (oActionMetadata) {
          sActionName = oActionMetadata.Action;
          sActionPath = CommonHelper.getActionPath(oContext.context, true, sActionName, false);
          oAction = oContext.context.getObject(`${sActionPath}/@$ui5.overload/0`);
          if (oAction && oAction.$Parameter && oAction.$IsBound) {
            for (const n in oAction.$Parameter) {
              sAnnotationPath = `${sActionPath}/${oAction.$Parameter[n].$Name}@`;
              oParameterAnnotations = oContext.context.getObject(sAnnotationPath);
              if (oParameterAnnotations && (oParameterAnnotations["@com.sap.vocabularies.UI.v1.Hidden"] && oParameterAnnotations["@com.sap.vocabularies.UI.v1.Hidden"].$Path || oParameterAnnotations["@com.sap.vocabularies.Common.v1.FieldControl"] && oParameterAnnotations["@com.sap.vocabularies.Common.v1.FieldControl"].$Path)) {
                aMultiSelectDisabledActions.push(sActionName);
                break;
              }
            }
          }
        });
      }
      return aMultiSelectDisabledActions;
    },
    /**
     * Method to get the expression for the 'press' event for the DataFieldForActionButton.
     *
     * @function
     * @name getPressEventDataFieldForActionButton
     * @param sId Control ID
     * @param oAction Action object
     * @param oParams Parameters
     * @param sOperationAvailableMap OperationAvailableMap as stringified JSON object
     * @returns The binding expression
     */
    getPressEventDataFieldForActionButton(sId, oAction, oParams, sOperationAvailableMap) {
      const sInvocationGrouping = oAction.InvocationGrouping && oAction.InvocationGrouping.$EnumMember === "com.sap.vocabularies.UI.v1.OperationGroupingType/ChangeSet" ? "ChangeSet" : "Isolated";
      oParams = oParams || {};
      oParams["invocationGrouping"] = CommonHelper.addSingleQuotes(sInvocationGrouping);
      oParams["controlId"] = CommonHelper.addSingleQuotes(sId);
      oParams["operationAvailableMap"] = CommonHelper.addSingleQuotes(sOperationAvailableMap);
      oParams["model"] = "${$source>/}.getModel()";
      oParams["label"] = oAction.Label && CommonHelper.addSingleQuotes(oAction.Label, true);
      return CommonHelper.generateFunction(".editFlow.invokeAction", CommonHelper.addSingleQuotes(oAction.Action), CommonHelper.objectToString(oParams));
    },
    /**
     * Return Number of contexts expression.
     *
     * @function
     * @name getNumberOfContextsExpression
     * @param vActionEnabled Status of action (single or multiselect)
     * @returns Number of contexts expression
     */
    getNumberOfContextsExpression(vActionEnabled) {
      let sNumberOfSelectedContexts;
      if (vActionEnabled === "single") {
        sNumberOfSelectedContexts = "${internal>numberOfSelectedContexts} === 1";
      } else {
        sNumberOfSelectedContexts = "${internal>numberOfSelectedContexts} > 0";
      }
      return sNumberOfSelectedContexts;
    },
    /**
     * Return UI Control (LineItem/Chart) Operation Available Map.
     *
     * @function
     * @name getOperationAvailableMap
     * @param aCollection Array of records
     * @param sControl Control name (lineItem / chart)
     * @param oContext Converter context
     * @returns The record containing all action names and their corresponding Core.OperationAvailable property paths
     */
    getOperationAvailableMap(aCollection, sControl, oContext) {
      let oOperationAvailableMap = {};
      if (aCollection) {
        aCollection.forEach(oRecord => {
          if (oRecord.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction") {
            if (oRecord.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction") {
              const actionName = oRecord.Action;
              if ((actionName === null || actionName === void 0 ? void 0 : actionName.indexOf("/")) < 0 && !oRecord.Determining) {
                if (sControl === "table") {
                  oOperationAvailableMap = this._getOperationAvailableMapOfTable(oRecord, actionName, oOperationAvailableMap, oContext);
                } else if (sControl === "chart") {
                  oOperationAvailableMap = this._getOperationAvailableMapOfChart(actionName, oOperationAvailableMap, oContext);
                }
              }
            }
          }
        });
      }
      return oOperationAvailableMap;
    },
    /**
     * Return LineItem Action Operation Available Map.
     *
     * @function
     * @name _getOperationAvailableMapOfTable
     * @private
     * @param oDataFieldForAction Data field for action object
     * @param sActionName Action name
     * @param oOperationAvailableMap Operation available map object
     * @param oConverterContext Converter context object
     * @returns The record containing all action name of line item and the corresponding Core.OperationAvailable property path
     */
    _getOperationAvailableMapOfTable(oDataFieldForAction, sActionName, oOperationAvailableMap, oConverterContext) {
      var _actionTarget$annotat, _actionTarget$annotat2, _actionTarget$paramet;
      const actionTarget = oDataFieldForAction.ActionTarget;
      if ((actionTarget === null || actionTarget === void 0 ? void 0 : (_actionTarget$annotat = actionTarget.annotations) === null || _actionTarget$annotat === void 0 ? void 0 : (_actionTarget$annotat2 = _actionTarget$annotat.Core) === null || _actionTarget$annotat2 === void 0 ? void 0 : _actionTarget$annotat2.OperationAvailable) === null) {
        // We disabled action advertisement but kept it in the code for the time being
        //oOperationAvailableMap = this._addToMap(sActionName, null, oOperationAvailableMap);
      } else if (actionTarget !== null && actionTarget !== void 0 && (_actionTarget$paramet = actionTarget.parameters) !== null && _actionTarget$paramet !== void 0 && _actionTarget$paramet.length) {
        var _actionTarget$annotat3, _actionTarget$annotat4, _actionTarget$annotat5, _actionTarget$annotat6;
        const bindingParameterFullName = actionTarget.parameters[0].fullyQualifiedName,
          targetExpression = getExpressionFromAnnotation(actionTarget === null || actionTarget === void 0 ? void 0 : (_actionTarget$annotat3 = actionTarget.annotations) === null || _actionTarget$annotat3 === void 0 ? void 0 : (_actionTarget$annotat4 = _actionTarget$annotat3.Core) === null || _actionTarget$annotat4 === void 0 ? void 0 : _actionTarget$annotat4.OperationAvailable, [], undefined, path => bindingContextPathVisitor(path, oConverterContext, bindingParameterFullName));
        if (isPathInModelExpression(targetExpression)) {
          oOperationAvailableMap = this._addToMap(sActionName, targetExpression.path, oOperationAvailableMap);
        } else if ((actionTarget === null || actionTarget === void 0 ? void 0 : (_actionTarget$annotat5 = actionTarget.annotations) === null || _actionTarget$annotat5 === void 0 ? void 0 : (_actionTarget$annotat6 = _actionTarget$annotat5.Core) === null || _actionTarget$annotat6 === void 0 ? void 0 : _actionTarget$annotat6.OperationAvailable) !== undefined) {
          oOperationAvailableMap = this._addToMap(sActionName, targetExpression, oOperationAvailableMap);
        }
      }
      return oOperationAvailableMap;
    },
    /**
     * Return LineItem Action Operation Available Map.
     *
     * @function
     * @name _getOperationAvailableMapOfChart
     * @private
     * @param sActionName Action name
     * @param oOperationAvailableMap Operation available map object
     * @param oContext Context object
     * @returns The record containing all action name of chart and the corresponding Core.OperationAvailable property path
     */
    _getOperationAvailableMapOfChart(sActionName, oOperationAvailableMap, oContext) {
      let oResult = CommonHelper.getActionPath(oContext.context, false, sActionName, true);
      if (oResult === null) {
        oOperationAvailableMap = this._addToMap(sActionName, null, oOperationAvailableMap);
      } else {
        oResult = CommonHelper.getActionPath(oContext.context, false, sActionName);
        if (oResult.sProperty) {
          oOperationAvailableMap = this._addToMap(sActionName, oResult.sProperty.substr(oResult.sBindingParameter.length + 1), oOperationAvailableMap);
        }
      }
      return oOperationAvailableMap;
    },
    /**
     * Return Map.
     *
     * @function
     * @name _addToMap
     * @private
     * @param sKey Key
     * @param oValue Value
     * @param oMap Map object
     * @returns Map object
     */
    _addToMap(sKey, oValue, oMap) {
      if (sKey && oMap) {
        oMap[sKey] = oValue;
      }
      return oMap;
    }
  };
  return ActionHelper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBY3Rpb25IZWxwZXIiLCJnZXRNdWx0aVNlbGVjdERpc2FibGVkQWN0aW9ucyIsImFDb2xsZWN0aW9uIiwib0NvbnRleHQiLCJhTXVsdGlTZWxlY3REaXNhYmxlZEFjdGlvbnMiLCJzQWN0aW9uUGF0aCIsInNBY3Rpb25OYW1lIiwic0Fubm90YXRpb25QYXRoIiwib1BhcmFtZXRlckFubm90YXRpb25zIiwib0FjdGlvbiIsImFBY3Rpb25NZXRhZGF0YSIsImZpbHRlciIsIm9JdGVtIiwiJFR5cGUiLCJmb3JFYWNoIiwib0FjdGlvbk1ldGFkYXRhIiwiQWN0aW9uIiwiQ29tbW9uSGVscGVyIiwiZ2V0QWN0aW9uUGF0aCIsImNvbnRleHQiLCJnZXRPYmplY3QiLCIkUGFyYW1ldGVyIiwiJElzQm91bmQiLCJuIiwiJE5hbWUiLCIkUGF0aCIsInB1c2giLCJnZXRQcmVzc0V2ZW50RGF0YUZpZWxkRm9yQWN0aW9uQnV0dG9uIiwic0lkIiwib1BhcmFtcyIsInNPcGVyYXRpb25BdmFpbGFibGVNYXAiLCJzSW52b2NhdGlvbkdyb3VwaW5nIiwiSW52b2NhdGlvbkdyb3VwaW5nIiwiJEVudW1NZW1iZXIiLCJhZGRTaW5nbGVRdW90ZXMiLCJMYWJlbCIsImdlbmVyYXRlRnVuY3Rpb24iLCJvYmplY3RUb1N0cmluZyIsImdldE51bWJlck9mQ29udGV4dHNFeHByZXNzaW9uIiwidkFjdGlvbkVuYWJsZWQiLCJzTnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzIiwiZ2V0T3BlcmF0aW9uQXZhaWxhYmxlTWFwIiwic0NvbnRyb2wiLCJvT3BlcmF0aW9uQXZhaWxhYmxlTWFwIiwib1JlY29yZCIsImFjdGlvbk5hbWUiLCJpbmRleE9mIiwiRGV0ZXJtaW5pbmciLCJfZ2V0T3BlcmF0aW9uQXZhaWxhYmxlTWFwT2ZUYWJsZSIsIl9nZXRPcGVyYXRpb25BdmFpbGFibGVNYXBPZkNoYXJ0Iiwib0RhdGFGaWVsZEZvckFjdGlvbiIsIm9Db252ZXJ0ZXJDb250ZXh0IiwiYWN0aW9uVGFyZ2V0IiwiQWN0aW9uVGFyZ2V0IiwiYW5ub3RhdGlvbnMiLCJDb3JlIiwiT3BlcmF0aW9uQXZhaWxhYmxlIiwicGFyYW1ldGVycyIsImxlbmd0aCIsImJpbmRpbmdQYXJhbWV0ZXJGdWxsTmFtZSIsImZ1bGx5UXVhbGlmaWVkTmFtZSIsInRhcmdldEV4cHJlc3Npb24iLCJnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24iLCJ1bmRlZmluZWQiLCJwYXRoIiwiYmluZGluZ0NvbnRleHRQYXRoVmlzaXRvciIsImlzUGF0aEluTW9kZWxFeHByZXNzaW9uIiwiX2FkZFRvTWFwIiwib1Jlc3VsdCIsInNQcm9wZXJ0eSIsInN1YnN0ciIsInNCaW5kaW5nUGFyYW1ldGVyIiwic0tleSIsIm9WYWx1ZSIsIm9NYXAiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkFjdGlvbkhlbHBlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBVSUFubm90YXRpb25UeXBlcywgdHlwZSBEYXRhRmllbGRGb3JBY3Rpb24gfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1VJXCI7XG5pbXBvcnQgdHlwZSBDb252ZXJ0ZXJDb250ZXh0IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL0NvbnZlcnRlckNvbnRleHRcIjtcbmltcG9ydCB7IGJpbmRpbmdDb250ZXh0UGF0aFZpc2l0b3IgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL0JpbmRpbmdIZWxwZXJcIjtcbmltcG9ydCB7IGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbiwgaXNQYXRoSW5Nb2RlbEV4cHJlc3Npb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IENvbW1vbkhlbHBlciBmcm9tIFwic2FwL2ZlL21hY3Jvcy9Db21tb25IZWxwZXJcIjtcblxuY29uc3QgQWN0aW9uSGVscGVyID0ge1xuXHQvKipcblx0ICogUmV0dXJucyBhbiBhcnJheSBvZiBhY3Rpb25zIHRoYXQgYXJlIG5vdCBlbmFibGVkIHdpdGggYSBtdWx0aXBsZSBzZWxlY3Rpb24uXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBnZXRNdWx0aVNlbGVjdERpc2FibGVkQWN0aW9uc1xuXHQgKiBAcGFyYW0gYUNvbGxlY3Rpb24gQXJyYXkgb2YgcmVjb3Jkc1xuXHQgKiBAcGFyYW0gb0NvbnRleHQgVGhlIGNvbnRleHQgb2JqZWN0IG9mIHRoZSBjb250cm9sXG5cdCAqIEByZXR1cm5zIEFuIGFycmF5IG9mIGFjdGlvbiBwYXRoc1xuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICovXG5cdGdldE11bHRpU2VsZWN0RGlzYWJsZWRBY3Rpb25zKGFDb2xsZWN0aW9uOiBhbnksIG9Db250ZXh0OiBhbnkpIHtcblx0XHRjb25zdCBhTXVsdGlTZWxlY3REaXNhYmxlZEFjdGlvbnM6IGFueVtdID0gW107XG5cdFx0bGV0IHNBY3Rpb25QYXRoLCBzQWN0aW9uTmFtZSwgc0Fubm90YXRpb25QYXRoLCBvUGFyYW1ldGVyQW5ub3RhdGlvbnMsIG9BY3Rpb247XG5cdFx0aWYgKGFDb2xsZWN0aW9uKSB7XG5cdFx0XHRjb25zdCBhQWN0aW9uTWV0YWRhdGEgPSBhQ29sbGVjdGlvbi5maWx0ZXIoZnVuY3Rpb24gKG9JdGVtOiBhbnkpIHtcblx0XHRcdFx0cmV0dXJuIG9JdGVtLiRUeXBlID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZEZvckFjdGlvblwiO1xuXHRcdFx0fSk7XG5cdFx0XHRhQWN0aW9uTWV0YWRhdGEuZm9yRWFjaChmdW5jdGlvbiAob0FjdGlvbk1ldGFkYXRhOiBhbnkpIHtcblx0XHRcdFx0c0FjdGlvbk5hbWUgPSBvQWN0aW9uTWV0YWRhdGEuQWN0aW9uO1xuXHRcdFx0XHRzQWN0aW9uUGF0aCA9IENvbW1vbkhlbHBlci5nZXRBY3Rpb25QYXRoKG9Db250ZXh0LmNvbnRleHQsIHRydWUsIHNBY3Rpb25OYW1lLCBmYWxzZSk7XG5cdFx0XHRcdG9BY3Rpb24gPSBvQ29udGV4dC5jb250ZXh0LmdldE9iamVjdChgJHtzQWN0aW9uUGF0aH0vQCR1aTUub3ZlcmxvYWQvMGApO1xuXHRcdFx0XHRpZiAob0FjdGlvbiAmJiBvQWN0aW9uLiRQYXJhbWV0ZXIgJiYgb0FjdGlvbi4kSXNCb3VuZCkge1xuXHRcdFx0XHRcdGZvciAoY29uc3QgbiBpbiBvQWN0aW9uLiRQYXJhbWV0ZXIpIHtcblx0XHRcdFx0XHRcdHNBbm5vdGF0aW9uUGF0aCA9IGAke3NBY3Rpb25QYXRofS8ke29BY3Rpb24uJFBhcmFtZXRlcltuXS4kTmFtZX1AYDtcblx0XHRcdFx0XHRcdG9QYXJhbWV0ZXJBbm5vdGF0aW9ucyA9IG9Db250ZXh0LmNvbnRleHQuZ2V0T2JqZWN0KHNBbm5vdGF0aW9uUGF0aCk7XG5cdFx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRcdG9QYXJhbWV0ZXJBbm5vdGF0aW9ucyAmJlxuXHRcdFx0XHRcdFx0XHQoKG9QYXJhbWV0ZXJBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IaWRkZW5cIl0gJiZcblx0XHRcdFx0XHRcdFx0XHRvUGFyYW1ldGVyQW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuSGlkZGVuXCJdLiRQYXRoKSB8fFxuXHRcdFx0XHRcdFx0XHRcdChvUGFyYW1ldGVyQW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkZpZWxkQ29udHJvbFwiXSAmJlxuXHRcdFx0XHRcdFx0XHRcdFx0b1BhcmFtZXRlckFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5GaWVsZENvbnRyb2xcIl0uJFBhdGgpKVxuXHRcdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHRcdGFNdWx0aVNlbGVjdERpc2FibGVkQWN0aW9ucy5wdXNoKHNBY3Rpb25OYW1lKTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0cmV0dXJuIGFNdWx0aVNlbGVjdERpc2FibGVkQWN0aW9ucztcblx0fSxcblxuXHQvKipcblx0ICogTWV0aG9kIHRvIGdldCB0aGUgZXhwcmVzc2lvbiBmb3IgdGhlICdwcmVzcycgZXZlbnQgZm9yIHRoZSBEYXRhRmllbGRGb3JBY3Rpb25CdXR0b24uXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBnZXRQcmVzc0V2ZW50RGF0YUZpZWxkRm9yQWN0aW9uQnV0dG9uXG5cdCAqIEBwYXJhbSBzSWQgQ29udHJvbCBJRFxuXHQgKiBAcGFyYW0gb0FjdGlvbiBBY3Rpb24gb2JqZWN0XG5cdCAqIEBwYXJhbSBvUGFyYW1zIFBhcmFtZXRlcnNcblx0ICogQHBhcmFtIHNPcGVyYXRpb25BdmFpbGFibGVNYXAgT3BlcmF0aW9uQXZhaWxhYmxlTWFwIGFzIHN0cmluZ2lmaWVkIEpTT04gb2JqZWN0XG5cdCAqIEByZXR1cm5zIFRoZSBiaW5kaW5nIGV4cHJlc3Npb25cblx0ICovXG5cdGdldFByZXNzRXZlbnREYXRhRmllbGRGb3JBY3Rpb25CdXR0b24oc0lkOiBzdHJpbmcsIG9BY3Rpb246IGFueSwgb1BhcmFtczogYW55LCBzT3BlcmF0aW9uQXZhaWxhYmxlTWFwOiBzdHJpbmcpIHtcblx0XHRjb25zdCBzSW52b2NhdGlvbkdyb3VwaW5nID1cblx0XHRcdG9BY3Rpb24uSW52b2NhdGlvbkdyb3VwaW5nICYmXG5cdFx0XHRvQWN0aW9uLkludm9jYXRpb25Hcm91cGluZy4kRW51bU1lbWJlciA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5PcGVyYXRpb25Hcm91cGluZ1R5cGUvQ2hhbmdlU2V0XCJcblx0XHRcdFx0PyBcIkNoYW5nZVNldFwiXG5cdFx0XHRcdDogXCJJc29sYXRlZFwiO1xuXHRcdG9QYXJhbXMgPSBvUGFyYW1zIHx8IHt9O1xuXHRcdG9QYXJhbXNbXCJpbnZvY2F0aW9uR3JvdXBpbmdcIl0gPSBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKHNJbnZvY2F0aW9uR3JvdXBpbmcpO1xuXHRcdG9QYXJhbXNbXCJjb250cm9sSWRcIl0gPSBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKHNJZCk7XG5cdFx0b1BhcmFtc1tcIm9wZXJhdGlvbkF2YWlsYWJsZU1hcFwiXSA9IENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMoc09wZXJhdGlvbkF2YWlsYWJsZU1hcCk7XG5cdFx0b1BhcmFtc1tcIm1vZGVsXCJdID0gXCIkeyRzb3VyY2U+L30uZ2V0TW9kZWwoKVwiO1xuXHRcdG9QYXJhbXNbXCJsYWJlbFwiXSA9IG9BY3Rpb24uTGFiZWwgJiYgQ29tbW9uSGVscGVyLmFkZFNpbmdsZVF1b3RlcyhvQWN0aW9uLkxhYmVsLCB0cnVlKTtcblxuXHRcdHJldHVybiBDb21tb25IZWxwZXIuZ2VuZXJhdGVGdW5jdGlvbihcblx0XHRcdFwiLmVkaXRGbG93Lmludm9rZUFjdGlvblwiLFxuXHRcdFx0Q29tbW9uSGVscGVyLmFkZFNpbmdsZVF1b3RlcyhvQWN0aW9uLkFjdGlvbiksXG5cdFx0XHRDb21tb25IZWxwZXIub2JqZWN0VG9TdHJpbmcob1BhcmFtcylcblx0XHQpO1xuXHR9LFxuXHQvKipcblx0ICogUmV0dXJuIE51bWJlciBvZiBjb250ZXh0cyBleHByZXNzaW9uLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgZ2V0TnVtYmVyT2ZDb250ZXh0c0V4cHJlc3Npb25cblx0ICogQHBhcmFtIHZBY3Rpb25FbmFibGVkIFN0YXR1cyBvZiBhY3Rpb24gKHNpbmdsZSBvciBtdWx0aXNlbGVjdClcblx0ICogQHJldHVybnMgTnVtYmVyIG9mIGNvbnRleHRzIGV4cHJlc3Npb25cblx0ICovXG5cdGdldE51bWJlck9mQ29udGV4dHNFeHByZXNzaW9uKHZBY3Rpb25FbmFibGVkOiBTdHJpbmcpIHtcblx0XHRsZXQgc051bWJlck9mU2VsZWN0ZWRDb250ZXh0cztcblx0XHRpZiAodkFjdGlvbkVuYWJsZWQgPT09IFwic2luZ2xlXCIpIHtcblx0XHRcdHNOdW1iZXJPZlNlbGVjdGVkQ29udGV4dHMgPSBcIiR7aW50ZXJuYWw+bnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzfSA9PT0gMVwiO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzTnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzID0gXCIke2ludGVybmFsPm51bWJlck9mU2VsZWN0ZWRDb250ZXh0c30gPiAwXCI7XG5cdFx0fVxuXHRcdHJldHVybiBzTnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzO1xuXHR9LFxuXHQvKipcblx0ICogUmV0dXJuIFVJIENvbnRyb2wgKExpbmVJdGVtL0NoYXJ0KSBPcGVyYXRpb24gQXZhaWxhYmxlIE1hcC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGdldE9wZXJhdGlvbkF2YWlsYWJsZU1hcFxuXHQgKiBAcGFyYW0gYUNvbGxlY3Rpb24gQXJyYXkgb2YgcmVjb3Jkc1xuXHQgKiBAcGFyYW0gc0NvbnRyb2wgQ29udHJvbCBuYW1lIChsaW5lSXRlbSAvIGNoYXJ0KVxuXHQgKiBAcGFyYW0gb0NvbnRleHQgQ29udmVydGVyIGNvbnRleHRcblx0ICogQHJldHVybnMgVGhlIHJlY29yZCBjb250YWluaW5nIGFsbCBhY3Rpb24gbmFtZXMgYW5kIHRoZWlyIGNvcnJlc3BvbmRpbmcgQ29yZS5PcGVyYXRpb25BdmFpbGFibGUgcHJvcGVydHkgcGF0aHNcblx0ICovXG5cdGdldE9wZXJhdGlvbkF2YWlsYWJsZU1hcChhQ29sbGVjdGlvbjogYW55LCBzQ29udHJvbDogc3RyaW5nLCBvQ29udGV4dDogYW55KTogUmVjb3JkPHN0cmluZywgYW55PiB7XG5cdFx0bGV0IG9PcGVyYXRpb25BdmFpbGFibGVNYXA6IFJlY29yZDxzdHJpbmcsIGFueT4gPSB7fTtcblx0XHRpZiAoYUNvbGxlY3Rpb24pIHtcblx0XHRcdGFDb2xsZWN0aW9uLmZvckVhY2goKG9SZWNvcmQ6IGFueSkgPT4ge1xuXHRcdFx0XHRpZiAob1JlY29yZC4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQWN0aW9uKSB7XG5cdFx0XHRcdFx0aWYgKG9SZWNvcmQuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFjdGlvbikge1xuXHRcdFx0XHRcdFx0Y29uc3QgYWN0aW9uTmFtZSA9IG9SZWNvcmQuQWN0aW9uIGFzIHN0cmluZztcblx0XHRcdFx0XHRcdGlmIChhY3Rpb25OYW1lPy5pbmRleE9mKFwiL1wiKSA8IDAgJiYgIW9SZWNvcmQuRGV0ZXJtaW5pbmcpIHtcblx0XHRcdFx0XHRcdFx0aWYgKHNDb250cm9sID09PSBcInRhYmxlXCIpIHtcblx0XHRcdFx0XHRcdFx0XHRvT3BlcmF0aW9uQXZhaWxhYmxlTWFwID0gdGhpcy5fZ2V0T3BlcmF0aW9uQXZhaWxhYmxlTWFwT2ZUYWJsZShcblx0XHRcdFx0XHRcdFx0XHRcdG9SZWNvcmQsXG5cdFx0XHRcdFx0XHRcdFx0XHRhY3Rpb25OYW1lLFxuXHRcdFx0XHRcdFx0XHRcdFx0b09wZXJhdGlvbkF2YWlsYWJsZU1hcCxcblx0XHRcdFx0XHRcdFx0XHRcdG9Db250ZXh0XG5cdFx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdFx0fSBlbHNlIGlmIChzQ29udHJvbCA9PT0gXCJjaGFydFwiKSB7XG5cdFx0XHRcdFx0XHRcdFx0b09wZXJhdGlvbkF2YWlsYWJsZU1hcCA9IHRoaXMuX2dldE9wZXJhdGlvbkF2YWlsYWJsZU1hcE9mQ2hhcnQoXG5cdFx0XHRcdFx0XHRcdFx0XHRhY3Rpb25OYW1lLFxuXHRcdFx0XHRcdFx0XHRcdFx0b09wZXJhdGlvbkF2YWlsYWJsZU1hcCxcblx0XHRcdFx0XHRcdFx0XHRcdG9Db250ZXh0XG5cdFx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdHJldHVybiBvT3BlcmF0aW9uQXZhaWxhYmxlTWFwO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZXR1cm4gTGluZUl0ZW0gQWN0aW9uIE9wZXJhdGlvbiBBdmFpbGFibGUgTWFwLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgX2dldE9wZXJhdGlvbkF2YWlsYWJsZU1hcE9mVGFibGVcblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIG9EYXRhRmllbGRGb3JBY3Rpb24gRGF0YSBmaWVsZCBmb3IgYWN0aW9uIG9iamVjdFxuXHQgKiBAcGFyYW0gc0FjdGlvbk5hbWUgQWN0aW9uIG5hbWVcblx0ICogQHBhcmFtIG9PcGVyYXRpb25BdmFpbGFibGVNYXAgT3BlcmF0aW9uIGF2YWlsYWJsZSBtYXAgb2JqZWN0XG5cdCAqIEBwYXJhbSBvQ29udmVydGVyQ29udGV4dCBDb252ZXJ0ZXIgY29udGV4dCBvYmplY3Rcblx0ICogQHJldHVybnMgVGhlIHJlY29yZCBjb250YWluaW5nIGFsbCBhY3Rpb24gbmFtZSBvZiBsaW5lIGl0ZW0gYW5kIHRoZSBjb3JyZXNwb25kaW5nIENvcmUuT3BlcmF0aW9uQXZhaWxhYmxlIHByb3BlcnR5IHBhdGhcblx0ICovXG5cdF9nZXRPcGVyYXRpb25BdmFpbGFibGVNYXBPZlRhYmxlKFxuXHRcdG9EYXRhRmllbGRGb3JBY3Rpb246IERhdGFGaWVsZEZvckFjdGlvbixcblx0XHRzQWN0aW9uTmFtZTogc3RyaW5nLFxuXHRcdG9PcGVyYXRpb25BdmFpbGFibGVNYXA6IFJlY29yZDxzdHJpbmcsIGFueT4sXG5cdFx0b0NvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHRcblx0KSB7XG5cdFx0Y29uc3QgYWN0aW9uVGFyZ2V0ID0gb0RhdGFGaWVsZEZvckFjdGlvbi5BY3Rpb25UYXJnZXQ7XG5cdFx0aWYgKGFjdGlvblRhcmdldD8uYW5ub3RhdGlvbnM/LkNvcmU/Lk9wZXJhdGlvbkF2YWlsYWJsZSA9PT0gbnVsbCkge1xuXHRcdFx0Ly8gV2UgZGlzYWJsZWQgYWN0aW9uIGFkdmVydGlzZW1lbnQgYnV0IGtlcHQgaXQgaW4gdGhlIGNvZGUgZm9yIHRoZSB0aW1lIGJlaW5nXG5cdFx0XHQvL29PcGVyYXRpb25BdmFpbGFibGVNYXAgPSB0aGlzLl9hZGRUb01hcChzQWN0aW9uTmFtZSwgbnVsbCwgb09wZXJhdGlvbkF2YWlsYWJsZU1hcCk7XG5cdFx0fSBlbHNlIGlmIChhY3Rpb25UYXJnZXQ/LnBhcmFtZXRlcnM/Lmxlbmd0aCkge1xuXHRcdFx0Y29uc3QgYmluZGluZ1BhcmFtZXRlckZ1bGxOYW1lID0gYWN0aW9uVGFyZ2V0LnBhcmFtZXRlcnNbMF0uZnVsbHlRdWFsaWZpZWROYW1lLFxuXHRcdFx0XHR0YXJnZXRFeHByZXNzaW9uID0gZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKFxuXHRcdFx0XHRcdGFjdGlvblRhcmdldD8uYW5ub3RhdGlvbnM/LkNvcmU/Lk9wZXJhdGlvbkF2YWlsYWJsZSxcblx0XHRcdFx0XHRbXSxcblx0XHRcdFx0XHR1bmRlZmluZWQsXG5cdFx0XHRcdFx0KHBhdGg6IHN0cmluZykgPT4gYmluZGluZ0NvbnRleHRQYXRoVmlzaXRvcihwYXRoLCBvQ29udmVydGVyQ29udGV4dCwgYmluZGluZ1BhcmFtZXRlckZ1bGxOYW1lKVxuXHRcdFx0XHQpO1xuXHRcdFx0aWYgKGlzUGF0aEluTW9kZWxFeHByZXNzaW9uKHRhcmdldEV4cHJlc3Npb24pKSB7XG5cdFx0XHRcdG9PcGVyYXRpb25BdmFpbGFibGVNYXAgPSB0aGlzLl9hZGRUb01hcChzQWN0aW9uTmFtZSwgdGFyZ2V0RXhwcmVzc2lvbi5wYXRoLCBvT3BlcmF0aW9uQXZhaWxhYmxlTWFwKTtcblx0XHRcdH0gZWxzZSBpZiAoYWN0aW9uVGFyZ2V0Py5hbm5vdGF0aW9ucz8uQ29yZT8uT3BlcmF0aW9uQXZhaWxhYmxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0b09wZXJhdGlvbkF2YWlsYWJsZU1hcCA9IHRoaXMuX2FkZFRvTWFwKHNBY3Rpb25OYW1lLCB0YXJnZXRFeHByZXNzaW9uLCBvT3BlcmF0aW9uQXZhaWxhYmxlTWFwKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG9PcGVyYXRpb25BdmFpbGFibGVNYXA7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFJldHVybiBMaW5lSXRlbSBBY3Rpb24gT3BlcmF0aW9uIEF2YWlsYWJsZSBNYXAuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBfZ2V0T3BlcmF0aW9uQXZhaWxhYmxlTWFwT2ZDaGFydFxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0gc0FjdGlvbk5hbWUgQWN0aW9uIG5hbWVcblx0ICogQHBhcmFtIG9PcGVyYXRpb25BdmFpbGFibGVNYXAgT3BlcmF0aW9uIGF2YWlsYWJsZSBtYXAgb2JqZWN0XG5cdCAqIEBwYXJhbSBvQ29udGV4dCBDb250ZXh0IG9iamVjdFxuXHQgKiBAcmV0dXJucyBUaGUgcmVjb3JkIGNvbnRhaW5pbmcgYWxsIGFjdGlvbiBuYW1lIG9mIGNoYXJ0IGFuZCB0aGUgY29ycmVzcG9uZGluZyBDb3JlLk9wZXJhdGlvbkF2YWlsYWJsZSBwcm9wZXJ0eSBwYXRoXG5cdCAqL1xuXHRfZ2V0T3BlcmF0aW9uQXZhaWxhYmxlTWFwT2ZDaGFydChzQWN0aW9uTmFtZTogc3RyaW5nLCBvT3BlcmF0aW9uQXZhaWxhYmxlTWFwOiBSZWNvcmQ8c3RyaW5nLCBhbnk+LCBvQ29udGV4dDogYW55KSB7XG5cdFx0bGV0IG9SZXN1bHQgPSBDb21tb25IZWxwZXIuZ2V0QWN0aW9uUGF0aChvQ29udGV4dC5jb250ZXh0LCBmYWxzZSwgc0FjdGlvbk5hbWUsIHRydWUpO1xuXHRcdGlmIChvUmVzdWx0ID09PSBudWxsKSB7XG5cdFx0XHRvT3BlcmF0aW9uQXZhaWxhYmxlTWFwID0gdGhpcy5fYWRkVG9NYXAoc0FjdGlvbk5hbWUsIG51bGwsIG9PcGVyYXRpb25BdmFpbGFibGVNYXApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRvUmVzdWx0ID0gQ29tbW9uSGVscGVyLmdldEFjdGlvblBhdGgob0NvbnRleHQuY29udGV4dCwgZmFsc2UsIHNBY3Rpb25OYW1lKTtcblx0XHRcdGlmIChvUmVzdWx0LnNQcm9wZXJ0eSkge1xuXHRcdFx0XHRvT3BlcmF0aW9uQXZhaWxhYmxlTWFwID0gdGhpcy5fYWRkVG9NYXAoXG5cdFx0XHRcdFx0c0FjdGlvbk5hbWUsXG5cdFx0XHRcdFx0b1Jlc3VsdC5zUHJvcGVydHkuc3Vic3RyKG9SZXN1bHQuc0JpbmRpbmdQYXJhbWV0ZXIubGVuZ3RoICsgMSksXG5cdFx0XHRcdFx0b09wZXJhdGlvbkF2YWlsYWJsZU1hcFxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gb09wZXJhdGlvbkF2YWlsYWJsZU1hcDtcblx0fSxcblxuXHQvKipcblx0ICogUmV0dXJuIE1hcC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIF9hZGRUb01hcFxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0gc0tleSBLZXlcblx0ICogQHBhcmFtIG9WYWx1ZSBWYWx1ZVxuXHQgKiBAcGFyYW0gb01hcCBNYXAgb2JqZWN0XG5cdCAqIEByZXR1cm5zIE1hcCBvYmplY3Rcblx0ICovXG5cdF9hZGRUb01hcChzS2V5OiBzdHJpbmcsIG9WYWx1ZTogYW55LCBvTWFwOiBSZWNvcmQ8c3RyaW5nLCBhbnk+KSB7XG5cdFx0aWYgKHNLZXkgJiYgb01hcCkge1xuXHRcdFx0b01hcFtzS2V5XSA9IG9WYWx1ZTtcblx0XHR9XG5cdFx0cmV0dXJuIG9NYXA7XG5cdH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IEFjdGlvbkhlbHBlcjtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7OztFQU1BLE1BQU1BLFlBQVksR0FBRztJQUNwQjtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDQyw2QkFBNkIsQ0FBQ0MsV0FBZ0IsRUFBRUMsUUFBYSxFQUFFO01BQzlELE1BQU1DLDJCQUFrQyxHQUFHLEVBQUU7TUFDN0MsSUFBSUMsV0FBVyxFQUFFQyxXQUFXLEVBQUVDLGVBQWUsRUFBRUMscUJBQXFCLEVB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