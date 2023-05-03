/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/converters/controls/Common/DataVisualization", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/templating/DataModelPathHelper", "sap/fe/macros/internal/helpers/TableTemplating", "sap/fe/macros/MacroMetadata"], function (Log, CommonUtils, DataVisualization, MetaModelConverter, StableIdHelper, DataModelPathHelper, TableTemplating, MacroMetadata) {
  "use strict";

  var buildExpressionForHeaderVisible = TableTemplating.buildExpressionForHeaderVisible;
  var getContextRelativeTargetObjectPath = DataModelPathHelper.getContextRelativeTargetObjectPath;
  var generate = StableIdHelper.generate;
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  var getVisualizationsFromPresentationVariant = DataVisualization.getVisualizationsFromPresentationVariant;
  var getDataVisualizationConfiguration = DataVisualization.getDataVisualizationConfiguration;
  /**
   * @classdesc
   * Building block used to create a table based on the metadata provided by OData V4.
   *
   * Usage example:
   * <pre>
   * &lt;macro:Table
   *   id="someID"
   *   type="ResponsiveTable"
   *   collection="collection",
   *   presentation="presentation"
   *   selectionMode="Multi"
   *   requestGroupId="$auto.test"
   *   displayMode="false"
   *   personalization="Column,Sort"
   * /&gt;
   * </pre>
   * @class sap.fe.macros.Table
   * @hideconstructor
   * @private
   * @experimental
   */
  const Table = MacroMetadata.extend("sap.fe.macros.table.Table", {
    /**
     * Name of the macro control.
     */
    name: "Table",
    /**
     * Namespace of the macro control
     */
    namespace: "sap.fe.macros.internal",
    publicNamespace: "sap.fe.macros",
    /**
     * Fragment source of the macro (optional) - if not set, fragment is generated from namespace and name
     */
    fragment: "sap.fe.macros.table.Table",
    /**
     * The metadata describing the macro control.
     */
    metadata: {
      /**
       * Define macro stereotype for documentation
       */
      stereotype: "xmlmacro",
      /**
       * Properties.
       */
      properties: {
        tableDefinition: {
          type: "sap.ui.model.Context"
        },
        metaPath: {
          type: "sap.ui.model.Context",
          isPublic: true
        },
        contextPath: {
          type: "sap.ui.model.Context",
          isPublic: true
        },
        /**
         * metadataContext:collection Mandatory context to a collection (entitySet or 1:n navigation)
         */
        collection: {
          type: "sap.ui.model.Context",
          required: true,
          $kind: ["EntitySet", "NavigationProperty", "Singleton"]
        },
        /**
         * Parent EntitySet for the present collection
         */
        parentEntitySet: {
          type: "sap.ui.model.Context"
        },
        /**
         * ID of the table
         */
        id: {
          type: "string",
          isPublic: true
        },
        _apiId: {
          type: "string"
        },
        /**
         * Used for binding the table to a navigation path. Only the path is used for binding rows.
         */
        navigationPath: {
          type: "string"
        },
        /**
         * Specifies whether the table should be read-only or not.
         */
        readOnly: {
          type: "boolean",
          isPublic: true
        },
        fieldMode: {
          type: "string",
          defaultValue: "",
          allowedValues: ["", "nowrapper"]
        },
        /**
         * Specifies whether the button is hidden when no data has been entered yet in the row (true/false). The default setting is `false`.
         */
        disableAddRowButtonForEmptyData: {
          type: "boolean"
        },
        /**
         * Specifies the full path and function name of a custom validation function.
         */
        customValidationFunction: {
          type: "string"
        },
        /**
         * Specifies whether the table is displayed with condensed layout (true/false). The default setting is `false`.
         */
        useCondensedTableLayout: {
          type: "boolean"
        },
        /**
         * Specifies the possible actions available on the table row (Navigation,null). The default setting is `undefined`
         */
        rowAction: {
          type: "string",
          defaultValue: undefined
        },
        /**
         * Specifies the selection mode (None,Single,Multi,Auto)
         */
        selectionMode: {
          type: "string",
          isPublic: true
        },
        /**
         * The `busy` mode of table
         */
        busy: {
          type: "boolean",
          isPublic: true
        },
        /**
         * Parameter used to show the fullScreen button on the table.
         */
        enableFullScreen: {
          type: "boolean",
          isPublic: true
        },
        /**
         * Specifies header text that is shown in table.
         */
        header: {
          type: "string",
          isPublic: true
        },
        /**
         * Controls if the header text should be shown or not
         */
        headerVisible: {
          type: "boolean",
          isPublic: true
        },
        /**
         * Defines the "aria-level" of the table header
         */
        headerLevel: {
          type: "sap.ui.core.TitleLevel",
          defaultValue: "Auto",
          isPublic: true
        },
        /**
         * Parameter which sets the noDataText for the mdc table
         */
        noDataText: {
          type: "string"
        },
        /**
         * Creation Mode to be passed to the onCreate hanlder. Values: ["Inline", "NewPage"]
         */
        creationMode: {
          type: "string"
        },
        /**
         * Setting to determine if the new row should be created at the end or beginning
         */
        createAtEnd: {
          type: "boolean"
        },
        createOutbound: {
          type: "string"
        },
        createOutboundDetail: {
          type: "string"
        },
        createNewAction: {
          type: "string"
        },
        /**
         * Personalization Mode
         */
        personalization: {
          type: "string|boolean",
          isPublic: true
        },
        isSearchable: {
          type: "boolean",
          isPublic: true
        },
        /**
         * Allows to choose the Table type. Allowed values are `ResponsiveTable` or `GridTable`.
         */
        type: {
          type: "string",
          isPublic: true
        },
        tableType: {
          type: "string"
        },
        /**
         * Enable export to file
         */
        enableExport: {
          type: "boolean",
          isPublic: true
        },
        /**
         * Enable export to file
         */
        enablePaste: {
          type: "boolean",
          isPublic: true
        },
        /**
         * ONLY FOR GRID TABLE: Number of indices which can be selected in a range. If set to 0, the selection limit is disabled, and the Select All checkbox appears instead of the Deselect All button.
         */
        selectionLimit: {
          type: "string"
        },
        /**
         * ONLY FOR RESPONSIVE TABLE: Setting to define the checkbox in the column header: Allowed values are `Default` or `ClearAll`. If set to `Default`, the sap.m.Table control renders the Select All checkbox, otherwise the Deselect All button is rendered.
         */
        multiSelectMode: {
          type: "string"
        },
        /**
         * The control ID of the FilterBar that is used to filter the rows of the table.
         */
        filterBar: {
          type: "string",
          isPublic: true
        },
        /**
         * The control ID of the FilterBar that is used internally to filter the rows of the table.
         */
        filterBarId: {
          type: "string"
        },
        tableDelegate: {
          type: "string"
        },
        enableAutoScroll: {
          type: "boolean"
        },
        visible: {
          type: "string"
        },
        isAlp: {
          type: "boolean",
          defaultValue: false
        },
        variantManagement: {
          type: "string",
          isPublic: true
        },
        columnEditMode: {
          type: "string",
          computed: true
        },
        tabTitle: {
          type: "string",
          defaultValue: ""
        },
        isOptimizedForSmallDevice: {
          type: "boolean"
        },
        enableAutoColumnWidth: {
          type: "boolean"
        },
        dataStateIndicatorFilter: {
          type: "string"
        },
        isCompactType: {
          type: "boolean"
        }
      },
      events: {
        variantSaved: {
          type: "function"
        },
        variantSelected: {
          type: "function"
        },
        /**
         * Event handler for change event
         */
        onChange: {
          type: "function"
        },
        /**
         * Event handler to react when the user chooses a row
         */
        rowPress: {
          type: "function",
          isPublic: true
        },
        /**
         * Event handler to react to the contextChange event of the table.
         */
        onContextChange: {
          type: "function"
        },
        /**
         * Event handler called when the user chooses an option of the segmented button in the ALP View
         */
        onSegmentedButtonPressed: {
          type: "function"
        },
        /**
         * Event handler to react to the stateChange event of the table.
         */
        stateChange: {
          type: "function"
        },
        /**
         * Event handler to react when the table selection changes
         */
        selectionChange: {
          type: "function",
          isPublic: true
        }
      },
      aggregations: {
        actions: {
          type: "sap.fe.macros.internal.table.Action | sap.fe.macros.internal.table.ActionGroup",
          isPublic: true
        },
        columns: {
          type: "sap.fe.macros.internal.table.Column",
          isPublic: true
        }
      }
    },
    create: function (oProps, oControlConfiguration, mSettings, oAggregations) {
      let oTableDefinition;
      const oContextObjectPath = getInvolvedDataModelObjects(oProps.metaPath, oProps.contextPath);
      if (!oProps.tableDefinition) {
        const initialConverterContext = this.getConverterContext(oContextObjectPath, oProps.contextPath, mSettings);
        const sVisualizationPath = this._getVisualizationPath(oContextObjectPath, initialConverterContext);
        const sPresentationPath = this._getPresentationPath(oContextObjectPath);

        //Check if we have ActionGroup and add nested actions
        const oExtraActions = this._buildActions(oAggregations.actions);
        const oExtraColumns = this.parseAggregation(oAggregations.columns, function (childColumn, columnChildIdx) {
          var _childColumn$children;
          const columnKey = childColumn.getAttribute("key") || "InlineXMLColumn_" + columnChildIdx;
          oAggregations[columnKey] = childColumn;
          return {
            // Defaults are to be defined in Table.ts
            key: columnKey,
            type: "Slot",
            width: childColumn.getAttribute("width"),
            importance: childColumn.getAttribute("importance"),
            horizontalAlign: childColumn.getAttribute("horizontalAlign"),
            availability: childColumn.getAttribute("availability"),
            header: childColumn.getAttribute("header"),
            template: ((_childColumn$children = childColumn.children[0]) === null || _childColumn$children === void 0 ? void 0 : _childColumn$children.outerHTML) || "",
            properties: childColumn.getAttribute("properties") ? childColumn.getAttribute("properties").split(",") : undefined,
            position: {
              placement: childColumn.getAttribute("positionPlacement"),
              anchor: childColumn.getAttribute("positionAnchor")
            }
          };
        });
        const oExtraParams = {};
        let mTableSettings = {
          enableExport: oProps.enableExport,
          enableFullScreen: oProps.enableFullScreen,
          enablePaste: oProps.enablePaste,
          selectionMode: oProps.selectionMode,
          type: oProps.type
        };
        //removes undefined values from mTableSettings
        mTableSettings = JSON.parse(JSON.stringify(mTableSettings));
        oExtraParams[sVisualizationPath] = {
          actions: oExtraActions,
          columns: oExtraColumns,
          tableSettings: mTableSettings
        };
        const oConverterContext = this.getConverterContext(oContextObjectPath, oProps.contextPath, mSettings, oExtraParams);
        const oVisualizationDefinition = getDataVisualizationConfiguration(sVisualizationPath, oProps.useCondensedLayout, oConverterContext, undefined, undefined, sPresentationPath, true);
        oTableDefinition = oVisualizationDefinition.visualizations[0];
        oProps.tableDefinition = this.createBindingContext(oTableDefinition, mSettings);
      } else {
        oTableDefinition = oProps.tableDefinition.getObject();
      }
      oTableDefinition.path = "{_pageModel>" + oProps.tableDefinition.getPath() + "}";
      // public properties processed by converter context
      this.setDefaultValue(oProps, "selectionMode", oTableDefinition.annotation.selectionMode, true);
      this.setDefaultValue(oProps, "enableFullScreen", oTableDefinition.control.enableFullScreen, true);
      this.setDefaultValue(oProps, "enableExport", oTableDefinition.control.enableExport, true);
      this.setDefaultValue(oProps, "enablePaste", oTableDefinition.annotation.standardActions.actions.paste.enabled, true);
      this.setDefaultValue(oProps, "updatablePropertyPath", oTableDefinition.annotation.standardActions.updatablePropertyPath, true);
      this.setDefaultValue(oProps, "type", oTableDefinition.control.type, true);
      this.setDefaultValue(oProps, "useCondensedTableLayout", oTableDefinition.control.useCondensedTableLayout);
      this.setDefaultValue(oProps, "disableAddRowButtonForEmptyData", oTableDefinition.control.disableAddRowButtonForEmptyData);
      this.setDefaultValue(oProps, "customValidationFunction", oTableDefinition.control.customValidationFunction);
      this.setDefaultValue(oProps, "headerVisible", oTableDefinition.control.headerVisible);
      this.setDefaultValue(oProps, "searchable", oTableDefinition.annotation.searchable);
      this.setDefaultValue(oProps, "showRowCount", oTableDefinition.control.showRowCount);
      this.setDefaultValue(oProps, "inlineCreationRowCount", oTableDefinition.control.inlineCreationRowCount);
      this.setDefaultValue(oProps, "header", oTableDefinition.annotation.title);
      this.setDefaultValue(oProps, "selectionLimit", oTableDefinition.control.selectionLimit);
      this.setDefaultValue(oProps, "isCompactType", oTableDefinition.control.isCompactType);
      this.setDefaultValue(oProps, "inlineCreationRowsHiddenInEditMode", oTableDefinition.annotation.inlineCreationRowsHiddenInEditMode);
      if (oProps.id) {
        // The given ID shall be assigned to the TableAPI and not to the MDC Table
        oProps._apiId = oProps.id;
        oProps.id = this.getContentId(oProps.id);
      } else {
        // We generate the ID. Due to compatibility reasons we keep it on the MDC Table but provide assign
        // the ID with a ::Table suffix to the TableAPI
        this.setDefaultValue(oProps, "id", oTableDefinition.annotation.id);
        oProps._apiId = oTableDefinition.annotation.id + "::Table";
      }
      this.setDefaultValue(oProps, "creationMode", oTableDefinition.annotation.create.mode);
      this.setDefaultValue(oProps, "createAtEnd", oTableDefinition.annotation.create.append);
      this.setDefaultValue(oProps, "createOutbound", oTableDefinition.annotation.create.outbound);
      this.setDefaultValue(oProps, "createNewAction", oTableDefinition.annotation.create.newAction);
      this.setDefaultValue(oProps, "createOutboundDetail", oTableDefinition.annotation.create.outboundDetail);
      this.setDefaultValue(oProps, "personalization", oTableDefinition.annotation.p13nMode);
      this.setDefaultValue(oProps, "variantManagement", oTableDefinition.annotation.variantManagement);
      this.setDefaultValue(oProps, "enableAutoColumnWidth", true);
      this.setDefaultValue(oProps, "dataStateIndicatorFilter", oTableDefinition.control.dataStateIndicatorFilter);
      this.setDefaultValue(oProps, "isOptimizedForSmallDevice", CommonUtils.isSmallDevice());
      // Special code for readOnly
      // readonly = false -> Force editable
      // readonly = true -> Force display mode
      // readonly = undefined -> Bound to edit flow

      switch (oProps.readOnly) {
        case "false":
          oProps.readOnly = false;
          break;
        case "true":
          oProps.readOnly = true;
          break;
        default:
      }
      switch (oProps.enableAutoColumnWidth) {
        case "false":
          oProps.enableAutoColumnWidth = false;
          break;
        case "true":
          oProps.enableAutoColumnWidth = true;
          break;
        default:
      }
      if (oProps.readOnly === undefined && oTableDefinition.annotation.displayMode === true) {
        oProps.readOnly = true;
      }
      if (oProps.rowPress) {
        oProps.rowAction = "Navigation";
      }
      this.setDefaultValue(oProps, "rowPress", oTableDefinition.annotation.row.press);
      this.setDefaultValue(oProps, "rowAction", oTableDefinition.annotation.row.action);
      if (oProps.personalization === "false") {
        oProps.personalization = undefined;
      } else if (oProps.personalization === "true") {
        oProps.personalization = "Sort,Column,Filter";
      }
      switch (oProps.personalization) {
        case "false":
          oProps.personalization = undefined;
          break;
        case "true":
          oProps.personalization = "Sort,Column,Filter";
          break;
        default:
      }
      if (oProps.isSearchable === "false") {
        oProps.searchable = false;
      } else {
        oProps.searchable = oTableDefinition.annotation.searchable;
      }
      let useBasicSearch = false;

      // Note for the 'filterBar' property:
      // 1. ID relative to the view of the Table.
      // 2. Absolute ID.
      // 3. ID would be considered in association to TableAPI's ID.
      if (!oProps.filterBar && !oProps.filterBarId && oProps.searchable) {
        // filterBar: Public property for building blocks
        // filterBarId: Only used as Internal private property for FE templates
        oProps.filterBarId = generate([oProps.id, "StandardAction", "BasicSearch"]);
        useBasicSearch = true;
      }
      // Internal properties
      oProps.useBasicSearch = useBasicSearch;
      oProps.tableType = oProps.type;
      oProps.showCreate = oTableDefinition.annotation.standardActions.actions.create.visible || true;
      oProps.autoBindOnInit = oTableDefinition.annotation.autoBindOnInit;

      // Internal that I want to remove in the end
      oProps.navigationPath = oTableDefinition.annotation.navigationPath; // oTableDefinition.annotation.collection; //DataModelPathHelper.getContextRelativeTargetObjectPath(oContextObjectPath); //
      if (oTableDefinition.annotation.collection.startsWith("/") && oContextObjectPath.startingEntitySet._type === "Singleton") {
        oTableDefinition.annotation.collection = oProps.navigationPath;
      }
      oProps.parentEntitySet = mSettings.models.metaModel.createBindingContext("/" + (oContextObjectPath.contextLocation.targetEntitySet ? oContextObjectPath.contextLocation.targetEntitySet.name : oContextObjectPath.startingEntitySet.name));
      oProps.collection = mSettings.models.metaModel.createBindingContext(oTableDefinition.annotation.collection);
      switch (oProps.readOnly) {
        case true:
          oProps.columnEditMode = "Display";
          break;
        case false:
          oProps.columnEditMode = "Editable";
          break;
        default:
          oProps.columnEditMode = undefined;
      }
      // Regarding the remaining ones that I think we could review
      // selectedContextsModel -> potentially hardcoded or internal only
      // onContextChange -> Autoscroll ... might need revision
      // onChange -> Just proxied down to the Field may need to see if needed or not
      // variantSelected / variantSaved -> Variant Management standard helpers ?
      // tableDelegate  -> used externally for ALP ... might need to see if relevant still
      // onSegmentedButtonPressed -> ALP specific, should be a dedicated control for the contentViewSwitcher
      // visible -> related to this ALP contentViewSwitcher... maybe an outer control would make more sense ?

      oProps.headerBindingExpression = buildExpressionForHeaderVisible(oProps);
      return oProps;
    },
    /**
     * Build actions and action groups for table visualisation.
     *
     * @param oActions XML node corresponding to actions
     * @returns Prepared actions
     */
    _buildActions: function (oActions) {
      const oExtraActions = {};
      if (oActions && oActions.children.length > 0) {
        const actions = Array.prototype.slice.apply(oActions.children);
        let actionIdx = 0;
        actions.forEach(function (act) {
          actionIdx++;
          let menuActions = [];
          if (act.children.length && act.localName === "ActionGroup" && act.namespaceURI === "sap.fe.macros") {
            const actionsToAdd = Array.prototype.slice.apply(act.children);
            actionsToAdd.forEach(function (actToAdd) {
              const actionKeyAdd = actToAdd.getAttribute("key") || "InlineXMLAction_" + actionIdx;
              const curOutObject = {
                key: actionKeyAdd,
                text: actToAdd.getAttribute("text"),
                __noWrap: true,
                press: actToAdd.getAttribute("press"),
                requiresSelection: actToAdd.getAttribute("requiresSelection") === "true",
                enabled: actToAdd.getAttribute("enabled") === null ? true : actToAdd.getAttribute("enabled")
              };
              oExtraActions[curOutObject.key] = curOutObject;
              actionIdx++;
            });
            menuActions = Object.values(oExtraActions).slice(-act.children.length).map(function (menuItem) {
              return menuItem.key;
            });
          }
          const actionKey = act.getAttribute("key") || "InlineXMLAction_" + actionIdx;
          const actObject = {
            key: actionKey,
            text: act.getAttribute("text"),
            position: {
              placement: act.getAttribute("placement"),
              anchor: act.getAttribute("anchor")
            },
            __noWrap: true,
            press: act.getAttribute("press"),
            requiresSelection: act.getAttribute("requiresSelection") === "true",
            enabled: act.getAttribute("enabled") === null ? true : act.getAttribute("enabled"),
            menu: menuActions.length ? menuActions : null
          };
          oExtraActions[actObject.key] = actObject;
        });
      }
      return oExtraActions;
    },
    /**
     * Returns the annotation path pointing to the visualization annotation (LineItem).
     *
     * @param contextObjectPath The datamodel object path for the table
     * @param converterContext The converter context
     * @returns The annotation path
     */
    _getVisualizationPath: function (contextObjectPath, converterContext) {
      const metaPath = getContextRelativeTargetObjectPath(contextObjectPath);
      if (contextObjectPath.targetObject.term === "com.sap.vocabularies.UI.v1.LineItem") {
        return metaPath; // MetaPath is already pointing to a LineItem
      }
      //Need to switch to the context related the PV or SPV
      const resolvedTarget = converterContext.getEntityTypeAnnotation(metaPath);
      let visualizations = [];
      switch (contextObjectPath.targetObject.term) {
        case "com.sap.vocabularies.UI.v1.SelectionPresentationVariant":
          if (contextObjectPath.targetObject.PresentationVariant) {
            visualizations = getVisualizationsFromPresentationVariant(contextObjectPath.targetObject.PresentationVariant, metaPath, resolvedTarget.converterContext, true);
          }
          break;
        case "com.sap.vocabularies.UI.v1.PresentationVariant":
          visualizations = getVisualizationsFromPresentationVariant(contextObjectPath.targetObject, metaPath, resolvedTarget.converterContext, true);
          break;
        default:
          Log.error(`Bad metapath parameter for table : ${contextObjectPath.targetObject.term}`);
      }
      const lineItemViz = visualizations.find(viz => {
        return viz.visualization.term === "com.sap.vocabularies.UI.v1.LineItem";
      });
      if (lineItemViz) {
        return lineItemViz.annotationPath;
      } else {
        return metaPath; // Fallback
      }
    },

    _getPresentationPath: function (oContextObjectPath) {
      let presentationPath;
      switch (oContextObjectPath.targetObject.term) {
        case "com.sap.vocabularies.UI.v1.PresentationVariant":
          presentationPath = getContextRelativeTargetObjectPath(oContextObjectPath);
          break;
        case "com.sap.vocabularies.UI.v1.SelectionPresentationVariant":
          presentationPath = getContextRelativeTargetObjectPath(oContextObjectPath) + "/PresentationVariant";
          break;
        default:
          presentationPath = null;
      }
      return presentationPath;
    }
  });
  return Table;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUYWJsZSIsIk1hY3JvTWV0YWRhdGEiLCJleHRlbmQiLCJuYW1lIiwibmFtZXNwYWNlIiwicHVibGljTmFtZXNwYWNlIiwiZnJhZ21lbnQiLCJtZXRhZGF0YSIsInN0ZXJlb3R5cGUiLCJwcm9wZXJ0aWVzIiwidGFibGVEZWZpbml0aW9uIiwidHlwZSIsIm1ldGFQYXRoIiwiaXNQdWJsaWMiLCJjb250ZXh0UGF0aCIsImNvbGxlY3Rpb24iLCJyZXF1aXJlZCIsIiRraW5kIiwicGFyZW50RW50aXR5U2V0IiwiaWQiLCJfYXBpSWQiLCJuYXZpZ2F0aW9uUGF0aCIsInJlYWRPbmx5IiwiZmllbGRNb2RlIiwiZGVmYXVsdFZhbHVlIiwiYWxsb3dlZFZhbHVlcyIsImRpc2FibGVBZGRSb3dCdXR0b25Gb3JFbXB0eURhdGEiLCJjdXN0b21WYWxpZGF0aW9uRnVuY3Rpb24iLCJ1c2VDb25kZW5zZWRUYWJsZUxheW91dCIsInJvd0FjdGlvbiIsInVuZGVmaW5lZCIsInNlbGVjdGlvbk1vZGUiLCJidXN5IiwiZW5hYmxlRnVsbFNjcmVlbiIsImhlYWRlciIsImhlYWRlclZpc2libGUiLCJoZWFkZXJMZXZlbCIsIm5vRGF0YVRleHQiLCJjcmVhdGlvbk1vZGUiLCJjcmVhdGVBdEVuZCIsImNyZWF0ZU91dGJvdW5kIiwiY3JlYXRlT3V0Ym91bmREZXRhaWwiLCJjcmVhdGVOZXdBY3Rpb24iLCJwZXJzb25hbGl6YXRpb24iLCJpc1NlYXJjaGFibGUiLCJ0YWJsZVR5cGUiLCJlbmFibGVFeHBvcnQiLCJlbmFibGVQYXN0ZSIsInNlbGVjdGlvbkxpbWl0IiwibXVsdGlTZWxlY3RNb2RlIiwiZmlsdGVyQmFyIiwiZmlsdGVyQmFySWQiLCJ0YWJsZURlbGVnYXRlIiwiZW5hYmxlQXV0b1Njcm9sbCIsInZpc2libGUiLCJpc0FscCIsInZhcmlhbnRNYW5hZ2VtZW50IiwiY29sdW1uRWRpdE1vZGUiLCJjb21wdXRlZCIsInRhYlRpdGxlIiwiaXNPcHRpbWl6ZWRGb3JTbWFsbERldmljZSIsImVuYWJsZUF1dG9Db2x1bW5XaWR0aCIsImRhdGFTdGF0ZUluZGljYXRvckZpbHRlciIsImlzQ29tcGFjdFR5cGUiLCJldmVudHMiLCJ2YXJpYW50U2F2ZWQiLCJ2YXJpYW50U2VsZWN0ZWQiLCJvbkNoYW5nZSIsInJvd1ByZXNzIiwib25Db250ZXh0Q2hhbmdlIiwib25TZWdtZW50ZWRCdXR0b25QcmVzc2VkIiwic3RhdGVDaGFuZ2UiLCJzZWxlY3Rpb25DaGFuZ2UiLCJhZ2dyZWdhdGlvbnMiLCJhY3Rpb25zIiwiY29sdW1ucyIsImNyZWF0ZSIsIm9Qcm9wcyIsIm9Db250cm9sQ29uZmlndXJhdGlvbiIsIm1TZXR0aW5ncyIsIm9BZ2dyZWdhdGlvbnMiLCJvVGFibGVEZWZpbml0aW9uIiwib0NvbnRleHRPYmplY3RQYXRoIiwiZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzIiwiaW5pdGlhbENvbnZlcnRlckNvbnRleHQiLCJnZXRDb252ZXJ0ZXJDb250ZXh0Iiwic1Zpc3VhbGl6YXRpb25QYXRoIiwiX2dldFZpc3VhbGl6YXRpb25QYXRoIiwic1ByZXNlbnRhdGlvblBhdGgiLCJfZ2V0UHJlc2VudGF0aW9uUGF0aCIsIm9FeHRyYUFjdGlvbnMiLCJfYnVpbGRBY3Rpb25zIiwib0V4dHJhQ29sdW1ucyIsInBhcnNlQWdncmVnYXRpb24iLCJjaGlsZENvbHVtbiIsImNvbHVtbkNoaWxkSWR4IiwiY29sdW1uS2V5IiwiZ2V0QXR0cmlidXRlIiwia2V5Iiwid2lkdGgiLCJpbXBvcnRhbmNlIiwiaG9yaXpvbnRhbEFsaWduIiwiYXZhaWxhYmlsaXR5IiwidGVtcGxhdGUiLCJjaGlsZHJlbiIsIm91dGVySFRNTCIsInNwbGl0IiwicG9zaXRpb24iLCJwbGFjZW1lbnQiLCJhbmNob3IiLCJvRXh0cmFQYXJhbXMiLCJtVGFibGVTZXR0aW5ncyIsIkpTT04iLCJwYXJzZSIsInN0cmluZ2lmeSIsInRhYmxlU2V0dGluZ3MiLCJvQ29udmVydGVyQ29udGV4dCIsIm9WaXN1YWxpemF0aW9uRGVmaW5pdGlvbiIsImdldERhdGFWaXN1YWxpemF0aW9uQ29uZmlndXJhdGlvbiIsInVzZUNvbmRlbnNlZExheW91dCIsInZpc3VhbGl6YXRpb25zIiwiY3JlYXRlQmluZGluZ0NvbnRleHQiLCJnZXRPYmplY3QiLCJwYXRoIiwiZ2V0UGF0aCIsInNldERlZmF1bHRWYWx1ZSIsImFubm90YXRpb24iLCJjb250cm9sIiwic3RhbmRhcmRBY3Rpb25zIiwicGFzdGUiLCJlbmFibGVkIiwidXBkYXRhYmxlUHJvcGVydHlQYXRoIiwic2VhcmNoYWJsZSIsInNob3dSb3dDb3VudCIsImlubGluZUNyZWF0aW9uUm93Q291bnQiLCJ0aXRsZSIsImlubGluZUNyZWF0aW9uUm93c0hpZGRlbkluRWRpdE1vZGUiLCJnZXRDb250ZW50SWQiLCJtb2RlIiwiYXBwZW5kIiwib3V0Ym91bmQiLCJuZXdBY3Rpb24iLCJvdXRib3VuZERldGFpbCIsInAxM25Nb2RlIiwiQ29tbW9uVXRpbHMiLCJpc1NtYWxsRGV2aWNlIiwiZGlzcGxheU1vZGUiLCJyb3ciLCJwcmVzcyIsImFjdGlvbiIsInVzZUJhc2ljU2VhcmNoIiwiZ2VuZXJhdGUiLCJzaG93Q3JlYXRlIiwiYXV0b0JpbmRPbkluaXQiLCJzdGFydHNXaXRoIiwic3RhcnRpbmdFbnRpdHlTZXQiLCJfdHlwZSIsIm1vZGVscyIsIm1ldGFNb2RlbCIsImNvbnRleHRMb2NhdGlvbiIsInRhcmdldEVudGl0eVNldCIsImhlYWRlckJpbmRpbmdFeHByZXNzaW9uIiwiYnVpbGRFeHByZXNzaW9uRm9ySGVhZGVyVmlzaWJsZSIsIm9BY3Rpb25zIiwibGVuZ3RoIiwiQXJyYXkiLCJwcm90b3R5cGUiLCJzbGljZSIsImFwcGx5IiwiYWN0aW9uSWR4IiwiZm9yRWFjaCIsImFjdCIsIm1lbnVBY3Rpb25zIiwibG9jYWxOYW1lIiwibmFtZXNwYWNlVVJJIiwiYWN0aW9uc1RvQWRkIiwiYWN0VG9BZGQiLCJhY3Rpb25LZXlBZGQiLCJjdXJPdXRPYmplY3QiLCJ0ZXh0IiwiX19ub1dyYXAiLCJyZXF1aXJlc1NlbGVjdGlvbiIsIk9iamVjdCIsInZhbHVlcyIsIm1hcCIsIm1lbnVJdGVtIiwiYWN0aW9uS2V5IiwiYWN0T2JqZWN0IiwibWVudSIsImNvbnRleHRPYmplY3RQYXRoIiwiY29udmVydGVyQ29udGV4dCIsImdldENvbnRleHRSZWxhdGl2ZVRhcmdldE9iamVjdFBhdGgiLCJ0YXJnZXRPYmplY3QiLCJ0ZXJtIiwicmVzb2x2ZWRUYXJnZXQiLCJnZXRFbnRpdHlUeXBlQW5ub3RhdGlvbiIsIlByZXNlbnRhdGlvblZhcmlhbnQiLCJnZXRWaXN1YWxpemF0aW9uc0Zyb21QcmVzZW50YXRpb25WYXJpYW50IiwiTG9nIiwiZXJyb3IiLCJsaW5lSXRlbVZpeiIsImZpbmQiLCJ2aXoiLCJ2aXN1YWxpemF0aW9uIiwiYW5ub3RhdGlvblBhdGgiLCJwcmVzZW50YXRpb25QYXRoIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJUYWJsZS5tZXRhZGF0YS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBVSUFubm90YXRpb25UZXJtcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlcIjtcbmltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IENvbW1vblV0aWxzIGZyb20gXCJzYXAvZmUvY29yZS9Db21tb25VdGlsc1wiO1xuaW1wb3J0IHR5cGUgeyBWaXN1YWxpemF0aW9uQW5kUGF0aCB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0NvbW1vbi9EYXRhVmlzdWFsaXphdGlvblwiO1xuaW1wb3J0IHtcblx0Z2V0RGF0YVZpc3VhbGl6YXRpb25Db25maWd1cmF0aW9uLFxuXHRnZXRWaXN1YWxpemF0aW9uc0Zyb21QcmVzZW50YXRpb25WYXJpYW50XG59IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0NvbW1vbi9EYXRhVmlzdWFsaXphdGlvblwiO1xuaW1wb3J0IHR5cGUgQ29udmVydGVyQ29udGV4dCBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9Db252ZXJ0ZXJDb250ZXh0XCI7XG5pbXBvcnQgeyBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9NZXRhTW9kZWxDb252ZXJ0ZXJcIjtcbmltcG9ydCB7IGdlbmVyYXRlIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvU3RhYmxlSWRIZWxwZXJcIjtcbmltcG9ydCB0eXBlIHsgRGF0YU1vZGVsT2JqZWN0UGF0aCB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL0RhdGFNb2RlbFBhdGhIZWxwZXJcIjtcbmltcG9ydCB7IGdldENvbnRleHRSZWxhdGl2ZVRhcmdldE9iamVjdFBhdGggfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9EYXRhTW9kZWxQYXRoSGVscGVyXCI7XG5pbXBvcnQgeyBidWlsZEV4cHJlc3Npb25Gb3JIZWFkZXJWaXNpYmxlIH0gZnJvbSBcInNhcC9mZS9tYWNyb3MvaW50ZXJuYWwvaGVscGVycy9UYWJsZVRlbXBsYXRpbmdcIjtcbmltcG9ydCBNYWNyb01ldGFkYXRhIGZyb20gXCJzYXAvZmUvbWFjcm9zL01hY3JvTWV0YWRhdGFcIjtcblxuLyoqXG4gKiBAY2xhc3NkZXNjXG4gKiBCdWlsZGluZyBibG9jayB1c2VkIHRvIGNyZWF0ZSBhIHRhYmxlIGJhc2VkIG9uIHRoZSBtZXRhZGF0YSBwcm92aWRlZCBieSBPRGF0YSBWNC5cbiAqXG4gKiBVc2FnZSBleGFtcGxlOlxuICogPHByZT5cbiAqICZsdDttYWNybzpUYWJsZVxuICogICBpZD1cInNvbWVJRFwiXG4gKiAgIHR5cGU9XCJSZXNwb25zaXZlVGFibGVcIlxuICogICBjb2xsZWN0aW9uPVwiY29sbGVjdGlvblwiLFxuICogICBwcmVzZW50YXRpb249XCJwcmVzZW50YXRpb25cIlxuICogICBzZWxlY3Rpb25Nb2RlPVwiTXVsdGlcIlxuICogICByZXF1ZXN0R3JvdXBJZD1cIiRhdXRvLnRlc3RcIlxuICogICBkaXNwbGF5TW9kZT1cImZhbHNlXCJcbiAqICAgcGVyc29uYWxpemF0aW9uPVwiQ29sdW1uLFNvcnRcIlxuICogLyZndDtcbiAqIDwvcHJlPlxuICogQGNsYXNzIHNhcC5mZS5tYWNyb3MuVGFibGVcbiAqIEBoaWRlY29uc3RydWN0b3JcbiAqIEBwcml2YXRlXG4gKiBAZXhwZXJpbWVudGFsXG4gKi9cbmNvbnN0IFRhYmxlID0gTWFjcm9NZXRhZGF0YS5leHRlbmQoXCJzYXAuZmUubWFjcm9zLnRhYmxlLlRhYmxlXCIsIHtcblx0LyoqXG5cdCAqIE5hbWUgb2YgdGhlIG1hY3JvIGNvbnRyb2wuXG5cdCAqL1xuXHRuYW1lOiBcIlRhYmxlXCIsXG5cdC8qKlxuXHQgKiBOYW1lc3BhY2Ugb2YgdGhlIG1hY3JvIGNvbnRyb2xcblx0ICovXG5cdG5hbWVzcGFjZTogXCJzYXAuZmUubWFjcm9zLmludGVybmFsXCIsXG5cdHB1YmxpY05hbWVzcGFjZTogXCJzYXAuZmUubWFjcm9zXCIsXG5cdC8qKlxuXHQgKiBGcmFnbWVudCBzb3VyY2Ugb2YgdGhlIG1hY3JvIChvcHRpb25hbCkgLSBpZiBub3Qgc2V0LCBmcmFnbWVudCBpcyBnZW5lcmF0ZWQgZnJvbSBuYW1lc3BhY2UgYW5kIG5hbWVcblx0ICovXG5cdGZyYWdtZW50OiBcInNhcC5mZS5tYWNyb3MudGFibGUuVGFibGVcIixcblx0LyoqXG5cdCAqIFRoZSBtZXRhZGF0YSBkZXNjcmliaW5nIHRoZSBtYWNybyBjb250cm9sLlxuXHQgKi9cblx0bWV0YWRhdGE6IHtcblx0XHQvKipcblx0XHQgKiBEZWZpbmUgbWFjcm8gc3RlcmVvdHlwZSBmb3IgZG9jdW1lbnRhdGlvblxuXHRcdCAqL1xuXHRcdHN0ZXJlb3R5cGU6IFwieG1sbWFjcm9cIixcblx0XHQvKipcblx0XHQgKiBQcm9wZXJ0aWVzLlxuXHRcdCAqL1xuXHRcdHByb3BlcnRpZXM6IHtcblx0XHRcdHRhYmxlRGVmaW5pdGlvbjoge1xuXHRcdFx0XHR0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCJcblx0XHRcdH0sXG5cdFx0XHRtZXRhUGF0aDoge1xuXHRcdFx0XHR0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCIsXG5cdFx0XHRcdGlzUHVibGljOiB0cnVlXG5cdFx0XHR9LFxuXHRcdFx0Y29udGV4dFBhdGg6IHtcblx0XHRcdFx0dHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiLFxuXHRcdFx0XHRpc1B1YmxpYzogdHJ1ZVxuXHRcdFx0fSxcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBtZXRhZGF0YUNvbnRleHQ6Y29sbGVjdGlvbiBNYW5kYXRvcnkgY29udGV4dCB0byBhIGNvbGxlY3Rpb24gKGVudGl0eVNldCBvciAxOm4gbmF2aWdhdGlvbilcblx0XHRcdCAqL1xuXHRcdFx0Y29sbGVjdGlvbjoge1xuXHRcdFx0XHR0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCIsXG5cdFx0XHRcdHJlcXVpcmVkOiB0cnVlLFxuXHRcdFx0XHQka2luZDogW1wiRW50aXR5U2V0XCIsIFwiTmF2aWdhdGlvblByb3BlcnR5XCIsIFwiU2luZ2xldG9uXCJdXG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBQYXJlbnQgRW50aXR5U2V0IGZvciB0aGUgcHJlc2VudCBjb2xsZWN0aW9uXG5cdFx0XHQgKi9cblx0XHRcdHBhcmVudEVudGl0eVNldDoge1xuXHRcdFx0XHR0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCJcblx0XHRcdH0sXG5cblx0XHRcdC8qKlxuXHRcdFx0ICogSUQgb2YgdGhlIHRhYmxlXG5cdFx0XHQgKi9cblx0XHRcdGlkOiB7XG5cdFx0XHRcdHR5cGU6IFwic3RyaW5nXCIsXG5cdFx0XHRcdGlzUHVibGljOiB0cnVlXG5cdFx0XHR9LFxuXHRcdFx0X2FwaUlkOiB7XG5cdFx0XHRcdHR5cGU6IFwic3RyaW5nXCJcblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIFVzZWQgZm9yIGJpbmRpbmcgdGhlIHRhYmxlIHRvIGEgbmF2aWdhdGlvbiBwYXRoLiBPbmx5IHRoZSBwYXRoIGlzIHVzZWQgZm9yIGJpbmRpbmcgcm93cy5cblx0XHRcdCAqL1xuXHRcdFx0bmF2aWdhdGlvblBhdGg6IHtcblx0XHRcdFx0dHlwZTogXCJzdHJpbmdcIlxuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogU3BlY2lmaWVzIHdoZXRoZXIgdGhlIHRhYmxlIHNob3VsZCBiZSByZWFkLW9ubHkgb3Igbm90LlxuXHRcdFx0ICovXG5cdFx0XHRyZWFkT25seToge1xuXHRcdFx0XHR0eXBlOiBcImJvb2xlYW5cIixcblx0XHRcdFx0aXNQdWJsaWM6IHRydWVcblx0XHRcdH0sXG5cdFx0XHRmaWVsZE1vZGU6IHtcblx0XHRcdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHRcdFx0ZGVmYXVsdFZhbHVlOiBcIlwiLFxuXHRcdFx0XHRhbGxvd2VkVmFsdWVzOiBbXCJcIiwgXCJub3dyYXBwZXJcIl1cblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIFNwZWNpZmllcyB3aGV0aGVyIHRoZSBidXR0b24gaXMgaGlkZGVuIHdoZW4gbm8gZGF0YSBoYXMgYmVlbiBlbnRlcmVkIHlldCBpbiB0aGUgcm93ICh0cnVlL2ZhbHNlKS4gVGhlIGRlZmF1bHQgc2V0dGluZyBpcyBgZmFsc2VgLlxuXHRcdFx0ICovXG5cdFx0XHRkaXNhYmxlQWRkUm93QnV0dG9uRm9yRW1wdHlEYXRhOiB7XG5cdFx0XHRcdHR5cGU6IFwiYm9vbGVhblwiXG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBTcGVjaWZpZXMgdGhlIGZ1bGwgcGF0aCBhbmQgZnVuY3Rpb24gbmFtZSBvZiBhIGN1c3RvbSB2YWxpZGF0aW9uIGZ1bmN0aW9uLlxuXHRcdFx0ICovXG5cdFx0XHRjdXN0b21WYWxpZGF0aW9uRnVuY3Rpb246IHtcblx0XHRcdFx0dHlwZTogXCJzdHJpbmdcIlxuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogU3BlY2lmaWVzIHdoZXRoZXIgdGhlIHRhYmxlIGlzIGRpc3BsYXllZCB3aXRoIGNvbmRlbnNlZCBsYXlvdXQgKHRydWUvZmFsc2UpLiBUaGUgZGVmYXVsdCBzZXR0aW5nIGlzIGBmYWxzZWAuXG5cdFx0XHQgKi9cblx0XHRcdHVzZUNvbmRlbnNlZFRhYmxlTGF5b3V0OiB7XG5cdFx0XHRcdHR5cGU6IFwiYm9vbGVhblwiXG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBTcGVjaWZpZXMgdGhlIHBvc3NpYmxlIGFjdGlvbnMgYXZhaWxhYmxlIG9uIHRoZSB0YWJsZSByb3cgKE5hdmlnYXRpb24sbnVsbCkuIFRoZSBkZWZhdWx0IHNldHRpbmcgaXMgYHVuZGVmaW5lZGBcblx0XHRcdCAqL1xuXHRcdFx0cm93QWN0aW9uOiB7XG5cdFx0XHRcdHR5cGU6IFwic3RyaW5nXCIsXG5cdFx0XHRcdGRlZmF1bHRWYWx1ZTogdW5kZWZpbmVkXG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBTcGVjaWZpZXMgdGhlIHNlbGVjdGlvbiBtb2RlIChOb25lLFNpbmdsZSxNdWx0aSxBdXRvKVxuXHRcdFx0ICovXG5cdFx0XHRzZWxlY3Rpb25Nb2RlOiB7XG5cdFx0XHRcdHR5cGU6IFwic3RyaW5nXCIsXG5cdFx0XHRcdGlzUHVibGljOiB0cnVlXG5cdFx0XHR9LFxuXG5cdFx0XHQvKipcblx0XHRcdCAqIFRoZSBgYnVzeWAgbW9kZSBvZiB0YWJsZVxuXHRcdFx0ICovXG5cdFx0XHRidXN5OiB7XG5cdFx0XHRcdHR5cGU6IFwiYm9vbGVhblwiLFxuXHRcdFx0XHRpc1B1YmxpYzogdHJ1ZVxuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogUGFyYW1ldGVyIHVzZWQgdG8gc2hvdyB0aGUgZnVsbFNjcmVlbiBidXR0b24gb24gdGhlIHRhYmxlLlxuXHRcdFx0ICovXG5cdFx0XHRlbmFibGVGdWxsU2NyZWVuOiB7XG5cdFx0XHRcdHR5cGU6IFwiYm9vbGVhblwiLFxuXHRcdFx0XHRpc1B1YmxpYzogdHJ1ZVxuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogU3BlY2lmaWVzIGhlYWRlciB0ZXh0IHRoYXQgaXMgc2hvd24gaW4gdGFibGUuXG5cdFx0XHQgKi9cblx0XHRcdGhlYWRlcjoge1xuXHRcdFx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdFx0XHRpc1B1YmxpYzogdHJ1ZVxuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogQ29udHJvbHMgaWYgdGhlIGhlYWRlciB0ZXh0IHNob3VsZCBiZSBzaG93biBvciBub3Rcblx0XHRcdCAqL1xuXHRcdFx0aGVhZGVyVmlzaWJsZToge1xuXHRcdFx0XHR0eXBlOiBcImJvb2xlYW5cIixcblx0XHRcdFx0aXNQdWJsaWM6IHRydWVcblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIERlZmluZXMgdGhlIFwiYXJpYS1sZXZlbFwiIG9mIHRoZSB0YWJsZSBoZWFkZXJcblx0XHRcdCAqL1xuXHRcdFx0aGVhZGVyTGV2ZWw6IHtcblx0XHRcdFx0dHlwZTogXCJzYXAudWkuY29yZS5UaXRsZUxldmVsXCIsXG5cdFx0XHRcdGRlZmF1bHRWYWx1ZTogXCJBdXRvXCIsXG5cdFx0XHRcdGlzUHVibGljOiB0cnVlXG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBQYXJhbWV0ZXIgd2hpY2ggc2V0cyB0aGUgbm9EYXRhVGV4dCBmb3IgdGhlIG1kYyB0YWJsZVxuXHRcdFx0ICovXG5cdFx0XHRub0RhdGFUZXh0OiB7XG5cdFx0XHRcdHR5cGU6IFwic3RyaW5nXCJcblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIENyZWF0aW9uIE1vZGUgdG8gYmUgcGFzc2VkIHRvIHRoZSBvbkNyZWF0ZSBoYW5sZGVyLiBWYWx1ZXM6IFtcIklubGluZVwiLCBcIk5ld1BhZ2VcIl1cblx0XHRcdCAqL1xuXHRcdFx0Y3JlYXRpb25Nb2RlOiB7XG5cdFx0XHRcdHR5cGU6IFwic3RyaW5nXCJcblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIFNldHRpbmcgdG8gZGV0ZXJtaW5lIGlmIHRoZSBuZXcgcm93IHNob3VsZCBiZSBjcmVhdGVkIGF0IHRoZSBlbmQgb3IgYmVnaW5uaW5nXG5cdFx0XHQgKi9cblx0XHRcdGNyZWF0ZUF0RW5kOiB7XG5cdFx0XHRcdHR5cGU6IFwiYm9vbGVhblwiXG5cdFx0XHR9LFxuXHRcdFx0Y3JlYXRlT3V0Ym91bmQ6IHtcblx0XHRcdFx0dHlwZTogXCJzdHJpbmdcIlxuXHRcdFx0fSxcblx0XHRcdGNyZWF0ZU91dGJvdW5kRGV0YWlsOiB7XG5cdFx0XHRcdHR5cGU6IFwic3RyaW5nXCJcblx0XHRcdH0sXG5cdFx0XHRjcmVhdGVOZXdBY3Rpb246IHtcblx0XHRcdFx0dHlwZTogXCJzdHJpbmdcIlxuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogUGVyc29uYWxpemF0aW9uIE1vZGVcblx0XHRcdCAqL1xuXHRcdFx0cGVyc29uYWxpemF0aW9uOiB7XG5cdFx0XHRcdHR5cGU6IFwic3RyaW5nfGJvb2xlYW5cIixcblx0XHRcdFx0aXNQdWJsaWM6IHRydWVcblx0XHRcdH0sXG5cdFx0XHRpc1NlYXJjaGFibGU6IHtcblx0XHRcdFx0dHlwZTogXCJib29sZWFuXCIsXG5cdFx0XHRcdGlzUHVibGljOiB0cnVlXG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBBbGxvd3MgdG8gY2hvb3NlIHRoZSBUYWJsZSB0eXBlLiBBbGxvd2VkIHZhbHVlcyBhcmUgYFJlc3BvbnNpdmVUYWJsZWAgb3IgYEdyaWRUYWJsZWAuXG5cdFx0XHQgKi9cblx0XHRcdHR5cGU6IHtcblx0XHRcdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHRcdFx0aXNQdWJsaWM6IHRydWVcblx0XHRcdH0sXG5cdFx0XHR0YWJsZVR5cGU6IHtcblx0XHRcdFx0dHlwZTogXCJzdHJpbmdcIlxuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogRW5hYmxlIGV4cG9ydCB0byBmaWxlXG5cdFx0XHQgKi9cblx0XHRcdGVuYWJsZUV4cG9ydDoge1xuXHRcdFx0XHR0eXBlOiBcImJvb2xlYW5cIixcblx0XHRcdFx0aXNQdWJsaWM6IHRydWVcblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIEVuYWJsZSBleHBvcnQgdG8gZmlsZVxuXHRcdFx0ICovXG5cdFx0XHRlbmFibGVQYXN0ZToge1xuXHRcdFx0XHR0eXBlOiBcImJvb2xlYW5cIixcblx0XHRcdFx0aXNQdWJsaWM6IHRydWVcblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIE9OTFkgRk9SIEdSSUQgVEFCTEU6IE51bWJlciBvZiBpbmRpY2VzIHdoaWNoIGNhbiBiZSBzZWxlY3RlZCBpbiBhIHJhbmdlLiBJZiBzZXQgdG8gMCwgdGhlIHNlbGVjdGlvbiBsaW1pdCBpcyBkaXNhYmxlZCwgYW5kIHRoZSBTZWxlY3QgQWxsIGNoZWNrYm94IGFwcGVhcnMgaW5zdGVhZCBvZiB0aGUgRGVzZWxlY3QgQWxsIGJ1dHRvbi5cblx0XHRcdCAqL1xuXHRcdFx0c2VsZWN0aW9uTGltaXQ6IHtcblx0XHRcdFx0dHlwZTogXCJzdHJpbmdcIlxuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogT05MWSBGT1IgUkVTUE9OU0lWRSBUQUJMRTogU2V0dGluZyB0byBkZWZpbmUgdGhlIGNoZWNrYm94IGluIHRoZSBjb2x1bW4gaGVhZGVyOiBBbGxvd2VkIHZhbHVlcyBhcmUgYERlZmF1bHRgIG9yIGBDbGVhckFsbGAuIElmIHNldCB0byBgRGVmYXVsdGAsIHRoZSBzYXAubS5UYWJsZSBjb250cm9sIHJlbmRlcnMgdGhlIFNlbGVjdCBBbGwgY2hlY2tib3gsIG90aGVyd2lzZSB0aGUgRGVzZWxlY3QgQWxsIGJ1dHRvbiBpcyByZW5kZXJlZC5cblx0XHRcdCAqL1xuXHRcdFx0bXVsdGlTZWxlY3RNb2RlOiB7XG5cdFx0XHRcdHR5cGU6IFwic3RyaW5nXCJcblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIFRoZSBjb250cm9sIElEIG9mIHRoZSBGaWx0ZXJCYXIgdGhhdCBpcyB1c2VkIHRvIGZpbHRlciB0aGUgcm93cyBvZiB0aGUgdGFibGUuXG5cdFx0XHQgKi9cblx0XHRcdGZpbHRlckJhcjoge1xuXHRcdFx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdFx0XHRpc1B1YmxpYzogdHJ1ZVxuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogVGhlIGNvbnRyb2wgSUQgb2YgdGhlIEZpbHRlckJhciB0aGF0IGlzIHVzZWQgaW50ZXJuYWxseSB0byBmaWx0ZXIgdGhlIHJvd3Mgb2YgdGhlIHRhYmxlLlxuXHRcdFx0ICovXG5cdFx0XHRmaWx0ZXJCYXJJZDoge1xuXHRcdFx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdFx0XHR9LFxuXHRcdFx0dGFibGVEZWxlZ2F0ZToge1xuXHRcdFx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdFx0XHR9LFxuXHRcdFx0ZW5hYmxlQXV0b1Njcm9sbDoge1xuXHRcdFx0XHR0eXBlOiBcImJvb2xlYW5cIlxuXHRcdFx0fSxcblx0XHRcdHZpc2libGU6IHtcblx0XHRcdFx0dHlwZTogXCJzdHJpbmdcIlxuXHRcdFx0fSxcblx0XHRcdGlzQWxwOiB7XG5cdFx0XHRcdHR5cGU6IFwiYm9vbGVhblwiLFxuXHRcdFx0XHRkZWZhdWx0VmFsdWU6IGZhbHNlXG5cdFx0XHR9LFxuXHRcdFx0dmFyaWFudE1hbmFnZW1lbnQ6IHtcblx0XHRcdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHRcdFx0aXNQdWJsaWM6IHRydWVcblx0XHRcdH0sXG5cdFx0XHRjb2x1bW5FZGl0TW9kZToge1xuXHRcdFx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdFx0XHRjb21wdXRlZDogdHJ1ZVxuXHRcdFx0fSxcblx0XHRcdHRhYlRpdGxlOiB7XG5cdFx0XHRcdHR5cGU6IFwic3RyaW5nXCIsXG5cdFx0XHRcdGRlZmF1bHRWYWx1ZTogXCJcIlxuXHRcdFx0fSxcblx0XHRcdGlzT3B0aW1pemVkRm9yU21hbGxEZXZpY2U6IHtcblx0XHRcdFx0dHlwZTogXCJib29sZWFuXCJcblx0XHRcdH0sXG5cdFx0XHRlbmFibGVBdXRvQ29sdW1uV2lkdGg6IHtcblx0XHRcdFx0dHlwZTogXCJib29sZWFuXCJcblx0XHRcdH0sXG5cdFx0XHRkYXRhU3RhdGVJbmRpY2F0b3JGaWx0ZXI6IHtcblx0XHRcdFx0dHlwZTogXCJzdHJpbmdcIlxuXHRcdFx0fSxcblx0XHRcdGlzQ29tcGFjdFR5cGU6IHtcblx0XHRcdFx0dHlwZTogXCJib29sZWFuXCJcblx0XHRcdH1cblx0XHR9LFxuXHRcdGV2ZW50czoge1xuXHRcdFx0dmFyaWFudFNhdmVkOiB7XG5cdFx0XHRcdHR5cGU6IFwiZnVuY3Rpb25cIlxuXHRcdFx0fSxcblx0XHRcdHZhcmlhbnRTZWxlY3RlZDoge1xuXHRcdFx0XHR0eXBlOiBcImZ1bmN0aW9uXCJcblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIEV2ZW50IGhhbmRsZXIgZm9yIGNoYW5nZSBldmVudFxuXHRcdFx0ICovXG5cdFx0XHRvbkNoYW5nZToge1xuXHRcdFx0XHR0eXBlOiBcImZ1bmN0aW9uXCJcblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIEV2ZW50IGhhbmRsZXIgdG8gcmVhY3Qgd2hlbiB0aGUgdXNlciBjaG9vc2VzIGEgcm93XG5cdFx0XHQgKi9cblx0XHRcdHJvd1ByZXNzOiB7XG5cdFx0XHRcdHR5cGU6IFwiZnVuY3Rpb25cIixcblx0XHRcdFx0aXNQdWJsaWM6IHRydWVcblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIEV2ZW50IGhhbmRsZXIgdG8gcmVhY3QgdG8gdGhlIGNvbnRleHRDaGFuZ2UgZXZlbnQgb2YgdGhlIHRhYmxlLlxuXHRcdFx0ICovXG5cdFx0XHRvbkNvbnRleHRDaGFuZ2U6IHtcblx0XHRcdFx0dHlwZTogXCJmdW5jdGlvblwiXG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBFdmVudCBoYW5kbGVyIGNhbGxlZCB3aGVuIHRoZSB1c2VyIGNob29zZXMgYW4gb3B0aW9uIG9mIHRoZSBzZWdtZW50ZWQgYnV0dG9uIGluIHRoZSBBTFAgVmlld1xuXHRcdFx0ICovXG5cdFx0XHRvblNlZ21lbnRlZEJ1dHRvblByZXNzZWQ6IHtcblx0XHRcdFx0dHlwZTogXCJmdW5jdGlvblwiXG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBFdmVudCBoYW5kbGVyIHRvIHJlYWN0IHRvIHRoZSBzdGF0ZUNoYW5nZSBldmVudCBvZiB0aGUgdGFibGUuXG5cdFx0XHQgKi9cblx0XHRcdHN0YXRlQ2hhbmdlOiB7XG5cdFx0XHRcdHR5cGU6IFwiZnVuY3Rpb25cIlxuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogRXZlbnQgaGFuZGxlciB0byByZWFjdCB3aGVuIHRoZSB0YWJsZSBzZWxlY3Rpb24gY2hhbmdlc1xuXHRcdFx0ICovXG5cdFx0XHRzZWxlY3Rpb25DaGFuZ2U6IHtcblx0XHRcdFx0dHlwZTogXCJmdW5jdGlvblwiLFxuXHRcdFx0XHRpc1B1YmxpYzogdHJ1ZVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0YWdncmVnYXRpb25zOiB7XG5cdFx0XHRhY3Rpb25zOiB7XG5cdFx0XHRcdHR5cGU6IFwic2FwLmZlLm1hY3Jvcy5pbnRlcm5hbC50YWJsZS5BY3Rpb24gfCBzYXAuZmUubWFjcm9zLmludGVybmFsLnRhYmxlLkFjdGlvbkdyb3VwXCIsXG5cdFx0XHRcdGlzUHVibGljOiB0cnVlXG5cdFx0XHR9LFxuXHRcdFx0Y29sdW1uczoge1xuXHRcdFx0XHR0eXBlOiBcInNhcC5mZS5tYWNyb3MuaW50ZXJuYWwudGFibGUuQ29sdW1uXCIsXG5cdFx0XHRcdGlzUHVibGljOiB0cnVlXG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRjcmVhdGU6IGZ1bmN0aW9uIChvUHJvcHM6IGFueSwgb0NvbnRyb2xDb25maWd1cmF0aW9uOiBhbnksIG1TZXR0aW5nczogYW55LCBvQWdncmVnYXRpb25zOiBhbnkpIHtcblx0XHRsZXQgb1RhYmxlRGVmaW5pdGlvbjtcblx0XHRjb25zdCBvQ29udGV4dE9iamVjdFBhdGggPSBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMob1Byb3BzLm1ldGFQYXRoLCBvUHJvcHMuY29udGV4dFBhdGgpO1xuXG5cdFx0aWYgKCFvUHJvcHMudGFibGVEZWZpbml0aW9uKSB7XG5cdFx0XHRjb25zdCBpbml0aWFsQ29udmVydGVyQ29udGV4dCA9IHRoaXMuZ2V0Q29udmVydGVyQ29udGV4dChvQ29udGV4dE9iamVjdFBhdGgsIG9Qcm9wcy5jb250ZXh0UGF0aCwgbVNldHRpbmdzKTtcblx0XHRcdGNvbnN0IHNWaXN1YWxpemF0aW9uUGF0aCA9IHRoaXMuX2dldFZpc3VhbGl6YXRpb25QYXRoKG9Db250ZXh0T2JqZWN0UGF0aCwgaW5pdGlhbENvbnZlcnRlckNvbnRleHQpO1xuXHRcdFx0Y29uc3Qgc1ByZXNlbnRhdGlvblBhdGggPSB0aGlzLl9nZXRQcmVzZW50YXRpb25QYXRoKG9Db250ZXh0T2JqZWN0UGF0aCk7XG5cblx0XHRcdC8vQ2hlY2sgaWYgd2UgaGF2ZSBBY3Rpb25Hcm91cCBhbmQgYWRkIG5lc3RlZCBhY3Rpb25zXG5cdFx0XHRjb25zdCBvRXh0cmFBY3Rpb25zID0gdGhpcy5fYnVpbGRBY3Rpb25zKG9BZ2dyZWdhdGlvbnMuYWN0aW9ucyk7XG5cblx0XHRcdGNvbnN0IG9FeHRyYUNvbHVtbnMgPSB0aGlzLnBhcnNlQWdncmVnYXRpb24ob0FnZ3JlZ2F0aW9ucy5jb2x1bW5zLCBmdW5jdGlvbiAoY2hpbGRDb2x1bW46IGFueSwgY29sdW1uQ2hpbGRJZHg6IG51bWJlcikge1xuXHRcdFx0XHRjb25zdCBjb2x1bW5LZXkgPSBjaGlsZENvbHVtbi5nZXRBdHRyaWJ1dGUoXCJrZXlcIikgfHwgXCJJbmxpbmVYTUxDb2x1bW5fXCIgKyBjb2x1bW5DaGlsZElkeDtcblx0XHRcdFx0b0FnZ3JlZ2F0aW9uc1tjb2x1bW5LZXldID0gY2hpbGRDb2x1bW47XG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0Ly8gRGVmYXVsdHMgYXJlIHRvIGJlIGRlZmluZWQgaW4gVGFibGUudHNcblx0XHRcdFx0XHRrZXk6IGNvbHVtbktleSxcblx0XHRcdFx0XHR0eXBlOiBcIlNsb3RcIixcblx0XHRcdFx0XHR3aWR0aDogY2hpbGRDb2x1bW4uZ2V0QXR0cmlidXRlKFwid2lkdGhcIiksXG5cdFx0XHRcdFx0aW1wb3J0YW5jZTogY2hpbGRDb2x1bW4uZ2V0QXR0cmlidXRlKFwiaW1wb3J0YW5jZVwiKSxcblx0XHRcdFx0XHRob3Jpem9udGFsQWxpZ246IGNoaWxkQ29sdW1uLmdldEF0dHJpYnV0ZShcImhvcml6b250YWxBbGlnblwiKSxcblx0XHRcdFx0XHRhdmFpbGFiaWxpdHk6IGNoaWxkQ29sdW1uLmdldEF0dHJpYnV0ZShcImF2YWlsYWJpbGl0eVwiKSxcblx0XHRcdFx0XHRoZWFkZXI6IGNoaWxkQ29sdW1uLmdldEF0dHJpYnV0ZShcImhlYWRlclwiKSxcblx0XHRcdFx0XHR0ZW1wbGF0ZTogY2hpbGRDb2x1bW4uY2hpbGRyZW5bMF0/Lm91dGVySFRNTCB8fCBcIlwiLFxuXHRcdFx0XHRcdHByb3BlcnRpZXM6IGNoaWxkQ29sdW1uLmdldEF0dHJpYnV0ZShcInByb3BlcnRpZXNcIikgPyBjaGlsZENvbHVtbi5nZXRBdHRyaWJ1dGUoXCJwcm9wZXJ0aWVzXCIpLnNwbGl0KFwiLFwiKSA6IHVuZGVmaW5lZCxcblx0XHRcdFx0XHRwb3NpdGlvbjoge1xuXHRcdFx0XHRcdFx0cGxhY2VtZW50OiBjaGlsZENvbHVtbi5nZXRBdHRyaWJ1dGUoXCJwb3NpdGlvblBsYWNlbWVudFwiKSxcblx0XHRcdFx0XHRcdGFuY2hvcjogY2hpbGRDb2x1bW4uZ2V0QXR0cmlidXRlKFwicG9zaXRpb25BbmNob3JcIilcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH07XG5cdFx0XHR9KTtcblx0XHRcdGNvbnN0IG9FeHRyYVBhcmFtczogYW55ID0ge307XG5cdFx0XHRsZXQgbVRhYmxlU2V0dGluZ3MgPSB7XG5cdFx0XHRcdGVuYWJsZUV4cG9ydDogb1Byb3BzLmVuYWJsZUV4cG9ydCxcblx0XHRcdFx0ZW5hYmxlRnVsbFNjcmVlbjogb1Byb3BzLmVuYWJsZUZ1bGxTY3JlZW4sXG5cdFx0XHRcdGVuYWJsZVBhc3RlOiBvUHJvcHMuZW5hYmxlUGFzdGUsXG5cdFx0XHRcdHNlbGVjdGlvbk1vZGU6IG9Qcm9wcy5zZWxlY3Rpb25Nb2RlLFxuXHRcdFx0XHR0eXBlOiBvUHJvcHMudHlwZVxuXHRcdFx0fTtcblx0XHRcdC8vcmVtb3ZlcyB1bmRlZmluZWQgdmFsdWVzIGZyb20gbVRhYmxlU2V0dGluZ3Ncblx0XHRcdG1UYWJsZVNldHRpbmdzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShtVGFibGVTZXR0aW5ncykpO1xuXG5cdFx0XHRvRXh0cmFQYXJhbXNbc1Zpc3VhbGl6YXRpb25QYXRoXSA9IHtcblx0XHRcdFx0YWN0aW9uczogb0V4dHJhQWN0aW9ucyxcblx0XHRcdFx0Y29sdW1uczogb0V4dHJhQ29sdW1ucyxcblx0XHRcdFx0dGFibGVTZXR0aW5nczogbVRhYmxlU2V0dGluZ3Ncblx0XHRcdH07XG5cdFx0XHRjb25zdCBvQ29udmVydGVyQ29udGV4dCA9IHRoaXMuZ2V0Q29udmVydGVyQ29udGV4dChvQ29udGV4dE9iamVjdFBhdGgsIG9Qcm9wcy5jb250ZXh0UGF0aCwgbVNldHRpbmdzLCBvRXh0cmFQYXJhbXMpO1xuXG5cdFx0XHRjb25zdCBvVmlzdWFsaXphdGlvbkRlZmluaXRpb24gPSBnZXREYXRhVmlzdWFsaXphdGlvbkNvbmZpZ3VyYXRpb24oXG5cdFx0XHRcdHNWaXN1YWxpemF0aW9uUGF0aCxcblx0XHRcdFx0b1Byb3BzLnVzZUNvbmRlbnNlZExheW91dCxcblx0XHRcdFx0b0NvbnZlcnRlckNvbnRleHQsXG5cdFx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0XHRzUHJlc2VudGF0aW9uUGF0aCxcblx0XHRcdFx0dHJ1ZVxuXHRcdFx0KTtcblx0XHRcdG9UYWJsZURlZmluaXRpb24gPSBvVmlzdWFsaXphdGlvbkRlZmluaXRpb24udmlzdWFsaXphdGlvbnNbMF07XG5cblx0XHRcdG9Qcm9wcy50YWJsZURlZmluaXRpb24gPSB0aGlzLmNyZWF0ZUJpbmRpbmdDb250ZXh0KG9UYWJsZURlZmluaXRpb24sIG1TZXR0aW5ncyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG9UYWJsZURlZmluaXRpb24gPSBvUHJvcHMudGFibGVEZWZpbml0aW9uLmdldE9iamVjdCgpO1xuXHRcdH1cblx0XHRvVGFibGVEZWZpbml0aW9uLnBhdGggPSBcIntfcGFnZU1vZGVsPlwiICsgb1Byb3BzLnRhYmxlRGVmaW5pdGlvbi5nZXRQYXRoKCkgKyBcIn1cIjtcblx0XHQvLyBwdWJsaWMgcHJvcGVydGllcyBwcm9jZXNzZWQgYnkgY29udmVydGVyIGNvbnRleHRcblx0XHR0aGlzLnNldERlZmF1bHRWYWx1ZShvUHJvcHMsIFwic2VsZWN0aW9uTW9kZVwiLCBvVGFibGVEZWZpbml0aW9uLmFubm90YXRpb24uc2VsZWN0aW9uTW9kZSwgdHJ1ZSk7XG5cdFx0dGhpcy5zZXREZWZhdWx0VmFsdWUob1Byb3BzLCBcImVuYWJsZUZ1bGxTY3JlZW5cIiwgb1RhYmxlRGVmaW5pdGlvbi5jb250cm9sLmVuYWJsZUZ1bGxTY3JlZW4sIHRydWUpO1xuXHRcdHRoaXMuc2V0RGVmYXVsdFZhbHVlKG9Qcm9wcywgXCJlbmFibGVFeHBvcnRcIiwgb1RhYmxlRGVmaW5pdGlvbi5jb250cm9sLmVuYWJsZUV4cG9ydCwgdHJ1ZSk7XG5cdFx0dGhpcy5zZXREZWZhdWx0VmFsdWUob1Byb3BzLCBcImVuYWJsZVBhc3RlXCIsIG9UYWJsZURlZmluaXRpb24uYW5ub3RhdGlvbi5zdGFuZGFyZEFjdGlvbnMuYWN0aW9ucy5wYXN0ZS5lbmFibGVkLCB0cnVlKTtcblx0XHR0aGlzLnNldERlZmF1bHRWYWx1ZShvUHJvcHMsIFwidXBkYXRhYmxlUHJvcGVydHlQYXRoXCIsIG9UYWJsZURlZmluaXRpb24uYW5ub3RhdGlvbi5zdGFuZGFyZEFjdGlvbnMudXBkYXRhYmxlUHJvcGVydHlQYXRoLCB0cnVlKTtcblx0XHR0aGlzLnNldERlZmF1bHRWYWx1ZShvUHJvcHMsIFwidHlwZVwiLCBvVGFibGVEZWZpbml0aW9uLmNvbnRyb2wudHlwZSwgdHJ1ZSk7XG5cblx0XHR0aGlzLnNldERlZmF1bHRWYWx1ZShvUHJvcHMsIFwidXNlQ29uZGVuc2VkVGFibGVMYXlvdXRcIiwgb1RhYmxlRGVmaW5pdGlvbi5jb250cm9sLnVzZUNvbmRlbnNlZFRhYmxlTGF5b3V0KTtcblx0XHR0aGlzLnNldERlZmF1bHRWYWx1ZShvUHJvcHMsIFwiZGlzYWJsZUFkZFJvd0J1dHRvbkZvckVtcHR5RGF0YVwiLCBvVGFibGVEZWZpbml0aW9uLmNvbnRyb2wuZGlzYWJsZUFkZFJvd0J1dHRvbkZvckVtcHR5RGF0YSk7XG5cdFx0dGhpcy5zZXREZWZhdWx0VmFsdWUob1Byb3BzLCBcImN1c3RvbVZhbGlkYXRpb25GdW5jdGlvblwiLCBvVGFibGVEZWZpbml0aW9uLmNvbnRyb2wuY3VzdG9tVmFsaWRhdGlvbkZ1bmN0aW9uKTtcblx0XHR0aGlzLnNldERlZmF1bHRWYWx1ZShvUHJvcHMsIFwiaGVhZGVyVmlzaWJsZVwiLCBvVGFibGVEZWZpbml0aW9uLmNvbnRyb2wuaGVhZGVyVmlzaWJsZSk7XG5cdFx0dGhpcy5zZXREZWZhdWx0VmFsdWUob1Byb3BzLCBcInNlYXJjaGFibGVcIiwgb1RhYmxlRGVmaW5pdGlvbi5hbm5vdGF0aW9uLnNlYXJjaGFibGUpO1xuXHRcdHRoaXMuc2V0RGVmYXVsdFZhbHVlKG9Qcm9wcywgXCJzaG93Um93Q291bnRcIiwgb1RhYmxlRGVmaW5pdGlvbi5jb250cm9sLnNob3dSb3dDb3VudCk7XG5cdFx0dGhpcy5zZXREZWZhdWx0VmFsdWUob1Byb3BzLCBcImlubGluZUNyZWF0aW9uUm93Q291bnRcIiwgb1RhYmxlRGVmaW5pdGlvbi5jb250cm9sLmlubGluZUNyZWF0aW9uUm93Q291bnQpO1xuXHRcdHRoaXMuc2V0RGVmYXVsdFZhbHVlKG9Qcm9wcywgXCJoZWFkZXJcIiwgb1RhYmxlRGVmaW5pdGlvbi5hbm5vdGF0aW9uLnRpdGxlKTtcblx0XHR0aGlzLnNldERlZmF1bHRWYWx1ZShvUHJvcHMsIFwic2VsZWN0aW9uTGltaXRcIiwgb1RhYmxlRGVmaW5pdGlvbi5jb250cm9sLnNlbGVjdGlvbkxpbWl0KTtcblx0XHR0aGlzLnNldERlZmF1bHRWYWx1ZShvUHJvcHMsIFwiaXNDb21wYWN0VHlwZVwiLCBvVGFibGVEZWZpbml0aW9uLmNvbnRyb2wuaXNDb21wYWN0VHlwZSk7XG5cdFx0dGhpcy5zZXREZWZhdWx0VmFsdWUob1Byb3BzLCBcImlubGluZUNyZWF0aW9uUm93c0hpZGRlbkluRWRpdE1vZGVcIiwgb1RhYmxlRGVmaW5pdGlvbi5hbm5vdGF0aW9uLmlubGluZUNyZWF0aW9uUm93c0hpZGRlbkluRWRpdE1vZGUpO1xuXHRcdGlmIChvUHJvcHMuaWQpIHtcblx0XHRcdC8vIFRoZSBnaXZlbiBJRCBzaGFsbCBiZSBhc3NpZ25lZCB0byB0aGUgVGFibGVBUEkgYW5kIG5vdCB0byB0aGUgTURDIFRhYmxlXG5cdFx0XHRvUHJvcHMuX2FwaUlkID0gb1Byb3BzLmlkO1xuXHRcdFx0b1Byb3BzLmlkID0gdGhpcy5nZXRDb250ZW50SWQob1Byb3BzLmlkKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gV2UgZ2VuZXJhdGUgdGhlIElELiBEdWUgdG8gY29tcGF0aWJpbGl0eSByZWFzb25zIHdlIGtlZXAgaXQgb24gdGhlIE1EQyBUYWJsZSBidXQgcHJvdmlkZSBhc3NpZ25cblx0XHRcdC8vIHRoZSBJRCB3aXRoIGEgOjpUYWJsZSBzdWZmaXggdG8gdGhlIFRhYmxlQVBJXG5cdFx0XHR0aGlzLnNldERlZmF1bHRWYWx1ZShvUHJvcHMsIFwiaWRcIiwgb1RhYmxlRGVmaW5pdGlvbi5hbm5vdGF0aW9uLmlkKTtcblx0XHRcdG9Qcm9wcy5fYXBpSWQgPSBvVGFibGVEZWZpbml0aW9uLmFubm90YXRpb24uaWQgKyBcIjo6VGFibGVcIjtcblx0XHR9XG5cblx0XHR0aGlzLnNldERlZmF1bHRWYWx1ZShvUHJvcHMsIFwiY3JlYXRpb25Nb2RlXCIsIG9UYWJsZURlZmluaXRpb24uYW5ub3RhdGlvbi5jcmVhdGUubW9kZSk7XG5cdFx0dGhpcy5zZXREZWZhdWx0VmFsdWUob1Byb3BzLCBcImNyZWF0ZUF0RW5kXCIsIG9UYWJsZURlZmluaXRpb24uYW5ub3RhdGlvbi5jcmVhdGUuYXBwZW5kKTtcblx0XHR0aGlzLnNldERlZmF1bHRWYWx1ZShvUHJvcHMsIFwiY3JlYXRlT3V0Ym91bmRcIiwgb1RhYmxlRGVmaW5pdGlvbi5hbm5vdGF0aW9uLmNyZWF0ZS5vdXRib3VuZCk7XG5cdFx0dGhpcy5zZXREZWZhdWx0VmFsdWUob1Byb3BzLCBcImNyZWF0ZU5ld0FjdGlvblwiLCBvVGFibGVEZWZpbml0aW9uLmFubm90YXRpb24uY3JlYXRlLm5ld0FjdGlvbik7XG5cdFx0dGhpcy5zZXREZWZhdWx0VmFsdWUob1Byb3BzLCBcImNyZWF0ZU91dGJvdW5kRGV0YWlsXCIsIG9UYWJsZURlZmluaXRpb24uYW5ub3RhdGlvbi5jcmVhdGUub3V0Ym91bmREZXRhaWwpO1xuXHRcdHRoaXMuc2V0RGVmYXVsdFZhbHVlKG9Qcm9wcywgXCJwZXJzb25hbGl6YXRpb25cIiwgb1RhYmxlRGVmaW5pdGlvbi5hbm5vdGF0aW9uLnAxM25Nb2RlKTtcblx0XHR0aGlzLnNldERlZmF1bHRWYWx1ZShvUHJvcHMsIFwidmFyaWFudE1hbmFnZW1lbnRcIiwgb1RhYmxlRGVmaW5pdGlvbi5hbm5vdGF0aW9uLnZhcmlhbnRNYW5hZ2VtZW50KTtcblx0XHR0aGlzLnNldERlZmF1bHRWYWx1ZShvUHJvcHMsIFwiZW5hYmxlQXV0b0NvbHVtbldpZHRoXCIsIHRydWUpO1xuXHRcdHRoaXMuc2V0RGVmYXVsdFZhbHVlKG9Qcm9wcywgXCJkYXRhU3RhdGVJbmRpY2F0b3JGaWx0ZXJcIiwgb1RhYmxlRGVmaW5pdGlvbi5jb250cm9sLmRhdGFTdGF0ZUluZGljYXRvckZpbHRlcik7XG5cdFx0dGhpcy5zZXREZWZhdWx0VmFsdWUob1Byb3BzLCBcImlzT3B0aW1pemVkRm9yU21hbGxEZXZpY2VcIiwgQ29tbW9uVXRpbHMuaXNTbWFsbERldmljZSgpKTtcblx0XHQvLyBTcGVjaWFsIGNvZGUgZm9yIHJlYWRPbmx5XG5cdFx0Ly8gcmVhZG9ubHkgPSBmYWxzZSAtPiBGb3JjZSBlZGl0YWJsZVxuXHRcdC8vIHJlYWRvbmx5ID0gdHJ1ZSAtPiBGb3JjZSBkaXNwbGF5IG1vZGVcblx0XHQvLyByZWFkb25seSA9IHVuZGVmaW5lZCAtPiBCb3VuZCB0byBlZGl0IGZsb3dcblxuXHRcdHN3aXRjaCAob1Byb3BzLnJlYWRPbmx5KSB7XG5cdFx0XHRjYXNlIFwiZmFsc2VcIjpcblx0XHRcdFx0b1Byb3BzLnJlYWRPbmx5ID0gZmFsc2U7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcInRydWVcIjpcblx0XHRcdFx0b1Byb3BzLnJlYWRPbmx5ID0gdHJ1ZTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdH1cblxuXHRcdHN3aXRjaCAob1Byb3BzLmVuYWJsZUF1dG9Db2x1bW5XaWR0aCkge1xuXHRcdFx0Y2FzZSBcImZhbHNlXCI6XG5cdFx0XHRcdG9Qcm9wcy5lbmFibGVBdXRvQ29sdW1uV2lkdGggPSBmYWxzZTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwidHJ1ZVwiOlxuXHRcdFx0XHRvUHJvcHMuZW5hYmxlQXV0b0NvbHVtbldpZHRoID0gdHJ1ZTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdH1cblxuXHRcdGlmIChvUHJvcHMucmVhZE9ubHkgPT09IHVuZGVmaW5lZCAmJiBvVGFibGVEZWZpbml0aW9uLmFubm90YXRpb24uZGlzcGxheU1vZGUgPT09IHRydWUpIHtcblx0XHRcdG9Qcm9wcy5yZWFkT25seSA9IHRydWU7XG5cdFx0fVxuXG5cdFx0aWYgKG9Qcm9wcy5yb3dQcmVzcykge1xuXHRcdFx0b1Byb3BzLnJvd0FjdGlvbiA9IFwiTmF2aWdhdGlvblwiO1xuXHRcdH1cblx0XHR0aGlzLnNldERlZmF1bHRWYWx1ZShvUHJvcHMsIFwicm93UHJlc3NcIiwgb1RhYmxlRGVmaW5pdGlvbi5hbm5vdGF0aW9uLnJvdy5wcmVzcyk7XG5cdFx0dGhpcy5zZXREZWZhdWx0VmFsdWUob1Byb3BzLCBcInJvd0FjdGlvblwiLCBvVGFibGVEZWZpbml0aW9uLmFubm90YXRpb24ucm93LmFjdGlvbik7XG5cblx0XHRpZiAob1Byb3BzLnBlcnNvbmFsaXphdGlvbiA9PT0gXCJmYWxzZVwiKSB7XG5cdFx0XHRvUHJvcHMucGVyc29uYWxpemF0aW9uID0gdW5kZWZpbmVkO1xuXHRcdH0gZWxzZSBpZiAob1Byb3BzLnBlcnNvbmFsaXphdGlvbiA9PT0gXCJ0cnVlXCIpIHtcblx0XHRcdG9Qcm9wcy5wZXJzb25hbGl6YXRpb24gPSBcIlNvcnQsQ29sdW1uLEZpbHRlclwiO1xuXHRcdH1cblxuXHRcdHN3aXRjaCAob1Byb3BzLnBlcnNvbmFsaXphdGlvbikge1xuXHRcdFx0Y2FzZSBcImZhbHNlXCI6XG5cdFx0XHRcdG9Qcm9wcy5wZXJzb25hbGl6YXRpb24gPSB1bmRlZmluZWQ7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcInRydWVcIjpcblx0XHRcdFx0b1Byb3BzLnBlcnNvbmFsaXphdGlvbiA9IFwiU29ydCxDb2x1bW4sRmlsdGVyXCI7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHR9XG5cblx0XHRpZiAob1Byb3BzLmlzU2VhcmNoYWJsZSA9PT0gXCJmYWxzZVwiKSB7XG5cdFx0XHRvUHJvcHMuc2VhcmNoYWJsZSA9IGZhbHNlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRvUHJvcHMuc2VhcmNoYWJsZSA9IG9UYWJsZURlZmluaXRpb24uYW5ub3RhdGlvbi5zZWFyY2hhYmxlO1xuXHRcdH1cblxuXHRcdGxldCB1c2VCYXNpY1NlYXJjaCA9IGZhbHNlO1xuXG5cdFx0Ly8gTm90ZSBmb3IgdGhlICdmaWx0ZXJCYXInIHByb3BlcnR5OlxuXHRcdC8vIDEuIElEIHJlbGF0aXZlIHRvIHRoZSB2aWV3IG9mIHRoZSBUYWJsZS5cblx0XHQvLyAyLiBBYnNvbHV0ZSBJRC5cblx0XHQvLyAzLiBJRCB3b3VsZCBiZSBjb25zaWRlcmVkIGluIGFzc29jaWF0aW9uIHRvIFRhYmxlQVBJJ3MgSUQuXG5cdFx0aWYgKCFvUHJvcHMuZmlsdGVyQmFyICYmICFvUHJvcHMuZmlsdGVyQmFySWQgJiYgb1Byb3BzLnNlYXJjaGFibGUpIHtcblx0XHRcdC8vIGZpbHRlckJhcjogUHVibGljIHByb3BlcnR5IGZvciBidWlsZGluZyBibG9ja3Ncblx0XHRcdC8vIGZpbHRlckJhcklkOiBPbmx5IHVzZWQgYXMgSW50ZXJuYWwgcHJpdmF0ZSBwcm9wZXJ0eSBmb3IgRkUgdGVtcGxhdGVzXG5cdFx0XHRvUHJvcHMuZmlsdGVyQmFySWQgPSBnZW5lcmF0ZShbb1Byb3BzLmlkLCBcIlN0YW5kYXJkQWN0aW9uXCIsIFwiQmFzaWNTZWFyY2hcIl0pO1xuXHRcdFx0dXNlQmFzaWNTZWFyY2ggPSB0cnVlO1xuXHRcdH1cblx0XHQvLyBJbnRlcm5hbCBwcm9wZXJ0aWVzXG5cdFx0b1Byb3BzLnVzZUJhc2ljU2VhcmNoID0gdXNlQmFzaWNTZWFyY2g7XG5cdFx0b1Byb3BzLnRhYmxlVHlwZSA9IG9Qcm9wcy50eXBlO1xuXHRcdG9Qcm9wcy5zaG93Q3JlYXRlID0gb1RhYmxlRGVmaW5pdGlvbi5hbm5vdGF0aW9uLnN0YW5kYXJkQWN0aW9ucy5hY3Rpb25zLmNyZWF0ZS52aXNpYmxlIHx8IHRydWU7XG5cdFx0b1Byb3BzLmF1dG9CaW5kT25Jbml0ID0gb1RhYmxlRGVmaW5pdGlvbi5hbm5vdGF0aW9uLmF1dG9CaW5kT25Jbml0O1xuXG5cdFx0Ly8gSW50ZXJuYWwgdGhhdCBJIHdhbnQgdG8gcmVtb3ZlIGluIHRoZSBlbmRcblx0XHRvUHJvcHMubmF2aWdhdGlvblBhdGggPSBvVGFibGVEZWZpbml0aW9uLmFubm90YXRpb24ubmF2aWdhdGlvblBhdGg7IC8vIG9UYWJsZURlZmluaXRpb24uYW5ub3RhdGlvbi5jb2xsZWN0aW9uOyAvL0RhdGFNb2RlbFBhdGhIZWxwZXIuZ2V0Q29udGV4dFJlbGF0aXZlVGFyZ2V0T2JqZWN0UGF0aChvQ29udGV4dE9iamVjdFBhdGgpOyAvL1xuXHRcdGlmIChvVGFibGVEZWZpbml0aW9uLmFubm90YXRpb24uY29sbGVjdGlvbi5zdGFydHNXaXRoKFwiL1wiKSAmJiBvQ29udGV4dE9iamVjdFBhdGguc3RhcnRpbmdFbnRpdHlTZXQuX3R5cGUgPT09IFwiU2luZ2xldG9uXCIpIHtcblx0XHRcdG9UYWJsZURlZmluaXRpb24uYW5ub3RhdGlvbi5jb2xsZWN0aW9uID0gb1Byb3BzLm5hdmlnYXRpb25QYXRoO1xuXHRcdH1cblx0XHRvUHJvcHMucGFyZW50RW50aXR5U2V0ID0gbVNldHRpbmdzLm1vZGVscy5tZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoXG5cdFx0XHRcIi9cIiArXG5cdFx0XHRcdChvQ29udGV4dE9iamVjdFBhdGguY29udGV4dExvY2F0aW9uIS50YXJnZXRFbnRpdHlTZXRcblx0XHRcdFx0XHQ/IG9Db250ZXh0T2JqZWN0UGF0aC5jb250ZXh0TG9jYXRpb24hLnRhcmdldEVudGl0eVNldC5uYW1lXG5cdFx0XHRcdFx0OiBvQ29udGV4dE9iamVjdFBhdGguc3RhcnRpbmdFbnRpdHlTZXQubmFtZSlcblx0XHQpO1xuXHRcdG9Qcm9wcy5jb2xsZWN0aW9uID0gbVNldHRpbmdzLm1vZGVscy5tZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQob1RhYmxlRGVmaW5pdGlvbi5hbm5vdGF0aW9uLmNvbGxlY3Rpb24pO1xuXG5cdFx0c3dpdGNoIChvUHJvcHMucmVhZE9ubHkpIHtcblx0XHRcdGNhc2UgdHJ1ZTpcblx0XHRcdFx0b1Byb3BzLmNvbHVtbkVkaXRNb2RlID0gXCJEaXNwbGF5XCI7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBmYWxzZTpcblx0XHRcdFx0b1Byb3BzLmNvbHVtbkVkaXRNb2RlID0gXCJFZGl0YWJsZVwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdG9Qcm9wcy5jb2x1bW5FZGl0TW9kZSA9IHVuZGVmaW5lZDtcblx0XHR9XG5cdFx0Ly8gUmVnYXJkaW5nIHRoZSByZW1haW5pbmcgb25lcyB0aGF0IEkgdGhpbmsgd2UgY291bGQgcmV2aWV3XG5cdFx0Ly8gc2VsZWN0ZWRDb250ZXh0c01vZGVsIC0+IHBvdGVudGlhbGx5IGhhcmRjb2RlZCBvciBpbnRlcm5hbCBvbmx5XG5cdFx0Ly8gb25Db250ZXh0Q2hhbmdlIC0+IEF1dG9zY3JvbGwgLi4uIG1pZ2h0IG5lZWQgcmV2aXNpb25cblx0XHQvLyBvbkNoYW5nZSAtPiBKdXN0IHByb3hpZWQgZG93biB0byB0aGUgRmllbGQgbWF5IG5lZWQgdG8gc2VlIGlmIG5lZWRlZCBvciBub3Rcblx0XHQvLyB2YXJpYW50U2VsZWN0ZWQgLyB2YXJpYW50U2F2ZWQgLT4gVmFyaWFudCBNYW5hZ2VtZW50IHN0YW5kYXJkIGhlbHBlcnMgP1xuXHRcdC8vIHRhYmxlRGVsZWdhdGUgIC0+IHVzZWQgZXh0ZXJuYWxseSBmb3IgQUxQIC4uLiBtaWdodCBuZWVkIHRvIHNlZSBpZiByZWxldmFudCBzdGlsbFxuXHRcdC8vIG9uU2VnbWVudGVkQnV0dG9uUHJlc3NlZCAtPiBBTFAgc3BlY2lmaWMsIHNob3VsZCBiZSBhIGRlZGljYXRlZCBjb250cm9sIGZvciB0aGUgY29udGVudFZpZXdTd2l0Y2hlclxuXHRcdC8vIHZpc2libGUgLT4gcmVsYXRlZCB0byB0aGlzIEFMUCBjb250ZW50Vmlld1N3aXRjaGVyLi4uIG1heWJlIGFuIG91dGVyIGNvbnRyb2wgd291bGQgbWFrZSBtb3JlIHNlbnNlID9cblxuXHRcdG9Qcm9wcy5oZWFkZXJCaW5kaW5nRXhwcmVzc2lvbiA9IGJ1aWxkRXhwcmVzc2lvbkZvckhlYWRlclZpc2libGUob1Byb3BzKTtcblx0XHRyZXR1cm4gb1Byb3BzO1xuXHR9LFxuXHQvKipcblx0ICogQnVpbGQgYWN0aW9ucyBhbmQgYWN0aW9uIGdyb3VwcyBmb3IgdGFibGUgdmlzdWFsaXNhdGlvbi5cblx0ICpcblx0ICogQHBhcmFtIG9BY3Rpb25zIFhNTCBub2RlIGNvcnJlc3BvbmRpbmcgdG8gYWN0aW9uc1xuXHQgKiBAcmV0dXJucyBQcmVwYXJlZCBhY3Rpb25zXG5cdCAqL1xuXHRfYnVpbGRBY3Rpb25zOiBmdW5jdGlvbiAob0FjdGlvbnM6IGFueSkge1xuXHRcdGNvbnN0IG9FeHRyYUFjdGlvbnM6IGFueSA9IHt9O1xuXHRcdGlmIChvQWN0aW9ucyAmJiBvQWN0aW9ucy5jaGlsZHJlbi5sZW5ndGggPiAwKSB7XG5cdFx0XHRjb25zdCBhY3Rpb25zID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmFwcGx5KG9BY3Rpb25zLmNoaWxkcmVuKTtcblx0XHRcdGxldCBhY3Rpb25JZHggPSAwO1xuXHRcdFx0YWN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChhY3QpIHtcblx0XHRcdFx0YWN0aW9uSWR4Kys7XG5cdFx0XHRcdGxldCBtZW51QWN0aW9uczogYW55W10gPSBbXTtcblx0XHRcdFx0aWYgKGFjdC5jaGlsZHJlbi5sZW5ndGggJiYgYWN0LmxvY2FsTmFtZSA9PT0gXCJBY3Rpb25Hcm91cFwiICYmIGFjdC5uYW1lc3BhY2VVUkkgPT09IFwic2FwLmZlLm1hY3Jvc1wiKSB7XG5cdFx0XHRcdFx0Y29uc3QgYWN0aW9uc1RvQWRkID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmFwcGx5KGFjdC5jaGlsZHJlbik7XG5cdFx0XHRcdFx0YWN0aW9uc1RvQWRkLmZvckVhY2goZnVuY3Rpb24gKGFjdFRvQWRkKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBhY3Rpb25LZXlBZGQgPSBhY3RUb0FkZC5nZXRBdHRyaWJ1dGUoXCJrZXlcIikgfHwgXCJJbmxpbmVYTUxBY3Rpb25fXCIgKyBhY3Rpb25JZHg7XG5cdFx0XHRcdFx0XHRjb25zdCBjdXJPdXRPYmplY3QgPSB7XG5cdFx0XHRcdFx0XHRcdGtleTogYWN0aW9uS2V5QWRkLFxuXHRcdFx0XHRcdFx0XHR0ZXh0OiBhY3RUb0FkZC5nZXRBdHRyaWJ1dGUoXCJ0ZXh0XCIpLFxuXHRcdFx0XHRcdFx0XHRfX25vV3JhcDogdHJ1ZSxcblx0XHRcdFx0XHRcdFx0cHJlc3M6IGFjdFRvQWRkLmdldEF0dHJpYnV0ZShcInByZXNzXCIpLFxuXHRcdFx0XHRcdFx0XHRyZXF1aXJlc1NlbGVjdGlvbjogYWN0VG9BZGQuZ2V0QXR0cmlidXRlKFwicmVxdWlyZXNTZWxlY3Rpb25cIikgPT09IFwidHJ1ZVwiLFxuXHRcdFx0XHRcdFx0XHRlbmFibGVkOiBhY3RUb0FkZC5nZXRBdHRyaWJ1dGUoXCJlbmFibGVkXCIpID09PSBudWxsID8gdHJ1ZSA6IGFjdFRvQWRkLmdldEF0dHJpYnV0ZShcImVuYWJsZWRcIilcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRvRXh0cmFBY3Rpb25zW2N1ck91dE9iamVjdC5rZXldID0gY3VyT3V0T2JqZWN0O1xuXHRcdFx0XHRcdFx0YWN0aW9uSWR4Kys7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0bWVudUFjdGlvbnMgPSBPYmplY3QudmFsdWVzKG9FeHRyYUFjdGlvbnMpXG5cdFx0XHRcdFx0XHQuc2xpY2UoLWFjdC5jaGlsZHJlbi5sZW5ndGgpXG5cdFx0XHRcdFx0XHQubWFwKGZ1bmN0aW9uIChtZW51SXRlbTogYW55KSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBtZW51SXRlbS5rZXk7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRjb25zdCBhY3Rpb25LZXkgPSBhY3QuZ2V0QXR0cmlidXRlKFwia2V5XCIpIHx8IFwiSW5saW5lWE1MQWN0aW9uX1wiICsgYWN0aW9uSWR4O1xuXHRcdFx0XHRjb25zdCBhY3RPYmplY3QgPSB7XG5cdFx0XHRcdFx0a2V5OiBhY3Rpb25LZXksXG5cdFx0XHRcdFx0dGV4dDogYWN0LmdldEF0dHJpYnV0ZShcInRleHRcIiksXG5cdFx0XHRcdFx0cG9zaXRpb246IHtcblx0XHRcdFx0XHRcdHBsYWNlbWVudDogYWN0LmdldEF0dHJpYnV0ZShcInBsYWNlbWVudFwiKSxcblx0XHRcdFx0XHRcdGFuY2hvcjogYWN0LmdldEF0dHJpYnV0ZShcImFuY2hvclwiKVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0X19ub1dyYXA6IHRydWUsXG5cdFx0XHRcdFx0cHJlc3M6IGFjdC5nZXRBdHRyaWJ1dGUoXCJwcmVzc1wiKSxcblx0XHRcdFx0XHRyZXF1aXJlc1NlbGVjdGlvbjogYWN0LmdldEF0dHJpYnV0ZShcInJlcXVpcmVzU2VsZWN0aW9uXCIpID09PSBcInRydWVcIixcblx0XHRcdFx0XHRlbmFibGVkOiBhY3QuZ2V0QXR0cmlidXRlKFwiZW5hYmxlZFwiKSA9PT0gbnVsbCA/IHRydWUgOiBhY3QuZ2V0QXR0cmlidXRlKFwiZW5hYmxlZFwiKSxcblx0XHRcdFx0XHRtZW51OiBtZW51QWN0aW9ucy5sZW5ndGggPyBtZW51QWN0aW9ucyA6IG51bGxcblx0XHRcdFx0fTtcblx0XHRcdFx0b0V4dHJhQWN0aW9uc1thY3RPYmplY3Qua2V5XSA9IGFjdE9iamVjdDtcblx0XHRcdH0pO1xuXHRcdH1cblx0XHRyZXR1cm4gb0V4dHJhQWN0aW9ucztcblx0fSxcblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgYW5ub3RhdGlvbiBwYXRoIHBvaW50aW5nIHRvIHRoZSB2aXN1YWxpemF0aW9uIGFubm90YXRpb24gKExpbmVJdGVtKS5cblx0ICpcblx0ICogQHBhcmFtIGNvbnRleHRPYmplY3RQYXRoIFRoZSBkYXRhbW9kZWwgb2JqZWN0IHBhdGggZm9yIHRoZSB0YWJsZVxuXHQgKiBAcGFyYW0gY29udmVydGVyQ29udGV4dCBUaGUgY29udmVydGVyIGNvbnRleHRcblx0ICogQHJldHVybnMgVGhlIGFubm90YXRpb24gcGF0aFxuXHQgKi9cblx0X2dldFZpc3VhbGl6YXRpb25QYXRoOiBmdW5jdGlvbiAoY29udGV4dE9iamVjdFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgsIGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQpOiBzdHJpbmcge1xuXHRcdGNvbnN0IG1ldGFQYXRoID0gZ2V0Q29udGV4dFJlbGF0aXZlVGFyZ2V0T2JqZWN0UGF0aChjb250ZXh0T2JqZWN0UGF0aCkgYXMgc3RyaW5nO1xuXHRcdGlmIChjb250ZXh0T2JqZWN0UGF0aC50YXJnZXRPYmplY3QudGVybSA9PT0gVUlBbm5vdGF0aW9uVGVybXMuTGluZUl0ZW0pIHtcblx0XHRcdHJldHVybiBtZXRhUGF0aDsgLy8gTWV0YVBhdGggaXMgYWxyZWFkeSBwb2ludGluZyB0byBhIExpbmVJdGVtXG5cdFx0fVxuXHRcdC8vTmVlZCB0byBzd2l0Y2ggdG8gdGhlIGNvbnRleHQgcmVsYXRlZCB0aGUgUFYgb3IgU1BWXG5cdFx0Y29uc3QgcmVzb2x2ZWRUYXJnZXQgPSBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVR5cGVBbm5vdGF0aW9uKG1ldGFQYXRoKTtcblxuXHRcdGxldCB2aXN1YWxpemF0aW9uczogVmlzdWFsaXphdGlvbkFuZFBhdGhbXSA9IFtdO1xuXHRcdHN3aXRjaCAoY29udGV4dE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0LnRlcm0pIHtcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVGVybXMuU2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudDpcblx0XHRcdFx0aWYgKGNvbnRleHRPYmplY3RQYXRoLnRhcmdldE9iamVjdC5QcmVzZW50YXRpb25WYXJpYW50KSB7XG5cdFx0XHRcdFx0dmlzdWFsaXphdGlvbnMgPSBnZXRWaXN1YWxpemF0aW9uc0Zyb21QcmVzZW50YXRpb25WYXJpYW50KFxuXHRcdFx0XHRcdFx0Y29udGV4dE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0LlByZXNlbnRhdGlvblZhcmlhbnQsXG5cdFx0XHRcdFx0XHRtZXRhUGF0aCxcblx0XHRcdFx0XHRcdHJlc29sdmVkVGFyZ2V0LmNvbnZlcnRlckNvbnRleHQsXG5cdFx0XHRcdFx0XHR0cnVlXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UZXJtcy5QcmVzZW50YXRpb25WYXJpYW50OlxuXHRcdFx0XHR2aXN1YWxpemF0aW9ucyA9IGdldFZpc3VhbGl6YXRpb25zRnJvbVByZXNlbnRhdGlvblZhcmlhbnQoXG5cdFx0XHRcdFx0Y29udGV4dE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0LFxuXHRcdFx0XHRcdG1ldGFQYXRoLFxuXHRcdFx0XHRcdHJlc29sdmVkVGFyZ2V0LmNvbnZlcnRlckNvbnRleHQsXG5cdFx0XHRcdFx0dHJ1ZVxuXHRcdFx0XHQpO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0TG9nLmVycm9yKGBCYWQgbWV0YXBhdGggcGFyYW1ldGVyIGZvciB0YWJsZSA6ICR7Y29udGV4dE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0LnRlcm19YCk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgbGluZUl0ZW1WaXogPSB2aXN1YWxpemF0aW9ucy5maW5kKCh2aXopID0+IHtcblx0XHRcdHJldHVybiB2aXoudmlzdWFsaXphdGlvbi50ZXJtID09PSBVSUFubm90YXRpb25UZXJtcy5MaW5lSXRlbTtcblx0XHR9KTtcblxuXHRcdGlmIChsaW5lSXRlbVZpeikge1xuXHRcdFx0cmV0dXJuIGxpbmVJdGVtVml6LmFubm90YXRpb25QYXRoO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gbWV0YVBhdGg7IC8vIEZhbGxiYWNrXG5cdFx0fVxuXHR9LFxuXG5cdF9nZXRQcmVzZW50YXRpb25QYXRoOiBmdW5jdGlvbiAob0NvbnRleHRPYmplY3RQYXRoOiBhbnkpIHtcblx0XHRsZXQgcHJlc2VudGF0aW9uUGF0aDtcblx0XHRzd2l0Y2ggKG9Db250ZXh0T2JqZWN0UGF0aC50YXJnZXRPYmplY3QudGVybSkge1xuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UZXJtcy5QcmVzZW50YXRpb25WYXJpYW50OlxuXHRcdFx0XHRwcmVzZW50YXRpb25QYXRoID0gZ2V0Q29udGV4dFJlbGF0aXZlVGFyZ2V0T2JqZWN0UGF0aChvQ29udGV4dE9iamVjdFBhdGgpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVGVybXMuU2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudDpcblx0XHRcdFx0cHJlc2VudGF0aW9uUGF0aCA9IGdldENvbnRleHRSZWxhdGl2ZVRhcmdldE9iamVjdFBhdGgob0NvbnRleHRPYmplY3RQYXRoKSArIFwiL1ByZXNlbnRhdGlvblZhcmlhbnRcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRwcmVzZW50YXRpb25QYXRoID0gbnVsbDtcblx0XHR9XG5cdFx0cmV0dXJuIHByZXNlbnRhdGlvblBhdGg7XG5cdH1cbn0pO1xuZXhwb3J0IGRlZmF1bHQgVGFibGU7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7RUFnQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxNQUFNQSxLQUFLLEdBQUdDLGFBQWEsQ0FBQ0MsTUFBTSxDQUFDLDJCQUEyQixFQUFFO0lBQy9EO0FBQ0Q7QUFDQTtJQUNDQyxJQUFJLEVBQUUsT0FBTztJQUNiO0FBQ0Q7QUFDQTtJQUNDQyxTQUFTLEVBQUUsd0JBQXdCO0lBQ25DQyxlQUFlLEVBQUUsZUFBZTtJQUNoQztBQUNEO0FBQ0E7SUFDQ0MsUUFBUSxFQUFFLDJCQUEyQjtJQUNyQztBQUNEO0FBQ0E7SUFDQ0MsUUFBUSxFQUFFO01BQ1Q7QUFDRjtBQUNBO01BQ0VDLFVBQVUsRUFBRSxVQUFVO01BQ3RCO0FBQ0Y7QUFDQTtNQUNFQyxVQUFVLEVBQUU7UUFDWEMsZUFBZSxFQUFFO1VBQ2hCQyxJQUFJLEVBQUU7UUFDUCxDQUFDO1FBQ0RDLFFBQVEsRUFBRTtVQUNURCxJQUFJLEVBQUUsc0JBQXNCO1VBQzVCRSxRQUFRLEVBQUU7UUFDWCxDQUFDO1FBQ0RDLFdBQVcsRUFBRTtVQUNaSCxJQUFJLEVBQUUsc0JBQXNCO1VBQzVCRSxRQUFRLEVBQUU7UUFDWCxDQUFDO1FBRUQ7QUFDSDtBQUNBO1FBQ0dFLFVBQVUsRUFBRTtVQUNYSixJQUFJLEVBQUUsc0JBQXNCO1VBQzVCSyxRQUFRLEVBQUUs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