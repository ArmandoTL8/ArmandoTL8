import type ResourceBundle from "sap/base/i18n/ResourceBundle";
import Log from "sap/base/Log";
import deepClone from "sap/base/util/deepClone";
import uid from "sap/base/util/uid";
import type AppComponent from "sap/fe/core/AppComponent";
import AttributeModel from "sap/fe/core/buildingBlocks/AttributeModel";
import type {
	BuildingBlockAggregationDefinition,
	BuildingBlockBase,
	BuildingBlockDefinition,
	BuildingBlockDefinitionV1,
	BuildingBlockMetadata,
	BuildingBlockMetadataContextDefinition,
	BuildingBlockPropertyDefinition,
	ObjectValue,
	ObjectValue2
} from "sap/fe/core/buildingBlocks/BuildingBlock";
import type { Position } from "sap/fe/core/converters/helpers/ConfigurableObject";
import { Placement } from "sap/fe/core/converters/helpers/ConfigurableObject";
import type { BindingToolkitExpression } from "sap/fe/core/helpers/BindingToolkit";
import { compileExpression, isBindingToolkitExpression } from "sap/fe/core/helpers/BindingToolkit";
import { isContext, isFunctionArray } from "sap/fe/core/helpers/TypeGuards";
import ResourceModel from "sap/fe/macros/ResourceModel";
import BindingParser from "sap/ui/base/BindingParser";
import type Control from "sap/ui/core/Control";
import XMLPreprocessor from "sap/ui/core/util/XMLPreprocessor";
import type Context from "sap/ui/model/Context";
import type JSONModel from "sap/ui/model/json/JSONModel";
import type Model from "sap/ui/model/Model";
import type ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";
import type _ResourceModel from "sap/ui/model/resource/ResourceModel";
import type { MacroInfo, TraceMetadataContext } from "./TraceInfo";
import TraceInfo from "./TraceInfo";

const LOGGER_SCOPE = "sap.fe.core.buildingBlocks.BuildingBlockRuntime";
const XMLTEMPLATING_NS = "http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1";
const DOMParserInstance = new DOMParser();
let isTraceMode = false;

export type ResolvedBuildingBlockMetadata = {
	properties: Record<string, BuildingBlockPropertyDefinition>;
	aggregations: Record<string, BuildingBlockAggregationDefinition>;
	metadataContexts: Record<string, BuildingBlockMetadataContextDefinition>;
	isOpen: boolean;
	defaultAggregation?: string;
};

/**
 * Definition of a meta data context
 */
type MetaDataContext = {
	name?: string;
	model: string;
	path: string;
};

export type TemplateProcessorSettings = {
	currentContextPath: Context;
	isPublic: boolean;
	appComponent: AppComponent;
	models: Record<string, Model> & {
		converterContext: JSONModel;
		viewData: JSONModel;
		metaModel: ODataMetaModel;
		"sap.fe.i18n"?: _ResourceModel;
	};
	bindingContexts: Record<string, Context>;
	_macroInfo?: MacroInfo;
	[k: string]: unknown;
};

