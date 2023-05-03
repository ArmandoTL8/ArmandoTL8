import type { AnyAnnotation, ConvertedMetadata, EntitySet, Property } from "@sap-ux/vocabularies-types";
import compiler from "@sap/cds-compiler";
import * as fs from "fs";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as plugin from "@prettier/plugin-xml";
import * as path from "path";
import type { Options } from "prettier";
import { format } from "prettier";
import Log from "sap/base/Log";
import LoaderExtensions from "sap/base/util/LoaderExtensions";
import merge from "sap/base/util/merge";
import AppComponent from "sap/fe/core/AppComponent";
import { registerBuildingBlock } from "sap/fe/core/buildingBlocks/BuildingBlockRuntime";
import ConverterContext from "sap/fe/core/converters/ConverterContext";
import type { IssueCategory, IssueSeverity } from "sap/fe/core/converters/helpers/IssueManager";
import type { ListReportManifestSettings, ObjectPageManifestSettings } from "sap/fe/core/converters/ManifestSettings";
import type { IDiagnostics } from "sap/fe/core/converters/TemplateConverter";
import SideEffectsFactory from "sap/fe/core/services/SideEffectsServiceFactory";
import TemplateModel from "sap/fe/core/TemplateModel";
import type { DataModelObjectPath } from "sap/fe/core/templating/DataModelPathHelper";
import BindingParser from "sap/ui/base/BindingParser";
import ManagedObject from "sap/ui/base/ManagedObject";
import ManagedObjectMetadata from "sap/ui/base/ManagedObjectMetadata";
import Component from "sap/ui/core/Component";
import Control from "sap/ui/core/Control";
import InvisibleText from "sap/ui/core/InvisibleText";
import Serializer from "sap/ui/core/util/serializer/Serializer";
import XMLPreprocessor from "sap/ui/core/util/XMLPreprocessor";
import FlexState from "sap/ui/fl/apply/_internal/flexState/FlexState";
import XmlPreprocessor from "sap/ui/fl/apply/_internal/preprocessors/XmlPreprocessor";
import AppStorage from "sap/ui/fl/initial/_internal/Storage";
import Utils from "sap/ui/fl/Utils";
import type Context from "sap/ui/model/Context";
import JSONModel from "sap/ui/model/json/JSONModel";
import MetaModel from "sap/ui/model/MetaModel";
import _MetadataRequestor from "sap/ui/model/odata/v4/lib/_MetadataRequestor";
import ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";
import xpath from "xpath";
import { createFlexibilityChangesObject } from "./JestFlexibilityHelper";

type PreProcessorSettingsType = {
	models: {
		[name: string]: JSONModel | ODataMetaModel;
	};
	bindingContexts: {
		[name: string]: Context | undefined;
	};
};

type JestTemplatedView = {
	asElement: Element | undefined;
	asString: string;
};

// eslint-disable-next-line @typescript-eslint/no-var-requires
const formatXml = require("xml-formatter");

Log.setLevel(1 as any, "sap.ui.core.util.XMLPreprocessor");
jest.setTimeout(40000);

const nameSpaceMap = {
	macros: "sap.fe.macros",
	macro: "sap.fe.macros",
	macroField: "sap.fe.macros.field",
	macrodata: "http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1",
	log: "http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1",
	unittest: "http://schemas.sap.com/sapui5/preprocessorextension/sap.fe.unittesting/1",
	control: "sap.fe.core.controls",
	core: "sap.ui.core",
	dt: "sap.ui.dt",
	m: "sap.m",
	f: "sap.ui.layout.form",
	fl: "sap.ui.fl",
	internalMacro: "sap.fe.macros.internal",
	mdc: "sap.ui.mdc",
	mdcat: "sap.ui.mdc.actiontoolbar",
	mdcField: "sap.ui.mdc.field",
	mdcTable: "sap.ui.mdc.table",
	u: "sap.ui.unified",
	macroMicroChart: "sap.fe.macros.microchart",
	microChart: "sap.suite.ui.microchart",
	macroTable: "sap.fe.macros.table"
};
const select = xpath.useNamespaces(nameSpaceMap);

