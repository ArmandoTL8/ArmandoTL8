import deepClone from "sap/base/util/deepClone";
import merge from "sap/base/util/merge";
import ObjectPath from "sap/base/util/ObjectPath";
import type AppComponent from "sap/fe/core/AppComponent";
import BuildingBlockFragment from "sap/fe/core/buildingBlocks/BuildingBlockFragment";
import type { TemplateProcessorSettings, XMLProcessorTypeValue } from "sap/fe/core/buildingBlocks/BuildingBlockRuntime";
import { registerBuildingBlock, xml } from "sap/fe/core/buildingBlocks/BuildingBlockRuntime";
import CommonUtils from "sap/fe/core/CommonUtils";
import type { BindingToolkitExpression } from "sap/fe/core/helpers/BindingToolkit";
import { isUndefinedExpression, resolveBindingString } from "sap/fe/core/helpers/BindingToolkit";
import { generate } from "sap/fe/core/helpers/StableIdHelper";
import { isContext } from "sap/fe/core/helpers/TypeGuards";
import jsx from "sap/fe/core/jsx-runtime/jsx";
import type TemplateComponent from "sap/fe/core/TemplateComponent";
import type { DataModelObjectPath } from "sap/fe/core/templating/DataModelPathHelper";
import ManagedObject from "sap/ui/base/ManagedObject";
import Component from "sap/ui/core/Component";
import type View from "sap/ui/core/mvc/View";
import XMLPreprocessor from "sap/ui/core/util/XMLPreprocessor";
import type Control from "sap/ui/mdc/Control";
import type Context from "sap/ui/model/Context";
import type { ManagedObjectEx } from "types/extension_types";
import ConverterContext from "../converters/ConverterContext";

export type ObjectValue2 = string | boolean | number | Context | undefined | object | null;
type ObjectValue3<T> = T | Record<string, T> | T[];
export type ObjectValue = ObjectValue3<ObjectValue2 | Record<string, ObjectValue2> | ObjectValue2[]>;

// Type for the accessor decorator that we end up with in babel.
type AccessorDescriptor<T> = TypedPropertyDescriptor<T> & { initializer?: () => T };
export type BuildingBlockExtraSettings = {
	isPublic: boolean;
	isRuntimeInstantiation?: boolean;
	appComponent: AppComponent;
};

/**
 * Base class for Building Block
 */
export class BuildingBlockBase {
	protected isPublic = false;
	protected id!: string;
	constructor(props: Record<string, unknown>, _oControlConfig?: unknown, _oSettings?: BuildingBlockExtraSettings) {
		Object.keys(props).forEach((propName) => {
			this[propName as keyof this] = props[propName] as never;
		});
	}
	/**
	 * Only used internally
	 *
	 * @private
	 */
	public getTemplate?(oNode?: Element): string | Promise<string | undefined> | undefined;

	/**
	 * Convert the given local element ID to a globally unique ID by prefixing with the Building Block ID.
	 *
	 * @param stringParts
	 * @returns Either the global ID or undefined if the Building Block doesn't have an ID
	 * @private
	 */
	protected createId(...stringParts: string[]) {
		// If the child instance has an ID property use it otherwise return undefined
		if (this.id) {
			return generate([this.id, ...stringParts]);
		}
		return undefined;
	}
	protected getConverterContext = function (
		dataModelObjectPath: DataModelObjectPath,
		contextPath: string | undefined,
		settings: TemplateProcessorSettings,
		extraParams?: Record<string, unknown>
	) {
		const appComponent = settings.appComponent;
		const originalViewData = settings.models.viewData?.getData();
		let viewData = Object.assign({}, originalViewData);
		delete viewData.resourceBundle;
		viewData = deepClone(viewData);
		viewData.controlConfiguration = merge(viewData.controlConfiguration, extraParams || {});
		return ConverterContext.createConverterContextForMacro(
			dataModelObjectPath.startingEntitySet.name,
			settings.models.metaModel,
			appComponent?.getDiagnostics(),
			merge,
			dataModelObjectPath.contextLocation,
			viewData
		);
	};

