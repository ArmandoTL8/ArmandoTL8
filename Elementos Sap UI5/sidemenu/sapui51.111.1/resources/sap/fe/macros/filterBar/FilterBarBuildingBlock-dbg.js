/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlock", "sap/base/Log", "sap/fe/core/buildingBlocks/BuildingBlockRuntime", "sap/fe/core/CommonUtils", "sap/fe/core/converters/controls/Common/DataVisualization", "sap/fe/core/converters/controls/ListReport/FilterBar", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/TemplateModel", "sap/fe/core/templating/FilterHelper", "sap/fe/macros/CommonHelper", "../ResourceModel"], function (BuildingBlock, Log, BuildingBlockRuntime, CommonUtils, DataVisualization, FilterBar, MetaModelConverter, ModelHelper, StableIdHelper, TemplateModel, FilterHelper, CommonHelper, ResourceModel) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _dec31, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _descriptor16, _descriptor17, _descriptor18, _descriptor19, _descriptor20, _descriptor21, _descriptor22, _descriptor23, _descriptor24, _descriptor25, _descriptor26, _descriptor27, _descriptor28, _descriptor29, _descriptor30;
  var _exports = {};
  var getFilterConditions = FilterHelper.getFilterConditions;
  var generate = StableIdHelper.generate;
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  var getSelectionFields = FilterBar.getSelectionFields;
  var getSelectionVariant = DataVisualization.getSelectionVariant;
  var xml = BuildingBlockRuntime.xml;
  var defineBuildingBlock = BuildingBlock.defineBuildingBlock;
  var BuildingBlockBase = BuildingBlock.BuildingBlockBase;
  var blockEvent = BuildingBlock.blockEvent;
  var blockAttribute = BuildingBlock.blockAttribute;
  var blockAggregation = BuildingBlock.blockAggregation;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  const setCustomFilterFieldProperties = function (childFilterField, aggregationObject) {
    aggregationObject.slotName = aggregationObject.key;
    aggregationObject.key = aggregationObject.key.replace("InlineXML_", "");
    aggregationObject.label = childFilterField.getAttribute("label");
    aggregationObject.required = childFilterField.getAttribute("required") === "true";
    return aggregationObject;
  };
  let FilterBarBuildingBlock = (_dec = defineBuildingBlock({
    name: "FilterBar",
    namespace: "sap.fe.macros.internal",
    publicNamespace: "sap.fe.macros"
  }), _dec2 = blockAttribute({
    type: "string",
    isPublic: true
  }), _dec3 = blockAttribute({
    type: "boolean",
    isPublic: true
  }), _dec4 = blockAttribute({
    type: "sap.ui.model.Context"
  }), _dec5 = blockAttribute({
    type: "string"
  }), _dec6 = blockAttribute({
    type: "sap.ui.model.Context",
    isPublic: true
  }), _dec7 = blockAttribute({
    type: "sap.ui.model.Context",
    isPublic: true
  }), _dec8 = blockAttribute({
    type: "boolean",
    defaultValue: false,
    isPublic: true
  }), _dec9 = blockAttribute({
    type: "string"
  }), _dec10 = blockAttribute({
    type: "boolean"
  }), _dec11 = blockAttribute({
    type: "boolean",
    defaultValue: false
  }), _dec12 = blockAttribute({
    type: "boolean",
    defaultValue: true
  }), _dec13 = blockAttribute({
    type: "sap.ui.mdc.FilterBarP13nMode[]",
    defaultValue: "Item,Value"
  }), _dec14 = blockAttribute({
    type: "string"
  }), _dec15 = blockAttribute({
    type: "boolean",
    defaultValue: true
  }), _dec16 = blockAttribute({
    type: "boolean",
    defaultValue: false,
    isPublic: true
  }), _dec17 = blockAttribute({
    type: "string",
    required: false
  }), _dec18 = blockAttribute({
    type: "boolean",
    defaultValue: false
  }), _dec19 = blockAttribute({
    type: "boolean",
    defaultValue: false
  }), _dec20 = blockAttribute({
    type: "boolean",
    defaultValue: false
  }), _dec21 = blockAttribute({
    type: "string"
  }), _dec22 = blockAttribute({
    type: "string",
    defaultValue: "compact"
  }), _dec23 = blockAttribute({
    type: "boolean",
    defaultValue: false,
    isPublic: true
  }), _dec24 = blockAttribute({
    type: "boolean",
    defaultValue: false
  }), _dec25 = blockEvent(), _dec26 = blockEvent(), _dec27 = blockEvent(), _dec28 = blockEvent(), _dec29 = blockEvent(), _dec30 = blockEvent(), _dec31 = blockAggregation({
    type: "sap.fe.macros.FilterField",
    isPublic: true,
    hasVirtualNode: true,
    processAggregations: setCustomFilterFieldProperties
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(FilterBarBuildingBlock, _BuildingBlockBase);
    /**
     * ID of the FilterBar
     */

    /**
     * selectionFields to be displayed
     */

    /**
     * Displays possible errors during the search in a message box
     */

    /**
     * ID of the assigned variant management
     */

    /**
     * Don't show the basic search field
     */

    /**
     * Enables the fallback to show all fields of the EntityType as filter fields if com.sap.vocabularies.UI.v1.SelectionFields are not present
     */

    /**
     * Handles visibility of the 'Adapt Filters' button on the FilterBar
     */

    /**
     * Specifies the personalization options for the filter bar.
     */

    /**
     * Specifies the Sematic Date Range option for the filter bar.
     */

    /**
     * If set the search will be automatically triggered, when a filter value was changed.
     */

    /**
     * Filter conditions to be applied to the filter bar
     */

    /**
     * If set to <code>true</code>, all search requests are ignored. Once it has been set to <code>false</code>,
     * a search is triggered immediately if one or more search requests have been triggered in the meantime
     * but were ignored based on the setting.
     */

    /**
     * Id of control that will allow for switching between normal and visual filter
     */

    /**
     * Handles the visibility of the 'Clear' button on the FilterBar.
     */

    /**
     * Event handler to react to the search event of the FilterBar
     */

    /**
     * Event handler to react to the filterChange event of the FilterBar
     */

    /**
     * Event handler to react to the stateChange event of the FilterBar.
     */

    /**
     * Event handler to react to the filterChanged event of the FilterBar. Exposes parameters from the MDC filter bar
     */

    /**
     * Event handler to react to the search event of the FilterBar. Exposes parameteres from the MDC filter bar
     */

    /**
     * Event handler to react to the afterClear event of the FilterBar
     */

    function FilterBarBuildingBlock(oProps, configuration, mSettings) {
      var _targetDataModelObjec, _targetDataModelObjec2, _targetDataModelObjec3, _targetDataModelObjec4;
      var _this;
      _this = _BuildingBlockBase.call(this, oProps, configuration, mSettings) || this;
      _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "visible", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "selectionFields", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "filterBarDelegate", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "metaPath", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "showMessages", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "variantBackreference", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "hideBasicSearch", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "enableFallback", _descriptor10, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "showAdaptFiltersButton", _descriptor11, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "p13nMode", _descriptor12, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "propertyInfo", _descriptor13, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "useSemanticDateRange", _descriptor14, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "liveMode", _descriptor15, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "filterConditions", _descriptor16, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "suspendSelection", _descriptor17, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "showDraftEditState", _descriptor18, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "isDraftCollaborative", _descriptor19, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "toggleControlId", _descriptor20, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "initialLayout", _descriptor21, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "showClearButton", _descriptor22, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "_applyIdToContent", _descriptor23, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "search", _descriptor24, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "filterChanged", _descriptor25, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "stateChange", _descriptor26, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "internalFilterChanged", _descriptor27, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "internalSearch", _descriptor28, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "afterClear", _descriptor29, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "filterFields", _descriptor30, _assertThisInitialized(_this));
      _this.checkIfCollaborationDraftSupported = oMetaModel => {
        if (ModelHelper.isCollaborationDraftSupported(oMetaModel)) {
          _this.isDraftCollaborative = true;
        }
      };
      _this.getEntityTypePath = metaPathParts => {
        return metaPathParts[0].endsWith("/") ? metaPathParts[0] : metaPathParts[0] + "/";
      };
      _this.getSearch = () => {
        if (!_this.hideBasicSearch) {
          return xml`<control:basicSearchField>
			<mdc:FilterField
				id="${generate([_this.id, "BasicSearchField"])}"
				placeholder="{sap.fe.i18n>M_FILTERBAR_SEARCH}"
				conditions="{$filters>/conditions/$search}"
				dataType="sap.ui.model.odata.type.String"
				maxConditions="1"
			/>
		</control:basicSearchField>`;
        }
        return xml``;
      };
      _this.processSelectionFields = () => {
        var _this$_filterFields, _this$selectionFields, _this$_filterFields2, _this$_valueHelps;
        let draftEditState = xml``;
        if (_this.showDraftEditState) {
          draftEditState = `<core:Fragment fragmentName="sap.fe.macros.filter.DraftEditState" type="XML" />`;
        }
        _this._valueHelps = [];
        _this._filterFields = [];
        (_this$_filterFields = _this._filterFields) === null || _this$_filterFields === void 0 ? void 0 : _this$_filterFields.push(draftEditState);
        if (!Array.isArray(_this.selectionFields)) {
          _this.selectionFields = _this.selectionFields.getObject();
        }
        (_this$selectionFields = _this.selectionFields) === null || _this$selectionFields === void 0 ? void 0 : _this$selectionFields.forEach((selectionField, selectionFieldIdx) => {
          if (selectionField.availability === "Default") {
            _this.setFilterFieldsAndValueHelps(selectionField, selectionFieldIdx);
          }
        });
        _this._filterFields = ((_this$_filterFields2 = _this._filterFields) === null || _this$_filterFields2 === void 0 ? void 0 : _this$_filterFields2.length) > 0 ? _this._filterFields : "";
        _this._valueHelps = ((_this$_valueHelps = _this._valueHelps) === null || _this$_valueHelps === void 0 ? void 0 : _this$_valueHelps.length) > 0 ? _this._valueHelps : "";
      };
      _this.setFilterFieldsAndValueHelps = (selectionField, selectionFieldIdx) => {
        if (selectionField.template === undefined && selectionField.type !== "Slot") {
          _this.pushFilterFieldsAndValueHelps(selectionField);
        } else if (Array.isArray(_this._filterFields)) {
          var _this$_filterFields3;
          (_this$_filterFields3 = _this._filterFields) === null || _this$_filterFields3 === void 0 ? void 0 : _this$_filterFields3.push(xml`<template:with path="selectionFields>${selectionFieldIdx}" var="item">
					<core:Fragment fragmentName="sap.fe.macros.filter.CustomFilter" type="XML" />
				</template:with>`);
        }
      };
      _this.pushFilterFieldsAndValueHelps = selectionField => {
        if (Array.isArray(_this._filterFields)) {
          var _this$_filterFields4;
          (_this$_filterFields4 = _this._filterFields) === null || _this$_filterFields4 === void 0 ? void 0 : _this$_filterFields4.push(xml`<internalMacro:FilterField
			idPrefix="${generate([_this.id, "FilterField", CommonHelper.getNavigationPath(selectionField.annotationPath)])}"
			vhIdPrefix="${generate([_this.id, "FilterFieldValueHelp"])}"
			property="${selectionField.annotationPath}"
			contextPath="${_this._getContextPathForFilterField(selectionField, _this._internalContextPath)}"
			useSemanticDateRange="${_this.useSemanticDateRange}"
			settings="${CommonHelper.stringifyCustomData(selectionField.settings)}"
			visualFilter="${selectionField.visualFilter}"
			/>`);
        }
        if (Array.isArray(_this._valueHelps)) {
          var _this$_valueHelps2;
          (_this$_valueHelps2 = _this._valueHelps) === null || _this$_valueHelps2 === void 0 ? void 0 : _this$_valueHelps2.push(xml`<macro:ValueHelp
			idPrefix="${generate([_this.id, "FilterFieldValueHelp"])}"
			conditionModel="$filters"
			property="${selectionField.annotationPath}"
			contextPath="${_this._getContextPathForFilterField(selectionField, _this._internalContextPath)}"
			filterFieldValueHelp="true"
			useSemanticDateRange="${_this.useSemanticDateRange}"
		/>`);
        }
      };
      const oContext = oProps.contextPath;
      const oMetaPathContext = oProps.metaPath;
      if (!oMetaPathContext) {
        Log.error("Context Path not available for FilterBar Macro.");
        return _assertThisInitialized(_this);
      }
      const sMetaPath = oMetaPathContext === null || oMetaPathContext === void 0 ? void 0 : oMetaPathContext.getPath();
      let entityTypePath = "";
      const _metaPathParts = (sMetaPath === null || sMetaPath === void 0 ? void 0 : sMetaPath.split("/@com.sap.vocabularies.UI.v1.SelectionFields")) || []; // [0]: entityTypePath, [1]: SF Qualifier.
      if (_metaPathParts.length > 0) {
        entityTypePath = _this.getEntityTypePath(_metaPathParts);
      }
      const sEntitySetPath = ModelHelper.getEntitySetPath(entityTypePath);
      const _oMetaModel = oContext === null || oContext === void 0 ? void 0 : oContext.getModel();
      _this._internalContextPath = _oMetaModel === null || _oMetaModel === void 0 ? void 0 : _oMetaModel.createBindingContext(entityTypePath);
      const sObjectPath = "@com.sap.vocabularies.UI.v1.SelectionFields";
      const annotationPath = "@com.sap.vocabularies.UI.v1.SelectionFields" + (_metaPathParts.length && _metaPathParts[1] || "");
      const oExtraParams = {};
      oExtraParams[sObjectPath] = {
        filterFields: oProps.filterFields
      };
      const oVisualizationObjectPath = getInvolvedDataModelObjects(_this._internalContextPath);
      const oConverterContext = _this.getConverterContext(oVisualizationObjectPath, undefined, mSettings, oExtraParams);
      if (!oProps.propertyInfo) {
        _this.propertyInfo = getSelectionFields(oConverterContext, [], annotationPath).sPropertyInfo;
      }

      //Filter Fields and values to the field are filled based on the selectionFields and this would be empty in case of macro outside the FE template
      if (!oProps.selectionFields) {
        const oSelectionFields = getSelectionFields(oConverterContext, [], annotationPath).selectionFields;
        _this.selectionFields = new TemplateModel(oSelectionFields, _oMetaModel).createBindingContext("/");
        const oEntityType = oConverterContext.getEntityType(),
          oSelectionVariant = getSelectionVariant(oEntityType, oConverterContext),
          oEntitySetContext = _oMetaModel.getContext(sEntitySetPath),
          oFilterConditions = getFilterConditions(oEntitySetContext, {
            selectionVariant: oSelectionVariant
          });
        _this.filterConditions = oFilterConditions;
      }
      _this._processPropertyInfos(_this.propertyInfo);
      const targetDataModelObject = getInvolvedDataModelObjects(oContext).targetObject;
      if ((_targetDataModelObjec = targetDataModelObject.annotations) !== null && _targetDataModelObjec !== void 0 && (_targetDataModelObjec2 = _targetDataModelObjec.Common) !== null && _targetDataModelObjec2 !== void 0 && _targetDataModelObjec2.DraftRoot || (_targetDataModelObjec3 = targetDataModelObject.annotations) !== null && _targetDataModelObjec3 !== void 0 && (_targetDataModelObjec4 = _targetDataModelObjec3.Common) !== null && _targetDataModelObjec4 !== void 0 && _targetDataModelObjec4.DraftNode) {
        _this.showDraftEditState = true;
        _this.checkIfCollaborationDraftSupported(_oMetaModel);
      }
      if (oProps._applyIdToContent) {
        _this._apiId = oProps.id + "::FilterBar";
        _this._contentId = oProps.id;
      } else {
        _this._apiId = oProps.id;
        _this._contentId = _this.getContentId(oProps.id + "");
      }
      if (oProps.hideBasicSearch !== true) {
        const oSearchRestrictionAnnotation = CommonUtils.getSearchRestrictions(sEntitySetPath, _oMetaModel);
        _this.hideBasicSearch = Boolean(oSearchRestrictionAnnotation && !oSearchRestrictionAnnotation.Searchable);
      }
      _this.processSelectionFields();
      return _this;
    }
    _exports = FilterBarBuildingBlock;
    var _proto = FilterBarBuildingBlock.prototype;
    _proto.getContentId = function getContentId(sMacroId) {
      return `${sMacroId}-content`;
    };
    _proto._processPropertyInfos = function _processPropertyInfos(propertyInfo) {
      const aParameterFields = [];
      if (propertyInfo) {
        const sFetchedProperties = propertyInfo.replace(/\\{/g, "{").replace(/\\}/g, "}");
        const aFetchedProperties = JSON.parse(sFetchedProperties);
        aFetchedProperties.forEach(function (propInfo) {
          if (propInfo.isParameter) {
            aParameterFields.push(propInfo.name);
          }
          if (propInfo.path === "$editState") {
            propInfo.label = ResourceModel.getText("FILTERBAR_EDITING_STATUS");
          }
        });
        this.propertyInfo = JSON.stringify(aFetchedProperties).replace(/\{/g, "\\{").replace(/\}/g, "\\}");
      }
      this._parameters = JSON.stringify(aParameterFields);
    };
    _proto._getContextPathForFilterField = function _getContextPathForFilterField(selectionField, filterBarContextPath) {
      let contextPath = filterBarContextPath;
      if (selectionField.isParameter) {
        // Example:
        // FilterBarContextPath: /Customer/Set
        // ParameterPropertyPath: /Customer/P_CC
        // ContextPathForFilterField: /Customer
        const annoPath = selectionField.annotationPath;
        contextPath = annoPath.substring(0, annoPath.lastIndexOf("/") + 1);
      }
      return contextPath;
    };
    _proto.getTemplate = function getTemplate() {
      var _this$_internalContex;
      const internalContextPath = (_this$_internalContex = this._internalContextPath) === null || _this$_internalContex === void 0 ? void 0 : _this$_internalContex.getPath();
      let filterDelegate = "";
      if (this.filterBarDelegate) {
        filterDelegate = this.filterBarDelegate;
      } else {
        filterDelegate = "{name:'sap/fe/macros/filterBar/FilterBarDelegate', payload: {entityTypePath: '" + internalContextPath + "'}}";
      }
      return xml`<macroFilterBar:FilterBarAPI
        xmlns:template="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1"
        xmlns:core="sap.ui.core"
        xmlns:mdc="sap.ui.mdc"
        xmlns:control="sap.fe.core.controls"
        xmlns:macroFilterBar="sap.fe.macros.filterBar"
        xmlns:macro="sap.fe.macros"
        xmlns:internalMacro="sap.fe.macros.internal"
        xmlns:customData="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"
		id="${this._apiId}"
		search="${this.search}"
		filterChanged="${this.filterChanged}"
		afterClear="${this.afterClear}"
		internalSearch="${this.internalSearch}"
		internalFilterChanged="${this.internalFilterChanged}"
		stateChange="${this.stateChange}"
	>
		<control:FilterBar
			core:require="{API: 'sap/fe/macros/filterBar/FilterBarAPI'}"
			id="${this._contentId}"
			liveMode="${this.liveMode}"
			delegate="${filterDelegate}"
			variantBackreference="${this.variantBackreference}"
			showAdaptFiltersButton="${this.showAdaptFiltersButton}"
			showClearButton="${this.showClearButton}"
			p13nMode="${this.p13nMode}"
			search="API.handleSearch($event)"
			filtersChanged="API.handleFilterChanged($event)"
			filterConditions="${this.filterConditions}"
			suspendSelection="${this.suspendSelection}"
			showMessages="${this.showMessages}"
			toggleControl="${this.toggleControlId}"
			initialLayout="${this.initialLayout}"
			propertyInfo="${this.propertyInfo}"
			customData:localId="${this.id}"
			visible="${this.visible}"
			customData:hideBasicSearch="${this.hideBasicSearch}"
			customData:showDraftEditState="${this.showDraftEditState}"
			customData:useSemanticDateRange="${this.useSemanticDateRange}"
			customData:entityType="${internalContextPath}"
			customData:parameters="${this._parameters}"
		>
			<control:dependents>
				${this._valueHelps}
			</control:dependents>
			${this.getSearch()}
			<control:filterItems>
				${this._filterFields}
			</control:filterItems>
		</control:FilterBar>
	</macroFilterBar:FilterBarAPI>`;
    };
    return FilterBarBuildingBlock;
  }(BuildingBlockBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "visible", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "selectionFields", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "filterBarDelegate", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "metaPath", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "contextPath", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "showMessages", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "variantBackreference", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "hideBasicSearch", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "enableFallback", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "showAdaptFiltersButton", [_dec12], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "p13nMode", [_dec13], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "propertyInfo", [_dec14], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "useSemanticDateRange", [_dec15], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor15 = _applyDecoratedDescriptor(_class2.prototype, "liveMode", [_dec16], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor16 = _applyDecoratedDescriptor(_class2.prototype, "filterConditions", [_dec17], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor17 = _applyDecoratedDescriptor(_class2.prototype, "suspendSelection", [_dec18], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor18 = _applyDecoratedDescriptor(_class2.prototype, "showDraftEditState", [_dec19], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor19 = _applyDecoratedDescriptor(_class2.prototype, "isDraftCollaborative", [_dec20], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor20 = _applyDecoratedDescriptor(_class2.prototype, "toggleControlId", [_dec21], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor21 = _applyDecoratedDescriptor(_class2.prototype, "initialLayout", [_dec22], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor22 = _applyDecoratedDescriptor(_class2.prototype, "showClearButton", [_dec23], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor23 = _applyDecoratedDescriptor(_class2.prototype, "_applyIdToContent", [_dec24], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor24 = _applyDecoratedDescriptor(_class2.prototype, "search", [_dec25], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor25 = _applyDecoratedDescriptor(_class2.prototype, "filterChanged", [_dec26], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor26 = _applyDecoratedDescriptor(_class2.prototype, "stateChange", [_dec27], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor27 = _applyDecoratedDescriptor(_class2.prototype, "internalFilterChanged", [_dec28], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor28 = _applyDecoratedDescriptor(_class2.prototype, "internalSearch", [_dec29], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor29 = _applyDecoratedDescriptor(_class2.prototype, "afterClear", [_dec30], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor30 = _applyDecoratedDescriptor(_class2.prototype, "filterFields", [_dec31], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = FilterBarBuildingBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJzZXRDdXN0b21GaWx0ZXJGaWVsZFByb3BlcnRpZXMiLCJjaGlsZEZpbHRlckZpZWxkIiwiYWdncmVnYXRpb25PYmplY3QiLCJzbG90TmFtZSIsImtleSIsInJlcGxhY2UiLCJsYWJlbCIsImdldEF0dHJpYnV0ZSIsInJlcXVpcmVkIiwiRmlsdGVyQmFyQnVpbGRpbmdCbG9jayIsImRlZmluZUJ1aWxkaW5nQmxvY2siLCJuYW1lIiwibmFtZXNwYWNlIiwicHVibGljTmFtZXNwYWNlIiwiYmxvY2tBdHRyaWJ1dGUiLCJ0eXBlIiwiaXNQdWJsaWMiLCJkZWZhdWx0VmFsdWUiLCJibG9ja0V2ZW50IiwiYmxvY2tBZ2dyZWdhdGlvbiIsImhhc1ZpcnR1YWxOb2RlIiwicHJvY2Vzc0FnZ3JlZ2F0aW9ucyIsIm9Qcm9wcyIsImNvbmZpZ3VyYXRpb24iLCJtU2V0dGluZ3MiLCJjaGVja0lmQ29sbGFib3JhdGlvbkRyYWZ0U3VwcG9ydGVkIiwib01ldGFNb2RlbCIsIk1vZGVsSGVscGVyIiwiaXNDb2xsYWJvcmF0aW9uRHJhZnRTdXBwb3J0ZWQiLCJpc0RyYWZ0Q29sbGFib3JhdGl2ZSIsImdldEVudGl0eVR5cGVQYXRoIiwibWV0YVBhdGhQYXJ0cyIsImVuZHNXaXRoIiwiZ2V0U2VhcmNoIiwiaGlkZUJhc2ljU2VhcmNoIiwieG1sIiwiZ2VuZXJhdGUiLCJpZCIsInByb2Nlc3NTZWxlY3Rpb25GaWVsZHMiLCJkcmFmdEVkaXRTdGF0ZSIsInNob3dEcmFmdEVkaXRTdGF0ZSIsIl92YWx1ZUhlbHBzIiwiX2ZpbHRlckZpZWxkcyIsInB1c2giLCJBcnJheSIsImlzQXJyYXkiLCJzZWxlY3Rpb25GaWVsZHMiLCJnZXRPYmplY3QiLCJmb3JFYWNoIiwic2VsZWN0aW9uRmllbGQiLCJzZWxlY3Rpb25GaWVsZElkeCIsImF2YWlsYWJpbGl0eSIsInNldEZpbHRlckZpZWxkc0FuZFZhbHVlSGVscHMiLCJsZW5ndGgiLCJ0ZW1wbGF0ZSIsInVuZGVmaW5lZCIsInB1c2hGaWx0ZXJGaWVsZHNBbmRWYWx1ZUhlbHBzIiwiQ29tbW9uSGVscGVyIiwiZ2V0TmF2aWdhdGlvblBhdGgiLCJhbm5vdGF0aW9uUGF0aCIsIl9nZXRDb250ZXh0UGF0aEZvckZpbHRlckZpZWxkIiwiX2ludGVybmFsQ29udGV4dFBhdGgiLCJ1c2VTZW1hbnRpY0RhdGVSYW5nZSIsInN0cmluZ2lmeUN1c3RvbURhdGEiLCJzZXR0aW5ncyIsInZpc3VhbEZpbHRlciIsIm9Db250ZXh0IiwiY29udGV4dFBhdGgiLCJvTWV0YVBhdGhDb250ZXh0IiwibWV0YVBhdGgiLCJMb2ciLCJlcnJvciIsInNNZXRhUGF0aCIsImdldFBhdGgiLCJlbnRpdHlUeXBlUGF0aCIsInNwbGl0Iiwic0VudGl0eVNldFBhdGgiLCJnZXRFbnRpdHlTZXRQYXRoIiwiZ2V0TW9kZWwiLCJjcmVhdGVCaW5kaW5nQ29udGV4dCIsInNPYmplY3RQYXRoIiwib0V4dHJhUGFyYW1zIiwiZmlsdGVyRmllbGRzIiwib1Zpc3VhbGl6YXRpb25PYmplY3RQYXRoIiwiZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzIiwib0NvbnZlcnRlckNvbnRleHQiLCJnZXRDb252ZXJ0ZXJDb250ZXh0IiwicHJvcGVydHlJbmZvIiwiZ2V0U2VsZWN0aW9uRmllbGRzIiwic1Byb3BlcnR5SW5mbyIsIm9TZWxlY3Rpb25GaWVsZHMiLCJUZW1wbGF0ZU1vZGVsIiwib0VudGl0eVR5cGUiLCJnZXRFbnRpdHlUeXBlIiwib1NlbGVjdGlvblZhcmlhbnQiLCJnZXRTZWxlY3Rpb25WYXJpYW50Iiwib0VudGl0eVNldENvbnRleHQiLCJnZXRDb250ZXh0Iiwib0ZpbHRlckNvbmRpdGlvbnMiLCJnZXRGaWx0ZXJDb25kaXRpb25zIiwic2VsZWN0aW9uVmFyaWFudCIsImZpbHRlckNvbmRpdGlvbnMiLCJfcHJvY2Vzc1Byb3BlcnR5SW5mb3MiLCJ0YXJnZXREYXRhTW9kZWxPYmplY3QiLCJ0YXJnZXRPYmplY3QiLCJhbm5vdGF0aW9ucyIsIkNvbW1vbiIsIkRyYWZ0Um9vdCIsIkRyYWZ0Tm9kZSIsIl9hcHBseUlkVG9Db250ZW50IiwiX2FwaUlkIiwiX2NvbnRlbnRJZCIsImdldENvbnRlbnRJZCIsIm9TZWFyY2hSZXN0cmljdGlvbkFubm90YXRpb24iLCJDb21tb25VdGlscyIsImdldFNlYXJjaFJlc3RyaWN0aW9ucyIsIkJvb2xlYW4iLCJTZWFyY2hhYmxlIiwic01hY3JvSWQiLCJhUGFyYW1ldGVyRmllbGRzIiwic0ZldGNoZWRQcm9wZXJ0aWVzIiwiYUZldGNoZWRQcm9wZXJ0aWVzIiwiSlNPTiIsInBhcnNlIiwicHJvcEluZm8iLCJpc1BhcmFtZXRlciIsInBhdGgiLCJSZXNvdXJjZU1vZGVsIiwiZ2V0VGV4dCIsInN0cmluZ2lmeSIsIl9wYXJhbWV0ZXJzIiwiZmlsdGVyQmFyQ29udGV4dFBhdGgiLCJhbm5vUGF0aCIsInN1YnN0cmluZyIsImxhc3RJbmRleE9mIiwiZ2V0VGVtcGxhdGUiLCJpbnRlcm5hbENvbnRleHRQYXRoIiwiZmlsdGVyRGVsZWdhdGUiLCJmaWx0ZXJCYXJEZWxlZ2F0ZSIsInNlYXJjaCIsImZpbHRlckNoYW5nZWQiLCJhZnRlckNsZWFyIiwiaW50ZXJuYWxTZWFyY2giLCJpbnRlcm5hbEZpbHRlckNoYW5nZWQiLCJzdGF0ZUNoYW5nZSIsImxpdmVNb2RlIiwidmFyaWFudEJhY2tyZWZlcmVuY2UiLCJzaG93QWRhcHRGaWx0ZXJzQnV0dG9uIiwic2hvd0NsZWFyQnV0dG9uIiwicDEzbk1vZGUiLCJzdXNwZW5kU2VsZWN0aW9uIiwic2hvd01lc3NhZ2VzIiwidG9nZ2xlQ29udHJvbElkIiwiaW5pdGlhbExheW91dCIsInZpc2libGUiLCJCdWlsZGluZ0Jsb2NrQmFzZSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiRmlsdGVyQmFyQnVpbGRpbmdCbG9jay50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqXG4gKiBAY2xhc3NkZXNjXG4gKiBCdWlsZGluZyBibG9jayBmb3IgY3JlYXRpbmcgYSBGaWx0ZXJCYXIgYmFzZWQgb24gdGhlIG1ldGFkYXRhIHByb3ZpZGVkIGJ5IE9EYXRhIFY0LlxuICpcbiAqXG4gKiBVc2FnZSBleGFtcGxlOlxuICogPHByZT5cbiAqICZsdDttYWNybzpGaWx0ZXJCYXJcbiAqICAgaWQ9XCJTb21lSURcIlxuICogICBzaG93QWRhcHRGaWx0ZXJzQnV0dG9uPVwidHJ1ZVwiXG4gKiAgIHAxM25Nb2RlPVtcIkl0ZW1cIixcIlZhbHVlXCJdXG4gKiAgIGxpc3RCaW5kaW5nTmFtZXMgPSBcInNhcC5mZS50YWJsZUJpbmRpbmdcIlxuICogICBsaXZlTW9kZT1cInRydWVcIlxuICogICBzZWFyY2g9XCIuaGFuZGxlcnMub25TZWFyY2hcIlxuICogICBmaWx0ZXJDaGFuZ2VkPVwiLmhhbmRsZXJzLm9uRmlsdGVyc0NoYW5nZWRcIlxuICogLyZndDtcbiAqIDwvcHJlPlxuICpcbiAqIEJ1aWxkaW5nIGJsb2NrIGZvciBjcmVhdGluZyBhIEZpbHRlckJhciBiYXNlZCBvbiB0aGUgbWV0YWRhdGEgcHJvdmlkZWQgYnkgT0RhdGEgVjQuXG4gKiBAY2xhc3Mgc2FwLmZlLm1hY3Jvcy5GaWx0ZXJCYXJcbiAqIEBoaWRlY29uc3RydWN0b3JcbiAqIEBwdWJsaWNcbiAqIEBzaW5jZSAxLjk0LjBcbiAqL1xuXG5pbXBvcnQge1xuXHRibG9ja0FnZ3JlZ2F0aW9uLFxuXHRibG9ja0F0dHJpYnV0ZSxcblx0YmxvY2tFdmVudCxcblx0QnVpbGRpbmdCbG9ja0Jhc2UsXG5cdGRlZmluZUJ1aWxkaW5nQmxvY2tcbn0gZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tcIjtcblxuaW1wb3J0IHsgU2VsZWN0aW9uRmllbGRzIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9VSVwiO1xuaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgeyB4bWwgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1J1bnRpbWVcIjtcbmltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCB7IGdldFNlbGVjdGlvblZhcmlhbnQgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9Db21tb24vRGF0YVZpc3VhbGl6YXRpb25cIjtcbmltcG9ydCB7IGdldFNlbGVjdGlvbkZpZWxkcyB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0xpc3RSZXBvcnQvRmlsdGVyQmFyXCI7XG5pbXBvcnQgeyBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9NZXRhTW9kZWxDb252ZXJ0ZXJcIjtcbmltcG9ydCB0eXBlIHsgUHJvcGVydGllc09mIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgTW9kZWxIZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTW9kZWxIZWxwZXJcIjtcbmltcG9ydCB7IGdlbmVyYXRlIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvU3RhYmxlSWRIZWxwZXJcIjtcbmltcG9ydCBUZW1wbGF0ZU1vZGVsIGZyb20gXCJzYXAvZmUvY29yZS9UZW1wbGF0ZU1vZGVsXCI7XG5pbXBvcnQgeyBGaWx0ZXJDb25kaXRpb25zLCBnZXRGaWx0ZXJDb25kaXRpb25zIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRmlsdGVySGVscGVyXCI7XG5pbXBvcnQgQ29tbW9uSGVscGVyIGZyb20gXCJzYXAvZmUvbWFjcm9zL0NvbW1vbkhlbHBlclwiO1xuaW1wb3J0IHsgRmlsdGVyQmFyUDEzbk1vZGUgfSBmcm9tIFwic2FwL3VpL21kYy9saWJyYXJ5XCI7XG5pbXBvcnQgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL0NvbnRleHRcIjtcbmltcG9ydCBPRGF0YU1ldGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTWV0YU1vZGVsXCI7XG5pbXBvcnQgeyBWNENvbnRleHQgfSBmcm9tIFwidHlwZXMvZXh0ZW5zaW9uX3R5cGVzXCI7XG5pbXBvcnQgeyBQcm9wZXJ0eUluZm8gfSBmcm9tIFwiLi4vRGVsZWdhdGVVdGlsXCI7XG5pbXBvcnQgUmVzb3VyY2VNb2RlbCBmcm9tIFwiLi4vUmVzb3VyY2VNb2RlbFwiO1xuaW1wb3J0IHsgRmlsdGVyRmllbGQgfSBmcm9tIFwiLi9GaWx0ZXJCYXJBUElcIjtcblxuY29uc3Qgc2V0Q3VzdG9tRmlsdGVyRmllbGRQcm9wZXJ0aWVzID0gZnVuY3Rpb24gKGNoaWxkRmlsdGVyRmllbGQ6IEVsZW1lbnQsIGFnZ3JlZ2F0aW9uT2JqZWN0OiBhbnkpOiBGaWx0ZXJGaWVsZCB7XG5cdGFnZ3JlZ2F0aW9uT2JqZWN0LnNsb3ROYW1lID0gYWdncmVnYXRpb25PYmplY3Qua2V5O1xuXHRhZ2dyZWdhdGlvbk9iamVjdC5rZXkgPSBhZ2dyZWdhdGlvbk9iamVjdC5rZXkucmVwbGFjZShcIklubGluZVhNTF9cIiwgXCJcIik7XG5cdGFnZ3JlZ2F0aW9uT2JqZWN0LmxhYmVsID0gY2hpbGRGaWx0ZXJGaWVsZC5nZXRBdHRyaWJ1dGUoXCJsYWJlbFwiKTtcblx0YWdncmVnYXRpb25PYmplY3QucmVxdWlyZWQgPSBjaGlsZEZpbHRlckZpZWxkLmdldEF0dHJpYnV0ZShcInJlcXVpcmVkXCIpID09PSBcInRydWVcIjtcblx0cmV0dXJuIGFnZ3JlZ2F0aW9uT2JqZWN0O1xufTtcblxuQGRlZmluZUJ1aWxkaW5nQmxvY2soe1xuXHRuYW1lOiBcIkZpbHRlckJhclwiLFxuXHRuYW1lc3BhY2U6IFwic2FwLmZlLm1hY3Jvcy5pbnRlcm5hbFwiLFxuXHRwdWJsaWNOYW1lc3BhY2U6IFwic2FwLmZlLm1hY3Jvc1wiXG59KVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRmlsdGVyQmFyQnVpbGRpbmdCbG9jayBleHRlbmRzIEJ1aWxkaW5nQmxvY2tCYXNlIHtcblx0LyoqXG5cdCAqIElEIG9mIHRoZSBGaWx0ZXJCYXJcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHRpc1B1YmxpYzogdHJ1ZVxuXHR9KVxuXHRpZCE6IHN0cmluZztcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwiYm9vbGVhblwiLFxuXHRcdGlzUHVibGljOiB0cnVlXG5cdH0pXG5cdHZpc2libGUhOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIHNlbGVjdGlvbkZpZWxkcyB0byBiZSBkaXNwbGF5ZWRcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiXG5cdH0pXG5cdHNlbGVjdGlvbkZpZWxkcyE6IFNlbGVjdGlvbkZpZWxkcztcblxuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdGZpbHRlckJhckRlbGVnYXRlPzogc3RyaW5nO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiLFxuXHRcdGlzUHVibGljOiB0cnVlXG5cdH0pXG5cdG1ldGFQYXRoITogVjRDb250ZXh0O1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiLFxuXHRcdGlzUHVibGljOiB0cnVlXG5cdH0pXG5cdGNvbnRleHRQYXRoITogQ29udGV4dDtcblxuXHQvKipcblx0ICogRGlzcGxheXMgcG9zc2libGUgZXJyb3JzIGR1cmluZyB0aGUgc2VhcmNoIGluIGEgbWVzc2FnZSBib3hcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJib29sZWFuXCIsXG5cdFx0ZGVmYXVsdFZhbHVlOiBmYWxzZSxcblx0XHRpc1B1YmxpYzogdHJ1ZVxuXHR9KVxuXHRzaG93TWVzc2FnZXMhOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBJRCBvZiB0aGUgYXNzaWduZWQgdmFyaWFudCBtYW5hZ2VtZW50XG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCJcblx0fSlcblx0dmFyaWFudEJhY2tyZWZlcmVuY2UhOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cblx0LyoqXG5cdCAqIERvbid0IHNob3cgdGhlIGJhc2ljIHNlYXJjaCBmaWVsZFxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcImJvb2xlYW5cIlxuXHR9KVxuXHRoaWRlQmFzaWNTZWFyY2ghOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBFbmFibGVzIHRoZSBmYWxsYmFjayB0byBzaG93IGFsbCBmaWVsZHMgb2YgdGhlIEVudGl0eVR5cGUgYXMgZmlsdGVyIGZpZWxkcyBpZiBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5TZWxlY3Rpb25GaWVsZHMgYXJlIG5vdCBwcmVzZW50XG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwiYm9vbGVhblwiLFxuXHRcdGRlZmF1bHRWYWx1ZTogZmFsc2Vcblx0fSlcblx0ZW5hYmxlRmFsbGJhY2shOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBIYW5kbGVzIHZpc2liaWxpdHkgb2YgdGhlICdBZGFwdCBGaWx0ZXJzJyBidXR0b24gb24gdGhlIEZpbHRlckJhclxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcImJvb2xlYW5cIixcblx0XHRkZWZhdWx0VmFsdWU6IHRydWVcblx0fSlcblx0c2hvd0FkYXB0RmlsdGVyc0J1dHRvbiE6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFNwZWNpZmllcyB0aGUgcGVyc29uYWxpemF0aW9uIG9wdGlvbnMgZm9yIHRoZSBmaWx0ZXIgYmFyLlxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInNhcC51aS5tZGMuRmlsdGVyQmFyUDEzbk1vZGVbXVwiLFxuXHRcdGRlZmF1bHRWYWx1ZTogXCJJdGVtLFZhbHVlXCJcblx0fSlcblx0cDEzbk1vZGUhOiBGaWx0ZXJCYXJQMTNuTW9kZTtcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCJcblx0fSlcblx0cHJvcGVydHlJbmZvITogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBTcGVjaWZpZXMgdGhlIFNlbWF0aWMgRGF0ZSBSYW5nZSBvcHRpb24gZm9yIHRoZSBmaWx0ZXIgYmFyLlxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcImJvb2xlYW5cIixcblx0XHRkZWZhdWx0VmFsdWU6IHRydWVcblx0fSlcblx0dXNlU2VtYW50aWNEYXRlUmFuZ2UhOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBJZiBzZXQgdGhlIHNlYXJjaCB3aWxsIGJlIGF1dG9tYXRpY2FsbHkgdHJpZ2dlcmVkLCB3aGVuIGEgZmlsdGVyIHZhbHVlIHdhcyBjaGFuZ2VkLlxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcImJvb2xlYW5cIixcblx0XHRkZWZhdWx0VmFsdWU6IGZhbHNlLFxuXHRcdGlzUHVibGljOiB0cnVlXG5cdH0pXG5cdGxpdmVNb2RlITogYm9vbGVhbjtcblxuXHQvKipcblx0ICogRmlsdGVyIGNvbmRpdGlvbnMgdG8gYmUgYXBwbGllZCB0byB0aGUgZmlsdGVyIGJhclxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdHJlcXVpcmVkOiBmYWxzZVxuXHR9KVxuXHRmaWx0ZXJDb25kaXRpb25zITogUmVjb3JkPHN0cmluZywgRmlsdGVyQ29uZGl0aW9uc1tdPjtcblxuXHQvKipcblx0ICogSWYgc2V0IHRvIDxjb2RlPnRydWU8L2NvZGU+LCBhbGwgc2VhcmNoIHJlcXVlc3RzIGFyZSBpZ25vcmVkLiBPbmNlIGl0IGhhcyBiZWVuIHNldCB0byA8Y29kZT5mYWxzZTwvY29kZT4sXG5cdCAqIGEgc2VhcmNoIGlzIHRyaWdnZXJlZCBpbW1lZGlhdGVseSBpZiBvbmUgb3IgbW9yZSBzZWFyY2ggcmVxdWVzdHMgaGF2ZSBiZWVuIHRyaWdnZXJlZCBpbiB0aGUgbWVhbnRpbWVcblx0ICogYnV0IHdlcmUgaWdub3JlZCBiYXNlZCBvbiB0aGUgc2V0dGluZy5cblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJib29sZWFuXCIsXG5cdFx0ZGVmYXVsdFZhbHVlOiBmYWxzZVxuXHR9KVxuXHRzdXNwZW5kU2VsZWN0aW9uITogYm9vbGVhbjtcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwiYm9vbGVhblwiLFxuXHRcdGRlZmF1bHRWYWx1ZTogZmFsc2Vcblx0fSlcblx0c2hvd0RyYWZ0RWRpdFN0YXRlITogYm9vbGVhbjtcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwiYm9vbGVhblwiLFxuXHRcdGRlZmF1bHRWYWx1ZTogZmFsc2Vcblx0fSlcblx0aXNEcmFmdENvbGxhYm9yYXRpdmUhOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBJZCBvZiBjb250cm9sIHRoYXQgd2lsbCBhbGxvdyBmb3Igc3dpdGNoaW5nIGJldHdlZW4gbm9ybWFsIGFuZCB2aXN1YWwgZmlsdGVyXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCJcblx0fSlcblx0dG9nZ2xlQ29udHJvbElkITogc3RyaW5nO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHRkZWZhdWx0VmFsdWU6IFwiY29tcGFjdFwiXG5cdH0pXG5cdGluaXRpYWxMYXlvdXQhOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIEhhbmRsZXMgdGhlIHZpc2liaWxpdHkgb2YgdGhlICdDbGVhcicgYnV0dG9uIG9uIHRoZSBGaWx0ZXJCYXIuXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwiYm9vbGVhblwiLFxuXHRcdGRlZmF1bHRWYWx1ZTogZmFsc2UsXG5cdFx0aXNQdWJsaWM6IHRydWVcblx0fSlcblx0c2hvd0NsZWFyQnV0dG9uITogYm9vbGVhbjtcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwiYm9vbGVhblwiLFxuXHRcdGRlZmF1bHRWYWx1ZTogZmFsc2Vcblx0fSlcblx0X2FwcGx5SWRUb0NvbnRlbnQhOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBUZW1wb3Jhcnkgd29ya2Fyb3VuZCBvbmx5XG5cdCAqIHBhdGggdG8gY29udGV4dFBhdGggdG8gYmUgdXNlZCBieSBjaGlsZCBmaWx0ZXJmaWVsZHNcblx0ICovXG5cdF9pbnRlcm5hbENvbnRleHRQYXRoITogVjRDb250ZXh0O1xuXG5cdF9wYXJhbWV0ZXJzOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cblx0LyoqXG5cdCAqIEV2ZW50IGhhbmRsZXIgdG8gcmVhY3QgdG8gdGhlIHNlYXJjaCBldmVudCBvZiB0aGUgRmlsdGVyQmFyXG5cdCAqL1xuXHRAYmxvY2tFdmVudCgpXG5cdHNlYXJjaCE6IHN0cmluZztcblxuXHQvKipcblx0ICogRXZlbnQgaGFuZGxlciB0byByZWFjdCB0byB0aGUgZmlsdGVyQ2hhbmdlIGV2ZW50IG9mIHRoZSBGaWx0ZXJCYXJcblx0ICovXG5cdEBibG9ja0V2ZW50KClcblx0ZmlsdGVyQ2hhbmdlZCE6IHN0cmluZztcblxuXHQvKipcblx0ICogRXZlbnQgaGFuZGxlciB0byByZWFjdCB0byB0aGUgc3RhdGVDaGFuZ2UgZXZlbnQgb2YgdGhlIEZpbHRlckJhci5cblx0ICovXG5cdEBibG9ja0V2ZW50KClcblx0c3RhdGVDaGFuZ2UhOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIEV2ZW50IGhhbmRsZXIgdG8gcmVhY3QgdG8gdGhlIGZpbHRlckNoYW5nZWQgZXZlbnQgb2YgdGhlIEZpbHRlckJhci4gRXhwb3NlcyBwYXJhbWV0ZXJzIGZyb20gdGhlIE1EQyBmaWx0ZXIgYmFyXG5cdCAqL1xuXHRAYmxvY2tFdmVudCgpXG5cdGludGVybmFsRmlsdGVyQ2hhbmdlZCE6IHN0cmluZztcblxuXHQvKipcblx0ICogRXZlbnQgaGFuZGxlciB0byByZWFjdCB0byB0aGUgc2VhcmNoIGV2ZW50IG9mIHRoZSBGaWx0ZXJCYXIuIEV4cG9zZXMgcGFyYW1ldGVyZXMgZnJvbSB0aGUgTURDIGZpbHRlciBiYXJcblx0ICovXG5cdEBibG9ja0V2ZW50KClcblx0aW50ZXJuYWxTZWFyY2ghOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIEV2ZW50IGhhbmRsZXIgdG8gcmVhY3QgdG8gdGhlIGFmdGVyQ2xlYXIgZXZlbnQgb2YgdGhlIEZpbHRlckJhclxuXHQgKi9cblx0QGJsb2NrRXZlbnQoKVxuXHRhZnRlckNsZWFyITogc3RyaW5nO1xuXG5cdEBibG9ja0FnZ3JlZ2F0aW9uKHtcblx0XHR0eXBlOiBcInNhcC5mZS5tYWNyb3MuRmlsdGVyRmllbGRcIixcblx0XHRpc1B1YmxpYzogdHJ1ZSxcblx0XHRoYXNWaXJ0dWFsTm9kZTogdHJ1ZSxcblx0XHRwcm9jZXNzQWdncmVnYXRpb25zOiBzZXRDdXN0b21GaWx0ZXJGaWVsZFByb3BlcnRpZXNcblx0fSlcblx0ZmlsdGVyRmllbGRzITogRmlsdGVyRmllbGQ7XG5cblx0X2FwaUlkOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cdF9jb250ZW50SWQ6IHN0cmluZyB8IHVuZGVmaW5lZDtcblx0X3ZhbHVlSGVscHM6IEFycmF5PHN0cmluZz4gfCBcIlwiIHwgdW5kZWZpbmVkO1xuXHRfZmlsdGVyRmllbGRzOiBBcnJheTxzdHJpbmc+IHwgXCJcIiB8IHVuZGVmaW5lZDtcblxuXHRjb25zdHJ1Y3RvcihvUHJvcHM6IFByb3BlcnRpZXNPZjxGaWx0ZXJCYXJCdWlsZGluZ0Jsb2NrPiwgY29uZmlndXJhdGlvbjogYW55LCBtU2V0dGluZ3M6IGFueSkge1xuXHRcdHN1cGVyKG9Qcm9wcywgY29uZmlndXJhdGlvbiwgbVNldHRpbmdzKTtcblx0XHRjb25zdCBvQ29udGV4dCA9IG9Qcm9wcy5jb250ZXh0UGF0aDtcblx0XHRjb25zdCBvTWV0YVBhdGhDb250ZXh0ID0gb1Byb3BzLm1ldGFQYXRoO1xuXHRcdGlmICghb01ldGFQYXRoQ29udGV4dCkge1xuXHRcdFx0TG9nLmVycm9yKFwiQ29udGV4dCBQYXRoIG5vdCBhdmFpbGFibGUgZm9yIEZpbHRlckJhciBNYWNyby5cIik7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGNvbnN0IHNNZXRhUGF0aCA9IG9NZXRhUGF0aENvbnRleHQ/LmdldFBhdGgoKTtcblx0XHRsZXQgZW50aXR5VHlwZVBhdGggPSBcIlwiO1xuXHRcdGNvbnN0IG1ldGFQYXRoUGFydHMgPSBzTWV0YVBhdGg/LnNwbGl0KFwiL0Bjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5TZWxlY3Rpb25GaWVsZHNcIikgfHwgW107IC8vIFswXTogZW50aXR5VHlwZVBhdGgsIFsxXTogU0YgUXVhbGlmaWVyLlxuXHRcdGlmIChtZXRhUGF0aFBhcnRzLmxlbmd0aCA+IDApIHtcblx0XHRcdGVudGl0eVR5cGVQYXRoID0gdGhpcy5nZXRFbnRpdHlUeXBlUGF0aChtZXRhUGF0aFBhcnRzKTtcblx0XHR9XG5cdFx0Y29uc3Qgc0VudGl0eVNldFBhdGggPSBNb2RlbEhlbHBlci5nZXRFbnRpdHlTZXRQYXRoKGVudGl0eVR5cGVQYXRoKTtcblx0XHRjb25zdCBvTWV0YU1vZGVsID0gb0NvbnRleHQ/LmdldE1vZGVsKCk7XG5cdFx0dGhpcy5faW50ZXJuYWxDb250ZXh0UGF0aCA9IG9NZXRhTW9kZWw/LmNyZWF0ZUJpbmRpbmdDb250ZXh0KGVudGl0eVR5cGVQYXRoKSBhcyBWNENvbnRleHQ7XG5cdFx0Y29uc3Qgc09iamVjdFBhdGggPSBcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5TZWxlY3Rpb25GaWVsZHNcIjtcblx0XHRjb25zdCBhbm5vdGF0aW9uUGF0aDogc3RyaW5nID0gXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuU2VsZWN0aW9uRmllbGRzXCIgKyAoKG1ldGFQYXRoUGFydHMubGVuZ3RoICYmIG1ldGFQYXRoUGFydHNbMV0pIHx8IFwiXCIpO1xuXHRcdGNvbnN0IG9FeHRyYVBhcmFtczogYW55ID0ge307XG5cdFx0b0V4dHJhUGFyYW1zW3NPYmplY3RQYXRoXSA9IHtcblx0XHRcdGZpbHRlckZpZWxkczogb1Byb3BzLmZpbHRlckZpZWxkc1xuXHRcdH07XG5cdFx0Y29uc3Qgb1Zpc3VhbGl6YXRpb25PYmplY3RQYXRoID0gZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKHRoaXMuX2ludGVybmFsQ29udGV4dFBhdGgpO1xuXHRcdGNvbnN0IG9Db252ZXJ0ZXJDb250ZXh0ID0gdGhpcy5nZXRDb252ZXJ0ZXJDb250ZXh0KG9WaXN1YWxpemF0aW9uT2JqZWN0UGF0aCwgdW5kZWZpbmVkLCBtU2V0dGluZ3MsIG9FeHRyYVBhcmFtcyk7XG5cdFx0aWYgKCFvUHJvcHMucHJvcGVydHlJbmZvKSB7XG5cdFx0XHR0aGlzLnByb3BlcnR5SW5mbyA9IGdldFNlbGVjdGlvbkZpZWxkcyhvQ29udmVydGVyQ29udGV4dCwgW10sIGFubm90YXRpb25QYXRoKS5zUHJvcGVydHlJbmZvO1xuXHRcdH1cblxuXHRcdC8vRmlsdGVyIEZpZWxkcyBhbmQgdmFsdWVzIHRvIHRoZSBmaWVsZCBhcmUgZmlsbGVkIGJhc2VkIG9uIHRoZSBzZWxlY3Rpb25GaWVsZHMgYW5kIHRoaXMgd291bGQgYmUgZW1wdHkgaW4gY2FzZSBvZiBtYWNybyBvdXRzaWRlIHRoZSBGRSB0ZW1wbGF0ZVxuXHRcdGlmICghb1Byb3BzLnNlbGVjdGlvbkZpZWxkcykge1xuXHRcdFx0Y29uc3Qgb1NlbGVjdGlvbkZpZWxkcyA9IGdldFNlbGVjdGlvbkZpZWxkcyhvQ29udmVydGVyQ29udGV4dCwgW10sIGFubm90YXRpb25QYXRoKS5zZWxlY3Rpb25GaWVsZHM7XG5cdFx0XHR0aGlzLnNlbGVjdGlvbkZpZWxkcyA9IG5ldyBUZW1wbGF0ZU1vZGVsKG9TZWxlY3Rpb25GaWVsZHMsIG9NZXRhTW9kZWwgYXMgT0RhdGFNZXRhTW9kZWwpLmNyZWF0ZUJpbmRpbmdDb250ZXh0KFwiL1wiKTtcblx0XHRcdGNvbnN0IG9FbnRpdHlUeXBlID0gb0NvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZSgpLFxuXHRcdFx0XHRvU2VsZWN0aW9uVmFyaWFudCA9IGdldFNlbGVjdGlvblZhcmlhbnQob0VudGl0eVR5cGUsIG9Db252ZXJ0ZXJDb250ZXh0KSxcblx0XHRcdFx0b0VudGl0eVNldENvbnRleHQgPSAob01ldGFNb2RlbCBhcyBPRGF0YU1ldGFNb2RlbCkuZ2V0Q29udGV4dChzRW50aXR5U2V0UGF0aCksXG5cdFx0XHRcdG9GaWx0ZXJDb25kaXRpb25zID0gZ2V0RmlsdGVyQ29uZGl0aW9ucyhvRW50aXR5U2V0Q29udGV4dCwgeyBzZWxlY3Rpb25WYXJpYW50OiBvU2VsZWN0aW9uVmFyaWFudCB9KTtcblx0XHRcdHRoaXMuZmlsdGVyQ29uZGl0aW9ucyA9IG9GaWx0ZXJDb25kaXRpb25zO1xuXHRcdH1cblx0XHR0aGlzLl9wcm9jZXNzUHJvcGVydHlJbmZvcyh0aGlzLnByb3BlcnR5SW5mbyk7XG5cblx0XHRjb25zdCB0YXJnZXREYXRhTW9kZWxPYmplY3QgPSBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMob0NvbnRleHQgYXMgQ29udGV4dCkudGFyZ2V0T2JqZWN0O1xuXHRcdGlmICh0YXJnZXREYXRhTW9kZWxPYmplY3QuYW5ub3RhdGlvbnM/LkNvbW1vbj8uRHJhZnRSb290IHx8IHRhcmdldERhdGFNb2RlbE9iamVjdC5hbm5vdGF0aW9ucz8uQ29tbW9uPy5EcmFmdE5vZGUpIHtcblx0XHRcdHRoaXMuc2hvd0RyYWZ0RWRpdFN0YXRlID0gdHJ1ZTtcblx0XHRcdHRoaXMuY2hlY2tJZkNvbGxhYm9yYXRpb25EcmFmdFN1cHBvcnRlZChvTWV0YU1vZGVsIGFzIE9EYXRhTWV0YU1vZGVsKTtcblx0XHR9XG5cblx0XHRpZiAob1Byb3BzLl9hcHBseUlkVG9Db250ZW50KSB7XG5cdFx0XHR0aGlzLl9hcGlJZCA9IG9Qcm9wcy5pZCArIFwiOjpGaWx0ZXJCYXJcIjtcblx0XHRcdHRoaXMuX2NvbnRlbnRJZCA9IG9Qcm9wcy5pZDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5fYXBpSWQgPSBvUHJvcHMuaWQ7XG5cdFx0XHR0aGlzLl9jb250ZW50SWQgPSB0aGlzLmdldENvbnRlbnRJZChvUHJvcHMuaWQgKyBcIlwiKTtcblx0XHR9XG5cblx0XHRpZiAob1Byb3BzLmhpZGVCYXNpY1NlYXJjaCAhPT0gdHJ1ZSkge1xuXHRcdFx0Y29uc3Qgb1NlYXJjaFJlc3RyaWN0aW9uQW5ub3RhdGlvbiA9IENvbW1vblV0aWxzLmdldFNlYXJjaFJlc3RyaWN0aW9ucyhzRW50aXR5U2V0UGF0aCwgb01ldGFNb2RlbCBhcyBPRGF0YU1ldGFNb2RlbCk7XG5cdFx0XHR0aGlzLmhpZGVCYXNpY1NlYXJjaCA9IEJvb2xlYW4ob1NlYXJjaFJlc3RyaWN0aW9uQW5ub3RhdGlvbiAmJiAhb1NlYXJjaFJlc3RyaWN0aW9uQW5ub3RhdGlvbi5TZWFyY2hhYmxlKTtcblx0XHR9XG5cdFx0dGhpcy5wcm9jZXNzU2VsZWN0aW9uRmllbGRzKCk7XG5cdH1cblxuXHRnZXRDb250ZW50SWQoc01hY3JvSWQ6IHN0cmluZykge1xuXHRcdHJldHVybiBgJHtzTWFjcm9JZH0tY29udGVudGA7XG5cdH1cblxuXHRfcHJvY2Vzc1Byb3BlcnR5SW5mb3MocHJvcGVydHlJbmZvOiBzdHJpbmcpIHtcblx0XHRjb25zdCBhUGFyYW1ldGVyRmllbGRzOiBzdHJpbmdbXSA9IFtdO1xuXHRcdGlmIChwcm9wZXJ0eUluZm8pIHtcblx0XHRcdGNvbnN0IHNGZXRjaGVkUHJvcGVydGllcyA9IHByb3BlcnR5SW5mby5yZXBsYWNlKC9cXFxcey9nLCBcIntcIikucmVwbGFjZSgvXFxcXH0vZywgXCJ9XCIpO1xuXHRcdFx0Y29uc3QgYUZldGNoZWRQcm9wZXJ0aWVzID0gSlNPTi5wYXJzZShzRmV0Y2hlZFByb3BlcnRpZXMpO1xuXHRcdFx0YUZldGNoZWRQcm9wZXJ0aWVzLmZvckVhY2goZnVuY3Rpb24gKHByb3BJbmZvOiBQcm9wZXJ0eUluZm8pIHtcblx0XHRcdFx0aWYgKHByb3BJbmZvLmlzUGFyYW1ldGVyKSB7XG5cdFx0XHRcdFx0YVBhcmFtZXRlckZpZWxkcy5wdXNoKHByb3BJbmZvLm5hbWUpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChwcm9wSW5mby5wYXRoID09PSBcIiRlZGl0U3RhdGVcIikge1xuXHRcdFx0XHRcdHByb3BJbmZvLmxhYmVsID0gUmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiRklMVEVSQkFSX0VESVRJTkdfU1RBVFVTXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0dGhpcy5wcm9wZXJ0eUluZm8gPSBKU09OLnN0cmluZ2lmeShhRmV0Y2hlZFByb3BlcnRpZXMpLnJlcGxhY2UoL1xcey9nLCBcIlxcXFx7XCIpLnJlcGxhY2UoL1xcfS9nLCBcIlxcXFx9XCIpO1xuXHRcdH1cblx0XHR0aGlzLl9wYXJhbWV0ZXJzID0gSlNPTi5zdHJpbmdpZnkoYVBhcmFtZXRlckZpZWxkcyk7XG5cdH1cblxuXHRjaGVja0lmQ29sbGFib3JhdGlvbkRyYWZ0U3VwcG9ydGVkID0gKG9NZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsIHwgdW5kZWZpbmVkKSA9PiB7XG5cdFx0aWYgKE1vZGVsSGVscGVyLmlzQ29sbGFib3JhdGlvbkRyYWZ0U3VwcG9ydGVkKG9NZXRhTW9kZWwpKSB7XG5cdFx0XHR0aGlzLmlzRHJhZnRDb2xsYWJvcmF0aXZlID0gdHJ1ZTtcblx0XHR9XG5cdH07XG5cblx0Z2V0RW50aXR5VHlwZVBhdGggPSAobWV0YVBhdGhQYXJ0czogc3RyaW5nW10pID0+IHtcblx0XHRyZXR1cm4gbWV0YVBhdGhQYXJ0c1swXS5lbmRzV2l0aChcIi9cIikgPyBtZXRhUGF0aFBhcnRzWzBdIDogbWV0YVBhdGhQYXJ0c1swXSArIFwiL1wiO1xuXHR9O1xuXG5cdGdldFNlYXJjaCA9ICgpID0+IHtcblx0XHRpZiAoIXRoaXMuaGlkZUJhc2ljU2VhcmNoKSB7XG5cdFx0XHRyZXR1cm4geG1sYDxjb250cm9sOmJhc2ljU2VhcmNoRmllbGQ+XG5cdFx0XHQ8bWRjOkZpbHRlckZpZWxkXG5cdFx0XHRcdGlkPVwiJHtnZW5lcmF0ZShbdGhpcy5pZCwgXCJCYXNpY1NlYXJjaEZpZWxkXCJdKX1cIlxuXHRcdFx0XHRwbGFjZWhvbGRlcj1cIntzYXAuZmUuaTE4bj5NX0ZJTFRFUkJBUl9TRUFSQ0h9XCJcblx0XHRcdFx0Y29uZGl0aW9ucz1cInskZmlsdGVycz4vY29uZGl0aW9ucy8kc2VhcmNofVwiXG5cdFx0XHRcdGRhdGFUeXBlPVwic2FwLnVpLm1vZGVsLm9kYXRhLnR5cGUuU3RyaW5nXCJcblx0XHRcdFx0bWF4Q29uZGl0aW9ucz1cIjFcIlxuXHRcdFx0Lz5cblx0XHQ8L2NvbnRyb2w6YmFzaWNTZWFyY2hGaWVsZD5gO1xuXHRcdH1cblx0XHRyZXR1cm4geG1sYGA7XG5cdH07XG5cblx0cHJvY2Vzc1NlbGVjdGlvbkZpZWxkcyA9ICgpID0+IHtcblx0XHRsZXQgZHJhZnRFZGl0U3RhdGUgPSB4bWxgYDtcblx0XHRpZiAodGhpcy5zaG93RHJhZnRFZGl0U3RhdGUpIHtcblx0XHRcdGRyYWZ0RWRpdFN0YXRlID0gYDxjb3JlOkZyYWdtZW50IGZyYWdtZW50TmFtZT1cInNhcC5mZS5tYWNyb3MuZmlsdGVyLkRyYWZ0RWRpdFN0YXRlXCIgdHlwZT1cIlhNTFwiIC8+YDtcblx0XHR9XG5cdFx0dGhpcy5fdmFsdWVIZWxwcyA9IFtdO1xuXHRcdHRoaXMuX2ZpbHRlckZpZWxkcyA9IFtdO1xuXHRcdHRoaXMuX2ZpbHRlckZpZWxkcz8ucHVzaChkcmFmdEVkaXRTdGF0ZSk7XG5cdFx0aWYgKCFBcnJheS5pc0FycmF5KHRoaXMuc2VsZWN0aW9uRmllbGRzKSkge1xuXHRcdFx0dGhpcy5zZWxlY3Rpb25GaWVsZHMgPSAodGhpcy5zZWxlY3Rpb25GaWVsZHMgYXMgVjRDb250ZXh0KS5nZXRPYmplY3QoKTtcblx0XHR9XG5cdFx0dGhpcy5zZWxlY3Rpb25GaWVsZHM/LmZvckVhY2goKHNlbGVjdGlvbkZpZWxkOiBhbnksIHNlbGVjdGlvbkZpZWxkSWR4KSA9PiB7XG5cdFx0XHRpZiAoc2VsZWN0aW9uRmllbGQuYXZhaWxhYmlsaXR5ID09PSBcIkRlZmF1bHRcIikge1xuXHRcdFx0XHR0aGlzLnNldEZpbHRlckZpZWxkc0FuZFZhbHVlSGVscHMoc2VsZWN0aW9uRmllbGQsIHNlbGVjdGlvbkZpZWxkSWR4KTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHR0aGlzLl9maWx0ZXJGaWVsZHMgPSB0aGlzLl9maWx0ZXJGaWVsZHM/Lmxlbmd0aCA+IDAgPyB0aGlzLl9maWx0ZXJGaWVsZHMgOiBcIlwiO1xuXHRcdHRoaXMuX3ZhbHVlSGVscHMgPSB0aGlzLl92YWx1ZUhlbHBzPy5sZW5ndGggPiAwID8gdGhpcy5fdmFsdWVIZWxwcyA6IFwiXCI7XG5cdH07XG5cblx0c2V0RmlsdGVyRmllbGRzQW5kVmFsdWVIZWxwcyA9IChzZWxlY3Rpb25GaWVsZDogYW55LCBzZWxlY3Rpb25GaWVsZElkeDogbnVtYmVyKSA9PiB7XG5cdFx0aWYgKHNlbGVjdGlvbkZpZWxkLnRlbXBsYXRlID09PSB1bmRlZmluZWQgJiYgc2VsZWN0aW9uRmllbGQudHlwZSAhPT0gXCJTbG90XCIpIHtcblx0XHRcdHRoaXMucHVzaEZpbHRlckZpZWxkc0FuZFZhbHVlSGVscHMoc2VsZWN0aW9uRmllbGQpO1xuXHRcdH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheSh0aGlzLl9maWx0ZXJGaWVsZHMpKSB7XG5cdFx0XHR0aGlzLl9maWx0ZXJGaWVsZHM/LnB1c2goXG5cdFx0XHRcdHhtbGA8dGVtcGxhdGU6d2l0aCBwYXRoPVwic2VsZWN0aW9uRmllbGRzPiR7c2VsZWN0aW9uRmllbGRJZHh9XCIgdmFyPVwiaXRlbVwiPlxuXHRcdFx0XHRcdDxjb3JlOkZyYWdtZW50IGZyYWdtZW50TmFtZT1cInNhcC5mZS5tYWNyb3MuZmlsdGVyLkN1c3RvbUZpbHRlclwiIHR5cGU9XCJYTUxcIiAvPlxuXHRcdFx0XHQ8L3RlbXBsYXRlOndpdGg+YFxuXHRcdFx0KTtcblx0XHR9XG5cdH07XG5cblx0X2dldENvbnRleHRQYXRoRm9yRmlsdGVyRmllbGQoc2VsZWN0aW9uRmllbGQ6IGFueSwgZmlsdGVyQmFyQ29udGV4dFBhdGg6IFY0Q29udGV4dCk6IHN0cmluZyB8IFY0Q29udGV4dCB7XG5cdFx0bGV0IGNvbnRleHRQYXRoOiBzdHJpbmcgfCBWNENvbnRleHQgPSBmaWx0ZXJCYXJDb250ZXh0UGF0aDtcblx0XHRpZiAoc2VsZWN0aW9uRmllbGQuaXNQYXJhbWV0ZXIpIHtcblx0XHRcdC8vIEV4YW1wbGU6XG5cdFx0XHQvLyBGaWx0ZXJCYXJDb250ZXh0UGF0aDogL0N1c3RvbWVyL1NldFxuXHRcdFx0Ly8gUGFyYW1ldGVyUHJvcGVydHlQYXRoOiAvQ3VzdG9tZXIvUF9DQ1xuXHRcdFx0Ly8gQ29udGV4dFBhdGhGb3JGaWx0ZXJGaWVsZDogL0N1c3RvbWVyXG5cdFx0XHRjb25zdCBhbm5vUGF0aCA9IHNlbGVjdGlvbkZpZWxkLmFubm90YXRpb25QYXRoO1xuXHRcdFx0Y29udGV4dFBhdGggPSBhbm5vUGF0aC5zdWJzdHJpbmcoMCwgYW5ub1BhdGgubGFzdEluZGV4T2YoXCIvXCIpICsgMSk7XG5cdFx0fVxuXHRcdHJldHVybiBjb250ZXh0UGF0aDtcblx0fVxuXG5cdHB1c2hGaWx0ZXJGaWVsZHNBbmRWYWx1ZUhlbHBzID0gKHNlbGVjdGlvbkZpZWxkOiBhbnkpID0+IHtcblx0XHRpZiAoQXJyYXkuaXNBcnJheSh0aGlzLl9maWx0ZXJGaWVsZHMpKSB7XG5cdFx0XHR0aGlzLl9maWx0ZXJGaWVsZHM/LnB1c2goXG5cdFx0XHRcdHhtbGA8aW50ZXJuYWxNYWNybzpGaWx0ZXJGaWVsZFxuXHRcdFx0aWRQcmVmaXg9XCIke2dlbmVyYXRlKFt0aGlzLmlkLCBcIkZpbHRlckZpZWxkXCIsIENvbW1vbkhlbHBlci5nZXROYXZpZ2F0aW9uUGF0aChzZWxlY3Rpb25GaWVsZC5hbm5vdGF0aW9uUGF0aCldKX1cIlxuXHRcdFx0dmhJZFByZWZpeD1cIiR7Z2VuZXJhdGUoW3RoaXMuaWQsIFwiRmlsdGVyRmllbGRWYWx1ZUhlbHBcIl0pfVwiXG5cdFx0XHRwcm9wZXJ0eT1cIiR7c2VsZWN0aW9uRmllbGQuYW5ub3RhdGlvblBhdGh9XCJcblx0XHRcdGNvbnRleHRQYXRoPVwiJHt0aGlzLl9nZXRDb250ZXh0UGF0aEZvckZpbHRlckZpZWxkKHNlbGVjdGlvbkZpZWxkLCB0aGlzLl9pbnRlcm5hbENvbnRleHRQYXRoKX1cIlxuXHRcdFx0dXNlU2VtYW50aWNEYXRlUmFuZ2U9XCIke3RoaXMudXNlU2VtYW50aWNEYXRlUmFuZ2V9XCJcblx0XHRcdHNldHRpbmdzPVwiJHtDb21tb25IZWxwZXIuc3RyaW5naWZ5Q3VzdG9tRGF0YShzZWxlY3Rpb25GaWVsZC5zZXR0aW5ncyl9XCJcblx0XHRcdHZpc3VhbEZpbHRlcj1cIiR7c2VsZWN0aW9uRmllbGQudmlzdWFsRmlsdGVyfVwiXG5cdFx0XHQvPmBcblx0XHRcdCk7XG5cdFx0fVxuXHRcdGlmIChBcnJheS5pc0FycmF5KHRoaXMuX3ZhbHVlSGVscHMpKSB7XG5cdFx0XHR0aGlzLl92YWx1ZUhlbHBzPy5wdXNoKFxuXHRcdFx0XHR4bWxgPG1hY3JvOlZhbHVlSGVscFxuXHRcdFx0aWRQcmVmaXg9XCIke2dlbmVyYXRlKFt0aGlzLmlkLCBcIkZpbHRlckZpZWxkVmFsdWVIZWxwXCJdKX1cIlxuXHRcdFx0Y29uZGl0aW9uTW9kZWw9XCIkZmlsdGVyc1wiXG5cdFx0XHRwcm9wZXJ0eT1cIiR7c2VsZWN0aW9uRmllbGQuYW5ub3RhdGlvblBhdGh9XCJcblx0XHRcdGNvbnRleHRQYXRoPVwiJHt0aGlzLl9nZXRDb250ZXh0UGF0aEZvckZpbHRlckZpZWxkKHNlbGVjdGlvbkZpZWxkLCB0aGlzLl9pbnRlcm5hbENvbnRleHRQYXRoKX1cIlxuXHRcdFx0ZmlsdGVyRmllbGRWYWx1ZUhlbHA9XCJ0cnVlXCJcblx0XHRcdHVzZVNlbWFudGljRGF0ZVJhbmdlPVwiJHt0aGlzLnVzZVNlbWFudGljRGF0ZVJhbmdlfVwiXG5cdFx0Lz5gXG5cdFx0XHQpO1xuXHRcdH1cblx0fTtcblxuXHRnZXRUZW1wbGF0ZSgpIHtcblx0XHRjb25zdCBpbnRlcm5hbENvbnRleHRQYXRoID0gdGhpcy5faW50ZXJuYWxDb250ZXh0UGF0aD8uZ2V0UGF0aCgpO1xuXHRcdGxldCBmaWx0ZXJEZWxlZ2F0ZSA9IFwiXCI7XG5cdFx0aWYgKHRoaXMuZmlsdGVyQmFyRGVsZWdhdGUpIHtcblx0XHRcdGZpbHRlckRlbGVnYXRlID0gdGhpcy5maWx0ZXJCYXJEZWxlZ2F0ZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0ZmlsdGVyRGVsZWdhdGUgPSBcIntuYW1lOidzYXAvZmUvbWFjcm9zL2ZpbHRlckJhci9GaWx0ZXJCYXJEZWxlZ2F0ZScsIHBheWxvYWQ6IHtlbnRpdHlUeXBlUGF0aDogJ1wiICsgaW50ZXJuYWxDb250ZXh0UGF0aCArIFwiJ319XCI7XG5cdFx0fVxuXHRcdHJldHVybiB4bWxgPG1hY3JvRmlsdGVyQmFyOkZpbHRlckJhckFQSVxuICAgICAgICB4bWxuczp0ZW1wbGF0ZT1cImh0dHA6Ly9zY2hlbWFzLnNhcC5jb20vc2FwdWk1L2V4dGVuc2lvbi9zYXAudWkuY29yZS50ZW1wbGF0ZS8xXCJcbiAgICAgICAgeG1sbnM6Y29yZT1cInNhcC51aS5jb3JlXCJcbiAgICAgICAgeG1sbnM6bWRjPVwic2FwLnVpLm1kY1wiXG4gICAgICAgIHhtbG5zOmNvbnRyb2w9XCJzYXAuZmUuY29yZS5jb250cm9sc1wiXG4gICAgICAgIHhtbG5zOm1hY3JvRmlsdGVyQmFyPVwic2FwLmZlLm1hY3Jvcy5maWx0ZXJCYXJcIlxuICAgICAgICB4bWxuczptYWNybz1cInNhcC5mZS5tYWNyb3NcIlxuICAgICAgICB4bWxuczppbnRlcm5hbE1hY3JvPVwic2FwLmZlLm1hY3Jvcy5pbnRlcm5hbFwiXG4gICAgICAgIHhtbG5zOmN1c3RvbURhdGE9XCJodHRwOi8vc2NoZW1hcy5zYXAuY29tL3NhcHVpNS9leHRlbnNpb24vc2FwLnVpLmNvcmUuQ3VzdG9tRGF0YS8xXCJcblx0XHRpZD1cIiR7dGhpcy5fYXBpSWR9XCJcblx0XHRzZWFyY2g9XCIke3RoaXMuc2VhcmNofVwiXG5cdFx0ZmlsdGVyQ2hhbmdlZD1cIiR7dGhpcy5maWx0ZXJDaGFuZ2VkfVwiXG5cdFx0YWZ0ZXJDbGVhcj1cIiR7dGhpcy5hZnRlckNsZWFyfVwiXG5cdFx0aW50ZXJuYWxTZWFyY2g9XCIke3RoaXMuaW50ZXJuYWxTZWFyY2h9XCJcblx0XHRpbnRlcm5hbEZpbHRlckNoYW5nZWQ9XCIke3RoaXMuaW50ZXJuYWxGaWx0ZXJDaGFuZ2VkfVwiXG5cdFx0c3RhdGVDaGFuZ2U9XCIke3RoaXMuc3RhdGVDaGFuZ2V9XCJcblx0PlxuXHRcdDxjb250cm9sOkZpbHRlckJhclxuXHRcdFx0Y29yZTpyZXF1aXJlPVwie0FQSTogJ3NhcC9mZS9tYWNyb3MvZmlsdGVyQmFyL0ZpbHRlckJhckFQSSd9XCJcblx0XHRcdGlkPVwiJHt0aGlzLl9jb250ZW50SWR9XCJcblx0XHRcdGxpdmVNb2RlPVwiJHt0aGlzLmxpdmVNb2RlfVwiXG5cdFx0XHRkZWxlZ2F0ZT1cIiR7ZmlsdGVyRGVsZWdhdGV9XCJcblx0XHRcdHZhcmlhbnRCYWNrcmVmZXJlbmNlPVwiJHt0aGlzLnZhcmlhbnRCYWNrcmVmZXJlbmNlfVwiXG5cdFx0XHRzaG93QWRhcHRGaWx0ZXJzQnV0dG9uPVwiJHt0aGlzLnNob3dBZGFwdEZpbHRlcnNCdXR0b259XCJcblx0XHRcdHNob3dDbGVhckJ1dHRvbj1cIiR7dGhpcy5zaG93Q2xlYXJCdXR0b259XCJcblx0XHRcdHAxM25Nb2RlPVwiJHt0aGlzLnAxM25Nb2RlfVwiXG5cdFx0XHRzZWFyY2g9XCJBUEkuaGFuZGxlU2VhcmNoKCRldmVudClcIlxuXHRcdFx0ZmlsdGVyc0NoYW5nZWQ9XCJBUEkuaGFuZGxlRmlsdGVyQ2hhbmdlZCgkZXZlbnQpXCJcblx0XHRcdGZpbHRlckNvbmRpdGlvbnM9XCIke3RoaXMuZmlsdGVyQ29uZGl0aW9uc31cIlxuXHRcdFx0c3VzcGVuZFNlbGVjdGlvbj1cIiR7dGhpcy5zdXNwZW5kU2VsZWN0aW9ufVwiXG5cdFx0XHRzaG93TWVzc2FnZXM9XCIke3RoaXMuc2hvd01lc3NhZ2VzfVwiXG5cdFx0XHR0b2dnbGVDb250cm9sPVwiJHt0aGlzLnRvZ2dsZUNvbnRyb2xJZH1cIlxuXHRcdFx0aW5pdGlhbExheW91dD1cIiR7dGhpcy5pbml0aWFsTGF5b3V0fVwiXG5cdFx0XHRwcm9wZXJ0eUluZm89XCIke3RoaXMucHJvcGVydHlJbmZvfVwiXG5cdFx0XHRjdXN0b21EYXRhOmxvY2FsSWQ9XCIke3RoaXMuaWR9XCJcblx0XHRcdHZpc2libGU9XCIke3RoaXMudmlzaWJsZX1cIlxuXHRcdFx0Y3VzdG9tRGF0YTpoaWRlQmFzaWNTZWFyY2g9XCIke3RoaXMuaGlkZUJhc2ljU2VhcmNofVwiXG5cdFx0XHRjdXN0b21EYXRhOnNob3dEcmFmdEVkaXRTdGF0ZT1cIiR7dGhpcy5zaG93RHJhZnRFZGl0U3RhdGV9XCJcblx0XHRcdGN1c3RvbURhdGE6dXNlU2VtYW50aWNEYXRlUmFuZ2U9XCIke3RoaXMudXNlU2VtYW50aWNEYXRlUmFuZ2V9XCJcblx0XHRcdGN1c3RvbURhdGE6ZW50aXR5VHlwZT1cIiR7aW50ZXJuYWxDb250ZXh0UGF0aH1cIlxuXHRcdFx0Y3VzdG9tRGF0YTpwYXJhbWV0ZXJzPVwiJHt0aGlzLl9wYXJhbWV0ZXJzfVwiXG5cdFx0PlxuXHRcdFx0PGNvbnRyb2w6ZGVwZW5kZW50cz5cblx0XHRcdFx0JHt0aGlzLl92YWx1ZUhlbHBzfVxuXHRcdFx0PC9jb250cm9sOmRlcGVuZGVudHM+XG5cdFx0XHQke3RoaXMuZ2V0U2VhcmNoKCl9XG5cdFx0XHQ8Y29udHJvbDpmaWx0ZXJJdGVtcz5cblx0XHRcdFx0JHt0aGlzLl9maWx0ZXJGaWVsZHN9XG5cdFx0XHQ8L2NvbnRyb2w6ZmlsdGVySXRlbXM+XG5cdFx0PC9jb250cm9sOkZpbHRlckJhcj5cblx0PC9tYWNyb0ZpbHRlckJhcjpGaWx0ZXJCYXJBUEk+YDtcblx0fVxufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQXVEQSxNQUFNQSw4QkFB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