function _getTemplatedSelector(xmldom: Node, selector: string): string {
	/**
	 * if a root element has been added during the templating by our Jest Templating methods
	 * the root element is added to the selector path.
	 */
	const rootPath = "/root";
	return `${xmldom.nodeName === "root" && !selector.startsWith(rootPath) ? rootPath : ""}${selector}`;
}

async function _buildPreProcessorSettings(
	sMetadataUrl: string,
	mBindingContexts: { [x: string]: string },
	mModels: { [x: string]: any }
): Promise<PreProcessorSettingsType> {
	const oMetaModel = await getMetaModel(sMetadataUrl);

	// To ensure our macro can use #setBindingContext we ensure there is a pre existing JSONModel for converterContext
	// if not already passed to teh templating
	if (!mModels.hasOwnProperty("converterContext")) {
		mModels = Object.assign(mModels, { converterContext: new TemplateModel({}, oMetaModel) });
	}

	Object.keys(mModels).forEach(function (sModelName) {
		if (mModels[sModelName] && mModels[sModelName].isTemplateModel) {
			mModels[sModelName] = new TemplateModel(mModels[sModelName].data, oMetaModel);
		}
	});

	const settings: any = {
		models: Object.assign(
			{
				metaModel: oMetaModel
			},
			mModels
		),
		bindingContexts: {}
	};

	//Inject models and bindingContexts
	Object.keys(mBindingContexts).forEach(function (sKey) {
		/* Assert to make sure the annotations are in the test metadata -> avoid misleading tests */
		expect(typeof oMetaModel.getObject(mBindingContexts[sKey])).toBeDefined();
		const oModel = mModels[sKey] || oMetaModel;
		settings.bindingContexts[sKey] = oModel.createBindingContext(mBindingContexts[sKey]); //Value is sPath
		settings.models[sKey] = oModel;
	});
	return settings;
}

function _removeCommentFromXml(xml: string): string {
	return formatXml(xml, {
		filter: (node: any) => node.type !== "Comment"
	});
}

function _loadResourceView(viewName: string): Element {
	const name = viewName.replace(/\./g, "/") + ".view.xml";
	const view = LoaderExtensions.loadResource(name);
	return view.documentElement;
}

export const registerMacro = function (macroMetadata: any) {
	registerBuildingBlock(macroMetadata);
};
export const unregisterMacro = function (macroMetadata: any) {
	XMLPreprocessor.plugIn(null, macroMetadata.namespace, macroMetadata.name);
	if (macroMetadata.publicNamespace) {
		XMLPreprocessor.plugIn(null, macroMetadata.publicNamespace, macroMetadata.name);
	}
};
export const runXPathQuery = function (selector: string, xmldom: Node | undefined) {
	return select(selector, xmldom);
};

expect.extend({
	toHaveControl(xmldom, selector) {
		const nodes = runXPathQuery(_getTemplatedSelector(xmldom, selector), xmldom);
		return {
			message: () => {
				const outputXml = serializeXML(xmldom);
				return `did not find controls matching ${selector} in generated xml:\n ${outputXml}`;
			},
			pass: nodes && nodes.length >= 1
		};
	},
	toNotHaveControl(xmldom, selector) {
		const nodes = runXPathQuery(_getTemplatedSelector(xmldom, selector), xmldom);
		return {
			message: () => {
				const outputXml = serializeXML(xmldom);
				return `There is a control matching ${selector} in generated xml:\n ${outputXml}`;
			},
			pass: nodes && nodes.length === 0
		};
	}
});

export const formatBuildingBlockXML = function (xmlString: string | string[]) {
	if (Array.isArray(xmlString)) {
		xmlString = xmlString.join("");
	}
	let xmlFormatted = formatXML(xmlString);
	xmlFormatted = xmlFormatted.replace(/uid--id-[0-9]{13}-[0-9]{1,2}/g, "uid--id");
	return xmlFormatted;
};

export const getControlAttribute = function (controlSelector: string, attributeName: string, xmlDom: Node) {
	const selector = `string(${_getTemplatedSelector(xmlDom, controlSelector)}/@${attributeName})`;
	return runXPathQuery(selector, xmlDom);
};