export type IVisitorCallback = {
	getSettings(): TemplateProcessorSettings;
	/**
	 * Visits the given node and either processes a template instruction, calls
	 * a visitor, or simply calls both {@link
	 * sap.ui.core.util.XMLPreprocessor.ICallback.visitAttributes visitAttributes}
	 * and {@link sap.ui.core.util.XMLPreprocessor.ICallback.visitChildNodes
	 * visitChildNodes}.
	 *
	 * @param {Node} oNode
	 *   The XML DOM node
	 * @returns {sap.ui.base.SyncPromise}
	 *   A thenable which resolves with <code>undefined</code> as soon as visiting
	 *   is done, or is rejected with a corresponding error if visiting fails
	 */
	visitNode(oNode: Node): Promise<void>;

	/**
	 * Inserts the fragment with the given name in place of the given element. Loads the
	 * fragment, takes care of caching (for the current pre-processor run) and visits the
	 * fragment's content once it has been imported into the element's owner document and
	 * put into place. Loading of fragments is asynchronous if the template view is
	 * asynchronous.
	 *
	 * @param {string} sFragmentName
	 *   the fragment's resolved name
	 * @param {Element} oElement
	 *   the XML DOM element, e.g. <sap.ui.core:Fragment> or <core:ExtensionPoint>
	 * @param {sap.ui.core.util._with} oWithControl
	 *   the parent's "with" control
	 * @returns {sap.ui.base.SyncPromise}
	 * A sync promise which resolves with <code>undefined</code> as soon as the fragment
	 *   has been inserted, or is rejected with a corresponding error if loading or visiting
	 *   fails.
	 */
	insertFragment(sFragment: string, oElement: Element, oWith?: Control): Promise<void>;
	visitAttribute(oNode: Element, oAttribute: Attr): Promise<void>;
	visitAttributes(oNode: Element): Promise<void>;
	getViewInfo(): Promise<unknown>;
	visitChildNodes(oNode: Node): Promise<void>;
	/**
	 * Interprets the given XML DOM attribute value as a binding and returns the
	 * resulting value.
	 *
	 * @param {string} sValue
	 *   An XML DOM attribute value
	 * @param {Element} [oElement]
	 *   The XML DOM element the attribute value belongs to (needed only for
	 *   warnings which are logged to the console)
	 * @returns {sap.ui.base.SyncPromise|null}
	 *   A thenable which resolves with the resulting value, or is rejected with a
	 *   corresponding error (for example, an error thrown by a formatter) or
	 *   <code>null</code> in case the binding is not ready (because it refers to a
	 *   model which is not available) (since 1.57.0)
	 */
	getResult(sValue: string, element?: Element): Promise<Context> | null;
	getContext(sPath?: string): Context | undefined;
	/**
	 * Returns a callback interface instance for the given map of variables which
	 * override currently known variables of the same name in <code>this</code>
	 * parent interface or replace them altogether. Each variable name becomes a
	 * named model with a corresponding object binding and can be used inside the
	 * XML template in the usual way, that is, with a binding expression like
	 * <code>"{var>some/relative/path}"</code> (see example).
	 *
	 * @param {object} [mVariables={}]
	 *   Map from variable name (string) to value ({@link sap.ui.model.Context})
	 * @param {boolean} [bReplace]
	 *   Whether only the given variables are known in the new callback interface
	 *   instance, no inherited ones
	 * @returns {sap.ui.core.util.XMLPreprocessor.ICallback}
	 *   A callback interface instance
	 * @param mVariables
	 * @param bReplace
	 */
	"with"(mVariables?: Record<string, Context>, bReplace?: boolean): IVisitorCallback;
};

/**
 * Typeguard for checking if a building block uses API 1.
 *
 * @param buildingBlockDefinition
 * @returns `true` if the building block is using API 1.
 */
function isV1MacroDef(buildingBlockDefinition: BuildingBlockDefinition): buildingBlockDefinition is BuildingBlockDefinitionV1 {
	return buildingBlockDefinition.apiVersion === undefined || buildingBlockDefinition.apiVersion === 1;
}

