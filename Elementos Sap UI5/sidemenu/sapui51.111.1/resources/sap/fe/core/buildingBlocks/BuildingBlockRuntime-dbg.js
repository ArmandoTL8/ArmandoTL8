/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/deepClone", "sap/base/util/uid", "sap/fe/core/buildingBlocks/AttributeModel", "sap/fe/core/converters/helpers/ConfigurableObject", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/TypeGuards", "sap/fe/macros/ResourceModel", "sap/ui/base/BindingParser", "sap/ui/core/util/XMLPreprocessor", "./TraceInfo"], function (Log, deepClone, uid, AttributeModel, ConfigurableObject, BindingToolkit, TypeGuards, ResourceModel, BindingParser, XMLPreprocessor, TraceInfo) {
  "use strict";

  var _exports = {};
  var isFunctionArray = TypeGuards.isFunctionArray;
  var isContext = TypeGuards.isContext;
  var isBindingToolkitExpression = BindingToolkit.isBindingToolkitExpression;
  var compileExpression = BindingToolkit.compileExpression;
  var Placement = ConfigurableObject.Placement;
  const LOGGER_SCOPE = "sap.fe.core.buildingBlocks.BuildingBlockRuntime";
  const XMLTEMPLATING_NS = "http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1";
  const DOMParserInstance = new DOMParser();
  let isTraceMode = false;
  /**
   * Typeguard for checking if a building block uses API 1.
   *
   * @param buildingBlockDefinition
   * @returns `true` if the building block is using API 1.
   */
  function isV1MacroDef(buildingBlockDefinition) {
    return buildingBlockDefinition.apiVersion === undefined || buildingBlockDefinition.apiVersion === 1;
  }
  function validateMacroMetadataContext(sName, mContexts, oContextSettings, sKey) {
    const oContext = mContexts[sKey];
    const oContextObject = oContext === null || oContext === void 0 ? void 0 : oContext.getObject();
    if (oContextSettings.required === true && (!oContext || oContextObject === null)) {
      throw new Error(`${sName}: Required metadataContext '${sKey}' is missing`);
    } else if (oContextObject) {
      // If context object has $kind property, $Type should not be checked
      // Therefore remove from context settings
      if (oContextObject.hasOwnProperty("$kind") && oContextObject.$kind !== undefined && oContextSettings.$kind !== undefined) {
        // Check if the $kind is part of the allowed ones
        if (oContextSettings.$kind.indexOf(oContextObject.$kind) === -1) {
          throw new Error(`${sName}: '${sKey}' must be '$kind' '${oContextSettings["$kind"]}' but is '${oContextObject.$kind}': ${oContext.getPath()}`);
        }
      } else if (oContextObject.hasOwnProperty("$Type") && oContextObject.$Type !== undefined && oContextSettings.$Type) {
        // Check only $Type
        if (oContextSettings.$Type.indexOf(oContextObject.$Type) === -1) {
          throw new Error(`${sName}: '${sKey}' must be '$Type' '${oContextSettings["$Type"]}' but is '${oContextObject.$Type}': ${oContext.getPath()}`);
        }
      }
    }
  }
  function validateMacroSignature(sName, oMetadata, mContexts, oNode) {
    const aMetadataContextKeys = oMetadata.metadataContexts && Object.keys(oMetadata.metadataContexts) || [],
      aProperties = oMetadata.properties && Object.keys(oMetadata.properties) || [],
      oAttributeNames = {};

    // collect all attributes to find unchecked properties
    const attributeNames = oNode.getAttributeNames();
    for (const attributeName of attributeNames) {
      oAttributeNames[attributeName] = true;
    }

    //Check metadataContexts
    aMetadataContextKeys.forEach(function (sKey) {
      const oContextSettings = oMetadata.metadataContexts[sKey];
      validateMacroMetadataContext(sName, mContexts, oContextSettings, sKey);
      delete oAttributeNames[sKey];
    });
    //Check properties
    aProperties.forEach(function (sKey) {
      const oPropertySettings = oMetadata.properties[sKey];
      if (!oNode.hasAttribute(sKey)) {
        if (oPropertySettings.required && !oPropertySettings.hasOwnProperty("defaultValue")) {
          throw new Error(`${sName}: ` + `Required property '${sKey}' is missing`);
        }
      } else {
        delete oAttributeNames[sKey];
      }
    });

    // Unchecked properties
    Object.keys(oAttributeNames).forEach(function (sKey) {
      // no check for properties which contain a colon ":" (different namespace), e.g. xmlns:trace, trace:macroID, unittest:id
      if (sKey.indexOf(":") < 0 && !sKey.startsWith("xmlns")) {
        Log.warning(`Unchecked parameter: ${sName}: ${sKey}`, undefined, LOGGER_SCOPE);
      }
    });
  }
  _exports.validateMacroSignature = validateMacroSignature;
  const SAP_UI_CORE_ELEMENT = "sap.ui.core.Element";
  const SAP_UI_MODEL_CONTEXT = "sap.ui.model.Context";

  /**
   * Ensures that the metadata for the building block are properly defined.
   *
   * @param buildingBlockMetadata The metadata received from the input
   * @param isOpen Whether the building block is open or not
   * @param apiVersion
   * @returns A set of completed metadata for further processing
   */
  _exports.SAP_UI_MODEL_CONTEXT = SAP_UI_MODEL_CONTEXT;
  function prepareMetadata(buildingBlockMetadata) {
    let isOpen = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    let apiVersion = arguments.length > 2 ? arguments[2] : undefined;
    if (buildingBlockMetadata) {
      const oProperties = {};
      const oAggregations = {
        dependents: {
          type: SAP_UI_CORE_ELEMENT
        },
        customData: {
          type: SAP_UI_CORE_ELEMENT
        }
      };
      if (apiVersion === 2) {
        oAggregations.dependents.slot = "dependents";
        oAggregations.customData.slot = "customData";
      }
      const oMetadataContexts = {};
      let foundDefaultAggregation;
      Object.keys(buildingBlockMetadata.properties).forEach(function (sPropertyName) {
        if (buildingBlockMetadata.properties[sPropertyName].type !== SAP_UI_MODEL_CONTEXT) {
          oProperties[sPropertyName] = buildingBlockMetadata.properties[sPropertyName];
        } else {
          oMetadataContexts[sPropertyName] = buildingBlockMetadata.properties[sPropertyName];
        }
      });
      // Merge events into properties as they are handled identically
      if (buildingBlockMetadata.events !== undefined) {
        Object.keys(buildingBlockMetadata.events).forEach(function (sEventName) {
          oProperties[sEventName] = {
            type: "function",
            ...buildingBlockMetadata.events[sEventName]
          };
        });
      }
      if (buildingBlockMetadata.aggregations !== undefined) {
        Object.keys(buildingBlockMetadata.aggregations).forEach(function (sPropertyName) {
          oAggregations[sPropertyName] = buildingBlockMetadata.aggregations[sPropertyName];
          if (oAggregations[sPropertyName].isDefault) {
            foundDefaultAggregation = sPropertyName;
          }
        });
      }
      return {
        properties: oProperties,
        aggregations: oAggregations,
        defaultAggregation: foundDefaultAggregation,
        metadataContexts: oMetadataContexts,
        isOpen: isOpen
      };
    } else {
      return {
        metadataContexts: {},
        aggregations: {
          dependents: {
            type: SAP_UI_CORE_ELEMENT
          },
          customData: {
            type: SAP_UI_CORE_ELEMENT
          }
        },
        properties: {},
        isOpen: isOpen
      };
    }
  }

  /**
   * Checks the absolute or context paths and returns an appropriate MetaContext.
   *
   * @param oSettings Additional settings
   * @param sAttributeValue The attribute value
   * @returns The meta data context object
   */
  function _checkAbsoluteAndContextPaths(oSettings, sAttributeValue) {
    let sMetaPath;
    if (sAttributeValue && sAttributeValue.startsWith("/")) {
      // absolute path - we just use this one
      sMetaPath = sAttributeValue;
    } else {
      let sContextPath = oSettings.currentContextPath.getPath();
      if (!sContextPath.endsWith("/")) {
        sContextPath += "/";
      }
      sMetaPath = sContextPath + sAttributeValue;
    }
    return {
      model: "metaModel",
      path: sMetaPath
    };
  }

  /**
   * This method helps to create the metadata context in case it is not yet available in the store.
   *
   * @param oSettings Additional settings
   * @param sAttributeName The attribute name
   * @param sAttributeValue The attribute value
   * @returns The meta data context object
   */
  function _createInitialMetadataContext(oSettings, sAttributeName, sAttributeValue) {
    let returnContext;
    if (sAttributeValue.startsWith("/uid--")) {
      const oData = myStore[sAttributeValue];
      oSettings.models.converterContext.setProperty(sAttributeValue, oData);
      returnContext = {
        model: "converterContext",
        path: sAttributeValue
      };
      delete myStore[sAttributeValue];
    } else if (sAttributeName === "metaPath" && oSettings.currentContextPath || sAttributeName === "contextPath") {
      returnContext = _checkAbsoluteAndContextPaths(oSettings, sAttributeValue);
    } else if (sAttributeValue && sAttributeValue.startsWith("/")) {
      // absolute path - we just use this one
      returnContext = {
        model: "metaModel",
        path: sAttributeValue
      };
    } else {
      returnContext = {
        model: "metaModel",
        path: oSettings.bindingContexts.entitySet ? oSettings.bindingContexts.entitySet.getPath(sAttributeValue) : sAttributeValue
      };
    }
    return returnContext;
  }
  function _getMetadataContext(oSettings, oNode, sAttributeName, oVisitor, bDoNotResolve, isOpen) {
    let oMetadataContext;
    if (!bDoNotResolve && oNode.hasAttribute(sAttributeName)) {
      const sAttributeValue = oNode.getAttribute(sAttributeName);
      oMetadataContext = BindingParser.complexParser(sAttributeValue);
      if (!oMetadataContext) {
        oMetadataContext = _createInitialMetadataContext(oSettings, sAttributeName, sAttributeValue);
      }
    } else if (oSettings.bindingContexts.hasOwnProperty(sAttributeName)) {
      oMetadataContext = {
        model: sAttributeName,
        path: ""
      };
    } else if (isOpen) {
      try {
        if (oVisitor.getContext(`${sAttributeName}>`)) {
          oMetadataContext = {
            model: sAttributeName,
            path: ""
          };
        }
      } catch (e) {
        return undefined;
      }
    }
    return oMetadataContext;
  }

  /**
   * Parse the incoming XML node and try to resolve the properties defined there.
   *
   * @param oMetadata The metadata for the building block
   * @param oNode The XML node to parse
   * @param isPublic Whether the building block is used in a public context or not
   * @param oVisitor The visitor instance
   * @param apiVersion The API version of the building block
   */
  async function processProperties(oMetadata, oNode, isPublic, oVisitor, apiVersion) {
    const oDefinitionProperties = oMetadata.properties;

    // Retrieve properties values
    const aDefinitionPropertiesKeys = Object.keys(oDefinitionProperties);
    const propertyValues = {};
    for (const sKeyValue of aDefinitionPropertiesKeys) {
      if (oDefinitionProperties[sKeyValue].type === "object") {
        propertyValues[sKeyValue] = deepClone(oDefinitionProperties[sKeyValue].defaultValue || {}); // To avoid values being reused across macros
      } else {
        propertyValues[sKeyValue] = oDefinitionProperties[sKeyValue].defaultValue;
      }
      if (oNode.hasAttribute(sKeyValue) && isPublic && oDefinitionProperties[sKeyValue].isPublic === false) {
        Log.error(`Property ${sKeyValue} was ignored as it is not intended for public usage`);
      } else if (oNode.hasAttribute(sKeyValue)) {
        await oVisitor.visitAttribute(oNode, oNode.attributes.getNamedItem(sKeyValue));
        let value = oNode.getAttribute(sKeyValue);
        if (value !== undefined && value !== null) {
          if (apiVersion === 2 && typeof value === "string" && !value.startsWith("{")) {
            switch (oDefinitionProperties[sKeyValue].type) {
              case "boolean":
                value = value === "true";
                break;
              case "number":
                value = Number(value);
                break;
            }
          }
          value = value === null ? undefined : value;
          propertyValues[sKeyValue] = value;
        }
      }
    }
    return propertyValues;
  }

  /**
   * Parse the incoming XML node and try to resolve the binding contexts defined inside.
   *
   * @param oMetadata The metadata for the building block
   * @param oSettings The settings object
   * @param oNode The XML node to parse
   * @param isPublic Whether the building block is used in a public context or not
   * @param oVisitor The visitor instance
   * @param mContexts The contexts to be used
   * @param oMetadataContexts	The metadata contexts to be used
   * @returns The processed and missing contexts
   */
  function processContexts(oMetadata, oSettings, oNode, isPublic, oVisitor, mContexts, oMetadataContexts) {
    oSettings.currentContextPath = oSettings.bindingContexts.contextPath;
    const mMissingContext = {};
    const propertyValues = {};
    const oDefinitionContexts = oMetadata.metadataContexts;
    const aDefinitionContextsKeys = Object.keys(oDefinitionContexts);
    // Since the metaPath and other property can be relative to the contextPath we need to evaluate the current contextPath first
    const contextPathIndex = aDefinitionContextsKeys.indexOf("contextPath");
    if (contextPathIndex !== -1) {
      // If it is defined we extract it and reinsert it in the first position of the array
      const contextPathDefinition = aDefinitionContextsKeys.splice(contextPathIndex, 1);
      aDefinitionContextsKeys.splice(0, 0, contextPathDefinition[0]);
    }
    for (const sAttributeName of aDefinitionContextsKeys) {
      const bDoNotResolve = isPublic && oDefinitionContexts[sAttributeName].isPublic === false && oNode.hasAttribute(sAttributeName);
      const oMetadataContext = _getMetadataContext(oSettings, oNode, sAttributeName, oVisitor, bDoNotResolve, oMetadata.isOpen);
      if (oMetadataContext) {
        oMetadataContext.name = sAttributeName;
        addSingleContext(mContexts, oVisitor, oMetadataContext, oMetadataContexts);
        if ((sAttributeName === "entitySet" || sAttributeName === "contextPath") && !oSettings.bindingContexts.hasOwnProperty(sAttributeName)) {
          oSettings.bindingContexts[sAttributeName] = mContexts[sAttributeName];
        }
        if (sAttributeName === "contextPath") {
          oSettings.currentContextPath = mContexts[sAttributeName];
        }
        propertyValues[sAttributeName] = mContexts[sAttributeName];
      } else {
        mMissingContext[sAttributeName] = true;
      }
    }
    return {
      mMissingContext,
      propertyValues: propertyValues
    };
  }
  function parseAggregation(oAggregation, processAggregations) {
    const oOutObjects = {};
    if (oAggregation && oAggregation.children.length > 0) {
      const children = oAggregation.children;
      for (let childIdx = 0; childIdx < children.length; childIdx++) {
        const childDefinition = children[childIdx];
        let childKey = childDefinition.getAttribute("key") || childDefinition.getAttribute("id");
        if (childKey) {
          childKey = `InlineXML_${childKey}`;
          childDefinition.setAttribute("key", childKey);
          let aggregationObject = {
            key: childKey,
            position: {
              placement: childDefinition.getAttribute("placement") || Placement.After,
              anchor: childDefinition.getAttribute("anchor") || undefined
            },
            type: "Slot"
          };
          if (processAggregations) {
            aggregationObject = processAggregations(childDefinition, aggregationObject);
          }
          oOutObjects[aggregationObject.key] = aggregationObject;
        }
      }
    }
    return oOutObjects;
  }

  /**
   * Processes the child nodes of the building block and parses them as either aggregations or object-/array-based values.
   *
   * @param oNode The XML node for which to process the children
   * @param oVisitor The visitor instance
   * @param oMetadata The metadata for the building block
   * @param isPublic Whether the building block is used in a public context or not
   * @param propertyValues The values of already parsed property
   * @param apiVersion The API version of the building block
   */
  async function processChildren(oNode, oVisitor, oMetadata, isPublic, propertyValues, apiVersion) {
    const oAggregations = {};
    if (oNode.firstElementChild !== null) {
      let oFirstElementChild = oNode.firstElementChild;
      if (apiVersion === 2) {
        while (oFirstElementChild !== null) {
          if (oFirstElementChild.namespaceURI === XMLTEMPLATING_NS) {
            // In case we encounter a templating tag, run the visitor on it and continue with the resulting child
            const oParent = oFirstElementChild.parentNode;
            let iChildIndex;
            if (oParent) {
              iChildIndex = Array.from(oParent.children).indexOf(oFirstElementChild);
              await oVisitor.visitNode(oFirstElementChild);
              oFirstElementChild = oParent.children[iChildIndex] ? oParent.children[iChildIndex] : null;
            } else {
              // Not sure how this could happen but i also don't want to create infinite loops
              oFirstElementChild = oFirstElementChild.nextElementSibling;
            }
          } else {
            const sChildName = oFirstElementChild.localName;
            let sAggregationName = sChildName;
            if (sAggregationName[0].toUpperCase() === sAggregationName[0]) {
              // not a sub aggregation, go back to default Aggregation
              sAggregationName = oMetadata.defaultAggregation || "";
            }
            const aggregationDefinition = oMetadata.aggregations[sAggregationName];
            if (aggregationDefinition !== undefined && !aggregationDefinition.slot) {
              const parsedAggregation = parseAggregation(oFirstElementChild, aggregationDefinition.processAggregations);
              propertyValues[sAggregationName] = parsedAggregation;
              for (const parsedAggregationKey in parsedAggregation) {
                oMetadata.aggregations[parsedAggregationKey] = parsedAggregation[parsedAggregationKey];
              }
            }
            oFirstElementChild = oFirstElementChild.nextElementSibling;
          }
        }
      }
      if (apiVersion !== 2) {
        // If there are aggregation we need to visit the childNodes to resolve templating instructions
        await oVisitor.visitChildNodes(oNode);
      }
      oFirstElementChild = oNode.firstElementChild;
      while (oFirstElementChild !== null) {
        const oNextChild = oFirstElementChild.nextElementSibling;
        const sChildName = oFirstElementChild.localName;
        let sAggregationName = sChildName;
        if (sAggregationName[0].toUpperCase() === sAggregationName[0]) {
          // not a sub aggregation, go back to default Aggregation
          sAggregationName = oMetadata.defaultAggregation || "";
        }
        if (Object.keys(oMetadata.aggregations).indexOf(sAggregationName) !== -1 && (!isPublic || oMetadata.aggregations[sAggregationName].isPublic === true)) {
          if (apiVersion === 2) {
            const aggregationDefinition = oMetadata.aggregations[sAggregationName];
            if (!aggregationDefinition.slot && oFirstElementChild !== null && oFirstElementChild.children.length > 0) {
              await oVisitor.visitNode(oFirstElementChild);
              let childDefinition = oFirstElementChild.firstElementChild;
              while (childDefinition) {
                const nextChild = childDefinition.nextElementSibling;
                if (!aggregationDefinition.hasVirtualNode) {
                  const childWrapper = document.createElementNS(oNode.namespaceURI, childDefinition.getAttribute("key"));
                  childWrapper.appendChild(childDefinition);
                  oAggregations[childDefinition.getAttribute("key")] = childWrapper;
                } else {
                  oAggregations[childDefinition.getAttribute("key")] = childDefinition;
                }
                childDefinition.removeAttribute("key");
                childDefinition = nextChild;
              }
            } else if (aggregationDefinition.slot) {
              if (sAggregationName !== sChildName) {
                if (!oAggregations[sAggregationName]) {
                  const oNewChild = document.createElementNS(oNode.namespaceURI, sAggregationName);
                  oAggregations[sAggregationName] = oNewChild;
                }
                oAggregations[sAggregationName].appendChild(oFirstElementChild);
              } else {
                oAggregations[sAggregationName] = oFirstElementChild;
              }
            }
          } else {
            await oVisitor.visitNode(oFirstElementChild);
            oAggregations[oFirstElementChild.localName] = oFirstElementChild;
          }
        } else if (Object.keys(oMetadata.properties).indexOf(sAggregationName) !== -1) {
          await oVisitor.visitNode(oFirstElementChild);
          if (oMetadata.properties[sAggregationName].type === "object") {
            // Object Type properties
            const aggregationPropertyValues = {};
            const attributeNames = oFirstElementChild.getAttributeNames();
            for (const attributeName of attributeNames) {
              aggregationPropertyValues[attributeName] = oFirstElementChild.getAttribute(attributeName);
            }
            if (oFirstElementChild.children.length) {
              //retrieve one level subObject properties
              for (let childIndex = 0; childIndex < oFirstElementChild.children.length; childIndex++) {
                const subChild = oFirstElementChild.children[childIndex];
                const subObjectKey = subChild.localName;
                const subObject = {};
                const subChildAttributeNames = subChild.getAttributeNames();
                for (const subChildAttributeName of subChildAttributeNames) {
                  subObject[subChildAttributeName] = subChild.getAttribute(subChildAttributeName);
                }
                aggregationPropertyValues[subObjectKey] = subObject;
              }
            }
            propertyValues[sAggregationName] = aggregationPropertyValues;
          } else if (oMetadata.properties[sAggregationName].type === "array") {
            if (oFirstElementChild !== null && oFirstElementChild.children.length > 0) {
              const children = oFirstElementChild.children;
              const oOutObjects = [];
              for (let childIdx = 0; childIdx < children.length; childIdx++) {
                const childDefinition = children[childIdx];
                // non keyed child, just add it to the aggregation
                const myChild = {};
                const attributeNames = childDefinition.getAttributeNames();
                for (const attributeName of attributeNames) {
                  myChild[attributeName] = childDefinition.getAttribute(attributeName);
                }
                oOutObjects.push(myChild);
              }
              propertyValues[sAggregationName] = oOutObjects;
            }
          }
        }
        oFirstElementChild = oNextChild;
      }
    }
    return oAggregations;
  }
  function processSlots(oAggregations, oMetadataAggregations, oNode) {
    let processCustomData = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    if (Object.keys(oAggregations).length > 0) {
      Object.keys(oAggregations).forEach(function (sAggregationName) {
        const oAggregationElement = oAggregations[sAggregationName];
        if (oNode !== null && oNode !== undefined && oAggregationElement) {
          // slots can have :: as keys which is not a valid aggregation name therefore replacing them
          const oElementChild = oAggregationElement.firstElementChild;
          if (sAggregationName !== "customData" && sAggregationName !== "dependents") {
            const sSlotName = oMetadataAggregations[sAggregationName] !== undefined && oMetadataAggregations[sAggregationName].slot || sAggregationName;
            const oTargetElement = oNode.querySelector(`slot[name='${sSlotName}']`);
            if (oTargetElement !== null) {
              const oNewChild = prepareAggregationElement(oNode, sAggregationName, oElementChild);
              oTargetElement.replaceWith(...oNewChild.children); // Somehow TS doesn't like this but the documentation says is should work
            }
          } else if (processCustomData && oElementChild !== null) {
            const oNewChild = prepareAggregationElement(oNode, sAggregationName, oElementChild);
            oNode.appendChild(oNewChild);
          }
        }
      });
    }
  }
  function prepareAggregationElement(oNode, sAggregationName, oElementChild) {
    const oNewChild = document.createElementNS(oNode.namespaceURI, sAggregationName.replace(/:/gi, "_"));
    while (oElementChild) {
      const oNextChild = oElementChild.nextElementSibling;
      oNewChild.appendChild(oElementChild);
      oElementChild = oNextChild;
    }
    return oNewChild;
  }
  async function processBuildingBlock(buildingBlockDefinition, oNode, oVisitor) {
    let isPublic = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    const sFragmentName = buildingBlockDefinition.fragment || `${buildingBlockDefinition.namespace}.${buildingBlockDefinition.xmlTag || buildingBlockDefinition.name}`;
    const sName = "this";
    const mContexts = {};
    const oMetadataContexts = {};
    const oSettings = oVisitor.getSettings();
    // TODO 0001 Move this elsewhere this is weird :)
    if (oSettings.models["sap.fe.i18n"]) {
      oSettings.models["sap.fe.i18n"].getResourceBundle().then(function (oResourceBundle) {
        ResourceModel.setApplicationI18nBundle(oResourceBundle);
      }).catch(function (error) {
        Log.error(error);
      });
    }
    const oMetadata = prepareMetadata(buildingBlockDefinition.metadata, buildingBlockDefinition.isOpen, buildingBlockDefinition.apiVersion);

    //Inject storage for macros
    if (!oSettings[sFragmentName]) {
      oSettings[sFragmentName] = {};
    }

    // First of all we need to visit the attributes to resolve the properties and the metadata contexts
    let propertyValues = await processProperties(oMetadata, oNode, isPublic, oVisitor, buildingBlockDefinition.apiVersion);
    const {
      mMissingContext,
      propertyValues: extraPropertyValues
    } = processContexts(oMetadata, oSettings, oNode, isPublic, oVisitor, mContexts, oMetadataContexts);
    propertyValues = Object.assign(propertyValues, extraPropertyValues);
    const initialKeys = Object.keys(propertyValues);
    try {
      // Aggregation and complex type support
      const oAggregations = await processChildren(oNode, oVisitor, oMetadata, isPublic, propertyValues, buildingBlockDefinition.apiVersion);
      let oInstance;
      let oControlConfig = {};
      if (oSettings.models.viewData) {
        // Only used in the Field macro and even then maybe not really useful
        oControlConfig = oSettings.models.viewData.getProperty("/controlConfiguration");
      }
      let processedPropertyValues = propertyValues;
      if (isV1MacroDef(buildingBlockDefinition) && buildingBlockDefinition.create) {
        processedPropertyValues = buildingBlockDefinition.create.call(buildingBlockDefinition, propertyValues, oControlConfig, oSettings, oAggregations, isPublic);
        Object.keys(oMetadata.metadataContexts).forEach(function (sMetadataName) {
          if (oMetadata.metadataContexts[sMetadataName].computed === true) {
            mContexts[sMetadataName] = processedPropertyValues[sMetadataName];
          }
        });
        Object.keys(mMissingContext).forEach(function (sContextName) {
          if (processedPropertyValues.hasOwnProperty(sContextName)) {
            mContexts[sContextName] = processedPropertyValues[sContextName];
          }
        });
      } else if (buildingBlockDefinition.apiVersion === 2) {
        Object.keys(propertyValues).forEach(propName => {
          var _buildingBlockDefinit, _oData, _oData$isA;
          let oData = propertyValues[propName];
          //check for additional processing function to validate / overwrite parameters
          const originalDefinition = buildingBlockDefinition === null || buildingBlockDefinition === void 0 ? void 0 : (_buildingBlockDefinit = buildingBlockDefinition.metadata) === null || _buildingBlockDefinit === void 0 ? void 0 : _buildingBlockDefinit.properties[propName];
          if (originalDefinition !== null && originalDefinition !== void 0 && originalDefinition.validate) {
            oData = originalDefinition.validate(oData) || oData;
          }
          if ((_oData = oData) !== null && _oData !== void 0 && (_oData$isA = _oData.isA) !== null && _oData$isA !== void 0 && _oData$isA.call(_oData, SAP_UI_MODEL_CONTEXT) && !oData.getModel().isA("sap.ui.model.odata.v4.ODataMetaModel")) {
            propertyValues[propName] = oData.getObject();
          }
        });
        const BuildingBlockClass = buildingBlockDefinition;
        propertyValues.isPublic = isPublic;
        oInstance = new BuildingBlockClass({
          ...propertyValues,
          ...oAggregations
        }, oControlConfig, oSettings
        /*, oControlConfig, oSettings, oAggregations, isPublic*/);

        processedPropertyValues = oInstance.getProperties();
        Object.keys(oMetadata.metadataContexts).forEach(function (sContextName) {
          if (processedPropertyValues.hasOwnProperty(sContextName)) {
            const targetObject = processedPropertyValues[sContextName];
            if (typeof targetObject === "object" && !isContext(targetObject)) {
              const sAttributeValue = storeValue(targetObject);
              oSettings.models.converterContext.setProperty(sAttributeValue, targetObject);
              const newContext = oSettings.models.converterContext.createBindingContext(sAttributeValue);
              delete myStore[sAttributeValue];
              mContexts[sContextName] = newContext;
            } else if (!mContexts.hasOwnProperty(sContextName) && targetObject !== undefined) {
              mContexts[sContextName] = targetObject;
            }
          }
        });
      }
      const oAttributesModel = new AttributeModel(oNode, processedPropertyValues, buildingBlockDefinition);
      mContexts[sName] = oAttributesModel.createBindingContext("/");
      let oPreviousMacroInfo;

      // Keep track
      if (TraceInfo.isTraceInfoActive()) {
        const oTraceInfo = TraceInfo.traceMacroCalls(sFragmentName, oMetadata, mContexts, oNode, oVisitor);
        if (oTraceInfo !== null && oTraceInfo !== void 0 && oTraceInfo.macroInfo) {
          oPreviousMacroInfo = oSettings["_macroInfo"];
          oSettings["_macroInfo"] = oTraceInfo.macroInfo;
        }
      }
      validateMacroSignature(sFragmentName, oMetadata, mContexts, oNode);
      const oContextVisitor = oVisitor.with(mContexts, buildingBlockDefinition.isOpen !== undefined ? !buildingBlockDefinition.isOpen : true);
      const oParent = oNode.parentNode;
      let iChildIndex;
      let oPromise;
      let processCustomData = true;
      if (oParent) {
        iChildIndex = Array.from(oParent.children).indexOf(oNode);
        if (isV1MacroDef(buildingBlockDefinition) && buildingBlockDefinition.getTemplate || buildingBlockDefinition.apiVersion === 2 && !buildingBlockDefinition.fragment) {
          let templateString;
          let addDefaultNamespace = false;
          if (buildingBlockDefinition.apiVersion === 2 && oInstance !== undefined) {
            templateString = await oInstance.getTemplate(oNode);
            if (buildingBlockDefinition.isRuntime === true) {
              // For runtime building blocks, we need to attach all objects to the converterContext directly, as the actual rendering takes place at runtime
              for (const myStoreKey in myStore) {
                const oData = myStore[myStoreKey];
                oSettings.models.converterContext.setProperty(myStoreKey, oData);
                delete myStore[myStoreKey];
              }
            }
            addDefaultNamespace = true;
          } else if (buildingBlockDefinition.getTemplate) {
            templateString = await buildingBlockDefinition.getTemplate(processedPropertyValues);
          }
          let hasError = "";
          if (templateString) {
            let hasParseError = false;
            let parsedTemplate = parseXMLString(templateString, addDefaultNamespace);
            // For safety purpose we try to detect trailing text in between XML Tags
            for (const element of parsedTemplate) {
              const iter = document.createNodeIterator(element, NodeFilter.SHOW_TEXT);
              let textnode = iter.nextNode();
              if (element.localName === "parsererror") {
                hasParseError = true;
              }
              while (textnode) {
                if (textnode.textContent && textnode.textContent.trim().length > 0) {
                  hasError = textnode.textContent;
                }
                textnode = iter.nextNode();
              }
            }
            if (hasParseError) {
              // If there is a parseerror while processing the XML it means the XML itself is malformed, as such we rerun the template process
              // Setting isTraceMode true will make it so that each xml` expression is checked for validity from XML perspective
              // If an error is found it's returned instead of the normal fragment
              Log.error(`Error while processing building block ${buildingBlockDefinition.xmlTag || buildingBlockDefinition.name}`);
              try {
                var _oInstance;
                isTraceMode = true;
                const initialTemplate = (_oInstance = oInstance) !== null && _oInstance !== void 0 && _oInstance.getTemplate ? await oInstance.getTemplate(oNode) : await buildingBlockDefinition.getTemplate(processedPropertyValues);
                parsedTemplate = parseXMLString(initialTemplate, true);
              } finally {
                isTraceMode = false;
              }
            } else if (hasError.length > 0) {
              // If there is trailing text we create a standard error and display it.
              Log.error(`Error while processing building block ${buildingBlockDefinition.xmlTag || buildingBlockDefinition.name}`);
              const oErrorText = createErrorXML([`Error while processing building block ${buildingBlockDefinition.xmlTag || buildingBlockDefinition.name}`, `Trailing text was found in the XML: ${hasError}`], parsedTemplate.map(template => template.outerHTML).join("\n"));
              parsedTemplate = parseXMLString(oErrorText, true);
            }
            oNode.replaceWith(...parsedTemplate);
            oNode = oParent.children[iChildIndex];
            processSlots(oAggregations, oMetadata.aggregations, oNode, processCustomData);
            processCustomData = false;
            oPromise = oContextVisitor.visitNode(oNode);
          } else {
            oNode.remove();
            oPromise = Promise.resolve();
          }
        } else {
          oPromise = oContextVisitor.insertFragment(sFragmentName, oNode);
        }
        await oPromise;
        const oMacroElement = oParent.children[iChildIndex];
        processSlots(oAggregations, oMetadata.aggregations, oMacroElement, processCustomData);
        if (oMacroElement !== undefined) {
          const oRemainingSlots = oMacroElement.querySelectorAll("slot");
          oRemainingSlots.forEach(function (oSlotElement) {
            oSlotElement.remove();
          });
        }
      }
      if (oPreviousMacroInfo) {
        //restore macro info if available
        oSettings["_macroInfo"] = oPreviousMacroInfo;
      } else {
        delete oSettings["_macroInfo"];
      }
    } catch (e) {
      // In case there is a generic error (usually code error), we retrieve the current context information and create a dedicated error message
      const traceDetails = {
        initialProperties: {},
        resolvedProperties: {},
        missingContexts: mMissingContext
      };
      for (const propertyName of initialKeys) {
        const propertyValue = propertyValues[propertyName];
        if (isContext(propertyValue)) {
          traceDetails.initialProperties[propertyName] = {
            path: propertyValue.getPath(),
            value: propertyValue.getObject()
          };
        } else {
          traceDetails.initialProperties[propertyName] = propertyValue;
        }
      }
      for (const propertyName in propertyValues) {
        const propertyValue = propertyValues[propertyName];
        if (!initialKeys.includes(propertyName)) {
          if (isContext(propertyValue)) {
            traceDetails.resolvedProperties[propertyName] = {
              path: propertyValue.getPath(),
              value: propertyValue.getObject()
            };
          } else {
            traceDetails.resolvedProperties[propertyName] = propertyValue;
          }
        }
      }
      Log.error(e);
      const oError = createErrorXML([`Error while processing building block ${buildingBlockDefinition.name}`], oNode.outerHTML, traceDetails, e.stack);
      const oTemplate = parseXMLString(oError, true);
      oNode.replaceWith(...oTemplate);
    }
  }
  function addSingleContext(mContexts, oVisitor, oCtx, oMetadataContexts) {
    const sKey = oCtx.name || oCtx.model || undefined;
    if (oMetadataContexts[sKey]) {
      return; // do not add twice
    }

    try {
      let sContextPath = oCtx.path;
      if (oCtx.model !== null) {
        sContextPath = `${oCtx.model}>${sContextPath}`;
      }
      const mSetting = oVisitor.getSettings();
      if (oCtx.model === "converterContext" && oCtx.path.length > 0) {
        mContexts[sKey] = mSetting.models[oCtx.model].getContext(oCtx.path /*, mSetting.bindingContexts[oCtx.model]*/); // add the context to the visitor
      } else if (!mSetting.bindingContexts[oCtx.model] && mSetting.models[oCtx.model]) {
        mContexts[sKey] = mSetting.models[oCtx.model].getContext(oCtx.path); // add the context to the visitor
      } else {
        mContexts[sKey] = oVisitor.getContext(sContextPath); // add the context to the visitor
      }

      oMetadataContexts[sKey] = mContexts[sKey]; // make it available inside metadataContexts JSON object
    } catch (ex) {
      //console.error(ex);
      // ignore the context as this can only be the case if the model is not ready, i.e. not a preprocessing model but maybe a model for
      // providing afterwards
      // TODO 0002 not yet implemented
      //mContexts["_$error"].oModel.setProperty("/" + sKey, ex);
    }
  }

  /**
   * Register a building block definition to be used inside the xml template processor.
   *
   * @param buildingBlockDefinition The building block definition
   */
  function registerBuildingBlock(buildingBlockDefinition) {
    XMLPreprocessor.plugIn(async (oNode, oVisitor) => processBuildingBlock(buildingBlockDefinition, oNode, oVisitor), buildingBlockDefinition.namespace, buildingBlockDefinition.xmlTag || buildingBlockDefinition.name);
    if (buildingBlockDefinition.publicNamespace) {
      XMLPreprocessor.plugIn(async (oNode, oVisitor) => processBuildingBlock(buildingBlockDefinition, oNode, oVisitor, true), buildingBlockDefinition.publicNamespace, buildingBlockDefinition.xmlTag || buildingBlockDefinition.name);
    }
  }
  _exports.registerBuildingBlock = registerBuildingBlock;
  function createErrorXML(errorMessages, xmlFragment, additionalData, stack) {
    const errorLabels = errorMessages.map(errorMessage => xml`<m:Label text="${escapeXMLAttributeValue(errorMessage)}"/>`);
    let errorStack = "";
    if (stack) {
      const stackFormatted = btoa(`<pre>${stack}</pre>`);
      errorStack = xml`<m:FormattedText htmlText="${`{= BBF.base64Decode('${stackFormatted}') }`}" />`;
    }
    let additionalText = "";
    if (additionalData) {
      additionalText = xml`<m:VBox>
						<m:Label text="Trace Info"/>
						<code:CodeEditor type="json"  value="${`{= BBF.base64Decode('${btoa(JSON.stringify(additionalData, null, 4))}') }`}" height="300px" />
					</m:VBox>`;
    }
    return xml`<m:VBox xmlns:m="sap.m" xmlns:code="sap.ui.codeeditor" core:require="{BBF:'sap/fe/core/buildingBlocks/BuildingBlockFormatter'}">
				${errorLabels}
				${errorStack}
				<grid:CSSGrid gridTemplateRows="fr" gridTemplateColumns="repeat(2,1fr)" gridGap="1rem" xmlns:grid="sap.ui.layout.cssgrid" >
					<m:VBox>
						<m:Label text="How the building block was called"/>
						<code:CodeEditor type="xml" value="${`{= BBF.base64Decode('${btoa(xmlFragment.replaceAll("&gt;", ">"))}') }`}" height="300px" />
					</m:VBox>
					${additionalText}
				</grid:CSSGrid>
			</m:VBox>`;
  }
  const myStore = {};
  function storeValue(values) {
    const propertyUID = `/uid--${uid()}`;
    myStore[propertyUID] = values;
    return propertyUID;
  }

  /**
   * Parse an XML string and return the associated document.
   *
   * @param xmlString The xml string
   * @param [addDefaultNamespaces] Whether or not default namespaces should be added
   * @returns The XML document.
   */
  function parseXMLString(xmlString) {
    var _output2, _output3;
    let addDefaultNamespaces = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    if (addDefaultNamespaces) {
      xmlString = `<template
						xmlns:template="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1"
						xmlns:m="sap.m"
						xmlns:macros="sap.fe.macros"
						xmlns:core="sap.ui.core"
						xmlns:mdc="sap.ui.mdc"
						xmlns:customData="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1">${xmlString}</template>`;
    }
    const xmlDocument = DOMParserInstance.parseFromString(xmlString, "text/xml");
    let output = xmlDocument.firstElementChild;
    while (((_output = output) === null || _output === void 0 ? void 0 : _output.localName) === "template") {
      var _output;
      output = output.firstElementChild;
    }
    const children = (_output2 = output) !== null && _output2 !== void 0 && _output2.parentElement ? (_output3 = output) === null || _output3 === void 0 ? void 0 : _output3.parentElement.children : [output];
    return Array.from(children);
  }

  /**
   * Escape an XML attribute value.
   *
   * @param value The attribute value to escape.
   * @returns The escaped string.
   */
  _exports.parseXMLString = parseXMLString;
  function escapeXMLAttributeValue(value) {
    return value === null || value === void 0 ? void 0 : value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
  }
  _exports.escapeXMLAttributeValue = escapeXMLAttributeValue;
  function renderInTraceMode(outStr) {
    var _xmlResult$;
    const xmlResult = parseXMLString(outStr, true);
    if ((xmlResult === null || xmlResult === void 0 ? void 0 : xmlResult.length) > 0 && ((_xmlResult$ = xmlResult[0]) === null || _xmlResult$ === void 0 ? void 0 : _xmlResult$.localName) === "parsererror") {
      const errorMessage = xmlResult[0].innerText || xmlResult[0].innerHTML;
      return createErrorXML([errorMessage.split("\n")[0]], outStr);
    } else {
      return outStr;
    }
  }
  /**
   * Create a string representation of the template literal while handling special object case.
   *
   * @param strings The string parts of the template literal
   * @param values The values part of the template literal
   * @returns The XML string document representing the string that was used.
   */
  const xml = function (strings) {
    let outStr = "";
    let i;
    for (var _len = arguments.length, values = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      values[_key - 1] = arguments[_key];
    }
    for (i = 0; i < values.length; i++) {
      outStr += strings[i];

      // Handle the different case of object, if it's an array we join them, if it's a binding expression then we compile it.
      const value = values[i];
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === "string") {
        outStr += value.flat(5).join("\n").trim();
      } else if (isFunctionArray(value)) {
        outStr += value.map(valuefn => valuefn()).join("\n");
      } else if (isBindingToolkitExpression(value)) {
        const compiledExpression = compileExpression(value);
        outStr += escapeXMLAttributeValue(compiledExpression);
      } else if (typeof value === "undefined") {
        outStr += "{this>undefinedValue}";
      } else if (typeof value === "function") {
        outStr += value();
      } else if (typeof value === "object" && value !== null) {
        if (isContext(value)) {
          outStr += value.getPath();
        } else {
          const propertyUId = storeValue(value);
          outStr += `${propertyUId}`;
        }
      } else if (value && typeof value === "string" && !value.startsWith("<") && !value.startsWith("&lt;")) {
        outStr += escapeXMLAttributeValue(value);
      } else {
        outStr += value;
      }
    }
    outStr += strings[i];
    outStr = outStr.trim();
    if (isTraceMode) {
      return renderInTraceMode(outStr);
    }
    return outStr;
  };
  _exports.xml = xml;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJMT0dHRVJfU0NPUEUiLCJYTUxURU1QTEFUSU5HX05TIiwiRE9NUGFyc2VySW5zdGFuY2UiLCJET01QYXJzZXIiLCJpc1RyYWNlTW9kZSIsImlzVjFNYWNyb0RlZiIsImJ1aWxkaW5nQmxvY2tEZWZpbml0aW9uIiwiYXBpVmVyc2lvbiIsInVuZGVmaW5lZCIsInZhbGlkYXRlTWFjcm9NZXRhZGF0YUNvbnRleHQiLCJzTmFtZSIsIm1Db250ZXh0cyIsIm9Db250ZXh0U2V0dGluZ3MiLCJzS2V5Iiwib0NvbnRleHQiLCJvQ29udGV4dE9iamVjdCIsImdldE9iamVjdCIsInJlcXVpcmVkIiwiRXJyb3IiLCJoYXNPd25Qcm9wZXJ0eSIsIiRraW5kIiwiaW5kZXhPZiIsImdldFBhdGgiLCIkVHlwZSIsInZhbGlkYXRlTWFjcm9TaWduYXR1cmUiLCJvTWV0YWRhdGEiLCJvTm9kZSIsImFNZXRhZGF0YUNvbnRleHRLZXlzIiwibWV0YWRhdGFDb250ZXh0cyIsIk9iamVjdCIsImtleXMiLCJhUHJvcGVydGllcyIsInByb3BlcnRpZXMiLCJvQXR0cmlidXRlTmFtZXMiLCJhdHRyaWJ1dGVOYW1lcyIsImdldEF0dHJpYnV0ZU5hbWVzIiwiYXR0cmlidXRlTmFtZSIsImZvckVhY2giLCJvUHJvcGVydHlTZXR0aW5ncyIsImhhc0F0dHJpYnV0ZSIsInN0YXJ0c1dpdGgiLCJMb2ciLCJ3YXJuaW5nIiwiU0FQX1VJX0NPUkVfRUxFTUVOVCIsIlNBUF9VSV9NT0RFTF9DT05URVhUIiwicHJlcGFyZU1ldGFkYXRhIiwiYnVpbGRpbmdCbG9ja01ldGFkYXRhIiwiaXNPcGVuIiwib1Byb3BlcnRpZXMiLCJvQWdncmVnYXRpb25zIiwiZGVwZW5kZW50cyIsInR5cGUiLCJjdXN0b21EYXRhIiwic2xvdCIsIm9NZXRhZGF0YUNvbnRleHRzIiwiZm91bmREZWZhdWx0QWdncmVnYXRpb24iLCJzUHJvcGVydHlOYW1lIiwiZXZlbnRzIiwic0V2ZW50TmFtZSIsImFnZ3JlZ2F0aW9ucyIsImlzRGVmYXVsdCIsImRlZmF1bHRBZ2dyZWdhdGlvbiIsIl9jaGVja0Fic29sdXRlQW5kQ29udGV4dFBhdGhzIiwib1NldHRpbmdzIiwic0F0dHJpYnV0ZVZhbHVlIiwic01ldGFQYXRoIiwic0NvbnRleHRQYXRoIiwiY3VycmVudENvbnRleHRQYXRoIiwiZW5kc1dpdGgiLCJtb2RlbCIsInBhdGgiLCJfY3JlYXRlSW5pdGlhbE1ldGFkYXRhQ29udGV4dCIsInNBdHRyaWJ1dGVOYW1lIiwicmV0dXJuQ29udGV4dCIsIm9EYXRhIiwibXlTdG9yZSIsIm1vZGVscyIsImNvbnZlcnRlckNvbnRleHQiLCJzZXRQcm9wZXJ0eSIsImJpbmRpbmdDb250ZXh0cyIsImVudGl0eVNldCIsIl9nZXRNZXRhZGF0YUNvbnRleHQiLCJvVmlzaXRvciIsImJEb05vdFJlc29sdmUiLCJvTWV0YWRhdGFDb250ZXh0IiwiZ2V0QXR0cmlidXRlIiwiQmluZGluZ1BhcnNlciIsImNvbXBsZXhQYXJzZXIiLCJnZXRDb250ZXh0IiwiZSIsInByb2Nlc3NQcm9wZXJ0aWVzIiwiaXNQdWJsaWMiLCJvRGVmaW5pdGlvblByb3BlcnRpZXMiLCJhRGVmaW5pdGlvblByb3BlcnRpZXNLZXlzIiwicHJvcGVydHlWYWx1ZXMiLCJzS2V5VmFsdWUiLCJkZWVwQ2xvbmUiLCJkZWZhdWx0VmFsdWUiLCJlcnJvciIsInZpc2l0QXR0cmlidXRlIiwiYXR0cmlidXRlcyIsImdldE5hbWVkSXRlbSIsInZhbHVlIiwiTnVtYmVyIiwicHJvY2Vzc0NvbnRleHRzIiwiY29udGV4dFBhdGgiLCJtTWlzc2luZ0NvbnRleHQiLCJvRGVmaW5pdGlvbkNvbnRleHRzIiwiYURlZmluaXRpb25Db250ZXh0c0tleXMiLCJjb250ZXh0UGF0aEluZGV4IiwiY29udGV4dFBhdGhEZWZpbml0aW9uIiwic3BsaWNlIiwibmFtZSIsImFkZFNpbmdsZUNvbnRleHQiLCJwYXJzZUFnZ3JlZ2F0aW9uIiwib0FnZ3JlZ2F0aW9uIiwicHJvY2Vzc0FnZ3JlZ2F0aW9ucyIsIm9PdXRPYmplY3RzIiwiY2hpbGRyZW4iLCJsZW5ndGgiLCJjaGlsZElkeCIsImNoaWxkRGVmaW5pdGlvbiIsImNoaWxkS2V5Iiwic2V0QXR0cmlidXRlIiwiYWdncmVnYXRpb25PYmplY3QiLCJrZXkiLCJwb3NpdGlvbiIsInBsYWNlbWVudCIsIlBsYWNlbWVudCIsIkFmdGVyIiwiYW5jaG9yIiwicHJvY2Vzc0NoaWxkcmVuIiwiZmlyc3RFbGVtZW50Q2hpbGQiLCJvRmlyc3RFbGVtZW50Q2hpbGQiLCJuYW1lc3BhY2VVUkkiLCJvUGFyZW50IiwicGFyZW50Tm9kZSIsImlDaGlsZEluZGV4IiwiQXJyYXkiLCJmcm9tIiwidmlzaXROb2RlIiwibmV4dEVsZW1lbnRTaWJsaW5nIiwic0NoaWxkTmFtZSIsImxvY2FsTmFtZSIsInNBZ2dyZWdhdGlvbk5hbWUiLCJ0b1VwcGVyQ2FzZSIsImFnZ3JlZ2F0aW9uRGVmaW5pdGlvbiIsInBhcnNlZEFnZ3JlZ2F0aW9uIiwicGFyc2VkQWdncmVnYXRpb25LZXkiLCJ2aXNpdENoaWxkTm9kZXMiLCJvTmV4dENoaWxkIiwibmV4dENoaWxkIiwiaGFzVmlydHVhbE5vZGUiLCJjaGlsZFdyYXBwZXIiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnROUyIsImFwcGVuZENoaWxkIiwicmVtb3ZlQXR0cmlidXRlIiwib05ld0NoaWxkIiwiYWdncmVnYXRpb25Qcm9wZXJ0eVZhbHVlcyIsImNoaWxkSW5kZXgiLCJzdWJDaGlsZCIsInN1Yk9iamVjdEtleSIsInN1Yk9iamVjdCIsInN1YkNoaWxkQXR0cmlidXRlTmFtZXMiLCJzdWJDaGlsZEF0dHJpYnV0ZU5hbWUiLCJteUNoaWxkIiwicHVzaCIsInByb2Nlc3NTbG90cyIsIm9NZXRhZGF0YUFnZ3JlZ2F0aW9ucyIsInByb2Nlc3NDdXN0b21EYXRhIiwib0FnZ3JlZ2F0aW9uRWxlbWVudCIsIm9FbGVtZW50Q2hpbGQiLCJzU2xvdE5hbWUiLCJvVGFyZ2V0RWxlbWVudCIsInF1ZXJ5U2VsZWN0b3IiLCJwcmVwYXJlQWdncmVnYXRpb25FbGVtZW50IiwicmVwbGFjZVdpdGgiLCJyZXBsYWNlIiwicHJvY2Vzc0J1aWxkaW5nQmxvY2siLCJzRnJhZ21lbnROYW1lIiwiZnJhZ21lbnQiLCJuYW1lc3BhY2UiLCJ4bWxUYWciLCJnZXRTZXR0aW5ncyIsImdldFJlc291cmNlQnVuZGxlIiwidGhlbiIsIm9SZXNvdXJjZUJ1bmRsZSIsIlJlc291cmNlTW9kZWwiLCJzZXRBcHBsaWNhdGlvbkkxOG5CdW5kbGUiLCJjYXRjaCIsIm1ldGFkYXRhIiwiZXh0cmFQcm9wZXJ0eVZhbHVlcyIsImFzc2lnbiIsImluaXRpYWxLZXlzIiwib0luc3RhbmNlIiwib0NvbnRyb2xDb25maWciLCJ2aWV3RGF0YSIsImdldFByb3BlcnR5IiwicHJvY2Vzc2VkUHJvcGVydHlWYWx1ZXMiLCJjcmVhdGUiLCJjYWxsIiwic01ldGFkYXRhTmFtZSIsImNvbXB1dGVkIiwic0NvbnRleHROYW1lIiwicHJvcE5hbWUiLCJvcmlnaW5hbERlZmluaXRpb24iLCJ2YWxpZGF0ZSIsImlzQSIsImdldE1vZGVsIiwiQnVpbGRpbmdCbG9ja0NsYXNzIiwiZ2V0UHJvcGVydGllcyIsInRhcmdldE9iamVjdCIsImlzQ29udGV4dCIsInN0b3JlVmFsdWUiLCJuZXdDb250ZXh0IiwiY3JlYXRlQmluZGluZ0NvbnRleHQiLCJvQXR0cmlidXRlc01vZGVsIiwiQXR0cmlidXRlTW9kZWwiLCJvUHJldmlvdXNNYWNyb0luZm8iLCJUcmFjZUluZm8iLCJpc1RyYWNlSW5mb0FjdGl2ZSIsIm9UcmFjZUluZm8iLCJ0cmFjZU1hY3JvQ2FsbHMiLCJtYWNyb0luZm8iLCJvQ29udGV4dFZpc2l0b3IiLCJ3aXRoIiwib1Byb21pc2UiLCJnZXRUZW1wbGF0ZSIsInRlbXBsYXRlU3RyaW5nIiwiYWRkRGVmYXVsdE5hbWVzcGFjZSIsImlzUnVudGltZSIsIm15U3RvcmVLZXkiLCJoYXNFcnJvciIsImhhc1BhcnNlRXJyb3IiLCJwYXJzZWRUZW1wbGF0ZSIsInBhcnNlWE1MU3RyaW5nIiwiZWxlbWVudCIsIml0ZXIiLCJjcmVhdGVOb2RlSXRlcmF0b3IiLCJOb2RlRmlsdGVyIiwiU0hPV19URVhUIiwidGV4dG5vZGUiLCJuZXh0Tm9kZSIsInRleHRDb250ZW50IiwidHJpbSIsImluaXRpYWxUZW1wbGF0ZSIsIm9FcnJvclRleHQiLCJjcmVhdGVFcnJvclhNTCIsIm1hcCIsInRlbXBsYXRlIiwib3V0ZXJIVE1MIiwiam9pbiIsInJlbW92ZSIsIlByb21pc2UiLCJyZXNvbHZlIiwiaW5zZXJ0RnJhZ21lbnQiLCJvTWFjcm9FbGVtZW50Iiwib1JlbWFpbmluZ1Nsb3RzIiwicXVlcnlTZWxlY3RvckFsbCIsIm9TbG90RWxlbWVudCIsInRyYWNlRGV0YWlscyIsImluaXRpYWxQcm9wZXJ0aWVzIiwicmVzb2x2ZWRQcm9wZXJ0aWVzIiwibWlzc2luZ0NvbnRleHRzIiwicHJvcGVydHlOYW1lIiwicHJvcGVydHlWYWx1ZSIsImluY2x1ZGVzIiwib0Vycm9yIiwic3RhY2siLCJvVGVtcGxhdGUiLCJvQ3R4IiwibVNldHRpbmciLCJleCIsInJlZ2lzdGVyQnVpbGRpbmdCbG9jayIsIlhNTFByZXByb2Nlc3NvciIsInBsdWdJbiIsInB1YmxpY05hbWVzcGFjZSIsImVycm9yTWVzc2FnZXMiLCJ4bWxGcmFnbWVudCIsImFkZGl0aW9uYWxEYXRhIiwiZXJyb3JMYWJlbHMiLCJlcnJvck1lc3NhZ2UiLCJ4bWwiLCJlc2NhcGVYTUxBdHRyaWJ1dGVWYWx1ZSIsImVycm9yU3RhY2siLCJzdGFja0Zvcm1hdHRlZCIsImJ0b2EiLCJhZGRpdGlvbmFsVGV4dCIsIkpTT04iLCJzdHJpbmdpZnkiLCJyZXBsYWNlQWxsIiwidmFsdWVzIiwicHJvcGVydHlVSUQiLCJ1aWQiLCJ4bWxTdHJpbmciLCJhZGREZWZhdWx0TmFtZXNwYWNlcyIsInhtbERvY3VtZW50IiwicGFyc2VGcm9tU3RyaW5nIiwib3V0cHV0IiwicGFyZW50RWxlbWVudCIsInJlbmRlckluVHJhY2VNb2RlIiwib3V0U3RyIiwieG1sUmVzdWx0IiwiaW5uZXJUZXh0IiwiaW5uZXJIVE1MIiwic3BsaXQiLCJzdHJpbmdzIiwiaSIsImlzQXJyYXkiLCJmbGF0IiwiaXNGdW5jdGlvbkFycmF5IiwidmFsdWVmbiIsImlzQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIiwiY29tcGlsZWRFeHByZXNzaW9uIiwiY29tcGlsZUV4cHJlc3Npb24iLCJwcm9wZXJ0eVVJZCJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiQnVpbGRpbmdCbG9ja1J1bnRpbWUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgUmVzb3VyY2VCdW5kbGUgZnJvbSBcInNhcC9iYXNlL2kxOG4vUmVzb3VyY2VCdW5kbGVcIjtcbmltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IGRlZXBDbG9uZSBmcm9tIFwic2FwL2Jhc2UvdXRpbC9kZWVwQ2xvbmVcIjtcbmltcG9ydCB1aWQgZnJvbSBcInNhcC9iYXNlL3V0aWwvdWlkXCI7XG5pbXBvcnQgdHlwZSBBcHBDb21wb25lbnQgZnJvbSBcInNhcC9mZS9jb3JlL0FwcENvbXBvbmVudFwiO1xuaW1wb3J0IEF0dHJpYnV0ZU1vZGVsIGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9BdHRyaWJ1dGVNb2RlbFwiO1xuaW1wb3J0IHR5cGUge1xuXHRCdWlsZGluZ0Jsb2NrQWdncmVnYXRpb25EZWZpbml0aW9uLFxuXHRCdWlsZGluZ0Jsb2NrQmFzZSxcblx0QnVpbGRpbmdCbG9ja0RlZmluaXRpb24sXG5cdEJ1aWxkaW5nQmxvY2tEZWZpbml0aW9uVjEsXG5cdEJ1aWxkaW5nQmxvY2tNZXRhZGF0YSxcblx0QnVpbGRpbmdCbG9ja01ldGFkYXRhQ29udGV4dERlZmluaXRpb24sXG5cdEJ1aWxkaW5nQmxvY2tQcm9wZXJ0eURlZmluaXRpb24sXG5cdE9iamVjdFZhbHVlLFxuXHRPYmplY3RWYWx1ZTJcbn0gZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tcIjtcbmltcG9ydCB0eXBlIHsgUG9zaXRpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL0NvbmZpZ3VyYWJsZU9iamVjdFwiO1xuaW1wb3J0IHsgUGxhY2VtZW50IH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvaGVscGVycy9Db25maWd1cmFibGVPYmplY3RcIjtcbmltcG9ydCB0eXBlIHsgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCB7IGNvbXBpbGVFeHByZXNzaW9uLCBpc0JpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQgeyBpc0NvbnRleHQsIGlzRnVuY3Rpb25BcnJheSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1R5cGVHdWFyZHNcIjtcbmltcG9ydCBSZXNvdXJjZU1vZGVsIGZyb20gXCJzYXAvZmUvbWFjcm9zL1Jlc291cmNlTW9kZWxcIjtcbmltcG9ydCBCaW5kaW5nUGFyc2VyIGZyb20gXCJzYXAvdWkvYmFzZS9CaW5kaW5nUGFyc2VyXCI7XG5pbXBvcnQgdHlwZSBDb250cm9sIGZyb20gXCJzYXAvdWkvY29yZS9Db250cm9sXCI7XG5pbXBvcnQgWE1MUHJlcHJvY2Vzc29yIGZyb20gXCJzYXAvdWkvY29yZS91dGlsL1hNTFByZXByb2Nlc3NvclwiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL0NvbnRleHRcIjtcbmltcG9ydCB0eXBlIEpTT05Nb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL2pzb24vSlNPTk1vZGVsXCI7XG5pbXBvcnQgdHlwZSBNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL01vZGVsXCI7XG5pbXBvcnQgdHlwZSBPRGF0YU1ldGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTWV0YU1vZGVsXCI7XG5pbXBvcnQgdHlwZSBfUmVzb3VyY2VNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL3Jlc291cmNlL1Jlc291cmNlTW9kZWxcIjtcbmltcG9ydCB0eXBlIHsgTWFjcm9JbmZvLCBUcmFjZU1ldGFkYXRhQ29udGV4dCB9IGZyb20gXCIuL1RyYWNlSW5mb1wiO1xuaW1wb3J0IFRyYWNlSW5mbyBmcm9tIFwiLi9UcmFjZUluZm9cIjtcblxuY29uc3QgTE9HR0VSX1NDT1BFID0gXCJzYXAuZmUuY29yZS5idWlsZGluZ0Jsb2Nrcy5CdWlsZGluZ0Jsb2NrUnVudGltZVwiO1xuY29uc3QgWE1MVEVNUExBVElOR19OUyA9IFwiaHR0cDovL3NjaGVtYXMuc2FwLmNvbS9zYXB1aTUvZXh0ZW5zaW9uL3NhcC51aS5jb3JlLnRlbXBsYXRlLzFcIjtcbmNvbnN0IERPTVBhcnNlckluc3RhbmNlID0gbmV3IERPTVBhcnNlcigpO1xubGV0IGlzVHJhY2VNb2RlID0gZmFsc2U7XG5cbmV4cG9ydCB0eXBlIFJlc29sdmVkQnVpbGRpbmdCbG9ja01ldGFkYXRhID0ge1xuXHRwcm9wZXJ0aWVzOiBSZWNvcmQ8c3RyaW5nLCBCdWlsZGluZ0Jsb2NrUHJvcGVydHlEZWZpbml0aW9uPjtcblx0YWdncmVnYXRpb25zOiBSZWNvcmQ8c3RyaW5nLCBCdWlsZGluZ0Jsb2NrQWdncmVnYXRpb25EZWZpbml0aW9uPjtcblx0bWV0YWRhdGFDb250ZXh0czogUmVjb3JkPHN0cmluZywgQnVpbGRpbmdCbG9ja01ldGFkYXRhQ29udGV4dERlZmluaXRpb24+O1xuXHRpc09wZW46IGJvb2xlYW47XG5cdGRlZmF1bHRBZ2dyZWdhdGlvbj86IHN0cmluZztcbn07XG5cbi8qKlxuICogRGVmaW5pdGlvbiBvZiBhIG1ldGEgZGF0YSBjb250ZXh0XG4gKi9cbnR5cGUgTWV0YURhdGFDb250ZXh0ID0ge1xuXHRuYW1lPzogc3RyaW5nO1xuXHRtb2RlbDogc3RyaW5nO1xuXHRwYXRoOiBzdHJpbmc7XG59O1xuXG5leHBvcnQgdHlwZSBUZW1wbGF0ZVByb2Nlc3NvclNldHRpbmdzID0ge1xuXHRjdXJyZW50Q29udGV4dFBhdGg6IENvbnRleHQ7XG5cdGlzUHVibGljOiBib29sZWFuO1xuXHRhcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudDtcblx0bW9kZWxzOiBSZWNvcmQ8c3RyaW5nLCBNb2RlbD4gJiB7XG5cdFx0Y29udmVydGVyQ29udGV4dDogSlNPTk1vZGVsO1xuXHRcdHZpZXdEYXRhOiBKU09OTW9kZWw7XG5cdFx0bWV0YU1vZGVsOiBPRGF0YU1ldGFNb2RlbDtcblx0XHRcInNhcC5mZS5pMThuXCI/OiBfUmVzb3VyY2VNb2RlbDtcblx0fTtcblx0YmluZGluZ0NvbnRleHRzOiBSZWNvcmQ8c3RyaW5nLCBDb250ZXh0Pjtcblx0X21hY3JvSW5mbz86IE1hY3JvSW5mbztcblx0W2s6IHN0cmluZ106IHVua25vd247XG59O1xuXG5leHBvcnQgdHlwZSBJVmlzaXRvckNhbGxiYWNrID0ge1xuXHRnZXRTZXR0aW5ncygpOiBUZW1wbGF0ZVByb2Nlc3NvclNldHRpbmdzO1xuXHQvKipcblx0ICogVmlzaXRzIHRoZSBnaXZlbiBub2RlIGFuZCBlaXRoZXIgcHJvY2Vzc2VzIGEgdGVtcGxhdGUgaW5zdHJ1Y3Rpb24sIGNhbGxzXG5cdCAqIGEgdmlzaXRvciwgb3Igc2ltcGx5IGNhbGxzIGJvdGgge0BsaW5rXG5cdCAqIHNhcC51aS5jb3JlLnV0aWwuWE1MUHJlcHJvY2Vzc29yLklDYWxsYmFjay52aXNpdEF0dHJpYnV0ZXMgdmlzaXRBdHRyaWJ1dGVzfVxuXHQgKiBhbmQge0BsaW5rIHNhcC51aS5jb3JlLnV0aWwuWE1MUHJlcHJvY2Vzc29yLklDYWxsYmFjay52aXNpdENoaWxkTm9kZXNcblx0ICogdmlzaXRDaGlsZE5vZGVzfS5cblx0ICpcblx0ICogQHBhcmFtIHtOb2RlfSBvTm9kZVxuXHQgKiAgIFRoZSBYTUwgRE9NIG5vZGVcblx0ICogQHJldHVybnMge3NhcC51aS5iYXNlLlN5bmNQcm9taXNlfVxuXHQgKiAgIEEgdGhlbmFibGUgd2hpY2ggcmVzb2x2ZXMgd2l0aCA8Y29kZT51bmRlZmluZWQ8L2NvZGU+IGFzIHNvb24gYXMgdmlzaXRpbmdcblx0ICogICBpcyBkb25lLCBvciBpcyByZWplY3RlZCB3aXRoIGEgY29ycmVzcG9uZGluZyBlcnJvciBpZiB2aXNpdGluZyBmYWlsc1xuXHQgKi9cblx0dmlzaXROb2RlKG9Ob2RlOiBOb2RlKTogUHJvbWlzZTx2b2lkPjtcblxuXHQvKipcblx0ICogSW5zZXJ0cyB0aGUgZnJhZ21lbnQgd2l0aCB0aGUgZ2l2ZW4gbmFtZSBpbiBwbGFjZSBvZiB0aGUgZ2l2ZW4gZWxlbWVudC4gTG9hZHMgdGhlXG5cdCAqIGZyYWdtZW50LCB0YWtlcyBjYXJlIG9mIGNhY2hpbmcgKGZvciB0aGUgY3VycmVudCBwcmUtcHJvY2Vzc29yIHJ1bikgYW5kIHZpc2l0cyB0aGVcblx0ICogZnJhZ21lbnQncyBjb250ZW50IG9uY2UgaXQgaGFzIGJlZW4gaW1wb3J0ZWQgaW50byB0aGUgZWxlbWVudCdzIG93bmVyIGRvY3VtZW50IGFuZFxuXHQgKiBwdXQgaW50byBwbGFjZS4gTG9hZGluZyBvZiBmcmFnbWVudHMgaXMgYXN5bmNocm9ub3VzIGlmIHRoZSB0ZW1wbGF0ZSB2aWV3IGlzXG5cdCAqIGFzeW5jaHJvbm91cy5cblx0ICpcblx0ICogQHBhcmFtIHtzdHJpbmd9IHNGcmFnbWVudE5hbWVcblx0ICogICB0aGUgZnJhZ21lbnQncyByZXNvbHZlZCBuYW1lXG5cdCAqIEBwYXJhbSB7RWxlbWVudH0gb0VsZW1lbnRcblx0ICogICB0aGUgWE1MIERPTSBlbGVtZW50LCBlLmcuIDxzYXAudWkuY29yZTpGcmFnbWVudD4gb3IgPGNvcmU6RXh0ZW5zaW9uUG9pbnQ+XG5cdCAqIEBwYXJhbSB7c2FwLnVpLmNvcmUudXRpbC5fd2l0aH0gb1dpdGhDb250cm9sXG5cdCAqICAgdGhlIHBhcmVudCdzIFwid2l0aFwiIGNvbnRyb2xcblx0ICogQHJldHVybnMge3NhcC51aS5iYXNlLlN5bmNQcm9taXNlfVxuXHQgKiBBIHN5bmMgcHJvbWlzZSB3aGljaCByZXNvbHZlcyB3aXRoIDxjb2RlPnVuZGVmaW5lZDwvY29kZT4gYXMgc29vbiBhcyB0aGUgZnJhZ21lbnRcblx0ICogICBoYXMgYmVlbiBpbnNlcnRlZCwgb3IgaXMgcmVqZWN0ZWQgd2l0aCBhIGNvcnJlc3BvbmRpbmcgZXJyb3IgaWYgbG9hZGluZyBvciB2aXNpdGluZ1xuXHQgKiAgIGZhaWxzLlxuXHQgKi9cblx0aW5zZXJ0RnJhZ21lbnQoc0ZyYWdtZW50OiBzdHJpbmcsIG9FbGVtZW50OiBFbGVtZW50LCBvV2l0aD86IENvbnRyb2wpOiBQcm9taXNlPHZvaWQ+O1xuXHR2aXNpdEF0dHJpYnV0ZShvTm9kZTogRWxlbWVudCwgb0F0dHJpYnV0ZTogQXR0cik6IFByb21pc2U8dm9pZD47XG5cdHZpc2l0QXR0cmlidXRlcyhvTm9kZTogRWxlbWVudCk6IFByb21pc2U8dm9pZD47XG5cdGdldFZpZXdJbmZvKCk6IFByb21pc2U8dW5rbm93bj47XG5cdHZpc2l0Q2hpbGROb2RlcyhvTm9kZTogTm9kZSk6IFByb21pc2U8dm9pZD47XG5cdC8qKlxuXHQgKiBJbnRlcnByZXRzIHRoZSBnaXZlbiBYTUwgRE9NIGF0dHJpYnV0ZSB2YWx1ZSBhcyBhIGJpbmRpbmcgYW5kIHJldHVybnMgdGhlXG5cdCAqIHJlc3VsdGluZyB2YWx1ZS5cblx0ICpcblx0ICogQHBhcmFtIHtzdHJpbmd9IHNWYWx1ZVxuXHQgKiAgIEFuIFhNTCBET00gYXR0cmlidXRlIHZhbHVlXG5cdCAqIEBwYXJhbSB7RWxlbWVudH0gW29FbGVtZW50XVxuXHQgKiAgIFRoZSBYTUwgRE9NIGVsZW1lbnQgdGhlIGF0dHJpYnV0ZSB2YWx1ZSBiZWxvbmdzIHRvIChuZWVkZWQgb25seSBmb3Jcblx0ICogICB3YXJuaW5ncyB3aGljaCBhcmUgbG9nZ2VkIHRvIHRoZSBjb25zb2xlKVxuXHQgKiBAcmV0dXJucyB7c2FwLnVpLmJhc2UuU3luY1Byb21pc2V8bnVsbH1cblx0ICogICBBIHRoZW5hYmxlIHdoaWNoIHJlc29sdmVzIHdpdGggdGhlIHJlc3VsdGluZyB2YWx1ZSwgb3IgaXMgcmVqZWN0ZWQgd2l0aCBhXG5cdCAqICAgY29ycmVzcG9uZGluZyBlcnJvciAoZm9yIGV4YW1wbGUsIGFuIGVycm9yIHRocm93biBieSBhIGZvcm1hdHRlcikgb3Jcblx0ICogICA8Y29kZT5udWxsPC9jb2RlPiBpbiBjYXNlIHRoZSBiaW5kaW5nIGlzIG5vdCByZWFkeSAoYmVjYXVzZSBpdCByZWZlcnMgdG8gYVxuXHQgKiAgIG1vZGVsIHdoaWNoIGlzIG5vdCBhdmFpbGFibGUpIChzaW5jZSAxLjU3LjApXG5cdCAqL1xuXHRnZXRSZXN1bHQoc1ZhbHVlOiBzdHJpbmcsIGVsZW1lbnQ/OiBFbGVtZW50KTogUHJvbWlzZTxDb250ZXh0PiB8IG51bGw7XG5cdGdldENvbnRleHQoc1BhdGg/OiBzdHJpbmcpOiBDb250ZXh0IHwgdW5kZWZpbmVkO1xuXHQvKipcblx0ICogUmV0dXJucyBhIGNhbGxiYWNrIGludGVyZmFjZSBpbnN0YW5jZSBmb3IgdGhlIGdpdmVuIG1hcCBvZiB2YXJpYWJsZXMgd2hpY2hcblx0ICogb3ZlcnJpZGUgY3VycmVudGx5IGtub3duIHZhcmlhYmxlcyBvZiB0aGUgc2FtZSBuYW1lIGluIDxjb2RlPnRoaXM8L2NvZGU+XG5cdCAqIHBhcmVudCBpbnRlcmZhY2Ugb3IgcmVwbGFjZSB0aGVtIGFsdG9nZXRoZXIuIEVhY2ggdmFyaWFibGUgbmFtZSBiZWNvbWVzIGFcblx0ICogbmFtZWQgbW9kZWwgd2l0aCBhIGNvcnJlc3BvbmRpbmcgb2JqZWN0IGJpbmRpbmcgYW5kIGNhbiBiZSB1c2VkIGluc2lkZSB0aGVcblx0ICogWE1MIHRlbXBsYXRlIGluIHRoZSB1c3VhbCB3YXksIHRoYXQgaXMsIHdpdGggYSBiaW5kaW5nIGV4cHJlc3Npb24gbGlrZVxuXHQgKiA8Y29kZT5cInt2YXI+c29tZS9yZWxhdGl2ZS9wYXRofVwiPC9jb2RlPiAoc2VlIGV4YW1wbGUpLlxuXHQgKlxuXHQgKiBAcGFyYW0ge29iamVjdH0gW21WYXJpYWJsZXM9e31dXG5cdCAqICAgTWFwIGZyb20gdmFyaWFibGUgbmFtZSAoc3RyaW5nKSB0byB2YWx1ZSAoe0BsaW5rIHNhcC51aS5tb2RlbC5Db250ZXh0fSlcblx0ICogQHBhcmFtIHtib29sZWFufSBbYlJlcGxhY2VdXG5cdCAqICAgV2hldGhlciBvbmx5IHRoZSBnaXZlbiB2YXJpYWJsZXMgYXJlIGtub3duIGluIHRoZSBuZXcgY2FsbGJhY2sgaW50ZXJmYWNlXG5cdCAqICAgaW5zdGFuY2UsIG5vIGluaGVyaXRlZCBvbmVzXG5cdCAqIEByZXR1cm5zIHtzYXAudWkuY29yZS51dGlsLlhNTFByZXByb2Nlc3Nvci5JQ2FsbGJhY2t9XG5cdCAqICAgQSBjYWxsYmFjayBpbnRlcmZhY2UgaW5zdGFuY2Vcblx0ICogQHBhcmFtIG1WYXJpYWJsZXNcblx0ICogQHBhcmFtIGJSZXBsYWNlXG5cdCAqL1xuXHRcIndpdGhcIihtVmFyaWFibGVzPzogUmVjb3JkPHN0cmluZywgQ29udGV4dD4sIGJSZXBsYWNlPzogYm9vbGVhbik6IElWaXNpdG9yQ2FsbGJhY2s7XG59O1xuXG4vKipcbiAqIFR5cGVndWFyZCBmb3IgY2hlY2tpbmcgaWYgYSBidWlsZGluZyBibG9jayB1c2VzIEFQSSAxLlxuICpcbiAqIEBwYXJhbSBidWlsZGluZ0Jsb2NrRGVmaW5pdGlvblxuICogQHJldHVybnMgYHRydWVgIGlmIHRoZSBidWlsZGluZyBibG9jayBpcyB1c2luZyBBUEkgMS5cbiAqL1xuZnVuY3Rpb24gaXNWMU1hY3JvRGVmKGJ1aWxkaW5nQmxvY2tEZWZpbml0aW9uOiBCdWlsZGluZ0Jsb2NrRGVmaW5pdGlvbik6IGJ1aWxkaW5nQmxvY2tEZWZpbml0aW9uIGlzIEJ1aWxkaW5nQmxvY2tEZWZpbml0aW9uVjEge1xuXHRyZXR1cm4gYnVpbGRpbmdCbG9ja0RlZmluaXRpb24uYXBpVmVyc2lvbiA9PT0gdW5kZWZpbmVkIHx8IGJ1aWxkaW5nQmxvY2tEZWZpbml0aW9uLmFwaVZlcnNpb24gPT09IDE7XG59XG5cbmZ1bmN0aW9uIHZhbGlkYXRlTWFjcm9NZXRhZGF0YUNvbnRleHQoXG5cdHNOYW1lOiBzdHJpbmcsXG5cdG1Db250ZXh0czogUmVjb3JkPHN0cmluZywgQ29udGV4dD4sXG5cdG9Db250ZXh0U2V0dGluZ3M6IEJ1aWxkaW5nQmxvY2tNZXRhZGF0YUNvbnRleHREZWZpbml0aW9uLFxuXHRzS2V5OiBzdHJpbmdcbikge1xuXHRjb25zdCBvQ29udGV4dCA9IG1Db250ZXh0c1tzS2V5XTtcblx0Y29uc3Qgb0NvbnRleHRPYmplY3QgPSBvQ29udGV4dD8uZ2V0T2JqZWN0KCkgYXMge1xuXHRcdCRUeXBlPzogc3RyaW5nO1xuXHRcdCRraW5kPzogc3RyaW5nO1xuXHR9O1xuXG5cdGlmIChvQ29udGV4dFNldHRpbmdzLnJlcXVpcmVkID09PSB0cnVlICYmICghb0NvbnRleHQgfHwgb0NvbnRleHRPYmplY3QgPT09IG51bGwpKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKGAke3NOYW1lfTogUmVxdWlyZWQgbWV0YWRhdGFDb250ZXh0ICcke3NLZXl9JyBpcyBtaXNzaW5nYCk7XG5cdH0gZWxzZSBpZiAob0NvbnRleHRPYmplY3QpIHtcblx0XHQvLyBJZiBjb250ZXh0IG9iamVjdCBoYXMgJGtpbmQgcHJvcGVydHksICRUeXBlIHNob3VsZCBub3QgYmUgY2hlY2tlZFxuXHRcdC8vIFRoZXJlZm9yZSByZW1vdmUgZnJvbSBjb250ZXh0IHNldHRpbmdzXG5cdFx0aWYgKG9Db250ZXh0T2JqZWN0Lmhhc093blByb3BlcnR5KFwiJGtpbmRcIikgJiYgb0NvbnRleHRPYmplY3QuJGtpbmQgIT09IHVuZGVmaW5lZCAmJiBvQ29udGV4dFNldHRpbmdzLiRraW5kICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdC8vIENoZWNrIGlmIHRoZSAka2luZCBpcyBwYXJ0IG9mIHRoZSBhbGxvd2VkIG9uZXNcblx0XHRcdGlmIChvQ29udGV4dFNldHRpbmdzLiRraW5kLmluZGV4T2Yob0NvbnRleHRPYmplY3QuJGtpbmQpID09PSAtMSkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXG5cdFx0XHRcdFx0YCR7c05hbWV9OiAnJHtzS2V5fScgbXVzdCBiZSAnJGtpbmQnICcke29Db250ZXh0U2V0dGluZ3NbXCIka2luZFwiXX0nIGJ1dCBpcyAnJHtcblx0XHRcdFx0XHRcdG9Db250ZXh0T2JqZWN0LiRraW5kXG5cdFx0XHRcdFx0fSc6ICR7b0NvbnRleHQuZ2V0UGF0aCgpfWBcblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKG9Db250ZXh0T2JqZWN0Lmhhc093blByb3BlcnR5KFwiJFR5cGVcIikgJiYgb0NvbnRleHRPYmplY3QuJFR5cGUgIT09IHVuZGVmaW5lZCAmJiBvQ29udGV4dFNldHRpbmdzLiRUeXBlKSB7XG5cdFx0XHQvLyBDaGVjayBvbmx5ICRUeXBlXG5cdFx0XHRpZiAob0NvbnRleHRTZXR0aW5ncy4kVHlwZS5pbmRleE9mKG9Db250ZXh0T2JqZWN0LiRUeXBlKSA9PT0gLTEpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFxuXHRcdFx0XHRcdGAke3NOYW1lfTogJyR7c0tleX0nIG11c3QgYmUgJyRUeXBlJyAnJHtvQ29udGV4dFNldHRpbmdzW1wiJFR5cGVcIl19JyBidXQgaXMgJyR7XG5cdFx0XHRcdFx0XHRvQ29udGV4dE9iamVjdC4kVHlwZVxuXHRcdFx0XHRcdH0nOiAke29Db250ZXh0LmdldFBhdGgoKX1gXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59XG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVNYWNyb1NpZ25hdHVyZShcblx0c05hbWU6IHN0cmluZyxcblx0b01ldGFkYXRhOiBSZXNvbHZlZEJ1aWxkaW5nQmxvY2tNZXRhZGF0YSxcblx0bUNvbnRleHRzOiBSZWNvcmQ8c3RyaW5nLCBDb250ZXh0Pixcblx0b05vZGU6IEVsZW1lbnRcbikge1xuXHRjb25zdCBhTWV0YWRhdGFDb250ZXh0S2V5cyA9IChvTWV0YWRhdGEubWV0YWRhdGFDb250ZXh0cyAmJiBPYmplY3Qua2V5cyhvTWV0YWRhdGEubWV0YWRhdGFDb250ZXh0cykpIHx8IFtdLFxuXHRcdGFQcm9wZXJ0aWVzID0gKG9NZXRhZGF0YS5wcm9wZXJ0aWVzICYmIE9iamVjdC5rZXlzKG9NZXRhZGF0YS5wcm9wZXJ0aWVzKSkgfHwgW10sXG5cdFx0b0F0dHJpYnV0ZU5hbWVzOiBSZWNvcmQ8c3RyaW5nLCBib29sZWFuPiA9IHt9O1xuXG5cdC8vIGNvbGxlY3QgYWxsIGF0dHJpYnV0ZXMgdG8gZmluZCB1bmNoZWNrZWQgcHJvcGVydGllc1xuXHRjb25zdCBhdHRyaWJ1dGVOYW1lcyA9IG9Ob2RlLmdldEF0dHJpYnV0ZU5hbWVzKCk7XG5cdGZvciAoY29uc3QgYXR0cmlidXRlTmFtZSBvZiBhdHRyaWJ1dGVOYW1lcykge1xuXHRcdG9BdHRyaWJ1dGVOYW1lc1thdHRyaWJ1dGVOYW1lXSA9IHRydWU7XG5cdH1cblxuXHQvL0NoZWNrIG1ldGFkYXRhQ29udGV4dHNcblx0YU1ldGFkYXRhQ29udGV4dEtleXMuZm9yRWFjaChmdW5jdGlvbiAoc0tleSkge1xuXHRcdGNvbnN0IG9Db250ZXh0U2V0dGluZ3MgPSBvTWV0YWRhdGEubWV0YWRhdGFDb250ZXh0c1tzS2V5XTtcblxuXHRcdHZhbGlkYXRlTWFjcm9NZXRhZGF0YUNvbnRleHQoc05hbWUsIG1Db250ZXh0cywgb0NvbnRleHRTZXR0aW5ncywgc0tleSk7XG5cdFx0ZGVsZXRlIG9BdHRyaWJ1dGVOYW1lc1tzS2V5XTtcblx0fSk7XG5cdC8vQ2hlY2sgcHJvcGVydGllc1xuXHRhUHJvcGVydGllcy5mb3JFYWNoKGZ1bmN0aW9uIChzS2V5KSB7XG5cdFx0Y29uc3Qgb1Byb3BlcnR5U2V0dGluZ3MgPSBvTWV0YWRhdGEucHJvcGVydGllc1tzS2V5XTtcblx0XHRpZiAoIW9Ob2RlLmhhc0F0dHJpYnV0ZShzS2V5KSkge1xuXHRcdFx0aWYgKG9Qcm9wZXJ0eVNldHRpbmdzLnJlcXVpcmVkICYmICFvUHJvcGVydHlTZXR0aW5ncy5oYXNPd25Qcm9wZXJ0eShcImRlZmF1bHRWYWx1ZVwiKSkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYCR7c05hbWV9OiBgICsgYFJlcXVpcmVkIHByb3BlcnR5ICcke3NLZXl9JyBpcyBtaXNzaW5nYCk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGRlbGV0ZSBvQXR0cmlidXRlTmFtZXNbc0tleV07XG5cdFx0fVxuXHR9KTtcblxuXHQvLyBVbmNoZWNrZWQgcHJvcGVydGllc1xuXHRPYmplY3Qua2V5cyhvQXR0cmlidXRlTmFtZXMpLmZvckVhY2goZnVuY3Rpb24gKHNLZXk6IHN0cmluZykge1xuXHRcdC8vIG5vIGNoZWNrIGZvciBwcm9wZXJ0aWVzIHdoaWNoIGNvbnRhaW4gYSBjb2xvbiBcIjpcIiAoZGlmZmVyZW50IG5hbWVzcGFjZSksIGUuZy4geG1sbnM6dHJhY2UsIHRyYWNlOm1hY3JvSUQsIHVuaXR0ZXN0OmlkXG5cdFx0aWYgKHNLZXkuaW5kZXhPZihcIjpcIikgPCAwICYmICFzS2V5LnN0YXJ0c1dpdGgoXCJ4bWxuc1wiKSkge1xuXHRcdFx0TG9nLndhcm5pbmcoYFVuY2hlY2tlZCBwYXJhbWV0ZXI6ICR7c05hbWV9OiAke3NLZXl9YCwgdW5kZWZpbmVkLCBMT0dHRVJfU0NPUEUpO1xuXHRcdH1cblx0fSk7XG59XG5cbmNvbnN0IFNBUF9VSV9DT1JFX0VMRU1FTlQgPSBcInNhcC51aS5jb3JlLkVsZW1lbnRcIjtcblxuZXhwb3J0IGNvbnN0IFNBUF9VSV9NT0RFTF9DT05URVhUID0gXCJzYXAudWkubW9kZWwuQ29udGV4dFwiO1xuXG4vKipcbiAqIEVuc3VyZXMgdGhhdCB0aGUgbWV0YWRhdGEgZm9yIHRoZSBidWlsZGluZyBibG9jayBhcmUgcHJvcGVybHkgZGVmaW5lZC5cbiAqXG4gKiBAcGFyYW0gYnVpbGRpbmdCbG9ja01ldGFkYXRhIFRoZSBtZXRhZGF0YSByZWNlaXZlZCBmcm9tIHRoZSBpbnB1dFxuICogQHBhcmFtIGlzT3BlbiBXaGV0aGVyIHRoZSBidWlsZGluZyBibG9jayBpcyBvcGVuIG9yIG5vdFxuICogQHBhcmFtIGFwaVZlcnNpb25cbiAqIEByZXR1cm5zIEEgc2V0IG9mIGNvbXBsZXRlZCBtZXRhZGF0YSBmb3IgZnVydGhlciBwcm9jZXNzaW5nXG4gKi9cbmZ1bmN0aW9uIHByZXBhcmVNZXRhZGF0YShcblx0YnVpbGRpbmdCbG9ja01ldGFkYXRhPzogQnVpbGRpbmdCbG9ja01ldGFkYXRhLFxuXHRpc09wZW4gPSBmYWxzZSxcblx0YXBpVmVyc2lvbj86IG51bWJlclxuKTogUmVzb2x2ZWRCdWlsZGluZ0Jsb2NrTWV0YWRhdGEge1xuXHRpZiAoYnVpbGRpbmdCbG9ja01ldGFkYXRhKSB7XG5cdFx0Y29uc3Qgb1Byb3BlcnRpZXM6IFJlY29yZDxzdHJpbmcsIEJ1aWxkaW5nQmxvY2tQcm9wZXJ0eURlZmluaXRpb24+ID0ge307XG5cdFx0Y29uc3Qgb0FnZ3JlZ2F0aW9uczogUmVjb3JkPHN0cmluZywgQnVpbGRpbmdCbG9ja0FnZ3JlZ2F0aW9uRGVmaW5pdGlvbj4gPSB7XG5cdFx0XHRkZXBlbmRlbnRzOiB7XG5cdFx0XHRcdHR5cGU6IFNBUF9VSV9DT1JFX0VMRU1FTlRcblx0XHRcdH0sXG5cdFx0XHRjdXN0b21EYXRhOiB7XG5cdFx0XHRcdHR5cGU6IFNBUF9VSV9DT1JFX0VMRU1FTlRcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0aWYgKGFwaVZlcnNpb24gPT09IDIpIHtcblx0XHRcdG9BZ2dyZWdhdGlvbnMuZGVwZW5kZW50cy5zbG90ID0gXCJkZXBlbmRlbnRzXCI7XG5cdFx0XHRvQWdncmVnYXRpb25zLmN1c3RvbURhdGEuc2xvdCA9IFwiY3VzdG9tRGF0YVwiO1xuXHRcdH1cblxuXHRcdGNvbnN0IG9NZXRhZGF0YUNvbnRleHRzOiBSZWNvcmQ8c3RyaW5nLCBCdWlsZGluZ0Jsb2NrUHJvcGVydHlEZWZpbml0aW9uPiA9IHt9O1xuXHRcdGxldCBmb3VuZERlZmF1bHRBZ2dyZWdhdGlvbjtcblx0XHRPYmplY3Qua2V5cyhidWlsZGluZ0Jsb2NrTWV0YWRhdGEucHJvcGVydGllcykuZm9yRWFjaChmdW5jdGlvbiAoc1Byb3BlcnR5TmFtZTogc3RyaW5nKSB7XG5cdFx0XHRpZiAoYnVpbGRpbmdCbG9ja01ldGFkYXRhLnByb3BlcnRpZXNbc1Byb3BlcnR5TmFtZV0udHlwZSAhPT0gU0FQX1VJX01PREVMX0NPTlRFWFQpIHtcblx0XHRcdFx0b1Byb3BlcnRpZXNbc1Byb3BlcnR5TmFtZV0gPSBidWlsZGluZ0Jsb2NrTWV0YWRhdGEucHJvcGVydGllc1tzUHJvcGVydHlOYW1lXTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG9NZXRhZGF0YUNvbnRleHRzW3NQcm9wZXJ0eU5hbWVdID0gYnVpbGRpbmdCbG9ja01ldGFkYXRhLnByb3BlcnRpZXNbc1Byb3BlcnR5TmFtZV07XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0Ly8gTWVyZ2UgZXZlbnRzIGludG8gcHJvcGVydGllcyBhcyB0aGV5IGFyZSBoYW5kbGVkIGlkZW50aWNhbGx5XG5cdFx0aWYgKGJ1aWxkaW5nQmxvY2tNZXRhZGF0YS5ldmVudHMgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0T2JqZWN0LmtleXMoYnVpbGRpbmdCbG9ja01ldGFkYXRhLmV2ZW50cykuZm9yRWFjaChmdW5jdGlvbiAoc0V2ZW50TmFtZTogc3RyaW5nKSB7XG5cdFx0XHRcdG9Qcm9wZXJ0aWVzW3NFdmVudE5hbWVdID0geyB0eXBlOiBcImZ1bmN0aW9uXCIsIC4uLmJ1aWxkaW5nQmxvY2tNZXRhZGF0YS5ldmVudHNbc0V2ZW50TmFtZV0gfTtcblx0XHRcdH0pO1xuXHRcdH1cblx0XHRpZiAoYnVpbGRpbmdCbG9ja01ldGFkYXRhLmFnZ3JlZ2F0aW9ucyAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRPYmplY3Qua2V5cyhidWlsZGluZ0Jsb2NrTWV0YWRhdGEuYWdncmVnYXRpb25zKS5mb3JFYWNoKGZ1bmN0aW9uIChzUHJvcGVydHlOYW1lOiBzdHJpbmcpIHtcblx0XHRcdFx0b0FnZ3JlZ2F0aW9uc1tzUHJvcGVydHlOYW1lXSA9IGJ1aWxkaW5nQmxvY2tNZXRhZGF0YS5hZ2dyZWdhdGlvbnNbc1Byb3BlcnR5TmFtZV07XG5cdFx0XHRcdGlmIChvQWdncmVnYXRpb25zW3NQcm9wZXJ0eU5hbWVdLmlzRGVmYXVsdCkge1xuXHRcdFx0XHRcdGZvdW5kRGVmYXVsdEFnZ3JlZ2F0aW9uID0gc1Byb3BlcnR5TmFtZTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdHJldHVybiB7XG5cdFx0XHRwcm9wZXJ0aWVzOiBvUHJvcGVydGllcyxcblx0XHRcdGFnZ3JlZ2F0aW9uczogb0FnZ3JlZ2F0aW9ucyxcblx0XHRcdGRlZmF1bHRBZ2dyZWdhdGlvbjogZm91bmREZWZhdWx0QWdncmVnYXRpb24sXG5cdFx0XHRtZXRhZGF0YUNvbnRleHRzOiBvTWV0YWRhdGFDb250ZXh0cyxcblx0XHRcdGlzT3BlbjogaXNPcGVuXG5cdFx0fTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0bWV0YWRhdGFDb250ZXh0czoge30sXG5cdFx0XHRhZ2dyZWdhdGlvbnM6IHtcblx0XHRcdFx0ZGVwZW5kZW50czoge1xuXHRcdFx0XHRcdHR5cGU6IFNBUF9VSV9DT1JFX0VMRU1FTlRcblx0XHRcdFx0fSxcblx0XHRcdFx0Y3VzdG9tRGF0YToge1xuXHRcdFx0XHRcdHR5cGU6IFNBUF9VSV9DT1JFX0VMRU1FTlRcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdHByb3BlcnRpZXM6IHt9LFxuXHRcdFx0aXNPcGVuOiBpc09wZW5cblx0XHR9O1xuXHR9XG59XG5cbi8qKlxuICogQ2hlY2tzIHRoZSBhYnNvbHV0ZSBvciBjb250ZXh0IHBhdGhzIGFuZCByZXR1cm5zIGFuIGFwcHJvcHJpYXRlIE1ldGFDb250ZXh0LlxuICpcbiAqIEBwYXJhbSBvU2V0dGluZ3MgQWRkaXRpb25hbCBzZXR0aW5nc1xuICogQHBhcmFtIHNBdHRyaWJ1dGVWYWx1ZSBUaGUgYXR0cmlidXRlIHZhbHVlXG4gKiBAcmV0dXJucyBUaGUgbWV0YSBkYXRhIGNvbnRleHQgb2JqZWN0XG4gKi9cbmZ1bmN0aW9uIF9jaGVja0Fic29sdXRlQW5kQ29udGV4dFBhdGhzKG9TZXR0aW5nczogVGVtcGxhdGVQcm9jZXNzb3JTZXR0aW5ncywgc0F0dHJpYnV0ZVZhbHVlOiBzdHJpbmcpOiBNZXRhRGF0YUNvbnRleHQge1xuXHRsZXQgc01ldGFQYXRoOiBzdHJpbmc7XG5cdGlmIChzQXR0cmlidXRlVmFsdWUgJiYgc0F0dHJpYnV0ZVZhbHVlLnN0YXJ0c1dpdGgoXCIvXCIpKSB7XG5cdFx0Ly8gYWJzb2x1dGUgcGF0aCAtIHdlIGp1c3QgdXNlIHRoaXMgb25lXG5cdFx0c01ldGFQYXRoID0gc0F0dHJpYnV0ZVZhbHVlO1xuXHR9IGVsc2Uge1xuXHRcdGxldCBzQ29udGV4dFBhdGggPSBvU2V0dGluZ3MuY3VycmVudENvbnRleHRQYXRoLmdldFBhdGgoKTtcblx0XHRpZiAoIXNDb250ZXh0UGF0aC5lbmRzV2l0aChcIi9cIikpIHtcblx0XHRcdHNDb250ZXh0UGF0aCArPSBcIi9cIjtcblx0XHR9XG5cdFx0c01ldGFQYXRoID0gc0NvbnRleHRQYXRoICsgc0F0dHJpYnV0ZVZhbHVlO1xuXHR9XG5cdHJldHVybiB7XG5cdFx0bW9kZWw6IFwibWV0YU1vZGVsXCIsXG5cdFx0cGF0aDogc01ldGFQYXRoXG5cdH07XG59XG5cbi8qKlxuICogVGhpcyBtZXRob2QgaGVscHMgdG8gY3JlYXRlIHRoZSBtZXRhZGF0YSBjb250ZXh0IGluIGNhc2UgaXQgaXMgbm90IHlldCBhdmFpbGFibGUgaW4gdGhlIHN0b3JlLlxuICpcbiAqIEBwYXJhbSBvU2V0dGluZ3MgQWRkaXRpb25hbCBzZXR0aW5nc1xuICogQHBhcmFtIHNBdHRyaWJ1dGVOYW1lIFRoZSBhdHRyaWJ1dGUgbmFtZVxuICogQHBhcmFtIHNBdHRyaWJ1dGVWYWx1ZSBUaGUgYXR0cmlidXRlIHZhbHVlXG4gKiBAcmV0dXJucyBUaGUgbWV0YSBkYXRhIGNvbnRleHQgb2JqZWN0XG4gKi9cbmZ1bmN0aW9uIF9jcmVhdGVJbml0aWFsTWV0YWRhdGFDb250ZXh0KFxuXHRvU2V0dGluZ3M6IFRlbXBsYXRlUHJvY2Vzc29yU2V0dGluZ3MsXG5cdHNBdHRyaWJ1dGVOYW1lOiBzdHJpbmcsXG5cdHNBdHRyaWJ1dGVWYWx1ZTogc3RyaW5nXG4pOiBNZXRhRGF0YUNvbnRleHQge1xuXHRsZXQgcmV0dXJuQ29udGV4dDogTWV0YURhdGFDb250ZXh0O1xuXHRpZiAoc0F0dHJpYnV0ZVZhbHVlLnN0YXJ0c1dpdGgoXCIvdWlkLS1cIikpIHtcblx0XHRjb25zdCBvRGF0YSA9IG15U3RvcmVbc0F0dHJpYnV0ZVZhbHVlXTtcblx0XHRvU2V0dGluZ3MubW9kZWxzLmNvbnZlcnRlckNvbnRleHQuc2V0UHJvcGVydHkoc0F0dHJpYnV0ZVZhbHVlLCBvRGF0YSk7XG5cdFx0cmV0dXJuQ29udGV4dCA9IHtcblx0XHRcdG1vZGVsOiBcImNvbnZlcnRlckNvbnRleHRcIixcblx0XHRcdHBhdGg6IHNBdHRyaWJ1dGVWYWx1ZVxuXHRcdH07XG5cdFx0ZGVsZXRlIG15U3RvcmVbc0F0dHJpYnV0ZVZhbHVlXTtcblx0fSBlbHNlIGlmICgoc0F0dHJpYnV0ZU5hbWUgPT09IFwibWV0YVBhdGhcIiAmJiBvU2V0dGluZ3MuY3VycmVudENvbnRleHRQYXRoKSB8fCBzQXR0cmlidXRlTmFtZSA9PT0gXCJjb250ZXh0UGF0aFwiKSB7XG5cdFx0cmV0dXJuQ29udGV4dCA9IF9jaGVja0Fic29sdXRlQW5kQ29udGV4dFBhdGhzKG9TZXR0aW5ncywgc0F0dHJpYnV0ZVZhbHVlKTtcblx0fSBlbHNlIGlmIChzQXR0cmlidXRlVmFsdWUgJiYgc0F0dHJpYnV0ZVZhbHVlLnN0YXJ0c1dpdGgoXCIvXCIpKSB7XG5cdFx0Ly8gYWJzb2x1dGUgcGF0aCAtIHdlIGp1c3QgdXNlIHRoaXMgb25lXG5cdFx0cmV0dXJuQ29udGV4dCA9IHtcblx0XHRcdG1vZGVsOiBcIm1ldGFNb2RlbFwiLFxuXHRcdFx0cGF0aDogc0F0dHJpYnV0ZVZhbHVlXG5cdFx0fTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm5Db250ZXh0ID0ge1xuXHRcdFx0bW9kZWw6IFwibWV0YU1vZGVsXCIsXG5cdFx0XHRwYXRoOiBvU2V0dGluZ3MuYmluZGluZ0NvbnRleHRzLmVudGl0eVNldCA/IG9TZXR0aW5ncy5iaW5kaW5nQ29udGV4dHMuZW50aXR5U2V0LmdldFBhdGgoc0F0dHJpYnV0ZVZhbHVlKSA6IHNBdHRyaWJ1dGVWYWx1ZVxuXHRcdH07XG5cdH1cblx0cmV0dXJuIHJldHVybkNvbnRleHQ7XG59XG5cbmZ1bmN0aW9uIF9nZXRNZXRhZGF0YUNvbnRleHQoXG5cdG9TZXR0aW5nczogVGVtcGxhdGVQcm9jZXNzb3JTZXR0aW5ncyxcblx0b05vZGU6IEVsZW1lbnQsXG5cdHNBdHRyaWJ1dGVOYW1lOiBzdHJpbmcsXG5cdG9WaXNpdG9yOiBJVmlzaXRvckNhbGxiYWNrLFxuXHRiRG9Ob3RSZXNvbHZlOiBib29sZWFuLFxuXHRpc09wZW46IGJvb2xlYW5cbikge1xuXHRsZXQgb01ldGFkYXRhQ29udGV4dDogTWV0YURhdGFDb250ZXh0IHwgdW5kZWZpbmVkO1xuXHRpZiAoIWJEb05vdFJlc29sdmUgJiYgb05vZGUuaGFzQXR0cmlidXRlKHNBdHRyaWJ1dGVOYW1lKSkge1xuXHRcdGNvbnN0IHNBdHRyaWJ1dGVWYWx1ZSA9IG9Ob2RlLmdldEF0dHJpYnV0ZShzQXR0cmlidXRlTmFtZSkgYXMgc3RyaW5nO1xuXHRcdG9NZXRhZGF0YUNvbnRleHQgPSBCaW5kaW5nUGFyc2VyLmNvbXBsZXhQYXJzZXIoc0F0dHJpYnV0ZVZhbHVlKTtcblx0XHRpZiAoIW9NZXRhZGF0YUNvbnRleHQpIHtcblx0XHRcdG9NZXRhZGF0YUNvbnRleHQgPSBfY3JlYXRlSW5pdGlhbE1ldGFkYXRhQ29udGV4dChvU2V0dGluZ3MsIHNBdHRyaWJ1dGVOYW1lLCBzQXR0cmlidXRlVmFsdWUpO1xuXHRcdH1cblx0fSBlbHNlIGlmIChvU2V0dGluZ3MuYmluZGluZ0NvbnRleHRzLmhhc093blByb3BlcnR5KHNBdHRyaWJ1dGVOYW1lKSkge1xuXHRcdG9NZXRhZGF0YUNvbnRleHQgPSB7XG5cdFx0XHRtb2RlbDogc0F0dHJpYnV0ZU5hbWUsXG5cdFx0XHRwYXRoOiBcIlwiXG5cdFx0fTtcblx0fSBlbHNlIGlmIChpc09wZW4pIHtcblx0XHR0cnkge1xuXHRcdFx0aWYgKG9WaXNpdG9yLmdldENvbnRleHQoYCR7c0F0dHJpYnV0ZU5hbWV9PmApKSB7XG5cdFx0XHRcdG9NZXRhZGF0YUNvbnRleHQgPSB7XG5cdFx0XHRcdFx0bW9kZWw6IHNBdHRyaWJ1dGVOYW1lLFxuXHRcdFx0XHRcdHBhdGg6IFwiXCJcblx0XHRcdFx0fTtcblx0XHRcdH1cblx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gb01ldGFkYXRhQ29udGV4dDtcbn1cblxuLyoqXG4gKiBQYXJzZSB0aGUgaW5jb21pbmcgWE1MIG5vZGUgYW5kIHRyeSB0byByZXNvbHZlIHRoZSBwcm9wZXJ0aWVzIGRlZmluZWQgdGhlcmUuXG4gKlxuICogQHBhcmFtIG9NZXRhZGF0YSBUaGUgbWV0YWRhdGEgZm9yIHRoZSBidWlsZGluZyBibG9ja1xuICogQHBhcmFtIG9Ob2RlIFRoZSBYTUwgbm9kZSB0byBwYXJzZVxuICogQHBhcmFtIGlzUHVibGljIFdoZXRoZXIgdGhlIGJ1aWxkaW5nIGJsb2NrIGlzIHVzZWQgaW4gYSBwdWJsaWMgY29udGV4dCBvciBub3RcbiAqIEBwYXJhbSBvVmlzaXRvciBUaGUgdmlzaXRvciBpbnN0YW5jZVxuICogQHBhcmFtIGFwaVZlcnNpb24gVGhlIEFQSSB2ZXJzaW9uIG9mIHRoZSBidWlsZGluZyBibG9ja1xuICovXG5hc3luYyBmdW5jdGlvbiBwcm9jZXNzUHJvcGVydGllcyhcblx0b01ldGFkYXRhOiBSZXNvbHZlZEJ1aWxkaW5nQmxvY2tNZXRhZGF0YSxcblx0b05vZGU6IEVsZW1lbnQsXG5cdGlzUHVibGljOiBib29sZWFuLFxuXHRvVmlzaXRvcjogSVZpc2l0b3JDYWxsYmFjayxcblx0YXBpVmVyc2lvbj86IG51bWJlclxuKSB7XG5cdGNvbnN0IG9EZWZpbml0aW9uUHJvcGVydGllcyA9IG9NZXRhZGF0YS5wcm9wZXJ0aWVzO1xuXG5cdC8vIFJldHJpZXZlIHByb3BlcnRpZXMgdmFsdWVzXG5cdGNvbnN0IGFEZWZpbml0aW9uUHJvcGVydGllc0tleXMgPSBPYmplY3Qua2V5cyhvRGVmaW5pdGlvblByb3BlcnRpZXMpO1xuXG5cdGNvbnN0IHByb3BlcnR5VmFsdWVzOiBSZWNvcmQ8c3RyaW5nLCBPYmplY3RWYWx1ZT4gPSB7fTtcblx0Zm9yIChjb25zdCBzS2V5VmFsdWUgb2YgYURlZmluaXRpb25Qcm9wZXJ0aWVzS2V5cykge1xuXHRcdGlmIChvRGVmaW5pdGlvblByb3BlcnRpZXNbc0tleVZhbHVlXS50eXBlID09PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRwcm9wZXJ0eVZhbHVlc1tzS2V5VmFsdWVdID0gZGVlcENsb25lKG9EZWZpbml0aW9uUHJvcGVydGllc1tzS2V5VmFsdWVdLmRlZmF1bHRWYWx1ZSB8fCB7fSk7IC8vIFRvIGF2b2lkIHZhbHVlcyBiZWluZyByZXVzZWQgYWNyb3NzIG1hY3Jvc1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRwcm9wZXJ0eVZhbHVlc1tzS2V5VmFsdWVdID0gb0RlZmluaXRpb25Qcm9wZXJ0aWVzW3NLZXlWYWx1ZV0uZGVmYXVsdFZhbHVlIGFzIHN0cmluZyB8IGJvb2xlYW4gfCBudW1iZXI7XG5cdFx0fVxuXG5cdFx0aWYgKG9Ob2RlLmhhc0F0dHJpYnV0ZShzS2V5VmFsdWUpICYmIGlzUHVibGljICYmIG9EZWZpbml0aW9uUHJvcGVydGllc1tzS2V5VmFsdWVdLmlzUHVibGljID09PSBmYWxzZSkge1xuXHRcdFx0TG9nLmVycm9yKGBQcm9wZXJ0eSAke3NLZXlWYWx1ZX0gd2FzIGlnbm9yZWQgYXMgaXQgaXMgbm90IGludGVuZGVkIGZvciBwdWJsaWMgdXNhZ2VgKTtcblx0XHR9IGVsc2UgaWYgKG9Ob2RlLmhhc0F0dHJpYnV0ZShzS2V5VmFsdWUpKSB7XG5cdFx0XHRhd2FpdCBvVmlzaXRvci52aXNpdEF0dHJpYnV0ZShvTm9kZSwgb05vZGUuYXR0cmlidXRlcy5nZXROYW1lZEl0ZW0oc0tleVZhbHVlKSBhcyBBdHRyKTtcblx0XHRcdGxldCB2YWx1ZTogc3RyaW5nIHwgYm9vbGVhbiB8IG51bWJlciB8IG51bGwgfCB1bmRlZmluZWQgPSBvTm9kZS5nZXRBdHRyaWJ1dGUoc0tleVZhbHVlKTtcblx0XHRcdGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsKSB7XG5cdFx0XHRcdGlmIChhcGlWZXJzaW9uID09PSAyICYmIHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIiAmJiAhdmFsdWUuc3RhcnRzV2l0aChcIntcIikpIHtcblx0XHRcdFx0XHRzd2l0Y2ggKG9EZWZpbml0aW9uUHJvcGVydGllc1tzS2V5VmFsdWVdLnR5cGUpIHtcblx0XHRcdFx0XHRcdGNhc2UgXCJib29sZWFuXCI6XG5cdFx0XHRcdFx0XHRcdHZhbHVlID0gdmFsdWUgPT09IFwidHJ1ZVwiO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdGNhc2UgXCJudW1iZXJcIjpcblx0XHRcdFx0XHRcdFx0dmFsdWUgPSBOdW1iZXIodmFsdWUpO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0dmFsdWUgPSB2YWx1ZSA9PT0gbnVsbCA/IHVuZGVmaW5lZCA6IHZhbHVlO1xuXHRcdFx0XHRwcm9wZXJ0eVZhbHVlc1tzS2V5VmFsdWVdID0gdmFsdWU7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiBwcm9wZXJ0eVZhbHVlcztcbn1cblxuLyoqXG4gKiBQYXJzZSB0aGUgaW5jb21pbmcgWE1MIG5vZGUgYW5kIHRyeSB0byByZXNvbHZlIHRoZSBiaW5kaW5nIGNvbnRleHRzIGRlZmluZWQgaW5zaWRlLlxuICpcbiAqIEBwYXJhbSBvTWV0YWRhdGEgVGhlIG1ldGFkYXRhIGZvciB0aGUgYnVpbGRpbmcgYmxvY2tcbiAqIEBwYXJhbSBvU2V0dGluZ3MgVGhlIHNldHRpbmdzIG9iamVjdFxuICogQHBhcmFtIG9Ob2RlIFRoZSBYTUwgbm9kZSB0byBwYXJzZVxuICogQHBhcmFtIGlzUHVibGljIFdoZXRoZXIgdGhlIGJ1aWxkaW5nIGJsb2NrIGlzIHVzZWQgaW4gYSBwdWJsaWMgY29udGV4dCBvciBub3RcbiAqIEBwYXJhbSBvVmlzaXRvciBUaGUgdmlzaXRvciBpbnN0YW5jZVxuICogQHBhcmFtIG1Db250ZXh0cyBUaGUgY29udGV4dHMgdG8gYmUgdXNlZFxuICogQHBhcmFtIG9NZXRhZGF0YUNvbnRleHRzXHRUaGUgbWV0YWRhdGEgY29udGV4dHMgdG8gYmUgdXNlZFxuICogQHJldHVybnMgVGhlIHByb2Nlc3NlZCBhbmQgbWlzc2luZyBjb250ZXh0c1xuICovXG5mdW5jdGlvbiBwcm9jZXNzQ29udGV4dHMoXG5cdG9NZXRhZGF0YTogUmVzb2x2ZWRCdWlsZGluZ0Jsb2NrTWV0YWRhdGEsXG5cdG9TZXR0aW5nczogVGVtcGxhdGVQcm9jZXNzb3JTZXR0aW5ncyxcblx0b05vZGU6IEVsZW1lbnQsXG5cdGlzUHVibGljOiBib29sZWFuLFxuXHRvVmlzaXRvcjogSVZpc2l0b3JDYWxsYmFjayxcblx0bUNvbnRleHRzOiBSZWNvcmQ8c3RyaW5nLCBDb250ZXh0Pixcblx0b01ldGFkYXRhQ29udGV4dHM6IFJlY29yZDxzdHJpbmcsIENvbnRleHQ+XG4pIHtcblx0b1NldHRpbmdzLmN1cnJlbnRDb250ZXh0UGF0aCA9IG9TZXR0aW5ncy5iaW5kaW5nQ29udGV4dHMuY29udGV4dFBhdGg7XG5cdGNvbnN0IG1NaXNzaW5nQ29udGV4dDogUmVjb3JkPHN0cmluZywgYm9vbGVhbj4gPSB7fTtcblx0Y29uc3QgcHJvcGVydHlWYWx1ZXM6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0ge307XG5cdGNvbnN0IG9EZWZpbml0aW9uQ29udGV4dHMgPSBvTWV0YWRhdGEubWV0YWRhdGFDb250ZXh0cztcblx0Y29uc3QgYURlZmluaXRpb25Db250ZXh0c0tleXMgPSBPYmplY3Qua2V5cyhvRGVmaW5pdGlvbkNvbnRleHRzKTtcblx0Ly8gU2luY2UgdGhlIG1ldGFQYXRoIGFuZCBvdGhlciBwcm9wZXJ0eSBjYW4gYmUgcmVsYXRpdmUgdG8gdGhlIGNvbnRleHRQYXRoIHdlIG5lZWQgdG8gZXZhbHVhdGUgdGhlIGN1cnJlbnQgY29udGV4dFBhdGggZmlyc3Rcblx0Y29uc3QgY29udGV4dFBhdGhJbmRleCA9IGFEZWZpbml0aW9uQ29udGV4dHNLZXlzLmluZGV4T2YoXCJjb250ZXh0UGF0aFwiKTtcblx0aWYgKGNvbnRleHRQYXRoSW5kZXggIT09IC0xKSB7XG5cdFx0Ly8gSWYgaXQgaXMgZGVmaW5lZCB3ZSBleHRyYWN0IGl0IGFuZCByZWluc2VydCBpdCBpbiB0aGUgZmlyc3QgcG9zaXRpb24gb2YgdGhlIGFycmF5XG5cdFx0Y29uc3QgY29udGV4dFBhdGhEZWZpbml0aW9uID0gYURlZmluaXRpb25Db250ZXh0c0tleXMuc3BsaWNlKGNvbnRleHRQYXRoSW5kZXgsIDEpO1xuXHRcdGFEZWZpbml0aW9uQ29udGV4dHNLZXlzLnNwbGljZSgwLCAwLCBjb250ZXh0UGF0aERlZmluaXRpb25bMF0pO1xuXHR9XG5cdGZvciAoY29uc3Qgc0F0dHJpYnV0ZU5hbWUgb2YgYURlZmluaXRpb25Db250ZXh0c0tleXMpIHtcblx0XHRjb25zdCBiRG9Ob3RSZXNvbHZlID0gaXNQdWJsaWMgJiYgb0RlZmluaXRpb25Db250ZXh0c1tzQXR0cmlidXRlTmFtZV0uaXNQdWJsaWMgPT09IGZhbHNlICYmIG9Ob2RlLmhhc0F0dHJpYnV0ZShzQXR0cmlidXRlTmFtZSk7XG5cdFx0Y29uc3Qgb01ldGFkYXRhQ29udGV4dCA9IF9nZXRNZXRhZGF0YUNvbnRleHQob1NldHRpbmdzLCBvTm9kZSwgc0F0dHJpYnV0ZU5hbWUsIG9WaXNpdG9yLCBiRG9Ob3RSZXNvbHZlLCBvTWV0YWRhdGEuaXNPcGVuKTtcblx0XHRpZiAob01ldGFkYXRhQ29udGV4dCkge1xuXHRcdFx0b01ldGFkYXRhQ29udGV4dC5uYW1lID0gc0F0dHJpYnV0ZU5hbWU7XG5cdFx0XHRhZGRTaW5nbGVDb250ZXh0KG1Db250ZXh0cywgb1Zpc2l0b3IsIG9NZXRhZGF0YUNvbnRleHQsIG9NZXRhZGF0YUNvbnRleHRzKTtcblx0XHRcdGlmIChcblx0XHRcdFx0KHNBdHRyaWJ1dGVOYW1lID09PSBcImVudGl0eVNldFwiIHx8IHNBdHRyaWJ1dGVOYW1lID09PSBcImNvbnRleHRQYXRoXCIpICYmXG5cdFx0XHRcdCFvU2V0dGluZ3MuYmluZGluZ0NvbnRleHRzLmhhc093blByb3BlcnR5KHNBdHRyaWJ1dGVOYW1lKVxuXHRcdFx0KSB7XG5cdFx0XHRcdG9TZXR0aW5ncy5iaW5kaW5nQ29udGV4dHNbc0F0dHJpYnV0ZU5hbWVdID0gbUNvbnRleHRzW3NBdHRyaWJ1dGVOYW1lXTtcblx0XHRcdH1cblx0XHRcdGlmIChzQXR0cmlidXRlTmFtZSA9PT0gXCJjb250ZXh0UGF0aFwiKSB7XG5cdFx0XHRcdG9TZXR0aW5ncy5jdXJyZW50Q29udGV4dFBhdGggPSBtQ29udGV4dHNbc0F0dHJpYnV0ZU5hbWVdO1xuXHRcdFx0fVxuXHRcdFx0cHJvcGVydHlWYWx1ZXNbc0F0dHJpYnV0ZU5hbWVdID0gbUNvbnRleHRzW3NBdHRyaWJ1dGVOYW1lXTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0bU1pc3NpbmdDb250ZXh0W3NBdHRyaWJ1dGVOYW1lXSA9IHRydWU7XG5cdFx0fVxuXHR9XG5cdHJldHVybiB7IG1NaXNzaW5nQ29udGV4dCwgcHJvcGVydHlWYWx1ZXM6IHByb3BlcnR5VmFsdWVzIH07XG59XG5cbmV4cG9ydCB0eXBlIEJ1aWxkaW5nQmxvY2tBZ2dyZWdhdGlvbiA9IHtcblx0a2V5OiBzdHJpbmc7XG5cdHBvc2l0aW9uOiBQb3NpdGlvbjtcblx0dHlwZTogXCJTbG90XCI7XG59O1xuZnVuY3Rpb24gcGFyc2VBZ2dyZWdhdGlvbihvQWdncmVnYXRpb24/OiBFbGVtZW50LCBwcm9jZXNzQWdncmVnYXRpb25zPzogRnVuY3Rpb24pIHtcblx0Y29uc3Qgb091dE9iamVjdHM6IFJlY29yZDxzdHJpbmcsIEJ1aWxkaW5nQmxvY2tBZ2dyZWdhdGlvbj4gPSB7fTtcblx0aWYgKG9BZ2dyZWdhdGlvbiAmJiBvQWdncmVnYXRpb24uY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuXHRcdGNvbnN0IGNoaWxkcmVuID0gb0FnZ3JlZ2F0aW9uLmNoaWxkcmVuO1xuXHRcdGZvciAobGV0IGNoaWxkSWR4ID0gMDsgY2hpbGRJZHggPCBjaGlsZHJlbi5sZW5ndGg7IGNoaWxkSWR4KyspIHtcblx0XHRcdGNvbnN0IGNoaWxkRGVmaW5pdGlvbiA9IGNoaWxkcmVuW2NoaWxkSWR4XTtcblx0XHRcdGxldCBjaGlsZEtleSA9IGNoaWxkRGVmaW5pdGlvbi5nZXRBdHRyaWJ1dGUoXCJrZXlcIikgfHwgY2hpbGREZWZpbml0aW9uLmdldEF0dHJpYnV0ZShcImlkXCIpO1xuXHRcdFx0aWYgKGNoaWxkS2V5KSB7XG5cdFx0XHRcdGNoaWxkS2V5ID0gYElubGluZVhNTF8ke2NoaWxkS2V5fWA7XG5cdFx0XHRcdGNoaWxkRGVmaW5pdGlvbi5zZXRBdHRyaWJ1dGUoXCJrZXlcIiwgY2hpbGRLZXkpO1xuXHRcdFx0XHRsZXQgYWdncmVnYXRpb25PYmplY3Q6IEJ1aWxkaW5nQmxvY2tBZ2dyZWdhdGlvbiA9IHtcblx0XHRcdFx0XHRrZXk6IGNoaWxkS2V5LFxuXHRcdFx0XHRcdHBvc2l0aW9uOiB7XG5cdFx0XHRcdFx0XHRwbGFjZW1lbnQ6IChjaGlsZERlZmluaXRpb24uZ2V0QXR0cmlidXRlKFwicGxhY2VtZW50XCIpIGFzIFBsYWNlbWVudCkgfHwgUGxhY2VtZW50LkFmdGVyLFxuXHRcdFx0XHRcdFx0YW5jaG9yOiBjaGlsZERlZmluaXRpb24uZ2V0QXR0cmlidXRlKFwiYW5jaG9yXCIpIHx8IHVuZGVmaW5lZFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0dHlwZTogXCJTbG90XCJcblx0XHRcdFx0fTtcblx0XHRcdFx0aWYgKHByb2Nlc3NBZ2dyZWdhdGlvbnMpIHtcblx0XHRcdFx0XHRhZ2dyZWdhdGlvbk9iamVjdCA9IHByb2Nlc3NBZ2dyZWdhdGlvbnMoY2hpbGREZWZpbml0aW9uLCBhZ2dyZWdhdGlvbk9iamVjdCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0b091dE9iamVjdHNbYWdncmVnYXRpb25PYmplY3Qua2V5XSA9IGFnZ3JlZ2F0aW9uT2JqZWN0O1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gb091dE9iamVjdHM7XG59XG5cbi8qKlxuICogUHJvY2Vzc2VzIHRoZSBjaGlsZCBub2RlcyBvZiB0aGUgYnVpbGRpbmcgYmxvY2sgYW5kIHBhcnNlcyB0aGVtIGFzIGVpdGhlciBhZ2dyZWdhdGlvbnMgb3Igb2JqZWN0LS9hcnJheS1iYXNlZCB2YWx1ZXMuXG4gKlxuICogQHBhcmFtIG9Ob2RlIFRoZSBYTUwgbm9kZSBmb3Igd2hpY2ggdG8gcHJvY2VzcyB0aGUgY2hpbGRyZW5cbiAqIEBwYXJhbSBvVmlzaXRvciBUaGUgdmlzaXRvciBpbnN0YW5jZVxuICogQHBhcmFtIG9NZXRhZGF0YSBUaGUgbWV0YWRhdGEgZm9yIHRoZSBidWlsZGluZyBibG9ja1xuICogQHBhcmFtIGlzUHVibGljIFdoZXRoZXIgdGhlIGJ1aWxkaW5nIGJsb2NrIGlzIHVzZWQgaW4gYSBwdWJsaWMgY29udGV4dCBvciBub3RcbiAqIEBwYXJhbSBwcm9wZXJ0eVZhbHVlcyBUaGUgdmFsdWVzIG9mIGFscmVhZHkgcGFyc2VkIHByb3BlcnR5XG4gKiBAcGFyYW0gYXBpVmVyc2lvbiBUaGUgQVBJIHZlcnNpb24gb2YgdGhlIGJ1aWxkaW5nIGJsb2NrXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHByb2Nlc3NDaGlsZHJlbihcblx0b05vZGU6IEVsZW1lbnQsXG5cdG9WaXNpdG9yOiBJVmlzaXRvckNhbGxiYWNrLFxuXHRvTWV0YWRhdGE6IFJlc29sdmVkQnVpbGRpbmdCbG9ja01ldGFkYXRhLFxuXHRpc1B1YmxpYzogYm9vbGVhbixcblx0cHJvcGVydHlWYWx1ZXM6IFJlY29yZDxzdHJpbmcsIE9iamVjdFZhbHVlPixcblx0YXBpVmVyc2lvbj86IG51bWJlclxuKSB7XG5cdGNvbnN0IG9BZ2dyZWdhdGlvbnM6IFJlY29yZDxzdHJpbmcsIEVsZW1lbnQ+ID0ge307XG5cdGlmIChvTm9kZS5maXJzdEVsZW1lbnRDaGlsZCAhPT0gbnVsbCkge1xuXHRcdGxldCBvRmlyc3RFbGVtZW50Q2hpbGQ6IEVsZW1lbnQgfCBudWxsID0gb05vZGUuZmlyc3RFbGVtZW50Q2hpbGQgYXMgRWxlbWVudCB8IG51bGw7XG5cdFx0aWYgKGFwaVZlcnNpb24gPT09IDIpIHtcblx0XHRcdHdoaWxlIChvRmlyc3RFbGVtZW50Q2hpbGQgIT09IG51bGwpIHtcblx0XHRcdFx0aWYgKG9GaXJzdEVsZW1lbnRDaGlsZC5uYW1lc3BhY2VVUkkgPT09IFhNTFRFTVBMQVRJTkdfTlMpIHtcblx0XHRcdFx0XHQvLyBJbiBjYXNlIHdlIGVuY291bnRlciBhIHRlbXBsYXRpbmcgdGFnLCBydW4gdGhlIHZpc2l0b3Igb24gaXQgYW5kIGNvbnRpbnVlIHdpdGggdGhlIHJlc3VsdGluZyBjaGlsZFxuXHRcdFx0XHRcdGNvbnN0IG9QYXJlbnQgPSBvRmlyc3RFbGVtZW50Q2hpbGQucGFyZW50Tm9kZTtcblx0XHRcdFx0XHRsZXQgaUNoaWxkSW5kZXg6IG51bWJlcjtcblx0XHRcdFx0XHRpZiAob1BhcmVudCkge1xuXHRcdFx0XHRcdFx0aUNoaWxkSW5kZXggPSBBcnJheS5mcm9tKG9QYXJlbnQuY2hpbGRyZW4pLmluZGV4T2Yob0ZpcnN0RWxlbWVudENoaWxkKTtcblx0XHRcdFx0XHRcdGF3YWl0IG9WaXNpdG9yLnZpc2l0Tm9kZShvRmlyc3RFbGVtZW50Q2hpbGQpO1xuXHRcdFx0XHRcdFx0b0ZpcnN0RWxlbWVudENoaWxkID0gb1BhcmVudC5jaGlsZHJlbltpQ2hpbGRJbmRleF0gPyBvUGFyZW50LmNoaWxkcmVuW2lDaGlsZEluZGV4XSA6IG51bGw7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdC8vIE5vdCBzdXJlIGhvdyB0aGlzIGNvdWxkIGhhcHBlbiBidXQgaSBhbHNvIGRvbid0IHdhbnQgdG8gY3JlYXRlIGluZmluaXRlIGxvb3BzXG5cdFx0XHRcdFx0XHRvRmlyc3RFbGVtZW50Q2hpbGQgPSBvRmlyc3RFbGVtZW50Q2hpbGQubmV4dEVsZW1lbnRTaWJsaW5nO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjb25zdCBzQ2hpbGROYW1lID0gb0ZpcnN0RWxlbWVudENoaWxkLmxvY2FsTmFtZTtcblx0XHRcdFx0XHRsZXQgc0FnZ3JlZ2F0aW9uTmFtZSA9IHNDaGlsZE5hbWU7XG5cdFx0XHRcdFx0aWYgKHNBZ2dyZWdhdGlvbk5hbWVbMF0udG9VcHBlckNhc2UoKSA9PT0gc0FnZ3JlZ2F0aW9uTmFtZVswXSkge1xuXHRcdFx0XHRcdFx0Ly8gbm90IGEgc3ViIGFnZ3JlZ2F0aW9uLCBnbyBiYWNrIHRvIGRlZmF1bHQgQWdncmVnYXRpb25cblx0XHRcdFx0XHRcdHNBZ2dyZWdhdGlvbk5hbWUgPSBvTWV0YWRhdGEuZGVmYXVsdEFnZ3JlZ2F0aW9uIHx8IFwiXCI7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNvbnN0IGFnZ3JlZ2F0aW9uRGVmaW5pdGlvbiA9IG9NZXRhZGF0YS5hZ2dyZWdhdGlvbnNbc0FnZ3JlZ2F0aW9uTmFtZV07XG5cdFx0XHRcdFx0aWYgKGFnZ3JlZ2F0aW9uRGVmaW5pdGlvbiAhPT0gdW5kZWZpbmVkICYmICFhZ2dyZWdhdGlvbkRlZmluaXRpb24uc2xvdCkge1xuXHRcdFx0XHRcdFx0Y29uc3QgcGFyc2VkQWdncmVnYXRpb24gPSBwYXJzZUFnZ3JlZ2F0aW9uKG9GaXJzdEVsZW1lbnRDaGlsZCwgYWdncmVnYXRpb25EZWZpbml0aW9uLnByb2Nlc3NBZ2dyZWdhdGlvbnMpO1xuXHRcdFx0XHRcdFx0cHJvcGVydHlWYWx1ZXNbc0FnZ3JlZ2F0aW9uTmFtZV0gPSBwYXJzZWRBZ2dyZWdhdGlvbjtcblx0XHRcdFx0XHRcdGZvciAoY29uc3QgcGFyc2VkQWdncmVnYXRpb25LZXkgaW4gcGFyc2VkQWdncmVnYXRpb24pIHtcblx0XHRcdFx0XHRcdFx0b01ldGFkYXRhLmFnZ3JlZ2F0aW9uc1twYXJzZWRBZ2dyZWdhdGlvbktleV0gPSBwYXJzZWRBZ2dyZWdhdGlvbltwYXJzZWRBZ2dyZWdhdGlvbktleV07XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdG9GaXJzdEVsZW1lbnRDaGlsZCA9IG9GaXJzdEVsZW1lbnRDaGlsZC5uZXh0RWxlbWVudFNpYmxpbmc7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoYXBpVmVyc2lvbiAhPT0gMikge1xuXHRcdFx0Ly8gSWYgdGhlcmUgYXJlIGFnZ3JlZ2F0aW9uIHdlIG5lZWQgdG8gdmlzaXQgdGhlIGNoaWxkTm9kZXMgdG8gcmVzb2x2ZSB0ZW1wbGF0aW5nIGluc3RydWN0aW9uc1xuXHRcdFx0YXdhaXQgb1Zpc2l0b3IudmlzaXRDaGlsZE5vZGVzKG9Ob2RlKTtcblx0XHR9XG5cdFx0b0ZpcnN0RWxlbWVudENoaWxkID0gb05vZGUuZmlyc3RFbGVtZW50Q2hpbGQ7XG5cdFx0d2hpbGUgKG9GaXJzdEVsZW1lbnRDaGlsZCAhPT0gbnVsbCkge1xuXHRcdFx0Y29uc3Qgb05leHRDaGlsZDogRWxlbWVudCB8IG51bGwgPSBvRmlyc3RFbGVtZW50Q2hpbGQubmV4dEVsZW1lbnRTaWJsaW5nO1xuXHRcdFx0Y29uc3Qgc0NoaWxkTmFtZSA9IG9GaXJzdEVsZW1lbnRDaGlsZC5sb2NhbE5hbWU7XG5cdFx0XHRsZXQgc0FnZ3JlZ2F0aW9uTmFtZSA9IHNDaGlsZE5hbWU7XG5cdFx0XHRpZiAoc0FnZ3JlZ2F0aW9uTmFtZVswXS50b1VwcGVyQ2FzZSgpID09PSBzQWdncmVnYXRpb25OYW1lWzBdKSB7XG5cdFx0XHRcdC8vIG5vdCBhIHN1YiBhZ2dyZWdhdGlvbiwgZ28gYmFjayB0byBkZWZhdWx0IEFnZ3JlZ2F0aW9uXG5cdFx0XHRcdHNBZ2dyZWdhdGlvbk5hbWUgPSBvTWV0YWRhdGEuZGVmYXVsdEFnZ3JlZ2F0aW9uIHx8IFwiXCI7XG5cdFx0XHR9XG5cdFx0XHRpZiAoXG5cdFx0XHRcdE9iamVjdC5rZXlzKG9NZXRhZGF0YS5hZ2dyZWdhdGlvbnMpLmluZGV4T2Yoc0FnZ3JlZ2F0aW9uTmFtZSkgIT09IC0xICYmXG5cdFx0XHRcdCghaXNQdWJsaWMgfHwgb01ldGFkYXRhLmFnZ3JlZ2F0aW9uc1tzQWdncmVnYXRpb25OYW1lXS5pc1B1YmxpYyA9PT0gdHJ1ZSlcblx0XHRcdCkge1xuXHRcdFx0XHRpZiAoYXBpVmVyc2lvbiA9PT0gMikge1xuXHRcdFx0XHRcdGNvbnN0IGFnZ3JlZ2F0aW9uRGVmaW5pdGlvbiA9IG9NZXRhZGF0YS5hZ2dyZWdhdGlvbnNbc0FnZ3JlZ2F0aW9uTmFtZV07XG5cdFx0XHRcdFx0aWYgKCFhZ2dyZWdhdGlvbkRlZmluaXRpb24uc2xvdCAmJiBvRmlyc3RFbGVtZW50Q2hpbGQgIT09IG51bGwgJiYgb0ZpcnN0RWxlbWVudENoaWxkLmNoaWxkcmVuLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRcdGF3YWl0IG9WaXNpdG9yLnZpc2l0Tm9kZShvRmlyc3RFbGVtZW50Q2hpbGQpO1xuXHRcdFx0XHRcdFx0bGV0IGNoaWxkRGVmaW5pdGlvbiA9IG9GaXJzdEVsZW1lbnRDaGlsZC5maXJzdEVsZW1lbnRDaGlsZDtcblx0XHRcdFx0XHRcdHdoaWxlIChjaGlsZERlZmluaXRpb24pIHtcblx0XHRcdFx0XHRcdFx0Y29uc3QgbmV4dENoaWxkID0gY2hpbGREZWZpbml0aW9uLm5leHRFbGVtZW50U2libGluZztcblx0XHRcdFx0XHRcdFx0aWYgKCFhZ2dyZWdhdGlvbkRlZmluaXRpb24uaGFzVmlydHVhbE5vZGUpIHtcblx0XHRcdFx0XHRcdFx0XHRjb25zdCBjaGlsZFdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMob05vZGUubmFtZXNwYWNlVVJJLCBjaGlsZERlZmluaXRpb24uZ2V0QXR0cmlidXRlKFwia2V5XCIpISk7XG5cdFx0XHRcdFx0XHRcdFx0Y2hpbGRXcmFwcGVyLmFwcGVuZENoaWxkKGNoaWxkRGVmaW5pdGlvbik7XG5cdFx0XHRcdFx0XHRcdFx0b0FnZ3JlZ2F0aW9uc1tjaGlsZERlZmluaXRpb24uZ2V0QXR0cmlidXRlKFwia2V5XCIpIV0gPSBjaGlsZFdyYXBwZXI7XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0b0FnZ3JlZ2F0aW9uc1tjaGlsZERlZmluaXRpb24uZ2V0QXR0cmlidXRlKFwia2V5XCIpIV0gPSBjaGlsZERlZmluaXRpb247XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRjaGlsZERlZmluaXRpb24ucmVtb3ZlQXR0cmlidXRlKFwia2V5XCIpO1xuXHRcdFx0XHRcdFx0XHRjaGlsZERlZmluaXRpb24gPSBuZXh0Q2hpbGQ7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSBlbHNlIGlmIChhZ2dyZWdhdGlvbkRlZmluaXRpb24uc2xvdCkge1xuXHRcdFx0XHRcdFx0aWYgKHNBZ2dyZWdhdGlvbk5hbWUgIT09IHNDaGlsZE5hbWUpIHtcblx0XHRcdFx0XHRcdFx0aWYgKCFvQWdncmVnYXRpb25zW3NBZ2dyZWdhdGlvbk5hbWVdKSB7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc3Qgb05ld0NoaWxkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKG9Ob2RlLm5hbWVzcGFjZVVSSSwgc0FnZ3JlZ2F0aW9uTmFtZSk7XG5cdFx0XHRcdFx0XHRcdFx0b0FnZ3JlZ2F0aW9uc1tzQWdncmVnYXRpb25OYW1lXSA9IG9OZXdDaGlsZDtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRvQWdncmVnYXRpb25zW3NBZ2dyZWdhdGlvbk5hbWVdLmFwcGVuZENoaWxkKG9GaXJzdEVsZW1lbnRDaGlsZCk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRvQWdncmVnYXRpb25zW3NBZ2dyZWdhdGlvbk5hbWVdID0gb0ZpcnN0RWxlbWVudENoaWxkO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRhd2FpdCBvVmlzaXRvci52aXNpdE5vZGUob0ZpcnN0RWxlbWVudENoaWxkKTtcblx0XHRcdFx0XHRvQWdncmVnYXRpb25zW29GaXJzdEVsZW1lbnRDaGlsZC5sb2NhbE5hbWVdID0gb0ZpcnN0RWxlbWVudENoaWxkO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYgKE9iamVjdC5rZXlzKG9NZXRhZGF0YS5wcm9wZXJ0aWVzKS5pbmRleE9mKHNBZ2dyZWdhdGlvbk5hbWUpICE9PSAtMSkge1xuXHRcdFx0XHRhd2FpdCBvVmlzaXRvci52aXNpdE5vZGUob0ZpcnN0RWxlbWVudENoaWxkKTtcblx0XHRcdFx0aWYgKG9NZXRhZGF0YS5wcm9wZXJ0aWVzW3NBZ2dyZWdhdGlvbk5hbWVdLnR5cGUgPT09IFwib2JqZWN0XCIpIHtcblx0XHRcdFx0XHQvLyBPYmplY3QgVHlwZSBwcm9wZXJ0aWVzXG5cdFx0XHRcdFx0Y29uc3QgYWdncmVnYXRpb25Qcm9wZXJ0eVZhbHVlczogUmVjb3JkPHN0cmluZywgT2JqZWN0VmFsdWUyIHwgUmVjb3JkPHN0cmluZywgT2JqZWN0VmFsdWUyPj4gPSB7fTtcblx0XHRcdFx0XHRjb25zdCBhdHRyaWJ1dGVOYW1lcyA9IG9GaXJzdEVsZW1lbnRDaGlsZC5nZXRBdHRyaWJ1dGVOYW1lcygpO1xuXHRcdFx0XHRcdGZvciAoY29uc3QgYXR0cmlidXRlTmFtZSBvZiBhdHRyaWJ1dGVOYW1lcykge1xuXHRcdFx0XHRcdFx0YWdncmVnYXRpb25Qcm9wZXJ0eVZhbHVlc1thdHRyaWJ1dGVOYW1lXSA9IG9GaXJzdEVsZW1lbnRDaGlsZC5nZXRBdHRyaWJ1dGUoYXR0cmlidXRlTmFtZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmIChvRmlyc3RFbGVtZW50Q2hpbGQuY2hpbGRyZW4ubGVuZ3RoKSB7XG5cdFx0XHRcdFx0XHQvL3JldHJpZXZlIG9uZSBsZXZlbCBzdWJPYmplY3QgcHJvcGVydGllc1xuXHRcdFx0XHRcdFx0Zm9yIChsZXQgY2hpbGRJbmRleCA9IDA7IGNoaWxkSW5kZXggPCBvRmlyc3RFbGVtZW50Q2hpbGQuY2hpbGRyZW4ubGVuZ3RoOyBjaGlsZEluZGV4KyspIHtcblx0XHRcdFx0XHRcdFx0Y29uc3Qgc3ViQ2hpbGQgPSBvRmlyc3RFbGVtZW50Q2hpbGQuY2hpbGRyZW5bY2hpbGRJbmRleF07XG5cdFx0XHRcdFx0XHRcdGNvbnN0IHN1Yk9iamVjdEtleSA9IHN1YkNoaWxkLmxvY2FsTmFtZTtcblx0XHRcdFx0XHRcdFx0Y29uc3Qgc3ViT2JqZWN0OiBSZWNvcmQ8c3RyaW5nLCBPYmplY3RWYWx1ZTI+ID0ge307XG5cdFx0XHRcdFx0XHRcdGNvbnN0IHN1YkNoaWxkQXR0cmlidXRlTmFtZXMgPSBzdWJDaGlsZC5nZXRBdHRyaWJ1dGVOYW1lcygpO1xuXHRcdFx0XHRcdFx0XHRmb3IgKGNvbnN0IHN1YkNoaWxkQXR0cmlidXRlTmFtZSBvZiBzdWJDaGlsZEF0dHJpYnV0ZU5hbWVzKSB7XG5cdFx0XHRcdFx0XHRcdFx0c3ViT2JqZWN0W3N1YkNoaWxkQXR0cmlidXRlTmFtZV0gPSBzdWJDaGlsZC5nZXRBdHRyaWJ1dGUoc3ViQ2hpbGRBdHRyaWJ1dGVOYW1lKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRhZ2dyZWdhdGlvblByb3BlcnR5VmFsdWVzW3N1Yk9iamVjdEtleV0gPSBzdWJPYmplY3Q7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHByb3BlcnR5VmFsdWVzW3NBZ2dyZWdhdGlvbk5hbWVdID0gYWdncmVnYXRpb25Qcm9wZXJ0eVZhbHVlcztcblx0XHRcdFx0fSBlbHNlIGlmIChvTWV0YWRhdGEucHJvcGVydGllc1tzQWdncmVnYXRpb25OYW1lXS50eXBlID09PSBcImFycmF5XCIpIHtcblx0XHRcdFx0XHRpZiAob0ZpcnN0RWxlbWVudENoaWxkICE9PSBudWxsICYmIG9GaXJzdEVsZW1lbnRDaGlsZC5jaGlsZHJlbi5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBjaGlsZHJlbiA9IG9GaXJzdEVsZW1lbnRDaGlsZC5jaGlsZHJlbjtcblx0XHRcdFx0XHRcdGNvbnN0IG9PdXRPYmplY3RzOiBSZWNvcmQ8c3RyaW5nLCBPYmplY3RWYWx1ZTI+W10gPSBbXTtcblx0XHRcdFx0XHRcdGZvciAobGV0IGNoaWxkSWR4ID0gMDsgY2hpbGRJZHggPCBjaGlsZHJlbi5sZW5ndGg7IGNoaWxkSWR4KyspIHtcblx0XHRcdFx0XHRcdFx0Y29uc3QgY2hpbGREZWZpbml0aW9uID0gY2hpbGRyZW5bY2hpbGRJZHhdO1xuXHRcdFx0XHRcdFx0XHQvLyBub24ga2V5ZWQgY2hpbGQsIGp1c3QgYWRkIGl0IHRvIHRoZSBhZ2dyZWdhdGlvblxuXHRcdFx0XHRcdFx0XHRjb25zdCBteUNoaWxkOiBSZWNvcmQ8c3RyaW5nLCBPYmplY3RWYWx1ZTI+ID0ge307XG5cdFx0XHRcdFx0XHRcdGNvbnN0IGF0dHJpYnV0ZU5hbWVzID0gY2hpbGREZWZpbml0aW9uLmdldEF0dHJpYnV0ZU5hbWVzKCk7XG5cdFx0XHRcdFx0XHRcdGZvciAoY29uc3QgYXR0cmlidXRlTmFtZSBvZiBhdHRyaWJ1dGVOYW1lcykge1xuXHRcdFx0XHRcdFx0XHRcdG15Q2hpbGRbYXR0cmlidXRlTmFtZV0gPSBjaGlsZERlZmluaXRpb24uZ2V0QXR0cmlidXRlKGF0dHJpYnV0ZU5hbWUpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdG9PdXRPYmplY3RzLnB1c2gobXlDaGlsZCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRwcm9wZXJ0eVZhbHVlc1tzQWdncmVnYXRpb25OYW1lXSA9IG9PdXRPYmplY3RzO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRvRmlyc3RFbGVtZW50Q2hpbGQgPSBvTmV4dENoaWxkO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gb0FnZ3JlZ2F0aW9ucztcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc1Nsb3RzKFxuXHRvQWdncmVnYXRpb25zOiBSZWNvcmQ8c3RyaW5nLCBFbGVtZW50Pixcblx0b01ldGFkYXRhQWdncmVnYXRpb25zOiBSZWNvcmQ8c3RyaW5nLCBCdWlsZGluZ0Jsb2NrQWdncmVnYXRpb25EZWZpbml0aW9uPixcblx0b05vZGU6IEVsZW1lbnQsXG5cdHByb2Nlc3NDdXN0b21EYXRhID0gZmFsc2Vcbikge1xuXHRpZiAoT2JqZWN0LmtleXMob0FnZ3JlZ2F0aW9ucykubGVuZ3RoID4gMCkge1xuXHRcdE9iamVjdC5rZXlzKG9BZ2dyZWdhdGlvbnMpLmZvckVhY2goZnVuY3Rpb24gKHNBZ2dyZWdhdGlvbk5hbWU6IHN0cmluZykge1xuXHRcdFx0Y29uc3Qgb0FnZ3JlZ2F0aW9uRWxlbWVudCA9IG9BZ2dyZWdhdGlvbnNbc0FnZ3JlZ2F0aW9uTmFtZV07XG5cdFx0XHRpZiAob05vZGUgIT09IG51bGwgJiYgb05vZGUgIT09IHVuZGVmaW5lZCAmJiBvQWdncmVnYXRpb25FbGVtZW50KSB7XG5cdFx0XHRcdC8vIHNsb3RzIGNhbiBoYXZlIDo6IGFzIGtleXMgd2hpY2ggaXMgbm90IGEgdmFsaWQgYWdncmVnYXRpb24gbmFtZSB0aGVyZWZvcmUgcmVwbGFjaW5nIHRoZW1cblx0XHRcdFx0Y29uc3Qgb0VsZW1lbnRDaGlsZCA9IG9BZ2dyZWdhdGlvbkVsZW1lbnQuZmlyc3RFbGVtZW50Q2hpbGQ7XG5cdFx0XHRcdGlmIChzQWdncmVnYXRpb25OYW1lICE9PSBcImN1c3RvbURhdGFcIiAmJiBzQWdncmVnYXRpb25OYW1lICE9PSBcImRlcGVuZGVudHNcIikge1xuXHRcdFx0XHRcdGNvbnN0IHNTbG90TmFtZSA9XG5cdFx0XHRcdFx0XHQob01ldGFkYXRhQWdncmVnYXRpb25zW3NBZ2dyZWdhdGlvbk5hbWVdICE9PSB1bmRlZmluZWQgJiYgb01ldGFkYXRhQWdncmVnYXRpb25zW3NBZ2dyZWdhdGlvbk5hbWVdLnNsb3QpIHx8XG5cdFx0XHRcdFx0XHRzQWdncmVnYXRpb25OYW1lO1xuXHRcdFx0XHRcdGNvbnN0IG9UYXJnZXRFbGVtZW50ID0gb05vZGUucXVlcnlTZWxlY3Rvcihgc2xvdFtuYW1lPScke3NTbG90TmFtZX0nXWApO1xuXHRcdFx0XHRcdGlmIChvVGFyZ2V0RWxlbWVudCAhPT0gbnVsbCkge1xuXHRcdFx0XHRcdFx0Y29uc3Qgb05ld0NoaWxkID0gcHJlcGFyZUFnZ3JlZ2F0aW9uRWxlbWVudChvTm9kZSwgc0FnZ3JlZ2F0aW9uTmFtZSwgb0VsZW1lbnRDaGlsZCk7XG5cdFx0XHRcdFx0XHRvVGFyZ2V0RWxlbWVudC5yZXBsYWNlV2l0aCguLi4ob05ld0NoaWxkLmNoaWxkcmVuIGFzIHVua25vd24gYXMgTm9kZVtdKSk7IC8vIFNvbWVob3cgVFMgZG9lc24ndCBsaWtlIHRoaXMgYnV0IHRoZSBkb2N1bWVudGF0aW9uIHNheXMgaXMgc2hvdWxkIHdvcmtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSBpZiAocHJvY2Vzc0N1c3RvbURhdGEgJiYgb0VsZW1lbnRDaGlsZCAhPT0gbnVsbCkge1xuXHRcdFx0XHRcdGNvbnN0IG9OZXdDaGlsZCA9IHByZXBhcmVBZ2dyZWdhdGlvbkVsZW1lbnQob05vZGUsIHNBZ2dyZWdhdGlvbk5hbWUsIG9FbGVtZW50Q2hpbGQpO1xuXHRcdFx0XHRcdG9Ob2RlLmFwcGVuZENoaWxkKG9OZXdDaGlsZCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0fVxufVxuXG5mdW5jdGlvbiBwcmVwYXJlQWdncmVnYXRpb25FbGVtZW50KG9Ob2RlOiBFbGVtZW50LCBzQWdncmVnYXRpb25OYW1lOiBzdHJpbmcsIG9FbGVtZW50Q2hpbGQ6IEVsZW1lbnQgfCBudWxsKSB7XG5cdGNvbnN0IG9OZXdDaGlsZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhvTm9kZS5uYW1lc3BhY2VVUkksIHNBZ2dyZWdhdGlvbk5hbWUucmVwbGFjZSgvOi9naSwgXCJfXCIpKTtcblx0d2hpbGUgKG9FbGVtZW50Q2hpbGQpIHtcblx0XHRjb25zdCBvTmV4dENoaWxkID0gb0VsZW1lbnRDaGlsZC5uZXh0RWxlbWVudFNpYmxpbmc7XG5cdFx0b05ld0NoaWxkLmFwcGVuZENoaWxkKG9FbGVtZW50Q2hpbGQpO1xuXHRcdG9FbGVtZW50Q2hpbGQgPSBvTmV4dENoaWxkO1xuXHR9XG5cdHJldHVybiBvTmV3Q2hpbGQ7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHByb2Nlc3NCdWlsZGluZ0Jsb2NrKFxuXHRidWlsZGluZ0Jsb2NrRGVmaW5pdGlvbjogQnVpbGRpbmdCbG9ja0RlZmluaXRpb24sXG5cdG9Ob2RlOiBFbGVtZW50LFxuXHRvVmlzaXRvcjogSVZpc2l0b3JDYWxsYmFjayxcblx0aXNQdWJsaWMgPSBmYWxzZVxuKSB7XG5cdGNvbnN0IHNGcmFnbWVudE5hbWUgPVxuXHRcdGJ1aWxkaW5nQmxvY2tEZWZpbml0aW9uLmZyYWdtZW50IHx8XG5cdFx0YCR7YnVpbGRpbmdCbG9ja0RlZmluaXRpb24ubmFtZXNwYWNlfS4ke2J1aWxkaW5nQmxvY2tEZWZpbml0aW9uLnhtbFRhZyB8fCBidWlsZGluZ0Jsb2NrRGVmaW5pdGlvbi5uYW1lfWA7XG5cblx0Y29uc3Qgc05hbWUgPSBcInRoaXNcIjtcblxuXHRjb25zdCBtQ29udGV4dHM6IFJlY29yZDxzdHJpbmcsIENvbnRleHQ+ID0ge307XG5cdGNvbnN0IG9NZXRhZGF0YUNvbnRleHRzOiBSZWNvcmQ8c3RyaW5nLCBDb250ZXh0PiA9IHt9O1xuXHRjb25zdCBvU2V0dGluZ3MgPSBvVmlzaXRvci5nZXRTZXR0aW5ncygpO1xuXHQvLyBUT0RPIDAwMDEgTW92ZSB0aGlzIGVsc2V3aGVyZSB0aGlzIGlzIHdlaXJkIDopXG5cdGlmIChvU2V0dGluZ3MubW9kZWxzW1wic2FwLmZlLmkxOG5cIl0pIHtcblx0XHQob1NldHRpbmdzLm1vZGVsc1tcInNhcC5mZS5pMThuXCJdLmdldFJlc291cmNlQnVuZGxlKCkgYXMgUHJvbWlzZTxSZXNvdXJjZUJ1bmRsZT4pXG5cdFx0XHQudGhlbihmdW5jdGlvbiAob1Jlc291cmNlQnVuZGxlOiBSZXNvdXJjZUJ1bmRsZSkge1xuXHRcdFx0XHRSZXNvdXJjZU1vZGVsLnNldEFwcGxpY2F0aW9uSTE4bkJ1bmRsZShvUmVzb3VyY2VCdW5kbGUpO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbiAoZXJyb3I6IHVua25vd24pIHtcblx0XHRcdFx0TG9nLmVycm9yKGVycm9yIGFzIHN0cmluZyk7XG5cdFx0XHR9KTtcblx0fVxuXHRjb25zdCBvTWV0YWRhdGEgPSBwcmVwYXJlTWV0YWRhdGEoYnVpbGRpbmdCbG9ja0RlZmluaXRpb24ubWV0YWRhdGEsIGJ1aWxkaW5nQmxvY2tEZWZpbml0aW9uLmlzT3BlbiwgYnVpbGRpbmdCbG9ja0RlZmluaXRpb24uYXBpVmVyc2lvbik7XG5cblx0Ly9JbmplY3Qgc3RvcmFnZSBmb3IgbWFjcm9zXG5cdGlmICghb1NldHRpbmdzW3NGcmFnbWVudE5hbWVdKSB7XG5cdFx0b1NldHRpbmdzW3NGcmFnbWVudE5hbWVdID0ge307XG5cdH1cblxuXHQvLyBGaXJzdCBvZiBhbGwgd2UgbmVlZCB0byB2aXNpdCB0aGUgYXR0cmlidXRlcyB0byByZXNvbHZlIHRoZSBwcm9wZXJ0aWVzIGFuZCB0aGUgbWV0YWRhdGEgY29udGV4dHNcblx0bGV0IHByb3BlcnR5VmFsdWVzID0gYXdhaXQgcHJvY2Vzc1Byb3BlcnRpZXMob01ldGFkYXRhLCBvTm9kZSwgaXNQdWJsaWMsIG9WaXNpdG9yLCBidWlsZGluZ0Jsb2NrRGVmaW5pdGlvbi5hcGlWZXJzaW9uKTtcblxuXHRjb25zdCB7IG1NaXNzaW5nQ29udGV4dCwgcHJvcGVydHlWYWx1ZXM6IGV4dHJhUHJvcGVydHlWYWx1ZXMgfSA9IHByb2Nlc3NDb250ZXh0cyhcblx0XHRvTWV0YWRhdGEsXG5cdFx0b1NldHRpbmdzLFxuXHRcdG9Ob2RlLFxuXHRcdGlzUHVibGljLFxuXHRcdG9WaXNpdG9yLFxuXHRcdG1Db250ZXh0cyxcblx0XHRvTWV0YWRhdGFDb250ZXh0c1xuXHQpO1xuXHRwcm9wZXJ0eVZhbHVlcyA9IE9iamVjdC5hc3NpZ24ocHJvcGVydHlWYWx1ZXMsIGV4dHJhUHJvcGVydHlWYWx1ZXMpO1xuXHRjb25zdCBpbml0aWFsS2V5cyA9IE9iamVjdC5rZXlzKHByb3BlcnR5VmFsdWVzKTtcblx0dHJ5IHtcblx0XHQvLyBBZ2dyZWdhdGlvbiBhbmQgY29tcGxleCB0eXBlIHN1cHBvcnRcblx0XHRjb25zdCBvQWdncmVnYXRpb25zID0gYXdhaXQgcHJvY2Vzc0NoaWxkcmVuKFxuXHRcdFx0b05vZGUsXG5cdFx0XHRvVmlzaXRvcixcblx0XHRcdG9NZXRhZGF0YSxcblx0XHRcdGlzUHVibGljLFxuXHRcdFx0cHJvcGVydHlWYWx1ZXMsXG5cdFx0XHRidWlsZGluZ0Jsb2NrRGVmaW5pdGlvbi5hcGlWZXJzaW9uXG5cdFx0KTtcblx0XHRsZXQgb0luc3RhbmNlOiBCdWlsZGluZ0Jsb2NrQmFzZSB8IHVuZGVmaW5lZDtcblx0XHRsZXQgb0NvbnRyb2xDb25maWcgPSB7fTtcblxuXHRcdGlmIChvU2V0dGluZ3MubW9kZWxzLnZpZXdEYXRhKSB7XG5cdFx0XHQvLyBPbmx5IHVzZWQgaW4gdGhlIEZpZWxkIG1hY3JvIGFuZCBldmVuIHRoZW4gbWF5YmUgbm90IHJlYWxseSB1c2VmdWxcblx0XHRcdG9Db250cm9sQ29uZmlnID0gb1NldHRpbmdzLm1vZGVscy52aWV3RGF0YS5nZXRQcm9wZXJ0eShcIi9jb250cm9sQ29uZmlndXJhdGlvblwiKTtcblx0XHR9XG5cdFx0bGV0IHByb2Nlc3NlZFByb3BlcnR5VmFsdWVzID0gcHJvcGVydHlWYWx1ZXM7XG5cdFx0aWYgKGlzVjFNYWNyb0RlZihidWlsZGluZ0Jsb2NrRGVmaW5pdGlvbikgJiYgYnVpbGRpbmdCbG9ja0RlZmluaXRpb24uY3JlYXRlKSB7XG5cdFx0XHRwcm9jZXNzZWRQcm9wZXJ0eVZhbHVlcyA9IGJ1aWxkaW5nQmxvY2tEZWZpbml0aW9uLmNyZWF0ZS5jYWxsKFxuXHRcdFx0XHRidWlsZGluZ0Jsb2NrRGVmaW5pdGlvbixcblx0XHRcdFx0cHJvcGVydHlWYWx1ZXMsXG5cdFx0XHRcdG9Db250cm9sQ29uZmlnLFxuXHRcdFx0XHRvU2V0dGluZ3MsXG5cdFx0XHRcdG9BZ2dyZWdhdGlvbnMsXG5cdFx0XHRcdGlzUHVibGljXG5cdFx0XHQpO1xuXHRcdFx0T2JqZWN0LmtleXMob01ldGFkYXRhLm1ldGFkYXRhQ29udGV4dHMpLmZvckVhY2goZnVuY3Rpb24gKHNNZXRhZGF0YU5hbWU6IHN0cmluZykge1xuXHRcdFx0XHRpZiAob01ldGFkYXRhLm1ldGFkYXRhQ29udGV4dHNbc01ldGFkYXRhTmFtZV0uY29tcHV0ZWQgPT09IHRydWUpIHtcblx0XHRcdFx0XHRtQ29udGV4dHNbc01ldGFkYXRhTmFtZV0gPSBwcm9jZXNzZWRQcm9wZXJ0eVZhbHVlc1tzTWV0YWRhdGFOYW1lXSBhcyB1bmtub3duIGFzIENvbnRleHQ7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0T2JqZWN0LmtleXMobU1pc3NpbmdDb250ZXh0KS5mb3JFYWNoKGZ1bmN0aW9uIChzQ29udGV4dE5hbWU6IHN0cmluZykge1xuXHRcdFx0XHRpZiAocHJvY2Vzc2VkUHJvcGVydHlWYWx1ZXMuaGFzT3duUHJvcGVydHkoc0NvbnRleHROYW1lKSkge1xuXHRcdFx0XHRcdG1Db250ZXh0c1tzQ29udGV4dE5hbWVdID0gcHJvY2Vzc2VkUHJvcGVydHlWYWx1ZXNbc0NvbnRleHROYW1lXSBhcyB1bmtub3duIGFzIENvbnRleHQ7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH0gZWxzZSBpZiAoYnVpbGRpbmdCbG9ja0RlZmluaXRpb24uYXBpVmVyc2lvbiA9PT0gMikge1xuXHRcdFx0T2JqZWN0LmtleXMocHJvcGVydHlWYWx1ZXMpLmZvckVhY2goKHByb3BOYW1lKSA9PiB7XG5cdFx0XHRcdGxldCBvRGF0YSA9IHByb3BlcnR5VmFsdWVzW3Byb3BOYW1lXSBhcyB1bmtub3duIGFzIENvbnRleHQ7XG5cdFx0XHRcdC8vY2hlY2sgZm9yIGFkZGl0aW9uYWwgcHJvY2Vzc2luZyBmdW5jdGlvbiB0byB2YWxpZGF0ZSAvIG92ZXJ3cml0ZSBwYXJhbWV0ZXJzXG5cdFx0XHRcdGNvbnN0IG9yaWdpbmFsRGVmaW5pdGlvbiA9IGJ1aWxkaW5nQmxvY2tEZWZpbml0aW9uPy5tZXRhZGF0YT8ucHJvcGVydGllc1twcm9wTmFtZV07XG5cdFx0XHRcdGlmIChvcmlnaW5hbERlZmluaXRpb24/LnZhbGlkYXRlKSB7XG5cdFx0XHRcdFx0b0RhdGEgPSBvcmlnaW5hbERlZmluaXRpb24udmFsaWRhdGUob0RhdGEpIHx8IG9EYXRhO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChvRGF0YT8uaXNBPy4oU0FQX1VJX01PREVMX0NPTlRFWFQpICYmICFvRGF0YS5nZXRNb2RlbCgpLmlzQShcInNhcC51aS5tb2RlbC5vZGF0YS52NC5PRGF0YU1ldGFNb2RlbFwiKSkge1xuXHRcdFx0XHRcdHByb3BlcnR5VmFsdWVzW3Byb3BOYW1lXSA9IG9EYXRhLmdldE9iamVjdCgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdGNvbnN0IEJ1aWxkaW5nQmxvY2tDbGFzcyA9IGJ1aWxkaW5nQmxvY2tEZWZpbml0aW9uIGFzIHR5cGVvZiBCdWlsZGluZ0Jsb2NrQmFzZTtcblx0XHRcdHByb3BlcnR5VmFsdWVzLmlzUHVibGljID0gaXNQdWJsaWM7XG5cblx0XHRcdG9JbnN0YW5jZSA9IG5ldyBCdWlsZGluZ0Jsb2NrQ2xhc3MoXG5cdFx0XHRcdHsgLi4ucHJvcGVydHlWYWx1ZXMsIC4uLm9BZ2dyZWdhdGlvbnMgfSxcblx0XHRcdFx0b0NvbnRyb2xDb25maWcsXG5cdFx0XHRcdG9TZXR0aW5nc1xuXHRcdFx0XHQvKiwgb0NvbnRyb2xDb25maWcsIG9TZXR0aW5ncywgb0FnZ3JlZ2F0aW9ucywgaXNQdWJsaWMqL1xuXHRcdFx0KTtcblx0XHRcdHByb2Nlc3NlZFByb3BlcnR5VmFsdWVzID0gb0luc3RhbmNlLmdldFByb3BlcnRpZXMoKTtcblx0XHRcdE9iamVjdC5rZXlzKG9NZXRhZGF0YS5tZXRhZGF0YUNvbnRleHRzKS5mb3JFYWNoKGZ1bmN0aW9uIChzQ29udGV4dE5hbWU6IHN0cmluZykge1xuXHRcdFx0XHRpZiAocHJvY2Vzc2VkUHJvcGVydHlWYWx1ZXMuaGFzT3duUHJvcGVydHkoc0NvbnRleHROYW1lKSkge1xuXHRcdFx0XHRcdGNvbnN0IHRhcmdldE9iamVjdCA9IHByb2Nlc3NlZFByb3BlcnR5VmFsdWVzW3NDb250ZXh0TmFtZV07XG5cdFx0XHRcdFx0aWYgKHR5cGVvZiB0YXJnZXRPYmplY3QgPT09IFwib2JqZWN0XCIgJiYgIWlzQ29udGV4dCh0YXJnZXRPYmplY3QpKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBzQXR0cmlidXRlVmFsdWUgPSBzdG9yZVZhbHVlKHRhcmdldE9iamVjdCk7XG5cdFx0XHRcdFx0XHRvU2V0dGluZ3MubW9kZWxzLmNvbnZlcnRlckNvbnRleHQuc2V0UHJvcGVydHkoc0F0dHJpYnV0ZVZhbHVlLCB0YXJnZXRPYmplY3QpO1xuXHRcdFx0XHRcdFx0Y29uc3QgbmV3Q29udGV4dCA9IG9TZXR0aW5ncy5tb2RlbHMuY29udmVydGVyQ29udGV4dC5jcmVhdGVCaW5kaW5nQ29udGV4dChzQXR0cmlidXRlVmFsdWUpITtcblx0XHRcdFx0XHRcdGRlbGV0ZSBteVN0b3JlW3NBdHRyaWJ1dGVWYWx1ZV07XG5cdFx0XHRcdFx0XHRtQ29udGV4dHNbc0NvbnRleHROYW1lXSA9IG5ld0NvbnRleHQ7XG5cdFx0XHRcdFx0fSBlbHNlIGlmICghbUNvbnRleHRzLmhhc093blByb3BlcnR5KHNDb250ZXh0TmFtZSkgJiYgdGFyZ2V0T2JqZWN0ICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRcdG1Db250ZXh0c1tzQ29udGV4dE5hbWVdID0gdGFyZ2V0T2JqZWN0IGFzIENvbnRleHQ7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0Y29uc3Qgb0F0dHJpYnV0ZXNNb2RlbDogSlNPTk1vZGVsID0gbmV3IEF0dHJpYnV0ZU1vZGVsKG9Ob2RlLCBwcm9jZXNzZWRQcm9wZXJ0eVZhbHVlcywgYnVpbGRpbmdCbG9ja0RlZmluaXRpb24pO1xuXHRcdG1Db250ZXh0c1tzTmFtZV0gPSBvQXR0cmlidXRlc01vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KFwiL1wiKTtcblx0XHRsZXQgb1ByZXZpb3VzTWFjcm9JbmZvOiBNYWNyb0luZm8gfCB1bmRlZmluZWQ7XG5cblx0XHQvLyBLZWVwIHRyYWNrXG5cdFx0aWYgKFRyYWNlSW5mby5pc1RyYWNlSW5mb0FjdGl2ZSgpKSB7XG5cdFx0XHRjb25zdCBvVHJhY2VJbmZvID0gVHJhY2VJbmZvLnRyYWNlTWFjcm9DYWxscyhzRnJhZ21lbnROYW1lLCBvTWV0YWRhdGEsIG1Db250ZXh0cywgb05vZGUsIG9WaXNpdG9yKTtcblx0XHRcdGlmICgob1RyYWNlSW5mbyBhcyBUcmFjZU1ldGFkYXRhQ29udGV4dCk/Lm1hY3JvSW5mbykge1xuXHRcdFx0XHRvUHJldmlvdXNNYWNyb0luZm8gPSBvU2V0dGluZ3NbXCJfbWFjcm9JbmZvXCJdO1xuXHRcdFx0XHRvU2V0dGluZ3NbXCJfbWFjcm9JbmZvXCJdID0gKG9UcmFjZUluZm8gYXMgVHJhY2VNZXRhZGF0YUNvbnRleHQpLm1hY3JvSW5mbztcblx0XHRcdH1cblx0XHR9XG5cdFx0dmFsaWRhdGVNYWNyb1NpZ25hdHVyZShzRnJhZ21lbnROYW1lLCBvTWV0YWRhdGEsIG1Db250ZXh0cywgb05vZGUpO1xuXG5cdFx0Y29uc3Qgb0NvbnRleHRWaXNpdG9yID0gb1Zpc2l0b3Iud2l0aChcblx0XHRcdG1Db250ZXh0cyxcblx0XHRcdGJ1aWxkaW5nQmxvY2tEZWZpbml0aW9uLmlzT3BlbiAhPT0gdW5kZWZpbmVkID8gIWJ1aWxkaW5nQmxvY2tEZWZpbml0aW9uLmlzT3BlbiA6IHRydWVcblx0XHQpO1xuXHRcdGNvbnN0IG9QYXJlbnQgPSBvTm9kZS5wYXJlbnROb2RlO1xuXG5cdFx0bGV0IGlDaGlsZEluZGV4OiBudW1iZXI7XG5cdFx0bGV0IG9Qcm9taXNlO1xuXHRcdGxldCBwcm9jZXNzQ3VzdG9tRGF0YSA9IHRydWU7XG5cdFx0aWYgKG9QYXJlbnQpIHtcblx0XHRcdGlDaGlsZEluZGV4ID0gQXJyYXkuZnJvbShvUGFyZW50LmNoaWxkcmVuKS5pbmRleE9mKG9Ob2RlKTtcblx0XHRcdGlmIChcblx0XHRcdFx0KGlzVjFNYWNyb0RlZihidWlsZGluZ0Jsb2NrRGVmaW5pdGlvbikgJiYgYnVpbGRpbmdCbG9ja0RlZmluaXRpb24uZ2V0VGVtcGxhdGUpIHx8XG5cdFx0XHRcdChidWlsZGluZ0Jsb2NrRGVmaW5pdGlvbi5hcGlWZXJzaW9uID09PSAyICYmICFidWlsZGluZ0Jsb2NrRGVmaW5pdGlvbi5mcmFnbWVudClcblx0XHRcdCkge1xuXHRcdFx0XHRsZXQgdGVtcGxhdGVTdHJpbmc6IHN0cmluZyB8IHVuZGVmaW5lZDtcblx0XHRcdFx0bGV0IGFkZERlZmF1bHROYW1lc3BhY2UgPSBmYWxzZTtcblx0XHRcdFx0aWYgKGJ1aWxkaW5nQmxvY2tEZWZpbml0aW9uLmFwaVZlcnNpb24gPT09IDIgJiYgb0luc3RhbmNlICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHR0ZW1wbGF0ZVN0cmluZyA9IGF3YWl0IG9JbnN0YW5jZS5nZXRUZW1wbGF0ZSEob05vZGUpO1xuXHRcdFx0XHRcdGlmIChidWlsZGluZ0Jsb2NrRGVmaW5pdGlvbi5pc1J1bnRpbWUgPT09IHRydWUpIHtcblx0XHRcdFx0XHRcdC8vIEZvciBydW50aW1lIGJ1aWxkaW5nIGJsb2Nrcywgd2UgbmVlZCB0byBhdHRhY2ggYWxsIG9iamVjdHMgdG8gdGhlIGNvbnZlcnRlckNvbnRleHQgZGlyZWN0bHksIGFzIHRoZSBhY3R1YWwgcmVuZGVyaW5nIHRha2VzIHBsYWNlIGF0IHJ1bnRpbWVcblx0XHRcdFx0XHRcdGZvciAoY29uc3QgbXlTdG9yZUtleSBpbiBteVN0b3JlKSB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IG9EYXRhID0gbXlTdG9yZVtteVN0b3JlS2V5XTtcblx0XHRcdFx0XHRcdFx0b1NldHRpbmdzLm1vZGVscy5jb252ZXJ0ZXJDb250ZXh0LnNldFByb3BlcnR5KG15U3RvcmVLZXksIG9EYXRhKTtcblx0XHRcdFx0XHRcdFx0ZGVsZXRlIG15U3RvcmVbbXlTdG9yZUtleV07XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGFkZERlZmF1bHROYW1lc3BhY2UgPSB0cnVlO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGJ1aWxkaW5nQmxvY2tEZWZpbml0aW9uLmdldFRlbXBsYXRlKSB7XG5cdFx0XHRcdFx0dGVtcGxhdGVTdHJpbmcgPSBhd2FpdCBidWlsZGluZ0Jsb2NrRGVmaW5pdGlvbi5nZXRUZW1wbGF0ZShwcm9jZXNzZWRQcm9wZXJ0eVZhbHVlcyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRsZXQgaGFzRXJyb3IgPSBcIlwiO1xuXHRcdFx0XHRpZiAodGVtcGxhdGVTdHJpbmcpIHtcblx0XHRcdFx0XHRsZXQgaGFzUGFyc2VFcnJvciA9IGZhbHNlO1xuXHRcdFx0XHRcdGxldCBwYXJzZWRUZW1wbGF0ZSA9IHBhcnNlWE1MU3RyaW5nKHRlbXBsYXRlU3RyaW5nLCBhZGREZWZhdWx0TmFtZXNwYWNlKTtcblx0XHRcdFx0XHQvLyBGb3Igc2FmZXR5IHB1cnBvc2Ugd2UgdHJ5IHRvIGRldGVjdCB0cmFpbGluZyB0ZXh0IGluIGJldHdlZW4gWE1MIFRhZ3Ncblx0XHRcdFx0XHRmb3IgKGNvbnN0IGVsZW1lbnQgb2YgcGFyc2VkVGVtcGxhdGUpIHtcblx0XHRcdFx0XHRcdGNvbnN0IGl0ZXIgPSBkb2N1bWVudC5jcmVhdGVOb2RlSXRlcmF0b3IoZWxlbWVudCwgTm9kZUZpbHRlci5TSE9XX1RFWFQpO1xuXHRcdFx0XHRcdFx0bGV0IHRleHRub2RlID0gaXRlci5uZXh0Tm9kZSgpO1xuXHRcdFx0XHRcdFx0aWYgKGVsZW1lbnQubG9jYWxOYW1lID09PSBcInBhcnNlcmVycm9yXCIpIHtcblx0XHRcdFx0XHRcdFx0aGFzUGFyc2VFcnJvciA9IHRydWU7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR3aGlsZSAodGV4dG5vZGUpIHtcblx0XHRcdFx0XHRcdFx0aWYgKHRleHRub2RlLnRleHRDb250ZW50ICYmIHRleHRub2RlLnRleHRDb250ZW50LnRyaW0oKS5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0XHRcdFx0aGFzRXJyb3IgPSB0ZXh0bm9kZS50ZXh0Q29udGVudDtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR0ZXh0bm9kZSA9IGl0ZXIubmV4dE5vZGUoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoaGFzUGFyc2VFcnJvcikge1xuXHRcdFx0XHRcdFx0Ly8gSWYgdGhlcmUgaXMgYSBwYXJzZWVycm9yIHdoaWxlIHByb2Nlc3NpbmcgdGhlIFhNTCBpdCBtZWFucyB0aGUgWE1MIGl0c2VsZiBpcyBtYWxmb3JtZWQsIGFzIHN1Y2ggd2UgcmVydW4gdGhlIHRlbXBsYXRlIHByb2Nlc3Ncblx0XHRcdFx0XHRcdC8vIFNldHRpbmcgaXNUcmFjZU1vZGUgdHJ1ZSB3aWxsIG1ha2UgaXQgc28gdGhhdCBlYWNoIHhtbGAgZXhwcmVzc2lvbiBpcyBjaGVja2VkIGZvciB2YWxpZGl0eSBmcm9tIFhNTCBwZXJzcGVjdGl2ZVxuXHRcdFx0XHRcdFx0Ly8gSWYgYW4gZXJyb3IgaXMgZm91bmQgaXQncyByZXR1cm5lZCBpbnN0ZWFkIG9mIHRoZSBub3JtYWwgZnJhZ21lbnRcblx0XHRcdFx0XHRcdExvZy5lcnJvcihcblx0XHRcdFx0XHRcdFx0YEVycm9yIHdoaWxlIHByb2Nlc3NpbmcgYnVpbGRpbmcgYmxvY2sgJHtidWlsZGluZ0Jsb2NrRGVmaW5pdGlvbi54bWxUYWcgfHwgYnVpbGRpbmdCbG9ja0RlZmluaXRpb24ubmFtZX1gXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0aXNUcmFjZU1vZGUgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRjb25zdCBpbml0aWFsVGVtcGxhdGUgPSBvSW5zdGFuY2U/LmdldFRlbXBsYXRlXG5cdFx0XHRcdFx0XHRcdFx0PyBhd2FpdCBvSW5zdGFuY2UuZ2V0VGVtcGxhdGUob05vZGUpXG5cdFx0XHRcdFx0XHRcdFx0OiBhd2FpdCBidWlsZGluZ0Jsb2NrRGVmaW5pdGlvbi5nZXRUZW1wbGF0ZSEocHJvY2Vzc2VkUHJvcGVydHlWYWx1ZXMpO1xuXHRcdFx0XHRcdFx0XHRwYXJzZWRUZW1wbGF0ZSA9IHBhcnNlWE1MU3RyaW5nKGluaXRpYWxUZW1wbGF0ZSwgdHJ1ZSk7XG5cdFx0XHRcdFx0XHR9IGZpbmFsbHkge1xuXHRcdFx0XHRcdFx0XHRpc1RyYWNlTW9kZSA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0gZWxzZSBpZiAoaGFzRXJyb3IubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdFx0Ly8gSWYgdGhlcmUgaXMgdHJhaWxpbmcgdGV4dCB3ZSBjcmVhdGUgYSBzdGFuZGFyZCBlcnJvciBhbmQgZGlzcGxheSBpdC5cblx0XHRcdFx0XHRcdExvZy5lcnJvcihcblx0XHRcdFx0XHRcdFx0YEVycm9yIHdoaWxlIHByb2Nlc3NpbmcgYnVpbGRpbmcgYmxvY2sgJHtidWlsZGluZ0Jsb2NrRGVmaW5pdGlvbi54bWxUYWcgfHwgYnVpbGRpbmdCbG9ja0RlZmluaXRpb24ubmFtZX1gXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0Y29uc3Qgb0Vycm9yVGV4dCA9IGNyZWF0ZUVycm9yWE1MKFxuXHRcdFx0XHRcdFx0XHRbXG5cdFx0XHRcdFx0XHRcdFx0YEVycm9yIHdoaWxlIHByb2Nlc3NpbmcgYnVpbGRpbmcgYmxvY2sgJHtidWlsZGluZ0Jsb2NrRGVmaW5pdGlvbi54bWxUYWcgfHwgYnVpbGRpbmdCbG9ja0RlZmluaXRpb24ubmFtZX1gLFxuXHRcdFx0XHRcdFx0XHRcdGBUcmFpbGluZyB0ZXh0IHdhcyBmb3VuZCBpbiB0aGUgWE1MOiAke2hhc0Vycm9yfWBcblx0XHRcdFx0XHRcdFx0XSxcblx0XHRcdFx0XHRcdFx0cGFyc2VkVGVtcGxhdGUubWFwKCh0ZW1wbGF0ZSkgPT4gdGVtcGxhdGUub3V0ZXJIVE1MKS5qb2luKFwiXFxuXCIpXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0cGFyc2VkVGVtcGxhdGUgPSBwYXJzZVhNTFN0cmluZyhvRXJyb3JUZXh0LCB0cnVlKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0b05vZGUucmVwbGFjZVdpdGgoLi4ucGFyc2VkVGVtcGxhdGUpO1xuXHRcdFx0XHRcdG9Ob2RlID0gb1BhcmVudC5jaGlsZHJlbltpQ2hpbGRJbmRleF07XG5cdFx0XHRcdFx0cHJvY2Vzc1Nsb3RzKG9BZ2dyZWdhdGlvbnMsIG9NZXRhZGF0YS5hZ2dyZWdhdGlvbnMsIG9Ob2RlLCBwcm9jZXNzQ3VzdG9tRGF0YSk7XG5cdFx0XHRcdFx0cHJvY2Vzc0N1c3RvbURhdGEgPSBmYWxzZTtcblx0XHRcdFx0XHRvUHJvbWlzZSA9IG9Db250ZXh0VmlzaXRvci52aXNpdE5vZGUob05vZGUpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG9Ob2RlLnJlbW92ZSgpO1xuXHRcdFx0XHRcdG9Qcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKCk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG9Qcm9taXNlID0gb0NvbnRleHRWaXNpdG9yLmluc2VydEZyYWdtZW50KHNGcmFnbWVudE5hbWUsIG9Ob2RlKTtcblx0XHRcdH1cblxuXHRcdFx0YXdhaXQgb1Byb21pc2U7XG5cdFx0XHRjb25zdCBvTWFjcm9FbGVtZW50ID0gb1BhcmVudC5jaGlsZHJlbltpQ2hpbGRJbmRleF07XG5cdFx0XHRwcm9jZXNzU2xvdHMob0FnZ3JlZ2F0aW9ucywgb01ldGFkYXRhLmFnZ3JlZ2F0aW9ucywgb01hY3JvRWxlbWVudCwgcHJvY2Vzc0N1c3RvbURhdGEpO1xuXHRcdFx0aWYgKG9NYWNyb0VsZW1lbnQgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRjb25zdCBvUmVtYWluaW5nU2xvdHMgPSBvTWFjcm9FbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJzbG90XCIpO1xuXHRcdFx0XHRvUmVtYWluaW5nU2xvdHMuZm9yRWFjaChmdW5jdGlvbiAob1Nsb3RFbGVtZW50KSB7XG5cdFx0XHRcdFx0b1Nsb3RFbGVtZW50LnJlbW92ZSgpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKG9QcmV2aW91c01hY3JvSW5mbykge1xuXHRcdFx0Ly9yZXN0b3JlIG1hY3JvIGluZm8gaWYgYXZhaWxhYmxlXG5cdFx0XHRvU2V0dGluZ3NbXCJfbWFjcm9JbmZvXCJdID0gb1ByZXZpb3VzTWFjcm9JbmZvO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRkZWxldGUgb1NldHRpbmdzW1wiX21hY3JvSW5mb1wiXTtcblx0XHR9XG5cdH0gY2F0Y2ggKGU6IHVua25vd24pIHtcblx0XHQvLyBJbiBjYXNlIHRoZXJlIGlzIGEgZ2VuZXJpYyBlcnJvciAodXN1YWxseSBjb2RlIGVycm9yKSwgd2UgcmV0cmlldmUgdGhlIGN1cnJlbnQgY29udGV4dCBpbmZvcm1hdGlvbiBhbmQgY3JlYXRlIGEgZGVkaWNhdGVkIGVycm9yIG1lc3NhZ2Vcblx0XHRjb25zdCB0cmFjZURldGFpbHMgPSB7XG5cdFx0XHRpbml0aWFsUHJvcGVydGllczoge30gYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4sXG5cdFx0XHRyZXNvbHZlZFByb3BlcnRpZXM6IHt9IGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+LFxuXHRcdFx0bWlzc2luZ0NvbnRleHRzOiBtTWlzc2luZ0NvbnRleHRcblx0XHR9O1xuXHRcdGZvciAoY29uc3QgcHJvcGVydHlOYW1lIG9mIGluaXRpYWxLZXlzKSB7XG5cdFx0XHRjb25zdCBwcm9wZXJ0eVZhbHVlID0gcHJvcGVydHlWYWx1ZXNbcHJvcGVydHlOYW1lXTtcblx0XHRcdGlmIChpc0NvbnRleHQocHJvcGVydHlWYWx1ZSkpIHtcblx0XHRcdFx0dHJhY2VEZXRhaWxzLmluaXRpYWxQcm9wZXJ0aWVzW3Byb3BlcnR5TmFtZV0gPSB7XG5cdFx0XHRcdFx0cGF0aDogcHJvcGVydHlWYWx1ZS5nZXRQYXRoKCksXG5cdFx0XHRcdFx0dmFsdWU6IHByb3BlcnR5VmFsdWUuZ2V0T2JqZWN0KClcblx0XHRcdFx0fTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRyYWNlRGV0YWlscy5pbml0aWFsUHJvcGVydGllc1twcm9wZXJ0eU5hbWVdID0gcHJvcGVydHlWYWx1ZTtcblx0XHRcdH1cblx0XHR9XG5cdFx0Zm9yIChjb25zdCBwcm9wZXJ0eU5hbWUgaW4gcHJvcGVydHlWYWx1ZXMpIHtcblx0XHRcdGNvbnN0IHByb3BlcnR5VmFsdWUgPSBwcm9wZXJ0eVZhbHVlc1twcm9wZXJ0eU5hbWVdO1xuXHRcdFx0aWYgKCFpbml0aWFsS2V5cy5pbmNsdWRlcyhwcm9wZXJ0eU5hbWUpKSB7XG5cdFx0XHRcdGlmIChpc0NvbnRleHQocHJvcGVydHlWYWx1ZSkpIHtcblx0XHRcdFx0XHR0cmFjZURldGFpbHMucmVzb2x2ZWRQcm9wZXJ0aWVzW3Byb3BlcnR5TmFtZV0gPSB7XG5cdFx0XHRcdFx0XHRwYXRoOiBwcm9wZXJ0eVZhbHVlLmdldFBhdGgoKSxcblx0XHRcdFx0XHRcdHZhbHVlOiBwcm9wZXJ0eVZhbHVlLmdldE9iamVjdCgpXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0cmFjZURldGFpbHMucmVzb2x2ZWRQcm9wZXJ0aWVzW3Byb3BlcnR5TmFtZV0gPSBwcm9wZXJ0eVZhbHVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdExvZy5lcnJvcihlIGFzIHN0cmluZyk7XG5cdFx0Y29uc3Qgb0Vycm9yID0gY3JlYXRlRXJyb3JYTUwoXG5cdFx0XHRbYEVycm9yIHdoaWxlIHByb2Nlc3NpbmcgYnVpbGRpbmcgYmxvY2sgJHtidWlsZGluZ0Jsb2NrRGVmaW5pdGlvbi5uYW1lfWBdLFxuXHRcdFx0b05vZGUub3V0ZXJIVE1MLFxuXHRcdFx0dHJhY2VEZXRhaWxzLFxuXHRcdFx0KGUgYXMgRXJyb3IpLnN0YWNrXG5cdFx0KTtcblx0XHRjb25zdCBvVGVtcGxhdGUgPSBwYXJzZVhNTFN0cmluZyhvRXJyb3IsIHRydWUpO1xuXHRcdG9Ob2RlLnJlcGxhY2VXaXRoKC4uLm9UZW1wbGF0ZSk7XG5cdH1cbn1cbmZ1bmN0aW9uIGFkZFNpbmdsZUNvbnRleHQoXG5cdG1Db250ZXh0czogUmVjb3JkPHN0cmluZywgQ29udGV4dCB8IHVuZGVmaW5lZD4sXG5cdG9WaXNpdG9yOiBJVmlzaXRvckNhbGxiYWNrLFxuXHRvQ3R4OiB7XG5cdFx0bmFtZT86IHN0cmluZztcblx0XHRwYXRoOiBzdHJpbmc7XG5cdFx0bW9kZWw/OiBzdHJpbmc7XG5cdH0sXG5cdG9NZXRhZGF0YUNvbnRleHRzOiBSZWNvcmQ8c3RyaW5nLCBDb250ZXh0IHwgdW5kZWZpbmVkPlxuKSB7XG5cdGNvbnN0IHNLZXkgPSAob0N0eC5uYW1lIHx8IG9DdHgubW9kZWwgfHwgdW5kZWZpbmVkKSBhcyBzdHJpbmc7XG5cdGlmIChvTWV0YWRhdGFDb250ZXh0c1tzS2V5XSkge1xuXHRcdHJldHVybjsgLy8gZG8gbm90IGFkZCB0d2ljZVxuXHR9XG5cdHRyeSB7XG5cdFx0bGV0IHNDb250ZXh0UGF0aCA9IG9DdHgucGF0aDtcblx0XHRpZiAob0N0eC5tb2RlbCAhPT0gbnVsbCkge1xuXHRcdFx0c0NvbnRleHRQYXRoID0gYCR7b0N0eC5tb2RlbH0+JHtzQ29udGV4dFBhdGh9YDtcblx0XHR9XG5cdFx0Y29uc3QgbVNldHRpbmcgPSBvVmlzaXRvci5nZXRTZXR0aW5ncygpO1xuXHRcdGlmIChvQ3R4Lm1vZGVsID09PSBcImNvbnZlcnRlckNvbnRleHRcIiAmJiBvQ3R4LnBhdGgubGVuZ3RoID4gMCkge1xuXHRcdFx0bUNvbnRleHRzW3NLZXldID0gbVNldHRpbmcubW9kZWxzW29DdHgubW9kZWxdLmdldENvbnRleHQob0N0eC5wYXRoIC8qLCBtU2V0dGluZy5iaW5kaW5nQ29udGV4dHNbb0N0eC5tb2RlbF0qLyk7IC8vIGFkZCB0aGUgY29udGV4dCB0byB0aGUgdmlzaXRvclxuXHRcdH0gZWxzZSBpZiAoIW1TZXR0aW5nLmJpbmRpbmdDb250ZXh0c1tvQ3R4Lm1vZGVsIV0gJiYgbVNldHRpbmcubW9kZWxzW29DdHgubW9kZWwhXSkge1xuXHRcdFx0bUNvbnRleHRzW3NLZXldID0gbVNldHRpbmcubW9kZWxzW29DdHgubW9kZWwhXS5nZXRDb250ZXh0KG9DdHgucGF0aCk7IC8vIGFkZCB0aGUgY29udGV4dCB0byB0aGUgdmlzaXRvclxuXHRcdH0gZWxzZSB7XG5cdFx0XHRtQ29udGV4dHNbc0tleV0gPSBvVmlzaXRvci5nZXRDb250ZXh0KHNDb250ZXh0UGF0aCk7IC8vIGFkZCB0aGUgY29udGV4dCB0byB0aGUgdmlzaXRvclxuXHRcdH1cblxuXHRcdG9NZXRhZGF0YUNvbnRleHRzW3NLZXldID0gbUNvbnRleHRzW3NLZXldOyAvLyBtYWtlIGl0IGF2YWlsYWJsZSBpbnNpZGUgbWV0YWRhdGFDb250ZXh0cyBKU09OIG9iamVjdFxuXHR9IGNhdGNoIChleCkge1xuXHRcdC8vY29uc29sZS5lcnJvcihleCk7XG5cdFx0Ly8gaWdub3JlIHRoZSBjb250ZXh0IGFzIHRoaXMgY2FuIG9ubHkgYmUgdGhlIGNhc2UgaWYgdGhlIG1vZGVsIGlzIG5vdCByZWFkeSwgaS5lLiBub3QgYSBwcmVwcm9jZXNzaW5nIG1vZGVsIGJ1dCBtYXliZSBhIG1vZGVsIGZvclxuXHRcdC8vIHByb3ZpZGluZyBhZnRlcndhcmRzXG5cdFx0Ly8gVE9ETyAwMDAyIG5vdCB5ZXQgaW1wbGVtZW50ZWRcblx0XHQvL21Db250ZXh0c1tcIl8kZXJyb3JcIl0ub01vZGVsLnNldFByb3BlcnR5KFwiL1wiICsgc0tleSwgZXgpO1xuXHR9XG59XG5cbi8qKlxuICogUmVnaXN0ZXIgYSBidWlsZGluZyBibG9jayBkZWZpbml0aW9uIHRvIGJlIHVzZWQgaW5zaWRlIHRoZSB4bWwgdGVtcGxhdGUgcHJvY2Vzc29yLlxuICpcbiAqIEBwYXJhbSBidWlsZGluZ0Jsb2NrRGVmaW5pdGlvbiBUaGUgYnVpbGRpbmcgYmxvY2sgZGVmaW5pdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJCdWlsZGluZ0Jsb2NrKGJ1aWxkaW5nQmxvY2tEZWZpbml0aW9uOiBCdWlsZGluZ0Jsb2NrRGVmaW5pdGlvbik6IHZvaWQge1xuXHRYTUxQcmVwcm9jZXNzb3IucGx1Z0luKFxuXHRcdGFzeW5jIChvTm9kZTogRWxlbWVudCwgb1Zpc2l0b3I6IElWaXNpdG9yQ2FsbGJhY2spID0+IHByb2Nlc3NCdWlsZGluZ0Jsb2NrKGJ1aWxkaW5nQmxvY2tEZWZpbml0aW9uLCBvTm9kZSwgb1Zpc2l0b3IpLFxuXHRcdGJ1aWxkaW5nQmxvY2tEZWZpbml0aW9uLm5hbWVzcGFjZSxcblx0XHRidWlsZGluZ0Jsb2NrRGVmaW5pdGlvbi54bWxUYWcgfHwgYnVpbGRpbmdCbG9ja0RlZmluaXRpb24ubmFtZVxuXHQpO1xuXHRpZiAoYnVpbGRpbmdCbG9ja0RlZmluaXRpb24ucHVibGljTmFtZXNwYWNlKSB7XG5cdFx0WE1MUHJlcHJvY2Vzc29yLnBsdWdJbihcblx0XHRcdGFzeW5jIChvTm9kZTogRWxlbWVudCwgb1Zpc2l0b3I6IElWaXNpdG9yQ2FsbGJhY2spID0+IHByb2Nlc3NCdWlsZGluZ0Jsb2NrKGJ1aWxkaW5nQmxvY2tEZWZpbml0aW9uLCBvTm9kZSwgb1Zpc2l0b3IsIHRydWUpLFxuXHRcdFx0YnVpbGRpbmdCbG9ja0RlZmluaXRpb24ucHVibGljTmFtZXNwYWNlLFxuXHRcdFx0YnVpbGRpbmdCbG9ja0RlZmluaXRpb24ueG1sVGFnIHx8IGJ1aWxkaW5nQmxvY2tEZWZpbml0aW9uLm5hbWVcblx0XHQpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUVycm9yWE1MKGVycm9yTWVzc2FnZXM6IHN0cmluZ1tdLCB4bWxGcmFnbWVudDogc3RyaW5nLCBhZGRpdGlvbmFsRGF0YT86IG9iamVjdCwgc3RhY2s/OiBzdHJpbmcpOiBzdHJpbmcge1xuXHRjb25zdCBlcnJvckxhYmVscyA9IGVycm9yTWVzc2FnZXMubWFwKChlcnJvck1lc3NhZ2UpID0+IHhtbGA8bTpMYWJlbCB0ZXh0PVwiJHtlc2NhcGVYTUxBdHRyaWJ1dGVWYWx1ZShlcnJvck1lc3NhZ2UpfVwiLz5gKTtcblx0bGV0IGVycm9yU3RhY2sgPSBcIlwiO1xuXHRpZiAoc3RhY2spIHtcblx0XHRjb25zdCBzdGFja0Zvcm1hdHRlZCA9IGJ0b2EoYDxwcmU+JHtzdGFja308L3ByZT5gKTtcblx0XHRlcnJvclN0YWNrID0geG1sYDxtOkZvcm1hdHRlZFRleHQgaHRtbFRleHQ9XCIke2B7PSBCQkYuYmFzZTY0RGVjb2RlKCcke3N0YWNrRm9ybWF0dGVkfScpIH1gfVwiIC8+YDtcblx0fVxuXHRsZXQgYWRkaXRpb25hbFRleHQgPSBcIlwiO1xuXHRpZiAoYWRkaXRpb25hbERhdGEpIHtcblx0XHRhZGRpdGlvbmFsVGV4dCA9IHhtbGA8bTpWQm94PlxuXHRcdFx0XHRcdFx0PG06TGFiZWwgdGV4dD1cIlRyYWNlIEluZm9cIi8+XG5cdFx0XHRcdFx0XHQ8Y29kZTpDb2RlRWRpdG9yIHR5cGU9XCJqc29uXCIgIHZhbHVlPVwiJHtgez0gQkJGLmJhc2U2NERlY29kZSgnJHtidG9hKEpTT04uc3RyaW5naWZ5KGFkZGl0aW9uYWxEYXRhLCBudWxsLCA0KSl9JykgfWB9XCIgaGVpZ2h0PVwiMzAwcHhcIiAvPlxuXHRcdFx0XHRcdDwvbTpWQm94PmA7XG5cdH1cblx0cmV0dXJuIHhtbGA8bTpWQm94IHhtbG5zOm09XCJzYXAubVwiIHhtbG5zOmNvZGU9XCJzYXAudWkuY29kZWVkaXRvclwiIGNvcmU6cmVxdWlyZT1cIntCQkY6J3NhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tGb3JtYXR0ZXInfVwiPlxuXHRcdFx0XHQke2Vycm9yTGFiZWxzfVxuXHRcdFx0XHQke2Vycm9yU3RhY2t9XG5cdFx0XHRcdDxncmlkOkNTU0dyaWQgZ3JpZFRlbXBsYXRlUm93cz1cImZyXCIgZ3JpZFRlbXBsYXRlQ29sdW1ucz1cInJlcGVhdCgyLDFmcilcIiBncmlkR2FwPVwiMXJlbVwiIHhtbG5zOmdyaWQ9XCJzYXAudWkubGF5b3V0LmNzc2dyaWRcIiA+XG5cdFx0XHRcdFx0PG06VkJveD5cblx0XHRcdFx0XHRcdDxtOkxhYmVsIHRleHQ9XCJIb3cgdGhlIGJ1aWxkaW5nIGJsb2NrIHdhcyBjYWxsZWRcIi8+XG5cdFx0XHRcdFx0XHQ8Y29kZTpDb2RlRWRpdG9yIHR5cGU9XCJ4bWxcIiB2YWx1ZT1cIiR7YHs9IEJCRi5iYXNlNjREZWNvZGUoJyR7YnRvYSh4bWxGcmFnbWVudC5yZXBsYWNlQWxsKFwiJmd0O1wiLCBcIj5cIikpfScpIH1gfVwiIGhlaWdodD1cIjMwMHB4XCIgLz5cblx0XHRcdFx0XHQ8L206VkJveD5cblx0XHRcdFx0XHQke2FkZGl0aW9uYWxUZXh0fVxuXHRcdFx0XHQ8L2dyaWQ6Q1NTR3JpZD5cblx0XHRcdDwvbTpWQm94PmA7XG59XG5cbmNvbnN0IG15U3RvcmU6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0ge307XG5mdW5jdGlvbiBzdG9yZVZhbHVlKHZhbHVlczogdW5rbm93bikge1xuXHRjb25zdCBwcm9wZXJ0eVVJRCA9IGAvdWlkLS0ke3VpZCgpfWA7XG5cdG15U3RvcmVbcHJvcGVydHlVSURdID0gdmFsdWVzO1xuXHRyZXR1cm4gcHJvcGVydHlVSUQ7XG59XG5cbi8qKlxuICogUGFyc2UgYW4gWE1MIHN0cmluZyBhbmQgcmV0dXJuIHRoZSBhc3NvY2lhdGVkIGRvY3VtZW50LlxuICpcbiAqIEBwYXJhbSB4bWxTdHJpbmcgVGhlIHhtbCBzdHJpbmdcbiAqIEBwYXJhbSBbYWRkRGVmYXVsdE5hbWVzcGFjZXNdIFdoZXRoZXIgb3Igbm90IGRlZmF1bHQgbmFtZXNwYWNlcyBzaG91bGQgYmUgYWRkZWRcbiAqIEByZXR1cm5zIFRoZSBYTUwgZG9jdW1lbnQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVhNTFN0cmluZyh4bWxTdHJpbmc6IHN0cmluZywgYWRkRGVmYXVsdE5hbWVzcGFjZXMgPSBmYWxzZSk6IEVsZW1lbnRbXSB7XG5cdGlmIChhZGREZWZhdWx0TmFtZXNwYWNlcykge1xuXHRcdHhtbFN0cmluZyA9IGA8dGVtcGxhdGVcblx0XHRcdFx0XHRcdHhtbG5zOnRlbXBsYXRlPVwiaHR0cDovL3NjaGVtYXMuc2FwLmNvbS9zYXB1aTUvZXh0ZW5zaW9uL3NhcC51aS5jb3JlLnRlbXBsYXRlLzFcIlxuXHRcdFx0XHRcdFx0eG1sbnM6bT1cInNhcC5tXCJcblx0XHRcdFx0XHRcdHhtbG5zOm1hY3Jvcz1cInNhcC5mZS5tYWNyb3NcIlxuXHRcdFx0XHRcdFx0eG1sbnM6Y29yZT1cInNhcC51aS5jb3JlXCJcblx0XHRcdFx0XHRcdHhtbG5zOm1kYz1cInNhcC51aS5tZGNcIlxuXHRcdFx0XHRcdFx0eG1sbnM6Y3VzdG9tRGF0YT1cImh0dHA6Ly9zY2hlbWFzLnNhcC5jb20vc2FwdWk1L2V4dGVuc2lvbi9zYXAudWkuY29yZS5DdXN0b21EYXRhLzFcIj4ke3htbFN0cmluZ308L3RlbXBsYXRlPmA7XG5cdH1cblx0Y29uc3QgeG1sRG9jdW1lbnQgPSBET01QYXJzZXJJbnN0YW5jZS5wYXJzZUZyb21TdHJpbmcoeG1sU3RyaW5nLCBcInRleHQveG1sXCIpO1xuXHRsZXQgb3V0cHV0ID0geG1sRG9jdW1lbnQuZmlyc3RFbGVtZW50Q2hpbGQ7XG5cdHdoaWxlIChvdXRwdXQ/LmxvY2FsTmFtZSA9PT0gXCJ0ZW1wbGF0ZVwiKSB7XG5cdFx0b3V0cHV0ID0gb3V0cHV0LmZpcnN0RWxlbWVudENoaWxkO1xuXHR9XG5cdGNvbnN0IGNoaWxkcmVuID0gb3V0cHV0Py5wYXJlbnRFbGVtZW50ID8gb3V0cHV0Py5wYXJlbnRFbGVtZW50LmNoaWxkcmVuIDogW291dHB1dCBhcyBFbGVtZW50XTtcblx0cmV0dXJuIEFycmF5LmZyb20oY2hpbGRyZW4pO1xufVxuXG4vKipcbiAqIEVzY2FwZSBhbiBYTUwgYXR0cmlidXRlIHZhbHVlLlxuICpcbiAqIEBwYXJhbSB2YWx1ZSBUaGUgYXR0cmlidXRlIHZhbHVlIHRvIGVzY2FwZS5cbiAqIEByZXR1cm5zIFRoZSBlc2NhcGVkIHN0cmluZy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVzY2FwZVhNTEF0dHJpYnV0ZVZhbHVlKHZhbHVlPzogc3RyaW5nKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0cmV0dXJuIHZhbHVlPy5yZXBsYWNlKC8mL2csIFwiJmFtcDtcIikucmVwbGFjZSgvPC9nLCBcIiZsdDtcIikucmVwbGFjZSgvXCIvZywgXCImcXVvdDtcIikucmVwbGFjZSgvJy9nLCBcIiZhcG9zO1wiKTtcbn1cblxuZnVuY3Rpb24gcmVuZGVySW5UcmFjZU1vZGUob3V0U3RyOiBzdHJpbmcpIHtcblx0Y29uc3QgeG1sUmVzdWx0ID0gcGFyc2VYTUxTdHJpbmcob3V0U3RyLCB0cnVlKTtcblx0aWYgKHhtbFJlc3VsdD8ubGVuZ3RoID4gMCAmJiB4bWxSZXN1bHRbMF0/LmxvY2FsTmFtZSA9PT0gXCJwYXJzZXJlcnJvclwiKSB7XG5cdFx0Y29uc3QgZXJyb3JNZXNzYWdlID0gKHhtbFJlc3VsdFswXSBhcyBIVE1MRWxlbWVudCkuaW5uZXJUZXh0IHx8ICh4bWxSZXN1bHRbMF0gYXMgSFRNTEVsZW1lbnQpLmlubmVySFRNTDtcblx0XHRyZXR1cm4gY3JlYXRlRXJyb3JYTUwoW2Vycm9yTWVzc2FnZS5zcGxpdChcIlxcblwiKVswXV0sIG91dFN0cik7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIG91dFN0cjtcblx0fVxufVxuXG5leHBvcnQgdHlwZSBYTUxQcm9jZXNzb3JUeXBlVmFsdWUgPVxuXHR8IHN0cmluZ1xuXHR8IGJvb2xlYW5cblx0fCBudW1iZXJcblx0fCB1bmRlZmluZWRcblx0fCBudWxsXG5cdHwgb2JqZWN0XG5cdHwgUmVjb3JkPHN0cmluZywgdW5rbm93bj5cblx0fCBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248c3RyaW5nIHwgYm9vbGVhbiB8IG51bWJlcj5cblx0fCBBcnJheTxzdHJpbmc+XG5cdHwgQXJyYXk8RnVuY3Rpb24+XG5cdHwgRnVuY3Rpb25cblx0fCBDb250ZXh0O1xuLyoqXG4gKiBDcmVhdGUgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHRlbXBsYXRlIGxpdGVyYWwgd2hpbGUgaGFuZGxpbmcgc3BlY2lhbCBvYmplY3QgY2FzZS5cbiAqXG4gKiBAcGFyYW0gc3RyaW5ncyBUaGUgc3RyaW5nIHBhcnRzIG9mIHRoZSB0ZW1wbGF0ZSBsaXRlcmFsXG4gKiBAcGFyYW0gdmFsdWVzIFRoZSB2YWx1ZXMgcGFydCBvZiB0aGUgdGVtcGxhdGUgbGl0ZXJhbFxuICogQHJldHVybnMgVGhlIFhNTCBzdHJpbmcgZG9jdW1lbnQgcmVwcmVzZW50aW5nIHRoZSBzdHJpbmcgdGhhdCB3YXMgdXNlZC5cbiAqL1xuZXhwb3J0IGNvbnN0IHhtbCA9IChzdHJpbmdzOiBUZW1wbGF0ZVN0cmluZ3NBcnJheSwgLi4udmFsdWVzOiBYTUxQcm9jZXNzb3JUeXBlVmFsdWVbXSkgPT4ge1xuXHRsZXQgb3V0U3RyID0gXCJcIjtcblx0bGV0IGk7XG5cdGZvciAoaSA9IDA7IGkgPCB2YWx1ZXMubGVuZ3RoOyBpKyspIHtcblx0XHRvdXRTdHIgKz0gc3RyaW5nc1tpXTtcblxuXHRcdC8vIEhhbmRsZSB0aGUgZGlmZmVyZW50IGNhc2Ugb2Ygb2JqZWN0LCBpZiBpdCdzIGFuIGFycmF5IHdlIGpvaW4gdGhlbSwgaWYgaXQncyBhIGJpbmRpbmcgZXhwcmVzc2lvbiB0aGVuIHdlIGNvbXBpbGUgaXQuXG5cdFx0Y29uc3QgdmFsdWUgPSB2YWx1ZXNbaV07XG5cblx0XHRpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkgJiYgdmFsdWUubGVuZ3RoID4gMCAmJiB0eXBlb2YgdmFsdWVbMF0gPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdG91dFN0ciArPSB2YWx1ZS5mbGF0KDUpLmpvaW4oXCJcXG5cIikudHJpbSgpO1xuXHRcdH0gZWxzZSBpZiAoaXNGdW5jdGlvbkFycmF5KHZhbHVlKSkge1xuXHRcdFx0b3V0U3RyICs9IHZhbHVlLm1hcCgodmFsdWVmbikgPT4gdmFsdWVmbigpKS5qb2luKFwiXFxuXCIpO1xuXHRcdH0gZWxzZSBpZiAoaXNCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24odmFsdWUpKSB7XG5cdFx0XHRjb25zdCBjb21waWxlZEV4cHJlc3Npb24gPSBjb21waWxlRXhwcmVzc2lvbih2YWx1ZSk7XG5cdFx0XHRvdXRTdHIgKz0gZXNjYXBlWE1MQXR0cmlidXRlVmFsdWUoY29tcGlsZWRFeHByZXNzaW9uKTtcblx0XHR9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJ1bmRlZmluZWRcIikge1xuXHRcdFx0b3V0U3RyICs9IFwie3RoaXM+dW5kZWZpbmVkVmFsdWV9XCI7XG5cdFx0fSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0b3V0U3RyICs9IHZhbHVlKCk7XG5cdFx0fSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIgJiYgdmFsdWUgIT09IG51bGwpIHtcblx0XHRcdGlmIChpc0NvbnRleHQodmFsdWUpKSB7XG5cdFx0XHRcdG91dFN0ciArPSB2YWx1ZS5nZXRQYXRoKCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCBwcm9wZXJ0eVVJZCA9IHN0b3JlVmFsdWUodmFsdWUpO1xuXHRcdFx0XHRvdXRTdHIgKz0gYCR7cHJvcGVydHlVSWR9YDtcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIiAmJiAhdmFsdWUuc3RhcnRzV2l0aChcIjxcIikgJiYgIXZhbHVlLnN0YXJ0c1dpdGgoXCImbHQ7XCIpKSB7XG5cdFx0XHRvdXRTdHIgKz0gZXNjYXBlWE1MQXR0cmlidXRlVmFsdWUodmFsdWUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRvdXRTdHIgKz0gdmFsdWU7XG5cdFx0fVxuXHR9XG5cdG91dFN0ciArPSBzdHJpbmdzW2ldO1xuXHRvdXRTdHIgPSBvdXRTdHIudHJpbSgpO1xuXHRpZiAoaXNUcmFjZU1vZGUpIHtcblx0XHRyZXR1cm4gcmVuZGVySW5UcmFjZU1vZGUob3V0U3RyKTtcblx0fVxuXHRyZXR1cm4gb3V0U3RyO1xufTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7OztFQWtDQSxNQUFNQSxZQUFZLEdBQUcsaURBQWlEO0VBQ3RFLE1B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