export const serializeXML = function (xmlDom: Node) {
	const serializer = new window.XMLSerializer();
	const xmlString = serializer.serializeToString(xmlDom);
	return formatXML(xmlString);
};

export const formatXML = function (xmlString: string) {
	return format(xmlString, {
		parser: "xml",
		xmlWhitespaceSensitivity: "ignore",
		plugins: [plugin]
	} as Options & { xmlWhitespaceSensitivity: "ignore" | "strict" });
};

/**
 * Compile a CDS file into an EDMX file.
 *
 * @param cdsUrl The path to the file containing the CDS definition. This file must declare the namespace
 * sap.fe.test and a service JestService
 * @param options Options for creating the EDMX output
 * @param edmxFileName Allows you to override the name of the compiled EDMX metadata file
 * @returns The path of the generated EDMX
 */
export const compileCDS = function (
	cdsUrl: string,
	options: compiler.ODataOptions = {},
	edmxFileName = path.basename(cdsUrl).replace(".cds", ".xml")
) {
	const cdsString = fs.readFileSync(cdsUrl, "utf-8");
	const edmxContent = cds2edmx(cdsString, "sap.fe.test.JestService", options);
	const dir = path.resolve(cdsUrl, "..", "gen");

	const edmxFilePath = path.resolve(dir, edmxFileName);

	fs.mkdirSync(dir, { recursive: true });

	fs.writeFileSync(edmxFilePath, edmxContent);
	return edmxFilePath;
};

/**
 * Compile CDS to EDMX.
 *
 * @param cds The CDS model. It must define at least one service.
 * @param service The fully-qualified name of the service to be compiled. Defaults to "sap.fe.test.JestService".
 * @param options Options for creating the EDMX output
 * @returns The compiled service model as EDMX.
 */
export function cds2edmx(cds: string, service = "sap.fe.test.JestService", options: compiler.ODataOptions = {}) {
	const sources: Record<string, string> = { "source.cds": cds };

	// allow to include stuff from @sap/cds/common
	if (cds.includes("'@sap/cds/common'")) {
		sources["common.cds"] = fs.readFileSync(require.resolve("@sap/cds/common.cds"), "utf-8");
	}

	const csn = compiler.compileSources(sources, {});

	const edmxOptions: compiler.ODataOptions = {
		odataForeignKeys: true,
		odataFormat: "structured",
		odataContainment: false,
		...options,
		service: service
	};

	const edmx = compiler.to.edmx(csn, edmxOptions);
	if (!edmx) {
		throw new Error(`Compilation failed. Hint: Make sure that the CDS model defines service ${service}.`);
	}
	return edmx;
}

export const getFakeSideEffectsService = async function (oMetaModel: ODataMetaModel): Promise<any> {
	const oServiceContext = { scopeObject: {}, scopeType: "", settings: {} };
	return new SideEffectsFactory().createInstance(oServiceContext).then(function (oServiceInstance: any) {
		const oJestSideEffectsService = oServiceInstance.getInterface();
		oJestSideEffectsService.getContext = function () {
			return {
				scopeObject: {
					getModel: function () {
						return {
							getMetaModel: function () {
								return oMetaModel;
							}
						};
					}
				}
			};
		};
		return oJestSideEffectsService;
	});
};

export const getFakeDiagnostics = function (): IDiagnostics {
	const issues: any[] = [];
	return {
		addIssue(issueCategory: IssueCategory, issueSeverity: IssueSeverity, details: string): void {
			issues.push({
				issueCategory,
				issueSeverity,
				details
			});
		},
		getIssues(): any[] {
			return issues;
		},
		checkIfIssueExists(issueCategory: IssueCategory, issueSeverity: IssueSeverity, details: string): boolean {
			return issues.find((issue) => {
				return issue.issueCategory === issueCategory && issue.issueSeverity === issueSeverity && issue.details === details;
			});
		}
	};
};