	/**
	 * Only used internally.
	 *
	 * @returns All the properties defined on the object with their values
	 * @private
	 */
	public getProperties() {
		const allProperties: Record<string, ObjectValue> = {};
		for (const oInstanceKey in this) {
			if (this.hasOwnProperty(oInstanceKey)) {
				allProperties[oInstanceKey] = this[oInstanceKey] as unknown as ObjectValue;
			}
		}
		return allProperties;
	}
	static register() {
		// To be overriden
	}
	static unregister() {
		// To be overriden
	}

	/**
	 * Add a part of string based on the condition.
	 *
	 * @param condition
	 * @param partToAdd
	 * @returns The part to add if the condition is true, otherwise an empty string
	 * @private
	 */
	protected addConditionally(condition: boolean, partToAdd: string): string {
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
	 */
	protected attr(attributeName: string, value?: XMLProcessorTypeValue): () => string {
		if (value !== undefined && !isUndefinedExpression(value)) {
			return () => xml`${attributeName}="${value}"`;
		} else {
			return () => "";
		}
	}
}

/**
 * Base class for runtime building blocks
 */
export interface RuntimeBuildingBlock extends BuildingBlockBase {
	getContent(containingView: View, appComponent: AppComponent): Control;
}

export type BuildingBlockPropertyDefinition = {
	type: string;
	isPublic?: boolean;
	defaultValue?: unknown;
	/** This property is only evaluated in the V1 API */
	computed?: boolean;
	required?: boolean;
	/** This property is only considered for runtime building blocks */
	bindable?: boolean;
	$kind?: string[];
	$Type?: string[];
	/** Function that allows to validate or transform the given input */
	validate?: Function;
};
export type BuildingBlockMetadataContextDefinition = {
	type: string;
	isPublic?: boolean;
	required?: boolean;
	/** This property is only evaluated in the V1 API */
	computed?: boolean;
	$Type?: string[];
	$kind?: string[];
};
export type BuildingBlockEvent = {};
export type BuildingBlockAggregationDefinition = {
	isPublic?: boolean;
	type: string;
	slot?: string;
	isDefault?: boolean;
	/** Defines whether the element is based on an actual node that will be rendered or only on XML that will be interpreted */
	hasVirtualNode?: boolean;
	processAggregations?: Function;
};
type CommonBuildingBlockDefinition = {
	namespace: string;
	name: string;
	xmlTag?: string;
	fragment?: string;
	publicNamespace?: string;
	designtime?: string;
	isRuntime?: boolean;
	isOpen?: boolean;
};
export type BuildingBlockDefinitionV2 = CommonBuildingBlockDefinition &
	(new () => BuildingBlockBase) &
	typeof BuildingBlockBase & {
		apiVersion: 2;
		getTemplate?: Function;
		metadata: BuildingBlockMetadata;
	};

export type BuildingBlockDefinitionV1 = CommonBuildingBlockDefinition & {
	name: string;
	apiVersion?: 1;
	create?: Function;
	getTemplate?: Function;
	metadata: BuildingBlockMetadata;
};
export type BuildingBlockDefinition = BuildingBlockDefinitionV2 | BuildingBlockDefinitionV1;
export type BuildingBlockMetadata = {
	events: Record<string, BuildingBlockEvent>;
	properties: Record<string, BuildingBlockPropertyDefinition>;
	aggregations: Record<string, BuildingBlockAggregationDefinition>;
	stereotype?: string;
	designtime?: string;
};

const ensureMetadata = function (target: Partial<BuildingBlockDefinitionV2>): BuildingBlockMetadata {
	if (!target.hasOwnProperty("metadata")) {
		target.metadata = deepClone(
			target.metadata || {
				properties: {},
				aggregations: {},
				events: {},
				stereotype: "xmlmacro",
				designtime: ""
			}
		);
	}
	return target.metadata as BuildingBlockMetadata;
};

/**
 * Decorator for building blocks.
 *
 * @param attributeDefinition
 * @deprecated use `blockAttribute` instead
 * @returns The decorated property
 */
export function xmlAttribute(attributeDefinition: BuildingBlockPropertyDefinition): PropertyDecorator {
	return function (target: BuildingBlockBase, propertyKey: string | Symbol, propertyDescriptor: AccessorDescriptor<unknown>) {
		const metadata = ensureMetadata(target.constructor);
		if (attributeDefinition.defaultValue === undefined) {
			// If there is no defaultValue we can take the value from the initializer (natural way of defining defaults)
			attributeDefinition.defaultValue = propertyDescriptor.initializer?.();
		}
		delete propertyDescriptor.initializer;
		if (metadata.properties[propertyKey.toString()] === undefined) {
			metadata.properties[propertyKey.toString()] = attributeDefinition;
		}

		return propertyDescriptor;
	} as unknown as PropertyDecorator; // Needed to make TS happy with those decorators;
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
export function blockAttribute(attributeDefinition: BuildingBlockPropertyDefinition): PropertyDecorator {
	return xmlAttribute(attributeDefinition);
}

/**
 * Decorator for building blocks.
 *
 * @deprecated use `blockEvent` instead
 * @returns The decorated property
 */
export function xmlEvent(): PropertyDecorator {
	return function (target: BuildingBlockBase, propertyKey: string | Symbol, propertyDescriptor: AccessorDescriptor<unknown>) {
		const metadata = ensureMetadata(target.constructor);
		delete propertyDescriptor.initializer;
		if (metadata.events[propertyKey.toString()] === undefined) {
			metadata.events[propertyKey.toString()] = { type: "function" };
		}

		return propertyDescriptor;
	} as unknown as PropertyDecorator; // Needed to make TS happy with those decorators;
}
export function blockEvent(): PropertyDecorator {
	return xmlEvent();
}

/**
 * Decorator for building blocks.
 *
 * @param aggregationDefinition
 * @returns The decorated property
 * @deprecated use `blockAggregation` instead
 */
export function xmlAggregation(aggregationDefinition: BuildingBlockAggregationDefinition): PropertyDecorator {
	return function (target: BuildingBlockBase, propertyKey: string, propertyDescriptor: AccessorDescriptor<unknown>) {
		const metadata = ensureMetadata(target.constructor);
		delete propertyDescriptor.initializer;
		if (metadata.aggregations[propertyKey] === undefined) {
			metadata.aggregations[propertyKey] = aggregationDefinition;
		}

		return propertyDescriptor;
	} as unknown as PropertyDecorator;
}
/**
 * Indicates that the property shall be declared as an xml aggregation that can be used from the outside of the building block.
 *
 * @param aggregationDefinition
 * @returns The decorated property
 */
export function blockAggregation(aggregationDefinition: BuildingBlockAggregationDefinition): PropertyDecorator {
	return xmlAggregation(aggregationDefinition);
}
const RUNTIME_BLOCKS: Record<string, RuntimeBuildingBlock & BuildingBlockDefinitionV2> = {};
export function defineBuildingBlock(oBuildingBlockDefinition: CommonBuildingBlockDefinition): ClassDecorator {
	return function (classDefinition: Partial<BuildingBlockDefinitionV2>) {
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
			classDefinition.prototype.getTemplate = function (oNode: Element) {
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
							extraProps.push(xml`feBB:${propertiesKey}="${propertyValue as XMLProcessorTypeValue}"`);
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
						extraProps.push(xml`feBB:${eventsKey}="${eventsValue as XMLProcessorTypeValue}"`);
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
			registerBuildingBlock(classDefinition as BuildingBlockDefinitionV2);
			if (classDefinition.isRuntime === true) {
				RUNTIME_BLOCKS[`${oBuildingBlockDefinition.namespace}.${oBuildingBlockDefinition.name}`] =
					classDefinition as RuntimeBuildingBlock & BuildingBlockDefinitionV2;
			}
		};
		classDefinition.unregister = function () {
			XMLPreprocessor.plugIn(null, classDefinition.namespace, classDefinition.name);
			XMLPreprocessor.plugIn(null, classDefinition.publicNamespace, classDefinition.name);
		};
	};
}
type FragmentCustomData = {
	mProperties: {
		value: {
			"sap.fe.core.buildingBlocks"?: Record<string, string>;
		};
	};
};
type FEComponentFragmentSettings = {
	fragmentName: string;
	fragmentContent?: RuntimeBuildingBlock & BuildingBlockDefinitionV2;
	containingView: View;
	customData?: FragmentCustomData[];
	functionHolder?: FunctionWithHandler[][];
};

type FunctionWithHandler = Function & {
	_sapui_handlerName?: string;
};
type FragmentWithInternals = {
	_bAsync: boolean;
	_aContent: Control | Control[];
};
BuildingBlockFragment.registerType("FE_COMPONENTS", {
	load: async function (mSettings: FEComponentFragmentSettings) {
		return Promise.resolve(RUNTIME_BLOCKS[mSettings.fragmentName]);
	},
	init: function (this: FragmentWithInternals, mSettings: FEComponentFragmentSettings) {
		let MyClass = mSettings.fragmentContent;
		if (!MyClass) {
			// In some case we might have been called here synchronously (unstash case for instance), which means we didn't go through the load function
			MyClass = RUNTIME_BLOCKS[mSettings.fragmentName];
		}
		const classSettings: Record<string, unknown> = {};
		const feCustomData: Record<string, string> = mSettings?.customData?.[0]?.mProperties?.value?.["sap.fe.core.buildingBlocks"] || {};
		delete mSettings.customData;
		const functionHolder: FunctionWithHandler[][] = mSettings.functionHolder ?? [];
		delete mSettings.functionHolder;

		// containingView can also be a fragment, so we have to use the controller to be sure to get the actual view
		const containingView = mSettings.containingView.getController?.().getView() ?? mSettings.containingView;
		const pageComponent = Component.getOwnerComponentFor(containingView) as TemplateComponent;
		const appComponent = CommonUtils.getAppComponent(containingView);

		const metaModel = appComponent.getMetaModel();
		const pageModel = pageComponent.getModel("_pageModel");

		const functionStringInOrder: string[] = feCustomData.functionStringInOrder?.split(",");
		const propertiesAssignedToFunction: string[] = feCustomData.propertiesAssignedToFunction?.split(",");
		for (const propertyName in MyClass.metadata.properties) {
			const propertyMetadata = MyClass.metadata.properties[propertyName];
			const pageModelContext = pageModel.createBindingContext(feCustomData[propertyName]);

			if (pageModelContext === null) {
				// value cannot be resolved, so it is either a runtime binding or a constant
				let value: string | boolean | number | BindingToolkitExpression<string | boolean | number> = feCustomData[propertyName];

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
					const targetFunction = functionHolder?.find((functionDef) => functionDef[0]?._sapui_handlerName === functionString);
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
		return (ManagedObject as unknown as ManagedObjectEx).runWithPreprocessors(
			() => {
				const renderedControl = jsx.withContext({ view: containingView, appComponent: appComponent }, () => {
					return (
						new MyClass!(
							classSettings,
							{},
							{ isRuntimeInstantiation: true, isPublic: false, appComponent: appComponent }
						) as RuntimeBuildingBlock
					).getContent(containingView, appComponent);
				});
				if (!this._bAsync) {
					this._aContent = renderedControl;
				}
				return renderedControl;
			},
			{
				id: function (sId: string) {
					return containingView.createId(sId);
				},
				settings: function (controlSettings: Record<string, string | ManagedObject | (string | ManagedObject)[]>) {
					const allAssociations = this.getMetadata().getAssociations();
					for (const associationDetailName of Object.keys(allAssociations)) {
						if (controlSettings[associationDetailName] !== undefined) {
							// The associated elements are indicated via local IDs; we need to change the references to global ones
							const associations = (
								Array.isArray(controlSettings[associationDetailName])
									? controlSettings[associationDetailName]
									: [controlSettings[associationDetailName]]
							) as (string | ManagedObject)[];

							// Create global IDs for associations given as strings, not for already resolved ManagedObjects
							controlSettings[associationDetailName] = associations.map((association: string | ManagedObject) =>
								typeof association === "string" ? mSettings.containingView.createId(association) : association
							);
						}
					}
					return controlSettings;
				}
			}
		);
	}
});
