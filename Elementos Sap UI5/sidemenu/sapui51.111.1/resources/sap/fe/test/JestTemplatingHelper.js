/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["@sap/cds-compiler", "fs", "@prettier/plugin-xml", "path", "prettier", "sap/base/Log", "sap/base/util/LoaderExtensions", "sap/base/util/merge", "sap/fe/core/buildingBlocks/BuildingBlockRuntime", "sap/fe/core/converters/ConverterContext", "sap/fe/core/services/SideEffectsServiceFactory", "sap/fe/core/TemplateModel", "sap/ui/base/BindingParser", "sap/ui/base/ManagedObjectMetadata", "sap/ui/core/Component", "sap/ui/core/InvisibleText", "sap/ui/core/util/serializer/Serializer", "sap/ui/core/util/XMLPreprocessor", "sap/ui/fl/apply/_internal/flexState/FlexState", "sap/ui/fl/apply/_internal/preprocessors/XmlPreprocessor", "sap/ui/fl/initial/_internal/Storage", "sap/ui/fl/Utils", "sap/ui/model/json/JSONModel", "sap/ui/model/odata/v4/lib/_MetadataRequestor", "sap/ui/model/odata/v4/ODataMetaModel", "xpath", "./JestFlexibilityHelper"], function (compiler, fs, plugin, path, prettier, Log, LoaderExtensions, merge, BuildingBlockRuntime, ConverterContext, SideEffectsFactory, TemplateModel, BindingParser, ManagedObjectMetadata, Component, InvisibleText, Serializer, XMLPreprocessor, FlexState, XmlPreprocessor, AppStorage, Utils, JSONModel, _MetadataRequestor, ODataMetaModel, xpath, JestFlexibilityHelper) {
  "use strict";

  var _exports = {};
  var createFlexibilityChangesObject = JestFlexibilityHelper.createFlexibilityChangesObject;
  var registerBuildingBlock = BuildingBlockRuntime.registerBuildingBlock;
  var format = prettier.format;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const formatXml = require("xml-formatter");
  Log.setLevel(1, "sap.ui.core.util.XMLPreprocessor");
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
  function _getTemplatedSelector(xmldom, selector) {
    /**
     * if a root element has been added during the templating by our Jest Templating methods
     * the root element is added to the selector path.
     */
    const rootPath = "/root";
    return `${xmldom.nodeName === "root" && !selector.startsWith(rootPath) ? rootPath : ""}${selector}`;
  }
  async function _buildPreProcessorSettings(sMetadataUrl, mBindingContexts, mModels) {
    const oMetaModel = await getMetaModel(sMetadataUrl);

    // To ensure our macro can use #setBindingContext we ensure there is a pre existing JSONModel for converterContext
    // if not already passed to teh templating
    if (!mModels.hasOwnProperty("converterContext")) {
      mModels = Object.assign(mModels, {
        converterContext: new TemplateModel({}, oMetaModel)
      });
    }
    Object.keys(mModels).forEach(function (sModelName) {
      if (mModels[sModelName] && mModels[sModelName].isTemplateModel) {
        mModels[sModelName] = new TemplateModel(mModels[sModelName].data, oMetaModel);
      }
    });
    const settings = {
      models: Object.assign({
        metaModel: oMetaModel
      }, mModels),
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
  function _removeCommentFromXml(xml) {
    return formatXml(xml, {
      filter: node => node.type !== "Comment"
    });
  }
  function _loadResourceView(viewName) {
    const name = viewName.replace(/\./g, "/") + ".view.xml";
    const view = LoaderExtensions.loadResource(name);
    return view.documentElement;
  }
  const registerMacro = function (macroMetadata) {
    registerBuildingBlock(macroMetadata);
  };
  _exports.registerMacro = registerMacro;
  const unregisterMacro = function (macroMetadata) {
    XMLPreprocessor.plugIn(null, macroMetadata.namespace, macroMetadata.name);
    if (macroMetadata.publicNamespace) {
      XMLPreprocessor.plugIn(null, macroMetadata.publicNamespace, macroMetadata.name);
    }
  };
  _exports.unregisterMacro = unregisterMacro;
  const runXPathQuery = function (selector, xmldom) {
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
  _exports.runXPathQuery = runXPathQuery;
  const formatBuildingBlockXML = function (xmlString) {
    if (Array.isArray(xmlString)) {
      xmlString = xmlString.join("");
    }
    let xmlFormatted = formatXML(xmlString);
    xmlFormatted = xmlFormatted.replace(/uid--id-[0-9]{13}-[0-9]{1,2}/g, "uid--id");
    return xmlFormatted;
  };
  _exports.formatBuildingBlockXML = formatBuildingBlockXML;
  const getControlAttribute = function (controlSelector, attributeName, xmlDom) {
    const selector = `string(${_getTemplatedSelector(xmlDom, controlSelector)}/@${attributeName})`;
    return runXPathQuery(selector, xmlDom);
  };
  _exports.getControlAttribute = getControlAttribute;
  const serializeXML = function (xmlDom) {
    const serializer = new window.XMLSerializer();
    const xmlString = serializer.serializeToString(xmlDom);
    return formatXML(xmlString);
  };
  _exports.serializeXML = serializeXML;
  const formatXML = function (xmlString) {
    return format(xmlString, {
      parser: "xml",
      xmlWhitespaceSensitivity: "ignore",
      plugins: [plugin]
    });
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
  _exports.formatXML = formatXML;
  const compileCDS = function (cdsUrl) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    let edmxFileName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : path.basename(cdsUrl).replace(".cds", ".xml");
    const cdsString = fs.readFileSync(cdsUrl, "utf-8");
    const edmxContent = cds2edmx(cdsString, "sap.fe.test.JestService", options);
    const dir = path.resolve(cdsUrl, "..", "gen");
    const edmxFilePath = path.resolve(dir, edmxFileName);
    fs.mkdirSync(dir, {
      recursive: true
    });
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
  _exports.compileCDS = compileCDS;
  function cds2edmx(cds) {
    let service = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "sap.fe.test.JestService";
    let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    const sources = {
      "source.cds": cds
    };

    // allow to include stuff from @sap/cds/common
    if (cds.includes("'@sap/cds/common'")) {
      sources["common.cds"] = fs.readFileSync(require.resolve("@sap/cds/common.cds"), "utf-8");
    }
    const csn = compiler.compileSources(sources, {});
    const edmxOptions = {
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
  _exports.cds2edmx = cds2edmx;
  const getFakeSideEffectsService = async function (oMetaModel) {
    const oServiceContext = {
      scopeObject: {},
      scopeType: "",
      settings: {}
    };
    return new SideEffectsFactory().createInstance(oServiceContext).then(function (oServiceInstance) {
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
  _exports.getFakeSideEffectsService = getFakeSideEffectsService;
  const getFakeDiagnostics = function () {
    const issues = [];
    return {
      addIssue(issueCategory, issueSeverity, details) {
        issues.push({
          issueCategory,
          issueSeverity,
          details
        });
      },
      getIssues() {
        return issues;
      },
      checkIfIssueExists(issueCategory, issueSeverity, details) {
        return issues.find(issue => {
          return issue.issueCategory === issueCategory && issue.issueSeverity === issueSeverity && issue.details === details;
        });
      }
    };
  };
  _exports.getFakeDiagnostics = getFakeDiagnostics;
  const getConverterContextForTest = function (convertedTypes, manifestSettings) {
    const entitySet = convertedTypes.entitySets.find(es => es.name === manifestSettings.entitySet);
    const dataModelPath = getDataModelObjectPathForProperty(entitySet, convertedTypes, entitySet);
    return new ConverterContext(convertedTypes, manifestSettings, getFakeDiagnostics(), merge, dataModelPath);
  };
  _exports.getConverterContextForTest = getConverterContextForTest;
  const metaModelCache = {};
  const getMetaModel = async function (sMetadataUrl) {
    const oRequestor = _MetadataRequestor.create({}, "4.0", undefined, {});
    if (!metaModelCache[sMetadataUrl]) {
      const oMetaModel = new ODataMetaModel(oRequestor, sMetadataUrl, undefined, null);
      await oMetaModel.fetchEntityContainer();
      metaModelCache[sMetadataUrl] = oMetaModel;
    }
    return metaModelCache[sMetadataUrl];
  };
  _exports.getMetaModel = getMetaModel;
  const getDataModelObjectPathForProperty = function (entitySet, convertedTypes, property) {
    const targetPath = {
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
  _exports.getDataModelObjectPathForProperty = getDataModelObjectPathForProperty;
  const evaluateBinding = function (bindingString) {
    const bindingElement = BindingParser.complexParser(bindingString);
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }
    return bindingElement.formatter.apply(undefined, args);
  };
  _exports.evaluateBinding = evaluateBinding;
  /**
   * Evaluate a binding against a model.
   *
   * @param bindingString The binding string.
   * @param modelContent Content of the default model to use for evaluation.
   * @param namedModelsContent Contents of additional, named models to use.
   * @returns The evaluated binding.
   */
  function evaluateBindingWithModel(bindingString, modelContent, namedModelsContent) {
    const bindingElement = BindingParser.complexParser(bindingString);
    const text = new InvisibleText();
    text.bindProperty("text", bindingElement);
    const defaultModel = new JSONModel(modelContent);
    text.setModel(defaultModel);
    text.setBindingContext(defaultModel.createBindingContext("/"));
    if (namedModelsContent) {
      for (const [name, content] of Object.entries(namedModelsContent)) {
        const model = new JSONModel(content);
        text.setModel(model, name);
        text.setBindingContext(model.createBindingContext("/"), name);
      }
    }
    return text.getText();
  }
  _exports.evaluateBindingWithModel = evaluateBindingWithModel;
  const TESTVIEWID = "testViewId";
  const applyFlexChanges = async function (flexChanges, oMetaModel, resultXML) {
    var _flexChanges$changes, _flexChanges$variantD;
    // prefix Ids
    [...resultXML.querySelectorAll("[id]")].forEach(node => {
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
    const oAppComponent = {
      getDiagnostics: jest.fn().mockReturnValue(getFakeDiagnostics()),
      getModel: jest.fn().mockReturnValue({
        getMetaModel: jest.fn().mockReturnValue(oMetaModel)
      }),
      getComponentData: jest.fn().mockReturnValue({}),
      getManifestObject: jest.fn().mockReturnValue({
        getEntry: function (name) {
          return oManifest[name];
        }
      }),
      getLocalId: jest.fn(sId => sId)
    };
    //fake changes
    jest.spyOn(AppStorage, "loadFlexData").mockReturnValue(Promise.resolve(changes));
    jest.spyOn(Component, "get").mockReturnValue(oAppComponent);
    jest.spyOn(Utils, "getAppComponentForControl").mockReturnValue(oAppComponent);
    await FlexState.initialize({
      componentId: appId
    });
    resultXML = await XmlPreprocessor.process(resultXML, {
      name: "Test Fragment",
      componentId: appId,
      id: TESTVIEWID
    });

    //Assert that all changes have been applied
    const changesApplied = getChangesFromXML(resultXML);
    expect(changesApplied.length).toBe((flexChanges === null || flexChanges === void 0 ? void 0 : (_flexChanges$changes = flexChanges.changes) === null || _flexChanges$changes === void 0 ? void 0 : _flexChanges$changes.length) ?? 0 + (flexChanges === null || flexChanges === void 0 ? void 0 : (_flexChanges$variantD = flexChanges.variantDependentControlChanges) === null || _flexChanges$variantD === void 0 ? void 0 : _flexChanges$variantD.length) ?? 0);
    return resultXML;
  };
  const getChangesFromXML = xml => [...xml.querySelectorAll("*")].flatMap(e => [...e.attributes].map(a => a.name)).filter(attr => attr.includes("sap.ui.fl.appliedChanges"));
  _exports.getChangesFromXML = getChangesFromXML;
  const getTemplatingResult = async function (xmlInput, sMetadataUrl, mBindingContexts, mModels, flexChanges) {
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
    let resultXML = await XMLPreprocessor.process(xmlDoc.firstElementChild, {
      name: "Test Fragment"
    }, oPreprocessorSettings);
    if (flexChanges) {
      // apply flex changes
      resultXML = await applyFlexChanges(flexChanges, oMetaModel, resultXML);
    }
    return resultXML;
  };
  _exports.getTemplatingResult = getTemplatingResult;
  const getTemplatedXML = async function (xmlInput, sMetadataUrl, mBindingContexts, mModels, flexChanges) {
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
  _exports.getTemplatedXML = getTemplatedXML;
  async function processView(name, sMetadataUrl, mBindingContexts, mModels, flexChanges) {
    var _oPreprocessedView;
    const oMetaModel = await getMetaModel(sMetadataUrl);
    const oViewDocument = _loadResourceView(name);
    const oPreprocessorSettings = await _buildPreProcessorSettings(sMetadataUrl, mBindingContexts, mModels);
    let oPreprocessedView = await XMLPreprocessor.process(oViewDocument, {
      name: name
    }, oPreprocessorSettings);
    if (flexChanges) {
      oPreprocessedView = await applyFlexChanges(flexChanges ?? [], oMetaModel, oPreprocessedView);
    }
    return {
      asElement: oPreprocessedView,
      asString: _removeCommentFromXml(((_oPreprocessedView = oPreprocessedView) === null || _oPreprocessedView === void 0 ? void 0 : _oPreprocessedView.outerHTML) || "")
    };
  }

  /**
   * Process the requested XML fragment with the provided data.
   *
   * @param name Fully qualified name of the fragment to be tested.
   * @param testData Test data consisting
   * @returns Templated fragment as string
   */
  _exports.processView = processView;
  async function processFragment(name, testData) {
    const inputXml = `<root><core:Fragment fragmentName="${name}" type="XML" xmlns:core="sap.ui.core" /></root>`;
    const parser = new window.DOMParser();
    const inputDoc = parser.parseFromString(inputXml, "text/xml");

    // build model and bindings for given test data
    const settings = {
      models: {},
      bindingContexts: {}
    };
    for (const model in testData) {
      const jsonModel = new JSONModel();
      jsonModel.setData(testData[model]);
      settings.models[model] = jsonModel;
      settings.bindingContexts[model] = settings.models[model].createBindingContext("/");
    }

    // execute the pre-processor
    const resultDoc = await XMLPreprocessor.process(inputDoc.firstElementChild, {
      name
    }, settings);

    // exclude nested fragments from test snapshots
    const fragments = resultDoc.getElementsByTagName("core:Fragment");
    if ((fragments === null || fragments === void 0 ? void 0 : fragments.length) > 0) {
      for (const fragment of fragments) {
        fragment.innerHTML = "";
      }
    }

    // Keep the fragment result as child of root node when fragment generates multiple root controls
    const xmlResult = resultDoc.children.length > 1 ? resultDoc.outerHTML : resultDoc.innerHTML;
    return _removeCommentFromXml(xmlResult);
  }
  _exports.processFragment = processFragment;
  function serializeControl(controlToSerialize) {
    let tabCount = 0;
    function getTab() {
      let toAdd = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      let tab = "";
      for (let i = 0; i < tabCount + toAdd; i++) {
        tab += "\t";
      }
      return tab;
    }
    const serializeDelegate = {
      start: function (control, sAggregationName) {
        let controlDetail = "";
        if (sAggregationName) {
          if (control.getParent()) {
            var _control$getParent$ge, _control$getParent$ge2;
            const indexInParent = (_control$getParent$ge = control.getParent().getAggregation(sAggregationName)) === null || _control$getParent$ge === void 0 ? void 0 : (_control$getParent$ge2 = _control$getParent$ge.indexOf) === null || _control$getParent$ge2 === void 0 ? void 0 : _control$getParent$ge2.call(_control$getParent$ge, control);
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
      middle: function (control) {
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
            var _control$mAssociation, _control$mAssociation2, _control$mAssociation3;
            data += `,\n${getTab()} ${oControlKey}: ${(((_control$mAssociation = control.mAssociations[oControlKey]) === null || _control$mAssociation === void 0 ? void 0 : (_control$mAssociation2 = (_control$mAssociation3 = _control$mAssociation).join) === null || _control$mAssociation2 === void 0 ? void 0 : _control$mAssociation2.call(_control$mAssociation3, ",")) ?? control.mAssociations[oControlKey]) || undefined}`;
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
      startAggregation: function (control, sName) {
        let out = `,\n${getTab()}${sName}`;
        tabCount++;
        if (control.mBindingInfos[sName]) {
          out += `={ path:'${control.mBindingInfos[sName].path}', template:\n${getTab()}`;
        } else {
          out += `=[\n${getTab()}`;
        }
        return out;
      },
      endAggregation: function (control, sName) {
        tabCount--;
        if (control.mBindingInfos[sName]) {
          return `\n${getTab()}}`;
        } else {
          return `\n${getTab()}]`;
        }
      }
    };
    if (Array.isArray(controlToSerialize)) {
      return controlToSerialize.map(controlToRender => {
        return new Serializer(controlToRender, serializeDelegate).serialize();
      });
    } else {
      return new Serializer(controlToSerialize, serializeDelegate).serialize();
    }
  }
  _exports.serializeControl = serializeControl;
  function createAwaiter() {
    let fnResolve;
    const myPromise = new Promise(resolve => {
      fnResolve = resolve;
    });
    return {
      promise: myPromise,
      resolve: fnResolve
    };
  }
  _exports.createAwaiter = createAwaiter;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJmb3JtYXRYbWwiLCJyZXF1aXJlIiwiTG9nIiwic2V0TGV2ZWwiLCJqZXN0Iiwic2V0VGltZW91dCIsIm5hbWVTcGFjZU1hcCIsIm1hY3JvcyIsIm1hY3JvIiwibWFjcm9GaWVsZCIsIm1hY3JvZGF0YSIsImxvZyIsInVuaXR0ZXN0IiwiY29udHJvbCIsImNvcmUiLCJkdCIsIm0iLCJmIiwiZmwiLCJpbnRlcm5hbE1hY3JvIiwibWRjIiwibWRjYXQiLCJtZGNGaWVsZCIsIm1kY1RhYmxlIiwidSIsIm1hY3JvTWljcm9DaGFydCIsIm1pY3JvQ2hhcnQiLCJtYWNyb1RhYmxlIiwic2VsZWN0IiwieHBhdGgiLCJ1c2VOYW1lc3BhY2VzIiwiX2dldFRlbXBsYXRlZFNlbGVjdG9yIiwieG1sZG9tIiwic2VsZWN0b3IiLCJyb290UGF0aCIsIm5vZGVOYW1lIiwic3RhcnRzV2l0aCIsIl9idWlsZFByZVByb2Nlc3NvclNldHRpbmdzIiwic01ldGFkYXRhVXJsIiwibUJpbmRpbmdDb250ZXh0cyIsIm1Nb2RlbHMiLCJvTWV0YU1vZGVsIiwiZ2V0TWV0YU1vZGVsIiwiaGFzT3duUHJvcGVydHkiLCJPYmplY3QiLCJhc3NpZ24iLCJjb252ZXJ0ZXJDb250ZXh0IiwiVGVtcGxhdGVNb2RlbCIsImtleXMiLCJmb3JFYWNoIiwic01vZGVsTmFtZSIsImlzVGVtcGxhdGVNb2RlbCIsImRhdGEiLCJzZXR0aW5ncyIsIm1vZGVscyIsIm1ldGFNb2RlbCIsImJpbmRpbmdDb250ZXh0cyIsInNLZXkiLCJleHBlY3QiLCJnZXRPYmplY3QiLCJ0b0JlRGVmaW5lZCIsIm9Nb2RlbCIsImNyZWF0ZUJpbmRpbmdDb250ZXh0IiwiX3JlbW92ZUNvbW1lbnRGcm9tWG1sIiwieG1sIiwiZmlsdGVyIiwibm9kZSIsInR5cGUiLCJfbG9hZFJlc291cmNlVmlldyIsInZpZXdOYW1lIiwibmFtZSIsInJlcGxhY2UiLCJ2aWV3IiwiTG9hZGVyRXh0ZW5zaW9ucyIsImxvYWRSZXNvdXJjZSIsImRvY3VtZW50RWxlbWVudCIsInJlZ2lzdGVyTWFjcm8iLCJtYWNyb01ldGFkYXRhIiwicmVnaXN0ZXJCdWlsZGluZ0Jsb2NrIiwidW5yZWdpc3Rlck1hY3JvIiwiWE1MUHJlcHJvY2Vzc29yIiwicGx1Z0luIiwibmFtZXNwYWNlIiwicHVibGljTmFtZXNwYWNlIiwicnVuWFBhdGhRdWVyeSIsImV4dGVuZCIsInRvSGF2ZUNvbnRyb2wiLCJub2RlcyIsIm1lc3NhZ2UiLCJvdXRwdXRYbWwiLCJzZXJpYWxpemVYTUwiLCJwYXNzIiwibGVuZ3RoIiwidG9Ob3RIYXZlQ29udHJvbCIsImZvcm1hdEJ1aWxkaW5nQmxvY2tYTUwiLCJ4bWxTdHJpbmciLCJBcnJheSIsImlzQXJyYXkiLCJqb2luIiwieG1sRm9ybWF0dGVkIiwiZm9ybWF0WE1MIiwiZ2V0Q29udHJvbEF0dHJpYnV0ZSIsImNvbnRyb2xTZWxlY3RvciIsImF0dHJpYnV0ZU5hbWUiLCJ4bWxEb20iLCJzZXJpYWxpemVyIiwid2luZG93IiwiWE1MU2VyaWFsaXplciIsInNlcmlhbGl6ZVRvU3RyaW5nIiwiZm9ybWF0IiwicGFyc2VyIiwieG1sV2hpdGVzcGFjZVNlbnNpdGl2aXR5IiwicGx1Z2lucyIsInBsdWdpbiIsImNvbXBpbGVDRFMiLCJjZHNVcmwiLCJvcHRpb25zIiwiZWRteEZpbGVOYW1lIiwicGF0aCIsImJhc2VuYW1lIiwiY2RzU3RyaW5nIiwiZnMiLCJyZWFkRmlsZVN5bmMiLCJlZG14Q29udGVudCIsImNkczJlZG14IiwiZGlyIiwicmVzb2x2ZSIsImVkbXhGaWxlUGF0aCIsIm1rZGlyU3luYyIsInJlY3Vyc2l2ZSIsIndyaXRlRmlsZVN5bmMiLCJjZHMiLCJzZXJ2aWNlIiwic291cmNlcyIsImluY2x1ZGVzIiwiY3NuIiwiY29tcGlsZXIiLCJjb21waWxlU291cmNlcyIsImVkbXhPcHRpb25zIiwib2RhdGFGb3JlaWduS2V5cyIsIm9kYXRhRm9ybWF0Iiwib2RhdGFDb250YWlubWVudCIsImVkbXgiLCJ0byIsIkVycm9yIiwiZ2V0RmFrZVNpZGVFZmZlY3RzU2VydmljZSIsIm9TZXJ2aWNlQ29udGV4dCIsInNjb3BlT2JqZWN0Iiwic2NvcGVUeXBlIiwiU2lkZUVmZmVjdHNGYWN0b3J5IiwiY3JlYXRlSW5zdGFuY2UiLCJ0aGVuIiwib1NlcnZpY2VJbnN0YW5jZSIsIm9KZXN0U2lkZUVmZmVjdHNTZXJ2aWNlIiwiZ2V0SW50ZXJmYWNlIiwiZ2V0Q29udGV4dCIsImdldE1vZGVsIiwiZ2V0RmFrZURpYWdub3N0aWNzIiwiaXNzdWVzIiwiYWRkSXNzdWUiLCJpc3N1ZUNhdGVnb3J5IiwiaXNzdWVTZXZlcml0eSIsImRldGFpbHMiLCJwdXNoIiwiZ2V0SXNzdWVzIiwiY2hlY2tJZklzc3VlRXhpc3RzIiwiZmluZCIsImlzc3VlIiwiZ2V0Q29udmVydGVyQ29udGV4dEZvclRlc3QiLCJjb252ZXJ0ZWRUeXBlcyIsIm1hbmlmZXN0U2V0dGluZ3MiLCJlbnRpdHlTZXQiLCJlbnRpdHlTZXRzIiwiZXMiLCJkYXRhTW9kZWxQYXRoIiwiZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aEZvclByb3BlcnR5IiwiQ29udmVydGVyQ29udGV4dCIsIm1lcmdlIiwibWV0YU1vZGVsQ2FjaGUiLCJvUmVxdWVzdG9yIiwiX01ldGFkYXRhUmVxdWVzdG9yIiwiY3JlYXRlIiwidW5kZWZpbmVkIiwiT0RhdGFNZXRhTW9kZWwiLCJmZXRjaEVudGl0eUNvbnRhaW5lciIsInByb3BlcnR5IiwidGFyZ2V0UGF0aCIsInN0YXJ0aW5nRW50aXR5U2V0IiwibmF2aWdhdGlvblByb3BlcnRpZXMiLCJ0YXJnZXRPYmplY3QiLCJ0YXJnZXRFbnRpdHlTZXQiLCJ0YXJnZXRFbnRpdHlUeXBlIiwiZW50aXR5VHlwZSIsImNvbnRleHRMb2NhdGlvbiIsImV2YWx1YXRlQmluZGluZyIsImJpbmRpbmdTdHJpbmciLCJiaW5kaW5nRWxlbWVudCIsIkJpbmRpbmdQYXJzZXIiLCJjb21wbGV4UGFyc2VyIiwiYXJncyIsImZvcm1hdHRlciIsImFwcGx5IiwiZXZhbHVhdGVCaW5kaW5nV2l0aE1vZGVsIiwibW9kZWxDb250ZW50IiwibmFtZWRNb2RlbHNDb250ZW50IiwidGV4dCIsIkludmlzaWJsZVRleHQiLCJiaW5kUHJvcGVydHkiLCJkZWZhdWx0TW9kZWwiLCJKU09OTW9kZWwiLCJzZXRNb2RlbCIsInNldEJpbmRpbmdDb250ZXh0IiwiY29udGVudCIsImVudHJpZXMiLCJtb2RlbCIsImdldFRleHQiLCJURVNUVklFV0lEIiwiYXBwbHlGbGV4Q2hhbmdlcyIsImZsZXhDaGFuZ2VzIiwicmVzdWx0WE1MIiwicXVlcnlTZWxlY3RvckFsbCIsImlkIiwiY2hhbmdlcyIsImNyZWF0ZUZsZXhpYmlsaXR5Q2hhbmdlc09iamVjdCIsImFwcElkIiwib01hbmlmZXN0IiwiY3Jvc3NOYXZpZ2F0aW9uIiwib3V0Ym91bmRzIiwib0FwcENvbXBvbmVudCIsImdldERpYWdub3N0aWNzIiwiZm4iLCJtb2NrUmV0dXJuVmFsdWUiLCJnZXRDb21wb25lbnREYXRhIiwiZ2V0TWFuaWZlc3RPYmplY3QiLCJnZXRFbnRyeSIsImdldExvY2FsSWQiLCJzSWQiLCJzcHlPbiIsIkFwcFN0b3JhZ2UiLCJQcm9taXNlIiwiQ29tcG9uZW50IiwiVXRpbHMiLCJGbGV4U3RhdGUiLCJpbml0aWFsaXplIiwiY29tcG9uZW50SWQiLCJYbWxQcmVwcm9jZXNzb3IiLCJwcm9jZXNzIiwiY2hhbmdlc0FwcGxpZWQiLCJnZXRDaGFuZ2VzRnJvbVhNTCIsInRvQmUiLCJ2YXJpYW50RGVwZW5kZW50Q29udHJvbENoYW5nZXMiLCJmbGF0TWFwIiwiZSIsImF0dHJpYnV0ZXMiLCJtYXAiLCJhIiwiYXR0ciIsImdldFRlbXBsYXRpbmdSZXN1bHQiLCJ4bWxJbnB1dCIsInRlbXBsYXRlZFhtbCIsIkRPTVBhcnNlciIsInhtbERvYyIsInBhcnNlRnJvbVN0cmluZyIsIm9QcmVwcm9jZXNzb3JTZXR0aW5ncyIsImZpcnN0RWxlbWVudENoaWxkIiwiZ2V0VGVtcGxhdGVkWE1MIiwidGVtcGxhdGVkWE1MIiwicHJvY2Vzc1ZpZXciLCJvVmlld0RvY3VtZW50Iiwib1ByZXByb2Nlc3NlZFZpZXciLCJhc0VsZW1lbnQiLCJhc1N0cmluZyIsIm91dGVySFRNTCIsInByb2Nlc3NGcmFnbWVudCIsInRlc3REYXRhIiwiaW5wdXRYbWwiLCJpbnB1dERvYyIsImpzb25Nb2RlbCIsInNldERhdGEiLCJyZXN1bHREb2MiLCJmcmFnbWVudHMiLCJnZXRFbGVtZW50c0J5VGFnTmFtZSIsImZyYWdtZW50IiwiaW5uZXJIVE1MIiwieG1sUmVzdWx0IiwiY2hpbGRyZW4iLCJzZXJpYWxpemVDb250cm9sIiwiY29udHJvbFRvU2VyaWFsaXplIiwidGFiQ291bnQiLCJnZXRUYWIiLCJ0b0FkZCIsInRhYiIsImkiLCJzZXJpYWxpemVEZWxlZ2F0ZSIsInN0YXJ0Iiwic0FnZ3JlZ2F0aW9uTmFtZSIsImNvbnRyb2xEZXRhaWwiLCJnZXRQYXJlbnQiLCJpbmRleEluUGFyZW50IiwiZ2V0QWdncmVnYXRpb24iLCJpbmRleE9mIiwiZ2V0TWV0YWRhdGEiLCJnZXROYW1lIiwiZW5kIiwibWlkZGxlIiwiZ2V0SWQiLCJNYW5hZ2VkT2JqZWN0TWV0YWRhdGEiLCJpc0dlbmVyYXRlZElkIiwib0NvbnRyb2xLZXkiLCJtUHJvcGVydGllcyIsIm1CaW5kaW5nSW5mb3MiLCJiaW5kaW5nRGV0YWlsIiwiSlNPTiIsInN0cmluZ2lmeSIsIm1Bc3NvY2lhdGlvbnMiLCJtRXZlbnRSZWdpc3RyeSIsInN0YXJ0QWdncmVnYXRpb24iLCJzTmFtZSIsIm91dCIsImVuZEFnZ3JlZ2F0aW9uIiwiY29udHJvbFRvUmVuZGVyIiwiU2VyaWFsaXplciIsInNlcmlhbGl6ZSIsImNyZWF0ZUF3YWl0ZXIiLCJmblJlc29sdmUiLCJteVByb21pc2UiLCJwcm9taXNlIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJKZXN0VGVtcGxhdGluZ0hlbHBlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IEFueUFubm90YXRpb24sIENvbnZlcnRlZE1ldGFkYXRhLCBFbnRpdHlTZXQsIFByb3BlcnR5IH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzXCI7XG5pbXBvcnQgY29tcGlsZXIgZnJvbSBcIkBzYXAvY2RzLWNvbXBpbGVyXCI7XG5pbXBvcnQgKiBhcyBmcyBmcm9tIFwiZnNcIjtcbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcbi8vIEB0cy1pZ25vcmVcbmltcG9ydCAqIGFzIHBsdWdpbiBmcm9tIFwiQHByZXR0aWVyL3BsdWdpbi14bWxcIjtcbmltcG9ydCAqIGFzIHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCB0eXBlIHsgT3B0aW9ucyB9IGZyb20gXCJwcmV0dGllclwiO1xuaW1wb3J0IHsgZm9ybWF0IH0gZnJvbSBcInByZXR0aWVyXCI7XG5pbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBMb2FkZXJFeHRlbnNpb25zIGZyb20gXCJzYXAvYmFzZS91dGlsL0xvYWRlckV4dGVuc2lvbnNcIjtcbmltcG9ydCBtZXJnZSBmcm9tIFwic2FwL2Jhc2UvdXRpbC9tZXJnZVwiO1xuaW1wb3J0IEFwcENvbXBvbmVudCBmcm9tIFwic2FwL2ZlL2NvcmUvQXBwQ29tcG9uZW50XCI7XG5pbXBvcnQgeyByZWdpc3RlckJ1aWxkaW5nQmxvY2sgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1J1bnRpbWVcIjtcbmltcG9ydCBDb252ZXJ0ZXJDb250ZXh0IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL0NvbnZlcnRlckNvbnRleHRcIjtcbmltcG9ydCB0eXBlIHsgSXNzdWVDYXRlZ29yeSwgSXNzdWVTZXZlcml0eSB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvSXNzdWVNYW5hZ2VyXCI7XG5pbXBvcnQgdHlwZSB7IExpc3RSZXBvcnRNYW5pZmVzdFNldHRpbmdzLCBPYmplY3RQYWdlTWFuaWZlc3RTZXR0aW5ncyB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL01hbmlmZXN0U2V0dGluZ3NcIjtcbmltcG9ydCB0eXBlIHsgSURpYWdub3N0aWNzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvVGVtcGxhdGVDb252ZXJ0ZXJcIjtcbmltcG9ydCBTaWRlRWZmZWN0c0ZhY3RvcnkgZnJvbSBcInNhcC9mZS9jb3JlL3NlcnZpY2VzL1NpZGVFZmZlY3RzU2VydmljZUZhY3RvcnlcIjtcbmltcG9ydCBUZW1wbGF0ZU1vZGVsIGZyb20gXCJzYXAvZmUvY29yZS9UZW1wbGF0ZU1vZGVsXCI7XG5pbXBvcnQgdHlwZSB7IERhdGFNb2RlbE9iamVjdFBhdGggfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9EYXRhTW9kZWxQYXRoSGVscGVyXCI7XG5pbXBvcnQgQmluZGluZ1BhcnNlciBmcm9tIFwic2FwL3VpL2Jhc2UvQmluZGluZ1BhcnNlclwiO1xuaW1wb3J0IE1hbmFnZWRPYmplY3QgZnJvbSBcInNhcC91aS9iYXNlL01hbmFnZWRPYmplY3RcIjtcbmltcG9ydCBNYW5hZ2VkT2JqZWN0TWV0YWRhdGEgZnJvbSBcInNhcC91aS9iYXNlL01hbmFnZWRPYmplY3RNZXRhZGF0YVwiO1xuaW1wb3J0IENvbXBvbmVudCBmcm9tIFwic2FwL3VpL2NvcmUvQ29tcG9uZW50XCI7XG5pbXBvcnQgQ29udHJvbCBmcm9tIFwic2FwL3VpL2NvcmUvQ29udHJvbFwiO1xuaW1wb3J0IEludmlzaWJsZVRleHQgZnJvbSBcInNhcC91aS9jb3JlL0ludmlzaWJsZVRleHRcIjtcbmltcG9ydCBTZXJpYWxpemVyIGZyb20gXCJzYXAvdWkvY29yZS91dGlsL3NlcmlhbGl6ZXIvU2VyaWFsaXplclwiO1xuaW1wb3J0IFhNTFByZXByb2Nlc3NvciBmcm9tIFwic2FwL3VpL2NvcmUvdXRpbC9YTUxQcmVwcm9jZXNzb3JcIjtcbmltcG9ydCBGbGV4U3RhdGUgZnJvbSBcInNhcC91aS9mbC9hcHBseS9faW50ZXJuYWwvZmxleFN0YXRlL0ZsZXhTdGF0ZVwiO1xuaW1wb3J0IFhtbFByZXByb2Nlc3NvciBmcm9tIFwic2FwL3VpL2ZsL2FwcGx5L19pbnRlcm5hbC9wcmVwcm9jZXNzb3JzL1htbFByZXByb2Nlc3NvclwiO1xuaW1wb3J0IEFwcFN0b3JhZ2UgZnJvbSBcInNhcC91aS9mbC9pbml0aWFsL19pbnRlcm5hbC9TdG9yYWdlXCI7XG5pbXBvcnQgVXRpbHMgZnJvbSBcInNhcC91aS9mbC9VdGlsc1wiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL0NvbnRleHRcIjtcbmltcG9ydCBKU09OTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9qc29uL0pTT05Nb2RlbFwiO1xuaW1wb3J0IE1ldGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL01ldGFNb2RlbFwiO1xuaW1wb3J0IF9NZXRhZGF0YVJlcXVlc3RvciBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L2xpYi9fTWV0YWRhdGFSZXF1ZXN0b3JcIjtcbmltcG9ydCBPRGF0YU1ldGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTWV0YU1vZGVsXCI7XG5pbXBvcnQgeHBhdGggZnJvbSBcInhwYXRoXCI7XG5pbXBvcnQgeyBjcmVhdGVGbGV4aWJpbGl0eUNoYW5nZXNPYmplY3QgfSBmcm9tIFwiLi9KZXN0RmxleGliaWxpdHlIZWxwZXJcIjtcblxudHlwZSBQcmVQcm9jZXNzb3JTZXR0aW5nc1R5cGUgPSB7XG5cdG1vZGVsczoge1xuXHRcdFtuYW1lOiBzdHJpbmddOiBKU09OTW9kZWwgfCBPRGF0YU1ldGFNb2RlbDtcblx0fTtcblx0YmluZGluZ0NvbnRleHRzOiB7XG5cdFx0W25hbWU6IHN0cmluZ106IENvbnRleHQgfCB1bmRlZmluZWQ7XG5cdH07XG59O1xuXG50eXBlIEplc3RUZW1wbGF0ZWRWaWV3ID0ge1xuXHRhc0VsZW1lbnQ6IEVsZW1lbnQgfCB1bmRlZmluZWQ7XG5cdGFzU3RyaW5nOiBzdHJpbmc7XG59O1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXZhci1yZXF1aXJlc1xuY29uc3QgZm9ybWF0WG1sID0gcmVxdWlyZShcInhtbC1mb3JtYXR0ZXJcIik7XG5cbkxvZy5zZXRMZXZlbCgxIGFzIGFueSwgXCJzYXAudWkuY29yZS51dGlsLlhNTFByZXByb2Nlc3NvclwiKTtcbmplc3Quc2V0VGltZW91dCg0MDAwMCk7XG5cbmNvbnN0IG5hbWVTcGFjZU1hcCA9IHtcblx0bWFjcm9zOiBcInNhcC5mZS5tYWNyb3NcIixcblx0bWFjcm86IFwic2FwLmZlLm1hY3Jvc1wiLFxuXHRtYWNyb0ZpZWxkOiBcInNhcC5mZS5tYWNyb3MuZmllbGRcIixcblx0bWFjcm9kYXRhOiBcImh0dHA6Ly9zY2hlbWFzLnNhcC5jb20vc2FwdWk1L2V4dGVuc2lvbi9zYXAudWkuY29yZS5DdXN0b21EYXRhLzFcIixcblx0bG9nOiBcImh0dHA6Ly9zY2hlbWFzLnNhcC5jb20vc2FwdWk1L2V4dGVuc2lvbi9zYXAudWkuY29yZS5DdXN0b21EYXRhLzFcIixcblx0dW5pdHRlc3Q6IFwiaHR0cDovL3NjaGVtYXMuc2FwLmNvbS9zYXB1aTUvcHJlcHJvY2Vzc29yZXh0ZW5zaW9uL3NhcC5mZS51bml0dGVzdGluZy8xXCIsXG5cdGNvbnRyb2w6IFwic2FwLmZlLmNvcmUuY29udHJvbHNcIixcblx0Y29yZTogXCJzYXAudWkuY29yZVwiLFxuXHRkdDogXCJzYXAudWkuZHRcIixcblx0bTogXCJzYXAubVwiLFxuXHRmOiBcInNhcC51aS5sYXlvdXQuZm9ybVwiLFxuXHRmbDogXCJzYXAudWkuZmxcIixcblx0aW50ZXJuYWxNYWNybzogXCJzYXAuZmUubWFjcm9zLmludGVybmFsXCIsXG5cdG1kYzogXCJzYXAudWkubWRjXCIsXG5cdG1kY2F0OiBcInNhcC51aS5tZGMuYWN0aW9udG9vbGJhclwiLFxuXHRtZGNGaWVsZDogXCJzYXAudWkubWRjLmZpZWxkXCIsXG5cdG1kY1RhYmxlOiBcInNhcC51aS5tZGMudGFibGVcIixcblx0dTogXCJzYXAudWkudW5pZmllZFwiLFxuXHRtYWNyb01pY3JvQ2hhcnQ6IFwic2FwLmZlLm1hY3Jvcy5taWNyb2NoYXJ0XCIsXG5cdG1pY3JvQ2hhcnQ6IFwic2FwLnN1aXRlLnVpLm1pY3JvY2hhcnRcIixcblx0bWFjcm9UYWJsZTogXCJzYXAuZmUubWFjcm9zLnRhYmxlXCJcbn07XG5jb25zdCBzZWxlY3QgPSB4cGF0aC51c2VOYW1lc3BhY2VzKG5hbWVTcGFjZU1hcCk7XG5cbmZ1bmN0aW9uIF9nZXRUZW1wbGF0ZWRTZWxlY3Rvcih4bWxkb206IE5vZGUsIHNlbGVjdG9yOiBzdHJpbmcpOiBzdHJpbmcge1xuXHQvKipcblx0ICogaWYgYSByb290IGVsZW1lbnQgaGFzIGJlZW4gYWRkZWQgZHVyaW5nIHRoZSB0ZW1wbGF0aW5nIGJ5IG91ciBKZXN0IFRlbXBsYXRpbmcgbWV0aG9kc1xuXHQgKiB0aGUgcm9vdCBlbGVtZW50IGlzIGFkZGVkIHRvIHRoZSBzZWxlY3RvciBwYXRoLlxuXHQgKi9cblx0Y29uc3Qgcm9vdFBhdGggPSBcIi9yb290XCI7XG5cdHJldHVybiBgJHt4bWxkb20ubm9kZU5hbWUgPT09IFwicm9vdFwiICYmICFzZWxlY3Rvci5zdGFydHNXaXRoKHJvb3RQYXRoKSA/IHJvb3RQYXRoIDogXCJcIn0ke3NlbGVjdG9yfWA7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIF9idWlsZFByZVByb2Nlc3NvclNldHRpbmdzKFxuXHRzTWV0YWRhdGFVcmw6IHN0cmluZyxcblx0bUJpbmRpbmdDb250ZXh0czogeyBbeDogc3RyaW5nXTogc3RyaW5nIH0sXG5cdG1Nb2RlbHM6IHsgW3g6IHN0cmluZ106IGFueSB9XG4pOiBQcm9taXNlPFByZVByb2Nlc3NvclNldHRpbmdzVHlwZT4ge1xuXHRjb25zdCBvTWV0YU1vZGVsID0gYXdhaXQgZ2V0TWV0YU1vZGVsKHNNZXRhZGF0YVVybCk7XG5cblx0Ly8gVG8gZW5zdXJlIG91ciBtYWNybyBjYW4gdXNlICNzZXRCaW5kaW5nQ29udGV4dCB3ZSBlbnN1cmUgdGhlcmUgaXMgYSBwcmUgZXhpc3RpbmcgSlNPTk1vZGVsIGZvciBjb252ZXJ0ZXJDb250ZXh0XG5cdC8vIGlmIG5vdCBhbHJlYWR5IHBhc3NlZCB0byB0ZWggdGVtcGxhdGluZ1xuXHRpZiAoIW1Nb2RlbHMuaGFzT3duUHJvcGVydHkoXCJjb252ZXJ0ZXJDb250ZXh0XCIpKSB7XG5cdFx0bU1vZGVscyA9IE9iamVjdC5hc3NpZ24obU1vZGVscywgeyBjb252ZXJ0ZXJDb250ZXh0OiBuZXcgVGVtcGxhdGVNb2RlbCh7fSwgb01ldGFNb2RlbCkgfSk7XG5cdH1cblxuXHRPYmplY3Qua2V5cyhtTW9kZWxzKS5mb3JFYWNoKGZ1bmN0aW9uIChzTW9kZWxOYW1lKSB7XG5cdFx0aWYgKG1Nb2RlbHNbc01vZGVsTmFtZV0gJiYgbU1vZGVsc1tzTW9kZWxOYW1lXS5pc1RlbXBsYXRlTW9kZWwpIHtcblx0XHRcdG1Nb2RlbHNbc01vZGVsTmFtZV0gPSBuZXcgVGVtcGxhdGVNb2RlbChtTW9kZWxzW3NNb2RlbE5hbWVdLmRhdGEsIG9NZXRhTW9kZWwpO1xuXHRcdH1cblx0fSk7XG5cblx0Y29uc3Qgc2V0dGluZ3M6IGFueSA9IHtcblx0XHRtb2RlbHM6IE9iamVjdC5hc3NpZ24oXG5cdFx0XHR7XG5cdFx0XHRcdG1ldGFNb2RlbDogb01ldGFNb2RlbFxuXHRcdFx0fSxcblx0XHRcdG1Nb2RlbHNcblx0XHQpLFxuXHRcdGJpbmRpbmdDb250ZXh0czoge31cblx0fTtcblxuXHQvL0luamVjdCBtb2RlbHMgYW5kIGJpbmRpbmdDb250ZXh0c1xuXHRPYmplY3Qua2V5cyhtQmluZGluZ0NvbnRleHRzKS5mb3JFYWNoKGZ1bmN0aW9uIChzS2V5KSB7XG5cdFx0LyogQXNzZXJ0IHRvIG1ha2Ugc3VyZSB0aGUgYW5ub3RhdGlvbnMgYXJlIGluIHRoZSB0ZXN0IG1ldGFkYXRhIC0+IGF2b2lkIG1pc2xlYWRpbmcgdGVzdHMgKi9cblx0XHRleHBlY3QodHlwZW9mIG9NZXRhTW9kZWwuZ2V0T2JqZWN0KG1CaW5kaW5nQ29udGV4dHNbc0tleV0pKS50b0JlRGVmaW5lZCgpO1xuXHRcdGNvbnN0IG9Nb2RlbCA9IG1Nb2RlbHNbc0tleV0gfHwgb01ldGFNb2RlbDtcblx0XHRzZXR0aW5ncy5iaW5kaW5nQ29udGV4dHNbc0tleV0gPSBvTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQobUJpbmRpbmdDb250ZXh0c1tzS2V5XSk7IC8vVmFsdWUgaXMgc1BhdGhcblx0XHRzZXR0aW5ncy5tb2RlbHNbc0tleV0gPSBvTW9kZWw7XG5cdH0pO1xuXHRyZXR1cm4gc2V0dGluZ3M7XG59XG5cbmZ1bmN0aW9uIF9yZW1vdmVDb21tZW50RnJvbVhtbCh4bWw6IHN0cmluZyk6IHN0cmluZyB7XG5cdHJldHVybiBmb3JtYXRYbWwoeG1sLCB7XG5cdFx0ZmlsdGVyOiAobm9kZTogYW55KSA9PiBub2RlLnR5cGUgIT09IFwiQ29tbWVudFwiXG5cdH0pO1xufVxuXG5mdW5jdGlvbiBfbG9hZFJlc291cmNlVmlldyh2aWV3TmFtZTogc3RyaW5nKTogRWxlbWVudCB7XG5cdGNvbnN0IG5hbWUgPSB2aWV3TmFtZS5yZXBsYWNlKC9cXC4vZywgXCIvXCIpICsgXCIudmlldy54bWxcIjtcblx0Y29uc3QgdmlldyA9IExvYWRlckV4dGVuc2lvbnMubG9hZFJlc291cmNlKG5hbWUpO1xuXHRyZXR1cm4gdmlldy5kb2N1bWVudEVsZW1lbnQ7XG59XG5cbmV4cG9ydCBjb25zdCByZWdpc3Rlck1hY3JvID0gZnVuY3Rpb24gKG1hY3JvTWV0YWRhdGE6IGFueSkge1xuXHRyZWdpc3RlckJ1aWxkaW5nQmxvY2sobWFjcm9NZXRhZGF0YSk7XG59O1xuZXhwb3J0IGNvbnN0IHVucmVnaXN0ZXJNYWNybyA9IGZ1bmN0aW9uIChtYWNyb01ldGFkYXRhOiBhbnkpIHtcblx0WE1MUHJlcHJvY2Vzc29yLnBsdWdJbihudWxsLCBtYWNyb01ldGFkYXRhLm5hbWVzcGFjZSwgbWFjcm9NZXRhZGF0YS5uYW1lKTtcblx0aWYgKG1hY3JvTWV0YWRhdGEucHVibGljTmFtZXNwYWNlKSB7XG5cdFx0WE1MUHJlcHJvY2Vzc29yLnBsdWdJbihudWxsLCBtYWNyb01ldGFkYXRhLnB1YmxpY05hbWVzcGFjZSwgbWFjcm9NZXRhZGF0YS5uYW1lKTtcblx0fVxufTtcbmV4cG9ydCBjb25zdCBydW5YUGF0aFF1ZXJ5ID0gZnVuY3Rpb24gKHNlbGVjdG9yOiBzdHJpbmcsIHhtbGRvbTogTm9kZSB8IHVuZGVmaW5lZCkge1xuXHRyZXR1cm4gc2VsZWN0KHNlbGVjdG9yLCB4bWxkb20pO1xufTtcblxuZXhwZWN0LmV4dGVuZCh7XG5cdHRvSGF2ZUNvbnRyb2woeG1sZG9tLCBzZWxlY3Rvcikge1xuXHRcdGNvbnN0IG5vZGVzID0gcnVuWFBhdGhRdWVyeShfZ2V0VGVtcGxhdGVkU2VsZWN0b3IoeG1sZG9tLCBzZWxlY3RvciksIHhtbGRvbSk7XG5cdFx0cmV0dXJuIHtcblx0XHRcdG1lc3NhZ2U6ICgpID0+IHtcblx0XHRcdFx0Y29uc3Qgb3V0cHV0WG1sID0gc2VyaWFsaXplWE1MKHhtbGRvbSk7XG5cdFx0XHRcdHJldHVybiBgZGlkIG5vdCBmaW5kIGNvbnRyb2xzIG1hdGNoaW5nICR7c2VsZWN0b3J9IGluIGdlbmVyYXRlZCB4bWw6XFxuICR7b3V0cHV0WG1sfWA7XG5cdFx0XHR9LFxuXHRcdFx0cGFzczogbm9kZXMgJiYgbm9kZXMubGVuZ3RoID49IDFcblx0XHR9O1xuXHR9LFxuXHR0b05vdEhhdmVDb250cm9sKHhtbGRvbSwgc2VsZWN0b3IpIHtcblx0XHRjb25zdCBub2RlcyA9IHJ1blhQYXRoUXVlcnkoX2dldFRlbXBsYXRlZFNlbGVjdG9yKHhtbGRvbSwgc2VsZWN0b3IpLCB4bWxkb20pO1xuXHRcdHJldHVybiB7XG5cdFx0XHRtZXNzYWdlOiAoKSA9PiB7XG5cdFx0XHRcdGNvbnN0IG91dHB1dFhtbCA9IHNlcmlhbGl6ZVhNTCh4bWxkb20pO1xuXHRcdFx0XHRyZXR1cm4gYFRoZXJlIGlzIGEgY29udHJvbCBtYXRjaGluZyAke3NlbGVjdG9yfSBpbiBnZW5lcmF0ZWQgeG1sOlxcbiAke291dHB1dFhtbH1gO1xuXHRcdFx0fSxcblx0XHRcdHBhc3M6IG5vZGVzICYmIG5vZGVzLmxlbmd0aCA9PT0gMFxuXHRcdH07XG5cdH1cbn0pO1xuXG5leHBvcnQgY29uc3QgZm9ybWF0QnVpbGRpbmdCbG9ja1hNTCA9IGZ1bmN0aW9uICh4bWxTdHJpbmc6IHN0cmluZyB8IHN0cmluZ1tdKSB7XG5cdGlmIChBcnJheS5pc0FycmF5KHhtbFN0cmluZykpIHtcblx0XHR4bWxTdHJpbmcgPSB4bWxTdHJpbmcuam9pbihcIlwiKTtcblx0fVxuXHRsZXQgeG1sRm9ybWF0dGVkID0gZm9ybWF0WE1MKHhtbFN0cmluZyk7XG5cdHhtbEZvcm1hdHRlZCA9IHhtbEZvcm1hdHRlZC5yZXBsYWNlKC91aWQtLWlkLVswLTldezEzfS1bMC05XXsxLDJ9L2csIFwidWlkLS1pZFwiKTtcblx0cmV0dXJuIHhtbEZvcm1hdHRlZDtcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRDb250cm9sQXR0cmlidXRlID0gZnVuY3Rpb24gKGNvbnRyb2xTZWxlY3Rvcjogc3RyaW5nLCBhdHRyaWJ1dGVOYW1lOiBzdHJpbmcsIHhtbERvbTogTm9kZSkge1xuXHRjb25zdCBzZWxlY3RvciA9IGBzdHJpbmcoJHtfZ2V0VGVtcGxhdGVkU2VsZWN0b3IoeG1sRG9tLCBjb250cm9sU2VsZWN0b3IpfS9AJHthdHRyaWJ1dGVOYW1lfSlgO1xuXHRyZXR1cm4gcnVuWFBhdGhRdWVyeShzZWxlY3RvciwgeG1sRG9tKTtcbn07XG5cbmV4cG9ydCBjb25zdCBzZXJpYWxpemVYTUwgPSBmdW5jdGlvbiAoeG1sRG9tOiBOb2RlKSB7XG5cdGNvbnN0IHNlcmlhbGl6ZXIgPSBuZXcgd2luZG93LlhNTFNlcmlhbGl6ZXIoKTtcblx0Y29uc3QgeG1sU3RyaW5nID0gc2VyaWFsaXplci5zZXJpYWxpemVUb1N0cmluZyh4bWxEb20pO1xuXHRyZXR1cm4gZm9ybWF0WE1MKHhtbFN0cmluZyk7XG59O1xuXG5leHBvcnQgY29uc3QgZm9ybWF0WE1MID0gZnVuY3Rpb24gKHhtbFN0cmluZzogc3RyaW5nKSB7XG5cdHJldHVybiBmb3JtYXQoeG1sU3RyaW5nLCB7XG5cdFx0cGFyc2VyOiBcInhtbFwiLFxuXHRcdHhtbFdoaXRlc3BhY2VTZW5zaXRpdml0eTogXCJpZ25vcmVcIixcblx0XHRwbHVnaW5zOiBbcGx1Z2luXVxuXHR9IGFzIE9wdGlvbnMgJiB7IHhtbFdoaXRlc3BhY2VTZW5zaXRpdml0eTogXCJpZ25vcmVcIiB8IFwic3RyaWN0XCIgfSk7XG59O1xuXG4vKipcbiAqIENvbXBpbGUgYSBDRFMgZmlsZSBpbnRvIGFuIEVETVggZmlsZS5cbiAqXG4gKiBAcGFyYW0gY2RzVXJsIFRoZSBwYXRoIHRvIHRoZSBmaWxlIGNvbnRhaW5pbmcgdGhlIENEUyBkZWZpbml0aW9uLiBUaGlzIGZpbGUgbXVzdCBkZWNsYXJlIHRoZSBuYW1lc3BhY2VcbiAqIHNhcC5mZS50ZXN0IGFuZCBhIHNlcnZpY2UgSmVzdFNlcnZpY2VcbiAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgZm9yIGNyZWF0aW5nIHRoZSBFRE1YIG91dHB1dFxuICogQHBhcmFtIGVkbXhGaWxlTmFtZSBBbGxvd3MgeW91IHRvIG92ZXJyaWRlIHRoZSBuYW1lIG9mIHRoZSBjb21waWxlZCBFRE1YIG1ldGFkYXRhIGZpbGVcbiAqIEByZXR1cm5zIFRoZSBwYXRoIG9mIHRoZSBnZW5lcmF0ZWQgRURNWFxuICovXG5leHBvcnQgY29uc3QgY29tcGlsZUNEUyA9IGZ1bmN0aW9uIChcblx0Y2RzVXJsOiBzdHJpbmcsXG5cdG9wdGlvbnM6IGNvbXBpbGVyLk9EYXRhT3B0aW9ucyA9IHt9LFxuXHRlZG14RmlsZU5hbWUgPSBwYXRoLmJhc2VuYW1lKGNkc1VybCkucmVwbGFjZShcIi5jZHNcIiwgXCIueG1sXCIpXG4pIHtcblx0Y29uc3QgY2RzU3RyaW5nID0gZnMucmVhZEZpbGVTeW5jKGNkc1VybCwgXCJ1dGYtOFwiKTtcblx0Y29uc3QgZWRteENvbnRlbnQgPSBjZHMyZWRteChjZHNTdHJpbmcsIFwic2FwLmZlLnRlc3QuSmVzdFNlcnZpY2VcIiwgb3B0aW9ucyk7XG5cdGNvbnN0IGRpciA9IHBhdGgucmVzb2x2ZShjZHNVcmwsIFwiLi5cIiwgXCJnZW5cIik7XG5cblx0Y29uc3QgZWRteEZpbGVQYXRoID0gcGF0aC5yZXNvbHZlKGRpciwgZWRteEZpbGVOYW1lKTtcblxuXHRmcy5ta2RpclN5bmMoZGlyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcblxuXHRmcy53cml0ZUZpbGVTeW5jKGVkbXhGaWxlUGF0aCwgZWRteENvbnRlbnQpO1xuXHRyZXR1cm4gZWRteEZpbGVQYXRoO1xufTtcblxuLyoqXG4gKiBDb21waWxlIENEUyB0byBFRE1YLlxuICpcbiAqIEBwYXJhbSBjZHMgVGhlIENEUyBtb2RlbC4gSXQgbXVzdCBkZWZpbmUgYXQgbGVhc3Qgb25lIHNlcnZpY2UuXG4gKiBAcGFyYW0gc2VydmljZSBUaGUgZnVsbHktcXVhbGlmaWVkIG5hbWUgb2YgdGhlIHNlcnZpY2UgdG8gYmUgY29tcGlsZWQuIERlZmF1bHRzIHRvIFwic2FwLmZlLnRlc3QuSmVzdFNlcnZpY2VcIi5cbiAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgZm9yIGNyZWF0aW5nIHRoZSBFRE1YIG91dHB1dFxuICogQHJldHVybnMgVGhlIGNvbXBpbGVkIHNlcnZpY2UgbW9kZWwgYXMgRURNWC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNkczJlZG14KGNkczogc3RyaW5nLCBzZXJ2aWNlID0gXCJzYXAuZmUudGVzdC5KZXN0U2VydmljZVwiLCBvcHRpb25zOiBjb21waWxlci5PRGF0YU9wdGlvbnMgPSB7fSkge1xuXHRjb25zdCBzb3VyY2VzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0geyBcInNvdXJjZS5jZHNcIjogY2RzIH07XG5cblx0Ly8gYWxsb3cgdG8gaW5jbHVkZSBzdHVmZiBmcm9tIEBzYXAvY2RzL2NvbW1vblxuXHRpZiAoY2RzLmluY2x1ZGVzKFwiJ0BzYXAvY2RzL2NvbW1vbidcIikpIHtcblx0XHRzb3VyY2VzW1wiY29tbW9uLmNkc1wiXSA9IGZzLnJlYWRGaWxlU3luYyhyZXF1aXJlLnJlc29sdmUoXCJAc2FwL2Nkcy9jb21tb24uY2RzXCIpLCBcInV0Zi04XCIpO1xuXHR9XG5cblx0Y29uc3QgY3NuID0gY29tcGlsZXIuY29tcGlsZVNvdXJjZXMoc291cmNlcywge30pO1xuXG5cdGNvbnN0IGVkbXhPcHRpb25zOiBjb21waWxlci5PRGF0YU9wdGlvbnMgPSB7XG5cdFx0b2RhdGFGb3JlaWduS2V5czogdHJ1ZSxcblx0XHRvZGF0YUZvcm1hdDogXCJzdHJ1Y3R1cmVkXCIsXG5cdFx0b2RhdGFDb250YWlubWVudDogZmFsc2UsXG5cdFx0Li4ub3B0aW9ucyxcblx0XHRzZXJ2aWNlOiBzZXJ2aWNlXG5cdH07XG5cblx0Y29uc3QgZWRteCA9IGNvbXBpbGVyLnRvLmVkbXgoY3NuLCBlZG14T3B0aW9ucyk7XG5cdGlmICghZWRteCkge1xuXHRcdHRocm93IG5ldyBFcnJvcihgQ29tcGlsYXRpb24gZmFpbGVkLiBIaW50OiBNYWtlIHN1cmUgdGhhdCB0aGUgQ0RTIG1vZGVsIGRlZmluZXMgc2VydmljZSAke3NlcnZpY2V9LmApO1xuXHR9XG5cdHJldHVybiBlZG14O1xufVxuXG5leHBvcnQgY29uc3QgZ2V0RmFrZVNpZGVFZmZlY3RzU2VydmljZSA9IGFzeW5jIGZ1bmN0aW9uIChvTWV0YU1vZGVsOiBPRGF0YU1ldGFNb2RlbCk6IFByb21pc2U8YW55PiB7XG5cdGNvbnN0IG9TZXJ2aWNlQ29udGV4dCA9IHsgc2NvcGVPYmplY3Q6IHt9LCBzY29wZVR5cGU6IFwiXCIsIHNldHRpbmdzOiB7fSB9O1xuXHRyZXR1cm4gbmV3IFNpZGVFZmZlY3RzRmFjdG9yeSgpLmNyZWF0ZUluc3RhbmNlKG9TZXJ2aWNlQ29udGV4dCkudGhlbihmdW5jdGlvbiAob1NlcnZpY2VJbnN0YW5jZTogYW55KSB7XG5cdFx0Y29uc3Qgb0plc3RTaWRlRWZmZWN0c1NlcnZpY2UgPSBvU2VydmljZUluc3RhbmNlLmdldEludGVyZmFjZSgpO1xuXHRcdG9KZXN0U2lkZUVmZmVjdHNTZXJ2aWNlLmdldENvbnRleHQgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRzY29wZU9iamVjdDoge1xuXHRcdFx0XHRcdGdldE1vZGVsOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0XHRnZXRNZXRhTW9kZWw6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gb01ldGFNb2RlbDtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0fTtcblx0XHRyZXR1cm4gb0plc3RTaWRlRWZmZWN0c1NlcnZpY2U7XG5cdH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IGdldEZha2VEaWFnbm9zdGljcyA9IGZ1bmN0aW9uICgpOiBJRGlhZ25vc3RpY3Mge1xuXHRjb25zdCBpc3N1ZXM6IGFueVtdID0gW107XG5cdHJldHVybiB7XG5cdFx0YWRkSXNzdWUoaXNzdWVDYXRlZ29yeTogSXNzdWVDYXRlZ29yeSwgaXNzdWVTZXZlcml0eTogSXNzdWVTZXZlcml0eSwgZGV0YWlsczogc3RyaW5nKTogdm9pZCB7XG5cdFx0XHRpc3N1ZXMucHVzaCh7XG5cdFx0XHRcdGlzc3VlQ2F0ZWdvcnksXG5cdFx0XHRcdGlzc3VlU2V2ZXJpdHksXG5cdFx0XHRcdGRldGFpbHNcblx0XHRcdH0pO1xuXHRcdH0sXG5cdFx0Z2V0SXNzdWVzKCk6IGFueVtdIHtcblx0XHRcdHJldHVybiBpc3N1ZXM7XG5cdFx0fSxcblx0XHRjaGVja0lmSXNzdWVFeGlzdHMoaXNzdWVDYXRlZ29yeTogSXNzdWVDYXRlZ29yeSwgaXNzdWVTZXZlcml0eTogSXNzdWVTZXZlcml0eSwgZGV0YWlsczogc3RyaW5nKTogYm9vbGVhbiB7XG5cdFx0XHRyZXR1cm4gaXNzdWVzLmZpbmQoKGlzc3VlKSA9PiB7XG5cdFx0XHRcdHJldHVybiBpc3N1ZS5pc3N1ZUNhdGVnb3J5ID09PSBpc3N1ZUNhdGVnb3J5ICYmIGlzc3VlLmlzc3VlU2V2ZXJpdHkgPT09IGlzc3VlU2V2ZXJpdHkgJiYgaXNzdWUuZGV0YWlscyA9PT0gZGV0YWlscztcblx0XHRcdH0pO1xuXHRcdH1cblx0fTtcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRDb252ZXJ0ZXJDb250ZXh0Rm9yVGVzdCA9IGZ1bmN0aW9uIChcblx0Y29udmVydGVkVHlwZXM6IENvbnZlcnRlZE1ldGFkYXRhLFxuXHRtYW5pZmVzdFNldHRpbmdzOiBMaXN0UmVwb3J0TWFuaWZlc3RTZXR0aW5ncyB8IE9iamVjdFBhZ2VNYW5pZmVzdFNldHRpbmdzXG4pIHtcblx0Y29uc3QgZW50aXR5U2V0ID0gY29udmVydGVkVHlwZXMuZW50aXR5U2V0cy5maW5kKChlcykgPT4gZXMubmFtZSA9PT0gbWFuaWZlc3RTZXR0aW5ncy5lbnRpdHlTZXQpO1xuXHRjb25zdCBkYXRhTW9kZWxQYXRoID0gZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aEZvclByb3BlcnR5KGVudGl0eVNldCBhcyBFbnRpdHlTZXQsIGNvbnZlcnRlZFR5cGVzLCBlbnRpdHlTZXQpO1xuXHRyZXR1cm4gbmV3IENvbnZlcnRlckNvbnRleHQoY29udmVydGVkVHlwZXMsIG1hbmlmZXN0U2V0dGluZ3MsIGdldEZha2VEaWFnbm9zdGljcygpLCBtZXJnZSwgZGF0YU1vZGVsUGF0aCk7XG59O1xuY29uc3QgbWV0YU1vZGVsQ2FjaGU6IGFueSA9IHt9O1xuZXhwb3J0IGNvbnN0IGdldE1ldGFNb2RlbCA9IGFzeW5jIGZ1bmN0aW9uIChzTWV0YWRhdGFVcmw6IHN0cmluZykge1xuXHRjb25zdCBvUmVxdWVzdG9yID0gX01ldGFkYXRhUmVxdWVzdG9yLmNyZWF0ZSh7fSwgXCI0LjBcIiwgdW5kZWZpbmVkLCB7fSk7XG5cdGlmICghbWV0YU1vZGVsQ2FjaGVbc01ldGFkYXRhVXJsXSkge1xuXHRcdGNvbnN0IG9NZXRhTW9kZWwgPSBuZXcgKE9EYXRhTWV0YU1vZGVsIGFzIGFueSkob1JlcXVlc3Rvciwgc01ldGFkYXRhVXJsLCB1bmRlZmluZWQsIG51bGwpO1xuXHRcdGF3YWl0IG9NZXRhTW9kZWwuZmV0Y2hFbnRpdHlDb250YWluZXIoKTtcblx0XHRtZXRhTW9kZWxDYWNoZVtzTWV0YWRhdGFVcmxdID0gb01ldGFNb2RlbDtcblx0fVxuXG5cdHJldHVybiBtZXRhTW9kZWxDYWNoZVtzTWV0YWRhdGFVcmxdO1xufTtcblxuZXhwb3J0IGNvbnN0IGdldERhdGFNb2RlbE9iamVjdFBhdGhGb3JQcm9wZXJ0eSA9IGZ1bmN0aW9uIChcblx0ZW50aXR5U2V0OiBFbnRpdHlTZXQsXG5cdGNvbnZlcnRlZFR5cGVzOiBDb252ZXJ0ZWRNZXRhZGF0YSxcblx0cHJvcGVydHk/OiBQcm9wZXJ0eSB8IEVudGl0eVNldCB8IEFueUFubm90YXRpb25cbik6IERhdGFNb2RlbE9iamVjdFBhdGgge1xuXHRjb25zdCB0YXJnZXRQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoID0ge1xuXHRcdHN0YXJ0aW5nRW50aXR5U2V0OiBlbnRpdHlTZXQsXG5cdFx0bmF2aWdhdGlvblByb3BlcnRpZXM6IFtdLFxuXHRcdHRhcmdldE9iamVjdDogcHJvcGVydHksXG5cdFx0dGFyZ2V0RW50aXR5U2V0OiBlbnRpdHlTZXQsXG5cdFx0dGFyZ2V0RW50aXR5VHlwZTogZW50aXR5U2V0LmVudGl0eVR5cGUsXG5cdFx0Y29udmVydGVkVHlwZXM6IGNvbnZlcnRlZFR5cGVzXG5cdH07XG5cdHRhcmdldFBhdGguY29udGV4dExvY2F0aW9uID0gdGFyZ2V0UGF0aDtcblx0cmV0dXJuIHRhcmdldFBhdGg7XG59O1xuXG5leHBvcnQgY29uc3QgZXZhbHVhdGVCaW5kaW5nID0gZnVuY3Rpb24gKGJpbmRpbmdTdHJpbmc6IHN0cmluZywgLi4uYXJnczogYW55W10pIHtcblx0Y29uc3QgYmluZGluZ0VsZW1lbnQgPSBCaW5kaW5nUGFyc2VyLmNvbXBsZXhQYXJzZXIoYmluZGluZ1N0cmluZyk7XG5cdHJldHVybiBiaW5kaW5nRWxlbWVudC5mb3JtYXR0ZXIuYXBwbHkodW5kZWZpbmVkLCBhcmdzKTtcbn07XG5cbnR5cGUgTW9kZWxDb250ZW50ID0ge1xuXHRbbmFtZTogc3RyaW5nXTogYW55O1xufTtcblxuLyoqXG4gKiBFdmFsdWF0ZSBhIGJpbmRpbmcgYWdhaW5zdCBhIG1vZGVsLlxuICpcbiAqIEBwYXJhbSBiaW5kaW5nU3RyaW5nIFRoZSBiaW5kaW5nIHN0cmluZy5cbiAqIEBwYXJhbSBtb2RlbENvbnRlbnQgQ29udGVudCBvZiB0aGUgZGVmYXVsdCBtb2RlbCB0byB1c2UgZm9yIGV2YWx1YXRpb24uXG4gKiBAcGFyYW0gbmFtZWRNb2RlbHNDb250ZW50IENvbnRlbnRzIG9mIGFkZGl0aW9uYWwsIG5hbWVkIG1vZGVscyB0byB1c2UuXG4gKiBAcmV0dXJucyBUaGUgZXZhbHVhdGVkIGJpbmRpbmcuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBldmFsdWF0ZUJpbmRpbmdXaXRoTW9kZWwoXG5cdGJpbmRpbmdTdHJpbmc6IHN0cmluZyB8IHVuZGVmaW5lZCxcblx0bW9kZWxDb250ZW50OiBNb2RlbENvbnRlbnQsXG5cdG5hbWVkTW9kZWxzQ29udGVudD86IHsgW21vZGVsTmFtZTogc3RyaW5nXTogTW9kZWxDb250ZW50IH1cbik6IHN0cmluZyB7XG5cdGNvbnN0IGJpbmRpbmdFbGVtZW50ID0gQmluZGluZ1BhcnNlci5jb21wbGV4UGFyc2VyKGJpbmRpbmdTdHJpbmcpO1xuXHRjb25zdCB0ZXh0ID0gbmV3IEludmlzaWJsZVRleHQoKTtcblx0dGV4dC5iaW5kUHJvcGVydHkoXCJ0ZXh0XCIsIGJpbmRpbmdFbGVtZW50KTtcblxuXHRjb25zdCBkZWZhdWx0TW9kZWwgPSBuZXcgSlNPTk1vZGVsKG1vZGVsQ29udGVudCk7XG5cdHRleHQuc2V0TW9kZWwoZGVmYXVsdE1vZGVsKTtcblx0dGV4dC5zZXRCaW5kaW5nQ29udGV4dChkZWZhdWx0TW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoXCIvXCIpIGFzIENvbnRleHQpO1xuXG5cdGlmIChuYW1lZE1vZGVsc0NvbnRlbnQpIHtcblx0XHRmb3IgKGNvbnN0IFtuYW1lLCBjb250ZW50XSBvZiBPYmplY3QuZW50cmllcyhuYW1lZE1vZGVsc0NvbnRlbnQpKSB7XG5cdFx0XHRjb25zdCBtb2RlbCA9IG5ldyBKU09OTW9kZWwoY29udGVudCk7XG5cdFx0XHR0ZXh0LnNldE1vZGVsKG1vZGVsLCBuYW1lKTtcblx0XHRcdHRleHQuc2V0QmluZGluZ0NvbnRleHQobW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoXCIvXCIpIGFzIENvbnRleHQsIG5hbWUpO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiB0ZXh0LmdldFRleHQoKTtcbn1cblxuY29uc3QgVEVTVFZJRVdJRCA9IFwidGVzdFZpZXdJZFwiO1xuXG5jb25zdCBhcHBseUZsZXhDaGFuZ2VzID0gYXN5bmMgZnVuY3Rpb24gKGZsZXhDaGFuZ2VzOiB7IFt4OiBzdHJpbmddOiBvYmplY3RbXSB9LCBvTWV0YU1vZGVsOiBNZXRhTW9kZWwsIHJlc3VsdFhNTDogYW55KSB7XG5cdC8vIHByZWZpeCBJZHNcblx0Wy4uLnJlc3VsdFhNTC5xdWVyeVNlbGVjdG9yQWxsKFwiW2lkXVwiKV0uZm9yRWFjaCgobm9kZSkgPT4ge1xuXHRcdG5vZGUuaWQgPSBgJHtURVNUVklFV0lEfS0tJHtub2RlLmlkfWA7XG5cdH0pO1xuXHRjb25zdCBjaGFuZ2VzID0gY3JlYXRlRmxleGliaWxpdHlDaGFuZ2VzT2JqZWN0KFRFU1RWSUVXSUQsIGZsZXhDaGFuZ2VzKTtcblx0Y29uc3QgYXBwSWQgPSBcInNvbWVDb21wb25lbnRcIjtcblx0Y29uc3Qgb01hbmlmZXN0ID0ge1xuXHRcdFwic2FwLmFwcFwiOiB7XG5cdFx0XHRpZDogYXBwSWQsXG5cdFx0XHR0eXBlOiBcImFwcGxpY2F0aW9uXCIsXG5cdFx0XHRjcm9zc05hdmlnYXRpb246IHtcblx0XHRcdFx0b3V0Ym91bmRzOiBbXVxuXHRcdFx0fVxuXHRcdH1cblx0fTtcblx0Y29uc3Qgb0FwcENvbXBvbmVudDogQXBwQ29tcG9uZW50ID0ge1xuXHRcdGdldERpYWdub3N0aWNzOiBqZXN0LmZuKCkubW9ja1JldHVyblZhbHVlKGdldEZha2VEaWFnbm9zdGljcygpKSxcblx0XHRnZXRNb2RlbDogamVzdC5mbigpLm1vY2tSZXR1cm5WYWx1ZSh7XG5cdFx0XHRnZXRNZXRhTW9kZWw6IGplc3QuZm4oKS5tb2NrUmV0dXJuVmFsdWUob01ldGFNb2RlbClcblx0XHR9KSxcblx0XHRnZXRDb21wb25lbnREYXRhOiBqZXN0LmZuKCkubW9ja1JldHVyblZhbHVlKHt9KSxcblx0XHRnZXRNYW5pZmVzdE9iamVjdDogamVzdC5mbigpLm1vY2tSZXR1cm5WYWx1ZSh7XG5cdFx0XHRnZXRFbnRyeTogZnVuY3Rpb24gKG5hbWU6IHN0cmluZykge1xuXHRcdFx0XHRyZXR1cm4gKG9NYW5pZmVzdCBhcyBhbnkpW25hbWVdO1xuXHRcdFx0fVxuXHRcdH0pLFxuXHRcdGdldExvY2FsSWQ6IGplc3QuZm4oKHNJZCkgPT4gc0lkKVxuXHR9IGFzIHVua25vd24gYXMgQXBwQ29tcG9uZW50O1xuXHQvL2Zha2UgY2hhbmdlc1xuXHRqZXN0LnNweU9uKEFwcFN0b3JhZ2UsIFwibG9hZEZsZXhEYXRhXCIpLm1vY2tSZXR1cm5WYWx1ZShQcm9taXNlLnJlc29sdmUoY2hhbmdlcykpO1xuXHRqZXN0LnNweU9uKENvbXBvbmVudCwgXCJnZXRcIikubW9ja1JldHVyblZhbHVlKG9BcHBDb21wb25lbnQpO1xuXHRqZXN0LnNweU9uKFV0aWxzLCBcImdldEFwcENvbXBvbmVudEZvckNvbnRyb2xcIikubW9ja1JldHVyblZhbHVlKG9BcHBDb21wb25lbnQpO1xuXHRhd2FpdCBGbGV4U3RhdGUuaW5pdGlhbGl6ZSh7XG5cdFx0Y29tcG9uZW50SWQ6IGFwcElkXG5cdH0pO1xuXHRyZXN1bHRYTUwgPSBhd2FpdCBYbWxQcmVwcm9jZXNzb3IucHJvY2VzcyhyZXN1bHRYTUwsIHsgbmFtZTogXCJUZXN0IEZyYWdtZW50XCIsIGNvbXBvbmVudElkOiBhcHBJZCwgaWQ6IFRFU1RWSUVXSUQgfSk7XG5cblx0Ly9Bc3NlcnQgdGhhdCBhbGwgY2hhbmdlcyBoYXZlIGJlZW4gYXBwbGllZFxuXHRjb25zdCBjaGFuZ2VzQXBwbGllZCA9IGdldENoYW5nZXNGcm9tWE1MKHJlc3VsdFhNTCk7XG5cdGV4cGVjdChjaGFuZ2VzQXBwbGllZC5sZW5ndGgpLnRvQmUoZmxleENoYW5nZXM/LmNoYW5nZXM/Lmxlbmd0aCA/PyAwICsgZmxleENoYW5nZXM/LnZhcmlhbnREZXBlbmRlbnRDb250cm9sQ2hhbmdlcz8ubGVuZ3RoID8/IDApO1xuXHRyZXR1cm4gcmVzdWx0WE1MO1xufTtcblxuZXhwb3J0IGNvbnN0IGdldENoYW5nZXNGcm9tWE1MID0gKHhtbDogYW55KSA9PlxuXHRbLi4ueG1sLnF1ZXJ5U2VsZWN0b3JBbGwoXCIqXCIpXVxuXHRcdC5mbGF0TWFwKChlKSA9PiBbLi4uZS5hdHRyaWJ1dGVzXS5tYXAoKGEpID0+IGEubmFtZSkpXG5cdFx0LmZpbHRlcigoYXR0cikgPT4gYXR0ci5pbmNsdWRlcyhcInNhcC51aS5mbC5hcHBsaWVkQ2hhbmdlc1wiKSk7XG5cbmV4cG9ydCBjb25zdCBnZXRUZW1wbGF0aW5nUmVzdWx0ID0gYXN5bmMgZnVuY3Rpb24gKFxuXHR4bWxJbnB1dDogc3RyaW5nLFxuXHRzTWV0YWRhdGFVcmw6IHN0cmluZyxcblx0bUJpbmRpbmdDb250ZXh0czogeyBbeDogc3RyaW5nXTogYW55OyBlbnRpdHlTZXQ/OiBzdHJpbmcgfSxcblx0bU1vZGVsczogeyBbeDogc3RyaW5nXTogYW55IH0sXG5cdGZsZXhDaGFuZ2VzPzogeyBbeDogc3RyaW5nXTogb2JqZWN0W10gfVxuKSB7XG5cdGNvbnN0IHRlbXBsYXRlZFhtbCA9IGA8cm9vdD4ke3htbElucHV0fTwvcm9vdD5gO1xuXHRjb25zdCBwYXJzZXIgPSBuZXcgd2luZG93LkRPTVBhcnNlcigpO1xuXHRjb25zdCB4bWxEb2MgPSBwYXJzZXIucGFyc2VGcm9tU3RyaW5nKHRlbXBsYXRlZFhtbCwgXCJ0ZXh0L3htbFwiKTtcblx0Ly8gVG8gZW5zdXJlIG91ciBtYWNybyBjYW4gdXNlICNzZXRCaW5kaW5nQ29udGV4dCB3ZSBlbnN1cmUgdGhlcmUgaXMgYSBwcmUgZXhpc3RpbmcgSlNPTk1vZGVsIGZvciBjb252ZXJ0ZXJDb250ZXh0XG5cdC8vIGlmIG5vdCBhbHJlYWR5IHBhc3NlZCB0byB0ZWggdGVtcGxhdGluZ1xuXG5cdGNvbnN0IG9NZXRhTW9kZWwgPSBhd2FpdCBnZXRNZXRhTW9kZWwoc01ldGFkYXRhVXJsKTtcblx0Y29uc3Qgb1ByZXByb2Nlc3NvclNldHRpbmdzID0gYXdhaXQgX2J1aWxkUHJlUHJvY2Vzc29yU2V0dGluZ3Moc01ldGFkYXRhVXJsLCBtQmluZGluZ0NvbnRleHRzLCBtTW9kZWxzKTtcblxuXHQvL1RoaXMgY29udGV4dCBmb3IgbWFjcm8gdGVzdGluZ1xuXHRpZiAob1ByZXByb2Nlc3NvclNldHRpbmdzLm1vZGVsc1tcInRoaXNcIl0pIHtcblx0XHRvUHJlcHJvY2Vzc29yU2V0dGluZ3MuYmluZGluZ0NvbnRleHRzW1widGhpc1wiXSA9IG9QcmVwcm9jZXNzb3JTZXR0aW5ncy5tb2RlbHNbXCJ0aGlzXCJdLmNyZWF0ZUJpbmRpbmdDb250ZXh0KFwiL1wiKTtcblx0fVxuXG5cdGxldCByZXN1bHRYTUwgPSAoYXdhaXQgWE1MUHJlcHJvY2Vzc29yLnByb2Nlc3MoeG1sRG9jLmZpcnN0RWxlbWVudENoaWxkISwgeyBuYW1lOiBcIlRlc3QgRnJhZ21lbnRcIiB9LCBvUHJlcHJvY2Vzc29yU2V0dGluZ3MpKSBhcyBhbnk7XG5cblx0aWYgKGZsZXhDaGFuZ2VzKSB7XG5cdFx0Ly8gYXBwbHkgZmxleCBjaGFuZ2VzXG5cdFx0cmVzdWx0WE1MID0gYXdhaXQgYXBwbHlGbGV4Q2hhbmdlcyhmbGV4Q2hhbmdlcywgb01ldGFNb2RlbCwgcmVzdWx0WE1MKTtcblx0fVxuXHRyZXR1cm4gcmVzdWx0WE1MO1xufTtcblxuZXhwb3J0IGNvbnN0IGdldFRlbXBsYXRlZFhNTCA9IGFzeW5jIGZ1bmN0aW9uIChcblx0eG1sSW5wdXQ6IHN0cmluZyxcblx0c01ldGFkYXRhVXJsOiBzdHJpbmcsXG5cdG1CaW5kaW5nQ29udGV4dHM6IHsgW3g6IHN0cmluZ106IHN0cmluZyB9LFxuXHRtTW9kZWxzOiB7IFt4OiBzdHJpbmddOiBhbnkgfSxcblx0ZmxleENoYW5nZXM/OiB7IFt4OiBzdHJpbmddOiBvYmplY3RbXSB9XG4pIHtcblx0Y29uc3QgdGVtcGxhdGVkWE1MID0gYXdhaXQgZ2V0VGVtcGxhdGluZ1Jlc3VsdCh4bWxJbnB1dCwgc01ldGFkYXRhVXJsLCBtQmluZGluZ0NvbnRleHRzLCBtTW9kZWxzLCBmbGV4Q2hhbmdlcyk7XG5cdHJldHVybiBzZXJpYWxpemVYTUwodGVtcGxhdGVkWE1MKTtcbn07XG5cbi8qKlxuICogUHJvY2VzcyB0aGUgcmVxdWVzdGVkIHZpZXcgd2l0aCB0aGUgcHJvdmlkZWQgZGF0YS5cbiAqXG4gKiBAcGFyYW0gbmFtZSBGdWxseSBxdWFsaWZpZWQgbmFtZSBvZiB0aGUgdmlldyB0byBiZSB0ZXN0ZWQuXG4gKiBAcGFyYW0gc01ldGFkYXRhVXJsIFVybCBvZiB0aGUgbWV0YWRhdGEuXG4gKiBAcGFyYW0gbUJpbmRpbmdDb250ZXh0cyBNYXAgb2YgdGhlIGJpbmRpbmdDb250ZXh0cyB0byBzZXQgb24gdGhlIG1vZGVscy5cbiAqIEBwYXJhbSBtTW9kZWxzIE1hcCBvZiB0aGUgbW9kZWxzLlxuICogQHBhcmFtIGZsZXhDaGFuZ2VzIE9iamVjdCB3aXRoIFVJIGNoYW5nZXMgbGlrZSAnY2hhbmdlcycgb3IgJ3ZhcmlhbnREZXBlbmRlbnRDb250cm9sQ2hhbmdlcydcbiAqIEByZXR1cm5zIFRlbXBsYXRlZCB2aWV3IGFzIHN0cmluZ1xuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHJvY2Vzc1ZpZXcoXG5cdG5hbWU6IHN0cmluZyxcblx0c01ldGFkYXRhVXJsOiBzdHJpbmcsXG5cdG1CaW5kaW5nQ29udGV4dHM6IHsgW3g6IHN0cmluZ106IHN0cmluZyB9LFxuXHRtTW9kZWxzOiB7IFt4OiBzdHJpbmddOiBhbnkgfSxcblx0ZmxleENoYW5nZXM/OiB7IFt4OiBzdHJpbmddOiBvYmplY3RbXSB9XG4pOiBQcm9taXNlPEplc3RUZW1wbGF0ZWRWaWV3PiB7XG5cdGNvbnN0IG9NZXRhTW9kZWwgPSBhd2FpdCBnZXRNZXRhTW9kZWwoc01ldGFkYXRhVXJsKTtcblx0Y29uc3Qgb1ZpZXdEb2N1bWVudCA9IF9sb2FkUmVzb3VyY2VWaWV3KG5hbWUpO1xuXHRjb25zdCBvUHJlcHJvY2Vzc29yU2V0dGluZ3MgPSBhd2FpdCBfYnVpbGRQcmVQcm9jZXNzb3JTZXR0aW5ncyhzTWV0YWRhdGFVcmwsIG1CaW5kaW5nQ29udGV4dHMsIG1Nb2RlbHMpO1xuXHRsZXQgb1ByZXByb2Nlc3NlZFZpZXcgPSBhd2FpdCBYTUxQcmVwcm9jZXNzb3IucHJvY2VzcyhvVmlld0RvY3VtZW50LCB7IG5hbWU6IG5hbWUgfSwgb1ByZXByb2Nlc3NvclNldHRpbmdzKTtcblx0aWYgKGZsZXhDaGFuZ2VzKSB7XG5cdFx0b1ByZXByb2Nlc3NlZFZpZXcgPSBhd2FpdCBhcHBseUZsZXhDaGFuZ2VzKGZsZXhDaGFuZ2VzID8/IFtdLCBvTWV0YU1vZGVsLCBvUHJlcHJvY2Vzc2VkVmlldyk7XG5cdH1cblx0cmV0dXJuIHtcblx0XHRhc0VsZW1lbnQ6IG9QcmVwcm9jZXNzZWRWaWV3LFxuXHRcdGFzU3RyaW5nOiBfcmVtb3ZlQ29tbWVudEZyb21YbWwob1ByZXByb2Nlc3NlZFZpZXc/Lm91dGVySFRNTCB8fCBcIlwiKVxuXHR9O1xufVxuXG4vKipcbiAqIFByb2Nlc3MgdGhlIHJlcXVlc3RlZCBYTUwgZnJhZ21lbnQgd2l0aCB0aGUgcHJvdmlkZWQgZGF0YS5cbiAqXG4gKiBAcGFyYW0gbmFtZSBGdWxseSBxdWFsaWZpZWQgbmFtZSBvZiB0aGUgZnJhZ21lbnQgdG8gYmUgdGVzdGVkLlxuICogQHBhcmFtIHRlc3REYXRhIFRlc3QgZGF0YSBjb25zaXN0aW5nXG4gKiBAcmV0dXJucyBUZW1wbGF0ZWQgZnJhZ21lbnQgYXMgc3RyaW5nXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwcm9jZXNzRnJhZ21lbnQobmFtZTogc3RyaW5nLCB0ZXN0RGF0YTogeyBbbW9kZWw6IHN0cmluZ106IG9iamVjdCB9KTogUHJvbWlzZTxzdHJpbmc+IHtcblx0Y29uc3QgaW5wdXRYbWwgPSBgPHJvb3Q+PGNvcmU6RnJhZ21lbnQgZnJhZ21lbnROYW1lPVwiJHtuYW1lfVwiIHR5cGU9XCJYTUxcIiB4bWxuczpjb3JlPVwic2FwLnVpLmNvcmVcIiAvPjwvcm9vdD5gO1xuXHRjb25zdCBwYXJzZXIgPSBuZXcgd2luZG93LkRPTVBhcnNlcigpO1xuXHRjb25zdCBpbnB1dERvYyA9IHBhcnNlci5wYXJzZUZyb21TdHJpbmcoaW5wdXRYbWwsIFwidGV4dC94bWxcIik7XG5cblx0Ly8gYnVpbGQgbW9kZWwgYW5kIGJpbmRpbmdzIGZvciBnaXZlbiB0ZXN0IGRhdGFcblx0Y29uc3Qgc2V0dGluZ3MgPSB7XG5cdFx0bW9kZWxzOiB7fSBhcyB7IFtuYW1lOiBzdHJpbmddOiBKU09OTW9kZWwgfSxcblx0XHRiaW5kaW5nQ29udGV4dHM6IHt9IGFzIHsgW25hbWU6IHN0cmluZ106IG9iamVjdCB9XG5cdH07XG5cdGZvciAoY29uc3QgbW9kZWwgaW4gdGVzdERhdGEpIHtcblx0XHRjb25zdCBqc29uTW9kZWwgPSBuZXcgSlNPTk1vZGVsKCk7XG5cdFx0anNvbk1vZGVsLnNldERhdGEodGVzdERhdGFbbW9kZWxdKTtcblx0XHRzZXR0aW5ncy5tb2RlbHNbbW9kZWxdID0ganNvbk1vZGVsO1xuXHRcdHNldHRpbmdzLmJpbmRpbmdDb250ZXh0c1ttb2RlbF0gPSBzZXR0aW5ncy5tb2RlbHNbbW9kZWxdLmNyZWF0ZUJpbmRpbmdDb250ZXh0KFwiL1wiKSBhcyBDb250ZXh0O1xuXHR9XG5cblx0Ly8gZXhlY3V0ZSB0aGUgcHJlLXByb2Nlc3NvclxuXHRjb25zdCByZXN1bHREb2MgPSBhd2FpdCBYTUxQcmVwcm9jZXNzb3IucHJvY2VzcyhpbnB1dERvYy5maXJzdEVsZW1lbnRDaGlsZCwgeyBuYW1lIH0sIHNldHRpbmdzKTtcblxuXHQvLyBleGNsdWRlIG5lc3RlZCBmcmFnbWVudHMgZnJvbSB0ZXN0IHNuYXBzaG90c1xuXHRjb25zdCBmcmFnbWVudHMgPSByZXN1bHREb2MuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJjb3JlOkZyYWdtZW50XCIpIGFzIGFueTtcblx0aWYgKGZyYWdtZW50cz8ubGVuZ3RoID4gMCkge1xuXHRcdGZvciAoY29uc3QgZnJhZ21lbnQgb2YgZnJhZ21lbnRzKSB7XG5cdFx0XHRmcmFnbWVudC5pbm5lckhUTUwgPSBcIlwiO1xuXHRcdH1cblx0fVxuXG5cdC8vIEtlZXAgdGhlIGZyYWdtZW50IHJlc3VsdCBhcyBjaGlsZCBvZiByb290IG5vZGUgd2hlbiBmcmFnbWVudCBnZW5lcmF0ZXMgbXVsdGlwbGUgcm9vdCBjb250cm9sc1xuXHRjb25zdCB4bWxSZXN1bHQgPSByZXN1bHREb2MuY2hpbGRyZW4ubGVuZ3RoID4gMSA/IHJlc3VsdERvYy5vdXRlckhUTUwgOiByZXN1bHREb2MuaW5uZXJIVE1MO1xuXG5cdHJldHVybiBfcmVtb3ZlQ29tbWVudEZyb21YbWwoeG1sUmVzdWx0KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNlcmlhbGl6ZUNvbnRyb2woY29udHJvbFRvU2VyaWFsaXplOiBDb250cm9sIHwgQ29udHJvbFtdKSB7XG5cdGxldCB0YWJDb3VudCA9IDA7XG5cdGZ1bmN0aW9uIGdldFRhYih0b0FkZDogbnVtYmVyID0gMCkge1xuXHRcdGxldCB0YWIgPSBcIlwiO1xuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgdGFiQ291bnQgKyB0b0FkZDsgaSsrKSB7XG5cdFx0XHR0YWIgKz0gXCJcXHRcIjtcblx0XHR9XG5cdFx0cmV0dXJuIHRhYjtcblx0fVxuXHRjb25zdCBzZXJpYWxpemVEZWxlZ2F0ZSA9IHtcblx0XHRzdGFydDogZnVuY3Rpb24gKGNvbnRyb2w6IGFueSwgc0FnZ3JlZ2F0aW9uTmFtZTogc3RyaW5nKSB7XG5cdFx0XHRsZXQgY29udHJvbERldGFpbCA9IFwiXCI7XG5cdFx0XHRpZiAoc0FnZ3JlZ2F0aW9uTmFtZSkge1xuXHRcdFx0XHRpZiAoY29udHJvbC5nZXRQYXJlbnQoKSkge1xuXHRcdFx0XHRcdGNvbnN0IGluZGV4SW5QYXJlbnQgPSAoY29udHJvbC5nZXRQYXJlbnQoKS5nZXRBZ2dyZWdhdGlvbihzQWdncmVnYXRpb25OYW1lKSBhcyBNYW5hZ2VkT2JqZWN0W10pPy5pbmRleE9mPy4oY29udHJvbCk7XG5cdFx0XHRcdFx0aWYgKGluZGV4SW5QYXJlbnQgPiAwKSB7XG5cdFx0XHRcdFx0XHRjb250cm9sRGV0YWlsICs9IGAsXFxuJHtnZXRUYWIoKX1gO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Y29udHJvbERldGFpbCArPSBgJHtjb250cm9sLmdldE1ldGFkYXRhKCkuZ2V0TmFtZSgpfShgO1xuXHRcdFx0cmV0dXJuIGNvbnRyb2xEZXRhaWw7XG5cdFx0fSxcblx0XHRlbmQ6IGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiBcIn0pXCI7XG5cdFx0fSxcblx0XHRtaWRkbGU6IGZ1bmN0aW9uIChjb250cm9sOiBhbnkpIHtcblx0XHRcdGNvbnN0IGlkID0gY29udHJvbC5nZXRJZCgpO1xuXHRcdFx0bGV0IGRhdGEgPSBge2lkOiAke01hbmFnZWRPYmplY3RNZXRhZGF0YS5pc0dlbmVyYXRlZElkKGlkKSA/IFwiX19keW5hbWljSWRcIiA6IGlkfWA7XG5cdFx0XHRmb3IgKGNvbnN0IG9Db250cm9sS2V5IGluIGNvbnRyb2wubVByb3BlcnRpZXMpIHtcblx0XHRcdFx0aWYgKGNvbnRyb2wubVByb3BlcnRpZXMuaGFzT3duUHJvcGVydHkob0NvbnRyb2xLZXkpKSB7XG5cdFx0XHRcdFx0ZGF0YSArPSBgLFxcbiR7Z2V0VGFiKCl9ICR7b0NvbnRyb2xLZXl9OiAke2NvbnRyb2wubVByb3BlcnRpZXNbb0NvbnRyb2xLZXldfWA7XG5cdFx0XHRcdH0gZWxzZSBpZiAoY29udHJvbC5tQmluZGluZ0luZm9zLmhhc093blByb3BlcnR5KG9Db250cm9sS2V5KSkge1xuXHRcdFx0XHRcdGNvbnN0IGJpbmRpbmdEZXRhaWwgPSBjb250cm9sLm1CaW5kaW5nSW5mb3Nbb0NvbnRyb2xLZXldO1xuXHRcdFx0XHRcdGRhdGEgKz0gYCxcXG4ke2dldFRhYigpfSAke29Db250cm9sS2V5fTogJHtKU09OLnN0cmluZ2lmeShiaW5kaW5nRGV0YWlsKX1gO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRmb3IgKGNvbnN0IG9Db250cm9sS2V5IGluIGNvbnRyb2wubUFzc29jaWF0aW9ucykge1xuXHRcdFx0XHRpZiAoY29udHJvbC5tQXNzb2NpYXRpb25zLmhhc093blByb3BlcnR5KG9Db250cm9sS2V5KSkge1xuXHRcdFx0XHRcdGRhdGEgKz0gYCxcXG4ke2dldFRhYigpfSAke29Db250cm9sS2V5fTogJHtcblx0XHRcdFx0XHRcdChjb250cm9sLm1Bc3NvY2lhdGlvbnNbb0NvbnRyb2xLZXldPy5qb2luPy4oXCIsXCIpID8/IGNvbnRyb2wubUFzc29jaWF0aW9uc1tvQ29udHJvbEtleV0pIHx8IHVuZGVmaW5lZFxuXHRcdFx0XHRcdH1gO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRmb3IgKGNvbnN0IG9Db250cm9sS2V5IGluIGNvbnRyb2wubUV2ZW50UmVnaXN0cnkpIHtcblx0XHRcdFx0aWYgKGNvbnRyb2wubUV2ZW50UmVnaXN0cnkuaGFzT3duUHJvcGVydHkob0NvbnRyb2xLZXkpKSB7XG5cdFx0XHRcdFx0ZGF0YSArPSBgLFxcbiR7Z2V0VGFiKCl9ICR7b0NvbnRyb2xLZXl9OiB0cnVlfWA7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGRhdGEgKz0gYGA7XG5cdFx0XHRyZXR1cm4gZGF0YTtcblx0XHR9LFxuXHRcdHN0YXJ0QWdncmVnYXRpb246IGZ1bmN0aW9uIChjb250cm9sOiBhbnksIHNOYW1lOiBzdHJpbmcpIHtcblx0XHRcdGxldCBvdXQgPSBgLFxcbiR7Z2V0VGFiKCl9JHtzTmFtZX1gO1xuXHRcdFx0dGFiQ291bnQrKztcblxuXHRcdFx0aWYgKGNvbnRyb2wubUJpbmRpbmdJbmZvc1tzTmFtZV0pIHtcblx0XHRcdFx0b3V0ICs9IGA9eyBwYXRoOicke2NvbnRyb2wubUJpbmRpbmdJbmZvc1tzTmFtZV0ucGF0aH0nLCB0ZW1wbGF0ZTpcXG4ke2dldFRhYigpfWA7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRvdXQgKz0gYD1bXFxuJHtnZXRUYWIoKX1gO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIG91dDtcblx0XHR9LFxuXHRcdGVuZEFnZ3JlZ2F0aW9uOiBmdW5jdGlvbiAoY29udHJvbDogYW55LCBzTmFtZTogc3RyaW5nKSB7XG5cdFx0XHR0YWJDb3VudC0tO1xuXHRcdFx0aWYgKGNvbnRyb2wubUJpbmRpbmdJbmZvc1tzTmFtZV0pIHtcblx0XHRcdFx0cmV0dXJuIGBcXG4ke2dldFRhYigpfX1gO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIGBcXG4ke2dldFRhYigpfV1gO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcblx0aWYgKEFycmF5LmlzQXJyYXkoY29udHJvbFRvU2VyaWFsaXplKSkge1xuXHRcdHJldHVybiBjb250cm9sVG9TZXJpYWxpemUubWFwKChjb250cm9sVG9SZW5kZXI6IENvbnRyb2wpID0+IHtcblx0XHRcdHJldHVybiBuZXcgU2VyaWFsaXplcihjb250cm9sVG9SZW5kZXIsIHNlcmlhbGl6ZURlbGVnYXRlKS5zZXJpYWxpemUoKTtcblx0XHR9KTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gbmV3IFNlcmlhbGl6ZXIoY29udHJvbFRvU2VyaWFsaXplLCBzZXJpYWxpemVEZWxlZ2F0ZSkuc2VyaWFsaXplKCk7XG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUF3YWl0ZXIoKSB7XG5cdGxldCBmblJlc29sdmUhOiBGdW5jdGlvbjtcblx0Y29uc3QgbXlQcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcblx0XHRmblJlc29sdmUgPSByZXNvbHZlO1xuXHR9KTtcblx0cmV0dXJuIHsgcHJvbWlzZTogbXlQcm9taXNlLCByZXNvbHZlOiBmblJlc29sdmUgfTtcbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7RUF1REE7RUFDQSxNQUFNQSxTQUFTLEdBQUdDLE9BQU8sQ0FBQyxlQUFlLENBQUM7RUFFMUNDLEdBQUcsQ0FBQ0MsUUFBUSxDQUFDLENBQUMsRUFBUyxrQ0FBa0MsQ0FBQztFQUMxREMsSUFBSSxDQUFDQyxVQUFVLENBQUMsS0FBSyxDQUFDO0VBRXRCLE1BQU1DLFlBQVksR0FBRztJQUNwQkMsTUFBTSxFQUFFLGVBQWU7SUFDdkJDLEtBQUssRUFBRSxlQUFlO0lBQ3RCQyxVQUFVLEVBQUUscUJBQXFCO0lBQ2pDQyxTQUFTLEVBQUUsa0VBQWtFO0lBQzdFQyxHQUFHLEVBQUUsa0VBQWtFO0lBQ3ZFQyxRQUFRLEVBQUUsMEVBQTBFO0lBQ3BGQyxPQUFPLEVBQUUsc0JBQXNCO0lBQy9CQyxJQUFJLEVBQUUsYUFBYTtJQUNuQkMsRUFBRSxFQUFFLFdBQVc7SUFDZkMsQ0FBQyxFQUFFLE9BQU87SUFDVkMsQ0FBQyxFQUFFLG9CQUFvQjtJQUN2QkMsRUFBRSxFQUFFLFdBQVc7SUFDZkMsYUFBYSxFQUFFLHdCQUF3QjtJQUN2Q0MsR0FBRyxFQUFFLFlBQVk7SUFDakJDLEtBQUssRUFBRSwwQkFBMEI7SUFDakNDLFFBQVEsRUFBRSxrQkFBa0I7SUFDNUJDLFFBQVEsRUFBRSxrQkFBa0I7SUFDNUJDLENBQUMsRUFBRSxnQkFBZ0I7SUFDbkJDLGVBQWUsRUFBRSwwQkFBMEI7SUFDM0NDLFVBQVUsRUFBRSx5QkFBeUI7SUFDckNDLFVBQVUsRUFBRTtFQUNiLENBQUM7RUFDRCxNQUFNQyxNQUFNLEdBQUdDLEtBQUssQ0FBQ0MsYUFBYSxDQUFDeEIsWUFBWSxDQUFDO0VBRWhELFNBQVN5QixxQkFBcUIsQ0FBQ0MsTUFBWSxFQUFFQyxRQUFnQixFQUFVO0lBQ3RFO0FBQ0Q7QUFDQTtBQUNBO0lBQ0MsTUFBTUMsUUFBUSxH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