export const getConverterContextForTest = function (
	convertedTypes: ConvertedMetadata,
	manifestSettings: ListReportManifestSettings | ObjectPageManifestSettings
) {
	const entitySet = convertedTypes.entitySets.find((es) => es.name === manifestSettings.entitySet);
	const dataModelPath = getDataModelObjectPathForProperty(entitySet as EntitySet, convertedTypes, entitySet);
	return new ConverterContext(convertedTypes, manifestSettings, getFakeDiagnostics(), merge, dataModelPath);
};
const metaModelCache: any = {};
export const getMetaModel = async function (sMetadataUrl: string) {
	const oRequestor = _MetadataRequestor.create({}, "4.0", undefined, {});
	if (!metaModelCache[sMetadataUrl]) {
		const oMetaModel = new (ODataMetaModel as any)(oRequestor, sMetadataUrl, undefined, null);
		await oMetaModel.fetchEntityContainer();
		metaModelCache[sMetadataUrl] = oMetaModel;
	}

	return metaModelCache[sMetadataUrl];
};

export const getDataModelObjectPathForProperty = function (
	entitySet: EntitySet,
	convertedTypes: ConvertedMetadata,
	property?: Property | EntitySet | AnyAnnotation
): DataModelObjectPath {
	const targetPath: DataModelObjectPath = {
		startingEntitySet: entitySet,
		navigationProperties: [],
		targetObject: property,
		targetEntitySet: entitySet,
		targetEntityType: entitySet.entityType,
		convertedTypes: convertedTypes
	};
	targetPath.contextLocation = targetPath;
	return targetPath;
};

export const evaluateBinding = function (bindingString: string, ...args: any[]) {
	const bindingElement = BindingParser.complexParser(bindingString);
	return bindingElement.formatter.apply(undefined, args);
};

type ModelContent = {
	[name: string]: any;
};

/**
 * Evaluate a binding against a model.
 *
 * @param bindingString The binding string.
 * @param modelContent Content of the default model to use for evaluation.
 * @param namedModelsContent Contents of additional, named models to use.
 * @returns The evaluated binding.
 */
export function evaluateBindingWithModel(
	bindingString: string | undefined,
	modelContent: ModelContent,
	namedModelsContent?: { [modelName: string]: ModelContent }
): string {
	const bindingElement = BindingParser.complexParser(bindingString);
	const text = new InvisibleText();
	text.bindProperty("text", bindingElement);

	const defaultModel = new JSONModel(modelContent);
	text.setModel(defaultModel);
	text.setBindingContext(defaultModel.createBindingContext("/") as Context);

	if (namedModelsContent) {
		for (const [name, content] of Object.entries(namedModelsContent)) {
			const model = new JSONModel(content);
			text.setModel(model, name);
			text.setBindingContext(model.createBindingContext("/") as Context, name);
		}
	}

	return text.getText();
}

const TESTVIEWID = "testViewId";

const applyFlexChanges = async function (flexChanges: { [x: string]: object[] }, oMetaModel: MetaModel, resultXML: any) {
	// prefix Ids
	[...resultXML.querySelectorAll("[id]")].forEach((node) => {
		node.id = `${TESTVIEWID}--${node.id}`;
	});
	const changes = createFlexibilityChangesObject(TESTVIEWID, flexChanges);
	const appId = "someComponent";
	const oManifest = {
		"sap.app": {
			id: appId,
			type: "application",
			crossNavigation: {
				outbounds: []
			}
		}
	};
	const oAppComponent: AppComponent = {
		getDiagnostics: jest.fn().mockReturnValue(getFakeDiagnostics()),
		getModel: jest.fn().mockReturnValue({
			getMetaModel: jest.fn().mockReturnValue(oMetaModel)
		}),
		getComponentData: jest.fn().mockReturnValue({}),
		getManifestObject: jest.fn().mockReturnValue({
			getEntry: function (name: string) {
				return (oManifest as any)[name];
			}
		}),
		getLocalId: jest.fn((sId) => sId)
	} as unknown as AppComponent;
	//fake changes
	jest.spyOn(AppStorage, "loadFlexData").mockReturnValue(Promise.resolve(changes));
	jest.spyOn(Component, "get").mockReturnValue(oAppComponent);
	jest.spyOn(Utils, "getAppComponentForControl").mockReturnValue(oAppComponent);
	await FlexState.initialize({
		componentId: appId
	});
	resultXML = await XmlPreprocessor.process(resultXML, { name: "Test Fragment", componentId: appId, id: TESTVIEWID });

	//Assert that all changes have been applied
	const changesApplied = getChangesFromXML(resultXML);
	expect(changesApplied.length).toBe(flexChanges?.changes?.length ?? 0 + flexChanges?.variantDependentControlChanges?.length ?? 0);
	return resultXML;
};

