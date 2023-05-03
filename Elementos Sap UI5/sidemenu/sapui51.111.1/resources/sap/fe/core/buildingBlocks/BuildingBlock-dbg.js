/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/util/deepClone", "sap/base/util/merge", "sap/base/util/ObjectPath", "sap/fe/core/buildingBlocks/BuildingBlockFragment", "sap/fe/core/buildingBlocks/BuildingBlockRuntime", "sap/fe/core/CommonUtils", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/helpers/TypeGuards", "sap/fe/core/jsx-runtime/jsx", "sap/ui/base/ManagedObject", "sap/ui/core/Component", "sap/ui/core/util/XMLPreprocessor", "../converters/ConverterContext"], function (deepClone, merge, ObjectPath, BuildingBlockFragment, BuildingBlockRuntime, CommonUtils, BindingToolkit, StableIdHelper, TypeGuards, jsx, ManagedObject, Component, XMLPreprocessor, ConverterContext) {
  "use strict";

  var _exports = {};
  var isContext = TypeGuards.isContext;
  var generate = StableIdHelper.generate;
  var resolveBindingString = BindingToolkit.resolveBindingString;
  var isUndefinedExpression = BindingToolkit.isUndefinedExpression;
  var xml = BuildingBlockRuntime.xml;
  var registerBuildingBlock = BuildingBlockRuntime.registerBuildingBlock;
  /**
   * Base class for Building Block
   */
  let BuildingBlockBase = /*#__PURE__*/function () {
    function BuildingBlockBase(props, _oControlConfig, _oSettings) {
      this.isPublic = false;
      this.getConverterContext = function (dataModelObjectPath, contextPath, settings, extraParams) {
        var _settings$models$view;
        const appComponent = settings.appComponent;
        const originalViewData = (_settings$models$view = settings.models.viewData) === null || _settings$models$view === void 0 ? void 0 : _settings$models$view.getData();
        let viewData = Object.assign({}, originalViewData);
        delete viewData.resourceBundle;
        viewData = deepClone(viewData);
        viewData.controlConfiguration = merge(viewData.controlConfiguration, extraParams || {});
        return ConverterContext.createConverterContextForMacro(dataModelObjectPath.startingEntitySet.name, settings.models.metaModel, appComponent === null || appComponent === void 0 ? void 0 : appComponent.getDiagnostics(), merge, dataModelObjectPath.contextLocation, viewData);
      };
      Object.keys(props).forEach(propName => {
        this[propName] = props[propName];
      });
    }
    /**
     * Only used internally
     *
     * @private
     */
    _exports.BuildingBlockBase = BuildingBlockBase;
    var _proto = BuildingBlockBase.prototype;
    /**
     * Convert the given local element ID to a globally unique ID by prefixing with the Building Block ID.
     *
     * @param stringParts
     * @returns Either the global ID or undefined if the Building Block doesn't have an ID
     * @private
     */
    _proto.createId = function createId() {
      // If the child instance has an ID property use it otherwise return undefined
      if (this.id) {
        for (var _len = arguments.length, stringParts = new Array(_len), _key = 0; _key < _len; _key++) {
          stringParts[_key] = arguments[_key];
        }
        return generate([this.id, ...stringParts]);
      }
      return undefined;
    };
    /**
     * Only used internally.
     *
     * @returns All the properties defined on the object with their values
     * @private
     */
    _proto.getProperties = function getProperties() {
      const allProperties = {};
      for (const oInstanceKey in this) {
        if (this.hasOwnProperty(oInstanceKey)) {
          allProperties[oInstanceKey] = this[oInstanceKey];
        }
      }
      return allProperties;
    };
    BuildingBlockBase.register = function register() {
      // To be overriden
    };
    BuildingBlockBase.unregister = function unregister() {
      // To be overriden
    }

    /**
     * Add a part of string based on the condition.
     *
     * @param condition
     * @param partToAdd
     * @returns The part to add if the condition is true, otherwise an empty string
     * @private
     */;
    _proto.addConditionally = function addConditionally(condition, partToAdd) {
      if (condition) {
        return partToAdd;
      } else {
        return "";
      }
    }
    /**
     * Add an attribute depending on the current value of the property.
     * If it's undefined the attribute is not added.
     *
     * @param attributeName
     * @param value
     * @returns The attribute to add if the value is not undefined, otherwise an empty string
     * @private
     */;
    _proto.attr = function attr(attributeName, value) {
      if (value !== undefined && !isUndefinedExpression(value)) {
        return () => xml`${attributeName}="${value}"`;
      } else {
        return () => "";
      }
    };
    return BuildingBlockBase;
  }();
  /**
   * Base class for runtime building blocks
   */
  _exports.BuildingBlockBase = BuildingBlockBase;
  const ensureMetadata = function (target) {
    if (!target.hasOwnProperty("metadata")) {
      target.metadata = deepClone(target.metadata || {
        properties: {},
        aggregations: {},
        events: {},
        stereotype: "xmlmacro",
        designtime: ""
      });
    }
    return target.metadata;
  };

  /**
   * Decorator for building blocks.
   *
   * @param attributeDefinition
   * @deprecated use `blockAttribute` instead
   * @returns The decorated property
   */
  function xmlAttribute(attributeDefinition) {
    return function (target, propertyKey, propertyDescriptor) {
      const metadata = ensureMetadata(target.constructor);
      if (attributeDefinition.defaultValue === undefined) {
        var _propertyDescriptor$i;
        // If there is no defaultValue we can take the value from the initializer (natural way of defining defaults)
        attributeDefinition.defaultValue = (_propertyDescriptor$i = propertyDescriptor.initializer) === null || _propertyDescriptor$i === void 0 ? void 0 : _propertyDescriptor$i.call(propertyDescriptor);
      }
      delete propertyDescriptor.initializer;
      if (metadata.properties[propertyKey.toString()] === undefined) {
        metadata.properties[propertyKey.toString()] = attributeDefinition;
      }
      return propertyDescriptor;
    }; // Needed to make TS happy with those decorators;
  }

  /**
   * Indicates that the property shall be declared as an xml attribute that can be used from the outside of the building block.
   *
   * If defining a runtime Building Block, please make sure to use the correct typings: Depending on its metadata,
   * a property can either be a {@link sap.ui.model.Context} (<code>type: 'sap.ui.model.Context'</code>),
   * a constant (<code>bindable: false</code>), or a {@link BindingToolkitExpression} (<code>bindable: true</code>).
   *
   * @param attributeDefinition
   * @returns The decorated property
   */
  _exports.xmlAttribute = xmlAttribute;
  function blockAttribute(attributeDefinition) {
    return xmlAttribute(attributeDefinition);
  }

  /**
   * Decorator for building blocks.
   *
   * @deprecated use `blockEvent` instead
   * @returns The decorated property
   */
  _exports.blockAttribute = blockAttribute;
  function xmlEvent() {
    return function (target, propertyKey, propertyDescriptor) {
      const metadata = ensureMetadata(target.constructor);
      delete propertyDescriptor.initializer;
      if (metadata.events[propertyKey.toString()] === undefined) {
        metadata.events[propertyKey.toString()] = {
          type: "function"
        };
      }
      return propertyDescriptor;
    }; // Needed to make TS happy with those decorators;
  }
  _exports.xmlEvent = xmlEvent;
  function blockEvent() {
    return xmlEvent();
  }

  /**
   * Decorator for building blocks.
   *
   * @param aggregationDefinition
   * @returns The decorated property
   * @deprecated use `blockAggregation` instead
   */
  _exports.blockEvent = blockEvent;
  function xmlAggregation(aggregationDefinition) {
    return function (target, propertyKey, propertyDescriptor) {
      const metadata = ensureMetadata(target.constructor);
      delete propertyDescriptor.initializer;
      if (metadata.aggregations[propertyKey] === undefined) {
        metadata.aggregations[propertyKey] = aggregationDefinition;
      }
      return propertyDescriptor;
    };
  }
  /**
   * Indicates that the property shall be declared as an xml aggregation that can be used from the outside of the building block.
   *
   * @param aggregationDefinition
   * @returns The decorated property
   */
  _exports.xmlAggregation = xmlAggregation;
  function blockAggregation(aggregationDefinition) {
    return xmlAggregation(aggregationDefinition);
  }
  _exports.blockAggregation = blockAggregation;
  const RUNTIME_BLOCKS = {};
  function defineBuildingBlock(oBuildingBlockDefinition) {
    return function (classDefinition) {
      const metadata = ensureMetadata(classDefinition);
      metadata.designtime = oBuildingBlockDefinition.designtime;
      classDefinition.xmlTag = oBuildingBlockDefinition.name;
      classDefinition.namespace = oBuildingBlockDefinition.namespace;
      classDefinition.publicNamespace = oBuildingBlockDefinition.publicNamespace;
      classDefinition.fragment = oBuildingBlockDefinition.fragment;
      classDefinition.isOpen = oBuildingBlockDefinition.isOpen;
      classDefinition.isRuntime = oBuildingBlockDefinition.isRuntime;
      classDefinition.apiVersion = 2;
      if (classDefinition.isRuntime === true) {
        classDefinition.prototype.getTemplate = function (oNode) {
          const className = `${oBuildingBlockDefinition.namespace}.${oBuildingBlockDefinition.name}`;
          const extraProps = [];
          // Function are defined as string but need to be resolved by UI5, as such we store them in an `event` property and will redispatch them later
          const functionHolderDefinition = [];
          const propertiesAssignedToFunction = [];
          const functionStringInOrder = [];
          for (const propertiesKey in metadata.properties) {
            let propertyValue = this[propertiesKey];
            if (propertyValue !== undefined && propertyValue !== null) {
              if (isContext(propertyValue)) {
                propertyValue = propertyValue.getPath();
              }
              if (metadata.properties[propertiesKey].type === "function") {
                functionHolderDefinition.push(propertyValue);
                functionStringInOrder.push(propertyValue);
                propertiesAssignedToFunction.push(propertiesKey);
              } else {
                extraProps.push(xml`feBB:${propertiesKey}="${propertyValue}"`);
              }
            }
          }
          if (functionHolderDefinition.length > 0) {
            extraProps.push(xml`functionHolder="${functionHolderDefinition.join(";")}"`);
            extraProps.push(xml`feBB:functionStringInOrder="${functionStringInOrder.join(",")}"`);
            extraProps.push(xml`feBB:propertiesAssignedToFunction="${propertiesAssignedToFunction.join(",")}"`);
          }
          for (const eventsKey in metadata.events) {
            const eventsValue = this[eventsKey];
            if (eventsValue !== undefined) {
              extraProps.push(xml`feBB:${eventsKey}="${eventsValue}"`);
            }
          }
          // core:require need to be defined on the node itself to be picked up due to the templating step
          const coreRequire = oNode.getAttribute("core:require") || undefined;
          if (coreRequire) {
            extraProps.push(xml`core:require="${coreRequire}"`);
          }
          return xml`<feBB:BuildingBlockFragment
					xmlns:core="sap.ui.core"
					xmlns:feBB="sap.fe.core.buildingBlocks"
					fragmentName="${className}"

					id="{this>id}"
					type="FE_COMPONENTS"
					${extraProps}
				>
				</feBB:BuildingBlockFragment>`;
        };
      }
      classDefinition.register = function () {
        registerBuildingBlock(classDefinition);
        if (classDefinition.isRuntime === true) {
          RUNTIME_BLOCKS[`${oBuildingBlockDefinition.namespace}.${oBuildingBlockDefinition.name}`] = classDefinition;
        }
      };
      classDefinition.unregister = function () {
        XMLPreprocessor.plugIn(null, classDefinition.namespace, classDefinition.name);
        XMLPreprocessor.plugIn(null, classDefinition.publicNamespace, classDefinition.name);
      };
    };
  }
  _exports.defineBuildingBlock = defineBuildingBlock;
  BuildingBlockFragment.registerType("FE_COMPONENTS", {
    load: async function (mSettings) {
      return Promise.resolve(RUNTIME_BLOCKS[mSettings.fragmentName]);
    },
    init: function (mSettings) {
      var _mSettings$customData, _mSettings$customData2, _mSettings$customData3, _mSettings$customData4, _mSettings$containing, _mSettings$containing2, _feCustomData$functio, _feCustomData$propert;
      let MyClass = mSettings.fragmentContent;
      if (!MyClass) {
        // In some case we might have been called here synchronously (unstash case for instance), which means we didn't go through the load function
        MyClass = RUNTIME_BLOCKS[mSettings.fragmentName];
      }
      const classSettings = {};
      const feCustomData = (mSettings === null || mSettings === void 0 ? void 0 : (_mSettings$customData = mSettings.customData) === null || _mSettings$customData === void 0 ? void 0 : (_mSettings$customData2 = _mSettings$customData[0]) === null || _mSettings$customData2 === void 0 ? void 0 : (_mSettings$customData3 = _mSettings$customData2.mProperties) === null || _mSettings$customData3 === void 0 ? void 0 : (_mSettings$customData4 = _mSettings$customData3.value) === null || _mSettings$customData4 === void 0 ? void 0 : _mSettings$customData4["sap.fe.core.buildingBlocks"]) || {};
      delete mSettings.customData;
      const functionHolder = mSettings.functionHolder ?? [];
      delete mSettings.functionHolder;

      // containingView can also be a fragment, so we have to use the controller to be sure to get the actual view
      const containingView = ((_mSettings$containing = (_mSettings$containing2 = mSettings.containingView).getController) === null || _mSettings$containing === void 0 ? void 0 : _mSettings$containing.call(_mSettings$containing2).getView()) ?? mSettings.containingView;
      const pageComponent = Component.getOwnerComponentFor(containingView);
      const appComponent = CommonUtils.getAppComponent(containingView);
      const metaModel = appComponent.getMetaModel();
      const pageModel = pageComponent.getModel("_pageModel");
      const functionStringInOrder = (_feCustomData$functio = feCustomData.functionStringInOrder) === null || _feCustomData$functio === void 0 ? void 0 : _feCustomData$functio.split(",");
      const propertiesAssignedToFunction = (_feCustomData$propert = feCustomData.propertiesAssignedToFunction) === null || _feCustomData$propert === void 0 ? void 0 : _feCustomData$propert.split(",");
      for (const propertyName in MyClass.metadata.properties) {
        const propertyMetadata = MyClass.metadata.properties[propertyName];
        const pageModelContext = pageModel.createBindingContext(feCustomData[propertyName]);
        if (pageModelContext === null) {
          // value cannot be resolved, so it is either a runtime binding or a constant
          let value = feCustomData[propertyName];
          if (typeof value === "string") {
            if (propertyMetadata.bindable !== true) {
              // runtime bindings are not allowed, so convert strings into actual primitive types
              switch (propertyMetadata.type) {
                case "boolean":
                  value = value === "true";
                  break;
                case "number":
                  value = Number(value);
                  break;
              }
            } else {
              // runtime bindings are allowed, so resolve the values as BindingToolkit expressions
              value = resolveBindingString(value, propertyMetadata.type);
            }
          } else if (propertyMetadata.type === "function") {
            const functionIndex = propertiesAssignedToFunction.indexOf(propertyName);
            const functionString = functionStringInOrder[functionIndex];
            const targetFunction = functionHolder === null || functionHolder === void 0 ? void 0 : functionHolder.find(functionDef => {
              var _functionDef$;
              return ((_functionDef$ = functionDef[0]) === null || _functionDef$ === void 0 ? void 0 : _functionDef$._sapui_handlerName) === functionString;
            });
            // We use the _sapui_handlerName to identify which function is the one we want to bind here
            if (targetFunction && targetFunction.length > 1) {
              value = targetFunction[0].bind(targetFunction[1]);
            }
          }
          classSettings[propertyName] = value;
        } else if (pageModelContext.getObject() !== undefined) {
          // get value from page model
          classSettings[propertyName] = pageModelContext.getObject();
        } else {
          // bind to metamodel
          classSettings[propertyName] = metaModel.createBindingContext(feCustomData[propertyName]);
        }
      }
      for (const eventName in MyClass.metadata.events) {
        if (feCustomData[eventName] !== undefined && feCustomData[eventName].startsWith(".")) {
          classSettings[eventName] = ObjectPath.get(feCustomData[eventName].substring(1), containingView.getController());
        } else {
          classSettings[eventName] = ""; // For now, might need to resolve more stuff
        }
      }

      return ManagedObject.runWithPreprocessors(() => {
        const renderedControl = jsx.withContext({
          view: containingView,
          appComponent: appComponent
        }, () => {
          return new MyClass(classSettings, {}, {
            isRuntimeInstantiation: true,
            isPublic: false,
            appComponent: appComponent
          }).getContent(containingView, appComponent);
        });
        if (!this._bAsync) {
          this._aContent = renderedControl;
        }
        return renderedControl;
      }, {
        id: function (sId) {
          return containingView.createId(sId);
        },
        settings: function (controlSettings) {
          const allAssociations = this.getMetadata().getAssociations();
          for (const associationDetailName of Object.keys(allAssociations)) {
            if (controlSettings[associationDetailName] !== undefined) {
              // The associated elements are indicated via local IDs; we need to change the references to global ones
              const associations = Array.isArray(controlSettings[associationDetailName]) ? controlSettings[associationDetailName] : [controlSettings[associationDetailName]];

              // Create global IDs for associations given as strings, not for already resolved ManagedObjects
              controlSettings[associationDetailName] = associations.map(association => typeof association === "string" ? mSettings.containingView.createId(association) : association);
            }
          }
          return controlSettings;
        }
      });
    }
  });
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCdWlsZGluZ0Jsb2NrQmFzZSIsInByb3BzIiwiX29Db250cm9sQ29uZmlnIiwiX29TZXR0aW5ncyIsImlzUHVibGljIiwiZ2V0Q29udmVydGVyQ29udGV4dCIsImRhdGFNb2RlbE9iamVjdFBhdGgiLCJjb250ZXh0UGF0aCIsInNldHRpbmdzIiwiZXh0cmFQYXJhbXMiLCJhcHBDb21wb25lbnQiLCJvcmlnaW5hbFZpZXdEYXRhIiwibW9kZWxzIiwidmlld0RhdGEiLCJnZXREYXRhIiwiT2JqZWN0IiwiYXNzaWduIiwicmVzb3VyY2VCdW5kbGUiLCJkZWVwQ2xvbmUiLCJjb250cm9sQ29uZmlndXJhdGlvbiIsIm1lcmdlIiwiQ29udmVydGVyQ29udGV4dCIsImNyZWF0ZUNvbnZlcnRlckNvbnRleHRGb3JNYWNybyIsInN0YXJ0aW5nRW50aXR5U2V0IiwibmFtZSIsIm1ldGFNb2RlbCIsImdldERpYWdub3N0aWNzIiwiY29udGV4dExvY2F0aW9uIiwia2V5cyIsImZvckVhY2giLCJwcm9wTmFtZSIsImNyZWF0ZUlkIiwiaWQiLCJzdHJpbmdQYXJ0cyIsImdlbmVyYXRlIiwidW5kZWZpbmVkIiwiZ2V0UHJvcGVydGllcyIsImFsbFByb3BlcnRpZXMiLCJvSW5zdGFuY2VLZXkiLCJoYXNPd25Qcm9wZXJ0eSIsInJlZ2lzdGVyIiwidW5yZWdpc3RlciIsImFkZENvbmRpdGlvbmFsbHkiLCJjb25kaXRpb24iLCJwYXJ0VG9BZGQiLCJhdHRyIiwiYXR0cmlidXRlTmFtZSIsInZhbHVlIiwiaXNVbmRlZmluZWRFeHByZXNzaW9uIiwieG1sIiwiZW5zdXJlTWV0YWRhdGEiLCJ0YXJnZXQiLCJtZXRhZGF0YSIsInByb3BlcnRpZXMiLCJhZ2dyZWdhdGlvbnMiLCJldmVudHMiLCJzdGVyZW90eXBlIiwiZGVzaWdudGltZSIsInhtbEF0dHJpYnV0ZSIsImF0dHJpYnV0ZURlZmluaXRpb24iLCJwcm9wZXJ0eUtleSIsInByb3BlcnR5RGVzY3JpcHRvciIsImNvbnN0cnVjdG9yIiwiZGVmYXVsdFZhbHVlIiwiaW5pdGlhbGl6ZXIiLCJ0b1N0cmluZyIsImJsb2NrQXR0cmlidXRlIiwieG1sRXZlbnQiLCJ0eXBlIiwiYmxvY2tFdmVudCIsInhtbEFnZ3JlZ2F0aW9uIiwiYWdncmVnYXRpb25EZWZpbml0aW9uIiwiYmxvY2tBZ2dyZWdhdGlvbiIsIlJVTlRJTUVfQkxPQ0tTIiwiZGVmaW5lQnVpbGRpbmdCbG9jayIsIm9CdWlsZGluZ0Jsb2NrRGVmaW5pdGlvbiIsImNsYXNzRGVmaW5pdGlvbiIsInhtbFRhZyIsIm5hbWVzcGFjZSIsInB1YmxpY05hbWVzcGFjZSIsImZyYWdtZW50IiwiaXNPcGVuIiwiaXNSdW50aW1lIiwiYXBpVmVyc2lvbiIsInByb3RvdHlwZSIsImdldFRlbXBsYXRlIiwib05vZGUiLCJjbGFzc05hbWUiLCJleHRyYVByb3BzIiwiZnVuY3Rpb25Ib2xkZXJEZWZpbml0aW9uIiwicHJvcGVydGllc0Fzc2lnbmVkVG9GdW5jdGlvbiIsImZ1bmN0aW9uU3RyaW5nSW5PcmRlciIsInByb3BlcnRpZXNLZXkiLCJwcm9wZXJ0eVZhbHVlIiwiaXNDb250ZXh0IiwiZ2V0UGF0aCIsInB1c2giLCJsZW5ndGgiLCJqb2luIiwiZXZlbnRzS2V5IiwiZXZlbnRzVmFsdWUiLCJjb3JlUmVxdWlyZSIsImdldEF0dHJpYnV0ZSIsInJlZ2lzdGVyQnVpbGRpbmdCbG9jayIsIlhNTFByZXByb2Nlc3NvciIsInBsdWdJbiIsIkJ1aWxkaW5nQmxvY2tGcmFnbWVudCIsInJlZ2lzdGVyVHlwZSIsImxvYWQiLCJtU2V0dGluZ3MiLCJQcm9taXNlIiwicmVzb2x2ZSIsImZyYWdtZW50TmFtZSIsImluaXQiLCJNeUNsYXNzIiwiZnJhZ21lbnRDb250ZW50IiwiY2xhc3NTZXR0aW5ncyIsImZlQ3VzdG9tRGF0YSIsImN1c3RvbURhdGEiLCJtUHJvcGVydGllcyIsImZ1bmN0aW9uSG9sZGVyIiwiY29udGFpbmluZ1ZpZXciLCJnZXRDb250cm9sbGVyIiwiZ2V0VmlldyIsInBhZ2VDb21wb25lbnQiLCJDb21wb25lbnQiLCJnZXRPd25lckNvbXBvbmVudEZvciIsIkNvbW1vblV0aWxzIiwiZ2V0QXBwQ29tcG9uZW50IiwiZ2V0TWV0YU1vZGVsIiwicGFnZU1vZGVsIiwiZ2V0TW9kZWwiLCJzcGxpdCIsInByb3BlcnR5TmFtZSIsInByb3BlcnR5TWV0YWRhdGEiLCJwYWdlTW9kZWxDb250ZXh0IiwiY3JlYXRlQmluZGluZ0NvbnRleHQiLCJiaW5kYWJsZSIsIk51bWJlciIsInJlc29sdmVCaW5kaW5nU3RyaW5nIiwiZnVuY3Rpb25JbmRleCIsImluZGV4T2YiLCJmdW5jdGlvblN0cmluZyIsInRhcmdldEZ1bmN0aW9uIiwiZmluZCIsImZ1bmN0aW9uRGVmIiwiX3NhcHVpX2hhbmRsZXJOYW1lIiwiYmluZCIsImdldE9iamVjdCIsImV2ZW50TmFtZSIsInN0YXJ0c1dpdGgiLCJPYmplY3RQYXRoIiwiZ2V0Iiwic3Vic3RyaW5nIiwiTWFuYWdlZE9iamVjdCIsInJ1bldpdGhQcmVwcm9jZXNzb3JzIiwicmVuZGVyZWRDb250cm9sIiwianN4Iiwid2l0aENvbnRleHQiLCJ2aWV3IiwiaXNSdW50aW1lSW5zdGFudGlhdGlvbiIsImdldENvbnRlbnQiLCJfYkFzeW5jIiwiX2FDb250ZW50Iiwic0lkIiwiY29udHJvbFNldHRpbmdzIiwiYWxsQXNzb2NpYXRpb25zIiwiZ2V0TWV0YWRhdGEiLCJnZXRBc3NvY2lhdGlvbnMiLCJhc3NvY2lhdGlvbkRldGFpbE5hbWUiLCJhc3NvY2lhdGlvbnMiLCJBcnJheSIsImlzQXJyYXkiLCJtYXAiLCJhc3NvY2lhdGlvbiJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiQnVpbGRpbmdCbG9jay50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZGVlcENsb25lIGZyb20gXCJzYXAvYmFzZS91dGlsL2RlZXBDbG9uZVwiO1xuaW1wb3J0IG1lcmdlIGZyb20gXCJzYXAvYmFzZS91dGlsL21lcmdlXCI7XG5pbXBvcnQgT2JqZWN0UGF0aCBmcm9tIFwic2FwL2Jhc2UvdXRpbC9PYmplY3RQYXRoXCI7XG5pbXBvcnQgdHlwZSBBcHBDb21wb25lbnQgZnJvbSBcInNhcC9mZS9jb3JlL0FwcENvbXBvbmVudFwiO1xuaW1wb3J0IEJ1aWxkaW5nQmxvY2tGcmFnbWVudCBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja0ZyYWdtZW50XCI7XG5pbXBvcnQgdHlwZSB7IFRlbXBsYXRlUHJvY2Vzc29yU2V0dGluZ3MsIFhNTFByb2Nlc3NvclR5cGVWYWx1ZSB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrUnVudGltZVwiO1xuaW1wb3J0IHsgcmVnaXN0ZXJCdWlsZGluZ0Jsb2NrLCB4bWwgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1J1bnRpbWVcIjtcbmltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCB0eXBlIHsgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCB7IGlzVW5kZWZpbmVkRXhwcmVzc2lvbiwgcmVzb2x2ZUJpbmRpbmdTdHJpbmcgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IHsgZ2VuZXJhdGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9TdGFibGVJZEhlbHBlclwiO1xuaW1wb3J0IHsgaXNDb250ZXh0IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvVHlwZUd1YXJkc1wiO1xuaW1wb3J0IGpzeCBmcm9tIFwic2FwL2ZlL2NvcmUvanN4LXJ1bnRpbWUvanN4XCI7XG5pbXBvcnQgdHlwZSBUZW1wbGF0ZUNvbXBvbmVudCBmcm9tIFwic2FwL2ZlL2NvcmUvVGVtcGxhdGVDb21wb25lbnRcIjtcbmltcG9ydCB0eXBlIHsgRGF0YU1vZGVsT2JqZWN0UGF0aCB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL0RhdGFNb2RlbFBhdGhIZWxwZXJcIjtcbmltcG9ydCBNYW5hZ2VkT2JqZWN0IGZyb20gXCJzYXAvdWkvYmFzZS9NYW5hZ2VkT2JqZWN0XCI7XG5pbXBvcnQgQ29tcG9uZW50IGZyb20gXCJzYXAvdWkvY29yZS9Db21wb25lbnRcIjtcbmltcG9ydCB0eXBlIFZpZXcgZnJvbSBcInNhcC91aS9jb3JlL212Yy9WaWV3XCI7XG5pbXBvcnQgWE1MUHJlcHJvY2Vzc29yIGZyb20gXCJzYXAvdWkvY29yZS91dGlsL1hNTFByZXByb2Nlc3NvclwiO1xuaW1wb3J0IHR5cGUgQ29udHJvbCBmcm9tIFwic2FwL3VpL21kYy9Db250cm9sXCI7XG5pbXBvcnQgdHlwZSBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvQ29udGV4dFwiO1xuaW1wb3J0IHR5cGUgeyBNYW5hZ2VkT2JqZWN0RXggfSBmcm9tIFwidHlwZXMvZXh0ZW5zaW9uX3R5cGVzXCI7XG5pbXBvcnQgQ29udmVydGVyQ29udGV4dCBmcm9tIFwiLi4vY29udmVydGVycy9Db252ZXJ0ZXJDb250ZXh0XCI7XG5cbmV4cG9ydCB0eXBlIE9iamVjdFZhbHVlMiA9IHN0cmluZyB8IGJvb2xlYW4gfCBudW1iZXIgfCBDb250ZXh0IHwgdW5kZWZpbmVkIHwgb2JqZWN0IHwgbnVsbDtcbnR5cGUgT2JqZWN0VmFsdWUzPFQ+ID0gVCB8IFJlY29yZDxzdHJpbmcsIFQ+IHwgVFtdO1xuZXhwb3J0IHR5cGUgT2JqZWN0VmFsdWUgPSBPYmplY3RWYWx1ZTM8T2JqZWN0VmFsdWUyIHwgUmVjb3JkPHN0cmluZywgT2JqZWN0VmFsdWUyPiB8IE9iamVjdFZhbHVlMltdPjtcblxuLy8gVHlwZSBmb3IgdGhlIGFjY2Vzc29yIGRlY29yYXRvciB0aGF0IHdlIGVuZCB1cCB3aXRoIGluIGJhYmVsLlxudHlwZSBBY2Nlc3NvckRlc2NyaXB0b3I8VD4gPSBUeXBlZFByb3BlcnR5RGVzY3JpcHRvcjxUPiAmIHsgaW5pdGlhbGl6ZXI/OiAoKSA9PiBUIH07XG5leHBvcnQgdHlwZSBCdWlsZGluZ0Jsb2NrRXh0cmFTZXR0aW5ncyA9IHtcblx0aXNQdWJsaWM6IGJvb2xlYW47XG5cdGlzUnVudGltZUluc3RhbnRpYXRpb24/OiBib29sZWFuO1xuXHRhcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudDtcbn07XG5cbi8qKlxuICogQmFzZSBjbGFzcyBmb3IgQnVpbGRpbmcgQmxvY2tcbiAqL1xuZXhwb3J0IGNsYXNzIEJ1aWxkaW5nQmxvY2tCYXNlIHtcblx0cHJvdGVjdGVkIGlzUHVibGljID0gZmFsc2U7XG5cdHByb3RlY3RlZCBpZCE6IHN0cmluZztcblx0Y29uc3RydWN0b3IocHJvcHM6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LCBfb0NvbnRyb2xDb25maWc/OiB1bmtub3duLCBfb1NldHRpbmdzPzogQnVpbGRpbmdCbG9ja0V4dHJhU2V0dGluZ3MpIHtcblx0XHRPYmplY3Qua2V5cyhwcm9wcykuZm9yRWFjaCgocHJvcE5hbWUpID0+IHtcblx0XHRcdHRoaXNbcHJvcE5hbWUgYXMga2V5b2YgdGhpc10gPSBwcm9wc1twcm9wTmFtZV0gYXMgbmV2ZXI7XG5cdFx0fSk7XG5cdH1cblx0LyoqXG5cdCAqIE9ubHkgdXNlZCBpbnRlcm5hbGx5XG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRwdWJsaWMgZ2V0VGVtcGxhdGU/KG9Ob2RlPzogRWxlbWVudCk6IHN0cmluZyB8IFByb21pc2U8c3RyaW5nIHwgdW5kZWZpbmVkPiB8IHVuZGVmaW5lZDtcblxuXHQvKipcblx0ICogQ29udmVydCB0aGUgZ2l2ZW4gbG9jYWwgZWxlbWVudCBJRCB0byBhIGdsb2JhbGx5IHVuaXF1ZSBJRCBieSBwcmVmaXhpbmcgd2l0aCB0aGUgQnVpbGRpbmcgQmxvY2sgSUQuXG5cdCAqXG5cdCAqIEBwYXJhbSBzdHJpbmdQYXJ0c1xuXHQgKiBAcmV0dXJucyBFaXRoZXIgdGhlIGdsb2JhbCBJRCBvciB1bmRlZmluZWQgaWYgdGhlIEJ1aWxkaW5nIEJsb2NrIGRvZXNuJ3QgaGF2ZSBhbiBJRFxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0cHJvdGVjdGVkIGNyZWF0ZUlkKC4uLnN0cmluZ1BhcnRzOiBzdHJpbmdbXSkge1xuXHRcdC8vIElmIHRoZSBjaGlsZCBpbnN0YW5jZSBoYXMgYW4gSUQgcHJvcGVydHkgdXNlIGl0IG90aGVyd2lzZSByZXR1cm4gdW5kZWZpbmVkXG5cdFx0aWYgKHRoaXMuaWQpIHtcblx0XHRcdHJldHVybiBnZW5lcmF0ZShbdGhpcy5pZCwgLi4uc3RyaW5nUGFydHNdKTtcblx0XHR9XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXHRwcm90ZWN0ZWQgZ2V0Q29udmVydGVyQ29udGV4dCA9IGZ1bmN0aW9uIChcblx0XHRkYXRhTW9kZWxPYmplY3RQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoLFxuXHRcdGNvbnRleHRQYXRoOiBzdHJpbmcgfCB1bmRlZmluZWQsXG5cdFx0c2V0dGluZ3M6IFRlbXBsYXRlUHJvY2Vzc29yU2V0dGluZ3MsXG5cdFx0ZXh0cmFQYXJhbXM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPlxuXHQpIHtcblx0XHRjb25zdCBhcHBDb21wb25lbnQgPSBzZXR0aW5ncy5hcHBDb21wb25lbnQ7XG5cdFx0Y29uc3Qgb3JpZ2luYWxWaWV3RGF0YSA9IHNldHRpbmdzLm1vZGVscy52aWV3RGF0YT8uZ2V0RGF0YSgpO1xuXHRcdGxldCB2aWV3RGF0YSA9IE9iamVjdC5hc3NpZ24oe30sIG9yaWdpbmFsVmlld0RhdGEpO1xuXHRcdGRlbGV0ZSB2aWV3RGF0YS5yZXNvdXJjZUJ1bmRsZTtcblx0XHR2aWV3RGF0YSA9IGRlZXBDbG9uZSh2aWV3RGF0YSk7XG5cdFx0dmlld0RhdGEuY29udHJvbENvbmZpZ3VyYXRpb24gPSBtZXJnZSh2aWV3RGF0YS5jb250cm9sQ29uZmlndXJhdGlvbiwgZXh0cmFQYXJhbXMgfHwge30pO1xuXHRcdHJldHVybiBDb252ZXJ0ZXJDb250ZXh0LmNyZWF0ZUNvbnZlcnRlckNvbnRleHRGb3JNYWNybyhcblx0XHRcdGRhdGFNb2RlbE9iamVjdFBhdGguc3RhcnRpbmdFbnRpdHlTZXQubmFtZSxcblx0XHRcdHNldHRpbmdzLm1vZGVscy5tZXRhTW9kZWwsXG5cdFx0XHRhcHBDb21wb25lbnQ/LmdldERpYWdub3N0aWNzKCksXG5cdFx0XHRtZXJnZSxcblx0XHRcdGRhdGFNb2RlbE9iamVjdFBhdGguY29udGV4dExvY2F0aW9uLFxuXHRcdFx0dmlld0RhdGFcblx0XHQpO1xuXHR9O1xuXG5cdC8qKlxuXHQgKiBPbmx5IHVzZWQgaW50ZXJuYWxseS5cblx0ICpcblx0ICogQHJldHVybnMgQWxsIHRoZSBwcm9wZXJ0aWVzIGRlZmluZWQgb24gdGhlIG9iamVjdCB3aXRoIHRoZWlyIHZhbHVlc1xuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0cHVibGljIGdldFByb3BlcnRpZXMoKSB7XG5cdFx0Y29uc3QgYWxsUHJvcGVydGllczogUmVjb3JkPHN0cmluZywgT2JqZWN0VmFsdWU+ID0ge307XG5cdFx0Zm9yIChjb25zdCBvSW5zdGFuY2VLZXkgaW4gdGhpcykge1xuXHRcdFx0aWYgKHRoaXMuaGFzT3duUHJvcGVydHkob0luc3RhbmNlS2V5KSkge1xuXHRcdFx0XHRhbGxQcm9wZXJ0aWVzW29JbnN0YW5jZUtleV0gPSB0aGlzW29JbnN0YW5jZUtleV0gYXMgdW5rbm93biBhcyBPYmplY3RWYWx1ZTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGFsbFByb3BlcnRpZXM7XG5cdH1cblx0c3RhdGljIHJlZ2lzdGVyKCkge1xuXHRcdC8vIFRvIGJlIG92ZXJyaWRlblxuXHR9XG5cdHN0YXRpYyB1bnJlZ2lzdGVyKCkge1xuXHRcdC8vIFRvIGJlIG92ZXJyaWRlblxuXHR9XG5cblx0LyoqXG5cdCAqIEFkZCBhIHBhcnQgb2Ygc3RyaW5nIGJhc2VkIG9uIHRoZSBjb25kaXRpb24uXG5cdCAqXG5cdCAqIEBwYXJhbSBjb25kaXRpb25cblx0ICogQHBhcmFtIHBhcnRUb0FkZFxuXHQgKiBAcmV0dXJucyBUaGUgcGFydCB0byBhZGQgaWYgdGhlIGNvbmRpdGlvbiBpcyB0cnVlLCBvdGhlcndpc2UgYW4gZW1wdHkgc3RyaW5nXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRwcm90ZWN0ZWQgYWRkQ29uZGl0aW9uYWxseShjb25kaXRpb246IGJvb2xlYW4sIHBhcnRUb0FkZDogc3RyaW5nKTogc3RyaW5nIHtcblx0XHRpZiAoY29uZGl0aW9uKSB7XG5cdFx0XHRyZXR1cm4gcGFydFRvQWRkO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gXCJcIjtcblx0XHR9XG5cdH1cblx0LyoqXG5cdCAqIEFkZCBhbiBhdHRyaWJ1dGUgZGVwZW5kaW5nIG9uIHRoZSBjdXJyZW50IHZhbHVlIG9mIHRoZSBwcm9wZXJ0eS5cblx0ICogSWYgaXQncyB1bmRlZmluZWQgdGhlIGF0dHJpYnV0ZSBpcyBub3QgYWRkZWQuXG5cdCAqXG5cdCAqIEBwYXJhbSBhdHRyaWJ1dGVOYW1lXG5cdCAqIEBwYXJhbSB2YWx1ZVxuXHQgKiBAcmV0dXJucyBUaGUgYXR0cmlidXRlIHRvIGFkZCBpZiB0aGUgdmFsdWUgaXMgbm90IHVuZGVmaW5lZCwgb3RoZXJ3aXNlIGFuIGVtcHR5IHN0cmluZ1xuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0cHJvdGVjdGVkIGF0dHIoYXR0cmlidXRlTmFtZTogc3RyaW5nLCB2YWx1ZT86IFhNTFByb2Nlc3NvclR5cGVWYWx1ZSk6ICgpID0+IHN0cmluZyB7XG5cdFx0aWYgKHZhbHVlICE9PSB1bmRlZmluZWQgJiYgIWlzVW5kZWZpbmVkRXhwcmVzc2lvbih2YWx1ZSkpIHtcblx0XHRcdHJldHVybiAoKSA9PiB4bWxgJHthdHRyaWJ1dGVOYW1lfT1cIiR7dmFsdWV9XCJgO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gKCkgPT4gXCJcIjtcblx0XHR9XG5cdH1cbn1cblxuLyoqXG4gKiBCYXNlIGNsYXNzIGZvciBydW50aW1lIGJ1aWxkaW5nIGJsb2Nrc1xuICovXG5leHBvcnQgaW50ZXJmYWNlIFJ1bnRpbWVCdWlsZGluZ0Jsb2NrIGV4dGVuZHMgQnVpbGRpbmdCbG9ja0Jhc2Uge1xuXHRnZXRDb250ZW50KGNvbnRhaW5pbmdWaWV3OiBWaWV3LCBhcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudCk6IENvbnRyb2w7XG59XG5cbmV4cG9ydCB0eXBlIEJ1aWxkaW5nQmxvY2tQcm9wZXJ0eURlZmluaXRpb24gPSB7XG5cdHR5cGU6IHN0cmluZztcblx0aXNQdWJsaWM/OiBib29sZWFuO1xuXHRkZWZhdWx0VmFsdWU/OiB1bmtub3duO1xuXHQvKiogVGhpcyBwcm9wZXJ0eSBpcyBvbmx5IGV2YWx1YXRlZCBpbiB0aGUgVjEgQVBJICovXG5cdGNvbXB1dGVkPzogYm9vbGVhbjtcblx0cmVxdWlyZWQ/OiBib29sZWFuO1xuXHQvKiogVGhpcyBwcm9wZXJ0eSBpcyBvbmx5IGNvbnNpZGVyZWQgZm9yIHJ1bnRpbWUgYnVpbGRpbmcgYmxvY2tzICovXG5cdGJpbmRhYmxlPzogYm9vbGVhbjtcblx0JGtpbmQ/OiBzdHJpbmdbXTtcblx0JFR5cGU/OiBzdHJpbmdbXTtcblx0LyoqIEZ1bmN0aW9uIHRoYXQgYWxsb3dzIHRvIHZhbGlkYXRlIG9yIHRyYW5zZm9ybSB0aGUgZ2l2ZW4gaW5wdXQgKi9cblx0dmFsaWRhdGU/OiBGdW5jdGlvbjtcbn07XG5leHBvcnQgdHlwZSBCdWlsZGluZ0Jsb2NrTWV0YWRhdGFDb250ZXh0RGVmaW5pdGlvbiA9IHtcblx0dHlwZTogc3RyaW5nO1xuXHRpc1B1YmxpYz86IGJvb2xlYW47XG5cdHJlcXVpcmVkPzogYm9vbGVhbjtcblx0LyoqIFRoaXMgcHJvcGVydHkgaXMgb25seSBldmFsdWF0ZWQgaW4gdGhlIFYxIEFQSSAqL1xuXHRjb21wdXRlZD86IGJvb2xlYW47XG5cdCRUeXBlPzogc3RyaW5nW107XG5cdCRraW5kPzogc3RyaW5nW107XG59O1xuZXhwb3J0IHR5cGUgQnVpbGRpbmdCbG9ja0V2ZW50ID0ge307XG5leHBvcnQgdHlwZSBCdWlsZGluZ0Jsb2NrQWdncmVnYXRpb25EZWZpbml0aW9uID0ge1xuXHRpc1B1YmxpYz86IGJvb2xlYW47XG5cdHR5cGU6IHN0cmluZztcblx0c2xvdD86IHN0cmluZztcblx0aXNEZWZhdWx0PzogYm9vbGVhbjtcblx0LyoqIERlZmluZXMgd2hldGhlciB0aGUgZWxlbWVudCBpcyBiYXNlZCBvbiBhbiBhY3R1YWwgbm9kZSB0aGF0IHdpbGwgYmUgcmVuZGVyZWQgb3Igb25seSBvbiBYTUwgdGhhdCB3aWxsIGJlIGludGVycHJldGVkICovXG5cdGhhc1ZpcnR1YWxOb2RlPzogYm9vbGVhbjtcblx0cHJvY2Vzc0FnZ3JlZ2F0aW9ucz86IEZ1bmN0aW9uO1xufTtcbnR5cGUgQ29tbW9uQnVpbGRpbmdCbG9ja0RlZmluaXRpb24gPSB7XG5cdG5hbWVzcGFjZTogc3RyaW5nO1xuXHRuYW1lOiBzdHJpbmc7XG5cdHhtbFRhZz86IHN0cmluZztcblx0ZnJhZ21lbnQ/OiBzdHJpbmc7XG5cdHB1YmxpY05hbWVzcGFjZT86IHN0cmluZztcblx0ZGVzaWdudGltZT86IHN0cmluZztcblx0aXNSdW50aW1lPzogYm9vbGVhbjtcblx0aXNPcGVuPzogYm9vbGVhbjtcbn07XG5leHBvcnQgdHlwZSBCdWlsZGluZ0Jsb2NrRGVmaW5pdGlvblYyID0gQ29tbW9uQnVpbGRpbmdCbG9ja0RlZmluaXRpb24gJlxuXHQobmV3ICgpID0+IEJ1aWxkaW5nQmxvY2tCYXNlKSAmXG5cdHR5cGVvZiBCdWlsZGluZ0Jsb2NrQmFzZSAmIHtcblx0XHRhcGlWZXJzaW9uOiAyO1xuXHRcdGdldFRlbXBsYXRlPzogRnVuY3Rpb247XG5cdFx0bWV0YWRhdGE6IEJ1aWxkaW5nQmxvY2tNZXRhZGF0YTtcblx0fTtcblxuZXhwb3J0IHR5cGUgQnVpbGRpbmdCbG9ja0RlZmluaXRpb25WMSA9IENvbW1vbkJ1aWxkaW5nQmxvY2tEZWZpbml0aW9uICYge1xuXHRuYW1lOiBzdHJpbmc7XG5cdGFwaVZlcnNpb24/OiAxO1xuXHRjcmVhdGU/OiBGdW5jdGlvbjtcblx0Z2V0VGVtcGxhdGU/OiBGdW5jdGlvbjtcblx0bWV0YWRhdGE6IEJ1aWxkaW5nQmxvY2tNZXRhZGF0YTtcbn07XG5leHBvcnQgdHlwZSBCdWlsZGluZ0Jsb2NrRGVmaW5pdGlvbiA9IEJ1aWxkaW5nQmxvY2tEZWZpbml0aW9uVjIgfCBCdWlsZGluZ0Jsb2NrRGVmaW5pdGlvblYxO1xuZXhwb3J0IHR5cGUgQnVpbGRpbmdCbG9ja01ldGFkYXRhID0ge1xuXHRldmVudHM6IFJlY29yZDxzdHJpbmcsIEJ1aWxkaW5nQmxvY2tFdmVudD47XG5cdHByb3BlcnRpZXM6IFJlY29yZDxzdHJpbmcsIEJ1aWxkaW5nQmxvY2tQcm9wZXJ0eURlZmluaXRpb24+O1xuXHRhZ2dyZWdhdGlvbnM6IFJlY29yZDxzdHJpbmcsIEJ1aWxkaW5nQmxvY2tBZ2dyZWdhdGlvbkRlZmluaXRpb24+O1xuXHRzdGVyZW90eXBlPzogc3RyaW5nO1xuXHRkZXNpZ250aW1lPzogc3RyaW5nO1xufTtcblxuY29uc3QgZW5zdXJlTWV0YWRhdGEgPSBmdW5jdGlvbiAodGFyZ2V0OiBQYXJ0aWFsPEJ1aWxkaW5nQmxvY2tEZWZpbml0aW9uVjI+KTogQnVpbGRpbmdCbG9ja01ldGFkYXRhIHtcblx0aWYgKCF0YXJnZXQuaGFzT3duUHJvcGVydHkoXCJtZXRhZGF0YVwiKSkge1xuXHRcdHRhcmdldC5tZXRhZGF0YSA9IGRlZXBDbG9uZShcblx0XHRcdHRhcmdldC5tZXRhZGF0YSB8fCB7XG5cdFx0XHRcdHByb3BlcnRpZXM6IHt9LFxuXHRcdFx0XHRhZ2dyZWdhdGlvbnM6IHt9LFxuXHRcdFx0XHRldmVudHM6IHt9LFxuXHRcdFx0XHRzdGVyZW90eXBlOiBcInhtbG1hY3JvXCIsXG5cdFx0XHRcdGRlc2lnbnRpbWU6IFwiXCJcblx0XHRcdH1cblx0XHQpO1xuXHR9XG5cdHJldHVybiB0YXJnZXQubWV0YWRhdGEgYXMgQnVpbGRpbmdCbG9ja01ldGFkYXRhO1xufTtcblxuLyoqXG4gKiBEZWNvcmF0b3IgZm9yIGJ1aWxkaW5nIGJsb2Nrcy5cbiAqXG4gKiBAcGFyYW0gYXR0cmlidXRlRGVmaW5pdGlvblxuICogQGRlcHJlY2F0ZWQgdXNlIGBibG9ja0F0dHJpYnV0ZWAgaW5zdGVhZFxuICogQHJldHVybnMgVGhlIGRlY29yYXRlZCBwcm9wZXJ0eVxuICovXG5leHBvcnQgZnVuY3Rpb24geG1sQXR0cmlidXRlKGF0dHJpYnV0ZURlZmluaXRpb246IEJ1aWxkaW5nQmxvY2tQcm9wZXJ0eURlZmluaXRpb24pOiBQcm9wZXJ0eURlY29yYXRvciB7XG5cdHJldHVybiBmdW5jdGlvbiAodGFyZ2V0OiBCdWlsZGluZ0Jsb2NrQmFzZSwgcHJvcGVydHlLZXk6IHN0cmluZyB8IFN5bWJvbCwgcHJvcGVydHlEZXNjcmlwdG9yOiBBY2Nlc3NvckRlc2NyaXB0b3I8dW5rbm93bj4pIHtcblx0XHRjb25zdCBtZXRhZGF0YSA9IGVuc3VyZU1ldGFkYXRhKHRhcmdldC5jb25zdHJ1Y3Rvcik7XG5cdFx0aWYgKGF0dHJpYnV0ZURlZmluaXRpb24uZGVmYXVsdFZhbHVlID09PSB1bmRlZmluZWQpIHtcblx0XHRcdC8vIElmIHRoZXJlIGlzIG5vIGRlZmF1bHRWYWx1ZSB3ZSBjYW4gdGFrZSB0aGUgdmFsdWUgZnJvbSB0aGUgaW5pdGlhbGl6ZXIgKG5hdHVyYWwgd2F5IG9mIGRlZmluaW5nIGRlZmF1bHRzKVxuXHRcdFx0YXR0cmlidXRlRGVmaW5pdGlvbi5kZWZhdWx0VmFsdWUgPSBwcm9wZXJ0eURlc2NyaXB0b3IuaW5pdGlhbGl6ZXI/LigpO1xuXHRcdH1cblx0XHRkZWxldGUgcHJvcGVydHlEZXNjcmlwdG9yLmluaXRpYWxpemVyO1xuXHRcdGlmIChtZXRhZGF0YS5wcm9wZXJ0aWVzW3Byb3BlcnR5S2V5LnRvU3RyaW5nKCldID09PSB1bmRlZmluZWQpIHtcblx0XHRcdG1ldGFkYXRhLnByb3BlcnRpZXNbcHJvcGVydHlLZXkudG9TdHJpbmcoKV0gPSBhdHRyaWJ1dGVEZWZpbml0aW9uO1xuXHRcdH1cblxuXHRcdHJldHVybiBwcm9wZXJ0eURlc2NyaXB0b3I7XG5cdH0gYXMgdW5rbm93biBhcyBQcm9wZXJ0eURlY29yYXRvcjsgLy8gTmVlZGVkIHRvIG1ha2UgVFMgaGFwcHkgd2l0aCB0aG9zZSBkZWNvcmF0b3JzO1xufVxuXG4vKipcbiAqIEluZGljYXRlcyB0aGF0IHRoZSBwcm9wZXJ0eSBzaGFsbCBiZSBkZWNsYXJlZCBhcyBhbiB4bWwgYXR0cmlidXRlIHRoYXQgY2FuIGJlIHVzZWQgZnJvbSB0aGUgb3V0c2lkZSBvZiB0aGUgYnVpbGRpbmcgYmxvY2suXG4gKlxuICogSWYgZGVmaW5pbmcgYSBydW50aW1lIEJ1aWxkaW5nIEJsb2NrLCBwbGVhc2UgbWFrZSBzdXJlIHRvIHVzZSB0aGUgY29ycmVjdCB0eXBpbmdzOiBEZXBlbmRpbmcgb24gaXRzIG1ldGFkYXRhLFxuICogYSBwcm9wZXJ0eSBjYW4gZWl0aGVyIGJlIGEge0BsaW5rIHNhcC51aS5tb2RlbC5Db250ZXh0fSAoPGNvZGU+dHlwZTogJ3NhcC51aS5tb2RlbC5Db250ZXh0JzwvY29kZT4pLFxuICogYSBjb25zdGFudCAoPGNvZGU+YmluZGFibGU6IGZhbHNlPC9jb2RlPiksIG9yIGEge0BsaW5rIEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbn0gKDxjb2RlPmJpbmRhYmxlOiB0cnVlPC9jb2RlPikuXG4gKlxuICogQHBhcmFtIGF0dHJpYnV0ZURlZmluaXRpb25cbiAqIEByZXR1cm5zIFRoZSBkZWNvcmF0ZWQgcHJvcGVydHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJsb2NrQXR0cmlidXRlKGF0dHJpYnV0ZURlZmluaXRpb246IEJ1aWxkaW5nQmxvY2tQcm9wZXJ0eURlZmluaXRpb24pOiBQcm9wZXJ0eURlY29yYXRvciB7XG5cdHJldHVybiB4bWxBdHRyaWJ1dGUoYXR0cmlidXRlRGVmaW5pdGlvbik7XG59XG5cbi8qKlxuICogRGVjb3JhdG9yIGZvciBidWlsZGluZyBibG9ja3MuXG4gKlxuICogQGRlcHJlY2F0ZWQgdXNlIGBibG9ja0V2ZW50YCBpbnN0ZWFkXG4gKiBAcmV0dXJucyBUaGUgZGVjb3JhdGVkIHByb3BlcnR5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB4bWxFdmVudCgpOiBQcm9wZXJ0eURlY29yYXRvciB7XG5cdHJldHVybiBmdW5jdGlvbiAodGFyZ2V0OiBCdWlsZGluZ0Jsb2NrQmFzZSwgcHJvcGVydHlLZXk6IHN0cmluZyB8IFN5bWJvbCwgcHJvcGVydHlEZXNjcmlwdG9yOiBBY2Nlc3NvckRlc2NyaXB0b3I8dW5rbm93bj4pIHtcblx0XHRjb25zdCBtZXRhZGF0YSA9IGVuc3VyZU1ldGFkYXRhKHRhcmdldC5jb25zdHJ1Y3Rvcik7XG5cdFx0ZGVsZXRlIHByb3BlcnR5RGVzY3JpcHRvci5pbml0aWFsaXplcjtcblx0XHRpZiAobWV0YWRhdGEuZXZlbnRzW3Byb3BlcnR5S2V5LnRvU3RyaW5nKCldID09PSB1bmRlZmluZWQpIHtcblx0XHRcdG1ldGFkYXRhLmV2ZW50c1twcm9wZXJ0eUtleS50b1N0cmluZygpXSA9IHsgdHlwZTogXCJmdW5jdGlvblwiIH07XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHByb3BlcnR5RGVzY3JpcHRvcjtcblx0fSBhcyB1bmtub3duIGFzIFByb3BlcnR5RGVjb3JhdG9yOyAvLyBOZWVkZWQgdG8gbWFrZSBUUyBoYXBweSB3aXRoIHRob3NlIGRlY29yYXRvcnM7XG59XG5leHBvcnQgZnVuY3Rpb24gYmxvY2tFdmVudCgpOiBQcm9wZXJ0eURlY29yYXRvciB7XG5cdHJldHVybiB4bWxFdmVudCgpO1xufVxuXG4vKipcbiAqIERlY29yYXRvciBmb3IgYnVpbGRpbmcgYmxvY2tzLlxuICpcbiAqIEBwYXJhbSBhZ2dyZWdhdGlvbkRlZmluaXRpb25cbiAqIEByZXR1cm5zIFRoZSBkZWNvcmF0ZWQgcHJvcGVydHlcbiAqIEBkZXByZWNhdGVkIHVzZSBgYmxvY2tBZ2dyZWdhdGlvbmAgaW5zdGVhZFxuICovXG5leHBvcnQgZnVuY3Rpb24geG1sQWdncmVnYXRpb24oYWdncmVnYXRpb25EZWZpbml0aW9uOiBCdWlsZGluZ0Jsb2NrQWdncmVnYXRpb25EZWZpbml0aW9uKTogUHJvcGVydHlEZWNvcmF0b3Ige1xuXHRyZXR1cm4gZnVuY3Rpb24gKHRhcmdldDogQnVpbGRpbmdCbG9ja0Jhc2UsIHByb3BlcnR5S2V5OiBzdHJpbmcsIHByb3BlcnR5RGVzY3JpcHRvcjogQWNjZXNzb3JEZXNjcmlwdG9yPHVua25vd24+KSB7XG5cdFx0Y29uc3QgbWV0YWRhdGEgPSBlbnN1cmVNZXRhZGF0YSh0YXJnZXQuY29uc3RydWN0b3IpO1xuXHRcdGRlbGV0ZSBwcm9wZXJ0eURlc2NyaXB0b3IuaW5pdGlhbGl6ZXI7XG5cdFx0aWYgKG1ldGFkYXRhLmFnZ3JlZ2F0aW9uc1twcm9wZXJ0eUtleV0gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0bWV0YWRhdGEuYWdncmVnYXRpb25zW3Byb3BlcnR5S2V5XSA9IGFnZ3JlZ2F0aW9uRGVmaW5pdGlvbjtcblx0XHR9XG5cblx0XHRyZXR1cm4gcHJvcGVydHlEZXNjcmlwdG9yO1xuXHR9IGFzIHVua25vd24gYXMgUHJvcGVydHlEZWNvcmF0b3I7XG59XG4vKipcbiAqIEluZGljYXRlcyB0aGF0IHRoZSBwcm9wZXJ0eSBzaGFsbCBiZSBkZWNsYXJlZCBhcyBhbiB4bWwgYWdncmVnYXRpb24gdGhhdCBjYW4gYmUgdXNlZCBmcm9tIHRoZSBvdXRzaWRlIG9mIHRoZSBidWlsZGluZyBibG9jay5cbiAqXG4gKiBAcGFyYW0gYWdncmVnYXRpb25EZWZpbml0aW9uXG4gKiBAcmV0dXJucyBUaGUgZGVjb3JhdGVkIHByb3BlcnR5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBibG9ja0FnZ3JlZ2F0aW9uKGFnZ3JlZ2F0aW9uRGVmaW5pdGlvbjogQnVpbGRpbmdCbG9ja0FnZ3JlZ2F0aW9uRGVmaW5pdGlvbik6IFByb3BlcnR5RGVjb3JhdG9yIHtcblx0cmV0dXJuIHhtbEFnZ3JlZ2F0aW9uKGFnZ3JlZ2F0aW9uRGVmaW5pdGlvbik7XG59XG5jb25zdCBSVU5USU1FX0JMT0NLUzogUmVjb3JkPHN0cmluZywgUnVudGltZUJ1aWxkaW5nQmxvY2sgJiBCdWlsZGluZ0Jsb2NrRGVmaW5pdGlvblYyPiA9IHt9O1xuZXhwb3J0IGZ1bmN0aW9uIGRlZmluZUJ1aWxkaW5nQmxvY2sob0J1aWxkaW5nQmxvY2tEZWZpbml0aW9uOiBDb21tb25CdWlsZGluZ0Jsb2NrRGVmaW5pdGlvbik6IENsYXNzRGVjb3JhdG9yIHtcblx0cmV0dXJuIGZ1bmN0aW9uIChjbGFzc0RlZmluaXRpb246IFBhcnRpYWw8QnVpbGRpbmdCbG9ja0RlZmluaXRpb25WMj4pIHtcblx0XHRjb25zdCBtZXRhZGF0YSA9IGVuc3VyZU1ldGFkYXRhKGNsYXNzRGVmaW5pdGlvbik7XG5cdFx0bWV0YWRhdGEuZGVzaWdudGltZSA9IG9CdWlsZGluZ0Jsb2NrRGVmaW5pdGlvbi5kZXNpZ250aW1lO1xuXHRcdGNsYXNzRGVmaW5pdGlvbi54bWxUYWcgPSBvQnVpbGRpbmdCbG9ja0RlZmluaXRpb24ubmFtZTtcblx0XHRjbGFzc0RlZmluaXRpb24ubmFtZXNwYWNlID0gb0J1aWxkaW5nQmxvY2tEZWZpbml0aW9uLm5hbWVzcGFjZTtcblx0XHRjbGFzc0RlZmluaXRpb24ucHVibGljTmFtZXNwYWNlID0gb0J1aWxkaW5nQmxvY2tEZWZpbml0aW9uLnB1YmxpY05hbWVzcGFjZTtcblx0XHRjbGFzc0RlZmluaXRpb24uZnJhZ21lbnQgPSBvQnVpbGRpbmdCbG9ja0RlZmluaXRpb24uZnJhZ21lbnQ7XG5cdFx0Y2xhc3NEZWZpbml0aW9uLmlzT3BlbiA9IG9CdWlsZGluZ0Jsb2NrRGVmaW5pdGlvbi5pc09wZW47XG5cdFx0Y2xhc3NEZWZpbml0aW9uLmlzUnVudGltZSA9IG9CdWlsZGluZ0Jsb2NrRGVmaW5pdGlvbi5pc1J1bnRpbWU7XG5cdFx0Y2xhc3NEZWZpbml0aW9uLmFwaVZlcnNpb24gPSAyO1xuXHRcdGlmIChjbGFzc0RlZmluaXRpb24uaXNSdW50aW1lID09PSB0cnVlKSB7XG5cdFx0XHRjbGFzc0RlZmluaXRpb24ucHJvdG90eXBlLmdldFRlbXBsYXRlID0gZnVuY3Rpb24gKG9Ob2RlOiBFbGVtZW50KSB7XG5cdFx0XHRcdGNvbnN0IGNsYXNzTmFtZSA9IGAke29CdWlsZGluZ0Jsb2NrRGVmaW5pdGlvbi5uYW1lc3BhY2V9LiR7b0J1aWxkaW5nQmxvY2tEZWZpbml0aW9uLm5hbWV9YDtcblx0XHRcdFx0Y29uc3QgZXh0cmFQcm9wcyA9IFtdO1xuXHRcdFx0XHQvLyBGdW5jdGlvbiBhcmUgZGVmaW5lZCBhcyBzdHJpbmcgYnV0IG5lZWQgdG8gYmUgcmVzb2x2ZWQgYnkgVUk1LCBhcyBzdWNoIHdlIHN0b3JlIHRoZW0gaW4gYW4gYGV2ZW50YCBwcm9wZXJ0eSBhbmQgd2lsbCByZWRpc3BhdGNoIHRoZW0gbGF0ZXJcblx0XHRcdFx0Y29uc3QgZnVuY3Rpb25Ib2xkZXJEZWZpbml0aW9uID0gW107XG5cdFx0XHRcdGNvbnN0IHByb3BlcnRpZXNBc3NpZ25lZFRvRnVuY3Rpb24gPSBbXTtcblx0XHRcdFx0Y29uc3QgZnVuY3Rpb25TdHJpbmdJbk9yZGVyID0gW107XG5cdFx0XHRcdGZvciAoY29uc3QgcHJvcGVydGllc0tleSBpbiBtZXRhZGF0YS5wcm9wZXJ0aWVzKSB7XG5cdFx0XHRcdFx0bGV0IHByb3BlcnR5VmFsdWUgPSB0aGlzW3Byb3BlcnRpZXNLZXldO1xuXHRcdFx0XHRcdGlmIChwcm9wZXJ0eVZhbHVlICE9PSB1bmRlZmluZWQgJiYgcHJvcGVydHlWYWx1ZSAhPT0gbnVsbCkge1xuXHRcdFx0XHRcdFx0aWYgKGlzQ29udGV4dChwcm9wZXJ0eVZhbHVlKSkge1xuXHRcdFx0XHRcdFx0XHRwcm9wZXJ0eVZhbHVlID0gcHJvcGVydHlWYWx1ZS5nZXRQYXRoKCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRpZiAobWV0YWRhdGEucHJvcGVydGllc1twcm9wZXJ0aWVzS2V5XS50eXBlID09PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdFx0XHRcdFx0ZnVuY3Rpb25Ib2xkZXJEZWZpbml0aW9uLnB1c2gocHJvcGVydHlWYWx1ZSk7XG5cdFx0XHRcdFx0XHRcdGZ1bmN0aW9uU3RyaW5nSW5PcmRlci5wdXNoKHByb3BlcnR5VmFsdWUpO1xuXHRcdFx0XHRcdFx0XHRwcm9wZXJ0aWVzQXNzaWduZWRUb0Z1bmN0aW9uLnB1c2gocHJvcGVydGllc0tleSk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRleHRyYVByb3BzLnB1c2goeG1sYGZlQkI6JHtwcm9wZXJ0aWVzS2V5fT1cIiR7cHJvcGVydHlWYWx1ZSBhcyBYTUxQcm9jZXNzb3JUeXBlVmFsdWV9XCJgKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKGZ1bmN0aW9uSG9sZGVyRGVmaW5pdGlvbi5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0ZXh0cmFQcm9wcy5wdXNoKHhtbGBmdW5jdGlvbkhvbGRlcj1cIiR7ZnVuY3Rpb25Ib2xkZXJEZWZpbml0aW9uLmpvaW4oXCI7XCIpfVwiYCk7XG5cdFx0XHRcdFx0ZXh0cmFQcm9wcy5wdXNoKHhtbGBmZUJCOmZ1bmN0aW9uU3RyaW5nSW5PcmRlcj1cIiR7ZnVuY3Rpb25TdHJpbmdJbk9yZGVyLmpvaW4oXCIsXCIpfVwiYCk7XG5cdFx0XHRcdFx0ZXh0cmFQcm9wcy5wdXNoKHhtbGBmZUJCOnByb3BlcnRpZXNBc3NpZ25lZFRvRnVuY3Rpb249XCIke3Byb3BlcnRpZXNBc3NpZ25lZFRvRnVuY3Rpb24uam9pbihcIixcIil9XCJgKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRmb3IgKGNvbnN0IGV2ZW50c0tleSBpbiBtZXRhZGF0YS5ldmVudHMpIHtcblx0XHRcdFx0XHRjb25zdCBldmVudHNWYWx1ZSA9IHRoaXNbZXZlbnRzS2V5XTtcblx0XHRcdFx0XHRpZiAoZXZlbnRzVmFsdWUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdFx0ZXh0cmFQcm9wcy5wdXNoKHhtbGBmZUJCOiR7ZXZlbnRzS2V5fT1cIiR7ZXZlbnRzVmFsdWUgYXMgWE1MUHJvY2Vzc29yVHlwZVZhbHVlfVwiYCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIGNvcmU6cmVxdWlyZSBuZWVkIHRvIGJlIGRlZmluZWQgb24gdGhlIG5vZGUgaXRzZWxmIHRvIGJlIHBpY2tlZCB1cCBkdWUgdG8gdGhlIHRlbXBsYXRpbmcgc3RlcFxuXHRcdFx0XHRjb25zdCBjb3JlUmVxdWlyZSA9IG9Ob2RlLmdldEF0dHJpYnV0ZShcImNvcmU6cmVxdWlyZVwiKSB8fCB1bmRlZmluZWQ7XG5cdFx0XHRcdGlmIChjb3JlUmVxdWlyZSkge1xuXHRcdFx0XHRcdGV4dHJhUHJvcHMucHVzaCh4bWxgY29yZTpyZXF1aXJlPVwiJHtjb3JlUmVxdWlyZX1cImApO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiB4bWxgPGZlQkI6QnVpbGRpbmdCbG9ja0ZyYWdtZW50XG5cdFx0XHRcdFx0eG1sbnM6Y29yZT1cInNhcC51aS5jb3JlXCJcblx0XHRcdFx0XHR4bWxuczpmZUJCPVwic2FwLmZlLmNvcmUuYnVpbGRpbmdCbG9ja3NcIlxuXHRcdFx0XHRcdGZyYWdtZW50TmFtZT1cIiR7Y2xhc3NOYW1lfVwiXG5cblx0XHRcdFx0XHRpZD1cInt0aGlzPmlkfVwiXG5cdFx0XHRcdFx0dHlwZT1cIkZFX0NPTVBPTkVOVFNcIlxuXHRcdFx0XHRcdCR7ZXh0cmFQcm9wc31cblx0XHRcdFx0PlxuXHRcdFx0XHQ8L2ZlQkI6QnVpbGRpbmdCbG9ja0ZyYWdtZW50PmA7XG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdGNsYXNzRGVmaW5pdGlvbi5yZWdpc3RlciA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdHJlZ2lzdGVyQnVpbGRpbmdCbG9jayhjbGFzc0RlZmluaXRpb24gYXMgQnVpbGRpbmdCbG9ja0RlZmluaXRpb25WMik7XG5cdFx0XHRpZiAoY2xhc3NEZWZpbml0aW9uLmlzUnVudGltZSA9PT0gdHJ1ZSkge1xuXHRcdFx0XHRSVU5USU1FX0JMT0NLU1tgJHtvQnVpbGRpbmdCbG9ja0RlZmluaXRpb24ubmFtZXNwYWNlfS4ke29CdWlsZGluZ0Jsb2NrRGVmaW5pdGlvbi5uYW1lfWBdID1cblx0XHRcdFx0XHRjbGFzc0RlZmluaXRpb24gYXMgUnVudGltZUJ1aWxkaW5nQmxvY2sgJiBCdWlsZGluZ0Jsb2NrRGVmaW5pdGlvblYyO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0Y2xhc3NEZWZpbml0aW9uLnVucmVnaXN0ZXIgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRYTUxQcmVwcm9jZXNzb3IucGx1Z0luKG51bGwsIGNsYXNzRGVmaW5pdGlvbi5uYW1lc3BhY2UsIGNsYXNzRGVmaW5pdGlvbi5uYW1lKTtcblx0XHRcdFhNTFByZXByb2Nlc3Nvci5wbHVnSW4obnVsbCwgY2xhc3NEZWZpbml0aW9uLnB1YmxpY05hbWVzcGFjZSwgY2xhc3NEZWZpbml0aW9uLm5hbWUpO1xuXHRcdH07XG5cdH07XG59XG50eXBlIEZyYWdtZW50Q3VzdG9tRGF0YSA9IHtcblx0bVByb3BlcnRpZXM6IHtcblx0XHR2YWx1ZToge1xuXHRcdFx0XCJzYXAuZmUuY29yZS5idWlsZGluZ0Jsb2Nrc1wiPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcblx0XHR9O1xuXHR9O1xufTtcbnR5cGUgRkVDb21wb25lbnRGcmFnbWVudFNldHRpbmdzID0ge1xuXHRmcmFnbWVudE5hbWU6IHN0cmluZztcblx0ZnJhZ21lbnRDb250ZW50PzogUnVudGltZUJ1aWxkaW5nQmxvY2sgJiBCdWlsZGluZ0Jsb2NrRGVmaW5pdGlvblYyO1xuXHRjb250YWluaW5nVmlldzogVmlldztcblx0Y3VzdG9tRGF0YT86IEZyYWdtZW50Q3VzdG9tRGF0YVtdO1xuXHRmdW5jdGlvbkhvbGRlcj86IEZ1bmN0aW9uV2l0aEhhbmRsZXJbXVtdO1xufTtcblxudHlwZSBGdW5jdGlvbldpdGhIYW5kbGVyID0gRnVuY3Rpb24gJiB7XG5cdF9zYXB1aV9oYW5kbGVyTmFtZT86IHN0cmluZztcbn07XG50eXBlIEZyYWdtZW50V2l0aEludGVybmFscyA9IHtcblx0X2JBc3luYzogYm9vbGVhbjtcblx0X2FDb250ZW50OiBDb250cm9sIHwgQ29udHJvbFtdO1xufTtcbkJ1aWxkaW5nQmxvY2tGcmFnbWVudC5yZWdpc3RlclR5cGUoXCJGRV9DT01QT05FTlRTXCIsIHtcblx0bG9hZDogYXN5bmMgZnVuY3Rpb24gKG1TZXR0aW5nczogRkVDb21wb25lbnRGcmFnbWVudFNldHRpbmdzKSB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShSVU5USU1FX0JMT0NLU1ttU2V0dGluZ3MuZnJhZ21lbnROYW1lXSk7XG5cdH0sXG5cdGluaXQ6IGZ1bmN0aW9uICh0aGlzOiBGcmFnbWVudFdpdGhJbnRlcm5hbHMsIG1TZXR0aW5nczogRkVDb21wb25lbnRGcmFnbWVudFNldHRpbmdzKSB7XG5cdFx0bGV0IE15Q2xhc3MgPSBtU2V0dGluZ3MuZnJhZ21lbnRDb250ZW50O1xuXHRcdGlmICghTXlDbGFzcykge1xuXHRcdFx0Ly8gSW4gc29tZSBjYXNlIHdlIG1pZ2h0IGhhdmUgYmVlbiBjYWxsZWQgaGVyZSBzeW5jaHJvbm91c2x5ICh1bnN0YXNoIGNhc2UgZm9yIGluc3RhbmNlKSwgd2hpY2ggbWVhbnMgd2UgZGlkbid0IGdvIHRocm91Z2ggdGhlIGxvYWQgZnVuY3Rpb25cblx0XHRcdE15Q2xhc3MgPSBSVU5USU1FX0JMT0NLU1ttU2V0dGluZ3MuZnJhZ21lbnROYW1lXTtcblx0XHR9XG5cdFx0Y29uc3QgY2xhc3NTZXR0aW5nczogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7fTtcblx0XHRjb25zdCBmZUN1c3RvbURhdGE6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSBtU2V0dGluZ3M/LmN1c3RvbURhdGE/LlswXT8ubVByb3BlcnRpZXM/LnZhbHVlPy5bXCJzYXAuZmUuY29yZS5idWlsZGluZ0Jsb2Nrc1wiXSB8fCB7fTtcblx0XHRkZWxldGUgbVNldHRpbmdzLmN1c3RvbURhdGE7XG5cdFx0Y29uc3QgZnVuY3Rpb25Ib2xkZXI6IEZ1bmN0aW9uV2l0aEhhbmRsZXJbXVtdID0gbVNldHRpbmdzLmZ1bmN0aW9uSG9sZGVyID8/IFtdO1xuXHRcdGRlbGV0ZSBtU2V0dGluZ3MuZnVuY3Rpb25Ib2xkZXI7XG5cblx0XHQvLyBjb250YWluaW5nVmlldyBjYW4gYWxzbyBiZSBhIGZyYWdtZW50LCBzbyB3ZSBoYXZlIHRvIHVzZSB0aGUgY29udHJvbGxlciB0byBiZSBzdXJlIHRvIGdldCB0aGUgYWN0dWFsIHZpZXdcblx0XHRjb25zdCBjb250YWluaW5nVmlldyA9IG1TZXR0aW5ncy5jb250YWluaW5nVmlldy5nZXRDb250cm9sbGVyPy4oKS5nZXRWaWV3KCkgPz8gbVNldHRpbmdzLmNvbnRhaW5pbmdWaWV3O1xuXHRcdGNvbnN0IHBhZ2VDb21wb25lbnQgPSBDb21wb25lbnQuZ2V0T3duZXJDb21wb25lbnRGb3IoY29udGFpbmluZ1ZpZXcpIGFzIFRlbXBsYXRlQ29tcG9uZW50O1xuXHRcdGNvbnN0IGFwcENvbXBvbmVudCA9IENvbW1vblV0aWxzLmdldEFwcENvbXBvbmVudChjb250YWluaW5nVmlldyk7XG5cblx0XHRjb25zdCBtZXRhTW9kZWwgPSBhcHBDb21wb25lbnQuZ2V0TWV0YU1vZGVsKCk7XG5cdFx0Y29uc3QgcGFnZU1vZGVsID0gcGFnZUNvbXBvbmVudC5nZXRNb2RlbChcIl9wYWdlTW9kZWxcIik7XG5cblx0XHRjb25zdCBmdW5jdGlvblN0cmluZ0luT3JkZXI6IHN0cmluZ1tdID0gZmVDdXN0b21EYXRhLmZ1bmN0aW9uU3RyaW5nSW5PcmRlcj8uc3BsaXQoXCIsXCIpO1xuXHRcdGNvbnN0IHByb3BlcnRpZXNBc3NpZ25lZFRvRnVuY3Rpb246IHN0cmluZ1tdID0gZmVDdXN0b21EYXRhLnByb3BlcnRpZXNBc3NpZ25lZFRvRnVuY3Rpb24/LnNwbGl0KFwiLFwiKTtcblx0XHRmb3IgKGNvbnN0IHByb3BlcnR5TmFtZSBpbiBNeUNsYXNzLm1ldGFkYXRhLnByb3BlcnRpZXMpIHtcblx0XHRcdGNvbnN0IHByb3BlcnR5TWV0YWRhdGEgPSBNeUNsYXNzLm1ldGFkYXRhLnByb3BlcnRpZXNbcHJvcGVydHlOYW1lXTtcblx0XHRcdGNvbnN0IHBhZ2VNb2RlbENvbnRleHQgPSBwYWdlTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoZmVDdXN0b21EYXRhW3Byb3BlcnR5TmFtZV0pO1xuXG5cdFx0XHRpZiAocGFnZU1vZGVsQ29udGV4dCA9PT0gbnVsbCkge1xuXHRcdFx0XHQvLyB2YWx1ZSBjYW5ub3QgYmUgcmVzb2x2ZWQsIHNvIGl0IGlzIGVpdGhlciBhIHJ1bnRpbWUgYmluZGluZyBvciBhIGNvbnN0YW50XG5cdFx0XHRcdGxldCB2YWx1ZTogc3RyaW5nIHwgYm9vbGVhbiB8IG51bWJlciB8IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxzdHJpbmcgfCBib29sZWFuIHwgbnVtYmVyPiA9IGZlQ3VzdG9tRGF0YVtwcm9wZXJ0eU5hbWVdO1xuXG5cdFx0XHRcdGlmICh0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdFx0XHRpZiAocHJvcGVydHlNZXRhZGF0YS5iaW5kYWJsZSAhPT0gdHJ1ZSkge1xuXHRcdFx0XHRcdFx0Ly8gcnVudGltZSBiaW5kaW5ncyBhcmUgbm90IGFsbG93ZWQsIHNvIGNvbnZlcnQgc3RyaW5ncyBpbnRvIGFjdHVhbCBwcmltaXRpdmUgdHlwZXNcblx0XHRcdFx0XHRcdHN3aXRjaCAocHJvcGVydHlNZXRhZGF0YS50eXBlKSB7XG5cdFx0XHRcdFx0XHRcdGNhc2UgXCJib29sZWFuXCI6XG5cdFx0XHRcdFx0XHRcdFx0dmFsdWUgPSB2YWx1ZSA9PT0gXCJ0cnVlXCI7XG5cdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdGNhc2UgXCJudW1iZXJcIjpcblx0XHRcdFx0XHRcdFx0XHR2YWx1ZSA9IE51bWJlcih2YWx1ZSk7XG5cdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdC8vIHJ1bnRpbWUgYmluZGluZ3MgYXJlIGFsbG93ZWQsIHNvIHJlc29sdmUgdGhlIHZhbHVlcyBhcyBCaW5kaW5nVG9vbGtpdCBleHByZXNzaW9uc1xuXHRcdFx0XHRcdFx0dmFsdWUgPSByZXNvbHZlQmluZGluZ1N0cmluZyh2YWx1ZSwgcHJvcGVydHlNZXRhZGF0YS50eXBlKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSBpZiAocHJvcGVydHlNZXRhZGF0YS50eXBlID09PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdFx0XHRjb25zdCBmdW5jdGlvbkluZGV4ID0gcHJvcGVydGllc0Fzc2lnbmVkVG9GdW5jdGlvbi5pbmRleE9mKHByb3BlcnR5TmFtZSk7XG5cdFx0XHRcdFx0Y29uc3QgZnVuY3Rpb25TdHJpbmcgPSBmdW5jdGlvblN0cmluZ0luT3JkZXJbZnVuY3Rpb25JbmRleF07XG5cdFx0XHRcdFx0Y29uc3QgdGFyZ2V0RnVuY3Rpb24gPSBmdW5jdGlvbkhvbGRlcj8uZmluZCgoZnVuY3Rpb25EZWYpID0+IGZ1bmN0aW9uRGVmWzBdPy5fc2FwdWlfaGFuZGxlck5hbWUgPT09IGZ1bmN0aW9uU3RyaW5nKTtcblx0XHRcdFx0XHQvLyBXZSB1c2UgdGhlIF9zYXB1aV9oYW5kbGVyTmFtZSB0byBpZGVudGlmeSB3aGljaCBmdW5jdGlvbiBpcyB0aGUgb25lIHdlIHdhbnQgdG8gYmluZCBoZXJlXG5cdFx0XHRcdFx0aWYgKHRhcmdldEZ1bmN0aW9uICYmIHRhcmdldEZ1bmN0aW9uLmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0XHRcdHZhbHVlID0gdGFyZ2V0RnVuY3Rpb25bMF0uYmluZCh0YXJnZXRGdW5jdGlvblsxXSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y2xhc3NTZXR0aW5nc1twcm9wZXJ0eU5hbWVdID0gdmFsdWU7XG5cdFx0XHR9IGVsc2UgaWYgKHBhZ2VNb2RlbENvbnRleHQuZ2V0T2JqZWN0KCkgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHQvLyBnZXQgdmFsdWUgZnJvbSBwYWdlIG1vZGVsXG5cdFx0XHRcdGNsYXNzU2V0dGluZ3NbcHJvcGVydHlOYW1lXSA9IHBhZ2VNb2RlbENvbnRleHQuZ2V0T2JqZWN0KCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBiaW5kIHRvIG1ldGFtb2RlbFxuXHRcdFx0XHRjbGFzc1NldHRpbmdzW3Byb3BlcnR5TmFtZV0gPSBtZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoZmVDdXN0b21EYXRhW3Byb3BlcnR5TmFtZV0pO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRmb3IgKGNvbnN0IGV2ZW50TmFtZSBpbiBNeUNsYXNzLm1ldGFkYXRhLmV2ZW50cykge1xuXHRcdFx0aWYgKGZlQ3VzdG9tRGF0YVtldmVudE5hbWVdICE9PSB1bmRlZmluZWQgJiYgZmVDdXN0b21EYXRhW2V2ZW50TmFtZV0uc3RhcnRzV2l0aChcIi5cIikpIHtcblx0XHRcdFx0Y2xhc3NTZXR0aW5nc1tldmVudE5hbWVdID0gT2JqZWN0UGF0aC5nZXQoZmVDdXN0b21EYXRhW2V2ZW50TmFtZV0uc3Vic3RyaW5nKDEpLCBjb250YWluaW5nVmlldy5nZXRDb250cm9sbGVyKCkpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y2xhc3NTZXR0aW5nc1tldmVudE5hbWVdID0gXCJcIjsgLy8gRm9yIG5vdywgbWlnaHQgbmVlZCB0byByZXNvbHZlIG1vcmUgc3R1ZmZcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIChNYW5hZ2VkT2JqZWN0IGFzIHVua25vd24gYXMgTWFuYWdlZE9iamVjdEV4KS5ydW5XaXRoUHJlcHJvY2Vzc29ycyhcblx0XHRcdCgpID0+IHtcblx0XHRcdFx0Y29uc3QgcmVuZGVyZWRDb250cm9sID0ganN4LndpdGhDb250ZXh0KHsgdmlldzogY29udGFpbmluZ1ZpZXcsIGFwcENvbXBvbmVudDogYXBwQ29tcG9uZW50IH0sICgpID0+IHtcblx0XHRcdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHRcdFx0bmV3IE15Q2xhc3MhKFxuXHRcdFx0XHRcdFx0XHRjbGFzc1NldHRpbmdzLFxuXHRcdFx0XHRcdFx0XHR7fSxcblx0XHRcdFx0XHRcdFx0eyBpc1J1bnRpbWVJbnN0YW50aWF0aW9uOiB0cnVlLCBpc1B1YmxpYzogZmFsc2UsIGFwcENvbXBvbmVudDogYXBwQ29tcG9uZW50IH1cblx0XHRcdFx0XHRcdCkgYXMgUnVudGltZUJ1aWxkaW5nQmxvY2tcblx0XHRcdFx0XHQpLmdldENvbnRlbnQoY29udGFpbmluZ1ZpZXcsIGFwcENvbXBvbmVudCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRpZiAoIXRoaXMuX2JBc3luYykge1xuXHRcdFx0XHRcdHRoaXMuX2FDb250ZW50ID0gcmVuZGVyZWRDb250cm9sO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiByZW5kZXJlZENvbnRyb2w7XG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRpZDogZnVuY3Rpb24gKHNJZDogc3RyaW5nKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGNvbnRhaW5pbmdWaWV3LmNyZWF0ZUlkKHNJZCk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHNldHRpbmdzOiBmdW5jdGlvbiAoY29udHJvbFNldHRpbmdzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmcgfCBNYW5hZ2VkT2JqZWN0IHwgKHN0cmluZyB8IE1hbmFnZWRPYmplY3QpW10+KSB7XG5cdFx0XHRcdFx0Y29uc3QgYWxsQXNzb2NpYXRpb25zID0gdGhpcy5nZXRNZXRhZGF0YSgpLmdldEFzc29jaWF0aW9ucygpO1xuXHRcdFx0XHRcdGZvciAoY29uc3QgYXNzb2NpYXRpb25EZXRhaWxOYW1lIG9mIE9iamVjdC5rZXlzKGFsbEFzc29jaWF0aW9ucykpIHtcblx0XHRcdFx0XHRcdGlmIChjb250cm9sU2V0dGluZ3NbYXNzb2NpYXRpb25EZXRhaWxOYW1lXSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0XHRcdC8vIFRoZSBhc3NvY2lhdGVkIGVsZW1lbnRzIGFyZSBpbmRpY2F0ZWQgdmlhIGxvY2FsIElEczsgd2UgbmVlZCB0byBjaGFuZ2UgdGhlIHJlZmVyZW5jZXMgdG8gZ2xvYmFsIG9uZXNcblx0XHRcdFx0XHRcdFx0Y29uc3QgYXNzb2NpYXRpb25zID0gKFxuXHRcdFx0XHRcdFx0XHRcdEFycmF5LmlzQXJyYXkoY29udHJvbFNldHRpbmdzW2Fzc29jaWF0aW9uRGV0YWlsTmFtZV0pXG5cdFx0XHRcdFx0XHRcdFx0XHQ/IGNvbnRyb2xTZXR0aW5nc1thc3NvY2lhdGlvbkRldGFpbE5hbWVdXG5cdFx0XHRcdFx0XHRcdFx0XHQ6IFtjb250cm9sU2V0dGluZ3NbYXNzb2NpYXRpb25EZXRhaWxOYW1lXV1cblx0XHRcdFx0XHRcdFx0KSBhcyAoc3RyaW5nIHwgTWFuYWdlZE9iamVjdClbXTtcblxuXHRcdFx0XHRcdFx0XHQvLyBDcmVhdGUgZ2xvYmFsIElEcyBmb3IgYXNzb2NpYXRpb25zIGdpdmVuIGFzIHN0cmluZ3MsIG5vdCBmb3IgYWxyZWFkeSByZXNvbHZlZCBNYW5hZ2VkT2JqZWN0c1xuXHRcdFx0XHRcdFx0XHRjb250cm9sU2V0dGluZ3NbYXNzb2NpYXRpb25EZXRhaWxOYW1lXSA9IGFzc29jaWF0aW9ucy5tYXAoKGFzc29jaWF0aW9uOiBzdHJpbmcgfCBNYW5hZ2VkT2JqZWN0KSA9PlxuXHRcdFx0XHRcdFx0XHRcdHR5cGVvZiBhc3NvY2lhdGlvbiA9PT0gXCJzdHJpbmdcIiA/IG1TZXR0aW5ncy5jb250YWluaW5nVmlldy5jcmVhdGVJZChhc3NvY2lhdGlvbikgOiBhc3NvY2lhdGlvblxuXHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gY29udHJvbFNldHRpbmdzO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0KTtcblx0fVxufSk7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7O0VBb0NBO0FBQ0E7QUFDQTtFQUZBLElBR2FBLGlCQUFpQjtJQUc3QiwyQkFBWUMsS0FBOEIsRUFBRUMsZUFBeUIsRUFBRUMsVUFBdUMsRUFBRTtNQUFBLEtBRnRHQyxRQUFRLEdBQUcsS0FBSztNQUFBLEtBNEJoQkMsbUJBQW1CLEdBQUcsVUFDL0JDLG1CQUF3QyxFQUN4Q0MsV0FB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