/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/util/merge", "sap/base/util/ObjectPath", "sap/base/util/uid", "sap/ui/base/Metadata", "sap/ui/core/mvc/ControllerMetadata"], function (merge, ObjectPath, uid, Metadata, ControllerMetadata) {
  "use strict";

  var _exports = {};
  const ensureMetadata = function (target) {
    target.metadata = merge({
      controllerExtensions: {},
      properties: {},
      aggregations: {},
      associations: {},
      methods: {},
      events: {},
      interfaces: []
    }, target.metadata || {});
    return target.metadata;
  };

  /* #region CONTROLLER EXTENSIONS */

  /**
   * Defines that the following method is an override for the method name with the same name in the specific controller extension or base implementation.
   *
   * @param extensionName The name of the extension that will be overridden
   * @returns The decorated method
   */
  function methodOverride(extensionName) {
    return function (target, propertyKey) {
      if (!target.override) {
        target.override = {};
      }
      let currentTarget = target.override;
      if (extensionName) {
        if (!currentTarget.extension) {
          currentTarget.extension = {};
        }
        if (!currentTarget.extension[extensionName]) {
          currentTarget.extension[extensionName] = {};
        }
        currentTarget = currentTarget.extension[extensionName];
      }
      currentTarget[propertyKey.toString()] = target[propertyKey.toString()];
    };
  }

  /**
   * Defines that the method can be extended by other controller extension based on the defined overrideExecutionType.
   *
   * @param overrideExecutionType The OverrideExecution defining when the override should run (Before / After / Instead)
   * @returns The decorated method
   */
  _exports.methodOverride = methodOverride;
  function extensible(overrideExecutionType) {
    return function (target, propertyKey) {
      const metadata = ensureMetadata(target);
      if (!metadata.methods[propertyKey.toString()]) {
        metadata.methods[propertyKey.toString()] = {};
      }
      metadata.methods[propertyKey.toString()].overrideExecution = overrideExecutionType;
    };
  }

  /**
   * Defines that the method will be publicly available for controller extension usage.
   *
   * @returns The decorated method
   */
  _exports.extensible = extensible;
  function publicExtension() {
    return function (target, propertyKey, descriptor) {
      const metadata = ensureMetadata(target);
      descriptor.enumerable = true;
      if (!metadata.methods[propertyKey.toString()]) {
        metadata.methods[propertyKey.toString()] = {};
      }
      metadata.methods[propertyKey.toString()].public = true;
    };
  }
  /**
   * Defines that the method will be only available for internal usage of the controller extension.
   *
   * @returns The decorated method
   */
  _exports.publicExtension = publicExtension;
  function privateExtension() {
    return function (target, propertyKey, descriptor) {
      const metadata = ensureMetadata(target);
      descriptor.enumerable = true;
      if (!metadata.methods[propertyKey.toString()]) {
        metadata.methods[propertyKey.toString()] = {};
      }
      metadata.methods[propertyKey.toString()].public = false;
    };
  }
  /**
   * Defines that the method cannot be further extended by other controller extension.
   *
   * @returns The decorated method
   */
  _exports.privateExtension = privateExtension;
  function finalExtension() {
    return function (target, propertyKey, descriptor) {
      const metadata = ensureMetadata(target);
      descriptor.enumerable = true;
      if (!metadata.methods[propertyKey.toString()]) {
        metadata.methods[propertyKey.toString()] = {};
      }
      metadata.methods[propertyKey.toString()].final = true;
    };
  }

  /**
   * Defines that we are going to use instantiate a controller extension under the following variable name.
   *
   * @param extensionClass The controller extension that will be instantiated
   * @returns The decorated property
   */
  _exports.finalExtension = finalExtension;
  function usingExtension(extensionClass) {
    return function (target, propertyKey, propertyDescriptor) {
      const metadata = ensureMetadata(target);
      delete propertyDescriptor.initializer;
      metadata.controllerExtensions[propertyKey.toString()] = extensionClass;
      return propertyDescriptor;
    }; // This is technically an accessor decorator, but somehow the compiler doesn't like it if I declare it as such.
  }

  /* #endregion */

  /* #region CONTROL */
  /**
   * Indicates that the property shall be declared as an event on the control metadata.
   *
   * @returns The decorated property
   */
  _exports.usingExtension = usingExtension;
  function event() {
    return function (target, eventKey) {
      const metadata = ensureMetadata(target);
      if (!metadata.events[eventKey.toString()]) {
        metadata.events[eventKey.toString()] = {};
      }
    };
  }

  /**
   * Defines the following property in the control metatada.
   *
   * @param attributeDefinition The property definition
   * @returns The decorated property.
   */
  _exports.event = event;
  function property(attributeDefinition) {
    return function (target, propertyKey, propertyDescriptor) {
      const metadata = ensureMetadata(target);
      if (!metadata.properties[propertyKey]) {
        metadata.properties[propertyKey] = attributeDefinition;
      }
      delete propertyDescriptor.writable;
      delete propertyDescriptor.initializer;
      return propertyDescriptor;
    }; // This is technically an accessor decorator, but somehow the compiler doesn't like it if i declare it as such.;
  }
  /**
   * Defines and configure the following aggregation in the control metatada.
   *
   * @param aggregationDefinition The aggregation definition
   * @returns The decorated property.
   */
  _exports.property = property;
  function aggregation(aggregationDefinition) {
    return function (target, propertyKey, propertyDescriptor) {
      const metadata = ensureMetadata(target);
      if (aggregationDefinition.multiple === undefined) {
        // UI5 defaults this to true but this is just weird...
        aggregationDefinition.multiple = false;
      }
      if (!metadata.aggregations[propertyKey]) {
        metadata.aggregations[propertyKey] = aggregationDefinition;
      }
      if (aggregationDefinition.isDefault) {
        metadata.defaultAggregation = propertyKey;
      }
      delete propertyDescriptor.writable;
      delete propertyDescriptor.initializer;
      return propertyDescriptor;
    }; // This is technically an accessor decorator, but somehow the compiler doesn't like it if i declare it as such.;
  }

  /**
   * Defines and configure the following association in the control metatada.
   *
   * @param ui5AssociationMetadata The definition of the association.
   * @returns The decorated property
   */
  _exports.aggregation = aggregation;
  function association(ui5AssociationMetadata) {
    return function (target, propertyKey, propertyDescriptor) {
      const metadata = ensureMetadata(target);
      if (!metadata.associations[propertyKey]) {
        metadata.associations[propertyKey] = ui5AssociationMetadata;
      }
      delete propertyDescriptor.writable;
      delete propertyDescriptor.initializer;
      return propertyDescriptor;
    }; // This is technically an accessor decorator, but somehow the compiler doesn't like it if i declare it as such.;
  }

  /**
   * Defines in the metadata that this control implements a specific interface.
   *
   * @param interfaceName The name of the implemented interface
   * @returns The decorated method
   */
  _exports.association = association;
  function implementInterface(interfaceName) {
    return function (target) {
      const metadata = ensureMetadata(target);
      metadata.interfaces.push(interfaceName);
    };
  }

  /**
   * Indicates that the following method should also be exposed statically so we can call it from XML.
   *
   * @returns The decorated method
   */
  _exports.implementInterface = implementInterface;
  function xmlEventHandler() {
    return function (target, propertykey) {
      const currentConstructor = target.constructor;
      currentConstructor[propertykey.toString()] = function () {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        if (args && args.length) {
          const currentTarget = currentConstructor.getAPI(args[0]);
          currentTarget === null || currentTarget === void 0 ? void 0 : currentTarget[propertykey.toString()](...args);
        }
      };
    };
  }

  /**
   * Indicates that the following class should define a UI5 control of the specified name.
   *
   * @param sTarget The fully qualified name of the UI5 class
   * @param metadataDefinition Inline metadata definition
   * @class
   */
  _exports.xmlEventHandler = xmlEventHandler;
  function defineUI5Class(sTarget, metadataDefinition) {
    return function (constructor) {
      if (!constructor.prototype.metadata) {
        constructor.prototype.metadata = {};
      }
      if (metadataDefinition) {
        for (const key in metadataDefinition) {
          constructor.prototype.metadata[key] = metadataDefinition[key];
        }
      }
      return registerUI5Metadata(constructor, sTarget, constructor.prototype);
    };
  }
  _exports.defineUI5Class = defineUI5Class;
  function createReference() {
    return {
      current: undefined,
      setCurrent: function (oControlInstance) {
        this.current = oControlInstance;
      }
    };
  }
  /**
   * Defines that the following object will hold a reference to a control through jsx templating.
   *
   * @returns The decorated property.
   */
  _exports.createReference = createReference;
  function defineReference() {
    return function (target, propertyKey, propertyDescriptor) {
      delete propertyDescriptor.writable;
      delete propertyDescriptor.initializer;
      propertyDescriptor.initializer = createReference;
      return propertyDescriptor;
    }; // This is technically an accessor decorator, but somehow the compiler doesn't like it if i declare it as such.;
  }

  /**
   * Internal heavy lifting that will take care of creating the class property for ui5 to use.
   *
   * @param clazz The class prototype
   * @param name The name of the class to create
   * @param inObj The metadata object
   * @returns The metadata class
   */
  _exports.defineReference = defineReference;
  function registerUI5Metadata(clazz, name, inObj) {
    var _clazz$getMetadata, _inObj$metadata, _clazz$metadata, _obj$metadata;
    if (clazz.getMetadata && clazz.getMetadata().isA("sap.ui.core.mvc.ControllerExtension")) {
      Object.getOwnPropertyNames(inObj).forEach(objName => {
        const descriptor = Object.getOwnPropertyDescriptor(inObj, objName);
        if (descriptor && !descriptor.enumerable) {
          descriptor.enumerable = true;
          //		Log.error(`Property ${objName} from ${name} should be decorated as public`);
        }
      });
    }

    const obj = {};
    obj.metadata = inObj.metadata || {};
    obj.override = inObj.override;
    obj.constructor = clazz;
    obj.metadata.baseType = Object.getPrototypeOf(clazz.prototype).getMetadata().getName();
    if ((clazz === null || clazz === void 0 ? void 0 : (_clazz$getMetadata = clazz.getMetadata()) === null || _clazz$getMetadata === void 0 ? void 0 : _clazz$getMetadata.getStereotype()) === "control") {
      const rendererDefinition = inObj.renderer || clazz.renderer || clazz.render;
      obj.renderer = {
        apiVersion: 2
      };
      if (typeof rendererDefinition === "function") {
        obj.renderer.render = rendererDefinition;
      } else if (rendererDefinition != undefined) {
        obj.renderer = rendererDefinition;
      }
    }
    obj.metadata.interfaces = ((_inObj$metadata = inObj.metadata) === null || _inObj$metadata === void 0 ? void 0 : _inObj$metadata.interfaces) || ((_clazz$metadata = clazz.metadata) === null || _clazz$metadata === void 0 ? void 0 : _clazz$metadata.interfaces);
    Object.keys(clazz.prototype).forEach(key => {
      if (key !== "metadata") {
        try {
          obj[key] = clazz.prototype[key];
        } catch (e) {
          //console.log(e);
        }
      }
    });
    if ((_obj$metadata = obj.metadata) !== null && _obj$metadata !== void 0 && _obj$metadata.controllerExtensions && Object.keys(obj.metadata.controllerExtensions).length > 0) {
      for (const cExtName in obj.metadata.controllerExtensions) {
        obj[cExtName] = obj.metadata.controllerExtensions[cExtName];
      }
    }
    const output = clazz.extend(name, obj);
    const fnInit = output.prototype.init;
    output.prototype.init = function () {
      if (fnInit) {
        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }
        fnInit.apply(this, args);
      }
      this.metadata = obj.metadata;
      if (obj.metadata.properties) {
        const aPropertyKeys = Object.keys(obj.metadata.properties);
        aPropertyKeys.forEach(propertyKey => {
          Object.defineProperty(this, propertyKey, {
            configurable: true,
            set: v => {
              return this.setProperty(propertyKey, v);
            },
            get: () => {
              return this.getProperty(propertyKey);
            }
          });
        });
        const aAggregationKeys = Object.keys(obj.metadata.aggregations);
        aAggregationKeys.forEach(aggregationKey => {
          Object.defineProperty(this, aggregationKey, {
            configurable: true,
            set: v => {
              return this.setAggregation(aggregationKey, v);
            },
            get: () => {
              const aggregationContent = this.getAggregation(aggregationKey);
              if (obj.metadata.aggregations[aggregationKey].multiple) {
                return aggregationContent || [];
              } else {
                return aggregationContent;
              }
            }
          });
        });
        const aAssociationKeys = Object.keys(obj.metadata.associations);
        aAssociationKeys.forEach(associationKey => {
          Object.defineProperty(this, associationKey, {
            configurable: true,
            set: v => {
              return this.setAssociation(associationKey, v);
            },
            get: () => {
              const aggregationContent = this.getAssociation(associationKey);
              if (obj.metadata.associations[associationKey].multiple) {
                return aggregationContent || [];
              } else {
                return aggregationContent;
              }
            }
          });
        });
      }
    };
    clazz.override = function (oExtension) {
      const pol = {};
      pol.constructor = function () {
        for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          args[_key3] = arguments[_key3];
        }
        return clazz.apply(this, args);
      };
      const oClass = Metadata.createClass(clazz, `anonymousExtension~${uid()}`, pol, ControllerMetadata);
      oClass.getMetadata()._staticOverride = oExtension;
      oClass.getMetadata()._override = clazz.getMetadata()._override;
      return oClass;
    };
    ObjectPath.set(name, output);
    return output;
  }
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJlbnN1cmVNZXRhZGF0YSIsInRhcmdldCIsIm1ldGFkYXRhIiwibWVyZ2UiLCJjb250cm9sbGVyRXh0ZW5zaW9ucyIsInByb3BlcnRpZXMiLCJhZ2dyZWdhdGlvbnMiLCJhc3NvY2lhdGlvbnMiLCJtZXRob2RzIiwiZXZlbnRzIiwiaW50ZXJmYWNlcyIsIm1ldGhvZE92ZXJyaWRlIiwiZXh0ZW5zaW9uTmFtZSIsInByb3BlcnR5S2V5Iiwib3ZlcnJpZGUiLCJjdXJyZW50VGFyZ2V0IiwiZXh0ZW5zaW9uIiwidG9TdHJpbmciLCJleHRlbnNpYmxlIiwib3ZlcnJpZGVFeGVjdXRpb25UeXBlIiwib3ZlcnJpZGVFeGVjdXRpb24iLCJwdWJsaWNFeHRlbnNpb24iLCJkZXNjcmlwdG9yIiwiZW51bWVyYWJsZSIsInB1YmxpYyIsInByaXZhdGVFeHRlbnNpb24iLCJmaW5hbEV4dGVuc2lvbiIsImZpbmFsIiwidXNpbmdFeHRlbnNpb24iLCJleHRlbnNpb25DbGFzcyIsInByb3BlcnR5RGVzY3JpcHRvciIsImluaXRpYWxpemVyIiwiZXZlbnQiLCJldmVudEtleSIsInByb3BlcnR5IiwiYXR0cmlidXRlRGVmaW5pdGlvbiIsIndyaXRhYmxlIiwiYWdncmVnYXRpb24iLCJhZ2dyZWdhdGlvbkRlZmluaXRpb24iLCJtdWx0aXBsZSIsInVuZGVmaW5lZCIsImlzRGVmYXVsdCIsImRlZmF1bHRBZ2dyZWdhdGlvbiIsImFzc29jaWF0aW9uIiwidWk1QXNzb2NpYXRpb25NZXRhZGF0YSIsImltcGxlbWVudEludGVyZmFjZSIsImludGVyZmFjZU5hbWUiLCJwdXNoIiwieG1sRXZlbnRIYW5kbGVyIiwicHJvcGVydHlrZXkiLCJjdXJyZW50Q29uc3RydWN0b3IiLCJjb25zdHJ1Y3RvciIsImFyZ3MiLCJsZW5ndGgiLCJnZXRBUEkiLCJkZWZpbmVVSTVDbGFzcyIsInNUYXJnZXQiLCJtZXRhZGF0YURlZmluaXRpb24iLCJwcm90b3R5cGUiLCJrZXkiLCJyZWdpc3RlclVJNU1ldGFkYXRhIiwiY3JlYXRlUmVmZXJlbmNlIiwiY3VycmVudCIsInNldEN1cnJlbnQiLCJvQ29udHJvbEluc3RhbmNlIiwiZGVmaW5lUmVmZXJlbmNlIiwiY2xhenoiLCJuYW1lIiwiaW5PYmoiLCJnZXRNZXRhZGF0YSIsImlzQSIsIk9iamVjdCIsImdldE93blByb3BlcnR5TmFtZXMiLCJmb3JFYWNoIiwib2JqTmFtZSIsImdldE93blByb3BlcnR5RGVzY3JpcHRvciIsIm9iaiIsImJhc2VUeXBlIiwiZ2V0UHJvdG90eXBlT2YiLCJnZXROYW1lIiwiZ2V0U3RlcmVvdHlwZSIsInJlbmRlcmVyRGVmaW5pdGlvbiIsInJlbmRlcmVyIiwicmVuZGVyIiwiYXBpVmVyc2lvbiIsImtleXMiLCJlIiwiY0V4dE5hbWUiLCJvdXRwdXQiLCJleHRlbmQiLCJmbkluaXQiLCJpbml0IiwiYXBwbHkiLCJhUHJvcGVydHlLZXlzIiwiZGVmaW5lUHJvcGVydHkiLCJjb25maWd1cmFibGUiLCJzZXQiLCJ2Iiwic2V0UHJvcGVydHkiLCJnZXQiLCJnZXRQcm9wZXJ0eSIsImFBZ2dyZWdhdGlvbktleXMiLCJhZ2dyZWdhdGlvbktleSIsInNldEFnZ3JlZ2F0aW9uIiwiYWdncmVnYXRpb25Db250ZW50IiwiZ2V0QWdncmVnYXRpb24iLCJhQXNzb2NpYXRpb25LZXlzIiwiYXNzb2NpYXRpb25LZXkiLCJzZXRBc3NvY2lhdGlvbiIsImdldEFzc29jaWF0aW9uIiwib0V4dGVuc2lvbiIsInBvbCIsIm9DbGFzcyIsIk1ldGFkYXRhIiwiY3JlYXRlQ2xhc3MiLCJ1aWQiLCJDb250cm9sbGVyTWV0YWRhdGEiLCJfc3RhdGljT3ZlcnJpZGUiLCJfb3ZlcnJpZGUiLCJPYmplY3RQYXRoIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJDbGFzc1N1cHBvcnQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IG1lcmdlIGZyb20gXCJzYXAvYmFzZS91dGlsL21lcmdlXCI7XG5pbXBvcnQgT2JqZWN0UGF0aCBmcm9tIFwic2FwL2Jhc2UvdXRpbC9PYmplY3RQYXRoXCI7XG5pbXBvcnQgdWlkIGZyb20gXCJzYXAvYmFzZS91dGlsL3VpZFwiO1xuaW1wb3J0IHR5cGUgVUk1RXZlbnQgZnJvbSBcInNhcC91aS9iYXNlL0V2ZW50XCI7XG5pbXBvcnQgTWV0YWRhdGEgZnJvbSBcInNhcC91aS9iYXNlL01ldGFkYXRhXCI7XG5pbXBvcnQgdHlwZSBDb250cm9sbGVyRXh0ZW5zaW9uIGZyb20gXCJzYXAvdWkvY29yZS9tdmMvQ29udHJvbGxlckV4dGVuc2lvblwiO1xuaW1wb3J0IENvbnRyb2xsZXJNZXRhZGF0YSBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL0NvbnRyb2xsZXJNZXRhZGF0YVwiO1xuaW1wb3J0IHR5cGUgT3ZlcnJpZGVFeGVjdXRpb24gZnJvbSBcInNhcC91aS9jb3JlL212Yy9PdmVycmlkZUV4ZWN1dGlvblwiO1xuXG50eXBlIE92ZXJyaWRlRGVmaW5pdGlvbiA9IFJlY29yZDxzdHJpbmcsIEZ1bmN0aW9uPjtcbnR5cGUgVUk1Q29udHJvbGxlck1ldGhvZERlZmluaXRpb24gPSB7XG5cdG92ZXJyaWRlRXhlY3V0aW9uPzogT3ZlcnJpZGVFeGVjdXRpb247XG5cdHB1YmxpYz86IGJvb2xlYW47XG5cdGZpbmFsPzogYm9vbGVhbjtcbn07XG50eXBlIFVJNVByb3BlcnR5TWV0YWRhdGEgPSB7XG5cdHR5cGU6IHN0cmluZztcblx0cmVxdWlyZWQ/OiBib29sZWFuO1xuXHRncm91cD86IHN0cmluZztcblx0ZGVmYXVsdFZhbHVlPzogYW55O1xuXHRleHBlY3RlZEFubm90YXRpb25zPzogc3RyaW5nW107XG5cdGV4cGVjdGVkVHlwZXM/OiBzdHJpbmdbXTtcbn07XG50eXBlIFVJNUFnZ3JlZ2F0aW9uTWV0YWRhdGEgPSB7XG5cdHR5cGU6IHN0cmluZztcblx0bXVsdGlwbGU/OiBib29sZWFuO1xuXHRpc0RlZmF1bHQ/OiBib29sZWFuO1xuXHRzaW5ndWxhck5hbWU/OiBzdHJpbmc7XG5cdHZpc2liaWxpdHk/OiBzdHJpbmc7XG59O1xudHlwZSBVSTVBc3NvY2lhdGlvbk1ldGFkYXRhID0ge1xuXHR0eXBlOiBzdHJpbmc7XG5cdG11bHRpcGxlPzogYm9vbGVhbjtcblx0c2luZ3VsYXJOYW1lPzogc3RyaW5nO1xufTtcbnR5cGUgVUk1Q29udHJvbE1ldGFkYXRhRGVmaW5pdGlvbiA9IHtcblx0ZGVmYXVsdEFnZ3JlZ2F0aW9uPzogc3RyaW5nO1xuXHRjb250cm9sbGVyRXh0ZW5zaW9uczogUmVjb3JkPHN0cmluZywgdHlwZW9mIENvbnRyb2xsZXJFeHRlbnNpb24gfCBGdW5jdGlvbj47XG5cdHByb3BlcnRpZXM6IFJlY29yZDxzdHJpbmcsIFVJNVByb3BlcnR5TWV0YWRhdGE+O1xuXHRhZ2dyZWdhdGlvbnM6IFJlY29yZDxzdHJpbmcsIFVJNUFnZ3JlZ2F0aW9uTWV0YWRhdGE+O1xuXHRhc3NvY2lhdGlvbnM6IFJlY29yZDxzdHJpbmcsIFVJNUFzc29jaWF0aW9uTWV0YWRhdGE+O1xuXHRtZXRob2RzOiBSZWNvcmQ8c3RyaW5nLCBVSTVDb250cm9sbGVyTWV0aG9kRGVmaW5pdGlvbj47XG5cdGV2ZW50czogUmVjb3JkPHN0cmluZywge30+O1xuXHRpbnRlcmZhY2VzOiBzdHJpbmdbXTtcbn07XG50eXBlIFVJNUNvbnRyb2xsZXIgPSB7XG5cdG92ZXJyaWRlPzogeyBleHRlbnNpb24/OiBSZWNvcmQ8c3RyaW5nLCBPdmVycmlkZURlZmluaXRpb24+IH0gJiB7XG5cdFx0W2s6IHN0cmluZ106IEZ1bmN0aW9uO1xuXHR9O1xuXHRtZXRhZGF0YT86IFVJNUNvbnRyb2xNZXRhZGF0YURlZmluaXRpb247XG59O1xuXG50eXBlIFVJNUNvbnRyb2wgPSB7XG5cdG1ldGFkYXRhPzogVUk1Q29udHJvbE1ldGFkYXRhRGVmaW5pdGlvbjtcbn07XG5cbnR5cGUgVUk1QVBJQ29udHJvbCA9IFVJNUNvbnRyb2wgJiB7XG5cdGdldEFQSShldmVudDogVUk1RXZlbnQpOiBVSTVBUElDb250cm9sO1xuXHRbazogc3RyaW5nXTogRnVuY3Rpb247XG59O1xuXG50eXBlIENvbnRyb2xQcm9wZXJ0eU5hbWVzPFQ+ID0ge1xuXHRbSyBpbiBrZXlvZiBUXTogVFtLXSBleHRlbmRzIEZ1bmN0aW9uID8gbmV2ZXIgOiBLO1xufVtrZXlvZiBUXTtcbmV4cG9ydCB0eXBlIFByb3BlcnRpZXNPZjxUPiA9IFBhcnRpYWw8UGljazxULCBDb250cm9sUHJvcGVydHlOYW1lczxUPj4+O1xuZXhwb3J0IHR5cGUgU3RyaWN0UHJvcGVydGllc09mPFQ+ID0gUGljazxULCBDb250cm9sUHJvcGVydHlOYW1lczxUPj47XG5leHBvcnQgdHlwZSBFbmhhbmNlV2l0aFVJNTxUPiA9IHtcblx0bmV3IChwcm9wczogUHJvcGVydGllc09mPFQ+KTogRW5oYW5jZVdpdGhVSTU8VD47XG5cdG5ldyAoc0lkOiBzdHJpbmcsIHByb3BzOiBQcm9wZXJ0aWVzT2Y8VD4pOiBFbmhhbmNlV2l0aFVJNTxUPjtcbn0gJiBUICYge1xuXHRcdC8vIEFkZCBhbGwgdGhlIGdldFhYWCBtZXRob2QsIG1pZ2h0IGFkZCB0b28gbXVjaCBhcyBJJ20gbm90IGZpbHRlcmluZyBvbiBhY3R1YWwgcHJvcGVydGllcy4uLlxuXHRcdFtQIGluIGtleW9mIFQgYXMgYGdldCR7Q2FwaXRhbGl6ZTxzdHJpbmcgJiBQPn1gXTogKCkgPT4gVFtQXTtcblx0fTtcbmNvbnN0IGVuc3VyZU1ldGFkYXRhID0gZnVuY3Rpb24gKHRhcmdldDogVUk1Q29udHJvbGxlcikge1xuXHR0YXJnZXQubWV0YWRhdGEgPSBtZXJnZShcblx0XHR7XG5cdFx0XHRjb250cm9sbGVyRXh0ZW5zaW9uczoge30sXG5cdFx0XHRwcm9wZXJ0aWVzOiB7fSxcblx0XHRcdGFnZ3JlZ2F0aW9uczoge30sXG5cdFx0XHRhc3NvY2lhdGlvbnM6IHt9LFxuXHRcdFx0bWV0aG9kczoge30sXG5cdFx0XHRldmVudHM6IHt9LFxuXHRcdFx0aW50ZXJmYWNlczogW11cblx0XHR9LFxuXHRcdHRhcmdldC5tZXRhZGF0YSB8fCB7fVxuXHQpIGFzIFVJNUNvbnRyb2xNZXRhZGF0YURlZmluaXRpb247XG5cdHJldHVybiB0YXJnZXQubWV0YWRhdGE7XG59O1xuXG4vKiAjcmVnaW9uIENPTlRST0xMRVIgRVhURU5TSU9OUyAqL1xuXG4vKipcbiAqIERlZmluZXMgdGhhdCB0aGUgZm9sbG93aW5nIG1ldGhvZCBpcyBhbiBvdmVycmlkZSBmb3IgdGhlIG1ldGhvZCBuYW1lIHdpdGggdGhlIHNhbWUgbmFtZSBpbiB0aGUgc3BlY2lmaWMgY29udHJvbGxlciBleHRlbnNpb24gb3IgYmFzZSBpbXBsZW1lbnRhdGlvbi5cbiAqXG4gKiBAcGFyYW0gZXh0ZW5zaW9uTmFtZSBUaGUgbmFtZSBvZiB0aGUgZXh0ZW5zaW9uIHRoYXQgd2lsbCBiZSBvdmVycmlkZGVuXG4gKiBAcmV0dXJucyBUaGUgZGVjb3JhdGVkIG1ldGhvZFxuICovXG5leHBvcnQgZnVuY3Rpb24gbWV0aG9kT3ZlcnJpZGUoZXh0ZW5zaW9uTmFtZT86IHN0cmluZyk6IE1ldGhvZERlY29yYXRvciB7XG5cdHJldHVybiBmdW5jdGlvbiAodGFyZ2V0OiBVSTVDb250cm9sbGVyLCBwcm9wZXJ0eUtleSkge1xuXHRcdGlmICghdGFyZ2V0Lm92ZXJyaWRlKSB7XG5cdFx0XHR0YXJnZXQub3ZlcnJpZGUgPSB7fTtcblx0XHR9XG5cdFx0bGV0IGN1cnJlbnRUYXJnZXQgPSB0YXJnZXQub3ZlcnJpZGU7XG5cdFx0aWYgKGV4dGVuc2lvbk5hbWUpIHtcblx0XHRcdGlmICghY3VycmVudFRhcmdldC5leHRlbnNpb24pIHtcblx0XHRcdFx0Y3VycmVudFRhcmdldC5leHRlbnNpb24gPSB7fTtcblx0XHRcdH1cblx0XHRcdGlmICghY3VycmVudFRhcmdldC5leHRlbnNpb25bZXh0ZW5zaW9uTmFtZV0pIHtcblx0XHRcdFx0Y3VycmVudFRhcmdldC5leHRlbnNpb25bZXh0ZW5zaW9uTmFtZV0gPSB7fTtcblx0XHRcdH1cblx0XHRcdGN1cnJlbnRUYXJnZXQgPSBjdXJyZW50VGFyZ2V0LmV4dGVuc2lvbltleHRlbnNpb25OYW1lXTtcblx0XHR9XG5cdFx0Y3VycmVudFRhcmdldFtwcm9wZXJ0eUtleS50b1N0cmluZygpXSA9ICh0YXJnZXQgYXMgYW55KVtwcm9wZXJ0eUtleS50b1N0cmluZygpXTtcblx0fTtcbn1cblxuLyoqXG4gKiBEZWZpbmVzIHRoYXQgdGhlIG1ldGhvZCBjYW4gYmUgZXh0ZW5kZWQgYnkgb3RoZXIgY29udHJvbGxlciBleHRlbnNpb24gYmFzZWQgb24gdGhlIGRlZmluZWQgb3ZlcnJpZGVFeGVjdXRpb25UeXBlLlxuICpcbiAqIEBwYXJhbSBvdmVycmlkZUV4ZWN1dGlvblR5cGUgVGhlIE92ZXJyaWRlRXhlY3V0aW9uIGRlZmluaW5nIHdoZW4gdGhlIG92ZXJyaWRlIHNob3VsZCBydW4gKEJlZm9yZSAvIEFmdGVyIC8gSW5zdGVhZClcbiAqIEByZXR1cm5zIFRoZSBkZWNvcmF0ZWQgbWV0aG9kXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleHRlbnNpYmxlKG92ZXJyaWRlRXhlY3V0aW9uVHlwZT86IE92ZXJyaWRlRXhlY3V0aW9uKTogTWV0aG9kRGVjb3JhdG9yIHtcblx0cmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQ6IFVJNUNvbnRyb2xsZXIsIHByb3BlcnR5S2V5KSB7XG5cdFx0Y29uc3QgbWV0YWRhdGEgPSBlbnN1cmVNZXRhZGF0YSh0YXJnZXQpO1xuXHRcdGlmICghbWV0YWRhdGEubWV0aG9kc1twcm9wZXJ0eUtleS50b1N0cmluZygpXSkge1xuXHRcdFx0bWV0YWRhdGEubWV0aG9kc1twcm9wZXJ0eUtleS50b1N0cmluZygpXSA9IHt9O1xuXHRcdH1cblx0XHRtZXRhZGF0YS5tZXRob2RzW3Byb3BlcnR5S2V5LnRvU3RyaW5nKCldLm92ZXJyaWRlRXhlY3V0aW9uID0gb3ZlcnJpZGVFeGVjdXRpb25UeXBlO1xuXHR9O1xufVxuXG4vKipcbiAqIERlZmluZXMgdGhhdCB0aGUgbWV0aG9kIHdpbGwgYmUgcHVibGljbHkgYXZhaWxhYmxlIGZvciBjb250cm9sbGVyIGV4dGVuc2lvbiB1c2FnZS5cbiAqXG4gKiBAcmV0dXJucyBUaGUgZGVjb3JhdGVkIG1ldGhvZFxuICovXG5leHBvcnQgZnVuY3Rpb24gcHVibGljRXh0ZW5zaW9uKCk6IE1ldGhvZERlY29yYXRvciB7XG5cdHJldHVybiBmdW5jdGlvbiAodGFyZ2V0OiBVSTVDb250cm9sbGVyLCBwcm9wZXJ0eUtleSwgZGVzY3JpcHRvcik6IHZvaWQge1xuXHRcdGNvbnN0IG1ldGFkYXRhID0gZW5zdXJlTWV0YWRhdGEodGFyZ2V0KTtcblx0XHRkZXNjcmlwdG9yLmVudW1lcmFibGUgPSB0cnVlO1xuXHRcdGlmICghbWV0YWRhdGEubWV0aG9kc1twcm9wZXJ0eUtleS50b1N0cmluZygpXSkge1xuXHRcdFx0bWV0YWRhdGEubWV0aG9kc1twcm9wZXJ0eUtleS50b1N0cmluZygpXSA9IHt9O1xuXHRcdH1cblx0XHRtZXRhZGF0YS5tZXRob2RzW3Byb3BlcnR5S2V5LnRvU3RyaW5nKCldLnB1YmxpYyA9IHRydWU7XG5cdH07XG59XG4vKipcbiAqIERlZmluZXMgdGhhdCB0aGUgbWV0aG9kIHdpbGwgYmUgb25seSBhdmFpbGFibGUgZm9yIGludGVybmFsIHVzYWdlIG9mIHRoZSBjb250cm9sbGVyIGV4dGVuc2lvbi5cbiAqXG4gKiBAcmV0dXJucyBUaGUgZGVjb3JhdGVkIG1ldGhvZFxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJpdmF0ZUV4dGVuc2lvbigpOiBNZXRob2REZWNvcmF0b3Ige1xuXHRyZXR1cm4gZnVuY3Rpb24gKHRhcmdldDogVUk1Q29udHJvbGxlciwgcHJvcGVydHlLZXksIGRlc2NyaXB0b3IpIHtcblx0XHRjb25zdCBtZXRhZGF0YSA9IGVuc3VyZU1ldGFkYXRhKHRhcmdldCk7XG5cdFx0ZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gdHJ1ZTtcblx0XHRpZiAoIW1ldGFkYXRhLm1ldGhvZHNbcHJvcGVydHlLZXkudG9TdHJpbmcoKV0pIHtcblx0XHRcdG1ldGFkYXRhLm1ldGhvZHNbcHJvcGVydHlLZXkudG9TdHJpbmcoKV0gPSB7fTtcblx0XHR9XG5cdFx0bWV0YWRhdGEubWV0aG9kc1twcm9wZXJ0eUtleS50b1N0cmluZygpXS5wdWJsaWMgPSBmYWxzZTtcblx0fTtcbn1cbi8qKlxuICogRGVmaW5lcyB0aGF0IHRoZSBtZXRob2QgY2Fubm90IGJlIGZ1cnRoZXIgZXh0ZW5kZWQgYnkgb3RoZXIgY29udHJvbGxlciBleHRlbnNpb24uXG4gKlxuICogQHJldHVybnMgVGhlIGRlY29yYXRlZCBtZXRob2RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpbmFsRXh0ZW5zaW9uKCk6IE1ldGhvZERlY29yYXRvciB7XG5cdHJldHVybiBmdW5jdGlvbiAodGFyZ2V0OiBVSTVDb250cm9sbGVyLCBwcm9wZXJ0eUtleSwgZGVzY3JpcHRvcikge1xuXHRcdGNvbnN0IG1ldGFkYXRhID0gZW5zdXJlTWV0YWRhdGEodGFyZ2V0KTtcblx0XHRkZXNjcmlwdG9yLmVudW1lcmFibGUgPSB0cnVlO1xuXHRcdGlmICghbWV0YWRhdGEubWV0aG9kc1twcm9wZXJ0eUtleS50b1N0cmluZygpXSkge1xuXHRcdFx0bWV0YWRhdGEubWV0aG9kc1twcm9wZXJ0eUtleS50b1N0cmluZygpXSA9IHt9O1xuXHRcdH1cblx0XHRtZXRhZGF0YS5tZXRob2RzW3Byb3BlcnR5S2V5LnRvU3RyaW5nKCldLmZpbmFsID0gdHJ1ZTtcblx0fTtcbn1cblxuLyoqXG4gKiBEZWZpbmVzIHRoYXQgd2UgYXJlIGdvaW5nIHRvIHVzZSBpbnN0YW50aWF0ZSBhIGNvbnRyb2xsZXIgZXh0ZW5zaW9uIHVuZGVyIHRoZSBmb2xsb3dpbmcgdmFyaWFibGUgbmFtZS5cbiAqXG4gKiBAcGFyYW0gZXh0ZW5zaW9uQ2xhc3MgVGhlIGNvbnRyb2xsZXIgZXh0ZW5zaW9uIHRoYXQgd2lsbCBiZSBpbnN0YW50aWF0ZWRcbiAqIEByZXR1cm5zIFRoZSBkZWNvcmF0ZWQgcHJvcGVydHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVzaW5nRXh0ZW5zaW9uKGV4dGVuc2lvbkNsYXNzOiB0eXBlb2YgQ29udHJvbGxlckV4dGVuc2lvbiB8IEZ1bmN0aW9uKTogUHJvcGVydHlEZWNvcmF0b3Ige1xuXHRyZXR1cm4gZnVuY3Rpb24gKHRhcmdldDogVUk1Q29udHJvbGxlciwgcHJvcGVydHlLZXk6IHN0cmluZywgcHJvcGVydHlEZXNjcmlwdG9yOiBUeXBlZFByb3BlcnR5RGVzY3JpcHRvcjxhbnk+KSB7XG5cdFx0Y29uc3QgbWV0YWRhdGEgPSBlbnN1cmVNZXRhZGF0YSh0YXJnZXQpO1xuXHRcdGRlbGV0ZSAocHJvcGVydHlEZXNjcmlwdG9yIGFzIGFueSkuaW5pdGlhbGl6ZXI7XG5cdFx0bWV0YWRhdGEuY29udHJvbGxlckV4dGVuc2lvbnNbcHJvcGVydHlLZXkudG9TdHJpbmcoKV0gPSBleHRlbnNpb25DbGFzcztcblx0XHRyZXR1cm4gcHJvcGVydHlEZXNjcmlwdG9yO1xuXHR9IGFzIGFueTsgLy8gVGhpcyBpcyB0ZWNobmljYWxseSBhbiBhY2Nlc3NvciBkZWNvcmF0b3IsIGJ1dCBzb21laG93IHRoZSBjb21waWxlciBkb2Vzbid0IGxpa2UgaXQgaWYgSSBkZWNsYXJlIGl0IGFzIHN1Y2guXG59XG5cbi8qICNlbmRyZWdpb24gKi9cblxuLyogI3JlZ2lvbiBDT05UUk9MICovXG4vKipcbiAqIEluZGljYXRlcyB0aGF0IHRoZSBwcm9wZXJ0eSBzaGFsbCBiZSBkZWNsYXJlZCBhcyBhbiBldmVudCBvbiB0aGUgY29udHJvbCBtZXRhZGF0YS5cbiAqXG4gKiBAcmV0dXJucyBUaGUgZGVjb3JhdGVkIHByb3BlcnR5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBldmVudCgpOiBQcm9wZXJ0eURlY29yYXRvciB7XG5cdHJldHVybiBmdW5jdGlvbiAodGFyZ2V0OiBVSTVDb250cm9sLCBldmVudEtleSkge1xuXHRcdGNvbnN0IG1ldGFkYXRhID0gZW5zdXJlTWV0YWRhdGEodGFyZ2V0KTtcblx0XHRpZiAoIW1ldGFkYXRhLmV2ZW50c1tldmVudEtleS50b1N0cmluZygpXSkge1xuXHRcdFx0bWV0YWRhdGEuZXZlbnRzW2V2ZW50S2V5LnRvU3RyaW5nKCldID0ge307XG5cdFx0fVxuXHR9O1xufVxuXG4vKipcbiAqIERlZmluZXMgdGhlIGZvbGxvd2luZyBwcm9wZXJ0eSBpbiB0aGUgY29udHJvbCBtZXRhdGFkYS5cbiAqXG4gKiBAcGFyYW0gYXR0cmlidXRlRGVmaW5pdGlvbiBUaGUgcHJvcGVydHkgZGVmaW5pdGlvblxuICogQHJldHVybnMgVGhlIGRlY29yYXRlZCBwcm9wZXJ0eS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByb3BlcnR5KGF0dHJpYnV0ZURlZmluaXRpb246IFVJNVByb3BlcnR5TWV0YWRhdGEpOiBQcm9wZXJ0eURlY29yYXRvciB7XG5cdHJldHVybiBmdW5jdGlvbiAodGFyZ2V0OiBVSTVDb250cm9sLCBwcm9wZXJ0eUtleTogc3RyaW5nLCBwcm9wZXJ0eURlc2NyaXB0b3I6IFR5cGVkUHJvcGVydHlEZXNjcmlwdG9yPGFueT4pIHtcblx0XHRjb25zdCBtZXRhZGF0YSA9IGVuc3VyZU1ldGFkYXRhKHRhcmdldCk7XG5cdFx0aWYgKCFtZXRhZGF0YS5wcm9wZXJ0aWVzW3Byb3BlcnR5S2V5XSkge1xuXHRcdFx0bWV0YWRhdGEucHJvcGVydGllc1twcm9wZXJ0eUtleV0gPSBhdHRyaWJ1dGVEZWZpbml0aW9uO1xuXHRcdH1cblx0XHRkZWxldGUgcHJvcGVydHlEZXNjcmlwdG9yLndyaXRhYmxlO1xuXHRcdGRlbGV0ZSAocHJvcGVydHlEZXNjcmlwdG9yIGFzIGFueSkuaW5pdGlhbGl6ZXI7XG5cblx0XHRyZXR1cm4gcHJvcGVydHlEZXNjcmlwdG9yO1xuXHR9IGFzIGFueTsgLy8gVGhpcyBpcyB0ZWNobmljYWxseSBhbiBhY2Nlc3NvciBkZWNvcmF0b3IsIGJ1dCBzb21laG93IHRoZSBjb21waWxlciBkb2Vzbid0IGxpa2UgaXQgaWYgaSBkZWNsYXJlIGl0IGFzIHN1Y2guO1xufVxuLyoqXG4gKiBEZWZpbmVzIGFuZCBjb25maWd1cmUgdGhlIGZvbGxvd2luZyBhZ2dyZWdhdGlvbiBpbiB0aGUgY29udHJvbCBtZXRhdGFkYS5cbiAqXG4gKiBAcGFyYW0gYWdncmVnYXRpb25EZWZpbml0aW9uIFRoZSBhZ2dyZWdhdGlvbiBkZWZpbml0aW9uXG4gKiBAcmV0dXJucyBUaGUgZGVjb3JhdGVkIHByb3BlcnR5LlxuICovXG5leHBvcnQgZnVuY3Rpb24gYWdncmVnYXRpb24oYWdncmVnYXRpb25EZWZpbml0aW9uOiBVSTVBZ2dyZWdhdGlvbk1ldGFkYXRhKTogUHJvcGVydHlEZWNvcmF0b3Ige1xuXHRyZXR1cm4gZnVuY3Rpb24gKHRhcmdldDogVUk1Q29udHJvbCwgcHJvcGVydHlLZXk6IHN0cmluZywgcHJvcGVydHlEZXNjcmlwdG9yOiBUeXBlZFByb3BlcnR5RGVzY3JpcHRvcjxhbnk+KSB7XG5cdFx0Y29uc3QgbWV0YWRhdGEgPSBlbnN1cmVNZXRhZGF0YSh0YXJnZXQpO1xuXHRcdGlmIChhZ2dyZWdhdGlvbkRlZmluaXRpb24ubXVsdGlwbGUgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Ly8gVUk1IGRlZmF1bHRzIHRoaXMgdG8gdHJ1ZSBidXQgdGhpcyBpcyBqdXN0IHdlaXJkLi4uXG5cdFx0XHRhZ2dyZWdhdGlvbkRlZmluaXRpb24ubXVsdGlwbGUgPSBmYWxzZTtcblx0XHR9XG5cdFx0aWYgKCFtZXRhZGF0YS5hZ2dyZWdhdGlvbnNbcHJvcGVydHlLZXldKSB7XG5cdFx0XHRtZXRhZGF0YS5hZ2dyZWdhdGlvbnNbcHJvcGVydHlLZXldID0gYWdncmVnYXRpb25EZWZpbml0aW9uO1xuXHRcdH1cblx0XHRpZiAoYWdncmVnYXRpb25EZWZpbml0aW9uLmlzRGVmYXVsdCkge1xuXHRcdFx0bWV0YWRhdGEuZGVmYXVsdEFnZ3JlZ2F0aW9uID0gcHJvcGVydHlLZXk7XG5cdFx0fVxuXHRcdGRlbGV0ZSBwcm9wZXJ0eURlc2NyaXB0b3Iud3JpdGFibGU7XG5cdFx0ZGVsZXRlIChwcm9wZXJ0eURlc2NyaXB0b3IgYXMgYW55KS5pbml0aWFsaXplcjtcblxuXHRcdHJldHVybiBwcm9wZXJ0eURlc2NyaXB0b3I7XG5cdH0gYXMgYW55OyAvLyBUaGlzIGlzIHRlY2huaWNhbGx5IGFuIGFjY2Vzc29yIGRlY29yYXRvciwgYnV0IHNvbWVob3cgdGhlIGNvbXBpbGVyIGRvZXNuJ3QgbGlrZSBpdCBpZiBpIGRlY2xhcmUgaXQgYXMgc3VjaC47XG59XG5cbi8qKlxuICogRGVmaW5lcyBhbmQgY29uZmlndXJlIHRoZSBmb2xsb3dpbmcgYXNzb2NpYXRpb24gaW4gdGhlIGNvbnRyb2wgbWV0YXRhZGEuXG4gKlxuICogQHBhcmFtIHVpNUFzc29jaWF0aW9uTWV0YWRhdGEgVGhlIGRlZmluaXRpb24gb2YgdGhlIGFzc29jaWF0aW9uLlxuICogQHJldHVybnMgVGhlIGRlY29yYXRlZCBwcm9wZXJ0eVxuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzb2NpYXRpb24odWk1QXNzb2NpYXRpb25NZXRhZGF0YTogVUk1QXNzb2NpYXRpb25NZXRhZGF0YSk6IFByb3BlcnR5RGVjb3JhdG9yIHtcblx0cmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQ6IFVJNUNvbnRyb2wsIHByb3BlcnR5S2V5OiBzdHJpbmcsIHByb3BlcnR5RGVzY3JpcHRvcjogVHlwZWRQcm9wZXJ0eURlc2NyaXB0b3I8YW55Pikge1xuXHRcdGNvbnN0IG1ldGFkYXRhID0gZW5zdXJlTWV0YWRhdGEodGFyZ2V0KTtcblx0XHRpZiAoIW1ldGFkYXRhLmFzc29jaWF0aW9uc1twcm9wZXJ0eUtleV0pIHtcblx0XHRcdG1ldGFkYXRhLmFzc29jaWF0aW9uc1twcm9wZXJ0eUtleV0gPSB1aTVBc3NvY2lhdGlvbk1ldGFkYXRhO1xuXHRcdH1cblx0XHRkZWxldGUgcHJvcGVydHlEZXNjcmlwdG9yLndyaXRhYmxlO1xuXHRcdGRlbGV0ZSAocHJvcGVydHlEZXNjcmlwdG9yIGFzIGFueSkuaW5pdGlhbGl6ZXI7XG5cblx0XHRyZXR1cm4gcHJvcGVydHlEZXNjcmlwdG9yO1xuXHR9IGFzIGFueTsgLy8gVGhpcyBpcyB0ZWNobmljYWxseSBhbiBhY2Nlc3NvciBkZWNvcmF0b3IsIGJ1dCBzb21laG93IHRoZSBjb21waWxlciBkb2Vzbid0IGxpa2UgaXQgaWYgaSBkZWNsYXJlIGl0IGFzIHN1Y2guO1xufVxuXG4vKipcbiAqIERlZmluZXMgaW4gdGhlIG1ldGFkYXRhIHRoYXQgdGhpcyBjb250cm9sIGltcGxlbWVudHMgYSBzcGVjaWZpYyBpbnRlcmZhY2UuXG4gKlxuICogQHBhcmFtIGludGVyZmFjZU5hbWUgVGhlIG5hbWUgb2YgdGhlIGltcGxlbWVudGVkIGludGVyZmFjZVxuICogQHJldHVybnMgVGhlIGRlY29yYXRlZCBtZXRob2RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGltcGxlbWVudEludGVyZmFjZShpbnRlcmZhY2VOYW1lOiBzdHJpbmcpOiBQcm9wZXJ0eURlY29yYXRvciB7XG5cdHJldHVybiBmdW5jdGlvbiAodGFyZ2V0OiBVSTVDb250cm9sKSB7XG5cdFx0Y29uc3QgbWV0YWRhdGEgPSBlbnN1cmVNZXRhZGF0YSh0YXJnZXQpO1xuXG5cdFx0bWV0YWRhdGEuaW50ZXJmYWNlcy5wdXNoKGludGVyZmFjZU5hbWUpO1xuXHR9O1xufVxuXG4vKipcbiAqIEluZGljYXRlcyB0aGF0IHRoZSBmb2xsb3dpbmcgbWV0aG9kIHNob3VsZCBhbHNvIGJlIGV4cG9zZWQgc3RhdGljYWxseSBzbyB3ZSBjYW4gY2FsbCBpdCBmcm9tIFhNTC5cbiAqXG4gKiBAcmV0dXJucyBUaGUgZGVjb3JhdGVkIG1ldGhvZFxuICovXG5leHBvcnQgZnVuY3Rpb24geG1sRXZlbnRIYW5kbGVyKCk6IE1ldGhvZERlY29yYXRvciB7XG5cdHJldHVybiBmdW5jdGlvbiAodGFyZ2V0OiBVSTVDb250cm9sLCBwcm9wZXJ0eWtleSkge1xuXHRcdGNvbnN0IGN1cnJlbnRDb25zdHJ1Y3RvcjogVUk1QVBJQ29udHJvbCA9IHRhcmdldC5jb25zdHJ1Y3RvciBhcyB1bmtub3duIGFzIFVJNUFQSUNvbnRyb2w7XG5cdFx0Y3VycmVudENvbnN0cnVjdG9yW3Byb3BlcnR5a2V5LnRvU3RyaW5nKCldID0gZnVuY3Rpb24gKC4uLmFyZ3M6IGFueVtdKSB7XG5cdFx0XHRpZiAoYXJncyAmJiBhcmdzLmxlbmd0aCkge1xuXHRcdFx0XHRjb25zdCBjdXJyZW50VGFyZ2V0ID0gY3VycmVudENvbnN0cnVjdG9yLmdldEFQSShhcmdzWzBdIGFzIFVJNUV2ZW50KTtcblx0XHRcdFx0Y3VycmVudFRhcmdldD8uW3Byb3BlcnR5a2V5LnRvU3RyaW5nKCldKC4uLmFyZ3MpO1xuXHRcdFx0fVxuXHRcdH07XG5cdH07XG59XG5cbi8qKlxuICogSW5kaWNhdGVzIHRoYXQgdGhlIGZvbGxvd2luZyBjbGFzcyBzaG91bGQgZGVmaW5lIGEgVUk1IGNvbnRyb2wgb2YgdGhlIHNwZWNpZmllZCBuYW1lLlxuICpcbiAqIEBwYXJhbSBzVGFyZ2V0IFRoZSBmdWxseSBxdWFsaWZpZWQgbmFtZSBvZiB0aGUgVUk1IGNsYXNzXG4gKiBAcGFyYW0gbWV0YWRhdGFEZWZpbml0aW9uIElubGluZSBtZXRhZGF0YSBkZWZpbml0aW9uXG4gKiBAY2xhc3NcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlZmluZVVJNUNsYXNzKHNUYXJnZXQ6IHN0cmluZywgbWV0YWRhdGFEZWZpbml0aW9uPzogYW55KTogQ2xhc3NEZWNvcmF0b3Ige1xuXHRyZXR1cm4gZnVuY3Rpb24gKGNvbnN0cnVjdG9yOiBGdW5jdGlvbikge1xuXHRcdGlmICghY29uc3RydWN0b3IucHJvdG90eXBlLm1ldGFkYXRhKSB7XG5cdFx0XHRjb25zdHJ1Y3Rvci5wcm90b3R5cGUubWV0YWRhdGEgPSB7fTtcblx0XHR9XG5cdFx0aWYgKG1ldGFkYXRhRGVmaW5pdGlvbikge1xuXHRcdFx0Zm9yIChjb25zdCBrZXkgaW4gbWV0YWRhdGFEZWZpbml0aW9uKSB7XG5cdFx0XHRcdGNvbnN0cnVjdG9yLnByb3RvdHlwZS5tZXRhZGF0YVtrZXldID0gbWV0YWRhdGFEZWZpbml0aW9uW2tleSBhcyBrZXlvZiBVSTVDb250cm9sTWV0YWRhdGFEZWZpbml0aW9uXTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHJlZ2lzdGVyVUk1TWV0YWRhdGEoY29uc3RydWN0b3IsIHNUYXJnZXQsIGNvbnN0cnVjdG9yLnByb3RvdHlwZSk7XG5cdH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVSZWZlcmVuY2U8VD4oKSB7XG5cdHJldHVybiB7XG5cdFx0Y3VycmVudDogdW5kZWZpbmVkIGFzIGFueSBhcyBULFxuXHRcdHNldEN1cnJlbnQ6IGZ1bmN0aW9uIChvQ29udHJvbEluc3RhbmNlOiBUKTogdm9pZCB7XG5cdFx0XHR0aGlzLmN1cnJlbnQgPSBvQ29udHJvbEluc3RhbmNlO1xuXHRcdH1cblx0fTtcbn1cbi8qKlxuICogRGVmaW5lcyB0aGF0IHRoZSBmb2xsb3dpbmcgb2JqZWN0IHdpbGwgaG9sZCBhIHJlZmVyZW5jZSB0byBhIGNvbnRyb2wgdGhyb3VnaCBqc3ggdGVtcGxhdGluZy5cbiAqXG4gKiBAcmV0dXJucyBUaGUgZGVjb3JhdGVkIHByb3BlcnR5LlxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVmaW5lUmVmZXJlbmNlKCk6IFByb3BlcnR5RGVjb3JhdG9yIHtcblx0cmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQ6IFVJNUNvbnRyb2wsIHByb3BlcnR5S2V5OiBzdHJpbmcsIHByb3BlcnR5RGVzY3JpcHRvcjogVHlwZWRQcm9wZXJ0eURlc2NyaXB0b3I8YW55Pikge1xuXHRcdGRlbGV0ZSBwcm9wZXJ0eURlc2NyaXB0b3Iud3JpdGFibGU7XG5cdFx0ZGVsZXRlIChwcm9wZXJ0eURlc2NyaXB0b3IgYXMgYW55KS5pbml0aWFsaXplcjtcblx0XHQocHJvcGVydHlEZXNjcmlwdG9yIGFzIGFueSkuaW5pdGlhbGl6ZXIgPSBjcmVhdGVSZWZlcmVuY2U7XG5cblx0XHRyZXR1cm4gcHJvcGVydHlEZXNjcmlwdG9yO1xuXHR9IGFzIGFueTsgLy8gVGhpcyBpcyB0ZWNobmljYWxseSBhbiBhY2Nlc3NvciBkZWNvcmF0b3IsIGJ1dCBzb21laG93IHRoZSBjb21waWxlciBkb2Vzbid0IGxpa2UgaXQgaWYgaSBkZWNsYXJlIGl0IGFzIHN1Y2guO1xufVxuXG4vKipcbiAqIEludGVybmFsIGhlYXZ5IGxpZnRpbmcgdGhhdCB3aWxsIHRha2UgY2FyZSBvZiBjcmVhdGluZyB0aGUgY2xhc3MgcHJvcGVydHkgZm9yIHVpNSB0byB1c2UuXG4gKlxuICogQHBhcmFtIGNsYXp6IFRoZSBjbGFzcyBwcm90b3R5cGVcbiAqIEBwYXJhbSBuYW1lIFRoZSBuYW1lIG9mIHRoZSBjbGFzcyB0byBjcmVhdGVcbiAqIEBwYXJhbSBpbk9iaiBUaGUgbWV0YWRhdGEgb2JqZWN0XG4gKiBAcmV0dXJucyBUaGUgbWV0YWRhdGEgY2xhc3NcbiAqL1xuZnVuY3Rpb24gcmVnaXN0ZXJVSTVNZXRhZGF0YShjbGF6ejogYW55LCBuYW1lOiBzdHJpbmcsIGluT2JqOiBhbnkpOiBhbnkge1xuXHRpZiAoY2xhenouZ2V0TWV0YWRhdGEgJiYgY2xhenouZ2V0TWV0YWRhdGEoKS5pc0EoXCJzYXAudWkuY29yZS5tdmMuQ29udHJvbGxlckV4dGVuc2lvblwiKSkge1xuXHRcdE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGluT2JqKS5mb3JFYWNoKChvYmpOYW1lKSA9PiB7XG5cdFx0XHRjb25zdCBkZXNjcmlwdG9yID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihpbk9iaiwgb2JqTmFtZSk7XG5cdFx0XHRpZiAoZGVzY3JpcHRvciAmJiAhZGVzY3JpcHRvci5lbnVtZXJhYmxlKSB7XG5cdFx0XHRcdGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IHRydWU7XG5cdFx0XHRcdC8vXHRcdExvZy5lcnJvcihgUHJvcGVydHkgJHtvYmpOYW1lfSBmcm9tICR7bmFtZX0gc2hvdWxkIGJlIGRlY29yYXRlZCBhcyBwdWJsaWNgKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXHRjb25zdCBvYmo6IGFueSA9IHt9O1xuXHRvYmoubWV0YWRhdGEgPSBpbk9iai5tZXRhZGF0YSB8fCB7fTtcblx0b2JqLm92ZXJyaWRlID0gaW5PYmoub3ZlcnJpZGU7XG5cdG9iai5jb25zdHJ1Y3RvciA9IGNsYXp6O1xuXHRvYmoubWV0YWRhdGEuYmFzZVR5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YoY2xhenoucHJvdG90eXBlKS5nZXRNZXRhZGF0YSgpLmdldE5hbWUoKTtcblxuXHRpZiAoY2xheno/LmdldE1ldGFkYXRhKCk/LmdldFN0ZXJlb3R5cGUoKSA9PT0gXCJjb250cm9sXCIpIHtcblx0XHRjb25zdCByZW5kZXJlckRlZmluaXRpb24gPSBpbk9iai5yZW5kZXJlciB8fCBjbGF6ei5yZW5kZXJlciB8fCBjbGF6ei5yZW5kZXI7XG5cdFx0b2JqLnJlbmRlcmVyID0geyBhcGlWZXJzaW9uOiAyIH07XG5cdFx0aWYgKHR5cGVvZiByZW5kZXJlckRlZmluaXRpb24gPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0b2JqLnJlbmRlcmVyLnJlbmRlciA9IHJlbmRlcmVyRGVmaW5pdGlvbjtcblx0XHR9IGVsc2UgaWYgKHJlbmRlcmVyRGVmaW5pdGlvbiAhPSB1bmRlZmluZWQpIHtcblx0XHRcdG9iai5yZW5kZXJlciA9IHJlbmRlcmVyRGVmaW5pdGlvbjtcblx0XHR9XG5cdH1cblx0b2JqLm1ldGFkYXRhLmludGVyZmFjZXMgPSBpbk9iai5tZXRhZGF0YT8uaW50ZXJmYWNlcyB8fCBjbGF6ei5tZXRhZGF0YT8uaW50ZXJmYWNlcztcblx0T2JqZWN0LmtleXMoY2xhenoucHJvdG90eXBlKS5mb3JFYWNoKChrZXkpID0+IHtcblx0XHRpZiAoa2V5ICE9PSBcIm1ldGFkYXRhXCIpIHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdG9ialtrZXldID0gY2xhenoucHJvdG90eXBlW2tleV07XG5cdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdC8vY29uc29sZS5sb2coZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcblx0aWYgKG9iai5tZXRhZGF0YT8uY29udHJvbGxlckV4dGVuc2lvbnMgJiYgT2JqZWN0LmtleXMob2JqLm1ldGFkYXRhLmNvbnRyb2xsZXJFeHRlbnNpb25zKS5sZW5ndGggPiAwKSB7XG5cdFx0Zm9yIChjb25zdCBjRXh0TmFtZSBpbiBvYmoubWV0YWRhdGEuY29udHJvbGxlckV4dGVuc2lvbnMpIHtcblx0XHRcdG9ialtjRXh0TmFtZV0gPSBvYmoubWV0YWRhdGEuY29udHJvbGxlckV4dGVuc2lvbnNbY0V4dE5hbWVdO1xuXHRcdH1cblx0fVxuXHRjb25zdCBvdXRwdXQgPSBjbGF6ei5leHRlbmQobmFtZSwgb2JqKTtcblx0Y29uc3QgZm5Jbml0ID0gb3V0cHV0LnByb3RvdHlwZS5pbml0O1xuXHRvdXRwdXQucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAoLi4uYXJnczogYW55W10pIHtcblx0XHRpZiAoZm5Jbml0KSB7XG5cdFx0XHRmbkluaXQuYXBwbHkodGhpcywgYXJncyk7XG5cdFx0fVxuXHRcdHRoaXMubWV0YWRhdGEgPSBvYmoubWV0YWRhdGE7XG5cblx0XHRpZiAob2JqLm1ldGFkYXRhLnByb3BlcnRpZXMpIHtcblx0XHRcdGNvbnN0IGFQcm9wZXJ0eUtleXMgPSBPYmplY3Qua2V5cyhvYmoubWV0YWRhdGEucHJvcGVydGllcyk7XG5cdFx0XHRhUHJvcGVydHlLZXlzLmZvckVhY2goKHByb3BlcnR5S2V5KSA9PiB7XG5cdFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBwcm9wZXJ0eUtleSwge1xuXHRcdFx0XHRcdGNvbmZpZ3VyYWJsZTogdHJ1ZSxcblx0XHRcdFx0XHRzZXQ6ICh2OiBhbnkpID0+IHtcblx0XHRcdFx0XHRcdHJldHVybiB0aGlzLnNldFByb3BlcnR5KHByb3BlcnR5S2V5LCB2KTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGdldDogKCkgPT4ge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHRoaXMuZ2V0UHJvcGVydHkocHJvcGVydHlLZXkpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblx0XHRcdGNvbnN0IGFBZ2dyZWdhdGlvbktleXMgPSBPYmplY3Qua2V5cyhvYmoubWV0YWRhdGEuYWdncmVnYXRpb25zKTtcblx0XHRcdGFBZ2dyZWdhdGlvbktleXMuZm9yRWFjaCgoYWdncmVnYXRpb25LZXkpID0+IHtcblx0XHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIGFnZ3JlZ2F0aW9uS2V5LCB7XG5cdFx0XHRcdFx0Y29uZmlndXJhYmxlOiB0cnVlLFxuXHRcdFx0XHRcdHNldDogKHY6IGFueSkgPT4ge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHRoaXMuc2V0QWdncmVnYXRpb24oYWdncmVnYXRpb25LZXksIHYpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0Z2V0OiAoKSA9PiB7XG5cdFx0XHRcdFx0XHRjb25zdCBhZ2dyZWdhdGlvbkNvbnRlbnQgPSB0aGlzLmdldEFnZ3JlZ2F0aW9uKGFnZ3JlZ2F0aW9uS2V5KTtcblx0XHRcdFx0XHRcdGlmIChvYmoubWV0YWRhdGEuYWdncmVnYXRpb25zW2FnZ3JlZ2F0aW9uS2V5XS5tdWx0aXBsZSkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gYWdncmVnYXRpb25Db250ZW50IHx8IFtdO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIGFnZ3JlZ2F0aW9uQ29udGVudDtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cdFx0XHRjb25zdCBhQXNzb2NpYXRpb25LZXlzID0gT2JqZWN0LmtleXMob2JqLm1ldGFkYXRhLmFzc29jaWF0aW9ucyk7XG5cdFx0XHRhQXNzb2NpYXRpb25LZXlzLmZvckVhY2goKGFzc29jaWF0aW9uS2V5KSA9PiB7XG5cdFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBhc3NvY2lhdGlvbktleSwge1xuXHRcdFx0XHRcdGNvbmZpZ3VyYWJsZTogdHJ1ZSxcblx0XHRcdFx0XHRzZXQ6ICh2OiBhbnkpID0+IHtcblx0XHRcdFx0XHRcdHJldHVybiB0aGlzLnNldEFzc29jaWF0aW9uKGFzc29jaWF0aW9uS2V5LCB2KTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGdldDogKCkgPT4ge1xuXHRcdFx0XHRcdFx0Y29uc3QgYWdncmVnYXRpb25Db250ZW50ID0gdGhpcy5nZXRBc3NvY2lhdGlvbihhc3NvY2lhdGlvbktleSk7XG5cdFx0XHRcdFx0XHRpZiAob2JqLm1ldGFkYXRhLmFzc29jaWF0aW9uc1thc3NvY2lhdGlvbktleV0ubXVsdGlwbGUpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIGFnZ3JlZ2F0aW9uQ29udGVudCB8fCBbXTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBhZ2dyZWdhdGlvbkNvbnRlbnQ7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXHRcdH1cblx0fTtcblx0Y2xhenoub3ZlcnJpZGUgPSBmdW5jdGlvbiAob0V4dGVuc2lvbjogYW55KSB7XG5cdFx0Y29uc3QgcG9sID0ge307XG5cdFx0KHBvbCBhcyBhbnkpLmNvbnN0cnVjdG9yID0gZnVuY3Rpb24gKC4uLmFyZ3M6IGFueVtdKSB7XG5cdFx0XHRyZXR1cm4gY2xhenouYXBwbHkodGhpcywgYXJncyBhcyBhbnkpO1xuXHRcdH07XG5cdFx0Y29uc3Qgb0NsYXNzID0gKE1ldGFkYXRhIGFzIGFueSkuY3JlYXRlQ2xhc3MoY2xhenosIGBhbm9ueW1vdXNFeHRlbnNpb25+JHt1aWQoKX1gLCBwb2wsIENvbnRyb2xsZXJNZXRhZGF0YSk7XG5cdFx0b0NsYXNzLmdldE1ldGFkYXRhKCkuX3N0YXRpY092ZXJyaWRlID0gb0V4dGVuc2lvbjtcblx0XHRvQ2xhc3MuZ2V0TWV0YWRhdGEoKS5fb3ZlcnJpZGUgPSBjbGF6ei5nZXRNZXRhZGF0YSgpLl9vdmVycmlkZTtcblx0XHRyZXR1cm4gb0NsYXNzO1xuXHR9O1xuXG5cdE9iamVjdFBhdGguc2V0KG5hbWUsIG91dHB1dCk7XG5cdHJldHVybiBvdXRwdXQ7XG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7O0VBeUVBLE1BQU1BLGNBQWMsR0FBRyxVQUFVQyxNQUFx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