function validateMacroMetadataContext(
	sName: string,
	mContexts: Record<string, Context>,
	oContextSettings: BuildingBlockMetadataContextDefinition,
	sKey: string
) {
	const oContext = mContexts[sKey];
	const oContextObject = oContext?.getObject() as {
		$Type?: string;
		$kind?: string;
	};

	if (oContextSettings.required === true && (!oContext || oContextObject === null)) {
		throw new Error(`${sName}: Required metadataContext '${sKey}' is missing`);
	} else if (oContextObject) {
		// If context object has $kind property, $Type should not be checked
		// Therefore remove from context settings
		if (oContextObject.hasOwnProperty("$kind") && oContextObject.$kind !== undefined && oContextSettings.$kind !== undefined) {
			// Check if the $kind is part of the allowed ones
			if (oContextSettings.$kind.indexOf(oContextObject.$kind) === -1) {
				throw new Error(
					`${sName}: '${sKey}' must be '$kind' '${oContextSettings["$kind"]}' but is '${
						oContextObject.$kind
					}': ${oContext.getPath()}`
				);
			}
		} else if (oContextObject.hasOwnProperty("$Type") && oContextObject.$Type !== undefined && oContextSettings.$Type) {
			// Check only $Type
			if (oContextSettings.$Type.indexOf(oContextObject.$Type) === -1) {
				throw new Error(
					`${sName}: '${sKey}' must be '$Type' '${oContextSettings["$Type"]}' but is '${
						oContextObject.$Type
					}': ${oContext.getPath()}`
				);
			}
		}
	}
}
export function validateMacroSignature(
	sName: string,
	oMetadata: ResolvedBuildingBlockMetadata,
	mContexts: Record<string, Context>,
	oNode: Element
) {
	const aMetadataContextKeys = (oMetadata.metadataContexts && Object.keys(oMetadata.metadataContexts)) || [],
		aProperties = (oMetadata.properties && Object.keys(oMetadata.properties)) || [],
		oAttributeNames: Record<string, boolean> = {};

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
	Object.keys(oAttributeNames).forEach(function (sKey: string) {
		// no check for properties which contain a colon ":" (different namespace), e.g. xmlns:trace, trace:macroID, unittest:id
		if (sKey.indexOf(":") < 0 && !sKey.startsWith("xmlns")) {
			Log.warning(`Unchecked parameter: ${sName}: ${sKey}`, undefined, LOGGER_SCOPE);
		}
	});
}

const SAP_UI_CORE_ELEMENT = "sap.ui.core.Element";

export const SAP_UI_MODEL_CONTEXT = "sap.ui.model.Context";

/**
 * Ensures that the metadata for the building block are properly defined.
 *
 * @param buildingBlockMetadata The metadata received from the input
 * @param isOpen Whether the building block is open or not
 * @param apiVersion
 * @returns A set of completed metadata for further processing
 */
