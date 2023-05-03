/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/macros/CommonHelper", "sap/fe/macros/DelegateUtil", "sap/ui/model/json/JSONModel", "sap/ui/model/ListBinding"], function (Common, DelegateUtil, JSONModel, ListBinding) {
  "use strict";

  const Delegate = {
    /**
     * @param mPropertyBag Object with parameters as properties
     * @param mPropertyBag.modifier Modifier to harmonize access, creation and manipulation to controls in XML Views and JS Controls
     * @param [mPropertyBag.appComponent] Needed to calculate the correct ID in case you provide a selector
     * @param [mPropertyBag.view] XML node of the view, required for XML case to create nodes and to find elements
     * @param [mPropertyBag.fieldSelector] Selector to calculate the ID for the control that is created
     * @param mPropertyBag.bindingPath Runtime binding path the control should be bound to
     * @param mPropertyBag.payload Payload parameter attached to the delegate, undefined if no payload was assigned
     * @param mPropertyBag.controlType Control type of the element the delegate is attached to
     * @param mPropertyBag.aggregationName Name of the aggregation the delegate should provide additional elements
     * @param mPropertyBag.element
     * @param mPropertyBag.parentSelector
     * @returns Map containing the controls to add
     */
    createLayout: async function (mPropertyBag) {
      var _mPropertyBag$appComp;
      const oModifier = mPropertyBag.modifier,
        oMetaModel = (_mPropertyBag$appComp = mPropertyBag.appComponent) === null || _mPropertyBag$appComp === void 0 ? void 0 : _mPropertyBag$appComp.getMetaModel(),
        oForm = mPropertyBag.element;
      let sEntitySet = await DelegateUtil.getCustomData(oForm, "entitySet", oModifier);
      if (!sEntitySet) {
        sEntitySet = await DelegateUtil.getCustomData(oForm, "navigationPath", oModifier);
      }
      const sPath = sEntitySet.startsWith("/") ? `${sEntitySet}` : `/${sEntitySet}`;
      const oFormContainer = mPropertyBag.parentSelector ? mPropertyBag.modifier.bySelector(mPropertyBag.parentSelector, mPropertyBag.appComponent, mPropertyBag.view) : undefined;
      const sNavigationPath = await DelegateUtil.getCustomData(oFormContainer, "navigationPath", oModifier);
      const sBindingPath = sNavigationPath ? `${sPath}/${sNavigationPath}` : sPath;
      const oMetaModelContext = oMetaModel === null || oMetaModel === void 0 ? void 0 : oMetaModel.getMetaContext(sBindingPath);
      const oPropertyContext = oMetaModel === null || oMetaModel === void 0 ? void 0 : oMetaModel.createBindingContext(`${sBindingPath}/${mPropertyBag.bindingPath}`);
      const sFormId = mPropertyBag.element.sId || mPropertyBag.element.id;
      const oParameters = {
        sPropertyName: mPropertyBag.bindingPath,
        sBindingPath: sBindingPath,
        sValueHelpType: "FormVH",
        oControl: oForm,
        oMetaModel: oMetaModel,
        oModifier: oModifier
      };
      function fnTemplateValueHelp(sFragmentName) {
        var _mPropertyBag$fieldSe;
        const oThis = new JSONModel({
            id: sFormId,
            idPrefix: (_mPropertyBag$fieldSe = mPropertyBag.fieldSelector) === null || _mPropertyBag$fieldSe === void 0 ? void 0 : _mPropertyBag$fieldSe.id
          }),
          oPreprocessorSettings = {
            bindingContexts: {
              entitySet: oMetaModelContext,
              contextPath: oMetaModelContext,
              property: oPropertyContext,
              this: oThis.createBindingContext("/")
            },
            models: {
              this: oThis,
              entitySet: oMetaModel,
              contextPath: oMetaModel,
              metaModel: oMetaModel,
              property: oMetaModel
            }
          };
        return DelegateUtil.templateControlFragment(sFragmentName, oPreprocessorSettings, {}, oModifier);
      }
      async function fnTemplateFormElement(sFragmentName, oView, navigationPath) {
        var _mPropertyBag$fieldSe2;
        const sOnChangeCustomData = await DelegateUtil.getCustomData(oForm, "onChange", oModifier);
        const sDisplayModeCustomData = await DelegateUtil.getCustomData(oForm, "displayMode", oModifier);
        const oThis = new JSONModel({
          // properties and events of Field macro
          _flexId: (_mPropertyBag$fieldSe2 = mPropertyBag.fieldSelector) === null || _mPropertyBag$fieldSe2 === void 0 ? void 0 : _mPropertyBag$fieldSe2.id,
          onChange: Common.removeEscapeCharacters(sOnChangeCustomData),
          displayMode: Common.removeEscapeCharacters(sDisplayModeCustomData),
          navigationPath: navigationPath
        });
        const oPreprocessorSettings = {
          bindingContexts: {
            entitySet: oMetaModelContext,
            dataField: oPropertyContext,
            this: oThis.createBindingContext("/")
          },
          models: {
            this: oThis,
            entitySet: oMetaModel,
            metaModel: oMetaModel,
            dataField: oMetaModel
          }
        };
        return DelegateUtil.templateControlFragment(sFragmentName, oPreprocessorSettings, {
          view: oView
        }, oModifier);
      }
      const bValueHelpRequired = await DelegateUtil.isValueHelpRequired(oParameters);
      const bValueHelpExists = await DelegateUtil.doesValueHelpExist(oParameters);
      let oValueHelp;
      if (bValueHelpRequired && !bValueHelpExists) {
        oValueHelp = await fnTemplateValueHelp("sap.fe.macros.form.ValueHelpWrapper");
      }
      const oField = await fnTemplateFormElement("sap.fe.macros.form.FormElementFlexibility", mPropertyBag.view, sNavigationPath);
      return {
        control: oField,
        valueHelp: oValueHelp
      };
    },
    // getPropertyInfo is a patched version of ODataV4ReadDelegates to dela with navigationPath
    getPropertyInfo: function (mPropertyBag) {
      function _isComplexType(mProperty) {
        if (mProperty && mProperty.$Type) {
          if (mProperty.$Type.toLowerCase().indexOf("edm") !== 0) {
            return true;
          }
        }
        return false;
      }

      //Check if a given property path starts with a navigation property.
      function _startsWithNavigationProperty(sPropertyPath, aNavigationProperties) {
        return aNavigationProperties.some(function (sNavProp) {
          return sPropertyPath.startsWith(sNavProp);
        });
      }
      function _enrichProperty(sPropertyPath, mElement, mPropertyAnnotations, sEntityType, oElement, sAggregationName, aNavigationProperties) {
        const mProp = {
          name: sPropertyPath,
          bindingPath: sPropertyPath,
          entityType: sEntityType
        };
        // get label information, either via DataFieldDefault annotation (if exists) or Label annotation
        const mDataFieldDefaultAnnotation = mPropertyAnnotations["@com.sap.vocabularies.UI.v1.DataFieldDefault"];
        const sLabel = mDataFieldDefaultAnnotation && mDataFieldDefaultAnnotation.Label || mPropertyAnnotations["@com.sap.vocabularies.Common.v1.Label"];
        mProp.label = sLabel || "[LABEL_MISSING: " + sPropertyPath + "]";
        // evaluate Hidden annotation
        const mHiddenAnnotation = mPropertyAnnotations["@com.sap.vocabularies.UI.v1.Hidden"];
        mProp.hideFromReveal = mHiddenAnnotation;
        if (mHiddenAnnotation && mHiddenAnnotation.$Path) {
          var _oElement$getBindingC;
          mProp.hideFromReveal = (_oElement$getBindingC = oElement.getBindingContext()) === null || _oElement$getBindingC === void 0 ? void 0 : _oElement$getBindingC.getProperty(mHiddenAnnotation.$Path);
        }
        // evaluate FieldControl annotation
        let mFieldControlAnnotation;
        if (!mProp.hideFromReveal) {
          mFieldControlAnnotation = mPropertyAnnotations["@com.sap.vocabularies.Common.v1.FieldControl"];
          if (mFieldControlAnnotation) {
            mProp.hideFromReveal = mFieldControlAnnotation.$EnumMember === "com.sap.vocabularies.Common.v1.FieldControlType/Hidden";
          }
        }
        // @runtime hidden by field control value = 0
        mFieldControlAnnotation = mPropertyAnnotations["@com.sap.vocabularies.Common.v1.FieldControl"];
        const sFieldControlPath = mFieldControlAnnotation && mFieldControlAnnotation.Path;
        if (sFieldControlPath && !mProp.hideFromReveal) {
          // if the binding is a list binding, skip the check for field control
          const bListBinding = oElement.getBinding(sAggregationName) instanceof ListBinding;
          if (!bListBinding) {
            var _oElement$getBindingC2;
            const iFieldControlValue = (_oElement$getBindingC2 = oElement.getBindingContext()) === null || _oElement$getBindingC2 === void 0 ? void 0 : _oElement$getBindingC2.getProperty(sFieldControlPath);
            mProp.hideFromReveal = iFieldControlValue === 0;
          }
        }
        // no support for DataFieldFor/WithAction and DataFieldFor/WithIntentBasedNavigation within DataFieldDefault annotation
        if (mDataFieldDefaultAnnotation && (mDataFieldDefaultAnnotation.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction" || mDataFieldDefaultAnnotation.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation" || mDataFieldDefaultAnnotation.$Type === "com.sap.vocabularies.UI.v1.DataFieldWithAction" || mDataFieldDefaultAnnotation.$Type === "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation")) {
          mProp.unsupported = true;
        }
        // no support for navigation properties and complex properties
        if (_startsWithNavigationProperty(sPropertyPath, aNavigationProperties) || _isComplexType(mElement)) {
          mProp.unsupported = true;
        }
        return mProp;
      }

      // Convert metadata format to delegate format.
      function _convertMetadataToDelegateFormat(mODataEntityType, sEntityType, oMetaModel, oElement, sAggregationName) {
        const aProperties = [];
        let sElementName = "";
        const aNavigationProperties = [];
        let mElement;
        for (sElementName in mODataEntityType) {
          mElement = mODataEntityType[sElementName];
          if (mElement.$kind === "NavigationProperty") {
            aNavigationProperties.push(sElementName);
          }
        }
        for (sElementName in mODataEntityType) {
          mElement = mODataEntityType[sElementName];
          if (mElement.$kind === "Property") {
            const mPropAnnotations = oMetaModel.getObject("/" + sEntityType + "/" + sElementName + "@");
            const mProp = _enrichProperty(sElementName, mElement, mPropAnnotations, sEntityType, oElement, sAggregationName, aNavigationProperties);
            aProperties.push(mProp);
          }
        }
        return aProperties;
      }

      //Get binding path either from payload (if available) or the element's binding context.
      function _getBindingPath(oElement, mPayload) {
        if (mPayload.path) {
          return mPayload.path;
        }
        const vBinding = oElement.getBindingContext();
        if (vBinding) {
          if (oElement.data("navigationPath")) {
            return vBinding.getPath() + "/" + oElement.data("navigationPath");
          }
          return vBinding.getPath();
        }
      }

      //Get all properties of the element's model.
      function _getODataPropertiesOfModel(oElement, sAggregationName, mPayload) {
        const oModel = oElement.getModel(mPayload.modelName);
        if (oModel) {
          if (oModel.isA("sap.ui.model.odata.v4.ODataModel")) {
            const oMetaModel = oModel.getMetaModel();
            const sBindingContextPath = _getBindingPath(oElement, mPayload);
            if (sBindingContextPath) {
              const oMetaModelContext = oMetaModel.getMetaContext(sBindingContextPath);
              const oMetaModelContextObject = oMetaModelContext.getObject();
              const mODataEntityType = oMetaModelContext.getObject(oMetaModelContextObject.$Type);
              return _convertMetadataToDelegateFormat(mODataEntityType, oMetaModelContextObject.$Type, oMetaModel, oElement, sAggregationName);
            }
          }
        }
        return Promise.resolve([]);
      }
      return Promise.resolve().then(function () {
        return _getODataPropertiesOfModel(mPropertyBag.element, mPropertyBag.aggregationName, mPropertyBag.payload);
      });
    }
  };
  return Delegate;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZWxlZ2F0ZSIsImNyZWF0ZUxheW91dCIsIm1Qcm9wZXJ0eUJhZyIsIm9Nb2RpZmllciIsIm1vZGlmaWVyIiwib01ldGFNb2RlbCIsImFwcENvbXBvbmVudCIsImdldE1ldGFNb2RlbCIsIm9Gb3JtIiwiZWxlbWVudCIsInNFbnRpdHlTZXQiLCJEZWxlZ2F0ZVV0aWwiLCJnZXRDdXN0b21EYXRhIiwic1BhdGgiLCJzdGFydHNXaXRoIiwib0Zvcm1Db250YWluZXIiLCJwYXJlbnRTZWxlY3RvciIsImJ5U2VsZWN0b3IiLCJ2aWV3IiwidW5kZWZpbmVkIiwic05hdmlnYXRpb25QYXRoIiwic0JpbmRpbmdQYXRoIiwib01ldGFNb2RlbENvbnRleHQiLCJnZXRNZXRhQ29udGV4dCIsIm9Qcm9wZXJ0eUNvbnRleHQiLCJjcmVhdGVCaW5kaW5nQ29udGV4dCIsImJpbmRpbmdQYXRoIiwic0Zvcm1JZCIsInNJZCIsImlkIiwib1BhcmFtZXRlcnMiLCJzUHJvcGVydHlOYW1lIiwic1ZhbHVlSGVscFR5cGUiLCJvQ29udHJvbCIsImZuVGVtcGxhdGVWYWx1ZUhlbHAiLCJzRnJhZ21lbnROYW1lIiwib1RoaXMiLCJKU09OTW9kZWwiLCJpZFByZWZpeCIsImZpZWxkU2VsZWN0b3IiLCJvUHJlcHJvY2Vzc29yU2V0dGluZ3MiLCJiaW5kaW5nQ29udGV4dHMiLCJlbnRpdHlTZXQiLCJjb250ZXh0UGF0aCIsInByb3BlcnR5IiwidGhpcyIsIm1vZGVscyIsIm1ldGFNb2RlbCIsInRlbXBsYXRlQ29udHJvbEZyYWdtZW50IiwiZm5UZW1wbGF0ZUZvcm1FbGVtZW50Iiwib1ZpZXciLCJuYXZpZ2F0aW9uUGF0aCIsInNPbkNoYW5nZUN1c3RvbURhdGEiLCJzRGlzcGxheU1vZGVDdXN0b21EYXRhIiwiX2ZsZXhJZCIsIm9uQ2hhbmdlIiwiQ29tbW9uIiwicmVtb3ZlRXNjYXBlQ2hhcmFjdGVycyIsImRpc3BsYXlNb2RlIiwiZGF0YUZpZWxkIiwiYlZhbHVlSGVscFJlcXVpcmVkIiwiaXNWYWx1ZUhlbHBSZXF1aXJlZCIsImJWYWx1ZUhlbHBFeGlzdHMiLCJkb2VzVmFsdWVIZWxwRXhpc3QiLCJvVmFsdWVIZWxwIiwib0ZpZWxkIiwiY29udHJvbCIsInZhbHVlSGVscCIsImdldFByb3BlcnR5SW5mbyIsIl9pc0NvbXBsZXhUeXBlIiwibVByb3BlcnR5IiwiJFR5cGUiLCJ0b0xvd2VyQ2FzZSIsImluZGV4T2YiLCJfc3RhcnRzV2l0aE5hdmlnYXRpb25Qcm9wZXJ0eSIsInNQcm9wZXJ0eVBhdGgiLCJhTmF2aWdhdGlvblByb3BlcnRpZXMiLCJzb21lIiwic05hdlByb3AiLCJfZW5yaWNoUHJvcGVydHkiLCJtRWxlbWVudCIsIm1Qcm9wZXJ0eUFubm90YXRpb25zIiwic0VudGl0eVR5cGUiLCJvRWxlbWVudCIsInNBZ2dyZWdhdGlvbk5hbWUiLCJtUHJvcCIsIm5hbWUiLCJlbnRpdHlUeXBlIiwibURhdGFGaWVsZERlZmF1bHRBbm5vdGF0aW9uIiwic0xhYmVsIiwiTGFiZWwiLCJsYWJlbCIsIm1IaWRkZW5Bbm5vdGF0aW9uIiwiaGlkZUZyb21SZXZlYWwiLCIkUGF0aCIsImdldEJpbmRpbmdDb250ZXh0IiwiZ2V0UHJvcGVydHkiLCJtRmllbGRDb250cm9sQW5ub3RhdGlvbiIsIiRFbnVtTWVtYmVyIiwic0ZpZWxkQ29udHJvbFBhdGgiLCJQYXRoIiwiYkxpc3RCaW5kaW5nIiwiZ2V0QmluZGluZyIsIkxpc3RCaW5kaW5nIiwiaUZpZWxkQ29udHJvbFZhbHVlIiwidW5zdXBwb3J0ZWQiLCJfY29udmVydE1ldGFkYXRhVG9EZWxlZ2F0ZUZvcm1hdCIsIm1PRGF0YUVudGl0eVR5cGUiLCJhUHJvcGVydGllcyIsInNFbGVtZW50TmFtZSIsIiRraW5kIiwicHVzaCIsIm1Qcm9wQW5ub3RhdGlvbnMiLCJnZXRPYmplY3QiLCJfZ2V0QmluZGluZ1BhdGgiLCJtUGF5bG9hZCIsInBhdGgiLCJ2QmluZGluZyIsImRhdGEiLCJnZXRQYXRoIiwiX2dldE9EYXRhUHJvcGVydGllc09mTW9kZWwiLCJvTW9kZWwiLCJnZXRNb2RlbCIsIm1vZGVsTmFtZSIsImlzQSIsInNCaW5kaW5nQ29udGV4dFBhdGgiLCJvTWV0YU1vZGVsQ29udGV4dE9iamVjdCIsIlByb21pc2UiLCJyZXNvbHZlIiwidGhlbiIsImFnZ3JlZ2F0aW9uTmFtZSIsInBheWxvYWQiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkZvcm1EZWxlZ2F0ZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSBBcHBDb21wb25lbnQgZnJvbSBcInNhcC9mZS9jb3JlL0FwcENvbXBvbmVudFwiO1xuaW1wb3J0IENvbW1vbiBmcm9tIFwic2FwL2ZlL21hY3Jvcy9Db21tb25IZWxwZXJcIjtcbmltcG9ydCBEZWxlZ2F0ZVV0aWwgZnJvbSBcInNhcC9mZS9tYWNyb3MvRGVsZWdhdGVVdGlsXCI7XG5pbXBvcnQgdHlwZSBDb250cm9sIGZyb20gXCJzYXAvdWkvY29yZS9Db250cm9sXCI7XG5pbXBvcnQgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcbmltcG9ydCBMaXN0QmluZGluZyBmcm9tIFwic2FwL3VpL21vZGVsL0xpc3RCaW5kaW5nXCI7XG5pbXBvcnQgdHlwZSBPRGF0YU1ldGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTWV0YU1vZGVsXCI7XG50eXBlIERlbGVnYXRlUHJvcGVydHkgPSB7XG5cdG5hbWU6IHN0cmluZztcblx0YmluZGluZ1BhdGg6IHN0cmluZztcblx0ZW50aXR5VHlwZTogc3RyaW5nO1xuXHRsYWJlbD86IHN0cmluZztcblx0aGlkZUZyb21SZXZlYWw/OiBhbnk7XG5cdHVuc3VwcG9ydGVkPzogYm9vbGVhbjtcbn07XG5cbmNvbnN0IERlbGVnYXRlID0ge1xuXHQvKipcblx0ICogQHBhcmFtIG1Qcm9wZXJ0eUJhZyBPYmplY3Qgd2l0aCBwYXJhbWV0ZXJzIGFzIHByb3BlcnRpZXNcblx0ICogQHBhcmFtIG1Qcm9wZXJ0eUJhZy5tb2RpZmllciBNb2RpZmllciB0byBoYXJtb25pemUgYWNjZXNzLCBjcmVhdGlvbiBhbmQgbWFuaXB1bGF0aW9uIHRvIGNvbnRyb2xzIGluIFhNTCBWaWV3cyBhbmQgSlMgQ29udHJvbHNcblx0ICogQHBhcmFtIFttUHJvcGVydHlCYWcuYXBwQ29tcG9uZW50XSBOZWVkZWQgdG8gY2FsY3VsYXRlIHRoZSBjb3JyZWN0IElEIGluIGNhc2UgeW91IHByb3ZpZGUgYSBzZWxlY3RvclxuXHQgKiBAcGFyYW0gW21Qcm9wZXJ0eUJhZy52aWV3XSBYTUwgbm9kZSBvZiB0aGUgdmlldywgcmVxdWlyZWQgZm9yIFhNTCBjYXNlIHRvIGNyZWF0ZSBub2RlcyBhbmQgdG8gZmluZCBlbGVtZW50c1xuXHQgKiBAcGFyYW0gW21Qcm9wZXJ0eUJhZy5maWVsZFNlbGVjdG9yXSBTZWxlY3RvciB0byBjYWxjdWxhdGUgdGhlIElEIGZvciB0aGUgY29udHJvbCB0aGF0IGlzIGNyZWF0ZWRcblx0ICogQHBhcmFtIG1Qcm9wZXJ0eUJhZy5iaW5kaW5nUGF0aCBSdW50aW1lIGJpbmRpbmcgcGF0aCB0aGUgY29udHJvbCBzaG91bGQgYmUgYm91bmQgdG9cblx0ICogQHBhcmFtIG1Qcm9wZXJ0eUJhZy5wYXlsb2FkIFBheWxvYWQgcGFyYW1ldGVyIGF0dGFjaGVkIHRvIHRoZSBkZWxlZ2F0ZSwgdW5kZWZpbmVkIGlmIG5vIHBheWxvYWQgd2FzIGFzc2lnbmVkXG5cdCAqIEBwYXJhbSBtUHJvcGVydHlCYWcuY29udHJvbFR5cGUgQ29udHJvbCB0eXBlIG9mIHRoZSBlbGVtZW50IHRoZSBkZWxlZ2F0ZSBpcyBhdHRhY2hlZCB0b1xuXHQgKiBAcGFyYW0gbVByb3BlcnR5QmFnLmFnZ3JlZ2F0aW9uTmFtZSBOYW1lIG9mIHRoZSBhZ2dyZWdhdGlvbiB0aGUgZGVsZWdhdGUgc2hvdWxkIHByb3ZpZGUgYWRkaXRpb25hbCBlbGVtZW50c1xuXHQgKiBAcGFyYW0gbVByb3BlcnR5QmFnLmVsZW1lbnRcblx0ICogQHBhcmFtIG1Qcm9wZXJ0eUJhZy5wYXJlbnRTZWxlY3RvclxuXHQgKiBAcmV0dXJucyBNYXAgY29udGFpbmluZyB0aGUgY29udHJvbHMgdG8gYWRkXG5cdCAqL1xuXHRjcmVhdGVMYXlvdXQ6IGFzeW5jIGZ1bmN0aW9uIChtUHJvcGVydHlCYWc6IHtcblx0XHRtb2RpZmllcjogYW55O1xuXHRcdGFwcENvbXBvbmVudD86IEFwcENvbXBvbmVudDtcblx0XHR2aWV3PzogRWxlbWVudCB8IHVuZGVmaW5lZDtcblx0XHRmaWVsZFNlbGVjdG9yPzogeyBpZD86IHN0cmluZzsgaXNMb2NhbElkPzogYm9vbGVhbiB9IHwgdW5kZWZpbmVkO1xuXHRcdGJpbmRpbmdQYXRoOiBzdHJpbmc7XG5cdFx0cGF5bG9hZDogb2JqZWN0O1xuXHRcdGNvbnRyb2xUeXBlOiBzdHJpbmc7XG5cdFx0YWdncmVnYXRpb25OYW1lOiBzdHJpbmc7XG5cdFx0ZWxlbWVudD86IGFueTtcblx0XHRwYXJlbnRTZWxlY3Rvcj86IGFueTtcblx0fSkge1xuXHRcdGNvbnN0IG9Nb2RpZmllciA9IG1Qcm9wZXJ0eUJhZy5tb2RpZmllcixcblx0XHRcdG9NZXRhTW9kZWwgPSBtUHJvcGVydHlCYWcuYXBwQ29tcG9uZW50Py5nZXRNZXRhTW9kZWwoKSxcblx0XHRcdG9Gb3JtID0gbVByb3BlcnR5QmFnLmVsZW1lbnQ7XG5cblx0XHRsZXQgc0VudGl0eVNldCA9IGF3YWl0IERlbGVnYXRlVXRpbC5nZXRDdXN0b21EYXRhKG9Gb3JtLCBcImVudGl0eVNldFwiLCBvTW9kaWZpZXIpO1xuXHRcdGlmICghc0VudGl0eVNldCkge1xuXHRcdFx0c0VudGl0eVNldCA9IGF3YWl0IERlbGVnYXRlVXRpbC5nZXRDdXN0b21EYXRhKG9Gb3JtLCBcIm5hdmlnYXRpb25QYXRoXCIsIG9Nb2RpZmllcik7XG5cdFx0fVxuXHRcdGNvbnN0IHNQYXRoID0gc0VudGl0eVNldC5zdGFydHNXaXRoKFwiL1wiKSA/IGAke3NFbnRpdHlTZXR9YCA6IGAvJHtzRW50aXR5U2V0fWA7XG5cdFx0Y29uc3Qgb0Zvcm1Db250YWluZXIgPSBtUHJvcGVydHlCYWcucGFyZW50U2VsZWN0b3Jcblx0XHRcdD8gbVByb3BlcnR5QmFnLm1vZGlmaWVyLmJ5U2VsZWN0b3IobVByb3BlcnR5QmFnLnBhcmVudFNlbGVjdG9yLCBtUHJvcGVydHlCYWcuYXBwQ29tcG9uZW50LCBtUHJvcGVydHlCYWcudmlldylcblx0XHRcdDogdW5kZWZpbmVkO1xuXHRcdGNvbnN0IHNOYXZpZ2F0aW9uUGF0aCA9IGF3YWl0IERlbGVnYXRlVXRpbC5nZXRDdXN0b21EYXRhKG9Gb3JtQ29udGFpbmVyLCBcIm5hdmlnYXRpb25QYXRoXCIsIG9Nb2RpZmllcik7XG5cdFx0Y29uc3Qgc0JpbmRpbmdQYXRoID0gc05hdmlnYXRpb25QYXRoID8gYCR7c1BhdGh9LyR7c05hdmlnYXRpb25QYXRofWAgOiBzUGF0aDtcblx0XHRjb25zdCBvTWV0YU1vZGVsQ29udGV4dCA9IG9NZXRhTW9kZWw/LmdldE1ldGFDb250ZXh0KHNCaW5kaW5nUGF0aCk7XG5cdFx0Y29uc3Qgb1Byb3BlcnR5Q29udGV4dCA9IG9NZXRhTW9kZWw/LmNyZWF0ZUJpbmRpbmdDb250ZXh0KGAke3NCaW5kaW5nUGF0aH0vJHttUHJvcGVydHlCYWcuYmluZGluZ1BhdGh9YCk7XG5cdFx0Y29uc3Qgc0Zvcm1JZCA9IG1Qcm9wZXJ0eUJhZy5lbGVtZW50LnNJZCB8fCBtUHJvcGVydHlCYWcuZWxlbWVudC5pZDtcblxuXHRcdGNvbnN0IG9QYXJhbWV0ZXJzID0ge1xuXHRcdFx0c1Byb3BlcnR5TmFtZTogbVByb3BlcnR5QmFnLmJpbmRpbmdQYXRoLFxuXHRcdFx0c0JpbmRpbmdQYXRoOiBzQmluZGluZ1BhdGgsXG5cdFx0XHRzVmFsdWVIZWxwVHlwZTogXCJGb3JtVkhcIixcblx0XHRcdG9Db250cm9sOiBvRm9ybSxcblx0XHRcdG9NZXRhTW9kZWw6IG9NZXRhTW9kZWwsXG5cdFx0XHRvTW9kaWZpZXI6IG9Nb2RpZmllclxuXHRcdH07XG5cblx0XHRmdW5jdGlvbiBmblRlbXBsYXRlVmFsdWVIZWxwKHNGcmFnbWVudE5hbWU6IGFueSkge1xuXHRcdFx0Y29uc3Qgb1RoaXMgPSBuZXcgSlNPTk1vZGVsKHtcblx0XHRcdFx0XHRpZDogc0Zvcm1JZCxcblx0XHRcdFx0XHRpZFByZWZpeDogbVByb3BlcnR5QmFnLmZpZWxkU2VsZWN0b3I/LmlkXG5cdFx0XHRcdH0pLFxuXHRcdFx0XHRvUHJlcHJvY2Vzc29yU2V0dGluZ3MgPSB7XG5cdFx0XHRcdFx0YmluZGluZ0NvbnRleHRzOiB7XG5cdFx0XHRcdFx0XHRlbnRpdHlTZXQ6IG9NZXRhTW9kZWxDb250ZXh0LFxuXHRcdFx0XHRcdFx0Y29udGV4dFBhdGg6IG9NZXRhTW9kZWxDb250ZXh0LFxuXHRcdFx0XHRcdFx0cHJvcGVydHk6IG9Qcm9wZXJ0eUNvbnRleHQsXG5cdFx0XHRcdFx0XHR0aGlzOiBvVGhpcy5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIilcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdG1vZGVsczoge1xuXHRcdFx0XHRcdFx0dGhpczogb1RoaXMsXG5cdFx0XHRcdFx0XHRlbnRpdHlTZXQ6IG9NZXRhTW9kZWwsXG5cdFx0XHRcdFx0XHRjb250ZXh0UGF0aDogb01ldGFNb2RlbCxcblx0XHRcdFx0XHRcdG1ldGFNb2RlbDogb01ldGFNb2RlbCxcblx0XHRcdFx0XHRcdHByb3BlcnR5OiBvTWV0YU1vZGVsXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9O1xuXG5cdFx0XHRyZXR1cm4gRGVsZWdhdGVVdGlsLnRlbXBsYXRlQ29udHJvbEZyYWdtZW50KHNGcmFnbWVudE5hbWUsIG9QcmVwcm9jZXNzb3JTZXR0aW5ncywge30sIG9Nb2RpZmllcik7XG5cdFx0fVxuXG5cdFx0YXN5bmMgZnVuY3Rpb24gZm5UZW1wbGF0ZUZvcm1FbGVtZW50KHNGcmFnbWVudE5hbWU6IGFueSwgb1ZpZXc6IGFueSwgbmF2aWdhdGlvblBhdGg6IHN0cmluZykge1xuXHRcdFx0Y29uc3Qgc09uQ2hhbmdlQ3VzdG9tRGF0YTogc3RyaW5nID0gYXdhaXQgRGVsZWdhdGVVdGlsLmdldEN1c3RvbURhdGEob0Zvcm0sIFwib25DaGFuZ2VcIiwgb01vZGlmaWVyKTtcblx0XHRcdGNvbnN0IHNEaXNwbGF5TW9kZUN1c3RvbURhdGEgPSBhd2FpdCBEZWxlZ2F0ZVV0aWwuZ2V0Q3VzdG9tRGF0YShvRm9ybSwgXCJkaXNwbGF5TW9kZVwiLCBvTW9kaWZpZXIpO1xuXHRcdFx0Y29uc3Qgb1RoaXMgPSBuZXcgSlNPTk1vZGVsKHtcblx0XHRcdFx0Ly8gcHJvcGVydGllcyBhbmQgZXZlbnRzIG9mIEZpZWxkIG1hY3JvXG5cdFx0XHRcdF9mbGV4SWQ6IG1Qcm9wZXJ0eUJhZy5maWVsZFNlbGVjdG9yPy5pZCxcblx0XHRcdFx0b25DaGFuZ2U6IENvbW1vbi5yZW1vdmVFc2NhcGVDaGFyYWN0ZXJzKHNPbkNoYW5nZUN1c3RvbURhdGEpLFxuXHRcdFx0XHRkaXNwbGF5TW9kZTogQ29tbW9uLnJlbW92ZUVzY2FwZUNoYXJhY3RlcnMoc0Rpc3BsYXlNb2RlQ3VzdG9tRGF0YSksXG5cdFx0XHRcdG5hdmlnYXRpb25QYXRoOiBuYXZpZ2F0aW9uUGF0aFxuXHRcdFx0fSk7XG5cdFx0XHRjb25zdCBvUHJlcHJvY2Vzc29yU2V0dGluZ3MgPSB7XG5cdFx0XHRcdGJpbmRpbmdDb250ZXh0czoge1xuXHRcdFx0XHRcdGVudGl0eVNldDogb01ldGFNb2RlbENvbnRleHQsXG5cdFx0XHRcdFx0ZGF0YUZpZWxkOiBvUHJvcGVydHlDb250ZXh0LFxuXHRcdFx0XHRcdHRoaXM6IG9UaGlzLmNyZWF0ZUJpbmRpbmdDb250ZXh0KFwiL1wiKVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRtb2RlbHM6IHtcblx0XHRcdFx0XHR0aGlzOiBvVGhpcyxcblx0XHRcdFx0XHRlbnRpdHlTZXQ6IG9NZXRhTW9kZWwsXG5cdFx0XHRcdFx0bWV0YU1vZGVsOiBvTWV0YU1vZGVsLFxuXHRcdFx0XHRcdGRhdGFGaWVsZDogb01ldGFNb2RlbFxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXG5cdFx0XHRyZXR1cm4gRGVsZWdhdGVVdGlsLnRlbXBsYXRlQ29udHJvbEZyYWdtZW50KHNGcmFnbWVudE5hbWUsIG9QcmVwcm9jZXNzb3JTZXR0aW5ncywgeyB2aWV3OiBvVmlldyB9LCBvTW9kaWZpZXIpO1xuXHRcdH1cblxuXHRcdGNvbnN0IGJWYWx1ZUhlbHBSZXF1aXJlZCA9IGF3YWl0IERlbGVnYXRlVXRpbC5pc1ZhbHVlSGVscFJlcXVpcmVkKG9QYXJhbWV0ZXJzKTtcblx0XHRjb25zdCBiVmFsdWVIZWxwRXhpc3RzID0gYXdhaXQgRGVsZWdhdGVVdGlsLmRvZXNWYWx1ZUhlbHBFeGlzdChvUGFyYW1ldGVycyk7XG5cdFx0bGV0IG9WYWx1ZUhlbHA7XG5cdFx0aWYgKGJWYWx1ZUhlbHBSZXF1aXJlZCAmJiAhYlZhbHVlSGVscEV4aXN0cykge1xuXHRcdFx0b1ZhbHVlSGVscCA9IGF3YWl0IGZuVGVtcGxhdGVWYWx1ZUhlbHAoXCJzYXAuZmUubWFjcm9zLmZvcm0uVmFsdWVIZWxwV3JhcHBlclwiKTtcblx0XHR9XG5cdFx0Y29uc3Qgb0ZpZWxkID0gYXdhaXQgZm5UZW1wbGF0ZUZvcm1FbGVtZW50KFwic2FwLmZlLm1hY3Jvcy5mb3JtLkZvcm1FbGVtZW50RmxleGliaWxpdHlcIiwgbVByb3BlcnR5QmFnLnZpZXcsIHNOYXZpZ2F0aW9uUGF0aCk7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGNvbnRyb2w6IG9GaWVsZCxcblx0XHRcdHZhbHVlSGVscDogb1ZhbHVlSGVscFxuXHRcdH07XG5cdH0sXG5cdC8vIGdldFByb3BlcnR5SW5mbyBpcyBhIHBhdGNoZWQgdmVyc2lvbiBvZiBPRGF0YVY0UmVhZERlbGVnYXRlcyB0byBkZWxhIHdpdGggbmF2aWdhdGlvblBhdGhcblx0Z2V0UHJvcGVydHlJbmZvOiBmdW5jdGlvbiAobVByb3BlcnR5QmFnOiBhbnkpIHtcblx0XHRmdW5jdGlvbiBfaXNDb21wbGV4VHlwZShtUHJvcGVydHk6IGFueSkge1xuXHRcdFx0aWYgKG1Qcm9wZXJ0eSAmJiBtUHJvcGVydHkuJFR5cGUpIHtcblx0XHRcdFx0aWYgKG1Qcm9wZXJ0eS4kVHlwZS50b0xvd2VyQ2FzZSgpLmluZGV4T2YoXCJlZG1cIikgIT09IDApIHtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdC8vQ2hlY2sgaWYgYSBnaXZlbiBwcm9wZXJ0eSBwYXRoIHN0YXJ0cyB3aXRoIGEgbmF2aWdhdGlvbiBwcm9wZXJ0eS5cblx0XHRmdW5jdGlvbiBfc3RhcnRzV2l0aE5hdmlnYXRpb25Qcm9wZXJ0eShzUHJvcGVydHlQYXRoOiBzdHJpbmcsIGFOYXZpZ2F0aW9uUHJvcGVydGllczogc3RyaW5nW10pIHtcblx0XHRcdHJldHVybiBhTmF2aWdhdGlvblByb3BlcnRpZXMuc29tZShmdW5jdGlvbiAoc05hdlByb3ApIHtcblx0XHRcdFx0cmV0dXJuIHNQcm9wZXJ0eVBhdGguc3RhcnRzV2l0aChzTmF2UHJvcCk7XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRmdW5jdGlvbiBfZW5yaWNoUHJvcGVydHkoXG5cdFx0XHRzUHJvcGVydHlQYXRoOiBzdHJpbmcsXG5cdFx0XHRtRWxlbWVudDogYW55LFxuXHRcdFx0bVByb3BlcnR5QW5ub3RhdGlvbnM6IGFueSxcblx0XHRcdHNFbnRpdHlUeXBlOiBzdHJpbmcsXG5cdFx0XHRvRWxlbWVudDogQ29udHJvbCxcblx0XHRcdHNBZ2dyZWdhdGlvbk5hbWU6IHN0cmluZyxcblx0XHRcdGFOYXZpZ2F0aW9uUHJvcGVydGllczogc3RyaW5nW11cblx0XHQpOiBEZWxlZ2F0ZVByb3BlcnR5IHtcblx0XHRcdGNvbnN0IG1Qcm9wOiBEZWxlZ2F0ZVByb3BlcnR5ID0ge1xuXHRcdFx0XHRuYW1lOiBzUHJvcGVydHlQYXRoLFxuXHRcdFx0XHRiaW5kaW5nUGF0aDogc1Byb3BlcnR5UGF0aCxcblx0XHRcdFx0ZW50aXR5VHlwZTogc0VudGl0eVR5cGVcblx0XHRcdH07XG5cdFx0XHQvLyBnZXQgbGFiZWwgaW5mb3JtYXRpb24sIGVpdGhlciB2aWEgRGF0YUZpZWxkRGVmYXVsdCBhbm5vdGF0aW9uIChpZiBleGlzdHMpIG9yIExhYmVsIGFubm90YXRpb25cblx0XHRcdGNvbnN0IG1EYXRhRmllbGREZWZhdWx0QW5ub3RhdGlvbiA9IG1Qcm9wZXJ0eUFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZERlZmF1bHRcIl07XG5cdFx0XHRjb25zdCBzTGFiZWwgPVxuXHRcdFx0XHQobURhdGFGaWVsZERlZmF1bHRBbm5vdGF0aW9uICYmIG1EYXRhRmllbGREZWZhdWx0QW5ub3RhdGlvbi5MYWJlbCkgfHxcblx0XHRcdFx0bVByb3BlcnR5QW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkxhYmVsXCJdO1xuXHRcdFx0bVByb3AubGFiZWwgPSBzTGFiZWwgfHwgXCJbTEFCRUxfTUlTU0lORzogXCIgKyBzUHJvcGVydHlQYXRoICsgXCJdXCI7XG5cdFx0XHQvLyBldmFsdWF0ZSBIaWRkZW4gYW5ub3RhdGlvblxuXHRcdFx0Y29uc3QgbUhpZGRlbkFubm90YXRpb24gPSBtUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IaWRkZW5cIl07XG5cdFx0XHRtUHJvcC5oaWRlRnJvbVJldmVhbCA9IG1IaWRkZW5Bbm5vdGF0aW9uO1xuXHRcdFx0aWYgKG1IaWRkZW5Bbm5vdGF0aW9uICYmIG1IaWRkZW5Bbm5vdGF0aW9uLiRQYXRoKSB7XG5cdFx0XHRcdG1Qcm9wLmhpZGVGcm9tUmV2ZWFsID0gb0VsZW1lbnQuZ2V0QmluZGluZ0NvbnRleHQoKT8uZ2V0UHJvcGVydHkobUhpZGRlbkFubm90YXRpb24uJFBhdGgpO1xuXHRcdFx0fVxuXHRcdFx0Ly8gZXZhbHVhdGUgRmllbGRDb250cm9sIGFubm90YXRpb25cblx0XHRcdGxldCBtRmllbGRDb250cm9sQW5ub3RhdGlvbjtcblx0XHRcdGlmICghbVByb3AuaGlkZUZyb21SZXZlYWwpIHtcblx0XHRcdFx0bUZpZWxkQ29udHJvbEFubm90YXRpb24gPSBtUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRmllbGRDb250cm9sXCJdO1xuXHRcdFx0XHRpZiAobUZpZWxkQ29udHJvbEFubm90YXRpb24pIHtcblx0XHRcdFx0XHRtUHJvcC5oaWRlRnJvbVJldmVhbCA9IG1GaWVsZENvbnRyb2xBbm5vdGF0aW9uLiRFbnVtTWVtYmVyID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5GaWVsZENvbnRyb2xUeXBlL0hpZGRlblwiO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHQvLyBAcnVudGltZSBoaWRkZW4gYnkgZmllbGQgY29udHJvbCB2YWx1ZSA9IDBcblx0XHRcdG1GaWVsZENvbnRyb2xBbm5vdGF0aW9uID0gbVByb3BlcnR5QW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkZpZWxkQ29udHJvbFwiXTtcblx0XHRcdGNvbnN0IHNGaWVsZENvbnRyb2xQYXRoID0gbUZpZWxkQ29udHJvbEFubm90YXRpb24gJiYgbUZpZWxkQ29udHJvbEFubm90YXRpb24uUGF0aDtcblx0XHRcdGlmIChzRmllbGRDb250cm9sUGF0aCAmJiAhbVByb3AuaGlkZUZyb21SZXZlYWwpIHtcblx0XHRcdFx0Ly8gaWYgdGhlIGJpbmRpbmcgaXMgYSBsaXN0IGJpbmRpbmcsIHNraXAgdGhlIGNoZWNrIGZvciBmaWVsZCBjb250cm9sXG5cdFx0XHRcdGNvbnN0IGJMaXN0QmluZGluZyA9IG9FbGVtZW50LmdldEJpbmRpbmcoc0FnZ3JlZ2F0aW9uTmFtZSkgaW5zdGFuY2VvZiBMaXN0QmluZGluZztcblx0XHRcdFx0aWYgKCFiTGlzdEJpbmRpbmcpIHtcblx0XHRcdFx0XHRjb25zdCBpRmllbGRDb250cm9sVmFsdWUgPSBvRWxlbWVudC5nZXRCaW5kaW5nQ29udGV4dCgpPy5nZXRQcm9wZXJ0eShzRmllbGRDb250cm9sUGF0aCk7XG5cdFx0XHRcdFx0bVByb3AuaGlkZUZyb21SZXZlYWwgPSBpRmllbGRDb250cm9sVmFsdWUgPT09IDA7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdC8vIG5vIHN1cHBvcnQgZm9yIERhdGFGaWVsZEZvci9XaXRoQWN0aW9uIGFuZCBEYXRhRmllbGRGb3IvV2l0aEludGVudEJhc2VkTmF2aWdhdGlvbiB3aXRoaW4gRGF0YUZpZWxkRGVmYXVsdCBhbm5vdGF0aW9uXG5cdFx0XHRpZiAoXG5cdFx0XHRcdG1EYXRhRmllbGREZWZhdWx0QW5ub3RhdGlvbiAmJlxuXHRcdFx0XHQobURhdGFGaWVsZERlZmF1bHRBbm5vdGF0aW9uLiRUeXBlID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZEZvckFjdGlvblwiIHx8XG5cdFx0XHRcdFx0bURhdGFGaWVsZERlZmF1bHRBbm5vdGF0aW9uLiRUeXBlID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvblwiIHx8XG5cdFx0XHRcdFx0bURhdGFGaWVsZERlZmF1bHRBbm5vdGF0aW9uLiRUeXBlID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZFdpdGhBY3Rpb25cIiB8fFxuXHRcdFx0XHRcdG1EYXRhRmllbGREZWZhdWx0QW5ub3RhdGlvbi4kVHlwZSA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRXaXRoSW50ZW50QmFzZWROYXZpZ2F0aW9uXCIpXG5cdFx0XHQpIHtcblx0XHRcdFx0bVByb3AudW5zdXBwb3J0ZWQgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdFx0Ly8gbm8gc3VwcG9ydCBmb3IgbmF2aWdhdGlvbiBwcm9wZXJ0aWVzIGFuZCBjb21wbGV4IHByb3BlcnRpZXNcblx0XHRcdGlmIChfc3RhcnRzV2l0aE5hdmlnYXRpb25Qcm9wZXJ0eShzUHJvcGVydHlQYXRoLCBhTmF2aWdhdGlvblByb3BlcnRpZXMpIHx8IF9pc0NvbXBsZXhUeXBlKG1FbGVtZW50KSkge1xuXHRcdFx0XHRtUHJvcC51bnN1cHBvcnRlZCA9IHRydWU7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gbVByb3A7XG5cdFx0fVxuXG5cdFx0Ly8gQ29udmVydCBtZXRhZGF0YSBmb3JtYXQgdG8gZGVsZWdhdGUgZm9ybWF0LlxuXHRcdGZ1bmN0aW9uIF9jb252ZXJ0TWV0YWRhdGFUb0RlbGVnYXRlRm9ybWF0KFxuXHRcdFx0bU9EYXRhRW50aXR5VHlwZTogYW55LFxuXHRcdFx0c0VudGl0eVR5cGU6IHN0cmluZyxcblx0XHRcdG9NZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsLFxuXHRcdFx0b0VsZW1lbnQ6IENvbnRyb2wsXG5cdFx0XHRzQWdncmVnYXRpb25OYW1lOiBzdHJpbmdcblx0XHQpOiBEZWxlZ2F0ZVByb3BlcnR5W10ge1xuXHRcdFx0Y29uc3QgYVByb3BlcnRpZXMgPSBbXTtcblx0XHRcdGxldCBzRWxlbWVudE5hbWUgPSBcIlwiO1xuXHRcdFx0Y29uc3QgYU5hdmlnYXRpb25Qcm9wZXJ0aWVzID0gW107XG5cdFx0XHRsZXQgbUVsZW1lbnQ7XG5cdFx0XHRmb3IgKHNFbGVtZW50TmFtZSBpbiBtT0RhdGFFbnRpdHlUeXBlKSB7XG5cdFx0XHRcdG1FbGVtZW50ID0gbU9EYXRhRW50aXR5VHlwZVtzRWxlbWVudE5hbWVdO1xuXHRcdFx0XHRpZiAobUVsZW1lbnQuJGtpbmQgPT09IFwiTmF2aWdhdGlvblByb3BlcnR5XCIpIHtcblx0XHRcdFx0XHRhTmF2aWdhdGlvblByb3BlcnRpZXMucHVzaChzRWxlbWVudE5hbWUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRmb3IgKHNFbGVtZW50TmFtZSBpbiBtT0RhdGFFbnRpdHlUeXBlKSB7XG5cdFx0XHRcdG1FbGVtZW50ID0gbU9EYXRhRW50aXR5VHlwZVtzRWxlbWVudE5hbWVdO1xuXHRcdFx0XHRpZiAobUVsZW1lbnQuJGtpbmQgPT09IFwiUHJvcGVydHlcIikge1xuXHRcdFx0XHRcdGNvbnN0IG1Qcm9wQW5ub3RhdGlvbnMgPSBvTWV0YU1vZGVsLmdldE9iamVjdChcIi9cIiArIHNFbnRpdHlUeXBlICsgXCIvXCIgKyBzRWxlbWVudE5hbWUgKyBcIkBcIik7XG5cdFx0XHRcdFx0Y29uc3QgbVByb3AgPSBfZW5yaWNoUHJvcGVydHkoXG5cdFx0XHRcdFx0XHRzRWxlbWVudE5hbWUsXG5cdFx0XHRcdFx0XHRtRWxlbWVudCxcblx0XHRcdFx0XHRcdG1Qcm9wQW5ub3RhdGlvbnMsXG5cdFx0XHRcdFx0XHRzRW50aXR5VHlwZSxcblx0XHRcdFx0XHRcdG9FbGVtZW50LFxuXHRcdFx0XHRcdFx0c0FnZ3JlZ2F0aW9uTmFtZSxcblx0XHRcdFx0XHRcdGFOYXZpZ2F0aW9uUHJvcGVydGllc1xuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0YVByb3BlcnRpZXMucHVzaChtUHJvcCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiBhUHJvcGVydGllcztcblx0XHR9XG5cblx0XHQvL0dldCBiaW5kaW5nIHBhdGggZWl0aGVyIGZyb20gcGF5bG9hZCAoaWYgYXZhaWxhYmxlKSBvciB0aGUgZWxlbWVudCdzIGJpbmRpbmcgY29udGV4dC5cblx0XHRmdW5jdGlvbiBfZ2V0QmluZGluZ1BhdGgob0VsZW1lbnQ6IENvbnRyb2wsIG1QYXlsb2FkOiBhbnkpIHtcblx0XHRcdGlmIChtUGF5bG9hZC5wYXRoKSB7XG5cdFx0XHRcdHJldHVybiBtUGF5bG9hZC5wYXRoO1xuXHRcdFx0fVxuXHRcdFx0Y29uc3QgdkJpbmRpbmcgPSBvRWxlbWVudC5nZXRCaW5kaW5nQ29udGV4dCgpO1xuXHRcdFx0aWYgKHZCaW5kaW5nKSB7XG5cdFx0XHRcdGlmIChvRWxlbWVudC5kYXRhKFwibmF2aWdhdGlvblBhdGhcIikpIHtcblx0XHRcdFx0XHRyZXR1cm4gdkJpbmRpbmcuZ2V0UGF0aCgpICsgXCIvXCIgKyBvRWxlbWVudC5kYXRhKFwibmF2aWdhdGlvblBhdGhcIik7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIHZCaW5kaW5nLmdldFBhdGgoKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvL0dldCBhbGwgcHJvcGVydGllcyBvZiB0aGUgZWxlbWVudCdzIG1vZGVsLlxuXHRcdGZ1bmN0aW9uIF9nZXRPRGF0YVByb3BlcnRpZXNPZk1vZGVsKG9FbGVtZW50OiBDb250cm9sLCBzQWdncmVnYXRpb25OYW1lOiBzdHJpbmcsIG1QYXlsb2FkOiBhbnkpIHtcblx0XHRcdGNvbnN0IG9Nb2RlbCA9IG9FbGVtZW50LmdldE1vZGVsKG1QYXlsb2FkLm1vZGVsTmFtZSk7XG5cdFx0XHRpZiAob01vZGVsKSB7XG5cdFx0XHRcdGlmIChvTW9kZWwuaXNBKFwic2FwLnVpLm1vZGVsLm9kYXRhLnY0Lk9EYXRhTW9kZWxcIikpIHtcblx0XHRcdFx0XHRjb25zdCBvTWV0YU1vZGVsID0gb01vZGVsLmdldE1ldGFNb2RlbCgpIGFzIE9EYXRhTWV0YU1vZGVsO1xuXHRcdFx0XHRcdGNvbnN0IHNCaW5kaW5nQ29udGV4dFBhdGggPSBfZ2V0QmluZGluZ1BhdGgob0VsZW1lbnQsIG1QYXlsb2FkKTtcblx0XHRcdFx0XHRpZiAoc0JpbmRpbmdDb250ZXh0UGF0aCkge1xuXHRcdFx0XHRcdFx0Y29uc3Qgb01ldGFNb2RlbENvbnRleHQgPSBvTWV0YU1vZGVsLmdldE1ldGFDb250ZXh0KHNCaW5kaW5nQ29udGV4dFBhdGgpO1xuXHRcdFx0XHRcdFx0Y29uc3Qgb01ldGFNb2RlbENvbnRleHRPYmplY3QgPSBvTWV0YU1vZGVsQ29udGV4dC5nZXRPYmplY3QoKTtcblx0XHRcdFx0XHRcdGNvbnN0IG1PRGF0YUVudGl0eVR5cGUgPSBvTWV0YU1vZGVsQ29udGV4dC5nZXRPYmplY3Qob01ldGFNb2RlbENvbnRleHRPYmplY3QuJFR5cGUpO1xuXHRcdFx0XHRcdFx0cmV0dXJuIF9jb252ZXJ0TWV0YWRhdGFUb0RlbGVnYXRlRm9ybWF0KFxuXHRcdFx0XHRcdFx0XHRtT0RhdGFFbnRpdHlUeXBlLFxuXHRcdFx0XHRcdFx0XHRvTWV0YU1vZGVsQ29udGV4dE9iamVjdC4kVHlwZSxcblx0XHRcdFx0XHRcdFx0b01ldGFNb2RlbCxcblx0XHRcdFx0XHRcdFx0b0VsZW1lbnQsXG5cdFx0XHRcdFx0XHRcdHNBZ2dyZWdhdGlvbk5hbWVcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFtdKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCkudGhlbihmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gX2dldE9EYXRhUHJvcGVydGllc09mTW9kZWwobVByb3BlcnR5QmFnLmVsZW1lbnQsIG1Qcm9wZXJ0eUJhZy5hZ2dyZWdhdGlvbk5hbWUsIG1Qcm9wZXJ0eUJhZy5wYXlsb2FkKTtcblx0XHR9KTtcblx0fVxufTtcblxuZXhwb3J0IGRlZmF1bHQgRGVsZWdhdGU7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7RUFnQkEsTUFBTUEsUUFBUSxHQUFHO0lBQ2hCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ0MsWUFBWSxFQUFFLGdCQUFnQkMsWUFXN0IsRUFBRTtNQUFBO01BQ0YsTUFBTUMsU0FBUyxHQUFHRCxZQUFZLENBQUNFLFFBQVE7UUFDdENDLFVBQVUsNEJBQUdILFlBQVksQ0FBQ0ksWUFBWSwwREFBekIsc0JBQTJCQyxZQUFZLEVBQUU7UUFDdERDLEtBQUssR0FBR04sWUFBWSxDQUFDTyxPQUFPO01BRTdCLElBQUlDLFVBQVUsR0FBRyxNQUFNQyxZQUFZLENBQUNDLGFBQWEsQ0FBQ0osS0FBSyxFQUFFLFdBQVcsRUFBRUwsU0FBUyxDQUFDO01BQ2hGLElBQUksQ0FBQ08sVUFBVSxFQUFFO1FBQ2hCQSxVQUFVLEdBQUcsTUFBTUMsWUFBWSxDQUFDQyxhQUFhLENBQUNKLEtBQUssRUFBRSxnQkFBZ0IsRUFBRUwsU0FBUyxDQUFDO01BQ2xG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