export const getChangesFromXML = (xml: any) =>
	[...xml.querySelectorAll("*")]
		.flatMap((e) => [...e.attributes].map((a) => a.name))
		.filter((attr) => attr.includes("sap.ui.fl.appliedChanges"));

export const getTemplatingResult = async function (
	xmlInput: string,
	sMetadataUrl: string,
	mBindingContexts: { [x: string]: any; entitySet?: string },
	mModels: { [x: string]: any },
	flexChanges?: { [x: string]: object[] }
) {
	const templatedXml = `<root>${xmlInput}</root>`;
	const parser = new window.DOMParser();
	const xmlDoc = parser.parseFromString(templatedXml, "text/xml");
	// To ensure our macro can use #setBindingContext we ensure there is a pre existing JSONModel for converterContext
	// if not already passed to teh templating

	const oMetaModel = await getMetaModel(sMetadataUrl);
	const oPreprocessorSettings = await _buildPreProcessorSettings(sMetadataUrl, mBindingContexts, mModels);

	//This context for macro testing
	if (oPreprocessorSettings.models["this"]) {
		oPreprocessorSettings.bindingContexts["this"] = oPreprocessorSettings.models["this"].createBindingContext("/");
	}

	let resultXML = (await XMLPreprocessor.process(xmlDoc.firstElementChild!, { name: "Test Fragment" }, oPreprocessorSettings)) as any;

	if (flexChanges) {
		// apply flex changes
		resultXML = await applyFlexChanges(flexChanges, oMetaModel, resultXML);
	}
	return resultXML;
};

export const getTemplatedXML = async function (
	xmlInput: string,
	sMetadataUrl: string,
	mBindingContexts: { [x: string]: string },
	mModels: { [x: string]: any },
	flexChanges?: { [x: string]: object[] }
) {
	const templatedXML = await getTemplatingResult(xmlInput, sMetadataUrl, mBindingContexts, mModels, flexChanges);
	return serializeXML(templatedXML);
};

/**
 * Process the requested view with the provided data.
 *
 * @param name Fully qualified name of the view to be tested.
 * @param sMetadataUrl Url of the metadata.
 * @param mBindingContexts Map of the bindingContexts to set on the models.
 * @param mModels Map of the models.
 * @param flexChanges Object with UI changes like 'changes' or 'variantDependentControlChanges'
 * @returns Templated view as string
 */
export async function processView(
	name: string,
	sMetadataUrl: string,
	mBindingContexts: { [x: string]: string },
	mModels: { [x: string]: any },
	flexChanges?: { [x: string]: object[] }
): Promise<JestTemplatedView> {
	const oMetaModel = await getMetaModel(sMetadataUrl);
	const oViewDocument = _loadResourceView(name);
	const oPreprocessorSettings = await _buildPreProcessorSettings(sMetadataUrl, mBindingContexts, mModels);
	let oPreprocessedView = await XMLPreprocessor.process(oViewDocument, { name: name }, oPreprocessorSettings);
	if (flexChanges) {
		oPreprocessedView = await applyFlexChanges(flexChanges ?? [], oMetaModel, oPreprocessedView);
	}
	return {
		asElement: oPreprocessedView,
		asString: _removeCommentFromXml(oPreprocessedView?.outerHTML || "")
	};
}

/**
 * Process the requested XML fragment with the provided data.
 *
 * @param name Fully qualified name of the fragment to be tested.
 * @param testData Test data consisting
 * @returns Templated fragment as string
 */