function prepareMetadata(
	buildingBlockMetadata?: BuildingBlockMetadata,
	isOpen = false,
	apiVersion?: number
): ResolvedBuildingBlockMetadata {
	if (buildingBlockMetadata) {
		const oProperties: Record<string, BuildingBlockPropertyDefinition> = {};
		const oAggregations: Record<string, BuildingBlockAggregationDefinition> = {
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

		const oMetadataContexts: Record<string, BuildingBlockPropertyDefinition> = {};
		let foundDefaultAggregation;
		Object.keys(buildingBlockMetadata.properties).forEach(function (sPropertyName: string) {
			if (buildingBlockMetadata.properties[sPropertyName].type !== SAP_UI_MODEL_CONTEXT) {
				oProperties[sPropertyName] = buildingBlockMetadata.properties[sPropertyName];
			} else {
				oMetadataContexts[sPropertyName] = buildingBlockMetadata.properties[sPropertyName];
			}
		});
		// Merge events into properties as they are handled identically
		if (buildingBlockMetadata.events !== undefined) {
			Object.keys(buildingBlockMetadata.events).forEach(function (sEventName: string) {
				oProperties[sEventName] = { type: "function", ...buildingBlockMetadata.events[sEventName] };
			});
		}
		if (buildingBlockMetadata.aggregations !== undefined) {
			Object.keys(buildingBlockMetadata.aggregations).forEach(function (sPropertyName: string) {
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
function _checkAbsoluteAndContextPaths(oSettings: TemplateProcessorSettings, sAttributeValue: string): MetaDataContext {
	let sMetaPath: string;
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
function _createInitialMetadataContext(
	oSettings: TemplateProcessorSettings,
	sAttributeName: string,
	sAttributeValue: string
): MetaDataContext {
	let returnContext: MetaDataContext;
	if (sAttributeValue.startsWith("/uid--")) {
		const oData = myStore[sAttributeValue];
		oSettings.models.converterContext.setProperty(sAttributeValue, oData);
		returnContext = {
			model: "converterContext",
			path: sAttributeValue
		};
		delete myStore[sAttributeValue];
	} else if ((sAttributeName === "metaPath" && oSettings.currentContextPath) || sAttributeName === "contextPath") {
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

function _getMetadataContext(
	oSettings: TemplateProcessorSettings,
	oNode: Element,
	sAttributeName: string,
	oVisitor: IVisitorCallback,
	bDoNotResolve: boolean,
	isOpen: boolean
) {
	let oMetadataContext: MetaDataContext | undefined;
	if (!bDoNotResolve && oNode.hasAttribute(sAttributeName)) {
		const sAttributeValue = oNode.getAttribute(sAttributeName) as string;
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
async function processProperties(
	oMetadata: ResolvedBuildingBlockMetadata,
	oNode: Element,
	isPublic: boolean,
	oVisitor: IVisitorCallback,
	apiVersion?: number
) {
	const oDefinitionProperties = oMetadata.properties;

	// Retrieve properties values
	const aDefinitionPropertiesKeys = Object.keys(oDefinitionProperties);

	const propertyValues: Record<string, ObjectValue> = {};
	for (const sKeyValue of aDefinitionPropertiesKeys) {
		if (oDefinitionProperties[sKeyValue].type === "object") {
			propertyValues[sKeyValue] = deepClone(oDefinitionProperties[sKeyValue].defaultValue || {}); // To avoid values being reused across macros
		} else {
			propertyValues[sKeyValue] = oDefinitionProperties[sKeyValue].defaultValue as string | boolean | number;
		}

		if (oNode.hasAttribute(sKeyValue) && isPublic && oDefinitionProperties[sKeyValue].isPublic === false) {
			Log.error(`Property ${sKeyValue} was ignored as it is not intended for public usage`);
		} else if (oNode.hasAttribute(sKeyValue)) {
			await oVisitor.visitAttribute(oNode, oNode.attributes.getNamedItem(sKeyValue) as Attr);
			let value: string | boolean | number | null | undefined = oNode.getAttribute(sKeyValue);
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
function processContexts(
	oMetadata: ResolvedBuildingBlockMetadata,
	oSettings: TemplateProcessorSettings,
	oNode: Element,
	isPublic: boolean,
	oVisitor: IVisitorCallback,
	mContexts: Record<string, Context>,
	oMetadataContexts: Record<string, Context>
) {
	oSettings.currentContextPath = oSettings.bindingContexts.contextPath;
	const mMissingContext: Record<string, boolean> = {};
	const propertyValues: Record<string, unknown> = {};
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
			if (
				(sAttributeName === "entitySet" || sAttributeName === "contextPath") &&
				!oSettings.bindingContexts.hasOwnProperty(sAttributeName)
			) {
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
	return { mMissingContext, propertyValues: propertyValues };
}

export type BuildingBlockAggregation = {
	key: string;
	position: Position;
	type: "Slot";
};
function parseAggregation(oAggregation?: Element, processAggregations?: Function) {
	const oOutObjects: Record<string, BuildingBlockAggregation> = {};
	if (oAggregation && oAggregation.children.length > 0) {
		const children = oAggregation.children;
		for (let childIdx = 0; childIdx < children.length; childIdx++) {
			const childDefinition = children[childIdx];
			let childKey = childDefinition.getAttribute("key") || childDefinition.getAttribute("id");
			if (childKey) {
				childKey = `InlineXML_${childKey}`;
				childDefinition.setAttribute("key", childKey);
				let aggregationObject: BuildingBlockAggregation = {
					key: childKey,
					position: {
						placement: (childDefinition.getAttribute("placement") as Placement) || Placement.After,
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
async function processChildren(
	oNode: Element,
	oVisitor: IVisitorCallback,
	oMetadata: ResolvedBuildingBlockMetadata,
	isPublic: boolean,
	propertyValues: Record<string, ObjectValue>,
	apiVersion?: number
) {
	const oAggregations: Record<string, Element> = {};
	if (oNode.firstElementChild !== null) {
		let oFirstElementChild: Element | null = oNode.firstElementChild as Element | null;
		if (apiVersion === 2) {
			while (oFirstElementChild !== null) {
				if (oFirstElementChild.namespaceURI === XMLTEMPLATING_NS) {
					// In case we encounter a templating tag, run the visitor on it and continue with the resulting child
					const oParent = oFirstElementChild.parentNode;
					let iChildIndex: number;
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
			const oNextChild: Element | null = oFirstElementChild.nextElementSibling;
			const sChildName = oFirstElementChild.localName;
			let sAggregationName = sChildName;
			if (sAggregationName[0].toUpperCase() === sAggregationName[0]) {
				// not a sub aggregation, go back to default Aggregation
				sAggregationName = oMetadata.defaultAggregation || "";
			}
			if (
				Object.keys(oMetadata.aggregations).indexOf(sAggregationName) !== -1 &&
				(!isPublic || oMetadata.aggregations[sAggregationName].isPublic === true)
			) {
				if (apiVersion === 2) {
					const aggregationDefinition = oMetadata.aggregations[sAggregationName];
					if (!aggregationDefinition.slot && oFirstElementChild !== null && oFirstElementChild.children.length > 0) {
						await oVisitor.visitNode(oFirstElementChild);
						let childDefinition = oFirstElementChild.firstElementChild;
						while (childDefinition) {
							const nextChild = childDefinition.nextElementSibling;
							if (!aggregationDefinition.hasVirtualNode) {
								const childWrapper = document.createElementNS(oNode.namespaceURI, childDefinition.getAttribute("key")!);
								childWrapper.appendChild(childDefinition);
								oAggregations[childDefinition.getAttribute("key")!] = childWrapper;
							} else {
								oAggregations[childDefinition.getAttribute("key")!] = childDefinition;
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
					const aggregationPropertyValues: Record<string, ObjectValue2 | Record<string, ObjectValue2>> = {};
					const attributeNames = oFirstElementChild.getAttributeNames();
					for (const attributeName of attributeNames) {
						aggregationPropertyValues[attributeName] = oFirstElementChild.getAttribute(attributeName);
					}
					if (oFirstElementChild.children.length) {
						//retrieve one level subObject properties
						for (let childIndex = 0; childIndex < oFirstElementChild.children.length; childIndex++) {
							const subChild = oFirstElementChild.children[childIndex];
							const subObjectKey = subChild.localName;
							const subObject: Record<string, ObjectValue2> = {};
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
						const oOutObjects: Record<string, ObjectValue2>[] = [];
						for (let childIdx = 0; childIdx < children.length; childIdx++) {
							const childDefinition = children[childIdx];
							// non keyed child, just add it to the aggregation
							const myChild: Record<string, ObjectValue2> = {};
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

function processSlots(
	oAggregations: Record<string, Element>,
	oMetadataAggregations: Record<string, BuildingBlockAggregationDefinition>,
	oNode: Element,
	processCustomData = false
) {
	if (Object.keys(oAggregations).length > 0) {
		Object.keys(oAggregations).forEach(function (sAggregationName: string) {
			const oAggregationElement = oAggregations[sAggregationName];
			if (oNode !== null && oNode !== undefined && oAggregationElement) {
				// slots can have :: as keys which is not a valid aggregation name therefore replacing them
				const oElementChild = oAggregationElement.firstElementChild;
				if (sAggregationName !== "customData" && sAggregationName !== "dependents") {
					const sSlotName =
						(oMetadataAggregations[sAggregationName] !== undefined && oMetadataAggregations[sAggregationName].slot) ||
						sAggregationName;
					const oTargetElement = oNode.querySelector(`slot[name='${sSlotName}']`);
					if (oTargetElement !== null) {
						const oNewChild = prepareAggregationElement(oNode, sAggregationName, oElementChild);
						oTargetElement.replaceWith(...(oNewChild.children as unknown as Node[])); // Somehow TS doesn't like this but the documentation says is should work
					}
				} else if (processCustomData && oElementChild !== null) {
					const oNewChild = prepareAggregationElement(oNode, sAggregationName, oElementChild);
					oNode.appendChild(oNewChild);
				}
			}
		});
	}
}

function prepareAggregationElement(oNode: Element, sAggregationName: string, oElementChild: Element | null) {
	const oNewChild = document.createElementNS(oNode.namespaceURI, sAggregationName.replace(/:/gi, "_"));
	while (oElementChild) {
		const oNextChild = oElementChild.nextElementSibling;
		oNewChild.appendChild(oElementChild);
		oElementChild = oNextChild;
	}
	return oNewChild;
}

async function processBuildingBlock(
	buildingBlockDefinition: BuildingBlockDefinition,
	oNode: Element,
	oVisitor: IVisitorCallback,
	isPublic = false
) {
	const sFragmentName =
		buildingBlockDefinition.fragment ||
		`${buildingBlockDefinition.namespace}.${buildingBlockDefinition.xmlTag || buildingBlockDefinition.name}`;

	const sName = "this";

	const mContexts: Record<string, Context> = {};
	const oMetadataContexts: Record<string, Context> = {};
	const oSettings = oVisitor.getSettings();
	// TODO 0001 Move this elsewhere this is weird :)
	if (oSettings.models["sap.fe.i18n"]) {
		(oSettings.models["sap.fe.i18n"].getResourceBundle() as Promise<ResourceBundle>)
			.then(function (oResourceBundle: ResourceBundle) {
				ResourceModel.setApplicationI18nBundle(oResourceBundle);
			})
			.catch(function (error: unknown) {
				Log.error(error as string);
			});
	}
	const oMetadata = prepareMetadata(buildingBlockDefinition.metadata, buildingBlockDefinition.isOpen, buildingBlockDefinition.apiVersion);

	//Inject storage for macros
	if (!oSettings[sFragmentName]) {
		oSettings[sFragmentName] = {};
	}

	// First of all we need to visit the attributes to resolve the properties and the metadata contexts
	let propertyValues = await processProperties(oMetadata, oNode, isPublic, oVisitor, buildingBlockDefinition.apiVersion);

	const { mMissingContext, propertyValues: extraPropertyValues } = processContexts(
		oMetadata,
		oSettings,
		oNode,
		isPublic,
		oVisitor,
		mContexts,
		oMetadataContexts
	);
	propertyValues = Object.assign(propertyValues, extraPropertyValues);
	const initialKeys = Object.keys(propertyValues);
	try {
		// Aggregation and complex type support
		const oAggregations = await processChildren(
			oNode,
			oVisitor,
			oMetadata,
			isPublic,
			propertyValues,
			buildingBlockDefinition.apiVersion
		);
		let oInstance: BuildingBlockBase | undefined;
		let oControlConfig = {};

		if (oSettings.models.viewData) {
			// Only used in the Field macro and even then maybe not really useful
			oControlConfig = oSettings.models.viewData.getProperty("/controlConfiguration");
		}
		let processedPropertyValues = propertyValues;
		if (isV1MacroDef(buildingBlockDefinition) && buildingBlockDefinition.create) {
			processedPropertyValues = buildingBlockDefinition.create.call(
				buildingBlockDefinition,
				propertyValues,
				oControlConfig,
				oSettings,
				oAggregations,
				isPublic
			);
			Object.keys(oMetadata.metadataContexts).forEach(function (sMetadataName: string) {
				if (oMetadata.metadataContexts[sMetadataName].computed === true) {
					mContexts[sMetadataName] = processedPropertyValues[sMetadataName] as unknown as Context;
				}
			});
			Object.keys(mMissingContext).forEach(function (sContextName: string) {
				if (processedPropertyValues.hasOwnProperty(sContextName)) {
					mContexts[sContextName] = processedPropertyValues[sContextName] as unknown as Context;
				}
			});
		} else if (buildingBlockDefinition.apiVersion === 2) {
			Object.keys(propertyValues).forEach((propName) => {
				let oData = propertyValues[propName] as unknown as Context;
				//check for additional processing function to validate / overwrite parameters
				const originalDefinition = buildingBlockDefinition?.metadata?.properties[propName];
				if (originalDefinition?.validate) {
					oData = originalDefinition.validate(oData) || oData;
				}
				if (oData?.isA?.(SAP_UI_MODEL_CONTEXT) && !oData.getModel().isA("sap.ui.model.odata.v4.ODataMetaModel")) {
					propertyValues[propName] = oData.getObject();
				}
			});
			const BuildingBlockClass = buildingBlockDefinition as typeof BuildingBlockBase;
			propertyValues.isPublic = isPublic;

			oInstance = new BuildingBlockClass(
				{ ...propertyValues, ...oAggregations },
				oControlConfig,
				oSettings
				/*, oControlConfig, oSettings, oAggregations, isPublic*/
			);
			processedPropertyValues = oInstance.getProperties();
			Object.keys(oMetadata.metadataContexts).forEach(function (sContextName: string) {
				if (processedPropertyValues.hasOwnProperty(sContextName)) {
					const targetObject = processedPropertyValues[sContextName];
					if (typeof targetObject === "object" && !isContext(targetObject)) {
						const sAttributeValue = storeValue(targetObject);
						oSettings.models.converterContext.setProperty(sAttributeValue, targetObject);
						const newContext = oSettings.models.converterContext.createBindingContext(sAttributeValue)!;
						delete myStore[sAttributeValue];
						mContexts[sContextName] = newContext;
					} else if (!mContexts.hasOwnProperty(sContextName) && targetObject !== undefined) {
						mContexts[sContextName] = targetObject as Context;
					}
				}
			});
		}
		const oAttributesModel: JSONModel = new AttributeModel(oNode, processedPropertyValues, buildingBlockDefinition);
		mContexts[sName] = oAttributesModel.createBindingContext("/");
		let oPreviousMacroInfo: MacroInfo | undefined;

		// Keep track
		if (TraceInfo.isTraceInfoActive()) {
			const oTraceInfo = TraceInfo.traceMacroCalls(sFragmentName, oMetadata, mContexts, oNode, oVisitor);
			if ((oTraceInfo as TraceMetadataContext)?.macroInfo) {
				oPreviousMacroInfo = oSettings["_macroInfo"];
				oSettings["_macroInfo"] = (oTraceInfo as TraceMetadataContext).macroInfo;
			}
		}
		validateMacroSignature(sFragmentName, oMetadata, mContexts, oNode);

		const oContextVisitor = oVisitor.with(
			mContexts,
			buildingBlockDefinition.isOpen !== undefined ? !buildingBlockDefinition.isOpen : true
		);
		const oParent = oNode.parentNode;

		let iChildIndex: number;
		let oPromise;
		let processCustomData = true;
		if (oParent) {
			iChildIndex = Array.from(oParent.children).indexOf(oNode);
			if (
				(isV1MacroDef(buildingBlockDefinition) && buildingBlockDefinition.getTemplate) ||
				(buildingBlockDefinition.apiVersion === 2 && !buildingBlockDefinition.fragment)
			) {
				let templateString: string | undefined;
				let addDefaultNamespace = false;
				if (buildingBlockDefinition.apiVersion === 2 && oInstance !== undefined) {
					templateString = await oInstance.getTemplate!(oNode);
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
						Log.error(
							`Error while processing building block ${buildingBlockDefinition.xmlTag || buildingBlockDefinition.name}`
						);
						try {
							isTraceMode = true;
							const initialTemplate = oInstance?.getTemplate
								? await oInstance.getTemplate(oNode)
								: await buildingBlockDefinition.getTemplate!(processedPropertyValues);
							parsedTemplate = parseXMLString(initialTemplate, true);
						} finally {
							isTraceMode = false;
						}
					} else if (hasError.length > 0) {
						// If there is trailing text we create a standard error and display it.
						Log.error(
							`Error while processing building block ${buildingBlockDefinition.xmlTag || buildingBlockDefinition.name}`
						);
						const oErrorText = createErrorXML(
							[
								`Error while processing building block ${buildingBlockDefinition.xmlTag || buildingBlockDefinition.name}`,
								`Trailing text was found in the XML: ${hasError}`
							],
							parsedTemplate.map((template) => template.outerHTML).join("\n")
						);
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
	} catch (e: unknown) {
		// In case there is a generic error (usually code error), we retrieve the current context information and create a dedicated error message
		const traceDetails = {
			initialProperties: {} as Record<string, unknown>,
			resolvedProperties: {} as Record<string, unknown>,
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
		Log.error(e as string);
		const oError = createErrorXML(
			[`Error while processing building block ${buildingBlockDefinition.name}`],
			oNode.outerHTML,
			traceDetails,
			(e as Error).stack
		);
		const oTemplate = parseXMLString(oError, true);
		oNode.replaceWith(...oTemplate);
	}
}
function addSingleContext(
	mContexts: Record<string, Context | undefined>,
	oVisitor: IVisitorCallback,
	oCtx: {
		name?: string;
		path: string;
		model?: string;
	},
	oMetadataContexts: Record<string, Context | undefined>
) {
	const sKey = (oCtx.name || oCtx.model || undefined) as string;
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
		} else if (!mSetting.bindingContexts[oCtx.model!] && mSetting.models[oCtx.model!]) {
			mContexts[sKey] = mSetting.models[oCtx.model!].getContext(oCtx.path); // add the context to the visitor
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
export function registerBuildingBlock(buildingBlockDefinition: BuildingBlockDefinition): void {
	XMLPreprocessor.plugIn(
		async (oNode: Element, oVisitor: IVisitorCallback) => processBuildingBlock(buildingBlockDefinition, oNode, oVisitor),
		buildingBlockDefinition.namespace,
		buildingBlockDefinition.xmlTag || buildingBlockDefinition.name
	);
	if (buildingBlockDefinition.publicNamespace) {
		XMLPreprocessor.plugIn(
			async (oNode: Element, oVisitor: IVisitorCallback) => processBuildingBlock(buildingBlockDefinition, oNode, oVisitor, true),
			buildingBlockDefinition.publicNamespace,
			buildingBlockDefinition.xmlTag || buildingBlockDefinition.name
		);
	}
}

function createErrorXML(errorMessages: string[], xmlFragment: string, additionalData?: object, stack?: string): string {
	const errorLabels = errorMessages.map((errorMessage) => xml`<m:Label text="${escapeXMLAttributeValue(errorMessage)}"/>`);
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

const myStore: Record<string, unknown> = {};
function storeValue(values: unknown) {
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
export function parseXMLString(xmlString: string, addDefaultNamespaces = false): Element[] {
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
	while (output?.localName === "template") {
		output = output.firstElementChild;
	}
	const children = output?.parentElement ? output?.parentElement.children : [output as Element];
	return Array.from(children);
}

/**
 * Escape an XML attribute value.
 *
 * @param value The attribute value to escape.
 * @returns The escaped string.
 */
export function escapeXMLAttributeValue(value?: string): string | undefined {
	return value?.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function renderInTraceMode(outStr: string) {
	const xmlResult = parseXMLString(outStr, true);
	if (xmlResult?.length > 0 && xmlResult[0]?.localName === "parsererror") {
		const errorMessage = (xmlResult[0] as HTMLElement).innerText || (xmlResult[0] as HTMLElement).innerHTML;
		return createErrorXML([errorMessage.split("\n")[0]], outStr);
	} else {
		return outStr;
	}
}

export type XMLProcessorTypeValue =
	| string
	| boolean
	| number
	| undefined
	| null
	| object
	| Record<string, unknown>
	| BindingToolkitExpression<string | boolean | number>
	| Array<string>
	| Array<Function>
	| Function
	| Context;
/**
 * Create a string representation of the template literal while handling special object case.
 *
 * @param strings The string parts of the template literal
 * @param values The values part of the template literal
 * @returns The XML string document representing the string that was used.
 */
export const xml = (strings: TemplateStringsArray, ...values: XMLProcessorTypeValue[]) => {
	let outStr = "";
	let i;
	for (i = 0; i < values.length; i++) {
		outStr += strings[i];

		// Handle the different case of object, if it's an array we join them, if it's a binding expression then we compile it.
		const value = values[i];

		if (Array.isArray(value) && value.length > 0 && typeof value[0] === "string") {
			outStr += value.flat(5).join("\n").trim();
		} else if (isFunctionArray(value)) {
			outStr += value.map((valuefn) => valuefn()).join("\n");
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
