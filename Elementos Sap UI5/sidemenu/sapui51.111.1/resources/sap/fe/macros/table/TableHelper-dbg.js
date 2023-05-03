/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/converters/controls/Common/DataVisualization", "sap/fe/core/converters/ManifestSettings", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/formatters/TableFormatter", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/library", "sap/fe/core/templating/DataModelPathHelper", "sap/fe/core/templating/PropertyHelper", "sap/fe/core/templating/UIFormatters", "sap/fe/macros/CommonHelper", "sap/fe/macros/field/FieldTemplating", "sap/fe/macros/internal/helpers/ActionHelper", "sap/fe/macros/table/TableSizeHelper", "sap/ui/mdc/enum/EditMode"], function (Log, DataVisualization, ManifestSettings, MetaModelConverter, TableFormatter, BindingToolkit, StableIdHelper, FELibrary, DataModelPathHelper, PropertyHelper, UIFormatters, CommonHelper, FieldTemplating, ActionHelper, TableSizeHelper, EditMode) {
  "use strict";

  var formatValueRecursively = FieldTemplating.formatValueRecursively;
  var getEditMode = UIFormatters.getEditMode;
  var isImageURL = PropertyHelper.isImageURL;
  var hasText = PropertyHelper.hasText;
  var getTargetObjectPath = DataModelPathHelper.getTargetObjectPath;
  var getContextRelativeTargetObjectPath = DataModelPathHelper.getContextRelativeTargetObjectPath;
  var generate = StableIdHelper.generate;
  var pathInModel = BindingToolkit.pathInModel;
  var isPathInModelExpression = BindingToolkit.isPathInModelExpression;
  var isConstant = BindingToolkit.isConstant;
  var ifElse = BindingToolkit.ifElse;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var formatResult = BindingToolkit.formatResult;
  var constant = BindingToolkit.constant;
  var compileExpression = BindingToolkit.compileExpression;
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  var TemplateType = ManifestSettings.TemplateType;
  var getUiControl = DataVisualization.getUiControl;
  const CreationMode = FELibrary.CreationMode;
  /**
   * Helper class used by the control library for OData-specific handling (OData V4)
   *
   * @private
   * @experimental This module is only for internal/experimental use!
   */
  const TableHelper = {
    /**
     * Check if a given action is static.
     *
     * @param oActionContext The instance of the action
     * @param sActionName The name of the action
     * @returns Returns 'true' if action is static, else 'false'
     * @private
     * @ui5-restricted
     */
    _isStaticAction: function (oActionContext, sActionName) {
      let oAction;
      if (oActionContext) {
        if (Array.isArray(oActionContext)) {
          const sEntityType = this._getActionOverloadEntityType(sActionName);
          if (sEntityType) {
            oAction = oActionContext.find(function (action) {
              return action.$IsBound && action.$Parameter[0].$Type === sEntityType;
            });
          } else {
            // if this is just one - OK we take it. If it's more it's actually a wrong usage by the app
            // as we used the first one all the time we keep it as it is
            oAction = oActionContext[0];
          }
        } else {
          oAction = oActionContext;
        }
      }
      return !!oAction && oAction.$IsBound && oAction.$Parameter[0].$isCollection;
    },
    /**
     * Get the entity type of an action overload.
     *
     * @param sActionName The name of the action.
     * @returns The entity type used in the action overload.
     * @private
     */
    _getActionOverloadEntityType: function (sActionName) {
      if (sActionName && sActionName.indexOf("(") > -1) {
        const aParts = sActionName.split("(");
        return aParts[aParts.length - 1].replaceAll(")", "");
      }
      return undefined;
    },
    /**
     * Checks whether the action is overloaded on a different entity type.
     *
     * @param sActionName The name of the action.
     * @param sAnnotationTargetEntityType The entity type of the annotation target.
     * @returns Returns 'true' if the action is overloaded with a different entity type, else 'false'.
     * @private
     */
    _isActionOverloadOnDifferentType: function (sActionName, sAnnotationTargetEntityType) {
      const sEntityType = this._getActionOverloadEntityType(sActionName);
      return !!sEntityType && sAnnotationTargetEntityType !== sEntityType;
    },
    getMessageForDraftValidation: function (oThis) {
      var _oCollectionAnnotatio, _oThis$tableDefinitio;
      const oCollectionAnnotations = oThis.collection.getObject("./@");
      const sMessagePath = (_oCollectionAnnotatio = oCollectionAnnotations["@com.sap.vocabularies.Common.v1.Messages"]) === null || _oCollectionAnnotatio === void 0 ? void 0 : _oCollectionAnnotatio.$Path;
      if (sMessagePath && ((_oThis$tableDefinitio = oThis.tableDefinition) === null || _oThis$tableDefinitio === void 0 ? void 0 : _oThis$tableDefinitio.getProperty("/template")) === TemplateType.ObjectPage && !!Object.keys(oCollectionAnnotations).find(sKey => {
        var _oAnnotation$TargetPr;
        const oAnnotation = oCollectionAnnotations[sKey];
        return oAnnotation && oAnnotation.$Type === "com.sap.vocabularies.Common.v1.SideEffectsType" && !oAnnotation.SourceProperties && !oAnnotation.SourceEntities && ((_oAnnotation$TargetPr = oAnnotation.TargetProperties) === null || _oAnnotation$TargetPr === void 0 ? void 0 : _oAnnotation$TargetPr.indexOf(sMessagePath)) > -1;
      })) {
        return sMessagePath;
      }
      return "";
    },
    /**
     * Returns an array of the fields listed by the property RequestAtLeast in the PresentationVariant .
     *
     * @param oPresentationVariant The annotation related to com.sap.vocabularies.UI.v1.PresentationVariant.
     * @returns The fields.
     * @private
     * @ui5-restricted
     */
    getFieldsRequestedByPresentationVariant: function (oPresentationVariant) {
      var _oPresentationVariant;
      return ((_oPresentationVariant = oPresentationVariant.RequestAtLeast) === null || _oPresentationVariant === void 0 ? void 0 : _oPresentationVariant.map(oRequested => oRequested.value)) || [];
    },
    getNavigationAvailableFieldsFromLineItem: function (aLineItemContext) {
      const aSelectedFieldsArray = [];
      (aLineItemContext.getObject() || []).forEach(function (oRecord) {
        var _oRecord$NavigationAv;
        if (oRecord.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation" && !oRecord.Inline && !oRecord.Determining && (_oRecord$NavigationAv = oRecord.NavigationAvailable) !== null && _oRecord$NavigationAv !== void 0 && _oRecord$NavigationAv.$Path) {
          aSelectedFieldsArray.push(oRecord.NavigationAvailable.$Path);
        }
      });
      return aSelectedFieldsArray;
    },
    getNavigationAvailableMap: function (aLineItemCollection) {
      const oIBNNavigationAvailableMap = {};
      aLineItemCollection.forEach(function (oRecord) {
        const sKey = `${oRecord.SemanticObject}-${oRecord.Action}`;
        if (oRecord.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation" && !oRecord.Inline && oRecord.RequiresContext) {
          if (oRecord.NavigationAvailable !== undefined) {
            oIBNNavigationAvailableMap[sKey] = oRecord.NavigationAvailable.$Path ? oRecord.NavigationAvailable.$Path : oRecord.NavigationAvailable;
          }
        }
      });
      return JSON.stringify(oIBNNavigationAvailableMap);
    },
    /**
     * Return the context of the UI Line Item.
     *
     * @param oPresentationContext The context of the presentation (Presentation variant or UI.LineItem)
     * @returns The context of the UI Line Item
     */
    getUiLineItem: function (oPresentationContext) {
      return getUiControl(oPresentationContext, "@com.sap.vocabularies.UI.v1.LineItem");
    },
    /**
     * Creates and returns a select query with the selected fields from the parameters that were passed.
     *
     * @param oThis The instance of the inner model of the table building block
     * @returns The 'select' query that has the selected fields from the parameters that were passed
     */
    create$Select: function (oThis) {
      const collectionContext = oThis.collection;
      const selectedFields = [];
      const lineItemContext = TableHelper.getUiLineItem(oThis.metaPath);
      const targetCollectionPath = CommonHelper.getTargetCollection(collectionContext);
      function pushField(field) {
        if (field && !selectedFields.includes(field) && field.indexOf("/") !== 0) {
          // Do not add singleton property (with absolute path) to $select
          selectedFields.push(field);
        }
      }
      function pushFieldList(fields) {
        if (fields !== null && fields !== void 0 && fields.length) {
          fields.forEach(pushField);
        }
      }
      const columns = oThis.tableDefinition.getObject("columns");
      const propertiesFromCustomColumns = this.getPropertiesFromCustomColumns(columns);
      if (propertiesFromCustomColumns !== null && propertiesFromCustomColumns !== void 0 && propertiesFromCustomColumns.length) {
        pushFieldList(propertiesFromCustomColumns);
      }
      if (lineItemContext.getPath().indexOf("@com.sap.vocabularies.UI.v1.LineItem") > -1) {
        var _collectionContext$ge, _collectionContext$ge2, _collectionContext$ge3, _collectionContext$ge4;
        // Don't process EntityType without LineItem
        const presentationAnnotation = getInvolvedDataModelObjects(oThis.metaPath).targetObject;
        const operationAvailableProperties = (oThis.tableDefinition.getObject("operationAvailableProperties") || "").split(",");
        const applicableProperties = TableHelper._filterNonApplicableProperties(operationAvailableProperties, collectionContext);
        const semanticKeys = (collectionContext.getObject(`${targetCollectionPath}/@com.sap.vocabularies.Common.v1.SemanticKey`) || []).map(semanticKey => semanticKey.$PropertyPath);
        if ((presentationAnnotation === null || presentationAnnotation === void 0 ? void 0 : presentationAnnotation.$Type) === "com.sap.vocabularies.UI.v1.PresentationVariantType") {
          pushFieldList(TableHelper.getFieldsRequestedByPresentationVariant(presentationAnnotation));
        }
        pushFieldList(TableHelper.getNavigationAvailableFieldsFromLineItem(lineItemContext));
        pushFieldList(applicableProperties);
        pushFieldList(semanticKeys);
        pushField(TableHelper.getMessageForDraftValidation(oThis));
        pushField((_collectionContext$ge = collectionContext.getObject(`${targetCollectionPath}@Org.OData.Capabilities.V1.DeleteRestrictions`)) === null || _collectionContext$ge === void 0 ? void 0 : (_collectionContext$ge2 = _collectionContext$ge.Deletable) === null || _collectionContext$ge2 === void 0 ? void 0 : _collectionContext$ge2.$Path);
        pushField((_collectionContext$ge3 = collectionContext.getObject(`${targetCollectionPath}@Org.OData.Capabilities.V1.UpdateRestrictions`)) === null || _collectionContext$ge3 === void 0 ? void 0 : (_collectionContext$ge4 = _collectionContext$ge3.Updatable) === null || _collectionContext$ge4 === void 0 ? void 0 : _collectionContext$ge4.$Path);
      }
      return selectedFields.join(",");
    },
    /**
     * Method to get column's width if defined from manifest or from customization via annotations.
     *
     * @function
     * @name getColumnWidth
     * @param oThis The instance of the inner model of the table building block
     * @param column Defined width of the column, which is taken with priority if not null, undefined or empty
     * @param dataField DataField definition object
     * @param dataFieldActionText DataField's text from button
     * @param dataModelObjectPath The object path of the data model
     * @param useRemUnit Indicates if the rem unit must be concatenated with the column width result
     * @param microChartTitle The object containing title and description of the MicroChart
     * @returns - Column width if defined, otherwise width is set to auto
     */
    getColumnWidth: function (oThis, column, dataField, dataFieldActionText, dataModelObjectPath, useRemUnit, microChartTitle) {
      if (column.width) {
        return column.width;
      }
      if (oThis.enableAutoColumnWidth === true) {
        let width;
        width = this.getColumnWidthForImage(dataModelObjectPath) || this.getColumnWidthForDataField(oThis, column, dataField, dataFieldActionText, dataModelObjectPath, microChartTitle) || undefined;
        if (width) {
          return useRemUnit ? `${width}rem` : width;
        }
        width = compileExpression(formatResult([pathInModel("/editMode", "ui"), pathInModel("tablePropertiesAvailable", "internal"), column.name, useRemUnit], TableFormatter.getColumnWidth));
        return width;
      }
      return undefined;
    },
    /**
     * Method to get the width of the column containing an image.
     *
     * @function
     * @name getColumnWidthForImage
     * @param dataModelObjectPath The data model object path
     * @returns - Column width if defined, otherwise null (the width is treated as a rem value)
     */
    getColumnWidthForImage: function (dataModelObjectPath) {
      var _dataModelObjectPath$, _dataModelObjectPath$2, _dataModelObjectPath$3, _dataModelObjectPath$4, _dataModelObjectPath$5, _dataModelObjectPath$6, _dataModelObjectPath$7, _dataModelObjectPath$8, _dataModelObjectPath$9, _dataModelObjectPath$10, _annotations$Core2, _annotations$Core2$Me;
      let width = null;
      const annotations = (_dataModelObjectPath$ = dataModelObjectPath.targetObject) === null || _dataModelObjectPath$ === void 0 ? void 0 : (_dataModelObjectPath$2 = _dataModelObjectPath$.Value) === null || _dataModelObjectPath$2 === void 0 ? void 0 : (_dataModelObjectPath$3 = _dataModelObjectPath$2.$target) === null || _dataModelObjectPath$3 === void 0 ? void 0 : _dataModelObjectPath$3.annotations;
      const dataType = (_dataModelObjectPath$4 = dataModelObjectPath.targetObject) === null || _dataModelObjectPath$4 === void 0 ? void 0 : (_dataModelObjectPath$5 = _dataModelObjectPath$4.Value) === null || _dataModelObjectPath$5 === void 0 ? void 0 : (_dataModelObjectPath$6 = _dataModelObjectPath$5.$target) === null || _dataModelObjectPath$6 === void 0 ? void 0 : _dataModelObjectPath$6.type;
      if ((_dataModelObjectPath$7 = dataModelObjectPath.targetObject) !== null && _dataModelObjectPath$7 !== void 0 && _dataModelObjectPath$7.Value && getEditMode((_dataModelObjectPath$8 = dataModelObjectPath.targetObject.Value) === null || _dataModelObjectPath$8 === void 0 ? void 0 : _dataModelObjectPath$8.$target, dataModelObjectPath, false, false, dataModelObjectPath.targetObject) === EditMode.Display) {
        var _annotations$Core, _annotations$Core$Med;
        const hasTextAnnotation = hasText(dataModelObjectPath.targetObject.Value.$target);
        if (dataType === "Edm.Stream" && !hasTextAnnotation && annotations !== null && annotations !== void 0 && (_annotations$Core = annotations.Core) !== null && _annotations$Core !== void 0 && (_annotations$Core$Med = _annotations$Core.MediaType) !== null && _annotations$Core$Med !== void 0 && _annotations$Core$Med.includes("image/")) {
          width = 6.2;
        }
      } else if (annotations && (isImageURL((_dataModelObjectPath$9 = dataModelObjectPath.targetObject) === null || _dataModelObjectPath$9 === void 0 ? void 0 : (_dataModelObjectPath$10 = _dataModelObjectPath$9.Value) === null || _dataModelObjectPath$10 === void 0 ? void 0 : _dataModelObjectPath$10.$target) || annotations !== null && annotations !== void 0 && (_annotations$Core2 = annotations.Core) !== null && _annotations$Core2 !== void 0 && (_annotations$Core2$Me = _annotations$Core2.MediaType) !== null && _annotations$Core2$Me !== void 0 && _annotations$Core2$Me.includes("image/"))) {
        width = 6.2;
      }
      return width;
    },
    /**
     * Method to get the width of the column containing the DataField.
     *
     * @function
     * @name getColumnWidthForDataField
     * @param oThis The instance of the inner model of the table building block
     * @param column Defined width of the column, which is taken with priority if not null, undefined or empty
     * @param dataField Data Field
     * @param dataFieldActionText DataField's text from button
     * @param dataModelObjectPath The data model object path
     * @param oMicroChartTitle The object containing the title and description of the MicroChart
     * @returns - Column width if defined, otherwise null ( the width is treated as a rem value)
     */
    getColumnWidthForDataField: function (oThis, column, dataField, dataFieldActionText, dataModelObjectPath, oMicroChartTitle) {
      var _dataModelObjectPath$11, _dataModelObjectPath$12;
      const annotations = (_dataModelObjectPath$11 = dataModelObjectPath.targetObject) === null || _dataModelObjectPath$11 === void 0 ? void 0 : _dataModelObjectPath$11.annotations;
      const dataType = (_dataModelObjectPath$12 = dataModelObjectPath.targetObject) === null || _dataModelObjectPath$12 === void 0 ? void 0 : _dataModelObjectPath$12.$Type;
      let width = null;
      if (dataType === "com.sap.vocabularies.UI.v1.DataFieldForAction" || dataType === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation" || dataType === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation" && dataField.Target.$AnnotationPath.indexOf(`@${"com.sap.vocabularies.UI.v1.FieldGroup"}`) === -1) {
        var _dataField$Label;
        let nTmpTextWidth;
        nTmpTextWidth = TableSizeHelper.getButtonWidth(dataFieldActionText) || TableSizeHelper.getButtonWidth(dataField === null || dataField === void 0 ? void 0 : (_dataField$Label = dataField.Label) === null || _dataField$Label === void 0 ? void 0 : _dataField$Label.toString()) || TableSizeHelper.getButtonWidth(annotations === null || annotations === void 0 ? void 0 : annotations.Label);

        // get width for rating or progress bar datafield
        const nTmpVisualizationWidth = TableSizeHelper.getWidthForDataFieldForAnnotation(dataModelObjectPath.targetObject).propertyWidth;
        if (nTmpVisualizationWidth > nTmpTextWidth) {
          width = nTmpVisualizationWidth;
        } else if (dataFieldActionText || annotations && (annotations.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation" || annotations.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction")) {
          // Add additional 1.8 rem to avoid showing ellipsis in some cases.
          nTmpTextWidth += 1.8;
          width = nTmpTextWidth;
        }
        width = width || this.getColumnWidthForChart(oThis, column, dataField, nTmpTextWidth, oMicroChartTitle);
      }
      return width;
    },
    /**
     * Method to get the width of the column containing the Chart.
     *
     * @function
     * @name getColumnWidthForChart
     * @param oThis The instance of the inner model of the table building block
     * @param column Defined width of the column, which is taken with priority if not null, undefined or empty
     * @param dataField Data Field
     * @param columnLabelWidth The width of the column label or button label
     * @param microChartTitle The object containing the title and the description of the MicroChart
     * @returns - Column width if defined, otherwise null (the width is treated as a rem value)
     */
    getColumnWidthForChart(oThis, column, dataField, columnLabelWidth, microChartTitle) {
      var _dataField$Target, _dataField$Target$$An;
      let chartSize,
        width = null;
      if (((_dataField$Target = dataField.Target) === null || _dataField$Target === void 0 ? void 0 : (_dataField$Target$$An = _dataField$Target.$AnnotationPath) === null || _dataField$Target$$An === void 0 ? void 0 : _dataField$Target$$An.indexOf("@com.sap.vocabularies.UI.v1.Chart")) !== -1) {
        switch (this.getChartSize(oThis, column)) {
          case "XS":
            chartSize = 4.4;
            break;
          case "S":
            chartSize = 4.6;
            break;
          case "M":
            chartSize = 5.5;
            break;
          case "L":
            chartSize = 6.9;
            break;
          default:
            chartSize = 5.3;
        }
        columnLabelWidth += 1.8;
        if (!this.getShowOnlyChart(oThis, column) && microChartTitle && (microChartTitle.Title.length || microChartTitle.Description.length)) {
          const tmpText = microChartTitle.Title.length > microChartTitle.Description.length ? microChartTitle.Title : microChartTitle.Description;
          const titleSize = TableSizeHelper.getButtonWidth(tmpText) + 7;
          const tmpWidth = titleSize > columnLabelWidth ? titleSize : columnLabelWidth;
          width = tmpWidth;
        } else if (columnLabelWidth > chartSize) {
          width = columnLabelWidth;
        } else {
          width = chartSize;
        }
      }
      return width;
    },
    /**
     * Method to add a margin class at the control.
     *
     * @function
     * @name getMarginClass
     * @param oCollection Title of the DataPoint
     * @param oDataField Value of the DataPoint
     * @param sVisualization
     * @param sFieldGroupHiddenExpressions Hidden expression contained in FieldGroup
     * @returns Adjusting the margin
     */
    getMarginClass: function (oCollection, oDataField, sVisualization, sFieldGroupHiddenExpressions) {
      let sBindingExpression,
        sClass = "";
      if (JSON.stringify(oCollection[oCollection.length - 1]) == JSON.stringify(oDataField)) {
        //If rating indicator is last element in fieldgroup, then the 0.5rem margin added by sapMRI class of interactive rating indicator on top and bottom must be nullified.
        if (sVisualization == "com.sap.vocabularies.UI.v1.VisualizationType/Rating") {
          sClass = "sapUiNoMarginBottom sapUiNoMarginTop";
        }
      } else if (sVisualization === "com.sap.vocabularies.UI.v1.VisualizationType/Rating") {
        //If rating indicator is NOT the last element in fieldgroup, then to maintain the 0.5rem spacing between cogetMarginClassntrols (as per UX spec),
        //only the top margin added by sapMRI class of interactive rating indicator must be nullified.

        sClass = "sapUiNoMarginTop";
      } else {
        sClass = "sapUiTinyMarginBottom";
      }
      if (sFieldGroupHiddenExpressions && sFieldGroupHiddenExpressions !== "true" && sFieldGroupHiddenExpressions !== "false") {
        const sHiddenExpressionResult = sFieldGroupHiddenExpressions.substring(sFieldGroupHiddenExpressions.indexOf("{=") + 2, sFieldGroupHiddenExpressions.lastIndexOf("}"));
        sBindingExpression = "{= " + sHiddenExpressionResult + " ? '" + sClass + "' : " + "''" + " }";
        return sBindingExpression;
      } else {
        return sClass;
      }
    },
    /**
     * Method to get VBox visibility.
     *
     * @param collection Collection of data fields in VBox
     * @param fieldGroupHiddenExpressions Hidden expression contained in FieldGroup
     * @param fieldGroup Data field containing the VBox
     * @returns Visibility expression
     */
    getVBoxVisibility: function (collection, fieldGroupHiddenExpressions, fieldGroup) {
      let allStatic = true;
      const hiddenPaths = [];
      if (fieldGroup["@com.sap.vocabularies.UI.v1.Hidden"]) {
        return fieldGroupHiddenExpressions;
      }
      for (const dataField of collection) {
        const hiddenAnnotationValue = dataField["@com.sap.vocabularies.UI.v1.Hidden"];
        if (hiddenAnnotationValue === undefined || hiddenAnnotationValue === false) {
          hiddenPaths.push(false);
          continue;
        }
        if (hiddenAnnotationValue === true) {
          hiddenPaths.push(true);
          continue;
        }
        if (hiddenAnnotationValue.$Path) {
          hiddenPaths.push(pathInModel(hiddenAnnotationValue.$Path));
          allStatic = false;
          continue;
        }
        if (typeof hiddenAnnotationValue === "object") {
          // Dynamic expression found in a field
          return fieldGroupHiddenExpressions;
        }
      }
      const hasAnyPathExpressions = constant(hiddenPaths.length > 0 && allStatic !== true);
      const hasAllHiddenStaticExpressions = constant(hiddenPaths.length > 0 && hiddenPaths.indexOf(false) === -1 && allStatic);
      return compileExpression(ifElse(hasAnyPathExpressions, formatResult(hiddenPaths, TableFormatter.getVBoxVisibility), ifElse(hasAllHiddenStaticExpressions, constant(false), constant(true))));
    },
    /**
     * Method to provide hidden filters to the table.
     *
     * @function
     * @name formatHiddenFilters
     * @param oHiddenFilter The hiddenFilters via context named filters (and key hiddenFilters) passed to Macro Table
     * @returns The string representation of the hidden filters
     */
    formatHiddenFilters: function (oHiddenFilter) {
      if (oHiddenFilter) {
        try {
          return JSON.stringify(oHiddenFilter);
        } catch (ex) {
          return undefined;
        }
      }
      return undefined;
    },
    /**
     * Method to get the stable ID of a table element (column or FieldGroup label).
     *
     * @function
     * @name getElementStableId
     * @param tableId Current object ID
     * @param elementId Element Id or suffix
     * @param dataModelObjectPath DataModelObjectPath of the dataField
     * @returns The stable ID for a given column
     */
    getElementStableId: function (tableId, elementId, dataModelObjectPath) {
      var _Value;
      if (!tableId) {
        return undefined;
      }
      const dataField = dataModelObjectPath.targetObject;
      let dataFieldPart;
      switch (dataField.$Type) {
        case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
          dataFieldPart = dataField.Target.value;
          break;
        case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
        case "com.sap.vocabularies.UI.v1.DataFieldForAction":
          dataFieldPart = dataField;
          break;
        default:
          dataFieldPart = ((_Value = dataField.Value) === null || _Value === void 0 ? void 0 : _Value.path) ?? "";
          break;
      }
      return generate([tableId, elementId, dataFieldPart]);
    },
    /**
     * Method to get the stable ID of the column.
     *
     * @function
     * @name getColumnStableId
     * @param id Current object ID
     * @param dataModelObjectPath DataModelObjectPath of the dataField
     * @returns The stable ID for a given column
     */
    getColumnStableId: function (id, dataModelObjectPath) {
      return TableHelper.getElementStableId(id, "C", dataModelObjectPath);
    },
    getFieldGroupLabelStableId: function (id, dataModelObjectPath) {
      return TableHelper.getElementStableId(id, "FGLabel", dataModelObjectPath);
    },
    /**
     * Method filters out properties which do not belong to the collection.
     *
     * @param aPropertyPaths The array of properties to be checked.
     * @param oCollectionContext The collection context to be used.
     * @returns The array of applicable properties.
     * @private
     */
    _filterNonApplicableProperties: function (aPropertyPaths, oCollectionContext) {
      return aPropertyPaths && aPropertyPaths.filter(function (sPropertyPath) {
        return oCollectionContext.getObject(`./${sPropertyPath}`);
      });
    },
    /**
     * Method to retreive the listed properties from the custom columns
     *
     * @param columns The table columns
     * @returns The list of available properties from the custom columns
     * @private
     */

    getPropertiesFromCustomColumns: function (columns) {
      // Add properties from the custom columns, this is required for the export of all the properties listed on a custom column
      if (!(columns !== null && columns !== void 0 && columns.length)) {
        return;
      }
      const propertiesFromCustomColumns = [];
      for (const column of columns) {
        var _column$properties;
        if ("properties" in column && (_column$properties = column.properties) !== null && _column$properties !== void 0 && _column$properties.length) {
          for (const property of column.properties) {
            if (propertiesFromCustomColumns.indexOf(property) === -1) {
              // only add property if it doesn't exist
              propertiesFromCustomColumns.push(property);
            }
          }
        }
      }
      return propertiesFromCustomColumns;
    },
    /**
     * Method to generate the binding information for a table row.
     *
     * @param oThis The instance of the inner model of the table building block
     * @returns - Returns the binding information of a table row
     */
    getRowsBindingInfo: function (oThis) {
      const dataModelPath = getInvolvedDataModelObjects(oThis.collection, oThis.contextPath);
      const path = getContextRelativeTargetObjectPath(dataModelPath) || getTargetObjectPath(dataModelPath);
      const oRowBinding = {
        ui5object: true,
        suspended: false,
        path: CommonHelper.addSingleQuotes(path),
        parameters: {
          $count: true
        },
        events: {}
      };
      if (oThis.tableDefinition.getObject("enable$select")) {
        // Don't add $select parameter in case of an analytical query, this isn't supported by the model
        const sSelect = TableHelper.create$Select(oThis);
        if (sSelect) {
          oRowBinding.parameters.$select = `'${sSelect}'`;
        }
      }
      if (oThis.tableDefinition.getObject("enable$$getKeepAliveContext")) {
        // we later ensure in the delegate only one list binding for a given targetCollectionPath has the flag $$getKeepAliveContext
        oRowBinding.parameters.$$getKeepAliveContext = true;
      }
      oRowBinding.parameters.$$groupId = CommonHelper.addSingleQuotes("$auto.Workers");
      oRowBinding.parameters.$$updateGroupId = CommonHelper.addSingleQuotes("$auto");
      oRowBinding.parameters.$$ownRequest = true;
      oRowBinding.parameters.$$patchWithoutSideEffects = true;
      oRowBinding.events.patchSent = CommonHelper.addSingleQuotes(".editFlow.handlePatchSent");
      oRowBinding.events.dataReceived = CommonHelper.addSingleQuotes("API.onInternalDataReceived");
      oRowBinding.events.dataRequested = CommonHelper.addSingleQuotes("API.onInternalDataRequested");
      // recreate an empty row when one is activated
      oRowBinding.events.createActivate = CommonHelper.addSingleQuotes(".editFlow.handleCreateActivate");
      if (oThis.onContextChange !== undefined && oThis.onContextChange !== null) {
        oRowBinding.events.change = CommonHelper.addSingleQuotes(oThis.onContextChange);
      }
      return CommonHelper.objectToString(oRowBinding);
    },
    /**
     * Method to check the validity of the fields in the creation row.
     *
     * @function
     * @name validateCreationRowFields
     * @param oFieldValidityObject Current Object holding the fields
     * @returns `true` if all the fields in the creation row are valid, `false` otherwise
     */
    validateCreationRowFields: function (oFieldValidityObject) {
      if (!oFieldValidityObject) {
        return false;
      }
      return Object.keys(oFieldValidityObject).length > 0 && Object.keys(oFieldValidityObject).every(function (key) {
        return oFieldValidityObject[key]["validity"];
      });
    },
    /**
     * Method to get the expression for the 'press' event for the DataFieldForActionButton.
     *
     * @function
     * @name pressEventDataFieldForActionButton
     * @param oThis Current object
     * @param oDataField Value of the DataPoint
     * @param sEntitySetName Name of the EntitySet
     * @param sOperationAvailableMap OperationAvailableMap as stringified JSON object
     * @param oActionContext Action object
     * @param bIsNavigable Action either triggers navigation or not
     * @param bEnableAutoScroll Action either triggers scrolling to the newly created items in the related table or not
     * @param sDefaultValuesExtensionFunction Function name to prefill dialog parameters
     * @returns The binding expression
     */
    pressEventDataFieldForActionButton: function (oThis, oDataField, sEntitySetName, sOperationAvailableMap, oActionContext, bIsNavigable, bEnableAutoScroll, sDefaultValuesExtensionFunction) {
      const sActionName = oDataField.Action,
        sAnnotationTargetEntityType = oThis && oThis.collection.getObject("$Type"),
        bStaticAction = this._isStaticAction(oActionContext, sActionName) || this._isActionOverloadOnDifferentType(sActionName, sAnnotationTargetEntityType),
        oParams = {
          contexts: !bStaticAction ? "${internal>selectedContexts}" : null,
          bStaticAction: bStaticAction ? bStaticAction : undefined,
          entitySetName: CommonHelper.addSingleQuotes(sEntitySetName),
          applicableContext: !bStaticAction ? "${internal>dynamicActions/" + oDataField.Action + "/aApplicable/}" : null,
          notApplicableContext: !bStaticAction ? "${internal>dynamicActions/" + oDataField.Action + "/aNotApplicable/}" : null,
          isNavigable: bIsNavigable,
          enableAutoScroll: bEnableAutoScroll,
          defaultValuesExtensionFunction: sDefaultValuesExtensionFunction ? "'" + sDefaultValuesExtensionFunction + "'" : undefined
        };
      return ActionHelper.getPressEventDataFieldForActionButton(oThis.id, oDataField, oParams, sOperationAvailableMap);
    },
    /**
     * Method to determine the binding expression for 'enabled' property of DataFieldForAction and DataFieldForIBN actions.
     *
     * @function
     * @name isDataFieldForActionEnabled
     * @param oThis The instance of the table control
     * @param oDataField The value of the data field
     * @param oRequiresContext RequiresContext for IBN
     * @param bIsDataFieldForIBN Flag for IBN
     * @param oActionContext The instance of the action
     * @param vActionEnabled Status of action (single or multiselect)
     * @returns A binding expression to define the 'enabled' property of the action
     */
    isDataFieldForActionEnabled: function (oThis, oDataField, oRequiresContext, bIsDataFieldForIBN, oActionContext, vActionEnabled) {
      const sActionName = oDataField.Action,
        sAnnotationTargetEntityType = oThis && oThis.collection.getObject("$Type"),
        oTableDefinition = oThis && oThis.tableDefinition && oThis.tableDefinition.getObject(),
        bStaticAction = this._isStaticAction(oActionContext, sActionName),
        isAnalyticalTable = oTableDefinition && oTableDefinition.enableAnalytics;

      // Check for action overload on a different Entity type.
      // If yes, table row selection is not required to enable this action.
      if (!bIsDataFieldForIBN && this._isActionOverloadOnDifferentType(sActionName, sAnnotationTargetEntityType)) {
        // Action overload defined on different entity type
        const oOperationAvailableMap = oTableDefinition && JSON.parse(oTableDefinition.operationAvailableMap);
        if (oOperationAvailableMap && oOperationAvailableMap.hasOwnProperty(sActionName)) {
          // Core.OperationAvailable annotation defined for the action.
          // Need to refer to internal model for enabled property of the dynamic action.
          // return compileBinding(bindingExpression("dynamicActions/" + sActionName + "/bEnabled", "internal"), true);
          return "{= ${internal>dynamicActions/" + sActionName + "/bEnabled} }";
        }
        // Consider the action just like any other static DataFieldForAction.
        return true;
      }
      if (!oRequiresContext || bStaticAction) {
        if (bIsDataFieldForIBN) {
          const sEntitySet = oThis.collection.getPath();
          const oMetaModel = oThis.collection.getModel();
          if (vActionEnabled === "false" && !isAnalyticalTable) {
            Log.warning("NavigationAvailable as false is incorrect usage");
            return false;
          } else if (!isAnalyticalTable && oDataField && oDataField.NavigationAvailable && oDataField.NavigationAvailable.$Path && oMetaModel.getObject(sEntitySet + "/$Partner") === oDataField.NavigationAvailable.$Path.split("/")[0]) {
            return "{= ${" + vActionEnabled.substr(vActionEnabled.indexOf("/") + 1, vActionEnabled.length) + "}";
          } else {
            return true;
          }
        }
        return true;
      }
      let sDataFieldForActionEnabledExpression = "",
        sNumberOfSelectedContexts,
        sAction;
      if (bIsDataFieldForIBN) {
        if (vActionEnabled === "true" || isAnalyticalTable) {
          sDataFieldForActionEnabledExpression = "%{internal>numberOfSelectedContexts} >= 1";
        } else if (vActionEnabled === "false") {
          Log.warning("NavigationAvailable as false is incorrect usage");
          return false;
        } else {
          sNumberOfSelectedContexts = "%{internal>numberOfSelectedContexts} >= 1";
          sAction = "${internal>ibn/" + oDataField.SemanticObject + "-" + oDataField.Action + "/bEnabled" + "}";
          sDataFieldForActionEnabledExpression = sNumberOfSelectedContexts + " && " + sAction;
        }
      } else {
        sNumberOfSelectedContexts = ActionHelper.getNumberOfContextsExpression(vActionEnabled);
        sAction = "${internal>dynamicActions/" + oDataField.Action + "/bEnabled" + "}";
        sDataFieldForActionEnabledExpression = sNumberOfSelectedContexts + " && " + sAction;
      }
      return "{= " + sDataFieldForActionEnabledExpression + "}";
    },
    /**
     * Method to get press event expression for CreateButton.
     *
     * @function
     * @name pressEventForCreateButton
     * @param oThis Current Object
     * @param bCmdExecutionFlag Flag to indicate that the function is called from CMD Execution
     * @returns The binding expression for the press event of the create button
     */
    pressEventForCreateButton: function (oThis, bCmdExecutionFlag) {
      const sCreationMode = oThis.creationMode;
      let oParams;
      const sMdcTable = bCmdExecutionFlag ? "${$source>}.getParent()" : "${$source>}.getParent().getParent().getParent()";
      let sRowBinding = sMdcTable + ".getRowBinding() || " + sMdcTable + ".data('rowsBindingInfo').path";
      switch (sCreationMode) {
        case CreationMode.External:
          // navigate to external target for creating new entries
          // TODO: Add required parameters
          oParams = {
            creationMode: CommonHelper.addSingleQuotes(CreationMode.External),
            outbound: CommonHelper.addSingleQuotes(oThis.createOutbound)
          };
          break;
        case CreationMode.CreationRow:
          oParams = {
            creationMode: CommonHelper.addSingleQuotes(CreationMode.CreationRow),
            creationRow: "${$source>}",
            createAtEnd: oThis.createAtEnd !== undefined ? oThis.createAtEnd : false
          };
          sRowBinding = "${$source>}.getParent()._getRowBinding()";
          break;
        case CreationMode.NewPage:
        case CreationMode.Inline:
          oParams = {
            creationMode: CommonHelper.addSingleQuotes(sCreationMode),
            createAtEnd: oThis.createAtEnd !== undefined ? oThis.createAtEnd : false,
            tableId: CommonHelper.addSingleQuotes(oThis.id)
          };
          if (oThis.createNewAction) {
            oParams.newAction = CommonHelper.addSingleQuotes(oThis.createNewAction);
          }
          break;
        case CreationMode.InlineCreationRows:
          return CommonHelper.generateFunction("._editFlow.createEmptyRowsAndFocus", sMdcTable);
        default:
          // unsupported
          return undefined;
      }
      return CommonHelper.generateFunction(".editFlow.createDocument", sRowBinding, CommonHelper.objectToString(oParams));
    },
    getIBNData: function (oThis) {
      const outboundDetail = oThis.createOutboundDetail;
      if (outboundDetail) {
        const oIBNData = {
          semanticObject: CommonHelper.addSingleQuotes(outboundDetail.semanticObject),
          action: CommonHelper.addSingleQuotes(outboundDetail.action)
        };
        return CommonHelper.objectToString(oIBNData);
      }
    },
    _getExpressionForDeleteButton: function (value, fullContextPath) {
      if (typeof value === "string") {
        return CommonHelper.addSingleQuotes(value, true);
      } else {
        const expression = getExpressionFromAnnotation(value);
        if (isConstant(expression) || isPathInModelExpression(expression)) {
          const valueExpression = formatValueRecursively(expression, fullContextPath);
          return compileExpression(valueExpression);
        }
      }
    },
    /**
     * Method to get press event expression for 'Delete' button.
     *
     * @function
     * @name pressEventForDeleteButton
     * @param oThis Current Object
     * @param sEntitySetName EntitySet name
     * @param oHeaderInfo Header Info
     * @param fullcontextPath Context Path
     * @returns The binding expression for the press event of the 'Delete' button
     */
    pressEventForDeleteButton: function (oThis, sEntitySetName, oHeaderInfo, fullcontextPath) {
      const sDeletableContexts = "${internal>deletableContexts}";
      let sTitleExpression, sDescriptionExpression;
      if (oHeaderInfo !== null && oHeaderInfo !== void 0 && oHeaderInfo.Title) {
        sTitleExpression = this._getExpressionForDeleteButton(oHeaderInfo.Title.Value, fullcontextPath);
      }
      if (oHeaderInfo !== null && oHeaderInfo !== void 0 && oHeaderInfo.Description) {
        sDescriptionExpression = this._getExpressionForDeleteButton(oHeaderInfo.Description.Value, fullcontextPath);
      }
      const oParams = {
        id: CommonHelper.addSingleQuotes(oThis.id),
        entitySetName: CommonHelper.addSingleQuotes(sEntitySetName),
        numberOfSelectedContexts: "${internal>selectedContexts}.length",
        unSavedContexts: "${internal>unSavedContexts}",
        lockedContexts: "${internal>lockedContexts}",
        createModeContexts: "${internal>createModeContexts}",
        draftsWithDeletableActive: "${internal>draftsWithDeletableActive}",
        draftsWithNonDeletableActive: "${internal>draftsWithNonDeletableActive}",
        controlId: "${internal>controlId}",
        title: sTitleExpression,
        description: sDescriptionExpression,
        selectedContexts: "${internal>selectedContexts}"
      };
      return CommonHelper.generateFunction(".editFlow.deleteMultipleDocuments", sDeletableContexts, CommonHelper.objectToString(oParams));
    },
    /**
     * Method to set the visibility of the label for the column header.
     *
     * @function
     * @name setHeaderLabelVisibility
     * @param datafield DataField
     * @param dataFieldCollection List of items inside a fieldgroup (if any)
     * @returns `true` if the header label needs to be visible else false.
     */
    setHeaderLabelVisibility: function (datafield, dataFieldCollection) {
      // If Inline button/navigation action, return false, else true;
      if (!dataFieldCollection) {
        if (datafield.$Type.indexOf("DataFieldForAction") > -1 && datafield.Inline) {
          return false;
        }
        if (datafield.$Type.indexOf("DataFieldForIntentBasedNavigation") > -1 && datafield.Inline) {
          return false;
        }
        return true;
      }

      // In Fieldgroup, If NOT all datafield/datafieldForAnnotation exists with hidden, return true;
      return dataFieldCollection.some(function (oDC) {
        if ((oDC.$Type === "com.sap.vocabularies.UI.v1.DataField" || oDC.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation") && oDC["@com.sap.vocabularies.UI.v1.Hidden"] !== true) {
          return true;
        }
      });
    },
    /**
     * Method to get Text from DataFieldForAnnotation into Column.
     *
     * @function
     * @name getTextOnActionField
     * @param oDataField DataPoint's Value
     * @param oContext Context object of the LineItem
     * @returns String from label referring to action text
     */
    getTextOnActionField: function (oDataField, oContext) {
      if (oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction" || oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation") {
        return oDataField.Label;
      }
      // for FieldGroup containing DataFieldForAnnotation
      if (oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation" && oContext.context.getObject("Target/$AnnotationPath").indexOf("@" + "com.sap.vocabularies.UI.v1.FieldGroup") > -1) {
        const sPathDataFields = "Target/$AnnotationPath/Data/";
        const aMultipleLabels = [];
        for (const i in oContext.context.getObject(sPathDataFields)) {
          if (oContext.context.getObject(`${sPathDataFields + i}/$Type`) === "com.sap.vocabularies.UI.v1.DataFieldForAction" || oContext.context.getObject(`${sPathDataFields + i}/$Type`) === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation") {
            aMultipleLabels.push(oContext.context.getObject(`${sPathDataFields + i}/Label`));
          }
        }
        // In case there are multiple actions inside a Field Group select the largest Action Label
        if (aMultipleLabels.length > 1) {
          return aMultipleLabels.reduce(function (a, b) {
            return a.length > b.length ? a : b;
          });
        } else {
          return aMultipleLabels.length === 0 ? undefined : aMultipleLabels.toString();
        }
      }
      return undefined;
    },
    _getResponsiveTableColumnSettings: function (oThis, oColumn) {
      if (oThis.tableType === "ResponsiveTable") {
        return oColumn.settings;
      }
      return null;
    },
    getChartSize: function (oThis, oColumn) {
      const settings = this._getResponsiveTableColumnSettings(oThis, oColumn);
      if (settings && settings.microChartSize) {
        return settings.microChartSize;
      }
      return "XS";
    },
    getShowOnlyChart: function (oThis, oColumn) {
      const settings = this._getResponsiveTableColumnSettings(oThis, oColumn);
      if (settings && settings.showMicroChartLabel) {
        return !settings.showMicroChartLabel;
      }
      return true;
    },
    getDelegate: function (table, isALP, entityName) {
      let oDelegate;
      if (isALP === "true") {
        // We don't support TreeTable in ALP
        if (table.control.type === "TreeTable") {
          throw new Error("TreeTable not supported in Analytical ListPage");
        }
        oDelegate = {
          name: "sap/fe/macros/table/delegates/ALPTableDelegate",
          payload: {
            collectionName: entityName
          }
        };
      } else if (table.control.type === "TreeTable") {
        oDelegate = {
          name: "sap/fe/macros/table/delegates/TreeTableDelegate",
          payload: {
            hierarchyQualifier: table.control.hierarchyQualifier,
            initialExpansionLevel: table.annotation.initialExpansionLevel
          }
        };
      } else {
        oDelegate = {
          name: "sap/fe/macros/table/delegates/TableDelegate"
        };
      }
      return JSON.stringify(oDelegate);
    },
    setIBNEnablement: function (oInternalModelContext, oNavigationAvailableMap, aSelectedContexts) {
      for (const sKey in oNavigationAvailableMap) {
        oInternalModelContext.setProperty(`ibn/${sKey}`, {
          bEnabled: false,
          aApplicable: [],
          aNotApplicable: []
        });
        const aApplicable = [],
          aNotApplicable = [];
        const sProperty = oNavigationAvailableMap[sKey];
        for (let i = 0; i < aSelectedContexts.length; i++) {
          const oSelectedContext = aSelectedContexts[i];
          if (oSelectedContext.getObject(sProperty)) {
            oInternalModelContext.getModel().setProperty(`${oInternalModelContext.getPath()}/ibn/${sKey}/bEnabled`, true);
            aApplicable.push(oSelectedContext);
          } else {
            aNotApplicable.push(oSelectedContext);
          }
        }
        oInternalModelContext.getModel().setProperty(`${oInternalModelContext.getPath()}/ibn/${sKey}/aApplicable`, aApplicable);
        oInternalModelContext.getModel().setProperty(`${oInternalModelContext.getPath()}/ibn/${sKey}/aNotApplicable`, aNotApplicable);
      }
    }
  };
  TableHelper.getNavigationAvailableMap.requiresIContext = true;
  TableHelper.getTextOnActionField.requiresIContext = true;
  return TableHelper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDcmVhdGlvbk1vZGUiLCJGRUxpYnJhcnkiLCJUYWJsZUhlbHBlciIsIl9pc1N0YXRpY0FjdGlvbiIsIm9BY3Rpb25Db250ZXh0Iiwic0FjdGlvbk5hbWUiLCJvQWN0aW9uIiwiQXJyYXkiLCJpc0FycmF5Iiwic0VudGl0eVR5cGUiLCJfZ2V0QWN0aW9uT3ZlcmxvYWRFbnRpdHlUeXBlIiwiZmluZCIsImFjdGlvbiIsIiRJc0JvdW5kIiwiJFBhcmFtZXRlciIsIiRUeXBlIiwiJGlzQ29sbGVjdGlvbiIsImluZGV4T2YiLCJhUGFydHMiLCJzcGxpdCIsImxlbmd0aCIsInJlcGxhY2VBbGwiLCJ1bmRlZmluZWQiLCJfaXNBY3Rpb25PdmVybG9hZE9uRGlmZmVyZW50VHlwZSIsInNBbm5vdGF0aW9uVGFyZ2V0RW50aXR5VHlwZSIsImdldE1lc3NhZ2VGb3JEcmFmdFZhbGlkYXRpb24iLCJvVGhpcyIsIm9Db2xsZWN0aW9uQW5ub3RhdGlvbnMiLCJjb2xsZWN0aW9uIiwiZ2V0T2JqZWN0Iiwic01lc3NhZ2VQYXRoIiwiJFBhdGgiLCJ0YWJsZURlZmluaXRpb24iLCJnZXRQcm9wZXJ0eSIsIlRlbXBsYXRlVHlwZSIsIk9iamVjdFBhZ2UiLCJPYmplY3QiLCJrZXlzIiwic0tleSIsIm9Bbm5vdGF0aW9uIiwiU291cmNlUHJvcGVydGllcyIsIlNvdXJjZUVudGl0aWVzIiwiVGFyZ2V0UHJvcGVydGllcyIsImdldEZpZWxkc1JlcXVlc3RlZEJ5UHJlc2VudGF0aW9uVmFyaWFudCIsIm9QcmVzZW50YXRpb25WYXJpYW50IiwiUmVxdWVzdEF0TGVhc3QiLCJtYXAiLCJvUmVxdWVzdGVkIiwidmFsdWUiLCJnZXROYXZpZ2F0aW9uQXZhaWxhYmxlRmllbGRzRnJvbUxpbmVJdGVtIiwiYUxpbmVJdGVtQ29udGV4dCIsImFTZWxlY3RlZEZpZWxkc0FycmF5IiwiZm9yRWFjaCIsIm9SZWNvcmQiLCJJbmxpbmUiLCJEZXRlcm1pbmluZyIsIk5hdmlnYXRpb25BdmFpbGFibGUiLCJwdXNoIiwiZ2V0TmF2aWdhdGlvbkF2YWlsYWJsZU1hcCIsImFMaW5lSXRlbUNvbGxlY3Rpb24iLCJvSUJOTmF2aWdhdGlvbkF2YWlsYWJsZU1hcCIsIlNlbWFudGljT2JqZWN0IiwiQWN0aW9uIiwiUmVxdWlyZXNDb250ZXh0IiwiSlNPTiIsInN0cmluZ2lmeSIsImdldFVpTGluZUl0ZW0iLCJvUHJlc2VudGF0aW9uQ29udGV4dCIsImdldFVpQ29udHJvbCIsImNyZWF0ZSRTZWxlY3QiLCJjb2xsZWN0aW9uQ29udGV4dCIsInNlbGVjdGVkRmllbGRzIiwibGluZUl0ZW1Db250ZXh0IiwibWV0YVBhdGgiLCJ0YXJnZXRDb2xsZWN0aW9uUGF0aCIsIkNvbW1vbkhlbHBlciIsImdldFRhcmdldENvbGxlY3Rpb24iLCJwdXNoRmllbGQiLCJmaWVsZCIsImluY2x1ZGVzIiwicHVzaEZpZWxkTGlzdCIsImZpZWxkcyIsImNvbHVtbnMiLCJwcm9wZXJ0aWVzRnJvbUN1c3RvbUNvbHVtbnMiLCJnZXRQcm9wZXJ0aWVzRnJvbUN1c3RvbUNvbHVtbnMiLCJnZXRQYXRoIiwicHJlc2VudGF0aW9uQW5ub3RhdGlvbiIsImdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyIsInRhcmdldE9iamVjdCIsIm9wZXJhdGlvbkF2YWlsYWJsZVByb3BlcnRpZXMiLCJhcHBsaWNhYmxlUHJvcGVydGllcyIsIl9maWx0ZXJOb25BcHBsaWNhYmxlUHJvcGVydGllcyIsInNlbWFudGljS2V5cyIsInNlbWFudGljS2V5IiwiJFByb3BlcnR5UGF0aCIsIkRlbGV0YWJsZSIsIlVwZGF0YWJsZSIsImpvaW4iLCJnZXRDb2x1bW5XaWR0aCIsImNvbHVtbiIsImRhdGFGaWVsZCIsImRhdGFGaWVsZEFjdGlvblRleHQiLCJkYXRhTW9kZWxPYmplY3RQYXRoIiwidXNlUmVtVW5pdCIsIm1pY3JvQ2hhcnRUaXRsZSIsIndpZHRoIiwiZW5hYmxlQXV0b0NvbHVtbldpZHRoIiwiZ2V0Q29sdW1uV2lkdGhGb3JJbWFnZSIsImdldENvbHVtbldpZHRoRm9yRGF0YUZpZWxkIiwiY29tcGlsZUV4cHJlc3Npb24iLCJmb3JtYXRSZXN1bHQiLCJwYXRoSW5Nb2RlbCIsIm5hbWUiLCJUYWJsZUZvcm1hdHRlciIsImFubm90YXRpb25zIiwiVmFsdWUiLCIkdGFyZ2V0IiwiZGF0YVR5cGUiLCJ0eXBlIiwiZ2V0RWRpdE1vZGUiLCJFZGl0TW9kZSIsIkRpc3BsYXkiLCJoYXNUZXh0QW5ub3RhdGlvbiIsImhhc1RleHQiLCJDb3JlIiwiTWVkaWFUeXBlIiwiaXNJbWFnZVVSTCIsIm9NaWNyb0NoYXJ0VGl0bGUiLCJUYXJnZXQiLCIkQW5ub3RhdGlvblBhdGgiLCJuVG1wVGV4dFdpZHRoIiwiVGFibGVTaXplSGVscGVyIiwiZ2V0QnV0dG9uV2lkdGgiLCJMYWJlbCIsInRvU3RyaW5nIiwiblRtcFZpc3VhbGl6YXRpb25XaWR0aCIsImdldFdpZHRoRm9yRGF0YUZpZWxkRm9yQW5ub3RhdGlvbiIsInByb3BlcnR5V2lkdGgiLCJnZXRDb2x1bW5XaWR0aEZvckNoYXJ0IiwiY29sdW1uTGFiZWxXaWR0aCIsImNoYXJ0U2l6ZSIsImdldENoYXJ0U2l6ZSIsImdldFNob3dPbmx5Q2hhcnQiLCJUaXRsZSIsIkRlc2NyaXB0aW9uIiwidG1wVGV4dCIsInRpdGxlU2l6ZSIsInRtcFdpZHRoIiwiZ2V0TWFyZ2luQ2xhc3MiLCJvQ29sbGVjdGlvbiIsIm9EYXRhRmllbGQiLCJzVmlzdWFsaXphdGlvbiIsInNGaWVsZEdyb3VwSGlkZGVuRXhwcmVzc2lvbnMiLCJzQmluZGluZ0V4cHJlc3Npb24iLCJzQ2xhc3MiLCJzSGlkZGVuRXhwcmVzc2lvblJlc3VsdCIsInN1YnN0cmluZyIsImxhc3RJbmRleE9mIiwiZ2V0VkJveFZpc2liaWxpdHkiLCJmaWVsZEdyb3VwSGlkZGVuRXhwcmVzc2lvbnMiLCJmaWVsZEdyb3VwIiwiYWxsU3RhdGljIiwiaGlkZGVuUGF0aHMiLCJoaWRkZW5Bbm5vdGF0aW9uVmFsdWUiLCJoYXNBbnlQYXRoRXhwcmVzc2lvbnMiLCJjb25zdGFudCIsImhhc0FsbEhpZGRlblN0YXRpY0V4cHJlc3Npb25zIiwiaWZFbHNlIiwiZm9ybWF0SGlkZGVuRmlsdGVycyIsIm9IaWRkZW5GaWx0ZXIiLCJleCIsImdldEVsZW1lbnRTdGFibGVJZCIsInRhYmxlSWQiLCJlbGVtZW50SWQiLCJkYXRhRmllbGRQYXJ0IiwicGF0aCIsImdlbmVyYXRlIiwiZ2V0Q29sdW1uU3RhYmxlSWQiLCJpZCIsImdldEZpZWxkR3JvdXBMYWJlbFN0YWJsZUlkIiwiYVByb3BlcnR5UGF0aHMiLCJvQ29sbGVjdGlvbkNvbnRleHQiLCJmaWx0ZXIiLCJzUHJvcGVydHlQYXRoIiwicHJvcGVydGllcyIsInByb3BlcnR5IiwiZ2V0Um93c0JpbmRpbmdJbmZvIiwiZGF0YU1vZGVsUGF0aCIsImNvbnRleHRQYXRoIiwiZ2V0Q29udGV4dFJlbGF0aXZlVGFyZ2V0T2JqZWN0UGF0aCIsImdldFRhcmdldE9iamVjdFBhdGgiLCJvUm93QmluZGluZyIsInVpNW9iamVjdCIsInN1c3BlbmRlZCIsImFkZFNpbmdsZVF1b3RlcyIsInBhcmFtZXRlcnMiLCIkY291bnQiLCJldmVudHMiLCJzU2VsZWN0IiwiJHNlbGVjdCIsIiQkZ2V0S2VlcEFsaXZlQ29udGV4dCIsIiQkZ3JvdXBJZCIsIiQkdXBkYXRlR3JvdXBJZCIsIiQkb3duUmVxdWVzdCIsIiQkcGF0Y2hXaXRob3V0U2lkZUVmZmVjdHMiLCJwYXRjaFNlbnQiLCJkYXRhUmVjZWl2ZWQiLCJkYXRhUmVxdWVzdGVkIiwiY3JlYXRlQWN0aXZhdGUiLCJvbkNvbnRleHRDaGFuZ2UiLCJjaGFuZ2UiLCJvYmplY3RUb1N0cmluZyIsInZhbGlkYXRlQ3JlYXRpb25Sb3dGaWVsZHMiLCJvRmllbGRWYWxpZGl0eU9iamVjdCIsImV2ZXJ5Iiwia2V5IiwicHJlc3NFdmVudERhdGFGaWVsZEZvckFjdGlvbkJ1dHRvbiIsInNFbnRpdHlTZXROYW1lIiwic09wZXJhdGlvbkF2YWlsYWJsZU1hcCIsImJJc05hdmlnYWJsZSIsImJFbmFibGVBdXRvU2Nyb2xsIiwic0RlZmF1bHRWYWx1ZXNFeHRlbnNpb25GdW5jdGlvbiIsImJTdGF0aWNBY3Rpb24iLCJvUGFyYW1zIiwiY29udGV4dHMiLCJlbnRpdHlTZXROYW1lIiwiYXBwbGljYWJsZUNvbnRleHQiLCJub3RBcHBsaWNhYmxlQ29udGV4dCIsImlzTmF2aWdhYmxlIiwiZW5hYmxlQXV0b1Njcm9sbCIsImRlZmF1bHRWYWx1ZXNFeHRlbnNpb25GdW5jdGlvbiIsIkFjdGlvbkhlbHBlciIsImdldFByZXNzRXZlbnREYXRhRmllbGRGb3JBY3Rpb25CdXR0b24iLCJpc0RhdGFGaWVsZEZvckFjdGlvbkVuYWJsZWQiLCJvUmVxdWlyZXNDb250ZXh0IiwiYklzRGF0YUZpZWxkRm9ySUJOIiwidkFjdGlvbkVuYWJsZWQiLCJvVGFibGVEZWZpbml0aW9uIiwiaXNBbmFseXRpY2FsVGFibGUiLCJlbmFibGVBbmFseXRpY3MiLCJvT3BlcmF0aW9uQXZhaWxhYmxlTWFwIiwicGFyc2UiLCJvcGVyYXRpb25BdmFpbGFibGVNYXAiLCJoYXNPd25Qcm9wZXJ0eSIsInNFbnRpdHlTZXQiLCJvTWV0YU1vZGVsIiwiZ2V0TW9kZWwiLCJMb2ciLCJ3YXJuaW5nIiwic3Vic3RyIiwic0RhdGFGaWVsZEZvckFjdGlvbkVuYWJsZWRFeHByZXNzaW9uIiwic051bWJlck9mU2VsZWN0ZWRDb250ZXh0cyIsInNBY3Rpb24iLCJnZXROdW1iZXJPZkNvbnRleHRzRXhwcmVzc2lvbiIsInByZXNzRXZlbnRGb3JDcmVhdGVCdXR0b24iLCJiQ21kRXhlY3V0aW9uRmxhZyIsInNDcmVhdGlvbk1vZGUiLCJjcmVhdGlvbk1vZGUiLCJzTWRjVGFibGUiLCJzUm93QmluZGluZyIsIkV4dGVybmFsIiwib3V0Ym91bmQiLCJjcmVhdGVPdXRib3VuZCIsIkNyZWF0aW9uUm93IiwiY3JlYXRpb25Sb3ciLCJjcmVhdGVBdEVuZCIsIk5ld1BhZ2UiLCJjcmVhdGVOZXdBY3Rpb24iLCJuZXdBY3Rpb24iLCJJbmxpbmVDcmVhdGlvblJvd3MiLCJnZW5lcmF0ZUZ1bmN0aW9uIiwiZ2V0SUJORGF0YSIsIm91dGJvdW5kRGV0YWlsIiwiY3JlYXRlT3V0Ym91bmREZXRhaWwiLCJvSUJORGF0YSIsInNlbWFudGljT2JqZWN0IiwiX2dldEV4cHJlc3Npb25Gb3JEZWxldGVCdXR0b24iLCJmdWxsQ29udGV4dFBhdGgiLCJleHByZXNzaW9uIiwiZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uIiwiaXNDb25zdGFudCIsImlzUGF0aEluTW9kZWxFeHByZXNzaW9uIiwidmFsdWVFeHByZXNzaW9uIiwiZm9ybWF0VmFsdWVSZWN1cnNpdmVseSIsInByZXNzRXZlbnRGb3JEZWxldGVCdXR0b24iLCJvSGVhZGVySW5mbyIsImZ1bGxjb250ZXh0UGF0aCIsInNEZWxldGFibGVDb250ZXh0cyIsInNUaXRsZUV4cHJlc3Npb24iLCJzRGVzY3JpcHRpb25FeHByZXNzaW9uIiwibnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzIiwidW5TYXZlZENvbnRleHRzIiwibG9ja2VkQ29udGV4dHMiLCJjcmVhdGVNb2RlQ29udGV4dHMiLCJkcmFmdHNXaXRoRGVsZXRhYmxlQWN0aXZlIiwiZHJhZnRzV2l0aE5vbkRlbGV0YWJsZUFjdGl2ZSIsImNvbnRyb2xJZCIsInRpdGxlIiwiZGVzY3JpcHRpb24iLCJzZWxlY3RlZENvbnRleHRzIiwic2V0SGVhZGVyTGFiZWxWaXNpYmlsaXR5IiwiZGF0YWZpZWxkIiwiZGF0YUZpZWxkQ29sbGVjdGlvbiIsInNvbWUiLCJvREMiLCJnZXRUZXh0T25BY3Rpb25GaWVsZCIsIm9Db250ZXh0IiwiY29udGV4dCIsInNQYXRoRGF0YUZpZWxkcyIsImFNdWx0aXBsZUxhYmVscyIsImkiLCJyZWR1Y2UiLCJhIiwiYiIsIl9nZXRSZXNwb25zaXZlVGFibGVDb2x1bW5TZXR0aW5ncyIsIm9Db2x1bW4iLCJ0YWJsZVR5cGUiLCJzZXR0aW5ncyIsIm1pY3JvQ2hhcnRTaXplIiwic2hvd01pY3JvQ2hhcnRMYWJlbCIsImdldERlbGVnYXRlIiwidGFibGUiLCJpc0FMUCIsImVudGl0eU5hbWUiLCJvRGVsZWdhdGUiLCJjb250cm9sIiwiRXJyb3IiLCJwYXlsb2FkIiwiY29sbGVjdGlvbk5hbWUiLCJoaWVyYXJjaHlRdWFsaWZpZXIiLCJpbml0aWFsRXhwYW5zaW9uTGV2ZWwiLCJhbm5vdGF0aW9uIiwic2V0SUJORW5hYmxlbWVudCIsIm9JbnRlcm5hbE1vZGVsQ29udGV4dCIsIm9OYXZpZ2F0aW9uQXZhaWxhYmxlTWFwIiwiYVNlbGVjdGVkQ29udGV4dHMiLCJzZXRQcm9wZXJ0eSIsImJFbmFibGVkIiwiYUFwcGxpY2FibGUiLCJhTm90QXBwbGljYWJsZSIsInNQcm9wZXJ0eSIsIm9TZWxlY3RlZENvbnRleHQiLCJyZXF1aXJlc0lDb250ZXh0Il0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJUYWJsZUhlbHBlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21tb25Bbm5vdGF0aW9uVHlwZXMgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL0NvbW1vblwiO1xuaW1wb3J0IHtcblx0RGF0YUZpZWxkLFxuXHREYXRhRmllbGRBYnN0cmFjdFR5cGVzLFxuXHREYXRhRmllbGRGb3JBY3Rpb24sXG5cdERhdGFGaWVsZEZvckFubm90YXRpb24sXG5cdERhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbixcblx0RmllbGRHcm91cCxcblx0UHJlc2VudGF0aW9uVmFyaWFudFR5cGUsXG5cdFVJQW5ub3RhdGlvblRlcm1zLFxuXHRVSUFubm90YXRpb25UeXBlc1xufSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1VJXCI7XG5pbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCB7IGdldFVpQ29udHJvbCB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0NvbW1vbi9EYXRhVmlzdWFsaXphdGlvblwiO1xuaW1wb3J0IHsgQW5ub3RhdGlvblRhYmxlQ29sdW1uLCBUYWJsZUNvbHVtbiwgVGFibGVWaXN1YWxpemF0aW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvQ29tbW9uL1RhYmxlXCI7XG5pbXBvcnQgeyBUZW1wbGF0ZVR5cGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9NYW5pZmVzdFNldHRpbmdzXCI7XG5pbXBvcnQgeyBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9NZXRhTW9kZWxDb252ZXJ0ZXJcIjtcbmltcG9ydCBUYWJsZUZvcm1hdHRlciBmcm9tIFwic2FwL2ZlL2NvcmUvZm9ybWF0dGVycy9UYWJsZUZvcm1hdHRlclwiO1xuaW1wb3J0IHtcblx0Q29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24sXG5cdGNvbXBpbGVFeHByZXNzaW9uLFxuXHRjb25zdGFudCxcblx0Zm9ybWF0UmVzdWx0LFxuXHRnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24sXG5cdGlmRWxzZSxcblx0aXNDb25zdGFudCxcblx0aXNQYXRoSW5Nb2RlbEV4cHJlc3Npb24sXG5cdHBhdGhJbk1vZGVsXG59IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQgeyBnZW5lcmF0ZSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1N0YWJsZUlkSGVscGVyXCI7XG5pbXBvcnQgRkVMaWJyYXJ5IGZyb20gXCJzYXAvZmUvY29yZS9saWJyYXJ5XCI7XG5pbXBvcnQgeyBEYXRhTW9kZWxPYmplY3RQYXRoLCBnZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoLCBnZXRUYXJnZXRPYmplY3RQYXRoIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRGF0YU1vZGVsUGF0aEhlbHBlclwiO1xuaW1wb3J0IHsgaGFzVGV4dCwgaXNJbWFnZVVSTCB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL1Byb3BlcnR5SGVscGVyXCI7XG5pbXBvcnQgeyBnZXRFZGl0TW9kZSB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL1VJRm9ybWF0dGVyc1wiO1xuaW1wb3J0IENvbW1vbkhlbHBlciBmcm9tIFwic2FwL2ZlL21hY3Jvcy9Db21tb25IZWxwZXJcIjtcbmltcG9ydCB0eXBlIHsgdGFibGVEZWxlZ2F0ZU1vZGVsIH0gZnJvbSBcInNhcC9mZS9tYWNyb3MvRGVsZWdhdGVVdGlsXCI7XG5pbXBvcnQgeyBmb3JtYXRWYWx1ZVJlY3Vyc2l2ZWx5IH0gZnJvbSBcInNhcC9mZS9tYWNyb3MvZmllbGQvRmllbGRUZW1wbGF0aW5nXCI7XG5pbXBvcnQgQWN0aW9uSGVscGVyIGZyb20gXCJzYXAvZmUvbWFjcm9zL2ludGVybmFsL2hlbHBlcnMvQWN0aW9uSGVscGVyXCI7XG5pbXBvcnQgVGFibGVTaXplSGVscGVyIGZyb20gXCJzYXAvZmUvbWFjcm9zL3RhYmxlL1RhYmxlU2l6ZUhlbHBlclwiO1xuaW1wb3J0IEVkaXRNb2RlIGZyb20gXCJzYXAvdWkvbWRjL2VudW0vRWRpdE1vZGVcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9Db250ZXh0XCI7XG5cbnR5cGUgSGlkZGVuID0geyBcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IaWRkZW5cIjogYm9vbGVhbiB8IHsgJFBhdGg/OiBzdHJpbmcgfSB9O1xuXG5jb25zdCBDcmVhdGlvbk1vZGUgPSBGRUxpYnJhcnkuQ3JlYXRpb25Nb2RlO1xuLyoqXG4gKiBIZWxwZXIgY2xhc3MgdXNlZCBieSB0aGUgY29udHJvbCBsaWJyYXJ5IGZvciBPRGF0YS1zcGVjaWZpYyBoYW5kbGluZyAoT0RhdGEgVjQpXG4gKlxuICogQHByaXZhdGVcbiAqIEBleHBlcmltZW50YWwgVGhpcyBtb2R1bGUgaXMgb25seSBmb3IgaW50ZXJuYWwvZXhwZXJpbWVudGFsIHVzZSFcbiAqL1xuY29uc3QgVGFibGVIZWxwZXIgPSB7XG5cdC8qKlxuXHQgKiBDaGVjayBpZiBhIGdpdmVuIGFjdGlvbiBpcyBzdGF0aWMuXG5cdCAqXG5cdCAqIEBwYXJhbSBvQWN0aW9uQ29udGV4dCBUaGUgaW5zdGFuY2Ugb2YgdGhlIGFjdGlvblxuXHQgKiBAcGFyYW0gc0FjdGlvbk5hbWUgVGhlIG5hbWUgb2YgdGhlIGFjdGlvblxuXHQgKiBAcmV0dXJucyBSZXR1cm5zICd0cnVlJyBpZiBhY3Rpb24gaXMgc3RhdGljLCBlbHNlICdmYWxzZSdcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRfaXNTdGF0aWNBY3Rpb246IGZ1bmN0aW9uIChvQWN0aW9uQ29udGV4dDogb2JqZWN0LCBzQWN0aW9uTmFtZTogc3RyaW5nIHwgU3RyaW5nKSB7XG5cdFx0bGV0IG9BY3Rpb247XG5cdFx0aWYgKG9BY3Rpb25Db250ZXh0KSB7XG5cdFx0XHRpZiAoQXJyYXkuaXNBcnJheShvQWN0aW9uQ29udGV4dCkpIHtcblx0XHRcdFx0Y29uc3Qgc0VudGl0eVR5cGUgPSB0aGlzLl9nZXRBY3Rpb25PdmVybG9hZEVudGl0eVR5cGUoc0FjdGlvbk5hbWUpO1xuXHRcdFx0XHRpZiAoc0VudGl0eVR5cGUpIHtcblx0XHRcdFx0XHRvQWN0aW9uID0gb0FjdGlvbkNvbnRleHQuZmluZChmdW5jdGlvbiAoYWN0aW9uOiBhbnkpIHtcblx0XHRcdFx0XHRcdHJldHVybiBhY3Rpb24uJElzQm91bmQgJiYgYWN0aW9uLiRQYXJhbWV0ZXJbMF0uJFR5cGUgPT09IHNFbnRpdHlUeXBlO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIGlmIHRoaXMgaXMganVzdCBvbmUgLSBPSyB3ZSB0YWtlIGl0LiBJZiBpdCdzIG1vcmUgaXQncyBhY3R1YWxseSBhIHdyb25nIHVzYWdlIGJ5IHRoZSBhcHBcblx0XHRcdFx0XHQvLyBhcyB3ZSB1c2VkIHRoZSBmaXJzdCBvbmUgYWxsIHRoZSB0aW1lIHdlIGtlZXAgaXQgYXMgaXQgaXNcblx0XHRcdFx0XHRvQWN0aW9uID0gb0FjdGlvbkNvbnRleHRbMF07XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG9BY3Rpb24gPSBvQWN0aW9uQ29udGV4dDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gISFvQWN0aW9uICYmIG9BY3Rpb24uJElzQm91bmQgJiYgb0FjdGlvbi4kUGFyYW1ldGVyWzBdLiRpc0NvbGxlY3Rpb247XG5cdH0sXG5cblx0LyoqXG5cdCAqIEdldCB0aGUgZW50aXR5IHR5cGUgb2YgYW4gYWN0aW9uIG92ZXJsb2FkLlxuXHQgKlxuXHQgKiBAcGFyYW0gc0FjdGlvbk5hbWUgVGhlIG5hbWUgb2YgdGhlIGFjdGlvbi5cblx0ICogQHJldHVybnMgVGhlIGVudGl0eSB0eXBlIHVzZWQgaW4gdGhlIGFjdGlvbiBvdmVybG9hZC5cblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9nZXRBY3Rpb25PdmVybG9hZEVudGl0eVR5cGU6IGZ1bmN0aW9uIChzQWN0aW9uTmFtZTogYW55KSB7XG5cdFx0aWYgKHNBY3Rpb25OYW1lICYmIHNBY3Rpb25OYW1lLmluZGV4T2YoXCIoXCIpID4gLTEpIHtcblx0XHRcdGNvbnN0IGFQYXJ0cyA9IHNBY3Rpb25OYW1lLnNwbGl0KFwiKFwiKTtcblx0XHRcdHJldHVybiBhUGFydHNbYVBhcnRzLmxlbmd0aCAtIDFdLnJlcGxhY2VBbGwoXCIpXCIsIFwiXCIpO1xuXHRcdH1cblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDaGVja3Mgd2hldGhlciB0aGUgYWN0aW9uIGlzIG92ZXJsb2FkZWQgb24gYSBkaWZmZXJlbnQgZW50aXR5IHR5cGUuXG5cdCAqXG5cdCAqIEBwYXJhbSBzQWN0aW9uTmFtZSBUaGUgbmFtZSBvZiB0aGUgYWN0aW9uLlxuXHQgKiBAcGFyYW0gc0Fubm90YXRpb25UYXJnZXRFbnRpdHlUeXBlIFRoZSBlbnRpdHkgdHlwZSBvZiB0aGUgYW5ub3RhdGlvbiB0YXJnZXQuXG5cdCAqIEByZXR1cm5zIFJldHVybnMgJ3RydWUnIGlmIHRoZSBhY3Rpb24gaXMgb3ZlcmxvYWRlZCB3aXRoIGEgZGlmZmVyZW50IGVudGl0eSB0eXBlLCBlbHNlICdmYWxzZScuXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfaXNBY3Rpb25PdmVybG9hZE9uRGlmZmVyZW50VHlwZTogZnVuY3Rpb24gKHNBY3Rpb25OYW1lOiBhbnksIHNBbm5vdGF0aW9uVGFyZ2V0RW50aXR5VHlwZTogYW55KSB7XG5cdFx0Y29uc3Qgc0VudGl0eVR5cGUgPSB0aGlzLl9nZXRBY3Rpb25PdmVybG9hZEVudGl0eVR5cGUoc0FjdGlvbk5hbWUpO1xuXHRcdHJldHVybiAhIXNFbnRpdHlUeXBlICYmIHNBbm5vdGF0aW9uVGFyZ2V0RW50aXR5VHlwZSAhPT0gc0VudGl0eVR5cGU7XG5cdH0sXG5cblx0Z2V0TWVzc2FnZUZvckRyYWZ0VmFsaWRhdGlvbjogZnVuY3Rpb24gKG9UaGlzOiBhbnkpOiBzdHJpbmcge1xuXHRcdGNvbnN0IG9Db2xsZWN0aW9uQW5ub3RhdGlvbnMgPSBvVGhpcy5jb2xsZWN0aW9uLmdldE9iamVjdChcIi4vQFwiKTtcblx0XHRjb25zdCBzTWVzc2FnZVBhdGggPSBvQ29sbGVjdGlvbkFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5NZXNzYWdlc1wiXT8uJFBhdGg7XG5cdFx0aWYgKFxuXHRcdFx0c01lc3NhZ2VQYXRoICYmXG5cdFx0XHRvVGhpcy50YWJsZURlZmluaXRpb24/LmdldFByb3BlcnR5KFwiL3RlbXBsYXRlXCIpID09PSBUZW1wbGF0ZVR5cGUuT2JqZWN0UGFnZSAmJlxuXHRcdFx0ISFPYmplY3Qua2V5cyhvQ29sbGVjdGlvbkFubm90YXRpb25zKS5maW5kKChzS2V5KSA9PiB7XG5cdFx0XHRcdGNvbnN0IG9Bbm5vdGF0aW9uID0gb0NvbGxlY3Rpb25Bbm5vdGF0aW9uc1tzS2V5XTtcblx0XHRcdFx0cmV0dXJuIChcblx0XHRcdFx0XHRvQW5ub3RhdGlvbiAmJlxuXHRcdFx0XHRcdG9Bbm5vdGF0aW9uLiRUeXBlID09PSBDb21tb25Bbm5vdGF0aW9uVHlwZXMuU2lkZUVmZmVjdHNUeXBlICYmXG5cdFx0XHRcdFx0IW9Bbm5vdGF0aW9uLlNvdXJjZVByb3BlcnRpZXMgJiZcblx0XHRcdFx0XHQhb0Fubm90YXRpb24uU291cmNlRW50aXRpZXMgJiZcblx0XHRcdFx0XHRvQW5ub3RhdGlvbi5UYXJnZXRQcm9wZXJ0aWVzPy5pbmRleE9mKHNNZXNzYWdlUGF0aCkgPiAtMVxuXHRcdFx0XHQpO1xuXHRcdFx0fSlcblx0XHQpIHtcblx0XHRcdHJldHVybiBzTWVzc2FnZVBhdGg7XG5cdFx0fVxuXHRcdHJldHVybiBcIlwiO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGFuIGFycmF5IG9mIHRoZSBmaWVsZHMgbGlzdGVkIGJ5IHRoZSBwcm9wZXJ0eSBSZXF1ZXN0QXRMZWFzdCBpbiB0aGUgUHJlc2VudGF0aW9uVmFyaWFudCAuXG5cdCAqXG5cdCAqIEBwYXJhbSBvUHJlc2VudGF0aW9uVmFyaWFudCBUaGUgYW5ub3RhdGlvbiByZWxhdGVkIHRvIGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlByZXNlbnRhdGlvblZhcmlhbnQuXG5cdCAqIEByZXR1cm5zIFRoZSBmaWVsZHMuXG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKi9cblx0Z2V0RmllbGRzUmVxdWVzdGVkQnlQcmVzZW50YXRpb25WYXJpYW50OiBmdW5jdGlvbiAob1ByZXNlbnRhdGlvblZhcmlhbnQ6IFByZXNlbnRhdGlvblZhcmlhbnRUeXBlKTogc3RyaW5nW10ge1xuXHRcdHJldHVybiBvUHJlc2VudGF0aW9uVmFyaWFudC5SZXF1ZXN0QXRMZWFzdD8ubWFwKChvUmVxdWVzdGVkKSA9PiBvUmVxdWVzdGVkLnZhbHVlKSB8fCBbXTtcblx0fSxcblx0Z2V0TmF2aWdhdGlvbkF2YWlsYWJsZUZpZWxkc0Zyb21MaW5lSXRlbTogZnVuY3Rpb24gKGFMaW5lSXRlbUNvbnRleHQ6IENvbnRleHQpOiBzdHJpbmdbXSB7XG5cdFx0Y29uc3QgYVNlbGVjdGVkRmllbGRzQXJyYXk6IHN0cmluZ1tdID0gW107XG5cdFx0KChhTGluZUl0ZW1Db250ZXh0LmdldE9iamVjdCgpIGFzIEFycmF5PGFueT4pIHx8IFtdKS5mb3JFYWNoKGZ1bmN0aW9uIChvUmVjb3JkOiBhbnkpIHtcblx0XHRcdGlmIChcblx0XHRcdFx0b1JlY29yZC4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uICYmXG5cdFx0XHRcdCFvUmVjb3JkLklubGluZSAmJlxuXHRcdFx0XHQhb1JlY29yZC5EZXRlcm1pbmluZyAmJlxuXHRcdFx0XHRvUmVjb3JkLk5hdmlnYXRpb25BdmFpbGFibGU/LiRQYXRoXG5cdFx0XHQpIHtcblx0XHRcdFx0YVNlbGVjdGVkRmllbGRzQXJyYXkucHVzaChvUmVjb3JkLk5hdmlnYXRpb25BdmFpbGFibGUuJFBhdGgpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHJldHVybiBhU2VsZWN0ZWRGaWVsZHNBcnJheTtcblx0fSxcblxuXHRnZXROYXZpZ2F0aW9uQXZhaWxhYmxlTWFwOiBmdW5jdGlvbiAoYUxpbmVJdGVtQ29sbGVjdGlvbjogYW55KSB7XG5cdFx0Y29uc3Qgb0lCTk5hdmlnYXRpb25BdmFpbGFibGVNYXA6IGFueSA9IHt9O1xuXHRcdGFMaW5lSXRlbUNvbGxlY3Rpb24uZm9yRWFjaChmdW5jdGlvbiAob1JlY29yZDogYW55KSB7XG5cdFx0XHRjb25zdCBzS2V5ID0gYCR7b1JlY29yZC5TZW1hbnRpY09iamVjdH0tJHtvUmVjb3JkLkFjdGlvbn1gO1xuXHRcdFx0aWYgKG9SZWNvcmQuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbiAmJiAhb1JlY29yZC5JbmxpbmUgJiYgb1JlY29yZC5SZXF1aXJlc0NvbnRleHQpIHtcblx0XHRcdFx0aWYgKG9SZWNvcmQuTmF2aWdhdGlvbkF2YWlsYWJsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0b0lCTk5hdmlnYXRpb25BdmFpbGFibGVNYXBbc0tleV0gPSBvUmVjb3JkLk5hdmlnYXRpb25BdmFpbGFibGUuJFBhdGhcblx0XHRcdFx0XHRcdD8gb1JlY29yZC5OYXZpZ2F0aW9uQXZhaWxhYmxlLiRQYXRoXG5cdFx0XHRcdFx0XHQ6IG9SZWNvcmQuTmF2aWdhdGlvbkF2YWlsYWJsZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHJldHVybiBKU09OLnN0cmluZ2lmeShvSUJOTmF2aWdhdGlvbkF2YWlsYWJsZU1hcCk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFJldHVybiB0aGUgY29udGV4dCBvZiB0aGUgVUkgTGluZSBJdGVtLlxuXHQgKlxuXHQgKiBAcGFyYW0gb1ByZXNlbnRhdGlvbkNvbnRleHQgVGhlIGNvbnRleHQgb2YgdGhlIHByZXNlbnRhdGlvbiAoUHJlc2VudGF0aW9uIHZhcmlhbnQgb3IgVUkuTGluZUl0ZW0pXG5cdCAqIEByZXR1cm5zIFRoZSBjb250ZXh0IG9mIHRoZSBVSSBMaW5lIEl0ZW1cblx0ICovXG5cdGdldFVpTGluZUl0ZW06IGZ1bmN0aW9uIChvUHJlc2VudGF0aW9uQ29udGV4dDogQ29udGV4dCkge1xuXHRcdHJldHVybiBnZXRVaUNvbnRyb2wob1ByZXNlbnRhdGlvbkNvbnRleHQsIFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkxpbmVJdGVtXCIpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGFuZCByZXR1cm5zIGEgc2VsZWN0IHF1ZXJ5IHdpdGggdGhlIHNlbGVjdGVkIGZpZWxkcyBmcm9tIHRoZSBwYXJhbWV0ZXJzIHRoYXQgd2VyZSBwYXNzZWQuXG5cdCAqXG5cdCAqIEBwYXJhbSBvVGhpcyBUaGUgaW5zdGFuY2Ugb2YgdGhlIGlubmVyIG1vZGVsIG9mIHRoZSB0YWJsZSBidWlsZGluZyBibG9ja1xuXHQgKiBAcmV0dXJucyBUaGUgJ3NlbGVjdCcgcXVlcnkgdGhhdCBoYXMgdGhlIHNlbGVjdGVkIGZpZWxkcyBmcm9tIHRoZSBwYXJhbWV0ZXJzIHRoYXQgd2VyZSBwYXNzZWRcblx0ICovXG5cdGNyZWF0ZSRTZWxlY3Q6IGZ1bmN0aW9uIChvVGhpczogYW55KSB7XG5cdFx0Y29uc3QgY29sbGVjdGlvbkNvbnRleHQgPSBvVGhpcy5jb2xsZWN0aW9uO1xuXHRcdGNvbnN0IHNlbGVjdGVkRmllbGRzOiBzdHJpbmdbXSA9IFtdO1xuXHRcdGNvbnN0IGxpbmVJdGVtQ29udGV4dCA9IFRhYmxlSGVscGVyLmdldFVpTGluZUl0ZW0ob1RoaXMubWV0YVBhdGgpO1xuXHRcdGNvbnN0IHRhcmdldENvbGxlY3Rpb25QYXRoID0gQ29tbW9uSGVscGVyLmdldFRhcmdldENvbGxlY3Rpb24oY29sbGVjdGlvbkNvbnRleHQpO1xuXG5cdFx0ZnVuY3Rpb24gcHVzaEZpZWxkKGZpZWxkOiBzdHJpbmcpIHtcblx0XHRcdGlmIChmaWVsZCAmJiAhc2VsZWN0ZWRGaWVsZHMuaW5jbHVkZXMoZmllbGQpICYmIGZpZWxkLmluZGV4T2YoXCIvXCIpICE9PSAwKSB7XG5cdFx0XHRcdC8vIERvIG5vdCBhZGQgc2luZ2xldG9uIHByb3BlcnR5ICh3aXRoIGFic29sdXRlIHBhdGgpIHRvICRzZWxlY3Rcblx0XHRcdFx0c2VsZWN0ZWRGaWVsZHMucHVzaChmaWVsZCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gcHVzaEZpZWxkTGlzdChmaWVsZHM6IHN0cmluZ1tdKSB7XG5cdFx0XHRpZiAoZmllbGRzPy5sZW5ndGgpIHtcblx0XHRcdFx0ZmllbGRzLmZvckVhY2gocHVzaEZpZWxkKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0Y29uc3QgY29sdW1ucyA9IG9UaGlzLnRhYmxlRGVmaW5pdGlvbi5nZXRPYmplY3QoXCJjb2x1bW5zXCIpO1xuXHRcdGNvbnN0IHByb3BlcnRpZXNGcm9tQ3VzdG9tQ29sdW1ucyA9IHRoaXMuZ2V0UHJvcGVydGllc0Zyb21DdXN0b21Db2x1bW5zKGNvbHVtbnMpO1xuXHRcdGlmIChwcm9wZXJ0aWVzRnJvbUN1c3RvbUNvbHVtbnM/Lmxlbmd0aCkge1xuXHRcdFx0cHVzaEZpZWxkTGlzdChwcm9wZXJ0aWVzRnJvbUN1c3RvbUNvbHVtbnMpO1xuXHRcdH1cblxuXHRcdGlmIChsaW5lSXRlbUNvbnRleHQuZ2V0UGF0aCgpLmluZGV4T2YoXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuTGluZUl0ZW1cIikgPiAtMSkge1xuXHRcdFx0Ly8gRG9uJ3QgcHJvY2VzcyBFbnRpdHlUeXBlIHdpdGhvdXQgTGluZUl0ZW1cblx0XHRcdGNvbnN0IHByZXNlbnRhdGlvbkFubm90YXRpb24gPSBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMob1RoaXMubWV0YVBhdGgpLnRhcmdldE9iamVjdDtcblx0XHRcdGNvbnN0IG9wZXJhdGlvbkF2YWlsYWJsZVByb3BlcnRpZXMgPSAob1RoaXMudGFibGVEZWZpbml0aW9uLmdldE9iamVjdChcIm9wZXJhdGlvbkF2YWlsYWJsZVByb3BlcnRpZXNcIikgfHwgXCJcIikuc3BsaXQoXCIsXCIpO1xuXHRcdFx0Y29uc3QgYXBwbGljYWJsZVByb3BlcnRpZXMgPSBUYWJsZUhlbHBlci5fZmlsdGVyTm9uQXBwbGljYWJsZVByb3BlcnRpZXMob3BlcmF0aW9uQXZhaWxhYmxlUHJvcGVydGllcywgY29sbGVjdGlvbkNvbnRleHQpO1xuXHRcdFx0Y29uc3Qgc2VtYW50aWNLZXlzOiBzdHJpbmdbXSA9IChcblx0XHRcdFx0Y29sbGVjdGlvbkNvbnRleHQuZ2V0T2JqZWN0KGAke3RhcmdldENvbGxlY3Rpb25QYXRofS9AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlNlbWFudGljS2V5YCkgfHwgW11cblx0XHRcdCkubWFwKChzZW1hbnRpY0tleTogYW55KSA9PiBzZW1hbnRpY0tleS4kUHJvcGVydHlQYXRoIGFzIHN0cmluZyk7XG5cblx0XHRcdGlmIChwcmVzZW50YXRpb25Bbm5vdGF0aW9uPy4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuUHJlc2VudGF0aW9uVmFyaWFudFR5cGUpIHtcblx0XHRcdFx0cHVzaEZpZWxkTGlzdChUYWJsZUhlbHBlci5nZXRGaWVsZHNSZXF1ZXN0ZWRCeVByZXNlbnRhdGlvblZhcmlhbnQocHJlc2VudGF0aW9uQW5ub3RhdGlvbikpO1xuXHRcdFx0fVxuXG5cdFx0XHRwdXNoRmllbGRMaXN0KFRhYmxlSGVscGVyLmdldE5hdmlnYXRpb25BdmFpbGFibGVGaWVsZHNGcm9tTGluZUl0ZW0obGluZUl0ZW1Db250ZXh0KSk7XG5cdFx0XHRwdXNoRmllbGRMaXN0KGFwcGxpY2FibGVQcm9wZXJ0aWVzKTtcblx0XHRcdHB1c2hGaWVsZExpc3Qoc2VtYW50aWNLZXlzKTtcblx0XHRcdHB1c2hGaWVsZChUYWJsZUhlbHBlci5nZXRNZXNzYWdlRm9yRHJhZnRWYWxpZGF0aW9uKG9UaGlzKSk7XG5cdFx0XHRwdXNoRmllbGQoXG5cdFx0XHRcdGNvbGxlY3Rpb25Db250ZXh0LmdldE9iamVjdChgJHt0YXJnZXRDb2xsZWN0aW9uUGF0aH1AT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5EZWxldGVSZXN0cmljdGlvbnNgKT8uRGVsZXRhYmxlPy4kUGF0aFxuXHRcdFx0KTtcblx0XHRcdHB1c2hGaWVsZChcblx0XHRcdFx0Y29sbGVjdGlvbkNvbnRleHQuZ2V0T2JqZWN0KGAke3RhcmdldENvbGxlY3Rpb25QYXRofUBPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLlVwZGF0ZVJlc3RyaWN0aW9uc2ApPy5VcGRhdGFibGU/LiRQYXRoXG5cdFx0XHQpO1xuXHRcdH1cblx0XHRyZXR1cm4gc2VsZWN0ZWRGaWVsZHMuam9pbihcIixcIik7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ldGhvZCB0byBnZXQgY29sdW1uJ3Mgd2lkdGggaWYgZGVmaW5lZCBmcm9tIG1hbmlmZXN0IG9yIGZyb20gY3VzdG9taXphdGlvbiB2aWEgYW5ub3RhdGlvbnMuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBnZXRDb2x1bW5XaWR0aFxuXHQgKiBAcGFyYW0gb1RoaXMgVGhlIGluc3RhbmNlIG9mIHRoZSBpbm5lciBtb2RlbCBvZiB0aGUgdGFibGUgYnVpbGRpbmcgYmxvY2tcblx0ICogQHBhcmFtIGNvbHVtbiBEZWZpbmVkIHdpZHRoIG9mIHRoZSBjb2x1bW4sIHdoaWNoIGlzIHRha2VuIHdpdGggcHJpb3JpdHkgaWYgbm90IG51bGwsIHVuZGVmaW5lZCBvciBlbXB0eVxuXHQgKiBAcGFyYW0gZGF0YUZpZWxkIERhdGFGaWVsZCBkZWZpbml0aW9uIG9iamVjdFxuXHQgKiBAcGFyYW0gZGF0YUZpZWxkQWN0aW9uVGV4dCBEYXRhRmllbGQncyB0ZXh0IGZyb20gYnV0dG9uXG5cdCAqIEBwYXJhbSBkYXRhTW9kZWxPYmplY3RQYXRoIFRoZSBvYmplY3QgcGF0aCBvZiB0aGUgZGF0YSBtb2RlbFxuXHQgKiBAcGFyYW0gdXNlUmVtVW5pdCBJbmRpY2F0ZXMgaWYgdGhlIHJlbSB1bml0IG11c3QgYmUgY29uY2F0ZW5hdGVkIHdpdGggdGhlIGNvbHVtbiB3aWR0aCByZXN1bHRcblx0ICogQHBhcmFtIG1pY3JvQ2hhcnRUaXRsZSBUaGUgb2JqZWN0IGNvbnRhaW5pbmcgdGl0bGUgYW5kIGRlc2NyaXB0aW9uIG9mIHRoZSBNaWNyb0NoYXJ0XG5cdCAqIEByZXR1cm5zIC0gQ29sdW1uIHdpZHRoIGlmIGRlZmluZWQsIG90aGVyd2lzZSB3aWR0aCBpcyBzZXQgdG8gYXV0b1xuXHQgKi9cblx0Z2V0Q29sdW1uV2lkdGg6IGZ1bmN0aW9uIChcblx0XHRvVGhpczogdGFibGVEZWxlZ2F0ZU1vZGVsLFxuXHRcdGNvbHVtbjogQW5ub3RhdGlvblRhYmxlQ29sdW1uLFxuXHRcdGRhdGFGaWVsZDogRGF0YUZpZWxkIHwgRGF0YUZpZWxkRm9yQW5ub3RhdGlvbiB8IERhdGFGaWVsZEZvckFjdGlvbiB8IERhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbixcblx0XHRkYXRhRmllbGRBY3Rpb25UZXh0OiBzdHJpbmcsXG5cdFx0ZGF0YU1vZGVsT2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCxcblx0XHR1c2VSZW1Vbml0OiBib29sZWFuLFxuXHRcdG1pY3JvQ2hhcnRUaXRsZT86IGFueVxuXHQpIHtcblx0XHRpZiAoY29sdW1uLndpZHRoKSB7XG5cdFx0XHRyZXR1cm4gY29sdW1uLndpZHRoO1xuXHRcdH1cblx0XHRpZiAob1RoaXMuZW5hYmxlQXV0b0NvbHVtbldpZHRoID09PSB0cnVlKSB7XG5cdFx0XHRsZXQgd2lkdGg7XG5cdFx0XHR3aWR0aCA9XG5cdFx0XHRcdHRoaXMuZ2V0Q29sdW1uV2lkdGhGb3JJbWFnZShkYXRhTW9kZWxPYmplY3RQYXRoKSB8fFxuXHRcdFx0XHR0aGlzLmdldENvbHVtbldpZHRoRm9yRGF0YUZpZWxkKG9UaGlzLCBjb2x1bW4sIGRhdGFGaWVsZCwgZGF0YUZpZWxkQWN0aW9uVGV4dCwgZGF0YU1vZGVsT2JqZWN0UGF0aCwgbWljcm9DaGFydFRpdGxlKSB8fFxuXHRcdFx0XHR1bmRlZmluZWQ7XG5cdFx0XHRpZiAod2lkdGgpIHtcblx0XHRcdFx0cmV0dXJuIHVzZVJlbVVuaXQgPyBgJHt3aWR0aH1yZW1gIDogd2lkdGg7XG5cdFx0XHR9XG5cdFx0XHR3aWR0aCA9IGNvbXBpbGVFeHByZXNzaW9uKFxuXHRcdFx0XHRmb3JtYXRSZXN1bHQoXG5cdFx0XHRcdFx0W3BhdGhJbk1vZGVsKFwiL2VkaXRNb2RlXCIsIFwidWlcIiksIHBhdGhJbk1vZGVsKFwidGFibGVQcm9wZXJ0aWVzQXZhaWxhYmxlXCIsIFwiaW50ZXJuYWxcIiksIGNvbHVtbi5uYW1lLCB1c2VSZW1Vbml0XSxcblx0XHRcdFx0XHRUYWJsZUZvcm1hdHRlci5nZXRDb2x1bW5XaWR0aFxuXHRcdFx0XHQpXG5cdFx0XHQpO1xuXHRcdFx0cmV0dXJuIHdpZHRoO1xuXHRcdH1cblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gZ2V0IHRoZSB3aWR0aCBvZiB0aGUgY29sdW1uIGNvbnRhaW5pbmcgYW4gaW1hZ2UuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBnZXRDb2x1bW5XaWR0aEZvckltYWdlXG5cdCAqIEBwYXJhbSBkYXRhTW9kZWxPYmplY3RQYXRoIFRoZSBkYXRhIG1vZGVsIG9iamVjdCBwYXRoXG5cdCAqIEByZXR1cm5zIC0gQ29sdW1uIHdpZHRoIGlmIGRlZmluZWQsIG90aGVyd2lzZSBudWxsICh0aGUgd2lkdGggaXMgdHJlYXRlZCBhcyBhIHJlbSB2YWx1ZSlcblx0ICovXG5cdGdldENvbHVtbldpZHRoRm9ySW1hZ2U6IGZ1bmN0aW9uIChkYXRhTW9kZWxPYmplY3RQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoKTogbnVtYmVyIHwgbnVsbCB7XG5cdFx0bGV0IHdpZHRoOiBudW1iZXIgfCBudWxsID0gbnVsbDtcblx0XHRjb25zdCBhbm5vdGF0aW9ucyA9IGRhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0Py5WYWx1ZT8uJHRhcmdldD8uYW5ub3RhdGlvbnM7XG5cdFx0Y29uc3QgZGF0YVR5cGUgPSBkYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdD8uVmFsdWU/LiR0YXJnZXQ/LnR5cGU7XG5cdFx0aWYgKFxuXHRcdFx0ZGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3Q/LlZhbHVlICYmXG5cdFx0XHRnZXRFZGl0TW9kZShcblx0XHRcdFx0ZGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QuVmFsdWU/LiR0YXJnZXQsXG5cdFx0XHRcdGRhdGFNb2RlbE9iamVjdFBhdGgsXG5cdFx0XHRcdGZhbHNlLFxuXHRcdFx0XHRmYWxzZSxcblx0XHRcdFx0ZGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3Rcblx0XHRcdCkgPT09IEVkaXRNb2RlLkRpc3BsYXlcblx0XHQpIHtcblx0XHRcdGNvbnN0IGhhc1RleHRBbm5vdGF0aW9uID0gaGFzVGV4dChkYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdC5WYWx1ZS4kdGFyZ2V0KTtcblx0XHRcdGlmIChkYXRhVHlwZSA9PT0gXCJFZG0uU3RyZWFtXCIgJiYgIWhhc1RleHRBbm5vdGF0aW9uICYmIGFubm90YXRpb25zPy5Db3JlPy5NZWRpYVR5cGU/LmluY2x1ZGVzKFwiaW1hZ2UvXCIpKSB7XG5cdFx0XHRcdHdpZHRoID0gNi4yO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAoXG5cdFx0XHRhbm5vdGF0aW9ucyAmJlxuXHRcdFx0KGlzSW1hZ2VVUkwoZGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3Q/LlZhbHVlPy4kdGFyZ2V0KSB8fCBhbm5vdGF0aW9ucz8uQ29yZT8uTWVkaWFUeXBlPy5pbmNsdWRlcyhcImltYWdlL1wiKSlcblx0XHQpIHtcblx0XHRcdHdpZHRoID0gNi4yO1xuXHRcdH1cblx0XHRyZXR1cm4gd2lkdGg7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ldGhvZCB0byBnZXQgdGhlIHdpZHRoIG9mIHRoZSBjb2x1bW4gY29udGFpbmluZyB0aGUgRGF0YUZpZWxkLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgZ2V0Q29sdW1uV2lkdGhGb3JEYXRhRmllbGRcblx0ICogQHBhcmFtIG9UaGlzIFRoZSBpbnN0YW5jZSBvZiB0aGUgaW5uZXIgbW9kZWwgb2YgdGhlIHRhYmxlIGJ1aWxkaW5nIGJsb2NrXG5cdCAqIEBwYXJhbSBjb2x1bW4gRGVmaW5lZCB3aWR0aCBvZiB0aGUgY29sdW1uLCB3aGljaCBpcyB0YWtlbiB3aXRoIHByaW9yaXR5IGlmIG5vdCBudWxsLCB1bmRlZmluZWQgb3IgZW1wdHlcblx0ICogQHBhcmFtIGRhdGFGaWVsZCBEYXRhIEZpZWxkXG5cdCAqIEBwYXJhbSBkYXRhRmllbGRBY3Rpb25UZXh0IERhdGFGaWVsZCdzIHRleHQgZnJvbSBidXR0b25cblx0ICogQHBhcmFtIGRhdGFNb2RlbE9iamVjdFBhdGggVGhlIGRhdGEgbW9kZWwgb2JqZWN0IHBhdGhcblx0ICogQHBhcmFtIG9NaWNyb0NoYXJ0VGl0bGUgVGhlIG9iamVjdCBjb250YWluaW5nIHRoZSB0aXRsZSBhbmQgZGVzY3JpcHRpb24gb2YgdGhlIE1pY3JvQ2hhcnRcblx0ICogQHJldHVybnMgLSBDb2x1bW4gd2lkdGggaWYgZGVmaW5lZCwgb3RoZXJ3aXNlIG51bGwgKCB0aGUgd2lkdGggaXMgdHJlYXRlZCBhcyBhIHJlbSB2YWx1ZSlcblx0ICovXG5cdGdldENvbHVtbldpZHRoRm9yRGF0YUZpZWxkOiBmdW5jdGlvbiAoXG5cdFx0b1RoaXM6IHRhYmxlRGVsZWdhdGVNb2RlbCxcblx0XHRjb2x1bW46IEFubm90YXRpb25UYWJsZUNvbHVtbixcblx0XHRkYXRhRmllbGQ6IERhdGFGaWVsZCB8IERhdGFGaWVsZEZvckFubm90YXRpb24gfCBEYXRhRmllbGRGb3JBY3Rpb24gfCBEYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb24sXG5cdFx0ZGF0YUZpZWxkQWN0aW9uVGV4dDogc3RyaW5nLFxuXHRcdGRhdGFNb2RlbE9iamVjdFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgsXG5cdFx0b01pY3JvQ2hhcnRUaXRsZT86IGFueVxuXHQpOiBudW1iZXIgfCBudWxsIHtcblx0XHRjb25zdCBhbm5vdGF0aW9ucyA9IGRhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0Py5hbm5vdGF0aW9ucztcblx0XHRjb25zdCBkYXRhVHlwZSA9IGRhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0Py4kVHlwZTtcblx0XHRsZXQgd2lkdGg6IG51bWJlciB8IG51bGwgPSBudWxsO1xuXHRcdGlmIChcblx0XHRcdGRhdGFUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBY3Rpb24gfHxcblx0XHRcdGRhdGFUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb24gfHxcblx0XHRcdChkYXRhVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQW5ub3RhdGlvbiAmJlxuXHRcdFx0XHQoKGRhdGFGaWVsZCBhcyBEYXRhRmllbGRGb3JBbm5vdGF0aW9uKS5UYXJnZXQgYXMgYW55KS4kQW5ub3RhdGlvblBhdGguaW5kZXhPZihgQCR7VUlBbm5vdGF0aW9uVGVybXMuRmllbGRHcm91cH1gKSA9PT0gLTEpXG5cdFx0KSB7XG5cdFx0XHRsZXQgblRtcFRleHRXaWR0aDtcblx0XHRcdG5UbXBUZXh0V2lkdGggPVxuXHRcdFx0XHRUYWJsZVNpemVIZWxwZXIuZ2V0QnV0dG9uV2lkdGgoZGF0YUZpZWxkQWN0aW9uVGV4dCkgfHxcblx0XHRcdFx0VGFibGVTaXplSGVscGVyLmdldEJ1dHRvbldpZHRoKGRhdGFGaWVsZD8uTGFiZWw/LnRvU3RyaW5nKCkpIHx8XG5cdFx0XHRcdFRhYmxlU2l6ZUhlbHBlci5nZXRCdXR0b25XaWR0aChhbm5vdGF0aW9ucz8uTGFiZWwpO1xuXG5cdFx0XHQvLyBnZXQgd2lkdGggZm9yIHJhdGluZyBvciBwcm9ncmVzcyBiYXIgZGF0YWZpZWxkXG5cdFx0XHRjb25zdCBuVG1wVmlzdWFsaXphdGlvbldpZHRoID0gVGFibGVTaXplSGVscGVyLmdldFdpZHRoRm9yRGF0YUZpZWxkRm9yQW5ub3RhdGlvbihcblx0XHRcdFx0ZGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3Rcblx0XHRcdCkucHJvcGVydHlXaWR0aDtcblxuXHRcdFx0aWYgKG5UbXBWaXN1YWxpemF0aW9uV2lkdGggPiBuVG1wVGV4dFdpZHRoKSB7XG5cdFx0XHRcdHdpZHRoID0gblRtcFZpc3VhbGl6YXRpb25XaWR0aDtcblx0XHRcdH0gZWxzZSBpZiAoXG5cdFx0XHRcdGRhdGFGaWVsZEFjdGlvblRleHQgfHxcblx0XHRcdFx0KGFubm90YXRpb25zICYmXG5cdFx0XHRcdFx0KGFubm90YXRpb25zLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb24gfHxcblx0XHRcdFx0XHRcdGFubm90YXRpb25zLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBY3Rpb24pKVxuXHRcdFx0KSB7XG5cdFx0XHRcdC8vIEFkZCBhZGRpdGlvbmFsIDEuOCByZW0gdG8gYXZvaWQgc2hvd2luZyBlbGxpcHNpcyBpbiBzb21lIGNhc2VzLlxuXHRcdFx0XHRuVG1wVGV4dFdpZHRoICs9IDEuODtcblx0XHRcdFx0d2lkdGggPSBuVG1wVGV4dFdpZHRoO1xuXHRcdFx0fVxuXHRcdFx0d2lkdGggPSB3aWR0aCB8fCB0aGlzLmdldENvbHVtbldpZHRoRm9yQ2hhcnQob1RoaXMsIGNvbHVtbiwgZGF0YUZpZWxkLCBuVG1wVGV4dFdpZHRoLCBvTWljcm9DaGFydFRpdGxlKTtcblx0XHR9XG5cdFx0cmV0dXJuIHdpZHRoO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gZ2V0IHRoZSB3aWR0aCBvZiB0aGUgY29sdW1uIGNvbnRhaW5pbmcgdGhlIENoYXJ0LlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgZ2V0Q29sdW1uV2lkdGhGb3JDaGFydFxuXHQgKiBAcGFyYW0gb1RoaXMgVGhlIGluc3RhbmNlIG9mIHRoZSBpbm5lciBtb2RlbCBvZiB0aGUgdGFibGUgYnVpbGRpbmcgYmxvY2tcblx0ICogQHBhcmFtIGNvbHVtbiBEZWZpbmVkIHdpZHRoIG9mIHRoZSBjb2x1bW4sIHdoaWNoIGlzIHRha2VuIHdpdGggcHJpb3JpdHkgaWYgbm90IG51bGwsIHVuZGVmaW5lZCBvciBlbXB0eVxuXHQgKiBAcGFyYW0gZGF0YUZpZWxkIERhdGEgRmllbGRcblx0ICogQHBhcmFtIGNvbHVtbkxhYmVsV2lkdGggVGhlIHdpZHRoIG9mIHRoZSBjb2x1bW4gbGFiZWwgb3IgYnV0dG9uIGxhYmVsXG5cdCAqIEBwYXJhbSBtaWNyb0NoYXJ0VGl0bGUgVGhlIG9iamVjdCBjb250YWluaW5nIHRoZSB0aXRsZSBhbmQgdGhlIGRlc2NyaXB0aW9uIG9mIHRoZSBNaWNyb0NoYXJ0XG5cdCAqIEByZXR1cm5zIC0gQ29sdW1uIHdpZHRoIGlmIGRlZmluZWQsIG90aGVyd2lzZSBudWxsICh0aGUgd2lkdGggaXMgdHJlYXRlZCBhcyBhIHJlbSB2YWx1ZSlcblx0ICovXG5cdGdldENvbHVtbldpZHRoRm9yQ2hhcnQob1RoaXM6IGFueSwgY29sdW1uOiBhbnksIGRhdGFGaWVsZDogYW55LCBjb2x1bW5MYWJlbFdpZHRoOiBudW1iZXIsIG1pY3JvQ2hhcnRUaXRsZTogYW55KTogbnVtYmVyIHwgbnVsbCB7XG5cdFx0bGV0IGNoYXJ0U2l6ZSxcblx0XHRcdHdpZHRoOiBudW1iZXIgfCBudWxsID0gbnVsbDtcblx0XHRpZiAoZGF0YUZpZWxkLlRhcmdldD8uJEFubm90YXRpb25QYXRoPy5pbmRleE9mKFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0XCIpICE9PSAtMSkge1xuXHRcdFx0c3dpdGNoICh0aGlzLmdldENoYXJ0U2l6ZShvVGhpcywgY29sdW1uKSkge1xuXHRcdFx0XHRjYXNlIFwiWFNcIjpcblx0XHRcdFx0XHRjaGFydFNpemUgPSA0LjQ7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgXCJTXCI6XG5cdFx0XHRcdFx0Y2hhcnRTaXplID0gNC42O1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFwiTVwiOlxuXHRcdFx0XHRcdGNoYXJ0U2l6ZSA9IDUuNTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBcIkxcIjpcblx0XHRcdFx0XHRjaGFydFNpemUgPSA2Ljk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0Y2hhcnRTaXplID0gNS4zO1xuXHRcdFx0fVxuXHRcdFx0Y29sdW1uTGFiZWxXaWR0aCArPSAxLjg7XG5cdFx0XHRpZiAoXG5cdFx0XHRcdCF0aGlzLmdldFNob3dPbmx5Q2hhcnQob1RoaXMsIGNvbHVtbikgJiZcblx0XHRcdFx0bWljcm9DaGFydFRpdGxlICYmXG5cdFx0XHRcdChtaWNyb0NoYXJ0VGl0bGUuVGl0bGUubGVuZ3RoIHx8IG1pY3JvQ2hhcnRUaXRsZS5EZXNjcmlwdGlvbi5sZW5ndGgpXG5cdFx0XHQpIHtcblx0XHRcdFx0Y29uc3QgdG1wVGV4dCA9XG5cdFx0XHRcdFx0bWljcm9DaGFydFRpdGxlLlRpdGxlLmxlbmd0aCA+IG1pY3JvQ2hhcnRUaXRsZS5EZXNjcmlwdGlvbi5sZW5ndGggPyBtaWNyb0NoYXJ0VGl0bGUuVGl0bGUgOiBtaWNyb0NoYXJ0VGl0bGUuRGVzY3JpcHRpb247XG5cdFx0XHRcdGNvbnN0IHRpdGxlU2l6ZSA9IFRhYmxlU2l6ZUhlbHBlci5nZXRCdXR0b25XaWR0aCh0bXBUZXh0KSArIDc7XG5cdFx0XHRcdGNvbnN0IHRtcFdpZHRoID0gdGl0bGVTaXplID4gY29sdW1uTGFiZWxXaWR0aCA/IHRpdGxlU2l6ZSA6IGNvbHVtbkxhYmVsV2lkdGg7XG5cdFx0XHRcdHdpZHRoID0gdG1wV2lkdGg7XG5cdFx0XHR9IGVsc2UgaWYgKGNvbHVtbkxhYmVsV2lkdGggPiBjaGFydFNpemUpIHtcblx0XHRcdFx0d2lkdGggPSBjb2x1bW5MYWJlbFdpZHRoO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0d2lkdGggPSBjaGFydFNpemU7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiB3aWR0aDtcblx0fSxcblx0LyoqXG5cdCAqIE1ldGhvZCB0byBhZGQgYSBtYXJnaW4gY2xhc3MgYXQgdGhlIGNvbnRyb2wuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBnZXRNYXJnaW5DbGFzc1xuXHQgKiBAcGFyYW0gb0NvbGxlY3Rpb24gVGl0bGUgb2YgdGhlIERhdGFQb2ludFxuXHQgKiBAcGFyYW0gb0RhdGFGaWVsZCBWYWx1ZSBvZiB0aGUgRGF0YVBvaW50XG5cdCAqIEBwYXJhbSBzVmlzdWFsaXphdGlvblxuXHQgKiBAcGFyYW0gc0ZpZWxkR3JvdXBIaWRkZW5FeHByZXNzaW9ucyBIaWRkZW4gZXhwcmVzc2lvbiBjb250YWluZWQgaW4gRmllbGRHcm91cFxuXHQgKiBAcmV0dXJucyBBZGp1c3RpbmcgdGhlIG1hcmdpblxuXHQgKi9cblx0Z2V0TWFyZ2luQ2xhc3M6IGZ1bmN0aW9uIChvQ29sbGVjdGlvbjogYW55LCBvRGF0YUZpZWxkOiBhbnksIHNWaXN1YWxpemF0aW9uOiBhbnksIHNGaWVsZEdyb3VwSGlkZGVuRXhwcmVzc2lvbnM6IGFueSkge1xuXHRcdGxldCBzQmluZGluZ0V4cHJlc3Npb24sXG5cdFx0XHRzQ2xhc3MgPSBcIlwiO1xuXHRcdGlmIChKU09OLnN0cmluZ2lmeShvQ29sbGVjdGlvbltvQ29sbGVjdGlvbi5sZW5ndGggLSAxXSkgPT0gSlNPTi5zdHJpbmdpZnkob0RhdGFGaWVsZCkpIHtcblx0XHRcdC8vSWYgcmF0aW5nIGluZGljYXRvciBpcyBsYXN0IGVsZW1lbnQgaW4gZmllbGRncm91cCwgdGhlbiB0aGUgMC41cmVtIG1hcmdpbiBhZGRlZCBieSBzYXBNUkkgY2xhc3Mgb2YgaW50ZXJhY3RpdmUgcmF0aW5nIGluZGljYXRvciBvbiB0b3AgYW5kIGJvdHRvbSBtdXN0IGJlIG51bGxpZmllZC5cblx0XHRcdGlmIChzVmlzdWFsaXphdGlvbiA9PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlZpc3VhbGl6YXRpb25UeXBlL1JhdGluZ1wiKSB7XG5cdFx0XHRcdHNDbGFzcyA9IFwic2FwVWlOb01hcmdpbkJvdHRvbSBzYXBVaU5vTWFyZ2luVG9wXCI7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmIChzVmlzdWFsaXphdGlvbiA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5WaXN1YWxpemF0aW9uVHlwZS9SYXRpbmdcIikge1xuXHRcdFx0Ly9JZiByYXRpbmcgaW5kaWNhdG9yIGlzIE5PVCB0aGUgbGFzdCBlbGVtZW50IGluIGZpZWxkZ3JvdXAsIHRoZW4gdG8gbWFpbnRhaW4gdGhlIDAuNXJlbSBzcGFjaW5nIGJldHdlZW4gY29nZXRNYXJnaW5DbGFzc250cm9scyAoYXMgcGVyIFVYIHNwZWMpLFxuXHRcdFx0Ly9vbmx5IHRoZSB0b3AgbWFyZ2luIGFkZGVkIGJ5IHNhcE1SSSBjbGFzcyBvZiBpbnRlcmFjdGl2ZSByYXRpbmcgaW5kaWNhdG9yIG11c3QgYmUgbnVsbGlmaWVkLlxuXG5cdFx0XHRzQ2xhc3MgPSBcInNhcFVpTm9NYXJnaW5Ub3BcIjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0c0NsYXNzID0gXCJzYXBVaVRpbnlNYXJnaW5Cb3R0b21cIjtcblx0XHR9XG5cblx0XHRpZiAoc0ZpZWxkR3JvdXBIaWRkZW5FeHByZXNzaW9ucyAmJiBzRmllbGRHcm91cEhpZGRlbkV4cHJlc3Npb25zICE9PSBcInRydWVcIiAmJiBzRmllbGRHcm91cEhpZGRlbkV4cHJlc3Npb25zICE9PSBcImZhbHNlXCIpIHtcblx0XHRcdGNvbnN0IHNIaWRkZW5FeHByZXNzaW9uUmVzdWx0ID0gc0ZpZWxkR3JvdXBIaWRkZW5FeHByZXNzaW9ucy5zdWJzdHJpbmcoXG5cdFx0XHRcdHNGaWVsZEdyb3VwSGlkZGVuRXhwcmVzc2lvbnMuaW5kZXhPZihcIns9XCIpICsgMixcblx0XHRcdFx0c0ZpZWxkR3JvdXBIaWRkZW5FeHByZXNzaW9ucy5sYXN0SW5kZXhPZihcIn1cIilcblx0XHRcdCk7XG5cdFx0XHRzQmluZGluZ0V4cHJlc3Npb24gPSBcIns9IFwiICsgc0hpZGRlbkV4cHJlc3Npb25SZXN1bHQgKyBcIiA/ICdcIiArIHNDbGFzcyArIFwiJyA6IFwiICsgXCInJ1wiICsgXCIgfVwiO1xuXHRcdFx0cmV0dXJuIHNCaW5kaW5nRXhwcmVzc2lvbjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHNDbGFzcztcblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ldGhvZCB0byBnZXQgVkJveCB2aXNpYmlsaXR5LlxuXHQgKlxuXHQgKiBAcGFyYW0gY29sbGVjdGlvbiBDb2xsZWN0aW9uIG9mIGRhdGEgZmllbGRzIGluIFZCb3hcblx0ICogQHBhcmFtIGZpZWxkR3JvdXBIaWRkZW5FeHByZXNzaW9ucyBIaWRkZW4gZXhwcmVzc2lvbiBjb250YWluZWQgaW4gRmllbGRHcm91cFxuXHQgKiBAcGFyYW0gZmllbGRHcm91cCBEYXRhIGZpZWxkIGNvbnRhaW5pbmcgdGhlIFZCb3hcblx0ICogQHJldHVybnMgVmlzaWJpbGl0eSBleHByZXNzaW9uXG5cdCAqL1xuXHRnZXRWQm94VmlzaWJpbGl0eTogZnVuY3Rpb24gKFxuXHRcdGNvbGxlY3Rpb246IEFycmF5PERhdGFGaWVsZEZvckFubm90YXRpb24gJiBIaWRkZW4+LFxuXHRcdGZpZWxkR3JvdXBIaWRkZW5FeHByZXNzaW9uczogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24sXG5cdFx0ZmllbGRHcm91cDogRmllbGRHcm91cCAmIEhpZGRlblxuXHQpOiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB7XG5cdFx0bGV0IGFsbFN0YXRpYyA9IHRydWU7XG5cdFx0Y29uc3QgaGlkZGVuUGF0aHMgPSBbXTtcblxuXHRcdGlmIChmaWVsZEdyb3VwW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhpZGRlblwiXSkge1xuXHRcdFx0cmV0dXJuIGZpZWxkR3JvdXBIaWRkZW5FeHByZXNzaW9ucztcblx0XHR9XG5cblx0XHRmb3IgKGNvbnN0IGRhdGFGaWVsZCBvZiBjb2xsZWN0aW9uKSB7XG5cdFx0XHRjb25zdCBoaWRkZW5Bbm5vdGF0aW9uVmFsdWUgPSBkYXRhRmllbGRbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuSGlkZGVuXCJdO1xuXHRcdFx0aWYgKGhpZGRlbkFubm90YXRpb25WYWx1ZSA9PT0gdW5kZWZpbmVkIHx8IGhpZGRlbkFubm90YXRpb25WYWx1ZSA9PT0gZmFsc2UpIHtcblx0XHRcdFx0aGlkZGVuUGF0aHMucHVzaChmYWxzZSk7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGhpZGRlbkFubm90YXRpb25WYWx1ZSA9PT0gdHJ1ZSkge1xuXHRcdFx0XHRoaWRkZW5QYXRocy5wdXNoKHRydWUpO1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblx0XHRcdGlmIChoaWRkZW5Bbm5vdGF0aW9uVmFsdWUuJFBhdGgpIHtcblx0XHRcdFx0aGlkZGVuUGF0aHMucHVzaChwYXRoSW5Nb2RlbChoaWRkZW5Bbm5vdGF0aW9uVmFsdWUuJFBhdGgpKTtcblx0XHRcdFx0YWxsU3RhdGljID0gZmFsc2U7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHR5cGVvZiBoaWRkZW5Bbm5vdGF0aW9uVmFsdWUgPT09IFwib2JqZWN0XCIpIHtcblx0XHRcdFx0Ly8gRHluYW1pYyBleHByZXNzaW9uIGZvdW5kIGluIGEgZmllbGRcblx0XHRcdFx0cmV0dXJuIGZpZWxkR3JvdXBIaWRkZW5FeHByZXNzaW9ucztcblx0XHRcdH1cblx0XHR9XG5cblx0XHRjb25zdCBoYXNBbnlQYXRoRXhwcmVzc2lvbnMgPSBjb25zdGFudChoaWRkZW5QYXRocy5sZW5ndGggPiAwICYmIGFsbFN0YXRpYyAhPT0gdHJ1ZSk7XG5cdFx0Y29uc3QgaGFzQWxsSGlkZGVuU3RhdGljRXhwcmVzc2lvbnMgPSBjb25zdGFudChoaWRkZW5QYXRocy5sZW5ndGggPiAwICYmIGhpZGRlblBhdGhzLmluZGV4T2YoZmFsc2UpID09PSAtMSAmJiBhbGxTdGF0aWMpO1xuXG5cdFx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKFxuXHRcdFx0aWZFbHNlKFxuXHRcdFx0XHRoYXNBbnlQYXRoRXhwcmVzc2lvbnMsXG5cdFx0XHRcdGZvcm1hdFJlc3VsdChoaWRkZW5QYXRocywgVGFibGVGb3JtYXR0ZXIuZ2V0VkJveFZpc2liaWxpdHkpLFxuXHRcdFx0XHRpZkVsc2UoaGFzQWxsSGlkZGVuU3RhdGljRXhwcmVzc2lvbnMsIGNvbnN0YW50KGZhbHNlKSwgY29uc3RhbnQodHJ1ZSkpXG5cdFx0XHQpXG5cdFx0KTtcblx0fSxcblxuXHQvKipcblx0ICogTWV0aG9kIHRvIHByb3ZpZGUgaGlkZGVuIGZpbHRlcnMgdG8gdGhlIHRhYmxlLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgZm9ybWF0SGlkZGVuRmlsdGVyc1xuXHQgKiBAcGFyYW0gb0hpZGRlbkZpbHRlciBUaGUgaGlkZGVuRmlsdGVycyB2aWEgY29udGV4dCBuYW1lZCBmaWx0ZXJzIChhbmQga2V5IGhpZGRlbkZpbHRlcnMpIHBhc3NlZCB0byBNYWNybyBUYWJsZVxuXHQgKiBAcmV0dXJucyBUaGUgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBoaWRkZW4gZmlsdGVyc1xuXHQgKi9cblx0Zm9ybWF0SGlkZGVuRmlsdGVyczogZnVuY3Rpb24gKG9IaWRkZW5GaWx0ZXI6IHN0cmluZykge1xuXHRcdGlmIChvSGlkZGVuRmlsdGVyKSB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRyZXR1cm4gSlNPTi5zdHJpbmdpZnkob0hpZGRlbkZpbHRlcik7XG5cdFx0XHR9IGNhdGNoIChleCkge1xuXHRcdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gZ2V0IHRoZSBzdGFibGUgSUQgb2YgYSB0YWJsZSBlbGVtZW50IChjb2x1bW4gb3IgRmllbGRHcm91cCBsYWJlbCkuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBnZXRFbGVtZW50U3RhYmxlSWRcblx0ICogQHBhcmFtIHRhYmxlSWQgQ3VycmVudCBvYmplY3QgSURcblx0ICogQHBhcmFtIGVsZW1lbnRJZCBFbGVtZW50IElkIG9yIHN1ZmZpeFxuXHQgKiBAcGFyYW0gZGF0YU1vZGVsT2JqZWN0UGF0aCBEYXRhTW9kZWxPYmplY3RQYXRoIG9mIHRoZSBkYXRhRmllbGRcblx0ICogQHJldHVybnMgVGhlIHN0YWJsZSBJRCBmb3IgYSBnaXZlbiBjb2x1bW5cblx0ICovXG5cdGdldEVsZW1lbnRTdGFibGVJZDogZnVuY3Rpb24gKHRhYmxlSWQ6IHN0cmluZyB8IHVuZGVmaW5lZCwgZWxlbWVudElkOiBzdHJpbmcsIGRhdGFNb2RlbE9iamVjdFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgpIHtcblx0XHRpZiAoIXRhYmxlSWQpIHtcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXHRcdGNvbnN0IGRhdGFGaWVsZCA9IGRhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0IGFzIERhdGFGaWVsZEFic3RyYWN0VHlwZXM7XG5cdFx0bGV0IGRhdGFGaWVsZFBhcnQ6IHN0cmluZyB8IERhdGFGaWVsZEFic3RyYWN0VHlwZXM7XG5cdFx0c3dpdGNoIChkYXRhRmllbGQuJFR5cGUpIHtcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQW5ub3RhdGlvbjpcblx0XHRcdFx0ZGF0YUZpZWxkUGFydCA9IGRhdGFGaWVsZC5UYXJnZXQudmFsdWU7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb246XG5cdFx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFjdGlvbjpcblx0XHRcdFx0ZGF0YUZpZWxkUGFydCA9IGRhdGFGaWVsZDtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRkYXRhRmllbGRQYXJ0ID0gKGRhdGFGaWVsZCBhcyBEYXRhRmllbGQpLlZhbHVlPy5wYXRoID8/IFwiXCI7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0XHRyZXR1cm4gZ2VuZXJhdGUoW3RhYmxlSWQsIGVsZW1lbnRJZCwgZGF0YUZpZWxkUGFydF0pO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gZ2V0IHRoZSBzdGFibGUgSUQgb2YgdGhlIGNvbHVtbi5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGdldENvbHVtblN0YWJsZUlkXG5cdCAqIEBwYXJhbSBpZCBDdXJyZW50IG9iamVjdCBJRFxuXHQgKiBAcGFyYW0gZGF0YU1vZGVsT2JqZWN0UGF0aCBEYXRhTW9kZWxPYmplY3RQYXRoIG9mIHRoZSBkYXRhRmllbGRcblx0ICogQHJldHVybnMgVGhlIHN0YWJsZSBJRCBmb3IgYSBnaXZlbiBjb2x1bW5cblx0ICovXG5cdGdldENvbHVtblN0YWJsZUlkOiBmdW5jdGlvbiAoaWQ6IHN0cmluZywgZGF0YU1vZGVsT2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCkge1xuXHRcdHJldHVybiBUYWJsZUhlbHBlci5nZXRFbGVtZW50U3RhYmxlSWQoaWQsIFwiQ1wiLCBkYXRhTW9kZWxPYmplY3RQYXRoKTtcblx0fSxcblxuXHRnZXRGaWVsZEdyb3VwTGFiZWxTdGFibGVJZDogZnVuY3Rpb24gKGlkOiBzdHJpbmcsIGRhdGFNb2RlbE9iamVjdFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgpIHtcblx0XHRyZXR1cm4gVGFibGVIZWxwZXIuZ2V0RWxlbWVudFN0YWJsZUlkKGlkLCBcIkZHTGFiZWxcIiwgZGF0YU1vZGVsT2JqZWN0UGF0aCk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ldGhvZCBmaWx0ZXJzIG91dCBwcm9wZXJ0aWVzIHdoaWNoIGRvIG5vdCBiZWxvbmcgdG8gdGhlIGNvbGxlY3Rpb24uXG5cdCAqXG5cdCAqIEBwYXJhbSBhUHJvcGVydHlQYXRocyBUaGUgYXJyYXkgb2YgcHJvcGVydGllcyB0byBiZSBjaGVja2VkLlxuXHQgKiBAcGFyYW0gb0NvbGxlY3Rpb25Db250ZXh0IFRoZSBjb2xsZWN0aW9uIGNvbnRleHQgdG8gYmUgdXNlZC5cblx0ICogQHJldHVybnMgVGhlIGFycmF5IG9mIGFwcGxpY2FibGUgcHJvcGVydGllcy5cblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9maWx0ZXJOb25BcHBsaWNhYmxlUHJvcGVydGllczogZnVuY3Rpb24gKGFQcm9wZXJ0eVBhdGhzOiBhbnlbXSwgb0NvbGxlY3Rpb25Db250ZXh0OiBDb250ZXh0KSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdGFQcm9wZXJ0eVBhdGhzICYmXG5cdFx0XHRhUHJvcGVydHlQYXRocy5maWx0ZXIoZnVuY3Rpb24gKHNQcm9wZXJ0eVBhdGg6IGFueSkge1xuXHRcdFx0XHRyZXR1cm4gb0NvbGxlY3Rpb25Db250ZXh0LmdldE9iamVjdChgLi8ke3NQcm9wZXJ0eVBhdGh9YCk7XG5cdFx0XHR9KVxuXHRcdCk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ldGhvZCB0byByZXRyZWl2ZSB0aGUgbGlzdGVkIHByb3BlcnRpZXMgZnJvbSB0aGUgY3VzdG9tIGNvbHVtbnNcblx0ICpcblx0ICogQHBhcmFtIGNvbHVtbnMgVGhlIHRhYmxlIGNvbHVtbnNcblx0ICogQHJldHVybnMgVGhlIGxpc3Qgb2YgYXZhaWxhYmxlIHByb3BlcnRpZXMgZnJvbSB0aGUgY3VzdG9tIGNvbHVtbnNcblx0ICogQHByaXZhdGVcblx0ICovXG5cblx0Z2V0UHJvcGVydGllc0Zyb21DdXN0b21Db2x1bW5zOiBmdW5jdGlvbiAoY29sdW1uczogVGFibGVDb2x1bW5bXSkge1xuXHRcdC8vIEFkZCBwcm9wZXJ0aWVzIGZyb20gdGhlIGN1c3RvbSBjb2x1bW5zLCB0aGlzIGlzIHJlcXVpcmVkIGZvciB0aGUgZXhwb3J0IG9mIGFsbCB0aGUgcHJvcGVydGllcyBsaXN0ZWQgb24gYSBjdXN0b20gY29sdW1uXG5cdFx0aWYgKCFjb2x1bW5zPy5sZW5ndGgpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Y29uc3QgcHJvcGVydGllc0Zyb21DdXN0b21Db2x1bW5zOiBzdHJpbmdbXSA9IFtdO1xuXHRcdGZvciAoY29uc3QgY29sdW1uIG9mIGNvbHVtbnMpIHtcblx0XHRcdGlmIChcInByb3BlcnRpZXNcIiBpbiBjb2x1bW4gJiYgY29sdW1uLnByb3BlcnRpZXM/Lmxlbmd0aCkge1xuXHRcdFx0XHRmb3IgKGNvbnN0IHByb3BlcnR5IG9mIGNvbHVtbi5wcm9wZXJ0aWVzKSB7XG5cdFx0XHRcdFx0aWYgKHByb3BlcnRpZXNGcm9tQ3VzdG9tQ29sdW1ucy5pbmRleE9mKHByb3BlcnR5KSA9PT0gLTEpIHtcblx0XHRcdFx0XHRcdC8vIG9ubHkgYWRkIHByb3BlcnR5IGlmIGl0IGRvZXNuJ3QgZXhpc3Rcblx0XHRcdFx0XHRcdHByb3BlcnRpZXNGcm9tQ3VzdG9tQ29sdW1ucy5wdXNoKHByb3BlcnR5KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHByb3BlcnRpZXNGcm9tQ3VzdG9tQ29sdW1ucztcblx0fSxcblx0LyoqXG5cdCAqIE1ldGhvZCB0byBnZW5lcmF0ZSB0aGUgYmluZGluZyBpbmZvcm1hdGlvbiBmb3IgYSB0YWJsZSByb3cuXG5cdCAqXG5cdCAqIEBwYXJhbSBvVGhpcyBUaGUgaW5zdGFuY2Ugb2YgdGhlIGlubmVyIG1vZGVsIG9mIHRoZSB0YWJsZSBidWlsZGluZyBibG9ja1xuXHQgKiBAcmV0dXJucyAtIFJldHVybnMgdGhlIGJpbmRpbmcgaW5mb3JtYXRpb24gb2YgYSB0YWJsZSByb3dcblx0ICovXG5cdGdldFJvd3NCaW5kaW5nSW5mbzogZnVuY3Rpb24gKG9UaGlzOiBhbnkpIHtcblx0XHRjb25zdCBkYXRhTW9kZWxQYXRoID0gZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKG9UaGlzLmNvbGxlY3Rpb24sIG9UaGlzLmNvbnRleHRQYXRoKTtcblx0XHRjb25zdCBwYXRoID0gZ2V0Q29udGV4dFJlbGF0aXZlVGFyZ2V0T2JqZWN0UGF0aChkYXRhTW9kZWxQYXRoKSB8fCBnZXRUYXJnZXRPYmplY3RQYXRoKGRhdGFNb2RlbFBhdGgpO1xuXHRcdGNvbnN0IG9Sb3dCaW5kaW5nID0ge1xuXHRcdFx0dWk1b2JqZWN0OiB0cnVlLFxuXHRcdFx0c3VzcGVuZGVkOiBmYWxzZSxcblx0XHRcdHBhdGg6IENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMocGF0aCksXG5cdFx0XHRwYXJhbWV0ZXJzOiB7XG5cdFx0XHRcdCRjb3VudDogdHJ1ZVxuXHRcdFx0fSBhcyBhbnksXG5cdFx0XHRldmVudHM6IHt9IGFzIGFueVxuXHRcdH07XG5cblx0XHRpZiAob1RoaXMudGFibGVEZWZpbml0aW9uLmdldE9iamVjdChcImVuYWJsZSRzZWxlY3RcIikpIHtcblx0XHRcdC8vIERvbid0IGFkZCAkc2VsZWN0IHBhcmFtZXRlciBpbiBjYXNlIG9mIGFuIGFuYWx5dGljYWwgcXVlcnksIHRoaXMgaXNuJ3Qgc3VwcG9ydGVkIGJ5IHRoZSBtb2RlbFxuXHRcdFx0Y29uc3Qgc1NlbGVjdCA9IFRhYmxlSGVscGVyLmNyZWF0ZSRTZWxlY3Qob1RoaXMpO1xuXHRcdFx0aWYgKHNTZWxlY3QpIHtcblx0XHRcdFx0b1Jvd0JpbmRpbmcucGFyYW1ldGVycy4kc2VsZWN0ID0gYCcke3NTZWxlY3R9J2A7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKG9UaGlzLnRhYmxlRGVmaW5pdGlvbi5nZXRPYmplY3QoXCJlbmFibGUkJGdldEtlZXBBbGl2ZUNvbnRleHRcIikpIHtcblx0XHRcdC8vIHdlIGxhdGVyIGVuc3VyZSBpbiB0aGUgZGVsZWdhdGUgb25seSBvbmUgbGlzdCBiaW5kaW5nIGZvciBhIGdpdmVuIHRhcmdldENvbGxlY3Rpb25QYXRoIGhhcyB0aGUgZmxhZyAkJGdldEtlZXBBbGl2ZUNvbnRleHRcblx0XHRcdG9Sb3dCaW5kaW5nLnBhcmFtZXRlcnMuJCRnZXRLZWVwQWxpdmVDb250ZXh0ID0gdHJ1ZTtcblx0XHR9XG5cblx0XHRvUm93QmluZGluZy5wYXJhbWV0ZXJzLiQkZ3JvdXBJZCA9IENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMoXCIkYXV0by5Xb3JrZXJzXCIpO1xuXHRcdG9Sb3dCaW5kaW5nLnBhcmFtZXRlcnMuJCR1cGRhdGVHcm91cElkID0gQ29tbW9uSGVscGVyLmFkZFNpbmdsZVF1b3RlcyhcIiRhdXRvXCIpO1xuXHRcdG9Sb3dCaW5kaW5nLnBhcmFtZXRlcnMuJCRvd25SZXF1ZXN0ID0gdHJ1ZTtcblx0XHRvUm93QmluZGluZy5wYXJhbWV0ZXJzLiQkcGF0Y2hXaXRob3V0U2lkZUVmZmVjdHMgPSB0cnVlO1xuXG5cdFx0b1Jvd0JpbmRpbmcuZXZlbnRzLnBhdGNoU2VudCA9IENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMoXCIuZWRpdEZsb3cuaGFuZGxlUGF0Y2hTZW50XCIpO1xuXHRcdG9Sb3dCaW5kaW5nLmV2ZW50cy5kYXRhUmVjZWl2ZWQgPSBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKFwiQVBJLm9uSW50ZXJuYWxEYXRhUmVjZWl2ZWRcIik7XG5cdFx0b1Jvd0JpbmRpbmcuZXZlbnRzLmRhdGFSZXF1ZXN0ZWQgPSBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKFwiQVBJLm9uSW50ZXJuYWxEYXRhUmVxdWVzdGVkXCIpO1xuXHRcdC8vIHJlY3JlYXRlIGFuIGVtcHR5IHJvdyB3aGVuIG9uZSBpcyBhY3RpdmF0ZWRcblx0XHRvUm93QmluZGluZy5ldmVudHMuY3JlYXRlQWN0aXZhdGUgPSBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKFwiLmVkaXRGbG93LmhhbmRsZUNyZWF0ZUFjdGl2YXRlXCIpO1xuXG5cdFx0aWYgKG9UaGlzLm9uQ29udGV4dENoYW5nZSAhPT0gdW5kZWZpbmVkICYmIG9UaGlzLm9uQ29udGV4dENoYW5nZSAhPT0gbnVsbCkge1xuXHRcdFx0b1Jvd0JpbmRpbmcuZXZlbnRzLmNoYW5nZSA9IENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMob1RoaXMub25Db250ZXh0Q2hhbmdlKTtcblx0XHR9XG5cdFx0cmV0dXJuIENvbW1vbkhlbHBlci5vYmplY3RUb1N0cmluZyhvUm93QmluZGluZyk7XG5cdH0sXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gY2hlY2sgdGhlIHZhbGlkaXR5IG9mIHRoZSBmaWVsZHMgaW4gdGhlIGNyZWF0aW9uIHJvdy5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIHZhbGlkYXRlQ3JlYXRpb25Sb3dGaWVsZHNcblx0ICogQHBhcmFtIG9GaWVsZFZhbGlkaXR5T2JqZWN0IEN1cnJlbnQgT2JqZWN0IGhvbGRpbmcgdGhlIGZpZWxkc1xuXHQgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgYWxsIHRoZSBmaWVsZHMgaW4gdGhlIGNyZWF0aW9uIHJvdyBhcmUgdmFsaWQsIGBmYWxzZWAgb3RoZXJ3aXNlXG5cdCAqL1xuXHR2YWxpZGF0ZUNyZWF0aW9uUm93RmllbGRzOiBmdW5jdGlvbiAob0ZpZWxkVmFsaWRpdHlPYmplY3Q6IGFueSkge1xuXHRcdGlmICghb0ZpZWxkVmFsaWRpdHlPYmplY3QpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0cmV0dXJuIChcblx0XHRcdE9iamVjdC5rZXlzKG9GaWVsZFZhbGlkaXR5T2JqZWN0KS5sZW5ndGggPiAwICYmXG5cdFx0XHRPYmplY3Qua2V5cyhvRmllbGRWYWxpZGl0eU9iamVjdCkuZXZlcnkoZnVuY3Rpb24gKGtleTogc3RyaW5nKSB7XG5cdFx0XHRcdHJldHVybiBvRmllbGRWYWxpZGl0eU9iamVjdFtrZXldW1widmFsaWRpdHlcIl07XG5cdFx0XHR9KVxuXHRcdCk7XG5cdH0sXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gZ2V0IHRoZSBleHByZXNzaW9uIGZvciB0aGUgJ3ByZXNzJyBldmVudCBmb3IgdGhlIERhdGFGaWVsZEZvckFjdGlvbkJ1dHRvbi5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIHByZXNzRXZlbnREYXRhRmllbGRGb3JBY3Rpb25CdXR0b25cblx0ICogQHBhcmFtIG9UaGlzIEN1cnJlbnQgb2JqZWN0XG5cdCAqIEBwYXJhbSBvRGF0YUZpZWxkIFZhbHVlIG9mIHRoZSBEYXRhUG9pbnRcblx0ICogQHBhcmFtIHNFbnRpdHlTZXROYW1lIE5hbWUgb2YgdGhlIEVudGl0eVNldFxuXHQgKiBAcGFyYW0gc09wZXJhdGlvbkF2YWlsYWJsZU1hcCBPcGVyYXRpb25BdmFpbGFibGVNYXAgYXMgc3RyaW5naWZpZWQgSlNPTiBvYmplY3Rcblx0ICogQHBhcmFtIG9BY3Rpb25Db250ZXh0IEFjdGlvbiBvYmplY3Rcblx0ICogQHBhcmFtIGJJc05hdmlnYWJsZSBBY3Rpb24gZWl0aGVyIHRyaWdnZXJzIG5hdmlnYXRpb24gb3Igbm90XG5cdCAqIEBwYXJhbSBiRW5hYmxlQXV0b1Njcm9sbCBBY3Rpb24gZWl0aGVyIHRyaWdnZXJzIHNjcm9sbGluZyB0byB0aGUgbmV3bHkgY3JlYXRlZCBpdGVtcyBpbiB0aGUgcmVsYXRlZCB0YWJsZSBvciBub3Rcblx0ICogQHBhcmFtIHNEZWZhdWx0VmFsdWVzRXh0ZW5zaW9uRnVuY3Rpb24gRnVuY3Rpb24gbmFtZSB0byBwcmVmaWxsIGRpYWxvZyBwYXJhbWV0ZXJzXG5cdCAqIEByZXR1cm5zIFRoZSBiaW5kaW5nIGV4cHJlc3Npb25cblx0ICovXG5cdHByZXNzRXZlbnREYXRhRmllbGRGb3JBY3Rpb25CdXR0b246IGZ1bmN0aW9uIChcblx0XHRvVGhpczogYW55LFxuXHRcdG9EYXRhRmllbGQ6IGFueSxcblx0XHRzRW50aXR5U2V0TmFtZTogc3RyaW5nLFxuXHRcdHNPcGVyYXRpb25BdmFpbGFibGVNYXA6IHN0cmluZyxcblx0XHRvQWN0aW9uQ29udGV4dDogb2JqZWN0LFxuXHRcdGJJc05hdmlnYWJsZTogYW55LFxuXHRcdGJFbmFibGVBdXRvU2Nyb2xsOiBhbnksXG5cdFx0c0RlZmF1bHRWYWx1ZXNFeHRlbnNpb25GdW5jdGlvbjogc3RyaW5nXG5cdCkge1xuXHRcdGNvbnN0IHNBY3Rpb25OYW1lID0gb0RhdGFGaWVsZC5BY3Rpb24sXG5cdFx0XHRzQW5ub3RhdGlvblRhcmdldEVudGl0eVR5cGUgPSBvVGhpcyAmJiBvVGhpcy5jb2xsZWN0aW9uLmdldE9iamVjdChcIiRUeXBlXCIpLFxuXHRcdFx0YlN0YXRpY0FjdGlvbiA9XG5cdFx0XHRcdHRoaXMuX2lzU3RhdGljQWN0aW9uKG9BY3Rpb25Db250ZXh0LCBzQWN0aW9uTmFtZSkgfHxcblx0XHRcdFx0dGhpcy5faXNBY3Rpb25PdmVybG9hZE9uRGlmZmVyZW50VHlwZShzQWN0aW9uTmFtZSwgc0Fubm90YXRpb25UYXJnZXRFbnRpdHlUeXBlKSxcblx0XHRcdG9QYXJhbXMgPSB7XG5cdFx0XHRcdGNvbnRleHRzOiAhYlN0YXRpY0FjdGlvbiA/IFwiJHtpbnRlcm5hbD5zZWxlY3RlZENvbnRleHRzfVwiIDogbnVsbCxcblx0XHRcdFx0YlN0YXRpY0FjdGlvbjogYlN0YXRpY0FjdGlvbiA/IGJTdGF0aWNBY3Rpb24gOiB1bmRlZmluZWQsXG5cdFx0XHRcdGVudGl0eVNldE5hbWU6IENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMoc0VudGl0eVNldE5hbWUpLFxuXHRcdFx0XHRhcHBsaWNhYmxlQ29udGV4dDogIWJTdGF0aWNBY3Rpb24gPyBcIiR7aW50ZXJuYWw+ZHluYW1pY0FjdGlvbnMvXCIgKyBvRGF0YUZpZWxkLkFjdGlvbiArIFwiL2FBcHBsaWNhYmxlL31cIiA6IG51bGwsXG5cdFx0XHRcdG5vdEFwcGxpY2FibGVDb250ZXh0OiAhYlN0YXRpY0FjdGlvbiA/IFwiJHtpbnRlcm5hbD5keW5hbWljQWN0aW9ucy9cIiArIG9EYXRhRmllbGQuQWN0aW9uICsgXCIvYU5vdEFwcGxpY2FibGUvfVwiIDogbnVsbCxcblx0XHRcdFx0aXNOYXZpZ2FibGU6IGJJc05hdmlnYWJsZSxcblx0XHRcdFx0ZW5hYmxlQXV0b1Njcm9sbDogYkVuYWJsZUF1dG9TY3JvbGwsXG5cdFx0XHRcdGRlZmF1bHRWYWx1ZXNFeHRlbnNpb25GdW5jdGlvbjogc0RlZmF1bHRWYWx1ZXNFeHRlbnNpb25GdW5jdGlvbiA/IFwiJ1wiICsgc0RlZmF1bHRWYWx1ZXNFeHRlbnNpb25GdW5jdGlvbiArIFwiJ1wiIDogdW5kZWZpbmVkXG5cdFx0XHR9O1xuXG5cdFx0cmV0dXJuIEFjdGlvbkhlbHBlci5nZXRQcmVzc0V2ZW50RGF0YUZpZWxkRm9yQWN0aW9uQnV0dG9uKG9UaGlzLmlkLCBvRGF0YUZpZWxkLCBvUGFyYW1zLCBzT3BlcmF0aW9uQXZhaWxhYmxlTWFwKTtcblx0fSxcblx0LyoqXG5cdCAqIE1ldGhvZCB0byBkZXRlcm1pbmUgdGhlIGJpbmRpbmcgZXhwcmVzc2lvbiBmb3IgJ2VuYWJsZWQnIHByb3BlcnR5IG9mIERhdGFGaWVsZEZvckFjdGlvbiBhbmQgRGF0YUZpZWxkRm9ySUJOIGFjdGlvbnMuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBpc0RhdGFGaWVsZEZvckFjdGlvbkVuYWJsZWRcblx0ICogQHBhcmFtIG9UaGlzIFRoZSBpbnN0YW5jZSBvZiB0aGUgdGFibGUgY29udHJvbFxuXHQgKiBAcGFyYW0gb0RhdGFGaWVsZCBUaGUgdmFsdWUgb2YgdGhlIGRhdGEgZmllbGRcblx0ICogQHBhcmFtIG9SZXF1aXJlc0NvbnRleHQgUmVxdWlyZXNDb250ZXh0IGZvciBJQk5cblx0ICogQHBhcmFtIGJJc0RhdGFGaWVsZEZvcklCTiBGbGFnIGZvciBJQk5cblx0ICogQHBhcmFtIG9BY3Rpb25Db250ZXh0IFRoZSBpbnN0YW5jZSBvZiB0aGUgYWN0aW9uXG5cdCAqIEBwYXJhbSB2QWN0aW9uRW5hYmxlZCBTdGF0dXMgb2YgYWN0aW9uIChzaW5nbGUgb3IgbXVsdGlzZWxlY3QpXG5cdCAqIEByZXR1cm5zIEEgYmluZGluZyBleHByZXNzaW9uIHRvIGRlZmluZSB0aGUgJ2VuYWJsZWQnIHByb3BlcnR5IG9mIHRoZSBhY3Rpb25cblx0ICovXG5cdGlzRGF0YUZpZWxkRm9yQWN0aW9uRW5hYmxlZDogZnVuY3Rpb24gKFxuXHRcdG9UaGlzOiBhbnksXG5cdFx0b0RhdGFGaWVsZDogYW55LFxuXHRcdG9SZXF1aXJlc0NvbnRleHQ6IG9iamVjdCxcblx0XHRiSXNEYXRhRmllbGRGb3JJQk46IGJvb2xlYW4sXG5cdFx0b0FjdGlvbkNvbnRleHQ6IG9iamVjdCxcblx0XHR2QWN0aW9uRW5hYmxlZDogc3RyaW5nXG5cdCkge1xuXHRcdGNvbnN0IHNBY3Rpb25OYW1lID0gb0RhdGFGaWVsZC5BY3Rpb24sXG5cdFx0XHRzQW5ub3RhdGlvblRhcmdldEVudGl0eVR5cGUgPSBvVGhpcyAmJiBvVGhpcy5jb2xsZWN0aW9uLmdldE9iamVjdChcIiRUeXBlXCIpLFxuXHRcdFx0b1RhYmxlRGVmaW5pdGlvbiA9IG9UaGlzICYmIG9UaGlzLnRhYmxlRGVmaW5pdGlvbiAmJiBvVGhpcy50YWJsZURlZmluaXRpb24uZ2V0T2JqZWN0KCksXG5cdFx0XHRiU3RhdGljQWN0aW9uID0gdGhpcy5faXNTdGF0aWNBY3Rpb24ob0FjdGlvbkNvbnRleHQsIHNBY3Rpb25OYW1lKSxcblx0XHRcdGlzQW5hbHl0aWNhbFRhYmxlID0gb1RhYmxlRGVmaW5pdGlvbiAmJiBvVGFibGVEZWZpbml0aW9uLmVuYWJsZUFuYWx5dGljcztcblxuXHRcdC8vIENoZWNrIGZvciBhY3Rpb24gb3ZlcmxvYWQgb24gYSBkaWZmZXJlbnQgRW50aXR5IHR5cGUuXG5cdFx0Ly8gSWYgeWVzLCB0YWJsZSByb3cgc2VsZWN0aW9uIGlzIG5vdCByZXF1aXJlZCB0byBlbmFibGUgdGhpcyBhY3Rpb24uXG5cdFx0aWYgKCFiSXNEYXRhRmllbGRGb3JJQk4gJiYgdGhpcy5faXNBY3Rpb25PdmVybG9hZE9uRGlmZmVyZW50VHlwZShzQWN0aW9uTmFtZSwgc0Fubm90YXRpb25UYXJnZXRFbnRpdHlUeXBlKSkge1xuXHRcdFx0Ly8gQWN0aW9uIG92ZXJsb2FkIGRlZmluZWQgb24gZGlmZmVyZW50IGVudGl0eSB0eXBlXG5cdFx0XHRjb25zdCBvT3BlcmF0aW9uQXZhaWxhYmxlTWFwID0gb1RhYmxlRGVmaW5pdGlvbiAmJiBKU09OLnBhcnNlKG9UYWJsZURlZmluaXRpb24ub3BlcmF0aW9uQXZhaWxhYmxlTWFwKTtcblx0XHRcdGlmIChvT3BlcmF0aW9uQXZhaWxhYmxlTWFwICYmIG9PcGVyYXRpb25BdmFpbGFibGVNYXAuaGFzT3duUHJvcGVydHkoc0FjdGlvbk5hbWUpKSB7XG5cdFx0XHRcdC8vIENvcmUuT3BlcmF0aW9uQXZhaWxhYmxlIGFubm90YXRpb24gZGVmaW5lZCBmb3IgdGhlIGFjdGlvbi5cblx0XHRcdFx0Ly8gTmVlZCB0byByZWZlciB0byBpbnRlcm5hbCBtb2RlbCBmb3IgZW5hYmxlZCBwcm9wZXJ0eSBvZiB0aGUgZHluYW1pYyBhY3Rpb24uXG5cdFx0XHRcdC8vIHJldHVybiBjb21waWxlQmluZGluZyhiaW5kaW5nRXhwcmVzc2lvbihcImR5bmFtaWNBY3Rpb25zL1wiICsgc0FjdGlvbk5hbWUgKyBcIi9iRW5hYmxlZFwiLCBcImludGVybmFsXCIpLCB0cnVlKTtcblx0XHRcdFx0cmV0dXJuIFwiez0gJHtpbnRlcm5hbD5keW5hbWljQWN0aW9ucy9cIiArIHNBY3Rpb25OYW1lICsgXCIvYkVuYWJsZWR9IH1cIjtcblx0XHRcdH1cblx0XHRcdC8vIENvbnNpZGVyIHRoZSBhY3Rpb24ganVzdCBsaWtlIGFueSBvdGhlciBzdGF0aWMgRGF0YUZpZWxkRm9yQWN0aW9uLlxuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHRcdGlmICghb1JlcXVpcmVzQ29udGV4dCB8fCBiU3RhdGljQWN0aW9uKSB7XG5cdFx0XHRpZiAoYklzRGF0YUZpZWxkRm9ySUJOKSB7XG5cdFx0XHRcdGNvbnN0IHNFbnRpdHlTZXQgPSBvVGhpcy5jb2xsZWN0aW9uLmdldFBhdGgoKTtcblx0XHRcdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG9UaGlzLmNvbGxlY3Rpb24uZ2V0TW9kZWwoKTtcblx0XHRcdFx0aWYgKHZBY3Rpb25FbmFibGVkID09PSBcImZhbHNlXCIgJiYgIWlzQW5hbHl0aWNhbFRhYmxlKSB7XG5cdFx0XHRcdFx0TG9nLndhcm5pbmcoXCJOYXZpZ2F0aW9uQXZhaWxhYmxlIGFzIGZhbHNlIGlzIGluY29ycmVjdCB1c2FnZVwiKTtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH0gZWxzZSBpZiAoXG5cdFx0XHRcdFx0IWlzQW5hbHl0aWNhbFRhYmxlICYmXG5cdFx0XHRcdFx0b0RhdGFGaWVsZCAmJlxuXHRcdFx0XHRcdG9EYXRhRmllbGQuTmF2aWdhdGlvbkF2YWlsYWJsZSAmJlxuXHRcdFx0XHRcdG9EYXRhRmllbGQuTmF2aWdhdGlvbkF2YWlsYWJsZS4kUGF0aCAmJlxuXHRcdFx0XHRcdG9NZXRhTW9kZWwuZ2V0T2JqZWN0KHNFbnRpdHlTZXQgKyBcIi8kUGFydG5lclwiKSA9PT0gb0RhdGFGaWVsZC5OYXZpZ2F0aW9uQXZhaWxhYmxlLiRQYXRoLnNwbGl0KFwiL1wiKVswXVxuXHRcdFx0XHQpIHtcblx0XHRcdFx0XHRyZXR1cm4gXCJ7PSAke1wiICsgdkFjdGlvbkVuYWJsZWQuc3Vic3RyKHZBY3Rpb25FbmFibGVkLmluZGV4T2YoXCIvXCIpICsgMSwgdkFjdGlvbkVuYWJsZWQubGVuZ3RoKSArIFwifVwiO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHRsZXQgc0RhdGFGaWVsZEZvckFjdGlvbkVuYWJsZWRFeHByZXNzaW9uID0gXCJcIixcblx0XHRcdHNOdW1iZXJPZlNlbGVjdGVkQ29udGV4dHMsXG5cdFx0XHRzQWN0aW9uO1xuXHRcdGlmIChiSXNEYXRhRmllbGRGb3JJQk4pIHtcblx0XHRcdGlmICh2QWN0aW9uRW5hYmxlZCA9PT0gXCJ0cnVlXCIgfHwgaXNBbmFseXRpY2FsVGFibGUpIHtcblx0XHRcdFx0c0RhdGFGaWVsZEZvckFjdGlvbkVuYWJsZWRFeHByZXNzaW9uID0gXCIle2ludGVybmFsPm51bWJlck9mU2VsZWN0ZWRDb250ZXh0c30gPj0gMVwiO1xuXHRcdFx0fSBlbHNlIGlmICh2QWN0aW9uRW5hYmxlZCA9PT0gXCJmYWxzZVwiKSB7XG5cdFx0XHRcdExvZy53YXJuaW5nKFwiTmF2aWdhdGlvbkF2YWlsYWJsZSBhcyBmYWxzZSBpcyBpbmNvcnJlY3QgdXNhZ2VcIik7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHNOdW1iZXJPZlNlbGVjdGVkQ29udGV4dHMgPSBcIiV7aW50ZXJuYWw+bnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzfSA+PSAxXCI7XG5cdFx0XHRcdHNBY3Rpb24gPSBcIiR7aW50ZXJuYWw+aWJuL1wiICsgb0RhdGFGaWVsZC5TZW1hbnRpY09iamVjdCArIFwiLVwiICsgb0RhdGFGaWVsZC5BY3Rpb24gKyBcIi9iRW5hYmxlZFwiICsgXCJ9XCI7XG5cdFx0XHRcdHNEYXRhRmllbGRGb3JBY3Rpb25FbmFibGVkRXhwcmVzc2lvbiA9IHNOdW1iZXJPZlNlbGVjdGVkQ29udGV4dHMgKyBcIiAmJiBcIiArIHNBY3Rpb247XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNOdW1iZXJPZlNlbGVjdGVkQ29udGV4dHMgPSBBY3Rpb25IZWxwZXIuZ2V0TnVtYmVyT2ZDb250ZXh0c0V4cHJlc3Npb24odkFjdGlvbkVuYWJsZWQpO1xuXHRcdFx0c0FjdGlvbiA9IFwiJHtpbnRlcm5hbD5keW5hbWljQWN0aW9ucy9cIiArIG9EYXRhRmllbGQuQWN0aW9uICsgXCIvYkVuYWJsZWRcIiArIFwifVwiO1xuXHRcdFx0c0RhdGFGaWVsZEZvckFjdGlvbkVuYWJsZWRFeHByZXNzaW9uID0gc051bWJlck9mU2VsZWN0ZWRDb250ZXh0cyArIFwiICYmIFwiICsgc0FjdGlvbjtcblx0XHR9XG5cdFx0cmV0dXJuIFwiez0gXCIgKyBzRGF0YUZpZWxkRm9yQWN0aW9uRW5hYmxlZEV4cHJlc3Npb24gKyBcIn1cIjtcblx0fSxcblx0LyoqXG5cdCAqIE1ldGhvZCB0byBnZXQgcHJlc3MgZXZlbnQgZXhwcmVzc2lvbiBmb3IgQ3JlYXRlQnV0dG9uLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgcHJlc3NFdmVudEZvckNyZWF0ZUJ1dHRvblxuXHQgKiBAcGFyYW0gb1RoaXMgQ3VycmVudCBPYmplY3Rcblx0ICogQHBhcmFtIGJDbWRFeGVjdXRpb25GbGFnIEZsYWcgdG8gaW5kaWNhdGUgdGhhdCB0aGUgZnVuY3Rpb24gaXMgY2FsbGVkIGZyb20gQ01EIEV4ZWN1dGlvblxuXHQgKiBAcmV0dXJucyBUaGUgYmluZGluZyBleHByZXNzaW9uIGZvciB0aGUgcHJlc3MgZXZlbnQgb2YgdGhlIGNyZWF0ZSBidXR0b25cblx0ICovXG5cdHByZXNzRXZlbnRGb3JDcmVhdGVCdXR0b246IGZ1bmN0aW9uIChvVGhpczogYW55LCBiQ21kRXhlY3V0aW9uRmxhZzogYm9vbGVhbikge1xuXHRcdGNvbnN0IHNDcmVhdGlvbk1vZGUgPSBvVGhpcy5jcmVhdGlvbk1vZGU7XG5cdFx0bGV0IG9QYXJhbXM6IGFueTtcblx0XHRjb25zdCBzTWRjVGFibGUgPSBiQ21kRXhlY3V0aW9uRmxhZyA/IFwiJHskc291cmNlPn0uZ2V0UGFyZW50KClcIiA6IFwiJHskc291cmNlPn0uZ2V0UGFyZW50KCkuZ2V0UGFyZW50KCkuZ2V0UGFyZW50KClcIjtcblx0XHRsZXQgc1Jvd0JpbmRpbmcgPSBzTWRjVGFibGUgKyBcIi5nZXRSb3dCaW5kaW5nKCkgfHwgXCIgKyBzTWRjVGFibGUgKyBcIi5kYXRhKCdyb3dzQmluZGluZ0luZm8nKS5wYXRoXCI7XG5cblx0XHRzd2l0Y2ggKHNDcmVhdGlvbk1vZGUpIHtcblx0XHRcdGNhc2UgQ3JlYXRpb25Nb2RlLkV4dGVybmFsOlxuXHRcdFx0XHQvLyBuYXZpZ2F0ZSB0byBleHRlcm5hbCB0YXJnZXQgZm9yIGNyZWF0aW5nIG5ldyBlbnRyaWVzXG5cdFx0XHRcdC8vIFRPRE86IEFkZCByZXF1aXJlZCBwYXJhbWV0ZXJzXG5cdFx0XHRcdG9QYXJhbXMgPSB7XG5cdFx0XHRcdFx0Y3JlYXRpb25Nb2RlOiBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKENyZWF0aW9uTW9kZS5FeHRlcm5hbCksXG5cdFx0XHRcdFx0b3V0Ym91bmQ6IENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMob1RoaXMuY3JlYXRlT3V0Ym91bmQpXG5cdFx0XHRcdH07XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIENyZWF0aW9uTW9kZS5DcmVhdGlvblJvdzpcblx0XHRcdFx0b1BhcmFtcyA9IHtcblx0XHRcdFx0XHRjcmVhdGlvbk1vZGU6IENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMoQ3JlYXRpb25Nb2RlLkNyZWF0aW9uUm93KSxcblx0XHRcdFx0XHRjcmVhdGlvblJvdzogXCIkeyRzb3VyY2U+fVwiLFxuXHRcdFx0XHRcdGNyZWF0ZUF0RW5kOiBvVGhpcy5jcmVhdGVBdEVuZCAhPT0gdW5kZWZpbmVkID8gb1RoaXMuY3JlYXRlQXRFbmQgOiBmYWxzZVxuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdHNSb3dCaW5kaW5nID0gXCIkeyRzb3VyY2U+fS5nZXRQYXJlbnQoKS5fZ2V0Um93QmluZGluZygpXCI7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIENyZWF0aW9uTW9kZS5OZXdQYWdlOlxuXHRcdFx0Y2FzZSBDcmVhdGlvbk1vZGUuSW5saW5lOlxuXHRcdFx0XHRvUGFyYW1zID0ge1xuXHRcdFx0XHRcdGNyZWF0aW9uTW9kZTogQ29tbW9uSGVscGVyLmFkZFNpbmdsZVF1b3RlcyhzQ3JlYXRpb25Nb2RlKSxcblx0XHRcdFx0XHRjcmVhdGVBdEVuZDogb1RoaXMuY3JlYXRlQXRFbmQgIT09IHVuZGVmaW5lZCA/IG9UaGlzLmNyZWF0ZUF0RW5kIDogZmFsc2UsXG5cdFx0XHRcdFx0dGFibGVJZDogQ29tbW9uSGVscGVyLmFkZFNpbmdsZVF1b3RlcyhvVGhpcy5pZClcblx0XHRcdFx0fTtcblxuXHRcdFx0XHRpZiAob1RoaXMuY3JlYXRlTmV3QWN0aW9uKSB7XG5cdFx0XHRcdFx0b1BhcmFtcy5uZXdBY3Rpb24gPSBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKG9UaGlzLmNyZWF0ZU5ld0FjdGlvbik7XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgQ3JlYXRpb25Nb2RlLklubGluZUNyZWF0aW9uUm93czpcblx0XHRcdFx0cmV0dXJuIENvbW1vbkhlbHBlci5nZW5lcmF0ZUZ1bmN0aW9uKFwiLl9lZGl0Rmxvdy5jcmVhdGVFbXB0eVJvd3NBbmRGb2N1c1wiLCBzTWRjVGFibGUpO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0Ly8gdW5zdXBwb3J0ZWRcblx0XHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cdFx0cmV0dXJuIENvbW1vbkhlbHBlci5nZW5lcmF0ZUZ1bmN0aW9uKFwiLmVkaXRGbG93LmNyZWF0ZURvY3VtZW50XCIsIHNSb3dCaW5kaW5nLCBDb21tb25IZWxwZXIub2JqZWN0VG9TdHJpbmcob1BhcmFtcykpO1xuXHR9LFxuXG5cdGdldElCTkRhdGE6IGZ1bmN0aW9uIChvVGhpczogYW55KSB7XG5cdFx0Y29uc3Qgb3V0Ym91bmREZXRhaWwgPSBvVGhpcy5jcmVhdGVPdXRib3VuZERldGFpbDtcblx0XHRpZiAob3V0Ym91bmREZXRhaWwpIHtcblx0XHRcdGNvbnN0IG9JQk5EYXRhID0ge1xuXHRcdFx0XHRzZW1hbnRpY09iamVjdDogQ29tbW9uSGVscGVyLmFkZFNpbmdsZVF1b3RlcyhvdXRib3VuZERldGFpbC5zZW1hbnRpY09iamVjdCksXG5cdFx0XHRcdGFjdGlvbjogQ29tbW9uSGVscGVyLmFkZFNpbmdsZVF1b3RlcyhvdXRib3VuZERldGFpbC5hY3Rpb24pXG5cdFx0XHR9O1xuXHRcdFx0cmV0dXJuIENvbW1vbkhlbHBlci5vYmplY3RUb1N0cmluZyhvSUJORGF0YSk7XG5cdFx0fVxuXHR9LFxuXG5cdF9nZXRFeHByZXNzaW9uRm9yRGVsZXRlQnV0dG9uOiBmdW5jdGlvbiAodmFsdWU6IGFueSwgZnVsbENvbnRleHRQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoKTogc3RyaW5nIHwgQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24ge1xuXHRcdGlmICh0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdHJldHVybiBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKHZhbHVlLCB0cnVlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc3QgZXhwcmVzc2lvbiA9IGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbih2YWx1ZSk7XG5cdFx0XHRpZiAoaXNDb25zdGFudChleHByZXNzaW9uKSB8fCBpc1BhdGhJbk1vZGVsRXhwcmVzc2lvbihleHByZXNzaW9uKSkge1xuXHRcdFx0XHRjb25zdCB2YWx1ZUV4cHJlc3Npb24gPSBmb3JtYXRWYWx1ZVJlY3Vyc2l2ZWx5KGV4cHJlc3Npb24sIGZ1bGxDb250ZXh0UGF0aCk7XG5cdFx0XHRcdHJldHVybiBjb21waWxlRXhwcmVzc2lvbih2YWx1ZUV4cHJlc3Npb24pO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogTWV0aG9kIHRvIGdldCBwcmVzcyBldmVudCBleHByZXNzaW9uIGZvciAnRGVsZXRlJyBidXR0b24uXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBwcmVzc0V2ZW50Rm9yRGVsZXRlQnV0dG9uXG5cdCAqIEBwYXJhbSBvVGhpcyBDdXJyZW50IE9iamVjdFxuXHQgKiBAcGFyYW0gc0VudGl0eVNldE5hbWUgRW50aXR5U2V0IG5hbWVcblx0ICogQHBhcmFtIG9IZWFkZXJJbmZvIEhlYWRlciBJbmZvXG5cdCAqIEBwYXJhbSBmdWxsY29udGV4dFBhdGggQ29udGV4dCBQYXRoXG5cdCAqIEByZXR1cm5zIFRoZSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIHRoZSBwcmVzcyBldmVudCBvZiB0aGUgJ0RlbGV0ZScgYnV0dG9uXG5cdCAqL1xuXHRwcmVzc0V2ZW50Rm9yRGVsZXRlQnV0dG9uOiBmdW5jdGlvbiAob1RoaXM6IGFueSwgc0VudGl0eVNldE5hbWU6IHN0cmluZywgb0hlYWRlckluZm86IGFueSwgZnVsbGNvbnRleHRQYXRoOiBhbnkpIHtcblx0XHRjb25zdCBzRGVsZXRhYmxlQ29udGV4dHMgPSBcIiR7aW50ZXJuYWw+ZGVsZXRhYmxlQ29udGV4dHN9XCI7XG5cdFx0bGV0IHNUaXRsZUV4cHJlc3Npb24sIHNEZXNjcmlwdGlvbkV4cHJlc3Npb247XG5cblx0XHRpZiAob0hlYWRlckluZm8/LlRpdGxlKSB7XG5cdFx0XHRzVGl0bGVFeHByZXNzaW9uID0gdGhpcy5fZ2V0RXhwcmVzc2lvbkZvckRlbGV0ZUJ1dHRvbihvSGVhZGVySW5mby5UaXRsZS5WYWx1ZSwgZnVsbGNvbnRleHRQYXRoKTtcblx0XHR9XG5cdFx0aWYgKG9IZWFkZXJJbmZvPy5EZXNjcmlwdGlvbikge1xuXHRcdFx0c0Rlc2NyaXB0aW9uRXhwcmVzc2lvbiA9IHRoaXMuX2dldEV4cHJlc3Npb25Gb3JEZWxldGVCdXR0b24ob0hlYWRlckluZm8uRGVzY3JpcHRpb24uVmFsdWUsIGZ1bGxjb250ZXh0UGF0aCk7XG5cdFx0fVxuXG5cdFx0Y29uc3Qgb1BhcmFtcyA9IHtcblx0XHRcdGlkOiBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKG9UaGlzLmlkKSxcblx0XHRcdGVudGl0eVNldE5hbWU6IENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMoc0VudGl0eVNldE5hbWUpLFxuXHRcdFx0bnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzOiBcIiR7aW50ZXJuYWw+c2VsZWN0ZWRDb250ZXh0c30ubGVuZ3RoXCIsXG5cdFx0XHR1blNhdmVkQ29udGV4dHM6IFwiJHtpbnRlcm5hbD51blNhdmVkQ29udGV4dHN9XCIsXG5cdFx0XHRsb2NrZWRDb250ZXh0czogXCIke2ludGVybmFsPmxvY2tlZENvbnRleHRzfVwiLFxuXHRcdFx0Y3JlYXRlTW9kZUNvbnRleHRzOiBcIiR7aW50ZXJuYWw+Y3JlYXRlTW9kZUNvbnRleHRzfVwiLFxuXHRcdFx0ZHJhZnRzV2l0aERlbGV0YWJsZUFjdGl2ZTogXCIke2ludGVybmFsPmRyYWZ0c1dpdGhEZWxldGFibGVBY3RpdmV9XCIsXG5cdFx0XHRkcmFmdHNXaXRoTm9uRGVsZXRhYmxlQWN0aXZlOiBcIiR7aW50ZXJuYWw+ZHJhZnRzV2l0aE5vbkRlbGV0YWJsZUFjdGl2ZX1cIixcblx0XHRcdGNvbnRyb2xJZDogXCIke2ludGVybmFsPmNvbnRyb2xJZH1cIixcblx0XHRcdHRpdGxlOiBzVGl0bGVFeHByZXNzaW9uLFxuXHRcdFx0ZGVzY3JpcHRpb246IHNEZXNjcmlwdGlvbkV4cHJlc3Npb24sXG5cdFx0XHRzZWxlY3RlZENvbnRleHRzOiBcIiR7aW50ZXJuYWw+c2VsZWN0ZWRDb250ZXh0c31cIlxuXHRcdH07XG5cblx0XHRyZXR1cm4gQ29tbW9uSGVscGVyLmdlbmVyYXRlRnVuY3Rpb24oXCIuZWRpdEZsb3cuZGVsZXRlTXVsdGlwbGVEb2N1bWVudHNcIiwgc0RlbGV0YWJsZUNvbnRleHRzLCBDb21tb25IZWxwZXIub2JqZWN0VG9TdHJpbmcob1BhcmFtcykpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gc2V0IHRoZSB2aXNpYmlsaXR5IG9mIHRoZSBsYWJlbCBmb3IgdGhlIGNvbHVtbiBoZWFkZXIuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBzZXRIZWFkZXJMYWJlbFZpc2liaWxpdHlcblx0ICogQHBhcmFtIGRhdGFmaWVsZCBEYXRhRmllbGRcblx0ICogQHBhcmFtIGRhdGFGaWVsZENvbGxlY3Rpb24gTGlzdCBvZiBpdGVtcyBpbnNpZGUgYSBmaWVsZGdyb3VwIChpZiBhbnkpXG5cdCAqIEByZXR1cm5zIGB0cnVlYCBpZiB0aGUgaGVhZGVyIGxhYmVsIG5lZWRzIHRvIGJlIHZpc2libGUgZWxzZSBmYWxzZS5cblx0ICovXG5cdHNldEhlYWRlckxhYmVsVmlzaWJpbGl0eTogZnVuY3Rpb24gKGRhdGFmaWVsZDogYW55LCBkYXRhRmllbGRDb2xsZWN0aW9uOiBhbnlbXSkge1xuXHRcdC8vIElmIElubGluZSBidXR0b24vbmF2aWdhdGlvbiBhY3Rpb24sIHJldHVybiBmYWxzZSwgZWxzZSB0cnVlO1xuXHRcdGlmICghZGF0YUZpZWxkQ29sbGVjdGlvbikge1xuXHRcdFx0aWYgKGRhdGFmaWVsZC4kVHlwZS5pbmRleE9mKFwiRGF0YUZpZWxkRm9yQWN0aW9uXCIpID4gLTEgJiYgZGF0YWZpZWxkLklubGluZSkge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0XHRpZiAoZGF0YWZpZWxkLiRUeXBlLmluZGV4T2YoXCJEYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb25cIikgPiAtMSAmJiBkYXRhZmllbGQuSW5saW5lKSB7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdC8vIEluIEZpZWxkZ3JvdXAsIElmIE5PVCBhbGwgZGF0YWZpZWxkL2RhdGFmaWVsZEZvckFubm90YXRpb24gZXhpc3RzIHdpdGggaGlkZGVuLCByZXR1cm4gdHJ1ZTtcblx0XHRyZXR1cm4gZGF0YUZpZWxkQ29sbGVjdGlvbi5zb21lKGZ1bmN0aW9uIChvREM6IGFueSkge1xuXHRcdFx0aWYgKFxuXHRcdFx0XHQob0RDLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGQgfHwgb0RDLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBbm5vdGF0aW9uKSAmJlxuXHRcdFx0XHRvRENbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuSGlkZGVuXCJdICE9PSB0cnVlXG5cdFx0XHQpIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ldGhvZCB0byBnZXQgVGV4dCBmcm9tIERhdGFGaWVsZEZvckFubm90YXRpb24gaW50byBDb2x1bW4uXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBnZXRUZXh0T25BY3Rpb25GaWVsZFxuXHQgKiBAcGFyYW0gb0RhdGFGaWVsZCBEYXRhUG9pbnQncyBWYWx1ZVxuXHQgKiBAcGFyYW0gb0NvbnRleHQgQ29udGV4dCBvYmplY3Qgb2YgdGhlIExpbmVJdGVtXG5cdCAqIEByZXR1cm5zIFN0cmluZyBmcm9tIGxhYmVsIHJlZmVycmluZyB0byBhY3Rpb24gdGV4dFxuXHQgKi9cblx0Z2V0VGV4dE9uQWN0aW9uRmllbGQ6IGZ1bmN0aW9uIChvRGF0YUZpZWxkOiBhbnksIG9Db250ZXh0OiBhbnkpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuXHRcdGlmIChcblx0XHRcdG9EYXRhRmllbGQuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFjdGlvbiB8fFxuXHRcdFx0b0RhdGFGaWVsZC4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uXG5cdFx0KSB7XG5cdFx0XHRyZXR1cm4gb0RhdGFGaWVsZC5MYWJlbDtcblx0XHR9XG5cdFx0Ly8gZm9yIEZpZWxkR3JvdXAgY29udGFpbmluZyBEYXRhRmllbGRGb3JBbm5vdGF0aW9uXG5cdFx0aWYgKFxuXHRcdFx0b0RhdGFGaWVsZC4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQW5ub3RhdGlvbiAmJlxuXHRcdFx0b0NvbnRleHQuY29udGV4dC5nZXRPYmplY3QoXCJUYXJnZXQvJEFubm90YXRpb25QYXRoXCIpLmluZGV4T2YoXCJAXCIgKyBVSUFubm90YXRpb25UZXJtcy5GaWVsZEdyb3VwKSA+IC0xXG5cdFx0KSB7XG5cdFx0XHRjb25zdCBzUGF0aERhdGFGaWVsZHMgPSBcIlRhcmdldC8kQW5ub3RhdGlvblBhdGgvRGF0YS9cIjtcblx0XHRcdGNvbnN0IGFNdWx0aXBsZUxhYmVscyA9IFtdO1xuXHRcdFx0Zm9yIChjb25zdCBpIGluIG9Db250ZXh0LmNvbnRleHQuZ2V0T2JqZWN0KHNQYXRoRGF0YUZpZWxkcykpIHtcblx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdG9Db250ZXh0LmNvbnRleHQuZ2V0T2JqZWN0KGAke3NQYXRoRGF0YUZpZWxkcyArIGl9LyRUeXBlYCkgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFjdGlvbiB8fFxuXHRcdFx0XHRcdG9Db250ZXh0LmNvbnRleHQuZ2V0T2JqZWN0KGAke3NQYXRoRGF0YUZpZWxkcyArIGl9LyRUeXBlYCkgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvblxuXHRcdFx0XHQpIHtcblx0XHRcdFx0XHRhTXVsdGlwbGVMYWJlbHMucHVzaChvQ29udGV4dC5jb250ZXh0LmdldE9iamVjdChgJHtzUGF0aERhdGFGaWVsZHMgKyBpfS9MYWJlbGApKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Ly8gSW4gY2FzZSB0aGVyZSBhcmUgbXVsdGlwbGUgYWN0aW9ucyBpbnNpZGUgYSBGaWVsZCBHcm91cCBzZWxlY3QgdGhlIGxhcmdlc3QgQWN0aW9uIExhYmVsXG5cdFx0XHRpZiAoYU11bHRpcGxlTGFiZWxzLmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0cmV0dXJuIGFNdWx0aXBsZUxhYmVscy5yZWR1Y2UoZnVuY3Rpb24gKGE6IGFueSwgYjogYW55KSB7XG5cdFx0XHRcdFx0cmV0dXJuIGEubGVuZ3RoID4gYi5sZW5ndGggPyBhIDogYjtcblx0XHRcdFx0fSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gYU11bHRpcGxlTGFiZWxzLmxlbmd0aCA9PT0gMCA/IHVuZGVmaW5lZCA6IGFNdWx0aXBsZUxhYmVscy50b1N0cmluZygpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9LFxuXHRfZ2V0UmVzcG9uc2l2ZVRhYmxlQ29sdW1uU2V0dGluZ3M6IGZ1bmN0aW9uIChvVGhpczogYW55LCBvQ29sdW1uOiBhbnkpIHtcblx0XHRpZiAob1RoaXMudGFibGVUeXBlID09PSBcIlJlc3BvbnNpdmVUYWJsZVwiKSB7XG5cdFx0XHRyZXR1cm4gb0NvbHVtbi5zZXR0aW5ncztcblx0XHR9XG5cdFx0cmV0dXJuIG51bGw7XG5cdH0sXG5cblx0Z2V0Q2hhcnRTaXplOiBmdW5jdGlvbiAob1RoaXM6IGFueSwgb0NvbHVtbjogYW55KSB7XG5cdFx0Y29uc3Qgc2V0dGluZ3MgPSB0aGlzLl9nZXRSZXNwb25zaXZlVGFibGVDb2x1bW5TZXR0aW5ncyhvVGhpcywgb0NvbHVtbik7XG5cdFx0aWYgKHNldHRpbmdzICYmIHNldHRpbmdzLm1pY3JvQ2hhcnRTaXplKSB7XG5cdFx0XHRyZXR1cm4gc2V0dGluZ3MubWljcm9DaGFydFNpemU7XG5cdFx0fVxuXHRcdHJldHVybiBcIlhTXCI7XG5cdH0sXG5cdGdldFNob3dPbmx5Q2hhcnQ6IGZ1bmN0aW9uIChvVGhpczogYW55LCBvQ29sdW1uOiBhbnkpIHtcblx0XHRjb25zdCBzZXR0aW5ncyA9IHRoaXMuX2dldFJlc3BvbnNpdmVUYWJsZUNvbHVtblNldHRpbmdzKG9UaGlzLCBvQ29sdW1uKTtcblx0XHRpZiAoc2V0dGluZ3MgJiYgc2V0dGluZ3Muc2hvd01pY3JvQ2hhcnRMYWJlbCkge1xuXHRcdFx0cmV0dXJuICFzZXR0aW5ncy5zaG93TWljcm9DaGFydExhYmVsO1xuXHRcdH1cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSxcblx0Z2V0RGVsZWdhdGU6IGZ1bmN0aW9uICh0YWJsZTogVGFibGVWaXN1YWxpemF0aW9uLCBpc0FMUDogc3RyaW5nLCBlbnRpdHlOYW1lOiBzdHJpbmcpIHtcblx0XHRsZXQgb0RlbGVnYXRlO1xuXHRcdGlmIChpc0FMUCA9PT0gXCJ0cnVlXCIpIHtcblx0XHRcdC8vIFdlIGRvbid0IHN1cHBvcnQgVHJlZVRhYmxlIGluIEFMUFxuXHRcdFx0aWYgKHRhYmxlLmNvbnRyb2wudHlwZSA9PT0gXCJUcmVlVGFibGVcIikge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJUcmVlVGFibGUgbm90IHN1cHBvcnRlZCBpbiBBbmFseXRpY2FsIExpc3RQYWdlXCIpO1xuXHRcdFx0fVxuXHRcdFx0b0RlbGVnYXRlID0ge1xuXHRcdFx0XHRuYW1lOiBcInNhcC9mZS9tYWNyb3MvdGFibGUvZGVsZWdhdGVzL0FMUFRhYmxlRGVsZWdhdGVcIixcblx0XHRcdFx0cGF5bG9hZDoge1xuXHRcdFx0XHRcdGNvbGxlY3Rpb25OYW1lOiBlbnRpdHlOYW1lXG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0fSBlbHNlIGlmICh0YWJsZS5jb250cm9sLnR5cGUgPT09IFwiVHJlZVRhYmxlXCIpIHtcblx0XHRcdG9EZWxlZ2F0ZSA9IHtcblx0XHRcdFx0bmFtZTogXCJzYXAvZmUvbWFjcm9zL3RhYmxlL2RlbGVnYXRlcy9UcmVlVGFibGVEZWxlZ2F0ZVwiLFxuXHRcdFx0XHRwYXlsb2FkOiB7XG5cdFx0XHRcdFx0aGllcmFyY2h5UXVhbGlmaWVyOiB0YWJsZS5jb250cm9sLmhpZXJhcmNoeVF1YWxpZmllcixcblx0XHRcdFx0XHRpbml0aWFsRXhwYW5zaW9uTGV2ZWw6IHRhYmxlLmFubm90YXRpb24uaW5pdGlhbEV4cGFuc2lvbkxldmVsXG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0fSBlbHNlIHtcblx0XHRcdG9EZWxlZ2F0ZSA9IHtcblx0XHRcdFx0bmFtZTogXCJzYXAvZmUvbWFjcm9zL3RhYmxlL2RlbGVnYXRlcy9UYWJsZURlbGVnYXRlXCJcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0cmV0dXJuIEpTT04uc3RyaW5naWZ5KG9EZWxlZ2F0ZSk7XG5cdH0sXG5cdHNldElCTkVuYWJsZW1lbnQ6IGZ1bmN0aW9uIChvSW50ZXJuYWxNb2RlbENvbnRleHQ6IGFueSwgb05hdmlnYXRpb25BdmFpbGFibGVNYXA6IGFueSwgYVNlbGVjdGVkQ29udGV4dHM6IGFueSkge1xuXHRcdGZvciAoY29uc3Qgc0tleSBpbiBvTmF2aWdhdGlvbkF2YWlsYWJsZU1hcCkge1xuXHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KGBpYm4vJHtzS2V5fWAsIHtcblx0XHRcdFx0YkVuYWJsZWQ6IGZhbHNlLFxuXHRcdFx0XHRhQXBwbGljYWJsZTogW10sXG5cdFx0XHRcdGFOb3RBcHBsaWNhYmxlOiBbXVxuXHRcdFx0fSk7XG5cdFx0XHRjb25zdCBhQXBwbGljYWJsZSA9IFtdLFxuXHRcdFx0XHRhTm90QXBwbGljYWJsZSA9IFtdO1xuXHRcdFx0Y29uc3Qgc1Byb3BlcnR5ID0gb05hdmlnYXRpb25BdmFpbGFibGVNYXBbc0tleV07XG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGFTZWxlY3RlZENvbnRleHRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGNvbnN0IG9TZWxlY3RlZENvbnRleHQgPSBhU2VsZWN0ZWRDb250ZXh0c1tpXTtcblx0XHRcdFx0aWYgKG9TZWxlY3RlZENvbnRleHQuZ2V0T2JqZWN0KHNQcm9wZXJ0eSkpIHtcblx0XHRcdFx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuZ2V0TW9kZWwoKS5zZXRQcm9wZXJ0eShgJHtvSW50ZXJuYWxNb2RlbENvbnRleHQuZ2V0UGF0aCgpfS9pYm4vJHtzS2V5fS9iRW5hYmxlZGAsIHRydWUpO1xuXHRcdFx0XHRcdGFBcHBsaWNhYmxlLnB1c2gob1NlbGVjdGVkQ29udGV4dCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0YU5vdEFwcGxpY2FibGUucHVzaChvU2VsZWN0ZWRDb250ZXh0KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LmdldE1vZGVsKCkuc2V0UHJvcGVydHkoYCR7b0ludGVybmFsTW9kZWxDb250ZXh0LmdldFBhdGgoKX0vaWJuLyR7c0tleX0vYUFwcGxpY2FibGVgLCBhQXBwbGljYWJsZSk7XG5cdFx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuZ2V0TW9kZWwoKS5zZXRQcm9wZXJ0eShgJHtvSW50ZXJuYWxNb2RlbENvbnRleHQuZ2V0UGF0aCgpfS9pYm4vJHtzS2V5fS9hTm90QXBwbGljYWJsZWAsIGFOb3RBcHBsaWNhYmxlKTtcblx0XHR9XG5cdH1cbn07XG4oVGFibGVIZWxwZXIuZ2V0TmF2aWdhdGlvbkF2YWlsYWJsZU1hcCBhcyBhbnkpLnJlcXVpcmVzSUNvbnRleHQgPSB0cnVlO1xuKFRhYmxlSGVscGVyLmdldFRleHRPbkFjdGlvbkZpZWxkIGFzIGFueSkucmVxdWlyZXNJQ29udGV4dCA9IHRydWU7XG5cbmV4cG9ydCBkZWZhdWx0IFRhYmxlSGVscGVyO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBNENBLE1BQU1BLFlBQVksR0FBR0MsU0FBUyxDQUFDRCxZQUFZO0VBQzNDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLE1BQU1FLFdBQVcsR0FBRztJQUNuQjtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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