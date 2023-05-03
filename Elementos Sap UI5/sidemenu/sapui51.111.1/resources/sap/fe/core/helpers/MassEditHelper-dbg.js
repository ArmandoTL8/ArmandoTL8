/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/library", "sap/fe/core/TemplateModel", "sap/fe/core/templating/DataModelPathHelper", "sap/fe/core/templating/PropertyHelper", "sap/fe/macros/field/FieldHelper", "sap/fe/macros/field/FieldTemplating", "sap/fe/macros/table/TableHelper", "sap/m/Button", "sap/m/Dialog", "sap/m/MessageToast", "sap/ui/core/Core", "sap/ui/core/Fragment", "sap/ui/core/util/XMLPreprocessor", "sap/ui/core/XMLTemplateProcessor", "sap/ui/mdc/enum/EditMode", "sap/ui/model/json/JSONModel", "../controllerextensions/messageHandler/messageHandling", "../controls/Any", "../converters/MetaModelConverter", "../templating/FieldControlHelper", "../templating/UIFormatters", "./SideEffectsHelper"], function (Log, CommonUtils, BindingToolkit, FELibrary, TemplateModel, DataModelPathHelper, PropertyHelper, FieldHelper, FieldTemplating, TableHelper, Button, Dialog, MessageToast, Core, Fragment, XMLPreprocessor, XMLTemplateProcessor, EditMode, JSONModel, messageHandling, Any, MetaModelConverter, FieldControlHelper, UIFormatters, SideEffectsHelper) {
  "use strict";

  var isMultiValueField = UIFormatters.isMultiValueField;
  var getRequiredExpression = UIFormatters.getRequiredExpression;
  var getEditMode = UIFormatters.getEditMode;
  var isReadOnlyExpression = FieldControlHelper.isReadOnlyExpression;
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  var convertMetaModelContext = MetaModelConverter.convertMetaModelContext;
  var setEditStyleProperties = FieldTemplating.setEditStyleProperties;
  var getTextBinding = FieldTemplating.getTextBinding;
  var hasValueHelpWithFixedValues = PropertyHelper.hasValueHelpWithFixedValues;
  var hasValueHelp = PropertyHelper.hasValueHelp;
  var hasUnit = PropertyHelper.hasUnit;
  var hasCurrency = PropertyHelper.hasCurrency;
  var getAssociatedUnitPropertyPath = PropertyHelper.getAssociatedUnitPropertyPath;
  var getAssociatedUnitProperty = PropertyHelper.getAssociatedUnitProperty;
  var getRelativePaths = DataModelPathHelper.getRelativePaths;
  var enhanceDataModelPath = DataModelPathHelper.enhanceDataModelPath;
  var pathInModel = BindingToolkit.pathInModel;
  var or = BindingToolkit.or;
  var not = BindingToolkit.not;
  var ifElse = BindingToolkit.ifElse;
  var constant = BindingToolkit.constant;
  var compileExpression = BindingToolkit.compileExpression;
  const MassEditHelper = {
    /**
     * Initializes the value at final or deepest level path with a blank array.
     * Return an empty array pointing to the final or deepest level path.
     *
     * @param sPath Property path
     * @param aValues Array instance where the default data needs to be added
     * @returns The final path
     */
    initLastLevelOfPropertyPath: function (sPath, aValues) {
      let aFinalPath;
      let index = 0;
      const aPaths = sPath.split("/");
      let sFullPath = "";
      aPaths.forEach(function (sPropertyPath) {
        if (!aValues[sPropertyPath] && index === 0) {
          aValues[sPropertyPath] = {};
          aFinalPath = aValues[sPropertyPath];
          sFullPath = sFullPath + sPropertyPath;
          index++;
        } else if (!aFinalPath[sPropertyPath]) {
          sFullPath = `${sFullPath}/${sPropertyPath}`;
          if (sFullPath !== sPath) {
            aFinalPath[sPropertyPath] = {};
            aFinalPath = aFinalPath[sPropertyPath];
          } else {
            aFinalPath[sPropertyPath] = [];
          }
        }
      });
      return aFinalPath;
    },
    /**
     * Method to get unique values for given array values.
     *
     * @param sValue Property value
     * @param index Index of the property value
     * @param self Instance of the array
     * @returns The unique value
     */
    getUniqueValues: function (sValue, index, self) {
      return sValue != undefined && sValue != null ? self.indexOf(sValue) === index : undefined;
    },
    /**
     * Gets the property value for a multi-level path (for example: _Materials/Material_Details gets the value of Material_Details under _Materials Object).
     * Returns the propertyValue, which can be of any type (string, number, etc..).
     *
     * @param sDataPropertyPath Property path
     * @param oValues Object of property values
     * @returns The property value
     */
    getValueForMultiLevelPath: function (sDataPropertyPath, oValues) {
      let result;
      if (sDataPropertyPath && sDataPropertyPath.indexOf("/") > 0) {
        const aPropertyPaths = sDataPropertyPath.split("/");
        aPropertyPaths.forEach(function (sPath) {
          result = oValues && oValues[sPath] ? oValues[sPath] : result && result[sPath];
        });
      }
      return result;
    },
    /**
     * Gets the key path for the key of a combo box that must be selected initially when the dialog opens:
     * => If propertyValue for all selected contexts is different, then < Keep Existing Values > is preselected.
     * => If propertyValue for all selected contexts is the same, then the propertyValue is preselected.
     * => If propertyValue for all selected contexts is empty, then < Leave Blank > is preselected.
     *
     *
     * @param aContexts Contexts for mass edit
     * @param sDataPropertyPath Data property path
     * @returns The key path
     */
    getDefaultSelectionPathComboBox: function (aContexts, sDataPropertyPath) {
      let result;
      if (sDataPropertyPath && aContexts.length > 0) {
        const oSelectedContext = aContexts,
          aPropertyValues = [];
        oSelectedContext.forEach(function (oContext) {
          const oDataObject = oContext.getObject();
          const sMultiLevelPathCondition = sDataPropertyPath.indexOf("/") > -1 && oDataObject.hasOwnProperty(sDataPropertyPath.split("/")[0]);
          if (oContext && (oDataObject.hasOwnProperty(sDataPropertyPath) || sMultiLevelPathCondition)) {
            aPropertyValues.push(oContext.getObject(sDataPropertyPath));
          }
        });
        const aUniquePropertyValues = aPropertyValues.filter(MassEditHelper.getUniqueValues);
        if (aUniquePropertyValues.length > 1) {
          result = `Default/${sDataPropertyPath}`;
        } else if (aUniquePropertyValues.length === 0) {
          result = `Empty/${sDataPropertyPath}`;
        } else if (aUniquePropertyValues.length === 1) {
          result = `${sDataPropertyPath}/${aUniquePropertyValues[0]}`;
        }
      }
      return result;
    },
    /**
     * Checks hidden annotation value [both static and path based] for table's selected context.
     *
     * @param hiddenValue Hidden annotation value / path for field
     * @param aContexts Contexts for mass edit
     * @returns The hidden annotation value
     */
    getHiddenValueForContexts: function (hiddenValue, aContexts) {
      if (hiddenValue && hiddenValue.$Path) {
        return !aContexts.some(function (oSelectedContext) {
          return oSelectedContext.getObject(hiddenValue.$Path) === false;
        });
      }
      return hiddenValue;
    },
    getInputType: function (propertyInfo, dataFieldConverted, oDataModelPath) {
      const editStyleProperties = {};
      let inputType;
      if (propertyInfo) {
        setEditStyleProperties(editStyleProperties, dataFieldConverted, oDataModelPath, true);
        inputType = (editStyleProperties === null || editStyleProperties === void 0 ? void 0 : editStyleProperties.editStyle) || "";
      }
      const isValidForMassEdit = inputType && ["DatePicker", "TimePicker", "DateTimePicker", "RatingIndicator"].indexOf(inputType) === -1 && !isMultiValueField(oDataModelPath) && !hasValueHelpWithFixedValues(propertyInfo);
      return (isValidForMassEdit || "") && inputType;
    },
    getIsFieldGrp: function (dataFieldConverted) {
      return dataFieldConverted && dataFieldConverted.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation" && dataFieldConverted.Target && dataFieldConverted.Target.value && dataFieldConverted.Target.value.indexOf("FieldGroup") > -1;
    },
    /**
     * Get text path for the mass edit field.
     *
     * @param property Property path
     * @param textBinding Text Binding Info
     * @param displayMode Display mode
     * @returns Text Property Path if it exists
     */
    getTextPath: function (property, textBinding, displayMode) {
      let descriptionPath;
      if (textBinding && (textBinding.path || textBinding.parameters && textBinding.parameters.length) && property) {
        if (textBinding.path && displayMode === "Description") {
          descriptionPath = textBinding.path;
        } else if (textBinding.parameters) {
          textBinding.parameters.forEach(function (props) {
            if (props.path && props.path !== property) {
              descriptionPath = props.path;
            }
          });
        }
      }
      return descriptionPath;
    },
    /**
     * Initializes a JSON Model for properties of dialog fields [label, visiblity, dataproperty, etc.].
     *
     * @param oTable Instance of Table
     * @param aContexts Contexts for mass edit
     * @param aDataArray Array containing data related to the dialog used by both the static and the runtime model
     * @returns The model
     */
    prepareDataForDialog: function (oTable, aContexts, aDataArray) {
      const oMetaModel = oTable && oTable.getModel().getMetaModel(),
        sCurrentEntitySetName = oTable.data("metaPath"),
        aTableFields = MassEditHelper.getTableFields(oTable),
        oEntityTypeContext = oMetaModel.getContext(`${sCurrentEntitySetName}/@`),
        oEntitySetContext = oMetaModel.getContext(sCurrentEntitySetName),
        oDataModelObjectPath = getInvolvedDataModelObjects(oEntityTypeContext);
      const oDataFieldModel = new JSONModel();
      let oResult;
      let sLabelText;
      let bValueHelpEnabled;
      let sUnitPropertyPath;
      let bValueHelpEnabledForUnit;
      let oTextBinding;
      aTableFields.forEach(function (oColumnInfo) {
        const sDataPropertyPath = oColumnInfo.dataProperty;
        if (sDataPropertyPath) {
          var _oDataFieldConverted$, _oDataFieldConverted$2, _oPropertyInfo, _oPropertyInfo$annota, _oPropertyInfo$annota2, _unitPropertyInfo$ann, _unitPropertyInfo$ann2;
          let oPropertyInfo = sDataPropertyPath && oMetaModel.getObject(`${sCurrentEntitySetName}/${sDataPropertyPath}@`);
          sLabelText = oColumnInfo.label || oPropertyInfo && oPropertyInfo["@com.sap.vocabularies.Common.v1.Label"] || sDataPropertyPath;
          if (oDataModelObjectPath) {
            oDataModelObjectPath.targetObject = oDataModelObjectPath.targetEntityType.entityProperties.filter(function (oProperty) {
              return oProperty.name === sDataPropertyPath;
            });
          }
          oDataModelObjectPath.targetObject = oDataModelObjectPath.targetObject[0] || {};
          oTextBinding = getTextBinding(oDataModelObjectPath, {}, true) || {};
          const oFieldContext = oMetaModel.getContext(oColumnInfo.annotationPath),
            oDataFieldConverted = convertMetaModelContext(oFieldContext),
            oPropertyContext = oMetaModel.getContext(`${sCurrentEntitySetName}/${sDataPropertyPath}@`),
            oInterface = oPropertyContext && oPropertyContext.getInterface();
          let oDataModelPath = getInvolvedDataModelObjects(oFieldContext, oEntitySetContext);
          if ((oDataFieldConverted === null || oDataFieldConverted === void 0 ? void 0 : (_oDataFieldConverted$ = oDataFieldConverted.Value) === null || _oDataFieldConverted$ === void 0 ? void 0 : (_oDataFieldConverted$2 = _oDataFieldConverted$.path) === null || _oDataFieldConverted$2 === void 0 ? void 0 : _oDataFieldConverted$2.length) > 0) {
            oDataModelPath = enhanceDataModelPath(oDataModelPath, sDataPropertyPath);
          }
          const bHiddenField = MassEditHelper.getHiddenValueForContexts(oFieldContext && oFieldContext.getObject()["@com.sap.vocabularies.UI.v1.Hidden"], aContexts) || false;
          const isImage = oPropertyInfo && oPropertyInfo["@com.sap.vocabularies.UI.v1.IsImageURL"];
          oInterface.context = {
            getModel: function () {
              return oInterface.getModel();
            },
            getPath: function () {
              return `${sCurrentEntitySetName}/${sDataPropertyPath}`;
            }
          };
          oPropertyInfo = oDataFieldConverted._type === "Property" ? oDataFieldConverted : oDataFieldConverted && oDataFieldConverted.Value && oDataFieldConverted.Value.$target || oDataFieldConverted && oDataFieldConverted.Target && oDataFieldConverted.Target.$target;
          // Datafield is not included in the FieldControl calculation, needs to be implemented

          const chartProperty = oPropertyInfo && oPropertyInfo.term && oPropertyInfo.term === "com.sap.vocabularies.UI.v1.Chart";
          const isAction = !!oDataFieldConverted.Action;
          const isFieldGrp = MassEditHelper.getIsFieldGrp(oDataFieldConverted);
          if (isImage || bHiddenField || chartProperty || isAction || isFieldGrp) {
            return;
          }

          // ValueHelp properties
          sUnitPropertyPath = (hasCurrency(oPropertyInfo) || hasUnit(oPropertyInfo)) && getAssociatedUnitPropertyPath(oPropertyInfo) || "";
          const unitPropertyInfo = sUnitPropertyPath && getAssociatedUnitProperty(oPropertyInfo);
          bValueHelpEnabled = hasValueHelp(oPropertyInfo);
          bValueHelpEnabledForUnit = unitPropertyInfo && hasValueHelp(unitPropertyInfo);
          const hasContextDependentVH = (bValueHelpEnabled || bValueHelpEnabledForUnit) && (((_oPropertyInfo = oPropertyInfo) === null || _oPropertyInfo === void 0 ? void 0 : (_oPropertyInfo$annota = _oPropertyInfo.annotations) === null || _oPropertyInfo$annota === void 0 ? void 0 : (_oPropertyInfo$annota2 = _oPropertyInfo$annota.Common) === null || _oPropertyInfo$annota2 === void 0 ? void 0 : _oPropertyInfo$annota2.ValueListRelevantQualifiers) || unitPropertyInfo && (unitPropertyInfo === null || unitPropertyInfo === void 0 ? void 0 : (_unitPropertyInfo$ann = unitPropertyInfo.annotations) === null || _unitPropertyInfo$ann === void 0 ? void 0 : (_unitPropertyInfo$ann2 = _unitPropertyInfo$ann.Common) === null || _unitPropertyInfo$ann2 === void 0 ? void 0 : _unitPropertyInfo$ann2.ValueListRelevantQualifiers));
          if (hasContextDependentVH) {
            // context dependent VH is not supported for Mass Edit.
            return;
          }

          // EditMode and InputType
          const propertyForFieldControl = oPropertyInfo && oPropertyInfo.Value ? oPropertyInfo.Value : oPropertyInfo;
          const expBinding = getEditMode(propertyForFieldControl, oDataModelPath, false, false, oDataFieldConverted, constant(true));
          const editModeValues = Object.keys(EditMode);
          const editModeIsStatic = !!expBinding && editModeValues.includes(expBinding);
          const editable = !!expBinding && (editModeIsStatic && expBinding === EditMode.Editable || !editModeIsStatic);
          const navPropertyWithValueHelp = sDataPropertyPath.includes("/") && bValueHelpEnabled;
          if (!editable || navPropertyWithValueHelp) {
            return;
          }
          const inputType = MassEditHelper.getInputType(oPropertyInfo, oDataFieldConverted, oDataModelPath);
          if (inputType) {
            const relativePath = getRelativePaths(oDataModelPath);
            const isReadOnly = isReadOnlyExpression(oPropertyInfo, relativePath);
            const displayMode = CommonUtils.computeDisplayMode(oPropertyContext.getObject());
            const isValueHelpEnabled = bValueHelpEnabled ? bValueHelpEnabled : false;
            const isValueHelpEnabledForUnit = bValueHelpEnabledForUnit && !sUnitPropertyPath.includes("/") ? bValueHelpEnabledForUnit : false;
            const unitProperty = sUnitPropertyPath && !sDataPropertyPath.includes("/") ? sUnitPropertyPath : false;
            oResult = {
              label: sLabelText,
              dataProperty: sDataPropertyPath,
              isValueHelpEnabled: bValueHelpEnabled ? bValueHelpEnabled : false,
              unitProperty,
              isFieldRequired: getRequiredExpression(oPropertyInfo, oDataFieldConverted, true, false, {}, oDataModelPath),
              defaultSelectionPath: sDataPropertyPath ? MassEditHelper.getDefaultSelectionPathComboBox(aContexts, sDataPropertyPath) : false,
              defaultSelectionUnitPath: sUnitPropertyPath ? MassEditHelper.getDefaultSelectionPathComboBox(aContexts, sUnitPropertyPath) : false,
              entitySet: sCurrentEntitySetName,
              display: displayMode,
              descriptionPath: MassEditHelper.getTextPath(sDataPropertyPath, oTextBinding, displayMode),
              nullable: oPropertyInfo.nullable !== undefined ? oPropertyInfo.nullable : true,
              isPropertyReadOnly: isReadOnly !== undefined ? isReadOnly : false,
              inputType: inputType,
              editMode: editable ? expBinding : undefined,
              propertyInfo: {
                hasVH: isValueHelpEnabled,
                runtimePath: "fieldsInfo>/values/",
                relativePath: sDataPropertyPath,
                propertyPathForValueHelp: `${sCurrentEntitySetName}/${sDataPropertyPath}`
              },
              unitInfo: unitProperty && {
                hasVH: isValueHelpEnabledForUnit,
                runtimePath: "fieldsInfo>/unitData/",
                relativePath: unitProperty,
                propertyPathForValueHelp: `${sCurrentEntitySetName}/${unitProperty}`
              }
            };
            aDataArray.push(oResult);
          }
        }
      });
      oDataFieldModel.setData(aDataArray);
      return oDataFieldModel;
    },
    getTableFields: function (oTable) {
      const aColumns = oTable && oTable.getColumns() || [];
      const columnsData = oTable && oTable.getParent().getTableDefinition().columns;
      return aColumns.map(function (oColumn) {
        const sDataProperty = oColumn && oColumn.getDataProperty(),
          aRealtedColumnInfo = columnsData && columnsData.filter(function (oColumnInfo) {
            return oColumnInfo.name === sDataProperty && oColumnInfo.type === "Annotation";
          });
        return {
          dataProperty: sDataProperty,
          label: oColumn.getHeader(),
          annotationPath: aRealtedColumnInfo && aRealtedColumnInfo[0] && aRealtedColumnInfo[0].annotationPath
        };
      });
    },
    getDefaultTextsForDialog: function (oResourceBundle, iSelectedContexts, oTable) {
      // The confirm button text is "Save" for table in Display mode and "Apply" for table in edit mode. This can be later exposed if needed.
      const bDisplayMode = oTable.data("displayModePropertyBinding") === "true";
      return {
        keepExistingPrefix: "< Keep",
        leaveBlankValue: "< Leave Blank >",
        clearFieldValue: "< Clear Values >",
        massEditTitle: oResourceBundle.getText("C_MASS_EDIT_DIALOG_TITLE", iSelectedContexts.toString()),
        applyButtonText: bDisplayMode ? oResourceBundle.getText("C_MASS_EDIT_SAVE_BUTTON_TEXT") : oResourceBundle.getText("C_MASS_EDIT_APPLY_BUTTON_TEXT"),
        useValueHelpValue: "< Use Value Help >",
        cancelButtonText: oResourceBundle.getText("C_COMMON_OBJECT_PAGE_CANCEL"),
        noFields: oResourceBundle.getText("C_MASS_EDIT_NO_EDITABLE_FIELDS"),
        okButtonText: oResourceBundle.getText("C_COMMON_DIALOG_OK")
      };
    },
    /**
     * Adds a suffix to the 'keep existing' property of the comboBox.
     *
     * @param sInputType InputType of the field
     * @returns The modified string
     */
    // getSuffixForKeepExisiting: function (sInputType: string) {
    // 	let sResult = "Values";

    // 	switch (sInputType) {
    // 		//TODO - Add for other control types as well (Radio Button, Email, Input, MDC Fields, Image etc.)
    // 		case "DatePicker":
    // 			sResult = "Dates";
    // 			break;
    // 		case "CheckBox":
    // 			sResult = "Settings";
    // 			break;
    // 		default:
    // 			sResult = "Values";
    // 	}
    // 	return sResult;
    // },

    /**
     * Adds default values to the model [Keep Existing Values, Leave Blank].
     *
     * @param aValues Array instance where the default data needs to be added
     * @param oDefaultValues Default values from Application Manifest
     * @param oPropertyInfo Property information
     * @param bUOMField
     */
    setDefaultValuesToDialog: function (aValues, oDefaultValues, oPropertyInfo, bUOMField) {
      const sPropertyPath = bUOMField ? oPropertyInfo.unitProperty : oPropertyInfo.dataProperty,
        sInputType = oPropertyInfo.inputType,
        bPropertyRequired = oPropertyInfo.isFieldRequired;
      // const sSuffixForKeepExisting = MassEditHelper.getSuffixForKeepExisiting(sInputType);
      const sSuffixForKeepExisting = "Values";
      aValues.defaultOptions = aValues.defaultOptions || [];
      const selectOptionsExist = aValues.selectOptions && aValues.selectOptions.length > 0;
      const keepEntry = {
        text: `${oDefaultValues.keepExistingPrefix} ${sSuffixForKeepExisting} >`,
        key: `Default/${sPropertyPath}`
      };
      if (sInputType === "CheckBox") {
        const falseEntry = {
          text: "No",
          key: `${sPropertyPath}/false`,
          textInfo: {
            value: false
          }
        };
        const truthyEntry = {
          text: "Yes",
          key: `${sPropertyPath}/true`,
          textInfo: {
            value: true
          }
        };
        aValues.unshift(falseEntry);
        aValues.defaultOptions.unshift(falseEntry);
        aValues.unshift(truthyEntry);
        aValues.defaultOptions.unshift(truthyEntry);
        aValues.unshift(keepEntry);
        aValues.defaultOptions.unshift(keepEntry);
      } else {
        var _oPropertyInfo$proper, _oPropertyInfo$unitIn;
        if (oPropertyInfo !== null && oPropertyInfo !== void 0 && (_oPropertyInfo$proper = oPropertyInfo.propertyInfo) !== null && _oPropertyInfo$proper !== void 0 && _oPropertyInfo$proper.hasVH || oPropertyInfo !== null && oPropertyInfo !== void 0 && (_oPropertyInfo$unitIn = oPropertyInfo.unitInfo) !== null && _oPropertyInfo$unitIn !== void 0 && _oPropertyInfo$unitIn.hasVH && bUOMField) {
          const vhdEntry = {
            text: oDefaultValues.useValueHelpValue,
            key: `UseValueHelpValue/${sPropertyPath}`
          };
          aValues.unshift(vhdEntry);
          aValues.defaultOptions.unshift(vhdEntry);
        }
        if (selectOptionsExist) {
          if (bPropertyRequired !== "true" && !bUOMField) {
            const clearEntry = {
              text: oDefaultValues.clearFieldValue,
              key: `ClearFieldValue/${sPropertyPath}`
            };
            aValues.unshift(clearEntry);
            aValues.defaultOptions.unshift(clearEntry);
          }
          aValues.unshift(keepEntry);
          aValues.defaultOptions.unshift(keepEntry);
        } else {
          const emptyEntry = {
            text: oDefaultValues.leaveBlankValue,
            key: `Default/${sPropertyPath}`
          };
          aValues.unshift(emptyEntry);
          aValues.defaultOptions.unshift(emptyEntry);
        }
      }
    },
    /**
     * Get text arrangement info for a context property.
     *
     * @param property Property Path
     * @param descriptionPath Path to text association of the property
     * @param displayMode Display mode of the property and text association
     * @param selectedContext Context to find the full text
     * @returns The text arrangement
     */
    getTextArrangementInfo: function (property, descriptionPath, displayMode, selectedContext) {
      let value = selectedContext.getObject(property),
        descriptionValue,
        fullText;
      if (descriptionPath && property) {
        switch (displayMode) {
          case "Description":
            descriptionValue = selectedContext.getObject(descriptionPath) || "";
            fullText = descriptionValue;
            break;
          case "Value":
            value = selectedContext.getObject(property) || "";
            fullText = value;
            break;
          case "ValueDescription":
            value = selectedContext.getObject(property) || "";
            descriptionValue = selectedContext.getObject(descriptionPath) || "";
            fullText = descriptionValue ? `${value} (${descriptionValue})` : value;
            break;
          case "DescriptionValue":
            value = selectedContext.getObject(property) || "";
            descriptionValue = selectedContext.getObject(descriptionPath) || "";
            fullText = descriptionValue ? `${descriptionValue} (${value})` : value;
            break;
          default:
            Log.info(`Display Property not applicable: ${property}`);
            break;
        }
      }
      return {
        textArrangement: displayMode,
        valuePath: property,
        descriptionPath: descriptionPath,
        value: value,
        description: descriptionValue,
        fullText: fullText
      };
    },
    /**
     * Return the visibility valuue for the ManagedObject Any.
     *
     * @param any The ManagedObject Any to be used to calculate the visible value of the binding.
     * @returns Returns true if the mass edit field is editable.
     */
    isEditable: function (any) {
      const binding = any.getBinding("any");
      const value = binding.getExternalValue();
      return value === EditMode.Editable;
    },
    /**
     * Calculate and update the visibility of mass edit field on change of the ManagedObject Any binding.
     *
     * @param oDialogDataModel Model to be used runtime.
     * @param dataProperty Field name.
     */
    onContextEditableChange: function (oDialogDataModel, dataProperty) {
      const objectsForVisibility = oDialogDataModel.getProperty(`/values/${dataProperty}/objectsForVisibility`) || [];
      const editable = objectsForVisibility.some(MassEditHelper.isEditable);
      if (editable) {
        oDialogDataModel.setProperty(`/values/${dataProperty}/visible`, editable);
      }
    },
    /**
     * Update Managed Object Any for visibility of the mass edit fields.
     *
     * @param mOToUse The ManagedObject Any to be used to calculate the visible value of the binding.
     * @param oDialogDataModel Model to be used runtime.
     * @param dataProperty Field name.
     * @param values Values of the field.
     */
    updateOnContextChange: function (mOToUse, oDialogDataModel, dataProperty, values) {
      const binding = mOToUse.getBinding("any");
      values.objectsForVisibility = values.objectsForVisibility || [];
      values.objectsForVisibility.push(mOToUse);
      binding === null || binding === void 0 ? void 0 : binding.attachChange(MassEditHelper.onContextEditableChange.bind(null, oDialogDataModel, dataProperty));
    },
    /**
     * Get bound object to calculate the visibility of contexts.
     *
     * @param expBinding Binding String object.
     * @param context Context the binding value.
     * @returns The ManagedObject Any to be used to calculate the visible value of the binding.
     */
    getBoundObject: function (expBinding, context) {
      const mOToUse = new Any({
        any: expBinding
      });
      const model = context.getModel();
      mOToUse.setModel(model);
      mOToUse.setBindingContext(context);
      return mOToUse;
    },
    /**
     * Get the visibility of the field.
     *
     * @param expBinding Binding String object.
     * @param oDialogDataModel Model to be used runtime.
     * @param dataProperty Field name.
     * @param values Values of the field.
     * @param context Context the binding value.
     * @returns Returns true if the mass edit field is editable.
     */
    getFieldVisiblity: function (expBinding, oDialogDataModel, dataProperty, values, context) {
      const mOToUse = MassEditHelper.getBoundObject(expBinding, context);
      const isContextEditable = MassEditHelper.isEditable(mOToUse);
      if (!isContextEditable) {
        MassEditHelper.updateOnContextChange(mOToUse, oDialogDataModel, dataProperty, values);
      }
      return isContextEditable;
    },
    /**
     * Initializes a runtime model:
     * => The model consists of values shown in the comboBox of the dialog (Leave Blank, Keep Existing Values, or any property value for the selected context, etc.)
     * => The model will capture runtime changes in the results property (the value entered in the comboBox).
     *
     * @param aContexts Contexts for mass edit
     * @param aDataArray Array containing data related to the dialog used by both the static and the runtime model
     * @param oDefaultValues Default values from i18n
     * @param dialogContext Transient context for mass edit dialog.
     * @returns The runtime model
     */
    setRuntimeModelOnDialog: function (aContexts, aDataArray, oDefaultValues, dialogContext) {
      const aValues = [];
      const aUnitData = [];
      const aResults = [];
      const textPaths = [];
      const aReadOnlyFieldInfo = [];
      const oData = {
        values: aValues,
        unitData: aUnitData,
        results: aResults,
        readablePropertyData: aReadOnlyFieldInfo,
        selectedKey: undefined,
        textPaths: textPaths,
        noFields: oDefaultValues.noFields
      };
      const oDialogDataModel = new JSONModel(oData);
      aDataArray.forEach(function (oInData) {
        let oTextInfo;
        let sPropertyKey;
        let sUnitPropertyName;
        const oDistinctValueMap = {};
        const oDistinctUnitMap = {};
        if (oInData.dataProperty && oInData.dataProperty.indexOf("/") > -1) {
          const aFinalPath = MassEditHelper.initLastLevelOfPropertyPath(oInData.dataProperty, aValues /*, dialogContext */);
          const aPropertyPaths = oInData.dataProperty.split("/");
          for (const context of aContexts) {
            const sMultiLevelPathValue = context.getObject(oInData.dataProperty);
            sPropertyKey = `${oInData.dataProperty}/${sMultiLevelPathValue}`;
            if (!oDistinctValueMap[sPropertyKey] && aFinalPath[aPropertyPaths[aPropertyPaths.length - 1]]) {
              oTextInfo = MassEditHelper.getTextArrangementInfo(oInData.dataProperty, oInData.descriptionPath, oInData.display, context);
              aFinalPath[aPropertyPaths[aPropertyPaths.length - 1]].push({
                text: oTextInfo && oTextInfo.fullText || sMultiLevelPathValue,
                key: sPropertyKey,
                textInfo: oTextInfo
              });
              oDistinctValueMap[sPropertyKey] = sMultiLevelPathValue;
            }
          }
          // if (Object.keys(oDistinctValueMap).length === 1) {
          // 	dialogContext.setProperty(oData.dataProperty, sPropertyKey && oDistinctValueMap[sPropertyKey]);
          // }

          aFinalPath[aPropertyPaths[aPropertyPaths.length - 1]].textInfo = {
            descriptionPath: oInData.descriptionPath,
            valuePath: oInData.dataProperty,
            displayMode: oInData.display
          };
        } else {
          aValues[oInData.dataProperty] = aValues[oInData.dataProperty] || [];
          aValues[oInData.dataProperty]["selectOptions"] = aValues[oInData.dataProperty]["selectOptions"] || [];
          if (oInData.unitProperty) {
            aUnitData[oInData.unitProperty] = aUnitData[oInData.unitProperty] || [];
            aUnitData[oInData.unitProperty]["selectOptions"] = aUnitData[oInData.unitProperty]["selectOptions"] || [];
          }
          for (const context of aContexts) {
            const oDataObject = context.getObject();
            sPropertyKey = `${oInData.dataProperty}/${oDataObject[oInData.dataProperty]}`;
            if (oInData.dataProperty && oDataObject[oInData.dataProperty] && !oDistinctValueMap[sPropertyKey]) {
              if (oInData.inputType != "CheckBox") {
                oTextInfo = MassEditHelper.getTextArrangementInfo(oInData.dataProperty, oInData.descriptionPath, oInData.display, context);
                const entry = {
                  text: oTextInfo && oTextInfo.fullText || oDataObject[oInData.dataProperty],
                  key: sPropertyKey,
                  textInfo: oTextInfo
                };
                aValues[oInData.dataProperty].push(entry);
                aValues[oInData.dataProperty]["selectOptions"].push(entry);
              }
              oDistinctValueMap[sPropertyKey] = oDataObject[oInData.dataProperty];
            }
            if (oInData.unitProperty && oDataObject[oInData.unitProperty]) {
              sUnitPropertyName = `${oInData.unitProperty}/${oDataObject[oInData.unitProperty]}`;
              if (!oDistinctUnitMap[sUnitPropertyName]) {
                if (oInData.inputType != "CheckBox") {
                  oTextInfo = MassEditHelper.getTextArrangementInfo(oInData.unitProperty, oInData.descriptionPath, oInData.display, context);
                  const unitEntry = {
                    text: oTextInfo && oTextInfo.fullText || oDataObject[oInData.unitProperty],
                    key: sUnitPropertyName,
                    textInfo: oTextInfo
                  };
                  aUnitData[oInData.unitProperty].push(unitEntry);
                  aUnitData[oInData.unitProperty]["selectOptions"].push(unitEntry);
                }
                oDistinctUnitMap[sUnitPropertyName] = oDataObject[oInData.unitProperty];
              }
            }
          }
          aValues[oInData.dataProperty].textInfo = {
            descriptionPath: oInData.descriptionPath,
            valuePath: oInData.dataProperty,
            displayMode: oInData.display
          };
          if (Object.keys(oDistinctValueMap).length === 1) {
            dialogContext.setProperty(oInData.dataProperty, sPropertyKey && oDistinctValueMap[sPropertyKey]);
          }
          if (Object.keys(oDistinctUnitMap).length === 1) {
            dialogContext.setProperty(oInData.unitProperty, sUnitPropertyName && oDistinctUnitMap[sUnitPropertyName]);
          }
        }
        textPaths[oInData.dataProperty] = oInData.descriptionPath ? [oInData.descriptionPath] : [];
      });
      aDataArray.forEach(function (oInData) {
        let values = {};
        if (oInData.dataProperty.indexOf("/") > -1) {
          const sMultiLevelPropPathValue = MassEditHelper.getValueForMultiLevelPath(oInData.dataProperty, aValues);
          if (!sMultiLevelPropPathValue) {
            sMultiLevelPropPathValue.push({
              text: oDefaultValues.leaveBlankValue,
              key: `Empty/${oInData.dataProperty}`
            });
          } else {
            MassEditHelper.setDefaultValuesToDialog(sMultiLevelPropPathValue, oDefaultValues, oInData);
          }
          values = sMultiLevelPropPathValue;
        } else if (aValues[oInData.dataProperty]) {
          aValues[oInData.dataProperty] = aValues[oInData.dataProperty] || [];
          MassEditHelper.setDefaultValuesToDialog(aValues[oInData.dataProperty], oDefaultValues, oInData);
          values = aValues[oInData.dataProperty];
        }
        if (aUnitData[oInData.unitProperty] && aUnitData[oInData.unitProperty].length) {
          MassEditHelper.setDefaultValuesToDialog(aUnitData[oInData.unitProperty], oDefaultValues, oInData, true);
          aUnitData[oInData.unitProperty].textInfo = {};
          aUnitData[oInData.unitProperty].selectedKey = MassEditHelper.getDefaultSelectionPathComboBox(aContexts, oInData.unitProperty);
          aUnitData[oInData.unitProperty].inputType = oInData.inputType;
        } else if (oInData.dataProperty && aValues[oInData.dataProperty] && !aValues[oInData.dataProperty].length || oInData.unitProperty && aUnitData[oInData.unitProperty] && !aUnitData[oInData.unitProperty].length) {
          const bClearFieldOrBlankValueExists = aValues[oInData.dataProperty] && aValues[oInData.dataProperty].some(function (obj) {
            return obj.text === "< Clear Values >" || obj.text === "< Leave Blank >";
          });
          if (oInData.dataProperty && !bClearFieldOrBlankValueExists) {
            aValues[oInData.dataProperty].push({
              text: oDefaultValues.leaveBlankValue,
              key: `Empty/${oInData.dataProperty}`
            });
          }
          const bClearFieldOrBlankUnitValueExists = aUnitData[oInData.unitProperty] && aUnitData[oInData.unitProperty].some(function (obj) {
            return obj.text === "< Clear Values >" || obj.text === "< Leave Blank >";
          });
          if (oInData.unitProperty) {
            if (!bClearFieldOrBlankUnitValueExists) {
              aUnitData[oInData.unitProperty].push({
                text: oDefaultValues.leaveBlankValue,
                key: `Empty/${oInData.unitProperty}`
              });
            }
            aUnitData[oInData.unitProperty].textInfo = {};
            aUnitData[oInData.unitProperty].selectedKey = MassEditHelper.getDefaultSelectionPathComboBox(aContexts, oInData.unitProperty);
            aUnitData[oInData.unitProperty].inputType = oInData.inputType;
          }
        }
        if (oInData.isPropertyReadOnly && typeof oInData.isPropertyReadOnly === "boolean") {
          aReadOnlyFieldInfo.push({
            property: oInData.dataProperty,
            value: oInData.isPropertyReadOnly,
            type: "Default"
          });
        } else if (oInData.isPropertyReadOnly && oInData.isPropertyReadOnly.operands && oInData.isPropertyReadOnly.operands[0] && oInData.isPropertyReadOnly.operands[0].operand1 && oInData.isPropertyReadOnly.operands[0].operand2) {
          // This needs to be refactored in accordance with the ReadOnlyExpression change
          aReadOnlyFieldInfo.push({
            property: oInData.dataProperty,
            propertyPath: oInData.isPropertyReadOnly.operands[0].operand1.path,
            propertyValue: oInData.isPropertyReadOnly.operands[0].operand2.value,
            type: "Path"
          });
        }

        // Setting visbility of the mass edit field.
        if (oInData.editMode) {
          values.visible = oInData.editMode === EditMode.Editable || aContexts.some(MassEditHelper.getFieldVisiblity.bind(MassEditHelper, oInData.editMode, oDialogDataModel, oInData.dataProperty, values));
        } else {
          values.visible = true;
        }
        values.selectedKey = MassEditHelper.getDefaultSelectionPathComboBox(aContexts, oInData.dataProperty);
        values.inputType = oInData.inputType;
        values.unitProperty = oInData.unitProperty;
      });
      return oDialogDataModel;
    },
    /**
     * Gets transient context for dialog.
     *
     * @param table Instance of Table.
     * @param dialog Mass Edit Dialog.
     * @returns Promise returning instance of dialog.
     */
    getDialogContext: function (table, dialog) {
      let transCtx = dialog && dialog.getBindingContext();
      if (!transCtx) {
        const model = table.getModel();
        const listBinding = table.getRowBinding();
        const transientListBinding = model.bindList(listBinding.getPath(), listBinding.getContext(), [], [], {
          $$updateGroupId: "submitLater"
        });
        transientListBinding.refreshInternal = function () {
          /* */
        };
        transCtx = transientListBinding.create({}, true);
      }
      return transCtx;
    },
    onDialogOpen: function (event) {
      const source = event.getSource();
      const fieldsInfoModel = source.getModel("fieldsInfo");
      fieldsInfoModel.setProperty("/isOpen", true);
    },
    closeDialog: function (oDialog) {
      oDialog.close();
      oDialog.destroy();
    },
    messageHandlingForMassEdit: async function (oTable, aContexts, oController, oInDialog, aResults, errorContexts) {
      var _oController$getView, _oController$getView$, _oController$getView4, _oController$getView5;
      const DraftStatus = FELibrary.DraftStatus;
      const oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core");
      (_oController$getView = oController.getView()) === null || _oController$getView === void 0 ? void 0 : (_oController$getView$ = _oController$getView.getBindingContext("internal")) === null || _oController$getView$ === void 0 ? void 0 : _oController$getView$.setProperty("getBoundMessagesForMassEdit", true);
      oController._editFlow.getMessageHandler().showMessages({
        onBeforeShowMessage: function (messages, showMessageParameters) {
          //messages.concatenate(messageHandling.getMessages(true, true));
          showMessageParameters.fnGetMessageSubtitle = messageHandling.setMessageSubtitle.bind({}, oTable, aContexts);
          const unboundErrors = [];
          messages.forEach(function (message) {
            if (!message.getTarget()) {
              unboundErrors.push(message);
            }
          });
          if (aResults.length > 0 && errorContexts.length === 0) {
            oController._editFlow.setDraftStatus(DraftStatus.Saved);
            const successToast = oResourceBundle.getText("C_MASS_EDIT_SUCCESS_TOAST");
            MessageToast.show(successToast);
          } else if (errorContexts.length < oTable.getSelectedContexts().length) {
            oController._editFlow.setDraftStatus(DraftStatus.Saved);
          } else if (errorContexts.length === oTable.getSelectedContexts().length) {
            oController._editFlow.setDraftStatus(DraftStatus.Clear);
          }
          if (oController.getModel("ui").getProperty("/isEditable") && unboundErrors.length === 0) {
            showMessageParameters.showMessageBox = false;
            showMessageParameters.showMessageDialog = false;
          }
          return showMessageParameters;
        }
      });
      if (oInDialog.isOpen()) {
        var _oController$getView2, _oController$getView3;
        MassEditHelper.closeDialog(oInDialog);
        (_oController$getView2 = oController.getView()) === null || _oController$getView2 === void 0 ? void 0 : (_oController$getView3 = _oController$getView2.getBindingContext("internal")) === null || _oController$getView3 === void 0 ? void 0 : _oController$getView3.setProperty("skipPatchHandlers", false);
      }
      (_oController$getView4 = oController.getView()) === null || _oController$getView4 === void 0 ? void 0 : (_oController$getView5 = _oController$getView4.getBindingContext("internal")) === null || _oController$getView5 === void 0 ? void 0 : _oController$getView5.setProperty("getBoundMessagesForMassEdit", false);
    },
    /**
     * This function generates side effects map from side effects ids(which is a combination of entity type and qualifier).
     *
     * @param oEntitySetContext
     * @param aSideEffects
     * @param oController
     * @param aResults
     * @returns Side effect map with data.
     */
    getSideEffectDataForKey: function (oEntitySetContext, aSideEffects, oController, aResults) {
      const sOwnerEntityType = oEntitySetContext.getProperty("$Type");
      const baseSideEffectsMapArray = {};
      aResults.forEach(result => {
        const sPath = result.keyValue;
        const sideEffectsArray = FieldHelper.getSideEffectsOnEntityAndProperty(sPath, sOwnerEntityType, aSideEffects);
        baseSideEffectsMapArray[sPath] = oController._sideEffects.getSideEffectsMapForFieldGroups(sideEffectsArray);
      });
      return baseSideEffectsMapArray;
    },
    /**
     * Give the entity type for a given spath for e.g.RequestedQuantity.
     *
     * @param sPath
     * @param sEntityType
     * @param oMetaModel
     * @returns Object having entity, spath and navigation path.
     */
    fnGetPathForSourceProperty: function (sPath, sEntityType, oMetaModel) {
      // if the property path has a navigation, get the target entity type of the navigation
      const sNavigationPath = sPath.indexOf("/") > 0 ? "/" + sEntityType + "/" + sPath.substr(0, sPath.lastIndexOf("/") + 1) + "@sapui.name" : false,
        pOwnerEntity = !sNavigationPath ? Promise.resolve(sEntityType) : oMetaModel.requestObject(sNavigationPath);
      sPath = sNavigationPath ? sPath.substr(sPath.lastIndexOf("/") + 1) : sPath;
      return {
        sPath,
        pOwnerEntity,
        sNavigationPath
      };
    },
    fnGetEntityTypeOfOwner: function (oMetaModel, baseNavPath, oEntitySetContext, targetEntity, aTargets) {
      const ownerEntityType = oEntitySetContext.getProperty("$Type");
      const {
        $Type: pOwner,
        $Partner: ownerNavPath
      } = oMetaModel.getObject(`${oEntitySetContext}/${baseNavPath}`); // nav path
      if (ownerNavPath) {
        const entityObjOfOwnerPartner = oMetaModel.getObject(`/${pOwner}/${ownerNavPath}`);
        if (entityObjOfOwnerPartner) {
          const entityTypeOfOwnerPartner = entityObjOfOwnerPartner["$Type"];
          // if the entity types defer, then base nav path is not from owner
          if (entityTypeOfOwnerPartner !== ownerEntityType) {
            // if target Prop is not from owner, we add it as immediate
            aTargets.push(targetEntity);
          }
        }
      } else {
        // if there is no $Partner attribute, it may not be from owner
        aTargets.push(targetEntity);
      }
      return aTargets;
    },
    /**
     * Give targets that are immediate or deferred based on the entity type of that target.
     *
     *
     * @param sideEffectsData
     * @param oEntitySetContext
     * @param sEntityType
     * @param oMetaModel
     * @returns Targets to request side effects.
     */
    fnGetTargetsForMassEdit: function (sideEffectsData, oEntitySetContext, sEntityType, oMetaModel) {
      const {
        TargetProperties: aTargetProperties,
        TargetEntities: aTargetEntities
      } = sideEffectsData;
      const aPromises = [];
      let aTargets = [];
      const ownerEntityType = oEntitySetContext.getProperty("$Type");
      if (sEntityType === ownerEntityType) {
        // if SalesOrdr Item
        aTargetEntities === null || aTargetEntities === void 0 ? void 0 : aTargetEntities.forEach(targetEntity => {
          targetEntity = targetEntity["$NavigationPropertyPath"];
          let baseNavPath;
          if (targetEntity.includes("/")) {
            baseNavPath = targetEntity.split("/")[0];
          } else {
            baseNavPath = targetEntity;
          }
          aTargets = MassEditHelper.fnGetEntityTypeOfOwner(oMetaModel, baseNavPath, oEntitySetContext, targetEntity, aTargets);
        });
      }
      if (aTargetProperties.length) {
        aTargetProperties.forEach(targetProp => {
          const {
            pOwnerEntity
          } = MassEditHelper.fnGetPathForSourceProperty(targetProp, sEntityType, oMetaModel);
          aPromises.push(pOwnerEntity.then(resultEntity => {
            // if entity is SalesOrderItem, Target Property is from Items table
            if (resultEntity === ownerEntityType) {
              aTargets.push(targetProp); // get immediate targets
            } else if (targetProp.includes("/")) {
              const baseNavPath = targetProp.split("/")[0];
              aTargets = MassEditHelper.fnGetEntityTypeOfOwner(oMetaModel, baseNavPath, oEntitySetContext, targetProp, aTargets);
            }
            return Promise.resolve(aTargets);
          }));
        });
      } else {
        aPromises.push(Promise.resolve(aTargets));
      }
      return Promise.all(aPromises);
    },
    /**
     * This function checks if in the given side Effects Obj, if _Item is set as Target Entity for any side Effects on
     * other entity set.
     *
     * @param sideEffectsMap
     * @param oEntitySetContext
     * @returns Length of sideEffectsArray where current Entity is set as Target Entity
     */
    checkIfEntityExistsAsTargetEntity: (sideEffectsMap, oEntitySetContext) => {
      const ownerEntityType = oEntitySetContext.getProperty("$Type");
      const sideEffectsOnOtherEntity = Object.values(sideEffectsMap).filter(obj => {
        return obj.name.indexOf(ownerEntityType) == -1;
      });
      const entitySetName = oEntitySetContext.getPath().split("/").pop();
      const sideEffectsWithCurrentEntityAsTarget = sideEffectsOnOtherEntity.filter(obj => {
        const targetEntitiesArray = obj.sideEffects.TargetEntities;
        return targetEntitiesArray !== null && targetEntitiesArray !== void 0 && targetEntitiesArray.filter(innerObj => innerObj["$NavigationPropertyPath"] === entitySetName).length ? obj : false;
      });
      return sideEffectsWithCurrentEntityAsTarget.length;
    },
    /**
     * Upon updating the field, array of immediate and deferred side effects for that field are created.
     * If there are any failed side effects for that context, they will also be used to generate the map.
     * If the field has text associated with it, then add it to request side effects.
     *
     * @param mParams
     * @param mParams.oController Controller
     * @param mParams.oFieldPromise Promise to update field
     * @param mParams.sideEffectMap SideEffectsMap for the field
     * @param mParams.textPaths TextPaths of the field if any
     * @param mParams.groupId Group Id to used to group requests
     * @param mParams.key KeyValue of the field
     * @param mParams.oEntitySetContext EntitySetcontext
     * @param mParams.oMetaModel Metamodel data
     * @param mParams.selectedContext Selected row context
     * @param mParams.deferredTargetsForAQualifiedName Deferred targets data
     * @returns Promise for all immediately requested side effects.
     */
    handleMassEditFieldUpdateAndRequestSideEffects: async function (mParams) {
      const {
        oController,
        oFieldPromise,
        sideEffectsMap,
        textPaths,
        groupId,
        key,
        oEntitySetContext,
        oMetaModel,
        oSelectedContext,
        deferredTargetsForAQualifiedName
      } = mParams;
      const immediateSideEffectsPromises = [oFieldPromise];
      const ownerEntityType = oEntitySetContext.getProperty("$Type");
      const oAppComponent = CommonUtils.getAppComponent(oController.getView());
      const oSideEffectsService = oAppComponent.getSideEffectsService();
      const isSideEffectsWithCurrentEntityAsTarget = MassEditHelper.checkIfEntityExistsAsTargetEntity(sideEffectsMap, oEntitySetContext);
      if (sideEffectsMap) {
        const allEntityTypesWithQualifier = Object.keys(sideEffectsMap);
        const sideEffectsDataForField = Object.values(sideEffectsMap);
        const mVisitedSideEffects = {};
        deferredTargetsForAQualifiedName[key] = {};
        for (const [index, data] of sideEffectsDataForField.entries()) {
          const entityTypeWithQualifier = allEntityTypesWithQualifier[index];
          const sEntityType = entityTypeWithQualifier.split("#")[0];
          const oContext = oController._sideEffects.getContextForSideEffects(oSelectedContext, sEntityType);
          data.context = oContext;
          const allFailedSideEffects = oController._sideEffects.getRegisteredFailedRequests();
          const aFailedSideEffects = allFailedSideEffects[oContext.getPath()];
          oController._sideEffects.unregisterFailedSideEffectsForAContext(oContext);
          let sideEffectsForCurrentContext = [data.sideEffects];
          sideEffectsForCurrentContext = aFailedSideEffects && aFailedSideEffects.length ? sideEffectsForCurrentContext.concat(aFailedSideEffects) : sideEffectsForCurrentContext;
          mVisitedSideEffects[oContext] = {};
          for (const aSideEffect of sideEffectsForCurrentContext) {
            if (!mVisitedSideEffects[oContext].hasOwnProperty(aSideEffect.fullyQualifiedName)) {
              mVisitedSideEffects[oContext][aSideEffect.fullyQualifiedName] = true;
              let aImmediateTargets = [],
                allTargets = [],
                triggerActionName;
              const fnGetImmediateTargetsAndActions = async function (mSideEffect) {
                const {
                  TargetProperties: aTargetProperties,
                  TargetEntities: aTargetEntities
                } = mSideEffect;
                const sideEffectEntityType = mSideEffect.fullyQualifiedName.split("@")[0];
                const targetsArrayForAllProperties = await MassEditHelper.fnGetTargetsForMassEdit(mSideEffect, oEntitySetContext, sideEffectEntityType, oMetaModel);
                aImmediateTargets = targetsArrayForAllProperties[0];
                allTargets = (aTargetProperties || []).concat(aTargetEntities || []);
                const actionName = mSideEffect.TriggerAction;
                const aDeferredTargets = allTargets.filter(target => {
                  return !aImmediateTargets.includes(target);
                });
                deferredTargetsForAQualifiedName[key][mSideEffect.fullyQualifiedName] = {
                  aTargets: aDeferredTargets,
                  oContext: oContext,
                  mSideEffect
                };

                // if entity is other than items table then action is defered
                if (actionName && sideEffectEntityType === ownerEntityType) {
                  // static action is on collection, so we defer it, else add to immediate requests array
                  const isStaticAction = TableHelper._isStaticAction(oMetaModel.getObject(`/${actionName}`), actionName);
                  if (!isStaticAction) {
                    triggerActionName = actionName;
                  } else {
                    deferredTargetsForAQualifiedName[key][mSideEffect.fullyQualifiedName]["TriggerAction"] = actionName;
                  }
                } else {
                  deferredTargetsForAQualifiedName[key][mSideEffect.fullyQualifiedName]["TriggerAction"] = actionName;
                }
                if (isSideEffectsWithCurrentEntityAsTarget) {
                  aImmediateTargets = [];
                }
                return {
                  aTargets: aImmediateTargets,
                  TriggerAction: triggerActionName
                };
              };
              immediateSideEffectsPromises.push(oController._sideEffects.requestSideEffects(aSideEffect, oContext, groupId, fnGetImmediateTargetsAndActions));
            }
          }
        }
      }
      if (textPaths !== null && textPaths !== void 0 && textPaths[key] && textPaths[key].length) {
        immediateSideEffectsPromises.push(oSideEffectsService.requestSideEffects(textPaths[key], oSelectedContext, groupId));
      }
      return Promise.allSettled(immediateSideEffectsPromises);
    },
    /**
     * Create the mass edit dialog.
     *
     * @param oTable Instance of Table
     * @param aContexts Contexts for mass edit
     * @param oController Controller for the view
     * @returns Promise returning instance of dialog.
     */
    createDialog: async function (oTable, aContexts, oController) {
      const sFragmentName = "sap/fe/core/controls/massEdit/MassEditDialog",
        aDataArray = [],
        oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core"),
        oDefaultValues = MassEditHelper.getDefaultTextsForDialog(oResourceBundle, aContexts.length, oTable),
        oDataFieldModel = MassEditHelper.prepareDataForDialog(oTable, aContexts, aDataArray),
        dialogContext = MassEditHelper.getDialogContext(oTable),
        oDialogDataModel = MassEditHelper.setRuntimeModelOnDialog(aContexts, aDataArray, oDefaultValues, dialogContext),
        model = oTable.getModel(),
        metaModel = model.getMetaModel(),
        itemsModel = new TemplateModel(oDataFieldModel.getData(), metaModel);
      const oFragment = XMLTemplateProcessor.loadTemplate(sFragmentName, "fragment");
      const oCreatedFragment = await Promise.resolve(XMLPreprocessor.process(oFragment, {
        name: sFragmentName
      }, {
        bindingContexts: {
          dataFieldModel: itemsModel.createBindingContext("/"),
          metaModel: metaModel.createBindingContext("/"),
          contextPath: metaModel.createBindingContext(metaModel.getMetaPath(dialogContext.getPath()))
        },
        models: {
          dataFieldModel: itemsModel,
          metaModel: metaModel,
          contextPath: metaModel
        }
      }));
      const oDialogContent = await Fragment.load({
        definition: oCreatedFragment
      });
      const oDialog = new Dialog({
        resizable: true,
        title: oDefaultValues.massEditTitle,
        content: [oDialogContent],
        afterOpen: MassEditHelper.onDialogOpen,
        beginButton: new Button({
          text: MassEditHelper.helpers.getExpBindingForApplyButtonTxt(oDefaultValues, oDataFieldModel.getObject("/")),
          type: "Emphasized",
          press: async function (oEvent) {
            var _oController$getView6, _oController$getView7;
            messageHandling.removeBoundTransitionMessages();
            messageHandling.removeUnboundTransitionMessages();
            (_oController$getView6 = oController.getView()) === null || _oController$getView6 === void 0 ? void 0 : (_oController$getView7 = _oController$getView6.getBindingContext("internal")) === null || _oController$getView7 === void 0 ? void 0 : _oController$getView7.setProperty("skipPatchHandlers", true);
            const oInDialog = oEvent.getSource().getParent();
            const oModel = oInDialog.getModel("fieldsInfo");
            const aResults = oModel.getProperty("/results");
            const oMetaModel = oTable && oTable.getModel().getMetaModel(),
              sCurrentEntitySetName = oTable.data("metaPath"),
              oEntitySetContext = oMetaModel.getContext(sCurrentEntitySetName);
            const aSideEffects = await SideEffectsHelper.generateSideEffectsMapFromMetaModel(oMetaModel);
            const errorContexts = [];
            const textPaths = oModel.getProperty("/textPaths");
            const aPropertyReadableInfo = oModel.getProperty("/readablePropertyData");
            let groupId;
            let allSideEffects;
            const massEditPromises = [];
            const failedFieldsData = {};
            const selectedRowsLength = aContexts.length;
            const deferredTargetsForAQualifiedName = {};
            const baseSideEffectsMapArray = MassEditHelper.getSideEffectDataForKey(oEntitySetContext, aSideEffects, oController, aResults);
            //const changePromise: any[] = [];
            //let bReadOnlyField = false;
            //const errorContexts: object[] = [];

            aContexts.forEach(function (oSelectedContext, idx) {
              allSideEffects = [];
              aResults.forEach(async function (oResult) {
                if (!failedFieldsData.hasOwnProperty(oResult.keyValue)) {
                  failedFieldsData[oResult.keyValue] = 0;
                }
                //TODO - Add save implementation for Value Help.
                if (baseSideEffectsMapArray[oResult.keyValue]) {
                  allSideEffects[oResult.keyValue] = baseSideEffectsMapArray[oResult.keyValue];
                }
                if (aPropertyReadableInfo) {
                  aPropertyReadableInfo.some(function (oPropertyInfo) {
                    if (oResult.keyValue === oPropertyInfo.property) {
                      if (oPropertyInfo.type === "Default") {
                        return oPropertyInfo.value === true;
                      } else if (oPropertyInfo.type === "Path" && oPropertyInfo.propertyValue && oPropertyInfo.propertyPath) {
                        return oSelectedContext.getObject(oPropertyInfo.propertyPath) === oPropertyInfo.propertyValue;
                      }
                    }
                  });
                }
                groupId = `$auto.${idx}`;
                const oFieldPromise = oSelectedContext.setProperty(oResult.keyValue, oResult.value, groupId).catch(function (oError) {
                  errorContexts.push(oSelectedContext.getObject());
                  Log.error("Mass Edit: Something went wrong in updating entries.", oError);
                  failedFieldsData[oResult.keyValue] = failedFieldsData[oResult.keyValue] + 1;
                  return Promise.reject({
                    isFieldUpdateFailed: true
                  });
                });
                const dataToUpdateFieldAndSideEffects = {
                  oController,
                  oFieldPromise,
                  sideEffectsMap: baseSideEffectsMapArray[oResult.keyValue],
                  textPaths,
                  groupId,
                  key: oResult.keyValue,
                  oEntitySetContext,
                  oMetaModel,
                  oSelectedContext,
                  deferredTargetsForAQualifiedName
                };
                massEditPromises.push(MassEditHelper.handleMassEditFieldUpdateAndRequestSideEffects(dataToUpdateFieldAndSideEffects));
              });
            });
            await Promise.allSettled(massEditPromises).then(async function () {
              groupId = `$auto.massEditDeferred`;
              const deferredRequests = [];
              const sideEffectsDataForAllKeys = Object.values(deferredTargetsForAQualifiedName);
              const keysWithSideEffects = Object.keys(deferredTargetsForAQualifiedName);
              sideEffectsDataForAllKeys.forEach((aSideEffect, index) => {
                const currentKey = keysWithSideEffects[index];
                if (failedFieldsData[currentKey] !== selectedRowsLength) {
                  const deferredSideEffectsData = Object.values(aSideEffect);
                  deferredSideEffectsData.forEach(req => {
                    const {
                      aTargets,
                      oContext,
                      TriggerAction,
                      mSideEffect
                    } = req;
                    const fnGetDeferredTargets = function () {
                      return aTargets;
                    };
                    const fnGetDeferredTargetsAndActions = function () {
                      return {
                        aTargets: fnGetDeferredTargets(),
                        TriggerAction: TriggerAction
                      };
                    };
                    deferredRequests.push(
                    // if some deferred is rejected, it will be add to failed queue
                    oController._sideEffects.requestSideEffects(mSideEffect, oContext, groupId, fnGetDeferredTargetsAndActions));
                  });
                }
              });
            }).then(function () {
              MassEditHelper.messageHandlingForMassEdit(oTable, aContexts, oController, oInDialog, aResults, errorContexts);
            }).catch(e => {
              MassEditHelper.closeDialog(oDialog);
              return Promise.reject(e);
            });
          }
        }),
        endButton: new Button({
          text: oDefaultValues.cancelButtonText,
          visible: MassEditHelper.helpers.hasEditableFieldsBinding(oDataFieldModel.getObject("/"), true),
          press: function (oEvent) {
            const oInDialog = oEvent.getSource().getParent();
            MassEditHelper.closeDialog(oInDialog);
          }
        })
      });
      oDialog.setModel(oDialogDataModel, "fieldsInfo");
      oDialog.setModel(model);
      oDialog.setBindingContext(dialogContext);
      return oDialog;
    },
    helpers: {
      getBindingExpForHasEditableFields: (fields, editable) => {
        const totalExp = fields.reduce((expression, field) => or(expression, pathInModel("/values/" + field.dataProperty + "/visible", "fieldsInfo")), constant(false));
        return editable ? totalExp : not(totalExp);
      },
      getExpBindingForApplyButtonTxt: (defaultValues, fields) => {
        const editableExp = MassEditHelper.helpers.getBindingExpForHasEditableFields(fields, true);
        const totalExp = ifElse(editableExp, constant(defaultValues.applyButtonText), constant(defaultValues.okButtonText));
        return compileExpression(totalExp);
      },
      hasEditableFieldsBinding: (fields, editable) => {
        return compileExpression(MassEditHelper.helpers.getBindingExpForHasEditableFields(fields, editable));
      }
    }
  };
  return MassEditHelper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNYXNzRWRpdEhlbHBlciIsImluaXRMYXN0TGV2ZWxPZlByb3BlcnR5UGF0aCIsInNQYXRoIiwiYVZhbHVlcyIsImFGaW5hbFBhdGgiLCJpbmRleCIsImFQYXRocyIsInNwbGl0Iiwic0Z1bGxQYXRoIiwiZm9yRWFjaCIsInNQcm9wZXJ0eVBhdGgiLCJnZXRVbmlxdWVWYWx1ZXMiLCJzVmFsdWUiLCJzZWxmIiwidW5kZWZpbmVkIiwiaW5kZXhPZiIsImdldFZhbHVlRm9yTXVsdGlMZXZlbFBhdGgiLCJzRGF0YVByb3BlcnR5UGF0aCIsIm9WYWx1ZXMiLCJyZXN1bHQiLCJhUHJvcGVydHlQYXRocyIsImdldERlZmF1bHRTZWxlY3Rpb25QYXRoQ29tYm9Cb3giLCJhQ29udGV4dHMiLCJsZW5ndGgiLCJvU2VsZWN0ZWRDb250ZXh0IiwiYVByb3BlcnR5VmFsdWVzIiwib0NvbnRleHQiLCJvRGF0YU9iamVjdCIsImdldE9iamVjdCIsInNNdWx0aUxldmVsUGF0aENvbmRpdGlvbiIsImhhc093blByb3BlcnR5IiwicHVzaCIsImFVbmlxdWVQcm9wZXJ0eVZhbHVlcyIsImZpbHRlciIsImdldEhpZGRlblZhbHVlRm9yQ29udGV4dHMiLCJoaWRkZW5WYWx1ZSIsIiRQYXRoIiwic29tZSIsImdldElucHV0VHlwZSIsInByb3BlcnR5SW5mbyIsImRhdGFGaWVsZENvbnZlcnRlZCIsIm9EYXRhTW9kZWxQYXRoIiwiZWRpdFN0eWxlUHJvcGVydGllcyIsImlucHV0VHlwZSIsInNldEVkaXRTdHlsZVByb3BlcnRpZXMiLCJlZGl0U3R5bGUiLCJpc1ZhbGlkRm9yTWFzc0VkaXQiLCJpc011bHRpVmFsdWVGaWVsZCIsImhhc1ZhbHVlSGVscFdpdGhGaXhlZFZhbHVlcyIsImdldElzRmllbGRHcnAiLCIkVHlwZSIsIlRhcmdldCIsInZhbHVlIiwiZ2V0VGV4dFBhdGgiLCJwcm9wZXJ0eSIsInRleHRCaW5kaW5nIiwiZGlzcGxheU1vZGUiLCJkZXNjcmlwdGlvblBhdGgiLCJwYXRoIiwicGFyYW1ldGVycyIsInByb3BzIiwicHJlcGFyZURhdGFGb3JEaWFsb2ciLCJvVGFibGUiLCJhRGF0YUFycmF5Iiwib01ldGFNb2RlbCIsImdldE1vZGVsIiwiZ2V0TWV0YU1vZGVsIiwic0N1cnJlbnRFbnRpdHlTZXROYW1lIiwiZGF0YSIsImFUYWJsZUZpZWxkcyIsImdldFRhYmxlRmllbGRzIiwib0VudGl0eVR5cGVDb250ZXh0IiwiZ2V0Q29udGV4dCIsIm9FbnRpdHlTZXRDb250ZXh0Iiwib0RhdGFNb2RlbE9iamVjdFBhdGgiLCJnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMiLCJvRGF0YUZpZWxkTW9kZWwiLCJKU09OTW9kZWwiLCJvUmVzdWx0Iiwic0xhYmVsVGV4dCIsImJWYWx1ZUhlbHBFbmFibGVkIiwic1VuaXRQcm9wZXJ0eVBhdGgiLCJiVmFsdWVIZWxwRW5hYmxlZEZvclVuaXQiLCJvVGV4dEJpbmRpbmciLCJvQ29sdW1uSW5mbyIsImRhdGFQcm9wZXJ0eSIsIm9Qcm9wZXJ0eUluZm8iLCJsYWJlbCIsInRhcmdldE9iamVjdCIsInRhcmdldEVudGl0eVR5cGUiLCJlbnRpdHlQcm9wZXJ0aWVzIiwib1Byb3BlcnR5IiwibmFtZSIsImdldFRleHRCaW5kaW5nIiwib0ZpZWxkQ29udGV4dCIsImFubm90YXRpb25QYXRoIiwib0RhdGFGaWVsZENvbnZlcnRlZCIsImNvbnZlcnRNZXRhTW9kZWxDb250ZXh0Iiwib1Byb3BlcnR5Q29udGV4dCIsIm9JbnRlcmZhY2UiLCJnZXRJbnRlcmZhY2UiLCJWYWx1ZSIsImVuaGFuY2VEYXRhTW9kZWxQYXRoIiwiYkhpZGRlbkZpZWxkIiwiaXNJbWFnZSIsImNvbnRleHQiLCJnZXRQYXRoIiwiX3R5cGUiLCIkdGFyZ2V0IiwiY2hhcnRQcm9wZXJ0eSIsInRlcm0iLCJpc0FjdGlvbiIsIkFjdGlvbiIsImlzRmllbGRHcnAiLCJoYXNDdXJyZW5jeSIsImhhc1VuaXQiLCJnZXRBc3NvY2lhdGVkVW5pdFByb3BlcnR5UGF0aCIsInVuaXRQcm9wZXJ0eUluZm8iLCJnZXRBc3NvY2lhdGVkVW5pdFByb3BlcnR5IiwiaGFzVmFsdWVIZWxwIiwiaGFzQ29udGV4dERlcGVuZGVudFZIIiwiYW5ub3RhdGlvbnMiLCJDb21tb24iLCJWYWx1ZUxpc3RSZWxldmFudFF1YWxpZmllcnMiLCJwcm9wZXJ0eUZvckZpZWxkQ29udHJvbCIsImV4cEJpbmRpbmciLCJnZXRFZGl0TW9kZSIsImNvbnN0YW50IiwiZWRpdE1vZGVWYWx1ZXMiLCJPYmplY3QiLCJrZXlzIiwiRWRpdE1vZGUiLCJlZGl0TW9kZUlzU3RhdGljIiwiaW5jbHVkZXMiLCJlZGl0YWJsZSIsIkVkaXRhYmxlIiwibmF2UHJvcGVydHlXaXRoVmFsdWVIZWxwIiwicmVsYXRpdmVQYXRoIiwiZ2V0UmVsYXRpdmVQYXRocyIsImlzUmVhZE9ubHkiLCJpc1JlYWRPbmx5RXhwcmVzc2lvbiIsIkNvbW1vblV0aWxzIiwiY29tcHV0ZURpc3BsYXlNb2RlIiwiaXNWYWx1ZUhlbHBFbmFibGVkIiwiaXNWYWx1ZUhlbHBFbmFibGVkRm9yVW5pdCIsInVuaXRQcm9wZXJ0eSIsImlzRmllbGRSZXF1aXJlZCIsImdldFJlcXVpcmVkRXhwcmVzc2lvbiIsImRlZmF1bHRTZWxlY3Rpb25QYXRoIiwiZGVmYXVsdFNlbGVjdGlvblVuaXRQYXRoIiwiZW50aXR5U2V0IiwiZGlzcGxheSIsIm51bGxhYmxlIiwiaXNQcm9wZXJ0eVJlYWRPbmx5IiwiZWRpdE1vZGUiLCJoYXNWSCIsInJ1bnRpbWVQYXRoIiwicHJvcGVydHlQYXRoRm9yVmFsdWVIZWxwIiwidW5pdEluZm8iLCJzZXREYXRhIiwiYUNvbHVtbnMiLCJnZXRDb2x1bW5zIiwiY29sdW1uc0RhdGEiLCJnZXRQYXJlbnQiLCJnZXRUYWJsZURlZmluaXRpb24iLCJjb2x1bW5zIiwibWFwIiwib0NvbHVtbiIsInNEYXRhUHJvcGVydHkiLCJnZXREYXRhUHJvcGVydHkiLCJhUmVhbHRlZENvbHVtbkluZm8iLCJ0eXBlIiwiZ2V0SGVhZGVyIiwiZ2V0RGVmYXVsdFRleHRzRm9yRGlhbG9nIiwib1Jlc291cmNlQnVuZGxlIiwiaVNlbGVjdGVkQ29udGV4dHMiLCJiRGlzcGxheU1vZGUiLCJrZWVwRXhpc3RpbmdQcmVmaXgiLCJsZWF2ZUJsYW5rVmFsdWUiLCJjbGVhckZpZWxkVmFsdWUiLCJtYXNzRWRpdFRpdGxlIiwiZ2V0VGV4dCIsInRvU3RyaW5nIiwiYXBwbHlCdXR0b25UZXh0IiwidXNlVmFsdWVIZWxwVmFsdWUiLCJjYW5jZWxCdXR0b25UZXh0Iiwibm9GaWVsZHMiLCJva0J1dHRvblRleHQiLCJzZXREZWZhdWx0VmFsdWVzVG9EaWFsb2ciLCJvRGVmYXVsdFZhbHVlcyIsImJVT01GaWVsZCIsInNJbnB1dFR5cGUiLCJiUHJvcGVydHlSZXF1aXJlZCIsInNTdWZmaXhGb3JLZWVwRXhpc3RpbmciLCJkZWZhdWx0T3B0aW9ucyIsInNlbGVjdE9wdGlvbnNFeGlzdCIsInNlbGVjdE9wdGlvbnMiLCJrZWVwRW50cnkiLCJ0ZXh0Iiwia2V5IiwiZmFsc2VFbnRyeSIsInRleHRJbmZvIiwidHJ1dGh5RW50cnkiLCJ1bnNoaWZ0IiwidmhkRW50cnkiLCJjbGVhckVudHJ5IiwiZW1wdHlFbnRyeSIsImdldFRleHRBcnJhbmdlbWVudEluZm8iLCJzZWxlY3RlZENvbnRleHQiLCJkZXNjcmlwdGlvblZhbHVlIiwiZnVsbFRleHQiLCJMb2ciLCJpbmZvIiwidGV4dEFycmFuZ2VtZW50IiwidmFsdWVQYXRoIiwiZGVzY3JpcHRpb24iLCJpc0VkaXRhYmxlIiwiYW55IiwiYmluZGluZyIsImdldEJpbmRpbmciLCJnZXRFeHRlcm5hbFZhbHVlIiwib25Db250ZXh0RWRpdGFibGVDaGFuZ2UiLCJvRGlhbG9nRGF0YU1vZGVsIiwib2JqZWN0c0ZvclZpc2liaWxpdHkiLCJnZXRQcm9wZXJ0eSIsInNldFByb3BlcnR5IiwidXBkYXRlT25Db250ZXh0Q2hhbmdlIiwibU9Ub1VzZSIsInZhbHVlcyIsImF0dGFjaENoYW5nZSIsImJpbmQiLCJnZXRCb3VuZE9iamVjdCIsIkFueSIsIm1vZGVsIiwic2V0TW9kZWwiLCJzZXRCaW5kaW5nQ29udGV4dCIsImdldEZpZWxkVmlzaWJsaXR5IiwiaXNDb250ZXh0RWRpdGFibGUiLCJzZXRSdW50aW1lTW9kZWxPbkRpYWxvZyIsImRpYWxvZ0NvbnRleHQiLCJhVW5pdERhdGEiLCJhUmVzdWx0cyIsInRleHRQYXRocyIsImFSZWFkT25seUZpZWxkSW5mbyIsIm9EYXRhIiwidW5pdERhdGEiLCJyZXN1bHRzIiwicmVhZGFibGVQcm9wZXJ0eURhdGEiLCJzZWxlY3RlZEtleSIsIm9JbkRhdGEiLCJvVGV4dEluZm8iLCJzUHJvcGVydHlLZXkiLCJzVW5pdFByb3BlcnR5TmFtZSIsIm9EaXN0aW5jdFZhbHVlTWFwIiwib0Rpc3RpbmN0VW5pdE1hcCIsInNNdWx0aUxldmVsUGF0aFZhbHVlIiwiZW50cnkiLCJ1bml0RW50cnkiLCJzTXVsdGlMZXZlbFByb3BQYXRoVmFsdWUiLCJiQ2xlYXJGaWVsZE9yQmxhbmtWYWx1ZUV4aXN0cyIsIm9iaiIsImJDbGVhckZpZWxkT3JCbGFua1VuaXRWYWx1ZUV4aXN0cyIsIm9wZXJhbmRzIiwib3BlcmFuZDEiLCJvcGVyYW5kMiIsInByb3BlcnR5UGF0aCIsInByb3BlcnR5VmFsdWUiLCJ2aXNpYmxlIiwiZ2V0RGlhbG9nQ29udGV4dCIsInRhYmxlIiwiZGlhbG9nIiwidHJhbnNDdHgiLCJnZXRCaW5kaW5nQ29udGV4dCIsImxpc3RCaW5kaW5nIiwiZ2V0Um93QmluZGluZyIsInRyYW5zaWVudExpc3RCaW5kaW5nIiwiYmluZExpc3QiLCIkJHVwZGF0ZUdyb3VwSWQiLCJyZWZyZXNoSW50ZXJuYWwiLCJjcmVhdGUiLCJvbkRpYWxvZ09wZW4iLCJldmVudCIsInNvdXJjZSIsImdldFNvdXJjZSIsImZpZWxkc0luZm9Nb2RlbCIsImNsb3NlRGlhbG9nIiwib0RpYWxvZyIsImNsb3NlIiwiZGVzdHJveSIsIm1lc3NhZ2VIYW5kbGluZ0Zvck1hc3NFZGl0Iiwib0NvbnRyb2xsZXIiLCJvSW5EaWFsb2ciLCJlcnJvckNvbnRleHRzIiwiRHJhZnRTdGF0dXMiLCJGRUxpYnJhcnkiLCJDb3JlIiwiZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlIiwiZ2V0VmlldyIsIl9lZGl0RmxvdyIsImdldE1lc3NhZ2VIYW5kbGVyIiwic2hvd01lc3NhZ2VzIiwib25CZWZvcmVTaG93TWVzc2FnZSIsIm1lc3NhZ2VzIiwic2hvd01lc3NhZ2VQYXJhbWV0ZXJzIiwiZm5HZXRNZXNzYWdlU3VidGl0bGUiLCJtZXNzYWdlSGFuZGxpbmciLCJzZXRNZXNzYWdlU3VidGl0bGUiLCJ1bmJvdW5kRXJyb3JzIiwibWVzc2FnZSIsImdldFRhcmdldCIsInNldERyYWZ0U3RhdHVzIiwiU2F2ZWQiLCJzdWNjZXNzVG9hc3QiLCJNZXNzYWdlVG9hc3QiLCJzaG93IiwiZ2V0U2VsZWN0ZWRDb250ZXh0cyIsIkNsZWFyIiwic2hvd01lc3NhZ2VCb3giLCJzaG93TWVzc2FnZURpYWxvZyIsImlzT3BlbiIsImdldFNpZGVFZmZlY3REYXRhRm9yS2V5IiwiYVNpZGVFZmZlY3RzIiwic093bmVyRW50aXR5VHlwZSIsImJhc2VTaWRlRWZmZWN0c01hcEFycmF5Iiwia2V5VmFsdWUiLCJzaWRlRWZmZWN0c0FycmF5IiwiRmllbGRIZWxwZXIiLCJnZXRTaWRlRWZmZWN0c09uRW50aXR5QW5kUHJvcGVydHkiLCJfc2lkZUVmZmVjdHMiLCJnZXRTaWRlRWZmZWN0c01hcEZvckZpZWxkR3JvdXBzIiwiZm5HZXRQYXRoRm9yU291cmNlUHJvcGVydHkiLCJzRW50aXR5VHlwZSIsInNOYXZpZ2F0aW9uUGF0aCIsInN1YnN0ciIsImxhc3RJbmRleE9mIiwicE93bmVyRW50aXR5IiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZXF1ZXN0T2JqZWN0IiwiZm5HZXRFbnRpdHlUeXBlT2ZPd25lciIsImJhc2VOYXZQYXRoIiwidGFyZ2V0RW50aXR5IiwiYVRhcmdldHMiLCJvd25lckVudGl0eVR5cGUiLCJwT3duZXIiLCIkUGFydG5lciIsIm93bmVyTmF2UGF0aCIsImVudGl0eU9iak9mT3duZXJQYXJ0bmVyIiwiZW50aXR5VHlwZU9mT3duZXJQYXJ0bmVyIiwiZm5HZXRUYXJnZXRzRm9yTWFzc0VkaXQiLCJzaWRlRWZmZWN0c0RhdGEiLCJUYXJnZXRQcm9wZXJ0aWVzIiwiYVRhcmdldFByb3BlcnRpZXMiLCJUYXJnZXRFbnRpdGllcyIsImFUYXJnZXRFbnRpdGllcyIsImFQcm9taXNlcyIsInRhcmdldFByb3AiLCJ0aGVuIiwicmVzdWx0RW50aXR5IiwiYWxsIiwiY2hlY2tJZkVudGl0eUV4aXN0c0FzVGFyZ2V0RW50aXR5Iiwic2lkZUVmZmVjdHNNYXAiLCJzaWRlRWZmZWN0c09uT3RoZXJFbnRpdHkiLCJlbnRpdHlTZXROYW1lIiwicG9wIiwic2lkZUVmZmVjdHNXaXRoQ3VycmVudEVudGl0eUFzVGFyZ2V0IiwidGFyZ2V0RW50aXRpZXNBcnJheSIsInNpZGVFZmZlY3RzIiwiaW5uZXJPYmoiLCJoYW5kbGVNYXNzRWRpdEZpZWxkVXBkYXRlQW5kUmVxdWVzdFNpZGVFZmZlY3RzIiwibVBhcmFtcyIsIm9GaWVsZFByb21pc2UiLCJncm91cElkIiwiZGVmZXJyZWRUYXJnZXRzRm9yQVF1YWxpZmllZE5hbWUiLCJpbW1lZGlhdGVTaWRlRWZmZWN0c1Byb21pc2VzIiwib0FwcENvbXBvbmVudCIsImdldEFwcENvbXBvbmVudCIsIm9TaWRlRWZmZWN0c1NlcnZpY2UiLCJnZXRTaWRlRWZmZWN0c1NlcnZpY2UiLCJpc1NpZGVFZmZlY3RzV2l0aEN1cnJlbnRFbnRpdHlBc1RhcmdldCIsImFsbEVudGl0eVR5cGVzV2l0aFF1YWxpZmllciIsInNpZGVFZmZlY3RzRGF0YUZvckZpZWxkIiwibVZpc2l0ZWRTaWRlRWZmZWN0cyIsImVudHJpZXMiLCJlbnRpdHlUeXBlV2l0aFF1YWxpZmllciIsImdldENvbnRleHRGb3JTaWRlRWZmZWN0cyIsImFsbEZhaWxlZFNpZGVFZmZlY3RzIiwiZ2V0UmVnaXN0ZXJlZEZhaWxlZFJlcXVlc3RzIiwiYUZhaWxlZFNpZGVFZmZlY3RzIiwidW5yZWdpc3RlckZhaWxlZFNpZGVFZmZlY3RzRm9yQUNvbnRleHQiLCJzaWRlRWZmZWN0c0ZvckN1cnJlbnRDb250ZXh0IiwiY29uY2F0IiwiYVNpZGVFZmZlY3QiLCJmdWxseVF1YWxpZmllZE5hbWUiLCJhSW1tZWRpYXRlVGFyZ2V0cyIsImFsbFRhcmdldHMiLCJ0cmlnZ2VyQWN0aW9uTmFtZSIsImZuR2V0SW1tZWRpYXRlVGFyZ2V0c0FuZEFjdGlvbnMiLCJtU2lkZUVmZmVjdCIsInNpZGVFZmZlY3RFbnRpdHlUeXBlIiwidGFyZ2V0c0FycmF5Rm9yQWxsUHJvcGVydGllcyIsImFjdGlvbk5hbWUiLCJUcmlnZ2VyQWN0aW9uIiwiYURlZmVycmVkVGFyZ2V0cyIsInRhcmdldCIsImlzU3RhdGljQWN0aW9uIiwiVGFibGVIZWxwZXIiLCJfaXNTdGF0aWNBY3Rpb24iLCJyZXF1ZXN0U2lkZUVmZmVjdHMiLCJhbGxTZXR0bGVkIiwiY3JlYXRlRGlhbG9nIiwic0ZyYWdtZW50TmFtZSIsIm1ldGFNb2RlbCIsIml0ZW1zTW9kZWwiLCJUZW1wbGF0ZU1vZGVsIiwiZ2V0RGF0YSIsIm9GcmFnbWVudCIsIlhNTFRlbXBsYXRlUHJvY2Vzc29yIiwibG9hZFRlbXBsYXRlIiwib0NyZWF0ZWRGcmFnbWVudCIsIlhNTFByZXByb2Nlc3NvciIsInByb2Nlc3MiLCJiaW5kaW5nQ29udGV4dHMiLCJkYXRhRmllbGRNb2RlbCIsImNyZWF0ZUJpbmRpbmdDb250ZXh0IiwiY29udGV4dFBhdGgiLCJnZXRNZXRhUGF0aCIsIm1vZGVscyIsIm9EaWFsb2dDb250ZW50IiwiRnJhZ21lbnQiLCJsb2FkIiwiZGVmaW5pdGlvbiIsIkRpYWxvZyIsInJlc2l6YWJsZSIsInRpdGxlIiwiY29udGVudCIsImFmdGVyT3BlbiIsImJlZ2luQnV0dG9uIiwiQnV0dG9uIiwiaGVscGVycyIsImdldEV4cEJpbmRpbmdGb3JBcHBseUJ1dHRvblR4dCIsInByZXNzIiwib0V2ZW50IiwicmVtb3ZlQm91bmRUcmFuc2l0aW9uTWVzc2FnZXMiLCJyZW1vdmVVbmJvdW5kVHJhbnNpdGlvbk1lc3NhZ2VzIiwib01vZGVsIiwiU2lkZUVmZmVjdHNIZWxwZXIiLCJnZW5lcmF0ZVNpZGVFZmZlY3RzTWFwRnJvbU1ldGFNb2RlbCIsImFQcm9wZXJ0eVJlYWRhYmxlSW5mbyIsImFsbFNpZGVFZmZlY3RzIiwibWFzc0VkaXRQcm9taXNlcyIsImZhaWxlZEZpZWxkc0RhdGEiLCJzZWxlY3RlZFJvd3NMZW5ndGgiLCJpZHgiLCJjYXRjaCIsIm9FcnJvciIsImVycm9yIiwicmVqZWN0IiwiaXNGaWVsZFVwZGF0ZUZhaWxlZCIsImRhdGFUb1VwZGF0ZUZpZWxkQW5kU2lkZUVmZmVjdHMiLCJkZWZlcnJlZFJlcXVlc3RzIiwic2lkZUVmZmVjdHNEYXRhRm9yQWxsS2V5cyIsImtleXNXaXRoU2lkZUVmZmVjdHMiLCJjdXJyZW50S2V5IiwiZGVmZXJyZWRTaWRlRWZmZWN0c0RhdGEiLCJyZXEiLCJmbkdldERlZmVycmVkVGFyZ2V0cyIsImZuR2V0RGVmZXJyZWRUYXJnZXRzQW5kQWN0aW9ucyIsImUiLCJlbmRCdXR0b24iLCJoYXNFZGl0YWJsZUZpZWxkc0JpbmRpbmciLCJnZXRCaW5kaW5nRXhwRm9ySGFzRWRpdGFibGVGaWVsZHMiLCJmaWVsZHMiLCJ0b3RhbEV4cCIsInJlZHVjZSIsImV4cHJlc3Npb24iLCJmaWVsZCIsIm9yIiwicGF0aEluTW9kZWwiLCJub3QiLCJkZWZhdWx0VmFsdWVzIiwiZWRpdGFibGVFeHAiLCJpZkVsc2UiLCJjb21waWxlRXhwcmVzc2lvbiJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiTWFzc0VkaXRIZWxwZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgdHlwZSB7XG5cdEZpZWxkU2lkZUVmZmVjdERpY3Rpb25hcnksXG5cdE1hc3NFZGl0RmllbGRTaWRlRWZmZWN0RGljdGlvbmFyeSxcblx0TWFzc0VkaXRGaWVsZFNpZGVFZmZlY3RQcm9wZXJ0eVR5cGVcbn0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL1NpZGVFZmZlY3RzXCI7XG5pbXBvcnQgdHlwZSB7IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiwgQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IHsgY29tcGlsZUV4cHJlc3Npb24sIGNvbnN0YW50LCBpZkVsc2UsIG5vdCwgb3IsIHBhdGhJbk1vZGVsIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCBGRUxpYnJhcnkgZnJvbSBcInNhcC9mZS9jb3JlL2xpYnJhcnlcIjtcbmltcG9ydCB0eXBlIFBhZ2VDb250cm9sbGVyIGZyb20gXCJzYXAvZmUvY29yZS9QYWdlQ29udHJvbGxlclwiO1xuaW1wb3J0IHR5cGUgeyBPRGF0YVNpZGVFZmZlY3RzVHlwZSwgU2lkZUVmZmVjdHNUYXJnZXRFbnRpdHlUeXBlLCBTaWRlRWZmZWN0c1R5cGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvc2VydmljZXMvU2lkZUVmZmVjdHNTZXJ2aWNlRmFjdG9yeVwiO1xuaW1wb3J0IFRlbXBsYXRlTW9kZWwgZnJvbSBcInNhcC9mZS9jb3JlL1RlbXBsYXRlTW9kZWxcIjtcbmltcG9ydCB0eXBlIHsgRGF0YU1vZGVsT2JqZWN0UGF0aCB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL0RhdGFNb2RlbFBhdGhIZWxwZXJcIjtcbmltcG9ydCB7IGVuaGFuY2VEYXRhTW9kZWxQYXRoLCBnZXRSZWxhdGl2ZVBhdGhzIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRGF0YU1vZGVsUGF0aEhlbHBlclwiO1xuaW1wb3J0IHtcblx0Z2V0QXNzb2NpYXRlZFVuaXRQcm9wZXJ0eSxcblx0Z2V0QXNzb2NpYXRlZFVuaXRQcm9wZXJ0eVBhdGgsXG5cdGhhc0N1cnJlbmN5LFxuXHRoYXNVbml0LFxuXHRoYXNWYWx1ZUhlbHAsXG5cdGhhc1ZhbHVlSGVscFdpdGhGaXhlZFZhbHVlc1xufSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9Qcm9wZXJ0eUhlbHBlclwiO1xuaW1wb3J0IEZpZWxkSGVscGVyIGZyb20gXCJzYXAvZmUvbWFjcm9zL2ZpZWxkL0ZpZWxkSGVscGVyXCI7XG5pbXBvcnQgeyBnZXRUZXh0QmluZGluZywgc2V0RWRpdFN0eWxlUHJvcGVydGllcyB9IGZyb20gXCJzYXAvZmUvbWFjcm9zL2ZpZWxkL0ZpZWxkVGVtcGxhdGluZ1wiO1xuaW1wb3J0IHR5cGUgeyBGaWVsZFByb3BlcnRpZXMgfSBmcm9tIFwic2FwL2ZlL21hY3Jvcy9pbnRlcm5hbC9JbnRlcm5hbEZpZWxkXCI7XG5pbXBvcnQgVGFibGVIZWxwZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvdGFibGUvVGFibGVIZWxwZXJcIjtcbmltcG9ydCBCdXR0b24gZnJvbSBcInNhcC9tL0J1dHRvblwiO1xuaW1wb3J0IERpYWxvZyBmcm9tIFwic2FwL20vRGlhbG9nXCI7XG5pbXBvcnQgTWVzc2FnZVRvYXN0IGZyb20gXCJzYXAvbS9NZXNzYWdlVG9hc3RcIjtcbmltcG9ydCBDb3JlIGZyb20gXCJzYXAvdWkvY29yZS9Db3JlXCI7XG5pbXBvcnQgRnJhZ21lbnQgZnJvbSBcInNhcC91aS9jb3JlL0ZyYWdtZW50XCI7XG5pbXBvcnQgWE1MUHJlcHJvY2Vzc29yIGZyb20gXCJzYXAvdWkvY29yZS91dGlsL1hNTFByZXByb2Nlc3NvclwiO1xuaW1wb3J0IFhNTFRlbXBsYXRlUHJvY2Vzc29yIGZyb20gXCJzYXAvdWkvY29yZS9YTUxUZW1wbGF0ZVByb2Nlc3NvclwiO1xuaW1wb3J0IEVkaXRNb2RlIGZyb20gXCJzYXAvdWkvbWRjL2VudW0vRWRpdE1vZGVcIjtcbmltcG9ydCB0eXBlIFRhYmxlIGZyb20gXCJzYXAvdWkvbWRjL1RhYmxlXCI7XG5pbXBvcnQgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Db250ZXh0XCI7XG5pbXBvcnQgdHlwZSBPRGF0YUxpc3RCaW5kaW5nIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFMaXN0QmluZGluZ1wiO1xuaW1wb3J0IHR5cGUgT0RhdGFNZXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1ldGFNb2RlbFwiO1xuaW1wb3J0IG1lc3NhZ2VIYW5kbGluZyBmcm9tIFwiLi4vY29udHJvbGxlcmV4dGVuc2lvbnMvbWVzc2FnZUhhbmRsZXIvbWVzc2FnZUhhbmRsaW5nXCI7XG5pbXBvcnQgdHlwZSB7IEFueVR5cGUgfSBmcm9tIFwiLi4vY29udHJvbHMvQW55XCI7XG5pbXBvcnQgQW55IGZyb20gXCIuLi9jb250cm9scy9BbnlcIjtcbmltcG9ydCB7IGNvbnZlcnRNZXRhTW9kZWxDb250ZXh0LCBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMgfSBmcm9tIFwiLi4vY29udmVydGVycy9NZXRhTW9kZWxDb252ZXJ0ZXJcIjtcbmltcG9ydCB7IGlzUmVhZE9ubHlFeHByZXNzaW9uIH0gZnJvbSBcIi4uL3RlbXBsYXRpbmcvRmllbGRDb250cm9sSGVscGVyXCI7XG5pbXBvcnQgeyBnZXRFZGl0TW9kZSwgZ2V0UmVxdWlyZWRFeHByZXNzaW9uLCBpc011bHRpVmFsdWVGaWVsZCB9IGZyb20gXCIuLi90ZW1wbGF0aW5nL1VJRm9ybWF0dGVyc1wiO1xuaW1wb3J0IHR5cGUgeyBJbnRlcm5hbE1vZGVsQ29udGV4dCB9IGZyb20gXCIuL01vZGVsSGVscGVyXCI7XG5pbXBvcnQgU2lkZUVmZmVjdHNIZWxwZXIgZnJvbSBcIi4vU2lkZUVmZmVjdHNIZWxwZXJcIjtcblxuLyogVGhpcyBjbGFzcyBjb250YWlucyBoZWxwZXJzIHRvIGJlIHVzZWQgZm9yIG1hc3MgZWRpdCBmdW5jdGlvbmFsaXR5ICovXG50eXBlIFRleHRBcnJhbmdlbWVudEluZm8gPSB7XG5cdHRleHRBcnJhbmdlbWVudDogc3RyaW5nO1xuXHR2YWx1ZVBhdGg6IHN0cmluZztcblx0ZGVzY3JpcHRpb25QYXRoPzogc3RyaW5nO1xuXHR2YWx1ZTogc3RyaW5nO1xuXHRkZXNjcmlwdGlvbjogc3RyaW5nO1xuXHRmdWxsVGV4dDogc3RyaW5nO1xufTtcblxudHlwZSBCaW5kaW5nSW5mbyA9IHtcblx0cGF0aD86IHN0cmluZztcblx0bW9kZWw/OiBzdHJpbmcgfCBvYmplY3Q7XG5cdHBhcmFtZXRlcnM/OiBBcnJheTxCaW5kaW5nSW5mbz47XG59O1xuXG5leHBvcnQgdHlwZSBEYXRhVG9VcGRhdGVGaWVsZEFuZFNpZGVFZmZlY3RzVHlwZSA9IHtcblx0b0NvbnRyb2xsZXI6IFBhZ2VDb250cm9sbGVyO1xuXHRvRmllbGRQcm9taXNlOiBQcm9taXNlPGFueT47XG5cdHNpZGVFZmZlY3RzTWFwOiBNYXNzRWRpdEZpZWxkU2lkZUVmZmVjdERpY3Rpb25hcnkgfCBGaWVsZFNpZGVFZmZlY3REaWN0aW9uYXJ5O1xuXHR0ZXh0UGF0aHM6IGFueTtcblx0Z3JvdXBJZDogc3RyaW5nO1xuXHRrZXk6IHN0cmluZztcblx0b0VudGl0eVNldENvbnRleHQ6IENvbnRleHQ7XG5cdG9NZXRhTW9kZWw6IGFueTtcblx0b1NlbGVjdGVkQ29udGV4dDogYW55O1xuXHRkZWZlcnJlZFRhcmdldHNGb3JBUXVhbGlmaWVkTmFtZTogYW55O1xufTtcblxuY29uc3QgTWFzc0VkaXRIZWxwZXIgPSB7XG5cdC8qKlxuXHQgKiBJbml0aWFsaXplcyB0aGUgdmFsdWUgYXQgZmluYWwgb3IgZGVlcGVzdCBsZXZlbCBwYXRoIHdpdGggYSBibGFuayBhcnJheS5cblx0ICogUmV0dXJuIGFuIGVtcHR5IGFycmF5IHBvaW50aW5nIHRvIHRoZSBmaW5hbCBvciBkZWVwZXN0IGxldmVsIHBhdGguXG5cdCAqXG5cdCAqIEBwYXJhbSBzUGF0aCBQcm9wZXJ0eSBwYXRoXG5cdCAqIEBwYXJhbSBhVmFsdWVzIEFycmF5IGluc3RhbmNlIHdoZXJlIHRoZSBkZWZhdWx0IGRhdGEgbmVlZHMgdG8gYmUgYWRkZWRcblx0ICogQHJldHVybnMgVGhlIGZpbmFsIHBhdGhcblx0ICovXG5cdGluaXRMYXN0TGV2ZWxPZlByb3BlcnR5UGF0aDogZnVuY3Rpb24gKHNQYXRoOiBzdHJpbmcsIGFWYWx1ZXM6IGFueSAvKiwgdHJhbnNDdHg6IENvbnRleHQgKi8pIHtcblx0XHRsZXQgYUZpbmFsUGF0aDogYW55O1xuXHRcdGxldCBpbmRleCA9IDA7XG5cdFx0Y29uc3QgYVBhdGhzID0gc1BhdGguc3BsaXQoXCIvXCIpO1xuXHRcdGxldCBzRnVsbFBhdGggPSBcIlwiO1xuXHRcdGFQYXRocy5mb3JFYWNoKGZ1bmN0aW9uIChzUHJvcGVydHlQYXRoOiBzdHJpbmcpIHtcblx0XHRcdGlmICghYVZhbHVlc1tzUHJvcGVydHlQYXRoXSAmJiBpbmRleCA9PT0gMCkge1xuXHRcdFx0XHRhVmFsdWVzW3NQcm9wZXJ0eVBhdGhdID0ge307XG5cdFx0XHRcdGFGaW5hbFBhdGggPSBhVmFsdWVzW3NQcm9wZXJ0eVBhdGhdO1xuXHRcdFx0XHRzRnVsbFBhdGggPSBzRnVsbFBhdGggKyBzUHJvcGVydHlQYXRoO1xuXHRcdFx0XHRpbmRleCsrO1xuXHRcdFx0fSBlbHNlIGlmICghYUZpbmFsUGF0aFtzUHJvcGVydHlQYXRoXSkge1xuXHRcdFx0XHRzRnVsbFBhdGggPSBgJHtzRnVsbFBhdGh9LyR7c1Byb3BlcnR5UGF0aH1gO1xuXHRcdFx0XHRpZiAoc0Z1bGxQYXRoICE9PSBzUGF0aCkge1xuXHRcdFx0XHRcdGFGaW5hbFBhdGhbc1Byb3BlcnR5UGF0aF0gPSB7fTtcblx0XHRcdFx0XHRhRmluYWxQYXRoID0gYUZpbmFsUGF0aFtzUHJvcGVydHlQYXRoXTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRhRmluYWxQYXRoW3NQcm9wZXJ0eVBhdGhdID0gW107XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0XHRyZXR1cm4gYUZpbmFsUGF0aDtcblx0fSxcblxuXHQvKipcblx0ICogTWV0aG9kIHRvIGdldCB1bmlxdWUgdmFsdWVzIGZvciBnaXZlbiBhcnJheSB2YWx1ZXMuXG5cdCAqXG5cdCAqIEBwYXJhbSBzVmFsdWUgUHJvcGVydHkgdmFsdWVcblx0ICogQHBhcmFtIGluZGV4IEluZGV4IG9mIHRoZSBwcm9wZXJ0eSB2YWx1ZVxuXHQgKiBAcGFyYW0gc2VsZiBJbnN0YW5jZSBvZiB0aGUgYXJyYXlcblx0ICogQHJldHVybnMgVGhlIHVuaXF1ZSB2YWx1ZVxuXHQgKi9cblx0Z2V0VW5pcXVlVmFsdWVzOiBmdW5jdGlvbiAoc1ZhbHVlOiBzdHJpbmcsIGluZGV4OiBudW1iZXIsIHNlbGY6IGFueVtdKSB7XG5cdFx0cmV0dXJuIHNWYWx1ZSAhPSB1bmRlZmluZWQgJiYgc1ZhbHVlICE9IG51bGwgPyBzZWxmLmluZGV4T2Yoc1ZhbHVlKSA9PT0gaW5kZXggOiB1bmRlZmluZWQ7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIHByb3BlcnR5IHZhbHVlIGZvciBhIG11bHRpLWxldmVsIHBhdGggKGZvciBleGFtcGxlOiBfTWF0ZXJpYWxzL01hdGVyaWFsX0RldGFpbHMgZ2V0cyB0aGUgdmFsdWUgb2YgTWF0ZXJpYWxfRGV0YWlscyB1bmRlciBfTWF0ZXJpYWxzIE9iamVjdCkuXG5cdCAqIFJldHVybnMgdGhlIHByb3BlcnR5VmFsdWUsIHdoaWNoIGNhbiBiZSBvZiBhbnkgdHlwZSAoc3RyaW5nLCBudW1iZXIsIGV0Yy4uKS5cblx0ICpcblx0ICogQHBhcmFtIHNEYXRhUHJvcGVydHlQYXRoIFByb3BlcnR5IHBhdGhcblx0ICogQHBhcmFtIG9WYWx1ZXMgT2JqZWN0IG9mIHByb3BlcnR5IHZhbHVlc1xuXHQgKiBAcmV0dXJucyBUaGUgcHJvcGVydHkgdmFsdWVcblx0ICovXG5cdGdldFZhbHVlRm9yTXVsdGlMZXZlbFBhdGg6IGZ1bmN0aW9uIChzRGF0YVByb3BlcnR5UGF0aDogc3RyaW5nLCBvVmFsdWVzOiBhbnkpIHtcblx0XHRsZXQgcmVzdWx0OiBhbnk7XG5cdFx0aWYgKHNEYXRhUHJvcGVydHlQYXRoICYmIHNEYXRhUHJvcGVydHlQYXRoLmluZGV4T2YoXCIvXCIpID4gMCkge1xuXHRcdFx0Y29uc3QgYVByb3BlcnR5UGF0aHMgPSBzRGF0YVByb3BlcnR5UGF0aC5zcGxpdChcIi9cIik7XG5cdFx0XHRhUHJvcGVydHlQYXRocy5mb3JFYWNoKGZ1bmN0aW9uIChzUGF0aDogc3RyaW5nKSB7XG5cdFx0XHRcdHJlc3VsdCA9IG9WYWx1ZXMgJiYgb1ZhbHVlc1tzUGF0aF0gPyBvVmFsdWVzW3NQYXRoXSA6IHJlc3VsdCAmJiByZXN1bHRbc1BhdGhdO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIGtleSBwYXRoIGZvciB0aGUga2V5IG9mIGEgY29tYm8gYm94IHRoYXQgbXVzdCBiZSBzZWxlY3RlZCBpbml0aWFsbHkgd2hlbiB0aGUgZGlhbG9nIG9wZW5zOlxuXHQgKiA9PiBJZiBwcm9wZXJ0eVZhbHVlIGZvciBhbGwgc2VsZWN0ZWQgY29udGV4dHMgaXMgZGlmZmVyZW50LCB0aGVuIDwgS2VlcCBFeGlzdGluZyBWYWx1ZXMgPiBpcyBwcmVzZWxlY3RlZC5cblx0ICogPT4gSWYgcHJvcGVydHlWYWx1ZSBmb3IgYWxsIHNlbGVjdGVkIGNvbnRleHRzIGlzIHRoZSBzYW1lLCB0aGVuIHRoZSBwcm9wZXJ0eVZhbHVlIGlzIHByZXNlbGVjdGVkLlxuXHQgKiA9PiBJZiBwcm9wZXJ0eVZhbHVlIGZvciBhbGwgc2VsZWN0ZWQgY29udGV4dHMgaXMgZW1wdHksIHRoZW4gPCBMZWF2ZSBCbGFuayA+IGlzIHByZXNlbGVjdGVkLlxuXHQgKlxuXHQgKlxuXHQgKiBAcGFyYW0gYUNvbnRleHRzIENvbnRleHRzIGZvciBtYXNzIGVkaXRcblx0ICogQHBhcmFtIHNEYXRhUHJvcGVydHlQYXRoIERhdGEgcHJvcGVydHkgcGF0aFxuXHQgKiBAcmV0dXJucyBUaGUga2V5IHBhdGhcblx0ICovXG5cdGdldERlZmF1bHRTZWxlY3Rpb25QYXRoQ29tYm9Cb3g6IGZ1bmN0aW9uIChhQ29udGV4dHM6IGFueVtdLCBzRGF0YVByb3BlcnR5UGF0aDogc3RyaW5nKSB7XG5cdFx0bGV0IHJlc3VsdDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXHRcdGlmIChzRGF0YVByb3BlcnR5UGF0aCAmJiBhQ29udGV4dHMubGVuZ3RoID4gMCkge1xuXHRcdFx0Y29uc3Qgb1NlbGVjdGVkQ29udGV4dCA9IGFDb250ZXh0cyxcblx0XHRcdFx0YVByb3BlcnR5VmFsdWVzOiBhbnlbXSA9IFtdO1xuXHRcdFx0b1NlbGVjdGVkQ29udGV4dC5mb3JFYWNoKGZ1bmN0aW9uIChvQ29udGV4dDogYW55KSB7XG5cdFx0XHRcdGNvbnN0IG9EYXRhT2JqZWN0ID0gb0NvbnRleHQuZ2V0T2JqZWN0KCk7XG5cdFx0XHRcdGNvbnN0IHNNdWx0aUxldmVsUGF0aENvbmRpdGlvbiA9XG5cdFx0XHRcdFx0c0RhdGFQcm9wZXJ0eVBhdGguaW5kZXhPZihcIi9cIikgPiAtMSAmJiBvRGF0YU9iamVjdC5oYXNPd25Qcm9wZXJ0eShzRGF0YVByb3BlcnR5UGF0aC5zcGxpdChcIi9cIilbMF0pO1xuXHRcdFx0XHRpZiAob0NvbnRleHQgJiYgKG9EYXRhT2JqZWN0Lmhhc093blByb3BlcnR5KHNEYXRhUHJvcGVydHlQYXRoKSB8fCBzTXVsdGlMZXZlbFBhdGhDb25kaXRpb24pKSB7XG5cdFx0XHRcdFx0YVByb3BlcnR5VmFsdWVzLnB1c2gob0NvbnRleHQuZ2V0T2JqZWN0KHNEYXRhUHJvcGVydHlQYXRoKSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0Y29uc3QgYVVuaXF1ZVByb3BlcnR5VmFsdWVzID0gYVByb3BlcnR5VmFsdWVzLmZpbHRlcihNYXNzRWRpdEhlbHBlci5nZXRVbmlxdWVWYWx1ZXMpO1xuXHRcdFx0aWYgKGFVbmlxdWVQcm9wZXJ0eVZhbHVlcy5sZW5ndGggPiAxKSB7XG5cdFx0XHRcdHJlc3VsdCA9IGBEZWZhdWx0LyR7c0RhdGFQcm9wZXJ0eVBhdGh9YDtcblx0XHRcdH0gZWxzZSBpZiAoYVVuaXF1ZVByb3BlcnR5VmFsdWVzLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0XHRyZXN1bHQgPSBgRW1wdHkvJHtzRGF0YVByb3BlcnR5UGF0aH1gO1xuXHRcdFx0fSBlbHNlIGlmIChhVW5pcXVlUHJvcGVydHlWYWx1ZXMubGVuZ3RoID09PSAxKSB7XG5cdFx0XHRcdHJlc3VsdCA9IGAke3NEYXRhUHJvcGVydHlQYXRofS8ke2FVbmlxdWVQcm9wZXJ0eVZhbHVlc1swXX1gO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDaGVja3MgaGlkZGVuIGFubm90YXRpb24gdmFsdWUgW2JvdGggc3RhdGljIGFuZCBwYXRoIGJhc2VkXSBmb3IgdGFibGUncyBzZWxlY3RlZCBjb250ZXh0LlxuXHQgKlxuXHQgKiBAcGFyYW0gaGlkZGVuVmFsdWUgSGlkZGVuIGFubm90YXRpb24gdmFsdWUgLyBwYXRoIGZvciBmaWVsZFxuXHQgKiBAcGFyYW0gYUNvbnRleHRzIENvbnRleHRzIGZvciBtYXNzIGVkaXRcblx0ICogQHJldHVybnMgVGhlIGhpZGRlbiBhbm5vdGF0aW9uIHZhbHVlXG5cdCAqL1xuXHRnZXRIaWRkZW5WYWx1ZUZvckNvbnRleHRzOiBmdW5jdGlvbiAoaGlkZGVuVmFsdWU6IGFueSwgYUNvbnRleHRzOiBhbnlbXSkge1xuXHRcdGlmIChoaWRkZW5WYWx1ZSAmJiBoaWRkZW5WYWx1ZS4kUGF0aCkge1xuXHRcdFx0cmV0dXJuICFhQ29udGV4dHMuc29tZShmdW5jdGlvbiAob1NlbGVjdGVkQ29udGV4dDogYW55KSB7XG5cdFx0XHRcdHJldHVybiBvU2VsZWN0ZWRDb250ZXh0LmdldE9iamVjdChoaWRkZW5WYWx1ZS4kUGF0aCkgPT09IGZhbHNlO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdHJldHVybiBoaWRkZW5WYWx1ZTtcblx0fSxcblxuXHRnZXRJbnB1dFR5cGU6IGZ1bmN0aW9uIChwcm9wZXJ0eUluZm86IGFueSwgZGF0YUZpZWxkQ29udmVydGVkOiBhbnksIG9EYXRhTW9kZWxQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoKTogc3RyaW5nIHtcblx0XHRjb25zdCBlZGl0U3R5bGVQcm9wZXJ0aWVzID0ge30gYXMgRmllbGRQcm9wZXJ0aWVzO1xuXHRcdGxldCBpbnB1dFR5cGUhOiBzdHJpbmc7XG5cdFx0aWYgKHByb3BlcnR5SW5mbykge1xuXHRcdFx0c2V0RWRpdFN0eWxlUHJvcGVydGllcyhlZGl0U3R5bGVQcm9wZXJ0aWVzLCBkYXRhRmllbGRDb252ZXJ0ZWQsIG9EYXRhTW9kZWxQYXRoLCB0cnVlKTtcblx0XHRcdGlucHV0VHlwZSA9IGVkaXRTdHlsZVByb3BlcnRpZXM/LmVkaXRTdHlsZSB8fCBcIlwiO1xuXHRcdH1cblx0XHRjb25zdCBpc1ZhbGlkRm9yTWFzc0VkaXQgPVxuXHRcdFx0aW5wdXRUeXBlICYmXG5cdFx0XHRbXCJEYXRlUGlja2VyXCIsIFwiVGltZVBpY2tlclwiLCBcIkRhdGVUaW1lUGlja2VyXCIsIFwiUmF0aW5nSW5kaWNhdG9yXCJdLmluZGV4T2YoaW5wdXRUeXBlKSA9PT0gLTEgJiZcblx0XHRcdCFpc011bHRpVmFsdWVGaWVsZChvRGF0YU1vZGVsUGF0aCkgJiZcblx0XHRcdCFoYXNWYWx1ZUhlbHBXaXRoRml4ZWRWYWx1ZXMocHJvcGVydHlJbmZvKTtcblxuXHRcdHJldHVybiAoaXNWYWxpZEZvck1hc3NFZGl0IHx8IFwiXCIpICYmIGlucHV0VHlwZTtcblx0fSxcblxuXHRnZXRJc0ZpZWxkR3JwOiBmdW5jdGlvbiAoZGF0YUZpZWxkQ29udmVydGVkOiBhbnkpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0ZGF0YUZpZWxkQ29udmVydGVkICYmXG5cdFx0XHRkYXRhRmllbGRDb252ZXJ0ZWQuJFR5cGUgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRm9yQW5ub3RhdGlvblwiICYmXG5cdFx0XHRkYXRhRmllbGRDb252ZXJ0ZWQuVGFyZ2V0ICYmXG5cdFx0XHRkYXRhRmllbGRDb252ZXJ0ZWQuVGFyZ2V0LnZhbHVlICYmXG5cdFx0XHRkYXRhRmllbGRDb252ZXJ0ZWQuVGFyZ2V0LnZhbHVlLmluZGV4T2YoXCJGaWVsZEdyb3VwXCIpID4gLTFcblx0XHQpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBHZXQgdGV4dCBwYXRoIGZvciB0aGUgbWFzcyBlZGl0IGZpZWxkLlxuXHQgKlxuXHQgKiBAcGFyYW0gcHJvcGVydHkgUHJvcGVydHkgcGF0aFxuXHQgKiBAcGFyYW0gdGV4dEJpbmRpbmcgVGV4dCBCaW5kaW5nIEluZm9cblx0ICogQHBhcmFtIGRpc3BsYXlNb2RlIERpc3BsYXkgbW9kZVxuXHQgKiBAcmV0dXJucyBUZXh0IFByb3BlcnR5IFBhdGggaWYgaXQgZXhpc3RzXG5cdCAqL1xuXHRnZXRUZXh0UGF0aDogZnVuY3Rpb24gKHByb3BlcnR5OiBzdHJpbmcsIHRleHRCaW5kaW5nOiBhbnksIGRpc3BsYXlNb2RlOiBzdHJpbmcpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuXHRcdGxldCBkZXNjcmlwdGlvblBhdGg7XG5cdFx0aWYgKHRleHRCaW5kaW5nICYmICh0ZXh0QmluZGluZy5wYXRoIHx8ICh0ZXh0QmluZGluZy5wYXJhbWV0ZXJzICYmIHRleHRCaW5kaW5nLnBhcmFtZXRlcnMubGVuZ3RoKSkgJiYgcHJvcGVydHkpIHtcblx0XHRcdGlmICh0ZXh0QmluZGluZy5wYXRoICYmIGRpc3BsYXlNb2RlID09PSBcIkRlc2NyaXB0aW9uXCIpIHtcblx0XHRcdFx0ZGVzY3JpcHRpb25QYXRoID0gdGV4dEJpbmRpbmcucGF0aDtcblx0XHRcdH0gZWxzZSBpZiAodGV4dEJpbmRpbmcucGFyYW1ldGVycykge1xuXHRcdFx0XHR0ZXh0QmluZGluZy5wYXJhbWV0ZXJzLmZvckVhY2goZnVuY3Rpb24gKHByb3BzOiBCaW5kaW5nSW5mbykge1xuXHRcdFx0XHRcdGlmIChwcm9wcy5wYXRoICYmIHByb3BzLnBhdGggIT09IHByb3BlcnR5KSB7XG5cdFx0XHRcdFx0XHRkZXNjcmlwdGlvblBhdGggPSBwcm9wcy5wYXRoO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBkZXNjcmlwdGlvblBhdGg7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEluaXRpYWxpemVzIGEgSlNPTiBNb2RlbCBmb3IgcHJvcGVydGllcyBvZiBkaWFsb2cgZmllbGRzIFtsYWJlbCwgdmlzaWJsaXR5LCBkYXRhcHJvcGVydHksIGV0Yy5dLlxuXHQgKlxuXHQgKiBAcGFyYW0gb1RhYmxlIEluc3RhbmNlIG9mIFRhYmxlXG5cdCAqIEBwYXJhbSBhQ29udGV4dHMgQ29udGV4dHMgZm9yIG1hc3MgZWRpdFxuXHQgKiBAcGFyYW0gYURhdGFBcnJheSBBcnJheSBjb250YWluaW5nIGRhdGEgcmVsYXRlZCB0byB0aGUgZGlhbG9nIHVzZWQgYnkgYm90aCB0aGUgc3RhdGljIGFuZCB0aGUgcnVudGltZSBtb2RlbFxuXHQgKiBAcmV0dXJucyBUaGUgbW9kZWxcblx0ICovXG5cdHByZXBhcmVEYXRhRm9yRGlhbG9nOiBmdW5jdGlvbiAob1RhYmxlOiBUYWJsZSwgYUNvbnRleHRzOiBhbnlbXSwgYURhdGFBcnJheTogYW55W10pIHtcblx0XHRjb25zdCBvTWV0YU1vZGVsID0gb1RhYmxlICYmIChvVGFibGUuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSBhcyBhbnkpLFxuXHRcdFx0c0N1cnJlbnRFbnRpdHlTZXROYW1lID0gb1RhYmxlLmRhdGEoXCJtZXRhUGF0aFwiKSxcblx0XHRcdGFUYWJsZUZpZWxkcyA9IE1hc3NFZGl0SGVscGVyLmdldFRhYmxlRmllbGRzKG9UYWJsZSksXG5cdFx0XHRvRW50aXR5VHlwZUNvbnRleHQgPSBvTWV0YU1vZGVsLmdldENvbnRleHQoYCR7c0N1cnJlbnRFbnRpdHlTZXROYW1lfS9AYCksXG5cdFx0XHRvRW50aXR5U2V0Q29udGV4dCA9IG9NZXRhTW9kZWwuZ2V0Q29udGV4dChzQ3VycmVudEVudGl0eVNldE5hbWUpLFxuXHRcdFx0b0RhdGFNb2RlbE9iamVjdFBhdGggPSBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMob0VudGl0eVR5cGVDb250ZXh0KTtcblxuXHRcdGNvbnN0IG9EYXRhRmllbGRNb2RlbCA9IG5ldyBKU09OTW9kZWwoKTtcblx0XHRsZXQgb1Jlc3VsdDtcblx0XHRsZXQgc0xhYmVsVGV4dDtcblx0XHRsZXQgYlZhbHVlSGVscEVuYWJsZWQ7XG5cdFx0bGV0IHNVbml0UHJvcGVydHlQYXRoO1xuXHRcdGxldCBiVmFsdWVIZWxwRW5hYmxlZEZvclVuaXQ7XG5cdFx0bGV0IG9UZXh0QmluZGluZztcblxuXHRcdGFUYWJsZUZpZWxkcy5mb3JFYWNoKGZ1bmN0aW9uIChvQ29sdW1uSW5mbzogYW55KSB7XG5cdFx0XHRjb25zdCBzRGF0YVByb3BlcnR5UGF0aCA9IG9Db2x1bW5JbmZvLmRhdGFQcm9wZXJ0eTtcblx0XHRcdGlmIChzRGF0YVByb3BlcnR5UGF0aCkge1xuXHRcdFx0XHRsZXQgb1Byb3BlcnR5SW5mbyA9IHNEYXRhUHJvcGVydHlQYXRoICYmIG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NDdXJyZW50RW50aXR5U2V0TmFtZX0vJHtzRGF0YVByb3BlcnR5UGF0aH1AYCk7XG5cdFx0XHRcdHNMYWJlbFRleHQgPVxuXHRcdFx0XHRcdG9Db2x1bW5JbmZvLmxhYmVsIHx8IChvUHJvcGVydHlJbmZvICYmIG9Qcm9wZXJ0eUluZm9bXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkxhYmVsXCJdKSB8fCBzRGF0YVByb3BlcnR5UGF0aDtcblxuXHRcdFx0XHRpZiAob0RhdGFNb2RlbE9iamVjdFBhdGgpIHtcblx0XHRcdFx0XHRvRGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QgPSBvRGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRFbnRpdHlUeXBlLmVudGl0eVByb3BlcnRpZXMuZmlsdGVyKGZ1bmN0aW9uIChcblx0XHRcdFx0XHRcdG9Qcm9wZXJ0eTogYW55XG5cdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gb1Byb3BlcnR5Lm5hbWUgPT09IHNEYXRhUHJvcGVydHlQYXRoO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdG9EYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdCA9IG9EYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdFswXSB8fCB7fTtcblx0XHRcdFx0b1RleHRCaW5kaW5nID0gZ2V0VGV4dEJpbmRpbmcob0RhdGFNb2RlbE9iamVjdFBhdGgsIHt9LCB0cnVlKSB8fCB7fTtcblx0XHRcdFx0Y29uc3Qgb0ZpZWxkQ29udGV4dCA9IG9NZXRhTW9kZWwuZ2V0Q29udGV4dChvQ29sdW1uSW5mby5hbm5vdGF0aW9uUGF0aCksXG5cdFx0XHRcdFx0b0RhdGFGaWVsZENvbnZlcnRlZCA9IGNvbnZlcnRNZXRhTW9kZWxDb250ZXh0KG9GaWVsZENvbnRleHQpLFxuXHRcdFx0XHRcdG9Qcm9wZXJ0eUNvbnRleHQgPSBvTWV0YU1vZGVsLmdldENvbnRleHQoYCR7c0N1cnJlbnRFbnRpdHlTZXROYW1lfS8ke3NEYXRhUHJvcGVydHlQYXRofUBgKSxcblx0XHRcdFx0XHRvSW50ZXJmYWNlID0gb1Byb3BlcnR5Q29udGV4dCAmJiBvUHJvcGVydHlDb250ZXh0LmdldEludGVyZmFjZSgpO1xuXG5cdFx0XHRcdGxldCBvRGF0YU1vZGVsUGF0aCA9IGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyhvRmllbGRDb250ZXh0LCBvRW50aXR5U2V0Q29udGV4dCk7XG5cdFx0XHRcdGlmIChvRGF0YUZpZWxkQ29udmVydGVkPy5WYWx1ZT8ucGF0aD8ubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdG9EYXRhTW9kZWxQYXRoID0gZW5oYW5jZURhdGFNb2RlbFBhdGgob0RhdGFNb2RlbFBhdGgsIHNEYXRhUHJvcGVydHlQYXRoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRjb25zdCBiSGlkZGVuRmllbGQgPVxuXHRcdFx0XHRcdE1hc3NFZGl0SGVscGVyLmdldEhpZGRlblZhbHVlRm9yQ29udGV4dHMoXG5cdFx0XHRcdFx0XHRvRmllbGRDb250ZXh0ICYmIG9GaWVsZENvbnRleHQuZ2V0T2JqZWN0KClbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuSGlkZGVuXCJdLFxuXHRcdFx0XHRcdFx0YUNvbnRleHRzXG5cdFx0XHRcdFx0KSB8fCBmYWxzZTtcblx0XHRcdFx0Y29uc3QgaXNJbWFnZSA9IG9Qcm9wZXJ0eUluZm8gJiYgb1Byb3BlcnR5SW5mb1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5Jc0ltYWdlVVJMXCJdO1xuXG5cdFx0XHRcdG9JbnRlcmZhY2UuY29udGV4dCA9IHtcblx0XHRcdFx0XHRnZXRNb2RlbDogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIG9JbnRlcmZhY2UuZ2V0TW9kZWwoKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGdldFBhdGg6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdHJldHVybiBgJHtzQ3VycmVudEVudGl0eVNldE5hbWV9LyR7c0RhdGFQcm9wZXJ0eVBhdGh9YDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH07XG5cdFx0XHRcdG9Qcm9wZXJ0eUluZm8gPVxuXHRcdFx0XHRcdG9EYXRhRmllbGRDb252ZXJ0ZWQuX3R5cGUgPT09IFwiUHJvcGVydHlcIlxuXHRcdFx0XHRcdFx0PyBvRGF0YUZpZWxkQ29udmVydGVkXG5cdFx0XHRcdFx0XHQ6IChvRGF0YUZpZWxkQ29udmVydGVkICYmIG9EYXRhRmllbGRDb252ZXJ0ZWQuVmFsdWUgJiYgb0RhdGFGaWVsZENvbnZlcnRlZC5WYWx1ZS4kdGFyZ2V0KSB8fFxuXHRcdFx0XHRcdFx0ICAob0RhdGFGaWVsZENvbnZlcnRlZCAmJiBvRGF0YUZpZWxkQ29udmVydGVkLlRhcmdldCAmJiBvRGF0YUZpZWxkQ29udmVydGVkLlRhcmdldC4kdGFyZ2V0KTtcblx0XHRcdFx0Ly8gRGF0YWZpZWxkIGlzIG5vdCBpbmNsdWRlZCBpbiB0aGUgRmllbGRDb250cm9sIGNhbGN1bGF0aW9uLCBuZWVkcyB0byBiZSBpbXBsZW1lbnRlZFxuXG5cdFx0XHRcdGNvbnN0IGNoYXJ0UHJvcGVydHkgPSBvUHJvcGVydHlJbmZvICYmIG9Qcm9wZXJ0eUluZm8udGVybSAmJiBvUHJvcGVydHlJbmZvLnRlcm0gPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnRcIjtcblx0XHRcdFx0Y29uc3QgaXNBY3Rpb24gPSAhIW9EYXRhRmllbGRDb252ZXJ0ZWQuQWN0aW9uO1xuXHRcdFx0XHRjb25zdCBpc0ZpZWxkR3JwID0gTWFzc0VkaXRIZWxwZXIuZ2V0SXNGaWVsZEdycChvRGF0YUZpZWxkQ29udmVydGVkKTtcblx0XHRcdFx0aWYgKGlzSW1hZ2UgfHwgYkhpZGRlbkZpZWxkIHx8IGNoYXJ0UHJvcGVydHkgfHwgaXNBY3Rpb24gfHwgaXNGaWVsZEdycCkge1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIFZhbHVlSGVscCBwcm9wZXJ0aWVzXG5cdFx0XHRcdHNVbml0UHJvcGVydHlQYXRoID1cblx0XHRcdFx0XHQoKGhhc0N1cnJlbmN5KG9Qcm9wZXJ0eUluZm8pIHx8IGhhc1VuaXQob1Byb3BlcnR5SW5mbykpICYmIGdldEFzc29jaWF0ZWRVbml0UHJvcGVydHlQYXRoKG9Qcm9wZXJ0eUluZm8pKSB8fCBcIlwiO1xuXHRcdFx0XHRjb25zdCB1bml0UHJvcGVydHlJbmZvID0gc1VuaXRQcm9wZXJ0eVBhdGggJiYgZ2V0QXNzb2NpYXRlZFVuaXRQcm9wZXJ0eShvUHJvcGVydHlJbmZvKTtcblx0XHRcdFx0YlZhbHVlSGVscEVuYWJsZWQgPSBoYXNWYWx1ZUhlbHAob1Byb3BlcnR5SW5mbyk7XG5cdFx0XHRcdGJWYWx1ZUhlbHBFbmFibGVkRm9yVW5pdCA9IHVuaXRQcm9wZXJ0eUluZm8gJiYgaGFzVmFsdWVIZWxwKHVuaXRQcm9wZXJ0eUluZm8pO1xuXG5cdFx0XHRcdGNvbnN0IGhhc0NvbnRleHREZXBlbmRlbnRWSCA9XG5cdFx0XHRcdFx0KGJWYWx1ZUhlbHBFbmFibGVkIHx8IGJWYWx1ZUhlbHBFbmFibGVkRm9yVW5pdCkgJiZcblx0XHRcdFx0XHQob1Byb3BlcnR5SW5mbz8uYW5ub3RhdGlvbnM/LkNvbW1vbj8uVmFsdWVMaXN0UmVsZXZhbnRRdWFsaWZpZXJzIHx8XG5cdFx0XHRcdFx0XHQodW5pdFByb3BlcnR5SW5mbyAmJiB1bml0UHJvcGVydHlJbmZvPy5hbm5vdGF0aW9ucz8uQ29tbW9uPy5WYWx1ZUxpc3RSZWxldmFudFF1YWxpZmllcnMpKTtcblx0XHRcdFx0aWYgKGhhc0NvbnRleHREZXBlbmRlbnRWSCkge1xuXHRcdFx0XHRcdC8vIGNvbnRleHQgZGVwZW5kZW50IFZIIGlzIG5vdCBzdXBwb3J0ZWQgZm9yIE1hc3MgRWRpdC5cblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBFZGl0TW9kZSBhbmQgSW5wdXRUeXBlXG5cdFx0XHRcdGNvbnN0IHByb3BlcnR5Rm9yRmllbGRDb250cm9sID0gb1Byb3BlcnR5SW5mbyAmJiBvUHJvcGVydHlJbmZvLlZhbHVlID8gb1Byb3BlcnR5SW5mby5WYWx1ZSA6IG9Qcm9wZXJ0eUluZm87XG5cdFx0XHRcdGNvbnN0IGV4cEJpbmRpbmcgPSBnZXRFZGl0TW9kZShwcm9wZXJ0eUZvckZpZWxkQ29udHJvbCwgb0RhdGFNb2RlbFBhdGgsIGZhbHNlLCBmYWxzZSwgb0RhdGFGaWVsZENvbnZlcnRlZCwgY29uc3RhbnQodHJ1ZSkpO1xuXHRcdFx0XHRjb25zdCBlZGl0TW9kZVZhbHVlcyA9IE9iamVjdC5rZXlzKEVkaXRNb2RlKTtcblx0XHRcdFx0Y29uc3QgZWRpdE1vZGVJc1N0YXRpYyA9ICEhZXhwQmluZGluZyAmJiBlZGl0TW9kZVZhbHVlcy5pbmNsdWRlcyhleHBCaW5kaW5nIGFzIEVkaXRNb2RlKTtcblx0XHRcdFx0Y29uc3QgZWRpdGFibGUgPSAhIWV4cEJpbmRpbmcgJiYgKChlZGl0TW9kZUlzU3RhdGljICYmIGV4cEJpbmRpbmcgPT09IEVkaXRNb2RlLkVkaXRhYmxlKSB8fCAhZWRpdE1vZGVJc1N0YXRpYyk7XG5cdFx0XHRcdGNvbnN0IG5hdlByb3BlcnR5V2l0aFZhbHVlSGVscCA9IHNEYXRhUHJvcGVydHlQYXRoLmluY2x1ZGVzKFwiL1wiKSAmJiBiVmFsdWVIZWxwRW5hYmxlZDtcblx0XHRcdFx0aWYgKCFlZGl0YWJsZSB8fCBuYXZQcm9wZXJ0eVdpdGhWYWx1ZUhlbHApIHtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjb25zdCBpbnB1dFR5cGUgPSBNYXNzRWRpdEhlbHBlci5nZXRJbnB1dFR5cGUob1Byb3BlcnR5SW5mbywgb0RhdGFGaWVsZENvbnZlcnRlZCwgb0RhdGFNb2RlbFBhdGgpO1xuXG5cdFx0XHRcdGlmIChpbnB1dFR5cGUpIHtcblx0XHRcdFx0XHRjb25zdCByZWxhdGl2ZVBhdGggPSBnZXRSZWxhdGl2ZVBhdGhzKG9EYXRhTW9kZWxQYXRoKTtcblx0XHRcdFx0XHRjb25zdCBpc1JlYWRPbmx5ID0gaXNSZWFkT25seUV4cHJlc3Npb24ob1Byb3BlcnR5SW5mbywgcmVsYXRpdmVQYXRoKTtcblx0XHRcdFx0XHRjb25zdCBkaXNwbGF5TW9kZSA9IENvbW1vblV0aWxzLmNvbXB1dGVEaXNwbGF5TW9kZShvUHJvcGVydHlDb250ZXh0LmdldE9iamVjdCgpKTtcblx0XHRcdFx0XHRjb25zdCBpc1ZhbHVlSGVscEVuYWJsZWQgPSBiVmFsdWVIZWxwRW5hYmxlZCA/IGJWYWx1ZUhlbHBFbmFibGVkIDogZmFsc2U7XG5cdFx0XHRcdFx0Y29uc3QgaXNWYWx1ZUhlbHBFbmFibGVkRm9yVW5pdCA9XG5cdFx0XHRcdFx0XHRiVmFsdWVIZWxwRW5hYmxlZEZvclVuaXQgJiYgIXNVbml0UHJvcGVydHlQYXRoLmluY2x1ZGVzKFwiL1wiKSA/IGJWYWx1ZUhlbHBFbmFibGVkRm9yVW5pdCA6IGZhbHNlO1xuXHRcdFx0XHRcdGNvbnN0IHVuaXRQcm9wZXJ0eSA9IHNVbml0UHJvcGVydHlQYXRoICYmICFzRGF0YVByb3BlcnR5UGF0aC5pbmNsdWRlcyhcIi9cIikgPyBzVW5pdFByb3BlcnR5UGF0aCA6IGZhbHNlO1xuXG5cdFx0XHRcdFx0b1Jlc3VsdCA9IHtcblx0XHRcdFx0XHRcdGxhYmVsOiBzTGFiZWxUZXh0LFxuXHRcdFx0XHRcdFx0ZGF0YVByb3BlcnR5OiBzRGF0YVByb3BlcnR5UGF0aCxcblx0XHRcdFx0XHRcdGlzVmFsdWVIZWxwRW5hYmxlZDogYlZhbHVlSGVscEVuYWJsZWQgPyBiVmFsdWVIZWxwRW5hYmxlZCA6IGZhbHNlLFxuXHRcdFx0XHRcdFx0dW5pdFByb3BlcnR5LFxuXHRcdFx0XHRcdFx0aXNGaWVsZFJlcXVpcmVkOiBnZXRSZXF1aXJlZEV4cHJlc3Npb24ob1Byb3BlcnR5SW5mbywgb0RhdGFGaWVsZENvbnZlcnRlZCwgdHJ1ZSwgZmFsc2UsIHt9LCBvRGF0YU1vZGVsUGF0aCksXG5cdFx0XHRcdFx0XHRkZWZhdWx0U2VsZWN0aW9uUGF0aDogc0RhdGFQcm9wZXJ0eVBhdGhcblx0XHRcdFx0XHRcdFx0PyBNYXNzRWRpdEhlbHBlci5nZXREZWZhdWx0U2VsZWN0aW9uUGF0aENvbWJvQm94KGFDb250ZXh0cywgc0RhdGFQcm9wZXJ0eVBhdGgpXG5cdFx0XHRcdFx0XHRcdDogZmFsc2UsXG5cdFx0XHRcdFx0XHRkZWZhdWx0U2VsZWN0aW9uVW5pdFBhdGg6IHNVbml0UHJvcGVydHlQYXRoXG5cdFx0XHRcdFx0XHRcdD8gTWFzc0VkaXRIZWxwZXIuZ2V0RGVmYXVsdFNlbGVjdGlvblBhdGhDb21ib0JveChhQ29udGV4dHMsIHNVbml0UHJvcGVydHlQYXRoKVxuXHRcdFx0XHRcdFx0XHQ6IGZhbHNlLFxuXHRcdFx0XHRcdFx0ZW50aXR5U2V0OiBzQ3VycmVudEVudGl0eVNldE5hbWUsXG5cdFx0XHRcdFx0XHRkaXNwbGF5OiBkaXNwbGF5TW9kZSxcblx0XHRcdFx0XHRcdGRlc2NyaXB0aW9uUGF0aDogTWFzc0VkaXRIZWxwZXIuZ2V0VGV4dFBhdGgoc0RhdGFQcm9wZXJ0eVBhdGgsIG9UZXh0QmluZGluZywgZGlzcGxheU1vZGUpLFxuXHRcdFx0XHRcdFx0bnVsbGFibGU6IG9Qcm9wZXJ0eUluZm8ubnVsbGFibGUgIT09IHVuZGVmaW5lZCA/IG9Qcm9wZXJ0eUluZm8ubnVsbGFibGUgOiB0cnVlLFxuXHRcdFx0XHRcdFx0aXNQcm9wZXJ0eVJlYWRPbmx5OiBpc1JlYWRPbmx5ICE9PSB1bmRlZmluZWQgPyBpc1JlYWRPbmx5IDogZmFsc2UsXG5cdFx0XHRcdFx0XHRpbnB1dFR5cGU6IGlucHV0VHlwZSxcblx0XHRcdFx0XHRcdGVkaXRNb2RlOiBlZGl0YWJsZSA/IGV4cEJpbmRpbmcgOiB1bmRlZmluZWQsXG5cdFx0XHRcdFx0XHRwcm9wZXJ0eUluZm86IHtcblx0XHRcdFx0XHRcdFx0aGFzVkg6IGlzVmFsdWVIZWxwRW5hYmxlZCxcblx0XHRcdFx0XHRcdFx0cnVudGltZVBhdGg6IFwiZmllbGRzSW5mbz4vdmFsdWVzL1wiLFxuXHRcdFx0XHRcdFx0XHRyZWxhdGl2ZVBhdGg6IHNEYXRhUHJvcGVydHlQYXRoLFxuXHRcdFx0XHRcdFx0XHRwcm9wZXJ0eVBhdGhGb3JWYWx1ZUhlbHA6IGAke3NDdXJyZW50RW50aXR5U2V0TmFtZX0vJHtzRGF0YVByb3BlcnR5UGF0aH1gXG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0dW5pdEluZm86IHVuaXRQcm9wZXJ0eSAmJiB7XG5cdFx0XHRcdFx0XHRcdGhhc1ZIOiBpc1ZhbHVlSGVscEVuYWJsZWRGb3JVbml0LFxuXHRcdFx0XHRcdFx0XHRydW50aW1lUGF0aDogXCJmaWVsZHNJbmZvPi91bml0RGF0YS9cIixcblx0XHRcdFx0XHRcdFx0cmVsYXRpdmVQYXRoOiB1bml0UHJvcGVydHksXG5cdFx0XHRcdFx0XHRcdHByb3BlcnR5UGF0aEZvclZhbHVlSGVscDogYCR7c0N1cnJlbnRFbnRpdHlTZXROYW1lfS8ke3VuaXRQcm9wZXJ0eX1gXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRhRGF0YUFycmF5LnB1c2gob1Jlc3VsdCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0XHRvRGF0YUZpZWxkTW9kZWwuc2V0RGF0YShhRGF0YUFycmF5KTtcblx0XHRyZXR1cm4gb0RhdGFGaWVsZE1vZGVsO1xuXHR9LFxuXG5cdGdldFRhYmxlRmllbGRzOiBmdW5jdGlvbiAob1RhYmxlOiBhbnkpIHtcblx0XHRjb25zdCBhQ29sdW1ucyA9IChvVGFibGUgJiYgb1RhYmxlLmdldENvbHVtbnMoKSkgfHwgW107XG5cdFx0Y29uc3QgY29sdW1uc0RhdGEgPSBvVGFibGUgJiYgb1RhYmxlLmdldFBhcmVudCgpLmdldFRhYmxlRGVmaW5pdGlvbigpLmNvbHVtbnM7XG5cdFx0cmV0dXJuIGFDb2x1bW5zLm1hcChmdW5jdGlvbiAob0NvbHVtbjogYW55KSB7XG5cdFx0XHRjb25zdCBzRGF0YVByb3BlcnR5ID0gb0NvbHVtbiAmJiBvQ29sdW1uLmdldERhdGFQcm9wZXJ0eSgpLFxuXHRcdFx0XHRhUmVhbHRlZENvbHVtbkluZm8gPVxuXHRcdFx0XHRcdGNvbHVtbnNEYXRhICYmXG5cdFx0XHRcdFx0Y29sdW1uc0RhdGEuZmlsdGVyKGZ1bmN0aW9uIChvQ29sdW1uSW5mbzogYW55KSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gb0NvbHVtbkluZm8ubmFtZSA9PT0gc0RhdGFQcm9wZXJ0eSAmJiBvQ29sdW1uSW5mby50eXBlID09PSBcIkFubm90YXRpb25cIjtcblx0XHRcdFx0XHR9KTtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGRhdGFQcm9wZXJ0eTogc0RhdGFQcm9wZXJ0eSxcblx0XHRcdFx0bGFiZWw6IG9Db2x1bW4uZ2V0SGVhZGVyKCksXG5cdFx0XHRcdGFubm90YXRpb25QYXRoOiBhUmVhbHRlZENvbHVtbkluZm8gJiYgYVJlYWx0ZWRDb2x1bW5JbmZvWzBdICYmIGFSZWFsdGVkQ29sdW1uSW5mb1swXS5hbm5vdGF0aW9uUGF0aFxuXHRcdFx0fTtcblx0XHR9KTtcblx0fSxcblxuXHRnZXREZWZhdWx0VGV4dHNGb3JEaWFsb2c6IGZ1bmN0aW9uIChvUmVzb3VyY2VCdW5kbGU6IGFueSwgaVNlbGVjdGVkQ29udGV4dHM6IGFueSwgb1RhYmxlOiBhbnkpIHtcblx0XHQvLyBUaGUgY29uZmlybSBidXR0b24gdGV4dCBpcyBcIlNhdmVcIiBmb3IgdGFibGUgaW4gRGlzcGxheSBtb2RlIGFuZCBcIkFwcGx5XCIgZm9yIHRhYmxlIGluIGVkaXQgbW9kZS4gVGhpcyBjYW4gYmUgbGF0ZXIgZXhwb3NlZCBpZiBuZWVkZWQuXG5cdFx0Y29uc3QgYkRpc3BsYXlNb2RlID0gb1RhYmxlLmRhdGEoXCJkaXNwbGF5TW9kZVByb3BlcnR5QmluZGluZ1wiKSA9PT0gXCJ0cnVlXCI7XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0a2VlcEV4aXN0aW5nUHJlZml4OiBcIjwgS2VlcFwiLFxuXHRcdFx0bGVhdmVCbGFua1ZhbHVlOiBcIjwgTGVhdmUgQmxhbmsgPlwiLFxuXHRcdFx0Y2xlYXJGaWVsZFZhbHVlOiBcIjwgQ2xlYXIgVmFsdWVzID5cIixcblx0XHRcdG1hc3NFZGl0VGl0bGU6IG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiQ19NQVNTX0VESVRfRElBTE9HX1RJVExFXCIsIGlTZWxlY3RlZENvbnRleHRzLnRvU3RyaW5nKCkpLFxuXHRcdFx0YXBwbHlCdXR0b25UZXh0OiBiRGlzcGxheU1vZGVcblx0XHRcdFx0PyBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfTUFTU19FRElUX1NBVkVfQlVUVE9OX1RFWFRcIilcblx0XHRcdFx0OiBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfTUFTU19FRElUX0FQUExZX0JVVFRPTl9URVhUXCIpLFxuXHRcdFx0dXNlVmFsdWVIZWxwVmFsdWU6IFwiPCBVc2UgVmFsdWUgSGVscCA+XCIsXG5cdFx0XHRjYW5jZWxCdXR0b25UZXh0OiBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfQ09NTU9OX09CSkVDVF9QQUdFX0NBTkNFTFwiKSxcblx0XHRcdG5vRmllbGRzOiBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfTUFTU19FRElUX05PX0VESVRBQkxFX0ZJRUxEU1wiKSxcblx0XHRcdG9rQnV0dG9uVGV4dDogb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJDX0NPTU1PTl9ESUFMT0dfT0tcIilcblx0XHR9O1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBBZGRzIGEgc3VmZml4IHRvIHRoZSAna2VlcCBleGlzdGluZycgcHJvcGVydHkgb2YgdGhlIGNvbWJvQm94LlxuXHQgKlxuXHQgKiBAcGFyYW0gc0lucHV0VHlwZSBJbnB1dFR5cGUgb2YgdGhlIGZpZWxkXG5cdCAqIEByZXR1cm5zIFRoZSBtb2RpZmllZCBzdHJpbmdcblx0ICovXG5cdC8vIGdldFN1ZmZpeEZvcktlZXBFeGlzaXRpbmc6IGZ1bmN0aW9uIChzSW5wdXRUeXBlOiBzdHJpbmcpIHtcblx0Ly8gXHRsZXQgc1Jlc3VsdCA9IFwiVmFsdWVzXCI7XG5cblx0Ly8gXHRzd2l0Y2ggKHNJbnB1dFR5cGUpIHtcblx0Ly8gXHRcdC8vVE9ETyAtIEFkZCBmb3Igb3RoZXIgY29udHJvbCB0eXBlcyBhcyB3ZWxsIChSYWRpbyBCdXR0b24sIEVtYWlsLCBJbnB1dCwgTURDIEZpZWxkcywgSW1hZ2UgZXRjLilcblx0Ly8gXHRcdGNhc2UgXCJEYXRlUGlja2VyXCI6XG5cdC8vIFx0XHRcdHNSZXN1bHQgPSBcIkRhdGVzXCI7XG5cdC8vIFx0XHRcdGJyZWFrO1xuXHQvLyBcdFx0Y2FzZSBcIkNoZWNrQm94XCI6XG5cdC8vIFx0XHRcdHNSZXN1bHQgPSBcIlNldHRpbmdzXCI7XG5cdC8vIFx0XHRcdGJyZWFrO1xuXHQvLyBcdFx0ZGVmYXVsdDpcblx0Ly8gXHRcdFx0c1Jlc3VsdCA9IFwiVmFsdWVzXCI7XG5cdC8vIFx0fVxuXHQvLyBcdHJldHVybiBzUmVzdWx0O1xuXHQvLyB9LFxuXG5cdC8qKlxuXHQgKiBBZGRzIGRlZmF1bHQgdmFsdWVzIHRvIHRoZSBtb2RlbCBbS2VlcCBFeGlzdGluZyBWYWx1ZXMsIExlYXZlIEJsYW5rXS5cblx0ICpcblx0ICogQHBhcmFtIGFWYWx1ZXMgQXJyYXkgaW5zdGFuY2Ugd2hlcmUgdGhlIGRlZmF1bHQgZGF0YSBuZWVkcyB0byBiZSBhZGRlZFxuXHQgKiBAcGFyYW0gb0RlZmF1bHRWYWx1ZXMgRGVmYXVsdCB2YWx1ZXMgZnJvbSBBcHBsaWNhdGlvbiBNYW5pZmVzdFxuXHQgKiBAcGFyYW0gb1Byb3BlcnR5SW5mbyBQcm9wZXJ0eSBpbmZvcm1hdGlvblxuXHQgKiBAcGFyYW0gYlVPTUZpZWxkXG5cdCAqL1xuXHRzZXREZWZhdWx0VmFsdWVzVG9EaWFsb2c6IGZ1bmN0aW9uIChhVmFsdWVzOiBhbnksIG9EZWZhdWx0VmFsdWVzOiBhbnksIG9Qcm9wZXJ0eUluZm86IGFueSwgYlVPTUZpZWxkPzogYm9vbGVhbikge1xuXHRcdGNvbnN0IHNQcm9wZXJ0eVBhdGggPSBiVU9NRmllbGQgPyBvUHJvcGVydHlJbmZvLnVuaXRQcm9wZXJ0eSA6IG9Qcm9wZXJ0eUluZm8uZGF0YVByb3BlcnR5LFxuXHRcdFx0c0lucHV0VHlwZSA9IG9Qcm9wZXJ0eUluZm8uaW5wdXRUeXBlLFxuXHRcdFx0YlByb3BlcnR5UmVxdWlyZWQgPSBvUHJvcGVydHlJbmZvLmlzRmllbGRSZXF1aXJlZDtcblx0XHQvLyBjb25zdCBzU3VmZml4Rm9yS2VlcEV4aXN0aW5nID0gTWFzc0VkaXRIZWxwZXIuZ2V0U3VmZml4Rm9yS2VlcEV4aXNpdGluZyhzSW5wdXRUeXBlKTtcblx0XHRjb25zdCBzU3VmZml4Rm9yS2VlcEV4aXN0aW5nID0gXCJWYWx1ZXNcIjtcblx0XHRhVmFsdWVzLmRlZmF1bHRPcHRpb25zID0gYVZhbHVlcy5kZWZhdWx0T3B0aW9ucyB8fCBbXTtcblx0XHRjb25zdCBzZWxlY3RPcHRpb25zRXhpc3QgPSBhVmFsdWVzLnNlbGVjdE9wdGlvbnMgJiYgYVZhbHVlcy5zZWxlY3RPcHRpb25zLmxlbmd0aCA+IDA7XG5cdFx0Y29uc3Qga2VlcEVudHJ5ID0ge1xuXHRcdFx0dGV4dDogYCR7b0RlZmF1bHRWYWx1ZXMua2VlcEV4aXN0aW5nUHJlZml4fSAke3NTdWZmaXhGb3JLZWVwRXhpc3Rpbmd9ID5gLFxuXHRcdFx0a2V5OiBgRGVmYXVsdC8ke3NQcm9wZXJ0eVBhdGh9YFxuXHRcdH07XG5cblx0XHRpZiAoc0lucHV0VHlwZSA9PT0gXCJDaGVja0JveFwiKSB7XG5cdFx0XHRjb25zdCBmYWxzZUVudHJ5ID0geyB0ZXh0OiBcIk5vXCIsIGtleTogYCR7c1Byb3BlcnR5UGF0aH0vZmFsc2VgLCB0ZXh0SW5mbzogeyB2YWx1ZTogZmFsc2UgfSB9O1xuXHRcdFx0Y29uc3QgdHJ1dGh5RW50cnkgPSB7IHRleHQ6IFwiWWVzXCIsIGtleTogYCR7c1Byb3BlcnR5UGF0aH0vdHJ1ZWAsIHRleHRJbmZvOiB7IHZhbHVlOiB0cnVlIH0gfTtcblx0XHRcdGFWYWx1ZXMudW5zaGlmdChmYWxzZUVudHJ5KTtcblx0XHRcdGFWYWx1ZXMuZGVmYXVsdE9wdGlvbnMudW5zaGlmdChmYWxzZUVudHJ5KTtcblx0XHRcdGFWYWx1ZXMudW5zaGlmdCh0cnV0aHlFbnRyeSk7XG5cdFx0XHRhVmFsdWVzLmRlZmF1bHRPcHRpb25zLnVuc2hpZnQodHJ1dGh5RW50cnkpO1xuXHRcdFx0YVZhbHVlcy51bnNoaWZ0KGtlZXBFbnRyeSk7XG5cdFx0XHRhVmFsdWVzLmRlZmF1bHRPcHRpb25zLnVuc2hpZnQoa2VlcEVudHJ5KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKG9Qcm9wZXJ0eUluZm8/LnByb3BlcnR5SW5mbz8uaGFzVkggfHwgKG9Qcm9wZXJ0eUluZm8/LnVuaXRJbmZvPy5oYXNWSCAmJiBiVU9NRmllbGQpKSB7XG5cdFx0XHRcdGNvbnN0IHZoZEVudHJ5ID0geyB0ZXh0OiBvRGVmYXVsdFZhbHVlcy51c2VWYWx1ZUhlbHBWYWx1ZSwga2V5OiBgVXNlVmFsdWVIZWxwVmFsdWUvJHtzUHJvcGVydHlQYXRofWAgfTtcblx0XHRcdFx0YVZhbHVlcy51bnNoaWZ0KHZoZEVudHJ5KTtcblx0XHRcdFx0YVZhbHVlcy5kZWZhdWx0T3B0aW9ucy51bnNoaWZ0KHZoZEVudHJ5KTtcblx0XHRcdH1cblx0XHRcdGlmIChzZWxlY3RPcHRpb25zRXhpc3QpIHtcblx0XHRcdFx0aWYgKGJQcm9wZXJ0eVJlcXVpcmVkICE9PSBcInRydWVcIiAmJiAhYlVPTUZpZWxkKSB7XG5cdFx0XHRcdFx0Y29uc3QgY2xlYXJFbnRyeSA9IHsgdGV4dDogb0RlZmF1bHRWYWx1ZXMuY2xlYXJGaWVsZFZhbHVlLCBrZXk6IGBDbGVhckZpZWxkVmFsdWUvJHtzUHJvcGVydHlQYXRofWAgfTtcblx0XHRcdFx0XHRhVmFsdWVzLnVuc2hpZnQoY2xlYXJFbnRyeSk7XG5cdFx0XHRcdFx0YVZhbHVlcy5kZWZhdWx0T3B0aW9ucy51bnNoaWZ0KGNsZWFyRW50cnkpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGFWYWx1ZXMudW5zaGlmdChrZWVwRW50cnkpO1xuXHRcdFx0XHRhVmFsdWVzLmRlZmF1bHRPcHRpb25zLnVuc2hpZnQoa2VlcEVudHJ5KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnN0IGVtcHR5RW50cnkgPSB7IHRleHQ6IG9EZWZhdWx0VmFsdWVzLmxlYXZlQmxhbmtWYWx1ZSwga2V5OiBgRGVmYXVsdC8ke3NQcm9wZXJ0eVBhdGh9YCB9O1xuXHRcdFx0XHRhVmFsdWVzLnVuc2hpZnQoZW1wdHlFbnRyeSk7XG5cdFx0XHRcdGFWYWx1ZXMuZGVmYXVsdE9wdGlvbnMudW5zaGlmdChlbXB0eUVudHJ5KTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIEdldCB0ZXh0IGFycmFuZ2VtZW50IGluZm8gZm9yIGEgY29udGV4dCBwcm9wZXJ0eS5cblx0ICpcblx0ICogQHBhcmFtIHByb3BlcnR5IFByb3BlcnR5IFBhdGhcblx0ICogQHBhcmFtIGRlc2NyaXB0aW9uUGF0aCBQYXRoIHRvIHRleHQgYXNzb2NpYXRpb24gb2YgdGhlIHByb3BlcnR5XG5cdCAqIEBwYXJhbSBkaXNwbGF5TW9kZSBEaXNwbGF5IG1vZGUgb2YgdGhlIHByb3BlcnR5IGFuZCB0ZXh0IGFzc29jaWF0aW9uXG5cdCAqIEBwYXJhbSBzZWxlY3RlZENvbnRleHQgQ29udGV4dCB0byBmaW5kIHRoZSBmdWxsIHRleHRcblx0ICogQHJldHVybnMgVGhlIHRleHQgYXJyYW5nZW1lbnRcblx0ICovXG5cdGdldFRleHRBcnJhbmdlbWVudEluZm86IGZ1bmN0aW9uIChcblx0XHRwcm9wZXJ0eTogc3RyaW5nLFxuXHRcdGRlc2NyaXB0aW9uUGF0aDogc3RyaW5nLFxuXHRcdGRpc3BsYXlNb2RlOiBzdHJpbmcsXG5cdFx0c2VsZWN0ZWRDb250ZXh0OiBDb250ZXh0XG5cdCk6IFRleHRBcnJhbmdlbWVudEluZm8ge1xuXHRcdGxldCB2YWx1ZSA9IHNlbGVjdGVkQ29udGV4dC5nZXRPYmplY3QocHJvcGVydHkpLFxuXHRcdFx0ZGVzY3JpcHRpb25WYWx1ZSxcblx0XHRcdGZ1bGxUZXh0O1xuXHRcdGlmIChkZXNjcmlwdGlvblBhdGggJiYgcHJvcGVydHkpIHtcblx0XHRcdHN3aXRjaCAoZGlzcGxheU1vZGUpIHtcblx0XHRcdFx0Y2FzZSBcIkRlc2NyaXB0aW9uXCI6XG5cdFx0XHRcdFx0ZGVzY3JpcHRpb25WYWx1ZSA9IHNlbGVjdGVkQ29udGV4dC5nZXRPYmplY3QoZGVzY3JpcHRpb25QYXRoKSB8fCBcIlwiO1xuXHRcdFx0XHRcdGZ1bGxUZXh0ID0gZGVzY3JpcHRpb25WYWx1ZTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBcIlZhbHVlXCI6XG5cdFx0XHRcdFx0dmFsdWUgPSBzZWxlY3RlZENvbnRleHQuZ2V0T2JqZWN0KHByb3BlcnR5KSB8fCBcIlwiO1xuXHRcdFx0XHRcdGZ1bGxUZXh0ID0gdmFsdWU7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgXCJWYWx1ZURlc2NyaXB0aW9uXCI6XG5cdFx0XHRcdFx0dmFsdWUgPSBzZWxlY3RlZENvbnRleHQuZ2V0T2JqZWN0KHByb3BlcnR5KSB8fCBcIlwiO1xuXHRcdFx0XHRcdGRlc2NyaXB0aW9uVmFsdWUgPSBzZWxlY3RlZENvbnRleHQuZ2V0T2JqZWN0KGRlc2NyaXB0aW9uUGF0aCkgfHwgXCJcIjtcblx0XHRcdFx0XHRmdWxsVGV4dCA9IGRlc2NyaXB0aW9uVmFsdWUgPyBgJHt2YWx1ZX0gKCR7ZGVzY3JpcHRpb25WYWx1ZX0pYCA6IHZhbHVlO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFwiRGVzY3JpcHRpb25WYWx1ZVwiOlxuXHRcdFx0XHRcdHZhbHVlID0gc2VsZWN0ZWRDb250ZXh0LmdldE9iamVjdChwcm9wZXJ0eSkgfHwgXCJcIjtcblx0XHRcdFx0XHRkZXNjcmlwdGlvblZhbHVlID0gc2VsZWN0ZWRDb250ZXh0LmdldE9iamVjdChkZXNjcmlwdGlvblBhdGgpIHx8IFwiXCI7XG5cdFx0XHRcdFx0ZnVsbFRleHQgPSBkZXNjcmlwdGlvblZhbHVlID8gYCR7ZGVzY3JpcHRpb25WYWx1ZX0gKCR7dmFsdWV9KWAgOiB2YWx1ZTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRMb2cuaW5mbyhgRGlzcGxheSBQcm9wZXJ0eSBub3QgYXBwbGljYWJsZTogJHtwcm9wZXJ0eX1gKTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0dGV4dEFycmFuZ2VtZW50OiBkaXNwbGF5TW9kZSxcblx0XHRcdHZhbHVlUGF0aDogcHJvcGVydHksXG5cdFx0XHRkZXNjcmlwdGlvblBhdGg6IGRlc2NyaXB0aW9uUGF0aCxcblx0XHRcdHZhbHVlOiB2YWx1ZSxcblx0XHRcdGRlc2NyaXB0aW9uOiBkZXNjcmlwdGlvblZhbHVlLFxuXHRcdFx0ZnVsbFRleHQ6IGZ1bGxUZXh0XG5cdFx0fTtcblx0fSxcblxuXHQvKipcblx0ICogUmV0dXJuIHRoZSB2aXNpYmlsaXR5IHZhbHV1ZSBmb3IgdGhlIE1hbmFnZWRPYmplY3QgQW55LlxuXHQgKlxuXHQgKiBAcGFyYW0gYW55IFRoZSBNYW5hZ2VkT2JqZWN0IEFueSB0byBiZSB1c2VkIHRvIGNhbGN1bGF0ZSB0aGUgdmlzaWJsZSB2YWx1ZSBvZiB0aGUgYmluZGluZy5cblx0ICogQHJldHVybnMgUmV0dXJucyB0cnVlIGlmIHRoZSBtYXNzIGVkaXQgZmllbGQgaXMgZWRpdGFibGUuXG5cdCAqL1xuXHRpc0VkaXRhYmxlOiBmdW5jdGlvbiAoYW55OiBBbnlUeXBlKTogYm9vbGVhbiB7XG5cdFx0Y29uc3QgYmluZGluZyA9IGFueS5nZXRCaW5kaW5nKFwiYW55XCIpO1xuXHRcdGNvbnN0IHZhbHVlID0gKGJpbmRpbmcgYXMgYW55KS5nZXRFeHRlcm5hbFZhbHVlKCk7XG5cdFx0cmV0dXJuIHZhbHVlID09PSBFZGl0TW9kZS5FZGl0YWJsZTtcblx0fSxcblxuXHQvKipcblx0ICogQ2FsY3VsYXRlIGFuZCB1cGRhdGUgdGhlIHZpc2liaWxpdHkgb2YgbWFzcyBlZGl0IGZpZWxkIG9uIGNoYW5nZSBvZiB0aGUgTWFuYWdlZE9iamVjdCBBbnkgYmluZGluZy5cblx0ICpcblx0ICogQHBhcmFtIG9EaWFsb2dEYXRhTW9kZWwgTW9kZWwgdG8gYmUgdXNlZCBydW50aW1lLlxuXHQgKiBAcGFyYW0gZGF0YVByb3BlcnR5IEZpZWxkIG5hbWUuXG5cdCAqL1xuXHRvbkNvbnRleHRFZGl0YWJsZUNoYW5nZTogZnVuY3Rpb24gKG9EaWFsb2dEYXRhTW9kZWw6IEpTT05Nb2RlbCwgZGF0YVByb3BlcnR5OiBzdHJpbmcpOiB2b2lkIHtcblx0XHRjb25zdCBvYmplY3RzRm9yVmlzaWJpbGl0eSA9IG9EaWFsb2dEYXRhTW9kZWwuZ2V0UHJvcGVydHkoYC92YWx1ZXMvJHtkYXRhUHJvcGVydHl9L29iamVjdHNGb3JWaXNpYmlsaXR5YCkgfHwgW107XG5cdFx0Y29uc3QgZWRpdGFibGUgPSBvYmplY3RzRm9yVmlzaWJpbGl0eS5zb21lKE1hc3NFZGl0SGVscGVyLmlzRWRpdGFibGUpO1xuXG5cdFx0aWYgKGVkaXRhYmxlKSB7XG5cdFx0XHRvRGlhbG9nRGF0YU1vZGVsLnNldFByb3BlcnR5KGAvdmFsdWVzLyR7ZGF0YVByb3BlcnR5fS92aXNpYmxlYCwgZWRpdGFibGUpO1xuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogVXBkYXRlIE1hbmFnZWQgT2JqZWN0IEFueSBmb3IgdmlzaWJpbGl0eSBvZiB0aGUgbWFzcyBlZGl0IGZpZWxkcy5cblx0ICpcblx0ICogQHBhcmFtIG1PVG9Vc2UgVGhlIE1hbmFnZWRPYmplY3QgQW55IHRvIGJlIHVzZWQgdG8gY2FsY3VsYXRlIHRoZSB2aXNpYmxlIHZhbHVlIG9mIHRoZSBiaW5kaW5nLlxuXHQgKiBAcGFyYW0gb0RpYWxvZ0RhdGFNb2RlbCBNb2RlbCB0byBiZSB1c2VkIHJ1bnRpbWUuXG5cdCAqIEBwYXJhbSBkYXRhUHJvcGVydHkgRmllbGQgbmFtZS5cblx0ICogQHBhcmFtIHZhbHVlcyBWYWx1ZXMgb2YgdGhlIGZpZWxkLlxuXHQgKi9cblx0dXBkYXRlT25Db250ZXh0Q2hhbmdlOiBmdW5jdGlvbiAobU9Ub1VzZTogQW55VHlwZSwgb0RpYWxvZ0RhdGFNb2RlbDogSlNPTk1vZGVsLCBkYXRhUHJvcGVydHk6IHN0cmluZywgdmFsdWVzOiBhbnkpIHtcblx0XHRjb25zdCBiaW5kaW5nID0gbU9Ub1VzZS5nZXRCaW5kaW5nKFwiYW55XCIpO1xuXG5cdFx0dmFsdWVzLm9iamVjdHNGb3JWaXNpYmlsaXR5ID0gdmFsdWVzLm9iamVjdHNGb3JWaXNpYmlsaXR5IHx8IFtdO1xuXHRcdHZhbHVlcy5vYmplY3RzRm9yVmlzaWJpbGl0eS5wdXNoKG1PVG9Vc2UpO1xuXG5cdFx0YmluZGluZz8uYXR0YWNoQ2hhbmdlKE1hc3NFZGl0SGVscGVyLm9uQ29udGV4dEVkaXRhYmxlQ2hhbmdlLmJpbmQobnVsbCwgb0RpYWxvZ0RhdGFNb2RlbCwgZGF0YVByb3BlcnR5KSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEdldCBib3VuZCBvYmplY3QgdG8gY2FsY3VsYXRlIHRoZSB2aXNpYmlsaXR5IG9mIGNvbnRleHRzLlxuXHQgKlxuXHQgKiBAcGFyYW0gZXhwQmluZGluZyBCaW5kaW5nIFN0cmluZyBvYmplY3QuXG5cdCAqIEBwYXJhbSBjb250ZXh0IENvbnRleHQgdGhlIGJpbmRpbmcgdmFsdWUuXG5cdCAqIEByZXR1cm5zIFRoZSBNYW5hZ2VkT2JqZWN0IEFueSB0byBiZSB1c2VkIHRvIGNhbGN1bGF0ZSB0aGUgdmlzaWJsZSB2YWx1ZSBvZiB0aGUgYmluZGluZy5cblx0ICovXG5cdGdldEJvdW5kT2JqZWN0OiBmdW5jdGlvbiAoZXhwQmluZGluZzogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24sIGNvbnRleHQ6IENvbnRleHQpOiBBbnlUeXBlIHtcblx0XHRjb25zdCBtT1RvVXNlID0gbmV3IEFueSh7IGFueTogZXhwQmluZGluZyB9KTtcblx0XHRjb25zdCBtb2RlbCA9IGNvbnRleHQuZ2V0TW9kZWwoKTtcblx0XHRtT1RvVXNlLnNldE1vZGVsKG1vZGVsKTtcblx0XHRtT1RvVXNlLnNldEJpbmRpbmdDb250ZXh0KGNvbnRleHQpO1xuXG5cdFx0cmV0dXJuIG1PVG9Vc2U7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEdldCB0aGUgdmlzaWJpbGl0eSBvZiB0aGUgZmllbGQuXG5cdCAqXG5cdCAqIEBwYXJhbSBleHBCaW5kaW5nIEJpbmRpbmcgU3RyaW5nIG9iamVjdC5cblx0ICogQHBhcmFtIG9EaWFsb2dEYXRhTW9kZWwgTW9kZWwgdG8gYmUgdXNlZCBydW50aW1lLlxuXHQgKiBAcGFyYW0gZGF0YVByb3BlcnR5IEZpZWxkIG5hbWUuXG5cdCAqIEBwYXJhbSB2YWx1ZXMgVmFsdWVzIG9mIHRoZSBmaWVsZC5cblx0ICogQHBhcmFtIGNvbnRleHQgQ29udGV4dCB0aGUgYmluZGluZyB2YWx1ZS5cblx0ICogQHJldHVybnMgUmV0dXJucyB0cnVlIGlmIHRoZSBtYXNzIGVkaXQgZmllbGQgaXMgZWRpdGFibGUuXG5cdCAqL1xuXHRnZXRGaWVsZFZpc2libGl0eTogZnVuY3Rpb24gKFxuXHRcdGV4cEJpbmRpbmc6IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uLFxuXHRcdG9EaWFsb2dEYXRhTW9kZWw6IEpTT05Nb2RlbCxcblx0XHRkYXRhUHJvcGVydHk6IHN0cmluZyxcblx0XHR2YWx1ZXM6IGFueSxcblx0XHRjb250ZXh0OiBDb250ZXh0XG5cdCk6IGJvb2xlYW4ge1xuXHRcdGNvbnN0IG1PVG9Vc2UgPSBNYXNzRWRpdEhlbHBlci5nZXRCb3VuZE9iamVjdChleHBCaW5kaW5nLCBjb250ZXh0KTtcblx0XHRjb25zdCBpc0NvbnRleHRFZGl0YWJsZSA9IE1hc3NFZGl0SGVscGVyLmlzRWRpdGFibGUobU9Ub1VzZSk7XG5cblx0XHRpZiAoIWlzQ29udGV4dEVkaXRhYmxlKSB7XG5cdFx0XHRNYXNzRWRpdEhlbHBlci51cGRhdGVPbkNvbnRleHRDaGFuZ2UobU9Ub1VzZSwgb0RpYWxvZ0RhdGFNb2RlbCwgZGF0YVByb3BlcnR5LCB2YWx1ZXMpO1xuXHRcdH1cblx0XHRyZXR1cm4gaXNDb250ZXh0RWRpdGFibGU7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEluaXRpYWxpemVzIGEgcnVudGltZSBtb2RlbDpcblx0ICogPT4gVGhlIG1vZGVsIGNvbnNpc3RzIG9mIHZhbHVlcyBzaG93biBpbiB0aGUgY29tYm9Cb3ggb2YgdGhlIGRpYWxvZyAoTGVhdmUgQmxhbmssIEtlZXAgRXhpc3RpbmcgVmFsdWVzLCBvciBhbnkgcHJvcGVydHkgdmFsdWUgZm9yIHRoZSBzZWxlY3RlZCBjb250ZXh0LCBldGMuKVxuXHQgKiA9PiBUaGUgbW9kZWwgd2lsbCBjYXB0dXJlIHJ1bnRpbWUgY2hhbmdlcyBpbiB0aGUgcmVzdWx0cyBwcm9wZXJ0eSAodGhlIHZhbHVlIGVudGVyZWQgaW4gdGhlIGNvbWJvQm94KS5cblx0ICpcblx0ICogQHBhcmFtIGFDb250ZXh0cyBDb250ZXh0cyBmb3IgbWFzcyBlZGl0XG5cdCAqIEBwYXJhbSBhRGF0YUFycmF5IEFycmF5IGNvbnRhaW5pbmcgZGF0YSByZWxhdGVkIHRvIHRoZSBkaWFsb2cgdXNlZCBieSBib3RoIHRoZSBzdGF0aWMgYW5kIHRoZSBydW50aW1lIG1vZGVsXG5cdCAqIEBwYXJhbSBvRGVmYXVsdFZhbHVlcyBEZWZhdWx0IHZhbHVlcyBmcm9tIGkxOG5cblx0ICogQHBhcmFtIGRpYWxvZ0NvbnRleHQgVHJhbnNpZW50IGNvbnRleHQgZm9yIG1hc3MgZWRpdCBkaWFsb2cuXG5cdCAqIEByZXR1cm5zIFRoZSBydW50aW1lIG1vZGVsXG5cdCAqL1xuXHRzZXRSdW50aW1lTW9kZWxPbkRpYWxvZzogZnVuY3Rpb24gKGFDb250ZXh0czogYW55W10sIGFEYXRhQXJyYXk6IGFueVtdLCBvRGVmYXVsdFZhbHVlczogYW55LCBkaWFsb2dDb250ZXh0OiBDb250ZXh0KSB7XG5cdFx0Y29uc3QgYVZhbHVlczogYW55W10gPSBbXTtcblx0XHRjb25zdCBhVW5pdERhdGE6IGFueVtdID0gW107XG5cdFx0Y29uc3QgYVJlc3VsdHM6IGFueVtdID0gW107XG5cdFx0Y29uc3QgdGV4dFBhdGhzOiBhbnlbXSA9IFtdO1xuXHRcdGNvbnN0IGFSZWFkT25seUZpZWxkSW5mbzogYW55W10gPSBbXTtcblxuXHRcdGNvbnN0IG9EYXRhID0ge1xuXHRcdFx0dmFsdWVzOiBhVmFsdWVzLFxuXHRcdFx0dW5pdERhdGE6IGFVbml0RGF0YSxcblx0XHRcdHJlc3VsdHM6IGFSZXN1bHRzLFxuXHRcdFx0cmVhZGFibGVQcm9wZXJ0eURhdGE6IGFSZWFkT25seUZpZWxkSW5mbyxcblx0XHRcdHNlbGVjdGVkS2V5OiB1bmRlZmluZWQsXG5cdFx0XHR0ZXh0UGF0aHM6IHRleHRQYXRocyxcblx0XHRcdG5vRmllbGRzOiBvRGVmYXVsdFZhbHVlcy5ub0ZpZWxkc1xuXHRcdH07XG5cdFx0Y29uc3Qgb0RpYWxvZ0RhdGFNb2RlbCA9IG5ldyBKU09OTW9kZWwob0RhdGEpO1xuXHRcdGFEYXRhQXJyYXkuZm9yRWFjaChmdW5jdGlvbiAob0luRGF0YTogYW55KSB7XG5cdFx0XHRsZXQgb1RleHRJbmZvO1xuXHRcdFx0bGV0IHNQcm9wZXJ0eUtleTtcblx0XHRcdGxldCBzVW5pdFByb3BlcnR5TmFtZTtcblx0XHRcdGNvbnN0IG9EaXN0aW5jdFZhbHVlTWFwOiBhbnkgPSB7fTtcblx0XHRcdGNvbnN0IG9EaXN0aW5jdFVuaXRNYXA6IGFueSA9IHt9O1xuXHRcdFx0aWYgKG9JbkRhdGEuZGF0YVByb3BlcnR5ICYmIG9JbkRhdGEuZGF0YVByb3BlcnR5LmluZGV4T2YoXCIvXCIpID4gLTEpIHtcblx0XHRcdFx0Y29uc3QgYUZpbmFsUGF0aCA9IE1hc3NFZGl0SGVscGVyLmluaXRMYXN0TGV2ZWxPZlByb3BlcnR5UGF0aChvSW5EYXRhLmRhdGFQcm9wZXJ0eSwgYVZhbHVlcyAvKiwgZGlhbG9nQ29udGV4dCAqLyk7XG5cdFx0XHRcdGNvbnN0IGFQcm9wZXJ0eVBhdGhzID0gb0luRGF0YS5kYXRhUHJvcGVydHkuc3BsaXQoXCIvXCIpO1xuXG5cdFx0XHRcdGZvciAoY29uc3QgY29udGV4dCBvZiBhQ29udGV4dHMpIHtcblx0XHRcdFx0XHRjb25zdCBzTXVsdGlMZXZlbFBhdGhWYWx1ZSA9IGNvbnRleHQuZ2V0T2JqZWN0KG9JbkRhdGEuZGF0YVByb3BlcnR5KTtcblx0XHRcdFx0XHRzUHJvcGVydHlLZXkgPSBgJHtvSW5EYXRhLmRhdGFQcm9wZXJ0eX0vJHtzTXVsdGlMZXZlbFBhdGhWYWx1ZX1gO1xuXHRcdFx0XHRcdGlmICghb0Rpc3RpbmN0VmFsdWVNYXBbc1Byb3BlcnR5S2V5XSAmJiBhRmluYWxQYXRoW2FQcm9wZXJ0eVBhdGhzW2FQcm9wZXJ0eVBhdGhzLmxlbmd0aCAtIDFdXSkge1xuXHRcdFx0XHRcdFx0b1RleHRJbmZvID0gTWFzc0VkaXRIZWxwZXIuZ2V0VGV4dEFycmFuZ2VtZW50SW5mbyhcblx0XHRcdFx0XHRcdFx0b0luRGF0YS5kYXRhUHJvcGVydHksXG5cdFx0XHRcdFx0XHRcdG9JbkRhdGEuZGVzY3JpcHRpb25QYXRoLFxuXHRcdFx0XHRcdFx0XHRvSW5EYXRhLmRpc3BsYXksXG5cdFx0XHRcdFx0XHRcdGNvbnRleHRcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRhRmluYWxQYXRoW2FQcm9wZXJ0eVBhdGhzW2FQcm9wZXJ0eVBhdGhzLmxlbmd0aCAtIDFdXS5wdXNoKHtcblx0XHRcdFx0XHRcdFx0dGV4dDogKG9UZXh0SW5mbyAmJiBvVGV4dEluZm8uZnVsbFRleHQpIHx8IHNNdWx0aUxldmVsUGF0aFZhbHVlLFxuXHRcdFx0XHRcdFx0XHRrZXk6IHNQcm9wZXJ0eUtleSxcblx0XHRcdFx0XHRcdFx0dGV4dEluZm86IG9UZXh0SW5mb1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRvRGlzdGluY3RWYWx1ZU1hcFtzUHJvcGVydHlLZXldID0gc011bHRpTGV2ZWxQYXRoVmFsdWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIGlmIChPYmplY3Qua2V5cyhvRGlzdGluY3RWYWx1ZU1hcCkubGVuZ3RoID09PSAxKSB7XG5cdFx0XHRcdC8vIFx0ZGlhbG9nQ29udGV4dC5zZXRQcm9wZXJ0eShvRGF0YS5kYXRhUHJvcGVydHksIHNQcm9wZXJ0eUtleSAmJiBvRGlzdGluY3RWYWx1ZU1hcFtzUHJvcGVydHlLZXldKTtcblx0XHRcdFx0Ly8gfVxuXG5cdFx0XHRcdGFGaW5hbFBhdGhbYVByb3BlcnR5UGF0aHNbYVByb3BlcnR5UGF0aHMubGVuZ3RoIC0gMV1dLnRleHRJbmZvID0ge1xuXHRcdFx0XHRcdGRlc2NyaXB0aW9uUGF0aDogb0luRGF0YS5kZXNjcmlwdGlvblBhdGgsXG5cdFx0XHRcdFx0dmFsdWVQYXRoOiBvSW5EYXRhLmRhdGFQcm9wZXJ0eSxcblx0XHRcdFx0XHRkaXNwbGF5TW9kZTogb0luRGF0YS5kaXNwbGF5XG5cdFx0XHRcdH07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRhVmFsdWVzW29JbkRhdGEuZGF0YVByb3BlcnR5XSA9IGFWYWx1ZXNbb0luRGF0YS5kYXRhUHJvcGVydHldIHx8IFtdO1xuXHRcdFx0XHRhVmFsdWVzW29JbkRhdGEuZGF0YVByb3BlcnR5XVtcInNlbGVjdE9wdGlvbnNcIl0gPSBhVmFsdWVzW29JbkRhdGEuZGF0YVByb3BlcnR5XVtcInNlbGVjdE9wdGlvbnNcIl0gfHwgW107XG5cdFx0XHRcdGlmIChvSW5EYXRhLnVuaXRQcm9wZXJ0eSkge1xuXHRcdFx0XHRcdGFVbml0RGF0YVtvSW5EYXRhLnVuaXRQcm9wZXJ0eV0gPSBhVW5pdERhdGFbb0luRGF0YS51bml0UHJvcGVydHldIHx8IFtdO1xuXHRcdFx0XHRcdGFVbml0RGF0YVtvSW5EYXRhLnVuaXRQcm9wZXJ0eV1bXCJzZWxlY3RPcHRpb25zXCJdID0gYVVuaXREYXRhW29JbkRhdGEudW5pdFByb3BlcnR5XVtcInNlbGVjdE9wdGlvbnNcIl0gfHwgW107XG5cdFx0XHRcdH1cblx0XHRcdFx0Zm9yIChjb25zdCBjb250ZXh0IG9mIGFDb250ZXh0cykge1xuXHRcdFx0XHRcdGNvbnN0IG9EYXRhT2JqZWN0ID0gY29udGV4dC5nZXRPYmplY3QoKTtcblx0XHRcdFx0XHRzUHJvcGVydHlLZXkgPSBgJHtvSW5EYXRhLmRhdGFQcm9wZXJ0eX0vJHtvRGF0YU9iamVjdFtvSW5EYXRhLmRhdGFQcm9wZXJ0eV19YDtcblx0XHRcdFx0XHRpZiAob0luRGF0YS5kYXRhUHJvcGVydHkgJiYgb0RhdGFPYmplY3Rbb0luRGF0YS5kYXRhUHJvcGVydHldICYmICFvRGlzdGluY3RWYWx1ZU1hcFtzUHJvcGVydHlLZXldKSB7XG5cdFx0XHRcdFx0XHRpZiAob0luRGF0YS5pbnB1dFR5cGUgIT0gXCJDaGVja0JveFwiKSB7XG5cdFx0XHRcdFx0XHRcdG9UZXh0SW5mbyA9IE1hc3NFZGl0SGVscGVyLmdldFRleHRBcnJhbmdlbWVudEluZm8oXG5cdFx0XHRcdFx0XHRcdFx0b0luRGF0YS5kYXRhUHJvcGVydHksXG5cdFx0XHRcdFx0XHRcdFx0b0luRGF0YS5kZXNjcmlwdGlvblBhdGgsXG5cdFx0XHRcdFx0XHRcdFx0b0luRGF0YS5kaXNwbGF5LFxuXHRcdFx0XHRcdFx0XHRcdGNvbnRleHRcblx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdFx0Y29uc3QgZW50cnkgPSB7XG5cdFx0XHRcdFx0XHRcdFx0dGV4dDogKG9UZXh0SW5mbyAmJiBvVGV4dEluZm8uZnVsbFRleHQpIHx8IG9EYXRhT2JqZWN0W29JbkRhdGEuZGF0YVByb3BlcnR5XSxcblx0XHRcdFx0XHRcdFx0XHRrZXk6IHNQcm9wZXJ0eUtleSxcblx0XHRcdFx0XHRcdFx0XHR0ZXh0SW5mbzogb1RleHRJbmZvXG5cdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdGFWYWx1ZXNbb0luRGF0YS5kYXRhUHJvcGVydHldLnB1c2goZW50cnkpO1xuXHRcdFx0XHRcdFx0XHRhVmFsdWVzW29JbkRhdGEuZGF0YVByb3BlcnR5XVtcInNlbGVjdE9wdGlvbnNcIl0ucHVzaChlbnRyeSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRvRGlzdGluY3RWYWx1ZU1hcFtzUHJvcGVydHlLZXldID0gb0RhdGFPYmplY3Rbb0luRGF0YS5kYXRhUHJvcGVydHldO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAob0luRGF0YS51bml0UHJvcGVydHkgJiYgb0RhdGFPYmplY3Rbb0luRGF0YS51bml0UHJvcGVydHldKSB7XG5cdFx0XHRcdFx0XHRzVW5pdFByb3BlcnR5TmFtZSA9IGAke29JbkRhdGEudW5pdFByb3BlcnR5fS8ke29EYXRhT2JqZWN0W29JbkRhdGEudW5pdFByb3BlcnR5XX1gO1xuXHRcdFx0XHRcdFx0aWYgKCFvRGlzdGluY3RVbml0TWFwW3NVbml0UHJvcGVydHlOYW1lXSkge1xuXHRcdFx0XHRcdFx0XHRpZiAob0luRGF0YS5pbnB1dFR5cGUgIT0gXCJDaGVja0JveFwiKSB7XG5cdFx0XHRcdFx0XHRcdFx0b1RleHRJbmZvID0gTWFzc0VkaXRIZWxwZXIuZ2V0VGV4dEFycmFuZ2VtZW50SW5mbyhcblx0XHRcdFx0XHRcdFx0XHRcdG9JbkRhdGEudW5pdFByb3BlcnR5LFxuXHRcdFx0XHRcdFx0XHRcdFx0b0luRGF0YS5kZXNjcmlwdGlvblBhdGgsXG5cdFx0XHRcdFx0XHRcdFx0XHRvSW5EYXRhLmRpc3BsYXksXG5cdFx0XHRcdFx0XHRcdFx0XHRjb250ZXh0XG5cdFx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdFx0XHRjb25zdCB1bml0RW50cnkgPSB7XG5cdFx0XHRcdFx0XHRcdFx0XHR0ZXh0OiAob1RleHRJbmZvICYmIG9UZXh0SW5mby5mdWxsVGV4dCkgfHwgb0RhdGFPYmplY3Rbb0luRGF0YS51bml0UHJvcGVydHldLFxuXHRcdFx0XHRcdFx0XHRcdFx0a2V5OiBzVW5pdFByb3BlcnR5TmFtZSxcblx0XHRcdFx0XHRcdFx0XHRcdHRleHRJbmZvOiBvVGV4dEluZm9cblx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdGFVbml0RGF0YVtvSW5EYXRhLnVuaXRQcm9wZXJ0eV0ucHVzaCh1bml0RW50cnkpO1xuXHRcdFx0XHRcdFx0XHRcdGFVbml0RGF0YVtvSW5EYXRhLnVuaXRQcm9wZXJ0eV1bXCJzZWxlY3RPcHRpb25zXCJdLnB1c2godW5pdEVudHJ5KTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRvRGlzdGluY3RVbml0TWFwW3NVbml0UHJvcGVydHlOYW1lXSA9IG9EYXRhT2JqZWN0W29JbkRhdGEudW5pdFByb3BlcnR5XTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0YVZhbHVlc1tvSW5EYXRhLmRhdGFQcm9wZXJ0eV0udGV4dEluZm8gPSB7XG5cdFx0XHRcdFx0ZGVzY3JpcHRpb25QYXRoOiBvSW5EYXRhLmRlc2NyaXB0aW9uUGF0aCxcblx0XHRcdFx0XHR2YWx1ZVBhdGg6IG9JbkRhdGEuZGF0YVByb3BlcnR5LFxuXHRcdFx0XHRcdGRpc3BsYXlNb2RlOiBvSW5EYXRhLmRpc3BsYXlcblx0XHRcdFx0fTtcblx0XHRcdFx0aWYgKE9iamVjdC5rZXlzKG9EaXN0aW5jdFZhbHVlTWFwKS5sZW5ndGggPT09IDEpIHtcblx0XHRcdFx0XHRkaWFsb2dDb250ZXh0LnNldFByb3BlcnR5KG9JbkRhdGEuZGF0YVByb3BlcnR5LCBzUHJvcGVydHlLZXkgJiYgb0Rpc3RpbmN0VmFsdWVNYXBbc1Byb3BlcnR5S2V5XSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKE9iamVjdC5rZXlzKG9EaXN0aW5jdFVuaXRNYXApLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0XHRcdGRpYWxvZ0NvbnRleHQuc2V0UHJvcGVydHkob0luRGF0YS51bml0UHJvcGVydHksIHNVbml0UHJvcGVydHlOYW1lICYmIG9EaXN0aW5jdFVuaXRNYXBbc1VuaXRQcm9wZXJ0eU5hbWVdKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0dGV4dFBhdGhzW29JbkRhdGEuZGF0YVByb3BlcnR5XSA9IG9JbkRhdGEuZGVzY3JpcHRpb25QYXRoID8gW29JbkRhdGEuZGVzY3JpcHRpb25QYXRoXSA6IFtdO1xuXHRcdH0pO1xuXHRcdGFEYXRhQXJyYXkuZm9yRWFjaChmdW5jdGlvbiAob0luRGF0YTogYW55KSB7XG5cdFx0XHRsZXQgdmFsdWVzOiBhbnkgPSB7fTtcblx0XHRcdGlmIChvSW5EYXRhLmRhdGFQcm9wZXJ0eS5pbmRleE9mKFwiL1wiKSA+IC0xKSB7XG5cdFx0XHRcdGNvbnN0IHNNdWx0aUxldmVsUHJvcFBhdGhWYWx1ZSA9IE1hc3NFZGl0SGVscGVyLmdldFZhbHVlRm9yTXVsdGlMZXZlbFBhdGgob0luRGF0YS5kYXRhUHJvcGVydHksIGFWYWx1ZXMpO1xuXHRcdFx0XHRpZiAoIXNNdWx0aUxldmVsUHJvcFBhdGhWYWx1ZSkge1xuXHRcdFx0XHRcdHNNdWx0aUxldmVsUHJvcFBhdGhWYWx1ZS5wdXNoKHsgdGV4dDogb0RlZmF1bHRWYWx1ZXMubGVhdmVCbGFua1ZhbHVlLCBrZXk6IGBFbXB0eS8ke29JbkRhdGEuZGF0YVByb3BlcnR5fWAgfSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0TWFzc0VkaXRIZWxwZXIuc2V0RGVmYXVsdFZhbHVlc1RvRGlhbG9nKHNNdWx0aUxldmVsUHJvcFBhdGhWYWx1ZSwgb0RlZmF1bHRWYWx1ZXMsIG9JbkRhdGEpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHZhbHVlcyA9IHNNdWx0aUxldmVsUHJvcFBhdGhWYWx1ZTtcblx0XHRcdH0gZWxzZSBpZiAoYVZhbHVlc1tvSW5EYXRhLmRhdGFQcm9wZXJ0eV0pIHtcblx0XHRcdFx0YVZhbHVlc1tvSW5EYXRhLmRhdGFQcm9wZXJ0eV0gPSBhVmFsdWVzW29JbkRhdGEuZGF0YVByb3BlcnR5XSB8fCBbXTtcblx0XHRcdFx0TWFzc0VkaXRIZWxwZXIuc2V0RGVmYXVsdFZhbHVlc1RvRGlhbG9nKGFWYWx1ZXNbb0luRGF0YS5kYXRhUHJvcGVydHldLCBvRGVmYXVsdFZhbHVlcywgb0luRGF0YSk7XG5cdFx0XHRcdHZhbHVlcyA9IGFWYWx1ZXNbb0luRGF0YS5kYXRhUHJvcGVydHldO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoYVVuaXREYXRhW29JbkRhdGEudW5pdFByb3BlcnR5XSAmJiBhVW5pdERhdGFbb0luRGF0YS51bml0UHJvcGVydHldLmxlbmd0aCkge1xuXHRcdFx0XHRNYXNzRWRpdEhlbHBlci5zZXREZWZhdWx0VmFsdWVzVG9EaWFsb2coYVVuaXREYXRhW29JbkRhdGEudW5pdFByb3BlcnR5XSwgb0RlZmF1bHRWYWx1ZXMsIG9JbkRhdGEsIHRydWUpO1xuXHRcdFx0XHRhVW5pdERhdGFbb0luRGF0YS51bml0UHJvcGVydHldLnRleHRJbmZvID0ge307XG5cdFx0XHRcdGFVbml0RGF0YVtvSW5EYXRhLnVuaXRQcm9wZXJ0eV0uc2VsZWN0ZWRLZXkgPSBNYXNzRWRpdEhlbHBlci5nZXREZWZhdWx0U2VsZWN0aW9uUGF0aENvbWJvQm94KFxuXHRcdFx0XHRcdGFDb250ZXh0cyxcblx0XHRcdFx0XHRvSW5EYXRhLnVuaXRQcm9wZXJ0eVxuXHRcdFx0XHQpO1xuXHRcdFx0XHRhVW5pdERhdGFbb0luRGF0YS51bml0UHJvcGVydHldLmlucHV0VHlwZSA9IG9JbkRhdGEuaW5wdXRUeXBlO1xuXHRcdFx0fSBlbHNlIGlmIChcblx0XHRcdFx0KG9JbkRhdGEuZGF0YVByb3BlcnR5ICYmIGFWYWx1ZXNbb0luRGF0YS5kYXRhUHJvcGVydHldICYmICFhVmFsdWVzW29JbkRhdGEuZGF0YVByb3BlcnR5XS5sZW5ndGgpIHx8XG5cdFx0XHRcdChvSW5EYXRhLnVuaXRQcm9wZXJ0eSAmJiBhVW5pdERhdGFbb0luRGF0YS51bml0UHJvcGVydHldICYmICFhVW5pdERhdGFbb0luRGF0YS51bml0UHJvcGVydHldLmxlbmd0aClcblx0XHRcdCkge1xuXHRcdFx0XHRjb25zdCBiQ2xlYXJGaWVsZE9yQmxhbmtWYWx1ZUV4aXN0cyA9XG5cdFx0XHRcdFx0YVZhbHVlc1tvSW5EYXRhLmRhdGFQcm9wZXJ0eV0gJiZcblx0XHRcdFx0XHRhVmFsdWVzW29JbkRhdGEuZGF0YVByb3BlcnR5XS5zb21lKGZ1bmN0aW9uIChvYmo6IGFueSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIG9iai50ZXh0ID09PSBcIjwgQ2xlYXIgVmFsdWVzID5cIiB8fCBvYmoudGV4dCA9PT0gXCI8IExlYXZlIEJsYW5rID5cIjtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0aWYgKG9JbkRhdGEuZGF0YVByb3BlcnR5ICYmICFiQ2xlYXJGaWVsZE9yQmxhbmtWYWx1ZUV4aXN0cykge1xuXHRcdFx0XHRcdGFWYWx1ZXNbb0luRGF0YS5kYXRhUHJvcGVydHldLnB1c2goeyB0ZXh0OiBvRGVmYXVsdFZhbHVlcy5sZWF2ZUJsYW5rVmFsdWUsIGtleTogYEVtcHR5LyR7b0luRGF0YS5kYXRhUHJvcGVydHl9YCB9KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRjb25zdCBiQ2xlYXJGaWVsZE9yQmxhbmtVbml0VmFsdWVFeGlzdHMgPVxuXHRcdFx0XHRcdGFVbml0RGF0YVtvSW5EYXRhLnVuaXRQcm9wZXJ0eV0gJiZcblx0XHRcdFx0XHRhVW5pdERhdGFbb0luRGF0YS51bml0UHJvcGVydHldLnNvbWUoZnVuY3Rpb24gKG9iajogYW55KSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gb2JqLnRleHQgPT09IFwiPCBDbGVhciBWYWx1ZXMgPlwiIHx8IG9iai50ZXh0ID09PSBcIjwgTGVhdmUgQmxhbmsgPlwiO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRpZiAob0luRGF0YS51bml0UHJvcGVydHkpIHtcblx0XHRcdFx0XHRpZiAoIWJDbGVhckZpZWxkT3JCbGFua1VuaXRWYWx1ZUV4aXN0cykge1xuXHRcdFx0XHRcdFx0YVVuaXREYXRhW29JbkRhdGEudW5pdFByb3BlcnR5XS5wdXNoKHtcblx0XHRcdFx0XHRcdFx0dGV4dDogb0RlZmF1bHRWYWx1ZXMubGVhdmVCbGFua1ZhbHVlLFxuXHRcdFx0XHRcdFx0XHRrZXk6IGBFbXB0eS8ke29JbkRhdGEudW5pdFByb3BlcnR5fWBcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRhVW5pdERhdGFbb0luRGF0YS51bml0UHJvcGVydHldLnRleHRJbmZvID0ge307XG5cdFx0XHRcdFx0YVVuaXREYXRhW29JbkRhdGEudW5pdFByb3BlcnR5XS5zZWxlY3RlZEtleSA9IE1hc3NFZGl0SGVscGVyLmdldERlZmF1bHRTZWxlY3Rpb25QYXRoQ29tYm9Cb3goXG5cdFx0XHRcdFx0XHRhQ29udGV4dHMsXG5cdFx0XHRcdFx0XHRvSW5EYXRhLnVuaXRQcm9wZXJ0eVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0YVVuaXREYXRhW29JbkRhdGEudW5pdFByb3BlcnR5XS5pbnB1dFR5cGUgPSBvSW5EYXRhLmlucHV0VHlwZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYgKG9JbkRhdGEuaXNQcm9wZXJ0eVJlYWRPbmx5ICYmIHR5cGVvZiBvSW5EYXRhLmlzUHJvcGVydHlSZWFkT25seSA9PT0gXCJib29sZWFuXCIpIHtcblx0XHRcdFx0YVJlYWRPbmx5RmllbGRJbmZvLnB1c2goeyBwcm9wZXJ0eTogb0luRGF0YS5kYXRhUHJvcGVydHksIHZhbHVlOiBvSW5EYXRhLmlzUHJvcGVydHlSZWFkT25seSwgdHlwZTogXCJEZWZhdWx0XCIgfSk7XG5cdFx0XHR9IGVsc2UgaWYgKFxuXHRcdFx0XHRvSW5EYXRhLmlzUHJvcGVydHlSZWFkT25seSAmJlxuXHRcdFx0XHRvSW5EYXRhLmlzUHJvcGVydHlSZWFkT25seS5vcGVyYW5kcyAmJlxuXHRcdFx0XHRvSW5EYXRhLmlzUHJvcGVydHlSZWFkT25seS5vcGVyYW5kc1swXSAmJlxuXHRcdFx0XHRvSW5EYXRhLmlzUHJvcGVydHlSZWFkT25seS5vcGVyYW5kc1swXS5vcGVyYW5kMSAmJlxuXHRcdFx0XHRvSW5EYXRhLmlzUHJvcGVydHlSZWFkT25seS5vcGVyYW5kc1swXS5vcGVyYW5kMlxuXHRcdFx0KSB7XG5cdFx0XHRcdC8vIFRoaXMgbmVlZHMgdG8gYmUgcmVmYWN0b3JlZCBpbiBhY2NvcmRhbmNlIHdpdGggdGhlIFJlYWRPbmx5RXhwcmVzc2lvbiBjaGFuZ2Vcblx0XHRcdFx0YVJlYWRPbmx5RmllbGRJbmZvLnB1c2goe1xuXHRcdFx0XHRcdHByb3BlcnR5OiBvSW5EYXRhLmRhdGFQcm9wZXJ0eSxcblx0XHRcdFx0XHRwcm9wZXJ0eVBhdGg6IG9JbkRhdGEuaXNQcm9wZXJ0eVJlYWRPbmx5Lm9wZXJhbmRzWzBdLm9wZXJhbmQxLnBhdGgsXG5cdFx0XHRcdFx0cHJvcGVydHlWYWx1ZTogb0luRGF0YS5pc1Byb3BlcnR5UmVhZE9ubHkub3BlcmFuZHNbMF0ub3BlcmFuZDIudmFsdWUsXG5cdFx0XHRcdFx0dHlwZTogXCJQYXRoXCJcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIFNldHRpbmcgdmlzYmlsaXR5IG9mIHRoZSBtYXNzIGVkaXQgZmllbGQuXG5cdFx0XHRpZiAob0luRGF0YS5lZGl0TW9kZSkge1xuXHRcdFx0XHR2YWx1ZXMudmlzaWJsZSA9XG5cdFx0XHRcdFx0b0luRGF0YS5lZGl0TW9kZSA9PT0gRWRpdE1vZGUuRWRpdGFibGUgfHxcblx0XHRcdFx0XHRhQ29udGV4dHMuc29tZShcblx0XHRcdFx0XHRcdE1hc3NFZGl0SGVscGVyLmdldEZpZWxkVmlzaWJsaXR5LmJpbmQoXG5cdFx0XHRcdFx0XHRcdE1hc3NFZGl0SGVscGVyLFxuXHRcdFx0XHRcdFx0XHRvSW5EYXRhLmVkaXRNb2RlLFxuXHRcdFx0XHRcdFx0XHRvRGlhbG9nRGF0YU1vZGVsLFxuXHRcdFx0XHRcdFx0XHRvSW5EYXRhLmRhdGFQcm9wZXJ0eSxcblx0XHRcdFx0XHRcdFx0dmFsdWVzXG5cdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHZhbHVlcy52aXNpYmxlID0gdHJ1ZTtcblx0XHRcdH1cblx0XHRcdHZhbHVlcy5zZWxlY3RlZEtleSA9IE1hc3NFZGl0SGVscGVyLmdldERlZmF1bHRTZWxlY3Rpb25QYXRoQ29tYm9Cb3goYUNvbnRleHRzLCBvSW5EYXRhLmRhdGFQcm9wZXJ0eSk7XG5cdFx0XHR2YWx1ZXMuaW5wdXRUeXBlID0gb0luRGF0YS5pbnB1dFR5cGU7XG5cdFx0XHR2YWx1ZXMudW5pdFByb3BlcnR5ID0gb0luRGF0YS51bml0UHJvcGVydHk7XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gb0RpYWxvZ0RhdGFNb2RlbDtcblx0fSxcblx0LyoqXG5cdCAqIEdldHMgdHJhbnNpZW50IGNvbnRleHQgZm9yIGRpYWxvZy5cblx0ICpcblx0ICogQHBhcmFtIHRhYmxlIEluc3RhbmNlIG9mIFRhYmxlLlxuXHQgKiBAcGFyYW0gZGlhbG9nIE1hc3MgRWRpdCBEaWFsb2cuXG5cdCAqIEByZXR1cm5zIFByb21pc2UgcmV0dXJuaW5nIGluc3RhbmNlIG9mIGRpYWxvZy5cblx0ICovXG5cdGdldERpYWxvZ0NvbnRleHQ6IGZ1bmN0aW9uICh0YWJsZTogVGFibGUsIGRpYWxvZz86IERpYWxvZyk6IENvbnRleHQge1xuXHRcdGxldCB0cmFuc0N0eDogQ29udGV4dCA9IChkaWFsb2cgJiYgZGlhbG9nLmdldEJpbmRpbmdDb250ZXh0KCkpIGFzIENvbnRleHQ7XG5cblx0XHRpZiAoIXRyYW5zQ3R4KSB7XG5cdFx0XHRjb25zdCBtb2RlbCA9IHRhYmxlLmdldE1vZGVsKCk7XG5cdFx0XHRjb25zdCBsaXN0QmluZGluZyA9IHRhYmxlLmdldFJvd0JpbmRpbmcoKTtcblx0XHRcdGNvbnN0IHRyYW5zaWVudExpc3RCaW5kaW5nID0gbW9kZWwuYmluZExpc3QobGlzdEJpbmRpbmcuZ2V0UGF0aCgpLCBsaXN0QmluZGluZy5nZXRDb250ZXh0KCksIFtdLCBbXSwge1xuXHRcdFx0XHQkJHVwZGF0ZUdyb3VwSWQ6IFwic3VibWl0TGF0ZXJcIlxuXHRcdFx0fSkgYXMgT0RhdGFMaXN0QmluZGluZztcblx0XHRcdCh0cmFuc2llbnRMaXN0QmluZGluZyBhcyBhbnkpLnJlZnJlc2hJbnRlcm5hbCA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0LyogKi9cblx0XHRcdH07XG5cdFx0XHR0cmFuc0N0eCA9IHRyYW5zaWVudExpc3RCaW5kaW5nLmNyZWF0ZSh7fSwgdHJ1ZSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRyYW5zQ3R4O1xuXHR9LFxuXG5cdG9uRGlhbG9nT3BlbjogZnVuY3Rpb24gKGV2ZW50OiBhbnkpOiB2b2lkIHtcblx0XHRjb25zdCBzb3VyY2UgPSBldmVudC5nZXRTb3VyY2UoKTtcblx0XHRjb25zdCBmaWVsZHNJbmZvTW9kZWwgPSBzb3VyY2UuZ2V0TW9kZWwoXCJmaWVsZHNJbmZvXCIpO1xuXHRcdGZpZWxkc0luZm9Nb2RlbC5zZXRQcm9wZXJ0eShcIi9pc09wZW5cIiwgdHJ1ZSk7XG5cdH0sXG5cblx0Y2xvc2VEaWFsb2c6IGZ1bmN0aW9uIChvRGlhbG9nOiBhbnkpIHtcblx0XHRvRGlhbG9nLmNsb3NlKCk7XG5cdFx0b0RpYWxvZy5kZXN0cm95KCk7XG5cdH0sXG5cblx0bWVzc2FnZUhhbmRsaW5nRm9yTWFzc0VkaXQ6IGFzeW5jIGZ1bmN0aW9uIChcblx0XHRvVGFibGU6IFRhYmxlLFxuXHRcdGFDb250ZXh0czogYW55LFxuXHRcdG9Db250cm9sbGVyOiBQYWdlQ29udHJvbGxlcixcblx0XHRvSW5EaWFsb2c6IGFueSxcblx0XHRhUmVzdWx0czogYW55LFxuXHRcdGVycm9yQ29udGV4dHM6IGFueVxuXHQpIHtcblx0XHRjb25zdCBEcmFmdFN0YXR1cyA9IEZFTGlicmFyeS5EcmFmdFN0YXR1cztcblx0XHRjb25zdCBvUmVzb3VyY2VCdW5kbGUgPSBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5jb3JlXCIpO1xuXHRcdChvQ29udHJvbGxlci5nZXRWaWV3KCk/LmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIikgYXMgSW50ZXJuYWxNb2RlbENvbnRleHQpPy5zZXRQcm9wZXJ0eShcImdldEJvdW5kTWVzc2FnZXNGb3JNYXNzRWRpdFwiLCB0cnVlKTtcblx0XHRvQ29udHJvbGxlci5fZWRpdEZsb3cuZ2V0TWVzc2FnZUhhbmRsZXIoKS5zaG93TWVzc2FnZXMoe1xuXHRcdFx0b25CZWZvcmVTaG93TWVzc2FnZTogZnVuY3Rpb24gKG1lc3NhZ2VzOiBhbnksIHNob3dNZXNzYWdlUGFyYW1ldGVyczogYW55KSB7XG5cdFx0XHRcdC8vbWVzc2FnZXMuY29uY2F0ZW5hdGUobWVzc2FnZUhhbmRsaW5nLmdldE1lc3NhZ2VzKHRydWUsIHRydWUpKTtcblx0XHRcdFx0c2hvd01lc3NhZ2VQYXJhbWV0ZXJzLmZuR2V0TWVzc2FnZVN1YnRpdGxlID0gbWVzc2FnZUhhbmRsaW5nLnNldE1lc3NhZ2VTdWJ0aXRsZS5iaW5kKHt9LCBvVGFibGUsIGFDb250ZXh0cyk7XG5cdFx0XHRcdGNvbnN0IHVuYm91bmRFcnJvcnM6IGFueVtdID0gW107XG5cdFx0XHRcdG1lc3NhZ2VzLmZvckVhY2goZnVuY3Rpb24gKG1lc3NhZ2U6IGFueSkge1xuXHRcdFx0XHRcdGlmICghbWVzc2FnZS5nZXRUYXJnZXQoKSkge1xuXHRcdFx0XHRcdFx0dW5ib3VuZEVycm9ycy5wdXNoKG1lc3NhZ2UpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0aWYgKGFSZXN1bHRzLmxlbmd0aCA+IDAgJiYgZXJyb3JDb250ZXh0cy5sZW5ndGggPT09IDApIHtcblx0XHRcdFx0XHRvQ29udHJvbGxlci5fZWRpdEZsb3cuc2V0RHJhZnRTdGF0dXMoRHJhZnRTdGF0dXMuU2F2ZWQpO1xuXHRcdFx0XHRcdGNvbnN0IHN1Y2Nlc3NUb2FzdCA9IG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiQ19NQVNTX0VESVRfU1VDQ0VTU19UT0FTVFwiKTtcblx0XHRcdFx0XHRNZXNzYWdlVG9hc3Quc2hvdyhzdWNjZXNzVG9hc3QpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGVycm9yQ29udGV4dHMubGVuZ3RoIDwgKG9UYWJsZSBhcyBhbnkpLmdldFNlbGVjdGVkQ29udGV4dHMoKS5sZW5ndGgpIHtcblx0XHRcdFx0XHRvQ29udHJvbGxlci5fZWRpdEZsb3cuc2V0RHJhZnRTdGF0dXMoRHJhZnRTdGF0dXMuU2F2ZWQpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGVycm9yQ29udGV4dHMubGVuZ3RoID09PSAob1RhYmxlIGFzIGFueSkuZ2V0U2VsZWN0ZWRDb250ZXh0cygpLmxlbmd0aCkge1xuXHRcdFx0XHRcdG9Db250cm9sbGVyLl9lZGl0Rmxvdy5zZXREcmFmdFN0YXR1cyhEcmFmdFN0YXR1cy5DbGVhcik7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAob0NvbnRyb2xsZXIuZ2V0TW9kZWwoXCJ1aVwiKS5nZXRQcm9wZXJ0eShcIi9pc0VkaXRhYmxlXCIpICYmIHVuYm91bmRFcnJvcnMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRcdFx0c2hvd01lc3NhZ2VQYXJhbWV0ZXJzLnNob3dNZXNzYWdlQm94ID0gZmFsc2U7XG5cdFx0XHRcdFx0c2hvd01lc3NhZ2VQYXJhbWV0ZXJzLnNob3dNZXNzYWdlRGlhbG9nID0gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIHNob3dNZXNzYWdlUGFyYW1ldGVycztcblx0XHRcdH1cblx0XHR9KTtcblx0XHRpZiAob0luRGlhbG9nLmlzT3BlbigpKSB7XG5cdFx0XHRNYXNzRWRpdEhlbHBlci5jbG9zZURpYWxvZyhvSW5EaWFsb2cpO1xuXHRcdFx0KG9Db250cm9sbGVyLmdldFZpZXcoKT8uZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSBhcyBJbnRlcm5hbE1vZGVsQ29udGV4dCk/LnNldFByb3BlcnR5KFwic2tpcFBhdGNoSGFuZGxlcnNcIiwgZmFsc2UpO1xuXHRcdH1cblx0XHQob0NvbnRyb2xsZXIuZ2V0VmlldygpPy5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpIGFzIEludGVybmFsTW9kZWxDb250ZXh0KT8uc2V0UHJvcGVydHkoXCJnZXRCb3VuZE1lc3NhZ2VzRm9yTWFzc0VkaXRcIiwgZmFsc2UpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIGdlbmVyYXRlcyBzaWRlIGVmZmVjdHMgbWFwIGZyb20gc2lkZSBlZmZlY3RzIGlkcyh3aGljaCBpcyBhIGNvbWJpbmF0aW9uIG9mIGVudGl0eSB0eXBlIGFuZCBxdWFsaWZpZXIpLlxuXHQgKlxuXHQgKiBAcGFyYW0gb0VudGl0eVNldENvbnRleHRcblx0ICogQHBhcmFtIGFTaWRlRWZmZWN0c1xuXHQgKiBAcGFyYW0gb0NvbnRyb2xsZXJcblx0ICogQHBhcmFtIGFSZXN1bHRzXG5cdCAqIEByZXR1cm5zIFNpZGUgZWZmZWN0IG1hcCB3aXRoIGRhdGEuXG5cdCAqL1xuXHRnZXRTaWRlRWZmZWN0RGF0YUZvcktleTogZnVuY3Rpb24gKG9FbnRpdHlTZXRDb250ZXh0OiBhbnksIGFTaWRlRWZmZWN0czogYW55LCBvQ29udHJvbGxlcjogUGFnZUNvbnRyb2xsZXIsIGFSZXN1bHRzOiBhbnkpIHtcblx0XHRjb25zdCBzT3duZXJFbnRpdHlUeXBlID0gb0VudGl0eVNldENvbnRleHQuZ2V0UHJvcGVydHkoXCIkVHlwZVwiKTtcblx0XHRjb25zdCBiYXNlU2lkZUVmZmVjdHNNYXBBcnJheTogYW55ID0ge307XG5cblx0XHRhUmVzdWx0cy5mb3JFYWNoKChyZXN1bHQ6IGFueSkgPT4ge1xuXHRcdFx0Y29uc3Qgc1BhdGggPSByZXN1bHQua2V5VmFsdWU7XG5cdFx0XHRjb25zdCBzaWRlRWZmZWN0c0FycmF5ID0gRmllbGRIZWxwZXIuZ2V0U2lkZUVmZmVjdHNPbkVudGl0eUFuZFByb3BlcnR5KHNQYXRoLCBzT3duZXJFbnRpdHlUeXBlLCBhU2lkZUVmZmVjdHMpO1xuXHRcdFx0YmFzZVNpZGVFZmZlY3RzTWFwQXJyYXlbc1BhdGhdID0gb0NvbnRyb2xsZXIuX3NpZGVFZmZlY3RzLmdldFNpZGVFZmZlY3RzTWFwRm9yRmllbGRHcm91cHMoc2lkZUVmZmVjdHNBcnJheSk7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIGJhc2VTaWRlRWZmZWN0c01hcEFycmF5O1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBHaXZlIHRoZSBlbnRpdHkgdHlwZSBmb3IgYSBnaXZlbiBzcGF0aCBmb3IgZS5nLlJlcXVlc3RlZFF1YW50aXR5LlxuXHQgKlxuXHQgKiBAcGFyYW0gc1BhdGhcblx0ICogQHBhcmFtIHNFbnRpdHlUeXBlXG5cdCAqIEBwYXJhbSBvTWV0YU1vZGVsXG5cdCAqIEByZXR1cm5zIE9iamVjdCBoYXZpbmcgZW50aXR5LCBzcGF0aCBhbmQgbmF2aWdhdGlvbiBwYXRoLlxuXHQgKi9cblx0Zm5HZXRQYXRoRm9yU291cmNlUHJvcGVydHk6IGZ1bmN0aW9uIChzUGF0aDogYW55LCBzRW50aXR5VHlwZTogYW55LCBvTWV0YU1vZGVsOiBhbnkpIHtcblx0XHQvLyBpZiB0aGUgcHJvcGVydHkgcGF0aCBoYXMgYSBuYXZpZ2F0aW9uLCBnZXQgdGhlIHRhcmdldCBlbnRpdHkgdHlwZSBvZiB0aGUgbmF2aWdhdGlvblxuXHRcdGNvbnN0IHNOYXZpZ2F0aW9uUGF0aCA9XG5cdFx0XHRcdHNQYXRoLmluZGV4T2YoXCIvXCIpID4gMCA/IFwiL1wiICsgc0VudGl0eVR5cGUgKyBcIi9cIiArIHNQYXRoLnN1YnN0cigwLCBzUGF0aC5sYXN0SW5kZXhPZihcIi9cIikgKyAxKSArIFwiQHNhcHVpLm5hbWVcIiA6IGZhbHNlLFxuXHRcdFx0cE93bmVyRW50aXR5ID0gIXNOYXZpZ2F0aW9uUGF0aCA/IFByb21pc2UucmVzb2x2ZShzRW50aXR5VHlwZSkgOiBvTWV0YU1vZGVsLnJlcXVlc3RPYmplY3Qoc05hdmlnYXRpb25QYXRoKTtcblx0XHRzUGF0aCA9IHNOYXZpZ2F0aW9uUGF0aCA/IHNQYXRoLnN1YnN0cihzUGF0aC5sYXN0SW5kZXhPZihcIi9cIikgKyAxKSA6IHNQYXRoO1xuXHRcdHJldHVybiB7IHNQYXRoLCBwT3duZXJFbnRpdHksIHNOYXZpZ2F0aW9uUGF0aCB9O1xuXHR9LFxuXG5cdGZuR2V0RW50aXR5VHlwZU9mT3duZXI6IGZ1bmN0aW9uIChvTWV0YU1vZGVsOiBhbnksIGJhc2VOYXZQYXRoOiBzdHJpbmcsIG9FbnRpdHlTZXRDb250ZXh0OiBhbnksIHRhcmdldEVudGl0eTogc3RyaW5nLCBhVGFyZ2V0czogYW55KSB7XG5cdFx0Y29uc3Qgb3duZXJFbnRpdHlUeXBlID0gb0VudGl0eVNldENvbnRleHQuZ2V0UHJvcGVydHkoXCIkVHlwZVwiKTtcblx0XHRjb25zdCB7ICRUeXBlOiBwT3duZXIsICRQYXJ0bmVyOiBvd25lck5hdlBhdGggfSA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke29FbnRpdHlTZXRDb250ZXh0fS8ke2Jhc2VOYXZQYXRofWApOyAvLyBuYXYgcGF0aFxuXHRcdGlmIChvd25lck5hdlBhdGgpIHtcblx0XHRcdGNvbnN0IGVudGl0eU9iak9mT3duZXJQYXJ0bmVyID0gb01ldGFNb2RlbC5nZXRPYmplY3QoYC8ke3BPd25lcn0vJHtvd25lck5hdlBhdGh9YCk7XG5cdFx0XHRpZiAoZW50aXR5T2JqT2ZPd25lclBhcnRuZXIpIHtcblx0XHRcdFx0Y29uc3QgZW50aXR5VHlwZU9mT3duZXJQYXJ0bmVyID0gZW50aXR5T2JqT2ZPd25lclBhcnRuZXJbXCIkVHlwZVwiXTtcblx0XHRcdFx0Ly8gaWYgdGhlIGVudGl0eSB0eXBlcyBkZWZlciwgdGhlbiBiYXNlIG5hdiBwYXRoIGlzIG5vdCBmcm9tIG93bmVyXG5cdFx0XHRcdGlmIChlbnRpdHlUeXBlT2ZPd25lclBhcnRuZXIgIT09IG93bmVyRW50aXR5VHlwZSkge1xuXHRcdFx0XHRcdC8vIGlmIHRhcmdldCBQcm9wIGlzIG5vdCBmcm9tIG93bmVyLCB3ZSBhZGQgaXQgYXMgaW1tZWRpYXRlXG5cdFx0XHRcdFx0YVRhcmdldHMucHVzaCh0YXJnZXRFbnRpdHkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIGlmIHRoZXJlIGlzIG5vICRQYXJ0bmVyIGF0dHJpYnV0ZSwgaXQgbWF5IG5vdCBiZSBmcm9tIG93bmVyXG5cdFx0XHRhVGFyZ2V0cy5wdXNoKHRhcmdldEVudGl0eSk7XG5cdFx0fVxuXHRcdHJldHVybiBhVGFyZ2V0cztcblx0fSxcblxuXHQvKipcblx0ICogR2l2ZSB0YXJnZXRzIHRoYXQgYXJlIGltbWVkaWF0ZSBvciBkZWZlcnJlZCBiYXNlZCBvbiB0aGUgZW50aXR5IHR5cGUgb2YgdGhhdCB0YXJnZXQuXG5cdCAqXG5cdCAqXG5cdCAqIEBwYXJhbSBzaWRlRWZmZWN0c0RhdGFcblx0ICogQHBhcmFtIG9FbnRpdHlTZXRDb250ZXh0XG5cdCAqIEBwYXJhbSBzRW50aXR5VHlwZVxuXHQgKiBAcGFyYW0gb01ldGFNb2RlbFxuXHQgKiBAcmV0dXJucyBUYXJnZXRzIHRvIHJlcXVlc3Qgc2lkZSBlZmZlY3RzLlxuXHQgKi9cblx0Zm5HZXRUYXJnZXRzRm9yTWFzc0VkaXQ6IGZ1bmN0aW9uIChzaWRlRWZmZWN0c0RhdGE6IGFueSwgb0VudGl0eVNldENvbnRleHQ6IGFueSwgc0VudGl0eVR5cGU6IGFueSwgb01ldGFNb2RlbDogYW55KSB7XG5cdFx0Y29uc3QgeyBUYXJnZXRQcm9wZXJ0aWVzOiBhVGFyZ2V0UHJvcGVydGllcywgVGFyZ2V0RW50aXRpZXM6IGFUYXJnZXRFbnRpdGllcyB9ID0gc2lkZUVmZmVjdHNEYXRhO1xuXHRcdGNvbnN0IGFQcm9taXNlczogYW55ID0gW107XG5cdFx0bGV0IGFUYXJnZXRzOiBhbnkgPSBbXTtcblx0XHRjb25zdCBvd25lckVudGl0eVR5cGUgPSBvRW50aXR5U2V0Q29udGV4dC5nZXRQcm9wZXJ0eShcIiRUeXBlXCIpO1xuXG5cdFx0aWYgKHNFbnRpdHlUeXBlID09PSBvd25lckVudGl0eVR5cGUpIHtcblx0XHRcdC8vIGlmIFNhbGVzT3JkciBJdGVtXG5cdFx0XHRhVGFyZ2V0RW50aXRpZXM/LmZvckVhY2goKHRhcmdldEVudGl0eTogYW55KSA9PiB7XG5cdFx0XHRcdHRhcmdldEVudGl0eSA9IHRhcmdldEVudGl0eVtcIiROYXZpZ2F0aW9uUHJvcGVydHlQYXRoXCJdO1xuXHRcdFx0XHRsZXQgYmFzZU5hdlBhdGg6IHN0cmluZztcblx0XHRcdFx0aWYgKHRhcmdldEVudGl0eS5pbmNsdWRlcyhcIi9cIikpIHtcblx0XHRcdFx0XHRiYXNlTmF2UGF0aCA9IHRhcmdldEVudGl0eS5zcGxpdChcIi9cIilbMF07XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0YmFzZU5hdlBhdGggPSB0YXJnZXRFbnRpdHk7XG5cdFx0XHRcdH1cblx0XHRcdFx0YVRhcmdldHMgPSBNYXNzRWRpdEhlbHBlci5mbkdldEVudGl0eVR5cGVPZk93bmVyKG9NZXRhTW9kZWwsIGJhc2VOYXZQYXRoLCBvRW50aXR5U2V0Q29udGV4dCwgdGFyZ2V0RW50aXR5LCBhVGFyZ2V0cyk7XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRpZiAoYVRhcmdldFByb3BlcnRpZXMubGVuZ3RoKSB7XG5cdFx0XHRhVGFyZ2V0UHJvcGVydGllcy5mb3JFYWNoKCh0YXJnZXRQcm9wOiBhbnkpID0+IHtcblx0XHRcdFx0Y29uc3QgeyBwT3duZXJFbnRpdHkgfSA9IE1hc3NFZGl0SGVscGVyLmZuR2V0UGF0aEZvclNvdXJjZVByb3BlcnR5KHRhcmdldFByb3AsIHNFbnRpdHlUeXBlLCBvTWV0YU1vZGVsKTtcblx0XHRcdFx0YVByb21pc2VzLnB1c2goXG5cdFx0XHRcdFx0cE93bmVyRW50aXR5LnRoZW4oKHJlc3VsdEVudGl0eTogYW55KSA9PiB7XG5cdFx0XHRcdFx0XHQvLyBpZiBlbnRpdHkgaXMgU2FsZXNPcmRlckl0ZW0sIFRhcmdldCBQcm9wZXJ0eSBpcyBmcm9tIEl0ZW1zIHRhYmxlXG5cdFx0XHRcdFx0XHRpZiAocmVzdWx0RW50aXR5ID09PSBvd25lckVudGl0eVR5cGUpIHtcblx0XHRcdFx0XHRcdFx0YVRhcmdldHMucHVzaCh0YXJnZXRQcm9wKTsgLy8gZ2V0IGltbWVkaWF0ZSB0YXJnZXRzXG5cdFx0XHRcdFx0XHR9IGVsc2UgaWYgKHRhcmdldFByb3AuaW5jbHVkZXMoXCIvXCIpKSB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IGJhc2VOYXZQYXRoID0gdGFyZ2V0UHJvcC5zcGxpdChcIi9cIilbMF07XG5cdFx0XHRcdFx0XHRcdGFUYXJnZXRzID0gTWFzc0VkaXRIZWxwZXIuZm5HZXRFbnRpdHlUeXBlT2ZPd25lcihcblx0XHRcdFx0XHRcdFx0XHRvTWV0YU1vZGVsLFxuXHRcdFx0XHRcdFx0XHRcdGJhc2VOYXZQYXRoLFxuXHRcdFx0XHRcdFx0XHRcdG9FbnRpdHlTZXRDb250ZXh0LFxuXHRcdFx0XHRcdFx0XHRcdHRhcmdldFByb3AsXG5cdFx0XHRcdFx0XHRcdFx0YVRhcmdldHNcblx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoYVRhcmdldHMpO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdCk7XG5cdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0YVByb21pc2VzLnB1c2goUHJvbWlzZS5yZXNvbHZlKGFUYXJnZXRzKSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIFByb21pc2UuYWxsKGFQcm9taXNlcyk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFRoaXMgZnVuY3Rpb24gY2hlY2tzIGlmIGluIHRoZSBnaXZlbiBzaWRlIEVmZmVjdHMgT2JqLCBpZiBfSXRlbSBpcyBzZXQgYXMgVGFyZ2V0IEVudGl0eSBmb3IgYW55IHNpZGUgRWZmZWN0cyBvblxuXHQgKiBvdGhlciBlbnRpdHkgc2V0LlxuXHQgKlxuXHQgKiBAcGFyYW0gc2lkZUVmZmVjdHNNYXBcblx0ICogQHBhcmFtIG9FbnRpdHlTZXRDb250ZXh0XG5cdCAqIEByZXR1cm5zIExlbmd0aCBvZiBzaWRlRWZmZWN0c0FycmF5IHdoZXJlIGN1cnJlbnQgRW50aXR5IGlzIHNldCBhcyBUYXJnZXQgRW50aXR5XG5cdCAqL1xuXHRjaGVja0lmRW50aXR5RXhpc3RzQXNUYXJnZXRFbnRpdHk6IChcblx0XHRzaWRlRWZmZWN0c01hcDogTWFzc0VkaXRGaWVsZFNpZGVFZmZlY3REaWN0aW9uYXJ5IHwgRmllbGRTaWRlRWZmZWN0RGljdGlvbmFyeSxcblx0XHRvRW50aXR5U2V0Q29udGV4dDogQ29udGV4dFxuXHQpID0+IHtcblx0XHRjb25zdCBvd25lckVudGl0eVR5cGUgPSBvRW50aXR5U2V0Q29udGV4dC5nZXRQcm9wZXJ0eShcIiRUeXBlXCIpO1xuXHRcdGNvbnN0IHNpZGVFZmZlY3RzT25PdGhlckVudGl0eTogTWFzc0VkaXRGaWVsZFNpZGVFZmZlY3RQcm9wZXJ0eVR5cGVbXSA9IE9iamVjdC52YWx1ZXMoc2lkZUVmZmVjdHNNYXApLmZpbHRlcihcblx0XHRcdChvYmo6IE1hc3NFZGl0RmllbGRTaWRlRWZmZWN0UHJvcGVydHlUeXBlKSA9PiB7XG5cdFx0XHRcdHJldHVybiBvYmoubmFtZS5pbmRleE9mKG93bmVyRW50aXR5VHlwZSkgPT0gLTE7XG5cdFx0XHR9XG5cdFx0KTtcblxuXHRcdGNvbnN0IGVudGl0eVNldE5hbWUgPSBvRW50aXR5U2V0Q29udGV4dC5nZXRQYXRoKCkuc3BsaXQoXCIvXCIpLnBvcCgpO1xuXHRcdGNvbnN0IHNpZGVFZmZlY3RzV2l0aEN1cnJlbnRFbnRpdHlBc1RhcmdldCA9IHNpZGVFZmZlY3RzT25PdGhlckVudGl0eS5maWx0ZXIoKG9iajogTWFzc0VkaXRGaWVsZFNpZGVFZmZlY3RQcm9wZXJ0eVR5cGUpID0+IHtcblx0XHRcdGNvbnN0IHRhcmdldEVudGl0aWVzQXJyYXk6IFNpZGVFZmZlY3RzVGFyZ2V0RW50aXR5VHlwZVtdIHwgdW5kZWZpbmVkID0gb2JqLnNpZGVFZmZlY3RzLlRhcmdldEVudGl0aWVzO1xuXHRcdFx0cmV0dXJuIHRhcmdldEVudGl0aWVzQXJyYXk/LmZpbHRlcihcblx0XHRcdFx0KGlubmVyT2JqOiBTaWRlRWZmZWN0c1RhcmdldEVudGl0eVR5cGUpID0+IGlubmVyT2JqW1wiJE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGhcIl0gPT09IGVudGl0eVNldE5hbWVcblx0XHRcdCkubGVuZ3RoXG5cdFx0XHRcdD8gb2JqXG5cdFx0XHRcdDogZmFsc2U7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIHNpZGVFZmZlY3RzV2l0aEN1cnJlbnRFbnRpdHlBc1RhcmdldC5sZW5ndGg7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFVwb24gdXBkYXRpbmcgdGhlIGZpZWxkLCBhcnJheSBvZiBpbW1lZGlhdGUgYW5kIGRlZmVycmVkIHNpZGUgZWZmZWN0cyBmb3IgdGhhdCBmaWVsZCBhcmUgY3JlYXRlZC5cblx0ICogSWYgdGhlcmUgYXJlIGFueSBmYWlsZWQgc2lkZSBlZmZlY3RzIGZvciB0aGF0IGNvbnRleHQsIHRoZXkgd2lsbCBhbHNvIGJlIHVzZWQgdG8gZ2VuZXJhdGUgdGhlIG1hcC5cblx0ICogSWYgdGhlIGZpZWxkIGhhcyB0ZXh0IGFzc29jaWF0ZWQgd2l0aCBpdCwgdGhlbiBhZGQgaXQgdG8gcmVxdWVzdCBzaWRlIGVmZmVjdHMuXG5cdCAqXG5cdCAqIEBwYXJhbSBtUGFyYW1zXG5cdCAqIEBwYXJhbSBtUGFyYW1zLm9Db250cm9sbGVyIENvbnRyb2xsZXJcblx0ICogQHBhcmFtIG1QYXJhbXMub0ZpZWxkUHJvbWlzZSBQcm9taXNlIHRvIHVwZGF0ZSBmaWVsZFxuXHQgKiBAcGFyYW0gbVBhcmFtcy5zaWRlRWZmZWN0TWFwIFNpZGVFZmZlY3RzTWFwIGZvciB0aGUgZmllbGRcblx0ICogQHBhcmFtIG1QYXJhbXMudGV4dFBhdGhzIFRleHRQYXRocyBvZiB0aGUgZmllbGQgaWYgYW55XG5cdCAqIEBwYXJhbSBtUGFyYW1zLmdyb3VwSWQgR3JvdXAgSWQgdG8gdXNlZCB0byBncm91cCByZXF1ZXN0c1xuXHQgKiBAcGFyYW0gbVBhcmFtcy5rZXkgS2V5VmFsdWUgb2YgdGhlIGZpZWxkXG5cdCAqIEBwYXJhbSBtUGFyYW1zLm9FbnRpdHlTZXRDb250ZXh0IEVudGl0eVNldGNvbnRleHRcblx0ICogQHBhcmFtIG1QYXJhbXMub01ldGFNb2RlbCBNZXRhbW9kZWwgZGF0YVxuXHQgKiBAcGFyYW0gbVBhcmFtcy5zZWxlY3RlZENvbnRleHQgU2VsZWN0ZWQgcm93IGNvbnRleHRcblx0ICogQHBhcmFtIG1QYXJhbXMuZGVmZXJyZWRUYXJnZXRzRm9yQVF1YWxpZmllZE5hbWUgRGVmZXJyZWQgdGFyZ2V0cyBkYXRhXG5cdCAqIEByZXR1cm5zIFByb21pc2UgZm9yIGFsbCBpbW1lZGlhdGVseSByZXF1ZXN0ZWQgc2lkZSBlZmZlY3RzLlxuXHQgKi9cblx0aGFuZGxlTWFzc0VkaXRGaWVsZFVwZGF0ZUFuZFJlcXVlc3RTaWRlRWZmZWN0czogYXN5bmMgZnVuY3Rpb24gKG1QYXJhbXM6IERhdGFUb1VwZGF0ZUZpZWxkQW5kU2lkZUVmZmVjdHNUeXBlKSB7XG5cdFx0Y29uc3Qge1xuXHRcdFx0b0NvbnRyb2xsZXIsXG5cdFx0XHRvRmllbGRQcm9taXNlLFxuXHRcdFx0c2lkZUVmZmVjdHNNYXAsXG5cdFx0XHR0ZXh0UGF0aHMsXG5cdFx0XHRncm91cElkLFxuXHRcdFx0a2V5LFxuXHRcdFx0b0VudGl0eVNldENvbnRleHQsXG5cdFx0XHRvTWV0YU1vZGVsLFxuXHRcdFx0b1NlbGVjdGVkQ29udGV4dCxcblx0XHRcdGRlZmVycmVkVGFyZ2V0c0ZvckFRdWFsaWZpZWROYW1lXG5cdFx0fSA9IG1QYXJhbXM7XG5cdFx0Y29uc3QgaW1tZWRpYXRlU2lkZUVmZmVjdHNQcm9taXNlcyA9IFtvRmllbGRQcm9taXNlXTtcblx0XHRjb25zdCBvd25lckVudGl0eVR5cGUgPSBvRW50aXR5U2V0Q29udGV4dC5nZXRQcm9wZXJ0eShcIiRUeXBlXCIpO1xuXHRcdGNvbnN0IG9BcHBDb21wb25lbnQgPSBDb21tb25VdGlscy5nZXRBcHBDb21wb25lbnQob0NvbnRyb2xsZXIuZ2V0VmlldygpKTtcblx0XHRjb25zdCBvU2lkZUVmZmVjdHNTZXJ2aWNlID0gb0FwcENvbXBvbmVudC5nZXRTaWRlRWZmZWN0c1NlcnZpY2UoKTtcblxuXHRcdGNvbnN0IGlzU2lkZUVmZmVjdHNXaXRoQ3VycmVudEVudGl0eUFzVGFyZ2V0ID0gTWFzc0VkaXRIZWxwZXIuY2hlY2tJZkVudGl0eUV4aXN0c0FzVGFyZ2V0RW50aXR5KHNpZGVFZmZlY3RzTWFwLCBvRW50aXR5U2V0Q29udGV4dCk7XG5cblx0XHRpZiAoc2lkZUVmZmVjdHNNYXApIHtcblx0XHRcdGNvbnN0IGFsbEVudGl0eVR5cGVzV2l0aFF1YWxpZmllciA9IE9iamVjdC5rZXlzKHNpZGVFZmZlY3RzTWFwKTtcblx0XHRcdGNvbnN0IHNpZGVFZmZlY3RzRGF0YUZvckZpZWxkOiBhbnkgPSBPYmplY3QudmFsdWVzKHNpZGVFZmZlY3RzTWFwKTtcblxuXHRcdFx0Y29uc3QgbVZpc2l0ZWRTaWRlRWZmZWN0czogYW55ID0ge307XG5cdFx0XHRkZWZlcnJlZFRhcmdldHNGb3JBUXVhbGlmaWVkTmFtZVtrZXldID0ge307XG5cdFx0XHRmb3IgKGNvbnN0IFtpbmRleCwgZGF0YV0gb2Ygc2lkZUVmZmVjdHNEYXRhRm9yRmllbGQuZW50cmllcygpKSB7XG5cdFx0XHRcdGNvbnN0IGVudGl0eVR5cGVXaXRoUXVhbGlmaWVyID0gYWxsRW50aXR5VHlwZXNXaXRoUXVhbGlmaWVyW2luZGV4XTtcblx0XHRcdFx0Y29uc3Qgc0VudGl0eVR5cGUgPSBlbnRpdHlUeXBlV2l0aFF1YWxpZmllci5zcGxpdChcIiNcIilbMF07XG5cdFx0XHRcdGNvbnN0IG9Db250ZXh0OiBhbnkgPSBvQ29udHJvbGxlci5fc2lkZUVmZmVjdHMuZ2V0Q29udGV4dEZvclNpZGVFZmZlY3RzKG9TZWxlY3RlZENvbnRleHQsIHNFbnRpdHlUeXBlKTtcblx0XHRcdFx0ZGF0YS5jb250ZXh0ID0gb0NvbnRleHQ7XG5cblx0XHRcdFx0Y29uc3QgYWxsRmFpbGVkU2lkZUVmZmVjdHMgPSBvQ29udHJvbGxlci5fc2lkZUVmZmVjdHMuZ2V0UmVnaXN0ZXJlZEZhaWxlZFJlcXVlc3RzKCk7XG5cdFx0XHRcdGNvbnN0IGFGYWlsZWRTaWRlRWZmZWN0cyA9IGFsbEZhaWxlZFNpZGVFZmZlY3RzW29Db250ZXh0LmdldFBhdGgoKV07XG5cdFx0XHRcdG9Db250cm9sbGVyLl9zaWRlRWZmZWN0cy51bnJlZ2lzdGVyRmFpbGVkU2lkZUVmZmVjdHNGb3JBQ29udGV4dChvQ29udGV4dCk7XG5cdFx0XHRcdGxldCBzaWRlRWZmZWN0c0ZvckN1cnJlbnRDb250ZXh0ID0gW2RhdGEuc2lkZUVmZmVjdHNdO1xuXHRcdFx0XHRzaWRlRWZmZWN0c0ZvckN1cnJlbnRDb250ZXh0ID1cblx0XHRcdFx0XHRhRmFpbGVkU2lkZUVmZmVjdHMgJiYgYUZhaWxlZFNpZGVFZmZlY3RzLmxlbmd0aFxuXHRcdFx0XHRcdFx0PyBzaWRlRWZmZWN0c0ZvckN1cnJlbnRDb250ZXh0LmNvbmNhdChhRmFpbGVkU2lkZUVmZmVjdHMpXG5cdFx0XHRcdFx0XHQ6IHNpZGVFZmZlY3RzRm9yQ3VycmVudENvbnRleHQ7XG5cdFx0XHRcdG1WaXNpdGVkU2lkZUVmZmVjdHNbb0NvbnRleHRdID0ge307XG5cdFx0XHRcdGZvciAoY29uc3QgYVNpZGVFZmZlY3Qgb2Ygc2lkZUVmZmVjdHNGb3JDdXJyZW50Q29udGV4dCkge1xuXHRcdFx0XHRcdGlmICghbVZpc2l0ZWRTaWRlRWZmZWN0c1tvQ29udGV4dF0uaGFzT3duUHJvcGVydHkoYVNpZGVFZmZlY3QuZnVsbHlRdWFsaWZpZWROYW1lKSkge1xuXHRcdFx0XHRcdFx0bVZpc2l0ZWRTaWRlRWZmZWN0c1tvQ29udGV4dF1bYVNpZGVFZmZlY3QuZnVsbHlRdWFsaWZpZWROYW1lXSA9IHRydWU7XG5cdFx0XHRcdFx0XHRsZXQgYUltbWVkaWF0ZVRhcmdldHM6IGFueVtdID0gW10sXG5cdFx0XHRcdFx0XHRcdGFsbFRhcmdldHM6IGFueVtdID0gW10sXG5cdFx0XHRcdFx0XHRcdHRyaWdnZXJBY3Rpb25OYW1lOiBTdHJpbmcgfCB1bmRlZmluZWQ7XG5cblx0XHRcdFx0XHRcdGNvbnN0IGZuR2V0SW1tZWRpYXRlVGFyZ2V0c0FuZEFjdGlvbnMgPSBhc3luYyBmdW5jdGlvbiAobVNpZGVFZmZlY3Q6IFNpZGVFZmZlY3RzVHlwZSkge1xuXHRcdFx0XHRcdFx0XHRjb25zdCB7IFRhcmdldFByb3BlcnRpZXM6IGFUYXJnZXRQcm9wZXJ0aWVzLCBUYXJnZXRFbnRpdGllczogYVRhcmdldEVudGl0aWVzIH0gPSBtU2lkZUVmZmVjdDtcblx0XHRcdFx0XHRcdFx0Y29uc3Qgc2lkZUVmZmVjdEVudGl0eVR5cGUgPSBtU2lkZUVmZmVjdC5mdWxseVF1YWxpZmllZE5hbWUuc3BsaXQoXCJAXCIpWzBdO1xuXHRcdFx0XHRcdFx0XHRjb25zdCB0YXJnZXRzQXJyYXlGb3JBbGxQcm9wZXJ0aWVzID0gYXdhaXQgTWFzc0VkaXRIZWxwZXIuZm5HZXRUYXJnZXRzRm9yTWFzc0VkaXQoXG5cdFx0XHRcdFx0XHRcdFx0bVNpZGVFZmZlY3QsXG5cdFx0XHRcdFx0XHRcdFx0b0VudGl0eVNldENvbnRleHQsXG5cdFx0XHRcdFx0XHRcdFx0c2lkZUVmZmVjdEVudGl0eVR5cGUsXG5cdFx0XHRcdFx0XHRcdFx0b01ldGFNb2RlbFxuXHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRhSW1tZWRpYXRlVGFyZ2V0cyA9IHRhcmdldHNBcnJheUZvckFsbFByb3BlcnRpZXNbMF07XG5cdFx0XHRcdFx0XHRcdGFsbFRhcmdldHMgPSAoYVRhcmdldFByb3BlcnRpZXMgfHwgW10pLmNvbmNhdCgoYVRhcmdldEVudGl0aWVzIGFzIGFueVtdKSB8fCBbXSk7XG5cblx0XHRcdFx0XHRcdFx0Y29uc3QgYWN0aW9uTmFtZTogc3RyaW5nIHwgdW5kZWZpbmVkID0gKG1TaWRlRWZmZWN0IGFzIE9EYXRhU2lkZUVmZmVjdHNUeXBlKS5UcmlnZ2VyQWN0aW9uO1xuXHRcdFx0XHRcdFx0XHRjb25zdCBhRGVmZXJyZWRUYXJnZXRzID0gYWxsVGFyZ2V0cy5maWx0ZXIoKHRhcmdldDogYW55KSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuICFhSW1tZWRpYXRlVGFyZ2V0cy5pbmNsdWRlcyh0YXJnZXQpO1xuXHRcdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0XHRkZWZlcnJlZFRhcmdldHNGb3JBUXVhbGlmaWVkTmFtZVtrZXldW21TaWRlRWZmZWN0LmZ1bGx5UXVhbGlmaWVkTmFtZV0gPSB7XG5cdFx0XHRcdFx0XHRcdFx0YVRhcmdldHM6IGFEZWZlcnJlZFRhcmdldHMsXG5cdFx0XHRcdFx0XHRcdFx0b0NvbnRleHQ6IG9Db250ZXh0LFxuXHRcdFx0XHRcdFx0XHRcdG1TaWRlRWZmZWN0XG5cdFx0XHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRcdFx0Ly8gaWYgZW50aXR5IGlzIG90aGVyIHRoYW4gaXRlbXMgdGFibGUgdGhlbiBhY3Rpb24gaXMgZGVmZXJlZFxuXHRcdFx0XHRcdFx0XHRpZiAoYWN0aW9uTmFtZSAmJiBzaWRlRWZmZWN0RW50aXR5VHlwZSA9PT0gb3duZXJFbnRpdHlUeXBlKSB7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gc3RhdGljIGFjdGlvbiBpcyBvbiBjb2xsZWN0aW9uLCBzbyB3ZSBkZWZlciBpdCwgZWxzZSBhZGQgdG8gaW1tZWRpYXRlIHJlcXVlc3RzIGFycmF5XG5cdFx0XHRcdFx0XHRcdFx0Y29uc3QgaXNTdGF0aWNBY3Rpb24gPSBUYWJsZUhlbHBlci5faXNTdGF0aWNBY3Rpb24ob01ldGFNb2RlbC5nZXRPYmplY3QoYC8ke2FjdGlvbk5hbWV9YCksIGFjdGlvbk5hbWUpO1xuXHRcdFx0XHRcdFx0XHRcdGlmICghaXNTdGF0aWNBY3Rpb24pIHtcblx0XHRcdFx0XHRcdFx0XHRcdHRyaWdnZXJBY3Rpb25OYW1lID0gYWN0aW9uTmFtZTtcblx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0ZGVmZXJyZWRUYXJnZXRzRm9yQVF1YWxpZmllZE5hbWVba2V5XVttU2lkZUVmZmVjdC5mdWxseVF1YWxpZmllZE5hbWVdW1wiVHJpZ2dlckFjdGlvblwiXSA9IGFjdGlvbk5hbWU7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdGRlZmVycmVkVGFyZ2V0c0ZvckFRdWFsaWZpZWROYW1lW2tleV1bbVNpZGVFZmZlY3QuZnVsbHlRdWFsaWZpZWROYW1lXVtcIlRyaWdnZXJBY3Rpb25cIl0gPSBhY3Rpb25OYW1lO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0aWYgKGlzU2lkZUVmZmVjdHNXaXRoQ3VycmVudEVudGl0eUFzVGFyZ2V0KSB7XG5cdFx0XHRcdFx0XHRcdFx0YUltbWVkaWF0ZVRhcmdldHMgPSBbXTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0XHRcdGFUYXJnZXRzOiBhSW1tZWRpYXRlVGFyZ2V0cyxcblx0XHRcdFx0XHRcdFx0XHRUcmlnZ2VyQWN0aW9uOiB0cmlnZ2VyQWN0aW9uTmFtZVxuXHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdGltbWVkaWF0ZVNpZGVFZmZlY3RzUHJvbWlzZXMucHVzaChcblx0XHRcdFx0XHRcdFx0b0NvbnRyb2xsZXIuX3NpZGVFZmZlY3RzLnJlcXVlc3RTaWRlRWZmZWN0cyhhU2lkZUVmZmVjdCwgb0NvbnRleHQsIGdyb3VwSWQsIGZuR2V0SW1tZWRpYXRlVGFyZ2V0c0FuZEFjdGlvbnMpXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAodGV4dFBhdGhzPy5ba2V5XSAmJiB0ZXh0UGF0aHNba2V5XS5sZW5ndGgpIHtcblx0XHRcdGltbWVkaWF0ZVNpZGVFZmZlY3RzUHJvbWlzZXMucHVzaChvU2lkZUVmZmVjdHNTZXJ2aWNlLnJlcXVlc3RTaWRlRWZmZWN0cyh0ZXh0UGF0aHNba2V5XSwgb1NlbGVjdGVkQ29udGV4dCwgZ3JvdXBJZCkpO1xuXHRcdH1cblx0XHRyZXR1cm4gKFByb21pc2UgYXMgYW55KS5hbGxTZXR0bGVkKGltbWVkaWF0ZVNpZGVFZmZlY3RzUHJvbWlzZXMpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDcmVhdGUgdGhlIG1hc3MgZWRpdCBkaWFsb2cuXG5cdCAqXG5cdCAqIEBwYXJhbSBvVGFibGUgSW5zdGFuY2Ugb2YgVGFibGVcblx0ICogQHBhcmFtIGFDb250ZXh0cyBDb250ZXh0cyBmb3IgbWFzcyBlZGl0XG5cdCAqIEBwYXJhbSBvQ29udHJvbGxlciBDb250cm9sbGVyIGZvciB0aGUgdmlld1xuXHQgKiBAcmV0dXJucyBQcm9taXNlIHJldHVybmluZyBpbnN0YW5jZSBvZiBkaWFsb2cuXG5cdCAqL1xuXHRjcmVhdGVEaWFsb2c6IGFzeW5jIGZ1bmN0aW9uIChvVGFibGU6IFRhYmxlLCBhQ29udGV4dHM6IGFueVtdLCBvQ29udHJvbGxlcjogUGFnZUNvbnRyb2xsZXIpOiBQcm9taXNlPGFueT4ge1xuXHRcdGNvbnN0IHNGcmFnbWVudE5hbWUgPSBcInNhcC9mZS9jb3JlL2NvbnRyb2xzL21hc3NFZGl0L01hc3NFZGl0RGlhbG9nXCIsXG5cdFx0XHRhRGF0YUFycmF5OiBhbnlbXSA9IFtdLFxuXHRcdFx0b1Jlc291cmNlQnVuZGxlID0gQ29yZS5nZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUoXCJzYXAuZmUuY29yZVwiKSxcblx0XHRcdG9EZWZhdWx0VmFsdWVzID0gTWFzc0VkaXRIZWxwZXIuZ2V0RGVmYXVsdFRleHRzRm9yRGlhbG9nKG9SZXNvdXJjZUJ1bmRsZSwgYUNvbnRleHRzLmxlbmd0aCwgb1RhYmxlKSxcblx0XHRcdG9EYXRhRmllbGRNb2RlbCA9IE1hc3NFZGl0SGVscGVyLnByZXBhcmVEYXRhRm9yRGlhbG9nKG9UYWJsZSwgYUNvbnRleHRzLCBhRGF0YUFycmF5KSxcblx0XHRcdGRpYWxvZ0NvbnRleHQgPSBNYXNzRWRpdEhlbHBlci5nZXREaWFsb2dDb250ZXh0KG9UYWJsZSksXG5cdFx0XHRvRGlhbG9nRGF0YU1vZGVsID0gTWFzc0VkaXRIZWxwZXIuc2V0UnVudGltZU1vZGVsT25EaWFsb2coYUNvbnRleHRzLCBhRGF0YUFycmF5LCBvRGVmYXVsdFZhbHVlcywgZGlhbG9nQ29udGV4dCksXG5cdFx0XHRtb2RlbCA9IG9UYWJsZS5nZXRNb2RlbCgpLFxuXHRcdFx0bWV0YU1vZGVsID0gbW9kZWwuZ2V0TWV0YU1vZGVsKCkgYXMgT0RhdGFNZXRhTW9kZWwsXG5cdFx0XHRpdGVtc01vZGVsID0gbmV3IFRlbXBsYXRlTW9kZWwob0RhdGFGaWVsZE1vZGVsLmdldERhdGEoKSwgbWV0YU1vZGVsKTtcblxuXHRcdGNvbnN0IG9GcmFnbWVudCA9IFhNTFRlbXBsYXRlUHJvY2Vzc29yLmxvYWRUZW1wbGF0ZShzRnJhZ21lbnROYW1lLCBcImZyYWdtZW50XCIpO1xuXG5cdFx0Y29uc3Qgb0NyZWF0ZWRGcmFnbWVudCA9IGF3YWl0IFByb21pc2UucmVzb2x2ZShcblx0XHRcdFhNTFByZXByb2Nlc3Nvci5wcm9jZXNzKFxuXHRcdFx0XHRvRnJhZ21lbnQsXG5cdFx0XHRcdHsgbmFtZTogc0ZyYWdtZW50TmFtZSB9LFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YmluZGluZ0NvbnRleHRzOiB7XG5cdFx0XHRcdFx0XHRkYXRhRmllbGRNb2RlbDogaXRlbXNNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIiksXG5cdFx0XHRcdFx0XHRtZXRhTW9kZWw6IG1ldGFNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIiksXG5cdFx0XHRcdFx0XHRjb250ZXh0UGF0aDogbWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KG1ldGFNb2RlbC5nZXRNZXRhUGF0aChkaWFsb2dDb250ZXh0LmdldFBhdGgoKSkpXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRtb2RlbHM6IHtcblx0XHRcdFx0XHRcdGRhdGFGaWVsZE1vZGVsOiBpdGVtc01vZGVsLFxuXHRcdFx0XHRcdFx0bWV0YU1vZGVsOiBtZXRhTW9kZWwsXG5cdFx0XHRcdFx0XHRjb250ZXh0UGF0aDogbWV0YU1vZGVsXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHQpXG5cdFx0KTtcblx0XHRjb25zdCBvRGlhbG9nQ29udGVudCA9IGF3YWl0IEZyYWdtZW50LmxvYWQoeyBkZWZpbml0aW9uOiBvQ3JlYXRlZEZyYWdtZW50IH0pO1xuXHRcdGNvbnN0IG9EaWFsb2cgPSBuZXcgRGlhbG9nKHtcblx0XHRcdHJlc2l6YWJsZTogdHJ1ZSxcblx0XHRcdHRpdGxlOiBvRGVmYXVsdFZhbHVlcy5tYXNzRWRpdFRpdGxlLFxuXHRcdFx0Y29udGVudDogW29EaWFsb2dDb250ZW50IGFzIGFueV0sXG5cdFx0XHRhZnRlck9wZW46IE1hc3NFZGl0SGVscGVyLm9uRGlhbG9nT3Blbixcblx0XHRcdGJlZ2luQnV0dG9uOiBuZXcgQnV0dG9uKHtcblx0XHRcdFx0dGV4dDogTWFzc0VkaXRIZWxwZXIuaGVscGVycy5nZXRFeHBCaW5kaW5nRm9yQXBwbHlCdXR0b25UeHQob0RlZmF1bHRWYWx1ZXMsIG9EYXRhRmllbGRNb2RlbC5nZXRPYmplY3QoXCIvXCIpKSxcblx0XHRcdFx0dHlwZTogXCJFbXBoYXNpemVkXCIsXG5cdFx0XHRcdHByZXNzOiBhc3luYyBmdW5jdGlvbiAob0V2ZW50OiBhbnkpIHtcblx0XHRcdFx0XHRtZXNzYWdlSGFuZGxpbmcucmVtb3ZlQm91bmRUcmFuc2l0aW9uTWVzc2FnZXMoKTtcblx0XHRcdFx0XHRtZXNzYWdlSGFuZGxpbmcucmVtb3ZlVW5ib3VuZFRyYW5zaXRpb25NZXNzYWdlcygpO1xuXHRcdFx0XHRcdChvQ29udHJvbGxlci5nZXRWaWV3KCk/LmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIikgYXMgSW50ZXJuYWxNb2RlbENvbnRleHQpPy5zZXRQcm9wZXJ0eShcInNraXBQYXRjaEhhbmRsZXJzXCIsIHRydWUpO1xuXHRcdFx0XHRcdGNvbnN0IG9JbkRpYWxvZyA9IG9FdmVudC5nZXRTb3VyY2UoKS5nZXRQYXJlbnQoKTtcblx0XHRcdFx0XHRjb25zdCBvTW9kZWwgPSBvSW5EaWFsb2cuZ2V0TW9kZWwoXCJmaWVsZHNJbmZvXCIpO1xuXHRcdFx0XHRcdGNvbnN0IGFSZXN1bHRzID0gb01vZGVsLmdldFByb3BlcnR5KFwiL3Jlc3VsdHNcIik7XG5cblx0XHRcdFx0XHRjb25zdCBvTWV0YU1vZGVsID0gb1RhYmxlICYmIChvVGFibGUuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSBhcyBhbnkpLFxuXHRcdFx0XHRcdFx0c0N1cnJlbnRFbnRpdHlTZXROYW1lID0gb1RhYmxlLmRhdGEoXCJtZXRhUGF0aFwiKSxcblx0XHRcdFx0XHRcdG9FbnRpdHlTZXRDb250ZXh0ID0gb01ldGFNb2RlbC5nZXRDb250ZXh0KHNDdXJyZW50RW50aXR5U2V0TmFtZSk7XG5cdFx0XHRcdFx0Y29uc3QgYVNpZGVFZmZlY3RzID0gYXdhaXQgU2lkZUVmZmVjdHNIZWxwZXIuZ2VuZXJhdGVTaWRlRWZmZWN0c01hcEZyb21NZXRhTW9kZWwob01ldGFNb2RlbCk7XG5cdFx0XHRcdFx0Y29uc3QgZXJyb3JDb250ZXh0czogYW55W10gPSBbXTtcblx0XHRcdFx0XHRjb25zdCB0ZXh0UGF0aHMgPSBvTW9kZWwuZ2V0UHJvcGVydHkoXCIvdGV4dFBhdGhzXCIpO1xuXHRcdFx0XHRcdGNvbnN0IGFQcm9wZXJ0eVJlYWRhYmxlSW5mbyA9IG9Nb2RlbC5nZXRQcm9wZXJ0eShcIi9yZWFkYWJsZVByb3BlcnR5RGF0YVwiKTtcblx0XHRcdFx0XHRsZXQgZ3JvdXBJZDogc3RyaW5nO1xuXHRcdFx0XHRcdGxldCBhbGxTaWRlRWZmZWN0czogYW55W107XG5cdFx0XHRcdFx0Y29uc3QgbWFzc0VkaXRQcm9taXNlczogYW55ID0gW107XG5cdFx0XHRcdFx0Y29uc3QgZmFpbGVkRmllbGRzRGF0YTogYW55ID0ge307XG5cdFx0XHRcdFx0Y29uc3Qgc2VsZWN0ZWRSb3dzTGVuZ3RoID0gYUNvbnRleHRzLmxlbmd0aDtcblx0XHRcdFx0XHRjb25zdCBkZWZlcnJlZFRhcmdldHNGb3JBUXVhbGlmaWVkTmFtZTogYW55ID0ge307XG5cdFx0XHRcdFx0Y29uc3QgYmFzZVNpZGVFZmZlY3RzTWFwQXJyYXkgPSBNYXNzRWRpdEhlbHBlci5nZXRTaWRlRWZmZWN0RGF0YUZvcktleShcblx0XHRcdFx0XHRcdG9FbnRpdHlTZXRDb250ZXh0LFxuXHRcdFx0XHRcdFx0YVNpZGVFZmZlY3RzLFxuXHRcdFx0XHRcdFx0b0NvbnRyb2xsZXIsXG5cdFx0XHRcdFx0XHRhUmVzdWx0c1xuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0Ly9jb25zdCBjaGFuZ2VQcm9taXNlOiBhbnlbXSA9IFtdO1xuXHRcdFx0XHRcdC8vbGV0IGJSZWFkT25seUZpZWxkID0gZmFsc2U7XG5cdFx0XHRcdFx0Ly9jb25zdCBlcnJvckNvbnRleHRzOiBvYmplY3RbXSA9IFtdO1xuXG5cdFx0XHRcdFx0YUNvbnRleHRzLmZvckVhY2goZnVuY3Rpb24gKG9TZWxlY3RlZENvbnRleHQ6IGFueSwgaWR4OiBudW1iZXIpIHtcblx0XHRcdFx0XHRcdGFsbFNpZGVFZmZlY3RzID0gW107XG5cdFx0XHRcdFx0XHRhUmVzdWx0cy5mb3JFYWNoKGFzeW5jIGZ1bmN0aW9uIChvUmVzdWx0OiBhbnkpIHtcblx0XHRcdFx0XHRcdFx0aWYgKCFmYWlsZWRGaWVsZHNEYXRhLmhhc093blByb3BlcnR5KG9SZXN1bHQua2V5VmFsdWUpKSB7XG5cdFx0XHRcdFx0XHRcdFx0ZmFpbGVkRmllbGRzRGF0YVtvUmVzdWx0LmtleVZhbHVlXSA9IDA7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0Ly9UT0RPIC0gQWRkIHNhdmUgaW1wbGVtZW50YXRpb24gZm9yIFZhbHVlIEhlbHAuXG5cdFx0XHRcdFx0XHRcdGlmIChiYXNlU2lkZUVmZmVjdHNNYXBBcnJheVtvUmVzdWx0LmtleVZhbHVlXSkge1xuXHRcdFx0XHRcdFx0XHRcdGFsbFNpZGVFZmZlY3RzW29SZXN1bHQua2V5VmFsdWVdID0gYmFzZVNpZGVFZmZlY3RzTWFwQXJyYXlbb1Jlc3VsdC5rZXlWYWx1ZV07XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRpZiAoYVByb3BlcnR5UmVhZGFibGVJbmZvKSB7XG5cdFx0XHRcdFx0XHRcdFx0YVByb3BlcnR5UmVhZGFibGVJbmZvLnNvbWUoZnVuY3Rpb24gKG9Qcm9wZXJ0eUluZm86IGFueSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKG9SZXN1bHQua2V5VmFsdWUgPT09IG9Qcm9wZXJ0eUluZm8ucHJvcGVydHkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKG9Qcm9wZXJ0eUluZm8udHlwZSA9PT0gXCJEZWZhdWx0XCIpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gb1Byb3BlcnR5SW5mby52YWx1ZSA9PT0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0fSBlbHNlIGlmIChcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRvUHJvcGVydHlJbmZvLnR5cGUgPT09IFwiUGF0aFwiICYmXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0b1Byb3BlcnR5SW5mby5wcm9wZXJ0eVZhbHVlICYmXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0b1Byb3BlcnR5SW5mby5wcm9wZXJ0eVBhdGhcblx0XHRcdFx0XHRcdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIG9TZWxlY3RlZENvbnRleHQuZ2V0T2JqZWN0KG9Qcm9wZXJ0eUluZm8ucHJvcGVydHlQYXRoKSA9PT0gb1Byb3BlcnR5SW5mby5wcm9wZXJ0eVZhbHVlO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0Z3JvdXBJZCA9IGAkYXV0by4ke2lkeH1gO1xuXHRcdFx0XHRcdFx0XHRjb25zdCBvRmllbGRQcm9taXNlID0gb1NlbGVjdGVkQ29udGV4dFxuXHRcdFx0XHRcdFx0XHRcdC5zZXRQcm9wZXJ0eShvUmVzdWx0LmtleVZhbHVlLCBvUmVzdWx0LnZhbHVlLCBncm91cElkKVxuXHRcdFx0XHRcdFx0XHRcdC5jYXRjaChmdW5jdGlvbiAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdGVycm9yQ29udGV4dHMucHVzaChvU2VsZWN0ZWRDb250ZXh0LmdldE9iamVjdCgpKTtcblx0XHRcdFx0XHRcdFx0XHRcdExvZy5lcnJvcihcIk1hc3MgRWRpdDogU29tZXRoaW5nIHdlbnQgd3JvbmcgaW4gdXBkYXRpbmcgZW50cmllcy5cIiwgb0Vycm9yKTtcblx0XHRcdFx0XHRcdFx0XHRcdGZhaWxlZEZpZWxkc0RhdGFbb1Jlc3VsdC5rZXlWYWx1ZV0gPSBmYWlsZWRGaWVsZHNEYXRhW29SZXN1bHQua2V5VmFsdWVdICsgMTtcblx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBQcm9taXNlLnJlamVjdCh7IGlzRmllbGRVcGRhdGVGYWlsZWQ6IHRydWUgfSk7XG5cdFx0XHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdFx0Y29uc3QgZGF0YVRvVXBkYXRlRmllbGRBbmRTaWRlRWZmZWN0czogRGF0YVRvVXBkYXRlRmllbGRBbmRTaWRlRWZmZWN0c1R5cGUgPSB7XG5cdFx0XHRcdFx0XHRcdFx0b0NvbnRyb2xsZXIsXG5cdFx0XHRcdFx0XHRcdFx0b0ZpZWxkUHJvbWlzZSxcblx0XHRcdFx0XHRcdFx0XHRzaWRlRWZmZWN0c01hcDogYmFzZVNpZGVFZmZlY3RzTWFwQXJyYXlbb1Jlc3VsdC5rZXlWYWx1ZV0sXG5cdFx0XHRcdFx0XHRcdFx0dGV4dFBhdGhzLFxuXHRcdFx0XHRcdFx0XHRcdGdyb3VwSWQsXG5cdFx0XHRcdFx0XHRcdFx0a2V5OiBvUmVzdWx0LmtleVZhbHVlLFxuXHRcdFx0XHRcdFx0XHRcdG9FbnRpdHlTZXRDb250ZXh0LFxuXHRcdFx0XHRcdFx0XHRcdG9NZXRhTW9kZWwsXG5cdFx0XHRcdFx0XHRcdFx0b1NlbGVjdGVkQ29udGV4dCxcblx0XHRcdFx0XHRcdFx0XHRkZWZlcnJlZFRhcmdldHNGb3JBUXVhbGlmaWVkTmFtZVxuXHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRtYXNzRWRpdFByb21pc2VzLnB1c2goXG5cdFx0XHRcdFx0XHRcdFx0TWFzc0VkaXRIZWxwZXIuaGFuZGxlTWFzc0VkaXRGaWVsZFVwZGF0ZUFuZFJlcXVlc3RTaWRlRWZmZWN0cyhkYXRhVG9VcGRhdGVGaWVsZEFuZFNpZGVFZmZlY3RzKVxuXHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRhd2FpdCAoUHJvbWlzZSBhcyBhbnkpXG5cdFx0XHRcdFx0XHQuYWxsU2V0dGxlZChtYXNzRWRpdFByb21pc2VzKVxuXHRcdFx0XHRcdFx0LnRoZW4oYXN5bmMgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0XHRncm91cElkID0gYCRhdXRvLm1hc3NFZGl0RGVmZXJyZWRgO1xuXHRcdFx0XHRcdFx0XHRjb25zdCBkZWZlcnJlZFJlcXVlc3RzID0gW107XG5cdFx0XHRcdFx0XHRcdGNvbnN0IHNpZGVFZmZlY3RzRGF0YUZvckFsbEtleXM6IGFueSA9IE9iamVjdC52YWx1ZXMoZGVmZXJyZWRUYXJnZXRzRm9yQVF1YWxpZmllZE5hbWUpO1xuXHRcdFx0XHRcdFx0XHRjb25zdCBrZXlzV2l0aFNpZGVFZmZlY3RzOiBhbnlbXSA9IE9iamVjdC5rZXlzKGRlZmVycmVkVGFyZ2V0c0ZvckFRdWFsaWZpZWROYW1lKTtcblxuXHRcdFx0XHRcdFx0XHRzaWRlRWZmZWN0c0RhdGFGb3JBbGxLZXlzLmZvckVhY2goKGFTaWRlRWZmZWN0OiBhbnksIGluZGV4OiBhbnkpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRjb25zdCBjdXJyZW50S2V5ID0ga2V5c1dpdGhTaWRlRWZmZWN0c1tpbmRleF07XG5cdFx0XHRcdFx0XHRcdFx0aWYgKGZhaWxlZEZpZWxkc0RhdGFbY3VycmVudEtleV0gIT09IHNlbGVjdGVkUm93c0xlbmd0aCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0Y29uc3QgZGVmZXJyZWRTaWRlRWZmZWN0c0RhdGEgPSBPYmplY3QudmFsdWVzKGFTaWRlRWZmZWN0KTtcblx0XHRcdFx0XHRcdFx0XHRcdGRlZmVycmVkU2lkZUVmZmVjdHNEYXRhLmZvckVhY2goKHJlcTogYW55KSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IHsgYVRhcmdldHMsIG9Db250ZXh0LCBUcmlnZ2VyQWN0aW9uLCBtU2lkZUVmZmVjdCB9ID0gcmVxO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBmbkdldERlZmVycmVkVGFyZ2V0cyA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gYVRhcmdldHM7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IGZuR2V0RGVmZXJyZWRUYXJnZXRzQW5kQWN0aW9ucyA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YVRhcmdldHM6IGZuR2V0RGVmZXJyZWRUYXJnZXRzKCksXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRUcmlnZ2VyQWN0aW9uOiBUcmlnZ2VyQWN0aW9uXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdFx0XHRcdFx0XHRkZWZlcnJlZFJlcXVlc3RzLnB1c2goXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly8gaWYgc29tZSBkZWZlcnJlZCBpcyByZWplY3RlZCwgaXQgd2lsbCBiZSBhZGQgdG8gZmFpbGVkIHF1ZXVlXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0b0NvbnRyb2xsZXIuX3NpZGVFZmZlY3RzLnJlcXVlc3RTaWRlRWZmZWN0cyhcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdG1TaWRlRWZmZWN0LFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0b0NvbnRleHQsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRncm91cElkLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Zm5HZXREZWZlcnJlZFRhcmdldHNBbmRBY3Rpb25zXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQudGhlbihmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRcdE1hc3NFZGl0SGVscGVyLm1lc3NhZ2VIYW5kbGluZ0Zvck1hc3NFZGl0KG9UYWJsZSwgYUNvbnRleHRzLCBvQ29udHJvbGxlciwgb0luRGlhbG9nLCBhUmVzdWx0cywgZXJyb3JDb250ZXh0cyk7XG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0LmNhdGNoKChlOiBhbnkpID0+IHtcblx0XHRcdFx0XHRcdFx0TWFzc0VkaXRIZWxwZXIuY2xvc2VEaWFsb2cob0RpYWxvZyk7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBQcm9taXNlLnJlamVjdChlKTtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9KSxcblx0XHRcdGVuZEJ1dHRvbjogbmV3IEJ1dHRvbih7XG5cdFx0XHRcdHRleHQ6IG9EZWZhdWx0VmFsdWVzLmNhbmNlbEJ1dHRvblRleHQsXG5cdFx0XHRcdHZpc2libGU6IE1hc3NFZGl0SGVscGVyLmhlbHBlcnMuaGFzRWRpdGFibGVGaWVsZHNCaW5kaW5nKG9EYXRhRmllbGRNb2RlbC5nZXRPYmplY3QoXCIvXCIpLCB0cnVlKSBhcyBhbnksXG5cdFx0XHRcdHByZXNzOiBmdW5jdGlvbiAob0V2ZW50OiBhbnkpIHtcblx0XHRcdFx0XHRjb25zdCBvSW5EaWFsb2cgPSBvRXZlbnQuZ2V0U291cmNlKCkuZ2V0UGFyZW50KCk7XG5cdFx0XHRcdFx0TWFzc0VkaXRIZWxwZXIuY2xvc2VEaWFsb2cob0luRGlhbG9nKTtcblx0XHRcdFx0fVxuXHRcdFx0fSlcblx0XHR9KTtcblx0XHRvRGlhbG9nLnNldE1vZGVsKG9EaWFsb2dEYXRhTW9kZWwsIFwiZmllbGRzSW5mb1wiKTtcblx0XHRvRGlhbG9nLnNldE1vZGVsKG1vZGVsKTtcblx0XHRvRGlhbG9nLnNldEJpbmRpbmdDb250ZXh0KGRpYWxvZ0NvbnRleHQpO1xuXHRcdHJldHVybiBvRGlhbG9nO1xuXHR9LFxuXG5cdGhlbHBlcnM6IHtcblx0XHRnZXRCaW5kaW5nRXhwRm9ySGFzRWRpdGFibGVGaWVsZHM6IChmaWVsZHM6IGFueSwgZWRpdGFibGU6IGJvb2xlYW4pID0+IHtcblx0XHRcdGNvbnN0IHRvdGFsRXhwID0gZmllbGRzLnJlZHVjZShcblx0XHRcdFx0KGV4cHJlc3Npb246IGFueSwgZmllbGQ6IGFueSkgPT5cblx0XHRcdFx0XHRvcihcblx0XHRcdFx0XHRcdGV4cHJlc3Npb24sXG5cdFx0XHRcdFx0XHRwYXRoSW5Nb2RlbChcIi92YWx1ZXMvXCIgKyBmaWVsZC5kYXRhUHJvcGVydHkgKyBcIi92aXNpYmxlXCIsIFwiZmllbGRzSW5mb1wiKSBhcyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj5cblx0XHRcdFx0XHQpLFxuXHRcdFx0XHRjb25zdGFudChmYWxzZSlcblx0XHRcdCk7XG5cdFx0XHRyZXR1cm4gZWRpdGFibGUgPyB0b3RhbEV4cCA6IG5vdCh0b3RhbEV4cCk7XG5cdFx0fSxcblxuXHRcdGdldEV4cEJpbmRpbmdGb3JBcHBseUJ1dHRvblR4dDogKGRlZmF1bHRWYWx1ZXM6IGFueSwgZmllbGRzOiBib29sZWFuKSA9PiB7XG5cdFx0XHRjb25zdCBlZGl0YWJsZUV4cCA9IE1hc3NFZGl0SGVscGVyLmhlbHBlcnMuZ2V0QmluZGluZ0V4cEZvckhhc0VkaXRhYmxlRmllbGRzKGZpZWxkcywgdHJ1ZSk7XG5cdFx0XHRjb25zdCB0b3RhbEV4cCA9IGlmRWxzZShlZGl0YWJsZUV4cCwgY29uc3RhbnQoZGVmYXVsdFZhbHVlcy5hcHBseUJ1dHRvblRleHQpLCBjb25zdGFudChkZWZhdWx0VmFsdWVzLm9rQnV0dG9uVGV4dCkpO1xuXHRcdFx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKHRvdGFsRXhwKTtcblx0XHR9LFxuXG5cdFx0aGFzRWRpdGFibGVGaWVsZHNCaW5kaW5nOiAoZmllbGRzOiBhbnksIGVkaXRhYmxlOiBib29sZWFuKSA9PiB7XG5cdFx0XHRyZXR1cm4gY29tcGlsZUV4cHJlc3Npb24oTWFzc0VkaXRIZWxwZXIuaGVscGVycy5nZXRCaW5kaW5nRXhwRm9ySGFzRWRpdGFibGVGaWVsZHMoZmllbGRzLCBlZGl0YWJsZSkpO1xuXHRcdH1cblx0fVxufTtcblxuZXhwb3J0IGRlZmF1bHQgTWFzc0VkaXRIZWxwZXI7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBOEVBLE1BQU1BLGNBQWMsR0FBRztJQUN0QjtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0NDLDJCQUEyQixFQUFFLFVBQVVDLEtBQWEsRUFBRUMsT0FBWSxFQUEyQjtNQUM1RixJQUFJQyxVQUFlO01BQ25CLElBQUlDLEtBQUssR0FBRyxDQUFDO01BQ2IsTUFBTUMsTUFBTSxHQUFHSixLQUFLLENBQUNLLEtBQUssQ0FBQyxHQUFHLENBQUM7TUFDL0IsSUFBSUMsU0FBUyxHQUFHLEVBQUU7TUFDbEJGLE1BQU0sQ0FBQ0csT0FBTyxDQUFDLFVBQVVDLGFBQXFCLEVBQUU7UUFDL0MsSUFBSSxDQUFDUCxPQUFPLENBQUNPLGFBQWEsQ0FBQyxJQUFJTCxLQUFLLEtBQUssQ0FBQyxFQUFFO1VBQzNDRixPQUFPLENBQUNPLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztVQUMzQk4sVUFBVSxHQUFHRCxPQUFPLENBQUNPLGFBQWEsQ0FBQztVQUNuQ0YsU0FBUyxHQUFHQSxTQUFTLEdBQUdF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