export async function processFragment(name: string, testData: { [model: string]: object }): Promise<string> {
	const inputXml = `<root><core:Fragment fragmentName="${name}" type="XML" xmlns:core="sap.ui.core" /></root>`;
	const parser = new window.DOMParser();
	const inputDoc = parser.parseFromString(inputXml, "text/xml");

	// build model and bindings for given test data
	const settings = {
		models: {} as { [name: string]: JSONModel },
		bindingContexts: {} as { [name: string]: object }
	};
	for (const model in testData) {
		const jsonModel = new JSONModel();
		jsonModel.setData(testData[model]);
		settings.models[model] = jsonModel;
		settings.bindingContexts[model] = settings.models[model].createBindingContext("/") as Context;
	}

	// execute the pre-processor
	const resultDoc = await XMLPreprocessor.process(inputDoc.firstElementChild, { name }, settings);

	// exclude nested fragments from test snapshots
	const fragments = resultDoc.getElementsByTagName("core:Fragment") as any;
	if (fragments?.length > 0) {
		for (const fragment of fragments) {
			fragment.innerHTML = "";
		}
	}

	// Keep the fragment result as child of root node when fragment generates multiple root controls
	const xmlResult = resultDoc.children.length > 1 ? resultDoc.outerHTML : resultDoc.innerHTML;

	return _removeCommentFromXml(xmlResult);
}

export function serializeControl(controlToSerialize: Control | Control[]) {
	let tabCount = 0;
	function getTab(toAdd: number = 0) {
		let tab = "";
		for (let i = 0; i < tabCount + toAdd; i++) {
			tab += "\t";
		}
		return tab;
	}
	const serializeDelegate = {
		start: function (control: any, sAggregationName: string) {
			let controlDetail = "";
			if (sAggregationName) {
				if (control.getParent()) {
					const indexInParent = (control.getParent().getAggregation(sAggregationName) as ManagedObject[])?.indexOf?.(control);
					if (indexInParent > 0) {
						controlDetail += `,\n${getTab()}`;
					}
				}
			}
			controlDetail += `${control.getMetadata().getName()}(`;
			return controlDetail;
		},
		end: function () {
			return "})";
		},
		middle: function (control: any) {
			const id = control.getId();
			let data = `{id: ${ManagedObjectMetadata.isGeneratedId(id) ? "__dynamicId" : id}`;
			for (const oControlKey in control.mProperties) {
				if (control.mProperties.hasOwnProperty(oControlKey)) {
					data += `,\n${getTab()} ${oControlKey}: ${control.mProperties[oControlKey]}`;
				} else if (control.mBindingInfos.hasOwnProperty(oControlKey)) {
					const bindingDetail = control.mBindingInfos[oControlKey];
					data += `,\n${getTab()} ${oControlKey}: ${JSON.stringify(bindingDetail)}`;
				}
			}
			for (const oControlKey in control.mAssociations) {
				if (control.mAssociations.hasOwnProperty(oControlKey)) {
					data += `,\n${getTab()} ${oControlKey}: ${
						(control.mAssociations[oControlKey]?.join?.(",") ?? control.mAssociations[oControlKey]) || undefined
					}`;
				}
			}
			for (const oControlKey in control.mEventRegistry) {
				if (control.mEventRegistry.hasOwnProperty(oControlKey)) {
					data += `,\n${getTab()} ${oControlKey}: true}`;
				}
			}
			data += ``;
			return data;
		},
		startAggregation: function (control: any, sName: string) {
			let out = `,\n${getTab()}${sName}`;
			tabCount++;

			if (control.mBindingInfos[sName]) {
				out += `={ path:'${control.mBindingInfos[sName].path}', template:\n${getTab()}`;
			} else {
				out += `=[\n${getTab()}`;
			}
			return out;
		},
		endAggregation: function (control: any, sName: string) {
			tabCount--;
			if (control.mBindingInfos[sName]) {
				return `\n${getTab()}}`;
			} else {
				return `\n${getTab()}]`;
			}
		}
	};
	if (Array.isArray(controlToSerialize)) {
		return controlToSerialize.map((controlToRender: Control) => {
			return new Serializer(controlToRender, serializeDelegate).serialize();
		});
	} else {
		return new Serializer(controlToSerialize, serializeDelegate).serialize();
	}
}

export function createAwaiter() {
	let fnResolve!: Function;
	const myPromise = new Promise((resolve) => {
		fnResolve = resolve;
	});
	return { promise: myPromise, resolve: fnResolve };
}
