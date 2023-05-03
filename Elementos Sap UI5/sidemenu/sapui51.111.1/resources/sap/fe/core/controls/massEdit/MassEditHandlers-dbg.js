/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/helpers/ModelHelper", "sap/fe/macros/internal/valuehelp/ValueListHelper", "sap/ui/core/Core"], function (Log, ModelHelper, ValueListHelper, Core) {
  "use strict";

  const MassEditHandlers = {
    /**
     * Called for property change in the transient context.
     *
     * @function
     * @param newValue New value of the property.
     * @param dataProperty Final context returned after the paginator action
     * @param mdcFieldId Final context returned after the paginator action
     */
    contextPropertyChange: function (newValue, dataProperty, mdcFieldId) {
      // Called for
      // 1. Out Parameters.
      // 2. Transient context property change.

      const source = Core.byId(mdcFieldId);
      const transCtx = source && source.getBindingContext();
      const fieldInfoModel = source && source.getModel("fieldsInfo");
      const values = fieldInfoModel.getProperty(`/values/${dataProperty}`) || fieldInfoModel.getProperty(`/unitData/${dataProperty}`) || [];
      if (transCtx && (values.inputType === "InputWithValueHelp" || values.inputType === "InputWithUnit") && !values.valueListInfo) {
        MassEditHandlers._setValueListInfo(transCtx, source, fieldInfoModel, dataProperty);
      }
      const isDialogOpen = fieldInfoModel && fieldInfoModel.getProperty("/isOpen");
      if (!isDialogOpen || !source.getVisible()) {
        return;
      }
      MassEditHandlers._updateSelectKey(source, dataProperty, newValue);
    },
    /**
     * Called for change in the MDC field.
     * This is called on selection done through VHD.
     * This is not called on change of the dropdown as we are using a custom MassEditSelect control and not general Select.
     *
     * @function
     * @param event Event object for change.
     * @param propertyName Property path.
     */
    handleMDCFieldChange: function (event, propertyName) {
      // Called for
      // 1. VHD property change.

      const source = event && event.getSource();
      const changePromise = event && event.getParameter("promise");
      const comboBox = source.getContent();
      if (!comboBox || !propertyName) {
        return;
      }
      changePromise.then(MassEditHandlers._updateSelectKeyForMDCFieldChange.bind(MassEditHandlers, source, propertyName)).catch(err => {
        Log.warning(`VHD selection couldn't be populated in the mass edit field.${err}`);
      });
    },
    /**
     * Called for selection change through the drop down.
     *
     * @function
     * @param event Event object for change.
     */
    handleSelectionChange: function (event) {
      // Called for Manual selection from dropdown(comboBox or select)
      // 1. VHD select.
      // 2. Any value change in the control.

      const source = event && event.getSource();
      const key = source.getSelectedKey();
      const params = source && key && key.split("/");
      let propertyName;
      if (params[0] === "UseValueHelpValue") {
        const prevItem = event.getParameter("previousSelectedItem");
        const selectKey = prevItem.getKey();
        propertyName = params.slice(1).join("/");
        MassEditHandlers._onVHSelect(source, propertyName, selectKey);
        return;
      }
      const fieldInfoModel = source && source.getModel("fieldsInfo");
      propertyName = MassEditHandlers._getPropertyNameFromKey(key);
      MassEditHandlers._updateSuggestionForFieldsWithInParameters(fieldInfoModel, propertyName, key.startsWith("Default/") || key.startsWith("ClearFieldValue/"), true);
      MassEditHandlers._updateSuggestionForFieldsWithOutParameters(fieldInfoModel, propertyName, key.startsWith("Default/") || key.startsWith("ClearFieldValue/"), false);
      MassEditHandlers._updateResults(source, params, true);
    },
    /**
     * Update selections to results and the suggests in drop downs.
     *
     * @function
     * @param source MDC field that was changed.
     * @param propertyName Property path.
     * @param value New value.
     */
    _updateSelectKeyForMDCFieldChange: function (source, propertyName, value) {
      const transCtx = source && source.getBindingContext();
      const fieldInfoModel = source && source.getModel("fieldsInfo");
      const values = fieldInfoModel.getProperty(`/values/${propertyName}`) || fieldInfoModel.getProperty(`/unitData/${propertyName}`) || [];
      if (transCtx && (values.inputType === "InputWithValueHelp" || values.inputType === "InputWithUnit") && !values.valueListInfo) {
        MassEditHandlers._setValueListInfo(transCtx, source, fieldInfoModel, propertyName);
      }
      MassEditHandlers._updateSuggestionForFieldsWithOutParameters(fieldInfoModel, propertyName, false, true);
      MassEditHandlers._updateSuggestionForFieldsWithInParameters(fieldInfoModel, propertyName, false, true);
      const formattedValue = source.getFormFormattedValue();
      MassEditHandlers._updateSelectKey(source, propertyName, value, formattedValue);
    },
    /**
     * Update suggests for all drop downs with InParameter as the propertyName.
     *
     * @function
     * @param fieldInfoModel Runtime model with parameters store information.
     * @param propertyName Property path.
     * @param resetValues Should the values be reset to original state.
     * @param keepExistingSelection Should the existing selection before update remain.
     */
    _updateSuggestionForFieldsWithInParameters: function (fieldInfoModel, propertyName, resetValues, keepExistingSelection) {
      const values = fieldInfoModel.getProperty("/values");
      const unitData = fieldInfoModel.getProperty("/unitData");
      const fieldPaths = Object.keys(values);
      const unitFieldPaths = Object.keys(unitData);
      fieldPaths.forEach(MassEditHandlers._updateInParameterSuggetions.bind(MassEditHandlers, fieldInfoModel, "/values/", propertyName, resetValues, keepExistingSelection));
      unitFieldPaths.forEach(MassEditHandlers._updateInParameterSuggetions.bind(MassEditHandlers, fieldInfoModel, "/unitData/", propertyName, resetValues, keepExistingSelection));
    },
    /**
     * Update suggests for a drop down with InParameter as the srcPropertyName.
     *
     * @function
     * @param fieldInfoModel Runtime model with parameters store information.
     * @param pathPrefix Path in the runtime model.
     * @param srcPropertyName The InParameter Property path.
     * @param resetValues Should the values be reset to original state.
     * @param keepExistingSelection Should the existing selection before update remain.
     * @param propertyName Property path that needs update of suggestions.
     */
    _updateInParameterSuggetions: function (fieldInfoModel, pathPrefix, srcPropertyName, resetValues, keepExistingSelection, propertyName) {
      const valueListInfo = fieldInfoModel.getProperty(`${pathPrefix + propertyName}/valueListInfo`);
      if (valueListInfo && srcPropertyName != propertyName) {
        const inParameters = valueListInfo.inParameters;
        if (inParameters && inParameters.length > 0 && inParameters.includes(srcPropertyName)) {
          MassEditHandlers._updateFieldPathSuggestions(fieldInfoModel, pathPrefix + propertyName, resetValues, keepExistingSelection);
        }
      }
    },
    /**
     * Update suggests for all OutParameter's drop downs of the propertyName.
     *
     * @function
     * @param fieldInfoModel Runtime model with parameters store information.
     * @param propertyName Property path.
     * @param resetValues Should the values be reset to original state.
     * @param keepExistingSelection Should the existing selection before update remain.
     */
    _updateSuggestionForFieldsWithOutParameters: function (fieldInfoModel, propertyName, resetValues, keepExistingSelection) {
      const valueListInfo = fieldInfoModel.getProperty(`/values/${propertyName}/valueListInfo`) || fieldInfoModel.getProperty(`/unitData/${propertyName}/valueListInfo`);
      if (valueListInfo && valueListInfo.outParameters) {
        const outParameters = valueListInfo.outParameters;
        if (outParameters.length && outParameters.length > 0) {
          MassEditHandlers._updateOutParameterSuggetions(outParameters, fieldInfoModel, resetValues, keepExistingSelection);
          const pathPrefix = fieldInfoModel.getProperty(`/values/${propertyName}`) && `/values/${propertyName}` || fieldInfoModel.getProperty(`/unitData/${propertyName}`) && `/unitData/${propertyName}`;
          if (pathPrefix) {
            MassEditHandlers._updateFieldPathSuggestions(fieldInfoModel, pathPrefix, false, true);
          }
        }
      }
    },
    /**
     * Update suggests for a drop down with InParameter as the srcPropertyName.
     *
     * @function
     * @param outParameters String arrary of OutParameter property paths.
     * @param fieldInfoModel Runtime model with parameters store information.
     * @param resetValues Should the values be reset to original state.
     * @param keepExistingSelection Should the existing selection before update remain.
     */
    _updateOutParameterSuggetions: function (outParameters, fieldInfoModel, resetValues, keepExistingSelection) {
      const values = fieldInfoModel.getProperty("/values");
      const unitData = fieldInfoModel.getProperty("/unitData");
      const fieldPaths = Object.keys(values);
      const unitFieldPaths = Object.keys(unitData);
      outParameters.forEach(outParameter => {
        if (fieldPaths.includes(outParameter)) {
          MassEditHandlers._updateFieldPathSuggestions(fieldInfoModel, `/values/${outParameter}`, resetValues, keepExistingSelection);
        } else if (unitFieldPaths.includes(outParameter)) {
          MassEditHandlers._updateFieldPathSuggestions(fieldInfoModel, `/unitData/${outParameter}`, resetValues, keepExistingSelection);
        }
      });
    },
    /**
     * Update suggests for a drop down of a field.
     *
     * @function
     * @param fieldInfoModel Runtime model with parameters store information.
     * @param fieldPathAbsolute Complete runtime property path.
     * @param resetValues Should the values be reset to original state.
     * @param keepExistingSelection Should the existing selection before update remain.
     */
    _updateFieldPathSuggestions: function (fieldInfoModel, fieldPathAbsolute, resetValues, keepExistingSelection) {
      const options = fieldInfoModel.getProperty(fieldPathAbsolute);
      const defaultOptions = options.defaultOptions;
      const selectedKey = fieldInfoModel.getProperty(`${fieldPathAbsolute}/selectedKey`);
      const existingSelection = keepExistingSelection && options.find(option => option.key === selectedKey);
      if (resetValues) {
        const selectOptions = options.selectOptions;
        options.length = 0;
        defaultOptions.forEach(defaultOption => options.push(defaultOption));
        selectOptions.forEach(selectOption => options.push(selectOption));
      } else {
        options.length = 0;
        defaultOptions.forEach(defaultOption => options.push(defaultOption));
      }
      fieldInfoModel.setProperty(fieldPathAbsolute, options);
      if (existingSelection && !options.includes(existingSelection)) {
        options.push(existingSelection);
        fieldInfoModel.setProperty(`${fieldPathAbsolute}/selectedKey`, selectedKey);
      }
    },
    /**
     * Update In and Out Parameters in the MED.
     *
     * @function
     * @param transCtx The transient context of the MED.
     * @param source MDC field.
     * @param fieldInfoModel Runtime model with parameters store information.
     * @param propertyName Property path.
     */
    _setValueListInfo: function (transCtx, source, fieldInfoModel, propertyName) {
      const propPath = fieldInfoModel.getProperty(`/values/${propertyName}`) && "/values/" || fieldInfoModel.getProperty(`/unitData/${propertyName}`) && "/unitData/";
      if (fieldInfoModel.getProperty(`${propPath}${propertyName}/valueListInfo`)) {
        return;
      }
      const valueListInfo = fieldInfoModel.getProperty(`${propPath}${propertyName}/valueListInfo`);
      if (!valueListInfo) {
        MassEditHandlers._requestValueList(transCtx, source, fieldInfoModel, propertyName);
      }
    },
    /**
     * Request and update In and Out Parameters in the MED.
     *
     * @function
     * @param transCtx The transient context of the MED.
     * @param source MDC field.
     * @param fieldInfoModel Runtime model with parameters store information.
     * @param propertyName Property path.
     */
    _requestValueList: function (transCtx, source, fieldInfoModel, propertyName) {
      var _fieldValueHelp$getDe;
      const metaPath = ModelHelper.getMetaPathForContext(transCtx);
      const propertyPath = metaPath && `${metaPath}/${propertyName}`;
      const dependents = source === null || source === void 0 ? void 0 : source.getDependents();
      const fieldHelp = source === null || source === void 0 ? void 0 : source.getFieldHelp();
      const fieldValueHelp = dependents === null || dependents === void 0 ? void 0 : dependents.find(dependent => dependent.getId() === fieldHelp);
      const payload = (_fieldValueHelp$getDe = fieldValueHelp.getDelegate()) === null || _fieldValueHelp$getDe === void 0 ? void 0 : _fieldValueHelp$getDe.payload;
      if (!(fieldValueHelp !== null && fieldValueHelp !== void 0 && fieldValueHelp.getBindingContext())) {
        fieldValueHelp === null || fieldValueHelp === void 0 ? void 0 : fieldValueHelp.setBindingContext(transCtx);
      }
      const metaModel = transCtx.getModel().getMetaModel();
      ValueListHelper.createVHUIModel(fieldValueHelp, propertyPath, metaModel);
      const valueListInfo = ValueListHelper.getValueListInfo(fieldValueHelp, propertyPath, payload);
      valueListInfo.then(vLinfos => {
        const vLinfo = vLinfos[0];
        const propPath = fieldInfoModel.getProperty(`/values/${propertyName}`) && "/values/" || fieldInfoModel.getProperty(`/unitData/${propertyName}`) && "/unitData/";
        const info = {
          inParameters: vLinfo.vhParameters && ValueListHelper.getInParameters(vLinfo.vhParameters).map(inParam => inParam.helpPath),
          outParameters: vLinfo.vhParameters && ValueListHelper.getOutParameters(vLinfo.vhParameters).map(outParam => outParam.helpPath)
        };
        fieldInfoModel.setProperty(`${propPath}${propertyName}/valueListInfo`, info);
        if (info.outParameters.length > 0) {
          MassEditHandlers._updateFieldPathSuggestions(fieldInfoModel, `/values/${propertyName}`, false, true);
        }
      }).catch(() => {
        Log.warning(`Mass Edit: Couldn't load valueList info for ${propertyPath}`);
      });
    },
    /**
     * Get field help control from MDC field.
     *
     * @function
     * @param transCtx The transient context of the MED.
     * @param source MDC field.
     * @returns Field Help control.
     */
    _getValueHelp: function (transCtx, source) {
      const dependents = source === null || source === void 0 ? void 0 : source.getDependents();
      const fieldHelp = source === null || source === void 0 ? void 0 : source.getFieldHelp();
      return dependents === null || dependents === void 0 ? void 0 : dependents.find(dependent => dependent.getId() === fieldHelp);
    },
    /**
     * Colled on drop down selection of VHD option.
     *
     * @function
     * @param source Custom Mass Edit Select control.
     * @param propertyName Property path.
     * @param selectKey Previous key before the VHD was selected.
     */
    _onVHSelect: function (source, propertyName, selectKey) {
      // Called for
      // 1. VHD selected.

      const fieldInfoModel = source && source.getModel("fieldsInfo");
      const propPath = fieldInfoModel.getProperty(`/values/${propertyName}`) && "/values/" || fieldInfoModel.getProperty(`/unitData/${propertyName}`) && "/unitData/";
      const transCtx = source.getBindingContext();
      const fieldValueHelp = MassEditHandlers._getValueHelp(transCtx, source.getParent());
      if (!(fieldValueHelp !== null && fieldValueHelp !== void 0 && fieldValueHelp.getBindingContext())) {
        fieldValueHelp === null || fieldValueHelp === void 0 ? void 0 : fieldValueHelp.setBindingContext(transCtx);
      }
      source.fireValueHelpRequest();
      fieldInfoModel.setProperty(`${propPath + propertyName}/selectedKey`, selectKey);
    },
    /**
     * Gets Property name from selection key.
     *
     * @function
     * @param key Selection key.
     * @returns Property name.
     */
    _getPropertyNameFromKey: function (key) {
      let propertyName = "";
      if (key.startsWith("Default/") || key.startsWith("ClearFieldValue/") || key.startsWith("UseValueHelpValue/")) {
        propertyName = key.substring(key.indexOf("/") + 1);
      } else {
        propertyName = key.substring(0, key.lastIndexOf("/"));
      }
      return propertyName;
    },
    /**
     * Update selection to Custom Mass Edit Select from MDC field.
     *
     * @function
     * @param source MDC field.
     * @param propertyName Property path.
     * @param value Value to update.
     * @param fullText Full text to use.
     */
    _updateSelectKey: function (source, propertyName, value, fullText) {
      // Called for
      // 1. VHD property change
      // 2. Out Parameters.
      // 3. Transient context property change.

      const comboBox = source.getContent();
      if (!comboBox || !propertyName) {
        return;
      }
      let key = comboBox.getSelectedKey();
      if ((key.startsWith("Default/") || key.startsWith("ClearFieldValue/")) && !value) {
        return;
      }
      const formattedText = MassEditHandlers._valueExists(fullText) ? fullText : value;
      const fieldInfoModel = source && source.getModel("fieldsInfo");
      const values = fieldInfoModel.getProperty(`/values/${propertyName}`) || fieldInfoModel.getProperty(`/unitData/${propertyName}`) || [];
      const propPath = fieldInfoModel.getProperty(`/values/${propertyName}`) && "/values/" || fieldInfoModel.getProperty(`/unitData/${propertyName}`) && "/unitData/";
      const relatedField = values.find(fieldData => {
        var _fieldData$textInfo;
        return (fieldData === null || fieldData === void 0 ? void 0 : (_fieldData$textInfo = fieldData.textInfo) === null || _fieldData$textInfo === void 0 ? void 0 : _fieldData$textInfo.value) === value || fieldData.text === value;
      });
      if (relatedField) {
        if (fullText && relatedField.textInfo && relatedField.textInfo.descriptionPath && (relatedField.text != formattedText || relatedField.textInfo.fullText != formattedText)) {
          // Update the full text only when provided.
          relatedField.text = formattedText;
          relatedField.textInfo.fullText = formattedText;
          relatedField.textInfo.description = source.getAdditionalValue();
        }
        if (relatedField.key === key) {
          fieldInfoModel.setProperty(`${propPath + propertyName}/selectedKey`, key);
          return;
        }
        key = relatedField.key;
      } else if ([undefined, null, ""].indexOf(value) === -1) {
        key = `${propertyName}/${value}`;
        const selectionInfo = {
          text: formattedText,
          key,
          textInfo: {
            description: source.getAdditionalValue(),
            descriptionPath: values && values.textInfo && values.textInfo.descriptionPath,
            fullText: formattedText,
            textArrangement: source.getDisplay(),
            value: source.getValue(),
            valuePath: propertyName
          }
        };
        values.push(selectionInfo);
        values.selectOptions = values.selectOptions || [];
        values.selectOptions.push(selectionInfo);
        fieldInfoModel.setProperty(propPath + propertyName, values);
      } else {
        key = `Default/${propertyName}`;
      }
      fieldInfoModel.setProperty(`${propPath + propertyName}/selectedKey`, key);
      MassEditHandlers._updateResults(comboBox);
    },
    /**
     * Get Value from Drop down.
     *
     * @function
     * @param source Drop down control.
     * @returns Value of selection.
     */
    _getValue: function (source) {
      var _getSelectedItem;
      return source.getMetadata().getName() === "sap.fe.core.controls.MassEditSelect" ? (_getSelectedItem = source.getSelectedItem()) === null || _getSelectedItem === void 0 ? void 0 : _getSelectedItem.getText() : source.getValue();
    },
    _getValueOnEmpty: function (oSource, fieldsInfoModel, value, sPropertyName) {
      if (!value) {
        const values = fieldsInfoModel.getProperty(`/values/${sPropertyName}`) || fieldsInfoModel.getProperty(`/unitData/${sPropertyName}`) || [];
        if (values.unitProperty) {
          value = 0;
          oSource.setValue(value);
        } else if (values.inputType === "CheckBox") {
          value = false;
        }
      }
      return value;
    },
    _valueExists: function (value) {
      return value != undefined && value != null;
    },
    /**
     * Updates selections to runtime model.
     *
     * @function
     * @param oSource Drop down control.
     * @param aParams Parts of key in runtime model.
     * @param updateTransCtx Should transient context be updated with the value.
     */
    _updateResults: function (oSource) {
      let aParams = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      let updateTransCtx = arguments.length > 2 ? arguments[2] : undefined;
      // Called for
      // 1. VHD property change.
      // 2. Out parameter.
      // 3. transient context property change.
      const fieldsInfoModel = oSource && oSource.getModel("fieldsInfo");
      const oFieldsInfoData = fieldsInfoModel && fieldsInfoModel.getData();
      let value = MassEditHandlers._getValue(oSource);
      aParams = aParams.length > 0 ? aParams : oSource && oSource.getSelectedKey() && oSource.getSelectedKey().split("/");
      let oDataObject;
      const sPropertyName = oSource.data("fieldPath");
      if (aParams[0] === "Default") {
        oDataObject = {
          keyValue: aParams[1],
          value: aParams[0]
        };
      } else if (aParams[0] === "ClearFieldValue") {
        value = "";
        value = MassEditHandlers._getValueOnEmpty(oSource, fieldsInfoModel, value, sPropertyName);
        oDataObject = {
          keyValue: aParams[1],
          value: value
        };
      } else if (!aParams) {
        value = MassEditHandlers._getValueOnEmpty(oSource, fieldsInfoModel, value, sPropertyName);
        oDataObject = {
          keyValue: sPropertyName,
          value: value
        };
      } else {
        const propertyName = aParams.slice(0, -1).join("/");
        const propertyValues = fieldsInfoModel.getProperty(`/values/${propertyName}`) || fieldsInfoModel.getProperty(`/unitData/${propertyName}`) || [];
        const relatedField = (propertyValues || []).find(function (oFieldData) {
          var _oFieldData$textInfo;
          return (oFieldData === null || oFieldData === void 0 ? void 0 : (_oFieldData$textInfo = oFieldData.textInfo) === null || _oFieldData$textInfo === void 0 ? void 0 : _oFieldData$textInfo.value) === value || oFieldData.text === value;
        });
        oDataObject = {
          keyValue: propertyName,
          value: relatedField.textInfo && MassEditHandlers._valueExists(relatedField.textInfo.value) ? relatedField.textInfo.value : relatedField.text
        };
      }
      let bExistingElementindex = -1;
      for (let i = 0; i < oFieldsInfoData.results.length; i++) {
        if (oFieldsInfoData.results[i].keyValue === oDataObject.keyValue) {
          bExistingElementindex = i;
        }
      }
      if (bExistingElementindex !== -1) {
        oFieldsInfoData.results[bExistingElementindex] = oDataObject;
      } else {
        oFieldsInfoData.results.push(oDataObject);
      }
      if (updateTransCtx && !oDataObject.keyValue.includes("/")) {
        const transCtx = oSource.getBindingContext();
        if (aParams[0] === "Default" || aParams[0] === "ClearFieldValue") {
          transCtx.setProperty(oDataObject.keyValue, null);
        } else if (oDataObject) {
          transCtx.setProperty(oDataObject.keyValue, oDataObject.value);
        }
      }
    }
  };
  return MassEditHandlers;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNYXNzRWRpdEhhbmRsZXJzIiwiY29udGV4dFByb3BlcnR5Q2hhbmdlIiwibmV3VmFsdWUiLCJkYXRhUHJvcGVydHkiLCJtZGNGaWVsZElkIiwic291cmNlIiwiQ29yZSIsImJ5SWQiLCJ0cmFuc0N0eCIsImdldEJpbmRpbmdDb250ZXh0IiwiZmllbGRJbmZvTW9kZWwiLCJnZXRNb2RlbCIsInZhbHVlcyIsImdldFByb3BlcnR5IiwiaW5wdXRUeXBlIiwidmFsdWVMaXN0SW5mbyIsIl9zZXRWYWx1ZUxpc3RJbmZvIiwiaXNEaWFsb2dPcGVuIiwiZ2V0VmlzaWJsZSIsIl91cGRhdGVTZWxlY3RLZXkiLCJoYW5kbGVNRENGaWVsZENoYW5nZSIsImV2ZW50IiwicHJvcGVydHlOYW1lIiwiZ2V0U291cmNlIiwiY2hhbmdlUHJvbWlzZSIsImdldFBhcmFtZXRlciIsImNvbWJvQm94IiwiZ2V0Q29udGVudCIsInRoZW4iLCJfdXBkYXRlU2VsZWN0S2V5Rm9yTURDRmllbGRDaGFuZ2UiLCJiaW5kIiwiY2F0Y2giLCJlcnIiLCJMb2ciLCJ3YXJuaW5nIiwiaGFuZGxlU2VsZWN0aW9uQ2hhbmdlIiwia2V5IiwiZ2V0U2VsZWN0ZWRLZXkiLCJwYXJhbXMiLCJzcGxpdCIsInByZXZJdGVtIiwic2VsZWN0S2V5IiwiZ2V0S2V5Iiwic2xpY2UiLCJqb2luIiwiX29uVkhTZWxlY3QiLCJfZ2V0UHJvcGVydHlOYW1lRnJvbUtleSIsIl91cGRhdGVTdWdnZXN0aW9uRm9yRmllbGRzV2l0aEluUGFyYW1ldGVycyIsInN0YXJ0c1dpdGgiLCJfdXBkYXRlU3VnZ2VzdGlvbkZvckZpZWxkc1dpdGhPdXRQYXJhbWV0ZXJzIiwiX3VwZGF0ZVJlc3VsdHMiLCJ2YWx1ZSIsImZvcm1hdHRlZFZhbHVlIiwiZ2V0Rm9ybUZvcm1hdHRlZFZhbHVlIiwicmVzZXRWYWx1ZXMiLCJrZWVwRXhpc3RpbmdTZWxlY3Rpb24iLCJ1bml0RGF0YSIsImZpZWxkUGF0aHMiLCJPYmplY3QiLCJrZXlzIiwidW5pdEZpZWxkUGF0aHMiLCJmb3JFYWNoIiwiX3VwZGF0ZUluUGFyYW1ldGVyU3VnZ2V0aW9ucyIsInBhdGhQcmVmaXgiLCJzcmNQcm9wZXJ0eU5hbWUiLCJpblBhcmFtZXRlcnMiLCJsZW5ndGgiLCJpbmNsdWRlcyIsIl91cGRhdGVGaWVsZFBhdGhTdWdnZXN0aW9ucyIsIm91dFBhcmFtZXRlcnMiLCJfdXBkYXRlT3V0UGFyYW1ldGVyU3VnZ2V0aW9ucyIsIm91dFBhcmFtZXRlciIsImZpZWxkUGF0aEFic29sdXRlIiwib3B0aW9ucyIsImRlZmF1bHRPcHRpb25zIiwic2VsZWN0ZWRLZXkiLCJleGlzdGluZ1NlbGVjdGlvbiIsImZpbmQiLCJvcHRpb24iLCJzZWxlY3RPcHRpb25zIiwiZGVmYXVsdE9wdGlvbiIsInB1c2giLCJzZWxlY3RPcHRpb24iLCJzZXRQcm9wZXJ0eSIsInByb3BQYXRoIiwiX3JlcXVlc3RWYWx1ZUxpc3QiLCJtZXRhUGF0aCIsIk1vZGVsSGVscGVyIiwiZ2V0TWV0YVBhdGhGb3JDb250ZXh0IiwicHJvcGVydHlQYXRoIiwiZGVwZW5kZW50cyIsImdldERlcGVuZGVudHMiLCJmaWVsZEhlbHAiLCJnZXRGaWVsZEhlbHAiLCJmaWVsZFZhbHVlSGVscCIsImRlcGVuZGVudCIsImdldElkIiwicGF5bG9hZCIsImdldERlbGVnYXRlIiwic2V0QmluZGluZ0NvbnRleHQiLCJtZXRhTW9kZWwiLCJnZXRNZXRhTW9kZWwiLCJWYWx1ZUxpc3RIZWxwZXIiLCJjcmVhdGVWSFVJTW9kZWwiLCJnZXRWYWx1ZUxpc3RJbmZvIiwidkxpbmZvcyIsInZMaW5mbyIsImluZm8iLCJ2aFBhcmFtZXRlcnMiLCJnZXRJblBhcmFtZXRlcnMiLCJtYXAiLCJpblBhcmFtIiwiaGVscFBhdGgiLCJnZXRPdXRQYXJhbWV0ZXJzIiwib3V0UGFyYW0iLCJfZ2V0VmFsdWVIZWxwIiwiZ2V0UGFyZW50IiwiZmlyZVZhbHVlSGVscFJlcXVlc3QiLCJzdWJzdHJpbmciLCJpbmRleE9mIiwibGFzdEluZGV4T2YiLCJmdWxsVGV4dCIsImZvcm1hdHRlZFRleHQiLCJfdmFsdWVFeGlzdHMiLCJyZWxhdGVkRmllbGQiLCJmaWVsZERhdGEiLCJ0ZXh0SW5mbyIsInRleHQiLCJkZXNjcmlwdGlvblBhdGgiLCJkZXNjcmlwdGlvbiIsImdldEFkZGl0aW9uYWxWYWx1ZSIsInVuZGVmaW5lZCIsInNlbGVjdGlvbkluZm8iLCJ0ZXh0QXJyYW5nZW1lbnQiLCJnZXREaXNwbGF5IiwiZ2V0VmFsdWUiLCJ2YWx1ZVBhdGgiLCJfZ2V0VmFsdWUiLCJnZXRNZXRhZGF0YSIsImdldE5hbWUiLCJnZXRTZWxlY3RlZEl0ZW0iLCJnZXRUZXh0IiwiX2dldFZhbHVlT25FbXB0eSIsIm9Tb3VyY2UiLCJmaWVsZHNJbmZvTW9kZWwiLCJzUHJvcGVydHlOYW1lIiwidW5pdFByb3BlcnR5Iiwic2V0VmFsdWUiLCJhUGFyYW1zIiwidXBkYXRlVHJhbnNDdHgiLCJvRmllbGRzSW5mb0RhdGEiLCJnZXREYXRhIiwib0RhdGFPYmplY3QiLCJkYXRhIiwia2V5VmFsdWUiLCJwcm9wZXJ0eVZhbHVlcyIsIm9GaWVsZERhdGEiLCJiRXhpc3RpbmdFbGVtZW50aW5kZXgiLCJpIiwicmVzdWx0cyJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiTWFzc0VkaXRIYW5kbGVycy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvbnN0cnVjdG9yIGZvciBhIG5ldyBWaXN1YWwgRmlsdGVyIENvbnRhaW5lci5cbiAqIFVzZWQgZm9yIHZpc3VhbCBmaWx0ZXJzXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IFtzSWRdIElEIGZvciB0aGUgbmV3IGNvbnRyb2wsIGdlbmVyYXRlZCBhdXRvbWF0aWNhbGx5IGlmIG5vIElEIGlzIGdpdmVuXG4gKiBAZXh0ZW5kcyBzYXAudWkubWRjLmZpbHRlcmJhci5JRmlsdGVyQ29udGFpbmVyXG4gKiBAY2xhc3NcbiAqIEBwcml2YXRlXG4gKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbHMuZmlsdGVyYmFyLlZpc3VhbEZpbHRlckNvbnRhaW5lclxuICovXG5pbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBNb2RlbEhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Nb2RlbEhlbHBlclwiO1xuaW1wb3J0IHR5cGUgeyBWYWx1ZUhlbHBQYXlsb2FkLCBWYWx1ZUxpc3RJbmZvIH0gZnJvbSBcInNhcC9mZS9tYWNyb3MvaW50ZXJuYWwvdmFsdWVoZWxwL1ZhbHVlTGlzdEhlbHBlclwiO1xuaW1wb3J0IFZhbHVlTGlzdEhlbHBlciBmcm9tIFwic2FwL2ZlL21hY3Jvcy9pbnRlcm5hbC92YWx1ZWhlbHAvVmFsdWVMaXN0SGVscGVyXCI7XG5pbXBvcnQgdHlwZSBDb21ib0JveCBmcm9tIFwic2FwL20vQ29tYm9Cb3hcIjtcbmltcG9ydCB0eXBlIFNlbGVjdCBmcm9tIFwic2FwL20vU2VsZWN0XCI7XG5pbXBvcnQgdHlwZSBDb250cm9sIGZyb20gXCJzYXAvdWkvY29yZS9Db250cm9sXCI7XG5pbXBvcnQgQ29yZSBmcm9tIFwic2FwL3VpL2NvcmUvQ29yZVwiO1xuaW1wb3J0IHR5cGUgRmllbGQgZnJvbSBcInNhcC91aS9tZGMvRmllbGRcIjtcbmltcG9ydCB0eXBlIFZhbHVlSGVscCBmcm9tIFwic2FwL3VpL21kYy9WYWx1ZUhlbHBcIjtcbmltcG9ydCB0eXBlIEpTT05Nb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL2pzb24vSlNPTk1vZGVsXCI7XG5pbXBvcnQgdHlwZSBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvQ29udGV4dFwiO1xuXG5jb25zdCBNYXNzRWRpdEhhbmRsZXJzOiBhbnkgPSB7XG5cdC8qKlxuXHQgKiBDYWxsZWQgZm9yIHByb3BlcnR5IGNoYW5nZSBpbiB0aGUgdHJhbnNpZW50IGNvbnRleHQuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAcGFyYW0gbmV3VmFsdWUgTmV3IHZhbHVlIG9mIHRoZSBwcm9wZXJ0eS5cblx0ICogQHBhcmFtIGRhdGFQcm9wZXJ0eSBGaW5hbCBjb250ZXh0IHJldHVybmVkIGFmdGVyIHRoZSBwYWdpbmF0b3IgYWN0aW9uXG5cdCAqIEBwYXJhbSBtZGNGaWVsZElkIEZpbmFsIGNvbnRleHQgcmV0dXJuZWQgYWZ0ZXIgdGhlIHBhZ2luYXRvciBhY3Rpb25cblx0ICovXG5cdGNvbnRleHRQcm9wZXJ0eUNoYW5nZTogZnVuY3Rpb24gKG5ld1ZhbHVlOiBhbnksIGRhdGFQcm9wZXJ0eTogc3RyaW5nLCBtZGNGaWVsZElkOiBzdHJpbmcpIHtcblx0XHQvLyBDYWxsZWQgZm9yXG5cdFx0Ly8gMS4gT3V0IFBhcmFtZXRlcnMuXG5cdFx0Ly8gMi4gVHJhbnNpZW50IGNvbnRleHQgcHJvcGVydHkgY2hhbmdlLlxuXG5cdFx0Y29uc3Qgc291cmNlID0gQ29yZS5ieUlkKG1kY0ZpZWxkSWQpIGFzIEZpZWxkO1xuXHRcdGNvbnN0IHRyYW5zQ3R4ID0gc291cmNlICYmIChzb3VyY2UuZ2V0QmluZGluZ0NvbnRleHQoKSBhcyBDb250ZXh0KTtcblx0XHRjb25zdCBmaWVsZEluZm9Nb2RlbCA9IHNvdXJjZSAmJiAoc291cmNlLmdldE1vZGVsKFwiZmllbGRzSW5mb1wiKSBhcyBKU09OTW9kZWwpO1xuXHRcdGNvbnN0IHZhbHVlcyA9XG5cdFx0XHRmaWVsZEluZm9Nb2RlbC5nZXRQcm9wZXJ0eShgL3ZhbHVlcy8ke2RhdGFQcm9wZXJ0eX1gKSB8fCBmaWVsZEluZm9Nb2RlbC5nZXRQcm9wZXJ0eShgL3VuaXREYXRhLyR7ZGF0YVByb3BlcnR5fWApIHx8IFtdO1xuXG5cdFx0aWYgKHRyYW5zQ3R4ICYmICh2YWx1ZXMuaW5wdXRUeXBlID09PSBcIklucHV0V2l0aFZhbHVlSGVscFwiIHx8IHZhbHVlcy5pbnB1dFR5cGUgPT09IFwiSW5wdXRXaXRoVW5pdFwiKSAmJiAhdmFsdWVzLnZhbHVlTGlzdEluZm8pIHtcblx0XHRcdE1hc3NFZGl0SGFuZGxlcnMuX3NldFZhbHVlTGlzdEluZm8odHJhbnNDdHgsIHNvdXJjZSwgZmllbGRJbmZvTW9kZWwsIGRhdGFQcm9wZXJ0eSk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgaXNEaWFsb2dPcGVuID0gZmllbGRJbmZvTW9kZWwgJiYgZmllbGRJbmZvTW9kZWwuZ2V0UHJvcGVydHkoXCIvaXNPcGVuXCIpO1xuXHRcdGlmICghaXNEaWFsb2dPcGVuIHx8ICFzb3VyY2UuZ2V0VmlzaWJsZSgpKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0TWFzc0VkaXRIYW5kbGVycy5fdXBkYXRlU2VsZWN0S2V5KHNvdXJjZSwgZGF0YVByb3BlcnR5LCBuZXdWYWx1ZSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENhbGxlZCBmb3IgY2hhbmdlIGluIHRoZSBNREMgZmllbGQuXG5cdCAqIFRoaXMgaXMgY2FsbGVkIG9uIHNlbGVjdGlvbiBkb25lIHRocm91Z2ggVkhELlxuXHQgKiBUaGlzIGlzIG5vdCBjYWxsZWQgb24gY2hhbmdlIG9mIHRoZSBkcm9wZG93biBhcyB3ZSBhcmUgdXNpbmcgYSBjdXN0b20gTWFzc0VkaXRTZWxlY3QgY29udHJvbCBhbmQgbm90IGdlbmVyYWwgU2VsZWN0LlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQHBhcmFtIGV2ZW50IEV2ZW50IG9iamVjdCBmb3IgY2hhbmdlLlxuXHQgKiBAcGFyYW0gcHJvcGVydHlOYW1lIFByb3BlcnR5IHBhdGguXG5cdCAqL1xuXHRoYW5kbGVNRENGaWVsZENoYW5nZTogZnVuY3Rpb24gKGV2ZW50OiBhbnksIHByb3BlcnR5TmFtZTogc3RyaW5nKSB7XG5cdFx0Ly8gQ2FsbGVkIGZvclxuXHRcdC8vIDEuIFZIRCBwcm9wZXJ0eSBjaGFuZ2UuXG5cblx0XHRjb25zdCBzb3VyY2UgPSBldmVudCAmJiBldmVudC5nZXRTb3VyY2UoKTtcblx0XHRjb25zdCBjaGFuZ2VQcm9taXNlID0gZXZlbnQgJiYgZXZlbnQuZ2V0UGFyYW1ldGVyKFwicHJvbWlzZVwiKTtcblx0XHRjb25zdCBjb21ib0JveCA9IHNvdXJjZS5nZXRDb250ZW50KCk7XG5cdFx0aWYgKCFjb21ib0JveCB8fCAhcHJvcGVydHlOYW1lKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Y2hhbmdlUHJvbWlzZVxuXHRcdFx0LnRoZW4oTWFzc0VkaXRIYW5kbGVycy5fdXBkYXRlU2VsZWN0S2V5Rm9yTURDRmllbGRDaGFuZ2UuYmluZChNYXNzRWRpdEhhbmRsZXJzLCBzb3VyY2UsIHByb3BlcnR5TmFtZSkpXG5cdFx0XHQuY2F0Y2goKGVycjogYW55KSA9PiB7XG5cdFx0XHRcdExvZy53YXJuaW5nKGBWSEQgc2VsZWN0aW9uIGNvdWxkbid0IGJlIHBvcHVsYXRlZCBpbiB0aGUgbWFzcyBlZGl0IGZpZWxkLiR7ZXJyfWApO1xuXHRcdFx0fSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENhbGxlZCBmb3Igc2VsZWN0aW9uIGNoYW5nZSB0aHJvdWdoIHRoZSBkcm9wIGRvd24uXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAcGFyYW0gZXZlbnQgRXZlbnQgb2JqZWN0IGZvciBjaGFuZ2UuXG5cdCAqL1xuXHRoYW5kbGVTZWxlY3Rpb25DaGFuZ2U6IGZ1bmN0aW9uIChldmVudDogYW55KSB7XG5cdFx0Ly8gQ2FsbGVkIGZvciBNYW51YWwgc2VsZWN0aW9uIGZyb20gZHJvcGRvd24oY29tYm9Cb3ggb3Igc2VsZWN0KVxuXHRcdC8vIDEuIFZIRCBzZWxlY3QuXG5cdFx0Ly8gMi4gQW55IHZhbHVlIGNoYW5nZSBpbiB0aGUgY29udHJvbC5cblxuXHRcdGNvbnN0IHNvdXJjZSA9IGV2ZW50ICYmIGV2ZW50LmdldFNvdXJjZSgpO1xuXHRcdGNvbnN0IGtleSA9IHNvdXJjZS5nZXRTZWxlY3RlZEtleSgpIGFzIHN0cmluZztcblx0XHRjb25zdCBwYXJhbXMgPSBzb3VyY2UgJiYga2V5ICYmIGtleS5zcGxpdChcIi9cIik7XG5cdFx0bGV0IHByb3BlcnR5TmFtZTtcblxuXHRcdGlmIChwYXJhbXNbMF0gPT09IFwiVXNlVmFsdWVIZWxwVmFsdWVcIikge1xuXHRcdFx0Y29uc3QgcHJldkl0ZW0gPSBldmVudC5nZXRQYXJhbWV0ZXIoXCJwcmV2aW91c1NlbGVjdGVkSXRlbVwiKTtcblx0XHRcdGNvbnN0IHNlbGVjdEtleSA9IHByZXZJdGVtLmdldEtleSgpO1xuXHRcdFx0cHJvcGVydHlOYW1lID0gcGFyYW1zLnNsaWNlKDEpLmpvaW4oXCIvXCIpO1xuXHRcdFx0TWFzc0VkaXRIYW5kbGVycy5fb25WSFNlbGVjdChzb3VyY2UsIHByb3BlcnR5TmFtZSwgc2VsZWN0S2V5KTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRjb25zdCBmaWVsZEluZm9Nb2RlbCA9IHNvdXJjZSAmJiAoc291cmNlLmdldE1vZGVsKFwiZmllbGRzSW5mb1wiKSBhcyBKU09OTW9kZWwpO1xuXHRcdHByb3BlcnR5TmFtZSA9IE1hc3NFZGl0SGFuZGxlcnMuX2dldFByb3BlcnR5TmFtZUZyb21LZXkoa2V5KTtcblx0XHRNYXNzRWRpdEhhbmRsZXJzLl91cGRhdGVTdWdnZXN0aW9uRm9yRmllbGRzV2l0aEluUGFyYW1ldGVycyhcblx0XHRcdGZpZWxkSW5mb01vZGVsLFxuXHRcdFx0cHJvcGVydHlOYW1lLFxuXHRcdFx0a2V5LnN0YXJ0c1dpdGgoXCJEZWZhdWx0L1wiKSB8fCBrZXkuc3RhcnRzV2l0aChcIkNsZWFyRmllbGRWYWx1ZS9cIiksXG5cdFx0XHR0cnVlXG5cdFx0KTtcblx0XHRNYXNzRWRpdEhhbmRsZXJzLl91cGRhdGVTdWdnZXN0aW9uRm9yRmllbGRzV2l0aE91dFBhcmFtZXRlcnMoXG5cdFx0XHRmaWVsZEluZm9Nb2RlbCxcblx0XHRcdHByb3BlcnR5TmFtZSxcblx0XHRcdGtleS5zdGFydHNXaXRoKFwiRGVmYXVsdC9cIikgfHwga2V5LnN0YXJ0c1dpdGgoXCJDbGVhckZpZWxkVmFsdWUvXCIpLFxuXHRcdFx0ZmFsc2Vcblx0XHQpO1xuXHRcdE1hc3NFZGl0SGFuZGxlcnMuX3VwZGF0ZVJlc3VsdHMoc291cmNlLCBwYXJhbXMsIHRydWUpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBVcGRhdGUgc2VsZWN0aW9ucyB0byByZXN1bHRzIGFuZCB0aGUgc3VnZ2VzdHMgaW4gZHJvcCBkb3ducy5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBwYXJhbSBzb3VyY2UgTURDIGZpZWxkIHRoYXQgd2FzIGNoYW5nZWQuXG5cdCAqIEBwYXJhbSBwcm9wZXJ0eU5hbWUgUHJvcGVydHkgcGF0aC5cblx0ICogQHBhcmFtIHZhbHVlIE5ldyB2YWx1ZS5cblx0ICovXG5cdF91cGRhdGVTZWxlY3RLZXlGb3JNRENGaWVsZENoYW5nZTogZnVuY3Rpb24gKHNvdXJjZTogYW55LCBwcm9wZXJ0eU5hbWU6IHN0cmluZywgdmFsdWU6IGFueSk6IHZvaWQge1xuXHRcdGNvbnN0IHRyYW5zQ3R4ID0gc291cmNlICYmIHNvdXJjZS5nZXRCaW5kaW5nQ29udGV4dCgpO1xuXHRcdGNvbnN0IGZpZWxkSW5mb01vZGVsID0gc291cmNlICYmIChzb3VyY2UuZ2V0TW9kZWwoXCJmaWVsZHNJbmZvXCIpIGFzIEpTT05Nb2RlbCk7XG5cdFx0Y29uc3QgdmFsdWVzID1cblx0XHRcdGZpZWxkSW5mb01vZGVsLmdldFByb3BlcnR5KGAvdmFsdWVzLyR7cHJvcGVydHlOYW1lfWApIHx8IGZpZWxkSW5mb01vZGVsLmdldFByb3BlcnR5KGAvdW5pdERhdGEvJHtwcm9wZXJ0eU5hbWV9YCkgfHwgW107XG5cblx0XHRpZiAodHJhbnNDdHggJiYgKHZhbHVlcy5pbnB1dFR5cGUgPT09IFwiSW5wdXRXaXRoVmFsdWVIZWxwXCIgfHwgdmFsdWVzLmlucHV0VHlwZSA9PT0gXCJJbnB1dFdpdGhVbml0XCIpICYmICF2YWx1ZXMudmFsdWVMaXN0SW5mbykge1xuXHRcdFx0TWFzc0VkaXRIYW5kbGVycy5fc2V0VmFsdWVMaXN0SW5mbyh0cmFuc0N0eCwgc291cmNlLCBmaWVsZEluZm9Nb2RlbCwgcHJvcGVydHlOYW1lKTtcblx0XHR9XG5cblx0XHRNYXNzRWRpdEhhbmRsZXJzLl91cGRhdGVTdWdnZXN0aW9uRm9yRmllbGRzV2l0aE91dFBhcmFtZXRlcnMoZmllbGRJbmZvTW9kZWwsIHByb3BlcnR5TmFtZSwgZmFsc2UsIHRydWUpO1xuXHRcdE1hc3NFZGl0SGFuZGxlcnMuX3VwZGF0ZVN1Z2dlc3Rpb25Gb3JGaWVsZHNXaXRoSW5QYXJhbWV0ZXJzKGZpZWxkSW5mb01vZGVsLCBwcm9wZXJ0eU5hbWUsIGZhbHNlLCB0cnVlKTtcblxuXHRcdGNvbnN0IGZvcm1hdHRlZFZhbHVlID0gc291cmNlLmdldEZvcm1Gb3JtYXR0ZWRWYWx1ZSgpO1xuXHRcdE1hc3NFZGl0SGFuZGxlcnMuX3VwZGF0ZVNlbGVjdEtleShzb3VyY2UsIHByb3BlcnR5TmFtZSwgdmFsdWUsIGZvcm1hdHRlZFZhbHVlKTtcblx0fSxcblxuXHQvKipcblx0ICogVXBkYXRlIHN1Z2dlc3RzIGZvciBhbGwgZHJvcCBkb3ducyB3aXRoIEluUGFyYW1ldGVyIGFzIHRoZSBwcm9wZXJ0eU5hbWUuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAcGFyYW0gZmllbGRJbmZvTW9kZWwgUnVudGltZSBtb2RlbCB3aXRoIHBhcmFtZXRlcnMgc3RvcmUgaW5mb3JtYXRpb24uXG5cdCAqIEBwYXJhbSBwcm9wZXJ0eU5hbWUgUHJvcGVydHkgcGF0aC5cblx0ICogQHBhcmFtIHJlc2V0VmFsdWVzIFNob3VsZCB0aGUgdmFsdWVzIGJlIHJlc2V0IHRvIG9yaWdpbmFsIHN0YXRlLlxuXHQgKiBAcGFyYW0ga2VlcEV4aXN0aW5nU2VsZWN0aW9uIFNob3VsZCB0aGUgZXhpc3Rpbmcgc2VsZWN0aW9uIGJlZm9yZSB1cGRhdGUgcmVtYWluLlxuXHQgKi9cblx0X3VwZGF0ZVN1Z2dlc3Rpb25Gb3JGaWVsZHNXaXRoSW5QYXJhbWV0ZXJzOiBmdW5jdGlvbiAoXG5cdFx0ZmllbGRJbmZvTW9kZWw6IEpTT05Nb2RlbCxcblx0XHRwcm9wZXJ0eU5hbWU6IHN0cmluZyxcblx0XHRyZXNldFZhbHVlczogYm9vbGVhbixcblx0XHRrZWVwRXhpc3RpbmdTZWxlY3Rpb246IGJvb2xlYW5cblx0KTogdm9pZCB7XG5cdFx0Y29uc3QgdmFsdWVzID0gZmllbGRJbmZvTW9kZWwuZ2V0UHJvcGVydHkoXCIvdmFsdWVzXCIpO1xuXHRcdGNvbnN0IHVuaXREYXRhID0gZmllbGRJbmZvTW9kZWwuZ2V0UHJvcGVydHkoXCIvdW5pdERhdGFcIik7XG5cdFx0Y29uc3QgZmllbGRQYXRocyA9IE9iamVjdC5rZXlzKHZhbHVlcyk7XG5cdFx0Y29uc3QgdW5pdEZpZWxkUGF0aHMgPSBPYmplY3Qua2V5cyh1bml0RGF0YSk7XG5cblx0XHRmaWVsZFBhdGhzLmZvckVhY2goXG5cdFx0XHRNYXNzRWRpdEhhbmRsZXJzLl91cGRhdGVJblBhcmFtZXRlclN1Z2dldGlvbnMuYmluZChcblx0XHRcdFx0TWFzc0VkaXRIYW5kbGVycyxcblx0XHRcdFx0ZmllbGRJbmZvTW9kZWwsXG5cdFx0XHRcdFwiL3ZhbHVlcy9cIixcblx0XHRcdFx0cHJvcGVydHlOYW1lLFxuXHRcdFx0XHRyZXNldFZhbHVlcyxcblx0XHRcdFx0a2VlcEV4aXN0aW5nU2VsZWN0aW9uXG5cdFx0XHQpXG5cdFx0KTtcblx0XHR1bml0RmllbGRQYXRocy5mb3JFYWNoKFxuXHRcdFx0TWFzc0VkaXRIYW5kbGVycy5fdXBkYXRlSW5QYXJhbWV0ZXJTdWdnZXRpb25zLmJpbmQoXG5cdFx0XHRcdE1hc3NFZGl0SGFuZGxlcnMsXG5cdFx0XHRcdGZpZWxkSW5mb01vZGVsLFxuXHRcdFx0XHRcIi91bml0RGF0YS9cIixcblx0XHRcdFx0cHJvcGVydHlOYW1lLFxuXHRcdFx0XHRyZXNldFZhbHVlcyxcblx0XHRcdFx0a2VlcEV4aXN0aW5nU2VsZWN0aW9uXG5cdFx0XHQpXG5cdFx0KTtcblx0fSxcblxuXHQvKipcblx0ICogVXBkYXRlIHN1Z2dlc3RzIGZvciBhIGRyb3AgZG93biB3aXRoIEluUGFyYW1ldGVyIGFzIHRoZSBzcmNQcm9wZXJ0eU5hbWUuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAcGFyYW0gZmllbGRJbmZvTW9kZWwgUnVudGltZSBtb2RlbCB3aXRoIHBhcmFtZXRlcnMgc3RvcmUgaW5mb3JtYXRpb24uXG5cdCAqIEBwYXJhbSBwYXRoUHJlZml4IFBhdGggaW4gdGhlIHJ1bnRpbWUgbW9kZWwuXG5cdCAqIEBwYXJhbSBzcmNQcm9wZXJ0eU5hbWUgVGhlIEluUGFyYW1ldGVyIFByb3BlcnR5IHBhdGguXG5cdCAqIEBwYXJhbSByZXNldFZhbHVlcyBTaG91bGQgdGhlIHZhbHVlcyBiZSByZXNldCB0byBvcmlnaW5hbCBzdGF0ZS5cblx0ICogQHBhcmFtIGtlZXBFeGlzdGluZ1NlbGVjdGlvbiBTaG91bGQgdGhlIGV4aXN0aW5nIHNlbGVjdGlvbiBiZWZvcmUgdXBkYXRlIHJlbWFpbi5cblx0ICogQHBhcmFtIHByb3BlcnR5TmFtZSBQcm9wZXJ0eSBwYXRoIHRoYXQgbmVlZHMgdXBkYXRlIG9mIHN1Z2dlc3Rpb25zLlxuXHQgKi9cblx0X3VwZGF0ZUluUGFyYW1ldGVyU3VnZ2V0aW9uczogZnVuY3Rpb24gKFxuXHRcdGZpZWxkSW5mb01vZGVsOiBKU09OTW9kZWwsXG5cdFx0cGF0aFByZWZpeDogc3RyaW5nLFxuXHRcdHNyY1Byb3BlcnR5TmFtZTogc3RyaW5nLFxuXHRcdHJlc2V0VmFsdWVzOiBib29sZWFuLFxuXHRcdGtlZXBFeGlzdGluZ1NlbGVjdGlvbjogYm9vbGVhbixcblx0XHRwcm9wZXJ0eU5hbWU6IHN0cmluZ1xuXHQpIHtcblx0XHRjb25zdCB2YWx1ZUxpc3RJbmZvID0gZmllbGRJbmZvTW9kZWwuZ2V0UHJvcGVydHkoYCR7cGF0aFByZWZpeCArIHByb3BlcnR5TmFtZX0vdmFsdWVMaXN0SW5mb2ApO1xuXHRcdGlmICh2YWx1ZUxpc3RJbmZvICYmIHNyY1Byb3BlcnR5TmFtZSAhPSBwcm9wZXJ0eU5hbWUpIHtcblx0XHRcdGNvbnN0IGluUGFyYW1ldGVycyA9IHZhbHVlTGlzdEluZm8uaW5QYXJhbWV0ZXJzO1xuXHRcdFx0aWYgKGluUGFyYW1ldGVycyAmJiBpblBhcmFtZXRlcnMubGVuZ3RoID4gMCAmJiBpblBhcmFtZXRlcnMuaW5jbHVkZXMoc3JjUHJvcGVydHlOYW1lKSkge1xuXHRcdFx0XHRNYXNzRWRpdEhhbmRsZXJzLl91cGRhdGVGaWVsZFBhdGhTdWdnZXN0aW9ucyhmaWVsZEluZm9Nb2RlbCwgcGF0aFByZWZpeCArIHByb3BlcnR5TmFtZSwgcmVzZXRWYWx1ZXMsIGtlZXBFeGlzdGluZ1NlbGVjdGlvbik7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBVcGRhdGUgc3VnZ2VzdHMgZm9yIGFsbCBPdXRQYXJhbWV0ZXIncyBkcm9wIGRvd25zIG9mIHRoZSBwcm9wZXJ0eU5hbWUuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAcGFyYW0gZmllbGRJbmZvTW9kZWwgUnVudGltZSBtb2RlbCB3aXRoIHBhcmFtZXRlcnMgc3RvcmUgaW5mb3JtYXRpb24uXG5cdCAqIEBwYXJhbSBwcm9wZXJ0eU5hbWUgUHJvcGVydHkgcGF0aC5cblx0ICogQHBhcmFtIHJlc2V0VmFsdWVzIFNob3VsZCB0aGUgdmFsdWVzIGJlIHJlc2V0IHRvIG9yaWdpbmFsIHN0YXRlLlxuXHQgKiBAcGFyYW0ga2VlcEV4aXN0aW5nU2VsZWN0aW9uIFNob3VsZCB0aGUgZXhpc3Rpbmcgc2VsZWN0aW9uIGJlZm9yZSB1cGRhdGUgcmVtYWluLlxuXHQgKi9cblx0X3VwZGF0ZVN1Z2dlc3Rpb25Gb3JGaWVsZHNXaXRoT3V0UGFyYW1ldGVyczogZnVuY3Rpb24gKFxuXHRcdGZpZWxkSW5mb01vZGVsOiBKU09OTW9kZWwsXG5cdFx0cHJvcGVydHlOYW1lOiBzdHJpbmcsXG5cdFx0cmVzZXRWYWx1ZXM6IGJvb2xlYW4sXG5cdFx0a2VlcEV4aXN0aW5nU2VsZWN0aW9uOiBib29sZWFuXG5cdCk6IHZvaWQge1xuXHRcdGNvbnN0IHZhbHVlTGlzdEluZm8gPVxuXHRcdFx0ZmllbGRJbmZvTW9kZWwuZ2V0UHJvcGVydHkoYC92YWx1ZXMvJHtwcm9wZXJ0eU5hbWV9L3ZhbHVlTGlzdEluZm9gKSB8fFxuXHRcdFx0ZmllbGRJbmZvTW9kZWwuZ2V0UHJvcGVydHkoYC91bml0RGF0YS8ke3Byb3BlcnR5TmFtZX0vdmFsdWVMaXN0SW5mb2ApO1xuXG5cdFx0aWYgKHZhbHVlTGlzdEluZm8gJiYgdmFsdWVMaXN0SW5mby5vdXRQYXJhbWV0ZXJzKSB7XG5cdFx0XHRjb25zdCBvdXRQYXJhbWV0ZXJzID0gdmFsdWVMaXN0SW5mby5vdXRQYXJhbWV0ZXJzO1xuXHRcdFx0aWYgKG91dFBhcmFtZXRlcnMubGVuZ3RoICYmIG91dFBhcmFtZXRlcnMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRNYXNzRWRpdEhhbmRsZXJzLl91cGRhdGVPdXRQYXJhbWV0ZXJTdWdnZXRpb25zKG91dFBhcmFtZXRlcnMsIGZpZWxkSW5mb01vZGVsLCByZXNldFZhbHVlcywga2VlcEV4aXN0aW5nU2VsZWN0aW9uKTtcblx0XHRcdFx0Y29uc3QgcGF0aFByZWZpeCA9XG5cdFx0XHRcdFx0KGZpZWxkSW5mb01vZGVsLmdldFByb3BlcnR5KGAvdmFsdWVzLyR7cHJvcGVydHlOYW1lfWApICYmIGAvdmFsdWVzLyR7cHJvcGVydHlOYW1lfWApIHx8XG5cdFx0XHRcdFx0KGZpZWxkSW5mb01vZGVsLmdldFByb3BlcnR5KGAvdW5pdERhdGEvJHtwcm9wZXJ0eU5hbWV9YCkgJiYgYC91bml0RGF0YS8ke3Byb3BlcnR5TmFtZX1gKTtcblx0XHRcdFx0aWYgKHBhdGhQcmVmaXgpIHtcblx0XHRcdFx0XHRNYXNzRWRpdEhhbmRsZXJzLl91cGRhdGVGaWVsZFBhdGhTdWdnZXN0aW9ucyhmaWVsZEluZm9Nb2RlbCwgcGF0aFByZWZpeCwgZmFsc2UsIHRydWUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBVcGRhdGUgc3VnZ2VzdHMgZm9yIGEgZHJvcCBkb3duIHdpdGggSW5QYXJhbWV0ZXIgYXMgdGhlIHNyY1Byb3BlcnR5TmFtZS5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBwYXJhbSBvdXRQYXJhbWV0ZXJzIFN0cmluZyBhcnJhcnkgb2YgT3V0UGFyYW1ldGVyIHByb3BlcnR5IHBhdGhzLlxuXHQgKiBAcGFyYW0gZmllbGRJbmZvTW9kZWwgUnVudGltZSBtb2RlbCB3aXRoIHBhcmFtZXRlcnMgc3RvcmUgaW5mb3JtYXRpb24uXG5cdCAqIEBwYXJhbSByZXNldFZhbHVlcyBTaG91bGQgdGhlIHZhbHVlcyBiZSByZXNldCB0byBvcmlnaW5hbCBzdGF0ZS5cblx0ICogQHBhcmFtIGtlZXBFeGlzdGluZ1NlbGVjdGlvbiBTaG91bGQgdGhlIGV4aXN0aW5nIHNlbGVjdGlvbiBiZWZvcmUgdXBkYXRlIHJlbWFpbi5cblx0ICovXG5cdF91cGRhdGVPdXRQYXJhbWV0ZXJTdWdnZXRpb25zOiBmdW5jdGlvbiAoXG5cdFx0b3V0UGFyYW1ldGVyczogc3RyaW5nW10sXG5cdFx0ZmllbGRJbmZvTW9kZWw6IEpTT05Nb2RlbCxcblx0XHRyZXNldFZhbHVlczogYm9vbGVhbixcblx0XHRrZWVwRXhpc3RpbmdTZWxlY3Rpb246IGJvb2xlYW5cblx0KSB7XG5cdFx0Y29uc3QgdmFsdWVzID0gZmllbGRJbmZvTW9kZWwuZ2V0UHJvcGVydHkoXCIvdmFsdWVzXCIpO1xuXHRcdGNvbnN0IHVuaXREYXRhID0gZmllbGRJbmZvTW9kZWwuZ2V0UHJvcGVydHkoXCIvdW5pdERhdGFcIik7XG5cdFx0Y29uc3QgZmllbGRQYXRocyA9IE9iamVjdC5rZXlzKHZhbHVlcyk7XG5cdFx0Y29uc3QgdW5pdEZpZWxkUGF0aHMgPSBPYmplY3Qua2V5cyh1bml0RGF0YSk7XG5cblx0XHRvdXRQYXJhbWV0ZXJzLmZvckVhY2goKG91dFBhcmFtZXRlcjogc3RyaW5nKSA9PiB7XG5cdFx0XHRpZiAoZmllbGRQYXRocy5pbmNsdWRlcyhvdXRQYXJhbWV0ZXIpKSB7XG5cdFx0XHRcdE1hc3NFZGl0SGFuZGxlcnMuX3VwZGF0ZUZpZWxkUGF0aFN1Z2dlc3Rpb25zKGZpZWxkSW5mb01vZGVsLCBgL3ZhbHVlcy8ke291dFBhcmFtZXRlcn1gLCByZXNldFZhbHVlcywga2VlcEV4aXN0aW5nU2VsZWN0aW9uKTtcblx0XHRcdH0gZWxzZSBpZiAodW5pdEZpZWxkUGF0aHMuaW5jbHVkZXMob3V0UGFyYW1ldGVyKSkge1xuXHRcdFx0XHRNYXNzRWRpdEhhbmRsZXJzLl91cGRhdGVGaWVsZFBhdGhTdWdnZXN0aW9ucyhcblx0XHRcdFx0XHRmaWVsZEluZm9Nb2RlbCxcblx0XHRcdFx0XHRgL3VuaXREYXRhLyR7b3V0UGFyYW1ldGVyfWAsXG5cdFx0XHRcdFx0cmVzZXRWYWx1ZXMsXG5cdFx0XHRcdFx0a2VlcEV4aXN0aW5nU2VsZWN0aW9uXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFVwZGF0ZSBzdWdnZXN0cyBmb3IgYSBkcm9wIGRvd24gb2YgYSBmaWVsZC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBwYXJhbSBmaWVsZEluZm9Nb2RlbCBSdW50aW1lIG1vZGVsIHdpdGggcGFyYW1ldGVycyBzdG9yZSBpbmZvcm1hdGlvbi5cblx0ICogQHBhcmFtIGZpZWxkUGF0aEFic29sdXRlIENvbXBsZXRlIHJ1bnRpbWUgcHJvcGVydHkgcGF0aC5cblx0ICogQHBhcmFtIHJlc2V0VmFsdWVzIFNob3VsZCB0aGUgdmFsdWVzIGJlIHJlc2V0IHRvIG9yaWdpbmFsIHN0YXRlLlxuXHQgKiBAcGFyYW0ga2VlcEV4aXN0aW5nU2VsZWN0aW9uIFNob3VsZCB0aGUgZXhpc3Rpbmcgc2VsZWN0aW9uIGJlZm9yZSB1cGRhdGUgcmVtYWluLlxuXHQgKi9cblx0X3VwZGF0ZUZpZWxkUGF0aFN1Z2dlc3Rpb25zOiBmdW5jdGlvbiAoXG5cdFx0ZmllbGRJbmZvTW9kZWw6IEpTT05Nb2RlbCxcblx0XHRmaWVsZFBhdGhBYnNvbHV0ZTogc3RyaW5nLFxuXHRcdHJlc2V0VmFsdWVzOiBib29sZWFuLFxuXHRcdGtlZXBFeGlzdGluZ1NlbGVjdGlvbjogYm9vbGVhblxuXHQpIHtcblx0XHRjb25zdCBvcHRpb25zID0gZmllbGRJbmZvTW9kZWwuZ2V0UHJvcGVydHkoZmllbGRQYXRoQWJzb2x1dGUpO1xuXHRcdGNvbnN0IGRlZmF1bHRPcHRpb25zID0gb3B0aW9ucy5kZWZhdWx0T3B0aW9ucztcblx0XHRjb25zdCBzZWxlY3RlZEtleSA9IGZpZWxkSW5mb01vZGVsLmdldFByb3BlcnR5KGAke2ZpZWxkUGF0aEFic29sdXRlfS9zZWxlY3RlZEtleWApO1xuXHRcdGNvbnN0IGV4aXN0aW5nU2VsZWN0aW9uID0ga2VlcEV4aXN0aW5nU2VsZWN0aW9uICYmIG9wdGlvbnMuZmluZCgob3B0aW9uOiBhbnkpID0+IG9wdGlvbi5rZXkgPT09IHNlbGVjdGVkS2V5KTtcblx0XHRpZiAocmVzZXRWYWx1ZXMpIHtcblx0XHRcdGNvbnN0IHNlbGVjdE9wdGlvbnMgPSBvcHRpb25zLnNlbGVjdE9wdGlvbnM7XG5cdFx0XHRvcHRpb25zLmxlbmd0aCA9IDA7XG5cdFx0XHRkZWZhdWx0T3B0aW9ucy5mb3JFYWNoKChkZWZhdWx0T3B0aW9uOiBhbnkpID0+IG9wdGlvbnMucHVzaChkZWZhdWx0T3B0aW9uKSk7XG5cdFx0XHRzZWxlY3RPcHRpb25zLmZvckVhY2goKHNlbGVjdE9wdGlvbjogYW55KSA9PiBvcHRpb25zLnB1c2goc2VsZWN0T3B0aW9uKSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG9wdGlvbnMubGVuZ3RoID0gMDtcblx0XHRcdGRlZmF1bHRPcHRpb25zLmZvckVhY2goKGRlZmF1bHRPcHRpb246IGFueSkgPT4gb3B0aW9ucy5wdXNoKGRlZmF1bHRPcHRpb24pKTtcblx0XHR9XG5cblx0XHRmaWVsZEluZm9Nb2RlbC5zZXRQcm9wZXJ0eShmaWVsZFBhdGhBYnNvbHV0ZSwgb3B0aW9ucyk7XG5cblx0XHRpZiAoZXhpc3RpbmdTZWxlY3Rpb24gJiYgIW9wdGlvbnMuaW5jbHVkZXMoZXhpc3RpbmdTZWxlY3Rpb24pKSB7XG5cdFx0XHRvcHRpb25zLnB1c2goZXhpc3RpbmdTZWxlY3Rpb24pO1xuXHRcdFx0ZmllbGRJbmZvTW9kZWwuc2V0UHJvcGVydHkoYCR7ZmllbGRQYXRoQWJzb2x1dGV9L3NlbGVjdGVkS2V5YCwgc2VsZWN0ZWRLZXkpO1xuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogVXBkYXRlIEluIGFuZCBPdXQgUGFyYW1ldGVycyBpbiB0aGUgTUVELlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQHBhcmFtIHRyYW5zQ3R4IFRoZSB0cmFuc2llbnQgY29udGV4dCBvZiB0aGUgTUVELlxuXHQgKiBAcGFyYW0gc291cmNlIE1EQyBmaWVsZC5cblx0ICogQHBhcmFtIGZpZWxkSW5mb01vZGVsIFJ1bnRpbWUgbW9kZWwgd2l0aCBwYXJhbWV0ZXJzIHN0b3JlIGluZm9ybWF0aW9uLlxuXHQgKiBAcGFyYW0gcHJvcGVydHlOYW1lIFByb3BlcnR5IHBhdGguXG5cdCAqL1xuXHRfc2V0VmFsdWVMaXN0SW5mbzogZnVuY3Rpb24gKHRyYW5zQ3R4OiBDb250ZXh0LCBzb3VyY2U6IEZpZWxkLCBmaWVsZEluZm9Nb2RlbDogSlNPTk1vZGVsLCBwcm9wZXJ0eU5hbWU6IHN0cmluZyk6IHZvaWQge1xuXHRcdGNvbnN0IHByb3BQYXRoID1cblx0XHRcdChmaWVsZEluZm9Nb2RlbC5nZXRQcm9wZXJ0eShgL3ZhbHVlcy8ke3Byb3BlcnR5TmFtZX1gKSAmJiBcIi92YWx1ZXMvXCIpIHx8XG5cdFx0XHQoZmllbGRJbmZvTW9kZWwuZ2V0UHJvcGVydHkoYC91bml0RGF0YS8ke3Byb3BlcnR5TmFtZX1gKSAmJiBcIi91bml0RGF0YS9cIik7XG5cblx0XHRpZiAoZmllbGRJbmZvTW9kZWwuZ2V0UHJvcGVydHkoYCR7cHJvcFBhdGh9JHtwcm9wZXJ0eU5hbWV9L3ZhbHVlTGlzdEluZm9gKSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRjb25zdCB2YWx1ZUxpc3RJbmZvID0gZmllbGRJbmZvTW9kZWwuZ2V0UHJvcGVydHkoYCR7cHJvcFBhdGh9JHtwcm9wZXJ0eU5hbWV9L3ZhbHVlTGlzdEluZm9gKTtcblxuXHRcdGlmICghdmFsdWVMaXN0SW5mbykge1xuXHRcdFx0TWFzc0VkaXRIYW5kbGVycy5fcmVxdWVzdFZhbHVlTGlzdCh0cmFuc0N0eCwgc291cmNlLCBmaWVsZEluZm9Nb2RlbCwgcHJvcGVydHlOYW1lKTtcblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIFJlcXVlc3QgYW5kIHVwZGF0ZSBJbiBhbmQgT3V0IFBhcmFtZXRlcnMgaW4gdGhlIE1FRC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBwYXJhbSB0cmFuc0N0eCBUaGUgdHJhbnNpZW50IGNvbnRleHQgb2YgdGhlIE1FRC5cblx0ICogQHBhcmFtIHNvdXJjZSBNREMgZmllbGQuXG5cdCAqIEBwYXJhbSBmaWVsZEluZm9Nb2RlbCBSdW50aW1lIG1vZGVsIHdpdGggcGFyYW1ldGVycyBzdG9yZSBpbmZvcm1hdGlvbi5cblx0ICogQHBhcmFtIHByb3BlcnR5TmFtZSBQcm9wZXJ0eSBwYXRoLlxuXHQgKi9cblx0X3JlcXVlc3RWYWx1ZUxpc3Q6IGZ1bmN0aW9uICh0cmFuc0N0eDogQ29udGV4dCwgc291cmNlOiBGaWVsZCwgZmllbGRJbmZvTW9kZWw6IEpTT05Nb2RlbCwgcHJvcGVydHlOYW1lOiBzdHJpbmcpOiB2b2lkIHtcblx0XHRjb25zdCBtZXRhUGF0aCA9IE1vZGVsSGVscGVyLmdldE1ldGFQYXRoRm9yQ29udGV4dCh0cmFuc0N0eCk7XG5cdFx0Y29uc3QgcHJvcGVydHlQYXRoID0gKG1ldGFQYXRoICYmIGAke21ldGFQYXRofS8ke3Byb3BlcnR5TmFtZX1gKSBhcyBzdHJpbmc7XG5cdFx0Y29uc3QgZGVwZW5kZW50cyA9IHNvdXJjZT8uZ2V0RGVwZW5kZW50cygpO1xuXHRcdGNvbnN0IGZpZWxkSGVscCA9IHNvdXJjZT8uZ2V0RmllbGRIZWxwKCk7XG5cdFx0Y29uc3QgZmllbGRWYWx1ZUhlbHAgPSBkZXBlbmRlbnRzPy5maW5kKChkZXBlbmRlbnQ6IGFueSkgPT4gZGVwZW5kZW50LmdldElkKCkgPT09IGZpZWxkSGVscCkgYXMgVmFsdWVIZWxwO1xuXHRcdGNvbnN0IHBheWxvYWQgPSAoZmllbGRWYWx1ZUhlbHAuZ2V0RGVsZWdhdGUoKSBhcyBhbnkpPy5wYXlsb2FkIGFzIFZhbHVlSGVscFBheWxvYWQ7XG5cdFx0aWYgKCFmaWVsZFZhbHVlSGVscD8uZ2V0QmluZGluZ0NvbnRleHQoKSkge1xuXHRcdFx0ZmllbGRWYWx1ZUhlbHA/LnNldEJpbmRpbmdDb250ZXh0KHRyYW5zQ3R4KTtcblx0XHR9XG5cdFx0Y29uc3QgbWV0YU1vZGVsID0gdHJhbnNDdHguZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKTtcblx0XHRWYWx1ZUxpc3RIZWxwZXIuY3JlYXRlVkhVSU1vZGVsKGZpZWxkVmFsdWVIZWxwLCBwcm9wZXJ0eVBhdGgsIG1ldGFNb2RlbCk7XG5cdFx0Y29uc3QgdmFsdWVMaXN0SW5mbyA9IFZhbHVlTGlzdEhlbHBlci5nZXRWYWx1ZUxpc3RJbmZvKGZpZWxkVmFsdWVIZWxwLCBwcm9wZXJ0eVBhdGgsIHBheWxvYWQpO1xuXG5cdFx0dmFsdWVMaXN0SW5mb1xuXHRcdFx0LnRoZW4oKHZMaW5mb3M6IFZhbHVlTGlzdEluZm9bXSkgPT4ge1xuXHRcdFx0XHRjb25zdCB2TGluZm8gPSB2TGluZm9zWzBdO1xuXHRcdFx0XHRjb25zdCBwcm9wUGF0aCA9XG5cdFx0XHRcdFx0KGZpZWxkSW5mb01vZGVsLmdldFByb3BlcnR5KGAvdmFsdWVzLyR7cHJvcGVydHlOYW1lfWApICYmIFwiL3ZhbHVlcy9cIikgfHxcblx0XHRcdFx0XHQoZmllbGRJbmZvTW9kZWwuZ2V0UHJvcGVydHkoYC91bml0RGF0YS8ke3Byb3BlcnR5TmFtZX1gKSAmJiBcIi91bml0RGF0YS9cIik7XG5cdFx0XHRcdGNvbnN0IGluZm86IGFueSA9IHtcblx0XHRcdFx0XHRpblBhcmFtZXRlcnM6XG5cdFx0XHRcdFx0XHR2TGluZm8udmhQYXJhbWV0ZXJzICYmIFZhbHVlTGlzdEhlbHBlci5nZXRJblBhcmFtZXRlcnModkxpbmZvLnZoUGFyYW1ldGVycykubWFwKChpblBhcmFtOiBhbnkpID0+IGluUGFyYW0uaGVscFBhdGgpLFxuXHRcdFx0XHRcdG91dFBhcmFtZXRlcnM6XG5cdFx0XHRcdFx0XHR2TGluZm8udmhQYXJhbWV0ZXJzICYmXG5cdFx0XHRcdFx0XHRWYWx1ZUxpc3RIZWxwZXIuZ2V0T3V0UGFyYW1ldGVycyh2TGluZm8udmhQYXJhbWV0ZXJzKS5tYXAoKG91dFBhcmFtOiBhbnkpID0+IG91dFBhcmFtLmhlbHBQYXRoKVxuXHRcdFx0XHR9O1xuXHRcdFx0XHRmaWVsZEluZm9Nb2RlbC5zZXRQcm9wZXJ0eShgJHtwcm9wUGF0aH0ke3Byb3BlcnR5TmFtZX0vdmFsdWVMaXN0SW5mb2AsIGluZm8pO1xuXHRcdFx0XHRpZiAoaW5mby5vdXRQYXJhbWV0ZXJzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRNYXNzRWRpdEhhbmRsZXJzLl91cGRhdGVGaWVsZFBhdGhTdWdnZXN0aW9ucyhmaWVsZEluZm9Nb2RlbCwgYC92YWx1ZXMvJHtwcm9wZXJ0eU5hbWV9YCwgZmFsc2UsIHRydWUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKCgpID0+IHtcblx0XHRcdFx0TG9nLndhcm5pbmcoYE1hc3MgRWRpdDogQ291bGRuJ3QgbG9hZCB2YWx1ZUxpc3QgaW5mbyBmb3IgJHtwcm9wZXJ0eVBhdGh9YCk7XG5cdFx0XHR9KTtcblx0fSxcblxuXHQvKipcblx0ICogR2V0IGZpZWxkIGhlbHAgY29udHJvbCBmcm9tIE1EQyBmaWVsZC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBwYXJhbSB0cmFuc0N0eCBUaGUgdHJhbnNpZW50IGNvbnRleHQgb2YgdGhlIE1FRC5cblx0ICogQHBhcmFtIHNvdXJjZSBNREMgZmllbGQuXG5cdCAqIEByZXR1cm5zIEZpZWxkIEhlbHAgY29udHJvbC5cblx0ICovXG5cdF9nZXRWYWx1ZUhlbHA6IGZ1bmN0aW9uICh0cmFuc0N0eDogQ29udGV4dCwgc291cmNlOiBGaWVsZCk6IGFueSB7XG5cdFx0Y29uc3QgZGVwZW5kZW50cyA9IHNvdXJjZT8uZ2V0RGVwZW5kZW50cygpO1xuXHRcdGNvbnN0IGZpZWxkSGVscCA9IHNvdXJjZT8uZ2V0RmllbGRIZWxwKCk7XG5cdFx0cmV0dXJuIGRlcGVuZGVudHM/LmZpbmQoKGRlcGVuZGVudDogYW55KSA9PiBkZXBlbmRlbnQuZ2V0SWQoKSA9PT0gZmllbGRIZWxwKTtcblx0fSxcblxuXHQvKipcblx0ICogQ29sbGVkIG9uIGRyb3AgZG93biBzZWxlY3Rpb24gb2YgVkhEIG9wdGlvbi5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBwYXJhbSBzb3VyY2UgQ3VzdG9tIE1hc3MgRWRpdCBTZWxlY3QgY29udHJvbC5cblx0ICogQHBhcmFtIHByb3BlcnR5TmFtZSBQcm9wZXJ0eSBwYXRoLlxuXHQgKiBAcGFyYW0gc2VsZWN0S2V5IFByZXZpb3VzIGtleSBiZWZvcmUgdGhlIFZIRCB3YXMgc2VsZWN0ZWQuXG5cdCAqL1xuXHRfb25WSFNlbGVjdDogZnVuY3Rpb24gKHNvdXJjZTogYW55LCBwcm9wZXJ0eU5hbWU6IHN0cmluZywgc2VsZWN0S2V5OiBzdHJpbmcpOiB2b2lkIHtcblx0XHQvLyBDYWxsZWQgZm9yXG5cdFx0Ly8gMS4gVkhEIHNlbGVjdGVkLlxuXG5cdFx0Y29uc3QgZmllbGRJbmZvTW9kZWwgPSBzb3VyY2UgJiYgc291cmNlLmdldE1vZGVsKFwiZmllbGRzSW5mb1wiKTtcblx0XHRjb25zdCBwcm9wUGF0aCA9XG5cdFx0XHQoZmllbGRJbmZvTW9kZWwuZ2V0UHJvcGVydHkoYC92YWx1ZXMvJHtwcm9wZXJ0eU5hbWV9YCkgJiYgXCIvdmFsdWVzL1wiKSB8fFxuXHRcdFx0KGZpZWxkSW5mb01vZGVsLmdldFByb3BlcnR5KGAvdW5pdERhdGEvJHtwcm9wZXJ0eU5hbWV9YCkgJiYgXCIvdW5pdERhdGEvXCIpO1xuXHRcdGNvbnN0IHRyYW5zQ3R4ID0gc291cmNlLmdldEJpbmRpbmdDb250ZXh0KCk7XG5cdFx0Y29uc3QgZmllbGRWYWx1ZUhlbHAgPSBNYXNzRWRpdEhhbmRsZXJzLl9nZXRWYWx1ZUhlbHAodHJhbnNDdHgsIHNvdXJjZS5nZXRQYXJlbnQoKSk7XG5cdFx0aWYgKCFmaWVsZFZhbHVlSGVscD8uZ2V0QmluZGluZ0NvbnRleHQoKSkge1xuXHRcdFx0ZmllbGRWYWx1ZUhlbHA/LnNldEJpbmRpbmdDb250ZXh0KHRyYW5zQ3R4KTtcblx0XHR9XG5cdFx0c291cmNlLmZpcmVWYWx1ZUhlbHBSZXF1ZXN0KCk7XG5cblx0XHRmaWVsZEluZm9Nb2RlbC5zZXRQcm9wZXJ0eShgJHtwcm9wUGF0aCArIHByb3BlcnR5TmFtZX0vc2VsZWN0ZWRLZXlgLCBzZWxlY3RLZXkpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBHZXRzIFByb3BlcnR5IG5hbWUgZnJvbSBzZWxlY3Rpb24ga2V5LlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQHBhcmFtIGtleSBTZWxlY3Rpb24ga2V5LlxuXHQgKiBAcmV0dXJucyBQcm9wZXJ0eSBuYW1lLlxuXHQgKi9cblx0X2dldFByb3BlcnR5TmFtZUZyb21LZXk6IGZ1bmN0aW9uIChrZXk6IHN0cmluZykge1xuXHRcdGxldCBwcm9wZXJ0eU5hbWUgPSBcIlwiO1xuXHRcdGlmIChrZXkuc3RhcnRzV2l0aChcIkRlZmF1bHQvXCIpIHx8IGtleS5zdGFydHNXaXRoKFwiQ2xlYXJGaWVsZFZhbHVlL1wiKSB8fCBrZXkuc3RhcnRzV2l0aChcIlVzZVZhbHVlSGVscFZhbHVlL1wiKSkge1xuXHRcdFx0cHJvcGVydHlOYW1lID0ga2V5LnN1YnN0cmluZyhrZXkuaW5kZXhPZihcIi9cIikgKyAxKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cHJvcGVydHlOYW1lID0ga2V5LnN1YnN0cmluZygwLCBrZXkubGFzdEluZGV4T2YoXCIvXCIpKTtcblx0XHR9XG5cdFx0cmV0dXJuIHByb3BlcnR5TmFtZTtcblx0fSxcblxuXHQvKipcblx0ICogVXBkYXRlIHNlbGVjdGlvbiB0byBDdXN0b20gTWFzcyBFZGl0IFNlbGVjdCBmcm9tIE1EQyBmaWVsZC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBwYXJhbSBzb3VyY2UgTURDIGZpZWxkLlxuXHQgKiBAcGFyYW0gcHJvcGVydHlOYW1lIFByb3BlcnR5IHBhdGguXG5cdCAqIEBwYXJhbSB2YWx1ZSBWYWx1ZSB0byB1cGRhdGUuXG5cdCAqIEBwYXJhbSBmdWxsVGV4dCBGdWxsIHRleHQgdG8gdXNlLlxuXHQgKi9cblx0X3VwZGF0ZVNlbGVjdEtleTogZnVuY3Rpb24gKHNvdXJjZTogRmllbGQsIHByb3BlcnR5TmFtZTogc3RyaW5nLCB2YWx1ZTogYW55LCBmdWxsVGV4dD86IGFueSk6IHZvaWQge1xuXHRcdC8vIENhbGxlZCBmb3Jcblx0XHQvLyAxLiBWSEQgcHJvcGVydHkgY2hhbmdlXG5cdFx0Ly8gMi4gT3V0IFBhcmFtZXRlcnMuXG5cdFx0Ly8gMy4gVHJhbnNpZW50IGNvbnRleHQgcHJvcGVydHkgY2hhbmdlLlxuXG5cdFx0Y29uc3QgY29tYm9Cb3ggPSBzb3VyY2UuZ2V0Q29udGVudCgpIGFzIENvbWJvQm94O1xuXHRcdGlmICghY29tYm9Cb3ggfHwgIXByb3BlcnR5TmFtZSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRsZXQga2V5OiBzdHJpbmcgPSBjb21ib0JveC5nZXRTZWxlY3RlZEtleSgpO1xuXHRcdGlmICgoa2V5LnN0YXJ0c1dpdGgoXCJEZWZhdWx0L1wiKSB8fCBrZXkuc3RhcnRzV2l0aChcIkNsZWFyRmllbGRWYWx1ZS9cIikpICYmICF2YWx1ZSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGNvbnN0IGZvcm1hdHRlZFRleHQgPSBNYXNzRWRpdEhhbmRsZXJzLl92YWx1ZUV4aXN0cyhmdWxsVGV4dCkgPyBmdWxsVGV4dCA6IHZhbHVlO1xuXHRcdGNvbnN0IGZpZWxkSW5mb01vZGVsID0gc291cmNlICYmIChzb3VyY2UuZ2V0TW9kZWwoXCJmaWVsZHNJbmZvXCIpIGFzIEpTT05Nb2RlbCk7XG5cdFx0Y29uc3QgdmFsdWVzID1cblx0XHRcdGZpZWxkSW5mb01vZGVsLmdldFByb3BlcnR5KGAvdmFsdWVzLyR7cHJvcGVydHlOYW1lfWApIHx8IGZpZWxkSW5mb01vZGVsLmdldFByb3BlcnR5KGAvdW5pdERhdGEvJHtwcm9wZXJ0eU5hbWV9YCkgfHwgW107XG5cdFx0Y29uc3QgcHJvcFBhdGggPVxuXHRcdFx0KGZpZWxkSW5mb01vZGVsLmdldFByb3BlcnR5KGAvdmFsdWVzLyR7cHJvcGVydHlOYW1lfWApICYmIFwiL3ZhbHVlcy9cIikgfHxcblx0XHRcdChmaWVsZEluZm9Nb2RlbC5nZXRQcm9wZXJ0eShgL3VuaXREYXRhLyR7cHJvcGVydHlOYW1lfWApICYmIFwiL3VuaXREYXRhL1wiKTtcblxuXHRcdGNvbnN0IHJlbGF0ZWRGaWVsZCA9IHZhbHVlcy5maW5kKChmaWVsZERhdGE6IGFueSkgPT4gZmllbGREYXRhPy50ZXh0SW5mbz8udmFsdWUgPT09IHZhbHVlIHx8IGZpZWxkRGF0YS50ZXh0ID09PSB2YWx1ZSk7XG5cblx0XHRpZiAocmVsYXRlZEZpZWxkKSB7XG5cdFx0XHRpZiAoXG5cdFx0XHRcdGZ1bGxUZXh0ICYmXG5cdFx0XHRcdHJlbGF0ZWRGaWVsZC50ZXh0SW5mbyAmJlxuXHRcdFx0XHRyZWxhdGVkRmllbGQudGV4dEluZm8uZGVzY3JpcHRpb25QYXRoICYmXG5cdFx0XHRcdChyZWxhdGVkRmllbGQudGV4dCAhPSBmb3JtYXR0ZWRUZXh0IHx8IHJlbGF0ZWRGaWVsZC50ZXh0SW5mby5mdWxsVGV4dCAhPSBmb3JtYXR0ZWRUZXh0KVxuXHRcdFx0KSB7XG5cdFx0XHRcdC8vIFVwZGF0ZSB0aGUgZnVsbCB0ZXh0IG9ubHkgd2hlbiBwcm92aWRlZC5cblx0XHRcdFx0cmVsYXRlZEZpZWxkLnRleHQgPSBmb3JtYXR0ZWRUZXh0O1xuXHRcdFx0XHRyZWxhdGVkRmllbGQudGV4dEluZm8uZnVsbFRleHQgPSBmb3JtYXR0ZWRUZXh0O1xuXHRcdFx0XHRyZWxhdGVkRmllbGQudGV4dEluZm8uZGVzY3JpcHRpb24gPSBzb3VyY2UuZ2V0QWRkaXRpb25hbFZhbHVlKCk7XG5cdFx0XHR9XG5cdFx0XHRpZiAocmVsYXRlZEZpZWxkLmtleSA9PT0ga2V5KSB7XG5cdFx0XHRcdGZpZWxkSW5mb01vZGVsLnNldFByb3BlcnR5KGAke3Byb3BQYXRoICsgcHJvcGVydHlOYW1lfS9zZWxlY3RlZEtleWAsIGtleSk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdGtleSA9IHJlbGF0ZWRGaWVsZC5rZXk7XG5cdFx0fSBlbHNlIGlmIChbdW5kZWZpbmVkLCBudWxsLCBcIlwiXS5pbmRleE9mKHZhbHVlKSA9PT0gLTEpIHtcblx0XHRcdGtleSA9IGAke3Byb3BlcnR5TmFtZX0vJHt2YWx1ZX1gO1xuXHRcdFx0Y29uc3Qgc2VsZWN0aW9uSW5mbyA9IHtcblx0XHRcdFx0dGV4dDogZm9ybWF0dGVkVGV4dCxcblx0XHRcdFx0a2V5LFxuXHRcdFx0XHR0ZXh0SW5mbzoge1xuXHRcdFx0XHRcdGRlc2NyaXB0aW9uOiBzb3VyY2UuZ2V0QWRkaXRpb25hbFZhbHVlKCksXG5cdFx0XHRcdFx0ZGVzY3JpcHRpb25QYXRoOiB2YWx1ZXMgJiYgdmFsdWVzLnRleHRJbmZvICYmIHZhbHVlcy50ZXh0SW5mby5kZXNjcmlwdGlvblBhdGgsXG5cdFx0XHRcdFx0ZnVsbFRleHQ6IGZvcm1hdHRlZFRleHQsXG5cdFx0XHRcdFx0dGV4dEFycmFuZ2VtZW50OiBzb3VyY2UuZ2V0RGlzcGxheSgpLFxuXHRcdFx0XHRcdHZhbHVlOiBzb3VyY2UuZ2V0VmFsdWUoKSxcblx0XHRcdFx0XHR2YWx1ZVBhdGg6IHByb3BlcnR5TmFtZVxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdFx0dmFsdWVzLnB1c2goc2VsZWN0aW9uSW5mbyk7XG5cdFx0XHR2YWx1ZXMuc2VsZWN0T3B0aW9ucyA9IHZhbHVlcy5zZWxlY3RPcHRpb25zIHx8IFtdO1xuXHRcdFx0dmFsdWVzLnNlbGVjdE9wdGlvbnMucHVzaChzZWxlY3Rpb25JbmZvKTtcblx0XHRcdGZpZWxkSW5mb01vZGVsLnNldFByb3BlcnR5KHByb3BQYXRoICsgcHJvcGVydHlOYW1lLCB2YWx1ZXMpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRrZXkgPSBgRGVmYXVsdC8ke3Byb3BlcnR5TmFtZX1gO1xuXHRcdH1cblxuXHRcdGZpZWxkSW5mb01vZGVsLnNldFByb3BlcnR5KGAke3Byb3BQYXRoICsgcHJvcGVydHlOYW1lfS9zZWxlY3RlZEtleWAsIGtleSk7XG5cdFx0TWFzc0VkaXRIYW5kbGVycy5fdXBkYXRlUmVzdWx0cyhjb21ib0JveCk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEdldCBWYWx1ZSBmcm9tIERyb3AgZG93bi5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBwYXJhbSBzb3VyY2UgRHJvcCBkb3duIGNvbnRyb2wuXG5cdCAqIEByZXR1cm5zIFZhbHVlIG9mIHNlbGVjdGlvbi5cblx0ICovXG5cdF9nZXRWYWx1ZTogZnVuY3Rpb24gKHNvdXJjZTogQ29udHJvbCkge1xuXHRcdHJldHVybiBzb3VyY2UuZ2V0TWV0YWRhdGEoKS5nZXROYW1lKCkgPT09IFwic2FwLmZlLmNvcmUuY29udHJvbHMuTWFzc0VkaXRTZWxlY3RcIlxuXHRcdFx0PyAoc291cmNlIGFzIFNlbGVjdCkuZ2V0U2VsZWN0ZWRJdGVtKCk/LmdldFRleHQoKVxuXHRcdFx0OiAoc291cmNlIGFzIENvbWJvQm94KS5nZXRWYWx1ZSgpO1xuXHR9LFxuXG5cdF9nZXRWYWx1ZU9uRW1wdHk6IGZ1bmN0aW9uIChvU291cmNlOiBhbnksIGZpZWxkc0luZm9Nb2RlbDogSlNPTk1vZGVsLCB2YWx1ZTogYW55LCBzUHJvcGVydHlOYW1lOiBzdHJpbmcpIHtcblx0XHRpZiAoIXZhbHVlKSB7XG5cdFx0XHRjb25zdCB2YWx1ZXMgPVxuXHRcdFx0XHRmaWVsZHNJbmZvTW9kZWwuZ2V0UHJvcGVydHkoYC92YWx1ZXMvJHtzUHJvcGVydHlOYW1lfWApIHx8IGZpZWxkc0luZm9Nb2RlbC5nZXRQcm9wZXJ0eShgL3VuaXREYXRhLyR7c1Byb3BlcnR5TmFtZX1gKSB8fCBbXTtcblx0XHRcdGlmICh2YWx1ZXMudW5pdFByb3BlcnR5KSB7XG5cdFx0XHRcdHZhbHVlID0gMDtcblx0XHRcdFx0b1NvdXJjZS5zZXRWYWx1ZSh2YWx1ZSk7XG5cdFx0XHR9IGVsc2UgaWYgKHZhbHVlcy5pbnB1dFR5cGUgPT09IFwiQ2hlY2tCb3hcIikge1xuXHRcdFx0XHR2YWx1ZSA9IGZhbHNlO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gdmFsdWU7XG5cdH0sXG5cblx0X3ZhbHVlRXhpc3RzOiBmdW5jdGlvbiAodmFsdWU6IGFueSkge1xuXHRcdHJldHVybiB2YWx1ZSAhPSB1bmRlZmluZWQgJiYgdmFsdWUgIT0gbnVsbDtcblx0fSxcblxuXHQvKipcblx0ICogVXBkYXRlcyBzZWxlY3Rpb25zIHRvIHJ1bnRpbWUgbW9kZWwuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAcGFyYW0gb1NvdXJjZSBEcm9wIGRvd24gY29udHJvbC5cblx0ICogQHBhcmFtIGFQYXJhbXMgUGFydHMgb2Yga2V5IGluIHJ1bnRpbWUgbW9kZWwuXG5cdCAqIEBwYXJhbSB1cGRhdGVUcmFuc0N0eCBTaG91bGQgdHJhbnNpZW50IGNvbnRleHQgYmUgdXBkYXRlZCB3aXRoIHRoZSB2YWx1ZS5cblx0ICovXG5cdF91cGRhdGVSZXN1bHRzOiBmdW5jdGlvbiAob1NvdXJjZTogYW55LCBhUGFyYW1zOiBBcnJheTxzdHJpbmc+ID0gW10sIHVwZGF0ZVRyYW5zQ3R4OiBib29sZWFuKSB7XG5cdFx0Ly8gQ2FsbGVkIGZvclxuXHRcdC8vIDEuIFZIRCBwcm9wZXJ0eSBjaGFuZ2UuXG5cdFx0Ly8gMi4gT3V0IHBhcmFtZXRlci5cblx0XHQvLyAzLiB0cmFuc2llbnQgY29udGV4dCBwcm9wZXJ0eSBjaGFuZ2UuXG5cdFx0Y29uc3QgZmllbGRzSW5mb01vZGVsID0gb1NvdXJjZSAmJiBvU291cmNlLmdldE1vZGVsKFwiZmllbGRzSW5mb1wiKTtcblx0XHRjb25zdCBvRmllbGRzSW5mb0RhdGEgPSBmaWVsZHNJbmZvTW9kZWwgJiYgZmllbGRzSW5mb01vZGVsLmdldERhdGEoKTtcblx0XHRsZXQgdmFsdWUgPSBNYXNzRWRpdEhhbmRsZXJzLl9nZXRWYWx1ZShvU291cmNlIGFzIENvbnRyb2wpO1xuXHRcdGFQYXJhbXMgPSBhUGFyYW1zLmxlbmd0aCA+IDAgPyBhUGFyYW1zIDogb1NvdXJjZSAmJiBvU291cmNlLmdldFNlbGVjdGVkS2V5KCkgJiYgb1NvdXJjZS5nZXRTZWxlY3RlZEtleSgpLnNwbGl0KFwiL1wiKTtcblxuXHRcdGxldCBvRGF0YU9iamVjdDtcblx0XHRjb25zdCBzUHJvcGVydHlOYW1lID0gb1NvdXJjZS5kYXRhKFwiZmllbGRQYXRoXCIpO1xuXG5cdFx0aWYgKGFQYXJhbXNbMF0gPT09IFwiRGVmYXVsdFwiKSB7XG5cdFx0XHRvRGF0YU9iamVjdCA9IHtcblx0XHRcdFx0a2V5VmFsdWU6IGFQYXJhbXNbMV0sXG5cdFx0XHRcdHZhbHVlOiBhUGFyYW1zWzBdXG5cdFx0XHR9O1xuXHRcdH0gZWxzZSBpZiAoYVBhcmFtc1swXSA9PT0gXCJDbGVhckZpZWxkVmFsdWVcIikge1xuXHRcdFx0dmFsdWUgPSBcIlwiO1xuXHRcdFx0dmFsdWUgPSBNYXNzRWRpdEhhbmRsZXJzLl9nZXRWYWx1ZU9uRW1wdHkob1NvdXJjZSwgZmllbGRzSW5mb01vZGVsLCB2YWx1ZSwgc1Byb3BlcnR5TmFtZSk7XG5cdFx0XHRvRGF0YU9iamVjdCA9IHtcblx0XHRcdFx0a2V5VmFsdWU6IGFQYXJhbXNbMV0sXG5cdFx0XHRcdHZhbHVlOiB2YWx1ZVxuXHRcdFx0fTtcblx0XHR9IGVsc2UgaWYgKCFhUGFyYW1zKSB7XG5cdFx0XHR2YWx1ZSA9IE1hc3NFZGl0SGFuZGxlcnMuX2dldFZhbHVlT25FbXB0eShvU291cmNlLCBmaWVsZHNJbmZvTW9kZWwsIHZhbHVlLCBzUHJvcGVydHlOYW1lKTtcblx0XHRcdG9EYXRhT2JqZWN0ID0ge1xuXHRcdFx0XHRrZXlWYWx1ZTogc1Byb3BlcnR5TmFtZSxcblx0XHRcdFx0dmFsdWU6IHZhbHVlXG5cdFx0XHR9O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCBwcm9wZXJ0eU5hbWUgPSBhUGFyYW1zLnNsaWNlKDAsIC0xKS5qb2luKFwiL1wiKTtcblx0XHRcdGNvbnN0IHByb3BlcnR5VmFsdWVzID1cblx0XHRcdFx0ZmllbGRzSW5mb01vZGVsLmdldFByb3BlcnR5KGAvdmFsdWVzLyR7cHJvcGVydHlOYW1lfWApIHx8IGZpZWxkc0luZm9Nb2RlbC5nZXRQcm9wZXJ0eShgL3VuaXREYXRhLyR7cHJvcGVydHlOYW1lfWApIHx8IFtdO1xuXG5cdFx0XHRjb25zdCByZWxhdGVkRmllbGQgPSAocHJvcGVydHlWYWx1ZXMgfHwgW10pLmZpbmQoZnVuY3Rpb24gKG9GaWVsZERhdGE6IGFueSkge1xuXHRcdFx0XHRyZXR1cm4gb0ZpZWxkRGF0YT8udGV4dEluZm8/LnZhbHVlID09PSB2YWx1ZSB8fCBvRmllbGREYXRhLnRleHQgPT09IHZhbHVlO1xuXHRcdFx0fSk7XG5cdFx0XHRvRGF0YU9iamVjdCA9IHtcblx0XHRcdFx0a2V5VmFsdWU6IHByb3BlcnR5TmFtZSxcblx0XHRcdFx0dmFsdWU6XG5cdFx0XHRcdFx0cmVsYXRlZEZpZWxkLnRleHRJbmZvICYmIE1hc3NFZGl0SGFuZGxlcnMuX3ZhbHVlRXhpc3RzKHJlbGF0ZWRGaWVsZC50ZXh0SW5mby52YWx1ZSlcblx0XHRcdFx0XHRcdD8gcmVsYXRlZEZpZWxkLnRleHRJbmZvLnZhbHVlXG5cdFx0XHRcdFx0XHQ6IHJlbGF0ZWRGaWVsZC50ZXh0XG5cdFx0XHR9O1xuXHRcdH1cblx0XHRsZXQgYkV4aXN0aW5nRWxlbWVudGluZGV4ID0gLTE7XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBvRmllbGRzSW5mb0RhdGEucmVzdWx0cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0aWYgKG9GaWVsZHNJbmZvRGF0YS5yZXN1bHRzW2ldLmtleVZhbHVlID09PSBvRGF0YU9iamVjdC5rZXlWYWx1ZSkge1xuXHRcdFx0XHRiRXhpc3RpbmdFbGVtZW50aW5kZXggPSBpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoYkV4aXN0aW5nRWxlbWVudGluZGV4ICE9PSAtMSkge1xuXHRcdFx0b0ZpZWxkc0luZm9EYXRhLnJlc3VsdHNbYkV4aXN0aW5nRWxlbWVudGluZGV4XSA9IG9EYXRhT2JqZWN0O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRvRmllbGRzSW5mb0RhdGEucmVzdWx0cy5wdXNoKG9EYXRhT2JqZWN0KTtcblx0XHR9XG5cdFx0aWYgKHVwZGF0ZVRyYW5zQ3R4ICYmICFvRGF0YU9iamVjdC5rZXlWYWx1ZS5pbmNsdWRlcyhcIi9cIikpIHtcblx0XHRcdGNvbnN0IHRyYW5zQ3R4ID0gb1NvdXJjZS5nZXRCaW5kaW5nQ29udGV4dCgpO1xuXHRcdFx0aWYgKGFQYXJhbXNbMF0gPT09IFwiRGVmYXVsdFwiIHx8IGFQYXJhbXNbMF0gPT09IFwiQ2xlYXJGaWVsZFZhbHVlXCIpIHtcblx0XHRcdFx0dHJhbnNDdHguc2V0UHJvcGVydHkob0RhdGFPYmplY3Qua2V5VmFsdWUsIG51bGwpO1xuXHRcdFx0fSBlbHNlIGlmIChvRGF0YU9iamVjdCkge1xuXHRcdFx0XHR0cmFuc0N0eC5zZXRQcm9wZXJ0eShvRGF0YU9iamVjdC5rZXlWYWx1ZSwgb0RhdGFPYmplY3QudmFsdWUpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxufTtcblxuZXhwb3J0IGRlZmF1bHQgTWFzc0VkaXRIYW5kbGVycztcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7OztFQXVCQSxNQUFNQSxnQkFBcUIsR0FBRztJQUM3QjtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0NDLHFCQUFxQixFQUFFLFVBQVVDLFFBQWEsRUFBRUMsWUFBb0IsRUFBRUMsVUFBa0IsRUFBRTtNQUN6RjtNQUNBO01BQ0E7O01BRUEsTUFBTUMsTUFBTSxHQUFHQyxJQUFJLENBQUNDLElBQUksQ0FBQ0gsVUFBVSxDQUFVO01BQzdDLE1BQU1JLFFBQVEsR0FBR0gsTUFBTSxJQUFLQSxNQUFNLENBQUNJLGlCQUFpQixFQUFjO01BQ2xFLE1BQU1DLGNBQWMsR0FBR0wsTUFBTSxJQUFLQSxNQUFNLENBQUNNLFFBQVEsQ0FBQyxZQUFZLENBQWU7TUFDN0UsTUFBTUMsTUFBTSxHQUNYRixjQUFjLENBQUNH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