/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/type/TypeUtil", "sap/ui/mdc/field/FieldBaseDelegate", "sap/ui/model/Filter"], function (Log, CommonUtils, TypeUtil, FieldBaseDelegate, Filter) {
  "use strict";

  return Object.assign({}, FieldBaseDelegate, {
    /**
     * If the <code>Field</code> control is used, the used data type might come from the binding.
     * In V4-unit or currency case it might need to be formatted once.
     * To initialize the internal type later on, the currencies must be returned.
     *
     * @param _payload Payload for delegate
     * @param type Type from binding
     * @param value Given value
     * @returns Information needed to initialize internal type (needs to set bTypeInitialized to true if initialized)
     */
    initializeTypeFromBinding: function (_payload, type, value) {
      // V4 Unit and Currency types have a map with valid units and create an internal customizing for it.
      // The Field needs to keep this customizing logic when creating the internal type.
      // (As external RAW binding is used there is no formatting on parsing.)

      const result = {};
      if (type && type.isA(["sap.ui.model.odata.type.Unit", "sap.ui.model.odata.type.Currency"]) && Array.isArray(value) && value.length > 2 && value[2] !== undefined) {
        // format once to set internal customizing. Allow null as valid values for custom units
        type.formatValue(value, "string");
        result.bTypeInitialized = true;
        result.mCustomUnits = value[2]; // TODO: find a better way to provide custom units to internal type
      }

      return result;
    },
    /**
     * This function initializes the unit type.
     * If the <code>Field</code> control is used, the used data type might come from the binding.
     * If the type is a V4 unit or currency, it might need to be formatted once.
     *
     * @param _payload Payload for delegate
     * @param type Type from binding
     * @param typeInitialization Information needed to initialize internal type
     */
    initializeInternalUnitType: function (_payload, type, typeInitialization) {
      if ((typeInitialization === null || typeInitialization === void 0 ? void 0 : typeInitialization.mCustomUnits) !== undefined) {
        // if already initialized initialize new type too.
        type.formatValue([null, null, typeInitialization.mCustomUnits], "string");
      }
    },
    /**
     * This function enhances the value with unit or currency information if needed by the data type.
     *
     * @param _payload Payload for delegate
     * @param  values Values
     * @param  typeInitialization Information needed to initialize internal type
     * @returns Values
     */
    enhanceValueForUnit: function (_payload, values, typeInitialization) {
      if ((typeInitialization === null || typeInitialization === void 0 ? void 0 : typeInitialization.bTypeInitialized) === true && values.length === 2) {
        values.push(typeInitialization.mCustomUnits);
        return values;
      }
      return undefined;
    },
    /**
     * This function returns which <code>ValueHelpDelegate</code> is used
     * if a default field help (for example, for defining conditions in </code>FilterField</code>)
     * is created.
     *
     * @param _payload Payload for delegate
     * @returns Delegate object with name and payload
     */
    getDefaultValueHelpDelegate: function (_payload) {
      return {
        name: "sap/ui/mdc/odata/v4/ValueHelpDelegate",
        payload: {}
      };
    },
    getTypeUtil: function (_payload) {
      return TypeUtil;
    },
    /**
     * Determine all parameters in a value help that use a specific property.
     *
     * @param valueListInfo Value list info
     * @param propertyName Name of the property
     * @returns List of all found parameters
     */
    _getValueListParameter: function (valueListInfo, propertyName) {
      //determine path to value list property
      return valueListInfo.Parameters.filter(function (entry) {
        if (entry.LocalDataProperty) {
          return entry.LocalDataProperty.$PropertyPath === propertyName;
        } else {
          return false;
        }
      });
    },
    /**
     * Build filters for each in-parameter.
     *
     * @param valueList Value list info
     * @param propertyName Name of the property
     * @param valueHelpProperty Name of the value help property
     * @param vKey Value of the property
     * @param valuehelpPayload Payload of the value help
     * @returns List of filters
     */
    _getFilter: function (valueList, propertyName, valueHelpProperty, vKey, valuehelpPayload) {
      const filters = [];
      const parameters = valueList.Parameters.filter(function (parameter) {
        var _parameter$LocalDataP;
        return parameter.$Type === "com.sap.vocabularies.Common.v1.ValueListParameterIn" || parameter.$Type === "com.sap.vocabularies.Common.v1.ValueListParameterInOut" || ((_parameter$LocalDataP = parameter.LocalDataProperty) === null || _parameter$LocalDataP === void 0 ? void 0 : _parameter$LocalDataP.$PropertyPath) === propertyName && parameter.ValueListProperty === valueHelpProperty;
      });
      for (const parameter of parameters) {
        var _parameter$LocalDataP2;
        if (((_parameter$LocalDataP2 = parameter.LocalDataProperty) === null || _parameter$LocalDataP2 === void 0 ? void 0 : _parameter$LocalDataP2.$PropertyPath) === propertyName) {
          filters.push(new Filter({
            path: valueHelpProperty,
            operator: "EQ",
            value1: vKey
          }));
        } else if ((parameter.$Type === "com.sap.vocabularies.Common.v1.ValueListParameterIn" || parameter.$Type === "com.sap.vocabularies.Common.v1.ValueListParameterInOut") && valuehelpPayload !== null && valuehelpPayload !== void 0 && valuehelpPayload.isActionParameterDialog) {
          var _parameter$LocalDataP3;
          const apdFieldPath = `APD_::${(_parameter$LocalDataP3 = parameter.LocalDataProperty) === null || _parameter$LocalDataP3 === void 0 ? void 0 : _parameter$LocalDataP3.$PropertyPath}`;
          const apdField = sap.ui.getCore().byId(apdFieldPath);
          const apdFieldValue = apdField === null || apdField === void 0 ? void 0 : apdField.getValue();
          if (apdFieldValue !== null) {
            filters.push(new Filter({
              path: parameter.ValueListProperty,
              operator: "EQ",
              value1: apdFieldValue
            }));
          }
        }
      }
      return filters;
    },
    getItemForValue: function (payload, fieldHelp, config) {
      //BCP: 2270162887 . The MDC field should not try to get the item when the field is emptied
      if (config.value !== "") {
        return FieldBaseDelegate.getItemForValue(payload, fieldHelp, config);
      }
      return undefined;
    },
    /**
     * Determines the description for a given key.
     *
     * @param payload Payload for delegate
     * @param valueHelp Field help assigned to the <code>Field</code> or <code>FilterField</code> control
     * @param key Key value of the description
     * @param _conditionIn In parameters for the key (no longer supported)
     * @param _conditionOut Out parameters for the key (no longer supported)
     * @param bindingContext BindingContext <code>BindingContext</code> of the checked field. Inside a table, the <code>FieldHelp</code> element can be connected to a different row
     * @param _ConditionModel ConditionModel</code>, if bound to one
     * @param _conditionModelName Name of the <code>ConditionModel</code>, if bound to one
     * @param _conditionPayload Additional context information for this key
     * @param control Instance of the calling control
     * @param _type Type of the value
     * @returns Description for the key or object containing a description, key and payload. If the description is not available right away (it must be requested), a <code>Promise</code> is returned
     */
    getDescription: async function (payload, valueHelp, key, _conditionIn, _conditionOut, bindingContext, _ConditionModel, _conditionModelName, _conditionPayload, control, _type) {
      var _payload2, _payload3;
      //JIRA: FIORITECHP1-22022 . The MDC field should not  tries to determine description with the initial GET of the data.
      // it should rely on the data we already received from the backend
      // But The getDescription function is also called in the FilterField case if a variant is loaded.
      // As the description text could be language dependent it is not stored in the variant, so it needs to be read on rendering.

      /* Retrieve text from value help, if value was set by out-parameter (BCP 2270160633) */
      if (!payload && control !== null && control !== void 0 && control.getDisplay().includes("Description")) {
        payload = {
          retrieveTextFromValueList: true
        };
      }
      if (((_payload2 = payload) === null || _payload2 === void 0 ? void 0 : _payload2.retrieveTextFromValueList) === true || ((_payload3 = payload) === null || _payload3 === void 0 ? void 0 : _payload3.isFilterField) === true) {
        const dataModel = valueHelp.getModel();
        const metaModel = dataModel ? dataModel.getMetaModel() : CommonUtils.getAppComponent(valueHelp).getModel().getMetaModel();
        const valuehelpPayload = valueHelp.getPayload();
        const propertyPath = valuehelpPayload === null || valuehelpPayload === void 0 ? void 0 : valuehelpPayload.propertyPath;
        let textProperty;
        try {
          var _valueHelpParameters$;
          /* Request value help metadata */
          const valueListInfo = await metaModel.requestValueListInfo(propertyPath, true, bindingContext);
          const propertyName = metaModel.getObject(`${propertyPath}@sapui.name`);
          // take the first value list annotation - alternatively take the one without qualifier or the first one
          const valueList = valueListInfo[Object.keys(valueListInfo)[0]];
          const valueHelpParameters = this._getValueListParameter(valueList, propertyName);
          const valueHelpProperty = valueHelpParameters === null || valueHelpParameters === void 0 ? void 0 : (_valueHelpParameters$ = valueHelpParameters[0]) === null || _valueHelpParameters$ === void 0 ? void 0 : _valueHelpParameters$.ValueListProperty;
          if (!valueHelpProperty) {
            throw Error(`Inconsistent value help annotation for ${propertyName}`);
          }
          // get text annotation for this value list property
          const valueListModel = valueList.$model;
          const textAnnotation = valueListModel.getMetaModel().getObject(`/${valueList.CollectionPath}/${valueHelpProperty}@com.sap.vocabularies.Common.v1.Text`);
          if (textAnnotation && textAnnotation.$Path) {
            textProperty = textAnnotation.$Path;
            /* Build the filter for each in-parameter */
            const filters = this._getFilter(valueList, propertyName, valueHelpProperty, key, valuehelpPayload);
            const listBinding = valueListModel.bindList(`/${valueList.CollectionPath}`, undefined, undefined, filters, {
              $select: textProperty
            });
            /* Request description for given key from value list entity */
            const contexts = await listBinding.requestContexts(0, 2);
            return contexts.length ? contexts[0].getObject(textProperty) : undefined;
          } else {
            const message = `Text Annotation for ${valueHelpProperty} is not defined`;
            Log.error(message);
            return undefined;
          }
        } catch (error) {
          const status = error ? error.status : undefined;
          const message = error instanceof Error ? error.message : String(error);
          const msg = status === 404 ? `Metadata not found (${status}) for value help of property ${propertyPath}` : message;
          Log.error(msg);
        }
      }
      return undefined;
    }
  });
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJPYmplY3QiLCJhc3NpZ24iLCJGaWVsZEJhc2VEZWxlZ2F0ZSIsImluaXRpYWxpemVUeXBlRnJvbUJpbmRpbmciLCJfcGF5bG9hZCIsInR5cGUiLCJ2YWx1ZSIsInJlc3VsdCIsImlzQSIsIkFycmF5IiwiaXNBcnJheSIsImxlbmd0aCIsInVuZGVmaW5lZCIsImZvcm1hdFZhbHVlIiwiYlR5cGVJbml0aWFsaXplZCIsIm1DdXN0b21Vbml0cyIsImluaXRpYWxpemVJbnRlcm5hbFVuaXRUeXBlIiwidHlwZUluaXRpYWxpemF0aW9uIiwiZW5oYW5jZVZhbHVlRm9yVW5pdCIsInZhbHVlcyIsInB1c2giLCJnZXREZWZhdWx0VmFsdWVIZWxwRGVsZWdhdGUiLCJuYW1lIiwicGF5bG9hZCIsImdldFR5cGVVdGlsIiwiVHlwZVV0aWwiLCJfZ2V0VmFsdWVMaXN0UGFyYW1ldGVyIiwidmFsdWVMaXN0SW5mbyIsInByb3BlcnR5TmFtZSIsIlBhcmFtZXRlcnMiLCJmaWx0ZXIiLCJlbnRyeSIsIkxvY2FsRGF0YVByb3BlcnR5IiwiJFByb3BlcnR5UGF0aCIsIl9nZXRGaWx0ZXIiLCJ2YWx1ZUxpc3QiLCJ2YWx1ZUhlbHBQcm9wZXJ0eSIsInZLZXkiLCJ2YWx1ZWhlbHBQYXlsb2FkIiwiZmlsdGVycyIsInBhcmFtZXRlcnMiLCJwYXJhbWV0ZXIiLCIkVHlwZSIsIlZhbHVlTGlzdFByb3BlcnR5IiwiRmlsdGVyIiwicGF0aCIsIm9wZXJhdG9yIiwidmFsdWUxIiwiaXNBY3Rpb25QYXJhbWV0ZXJEaWFsb2ciLCJhcGRGaWVsZFBhdGgiLCJhcGRGaWVsZCIsInNhcCIsInVpIiwiZ2V0Q29yZSIsImJ5SWQiLCJhcGRGaWVsZFZhbHVlIiwiZ2V0VmFsdWUiLCJnZXRJdGVtRm9yVmFsdWUiLCJmaWVsZEhlbHAiLCJjb25maWciLCJnZXREZXNjcmlwdGlvbiIsInZhbHVlSGVscCIsImtleSIsIl9jb25kaXRpb25JbiIsIl9jb25kaXRpb25PdXQiLCJiaW5kaW5nQ29udGV4dCIsIl9Db25kaXRpb25Nb2RlbCIsIl9jb25kaXRpb25Nb2RlbE5hbWUiLCJfY29uZGl0aW9uUGF5bG9hZCIsImNvbnRyb2wiLCJfdHlwZSIsImdldERpc3BsYXkiLCJpbmNsdWRlcyIsInJldHJpZXZlVGV4dEZyb21WYWx1ZUxpc3QiLCJpc0ZpbHRlckZpZWxkIiwiZGF0YU1vZGVsIiwiZ2V0TW9kZWwiLCJtZXRhTW9kZWwiLCJnZXRNZXRhTW9kZWwiLCJDb21tb25VdGlscyIsImdldEFwcENvbXBvbmVudCIsImdldFBheWxvYWQiLCJwcm9wZXJ0eVBhdGgiLCJ0ZXh0UHJvcGVydHkiLCJyZXF1ZXN0VmFsdWVMaXN0SW5mbyIsImdldE9iamVjdCIsImtleXMiLCJ2YWx1ZUhlbHBQYXJhbWV0ZXJzIiwiRXJyb3IiLCJ2YWx1ZUxpc3RNb2RlbCIsIiRtb2RlbCIsInRleHRBbm5vdGF0aW9uIiwiQ29sbGVjdGlvblBhdGgiLCIkUGF0aCIsImxpc3RCaW5kaW5nIiwiYmluZExpc3QiLCIkc2VsZWN0IiwiY29udGV4dHMiLCJyZXF1ZXN0Q29udGV4dHMiLCJtZXNzYWdlIiwiTG9nIiwiZXJyb3IiLCJzdGF0dXMiLCJTdHJpbmciLCJtc2ciXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkZpZWxkQmFzZURlbGVnYXRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbW1vbkFubm90YXRpb25UeXBlcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvQ29tbW9uXCI7XG5pbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCBUeXBlVXRpbCBmcm9tIFwic2FwL2ZlL2NvcmUvdHlwZS9UeXBlVXRpbFwiO1xuaW1wb3J0IHR5cGUge1xuXHRBbm5vdGF0aW9uVmFsdWVMaXN0VHlwZSxcblx0QW5ub3RhdGlvblZhbHVlTGlzdFR5cGVCeVF1YWxpZmllcixcblx0VmFsdWVIZWxwUGF5bG9hZFxufSBmcm9tIFwic2FwL2ZlL21hY3Jvcy9pbnRlcm5hbC92YWx1ZWhlbHAvVmFsdWVMaXN0SGVscGVyXCI7XG5pbXBvcnQgdHlwZSBDb250cm9sIGZyb20gXCJzYXAvdWkvY29yZS9Db250cm9sXCI7XG5pbXBvcnQgdHlwZSBDb25kaXRpb25Nb2RlbCBmcm9tIFwic2FwL3VpL21kYy9jb25kaXRpb24vQ29uZGl0aW9uTW9kZWxcIjtcbmltcG9ydCB0eXBlIEZpZWxkIGZyb20gXCJzYXAvdWkvbWRjL0ZpZWxkXCI7XG5pbXBvcnQgdHlwZSBGaWVsZEJhc2UgZnJvbSBcInNhcC91aS9tZGMvZmllbGQvRmllbGRCYXNlXCI7XG5pbXBvcnQgRmllbGRCYXNlRGVsZWdhdGUgZnJvbSBcInNhcC91aS9tZGMvZmllbGQvRmllbGRCYXNlRGVsZWdhdGVcIjtcbmltcG9ydCB0eXBlIEZpZWxkSGVscEJhc2UgZnJvbSBcInNhcC91aS9tZGMvZmllbGQvRmllbGRIZWxwQmFzZVwiO1xuaW1wb3J0IHR5cGUgVmFsdWVIZWxwIGZyb20gXCJzYXAvdWkvbWRjL1ZhbHVlSGVscFwiO1xuaW1wb3J0IEZpbHRlciBmcm9tIFwic2FwL3VpL21vZGVsL0ZpbHRlclwiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L0NvbnRleHRcIjtcbmltcG9ydCB0eXBlIE9EYXRhTWV0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFNZXRhTW9kZWxcIjtcbmltcG9ydCB0eXBlIE9EYXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1vZGVsXCI7XG5pbXBvcnQgdHlwZSBTaW1wbGVUeXBlIGZyb20gXCJzYXAvdWkvbW9kZWwvU2ltcGxlVHlwZVwiO1xuXG50eXBlIEZpZWxkUGF5bG9hZCA9IHtcblx0cmV0cmlldmVUZXh0RnJvbVZhbHVlTGlzdD86IGJvb2xlYW47XG5cdGlzRmlsdGVyRmllbGQ/OiBib29sZWFuO1xufTtcblxuZXhwb3J0IHR5cGUgVmFsdWUgPSBzdHJpbmcgfCBEYXRlIHwgbnVtYmVyIHwgYm9vbGVhbiB8IHVuZGVmaW5lZCB8IG51bGw7XG5cbmV4cG9ydCB0eXBlIFR5cGVJbml0aWFsaXphdGlvbiA9IHtcblx0YlR5cGVJbml0aWFsaXplZD86IGJvb2xlYW47XG5cdG1DdXN0b21Vbml0cz86IHN0cmluZztcbn07XG5cbmV4cG9ydCB0eXBlIENvbmZpZyA9IHtcblx0dmFsdWU6IFZhbHVlO1xuXHRwYXJzZWRWYWx1ZTogVmFsdWU7XG5cdGJpbmRpbmdDb250ZXh0OiBDb250ZXh0O1xuXHRjaGVja0tleTogYm9vbGVhbjtcblx0Y2hlY2tEZXNjcmlwdGlvbjogYm9vbGVhbjtcblx0Y29uZGl0aW9uTW9kZWw/OiBDb25kaXRpb25Nb2RlbDtcblx0Y29uZGl0aW9uTW9kZWxOYW1lPzogc3RyaW5nO1xuXHRjb250cm9sPzogb2JqZWN0O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgT2JqZWN0LmFzc2lnbih7fSwgRmllbGRCYXNlRGVsZWdhdGUsIHtcblx0LyoqXG5cdCAqIElmIHRoZSA8Y29kZT5GaWVsZDwvY29kZT4gY29udHJvbCBpcyB1c2VkLCB0aGUgdXNlZCBkYXRhIHR5cGUgbWlnaHQgY29tZSBmcm9tIHRoZSBiaW5kaW5nLlxuXHQgKiBJbiBWNC11bml0IG9yIGN1cnJlbmN5IGNhc2UgaXQgbWlnaHQgbmVlZCB0byBiZSBmb3JtYXR0ZWQgb25jZS5cblx0ICogVG8gaW5pdGlhbGl6ZSB0aGUgaW50ZXJuYWwgdHlwZSBsYXRlciBvbiwgdGhlIGN1cnJlbmNpZXMgbXVzdCBiZSByZXR1cm5lZC5cblx0ICpcblx0ICogQHBhcmFtIF9wYXlsb2FkIFBheWxvYWQgZm9yIGRlbGVnYXRlXG5cdCAqIEBwYXJhbSB0eXBlIFR5cGUgZnJvbSBiaW5kaW5nXG5cdCAqIEBwYXJhbSB2YWx1ZSBHaXZlbiB2YWx1ZVxuXHQgKiBAcmV0dXJucyBJbmZvcm1hdGlvbiBuZWVkZWQgdG8gaW5pdGlhbGl6ZSBpbnRlcm5hbCB0eXBlIChuZWVkcyB0byBzZXQgYlR5cGVJbml0aWFsaXplZCB0byB0cnVlIGlmIGluaXRpYWxpemVkKVxuXHQgKi9cblx0aW5pdGlhbGl6ZVR5cGVGcm9tQmluZGluZzogZnVuY3Rpb24gKF9wYXlsb2FkOiBGaWVsZFBheWxvYWQsIHR5cGU6IFNpbXBsZVR5cGUgfCB1bmRlZmluZWQsIHZhbHVlOiBWYWx1ZSB8IFZhbHVlW10pIHtcblx0XHQvLyBWNCBVbml0IGFuZCBDdXJyZW5jeSB0eXBlcyBoYXZlIGEgbWFwIHdpdGggdmFsaWQgdW5pdHMgYW5kIGNyZWF0ZSBhbiBpbnRlcm5hbCBjdXN0b21pemluZyBmb3IgaXQuXG5cdFx0Ly8gVGhlIEZpZWxkIG5lZWRzIHRvIGtlZXAgdGhpcyBjdXN0b21pemluZyBsb2dpYyB3aGVuIGNyZWF0aW5nIHRoZSBpbnRlcm5hbCB0eXBlLlxuXHRcdC8vIChBcyBleHRlcm5hbCBSQVcgYmluZGluZyBpcyB1c2VkIHRoZXJlIGlzIG5vIGZvcm1hdHRpbmcgb24gcGFyc2luZy4pXG5cblx0XHRjb25zdCByZXN1bHQ6IFR5cGVJbml0aWFsaXphdGlvbiA9IHt9O1xuXHRcdGlmIChcblx0XHRcdHR5cGUgJiZcblx0XHRcdHR5cGUuaXNBKFtcInNhcC51aS5tb2RlbC5vZGF0YS50eXBlLlVuaXRcIiwgXCJzYXAudWkubW9kZWwub2RhdGEudHlwZS5DdXJyZW5jeVwiXSkgJiZcblx0XHRcdEFycmF5LmlzQXJyYXkodmFsdWUpICYmXG5cdFx0XHR2YWx1ZS5sZW5ndGggPiAyICYmXG5cdFx0XHR2YWx1ZVsyXSAhPT0gdW5kZWZpbmVkXG5cdFx0KSB7XG5cdFx0XHQvLyBmb3JtYXQgb25jZSB0byBzZXQgaW50ZXJuYWwgY3VzdG9taXppbmcuIEFsbG93IG51bGwgYXMgdmFsaWQgdmFsdWVzIGZvciBjdXN0b20gdW5pdHNcblx0XHRcdHR5cGUuZm9ybWF0VmFsdWUodmFsdWUsIFwic3RyaW5nXCIpO1xuXHRcdFx0cmVzdWx0LmJUeXBlSW5pdGlhbGl6ZWQgPSB0cnVlO1xuXHRcdFx0cmVzdWx0Lm1DdXN0b21Vbml0cyA9IHZhbHVlWzJdIGFzIHN0cmluZzsgLy8gVE9ETzogZmluZCBhIGJldHRlciB3YXkgdG8gcHJvdmlkZSBjdXN0b20gdW5pdHMgdG8gaW50ZXJuYWwgdHlwZVxuXHRcdH1cblxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFRoaXMgZnVuY3Rpb24gaW5pdGlhbGl6ZXMgdGhlIHVuaXQgdHlwZS5cblx0ICogSWYgdGhlIDxjb2RlPkZpZWxkPC9jb2RlPiBjb250cm9sIGlzIHVzZWQsIHRoZSB1c2VkIGRhdGEgdHlwZSBtaWdodCBjb21lIGZyb20gdGhlIGJpbmRpbmcuXG5cdCAqIElmIHRoZSB0eXBlIGlzIGEgVjQgdW5pdCBvciBjdXJyZW5jeSwgaXQgbWlnaHQgbmVlZCB0byBiZSBmb3JtYXR0ZWQgb25jZS5cblx0ICpcblx0ICogQHBhcmFtIF9wYXlsb2FkIFBheWxvYWQgZm9yIGRlbGVnYXRlXG5cdCAqIEBwYXJhbSB0eXBlIFR5cGUgZnJvbSBiaW5kaW5nXG5cdCAqIEBwYXJhbSB0eXBlSW5pdGlhbGl6YXRpb24gSW5mb3JtYXRpb24gbmVlZGVkIHRvIGluaXRpYWxpemUgaW50ZXJuYWwgdHlwZVxuXHQgKi9cblx0aW5pdGlhbGl6ZUludGVybmFsVW5pdFR5cGU6IGZ1bmN0aW9uIChfcGF5bG9hZDogRmllbGRQYXlsb2FkLCB0eXBlOiBTaW1wbGVUeXBlLCB0eXBlSW5pdGlhbGl6YXRpb24/OiBUeXBlSW5pdGlhbGl6YXRpb24pIHtcblx0XHRpZiAodHlwZUluaXRpYWxpemF0aW9uPy5tQ3VzdG9tVW5pdHMgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Ly8gaWYgYWxyZWFkeSBpbml0aWFsaXplZCBpbml0aWFsaXplIG5ldyB0eXBlIHRvby5cblx0XHRcdHR5cGUuZm9ybWF0VmFsdWUoW251bGwsIG51bGwsIHR5cGVJbml0aWFsaXphdGlvbi5tQ3VzdG9tVW5pdHNdLCBcInN0cmluZ1wiKTtcblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIFRoaXMgZnVuY3Rpb24gZW5oYW5jZXMgdGhlIHZhbHVlIHdpdGggdW5pdCBvciBjdXJyZW5jeSBpbmZvcm1hdGlvbiBpZiBuZWVkZWQgYnkgdGhlIGRhdGEgdHlwZS5cblx0ICpcblx0ICogQHBhcmFtIF9wYXlsb2FkIFBheWxvYWQgZm9yIGRlbGVnYXRlXG5cdCAqIEBwYXJhbSAgdmFsdWVzIFZhbHVlc1xuXHQgKiBAcGFyYW0gIHR5cGVJbml0aWFsaXphdGlvbiBJbmZvcm1hdGlvbiBuZWVkZWQgdG8gaW5pdGlhbGl6ZSBpbnRlcm5hbCB0eXBlXG5cdCAqIEByZXR1cm5zIFZhbHVlc1xuXHQgKi9cblx0ZW5oYW5jZVZhbHVlRm9yVW5pdDogZnVuY3Rpb24gKF9wYXlsb2FkOiBGaWVsZFBheWxvYWQsIHZhbHVlczogVmFsdWVbXSwgdHlwZUluaXRpYWxpemF0aW9uPzogVHlwZUluaXRpYWxpemF0aW9uKSB7XG5cdFx0aWYgKHR5cGVJbml0aWFsaXphdGlvbj8uYlR5cGVJbml0aWFsaXplZCA9PT0gdHJ1ZSAmJiB2YWx1ZXMubGVuZ3RoID09PSAyKSB7XG5cdFx0XHR2YWx1ZXMucHVzaCh0eXBlSW5pdGlhbGl6YXRpb24ubUN1c3RvbVVuaXRzKTtcblx0XHRcdHJldHVybiB2YWx1ZXM7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fSxcblxuXHQvKipcblx0ICogVGhpcyBmdW5jdGlvbiByZXR1cm5zIHdoaWNoIDxjb2RlPlZhbHVlSGVscERlbGVnYXRlPC9jb2RlPiBpcyB1c2VkXG5cdCAqIGlmIGEgZGVmYXVsdCBmaWVsZCBoZWxwIChmb3IgZXhhbXBsZSwgZm9yIGRlZmluaW5nIGNvbmRpdGlvbnMgaW4gPC9jb2RlPkZpbHRlckZpZWxkPC9jb2RlPilcblx0ICogaXMgY3JlYXRlZC5cblx0ICpcblx0ICogQHBhcmFtIF9wYXlsb2FkIFBheWxvYWQgZm9yIGRlbGVnYXRlXG5cdCAqIEByZXR1cm5zIERlbGVnYXRlIG9iamVjdCB3aXRoIG5hbWUgYW5kIHBheWxvYWRcblx0ICovXG5cdGdldERlZmF1bHRWYWx1ZUhlbHBEZWxlZ2F0ZTogZnVuY3Rpb24gKF9wYXlsb2FkOiBGaWVsZFBheWxvYWQpIHtcblx0XHRyZXR1cm4geyBuYW1lOiBcInNhcC91aS9tZGMvb2RhdGEvdjQvVmFsdWVIZWxwRGVsZWdhdGVcIiwgcGF5bG9hZDoge30gfTtcblx0fSxcblxuXHRnZXRUeXBlVXRpbDogZnVuY3Rpb24gKF9wYXlsb2FkOiBGaWVsZFBheWxvYWQpIHtcblx0XHRyZXR1cm4gVHlwZVV0aWw7XG5cdH0sXG5cblx0LyoqXG5cdCAqIERldGVybWluZSBhbGwgcGFyYW1ldGVycyBpbiBhIHZhbHVlIGhlbHAgdGhhdCB1c2UgYSBzcGVjaWZpYyBwcm9wZXJ0eS5cblx0ICpcblx0ICogQHBhcmFtIHZhbHVlTGlzdEluZm8gVmFsdWUgbGlzdCBpbmZvXG5cdCAqIEBwYXJhbSBwcm9wZXJ0eU5hbWUgTmFtZSBvZiB0aGUgcHJvcGVydHlcblx0ICogQHJldHVybnMgTGlzdCBvZiBhbGwgZm91bmQgcGFyYW1ldGVyc1xuXHQgKi9cblx0X2dldFZhbHVlTGlzdFBhcmFtZXRlcjogZnVuY3Rpb24gKHZhbHVlTGlzdEluZm86IEFubm90YXRpb25WYWx1ZUxpc3RUeXBlLCBwcm9wZXJ0eU5hbWU6IHN0cmluZykge1xuXHRcdC8vZGV0ZXJtaW5lIHBhdGggdG8gdmFsdWUgbGlzdCBwcm9wZXJ0eVxuXHRcdHJldHVybiB2YWx1ZUxpc3RJbmZvLlBhcmFtZXRlcnMuZmlsdGVyKGZ1bmN0aW9uIChlbnRyeSkge1xuXHRcdFx0aWYgKGVudHJ5LkxvY2FsRGF0YVByb3BlcnR5KSB7XG5cdFx0XHRcdHJldHVybiBlbnRyeS5Mb2NhbERhdGFQcm9wZXJ0eS4kUHJvcGVydHlQYXRoID09PSBwcm9wZXJ0eU5hbWU7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cdC8qKlxuXHQgKiBCdWlsZCBmaWx0ZXJzIGZvciBlYWNoIGluLXBhcmFtZXRlci5cblx0ICpcblx0ICogQHBhcmFtIHZhbHVlTGlzdCBWYWx1ZSBsaXN0IGluZm9cblx0ICogQHBhcmFtIHByb3BlcnR5TmFtZSBOYW1lIG9mIHRoZSBwcm9wZXJ0eVxuXHQgKiBAcGFyYW0gdmFsdWVIZWxwUHJvcGVydHkgTmFtZSBvZiB0aGUgdmFsdWUgaGVscCBwcm9wZXJ0eVxuXHQgKiBAcGFyYW0gdktleSBWYWx1ZSBvZiB0aGUgcHJvcGVydHlcblx0ICogQHBhcmFtIHZhbHVlaGVscFBheWxvYWQgUGF5bG9hZCBvZiB0aGUgdmFsdWUgaGVscFxuXHQgKiBAcmV0dXJucyBMaXN0IG9mIGZpbHRlcnNcblx0ICovXG5cdF9nZXRGaWx0ZXI6IGZ1bmN0aW9uIChcblx0XHR2YWx1ZUxpc3Q6IEFubm90YXRpb25WYWx1ZUxpc3RUeXBlLFxuXHRcdHByb3BlcnR5TmFtZTogc3RyaW5nLFxuXHRcdHZhbHVlSGVscFByb3BlcnR5OiBzdHJpbmcsXG5cdFx0dktleTogc3RyaW5nLFxuXHRcdHZhbHVlaGVscFBheWxvYWQ6IFZhbHVlSGVscFBheWxvYWRcblx0KSB7XG5cdFx0Y29uc3QgZmlsdGVycyA9IFtdO1xuXHRcdGNvbnN0IHBhcmFtZXRlcnMgPSB2YWx1ZUxpc3QuUGFyYW1ldGVycy5maWx0ZXIoZnVuY3Rpb24gKHBhcmFtZXRlcikge1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0cGFyYW1ldGVyLiRUeXBlID09PSBDb21tb25Bbm5vdGF0aW9uVHlwZXMuVmFsdWVMaXN0UGFyYW1ldGVySW4gfHxcblx0XHRcdFx0cGFyYW1ldGVyLiRUeXBlID09PSBDb21tb25Bbm5vdGF0aW9uVHlwZXMuVmFsdWVMaXN0UGFyYW1ldGVySW5PdXQgfHxcblx0XHRcdFx0KHBhcmFtZXRlci5Mb2NhbERhdGFQcm9wZXJ0eT8uJFByb3BlcnR5UGF0aCA9PT0gcHJvcGVydHlOYW1lICYmIHBhcmFtZXRlci5WYWx1ZUxpc3RQcm9wZXJ0eSA9PT0gdmFsdWVIZWxwUHJvcGVydHkpXG5cdFx0XHQpO1xuXHRcdH0pO1xuXHRcdGZvciAoY29uc3QgcGFyYW1ldGVyIG9mIHBhcmFtZXRlcnMpIHtcblx0XHRcdGlmIChwYXJhbWV0ZXIuTG9jYWxEYXRhUHJvcGVydHk/LiRQcm9wZXJ0eVBhdGggPT09IHByb3BlcnR5TmFtZSkge1xuXHRcdFx0XHRmaWx0ZXJzLnB1c2gobmV3IEZpbHRlcih7IHBhdGg6IHZhbHVlSGVscFByb3BlcnR5LCBvcGVyYXRvcjogXCJFUVwiLCB2YWx1ZTE6IHZLZXkgfSkpO1xuXHRcdFx0fSBlbHNlIGlmIChcblx0XHRcdFx0KHBhcmFtZXRlci4kVHlwZSA9PT0gQ29tbW9uQW5ub3RhdGlvblR5cGVzLlZhbHVlTGlzdFBhcmFtZXRlckluIHx8XG5cdFx0XHRcdFx0cGFyYW1ldGVyLiRUeXBlID09PSBDb21tb25Bbm5vdGF0aW9uVHlwZXMuVmFsdWVMaXN0UGFyYW1ldGVySW5PdXQpICYmXG5cdFx0XHRcdHZhbHVlaGVscFBheWxvYWQ/LmlzQWN0aW9uUGFyYW1ldGVyRGlhbG9nXG5cdFx0XHQpIHtcblx0XHRcdFx0Y29uc3QgYXBkRmllbGRQYXRoID0gYEFQRF86OiR7cGFyYW1ldGVyLkxvY2FsRGF0YVByb3BlcnR5Py4kUHJvcGVydHlQYXRofWA7XG5cdFx0XHRcdGNvbnN0IGFwZEZpZWxkID0gc2FwLnVpLmdldENvcmUoKS5ieUlkKGFwZEZpZWxkUGF0aCkgYXMgRmllbGQ7XG5cdFx0XHRcdGNvbnN0IGFwZEZpZWxkVmFsdWUgPSBhcGRGaWVsZD8uZ2V0VmFsdWUoKTtcblx0XHRcdFx0aWYgKGFwZEZpZWxkVmFsdWUgIT09IG51bGwpIHtcblx0XHRcdFx0XHRmaWx0ZXJzLnB1c2gobmV3IEZpbHRlcih7IHBhdGg6IHBhcmFtZXRlci5WYWx1ZUxpc3RQcm9wZXJ0eSwgb3BlcmF0b3I6IFwiRVFcIiwgdmFsdWUxOiBhcGRGaWVsZFZhbHVlIH0pKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gZmlsdGVycztcblx0fSxcblx0Z2V0SXRlbUZvclZhbHVlOiBmdW5jdGlvbiAocGF5bG9hZDogRmllbGRQYXlsb2FkLCBmaWVsZEhlbHA6IEZpZWxkSGVscEJhc2UsIGNvbmZpZzogQ29uZmlnKSB7XG5cdFx0Ly9CQ1A6IDIyNzAxNjI4ODcgLiBUaGUgTURDIGZpZWxkIHNob3VsZCBub3QgdHJ5IHRvIGdldCB0aGUgaXRlbSB3aGVuIHRoZSBmaWVsZCBpcyBlbXB0aWVkXG5cdFx0aWYgKGNvbmZpZy52YWx1ZSAhPT0gXCJcIikge1xuXHRcdFx0cmV0dXJuIEZpZWxkQmFzZURlbGVnYXRlLmdldEl0ZW1Gb3JWYWx1ZShwYXlsb2FkLCBmaWVsZEhlbHAsIGNvbmZpZyk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fSxcblxuXHQvKipcblx0ICogRGV0ZXJtaW5lcyB0aGUgZGVzY3JpcHRpb24gZm9yIGEgZ2l2ZW4ga2V5LlxuXHQgKlxuXHQgKiBAcGFyYW0gcGF5bG9hZCBQYXlsb2FkIGZvciBkZWxlZ2F0ZVxuXHQgKiBAcGFyYW0gdmFsdWVIZWxwIEZpZWxkIGhlbHAgYXNzaWduZWQgdG8gdGhlIDxjb2RlPkZpZWxkPC9jb2RlPiBvciA8Y29kZT5GaWx0ZXJGaWVsZDwvY29kZT4gY29udHJvbFxuXHQgKiBAcGFyYW0ga2V5IEtleSB2YWx1ZSBvZiB0aGUgZGVzY3JpcHRpb25cblx0ICogQHBhcmFtIF9jb25kaXRpb25JbiBJbiBwYXJhbWV0ZXJzIGZvciB0aGUga2V5IChubyBsb25nZXIgc3VwcG9ydGVkKVxuXHQgKiBAcGFyYW0gX2NvbmRpdGlvbk91dCBPdXQgcGFyYW1ldGVycyBmb3IgdGhlIGtleSAobm8gbG9uZ2VyIHN1cHBvcnRlZClcblx0ICogQHBhcmFtIGJpbmRpbmdDb250ZXh0IEJpbmRpbmdDb250ZXh0IDxjb2RlPkJpbmRpbmdDb250ZXh0PC9jb2RlPiBvZiB0aGUgY2hlY2tlZCBmaWVsZC4gSW5zaWRlIGEgdGFibGUsIHRoZSA8Y29kZT5GaWVsZEhlbHA8L2NvZGU+IGVsZW1lbnQgY2FuIGJlIGNvbm5lY3RlZCB0byBhIGRpZmZlcmVudCByb3dcblx0ICogQHBhcmFtIF9Db25kaXRpb25Nb2RlbCBDb25kaXRpb25Nb2RlbDwvY29kZT4sIGlmIGJvdW5kIHRvIG9uZVxuXHQgKiBAcGFyYW0gX2NvbmRpdGlvbk1vZGVsTmFtZSBOYW1lIG9mIHRoZSA8Y29kZT5Db25kaXRpb25Nb2RlbDwvY29kZT4sIGlmIGJvdW5kIHRvIG9uZVxuXHQgKiBAcGFyYW0gX2NvbmRpdGlvblBheWxvYWQgQWRkaXRpb25hbCBjb250ZXh0IGluZm9ybWF0aW9uIGZvciB0aGlzIGtleVxuXHQgKiBAcGFyYW0gY29udHJvbCBJbnN0YW5jZSBvZiB0aGUgY2FsbGluZyBjb250cm9sXG5cdCAqIEBwYXJhbSBfdHlwZSBUeXBlIG9mIHRoZSB2YWx1ZVxuXHQgKiBAcmV0dXJucyBEZXNjcmlwdGlvbiBmb3IgdGhlIGtleSBvciBvYmplY3QgY29udGFpbmluZyBhIGRlc2NyaXB0aW9uLCBrZXkgYW5kIHBheWxvYWQuIElmIHRoZSBkZXNjcmlwdGlvbiBpcyBub3QgYXZhaWxhYmxlIHJpZ2h0IGF3YXkgKGl0IG11c3QgYmUgcmVxdWVzdGVkKSwgYSA8Y29kZT5Qcm9taXNlPC9jb2RlPiBpcyByZXR1cm5lZFxuXHQgKi9cblx0Z2V0RGVzY3JpcHRpb246IGFzeW5jIGZ1bmN0aW9uIChcblx0XHRwYXlsb2FkOiBGaWVsZFBheWxvYWQgfCB1bmRlZmluZWQsXG5cdFx0dmFsdWVIZWxwOiBWYWx1ZUhlbHAsXG5cdFx0a2V5OiBzdHJpbmcsXG5cdFx0X2NvbmRpdGlvbkluOiBvYmplY3QsXG5cdFx0X2NvbmRpdGlvbk91dDogb2JqZWN0LFxuXHRcdGJpbmRpbmdDb250ZXh0OiBDb250ZXh0LFxuXHRcdF9Db25kaXRpb25Nb2RlbDogQ29uZGl0aW9uTW9kZWwsXG5cdFx0X2NvbmRpdGlvbk1vZGVsTmFtZTogc3RyaW5nLFxuXHRcdF9jb25kaXRpb25QYXlsb2FkOiBvYmplY3QsXG5cdFx0Y29udHJvbDogQ29udHJvbCxcblx0XHRfdHlwZTogdW5rbm93blxuXHQpIHtcblx0XHQvL0pJUkE6IEZJT1JJVEVDSFAxLTIyMDIyIC4gVGhlIE1EQyBmaWVsZCBzaG91bGQgbm90ICB0cmllcyB0byBkZXRlcm1pbmUgZGVzY3JpcHRpb24gd2l0aCB0aGUgaW5pdGlhbCBHRVQgb2YgdGhlIGRhdGEuXG5cdFx0Ly8gaXQgc2hvdWxkIHJlbHkgb24gdGhlIGRhdGEgd2UgYWxyZWFkeSByZWNlaXZlZCBmcm9tIHRoZSBiYWNrZW5kXG5cdFx0Ly8gQnV0IFRoZSBnZXREZXNjcmlwdGlvbiBmdW5jdGlvbiBpcyBhbHNvIGNhbGxlZCBpbiB0aGUgRmlsdGVyRmllbGQgY2FzZSBpZiBhIHZhcmlhbnQgaXMgbG9hZGVkLlxuXHRcdC8vIEFzIHRoZSBkZXNjcmlwdGlvbiB0ZXh0IGNvdWxkIGJlIGxhbmd1YWdlIGRlcGVuZGVudCBpdCBpcyBub3Qgc3RvcmVkIGluIHRoZSB2YXJpYW50LCBzbyBpdCBuZWVkcyB0byBiZSByZWFkIG9uIHJlbmRlcmluZy5cblxuXHRcdC8qIFJldHJpZXZlIHRleHQgZnJvbSB2YWx1ZSBoZWxwLCBpZiB2YWx1ZSB3YXMgc2V0IGJ5IG91dC1wYXJhbWV0ZXIgKEJDUCAyMjcwMTYwNjMzKSAqL1xuXHRcdGlmICghcGF5bG9hZCAmJiAoY29udHJvbCBhcyBGaWVsZEJhc2UpPy5nZXREaXNwbGF5KCkuaW5jbHVkZXMoXCJEZXNjcmlwdGlvblwiKSkge1xuXHRcdFx0cGF5bG9hZCA9IHtcblx0XHRcdFx0cmV0cmlldmVUZXh0RnJvbVZhbHVlTGlzdDogdHJ1ZVxuXHRcdFx0fTtcblx0XHR9XG5cblx0XHRpZiAocGF5bG9hZD8ucmV0cmlldmVUZXh0RnJvbVZhbHVlTGlzdCA9PT0gdHJ1ZSB8fCBwYXlsb2FkPy5pc0ZpbHRlckZpZWxkID09PSB0cnVlKSB7XG5cdFx0XHRjb25zdCBkYXRhTW9kZWwgPSB2YWx1ZUhlbHAuZ2V0TW9kZWwoKSBhcyBPRGF0YU1vZGVsIHwgdW5kZWZpbmVkO1xuXHRcdFx0Y29uc3QgbWV0YU1vZGVsID0gZGF0YU1vZGVsXG5cdFx0XHRcdD8gZGF0YU1vZGVsLmdldE1ldGFNb2RlbCgpXG5cdFx0XHRcdDogKENvbW1vblV0aWxzLmdldEFwcENvbXBvbmVudCh2YWx1ZUhlbHAgYXMgdW5rbm93biBhcyBDb250cm9sKVxuXHRcdFx0XHRcdFx0LmdldE1vZGVsKClcblx0XHRcdFx0XHRcdC5nZXRNZXRhTW9kZWwoKSBhcyBPRGF0YU1ldGFNb2RlbCk7XG5cdFx0XHRjb25zdCB2YWx1ZWhlbHBQYXlsb2FkID0gdmFsdWVIZWxwLmdldFBheWxvYWQoKSBhcyBWYWx1ZUhlbHBQYXlsb2FkO1xuXHRcdFx0Y29uc3QgcHJvcGVydHlQYXRoOiBzdHJpbmcgPSB2YWx1ZWhlbHBQYXlsb2FkPy5wcm9wZXJ0eVBhdGg7XG5cdFx0XHRsZXQgdGV4dFByb3BlcnR5OiBzdHJpbmc7XG5cblx0XHRcdHRyeSB7XG5cdFx0XHRcdC8qIFJlcXVlc3QgdmFsdWUgaGVscCBtZXRhZGF0YSAqL1xuXHRcdFx0XHRjb25zdCB2YWx1ZUxpc3RJbmZvID0gKGF3YWl0IG1ldGFNb2RlbC5yZXF1ZXN0VmFsdWVMaXN0SW5mbyhcblx0XHRcdFx0XHRwcm9wZXJ0eVBhdGgsXG5cdFx0XHRcdFx0dHJ1ZSxcblx0XHRcdFx0XHRiaW5kaW5nQ29udGV4dFxuXHRcdFx0XHQpKSBhcyBBbm5vdGF0aW9uVmFsdWVMaXN0VHlwZUJ5UXVhbGlmaWVyO1xuXG5cdFx0XHRcdGNvbnN0IHByb3BlcnR5TmFtZSA9IG1ldGFNb2RlbC5nZXRPYmplY3QoYCR7cHJvcGVydHlQYXRofUBzYXB1aS5uYW1lYCkgYXMgc3RyaW5nO1xuXHRcdFx0XHQvLyB0YWtlIHRoZSBmaXJzdCB2YWx1ZSBsaXN0IGFubm90YXRpb24gLSBhbHRlcm5hdGl2ZWx5IHRha2UgdGhlIG9uZSB3aXRob3V0IHF1YWxpZmllciBvciB0aGUgZmlyc3Qgb25lXG5cdFx0XHRcdGNvbnN0IHZhbHVlTGlzdCA9IHZhbHVlTGlzdEluZm9bT2JqZWN0LmtleXModmFsdWVMaXN0SW5mbylbMF1dO1xuXHRcdFx0XHRjb25zdCB2YWx1ZUhlbHBQYXJhbWV0ZXJzID0gdGhpcy5fZ2V0VmFsdWVMaXN0UGFyYW1ldGVyKHZhbHVlTGlzdCwgcHJvcGVydHlOYW1lKTtcblx0XHRcdFx0Y29uc3QgdmFsdWVIZWxwUHJvcGVydHkgPSB2YWx1ZUhlbHBQYXJhbWV0ZXJzPy5bMF0/LlZhbHVlTGlzdFByb3BlcnR5O1xuXHRcdFx0XHRpZiAoIXZhbHVlSGVscFByb3BlcnR5KSB7XG5cdFx0XHRcdFx0dGhyb3cgRXJyb3IoYEluY29uc2lzdGVudCB2YWx1ZSBoZWxwIGFubm90YXRpb24gZm9yICR7cHJvcGVydHlOYW1lfWApO1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIGdldCB0ZXh0IGFubm90YXRpb24gZm9yIHRoaXMgdmFsdWUgbGlzdCBwcm9wZXJ0eVxuXHRcdFx0XHRjb25zdCB2YWx1ZUxpc3RNb2RlbCA9IHZhbHVlTGlzdC4kbW9kZWw7XG5cdFx0XHRcdGNvbnN0IHRleHRBbm5vdGF0aW9uID0gdmFsdWVMaXN0TW9kZWxcblx0XHRcdFx0XHQuZ2V0TWV0YU1vZGVsKClcblx0XHRcdFx0XHQuZ2V0T2JqZWN0KGAvJHt2YWx1ZUxpc3QuQ29sbGVjdGlvblBhdGh9LyR7dmFsdWVIZWxwUHJvcGVydHl9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5UZXh0YCk7XG5cdFx0XHRcdGlmICh0ZXh0QW5ub3RhdGlvbiAmJiB0ZXh0QW5ub3RhdGlvbi4kUGF0aCkge1xuXHRcdFx0XHRcdHRleHRQcm9wZXJ0eSA9IHRleHRBbm5vdGF0aW9uLiRQYXRoO1xuXHRcdFx0XHRcdC8qIEJ1aWxkIHRoZSBmaWx0ZXIgZm9yIGVhY2ggaW4tcGFyYW1ldGVyICovXG5cdFx0XHRcdFx0Y29uc3QgZmlsdGVycyA9IHRoaXMuX2dldEZpbHRlcih2YWx1ZUxpc3QsIHByb3BlcnR5TmFtZSwgdmFsdWVIZWxwUHJvcGVydHksIGtleSwgdmFsdWVoZWxwUGF5bG9hZCk7XG5cdFx0XHRcdFx0Y29uc3QgbGlzdEJpbmRpbmcgPSB2YWx1ZUxpc3RNb2RlbC5iaW5kTGlzdChgLyR7dmFsdWVMaXN0LkNvbGxlY3Rpb25QYXRofWAsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBmaWx0ZXJzLCB7XG5cdFx0XHRcdFx0XHQkc2VsZWN0OiB0ZXh0UHJvcGVydHlcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHQvKiBSZXF1ZXN0IGRlc2NyaXB0aW9uIGZvciBnaXZlbiBrZXkgZnJvbSB2YWx1ZSBsaXN0IGVudGl0eSAqL1xuXHRcdFx0XHRcdGNvbnN0IGNvbnRleHRzID0gYXdhaXQgbGlzdEJpbmRpbmcucmVxdWVzdENvbnRleHRzKDAsIDIpO1xuXHRcdFx0XHRcdHJldHVybiBjb250ZXh0cy5sZW5ndGggPyBjb250ZXh0c1swXS5nZXRPYmplY3QodGV4dFByb3BlcnR5KSA6IHVuZGVmaW5lZDtcblxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGNvbnN0IG1lc3NhZ2UgPSBgVGV4dCBBbm5vdGF0aW9uIGZvciAke3ZhbHVlSGVscFByb3BlcnR5fSBpcyBub3QgZGVmaW5lZGA7XG5cdFx0XHRcdFx0TG9nLmVycm9yKG1lc3NhZ2UpO1xuXHRcdFx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0XHRcdH1cblxuXHRcdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdFx0Y29uc3Qgc3RhdHVzID0gZXJyb3IgPyAoZXJyb3IgYXMgWE1MSHR0cFJlcXVlc3QpLnN0YXR1cyA6IHVuZGVmaW5lZDtcblx0XHRcdFx0Y29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcblx0XHRcdFx0Y29uc3QgbXNnID0gc3RhdHVzID09PSA0MDQgPyBgTWV0YWRhdGEgbm90IGZvdW5kICgke3N0YXR1c30pIGZvciB2YWx1ZSBoZWxwIG9mIHByb3BlcnR5ICR7cHJvcGVydHlQYXRofWAgOiBtZXNzYWdlO1xuXHRcdFx0XHRMb2cuZXJyb3IobXNnKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxu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