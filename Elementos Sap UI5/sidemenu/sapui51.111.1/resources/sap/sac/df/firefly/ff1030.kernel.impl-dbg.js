/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
[
"sap/sac/df/firefly/ff1010.kernel.api.base"
],
function(oFF)
{
"use strict";

oFF.ButterflyEvent = function() {};
oFF.ButterflyEvent.prototype = new oFF.XObject();
oFF.ButterflyEvent.prototype._ff_c = "ButterflyEvent";

oFF.ButterflyEvent.prototype.m_name = null;
oFF.ButterflyEvent.prototype.m_type = null;
oFF.ButterflyEvent.prototype.getName = function()
{
	return this.m_name;
};
oFF.ButterflyEvent.prototype.getType = function()
{
	return this.m_type;
};

oFF.ButterflyRecordEntry = function() {};
oFF.ButterflyRecordEntry.prototype = new oFF.XObject();
oFF.ButterflyRecordEntry.prototype._ff_c = "ButterflyRecordEntry";

oFF.ButterflyRecordEntry.prototype.m_id = null;
oFF.ButterflyRecordEntry.prototype.m_timestamp = 0;
oFF.ButterflyRecordEntry.prototype.m_event = null;
oFF.ButterflyRecordEntry.prototype.m_payload = null;
oFF.ButterflyRecordEntry.prototype.getPayload = function()
{
	return this.m_payload;
};
oFF.ButterflyRecordEntry.prototype.getId = function()
{
	return this.m_id;
};
oFF.ButterflyRecordEntry.prototype.getTimestamp = function()
{
	return this.m_timestamp;
};
oFF.ButterflyRecordEntry.prototype.getEvent = function()
{
	return this.m_event;
};

oFF.ButterflyRecordingManager = {

	m_currentSession:null,
	m_sessions:null,
	m_isRecording:false,
	isRecording:function()
	{
			return oFF.ButterflyRecordingManager.m_isRecording;
	},
	startSession:function()
	{
			if (!oFF.ButterflyRecordingManager.m_isRecording)
		{
			oFF.ButterflyRecordingManager.m_currentSession = new oFF.RecordingSessionEntry();
			oFF.ButterflyRecordingManager.m_isRecording = true;
		}
		return oFF.ButterflyRecordingManager.m_currentSession;
	},
	stopSession:function()
	{
			var m_session = null;
		if (oFF.notNull(oFF.ButterflyRecordingManager.m_currentSession))
		{
			m_session = oFF.ButterflyRecordingManager.m_currentSession;
			if (oFF.notNull(oFF.ButterflyRecordingManager.m_sessions))
			{
				oFF.ButterflyRecordingManager.m_sessions.add(m_session);
			}
			else
			{
				oFF.ButterflyRecordingManager.m_sessions = oFF.XList.create();
				oFF.ButterflyRecordingManager.m_sessions.add(m_session);
			}
			oFF.ButterflyRecordingManager.m_currentSession = null;
		}
		oFF.ButterflyRecordingManager.m_isRecording = false;
		return m_session;
	},
	addEntry:function(entry)
	{
			if (oFF.ButterflyRecordingManager.m_isRecording)
		{
			oFF.ButterflyRecordingManager.m_currentSession.addEntry(entry);
		}
	},
	getEntries:function(entry)
	{
			return entry.getEntries();
	}
};

oFF.RecordingSessionEntry = function() {};
oFF.RecordingSessionEntry.prototype = new oFF.XObject();
oFF.RecordingSessionEntry.prototype._ff_c = "RecordingSessionEntry";

oFF.RecordingSessionEntry.prototype.m_id = null;
oFF.RecordingSessionEntry.prototype.m_timestamp = 0;
oFF.RecordingSessionEntry.prototype.m_recordedEntries = null;
oFF.RecordingSessionEntry.prototype.addEntry = function(entry)
{
	this.m_recordedEntries.add(entry);
};
oFF.RecordingSessionEntry.prototype.getEntries = function()
{
	return this.m_recordedEntries;
};
oFF.RecordingSessionEntry.prototype.getId = function()
{
	return this.m_id;
};
oFF.RecordingSessionEntry.prototype.getTimetamp = function()
{
	return this.m_timestamp;
};

oFF.XRemoteHttpFileConstants = {

	CHILDREN:"children",
	EXISTS:"exists",
	CONTENT:"content",
	CONTENT_TYPE:"contentType",
	FILE_TYPE:"fileType",
	EXECUTABLE:"executable",
	HIDDEN:"hidden",
	FILE_TYPE_DIR:"dir",
	FILE_TYPE_FILE:"file",
	FILE_NAME:"fileName",
	NEW_FILE_NAME:"newFileName",
	VFS:"vfs"
};

oFF.XFileSystemFactory = function() {};
oFF.XFileSystemFactory.prototype = new oFF.XObject();
oFF.XFileSystemFactory.prototype._ff_c = "XFileSystemFactory";

oFF.XFileSystemFactory.s_factory = null;
oFF.XFileSystemFactory.staticSetupFactory = function()
{
	oFF.XFileSystemFactory.s_factory = oFF.XHashMapByString.create();
};
oFF.XFileSystemFactory.registerFactory = function(type, factory)
{
	if (oFF.notNull(type))
	{
		oFF.XFileSystemFactory.s_factory.put(type.getName(), factory);
	}
};
oFF.XFileSystemFactory.getAllFactories = function()
{
	return oFF.XFileSystemFactory.s_factory;
};
oFF.XFileSystemFactory.getUriMask = function(protocolType)
{
	var mask = null;
	if (oFF.notNull(protocolType))
	{
		var factory = oFF.XFileSystemFactory.s_factory.getByKey(protocolType.getName());
		if (oFF.notNull(factory))
		{
			mask = factory.getFactoryUriMask(protocolType);
		}
		else
		{
			var mask2 = oFF.XUriMask.createDisabled();
			mask2.setWithScheme(true);
			mask2.setWithAuthority(false);
			mask = mask2;
		}
	}
	return mask;
};
oFF.XFileSystemFactory.create = function(process, uri)
{
	var fs = null;
	var type = uri.getProtocolType();
	var factory = oFF.XFileSystemFactory.s_factory.getByKey(type.getName());
	if (oFF.notNull(factory))
	{
		fs = factory.newFileSystem(process, uri);
	}
	else
	{
		var osFileSystem = oFF.XFileSystemOSFactory.create(process, type);
		if (oFF.notNull(osFileSystem))
		{
			fs = oFF.XFileSystemOSWrapper.create(osFileSystem);
		}
	}
	return fs;
};
oFF.XFileSystemFactory.prototype.getFactoryUriMask = function(protocolType)
{
	var mask = oFF.XUriMask.createDisabled();
	mask.setWithScheme(true);
	mask.setWithAuthority(false);
	return mask;
};

oFF.VfsPathInfo = function() {};
oFF.VfsPathInfo.prototype = new oFF.XObject();
oFF.VfsPathInfo.prototype._ff_c = "VfsPathInfo";

oFF.VfsPathInfo.create = function(name, path, pathElements, lastSeenParentNode, lastSeeParentNodeIndex, parentNode, element, matchType)
{
	var newObj = new oFF.VfsPathInfo();
	newObj.m_lastSeenParentNode = lastSeenParentNode;
	newObj.m_lastSeeParentNodeIndex = lastSeeParentNodeIndex;
	newObj.m_parentNode = parentNode;
	newObj.m_element = element;
	newObj.m_matchType = matchType;
	newObj.m_name = name;
	newObj.m_path = path;
	newObj.m_pathElements = pathElements;
	return newObj;
};
oFF.VfsPathInfo.prototype.m_lastSeenParentNode = null;
oFF.VfsPathInfo.prototype.m_lastSeeParentNodeIndex = 0;
oFF.VfsPathInfo.prototype.m_parentNode = null;
oFF.VfsPathInfo.prototype.m_element = null;
oFF.VfsPathInfo.prototype.m_name = null;
oFF.VfsPathInfo.prototype.m_matchType = null;
oFF.VfsPathInfo.prototype.m_path = null;
oFF.VfsPathInfo.prototype.m_pathElements = null;
oFF.VfsPathInfo.prototype.getLastSeenParentNode = function()
{
	return this.m_lastSeenParentNode;
};
oFF.VfsPathInfo.prototype.getLastSeeParentNodeIndex = function()
{
	return this.m_lastSeeParentNodeIndex;
};
oFF.VfsPathInfo.prototype.getParentNode = function()
{
	return this.m_parentNode;
};
oFF.VfsPathInfo.prototype.getElement = function()
{
	return this.m_element;
};
oFF.VfsPathInfo.prototype.getFileName = function()
{
	return this.m_name;
};
oFF.VfsPathInfo.prototype.isExisting = function()
{
	return this.m_matchType === oFF.VfsMatchResultType.EXACT;
};
oFF.VfsPathInfo.prototype.isFile = function()
{
	return this.isExisting() && this.m_element.getComponentType().isTypeOf(oFF.VfsElementType.FILE);
};
oFF.VfsPathInfo.prototype.isDirectory = function()
{
	return this.isExisting() && this.m_element.getComponentType().isTypeOf(oFF.VfsElementType.NODE);
};
oFF.VfsPathInfo.prototype.saveExt = function(content, compression)
{
	if (oFF.notNull(this.m_element))
	{
		if (this.m_element.getComponentType().isTypeOf(oFF.VfsElementType.FILE))
		{
			var file = this.m_element;
			file.setContent(content);
		}
	}
	else if (oFF.notNull(this.m_parentNode))
	{
		if (this.m_parentNode.getComponentType().isTypeOf(oFF.VfsElementType.DIR))
		{
			var dir = this.m_parentNode;
			var newFile = oFF.VfsElementFile.createFile(dir.getVfs(), null, this.getFileName(), content);
			dir.setChild(newFile);
		}
	}
};
oFF.VfsPathInfo.prototype.loadExt = function(compression)
{
	var content = null;
	if (oFF.notNull(this.m_element))
	{
		if (this.m_element.getComponentType().isTypeOf(oFF.VfsElementType.FILE))
		{
			var file = this.m_element;
			content = file.getContent();
		}
	}
	return content;
};
oFF.VfsPathInfo.prototype.mkdirExt = function(includeParentDirs)
{
	if (oFF.isNull(this.m_element))
	{
		var newDir;
		if (oFF.notNull(this.m_parentNode))
		{
			if (this.m_parentNode.getComponentType().isTypeOf(oFF.VfsElementType.DIR))
			{
				var dir = this.m_parentNode;
				newDir = oFF.VfsElementDir.createDir(dir.getVfs(), this.getFileName(), null);
				dir.setChild(newDir);
			}
		}
		else if (includeParentDirs === true && oFF.notNull(this.m_lastSeenParentNode))
		{
			if (this.m_lastSeenParentNode.getComponentType().isTypeOf(oFF.VfsElementType.DIR))
			{
				var lastDir = this.m_lastSeenParentNode;
				var vfs = lastDir.getVfs();
				for (var i = this.m_lastSeeParentNodeIndex + 1; i < this.m_pathElements.size(); i++)
				{
					var name = this.m_pathElements.get(i);
					newDir = oFF.VfsElementDir.createDir(vfs, name, null);
					lastDir.setChild(newDir);
					lastDir = newDir;
				}
			}
		}
	}
};
oFF.VfsPathInfo.prototype.deleteFile = function()
{
	if (oFF.notNull(this.m_parentNode) && oFF.notNull(this.m_element))
	{
		if (this.m_parentNode.getComponentType().isTypeOf(oFF.VfsElementType.DIR))
		{
			var dir = this.m_parentNode;
			dir.removeChild(this.m_name);
		}
	}
};
oFF.VfsPathInfo.prototype.getChildNames = function()
{
	var childNames = null;
	if (this.isDirectory())
	{
		childNames = this.m_element.getChildNames();
	}
	return childNames;
};
oFF.VfsPathInfo.prototype.getChildMetadata = function()
{
	var metadataList = null;
	if (this.isDirectory())
	{
		metadataList = this.m_element.getChildMetadata();
	}
	return metadataList;
};
oFF.VfsPathInfo.prototype.getAttributes = function()
{
	var attributes;
	if (oFF.notNull(this.m_element))
	{
		attributes = this.m_element.getAttributes();
	}
	else
	{
		attributes = oFF.PrFactory.createStructure();
	}
	return attributes;
};
oFF.VfsPathInfo.prototype.getPath = function()
{
	return this.m_path;
};
oFF.VfsPathInfo.prototype.getPathElements = function()
{
	return this.m_pathElements;
};
oFF.VfsPathInfo.prototype.isInMountingArea = function()
{
	return this.getMountPoint() !== null;
};
oFF.VfsPathInfo.prototype.isOnMountPoint = function()
{
	var node = null;
	if (oFF.notNull(this.m_element))
	{
		if (this.m_element.getComponentType() === oFF.VfsElementType.MOUNT_POINT)
		{
			node = this.m_element;
		}
	}
	return oFF.notNull(node);
};
oFF.VfsPathInfo.prototype.getMountPoint = function()
{
	var node = null;
	if (oFF.notNull(this.m_element))
	{
		if (this.m_element.getComponentType() === oFF.VfsElementType.MOUNT_POINT)
		{
			node = this.m_element;
		}
	}
	else if (oFF.notNull(this.m_lastSeenParentNode))
	{
		if (this.m_lastSeenParentNode.getComponentType() === oFF.VfsElementType.MOUNT_POINT)
		{
			node = this.m_lastSeenParentNode;
		}
	}
	return node;
};

oFF.XFile = {

	GZIP_EXTENSION:".gz",
	SLASH:"/",
	BACK_SLASH:"\\",
	COLON:":",
	FILE_SCHEMA_URL:"file://",
	FILE_SCHEMA:"file",
	URL_PATTERN:"://",
	CURRENT_DIR:".",
	PARENT_DIR:"..",
	DEBUG_MODE:false,
	create:function(process, autoDetectPath)
	{
			return oFF.XFile.createExt(process, autoDetectPath, oFF.PathFormat.AUTO_DETECT, oFF.VarResolveMode.NONE, null, false);
	},
	createRoot:function(process)
	{
			return oFF.XFile.createExt(process, oFF.XFile.SLASH, oFF.PathFormat.AUTO_DETECT, oFF.VarResolveMode.NONE, null, false);
	},
	createWithVars:function(process, autoDetectPath)
	{
			return oFF.XFile.createExt(process, autoDetectPath, oFF.PathFormat.AUTO_DETECT, oFF.VarResolveMode.DOLLAR, null, false);
	},
	createWithVarsExt:function(process, autoDetectPath, blockingMetadataCallFallback)
	{
			return oFF.XFile.createExt(process, autoDetectPath, oFF.PathFormat.AUTO_DETECT, oFF.VarResolveMode.DOLLAR, null, blockingMetadataCallFallback);
	},
	createByNativePath:function(process, nativePath)
	{
			return oFF.XFile.createExt(process, nativePath, oFF.PathFormat.NATIVE, oFF.VarResolveMode.NONE, null, false);
	},
	createByUrl:function(process, url)
	{
			return oFF.XFile.createExt(process, url, oFF.PathFormat.URL, oFF.VarResolveMode.NONE, null, false);
	},
	createFromEnvVar:function(process, environmentVariable, relativePath)
	{
			var sdkPath = oFF.XStringUtils.concatenate5(oFF.XEnvironment.VAR_START, environmentVariable, oFF.XEnvironment.VAR_END, oFF.XFile.SLASH, relativePath);
		return oFF.XFile.createExt(process, sdkPath, oFF.PathFormat.AUTO_DETECT, oFF.VarResolveMode.DOLLAR, null, false);
	},
	createExt:function(process, path, pathFormat, varResolveMode, defaultProtocolType, blockingMetadataCallFallback)
	{
			return oFF.XFileHandle.createByPath(process, path, pathFormat, varResolveMode, defaultProtocolType, blockingMetadataCallFallback);
	},
	createByUri:function(process, uri)
	{
			return oFF.XFileHandle.createByUri(process, uri, false);
	},
	createByUriExt:function(process, uri, blockingMetadataCallFallback)
	{
			return oFF.XFileHandle.createByUri(process, uri, blockingMetadataCallFallback);
	}
};

oFF.XFileChildrenResultset = function() {};
oFF.XFileChildrenResultset.prototype = new oFF.XObject();
oFF.XFileChildrenResultset.prototype._ff_c = "XFileChildrenResultset";

oFF.XFileChildrenResultset.create = function(childFiles, totalItemCount)
{
	var newObj = new oFF.XFileChildrenResultset();
	newObj.setupExt(childFiles, totalItemCount);
	return newObj;
};
oFF.XFileChildrenResultset.prototype.m_childFiles = null;
oFF.XFileChildrenResultset.prototype.m_childNames = null;
oFF.XFileChildrenResultset.prototype.m_totalItemCount = 0;
oFF.XFileChildrenResultset.prototype.setupExt = function(childFiles, totalItemCount)
{
	this.m_childFiles = childFiles;
	this.m_totalItemCount = totalItemCount;
};
oFF.XFileChildrenResultset.prototype.getChildNames = function()
{
	if (oFF.isNull(this.m_childNames))
	{
		var childNames = oFF.XListOfString.create();
		var size = this.m_childFiles.size();
		var currentFile;
		for (var i = 0; i < size; i++)
		{
			currentFile = this.m_childFiles.get(i);
			childNames.add(currentFile.getName());
		}
		this.m_childNames = childNames;
	}
	return this.m_childNames;
};
oFF.XFileChildrenResultset.prototype.getChildFiles = function()
{
	return this.m_childFiles;
};
oFF.XFileChildrenResultset.prototype.getItemCount = function()
{
	return this.m_childNames.size();
};
oFF.XFileChildrenResultset.prototype.getTotalItemCount = function()
{
	return this.m_totalItemCount;
};

oFF.ModuleInitializer = function() {};
oFF.ModuleInitializer.prototype = new oFF.XObject();
oFF.ModuleInitializer.prototype._ff_c = "ModuleInitializer";

oFF.ModuleInitializer.initAllReleaseModules = function(verbose)
{
	oFF.CoreModule.getInstance();
	oFF.XClass.initializeClass("com.oFF.PlatformModule", verbose);
	oFF.XClass.initializeClass("com.oFF.CoreExtModule", verbose);
	oFF.XClass.initializeClass("com.oFF.IoModule", verbose);
	oFF.XClass.initializeClass("com.oFF.IoNativeModule", verbose);
	oFF.XClass.initializeClass("com.oFF.IoExtModule", verbose);
	oFF.XClass.initializeClass("com.oFF.RuntimeModule", verbose);
	oFF.XClass.initializeClass("com.oFF.ContentlibModule", verbose);
	oFF.XClass.initializeClass("com.oFF.ToolsModule", verbose);
	oFF.XClass.initializeClass("com.oFF.WebdispatcherModule", verbose);
	oFF.XClass.initializeClass("com.oFF.ServerNativeModule", verbose);
	oFF.XClass.initializeClass("com.oFF.UiModule", verbose);
	oFF.XClass.initializeClass("com.oFF.UiDriverModule", verbose);
	oFF.XClass.initializeClass("com.oFF.AbstractionModule", verbose);
	oFF.XClass.initializeClass("com.oFF.ProtocolModule", verbose);
	oFF.XClass.initializeClass("com.oFF.ProcessorModule", verbose);
	oFF.XClass.initializeClass("com.oFF.OlapApiModule", verbose);
	oFF.XClass.initializeClass("com.oFF.OlapBwExtApiModule", verbose);
	oFF.XClass.initializeClass("com.oFF.OlapCatalogApiModule", verbose);
	oFF.XClass.initializeClass("com.oFF.ResultsetModule", verbose);
	oFF.XClass.initializeClass("com.oFF.OlapExtModule", verbose);
	oFF.XClass.initializeClass("com.oFF.OlapImplModule", verbose);
	oFF.XClass.initializeClass("com.oFF.OlapCmdImplModule", verbose);
	oFF.XClass.initializeClass("com.oFF.IpImplModule", verbose);
	oFF.XClass.initializeClass("com.oFF.OlapBwExtImplModule", verbose);
	oFF.XClass.initializeClass("com.oFF.OlapCatalogImplModule", verbose);
	oFF.XClass.initializeClass("com.oFF.OlapReferenceModule", verbose);
	oFF.XClass.initializeClass("com.oFF.OlapHelpersModule", verbose);
	oFF.XClass.initializeClass("com.oFF.ProviderModule", verbose);
	oFF.XClass.initializeClass("com.oFF.StoryModule", verbose);
	oFF.XClass.initializeClass("com.oFF.XicsModule", verbose);
	oFF.XClass.initializeClass("com.oFF.InaManipulationModule", verbose);
	oFF.XClass.initializeClass("com.oFF.RepoModule", verbose);
	oFF.XClass.initializeClass("com.oFF.EPMModule", verbose);
	oFF.XClass.initializeClass("com.oFF.QuasarModule", verbose);
	oFF.XClass.initializeClass("com.oFF.OlapUiModule", verbose);
	oFF.XClass.initializeClass("com.oFF.PoseidonModule", verbose);
	oFF.XClass.initializeClass("com.oFF.StudioModule", verbose);
	oFF.XClass.initializeClass("com.oFF.StudioUiModule", verbose);
	oFF.XClass.initializeClass("com.oFF.ExamplesModule", verbose);
};
oFF.ModuleInitializer.initAllTestModules = function(verbose)
{
	oFF.ModuleInitializer.initAllReleaseModules(verbose);
	oFF.XClass.initializeClass("com.oFF.IoTestModule", verbose);
	oFF.XClass.initializeClass("com.oFF.RuntimeTestModule", verbose);
	oFF.XClass.initializeClass("com.oFF.WebDispatcherTestModule", verbose);
	oFF.XClass.initializeClass("com.oFF.UiDriverTestModule", verbose);
	oFF.XClass.initializeClass("com.oFF.AbstractionTestModule", verbose);
	oFF.XClass.initializeClass("com.oFF.OlapNativeTestModule", verbose);
	oFF.XClass.initializeClass("com.oFF.OlapTestModule", verbose);
	oFF.XClass.initializeClass("com.oFF.ProcessorTestModule", verbose);
	oFF.XClass.initializeClass("com.oFF.StoryTestModule", verbose);
	oFF.XClass.initializeClass("com.oFF.InACacheTestsModule", verbose);
	oFF.XClass.initializeClass("com.oFF.RepoTestModule", verbose);
	oFF.XClass.initializeClass("com.oFF.EPMTestModule", verbose);
	oFF.XClass.initializeClass("com.oFF.StudioTestsModule", verbose);
	oFF.XClass.initializeClass("com.oFF.ApplicationTestModule", verbose);
};

oFF.ModuleLoaderDummy = function() {};
oFF.ModuleLoaderDummy.prototype = new oFF.XObject();
oFF.ModuleLoaderDummy.prototype._ff_c = "ModuleLoaderDummy";

oFF.ModuleLoaderDummy.staticSetup = function()
{
	oFF.ModuleManager.registerModuleLoader(new oFF.ModuleLoaderDummy());
};
oFF.ModuleLoaderDummy.prototype.processModuleLoad = function(session, moduleDef, listener, cachebusterId)
{
	var messages = oFF.MessageManagerSimple.createMessageManager();
	var fullClazzName = moduleDef.getInitClazzNameCompatible();
	var clazz = oFF.XClass.createByName(fullClazzName);
	if (oFF.notNull(clazz))
	{
		clazz.newInstance(session);
	}
	else
	{
		messages.addMessage(oFF.XMessage.createError(oFF.OriginLayer.KERNEL, oFF.XStringUtils.concatenate2("ModuleLoader: Could not load XCLass=", fullClazzName), null, false, null));
	}
	listener.onModuleLoaded(messages, moduleDef.getName(), true);
};

oFF.ModuleResources = {

	staticSetup:function()
	{
			oFF.ModuleManager.registerDirect("_all", null, false, "_all/combined/_all.js", null, null);
		oFF.ModuleManager.registerDirect("_all_release", null, false, "_all_release/combined/_all_release.js", "ff0060.commons.ext,ff0070.structures,ff0080.structures.native,ff0230.io.ext,ff1030.kernel.impl,ff1040.kernel.native,ff2010.binding,ff2040.shell,ff2150.contentlib,ff2170.tools,ff2180.webdispatcher,ff2210.ui.native,ff2220.ui.tools,ff2240.ui.program,ff2310.server.native,ff2700.export,ff2710.export.native,ff3100.system.ui,ff3300.cell.engine,ff3350.cell.engine.ui,ff3410.contextmenu.engine.impl,ff3500.sql,ff3550.sql.ui,ff3600.horizon.ui.api,ff3610.horizon.ui,ff3620.horizon.ui.plugins,ff4315.olap.ip.impl,ff4320.olap.masterdata.impl,ff4410.olap.ip.providers,ff4400.olap.providers,ff4500.olap.engine,ff5500.story,ff6000.ina.cache,ff6010.ina.manipulation,ff6200.epmapp,ff4050.processor,ff8005.olap.ui.api,ff8010.olap.ui,ff8090.poseidon,ff8095.utils.ui,ff8100.studio,ff8110.studio.ui,ff8120.dragonfly,ff8900.examples", null);
		oFF.ModuleManager.registerDirect("_all_tests", null, false, "_all_tests/combined/_all_tests.js", "_all_release,ff0065.commons.tests,ff1090.kernel.tests,ff3190.system.ui.tests,ff3390.cell.engine.tests,ff3490.contextmenu.engine.tests,ff3590.sql.test,ff8990.application.tests,ff2290.ui.tests,ff5510.story.tests,ff6190.repo.tests,ff6290.epmapp.tests,ff8110.studio.ui,ff8120.dragonfly,ff8190.studio.tests", null);
		oFF.ModuleManager.registerDirect("ff0000.language.native", null, false, "ff0000.language.native/combined/ff0000.language.native.js", null, null);
		oFF.ModuleManager.registerDirect("ff0005.language.ext", "com.oFF.LanguageExtModule", false, "ff0005.language.ext/combined/ff0005.language.ext.js", "ff0000.language.native", null);
		oFF.ModuleManager.registerDirect("ff0010.core", "com.oFF.CoreModule", false, "ff0010.core/combined/ff0010.core.js", "ff0005.language.ext", null);
		oFF.ModuleManager.registerDirect("ff0020.core.native", "com.oFF.PlatformModule", false, "ff0020.core.native/combined/ff0020.core.native.js", "ff0010.core", null);
		oFF.ModuleManager.registerDirect("ff0030.core.ext", "com.oFF.CoreExtModule", false, "ff0030.core.ext/combined/ff0030.core.ext.js", "ff0020.core.native", null);
		oFF.ModuleManager.registerDirect("ff0040.commons", "com.oFF.CommonsModule", false, "ff0040.commons/combined/ff0040.commons.js", "ff0030.core.ext", null);
		oFF.ModuleManager.registerDirect("ff0050.commons.native", "com.oFF.CommonsNativeModule", false, "ff0050.commons.native/combined/ff0050.commons.native.js", "ff0040.commons", null);
		oFF.ModuleManager.registerDirect("ff0060.commons.ext", "com.oFF.CommonsExtModule", false, "ff0060.commons.ext/combined/ff0060.commons.ext.js", "ff0050.commons.native", null);
		oFF.ModuleManager.registerDirect("ff0065.commons.tests", "com.oFF.CommonsTestModule", false, "ff0065.commons.tests/combined/ff0065.commons.tests.js", "ff0060.commons.ext", null);
		oFF.ModuleManager.registerDirect("ff0070.structures", "com.oFF.StructuresModule", false, "ff0070.structures/combined/ff0070.structures.js", "ff0060.commons.ext", null);
		oFF.ModuleManager.registerDirect("ff0080.structures.native", "com.oFF.StructuresNativeModule", false, "ff0080.structures.native/combined/ff0080.structures.native.js", "ff0070.structures", null);
		oFF.ModuleManager.registerDirect("ff0090.structures.tests", "com.oFF.PlatformTestModule", false, "ff0090.structures.tests/combined/ff0090.structures.tests.js", "ff0065.commons.tests,ff0080.structures.native", null);
		oFF.ModuleManager.registerDirect("ff0200.io", "com.oFF.IoModule", false, "ff0200.io/combined/ff0200.io.js", "ff0080.structures.native", null);
		oFF.ModuleManager.registerDirect("ff0210.io.native", "com.oFF.IoNativeModule", false, "ff0210.io.native/combined/ff0210.io.native.js", "ff0200.io", null);
		oFF.ModuleManager.registerDirect("ff0230.io.ext", "com.oFF.IoExtModule", false, "ff0230.io.ext/combined/ff0230.io.ext.js", "ff0210.io.native", null);
		oFF.ModuleManager.registerDirect("ff0290.io.tests", "com.oFF.IoTestModule", false, "ff0290.io.tests/combined/ff0290.io.tests.js", "ff0090.structures.tests,ff0230.io.ext", null);
		oFF.ModuleManager.registerDirect("ff1000.kernel.api", "com.oFF.KernelApiModule", false, "ff1000.kernel.api/combined/ff1000.kernel.api.js", "ff0230.io.ext", null);
		oFF.ModuleManager.registerDirect("ff1010.kernel.api.base", "com.oFF.KernelApiBaseModule", false, "ff1010.kernel.api.base/combined/ff1010.kernel.api.base.js", "ff1000.kernel.api", null);
		oFF.ModuleManager.registerDirect("ff1030.kernel.impl", "com.oFF.KernelImplModule", false, "ff1030.kernel.impl/combined/ff1030.kernel.impl.js", "ff1010.kernel.api.base", null);
		oFF.ModuleManager.registerDirect("ff1040.kernel.native", "com.oFF.KernelNativeModule", false, "ff1040.kernel.native/combined/ff1040.kernel.native.js", "ff1030.kernel.impl", null);
		oFF.ModuleManager.registerDirect("ff1090.kernel.tests", "com.oFF.KernelTestsModule", false, "ff1090.kernel.tests/combined/ff1090.kernel.tests.js", "ff0290.io.tests,ff1040.kernel.native", null);
		oFF.ModuleManager.registerDirect("ff2010.binding", "com.oFF.BindingModule", false, "ff2010.binding/combined/ff2010.binding.js", "ff1040.kernel.native", null);
		oFF.ModuleManager.registerDirect("ff2040.shell", "com.oFF.ShellModule", false, "ff2040.shell/combined/ff2040.shell.js", "ff1040.kernel.native", null);
		oFF.ModuleManager.registerDirect("ff2100.runtime", "com.oFF.RuntimeModule", false, "ff2100.runtime/combined/ff2100.runtime.js", "ff0210.io.native,ff0230.io.ext,ff1040.kernel.native,ff2010.binding", null);
		oFF.ModuleManager.registerDirect("ff2150.contentlib", "com.oFF.ContentlibModule", false, "ff2150.contentlib/combined/ff2150.contentlib.js", "ff2100.runtime", null);
		oFF.ModuleManager.registerDirect("ff2170.tools", "com.oFF.ToolsModule", false, "ff2170.tools/combined/ff2170.tools.js", "ff2100.runtime", null);
		oFF.ModuleManager.registerDirect("ff2180.webdispatcher", "com.oFF.WebdispatcherModule", false, "ff2180.webdispatcher/combined/ff2180.webdispatcher.js", "ff1040.kernel.native", null);
		oFF.ModuleManager.registerDirect("ff2190.runtime.tests", "com.oFF.RuntimeTestModule", false, "ff2190.runtime.tests/combined/ff2190.runtime.tests.js", "ff0290.io.tests,ff1090.kernel.tests,ff2040.shell,ff2100.runtime,ff2170.tools,ff2180.webdispatcher,ff2150.contentlib", null);
		oFF.ModuleManager.registerDirect("ff2195.webdispatcher.tests", "com.oFF.WebDispatcherTestModule", false, "ff2195.webdispatcher.tests/combined/ff2195.webdispatcher.tests.js", "ff2190.runtime.tests,ff2180.webdispatcher", null);
		oFF.ModuleManager.registerDirect("ff2200.ui", "com.oFF.UiModule", false, "ff2200.ui/combined/ff2200.ui.js", "ff1040.kernel.native,ff2010.binding", null);
		oFF.ModuleManager.registerDirect("ff2210.ui.native", "com.oFF.UiDriverModule", true, "ff2210.ui.native/combined/ff2210.ui.native.js", "ff2200.ui", "{\"ExternalLibraries\":{\"Javascript\":{\"sapui5\":[{\"Id\":\"sap-ui-bootstrap\",\"Source\":\"https:\\/\\/sapui5.hana.ondemand.com\\/resources\\/sap-ui-core.js\",\"Tags\":[{\"data-sap-ui-language\":\"en\"},{\"data-sap-ui-theme\":\"sap_belize\"},{\"data-sap-ui-libs\":\"sap.ui.core,sap.ui.table,sap.ui.unified,sap.m\"},{\"data-sap-ui-compatVersion\":\"edge\"}],\"Type\":\"Javascript\"},{\"Source\":\"${network}\\/ff2210.ui.native\\/javascript.sapui5\\/firefly.styles.sapui5.css\",\"Type\":\"Css\"},{\"Description\":\"Required for UxWindow and UxTerminal\",\"Source\":\"https:\\/\\/cdn.jsdelivr.net\\/npm\\/interactjs\\/dist\\/interact.min.js\",\"Type\":\"Javascript\"},{\"Source\":\"https:\\/\\/code.highcharts.com\\/stock\\/highstock.js\",\"Type\":\"Javascript\"},{\"Source\":\"https:\\/\\/code.highcharts.com\\/stock\\/highcharts-more.js\",\"Type\":\"Javascript\"},{\"Source\":\"https:\\/\\/code.highcharts.com\\/stock\\/modules\\/solid-gauge.js\",\"Type\":\"Javascript\"},{\"Source\":\"https:\\/\\/code.highcharts.com\\/modules\\/histogram-bellcurve.js\",\"Type\":\"Javascript\"},{\"Source\":\"https:\\/\\/code.highcharts.com\\/modules\\/no-data-to-display.js\",\"Type\":\"Javascript\"},{\"Source\":\"https:\\/\\/code.highcharts.com\\/modules\\/wordcloud.js\",\"Type\":\"Javascript\"},{\"Source\":\"https:\\/\\/code.highcharts.com\\/modules\\/variable-pie.js\",\"Type\":\"Javascript\"},{\"Source\":\"https:\\/\\/code.highcharts.com\\/modules\\/heatmap.js\",\"Type\":\"Javascript\"},{\"Source\":\"https:\\/\\/code.highcharts.com\\/modules\\/treemap.js\",\"Type\":\"Javascript\"},{\"Source\":\"https:\\/\\/code.highcharts.com\\/modules\\/variwide.js\",\"Type\":\"Javascript\"},{\"Source\":\"https:\\/\\/code.highcharts.com\\/modules\\/pattern-fill.js\",\"Type\":\"Javascript\"},{\"Source\":\"https:\\/\\/code.highcharts.com\\/highcharts-3d.js\",\"Type\":\"Javascript\"},{\"Source\":\"http:\\/\\/blacklabel.github.io\\/grouped_categories\\/grouped-categories.js\",\"Type\":\"Javascript\"}]}}}");
		oFF.ModuleManager.registerDirect("ff2220.ui.tools", "com.oFF.UiToolsModule", false, "ff2220.ui.tools/combined/ff2220.ui.tools.js", "ff2200.ui,ff2100.runtime", null);
		oFF.ModuleManager.registerDirect("ff2240.ui.program", "com.oFF.UiProgramModule", false, "ff2240.ui.program/combined/ff2240.ui.program.js", "ff2220.ui.tools", null);
		oFF.ModuleManager.registerDirect("ff2260.ui.remote", "com.oFF.UiRemoteModule", false, "ff2260.ui.remote/combined/ff2260.ui.remote.js", "ff2240.ui.program", null);
		oFF.ModuleManager.registerDirect("ff2290.ui.tests", "com.oFF.UiDriverTestModule", false, "ff2290.ui.tests/combined/ff2290.ui.tests.js", "ff2190.runtime.tests,ff2260.ui.remote", null);
		oFF.ModuleManager.registerDirect("ff2310.server.native", "com.oFF.ServerNativeModule", false, "ff2310.server.native/combined/ff2310.server.native.js", "ff2100.runtime", null);
		oFF.ModuleManager.registerDirect("ff2600.visualization.abstract", "com.oFF.VisualizationAbstractModule", false, "ff2600.visualization.abstract/combined/ff2600.visualization.abstract.js", "ff0200.io", null);
		oFF.ModuleManager.registerDirect("ff2610.visualization.internal", "com.oFF.VisualizationInternalModule", false, "ff2610.visualization.internal/combined/ff2610.visualization.internal.js", "ff2600.visualization.abstract", null);
		oFF.ModuleManager.registerDirect("ff2650.visualization.impl", "com.oFF.VisualizationImplModule", false, "ff2650.visualization.impl/combined/ff2650.visualization.impl.js", "ff2610.visualization.internal", null);
		oFF.ModuleManager.registerDirect("ff2690.visualization.tests", "com.oFF.VisualizationTestsModule", false, "ff2690.visualization.tests/combined/ff2690.visualization.tests.js", "ff2650.visualization.impl", null);
		oFF.ModuleManager.registerDirect("ff2700.export", "com.oFF.ExportModule", false, "ff2700.export/combined/ff2700.export.js", "ff0005.language.ext,ff0040.commons,ff0070.structures,ff2650.visualization.impl", null);
		oFF.ModuleManager.registerDirect("ff2710.export.native", "com.oFF.ExportNativeModule", false, "ff2710.export.native/combined/ff2710.export.native.js", "ff2700.export", null);
		oFF.ModuleManager.registerDirect("ff2715.export.tests", "com.oFF.ExportTestModule", false, "ff2715.export.tests/combined/ff2715.export.tests.js", "ff2190.runtime.tests,ff2700.export", null);
		oFF.ModuleManager.registerDirect("ff3100.system.ui", "com.oFF.SystemUiModule", false, "ff3100.system.ui/combined/ff3100.system.ui.js", "ff2240.ui.program,ff2700.export", null);
		oFF.ModuleManager.registerDirect("ff3190.system.ui.tests", "com.oFF.SystemUiTestsModule", false, "ff3190.system.ui.tests/combined/ff3190.system.ui.tests.js", "ff2190.runtime.tests,ff3100.system.ui,ff2600.visualization.abstract", null);
		oFF.ModuleManager.registerDirect("ff3300.cell.engine", "com.oFF.CellEngineModule", false, "ff3300.cell.engine/combined/ff3300.cell.engine.js", "ff2220.ui.tools,ff2600.visualization.abstract", null);
		oFF.ModuleManager.registerDirect("ff3350.cell.engine.ui", "com.oFF.CellEngineModuleUi", false, "ff3350.cell.engine.ui/combined/ff3350.cell.engine.ui.js", "ff3300.cell.engine,ff2650.visualization.impl", null);
		oFF.ModuleManager.registerDirect("ff3390.cell.engine.tests", "com.oFF.CellEngineTestsModule", false, "ff3390.cell.engine.tests/combined/ff3390.cell.engine.tests.js", "ff2190.runtime.tests,ff3300.cell.engine", null);
		oFF.ModuleManager.registerDirect("ff3400.contextmenu.engine", "com.oFF.ContextMenuEngineModule", false, "ff3400.contextmenu.engine/combined/ff3400.contextmenu.engine.js", "ff0200.io", null);
		oFF.ModuleManager.registerDirect("ff3410.contextmenu.engine.impl", "com.oFF.ContextMenuEngineImplModule", false, "ff3410.contextmenu.engine.impl/combined/ff3410.contextmenu.engine.impl.js", "ff3400.contextmenu.engine", null);
		oFF.ModuleManager.registerDirect("ff3490.contextmenu.engine.tests", "com.oFF.ContextMenuEngineTestsModule", false, "ff3490.contextmenu.engine.tests/combined/ff3490.contextmenu.engine.tests.js", "ff2190.runtime.tests,ff3410.contextmenu.engine.impl", null);
		oFF.ModuleManager.registerDirect("ff3500.sql", "com.oFF.SqlModule", false, "ff3500.sql/combined/ff3500.sql.js", "ff0005.language.ext,ff2100.runtime", null);
		oFF.ModuleManager.registerDirect("ff3550.sql.ui", "com.oFF.SqlUiModule", false, "ff3550.sql.ui/combined/ff3550.sql.ui.js", "ff2200.ui,ff2240.ui.program,ff3500.sql", null);
		oFF.ModuleManager.registerDirect("ff3590.sql.test", "com.oFF.SqlTestModule", false, "ff3590.sql.test/combined/ff3590.sql.test.js", "ff2190.runtime.tests,ff3500.sql", null);
		oFF.ModuleManager.registerDirect("ff3600.horizon.ui.api", "com.oFF.HorizonUiApiModule", false, "ff3600.horizon.ui.api/combined/ff3600.horizon.ui.api.js", "ff3100.system.ui", null);
		oFF.ModuleManager.registerDirect("ff3610.horizon.ui", "com.oFF.HorizonUiModule", false, "ff3610.horizon.ui/combined/ff3610.horizon.ui.js", "ff3600.horizon.ui.api", null);
		oFF.ModuleManager.registerDirect("ff3620.horizon.ui.plugins", "com.oFF.HorizonUiPluginsModule", false, "ff3620.horizon.ui.plugins/combined/ff3620.horizon.ui.plugins.js", "ff3610.horizon.ui,ff3350.cell.engine.ui", null);
		oFF.ModuleManager.registerDirect("ff4000.protocol.ina", "com.oFF.ProtocolModule", false, "ff4000.protocol.ina/combined/ff4000.protocol.ina.js", "ff2100.runtime", null);
		oFF.ModuleManager.registerDirect("ff4050.processor", "com.oFF.ProcessorModule", false, "ff4050.processor/combined/ff4050.processor.js", "ff4000.protocol.ina", null);
		oFF.ModuleManager.registerDirect("ff4200.olap.api", "com.oFF.OlapApiModule", false, "ff4200.olap.api/combined/ff4200.olap.api.js", "ff2100.runtime,ff2600.visualization.abstract", null);
		oFF.ModuleManager.registerDirect("ff4205.olap.api.base", "com.oFF.OlapApiBaseModule", false, "ff4205.olap.api.base/combined/ff4205.olap.api.base.js", "ff4200.olap.api,ff2610.visualization.internal", null);
		oFF.ModuleManager.registerDirect("ff4210.olap.masterdata.api", "com.oFF.OlapBwExtApiModule", false, "ff4210.olap.masterdata.api/combined/ff4210.olap.masterdata.api.js", "ff4200.olap.api", null);
		oFF.ModuleManager.registerDirect("ff4220.olap.catalog.api", "com.oFF.OlapCatalogApiModule", false, "ff4220.olap.catalog.api/combined/ff4220.olap.catalog.api.js", "ff4200.olap.api", null);
		oFF.ModuleManager.registerDirect("ff4250.olap.resultset", "com.oFF.ResultsetModule", false, "ff4250.olap.resultset/combined/ff4250.olap.resultset.js", "ff4000.protocol.ina,ff4200.olap.api,ff4205.olap.api.base", null);
		oFF.ModuleManager.registerDirect("ff4305.olap.model", "com.oFF.OlapModelModule", false, "ff4305.olap.model/combined/ff4305.olap.model.js", "ff4205.olap.api.base", null);
		oFF.ModuleManager.registerDirect("ff4310.olap.impl", "com.oFF.OlapImplModule", false, "ff4310.olap.impl/combined/ff4310.olap.impl.js", "ff4000.protocol.ina,ff4205.olap.api.base,ff4250.olap.resultset,ff4305.olap.model", null);
		oFF.ModuleManager.registerDirect("ff4315.olap.ip.impl", "com.oFF.IpImplModule", false, "ff4315.olap.ip.impl/combined/ff4315.olap.ip.impl.js", "ff4310.olap.impl", null);
		oFF.ModuleManager.registerDirect("ff4320.olap.masterdata.impl", "com.oFF.OlapBwExtImplModule", false, "ff4320.olap.masterdata.impl/combined/ff4320.olap.masterdata.impl.js", "ff4310.olap.impl,ff4210.olap.masterdata.api,ff4315.olap.ip.impl", null);
		oFF.ModuleManager.registerDirect("ff4330.olap.catalog.impl", "com.oFF.OlapCatalogImplModule", false, "ff4330.olap.catalog.impl/combined/ff4330.olap.catalog.impl.js", "ff4310.olap.impl,ff4220.olap.catalog.api", null);
		oFF.ModuleManager.registerDirect("ff4340.olap.reference", "com.oFF.OlapReferenceModule", false, "ff4340.olap.reference/combined/ff4340.olap.reference.js", "ff2220.ui.tools,ff2650.visualization.impl,ff4310.olap.impl", null);
		oFF.ModuleManager.registerDirect("ff4390.olap.helpers", "com.oFF.OlapHelpersModule", false, "ff4390.olap.helpers/combined/ff4390.olap.helpers.js", "ff4000.protocol.ina,ff4250.olap.resultset", null);
		oFF.ModuleManager.registerDirect("ff4394.olap.serialization", "com.oFF.OlapSerializationModule", false, "ff4394.olap.serialization/combined/ff4394.olap.serialization.js", "ff4310.olap.impl", null);
		oFF.ModuleManager.registerDirect("ff4400.olap.providers", "com.oFF.ProviderModule", false, "ff4400.olap.providers/combined/ff4400.olap.providers.js", "ff4394.olap.serialization", null);
		oFF.ModuleManager.registerDirect("ff4410.olap.ip.providers", "com.oFF.IpProviderModule", false, "ff4410.olap.ip.providers/combined/ff4410.olap.ip.providers.js", "ff4400.olap.providers,ff4315.olap.ip.impl", null);
		oFF.ModuleManager.registerDirect("ff4500.olap.engine", "com.oFF.OlapEngineModule", false, "ff4500.olap.engine/combined/ff4500.olap.engine.js", "ff2100.runtime,ff4050.processor,ff4200.olap.api,ff3500.sql", null);
		oFF.ModuleManager.registerDirect("ff4900.olap.native.tests", "com.oFF.OlapNativeTestModule", false, "ff4900.olap.native.tests/combined/ff4900.olap.native.tests.js", "ff2190.runtime.tests,ff4000.protocol.ina", null);
		oFF.ModuleManager.registerDirect("ff4910.olap.tests", "com.oFF.OlapTestModule", false, "ff4910.olap.tests/combined/ff4910.olap.tests.js", "ff2190.runtime.tests,ff4210.olap.masterdata.api,ff4220.olap.catalog.api,ff4200.olap.api", null);
		oFF.ModuleManager.registerDirect("ff4911.olap.part2.tests", "com.oFF.OlapTestPart2Module", false, "ff4911.olap.part2.tests/combined/ff4911.olap.part2.tests.js", "ff4910.olap.tests", null);
		oFF.ModuleManager.registerDirect("ff4913.olap.ip.tests", "com.oFF.OlapIpTestModule", false, "ff4913.olap.ip.tests/combined/ff4913.olap.ip.tests.js", "ff4910.olap.tests", null);
		oFF.ModuleManager.registerDirect("ff4914.olap.repo.tests", "com.oFF.OlapRepoTestModule", false, "ff4914.olap.repo.tests/combined/ff4914.olap.repo.tests.js", "ff4910.olap.tests", null);
		oFF.ModuleManager.registerDirect("ff4915.processor.tests", "com.oFF.ProcessorTestModule", false, "ff4915.processor.tests/combined/ff4915.processor.tests.js", "ff4050.processor,ff4910.olap.tests,ff4400.olap.providers", null);
		oFF.ModuleManager.registerDirect("ff4920.olap.impl.tests", "com.oFF.ProvidersTestModule", false, "ff4920.olap.impl.tests/combined/ff4920.olap.impl.tests.js", "ff2690.visualization.tests,ff4390.olap.helpers,ff4900.olap.native.tests,ff4910.olap.tests,ff4911.olap.part2.tests,ff4913.olap.ip.tests,ff4914.olap.repo.tests,ff4915.processor.tests,ff4320.olap.masterdata.impl,ff4330.olap.catalog.impl,ff4340.olap.reference,ff4400.olap.providers,ff4410.olap.ip.providers", null);
		oFF.ModuleManager.registerDirect("ff5500.story", "com.oFF.StoryModule", false, "ff5500.story/combined/ff5500.story.js", "ff2100.runtime,ff4000.protocol.ina", null);
		oFF.ModuleManager.registerDirect("ff5510.story.tests", "com.oFF.StoryTestModule", false, "ff5510.story.tests/combined/ff5510.story.tests.js", "ff2190.runtime.tests,ff5500.story", null);
		oFF.ModuleManager.registerDirect("ff6000.ina.cache", "com.oFF.XicsModule", false, "ff6000.ina.cache/combined/ff6000.ina.cache.js", "ff2100.runtime", null);
		oFF.ModuleManager.registerDirect("ff6010.ina.manipulation", "com.oFF.InaManipulationModule", false, "ff6010.ina.manipulation/combined/ff6010.ina.manipulation.js", "ff6000.ina.cache", null);
		oFF.ModuleManager.registerDirect("ff6090.ina.cache.tests", "com.oFF.InACacheTestsModule", false, "ff6090.ina.cache.tests/combined/ff6090.ina.cache.tests.js", "ff4920.olap.impl.tests,ff6010.ina.manipulation", null);
		oFF.ModuleManager.registerDirect("ff6100.repo", "com.oFF.RepoModule", false, "ff6100.repo/combined/ff6100.repo.js", "ff4000.protocol.ina", null);
		oFF.ModuleManager.registerDirect("ff6190.repo.tests", "com.oFF.RepoTestModule", false, "ff6190.repo.tests/combined/ff6190.repo.tests.js", "ff6100.repo,ff4920.olap.impl.tests", null);
		oFF.ModuleManager.registerDirect("ff6200.epmapp", "com.oFF.EPMModule", false, "ff6200.epmapp/combined/ff6200.epmapp.js", "ff2100.runtime,ff6100.repo", null);
		oFF.ModuleManager.registerDirect("ff6290.epmapp.tests", "com.oFF.EPMTestModule", false, "ff6290.epmapp.tests/combined/ff6290.epmapp.tests.js", "ff6100.repo,ff6200.epmapp,ff4920.olap.impl.tests", null);
		oFF.ModuleManager.registerDirect("ff8000.quasar", "com.oFF.QuasarModule", false, "ff8000.quasar/combined/ff8000.quasar.js", "ff2260.ui.remote,ff4200.olap.api", null);
		oFF.ModuleManager.registerDirect("ff8005.olap.ui.api", "com.oFF.OlapUiApiModule", false, "ff8005.olap.ui.api/combined/ff8005.olap.ui.api.js", "ff2200.ui,ff2240.ui.program,ff3600.horizon.ui.api,ff4200.olap.api", null);
		oFF.ModuleManager.registerDirect("ff8010.olap.ui", "com.oFF.OlapUiModule", false, "ff8010.olap.ui/combined/ff8010.olap.ui.js", "ff2710.export.native,ff3100.system.ui,ff3600.horizon.ui.api,ff4220.olap.catalog.api,ff4305.olap.model,ff8005.olap.ui.api", null);
		oFF.ModuleManager.registerDirect("ff8050.application.ui", "com.oFF.ApplicationUiModule", false, "ff8050.application.ui/combined/ff8050.application.ui.js", "ff2650.visualization.impl,ff3100.system.ui,ff8000.quasar,ff3350.cell.engine.ui,ff3410.contextmenu.engine.impl,ff4200.olap.api,ff4500.olap.engine,ff5500.story,ff8010.olap.ui", null);
		oFF.ModuleManager.registerDirect("ff8090.poseidon", "com.oFF.PoseidonModule", false, "ff8090.poseidon/combined/ff8090.poseidon.js", "ff3100.system.ui,ff8050.application.ui", null);
		oFF.ModuleManager.registerDirect("ff8095.utils.ui", "com.oFF.UtilsUiModule", false, "ff8095.utils.ui/combined/ff8095.utils.ui.js", "ff3100.system.ui,ff8050.application.ui,ff8090.poseidon", null);
		oFF.ModuleManager.registerDirect("ff8100.studio", "com.oFF.StudioModule", false, "ff8100.studio/combined/ff8100.studio.js", "ff2240.ui.program", null);
		oFF.ModuleManager.registerDirect("ff8110.studio.ui", "com.oFF.StudioUiModule", false, "ff8110.studio.ui/combined/ff8110.studio.ui.js", "ff2040.shell,ff8100.studio,ff2210.ui.native,ff3500.sql,ff3600.horizon.ui.api,ff3610.horizon.ui,ff3620.horizon.ui.plugins,ff4220.olap.catalog.api,ff4410.olap.ip.providers,ff4330.olap.catalog.impl,ff4340.olap.reference,ff8050.application.ui,ff8090.poseidon,ff8095.utils.ui,", null);
		oFF.ModuleManager.registerDirect("ff8111.val.ui", "com.oFF.ValUiModule", false, "ff8111.val.ui/combined/ff8111.val.ui.js", "ff2210.ui.native,ff3500.sql,ff3600.horizon.ui.api,ff3610.horizon.ui,ff3620.horizon.ui.plugins,ff8050.application.ui,ff8090.poseidon,ff4220.olap.catalog.api,ff4410.olap.ip.providers,ff4330.olap.catalog.impl,ff4340.olap.reference", null);
		oFF.ModuleManager.registerDirect("ff8120.dragonfly", "com.oFF.DragonflyModule", false, "ff8120.dragonfly/combined/ff8120.dragonfly.js", "ff4330.olap.catalog.impl,ff4340.olap.reference,ff4410.olap.ip.providers,ff8050.application.ui", null);
		oFF.ModuleManager.registerDirect("ff8190.studio.tests", "com.oFF.StudioTestsModule", false, "ff8190.studio.tests/combined/ff8190.studio.tests.js", "ff2190.runtime.tests,ff2290.ui.tests,ff3190.system.ui.tests,ff4220.olap.catalog.api,ff4920.olap.impl.tests,ff5510.story.tests,ff8100.studio,ff8050.application.ui,ff8090.poseidon,ff8095.utils.ui", null);
		oFF.ModuleManager.registerDirect("ff8300.zen.buddha.utils.native", null, false, "ff8300.zen.buddha.utils.native/combined/ff8300.zen.buddha.utils.native.js", "ff4330.olap.catalog.impl,ff4340.olap.reference,ff4410.olap.ip.providers", null);
		oFF.ModuleManager.registerDirect("ff8310.zen.buddha", null, false, "ff8310.zen.buddha/combined/ff8310.zen.buddha.js", "ff8300.zen.buddha.utils.native", null);
		oFF.ModuleManager.registerDirect("ff8320.zen.landscape.utils", null, false, "ff8320.zen.landscape.utils/combined/ff8320.zen.landscape.utils.js", "ff8310.zen.buddha", null);
		oFF.ModuleManager.registerDirect("ff8900.examples", "com.oFF.ExamplesModule", false, "ff8900.examples/combined/ff8900.examples.js", "ff2650.visualization.impl,ff4050.processor,ff6000.ina.cache,ff4400.olap.providers,ff4320.olap.masterdata.impl,ff4330.olap.catalog.impl,ff4340.olap.reference,ff4390.olap.helpers,ff4410.olap.ip.providers,ff8010.olap.ui", null);
		oFF.ModuleManager.registerDirect("ff8990.application.tests", "com.oFF.ApplicationTestModule", false, "ff8990.application.tests/combined/ff8990.application.tests.js", "ff2190.runtime.tests,ff2195.webdispatcher.tests,ff2290.ui.tests,ff2715.export.tests,ff3190.system.ui.tests,ff3390.cell.engine.tests,ff3490.contextmenu.engine.tests,ff4920.olap.impl.tests,ff5510.story.tests,ff6090.ina.cache.tests,ff8190.studio.tests", null);
		oFF.ModuleManager.registerDirect("ff9010.zen.project", null, false, "ff9010.zen.project/combined/ff9010.zen.project.js", "ff2210.ui.native,ff8120.dragonfly,ff8320.zen.landscape.utils", null);
		oFF.ModuleManager.registerDirect("ff9020.ffservice", "com.oFF.FFServiceModule", false, "ff9020.ffservice/combined/ff9020.ffservice.js", "ff2210.ui.native,ff2310.server.native,ff4400.olap.providers,ff4330.olap.catalog.impl,ff4340.olap.reference,ff4390.olap.helpers,ff8110.studio.ui", null);
		oFF.ModuleManager.registerDirect("ff9030.skylights", "com.oFF.SkylightsModule", false, "ff9030.skylights/combined/ff9030.skylights.js", "ff2210.ui.native,ff2260.ui.remote,ff2310.server.native,ff3500.sql,ff4500.olap.engine,ff8110.studio.ui,ff8111.val.ui,ff8990.application.tests", null);
		oFF.ModuleManager.registerDirect("orca_delivery", null, false, "orca_delivery/combined/orca_delivery.js", "ff0080.structures.native,ff0230.io.ext,ff1040.kernel.native,ff2010.binding,ff2040.shell,ff2150.contentlib,ff2210.ui.native,ff2710.export.native,ff3100.system.ui,ff3600.horizon.ui.api,ff3610.horizon.ui,ff3620.horizon.ui.plugins,ff4050.processor,ff4330.olap.catalog.impl,ff4400.olap.providers,ff4410.olap.ip.providers,ff4340.olap.reference,ff6000.ina.cache,ff6100.repo,ff8010.olap.ui,ff8050.application.ui,ff8090.poseidon,ff8100.studio", null);
	}
};

oFF.ConnectionConstants = {

	FAST_PATH:"FastPath",
	SAP_CLIENT:"sap-client",
	SAP_LANGUAGE:"sap-language",
	INA_CAPABILITY_SUPPORTS_BATCH:"SupportsBatch",
	INA_CAPABILITY_SUPPORTS_BATCH_RS_STREAMING:"AsyncBatchRequest",
	INA_BATCH:"Batch",
	INA_BATCH_ID:"BatchId",
	INA_BATCH_ASYNC_RESPONSE_REQUEST:"AsyncResponseRequest",
	INA_BATCH_NEXT_ASYNC_RESPONSE:"GetNextAsyncResponse",
	INA_ANALYTICS:"Analytics",
	INA_LIST_REPORTING:"ListReporting",
	INA_ACTIONS:"Actions",
	INA_TYPE:"Type",
	INA_DATA_SOURCE:"DataSource",
	INA_INSTANCE_ID:"InstanceId",
	INA_METADATA:"Metadata",
	INA_CUBE:"Cube",
	INA_DS_VALIDATION:"DataSourceValidation",
	KEEP_ALIVE_PARAM:"keepAlive",
	INA_FASTPATH_XXL_WS:"FastPathXXLWebService",
	INA_GRIDS:"Grids",
	INA_SOURCES:"Sources"
};

oFF.InAConstantsBios = {

	QY_TEXT:"Text",
	QY_TYPE:"Type",
	VA_TYPE_CLOSE:"Close",
	VA_TYPE_DATA_AREA_CMD:"DataAreaCommand",
	VA_TYPE_PLANNING_FUNCTION:"PlanningFunction",
	VA_TYPE_PLANNING_SEQUENCE:"PlanningSequence",
	VA_TYPE_STRING:"String",
	QY_NUMBER:"Number",
	QY_MESSAGE_CLASS:"MessageClass",
	QY_MESSAGES:"Messages",
	QY_MESSAGE_TYPE:"MessageType",
	VA_SEVERITY_INFO:0,
	VA_SEVERITY_WARNING:1,
	VA_SEVERITY_ERROR:2,
	VA_SEVERITY_SEMANTICAL_ERROR:3,
	QY_MEASUREMENTS:"Measurements",
	QY_OLAP_MESSAGE_CLASS:"OlapMessageClass",
	QY_GRIDS:"Grids",
	QY_PLANNING:"Planning",
	QY_PERFORMANCE_DATA:"PerformanceData",
	QY_SESSION_ID:"SessionId",
	QY_STEP_ID:"StepId",
	QY_TIMESTAMP:"Timestamp",
	QY_METADATA:"Metadata",
	QY_RUNTIME:"Runtime",
	QY_DATA_REQUEST:"DataRequest",
	QY_CALLS:"Calls",
	QY_DESCRIPTION:"Description",
	QY_TIME:"Time",
	QY_CLIENT_INFO:"ClientInfo",
	QY_CLIENT_COMPONENT:"Component",
	QY_CLIENT_IDENTIFIER:"Identifier",
	QY_CLIENT_VERSION:"Version",
	QY_CLIENT_CONTEXT:"Context",
	QY_STORY_ID:"StoryId",
	QY_STORY_NAME:"StoryName",
	QY_LANGUAGE_LOCALE:"LanguageLocale",
	QY_WIDGET_ID:"WidgetId",
	PR_CAPABILITIES:"Capabilities",
	PR_CAPABILITIESDEV:"CapabilitiesDev",
	PR_SERVICES:"Services",
	PR_SERVICE:"Service",
	PR_SERVER_INFO:"ServerInfo",
	PR_SETTINGS:"Settings",
	PR_SI_REENTRANCE_TICKET:"ReentranceTicket",
	PR_SI_SERVER_TYPE:"ServerType",
	PR_SI_SYSTEM_ID:"SystemId",
	PR_SI_CLIENT:"Client",
	PR_SI_TENANT:"TenantId",
	PR_SI_PUBLIC_URL:"PublicUrl",
	PR_SI_USER_NAME:"userName",
	PR_SI_VERSION:"Version",
	PR_SI_BUILD_TIME:"BuildTime",
	PR_SI_LANGUAGE:"UserLanguageCode",
	PR_VALUE:"Value",
	PR_CAPABILITY:"Capability"
};

oFF.InAHelper = {

	importMessages:function(inaElement, messageCollector)
	{
			if (oFF.isNull(inaElement) || !inaElement.isStructure())
		{
			return false;
		}
		var inaStructure = inaElement;
		var inaMessages = inaStructure.getListByKey(oFF.InAConstantsBios.QY_MESSAGES);
		if (oFF.isNull(inaMessages))
		{
			var inaGrids = inaStructure.getListByKey(oFF.InAConstantsBios.QY_GRIDS);
			if (oFF.notNull(inaGrids))
			{
				var inaGrid = inaGrids.getStructureAt(0);
				if (oFF.notNull(inaGrid))
				{
					inaMessages = inaGrid.getListByKey(oFF.InAConstantsBios.QY_MESSAGES);
				}
			}
			if (oFF.isNull(inaMessages))
			{
				var inaPlanningElement = inaStructure.getByKey(oFF.InAConstantsBios.QY_PLANNING);
				if (oFF.notNull(inaPlanningElement))
				{
					if (inaPlanningElement.isList() && inaPlanningElement.size() > 0)
					{
						var inaPlanningList = inaPlanningElement;
						for (var i = 0; i < inaPlanningList.size(); i++)
						{
							var currentInaPlanning = inaPlanningList.getStructureAt(i);
							if (oFF.notNull(currentInaPlanning))
							{
								var currentInaPlanningMessages = currentInaPlanning.getListByKey(oFF.InAConstantsBios.QY_MESSAGES);
								if (oFF.notNull(currentInaPlanningMessages))
								{
									if (oFF.isNull(inaMessages))
									{
										inaMessages = currentInaPlanningMessages;
									}
									else
									{
										inaMessages.addAll(currentInaPlanningMessages);
									}
								}
							}
						}
					}
					else if (inaPlanningElement.isStructure())
					{
						var currentInaPlanningMessages2 = inaPlanningElement.getListByKey(oFF.InAConstantsBios.QY_MESSAGES);
						if (oFF.notNull(currentInaPlanningMessages2))
						{
							inaMessages = currentInaPlanningMessages2;
						}
					}
				}
			}
		}
		var hasErrors = oFF.InAHelper.importInaMessagesInternal(inaMessages, messageCollector);
		var inaPerformance = inaStructure.getStructureByKey(oFF.InAConstantsBios.QY_PERFORMANCE_DATA);
		oFF.InAHelper.importProfiling(inaPerformance, messageCollector);
		return hasErrors;
	},
	importInaMessagesInternal:function(inaMessages, messageCollector)
	{
			if (oFF.PrUtils.isListEmpty(inaMessages))
		{
			return false;
		}
		var hasErrors = false;
		var messageSize = inaMessages.size();
		var text = oFF.XStringBuffer.create();
		for (var i = 0; i < messageSize; i++)
		{
			var inaMessage = inaMessages.getStructureAt(i);
			text.append(inaMessage.getStringByKey(oFF.InAConstantsBios.QY_TEXT));
			var type = inaMessage.getIntegerByKeyExt(oFF.InAConstantsBios.QY_TYPE, 0);
			var code = inaMessage.getIntegerByKeyExt(oFF.InAConstantsBios.QY_NUMBER, 0);
			var message = null;
			switch (type)
			{
				case oFF.InAConstantsBios.VA_SEVERITY_INFO:
					message = messageCollector.addInfoExt(oFF.OriginLayer.SERVER, code, text.toString());
					break;

				case oFF.InAConstantsBios.VA_SEVERITY_WARNING:
					message = messageCollector.addWarningExt(oFF.OriginLayer.SERVER, code, text.toString());
					break;

				case oFF.InAConstantsBios.VA_SEVERITY_ERROR:
					message = messageCollector.addErrorExt(oFF.OriginLayer.SERVER, code, text.toString(), null);
					hasErrors = true;
					break;

				case oFF.InAConstantsBios.VA_SEVERITY_SEMANTICAL_ERROR:
					message = messageCollector.addSemanticalError(oFF.OriginLayer.SERVER, code, text.toString());
					break;

				default:
					break;
			}
			if (oFF.notNull(message))
			{
				message.setMessageClass(inaMessage.getStringByKey(oFF.InAConstantsBios.QY_MESSAGE_CLASS));
				message.setOlapMessageClass(inaMessage.getIntegerByKeyExt(oFF.InAConstantsBios.QY_OLAP_MESSAGE_CLASS, -1));
				var context = oFF.PrUtils.getStructureProperty(inaMessage, "Context");
				if (oFF.notNull(context))
				{
					message.setExtendendInfo(context);
					message.setExtendendInfoType(oFF.ExtendedInfoType.CONTEXT_STRUCTURE);
				}
			}
			text.clear();
		}
		oFF.XObjectExt.release(text);
		return hasErrors;
	},
	importProfiling:function(inaPerformance, messageCollector)
	{
			if (oFF.notNull(inaPerformance))
		{
			var buffer = oFF.XStringBuffer.create();
			buffer.append("Engine (SessionId=").append(inaPerformance.getStringByKey(oFF.InAConstantsBios.QY_SESSION_ID));
			var stepId = inaPerformance.getStringByKey(oFF.InAConstantsBios.QY_STEP_ID);
			if (oFF.XStringUtils.isNotNullAndNotEmpty(stepId))
			{
				buffer.append(", StepId=").append(stepId);
			}
			buffer.append(", Timestamp=").append(inaPerformance.getStringByKey(oFF.InAConstantsBios.QY_TIMESTAMP)).append(")");
			var engineRuntimeInSeconds = inaPerformance.getDoubleByKeyExt(oFF.InAConstantsBios.QY_RUNTIME, 0.0);
			var engineRuntimeInMs = engineRuntimeInSeconds * 1000.0;
			var engineRuntimeInMsLong = oFF.XDouble.convertToLong(engineRuntimeInMs);
			var engineProfileNode = oFF.ProfileNode.createWithDuration(buffer.toString(), engineRuntimeInMsLong);
			buffer.clear();
			var serverMeasurements = inaPerformance.getListByKey(oFF.InAConstantsBios.QY_MEASUREMENTS);
			if (oFF.notNull(serverMeasurements))
			{
				var size = serverMeasurements.size();
				for (var j = 0; j < size; j++)
				{
					var singleMeasure = serverMeasurements.getStructureAt(j);
					var calls = singleMeasure.getIntegerByKeyExt(oFF.InAConstantsBios.QY_CALLS, 1);
					var measureText;
					if (calls > 1)
					{
						buffer.append(singleMeasure.getStringByKey(oFF.InAConstantsBios.QY_DESCRIPTION)).append(" (").appendInt(calls).append("x)");
						measureText = buffer.toString();
						buffer.clear();
					}
					else
					{
						measureText = singleMeasure.getStringByKey(oFF.InAConstantsBios.QY_DESCRIPTION);
					}
					if (singleMeasure.containsKey(oFF.InAConstantsBios.QY_TIME))
					{
						engineRuntimeInSeconds = singleMeasure.getDoubleByKey(oFF.InAConstantsBios.QY_TIME);
						engineRuntimeInMs = engineRuntimeInSeconds * 1000.0;
						engineRuntimeInMsLong = oFF.XDouble.convertToLong(engineRuntimeInMs);
						var singleMeasureNode = oFF.ProfileNode.createWithDuration(measureText, engineRuntimeInMsLong);
						if (oFF.notNull(engineProfileNode))
						{
							engineProfileNode.addProfileNode(singleMeasureNode);
						}
					}
				}
			}
			oFF.XObjectExt.release(buffer);
			messageCollector.detailProfileNode("### SERVER ###", engineProfileNode, "Network");
		}
	}
};

oFF.ServerMetadata = function() {};
oFF.ServerMetadata.prototype = new oFF.XObject();
oFF.ServerMetadata.prototype._ff_c = "ServerMetadata";

oFF.ServerMetadata.create = function(session, rootElement, systemDescription)
{
	var object = new oFF.ServerMetadata();
	object.setupExt(session, rootElement, systemDescription);
	return object;
};
oFF.ServerMetadata.createCapabilitiesContainer = function(session, currentService, selectName)
{
	var serviceName = currentService.getStringByKey(oFF.InAConstantsBios.PR_SERVICE);
	var container = oFF.CapabilityContainer.create(serviceName);
	var capabilitiesList = currentService.getListByKey(selectName);
	if (oFF.notNull(capabilitiesList))
	{
		var capabilitiesSize = capabilitiesList.size();
		for (var idxCapability = 0; idxCapability < capabilitiesSize; idxCapability++)
		{
			var inaCapability = capabilitiesList.getStructureAt(idxCapability);
			var capabilityName = inaCapability.getStringByKey(oFF.InAConstantsBios.PR_CAPABILITY);
			if (oFF.isNull(capabilityName))
			{
				session.getLogger().log2("WARNING: found capability with empty (NULL) name. This capability will be ignored. The current service is: ", serviceName);
				continue;
			}
			var value = inaCapability.getStringByKey(oFF.InAConstantsBios.PR_VALUE);
			container.addCapabilityInfo(oFF.Capability.createCapabilityInfo(capabilityName, value));
		}
	}
	return container;
};
oFF.ServerMetadata.prototype.m_systemDescription = null;
oFF.ServerMetadata.prototype.m_rootStructure = null;
oFF.ServerMetadata.prototype.m_serverServiceMetadata = null;
oFF.ServerMetadata.prototype.m_serverBetaServiceMetadata = null;
oFF.ServerMetadata.prototype.m_properties = null;
oFF.ServerMetadata.prototype.releaseObject = function()
{
	this.m_properties = oFF.XObjectExt.release(this.m_properties);
	this.m_serverServiceMetadata = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_serverServiceMetadata);
	this.m_serverBetaServiceMetadata = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_serverBetaServiceMetadata);
	this.m_rootStructure = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.ServerMetadata.prototype.setupExt = function(session, rootElement, systemDescription)
{
	this.m_properties = oFF.XProperties.create();
	this.m_serverServiceMetadata = oFF.XHashMapByString.create();
	this.m_serverBetaServiceMetadata = oFF.XHashMapByString.create();
	this.m_systemDescription = systemDescription;
	this.m_rootStructure = rootElement;
	if (oFF.isNull(this.m_rootStructure))
	{
		this.m_serverBetaServiceMetadata.put(oFF.ServerService.ANALYTIC, oFF.CapabilityContainer.create(null));
		this.m_serverServiceMetadata.put(oFF.ServerService.ANALYTIC, oFF.CapabilityContainer.create(null));
	}
	else
	{
		if (this.m_rootStructure.containsKey(oFF.InAConstantsBios.PR_SERVICES))
		{
			var services = this.m_rootStructure.getListByKey(oFF.InAConstantsBios.PR_SERVICES);
			var size = services.size();
			for (var i = 0; i < size; i++)
			{
				var service = services.getStructureAt(i);
				var capabilitiesContainer = oFF.ServerMetadata.createCapabilitiesContainer(session, service, oFF.InAConstantsBios.PR_CAPABILITIES);
				this.m_serverServiceMetadata.putIfNotNull(capabilitiesContainer.getName(), capabilitiesContainer);
				var capabilitiesContainerDev = oFF.ServerMetadata.createCapabilitiesContainer(session, service, oFF.InAConstantsBios.PR_CAPABILITIESDEV);
				this.m_serverBetaServiceMetadata.putIfNotNull(capabilitiesContainerDev.getName(), capabilitiesContainerDev);
			}
		}
		this.readProperties(oFF.InAConstantsBios.PR_SETTINGS);
		this.readProperties(oFF.InAConstantsBios.PR_SERVER_INFO);
	}
};
oFF.ServerMetadata.prototype.addLogonInfo = function(data)
{
	var sessionStructure = data.getStructureByKey("session");
	if (oFF.notNull(sessionStructure))
	{
		var tenant = sessionStructure.getListByKey("tenant");
		if (oFF.XCollectionUtils.hasElements(tenant))
		{
			this.m_properties.put(oFF.InAConstantsBios.PR_SI_TENANT, tenant.getStructureAt(0).getStringByKey("id"));
		}
	}
	var userStructure = data.getStructureByKey("user");
	if (oFF.notNull(userStructure))
	{
		var userName = userStructure.getStringByKey("userName");
		if (oFF.isNull(userName))
		{
			var userMetadataStructure = userStructure.getStructureByKey("metadata");
			userName = userMetadataStructure.getStringByKey("userName");
		}
		this.m_properties.put(oFF.InAConstantsBios.PR_SI_USER_NAME, userName);
	}
	var config = data.getListByKey("config");
	if (oFF.notNull(config))
	{
		var configIter = config.getIterator();
		while (configIter.hasNext())
		{
			var configElement = configIter.next().asStructure();
			if (oFF.XString.isEqual("PUBLIC_FQDN", configElement.getStringByKey("name")))
			{
				var value = configElement.getStringByKey("value");
				if (!oFF.XStringUtils.isNullOrEmpty(value))
				{
					this.m_properties.put(oFF.InAConstantsBios.PR_SI_PUBLIC_URL, oFF.XStringUtils.concatenate2("https://", value));
				}
			}
		}
	}
};
oFF.ServerMetadata.prototype.readProperties = function(name)
{
	if (this.m_rootStructure.containsKey(name) && this.m_rootStructure.getElementTypeByKey(name) === oFF.PrElementType.STRUCTURE)
	{
		var serverInfo = this.m_rootStructure.getStructureByKey(name);
		var structureElementNames = serverInfo.getKeysAsReadOnlyListOfString();
		for (var j = 0; j < structureElementNames.size(); j++)
		{
			var key = structureElementNames.get(j);
			if (serverInfo.getElementTypeByKey(key) !== oFF.PrElementType.STRING)
			{
				continue;
			}
			var value = serverInfo.getStringByKey(key);
			this.m_properties.put(key, value);
		}
	}
};
oFF.ServerMetadata.prototype.getMetadataForService = function(name)
{
	return this.m_serverServiceMetadata.getByKey(name);
};
oFF.ServerMetadata.prototype.getBetaMetadataForService = function(name)
{
	return this.m_serverBetaServiceMetadata.getByKey(name);
};
oFF.ServerMetadata.prototype.getProperties = function()
{
	return this.m_properties;
};
oFF.ServerMetadata.prototype.getType = function()
{
	return this.m_properties.getByKey(oFF.InAConstantsBios.PR_SI_SERVER_TYPE);
};
oFF.ServerMetadata.prototype.getVersion = function()
{
	return this.m_properties.getByKey(oFF.InAConstantsBios.PR_SI_VERSION);
};
oFF.ServerMetadata.prototype.getId = function()
{
	return this.m_properties.getByKey(oFF.InAConstantsBios.PR_SI_SYSTEM_ID);
};
oFF.ServerMetadata.prototype.getBuildTime = function()
{
	return this.m_properties.getByKey(oFF.InAConstantsBios.PR_SI_BUILD_TIME);
};
oFF.ServerMetadata.prototype.getClient = function()
{
	return this.m_properties.getByKey(oFF.InAConstantsBios.PR_SI_CLIENT);
};
oFF.ServerMetadata.prototype.getTenantId = function()
{
	return this.m_properties.getByKey(oFF.InAConstantsBios.PR_SI_TENANT);
};
oFF.ServerMetadata.prototype.getOrcaUserName = function()
{
	return this.m_properties.getByKey(oFF.InAConstantsBios.PR_SI_USER_NAME);
};
oFF.ServerMetadata.prototype.getOrcaPublicUrl = function()
{
	return this.m_properties.getByKey(oFF.InAConstantsBios.PR_SI_PUBLIC_URL);
};
oFF.ServerMetadata.prototype.getUserLanguage = function()
{
	return this.m_properties.getByKey(oFF.InAConstantsBios.PR_SI_LANGUAGE);
};
oFF.ServerMetadata.prototype.getReentranceTicket = function()
{
	return this.m_properties.getByKey(oFF.InAConstantsBios.PR_SI_REENTRANCE_TICKET);
};
oFF.ServerMetadata.prototype.getServices = function()
{
	return this.m_serverServiceMetadata.getKeysAsReadOnlyListOfString();
};
oFF.ServerMetadata.prototype.supportsAnalyticCapability = function(capabilityName)
{
	return this.supportsCapability(oFF.ServerService.ANALYTIC, capabilityName) || this.supportsCapability(oFF.ServerService.ANALYTIC, capabilityName);
};
oFF.ServerMetadata.prototype.supportsAnalyticCapabilityAsProd = function(capabilityName)
{
	return this.supportsCapabilityAsProd(oFF.ServerService.ANALYTIC, capabilityName);
};
oFF.ServerMetadata.prototype.supportsAnalyticCapabilityAsDev = function(capabilityName)
{
	return this.supportsCapabilityAsDev(oFF.ServerService.ANALYTIC, capabilityName);
};
oFF.ServerMetadata.prototype.supportsCapability = function(service, capabilityName)
{
	return this.supportsCapabilityAsProd(service, capabilityName) || this.supportsCapabilityAsDev(service, capabilityName);
};
oFF.ServerMetadata.prototype.supportsCapabilityAsProd = function(service, capabilityName)
{
	var analyticMain = this.getMetadataForService(service);
	return oFF.isNull(analyticMain) ? false : analyticMain.containsKey(capabilityName);
};
oFF.ServerMetadata.prototype.supportsCapabilityAsDev = function(service, capabilityName)
{
	var analyticDev = this.getBetaMetadataForService(service);
	return oFF.isNull(analyticDev) ? false : analyticDev.containsKey(capabilityName);
};
oFF.ServerMetadata.prototype.getSystemDescription = function()
{
	return this.m_systemDescription;
};
oFF.ServerMetadata.prototype.toString = function()
{
	return this.m_rootStructure.toString();
};

oFF.BatchRequestDecoratorFactory = function() {};
oFF.BatchRequestDecoratorFactory.prototype = new oFF.XObject();
oFF.BatchRequestDecoratorFactory.prototype._ff_c = "BatchRequestDecoratorFactory";

oFF.BatchRequestDecoratorFactory.BATCH_REQUEST_DECORATOR_PROVIDER = "BATCH_REQUEST_DECORATOR_PROVIDER.IMPLEMENTATION";
oFF.BatchRequestDecoratorFactory.getBatchRequestDecorator = function(session, requestStructure)
{
	var sessionSingletons = session.getSessionSingletons();
	var factoryObject = sessionSingletons.getByKey(oFF.BatchRequestDecoratorFactory.BATCH_REQUEST_DECORATOR_PROVIDER);
	var factory;
	if (oFF.isNull(factoryObject))
	{
		factory = new oFF.BatchRequestDecoratorFactory();
		factory.initProviders();
		sessionSingletons.put(oFF.BatchRequestDecoratorFactory.BATCH_REQUEST_DECORATOR_PROVIDER, factory);
	}
	else
	{
		factory = factoryObject;
	}
	return factory.getBatchRequestDecoratorInternal(requestStructure);
};
oFF.BatchRequestDecoratorFactory.prototype.m_providers = null;
oFF.BatchRequestDecoratorFactory.prototype.getBatchRequestDecoratorInternal = function(requestStructure)
{
	var result = null;
	for (var i = 0; i < this.m_providers.size(); i++)
	{
		var provider = this.m_providers.get(i);
		var decorator = provider.getBatchRequestDecorator(requestStructure);
		if (oFF.isNull(decorator))
		{
			continue;
		}
		if (oFF.notNull(result))
		{
			throw oFF.XException.createIllegalStateException("duplicate decorator");
		}
		result = decorator;
	}
	return result;
};
oFF.BatchRequestDecoratorFactory.prototype.initProviders = function()
{
	if (oFF.notNull(this.m_providers))
	{
		return;
	}
	this.m_providers = oFF.XList.create();
	var registrationService = oFF.RegistrationService.getInstance();
	if (oFF.notNull(registrationService))
	{
		var clazzes = registrationService.getReferences(oFF.BatchRequestDecoratorFactory.BATCH_REQUEST_DECORATOR_PROVIDER);
		if (oFF.notNull(clazzes))
		{
			for (var i = 0; i < clazzes.size(); i++)
			{
				var clazz = clazzes.get(i);
				var provider = clazz.newInstance(this);
				this.m_providers.add(provider);
			}
		}
	}
};

oFF.NestedBatchRequestDecorator = function() {};
oFF.NestedBatchRequestDecorator.prototype = new oFF.XObject();
oFF.NestedBatchRequestDecorator.prototype._ff_c = "NestedBatchRequestDecorator";

oFF.NestedBatchRequestDecorator.getBatchRequestDecorator = function(requestStructure)
{
	if (oFF.isNull(requestStructure))
	{
		return null;
	}
	var batchList = oFF.PrUtils.getListProperty(requestStructure, oFF.ConnectionConstants.INA_BATCH);
	if (oFF.isNull(batchList))
	{
		return null;
	}
	var requestItems = oFF.XList.create();
	for (var i = 0; i < batchList.size(); i++)
	{
		var requestStructureElement = oFF.PrUtils.getStructureElement(batchList, i);
		oFF.XObjectExt.assertNotNullExt(requestStructureElement, "illegal nested batch syntax");
		requestItems.add(requestStructureElement);
	}
	var decorator = new oFF.NestedBatchRequestDecorator();
	decorator.m_requestItems = requestItems;
	return decorator;
};
oFF.NestedBatchRequestDecorator.prototype.m_requestItems = null;
oFF.NestedBatchRequestDecorator.prototype.getItemsSize = function()
{
	return this.m_requestItems.size();
};
oFF.NestedBatchRequestDecorator.prototype.getRequestItems = function()
{
	return this.m_requestItems;
};
oFF.NestedBatchRequestDecorator.prototype.buildResponse = function(responseItems)
{
	if (responseItems.size() !== this.getItemsSize())
	{
		throw oFF.XException.createIllegalStateException("illegal planning batch response structure");
	}
	var result = oFF.PrFactory.createStructure();
	var batchList = result.putNewList(oFF.ConnectionConstants.INA_BATCH);
	for (var i = 0; i < responseItems.size(); i++)
	{
		var responseStructure = responseItems.get(i);
		oFF.XObjectExt.assertNotNullExt(responseStructure, "illegal nested batch response structure");
		batchList.add(responseStructure);
	}
	return result;
};

oFF.NestedBatchRequestDecoratorProvider = function() {};
oFF.NestedBatchRequestDecoratorProvider.prototype = new oFF.XObject();
oFF.NestedBatchRequestDecoratorProvider.prototype._ff_c = "NestedBatchRequestDecoratorProvider";

oFF.NestedBatchRequestDecoratorProvider.CLAZZ = null;
oFF.NestedBatchRequestDecoratorProvider.staticSetup = function()
{
	oFF.NestedBatchRequestDecoratorProvider.CLAZZ = oFF.XClass.create(oFF.NestedBatchRequestDecoratorProvider);
};
oFF.NestedBatchRequestDecoratorProvider.prototype.getBatchRequestDecorator = function(requestStructure)
{
	return oFF.NestedBatchRequestDecorator.getBatchRequestDecorator(requestStructure);
};

oFF.ProgramContainerFactory = function() {};
oFF.ProgramContainerFactory.prototype = new oFF.XObject();
oFF.ProgramContainerFactory.prototype._ff_c = "ProgramContainerFactory";

oFF.ProgramContainerFactory.s_factory = null;
oFF.ProgramContainerFactory.staticSetup = function()
{
	oFF.ProgramContainerFactory.s_factory = oFF.XHashMapByString.create();
};
oFF.ProgramContainerFactory.create = function(outputContainerType)
{
	var key = outputContainerType.getName();
	var container = null;
	var factory = oFF.ProgramContainerFactory.s_factory.getByKey(key);
	if (oFF.notNull(factory))
	{
		container = factory.newProgramContainer(outputContainerType);
	}
	return container;
};
oFF.ProgramContainerFactory.registerFactory = function(programContainerType, driverFactory)
{
	oFF.ProgramContainerFactory.s_factory.put(programContainerType.getName(), driverFactory);
};

oFF.ProgramManifestConstants = {

	NAME_KEY:"Name",
	REF_KEY:"Ref",
	CONTAINER_KEY:"Container",
	TYPE_KEY:"Type",
	CLASS_KEY:"Class",
	SUB_SYSTEMS_KEY:"SubSystems",
	MODULES_KEY:"Modules",
	PROFILES_KEY:"Profiles",
	DISPLAY_NAME_KEY:"DisplayName",
	DESCRIPTION_KEY:"Description",
	AUTHOR_KEY:"Author",
	ICON_KEY:"Icon",
	CATEGORY_KEY:"Category",
	APP_STORE_KEY:"AppStore",
	INITIALLY_ON_LAUNCHPAD_KEY:"InitiallyOnLaunchpad",
	INITIAL_CONTAINER_FRAME_KEY:"InitialContainerFrame",
	INITIAL_CONTAINER_FRAME_WIDTH_KEY:"Width",
	INITIAL_CONTAINER_FRAME_HEIGHT_KEY:"Height",
	INITIAL_CONTAINER_FRAME_X_KEY:"X",
	INITIAL_CONTAINER_FRAME_Y_KEY:"Y",
	INITIAL_CONTAINER_FRAME_MAXIMIZED_KEY:"Maximized",
	INITIAL_TITLE_KEY:"InitialTitle",
	ARGUMENTS_KEY:"Arguments",
	START_ARGS_STRUCTURE_KEY:"StartArgsStructure"
};

oFF.ProgramMetadata = function() {};
oFF.ProgramMetadata.prototype = new oFF.XObject();
oFF.ProgramMetadata.prototype._ff_c = "ProgramMetadata";

oFF.ProgramMetadata.create = function()
{
	var newPrg = new oFF.ProgramMetadata();
	newPrg.setup();
	newPrg.m_argMetadata = oFF.XListOfNameObject.create();
	return newPrg;
};
oFF.ProgramMetadata.prototype.m_argMetadata = null;
oFF.ProgramMetadata.prototype.getArgDefinitions = function()
{
	return this.m_argMetadata;
};
oFF.ProgramMetadata.prototype.getArgDefinitionsList = function()
{
	return this.m_argMetadata;
};
oFF.ProgramMetadata.prototype.addOption = function(name, text, values, valueType)
{
	var theValues = values;
	if (oFF.XStringUtils.isNullOrEmpty(values) && valueType === oFF.XValueType.BOOLEAN)
	{
		theValues = "true|false";
	}
	var newObj = oFF.ProgramArgDef.createOption(name, text, theValues, valueType, false);
	this.m_argMetadata.add(newObj);
	return newObj;
};
oFF.ProgramMetadata.prototype.addMandatoryOption = function(name, text, values, valueType)
{
	var theValues = values;
	if (oFF.XStringUtils.isNullOrEmpty(values) && valueType === oFF.XValueType.BOOLEAN)
	{
		theValues = "true|false";
	}
	var newObj = oFF.ProgramArgDef.createOption(name, text, theValues, valueType, true);
	this.m_argMetadata.add(newObj);
	return newObj;
};
oFF.ProgramMetadata.prototype.addParameter = function(name, text)
{
	var newObj = oFF.ProgramArgDef.createStringParameter(name, text);
	this.m_argMetadata.add(newObj);
	return newObj;
};
oFF.ProgramMetadata.prototype.addParameterList = function(name, text)
{
	var newObj = oFF.ProgramArgDef.createStringArrayParameter(name, text);
	this.m_argMetadata.add(newObj);
	return newObj;
};

oFF.ProgramRegistration = {

	s_manifests:null,
	SUBSYS_PREFIX:"@SubSys.",
	staticSetup:function()
	{
			oFF.ProgramRegistration.s_manifests = oFF.XLinkedHashMapByString.create();
	},
	setProgramFactory:function(programFactory)
	{
			if (oFF.notNull(programFactory))
		{
			if (programFactory.getName() === null)
			{
				throw oFF.XException.createIllegalArgumentException("Missing program name!");
			}
			var manifest = oFF.ProgramRegistration.s_manifests.getByKey(programFactory.getName());
			if (oFF.isNull(manifest))
			{
				oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createManifest(programFactory.getName(), programFactory));
			}
			else
			{
				manifest.setFactory(programFactory);
			}
		}
	},
	setProgramManifest:function(programManifest)
	{
			var name = programManifest.getName();
		oFF.ProgramRegistration.s_manifests.put(name, programManifest);
	},
	getProgramFactory:function(name)
	{
			var manifest = oFF.ProgramRegistration.s_manifests.getByKey(name);
		if (oFF.notNull(manifest))
		{
			return manifest.getFactory();
		}
		else
		{
			return null;
		}
	},
	getProgramManifest:function(name)
	{
			var manifest = oFF.ProgramRegistration.s_manifests.getByKey(name);
		return manifest;
	},
	getAllExecutableEntries:function(process)
	{
			var map = oFF.XHashMapByString.create();
		var iterator = oFF.ProgramRegistration.s_manifests.getIterator();
		var kernel = process.getKernel();
		while (iterator.hasNext())
		{
			var manifest = iterator.next();
			if (kernel.isExecutable(manifest))
			{
				map.put(manifest.getName(), manifest);
			}
		}
		return map;
	},
	getAllEntries:function()
	{
			var map = oFF.XHashMapByString.create();
		var iterator = oFF.ProgramRegistration.s_manifests.getIterator();
		while (iterator.hasNext())
		{
			var manifest = iterator.next();
			map.put(manifest.getName(), manifest);
		}
		return map;
	},
	getOrderedAllEntries:function()
	{
			return oFF.ProgramRegistration.s_manifests.getValuesAsReadOnlyList();
	},
	registerProgramByManifest:function(programManifest)
	{
			var registerManifestPromise = oFF.XPromise.create( function(resole, reject){
			if (oFF.notNull(programManifest))
			{
				if (oFF.ProgramRegistration.getProgramManifest(programManifest.getProgramName()) === null)
				{
					oFF.ProgramRegistration.setProgramManifest(programManifest);
					resole(programManifest);
				}
				else
				{
					reject(oFF.XError.create("A program with the name is already registered!"));
				}
			}
			else
			{
				reject(oFF.XError.create("Failed to register program! Missing manifest!"));
			}
		}.bind(this));
		return registerManifestPromise;
	}
};

oFF.ProgramResources = {

	staticSetup:function()
	{
			oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("testHelloWorld", "{\"Class\":\"com.oFF.test.process.timer.prg.TestHelloWorldPrg\",\"Container\":\"Console\",\"Description\":\"Hello world program\",\"DisplayName\":\"Analyze Business Data\",\"Modules\":[\"ff0290.io.tests\"],\"Name\":\"testHelloWorld\",\"Profiles\":[\"dev\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("@SubSys.BootstrapLandscape", "{\"Author\":\"Marco Pesarese\",\"Category\":\"SubSystem\",\"Class\":\"com.oFF.runtime.net.sys.impl.SubSysLandscapeBootstrapPrg\",\"Container\":\"None\",\"Description\":\"Bootstrap Landscape SubSystem\",\"DisplayName\":\"Bootstrap Landscape SubSystem\",\"Modules\":[\"ff1040.kernel.native\"],\"Name\":\"@SubSys.BootstrapLandscape\",\"Profiles\":[\"*\"],\"Type\":\"SubSystem\"}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("@SubSys.Cache", "{\"Author\":\"Marco Pesarese\",\"Category\":\"SubSystem\",\"Class\":\"com.oFF.kernel.cache.impl.SubSysCachePrg\",\"Container\":\"None\",\"Description\":\"Cache SubSystem\",\"DisplayName\":\"Cache SubSystem\",\"Modules\":[\"ff1040.kernel.native\"],\"Name\":\"@SubSys.Cache\",\"Profiles\":[\"*\"],\"Type\":\"SubSystem\"}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("@SubSys.CredentialsProviderLite", "{\"Author\":\"Vlad Zat\",\"Category\":\"SubSystem\",\"Class\":\"com.oFF.kernel.credentials.impl.SubSysLiteCredentialsProviderPrg\",\"Description\":\"Lite Credentials Provider SubSystem\",\"Device\":\"None\",\"DisplayName\":\"Lite Credentials Provider SubSystem\",\"Modules\":[\"ff1030.kernel.impl\"],\"Name\":\"@SubSys.CredentialsProviderLite\",\"Profiles\":[\"*\"],\"Type\":\"SubSystem\"}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("@SubSys.SharedServers", "{\"Author\":\"Marco Pesarese\",\"Category\":\"SubSystem\",\"Class\":\"com.oFF.kernel.net.connection.impl.SubSysSharedServersPrg\",\"Container\":\"None\",\"Description\":\"Shared Servers SubSystem\",\"DisplayName\":\"Shared Servers SubSystem\",\"Modules\":[\"ff1030.kernel.impl\"],\"Name\":\"@SubSys.SharedServers\",\"Profiles\":[\"*\"],\"Type\":\"SubSystem\"}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("@SubSys.SystemLandscape", "{\"Author\":\"Marco Pesarese\",\"Category\":\"SubSystem\",\"Class\":\"com.oFF.runtime.net.sys.impl.SubSysSystemLandscapePrg\",\"Container\":\"None\",\"Description\":\"System Landscape SubSystem\",\"DisplayName\":\"System Landscape SubSystem\",\"Modules\":[\"ff1040.kernel.native\"],\"Name\":\"@SubSys.SystemLandscape\",\"Profiles\":[\"*\"],\"Type\":\"SubSystem\"}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("@SubSys.UserProfile", "{\"Author\":\"Marco Pesarese\",\"Category\":\"SubSystem\",\"Class\":\"com.oFF.runtime.usermanager.impl.SubSysUserProfilePrg\",\"Container\":\"None\",\"Description\":\"User Profile SubSystem\",\"DisplayName\":\"User Profile SubSystem\",\"Modules\":[\"ff1030.kernel.impl\"],\"Name\":\"@SubSys.UserProfile\",\"Profiles\":[\"*\"],\"Type\":\"SubSystem\"}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("@SubSys.FileSystem.fsdummy", "{\"Author\":\"Marco Pesarese\",\"Category\":\"SubSystem\",\"Class\":\"com.oFF.test.kernel.fsdummy.SubSysFsDummyPrg\",\"Container\":\"None\",\"Description\":\"Dummy Filesystem\",\"DisplayName\":\"Dummy Filesystem\",\"Modules\":[\"ff1090.kernel.tests\"],\"Name\":\"@SubSys.FileSystem.fsdummy\",\"Profiles\":[\"*\"],\"Type\":\"SubSystem\"}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("@SubSys.DataProviderPool", "{\"Author\":\"Marco Pesarese\",\"Category\":\"SubSystem\",\"Class\":\"com.oFF.runtime.dataprovider.impl.SubSysDataProviderPoolPrg\",\"Container\":\"None\",\"Description\":\"Dataprovider Pool SubSystem\",\"DisplayName\":\"Dataprovider Pool SubSystem\",\"Modules\":[\"ff2010.binding\"],\"Name\":\"@SubSys.DataProviderPool\",\"Profiles\":[\"*\"],\"Type\":\"SubSystem\"}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("cache", "{\"Class\":\"com.oFF.shell.ShellCache\",\"Container\":\"Console\",\"Description\":\"Shell cache program\",\"Modules\":[\"ff2040.shell\"],\"Name\":\"cache\",\"Profiles\":[\"syscmd\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("cd", "{\"Class\":\"com.oFF.shell.ShellCd\",\"Container\":\"Console\",\"Description\":\"Shell cd program\",\"Modules\":[\"ff2040.shell\"],\"Name\":\"cd\",\"Profiles\":[\"syscmd\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("del", "{\"Class\":\"com.oFF.shell.ShellDel\",\"Container\":\"Console\",\"Description\":\"Shell del program\",\"Modules\":[\"ff2040.shell\"],\"Name\":\"del\",\"Profiles\":[\"syscmd\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("dir", "{\"Class\":\"com.oFF.shell.ShellDir\",\"Container\":\"Console\",\"Description\":\"Shell dir program\",\"Modules\":[\"ff2040.shell\"],\"Name\":\"dir\",\"Profiles\":[\"syscmd\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("grep", "{\"Class\":\"com.oFF.shell.ShellGrep\",\"Container\":\"Console\",\"Description\":\"Shell grep program\",\"Modules\":[\"ff2040.shell\"],\"Name\":\"grep\",\"Profiles\":[\"syscmd\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("help", "{\"Class\":\"com.oFF.shell.ShellHelp\",\"Container\":\"Console\",\"Description\":\"Helper Program\",\"DisplayName\":\"Helper Program\",\"Modules\":[\"ff2040.shell\"],\"Name\":\"help\",\"Profiles\":[\"syscmd\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("kill", "{\"Author\":\"Marco Pesarese\",\"Class\":\"com.oFF.shell.ShellKill\",\"Container\":\"Console\",\"Description\":\"Shell program to kill a process\",\"Modules\":[\"ff2040.shell\"],\"Name\":\"kill\",\"Profiles\":[\"syscmd\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("listprgs", "{\"Class\":\"com.oFF.shell.ShellListPrgs\",\"Container\":\"Console\",\"Description\":\"Shell list programs\",\"Modules\":[\"ff2040.shell\"],\"Name\":\"listprgs\",\"Profiles\":[\"syscmd\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("mkdir", "{\"Class\":\"com.oFF.shell.ShellMkdir\",\"Container\":\"Console\",\"Description\":\"Shell make directory program\",\"Modules\":[\"ff2040.shell\"],\"Name\":\"mkdir\",\"Profiles\":[\"syscmd\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("mount", "{\"Class\":\"com.oFF.shell.ShellMount\",\"Container\":\"Console\",\"Description\":\"Shell mount program\",\"Modules\":[\"ff2040.shell\"],\"Name\":\"mount\",\"Profiles\":[\"syscmd\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("proc", "{\"Author\":\"Marco Pesarese\",\"Class\":\"com.oFF.shell.ShellProcesses\",\"Container\":\"Console\",\"Description\":\"Shell program to show all processes\",\"Modules\":[\"ff2040.shell\"],\"Name\":\"proc\",\"Profiles\":[\"syscmd\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("rmdir", "{\"Class\":\"com.oFF.shell.ShellRmdir\",\"Container\":\"Console\",\"Description\":\"Shell remove directory program\",\"Modules\":[\"ff2040.shell\"],\"Name\":\"rmdir\",\"Profiles\":[\"syscmd\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("set", "{\"Class\":\"com.oFF.shell.ShellSet\",\"Container\":\"Console\",\"Description\":\"Shell set program\",\"Modules\":[\"ff2040.shell\"],\"Name\":\"set\",\"Profiles\":[\"syscmd\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("shell", "{\"AppStore\":true,\"Author\":\"Marco Pesarese\",\"Category\":\"Shell\",\"Class\":\"com.oFF.shell.SerenityShell\",\"Container\":\"Console\",\"Description\":\"Firefly command line utility\",\"DisplayName\":\"Shell\",\"Icon\":\"${ff_mimes}\\/images\\/programicons\\/shell.png\",\"InitialContainerFrame\":{\"Height\":null,\"Maximized\":false,\"Width\":null,\"X\":null,\"Y\":null},\"InitiallyOnLaunchpad\":true,\"Modules\":[\"ff2040.shell\",\"ff2210.ui.native\",\"ff2240.ui.program\"],\"Name\":\"shell\",\"Profiles\":[\"*\"],\"SubSystems\":[\"Gui\",\"SystemLandscape\",\"CredentialsProvider\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("showattr", "{\"Class\":\"com.oFF.shell.ShellShowAttributes\",\"Container\":\"Console\",\"Description\":\"Show file attributes\",\"Modules\":[\"ff2040.shell\"],\"Name\":\"showattr\",\"Profiles\":[\"syscmd\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("showmeta", "{\"Class\":\"com.oFF.shell.ShellShowMetadata\",\"Container\":\"Console\",\"Description\":\"Show file metadata\",\"Modules\":[\"ff2040.shell\"],\"Name\":\"showmeta\",\"Profiles\":[\"syscmd\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("switchfs", "{\"Class\":\"com.oFF.shell.ShellSwitchFs\",\"Container\":\"Console\",\"Description\":\"Shell switch filesystem program\",\"Modules\":[\"ff2040.shell\"],\"Name\":\"switchfs\",\"Profiles\":[\"syscmd\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("takeOver", "{\"Class\":\"com.oFF.shell.ShellTakeOver\",\"Container\":\"Console\",\"Description\":\"Take over the control\",\"Modules\":[\"ff2040.shell\"],\"Name\":\"takeOver\",\"Profiles\":[\"syscmd\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("wget", "{\"Class\":\"com.oFF.shell.ShellWget\",\"Container\":\"Console\",\"Description\":\"Shell wget program\",\"Modules\":[\"ff2040.shell\"],\"Name\":\"wget\",\"Profiles\":[\"syscmd\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("whoami", "{\"Class\":\"com.oFF.shell.ShellWhoami\",\"Container\":\"Console\",\"Description\":\"Shell whoami program\",\"Modules\":[\"ff2040.shell\"],\"Name\":\"whoami\",\"Profiles\":[\"syscmd\"],\"SubSystems\":[\"UserProfile\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("DragonflyAppProgram", "{\"AppStore\":false,\"Author\":\"Marco Pesarese\",\"Category\":\"System\",\"Class\":\"com.oFF.runtime.program.impl.DragonflyAppProgram\",\"Container\":\"None\",\"Description\":\"DragonflyAppProgram\",\"DisplayName\":\"DragonflyAppProgram\",\"InitiallyOnLaunchpad\":false,\"Modules\":[\"ff2100.runtime\"],\"Name\":\"DragonflyAppProgram\",\"Profiles\":[\"skylights\"],\"SubSystems\":[\"Cache\",\"SystemLandscape\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("OrcaAppProgram", "{\"AppStore\":false,\"Author\":\"Marco Pesarese\",\"Category\":\"System\",\"Class\":\"com.oFF.runtime.program.impl.OrcaAppProgram\",\"Container\":\"None\",\"Description\":\"Orca Program\",\"DisplayName\":\"Orca Program\",\"InitiallyOnLaunchpad\":false,\"Modules\":[\"ff2100.runtime\"],\"Name\":\"OrcaAppProgram\",\"Profiles\":[\"skylights\"],\"SubSystems\":[\"SystemLandscape\",\"Cache\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("OrcaLiteViewerAppProgram", "{\"AppStore\":false,\"Author\":\"Vlad Zat\",\"Category\":\"System\",\"Class\":\"com.oFF.runtime.program.impl.OrcaLiteViewerAppProgram\",\"Container\":\"None\",\"Description\":\"Lite Weight Viewer\",\"DisplayName\":\"Lite Weight Viewer\",\"InitiallyOnLaunchpad\":false,\"Modules\":[\"ff2100.runtime\"],\"Name\":\"OrcaLiteViewerAppProgram\",\"Profiles\":[\"*\"],\"SubSystems\":[\"SystemLandscape\",\"Cache\",\"CredentialsProviderLite\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("StandardAppProgram", "{\"AppStore\":false,\"Author\":\"Marco Pesarese\",\"Category\":\"System\",\"Class\":\"com.oFF.runtime.program.impl.StandardAppProgram\",\"Container\":\"None\",\"Description\":\"StandardAppProgram\",\"DisplayName\":\"File StandardAppProgram\",\"InitiallyOnLaunchpad\":false,\"Modules\":[\"ff2100.runtime\"],\"Name\":\"StandardAppProgram\",\"Profiles\":[\"skylights\"],\"SubSystems\":[\"SystemLandscape\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("@SubSys.FileSystem.fscontentlib", "{\"Author\":\"Robert Mullen\",\"Category\":\"SubSystem\",\"Class\":\"com.oFF.contentlib.SubSysFsContentlibPrg\",\"Container\":\"None\",\"Description\":\"Contentlib Filesystem\",\"Device\":\"None\",\"DisplayName\":\"Contentlib Filesystem\",\"Modules\":[\"ff1040.kernel.native\",\"ff2150.contentlib\"],\"Name\":\"@SubSys.FileSystem.fscontentlib\",\"Profiles\":[\"*\"],\"SubSystems\":[\"SystemLandscape\",\"UserProfile\"],\"Type\":\"SubSystem\"}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("@SubSys.FileSystem.fsrecentdssac", "{\"Author\":\"Michael Zakharenkov\",\"Category\":\"SubSystem\",\"Class\":\"com.oFF.runtime.orca.SubSysFsRecentDsSAC\",\"Container\":\"None\",\"Description\":\"Contentlib Filesystem\",\"DisplayName\":\"Contentlib Filesystem\",\"Modules\":[\"ff1040.kernel.native\",\"ff2100.runtime\"],\"Name\":\"@SubSys.FileSystem.fsrecentdssac\",\"Profiles\":[\"*\"],\"SubSystems\":[\"UserProfile\"],\"Type\":\"SubSystem\"}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("SrvFileTestHelloWorld", "{\"Class\":\"com.oFF.test.runtime.file.SrvFileTestHelloWorld\",\"Description\":\"SrvFileTestHelloWorld\",\"Modules\":[\"ff2190.runtime.tests\"],\"Name\":\"SrvFileTestHelloWorld\",\"Profiles\":[\"dev\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("testrunner", "{\"Class\":\"com.oFF.test.framework.runner.TestRunnerWithVariants\",\"Description\":\"Testrunner\",\"Modules\":[\"ff2190.runtime.tests\",\"ff4920.olap.impl.tests\"],\"Name\":\"testrunner\",\"Profiles\":[\"dev\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("@SubSys.Gui", "{\"Author\":\"Marco Pesarese\",\"Category\":\"SubSystem\",\"Class\":\"com.oFF.ui.impl.SubSysGuiPrg\",\"Container\":\"None\",\"Description\":\"GUI SubSystem\",\"DisplayName\":\"GUI SubSystem\",\"Modules\":[\"ff2200.ui\",\"ff2210.ui.native\"],\"Name\":\"@SubSys.Gui\",\"Profiles\":[\"*\"],\"Type\":\"SubSystem\"}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("SphereClient", "{\"AppStore\":true,\"Author\":\"Marcin Paskuda\",\"Category\":\"System\",\"Class\":\"com.oFF.ui.remote.client.SphereClient\",\"Container\":\"Window\",\"Description\":\"Remote Ui client\",\"DisplayName\":\"Sphere Client\",\"Icon\":\"${ff_mimes}\\/images\\/programicons\\/sphereclient.png\",\"InitialContainerFrame\":{\"Height\":null,\"Maximized\":false,\"Width\":null,\"X\":null,\"Y\":null},\"InitiallyOnLaunchpad\":true,\"Modules\":[\"ff2260.ui.remote\"],\"Name\":\"SphereClient\",\"Profiles\":[\"dev\"],\"SubSystems\":[\"Gui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("@SubSys.Gui.Server", "{\"Author\":\"Marcin Paskuda\",\"Category\":\"SubSystem\",\"Class\":\"com.oFF.ui.remote.server.SubSysGuiServerPrg\",\"Container\":\"None\",\"Description\":\"Virtual Server GUI SubSystem\",\"DisplayName\":\"Server GUI SubSystem\",\"Modules\":[\"ff2200.ui\",\"ff2260.ui.remote\"],\"Name\":\"@SubSys.Gui.Server\",\"Profiles\":[\"*\"],\"Type\":\"SubSystem\"}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("DialogTestProgram", "{\"AppStore\":false,\"Author\":\"Marcin Paskuda\",\"Category\":\"System\",\"Class\":\"com.oFF.test.ui.programs.dialogtestprogram\",\"Container\":\"Dialog\",\"Description\":\"A dialog test program using a dialog program container\",\"DisplayName\":\"Dialog Test Program\",\"Icon\":\"${ff_mimes}\\/images\\/programicons\\/dialogtestprg.png\",\"InitialContainerFrame\":{\"Height\":null,\"Maximized\":false,\"Width\":null,\"X\":null,\"Y\":null},\"InitiallyOnLaunchpad\":false,\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"DialogTestProgram\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("DragDropSample", "{\"Class\":\"com.oFF.test.ui.apps.DragDropSample\",\"Container\":\"Window\",\"Description\":\"Playground for drag-drop implementation in Galaxy Studio\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"DragDropSample\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("MyButtonApp", "{\"Class\":\"com.oFF.test.ui.apps.MyButtonApp\",\"Container\":\"Window\",\"Description\":\"MyButtonApp\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"MyButtonApp\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("MyButtonVariantsApp", "{\"Class\":\"com.oFF.test.ui.apps.MyButtonVariantsApp\",\"Container\":\"Window\",\"Description\":\"MyButtonVariantsApp\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"MyButtonVariantsApp\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("MyCheckboxApp", "{\"Class\":\"com.oFF.test.ui.apps.MyCheckboxApp\",\"Container\":\"Window\",\"Description\":\"MyCheckboxApp\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"MyCheckboxApp\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("MyClipboardPasteApp", "{\"Class\":\"com.oFF.test.ui.apps.MyClipboardPasteApp\",\"Container\":\"Window\",\"Description\":\"MyClipboardPasteApp\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"MyClipboardPasteApp\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("MyContextMenuApp", "{\"Class\":\"com.oFF.test.ui.apps.MyContextMenuApp\",\"Container\":\"Window\",\"Description\":\"MyContextMenuApp\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"MyContextMenuApp\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("MyDeviceInfoApp", "{\"Class\":\"com.oFF.test.ui.apps.MyDeviceInfoApp\",\"Container\":\"Window\",\"Description\":\"MyDeviceInfoApp\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"MyDeviceInfoApp\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("MyDialogApp", "{\"Class\":\"com.oFF.test.ui.apps.MyDialogApp\",\"Container\":\"Window\",\"Description\":\"MyDialogApp\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"MyDialogApp\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("MyDropDownApp", "{\"Class\":\"com.oFF.test.ui.apps.MyDropDownApp\",\"Container\":\"Window\",\"Description\":\"MyDropDownApp\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"MyDropDownApp\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("MyFancyButtonApp", "{\"Class\":\"com.oFF.test.ui.apps.MyFancyButtonApp\",\"Container\":\"Window\",\"Description\":\"MyFancyButtonApp\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"MyFancyButtonApp\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("MyIconTabBarApp", "{\"Class\":\"com.oFF.test.ui.apps.MyIconTabBarApp\",\"Container\":\"Window\",\"Description\":\"MyIconTabBarApp\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"MyIconTabBarApp\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("MyKitchenSinkApp", "{\"Class\":\"com.oFF.test.ui.apps.MyKitchenSinkApp\",\"Container\":\"Window\",\"Description\":\"MyKitchenSinkApp\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"MyKitchenSinkApp\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("MyKitchenSinkApp2", "{\"Class\":\"com.oFF.test.ui.apps.MyKitchenSinkApp2\",\"Container\":\"Window\",\"Description\":\"MyKitchenSinkApp2\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"MyKitchenSinkApp2\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("MyListBoxApp", "{\"Class\":\"com.oFF.test.ui.apps.MyListBoxApp\",\"Container\":\"Window\",\"Description\":\"MyListBoxApp\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"MyListBoxApp\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("MyMatrixLayoutApp", "{\"Class\":\"com.oFF.test.ui.apps.MyMatrixLayoutApp\",\"Container\":\"Window\",\"Description\":\"MyMatrixLayoutApp\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"MyMatrixLayoutApp\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("MyMenuApp", "{\"Class\":\"com.oFF.test.ui.apps.MyMenuApp\",\"Container\":\"Window\",\"Description\":\"MyMenuApp\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"MyMenuApp\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("MyNavigationContainerTestApp", "{\"Class\":\"com.oFF.test.ui.apps.MyNavigationContainerTestApp\",\"Container\":\"Window\",\"Description\":\"MyNavigationContainerTestApp\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"MyNavigationContainerTestApp\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("MyResponsiveTableApp", "{\"Class\":\"com.oFF.test.ui.apps.MyResponsiveTableApp\",\"Container\":\"Window\",\"Description\":\"MyResponsiveTableApp\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"MyResponsiveTableApp\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("MySideNavigationApp", "{\"Class\":\"com.oFF.test.ui.apps.MySideNavigationApp\",\"Container\":\"Window\",\"Description\":\"MySideNavigationApp\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"MySideNavigationApp\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("MyTableApp", "{\"Class\":\"com.oFF.test.ui.apps.MyTableApp\",\"Container\":\"Window\",\"Description\":\"MyTableApp\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"MyTableApp\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("MyToolbarApp", "{\"Class\":\"com.oFF.test.ui.apps.MyToolbarApp\",\"Container\":\"Window\",\"Description\":\"MyToolbarApp\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"MyToolbarApp\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("MyTreeApp", "{\"Class\":\"com.oFF.test.ui.apps.MyTreeApp\",\"Container\":\"Window\",\"Description\":\"MyTreeApp\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"MyTreeApp\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("MyTreeTableApp", "{\"Class\":\"com.oFF.test.ui.apps.MyTreeTableApp\",\"Container\":\"Window\",\"Description\":\"MyTreeTableApp\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"MyTreeTableApp\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("MyVSplitterMinMaxApp", "{\"Class\":\"com.oFF.test.ui.apps.MyVerticalSplitterApp\",\"Container\":\"Window\",\"Description\":\"MyVSplitterMinMaxApp\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"MyVSplitterMinMaxApp\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppActivityIndicator", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppActivityIndicator\",\"Container\":\"Window\",\"Description\":\"TestAppActivityIndicator\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppActivityIndicator\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppActivityIndicatorProperties", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppActivityIndicatorProperties\",\"Container\":\"Window\",\"Description\":\"TestAppActivityIndicatorProperties\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppActivityIndicatorProperties\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppButton", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppButton\",\"Container\":\"Window\",\"Description\":\"TestAppButton\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppButton\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppButtonEvents", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppButtonEvents\",\"Container\":\"Window\",\"Description\":\"TestAppButtonEvents\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppButtonEvents\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppButtonProperties", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppButtonProperties\",\"Container\":\"Window\",\"Description\":\"TestAppButtonProperties\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppButtonProperties\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppCheckbox", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppCheckbox\",\"Container\":\"Window\",\"Description\":\"TestAppCheckbox\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppCheckbox\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppCheckboxEvents", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppCheckboxEvents\",\"Container\":\"Window\",\"Description\":\"TestAppCheckboxEvents\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppCheckboxEvents\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppCheckboxProperties", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppCheckboxProperties\",\"Container\":\"Window\",\"Description\":\"TestAppCheckboxProperties\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppCheckboxProperties\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppComboBox", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppComboBox\",\"Container\":\"Window\",\"Description\":\"TestAppComboBox\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppComboBox\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppComboBoxEvents", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppComboBoxEvents\",\"Container\":\"Window\",\"Description\":\"TestAppComboBoxEvents\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppComboBoxEvents\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppComboBoxProperties", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppComboBoxProperties\",\"Container\":\"Window\",\"Description\":\"TestAppComboBoxProperties\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppComboBoxProperties\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppDatePicker", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppDatePicker\",\"Container\":\"Window\",\"Description\":\"TestAppDatePicker\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppDatePicker\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppDatePickerEvents", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppDatePickerEvents\",\"Container\":\"Window\",\"Description\":\"TestAppDatePickerEvents\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppDatePickerEvents\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppDatePickerProperties", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppDatePickerProperties\",\"Container\":\"Window\",\"Description\":\"TestAppDatePickerProperties\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppDatePickerProperties\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppDateTimePicker", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppDateTimePicker\",\"Container\":\"Window\",\"Description\":\"TestAppDateTimePicker\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppDateTimePicker\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppDateTimePickerEvents", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppDateTimePickerEvents\",\"Container\":\"Window\",\"Description\":\"TestAppDateTimePickerEvents\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppDateTimePickerEvents\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppDialog", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppDialog\",\"Container\":\"Window\",\"Description\":\"TestAppDialog\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppDialog\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppDropDown", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppDropDown\",\"Container\":\"Window\",\"Description\":\"TestAppDropDown\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppDropDown\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppDropDownEvents", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppDropDownEvents\",\"Container\":\"Window\",\"Description\":\"TestAppDropDownEvents\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppDropDownEvents\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppDropDownProperties", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppDropDownProperties\",\"Container\":\"Window\",\"Description\":\"TestAppDropDownProperties\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppDropDownProperties\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppHorizontalLayout", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppHorizontalLayout\",\"Container\":\"Window\",\"Description\":\"TestAppHorizontalLayout\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppHorizontalLayout\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppIconTabBar", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppIconTabBar\",\"Container\":\"Window\",\"Description\":\"TestAppIconTabBar\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppIconTabBar\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppIconTabBarEvents", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppIconTabBarEvents\",\"Container\":\"Window\",\"Description\":\"TestAppIconTabBarEvents\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppIconTabBarEvents\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppIconTabBarProperties", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppIconTabBarProperties\",\"Container\":\"Window\",\"Description\":\"TestAppIconTabBarProperties\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppIconTabBarProperties\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppImage", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppImage\",\"Container\":\"Window\",\"Description\":\"TestAppImage\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppImage\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppImageProperties", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppImageProperties\",\"Container\":\"Window\",\"Description\":\"TestAppImageProperties\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppImageProperties\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppInput", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppInput\",\"Container\":\"Window\",\"Description\":\"TestAppInput\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppInput\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppInputEvents", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppInputEvents\",\"Container\":\"Window\",\"Description\":\"TestAppInputEvents\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppInputEvents\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppInputProperties", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppInputProperties\",\"Container\":\"Window\",\"Description\":\"TestAppInputProperties\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppInputProperties\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppLabel", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppLabel\",\"Container\":\"Window\",\"Description\":\"TestAppLabel\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppLabel\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppLabelProperties", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppLabelProperties\",\"Container\":\"Window\",\"Description\":\"TestAppLabelProperties\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppLabelProperties\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppLaunchpad", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppLaunchpad\",\"Container\":\"Window\",\"Description\":\"TestAppLaunchpad\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppLaunchpad\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppList", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppList\",\"Container\":\"Window\",\"Description\":\"TestAppList\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppList\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppListEvents", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppListEvents\",\"Container\":\"Window\",\"Description\":\"TestAppListEvents\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppListEvents\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppListProperties", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppListProperties\",\"Container\":\"Window\",\"Description\":\"TestAppListProperties\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppListProperties\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppMatrixLayout", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppMatrixLayout\",\"Container\":\"Window\",\"Description\":\"TestAppMatrixLayout\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppMatrixLayout\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppNavigationContainerInDialog", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppNavigationContainerInDialog\",\"Container\":\"Window\",\"Description\":\"TestAppNavigationContainerInDialog\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppNavigationContainerInDialog\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppNavigationContainerTwoPath", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppNavigationContainerTwoPath\",\"Container\":\"Window\",\"Description\":\"TestAppNavigationContainerTwoPath\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppNavigationContainerTwoPath\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppPopover", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppPopover\",\"Container\":\"Window\",\"Description\":\"TestAppPopover\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppPopover\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppPopoverEvents", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppPopoverEvents\",\"Container\":\"Window\",\"Description\":\"TestAppPopoverEvents\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppPopoverEvents\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppSlider", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppSlider\",\"Container\":\"Window\",\"Description\":\"TestAppSlider\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppSlider\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppSliderEvents", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppSliderEvents\",\"Container\":\"Window\",\"Description\":\"TestAppSliderEvents\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppSliderEvents\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppSliderProperties", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppSliderProperties\",\"Container\":\"Window\",\"Description\":\"TestAppSliderProperties\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppSliderProperties\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppSpacer", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppSpacer\",\"Container\":\"Window\",\"Description\":\"TestAppSpacer\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppSpacer\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppTerminal", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppTerminal\",\"Container\":\"Window\",\"Description\":\"TestAppTerminal\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppTerminal\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppText", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppText\",\"Container\":\"Window\",\"Description\":\"TestAppText\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppText\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppTextArea", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppTextArea\",\"Container\":\"Window\",\"Description\":\"TestAppTextArea\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppTextArea\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppTextAreaEvents", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppTextAreaEvents\",\"Container\":\"Window\",\"Description\":\"TestAppTextAreaEvents\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppTextAreaEvents\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppTextAreaProperties", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppTextAreaProperties\",\"Container\":\"Window\",\"Description\":\"TestAppTextAreaProperties\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppTextAreaProperties\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppTextProperties", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppTextProperties\",\"Container\":\"Window\",\"Description\":\"TestAppTextProperties\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppTextProperties\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppTimePicker", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppTimePicker\",\"Container\":\"Window\",\"Description\":\"TestAppTimePicker\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppTimePicker\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppTimePickerEvents", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppTimePickerEvents\",\"Container\":\"Window\",\"Description\":\"TestAppTimePickerEvents\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppTimePickerEvents\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppToast", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppToast\",\"Container\":\"Window\",\"Description\":\"TestAppToast\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppToast\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppTree", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppTree\",\"Container\":\"Window\",\"Description\":\"TestAppTree\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppTree\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppTreeEvents", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppTreeEvents\",\"Container\":\"Window\",\"Description\":\"TestAppTreeEvents\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppTreeEvents\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppTreeProperties", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppTreeProperties\",\"Container\":\"Window\",\"Description\":\"TestAppTreeProperties\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppTreeProperties\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppVerticalLayout", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppVerticalLayout\",\"Container\":\"Window\",\"Description\":\"TestAppVerticalLayout\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppVerticalLayout\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TestAppWindow", "{\"Class\":\"com.oFF.test.ui.apps.controls.TestAppWindow\",\"Container\":\"Window\",\"Description\":\"TestAppWindow\",\"Modules\":[\"ff2290.ui.tests\"],\"Name\":\"TestAppWindow\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("Apollo", "{\"AppStore\":true,\"Author\":\"Marcin Paskuda\",\"Category\":\"System\",\"Class\":\"com.oFF.programs.fileexplorer.FeApollo\",\"Container\":\"Window\",\"Description\":\"Firefly file explorer\",\"DisplayName\":\"File Explorer\",\"Icon\":\"${ff_mimes}\\/images\\/programicons\\/fileexplorer.png\",\"InitialContainerFrame\":{\"Height\":\"60vh\",\"Maximized\":false,\"Width\":\"60vw\",\"X\":null,\"Y\":null},\"InitiallyOnLaunchpad\":true,\"Modules\":[\"ff3100.system.ui\"],\"Name\":\"Apollo\",\"Profiles\":[\"sysui\"],\"SubSystems\":[\"SystemLandscape\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("Athena", "{\"AppStore\":true,\"Arguments\":{\"type\":{\"Alias\":\"t\",\"Choices\":[],\"Conflicts\":[],\"Default\":\"text\",\"Description\":\"The content type\",\"Implies\":[],\"Required\":false,\"Type\":\"string\"}},\"Author\":\"Marcin Paskuda\",\"Category\":\"System\",\"Class\":\"com.oFF.programs.texteditor.SuAthena\",\"Container\":\"Window\",\"Description\":\"Simple text editor\",\"DisplayName\":\"Text Editor\",\"Icon\":\"${ff_mimes}\\/images\\/programicons\\/athenaeditor.png\",\"InitialContainerFrame\":{\"Height\":null,\"Maximized\":false,\"Width\":null,\"X\":null,\"Y\":null},\"InitiallyOnLaunchpad\":true,\"Modules\":[\"ff3100.system.ui\"],\"Name\":\"Athena\",\"Profiles\":[\"sysui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("CalendarDialog", "{\"AppStore\":false,\"Author\":\"Luis Teixeira\",\"Category\":\"System\",\"Class\":\"com.oFF.dialogs.calendar.SuCalendarDialog\",\"Container\":\"Dialog\",\"Description\":\"Firefly custom calendar dialog\",\"DisplayName\":\"Calendar\",\"Icon\":\"\",\"InitialContainerFrame\":{\"Height\":null,\"Maximized\":false,\"Width\":null,\"X\":null,\"Y\":null},\"InitiallyOnLaunchpad\":false,\"Modules\":[\"ff3100.system.ui\"],\"Name\":\"CalendarDialog\",\"Profiles\":[\"skylights\"],\"SubSystems\":[\"Gui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("Chronos", "{\"AppStore\":true,\"Author\":\"Alexander Daum\",\"Category\":\"System\",\"Class\":\"com.oFF.programs.chronos.chronos\",\"Container\":\"Window\",\"Description\":\"Chronos Calendar Dialog test\",\"DisplayName\":\"Chronos\",\"Icon\":\"${ff_mimes}\\/images\\/programicons\\/chronos.png\",\"InitialContainerFrame\":{\"Height\":\"70%\",\"Maximized\":false,\"Width\":\"70%\",\"X\":null,\"Y\":null},\"InitialTitle\":\"Chronos Calendar Dialog test\",\"InitiallyOnLaunchpad\":false,\"Modules\":[\"ff3100.system.ui\"],\"Name\":\"Chronos\",\"Profiles\":[\"skylights\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("ConnectionTestDialog", "{\"AppStore\":false,\"Author\":\"Marcin Paskuda\",\"Category\":\"System\",\"Class\":\"com.oFF.dialogs.connectiontest.SuConnectionTestDialog\",\"Container\":\"Dialog\",\"Description\":\"Allows to test a connection to a specific system\",\"DisplayName\":\"Connection Test\",\"Icon\":\"\",\"InitialContainerFrame\":{\"Height\":null,\"Maximized\":false,\"Width\":null,\"X\":null,\"Y\":null},\"InitiallyOnLaunchpad\":false,\"Modules\":[\"ff3100.system.ui\",\"ff4050.processor\"],\"Name\":\"ConnectionTestDialog\",\"Profiles\":[\"skylights\"],\"SubSystems\":[\"SystemLandscape\",\"CredentialsProvider\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("Corona", "{\"AppStore\":true,\"Author\":\"Marcin Paskuda\",\"Category\":\"Misc\",\"Class\":\"com.oFF.programs.corona.CoronaInfo\",\"Container\":\"Window\",\"Description\":\"Show current corona numbers\",\"DisplayName\":\"Corona\",\"Icon\":\"${ff_mimes}\\/images\\/programicons\\/coronavirus.png\",\"InitialContainerFrame\":{\"Height\":null,\"Maximized\":false,\"Width\":null,\"X\":null,\"Y\":null},\"InitiallyOnLaunchpad\":false,\"Modules\":[\"ff3100.system.ui\"],\"Name\":\"Corona\",\"Profiles\":[\"skylights\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("Doom1", "{\"AppStore\":true,\"Author\":\"Marcin Paskuda\",\"Category\":\"System\",\"Class\":\"com.oFF.programs.doom1.WasmDoom1\",\"Container\":\"Window\",\"Description\":\"WebAssembly port of Doom classic\",\"DisplayName\":\"Doom 1\",\"Icon\":\"${ff_mimes}\\/images\\/programicons\\/doom1.png\",\"InitialContainerFrame\":{\"Height\":\"60vh\",\"Maximized\":false,\"Width\":\"60vw\",\"X\":null,\"Y\":null},\"InitiallyOnLaunchpad\":false,\"Modules\":[\"ff3100.system.ui\"],\"Name\":\"Doom1\",\"Profiles\":[\"skylights\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("ExportDialog", "{\"AppStore\":false,\"Author\":\"Robert Mullen\",\"Category\":\"System\",\"Class\":\"com.oFF.dialogs.export.SuExportDialog\",\"Container\":\"Dialog\",\"Description\":\"Firefly custom export dialog\",\"DisplayName\":\"Export\",\"Icon\":\"\",\"InitialContainerFrame\":{\"Height\":null,\"Maximized\":false,\"Width\":null,\"X\":null,\"Y\":null},\"InitiallyOnLaunchpad\":false,\"Modules\":[\"ff3100.system.ui\"],\"Name\":\"ExportDialog\",\"Profiles\":[\"skylights\"],\"SubSystems\":[\"Gui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("JavadocDialog", "{\"AppStore\":false,\"Author\":\"Marcin Paskuda\",\"Category\":\"System\",\"Class\":\"com.oFF.dialogs.javadoc.SuJavadocDialog\",\"Container\":\"Dialog\",\"Description\":\"Display the firefly Javadoc\",\"DisplayName\":\"Firefly Javadoc\",\"Icon\":\"\",\"InitialContainerFrame\":{\"Height\":null,\"Maximized\":false,\"Width\":null,\"X\":null,\"Y\":null},\"InitiallyOnLaunchpad\":false,\"Modules\":[\"ff3100.system.ui\"],\"Name\":\"JavadocDialog\",\"Profiles\":[\"skylights\"],\"SubSystems\":[]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("Mercury", "{\"AppStore\":true,\"Author\":\"Marcin Paskuda\",\"Category\":\"System\",\"Class\":\"com.oFF.programs.programmanager.SuMercury\",\"Container\":\"Window\",\"Description\":\"Explore and manage all available system programs\",\"DisplayName\":\"Program Manager\",\"Icon\":\"${ff_mimes}\\/images\\/programicons\\/mercury.png\",\"InitialContainerFrame\":{\"Height\":null,\"Maximized\":false,\"Width\":null,\"X\":null,\"Y\":null},\"InitiallyOnLaunchpad\":false,\"Modules\":[\"ff3100.system.ui\"],\"Name\":\"Mercury\",\"Profiles\":[\"skylights\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("Metis", "{\"AppStore\":true,\"Author\":\"Marcin Paskuda\",\"Category\":\"System\",\"Class\":\"com.oFF.programs.systemlandscapeeditor.SleMetis\",\"Container\":\"Window\",\"Description\":\"Firefly system landscape editor\",\"DisplayName\":\"System Landscape Editor\",\"Icon\":\"${ff_mimes}\\/images\\/programicons\\/metiseditor.png\",\"InitialContainerFrame\":{\"Height\":null,\"Maximized\":false,\"Width\":null,\"X\":null,\"Y\":null},\"InitiallyOnLaunchpad\":true,\"Modules\":[\"ff3100.system.ui\"],\"Name\":\"Metis\",\"Profiles\":[\"sysui\"],\"SubSystems\":[\"SystemLandscape\",\"CredentialsProvider\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("Minerva", "{\"AppStore\":true,\"Author\":\"Marcin Paskuda\",\"Category\":\"System\",\"Class\":\"com.oFF.programs.imageviewer.SuMinerva\",\"Container\":\"Window\",\"Description\":\"View images from local or remote files\",\"DisplayName\":\"Image Viewer\",\"Icon\":\"${ff_mimes}\\/images\\/programicons\\/minerva.png\",\"InitialContainerFrame\":{\"Height\":null,\"Maximized\":false,\"Width\":null,\"X\":null,\"Y\":null},\"InitiallyOnLaunchpad\":false,\"Modules\":[\"ff3100.system.ui\"],\"Name\":\"Minerva\",\"Profiles\":[\"skylights\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("ProgramLoader", "{\"AppStore\":false,\"Arguments\":{},\"Author\":\"Marcin Paskuda\",\"Category\":\"System\",\"Class\":\"com.oFF.programs.programloader.SuProgramLoader\",\"Container\":\"Window\",\"Description\":\"Dynamically load programs\",\"DisplayName\":\"Program Loader\",\"Icon\":\"${ff_mimes}\\/images\\/programicons\\/programloader.png\",\"InitialContainerFrame\":{\"Height\":null,\"Maximized\":false,\"Width\":null,\"X\":null,\"Y\":null},\"InitiallyOnLaunchpad\":false,\"Modules\":[\"ff3100.system.ui\"],\"Name\":\"ProgramLoader\",\"Profiles\":[\"skylights\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("ResourceExplorer", "{\"AppStore\":true,\"Author\":\"Raffaele Sangiovanni\",\"Category\":\"System\",\"Class\":\"com.oFF.programs.resourceexplorer.SuResourceExplorer\",\"Container\":\"Window\",\"Description\":\"Firefly Resource explorer\",\"DisplayName\":\"Resource Explorer\",\"Icon\":\"${ff_mimes}\\/images\\/programicons\\/resourceexplorer.png\",\"InitialContainerFrame\":{\"Maximized\":false,\"X\":null,\"Y\":null},\"InitiallyOnLaunchpad\":true,\"Modules\":[\"ff3100.system.ui\"],\"Name\":\"ResourceExplorer\",\"Profiles\":[\"skylights\",\"sac\"],\"SubSystems\":[\"UserProfile\",\"SystemLandscape\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("ResourceExplorerTester", "{\"AppStore\":false,\"Author\":\"Raffaele Sangiovanni\",\"Category\":\"System\",\"Class\":\"com.oFF.programs.resourceexplorertester.SuResourceExplorerTester\",\"Container\":\"Window\",\"Description\":\"Firefly Resource explorer app tester\",\"DisplayName\":\"Resource Explorer Tester\",\"Icon\":\"${ff_mimes}\\/images\\/programicons\\/resourceexplorertester.png\",\"InitialContainerFrame\":{\"Height\":\"60vh\",\"Maximized\":false,\"Width\":\"60vw\",\"X\":null,\"Y\":null},\"InitiallyOnLaunchpad\":false,\"Modules\":[\"ff3100.system.ui\"],\"Name\":\"ResourceExplorerTester\",\"Profiles\":[\"testui\"],\"SubSystems\":[\"UserProfile\",\"Cache\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("SettingsDialog", "{\"AppStore\":false,\"Author\":\"Marcin Paskuda\",\"Category\":\"System\",\"Class\":\"com.oFF.programs.settings.impl.SuSettingsDialog\",\"Container\":\"Dialog\",\"Description\":\"A central dialog to manage settings\",\"DisplayName\":\"Settings dialog\",\"Icon\":\"\",\"InitialContainerFrame\":{\"Height\":null,\"Maximized\":false,\"Width\":null,\"X\":null,\"Y\":null},\"InitiallyOnLaunchpad\":false,\"Modules\":[\"ff3100.system.ui\"],\"Name\":\"SettingsDialog\",\"Profiles\":[\"skylights\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("@SubSys.CredentialsProvider", "{\"Author\":\"Marco Pesarese\",\"Category\":\"SubSystem\",\"Class\":\"com.oFF.dialogs.credentialsprovider.SubSysCredentialsProviderPrg\",\"Container\":\"None\",\"Description\":\"Credentials Provider SubSystem\",\"DisplayName\":\"Credentials Provider SubSystem\",\"Modules\":[\"ff3100.system.ui\"],\"Name\":\"@SubSys.CredentialsProvider\",\"Profiles\":[\"*\"],\"SubSystems\":[\"Gui\"],\"Type\":\"SubSystem\"}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("Theia", "{\"AppStore\":true,\"Author\":\"Marcin Paskuda\",\"Category\":\"System\",\"Class\":\"com.oFF.programs.mediaplayer.SuTheia\",\"Container\":\"Window\",\"Description\":\"Play media from the world wide web\",\"DisplayName\":\"Media Player\",\"Icon\":\"${ff_mimes}\\/images\\/programicons\\/theiamediaplayer.png\",\"InitialContainerFrame\":{\"Height\":null,\"Maximized\":false,\"Width\":null,\"X\":null,\"Y\":null},\"InitiallyOnLaunchpad\":false,\"Modules\":[\"ff3100.system.ui\"],\"Name\":\"Theia\",\"Profiles\":[\"skylights\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("CredentialsDialog", "{\"AppStore\":false,\"Args\":\"\",\"Author\":\"Vlad Zat\",\"Category\":\"System\",\"Class\":\"com.oFF.dialogs.credentialsprovider.UiCredentialsDialogPrg\",\"Container\":\"Dialog\",\"Description\":\"UI Credentials Dialog Program\",\"DisplayName\":\"UI Credentials Dialog Program\",\"IconPath\":\"\",\"InitialContainerFrame\":{\"Height\":null,\"Maximized\":false,\"Width\":null,\"X\":null,\"Y\":null},\"InitiallyOnLaunchpad\":false,\"Modules\":[\"ff3100.system.ui\"],\"Name\":\"CredentialsDialog\"}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("UiDriverInfoDialog", "{\"AppStore\":false,\"Author\":\"Marcin Paskuda\",\"Category\":\"System\",\"Class\":\"com.oFF.dialogs.clientinfo.SuUiDriverInfoDialog\",\"Container\":\"Dialog\",\"Description\":\"Shows information about the current client, framework and device\",\"DisplayName\":\"UI Driver information\",\"Icon\":\"\",\"InitialContainerFrame\":{\"Height\":null,\"Maximized\":false,\"Width\":null,\"X\":null,\"Y\":null},\"InitiallyOnLaunchpad\":false,\"Modules\":[\"ff3100.system.ui\"],\"Name\":\"UiDriverInfoDialog\",\"Profiles\":[\"skylights\"],\"SubSystems\":[]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("UserProfileDialog", "{\"AppStore\":false,\"Author\":\"Damian Hillebrand\",\"Category\":\"System\",\"Class\":\"com.oFF.dialogs.userprofile.SuUserProfileDialog\",\"Container\":\"Dialog\",\"Description\":\"User Profile for current user profile settings\",\"DisplayName\":\"User Profile\",\"Icon\":\"\",\"InitialContainerFrame\":{\"Height\":null,\"Maximized\":false,\"Width\":null,\"X\":null,\"Y\":null},\"InitiallyOnLaunchpad\":false,\"Modules\":[\"ff3100.system.ui\"],\"Name\":\"UserProfileDialog\",\"Profiles\":[\"sysui\"],\"SubSystems\":[\"UserProfile\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("Vulcan", "{\"AppStore\":true,\"Author\":\"Marcin Paskuda\",\"Category\":\"System\",\"Class\":\"com.oFF.programs.fireflyuitoolkit.SuVulcan\",\"Container\":\"Window\",\"Description\":\"Displays all the available firefly ui controls\",\"DisplayName\":\"Firefly Ui Toolkit\",\"Icon\":\"${ff_mimes}\\/images\\/programicons\\/fireflyuitoolkit.png\",\"InitialContainerFrame\":{\"Height\":\"60vh\",\"Maximized\":false,\"Width\":\"60vw\",\"X\":null,\"Y\":null},\"InitiallyOnLaunchpad\":false,\"Modules\":[\"ff3100.system.ui\",\"ff8095.utils.ui\"],\"Name\":\"Vulcan\",\"Profiles\":[\"skylights\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("WeatherFetcher", "{\"AppStore\":true,\"Author\":\"Marcin Paskuda\",\"Category\":\"Misc\",\"Class\":\"com.oFF.programs.weather.SuWeatherFetcher\",\"Container\":\"Window\",\"Description\":\"Show the current weather for Walldorf\",\"DisplayName\":\"Weather\",\"Icon\":\"${ff_mimes}\\/images\\/programicons\\/weatherfetcher.png\",\"InitialContainerFrame\":{\"Height\":null,\"Maximized\":false,\"Width\":null,\"X\":null,\"Y\":null},\"InitiallyOnLaunchpad\":false,\"Modules\":[\"ff3100.system.ui\"],\"Name\":\"WeatherFetcher\",\"Profiles\":[\"skylights\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("sqlui", "{\"AppStore\":true,\"Author\":\"Christopher Homberger\",\"Category\":\"System\",\"Class\":\"com.oFF.programs.sqlui.SqlUi\",\"Container\":\"Window\",\"Description\":\"Execute simple sql queries\",\"DisplayName\":\"Sql Ui\",\"InitialWindowFrame\":{\"Height\":null,\"Maximized\":false,\"Width\":null,\"X\":null,\"Y\":null},\"InitialWindowTitle\":\"Sql Ui\",\"InitiallyOnLaunchpad\":false,\"Modules\":[\"ff3100.system.ui\",\"ff3500.sql\"],\"Name\":\"sqlui\",\"Profiles\":[\"skylights\",\"sac\"],\"SubSystems\":[\"SystemLandscape\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("MySacTableApp", "{\"Class\":\"com.oFF.test.ui.apps.MySacTableApp\",\"Container\":\"Window\",\"Description\":\"SAC Table test program\",\"Modules\":[\"ff3190.system.ui.tests\"],\"Name\":\"MySacTableApp\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("Horizon", "{\"AppStore\":true,\"Arguments\":{\"config\":{\"Alias\":\"c\",\"Choices\":[],\"Conflicts\":[\"configFile\",\"workspace\"],\"Default\":null,\"Description\":\"A stringified json containing the horizon configuration.\",\"Implies\":[],\"Required\":false,\"Type\":\"string\"},\"configFile\":{\"Alias\":\"cf\",\"Choices\":[],\"Conflicts\":[\"config\",\"workspace\"],\"Default\":null,\"Description\":\"A path pointing to a file containing the configuration.\",\"Implies\":[],\"Required\":false,\"Type\":\"string\"},\"workspace\":{\"Alias\":\"w\",\"Choices\":[],\"Conflicts\":[\"config\",\"configFile\"],\"Default\":null,\"Description\":\"A path to the workspace directory which should be used.\",\"Implies\":[],\"Required\":false,\"Type\":\"string\"}},\"Author\":\"Marcin Paskuda\",\"Category\":\"System\",\"Class\":\"com.oFF.horizon.HuHorizon\",\"Container\":\"Window\",\"Description\":\"Advanced Firefly Web IDE\",\"DisplayName\":\"Horizon\",\"Icon\":\"${ff_mimes}\\/images\\/programicons\\/horizon.png\",\"InitialContainerFrame\":{\"Height\":null,\"Maximized\":false,\"Width\":null,\"X\":null,\"Y\":null},\"InitiallyOnLaunchpad\":false,\"Modules\":[\"ff3610.horizon.ui\"],\"Name\":\"Horizon\",\"Profiles\":[\"skylights\"],\"SubSystems\":[\"UserProfile\",\"SystemLandscape\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("HorizonPluginListDialog", "{\"AppStore\":false,\"Arguments\":{\"showAll\":{\"Alias\":\"s\",\"Choices\":[],\"Conflicts\":[],\"Default\":false,\"Description\":\"Whether to show all the plugins, including debug ones!\",\"Implies\":[],\"Required\":false,\"Type\":\"boolean\"}},\"Author\":\"Marcin Paskuda\",\"Category\":\"System\",\"Class\":\"com.oFF.horizon.dialogs.pluginlistdialog.impl.HuPluginListDialog\",\"Container\":\"Dialog\",\"Description\":\"Show the registered horizon plugins\",\"DisplayName\":\"Horizon Plugin List Dialog\",\"Icon\":\"\",\"InitialContainerFrame\":{\"Height\":null,\"Maximized\":false,\"Width\":null,\"X\":null,\"Y\":null},\"InitiallyOnLaunchpad\":false,\"Modules\":[\"ff3610.horizon.ui\"],\"Name\":\"HorizonPluginListDialog\",\"Profiles\":[\"skylights\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("@SubSys.FileSystem.fsolapcatalog", "{\"Author\":\"Satinder Singh\",\"Category\":\"SubSystem\",\"Class\":\"com.oFF.olap.catalog.fs.OlapCatalogProgramSubSystem\",\"Container\":\"None\",\"Description\":\"Olap catalog based filesystem\",\"DisplayName\":\"Olap Catalog Filesystem\",\"Modules\":[\"ff1040.kernel.native\",\"ff4330.olap.catalog.impl\",\"ff4400.olap.providers\"],\"Name\":\"@SubSys.FileSystem.fsolapcatalog\",\"Profiles\":[\"*\"],\"Type\":\"SubSystem\"}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("olapdata", "{\"AppStore\":false,\"Author\":\"Marco Pesarese\",\"Class\":\"com.oFF.olap.prg.OlapDataPrg\",\"Container\":\"Console\",\"Description\":\"Simple olap sata plotter\",\"DisplayName\":\"Olap Data\",\"Modules\":[\"ff4340.olap.reference\",\"ff4400.olap.providers\"],\"Name\":\"olapdata\",\"Profiles\":[\"dev\"],\"SubSystems\":[\"SystemLandscape\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("sqlap", "{\"Class\":\"com.oFF.olap.engine.apps.ShellSqlOlap\",\"Description\":\"WIP sql olap processor cli for the firefly Terminal\",\"Modules\":[\"ff4500.olap.engine\"],\"Name\":\"sqlap\",\"Profiles\":[\"dev\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("storyconverter", "{\"Class\":\"com.oFF.story.utils.OcQStoryConvProgram\",\"Description\":\"storyconverter\",\"Modules\":[\"ff5500.story\"],\"Name\":\"storyconverter\",\"Profiles\":[\"skylights\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("Quasar", "{\"AppStore\":false,\"Author\":\"Marcin Paskuda\",\"Category\":\"Quasar\",\"Class\":\"com.oFF.quasar.QuasarProgram\",\"Container\":\"Window\",\"Description\":\"Quasar document renderer\",\"DisplayName\":\"Quasar\",\"Icon\":\"${ff_mimes}\\/images\\/programicons\\/quasar.png\",\"InitialContainerFrame\":{\"Height\":null,\"Maximized\":false,\"Width\":null,\"X\":null,\"Y\":null},\"Modules\":[\"ff4330.olap.catalog.impl\",\"ff4340.olap.reference\",\"ff4400.olap.providers\",\"ff4410.olap.ip.providers\",\"ff8000.quasar\",\"ff8010.olap.ui\"],\"Name\":\"Quasar\",\"Profiles\":[\"skylights\"],\"SubSystems\":[\"SystemLandscape\",\"DataProviderPool\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("Dialog_Condition", "{\"AppStore\":false,\"Author\":\"Michelle Braun\",\"Category\":\"Olap\",\"Class\":\"com.oFF.dialogs.conditions.dialog.OuDialogCondition\",\"Container\":\"Dialog\",\"Description\":\"Condition\",\"DisplayName\":\"Condition Dialog\",\"Icon\":\"\",\"InitialContainerFrame\":{\"Height\":null,\"Maximized\":false,\"Width\":null,\"X\":null,\"Y\":null},\"InitiallyOnLaunchpad\":false,\"Modules\":[\"ff8010.olap.ui\"],\"Name\":\"Dialog_Condition\",\"Profiles\":[\"skylights\",\"sac\",\"olapui\"],\"SubSystems\":[\"Gui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("Dialog_Conditions", "{\"AppStore\":false,\"Author\":\"Michelle Braun\",\"Category\":\"Olap\",\"Class\":\"com.oFF.dialogs.conditions.dialog.OuDialogConditions\",\"Container\":\"Dialog\",\"Description\":\"Conditions\",\"DisplayName\":\"Conditions Dialog\",\"Icon\":\"\",\"InitialContainerFrame\":{\"Height\":null,\"Maximized\":false,\"Width\":null,\"X\":null,\"Y\":null},\"InitiallyOnLaunchpad\":false,\"Modules\":[\"ff8010.olap.ui\"],\"Name\":\"Dialog_Conditions\",\"Profiles\":[\"skylights\",\"sac\",\"olapui\"],\"SubSystems\":[\"Gui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("CurrencyConversionDialog", "{\"Author\":\"Shane Conroy\",\"Category\":\"Olap\",\"Class\":\"com.oFF.dialogs.currencyconversiondialog.OuCurrencyConversionDialog\",\"Container\":\"Dialog\",\"Description\":\"Dialog to select the currency conversion applied to the query\",\"DisplayName\":\"Currency Conversion Dialog\",\"Modules\":[\"ff8010.olap.ui\"],\"Name\":\"CurrencyConversionDialog\",\"Profiles\":[\"skylights\",\"sac\",\"olapui\"],\"SubSystems\":[\"Gui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("DimensionDialog", "{\"AppStore\":false,\"Author\":\"Andreas Ratzka\",\"Category\":\"Olap\",\"Class\":\"com.oFF.dialogs.dimensiondialog.OuDimensionDialog\",\"Container\":\"Dialog\",\"Description\":\"Dialog for setting the properties of a dimension aka characteristic\",\"DisplayName\":\"Dimension Dialog\",\"Icon\":\"\",\"InitialContainerFrame\":{\"Height\":null,\"Maximized\":false,\"Width\":null,\"X\":null,\"Y\":null},\"InitiallyOnLaunchpad\":false,\"Modules\":[\"ff8010.olap.ui\"],\"Name\":\"DimensionDialog\",\"Profiles\":[\"skylights\",\"sac\",\"olapui\"],\"SubSystems\":[\"Gui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("DimensionDialog2", "{\"Author\":\"Alexander Daum\",\"Category\":\"Olap\",\"Class\":\"com.oFF.dialogs.dimensiondialog2.OuDimensionDialog2\",\"Container\":\"Dialog\",\"Description\":\"Dialog to configure dimension properties\",\"DisplayName\":\"Dimesion Dialog 2\",\"Modules\":[\"ff8010.olap.ui\"],\"Name\":\"DimensionDialog2\",\"Profiles\":[\"skylights\",\"sac\",\"olapui\"],\"SubSystems\":[\"Gui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("DimensionDialogExt", "{\"AppStore\":false,\"Author\":\"Andreas Ratzka\",\"Category\":\"Olap\",\"Class\":\"com.oFF.dialogs.dimensiondialog.OuDimensionDialogExt\",\"Container\":\"Dialog\",\"Description\":\"Dialog for setting the properties of a dimension aka characteristic\",\"DisplayName\":\"Dimension Dialog\",\"Icon\":\"\",\"InitialContainerFrame\":{\"Height\":null,\"Maximized\":false,\"Width\":null,\"X\":null,\"Y\":null},\"InitiallyOnLaunchpad\":false,\"Modules\":[\"ff8010.olap.ui\"],\"Name\":\"DimensionDialogExt\",\"Profiles\":[\"skylights\",\"sac\",\"olapui\"],\"SubSystems\":[\"Gui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("FilterDialogDimension", "{\"AppStore\":false,\"Arguments\":{\"alwaysShowSelectionContainer\":{\"Default\":false,\"Description\":\"Whether the selection list should always be visible in the dialog\",\"Required\":false,\"Type\":\"boolean\"},\"childNodesPageSize\":{\"Default\":50,\"Description\":\"The page size of children in a tree\",\"Required\":false,\"Type\":\"integer\"},\"dimensionDisplayInfo\":{\"Description\":\"The dimension display info in a list, e.g. id or description\",\"Required\":false,\"Type\":\"string\"},\"dimensionName\":{\"Description\":\"The name of the dimension to open the dialog for\",\"Required\":true,\"Type\":\"string\"},\"dynamicDateRangeMaxYears\":{\"Default\":100,\"Description\":\"The max amount of years for look back and ahead in dynamic date ranges\",\"Required\":false,\"Type\":\"integer\"},\"layeredFilterName\":{\"Description\":\"Whether the dialog should parse and update a specific layered filter\",\"Required\":false,\"Type\":\"string\"},\"lisPageSize\":{\"Default\":20,\"Description\":\"The page size in a list view\",\"Required\":false,\"Type\":\"integer\"},\"listPreloadPageCount\":{\"Default\":8,\"Description\":\"The pages preloaded in a list view\",\"Required\":false,\"Type\":\"integer\"},\"listSearchSize\":{\"Default\":100,\"Description\":\"The amount of values searched in a list view\",\"Required\":false,\"Type\":\"integer\"},\"offerClipboard\":{\"Default\":false,\"Description\":\"Whether a clipboard for copy paste functionality should be available\",\"Required\":false,\"Type\":\"boolean\"},\"offerEqualInRangeFilter\":{\"Default\":false,\"Description\":\"Whether comparison operator EQUAL should be availble in range view\",\"Required\":false,\"Type\":\"boolean\"},\"offerExclude\":{\"Default\":false,\"Description\":\"Whether an exclude toggle should be available\",\"Required\":false,\"Type\":\"boolean\"},\"offerFunctionalValuesView\":{\"Default\":false,\"Description\":\"Whether functional values should be available for selection\",\"Required\":false,\"Type\":\"boolean\"},\"offerHierarchyChange\":{\"Default\":false,\"Description\":\"Whether changing the hierarchy should be available\",\"Required\":false,\"Type\":\"boolean\"},\"offerListView\":{\"Default\":false,\"Description\":\"Whether a list of members should be available for selection\",\"Required\":false,\"Type\":\"boolean\"},\"offerRangeView\":{\"Default\":false,\"Description\":\"Whether it should be possible to view and define range values\",\"Required\":false,\"Type\":\"boolean\"},\"openWithDynamicFilter\":{\"Default\":false,\"Description\":\"Whether the dialog should parse and update the dynamic filter\",\"Required\":false,\"Type\":\"boolean\"},\"queryManagerName\":{\"Description\":\"The name of the query manager\",\"Required\":true,\"Type\":\"string\"},\"resizeable\":{\"Default\":true,\"Description\":\"Whether the dialog should be resizeable\",\"Required\":false,\"Type\":\"boolean\"},\"selectionMode\":{\"Default\":\"SingleSelectLeft\",\"Description\":\"The name of the dialog UI selection mode\",\"Required\":false,\"Type\":\"string\"},\"selectionRequired\":{\"Default\":false,\"Description\":\"Whether a selection is required\",\"Required\":false,\"Type\":\"boolean\"},\"title\":{\"Default\":\"\",\"Description\":\"The dialog title\",\"Required\":true,\"Type\":\"string\"}},\"Author\":\"Markus Weber\",\"Category\":\"Olap\",\"Class\":\"com.oFF.dialogs.filterdialog.FilterDialogDimensionReferenceImpl\",\"Container\":\"Dialog\",\"Description\":\"Dialog for filtering on specific dimension members\",\"DisplayName\":\"Filter Dialog\",\"Icon\":\"\",\"InitialContainerFrame\":{\"Height\":null,\"Maximized\":false,\"Width\":null,\"X\":null,\"Y\":null},\"InitiallyOnLaunchpad\":false,\"Modules\":[\"ff8010.olap.ui\"],\"Name\":\"FilterDialogDimension\",\"Profiles\":[\"skylights\",\"sac\",\"olapui\"],\"SubSystems\":[\"Gui\"],\"listeners\":{\"beforeFilterChangeListener\":{\"Description\":\"A listener triggered just before the filter is updated, only if dynamic or layered filter parameter is set\",\"Required\":false},\"closeListener\":{\"Description\":\"A close listener of type IFilterDialogCloseListener\",\"Required\":false},\"listenerDisplayChange\":{\"Description\":\"A listener for display changes inside the dialog\",\"Required\":false},\"listenerSelectionChange\":{\"Description\":\"A listener for selection changes\",\"Required\":false}},\"objectArguments\":{\"defaultSelection\":{\"Description\":\"A list of values selected by default\",\"Required\":false}}}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("FilterDialogHierarchyCatalog", "{\"AppStore\":false,\"Arguments\":{\"alwaysShowSelectionContainer\":{\"Default\":false,\"Description\":\"Whether the selection list should always be visible in the dialog\",\"Required\":false,\"Type\":\"boolean\"},\"childNodesPageSize\":{\"Default\":50,\"Description\":\"The page size of children in a tree\",\"Required\":false,\"Type\":\"integer\"},\"dimensionDisplayInfo\":{\"Default\":null,\"Description\":\"The dimension display info in a list, e.g. id or description\",\"Required\":false,\"Type\":\"string\"},\"dimensionName\":{\"Default\":null,\"Description\":\"The name of the dimension to open the hierarchy catalog for\",\"Required\":true,\"Type\":\"string\"},\"lisPageSize\":{\"Default\":20,\"Description\":\"The page size in a list view\",\"Required\":false,\"Type\":\"integer\"},\"listPreloadPageCount\":{\"Default\":8,\"Description\":\"The pages preloaded in a list view\",\"Required\":false,\"Type\":\"integer\"},\"listSearchSize\":{\"Default\":100,\"Description\":\"The amount of values searched in a list view\",\"Required\":false,\"Type\":\"integer\"},\"offerClipboard\":{\"Default\":false,\"Description\":\"Whether a clipboard for copy paste functionality should be available\",\"Required\":false,\"Type\":\"boolean\"},\"offerListView\":{\"Default\":false,\"Description\":\"Whether a list of members should be available for selection\",\"Required\":false,\"Type\":\"boolean\"},\"queryManagerName\":{\"Default\":null,\"Description\":\"The name of the query manager\",\"Required\":true,\"Type\":\"string\"},\"resizeable\":{\"Default\":true,\"Description\":\"Whether the dialog should be resizeable\",\"Required\":false,\"Type\":\"boolean\"},\"selectionMode\":{\"Default\":\"SingleSelectLeft\",\"Description\":\"The name of the dialog UI selection mode\",\"Required\":false,\"Type\":\"string\"},\"selectionRequired\":{\"Default\":false,\"Description\":\"Whether a selection is required\",\"Required\":false,\"Type\":\"boolean\"},\"title\":{\"Default\":null,\"Description\":\"The dialog title\",\"Required\":true,\"Type\":\"string\"}},\"Author\":\"Markus Weber\",\"Category\":\"Olap\",\"Class\":\"com.oFF.dialogs.filterdialog.FilterDialogHierarchyCatalogReferenceImpl\",\"Container\":\"Dialog\",\"Description\":\"Dialog for selecting a hierarchy from the dimension hierarchy catalog\",\"DisplayName\":\"Filter Dialog\",\"Icon\":\"\",\"InitialContainerFrame\":{\"Height\":null,\"Maximized\":false,\"Width\":null,\"X\":null,\"Y\":null},\"InitiallyOnLaunchpad\":false,\"Modules\":[\"ff8010.olap.ui\"],\"Name\":\"FilterDialogHierarchyCatalog\",\"Profiles\":[\"skylights\",\"sac\",\"olapui\"],\"SubSystems\":[\"Gui\"],\"listeners\":{\"beforeFilterChangeListener\":{\"Default\":null,\"Description\":\"A listener triggered just before the filter is updated, only if dynamic or layered filter parameter is set\",\"Required\":false},\"closeListener\":{\"Default\":null,\"Description\":\"A close listener of type IFilterDialogCloseListener\",\"Required\":false},\"listenerDisplayChange\":{\"Default\":null,\"Description\":\"A listener for display changes inside the dialog\",\"Required\":false},\"listenerSelectionChange\":{\"Default\":null,\"Description\":\"A listener for selection changes\",\"Required\":false}},\"objectArguments\":{\"defaultSelection\":{\"Default\":null,\"Description\":\"A list of values selected by default\",\"Required\":false}}}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("FilterDialogMeasureBasedFilter", "{\"AppStore\":false,\"Arguments\":{\"alwaysShowSelectionContainer\":{\"Default\":false,\"Description\":\"Whether the selection list should always be visible in the dialog\",\"Required\":false,\"Type\":\"boolean\"},\"layeredFilterName\":{\"Default\":null,\"Description\":\"Whether the dialog should parse and update a specific layered filter\",\"Required\":false,\"Type\":\"string\"},\"measureBasedFilter\":{\"Default\":null,\"Description\":\"The measure based filter to open the filter dialog for. The MBF member name and either this or a layered filter name must be set.\",\"Required\":false,\"Type\":\"string\"},\"measureBasedFilterMemberName\":{\"Default\":null,\"Description\":\"The name of the structure\\/dimension member to open the measure based filter dialog for\",\"Required\":true,\"Type\":\"string\"},\"offerEqualInRangeFilter\":{\"Default\":false,\"Description\":\"Whether comparison operator EQUAL should be availble in range view\",\"Required\":false,\"Type\":\"boolean\"},\"offerExclude\":{\"Default\":false,\"Description\":\"Whether an exclude toggle should be available\",\"Required\":false,\"Type\":\"boolean\"},\"offerRangeView\":{\"Default\":false,\"Description\":\"Whether it should be possible to view and define range values\",\"Required\":false,\"Type\":\"boolean\"},\"queryManagerName\":{\"Default\":null,\"Description\":\"The name of the query manager\",\"Required\":true,\"Type\":\"string\"},\"resizeable\":{\"Default\":true,\"Description\":\"Whether the dialog should be resizeable\",\"Required\":false,\"Type\":\"boolean\"},\"selectionMode\":{\"Default\":\"SingleSelectLeft\",\"Description\":\"The name of the dialog UI selection mode\",\"Required\":false,\"Type\":\"string\"},\"selectionRequired\":{\"Default\":false,\"Description\":\"Whether a selection is required\",\"Required\":false,\"Type\":\"boolean\"},\"title\":{\"Default\":null,\"Description\":\"The dialog title\",\"Required\":true,\"Type\":\"string\"}},\"Author\":\"Markus Weber\",\"Category\":\"Olap\",\"Class\":\"com.oFF.dialogs.filterdialog.FilterDialogMeasureBasedFilterReferenceImpl\",\"Container\":\"Dialog\",\"Description\":\"Dialog for filtering on measures\",\"DisplayName\":\"Filter Dialog\",\"Icon\":\"\",\"InitialContainerFrame\":{\"Height\":null,\"Maximized\":false,\"Width\":null,\"X\":null,\"Y\":null},\"InitiallyOnLaunchpad\":false,\"Modules\":[\"ff8010.olap.ui\"],\"Name\":\"FilterDialogMeasureBasedFilter\",\"Profiles\":[\"skylights\",\"sac\",\"olapui\"],\"SubSystems\":[\"Gui\"],\"listeners\":{\"beforeFilterChangeListener\":{\"Default\":null,\"Description\":\"A listener triggered just before the filter is updated, only if dynamic or layered filter parameter is set\",\"Required\":false,\"Type\":\"object\"},\"closeListener\":{\"Default\":null,\"Description\":\"A close listener of type IFilterDialogCloseListener\",\"Required\":false},\"listenerSelectionChange\":{\"Default\":null,\"Description\":\"A listener for selection changes\",\"Required\":false,\"Type\":\"object\"}},\"objectArguments\":{\"defaultSelection\":{\"Default\":null,\"Description\":\"A list of values selected by default\",\"Required\":false}}}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("FilterDialogVariable", "{\"AppStore\":false,\"Arguments\":{\"alwaysShowSelectionContainer\":{\"Default\":false,\"Description\":\"Whether the selection list should always be visible in the dialog\",\"Required\":false,\"Type\":\"boolean\"},\"childNodesPageSize\":{\"Default\":50,\"Description\":\"The page size of children in a tree\",\"Required\":false,\"Type\":\"integer\"},\"dimensionDisplayInfo\":{\"Default\":null,\"Description\":\"The dimension display info in a list, e.g. id or description\",\"Required\":false,\"Type\":\"string\"},\"lisPageSize\":{\"Default\":20,\"Description\":\"The page size in a list view\",\"Required\":false,\"Type\":\"integer\"},\"listPreloadPageCount\":{\"Default\":8,\"Description\":\"The pages preloaded in a list view\",\"Required\":false,\"Type\":\"integer\"},\"listSearchSize\":{\"Default\":100,\"Description\":\"The amount of values searched in a list view\",\"Required\":false,\"Type\":\"integer\"},\"offerClipboard\":{\"Default\":false,\"Description\":\"Whether a clipboard for copy paste functionality should be available\",\"Required\":false,\"Type\":\"boolean\"},\"offerListView\":{\"Default\":false,\"Description\":\"Whether a list of members should be available for selection\",\"Required\":false,\"Type\":\"boolean\"},\"queryManagerName\":{\"Default\":null,\"Description\":\"The name of the query manager\",\"Required\":true,\"Type\":\"string\"},\"resizeable\":{\"Default\":true,\"Description\":\"Whether the dialog should be resizeable\",\"Required\":false,\"Type\":\"boolean\"},\"selectionMode\":{\"Default\":\"SingleSelectLeft\",\"Description\":\"The name of the dialog UI selection mode\",\"Required\":false,\"Type\":\"string\"},\"selectionRequired\":{\"Default\":false,\"Description\":\"Whether a selection is required\",\"Required\":false,\"Type\":\"boolean\"},\"title\":{\"Default\":null,\"Description\":\"The dialog title\",\"Required\":true,\"Type\":\"string\"},\"variableName\":{\"Default\":null,\"Description\":\"The name of the variable to open the dialog for\",\"Required\":true,\"Type\":\"string\"}},\"Author\":\"Markus Weber\",\"Category\":\"Olap\",\"Class\":\"com.oFF.dialogs.filterdialog.FilterDialogVariableReferenceImpl\",\"Container\":\"Dialog\",\"Description\":\"Dialog for filtering on specific variable members\",\"DisplayName\":\"Filter Dialog\",\"Icon\":\"\",\"InitialContainerFrame\":{\"Height\":null,\"Maximized\":false,\"Width\":null,\"X\":null,\"Y\":null},\"InitiallyOnLaunchpad\":false,\"Modules\":[\"ff8010.olap.ui\"],\"Name\":\"FilterDialogVariable\",\"Profiles\":[\"skylights\",\"sac\",\"olapui\"],\"SubSystems\":[\"Gui\"],\"listeners\":{\"beforeFilterChangeListener\":{\"Default\":null,\"Description\":\"A listener triggered just before the filter is updated, only if dynamic or layered filter parameter is set\",\"Required\":false},\"closeListener\":{\"Default\":null,\"Description\":\"A close listener of type IFilterDialogCloseListener\",\"Required\":false},\"listenerDisplayChange\":{\"Default\":null,\"Description\":\"A listener for display changes inside the dialog\",\"Required\":false},\"listenerSelectionChange\":{\"Default\":null,\"Description\":\"A listener for selection changes\",\"Required\":false}},\"objectArguments\":{\"defaultSelection\":{\"Default\":null,\"Description\":\"A list of values selected by default\",\"Required\":false},\"externalValueHelpProcess\":{\"Default\":null,\"Description\":\"A modified value help process\",\"Required\":false},\"variable\":{\"Default\":null,\"Description\":\"The variable to open the dialog for. There is no query manager available in planning sequences and therefore the variable must be transferred via this object parameter.\",\"Required\":false}}}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("QueryInformationDialog", "{\"AppStore\":false,\"Author\":\"Conor White\",\"Category\":\"Olap\",\"Class\":\"com.oFF.dialogs.queryinformationdialog.OuQueryInformationDialog\",\"Container\":\"Dialog\",\"Description\":\"Dialog for showing query model information\",\"DisplayName\":\"QueryInformation\",\"Icon\":\"\",\"InitiallyOnLaunchpad\":false,\"Modules\":[\"ff8010.olap.ui\"],\"Name\":\"QueryInformationDialog\",\"Profiles\":[\"skylights\",\"sac\",\"olapui\"],\"SubSystems\":[\"Gui\",\"UserProfile\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("SelectHierarchyDialog", "{\"Author\":\"Michael Zakharenkov\",\"Category\":\"Olap\",\"Class\":\"com.oFF.dialogs.hierarchydialog.OuSelectHierarchyDialog\",\"Container\":\"Dialog\",\"Description\":\"Dialog for selecting hierarchies\",\"DisplayName\":\"Select Hierarchy Dialog\",\"Modules\":[\"ff8010.olap.ui\"],\"Name\":\"SelectHierarchyDialog\",\"Profiles\":[\"skylights\",\"sac\",\"olapui\"],\"SubSystems\":[\"Gui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("TopNDialog", "{\"Author\":\"Mairtin Keane\",\"Category\":\"Olap\",\"Class\":\"com.oFF.dialogs.hierarchydialog.OuTopNDialog\",\"Description\":\"Dialog for Top N\",\"Device\":\"Dialog\",\"DisplayName\":\"Top N Dialog\",\"Modules\":[\"ff8010.olap.ui\"],\"Name\":\"TopNDialog\",\"Profiles\":[\"skylights\",\"sac\",\"olapui\"],\"SubSystems\":[\"Gui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("AnalyticCards", "{\"Class\":\"com.oFF.programs.analyticcards.AnalyticCardsProgram\",\"Container\":\"Console\",\"Description\":\"AnalyticCards\",\"Modules\":[\"ff2260.ui.remote\",\"ff4330.olap.catalog.impl\",\"ff4340.olap.reference\",\"ff4390.olap.helpers\",\"ff4400.olap.providers\",\"ff4410.olap.ip.providers\",\"ff8050.application.ui\"],\"Name\":\"AnalyticCards\",\"Profiles\":[\"skylights\"],\"SubSystems\":[\"SystemLandscape\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("DataAnalyzer", "{\"AppStore\":true,\"Description\":\"Explore your data and instantly discover insights\",\"DisplayName\":\"Data Analyzer\",\"Icon\":\"${ff_mimes}\\/images\\/programicons\\/dataanalyzer.png\",\"InitialTitle\":\"Data Analyzer\",\"InitiallyOnLaunchpad\":false,\"Name\":\"DataAnalyzer\",\"Profiles\":[\"sac\",\"skylights\"],\"Ref\":\"GalaxyDataStudio\",\"StartArgs\":\"-docType=QueryBuilder -integration=sac -hideMenuBar=true -hideStatusBar=true -toolName='Data Analyzer' -queryBuilderAutoOpenDataSourcePicker=false -multiDocuments=false -queryBuilderMultiViews=false -advancedFeatures=false -mode=sac-ga\",\"StartArgsStructure\":{\"advancedFeatures\":false,\"docType\":\"QueryBuilder\",\"hideMenuBar\":true,\"hideStatusBar\":true,\"integration\":\"sac\",\"mode\":\"sac-ga\",\"multiDocuments\":false,\"queryBuilderAutoOpenDataSourcePicker\":false,\"queryBuilderMultiViews\":false,\"toolName\":\"Data Analyzer\"}}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("DatasourcePicker", "{\"AppStore\":false,\"Author\":\"Alexander Daum\",\"Category\":\"Olap\",\"Class\":\"com.oFF.dialogs.datasourcePicker.AuDatasourcePicker\",\"Container\":\"Dialog\",\"Description\":\"Picks a datasource\",\"DisplayName\":\"Data Source Picker\",\"Icon\":\"${ff_mimes}\\/images\\/programicons\\/datasourcePicker.png\",\"InitialContainerFrame\":{\"Height\":\"650px\",\"Maximized\":false,\"Width\":\"1000px\",\"X\":null,\"Y\":null},\"InitialTitle\":\"Data Source Picker\",\"InitiallyOnLaunchpad\":false,\"Modules\":[\"ff4330.olap.catalog.impl\",\"ff4400.olap.providers\",\"ff4410.olap.ip.providers\",\"ff8050.application.ui\"],\"Name\":\"DatasourcePicker\",\"Profiles\":[\"skylights\",\"sac\",\"olapui\"],\"SubSystems\":[\"SystemLandscape\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("GalaxyDataStudio", "{\"AppStore\":true,\"Author\":\"Firefly\",\"Category\":\"Olap\",\"Class\":\"com.oFF.programs.gds.AuGalaxyDataStudio\",\"Container\":\"Window\",\"Description\":\"Multi-document IDE for creating and displaying various documents including queries and spreadsheet\",\"DisplayName\":\"Galaxy Data Studio\",\"Icon\":\"${ff_mimes}\\/images\\/programicons\\/galaxydatastudio.png\",\"InitialContainerFrame\":{\"Height\":null,\"Maximized\":false,\"Width\":null,\"X\":null,\"Y\":null},\"InitiallyOnLaunchpad\":false,\"Modules\":[\"ff2650.visualization.impl\",\"ff2710.export.native\",\"ff3300.cell.engine\",\"ff3410.contextmenu.engine.impl\",\"ff4340.olap.reference\",\"ff4400.olap.providers\",\"ff4410.olap.ip.providers\",\"ff8050.application.ui\",\"ff4050.processor\"],\"Name\":\"GalaxyDataStudio\",\"Profiles\":[\"skylights\"],\"SubSystems\":[\"Gui\",\"SystemLandscape\",\"UserProfile\",\"CredentialsProvider\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("GalaxyStudio", "{\"AppStore\":true,\"Author\":\"Marcin Paskuda\",\"Category\":\"Quasar\",\"Class\":\"com.oFF.programs.galaxystudio.GsGalaxyStudio\",\"Container\":\"Window\",\"Description\":\"IDE for developing Quasar based apps\",\"DisplayName\":\"Galaxy Studio\",\"Icon\":\"${ff_mimes}\\/images\\/programicons\\/galaxystudio.png\",\"InitialContainerFrame\":{\"Height\":null,\"Maximized\":false,\"Width\":null,\"X\":null,\"Y\":null},\"InitiallyOnLaunchpad\":false,\"Modules\":[\"ff8050.application.ui\"],\"Name\":\"GalaxyStudio\",\"Profiles\":[\"skylights\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("LoadSystems", "{\"Class\":\"com.oFF.programs.analyticcards.LoadSystemsProgram\",\"Container\":\"Console\",\"Description\":\"Load System Landscape from Orca\",\"Modules\":[\"ff8050.application.ui\"],\"Name\":\"LoadSystems\",\"Profiles\":[\"skylights\"],\"SubSystems\":[\"SystemLandscape\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("Proteus", "{\"AppStore\":false,\"Author\":\"Marcin Paskuda\",\"Category\":\"Quasar\",\"Class\":\"com.oFF.programs.proteus.AuProteusShell\",\"Container\":\"Console\",\"Description\":\"Quasar to SAPUI5 converter\",\"DisplayName\":\"Proteus\",\"Icon\":\"\",\"InitialContainerFrame\":{\"Height\":null,\"Maximized\":false,\"Width\":null,\"X\":null,\"Y\":null},\"InitialTitle\":\"\",\"InitiallyOnLaunchpad\":false,\"Modules\":[\"ff8050.application.ui\"],\"Name\":\"Proteus\",\"Profiles\":[\"skylights\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("AppGallery", "{\"AppStore\":true,\"Author\":\"Marcin Paskuda\",\"Category\":\"Mobile\",\"Class\":\"com.oFF.apps.appgallery.AppGallery\",\"Container\":\"Window\",\"Description\":\"Example of a firefly ui program\",\"DisplayName\":\"App Gallery\",\"Icon\":\"${ff_mimes}\\/images\\/programicons\\/appgallery.png\",\"InitialContainerFrame\":{\"Height\":null,\"Maximized\":false,\"Width\":null,\"X\":null,\"Y\":null},\"InitiallyOnLaunchpad\":false,\"Modules\":[\"ff8090.poseidon\"],\"Name\":\"AppGallery\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("AtlasSimple", "{\"AppStore\":false,\"Author\":\"Marcin Paskuda\",\"Category\":\"SAC\",\"Class\":\"com.oFF.apps.poseidon.AtlasSimpleProgram\",\"Container\":\"Window\",\"Description\":\"Render SAC stories\",\"DisplayName\":\"Atlas Simple\",\"Icon\":\"${ff_mimes}\\/images\\/programicons\\/chart.png\",\"InitialContainerFrame\":{\"Height\":null,\"Maximized\":false,\"Width\":null,\"X\":null,\"Y\":null},\"Modules\":[\"ff8090.poseidon\"],\"Name\":\"AtlasSimple\",\"Profiles\":[\"skylights\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("MosesRefStory", "{\"AppStore\":true,\"Description\":\"Moses references story\",\"DisplayName\":\"Moses Ref Story\",\"InitialContainerFrame\":{\"Height\":null,\"Maximized\":false,\"Width\":null,\"X\":\"40%\",\"Y\":\"40px\"},\"InitiallyOnLaunchpad\":false,\"Name\":\"MosesRefStory\",\"Profiles\":[\"skylights\"],\"Ref\":\"AtlasSimple\",\"StartArgs\":\"moses 39B4ADC625FFA750D5DD27609AE03E9\",\"StartArgsStructure\":{\"StoryId\":\"39B4ADC625FFA750D5DD27609AE03E9\",\"SystemName\":\"moses\"}}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("NotosSimple", "{\"Class\":\"com.oFF.apps.poseidon.NotosSimpleProgram\",\"Container\":\"Window\",\"Description\":\"NotosSimple\",\"Modules\":[\"ff8020.poseidon\"],\"Name\":\"NotosSimple\",\"Profiles\":[\"skylights\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("Poseidon", "{\"AppStore\":false,\"Author\":\"Marcin Paskuda\",\"Category\":\"Quasar\",\"Class\":\"com.oFF.apps.PoseidonClient\",\"Container\":\"Window\",\"Description\":\"Extended quasar document renderer\",\"DisplayName\":\"Poseidon Client\",\"Icon\":\"${ff_mimes}\\/images\\/programicons\\/trident.png\",\"InitialContainerFrame\":{\"Height\":\"60vh\",\"Maximized\":false,\"Width\":\"60vw\",\"X\":null,\"Y\":null},\"Modules\":[\"ff4340.olap.reference\",\"ff4400.olap.providers\",\"ff8090.poseidon\"],\"Name\":\"Poseidon\",\"Profiles\":[\"skylights\"],\"SubSystems\":[\"SystemLandscape\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("PoseidonKitchenSink", "{\"AppStore\":true,\"Description\":\"Displays the the poseidon kitchen sink quasar document\",\"DisplayName\":\"Poseidon Kitchen Sink\",\"InitialContainerFrame\":{\"Maximized\":true},\"InitiallyOnLaunchpad\":false,\"Name\":\"PoseidonKitchenSink\",\"Profiles\":[\"skylights\",\"testui\"],\"Ref\":\"Poseidon\",\"StartArgs\":\"-file=${ff_sdk}\\/production\\/queries\\/simplex\\/PoseidonKitchenSink.qsa\",\"StartArgsStructure\":{\"file\":\"${ff_sdk}\\/production\\/queries\\/simplex\\/PoseidonKitchenSink.qsa\"}}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("S4SimpleDrilldown", "{\"AppStore\":true,\"Description\":\"S4 Simple Drilldown demo\",\"DisplayName\":\"S4 Simple Drilldown\",\"InitialContainerFrame\":{\"Height\":null,\"Maximized\":false,\"Width\":null,\"X\":\"40%\",\"Y\":\"500px\"},\"InitiallyOnLaunchpad\":false,\"Name\":\"S4SimpleDrilldown\",\"Profiles\":[\"skylights\"],\"Ref\":\"AtlasSimple\",\"StartArgs\":\"moses 39B4ADC625FFA750D5DD27609AE03E9\",\"StartArgsStructure\":{\"StoryId\":\"39B4ADC625FFA750D5DD27609AE03E9\",\"SystemName\":\"moses\"}}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("Atlas", "{\"AppStore\":true,\"Author\":\"Marcin Paskuda\",\"Category\":\"SAC\",\"Class\":\"com.oFF.programs.storyconnector.ScAtlas\",\"Container\":\"Window\",\"Description\":\"SAC Story and Widget renderer\",\"DisplayName\":\"SAC Story Connector\",\"Icon\":\"${ff_mimes}\\/images\\/programicons\\/atlasstoryconnector.png\",\"InitialContainerFrame\":{\"Height\":null,\"Maximized\":false,\"Width\":null,\"X\":null,\"Y\":null},\"InitiallyOnLaunchpad\":false,\"Modules\":[\"ff4330.olap.catalog.impl\",\"ff4340.olap.reference\",\"ff4390.olap.helpers\",\"ff4400.olap.providers\",\"ff4410.olap.ip.providers\",\"ff8095.utils.ui\"],\"Name\":\"Atlas\",\"Profiles\":[\"skylights\"],\"SubSystems\":[\"SystemLandscape\",\"CredentialsProvider\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("OlapDialogTester", "{\"AppStore\":true,\"Author\":\"Alexander Daum\",\"Category\":\"Olap\",\"Class\":\"com.oFF.programs.olapdialogtester.AuOlapDialogTester\",\"Container\":\"Window\",\"Description\":\"Generic Olap Dialog Tester\",\"DisplayName\":\"Olap Dialog Tester\",\"Icon\":\"${ff_mimes}\\/images\\/programicons\\/olapdialogtester.png\",\"InitialContainerFrame\":{\"Height\":\"70%\",\"Maximized\":false,\"Width\":\"50%\",\"X\":null,\"Y\":null},\"InitialTitle\":\"Generic Olap Dialog Tester\",\"InitiallyOnLaunchpad\":false,\"Modules\":[\"ff4330.olap.catalog.impl\",\"ff4400.olap.providers\",\"ff4410.olap.ip.providers\",\"ff8095.utils.ui\"],\"Name\":\"OlapDialogTester\",\"Profiles\":[\"testui\"],\"SubSystems\":[\"SystemLandscape\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("Butterfly", "{\"Author\":\"Halil Bugdayci\",\"Class\":\"com.oFF.programs.butterfly.ButterflyProgram\",\"Container\":\"Window\",\"Description\":\"UI of Butterfly\",\"DisplayName\":\"Butterfly\",\"Modules\":[\"ff8095.utils.ui\"],\"Name\":\"Butterfly\",\"SubSystems\":[]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("FilterDialogTest", "{\"AppStore\":true,\"Author\":\"Markus Weber\",\"Category\":\"Olap\",\"Class\":\"com.oFF.programs.filterdialog.FilterDialogTestProgram\",\"Container\":\"Window\",\"Description\":\"Filter dialog testsuite\",\"DisplayName\":\"Filter Dialog Testsuite\",\"Icon\":\"${ff_mimes}\\/images\\/programicons\\/filterDialog.png\",\"InitialContainerFrame\":{\"Height\":\"70%\",\"Maximized\":false,\"Width\":\"70%\",\"X\":null,\"Y\":null},\"InitialTitle\":\"Filter dialog test app\",\"InitiallyOnLaunchpad\":false,\"Modules\":[\"ff4330.olap.catalog.impl\",\"ff4340.olap.reference\",\"ff4400.olap.providers\",\"ff4410.olap.ip.providers\",\"ff8095.utils.ui\"],\"Name\":\"FilterDialogTest\",\"Profiles\":[\"testui\"],\"SubSystems\":[\"SystemLandscape\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("FirstAidTest", "{\"AppStore\":true,\"Author\":\"Alexander Daum\",\"Category\":\"Olap\",\"Class\":\"com.oFF.programs.supportplatform.FirstAidTestProgram\",\"Container\":\"Window\",\"Description\":\"Testsuite for FirstAid\",\"DisplayName\":\"FirstAidTest\",\"Icon\":\"${ff_mimes}\\/images\\/programicons\\/firstAid.png\",\"InitialContainerFrame\":{\"Height\":\"70%\",\"Maximized\":false,\"Width\":\"70%\",\"X\":null,\"Y\":null},\"InitialTitle\":\"Testsuite for FirstAid\",\"InitiallyOnLaunchpad\":false,\"Modules\":[\"ff8095.utils.ui\"],\"Name\":\"FirstAidTest\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("Gyros", "{\"AppStore\":true,\"Author\":\"Alexander Daum\",\"Category\":\"Olap\",\"Class\":\"com.oFF.programs.gyros.Gyros\",\"Container\":\"Window\",\"Description\":\"Variable dialog testsuite\",\"DisplayName\":\"Gyros\",\"Icon\":\"${ff_mimes}\\/images\\/programicons\\/gyros.png\",\"InitialContainerFrame\":{\"Height\":\"70%\",\"Maximized\":false,\"Width\":\"70%\",\"X\":null,\"Y\":null},\"InitialTitle\":\"Gyros variable dialog testsuite\",\"InitiallyOnLaunchpad\":false,\"Modules\":[\"ff4330.olap.catalog.impl\",\"ff4400.olap.providers\",\"ff4410.olap.ip.providers\",\"ff8095.utils.ui\"],\"Name\":\"Gyros\",\"Profiles\":[\"testui\"],\"SubSystems\":[\"SystemLandscape\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("Kratos", "{\"AppStore\":true,\"Author\":\"Marcin Paskuda\",\"Category\":\"Olap\",\"Class\":\"com.oFF.programs.queryviewer.QvKratos\",\"Container\":\"Window\",\"Description\":\"View query information and more\",\"DisplayName\":\"Query Viewer\",\"Icon\":\"${ff_mimes}\\/images\\/programicons\\/kratosviewer.png\",\"InitialContainerFrame\":{\"Height\":null,\"Maximized\":false,\"Width\":null,\"X\":null,\"Y\":null},\"InitiallyOnLaunchpad\":true,\"Modules\":[\"ff8095.utils.ui\"],\"Name\":\"Kratos\",\"Profiles\":[\"skylights\"],\"SubSystems\":[\"SystemLandscape\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("Podilates", "{\"AppStore\":true,\"Author\":\"Andreas Ratzka\",\"Category\":\"Olap\",\"Class\":\"com.oFF.programs.dimensiondialog.DimensionDialogTestProgram\",\"Container\":\"Window\",\"Description\":\"Dimension dialog testsuite\",\"DisplayName\":\"\u03C0\u03BF\u03B4\u03B7\u03BB\u03AC\u03C4\u03B7\u03C2\",\"Icon\":\"${ff_mimes}\\/images\\/programicons\\/podilates.png\",\"InitialContainerFrame\":{\"Height\":null,\"Maximized\":false,\"Width\":null,\"X\":null,\"Y\":null},\"InitiallyOnLaunchpad\":false,\"Modules\":[\"ff4330.olap.catalog.impl\",\"ff4340.olap.reference\",\"ff4400.olap.providers\",\"ff4410.olap.ip.providers\",\"ff8095.utils.ui\"],\"Name\":\"Podilates\",\"Profiles\":[\"testui\"],\"SubSystems\":[\"SystemLandscape\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("Aidos", "{\"AppStore\":true,\"Author\":\"Marcin Paskuda\",\"Category\":\"Olap\",\"Class\":\"com.oFF.programs.sactabledemo.StdAidos\",\"Container\":\"Window\",\"Description\":\"SAC Table demo program\",\"DisplayName\":\"SAC Table demo\",\"Icon\":\"${ff_mimes}\\/images\\/programicons\\/aidossactabledemo.png\",\"InitialContainerFrame\":{\"Height\":null,\"Maximized\":false,\"Width\":null,\"X\":null,\"Y\":null},\"InitiallyOnLaunchpad\":false,\"Modules\":[\"ff8095.utils.ui\"],\"Name\":\"Aidos\",\"Profiles\":[\"testui\"],\"SubSystems\":[\"Gui\",\"SystemLandscape\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("sheet", "{\"AppStore\":true,\"Author\":\"Marco Pesarese\",\"Category\":\"System\",\"Class\":\"com.oFF.programs.spreadsheet.Spreadsheet\",\"Container\":\"Window\",\"Description\":\"Example of a excel like sheet\",\"DisplayName\":\"Sheet\",\"Icon\":\"${ff_mimes}\\/images\\/programicons\\/sheet.png\",\"InitialContainerFrame\":{\"Height\":null,\"Maximized\":false,\"Width\":null,\"X\":null,\"Y\":null},\"InitiallyOnLaunchpad\":false,\"Modules\":[\"ff8095.utils.ui\"],\"Name\":\"sheet\",\"Profiles\":[\"skylights\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("FireflyStudio", "{\"AppStore\":false,\"Author\":\"Firefly\",\"Category\":\"System\",\"Class\":\"com.oFF.studio.StudioClient\",\"Container\":\"Window\",\"Description\":\"Firefly desktop\",\"DisplayName\":\"Firefly Studio\",\"Icon\":\"${ff_mimes}\\/images\\/programicons\\/fireflydesktop.png\",\"InitialContainerFrame\":{\"Height\":null,\"Maximized\":false,\"Width\":null,\"X\":null,\"Y\":null},\"InitialTitle\":\"\",\"InitiallyOnLaunchpad\":false,\"Modules\":[\"ff2210.ui.native\",\"ff8100.studio\"],\"Name\":\"FireflyStudio\",\"OptionalSubSystems\":[\"SystemLandscape\"],\"Profiles\":[\"skylights\"],\"SubSystems\":[\"UserProfile\",\"Cache\",\"CredentialsProvider\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("HermesShell", "{\"AppStore\":false,\"Author\":\"Marcin Paskuda\",\"Category\":\"System\",\"Class\":\"com.oFF.hermesshell.StHermesShell\",\"Container\":\"Window\",\"Description\":\"A firefly shell which is single program oriented\",\"DisplayName\":\"Firefly shell\",\"Icon\":\"${ff_mimes}\\/images\\/programicons\\/hermesshell.png\",\"InitialContainerFrame\":{\"Height\":null,\"Maximized\":false,\"Width\":null,\"X\":null,\"Y\":null},\"InitialTitle\":\"\",\"InitiallyOnLaunchpad\":false,\"Modules\":[\"ff2210.ui.native\",\"ff8100.studio\"],\"Name\":\"HermesShell\",\"OptionalSubSystems\":[\"Gui\",\"SystemLandscape\"],\"Profiles\":[\"skylights\"],\"SubSystems\":[\"UserProfile\",\"Cache\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("StudioAppStoreDialog", "{\"AppStore\":false,\"Author\":\"Marcin Paskuda\",\"Category\":\"System\",\"Class\":\"com.oFF.dialogs.appstore.SxAppStoreDialog\",\"Container\":\"Dialog\",\"Description\":\"Firefly app store which allows to install firefly programs in studio\",\"DisplayName\":\"App Store\",\"Icon\":\"\",\"InitialContainerFrame\":{\"Height\":null,\"Maximized\":false,\"Width\":null,\"X\":null,\"Y\":null},\"InitiallyOnLaunchpad\":false,\"Modules\":[\"ff8100.studio\"],\"Name\":\"StudioAppStoreDialog\",\"Profiles\":[\"skylights\"],\"SubSystems\":[\"Gui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("DummyProgram", "{\"Class\":\"com.oFF.tools.dll.DummyProgram\",\"Container\":\"Console\",\"Description\":\"DummyProgram\",\"Modules\":[\"ff8110.studio.ui\"],\"Name\":\"DummyProgram\",\"Profiles\":[\"testui\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("Epiphagi", "{\"AppStore\":true,\"Author\":\"Marcin Paskuda\",\"Category\":\"System\",\"Class\":\"com.oFF.programs.headlessrenderer.HrEpiphagi\",\"Container\":\"Window\",\"Description\":\"Render programs headless and export to a html file\",\"DisplayName\":\"Headless program renderer\",\"Icon\":\"${ff_mimes}\\/images\\/programicons\\/epiphagi.png\",\"InitialContainerFrame\":{\"Height\":null,\"Maximized\":false,\"Width\":null,\"X\":null,\"Y\":null},\"InitiallyOnLaunchpad\":false,\"Modules\":[\"ff8110.studio.ui\"],\"Name\":\"Epiphagi\",\"Profiles\":[\"skylights\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("InADocu", "{\"Class\":\"com.oFF.apps.ina.SxInADocu\",\"Container\":\"Window\",\"Description\":\"InADocu (Obsolete)\",\"Modules\":[\"ff8110.studio.ui\"],\"Name\":\"InADocu\",\"Profiles\":[\"skylights\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("Query", "{\"Class\":\"com.oFF.apps.misc.SxQuery\",\"Container\":\"Window\",\"Description\":\"Query (Obsolete)\",\"Modules\":[\"ff8110.studio.ui\"],\"Name\":\"Query\",\"Profiles\":[\"skylights\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("UiLab", "{\"Class\":\"com.oFF.apps.misc.SxUiLab\",\"Container\":\"Window\",\"Description\":\"UiLab (Obsolete)\",\"Modules\":[\"ff8100.studio.ui\"],\"Name\":\"UiLab\",\"Profiles\":[\"skylights\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("VariablePrompt", "{\"AppStore\":true,\"Author\":\"Alexander Daum\",\"Category\":\"System\",\"Class\":\"com.oFF.apps.misc.SxVariablePrompt\",\"Container\":\"Window\",\"Description\":\"Variable prompt demo program (Obsolete)\",\"DisplayName\":\"Variable Prompt\",\"Icon\":\"${ff_mimes}\\/images\\/programicons\\/variableprompt.png\",\"InitialContainerFrame\":{\"Height\":null,\"Maximized\":false,\"Width\":null,\"X\":null,\"Y\":null},\"InitiallyOnLaunchpad\":false,\"Modules\":[\"ff8100.studio.ui\"],\"Name\":\"VariablePrompt\",\"Profiles\":[\"skylights\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("VizViewer", "{\"Class\":\"com.oFF.apps.vizviewer.SxVizViewer\",\"Container\":\"Window\",\"Description\":\"VizViewer (Obsolete)\",\"Modules\":[\"ff8110.studio.ui\"],\"Name\":\"VizViewer\",\"Profiles\":[\"skylights\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("qprofiler", "{\"Class\":\"com.oFF.olap.profiler.QProfiler\",\"Container\":\"Console\",\"Description\":\"qprofiler\",\"Modules\":[\"ff8110.studio.ui\"],\"Name\":\"qprofiler\",\"Profiles\":[\"skylights\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("Gofg", "{\"AppStore\":true,\"Author\":\"Christopher Homberger\",\"Category\":\"System\",\"Class\":\"com.oFF.programs.gofg.Gofg\",\"Description\":\"Diagram Viewer\",\"Device\":\"Window\",\"DisplayName\":\"Grammar of Graphics\",\"InitialWindowFrame\":{\"Height\":null,\"Maximized\":true,\"Width\":null,\"X\":null,\"Y\":null},\"InitialWindowTitle\":\"Gofg\",\"InitiallyOnLaunchpad\":false,\"Modules\":[\"ff8111.val.ui\"],\"Name\":\"Gofg\",\"Profiles\":[\"skylights\",\"sac\"],\"StartArgs\":\"\",\"SubSystems\":[\"SystemLandscape\"]}"));
		oFF.ProgramRegistration.setProgramManifest(oFF.ProgramManifest.createByJsonString("UiTestRunner", "{\"AppStore\":true,\"Author\":\"Djelloul Belarbi\",\"Category\":\"Test\",\"Class\":\"com.oFF.test.application.testrunnerui.UiTestRunner\",\"Container\":\"Window\",\"Description\":\"Test Runner\",\"DisplayName\":\"Test Runner\",\"Icon\":\"${ff_mimes}\\/images\\/programicons\\/testrunner2.png\",\"InitialContainerFrame\":{\"Height\":\"70%\",\"Maximized\":false,\"Width\":\"70%\",\"X\":null,\"Y\":null},\"InitialTitle\":\"Ui Test Runner\",\"InitiallyOnLaunchpad\":false,\"Modules\":[\"ff4330.olap.catalog.impl\",\"ff4400.olap.providers\",\"ff4410.olap.ip.providers\",\"ff8990.application.tests\",\"ff8050.application.ui\"],\"Name\":\"UiTestRunner\",\"Profiles\":[\"testui\"],\"SubSystems\":[\"SystemLandscape\"]}"));
	}
};

oFF.ProgramUtils = {

	createArgStructureFromString:function(programMetadata, argLine)
	{
			var argList = oFF.ProgramUtils.createArgValueList(argLine);
		var argStructure = oFF.ProgramUtils.createArgStructureFromList(programMetadata.getArgDefinitions(), argList, 0);
		return argStructure;
	},
	createArgStructureFromList:function(argDefList, argList, startOffset)
	{
			var initArgsStructure = oFF.PrFactory.createStructure();
		if (argList.size() > startOffset)
		{
			var offset = startOffset;
			for (; offset < argList.size(); offset++)
			{
				var value = argList.get(offset);
				if (oFF.XString.startsWith(value, "-"))
				{
					var delimColon = oFF.XString.indexOf(value, ":");
					var delimAssign = oFF.XString.indexOf(value, "=");
					var delim;
					if (delimAssign !== -1 && delimColon === -1)
					{
						delim = delimAssign;
					}
					else if (delimColon !== -1 && delimAssign === -1)
					{
						delim = delimColon;
					}
					else if (delimColon !== -1 && delimAssign !== -1)
					{
						if (delimColon < delimAssign)
						{
							delim = delimColon;
						}
						else
						{
							delim = delimAssign;
						}
					}
					else
					{
						delim = -1;
					}
					var leftSide = null;
					var rightSide = null;
					if (delim !== -1)
					{
						leftSide = oFF.XString.trim(oFF.XString.substring(value, 1, delim));
						rightSide = oFF.XString.trim(oFF.XString.substring(value, delim + 1, -1));
					}
					else
					{
						leftSide = oFF.XString.trim(oFF.XString.substring(value, 1, -1));
					}
					var argMd = argDefList.getByKey(leftSide);
					if (oFF.notNull(argMd))
					{
						var valueType = argMd.getValueType();
						if (valueType === oFF.XValueType.BOOLEAN)
						{
							if (oFF.XStringUtils.isNullOrEmpty(rightSide))
							{
								initArgsStructure.putBoolean(leftSide, true);
							}
							else
							{
								initArgsStructure.putBoolean(leftSide, oFF.XString.isEqual(rightSide, "true"));
							}
						}
						else if (valueType === oFF.XValueType.INTEGER)
						{
							if (oFF.XStringUtils.isNullOrEmpty(rightSide))
							{
								initArgsStructure.putInteger(leftSide, 0);
							}
							else
							{
								var intValue = oFF.XInteger.convertFromStringWithDefault(rightSide, 0);
								initArgsStructure.putInteger(leftSide, intValue);
							}
						}
						else
						{
							initArgsStructure.putString(leftSide, rightSide);
						}
					}
				}
				else
				{
					break;
				}
			}
			var theParameters = oFF.ProgramUtils.getParameters(argDefList);
			for (var i = 0; i + offset < argList.size() && i < theParameters.size(); i++)
			{
				var parameter = theParameters.get(i);
				var value2;
				if (parameter.getValueType() === oFF.XValueType.ARRAY)
				{
					var theList = initArgsStructure.putNewList(parameter.getName());
					for (var m = i + offset; m < argList.size(); m++)
					{
						value2 = argList.get(m);
						theList.addString(value2);
					}
					break;
				}
				value2 = argList.get(i + offset);
				initArgsStructure.putString(parameter.getName(), value2);
			}
		}
		return initArgsStructure;
	},
	generateHelp:function(programMetadata)
	{
			var buffer = oFF.XStringBuffer.create();
		var argumentMetadata = programMetadata.getArgDefinitions();
		var hasOptions = false;
		var hasParams = false;
		for (var k = 0; k < argumentMetadata.size(); k++)
		{
			var argMd3 = argumentMetadata.get(k);
			if (argMd3.isParameter())
			{
				hasParams = true;
			}
			else
			{
				hasOptions = true;
			}
		}
		buffer.append("SYNTAX ").appendNewLine();
		buffer.append("   prgName ");
		if (hasOptions)
		{
			buffer.append("[OPTIONS] ");
		}
		var firstLine;
		if (hasParams)
		{
			for (var i = 0; i < argumentMetadata.size(); i++)
			{
				var argMd = argumentMetadata.get(i);
				if (argMd.isParameter() === true)
				{
					buffer.append(argMd.getName()).append(" ");
				}
			}
			buffer.appendNewLine();
			buffer.appendNewLine();
			var innerBuffer = oFF.TwoColumnBuffer.create();
			firstLine = true;
			for (var m = 0; m < argumentMetadata.size(); m++)
			{
				var argMd4 = argumentMetadata.get(m);
				if (argMd4.isParameter() === true)
				{
					if (firstLine === false)
					{
						innerBuffer.appendNewLine();
					}
					else
					{
						firstLine = false;
					}
					innerBuffer.append("   ").append(argMd4.getName());
					innerBuffer.nextColumn();
					innerBuffer.append(argMd4.getText());
				}
			}
			buffer.append(innerBuffer.toString());
		}
		if (hasOptions)
		{
			buffer.appendNewLine();
			buffer.appendNewLine();
			buffer.append("OPTIONS").appendNewLine();
			var innerBuffer2 = oFF.TwoColumnBuffer.create();
			firstLine = true;
			for (var j = 0; j < argumentMetadata.size(); j++)
			{
				var argMd2 = argumentMetadata.get(j);
				if (argMd2.isParameter() === false)
				{
					if (firstLine === false)
					{
						innerBuffer2.appendNewLine();
					}
					else
					{
						firstLine = false;
					}
					innerBuffer2.append("  -").append(argMd2.getName());
					if (argMd2.getValueType() === oFF.XValueType.BOOLEAN)
					{
						innerBuffer2.append("[:");
						innerBuffer2.append(argMd2.getPossibleValues());
						innerBuffer2.append("]");
					}
					else
					{
						innerBuffer2.append(":");
						innerBuffer2.append(argMd2.getPossibleValues());
					}
					innerBuffer2.nextColumn();
					innerBuffer2.append(argMd2.getText());
				}
			}
			buffer.append(innerBuffer2.toString());
		}
		return buffer.toString();
	},
	createArgValueList:function(argLine)
	{
			var result = null;
		if (oFF.XStringUtils.isNotNullAndNotEmpty(argLine))
		{
			var trimmed = oFF.XString.trim(argLine);
			if (oFF.XStringUtils.isNotNullAndNotEmpty(trimmed))
			{
				result = oFF.XStringTokenizer.splitString(trimmed, " ");
			}
		}
		var finalArgList = oFF.XListOfString.create();
		var tmpArgStrBuffer = oFF.XStringBuffer.create();
		if (oFF.notNull(result))
		{
			for (var i = 0; i < result.size(); i++)
			{
				var tmpString = result.get(i);
				var firstQuote = oFF.XString.indexOf(tmpString, "'");
				var lastQuote = oFF.XString.lastIndexOf(tmpString, "'");
				if (firstQuote !== -1 && lastQuote !== -1 && firstQuote === lastQuote)
				{
					if (!oFF.XString.endsWith(tmpString, "'"))
					{
						tmpArgStrBuffer.append(tmpString);
					}
					else
					{
						tmpArgStrBuffer.append(" ");
						tmpArgStrBuffer.append(tmpString);
						var finalArgStr = tmpArgStrBuffer.toString();
						finalArgStr = oFF.XString.replace(finalArgStr, "'", "");
						finalArgList.add(finalArgStr);
						tmpArgStrBuffer.clear();
					}
				}
				else if (tmpArgStrBuffer.length() !== 0)
				{
					tmpArgStrBuffer.append(" ");
					tmpArgStrBuffer.append(tmpString);
				}
				else
				{
					var noQuotesStr = oFF.XString.replace(tmpString, "'", "");
					finalArgList.add(noQuotesStr);
				}
			}
		}
		return finalArgList;
	},
	getParameters:function(argDefList)
	{
			var parameterList = oFF.XList.create();
		for (var i = 0; i < argDefList.size(); i++)
		{
			var arg = argDefList.get(i);
			if (arg.isParameter())
			{
				parameterList.add(arg);
			}
		}
		return parameterList;
	}
};

oFF.DefaultSession = function() {};
oFF.DefaultSession.prototype = new oFF.XObject();
oFF.DefaultSession.prototype._ff_c = "DefaultSession";

oFF.DefaultSession.create = function()
{
	return oFF.DefaultSession.createWithVersion(-1);
};
oFF.DefaultSession.createWithVersion = function(version)
{
	var environmentConfig = oFF.XHashMapOfStringByString.create();
	if (version !== -1)
	{
		environmentConfig.put(oFF.XEnvironmentConstants.XVERSION, oFF.XInteger.convertToString(version));
	}
	var kernel = oFF.Kernel.create(environmentConfig);
	var session = kernel.getKernelProcessBase();
	return session;
};

oFF.SigSelParser = function() {};
oFF.SigSelParser.prototype = new oFF.XObject();
oFF.SigSelParser.prototype._ff_c = "SigSelParser";

oFF.SigSelParser.create = function()
{
	var newObj = new oFF.SigSelParser();
	newObj.setup();
	return newObj;
};
oFF.SigSelParser.prototype.m_defaultComponentType = null;
oFF.SigSelParser.prototype.setup = function()
{
	this.m_defaultComponentType = null;
};
oFF.SigSelParser.prototype.setDefaultComponentType = function(type)
{
	this.m_defaultComponentType = type;
};
oFF.SigSelParser.prototype.parse = function(sigSelExpression)
{
	var segment;
	var splitString;
	var ops = oFF.XList.create();
	var messages = oFF.MessageManagerSimple.createMessageManager();
	if (oFF.notNull(sigSelExpression))
	{
		var hasSchema = false;
		if (oFF.XString.startsWith(sigSelExpression, "dp:") || oFF.XString.startsWith(sigSelExpression, "ui:") || oFF.XString.startsWith(sigSelExpression, "env:") || oFF.XString.startsWith(sigSelExpression, "dialog:"))
		{
			hasSchema = true;
		}
		if (hasSchema || oFF.XString.containsString(sigSelExpression, "||"))
		{
			splitString = oFF.XStringTokenizer.splitString(sigSelExpression, "||");
			for (var k = 0; k < splitString.size(); k++)
			{
				segment = splitString.get(k);
				var uri = oFF.XUri.createFromUrl(segment);
				var op2 = oFF.SigSelOperation.create();
				ops.add(op2);
				var protocolType = uri.getProtocolType();
				var domain = oFF.SigSelDomain.CONTEXT;
				if (protocolType === oFF.ProtocolType.UI)
				{
					domain = oFF.SigSelDomain.UI;
				}
				else if (protocolType === oFF.ProtocolType.DATAPROVIDER)
				{
					domain = oFF.SigSelDomain.DATA;
				}
				else if (protocolType === oFF.ProtocolType.DIALOG)
				{
					domain = oFF.SigSelDomain.DIALOG;
				}
				else if (protocolType === oFF.ProtocolType.ENVVARS)
				{
					domain = oFF.SigSelDomain.ENVVARS;
				}
				op2.setDomain(domain);
				var path = uri.getPath();
				if (oFF.notNull(path))
				{
					var type = null;
					var pos = oFF.XString.indexOf(path, ".");
					if (pos !== -1)
					{
						type = oFF.XString.substring(path, pos + 1, -1);
						path = oFF.XString.substring(path, 0, pos);
					}
					if (oFF.XStringUtils.isNotNullAndNotEmpty(path))
					{
						if (oFF.XString.isEqual(path, "*"))
						{
							op2.setOperationType(oFF.SigSelType.WILDCARD);
						}
						else if (oFF.XString.startsWith(path, "!"))
						{
							op2.setOperationType(oFF.SigSelType.MATCH_ID);
							op2.setId(oFF.XString.substring(path, 1, -1));
						}
						else
						{
							op2.setOperationType(oFF.SigSelType.MATCH_NAME);
							op2.setName(path);
						}
					}
					else
					{
						op2.setOperationType(oFF.SigSelType.MATCH);
					}
					if (oFF.notNull(type))
					{
						var componentType = oFF.XComponentType.lookupComponentType(type);
						op2.setSelectedComponentType(componentType);
					}
				}
				var fragment = uri.getFragment();
				op2.setSelectedProperty(fragment);
			}
		}
		else
		{
			splitString = oFF.XStringTokenizer.splitString(sigSelExpression, ",");
			for (var i = 0; i < splitString.size(); i++)
			{
				segment = splitString.get(i);
				var folderString = oFF.XStringTokenizer.splitString(segment, "/");
				var parent = null;
				for (var j = 0; j < folderString.size(); j++)
				{
					var op = oFF.SigSelOperation.create();
					if (j === 0)
					{
						ops.add(op);
					}
					else if (oFF.notNull(parent))
					{
						parent.setChild(op);
					}
					var element = folderString.get(j);
					if (oFF.XString.startsWith(element, "#"))
					{
						op.setDomain(oFF.SigSelDomain.UI);
						element = oFF.XString.substring(element, 1, -1);
					}
					else if (oFF.XString.startsWith(element, "%"))
					{
						op.setDomain(oFF.SigSelDomain.DATA);
						element = oFF.XString.substring(element, 1, -1);
					}
					if (oFF.XString.startsWith(element, "?"))
					{
						var typeSel = null;
						var end = oFF.XString.indexOf(element, ":");
						if (end !== -1)
						{
							typeSel = oFF.XString.substring(element, 1, end);
							element = oFF.XString.substring(element, end + 1, -1);
						}
						else
						{
							typeSel = oFF.XString.substring(element, 1, -1);
							element = null;
						}
						op.setSelectedComponentType(oFF.XComponentType.lookupComponentType(typeSel));
					}
					else
					{
						op.setSelectedComponentType(this.m_defaultComponentType);
					}
					var isId = false;
					if (oFF.XStringUtils.isNotNullAndNotEmpty(element))
					{
						if (oFF.XString.startsWith(element, "~"))
						{
							element = oFF.XString.substring(element, 1, -1);
							isId = true;
						}
					}
					var opType = oFF.SigSelType.MATCH;
					if (oFF.notNull(element))
					{
						var propIndex = oFF.XString.indexOf(element, ".");
						if (propIndex !== -1)
						{
							var property = oFF.XString.substring(element, propIndex + 1, -1);
							op.setSelectedProperty(property);
							element = oFF.XString.substring(element, 0, propIndex);
						}
						var arrayStart = oFF.XString.indexOf(element, "[");
						if (arrayStart !== -1)
						{
							var arrayEnd = oFF.XString.indexOfFrom(element, "]", arrayStart);
							if (arrayEnd === -1)
							{
								messages.addError(0, "Array end not found");
							}
							else
							{
								var arrayContent = oFF.XString.substring(element, arrayStart + 1, arrayEnd);
								arrayContent = oFF.XString.trim(arrayContent);
								if (oFF.XString.size(arrayContent) > 0)
								{
									var firstChar = oFF.XString.getCharAt(arrayContent, 0);
									if (firstChar >= 48 && firstChar <= 57)
									{
										var number = oFF.XInteger.convertFromStringWithDefault(arrayContent, -1);
										if (number >= 0)
										{
											op.setIndexType(oFF.SigSelIndexType.POSITION);
											op.setIndexPosition(number);
										}
										else
										{
											messages.addError(0, "Not a valid index");
										}
									}
									else
									{
										op.setIndexType(oFF.SigSelIndexType.NAME);
										op.setIndexName(arrayContent);
									}
								}
							}
							element = oFF.XString.substring(element, 0, arrayStart);
						}
						if (oFF.XString.isEqual(element, "*"))
						{
							opType = oFF.SigSelType.WILDCARD;
						}
						else
						{
							if (isId)
							{
								op.setId(element);
								opType = oFF.SigSelType.MATCH_ID;
							}
							else
							{
								op.setName(element);
								opType = oFF.SigSelType.MATCH_NAME;
							}
						}
					}
					op.setOperationType(opType);
					parent = op;
				}
			}
		}
	}
	return oFF.ExtResult.create(ops, messages);
};

oFF.SubSystemFactory = function() {};
oFF.SubSystemFactory.prototype = new oFF.XObject();
oFF.SubSystemFactory.prototype._ff_c = "SubSystemFactory";

oFF.SubSystemFactory.s_factories = null;
oFF.SubSystemFactory.registerFactory = function(subSystemType, factory)
{
	if (oFF.isNull(oFF.SubSystemFactory.s_factories))
	{
		oFF.SubSystemFactory.s_factories = oFF.XHashMapByString.create();
	}
	oFF.SubSystemFactory.s_factories.put(subSystemType.getName(), factory);
};
oFF.SubSystemFactory.create = function(subSystemType, process)
{
	var subSystem = null;
	if (oFF.notNull(oFF.SubSystemFactory.s_factories))
	{
		var name = subSystemType.getName();
		var factory = oFF.SubSystemFactory.s_factories.getByKey(name);
		if (oFF.notNull(factory))
		{
			subSystem = factory.newSubSystem(process);
		}
	}
	return subSystem;
};

oFF.UserProfileAdapterLdap = {

	DOC_FORMAT:"ldap",
	HEADER:"header",
	DEFAULTS:"defaults",
	DEFAULT_USER_THUMBNAIL:"data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEBKwErAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAALCABkAGQBAREA/8QAHgABAAICAgMBAAAAAAAAAAAAAAoLCAkGBwEDBQL/xAAwEAAABgIBAgMHBAMBAAAAAAABAgMEBQYABwgJEgoRExQVFiFSktMiMTJBFxhRI//aAAgBAQAAPwCfxjGMYxjGMYxjGMZq/wCqD1bOKHSi1Kz2DyCnXszdbWR8jq3SlOMzdbF2Q/YlD2lVg1dLJNYOsx6yiKUxbZpRCKYGWTbNwkJJVtHLwKuS/jH+pVs+fkS8eKhpTjPShWXJENUqqTa95BoJzA3UlrNd++urPPS7RV92UmNRIoIlJ3lADGw8g/FQ9bGGk05FblFXZ1MigHPFTmjtMrRiwAPmKSibGkx7sqY/xH0XiSgB/E5R+ebyun14z+xOrVX6D1HNJ1lCsSbltHud9aFZyrBzXDLKFSGWturZaQmglotLz9V+5qM0zftkgOdlW5I5SoDPU1ns3X259f1DauqbhA37XN9gmFmp1yrEgjJwVhgpNEq7OQj3iBhIomoQRIomcCLtlyKtnKSLlFVInOsYxjGM+DabLC0usWO42V8jF12pwMvZZ+TcGAqEdCwUe4lJV8uYfICos2LVdwoYfkBEzDlJb1ReeuwupBzV3Lycu8m/UhbBY30JqmsuXCh2VE1HBPXLSi1eNbGN6TUycV2Sk0ZEpPeFjkpeTV81XZxzXvjGTyvBn9Rm0Nr7tLprbFsLqSqM3XZjdXHtCRcqLfDdhhF23+TqZEeqcfRjbBFPEbo3j0e1BrIQdjepkBWWcmGwuxjGMYzU511NmSOo+kNz+ucQ6UZSZuPdoqDJ0kcU1UVdjuY7XZjpnKIGKcqNpUEogID5h8spasYxm33oG7Mf6o6w3ASyMXarQsvviE17I+mcSAvE7PjpTXsg3V8hDvTOjZBMJB+QmIQf3AMue8YxjGM0u+IfqcncujBz4i4lJVZ3H6ljLUdJEomOMfTL/T7XLn8igI9iETDvXCn/ABNIwj8gHKanGMZs96K9Rk7x1ZentARCSirv/anU02oCZRMKcfVLG2tUu4N5fME20TCvXCpv2Kmkcw/IMuu8YxjGM6z3Tqqsb00/tLSt1bg7qG2te3HXFmQEhVBPCXSvyFekhTKf9PrJtZBRREw/xVIQwCAgAhRvcuOM+w+HPJXdHGTakavHXXTd9nabIisidJKWZMXRjwVkj+8A9aItEErHWCIck8yOI6SbKlH9XkGOmMZMe8HJwSnNwc1LvzdssKqGs+LVTlq1UJV02H2OX3TsqJWhUWkeqcAIsrVaE7sMlJil3HYuZyuGN2+1kHLNrGMYxjGRbfER9AZr1Oaoz5IcbUoOuc0tbV33QLCRVbxMJvulRoLOGNOnZU4EbxlygzqLFpdkfmBkog4Urs2u3jhjpCHq7Ny6Q2/x32FP6o3nra5ao2PV3irGdp15gX9fm2KyRzJ+p7M+RSB0zWEonaSLI7iPfIiVwzcroHIobqzNsHS96OXMLqnbPiq5pykydX08ylGyWx+Q9siXzPWlIigVL7eVnIKEQJb7X7OCnu2o19ZzIOHApHkVIqN9eSQt2OCXCTSXT04ya54t6EiDsaZRGB1JKbfEQGw3q3yPYvZ71anKBCFdz9jkCmcL9oA3YNCM4hgRKOjmaCeYGMYxjPBjAUBERAAABEREfIAAP3ER/ryzQF1K/Ee9PPp1knKUW6l5JchI0q7Yml9LScbMBCyiYeRW2w78U7mrUoqSggV7H+tM2luAGEKyf9wj58NfGnzEpu6yxvOnjxAVjRFpl0hpdl0MWXl7bqZh5FRBvboixyhx2THmKHtL6Ug/huYarCsZjASSJ0GDeU3F7r6MvV1osYR5auHPLaJVbJizrd/SpTzYlc9pJ3mbfDFzQjdj1J2UTmKqVFlHH9UBEpz/AKTjxWH6JPRH1TIkvheFHFuHNHqA/LJXQ6s9XWhkh9QHAxt5sstWk00x/UHexBIgB8gAoeWdQcx/ECdJbpv0VemVfZ9C2rcauxVj6px64pJ1uxJs3DdM3s0U9lquKWtqDHEVAE3Ht8qk8bJ9x2sK+VAqB45fGvxr16NvOyk5Y8Wa2nx2slg86mtpaUfqbQ1bAmMmgiSZJaH5ILaBiJgLuQUbBRXXrmW9gTURBBgWa9wy6hHD3qA0FLYfFDeNP2lHJt0FpyvM3gxl9p6y5CCDK5USVK0s9ccEOf0gUfxpGLk5TGYPHaPaqbM7GMZwfZuxqfp/XN82vsGYb1+i62qFivNwm3ZykbxVbq0S6mpl8oJjFAfZ2DJdQqYCBlTgVMnmc4ANT/1SvEvc7ufs3dNfaxuMlxh4tvpCSjYbXWsX7qFutwq3rqIs1No7BaLJz8o5k2QJrSddgnMLVkzLKMlY+SKl7WtHCOc6hzqKHMdQ5jHOc5hMcxzCJjGMYwiYxjGERMYRERERERERz8Z7EllUFCLIKqIrJmAyaqRzJqJmD9jEOQQMUwf0JRAQz7j622qUbAyk7NYJFmUO0rR9NSTtsUPL5ACDhyokAB/wCeWcfxnaGnd2be4936E2lo3Zd11NsSuOCOYW40KxSVanmRyHKcUwfRjhuou0WEoFdMXPrMnifmi6brJGMQbEjw5fiOtx839yR3Bnm+NVl9sS9SlJTTO8Idi0rEjsKSqTEZGZpd6gGXowStocV5u/nIedr7OJSkgiJJk/ijvlmzpabBjGRAfGCdQH/XzhLVOGlIm/ZNk8wJdT4wSZuOx9F6Kor1k/sXrgT/0RRutqGCraXcJU38SztLX9RSKFysFxjGMYxnc3Hfel74yb21FyE1lIqRd901sGr7DrDoihiENI1mVbSQMXXb81I+URRWjJNAfMrmPeOm5wEipgG8O4n8jqLy842aT5M61dkdUzdWu63fIkhVCqqRisuwTPLQDwxf4yVcmSSEDKJD5GRkI5ykYAEg5kJnodOmzJs4evF0WrNogq6dOnChUUGzZBMyq666qglIkiikQyiihzAUhCmMYQABHKYXrlc+HHUV6kG+N2xcos/wBWViYNqLRyIqGFojqzXjp5FxUq0SE5iJ/GMseZuy/aAG9SxCkfzBEvlqIxjGMYxjLE/wAGH1AvizWO6enTe5v1JrWLp1vDRiD1wAqr0Syv2zHZdYjyqH7jI123OoyzoNkgEe24zCwFBJqcSzqc0H+JU5mWnhd0od3WChGeNL5vGQh+N9ZnWRzoqVkmz2UyFrniuE/1IOm9GhLOzjFiGKojMPo9cgh6QiFPvjGMYxjGMz36YPMO28Dud/G7k3UzO1iUXYkQyuEM0VOn8T66tSvwzfq2oUogVUZOsSkiDIqgGIlKJMHQF9RuQQu+WjhJ61bPEe/0XbdFyj3gYh/SXTKqn3k8/Mpuw4dxR+YD5gP7Zg31KOHmkedHDPdGgd+wsjK0qRrTy2sHsE/SirLWLdS2rmdrVnrUouzkEGMvGvW4pgZywfM3bB0+jnzNyyeOET0omxKTFVG+XGrxriQXj69ZJeHZLPlWyrxVtHvlmyJ3SiDRsgdcyaYCqZJuimY4iJUiB5FDhnutv9a33E/Hj3W3+tb7ifjx7rb/AFrfcT8ePdbf61vuJ+PHutv9a33E/Hj3W3+tb7ifjx7rb/Wt9xPx491t/rW+4n48e62/1rfcT8eSHfDT8DtAc1uoZV4jf0bYLJWdTR/+V4mqM5RmwgLHYqg5Qk4ZhcEDRTp7KV0r9Bu4exTJ9F+8Cog0eOFmKrhqtbdgBe0oAUoABQAAAAAAAA+QAH9AH9B/Wf/Z",
	USER_ID:"userId",
	DISPLAY_NAME:"displayName",
	TITLE:"title",
	LAST_NAME:"lastName",
	FIRST_NAME:"firstName",
	FULL_NAME:"fullName",
	DEPARTMENT:"department",
	DESCRIPTION:"description",
	COST_CENTER:"costCenter",
	ROOM_NUMBER:"roomNumber",
	DELIVERY_OFFICE_NAME:"deliveryOfficeName",
	COUNTRY:"country",
	REGION:"region",
	CITY:"city",
	ZIP_CODE:"zipCode",
	STREET_NAME:"streetName",
	DATA_ACCESS_LANGUAGE:"languageDataAccess",
	LANGUAGE:"language",
	EMAIL:"mail",
	PHONE_NUMBER:"phoneNumber",
	FAX_NUMBER:"faxNumber",
	MOBILE:"mobilePhoneNumber",
	SAP_NAME:"SAPName",
	MANAGER:"manager",
	THUMBNAIL_PHOTO:"thumbnailPhoto",
	COMPANY:"company",
	HOME_DIR:"unixHomeDirectory",
	ACCOUNT_TYPE:"accountType",
	USER_ENABLED:"userEnabled",
	TELEPHONE_ASSISTANT:"phoneAssistant",
	EXCHANGE_USAGE_LOCATION:"exchangeUsageLocation",
	SAP_OBJECT_STATUS:"SAPObjectStatus",
	DATE_FORMAT:"dateFormat",
	DECIMAL_FORMAT:"decimalFormat",
	TIME_FORMAT:"timeFormat",
	USR_NAME:"username",
	deserialize:function(userProfile, document)
	{
			var isApplicable = false;
		if (oFF.notNull(document))
		{
			var ldapHeaderStructure = document.getStructureByKey(oFF.UserProfileAdapterLdap.HEADER);
			if (oFF.notNull(ldapHeaderStructure))
			{
				isApplicable = true;
				userProfile.setDocumentFormat(oFF.UserProfileAdapterLdap.DOC_FORMAT);
				userProfile.setThumbnailPhoto(ldapHeaderStructure.getStringByKey(oFF.UserProfileAdapterLdap.THUMBNAIL_PHOTO));
				userProfile.setPersonNumber(ldapHeaderStructure.getStringByKey(oFF.UserProfileAdapterLdap.USER_ID));
				userProfile.setFullName(ldapHeaderStructure.getStringByKey(oFF.UserProfileAdapterLdap.FULL_NAME));
				userProfile.setTitle(ldapHeaderStructure.getStringByKey(oFF.UserProfileAdapterLdap.TITLE));
				userProfile.setSAPName(ldapHeaderStructure.getStringByKey(oFF.UserProfileAdapterLdap.SAP_NAME));
				userProfile.setFirstName(ldapHeaderStructure.getStringByKey(oFF.UserProfileAdapterLdap.FIRST_NAME));
				userProfile.setLastName(ldapHeaderStructure.getStringByKey(oFF.UserProfileAdapterLdap.LAST_NAME));
				userProfile.setDisplayName(ldapHeaderStructure.getStringByKey(oFF.UserProfileAdapterLdap.DISPLAY_NAME));
				userProfile.setLanguage(ldapHeaderStructure.getStringByKey(oFF.UserProfileAdapterLdap.LANGUAGE));
				userProfile.setDataAccessLanguage(ldapHeaderStructure.getStringByKey(oFF.UserProfileAdapterLdap.DATA_ACCESS_LANGUAGE));
				userProfile.setEmailAddress(ldapHeaderStructure.getStringByKey(oFF.UserProfileAdapterLdap.EMAIL));
				userProfile.setPhoneNumber(ldapHeaderStructure.getStringByKey(oFF.UserProfileAdapterLdap.PHONE_NUMBER));
				userProfile.setMobilePhoneNumber(ldapHeaderStructure.getStringByKey(oFF.UserProfileAdapterLdap.MOBILE));
				userProfile.setFaxNumber(ldapHeaderStructure.getStringByKey(oFF.UserProfileAdapterLdap.FAX_NUMBER));
				userProfile.setCompany(ldapHeaderStructure.getStringByKey(oFF.UserProfileAdapterLdap.COMPANY));
				userProfile.setDepartment(ldapHeaderStructure.getStringByKey(oFF.UserProfileAdapterLdap.DEPARTMENT));
				userProfile.setCostCenter(ldapHeaderStructure.getStringByKey(oFF.UserProfileAdapterLdap.DESCRIPTION));
				userProfile.setCostCenterId(ldapHeaderStructure.getStringByKey(oFF.UserProfileAdapterLdap.COST_CENTER));
				userProfile.setDeliveryOfficeName(ldapHeaderStructure.getStringByKey(oFF.UserProfileAdapterLdap.DELIVERY_OFFICE_NAME));
				userProfile.setRoomNumber(ldapHeaderStructure.getStringByKey(oFF.UserProfileAdapterLdap.ROOM_NUMBER));
				userProfile.setStreetName(ldapHeaderStructure.getStringByKey(oFF.UserProfileAdapterLdap.STREET_NAME));
				userProfile.setCityCode(ldapHeaderStructure.getStringByKey(oFF.UserProfileAdapterLdap.ZIP_CODE));
				userProfile.setCityName(ldapHeaderStructure.getStringByKey(oFF.UserProfileAdapterLdap.CITY));
				userProfile.setRegion(ldapHeaderStructure.getStringByKey(oFF.UserProfileAdapterLdap.REGION));
				userProfile.setCountry(ldapHeaderStructure.getStringByKey(oFF.UserProfileAdapterLdap.COUNTRY));
				userProfile.setManagerPersonNumber(ldapHeaderStructure.getStringByKey(oFF.UserProfileAdapterLdap.MANAGER));
				userProfile.setSamaAccountType(ldapHeaderStructure.getStringByKey(oFF.UserProfileAdapterLdap.ACCOUNT_TYPE));
				userProfile.setUnixHomeDirectory(ldapHeaderStructure.getStringByKey(oFF.UserProfileAdapterLdap.HOME_DIR));
				var value = ldapHeaderStructure.getStringByKey(oFF.UserProfileAdapterLdap.USER_ENABLED);
				if (oFF.XStringUtils.isNotNullAndNotEmpty(value))
				{
					if (oFF.XString.isEqual(value, "TRUE"))
					{
						userProfile.setUserEnabled(true);
					}
					else
					{
						userProfile.setUserEnabled(false);
					}
				}
				userProfile.setTelephoneAssistant(ldapHeaderStructure.getStringByKey(oFF.UserProfileAdapterLdap.TELEPHONE_ASSISTANT));
				userProfile.setExchUsageLocation(ldapHeaderStructure.getStringByKey(oFF.UserProfileAdapterLdap.EXCHANGE_USAGE_LOCATION));
				userProfile.setSAPObjectStatus(ldapHeaderStructure.getStringByKey(oFF.UserProfileAdapterLdap.SAP_OBJECT_STATUS));
				var defaultsStructure = document.getStructureByKey(oFF.UserProfileAdapterLdap.DEFAULTS);
				if (oFF.notNull(defaultsStructure))
				{
					userProfile.setDateFormatting(defaultsStructure.getStringByKey(oFF.UserProfileAdapterLdap.DATE_FORMAT));
					var decimalFormat = defaultsStructure.getStringByKey(oFF.UserProfileAdapterLdap.DECIMAL_FORMAT);
					if (oFF.XStringUtils.isNotNullAndNotEmpty(decimalFormat))
					{
						var start = oFF.XString.indexOf(decimalFormat, "1");
						var end = oFF.XString.indexOf(decimalFormat, "2");
						var groupSeparator = oFF.XString.substring(decimalFormat, start + 1, end);
						userProfile.setDecimalGroupingSeparator(groupSeparator);
						start = oFF.XString.indexOf(decimalFormat, "7");
						end = oFF.XString.indexOf(decimalFormat, "8");
						var decimalSeparator = oFF.XString.substring(decimalFormat, start + 1, end);
						userProfile.setDecimalSeparator(decimalSeparator);
					}
					userProfile.setTimeFormatting(defaultsStructure.getStringByKey(oFF.UserProfileAdapterLdap.TIME_FORMAT));
				}
			}
		}
		return isApplicable;
	},
	serialize:function(userProfile, document)
	{
			if (oFF.notNull(document))
		{
			var ldapHeaderStructure = document.getStructureByKey(oFF.UserProfileAdapterLdap.HEADER);
			if (oFF.notNull(ldapHeaderStructure))
			{
				oFF.UserProfileAdapterLdap.update(ldapHeaderStructure, oFF.UserProfileAdapterLdap.THUMBNAIL_PHOTO, userProfile.isThumbnailPhotoDefault(), userProfile.getThumbnailPhoto());
				oFF.UserProfileAdapterLdap.update(ldapHeaderStructure, oFF.UserProfileAdapterLdap.USER_ID, userProfile.isPersonNumberDefault(), userProfile.getPersonNumber());
				oFF.UserProfileAdapterLdap.update(ldapHeaderStructure, oFF.UserProfileAdapterLdap.TITLE, userProfile.isTitleDefault(), userProfile.getTitle());
				oFF.UserProfileAdapterLdap.update(ldapHeaderStructure, oFF.UserProfileAdapterLdap.FULL_NAME, userProfile.isFullNameDefault(), userProfile.getFullName());
				oFF.UserProfileAdapterLdap.update(ldapHeaderStructure, oFF.UserProfileAdapterLdap.SAP_NAME, userProfile.isSAPNameDefault(), userProfile.getSAPName());
				oFF.UserProfileAdapterLdap.update(ldapHeaderStructure, oFF.UserProfileAdapterLdap.FIRST_NAME, userProfile.isFirstNameDefault(), userProfile.getFirstName());
				oFF.UserProfileAdapterLdap.update(ldapHeaderStructure, oFF.UserProfileAdapterLdap.LAST_NAME, userProfile.isLastNameDefault(), userProfile.getLastName());
				oFF.UserProfileAdapterLdap.update(ldapHeaderStructure, oFF.UserProfileAdapterLdap.DISPLAY_NAME, userProfile.isDisplayNameDefault(), userProfile.getDisplayName());
				oFF.UserProfileAdapterLdap.update(ldapHeaderStructure, oFF.UserProfileAdapterLdap.EMAIL, userProfile.isEmailAddressDefault(), userProfile.getEmailAddress());
				oFF.UserProfileAdapterLdap.update(ldapHeaderStructure, oFF.UserProfileAdapterLdap.STREET_NAME, userProfile.isStreetNameDefault(), userProfile.getStreetName());
				oFF.UserProfileAdapterLdap.update(ldapHeaderStructure, oFF.UserProfileAdapterLdap.ZIP_CODE, userProfile.isCityCodeDefault(), userProfile.getCityCode());
				oFF.UserProfileAdapterLdap.update(ldapHeaderStructure, oFF.UserProfileAdapterLdap.CITY, userProfile.isCityNameDefault(), userProfile.getCityName());
				oFF.UserProfileAdapterLdap.update(ldapHeaderStructure, oFF.UserProfileAdapterLdap.COUNTRY, userProfile.isCountryDefault(), userProfile.getCountry());
				oFF.UserProfileAdapterLdap.update(ldapHeaderStructure, oFF.UserProfileAdapterLdap.COST_CENTER, userProfile.isCostCenterDefault(), userProfile.getCostCenter());
				oFF.UserProfileAdapterLdap.update(ldapHeaderStructure, oFF.UserProfileAdapterLdap.MANAGER, userProfile.isManagerPersonNumberDefault(), userProfile.getManagerPersonNumber());
				oFF.UserProfileAdapterLdap.update(ldapHeaderStructure, oFF.UserProfileAdapterLdap.PHONE_NUMBER, userProfile.isPhoneNumberDefault(), userProfile.getPhoneNumber());
				oFF.UserProfileAdapterLdap.update(ldapHeaderStructure, oFF.UserProfileAdapterLdap.FAX_NUMBER, userProfile.isFaxNumberDefault(), userProfile.getFaxNumber());
				oFF.UserProfileAdapterLdap.update(ldapHeaderStructure, oFF.UserProfileAdapterLdap.MOBILE, userProfile.isMobilePhoneNumberDefault(), userProfile.getMobilePhoneNumber());
				oFF.UserProfileAdapterLdap.update(ldapHeaderStructure, oFF.UserProfileAdapterLdap.DESCRIPTION, userProfile.isDescriptionDefault(), userProfile.getDescription());
				oFF.UserProfileAdapterLdap.update(ldapHeaderStructure, oFF.UserProfileAdapterLdap.DEPARTMENT, userProfile.isDepartmentDefault(), userProfile.getDepartment());
				oFF.UserProfileAdapterLdap.update(ldapHeaderStructure, oFF.UserProfileAdapterLdap.COMPANY, userProfile.isCompanyDefault(), userProfile.getCompany());
				oFF.UserProfileAdapterLdap.update(ldapHeaderStructure, oFF.UserProfileAdapterLdap.DELIVERY_OFFICE_NAME, userProfile.isDeliveryOfficeNameDefault(), userProfile.getDeliveryOfficeName());
				oFF.UserProfileAdapterLdap.update(ldapHeaderStructure, oFF.UserProfileAdapterLdap.ROOM_NUMBER, userProfile.isRoomNumberDefault(), userProfile.getRoomNumber());
				oFF.UserProfileAdapterLdap.update(ldapHeaderStructure, oFF.UserProfileAdapterLdap.REGION, userProfile.isRegionDefault(), userProfile.getRegion());
				oFF.UserProfileAdapterLdap.update(ldapHeaderStructure, oFF.UserProfileAdapterLdap.DATA_ACCESS_LANGUAGE, userProfile.isLanguageDefault(), userProfile.getLanguage());
				oFF.UserProfileAdapterLdap.update(ldapHeaderStructure, oFF.UserProfileAdapterLdap.LANGUAGE, userProfile.isLanguageDefault(), userProfile.getLanguage());
				oFF.UserProfileAdapterLdap.update(ldapHeaderStructure, oFF.UserProfileAdapterLdap.ACCOUNT_TYPE, userProfile.isSamaAccountTypeDefault(), userProfile.getSamaAccountType());
				oFF.UserProfileAdapterLdap.update(ldapHeaderStructure, oFF.UserProfileAdapterLdap.HOME_DIR, userProfile.isUnixHomeDirectoryDefault(), userProfile.getUnixHomeDirectory());
				var value;
				if (userProfile.getUserEnabled())
				{
					value = "TRUE";
				}
				else
				{
					value = "FALSE";
				}
				oFF.UserProfileAdapterLdap.update(ldapHeaderStructure, oFF.UserProfileAdapterLdap.USER_ENABLED, userProfile.isUserEnabledDefault(), value);
				oFF.UserProfileAdapterLdap.update(ldapHeaderStructure, oFF.UserProfileAdapterLdap.TELEPHONE_ASSISTANT, userProfile.isTelephoneAssistantDefault(), userProfile.getTelephoneAssistant());
				oFF.UserProfileAdapterLdap.update(ldapHeaderStructure, oFF.UserProfileAdapterLdap.EXCHANGE_USAGE_LOCATION, userProfile.isExchUsageLocationDefault(), userProfile.getExchUsageLocation());
				oFF.UserProfileAdapterLdap.update(ldapHeaderStructure, oFF.UserProfileAdapterLdap.SAP_OBJECT_STATUS, userProfile.isSAPObjectStatusDefault(), userProfile.getSAPObjectStatus());
			}
		}
	},
	update:function(ldapHeaderStructure, name, isDefault, value)
	{
			if (isDefault)
		{
			ldapHeaderStructure.remove(name);
		}
		else
		{
			ldapHeaderStructure.putString(name, value);
		}
	}
};

oFF.UserProfileAdapterOrca = {

	SCALE_FORMAT_SHORT:"short",
	SCALE_FORMAT_LONG:"long",
	DOC_FORMAT:"orca",
	USER:"user",
	FEATURES:"features",
	USER_NAME:"userName",
	PARAMETERS:"parameters",
	NAME:"name",
	VALUE:"value",
	FIRST_NAME:"FIRST_NAME",
	LAST_NAME:"LAST_NAME",
	DISPLAY_NAME:"DISPLAY_NAME",
	EMAIL:"EMAIL",
	MOBILE:"MOBILE",
	OFFICE_PHONE:"OFFICE_PHONE",
	MANAGER:"MANAGER",
	COMPANY:"COMPANY",
	OFFICE_ADDRESS:"OFFICE_ADDRESS",
	LANGUAGE:"LANGUAGE",
	DATA_ACCESS_LANGUAGE:"DATA_ACCESS_LANGUAGE",
	DATE_FORMAT:"DATE_FORMAT",
	TIME_FORMAT:"TIME_FORMAT",
	TIMEZONE:"TIMEZONE",
	DECIMAL_FORMAT:"DECIMAL_FORMAT",
	CURRENCY_UNIT_FORMAT:"CURRENCY_UNIT_FORMAT",
	SCALE_FORMAT:"SCALE_FORMAT",
	SESSION:"session",
	TENANT:"tenant",
	ID:"id",
	ACTIVE:"active",
	AUTH_GROUPS:"authGroups",
	AUTH_TYPES:"authTypes",
	deserialize:function(userProfile, document)
	{
			if (oFF.notNull(document))
		{
			var orcaUserStructure = document.getStructureByKey(oFF.UserProfileAdapterOrca.USER);
			if (oFF.notNull(orcaUserStructure))
			{
				userProfile.setDocumentFormat(oFF.UserProfileAdapterOrca.DOC_FORMAT);
				userProfile.setSAPName(orcaUserStructure.getStringByKey(oFF.UserProfileAdapterOrca.USER_NAME));
				var paramMap = oFF.XHashMapByString.create();
				var parameters = orcaUserStructure.getListByKey(oFF.UserProfileAdapterOrca.PARAMETERS);
				for (var i = 0; i < parameters.size(); i++)
				{
					var parameterElement = parameters.getStructureAt(i);
					var paramName = parameterElement.getStringByKey(oFF.UserProfileAdapterOrca.NAME);
					paramMap.put(paramName, parameterElement);
				}
				userProfile.setFirstName(oFF.UserProfileAdapterOrca.extractString(paramMap, oFF.UserProfileAdapterOrca.FIRST_NAME));
				userProfile.setLastName(oFF.UserProfileAdapterOrca.extractString(paramMap, oFF.UserProfileAdapterOrca.LAST_NAME));
				userProfile.setDisplayName(oFF.UserProfileAdapterOrca.extractString(paramMap, oFF.UserProfileAdapterOrca.DISPLAY_NAME));
				userProfile.setEmailAddress(oFF.UserProfileAdapterOrca.extractString(paramMap, oFF.UserProfileAdapterOrca.EMAIL));
				userProfile.setMobilePhoneNumber(oFF.UserProfileAdapterOrca.extractString(paramMap, oFF.UserProfileAdapterOrca.MOBILE));
				userProfile.setPhoneNumber(oFF.UserProfileAdapterOrca.extractString(paramMap, oFF.UserProfileAdapterOrca.OFFICE_PHONE));
				userProfile.setManagerPersonNumber(oFF.UserProfileAdapterOrca.extractString(paramMap, oFF.UserProfileAdapterOrca.MANAGER));
				userProfile.setCompany(oFF.UserProfileAdapterOrca.extractString(paramMap, oFF.UserProfileAdapterOrca.COMPANY));
				userProfile.setDeliveryOfficeName(oFF.UserProfileAdapterOrca.extractString(paramMap, oFF.UserProfileAdapterOrca.OFFICE_ADDRESS));
				userProfile.setLanguage(oFF.UserProfileAdapterOrca.extractString(paramMap, oFF.UserProfileAdapterOrca.LANGUAGE));
				userProfile.setDataAccessLanguage(oFF.UserProfileAdapterOrca.extractString(paramMap, oFF.UserProfileAdapterOrca.DATA_ACCESS_LANGUAGE));
				userProfile.setCurrencyFormatSettings(oFF.UserProfileAdapterOrca.extractCurrencyFormatSettings(paramMap, oFF.UserProfileAdapterOrca.CURRENCY_UNIT_FORMAT));
				userProfile.setScaleFormat(oFF.UserProfileAdapterOrca.extractScaleFormat(paramMap, oFF.UserProfileAdapterOrca.SCALE_FORMAT));
				var dateFormatJson = oFF.UserProfileAdapterOrca.extractString(paramMap, oFF.UserProfileAdapterOrca.DATE_FORMAT);
				var dateElement = oFF.JsonParserFactory.createFromString(dateFormatJson);
				if (oFF.notNull(dateElement) && dateElement.isStructure())
				{
					var dateFormatStructure = dateElement;
					var dateFormatString = dateFormatStructure.getStructureByKey("dateFormat").getStringByKey("pattern");
					userProfile.setDateFormatting(dateFormatString);
				}
				var timeFormatJson = oFF.UserProfileAdapterOrca.extractString(paramMap, oFF.UserProfileAdapterOrca.TIME_FORMAT);
				var timeElement = oFF.JsonParserFactory.createFromString(timeFormatJson);
				if (oFF.notNull(timeElement) && timeElement.isStructure())
				{
					var timeFormatStructure = timeElement;
					var timeFormatString = timeFormatStructure.getStructureByKey("timeFormat").getStringByKey("pattern");
					if (oFF.XString.isEqual("h:mm:ss a", timeFormatString) && !timeFormatStructure.getStructureByKey("timeFormat").getBooleanByKey("toLowerCase"))
					{
						timeFormatString = "h:mm:ss A";
					}
					userProfile.setTimeFormatting(timeFormatString);
				}
				var timezoneOffset = oFF.UserProfileAdapterOrca.extractInt(paramMap, oFF.UserProfileAdapterOrca.TIMEZONE);
				if (oFF.notNull(timezoneOffset))
				{
					var timezoneId = oFF.XStringUtils.concatenate2("#", oFF.XInteger.convertToString(timezoneOffset.getInteger()));
					userProfile.setTimeZoneId(timezoneId);
				}
				var decimalFormatJson = oFF.UserProfileAdapterOrca.extractString(paramMap, oFF.UserProfileAdapterOrca.DECIMAL_FORMAT);
				var decimalElement = oFF.JsonParserFactory.createFromString(decimalFormatJson);
				if (oFF.notNull(decimalElement) && decimalElement.isStructure())
				{
					var decimalFormatStructure = decimalElement;
					var decFormat = decimalFormatStructure.getStructureByKey("decimalFormat");
					var decimalSeparator = decFormat.getStructureByKey("decimalSeparator");
					userProfile.setDecimalSeparator(decimalSeparator.getStringByKey("symbol"));
					var groupingSeparator = decFormat.getStructureByKey("groupingSeparator");
					userProfile.setDecimalGroupingSeparator(groupingSeparator.getStringByKey("symbol"));
				}
				var remainingKeys = paramMap.getKeysAsReadOnlyListOfString();
				for (var k = 0; k < remainingKeys.size(); k++)
				{
					var currentKey = remainingKeys.get(k);
					var currentValue = oFF.UserProfileAdapterOrca.getString(paramMap, currentKey);
					userProfile.setInternalProperty(currentKey, currentValue);
				}
			}
			var featureToggleList = document.getListByKey(oFF.UserProfileAdapterOrca.FEATURES);
			if (oFF.notNull(featureToggleList))
			{
				for (var m = 0; m < featureToggleList.size(); m++)
				{
					var currentFeature = featureToggleList.getStructureAt(m);
					var featureId = currentFeature.getStringByKey(oFF.UserProfileAdapterOrca.ID);
					var isActive = currentFeature.getBooleanByKeyExt(oFF.UserProfileAdapterOrca.ACTIVE, true);
					userProfile.setFeatureToggle(featureId, isActive);
				}
			}
			var orcaSessionStructure = document.getStructureByKey(oFF.UserProfileAdapterOrca.SESSION);
			if (oFF.notNull(orcaSessionStructure))
			{
				var tenantId = orcaSessionStructure.getStringByKey(oFF.UserProfileAdapterOrca.TENANT);
				if (oFF.XStringUtils.isNotNullAndNotEmpty(tenantId))
				{
					userProfile.setTenantId(tenantId);
				}
			}
			var authGroups = document.getListByKey(oFF.UserProfileAdapterOrca.AUTH_GROUPS);
			if (oFF.notNull(authGroups))
			{
				userProfile.setAuthGroups(authGroups);
			}
			var authTypes = document.getListByKey(oFF.UserProfileAdapterOrca.AUTH_TYPES);
			if (oFF.notNull(authTypes))
			{
				userProfile.setAuthTypes(authTypes);
			}
		}
	},
	extractCurrencyFormatSettings:function(paramMap, currencyUnitFormat)
	{
			var orcaCurrencyFormat = oFF.UserProfileAdapterOrca.extractString(paramMap, currencyUnitFormat);
		if (oFF.isNull(orcaCurrencyFormat))
		{
			return null;
		}
		switch (orcaCurrencyFormat)
		{
			case "format0":
				return null;

			case "format1":
				return oFF.UserProfileAdapterOrca.createCurrencyFormatSettings(0, 2, 1, false, false);

			case "format17":
				return oFF.UserProfileAdapterOrca.createCurrencyFormatSettings(0, 2, 1, false, true);

			case "format2":
				return oFF.UserProfileAdapterOrca.createCurrencyFormatSettings(0, 2, 1, true, false);

			case "format3":
				return oFF.UserProfileAdapterOrca.createCurrencyFormatSettings(0, 2, 1, true, true);

			case "format4":
				return oFF.UserProfileAdapterOrca.createCurrencyFormatSettings(2, 1, 0, false, false);

			case "format5":
				return oFF.UserProfileAdapterOrca.createCurrencyFormatSettings(2, 1, 0, false, true);

			case "format6":
				return oFF.UserProfileAdapterOrca.createCurrencyFormatSettings(2, 1, 0, true, true);

			case "format7":
				return oFF.UserProfileAdapterOrca.createCurrencyFormatSettings(1, 2, 0, false, false);

			case "format8":
				return oFF.UserProfileAdapterOrca.createCurrencyFormatSettings(1, 2, 0, true, false);

			case "format9":
				return oFF.UserProfileAdapterOrca.createCurrencyFormatSettings(1, 2, 0, true, true);

			case "format10":
				return oFF.UserProfileAdapterOrca.createCurrencyFormatSettings(0, 1, 2, false, false);

			case "format11":
				return oFF.UserProfileAdapterOrca.createCurrencyFormatSettings(0, 1, 2, false, true);

			case "format12":
				return oFF.UserProfileAdapterOrca.createCurrencyFormatSettings(0, 1, 2, true, true);

			case "format13":
				return oFF.UserProfileAdapterOrca.createCurrencyFormatSettings(1, 0, 2, false, false);

			case "format14":
				return oFF.UserProfileAdapterOrca.createCurrencyFormatSettings(1, 0, 2, true, false);

			case "format15":
				return oFF.UserProfileAdapterOrca.createCurrencyFormatSettings(1, 0, 2, true, true);

			default:
				return null;
		}
	},
	extractScaleFormat:function(paramMap, currencyUnitFormat)
	{
			var orcaScaleFormat = oFF.UserProfileAdapterOrca.extractString(paramMap, currencyUnitFormat);
		if (oFF.XString.isEqual(oFF.UserProfileAdapterOrca.SCALE_FORMAT_LONG, orcaScaleFormat))
		{
			return oFF.ScaleFormat.LONG;
		}
		else if (oFF.XString.isEqual(oFF.UserProfileAdapterOrca.SCALE_FORMAT_SHORT, orcaScaleFormat))
		{
			return oFF.ScaleFormat.SHORT;
		}
		return null;
	},
	createCurrencyFormatSettings:function(currencyPresentationPosition, scaleTextPosition, valuePosition, currencyPresentationHasSpace, scaleTextHasSpace)
	{
			var currencyFormatSettings = oFF.XCurrencyFormatSettings.create();
		currencyFormatSettings.setCurrencyPresentationPosition(currencyPresentationPosition);
		currencyFormatSettings.setScaleTextPosition(scaleTextPosition);
		currencyFormatSettings.setValuePosition(valuePosition);
		currencyFormatSettings.setCurrencyPresentationHasSpace(currencyPresentationHasSpace);
		currencyFormatSettings.setScaleTextHasSpace(scaleTextHasSpace);
		return currencyFormatSettings;
	},
	extractString:function(paramMap, name)
	{
			var value = null;
		var structure = paramMap.getByKey(name);
		if (oFF.notNull(structure))
		{
			value = structure.getStringByKey(oFF.UserProfileAdapterOrca.VALUE);
			paramMap.remove(name);
		}
		return value;
	},
	getString:function(paramMap, name)
	{
			var value = null;
		var structure = paramMap.getByKey(name);
		if (oFF.notNull(structure))
		{
			value = structure.getStringByKey(oFF.UserProfileAdapterOrca.VALUE);
		}
		return value;
	},
	extractInt:function(paramMap, name)
	{
			var value = null;
		var structure = paramMap.getByKey(name);
		if (oFF.notNull(structure))
		{
			if (structure.containsKey(oFF.UserProfileAdapterOrca.VALUE))
			{
				var element = structure.getByKey(oFF.UserProfileAdapterOrca.VALUE);
				if (oFF.notNull(element) && element.isInteger())
				{
					var intValue = element.getInteger();
					value = oFF.XIntegerValue.create(intValue);
				}
			}
			paramMap.remove(name);
		}
		return value;
	},
	serialize:function(userProfile, document) {}
};

oFF.UserProfileConstants = {

	USER_ENABLED:"profile.userEnabled",
	USER_NAME:"profile.username",
	USER_ID:"profile.userId",
	DISPLAY_NAME:"profile.displayName",
	SAP_NAME:"profile.SAPName",
	DESCRIPTION:"profile.description",
	FULL_NAME:"profile.fullName",
	TITLE:"profile.title",
	LAST_NAME:"profile.lastName",
	FIRST_NAME:"profile.firstName",
	LANGUAGE:"profile.language",
	DATA_ACCESS_LANGUAGE:"profile.languageDataAccess",
	THUMBNAIL_PHOTO:"profile.thumbnailPhoto",
	EMAIL:"profile.email",
	EMAIL_PRODUCT_UPDATE_NOTIFICATION:"profile.emailProductUpdateNotification",
	EMAIL_SYSTEM_NOTIFICATION:"profile.emailSystemNotification",
	PHONE_NUMBER:"profile.phoneNumber",
	FAX_NUMBER:"profile.faxNumber",
	MOBILE:"profile.mobilePhoneNumber",
	DEPARTMENT:"profile.department",
	COST_CENTER:"profile.costCenter",
	COST_CENTER_ID:"profile.costCenterId",
	ORG_UNIT:"profile.orgUnit",
	ROOM_NUMBER:"profile.roomNumber",
	COMPANY:"profile.company",
	COUNTRY:"profile.country",
	REGION:"profile.region",
	CITY:"profile.city",
	ZIP_CODE:"profile.zipCode",
	STREET_NAME:"profile.streetName",
	DELIVERY_OFFICE_NAME:"profile.deliveryOfficeName",
	MANAGER_ID:"profile.managerId",
	HOME_DIR:"profile.unixHomeDirectory",
	ACCOUNT_TYPE:"profile.accountType",
	TELEPHONE_ASSISTANT:"profile.phoneAssistant",
	EXCHANGE_USAGE_LOCATION:"profile.exchangeUsageLocation",
	SAP_OBJECT_STATUS:"profile.SAPObjectStatus",
	MAIN_APP:"profile.mainApp",
	CLEAN_UP_NOTIFICATION:"profile.cleanUpNotification",
	DATE_FORMAT:"profile.dateFormat",
	DECIMAL_FORMAT:"profile.decimalFormat",
	SCALE_FORMAT:"profile.scaleFormat",
	TIME_FORMAT:"profile.timeFormat",
	CURRENCY_POS:"profile.currencyPos",
	TENANT_ID:"profile.tenantId",
	TIMEZONE_ID:"profile.timezoneId",
	DECIMAL_SEPARATOR:"profile.decimalSeparator",
	GROUPING_SEPARATOR:"profile.groupingSeparator",
	ENCRYPTION_TOKEN:"profile.encryptionToken",
	CACHE_SCHEMA:"profile.cacheSchema",
	PREFIX_PROFILE:"profile.",
	PREFIX_INTERNAL:"internal.",
	PREFIX_FEATURE_TOGGLE:"toggle."
};

oFF.XCacheProviderBasicFactory = function() {};
oFF.XCacheProviderBasicFactory.prototype = new oFF.XCacheProviderFactory();
oFF.XCacheProviderBasicFactory.prototype._ff_c = "XCacheProviderBasicFactory";

oFF.XCacheProviderBasicFactory.staticSetup = function()
{
	oFF.XCacheProviderFactory.registerFactory(oFF.XCacheProviderFactory.DRIVER_FILE, new oFF.XCacheProviderBasicFactory());
	oFF.XCacheProviderFactory.registerFactory(oFF.XCacheProviderFactory.DRIVER_MEMORY, new oFF.XCacheProviderBasicFactory());
};
oFF.XCacheProviderBasicFactory.prototype.newDeviceCacheAccess = function(session, driverName)
{
	var cache = null;
	if (oFF.XString.isEqual(oFF.XCacheProviderFactory.DRIVER_FILE, driverName))
	{
		cache = oFF.XCacheProviderFile.create(session);
	}
	else if (oFF.XString.isEqual(oFF.XCacheProviderFactory.DRIVER_MEMORY, driverName))
	{
		cache = oFF.XCacheProviderInMemory.create(session);
	}
	return cache;
};

oFF.CredentialsReadyLambdaListener = function() {};
oFF.CredentialsReadyLambdaListener.prototype = new oFF.XObject();
oFF.CredentialsReadyLambdaListener.prototype._ff_c = "CredentialsReadyLambdaListener";

oFF.CredentialsReadyLambdaListener.create = function(consumer)
{
	var obj = new oFF.CredentialsReadyLambdaListener();
	obj.m_consumer = consumer;
	return obj;
};
oFF.CredentialsReadyLambdaListener.prototype.m_consumer = null;
oFF.CredentialsReadyLambdaListener.prototype.releaseObject = function()
{
	this.m_consumer = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.CredentialsReadyLambdaListener.prototype.onCredentialsReady = function(extResult, personalization, customIdentifier)
{
	this.m_consumer(extResult, personalization);
};

oFF.SubSysCredentialsProviderBootstrapFactory = function() {};
oFF.SubSysCredentialsProviderBootstrapFactory.prototype = new oFF.SubSystemFactory();
oFF.SubSysCredentialsProviderBootstrapFactory.prototype._ff_c = "SubSysCredentialsProviderBootstrapFactory";

oFF.SubSysCredentialsProviderBootstrapFactory.staticSetup = function()
{
	oFF.SubSystemFactory.registerFactory(oFF.SubSystemType.CREDENTIALS_PROVIDER, new oFF.SubSysCredentialsProviderBootstrapFactory());
};
oFF.SubSysCredentialsProviderBootstrapFactory.prototype.newSubSystem = function(process)
{
	return oFF.SubSysCredentialsProviderBootstrap.create(process);
};

oFF.HttpFileFactory = function() {};
oFF.HttpFileFactory.prototype = new oFF.XObject();
oFF.HttpFileFactory.prototype._ff_c = "HttpFileFactory";

oFF.HttpFileFactory.staticSetup = function()
{
	var httpFileFactory = oFF.HttpFileFactory.create();
	oFF.HttpClientFactory.setHttpClientFactoryForProtocol(oFF.ProtocolType.FILE, httpFileFactory);
	oFF.HttpClientFactory.setHttpClientFactoryForProtocol(oFF.ProtocolType.VFS, httpFileFactory);
};
oFF.HttpFileFactory.create = function()
{
	return new oFF.HttpFileFactory();
};
oFF.HttpFileFactory.prototype.newHttpClientInstance = function(session, connection)
{
	return oFF.HttpFileClient.create(session);
};

oFF.XHttpFileSystemFactory = function() {};
oFF.XHttpFileSystemFactory.prototype = new oFF.XFileSystemFactory();
oFF.XHttpFileSystemFactory.prototype._ff_c = "XHttpFileSystemFactory";

oFF.XHttpFileSystemFactory.staticSetup = function()
{
	var factory = new oFF.XHttpFileSystemFactory();
	oFF.XFileSystemFactory.registerFactory(oFF.ProtocolType.HTTP, factory);
	oFF.XFileSystemFactory.registerFactory(oFF.ProtocolType.HTTPS, factory);
	oFF.XFileSystemFactory.registerFactory(oFF.ProtocolType.SIMPLE_WEB, factory);
	oFF.XFileSystemFactory.registerFactory(oFF.ProtocolType.REMOTE_WEB, factory);
	oFF.XFileSystemFactory.registerFactory(oFF.ProtocolType.REMOTE_WEB_SECURE, factory);
};
oFF.XHttpFileSystemFactory.prototype.newFileSystem = function(process, uri)
{
	var httpFileSystem;
	var type = uri.getProtocolType();
	if (type === oFF.ProtocolType.REMOTE_WEB || type === oFF.ProtocolType.REMOTE_WEB_SECURE)
	{
		httpFileSystem = oFF.XRemoteHttpFileSystem.create(process, uri);
	}
	else
	{
		httpFileSystem = oFF.XHttpFileSystem.create(process, uri);
	}
	return httpFileSystem;
};

oFF.XRemoteHttpFileRequestAdapter = function() {};
oFF.XRemoteHttpFileRequestAdapter.prototype = new oFF.XObject();
oFF.XRemoteHttpFileRequestAdapter.prototype._ff_c = "XRemoteHttpFileRequestAdapter";

oFF.XRemoteHttpFileRequestAdapter.create = function(callback)
{
	var adapter = new oFF.XRemoteHttpFileRequestAdapter();
	adapter.callback = callback;
	return adapter;
};
oFF.XRemoteHttpFileRequestAdapter.prototype.callback = null;
oFF.XRemoteHttpFileRequestAdapter.prototype.onHttpFileProcessed = function(extResult, data, customIdentifier)
{
	this.callback(extResult);
};

oFF.SubSysVfsBootstrapFactory = function() {};
oFF.SubSysVfsBootstrapFactory.prototype = new oFF.SubSystemFactory();
oFF.SubSysVfsBootstrapFactory.prototype._ff_c = "SubSysVfsBootstrapFactory";

oFF.SubSysVfsBootstrapFactory.staticSetup = function()
{
	oFF.SubSystemFactory.registerFactory(oFF.SubSystemType.VIRTUAL_FILE_SYSTEM, new oFF.SubSysVfsBootstrapFactory());
};
oFF.SubSysVfsBootstrapFactory.prototype.newSubSystem = function(process)
{
	return oFF.VfsFileSystem.create(process);
};

oFF.XWebDAVFactory = function() {};
oFF.XWebDAVFactory.prototype = new oFF.XFileSystemOSFactory();
oFF.XWebDAVFactory.prototype._ff_c = "XWebDAVFactory";

oFF.XWebDAVFactory.staticSetup = function()
{
	oFF.XFileSystemOSFactory.registerFactory(oFF.ProtocolType.WEB_DAV, new oFF.XWebDAVFactory());
};
oFF.XWebDAVFactory.prototype.newFileSystem = function(session, type)
{
	return oFF.XWebDAV.createWebDav(session, null);
};

oFF.RpcHttpFunctionFactory = function() {};
oFF.RpcHttpFunctionFactory.prototype = new oFF.RpcFunctionFactory();
oFF.RpcHttpFunctionFactory.prototype._ff_c = "RpcHttpFunctionFactory";

oFF.RpcHttpFunctionFactory.staticSetup = function()
{
	var newFactory = new oFF.RpcHttpFunctionFactory();
	oFF.RpcFunctionFactory.registerFactory(oFF.ProtocolType.HTTP, null, newFactory);
	oFF.RpcFunctionFactory.registerFactory(oFF.ProtocolType.HTTPS, null, newFactory);
	oFF.RpcFunctionFactory.registerDefaultFactory(newFactory);
};
oFF.RpcHttpFunctionFactory.prototype.newRpcFunction = function(context, name, systemType, protocolType)
{
	var relativeUri = oFF.XUri.createFromUrl(name);
	return oFF.RpcHttpFunction.create(context, relativeUri);
};

oFF.RpcResponse = function() {};
oFF.RpcResponse.prototype = new oFF.XObject();
oFF.RpcResponse.prototype._ff_c = "RpcResponse";

oFF.RpcResponse.create = function(ocpFunction)
{
	var request = new oFF.RpcResponse();
	request.setupExt(ocpFunction);
	return request;
};
oFF.RpcResponse.prototype.m_function = null;
oFF.RpcResponse.prototype.m_rootElement = null;
oFF.RpcResponse.prototype.m_rootElementString = null;
oFF.RpcResponse.prototype.setupExt = function(ocpFunction)
{
	this.setFunction(ocpFunction);
};
oFF.RpcResponse.prototype.releaseObject = function()
{
	this.m_function = null;
	this.m_rootElement = null;
	this.m_rootElementString = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.RpcResponse.prototype.getRootElement = function()
{
	if (oFF.notNull(this.m_rootElement) && this.m_rootElement.isStructure())
	{
		return this.m_rootElement;
	}
	return null;
};
oFF.RpcResponse.prototype.getRootElementGeneric = function()
{
	return this.m_rootElement;
};
oFF.RpcResponse.prototype.setRootElement = function(rootElement, rootElementAsString)
{
	this.m_rootElement = rootElement;
	this.m_rootElementString = rootElementAsString;
};
oFF.RpcResponse.prototype.getRootElementAsString = function()
{
	return this.m_rootElementString;
};
oFF.RpcResponse.prototype.getFunction = function()
{
	return oFF.XWeakReferenceUtil.getHardRef(this.m_function);
};
oFF.RpcResponse.prototype.setFunction = function(ocpFunction)
{
	this.m_function = oFF.XWeakReferenceUtil.getWeakRef(ocpFunction);
};
oFF.RpcResponse.prototype.toString = function()
{
	if (oFF.isNull(this.m_rootElement))
	{
		return "Ocp response: No element defined.\n";
	}
	return oFF.XStringUtils.concatenate2(this.m_rootElement.toString(), "\n");
};

oFF.ProgramStartedLambdaListener = function() {};
oFF.ProgramStartedLambdaListener.prototype = new oFF.XObject();
oFF.ProgramStartedLambdaListener.prototype._ff_c = "ProgramStartedLambdaListener";

oFF.ProgramStartedLambdaListener.create = function(consumer)
{
	var obj = new oFF.ProgramStartedLambdaListener();
	obj.m_consumer = consumer;
	return obj;
};
oFF.ProgramStartedLambdaListener.prototype.m_consumer = null;
oFF.ProgramStartedLambdaListener.prototype.onProgramStarted = function(extResult, program, customIdentifier)
{
	this.m_consumer(extResult, program);
};
oFF.ProgramStartedLambdaListener.prototype.releaseObject = function()
{
	this.m_consumer = null;
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.ProgramArgument = function() {};
oFF.ProgramArgument.prototype = new oFF.XObject();
oFF.ProgramArgument.prototype._ff_c = "ProgramArgument";

oFF.ProgramArgument.TYPE_KEY = "Type";
oFF.ProgramArgument.REQUIRED_KEY = "Required";
oFF.ProgramArgument.ALIAS_KEY = "Alias";
oFF.ProgramArgument.DESCRIPTION_KEY = "Description";
oFF.ProgramArgument.DEFAULT_KEY = "Default";
oFF.ProgramArgument.CHOICES_KEY = "Choices";
oFF.ProgramArgument.CONFLICTS_KEY = "Conflicts";
oFF.ProgramArgument.IMPLIES_KEY = "Implies";
oFF.ProgramArgument.FILE = null;
oFF.ProgramArgument.setupDefaultArguments = function()
{
	oFF.ProgramArgument.FILE = oFF.ProgramArgument.createDefault("file", oFF.ProgramArgumentType.STRING, "f");
};
oFF.ProgramArgument.createDefault = function(name, argType, alias)
{
	var newDefaultArgument = new oFF.ProgramArgument();
	newDefaultArgument.setName(name);
	newDefaultArgument.setType(argType);
	newDefaultArgument.setAlias(alias);
	return newDefaultArgument;
};
oFF.ProgramArgument.createByStructure = function(name, argumentStruct)
{
	var newArgument = new oFF.ProgramArgument();
	newArgument.setupByStructure(name, argumentStruct);
	if (newArgument.isValid())
	{
		return newArgument;
	}
	return null;
};
oFF.ProgramArgument.prototype.m_name = null;
oFF.ProgramArgument.prototype.m_isRequired = false;
oFF.ProgramArgument.prototype.m_alias = null;
oFF.ProgramArgument.prototype.m_type = null;
oFF.ProgramArgument.prototype.m_description = null;
oFF.ProgramArgument.prototype.m_defaultValue = null;
oFF.ProgramArgument.prototype.m_choices = null;
oFF.ProgramArgument.prototype.m_conflicts = null;
oFF.ProgramArgument.prototype.m_implies = null;
oFF.ProgramArgument.prototype.m_isValid = false;
oFF.ProgramArgument.prototype.setupInternal = function()
{
	this.m_choices = oFF.XList.create();
	this.m_conflicts = oFF.XListOfString.create();
	this.m_implies = oFF.XListOfString.create();
	this.m_isValid = false;
};
oFF.ProgramArgument.prototype.setupByStructure = function(name, struct)
{
	this.setupInternal();
	this.parseStructure(name, struct);
};
oFF.ProgramArgument.prototype.getName = function()
{
	return this.m_name;
};
oFF.ProgramArgument.prototype.isRequired = function()
{
	return this.m_isRequired;
};
oFF.ProgramArgument.prototype.getAlias = function()
{
	return this.m_alias;
};
oFF.ProgramArgument.prototype.getType = function()
{
	return this.m_type;
};
oFF.ProgramArgument.prototype.getDescription = function()
{
	return this.m_description;
};
oFF.ProgramArgument.prototype.getDefaultValue = function()
{
	return this.m_defaultValue;
};
oFF.ProgramArgument.prototype.getChoices = function()
{
	return this.m_choices;
};
oFF.ProgramArgument.prototype.getConflicts = function()
{
	return this.m_conflicts;
};
oFF.ProgramArgument.prototype.getImplies = function()
{
	return this.m_implies;
};
oFF.ProgramArgument.prototype.isValid = function()
{
	return this.m_isValid;
};
oFF.ProgramArgument.prototype.setValid = function(valid)
{
	this.m_isValid = valid;
};
oFF.ProgramArgument.prototype.setName = function(name)
{
	this.m_name = name;
};
oFF.ProgramArgument.prototype.setRequired = function(required)
{
	this.m_isRequired = required;
};
oFF.ProgramArgument.prototype.setType = function(argType)
{
	this.m_type = argType;
};
oFF.ProgramArgument.prototype.setAlias = function(alias)
{
	this.m_alias = alias;
};
oFF.ProgramArgument.prototype.setDescription = function(description)
{
	this.m_description = description;
};
oFF.ProgramArgument.prototype.setDefault = function(defaultVal)
{
	this.m_defaultValue = defaultVal;
};
oFF.ProgramArgument.prototype.setChoices = function(choices)
{
	this.m_choices = choices;
	if (oFF.isNull(this.m_choices))
	{
		this.m_choices = oFF.XList.create();
	}
};
oFF.ProgramArgument.prototype.setConflicts = function(conflicts)
{
	this.m_conflicts = conflicts;
	if (oFF.isNull(this.m_conflicts))
	{
		this.m_conflicts = oFF.XListOfString.create();
	}
};
oFF.ProgramArgument.prototype.setImplies = function(implies)
{
	this.m_implies = implies;
	if (oFF.isNull(this.m_implies))
	{
		this.m_implies = oFF.XListOfString.create();
	}
};
oFF.ProgramArgument.prototype.parseStructure = function(name, argumentStructure)
{
	if (oFF.XStringUtils.isNullOrEmpty(name))
	{
		this.setValid(false);
		throw oFF.XException.createRuntimeException("Missing name!");
	}
	if (oFF.notNull(argumentStructure) && argumentStructure.isStructure())
	{
		this.setName(name);
		var argType = oFF.ProgramArgumentType.lookup(argumentStructure.getStringByKey(oFF.ProgramArgument.TYPE_KEY));
		if (oFF.isNull(argType))
		{
			this.setValid(false);
			throw oFF.XException.createRuntimeException("Invalid program argument type!");
		}
		this.setType(argType);
		this.setRequired(argumentStructure.getBooleanByKeyExt(oFF.ProgramArgument.REQUIRED_KEY, false));
		this.setAlias(argumentStructure.getStringByKey(oFF.ProgramArgument.ALIAS_KEY));
		this.setDescription(argumentStructure.getStringByKey(oFF.ProgramArgument.DESCRIPTION_KEY));
		this.setDefault(this.createValueFromDef(argumentStructure.getByKey(oFF.ProgramArgument.DEFAULT_KEY)));
		this.setChoices(this.createChoices(argumentStructure.getListByKey(oFF.ProgramArgument.CHOICES_KEY)));
		this.setConflicts(this.createStringList(argumentStructure.getListByKey(oFF.ProgramArgument.CONFLICTS_KEY)));
		this.setImplies(this.createStringList(argumentStructure.getListByKey(oFF.ProgramArgument.IMPLIES_KEY)));
		this.setValid(true);
	}
	else
	{
		this.setValid(false);
		throw oFF.XException.createRuntimeException("Missing or invalid argument definition structure!");
	}
};
oFF.ProgramArgument.prototype.createValueFromDef = function(valueElement)
{
	var defaultVal = null;
	if (oFF.notNull(valueElement))
	{
		if (this.getType() === oFF.ProgramArgumentType.STRING)
		{
			defaultVal = oFF.XStringValue.create(valueElement.asString().getString());
		}
		else if (this.getType() === oFF.ProgramArgumentType.BOOLEAN)
		{
			defaultVal = oFF.XBooleanValue.create(valueElement.asBoolean().getBoolean());
		}
		else if (this.getType() === oFF.ProgramArgumentType.INTEGER)
		{
			defaultVal = oFF.XIntegerValue.create(valueElement.asInteger().getInteger());
		}
	}
	return defaultVal;
};
oFF.ProgramArgument.prototype.createChoices = function(choicesList)
{
	var tmpChoices = oFF.XList.create();
	if (oFF.notNull(choicesList) && choicesList.isList())
	{
		oFF.XCollectionUtils.forEach(choicesList.getValuesAsReadOnlyList(),  function(tmpElement){
			var tmpVal = this.createValueFromDef(tmpElement);
			if (oFF.notNull(tmpVal))
			{
				tmpChoices.add(tmpVal);
			}
		}.bind(this));
	}
	return tmpChoices;
};
oFF.ProgramArgument.prototype.createStringList = function(listOfStrings)
{
	var tmpListOfStrings = oFF.XListOfString.create();
	if (oFF.notNull(listOfStrings) && listOfStrings.isList())
	{
		oFF.XCollectionUtils.forEach(listOfStrings.getValuesAsReadOnlyList(),  function(tmpElement){
			if (tmpElement.isString())
			{
				tmpListOfStrings.add(tmpElement.asString().getString());
			}
		}.bind(this));
	}
	return tmpListOfStrings;
};

oFF.SubSysUserProfileBootstrapFactory = function() {};
oFF.SubSysUserProfileBootstrapFactory.prototype = new oFF.SubSystemFactory();
oFF.SubSysUserProfileBootstrapFactory.prototype._ff_c = "SubSysUserProfileBootstrapFactory";

oFF.SubSysUserProfileBootstrapFactory.staticSetup = function()
{
	oFF.SubSystemFactory.registerFactory(oFF.SubSystemType.USER_PROFILE, new oFF.SubSysUserProfileBootstrapFactory());
};
oFF.SubSysUserProfileBootstrapFactory.prototype.newSubSystem = function(process)
{
	return oFF.SubSysUserProfileBootstrap.create(process);
};

oFF.VfsLookupResult = function() {};
oFF.VfsLookupResult.prototype = new oFF.XObjectExt();
oFF.VfsLookupResult.prototype._ff_c = "VfsLookupResult";

oFF.VfsLookupResult.create = function(mountPoint, pathFromHere)
{
	var newObj = new oFF.VfsLookupResult();
	newObj.m_mountPoint = mountPoint;
	newObj.m_pathFromHere = pathFromHere;
	return newObj;
};
oFF.VfsLookupResult.prototype.m_mountPoint = null;
oFF.VfsLookupResult.prototype.m_pathFromHere = null;
oFF.VfsLookupResult.prototype.getMountPoint = function()
{
	return this.m_mountPoint;
};
oFF.VfsLookupResult.prototype.getPath = function()
{
	return this.m_pathFromHere;
};

oFF.XFileFilterElement = function() {};
oFF.XFileFilterElement.prototype = new oFF.XObjectExt();
oFF.XFileFilterElement.prototype._ff_c = "XFileFilterElement";

oFF.XFileFilterElement.create = function(fileAttribute, metadata)
{
	var newObj = new oFF.XFileFilterElement();
	newObj.setupExt(fileAttribute, metadata);
	return newObj;
};
oFF.XFileFilterElement.prototype.m_name = null;
oFF.XFileFilterElement.prototype.m_value = null;
oFF.XFileFilterElement.prototype.m_type = null;
oFF.XFileFilterElement.prototype.m_supportedFilters = null;
oFF.XFileFilterElement.prototype.setupExt = function(fileAttribute, metadata)
{
	oFF.XObjectExt.prototype.setup.call( this );
	this.m_name = fileAttribute.getName();
	this.m_supportedFilters = metadata.getStructureByKey(oFF.XFileAttribute.SUPPORTED_FILTERS.getName());
	if (oFF.isNull(this.m_supportedFilters))
	{
		this.m_supportedFilters = oFF.PrStructure.create();
	}
};
oFF.XFileFilterElement.prototype.getName = function()
{
	return this.m_name;
};
oFF.XFileFilterElement.prototype.getValue = function()
{
	return this.m_value;
};
oFF.XFileFilterElement.prototype.setValue = function(value)
{
	this.m_value = value;
};
oFF.XFileFilterElement.prototype.supportsType = function(type)
{
	var supportedFilter = this.m_supportedFilters.getStructureByKey(this.m_name);
	if (oFF.notNull(supportedFilter) && oFF.notNull(type))
	{
		var supportedFilterTypes = supportedFilter.getListByKey(oFF.XFileAttribute.SUPPORTED_FILTER_TYPES.getName());
		var supportsType = false;
		for (var i = 0; i < supportedFilterTypes.size(); i++)
		{
			var supportedType = supportedFilterTypes.getStringAt(i);
			if (oFF.XString.isEqual(supportedType, type.getName()))
			{
				supportsType = true;
			}
		}
		return supportsType;
	}
	return false;
};
oFF.XFileFilterElement.prototype.getType = function()
{
	return this.m_type;
};
oFF.XFileFilterElement.prototype.setType = function(type)
{
	this.m_type = type;
};

oFF.XFileQuery = function() {};
oFF.XFileQuery.prototype = new oFF.XObjectExt();
oFF.XFileQuery.prototype._ff_c = "XFileQuery";

oFF.XFileQuery.create = function(metadata)
{
	var newObj = new oFF.XFileQuery();
	newObj.setupExt(metadata);
	return newObj;
};
oFF.XFileQuery.prototype.m_supportsOffset = false;
oFF.XFileQuery.prototype.m_supportsMaxItems = false;
oFF.XFileQuery.prototype.m_supportsSingleSort = false;
oFF.XFileQuery.prototype.m_supportsCartesianFilter = false;
oFF.XFileQuery.prototype.m_offset = 0;
oFF.XFileQuery.prototype.m_maxItems = 0;
oFF.XFileQuery.prototype.m_supportsSearch = false;
oFF.XFileQuery.prototype.m_searchValue = null;
oFF.XFileQuery.prototype.m_sortDef = null;
oFF.XFileQuery.prototype.m_cartesianFilters = null;
oFF.XFileQuery.prototype.m_metadata = null;
oFF.XFileQuery.prototype.m_supportedFilters = null;
oFF.XFileQuery.prototype.setupExt = function(metadata)
{
	oFF.XObjectExt.prototype.setup.call( this );
	this.m_maxItems = -1;
	this.m_offset = -1;
	this.m_metadata = metadata;
	this.m_cartesianFilters = oFF.XList.create();
	if (oFF.notNull(this.m_metadata))
	{
		this.m_supportsOffset = metadata.getBooleanByKeyExt(oFF.XFileAttribute.SUPPORTS_OFFSET.getName(), false);
		this.m_supportsMaxItems = metadata.getBooleanByKeyExt(oFF.XFileAttribute.SUPPORTS_MAX_ITEMS.getName(), false);
		this.m_supportsSingleSort = metadata.getBooleanByKeyExt(oFF.XFileAttribute.SUPPORTS_SINGLE_SORT.getName(), false);
		this.m_supportsCartesianFilter = metadata.getBooleanByKeyExt(oFF.XFileAttribute.SUPPORTS_CARTESIAN_FILTER.getName(), false);
		this.m_supportsSearch = metadata.getBooleanByKeyExt(oFF.XFileAttribute.SUPPORTS_SEARCH.getName(), false);
		this.m_supportedFilters = metadata.getStructureByKey(oFF.XFileAttribute.SUPPORTED_FILTERS.getName());
	}
	if (oFF.isNull(this.m_supportedFilters))
	{
		this.m_supportedFilters = oFF.PrStructure.create();
	}
};
oFF.XFileQuery.prototype.supportsOffset = function()
{
	return this.m_supportsOffset;
};
oFF.XFileQuery.prototype.getOffset = function()
{
	return this.m_offset;
};
oFF.XFileQuery.prototype.supportsMaxItems = function()
{
	return this.m_supportsMaxItems;
};
oFF.XFileQuery.prototype.getMaxItems = function()
{
	return this.m_maxItems;
};
oFF.XFileQuery.prototype.supportsSingleSort = function()
{
	return this.m_supportsSingleSort;
};
oFF.XFileQuery.prototype.getSingleSortDef = function()
{
	return this.m_sortDef;
};
oFF.XFileQuery.prototype.getAttributeMetadata = function()
{
	return null;
};
oFF.XFileQuery.prototype.supportsCartesianFilter = function()
{
	return this.m_supportsCartesianFilter;
};
oFF.XFileQuery.prototype.getCartesianFilter = function()
{
	return this.m_cartesianFilters;
};
oFF.XFileQuery.prototype.supportsSearch = function()
{
	return this.m_supportsSearch;
};
oFF.XFileQuery.prototype.getSearchValue = function()
{
	return this.m_searchValue;
};
oFF.XFileQuery.prototype.setOffset = function(offset)
{
	this.m_offset = offset;
};
oFF.XFileQuery.prototype.setMaxItems = function(maxItems)
{
	this.m_maxItems = maxItems;
};
oFF.XFileQuery.prototype.newSortDef = function()
{
	this.m_sortDef = oFF.XFileSortDef.create();
	return this.m_sortDef;
};
oFF.XFileQuery.prototype.setSingleSortDef = function(sortDef)
{
	this.m_sortDef = sortDef;
};
oFF.XFileQuery.prototype.newFilterElement = function(fileAttribute)
{
	return oFF.XFileFilterElement.create(fileAttribute, this.m_metadata);
};
oFF.XFileQuery.prototype.supportsFilterOnAttribute = function(fileAttribute)
{
	var supportedFilterAttributes = this.m_supportedFilters.getKeysAsReadOnlyListOfString();
	return supportedFilterAttributes.contains(fileAttribute.getName());
};
oFF.XFileQuery.prototype.addCartesianFilter = function(filterDef)
{
	this.m_cartesianFilters.add(filterDef);
};
oFF.XFileQuery.prototype.clearCartesianFilter = function()
{
	this.m_cartesianFilters = oFF.XList.create();
};
oFF.XFileQuery.prototype.setSearchValue = function(searchValue)
{
	this.m_searchValue = searchValue;
};

oFF.XFileSortDef = function() {};
oFF.XFileSortDef.prototype = new oFF.XObjectExt();
oFF.XFileSortDef.prototype._ff_c = "XFileSortDef";

oFF.XFileSortDef.create = function()
{
	var newObj = new oFF.XFileSortDef();
	return newObj;
};
oFF.XFileSortDef.prototype.m_direction = null;
oFF.XFileSortDef.prototype.m_attributeName = null;
oFF.XFileSortDef.prototype.getDirection = function()
{
	return this.m_direction;
};
oFF.XFileSortDef.prototype.setDirection = function(direction)
{
	this.m_direction = direction;
};
oFF.XFileSortDef.prototype.getAttributeName = function()
{
	return this.m_attributeName;
};
oFF.XFileSortDef.prototype.setAttributeName = function(attributeName)
{
	this.m_attributeName = attributeName;
};

oFF.FileSystemService = function() {};
oFF.FileSystemService.prototype = new oFF.XObjectExt();
oFF.FileSystemService.prototype._ff_c = "FileSystemService";

oFF.FileSystemService.FILES = "Files";
oFF.FileSystemService.NAME = "Name";
oFF.FileSystemService.TYPE = "Type";
oFF.FileSystemService.IS_EXECUTABLE = "IsExecutable";
oFF.FileSystemService.TYPE_DIR = "Dir";
oFF.FileSystemService.TYPE_FILE = "File";
oFF.FileSystemService.EXISTING = "Existing";
oFF.FileSystemService.prototype.m_env = null;
oFF.FileSystemService.prototype.m_kernelBase = null;
oFF.FileSystemService.prototype.initServerContainer = function(environment)
{
	this.m_env = environment;
	this.m_kernelBase = oFF.Kernel.create(environment);
	var session = this.m_kernelBase.getKernelProcessBase();
	session.newWorkingTaskManager(oFF.WorkingTaskManagerType.SINGLE_THREADED);
};
oFF.FileSystemService.prototype.onHttpRequest = function(serverRequestResponse)
{
	var response = serverRequestResponse.newServerResponse();
	var clientRequest = serverRequestResponse.getClientHttpRequest();
	var envExtParameters = oFF.XHashMapOfStringByString.create();
	envExtParameters.putAll(this.m_env);
	var user = clientRequest.getUser();
	if (oFF.notNull(user))
	{
		envExtParameters.put(oFF.XEnvironmentConstants.FIREFLY_KERNEL_USER, user);
		envExtParameters.put(oFF.XEnvironmentConstants.FIREFLY_USER, user);
	}
	envExtParameters.put("ff_vfs", "true");
	var root = oFF.XFile.createByUrl(this.m_kernelBase.getProcess(), "vfs:///");
	var content = this.entryPoint(root, clientRequest);
	if (oFF.notNull(content))
	{
		response.setFromContent(content);
		response.setStatusCode(200);
	}
	else
	{
		response.setString("Oops, nothing found ");
		response.setContentType(oFF.ContentType.TEXT_PLAIN);
		response.setStatusCode(404);
	}
	serverRequestResponse.setResponse(response);
};
oFF.FileSystemService.prototype.entryPoint = function(root, clientRequest)
{
	var path = clientRequest.getRelativePath();
	if (oFF.XString.endsWith(path, "/"))
	{
		path = oFF.XStringUtils.concatenate2(path, ".index.json");
	}
	var tokens = oFF.XStringTokenizer.splitString(path, "/");
	var size = tokens.size();
	if (size > 0)
	{
		var fileContent = oFF.XContent.createContent();
		var targetFile;
		var lastElement = tokens.get(size - 1);
		lastElement = oFF.XString.toLowerCase(lastElement);
		if (oFF.XString.isEqual(lastElement, ".index.json"))
		{
			var lastSlash = oFF.XString.lastIndexOf(path, "/");
			var dirPath = oFF.XString.substring(path, 0, lastSlash);
			if (oFF.XStringUtils.isNotNullAndNotEmpty(dirPath))
			{
				targetFile = root.newChild(dirPath);
			}
			else
			{
				targetFile = root;
			}
			var listFiles = this.listFiles(targetFile);
			fileContent.setJsonObject(listFiles);
			fileContent.setContentType(oFF.ContentType.APPLICATION_JSON);
			return fileContent;
		}
		else if (oFF.XString.isEqual(lastElement, ".info.json"))
		{
			var lastSlash2 = oFF.XString.lastIndexOf(path, "/");
			var dirPath2 = oFF.XString.substring(path, 0, lastSlash2);
			targetFile = root.newChild(dirPath2);
			var fileInfo = this.fileInfo(targetFile);
			fileContent.setJsonObject(fileInfo);
			fileContent.setContentType(oFF.ContentType.APPLICATION_JSON);
			return fileContent;
		}
		else
		{
			var rootUri = root.getUri();
			var childUri = oFF.XUri.createChild(rootUri, path);
			var requestUri = clientRequest.getUri();
			childUri.setQuery(requestUri.getQuery());
			targetFile = oFF.XFile.createByUri(root.getProcess(), childUri);
			if (targetFile.isExisting() && targetFile.isFile())
			{
				var loadedFileContent = null;
				var messageCollection = null;
				if (targetFile.getFileType() === oFF.XFileType.PRG)
				{
					var extResult = targetFile.processExecute(oFF.SyncType.BLOCKING, null, null);
					loadedFileContent = targetFile.getFileContent();
					messageCollection = extResult;
				}
				else
				{
					loadedFileContent = targetFile.load();
					messageCollection = targetFile;
				}
				if (oFF.notNull(loadedFileContent) && messageCollection.isValid())
				{
					var wrapper = oFF.XContent.createContent();
					wrapper.setFromContent(loadedFileContent);
					var contentType = oFF.ContentType.lookupByFileEnding(lastElement);
					if (oFF.notNull(contentType))
					{
						wrapper.setContentType(contentType);
					}
					return wrapper;
				}
			}
		}
	}
	return null;
};
oFF.FileSystemService.prototype.fileInfo = function(file)
{
	var content = oFF.PrFactory.createStructure();
	this.addFileEntry(file, content);
	return content;
};
oFF.FileSystemService.prototype.listFiles = function(file)
{
	var content = oFF.PrFactory.createStructure();
	var files = content.putNewList(oFF.FileSystemService.FILES);
	file.setIsBlockingMetadataCallFallback(true);
	if (file.isDirectory())
	{
		var children = file.getChildren();
		for (var i = 0; i < children.size(); i++)
		{
			var child = children.get(i);
			var childStructure = files.addNewStructure();
			this.addFileEntry(child, childStructure);
		}
	}
	return content;
};
oFF.FileSystemService.prototype.addFileEntry = function(file, content)
{
	content.putString(oFF.FileSystemService.NAME, file.getName());
	if (file.isExisting())
	{
		if (file.isDirectory())
		{
			content.putString(oFF.FileSystemService.TYPE, oFF.FileSystemService.TYPE_DIR);
		}
		else
		{
			content.putString(oFF.FileSystemService.TYPE, oFF.FileSystemService.TYPE_FILE);
		}
		if (file.isExecutable())
		{
			content.putBoolean(oFF.FileSystemService.IS_EXECUTABLE, true);
		}
	}
	else
	{
		content.putBoolean(oFF.FileSystemService.EXISTING, false);
	}
};

oFF.FileSystemServiceV2 = function() {};
oFF.FileSystemServiceV2.prototype = new oFF.XObjectExt();
oFF.FileSystemServiceV2.prototype._ff_c = "FileSystemServiceV2";

oFF.FileSystemServiceV2.prototype.m_env = null;
oFF.FileSystemServiceV2.prototype.m_kernelBase = null;
oFF.FileSystemServiceV2.prototype.initServerContainer = function(environment)
{
	this.m_env = environment;
	this.m_kernelBase = oFF.Kernel.create(environment);
	var session = this.m_kernelBase.getKernelProcessBase();
	session.newWorkingTaskManager(oFF.WorkingTaskManagerType.SINGLE_THREADED);
};
oFF.FileSystemServiceV2.prototype.onHttpRequest = function(serverRequestResponse)
{
	var response = serverRequestResponse.newServerResponse();
	var clientRequest = serverRequestResponse.getClientHttpRequest();
	var envExtParameters = oFF.XHashMapOfStringByString.create();
	envExtParameters.putAll(this.m_env);
	var user = clientRequest.getUser();
	if (oFF.notNull(user))
	{
		envExtParameters.put(oFF.XEnvironmentConstants.FIREFLY_KERNEL_USER, user);
		envExtParameters.put(oFF.XEnvironmentConstants.FIREFLY_USER, user);
	}
	envExtParameters.put("ff_vfs", "true");
	this.validateClientRequest(clientRequest, response);
	if (response.getStatusCode() === 0)
	{
		var root = oFF.XFile.createByUrl(this.m_kernelBase.getProcess(), "vfs:///");
		var targetFile = this.entryPoint(root, clientRequest);
		targetFile.processFetchMetadata(oFF.SyncType.BLOCKING, null, null);
		var uri = clientRequest.getUri();
		if (!oFF.XString.isEqual(uri.getQueryMap().getByKey(oFF.XRemoteHttpFileConstants.VFS), "false"))
		{
			var fileDescription = this.createFileDescription(targetFile);
			response.setJsonObject(fileDescription);
			response.setStatusCode(200);
			oFF.XLogger.println(oFF.XStringUtils.concatenate2("Result: ", oFF.PrUtils.serialize(fileDescription, false, false, 0)));
			oFF.XCollectionUtils.forEach(targetFile.getMessages(),  function(ixMessage){
				oFF.XLogger.println(oFF.XStringUtils.concatenate3(ixMessage.getSeverity().toString(), ": ", ixMessage.getText()));
			}.bind(this));
		}
		else
		{
			if (targetFile.isExisting() === false)
			{
				response.setStatusCode(oFF.HttpStatusCode.SC_NOT_FOUND);
			}
			else
			{
				var messageCollection = oFF.MessageManagerSimple.createMessageManager();
				var fileContent = this.getFileContent(targetFile, messageCollection);
				if (messageCollection.isValid())
				{
					response.setFromContent(fileContent);
					response.setStatusCode(oFF.HttpStatusCode.SC_OK);
				}
				else
				{
					response.setStatusCode(oFF.HttpStatusCode.SC_INTERNAL_SERVER_ERROR);
					response.setStatusCodeDetails(messageCollection.getSummary());
				}
			}
		}
	}
	serverRequestResponse.setResponse(response);
};
oFF.FileSystemServiceV2.prototype.entryPoint = function(root, clientRequest)
{
	var path = clientRequest.getRelativePath();
	var tokens = oFF.XStringTokenizer.splitString(path, "/");
	var size = tokens.size();
	var targetFile = null;
	if (size > 0)
	{
		var rootUri = root.getUri();
		var childUri = oFF.XUri.createChild(rootUri, path);
		var uri = clientRequest.getUri();
		childUri.setQuery(uri.getQuery());
		targetFile = oFF.XFile.createByUri(root.getProcess(), childUri);
		var httpMethod = clientRequest.getMethod();
		var buffer = oFF.XStringBuffer.create();
		buffer.append("Processing ").append(childUri.toString()).append(" Method=").append(httpMethod.getName()).append(", resolved to native '").append(targetFile.getNativePath()).append("'");
		oFF.XLogger.println(buffer.toString());
		if (httpMethod === oFF.HttpRequestMethod.HTTP_POST)
		{
			var fileDescriptionForUpdate = clientRequest.getJsonContent().asStructure();
			oFF.XLogger.println("Update from:");
			oFF.XLogger.println(clientRequest.getStringContentWithCharset(-1));
			var isDir = oFF.XString.isEqual(fileDescriptionForUpdate.getStringByKey(oFF.XRemoteHttpFileConstants.FILE_TYPE), oFF.XRemoteHttpFileConstants.FILE_TYPE_DIR);
			if (!targetFile.isExisting())
			{
				if (isDir)
				{
					targetFile.mkdirs();
				}
				else
				{
					var parent = targetFile.getParent();
					parent.mkdirs();
					if (!parent.isValid())
					{
						targetFile.addAllMessages(parent);
					}
				}
			}
			if (!isDir)
			{
				var stringByKey = fileDescriptionForUpdate.getStringByKey(oFF.XRemoteHttpFileConstants.CONTENT);
				if (oFF.notNull(stringByKey))
				{
					targetFile.saveByteArray(oFF.XByteArray.convertFromString(stringByKey));
				}
			}
			var newName = fileDescriptionForUpdate.getStringByKey(oFF.XRemoteHttpFileConstants.NEW_FILE_NAME);
			if (oFF.XStringUtils.isNotNullAndNotEmpty(newName))
			{
				var extResult = targetFile.rename(newName);
				if (extResult.isValid())
				{
					targetFile = extResult.getData();
				}
				else
				{
					oFF.XLogger.println(extResult.getSummary());
					targetFile.addAllMessages(extResult);
				}
			}
		}
		else if (httpMethod === oFF.HttpRequestMethod.HTTP_DELETE)
		{
			if (targetFile.isExisting())
			{
				if (targetFile.isDirectory())
				{
					targetFile.deleteRecursive();
				}
				else
				{
					targetFile.deleteFile();
				}
			}
		}
	}
	return targetFile;
};
oFF.FileSystemServiceV2.prototype.validateClientRequest = function(clientRequest, response)
{
	response.setStatusCode(0);
};
oFF.FileSystemServiceV2.prototype.createFileDescription = function(targetFile)
{
	var fileDesc = oFF.PrFactory.createStructure();
	this.addFileEntry(targetFile, fileDesc);
	this.addErrorMessages(targetFile, fileDesc);
	if (targetFile.isExisting())
	{
		var directory = targetFile.isDirectory();
		if (directory)
		{
			fileDesc.put(oFF.XRemoteHttpFileConstants.CHILDREN, this.listFiles(targetFile));
		}
		else
		{
			var messageCollection = oFF.MessageManagerSimple.createMessageManager();
			var loadedFileContent = this.getFileContent(targetFile, messageCollection);
			if (oFF.notNull(loadedFileContent) && messageCollection.isValid())
			{
				var contentType = loadedFileContent.getContentType();
				fileDesc.putString(oFF.XRemoteHttpFileConstants.CONTENT_TYPE, contentType.getName());
				var contentString = contentType.isTypeOf(oFF.ContentType.BINARY) ? oFF.XByteArray.convertToString(loadedFileContent.getByteArray()) : loadedFileContent.getString();
				fileDesc.putString(oFF.XRemoteHttpFileConstants.CONTENT, contentString);
			}
		}
	}
	return fileDesc;
};
oFF.FileSystemServiceV2.prototype.addErrorMessages = function(targetFile, fileDesc)
{
	var messages = targetFile.getMessages();
	if (oFF.XCollectionUtils.hasElements(messages))
	{
		var messageList = fileDesc.putNewList("Messages");
		var messageStructure = oFF.PrFactory.createStructure();
		messageStructure.putString("Text", "File operation failed");
		messageStructure.putString("Type", oFF.Severity.ERROR.getName());
		messageStructure.putInteger("Code", oFF.ErrorCodes.SYSTEM_IO_WRITE_ACCESS);
		messageList.add(messageStructure);
		oFF.XStream.of(messages).forEach( function(message){
			oFF.XLogger.println(message.getText());
		}.bind(this));
	}
};
oFF.FileSystemServiceV2.prototype.getFileContent = function(targetFile, messageCollection)
{
	var loadedFileContent;
	if (targetFile.getFileType() === oFF.XFileType.PRG)
	{
		var extResult = targetFile.processExecute(oFF.SyncType.BLOCKING, null, null);
		loadedFileContent = targetFile.getFileContent();
		messageCollection.addAllMessages(extResult);
	}
	else
	{
		loadedFileContent = targetFile.load();
		messageCollection.addAllMessages(targetFile);
	}
	return loadedFileContent;
};
oFF.FileSystemServiceV2.prototype.listFiles = function(file)
{
	var files = oFF.PrFactory.createList();
	if (file.isDirectory())
	{
		var children = file.getChildren();
		for (var i = 0; i < children.size(); i++)
		{
			var child = children.get(i);
			var childStructure = files.addNewStructure();
			this.addFileEntry(child, childStructure);
		}
	}
	return files;
};
oFF.FileSystemServiceV2.prototype.addFileEntry = function(file, content)
{
	content.putString(oFF.XRemoteHttpFileConstants.FILE_NAME, file.getName());
	if (file.isExisting())
	{
		content.putBoolean(oFF.XRemoteHttpFileConstants.EXISTS, true);
		content.putString(oFF.XRemoteHttpFileConstants.FILE_TYPE, file.isDirectory() ? oFF.XRemoteHttpFileConstants.FILE_TYPE_DIR : oFF.XRemoteHttpFileConstants.FILE_TYPE_FILE);
		if (file.isExecutable())
		{
			content.putBoolean(oFF.XRemoteHttpFileConstants.EXECUTABLE, true);
		}
		if (file.isHidden())
		{
			content.putBoolean(oFF.XRemoteHttpFileConstants.HIDDEN, true);
		}
	}
	else
	{
		content.putBoolean(oFF.XRemoteHttpFileConstants.EXISTS, false);
	}
};

oFF.SharedServers = function() {};
oFF.SharedServers.prototype = new oFF.XObjectExt();
oFF.SharedServers.prototype._ff_c = "SharedServers";

oFF.SharedServers.create = function()
{
	var newObj = new oFF.SharedServers();
	return newObj;
};

oFF.SystemKeepAliveManager = function() {};
oFF.SystemKeepAliveManager.prototype = new oFF.XObjectExt();
oFF.SystemKeepAliveManager.prototype._ff_c = "SystemKeepAliveManager";

oFF.SystemKeepAliveManager.create = function(systemConnect)
{
	var systemKeepAliveManager = new oFF.SystemKeepAliveManager();
	systemKeepAliveManager.m_systemConnect = systemConnect;
	systemKeepAliveManager.m_isNotBw = !systemConnect.getSystemDescription().getSystemType().isTypeOf(oFF.SystemType.BW);
	systemKeepAliveManager.connectionsWithErrors = oFF.XHashMapByString.create();
	systemKeepAliveManager.listeners = oFF.XList.create();
	return systemKeepAliveManager;
};
oFF.SystemKeepAliveManager.prototype.m_systemConnect = null;
oFF.SystemKeepAliveManager.prototype.m_isNotBw = false;
oFF.SystemKeepAliveManager.prototype.m_isStopped = false;
oFF.SystemKeepAliveManager.prototype.m_timerHandle = null;
oFF.SystemKeepAliveManager.prototype.connectionsWithErrors = null;
oFF.SystemKeepAliveManager.prototype.listeners = null;
oFF.SystemKeepAliveManager.prototype.startPolling = function()
{
	this.m_isStopped = false;
	var keepAliveDelayMs = this.m_systemConnect.getSystemDescription().getKeepAliveDelayMs();
	this.connectionsWithErrors.clear();
	if (oFF.isNull(this.m_timerHandle) && keepAliveDelayMs > 0)
	{
		this.m_timerHandle = oFF.Dispatcher.getInstance().registerTimer(keepAliveDelayMs, this, null);
	}
};
oFF.SystemKeepAliveManager.prototype.onTimerEvent = function(timerHandle, customIdentifier)
{
	if (this.m_isStopped === false && this.m_systemConnect.isReleased() === false)
	{
		if (oFF.isNull(customIdentifier))
		{
			var allOpenConnections = this.m_systemConnect.getAllOpenConnections(oFF.XList.create());
			var iterator = allOpenConnections.getIterator();
			while (iterator.hasNext())
			{
				var next = iterator.next();
				oFF.Dispatcher.getInstance().registerTimer(oFF.XMath.random(10), this, next);
			}
			this.m_timerHandle = oFF.Dispatcher.getInstance().registerTimer(this.m_systemConnect.getSystemDescription().getKeepAliveIntervalMs(), this, null);
		}
		else
		{
			var syncType = oFF.XPlatform.getPlatform().isTypeOf(oFF.XPlatform.BROWSER) ? oFF.SyncType.NON_BLOCKING : this.m_systemConnect.getSession().getDefaultSyncType();
			var connection = customIdentifier;
			if (connection.isReleased() || connection.isContextIdRequired() && oFF.XStringUtils.isNullOrEmpty(connection.getSessionContextId()))
			{
				return;
			}
			var connectionErrors = this.connectionsWithErrors.getByKey(connection.getConnectionUid());
			if (oFF.isNull(connectionErrors) || connectionErrors.getInteger() < 2)
			{
				oFF.ServerMetadataAction.create(syncType, connection, this, connection, this.m_isNotBw, oFF.HttpSemanticRequestType.KEEP_ALIVE).process();
			}
		}
	}
};
oFF.SystemKeepAliveManager.prototype.stopPolling = function()
{
	this.m_isStopped = true;
	if (oFF.notNull(this.m_timerHandle))
	{
		oFF.Dispatcher.getInstance().unregisterTimer(this.m_timerHandle);
		this.m_timerHandle = null;
		this.connectionsWithErrors.clear();
	}
};
oFF.SystemKeepAliveManager.prototype.onServerMetadataLoaded = function(extResult, serverMetadata, customIdentifier)
{
	var result = oFF.KeepAliveResult.create(extResult);
	var connection = customIdentifier;
	if (extResult.hasErrors())
	{
		if (oFF.notNull(connection))
		{
			this.increaseNumberOfErrors(connection);
		}
		this.m_systemConnect.getSession().getLogger().logError(oFF.XStringUtils.concatenate3(this.m_systemConnect.getSystemName(), ": Keep Alive failed. Reason: ", extResult.getSummary()));
	}
	else
	{
		if (oFF.notNull(connection))
		{
			this.connectionsWithErrors.remove(connection.getConnectionUid());
		}
	}
	var iterator = this.listeners.getIterator();
	while (iterator.hasNext())
	{
		try
		{
			iterator.next().onKeepAlive(result);
		}
		catch (e)
		{
			var reason;
			if (oFF.XException.supportsStackTrace())
			{
				reason = oFF.XException.getStackTrace(e, 0);
			}
			else
			{
				reason = "Unknown";
			}
			this.m_systemConnect.getSession().getLogger().logError(oFF.XStringUtils.concatenate3(this.m_systemConnect.getSystemName(), ": Keep Alive notification failed. Reason: ", reason));
		}
	}
};
oFF.SystemKeepAliveManager.prototype.increaseNumberOfErrors = function(connection)
{
	var numberOfErrors = this.connectionsWithErrors.getByKey(connection.getConnectionUid());
	if (oFF.isNull(numberOfErrors))
	{
		numberOfErrors = oFF.XIntegerValue.create(1);
		this.connectionsWithErrors.put(connection.getConnectionUid(), numberOfErrors);
	}
	else
	{
		numberOfErrors.setInteger(numberOfErrors.getInteger() + 1);
	}
};
oFF.SystemKeepAliveManager.prototype.releaseObject = function()
{
	this.stopPolling();
	this.connectionsWithErrors = oFF.XObjectExt.release(this.connectionsWithErrors);
	this.m_systemConnect = null;
};
oFF.SystemKeepAliveManager.prototype.registerKeepAliveListener = function(listener)
{
	if (oFF.notNull(listener))
	{
		this.listeners.add(listener);
	}
};
oFF.SystemKeepAliveManager.prototype.unregisterKeepAliveListener = function(listener)
{
	if (oFF.notNull(listener))
	{
		this.listeners.removeElement(listener);
	}
};

oFF.HttpOptionCallProperties = function() {};
oFF.HttpOptionCallProperties.prototype = new oFF.XObjectExt();
oFF.HttpOptionCallProperties.prototype._ff_c = "HttpOptionCallProperties";

oFF.HttpOptionCallProperties.create = function()
{
	var result = new oFF.HttpOptionCallProperties();
	result.m_headers = oFF.XListOfString.create();
	return result;
};
oFF.HttpOptionCallProperties.prototype.m_headers = null;
oFF.HttpOptionCallProperties.prototype.m_method = null;
oFF.HttpOptionCallProperties.prototype.m_origin = null;
oFF.HttpOptionCallProperties.prototype.getHeaders = function()
{
	return this.m_headers;
};
oFF.HttpOptionCallProperties.prototype.getMethod = function()
{
	return this.m_method;
};
oFF.HttpOptionCallProperties.prototype.setMethod = function(method)
{
	this.m_method = method;
};
oFF.HttpOptionCallProperties.prototype.getOrigin = function()
{
	return this.m_origin;
};
oFF.HttpOptionCallProperties.prototype.setOrigin = function(origin)
{
	this.m_origin = origin;
};

oFF.HttpOptionCallResult = function() {};
oFF.HttpOptionCallResult.prototype = new oFF.XObjectExt();
oFF.HttpOptionCallResult.prototype._ff_c = "HttpOptionCallResult";

oFF.HttpOptionCallResult.create = function()
{
	var httpOptionCallResult = new oFF.HttpOptionCallResult();
	httpOptionCallResult.accessControlAllowHeaders = oFF.XListOfString.create();
	httpOptionCallResult.accessControlExposeHeaders = oFF.XListOfString.create();
	httpOptionCallResult.accessControlAllowMethods = oFF.XList.create();
	return httpOptionCallResult;
};
oFF.HttpOptionCallResult.prototype.controlAllowCredentials = false;
oFF.HttpOptionCallResult.prototype.accessControlAllowHeaders = null;
oFF.HttpOptionCallResult.prototype.accessControlExposeHeaders = null;
oFF.HttpOptionCallResult.prototype.accessControlAllowMethods = null;
oFF.HttpOptionCallResult.prototype.accessControlAllowOrigin = null;
oFF.HttpOptionCallResult.prototype.accessControlMaxAge = 0;
oFF.HttpOptionCallResult.prototype.statusCode = 0;
oFF.HttpOptionCallResult.prototype.isControlAllowCredentials = function()
{
	return this.controlAllowCredentials;
};
oFF.HttpOptionCallResult.prototype.setControlAllowCredentials = function(controlAllowCredentials)
{
	this.controlAllowCredentials = controlAllowCredentials;
};
oFF.HttpOptionCallResult.prototype.getAccessControlAllowHeaders = function()
{
	return this.accessControlAllowHeaders;
};
oFF.HttpOptionCallResult.prototype.setAccessControlAllowHeaders = function(accessControlAllowHeaders)
{
	this.accessControlAllowHeaders = accessControlAllowHeaders;
};
oFF.HttpOptionCallResult.prototype.getAccessControlAllowMethods = function()
{
	return this.accessControlAllowMethods;
};
oFF.HttpOptionCallResult.prototype.getAccessControlAllowOrigin = function()
{
	return this.accessControlAllowOrigin;
};
oFF.HttpOptionCallResult.prototype.setAccessControlAllowOrigin = function(accessControlAllowOrigin)
{
	this.accessControlAllowOrigin = accessControlAllowOrigin;
};
oFF.HttpOptionCallResult.prototype.getAccessControlMaxAge = function()
{
	return this.accessControlMaxAge;
};
oFF.HttpOptionCallResult.prototype.setAccessControlMaxAge = function(accessControlMaxAge)
{
	this.accessControlMaxAge = accessControlMaxAge;
};
oFF.HttpOptionCallResult.prototype.setStatusCode = function(statusCode)
{
	this.statusCode = statusCode;
};
oFF.HttpOptionCallResult.prototype.getAccessControlExposeHeaders = function()
{
	return this.accessControlExposeHeaders;
};
oFF.HttpOptionCallResult.prototype.getStatusCode = function()
{
	return this.statusCode;
};
oFF.HttpOptionCallResult.prototype.toString = function()
{
	var result = oFF.XStringBuffer.create();
	result.append("HttpOptionCallResult{").append("controlAllowCredentials=").appendBoolean(this.controlAllowCredentials).append(", accessControlAllowHeaders=").appendObject(this.accessControlAllowHeaders).append(", accessControlExposeHeaders=").appendObject(this.accessControlExposeHeaders).append(", accessControlAllowMethods=").appendObject(this.accessControlAllowMethods).append(", accessControlAllowOrigin='").append(this.accessControlAllowOrigin).append("\"").append(", accessControlMaxAge=").appendInt(this.accessControlMaxAge).append(", statusCode=").appendInt(this.statusCode).append("}");
	return result.toString();
};

oFF.RpcCacheFingerprintGeneratorAutoDetect = function() {};
oFF.RpcCacheFingerprintGeneratorAutoDetect.prototype = new oFF.XObjectExt();
oFF.RpcCacheFingerprintGeneratorAutoDetect.prototype._ff_c = "RpcCacheFingerprintGeneratorAutoDetect";

oFF.RpcCacheFingerprintGeneratorAutoDetect.create = function()
{
	var newObj = new oFF.RpcCacheFingerprintGeneratorAutoDetect();
	return newObj;
};
oFF.RpcCacheFingerprintGeneratorAutoDetect.prototype.generateCacheFingerprint = function(request)
{
	var fingerprint = null;
	var serializedJsonString = null;
	var buffer = oFF.XStringBuffer.create();
	var requestType = request.getRequestType();
	buffer.append(request.getMethod().getName()).append(":");
	buffer.append(requestType.getName()).append(":");
	if (requestType.isTypeOf(oFF.HttpSemanticRequestType.INA) === false)
	{
		buffer.append(request.getConnectionInfo().getPath());
	}
	buffer.append(":");
	var requestStructure = request.getRequestStructure();
	if (oFF.notNull(requestStructure))
	{
		var requestStructureClone = requestStructure.clone();
		this.cleanupRequest(requestStructureClone);
		serializedJsonString = oFF.PrUtils.serialize(requestStructureClone, true, false, 0);
		buffer.append(serializedJsonString);
	}
	var sourceForFingerprint = buffer.toString();
	fingerprint = oFF.XSha1.createSHA1(sourceForFingerprint);
	return fingerprint;
};
oFF.RpcCacheFingerprintGeneratorAutoDetect.prototype.cleanupRequest = function(requestStructure)
{
	var inaMetadata = requestStructure.getStructureByKey("Metadata");
	var inaCore = null;
	if (oFF.notNull(inaMetadata))
	{
		inaCore = inaMetadata;
	}
	else
	{
		var inaAnalytics = requestStructure.getStructureByKey("Analytics");
		if (oFF.notNull(inaAnalytics))
		{
			inaCore = inaAnalytics;
		}
	}
	if (oFF.notNull(inaCore))
	{
		var inaDataSource = inaCore.getStructureByKey("DataSource");
		if (oFF.notNull(inaDataSource))
		{
			inaDataSource.remove("InstanceId");
		}
	}
};

oFF.KernelPersistentState = function() {};
oFF.KernelPersistentState.prototype = new oFF.XObjectExt();
oFF.KernelPersistentState.prototype._ff_c = "KernelPersistentState";

oFF.KernelPersistentState.ARG_START = "c";
oFF.KernelPersistentState.ARG_STRING = "s";
oFF.KernelPersistentState.ARG_LIST = "p";
oFF.KernelPersistentState.ARG_STRUCT = "u";
oFF.KernelPersistentState.create = function(kernel)
{
	var newObj = new oFF.KernelPersistentState();
	newObj.setupExt(kernel);
	return newObj;
};
oFF.KernelPersistentState.prototype.m_kernel = null;
oFF.KernelPersistentState.prototype.setupExt = function(kernel)
{
	this.m_kernel = kernel;
};
oFF.KernelPersistentState.prototype.getInitialCfgs = function()
{
	var kernelProcess = this.m_kernel.getKernelProcess();
	var environment = kernelProcess.getEnvironment();
	var networkLocation = environment.getStringByKey(oFF.XEnvironmentConstants.NETWORK_LOCATION);
	return this.getStartCfgsByUrl(networkLocation);
};
oFF.KernelPersistentState.prototype.getStartCfgsByUrl = function(url)
{
	var startList = oFF.XList.create();
	if (oFF.XStringUtils.isNotNullAndNotEmpty(url))
	{
		var uri = oFF.XUri.createFromUrl(url);
		if (oFF.notNull(uri))
		{
			var fragment = uri.getFragment();
			if (oFF.XStringUtils.isNotNullAndNotEmpty(fragment))
			{
				this.parseUrlFragment(startList, fragment);
			}
		}
	}
	return startList;
};
oFF.KernelPersistentState.prototype.parseUrlFragment = function(startList, fragment)
{
	if (oFF.XStringUtils.isNotNullAndNotEmpty(fragment))
	{
		var json = null;
		try
		{
			json = oFF.JsonParserFactory.createFromSafeString(fragment);
		}
		catch (t)
		{
			this.log2("Fragment cannot be parsed: ", fragment);
		}
		if (oFF.notNull(json) && json.isStructure())
		{
			var viewList = json.asStructure().getListByKey("views");
			if (oFF.notNull(viewList))
			{
				for (var k = 0; k < viewList.size(); k++)
				{
					var viewDef = viewList.getStructureAt(k);
					var startName = viewDef.getStringByKey(oFF.KernelPersistentState.ARG_START);
					var prgArgs = null;
					var argsStruct = viewDef.getStructureByKey(oFF.KernelPersistentState.ARG_STRUCT);
					if (oFF.notNull(argsStruct))
					{
						prgArgs = oFF.ProgramArgs.createWithStructure(argsStruct);
					}
					else
					{
						var argsList = viewDef.getListByKey(oFF.KernelPersistentState.ARG_LIST);
						if (oFF.notNull(argsList))
						{
							var argsListValues = oFF.XListOfString.create();
							for (var m = 0; m < argsList.size(); m++)
							{
								argsListValues.add(argsList.getStringAt(m));
							}
							prgArgs = oFF.ProgramArgs.createWithList(argsListValues);
						}
						else
						{
							var argsString = viewDef.getStringByKey(oFF.KernelPersistentState.ARG_STRING);
							if (oFF.notNull(argsString))
							{
								prgArgs = oFF.ProgramArgs.createWithString(argsString);
							}
						}
					}
					var startCfg = oFF.ProgramStartCfg.create(null, startName, startName, prgArgs);
					startCfg.setIsCreatingChildProcess(false);
					startCfg.setIsNewConsoleNeeded(true);
					startList.add(startCfg);
				}
			}
		}
	}
};
oFF.KernelPersistentState.prototype.onProcessEvent = function(event, process, eventType)
{
	if (eventType === oFF.ProcessEventType.PROGRAM_TITLE_CHANGED)
	{
		return;
	}
	var kernelProcess = this.m_kernel.getKernelProcess();
	var fragment = this.updateStateRoot(kernelProcess);
	oFF.NetworkEnv.setFragment(fragment);
};
oFF.KernelPersistentState.prototype.updateStateRoot = function(process)
{
	var state = oFF.PrFactory.createStructure();
	var appList = state.putNewList("views");
	this.updateState(process, appList);
	var fragment = null;
	if (appList.size() > 0)
	{
		fragment = state.getStringRepresentation();
	}
	return fragment;
};
oFF.KernelPersistentState.prototype.updateState = function(process, appList)
{
	if (process.isWindowBasedUiProgram())
	{
		var startCfg = process.getProgramCfg();
		var appState = appList.addNewStructure();
		appState.putString(oFF.KernelPersistentState.ARG_START, startCfg.getName());
		var prgArgs = startCfg.getArguments();
		if (oFF.notNull(prgArgs))
		{
			if (prgArgs.isArgumentStructureOrigin())
			{
				var argStructure = prgArgs.getArgumentStructure();
				if (oFF.notNull(argStructure))
				{
					appState.put(oFF.KernelPersistentState.ARG_STRUCT, argStructure);
				}
			}
			else if (prgArgs.isArgumentListOrigin())
			{
				var argList = prgArgs.getArgumentList();
				if (oFF.notNull(argList) && argList.size() > 0)
				{
					var argListValues = oFF.PrFactory.createList();
					for (var k = 0; k < argList.size(); k++)
					{
						argListValues.addString(argList.get(k));
					}
					appState.put(oFF.KernelPersistentState.ARG_LIST, argListValues);
				}
			}
			else if (prgArgs.isArgumentStringOrigin())
			{
				var argString = prgArgs.getArgumentString();
				if (oFF.notNull(argString))
				{
					appState.putString(oFF.KernelPersistentState.ARG_STRING, argString);
				}
			}
		}
	}
	var childProcesses = process.getChildProcesses();
	for (var i = 0; i < childProcesses.size(); i++)
	{
		var child = childProcesses.get(i);
		this.updateState(child, appList);
	}
};

oFF.DfProcessContext = function() {};
oFF.DfProcessContext.prototype = new oFF.XObjectExt();
oFF.DfProcessContext.prototype._ff_c = "DfProcessContext";

oFF.DfProcessContext.prototype.m_process = null;
oFF.DfProcessContext.prototype.setupProcessContext = function(process)
{
	oFF.XObjectExt.prototype.setup.call( this );
	this.setProcess(process);
};
oFF.DfProcessContext.prototype.releaseObject = function()
{
	this.m_process = null;
	oFF.XObjectExt.prototype.releaseObject.call( this );
};
oFF.DfProcessContext.prototype.getSession = function()
{
	return this.getProcess();
};
oFF.DfProcessContext.prototype.setSession = function(session)
{
	this.setProcess(session);
};
oFF.DfProcessContext.prototype.getProcess = function()
{
	return oFF.XWeakReferenceUtil.getHardRef(this.m_process);
};
oFF.DfProcessContext.prototype.setProcess = function(process)
{
	this.m_process = oFF.XWeakReferenceUtil.getWeakRef(process);
};
oFF.DfProcessContext.prototype.getLogWriter = function()
{
	var session = this.getSession();
	return oFF.isNull(session) ? null : session.getLogWriter();
};
oFF.DfProcessContext.prototype.getStdout = function()
{
	var session = this.getSession();
	return oFF.isNull(session) ? null : session.getStdout();
};
oFF.DfProcessContext.prototype.getStdin = function()
{
	var session = this.getSession();
	return oFF.isNull(session) ? null : session.getStdin();
};
oFF.DfProcessContext.prototype.getStdlog = function()
{
	var session = this.getSession();
	return oFF.isNull(session) ? null : session.getStdlog();
};
oFF.DfProcessContext.prototype.getEnvironment = function()
{
	return this.getSession().getEnvironment();
};

oFF.DfXFileSystemBasic = function() {};
oFF.DfXFileSystemBasic.prototype = new oFF.DfProcessContext();
oFF.DfXFileSystemBasic.prototype._ff_c = "DfXFileSystemBasic";

oFF.DfXFileSystemBasic.prototype.getInitializationUri = function()
{
	var uri = oFF.XUri.create();
	uri.setProtocolType(this.getProtocolType());
	uri.setSupportsAuthority(false);
	return uri;
};
oFF.DfXFileSystemBasic.prototype.getWorkingDirectoryProtocolType = function()
{
	return this.getProtocolType();
};
oFF.DfXFileSystemBasic.prototype.getNativeSlash = function()
{
	return "/";
};
oFF.DfXFileSystemBasic.prototype.getWorkingDirectoryUriByProtocolType = function(protocolType)
{
	var uri = null;
	if (protocolType === this.getWorkingDirectoryProtocolType())
	{
		uri = this.getWorkingDirectoryUri();
	}
	return uri;
};
oFF.DfXFileSystemBasic.prototype.getWorkingDirectoryUri = function()
{
	return this.getRootDirectoryUri();
};
oFF.DfXFileSystemBasic.prototype.getRootDirectoryUri = function()
{
	var uri = oFF.XUri.create();
	uri.setProtocolType(this.getProtocolType());
	uri.setPath("/");
	return uri;
};
oFF.DfXFileSystemBasic.prototype.processFetchFile = function(syncType, listener, customIdentifier, process, uri)
{
	return oFF.XFileSystemActionFetchFile.createAndRun(syncType, listener, customIdentifier, this, process, uri);
};

oFF.MfsElement = function() {};
oFF.MfsElement.prototype = new oFF.DfNameObject();
oFF.MfsElement.prototype._ff_c = "MfsElement";

oFF.MfsElement.prototype.m_parent = null;
oFF.MfsElement.prototype.releaseObject = function()
{
	this.m_parent = null;
	oFF.DfNameObject.prototype.releaseObject.call( this );
};
oFF.MfsElement.prototype.isDirectory = function()
{
	return false;
};
oFF.MfsElement.prototype.getParent = function()
{
	return this.m_parent;
};
oFF.MfsElement.prototype.setParent = function(parent)
{
	this.m_parent = parent;
};

oFF.VfsElement = function() {};
oFF.VfsElement.prototype = new oFF.DfNameObject();
oFF.VfsElement.prototype._ff_c = "VfsElement";

oFF.VfsElement.prototype.m_parent = null;
oFF.VfsElement.prototype.m_vfs = null;
oFF.VfsElement.prototype.m_attributes = null;
oFF.VfsElement.prototype.setupElement = function(vfs, name, attributes)
{
	this._setupInternal(name);
	this.m_vfs = vfs;
	this.m_attributes = attributes;
};
oFF.VfsElement.prototype.getComponentType = function()
{
	return oFF.VfsElementType.ELEMENT;
};
oFF.VfsElement.prototype.setParent = function(parent)
{
	this.m_parent = parent;
};
oFF.VfsElement.prototype.getParent = function()
{
	return this.m_parent;
};
oFF.VfsElement.prototype.getVfs = function()
{
	return this.m_vfs;
};
oFF.VfsElement.prototype.setVfs = function(vfs)
{
	this.m_vfs = vfs;
};
oFF.VfsElement.prototype.isLeaf = function()
{
	return !this.isNode();
};
oFF.VfsElement.prototype.getAttributes = function()
{
	return this.m_attributes;
};
oFF.VfsElement.prototype.getMetadata = function()
{
	var metadata = oFF.PrStructure.create();
	this.getMetadataInternal(metadata);
	return metadata;
};
oFF.VfsElement.prototype.getMetadataInternal = function(metadata)
{
	var attributes = this.getAttributes();
	if (oFF.notNull(attributes))
	{
		metadata.putAll(attributes);
	}
	var name = this.getName();
	metadata.putString(oFF.XFileAttribute.NAME.getName(), name);
	if (metadata.containsKey(oFF.XFileAttribute.DISPLAY_NAME.getName()) === false)
	{
		metadata.putString(oFF.XFileAttribute.DISPLAY_NAME.getName(), name);
	}
	if (metadata.containsKey(oFF.XFileAttribute.DESCRIPTION.getName()) === false)
	{
		metadata.putString(oFF.XFileAttribute.DESCRIPTION.getName(), name);
	}
	metadata.putBoolean(oFF.XFileAttribute.IS_EXISTING.getName(), true);
	metadata.putBoolean(oFF.XFileAttribute.IS_HIDDEN.getName(), false);
	metadata.putBoolean(oFF.XFileAttribute.IS_EXECUTABLE.getName(), false);
	metadata.putBoolean(oFF.XFileAttribute.IS_READABLE.getName(), false);
	metadata.putBoolean(oFF.XFileAttribute.IS_WRITEABLE.getName(), false);
	metadata.putLong(oFF.XFileAttribute.CHANGED_AT.getName(), 0);
	metadata.putLong(oFF.XFileAttribute.SIZE.getName(), 0);
	metadata.putBoolean(oFF.XFileAttribute.SUPPORTS_SET_LAST_MODIFIED.getName(), false);
};
oFF.VfsElement.prototype.toString = function()
{
	var buffer = oFF.XStringBufferExt.create();
	buffer.setIndentationString("  ");
	this.toStringExt(buffer);
	return buffer.toString();
};
oFF.VfsElement.prototype.toStringExt = function(buffer)
{
	if (this.isNode())
	{
		buffer.append("Node: ");
	}
	else
	{
		buffer.append("Leaf: ");
	}
	buffer.append(this.getName());
};

oFF.ModuleManager = function() {};
oFF.ModuleManager.prototype = new oFF.DfSessionContext();
oFF.ModuleManager.prototype._ff_c = "ModuleManager";

oFF.ModuleManager.s_singleModules = null;
oFF.ModuleManager.s_containerModules = null;
oFF.ModuleManager.s_repositoryBaseUrl = null;
oFF.ModuleManager.s_moduleLoader = null;
oFF.ModuleManager.staticSetup = function()
{
	oFF.ModuleManager.s_singleModules = oFF.XSetOfNameObject.create();
	oFF.ModuleManager.s_containerModules = oFF.XListOfNameObject.create();
};
oFF.ModuleManager.setModuleLoadUrl = function(moduleGroup, url)
{
	if (oFF.XStringUtils.isNotNullAndNotEmpty(url))
	{
		oFF.ModuleManager.s_repositoryBaseUrl = oFF.XUri.createFromUrl(url);
		var iterator = oFF.ModuleManager.s_singleModules.getIterator();
		while (iterator.hasNext())
		{
			var moduleDef = iterator.next();
			moduleDef.setBaseUri(oFF.ModuleManager.s_repositoryBaseUrl);
		}
	}
};
oFF.ModuleManager.registerDirect = function(name, clazzName, hasVariants, sourceLocation, listOfDependencies, extendedJsonConfig)
{
	var moduleDef = oFF.ResourceDef.create(name, oFF.ResourceType.MODULE, sourceLocation, oFF.ModuleManager.s_repositoryBaseUrl, hasVariants, null, null, listOfDependencies, clazzName);
	oFF.ModuleManager.register(moduleDef);
};
oFF.ModuleManager.registerLibrary = function(name, clazzName, sourceLocation)
{
	var moduleDef = oFF.ResourceDef.create(name, oFF.ResourceType.JAVASCRIPT, sourceLocation, null, false, null, null, null, null);
	oFF.ModuleManager.register(moduleDef);
	return moduleDef;
};
oFF.ModuleManager.registerContainer = function(name, sourceLocation, listOfContainerResources)
{
	var moduleDef = oFF.ResourceDef.create(name, oFF.ResourceType.CONTAINER, sourceLocation, oFF.ModuleManager.s_repositoryBaseUrl, false, null, null, null, null);
	moduleDef.setContainerResources(listOfContainerResources);
	oFF.ModuleManager.register(moduleDef);
};
oFF.ModuleManager.register = function(moduleDef)
{
	if (moduleDef.getType() === oFF.ResourceType.CONTAINER)
	{
		oFF.ModuleManager.s_containerModules.add(moduleDef);
	}
	else
	{
		oFF.ModuleManager.s_singleModules.add(moduleDef);
	}
};
oFF.ModuleManager.getModuleDef = function(name)
{
	return oFF.ModuleManager.s_singleModules.getByKey(name);
};
oFF.ModuleManager.getAllContainerModules = function()
{
	return oFF.ModuleManager.s_containerModules;
};
oFF.ModuleManager.lookup = function(name)
{
	return oFF.ModuleManager.s_singleModules.getByKey(name);
};
oFF.ModuleManager.getModuleLoader = function()
{
	return oFF.ModuleManager.s_moduleLoader;
};
oFF.ModuleManager.registerModuleLoader = function(moduleLoader)
{
	oFF.ModuleManager.s_moduleLoader = moduleLoader;
};
oFF.ModuleManager.create = function(session)
{
	var newObj = new oFF.ModuleManager();
	newObj.setupSessionContext(session);
	return newObj;
};
oFF.ModuleManager.prototype.m_runningLoadAction = null;
oFF.ModuleManager.prototype.m_scheduledLoadActions = null;
oFF.ModuleManager.prototype.setupSessionContext = function(session)
{
	oFF.DfSessionContext.prototype.setupSessionContext.call( this , session);
	this.m_scheduledLoadActions = oFF.XList.create();
};
oFF.ModuleManager.prototype.getLogLayer = function()
{
	return oFF.OriginLayer.KERNEL;
};
oFF.ModuleManager.prototype.processLoadModule = function(moduleDef, listener, cachebusterId)
{
	oFF.ModuleManager.getModuleLoader().processModuleLoad(this.getSession(), moduleDef, listener, cachebusterId);
};
oFF.ModuleManager.prototype.processLoadModules = function(syncType, moduleNames, listener, customIdentifier)
{
	var loadAction = oFF.ModuleLoadAction.createAndRun(oFF.SyncType.DELAYED, this, moduleNames, oFF.ModuleManager.s_moduleLoader, listener, customIdentifier);
	loadAction.attachListener(this, oFF.ListenerType.SYNC_LISTENER, loadAction);
	this.m_scheduledLoadActions.add(loadAction);
	this.clockworkTick(syncType);
	return loadAction;
};
oFF.ModuleManager.prototype.onSynchronized = function(messages, data, customIdentifier)
{
	var loadAction = customIdentifier;
	this.m_runningLoadAction = null;
	this.log2("Loading of module(s) done: ", loadAction.getData().toString());
	this.clockworkTick(loadAction.getActiveSyncType());
};
oFF.ModuleManager.prototype.clockworkTick = function(syncType)
{
	if (oFF.isNull(this.m_runningLoadAction) && this.m_scheduledLoadActions.size() > 0)
	{
		this.m_runningLoadAction = this.m_scheduledLoadActions.removeAt(0);
		this.log2("Running next: ", this.m_runningLoadAction.getData().toString());
		this.m_runningLoadAction.setActiveSyncType(oFF.SyncType.NON_BLOCKING);
		this.m_runningLoadAction.process();
	}
};

oFF.ResourceDef = function() {};
oFF.ResourceDef.prototype = new oFF.DfNameObject();
oFF.ResourceDef.prototype._ff_c = "ResourceDef";

oFF.ResourceDef.create = function(name, type, url, baseUri, hasVariants, variantName, tags, listOfDependencies, clazzName)
{
	var newObj = new oFF.ResourceDef();
	newObj.setupResourceDef(name, type, url, baseUri, hasVariants, variantName, tags, listOfDependencies, clazzName);
	return newObj;
};
oFF.ResourceDef.prototype.m_language = null;
oFF.ResourceDef.prototype.m_type = null;
oFF.ResourceDef.prototype.m_url = null;
oFF.ResourceDef.prototype.m_baseUri = null;
oFF.ResourceDef.prototype.m_variantName = null;
oFF.ResourceDef.prototype.m_hasVariants = false;
oFF.ResourceDef.prototype.m_profiles = null;
oFF.ResourceDef.prototype.m_tags = null;
oFF.ResourceDef.prototype.m_dependencies = null;
oFF.ResourceDef.prototype.m_listOfDependencies = null;
oFF.ResourceDef.prototype.m_containerResources = null;
oFF.ResourceDef.prototype.m_listOfContainerResources = null;
oFF.ResourceDef.prototype.m_originClazzName = null;
oFF.ResourceDef.prototype.m_targetClazzName = null;
oFF.ResourceDef.prototype.m_clazzName = null;
oFF.ResourceDef.prototype.m_loadStatus = null;
oFF.ResourceDef.prototype.setupResourceDef = function(name, type, url, baseUri, hasVariants, variantName, tags, listOfDependencies, clazzName)
{
	this._setupInternal(name);
	this.m_type = type;
	this.m_tags = tags;
	this.m_url = url;
	this.m_baseUri = baseUri;
	this.m_hasVariants = hasVariants;
	this.m_variantName = variantName;
	this.m_listOfDependencies = listOfDependencies;
	this.m_profiles = oFF.XHashSetOfString.create();
	this.m_loadStatus = oFF.ResourceStatus.INITIAL;
	this.setClazzName(clazzName);
};
oFF.ResourceDef.prototype.getLanguage = function()
{
	return this.m_language;
};
oFF.ResourceDef.prototype.setLanguage = function(language)
{
	this.m_language = language;
};
oFF.ResourceDef.prototype.getType = function()
{
	return this.m_type;
};
oFF.ResourceDef.prototype.getUrl = function()
{
	return this.m_url;
};
oFF.ResourceDef.prototype.getBaseUri = function()
{
	return this.m_baseUri;
};
oFF.ResourceDef.prototype.setBaseUri = function(baseUri)
{
	this.m_baseUri = baseUri;
};
oFF.ResourceDef.prototype.getResolvedUri = function(session)
{
	var resolvedUri = oFF.XUri.createFromUrl(this.getUrl());
	if (oFF.notNull(resolvedUri))
	{
		if (resolvedUri.isRelativeUri())
		{
			var environment = session.getEnvironment();
			var baseUri = this.m_baseUri;
			if (oFF.isNull(baseUri))
			{
				var baseUrl = environment.getStringByKey(oFF.XEnvironmentConstants.FIREFLY_MODULE_PATH);
				if (oFF.XStringUtils.isNotNullAndNotEmpty(baseUrl))
				{
					baseUri = oFF.XUri.createFromUrl(baseUrl);
				}
			}
			if (oFF.notNull(baseUri))
			{
				if (this.hasVariants() === true)
				{
					var variantName = environment.getStringByKey(oFF.XEnvironmentConstants.FIREFLY_VARIANT);
					if (oFF.notNull(variantName))
					{
						var path = baseUri.getPath();
						if (oFF.XString.endsWith(path, "/"))
						{
							path = oFF.XString.substring(path, 0, oFF.XString.size(path) - 1);
						}
						path = oFF.XStringUtils.concatenate4(path, ".", variantName, "/");
						var newBase = oFF.XUri.createFromOther(baseUri);
						newBase.setPath(path);
						baseUri = newBase;
					}
				}
				resolvedUri = oFF.XUri.createChild(baseUri, this.getUrl());
			}
		}
	}
	return resolvedUri;
};
oFF.ResourceDef.prototype.hasVariants = function()
{
	return this.m_hasVariants;
};
oFF.ResourceDef.prototype.getVariantName = function()
{
	return this.m_variantName;
};
oFF.ResourceDef.prototype.getTags = function()
{
	return this.m_tags;
};
oFF.ResourceDef.prototype.getProfiles = function()
{
	this.checkJson();
	return this.m_profiles;
};
oFF.ResourceDef.prototype.addProfile = function(profile)
{
	this.m_profiles.add(profile);
};
oFF.ResourceDef.prototype.getDependencies = function()
{
	this.checkJson();
	var allDependencies = this.getAllDependencies();
	var list = oFF.XListOfString.create();
	for (var i = 0; i < allDependencies.size(); i++)
	{
		var entity = allDependencies.get(i);
		if (entity.getType() === oFF.ResourceType.MODULE)
		{
			list.add(entity.getName());
		}
	}
	return list;
};
oFF.ResourceDef.prototype.getDependenciesExt = function(variant)
{
	this.checkJson();
	return this.m_dependencies;
};
oFF.ResourceDef.prototype.getAllDependencies = function()
{
	this.checkJson();
	return this.m_dependencies;
};
oFF.ResourceDef.prototype.addDependency = function(entity)
{
	this.m_dependencies.add(entity);
};
oFF.ResourceDef.prototype.addAllDependencies = function(dependencies)
{
	for (var i = 0; i < dependencies.size(); i++)
	{
		var resourceEntity = dependencies.get(i);
		if (this.m_dependencies.contains(resourceEntity) === false)
		{
			this.m_dependencies.add(resourceEntity);
		}
	}
};
oFF.ResourceDef.prototype.setClazzName = function(clazzName)
{
	this.m_originClazzName = clazzName;
	if (oFF.notNull(this.m_originClazzName))
	{
		var index = oFF.XString.lastIndexOf(this.m_originClazzName, ".");
		if (index !== -1)
		{
			this.m_clazzName = oFF.XString.substring(this.m_originClazzName, index + 1, -1);
		}
		var language = oFF.XLanguage.getLanguage();
		if (language === oFF.XLanguage.JAVASCRIPT)
		{
			this.m_targetClazzName = this.m_clazzName;
		}
		else
		{
			this.m_targetClazzName = this.m_originClazzName;
		}
	}
};
oFF.ResourceDef.prototype.getInitClazzName = function()
{
	this.checkJson();
	return this.m_clazzName;
};
oFF.ResourceDef.prototype.getInitClazzNameCompatible = function()
{
	this.checkJson();
	return this.m_targetClazzName;
};
oFF.ResourceDef.prototype.getInitClazzNameOrigin = function()
{
	this.checkJson();
	return this.m_originClazzName;
};
oFF.ResourceDef.prototype.getLoadStatus = function()
{
	if (this.m_loadStatus === oFF.ResourceStatus.INITIAL || this.m_loadStatus === oFF.ResourceStatus.LOADING)
	{
		if (this.m_type === oFF.ResourceType.CONTAINER)
		{
			var allContainerResources = this.getAllContainerResources();
			var isLoaded = true;
			for (var i = 0; i < allContainerResources.size(); i++)
			{
				var def = allContainerResources.get(i);
				var name = def.getName();
				var moduleDef = oFF.ModuleManager.getModuleDef(name);
				var refLoadStatus = moduleDef.getLoadStatus();
				if (refLoadStatus !== oFF.ResourceStatus.LOADED)
				{
					isLoaded = false;
				}
			}
			if (isLoaded === true)
			{
				this.m_loadStatus = oFF.ResourceStatus.LOADED;
			}
		}
		else
		{
			var loadedModuleNames = oFF.DfModule.getLoadedModuleNames();
			var moduleList = oFF.XStringTokenizer.splitString(loadedModuleNames, ",");
			var myName = this.getName();
			if (moduleList.contains(myName) === true)
			{
				this.m_loadStatus = oFF.ResourceStatus.LOADED;
			}
		}
	}
	return this.m_loadStatus;
};
oFF.ResourceDef.prototype.setLoadStatus = function(status)
{
	this.m_loadStatus = status;
	if (status === oFF.ResourceStatus.LOADING && this.m_type === oFF.ResourceType.CONTAINER)
	{
		var allContainerResources = this.getAllContainerResources();
		for (var i = 0; i < allContainerResources.size(); i++)
		{
			var def = allContainerResources.get(i);
			var name = def.getName();
			var moduleDef = oFF.ModuleManager.getModuleDef(name);
			moduleDef.setLoadStatus(oFF.ResourceStatus.LOADING);
		}
	}
};
oFF.ResourceDef.prototype.getAllContainerResources = function()
{
	this.checkJson();
	return this.m_containerResources;
};
oFF.ResourceDef.prototype.setContainerResources = function(listOfContainerResources)
{
	this.m_listOfContainerResources = listOfContainerResources;
};
oFF.ResourceDef.prototype.isEqualTo = function(other)
{
	var isEqual = oFF.DfNameObject.prototype.isEqualTo.call( this , other);
	var theOther = other;
	isEqual = isEqual && this.getType() === theOther.getType();
	isEqual = isEqual && this.getLanguage() === theOther.getLanguage();
	isEqual = isEqual && oFF.XString.isEqual(this.getUrl(), theOther.getUrl());
	isEqual = isEqual && oFF.XString.isEqual(this.getVariantName(), theOther.getVariantName());
	if (oFF.notNull(this.m_tags))
	{
		isEqual = isEqual && this.m_tags.isEqualTo(theOther.getTags());
	}
	else
	{
		isEqual = isEqual && theOther.getTags() === null;
	}
	return isEqual;
};
oFF.ResourceDef.prototype.checkJson = function()
{
	if (oFF.isNull(this.m_dependencies))
	{
		this.m_dependencies = oFF.XList.create();
		if (oFF.XStringUtils.isNotNullAndNotEmpty(this.m_listOfDependencies))
		{
			var dependencies = oFF.XStringTokenizer.splitString(this.m_listOfDependencies, ",");
			for (var i = 0; i < dependencies.size(); i++)
			{
				var moduleName = dependencies.get(i);
				var entity = oFF.ResourceDef.create(moduleName, oFF.ResourceType.MODULE, null, null, false, null, null, null, null);
				this.m_dependencies.add(entity);
			}
		}
	}
	if (oFF.isNull(this.m_containerResources))
	{
		this.m_containerResources = oFF.XList.create();
		if (oFF.XStringUtils.isNotNullAndNotEmpty(this.m_listOfContainerResources))
		{
			var embeddedList = oFF.XStringTokenizer.splitString(this.m_listOfContainerResources, ",");
			for (var j = 0; j < embeddedList.size(); j++)
			{
				var moduleName2 = embeddedList.get(j);
				var entity2 = oFF.ResourceDef.create(moduleName2, oFF.ResourceType.MODULE_REF, null, null, false, null, null, null, null);
				this.m_containerResources.add(entity2);
			}
		}
	}
};

oFF.ConnectionPool = function() {};
oFF.ConnectionPool.prototype = new oFF.DfProcessContext();
oFF.ConnectionPool.prototype._ff_c = "ConnectionPool";

oFF.ConnectionPool.create = function(process)
{
	var pool = new oFF.ConnectionPool();
	pool.setupProcessContext(process);
	return pool;
};
oFF.ConnectionPool.prototype.m_systemConnectSet = null;
oFF.ConnectionPool.prototype.m_cookiesMasterStore = null;
oFF.ConnectionPool.prototype.m_batchRsStreamingEnabled = false;
oFF.ConnectionPool.prototype.m_batchBypassEnabled = false;
oFF.ConnectionPool.prototype.m_inaMergeProcessor = null;
oFF.ConnectionPool.prototype.m_traceInfoGlobal = null;
oFF.ConnectionPool.prototype.setupProcessContext = function(process)
{
	oFF.DfProcessContext.prototype.setupProcessContext.call( this , process);
	this.m_systemConnectSet = oFF.XSetOfNameObject.create();
	this.m_cookiesMasterStore = oFF.HttpCookiesMasterStore.create();
	this.m_batchRsStreamingEnabled = false;
	this.m_batchBypassEnabled = false;
	this.m_inaMergeProcessor = null;
};
oFF.ConnectionPool.prototype.releaseObject = function()
{
	this.m_systemConnectSet = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_systemConnectSet);
	this.m_inaMergeProcessor = oFF.XObjectExt.release(this.m_inaMergeProcessor);
	oFF.DfProcessContext.prototype.releaseObject.call( this );
};
oFF.ConnectionPool.prototype.getActiveSystems = function()
{
	return this.m_systemConnectSet.getKeysAsReadOnlyListOfString();
};
oFF.ConnectionPool.prototype.clearConnectionsForSystem = function(systemName)
{
	var systemConnect = this.m_systemConnectSet.getByKey(systemName);
	if (oFF.notNull(systemConnect))
	{
		systemConnect.clearConnections();
	}
};
oFF.ConnectionPool.prototype.clearConnections = function()
{
	var sci = this.m_systemConnectSet.getIterator();
	while (sci.hasNext())
	{
		sci.next().clearConnections();
	}
	oFF.XObjectExt.release(sci);
};
oFF.ConnectionPool.prototype.getAllOpenConnections = function()
{
	var allOpenConnections = oFF.XList.create();
	var sci = this.m_systemConnectSet.getIterator();
	while (sci.hasNext())
	{
		sci.next().getAllOpenConnections(allOpenConnections);
	}
	oFF.XObjectExt.release(sci);
	return allOpenConnections;
};
oFF.ConnectionPool.prototype.getOpenConnections = function(systemName)
{
	return this.getSystemConnectBase(systemName).getAllOpenConnections(oFF.XList.create());
};
oFF.ConnectionPool.prototype.getOpenConnection = function(systemName)
{
	var allOpenConnections = this.getOpenConnections(systemName);
	if (allOpenConnections.hasElements())
	{
		return allOpenConnections.get(0);
	}
	return this.getConnection(systemName);
};
oFF.ConnectionPool.prototype.getConnection = function(systemName)
{
	return this.getConnectionExt(systemName, false, null);
};
oFF.ConnectionPool.prototype.getConnectionExt = function(systemName, isPrivate, name)
{
	return this.getSystemConnectBase(systemName).getConnectionExt(isPrivate, name);
};
oFF.ConnectionPool.prototype.getSystemConnect = function(systemName)
{
	return this.getSystemConnectExt(systemName, true);
};
oFF.ConnectionPool.prototype.getSystemConnectBase = function(systemName)
{
	return this.getSystemConnectExt(systemName, true);
};
oFF.ConnectionPool.prototype.getSystemConnectExt = function(systemName, createIfNotExist)
{
	var sysName = this.resolveSystemName(systemName);
	var systemConnect = this.m_systemConnectSet.getByKey(sysName);
	if (oFF.isNull(systemConnect) && createIfNotExist === true)
	{
		var systemDescription = this.getSystemLandscape().getSystemDescription(sysName);
		oFF.XObjectExt.assertNotNullExt(systemDescription, oFF.XStringUtils.concatenate3("System cannot be resolved: '", systemName, "'"));
		systemConnect = oFF.SystemConnect.create(this, sysName, systemDescription);
		this.m_systemConnectSet.add(systemConnect);
	}
	return systemConnect;
};
oFF.ConnectionPool.prototype.resolveSystemName = function(systemName)
{
	if (oFF.isNull(systemName))
	{
		return this.getSystemLandscape().getMasterSystemName();
	}
	return systemName;
};
oFF.ConnectionPool.prototype.setExternalActiveConnections = function(systemName, activeConnections)
{
	var systemConnect = this.m_systemConnectSet.getByKey(systemName);
	if (oFF.notNull(systemConnect))
	{
		systemConnect.setExternalActiveConnections(activeConnections);
	}
};
oFF.ConnectionPool.prototype.setExternalSharedConnection = function(systemName, name, csrfToken, sessionUrlRewrite)
{
	var systemConnect = this.m_systemConnectSet.getByKey(systemName);
	if (oFF.notNull(systemConnect))
	{
		systemConnect.setExternalSharedConnection(name, csrfToken, sessionUrlRewrite);
	}
};
oFF.ConnectionPool.prototype.getMaximumSharedConnections = function(systemName)
{
	return this.getSystemConnectBase(systemName).getMaximumSharedConnections();
};
oFF.ConnectionPool.prototype.setMaximumSharedConnections = function(systemName, maximumSharedConnections)
{
	var systemConnect = this.getSystemConnectBase(systemName);
	if (oFF.notNull(systemConnect))
	{
		systemConnect.setMaximumSharedConnections(maximumSharedConnections);
	}
};
oFF.ConnectionPool.prototype.isEqsEnabled = function(systemName)
{
	var systemConnect = this.m_systemConnectSet.getByKey(systemName);
	if (oFF.notNull(systemConnect))
	{
		return systemConnect.isEQSEnabled();
	}
	return false;
};
oFF.ConnectionPool.prototype.setEqsEnabled = function(systemName, isEqsEnabled)
{
	var systemConnect = this.m_systemConnectSet.getByKey(systemName);
	if (oFF.notNull(systemConnect))
	{
		systemConnect.setIsEQSEnabled(isEqsEnabled);
	}
};
oFF.ConnectionPool.prototype.getTraceInfo = function(systemName)
{
	var systemConnect = this.getSystemConnectBase(systemName);
	var traceInfo = systemConnect.getTraceInfo();
	var process = this.getProcess();
	var env = process.getEnvironment();
	var enableTracing = env.getBooleanByKeyExt(oFF.XEnvironmentConstants.ENABLE_HTTP_FILE_TRACING, false);
	if (enableTracing)
	{
		if (oFF.isNull(traceInfo) || traceInfo.getTraceType() !== oFF.TraceType.FILE)
		{
			var tracingFolder = env.getVariable(oFF.XEnvironmentConstants.HTTP_FILE_TRACING_FOLDER);
			if (oFF.notNull(tracingFolder))
			{
				var tracingFolderFile = oFF.XFile.createByNativePath(process, tracingFolder);
				if (tracingFolderFile.isExisting() && tracingFolderFile.isDirectory())
				{
					var urlString = tracingFolderFile.getUrl();
					traceInfo = oFF.TraceInfo.create();
					traceInfo.setTraceFolderPath(urlString);
					traceInfo.setTraceType(oFF.TraceType.FILE);
					traceInfo.setTraceName(this.getProcess().getApplicationName());
					systemConnect.setTraceInfo(traceInfo);
					this.log2("Enabling file tracing: ", tracingFolder);
				}
			}
		}
	}
	if (oFF.isNull(traceInfo))
	{
		return this.getTraceInfoGlobal();
	}
	return traceInfo;
};
oFF.ConnectionPool.prototype.getTraceInfoGlobal = function()
{
	if (oFF.isNull(this.m_traceInfoGlobal))
	{
		var traceName = this.getEnvironment().getStringByKey(oFF.XEnvironmentConstants.FIREFLY_TRACE_NAME);
		if (oFF.XStringUtils.isNotNullAndNotEmpty(traceName))
		{
			var traceInfo = oFF.TraceInfo.create();
			traceInfo.setTraceType(oFF.TraceType.URL);
			traceInfo.setTraceName(traceName);
			this.m_traceInfoGlobal = traceInfo;
		}
	}
	return this.m_traceInfoGlobal;
};
oFF.ConnectionPool.prototype.setTraceInfo = function(systemName, traceInfo)
{
	this.getSystemConnectBase(systemName).setTraceInfo(traceInfo);
};
oFF.ConnectionPool.prototype.getAuthenticationToken = function(systemName)
{
	var connectionPersonalization = this.getProcess().getUserManager().getConnectionPersonalization(systemName);
	return connectionPersonalization.getAuthenticationToken();
};
oFF.ConnectionPool.prototype.setAuthenticationToken = function(systemName, token)
{
	var connectionPersonalization = this.getProcess().getUserManager().getConnectionPersonalization(systemName);
	connectionPersonalization.setAuthenticationToken(token);
};
oFF.ConnectionPool.prototype.getAccessToken = function(systemName)
{
	var connectionPersonalization = this.getProcess().getUserManager().getConnectionPersonalization(systemName);
	return connectionPersonalization.getAccessToken();
};
oFF.ConnectionPool.prototype.setAccessToken = function(systemName, token)
{
	var connectionPersonalization = this.getProcess().getUserManager().getConnectionPersonalization(systemName);
	connectionPersonalization.setAccessToken(token);
};
oFF.ConnectionPool.prototype.getReentranceTicket = function(systemName)
{
	return this.getSystemConnectBase(systemName).getReentranceTicket();
};
oFF.ConnectionPool.prototype.setReentranceTicket = function(systemName, reentranceTicket)
{
	this.getSystemConnectBase(systemName).setReentranceTicket(reentranceTicket);
};
oFF.ConnectionPool.prototype.setIsInAMergeProcessingEnabled = function(systemName, isInAMergeProcessing)
{
	if (this.getSession().hasFeature(oFF.FeatureToggleOlap.INA_MERGE_PROCESSING) && oFF.isNull(this.m_inaMergeProcessor))
	{
		this.m_inaMergeProcessor = oFF.InAMergeProcessorFactory.createInAMergeProcessor(this);
	}
	if (oFF.notNull(this.m_inaMergeProcessor))
	{
		this.m_inaMergeProcessor.setIsRequestsProcessed(!isInAMergeProcessing);
		var systemConnect = this.getSystemConnectBase(systemName);
		var sysConnections = systemConnect.getSharedConnections();
		if (!sysConnections.isEmpty())
		{
			for (var i = 0; i < sysConnections.size(); i++)
			{
				var connectionContainer = sysConnections.get(i);
				connectionContainer.setIsInAMergeProcessingEnabled(isInAMergeProcessing);
			}
		}
	}
};
oFF.ConnectionPool.prototype.isInAMergeProcessingEnabled = function(systemName)
{
	var isInAMergeProcessing = false;
	var systemConnect = this.getSystemConnectBase(systemName);
	var sysConnections = systemConnect.getSharedConnections();
	if (!sysConnections.isEmpty())
	{
		for (var i = 0; i < sysConnections.size(); i++)
		{
			var connectionContainer = sysConnections.get(i);
			if (connectionContainer.isInAMergeProcessingEnabled())
			{
				isInAMergeProcessing = true;
			}
		}
	}
	return isInAMergeProcessing;
};
oFF.ConnectionPool.prototype.setInAMergeProcessingMode = function(inaMergeProcessingMode)
{
	this.m_inaMergeProcessor.setInAMergeProcessingMode(inaMergeProcessingMode);
};
oFF.ConnectionPool.prototype.getInAMergeProcessor = function()
{
	return this.m_inaMergeProcessor;
};
oFF.ConnectionPool.prototype.setBatchModeForInAQueryMerge = function(syncType, sysConnections, systemName, isBatchEnabled)
{
	if (!isBatchEnabled && oFF.notNull(this.m_inaMergeProcessor) && !this.m_inaMergeProcessor.isRequestsProcessed())
	{
		this.m_inaMergeProcessor.processInAMerge(syncType, systemName);
	}
	for (var i = 0; i < sysConnections.size(); i++)
	{
		sysConnections.get(i).setBatchModeEnabled(syncType, isBatchEnabled);
	}
};
oFF.ConnectionPool.prototype.enableBatchMode = function(systemName)
{
	this.setBatchMode(null, systemName, true);
};
oFF.ConnectionPool.prototype.executeBatchQueue = function(syncType, systemName)
{
	if (this.getSystemConnectBase(systemName).isBatchEnabled())
	{
		this.setBatchMode(syncType, systemName, false);
		this.setBatchMode(syncType, systemName, true);
	}
};
oFF.ConnectionPool.prototype.getBatchQueueSize = function(systemName)
{
	var size = 0;
	var systemConnect = this.getSystemConnectBase(systemName);
	var sysConnections = systemConnect.getSharedConnections();
	if (oFF.notNull(sysConnections))
	{
		for (var i = 0; i < sysConnections.size(); i++)
		{
			size = size + sysConnections.get(i).getBatchQueueSize();
		}
	}
	return size;
};
oFF.ConnectionPool.prototype.disableBatchMode = function(syncType, systemName)
{
	this.setBatchMode(syncType, systemName, false);
};
oFF.ConnectionPool.prototype.enableBatchStreaming = function()
{
	this.m_batchRsStreamingEnabled = true;
};
oFF.ConnectionPool.prototype.disableBatchStreaming = function()
{
	this.m_batchRsStreamingEnabled = false;
};
oFF.ConnectionPool.prototype.setBatchBypassEnabled = function(batchBypassEnabled)
{
	this.m_batchBypassEnabled = batchBypassEnabled;
};
oFF.ConnectionPool.prototype.isBatchBypassEnabled = function()
{
	return this.m_batchBypassEnabled;
};
oFF.ConnectionPool.prototype.setBatchMode = function(syncType, systemName, isBatchEnabled)
{
	var systemConnect = this.getSystemConnectBase(systemName);
	var sysConnections = systemConnect.getSharedConnections();
	if (isBatchEnabled && sysConnections.isEmpty())
	{
		var connection = systemConnect.getConnectionExt(false, systemName);
		connection.getServerMetadata();
	}
	systemConnect.setIsBatchEnabled(isBatchEnabled);
	if (this.isInAMergeProcessingEnabled(systemName))
	{
		this.setBatchModeForInAQueryMerge(syncType, sysConnections, systemName, isBatchEnabled);
	}
	else
	{
		for (var i = 0; i < sysConnections.size(); i++)
		{
			if (!isBatchEnabled && this.m_batchRsStreamingEnabled)
			{
				sysConnections.get(i).disableBatchModeWithRsStreaming(syncType);
			}
			sysConnections.get(i).setBatchModeEnabled(syncType, isBatchEnabled);
		}
	}
};
oFF.ConnectionPool.prototype.isBatchModeEnabled = function(systemName)
{
	return this.getSystemConnectBase(systemName).isBatchEnabled();
};
oFF.ConnectionPool.prototype.getCookiesMasterStore = function()
{
	return this.m_cookiesMasterStore;
};
oFF.ConnectionPool.prototype.getSystemLandscape = function()
{
	var systemLandscape = this.getProcess().getSystemLandscape();
	return systemLandscape;
};
oFF.ConnectionPool.prototype.processMergePersist = function(systemName)
{
	var mergedPersistResponse = null;
	var inAMergeProcessor = this.getInAMergeProcessor();
	if (oFF.notNull(inAMergeProcessor))
	{
		var originalInAMergeProcessingMode = inAMergeProcessor.getInAMergeProcessingMode();
		inAMergeProcessor.setInAMergeProcessingMode(oFF.InAMergeProcessingMode.MERGE_PERSIST);
		inAMergeProcessor.processInAMerge(null, systemName);
		inAMergeProcessor.setInAMergeProcessingMode(originalInAMergeProcessingMode);
		mergedPersistResponse = inAMergeProcessor.getMergedPersistResponse(systemName);
	}
	return mergedPersistResponse;
};
oFF.ConnectionPool.prototype.setMergedPersistResponse = function(mergedRequest, systemName)
{
	var inAMergeProcessor = this.getInAMergeProcessor();
	if (oFF.notNull(inAMergeProcessor))
	{
		inAMergeProcessor.setMergedPersistResponse(mergedRequest, systemName);
	}
};

oFF.SystemConnect = function() {};
oFF.SystemConnect.prototype = new oFF.DfNameObject();
oFF.SystemConnect.prototype._ff_c = "SystemConnect";

oFF.SystemConnect.create = function(connectionPool, systemName, systemDescription)
{
	var newObj = new oFF.SystemConnect();
	newObj.setupSystemConnect(connectionPool, systemName, systemDescription);
	return newObj;
};
oFF.SystemConnect._checkList = function(list)
{
	for (var i = 0; i < list.size(); )
	{
		if (list.get(i).isReleased())
		{
			list.removeAt(i);
		}
		else
		{
			i++;
		}
	}
};
oFF.SystemConnect.clearConnectionsFromList = function(connections)
{
	if (oFF.notNull(connections))
	{
		while (connections.size() > 0)
		{
			oFF.XObjectExt.release(connections.get(0));
		}
	}
};
oFF.SystemConnect.prototype.m_connectionPool = null;
oFF.SystemConnect.prototype.m_traceInfo = null;
oFF.SystemConnect.prototype.m_cache = null;
oFF.SystemConnect.prototype.m_isBatchEnabled = false;
oFF.SystemConnect.prototype.m_isEQSEnabled = false;
oFF.SystemConnect.prototype.m_reentranceTicket = null;
oFF.SystemConnect.prototype.m_dirtyConnections = null;
oFF.SystemConnect.prototype.m_sharedConnections = null;
oFF.SystemConnect.prototype.m_privateConnections = null;
oFF.SystemConnect.prototype.m_systemDescription = null;
oFF.SystemConnect.prototype.m_maximumSharedConnections = 0;
oFF.SystemConnect.prototype.m_currentSharedIndex = 0;
oFF.SystemConnect.prototype.m_internalConnectionCounter = 0;
oFF.SystemConnect.prototype.m_externalActiveConnections = 0;
oFF.SystemConnect.prototype.m_isPreflightRequired = false;
oFF.SystemConnect.prototype.m_preflightUri = null;
oFF.SystemConnect.prototype.m_serverMetadata = null;
oFF.SystemConnect.prototype.m_csrfToken = null;
oFF.SystemConnect.prototype.m_systemKeepAliveManager = null;
oFF.SystemConnect.prototype.setupSystemConnect = function(connectionPool, systemName, systemDescription)
{
	this.m_connectionPool = oFF.XWeakReferenceUtil.getWeakRef(connectionPool);
	this._setupInternal(systemName);
	this.m_sharedConnections = oFF.XList.create();
	this.m_privateConnections = oFF.XList.create();
	this.m_dirtyConnections = oFF.XList.create();
	this.m_systemDescription = systemDescription;
	this.m_maximumSharedConnections = 1;
	if (this.m_systemDescription.isPreflightRequired())
	{
		var preflight = this.m_systemDescription.getResolvedPreflightUrl();
		this.m_preflightUri = oFF.XUri.createFromUrl(preflight);
		this.m_isPreflightRequired = true;
	}
	this.m_systemKeepAliveManager = oFF.SystemKeepAliveManager.create(this);
};
oFF.SystemConnect.prototype.releaseObject = function()
{
	this.clearConnections();
	if (oFF.notNull(this.m_systemKeepAliveManager))
	{
		this.m_systemKeepAliveManager = oFF.XObjectExt.release(this.m_systemKeepAliveManager);
	}
	this.m_cache = null;
	this.m_connectionPool = null;
	this.m_dirtyConnections = oFF.XObjectExt.release(this.m_dirtyConnections);
	this.m_privateConnections = oFF.XObjectExt.release(this.m_privateConnections);
	this.m_sharedConnections = oFF.XObjectExt.release(this.m_sharedConnections);
	this.m_reentranceTicket = null;
	this.m_systemDescription = null;
	this.m_traceInfo = null;
	oFF.DfNameObject.prototype.releaseObject.call( this );
};
oFF.SystemConnect.prototype._checkReleasedConnections = function()
{
	oFF.SystemConnect._checkList(this.m_sharedConnections);
	oFF.SystemConnect._checkList(this.m_privateConnections);
	oFF.SystemConnect._checkList(this.m_dirtyConnections);
};
oFF.SystemConnect.prototype.getConnectionExt = function(isPrivate, name)
{
	var sysConnections;
	var connectionContainer = null;
	if (isPrivate)
	{
		sysConnections = this.getPrivateConnections();
	}
	else
	{
		sysConnections = this.getSharedConnections();
		connectionContainer = this.getNextSharedConnection(name);
	}
	if (oFF.isNull(connectionContainer))
	{
		connectionContainer = oFF.ConnectionContainer.create(this, this.getSystemName(), isPrivate, this.m_internalConnectionCounter);
		this.m_internalConnectionCounter++;
		this.updateConnectionWithServerMetadata(connectionContainer);
		connectionContainer.setName(name);
		if (this.m_systemDescription.getSystemType().isTypeOf(oFF.SystemType.BW))
		{
			var env = this.getConnectionPoolBase().getSession().getEnvironment();
			var uriSession = env.getBooleanByKeyExt(oFF.XEnvironmentConstants.HTTP_ALLOW_URI_SESSION, true);
			if (uriSession)
			{
				connectionContainer.setUseUrlSessionId(true);
			}
		}
		sysConnections.add(connectionContainer);
	}
	this.m_systemKeepAliveManager.startPolling();
	return connectionContainer;
};
oFF.SystemConnect.prototype.getNextSharedConnection = function(name)
{
	var connection;
	if (oFF.notNull(name))
	{
		connection = oFF.XCollectionUtils.getByName(this.m_sharedConnections, name);
		if (oFF.notNull(connection))
		{
			return connection;
		}
	}
	if (this.m_isBatchEnabled && !this.m_sharedConnections.isEmpty())
	{
		return this.m_sharedConnections.get(0);
	}
	if (this.getTotalUsedConnections() >= this.m_maximumSharedConnections)
	{
		if (this.m_currentSharedIndex >= this.m_sharedConnections.size())
		{
			this.m_currentSharedIndex = 0;
		}
		connection = this.m_sharedConnections.get(this.m_currentSharedIndex);
		if (connection.getName() === null && oFF.notNull(name))
		{
			connection.setName(name);
		}
		this.m_currentSharedIndex++;
		return connection;
	}
	return null;
};
oFF.SystemConnect.prototype.getTraceInfo = function()
{
	return this.m_traceInfo;
};
oFF.SystemConnect.prototype.setTraceInfo = function(traceInfo)
{
	this.m_traceInfo = traceInfo;
};
oFF.SystemConnect.prototype.getConnectionCache = function()
{
	if (oFF.isNull(this.m_cache))
	{
		var process = this.getProcess();
		this.m_cache = process.getSystemCache(this.getSystemName());
	}
	return this.m_cache;
};
oFF.SystemConnect.prototype.isBatchEnabled = function()
{
	return this.m_isBatchEnabled;
};
oFF.SystemConnect.prototype.setIsBatchEnabled = function(isBatchEnabled)
{
	this.m_isBatchEnabled = isBatchEnabled;
};
oFF.SystemConnect.prototype.isEQSEnabled = function()
{
	return this.m_isEQSEnabled;
};
oFF.SystemConnect.prototype.setIsEQSEnabled = function(isEQSEnabled)
{
	this.m_isEQSEnabled = isEQSEnabled;
};
oFF.SystemConnect.prototype.getReentranceTicket = function()
{
	return this.m_reentranceTicket;
};
oFF.SystemConnect.prototype.setReentranceTicket = function(reentranceTicket)
{
	this.m_reentranceTicket = reentranceTicket;
};
oFF.SystemConnect.prototype.getAllOpenConnections = function(allOpenConnections)
{
	allOpenConnections.addAll(this.m_sharedConnections);
	allOpenConnections.addAll(this.m_privateConnections);
	return allOpenConnections;
};
oFF.SystemConnect.prototype.getSharedConnections = function()
{
	return this.m_sharedConnections;
};
oFF.SystemConnect.prototype.getPrivateConnections = function()
{
	return this.m_privateConnections;
};
oFF.SystemConnect.prototype.clearConnections = function()
{
	oFF.SystemConnect.clearConnectionsFromList(this.m_sharedConnections);
	oFF.SystemConnect.clearConnectionsFromList(this.m_privateConnections);
	if (oFF.notNull(this.m_systemKeepAliveManager))
	{
		this.m_systemKeepAliveManager.stopPolling();
	}
};
oFF.SystemConnect.prototype.getSystemName = function()
{
	return this.getName();
};
oFF.SystemConnect.prototype.getSystemType = function()
{
	return this.getSystemDescription().getSystemType();
};
oFF.SystemConnect.prototype.getSystemDescription = function()
{
	return this.m_systemDescription;
};
oFF.SystemConnect.prototype.setMaximumSharedConnections = function(maximumSharedConnections)
{
	this.m_maximumSharedConnections = maximumSharedConnections;
};
oFF.SystemConnect.prototype.getMaximumSharedConnections = function()
{
	return this.m_maximumSharedConnections;
};
oFF.SystemConnect.prototype.setExternalActiveConnections = function(activeConnections)
{
	this.m_externalActiveConnections = activeConnections;
};
oFF.SystemConnect.prototype.setExternalSharedConnection = function(name, csrfToken, sessionUrlRewrite)
{
	if (oFF.isNull(name))
	{
		var connection;
		for (var i = 0; i < this.m_sharedConnections.size(); )
		{
			connection = this.m_sharedConnections.get(i);
			if (connection.useSessionUrlRewrite() && oFF.XString.isEqual(connection.getSessionUrlRewrite(), sessionUrlRewrite))
			{
				return;
			}
		}
		if (this.getTotalUsedConnections() < this.m_maximumSharedConnections)
		{
			connection = this.getConnectionExt(false, name);
			if (oFF.notNull(connection))
			{
				if (connection.useSessionUrlRewrite() && connection.getSessionUrlRewrite() === null)
				{
					connection.setSessionUrlRewrite(sessionUrlRewrite);
					connection.setCsrfToken(csrfToken);
				}
			}
		}
	}
};
oFF.SystemConnect.prototype.getTotalUsedConnections = function()
{
	return this.m_sharedConnections.size() + this.m_externalActiveConnections;
};
oFF.SystemConnect.prototype.getConnectionPoolBase = function()
{
	return oFF.XWeakReferenceUtil.getHardRef(this.m_connectionPool);
};
oFF.SystemConnect.prototype.isPreflightNeeded = function()
{
	return this.m_isPreflightRequired;
};
oFF.SystemConnect.prototype.setIsPreflightNeeded = function(isPrefligthNeeded)
{
	this.m_isPreflightRequired = isPrefligthNeeded;
};
oFF.SystemConnect.prototype.getPreflightUri = function()
{
	return this.m_preflightUri;
};
oFF.SystemConnect.prototype.getServerMetadata = function()
{
	return this.getServerMetadataExt(oFF.SyncType.BLOCKING, null, null).getData();
};
oFF.SystemConnect.prototype.setServerMetadata = function(serverMetadata)
{
	this.m_serverMetadata = serverMetadata;
	var allOpenConnections = this.getAllOpenConnections(oFF.XList.create());
	for (var i = 0; i < allOpenConnections.size(); i++)
	{
		var connection = allOpenConnections.get(i);
		this.updateConnectionWithServerMetadata(connection);
	}
};
oFF.SystemConnect.prototype.updateConnectionWithServerMetadata = function(connection)
{
	if (oFF.notNull(this.m_serverMetadata))
	{
		connection.setReentranceTicket(this.m_serverMetadata.getReentranceTicket());
		var inaMetadata = this.m_serverMetadata.getMetadataForService(oFF.ServerService.INA);
		if (oFF.notNull(inaMetadata))
		{
			var batchCapability = inaMetadata.getByKey(oFF.ConnectionConstants.INA_CAPABILITY_SUPPORTS_BATCH);
			if (oFF.notNull(batchCapability))
			{
				var analyticsMetadata = this.m_serverMetadata.getMetadataForService(oFF.ServerService.ANALYTIC);
				var batchRsStreaming = oFF.notNull(analyticsMetadata) && analyticsMetadata.containsKey(oFF.ConnectionConstants.INA_CAPABILITY_SUPPORTS_BATCH_RS_STREAMING);
				connection.setSupportsBatchMode(true, batchRsStreaming, batchCapability.getValue());
				var xxlWSCapability = oFF.isNull(analyticsMetadata) ? null : analyticsMetadata.getByKey(oFF.ConnectionConstants.INA_FASTPATH_XXL_WS);
				if (oFF.notNull(xxlWSCapability))
				{
					connection.setWebServicePathForBLOBs(xxlWSCapability.getValue());
				}
			}
		}
		var session = this.getConnectionPoolBase().getProcess();
		var personalizationForSystem = session.getUserManager().getConnectionPersonalization(connection.getSystemName());
		personalizationForSystem.setTenantId(this.m_serverMetadata.getTenantId());
		personalizationForSystem.setInternalUser(this.m_serverMetadata.getOrcaUserName());
	}
};
oFF.SystemConnect.prototype.getServerMetadataExt = function(syncType, listener, customIdentifier)
{
	if (oFF.notNull(this.m_serverMetadata) && this.m_serverMetadata.isReleased())
	{
		this.m_serverMetadata = null;
	}
	var result;
	if (oFF.isNull(this.m_serverMetadata))
	{
		result = this.getConnectionPoolBase().getOpenConnection(this.getSystemName()).getServerMetadataExt(syncType, listener, customIdentifier, oFF.HttpSemanticRequestType.SERVER_METADATA);
	}
	else
	{
		result = oFF.ExtResult.create(this.m_serverMetadata, null);
		if (oFF.notNull(listener))
		{
			listener.onServerMetadataLoaded(result, this.m_serverMetadata, customIdentifier);
		}
	}
	return result;
};
oFF.SystemConnect.prototype.getProcess = function()
{
	return this.getConnectionPoolBase().getProcess();
};
oFF.SystemConnect.prototype.getSession = function()
{
	return this.getConnectionPoolBase().getSession();
};
oFF.SystemConnect.prototype.isContextIdRequired = function()
{
	return this.getSystemDescription().isContextIdRequired();
};
oFF.SystemConnect.prototype.isCsrfTokenRequired = function()
{
	return this.getSystemDescription().isCsrfTokenRequired();
};
oFF.SystemConnect.prototype.getCsrfToken = function()
{
	if (this.getSession().hasFeature(oFF.FeatureToggleOlap.SHARED_CSRF_TOKENS))
	{
		return this.m_csrfToken;
	}
	else
	{
		oFF.noSupport();
	}
};
oFF.SystemConnect.prototype.setCsrfToken = function(csrfToken)
{
	if (this.getSession().hasFeature(oFF.FeatureToggleOlap.SHARED_CSRF_TOKENS))
	{
		this.m_csrfToken = csrfToken;
	}
	else
	{
		oFF.noSupport();
	}
};
oFF.SystemConnect.prototype.setCsrfRequiredCount = oFF.noSupport;
oFF.SystemConnect.prototype.getCsrfRequiredCount = oFF.noSupport;
oFF.SystemConnect.prototype.incCsrfRequiredCount = oFF.noSupport;
oFF.SystemConnect.prototype.registerKeepAliveListener = function(listener)
{
	this.m_systemKeepAliveManager.registerKeepAliveListener(listener);
};
oFF.SystemConnect.prototype.unregisterKeepAliveListener = function(listener)
{
	this.m_systemKeepAliveManager.unregisterKeepAliveListener(listener);
};
oFF.SystemConnect.prototype.newBatchRequestManager = function()
{
	var session = this.getSession();
	return oFF.BatchRequestManagerFactory.createBatchRequestManager(session);
};
oFF.SystemConnect.prototype.newBatchFunction = function(connection, relativeUri)
{
	return oFF.RpcBatchFunction.create(connection, relativeUri);
};

oFF.RpcRequest = function() {};
oFF.RpcRequest.prototype = new oFF.XObject();
oFF.RpcRequest.prototype._ff_c = "RpcRequest";

oFF.RpcRequest.create = function(ocpFunction, connectionInfo, functionUri, traceInfo)
{
	var request = new oFF.RpcRequest();
	request.setupExt(ocpFunction, connectionInfo, functionUri, traceInfo);
	return request;
};
oFF.RpcRequest.prototype.m_type = null;
oFF.RpcRequest.prototype.m_function = null;
oFF.RpcRequest.prototype.m_connectionInfo = null;
oFF.RpcRequest.prototype.m_mainParameterStructure = null;
oFF.RpcRequest.prototype.m_method = null;
oFF.RpcRequest.prototype.m_additionalParameters = null;
oFF.RpcRequest.prototype.m_acceptContentType = null;
oFF.RpcRequest.prototype.m_requestContentType = null;
oFF.RpcRequest.prototype.m_isFireAndForgetCall = false;
oFF.RpcRequest.prototype.m_isLogoff = false;
oFF.RpcRequest.prototype.m_isStatelessRequestEnforced = false;
oFF.RpcRequest.prototype.m_cacheFingerprint = null;
oFF.RpcRequest.prototype.m_cacheFingerprintGenerator = null;
oFF.RpcRequest.prototype.m_sapPassportConnectionId = null;
oFF.RpcRequest.prototype.m_sapPassportTransactionId = null;
oFF.RpcRequest.prototype.m_processingHint = null;
oFF.RpcRequest.prototype.m_useStaticUrl = false;
oFF.RpcRequest.prototype.m_traceInfo = null;
oFF.RpcRequest.prototype.m_functionUri = null;
oFF.RpcRequest.prototype.setupExt = function(ocpFunction, connectionInfo, functionUri, traceInfo)
{
	this.m_type = oFF.HttpSemanticRequestType.NONE;
	this.m_method = oFF.HttpRequestMethod.HTTP_POST;
	this.m_acceptContentType = oFF.ContentType.APPLICATION_JSON;
	this.m_requestContentType = oFF.ContentType.APPLICATION_JSON;
	this.m_additionalParameters = oFF.XProperties.create();
	this.m_sapPassportConnectionId = oFF.XGuid.getGuid();
	this.m_processingHint = oFF.PrFactory.createStructure();
	this.m_functionUri = functionUri;
	this.m_traceInfo = traceInfo;
	this.setFunction(ocpFunction);
	this.setConnectionInfo(connectionInfo);
};
oFF.RpcRequest.prototype.releaseObject = function()
{
	this.m_traceInfo = null;
	this.m_type = null;
	this.m_function = null;
	this.m_functionUri = null;
	this.m_connectionInfo = null;
	this.m_mainParameterStructure = null;
	this.m_method = null;
	this.m_acceptContentType = null;
	this.m_requestContentType = null;
	this.m_additionalParameters = oFF.XObjectExt.release(this.m_additionalParameters);
	this.m_processingHint = oFF.XObjectExt.release(this.m_processingHint);
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.RpcRequest.prototype.getRequestStructure = function()
{
	return this.m_mainParameterStructure;
};
oFF.RpcRequest.prototype.getRequestType = function()
{
	return this.m_type;
};
oFF.RpcRequest.prototype.setRequestType = function(requestType)
{
	this.m_type = requestType;
};
oFF.RpcRequest.prototype.setRequestStructure = function(requestStructure)
{
	this.m_mainParameterStructure = requestStructure;
	this.m_type = oFF.HttpSemanticRequestType.detectTypeFromJson(requestStructure);
};
oFF.RpcRequest.prototype.getMethod = function()
{
	return this.m_method;
};
oFF.RpcRequest.prototype.setMethod = function(method)
{
	this.m_method = method;
};
oFF.RpcRequest.prototype.getAdditionalParameters = function()
{
	return this.m_additionalParameters;
};
oFF.RpcRequest.prototype.getAcceptContentType = function()
{
	return this.m_acceptContentType;
};
oFF.RpcRequest.prototype.setAcceptContentType = function(contentType)
{
	this.m_acceptContentType = contentType;
};
oFF.RpcRequest.prototype.getRequestContentType = function()
{
	return this.m_requestContentType;
};
oFF.RpcRequest.prototype.setRequestContentType = function(contentType)
{
	this.m_requestContentType = contentType;
};
oFF.RpcRequest.prototype.getFunction = function()
{
	return oFF.XWeakReferenceUtil.getHardRef(this.m_function);
};
oFF.RpcRequest.prototype.setFunction = function(ocpFunction)
{
	this.m_function = oFF.XWeakReferenceUtil.getWeakRef(ocpFunction);
};
oFF.RpcRequest.prototype.getConnectionInfo = function()
{
	return oFF.XWeakReferenceUtil.getHardRef(this.m_connectionInfo);
};
oFF.RpcRequest.prototype.setConnectionInfo = function(connectionInfo)
{
	this.m_connectionInfo = oFF.XWeakReferenceUtil.getWeakRef(connectionInfo);
};
oFF.RpcRequest.prototype.isFireAndForgetCall = function()
{
	return this.m_isFireAndForgetCall;
};
oFF.RpcRequest.prototype.setIsFireAndForgetCall = function(isFireAndForgetCall)
{
	this.m_isFireAndForgetCall = isFireAndForgetCall;
};
oFF.RpcRequest.prototype.setIsLogoff = function(isLogoff)
{
	this.m_isLogoff = isLogoff;
};
oFF.RpcRequest.prototype.isLogoff = function()
{
	return this.m_isLogoff;
};
oFF.RpcRequest.prototype.isStatelessRequestEnforced = function()
{
	return this.m_isStatelessRequestEnforced;
};
oFF.RpcRequest.prototype.setIsStatelessRequestEnforced = function(isStatelessRequestEnforced)
{
	this.m_isStatelessRequestEnforced = isStatelessRequestEnforced;
};
oFF.RpcRequest.prototype.getCacheFingerprint = function()
{
	if (oFF.isNull(this.m_cacheFingerprint) && oFF.notNull(this.m_cacheFingerprintGenerator))
	{
		this.m_cacheFingerprint = this.m_cacheFingerprintGenerator.generateCacheFingerprint(this);
	}
	return this.m_cacheFingerprint;
};
oFF.RpcRequest.prototype.setCacheFingerprint = function(fingerprint)
{
	this.m_cacheFingerprint = fingerprint;
};
oFF.RpcRequest.prototype.getCacheFingerprintGenerator = function()
{
	return this.m_cacheFingerprintGenerator;
};
oFF.RpcRequest.prototype.setCacheFingerprintGenerator = function(generator)
{
	this.m_cacheFingerprintGenerator = generator;
};
oFF.RpcRequest.prototype.setSapPassportConnectionId = function(sapPassportConnectionId)
{
	this.m_sapPassportConnectionId = sapPassportConnectionId;
};
oFF.RpcRequest.prototype.getSapPassportConnectionId = function()
{
	return this.m_sapPassportConnectionId;
};
oFF.RpcRequest.prototype.getProcessingHint = function()
{
	return this.m_processingHint;
};
oFF.RpcRequest.prototype.setUseStaticUrl = function(useStaticUrl)
{
	this.m_useStaticUrl = useStaticUrl;
};
oFF.RpcRequest.prototype.useStaticUrl = function()
{
	return this.m_useStaticUrl;
};
oFF.RpcRequest.prototype.getTraceInfo = function()
{
	return this.m_traceInfo;
};
oFF.RpcRequest.prototype.getName = function()
{
	return this.m_functionUri.toString();
};
oFF.RpcRequest.prototype.getUri = function()
{
	return this.m_functionUri;
};
oFF.RpcRequest.prototype.getSapPassportTransactionId = function()
{
	return this.m_sapPassportTransactionId;
};
oFF.RpcRequest.prototype.setSapPassportTransactionId = function(sapPassportTransactionId)
{
	this.m_sapPassportTransactionId = sapPassportTransactionId;
};

oFF.Kernel = function() {};
oFF.Kernel.prototype = new oFF.XObjectExt();
oFF.Kernel.prototype._ff_c = "Kernel";

oFF.Kernel.s_instance = null;
oFF.Kernel.staticSetup = function() {};
oFF.Kernel.create = function(environmentConfig)
{
	var newObj = new oFF.Kernel();
	newObj.setupExt(environmentConfig);
	if (oFF.XLanguage.getLanguage() === oFF.XLanguage.JAVASCRIPT || oFF.XLanguage.getLanguage() === oFF.XLanguage.TYPESCRIPT && oFF.isNull(oFF.Kernel.s_instance))
	{
		oFF.Kernel.s_instance = newObj;
	}
	return newObj;
};
oFF.Kernel.getInstance = function()
{
	return oFF.Kernel.s_instance;
};
oFF.Kernel.runCmd = function(cmd)
{
	var kernel = oFF.Kernel.getInstance();
	if (oFF.notNull(kernel))
	{
		var kernelProcess = kernel.getKernelProcess();
		var startCfg = oFF.ProgramStartCfg.createByCmdLine(kernelProcess, cmd);
		startCfg.setIsNewConsoleNeeded(true);
		startCfg.processExecution(oFF.SyncType.NON_BLOCKING, null, null);
	}
};
oFF.Kernel.prototype.m_kernelProcess = null;
oFF.Kernel.prototype.m_moduleManager = null;
oFF.Kernel.prototype.m_processIdCounter = 0;
oFF.Kernel.prototype.m_processEventListeners = null;
oFF.Kernel.prototype.m_prgNameReplacements = null;
oFF.Kernel.prototype.m_subSystems = null;
oFF.Kernel.prototype.m_queue = null;
oFF.Kernel.prototype.m_isQueueProcessing = false;
oFF.Kernel.prototype.m_mountExp = null;
oFF.Kernel.prototype.setupExt = function(environmentConfig)
{
	oFF.XObjectExt.prototype.setup.call( this );
	this.m_subSystems = oFF.XHashMapByString.create();
	this.m_kernelProcess = oFF.Process.createExt(this, null, oFF.ProcessType.ROOT, environmentConfig, oFF.XDefaultDateTimeProvider.create());
	this.m_moduleManager = oFF.ModuleManager.create(this.m_kernelProcess);
	this.m_processEventListeners = oFF.XList.create();
	this.m_prgNameReplacements = oFF.XHashMapOfStringByString.create();
	this.prepareEnvVariables();
};
oFF.Kernel.prototype.getLogLayer = function()
{
	return oFF.OriginLayer.KERNEL;
};
oFF.Kernel.prototype.getLogWriter = function()
{
	if (oFF.notNull(this.m_kernelProcess))
	{
		return this.m_kernelProcess.getLogWriter();
	}
	else
	{
		return oFF.XLogger.getInstance();
	}
};
oFF.Kernel.prototype.prepareEnvVariables = function()
{
	var env = this.m_kernelProcess.getEnvironment();
	var sdkVar = env.getVariable(oFF.XEnvironmentConstants.FIREFLY_SDK);
	if (oFF.notNull(sdkVar))
	{
		var tempPath = env.getVariable(oFF.XEnvironmentConstants.FIREFLY_TMP);
		if (oFF.isNull(tempPath))
		{
			tempPath = oFF.XStringUtils.concatenate3("${", oFF.XEnvironmentConstants.FIREFLY_SDK, "}production/tmp/");
			env.setVariable(oFF.XEnvironmentConstants.FIREFLY_TMP, tempPath);
		}
		var cachePath = env.getVariable(oFF.XEnvironmentConstants.FIREFLY_CACHE);
		if (oFF.isNull(cachePath) && oFF.notNull(tempPath))
		{
			cachePath = oFF.XStringUtils.concatenate3("${", oFF.XEnvironmentConstants.FIREFLY_TMP, "}cache/");
			env.setVariable(oFF.XEnvironmentConstants.FIREFLY_CACHE, cachePath);
		}
		var resourcesPath = env.getVariable(oFF.XEnvironmentConstants.FIREFLY_RESOURCES);
		if (oFF.isNull(resourcesPath))
		{
			resourcesPath = oFF.XStringUtils.concatenate3("${", oFF.XEnvironmentConstants.FIREFLY_SDK, "}production/resources/");
			env.setVariable(oFF.XEnvironmentConstants.FIREFLY_RESOURCES, resourcesPath);
		}
		var mimesPath = env.getVariable(oFF.XEnvironmentConstants.FIREFLY_MIMES);
		if (oFF.isNull(mimesPath))
		{
			mimesPath = oFF.XStringUtils.concatenate3("${", oFF.XEnvironmentConstants.FIREFLY_SDK, "}production/resources/");
			env.setVariable(oFF.XEnvironmentConstants.FIREFLY_MIMES, mimesPath);
		}
		var userProfile = env.getVariable(oFF.XEnvironmentConstants.FIREFLY_USER_PROFILE);
		if (oFF.isNull(userProfile))
		{
			userProfile = oFF.XStringUtils.concatenate3("${", oFF.XEnvironmentConstants.FIREFLY_SDK, "}production/user/userprofile.json");
			env.setVariable(oFF.XEnvironmentConstants.FIREFLY_USER_PROFILE, userProfile);
		}
		var systemLandscape = env.getVariable(oFF.XEnvironmentConstants.SYSTEM_LANDSCAPE_URI);
		if (oFF.isNull(systemLandscape))
		{
			systemLandscape = oFF.XStringUtils.concatenate3("${", oFF.XEnvironmentConstants.FIREFLY_SDK, "}production/systems/SystemLandscapeAllWithPwds.json");
			env.setVariable(oFF.XEnvironmentConstants.SYSTEM_LANDSCAPE_URI, systemLandscape);
		}
	}
	var prgReplace = env.getStringByKey(oFF.XEnvironmentConstants.FIREFLY_PRG_REPLACE);
	if (oFF.notNull(prgReplace))
	{
		var values = oFF.XStringTokenizer.splitString(prgReplace, ",");
		for (var i = 0; i < values.size(); i++)
		{
			var statement = values.get(i);
			var delim = oFF.XString.indexOf(statement, "~");
			if (delim !== -1)
			{
				var source = oFF.XString.substring(statement, 0, delim);
				var target = oFF.XString.substring(statement, delim + 1, -1);
				this.registerProgramTarget(source, target);
			}
		}
	}
	if (env.getBooleanByKeyExt(oFF.XEnvironmentConstants.FIREFLY_LOCKING, false))
	{
		env.enableLocking();
	}
	var enableVfs = env.getBooleanByKeyExt(oFF.XEnvironmentConstants.ENABLE_VFS, true);
	if (enableVfs)
	{
		this.configureVfs(env);
	}
};
oFF.Kernel.prototype.configureVfs = function(env)
{
	var fileSystemManager = this.m_kernelProcess.getFileSystemManager();
	var pfs = oFF.PrgFileSystem.create(this.m_kernelProcess);
	fileSystemManager.setFileSystem(oFF.ProtocolType.PRG, pfs);
	var vfs = oFF.VfsFileSystem.create(this.m_kernelProcess);
	fileSystemManager.setFileSystem(oFF.ProtocolType.VFS, vfs);
	env.setVariable("ff_mount_01", "/prg:prg:///");
	var sdkDir = oFF.XFile.createFromEnvVar(this.m_kernelProcess, oFF.XEnvironmentConstants.FIREFLY_SDK, null);
	if (oFF.notNull(sdkDir) && sdkDir.isValid())
	{
		var originSdk = env.getVariable(oFF.XEnvironmentConstants.FIREFLY_SDK);
		env.setVariable(oFF.XEnvironmentConstants.FIREFLY_SDK_ORIGIN, originSdk);
		env.setVariable(oFF.XEnvironmentConstants.FIREFLY_SDK, "vfs:///sdk/");
		env.setVariable("ff_mount_02", oFF.XStringUtils.concatenate2("/sdk:", originSdk));
	}
	var mountExpEnv = env.getAllPrefixMatches(oFF.XEnvironmentConstants.FIREFLY_MOUNT);
	this.m_mountExp = oFF.XList.create();
	this.m_mountExp.addAll(mountExpEnv);
	this.evaluteRemainingVfsMountings();
	fileSystemManager.setActiveFileSystem(oFF.ProtocolType.VFS);
};
oFF.Kernel.prototype.evaluteRemainingVfsMountings = function()
{
	var fileSystemManager = this.m_kernelProcess.getFileSystemManager();
	var vfs = fileSystemManager.getFileSystem(oFF.ProtocolType.VFS);
	for (var i = 0; i < this.m_mountExp.size(); i++)
	{
		var pair = this.m_mountExp.get(i);
		var value = pair.getValue();
		var index = oFF.XString.indexOf(value, ":");
		if (index !== -1)
		{
			var mountPath = oFF.XString.substring(value, 0, index);
			if (oFF.XString.startsWith(mountPath, oFF.XFile.SLASH) === false)
			{
				this.logError2("Mounting vfs. Not a valid path expression: ", mountPath);
			}
			else
			{
				var mountFsUrl = oFF.XString.substring(value, index + 1, -1);
				var mountFsUri = oFF.XUri.createFromFilePath(this.m_kernelProcess, mountFsUrl, oFF.PathFormat.AUTO_DETECT, oFF.VarResolveMode.DOLLAR, oFF.ProtocolType.FILE);
				if (mountFsUri.getProtocolType() === null)
				{
					this.logExt(this.getLogLayer(), oFF.Severity.INFO, 0, oFF.XStringUtils.concatenate4("Mounting vfs. Not (yet) a valid url expression: ", mountFsUrl, " ==> ", mountFsUri.toString()));
				}
				else
				{
					vfs.addMountPointByUri(mountPath, mountFsUri);
					this.m_mountExp.removeAt(i);
					i--;
				}
			}
		}
		else
		{
			this.logError2("Mounting vfs. Not a valid expression, missing ':' : ", value);
		}
	}
};
oFF.Kernel.prototype.newSession = function(version)
{
	var subSession = this.m_kernelProcess.newChildProcess(oFF.ProcessType.SERVICE);
	subSession.setXVersion(version);
	return subSession;
};
oFF.Kernel.prototype.getKernelProcessBase = function()
{
	return this.m_kernelProcess;
};
oFF.Kernel.prototype.getKernelProcess = function()
{
	return this.m_kernelProcess;
};
oFF.Kernel.prototype.getLoadedModules = function()
{
	return oFF.DfModule.getLoadedModuleNames();
};
oFF.Kernel.prototype.loadModule = function(name)
{
	var moduleNames = oFF.XListOfString.create();
	moduleNames.add(name);
	this.processModuleLoad(oFF.SyncType.BLOCKING, null, null, moduleNames);
};
oFF.Kernel.prototype.processModuleLoad = function(syncType, listener, customIdentifier, moduleNames)
{
	var action = this.m_moduleManager.processLoadModules(syncType, moduleNames, listener, customIdentifier);
	return action;
};
oFF.Kernel.prototype.isModuleLoaded = function(name)
{
	var loadedModuleNames = oFF.DfModule.getLoadedModuleNames();
	var loadedModules = oFF.XStringTokenizer.splitString(loadedModuleNames, ",");
	return loadedModules.contains(name);
};
oFF.Kernel.prototype.newProcessId = function()
{
	var processId = oFF.XInteger.convertToString(this.m_processIdCounter);
	this.m_processIdCounter++;
	return processId;
};
oFF.Kernel.prototype.registerOnEvent = function(listener)
{
	this.m_processEventListeners.add(listener);
};
oFF.Kernel.prototype.unregisterOnEvent = function(listener)
{
	for (var i = 0; i < this.m_processEventListeners.size(); )
	{
		var currentListener = this.m_processEventListeners.get(i);
		if (currentListener === listener)
		{
			this.m_processEventListeners.removeAt(i);
		}
		else
		{
			i++;
		}
	}
};
oFF.Kernel.prototype.getAllProcessEventListeners = function()
{
	return this.m_processEventListeners;
};
oFF.Kernel.prototype.onProcessEvent = function(event, process, eventType)
{
	for (var k = 0; k < this.m_processEventListeners.size(); k++)
	{
		var listener2 = this.m_processEventListeners.get(k);
		listener2.onProcessEvent(event, process, event.getEventType());
	}
};
oFF.Kernel.prototype.getChildProcessById = function(processId)
{
	var selected = this.selectProcesses(null, processId);
	var process = null;
	if (selected.size() > 0)
	{
		process = selected.get(0);
	}
	return process;
};
oFF.Kernel.prototype.selectProcesses = function(entity, processId)
{
	var list = oFF.XList.create();
	this.recursiveSelect(list, this.m_kernelProcess, entity, processId);
	return list;
};
oFF.Kernel.prototype.recursiveSelect = function(list, process, entity, processId)
{
	var isEntitySelected = oFF.isNull(entity) || process.getEntity(entity) !== null;
	var isIdSelected = oFF.isNull(processId) || oFF.XString.isEqual(process.getProcessId(), processId);
	if (isEntitySelected && isIdSelected)
	{
		list.add(process);
	}
	var childProcesses = process.getChildProcesses();
	for (var i = 0; i < childProcesses.size(); i++)
	{
		var childProcess = childProcesses.get(i);
		this.recursiveSelect(list, childProcess, entity, processId);
	}
};
oFF.Kernel.prototype.notifyReady = function()
{
	this.log("Kernel initialized");
};
oFF.Kernel.prototype.resolveProgramName = function(originProgramName)
{
	var targetName = this.m_prgNameReplacements.getByKey(originProgramName);
	if (oFF.isNull(targetName))
	{
		targetName = originProgramName;
	}
	return targetName;
};
oFF.Kernel.prototype.getProgramManifest = function(name)
{
	var manifest = oFF.ProgramRegistration.getProgramManifest(name);
	return manifest;
};
oFF.Kernel.prototype.registerProgramTarget = function(originProgramName, targetProgramName)
{
	this.m_prgNameReplacements.put(originProgramName, targetProgramName);
};
oFF.Kernel.prototype.processTerminateProcess = function(syncType, listener, customIdentifier, processId, exitCode, hardKill)
{
	return oFF.ProcessTerminateAction.createAndRun(syncType, listener, customIdentifier, this, processId, exitCode, hardKill);
};
oFF.Kernel.prototype.getSession = function()
{
	return this.m_kernelProcess;
};
oFF.Kernel.prototype.getProcess = function()
{
	return this.m_kernelProcess;
};
oFF.Kernel.prototype.startPrg = function(startCfg, syncType, listener)
{
	if (oFF.notNull(startCfg))
	{
		if (startCfg.getParentProcess() === null)
		{
			startCfg.setParentProcess(this.m_kernelProcess);
		}
		var activeSyncType = oFF.notNull(syncType) ? syncType : oFF.SyncType.NON_BLOCKING;
		return startCfg.processExecution(activeSyncType, listener, startCfg);
	}
	return null;
};
oFF.Kernel.prototype.isExecutable = function(manifest)
{
	var run = true;
	var prgProfiles = manifest.getProfiles();
	if (oFF.notNull(prgProfiles) && prgProfiles.size() > 0)
	{
		run = false;
		var prgProfileValues = prgProfiles.getValuesAsReadOnlyListOfString();
		var environment = this.getSession().getEnvironment();
		var sysProfiles = environment.getStringByKey(oFF.XEnvironmentConstants.FIREFLY_PROFILES);
		var sysProfileList = oFF.XStringTokenizer.splitString(sysProfiles, ",");
		var magicName = oFF.XStringUtils.concatenate2("~", manifest.getName());
		if (sysProfileList.contains(oFF.XEnvironmentConstants.FIREFLY_PROFILE_DEV) === true || sysProfileList.contains(magicName))
		{
			run = true;
		}
		else
		{
			for (var i = 0; i < prgProfileValues.size(); i++)
			{
				var value = prgProfileValues.get(i);
				if (oFF.XString.isEqual(value, "*") || sysProfileList.contains(value))
				{
					run = true;
					break;
				}
			}
		}
	}
	return run;
};
oFF.Kernel.prototype.getSubSystemContainer = function(type)
{
	return this.getSubSystemContainerExt(type, null);
};
oFF.Kernel.prototype.getSubSystemContainerExt = function(type, selectorName)
{
	var container = null;
	if (oFF.notNull(type))
	{
		var name = type.getName();
		if (oFF.notNull(selectorName))
		{
			name = oFF.XStringUtils.concatenate3(name, ".", selectorName);
		}
		container = this.m_subSystems.getByKey(name);
		if (oFF.isNull(container))
		{
			container = oFF.SubSystemContainer.create(this, type, selectorName);
			this.m_subSystems.put(name, container);
		}
	}
	return container;
};
oFF.Kernel.prototype.getAllSubSystemTypes = function()
{
	var types = oFF.XListOfNameObject.create();
	var allManifests = oFF.ProgramRegistration.getOrderedAllEntries();
	var index = oFF.XString.size(oFF.ProgramRegistration.SUBSYS_PREFIX);
	for (var i = 0; i < allManifests.size(); i++)
	{
		var currentManifest = allManifests.get(i);
		var name = currentManifest.getName();
		if (oFF.XString.startsWith(name, oFF.ProgramRegistration.SUBSYS_PREFIX))
		{
			var subsystemName = oFF.XString.substring(name, index, -1);
			if (oFF.XString.containsString(subsystemName, "."))
			{
				var delimiter = oFF.XString.indexOf(subsystemName, ".");
				subsystemName = oFF.XString.substring(subsystemName, 0, delimiter);
			}
			var type = oFF.SubSystemType.lookup(subsystemName);
			if (oFF.notNull(type))
			{
				types.add(type);
			}
		}
	}
	return types;
};
oFF.Kernel.prototype.getAllSubSystemSelectors = function(type)
{
	var selectors = oFF.XListOfString.create();
	var allManifests = oFF.ProgramRegistration.getOrderedAllEntries();
	var prefix = oFF.XStringUtils.concatenate3(oFF.ProgramRegistration.SUBSYS_PREFIX, type.getName(), ".");
	var index = oFF.XString.size(prefix);
	for (var i = 0; i < allManifests.size(); i++)
	{
		var currentManifest = allManifests.get(i);
		var name = currentManifest.getName();
		if (oFF.XString.startsWith(name, prefix))
		{
			var selectorName = oFF.XString.substring(name, index, -1);
			selectors.add(selectorName);
		}
	}
	return selectors;
};
oFF.Kernel.prototype.addToListenerQueue = function(syncAction)
{
	if (oFF.isNull(this.m_queue))
	{
		this.m_queue = oFF.XList.create();
	}
	if (!this.m_queue.contains(syncAction))
	{
		this.m_queue.add(syncAction);
		this.processQueue();
	}
	return true;
};
oFF.Kernel.prototype.processQueue = function()
{
	if (this.m_isQueueProcessing === false)
	{
		this.m_isQueueProcessing = true;
		while (this.m_queue.size() > 0)
		{
			for (var i = 0; i < this.m_queue.size(); )
			{
				var currentSyncAction = this.m_queue.get(i);
				var moreListeners = false;
				try
				{
					moreListeners = currentSyncAction.callListeners(false);
				}
				catch (e)
				{
					this.logError(oFF.XException.getStackTrace(e, 0));
				}
				if (moreListeners === true)
				{
					i++;
				}
				else
				{
					this.m_queue.removeAt(i);
				}
			}
		}
		this.m_isQueueProcessing = false;
	}
};

oFF.KernelBoot = function() {};
oFF.KernelBoot.prototype = new oFF.XObjectExt();
oFF.KernelBoot.prototype._ff_c = "KernelBoot";

oFF.KernelBoot.create = function()
{
	var newObj = new oFF.KernelBoot();
	newObj.setupExt(null);
	return newObj;
};
oFF.KernelBoot.createByName = function(name)
{
	var newObj = new oFF.KernelBoot();
	newObj.setupExt(name);
	return newObj;
};
oFF.KernelBoot.prototype.m_kernel = null;
oFF.KernelBoot.prototype.m_kernelProcess = null;
oFF.KernelBoot.prototype.m_mountPoints = null;
oFF.KernelBoot.prototype.m_environmentConfig = null;
oFF.KernelBoot.prototype.m_defaultSyncType = null;
oFF.KernelBoot.prototype.m_doMaxDomainRelaxation = false;
oFF.KernelBoot.prototype.m_proxySettings = null;
oFF.KernelBoot.prototype.m_listener = null;
oFF.KernelBoot.prototype.m_startConfigs = null;
oFF.KernelBoot.prototype.m_persistentState = null;
oFF.KernelBoot.prototype.m_numberOfProgramsToStart = 0;
oFF.KernelBoot.prototype.m_additionalModulesToLoad = null;
oFF.KernelBoot.prototype.m_kernelReadyConsumer = null;
oFF.KernelBoot.prototype.m_useSingletonIfPossible = false;
oFF.KernelBoot.prototype.m_hasPersistentState = false;
oFF.KernelBoot.prototype.setupExt = function(prgName)
{
	this.m_mountPoints = oFF.XList.create();
	this.m_environmentConfig = oFF.XHashMapOfStringByString.create();
	this.m_startConfigs = oFF.XList.create();
	this.m_listener = oFF.XList.create();
	this.m_defaultSyncType = oFF.SyncType.NON_BLOCKING;
	if (oFF.XStringUtils.isNotNullAndNotEmpty(prgName))
	{
		this.addStartConfig(prgName);
	}
	this.m_additionalModulesToLoad = oFF.XListOfString.create();
};
oFF.KernelBoot.prototype.releaseObject = function()
{
	this.m_kernelProcess = oFF.XObjectExt.release(this.m_kernelProcess);
	this.m_persistentState = oFF.XObjectExt.release(this.m_persistentState);
	this.m_additionalModulesToLoad = oFF.XObjectExt.release(this.m_additionalModulesToLoad);
	this.m_kernelReadyConsumer = null;
	oFF.XObjectExt.prototype.releaseObject.call( this );
};
oFF.KernelBoot.prototype.runFull = function()
{
	this.initializeKernel();
	if (this.m_hasPersistentState)
	{
		this.m_persistentState = oFF.KernelPersistentState.create(this.m_kernel);
		this.m_kernel.registerOnEvent(this.m_persistentState);
	}
	this.m_numberOfProgramsToStart = this.m_startConfigs.size();
	for (var i = 0; i < this.m_startConfigs.size(); i++)
	{
		var startCfg = this.m_startConfigs.get(i);
		this.startPrg(startCfg);
	}
};
oFF.KernelBoot.prototype.startPrg = function(startCfg)
{
	var action = this.m_kernel.startPrg(startCfg, oFF.SyncType.DELAYED, this);
	if (oFF.notNull(action))
	{
		if (oFF.notNull(this.m_listener) && this.m_listener.hasElements())
		{
			for (var k = 0; k < this.m_listener.size(); k++)
			{
				var tmpOtherListener = this.m_listener.get(k);
				action.attachListener(tmpOtherListener, oFF.ListenerType.SPECIFIC, startCfg);
			}
		}
		action.setActiveSyncType(this.m_defaultSyncType);
		action.process();
	}
};
oFF.KernelBoot.prototype.processFragment = function()
{
	if (oFF.notNull(this.m_persistentState))
	{
		var cfgList = this.m_persistentState.getInitialCfgs();
		if (oFF.notNull(cfgList))
		{
			for (var k = 0; k < cfgList.size(); k++)
			{
				var startCfg = cfgList.get(k);
				this.startPrg(startCfg);
			}
		}
	}
};
oFF.KernelBoot.prototype.loadAdditionalModulesIfNeeded = function()
{
	if (oFF.notNull(this.m_kernel) && oFF.notNull(this.m_additionalModulesToLoad) && this.m_additionalModulesToLoad.size() > 0)
	{
		this.log(oFF.XStringUtils.concatenate3("ADDITIONAL MODULES: Loading modules '", this.m_additionalModulesToLoad.toString(), "'"));
		this.m_kernel.processModuleLoad(this.m_defaultSyncType, this, null, this.m_additionalModulesToLoad);
	}
};
oFF.KernelBoot.prototype.callKernelReadyConsumer = function()
{
	if (oFF.notNull(this.m_kernelReadyConsumer) && oFF.notNull(this.m_kernel))
	{
		this.m_kernelReadyConsumer(this.m_kernel);
	}
};
oFF.KernelBoot.prototype.onProgramStarted = function(extResult, program, customIdentifier)
{
	var startCfg = customIdentifier;
	if (extResult.isValid())
	{
		this.log(oFF.XStringUtils.concatenate3("SUCCESS: Program '", startCfg.getName(), "' started"));
	}
	else
	{
		this.log(oFF.XStringUtils.concatenate3("ERROR: Program '", startCfg.getName(), "' cannot be started"));
		this.log(extResult.getSummary());
	}
	if (this.m_startConfigs.contains(startCfg))
	{
		this.m_numberOfProgramsToStart--;
		if (this.m_numberOfProgramsToStart === 0)
		{
			this.processFragment();
		}
	}
};
oFF.KernelBoot.prototype.initializeKernel = function()
{
	if (oFF.isNull(this.m_kernel))
	{
		if (this.m_useSingletonIfPossible && oFF.Kernel.getInstance() !== null)
		{
			this.m_kernel = oFF.Kernel.getInstance();
			this.m_kernelProcess = this.m_kernel.getKernelProcessBase();
		}
		else
		{
			this.m_kernel = oFF.Kernel.create(this.m_environmentConfig);
			this.m_kernelProcess = this.m_kernel.getKernelProcessBase();
			if (oFF.notNull(this.m_defaultSyncType))
			{
				this.m_kernelProcess.setDefaultSyncType(this.m_defaultSyncType);
			}
			if (oFF.notNull(this.m_proxySettings))
			{
				this.m_kernelProcess.setProxySettings(this.m_proxySettings);
			}
			if (this.m_doMaxDomainRelaxation)
			{
				var location = oFF.NetworkEnv.getLocation();
				var host = location.getHost();
				var lastDotIndex = oFF.XString.lastIndexOf(host, ".");
				if (lastDotIndex !== -1)
				{
					var secondLastDotIndex = oFF.XString.lastIndexOfFrom(host, ".", lastDotIndex - 1);
					if (secondLastDotIndex !== -1)
					{
						var reducedHost = oFF.XString.substring(host, secondLastDotIndex + 1, -1);
						oFF.NetworkEnv.setDomain(reducedHost);
						var exclude = oFF.XStringUtils.concatenate2("*.", reducedHost);
						this.m_kernelProcess.getProxySettings().getProxyExcludesBase().add(exclude);
					}
				}
			}
			this.m_kernel.notifyReady();
		}
		this.callKernelReadyConsumer();
		this.loadAdditionalModulesIfNeeded();
	}
};
oFF.KernelBoot.prototype.doMaxDomainRelaxation = function()
{
	this.m_doMaxDomainRelaxation = true;
};
oFF.KernelBoot.prototype.setInitialSystemType = function(systemType)
{
	if (oFF.notNull(systemType))
	{
		this.setArgument(oFF.DfProgram.PARAM_INITIAL_SYS_TYPE, systemType.getName());
	}
};
oFF.KernelBoot.prototype.setSystemLandscapeUrl = function(url)
{
	if (oFF.notNull(url))
	{
		this.setEnvironmentVariable(oFF.XEnvironmentConstants.SYSTEM_LANDSCAPE_URI, url);
	}
};
oFF.KernelBoot.prototype.getSystemLandscapeUrl = function()
{
	return this.m_environmentConfig.getByKey(oFF.XEnvironmentConstants.SYSTEM_LANDSCAPE_URI);
};
oFF.KernelBoot.prototype.setNativeAnchorId = function(nativeAnchorId)
{
	var currentStartConfig = this.getCurrentStartConfig();
	if (oFF.notNull(currentStartConfig))
	{
		currentStartConfig.setNativeAnchorId(nativeAnchorId);
	}
	this.setEnvironmentVariable(oFF.XEnvironmentConstants.FIREFLY_UI_ANCHOR_ID, nativeAnchorId);
};
oFF.KernelBoot.prototype.setNativeAnchorObject = function(nativeAnchorObject)
{
	var currentStartConfig = this.getCurrentStartConfig();
	if (oFF.notNull(currentStartConfig))
	{
		currentStartConfig.setNativeAnchorObject(nativeAnchorObject);
	}
};
oFF.KernelBoot.prototype.getNativeAnchorId = function()
{
	var currentStartConfig = this.getCurrentStartConfig();
	if (oFF.notNull(currentStartConfig))
	{
		return currentStartConfig.getNativeAnchorId();
	}
	return null;
};
oFF.KernelBoot.prototype.getNativeAnchorObject = function()
{
	var currentStartConfig = this.getCurrentStartConfig();
	if (oFF.notNull(currentStartConfig))
	{
		return currentStartConfig.getNativeAnchorObject();
	}
	return null;
};
oFF.KernelBoot.prototype.setArgument = function(name, value)
{
	var currentStartConfig = this.getCurrentStartConfig();
	if (oFF.notNull(currentStartConfig))
	{
		currentStartConfig.getArguments().putString(name, value);
	}
};
oFF.KernelBoot.prototype.setBooleanArgument = function(name, boolValue)
{
	var currentStartConfig = this.getCurrentStartConfig();
	if (oFF.notNull(currentStartConfig))
	{
		currentStartConfig.getArguments().putBoolean(name, boolValue);
	}
};
oFF.KernelBoot.prototype.setIntegerArgument = function(name, intValue)
{
	var currentStartConfig = this.getCurrentStartConfig();
	if (oFF.notNull(currentStartConfig))
	{
		currentStartConfig.getArguments().putInteger(name, intValue);
	}
};
oFF.KernelBoot.prototype.setObjectArgument = function(name, objVal)
{
	var currentStartConfig = this.getCurrentStartConfig();
	if (oFF.notNull(currentStartConfig))
	{
		currentStartConfig.getArguments().putXObject(name, objVal);
	}
};
oFF.KernelBoot.prototype.getCurrentStartConfig = function()
{
	if (this.m_startConfigs.size() > 0)
	{
		return this.m_startConfigs.get(this.m_startConfigs.size() - 1);
	}
	else
	{
		return null;
	}
};
oFF.KernelBoot.prototype.addStartConfig = function(name)
{
	var startCfg = oFF.ProgramStartCfg.create(null, name, name, null);
	startCfg.setEnforcedContainerType(oFF.ProgramContainerType.STANDALONE);
	this.m_startConfigs.add(startCfg);
	return startCfg;
};
oFF.KernelBoot.prototype.addMountPoint = function(name, path)
{
	this.m_mountPoints.add(oFF.XNameValuePair.create(name, path));
};
oFF.KernelBoot.prototype.setDispatcherUri = function(uri)
{
	this.setWebdispatcherTemplate(uri);
};
oFF.KernelBoot.prototype.setWebdispatcherTemplate = function(template)
{
	this.setEnvironmentVariable(oFF.XEnvironmentConstants.FF_DISPATCHER_TEMPLATE, template);
};
oFF.KernelBoot.prototype.getWebdispatcherTemplate = function()
{
	return this.m_environmentConfig.getByKey(oFF.XEnvironmentConstants.FF_DISPATCHER_TEMPLATE);
};
oFF.KernelBoot.prototype.addExcludeProxyByUrl = function(url)
{
	var uri = oFF.XUri.createFromUrl(url);
	var host = uri.getHost();
	this.getProxySettings().getProxyExcludesBase().add(host);
};
oFF.KernelBoot.prototype.getProxyHost = function()
{
	return this.getProxySettings().getProxyHost();
};
oFF.KernelBoot.prototype.getProxyPort = function()
{
	return this.getProxySettings().getProxyPort();
};
oFF.KernelBoot.prototype.getProxyAuthorization = function()
{
	return this.getProxySettings().getProxyAuthorization();
};
oFF.KernelBoot.prototype.setProxyAuthorization = function(authorization)
{
	this.getProxySettings().setProxyAuthorization(authorization);
};
oFF.KernelBoot.prototype.getSccLocationId = function()
{
	return this.getProxySettings().getSccLocationId();
};
oFF.KernelBoot.prototype.setSccLocationId = function(sccLocationId)
{
	this.getProxySettings().setSccLocationId(sccLocationId);
};
oFF.KernelBoot.prototype.getProxyType = function()
{
	return this.getProxySettings().getProxyType();
};
oFF.KernelBoot.prototype.setProxyHost = function(host)
{
	this.getProxySettings().setProxyHost(host);
};
oFF.KernelBoot.prototype.setProxyPort = function(port)
{
	this.getProxySettings().setProxyPort(port);
};
oFF.KernelBoot.prototype.setProxyType = function(type)
{
	this.getProxySettings().setProxyType(type);
};
oFF.KernelBoot.prototype.getProxyHttpHeaders = function()
{
	return this.getProxySettings().getProxyHttpHeaders();
};
oFF.KernelBoot.prototype.setProxyHttpHeader = function(name, value)
{
	this.getProxySettings().setProxyHttpHeader(name, value);
};
oFF.KernelBoot.prototype.getProxySettings = function()
{
	if (oFF.isNull(this.m_proxySettings))
	{
		this.m_proxySettings = oFF.ProxySettings.create(null);
	}
	return this.m_proxySettings;
};
oFF.KernelBoot.prototype.getDefaultSyncType = function()
{
	return this.m_defaultSyncType;
};
oFF.KernelBoot.prototype.setDefaultSyncType = function(syncType)
{
	this.m_defaultSyncType = syncType;
};
oFF.KernelBoot.prototype.setEnvironmentVariable = function(name, value)
{
	this.m_environmentConfig.put(name, value);
};
oFF.KernelBoot.prototype.setModuleLoadUrl = function(moduleGroup, url)
{
	oFF.ModuleManager.setModuleLoadUrl(moduleGroup, url);
	this.setEnvironmentVariable(oFF.XEnvironmentConstants.FIREFLY_MODULE_PATH, url);
};
oFF.KernelBoot.prototype.addProgramStartedListener = function(listener)
{
	this.m_listener.add(listener);
};
oFF.KernelBoot.prototype.setHasPersistentState = function(hasPersistentState)
{
	this.m_hasPersistentState = hasPersistentState;
};
oFF.KernelBoot.prototype.hasPersistentState = function()
{
	return this.m_hasPersistentState;
};
oFF.KernelBoot.prototype.setXVersion = function(xVersion)
{
	if (xVersion !== -1)
	{
		this.setEnvironmentVariable(oFF.XEnvironmentConstants.XVERSION, oFF.XInteger.convertToString(xVersion));
	}
};
oFF.KernelBoot.prototype.getXVersion = oFF.noSupport;
oFF.KernelBoot.prototype.setKernel = function(kernel)
{
	this.m_kernel = kernel;
};
oFF.KernelBoot.prototype.getKernel = function()
{
	return this.m_kernel;
};
oFF.KernelBoot.prototype.addModule = function(moduleName)
{
	this.m_additionalModulesToLoad.add(moduleName);
};
oFF.KernelBoot.prototype.onModuleLoadedMulti = function(extResult, rootModuleNames, customIdentifier)
{
	if (extResult.isValid())
	{
		this.log("ADDITIONAL MODULES: Successfully loaded modules");
	}
	else
	{
		this.log("ADDITIONAL MODULES: Failed to load modules");
	}
	this.m_additionalModulesToLoad.clear();
};
oFF.KernelBoot.prototype.setKernelReadyConsumer = function(consumer)
{
	this.m_kernelReadyConsumer = consumer;
};
oFF.KernelBoot.prototype.setUseSingletonKernel = function(useSingletonKernel)
{
	this.m_useSingletonIfPossible = useSingletonKernel;
};
oFF.KernelBoot.prototype.isSingletonKernelUsed = function()
{
	return this.m_useSingletonIfPossible;
};

oFF.DfProgram = function() {};
oFF.DfProgram.prototype = new oFF.XObjectExt();
oFF.DfProgram.prototype._ff_c = "DfProgram";

oFF.DfProgram.PARAM_SHOW_HELP = "help";
oFF.DfProgram.PARAM_SYNC_TYPE = "SyncType";
oFF.DfProgram.PARAM_VALUE_BLOCKING = "Blocking";
oFF.DfProgram.PARAM_VALUE_NON_BLOCKING = "NonBlocking";
oFF.DfProgram.PARAM_LOG_LEVEL = "loglevel";
oFF.DfProgram.PARAM_LOG_LAYER = "loglayer";
oFF.DfProgram.PARAM_XVERSION = "xversion";
oFF.DfProgram.PARAM_FEATURES = "features";
oFF.DfProgram.PARAM_INITIAL_SYS_TYPE = "initsystype";
oFF.DfProgram.PARAM_SYS_LANDSCAPE = "SystemLandscape";
oFF.DfProgram.PARAM_FILE = "file";
oFF.DfProgram.prototype.m_process = null;
oFF.DfProgram.prototype.m_showHelp = false;
oFF.DfProgram.prototype.m_argsConverted = false;
oFF.DfProgram.prototype.m_initialSystemType = null;
oFF.DfProgram.prototype.m_exitValues = null;
oFF.DfProgram.prototype.getName = function()
{
	return this.getProgramName();
};
oFF.DfProgram.prototype.getResolvedProgramContainerType = function()
{
	var resvoledContainerType = oFF.ProgramContainerType.NONE;
	if (this.getProcess() !== null)
	{
		var prgCfg = this.getProcess().getProgramCfg();
		if (oFF.notNull(prgCfg) && prgCfg.getResolvedContainerType() !== oFF.ProgramContainerType.NONE)
		{
			resvoledContainerType = prgCfg.getResolvedContainerType();
		}
	}
	if (oFF.isNull(resvoledContainerType) || resvoledContainerType === oFF.ProgramContainerType.NONE)
	{
		resvoledContainerType = this.getDefaultContainerType();
	}
	return resvoledContainerType;
};
oFF.DfProgram.prototype.getDefaultContainerType = function()
{
	return oFF.ProgramContainerType.NONE;
};
oFF.DfProgram.prototype.setup = function()
{
	oFF.XObjectExt.prototype.setup.call( this );
};
oFF.DfProgram.prototype.releaseObject = function()
{
	this.m_process = null;
	this.m_initialSystemType = null;
	oFF.XObjectExt.prototype.releaseObject.call( this );
};
oFF.DfProgram.prototype.getComponentType = function()
{
	return oFF.XComponentType.PROGRAM;
};
oFF.DfProgram.prototype.getLogLayer = function()
{
	return oFF.OriginLayer.APPLICATION;
};
oFF.DfProgram.prototype.getProgramMetadata = function()
{
	var metadata = oFF.ProgramMetadata.create();
	this.doSetupProgramMetadata(metadata);
	return metadata;
};
oFF.DfProgram.prototype.runFull = function()
{
	try
	{
		this.prepareArguments();
		this.initializeProgram();
		this.evalArguments();
		this.runProgram();
	}
	catch (e)
	{
		this.getStdout().print("\nUnexpected exception during Program Execution\n");
		this.getStdout().println(oFF.XErrorHelper.convertExceptionToString(e));
		this.getStdout().println(oFF.XException.getStackTrace(e, 0));
	}
};
oFF.DfProgram.prototype.doSetupProgramMetadata = function(metadata)
{
	metadata.addOption(oFF.DfProgram.PARAM_SYNC_TYPE, "The Synchronization type.", "Blocking|NonBlocking", oFF.XValueType.ENUM_CONSTANT);
	metadata.addOption(oFF.DfProgram.PARAM_SHOW_HELP, "Print the help text.", null, oFF.XValueType.BOOLEAN);
	metadata.addOption(oFF.DfProgram.PARAM_LOG_LEVEL, "Log level, 0-3. Default is 3.", "0: Debug, 1: Info, 2: Warning, 3: Error", oFF.XValueType.INTEGER);
	metadata.addOption(oFF.DfProgram.PARAM_LOG_LAYER, "Log layer, comma-separated. Default is all", "Server|Protocol|IOLayer|Driver|Application|Utility|Test|Misc|All|None", oFF.XValueType.STRING);
	var buffer = oFF.XStringBuffer.create();
	buffer.appendInt(oFF.XVersion.MIN);
	buffer.append(" - ");
	buffer.appendInt(oFF.XVersion.MAX);
	metadata.addOption(oFF.DfProgram.PARAM_XVERSION, "XVersion. Default is the inherited basedline (typically XVersion.MAX)", buffer.toString(), oFF.XValueType.INTEGER);
	metadata.addOption(oFF.DfProgram.PARAM_FEATURES, "List of feature toggles, comma-separated.", "...", oFF.XValueType.STRING);
	metadata.addOption(oFF.DfProgram.PARAM_INITIAL_SYS_TYPE, "Initial system type", "HANA|BW|...", oFF.XValueType.STRING);
};
oFF.DfProgram.prototype.prepareArguments = function()
{
	var session = this.getSession();
	if (oFF.isNull(session))
	{
		throw oFF.XException.createIllegalStateException("No session given at startup time");
	}
	var prgArgs = this.getArguments();
	var argumentDefinitions = prgArgs.getArgumentDefinitions();
	for (var i = 0; i < argumentDefinitions.size(); i++)
	{
		var argDef = argumentDefinitions.get(i);
		if (argDef.isMandatory())
		{
			if (prgArgs.containsKey(argDef.getName()) === false)
			{
				this.println(oFF.XStringUtils.concatenate2("Argument not given: ", argDef.getName()));
				this.setShowHelp(true);
			}
		}
	}
	var syncParam = prgArgs.getStringByKeyExt(oFF.DfProgram.PARAM_SYNC_TYPE, null);
	if (oFF.notNull(syncParam))
	{
		if (oFF.XString.isEqual(syncParam, oFF.DfProgram.PARAM_VALUE_BLOCKING))
		{
			session.setDefaultSyncType(oFF.SyncType.BLOCKING);
		}
		else
		{
			session.setDefaultSyncType(oFF.SyncType.NON_BLOCKING);
		}
	}
	var logLevel = prgArgs.getIntegerByKeyExt(oFF.DfProgram.PARAM_LOG_LEVEL, -1);
	if (logLevel !== -1)
	{
		var logWriterWithFilter = session.getLogWriterBase();
		logWriterWithFilter.setLogFilterLevel(logLevel);
	}
	var logLayerName = prgArgs.getStringByKeyExt(oFF.DfProgram.PARAM_LOG_LAYER, null);
	if (oFF.notNull(logLayerName))
	{
		var logWriterWithFilter2 = session.getLogWriterBase();
		logWriterWithFilter2.addLogLayer(logLayerName);
	}
	var xVersionValue = prgArgs.getIntegerByKeyExt(oFF.DfProgram.PARAM_XVERSION, -3);
	if (xVersionValue !== -3)
	{
		session.setXVersion(xVersionValue);
	}
	var features = prgArgs.getStringByKey(oFF.DfProgram.PARAM_FEATURES);
	if (oFF.XStringUtils.isNotNullAndNotEmpty(features))
	{
		var featureValues = oFF.XStringTokenizer.splitString(features, ",");
		for (var k = 0; k < featureValues.size(); k++)
		{
			var featureToggle = oFF.FeatureToggleOlap.lookup(featureValues.get(k));
			if (oFF.notNull(featureToggle))
			{
				session.activateFeatureToggle(featureToggle);
			}
		}
	}
	this.setShowHelp(prgArgs.getBooleanByKeyExt(oFF.DfProgram.PARAM_SHOW_HELP, this.m_showHelp));
	var initialSystemTypeValue = prgArgs.getStringByKey(oFF.DfProgram.PARAM_INITIAL_SYS_TYPE);
	if (oFF.XStringUtils.isNotNullAndNotEmpty(initialSystemTypeValue))
	{
		var initialSystemType = oFF.SystemType.lookup(initialSystemTypeValue);
		this.setInitialSystemType(initialSystemType);
	}
};
oFF.DfProgram.prototype.initializeProgram = function() {};
oFF.DfProgram.prototype.evalArguments = function() {};
oFF.DfProgram.prototype.runProgram = function()
{
	if (this.m_showHelp === true)
	{
		var programMetadata = this.getProgramMetadata();
		var helpText = oFF.ProgramUtils.generateHelp(programMetadata);
		this.println(helpText);
		this.getProgramContainer().setExitContent(oFF.XContent.createStringContent(oFF.ContentType.TEXT, helpText));
		this.exitNow(1);
	}
	else
	{
		this.runProcess();
	}
};
oFF.DfProgram.prototype.terminate = function()
{
	if (this.canTerminate())
	{
		this.exitNow(0);
	}
};
oFF.DfProgram.prototype.kill = function()
{
	this.terminateProgramInternal(0, true);
};
oFF.DfProgram.prototype.canTerminate = function()
{
	return true;
};
oFF.DfProgram.prototype.onContainerAfterOpen = function() {};
oFF.DfProgram.prototype.onContainerAfterClose = function() {};
oFF.DfProgram.prototype.exitNow = function(code)
{
	this.terminateProgramInternal(0, false);
};
oFF.DfProgram.prototype.isShowHelp = function()
{
	return this.m_showHelp;
};
oFF.DfProgram.prototype.setShowHelp = function(hasShowHelp)
{
	this.m_showHelp = hasShowHelp;
};
oFF.DfProgram.prototype.updateFileParam = function(file)
{
	var prgArgs = this.getArguments();
	if (oFF.notNull(file))
	{
		var filePath = file.getUri().getPath();
		prgArgs.putString(oFF.DfProgram.PARAM_FILE, filePath);
	}
	else
	{
		prgArgs.remove(oFF.DfProgram.PARAM_FILE);
	}
	this.getProcess().notifyProcessEvent(oFF.ProcessEventType.START_CFG_CHANGED);
};
oFF.DfProgram.prototype.terminateProgramInternal = function(code, kill)
{
	var process = this.getProcess();
	if (oFF.notNull(process))
	{
		var processId = process.getProcessId();
		var kernel = process.getKernel();
		kernel.processTerminateProcess(null, null, null, processId, code, kill);
	}
};
oFF.DfProgram.prototype.getProgramContainer = function()
{
	var process = this.getProcess();
	var startConfiguration = process.getProgramCfg();
	var programContainer = startConfiguration.getProgramContainer();
	return programContainer;
};
oFF.DfProgram.prototype.getArguments = function()
{
	var process = this.getProcess();
	var startConfiguration = process.getProgramCfg();
	var prgArgs = startConfiguration.getArguments();
	if (this.m_argsConverted === false)
	{
		if (oFF.isNull(prgArgs))
		{
			prgArgs = oFF.ProgramArgs.createWithStructure(oFF.PrFactory.createStructure());
			startConfiguration.setArguments(prgArgs);
		}
		if (prgArgs.getArgumentDefinitions() === null)
		{
			var argDefs = this.getProgramMetadata().getArgDefinitions();
			prgArgs.setArgumentDefinitions(argDefs);
		}
		if (prgArgs.isArgumentStructureOrigin() === false)
		{
			prgArgs.convertToStructure();
		}
		this.m_argsConverted = true;
	}
	return prgArgs;
};
oFF.DfProgram.prototype.setProcess = function(process)
{
	this.m_process = process;
};
oFF.DfProgram.prototype.getProcess = function()
{
	return this.m_process;
};
oFF.DfProgram.prototype.getSession = function()
{
	return this.m_process;
};
oFF.DfProgram.prototype.setDefaultSyncType = oFF.noSupport;
oFF.DfProgram.prototype.getDefaultSyncType = function()
{
	return this.m_process.getDefaultSyncType();
};
oFF.DfProgram.prototype.getLogWriter = function()
{
	return this.getSession().getLogWriter();
};
oFF.DfProgram.prototype.getStdout = function()
{
	return this.getSession().getStdout();
};
oFF.DfProgram.prototype.getStdin = function()
{
	return this.getSession().getStdin();
};
oFF.DfProgram.prototype.getStdlog = function()
{
	return this.getSession().getStdlog();
};
oFF.DfProgram.prototype.print = function(text)
{
	var outputWriteStream = this.getStdout();
	if (oFF.notNull(outputWriteStream))
	{
		outputWriteStream.print(text);
	}
};
oFF.DfProgram.prototype.println2 = function(text, text2)
{
	var outputWriteStream = this.getStdout();
	if (oFF.notNull(outputWriteStream))
	{
		var result = oFF.XStringUtils.concatenate2(text, text2);
		outputWriteStream.println(result);
	}
};
oFF.DfProgram.prototype.println3 = function(text, text2, text3)
{
	var outputWriteStream = this.getStdout();
	if (oFF.notNull(outputWriteStream))
	{
		var result = oFF.XStringUtils.concatenate3(text, text2, text3);
		outputWriteStream.println(result);
	}
};
oFF.DfProgram.prototype.println4 = function(text, text2, text3, text4)
{
	var outputWriteStream = this.getStdout();
	if (oFF.notNull(outputWriteStream))
	{
		var result = oFF.XStringUtils.concatenate4(text, text2, text3, text4);
		outputWriteStream.println(result);
	}
};
oFF.DfProgram.prototype.println5 = function(text, text2, text3, text4, text5)
{
	var outputWriteStream = this.getStdout();
	if (oFF.notNull(outputWriteStream))
	{
		var result = oFF.XStringUtils.concatenate5(text, text2, text3, text4, text5);
		outputWriteStream.println(result);
	}
};
oFF.DfProgram.prototype.println = function(text)
{
	var outputWriteStream = this.getStdout();
	if (oFF.notNull(outputWriteStream))
	{
		outputWriteStream.println(text);
	}
};
oFF.DfProgram.prototype.readLine = function(listener)
{
	return null;
};
oFF.DfProgram.prototype.supportsSyncType = function(syncType)
{
	return false;
};
oFF.DfProgram.prototype.processTerminate = function(syncType, listener, customIdentifier, hardKill)
{
	return oFF.ProgramTerminateAction.createAndRun(syncType, listener, customIdentifier, this, hardKill);
};
oFF.DfProgram.prototype.getExitValue = function()
{
	return this.m_exitValues;
};
oFF.DfProgram.prototype.setExitValue = function(exitValue)
{
	this.m_exitValues = exitValue;
};
oFF.DfProgram.prototype.getArgumentList = function()
{
	return this.getArguments().getArgumentList();
};
oFF.DfProgram.prototype.getArgumentStructure = function()
{
	return this.getArguments().getArgumentStructure();
};
oFF.DfProgram.prototype.setInitialSystemType = function(systemType)
{
	this.m_initialSystemType = systemType;
};
oFF.DfProgram.prototype.getInitialSystemType = function()
{
	return this.m_initialSystemType;
};

oFF.ProgramContainer = function() {};
oFF.ProgramContainer.prototype = new oFF.XObject();
oFF.ProgramContainer.prototype._ff_c = "ProgramContainer";

oFF.ProgramContainer.createProgramContainer = function(startCfg, program)
{
	var newObj = new oFF.ProgramContainer();
	newObj.setupContainer(startCfg, program);
	return newObj;
};
oFF.ProgramContainer.create = function()
{
	var newObj = new oFF.ProgramContainer();
	newObj.setupContainer(null, null);
	return newObj;
};
oFF.ProgramContainer.prototype.m_title = null;
oFF.ProgramContainer.prototype.m_startCfg = null;
oFF.ProgramContainer.prototype.m_program = null;
oFF.ProgramContainer.prototype.m_exitContent = null;
oFF.ProgramContainer.prototype.m_process = null;
oFF.ProgramContainer.prototype.setupContainer = function(startCfg, program)
{
	this.m_startCfg = startCfg;
	this.m_program = program;
};
oFF.ProgramContainer.prototype.releaseObject = function()
{
	this.m_startCfg = null;
	this.m_program = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.ProgramContainer.prototype.getTitle = function()
{
	return this.m_title;
};
oFF.ProgramContainer.prototype.setTitle = function(title)
{
	this.m_title = title;
	var process = this.getProcess();
	var event = oFF.ProcessEvent.create(process, null, oFF.ProcessEventType.PROGRAM_TITLE_CHANGED, oFF.XStringValue.create(title));
	process.notifyProcessEventExt(event);
};
oFF.ProgramContainer.prototype.getStartCfg = function()
{
	return this.m_startCfg;
};
oFF.ProgramContainer.prototype.setStartCfg = function(startCfg)
{
	this.m_startCfg = startCfg;
};
oFF.ProgramContainer.prototype.getProgram = function()
{
	return this.m_program;
};
oFF.ProgramContainer.prototype.setProgram = function(program)
{
	this.m_program = program;
};
oFF.ProgramContainer.prototype.setExitContent = function(content)
{
	this.m_exitContent = content;
};
oFF.ProgramContainer.prototype.getExitContent = function()
{
	return this.m_exitContent;
};
oFF.ProgramContainer.prototype.runFull = function()
{
	this.m_program.runFull();
};
oFF.ProgramContainer.prototype.getProcess = function()
{
	return this.m_process;
};
oFF.ProgramContainer.prototype.getSession = function()
{
	return this.m_process;
};
oFF.ProgramContainer.prototype.setProcess = function(process)
{
	this.m_process = process;
};
oFF.ProgramContainer.prototype.shutdownContainer = function() {};
oFF.ProgramContainer.prototype.isUiContainer = function()
{
	return false;
};
oFF.ProgramContainer.prototype.isModalContainer = function()
{
	return false;
};
oFF.ProgramContainer.prototype.isFloatingContainer = function()
{
	return false;
};
oFF.ProgramContainer.prototype.isContainerOpen = function()
{
	return false;
};
oFF.ProgramContainer.prototype.getContainerType = function()
{
	return oFF.ProgramContainerType.NONE;
};
oFF.ProgramContainer.prototype.setBusy = function(busy) {};
oFF.ProgramContainer.prototype.isBusy = function()
{
	return false;
};

oFF.ProgramRunner = function() {};
oFF.ProgramRunner.prototype = new oFF.XObjectExt();
oFF.ProgramRunner.prototype._ff_c = "ProgramRunner";

oFF.ProgramRunner.PROGRAM_STARTUP_TIMEOUT = 30000;
oFF.ProgramRunner.createRunner = function(parentProcess, prgName)
{
	var newObj = new oFF.ProgramRunner();
	var setupSuccess = newObj.setupRunner(parentProcess, prgName);
	if (!setupSuccess)
	{
		newObj = null;
	}
	return newObj;
};
oFF.ProgramRunner.prototype.m_parentProcess = null;
oFF.ProgramRunner.prototype.m_startConfig = null;
oFF.ProgramRunner.prototype.setupRunner = function(parentProcess, prgName)
{
	var success = false;
	var kernel = oFF.Kernel.getInstance();
	if (oFF.notNull(parentProcess))
	{
		this.m_parentProcess = parentProcess;
	}
	else if (oFF.notNull(kernel))
	{
		this.m_parentProcess = kernel.getKernelProcess();
	}
	if (oFF.notNull(this.m_parentProcess))
	{
		var newArgs = oFF.ProgramArgs.create();
		this.m_startConfig = oFF.ProgramStartCfg.create(this.m_parentProcess, prgName, null, newArgs);
		this.m_startConfig.setIsNewConsoleNeeded(true);
		this.m_startConfig.setIsCreatingChildProcess(true);
		success = true;
	}
	return success;
};
oFF.ProgramRunner.prototype.releaseObject = function()
{
	this.m_parentProcess = null;
	this.m_startConfig = null;
	oFF.XObjectExt.prototype.releaseObject.call( this );
};
oFF.ProgramRunner.prototype.setArgument = function(name, value)
{
	if (oFF.notNull(this.m_startConfig))
	{
		this.m_startConfig.getArguments().putString(name, value);
	}
};
oFF.ProgramRunner.prototype.setBooleanArgument = function(name, boolValue)
{
	if (oFF.notNull(this.m_startConfig))
	{
		this.m_startConfig.getArguments().putBoolean(name, boolValue);
	}
};
oFF.ProgramRunner.prototype.setIntegerArgument = function(name, intValue)
{
	if (oFF.notNull(this.m_startConfig))
	{
		this.m_startConfig.getArguments().putInteger(name, intValue);
	}
};
oFF.ProgramRunner.prototype.setObjectArgument = function(name, objVal)
{
	if (oFF.notNull(this.m_startConfig))
	{
		this.m_startConfig.getArguments().putXObject(name, objVal);
	}
};
oFF.ProgramRunner.prototype.setEnvironmentVariable = function(name, value)
{
	if (oFF.notNull(this.m_parentProcess))
	{
		this.m_parentProcess.getEnvironment().setVariable(name, value);
	}
};
oFF.ProgramRunner.prototype.setNativeAnchorId = function(nativeAnchorId)
{
	if (oFF.notNull(this.m_startConfig))
	{
		this.m_startConfig.setNativeAnchorId(nativeAnchorId);
		if (oFF.XStringUtils.isNotNullAndNotEmpty(nativeAnchorId))
		{
			this.m_startConfig.setEnforcedContainerType(oFF.ProgramContainerType.STANDALONE);
		}
		else
		{
			this.m_startConfig.setEnforcedContainerType(null);
		}
	}
};
oFF.ProgramRunner.prototype.setNativeAnchorObject = function(nativeAnchorObject)
{
	if (oFF.notNull(this.m_startConfig))
	{
		this.m_startConfig.setNativeAnchorObject(nativeAnchorObject);
		if (oFF.notNull(nativeAnchorObject))
		{
			this.m_startConfig.setEnforcedContainerType(oFF.ProgramContainerType.STANDALONE);
		}
		else
		{
			this.m_startConfig.setEnforcedContainerType(null);
		}
	}
};
oFF.ProgramRunner.prototype.getNativeAnchorId = function()
{
	if (oFF.notNull(this.m_startConfig))
	{
		return this.m_startConfig.getNativeAnchorId();
	}
	return null;
};
oFF.ProgramRunner.prototype.getNativeAnchorObject = function()
{
	if (oFF.notNull(this.m_startConfig))
	{
		return this.m_startConfig.getNativeAnchorObject();
	}
	return null;
};
oFF.ProgramRunner.prototype.setAnchorContentControl = function(contentControl)
{
	if (oFF.notNull(this.m_startConfig))
	{
		this.m_startConfig.setAnchorContentControl(contentControl);
		if (oFF.notNull(contentControl))
		{
			this.m_startConfig.setEnforcedContainerType(oFF.ProgramContainerType.CONTENT);
		}
		else
		{
			this.m_startConfig.setEnforcedContainerType(null);
		}
	}
};
oFF.ProgramRunner.prototype.getAnchorContentControl = function()
{
	if (oFF.notNull(this.m_startConfig))
	{
		return this.m_startConfig.getAnchorContentControl();
	}
	return null;
};
oFF.ProgramRunner.prototype.getCurrentStartConfig = function()
{
	return this.m_startConfig;
};
oFF.ProgramRunner.prototype.setContainerType = function(prgContainerType)
{
	if (oFF.notNull(this.m_startConfig) && oFF.notNull(prgContainerType))
	{
		this.m_startConfig.setEnforcedContainerType(prgContainerType);
	}
};
oFF.ProgramRunner.prototype.runProgram = function()
{
	var prgStartedPromise = oFF.XPromise.create( function(resolve, reject){
		if (oFF.notNull(this.m_startConfig))
		{
			var timerId = oFF.XTimeout.timeout(oFF.ProgramRunner.PROGRAM_STARTUP_TIMEOUT,  function(){
				reject(oFF.XError.create(oFF.XStringUtils.concatenate3("Starting program ", this.m_startConfig.getName(), " timed out!")));
			}.bind(this));
			this.m_startConfig.processExecution(oFF.SyncType.NON_BLOCKING, oFF.ProgramStartedLambdaListener.create( function(extResult, startedPrg){
				if (extResult.isValid())
				{
					resolve(startedPrg);
				}
				else
				{
					reject(oFF.XError.createWithMessage(extResult.getFirstError()));
				}
				oFF.XTimeout.clear(timerId);
			}.bind(this)), null);
		}
		else
		{
			reject(oFF.XError.create("Failed to start program! Unknown error!"));
		}
	}.bind(this));
	return prgStartedPromise;
};
oFF.ProgramRunner.prototype.runProgramExt = function()
{
	return this.runProgram();
};

oFF.SigSelManager = function() {};
oFF.SigSelManager.prototype = new oFF.DfSessionContext();
oFF.SigSelManager.prototype._ff_c = "SigSelManager";

oFF.SigSelManager.s_spaceFactories = null;
oFF.SigSelManager.staticSetup = function()
{
	oFF.SigSelManager.s_spaceFactories = oFF.XHashMapByString.create();
};
oFF.SigSelManager.registerFactory = function(componentType, factory)
{
	oFF.SigSelManager.s_spaceFactories.put(componentType.getName(), factory);
};
oFF.SigSelManager.create = function(session)
{
	var newObj = new oFF.SigSelManager();
	newObj.setupSessionContext(session);
	return newObj;
};
oFF.SigSelManager.prototype.m_selectProviders = null;
oFF.SigSelManager.prototype.setupSessionContext = function(session)
{
	oFF.DfSessionContext.prototype.setupSessionContext.call( this , session);
	this.m_selectProviders = oFF.XHashMapByString.create();
};
oFF.SigSelManager.prototype.selectComponentByExpr = function(sigSelExpression, defaultDomain, contextObject, maximumCount, mergeIntoSpace)
{
	var list = this.selectComponentsByExpr(sigSelExpression, defaultDomain, contextObject, maximumCount);
	var component = this.merge(list, mergeIntoSpace);
	return component;
};
oFF.SigSelManager.prototype.selectComponentsByExpr = function(sigSelExpression, defaultDomain, contextObject, maximumCount)
{
	var resultList = oFF.XList.create();
	if (oFF.notNull(sigSelExpression))
	{
		var parser = oFF.SigSelParser.create();
		var result = parser.parse(sigSelExpression);
		if (result.isValid())
		{
			var ops = result.getData();
			for (var i = 0; i < ops.size(); i++)
			{
				var operation = ops.get(i);
				var list = this.selectComponentsByOp(operation, defaultDomain, contextObject, maximumCount);
				if (oFF.notNull(list) && list.size() > 0)
				{
					resultList.addAll(list);
				}
				if (resultList.size() >= maximumCount)
				{
					break;
				}
			}
		}
	}
	return resultList;
};
oFF.SigSelManager.prototype.selectComponentByOp = function(operation, defaultDomain, contextObject, maximumCount, mergeIntoSpace)
{
	var list = this.selectComponentsByOp(operation, defaultDomain, contextObject, maximumCount);
	var component = this.merge(list, mergeIntoSpace);
	return component;
};
oFF.SigSelManager.prototype.merge = function(list, mergeIntoSpace)
{
	var component = null;
	if (oFF.notNull(list) && list.size() > 0)
	{
		component = list.get(0);
		if (mergeIntoSpace === true)
		{
			var theFactory = this.getFactory(component);
			if (oFF.notNull(theFactory))
			{
				var spacer = theFactory.newSpacer(this.getSession());
				for (var i = 0; i < list.size(); i++)
				{
					spacer.addComponent(list.get(i));
				}
				component = spacer;
			}
		}
	}
	return component;
};
oFF.SigSelManager.prototype.selectComponentsByOp = function(operation, defaultDomain, contextObject, maximumCount)
{
	var domain = operation.getDomain();
	if (domain === oFF.SigSelDomain.CONTEXT)
	{
		domain = defaultDomain;
	}
	var selectProvider = this.m_selectProviders.getByKey(domain.getName());
	var list = null;
	if (oFF.notNull(selectProvider))
	{
		list = selectProvider.selectProviderComponents(operation, domain, contextObject, maximumCount);
	}
	return list;
};
oFF.SigSelManager.prototype.getFactory = function(component)
{
	var theFactory = null;
	var componentType = component.getComponentType();
	while (oFF.notNull(componentType) && oFF.isNull(theFactory))
	{
		var name = componentType.getName();
		theFactory = oFF.SigSelManager.s_spaceFactories.getByKey(name);
		componentType = componentType.getParent();
	}
	return theFactory;
};
oFF.SigSelManager.prototype.registerSelector = function(domain, selector)
{
	this.m_selectProviders.put(domain.getName(), selector);
};
oFF.SigSelManager.prototype.getRegisteredDomain = function()
{
	var domains = oFF.XList.create();
	var iterator = this.m_selectProviders.getKeysAsIteratorOfString();
	while (iterator.hasNext())
	{
		var domain = oFF.SigSelDomain.lookup(iterator.next());
		domains.add(domain);
	}
	return domains;
};
oFF.SigSelManager.prototype.getSelector = function(domain)
{
	return this.m_selectProviders.getByKey(domain.getName());
};

oFF.SigSelOperation = function() {};
oFF.SigSelOperation.prototype = new oFF.DfNameObject();
oFF.SigSelOperation.prototype._ff_c = "SigSelOperation";

oFF.SigSelOperation.create = function()
{
	var newObj = new oFF.SigSelOperation();
	newObj.m_arrayAccess = oFF.SigSelIndexType.NONE;
	newObj.m_domain = oFF.SigSelDomain.CONTEXT;
	return newObj;
};
oFF.SigSelOperation.prototype.m_domain = null;
oFF.SigSelOperation.prototype.m_identifier = null;
oFF.SigSelOperation.prototype.m_selectedComponentType = null;
oFF.SigSelOperation.prototype.m_property = null;
oFF.SigSelOperation.prototype.m_operationType = null;
oFF.SigSelOperation.prototype.m_child = null;
oFF.SigSelOperation.prototype.m_arrayAccess = null;
oFF.SigSelOperation.prototype.m_indexName = null;
oFF.SigSelOperation.prototype.m_indexNumber = 0;
oFF.SigSelOperation.prototype.setId = function(identifier)
{
	this.m_identifier = identifier;
};
oFF.SigSelOperation.prototype.getId = function()
{
	return this.m_identifier;
};
oFF.SigSelOperation.prototype.getDomain = function()
{
	return this.m_domain;
};
oFF.SigSelOperation.prototype.setDomain = function(domain)
{
	this.m_domain = domain;
};
oFF.SigSelOperation.prototype.setSelectedComponentType = function(type)
{
	this.m_selectedComponentType = type;
};
oFF.SigSelOperation.prototype.getSelectedComponentType = function()
{
	return this.m_selectedComponentType;
};
oFF.SigSelOperation.prototype.getSelectedProperty = function()
{
	return this.m_property;
};
oFF.SigSelOperation.prototype.setSelectedProperty = function(property)
{
	this.m_property = property;
};
oFF.SigSelOperation.prototype.getOperationType = function()
{
	return this.m_operationType;
};
oFF.SigSelOperation.prototype.setOperationType = function(type)
{
	this.m_operationType = type;
};
oFF.SigSelOperation.prototype.getChild = function()
{
	return this.m_child;
};
oFF.SigSelOperation.prototype.setChild = function(op)
{
	this.m_child = op;
};
oFF.SigSelOperation.prototype.getIndexType = function()
{
	return this.m_arrayAccess;
};
oFF.SigSelOperation.prototype.setIndexType = function(type)
{
	this.m_arrayAccess = type;
};
oFF.SigSelOperation.prototype.getIndexName = function()
{
	return this.m_indexName;
};
oFF.SigSelOperation.prototype.setIndexName = function(name)
{
	this.m_indexName = name;
};
oFF.SigSelOperation.prototype.getIndexPosition = function()
{
	return this.m_indexNumber;
};
oFF.SigSelOperation.prototype.setIndexPosition = function(position)
{
	this.m_indexNumber = position;
};
oFF.SigSelOperation.prototype.getUri = function()
{
	var uri = oFF.XUri.create();
	uri.setSupportsAuthority(false);
	if (this.m_domain === oFF.SigSelDomain.UI)
	{
		uri.setProtocolType(oFF.ProtocolType.UI);
	}
	else if (this.m_domain === oFF.SigSelDomain.DATA)
	{
		uri.setProtocolType(oFF.ProtocolType.DATAPROVIDER);
	}
	var buffer = oFF.XStringBuffer.create();
	if (this.m_operationType === oFF.SigSelType.MATCH_NAME)
	{
		var name = this.getName();
		if (oFF.notNull(name))
		{
			buffer.append(name);
		}
	}
	else if (this.m_operationType === oFF.SigSelType.MATCH_ID)
	{
		var theId = this.getId();
		if (oFF.notNull(theId))
		{
			buffer.append("!").append(theId);
		}
	}
	else if (this.m_operationType === oFF.SigSelType.WILDCARD)
	{
		buffer.append("*");
	}
	if (oFF.notNull(this.m_selectedComponentType))
	{
		buffer.append(".").append(this.m_selectedComponentType.getName());
	}
	var path = buffer.toString();
	if (oFF.XStringUtils.isNotNullAndNotEmpty(path))
	{
		uri.setPath(path);
	}
	if (oFF.notNull(this.m_property))
	{
		uri.setFragment(this.m_property);
	}
	return uri;
};
oFF.SigSelOperation.prototype.toString = function()
{
	var buffer = oFF.XStringBuffer.create();
	if (oFF.notNull(this.m_operationType))
	{
		buffer.append("Domain: ").appendLine(this.m_domain.getName());
	}
	if (oFF.notNull(this.m_operationType))
	{
		buffer.append("OpType: ").appendLine(this.m_operationType.getName());
	}
	if (this.getName() !== null)
	{
		buffer.append("Name: ").appendLine(this.getName());
	}
	if (oFF.notNull(this.m_identifier))
	{
		buffer.append("Id: ").appendLine(this.m_identifier);
	}
	if (oFF.notNull(this.m_selectedComponentType))
	{
		buffer.append("ComponentType: ").appendLine(this.m_selectedComponentType.getName());
	}
	if (oFF.notNull(this.m_property))
	{
		buffer.append("Property: ").appendLine(this.m_property);
	}
	return buffer.toString();
};
oFF.SigSelOperation.prototype.setName = function(name)
{
	this.m_name = name;
};

oFF.DfSubSystem = function() {};
oFF.DfSubSystem.prototype = new oFF.DfProcessContext();
oFF.DfSubSystem.prototype._ff_c = "DfSubSystem";

oFF.DfSubSystem.prototype.m_kernel = null;
oFF.DfSubSystem.prototype.setupProcessContext = function(process)
{
	oFF.DfProcessContext.prototype.setupProcessContext.call( this , process);
};
oFF.DfSubSystem.prototype.setupSubSystem = function(kernel)
{
	kernel.getKernelProcess();
	this.m_kernel = kernel;
};
oFF.DfSubSystem.prototype.getKernel = function()
{
	return this.m_kernel;
};
oFF.DfSubSystem.prototype.getSubSystemSelector = function()
{
	return null;
};
oFF.DfSubSystem.prototype.getSubSystemFullName = function()
{
	var subSystemFullName = this.getSubSystemType().getName();
	var selector = this.getSubSystemSelector();
	if (oFF.notNull(selector))
	{
		subSystemFullName = oFF.XStringUtils.concatenate3(subSystemFullName, ".", selector);
	}
	return subSystemFullName;
};
oFF.DfSubSystem.prototype.getLogLayer = function()
{
	return oFF.OriginLayer.SUBSYSTEM;
};
oFF.DfSubSystem.prototype.getMainApi = function()
{
	return this;
};
oFF.DfSubSystem.prototype.getAdminApi = function()
{
	return this;
};

oFF.UserManager = function() {};
oFF.UserManager.prototype = new oFF.DfProcessContext();
oFF.UserManager.prototype._ff_c = "UserManager";

oFF.UserManager.create = function(process)
{
	var newObj = new oFF.UserManager();
	newObj.setupProcessContext(process);
	return newObj;
};
oFF.UserManager.prototype.m_connectionPersonalizationBySystem = null;
oFF.UserManager.prototype.setupProcessContext = function(process)
{
	oFF.DfProcessContext.prototype.setupProcessContext.call( this , process);
	this.m_connectionPersonalizationBySystem = oFF.XHashMapByString.create();
};
oFF.UserManager.prototype.releaseObject = function()
{
	oFF.XObjectExt.release(this.m_connectionPersonalizationBySystem);
	oFF.DfProcessContext.prototype.releaseObject.call( this );
};
oFF.UserManager.prototype.newMergedPersonalization2 = function(systemDescription)
{
	var personalization = null;
	personalization = oFF.ConnectionPersonalization.createPersonalization();
	personalization.setFromPersonalization(systemDescription);
	var systemName = systemDescription.getName();
	var storedPersonalization = this.getConnectionPersonalization(systemName);
	oFF.XConnectHelper.setOverdefinedConnectionPersonalization(storedPersonalization, personalization);
	return personalization;
};
oFF.UserManager.prototype.getConnectionPersonalization = function(systemName)
{
	var tokenStorage = this.m_connectionPersonalizationBySystem.getByKey(systemName);
	if (oFF.isNull(tokenStorage))
	{
		tokenStorage = oFF.ConnectionPersonalization.createPersonalization();
		this.m_connectionPersonalizationBySystem.put(systemName, tokenStorage);
	}
	return tokenStorage;
};

oFF.XCacheProviderFile = function() {};
oFF.XCacheProviderFile.prototype = new oFF.DfXCacheProvider();
oFF.XCacheProviderFile.prototype._ff_c = "XCacheProviderFile";

oFF.XCacheProviderFile.create = function(process)
{
	var newObj = new oFF.XCacheProviderFile();
	newObj.setupSessionContext(process);
	return newObj;
};
oFF.XCacheProviderFile.prototype.m_directory = null;
oFF.XCacheProviderFile.prototype.processOpen = function(syncType, listener, customIdentifier, properties)
{
	return oFF.XCacheProviderFileOpenAction.createAndRun(syncType, listener, customIdentifier, this, properties);
};
oFF.XCacheProviderFile.prototype.setDirectory = function(directory)
{
	this.m_directory = directory;
};
oFF.XCacheProviderFile.prototype.writeElementToCache = function(namespace, name, element, maxCount)
{
	if (oFF.notNull(element))
	{
		var file = this.createFile(namespace, name, ".json", true);
		if (oFF.notNull(file))
		{
			var cache = element.getStringRepresentation();
			var ba = oFF.XByteArray.convertFromString(cache);
			file.saveByteArray(ba);
		}
	}
};
oFF.XCacheProviderFile.prototype.readElementFromCache = function(namespace, name, validityTime)
{
	var result = null;
	var file = this.createFile(namespace, name, ".json", false);
	if (oFF.notNull(file) && file.isExisting() && file.isFile())
	{
		var content = file.load();
		result = content.getJsonContent();
	}
	if (oFF.notNull(result))
	{
		this.incHit(namespace);
	}
	return result;
};
oFF.XCacheProviderFile.prototype.writeStringToCache = function(namespace, name, stringValue, maxCount)
{
	if (oFF.notNull(stringValue))
	{
		var file = this.createFile(namespace, name, ".txt", true);
		if (oFF.notNull(file))
		{
			var ba = oFF.XByteArray.convertFromString(stringValue);
			file.saveByteArray(ba);
		}
	}
};
oFF.XCacheProviderFile.prototype.readStringFromCache = function(namespace, name, validityTime)
{
	var result = null;
	var file = this.createFile(namespace, name, ".txt", false);
	if (oFF.notNull(file) && file.isExisting() && file.isFile())
	{
		var content = file.load();
		if (oFF.notNull(content))
		{
			result = content.getString();
		}
	}
	if (oFF.notNull(result))
	{
		this.incHit(namespace);
	}
	return result;
};
oFF.XCacheProviderFile.prototype.clearCache = function(namespace)
{
	if (oFF.notNull(this.m_directory))
	{
		var targetFolder;
		if (oFF.isNull(namespace))
		{
			targetFolder = this.m_directory;
		}
		else
		{
			targetFolder = this.m_directory.newChild(namespace);
		}
		targetFolder.deleteRecursive();
	}
};
oFF.XCacheProviderFile.prototype.createFile = function(namespace, name, fileExt, prepareForWrite)
{
	var file = null;
	if (oFF.notNull(this.m_directory) && oFF.notNull(name) && this.m_directory.getProtocolType() !== null)
	{
		var parentFolder;
		if (oFF.isNull(namespace))
		{
			parentFolder = this.m_directory;
		}
		else
		{
			var childSequence = oFF.XStringTokenizer.splitString(namespace, this.getDelimiter());
			var currentFile = this.m_directory;
			for (var i = 0; i < childSequence.size(); i++)
			{
				var childName = childSequence.get(i);
				currentFile = currentFile.newChild(childName);
			}
			parentFolder = currentFile;
		}
		if (prepareForWrite)
		{
			parentFolder.mkdirs();
		}
		var fileExtension = fileExt;
		if (oFF.isNull(fileExtension))
		{
			fileExtension = ".json";
		}
		file = parentFolder.newChild(oFF.XStringUtils.concatenate3("ffc_", name, fileExtension));
		if (prepareForWrite && file.isExisting())
		{
			file.deleteFile();
		}
	}
	return file;
};
oFF.XCacheProviderFile.prototype.getDelimiter = function()
{
	return "/";
};
oFF.XCacheProviderFile.prototype.getProcess = function()
{
	return this.getSession();
};

oFF.Capability = function() {};
oFF.Capability.prototype = new oFF.XNameValuePair();
oFF.Capability.prototype._ff_c = "Capability";

oFF.Capability.createCapabilityInfo = function(name, value)
{
	var object = new oFF.Capability();
	object.setupWithNameValue(name, value);
	return object;
};

oFF.SubSysCredentialsProviderBootstrap = function() {};
oFF.SubSysCredentialsProviderBootstrap.prototype = new oFF.DfSubSystem();
oFF.SubSysCredentialsProviderBootstrap.prototype._ff_c = "SubSysCredentialsProviderBootstrap";

oFF.SubSysCredentialsProviderBootstrap.create = function(process)
{
	var newObj = new oFF.SubSysCredentialsProviderBootstrap();
	newObj.setupProcessContext(process);
	return newObj;
};
oFF.SubSysCredentialsProviderBootstrap.prototype.m_authMap = null;
oFF.SubSysCredentialsProviderBootstrap.prototype.setupProcessContext = function(process)
{
	oFF.DfSubSystem.prototype.setupProcessContext.call( this , process);
	this.m_authMap = oFF.XHashMapByString.create();
};
oFF.SubSysCredentialsProviderBootstrap.prototype.getSubSystemType = function()
{
	return oFF.SubSystemType.CREDENTIALS_PROVIDER;
};
oFF.SubSysCredentialsProviderBootstrap.prototype.processGetCredentials = function(syncType, listener, customIdentifier, connection, credentialsCallCounter, response, messages, changedType)
{
	var sysKey = this.extractUniqueKey(connection.getSystemDescription());
	if (oFF.notNull(changedType))
	{
		this.m_authMap.put(sysKey, changedType);
	}
	var process = this.getProcess();
	var userManager = process.getUserManager();
	var authType = this.m_authMap.getByKey(sysKey);
	return oFF.BasicCredentialsAction.createAndRun(syncType, listener, customIdentifier, userManager, connection, messages, authType);
};
oFF.SubSysCredentialsProviderBootstrap.prototype.extractUniqueKey = function(system)
{
	var key = system.getUrlExt(true, true, false, false, false, true, false, false, false);
	return key;
};
oFF.SubSysCredentialsProviderBootstrap.prototype.notifyCredentialsSuccess = function(connection)
{
	var systemDescription = connection.getSystemDescription();
	if (oFF.notNull(systemDescription) && this.getSession().getEnvironment().getBooleanByKeyExt(oFF.XEnvironmentConstants.FIREFLY_REMOVE_CREDENTIALS_AFTER_LOGIN, false) && systemDescription.getAuthenticationType().isEqualTo(oFF.AuthenticationType.BASIC))
	{
		systemDescription.setUser(null);
		systemDescription.setPassword(null);
	}
};
oFF.SubSysCredentialsProviderBootstrap.prototype.supportsOnErrorHandling = function()
{
	return false;
};

oFF.XHttpFileSystem = function() {};
oFF.XHttpFileSystem.prototype = new oFF.DfXFileSystemBasic();
oFF.XHttpFileSystem.prototype._ff_c = "XHttpFileSystem";

oFF.XHttpFileSystem.create = function(process, uri)
{
	var newObj = new oFF.XHttpFileSystem();
	newObj.setupProcessContext(process);
	return newObj;
};
oFF.XHttpFileSystem.prototype.getProtocolType = function()
{
	return oFF.ProtocolType.SIMPLE_WEB;
};
oFF.XHttpFileSystem.prototype.newFile = function(process, uri)
{
	return oFF.XHttpFile._create(process, this, uri);
};

oFF.XRemoteHttpFileSystem = function() {};
oFF.XRemoteHttpFileSystem.prototype = new oFF.DfXFileSystemBasic();
oFF.XRemoteHttpFileSystem.prototype._ff_c = "XRemoteHttpFileSystem";

oFF.XRemoteHttpFileSystem.create = function(process, uri)
{
	var newObj = new oFF.XRemoteHttpFileSystem();
	newObj.setupProcessContext(process);
	return newObj;
};
oFF.XRemoteHttpFileSystem.prototype.getProtocolType = function()
{
	return oFF.ProtocolType.REMOTE_WEB;
};
oFF.XRemoteHttpFileSystem.prototype.newFile = function(process, uri)
{
	return oFF.XRemoteHttpFile._create(process, this, uri);
};

oFF.DfXFileSystem = function() {};
oFF.DfXFileSystem.prototype = new oFF.DfXFileSystemBasic();
oFF.DfXFileSystem.prototype._ff_c = "DfXFileSystem";

oFF.DfXFileSystem.prototype.newFile = function(process, uri)
{
	return oFF.XFileProviderClassic.createExt(process, this, uri);
};
oFF.DfXFileSystem.prototype.convertToNativeFilePath = function(uri)
{
	var normalizedPath = uri.getPath();
	var nativePath = normalizedPath;
	if (this.getProtocolType() === oFF.ProtocolType.FILE)
	{
		if (oFF.notNull(normalizedPath) && oFF.XString.isEqual(oFF.XUri.PATH_SEPARATOR_NATIVE_FS, "/") === false)
		{
			if (oFF.XString.startsWith(nativePath, "/"))
			{
				nativePath = oFF.XString.substring(nativePath, 1, -1);
			}
			nativePath = oFF.XString.replace(nativePath, "/", oFF.XUri.PATH_SEPARATOR_NATIVE_FS);
		}
	}
	return nativePath;
};
oFF.DfXFileSystem.prototype.processExecute = oFF.noSupport;
oFF.DfXFileSystem.prototype.getFileType = function(file)
{
	if (this.isDirectoryExt(file))
	{
		return oFF.XFileType.DIR;
	}
	else
	{
		return oFF.XFileType.FILE;
	}
};
oFF.DfXFileSystem.prototype.isFileExt = function(file)
{
	return false;
};
oFF.DfXFileSystem.prototype.isDirectoryExt = function(file)
{
	return false;
};
oFF.DfXFileSystem.prototype.isHiddenExt = function(file)
{
	return false;
};
oFF.DfXFileSystem.prototype.isWriteableExt = function(file)
{
	return false;
};
oFF.DfXFileSystem.prototype.setWritableExt = function(file, writable, ownerOnly)
{
	return null;
};
oFF.DfXFileSystem.prototype.isReadableExt = function(file)
{
	return false;
};
oFF.DfXFileSystem.prototype.saveExt = function(file, content, compression) {};
oFF.DfXFileSystem.prototype.loadExt2 = function(file, compression) {};
oFF.DfXFileSystem.prototype.deleteFileExt = function(file) {};
oFF.DfXFileSystem.prototype.renameToExt = function(file, targetFile)
{
	return null;
};
oFF.DfXFileSystem.prototype.mkdirExt = function(file, includeParentDirs) {};
oFF.DfXFileSystem.prototype.getChildrenMetadata = function(file)
{
	var children = oFF.XList.create();
	var names = this.getChildrenExt(file);
	for (var i = 0; i < names.size(); i++)
	{
		var theName = names.get(i);
		var element = oFF.PrFactory.createStructure();
		element.putString(oFF.XFileAttribute.NAME.getName(), theName);
		children.add(element);
	}
	return children;
};
oFF.DfXFileSystem.prototype.getChildrenExt = function(file)
{
	return oFF.XListOfString.create();
};
oFF.DfXFileSystem.prototype.isExistingExt = function(file)
{
	return false;
};
oFF.DfXFileSystem.prototype.isExecutableExt = function(file)
{
	return false;
};
oFF.DfXFileSystem.prototype.getLastModifiedTimestampExt = function(file)
{
	return 0;
};
oFF.DfXFileSystem.prototype.getSize = function(file)
{
	return -1;
};
oFF.DfXFileSystem.prototype.getAttributes = function(file)
{
	return oFF.PrFactory.createStructure();
};

oFF.MfsDirectory = function() {};
oFF.MfsDirectory.prototype = new oFF.MfsElement();
oFF.MfsDirectory.prototype._ff_c = "MfsDirectory";

oFF.MfsDirectory.create = function()
{
	return new oFF.MfsDirectory();
};
oFF.MfsDirectory.prototype.releaseObject = function()
{
	oFF.MfsElement.prototype.releaseObject.call( this );
};
oFF.MfsDirectory.prototype.getChild = function(name)
{
	return null;
};
oFF.MfsDirectory.prototype.getChildNames = function()
{
	return null;
};
oFF.MfsDirectory.prototype.removeChild = function(name) {};
oFF.MfsDirectory.prototype.setChild = function(name, content) {};
oFF.MfsDirectory.prototype.setDirectory = function(name)
{
	return null;
};

oFF.MfsFile = function() {};
oFF.MfsFile.prototype = new oFF.MfsElement();
oFF.MfsFile.prototype._ff_c = "MfsFile";

oFF.MfsFile.create = function()
{
	return new oFF.MfsFile();
};
oFF.MfsFile.prototype.getContent = function()
{
	return null;
};

oFF.MfsInMemoryFileSystem = function() {};
oFF.MfsInMemoryFileSystem.prototype = new oFF.DfXFileSystemOS();
oFF.MfsInMemoryFileSystem.prototype._ff_c = "MfsInMemoryFileSystem";

oFF.MfsInMemoryFileSystem.create = function(session)
{
	var newObj = new oFF.MfsInMemoryFileSystem();
	newObj.setupSessionContext(session);
	return newObj;
};
oFF.MfsInMemoryFileSystem.main = function() {};
oFF.MfsInMemoryFileSystem.prototype.m_root = null;
oFF.MfsInMemoryFileSystem.prototype.setupSessionContext = function(session)
{
	oFF.DfXFileSystemOS.prototype.setupSessionContext.call( this , session);
	this.m_root = oFF.MfsDirectory.create();
};
oFF.MfsInMemoryFileSystem.prototype.getProtocolType = function()
{
	return oFF.ProtocolType.FS_MEMORY;
};
oFF.MfsInMemoryFileSystem.prototype.isDirectory = function(nativePath)
{
	var currentElement = this.getPathElement(nativePath, 0);
	if (oFF.notNull(currentElement))
	{
		return currentElement.isDirectory();
	}
	else
	{
		return false;
	}
};
oFF.MfsInMemoryFileSystem.prototype.isFile = function(nativePath)
{
	var currentElement = this.getPathElement(nativePath, 0);
	if (oFF.notNull(currentElement))
	{
		return currentElement.isDirectory() === false;
	}
	else
	{
		return false;
	}
};
oFF.MfsInMemoryFileSystem.prototype.isExisting = function(nativePath)
{
	var currentElement = this.getPathElement(nativePath, 0);
	return oFF.notNull(currentElement);
};
oFF.MfsInMemoryFileSystem.prototype.isHidden = function(nativePath)
{
	return false;
};
oFF.MfsInMemoryFileSystem.prototype.mkdir = function(nativePath)
{
	var pathElement = this.getPathElement(nativePath, 1);
	if (oFF.notNull(pathElement) && pathElement.isDirectory())
	{
		var name = this.getLastName(nativePath);
		pathElement.setDirectory(name);
	}
	return null;
};
oFF.MfsInMemoryFileSystem.prototype.mkdirs = function(nativePath)
{
	return null;
};
oFF.MfsInMemoryFileSystem.prototype.getRoots = function()
{
	return this.getChildren("/");
};
oFF.MfsInMemoryFileSystem.prototype.getChildren = function(nativePath)
{
	var currentElement = this.getPathElement(nativePath, 0);
	if (oFF.notNull(currentElement) && currentElement.isDirectory())
	{
		var dir = currentElement;
		return dir.getChildNames();
	}
	else
	{
		return null;
	}
};
oFF.MfsInMemoryFileSystem.prototype.isWriteable = function(nativePath)
{
	return true;
};
oFF.MfsInMemoryFileSystem.prototype.setWritable = function(nativePath, writable, ownerOnly)
{
	return null;
};
oFF.MfsInMemoryFileSystem.prototype.isReadable = function(nativePath)
{
	return true;
};
oFF.MfsInMemoryFileSystem.prototype.isExecutable = function(nativePath)
{
	return false;
};
oFF.MfsInMemoryFileSystem.prototype.getLastModifiedTimestamp = function(nativePath)
{
	return 0;
};
oFF.MfsInMemoryFileSystem.prototype.loadExt = function(nativePath)
{
	var pathElement = this.getPathElement(nativePath, 0);
	if (oFF.notNull(pathElement) && pathElement.isDirectory() === false)
	{
		return pathElement.getContent();
	}
	return null;
};
oFF.MfsInMemoryFileSystem.prototype.loadGzipped = function(nativePath)
{
	return this.loadExt(nativePath);
};
oFF.MfsInMemoryFileSystem.prototype.save = function(nativePath, data)
{
	return null;
};
oFF.MfsInMemoryFileSystem.prototype.saveGzipped = function(nativePath, data)
{
	return null;
};
oFF.MfsInMemoryFileSystem.prototype.deleteFile = function(nativePath)
{
	var pathElement = this.getPathElement(nativePath, 0);
	if (oFF.notNull(pathElement))
	{
		var parent = pathElement.getParent();
		if (oFF.notNull(parent))
		{
			parent.removeChild(pathElement.getName());
			pathElement.releaseObject();
		}
	}
	return null;
};
oFF.MfsInMemoryFileSystem.prototype.renameTo = function(sourceNativePath, destNativePath)
{
	return null;
};
oFF.MfsInMemoryFileSystem.prototype.getLastName = function(nativePath)
{
	var pathNames = this.splitPath(nativePath);
	var name = pathNames.get(pathNames.size() - 1);
	return name;
};
oFF.MfsInMemoryFileSystem.prototype.splitPath = function(nativePath)
{
	var elements = oFF.XStringTokenizer.splitString(nativePath, "/");
	return elements;
};
oFF.MfsInMemoryFileSystem.prototype.getPathElement = function(nativePath, rightOffset)
{
	var elements = this.splitPath(nativePath);
	var currentElement = this.m_root;
	for (var i = 0; i < elements.size() - rightOffset && oFF.notNull(currentElement); i++)
	{
		var name = elements.get(i);
		if (currentElement.isDirectory())
		{
			currentElement = currentElement.getChild(name);
		}
		else
		{
			currentElement = null;
		}
	}
	return currentElement;
};

oFF.VfsElementFile = function() {};
oFF.VfsElementFile.prototype = new oFF.VfsElement();
oFF.VfsElementFile.prototype._ff_c = "VfsElementFile";

oFF.VfsElementFile.createFile = function(vfs, path, name, content)
{
	var newObj = new oFF.VfsElementFile();
	newObj.setupElement(vfs, name, null);
	newObj.m_content = content;
	return newObj;
};
oFF.VfsElementFile.prototype.m_content = null;
oFF.VfsElementFile.prototype.getComponentType = function()
{
	return oFF.VfsElementType.FILE;
};
oFF.VfsElementFile.prototype.getMetadataInternal = function(metadata)
{
	oFF.VfsElement.prototype.getMetadataInternal.call( this , metadata);
	metadata.putBoolean(oFF.XFileAttribute.IS_DIRECTORY.getName(), false);
	metadata.putBoolean(oFF.XFileAttribute.IS_FILE.getName(), true);
	metadata.putString(oFF.XFileAttribute.FILE_TYPE.getName(), oFF.XFileType.FILE.getName());
};
oFF.VfsElementFile.prototype.getContent = function()
{
	return this.m_content;
};
oFF.VfsElementFile.prototype.setContent = function(content)
{
	this.m_content = content;
};
oFF.VfsElementFile.prototype.isNode = function()
{
	return false;
};
oFF.VfsElementFile.prototype.toStringExt = function(buffer)
{
	if (oFF.notNull(this.m_content))
	{
		buffer.append(this.m_content.toString());
	}
	else
	{
		buffer.append("[no content]");
	}
};

oFF.VfsElementNode = function() {};
oFF.VfsElementNode.prototype = new oFF.VfsElement();
oFF.VfsElementNode.prototype._ff_c = "VfsElementNode";

oFF.VfsElementNode.prototype.m_pathOffset = 0;
oFF.VfsElementNode.prototype.setupElement = function(vfs, name, attributes)
{
	oFF.VfsElement.prototype.setupElement.call( this , vfs, name, attributes);
	this.m_pathOffset = 1;
};
oFF.VfsElementNode.prototype.getComponentType = function()
{
	return oFF.VfsElementType.NODE;
};
oFF.VfsElementNode.prototype.setParent = function(parent)
{
	oFF.VfsElement.prototype.setParent.call( this , parent);
	var parentOffset = this.m_parent.getPathOffset();
	this.m_pathOffset = parentOffset + oFF.XString.size(this.getName()) + 1;
};
oFF.VfsElementNode.prototype.getMetadataInternal = function(metadata)
{
	oFF.VfsElement.prototype.getMetadataInternal.call( this , metadata);
	metadata.putBoolean(oFF.XFileAttribute.IS_DIRECTORY.getName(), true);
	metadata.putBoolean(oFF.XFileAttribute.IS_FILE.getName(), false);
	metadata.putString(oFF.XFileAttribute.FILE_TYPE.getName(), oFF.XFileType.DIR.getName());
};
oFF.VfsElementNode.prototype.getPathOffset = function()
{
	return this.m_pathOffset;
};
oFF.VfsElementNode.prototype.getChildNames = function()
{
	return null;
};
oFF.VfsElementNode.prototype.toStringExt = function(buffer)
{
	if (this.isNode())
	{
		buffer.append("Node: ");
	}
	else
	{
		buffer.append("Leaf: ");
	}
	buffer.append(this.getName());
	if (this.isNode())
	{
		buffer.appendNewLine();
		buffer.indent();
		var keys = this.getChildNames();
		for (var i = 0; i < keys.size(); i++)
		{
			var childName = keys.get(i);
			var child = this.getChild(childName);
			child.toStringExt(buffer);
			buffer.appendNewLine();
		}
		buffer.outdent();
	}
};

oFF.VfsFileSystem = function() {};
oFF.VfsFileSystem.prototype = new oFF.DfXFileSystemBasic();
oFF.VfsFileSystem.prototype._ff_c = "VfsFileSystem";

oFF.VfsFileSystem.create = function(process)
{
	var newObj = new oFF.VfsFileSystem();
	newObj.setupProcessContext(process);
	return newObj;
};
oFF.VfsFileSystem.prototype.m_root = null;
oFF.VfsFileSystem.prototype.setupProcessContext = function(process)
{
	oFF.DfXFileSystemBasic.prototype.setupProcessContext.call( this , process);
	this.m_root = oFF.VfsElementDir.createDir(this, "", null);
};
oFF.VfsFileSystem.prototype.getSubSystemType = function()
{
	return oFF.SubSystemType.FILE_SYSTEM;
};
oFF.VfsFileSystem.prototype.getSubSystemSelector = function()
{
	return null;
};
oFF.VfsFileSystem.prototype.getSubSystemFullName = function()
{
	return this.getSubSystemType().getName();
};
oFF.VfsFileSystem.prototype.getMainApi = function()
{
	return this;
};
oFF.VfsFileSystem.prototype.getAdminApi = function()
{
	return this;
};
oFF.VfsFileSystem.prototype.getProtocolType = function()
{
	return oFF.ProtocolType.VFS;
};
oFF.VfsFileSystem.prototype.addMountPointByUri = function(path, mountPointUri)
{
	var mountPoint = oFF.VfsElementMountPoint.createWithUri(mountPointUri);
	this.addMountPoint(path, mountPoint);
};
oFF.VfsFileSystem.prototype.addMountPoint = function(path, mountPoint)
{
	if (oFF.XString.startsWith(path, "/") === false)
	{
		throw oFF.XException.createIllegalArgumentException(oFF.XStringUtils.concatenate2("Mounting path must start with slash: ", path));
	}
	var pathElements = oFF.XStringTokenizer.splitString(path, "/");
	var size = pathElements.size();
	var current = this.navigateToParent(path, pathElements);
	if (oFF.notNull(current))
	{
		var name = pathElements.get(size - 1);
		mountPoint.setName(name);
		mountPoint.setVfs(this);
		current.setChild(mountPoint);
	}
};
oFF.VfsFileSystem.prototype.addDirectory = function(path, attributes)
{
	if (oFF.XString.startsWith(path, "/") === false)
	{
		throw oFF.XException.createIllegalArgumentException(oFF.XStringUtils.concatenate2("Mounting path must start with slash: ", path));
	}
	var pathElements = oFF.XStringTokenizer.splitString(path, "/");
	var size = pathElements.size();
	var current = this.navigateToParent(path, pathElements);
	if (oFF.notNull(current))
	{
		var name = pathElements.get(size - 1);
		var child = oFF.VfsElementDir.createDir(this, name, attributes);
		current.setChild(child);
	}
};
oFF.VfsFileSystem.prototype.navigateToParent = function(path, pathElements)
{
	var element = this.navigateTo(pathElements, 1, true);
	if (element.getComponentType() !== oFF.VfsElementType.DIR)
	{
		this.logError2("Cannot attach mounting/directory point at ", path);
		return null;
	}
	else
	{
		return element;
	}
};
oFF.VfsFileSystem.prototype.getElementByPath = function(path)
{
	var pathElements = oFF.XStringTokenizer.splitString(path, "/");
	var element = this.navigateTo(pathElements, 0, false);
	return element;
};
oFF.VfsFileSystem.prototype.navigateTo = function(pathElements, offset, createDir)
{
	var current = this.m_root;
	var size = pathElements.size();
	if (size > 1 && oFF.XString.isEqual(pathElements.get(size - 1), ""))
	{
		size = size - 1;
	}
	for (var i = 1; i < size - offset; i++)
	{
		if (current.isLeaf())
		{
			current = null;
			break;
		}
		else
		{
			var dir = current;
			var folderName = pathElements.get(i);
			var child = dir.getChild(folderName);
			if (createDir === true)
			{
				if (oFF.isNull(child))
				{
					child = oFF.VfsElementDir.createDir(this, folderName, null);
					dir.setChild(child);
				}
			}
			current = child;
		}
	}
	return current;
};
oFF.VfsFileSystem.prototype.processFetchFile = function(syncType, listener, customIdentifier, process, uri)
{
	return oFF.VfsFetchFileAction.createAndRun(syncType, listener, customIdentifier, this, process, uri);
};
oFF.VfsFileSystem.prototype.newFile = function(process, uri)
{
	var extResult = this.processFetchFile(oFF.SyncType.BLOCKING, null, null, process, uri);
	return extResult.getData();
};
oFF.VfsFileSystem.prototype.getPathInfo = function(path)
{
	var thePath = path;
	if (oFF.isNull(thePath))
	{
		thePath = "/";
	}
	if (oFF.XString.startsWith(thePath, "/") === false)
	{
		throw oFF.XException.createIllegalArgumentException(oFF.XStringUtils.concatenate2("File path must start with slash: ", thePath));
	}
	var pathElements = oFF.XStringTokenizer.splitString(thePath, "/");
	var size = pathElements.size();
	if (size > 1 && oFF.XStringUtils.isNullOrEmpty(pathElements.get(size - 1)))
	{
		pathElements.removeAt(size - 1);
		size = size - 1;
	}
	var name = pathElements.get(size - 1);
	if (oFF.XStringUtils.isNullOrEmpty(name))
	{
		name = null;
	}
	var element = this.m_root;
	var parentNode = null;
	var lastSeenParentNode = null;
	var lastSeenParentNodeIndex = -1;
	var matchResultType = oFF.VfsMatchResultType.EXACT;
	for (var i = 1; i < size; i++)
	{
		if (oFF.isNull(element))
		{
			parentNode = null;
			break;
		}
		else
		{
			if (element.getComponentType().isTypeOf(oFF.VfsElementType.NODE))
			{
				parentNode = element;
				lastSeenParentNode = parentNode;
				lastSeenParentNodeIndex = i - 1;
			}
			else
			{
				matchResultType = oFF.VfsMatchResultType.ERROR;
				break;
			}
		}
		var childName = pathElements.get(i);
		element = parentNode.getChild(childName);
		if (oFF.isNull(element))
		{
			matchResultType = oFF.VfsMatchResultType.NOT_EXISTENT;
		}
	}
	var info = oFF.VfsPathInfo.create(name, thePath, pathElements, lastSeenParentNode, lastSeenParentNodeIndex, parentNode, element, matchResultType);
	return info;
};

oFF.XWebDAV = function() {};
oFF.XWebDAV.prototype = new oFF.DfXFileSystemOS();
oFF.XWebDAV.prototype._ff_c = "XWebDAV";

oFF.XWebDAV.createWebDav = function(Session, uri)
{
	var newObject = new oFF.XWebDAV();
	newObject.setupExt(Session, uri);
	return newObject;
};
oFF.XWebDAV.prototype.m_uri = null;
oFF.XWebDAV.prototype.m_httpClient = null;
oFF.XWebDAV.prototype.releaseObject = function()
{
	this.m_uri = null;
	this.m_httpClient = oFF.XObjectExt.release(this.m_httpClient);
	oFF.DfXFileSystemOS.prototype.releaseObject.call( this );
};
oFF.XWebDAV.prototype.setupExt = function(session, uri)
{
	this.setupSessionContext(session);
	this.m_uri = uri;
};
oFF.XWebDAV.prototype.loadExt = function(nativePath)
{
	var request = oFF.HttpRequest.createByUri(this.m_uri);
	this.m_httpClient = request.newHttpClient(this.getSession());
	var extResponse = this.m_httpClient.processHttpRequest(oFF.SyncType.BLOCKING, null, null);
	if (extResponse.isValid())
	{
		return extResponse.getData();
	}
	var fileContent = oFF.XFileContent.createFileContent();
	fileContent.setMessageCollection(extResponse);
	return fileContent;
};
oFF.XWebDAV.prototype.getProtocolType = function()
{
	return oFF.ProtocolType.WEB_DAV;
};
oFF.XWebDAV.prototype.getRoots = function()
{
	var list = oFF.XListOfString.create();
	list.add("/");
	return list;
};

oFF.XFileSystemManager = function() {};
oFF.XFileSystemManager.prototype = new oFF.DfProcessContext();
oFF.XFileSystemManager.prototype._ff_c = "XFileSystemManager";

oFF.XFileSystemManager.create = function(process)
{
	var newObj;
	if (process.getParentProcess() === null)
	{
		newObj = oFF.XFileSystemManagerRoot.createRoot(process);
	}
	else
	{
		newObj = oFF.XFileSystemManagerChild.createChild(process);
	}
	return newObj;
};
oFF.XFileSystemManager.prototype.m_activeFileSystem = null;
oFF.XFileSystemManager.prototype.m_workingDirectory = null;
oFF.XFileSystemManager.prototype.setupProcessContext = function(process)
{
	oFF.DfProcessContext.prototype.setupProcessContext.call( this , process);
};
oFF.XFileSystemManager.prototype.newRootDirectoryFile = function()
{
	var uri = this.getRootDirectoryUri();
	var file = oFF.XFile.createByUri(this.getProcess(), uri);
	return file;
};
oFF.XFileSystemManager.prototype.newWorkingDirectoryFile = function()
{
	var uri = this.getWorkingDirectoryUri();
	var file = oFF.XFile.createByUri(this.getProcess(), uri);
	return file;
};
oFF.XFileSystemManager.prototype.getWorkingDirectoryUri = function()
{
	this.validateFs();
	return this.m_workingDirectory;
};
oFF.XFileSystemManager.prototype.setWorkingDirectoryUri = function(directory)
{
	this.validateFs();
	if (oFF.notNull(directory))
	{
		var protocolType = directory.getProtocolType();
		var activeFileSystem = this.getActiveFileSystem();
		var fsProtocolType = activeFileSystem.getProtocolType();
		if (protocolType === fsProtocolType)
		{
			this.m_workingDirectory = directory;
		}
		else
		{
			this.log2("New working directory uri is not matching fs: ", directory.toString());
		}
	}
};
oFF.XFileSystemManager.prototype.getWorkingDirectoryProtocolType = function()
{
	var fsProtocolType = null;
	var activeFileSystem = this.getActiveFileSystem();
	if (oFF.notNull(activeFileSystem))
	{
		fsProtocolType = activeFileSystem.getProtocolType();
	}
	return fsProtocolType;
};
oFF.XFileSystemManager.prototype.getWorkingDirectoryUriByProtocolType = function(protocolType)
{
	var uri = null;
	var fileSystem = this.getFileSystem(protocolType);
	if (oFF.notNull(fileSystem))
	{
		uri = fileSystem.getWorkingDirectoryUri();
	}
	return uri;
};
oFF.XFileSystemManager.prototype.getRootDirectoryUri = function()
{
	return this.getActiveFileSystem().getRootDirectoryUri();
};
oFF.XFileSystemManager.prototype.getNativeSlash = function()
{
	return this.getActiveFileSystem().getNativeSlash();
};
oFF.XFileSystemManager.prototype.getActiveFileSystem = function()
{
	this.validateFs();
	return this.m_activeFileSystem;
};
oFF.XFileSystemManager.prototype.setActiveFileSystem = function(protocolType)
{
	var fs = this.getFileSystem(protocolType);
	if (oFF.notNull(fs))
	{
		this.m_activeFileSystem = fs;
		this.m_workingDirectory = this.m_activeFileSystem.getWorkingDirectoryUri();
	}
};
oFF.XFileSystemManager.prototype.setActiveFileSystemByUri = function(uri)
{
	var fs = this.getFileSystemByUri(uri);
	if (oFF.notNull(fs))
	{
		this.m_activeFileSystem = fs;
		this.m_workingDirectory = this.m_activeFileSystem.getWorkingDirectoryUri();
	}
	return fs;
};
oFF.XFileSystemManager.prototype.setFileSystem = function(protocolType, fs)
{
	if (oFF.notNull(protocolType) && oFF.notNull(fs))
	{
		var uri = oFF.XUri.create();
		uri.setProtocolType(protocolType);
		this.setFileSystemByUri(uri, fs);
	}
};
oFF.XFileSystemManager.prototype.getFileSystem = function(protocolType)
{
	var fs = null;
	if (oFF.notNull(protocolType))
	{
		var uri = oFF.XUri.create();
		uri.setProtocolType(protocolType);
		fs = this.getFileSystemByUri(uri);
	}
	return fs;
};
oFF.XFileSystemManager.prototype.processFetchFile = function(syncType, listener, customIdentifier, process, uri)
{
	return oFF.XFileSystemManagerActionFetchFile.createAndRun(syncType, listener, customIdentifier, this, uri);
};
oFF.XFileSystemManager.prototype.processFetchFileSystemExt = function(syncType, listener, customIdentifier, uri, activate)
{
	return oFF.XFileSystemManagerActionFetch.createAndRun(syncType, listener, customIdentifier, this, uri, activate);
};
oFF.XFileSystemManager.prototype.processFetchFileSystem = function(syncType, listener, customIdentifier, uri)
{
	return oFF.XFileSystemManagerActionFetch.createAndRun(syncType, listener, customIdentifier, this, uri, false);
};

oFF.LocalStorageWithPrefix = function() {};
oFF.LocalStorageWithPrefix.prototype = new oFF.XObject();
oFF.LocalStorageWithPrefix.prototype._ff_c = "LocalStorageWithPrefix";

oFF.LocalStorageWithPrefix.create = function(process)
{
	var newInstance = new oFF.LocalStorageWithPrefix();
	newInstance.setupStorage(process);
	return newInstance;
};
oFF.LocalStorageWithPrefix.prototype.m_prefix = null;
oFF.LocalStorageWithPrefix.prototype.setupStorage = function(process)
{
	if (oFF.notNull(process) && process.getProgramCfg() !== null)
	{
		this.m_prefix = oFF.XStringUtils.concatenate2(oFF.XString.toLowerCase(process.getProgramCfg().getName()), "_");
	}
	else
	{
		this.m_prefix = "";
	}
};
oFF.LocalStorageWithPrefix.prototype.removeKey = function(key)
{
	oFF.XLocalStorage.getInstance().removeKey(this.getKeyWithPrefix(key));
};
oFF.LocalStorageWithPrefix.prototype.containsKey = function(key)
{
	return oFF.XLocalStorage.getInstance().containsKey(this.getKeyWithPrefix(key));
};
oFF.LocalStorageWithPrefix.prototype.clear = function()
{
	var thisKeyList = this.getAllKeys();
	var thisKeyListIterator = thisKeyList.getIterator();
	while (thisKeyListIterator.hasNext())
	{
		var tmpThisKey = thisKeyListIterator.next();
		oFF.XLocalStorage.getInstance().removeKey(tmpThisKey);
	}
};
oFF.LocalStorageWithPrefix.prototype.getAllKeys = function()
{
	var keyList = oFF.XLocalStorage.getInstance().getAllKeys();
	var thisKeys = oFF.XListOfString.create();
	var keyListIterator = keyList.getIterator();
	while (keyListIterator.hasNext())
	{
		var tmpKey = keyListIterator.next();
		if (oFF.XString.startsWith(tmpKey, this.m_prefix))
		{
			thisKeys.add(tmpKey);
		}
	}
	return thisKeys;
};
oFF.LocalStorageWithPrefix.prototype.getStringByKey = function(name)
{
	return oFF.XLocalStorage.getInstance().getStringByKey(this.getKeyWithPrefix(name));
};
oFF.LocalStorageWithPrefix.prototype.getStringByKeyExt = function(name, defaultValue)
{
	return oFF.XLocalStorage.getInstance().getStringByKeyExt(this.getKeyWithPrefix(name), defaultValue);
};
oFF.LocalStorageWithPrefix.prototype.getIntegerByKey = function(name)
{
	return oFF.XLocalStorage.getInstance().getIntegerByKey(this.getKeyWithPrefix(name));
};
oFF.LocalStorageWithPrefix.prototype.getIntegerByKeyExt = function(name, defaultValue)
{
	return oFF.XLocalStorage.getInstance().getIntegerByKeyExt(this.getKeyWithPrefix(name), defaultValue);
};
oFF.LocalStorageWithPrefix.prototype.getLongByKey = function(name)
{
	return oFF.XLocalStorage.getInstance().getLongByKey(this.getKeyWithPrefix(name));
};
oFF.LocalStorageWithPrefix.prototype.getLongByKeyExt = function(name, defaultValue)
{
	return oFF.XLocalStorage.getInstance().getLongByKeyExt(this.getKeyWithPrefix(name), defaultValue);
};
oFF.LocalStorageWithPrefix.prototype.getDoubleByKey = function(name)
{
	return oFF.XLocalStorage.getInstance().getDoubleByKey(this.getKeyWithPrefix(name));
};
oFF.LocalStorageWithPrefix.prototype.getDoubleByKeyExt = function(name, defaultValue)
{
	return oFF.XLocalStorage.getInstance().getDoubleByKeyExt(this.getKeyWithPrefix(name), defaultValue);
};
oFF.LocalStorageWithPrefix.prototype.getBooleanByKey = function(name)
{
	return oFF.XLocalStorage.getInstance().getBooleanByKey(this.getKeyWithPrefix(name));
};
oFF.LocalStorageWithPrefix.prototype.getBooleanByKeyExt = function(name, defaultValue)
{
	return oFF.XLocalStorage.getInstance().getBooleanByKeyExt(this.getKeyWithPrefix(name), defaultValue);
};
oFF.LocalStorageWithPrefix.prototype.hasNullByKey = function(name)
{
	return oFF.XLocalStorage.getInstance().hasNullByKey(this.getKeyWithPrefix(name));
};
oFF.LocalStorageWithPrefix.prototype.putString = function(name, stringValue)
{
	oFF.XLocalStorage.getInstance().putString(this.getKeyWithPrefix(name), stringValue);
};
oFF.LocalStorageWithPrefix.prototype.putStringNotNull = function(name, stringValue)
{
	oFF.XLocalStorage.getInstance().putStringNotNull(this.getKeyWithPrefix(name), stringValue);
};
oFF.LocalStorageWithPrefix.prototype.putStringNotNullAndNotEmpty = function(name, stringValue)
{
	oFF.XLocalStorage.getInstance().putStringNotNullAndNotEmpty(this.getKeyWithPrefix(name), stringValue);
};
oFF.LocalStorageWithPrefix.prototype.putInteger = function(name, intValue)
{
	oFF.XLocalStorage.getInstance().putInteger(this.getKeyWithPrefix(name), intValue);
};
oFF.LocalStorageWithPrefix.prototype.putLong = function(name, longValue)
{
	oFF.XLocalStorage.getInstance().putLong(this.getKeyWithPrefix(name), longValue);
};
oFF.LocalStorageWithPrefix.prototype.putDouble = function(name, doubleValue)
{
	oFF.XLocalStorage.getInstance().putDouble(this.getKeyWithPrefix(name), doubleValue);
};
oFF.LocalStorageWithPrefix.prototype.putBoolean = function(key, booleanValue)
{
	oFF.XLocalStorage.getInstance().putBoolean(this.getKeyWithPrefix(key), booleanValue);
};
oFF.LocalStorageWithPrefix.prototype.putNull = function(name)
{
	oFF.XLocalStorage.getInstance().putNull(this.getKeyWithPrefix(name));
};
oFF.LocalStorageWithPrefix.prototype.getPrefix = function()
{
	return this.m_prefix;
};
oFF.LocalStorageWithPrefix.prototype.getKeyWithPrefix = function(key)
{
	return oFF.XStringUtils.concatenate2(this.m_prefix, key);
};

oFF.ConnectionContainer = function() {};
oFF.ConnectionContainer.prototype = new oFF.MessageManager();
oFF.ConnectionContainer.prototype._ff_c = "ConnectionContainer";

oFF.ConnectionContainer.create = function(systemConnect, systemName, isPrivate, internalCounter)
{
	var connectionContainer = new oFF.ConnectionContainer();
	connectionContainer.setupContainer(systemConnect, systemName, isPrivate, internalCounter);
	return connectionContainer;
};
oFF.ConnectionContainer.createFailedConnectionContainer = function(systemConnect, systemName, message)
{
	var connectionContainer = new oFF.ConnectionContainer();
	connectionContainer.setupContainer(systemConnect, systemName, true, 0);
	connectionContainer.addError(oFF.ErrorCodes.OTHER_ERROR, message);
	return connectionContainer;
};
oFF.ConnectionContainer.checkSecondaryServerMetadata = function(primary, secondary)
{
	var resultPrimary = primary;
	if (oFF.isNull(resultPrimary))
	{
		if (oFF.notNull(secondary) && secondary.getSyncState().isInSync() && secondary.isValid())
		{
			resultPrimary = secondary;
		}
	}
	if (oFF.notNull(resultPrimary) && resultPrimary.hasErrors())
	{
		resultPrimary = oFF.XObjectExt.release(resultPrimary);
	}
	return resultPrimary;
};
oFF.ConnectionContainer.prototype.m_uid = null;
oFF.ConnectionContainer.prototype.m_name = null;
oFF.ConnectionContainer.prototype.m_systemName = null;
oFF.ConnectionContainer.prototype.m_systemConnect = null;
oFF.ConnectionContainer.prototype.m_batchModePath = null;
oFF.ConnectionContainer.prototype.m_batchRequestManager = null;
oFF.ConnectionContainer.prototype.m_cache = null;
oFF.ConnectionContainer.prototype.m_systemDescription = null;
oFF.ConnectionContainer.prototype.m_internalCounter = 0;
oFF.ConnectionContainer.prototype.m_sysModCounter = 0;
oFF.ConnectionContainer.prototype.m_isBatchModeEnabled = false;
oFF.ConnectionContainer.prototype.m_isInAMergeProcessing = false;
oFF.ConnectionContainer.prototype.m_supportsBatchMode = false;
oFF.ConnectionContainer.prototype.m_supportsBatchRsStreaming = false;
oFF.ConnectionContainer.prototype.m_isPrivate = false;
oFF.ConnectionContainer.prototype.m_reentranceTicket = null;
oFF.ConnectionContainer.prototype.m_useSessionUrlRewrite = false;
oFF.ConnectionContainer.prototype.m_sessionUrlRewrite = null;
oFF.ConnectionContainer.prototype.m_sessionContextId = null;
oFF.ConnectionContainer.prototype.m_logoffSent = false;
oFF.ConnectionContainer.prototype.m_customHeaders = null;
oFF.ConnectionContainer.prototype.m_XXLPath = null;
oFF.ConnectionContainer.prototype.m_customObjects = null;
oFF.ConnectionContainer.prototype.m_XXLPathWithSchemeHostPortPrefix = null;
oFF.ConnectionContainer.prototype.m_crossSiteForgeryToken = null;
oFF.ConnectionContainer.prototype.m_csrfRequestCounter = 0;
oFF.ConnectionContainer.prototype.m_serverMetadataFetcherBlocking = null;
oFF.ConnectionContainer.prototype.m_serverMetadataFetcherNonBlocking = null;
oFF.ConnectionContainer.prototype.m_sharedCsrfToken = false;
oFF.ConnectionContainer.prototype.m_sessionRequestSyncAction = null;
oFF.ConnectionContainer.prototype.m_cachingMode = null;
oFF.ConnectionContainer.prototype.setupContainer = function(systemConnect, systemName, isPrivate, internalCounter)
{
	var session = null;
	if (oFF.notNull(systemConnect))
	{
		session = systemConnect.getConnectionPoolBase().getSession();
		if (oFF.notNull(session))
		{
			this.m_sharedCsrfToken = session.hasFeature(oFF.FeatureToggleOlap.SHARED_CSRF_TOKENS);
		}
	}
	this.setupSessionContext(session);
	this.m_uid = oFF.XGuid.getGuid();
	this.m_systemConnect = oFF.XWeakReferenceUtil.getWeakRef(systemConnect);
	this.m_systemName = systemName;
	this.m_isPrivate = isPrivate;
	if (oFF.notNull(systemConnect))
	{
		var connectionPool = systemConnect.getConnectionPoolBase();
		this.m_isInAMergeProcessing = connectionPool.isInAMergeProcessingEnabled(systemName);
		var systemDescription = connectionPool.getSystemLandscape().getSystemDescription(this.m_systemName);
		this.m_systemDescription = oFF.XWeakReferenceUtil.getWeakRef(systemDescription);
		this.m_internalCounter = internalCounter;
	}
	this.m_customHeaders = oFF.XProperties.create();
};
oFF.ConnectionContainer.prototype.supportsAnalyticCapability = function(capabilityName)
{
	var systemConnect = this.getSystemConnect();
	if (oFF.isNull(systemConnect))
	{
		return false;
	}
	var serverMetadata = systemConnect.getServerMetadata();
	return oFF.notNull(serverMetadata) && serverMetadata.supportsCapability(oFF.ServerService.ANALYTIC, capabilityName);
};
oFF.ConnectionContainer.prototype.getDefaultMessageLayer = function()
{
	return oFF.OriginLayer.IOLAYER;
};
oFF.ConnectionContainer.prototype.releaseObject = function()
{
	var isHana = this.getSystemType() !== null && this.getSystemType().isTypeOf(oFF.SystemType.HANA);
	var logoffDisabled = this.getSession() !== null && isHana && this.getSession().getEnvironment().getBooleanByKeyExt(oFF.XEnvironmentConstants.FIREFLY_DISABLE_CONNECTION_LOGOFF, false);
	if (!logoffDisabled)
	{
		this.logoff(oFF.SyncType.BLOCKING, null, null);
	}
	this.m_serverMetadataFetcherBlocking = oFF.XObjectExt.release(this.m_serverMetadataFetcherBlocking);
	this.m_serverMetadataFetcherNonBlocking = oFF.XObjectExt.release(this.m_serverMetadataFetcherNonBlocking);
	var systemConnect = oFF.XWeakReferenceUtil.getHardRef(this.m_systemConnect);
	this.m_systemConnect = null;
	this.m_batchRequestManager = oFF.XObjectExt.release(this.m_batchRequestManager);
	this.m_batchModePath = null;
	this.m_cache = null;
	this.m_crossSiteForgeryToken = null;
	this.m_name = null;
	this.m_reentranceTicket = null;
	this.m_systemDescription = oFF.XObjectExt.release(this.m_systemDescription);
	this.m_systemName = null;
	this.m_sessionUrlRewrite = null;
	this.m_XXLPath = null;
	this.m_customHeaders = oFF.XObjectExt.release(this.m_customHeaders);
	this.m_customObjects = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_customObjects);
	this.m_XXLPathWithSchemeHostPortPrefix = null;
	oFF.MessageManager.prototype.releaseObject.call( this );
	if (oFF.notNull(systemConnect))
	{
		systemConnect._checkReleasedConnections();
	}
};
oFF.ConnectionContainer.prototype.logoff = function(syncType, listener, customIdentifier)
{
	if (!this.m_logoffSent)
	{
		var systemType = this.getSystemType();
		var logoffPath = oFF.isNull(systemType) ? null : systemType.getLogoffPath();
		if (oFF.XStringUtils.isNotNullAndNotEmpty(logoffPath))
		{
			this.removePendingBatchFunctions();
			var closeFunction = this.newRpcFunction(logoffPath);
			var request = closeFunction.getRpcRequest();
			request.setRequestType(oFF.HttpSemanticRequestType.LOGOUT);
			request.setIsFireAndForgetCall(true);
			request.setIsLogoff(this.getSystemType().isTypeOf(oFF.SystemType.ABAP));
			if (systemType.isTypeOf(oFF.SystemType.HANA))
			{
				request.setMethod(oFF.HttpRequestMethod.HTTP_POST);
			}
			else
			{
				request.setMethod(oFF.HttpRequestMethod.HTTP_GET);
			}
			this.m_logoffSent = true;
			return closeFunction.processFunctionExecution(syncType, listener, customIdentifier);
		}
		else if (oFF.notNull(listener))
		{
			listener.onFunctionExecuted(oFF.ExtResult.createWithErrorMessage("No logoff path"), null, customIdentifier);
		}
	}
	else if (oFF.notNull(listener))
	{
		listener.onFunctionExecuted(oFF.ExtResult.createWithInfoMessage("Already logged off"), null, customIdentifier);
	}
	return null;
};
oFF.ConnectionContainer.prototype.removePendingBatchFunctions = function()
{
	if (this.isBatchModeEnabled())
	{
		this.m_isBatchModeEnabled = false;
		oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.getBatchFunctions());
	}
};
oFF.ConnectionContainer.prototype.getSystemDescription = function()
{
	return oFF.XWeakReferenceUtil.getHardRef(this.m_systemDescription);
};
oFF.ConnectionContainer.prototype.getSystemType = function()
{
	var systemDescription = this.getSystemDescription();
	return oFF.isNull(systemDescription) ? null : systemDescription.getSystemType();
};
oFF.ConnectionContainer.prototype.getHost = function()
{
	var systemDescription = this.getSystemDescription();
	return oFF.isNull(systemDescription) ? null : systemDescription.getHost();
};
oFF.ConnectionContainer.prototype.getCookiesForPath = function(path)
{
	var domain = this.getHost();
	if (oFF.isNull(domain))
	{
		return null;
	}
	var connectionPool = this.getConnectionPool();
	if (oFF.isNull(connectionPool))
	{
		return null;
	}
	var cookiesMasterStore = connectionPool.getCookiesMasterStore();
	return cookiesMasterStore.getCookies(domain, path);
};
oFF.ConnectionContainer.prototype.mergeCookies = function(path, responseCookies)
{
	var connectionPool = this.getConnectionPool();
	if (oFF.notNull(connectionPool))
	{
		var cookiesMasterStore = connectionPool.getCookiesMasterStore();
		cookiesMasterStore.applyCookies(this.getHost(), path, responseCookies);
	}
};
oFF.ConnectionContainer.prototype.getReentranceTicket = function()
{
	var tmp = this.m_reentranceTicket;
	this.m_reentranceTicket = null;
	return tmp;
};
oFF.ConnectionContainer.prototype.setReentranceTicket = function(ticket)
{
	this.m_reentranceTicket = ticket;
};
oFF.ConnectionContainer.prototype.isContextIdRequired = function()
{
	return this.getSystemDescription().isContextIdRequired();
};
oFF.ConnectionContainer.prototype.isCsrfTokenRequired = function()
{
	return this.getSystemDescription().isCsrfTokenRequired();
};
oFF.ConnectionContainer.prototype.getCsrfToken = function()
{
	if (oFF.isNull(this.m_crossSiteForgeryToken) && this.hasSharedCsrfTokens())
	{
		var systemConnect = this.getSystemConnect();
		if (oFF.notNull(systemConnect))
		{
			this.m_crossSiteForgeryToken = systemConnect.getCsrfToken();
		}
	}
	return this.m_crossSiteForgeryToken;
};
oFF.ConnectionContainer.prototype.setCsrfToken = function(csrfToken)
{
	this.m_crossSiteForgeryToken = csrfToken;
	if (oFF.XStringUtils.isNotNullAndNotEmpty(csrfToken))
	{
		if (this.hasSharedCsrfTokens())
		{
			var systemConnect = this.getSystemConnect();
			if (oFF.notNull(systemConnect))
			{
				systemConnect.setCsrfToken(csrfToken);
			}
		}
	}
};
oFF.ConnectionContainer.prototype.incCsrfRequiredCount = function()
{
	this.m_csrfRequestCounter = this.m_csrfRequestCounter + 1;
};
oFF.ConnectionContainer.prototype.getCsrfRequiredCount = function()
{
	return this.m_csrfRequestCounter;
};
oFF.ConnectionContainer.prototype.setCsrfRequiredCount = function(number)
{
	this.m_csrfRequestCounter = number;
};
oFF.ConnectionContainer.prototype.getServerMetadata = function()
{
	var serverMetadata = null;
	var extResult = this.getServerMetadataExt(oFF.SyncType.BLOCKING, null, null, oFF.HttpSemanticRequestType.SERVER_METADATA);
	if (extResult.isValid())
	{
		serverMetadata = extResult.getData();
	}
	return serverMetadata;
};
oFF.ConnectionContainer.prototype.getServerMetadataExt = function(syncType, listener, customIdentifier, type)
{
	var doRevalidate = false;
	if (type === oFF.HttpSemanticRequestType.CSRF_UPDATE || type === oFF.HttpSemanticRequestType.CHECK_CONNECTION || type === oFF.HttpSemanticRequestType.KEEP_ALIVE || type === oFF.HttpSemanticRequestType.SESSION_REQUEST)
	{
		doRevalidate = true;
	}
	this.validateMetadataFetcher(doRevalidate);
	var myServerMetadataFetcher;
	if (syncType === oFF.SyncType.BLOCKING)
	{
		this.m_serverMetadataFetcherBlocking = oFF.ConnectionContainer.checkSecondaryServerMetadata(this.m_serverMetadataFetcherBlocking, this.m_serverMetadataFetcherNonBlocking);
		myServerMetadataFetcher = this.m_serverMetadataFetcherBlocking;
	}
	else
	{
		this.m_serverMetadataFetcherNonBlocking = oFF.ConnectionContainer.checkSecondaryServerMetadata(this.m_serverMetadataFetcherNonBlocking, this.m_serverMetadataFetcherBlocking);
		myServerMetadataFetcher = this.m_serverMetadataFetcherNonBlocking;
	}
	if (oFF.isNull(myServerMetadataFetcher))
	{
		var systemType = this.getSystemType();
		var logonMetadataRequired = oFF.notNull(systemType) && systemType.isLogonMetadataRequired();
		if (this.isPreflightNeeded() || logonMetadataRequired)
		{
			var sequence = oFF.SyncActionSequence.create(syncType, listener, customIdentifier, this);
			if (this.isPreflightNeeded())
			{
				var preflightAction = oFF.ServerPreflightAction.createAndRun(oFF.SyncType.DELAYED, this, null, null);
				sequence.addAction(preflightAction);
			}
			var metadataAction = oFF.ServerMetadataAction.create(oFF.SyncType.DELAYED, this, null, null, doRevalidate, type);
			if (logonMetadataRequired)
			{
				var logonAction = oFF.ServerLoginAction.createAndRun(oFF.SyncType.DELAYED, this, null, null);
				sequence.addAction(logonAction);
				metadataAction.setLogonAction(logonAction);
			}
			sequence.setMainAction(metadataAction);
			myServerMetadataFetcher = sequence;
		}
		else
		{
			myServerMetadataFetcher = oFF.ServerMetadataAction.create(syncType, this, listener, customIdentifier, doRevalidate, type);
		}
		if (syncType === oFF.SyncType.BLOCKING)
		{
			this.m_serverMetadataFetcherBlocking = myServerMetadataFetcher;
		}
		else
		{
			this.m_serverMetadataFetcherNonBlocking = myServerMetadataFetcher;
		}
		myServerMetadataFetcher.process();
	}
	else
	{
		myServerMetadataFetcher.attachListener(listener, oFF.ListenerType.SPECIFIC, customIdentifier);
	}
	return myServerMetadataFetcher;
};
oFF.ConnectionContainer.prototype.validateMetadataFetcher = function(forceRevalidate)
{
	if (oFF.notNull(this.m_serverMetadataFetcherBlocking) && this.m_serverMetadataFetcherBlocking.isReleased())
	{
		this.m_serverMetadataFetcherBlocking = null;
	}
	if (oFF.notNull(this.m_serverMetadataFetcherNonBlocking) && this.m_serverMetadataFetcherNonBlocking.isReleased())
	{
		this.m_serverMetadataFetcherNonBlocking = null;
	}
	if (forceRevalidate)
	{
		if (this.m_serverMetadataFetcherBlocking === this.m_serverMetadataFetcherNonBlocking)
		{
			if (oFF.notNull(this.m_serverMetadataFetcherBlocking) && this.m_serverMetadataFetcherBlocking.getSyncState().isInSync())
			{
				this.m_serverMetadataFetcherBlocking = oFF.XObjectExt.release(this.m_serverMetadataFetcherBlocking);
				this.m_serverMetadataFetcherNonBlocking = null;
			}
		}
		else
		{
			if (oFF.notNull(this.m_serverMetadataFetcherBlocking) && this.m_serverMetadataFetcherBlocking.getSyncState().isInSync())
			{
				this.m_serverMetadataFetcherBlocking = oFF.XObjectExt.release(this.m_serverMetadataFetcherBlocking);
			}
			if (oFF.notNull(this.m_serverMetadataFetcherNonBlocking) && this.m_serverMetadataFetcherNonBlocking.getSyncState().isInSync())
			{
				this.m_serverMetadataFetcherNonBlocking = oFF.XObjectExt.release(this.m_serverMetadataFetcherNonBlocking);
			}
		}
	}
};
oFF.ConnectionContainer.prototype.newRpcFunctionForBLOB = function(name)
{
	var xxlPath = this.getWebServicePathForBLOBs();
	var originalPath = xxlPath.getPath();
	var completePath = oFF.XStringUtils.concatenate2(originalPath, name);
	var completeUri = oFF.XUri.createFromUrl(completePath);
	return this.newRpcFunctionInternal(completeUri, true);
};
oFF.ConnectionContainer.prototype.newRpcFunctionByService = function(serviceName)
{
	return this.newRpcFunctionByServiceAndPath(serviceName, null);
};
oFF.ConnectionContainer.prototype.newRpcFunctionByServiceAndPath = function(serviceName, path)
{
	var serverMetadata = this.getServerMetadata();
	if (oFF.isNull(serverMetadata))
	{
		return null;
	}
	var capabilities = serverMetadata.getMetadataForService(serviceName);
	var fastPath = capabilities.getByKey(oFF.ConnectionConstants.FAST_PATH);
	if (oFF.isNull(fastPath))
	{
		var systemType = this.getSystemType();
		return this.newRpcFunction(systemType.getInAPath());
	}
	if (oFF.notNull(path))
	{
		var uriWithFastPath = oFF.XUri.createFromOther(path);
		uriWithFastPath.setPath(oFF.XStringUtils.concatenate2(fastPath.getValue(), path.getPath()));
		return this.newRpcFunctionByUri(uriWithFastPath);
	}
	return this.newRpcFunction(fastPath.getValue());
};
oFF.ConnectionContainer.prototype.newRpcFunction = function(name)
{
	var relativeUri = oFF.XUri.createFromUrl(name);
	return this.newRpcFunctionByUri(relativeUri);
};
oFF.ConnectionContainer.prototype.newRpcFunctionForNonBatchableQuery = function(name)
{
	var relativeUri = oFF.XUri.createFromUrl(name);
	return this.newRpcFunctionInternal(relativeUri, false);
};
oFF.ConnectionContainer.prototype.newRpcFunctionByUri = function(relativeUri)
{
	if (this.isBatchModeEnabled())
	{
		var systemConnect = this.getSystemConnect();
		var rpcFunction = systemConnect.newBatchFunction(this, relativeUri);
		this.m_batchRequestManager.addBatchFunction(rpcFunction);
		return rpcFunction;
	}
	return this.newRpcFunctionInternal(relativeUri, false);
};
oFF.ConnectionContainer.prototype.newRpcFunctionInternal = function(relativeUri, imageFunction)
{
	var systemDescription = this.getSystemDescription();
	var rpcFunction = null;
	if (oFF.notNull(systemDescription) && oFF.notNull(relativeUri))
	{
		var protocolType = systemDescription.getProtocolType();
		var systemType = systemDescription.getSystemType();
		var name = relativeUri.getPath();
		var theUri = relativeUri;
		if (this.getConnectionPool().isEqsEnabled(systemDescription.getSystemName()) === true)
		{
			var eqsRewritings = systemDescription.getEqsRewritings();
			if (oFF.notNull(eqsRewritings) && eqsRewritings.size() > 0)
			{
				for (var i = 0; i < eqsRewritings.size(); i++)
				{
					var pair = eqsRewritings.get(i);
					var pattern = pair.getName();
					if (oFF.XString.isEqual(pattern, name))
					{
						name = pair.getValue();
						var uriBase = oFF.XUri.createFromOther(relativeUri);
						uriBase.setPath(name);
						theUri = uriBase;
						break;
					}
				}
			}
		}
		rpcFunction = oFF.RpcFunctionFactory.create(this, theUri.getUrl(), systemType, protocolType);
		var rpcRequest = rpcFunction.getRpcRequest();
		if (imageFunction)
		{
			rpcRequest.setUseStaticUrl(true);
		}
	}
	return rpcFunction;
};
oFF.ConnectionContainer.prototype.getTraceInfo = function()
{
	var connectionPool = this.getConnectionPool();
	return oFF.isNull(connectionPool) ? null : connectionPool.getTraceInfo(this.m_systemName);
};
oFF.ConnectionContainer.prototype.isBatchModeEnabled = function()
{
	return this.m_isBatchModeEnabled;
};
oFF.ConnectionContainer.prototype.isInAMergeProcessingEnabled = function()
{
	return this.m_isInAMergeProcessing;
};
oFF.ConnectionContainer.prototype.setIsInAMergeProcessingEnabled = function(isInAMergeProcessing)
{
	this.m_isInAMergeProcessing = isInAMergeProcessing;
};
oFF.ConnectionContainer.prototype.getBatchFunctions = function()
{
	return oFF.isNull(this.m_batchRequestManager) ? null : this.m_batchRequestManager.getBatchFunctions();
};
oFF.ConnectionContainer.prototype.getBatchRequestManager = function()
{
	return this.m_batchRequestManager;
};
oFF.ConnectionContainer.prototype.getBatchQueueSize = function()
{
	return oFF.isNull(this.m_batchRequestManager) ? 0 : this.m_batchRequestManager.getBatchFunctions().size();
};
oFF.ConnectionContainer.prototype.setBatchModeEnabled = function(syncType, enable)
{
	if (this.m_supportsBatchMode && this.m_isBatchModeEnabled !== enable)
	{
		this.m_isBatchModeEnabled = enable;
		if (enable)
		{
			var systemConnect = this.getSystemConnect();
			this.m_batchRequestManager = systemConnect.newBatchRequestManager();
		}
		else if (oFF.notNull(this.m_batchRequestManager))
		{
			this.m_batchRequestManager.executeBatch(syncType, this, this.m_batchModePath, false);
			this.resetBatchRequestManager();
		}
	}
};
oFF.ConnectionContainer.prototype.resetBatchRequestManager = function()
{
	this.m_batchRequestManager = null;
};
oFF.ConnectionContainer.prototype.disableBatchModeWithRsStreaming = function(syncType)
{
	if (oFF.notNull(this.m_batchRequestManager) && this.m_isBatchModeEnabled)
	{
		this.m_isBatchModeEnabled = false;
		this.m_batchRequestManager.executeBatch(syncType, this, this.m_batchModePath, this.m_supportsBatchRsStreaming);
		this.resetBatchRequestManager();
	}
};
oFF.ConnectionContainer.prototype.supportsBatchMode = function()
{
	return this.m_supportsBatchMode;
};
oFF.ConnectionContainer.prototype.supportsWebServiceForBLOBObjects = function()
{
	return this.getWebServicePathForBLOBs() !== null;
};
oFF.ConnectionContainer.prototype.getWebServicePathForBLOBs = function()
{
	return this.m_XXLPath;
};
oFF.ConnectionContainer.prototype.setWebServicePathForBLOBs = function(path)
{
	this.m_XXLPath = oFF.XUri.createFromUrl(path);
};
oFF.ConnectionContainer.prototype.supportsBatchRsStreaming = function()
{
	return this.m_supportsBatchRsStreaming;
};
oFF.ConnectionContainer.prototype.setSupportsBatchMode = function(supportsBatchMode, supportsBatchRsStreaming, path)
{
	this.m_supportsBatchMode = supportsBatchMode;
	this.m_supportsBatchRsStreaming = supportsBatchRsStreaming;
	this.m_batchModePath = oFF.XUri.createFromUrl(path);
	if (supportsBatchMode)
	{
		var systemName = this.m_systemName;
		if (this.getConnectionPool().isBatchModeEnabled(systemName))
		{
			this.setBatchModeEnabled(oFF.SyncType.BLOCKING, true);
		}
	}
};
oFF.ConnectionContainer.prototype.getConnectionPool = function()
{
	var systemConnect = this.getSystemConnect();
	return oFF.isNull(systemConnect) ? null : systemConnect.getConnectionPoolBase();
};
oFF.ConnectionContainer.prototype.getConnectionCache = function()
{
	if (oFF.isNull(this.m_cache))
	{
		var systemConnect = this.getSystemConnect();
		if (oFF.notNull(systemConnect))
		{
			this.m_cache = systemConnect.getConnectionCache();
		}
	}
	return this.m_cache;
};
oFF.ConnectionContainer.prototype.setName = function(name)
{
	this.m_name = name;
};
oFF.ConnectionContainer.prototype.getName = function()
{
	return this.m_name;
};
oFF.ConnectionContainer.prototype.isShared = function()
{
	return !this.m_isPrivate;
};
oFF.ConnectionContainer.prototype.isPrivate = function()
{
	return this.m_isPrivate;
};
oFF.ConnectionContainer.prototype.isLogoffSent = function()
{
	return this.m_logoffSent;
};
oFF.ConnectionContainer.prototype.setLogoffSent = function(logoffSent)
{
	this.m_logoffSent = logoffSent;
};
oFF.ConnectionContainer.prototype.useSessionUrlRewrite = function()
{
	return this.m_useSessionUrlRewrite;
};
oFF.ConnectionContainer.prototype.setUseUrlSessionId = function(useUrlSessionId)
{
	this.m_useSessionUrlRewrite = useUrlSessionId;
};
oFF.ConnectionContainer.prototype.getBoeSessionToken = function()
{
	return this.getSessionContextId();
};
oFF.ConnectionContainer.prototype.setBoeSessionToken = function(boeSessionToken)
{
	this.setSessionContextId(boeSessionToken);
};
oFF.ConnectionContainer.prototype.getSapSessionContext = function()
{
	return this.getSessionContextId();
};
oFF.ConnectionContainer.prototype.setSapSessionContext = function(sessionContextId)
{
	this.setSessionContextId(sessionContextId);
};
oFF.ConnectionContainer.prototype.getSessionContextId = function()
{
	return this.m_sessionContextId;
};
oFF.ConnectionContainer.prototype.setSessionContextId = function(sessionContextId)
{
	this.m_sessionContextId = sessionContextId;
};
oFF.ConnectionContainer.prototype.getSessionUrlRewrite = function()
{
	return this.m_sessionUrlRewrite;
};
oFF.ConnectionContainer.prototype.setSessionUrlRewrite = function(sessionUrlRewrite)
{
	if (oFF.XStringUtils.isNotNullAndNotEmpty(sessionUrlRewrite))
	{
		var beginIndex = oFF.XString.indexOf(sessionUrlRewrite, "(");
		var endIndex = oFF.XString.indexOf(sessionUrlRewrite, ")");
		if (beginIndex !== -1 && endIndex !== -1 && beginIndex < endIndex)
		{
			this.m_sessionUrlRewrite = oFF.XString.substring(sessionUrlRewrite, beginIndex, endIndex + 1);
			var value = oFF.XString.substring(sessionUrlRewrite, beginIndex + 1, endIndex);
			value = oFF.XString.replace(value, "-", "/");
			var byteArray = oFF.XHttpUtils.decodeBase64ToByteArray(value);
			var output = oFF.XByteArray.convertToString(byteArray);
			this.m_sessionContextId = oFF.XString.substring(output, 2, -1);
		}
	}
};
oFF.ConnectionContainer.prototype.getSysModCounter = function()
{
	return this.m_sysModCounter;
};
oFF.ConnectionContainer.prototype.getSystemConnect = function()
{
	return oFF.XWeakReferenceUtil.getHardRef(this.m_systemConnect);
};
oFF.ConnectionContainer.prototype.isPreflightNeeded = function()
{
	var systemConnect = this.getSystemConnect();
	return oFF.notNull(systemConnect) && systemConnect.isPreflightNeeded();
};
oFF.ConnectionContainer.prototype.getPreflightUri = function()
{
	var systemConnect = this.getSystemConnect();
	return oFF.isNull(systemConnect) ? null : systemConnect.getPreflightUri();
};
oFF.ConnectionContainer.prototype.setIsPreflightNeeded = function(isPreflightNeeded)
{
	var systemConnect = this.getSystemConnect();
	if (oFF.notNull(systemConnect))
	{
		systemConnect.setIsPreflightNeeded(isPreflightNeeded);
	}
};
oFF.ConnectionContainer.prototype.getPersonalization = function()
{
	var userManager = this.getProcess().getUserManager();
	var systemDescription = this.getSystemDescription();
	return userManager.newMergedPersonalization2(systemDescription);
};
oFF.ConnectionContainer.prototype.getBatchModePath = function()
{
	if (this.m_supportsBatchMode)
	{
		return this.m_batchModePath.getPath();
	}
	return null;
};
oFF.ConnectionContainer.prototype.getBatchModePathExt = function()
{
	if (this.m_supportsBatchMode)
	{
		return this.m_batchModePath;
	}
	return null;
};
oFF.ConnectionContainer.prototype.addCustomHeader = function(headerName, headerValue)
{
	this.m_customHeaders.put(headerName, headerValue);
};
oFF.ConnectionContainer.prototype.getCustomHeaders = function()
{
	return this.m_customHeaders;
};
oFF.ConnectionContainer.prototype.removeCustomHeader = function(headerName)
{
	return this.m_customHeaders.remove(headerName);
};
oFF.ConnectionContainer.prototype.getSystemName = function()
{
	return this.m_systemName;
};
oFF.ConnectionContainer.prototype.addCustomObject = function(name, customObject)
{
	if (oFF.XStringUtils.isNotNullAndNotEmpty(name))
	{
		if (oFF.isNull(this.m_customObjects))
		{
			this.m_customObjects = oFF.XHashMapByString.create();
		}
		this.m_customObjects.put(name, customObject);
	}
};
oFF.ConnectionContainer.prototype.getCustomObject = function(name)
{
	return oFF.notNull(this.m_customObjects) ? this.m_customObjects.getByKey(name) : null;
};
oFF.ConnectionContainer.prototype.sendKeepAlive = function(syncType, listener, customIdentifier)
{
	var action = oFF.ServerMetadataAction.create(syncType, this, listener, customIdentifier, true, oFF.HttpSemanticRequestType.KEEP_ALIVE);
	action.process();
	return action;
};
oFF.ConnectionContainer.prototype.getXXLPathWithSchemeHostPortPrefix = function()
{
	if (oFF.isNull(this.m_XXLPathWithSchemeHostPortPrefix))
	{
		var systemDescription = this.getSystemDescription();
		var webServicePathForBLOBs = this.getWebServicePathForBLOBs();
		var XXLPathWithSchemeHostPortPrefix = oFF.XStringBuffer.create();
		XXLPathWithSchemeHostPortPrefix.append(systemDescription.getUrlWithoutAuthentication());
		if (systemDescription.isHostNullOrEmpty())
		{
			XXLPathWithSchemeHostPortPrefix.append(this.getSession().getNetworkLocation().getHost());
		}
		XXLPathWithSchemeHostPortPrefix.append(systemDescription.getPrefix()).append(webServicePathForBLOBs.toString());
		this.m_XXLPathWithSchemeHostPortPrefix = XXLPathWithSchemeHostPortPrefix.toString();
	}
	return this.m_XXLPathWithSchemeHostPortPrefix;
};
oFF.ConnectionContainer.prototype.getConnectionUid = function()
{
	return this.m_uid;
};
oFF.ConnectionContainer.prototype.hasSharedCsrfTokens = function()
{
	return this.m_sharedCsrfToken;
};
oFF.ConnectionContainer.prototype.getUserManager = function()
{
	return this.getProcess().getUserManager();
};
oFF.ConnectionContainer.prototype.getProcess = function()
{
	return this.getSession();
};
oFF.ConnectionContainer.prototype.getSessionRequestSyncAction = function()
{
	return this.m_sessionRequestSyncAction;
};
oFF.ConnectionContainer.prototype.setSessionRequestSyncAction = function(sessionRequestSyncAction)
{
	this.m_sessionRequestSyncAction = sessionRequestSyncAction;
};
oFF.ConnectionContainer.prototype.getCachingMode = function()
{
	if (oFF.isNull(this.m_cachingMode))
	{
		var cache = this.getConnectionCache();
		if (oFF.notNull(cache) && cache.isEnabled())
		{
			this.m_cachingMode = oFF.HttpCachingMode.L1_INITIAL;
		}
		else
		{
			this.m_cachingMode = oFF.HttpCachingMode.L3_LIVE_NO_CACHE;
		}
	}
	return this.m_cachingMode;
};
oFF.ConnectionContainer.prototype.setCachingMode = function(mode)
{
	this.m_cachingMode = mode;
};
oFF.ConnectionContainer.prototype.toString = function()
{
	var buffer = oFF.XStringBuffer.create();
	var systemDescription = this.getSystemDescription();
	buffer.append("#").appendInt(this.m_internalCounter).append(": ").append(oFF.isNull(systemDescription) ? null : systemDescription.toString());
	return buffer.toString();
};

oFF.KeepAliveResult = function() {};
oFF.KeepAliveResult.prototype = new oFF.MessageManager();
oFF.KeepAliveResult.prototype._ff_c = "KeepAliveResult";

oFF.KeepAliveResult.create = function(messages)
{
	var result = new oFF.KeepAliveResult();
	result.setupSessionContext(null);
	result.addAllMessages(messages);
	return result;
};

oFF.ProgramArgDef = function() {};
oFF.ProgramArgDef.prototype = new oFF.DfNameTextObject();
oFF.ProgramArgDef.prototype._ff_c = "ProgramArgDef";

oFF.ProgramArgDef.createOption = function(name, text, values, valueType, isMandatory)
{
	var newObj = new oFF.ProgramArgDef();
	newObj.setupWithNameText(name, text);
	newObj.setValues(values);
	newObj.setValueType(valueType);
	newObj.m_isParameter = false;
	newObj.m_isMandatory = isMandatory;
	return newObj;
};
oFF.ProgramArgDef.createStringParameter = function(name, text)
{
	var newObj = new oFF.ProgramArgDef();
	newObj.setupWithNameText(name, text);
	newObj.setValueType(oFF.XValueType.STRING);
	newObj.m_isParameter = true;
	return newObj;
};
oFF.ProgramArgDef.createStringArrayParameter = function(name, text)
{
	var newObj = new oFF.ProgramArgDef();
	newObj.setupWithNameText(name, text);
	newObj.setValueType(oFF.XValueType.ARRAY);
	newObj.m_isParameter = true;
	return newObj;
};
oFF.ProgramArgDef.prototype.m_isParameter = false;
oFF.ProgramArgDef.prototype.m_isMandatory = false;
oFF.ProgramArgDef.prototype.m_possibleValues = null;
oFF.ProgramArgDef.prototype.m_valueType = null;
oFF.ProgramArgDef.prototype.isParameter = function()
{
	return this.m_isParameter;
};
oFF.ProgramArgDef.prototype.getPossibleValues = function()
{
	return this.m_possibleValues;
};
oFF.ProgramArgDef.prototype.setValues = function(values)
{
	this.m_possibleValues = values;
};
oFF.ProgramArgDef.prototype.getValueType = function()
{
	return this.m_valueType;
};
oFF.ProgramArgDef.prototype.setValueType = function(valueType)
{
	this.m_valueType = valueType;
};
oFF.ProgramArgDef.prototype.isMandatory = function()
{
	return this.m_isMandatory;
};

oFF.ProgramArgumentType = function() {};
oFF.ProgramArgumentType.prototype = new oFF.XConstant();
oFF.ProgramArgumentType.prototype._ff_c = "ProgramArgumentType";

oFF.ProgramArgumentType.STRING = null;
oFF.ProgramArgumentType.BOOLEAN = null;
oFF.ProgramArgumentType.INTEGER = null;
oFF.ProgramArgumentType.s_lookup = null;
oFF.ProgramArgumentType.staticSetup = function()
{
	oFF.ProgramArgumentType.s_lookup = oFF.XHashMapByString.create();
	oFF.ProgramArgumentType.STRING = oFF.ProgramArgumentType.createNewType("String");
	oFF.ProgramArgumentType.BOOLEAN = oFF.ProgramArgumentType.createNewType("Boolean");
	oFF.ProgramArgumentType.INTEGER = oFF.ProgramArgumentType.createNewType("Integer");
};
oFF.ProgramArgumentType.lookup = function(name)
{
	var nameLower = oFF.XString.toLowerCase(name);
	return oFF.ProgramArgumentType.s_lookup.getByKey(nameLower);
};
oFF.ProgramArgumentType.createNewType = function(name)
{
	if (oFF.XStringUtils.isNullOrEmpty(name))
	{
		throw oFF.XException.createIllegalArgumentException("Missing name, you cannot create a program argument type without a name!");
	}
	if (oFF.ProgramArgumentType.lookup(name) !== null)
	{
		throw oFF.XException.createIllegalArgumentException("A program argument type with the specified name already exists!");
	}
	var newType = oFF.XConstant.setupName(new oFF.ProgramArgumentType(), name);
	oFF.ProgramArgumentType.s_lookup.put(oFF.XString.toLowerCase(name), newType);
	return newType;
};

oFF.ProgramManifest = function() {};
oFF.ProgramManifest.prototype = new oFF.ResourceDef();
oFF.ProgramManifest.prototype._ff_c = "ProgramManifest";

oFF.ProgramManifest.createManifest = function(name, factory)
{
	var newObj = new oFF.ProgramManifest();
	newObj.setupManifest(name, null, oFF.ProgramContainerType.NONE, null, name, name, factory);
	return newObj;
};
oFF.ProgramManifest.createByJsonString = function(name, json)
{
	var newObj = new oFF.ProgramManifest();
	newObj.setupManifest(name, null, oFF.ProgramContainerType.NONE, null, null, null, null);
	newObj.setJsonString(json);
	return newObj;
};
oFF.ProgramManifest.createByJsonStructure = function(jsonStruct)
{
	var newObj = new oFF.ProgramManifest();
	if (oFF.notNull(jsonStruct) && jsonStruct.isStructure())
	{
		var name = jsonStruct.getStringByKey(oFF.ProgramManifestConstants.NAME_KEY);
		newObj.setupManifest(name, null, oFF.ProgramContainerType.NONE, null, null, null, null);
		var tmpSerializer = oFF.PrSerializerFactory.newSerializer(false, false, 0);
		var stringifiedLayoutData = tmpSerializer.serialize(jsonStruct);
		newObj.setJsonString(stringifiedLayoutData);
		oFF.XObjectExt.release(tmpSerializer);
		return newObj;
	}
	return null;
};
oFF.ProgramManifest.createByClazzName = function(name, clazzName, modules)
{
	var newObj = new oFF.ProgramManifest();
	newObj.setupManifest(name, clazzName, oFF.ProgramContainerType.NONE, modules, name, name, null);
	return newObj;
};
oFF.ProgramManifest.createExt = function(name, clazzName, device, modules, displayName, description)
{
	var newObj = new oFF.ProgramManifest();
	newObj.setupManifest(name, clazzName, device, modules, displayName, description, null);
	return newObj;
};
oFF.ProgramManifest.prototype.m_factory = null;
oFF.ProgramManifest.prototype.m_processType = null;
oFF.ProgramManifest.prototype.m_displayName = null;
oFF.ProgramManifest.prototype.m_description = null;
oFF.ProgramManifest.prototype.m_ref = null;
oFF.ProgramManifest.prototype.m_refManifest = null;
oFF.ProgramManifest.prototype.m_author = null;
oFF.ProgramManifest.prototype.m_iconPath = null;
oFF.ProgramManifest.prototype.m_containerType = null;
oFF.ProgramManifest.prototype.m_subSystems = null;
oFF.ProgramManifest.prototype.m_initialContainerCssWidth = null;
oFF.ProgramManifest.prototype.m_initialContainerCssHeight = null;
oFF.ProgramManifest.prototype.m_initialContainerCssPosX = null;
oFF.ProgramManifest.prototype.m_initialContainerCssPosY = null;
oFF.ProgramManifest.prototype.m_initialTitle = null;
oFF.ProgramManifest.prototype.m_isInitiallyContainerMaximized = false;
oFF.ProgramManifest.prototype.m_isAvailableInAppStore = false;
oFF.ProgramManifest.prototype.m_isInitiallyVisibleOnLaunchpad = false;
oFF.ProgramManifest.prototype.m_category = null;
oFF.ProgramManifest.prototype.m_programArguments = null;
oFF.ProgramManifest.prototype.m_startArgsStructure = null;
oFF.ProgramManifest.prototype.m_jsonString = null;
oFF.ProgramManifest.prototype.m_isJsonParsed = false;
oFF.ProgramManifest.prototype.setupManifest = function(name, clazzName, containerType, modules, displayName, description, factory)
{
	this.setupResourceDef(name, oFF.ResourceType.PROGRAM, null, null, false, null, null, null, clazzName);
	this.m_factory = factory;
	this.m_description = description;
	this.m_containerType = containerType;
	if (oFF.isNull(this.m_containerType))
	{
		this.m_containerType = oFF.ProgramContainerType.NONE;
	}
	this.m_displayName = displayName;
	this.m_subSystems = oFF.XListOfString.create();
	this.m_initialContainerCssWidth = null;
	this.m_initialContainerCssHeight = null;
	this.m_initialContainerCssPosX = null;
	this.m_initialContainerCssPosY = null;
	this.m_initialTitle = null;
	this.m_isInitiallyContainerMaximized = false;
	this.m_isInitiallyVisibleOnLaunchpad = false;
	this.m_isAvailableInAppStore = false;
	this.m_category = oFF.ProgramCategory.GENERIC;
	this.m_processType = oFF.ProcessType.PROGRAM;
	this.m_programArguments = oFF.XHashMapByString.create();
	this.m_programArguments.put(oFF.ProgramArgument.FILE.getName(), oFF.ProgramArgument.FILE);
	this.m_startArgsStructure = oFF.PrFactory.createStructure();
};
oFF.ProgramManifest.prototype.releaseObject = function()
{
	this.m_author = null;
	this.m_description = null;
	this.m_iconPath = null;
	this.m_initialContainerCssWidth = null;
	this.m_initialContainerCssHeight = null;
	this.m_initialContainerCssPosX = null;
	this.m_initialContainerCssPosY = null;
	this.m_initialTitle = null;
	this.m_programArguments = oFF.XObjectExt.release(this.m_programArguments);
	oFF.ResourceDef.prototype.releaseObject.call( this );
};
oFF.ProgramManifest.prototype.getFactory = function()
{
	this.checkJson();
	if (oFF.isNull(this.m_factory))
	{
		if (oFF.notNull(this.m_refManifest))
		{
			this.setFactory(this.m_refManifest.getFactory());
		}
		if (oFF.isNull(this.m_factory))
		{
			var xClazzCompatibleName = this.getInitClazzNameCompatible();
			if (oFF.XStringUtils.isNotNullAndNotEmpty(xClazzCompatibleName))
			{
				var clazz = oFF.XClass.createByName(xClazzCompatibleName);
				if (oFF.notNull(clazz))
				{
					var newInstance = clazz.newInstance(this);
					this.m_factory = newInstance;
				}
				else
				{
					throw oFF.XException.createIllegalStateException(oFF.XStringUtils.concatenate2("Class cannot be resolved: ", xClazzCompatibleName));
				}
			}
		}
	}
	return this.m_factory;
};
oFF.ProgramManifest.prototype.setFactory = function(factory)
{
	this.m_factory = factory;
};
oFF.ProgramManifest.prototype.getText = function()
{
	this.checkJson();
	return this.m_description;
};
oFF.ProgramManifest.prototype.setText = function(text)
{
	this.m_description = text;
};
oFF.ProgramManifest.prototype.getProgramName = function()
{
	return this.getName();
};
oFF.ProgramManifest.prototype.getDescription = function()
{
	this.checkJson();
	return this.getText();
};
oFF.ProgramManifest.prototype.setDescription = function(description)
{
	this.setText(description);
};
oFF.ProgramManifest.prototype.getDisplayName = function()
{
	this.checkJson();
	return this.m_displayName;
};
oFF.ProgramManifest.prototype.setDisplayName = function(displayName)
{
	this.m_displayName = displayName;
};
oFF.ProgramManifest.prototype.getAuthor = function()
{
	this.checkJson();
	return this.m_author;
};
oFF.ProgramManifest.prototype.setAuthor = function(author)
{
	this.m_author = author;
};
oFF.ProgramManifest.prototype.getIconPath = function()
{
	this.checkJson();
	return this.m_iconPath;
};
oFF.ProgramManifest.prototype.setIconPath = function(iconPath)
{
	this.m_iconPath = iconPath;
};
oFF.ProgramManifest.prototype.getResolvedIconPath = function(session)
{
	var iconPath = null;
	if (oFF.notNull(session) && oFF.XStringUtils.isNotNullAndNotEmpty(this.getIconPath()))
	{
		iconPath = session.resolvePath(this.getIconPath());
	}
	return iconPath;
};
oFF.ProgramManifest.prototype.getCategory = function()
{
	this.checkJson();
	return this.m_category;
};
oFF.ProgramManifest.prototype.setCategory = function(category)
{
	this.m_category = category;
};
oFF.ProgramManifest.prototype.isInitiallyVisibleOnLaunchpad = function()
{
	this.checkJson();
	return this.m_isInitiallyVisibleOnLaunchpad;
};
oFF.ProgramManifest.prototype.setIsInitiallyVisibleOnLaunchpad = function(isInitiallyVisibleOnLaunchpad)
{
	this.m_isInitiallyVisibleOnLaunchpad = isInitiallyVisibleOnLaunchpad;
};
oFF.ProgramManifest.prototype.getOutputContainerType = function()
{
	this.checkJson();
	return this.m_containerType;
};
oFF.ProgramManifest.prototype.setOutputContainerType = function(containerType)
{
	this.m_containerType = containerType;
};
oFF.ProgramManifest.prototype.getInitialContainerCssWidth = function()
{
	this.checkJson();
	return this.m_initialContainerCssWidth;
};
oFF.ProgramManifest.prototype.setInitialContainerCssWidth = function(cssWidth)
{
	this.m_initialContainerCssWidth = cssWidth;
};
oFF.ProgramManifest.prototype.getInitialContainerCssHeight = function()
{
	this.checkJson();
	return this.m_initialContainerCssHeight;
};
oFF.ProgramManifest.prototype.setInitialContainerCssHeight = function(cssHeight)
{
	this.m_initialContainerCssHeight = cssHeight;
};
oFF.ProgramManifest.prototype.getInitialContainerCssPosX = function()
{
	this.checkJson();
	return this.m_initialContainerCssPosX;
};
oFF.ProgramManifest.prototype.setInitialContainerCssPosX = function(cssPosX)
{
	this.m_initialContainerCssPosX = cssPosX;
};
oFF.ProgramManifest.prototype.getInitialContainerCssPosY = function()
{
	this.checkJson();
	return this.m_initialContainerCssPosY;
};
oFF.ProgramManifest.prototype.setInitialContainerCssPosY = function(cssPosY)
{
	this.m_initialContainerCssPosY = cssPosY;
};
oFF.ProgramManifest.prototype.isInitiallyContainerMaximized = function()
{
	this.checkJson();
	return this.m_isInitiallyContainerMaximized;
};
oFF.ProgramManifest.prototype.setIsInitiallyContainerMaximized = function(isInitiallyContainerMaximized)
{
	this.m_isInitiallyContainerMaximized = isInitiallyContainerMaximized;
};
oFF.ProgramManifest.prototype.getProgramArguments = function()
{
	this.checkJson();
	return this.m_programArguments.getValuesAsReadOnlyList();
};
oFF.ProgramManifest.prototype.getStartArgumentsStructure = function()
{
	this.checkJson();
	return this.m_startArgsStructure;
};
oFF.ProgramManifest.prototype.getProcessType = function()
{
	return this.m_processType;
};
oFF.ProgramManifest.prototype.setProcessType = function(type)
{
	this.m_processType = type;
};
oFF.ProgramManifest.prototype.isAvailableInAppStore = function()
{
	this.checkJson();
	return this.m_isAvailableInAppStore;
};
oFF.ProgramManifest.prototype.setIsAvailableInAppStore = function(isVisibleInAppStore)
{
	this.m_isAvailableInAppStore = isVisibleInAppStore;
};
oFF.ProgramManifest.prototype.getSubSystems = function()
{
	this.checkJson();
	return this.m_subSystems;
};
oFF.ProgramManifest.prototype.setSubSystems = function(subSystems)
{
	this.m_subSystems.clear();
	this.m_subSystems.addAll(subSystems);
};
oFF.ProgramManifest.prototype.getInitialTitle = function()
{
	this.checkJson();
	return this.m_initialTitle;
};
oFF.ProgramManifest.prototype.setInitialTitle = function(initialContainerTitle)
{
	this.m_initialTitle = initialContainerTitle;
};
oFF.ProgramManifest.prototype.setJsonString = function(jsonString)
{
	this.m_jsonString = jsonString;
	this.m_isJsonParsed = false;
};
oFF.ProgramManifest.prototype.getDefaultIconPath = function()
{
	var defaultIconPath = this.getIconPath();
	if (oFF.XStringUtils.isNullOrEmpty(this.m_iconPath))
	{
		if (this.getOutputContainerType() === oFF.ProgramContainerType.WINDOW)
		{
			defaultIconPath = "${ff_mimes}/images/programicons/defaultWindowPrg.png";
		}
		else if (this.getOutputContainerType() === oFF.ProgramContainerType.CONSOLE)
		{
			defaultIconPath = "${ff_mimes}/images/programicons/defaultTerminalPrg.png";
		}
	}
	return defaultIconPath;
};
oFF.ProgramManifest.prototype.parseArgumentMetadata = function(argumentMetadataStruct)
{
	if (oFF.notNull(argumentMetadataStruct) && argumentMetadataStruct.isStructure())
	{
		var argumentNamesList = argumentMetadataStruct.getKeysAsReadOnlyListOfString();
		oFF.XCollectionUtils.forEachString(argumentNamesList,  function(argumentName){
			if (!this.m_programArguments.containsKey(argumentName))
			{
				var newPrgArgument = oFF.ProgramArgument.createByStructure(argumentName, argumentMetadataStruct.getStructureByKey(argumentName));
				if (oFF.notNull(newPrgArgument))
				{
					this.m_programArguments.put(argumentName, newPrgArgument);
				}
			}
			else
			{
				this.log3("Argument with name ", argumentName, " already exists on this program manifest");
			}
		}.bind(this));
	}
};
oFF.ProgramManifest.prototype.checkJson = function()
{
	oFF.ResourceDef.prototype.checkJson.call( this );
	if (oFF.notNull(this.m_jsonString) && this.m_isJsonParsed === false)
	{
		this.m_isJsonParsed = true;
		var document = oFF.JsonParserFactory.createFromString(this.m_jsonString);
		if (oFF.notNull(document) && document.isStructure())
		{
			var jsonStructure = document.asStructure();
			var clazzName = jsonStructure.getStringByKey(oFF.ProgramManifestConstants.CLASS_KEY);
			if (oFF.notNull(clazzName))
			{
				this.setClazzName(clazzName);
			}
			this.m_ref = jsonStructure.getStringByKey(oFF.ProgramManifestConstants.REF_KEY);
			this.deployDefaults();
			var modules = jsonStructure.getListByKey(oFF.ProgramManifestConstants.MODULES_KEY);
			if (oFF.notNull(modules))
			{
				for (var i = 0; i < modules.size(); i++)
				{
					var moduleName = modules.getStringAt(i);
					var entity = oFF.ResourceDef.create(moduleName, oFF.ResourceType.MODULE, null, null, false, null, null, null, null);
					this.addDependency(entity);
				}
			}
			var containerType = jsonStructure.getStringByKey(oFF.ProgramManifestConstants.CONTAINER_KEY);
			if (oFF.notNull(containerType))
			{
				var programDevice = oFF.ProgramContainerType.lookup(containerType);
				if (oFF.notNull(programDevice))
				{
					this.setOutputContainerType(programDevice);
				}
			}
			var profiles = jsonStructure.getListByKey(oFF.ProgramManifestConstants.PROFILES_KEY);
			if (oFF.notNull(profiles))
			{
				for (var j = 0; j < profiles.size(); j++)
				{
					var profileName = profiles.getStringAt(j);
					this.addProfile(profileName);
				}
			}
			var type = jsonStructure.getStringByKey(oFF.ProgramManifestConstants.TYPE_KEY);
			if (oFF.notNull(type))
			{
				var processType = oFF.ProcessType.lookup(type);
				if (oFF.notNull(processType))
				{
					this.setProcessType(processType);
				}
			}
			var displayName = jsonStructure.getStringByKeyExt(oFF.ProgramManifestConstants.DISPLAY_NAME_KEY, this.getDisplayName());
			displayName = oFF.XStringUtils.isNullOrEmpty(displayName) ? this.getProgramName() : displayName;
			this.setDisplayName(displayName);
			var author = jsonStructure.getStringByKeyExt(oFF.ProgramManifestConstants.AUTHOR_KEY, this.getAuthor());
			this.setAuthor(author);
			var description = jsonStructure.getStringByKeyExt(oFF.ProgramManifestConstants.DESCRIPTION_KEY, this.getDescription());
			this.setDescription(description);
			var iconPath = jsonStructure.getStringByKeyExt(oFF.ProgramManifestConstants.ICON_KEY, this.getDefaultIconPath());
			this.setIconPath(iconPath);
			var categoryStr = jsonStructure.getStringByKeyExt(oFF.ProgramManifestConstants.CATEGORY_KEY, null);
			if (oFF.notNull(categoryStr))
			{
				var category = oFF.ProgramCategory.lookupwithDefault(categoryStr, this.getCategory());
				if (oFF.notNull(category))
				{
					this.setCategory(category);
				}
			}
			var isAvailablenAppStore = jsonStructure.getBooleanByKeyExt(oFF.ProgramManifestConstants.APP_STORE_KEY, this.isAvailableInAppStore());
			this.setIsAvailableInAppStore(isAvailablenAppStore);
			var isInitiallyVisibleOnLaunchpad = jsonStructure.getBooleanByKeyExt(oFF.ProgramManifestConstants.INITIALLY_ON_LAUNCHPAD_KEY, this.isInitiallyVisibleOnLaunchpad());
			this.setIsInitiallyVisibleOnLaunchpad(isInitiallyVisibleOnLaunchpad);
			var initialTitle = jsonStructure.getStringByKeyExt(oFF.ProgramManifestConstants.INITIAL_TITLE_KEY, this.getInitialTitle());
			initialTitle = oFF.XStringUtils.isNullOrEmpty(initialTitle) ? displayName : initialTitle;
			this.setInitialTitle(initialTitle);
			var initialContainerFrame = jsonStructure.getStructureByKey(oFF.ProgramManifestConstants.INITIAL_CONTAINER_FRAME_KEY);
			if (oFF.notNull(initialContainerFrame))
			{
				var winX = initialContainerFrame.getStringByKey(oFF.ProgramManifestConstants.INITIAL_CONTAINER_FRAME_X_KEY);
				var winY = initialContainerFrame.getStringByKey(oFF.ProgramManifestConstants.INITIAL_CONTAINER_FRAME_Y_KEY);
				var winWidth = initialContainerFrame.getStringByKey(oFF.ProgramManifestConstants.INITIAL_CONTAINER_FRAME_WIDTH_KEY);
				var winHeight = initialContainerFrame.getStringByKey(oFF.ProgramManifestConstants.INITIAL_CONTAINER_FRAME_HEIGHT_KEY);
				this.setInitialContainerCssPosX(winX);
				this.setInitialContainerCssPosY(winY);
				this.setInitialContainerCssWidth(winWidth);
				this.setInitialContainerCssHeight(winHeight);
				var isMaximized = initialContainerFrame.getBooleanByKeyExt(oFF.ProgramManifestConstants.INITIAL_CONTAINER_FRAME_MAXIMIZED_KEY, this.isInitiallyContainerMaximized());
				this.setIsInitiallyContainerMaximized(isMaximized);
			}
			var argumentMetadataStruct = jsonStructure.getStructureByKey(oFF.ProgramManifestConstants.ARGUMENTS_KEY);
			if (oFF.notNull(argumentMetadataStruct))
			{
				this.parseArgumentMetadata(argumentMetadataStruct);
			}
			var startArgsStructure = jsonStructure.getStructureByKey(oFF.ProgramManifestConstants.START_ARGS_STRUCTURE_KEY);
			oFF.PrUtils.mergeStructures(this.m_startArgsStructure, startArgsStructure);
			var subSystems = jsonStructure.getListByKey(oFF.ProgramManifestConstants.SUB_SYSTEMS_KEY);
			if (oFF.notNull(subSystems))
			{
				for (var k = 0; k < subSystems.size(); k++)
				{
					var subSysName = subSystems.getStringAt(k);
					this.m_subSystems.add(subSysName);
				}
			}
		}
	}
	oFF.ResourceDef.prototype.checkJson.call( this );
};
oFF.ProgramManifest.prototype.deployDefaults = function()
{
	if (oFF.XStringUtils.isNotNullAndNotEmpty(this.m_ref))
	{
		this.m_refManifest = oFF.ProgramRegistration.getProgramManifest(this.m_ref);
		if (oFF.notNull(this.m_refManifest))
		{
			if (oFF.XStringUtils.isNullOrEmpty(this.getInitClazzNameOrigin()))
			{
				this.setClazzName(this.m_refManifest.getInitClazzNameOrigin());
			}
			this.addAllDependencies(this.m_refManifest.getAllDependencies());
			this.setOutputContainerType(this.m_refManifest.getOutputContainerType());
			this.setProcessType(this.m_refManifest.getProcessType());
			this.setDisplayName(this.m_refManifest.getDisplayName());
			this.setDescription(this.m_refManifest.getDescription());
			this.setAuthor(this.m_refManifest.getAuthor());
			this.setIconPath(this.m_refManifest.getIconPath());
			this.setInitialTitle(this.m_refManifest.getInitialTitle());
			this.setInitialContainerCssWidth(this.m_refManifest.getInitialContainerCssWidth());
			this.setInitialContainerCssHeight(this.m_refManifest.getInitialContainerCssHeight());
			this.setInitialContainerCssPosX(this.m_refManifest.getInitialContainerCssPosX());
			this.setInitialContainerCssPosY(this.m_refManifest.getInitialContainerCssPosY());
			this.setIsInitiallyContainerMaximized(this.m_refManifest.isInitiallyContainerMaximized());
			var parentStructure = this.m_refManifest.getStartArgumentsStructure();
			this.m_startArgsStructure = oFF.PrUtils.createDeepCopy(parentStructure);
			this.setSubSystems(this.m_refManifest.getSubSystems());
		}
	}
};

oFF.Process = function() {};
oFF.Process.prototype = new oFF.IoSession();
oFF.Process.prototype._ff_c = "Process";

oFF.Process.createExt = function(kernel, parent, type, environmentConfig, dateTimeProvider)
{
	var session = new oFF.Process();
	session.setupExt(kernel, parent, type, environmentConfig, dateTimeProvider);
	return session;
};
oFF.Process.prototype.m_kernel = null;
oFF.Process.prototype.m_type = null;
oFF.Process.prototype.m_selector = null;
oFF.Process.prototype.m_startConfiguration = null;
oFF.Process.prototype.m_processId = null;
oFF.Process.prototype.m_isSapStatisticsEnabled = false;
oFF.Process.prototype.m_nativeAnchorId = null;
oFF.Process.prototype.m_nativeAnchorObject = null;
oFF.Process.prototype.m_entities = null;
oFF.Process.prototype.m_applicationName = null;
oFF.Process.prototype.m_childProcesses = null;
oFF.Process.prototype.m_processEventListeners = null;
oFF.Process.prototype.m_fileSystemManager = null;
oFF.Process.prototype.m_localStorage = null;
oFF.Process.prototype.m_localNotificationCenter = null;
oFF.Process.prototype.m_userManager = null;
oFF.Process.prototype.m_description = null;
oFF.Process.prototype.setupExt = function(kernel, parent, type, environmentConfig, dateTimeProvider)
{
	this.setupIoSession(parent, environmentConfig, dateTimeProvider);
	if (oFF.isNull(parent))
	{
		this.m_userManager = oFF.UserManager.create(this);
	}
	else
	{
		this.m_userManager = parent.getUserManager();
	}
	this.m_fileSystemManager = oFF.XFileSystemManager.create(this);
	this.m_entities = oFF.XHashMapByString.create();
	this.m_childProcesses = oFF.XList.create();
	this.m_processEventListeners = oFF.XList.create();
	this.m_kernel = kernel;
	this.m_processId = kernel.newProcessId();
	this.m_type = type;
};
oFF.Process.prototype.releaseObject = function()
{
	this.m_fileSystemManager = null;
	this.m_kernel = null;
	this.m_selector = null;
	this.m_localStorage = oFF.XObjectExt.release(this.m_localStorage);
	this.m_localNotificationCenter = oFF.XObjectExt.release(this.m_localNotificationCenter);
	oFF.IoSession.prototype.releaseObject.call( this );
};
oFF.Process.prototype.isProcess = function()
{
	return true;
};
oFF.Process.prototype.getProcessType = function()
{
	return this.m_type;
};
oFF.Process.prototype.getKernel = function()
{
	return this.m_kernel;
};
oFF.Process.prototype.getSelector = function()
{
	return this.getSelectorBase();
};
oFF.Process.prototype.getSelectorBase = function()
{
	if (oFF.isNull(this.m_selector))
	{
		this.m_selector = oFF.SigSelManager.create(this);
		this.m_selector.registerSelector(oFF.SigSelDomain.SUBSYSTEM, this);
		this.m_selector.registerSelector(oFF.SigSelDomain.ENVVARS, this);
		var uiManager = this.getUiManager();
		if (oFF.notNull(uiManager) && uiManager.getSigSelProviderSelector() !== null)
		{
			this.m_selector.registerSelector(oFF.SigSelDomain.UI, uiManager.getSigSelProviderSelector());
			this.m_selector.registerSelector(oFF.SigSelDomain.DIALOG, uiManager.getSigSelProviderSelector());
		}
		var parent = this.getParentProcess();
		if (oFF.notNull(parent))
		{
			var parentSelector = parent.getSelector();
			var allDomains = parentSelector.getRegisteredDomain();
			for (var k = 0; k < allDomains.size(); k++)
			{
				var currentDomain = allDomains.get(k);
				var currentSelector = parentSelector.getSelector(currentDomain);
				this.m_selector.registerSelector(currentDomain, currentSelector);
			}
		}
	}
	return this.m_selector;
};
oFF.Process.prototype.getProcessId = function()
{
	return this.m_processId;
};
oFF.Process.prototype.selectProviderComponents = function(operation, defaultDomain, contextObject, maximumCount)
{
	var list = oFF.XList.create();
	var domain = operation.getDomain();
	var name = operation.getName();
	if (domain === oFF.SigSelDomain.SUBSYSTEM)
	{
		var subSystemType = oFF.SubSystemType.lookup(name);
		var subSystem = this.getSubSystem(subSystemType);
		if (oFF.notNull(subSystem))
		{
			list.add(subSystem);
		}
	}
	else if (domain === oFF.SigSelDomain.ENVVARS)
	{
		var variable = this.getEnvironment().getStringByKey(name);
		if (oFF.notNull(variable))
		{
			var variableObj = oFF.XStringValue.create(variable);
			list.add(variableObj);
		}
	}
	return list;
};
oFF.Process.prototype.setSapStatisticsEnabled = function(enabled)
{
	this.m_isSapStatisticsEnabled = enabled;
};
oFF.Process.prototype.isSapStatisticsEnabled = function()
{
	return this.m_isSapStatisticsEnabled;
};
oFF.Process.prototype.getNativeAnchorId = function()
{
	return this.m_nativeAnchorId;
};
oFF.Process.prototype.getNativeAnchorObject = function()
{
	return this.m_nativeAnchorObject;
};
oFF.Process.prototype.setNativeAnchorId = function(nativeAnchorId)
{
	this.m_nativeAnchorId = nativeAnchorId;
};
oFF.Process.prototype.setNativeAnchorObject = function(nativeAnchorObject)
{
	this.m_nativeAnchorObject = nativeAnchorObject;
};
oFF.Process.prototype.getUiManager = function()
{
	var uiManager = this.getSubSystemExt(oFF.SubSystemType.GUI, oFF.ProcessEntity.GUI);
	return uiManager;
};
oFF.Process.prototype.getApplication = function()
{
	return this.getEntity(oFF.ProcessEntity.APPLICATION);
};
oFF.Process.prototype.getUserManager = function()
{
	return this.m_userManager;
};
oFF.Process.prototype.getUserProfile = function()
{
	var userProfile = this.getSubSystem(oFF.SubSystemType.USER_PROFILE);
	return userProfile;
};
oFF.Process.prototype.getCredentialsProvider = function()
{
	var credentialsProvider = this.getSubSystemExt(oFF.SubSystemType.CREDENTIALS_PROVIDER, oFF.ProcessEntity.CREDENTIALS_PROVIDER);
	return credentialsProvider;
};
oFF.Process.prototype.getDataProviderPool = function()
{
	var dataProviderPool = this.getSubSystemExt(oFF.SubSystemType.DATA_PROVIDER_POOL, oFF.ProcessEntity.DATA_PROVIDER_POOL);
	return dataProviderPool;
};
oFF.Process.prototype.getSystemCache = function(systemName)
{
	var systemCache = null;
	var cacheManager = this.getSubSystem(oFF.SubSystemType.CACHE);
	if (oFF.notNull(cacheManager))
	{
		systemCache = cacheManager.getSystemCache(systemName);
	}
	return systemCache;
};
oFF.Process.prototype.getCacheProvider = function()
{
	var cacheProvider = null;
	var cacheManager = this.getCacheManager();
	if (oFF.notNull(cacheManager))
	{
		cacheProvider = cacheManager.getCacheProvider();
	}
	return cacheProvider;
};
oFF.Process.prototype.getCacheManager = function()
{
	var cacheManager = this.getSubSystem(oFF.SubSystemType.CACHE);
	return cacheManager;
};
oFF.Process.prototype.getLocalStorage = function()
{
	if (oFF.isNull(this.m_localStorage))
	{
		this.m_localStorage = oFF.LocalStorageWithPrefix.create(this);
	}
	return this.m_localStorage;
};
oFF.Process.prototype.getLocalNotificationCenter = function()
{
	if (this.getProcessType() === oFF.ProcessType.PLUGIN && this.getParentProcess() !== null)
	{
		return this.getParentProcess().getLocalNotificationCenter();
	}
	if (oFF.isNull(this.m_localNotificationCenter))
	{
		this.m_localNotificationCenter = oFF.XNotificationCenter.create();
	}
	return this.m_localNotificationCenter;
};
oFF.Process.prototype.getConnectionPool = function()
{
	return this.getEntity(oFF.ProcessEntity.CONNECTION_POOL);
};
oFF.Process.prototype.getSystemLandscape = function()
{
	var systemLandscape = this.getSubSystemExt(oFF.SubSystemType.SYSTEM_LANDSCAPE, oFF.ProcessEntity.SYSTEM_LANDSCAPE);
	return systemLandscape;
};
oFF.Process.prototype.openSubSystem = function(type)
{
	var subSystem;
	var kernel = this.getKernel();
	subSystem = kernel.getSubSystemContainer(type).open();
	return subSystem;
};
oFF.Process.prototype.getSubSystemExt = function(type, entityType)
{
	var subSys = null;
	if (oFF.notNull(entityType))
	{
		subSys = this.getEntity(entityType);
	}
	if (oFF.isNull(subSys))
	{
		subSys = this.getSubSystem(type);
	}
	return subSys;
};
oFF.Process.prototype.getSubSystem = function(type)
{
	var subSystemContainer = this.m_kernel.getSubSystemContainer(type);
	var mainApi = subSystemContainer.getMainApi();
	return mainApi;
};
oFF.Process.prototype.getApplicationName = function()
{
	return this.m_applicationName;
};
oFF.Process.prototype.setApplicationName = function(name)
{
	this.m_applicationName = name;
};
oFF.Process.prototype.newSubSession = function()
{
	return this.newChildProcess(this.m_type);
};
oFF.Process.prototype.newChildProcess = function(type)
{
	var process = oFF.Process.createExt(this.m_kernel, this, type, null, this.getDateTimeProvider());
	this.m_childProcesses.add(process);
	return process;
};
oFF.Process.prototype.getChildProcesses = function()
{
	for (var i = 0; i < this.m_childProcesses.size(); )
	{
		var process = this.m_childProcesses.get(i);
		if (process.isReleased())
		{
			this.m_childProcesses.removeAt(i);
		}
		else
		{
			i++;
		}
	}
	return this.m_childProcesses;
};
oFF.Process.prototype.attachExistingChildProcess = function(child)
{
	this.m_childProcesses.add(child);
	child.setParentSession(this);
};
oFF.Process.prototype.removeChild = function(child)
{
	this.m_childProcesses.removeElement(child);
};
oFF.Process.prototype.getParentProcess = function()
{
	return this.getParentSession();
};
oFF.Process.prototype.getProgramCfg = function()
{
	return this.m_startConfiguration;
};
oFF.Process.prototype.setStartConfiguration = function(startCfg)
{
	this.m_startConfiguration = startCfg;
};
oFF.Process.prototype.getChildProcessById = function(processId)
{
	return null;
};
oFF.Process.prototype.getEntity = function(name)
{
	return this.m_entities.getByKey(name);
};
oFF.Process.prototype.setEntity = function(name, entity)
{
	this.m_entities.put(name, entity);
};
oFF.Process.prototype.registerOnEvent = function(listener)
{
	this.unregisterOnEvent(listener);
	this.m_processEventListeners.add(listener);
};
oFF.Process.prototype.unregisterOnEvent = function(listener)
{
	for (var i = 0; i < this.m_processEventListeners.size(); )
	{
		var currentListener = this.m_processEventListeners.get(i);
		if (currentListener === listener)
		{
			this.m_processEventListeners.removeAt(i);
		}
		else
		{
			i++;
		}
	}
};
oFF.Process.prototype.getAllProcessEventListeners = function()
{
	return this.m_processEventListeners;
};
oFF.Process.prototype.notifyProcessEvent = function(type)
{
	var event = oFF.ProcessEvent.create(this, this.m_processId, type, null);
	this.notifyProcessEventExt(event);
};
oFF.Process.prototype.notifyProcessEventExt = function(event)
{
	for (var i = 0; i < this.m_processEventListeners.size(); i++)
	{
		var listener = this.m_processEventListeners.get(i);
		listener.onProcessEvent(event, this, event.getEventType());
	}
};
oFF.Process.prototype.addToListenerQueue = function(syncAction)
{
	var kernel = this.getKernel();
	return kernel.addToListenerQueue(syncAction);
};
oFF.Process.prototype.isWindowBasedUiProgram = function()
{
	var isWindowBased = false;
	var processType = this.getProcessType();
	if (processType === oFF.ProcessType.PROGRAM)
	{
		var startCfg = this.getProgramCfg();
		if (oFF.notNull(startCfg))
		{
			var programContainer = startCfg.getProgramContainer();
			isWindowBased = programContainer.isUiContainer() && programContainer.isFloatingContainer() && !programContainer.isModalContainer();
		}
	}
	return isWindowBased;
};
oFF.Process.prototype.getProgramContainer = function()
{
	var container = null;
	var tmpCfg = this.getProgramCfg();
	if (oFF.notNull(tmpCfg))
	{
		container = tmpCfg.getProgramContainer();
	}
	return container;
};
oFF.Process.prototype.getArguments = function()
{
	var prgArgs = null;
	var tmpCfg = this.getProgramCfg();
	if (oFF.notNull(tmpCfg))
	{
		prgArgs = tmpCfg.getArguments();
	}
	return prgArgs;
};
oFF.Process.prototype.newRootDirectoryFile = function()
{
	var uri = this.getRootDirectoryUri();
	var file = oFF.XFile.createByUri(this, uri);
	return file;
};
oFF.Process.prototype.newWorkingDirectoryFile = function()
{
	var uri = this.getWorkingDirectoryUri();
	var file = oFF.XFile.createByUri(this, uri);
	return file;
};
oFF.Process.prototype.getFileSystemManager = function()
{
	return this.m_fileSystemManager;
};
oFF.Process.prototype.getWorkingDirectoryProtocolType = function()
{
	return this.getFileSystemManager().getWorkingDirectoryProtocolType();
};
oFF.Process.prototype.getWorkingDirectoryUri = function()
{
	return this.getFileSystemManager().getWorkingDirectoryUri();
};
oFF.Process.prototype.getRootDirectoryUri = function()
{
	return this.getFileSystemManager().getRootDirectoryUri();
};
oFF.Process.prototype.getNativeSlash = function()
{
	return this.getFileSystemManager().getNativeSlash();
};
oFF.Process.prototype.setWorkingDirectoryUri = function(directory)
{
	this.getFileSystemManager().setWorkingDirectoryUri(directory);
};
oFF.Process.prototype.setDescription = function(description)
{
	this.m_description = description;
};
oFF.Process.prototype.getDescription = function()
{
	return this.m_description;
};
oFF.Process.prototype.toString = function()
{
	var buffer = oFF.XStringBuffer.create();
	var processType = this.getProcessType();
	buffer.append(processType.getName());
	var startConfiguration = this.getProgramCfg();
	if (oFF.notNull(startConfiguration))
	{
		buffer.append(" - ");
		buffer.append(startConfiguration.getName());
		var prgArgs = startConfiguration.getArguments();
		if (oFF.notNull(prgArgs))
		{
			var argumentString = prgArgs.getArgumentString();
			buffer.append(" ");
			buffer.append(argumentString);
		}
	}
	if (oFF.XStringUtils.isNotNullAndNotEmpty(this.getDescription()))
	{
		buffer.append(" - ");
		buffer.append(this.getDescription());
	}
	return buffer.toString();
};

oFF.ProcessEvent = function() {};
oFF.ProcessEvent.prototype = new oFF.MessageManager();
oFF.ProcessEvent.prototype._ff_c = "ProcessEvent";

oFF.ProcessEvent.create = function(process, processId, type, contextObject)
{
	var newObj = new oFF.ProcessEvent();
	newObj.setupSessionContext(process);
	newObj.m_type = type;
	if (oFF.notNull(processId))
	{
		newObj.m_id = processId;
	}
	else if (oFF.notNull(process))
	{
		newObj.m_id = process.getProcessId();
	}
	newObj.m_context = contextObject;
	return newObj;
};
oFF.ProcessEvent.prototype.m_type = null;
oFF.ProcessEvent.prototype.m_id = null;
oFF.ProcessEvent.prototype.m_context = null;
oFF.ProcessEvent.prototype.getEventType = function()
{
	return this.m_type;
};
oFF.ProcessEvent.prototype.getEventObject = function()
{
	return this.m_context;
};
oFF.ProcessEvent.prototype.getProcessId = function()
{
	return this.m_id;
};
oFF.ProcessEvent.prototype.getProcess = function()
{
	return this.getSession();
};

oFF.DfProgramSubSys = function() {};
oFF.DfProgramSubSys.prototype = new oFF.DfProgram();
oFF.DfProgramSubSys.prototype._ff_c = "DfProgramSubSys";

oFF.DfProgramSubSys.prototype.setup = function()
{
	oFF.DfProgram.prototype.setup.call( this );
};
oFF.DfProgramSubSys.prototype.getSubSystemSelector = function()
{
	return null;
};
oFF.DfProgramSubSys.prototype.getLogLayer = function()
{
	return oFF.OriginLayer.SUBSYSTEM;
};
oFF.DfProgramSubSys.prototype.activateSubSystem = function(messages, status)
{
	var process = this.getProcess();
	process.setEntity(oFF.ProcessEntity.SUB_SYSTEM, this);
	var subSystemContainer = this.getSubSystemContainer();
	subSystemContainer.setSubSystem(this);
	var theEvent = oFF.ProcessEvent.create(process, null, oFF.ProcessEventType.ACTIVE, this);
	if (oFF.notNull(messages))
	{
		theEvent.addAllMessages(messages);
	}
	process.notifyProcessEventExt(theEvent);
	this.log3("Activating of subsystem [", this.getSubSystemFullName(), "] done ");
	var kernel = this.getProcess().getKernel();
	kernel.evaluteRemainingVfsMountings();
};
oFF.DfProgramSubSys.prototype.getSubSystemFullName = function()
{
	var subSystemFullName = this.getSubSystemType().getName();
	var selector = this.getSubSystemSelector();
	if (oFF.notNull(selector))
	{
		subSystemFullName = oFF.XStringUtils.concatenate3(subSystemFullName, ".", selector);
	}
	return subSystemFullName;
};
oFF.DfProgramSubSys.prototype.getAdminApi = function()
{
	return this.getMainApi();
};
oFF.DfProgramSubSys.prototype.getSubSystemContainer = function()
{
	var process = this.getProcess();
	var kernel = process.getKernel();
	var subSystemContainer = kernel.getSubSystemContainer(this.getSubSystemType());
	return subSystemContainer;
};

oFF.SubSystemContainer = function() {};
oFF.SubSystemContainer.prototype = new oFF.MessageManager();
oFF.SubSystemContainer.prototype._ff_c = "SubSystemContainer";

oFF.SubSystemContainer.create = function(kernel, type, selectorName)
{
	var newObj = new oFF.SubSystemContainer();
	newObj.setupExt(kernel, type, selectorName);
	return newObj;
};
oFF.SubSystemContainer.prototype.m_kernel = null;
oFF.SubSystemContainer.prototype.m_type = null;
oFF.SubSystemContainer.prototype.m_selectorName = null;
oFF.SubSystemContainer.prototype.m_status = null;
oFF.SubSystemContainer.prototype.m_bootstrapSubSystem = null;
oFF.SubSystemContainer.prototype.m_subSystem = null;
oFF.SubSystemContainer.prototype.m_loadAction = null;
oFF.SubSystemContainer.prototype.setupExt = function(kernel, type, selectorName)
{
	this.setupSessionContext(kernel.getKernelProcess());
	this.m_status = oFF.SubSystemStatus.INITIAL;
	this.m_kernel = kernel;
	this.m_type = type;
	this.m_selectorName = selectorName;
	this.initBootstrap();
};
oFF.SubSystemContainer.prototype.getSubSystemType = function()
{
	return this.m_type;
};
oFF.SubSystemContainer.prototype.getStatus = function()
{
	return this.m_status;
};
oFF.SubSystemContainer.prototype.getSubSystem = function()
{
	return this.m_subSystem;
};
oFF.SubSystemContainer.prototype.getMainApi = function()
{
	var retObj = oFF.notNull(this.m_subSystem) ? this.m_subSystem.getMainApi() : null;
	return retObj;
};
oFF.SubSystemContainer.prototype.getAdminApi = function()
{
	var retObj = oFF.notNull(this.m_subSystem) ? this.m_subSystem.getAdminApi() : null;
	return retObj;
};
oFF.SubSystemContainer.prototype.setSubSystem = function(subSystem)
{
	this.m_subSystem = subSystem;
	this.m_status = oFF.SubSystemStatus.ACTIVE;
};
oFF.SubSystemContainer.prototype.processSubSystemLoad = function(syncType, listener, customIdentifier)
{
	if (oFF.isNull(this.m_loadAction))
	{
		this.m_loadAction = oFF.SubSystemLoadAction.createAndRun(syncType, listener, customIdentifier, this);
	}
	else
	{
		this.m_loadAction.attachListener(listener, oFF.ListenerType.SPECIFIC, customIdentifier);
	}
	return this.m_loadAction;
};
oFF.SubSystemContainer.prototype.open = function()
{
	if (oFF.isNull(this.m_subSystem))
	{
		this.m_subSystem = oFF.SubSystemFactory.create(this.m_type, this.m_kernel.getKernelProcess());
	}
	return this.m_subSystem;
};
oFF.SubSystemContainer.prototype.initBootstrap = function()
{
	if (oFF.isNull(this.m_bootstrapSubSystem) && (this.m_type === oFF.SubSystemType.USER_PROFILE || this.m_type === oFF.SubSystemType.CREDENTIALS_PROVIDER))
	{
		this.m_bootstrapSubSystem = oFF.SubSystemFactory.create(this.m_type, this.m_kernel.getKernelProcess());
		if (oFF.notNull(this.m_bootstrapSubSystem))
		{
			this.m_status = oFF.SubSystemStatus.BOOTSTRAP;
			this.m_subSystem = this.m_bootstrapSubSystem;
		}
	}
};
oFF.SubSystemContainer.prototype.getMessageCollection = function()
{
	return this;
};
oFF.SubSystemContainer.prototype.getBootstrapSubSystem = function()
{
	return this.m_bootstrapSubSystem;
};
oFF.SubSystemContainer.prototype.getKernel = function()
{
	return this.m_kernel;
};
oFF.SubSystemContainer.prototype.getSubSystemSelector = function()
{
	return this.m_selectorName;
};
oFF.SubSystemContainer.prototype.getSubSystemFullName = function()
{
	var subSystemFullName = this.getSubSystemType().getName();
	var selector = this.getSubSystemSelector();
	if (oFF.notNull(selector))
	{
		subSystemFullName = oFF.XStringUtils.concatenate3(subSystemFullName, ".", selector);
	}
	return subSystemFullName;
};

oFF.SubSysUserProfileBootstrap = function() {};
oFF.SubSysUserProfileBootstrap.prototype = new oFF.DfSubSystem();
oFF.SubSysUserProfileBootstrap.prototype._ff_c = "SubSysUserProfileBootstrap";

oFF.SubSysUserProfileBootstrap.create = function(process)
{
	var newObj = new oFF.SubSysUserProfileBootstrap();
	newObj.setupProcessContext(process);
	return newObj;
};
oFF.SubSysUserProfileBootstrap.prototype.m_userProfile = null;
oFF.SubSysUserProfileBootstrap.prototype.setupProcessContext = function(process)
{
	oFF.DfSubSystem.prototype.setupProcessContext.call( this , process);
	this.m_userProfile = oFF.UserProfile.create();
	this.m_userProfile.setServiceApiLevel(oFF.ServiceApiLevel.BOOTSTRAP);
	this.m_userProfile.setSAPName("anonymous");
	this.m_userProfile.setFirstName("Unknown");
	this.m_userProfile.setLastName("Anonymous");
	this.m_userProfile.setLanguage("en");
	var environment = process.getEnvironment();
	var cacheSchema = environment.getStringByKey(oFF.XEnvironmentConstants.FIREFLY_CACHE_SCHEMA);
	if (oFF.XStringUtils.isNotNullAndNotEmpty(cacheSchema))
	{
		this.m_userProfile.setCacheSchema(cacheSchema);
	}
	this.m_userProfile.setUnixHomeDirectory("vfs:///");
};
oFF.SubSysUserProfileBootstrap.prototype.getSubSystemType = function()
{
	return oFF.SubSystemType.USER_PROFILE;
};
oFF.SubSysUserProfileBootstrap.prototype.getMainApi = function()
{
	return this.m_userProfile;
};
oFF.SubSysUserProfileBootstrap.prototype.getUserProfile = function()
{
	return this.m_userProfile;
};
oFF.SubSysUserProfileBootstrap.prototype.getBootstrapUserProfile = function()
{
	return this.m_userProfile;
};
oFF.SubSysUserProfileBootstrap.prototype.getReadOnlyUserProfile = function()
{
	return null;
};
oFF.SubSysUserProfileBootstrap.prototype.getPersonalizationUserProfile = function()
{
	return null;
};
oFF.SubSysUserProfileBootstrap.prototype.getServiceApiLevel = function()
{
	return oFF.ServiceApiLevel.BOOTSTRAP;
};
oFF.SubSysUserProfileBootstrap.prototype.canUserProfileSaved = function()
{
	return false;
};
oFF.SubSysUserProfileBootstrap.prototype.processUserProfileSave = oFF.noSupport;

oFF.UserProfile = function() {};
oFF.UserProfile.prototype = new oFF.XObjectExt();
oFF.UserProfile.prototype._ff_c = "UserProfile";

oFF.UserProfile.create = function()
{
	var newObj = new oFF.UserProfile();
	newObj.setup();
	return newObj;
};
oFF.UserProfile.prototype.m_properties = null;
oFF.UserProfile.prototype.m_parent = null;
oFF.UserProfile.prototype.m_serviceApiLevel = null;
oFF.UserProfile.prototype.m_uri = null;
oFF.UserProfile.prototype.m_document = null;
oFF.UserProfile.prototype.m_documentFormat = null;
oFF.UserProfile.prototype.m_scaleFactor = null;
oFF.UserProfile.prototype.m_scaleFormat = null;
oFF.UserProfile.prototype.m_currencyFormatSettings = null;
oFF.UserProfile.prototype.m_authGroups = null;
oFF.UserProfile.prototype.m_authTypes = null;
oFF.UserProfile.prototype.m_signPresentation = null;
oFF.UserProfile.prototype.setup = function()
{
	this.m_properties = oFF.XProperties.create();
};
oFF.UserProfile.prototype.getProperies = function()
{
	return this.m_properties;
};
oFF.UserProfile.prototype.setParent = function(parent)
{
	this.m_parent = parent;
	if (oFF.notNull(this.m_parent))
	{
		this.m_properties.setParent(this.m_parent.getProperies());
	}
	else
	{
		this.m_properties.setParent(null);
	}
};
oFF.UserProfile.prototype.getParent = function()
{
	return this.m_parent;
};
oFF.UserProfile.prototype.getServiceApiLevel = function()
{
	return this.m_serviceApiLevel;
};
oFF.UserProfile.prototype.setServiceApiLevel = function(level)
{
	this.m_serviceApiLevel = level;
};
oFF.UserProfile.prototype.getDocumentUri = function()
{
	return this.m_uri;
};
oFF.UserProfile.prototype.setDocumentUri = function(uri)
{
	this.m_uri = uri;
};
oFF.UserProfile.prototype.getDocumentFormat = function()
{
	return this.m_documentFormat;
};
oFF.UserProfile.prototype.setDocumentFormat = function(format)
{
	this.m_documentFormat = format;
};
oFF.UserProfile.prototype.getDocument = function()
{
	return this.m_document;
};
oFF.UserProfile.prototype.setDocument = function(document)
{
	this.m_document = oFF.PrFactory.createStructureDeepCopy(document);
};
oFF.UserProfile.prototype.setValue = function(key, value)
{
	if (oFF.notNull(value))
	{
		this.m_properties.put(key, value);
	}
	else
	{
		this.m_properties.remove(key);
	}
};
oFF.UserProfile.prototype.getKeysWithPrefix = function(prefix)
{
	var featureToggles = oFF.XListOfString.create();
	var keys = this.m_properties.getKeysAsReadOnlyListOfString();
	var size = oFF.XString.size(prefix);
	for (var i = 0; i < keys.size(); i++)
	{
		var currentKey = keys.get(i);
		if (oFF.XString.startsWith(currentKey, prefix))
		{
			currentKey = oFF.XString.substring(currentKey, size, -1);
			featureToggles.add(currentKey);
		}
	}
	featureToggles.sortByDirection(oFF.XSortDirection.ASCENDING);
	return featureToggles;
};
oFF.UserProfile.prototype.getInternalPropertyNames = function()
{
	var internalPropertyKeys = this.getKeysWithPrefix(oFF.UserProfileConstants.PREFIX_INTERNAL);
	return internalPropertyKeys;
};
oFF.UserProfile.prototype.getInternalPropertyValue = function(name)
{
	var key = oFF.XStringUtils.concatenate2(oFF.UserProfileConstants.PREFIX_INTERNAL, name);
	var value = this.m_properties.getByKey(key);
	return value;
};
oFF.UserProfile.prototype.setInternalProperty = function(name, value)
{
	var key = oFF.XStringUtils.concatenate2(oFF.UserProfileConstants.PREFIX_INTERNAL, name);
	this.setValue(key, value);
};
oFF.UserProfile.prototype.getFeatureToggles = function()
{
	var featureToggles = this.getKeysWithPrefix(oFF.UserProfileConstants.PREFIX_FEATURE_TOGGLE);
	return featureToggles;
};
oFF.UserProfile.prototype.setFeatureToggle = function(name, enable)
{
	var key = oFF.XStringUtils.concatenate2(oFF.UserProfileConstants.PREFIX_INTERNAL, name);
	if (enable === true)
	{
		this.setValue(key, "active");
	}
	else
	{
		this.setValue(key, null);
	}
};
oFF.UserProfile.prototype.getUserEnabled = function()
{
	return this.m_properties.getBooleanByKeyExt(oFF.UserProfileConstants.USER_ENABLED, true);
};
oFF.UserProfile.prototype.isUserEnabledDefault = function()
{
	return this.m_properties.isValueDefault(oFF.UserProfileConstants.USER_ENABLED);
};
oFF.UserProfile.prototype.setUserEnabled = function(userEnabled)
{
	this.m_properties.putBoolean(oFF.UserProfileConstants.USER_ENABLED, userEnabled);
};
oFF.UserProfile.prototype.resetUserEnabled = function()
{
	this.m_properties.remove(oFF.UserProfileConstants.USER_ENABLED);
};
oFF.UserProfile.prototype.getName = function()
{
	return this.getSAPName();
};
oFF.UserProfile.prototype.getSAPName = function()
{
	return this.m_properties.getByKey(oFF.UserProfileConstants.SAP_NAME);
};
oFF.UserProfile.prototype.isSAPNameDefault = function()
{
	return this.m_properties.isValueDefault(oFF.UserProfileConstants.SAP_NAME);
};
oFF.UserProfile.prototype.setSAPName = function(sapName)
{
	this.setValue(oFF.UserProfileConstants.SAP_NAME, sapName);
};
oFF.UserProfile.prototype.resetSAPName = function()
{
	this.m_properties.remove(oFF.UserProfileConstants.SAP_NAME);
};
oFF.UserProfile.prototype.getPersonNumber = function()
{
	return this.m_properties.getByKey(oFF.UserProfileConstants.USER_ID);
};
oFF.UserProfile.prototype.isPersonNumberDefault = function()
{
	return this.m_properties.isValueDefault(oFF.UserProfileConstants.USER_ID);
};
oFF.UserProfile.prototype.setPersonNumber = function(personNumber)
{
	this.setValue(oFF.UserProfileConstants.USER_ID, personNumber);
};
oFF.UserProfile.prototype.resetPersonNumber = function()
{
	this.m_properties.remove(oFF.UserProfileConstants.USER_ID);
};
oFF.UserProfile.prototype.getDisplayName = function()
{
	var displayName = this.m_properties.getByKey(oFF.UserProfileConstants.DISPLAY_NAME);
	if (oFF.XStringUtils.isNullOrEmpty(displayName))
	{
		displayName = this.getFirstName();
		if (oFF.XStringUtils.isNullOrEmpty(displayName))
		{
			displayName = this.getLastName();
		}
	}
	return displayName;
};
oFF.UserProfile.prototype.isDisplayNameDefault = function()
{
	return this.m_properties.isValueDefault(oFF.UserProfileConstants.DISPLAY_NAME);
};
oFF.UserProfile.prototype.setDisplayName = function(displayName)
{
	this.setValue(oFF.UserProfileConstants.DISPLAY_NAME, displayName);
};
oFF.UserProfile.prototype.resetDisplayName = function()
{
	this.m_properties.remove(oFF.UserProfileConstants.DISPLAY_NAME);
};
oFF.UserProfile.prototype.getFullName = function()
{
	var fullName = this.m_properties.getByKey(oFF.UserProfileConstants.FULL_NAME);
	if (oFF.XStringUtils.isNullOrEmpty(fullName))
	{
		var firstName = this.getFirstName();
		var lastName = this.getLastName();
		if (oFF.XStringUtils.isNotNullAndNotEmpty(firstName))
		{
			if (oFF.XStringUtils.isNotNullAndNotEmpty(lastName))
			{
				fullName = oFF.XStringUtils.concatenate3(firstName, " ", lastName);
			}
			else
			{
				fullName = firstName;
			}
		}
		else
		{
			fullName = lastName;
		}
	}
	return fullName;
};
oFF.UserProfile.prototype.isFullNameDefault = function()
{
	return this.m_properties.isValueDefault(oFF.UserProfileConstants.FULL_NAME);
};
oFF.UserProfile.prototype.setFullName = function(fullUserName)
{
	this.setValue(oFF.UserProfileConstants.FULL_NAME, fullUserName);
};
oFF.UserProfile.prototype.resetFullName = function()
{
	this.m_properties.remove(oFF.UserProfileConstants.FULL_NAME);
};
oFF.UserProfile.prototype.getTitle = function()
{
	return this.m_properties.getByKey(oFF.UserProfileConstants.TITLE);
};
oFF.UserProfile.prototype.isTitleDefault = function()
{
	return this.m_properties.isValueDefault(oFF.UserProfileConstants.TITLE);
};
oFF.UserProfile.prototype.setTitle = function(title)
{
	this.setValue(oFF.UserProfileConstants.TITLE, title);
};
oFF.UserProfile.prototype.resetTitle = function()
{
	this.m_properties.remove(oFF.UserProfileConstants.TITLE);
};
oFF.UserProfile.prototype.getFirstName = function()
{
	return this.m_properties.getByKey(oFF.UserProfileConstants.FIRST_NAME);
};
oFF.UserProfile.prototype.isFirstNameDefault = function()
{
	return this.m_properties.isValueDefault(oFF.UserProfileConstants.FIRST_NAME);
};
oFF.UserProfile.prototype.setFirstName = function(firstName)
{
	this.setValue(oFF.UserProfileConstants.FIRST_NAME, firstName);
};
oFF.UserProfile.prototype.resetFirstName = function()
{
	this.m_properties.remove(oFF.UserProfileConstants.FIRST_NAME);
};
oFF.UserProfile.prototype.getLastName = function()
{
	return this.m_properties.getByKey(oFF.UserProfileConstants.LAST_NAME);
};
oFF.UserProfile.prototype.isLastNameDefault = function()
{
	return this.m_properties.isValueDefault(oFF.UserProfileConstants.LAST_NAME);
};
oFF.UserProfile.prototype.setLastName = function(lastName)
{
	this.setValue(oFF.UserProfileConstants.LAST_NAME, lastName);
};
oFF.UserProfile.prototype.resetLastName = function()
{
	this.m_properties.remove(oFF.UserProfileConstants.LAST_NAME);
};
oFF.UserProfile.prototype.getStreetName = function()
{
	return this.m_properties.getByKey(oFF.UserProfileConstants.STREET_NAME);
};
oFF.UserProfile.prototype.isStreetNameDefault = function()
{
	return this.m_properties.isValueDefault(oFF.UserProfileConstants.STREET_NAME);
};
oFF.UserProfile.prototype.setStreetName = function(streetName)
{
	this.setValue(oFF.UserProfileConstants.STREET_NAME, streetName);
};
oFF.UserProfile.prototype.resetStreetName = function()
{
	this.m_properties.remove(oFF.UserProfileConstants.STREET_NAME);
};
oFF.UserProfile.prototype.getCountry = function()
{
	return this.m_properties.getByKey(oFF.UserProfileConstants.COUNTRY);
};
oFF.UserProfile.prototype.isCountryDefault = function()
{
	return this.m_properties.isValueDefault(oFF.UserProfileConstants.COUNTRY);
};
oFF.UserProfile.prototype.setCountry = function(country)
{
	this.setValue(oFF.UserProfileConstants.COUNTRY, country);
};
oFF.UserProfile.prototype.resetCountry = function()
{
	this.m_properties.remove(oFF.UserProfileConstants.COUNTRY);
};
oFF.UserProfile.prototype.getCityName = function()
{
	return this.m_properties.getByKey(oFF.UserProfileConstants.CITY);
};
oFF.UserProfile.prototype.isCityNameDefault = function()
{
	return this.m_properties.isValueDefault(oFF.UserProfileConstants.CITY);
};
oFF.UserProfile.prototype.setCityName = function(cityName)
{
	this.setValue(oFF.UserProfileConstants.CITY, cityName);
};
oFF.UserProfile.prototype.resetCityName = function()
{
	this.m_properties.remove(oFF.UserProfileConstants.CITY);
};
oFF.UserProfile.prototype.getCityCode = function()
{
	return this.m_properties.getByKey(oFF.UserProfileConstants.ZIP_CODE);
};
oFF.UserProfile.prototype.isCityCodeDefault = function()
{
	return this.m_properties.isValueDefault(oFF.UserProfileConstants.ZIP_CODE);
};
oFF.UserProfile.prototype.setCityCode = function(postalCode)
{
	this.setValue(oFF.UserProfileConstants.ZIP_CODE, postalCode);
};
oFF.UserProfile.prototype.resetCityCode = function()
{
	this.m_properties.remove(oFF.UserProfileConstants.ZIP_CODE);
};
oFF.UserProfile.prototype.getEmailAddress = function()
{
	return this.m_properties.getByKey(oFF.UserProfileConstants.EMAIL);
};
oFF.UserProfile.prototype.isEmailAddressDefault = function()
{
	return this.m_properties.isValueDefault(oFF.UserProfileConstants.EMAIL);
};
oFF.UserProfile.prototype.setEmailAddress = function(emailAddress)
{
	this.setValue(oFF.UserProfileConstants.EMAIL, emailAddress);
};
oFF.UserProfile.prototype.resetEmailAddress = function()
{
	this.m_properties.remove(oFF.UserProfileConstants.EMAIL);
};
oFF.UserProfile.prototype.getPhoneNumber = function()
{
	return this.m_properties.getByKey(oFF.UserProfileConstants.PHONE_NUMBER);
};
oFF.UserProfile.prototype.isPhoneNumberDefault = function()
{
	return this.m_properties.isValueDefault(oFF.UserProfileConstants.PHONE_NUMBER);
};
oFF.UserProfile.prototype.setPhoneNumber = function(phoneNumber)
{
	this.setValue(oFF.UserProfileConstants.PHONE_NUMBER, phoneNumber);
};
oFF.UserProfile.prototype.resetPhoneNumber = function()
{
	this.m_properties.remove(oFF.UserProfileConstants.PHONE_NUMBER);
};
oFF.UserProfile.prototype.getMobilePhoneNumber = function()
{
	return this.m_properties.getByKey(oFF.UserProfileConstants.MOBILE);
};
oFF.UserProfile.prototype.isMobilePhoneNumberDefault = function()
{
	return this.m_properties.isValueDefault(oFF.UserProfileConstants.MOBILE);
};
oFF.UserProfile.prototype.setMobilePhoneNumber = function(mobilePhoneNumber)
{
	this.setValue(oFF.UserProfileConstants.MOBILE, mobilePhoneNumber);
};
oFF.UserProfile.prototype.resetMobilePhoneNumber = function()
{
	this.m_properties.remove(oFF.UserProfileConstants.MOBILE);
};
oFF.UserProfile.prototype.getFaxNumber = function()
{
	return this.m_properties.getByKey(oFF.UserProfileConstants.FAX_NUMBER);
};
oFF.UserProfile.prototype.isFaxNumberDefault = function()
{
	return this.m_properties.isValueDefault(oFF.UserProfileConstants.FAX_NUMBER);
};
oFF.UserProfile.prototype.setFaxNumber = function(faxNumber)
{
	this.setValue(oFF.UserProfileConstants.FAX_NUMBER, faxNumber);
};
oFF.UserProfile.prototype.resetFaxNumber = function()
{
	this.m_properties.remove(oFF.UserProfileConstants.FAX_NUMBER);
};
oFF.UserProfile.prototype.getRoomNumber = function()
{
	return this.m_properties.getByKey(oFF.UserProfileConstants.ROOM_NUMBER);
};
oFF.UserProfile.prototype.isRoomNumberDefault = function()
{
	return this.m_properties.isValueDefault(oFF.UserProfileConstants.ROOM_NUMBER);
};
oFF.UserProfile.prototype.setRoomNumber = function(roomNumber)
{
	this.setValue(oFF.UserProfileConstants.ROOM_NUMBER, roomNumber);
};
oFF.UserProfile.prototype.resetRoomNumber = function()
{
	this.m_properties.remove(oFF.UserProfileConstants.ROOM_NUMBER);
};
oFF.UserProfile.prototype.getDepartment = function()
{
	return this.m_properties.getByKey(oFF.UserProfileConstants.DEPARTMENT);
};
oFF.UserProfile.prototype.isDepartmentDefault = function()
{
	return this.m_properties.isValueDefault(oFF.UserProfileConstants.DEPARTMENT);
};
oFF.UserProfile.prototype.setDepartment = function(department)
{
	this.setValue(oFF.UserProfileConstants.DEPARTMENT, department);
};
oFF.UserProfile.prototype.resetDepartment = function()
{
	this.m_properties.remove(oFF.UserProfileConstants.DEPARTMENT);
};
oFF.UserProfile.prototype.getRegion = function()
{
	return this.m_properties.getByKey(oFF.UserProfileConstants.REGION);
};
oFF.UserProfile.prototype.isRegionDefault = function()
{
	return this.m_properties.isValueDefault(oFF.UserProfileConstants.REGION);
};
oFF.UserProfile.prototype.setRegion = function(region)
{
	this.setValue(oFF.UserProfileConstants.REGION, region);
};
oFF.UserProfile.prototype.resetRegion = function()
{
	this.m_properties.remove(oFF.UserProfileConstants.REGION);
};
oFF.UserProfile.prototype.getManagerPersonNumber = function()
{
	return this.m_properties.getByKey(oFF.UserProfileConstants.MANAGER_ID);
};
oFF.UserProfile.prototype.isManagerPersonNumberDefault = function()
{
	return this.m_properties.isValueDefault(oFF.UserProfileConstants.MANAGER_ID);
};
oFF.UserProfile.prototype.setManagerPersonNumber = function(managerPersonNumber)
{
	this.setValue(oFF.UserProfileConstants.MANAGER_ID, managerPersonNumber);
};
oFF.UserProfile.prototype.resetManagerPersonNumber = function()
{
	this.m_properties.remove(oFF.UserProfileConstants.MANAGER_ID);
};
oFF.UserProfile.prototype.getDeliveryOfficeName = function()
{
	return this.m_properties.getByKey(oFF.UserProfileConstants.DELIVERY_OFFICE_NAME);
};
oFF.UserProfile.prototype.isDeliveryOfficeNameDefault = function()
{
	return this.m_properties.isValueDefault(oFF.UserProfileConstants.DELIVERY_OFFICE_NAME);
};
oFF.UserProfile.prototype.setDeliveryOfficeName = function(deliveryOfficeName)
{
	this.setValue(oFF.UserProfileConstants.DELIVERY_OFFICE_NAME, deliveryOfficeName);
};
oFF.UserProfile.prototype.resetDeliveryOfficeName = function()
{
	this.m_properties.remove(oFF.UserProfileConstants.DELIVERY_OFFICE_NAME);
};
oFF.UserProfile.prototype.getCostCenter = function()
{
	return this.m_properties.getByKey(oFF.UserProfileConstants.COST_CENTER);
};
oFF.UserProfile.prototype.isCostCenterDefault = function()
{
	return this.m_properties.isValueDefault(oFF.UserProfileConstants.COST_CENTER);
};
oFF.UserProfile.prototype.setCostCenter = function(costCenter)
{
	this.setValue(oFF.UserProfileConstants.COST_CENTER, costCenter);
};
oFF.UserProfile.prototype.resetCostCenter = function()
{
	this.m_properties.remove(oFF.UserProfileConstants.COST_CENTER);
};
oFF.UserProfile.prototype.getCostCenterId = function()
{
	return this.m_properties.getByKey(oFF.UserProfileConstants.COST_CENTER_ID);
};
oFF.UserProfile.prototype.isCostCenterIdDefault = function()
{
	return this.m_properties.isValueDefault(oFF.UserProfileConstants.COST_CENTER_ID);
};
oFF.UserProfile.prototype.setCostCenterId = function(costCenterId)
{
	this.setValue(oFF.UserProfileConstants.COST_CENTER_ID, costCenterId);
};
oFF.UserProfile.prototype.resetCostCenterId = function()
{
	this.m_properties.remove(oFF.UserProfileConstants.COST_CENTER_ID);
};
oFF.UserProfile.prototype.getOrgUnit = function()
{
	return this.m_properties.getByKey(oFF.UserProfileConstants.ORG_UNIT);
};
oFF.UserProfile.prototype.isOrgUnitDefault = function()
{
	return this.m_properties.isValueDefault(oFF.UserProfileConstants.ORG_UNIT);
};
oFF.UserProfile.prototype.setOrgUnit = function(orgUnit)
{
	this.setValue(oFF.UserProfileConstants.ORG_UNIT, orgUnit);
};
oFF.UserProfile.prototype.resetOrgUnit = function()
{
	this.m_properties.remove(oFF.UserProfileConstants.ORG_UNIT);
};
oFF.UserProfile.prototype.getText = function()
{
	return this.getDescription();
};
oFF.UserProfile.prototype.getDescription = function()
{
	return this.m_properties.getByKey(oFF.UserProfileConstants.DESCRIPTION);
};
oFF.UserProfile.prototype.isDescriptionDefault = function()
{
	return this.m_properties.isValueDefault(oFF.UserProfileConstants.DESCRIPTION);
};
oFF.UserProfile.prototype.setDescription = function(description)
{
	this.setValue(oFF.UserProfileConstants.DESCRIPTION, description);
};
oFF.UserProfile.prototype.resetDescription = function()
{
	this.m_properties.remove(oFF.UserProfileConstants.DESCRIPTION);
};
oFF.UserProfile.prototype.getLanguage = function()
{
	return this.m_properties.getByKey(oFF.UserProfileConstants.LANGUAGE);
};
oFF.UserProfile.prototype.isLanguageDefault = function()
{
	return this.m_properties.isValueDefault(oFF.UserProfileConstants.LANGUAGE);
};
oFF.UserProfile.prototype.setLanguage = function(language)
{
	this.setValue(oFF.UserProfileConstants.LANGUAGE, language);
};
oFF.UserProfile.prototype.resetLanguage = function()
{
	this.m_properties.remove(oFF.UserProfileConstants.LANGUAGE);
};
oFF.UserProfile.prototype.getDataAccessLanguage = function()
{
	var dataAccessLanguage = this.m_properties.getByKey(oFF.UserProfileConstants.DATA_ACCESS_LANGUAGE);
	if (oFF.XStringUtils.isNullOrEmpty(dataAccessLanguage))
	{
		dataAccessLanguage = this.getLanguage();
		if (oFF.XStringUtils.isNullOrEmpty(dataAccessLanguage))
		{
			dataAccessLanguage = "en";
		}
	}
	return dataAccessLanguage;
};
oFF.UserProfile.prototype.isDataAccessLanguageDefault = function()
{
	return this.m_properties.isValueDefault(oFF.UserProfileConstants.DATA_ACCESS_LANGUAGE);
};
oFF.UserProfile.prototype.setDataAccessLanguage = function(dataAccessLanguage)
{
	this.setValue(oFF.UserProfileConstants.DATA_ACCESS_LANGUAGE, dataAccessLanguage);
};
oFF.UserProfile.prototype.resetDataAccessLanguage = function()
{
	this.m_properties.remove(oFF.UserProfileConstants.DATA_ACCESS_LANGUAGE);
};
oFF.UserProfile.prototype.getDateFormatting = function()
{
	return this.m_properties.getByKey(oFF.UserProfileConstants.DATE_FORMAT);
};
oFF.UserProfile.prototype.isDateFormattingDefault = function()
{
	return this.m_properties.isValueDefault(oFF.UserProfileConstants.DATE_FORMAT);
};
oFF.UserProfile.prototype.setDateFormatting = function(dateFormatting)
{
	this.setValue(oFF.UserProfileConstants.DATE_FORMAT, dateFormatting);
};
oFF.UserProfile.prototype.resetDateFormatting = function()
{
	this.m_properties.remove(oFF.UserProfileConstants.DATE_FORMAT);
};
oFF.UserProfile.prototype.getTimeFormatting = function()
{
	return this.m_properties.getByKey(oFF.UserProfileConstants.TIME_FORMAT);
};
oFF.UserProfile.prototype.isTimeFormattingDefault = function()
{
	return this.m_properties.isValueDefault(oFF.UserProfileConstants.TIME_FORMAT);
};
oFF.UserProfile.prototype.setTimeFormatting = function(timeFormatting)
{
	this.setValue(oFF.UserProfileConstants.TIME_FORMAT, timeFormatting);
};
oFF.UserProfile.prototype.resetTimeFormatting = function()
{
	this.m_properties.remove(oFF.UserProfileConstants.TIME_FORMAT);
};
oFF.UserProfile.prototype.getScaleFormatting = function()
{
	return this.m_properties.getByKey(oFF.UserProfileConstants.SCALE_FORMAT);
};
oFF.UserProfile.prototype.isScaleFormattingDefault = function()
{
	return this.m_properties.isValueDefault(oFF.UserProfileConstants.SCALE_FORMAT);
};
oFF.UserProfile.prototype.setScaleFormatting = function(scaleFormatting)
{
	this.setValue(oFF.UserProfileConstants.SCALE_FORMAT, scaleFormatting);
};
oFF.UserProfile.prototype.resetScaleFormatting = function()
{
	this.m_properties.remove(oFF.UserProfileConstants.SCALE_FORMAT);
};
oFF.UserProfile.prototype.getCurrencyPosition = function()
{
	return this.m_properties.getByKey(oFF.UserProfileConstants.CURRENCY_POS);
};
oFF.UserProfile.prototype.isCurrencyPositionDefault = function()
{
	return this.m_properties.isValueDefault(oFF.UserProfileConstants.CURRENCY_POS);
};
oFF.UserProfile.prototype.setCurrencyPosition = function(currencyPosition)
{
	this.setValue(oFF.UserProfileConstants.CURRENCY_POS, currencyPosition);
};
oFF.UserProfile.prototype.resetCurrencyPosition = function()
{
	this.m_properties.remove(oFF.UserProfileConstants.CURRENCY_POS);
};
oFF.UserProfile.prototype.getMainApplication = function()
{
	return this.m_properties.getByKey(oFF.UserProfileConstants.MAIN_APP);
};
oFF.UserProfile.prototype.isMainApplicationDefault = function()
{
	return this.m_properties.isValueDefault(oFF.UserProfileConstants.MAIN_APP);
};
oFF.UserProfile.prototype.setMainApplication = function(mainApplication)
{
	this.setValue(oFF.UserProfileConstants.MAIN_APP, mainApplication);
};
oFF.UserProfile.prototype.resetMainApplication = function()
{
	this.m_properties.remove(oFF.UserProfileConstants.MAIN_APP);
};
oFF.UserProfile.prototype.getCleanUpNotification = function()
{
	return this.m_properties.getByKey(oFF.UserProfileConstants.CLEAN_UP_NOTIFICATION);
};
oFF.UserProfile.prototype.isCleanUpNotificationDefault = function()
{
	return this.m_properties.isValueDefault(oFF.UserProfileConstants.CLEAN_UP_NOTIFICATION);
};
oFF.UserProfile.prototype.setCleanUpNotification = function(cleanUpNotification)
{
	this.setValue(oFF.UserProfileConstants.CLEAN_UP_NOTIFICATION, cleanUpNotification);
};
oFF.UserProfile.prototype.resetCleanUpNotification = function()
{
	this.m_properties.remove(oFF.UserProfileConstants.CLEAN_UP_NOTIFICATION);
};
oFF.UserProfile.prototype.getEmailSystemNotification = function()
{
	return this.m_properties.getByKey(oFF.UserProfileConstants.EMAIL_SYSTEM_NOTIFICATION);
};
oFF.UserProfile.prototype.isEmailSystemNotificationDefault = function()
{
	return this.m_properties.isValueDefault(oFF.UserProfileConstants.EMAIL_SYSTEM_NOTIFICATION);
};
oFF.UserProfile.prototype.setEmailSystemNotification = function(emailSystemNotification)
{
	this.setValue(oFF.UserProfileConstants.EMAIL_SYSTEM_NOTIFICATION, emailSystemNotification);
};
oFF.UserProfile.prototype.resetEmailSystemNotification = function()
{
	this.m_properties.remove(oFF.UserProfileConstants.EMAIL_SYSTEM_NOTIFICATION);
};
oFF.UserProfile.prototype.getEmailProductUpdateNotification = function()
{
	return this.m_properties.getByKey(oFF.UserProfileConstants.EMAIL_PRODUCT_UPDATE_NOTIFICATION);
};
oFF.UserProfile.prototype.isEmailProductUpdateNotificationDefault = function()
{
	return this.m_properties.isValueDefault(oFF.UserProfileConstants.EMAIL_PRODUCT_UPDATE_NOTIFICATION);
};
oFF.UserProfile.prototype.setEmailProductUpdateNotification = function(emailProductUpdateNotification)
{
	this.setValue(oFF.UserProfileConstants.EMAIL_PRODUCT_UPDATE_NOTIFICATION, emailProductUpdateNotification);
};
oFF.UserProfile.prototype.resetEmailProductUpdateNotification = function()
{
	this.m_properties.remove(oFF.UserProfileConstants.EMAIL_PRODUCT_UPDATE_NOTIFICATION);
};
oFF.UserProfile.prototype.getThumbnailPhotoEncoded = function()
{
	var photo = this.getThumbnailPhoto();
	if (oFF.isNull(photo))
	{
		photo = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEBKwErAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAALCABkAGQBAREA/8QAHgABAAICAgMBAAAAAAAAAAAAAAoLCAkGBwEDBQL/xAAwEAAABgIBAgMHBAMBAAAAAAABAgMEBQYABwgJEgoRExQVFiFSktMiMTJBFxhRI//aAAgBAQAAPwCfxjGMYxjGMYxjGMZq/wCqD1bOKHSi1Kz2DyCnXszdbWR8jq3SlOMzdbF2Q/YlD2lVg1dLJNYOsx6yiKUxbZpRCKYGWTbNwkJJVtHLwKuS/jH+pVs+fkS8eKhpTjPShWXJENUqqTa95BoJzA3UlrNd++urPPS7RV92UmNRIoIlJ3lADGw8g/FQ9bGGk05FblFXZ1MigHPFTmjtMrRiwAPmKSibGkx7sqY/xH0XiSgB/E5R+ebyun14z+xOrVX6D1HNJ1lCsSbltHud9aFZyrBzXDLKFSGWturZaQmglotLz9V+5qM0zftkgOdlW5I5SoDPU1ns3X259f1DauqbhA37XN9gmFmp1yrEgjJwVhgpNEq7OQj3iBhIomoQRIomcCLtlyKtnKSLlFVInOsYxjGM+DabLC0usWO42V8jF12pwMvZZ+TcGAqEdCwUe4lJV8uYfICos2LVdwoYfkBEzDlJb1ReeuwupBzV3Lycu8m/UhbBY30JqmsuXCh2VE1HBPXLSi1eNbGN6TUycV2Sk0ZEpPeFjkpeTV81XZxzXvjGTyvBn9Rm0Nr7tLprbFsLqSqM3XZjdXHtCRcqLfDdhhF23+TqZEeqcfRjbBFPEbo3j0e1BrIQdjepkBWWcmGwuxjGMYzU511NmSOo+kNz+ucQ6UZSZuPdoqDJ0kcU1UVdjuY7XZjpnKIGKcqNpUEogID5h8spasYxm33oG7Mf6o6w3ASyMXarQsvviE17I+mcSAvE7PjpTXsg3V8hDvTOjZBMJB+QmIQf3AMue8YxjGM0u+IfqcncujBz4i4lJVZ3H6ljLUdJEomOMfTL/T7XLn8igI9iETDvXCn/ABNIwj8gHKanGMZs96K9Rk7x1ZentARCSirv/anU02oCZRMKcfVLG2tUu4N5fME20TCvXCpv2Kmkcw/IMuu8YxjGM6z3Tqqsb00/tLSt1bg7qG2te3HXFmQEhVBPCXSvyFekhTKf9PrJtZBRREw/xVIQwCAgAhRvcuOM+w+HPJXdHGTakavHXXTd9nabIisidJKWZMXRjwVkj+8A9aItEErHWCIck8yOI6SbKlH9XkGOmMZMe8HJwSnNwc1LvzdssKqGs+LVTlq1UJV02H2OX3TsqJWhUWkeqcAIsrVaE7sMlJil3HYuZyuGN2+1kHLNrGMYxjGRbfER9AZr1Oaoz5IcbUoOuc0tbV33QLCRVbxMJvulRoLOGNOnZU4EbxlygzqLFpdkfmBkog4Urs2u3jhjpCHq7Ny6Q2/x32FP6o3nra5ao2PV3irGdp15gX9fm2KyRzJ+p7M+RSB0zWEonaSLI7iPfIiVwzcroHIobqzNsHS96OXMLqnbPiq5pykydX08ylGyWx+Q9siXzPWlIigVL7eVnIKEQJb7X7OCnu2o19ZzIOHApHkVIqN9eSQt2OCXCTSXT04ya54t6EiDsaZRGB1JKbfEQGw3q3yPYvZ71anKBCFdz9jkCmcL9oA3YNCM4hgRKOjmaCeYGMYxjPBjAUBERAAABEREfIAAP3ER/ryzQF1K/Ee9PPp1knKUW6l5JchI0q7Yml9LScbMBCyiYeRW2w78U7mrUoqSggV7H+tM2luAGEKyf9wj58NfGnzEpu6yxvOnjxAVjRFpl0hpdl0MWXl7bqZh5FRBvboixyhx2THmKHtL6Ug/huYarCsZjASSJ0GDeU3F7r6MvV1osYR5auHPLaJVbJizrd/SpTzYlc9pJ3mbfDFzQjdj1J2UTmKqVFlHH9UBEpz/AKTjxWH6JPRH1TIkvheFHFuHNHqA/LJXQ6s9XWhkh9QHAxt5sstWk00x/UHexBIgB8gAoeWdQcx/ECdJbpv0VemVfZ9C2rcauxVj6px64pJ1uxJs3DdM3s0U9lquKWtqDHEVAE3Ht8qk8bJ9x2sK+VAqB45fGvxr16NvOyk5Y8Wa2nx2slg86mtpaUfqbQ1bAmMmgiSZJaH5ILaBiJgLuQUbBRXXrmW9gTURBBgWa9wy6hHD3qA0FLYfFDeNP2lHJt0FpyvM3gxl9p6y5CCDK5USVK0s9ccEOf0gUfxpGLk5TGYPHaPaqbM7GMZwfZuxqfp/XN82vsGYb1+i62qFivNwm3ZykbxVbq0S6mpl8oJjFAfZ2DJdQqYCBlTgVMnmc4ANT/1SvEvc7ufs3dNfaxuMlxh4tvpCSjYbXWsX7qFutwq3rqIs1No7BaLJz8o5k2QJrSddgnMLVkzLKMlY+SKl7WtHCOc6hzqKHMdQ5jHOc5hMcxzCJjGMYwiYxjGERMYRERERERERz8Z7EllUFCLIKqIrJmAyaqRzJqJmD9jEOQQMUwf0JRAQz7j622qUbAyk7NYJFmUO0rR9NSTtsUPL5ACDhyokAB/wCeWcfxnaGnd2be4936E2lo3Zd11NsSuOCOYW40KxSVanmRyHKcUwfRjhuou0WEoFdMXPrMnifmi6brJGMQbEjw5fiOtx839yR3Bnm+NVl9sS9SlJTTO8Idi0rEjsKSqTEZGZpd6gGXowStocV5u/nIedr7OJSkgiJJk/ijvlmzpabBjGRAfGCdQH/XzhLVOGlIm/ZNk8wJdT4wSZuOx9F6Kor1k/sXrgT/0RRutqGCraXcJU38SztLX9RSKFysFxjGMYxnc3Hfel74yb21FyE1lIqRd901sGr7DrDoihiENI1mVbSQMXXb81I+URRWjJNAfMrmPeOm5wEipgG8O4n8jqLy842aT5M61dkdUzdWu63fIkhVCqqRisuwTPLQDwxf4yVcmSSEDKJD5GRkI5ykYAEg5kJnodOmzJs4evF0WrNogq6dOnChUUGzZBMyq666qglIkiikQyiihzAUhCmMYQABHKYXrlc+HHUV6kG+N2xcos/wBWViYNqLRyIqGFojqzXjp5FxUq0SE5iJ/GMseZuy/aAG9SxCkfzBEvlqIxjGMYxjLE/wAGH1AvizWO6enTe5v1JrWLp1vDRiD1wAqr0Syv2zHZdYjyqH7jI123OoyzoNkgEe24zCwFBJqcSzqc0H+JU5mWnhd0od3WChGeNL5vGQh+N9ZnWRzoqVkmz2UyFrniuE/1IOm9GhLOzjFiGKojMPo9cgh6QiFPvjGMYxjGMz36YPMO28Dud/G7k3UzO1iUXYkQyuEM0VOn8T66tSvwzfq2oUogVUZOsSkiDIqgGIlKJMHQF9RuQQu+WjhJ61bPEe/0XbdFyj3gYh/SXTKqn3k8/Mpuw4dxR+YD5gP7Zg31KOHmkedHDPdGgd+wsjK0qRrTy2sHsE/SirLWLdS2rmdrVnrUouzkEGMvGvW4pgZywfM3bB0+jnzNyyeOET0omxKTFVG+XGrxriQXj69ZJeHZLPlWyrxVtHvlmyJ3SiDRsgdcyaYCqZJuimY4iJUiB5FDhnutv9a33E/Hj3W3+tb7ifjx7rb/AFrfcT8ePdbf61vuJ+PHutv9a33E/Hj3W3+tb7ifjx7rb/Wt9xPx491t/rW+4n48e62/1rfcT8eSHfDT8DtAc1uoZV4jf0bYLJWdTR/+V4mqM5RmwgLHYqg5Qk4ZhcEDRTp7KV0r9Bu4exTJ9F+8Cog0eOFmKrhqtbdgBe0oAUoABQAAAAAAAA+QAH9AH9B/Wf/Z";
	}
	else
	{
		photo = oFF.XStringUtils.concatenate2("data:image/jpeg;base64,", photo);
	}
	return photo;
};
oFF.UserProfile.prototype.getThumbnailPhoto = function()
{
	return this.m_properties.getByKey(oFF.UserProfileConstants.THUMBNAIL_PHOTO);
};
oFF.UserProfile.prototype.isThumbnailPhotoDefault = function()
{
	return this.m_properties.isValueDefault(oFF.UserProfileConstants.THUMBNAIL_PHOTO);
};
oFF.UserProfile.prototype.setThumbnailPhoto = function(thumbnailPhoto)
{
	this.setValue(oFF.UserProfileConstants.THUMBNAIL_PHOTO, thumbnailPhoto);
};
oFF.UserProfile.prototype.resetThumbnailPhoto = function()
{
	this.m_properties.remove(oFF.UserProfileConstants.THUMBNAIL_PHOTO);
};
oFF.UserProfile.prototype.getCompany = function()
{
	return this.m_properties.getByKey(oFF.UserProfileConstants.COMPANY);
};
oFF.UserProfile.prototype.isCompanyDefault = function()
{
	return this.m_properties.isValueDefault(oFF.UserProfileConstants.COMPANY);
};
oFF.UserProfile.prototype.setCompany = function(company)
{
	this.setValue(oFF.UserProfileConstants.COMPANY, company);
};
oFF.UserProfile.prototype.resetCompany = function()
{
	this.m_properties.remove(oFF.UserProfileConstants.COMPANY);
};
oFF.UserProfile.prototype.getSamaAccountType = function()
{
	return this.m_properties.getByKey(oFF.UserProfileConstants.ACCOUNT_TYPE);
};
oFF.UserProfile.prototype.isSamaAccountTypeDefault = function()
{
	return this.m_properties.isValueDefault(oFF.UserProfileConstants.ACCOUNT_TYPE);
};
oFF.UserProfile.prototype.setSamaAccountType = function(samaAccountType)
{
	this.setValue(oFF.UserProfileConstants.ACCOUNT_TYPE, samaAccountType);
};
oFF.UserProfile.prototype.resetSamaAccountType = function()
{
	this.m_properties.remove(oFF.UserProfileConstants.ACCOUNT_TYPE);
};
oFF.UserProfile.prototype.getTelephoneAssistant = function()
{
	return this.m_properties.getByKey(oFF.UserProfileConstants.TELEPHONE_ASSISTANT);
};
oFF.UserProfile.prototype.isTelephoneAssistantDefault = function()
{
	return this.m_properties.isValueDefault(oFF.UserProfileConstants.TELEPHONE_ASSISTANT);
};
oFF.UserProfile.prototype.setTelephoneAssistant = function(telephoneAssistant)
{
	this.setValue(oFF.UserProfileConstants.TELEPHONE_ASSISTANT, telephoneAssistant);
};
oFF.UserProfile.prototype.resetTelephoneAssistant = function()
{
	this.m_properties.remove(oFF.UserProfileConstants.TELEPHONE_ASSISTANT);
};
oFF.UserProfile.prototype.getSAPObjectStatus = function()
{
	return this.m_properties.getByKey(oFF.UserProfileConstants.SAP_OBJECT_STATUS);
};
oFF.UserProfile.prototype.isSAPObjectStatusDefault = function()
{
	return this.m_properties.isValueDefault(oFF.UserProfileConstants.SAP_OBJECT_STATUS);
};
oFF.UserProfile.prototype.setSAPObjectStatus = function(SAPObjectStatus)
{
	this.setValue(oFF.UserProfileConstants.SAP_OBJECT_STATUS, SAPObjectStatus);
};
oFF.UserProfile.prototype.resetSAPObjectStatus = function()
{
	this.m_properties.remove(oFF.UserProfileConstants.SAP_OBJECT_STATUS);
};
oFF.UserProfile.prototype.getUnixHomeDirectory = function()
{
	return this.m_properties.getByKey(oFF.UserProfileConstants.HOME_DIR);
};
oFF.UserProfile.prototype.isUnixHomeDirectoryDefault = function()
{
	return this.m_properties.isValueDefault(oFF.UserProfileConstants.HOME_DIR);
};
oFF.UserProfile.prototype.setUnixHomeDirectory = function(unixHomeDirectory)
{
	this.setValue(oFF.UserProfileConstants.HOME_DIR, unixHomeDirectory);
};
oFF.UserProfile.prototype.resetUnixHomeDirectory = function()
{
	this.m_properties.remove(oFF.UserProfileConstants.HOME_DIR);
};
oFF.UserProfile.prototype.getExchUsageLocation = function()
{
	return this.m_properties.getByKey(oFF.UserProfileConstants.EXCHANGE_USAGE_LOCATION);
};
oFF.UserProfile.prototype.isExchUsageLocationDefault = function()
{
	return this.m_properties.isValueDefault(oFF.UserProfileConstants.EXCHANGE_USAGE_LOCATION);
};
oFF.UserProfile.prototype.setExchUsageLocation = function(exchUsageLocation)
{
	this.setValue(oFF.UserProfileConstants.EXCHANGE_USAGE_LOCATION, exchUsageLocation);
};
oFF.UserProfile.prototype.resetExchUsageLocation = function()
{
	this.m_properties.remove(oFF.UserProfileConstants.EXCHANGE_USAGE_LOCATION);
};
oFF.UserProfile.prototype.getTenantId = function()
{
	return this.m_properties.getByKey(oFF.UserProfileConstants.TENANT_ID);
};
oFF.UserProfile.prototype.isTenantIdDefault = function()
{
	return this.m_properties.isValueDefault(oFF.UserProfileConstants.TENANT_ID);
};
oFF.UserProfile.prototype.setTenantId = function(tenantId)
{
	this.setValue(oFF.UserProfileConstants.TENANT_ID, tenantId);
};
oFF.UserProfile.prototype.resetTenantId = function()
{
	this.m_properties.remove(oFF.UserProfileConstants.TENANT_ID);
};
oFF.UserProfile.prototype.getTimeZone = function()
{
	var timeZone = null;
	var timeZoneId = this.getTimeZoneId();
	if (oFF.XStringUtils.isNotNullAndNotEmpty(timeZoneId))
	{
		if (oFF.XString.startsWith(timeZoneId, "#") === false)
		{
			timeZone = oFF.XSimpleTimeZone.createWithId(timeZoneId);
		}
	}
	return timeZone;
};
oFF.UserProfile.prototype.getTimeZoneId = function()
{
	return this.m_properties.getByKey(oFF.UserProfileConstants.TIMEZONE_ID);
};
oFF.UserProfile.prototype.isTimeZoneIdDefault = function()
{
	return this.m_properties.isValueDefault(oFF.UserProfileConstants.TIMEZONE_ID);
};
oFF.UserProfile.prototype.setTimeZoneId = function(timeZoneId)
{
	this.setValue(oFF.UserProfileConstants.TIMEZONE_ID, timeZoneId);
};
oFF.UserProfile.prototype.resetTimeZoneId = function()
{
	this.m_properties.remove(oFF.UserProfileConstants.TIMEZONE_ID);
};
oFF.UserProfile.prototype.getDecimalFormatExample = function()
{
	var numberFormatting;
	var groupingSeparator = this.getDecimalGroupingSeparator();
	var decimalSeparator = this.getDecimalSeparator();
	numberFormatting = oFF.XStringBuffer.create().append("1").append(groupingSeparator).append("234").append(groupingSeparator).append("567").append(decimalSeparator).append("89").toString();
	return numberFormatting;
};
oFF.UserProfile.prototype.getDecimalFormat = function()
{
	var numberFormatting = this.m_properties.getByKey(oFF.UserProfileConstants.DECIMAL_FORMAT);
	if (oFF.XStringUtils.isNullOrEmpty(numberFormatting))
	{
		var groupingSeparator = this.getDecimalGroupingSeparator();
		var decimalSeparator = this.getDecimalSeparator();
		numberFormatting = oFF.XStringBuffer.create().append("#").append(groupingSeparator).append("##0").append(decimalSeparator).append("00").toString();
	}
	return numberFormatting;
};
oFF.UserProfile.prototype.isDecimalFormatDefault = function()
{
	return this.m_properties.isValueDefault(oFF.UserProfileConstants.DECIMAL_FORMAT);
};
oFF.UserProfile.prototype.setDecimalFormat = function(decimalFormat)
{
	this.setValue(oFF.UserProfileConstants.DECIMAL_FORMAT, decimalFormat);
};
oFF.UserProfile.prototype.resetDecimalFormat = function()
{
	this.m_properties.remove(oFF.UserProfileConstants.DECIMAL_FORMAT);
};
oFF.UserProfile.prototype.getDecimalSeparator = function()
{
	return this.m_properties.getByKey(oFF.UserProfileConstants.DECIMAL_SEPARATOR);
};
oFF.UserProfile.prototype.isDecimalSeparatorDefault = function()
{
	return this.m_properties.isValueDefault(oFF.UserProfileConstants.DECIMAL_SEPARATOR);
};
oFF.UserProfile.prototype.setDecimalSeparator = function(decimalSeparator)
{
	this.setValue(oFF.UserProfileConstants.DECIMAL_SEPARATOR, decimalSeparator);
};
oFF.UserProfile.prototype.resetDecimalSeparator = function()
{
	this.m_properties.remove(oFF.UserProfileConstants.DECIMAL_SEPARATOR);
};
oFF.UserProfile.prototype.getDecimalGroupingSeparator = function()
{
	return this.m_properties.getByKey(oFF.UserProfileConstants.GROUPING_SEPARATOR);
};
oFF.UserProfile.prototype.isDecimalGroupingSeparatorDefault = function()
{
	return this.m_properties.isValueDefault(oFF.UserProfileConstants.GROUPING_SEPARATOR);
};
oFF.UserProfile.prototype.setDecimalGroupingSeparator = function(groupingSeparator)
{
	this.setValue(oFF.UserProfileConstants.GROUPING_SEPARATOR, groupingSeparator);
};
oFF.UserProfile.prototype.resetDecimalGroupingSeparator = function()
{
	this.m_properties.remove(oFF.UserProfileConstants.GROUPING_SEPARATOR);
};
oFF.UserProfile.prototype.getEncryptionToken = function()
{
	return this.m_properties.getByKey(oFF.UserProfileConstants.ENCRYPTION_TOKEN);
};
oFF.UserProfile.prototype.isEncryptionTokenDefault = function()
{
	return this.m_properties.isValueDefault(oFF.UserProfileConstants.ENCRYPTION_TOKEN);
};
oFF.UserProfile.prototype.setEncryptionToken = function(encryptionToken)
{
	this.setValue(oFF.UserProfileConstants.ENCRYPTION_TOKEN, encryptionToken);
};
oFF.UserProfile.prototype.resetEncryptionToken = function()
{
	this.m_properties.remove(oFF.UserProfileConstants.ENCRYPTION_TOKEN);
};
oFF.UserProfile.prototype.getCacheSchema = function()
{
	return this.m_properties.getByKey(oFF.UserProfileConstants.CACHE_SCHEMA);
};
oFF.UserProfile.prototype.isCacheSchemaDefault = function()
{
	return this.m_properties.isValueDefault(oFF.UserProfileConstants.CACHE_SCHEMA);
};
oFF.UserProfile.prototype.setCacheSchema = function(cacheSchema)
{
	this.setValue(oFF.UserProfileConstants.CACHE_SCHEMA, cacheSchema);
};
oFF.UserProfile.prototype.resetCacheSchema = function()
{
	this.m_properties.remove(oFF.UserProfileConstants.CACHE_SCHEMA);
};
oFF.UserProfile.prototype.getCurrencyFormatSettings = function()
{
	return this.m_currencyFormatSettings;
};
oFF.UserProfile.prototype.setCurrencyFormatSettings = function(currencyFormatSettings)
{
	this.m_currencyFormatSettings = currencyFormatSettings;
};
oFF.UserProfile.prototype.getScaleFactor = function()
{
	return this.m_scaleFactor;
};
oFF.UserProfile.prototype.setScaleFactor = function(scaleFactor)
{
	this.m_scaleFactor = scaleFactor;
};
oFF.UserProfile.prototype.getScaleFormat = function()
{
	return this.m_scaleFormat;
};
oFF.UserProfile.prototype.setScaleFormat = function(scaleFormat)
{
	this.m_scaleFormat = scaleFormat;
};
oFF.UserProfile.prototype.getSignPresentation = function()
{
	return this.m_signPresentation;
};
oFF.UserProfile.prototype.setSignPresentation = function(signPresentation)
{
	this.m_signPresentation = signPresentation;
};
oFF.UserProfile.prototype.getMaxDigitsRight = function()
{
	return -1;
};
oFF.UserProfile.prototype.getRightPad = function()
{
	return -1;
};
oFF.UserProfile.prototype.setMaxDigitsRight = oFF.noSupport;
oFF.UserProfile.prototype.setRightPad = oFF.noSupport;
oFF.UserProfile.prototype.setAuthGroups = function(authGroups)
{
	this.m_authGroups = authGroups;
};
oFF.UserProfile.prototype.getAuthGroups = function()
{
	return this.m_authGroups;
};
oFF.UserProfile.prototype.setAuthTypes = function(authTypes)
{
	this.m_authTypes = authTypes;
};
oFF.UserProfile.prototype.getAuthTypes = function()
{
	return this.m_authTypes;
};
oFF.UserProfile.prototype.arePrivilegesAvailable = function()
{
	return oFF.notNull(this.m_authTypes) && this.m_authTypes.hasElements();
};
oFF.UserProfile.prototype.hasPrivilegeOnType = function(authGroup, privilege)
{
	if (oFF.notNull(this.m_authTypes))
	{
		var foundAuthType = oFF.XCollectionUtils.findFirst(this.m_authTypes.getValuesAsReadOnlyList(),  function(authType){
			if (authType.isStructure())
			{
				var tmpAuthType = authType.asStructure();
				var tmpAuthGroupName = tmpAuthType.getStringByKey("name");
				return oFF.XString.isEqual(tmpAuthGroupName, authGroup);
			}
			return false;
		}.bind(this));
		if (oFF.notNull(foundAuthType) && foundAuthType.isStructure())
		{
			var foundTmpAuthType = foundAuthType.asStructure();
			var tmpAuths = foundTmpAuthType.getStructureByKey("auth");
			return tmpAuths.getBooleanByKeyExt(privilege, false);
		}
	}
	return true;
};

oFF.SubSysCachePrg = function() {};
oFF.SubSysCachePrg.prototype = new oFF.DfProgramSubSys();
oFF.SubSysCachePrg.prototype._ff_c = "SubSysCachePrg";

oFF.SubSysCachePrg.DEFAULT_PROGRAM_NAME = "@SubSys.Cache";
oFF.SubSysCachePrg.prototype.m_cacheProvider = null;
oFF.SubSysCachePrg.prototype.m_isReady = false;
oFF.SubSysCachePrg.prototype.m_cacheType = null;
oFF.SubSysCachePrg.prototype.m_cacheSchema = null;
oFF.SubSysCachePrg.prototype.m_children = null;
oFF.SubSysCachePrg.prototype.m_systems = null;
oFF.SubSysCachePrg.prototype.newProgram = function()
{
	var prg = new oFF.SubSysCachePrg();
	prg.setup();
	return prg;
};
oFF.SubSysCachePrg.prototype.getProgramName = function()
{
	return oFF.SubSysCachePrg.DEFAULT_PROGRAM_NAME;
};
oFF.SubSysCachePrg.prototype.getSubSystemType = function()
{
	return oFF.SubSystemType.CACHE;
};
oFF.SubSysCachePrg.prototype.setup = function()
{
	oFF.DfProgramSubSys.prototype.setup.call( this );
	this.m_children = oFF.XHashMapByString.create();
	this.m_systems = oFF.XHashMapByString.create();
};
oFF.SubSysCachePrg.prototype.runProcess = function()
{
	var process = this.getProcess();
	var environment = process.getEnvironment();
	this.m_cacheType = environment.getStringByKeyExt(oFF.XEnvironmentConstants.FIREFLY_CACHE_TYPE, this.m_cacheType);
	var messages = oFF.MessageManager.createMessageManagerExt(process);
	if (oFF.XStringUtils.isNotNullAndNotEmpty(this.m_cacheType))
	{
		this.m_cacheSchema = environment.getStringByKeyExt(oFF.XEnvironmentConstants.FIREFLY_CACHE_SCHEMA, null);
		this.log2("Cache type used: ", this.m_cacheType);
		this.m_cacheProvider = oFF.XCacheProviderFactory.createDeviceCacheAccess(process, this.m_cacheType);
		if (oFF.notNull(this.m_cacheProvider))
		{
			var startupArguments = oFF.XProperties.create();
			var cachePath = environment.getVariable(oFF.XEnvironmentConstants.FIREFLY_CACHE);
			if (oFF.XStringUtils.isNotNullAndNotEmpty(cachePath))
			{
				startupArguments.putString(oFF.XCacheProviderFactory.PARAMETER_URL, cachePath);
				this.log2("Cache file directory: ", cachePath);
			}
			this.m_cacheProvider.processOpen(this.getDefaultSyncType(), this, null, startupArguments);
		}
		else
		{
			messages.addError(0, oFF.XStringUtils.concatenate2("Cannot create cache provider for type ", this.m_cacheType));
			this.activateSubSystem(messages, oFF.SubSystemStatus.INACTIVE);
		}
	}
	else
	{
		messages.addInfo(0, "No cache type is given. Use environment variable ff_cache_type to be idb, ls, file or memory");
		this.activateSubSystem(messages, oFF.SubSystemStatus.INACTIVE);
	}
	return false;
};
oFF.SubSysCachePrg.prototype.onCacheProviderOpen = function(extResult, cacheProvider, customIdentifier)
{
	if (extResult.isValid())
	{
		this.log("Success opening cache");
		this.m_isReady = true;
		this.activateSubSystem(extResult, oFF.SubSystemStatus.ACTIVE);
	}
	else
	{
		this.log2("Error opening cache: ", extResult.getSummary());
		this.activateSubSystem(extResult, oFF.SubSystemStatus.INACTIVE);
	}
};
oFF.SubSysCachePrg.prototype.getMainApi = function()
{
	var mainApi = null;
	if (this.m_isReady === true)
	{
		mainApi = this;
	}
	return mainApi;
};
oFF.SubSysCachePrg.prototype.getCacheProvider = function()
{
	return this.m_cacheProvider;
};
oFF.SubSysCachePrg.prototype.getSystemCache = function(systemName)
{
	var systemCache = null;
	if (oFF.notNull(this.m_cacheProvider))
	{
		if (oFF.XStringUtils.isNotNullAndNotEmpty(systemName))
		{
			systemCache = this.m_systems.getByKey(systemName);
			if (oFF.isNull(systemCache))
			{
				var rpcCache = this.getRpcCache();
				if (oFF.notNull(rpcCache))
				{
					systemCache = rpcCache.getSubCache(systemName);
					if (oFF.notNull(systemCache))
					{
						this.m_systems.put(systemName, systemCache);
					}
				}
			}
		}
	}
	return systemCache;
};
oFF.SubSysCachePrg.prototype.getRpcCache = function()
{
	return this.getSubCache("rpc");
};
oFF.SubSysCachePrg.prototype.getCacheType = function()
{
	return this.m_cacheType;
};
oFF.SubSysCachePrg.prototype.getSubCache = function(namespace)
{
	var cache = null;
	if (oFF.notNull(this.m_cacheProvider))
	{
		cache = this.m_children.getByKey(namespace);
		if (oFF.isNull(cache) && this.m_isReady)
		{
			cache = this.m_cacheProvider.getSubCache(namespace);
			this.m_children.put(namespace, cache);
			if (oFF.XString.isEqual("rpc", namespace))
			{
				if (oFF.XString.isEqual(this.m_cacheSchema, "rpc_read_write"))
				{
					cache.setEnabled(true);
					cache.setIsReadEnabled(true);
					cache.setIsWriteEnabled(true);
					cache.setMaxCount(100000);
					cache.setValidityTime(1000 * 60 * 60 * 24 * 7);
				}
				else if (oFF.XString.isEqual(this.m_cacheSchema, "rpc_read_write_metadata"))
				{
					cache.setEnabled(true);
					cache.setIsReadEnabled(true);
					cache.setIsWriteEnabled(true);
					cache.setMaxCount(100000);
					cache.setValidityTime(1000 * 60 * 60 * 24 * 7);
					cache.getIncludeFilter().add("Metadata");
				}
				else if (oFF.XString.isEqual(this.m_cacheSchema, "rpc_write"))
				{
					cache.setEnabled(true);
					cache.setIsReadEnabled(false);
					cache.setIsWriteEnabled(true);
					cache.setMaxCount(100000);
					cache.setValidityTime(1000 * 60 * 60 * 24 * 7);
				}
				else if (oFF.XString.isEqual(this.m_cacheSchema, "rpc_read"))
				{
					cache.setEnabled(true);
					cache.setIsReadEnabled(true);
					cache.setIsWriteEnabled(false);
					cache.setMaxCount(100000);
					cache.setValidityTime(1000 * 60 * 60 * 24 * 7);
				}
			}
		}
	}
	return cache;
};
oFF.SubSysCachePrg.prototype.supportsNameSpaceEnumeration = function()
{
	return true;
};
oFF.SubSysCachePrg.prototype.getNameSpaces = function()
{
	return this.m_children.getKeysAsReadOnlyListOfString();
};

oFF.XCacheProviderFileOpenAction = function() {};
oFF.XCacheProviderFileOpenAction.prototype = new oFF.SyncAction();
oFF.XCacheProviderFileOpenAction.prototype._ff_c = "XCacheProviderFileOpenAction";

oFF.XCacheProviderFileOpenAction.createAndRun = function(syncType, listener, customIdentifier, cacheProvider, properties)
{
	var object = new oFF.XCacheProviderFileOpenAction();
	object.m_properties = properties;
	object.setupActionAndRun(syncType, listener, customIdentifier, cacheProvider);
	return object;
};
oFF.XCacheProviderFileOpenAction.prototype.m_properties = null;
oFF.XCacheProviderFileOpenAction.prototype.processSynchronization = function(syncType)
{
	var provider = this.getActionContext();
	var deviceCacheDir = this.m_properties.getStringByKey(oFF.XCacheProviderFactory.PARAMETER_URL);
	if (oFF.XStringUtils.isNotNullAndNotEmpty(deviceCacheDir))
	{
		var dir = oFF.XFile.create(this.getProcess(), deviceCacheDir);
		if (dir.isExisting() === false)
		{
			dir.mkdirExt(true);
		}
		else if (dir.isDirectory() === false)
		{
			this.addError(0, oFF.XStringUtils.concatenate2("Directory for cache is existing and not a directory: ", deviceCacheDir));
			dir = null;
		}
		if (oFF.notNull(dir))
		{
			provider.setDirectory(dir);
		}
	}
	else
	{
		this.addError(0, "No parameter 'url' is given for the cache directory");
	}
	this.setData(this.getActionContext());
	return false;
};
oFF.XCacheProviderFileOpenAction.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onCacheProviderOpen(extResult, data, customIdentifier);
};
oFF.XCacheProviderFileOpenAction.prototype.getProcess = function()
{
	return this.getActionContext().getProcess();
};

oFF.BasicCredentialsAction = function() {};
oFF.BasicCredentialsAction.prototype = new oFF.SyncAction();
oFF.BasicCredentialsAction.prototype._ff_c = "BasicCredentialsAction";

oFF.BasicCredentialsAction.createAndRun = function(syncType, listener, customIdentifier, context, connection, rpcMessages, authType)
{
	var object = new oFF.BasicCredentialsAction();
	object.m_rpcMessages = rpcMessages;
	object.m_connection = connection;
	object.m_authType = authType;
	object.setupActionAndRun(syncType, listener, customIdentifier, context);
	return object;
};
oFF.BasicCredentialsAction.prototype.m_connection = null;
oFF.BasicCredentialsAction.prototype.m_rpcMessages = null;
oFF.BasicCredentialsAction.prototype.m_authType = null;
oFF.BasicCredentialsAction.prototype.releaseObject = function()
{
	this.m_connection = null;
	this.m_rpcMessages = null;
	oFF.SyncAction.prototype.releaseObject.call( this );
};
oFF.BasicCredentialsAction.prototype.processSynchronization = function(syncType)
{
	if (oFF.isNull(this.m_rpcMessages))
	{
		var systemDescription = this.m_connection.getSystemDescription();
		var personalization = this.getActionContext().newMergedPersonalization2(systemDescription);
		if (oFF.notNull(this.m_authType))
		{
			personalization.setAuthenticationType(this.m_authType);
		}
		if (personalization.getAuthenticationType().isSaml() && oFF.SamlUtils.isPopupSupported())
		{
			personalization.setAuthenticationType(oFF.AuthenticationType.NONE);
		}
		this.setData(personalization);
	}
	else
	{
		this.addAllMessages(this.m_rpcMessages);
	}
	return false;
};
oFF.BasicCredentialsAction.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onCredentialsReady(extResult, data, customIdentifier);
};

oFF.LiteCredentialsProviderAction = function() {};
oFF.LiteCredentialsProviderAction.prototype = new oFF.SyncAction();
oFF.LiteCredentialsProviderAction.prototype._ff_c = "LiteCredentialsProviderAction";

oFF.LiteCredentialsProviderAction.createAndRun = function(syncType, listener, customIdentifier, context, connection, rpcMessages, authType)
{
	var object = new oFF.LiteCredentialsProviderAction();
	object.m_rpcMessages = rpcMessages;
	object.m_connection = connection;
	object.m_authType = authType;
	object.setupActionAndRun(syncType, listener, customIdentifier, context);
	return object;
};
oFF.LiteCredentialsProviderAction.prototype.m_connection = null;
oFF.LiteCredentialsProviderAction.prototype.m_rpcMessages = null;
oFF.LiteCredentialsProviderAction.prototype.m_authType = null;
oFF.LiteCredentialsProviderAction.prototype.releaseObject = function()
{
	this.m_connection = null;
	this.m_rpcMessages = null;
	oFF.SyncAction.prototype.releaseObject.call( this );
};
oFF.LiteCredentialsProviderAction.prototype.processSynchronization = function(syncType)
{
	if (oFF.isNull(this.m_rpcMessages))
	{
		var systemDescription = this.m_connection.getSystemDescription();
		var personalization = this.getActionContext().newMergedPersonalization2(systemDescription);
		if (oFF.notNull(this.m_authType))
		{
			personalization.setAuthenticationType(this.m_authType);
		}
		this.setData(personalization);
	}
	else
	{
		this.addAllMessages(this.m_rpcMessages);
	}
	return false;
};
oFF.LiteCredentialsProviderAction.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onCredentialsReady(extResult, data, customIdentifier);
};

oFF.SubSysLiteCredentialsProviderPrg = function() {};
oFF.SubSysLiteCredentialsProviderPrg.prototype = new oFF.DfProgramSubSys();
oFF.SubSysLiteCredentialsProviderPrg.prototype._ff_c = "SubSysLiteCredentialsProviderPrg";

oFF.SubSysLiteCredentialsProviderPrg.DEFAULT_PROGRAM_NAME = "@SubSys.CredentialsProviderLite";
oFF.SubSysLiteCredentialsProviderPrg.prototype.newProgram = function()
{
	var newObj = new oFF.SubSysLiteCredentialsProviderPrg();
	newObj.setup();
	return newObj;
};
oFF.SubSysLiteCredentialsProviderPrg.prototype.runProcess = function()
{
	this.activateSubSystem(null, oFF.SubSystemStatus.ACTIVE);
	return true;
};
oFF.SubSysLiteCredentialsProviderPrg.prototype.getProgramName = function()
{
	return oFF.SubSysLiteCredentialsProviderPrg.DEFAULT_PROGRAM_NAME;
};
oFF.SubSysLiteCredentialsProviderPrg.prototype.getSubSystemType = function()
{
	return oFF.SubSystemType.CREDENTIALS_PROVIDER_LITE;
};
oFF.SubSysLiteCredentialsProviderPrg.prototype.getMainApi = function()
{
	return this;
};
oFF.SubSysLiteCredentialsProviderPrg.prototype.getAdminApi = function()
{
	return this;
};
oFF.SubSysLiteCredentialsProviderPrg.prototype.processGetCredentials = function(syncType, listener, customIdentifier, connection, credentialsCallCounter, response, messages, changedType)
{
	var process = this.getProcess();
	return oFF.LiteCredentialsProviderAction.createAndRun(syncType, listener, customIdentifier, process.getUserManager(), connection, messages, changedType);
};
oFF.SubSysLiteCredentialsProviderPrg.prototype.notifyCredentialsSuccess = function(connection) {};
oFF.SubSysLiteCredentialsProviderPrg.prototype.supportsOnErrorHandling = function()
{
	return false;
};

oFF.XFileSystemOSWrapper = function() {};
oFF.XFileSystemOSWrapper.prototype = new oFF.DfXFileSystem();
oFF.XFileSystemOSWrapper.prototype._ff_c = "XFileSystemOSWrapper";

oFF.XFileSystemOSWrapper.create = function(fsOS)
{
	var newObj = new oFF.XFileSystemOSWrapper();
	newObj.setupExt(fsOS);
	return newObj;
};
oFF.XFileSystemOSWrapper.prototype.m_fsOS = null;
oFF.XFileSystemOSWrapper.prototype.setupExt = function(fsOS)
{
	this.m_fsOS = fsOS;
};
oFF.XFileSystemOSWrapper.prototype.getWorkingDirectoryUri = function()
{
	return this.m_fsOS.getWorkingDirectoryUri();
};
oFF.XFileSystemOSWrapper.prototype.getNativeSlash = function()
{
	return this.m_fsOS.getNativeSlash();
};
oFF.XFileSystemOSWrapper.prototype.getProtocolType = function()
{
	return this.m_fsOS.getProtocolType();
};
oFF.XFileSystemOSWrapper.prototype.isDirectoryExt = function(file)
{
	var nativePath = file.getNativePath();
	return this.m_fsOS.isDirectory(nativePath);
};
oFF.XFileSystemOSWrapper.prototype.isFileExt = function(file)
{
	var nativePath = file.getNativePath();
	return this.m_fsOS.isFile(nativePath);
};
oFF.XFileSystemOSWrapper.prototype.isHiddenExt = function(file)
{
	var nativePath = file.getNativePath();
	return this.m_fsOS.isHidden(nativePath);
};
oFF.XFileSystemOSWrapper.prototype.isWriteableExt = function(file)
{
	var nativePath = file.getNativePath();
	return this.m_fsOS.isWriteable(nativePath);
};
oFF.XFileSystemOSWrapper.prototype.isReadableExt = function(file)
{
	var nativePath = file.getNativePath();
	return this.m_fsOS.isReadable(nativePath);
};
oFF.XFileSystemOSWrapper.prototype.isExistingExt = function(file)
{
	var nativePath = file.getNativePath();
	return this.m_fsOS.isExisting(nativePath);
};
oFF.XFileSystemOSWrapper.prototype.getSize = function(file)
{
	var nativePath = file.getNativePath();
	return this.m_fsOS.getSize(nativePath);
};
oFF.XFileSystemOSWrapper.prototype.getAttributes = function(file)
{
	var nativePath = file.getNativePath();
	return this.m_fsOS.getAttributes(nativePath);
};
oFF.XFileSystemOSWrapper.prototype.getLastModifiedTimestampExt = function(file)
{
	var nativePath = file.getNativePath();
	return this.m_fsOS.getLastModifiedTimestamp(nativePath);
};
oFF.XFileSystemOSWrapper.prototype.loadExt2 = function(file, compression)
{
	var content;
	if (compression === oFF.CompressionType.NONE)
	{
		content = this.m_fsOS.loadExt(file.getNativePath());
	}
	else
	{
		content = this.m_fsOS.loadGzipped(file.getNativePath());
	}
	file.setFileContent(content);
	file.addAllMessages(content.getMessageCollection());
};
oFF.XFileSystemOSWrapper.prototype.saveExt = function(file, content, compression)
{
	var msg;
	var byteArray = content.getByteArray();
	var nativePath = file.getNativePath();
	if (compression === oFF.CompressionType.NONE)
	{
		msg = this.m_fsOS.save(nativePath, byteArray);
	}
	else
	{
		msg = this.m_fsOS.saveGzipped(nativePath, byteArray);
	}
	file.addAllMessages(msg);
};
oFF.XFileSystemOSWrapper.prototype.deleteFileExt = function(file)
{
	var msg = this.m_fsOS.deleteFile(file.getNativePath());
	file.addAllMessages(msg);
};
oFF.XFileSystemOSWrapper.prototype.renameToExt = function(file, targetFile)
{
	return this.m_fsOS.renameTo(file.getNativePath(), targetFile.getNativePath());
};
oFF.XFileSystemOSWrapper.prototype.mkdirExt = function(file, includeParentDirs)
{
	var messages;
	if (includeParentDirs === true)
	{
		messages = this.m_fsOS.mkdirs(file.getNativePath());
	}
	else
	{
		messages = this.m_fsOS.mkdir(file.getNativePath());
	}
	file.addAllMessages(messages);
};
oFF.XFileSystemOSWrapper.prototype.setWritableExt = function(file, writable, ownerOnly)
{
	var nativePath = file.getNativePath();
	return this.m_fsOS.setWritable(nativePath, writable, ownerOnly);
};
oFF.XFileSystemOSWrapper.prototype.getChildrenMetadata = function(file)
{
	var children = oFF.XList.create();
	var nativePath = file.getNativePath();
	var absoluteNativePathList = this.m_fsOS.getChildren(nativePath);
	var nativeSlash = this.m_fsOS.getNativeSlash();
	var currentName;
	for (var i = 0; i < absoluteNativePathList.size(); i++)
	{
		var currentPath = absoluteNativePathList.get(i);
		var index = oFF.XString.lastIndexOf(currentPath, nativeSlash);
		if (index === oFF.XString.size(currentPath) - 1)
		{
			var noEndSlash = oFF.XString.substring(currentPath, 0, index);
			currentName = oFF.XStringUtils.concatenate2(noEndSlash, "/");
		}
		else
		{
			currentName = oFF.XString.substring(currentPath, index + 1, -1);
		}
		var metadata = oFF.PrFactory.createStructure();
		metadata.putString(oFF.XFileAttribute.NAME.getName(), currentName);
		metadata.putString(oFF.XFileAttribute.DISPLAY_NAME.getName(), currentName);
		metadata.putString(oFF.XFileAttribute.DESCRIPTION.getName(), currentName);
		metadata.putBoolean(oFF.XFileAttribute.IS_EXISTING.getName(), true);
		var isDir = this.m_fsOS.isDirectory(currentPath);
		metadata.putBoolean(oFF.XFileAttribute.IS_DIRECTORY.getName(), isDir);
		metadata.putBoolean(oFF.XFileAttribute.IS_FILE.getName(), !isDir);
		var fileType;
		if (isDir)
		{
			fileType = oFF.XFileType.DIR;
		}
		else
		{
			fileType = oFF.XFileType.FILE;
		}
		metadata.putString(oFF.XFileAttribute.FILE_TYPE.getName(), fileType.getName());
		var isHidden = this.m_fsOS.isHidden(currentPath);
		metadata.putBoolean(oFF.XFileAttribute.IS_HIDDEN.getName(), isHidden);
		var isExecutable = this.m_fsOS.isExecutable(currentPath);
		metadata.putBoolean(oFF.XFileAttribute.IS_EXECUTABLE.getName(), isExecutable);
		var isWriteable = this.m_fsOS.isWriteable(currentPath);
		metadata.putBoolean(oFF.XFileAttribute.IS_WRITEABLE.getName(), isWriteable);
		var isReadable = this.m_fsOS.isReadable(currentPath);
		metadata.putBoolean(oFF.XFileAttribute.IS_READABLE.getName(), isReadable);
		var changedAt = this.m_fsOS.getLastModifiedTimestamp(currentPath);
		metadata.putLong(oFF.XFileAttribute.CHANGED_AT.getName(), changedAt);
		var size = this.m_fsOS.getSize(currentPath);
		metadata.putLong(oFF.XFileAttribute.SIZE.getName(), size);
		children.add(metadata);
	}
	return children;
};
oFF.XFileSystemOSWrapper.prototype.getChildrenExt = function(file)
{
	var nativePath = file.getNativePath();
	var absoluteNativePathList = this.m_fsOS.getChildren(nativePath);
	var childNameList = oFF.XListOfString.create();
	var nativeSlash = this.m_fsOS.getNativeSlash();
	var currentName;
	for (var i = 0; i < absoluteNativePathList.size(); i++)
	{
		var currentPath = absoluteNativePathList.get(i);
		var index = oFF.XString.lastIndexOf(currentPath, nativeSlash);
		if (index === oFF.XString.size(currentPath) - 1)
		{
			var noEndSlash = oFF.XString.substring(currentPath, 0, index);
			currentName = oFF.XStringUtils.concatenate2(noEndSlash, "/");
		}
		else
		{
			currentName = oFF.XString.substring(currentPath, index + 1, -1);
		}
		childNameList.add(currentName);
	}
	return childNameList;
};

oFF.DfXFileProvider = function() {};
oFF.DfXFileProvider.prototype = new oFF.MessageManager();
oFF.DfXFileProvider.prototype._ff_c = "DfXFileProvider";

oFF.DfXFileProvider.prototype.m_uri = null;
oFF.DfXFileProvider.prototype.m_fs = null;
oFF.DfXFileProvider.prototype.m_fileContent = null;
oFF.DfXFileProvider.prototype.m_metadata = null;
oFF.DfXFileProvider.prototype.m_isExisting = false;
oFF.DfXFileProvider.prototype.m_resultset = null;
oFF.DfXFileProvider.prototype.m_childMetadata = null;
oFF.DfXFileProvider.prototype.setupFile = function(process, fs, uri)
{
	oFF.XObjectExt.assertNotNullExt(process, "No process object given");
	this.setupSessionContext(process);
	this.m_fs = fs;
	this.m_uri = uri;
};
oFF.DfXFileProvider.prototype.releaseObject = function()
{
	this.m_fs = null;
	this.m_uri = null;
	this.m_fileContent = null;
	this.m_metadata = null;
	this.m_resultset = null;
	this.m_childMetadata = null;
	oFF.MessageManager.prototype.releaseObject.call( this );
};
oFF.DfXFileProvider.prototype.getProcess = function()
{
	return this.getSession();
};
oFF.DfXFileProvider.prototype.getContentElement = function()
{
	return this;
};
oFF.DfXFileProvider.prototype.getComponentType = function()
{
	return oFF.IoComponentType.FILE;
};
oFF.DfXFileProvider.prototype.getFileSystem = function()
{
	return this.m_fs;
};
oFF.DfXFileProvider.prototype.writeDebugMessage = function(message)
{
	if (oFF.XFile.DEBUG_MODE)
	{
		if (this.getUrl() !== null)
		{
			this.log4("XFile: ", message, " ", this.getUrl());
		}
		else
		{
			this.log2("XFile: ", message);
		}
	}
};
oFF.DfXFileProvider.prototype.clearCache = function()
{
	this.m_isExisting = false;
	this.m_fileContent = null;
};
oFF.DfXFileProvider.prototype.getUri = function()
{
	return this.m_uri;
};
oFF.DfXFileProvider.prototype.setUri = function(uri)
{
	this.m_uri = uri;
};
oFF.DfXFileProvider.prototype.getUrl = function()
{
	if (this.hasValidUri())
	{
		return this.getUri().getUrl();
	}
	else
	{
		return null;
	}
};
oFF.DfXFileProvider.prototype.getProtocolType = function()
{
	if (this.hasValidUri())
	{
		return this.getUri().getProtocolType();
	}
	else
	{
		return null;
	}
};
oFF.DfXFileProvider.prototype.hasValidUri = function()
{
	var uri = this.getUri();
	return oFF.notNull(uri) && uri.isUriResolved();
};
oFF.DfXFileProvider.prototype.getText = function()
{
	return this.getName();
};
oFF.DfXFileProvider.prototype.getName = function()
{
	var name = null;
	if (this.hasValidUri())
	{
		var uri = this.getUri();
		name = uri.getPathContainer().getFileName();
	}
	return name;
};
oFF.DfXFileProvider.prototype.getTargetUriPath = function()
{
	return this.getTargetUri().getPath();
};
oFF.DfXFileProvider.prototype.getTargetUri = function()
{
	return this.getUri();
};
oFF.DfXFileProvider.prototype.getNativePath = function()
{
	return this.getUri().getPath();
};
oFF.DfXFileProvider.prototype.saveByteArray = function(data)
{
	var content = oFF.XContent.createByteArrayContent(oFF.ContentType.BINARY, data);
	this.saveExt(content, oFF.CompressionType.NONE);
};
oFF.DfXFileProvider.prototype.saveByteArrayGzipped = function(data)
{
	var content = oFF.XContent.createByteArrayContent(oFF.ContentType.BINARY, data);
	this.saveExt(content, oFF.CompressionType.GZIP);
};
oFF.DfXFileProvider.prototype.setWritable = oFF.noSupport;
oFF.DfXFileProvider.prototype.processSave = oFF.noSupport;
oFF.DfXFileProvider.prototype.processLoad = oFF.noSupport;
oFF.DfXFileProvider.prototype.loadAsByteArray = function()
{
	var content = this.loadExt(oFF.CompressionType.NONE);
	return content.getByteArray();
};
oFF.DfXFileProvider.prototype.load = function()
{
	return this.loadExt(oFF.CompressionType.NONE);
};
oFF.DfXFileProvider.prototype.loadGzipped = function()
{
	return this.loadExt(oFF.CompressionType.GZIP);
};
oFF.DfXFileProvider.prototype.isReadable = function()
{
	return false;
};
oFF.DfXFileProvider.prototype.setFileContent = function(fileContent)
{
	this.m_fileContent = fileContent;
};
oFF.DfXFileProvider.prototype.getFileContent = function()
{
	return this.m_fileContent;
};
oFF.DfXFileProvider.prototype.getContentConstant = function()
{
	return null;
};
oFF.DfXFileProvider.prototype.processExecute = oFF.noSupport;
oFF.DfXFileProvider.prototype.deleteRecursive = function()
{
	this.deleteChildren();
	if (this.isExisting())
	{
		this.deleteFile();
	}
};
oFF.DfXFileProvider.prototype.deleteChildren = function()
{
	if (this.isDirectory())
	{
		var children = this.getChildren();
		for (var i = 0; i < children.size(); i++)
		{
			var child = children.get(i);
			child.deleteRecursive();
		}
	}
};
oFF.DfXFileProvider.prototype.supportsRenameTo = function()
{
	return false;
};
oFF.DfXFileProvider.prototype.rename = function(dest)
{
	var uri = this.getUri();
	var targetUri = oFF.XUri.createFromParentUriAndRelativeUrl(uri, dest, true);
	var destFile = oFF.XFile.createByUri(this.getProcess(), targetUri);
	return this.renameTo(destFile);
};
oFF.DfXFileProvider.prototype.processRenameExt = oFF.noSupport;
oFF.DfXFileProvider.prototype.mkdir = function()
{
	this.mkdirExt(false);
};
oFF.DfXFileProvider.prototype.mkdirs = function()
{
	this.mkdirExt(true);
};
oFF.DfXFileProvider.prototype.processMkdir = oFF.noSupport;
oFF.DfXFileProvider.prototype.processFetchChildren = oFF.noSupport;
oFF.DfXFileProvider.prototype.getChildElements = function()
{
	var children = this.getChildren();
	return oFF.XReadOnlyListWrapper.create(children);
};
oFF.DfXFileProvider.prototype.setChildMetadata = function(childrenMetadata, totalItemCount)
{
	this.m_childMetadata = childrenMetadata;
	var fileList = oFF.XList.create();
	var childNames = oFF.XListOfString.create();
	var uri = this.getUri();
	var childFile;
	var childName;
	var childMetadata;
	var childUri;
	var size = this.m_childMetadata.size();
	for (var i = 0; i < size; i++)
	{
		childMetadata = this.m_childMetadata.get(i);
		childName = childMetadata.getStringByKey(oFF.XFileAttribute.NAME.getName());
		if (oFF.isNull(childName))
		{
			childName = childMetadata.getStringByKey("name");
		}
		childNames.add(childName);
		childUri = oFF.XUri.createChildFile(uri, childName);
		childFile = this.newChildFile(childUri, childMetadata);
		fileList.add(childFile);
	}
	this.m_resultset = oFF.XFileChildrenResultset.create(fileList, totalItemCount);
};
oFF.DfXFileProvider.prototype.setChildNames = function(childNames, totalItemCount)
{
	var fileList = oFF.XList.create();
	var uri = this.getUri();
	var childFile;
	var childName;
	var childUri;
	var size = childNames.size();
	for (var i = 0; i < size; i++)
	{
		childName = childNames.get(i);
		childUri = oFF.XUri.createChildFile(uri, childName);
		childFile = this.newChildFile(childUri, null);
		fileList.add(childFile);
	}
	this.m_resultset = oFF.XFileChildrenResultset.create(fileList, totalItemCount);
};
oFF.DfXFileProvider.prototype.newChildFile = function(childUri, childMetadata)
{
	var process = this.getProcess();
	return oFF.XFile.createByUri(process, childUri);
};
oFF.DfXFileProvider.prototype.setChildFiles = function(childFiles, totalItemCount)
{
	var childNames = oFF.XListOfString.create();
	var size = childFiles.size();
	var currentFile;
	for (var i = 0; i < size; i++)
	{
		currentFile = childFiles.get(i);
		childNames.add(currentFile.getName());
	}
	this.m_resultset = oFF.XFileChildrenResultset.create(childFiles, totalItemCount);
};
oFF.DfXFileProvider.prototype.getCachedChildFiles = function()
{
	return oFF.isNull(this.m_resultset) ? null : this.m_resultset.getChildFiles();
};
oFF.DfXFileProvider.prototype.getCachedChildrenResultset = function()
{
	return this.m_resultset;
};
oFF.DfXFileProvider.prototype.getChildSetState = function()
{
	if (this.getCachedChildFiles() === null)
	{
		return oFF.ChildSetState.INITIAL;
	}
	else
	{
		return oFF.ChildSetState.COMPLETE;
	}
};
oFF.DfXFileProvider.prototype.hasChildren = function()
{
	return false;
};
oFF.DfXFileProvider.prototype.getLastModifiedTimestamp = oFF.noSupport;
oFF.DfXFileProvider.prototype.isLeaf = function()
{
	return !this.isNode();
};
oFF.DfXFileProvider.prototype.isNode = function()
{
	return this.isDirectory();
};
oFF.DfXFileProvider.prototype.isWriteable = function()
{
	return false;
};
oFF.DfXFileProvider.prototype.isExecutable = function()
{
	return false;
};
oFF.DfXFileProvider.prototype.supportsSetLastModified = function()
{
	return false;
};
oFF.DfXFileProvider.prototype.isFile = function()
{
	return !this.isDirectory();
};
oFF.DfXFileProvider.prototype.isDirectory = oFF.noSupport;
oFF.DfXFileProvider.prototype.isExisting = function()
{
	return false;
};
oFF.DfXFileProvider.prototype.isHidden = function()
{
	return false;
};
oFF.DfXFileProvider.prototype.getSize = oFF.noSupport;
oFF.DfXFileProvider.prototype.supportsSize = function()
{
	return false;
};
oFF.DfXFileProvider.prototype.getAttributes = function()
{
	return oFF.PrFactory.createStructure();
};
oFF.DfXFileProvider.prototype.getFileType = function()
{
	if (this.isDirectory())
	{
		return oFF.XFileType.DIR;
	}
	else
	{
		return oFF.XFileType.FILE;
	}
};
oFF.DfXFileProvider.prototype.getTagValue = function(tagName)
{
	return null;
};
oFF.DfXFileProvider.prototype.processFetchMetadata = oFF.noSupport;
oFF.DfXFileProvider.prototype.processProviderFetchMetadata = function(syncType, listener, customIdentifier)
{
	return oFF.XFileActionFetchMetadata.createAndRun(syncType, listener, customIdentifier, this.getFileSystem(), this);
};
oFF.DfXFileProvider.prototype.getCachedMetadata = function()
{
	return this.m_metadata;
};
oFF.DfXFileProvider.prototype.setMetadata = function(metadata)
{
	this.m_metadata = metadata;
};
oFF.DfXFileProvider.prototype.setMetadataFromProperties = function()
{
	var metadata = oFF.PrFactory.createStructure();
	var isExisting = this.isExisting();
	metadata.putBoolean(oFF.XFileAttribute.IS_EXISTING.getName(), isExisting);
	var fileType = this.getFileType();
	metadata.putString(oFF.XFileAttribute.FILE_TYPE.getName(), fileType.getName());
	var targetUri = this.getTargetUri();
	if (oFF.notNull(targetUri) && targetUri.isUriResolved())
	{
		metadata.putString(oFF.XFileAttribute.TARGET_URL.getName(), targetUri.getUrl());
	}
	if (isExisting === true)
	{
		var attributes = this.getAttributes();
		if (oFF.notNull(attributes))
		{
			metadata.putAll(attributes);
		}
		metadata.putString(oFF.XFileAttribute.DISPLAY_NAME.getName(), this.getDisplayName());
		metadata.putString(oFF.XFileAttribute.DESCRIPTION.getName(), this.getDescription());
		metadata.putBoolean(oFF.XFileAttribute.IS_DIRECTORY.getName(), this.isDirectory());
		metadata.putBoolean(oFF.XFileAttribute.IS_FILE.getName(), this.isFile());
		metadata.putBoolean(oFF.XFileAttribute.IS_HIDDEN.getName(), this.isHidden());
		metadata.putBoolean(oFF.XFileAttribute.IS_EXECUTABLE.getName(), this.isExecutable());
		metadata.putBoolean(oFF.XFileAttribute.IS_READABLE.getName(), this.isReadable());
		metadata.putBoolean(oFF.XFileAttribute.IS_WRITEABLE.getName(), this.isWriteable());
		metadata.putLong(oFF.XFileAttribute.CHANGED_AT.getName(), this.getLastModifiedTimestamp());
	}
	this.setMetadata(metadata);
};
oFF.DfXFileProvider.prototype.getDescription = function()
{
	return this.getText();
};
oFF.DfXFileProvider.prototype.getDisplayName = function()
{
	return this.getName();
};
oFF.DfXFileProvider.prototype.getFileTypeMd = function()
{
	return this.getFileType();
};
oFF.DfXFileProvider.prototype.isExistingMd = function()
{
	return this.isExisting();
};
oFF.DfXFileProvider.prototype.isDirectoryMd = function()
{
	return this.isDirectory();
};
oFF.DfXFileProvider.prototype.isMetadataLoaded = function()
{
	return this.getCachedMetadata() !== null;
};
oFF.DfXFileProvider.prototype.processIsExisting = oFF.noSupport;
oFF.DfXFileProvider.prototype.isBlockingMetadataCallFallback = function()
{
	return false;
};
oFF.DfXFileProvider.prototype.getCachedIsExisting = function()
{
	return this.m_isExisting;
};
oFF.DfXFileProvider.prototype.setIsExisting = function(isExisting)
{
	this.m_isExisting = isExisting;
};
oFF.DfXFileProvider.prototype.getParent = function()
{
	var parentFile = null;
	if (this.hasValidUri())
	{
		oFF.XObjectExt.assertTrue(this.hasValidUri());
		var uri = this.getUri();
		var parentUri = oFF.XUri.createParent(uri);
		if (oFF.notNull(parentUri))
		{
			parentFile = oFF.XFile.createByUri(this.getProcess(), parentUri);
		}
	}
	return parentFile;
};
oFF.DfXFileProvider.prototype.newChild = function(relativePath)
{
	var childFile = null;
	if (this.hasValidUri())
	{
		var uri = this.getUri();
		var childUri = oFF.XUri.createChild(uri, relativePath);
		childFile = oFF.XFile.createByUri(this.getProcess(), childUri);
	}
	return childFile;
};
oFF.DfXFileProvider.prototype.newSibling = function(name)
{
	var siblingFile = null;
	if (this.hasValidUri())
	{
		var uri = this.getUri();
		var newTarget = oFF.XUri.createSibling(uri, name);
		siblingFile = oFF.XFile.createByUri(this.getProcess(), newTarget);
	}
	return siblingFile;
};
oFF.DfXFileProvider.prototype.newRootDirectoryFile = function()
{
	var uri = this.getRootDirectoryUri();
	var file = oFF.XFile.createByUri(this.getProcess(), uri);
	return file;
};
oFF.DfXFileProvider.prototype.getRootDirectoryUri = function()
{
	var uri = null;
	if (this.hasValidUri() === true)
	{
		var theUri = this.getUri();
		var newUri = oFF.XUri.createFromOther(theUri);
		newUri.setPath("/");
		uri = newUri;
	}
	return uri;
};
oFF.DfXFileProvider.prototype.newFileQuery = oFF.noSupport;
oFF.DfXFileProvider.prototype.setIsBlockingMetadataCallFallback = oFF.noSupport;
oFF.DfXFileProvider.prototype.compareTo = function(objectToCompare)
{
	var other = objectToCompare;
	var otherName = other.getUrl();
	var myName = this.getUrl();
	return oFF.XString.compare(myName, otherName);
};
oFF.DfXFileProvider.prototype.toString = function()
{
	var result = "[null]";
	if (this.hasValidUri())
	{
		result = this.getUri().toString();
	}
	return result;
};

oFF.PrgFileSystem = function() {};
oFF.PrgFileSystem.prototype = new oFF.DfXFileSystem();
oFF.PrgFileSystem.prototype._ff_c = "PrgFileSystem";

oFF.PrgFileSystem.create = function(process)
{
	var newObj = new oFF.PrgFileSystem();
	newObj.setupProcessContext(process);
	return newObj;
};
oFF.PrgFileSystem.prototype.getProtocolType = function()
{
	return oFF.ProtocolType.PRG;
};
oFF.PrgFileSystem.prototype.isExecutableExt = function(file)
{
	return this.isExistingExt(file) && this.isDirectoryExt(file) === false;
};
oFF.PrgFileSystem.prototype.getFileType = function(file)
{
	if (this.isExecutableExt(file))
	{
		return oFF.XFileType.PRG;
	}
	else
	{
		return oFF.DfXFileSystem.prototype.getFileType.call( this , file);
	}
};
oFF.PrgFileSystem.prototype.isExistingExt = function(file)
{
	var targetPath = file.getTargetUriPath();
	if (oFF.XString.isEqual(targetPath, "/"))
	{
		return true;
	}
	else
	{
		var prgName = this.getPrgName(targetPath);
		var programManifest = this.getProcess().getKernel().getProgramManifest(prgName);
		return oFF.notNull(programManifest);
	}
};
oFF.PrgFileSystem.prototype.getLastModifiedTimestampExt = function(file)
{
	return 0;
};
oFF.PrgFileSystem.prototype.getPrgName = function(nativePath)
{
	var pathElements = oFF.XStringTokenizer.splitString(nativePath, "/");
	return pathElements.get(1);
};
oFF.PrgFileSystem.prototype.isFileExt = function(file)
{
	return !this.isDirectoryExt(file);
};
oFF.PrgFileSystem.prototype.isDirectoryExt = function(file)
{
	var targetPath = file.getTargetUriPath();
	return oFF.XString.isEqual(targetPath, "/");
};
oFF.PrgFileSystem.prototype.getChildrenExt = function(file)
{
	var targetPath = file.getTargetUriPath();
	var children = null;
	if (oFF.XString.isEqual(targetPath, "/"))
	{
		var allEntries = oFF.ProgramRegistration.getAllExecutableEntries(this.getProcess());
		var allEntriesIterator = allEntries.getIterator();
		var filteredManifests = oFF.XHashMapByString.create();
		while (allEntriesIterator.hasNext())
		{
			var manifest = allEntriesIterator.next();
			if (manifest.getCategory() !== oFF.ProgramCategory.SUB_SYSTEM)
			{
				filteredManifests.put(manifest.getName(), manifest);
			}
		}
		children = filteredManifests.getKeysAsReadOnlyListOfString();
	}
	return children;
};
oFF.PrgFileSystem.prototype.processExecute = function(syncType, listener, customIdentifier, file)
{
	var nativePath = file.getNativePath();
	var uri = file.getUri();
	var prgName = this.getPrgName(nativePath);
	var process = this.getSession();
	var startCfg = oFF.ProgramStartCfg.create(process, prgName, null, null);
	var argStructure = oFF.PrFactory.createStructure();
	var queryMap = uri.getQueryMap();
	var keys = queryMap.getKeysAsIteratorOfString();
	while (keys.hasNext())
	{
		var key = keys.next();
		var value = queryMap.getByKey(key);
		argStructure.putString(key, value);
	}
	var argObj = oFF.ProgramArgs.createWithStructure(argStructure);
	startCfg.setArguments(argObj);
	var syncAction = startCfg.processExecution(oFF.SyncType.BLOCKING, null, null);
	var fileContent = oFF.XFileContent.createFileContent();
	var program = syncAction.getData();
	var exitContent = program.getProgramContainer().getExitContent();
	var action = oFF.PrgExecuteAction.create(process, file);
	if (oFF.notNull(exitContent))
	{
		fileContent.setFromContent(exitContent);
		file.setFileContent(fileContent);
	}
	else
	{
		action.addError(oFF.ErrorCodes.INVALID_STATE, oFF.XStringUtils.concatenate2("Execution failed", prgName));
	}
	return action;
};

oFF.DfSubSysFilesystem = function() {};
oFF.DfSubSysFilesystem.prototype = new oFF.DfProgramSubSys();
oFF.DfSubSysFilesystem.prototype._ff_c = "DfSubSysFilesystem";

oFF.DfSubSysFilesystem.prototype.getSubSystemType = function()
{
	return oFF.SubSystemType.FILE_SYSTEM;
};
oFF.DfSubSysFilesystem.prototype.getSubSystemSelector = function()
{
	return this.getProtocolType().getName();
};
oFF.DfSubSysFilesystem.prototype.getAllAvailableFileSystems = function()
{
	var names = oFF.XListOfNameObject.create();
	names.add(this.getProtocolType());
	return names;
};
oFF.DfSubSysFilesystem.prototype.getAllInitializedFileSystems = function()
{
	var map = oFF.XHashMapByString.create();
	var protocolType = this.getProtocolType();
	var fs = this.getFileSystem(protocolType);
	map.put(oFF.XStringUtils.concatenate2(protocolType.getName(), ":"), fs);
	return map;
};
oFF.DfSubSysFilesystem.prototype.getFileSystemByUri = function(uri)
{
	return this.getFileSystem(uri.getProtocolType());
};
oFF.DfSubSysFilesystem.prototype.getMainApi = function()
{
	return this;
};
oFF.DfSubSysFilesystem.prototype.processFetchFileSystem = function(syncType, listener, customIdentifier, uri)
{
	return oFF.XFsSubSysActionFetchFilesystem.createAndRun(syncType, listener, customIdentifier, this, uri);
};

oFF.VfsMatchResultType = function() {};
oFF.VfsMatchResultType.prototype = new oFF.XConstantWithParent();
oFF.VfsMatchResultType.prototype._ff_c = "VfsMatchResultType";

oFF.VfsMatchResultType.ERROR = null;
oFF.VfsMatchResultType.BEYOND = null;
oFF.VfsMatchResultType.EXACT = null;
oFF.VfsMatchResultType.NOT_EXISTENT = null;
oFF.VfsMatchResultType.staticSetup = function()
{
	oFF.VfsMatchResultType.ERROR = oFF.VfsMatchResultType.create("Error", null);
	oFF.VfsMatchResultType.EXACT = oFF.VfsMatchResultType.create("Exact", null);
	oFF.VfsMatchResultType.BEYOND = oFF.VfsMatchResultType.create("Beyond", null);
	oFF.VfsMatchResultType.NOT_EXISTENT = oFF.VfsMatchResultType.create("NotExistent", null);
};
oFF.VfsMatchResultType.create = function(name, parent)
{
	var newObj = oFF.XConstant.setupName(new oFF.VfsMatchResultType(), name);
	newObj.setParent(parent);
	return newObj;
};

oFF.VfsElementDir = function() {};
oFF.VfsElementDir.prototype = new oFF.VfsElementNode();
oFF.VfsElementDir.prototype._ff_c = "VfsElementDir";

oFF.VfsElementDir.createDir = function(vfs, name, attributes)
{
	var newObj = new oFF.VfsElementDir();
	newObj.setupElement(vfs, name, attributes);
	return newObj;
};
oFF.VfsElementDir.prototype.m_children = null;
oFF.VfsElementDir.prototype.setupElement = function(vfs, name, attributes)
{
	oFF.VfsElementNode.prototype.setupElement.call( this , vfs, name, attributes);
	this.m_children = oFF.XHashMapByString.create();
};
oFF.VfsElementDir.prototype.getComponentType = function()
{
	return oFF.VfsElementType.DIR;
};
oFF.VfsElementDir.prototype.setChild = function(childElement)
{
	childElement.setParent(this);
	this.m_children.put(childElement.getName(), childElement);
};
oFF.VfsElementDir.prototype.getChild = function(name)
{
	return this.m_children.getByKey(name);
};
oFF.VfsElementDir.prototype.isNode = function()
{
	return true;
};
oFF.VfsElementDir.prototype.getChildNames = function()
{
	return this.m_children.getKeysAsReadOnlyListOfString();
};
oFF.VfsElementDir.prototype.getChildMetadata = function()
{
	var mdList = oFF.XList.create();
	var names = this.m_children.getKeysAsReadOnlyListOfString();
	for (var i = 0; i < names.size(); i++)
	{
		var name = names.get(i);
		var element = this.m_children.getByKey(name);
		var metadata = element.getMetadata();
		mdList.add(metadata);
	}
	return mdList;
};
oFF.VfsElementDir.prototype.getChildElements = function()
{
	var elementList = oFF.XList.create();
	var names = this.m_children.getKeysAsReadOnlyListOfString();
	for (var i = 0; i < names.size(); i++)
	{
		var name = names.get(i);
		var element = this.m_children.getByKey(name);
		elementList.add(element);
	}
	return elementList;
};
oFF.VfsElementDir.prototype.isExisting = function(name)
{
	return this.m_children.containsKey(name);
};
oFF.VfsElementDir.prototype.removeChild = function(name)
{
	this.m_children.remove(name);
};

oFF.VfsElementMountPoint = function() {};
oFF.VfsElementMountPoint.prototype = new oFF.VfsElementNode();
oFF.VfsElementMountPoint.prototype._ff_c = "VfsElementMountPoint";

oFF.VfsElementMountPoint.createWithUrl = function(targetUrl)
{
	var target = oFF.XUri.createFromUrl(targetUrl);
	return oFF.VfsElementMountPoint.createWithUri(target);
};
oFF.VfsElementMountPoint.createWithUri = function(target)
{
	var newObj = new oFF.VfsElementMountPoint();
	newObj.setupMountPointLeaf(target);
	return newObj;
};
oFF.VfsElementMountPoint.prototype.m_parentPath = null;
oFF.VfsElementMountPoint.prototype.m_target = null;
oFF.VfsElementMountPoint.prototype.setupMountPointLeaf = function(target)
{
	oFF.VfsElementNode.prototype.setupElement.call( this , null, null, null);
	if (target.getProtocolType() === oFF.ProtocolType.VFS)
	{
		throw oFF.XException.createIllegalArgumentException(oFF.XStringUtils.concatenate2("Vfs target not yet supported: ", target.getUrl()));
	}
	else
	{
		if (target.getPath() === null)
		{
			throw oFF.XException.createIllegalArgumentException(oFF.XStringUtils.concatenate2("Mounting path not existing: ", target.getUrl()));
		}
		else
		{
			if (target.getProtocolType() === oFF.ProtocolType.HTTP)
			{
				var httpToRemote = oFF.XUri.createFromOther(target);
				httpToRemote.setProtocolType(oFF.ProtocolType.REMOTE_WEB);
				this.m_target = httpToRemote;
			}
			else if (target.getProtocolType() === oFF.ProtocolType.HTTPS)
			{
				var httpToRemoteSecure = oFF.XUri.createFromOther(target);
				httpToRemoteSecure.setProtocolType(oFF.ProtocolType.REMOTE_WEB_SECURE);
				this.m_target = httpToRemoteSecure;
			}
			else
			{
				this.m_target = target;
			}
		}
	}
};
oFF.VfsElementMountPoint.prototype.getComponentType = function()
{
	return oFF.VfsElementType.MOUNT_POINT;
};
oFF.VfsElementMountPoint.prototype.setParentPath = function(path)
{
	this.m_parentPath = path;
};
oFF.VfsElementMountPoint.prototype.getParentPath = function()
{
	return this.m_parentPath;
};
oFF.VfsElementMountPoint.prototype.calculateTargetUri = function(vfsUri)
{
	var path = vfsUri.getPath();
	var pathOffset = this.getPathOffset();
	var targetUri;
	if (oFF.XString.size(path) <= pathOffset)
	{
		targetUri = oFF.XUri.createFromOther(this.m_target);
	}
	else
	{
		var relativePath = oFF.XString.substring(path, pathOffset, -1);
		targetUri = oFF.XUri.createChild(this.m_target, relativePath);
	}
	targetUri.setQuery(vfsUri.getQuery());
	return targetUri;
};
oFF.VfsElementMountPoint.prototype.isNode = function()
{
	return false;
};
oFF.VfsElementMountPoint.prototype.isExisting = oFF.noSupport;
oFF.VfsElementMountPoint.prototype.getChild = function(name)
{
	return null;
};
oFF.VfsElementMountPoint.prototype.setName = function(name)
{
	this.m_name = name;
};
oFF.VfsElementMountPoint.prototype.getTargetUri = function()
{
	return this.m_target;
};

oFF.XFileHandle = function() {};
oFF.XFileHandle.prototype = new oFF.MessageManager();
oFF.XFileHandle.prototype._ff_c = "XFileHandle";

oFF.XFileHandle.createByPath = function(process, path, pathFormat, varResolveMode, defaultProtocolType, blockingMetadataCallFallback)
{
	var newObj = new oFF.XFileHandle();
	newObj.setupFile(process, false, null, path, pathFormat, varResolveMode, defaultProtocolType, null, blockingMetadataCallFallback);
	return newObj;
};
oFF.XFileHandle.createByUri = function(process, uri, blockingMetadataCallFallback)
{
	var newObj = new oFF.XFileHandle();
	newObj.setupFile(process, true, uri, null, null, null, null, null, blockingMetadataCallFallback);
	return newObj;
};
oFF.XFileHandle.createByTarget = function(process, uri, targetFile, blockingMetadataCallFallback)
{
	var newObj = new oFF.XFileHandle();
	newObj.setupFile(process, true, uri, null, null, null, null, targetFile, blockingMetadataCallFallback);
	return newObj;
};
oFF.XFileHandle.prototype.m_uri = null;
oFF.XFileHandle.prototype.m_target = null;
oFF.XFileHandle.prototype.m_isOriginUri = false;
oFF.XFileHandle.prototype.m_path = null;
oFF.XFileHandle.prototype.m_pathFormat = null;
oFF.XFileHandle.prototype.m_varResolveMode = null;
oFF.XFileHandle.prototype.m_defaultProtocolType = null;
oFF.XFileHandle.prototype.m_cachedMetadata = null;
oFF.XFileHandle.prototype.m_blockingMetadataCallFallback = false;
oFF.XFileHandle.prototype.m_resultset = null;
oFF.XFileHandle.prototype.m_isExisting = false;
oFF.XFileHandle.prototype.setupFile = function(process, isOriginUri, uri, path, pathFormat, varResolveMode, defaultProtocolType, targetFile, blockingMetadataCallFallback)
{
	oFF.XObjectExt.assertNotNullExt(process, "No process given");
	this.setupSessionContext(process);
	this.m_uri = uri;
	this.m_isOriginUri = isOriginUri;
	this.m_path = path;
	this.m_pathFormat = pathFormat;
	this.m_varResolveMode = varResolveMode;
	this.m_defaultProtocolType = defaultProtocolType;
	this.m_target = targetFile;
	this.m_blockingMetadataCallFallback = blockingMetadataCallFallback;
	if (this.m_isOriginUri === false)
	{
		this.resolvePath(true);
	}
};
oFF.XFileHandle.prototype.releaseObject = function()
{
	oFF.MessageManager.prototype.releaseObject.call( this );
	this.m_uri = null;
	this.m_path = null;
	this.m_pathFormat = null;
	this.m_varResolveMode = null;
	this.m_defaultProtocolType = null;
	this.m_target = null;
};
oFF.XFileHandle.prototype.getProcess = function()
{
	return this.getSession();
};
oFF.XFileHandle.prototype.getContentElement = function()
{
	return this;
};
oFF.XFileHandle.prototype.getComponentType = function()
{
	return oFF.IoComponentType.FILE;
};
oFF.XFileHandle.prototype.newChildFile = function(childUri, childMetadata)
{
	var process = this.getProcess();
	var file = oFF.XFileHandle.createByUri(process, childUri, this.m_blockingMetadataCallFallback);
	return file;
};
oFF.XFileHandle.prototype.getInternalMessageManager = function()
{
	return this;
};
oFF.XFileHandle.prototype.resolvePath = function(enforce)
{
	if ((this.getUri() === null || enforce) && this.m_isOriginUri === false)
	{
		this.setUri(null);
		if (oFF.notNull(this.m_path))
		{
			this.setUri(oFF.XUri.createFromFilePath(this.getProcess(), this.m_path, this.m_pathFormat, this.m_varResolveMode, this.m_defaultProtocolType));
			if (this.hasValidUri() === false)
			{
				this.clearMessages();
				this.addError(0, oFF.XStringUtils.concatenate2("Cannot resolve path: ", this.m_path));
			}
		}
		else
		{
			this.clearMessages();
			this.addError(0, "No path given");
		}
	}
};
oFF.XFileHandle.prototype.getTargetFile = function()
{
	return this.m_target;
};
oFF.XFileHandle.prototype.setTargetFile = function(file)
{
	if (this.m_target !== file)
	{
		this.m_target = file;
		this.clearCache();
	}
};
oFF.XFileHandle.prototype.getUri = function()
{
	return this.m_uri;
};
oFF.XFileHandle.prototype.setUri = function(uri)
{
	this.m_uri = uri;
};
oFF.XFileHandle.prototype.getUrl = function()
{
	if (this.hasValidUri())
	{
		return this.getUri().getUrl();
	}
	else
	{
		return null;
	}
};
oFF.XFileHandle.prototype.getProtocolType = function()
{
	if (this.hasValidUri())
	{
		return this.getUri().getProtocolType();
	}
	else
	{
		return null;
	}
};
oFF.XFileHandle.prototype.hasValidUri = function()
{
	var uri = this.getUri();
	return oFF.notNull(uri) && uri.isUriResolved();
};
oFF.XFileHandle.prototype.getName = function()
{
	var name = null;
	if (this.hasValidUri())
	{
		var uri = this.getUri();
		name = uri.getPathContainer().getFileName();
	}
	return name;
};
oFF.XFileHandle.prototype.getTargetUriPath = function()
{
	return this.getTargetUri().getPath();
};
oFF.XFileHandle.prototype.getTargetUri = function()
{
	this.assertMd("getFileTypeMd");
	var uri = null;
	var value = this.getCachedMetadata().getStringByKeyExt(oFF.XFileAttribute.TARGET_URL.getName(), null);
	if (oFF.XStringUtils.isNotNullAndNotEmpty(value))
	{
		uri = oFF.XUri.createFromUrl(value);
	}
	return uri;
};
oFF.XFileHandle.prototype.getNativePath = function()
{
	var action = oFF.XFileActionIndirection.createAndRun(oFF.SyncType.BLOCKING, null, null, this, oFF.XFileActionIndirection.GET_NATIVE_PATH, null, null, false, null, null);
	return action.m_nativePath;
};
oFF.XFileHandle.prototype.getFileSystem = oFF.noSupport;
oFF.XFileHandle.prototype.saveByteArray = function(data)
{
	var content = oFF.XContent.createByteArrayContent(oFF.ContentType.BINARY, data);
	this.saveExt(content, oFF.CompressionType.NONE);
};
oFF.XFileHandle.prototype.saveByteArrayGzipped = function(data)
{
	var content = oFF.XContent.createByteArrayContent(oFF.ContentType.BINARY, data);
	this.saveExt(content, oFF.CompressionType.GZIP);
};
oFF.XFileHandle.prototype.saveExt = function(content, compression)
{
	this.processSave(oFF.SyncType.BLOCKING, null, null, content, compression);
};
oFF.XFileHandle.prototype.processSave = function(syncType, listener, customIdentifier, content, compression)
{
	return oFF.XFileActionIndirection.createAndRun(syncType, listener, customIdentifier, this, oFF.XFileActionIndirection.PROCESS_SAVE, compression, content, false, null, null);
};
oFF.XFileHandle.prototype.isWriteable = function()
{
	this.assertMd("isWriteable");
	return this.getCachedMetadata().getBooleanByKeyExt(oFF.XFileAttribute.IS_WRITEABLE.getName(), false);
};
oFF.XFileHandle.prototype.setWritable = function(writable, ownerOnly)
{
	oFF.XObjectExt.assertTrue(this.hasValidUri());
	this.m_target.setWritable(writable, ownerOnly);
};
oFF.XFileHandle.prototype.setFileContent = oFF.noSupport;
oFF.XFileHandle.prototype.loadAsByteArray = function()
{
	var content = this.loadExt(oFF.CompressionType.NONE);
	return content.getByteArray();
};
oFF.XFileHandle.prototype.load = function()
{
	return this.loadExt(oFF.CompressionType.NONE);
};
oFF.XFileHandle.prototype.loadGzipped = function()
{
	return this.loadExt(oFF.CompressionType.GZIP);
};
oFF.XFileHandle.prototype.isReadable = function()
{
	if (this.hasValidUri() === false)
	{
		return false;
	}
	else
	{
		return this.m_target.isReadable();
	}
};
oFF.XFileHandle.prototype.loadExt = function(compression)
{
	this.processLoad(oFF.SyncType.BLOCKING, null, null, compression);
	return this.getFileContent();
};
oFF.XFileHandle.prototype.getFileContent = function()
{
	oFF.XObjectExt.assertTrue(this.hasValidUri());
	return this.m_target.getFileContent();
};
oFF.XFileHandle.prototype.getContentConstant = function()
{
	oFF.XObjectExt.assertTrue(this.hasValidUri());
	return this.m_target.getContentConstant();
};
oFF.XFileHandle.prototype.processLoad = function(syncType, listener, customIdentifier, compression)
{
	return oFF.XFileActionIndirection.createAndRun(syncType, listener, customIdentifier, this, oFF.XFileActionIndirection.PROCESS_LOAD, compression, null, false, null, null);
};
oFF.XFileHandle.prototype.processExecute = function(syncType, listener, customIdentifier)
{
	oFF.XObjectExt.assertTrue(this.hasValidUri());
	return this.m_target.processExecute(syncType, listener, customIdentifier);
};
oFF.XFileHandle.prototype.isExecutable = function()
{
	if (this.hasValidUri() === false)
	{
		return false;
	}
	else
	{
		return this.m_target.isExecutable();
	}
};
oFF.XFileHandle.prototype.processDelete = function(syncType, listener, customIdentifier)
{
	oFF.XObjectExt.assertTrue(this.hasValidUri());
	return this.m_target.processDelete(syncType, listener, customIdentifier);
};
oFF.XFileHandle.prototype.deleteRecursive = function()
{
	oFF.XFileActionIndirection.createAndRun(oFF.SyncType.BLOCKING, null, null, this, oFF.XFileActionIndirection.DELETE_RECURSIVE, null, null, false, null, null);
};
oFF.XFileHandle.prototype.deleteChildren = function()
{
	oFF.XFileActionIndirection.createAndRun(oFF.SyncType.BLOCKING, null, null, this, oFF.XFileActionIndirection.DELETE_CHILDREN, null, null, false, null, null);
};
oFF.XFileHandle.prototype.deleteFile = function()
{
	oFF.XFileActionIndirection.createAndRun(oFF.SyncType.BLOCKING, null, null, this, oFF.XFileActionIndirection.DELETE, null, null, false, null, null);
};
oFF.XFileHandle.prototype.supportsRenameTo = function()
{
	var action = oFF.XFileActionIndirection.createAndRun(oFF.SyncType.BLOCKING, null, null, this, oFF.XFileActionIndirection.SUPPORTS_RENAME_TO, null, null, false, null, null);
	return action.m_supportsRenameTo;
};
oFF.XFileHandle.prototype.renameTo = function(dest)
{
	oFF.XObjectExt.assertTrue(this.hasValidUri());
	return this.m_target.renameTo(dest);
};
oFF.XFileHandle.prototype.rename = function(dest)
{
	oFF.XObjectExt.assertTrue(this.hasValidUri());
	return this.m_target.rename(dest);
};
oFF.XFileHandle.prototype.processRename = function(syncType, listener, customIdentifier, destFile)
{
	oFF.XObjectExt.assertTrue(this.hasValidUri());
	return this.m_target.processRename(syncType, listener, customIdentifier, destFile);
};
oFF.XFileHandle.prototype.processRenameExt = function(syncType, listener, customIdentifier, targetName)
{
	var action = oFF.XFileActionIndirection.createAndRun(syncType, listener, null, this, oFF.XFileActionIndirection.PROCESS_RENAME, null, null, false, null, targetName);
	return action;
};
oFF.XFileHandle.prototype.mkdir = function()
{
	this.mkdirExt(false);
};
oFF.XFileHandle.prototype.mkdirs = function()
{
	this.mkdirExt(true);
};
oFF.XFileHandle.prototype.processMkdir = function(syncType, listener, customIdentifier, includeParentDirs)
{
	return oFF.XFileActionIndirection.createAndRun(syncType, listener, customIdentifier, this, oFF.XFileActionIndirection.PROCESS_MKDIR, null, null, includeParentDirs, null, null);
};
oFF.XFileHandle.prototype.mkdirExt = function(includeParentDirs)
{
	this.processMkdir(oFF.SyncType.BLOCKING, null, null, includeParentDirs);
};
oFF.XFileHandle.prototype.clearCache = function()
{
	this.m_resultset = null;
	this.m_isExisting = false;
};
oFF.XFileHandle.prototype.getChildElements = function()
{
	var children = this.getChildren();
	return oFF.XReadOnlyListWrapper.create(children);
};
oFF.XFileHandle.prototype.setChildNames = function(childNames, totalItemCount)
{
	var fileList = oFF.XList.create();
	var uri = this.getUri();
	var childFile;
	var childName;
	var childUri;
	var size = childNames.size();
	for (var i = 0; i < size; i++)
	{
		childName = childNames.get(i);
		childUri = oFF.XUri.createChildFile(uri, childName);
		childFile = this.newChildFile(childUri, null);
		fileList.add(childFile);
	}
	this.m_resultset = oFF.XFileChildrenResultset.create(fileList, totalItemCount);
};
oFF.XFileHandle.prototype.setChildFiles = function(childFiles, totalItemCount)
{
	var childNames = oFF.XListOfString.create();
	var size = childFiles.size();
	var currentFile;
	for (var i = 0; i < size; i++)
	{
		currentFile = childFiles.get(i);
		childNames.add(currentFile.getName());
	}
	this.m_resultset = oFF.XFileChildrenResultset.create(childFiles, totalItemCount);
};
oFF.XFileHandle.prototype.getCachedChildFiles = function()
{
	return oFF.isNull(this.m_resultset) ? null : this.m_resultset.getChildFiles();
};
oFF.XFileHandle.prototype.getCachedChildrenResultset = function()
{
	return this.m_resultset;
};
oFF.XFileHandle.prototype.newFileQuery = function()
{
	var cachedMetadata = null;
	if (this.isMetadataLoaded())
	{
		cachedMetadata = this.getCachedMetadata();
	}
	var query = oFF.XFileQuery.create(cachedMetadata);
	return query;
};
oFF.XFileHandle.prototype.getChildSetState = function()
{
	var action = oFF.XFileActionIndirection.createAndRun(oFF.SyncType.BLOCKING, null, null, this, oFF.XFileActionIndirection.GET_CHILD_STATE, null, null, false, null, null);
	return action.m_childSetState;
};
oFF.XFileHandle.prototype.processFetchChildren = function(syncType, listener, customIdentifier, config)
{
	return oFF.XFileActionIndirection.createAndRun(syncType, listener, customIdentifier, this, oFF.XFileActionIndirection.FETCH_CHILDREN, null, null, false, config, null);
};
oFF.XFileHandle.prototype.getChildren = function()
{
	this.processFetchChildren(oFF.SyncType.BLOCKING, null, null, null);
	return this.getCachedChildFiles();
};
oFF.XFileHandle.prototype.hasChildren = function()
{
	var action = oFF.XFileActionIndirection.createAndRun(oFF.SyncType.BLOCKING, null, null, this, oFF.XFileActionIndirection.HAS_CHILDREN, null, null, false, null, null);
	return action.m_hasChildren;
};
oFF.XFileHandle.prototype.isMetadataLoaded = function()
{
	return this.getCachedMetadata() !== null;
};
oFF.XFileHandle.prototype.setMetadata = oFF.noSupport;
oFF.XFileHandle.prototype.getCachedIsExisting = function()
{
	return this.m_isExisting;
};
oFF.XFileHandle.prototype.setIsExisting = function(isExisting)
{
	this.m_isExisting = isExisting;
};
oFF.XFileHandle.prototype.processFetchMetadata = function(syncType, listener, customIdentifier)
{
	return oFF.XFileActionIndirection.createAndRun(syncType, listener, customIdentifier, this, oFF.XFileActionIndirection.FETCH_METADATA, null, null, false, null, null);
};
oFF.XFileHandle.prototype.getFileType = function()
{
	oFF.XObjectExt.assertTrue(this.hasValidUri());
	return this.m_target.getFileType();
};
oFF.XFileHandle.prototype.supportsSize = function()
{
	oFF.XObjectExt.assertTrue(this.hasValidUri());
	return this.m_target.supportsSize();
};
oFF.XFileHandle.prototype.getSize = function()
{
	oFF.XObjectExt.assertTrue(this.hasValidUri());
	return this.m_target.getSize();
};
oFF.XFileHandle.prototype.isHidden = function()
{
	return this.m_target.isHidden();
};
oFF.XFileHandle.prototype.getLastModifiedTimestamp = function()
{
	oFF.XObjectExt.assertTrue(this.hasValidUri());
	return this.m_target.getLastModifiedTimestamp();
};
oFF.XFileHandle.prototype.supportsSetLastModified = function()
{
	oFF.XObjectExt.assertTrue(this.hasValidUri());
	return this.m_target.supportsSetLastModified();
};
oFF.XFileHandle.prototype.getAttributes = function()
{
	var action = oFF.XFileActionIndirection.createAndRun(oFF.SyncType.BLOCKING, null, null, this, oFF.XFileActionIndirection.GET_ATTRIBUTES, null, null, false, null, null);
	return action.m_attributes;
};
oFF.XFileHandle.prototype.isDirectory = function()
{
	var action = oFF.XFileActionIndirection.createAndRun(oFF.SyncType.BLOCKING, null, null, this, oFF.XFileActionIndirection.IS_DIRECTORY, null, null, false, null, null);
	return action.m_isDirectory;
};
oFF.XFileHandle.prototype.isFile = function()
{
	var action = oFF.XFileActionIndirection.createAndRun(oFF.SyncType.BLOCKING, null, null, this, oFF.XFileActionIndirection.IS_FILE, null, null, false, null, null);
	return action.m_isFile;
};
oFF.XFileHandle.prototype.isExisting = function()
{
	var action = oFF.XFileActionIndirection.createAndRun(oFF.SyncType.BLOCKING, null, null, this, oFF.XFileActionIndirection.IS_EXISTING, null, null, false, null, null);
	return action.m_isExisting;
};
oFF.XFileHandle.prototype.processIsExisting = function(syncType, listener, customIdentifier)
{
	return oFF.XFileActionIndirection.createAndRun(syncType, listener, customIdentifier, this, oFF.XFileActionIndirection.PROCESS_IS_EXISTING, null, null, false, null, null);
};
oFF.XFileHandle.prototype.isNode = function()
{
	oFF.XObjectExt.assertTrue(this.hasValidUri());
	return this.m_target.isNode();
};
oFF.XFileHandle.prototype.isLeaf = function()
{
	oFF.XObjectExt.assertTrue(this.hasValidUri());
	return this.m_target.isLeaf();
};
oFF.XFileHandle.prototype.getTagValue = function(tagName)
{
	oFF.XObjectExt.assertTrue(this.hasValidUri());
	return this.m_target.getTagValue(tagName);
};
oFF.XFileHandle.prototype.setIsBlockingMetadataCallFallback = function(isBlockingMetadataCallFallback)
{
	this.m_blockingMetadataCallFallback = isBlockingMetadataCallFallback;
};
oFF.XFileHandle.prototype.isBlockingMetadataCallFallback = function()
{
	return this.m_blockingMetadataCallFallback;
};
oFF.XFileHandle.prototype.getFileTypeMd = function()
{
	this.assertMd("getFileTypeMd");
	var value = this.getCachedMetadata().getStringByKeyExt(oFF.XFileAttribute.FILE_TYPE.getName(), oFF.XFileType.FILE.getName());
	var fileType = oFF.XFileType.lookup(value);
	return fileType;
};
oFF.XFileHandle.prototype.getDisplayName = function()
{
	this.assertMd("getDisplayName");
	return this.getCachedMetadata().getStringByKeyExt(oFF.XFileAttribute.DISPLAY_NAME.getName(), null);
};
oFF.XFileHandle.prototype.getText = function()
{
	return this.getDescription();
};
oFF.XFileHandle.prototype.getDescription = function()
{
	this.assertMd("getDescription");
	return this.getCachedMetadata().getStringByKeyExt(oFF.XFileAttribute.DESCRIPTION.getName(), null);
};
oFF.XFileHandle.prototype.isExistingMd = function()
{
	this.assertMd("isExistingMd");
	return this.getCachedMetadata().getBooleanByKeyExt(oFF.XFileAttribute.IS_EXISTING.getName(), false);
};
oFF.XFileHandle.prototype.isDirectoryMd = function()
{
	this.assertMd("isDirectoryMd");
	return this.getCachedMetadata().getBooleanByKeyExt(oFF.XFileAttribute.IS_DIRECTORY.getName(), false);
};
oFF.XFileHandle.prototype.assertMd = function(message)
{
	if (this.m_blockingMetadataCallFallback === true)
	{
		if (oFF.isNull(this.m_target) || oFF.isNull(this.m_cachedMetadata))
		{
			this.processFetchMetadata(oFF.SyncType.BLOCKING, null, null);
		}
		if (this.hasErrors() || this.getCachedMetadata() === null)
		{
			throw oFF.XException.createIllegalStateException(oFF.XStringUtils.concatenate4("Errors when doing a blocking metadata fetch: '", message, "' Error: ", this.getSummary()));
		}
	}
	else
	{
		if (this.hasErrors())
		{
			throw oFF.XException.createIllegalStateException(oFF.XStringUtils.concatenate4("Error in file state while calling: '", message, "' Error: ", this.getSummary()));
		}
		else if (this.getCachedMetadata() === null)
		{
			throw oFF.XException.createIllegalStateException(oFF.XStringUtils.concatenate3("No metadata fetch executed when calling: '", message, "'"));
		}
	}
};
oFF.XFileHandle.prototype.getCachedMetadata = function()
{
	if (oFF.notNull(this.m_target) && oFF.isNull(this.m_cachedMetadata))
	{
		var providerMetadata = this.m_target.getCachedMetadata();
		if (oFF.notNull(providerMetadata))
		{
			this.m_cachedMetadata = oFF.PrStructure.createDeepCopy(providerMetadata);
			if (this.m_cachedMetadata.getBooleanByKeyExt(oFF.XFileAttribute.IS_LINK.getName(), false))
			{
				var providerLink = this.m_cachedMetadata.getStringByKey(oFF.XFileAttribute.PROVIDER_LINK_URL.getName());
				if (oFF.XStringUtils.isNotNullAndNotEmpty(providerLink))
				{
					var providerLinkUri = oFF.XUri.createFromUrl(providerLink);
					var providerUri = this.m_target.getUri();
					var relativeProviderPath = providerUri.calculateRelativePath(providerLinkUri);
					var ourUri = this.getUri();
					var targetUri = oFF.XUri.createFromParentUriAndRelativeUrl(ourUri, relativeProviderPath, false);
					if (targetUri.normalizePath(false).isValid())
					{
						this.m_cachedMetadata.putString(oFF.XFileAttribute.LINK_URL.getName(), targetUri.getUrl());
					}
				}
			}
		}
	}
	return this.m_cachedMetadata;
};
oFF.XFileHandle.prototype.getParent = function()
{
	var parentFile = null;
	if (this.hasValidUri())
	{
		oFF.XObjectExt.assertTrue(this.hasValidUri());
		var uri = this.getUri();
		var parentUri = oFF.XUri.createParent(uri);
		if (oFF.notNull(parentUri))
		{
			parentFile = oFF.XFileHandle.createByUri(this.getProcess(), parentUri, this.m_blockingMetadataCallFallback);
		}
	}
	return parentFile;
};
oFF.XFileHandle.prototype.newChild = function(relativePath)
{
	var childFile = null;
	if (this.hasValidUri())
	{
		var uri = this.getUri();
		var childUri = oFF.XUri.createChild(uri, relativePath);
		childFile = oFF.XFileHandle.createByUri(this.getProcess(), childUri, this.m_blockingMetadataCallFallback);
	}
	return childFile;
};
oFF.XFileHandle.prototype.newSibling = function(name)
{
	var siblingFile = null;
	if (this.hasValidUri())
	{
		var uri = this.getUri();
		var newTarget = oFF.XUri.createSibling(uri, name);
		siblingFile = oFF.XFile.createByUri(this.getProcess(), newTarget);
	}
	return siblingFile;
};
oFF.XFileHandle.prototype.newRootDirectoryFile = function()
{
	var uri = this.getRootDirectoryUri();
	var file = oFF.XFile.createByUri(this.getProcess(), uri);
	return file;
};
oFF.XFileHandle.prototype.getRootDirectoryUri = function()
{
	var uri = null;
	if (this.hasValidUri() === true)
	{
		var theUri = this.getUri();
		var newUri = oFF.XUri.createFromOther(theUri);
		newUri.setPath("/");
		uri = newUri;
	}
	return uri;
};
oFF.XFileHandle.prototype.compareTo = function(objectToCompare)
{
	var other = objectToCompare;
	var otherName = other.getUrl();
	var myName = this.getUrl();
	return oFF.XString.compare(myName, otherName);
};
oFF.XFileHandle.prototype.toString = function()
{
	var result;
	if (this.hasValidUri())
	{
		result = this.getUrl();
	}
	else if (oFF.notNull(this.m_path))
	{
		result = this.m_path;
	}
	else
	{
		result = "[url not defined]";
	}
	return result;
};

oFF.XFileSystemManagerChild = function() {};
oFF.XFileSystemManagerChild.prototype = new oFF.XFileSystemManager();
oFF.XFileSystemManagerChild.prototype._ff_c = "XFileSystemManagerChild";

oFF.XFileSystemManagerChild.createChild = function(process)
{
	var newObj = new oFF.XFileSystemManagerChild();
	newObj.setupProcessContext(process);
	return newObj;
};
oFF.XFileSystemManagerChild.prototype.m_parent = null;
oFF.XFileSystemManagerChild.prototype.setupProcessContext = function(process)
{
	oFF.XFileSystemManager.prototype.setupProcessContext.call( this , process);
	var parentProcess = process.getParentProcess();
	this.m_parent = parentProcess.getFileSystemManager();
};
oFF.XFileSystemManagerChild.prototype.getFileSystemByUri = function(uri)
{
	var fs = this.m_parent.getFileSystemByUri(uri);
	return fs;
};
oFF.XFileSystemManagerChild.prototype.getAllInitializedFileSystems = function()
{
	return this.m_parent.getAllInitializedFileSystems();
};
oFF.XFileSystemManagerChild.prototype.getAllAvailableFileSystems = function()
{
	var allAvailableFileSystems = this.m_parent.getAllAvailableFileSystems();
	return allAvailableFileSystems;
};
oFF.XFileSystemManagerChild.prototype.setFileSystemByUri = function(uri, fs)
{
	this.m_parent.setFileSystemByUri(uri, fs);
};
oFF.XFileSystemManagerChild.prototype.validateFs = function()
{
	if (oFF.isNull(this.m_activeFileSystem))
	{
		this.m_activeFileSystem = this.m_parent.getActiveFileSystem();
		this.m_workingDirectory = this.m_parent.getWorkingDirectoryUri();
	}
};

oFF.XFileSystemManagerRoot = function() {};
oFF.XFileSystemManagerRoot.prototype = new oFF.XFileSystemManager();
oFF.XFileSystemManagerRoot.prototype._ff_c = "XFileSystemManagerRoot";

oFF.XFileSystemManagerRoot.createRoot = function(process)
{
	var newObj = new oFF.XFileSystemManagerRoot();
	newObj.setupProcessContext(process);
	return newObj;
};
oFF.XFileSystemManagerRoot.prototype.m_fileSystems = null;
oFF.XFileSystemManagerRoot.prototype.m_remoteFsUrl = null;
oFF.XFileSystemManagerRoot.prototype.setupProcessContext = function(process)
{
	oFF.XFileSystemManager.prototype.setupProcessContext.call( this , process);
	this.m_fileSystems = oFF.XHashMapByString.create();
};
oFF.XFileSystemManagerRoot.prototype.getFileSystemByUri = function(uri)
{
	var fs = null;
	if (oFF.notNull(uri))
	{
		var theUri = oFF.XUri.createFromOther(uri);
		var protocolType = theUri.getProtocolType();
		if (oFF.notNull(protocolType))
		{
			if (protocolType === oFF.ProtocolType.HTTP || protocolType === oFF.ProtocolType.HTTPS)
			{
				var networkLocation = this.getRemoteFsUrl();
				if (oFF.XStringUtils.isNotNullAndNotEmpty(networkLocation) && oFF.XString.startsWith(theUri.getUrl(), networkLocation))
				{
					protocolType = oFF.ProtocolType.REMOTE_WEB;
				}
				else
				{
					protocolType = oFF.ProtocolType.SIMPLE_WEB;
				}
				theUri.setProtocolType(protocolType);
			}
			fs = this.getFs(theUri);
		}
	}
	return fs;
};
oFF.XFileSystemManagerRoot.prototype.getRemoteFsUrl = function()
{
	if (oFF.isNull(this.m_remoteFsUrl))
	{
		var variable = this.getSession().getEnvironment().getVariable(oFF.XEnvironmentConstants.REMOTE_FS_LOCATION);
		if (oFF.notNull(variable))
		{
			this.m_remoteFsUrl = oFF.XUri.createFromFilePath(this.getSession(), variable, oFF.PathFormat.AUTO_DETECT, oFF.VarResolveMode.DEFAULT_VALUE, null).getUrl();
		}
		else
		{
			this.m_remoteFsUrl = "";
		}
	}
	return this.m_remoteFsUrl;
};
oFF.XFileSystemManagerRoot.prototype.getFs = function(uri)
{
	var protocolType = uri.getProtocolType();
	var uriMask = oFF.XFileSystemFactory.getUriMask(protocolType);
	var url = uri.getUrlWithMask(uriMask);
	var fs = this.m_fileSystems.getByKey(url);
	if (oFF.isNull(fs))
	{
		fs = oFF.XFileSystemFactory.create(this.getProcess(), uri);
		if (oFF.notNull(fs))
		{
			this.setFileSystemByUri(uri, fs);
		}
	}
	return fs;
};
oFF.XFileSystemManagerRoot.prototype.setFileSystemByUri = function(uri, fs)
{
	oFF.XObjectExt.assertNotNull(fs);
	var protocolType = uri.getProtocolType();
	var uriMask = oFF.XFileSystemFactory.getUriMask(protocolType);
	var url = uri.getUrlWithMask(uriMask);
	this.m_fileSystems.put(url, fs);
};
oFF.XFileSystemManagerRoot.prototype.getAllInitializedFileSystems = function()
{
	return this.m_fileSystems;
};
oFF.XFileSystemManagerRoot.prototype.getAllAvailableFileSystems = function()
{
	var all = oFF.XListOfNameObject.create();
	var keys = oFF.XFileSystemFactory.getAllFactories().getKeysAsReadOnlyListOfString();
	for (var i = 0; i < keys.size(); i++)
	{
		var theKey = keys.get(i);
		var theType = oFF.ProtocolType.lookup(theKey);
		all.add(theType);
	}
	var kernel = this.getProcess().getKernel();
	var allFsSubSys = kernel.getAllSubSystemSelectors(oFF.SubSystemType.FILE_SYSTEM);
	for (var k = 0; k < allFsSubSys.size(); k++)
	{
		var fsSubSysName = allFsSubSys.get(k);
		var fsSubSysType = oFF.ProtocolType.lookup(fsSubSysName);
		if (oFF.notNull(fsSubSysType))
		{
			all.add(fsSubSysType);
		}
	}
	return all;
};
oFF.XFileSystemManagerRoot.prototype.validateFs = function()
{
	if (oFF.isNull(this.m_activeFileSystem))
	{
		this.setActiveFileSystem(oFF.ProtocolType.FILE);
	}
};

oFF.ModuleLoadAction = function() {};
oFF.ModuleLoadAction.prototype = new oFF.SyncAction();
oFF.ModuleLoadAction.prototype._ff_c = "ModuleLoadAction";

oFF.ModuleLoadAction.createAndRun = function(syncType, moduleManager, rootModuleNames, loader, listener, customIdentifier)
{
	var newObj = new oFF.ModuleLoadAction();
	newObj.m_rootModuleNames = rootModuleNames;
	newObj.m_loader = loader;
	newObj.setupActionAndRun(syncType, listener, customIdentifier, moduleManager);
	return newObj;
};
oFF.ModuleLoadAction.prototype.m_rootModuleNames = null;
oFF.ModuleLoadAction.prototype.m_loader = null;
oFF.ModuleLoadAction.prototype.m_hasLogInfo = false;
oFF.ModuleLoadAction.prototype.setupAction = function(syncType, listener, customIdentifier, context)
{
	oFF.SyncAction.prototype.setupAction.call( this , syncType, listener, customIdentifier, context);
	this.setData(this.m_rootModuleNames);
};
oFF.ModuleLoadAction.prototype.getLogLayer = function()
{
	return oFF.OriginLayer.KERNEL;
};
oFF.ModuleLoadAction.prototype.processSynchronization = function(syncType)
{
	var continueWork = false;
	var allRemainingModules = oFF.XList.create();
	var modulesToBeLoaded = oFF.XListOfNameObject.create();
	this.prepareDefinitions(allRemainingModules, modulesToBeLoaded);
	if (oFF.isNull(this.m_loader))
	{
		this.addErrorExt(oFF.OriginLayer.KERNEL, 0, "No module loader available", null);
	}
	else if (this.isValid() && allRemainingModules.size() > 0)
	{
		continueWork = true;
		if (this.m_hasLogInfo === false)
		{
			if (allRemainingModules.size() > 0)
			{
				this.log2("Start: All modules to be loaded: ", allRemainingModules.toString());
			}
			this.m_hasLogInfo = true;
		}
		if (modulesToBeLoaded.size() > 0)
		{
			this.detectCombinedModule(allRemainingModules, modulesToBeLoaded);
			var output = this.enlistModules(modulesToBeLoaded);
			if (modulesToBeLoaded.size() > 1)
			{
				this.log2("Loading modules in parallel: ", output);
			}
			else
			{
				this.log2("Loading single module: ", output);
			}
			for (var i = 0; i < modulesToBeLoaded.size(); i++)
			{
				var moduleDef = modulesToBeLoaded.get(i);
				moduleDef.setLoadStatus(oFF.ResourceStatus.LOADING);
				this.m_loader.processModuleLoad(this.getSession(), moduleDef, this, oFF.XApiVersion.GIT_COMMIT_ID);
			}
		}
	}
	if (continueWork === false)
	{
		this.endSync();
	}
	return continueWork;
};
oFF.ModuleLoadAction.prototype.enlistModules = function(list)
{
	var buffer = oFF.XStringBuffer.create();
	for (var i = 0; i < list.size(); i++)
	{
		if (i > 0)
		{
			buffer.append(",");
		}
		var ref = list.get(i);
		buffer.append(ref.toString());
		if (ref.getType() === oFF.ResourceType.CONTAINER)
		{
			buffer.append(" *{");
			buffer.append(ref.getAllContainerResources().toString());
			buffer.append("}");
		}
	}
	return buffer.toString();
};
oFF.ModuleLoadAction.prototype.prepareDefinitions = function(allRemainingModules, modulesToBeLoaded)
{
	for (var i = 0; i < this.m_rootModuleNames.size(); i++)
	{
		var moduleName = this.m_rootModuleNames.get(i);
		this.collectRecursive(moduleName, allRemainingModules, modulesToBeLoaded);
	}
};
oFF.ModuleLoadAction.prototype.collectRecursive = function(name, allRemainingModules, modulesToBeLoaded)
{
	var isModuleLoaded = false;
	var module = oFF.ModuleManager.getModuleDef(name);
	if (oFF.isNull(module))
	{
		this.addErrorExt(oFF.OriginLayer.KERNEL, 2, oFF.XStringUtils.concatenate2("Cannot find module: ", name), null);
	}
	else
	{
		var loadStatus = module.getLoadStatus();
		if (loadStatus === oFF.ResourceStatus.FAILED)
		{
			this.addErrorExt(oFF.OriginLayer.KERNEL, 2, oFF.XStringUtils.concatenate2("Module could not be loaded: ", name), null);
		}
		else if (loadStatus === oFF.ResourceStatus.LOADED)
		{
			isModuleLoaded = true;
		}
		else
		{
			if (allRemainingModules.contains(module) === false)
			{
				var dependencies = module.getDependencies();
				var areAllChildrenLoaded = false;
				if (dependencies.size() > 0)
				{
					areAllChildrenLoaded = true;
					for (var i = 0; i < dependencies.size(); i++)
					{
						var subModuleName = dependencies.get(i);
						var isChildLoaded = this.collectRecursive(subModuleName, allRemainingModules, modulesToBeLoaded);
						if (isChildLoaded === false)
						{
							areAllChildrenLoaded = false;
						}
					}
				}
				else
				{
					areAllChildrenLoaded = true;
				}
				if (module.getInitClazzNameCompatible() !== null)
				{
					allRemainingModules.add(module);
					if (loadStatus === oFF.ResourceStatus.INITIAL)
					{
						if (areAllChildrenLoaded)
						{
							modulesToBeLoaded.add(module);
						}
					}
				}
			}
		}
	}
	return isModuleLoaded;
};
oFF.ModuleLoadAction.prototype.detectCombinedModule = function(allRemainingModules, modulesToBeLoaded)
{
	var hasCombinedModule = false;
	var allContainerModules = oFF.ModuleManager.getAllContainerModules();
	for (var k = 0; k < allContainerModules.size(); k++)
	{
		var resourceDef = allContainerModules.get(k);
		var currentContainerResources = resourceDef.getAllContainerResources();
		var combo1 = oFF.XHashSetOfString.create();
		for (var m = 0; m < currentContainerResources.size(); m++)
		{
			var resource = currentContainerResources.get(m);
			var resName = resource.getName();
			combo1.add(resName);
		}
		for (var i = 0; i < allRemainingModules.size(); i++)
		{
			var currentModule = allRemainingModules.get(i);
			var name = currentModule.getName();
			combo1.removeElement(name);
			if (combo1.size() === 0)
			{
				hasCombinedModule = true;
				this.log4("Found combination: ", resourceDef.getName(), " having: ", resourceDef.getAllContainerResources().toString());
				this.manipulate(modulesToBeLoaded, resourceDef);
				break;
			}
		}
	}
	return hasCombinedModule;
};
oFF.ModuleLoadAction.prototype.manipulate = function(modulesToBeLoaded, resourceDef)
{
	var currentContainerResources = resourceDef.getAllContainerResources();
	for (var g = 0; g < currentContainerResources.size(); g++)
	{
		var resource2 = currentContainerResources.get(g);
		var resName2 = resource2.getName();
		for (var r = 0; r < modulesToBeLoaded.size(); r++)
		{
			var element = modulesToBeLoaded.get(r);
			if (oFF.XString.isEqual(element.getName(), resName2))
			{
				modulesToBeLoaded.removeAt(r);
				break;
			}
		}
	}
	modulesToBeLoaded.insert(0, resourceDef);
};
oFF.ModuleLoadAction.prototype.onModuleLoaded = function(messages, moduleName, hasBeenLoaded)
{
	if (oFF.notNull(messages))
	{
		this.addAllMessages(messages);
	}
	if (hasBeenLoaded === true)
	{
		this.log2("Module was loaded: ", moduleName);
	}
	else
	{
		this.log2("Module was NOT loaded: ", moduleName);
	}
	this.processSynchronization(this.getActiveSyncType());
};
oFF.ModuleLoadAction.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onModuleLoadedMulti(extResult, data, customIdentifier);
};

oFF.SubSysSharedServersPrg = function() {};
oFF.SubSysSharedServersPrg.prototype = new oFF.DfProgramSubSys();
oFF.SubSysSharedServersPrg.prototype._ff_c = "SubSysSharedServersPrg";

oFF.SubSysSharedServersPrg.DEFAULT_PROGRAM_NAME = "@SubSys.SharedServers";
oFF.SubSysSharedServersPrg.prototype.m_sharedServers = null;
oFF.SubSysSharedServersPrg.prototype.newProgram = function()
{
	var prg = new oFF.SubSysSharedServersPrg();
	prg.setup();
	return prg;
};
oFF.SubSysSharedServersPrg.prototype.getProgramName = function()
{
	return oFF.SubSysSharedServersPrg.DEFAULT_PROGRAM_NAME;
};
oFF.SubSysSharedServersPrg.prototype.setup = function()
{
	oFF.DfProgramSubSys.prototype.setup.call( this );
	this.m_sharedServers = oFF.SharedServers.create();
};
oFF.SubSysSharedServersPrg.prototype.getSubSystemType = function()
{
	return oFF.SubSystemType.SHARED_SERVERS;
};
oFF.SubSysSharedServersPrg.prototype.runProcess = function()
{
	this.activateSubSystem(null, oFF.SubSystemStatus.ACTIVE);
	return false;
};
oFF.SubSysSharedServersPrg.prototype.getMainApi = function()
{
	return this.m_sharedServers;
};

oFF.ServerMetadataAction = function() {};
oFF.ServerMetadataAction.prototype = new oFF.SyncAction();
oFF.ServerMetadataAction.prototype._ff_c = "ServerMetadataAction";

oFF.ServerMetadataAction.create = function(syncType, connectionContainer, listener, customIdentifier, isKeepAlive, type)
{
	var object = new oFF.ServerMetadataAction();
	object.m_isKeepAlive = isKeepAlive;
	object.m_type = type;
	oFF.XObjectExt.assertNotNull(type);
	oFF.XObjectExt.assertTrue(type.isTypeOf(oFF.HttpSemanticRequestType.ABSTRACT_SERVER_GET));
	object.setupAction(syncType, listener, customIdentifier, connectionContainer);
	return object;
};
oFF.ServerMetadataAction.prototype.m_serverMetadata = null;
oFF.ServerMetadataAction.prototype.m_logonAction = null;
oFF.ServerMetadataAction.prototype.m_isKeepAlive = false;
oFF.ServerMetadataAction.prototype.m_type = null;
oFF.ServerMetadataAction.prototype.releaseObject = function()
{
	this.m_serverMetadata = null;
	this.m_logonAction = oFF.XObjectExt.release(this.m_logonAction);
	oFF.SyncAction.prototype.releaseObject.call( this );
};
oFF.ServerMetadataAction.prototype.processSynchronization = function(syncType)
{
	var connection = this.getActionContext();
	if (oFF.notNull(connection) && connection.isValid())
	{
		var systemDescription = connection.getSystemDescription();
		var protocolType = systemDescription.getProtocolType();
		if (protocolType !== oFF.ProtocolType.FILE)
		{
			var path = systemDescription.getSystemType().getServerInfoPath();
			if (oFF.notNull(path))
			{
				var tmpRpcFunction = connection.newRpcFunction(path);
				var request = tmpRpcFunction.getRpcRequest();
				request.setMethod(oFF.HttpRequestMethod.HTTP_GET);
				request.setRequestType(this.m_type);
				if (this.m_isKeepAlive && !systemDescription.getSystemType().isTypeOf(oFF.SystemType.ABAP))
				{
					request.getAdditionalParameters().put(oFF.ConnectionConstants.KEEP_ALIVE_PARAM, "true");
				}
				tmpRpcFunction.processFunctionExecution(syncType, this, null);
				return true;
			}
		}
		this.m_serverMetadata = oFF.ServerMetadata.create(this.getSession(), null, systemDescription);
		this.setData(this.m_serverMetadata);
	}
	return false;
};
oFF.ServerMetadataAction.prototype.onFunctionExecuted = function(extResult, response, customIdentifier)
{
	this.addAllMessages(extResult);
	var connection = this.getActionContext();
	var rootStructure = oFF.notNull(response) ? response.getRootElement() : null;
	if (extResult.isValid())
	{
		if (oFF.isNull(rootStructure))
		{
			this.addError(oFF.ErrorCodes.INVALID_SERVER_METADATA_JSON, "Server metadata was not a structure json");
		}
		else
		{
			oFF.InAHelper.importMessages(rootStructure, this);
			if (this.isValid())
			{
				this.m_serverMetadata = oFF.ServerMetadata.create(this.getSession(), rootStructure, connection.getSystemDescription());
				if (oFF.notNull(this.m_logonAction))
				{
					this.importLogonMetadata();
				}
				var updateSystemConnect = !this.m_isKeepAlive || !rootStructure.isEmpty();
				if (updateSystemConnect)
				{
					var systemConnect = connection.getSystemConnect();
					systemConnect.setServerMetadata(this.m_serverMetadata);
				}
				this.setData(this.m_serverMetadata);
			}
		}
		this.endSync();
	}
	else
	{
		var containsCode = extResult.containsCode(oFF.Severity.ERROR, oFF.HttpStatusCode.SC_FORBIDDDEN);
		if (containsCode && connection.getCsrfRequiredCount() > 0 && connection.getCsrfRequiredCount() < 10)
		{
			this.processSynchronization(this.getActiveSyncType());
		}
		else
		{
			if (oFF.notNull(rootStructure))
			{
				this.importInaMessages(rootStructure);
			}
			this.endSync();
		}
	}
};
oFF.ServerMetadataAction.prototype.importLogonMetadata = function()
{
	this.m_serverMetadata.addLogonInfo(this.m_logonAction.getData().getRootElement());
};
oFF.ServerMetadataAction.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onServerMetadataLoaded(extResult, data, customIdentifier);
};
oFF.ServerMetadataAction.prototype.importInaMessages = function(inaStructure)
{
	var inaMessages = inaStructure.getListByKey(oFF.InAConstantsBios.QY_MESSAGES);
	if (oFF.notNull(inaMessages))
	{
		var messageSize = inaMessages.size();
		var message = oFF.XStringBuffer.create();
		for (var i = 0; i < messageSize; i++)
		{
			var inaMessage = inaMessages.getStructureAt(i);
			message.append(inaMessage.getStringByKey(oFF.InAConstantsBios.QY_TEXT));
			var messageClass = inaMessage.getStringByKey(oFF.InAConstantsBios.QY_MESSAGE_CLASS);
			if (oFF.notNull(messageClass))
			{
				message.append("; MsgClass: ").append(messageClass);
			}
			var code = inaMessage.getIntegerByKeyExt(oFF.InAConstantsBios.QY_NUMBER, 0);
			var type = inaMessage.getIntegerByKeyExt(oFF.InAConstantsBios.QY_TYPE, 0);
			if (type === oFF.InAConstantsBios.VA_SEVERITY_INFO)
			{
				this.addInfoExt(oFF.OriginLayer.SERVER, code, message.toString());
			}
			else if (type === oFF.InAConstantsBios.VA_SEVERITY_WARNING)
			{
				this.addWarningExt(oFF.OriginLayer.SERVER, code, message.toString());
			}
			else if (type === oFF.InAConstantsBios.VA_SEVERITY_ERROR)
			{
				this.addErrorExt(oFF.OriginLayer.SERVER, code, message.toString(), null);
			}
			else if (type === oFF.InAConstantsBios.VA_SEVERITY_SEMANTICAL_ERROR)
			{
				this.addSemanticalError(oFF.OriginLayer.SERVER, code, message.toString());
			}
			message.clear();
		}
	}
};
oFF.ServerMetadataAction.prototype.setLogonAction = function(logonAction)
{
	this.m_logonAction = logonAction;
};

oFF.ServerCallAction = function() {};
oFF.ServerCallAction.prototype = new oFF.SyncAction();
oFF.ServerCallAction.prototype._ff_c = "ServerCallAction";

oFF.ServerCallAction.prototype.m_rpcFunction = null;
oFF.ServerCallAction.prototype.m_httpRequestMethod = null;
oFF.ServerCallAction.prototype.releaseObject = function()
{
	oFF.XObjectExt.release(this.m_rpcFunction);
	oFF.SyncAction.prototype.releaseObject.call( this );
};
oFF.ServerCallAction.prototype.onFunctionExecuted = function(extResult, response, customIdentifier)
{
	this.addAllMessages(extResult);
	this.setData(response);
	this.onFunctionExecutedInternal(extResult, response, customIdentifier);
	this.endSync();
};
oFF.ServerCallAction.prototype.processSynchronization = function(syncType)
{
	var connection = this.getActionContext();
	var uri = this.getUri(connection);
	this.m_rpcFunction = connection.newRpcFunctionByUri(uri);
	var request = this.m_rpcFunction.getRpcRequest();
	var method = oFF.notNull(this.m_httpRequestMethod) ? this.m_httpRequestMethod : oFF.HttpRequestMethod.HTTP_GET;
	request.setMethod(method);
	var requestType = this.getRequestType();
	if (oFF.notNull(requestType))
	{
		request.setRequestType(requestType);
	}
	this.m_rpcFunction.processFunctionExecution(syncType, this, null);
	return true;
};
oFF.ServerCallAction.prototype.onFunctionExecutedInternal = function(extResult, response, customIdentifier) {};
oFF.ServerCallAction.prototype.setHttpRequestMethod = function(httpRequestMethod)
{
	this.m_httpRequestMethod = httpRequestMethod;
};
oFF.ServerCallAction.prototype.getRequestType = function()
{
	return null;
};

oFF.ServerOptionsCallAction = function() {};
oFF.ServerOptionsCallAction.prototype = new oFF.SyncAction();
oFF.ServerOptionsCallAction.prototype._ff_c = "ServerOptionsCallAction";

oFF.ServerOptionsCallAction.createAndRun = function(syncType, context, listener, customIdentifier, url, properties)
{
	var action = new oFF.ServerOptionsCallAction();
	action.m_url = url;
	action.m_properties = properties;
	action.setupActionAndRun(syncType, listener, customIdentifier, context);
	return action;
};
oFF.ServerOptionsCallAction.prototype.m_url = null;
oFF.ServerOptionsCallAction.prototype.m_properties = null;
oFF.ServerOptionsCallAction.prototype.processSynchronization = function(syncType)
{
	var httpRequest = oFF.HttpRequest.create();
	var actionContext = this.getActionContext();
	oFF.XConnectHelper.copyConnectionCore(actionContext.getSystemDescription(), httpRequest);
	var uri = oFF.XUri.createFromUrl(this.m_url);
	if (uri.isRelativeUri())
	{
		httpRequest.setPath(uri.getPath());
		httpRequest.setQuery(uri.getQuery());
		httpRequest.setFragment(uri.getFragment());
	}
	else
	{
		httpRequest.setUrl(this.m_url);
	}
	httpRequest.setMethod(oFF.HttpRequestMethod.HTTP_OPTIONS);
	var headers = httpRequest.getHeaderFieldsBase();
	if (oFF.XCollectionUtils.hasElements(this.m_properties.getHeaders()))
	{
		headers.put("Access-Control-Request-Headers", oFF.XCollectionUtils.join(this.m_properties.getHeaders(), ","));
	}
	var origin = this.m_properties.getOrigin();
	if (oFF.isNull(origin))
	{
		origin = this.getOriginFromLocation();
	}
	if (oFF.notNull(origin))
	{
		headers.put("origin", origin);
	}
	headers.put("Access-Control-Request-Method", this.m_properties.getMethod().getName());
	var httpClient = httpRequest.newHttpClient(this.getSession());
	httpClient.processHttpRequest(syncType, this, null);
	return true;
};
oFF.ServerOptionsCallAction.prototype.getOriginFromLocation = function()
{
	var origin = null;
	var location = oFF.NetworkEnv.getLocation();
	if (oFF.notNull(location))
	{
		var scheme = location.getScheme();
		var host = location.getHost();
		origin = oFF.XStringUtils.concatenate3(scheme, "://", host);
	}
	return origin;
};
oFF.ServerOptionsCallAction.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onOptionCallExecuted(extResult, data, customIdentifier);
};
oFF.ServerOptionsCallAction.prototype.onHttpResponse = function(extResult, response, customIdentifier)
{
	this.copyAllMessages(extResult);
	var result = oFF.HttpOptionCallResult.create();
	var headers = response.getHeaderFields();
	result.setStatusCode(response.getStatusCode());
	var allowHeadersString = headers.getStringByKey("access-control-allow-headers");
	if (oFF.XStringUtils.isNotNullAndNotEmpty(allowHeadersString))
	{
		var listOfString = oFF.XStringTokenizer.splitString(allowHeadersString, ",");
		result.getAccessControlAllowHeaders().addAll(listOfString);
	}
	result.setAccessControlAllowOrigin(headers.getStringByKey("access-control-allow-origin"));
	result.setAccessControlMaxAge(headers.getIntegerByKeyExt("access-control-max-age", 0));
	var exposeHeadersString = headers.getStringByKey("access-control-expose-headers");
	if (oFF.XStringUtils.isNotNullAndNotEmpty(exposeHeadersString))
	{
		var exposeHeadersParts = oFF.XStringTokenizer.splitString(exposeHeadersString, ",");
		result.getAccessControlExposeHeaders().addAll(exposeHeadersParts);
	}
	var allowMethodsString = headers.getStringByKey("access-control-allow-methods");
	if (oFF.XStringUtils.isNotNullAndNotEmpty(allowMethodsString))
	{
		var iterator = oFF.XStringTokenizer.splitString(allowMethodsString, ",").getIterator();
		while (iterator.hasNext())
		{
			var methodString = iterator.next();
			var requestMethod = oFF.HttpRequestMethod.lookup(methodString);
			if (oFF.notNull(requestMethod))
			{
				result.getAccessControlAllowMethods().add(requestMethod);
			}
		}
	}
	this.setData(result);
};

oFF.DfRpcFunction = function() {};
oFF.DfRpcFunction.prototype = new oFF.SyncAction();
oFF.DfRpcFunction.prototype._ff_c = "DfRpcFunction";

oFF.DfRpcFunction.prototype.m_rpcRequest = null;
oFF.DfRpcFunction.prototype.m_rpcResponse = null;
oFF.DfRpcFunction.prototype.setupRpcFunction = oFF.noSupport;
oFF.DfRpcFunction.prototype.setupFunction = function(connection, functionUri)
{
	this.setupAction(null, null, null, connection);
	var systemDescription = connection.getSystemDescription();
	this.m_rpcRequest = oFF.RpcRequest.create(this, systemDescription, functionUri, connection.getTraceInfo());
	this.m_rpcResponse = oFF.RpcResponse.create(this);
};
oFF.DfRpcFunction.prototype.releaseObject = function()
{
	this.m_rpcRequest = oFF.XObjectExt.release(this.m_rpcRequest);
	this.m_rpcResponse = oFF.XObjectExt.release(this.m_rpcResponse);
	oFF.SyncAction.prototype.releaseObject.call( this );
};
oFF.DfRpcFunction.prototype.getRequest = function()
{
	return this.getRpcRequest();
};
oFF.DfRpcFunction.prototype.getRpcRequest = function()
{
	return this.m_rpcRequest;
};
oFF.DfRpcFunction.prototype.getResponse = function()
{
	return this.getRpcResponse();
};
oFF.DfRpcFunction.prototype.getRpcResponse = function()
{
	return this.m_rpcResponse;
};
oFF.DfRpcFunction.prototype.getExtResult = function()
{
	return this;
};
oFF.DfRpcFunction.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onFunctionExecuted(extResult, data, customIdentifier);
};
oFF.DfRpcFunction.prototype.processFunctionExecution = function(syncType, listener, customIdentifier)
{
	return this.processSyncAction(syncType, listener, customIdentifier);
};
oFF.DfRpcFunction.prototype.getTraceType = function()
{
	var traceInfo = this.getRpcRequest().getTraceInfo();
	if (oFF.isNull(traceInfo))
	{
		return oFF.TraceType.NONE;
	}
	else
	{
		return traceInfo.getTraceType();
	}
};

oFF.SubSysLandscapeBootstrapPrg = function() {};
oFF.SubSysLandscapeBootstrapPrg.prototype = new oFF.DfProgramSubSys();
oFF.SubSysLandscapeBootstrapPrg.prototype._ff_c = "SubSysLandscapeBootstrapPrg";

oFF.SubSysLandscapeBootstrapPrg.DEFAULT_PROGRAM_NAME = "@SubSys.BootstrapLandscape";
oFF.SubSysLandscapeBootstrapPrg.prototype.newProgram = function()
{
	var prg = new oFF.SubSysLandscapeBootstrapPrg();
	prg.setup();
	return prg;
};
oFF.SubSysLandscapeBootstrapPrg.prototype.getProgramName = function()
{
	return oFF.SubSysLandscapeBootstrapPrg.DEFAULT_PROGRAM_NAME;
};
oFF.SubSysLandscapeBootstrapPrg.prototype.setup = function()
{
	oFF.DfProgramSubSys.prototype.setup.call( this );
};
oFF.SubSysLandscapeBootstrapPrg.prototype.getSubSystemType = function()
{
	return oFF.SubSystemType.BOOTSTRAP_LANDSCAPE;
};
oFF.SubSysLandscapeBootstrapPrg.prototype.runProcess = function()
{
	this.activateSubSystem(null, oFF.SubSystemStatus.ACTIVE);
	return false;
};
oFF.SubSysLandscapeBootstrapPrg.prototype.getMainApi = function()
{
	return null;
};

oFF.SubSysSystemLandscapePrg = function() {};
oFF.SubSysSystemLandscapePrg.prototype = new oFF.DfProgramSubSys();
oFF.SubSysSystemLandscapePrg.prototype._ff_c = "SubSysSystemLandscapePrg";

oFF.SubSysSystemLandscapePrg.DEFAULT_PROGRAM_NAME = "@SubSys.SystemLandscape";
oFF.SubSysSystemLandscapePrg.prototype.m_systemLandscape = null;
oFF.SubSysSystemLandscapePrg.prototype.m_landscapeLoadAction = null;
oFF.SubSysSystemLandscapePrg.prototype.newProgram = function()
{
	var prg = new oFF.SubSysSystemLandscapePrg();
	prg.setup();
	return prg;
};
oFF.SubSysSystemLandscapePrg.prototype.getProgramName = function()
{
	return oFF.SubSysSystemLandscapePrg.DEFAULT_PROGRAM_NAME;
};
oFF.SubSysSystemLandscapePrg.prototype.setup = function()
{
	oFF.DfProgramSubSys.prototype.setup.call( this );
	this.m_systemLandscape = oFF.StandaloneSystemLandscape.create(this);
};
oFF.SubSysSystemLandscapePrg.prototype.getSubSystemType = function()
{
	return oFF.SubSystemType.SYSTEM_LANDSCAPE;
};
oFF.SubSysSystemLandscapePrg.prototype.runProcess = function()
{
	var environment = this.getProcess().getEnvironment();
	var systemLandscapeUrl = environment.getVariable(oFF.XEnvironmentConstants.SYSTEM_LANDSCAPE_URI);
	var doCont;
	if (oFF.XStringUtils.isNotNullAndNotEmpty(systemLandscapeUrl))
	{
		var uri = oFF.XUri.createFromFilePath(this.getProcess(), systemLandscapeUrl, oFF.PathFormat.AUTO_DETECT, oFF.VarResolveMode.DOLLAR, null);
		this.m_landscapeLoadAction = oFF.SystemLandscapeLoadAction.createAndRun(null, this, null, this, this.m_systemLandscape, null, uri);
		doCont = true;
	}
	else
	{
		this.onLandscapeNodeLoaded(oFF.SyncActionExtRes.createSyncAction(this.m_systemLandscape, null), this.m_systemLandscape, null);
		doCont = false;
	}
	return doCont;
};
oFF.SubSysSystemLandscapePrg.prototype.onLandscapeNodeLoaded = function(extResult, landscape, customIdentifier)
{
	if (oFF.notNull(extResult) && extResult.isValid())
	{
		this.activateSubSystem(extResult, oFF.SubSystemStatus.ACTIVE);
		this.prepareVfsSys();
	}
	else
	{
		this.activateSubSystem(extResult, oFF.SubSystemStatus.INACTIVE);
	}
};
oFF.SubSysSystemLandscapePrg.prototype.prepareVfsSys = function()
{
	var fileSystemManager = this.getProcess().getFileSystemManager();
	var vfs = fileSystemManager.getFileSystem(oFF.ProtocolType.VFS);
	if (oFF.notNull(vfs))
	{
		var attributesSysFolder = oFF.PrFactory.createStructure();
		attributesSysFolder.putString(oFF.XFileAttribute.SEMANTIC_TYPE.getName(), "folder.systems");
		attributesSysFolder.putString(oFF.XFileAttribute.DESCRIPTION.getName(), "System folder");
		vfs.addDirectory("/sys", attributesSysFolder);
		var process = this.getProcess();
		var systemLandscape = process.getSystemLandscape();
		var systemNames = systemLandscape.getSystemNames();
		for (var i = 0; i < systemNames.size(); i++)
		{
			var sysName = systemNames.get(i);
			var systemDescription = systemLandscape.getSystemDescription(sysName);
			var systemType = systemDescription.getSystemType();
			var sysPath = oFF.XStringUtils.concatenate2("/sys/", sysName);
			var attributesSys = oFF.PrFactory.createStructure();
			attributesSys.putString(oFF.XFileAttribute.DESCRIPTION.getName(), systemDescription.getText());
			attributesSys.putString(oFF.XFileAttribute.DISPLAY_NAME.getName(), systemDescription.getName());
			attributesSys.putString(oFF.XFileAttribute.SEMANTIC_TYPE.getName(), "system");
			attributesSys.putString(oFF.XFileAttribute.OLAP_DATASOURCE_SYSTEM.getName(), sysName);
			vfs.addDirectory(sysPath, attributesSys);
			if (systemType.isTypeOf(oFF.SystemType.BW) || systemType.isTypeOf(oFF.SystemType.HANA))
			{
				var olapCatalogPath = oFF.XStringUtils.concatenate2(sysPath, "/olap");
				var olapMountUrl = oFF.XUri.createFromUrl(oFF.XStringUtils.concatenate3("fsolapcatalog://", sysName, "/"));
				vfs.addMountPointByUri(olapCatalogPath, olapMountUrl);
			}
			var isOrca = systemType.isTypeOf(oFF.SystemType.ORCA);
			if (isOrca)
			{
				var clibPath = oFF.XStringUtils.concatenate2(sysPath, "/clib");
				var contentlibMountUrl = oFF.XUri.createFromUrl(oFF.XStringUtils.concatenate3("fscontentlib://", sysName, "/"));
				vfs.addMountPointByUri(clibPath, contentlibMountUrl);
			}
			var sysType = systemType.getName();
			attributesSys.putString(oFF.XFileAttribute.SYSTEM_TYPE.getName(), sysType);
		}
	}
};
oFF.SubSysSystemLandscapePrg.prototype.getMainApi = function()
{
	return this.m_systemLandscape;
};

oFF.SystemDescription = function() {};
oFF.SystemDescription.prototype = new oFF.XObjectExt();
oFF.SystemDescription.prototype._ff_c = "SystemDescription";

oFF.SystemDescription.create = function(systemLandscape, name, properties)
{
	return oFF.SystemDescription.createExt(null, systemLandscape, name, properties);
};
oFF.SystemDescription.createExt = function(session, systemLandscape, name, properties)
{
	var systemDescription = new oFF.SystemDescription();
	systemDescription.setupExt(systemLandscape, name, properties, null);
	return systemDescription;
};
oFF.SystemDescription.createByUri = function(systemLandscape, name, uri)
{
	var systemDescription = new oFF.SystemDescription();
	systemDescription.setupExt(systemLandscape, name, null, uri);
	return systemDescription;
};
oFF.SystemDescription.createByUriExt = function(session, systemLandscape, name, uri)
{
	var systemDescription = new oFF.SystemDescription();
	systemDescription.setupExt(systemLandscape, name, null, uri);
	return systemDescription;
};
oFF.SystemDescription.prototype.m_landscape = null;
oFF.SystemDescription.prototype.m_connectionProperties = null;
oFF.SystemDescription.prototype.m_contexts = null;
oFF.SystemDescription.prototype.m_systemMappings = null;
oFF.SystemDescription.prototype.m_nativeConnection = null;
oFF.SystemDescription.prototype.m_capabilitiesWhitelist = null;
oFF.SystemDescription.prototype.m_capabilitiesBlacklist = null;
oFF.SystemDescription.prototype.m_hashedTags = null;
oFF.SystemDescription.prototype.setupExt = function(systemLandscape, name, properties, uri)
{
	if (oFF.notNull(systemLandscape))
	{
		this.m_landscape = oFF.XWeakReferenceUtil.getWeakRef(systemLandscape);
	}
	this.m_connectionProperties = oFF.XProperties.create();
	this.m_systemMappings = oFF.XHashMapByString.create();
	var theUri = uri;
	if (oFF.notNull(properties))
	{
		var urlParameter = oFF.ConnectionParameters.URL;
		if (oFF.notNull(systemLandscape))
		{
			if (systemLandscape.enforceUseSecure())
			{
				urlParameter = oFF.ConnectionParameters.SECURE;
			}
		}
		var url = properties.getStringByKeyExt(urlParameter, null);
		if (oFF.notNull(url))
		{
			oFF.XObjectExt.assertNull(theUri);
			theUri = oFF.XUri.createFromUrl(url);
		}
	}
	if (oFF.notNull(theUri))
	{
		this.setUri(theUri);
	}
	if (oFF.notNull(properties))
	{
		var propertyIterator = properties.getKeysAsIteratorOfString();
		while (propertyIterator.hasNext())
		{
			var propertyKey = propertyIterator.next();
			var propertyValue = properties.getByKey(propertyKey);
			if (oFF.XString.startsWith(propertyKey, oFF.ConnectionParameters.MAPPING_SYSTEM_NAME))
			{
				var mappingId = oFF.XString.replace(propertyKey, oFF.ConnectionParameters.MAPPING_SYSTEM_NAME, "");
				var serializeTable = properties.getByKey(oFF.XStringUtils.concatenate2(oFF.ConnectionParameters.MAPPING_SERIALIZATION_TABLE, mappingId));
				var serializeSchema = properties.getByKey(oFF.XStringUtils.concatenate2(oFF.ConnectionParameters.MAPPING_SERIALIZATION_SCHEMA, mappingId));
				var deserializeTable = properties.getByKey(oFF.XStringUtils.concatenate2(oFF.ConnectionParameters.MAPPING_DESERIALIZATION_TABLE, mappingId));
				var deserializeSchema = properties.getByKey(oFF.XStringUtils.concatenate2(oFF.ConnectionParameters.MAPPING_DESERIALIZATION_SCHEMA, mappingId));
				this.m_systemMappings.put(propertyValue, oFF.SystemMapping.create(serializeTable, serializeSchema, deserializeTable, deserializeSchema));
			}
			this.setProperty(propertyKey, propertyValue);
		}
	}
	if (oFF.notNull(name))
	{
		this.setSystemName(name);
	}
	this.m_capabilitiesWhitelist = oFF.XHashMapByString.create();
	this.m_capabilitiesBlacklist = oFF.XHashMapByString.create();
	this.m_nativeConnection = null;
};
oFF.SystemDescription.prototype.setUri = function(uri)
{
	oFF.XConnectHelper.copyConnection(uri, this);
	if (oFF.notNull(uri))
	{
		var queryElements = uri.getQueryElements();
		var size = queryElements.size();
		for (var i = 0; i < size; i++)
		{
			var nameValuePair = queryElements.get(i);
			var key = oFF.XString.toUpperCase(nameValuePair.getName());
			var value = nameValuePair.getValue();
			this.setProperty(key, value);
		}
	}
};
oFF.SystemDescription.prototype.releaseObject = function()
{
	this.m_landscape = oFF.XObjectExt.release(this.m_landscape);
	this.m_systemMappings = oFF.XObjectExt.release(this.m_systemMappings);
	this.m_connectionProperties = null;
	this.m_capabilitiesWhitelist = oFF.XObjectExt.release(this.m_capabilitiesWhitelist);
	this.m_capabilitiesBlacklist = oFF.XObjectExt.release(this.m_capabilitiesBlacklist);
	this.m_nativeConnection = null;
	oFF.XObjectExt.prototype.releaseObject.call( this );
};
oFF.SystemDescription.prototype.getComponentType = function()
{
	return oFF.KernelComponentType.SYSTEM_DESCRIPTION;
};
oFF.SystemDescription.prototype.setFromPersonalization = function(personalization)
{
	oFF.XConnectHelper.copyConnectionPersonalization(personalization, this);
};
oFF.SystemDescription.prototype.setFromConnectionInfo = function(origin)
{
	oFF.XConnectHelper.copyConnectionInfo(origin, this);
};
oFF.SystemDescription.prototype.setFromConnection = function(connection)
{
	oFF.XConnectHelper.copyConnection(connection, this);
};
oFF.SystemDescription.prototype.isNode = function()
{
	return false;
};
oFF.SystemDescription.prototype.isLeaf = function()
{
	return true;
};
oFF.SystemDescription.prototype.getHost = function()
{
	return this.m_connectionProperties.getByKey(oFF.ConnectionParameters.HOST);
};
oFF.SystemDescription.prototype.isHostNullOrEmpty = function()
{
	var host = this.m_connectionProperties.getByKey(oFF.ConnectionParameters.HOST);
	return oFF.XStringUtils.isNullOrEmpty(host);
};
oFF.SystemDescription.prototype.getLandscape = function()
{
	return oFF.XWeakReferenceUtil.getHardRef(this.m_landscape);
};
oFF.SystemDescription.prototype.setConnected = function(isConnected)
{
	var isConnectedValue = isConnected ? "true" : "false";
	var fpaIsConnectedValue = this.m_connectionProperties.getByKey(oFF.ConnectionParameters.FPA_IS_CONNECTED);
	if (oFF.notNull(fpaIsConnectedValue))
	{
		this.setProperty(oFF.ConnectionParameters.FPA_IS_CONNECTED, isConnectedValue);
	}
	else
	{
		this.setProperty(oFF.ConnectionParameters.IS_CONNECTED, isConnectedValue);
	}
};
oFF.SystemDescription.prototype.setIsXAuthorizationRequired = function(isXAuthorizationRequired)
{
	this.setProperty(oFF.ConnectionParameters.IS_X_AUTHORIZATION_REQUIRED, isXAuthorizationRequired ? "true" : "false");
};
oFF.SystemDescription.prototype.getPassword = function()
{
	return this.m_connectionProperties.getByKey(oFF.ConnectionParameters.PASSWORD);
};
oFF.SystemDescription.prototype.getUser = function()
{
	return this.m_connectionProperties.getByKey(oFF.ConnectionParameters.USER);
};
oFF.SystemDescription.prototype.getOrganizationToken = function()
{
	return this.m_connectionProperties.getByKey(oFF.ConnectionParameters.ORGANIZATION_TOKEN);
};
oFF.SystemDescription.prototype.setOrganizationToken = function(organizationToken)
{
	this.setProperty(oFF.ConnectionParameters.ORGANIZATION_TOKEN, organizationToken);
};
oFF.SystemDescription.prototype.getElementToken = function()
{
	return this.m_connectionProperties.getByKey(oFF.ConnectionParameters.ELEMENT_TOKEN);
};
oFF.SystemDescription.prototype.setElementToken = function(elementToken)
{
	this.setProperty(oFF.ConnectionParameters.ELEMENT_TOKEN, elementToken);
};
oFF.SystemDescription.prototype.getUserToken = function()
{
	return this.m_connectionProperties.getByKey(oFF.ConnectionParameters.USER_TOKEN);
};
oFF.SystemDescription.prototype.setUserToken = function(userToken)
{
	this.setProperty(oFF.ConnectionParameters.USER_TOKEN, userToken);
};
oFF.SystemDescription.prototype.getTenantId = function()
{
	return this.m_connectionProperties.getByKey(oFF.ConnectionParameters.TENANT_ID);
};
oFF.SystemDescription.prototype.setTenantId = function(tenantId)
{
	this.setProperty(oFF.ConnectionParameters.TENANT_ID, tenantId);
};
oFF.SystemDescription.prototype.getInternalUser = function()
{
	return this.m_connectionProperties.getByKey(oFF.ConnectionParameters.INTERNAL_USER);
};
oFF.SystemDescription.prototype.setInternalUser = function(user)
{
	this.setProperty(oFF.ConnectionParameters.INTERNAL_USER, user);
};
oFF.SystemDescription.prototype.getX509Certificate = function()
{
	return this.m_connectionProperties.getByKey(oFF.ConnectionParameters.X509CERTIFICATE);
};
oFF.SystemDescription.prototype.setX509Certificate = function(x509Certificate)
{
	this.setProperty(oFF.ConnectionParameters.X509CERTIFICATE, x509Certificate);
};
oFF.SystemDescription.prototype.getSecureLoginProfile = function()
{
	return this.m_connectionProperties.getByKey(oFF.ConnectionParameters.SECURE_LOGIN_PROFILE);
};
oFF.SystemDescription.prototype.setSecureLoginProfile = function(secureLoginProfile)
{
	this.setProperty(oFF.ConnectionParameters.SECURE_LOGIN_PROFILE, secureLoginProfile);
};
oFF.SystemDescription.prototype.getLanguage = function()
{
	return this.m_connectionProperties.getByKey(oFF.ConnectionParameters.LANGUAGE);
};
oFF.SystemDescription.prototype.setLanguage = function(language)
{
	this.setProperty(oFF.ConnectionParameters.LANGUAGE, language);
};
oFF.SystemDescription.prototype.setEqsRewritings = function(patterns)
{
	this.m_connectionProperties.putString(oFF.ConnectionParameters.EQS_PATTERNS, patterns);
};
oFF.SystemDescription.prototype.getEqsRewritings = function()
{
	var eqsPatterns = this.m_connectionProperties.getStringByKey(oFF.ConnectionParameters.EQS_PATTERNS);
	if (oFF.XStringUtils.isNotNullAndNotEmpty(eqsPatterns))
	{
		var list = oFF.XList.create();
		var expressions = oFF.XStringTokenizer.splitString(eqsPatterns, ";");
		for (var i = 0; i < expressions.size(); i++)
		{
			var singleExpr = expressions.get(i);
			if (oFF.XStringUtils.isNotNullAndNotEmpty(singleExpr))
			{
				var nameValueExpr = oFF.XStringTokenizer.splitString(singleExpr, "=>");
				if (nameValueExpr.size() === 2)
				{
					var theName = nameValueExpr.get(0);
					var theValue = nameValueExpr.get(1);
					list.add(oFF.XNameValuePair.create(theName, theValue));
				}
			}
		}
		return list;
	}
	else
	{
		return null;
	}
};
oFF.SystemDescription.prototype.getAuthenticationType = function()
{
	var type = null;
	var value = this.m_connectionProperties.getByKey(oFF.ConnectionParameters.AUTHENTICATION_TYPE);
	if (oFF.notNull(value))
	{
		type = oFF.AuthenticationType.lookup(value);
	}
	if (oFF.isNull(type))
	{
		type = oFF.AuthenticationType.NONE;
	}
	return type;
};
oFF.SystemDescription.prototype.setAuthenticationType = function(type)
{
	this.setProperty(oFF.ConnectionParameters.AUTHENTICATION_TYPE, type.getName());
};
oFF.SystemDescription.prototype.setHost = function(host)
{
	this.setProperty(oFF.ConnectionParameters.HOST, host);
};
oFF.SystemDescription.prototype.setPassword = function(password)
{
	this.setProperty(oFF.ConnectionParameters.PASSWORD, password);
};
oFF.SystemDescription.prototype.setAuthenticationToken = function(token)
{
	if (oFF.notNull(token))
	{
		this.setProperty(oFF.ConnectionParameters.TOKEN_VALUE, token.getAccessToken());
	}
	else
	{
		this.setProperty(oFF.ConnectionParameters.TOKEN_VALUE, null);
	}
};
oFF.SystemDescription.prototype.getAuthenticationToken = function()
{
	var token = null;
	var value = this.m_connectionProperties.getByKey(oFF.ConnectionParameters.TOKEN_VALUE);
	if (oFF.notNull(value))
	{
		token = oFF.XAuthenticationToken.create(value);
	}
	return token;
};
oFF.SystemDescription.prototype.setAccessToken = function(token)
{
	this.setProperty(oFF.ConnectionParameters.TOKEN_VALUE, token);
};
oFF.SystemDescription.prototype.getAccessToken = function()
{
	return this.m_connectionProperties.getByKey(oFF.ConnectionParameters.TOKEN_VALUE);
};
oFF.SystemDescription.prototype.setPort = function(port)
{
	var value = oFF.XInteger.convertToString(port);
	this.setProperty(oFF.ConnectionParameters.PORT, value);
};
oFF.SystemDescription.prototype.getPort = function()
{
	var value = this.m_connectionProperties.getByKey(oFF.ConnectionParameters.PORT);
	var defaultPort = 0;
	var internetProtocolType = this.getProtocolType();
	if (oFF.ProtocolType.HTTP === internetProtocolType)
	{
		defaultPort = 80;
	}
	else if (oFF.ProtocolType.HTTPS === internetProtocolType)
	{
		defaultPort = 443;
	}
	return oFF.XInteger.convertFromStringWithDefault(value, defaultPort);
};
oFF.SystemDescription.prototype.getPath = function()
{
	return this.m_connectionProperties.getByKey(oFF.ConnectionParameters.PATH);
};
oFF.SystemDescription.prototype.getPathContainer = oFF.noSupport;
oFF.SystemDescription.prototype.getPathContainerBase = oFF.noSupport;
oFF.SystemDescription.prototype.normalizePath = oFF.noSupport;
oFF.SystemDescription.prototype.setPath = function(path)
{
	this.setProperty(oFF.ConnectionParameters.PATH, path);
};
oFF.SystemDescription.prototype.getClient = function()
{
	return this.m_connectionProperties.getByKey(oFF.ConnectionParameters.CLIENT);
};
oFF.SystemDescription.prototype.setClient = function(client)
{
	this.setProperty(oFF.ConnectionParameters.CLIENT, client);
};
oFF.SystemDescription.prototype.getOemApplicationId = function()
{
	return this.m_connectionProperties.getByKey(oFF.ConnectionParameters.OEM_APPLICATION_ID);
};
oFF.SystemDescription.prototype.setOemApplicationId = function(oemApplicationId)
{
	this.setProperty(oFF.ConnectionParameters.OEM_APPLICATION_ID, oemApplicationId);
};
oFF.SystemDescription.prototype.setUser = function(user)
{
	this.setProperty(oFF.ConnectionParameters.USER, user);
};
oFF.SystemDescription.prototype.getTimeout = function()
{
	return this.m_connectionProperties.getIntegerByKeyExt(oFF.ConnectionParameters.TIMEOUT, -1);
};
oFF.SystemDescription.prototype.setTimeout = function(milliseconds)
{
	var value = oFF.XInteger.convertToString(milliseconds);
	this.setProperty(oFF.ConnectionParameters.TIMEOUT, value);
};
oFF.SystemDescription.prototype.getScheme = function()
{
	return this.getProtocolType().getName();
};
oFF.SystemDescription.prototype.getProtocolType = function()
{
	var typeValue = this.m_connectionProperties.getByKey(oFF.ConnectionParameters.PROTOCOL);
	return oFF.isNull(typeValue) ? oFF.ProtocolType.HTTP : oFF.ProtocolType.lookup(typeValue);
};
oFF.SystemDescription.prototype.setScheme = function(scheme)
{
	this.setProperty(oFF.ConnectionParameters.PROTOCOL, scheme);
};
oFF.SystemDescription.prototype.setProtocolType = function(type)
{
	this.setProperty(oFF.ConnectionParameters.PROTOCOL, oFF.isNull(type) ? null : type.getName());
};
oFF.SystemDescription.prototype.isContextIdRequired = function()
{
	var systemType = this.getSystemType();
	var isContextIdRequiredDefault = systemType.isContextIdRequired();
	return this.m_connectionProperties.getBooleanByKeyExt(oFF.ConnectionParameters.IS_CONTEXT_ID_REQUIRED, isContextIdRequiredDefault);
};
oFF.SystemDescription.prototype.setIsContextIdRequired = function(isContextIdRequired)
{
	this.m_connectionProperties.putBoolean(oFF.ConnectionParameters.IS_CONTEXT_ID_REQUIRED, isContextIdRequired);
};
oFF.SystemDescription.prototype.isCsrfTokenRequired = function()
{
	var systemType = this.getSystemType();
	var isCsrfTokenRequiredDefault = systemType.isCsrfTokenRequired();
	return this.m_connectionProperties.getBooleanByKeyExt(oFF.ConnectionParameters.IS_CSRF_REQUIRED, isCsrfTokenRequiredDefault);
};
oFF.SystemDescription.prototype.setIsCsrfTokenRequired = function(isCsrfTokenRequired)
{
	this.m_connectionProperties.putBoolean(oFF.ConnectionParameters.IS_CSRF_REQUIRED, isCsrfTokenRequired);
};
oFF.SystemDescription.prototype.isMasterSystem = function()
{
	var landscape = this.getLandscape();
	return oFF.notNull(landscape) && oFF.XString.isEqual(landscape.getMasterSystemName(), this.getSystemName());
};
oFF.SystemDescription.prototype.getPrefix = function()
{
	return this.m_connectionProperties.getByKey(oFF.ConnectionParameters.PREFIX);
};
oFF.SystemDescription.prototype.setPrefix = function(prefix)
{
	this.setProperty(oFF.ConnectionParameters.PREFIX, prefix);
};
oFF.SystemDescription.prototype.getSessionCarrierType = function()
{
	var typeValue = this.m_connectionProperties.getByKey(oFF.ConnectionParameters.SESSION_CARRIER_TYPE);
	if (oFF.isNull(typeValue))
	{
		var systemType = this.getSystemType();
		if (systemType.isTypeOf(oFF.SystemType.ABAP))
		{
			return oFF.SessionCarrierType.SAP_URL_REWRITING;
		}
		else
		{
			return oFF.SessionCarrierType.NONE;
		}
	}
	else
	{
		return oFF.SessionCarrierType.lookup(typeValue);
	}
};
oFF.SystemDescription.prototype.setSessionCarrierType = function(sessionCarrierType)
{
	this.setProperty(oFF.ConnectionParameters.SESSION_CARRIER_TYPE, sessionCarrierType.getName());
};
oFF.SystemDescription.prototype.isCorrelationIdActive = function()
{
	return this.m_connectionProperties.getBooleanByKeyExt(oFF.ConnectionParameters.CORRELATION_ID_ACTIVE, false);
};
oFF.SystemDescription.prototype.isSapPassportActive = function()
{
	return this.m_connectionProperties.getBooleanByKeyExt(oFF.ConnectionParameters.SAP_PASSPORT_ACTIVE, false);
};
oFF.SystemDescription.prototype.setCorrelationIdActive = function(isActive)
{
	this.m_connectionProperties.putBoolean(oFF.ConnectionParameters.CORRELATION_ID_ACTIVE, isActive);
};
oFF.SystemDescription.prototype.setSapPassportActive = function(isActive)
{
	this.m_connectionProperties.putBoolean(oFF.ConnectionParameters.SAP_PASSPORT_ACTIVE, isActive);
};
oFF.SystemDescription.prototype.getWebdispatcherTemplate = function()
{
	return this.m_connectionProperties.getByKey(oFF.ConnectionParameters.WEBDISPATCHER_URI);
};
oFF.SystemDescription.prototype.setWebdispatcherUri = function(template)
{
	this.setWebdispatcherTemplate(template);
};
oFF.SystemDescription.prototype.setWebdispatcherTemplate = function(template)
{
	this.setProperty(oFF.ConnectionParameters.WEBDISPATCHER_URI, template);
};
oFF.SystemDescription.prototype.isPreflightRequired = function()
{
	return oFF.XStringUtils.isNotNullAndNotEmpty(this.getResolvedPreflightUrl());
};
oFF.SystemDescription.prototype.getResolvedPreflightUrl = function()
{
	var uri = this.getPreflightUrl();
	if (oFF.XStringUtils.isNullOrEmpty(uri) && this.getSystemType().isPreflightRequired())
	{
		uri = "/";
	}
	return uri;
};
oFF.SystemDescription.prototype.getPreflightUrl = function()
{
	return this.m_connectionProperties.getByKey(oFF.ConnectionParameters.PREFLIGHT);
};
oFF.SystemDescription.prototype.setPreflightUrl = function(preflightUrl)
{
	this.setProperty(oFF.ConnectionParameters.PREFLIGHT, preflightUrl);
};
oFF.SystemDescription.prototype.setTags = function(tags)
{
	this.setProperty(oFF.ConnectionParameters.TAGS, tags);
};
oFF.SystemDescription.prototype.getTags = function()
{
	var tags = this.m_connectionProperties.getByKey(oFF.ConnectionParameters.TAGS);
	if (oFF.isNull(tags))
	{
		return oFF.XHashSetOfString.create();
	}
	return oFF.XStringTokenizer.splitString(tags, ",");
};
oFF.SystemDescription.prototype.getHashedTags = function()
{
	if (oFF.isNull(this.m_hashedTags))
	{
		var tags = this.getTags();
		this.m_hashedTags = oFF.XHashSetOfString.create();
		var iterator = tags.getIterator();
		while (iterator.hasNext())
		{
			this.m_hashedTags.add(iterator.next());
		}
	}
	return this.m_hashedTags;
};
oFF.SystemDescription.prototype.getRoles = function()
{
	var roles = oFF.XList.create();
	var rolesList = this.getTags().getIterator();
	while (rolesList.hasNext())
	{
		var role = oFF.SystemRole.lookup(rolesList.next());
		if (oFF.notNull(role))
		{
			roles.add(role);
		}
	}
	return roles;
};
oFF.SystemDescription.prototype.getSystemMapping = function(systemName)
{
	return this.m_systemMappings.getByKey(systemName);
};
oFF.SystemDescription.prototype.getSystemMappings = function()
{
	return this.m_systemMappings;
};
oFF.SystemDescription.prototype.getProperties = function()
{
	return this.m_connectionProperties;
};
oFF.SystemDescription.prototype.setProperty = function(name, value)
{
	if (oFF.isNull(value))
	{
		this.m_connectionProperties.remove(name);
	}
	else
	{
		var actualValue = value;
		if (oFF.XString.isEqual(name, oFF.ConnectionParameters.LANGUAGE))
		{
			actualValue = oFF.XString.toUpperCase(value);
		}
		this.m_connectionProperties.put(name, actualValue);
	}
};
oFF.SystemDescription.prototype.getName = function()
{
	return this.getSystemName();
};
oFF.SystemDescription.prototype.setName = function(name)
{
	this.setSystemName(name);
};
oFF.SystemDescription.prototype.getSystemName = function()
{
	return this.m_connectionProperties.getByKey(oFF.ConnectionParameters.NAME);
};
oFF.SystemDescription.prototype.setSystemName = function(systemName)
{
	this.setProperty(oFF.ConnectionParameters.NAME, systemName);
};
oFF.SystemDescription.prototype.getText = function()
{
	return this.getSystemText();
};
oFF.SystemDescription.prototype.setText = function(text)
{
	this.setSystemText(text);
};
oFF.SystemDescription.prototype.getSystemText = function()
{
	return this.m_connectionProperties.getByKey(oFF.ConnectionParameters.DESCRIPTION);
};
oFF.SystemDescription.prototype.setSystemText = function(systemText)
{
	this.setProperty(oFF.ConnectionParameters.DESCRIPTION, systemText);
};
oFF.SystemDescription.prototype.getSystemType = function()
{
	var sysTypeValue = this.m_connectionProperties.getByKey(oFF.ConnectionParameters.SYSTEM_TYPE);
	if (oFF.isNull(sysTypeValue))
	{
		sysTypeValue = this.m_connectionProperties.getByKey(oFF.ConnectionParameters.SYSTYPE);
	}
	var systemType = null;
	if (oFF.notNull(sysTypeValue))
	{
		systemType = oFF.SystemType.lookup(sysTypeValue);
	}
	if (oFF.isNull(systemType))
	{
		systemType = oFF.SystemType.GENERIC;
	}
	return systemType;
};
oFF.SystemDescription.prototype.setSystemType = function(systemType)
{
	this.setProperty(oFF.ConnectionParameters.SYSTEM_TYPE, systemType.getName());
};
oFF.SystemDescription.prototype.getProxyHost = function()
{
	return this.m_connectionProperties.getByKey(oFF.ConnectionParameters.PROXY_HOST);
};
oFF.SystemDescription.prototype.setProxyHost = function(host)
{
	this.setProperty(oFF.ConnectionParameters.PROXY_HOST, host);
};
oFF.SystemDescription.prototype.getProxyAuthorization = function()
{
	return this.m_connectionProperties.getByKey(oFF.ConnectionParameters.PROXY_AUTHORIZATION);
};
oFF.SystemDescription.prototype.setProxyAuthorization = function(authorization)
{
	this.setProperty(oFF.ConnectionParameters.PROXY_AUTHORIZATION, authorization);
};
oFF.SystemDescription.prototype.getSccLocationId = function()
{
	return null;
};
oFF.SystemDescription.prototype.setSccLocationId = function(sccLocationId) {};
oFF.SystemDescription.prototype.getProxyHttpHeaders = function()
{
	return null;
};
oFF.SystemDescription.prototype.setProxyHttpHeader = function(name, value) {};
oFF.SystemDescription.prototype.getProxyType = function()
{
	var result = oFF.ProxyType.DEFAULT;
	var typeValue = this.m_connectionProperties.getByKey(oFF.ConnectionParameters.PROXY_TYPE);
	if (oFF.notNull(typeValue))
	{
		result = oFF.ProxyType.lookup(typeValue);
	}
	if (result === oFF.ProxyType.DEFAULT)
	{
		var template = this.getWebdispatcherTemplate();
		result = oFF.XStringUtils.isNullOrEmpty(template) ? oFF.ProxyType.DEFAULT : oFF.ProxyType.WEBDISPATCHER;
	}
	return result;
};
oFF.SystemDescription.prototype.setProxyType = function(type)
{
	if (oFF.notNull(type))
	{
		this.setProperty(oFF.ConnectionParameters.PROXY_TYPE, type.getName());
	}
};
oFF.SystemDescription.prototype.getProxyPort = function()
{
	return this.m_connectionProperties.getIntegerByKeyExt(oFF.ConnectionParameters.PROXY_PORT, -1);
};
oFF.SystemDescription.prototype.setProxyPort = function(port)
{
	this.setProperty(oFF.ConnectionParameters.PROXY_PORT, oFF.XInteger.convertToString(port));
};
oFF.SystemDescription.prototype.getUrl = function()
{
	return oFF.XUri.getUrlStatic(this, null, true, true, true, true, true, true, true, true, true);
};
oFF.SystemDescription.prototype.getUrlWithoutAuthentication = function()
{
	return oFF.XUri.getUrlStatic(this, null, true, true, false, false, false, true, true, true, true);
};
oFF.SystemDescription.prototype.getUrlExt = function(withScheme, withAuthority, withUser, withPwd, withAuthenticationType, withHostPort, withPath, withQuery, withFragment)
{
	return oFF.XUri.getUrlStatic(this, null, withAuthority, withScheme, withUser, withPwd, withAuthenticationType, withHostPort, withPath, withQuery, withFragment);
};
oFF.SystemDescription.prototype.getUrlWithMask = function(mask)
{
	return oFF.XUri.getUrlStatic(this, null, mask.isWithAuthority(), mask.isWithScheme(), mask.isWithUser(), mask.isWithPwd(), mask.isWithAuthenticationType(), mask.isWithHostPort(), mask.isWithPath(), mask.isWithQuery(), mask.isWithFragment());
};
oFF.SystemDescription.prototype.getTagValue = function(tagName)
{
	return this.m_connectionProperties.getByKey(tagName);
};
oFF.SystemDescription.prototype.getContentElement = function()
{
	return this;
};
oFF.SystemDescription.prototype.getContentConstant = function()
{
	return null;
};
oFF.SystemDescription.prototype.getNativeConnection = function()
{
	return this.m_nativeConnection;
};
oFF.SystemDescription.prototype.setNativeConnection = function(nativeConnection)
{
	this.m_nativeConnection = nativeConnection;
};
oFF.SystemDescription.prototype.setIncludedCapabilitiesForService = function(serviceName, capabilities)
{
	if (oFF.XStringUtils.isNotNullAndNotEmpty(serviceName) && oFF.notNull(capabilities))
	{
		this.m_capabilitiesWhitelist.put(serviceName, capabilities);
	}
};
oFF.SystemDescription.prototype.setExcludedCapabilitiesForService = function(serviceName, capabilities)
{
	if (oFF.XStringUtils.isNotNullAndNotEmpty(serviceName) && oFF.notNull(capabilities))
	{
		this.m_capabilitiesBlacklist.put(serviceName, capabilities);
	}
};
oFF.SystemDescription.prototype.getIncludedCapabilitiesForService = function(serviceName)
{
	return this.m_capabilitiesWhitelist.getByKey(serviceName);
};
oFF.SystemDescription.prototype.getExcludedCapabilitiesForService = function(serviceName)
{
	return this.m_capabilitiesBlacklist.getByKey(serviceName);
};
oFF.SystemDescription.prototype.isSystemMappingValid = function(remoteSystemDesription)
{
	if (oFF.isNull(remoteSystemDesription))
	{
		return false;
	}
	var mapping = this.getSystemMapping(remoteSystemDesription.getSystemName());
	var mappingRemote = remoteSystemDesription.getSystemMapping(this.getSystemName());
	return oFF.notNull(mapping) && oFF.notNull(mappingRemote) && mapping.isValid(mappingRemote);
};
oFF.SystemDescription.prototype.getAlias = function()
{
	return this.m_connectionProperties.getByKey(oFF.ConnectionParameters.ALIAS);
};
oFF.SystemDescription.prototype.setAlias = function(alias)
{
	this.setProperty(oFF.ConnectionParameters.ALIAS, alias);
};
oFF.SystemDescription.prototype.getRawContexts = function()
{
	return this.m_contexts;
};
oFF.SystemDescription.prototype.setRawContexts = function(contexts)
{
	this.m_contexts = contexts;
};
oFF.SystemDescription.prototype.getAssociatedHanaSystem = function()
{
	return this.m_connectionProperties.getByKey(oFF.ConnectionParameters.ASSOCIATED_HANA_SYSTEM);
};
oFF.SystemDescription.prototype.setAssociatedHanaSystem = function(associatedHanaSystem)
{
	this.m_connectionProperties.put(oFF.ConnectionParameters.ASSOCIATED_HANA_SYSTEM, associatedHanaSystem);
};
oFF.SystemDescription.prototype.setKeepAliveIntervalMs = function(intervalMs)
{
	var value = oFF.XInteger.convertToString(intervalMs);
	if (intervalMs < 0)
	{
		throw oFF.XException.createIllegalArgumentException(oFF.XStringUtils.concatenate4("Keep alive for system ", this.getName(), " must be > 0, but was ", value));
	}
	this.setProperty(oFF.ConnectionParameters.KEEP_ALIVE_INTERVAL, value);
};
oFF.SystemDescription.prototype.setKeepAliveDelayMs = function(delayMs)
{
	this.setProperty(oFF.ConnectionParameters.KEEP_ALIVE_DELAY, oFF.XInteger.convertToString(delayMs));
};
oFF.SystemDescription.prototype.getKeepAliveIntervalMs = function()
{
	return this.m_connectionProperties.getIntegerByKeyExt(oFF.ConnectionParameters.KEEP_ALIVE_INTERVAL, 60000);
};
oFF.SystemDescription.prototype.getKeepAliveDelayMs = function()
{
	return this.m_connectionProperties.getIntegerByKeyExt(oFF.ConnectionParameters.KEEP_ALIVE_DELAY, -1);
};
oFF.SystemDescription.prototype.setTenantRootPackage = function(rootPackage)
{
	this.setProperty(oFF.ConnectionParameters.TENANT_ROOT_PACKAGE, rootPackage);
};
oFF.SystemDescription.prototype.getTenantRootPackage = function()
{
	return this.m_connectionProperties.getByKey(oFF.ConnectionParameters.TENANT_ROOT_PACKAGE);
};
oFF.SystemDescription.prototype.isConnected = function()
{
	var isConnectedValue = this.m_connectionProperties.getByKey(oFF.ConnectionParameters.FPA_IS_CONNECTED);
	if (oFF.isNull(isConnectedValue))
	{
		isConnectedValue = this.m_connectionProperties.getByKey(oFF.ConnectionParameters.IS_CONNECTED);
	}
	return oFF.XString.isEqual(isConnectedValue, "true");
};
oFF.SystemDescription.prototype.isXAuthorizationRequired = function()
{
	var isXAuthorizationRequired = this.m_connectionProperties.getByKey(oFF.ConnectionParameters.IS_X_AUTHORIZATION_REQUIRED);
	return oFF.XString.isEqual(isXAuthorizationRequired, "true");
};
oFF.SystemDescription.prototype.getLastChangedDate = function()
{
	var lastChangedDate = this.m_connectionProperties.getByKey(oFF.ConnectionParameters.FPA_MODIFIED_AT);
	return oFF.XDateTime.createDateTimeFromString(lastChangedDate, oFF.DateTimeFormat.ISO);
};
oFF.SystemDescription.prototype.setLastChangedDate = function(date)
{
	this.setProperty(oFF.ConnectionParameters.FPA_MODIFIED_AT, date.toIso8601Format());
};
oFF.SystemDescription.prototype.getCreatedDate = function()
{
	var lastChangedDate = this.m_connectionProperties.getByKey(oFF.ConnectionParameters.FPA_CREATED_AT);
	return oFF.XDateTime.createDateTimeFromString(lastChangedDate, oFF.DateTimeFormat.ISO);
};
oFF.SystemDescription.prototype.setCreatedDate = function(date)
{
	this.setProperty(oFF.ConnectionParameters.FPA_CREATED_AT, date.toIso8601Format());
};
oFF.SystemDescription.prototype.getLastChangedBy = function()
{
	return null;
};
oFF.SystemDescription.prototype.setLastChangedBy = function(user) {};
oFF.SystemDescription.prototype.getCreatedBy = function()
{
	var createdByName = this.m_connectionProperties.getByKey(oFF.ConnectionParameters.FPA_CREATED_BY);
	if (oFF.isNull(createdByName))
	{
		createdByName = "";
	}
	var userInfo = oFF.UserProfile.create();
	userInfo.setSAPName(createdByName);
	return userInfo;
};
oFF.SystemDescription.prototype.setCreatedBy = function(user)
{
	this.setProperty(oFF.ConnectionParameters.FPA_CREATED_BY, user.getName());
};
oFF.SystemDescription.prototype.toString = function()
{
	var sb = oFF.XStringBuffer.create();
	sb.append("System:");
	var name = this.getSystemName();
	if (oFF.notNull(name))
	{
		sb.append(" ").append(name);
	}
	var text = this.getSystemText();
	if (oFF.notNull(text))
	{
		sb.append(" - ").append(text);
	}
	sb.appendNewLine();
	var properties = this.getProperties();
	if (oFF.XCollectionUtils.hasElements(properties))
	{
		var propertyNames = oFF.XListOfString.createFromReadOnlyList(properties.getKeysAsReadOnlyListOfString());
		propertyNames.sortByDirection(oFF.XSortDirection.ASCENDING);
		for (var i = 0; i < propertyNames.size(); i++)
		{
			var propertyName = propertyNames.get(i);
			if (oFF.isNull(propertyName))
			{
				continue;
			}
			sb.append(propertyName).append("=");
			if (oFF.XString.isEqual(propertyName, oFF.ConnectionParameters.PASSWORD))
			{
				sb.append("**********");
			}
			else
			{
				var propertyValue = properties.getByKey(propertyName);
				if (oFF.notNull(propertyValue))
				{
					sb.append(propertyValue);
				}
			}
			sb.appendNewLine();
		}
	}
	return sb.toString();
};

oFF.ProgramStartAction = function() {};
oFF.ProgramStartAction.prototype = new oFF.SyncAction();
oFF.ProgramStartAction.prototype._ff_c = "ProgramStartAction";

oFF.ProgramStartAction.createAndRun = function(syncType, listener, customIdentifier, startCfg)
{
	var object = new oFF.ProgramStartAction();
	object.setupActionAndRun(syncType, listener, customIdentifier, startCfg);
	return object;
};
oFF.ProgramStartAction.prototype.m_subSystems = null;
oFF.ProgramStartAction.prototype.m_subSystemsRemaining = null;
oFF.ProgramStartAction.prototype.setupAction = function(syncType, listener, customIdentifier, context)
{
	oFF.SyncAction.prototype.setupAction.call( this , syncType, listener, customIdentifier, context);
	this.m_subSystems = oFF.XListOfNameObject.create();
	this.m_subSystemsRemaining = oFF.XListOfNameObject.create();
};
oFF.ProgramStartAction.prototype.getLogLayer = function()
{
	return oFF.OriginLayer.KERNEL;
};
oFF.ProgramStartAction.prototype.processSynchronization = function(syncType)
{
	var startCfg = this.getActionContext();
	var manifest = startCfg.getProgramManifest();
	var toBeContinued = true;
	if (oFF.notNull(manifest))
	{
		var kernel = startCfg.getParentProcess().getKernel();
		if (kernel.isExecutable(manifest) === false)
		{
			this.addError(0, oFF.XStringUtils.concatenate3("Cannot run program '", manifest.getName(), "'"));
			toBeContinued = false;
		}
		if (toBeContinued === true)
		{
			var parentProcess = startCfg.getParentProcess();
			if (oFF.notNull(parentProcess))
			{
				var dependencies = manifest.getDependencies();
				var resolvedDependencies = oFF.XListOfString.create();
				resolvedDependencies.addAll(dependencies);
				for (var k = 0; k < resolvedDependencies.size(); )
				{
					var moduleName = resolvedDependencies.get(k);
					if (kernel.isModuleLoaded(moduleName) === true)
					{
						resolvedDependencies.removeAt(k);
					}
					else
					{
						k++;
					}
				}
				if (resolvedDependencies.size() > 0)
				{
					kernel.processModuleLoad(this.getActiveSyncType(), this, startCfg, resolvedDependencies);
				}
				else
				{
					var messageMgr = oFF.MessageManagerSimple.createMessageManager();
					var extResult = oFF.ExtResult.create(null, messageMgr);
					this.onModuleLoadedMulti(extResult, null, startCfg);
				}
			}
			else
			{
				this.addError(0, oFF.XStringUtils.concatenate2("Cannot start program: No parent process given for : ", startCfg.getName()));
				toBeContinued = false;
			}
		}
	}
	else
	{
		this.addError(0, oFF.XStringUtils.concatenate2("Cannot start program: Program manifest cannot be found: ", startCfg.getName()));
		toBeContinued = false;
	}
	return toBeContinued;
};
oFF.ProgramStartAction.prototype.onModuleLoadedMulti = function(extResult, rootModuleNames, customIdentifier)
{
	this.addAllMessages(extResult);
	if (extResult.isValid())
	{
		var startCfg = this.getActionContext();
		var manifest = startCfg.getProgramManifest();
		var parentProcess = startCfg.getParentProcess();
		var kernel = parentProcess.getKernel();
		var subSystems = manifest.getSubSystems();
		var subSystemType;
		var container;
		for (var k = 0; k < subSystems.size(); k++)
		{
			var name = subSystems.get(k);
			subSystemType = oFF.SubSystemType.lookup(name);
			if (oFF.isNull(subSystemType))
			{
				this.addError(0, oFF.XStringUtils.concatenate2("Unknown subsystem type: ", name));
			}
			else
			{
				this.m_subSystems.add(subSystemType);
			}
		}
		if (this.isValid())
		{
			var outputContainerType = manifest.getOutputContainerType();
			if (outputContainerType.isUiContainer())
			{
				if (subSystems.contains(oFF.SubSystemType.GUI.getName()) === false)
				{
					this.m_subSystems.insert(0, oFF.SubSystemType.GUI);
				}
			}
			for (var m = 0; m < this.m_subSystems.size(); )
			{
				subSystemType = this.m_subSystems.get(m);
				container = kernel.getSubSystemContainer(subSystemType);
				if (container.getStatus() === oFF.SubSystemStatus.ACTIVE || container.getStatus() === oFF.SubSystemStatus.INACTIVE)
				{
					this.m_subSystems.removeAt(m);
				}
				else
				{
					m++;
				}
			}
			if (this.m_subSystems.size() > 0)
			{
				this.m_subSystemsRemaining.addAll(this.m_subSystems);
				this.log2("Initializing inactive subsystems: ", this.m_subSystems.toString());
				for (var o = 0; o < this.m_subSystems.size(); o++)
				{
					subSystemType = this.m_subSystems.get(o);
					container = kernel.getSubSystemContainer(subSystemType);
					container.processSubSystemLoad(this.getActiveSyncType(), this, subSystemType);
				}
			}
			else
			{
				this.bigCinema();
			}
		}
		else
		{
			this.endSync();
		}
	}
	else
	{
		this.endSync();
	}
};
oFF.ProgramStartAction.prototype.onSubSystemLoaded = function(extResult, subSystem, customIdentifier)
{
	this.addAllMessages(extResult);
	var type = customIdentifier;
	this.m_subSystemsRemaining.removeElement(type);
	if (extResult.isValid())
	{
		this.log2("Subsystems loaded: ", type.toString());
	}
	else
	{
		this.logError4("Error loading subsystems: ", type.toString(), " - ", extResult.getSummary());
	}
	if (this.m_subSystemsRemaining.isEmpty())
	{
		this.bigCinema();
	}
	else
	{
		this.log2("Remaining subsystems in loading...: ", this.m_subSystemsRemaining.toString());
	}
};
oFF.ProgramStartAction.prototype.bigCinema = function()
{
	if (this.isValid())
	{
		var startCfg = this.getActionContext();
		var manifest = startCfg.getProgramManifest();
		this.log2("Starting program: ", manifest.getName());
		var factory = manifest.getFactory();
		if (oFF.isNull(factory))
		{
			this.addError(0, oFF.XStringUtils.concatenate2("Cannot create factory for program ", manifest.getName()));
		}
		else
		{
			var newProgram = factory.newProgram();
			this.setData(newProgram);
			var startCfgClone = oFF.XObjectExt.cloneIfNotNull(startCfg);
			startCfgClone.setProgram(newProgram);
			var process = this.newProcess(startCfgClone);
			newProgram.setProcess(process);
			var programContainer = this.newProgramContainer(startCfgClone, newProgram, process);
			var kernel = process.getKernel();
			process.registerOnEvent(kernel);
			process.notifyProcessEvent(oFF.ProcessEventType.CREATED);
			try
			{
				programContainer.runFull();
				process.notifyProcessEvent(oFF.ProcessEventType.PROGRAM_STARTED);
			}
			catch (e)
			{
				this.addError(0, oFF.XStringUtils.concatenate4("Failed to start ", manifest.getName(), " program! \n Reason: ", oFF.XException.getMessage(e)));
				oFF.XLogger.println(oFF.XException.getStackTrace(e, 0));
				process.notifyProcessEvent(oFF.ProcessEventType.PROGRAM_STARTUP_ERROR);
			}
		}
	}
	this.endSync();
};
oFF.ProgramStartAction.prototype.newProcess = function(startCfg)
{
	var process = startCfg.getProgramProcess();
	if (oFF.isNull(process))
	{
		var parentProcess = startCfg.getParentProcess();
		var usedParentProcess;
		if (startCfg.isCreatingChildProcess())
		{
			usedParentProcess = parentProcess;
		}
		else
		{
			var kernel = parentProcess.getKernel();
			usedParentProcess = kernel.getKernelProcess();
		}
		var programManifest = startCfg.getProgramManifest();
		var type = programManifest.getProcessType();
		process = usedParentProcess.newChildProcess(type);
		if (startCfg.isUsingParentEnvironment())
		{
			process.setEnvironment(parentProcess.getEnvironment());
		}
		process.setStartConfiguration(startCfg);
		process.setNativeAnchorId(startCfg.getNativeAnchorId());
		process.setNativeAnchorObject(startCfg.getNativeAnchorObject());
		var outputContainerType = startCfg.getResolvedContainerType();
		if (outputContainerType === oFF.ProgramContainerType.CONSOLE)
		{
			var capabilities = oFF.XHashSetOfString.create();
			capabilities.add("terminal");
			process.setCapabilities(capabilities);
		}
		var listeners = startCfg.getAllProcessEventListeners();
		for (var i = 0; i < listeners.size(); i++)
		{
			var currentListener = listeners.get(i);
			process.registerOnEvent(currentListener);
		}
	}
	return process;
};
oFF.ProgramStartAction.prototype.newProgramContainer = function(startCfg, program, process)
{
	var programContainer = startCfg.getProgramContainer();
	if (oFF.isNull(programContainer))
	{
		var outputContainerType = program.getResolvedProgramContainerType();
		if (oFF.notNull(outputContainerType))
		{
			if (outputContainerType !== oFF.ProgramContainerType.CONSOLE || startCfg.isNewConsoleNeeded())
			{
				programContainer = oFF.ProgramContainerFactory.create(outputContainerType);
			}
		}
	}
	if (oFF.isNull(programContainer))
	{
		programContainer = oFF.ProgramContainer.createProgramContainer(startCfg, program);
	}
	programContainer.setStartCfg(startCfg);
	programContainer.setProgram(program);
	programContainer.setProcess(process);
	startCfg.setProgramContainer(programContainer);
	return programContainer;
};
oFF.ProgramStartAction.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onProgramStarted(extResult, data, customIdentifier);
};

oFF.ProgramStartCfg = function() {};
oFF.ProgramStartCfg.prototype = new oFF.DfNameTextObject();
oFF.ProgramStartCfg.prototype._ff_c = "ProgramStartCfg";

oFF.ProgramStartCfg.createByCmdLine = function(parentProcess, cmdLine)
{
	var args = null;
	var name = null;
	var argsObject = null;
	var separator = oFF.XString.indexOf(cmdLine, " ");
	if (separator !== -1)
	{
		name = oFF.XString.substring(cmdLine, 0, separator);
		args = oFF.XString.substring(cmdLine, separator + 1, -1);
		if (oFF.notNull(args))
		{
			args = oFF.XString.trim(args);
			if (oFF.XStringUtils.isNotNullAndNotEmpty(args))
			{
				argsObject = oFF.ProgramArgs.createWithString(args);
			}
		}
	}
	else
	{
		name = cmdLine;
	}
	name = oFF.XString.trim(name);
	return oFF.ProgramStartCfg.create(parentProcess, name, name, argsObject);
};
oFF.ProgramStartCfg.createByCmdLineExt = function(parentProcess, argValues)
{
	var startCfg = null;
	if (argValues.size() > 0)
	{
		var prgName = argValues.get(0);
		var argsObject = null;
		if (argValues.size() > 1)
		{
			var reducedArgValues = oFF.XListOfString.create();
			for (var i = 1; i < argValues.size(); i++)
			{
				reducedArgValues.add(argValues.get(i));
			}
			argsObject = oFF.ProgramArgs.createWithList(reducedArgValues);
		}
		startCfg = oFF.ProgramStartCfg.create(parentProcess, prgName, prgName, argsObject);
	}
	return startCfg;
};
oFF.ProgramStartCfg.create = function(parentProcess, name, text, args)
{
	var startDef = new oFF.ProgramStartCfg();
	startDef.setupExt(parentProcess, name, text, args);
	return startDef;
};
oFF.ProgramStartCfg.prototype.m_parentProcess = null;
oFF.ProgramStartCfg.prototype.m_isCreatingChildProcess = false;
oFF.ProgramStartCfg.prototype.m_isUsingParentEnvironment = false;
oFF.ProgramStartCfg.prototype.m_isNewConsoleNeeded = false;
oFF.ProgramStartCfg.prototype.m_programProcess = null;
oFF.ProgramStartCfg.prototype.m_args = null;
oFF.ProgramStartCfg.prototype.m_factory = null;
oFF.ProgramStartCfg.prototype.m_manifest = null;
oFF.ProgramStartCfg.prototype.m_programContainer = null;
oFF.ProgramStartCfg.prototype.m_enforcedContainerType = null;
oFF.ProgramStartCfg.prototype.m_nativeAnchorId = null;
oFF.ProgramStartCfg.prototype.m_nativeAnchorObject = null;
oFF.ProgramStartCfg.prototype.m_anchorContentControl = null;
oFF.ProgramStartCfg.prototype.m_processEventListeners = null;
oFF.ProgramStartCfg.prototype.m_program = null;
oFF.ProgramStartCfg.prototype.m_isDefaultArgsSet = false;
oFF.ProgramStartCfg.prototype.setupExt = function(parentProcess, name, text, args)
{
	oFF.DfNameTextObject.prototype.setupWithNameText.call( this , name, text);
	this.m_isCreatingChildProcess = true;
	this.m_parentProcess = parentProcess;
	this.m_processEventListeners = oFF.XList.create();
	if (oFF.notNull(args))
	{
		this.m_args = args;
	}
	else
	{
		this.m_args = oFF.ProgramArgs.create();
	}
};
oFF.ProgramStartCfg.prototype.releaseObject = function()
{
	this.m_nativeAnchorObject = null;
	this.m_anchorContentControl = null;
	oFF.DfNameTextObject.prototype.releaseObject.call( this );
};
oFF.ProgramStartCfg.prototype.cloneExt = function(flags)
{
	var startDef = new oFF.ProgramStartCfg();
	var theArguments = oFF.XObjectExt.cloneIfNotNull(this.m_args);
	startDef.setupExt(this.getParentProcess(), this.getName(), this.getText(), theArguments);
	startDef.setEnforcedContainerType(this.getEnforcedContainerType());
	startDef.setIsCreatingChildProcess(this.isCreatingChildProcess());
	startDef.setIsNewConsoleNeeded(this.isNewConsoleNeeded());
	startDef.setNativeAnchorId(this.getNativeAnchorId());
	startDef.setNativeAnchorObject(this.getNativeAnchorObject());
	startDef.setAnchorContentControl(this.getAnchorContentControl());
	startDef.setProgramProcess(this.getProgramProcess());
	for (var i = 0; i < this.m_processEventListeners.size(); i++)
	{
		var listener = this.m_processEventListeners.get(i);
		startDef.registerOnEvent(listener);
	}
	return startDef;
};
oFF.ProgramStartCfg.prototype.getArguments = function()
{
	if (this.m_isDefaultArgsSet === false)
	{
		var programManifest = this.getProgramManifest();
		if (oFF.notNull(programManifest))
		{
			var startArgumentsStructure = programManifest.getStartArgumentsStructure();
			this.m_args.setDefaultArgumentStructure(startArgumentsStructure);
			this.m_isDefaultArgsSet = true;
		}
	}
	return this.m_args;
};
oFF.ProgramStartCfg.prototype.setArguments = function(programArguments)
{
	this.m_args = programArguments;
};
oFF.ProgramStartCfg.prototype.getFactory = function()
{
	if (oFF.isNull(this.m_factory))
	{
		var programManifest = this.getProgramManifest();
		if (oFF.notNull(programManifest))
		{
			this.m_factory = programManifest.getFactory();
		}
	}
	return this.m_factory;
};
oFF.ProgramStartCfg.prototype.getProgramManifest = function()
{
	if (oFF.isNull(this.m_manifest))
	{
		var name = this.getName();
		var process = this.getParentProcess();
		if (oFF.notNull(name))
		{
			if (oFF.notNull(process))
			{
				var kernel = process.getKernel();
				var targetProgramName = kernel.resolveProgramName(name);
				this.m_manifest = kernel.getProgramManifest(targetProgramName);
			}
			else
			{
				this.m_manifest = oFF.ProgramRegistration.getProgramManifest(name);
			}
		}
	}
	return this.m_manifest;
};
oFF.ProgramStartCfg.prototype.getSession = function()
{
	return this.m_parentProcess;
};
oFF.ProgramStartCfg.prototype.getParentProcess = function()
{
	return this.m_parentProcess;
};
oFF.ProgramStartCfg.prototype.setParentProcess = function(parentProcess)
{
	this.m_parentProcess = parentProcess;
};
oFF.ProgramStartCfg.prototype.getProgramProcess = function()
{
	return this.m_programProcess;
};
oFF.ProgramStartCfg.prototype.setProgramProcess = function(process)
{
	this.m_programProcess = process;
};
oFF.ProgramStartCfg.prototype.setIsCreatingChildProcess = function(isCreatingChildProcess)
{
	this.m_isCreatingChildProcess = isCreatingChildProcess;
};
oFF.ProgramStartCfg.prototype.isCreatingChildProcess = function()
{
	return this.m_isCreatingChildProcess;
};
oFF.ProgramStartCfg.prototype.processExecution = function(syncType, listener, customIdentifier)
{
	return oFF.ProgramStartAction.createAndRun(syncType, listener, customIdentifier, this);
};
oFF.ProgramStartCfg.prototype.getProgramContainer = function()
{
	return this.m_programContainer;
};
oFF.ProgramStartCfg.prototype.setProgramContainer = function(programContainer)
{
	this.m_programContainer = programContainer;
};
oFF.ProgramStartCfg.prototype.isUsingParentEnvironment = function()
{
	return this.m_isUsingParentEnvironment;
};
oFF.ProgramStartCfg.prototype.setIsUsingParentEnvironment = function(isUsingParentEnvironment)
{
	this.m_isUsingParentEnvironment = isUsingParentEnvironment;
};
oFF.ProgramStartCfg.prototype.isNewConsoleNeeded = function()
{
	return this.m_isNewConsoleNeeded;
};
oFF.ProgramStartCfg.prototype.setIsNewConsoleNeeded = function(isNewConsoleNeeded)
{
	this.m_isNewConsoleNeeded = isNewConsoleNeeded;
};
oFF.ProgramStartCfg.prototype.setNativeAnchorId = function(nativeAnchorId)
{
	this.m_nativeAnchorId = nativeAnchorId;
};
oFF.ProgramStartCfg.prototype.setNativeAnchorObject = function(nativeAnchorObject)
{
	this.m_nativeAnchorObject = nativeAnchorObject;
};
oFF.ProgramStartCfg.prototype.getNativeAnchorId = function()
{
	return this.m_nativeAnchorId;
};
oFF.ProgramStartCfg.prototype.getNativeAnchorObject = function()
{
	return this.m_nativeAnchorObject;
};
oFF.ProgramStartCfg.prototype.setAnchorContentControl = function(contentControl)
{
	this.m_anchorContentControl = contentControl;
};
oFF.ProgramStartCfg.prototype.getAnchorContentControl = function()
{
	return this.m_anchorContentControl;
};
oFF.ProgramStartCfg.prototype.setName = function(name)
{
	this.m_name = name;
};
oFF.ProgramStartCfg.prototype.getProgram = function()
{
	return this.m_program;
};
oFF.ProgramStartCfg.prototype.setProgram = function(program)
{
	this.m_program = program;
};
oFF.ProgramStartCfg.prototype.getResolvedContainerType = function()
{
	var containerType = this.getOutputContainerType();
	var enforcedContainerType = this.getEnforcedContainerType();
	if (oFF.notNull(enforcedContainerType))
	{
		if (containerType.isUiContainer() === enforcedContainerType.isUiContainer())
		{
			containerType = enforcedContainerType;
		}
	}
	return containerType;
};
oFF.ProgramStartCfg.prototype.setEnforcedContainerType = function(containerType)
{
	this.m_enforcedContainerType = containerType;
};
oFF.ProgramStartCfg.prototype.registerOnEvent = function(listener)
{
	this.m_processEventListeners.add(listener);
};
oFF.ProgramStartCfg.prototype.unregisterOnEvent = function(listener)
{
	for (var i = 0; i < this.m_processEventListeners.size(); )
	{
		var currentListener = this.m_processEventListeners.get(i);
		if (currentListener === listener)
		{
			this.m_processEventListeners.removeAt(i);
		}
		else
		{
			i++;
		}
	}
};
oFF.ProgramStartCfg.prototype.getAllProcessEventListeners = function()
{
	return this.m_processEventListeners;
};
oFF.ProgramStartCfg.prototype.getOutputContainerType = function()
{
	var manifest = this.getProgramManifest();
	if (oFF.notNull(manifest))
	{
		return manifest.getOutputContainerType();
	}
	return oFF.ProgramContainerType.NONE;
};
oFF.ProgramStartCfg.prototype.getInitialContainerCssWidth = function()
{
	var manifest = this.getProgramManifest();
	if (oFF.notNull(manifest))
	{
		return manifest.getInitialContainerCssWidth();
	}
	return null;
};
oFF.ProgramStartCfg.prototype.getInitialContainerCssHeight = function()
{
	var manifest = this.getProgramManifest();
	if (oFF.notNull(manifest))
	{
		return manifest.getInitialContainerCssHeight();
	}
	return null;
};
oFF.ProgramStartCfg.prototype.getInitialContainerCssPosX = function()
{
	var manifest = this.getProgramManifest();
	if (oFF.notNull(manifest))
	{
		return manifest.getInitialContainerCssPosX();
	}
	return null;
};
oFF.ProgramStartCfg.prototype.getInitialContainerCssPosY = function()
{
	var manifest = this.getProgramManifest();
	if (oFF.notNull(manifest))
	{
		return manifest.getInitialContainerCssPosY();
	}
	return null;
};
oFF.ProgramStartCfg.prototype.isInitiallyContainerMaximized = function()
{
	var manifest = this.getProgramManifest();
	if (oFF.notNull(manifest))
	{
		return manifest.isInitiallyContainerMaximized();
	}
	return false;
};
oFF.ProgramStartCfg.prototype.getStartTitle = function()
{
	var startTitle = this.getText();
	if (oFF.XStringUtils.isNullOrEmpty(startTitle))
	{
		var manifest = this.getProgramManifest();
		if (oFF.notNull(manifest))
		{
			startTitle = manifest.getInitialTitle();
			if (oFF.XStringUtils.isNullOrEmpty(startTitle))
			{
				startTitle = manifest.getDisplayName();
			}
		}
	}
	if (oFF.XStringUtils.isNullOrEmpty(startTitle))
	{
		startTitle = this.getName();
	}
	return startTitle;
};
oFF.ProgramStartCfg.prototype.setStartTitle = function(startTitle)
{
	this.setText(startTitle);
};
oFF.ProgramStartCfg.prototype.getEnforcedContainerType = function()
{
	return this.m_enforcedContainerType;
};

oFF.ProgramTerminateAction = function() {};
oFF.ProgramTerminateAction.prototype = new oFF.SyncAction();
oFF.ProgramTerminateAction.prototype._ff_c = "ProgramTerminateAction";

oFF.ProgramTerminateAction.createAndRun = function(syncType, listener, customIdentifier, program, kill)
{
	var object = new oFF.ProgramTerminateAction();
	object.m_isKill = kill;
	object.setupActionAndRun(syncType, listener, customIdentifier, program);
	return object;
};
oFF.ProgramTerminateAction.prototype.m_isKill = false;
oFF.ProgramTerminateAction.prototype.m_didTerminate = false;
oFF.ProgramTerminateAction.prototype.setupAction = function(syncType, listener, customIdentifier, context)
{
	oFF.SyncAction.prototype.setupAction.call( this , syncType, listener, customIdentifier, context);
};
oFF.ProgramTerminateAction.prototype.getLogLayer = function()
{
	return oFF.OriginLayer.KERNEL;
};
oFF.ProgramTerminateAction.prototype.processSynchronization = function(syncType)
{
	var program = this.getActionContext();
	if (this.m_isKill || program.canTerminate())
	{
		var exitValue = program.getExitValue();
		this.setData(exitValue);
		this.m_didTerminate = true;
		return false;
	}
	else
	{
		this.m_didTerminate = false;
		return false;
	}
};
oFF.ProgramTerminateAction.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onProgramTerminated(extResult, data, this.m_didTerminate, customIdentifier);
};

oFF.ProcessTerminateAction = function() {};
oFF.ProcessTerminateAction.prototype = new oFF.SyncAction();
oFF.ProcessTerminateAction.prototype._ff_c = "ProcessTerminateAction";

oFF.ProcessTerminateAction.createAndRun = function(syncType, listener, customIdentifier, kernel, processId, exitCode, kill)
{
	var object = new oFF.ProcessTerminateAction();
	object.m_processId = processId;
	object.m_exitCode = exitCode;
	object.m_isKill = kill;
	object.setupActionAndRun(syncType, listener, customIdentifier, kernel);
	return object;
};
oFF.ProcessTerminateAction.prototype.m_processId = null;
oFF.ProcessTerminateAction.prototype.m_exitCode = 0;
oFF.ProcessTerminateAction.prototype.m_isKill = false;
oFF.ProcessTerminateAction.prototype.m_process = null;
oFF.ProcessTerminateAction.prototype.getLogLayer = function()
{
	return oFF.OriginLayer.KERNEL;
};
oFF.ProcessTerminateAction.prototype.processSynchronization = function(syncType)
{
	var kernel = this.getActionContext();
	this.m_process = kernel.getChildProcessById(this.m_processId);
	var doContinue = false;
	if (oFF.notNull(this.m_process) && !this.m_process.isReleased())
	{
		var programCfg = this.m_process.getProgramCfg();
		if (oFF.notNull(programCfg))
		{
			var program = programCfg.getProgram();
			if (oFF.notNull(program))
			{
				doContinue = true;
				program.processTerminate(syncType, this, null, this.m_isKill);
			}
		}
	}
	return doContinue;
};
oFF.ProcessTerminateAction.prototype.onProgramTerminated = function(extResult, exitValues, didTerminate, customIdentifier)
{
	this.addAllMessages(extResult);
	this.setData(exitValues);
	if (didTerminate === false)
	{
		this.log2("Program rejected termination: ", this.m_processId);
	}
	else
	{
		if (this.isValid() && oFF.notNull(this.m_process) && !this.m_process.isReleased())
		{
			this.log2("Terminating process: ", this.m_processId);
			var programCfg = this.m_process.getProgramCfg();
			var programContainer = programCfg.getProgramContainer();
			programContainer.shutdownContainer();
			var childProcesses = this.m_process.getChildProcesses();
			var parentProcess = this.m_process.getParentProcess();
			for (var i = 0; i < childProcesses.size(); i++)
			{
				var child = childProcesses.get(i);
				parentProcess.attachExistingChildProcess(child);
				this.m_process.removeChild(child);
			}
			parentProcess.removeChild(this.m_process);
			this.m_process = oFF.XObjectExt.release(this.m_process);
			var kernel = this.getActionContext();
			var event = oFF.ProcessEvent.create(null, this.m_processId, oFF.ProcessEventType.TERMINATED, null);
			kernel.onProcessEvent(event, event.getProcess(), event.getEventType());
			if (this.m_exitCode !== 0)
			{
				this.log4("Process terminated with error: ", this.m_processId, " Exit code: ", oFF.XInteger.convertToString(this.m_exitCode));
			}
			else
			{
				this.log2("Process successfully terminated: ", this.m_processId);
			}
		}
	}
	this.endSync();
};
oFF.ProcessTerminateAction.prototype.endSync = function()
{
	this.m_process = null;
	oFF.SyncAction.prototype.endSync.call( this );
};
oFF.ProcessTerminateAction.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onProcessTerminated(extResult, data, customIdentifier);
};

oFF.SubSystemLoadAction = function() {};
oFF.SubSystemLoadAction.prototype = new oFF.SyncAction();
oFF.SubSystemLoadAction.prototype._ff_c = "SubSystemLoadAction";

oFF.SubSystemLoadAction.createAndRun = function(syncType, listener, customIdentifier, container)
{
	var newObj = new oFF.SubSystemLoadAction();
	newObj.setupActionAndRun(syncType, listener, customIdentifier, container);
	return newObj;
};
oFF.SubSystemLoadAction.prototype.getLogLayer = function()
{
	return oFF.OriginLayer.KERNEL;
};
oFF.SubSystemLoadAction.prototype.processSynchronization = function(syncType)
{
	var subSystemContainer = this.getActionContext();
	var doCont = false;
	var subSystem;
	var status = subSystemContainer.getStatus();
	if (status === oFF.SubSystemStatus.INITIAL || status === oFF.SubSystemStatus.BOOTSTRAP)
	{
		var type = subSystemContainer.getSubSystemType();
		var typeName = type.getName();
		var programName = oFF.XStringUtils.concatenate2(oFF.ProgramRegistration.SUBSYS_PREFIX, typeName);
		var selectorName = subSystemContainer.getSubSystemSelector();
		if (oFF.notNull(selectorName))
		{
			programName = oFF.XStringUtils.concatenate3(programName, ".", selectorName);
		}
		var kernel = subSystemContainer.getKernel();
		var programManifest = kernel.getProgramManifest(programName);
		if (oFF.notNull(programManifest))
		{
			var kernelProcess = kernel.getKernelProcess();
			var programArgs = oFF.ProgramArgs.create();
			var programStartCfg = oFF.ProgramStartCfg.create(kernelProcess, programName, null, programArgs);
			programStartCfg.registerOnEvent(this);
			programStartCfg.processExecution(syncType, this, null);
			doCont = true;
		}
		else
		{
			subSystem = subSystemContainer.open();
			if (oFF.notNull(subSystem))
			{
				this.setData(subSystem);
			}
			else
			{
				this.addError(0, oFF.XStringUtils.concatenate2("Cannot open subsystem from container: ", subSystemContainer.getSubSystemFullName()));
			}
		}
	}
	else
	{
		subSystem = subSystemContainer.getSubSystem();
		this.setData(subSystem);
	}
	return doCont;
};
oFF.SubSystemLoadAction.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onSubSystemLoaded(extResult, data, customIdentifier);
};
oFF.SubSystemLoadAction.prototype.onProgramStarted = function(extResult, program, customIdentifier)
{
	var actionContext = this.getActionContext();
	var subSystemName = actionContext.getSubSystemFullName();
	this.addAllMessages(extResult);
	if (extResult.hasErrors())
	{
		this.log2("Subsystem started with errors: ", subSystemName);
		this.endSync();
	}
	else
	{
		this.log2("Subsystem started: ", subSystemName);
	}
};
oFF.SubSystemLoadAction.prototype.onProcessEvent = function(event, process, eventType)
{
	var subSystemName = this.getActionContext().getSubSystemFullName();
	var eventName = event.getEventType().getName();
	this.log4("Subsystem onProcessEvent: ", subSystemName, " event: ", eventName);
	if (event.getEventType() === oFF.ProcessEventType.ACTIVE)
	{
		var subSystem = process.getEntity(oFF.ProcessEntity.SUB_SYSTEM);
		process.unregisterOnEvent(this);
		this.setData(subSystem);
		this.endSync();
	}
};

oFF.SyncActionExt = function() {};
oFF.SyncActionExt.prototype = new oFF.SyncAction();
oFF.SyncActionExt.prototype._ff_c = "SyncActionExt";

oFF.SyncActionExt.prototype.getProcess = function()
{
	return this.getActionContext().getProcess();
};

oFF.SubSysUserProfilePrg = function() {};
oFF.SubSysUserProfilePrg.prototype = new oFF.DfProgramSubSys();
oFF.SubSysUserProfilePrg.prototype._ff_c = "SubSysUserProfilePrg";

oFF.SubSysUserProfilePrg.DEFAULT_PROGRAM_NAME = "@SubSys.UserProfile";
oFF.SubSysUserProfilePrg.prototype.m_loadingAction = null;
oFF.SubSysUserProfilePrg.prototype.m_activeUserProfile = null;
oFF.SubSysUserProfilePrg.prototype.m_bootstrapUserProfile = null;
oFF.SubSysUserProfilePrg.prototype.m_readOnlyUserProfile = null;
oFF.SubSysUserProfilePrg.prototype.m_personalizationUserProfile = null;
oFF.SubSysUserProfilePrg.prototype.m_type = null;
oFF.SubSysUserProfilePrg.prototype.newProgram = function()
{
	var prg = new oFF.SubSysUserProfilePrg();
	prg.setup();
	return prg;
};
oFF.SubSysUserProfilePrg.prototype.getProgramName = function()
{
	return oFF.SubSysUserProfilePrg.DEFAULT_PROGRAM_NAME;
};
oFF.SubSysUserProfilePrg.prototype.getSubSystemType = function()
{
	return oFF.SubSystemType.USER_PROFILE;
};
oFF.SubSysUserProfilePrg.prototype.runProcess = function()
{
	this.log("User profile: subsystem going to initialize");
	var subSystemContainer = this.getSubSystemContainer();
	var bootstrapSubSystem = subSystemContainer.getBootstrapSubSystem();
	this.m_bootstrapUserProfile = bootstrapSubSystem.getMainApi();
	this.m_activeUserProfile = this.m_bootstrapUserProfile;
	this.m_type = oFF.ServiceApiLevel.BOOTSTRAP;
	var serializedUserProfile = this.getKernelEnvironment().getByKey(oFF.XEnvironmentConstants.FIREFLY_USER_PROFILE_SERIALIZED);
	if (oFF.notNull(serializedUserProfile))
	{
		this.log("User profile: Using serialized user profile");
		var docParser = oFF.JsonParserFactory.newInstance();
		var document = docParser.parse(serializedUserProfile);
		oFF.XObjectExt.release(docParser);
		var userProfile = this.createUserProfile(oFF.ServiceApiLevel.READ_ONLY, null, this.m_activeUserProfile, document);
		this.updateUserProfile(oFF.ServiceApiLevel.READ_ONLY, userProfile);
		this.activateSubSystem(null, oFF.SubSystemStatus.ACTIVE);
		return true;
	}
	else
	{
		var process = this.getProcess();
		var peekId = process.getEnvironment().getByKey(oFF.XEnvironmentConstants.FIREFLY_USER_PROFILE_IFRAME);
		var path = oFF.XStringUtils.concatenate3("${", oFF.XEnvironmentConstants.FIREFLY_USER_PROFILE, "}");
		var file = oFF.XFile.createWithVars(process, path);
		if (oFF.XStringUtils.isNotNullAndNotEmpty(peekId))
		{
			this.log("User profile: Using peek id with iframe");
			this.m_loadingAction = oFF.UserProfileLoadAction.createAndRun(null, this, oFF.ServiceApiLevel.READ_ONLY, this, file, peekId, oFF.ServiceApiLevel.READ_ONLY, this.m_activeUserProfile);
			return true;
		}
		else if (oFF.notNull(file) && file.isValid())
		{
			this.log("User profile: Using file");
			this.m_loadingAction = oFF.UserProfileLoadAction.createAndRun(null, this, oFF.ServiceApiLevel.READ_ONLY, this, file, peekId, oFF.ServiceApiLevel.READ_ONLY, this.m_activeUserProfile);
			return true;
		}
		else
		{
			path = oFF.XStringUtils.concatenate3("${", oFF.XEnvironmentConstants.FIREFLY_USER_PROFILE_RW, "}");
			file = oFF.XFile.createWithVars(process, path);
			if (oFF.notNull(file) && file.isValid())
			{
				this.log("User profile: Using r/w file");
				this.m_loadingAction = oFF.UserProfileLoadAction.createAndRun(null, this, oFF.ServiceApiLevel.PERSONALIZATION, this, file, peekId, oFF.ServiceApiLevel.PERSONALIZATION, this.m_activeUserProfile);
				return true;
			}
			else
			{
				this.logError2("Cannot resolve user profile path: ", path);
				this.activateSubSystem(null, oFF.SubSystemStatus.ACTIVE);
				return false;
			}
		}
	}
};
oFF.SubSysUserProfilePrg.prototype.activateSubSystem = function(messages, status)
{
	if (this.m_type === oFF.ServiceApiLevel.BOOTSTRAP)
	{
		this.log("Activating user profile using bootstrap settings");
	}
	else if (this.m_type === oFF.ServiceApiLevel.READ_ONLY)
	{
		this.log("Activating user profile using read-only settings");
	}
	else if (this.m_type === oFF.ServiceApiLevel.PERSONALIZATION)
	{
		this.log("Activating user profile using writeable settings");
	}
	var kernelEnvironment = this.getKernelEnvironment();
	var tenantId = this.m_activeUserProfile.getTenantId();
	if (oFF.XStringUtils.isNotNullAndNotEmpty(tenantId))
	{
		kernelEnvironment.setVariable(oFF.XEnvironmentConstants.FIREFLY_TENANT_ID, tenantId);
	}
	var userName = this.m_activeUserProfile.getName();
	if (oFF.notNull(userName))
	{
		kernelEnvironment.setVariable(oFF.XEnvironmentConstants.FIREFLY_USER, userName);
	}
	oFF.DfProgramSubSys.prototype.activateSubSystem.call( this , messages, status);
};
oFF.SubSysUserProfilePrg.prototype.onUserProfileLoaded = function(extResult, userProfile, customIdentifier)
{
	this.log("User profile: loaded");
	var type = customIdentifier;
	if (extResult.isValid() === true && oFF.notNull(userProfile))
	{
		this.updateUserProfile(type, userProfile);
	}
	var activate = true;
	if (type === oFF.ServiceApiLevel.READ_ONLY)
	{
		var path = oFF.XStringUtils.concatenate3("${", oFF.XEnvironmentConstants.FIREFLY_USER_PROFILE_RW, "}");
		var file = oFF.XFile.createWithVars(this.getProcess(), path);
		if (oFF.notNull(file) && file.isValid())
		{
			this.m_loadingAction = oFF.UserProfileLoadAction.createAndRun(null, this, oFF.ServiceApiLevel.PERSONALIZATION, this, file, null, oFF.ServiceApiLevel.PERSONALIZATION, this.m_activeUserProfile);
			activate = false;
		}
	}
	if (activate === true)
	{
		this.log("User profile: activating");
		this.activateSubSystem(extResult, oFF.SubSystemStatus.ACTIVE);
	}
	else
	{
		this.log("User profile: not activating");
	}
};
oFF.SubSysUserProfilePrg.prototype.updateUserProfile = function(type, userProfile)
{
	if (oFF.notNull(userProfile))
	{
		if (type === oFF.ServiceApiLevel.READ_ONLY)
		{
			this.setReadOnlyUserProfile(userProfile);
		}
		else if (type === oFF.ServiceApiLevel.PERSONALIZATION)
		{
			this.setPersonalizatonUserProfile(userProfile);
		}
		this.m_activeUserProfile = userProfile;
		this.m_type = type;
	}
};
oFF.SubSysUserProfilePrg.prototype.canUserProfileSaved = function()
{
	return this.m_type === oFF.ServiceApiLevel.PERSONALIZATION;
};
oFF.SubSysUserProfilePrg.prototype.processUserProfileSave = function(syncType, listener, customIdentifier)
{
	if (this.canUserProfileSaved())
	{
		return oFF.UserProfileSaveAction.createAndRun(syncType, listener, customIdentifier, this, this.m_activeUserProfile);
	}
	else
	{
		oFF.noSupport();
	}
};
oFF.SubSysUserProfilePrg.prototype.getMainApi = function()
{
	return this.m_activeUserProfile;
};
oFF.SubSysUserProfilePrg.prototype.getAdminApi = function()
{
	return this;
};
oFF.SubSysUserProfilePrg.prototype.getBootstrapUserProfile = function()
{
	return this.m_bootstrapUserProfile;
};
oFF.SubSysUserProfilePrg.prototype.getReadOnlyUserProfile = function()
{
	return this.m_readOnlyUserProfile;
};
oFF.SubSysUserProfilePrg.prototype.setReadOnlyUserProfile = function(userProfile)
{
	this.m_readOnlyUserProfile = userProfile;
};
oFF.SubSysUserProfilePrg.prototype.getPersonalizationUserProfile = function()
{
	return this.m_personalizationUserProfile;
};
oFF.SubSysUserProfilePrg.prototype.setPersonalizatonUserProfile = function(userProfile)
{
	this.m_personalizationUserProfile = userProfile;
};
oFF.SubSysUserProfilePrg.prototype.getUserProfile = function()
{
	return this.m_activeUserProfile;
};
oFF.SubSysUserProfilePrg.prototype.getServiceApiLevel = function()
{
	return this.m_type;
};
oFF.SubSysUserProfilePrg.prototype.getKernelEnvironment = function()
{
	var kernel = this.getProcess().getKernel();
	var kernelProcess = kernel.getKernelProcess();
	return kernelProcess.getEnvironment();
};
oFF.SubSysUserProfilePrg.prototype.createUserProfile = function(serviceApiLevel, documentUri, parent, document)
{
	var userProfile = oFF.UserProfile.create();
	userProfile.setServiceApiLevel(serviceApiLevel);
	userProfile.setDocumentUri(documentUri);
	userProfile.setParent(parent);
	userProfile.setDocument(document);
	oFF.UserProfileAdapterOrca.deserialize(userProfile, document);
	return userProfile;
};

oFF.UserProfileLoadAction = function() {};
oFF.UserProfileLoadAction.prototype = new oFF.SyncAction();
oFF.UserProfileLoadAction.prototype._ff_c = "UserProfileLoadAction";

oFF.UserProfileLoadAction.createAndRun = function(syncType, listener, customIdentifier, context, file, peekId, serviceApiLevel, parent)
{
	var object = new oFF.UserProfileLoadAction();
	object.m_file = file;
	object.m_serviceApiLevel = serviceApiLevel;
	object.m_parent = parent;
	object.m_peekId = peekId;
	object.setupActionAndRun(syncType, listener, customIdentifier, context);
	return object;
};
oFF.UserProfileLoadAction.prototype.m_file = null;
oFF.UserProfileLoadAction.prototype.m_peekId = null;
oFF.UserProfileLoadAction.prototype.m_serviceApiLevel = null;
oFF.UserProfileLoadAction.prototype.m_parent = null;
oFF.UserProfileLoadAction.prototype.getLogLayer = function()
{
	return oFF.OriginLayer.SUBSYSTEM;
};
oFF.UserProfileLoadAction.prototype.processSynchronization = function(syncType)
{
	var doContinue = true;
	if (oFF.XStringUtils.isNotNullAndNotEmpty(this.m_peekId))
	{
		this.log2("Reading user profile from iframe: ", this.m_peekId);
		var content = oFF.XPeek.getContent(null, this.m_peekId);
		if (oFF.notNull(content))
		{
			this.readContent(content);
			doContinue = false;
		}
	}
	if (doContinue === true)
	{
		this.log2("Loading user profile: ", this.m_file.getNativePath());
		this.m_file.processLoad(syncType, this, null, oFF.CompressionType.NONE);
	}
	return doContinue;
};
oFF.UserProfileLoadAction.prototype.onFileLoaded = function(extResult, file, fileContent, customIdentifier)
{
	this.addAllMessages(extResult);
	if (extResult.isValid())
	{
		this.log("Loading user profile finished");
		if (oFF.notNull(fileContent))
		{
			this.readContent(fileContent);
		}
		else
		{
			this.log("No content for user profile");
		}
	}
	else
	{
		this.logError2("Cannot load user profile from ", this.m_file.getNativePath());
	}
	this.log("Ending user profile load process");
	this.endSync();
};
oFF.UserProfileLoadAction.prototype.readContent = function(fileContent)
{
	var userProfile = oFF.UserProfile.create();
	userProfile.setServiceApiLevel(this.m_serviceApiLevel);
	userProfile.setDocumentUri(this.m_file.getUri());
	userProfile.setParent(this.m_parent);
	var document = fileContent.getJsonContent();
	userProfile.setDocument(document);
	if (oFF.notNull(document))
	{
		var ok = oFF.UserProfileAdapterLdap.deserialize(userProfile, document);
		if (ok === false)
		{
			oFF.UserProfileAdapterOrca.deserialize(userProfile, document);
		}
	}
	this.setData(userProfile);
};
oFF.UserProfileLoadAction.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onUserProfileLoaded(extResult, data, customIdentifier);
};

oFF.HttpFileClient = function() {};
oFF.HttpFileClient.prototype = new oFF.DfHttpClient();
oFF.HttpFileClient.prototype._ff_c = "HttpFileClient";

oFF.HttpFileClient.create = function(process)
{
	var newObj = new oFF.HttpFileClient();
	newObj.setupHttpClient(process);
	return newObj;
};
oFF.HttpFileClient.prototype.processSynchronization = function(syncType)
{
	var request = this.getRequest();
	var response = oFF.HttpResponse.createResponse(request);
	this.setData(response);
	var retValue = false;
	if (oFF.notNull(request))
	{
		var file = oFF.XFile.createByUri(this.getProcess(), request);
		if (oFF.notNull(file) && file.isValid() && file.isFile())
		{
			var compression = oFF.XString.endsWith(file.getUri().getPath(), ".gz") ? oFF.CompressionType.GZIP : oFF.CompressionType.NONE;
			if (syncType === oFF.SyncType.NON_BLOCKING)
			{
				file.processLoad(syncType, this, response, compression);
				retValue = true;
			}
			else
			{
				var syncAction = file.processLoad(syncType, null, response, compression);
				if (syncAction.getData() === null)
				{
					response.setStatusCode(oFF.HttpStatusCode.SC_NOT_FOUND);
				}
				else
				{
					this.onFileLoadedInternal(syncAction, file, syncAction.getData().getFileContent(), response);
				}
			}
		}
		else
		{
			response.setStatusCode(oFF.HttpStatusCode.SC_NOT_FOUND);
		}
	}
	else
	{
		response.setStatusCode(oFF.HttpStatusCode.SC_NOT_FOUND);
	}
	return retValue;
};
oFF.HttpFileClient.prototype.onFileLoaded = function(extResult, file, fileContent, customIdentifier)
{
	this.onFileLoadedInternal(extResult, file, fileContent, customIdentifier);
	this.endSync();
};
oFF.HttpFileClient.prototype.onFileLoadedInternal = function(extResult, file, fileContent, customIdentifier)
{
	var response = customIdentifier;
	if (extResult.isValid())
	{
		response.setFromContent(fileContent);
		response.setStatusCode(oFF.HttpStatusCode.SC_OK);
	}
	else
	{
		response.setStatusCode(oFF.HttpStatusCode.SC_NOT_FOUND);
	}
};
oFF.HttpFileClient.prototype.getProcess = function()
{
	return this.getSession();
};

oFF.XHttpFileDirAction2 = function() {};
oFF.XHttpFileDirAction2.prototype = new oFF.SyncActionExt();
oFF.XHttpFileDirAction2.prototype._ff_c = "XHttpFileDirAction2";

oFF.XHttpFileDirAction2.createAndRun = function(syncType, context, listener, customIdentifier)
{
	var object = new oFF.XHttpFileDirAction2();
	object.setupActionAndRun(syncType, listener, customIdentifier, context);
	return object;
};
oFF.XHttpFileDirAction2.prototype.m_parentTargetUri = null;
oFF.XHttpFileDirAction2.prototype.m_targetDirUri = null;
oFF.XHttpFileDirAction2.prototype.processSynchronization = function(syncType)
{
	this.setData(this.getActionContext());
	var httpFile = this.getActionContext();
	this.m_parentTargetUri = this.normalizeForDir(httpFile.getTargetUri());
	this.m_targetDirUri = oFF.XUri.createChildFile(this.m_parentTargetUri, ".index.json");
	var request = oFF.HttpRequest.createByUri(this.m_targetDirUri);
	var httpClient = request.newHttpClient(this.getSession());
	httpClient.processHttpRequest(syncType, this, null);
	return true;
};
oFF.XHttpFileDirAction2.prototype.normalizeForDir = function(uri)
{
	var result = uri;
	var path = uri.getPath();
	if (oFF.XString.endsWith(path, "/") === false)
	{
		var targetUri = oFF.XUri.createFromOther(uri);
		if (oFF.XString.endsWith(path, "/") === false)
		{
			path = oFF.XStringUtils.concatenate2(path, "/");
		}
		targetUri.setPath(path);
		result = targetUri;
	}
	return result;
};
oFF.XHttpFileDirAction2.prototype.onHttpResponse = function(extResult, response, customIdentifier)
{
	this.addAllMessages(extResult);
	if (extResult.isValid())
	{
		if (oFF.HttpStatusCode.isOk(response.getStatusCode()))
		{
			var jsonContent = response.getJsonContent();
			if (oFF.notNull(jsonContent) && jsonContent.isStructure())
			{
				var dirInfo = jsonContent;
				var file = this.getActionContext();
				var fileSystem = file.getFileSystem();
				var process = this.getProcess();
				var children = oFF.XList.create();
				var fileList = dirInfo.getListByKey("Files");
				if (oFF.notNull(fileList))
				{
					for (var i = 0; i < fileList.size(); i++)
					{
						var fileStructure = fileList.getStructureAt(i);
						var type = fileStructure.getStringByKey("Type");
						var isDirectory = oFF.XString.isEqual(type, "Dir");
						var isExecutable = fileStructure.getBooleanByKeyExt("IsExecutable", false);
						var name = fileStructure.getStringByKey("Name");
						var targetName = name;
						if (isDirectory)
						{
							targetName = oFF.XStringUtils.concatenate2(name, "/");
						}
						var targetChildUri = oFF.XUri.createFromParentUriAndRelativeUrl(this.m_parentTargetUri, targetName, false);
						var childFile = oFF.XHttpFile._create(process, fileSystem, targetChildUri);
						childFile.setIsDirectory(isDirectory);
						childFile.setIsExecutable(isExecutable);
						children.add(childFile);
					}
				}
				file.setChildFiles(children, -1);
			}
			else
			{
				this.addErrorExt(oFF.OriginLayer.IOLAYER, oFF.ErrorCodes.SYSTEM_IO, "Missing json content", null);
			}
		}
		else
		{
			this.addErrorExt(oFF.OriginLayer.IOLAYER, oFF.ErrorCodes.SYSTEM_IO_HTTP, response.getStatusCodeDetails(), null);
		}
	}
	this.endSync();
};
oFF.XHttpFileDirAction2.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onChildrenFetched(extResult, data, data.getCachedChildFiles(), data.getCachedChildrenResultset(), customIdentifier);
};

oFF.XHttpFileLoadAction = function() {};
oFF.XHttpFileLoadAction.prototype = new oFF.SyncActionExt();
oFF.XHttpFileLoadAction.prototype._ff_c = "XHttpFileLoadAction";

oFF.XHttpFileLoadAction.createAndRun = function(syncType, context, listener, customIdentifier)
{
	var object = new oFF.XHttpFileLoadAction();
	object.setupActionAndRun(syncType, listener, customIdentifier, context);
	return object;
};
oFF.XHttpFileLoadAction.prototype.processSynchronization = function(syncType)
{
	var uri = this.getActionContext().getTargetUri();
	var request = oFF.HttpRequest.createByUri(uri);
	var httpClient = request.newHttpClient(this.getSession());
	httpClient.processHttpRequest(syncType, this, null);
	return true;
};
oFF.XHttpFileLoadAction.prototype.onHttpResponse = function(extResult, response, customIdentifier)
{
	this.addAllMessages(extResult);
	if (extResult.isValid())
	{
		this.getActionContext().setFileContent(response);
		if (oFF.HttpStatusCode.isOk(response.getStatusCode()))
		{
			this.setData(this.getActionContext());
		}
		else
		{
			this.addErrorExt(oFF.OriginLayer.IOLAYER, oFF.ErrorCodes.SYSTEM_IO_HTTP, response.getStatusCodeDetails(), null);
		}
	}
	this.endSync();
};
oFF.XHttpFileLoadAction.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	var file = this.getActionContext();
	listener.onFileLoaded(this, file, file.getFileContent(), customIdentifier);
};

oFF.XRemoteHttpFileRequestAction = function() {};
oFF.XRemoteHttpFileRequestAction.prototype = new oFF.SyncActionExt();
oFF.XRemoteHttpFileRequestAction.prototype._ff_c = "XRemoteHttpFileRequestAction";

oFF.XRemoteHttpFileRequestAction.UPDATE = "update";
oFF.XRemoteHttpFileRequestAction.LOAD = "load";
oFF.XRemoteHttpFileRequestAction.DELETE = "delete";
oFF.XRemoteHttpFileRequestAction.create = function(syncType, context, listener, action)
{
	var object = new oFF.XRemoteHttpFileRequestAction();
	object.setupAction(syncType, listener, null, context);
	object.m_action = action;
	return object;
};
oFF.XRemoteHttpFileRequestAction.prototype.m_action = null;
oFF.XRemoteHttpFileRequestAction.prototype.m_parentVfsUri = null;
oFF.XRemoteHttpFileRequestAction.prototype.m_parentTargetUri = null;
oFF.XRemoteHttpFileRequestAction.prototype.m_destFile = null;
oFF.XRemoteHttpFileRequestAction.prototype.processSynchronization = function(syncType)
{
	this.setData(this.getActionContext());
	var httpFile = this.getActionContext();
	this.m_parentTargetUri = httpFile.getTranslatedTargetUri();
	this.m_parentVfsUri = httpFile.getUri();
	var request = oFF.HttpRequest.createByUri(this.m_parentTargetUri);
	if (oFF.XString.isEqual(this.m_action, oFF.XRemoteHttpFileRequestAction.LOAD))
	{
		request.setMethod(oFF.HttpRequestMethod.HTTP_GET);
	}
	else if (oFF.XString.isEqual(this.m_action, oFF.XRemoteHttpFileRequestAction.UPDATE))
	{
		request.setMethod(oFF.HttpRequestMethod.HTTP_POST);
		var fileUpdateRequest = oFF.PrFactory.createStructure();
		var directory = httpFile.isDirectory();
		fileUpdateRequest.putString(oFF.XRemoteHttpFileConstants.FILE_TYPE, directory ? oFF.XRemoteHttpFileConstants.FILE_TYPE_DIR : oFF.XRemoteHttpFileConstants.FILE_TYPE_FILE);
		if (!directory)
		{
			var fileContent = httpFile.getFileContent();
			if (oFF.notNull(fileContent))
			{
				var contentType = fileContent.getContentType();
				fileUpdateRequest.putString(oFF.XRemoteHttpFileConstants.CONTENT_TYPE, contentType.getName());
				var contentString = contentType.isTypeOf(oFF.ContentType.BINARY) ? oFF.XByteArray.convertToString(fileContent.getByteArray()) : fileContent.getString();
				fileUpdateRequest.putString(oFF.XRemoteHttpFileConstants.CONTENT, contentString);
				fileUpdateRequest.putBoolean(oFF.XRemoteHttpFileConstants.EXECUTABLE, httpFile.isExecutable());
			}
		}
		if (oFF.notNull(this.m_destFile))
		{
			fileUpdateRequest.putString(oFF.XRemoteHttpFileConstants.NEW_FILE_NAME, this.m_destFile.getName());
		}
		request.setJsonObject(fileUpdateRequest);
	}
	else if (oFF.XString.isEqual(this.m_action, oFF.XRemoteHttpFileRequestAction.DELETE))
	{
		request.setMethod(oFF.HttpRequestMethod.HTTP_DELETE);
	}
	request.setAcceptContentType(oFF.ContentType.APPLICATION_JSON);
	var httpClient = request.newHttpClient(this.getSession());
	httpClient.processHttpRequest(syncType, this, null);
	return true;
};
oFF.XRemoteHttpFileRequestAction.prototype.onHttpResponse = function(extResult, response, customIdentifier)
{
	this.addAllMessages(extResult);
	if (extResult.isValid())
	{
		if (oFF.HttpStatusCode.isOk(response.getStatusCode()))
		{
			var jsonContent = response.getJsonContent();
			if (oFF.notNull(jsonContent) && jsonContent.isStructure())
			{
				var fileInfo = jsonContent;
				var file = this.getActionContext();
				this.updateFileFromResponse(file, fileInfo);
			}
			else
			{
				this.addErrorExt(oFF.OriginLayer.IOLAYER, oFF.ErrorCodes.SYSTEM_IO, "Missing json content", null);
			}
		}
		else
		{
			this.addErrorExt(oFF.OriginLayer.IOLAYER, oFF.ErrorCodes.SYSTEM_IO_HTTP, response.getStatusCodeDetails(), null);
		}
	}
	this.endSync();
};
oFF.XRemoteHttpFileRequestAction.prototype.updateFileFromResponse = function(file, fileStructure)
{
	file.setMetadataLoaded(true);
	var exists = fileStructure.getBooleanByKey(oFF.XRemoteHttpFileConstants.EXISTS);
	this.importMessages(file, fileStructure);
	file.setExisting(exists);
	if (exists)
	{
		var fileType = fileStructure.getStringByKey(oFF.XRemoteHttpFileConstants.FILE_TYPE);
		var dir = oFF.XString.isEqual(fileType, oFF.XRemoteHttpFileConstants.FILE_TYPE_DIR);
		file.setIsDirectory(dir);
		var fileName = fileStructure.getStringByKey(oFF.XRemoteHttpFileConstants.FILE_NAME);
		if (oFF.notNull(fileName))
		{
			file.updateName(fileName);
		}
		file.setHidden(fileStructure.getBooleanByKeyExt(oFF.XRemoteHttpFileConstants.HIDDEN, false));
		if (dir)
		{
			this.m_parentVfsUri = this.normalizeForDir(this.m_parentVfsUri);
			this.m_parentTargetUri = this.normalizeForDir(this.m_parentTargetUri);
			var childrenElements = fileStructure.getListByKey(oFF.XRemoteHttpFileConstants.CHILDREN);
			if (oFF.notNull(childrenElements))
			{
				var process = this.getProcess();
				var fileSystem = file.getFileSystem();
				var children = oFF.XList.create();
				for (var i = 0; i < childrenElements.size(); i++)
				{
					var childFileStructure = childrenElements.getStructureAt(i);
					var type = childFileStructure.getStringByKey(oFF.XRemoteHttpFileConstants.FILE_TYPE);
					var isDirectory = oFF.XString.isEqual(type, oFF.XRemoteHttpFileConstants.FILE_TYPE_DIR);
					var name = childFileStructure.getStringByKey(oFF.XRemoteHttpFileConstants.FILE_NAME);
					var targetName = isDirectory ? oFF.XStringUtils.concatenate2(name, "/") : name;
					var targetChildUri = oFF.XUri.createFromParentUriAndRelativeUrl(this.m_parentTargetUri, targetName, false);
					var childFile = oFF.XRemoteHttpFile._create(process, fileSystem, targetChildUri);
					this.updateFileFromResponse(childFile, childFileStructure);
					children.add(childFile);
				}
				file.setChildFiles(children, -1);
			}
			file.setMetadataLoaded(true);
		}
		else
		{
			var isExecutable = fileStructure.getBooleanByKeyExt(oFF.XRemoteHttpFileConstants.EXECUTABLE, false);
			file.setIsExecutable(isExecutable);
			var contentString = fileStructure.getStringByKey(oFF.XRemoteHttpFileConstants.CONTENT);
			if (oFF.notNull(contentString))
			{
				var contentTypeString = fileStructure.getStringByKey(oFF.XRemoteHttpFileConstants.CONTENT_TYPE);
				var contentType = oFF.ContentType.lookup(contentTypeString);
				var fileContent;
				if (contentType.isTypeOf(oFF.ContentType.BINARY))
				{
					fileContent = oFF.XContent.createByteArrayContent(contentType, oFF.XByteArray.convertFromString(contentString));
				}
				else
				{
					fileContent = oFF.XContent.createStringContent(contentType, contentString);
				}
				file.setFileContent(fileContent);
				file.setMetadataLoaded(true);
			}
		}
	}
	file.setMetadataFromProperties();
};
oFF.XRemoteHttpFileRequestAction.prototype.importMessages = function(file, fileStructure)
{
	var messages = fileStructure.getListByKey("Messages");
	if (oFF.notNull(messages))
	{
		oFF.XCollectionUtils.forEach(messages,  function(m){
			var message = m.asStructure();
			file.addMessage(oFF.XMessage.createMessage(oFF.OriginLayer.IOLAYER, oFF.Severity.fromName(message.getStringByKey("Type")), message.getIntegerByKeyExt("Code", oFF.ErrorCodes.SYSTEM_IO_WRITE_ACCESS), message.getStringByKey("Text"), null, false, null));
		}.bind(this));
	}
};
oFF.XRemoteHttpFileRequestAction.prototype.normalizeForDir = function(uri)
{
	var result = uri;
	var path = uri.getPath();
	if (oFF.XString.endsWith(path, "/") === false)
	{
		var targetUri = oFF.XUri.createFromOther(uri);
		if (oFF.XString.endsWith(path, "/") === false)
		{
			path = oFF.XStringUtils.concatenate2(path, "/");
		}
		targetUri.setPath(path);
		result = targetUri;
	}
	return result;
};
oFF.XRemoteHttpFileRequestAction.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onHttpFileProcessed(extResult, data, null);
};
oFF.XRemoteHttpFileRequestAction.prototype.setDestinationFile = function(destFile)
{
	this.m_destFile = destFile;
};

oFF.XFileSystemActionFetchFile = function() {};
oFF.XFileSystemActionFetchFile.prototype = new oFF.SyncActionExt();
oFF.XFileSystemActionFetchFile.prototype._ff_c = "XFileSystemActionFetchFile";

oFF.XFileSystemActionFetchFile.createAndRun = function(syncType, listener, customIdentifier, fsmr, process, uri)
{
	var object = new oFF.XFileSystemActionFetchFile();
	object.m_uri = uri;
	object.m_process = process;
	object.setupActionAndRun(syncType, listener, customIdentifier, fsmr);
	return object;
};
oFF.XFileSystemActionFetchFile.prototype.m_uri = null;
oFF.XFileSystemActionFetchFile.prototype.m_process = null;
oFF.XFileSystemActionFetchFile.prototype.processSynchronization = function(syncType)
{
	var fsmr = this.getActionContext();
	var newFile = fsmr.newFile(this.m_process, this.m_uri);
	this.setData(newFile);
	return false;
};
oFF.XFileSystemActionFetchFile.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onFileFetched(extResult, data, customIdentifier);
};

oFF.DfXFileProviderBlocking = function() {};
oFF.DfXFileProviderBlocking.prototype = new oFF.DfXFileProvider();
oFF.DfXFileProviderBlocking.prototype._ff_c = "DfXFileProviderBlocking";

oFF.DfXFileProviderBlocking.prototype.processProviderSave = function(syncType, listener, customIdentifier, content, compression)
{
	return oFF.XFileActionSave.createAndRun(syncType, listener, customIdentifier, this.getFileSystem(), this, content, compression);
};
oFF.DfXFileProviderBlocking.prototype.processProviderLoad = function(syncType, listener, customIdentifier, compression)
{
	return oFF.XFileActionLoad.createAndRun(syncType, listener, customIdentifier, this.getFileSystem(), this, compression);
};
oFF.DfXFileProviderBlocking.prototype.processDelete = function(syncType, listener, customIdentifier)
{
	return oFF.XFileActionDelete.createAndRun(syncType, listener, customIdentifier, this.getFileSystem(), this);
};
oFF.DfXFileProviderBlocking.prototype.processRename = function(syncType, listener, customIdentifier, destFile)
{
	return oFF.XFileActionRename.createAndRun(syncType, listener, customIdentifier, this.getFileSystem(), this, destFile);
};
oFF.DfXFileProviderBlocking.prototype.processProviderMkdir = function(syncType, listener, customIdentifier, includeParentDirs)
{
	return oFF.XFileActionMkdir.createAndRun(syncType, listener, customIdentifier, this.getFileSystem(), this, includeParentDirs);
};
oFF.DfXFileProviderBlocking.prototype.processProviderFetchChildren = function(syncType, listener, customIdentifier, config)
{
	return oFF.XFileActionFetchChildren.createAndRun(syncType, listener, customIdentifier, this.getFileSystem(), this);
};
oFF.DfXFileProviderBlocking.prototype.processIsExisting = function(syncType, listener, customIdentifier)
{
	return oFF.XFileActionIsExisting.createAndRun(syncType, listener, customIdentifier, this.getFileSystem(), this);
};

oFF.DfXFileProviderNonBlocking = function() {};
oFF.DfXFileProviderNonBlocking.prototype = new oFF.DfXFileProvider();
oFF.DfXFileProviderNonBlocking.prototype._ff_c = "DfXFileProviderNonBlocking";

oFF.DfXFileProviderNonBlocking.prototype.saveExt = function(content, compression)
{
	this.processSave(oFF.SyncType.BLOCKING, null, null, content, compression);
};
oFF.DfXFileProviderNonBlocking.prototype.loadExt = function(compression)
{
	var extRes = this.processLoad(oFF.SyncType.BLOCKING, null, null, compression);
	return extRes.getData().getFileContent();
};
oFF.DfXFileProviderNonBlocking.prototype.deleteFile = function()
{
	this.processDelete(oFF.SyncType.BLOCKING, null, null);
};
oFF.DfXFileProviderNonBlocking.prototype.renameTo = function(dest)
{
	var syncAction = this.processRename(oFF.SyncType.BLOCKING, null, null, dest);
	if (syncAction.isValid())
	{
		return syncAction;
	}
	else
	{
		this.addAllMessages(syncAction);
		var result = oFF.ExtResult.create(dest, syncAction);
		return result;
	}
};
oFF.DfXFileProviderNonBlocking.prototype.mkdirExt = function(includeParentDirs)
{
	this.processProviderMkdir(oFF.SyncType.BLOCKING, null, null, includeParentDirs);
};
oFF.DfXFileProviderNonBlocking.prototype.getChildren = function()
{
	this.processFetchChildren(oFF.SyncType.BLOCKING, null, null, null);
	return this.getCachedChildFiles();
};

oFF.DfFileAction = function() {};
oFF.DfFileAction.prototype = new oFF.SyncActionExt();
oFF.DfFileAction.prototype._ff_c = "DfFileAction";

oFF.DfFileAction.prototype.getFile = function()
{
	return this.getData();
};

oFF.XFsSubSysActionFetchFilesystem = function() {};
oFF.XFsSubSysActionFetchFilesystem.prototype = new oFF.SyncActionExt();
oFF.XFsSubSysActionFetchFilesystem.prototype._ff_c = "XFsSubSysActionFetchFilesystem";

oFF.XFsSubSysActionFetchFilesystem.createAndRun = function(syncType, listener, customIdentifier, fsmr, uri)
{
	var object = new oFF.XFsSubSysActionFetchFilesystem();
	object.m_uri = uri;
	object.setupActionAndRun(syncType, listener, customIdentifier, fsmr);
	return object;
};
oFF.XFsSubSysActionFetchFilesystem.prototype.m_uri = null;
oFF.XFsSubSysActionFetchFilesystem.prototype.processSynchronization = function(syncType)
{
	var fileSystem = this.getActionContext().getFileSystemByUri(this.m_uri);
	this.setData(fileSystem);
	return false;
};
oFF.XFsSubSysActionFetchFilesystem.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onFileSystemFetched(extResult, data, customIdentifier);
};

oFF.VfsElementType = function() {};
oFF.VfsElementType.prototype = new oFF.XComponentType();
oFF.VfsElementType.prototype._ff_c = "VfsElementType";

oFF.VfsElementType.ELEMENT = null;
oFF.VfsElementType.FILE = null;
oFF.VfsElementType.NODE = null;
oFF.VfsElementType.MOUNT_POINT = null;
oFF.VfsElementType.DIR = null;
oFF.VfsElementType.staticSetupVfsComponentType = function()
{
	oFF.VfsElementType.ELEMENT = oFF.VfsElementType.createIoType("VfsElement", oFF.XComponentType._ROOT);
	oFF.VfsElementType.FILE = oFF.VfsElementType.createIoType("VfsFile", oFF.VfsElementType.ELEMENT);
	oFF.VfsElementType.NODE = oFF.VfsElementType.createIoType("VfsNode", oFF.VfsElementType.ELEMENT);
	oFF.VfsElementType.MOUNT_POINT = oFF.VfsElementType.createIoType("VfsDirMountPoint", oFF.VfsElementType.NODE);
	oFF.VfsElementType.DIR = oFF.VfsElementType.createIoType("VfsDir", oFF.VfsElementType.NODE);
};
oFF.VfsElementType.createIoType = function(constant, parent)
{
	var mt = new oFF.VfsElementType();
	mt.setupExt(constant, parent);
	return mt;
};

oFF.VfsFetchFileAction = function() {};
oFF.VfsFetchFileAction.prototype = new oFF.SyncActionExt();
oFF.VfsFetchFileAction.prototype._ff_c = "VfsFetchFileAction";

oFF.VfsFetchFileAction.createAndRun = function(syncType, listener, customIdentifier, fileSystem, process, vfsUri)
{
	var object = new oFF.VfsFetchFileAction();
	object.m_process = process;
	object.m_vfsUri = vfsUri;
	object.setupActionAndRun(syncType, listener, customIdentifier, fileSystem);
	return object;
};
oFF.VfsFetchFileAction.prototype.m_process = null;
oFF.VfsFetchFileAction.prototype.m_vfsUri = null;
oFF.VfsFetchFileAction.prototype.processSynchronization = function(syncType)
{
	var fileProvider = null;
	var vfsFileSystem = this.getActionContext();
	var path = this.m_vfsUri.getPath();
	var pathInfo = vfsFileSystem.getPathInfo(path);
	if (pathInfo.isOnMountPoint())
	{
		fileProvider = oFF.VfsFileProvider.createExt(this.m_process, vfsFileSystem, this.m_vfsUri, pathInfo, null, null);
		this.setData(fileProvider);
		return false;
	}
	else if (pathInfo.isInMountingArea())
	{
		var mountPoint = pathInfo.getMountPoint();
		if (oFF.notNull(mountPoint))
		{
			var targetUri = mountPoint.calculateTargetUri(this.m_vfsUri);
			var fileSystemManager = this.m_process.getFileSystemManager();
			fileSystemManager.processFetchFile(syncType, this, null, this.m_process, targetUri);
			return true;
		}
		else
		{
			this.addError(0, "No mounting point is given");
			return false;
		}
	}
	else
	{
		fileProvider = oFF.VfsFileProvider.createExt(this.m_process, vfsFileSystem, this.m_vfsUri, pathInfo, null, null);
		this.setData(fileProvider);
		return false;
	}
};
oFF.VfsFetchFileAction.prototype.onFileFetched = function(extResult, file, customIdentifier)
{
	this.addAllMessages(extResult);
	this.setData(file);
	this.endSync();
};
oFF.VfsFetchFileAction.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onFileFetched(extResult, data, customIdentifier);
};

oFF.XFileActionIndirection = function() {};
oFF.XFileActionIndirection.prototype = new oFF.SyncActionExt();
oFF.XFileActionIndirection.prototype._ff_c = "XFileActionIndirection";

oFF.XFileActionIndirection.PROCESS_LOAD = 0;
oFF.XFileActionIndirection.IS_EXISTING = 1;
oFF.XFileActionIndirection.IS_FILE = 2;
oFF.XFileActionIndirection.IS_DIRECTORY = 3;
oFF.XFileActionIndirection.GET_NATIVE_PATH = 4;
oFF.XFileActionIndirection.PROCESS_MKDIR = 6;
oFF.XFileActionIndirection.DELETE_RECURSIVE = 10;
oFF.XFileActionIndirection.FETCH_CHILDREN = 11;
oFF.XFileActionIndirection.GET_ATTRIBUTES = 12;
oFF.XFileActionIndirection.DELETE = 16;
oFF.XFileActionIndirection.GET_CHILD_STATE = 17;
oFF.XFileActionIndirection.HAS_CHILDREN = 18;
oFF.XFileActionIndirection.DELETE_CHILDREN = 19;
oFF.XFileActionIndirection.SUPPORTS_RENAME_TO = 20;
oFF.XFileActionIndirection.PROCESS_SAVE = 21;
oFF.XFileActionIndirection.PROCESS_IS_EXISTING = 22;
oFF.XFileActionIndirection.FETCH_METADATA = 23;
oFF.XFileActionIndirection.PROCESS_RENAME = 24;
oFF.XFileActionIndirection.createAndRun = function(syncType, listener, customIdentifier, fileHandle, type, compression, saveContent, includeParentDirs, config, targetName)
{
	var newObj = new oFF.XFileActionIndirection();
	var process = fileHandle.getProcess();
	oFF.XObjectExt.assertNotNull(process);
	oFF.XObjectExt.assertFalse(process.isReleased());
	newObj.m_type = type;
	newObj.m_compression = compression;
	newObj.m_saveContent = saveContent;
	newObj.m_includeParentDirs = includeParentDirs;
	newObj.m_config = config;
	newObj.m_targetName = targetName;
	newObj.setData(fileHandle);
	newObj.setupActionAndRun(syncType, listener, customIdentifier, fileHandle);
	return newObj;
};
oFF.XFileActionIndirection.prototype.m_type = 0;
oFF.XFileActionIndirection.prototype.m_compression = null;
oFF.XFileActionIndirection.prototype.m_vfsUri = null;
oFF.XFileActionIndirection.prototype.m_saveContent = null;
oFF.XFileActionIndirection.prototype.m_includeParentDirs = false;
oFF.XFileActionIndirection.prototype.m_config = null;
oFF.XFileActionIndirection.prototype.m_isExisting = false;
oFF.XFileActionIndirection.prototype.m_isFile = false;
oFF.XFileActionIndirection.prototype.m_isDirectory = false;
oFF.XFileActionIndirection.prototype.m_nativePath = null;
oFF.XFileActionIndirection.prototype.m_targetUri = null;
oFF.XFileActionIndirection.prototype.m_attributes = null;
oFF.XFileActionIndirection.prototype.m_loadContent = null;
oFF.XFileActionIndirection.prototype.m_childSetState = null;
oFF.XFileActionIndirection.prototype.m_hasChildren = false;
oFF.XFileActionIndirection.prototype.m_supportsRenameTo = false;
oFF.XFileActionIndirection.prototype.m_targetName = null;
oFF.XFileActionIndirection.prototype.processSynchronization = function(syncType)
{
	var fileHandle = this.getActionContext();
	if (fileHandle.hasValidUri() === false)
	{
		this.addError(0, "No valid URL given");
		return false;
	}
	else
	{
		var targetFile = fileHandle.getTargetFile();
		if (oFF.notNull(targetFile))
		{
			this.execute(targetFile);
			return true;
		}
		else
		{
			this.m_vfsUri = fileHandle.getUri();
			var process = this.getProcess();
			var fsm = process.getFileSystemManager();
			fsm.processFetchFile(syncType, this, null, process, this.m_vfsUri);
			return true;
		}
	}
};
oFF.XFileActionIndirection.prototype.onFileFetched = function(extResult, file, customIdentifier)
{
	this.addAllMessages(extResult);
	if (this.isValid() && oFF.notNull(file))
	{
		var actionContext = this.getActionContext();
		actionContext.setTargetFile(file);
		this.execute(file);
	}
	else
	{
		this.endSync();
	}
};
oFF.XFileActionIndirection.prototype.execute = function(file)
{
	var syncType = this.getActiveSyncType();
	if (this.m_type === oFF.XFileActionIndirection.PROCESS_LOAD)
	{
		file.processProviderLoad(syncType, this, null, this.m_compression);
	}
	else if (this.m_type === oFF.XFileActionIndirection.IS_EXISTING)
	{
		this.m_isExisting = file.isExisting();
	}
	else if (this.m_type === oFF.XFileActionIndirection.IS_FILE)
	{
		this.m_isFile = file.isFile();
	}
	else if (this.m_type === oFF.XFileActionIndirection.IS_DIRECTORY)
	{
		this.m_isDirectory = file.isDirectory();
	}
	else if (this.m_type === oFF.XFileActionIndirection.GET_NATIVE_PATH)
	{
		this.m_nativePath = file.getNativePath();
	}
	else if (this.m_type === oFF.XFileActionIndirection.PROCESS_MKDIR)
	{
		file.processProviderMkdir(syncType, this, null, this.m_includeParentDirs);
	}
	else if (this.m_type === oFF.XFileActionIndirection.DELETE_RECURSIVE)
	{
		file.deleteRecursive();
	}
	else if (this.m_type === oFF.XFileActionIndirection.FETCH_CHILDREN)
	{
		file.processProviderFetchChildren(syncType, this, null, this.m_config);
	}
	else if (this.m_type === oFF.XFileActionIndirection.GET_ATTRIBUTES)
	{
		this.m_attributes = file.getAttributes();
	}
	else if (this.m_type === oFF.XFileActionIndirection.DELETE)
	{
		file.deleteFile();
	}
	else if (this.m_type === oFF.XFileActionIndirection.GET_CHILD_STATE)
	{
		this.m_childSetState = file.getChildSetState();
	}
	else if (this.m_type === oFF.XFileActionIndirection.HAS_CHILDREN)
	{
		this.m_hasChildren = file.hasChildren();
	}
	else if (this.m_type === oFF.XFileActionIndirection.DELETE_CHILDREN)
	{
		file.deleteChildren();
	}
	else if (this.m_type === oFF.XFileActionIndirection.SUPPORTS_RENAME_TO)
	{
		this.m_supportsRenameTo = file.supportsRenameTo();
	}
	else if (this.m_type === oFF.XFileActionIndirection.PROCESS_SAVE)
	{
		file.processProviderSave(syncType, this, null, this.m_saveContent, this.m_compression);
	}
	else if (this.m_type === oFF.XFileActionIndirection.PROCESS_IS_EXISTING)
	{
		file.processIsExisting(syncType, this, null);
	}
	else if (this.m_type === oFF.XFileActionIndirection.FETCH_METADATA)
	{
		file.processProviderFetchMetadata(syncType, this, null);
	}
	else if (this.m_type === oFF.XFileActionIndirection.PROCESS_RENAME)
	{
		file.processProviderRename(syncType, this, null, this.m_targetName);
	}
};
oFF.XFileActionIndirection.prototype.onFileLoaded = function(extResult, file, fileContent, customIdentifier)
{
	this.onUpdate(extResult, file, true);
};
oFF.XFileActionIndirection.prototype.onFileSaved = function(extResult, file, fileContent, customIdentifier)
{
	this.onUpdate(extResult, file, true);
};
oFF.XFileActionIndirection.prototype.onFileExistsCheck = function(extResult, file, isExisting, customIdentifier)
{
	this.onUpdate(extResult, file, false);
	if (this.isValid())
	{
		var fileHandle = this.getActionContext();
		fileHandle.setIsExisting(isExisting);
	}
	this.endSync();
};
oFF.XFileActionIndirection.prototype.onChildrenFetched = function(extResult, file, children, resultset, customIdentifier)
{
	this.onUpdate(extResult, file, false);
	var proxyFiles = oFF.XList.create();
	var parentHandle = this.getFileHandle();
	if (extResult.isValid() && oFF.notNull(children))
	{
		var originFile = this.getActionContext();
		var process = originFile.getProcess();
		if (oFF.notNull(process))
		{
			var parentVfs = originFile.getUri();
			for (var i = 0; i < children.size(); i++)
			{
				var targetFile = children.get(i);
				var targetUri = oFF.XUri.createChildFile(parentVfs, targetFile.getName());
				var theProxyFile = oFF.XFileHandle.createByTarget(process, targetUri, targetFile, parentHandle.isBlockingMetadataCallFallback());
				proxyFiles.add(theProxyFile);
			}
		}
	}
	var totalItemCount = oFF.notNull(resultset) ? resultset.getTotalItemCount() : -1;
	var fileHandle = this.getActionContext();
	fileHandle.setChildFiles(proxyFiles, totalItemCount);
	this.endSync();
};
oFF.XFileActionIndirection.prototype.onDirectoryCreated = function(extResult, file, customIdentifier)
{
	this.onUpdate(extResult, file, true);
};
oFF.XFileActionIndirection.prototype.onFileFetchMetadata = function(extResult, file, metadata, customIdentifier)
{
	this.onUpdate(extResult, file, false);
	this.endSync();
};
oFF.XFileActionIndirection.prototype.onUpdate = function(extResult, file, doEndSync)
{
	this.addAllMessages(extResult);
	if (this.isValid())
	{
		var originFile = this.getActionContext();
		originFile.setTargetFile(file);
	}
	if (doEndSync)
	{
		this.endSync();
	}
};
oFF.XFileActionIndirection.prototype.onFileRenamed = function(extResult, file, customIdentifier)
{
	this.onUpdate(extResult, file, true);
};
oFF.XFileActionIndirection.prototype.getFileHandle = function()
{
	return this.getData();
};
oFF.XFileActionIndirection.prototype.endSync = function()
{
	var messageManager = this.getActionContext().getInternalMessageManager();
	messageManager.clearMessages();
	messageManager.addAllMessages(this);
	oFF.SyncActionExt.prototype.endSync.call( this );
};
oFF.XFileActionIndirection.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	if (this.m_type === oFF.XFileActionIndirection.PROCESS_LOAD)
	{
		var content = null;
		if (this.isValid())
		{
			content = data.getFileContent();
		}
		listener.onFileLoaded(extResult, data, content, customIdentifier);
	}
	else if (this.m_type === oFF.XFileActionIndirection.FETCH_CHILDREN)
	{
		var cachedChildFiles = data.getCachedChildFiles();
		listener.onChildrenFetched(extResult, data, cachedChildFiles, null, customIdentifier);
	}
	else if (this.m_type === oFF.XFileActionIndirection.PROCESS_SAVE)
	{
		listener.onFileSaved(extResult, data, this.m_saveContent, customIdentifier);
	}
	else if (this.m_type === oFF.XFileActionIndirection.PROCESS_IS_EXISTING)
	{
		listener.onFileExistsCheck(extResult, data, data.getCachedIsExisting(), customIdentifier);
	}
	else if (this.m_type === oFF.XFileActionIndirection.FETCH_METADATA)
	{
		listener.onFileFetchMetadata(extResult, data, data.getCachedMetadata(), customIdentifier);
	}
	else if (this.m_type === oFF.XFileActionIndirection.PROCESS_MKDIR)
	{
		listener.onDirectoryCreated(extResult, data, customIdentifier);
	}
};

oFF.XFileSystemManagerActionFetch = function() {};
oFF.XFileSystemManagerActionFetch.prototype = new oFF.SyncActionExt();
oFF.XFileSystemManagerActionFetch.prototype._ff_c = "XFileSystemManagerActionFetch";

oFF.XFileSystemManagerActionFetch.createAndRun = function(syncType, listener, customIdentifier, fsmr, uri, activate)
{
	var object = new oFF.XFileSystemManagerActionFetch();
	object.m_uri = uri;
	object.m_activate = activate;
	object.setupActionAndRun(syncType, listener, customIdentifier, fsmr);
	return object;
};
oFF.XFileSystemManagerActionFetch.prototype.m_uri = null;
oFF.XFileSystemManagerActionFetch.prototype.m_activate = false;
oFF.XFileSystemManagerActionFetch.prototype.m_continueProcessing = false;
oFF.XFileSystemManagerActionFetch.prototype.m_isFinished = false;
oFF.XFileSystemManagerActionFetch.prototype.processSynchronization = function(syncType)
{
	var fs = null;
	var protocolType = this.m_uri.getProtocolType();
	if (oFF.notNull(protocolType))
	{
		var uriMask = oFF.XFileSystemFactory.getUriMask(protocolType);
		var url = this.m_uri.getUrlWithMask(uriMask);
		var fsmr = this.getActionContext();
		fs = fsmr.getAllInitializedFileSystems().getByKey(url);
		if (oFF.isNull(fs))
		{
			var process = this.getProcess();
			fs = oFF.XFileSystemFactory.create(process, this.m_uri);
			if (oFF.notNull(fs))
			{
				fsmr.setFileSystemByUri(this.m_uri, fs);
			}
			else
			{
				var kernel = process.getKernel();
				var subSystemContainer = kernel.getSubSystemContainerExt(oFF.SubSystemType.FILE_SYSTEM, protocolType.getName());
				if (oFF.notNull(subSystemContainer))
				{
					this.m_continueProcessing = true;
					subSystemContainer.processSubSystemLoad(this.getActiveSyncType(), this, null);
				}
				else
				{
					this.addError(0, oFF.XStringUtils.concatenate2("Cannot find subsystem for the filesystem", protocolType.getName()));
				}
			}
		}
	}
	if (this.m_continueProcessing === false)
	{
		this.finalizeAction(fs);
	}
	return this.m_continueProcessing;
};
oFF.XFileSystemManagerActionFetch.prototype.onSubSystemLoaded = function(extResult, subSystem, customIdentifier)
{
	this.m_continueProcessing = false;
	this.addAllMessages(extResult);
	if (this.isValid())
	{
		var fsa = subSystem.getMainApi();
		fsa.processFetchFileSystem(this.getActiveSyncType(), this, this.m_uri, this.m_uri);
	}
	else
	{
		this.endSync();
	}
};
oFF.XFileSystemManagerActionFetch.prototype.onFileSystemFetched = function(extResult, fileSystem, customIdentifier)
{
	this.finalizeAction(fileSystem);
	this.endSync();
};
oFF.XFileSystemManagerActionFetch.prototype.finalizeAction = function(fs)
{
	if (this.m_isFinished === false)
	{
		var fsmr = this.getActionContext();
		if (oFF.notNull(fs))
		{
			fsmr.setFileSystemByUri(this.m_uri, fs);
			if (this.m_activate === true)
			{
				fsmr.setActiveFileSystemByUri(this.m_uri);
			}
			this.setData(fs);
		}
		this.m_isFinished = true;
	}
};
oFF.XFileSystemManagerActionFetch.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onFileSystemFetched(extResult, data, customIdentifier);
};

oFF.XFileSystemManagerActionFetchFile = function() {};
oFF.XFileSystemManagerActionFetchFile.prototype = new oFF.SyncActionExt();
oFF.XFileSystemManagerActionFetchFile.prototype._ff_c = "XFileSystemManagerActionFetchFile";

oFF.XFileSystemManagerActionFetchFile.createAndRun = function(syncType, listener, customIdentifier, fsmr, uri)
{
	var object = new oFF.XFileSystemManagerActionFetchFile();
	object.m_uri = uri;
	object.m_process = fsmr.getProcess();
	oFF.XObjectExt.assertNotNull(object.m_process);
	object.setupActionAndRun(syncType, listener, customIdentifier, fsmr);
	return object;
};
oFF.XFileSystemManagerActionFetchFile.prototype.m_uri = null;
oFF.XFileSystemManagerActionFetchFile.prototype.m_process = null;
oFF.XFileSystemManagerActionFetchFile.prototype.processSynchronization = function(syncType)
{
	var fsmr = this.getActionContext();
	fsmr.processFetchFileSystem(this.getActiveSyncType(), this, null, this.m_uri);
	return true;
};
oFF.XFileSystemManagerActionFetchFile.prototype.onFileSystemFetched = function(extResult, fileSystem, customIdentifier)
{
	this.addAllMessages(extResult);
	if (this.isValid())
	{
		fileSystem.processFetchFile(this.getActiveSyncType(), this, null, this.m_process, this.m_uri);
	}
	else
	{
		this.endSync();
	}
};
oFF.XFileSystemManagerActionFetchFile.prototype.onFileFetched = function(extResult, file, customIdentifier)
{
	this.addAllMessages(extResult);
	if (this.isValid())
	{
		this.setData(file);
	}
	this.endSync();
};
oFF.XFileSystemManagerActionFetchFile.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onFileFetched(extResult, data, customIdentifier);
};

oFF.ServerGetCallAction = function() {};
oFF.ServerGetCallAction.prototype = new oFF.ServerCallAction();
oFF.ServerGetCallAction.prototype._ff_c = "ServerGetCallAction";

oFF.ServerGetCallAction.createAndRun = function(syncType, context, listener, customIdentifier, url)
{
	var action = new oFF.ServerGetCallAction();
	action.m_url = url;
	action.setupActionAndRun(syncType, listener, customIdentifier, context);
	return action;
};
oFF.ServerGetCallAction.prototype.m_url = null;
oFF.ServerGetCallAction.prototype.getUri = function(connection)
{
	return oFF.XUri.createFromUrl(this.m_url);
};
oFF.ServerGetCallAction.prototype.onFunctionExecuted = function(extResult, response, customIdentifier)
{
	this.addAllMessages(extResult);
	if (extResult.isValid())
	{
		var storyJson = response.getRootElement();
		this.setData(response);
		if (oFF.isNull(storyJson))
		{
			this.addError(0, "No story returned");
		}
	}
	this.endSync();
};
oFF.ServerGetCallAction.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onServerCallExecuted(extResult, data, customIdentifier);
};
oFF.ServerGetCallAction.prototype.releaseObject = function()
{
	this.m_url = null;
	oFF.ServerCallAction.prototype.releaseObject.call( this );
};

oFF.ServerLoginAction = function() {};
oFF.ServerLoginAction.prototype = new oFF.ServerCallAction();
oFF.ServerLoginAction.prototype._ff_c = "ServerLoginAction";

oFF.ServerLoginAction.createAndRun = function(syncType, connectionContainer, listener, customIdentifier)
{
	var object = new oFF.ServerLoginAction();
	object.setupActionAndRun(syncType, listener, customIdentifier, connectionContainer);
	return object;
};
oFF.ServerLoginAction.prototype.getUri = function(connection)
{
	return oFF.XUri.createFromUrl(connection.getSystemDescription().getSystemType().getLogonPath());
};

oFF.ServerPreflightAction = function() {};
oFF.ServerPreflightAction.prototype = new oFF.ServerCallAction();
oFF.ServerPreflightAction.prototype._ff_c = "ServerPreflightAction";

oFF.ServerPreflightAction.createAndRun = function(syncType, connectionContainer, listener, customIdentifier)
{
	var object = new oFF.ServerPreflightAction();
	object.setupActionAndRun(syncType, listener, customIdentifier, connectionContainer);
	return object;
};
oFF.ServerPreflightAction.prototype.onFunctionExecutedInternal = function(extResult, response, customIdentifier)
{
	var connectionContainer = this.getActionContext();
	connectionContainer.setIsPreflightNeeded(false);
};
oFF.ServerPreflightAction.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onServerCallExecuted(extResult, data, customIdentifier);
};
oFF.ServerPreflightAction.prototype.getUri = function(connection)
{
	return connection.getPreflightUri();
};
oFF.ServerPreflightAction.prototype.getRequestType = function()
{
	return oFF.HttpSemanticRequestType.PREFLIGHT;
};

oFF.RpcBatchFunction = function() {};
oFF.RpcBatchFunction.prototype = new oFF.DfRpcFunction();
oFF.RpcBatchFunction.prototype._ff_c = "RpcBatchFunction";

oFF.RpcBatchFunction.create = function(connection, functionUri)
{
	var ocpFunction = new oFF.RpcBatchFunction();
	ocpFunction.setupFunction(connection, functionUri);
	return ocpFunction;
};
oFF.RpcBatchFunction.prototype.m_decorator = null;
oFF.RpcBatchFunction.prototype.processSynchronization = function(syncType)
{
	return true;
};
oFF.RpcBatchFunction.prototype.processFunctionExecution = function(syncType, listener, customIdentifier)
{
	if (syncType !== oFF.SyncType.NON_BLOCKING)
	{
		throw oFF.XException.createIllegalStateException("batch mode is enabled: function calls must be non-blocking");
	}
	return oFF.DfRpcFunction.prototype.processFunctionExecution.call( this , syncType, listener, customIdentifier);
};
oFF.RpcBatchFunction.prototype.endSync = function()
{
	this.setData(this.m_rpcResponse);
	oFF.DfRpcFunction.prototype.endSync.call( this );
};
oFF.RpcBatchFunction.prototype.setDecorator = function(decorator)
{
	this.m_decorator = decorator;
};
oFF.RpcBatchFunction.prototype.getDecorator = function()
{
	return this.m_decorator;
};

oFF.RpcHttpFunction = function() {};
oFF.RpcHttpFunction.prototype = new oFF.DfRpcFunction();
oFF.RpcHttpFunction.prototype._ff_c = "RpcHttpFunction";

oFF.RpcHttpFunction.BW_RPC_FUNCTION_REF = "BwRpcFunctionRef";
oFF.RpcHttpFunction.BW_SESSION_REQUEST = "BwSessionRequest";
oFF.RpcHttpFunction.REQUEST_PARAM_SERVER_TRACE_FLAG = "trace";
oFF.RpcHttpFunction.REQUEST_PARAM_SAP_STATISTICS = "sap-statistics";
oFF.RpcHttpFunction.PRINT_REQUESTS = false;
oFF.RpcHttpFunction.PRINT_RESPONSES = false;
oFF.RpcHttpFunction.DEBUG_MODE = false;
oFF.RpcHttpFunction.TEST_MODE = false;
oFF.RpcHttpFunction.TEST_MODE_LAST_REQUEST = null;
oFF.RpcHttpFunction.create = function(connection, functionUri)
{
	var ocpFunction = new oFF.RpcHttpFunction();
	ocpFunction.setupFunction(connection, functionUri);
	return ocpFunction;
};
oFF.RpcHttpFunction.prototype.m_httpClient = null;
oFF.RpcHttpFunction.prototype.m_response = null;
oFF.RpcHttpFunction.prototype.m_traceResponseFile = null;
oFF.RpcHttpFunction.prototype.connectionCounter = 0;
oFF.RpcHttpFunction.prototype.m_credentialsCallCounter = 0;
oFF.RpcHttpFunction.prototype.m_sessionRequested = false;
oFF.RpcHttpFunction.prototype.releaseObject = function()
{
	this.m_httpClient = oFF.XObjectExt.release(this.m_httpClient);
	this.m_traceResponseFile = oFF.XObjectExt.release(this.m_traceResponseFile);
	oFF.DfRpcFunction.prototype.releaseObject.call( this );
};
oFF.RpcHttpFunction.prototype.getDefaultMessageLayer = function()
{
	return oFF.OriginLayer.IOLAYER;
};
oFF.RpcHttpFunction.prototype.processSynchronization = function(syncType)
{
	this.doRpcHttpProcessing();
	return true;
};
oFF.RpcHttpFunction.prototype.cancelSynchronization = function()
{
	this.addErrorWithMessage("Request was cancelled");
	this.callListeners(false);
	oFF.DfRpcFunction.prototype.cancelSynchronization.call( this );
};
oFF.RpcHttpFunction.prototype.doRpcHttpProcessing = function()
{
	this.m_credentialsCallCounter = this.m_credentialsCallCounter + 1;
	if (this.getRpcRequest().isFireAndForgetCall())
	{
		this.onCredentialsReady(null, null, null);
	}
	else
	{
		this.handleProcessGetCredentials(null, null);
	}
};
oFF.RpcHttpFunction.prototype.handleProcessGetCredentials = function(response, changedType)
{
	var credentialsProvider = this.getProcess().getCredentialsProvider();
	var connection = this.getActionContext();
	var errorMessages = null;
	if (credentialsProvider.supportsOnErrorHandling() && this.getErrors().hasElements())
	{
		var errorsIterator = this.getErrors().getIterator();
		errorMessages = oFF.MessageManagerSimple.createMessageManager();
		while (errorsIterator.hasNext())
		{
			errorMessages.addMessage(errorsIterator.next());
		}
	}
	if (this.getActiveSyncType() === oFF.SyncType.NON_BLOCKING)
	{
		credentialsProvider.processGetCredentials(oFF.SyncType.NON_BLOCKING, this, null, connection, this.m_credentialsCallCounter, response, errorMessages, changedType);
	}
	else
	{
		var extCredentials = credentialsProvider.processGetCredentials(oFF.SyncType.BLOCKING, null, null, connection, this.m_credentialsCallCounter, response, errorMessages, changedType);
		this.onCredentialsReady(extCredentials, extCredentials.getData(), null);
	}
};
oFF.RpcHttpFunction.prototype.onCredentialsReady = function(extResult, personalization, customIdentifier)
{
	this.clearMessages();
	if (oFF.notNull(extResult) && extResult.hasErrors())
	{
		this.addAllMessages(extResult);
		this.endSync();
	}
	else
	{
		var connection = this.getActionContext();
		var systemDescription = connection.getSystemDescription();
		if (oFF.notNull(personalization) && systemDescription.getAuthenticationType().isEqualTo(oFF.AuthenticationType.BASIC) && systemDescription.isConnected() && this.getSession().getEnvironment().getBooleanByKeyExt(oFF.XEnvironmentConstants.FIREFLY_DISABLE_AUTH_HEADER_WHEN_CONNECTED, false))
		{
			var personalizationBase = personalization;
			personalizationBase.setUser(null);
			personalizationBase.setPassword(null);
		}
		this.processWithPersonalisation(personalization);
	}
};
oFF.RpcHttpFunction.prototype.processWithPersonalisation = function(personalization)
{
	this.m_httpClient = oFF.XObjectExt.release(this.m_httpClient);
	var connection = this.getActionContext();
	var systemDescription = connection.getSystemDescription();
	var rpcRequest = this.getRpcRequest();
	var method = rpcRequest.getMethod();
	var cache = connection.getConnectionCache();
	var needsGetServerInfo = false;
	var needsContextId = connection.isContextIdRequired() && connection.getSessionContextId() === null;
	var isAbap = connection.getSystemDescription().getSystemType().isTypeOf(oFF.SystemType.ABAP);
	var useGetResponseForBwSession = this.getSession().hasFeature(oFF.FeatureToggleOlap.BW_SESSION_ID_VIA_GET_RESPONSE) && isAbap;
	var serverInfoType = rpcRequest.getRequestType();
	var isServerMetadataCall = false;
	var requestType = rpcRequest.getRequestType();
	if (oFF.notNull(requestType))
	{
		isServerMetadataCall = requestType.isTypeOf(oFF.HttpSemanticRequestType.ABSTRACT_SERVER_GET);
	}
	if (method !== oFF.HttpRequestMethod.HTTP_GET && !rpcRequest.isFireAndForgetCall() && isServerMetadataCall === false)
	{
		var isAutoCsrf = this.getSession().hasFeature(oFF.FeatureToggleOlap.AUTO_CSRF_CALL);
		if (isAutoCsrf && connection.isCsrfTokenRequired() && connection.getCsrfToken() === null && connection.getCsrfRequiredCount() < 1)
		{
			needsGetServerInfo = true;
			serverInfoType = oFF.HttpSemanticRequestType.CSRF_UPDATE;
		}
		else
		{
			needsGetServerInfo = !useGetResponseForBwSession && needsContextId && !this.m_sessionRequested;
			if (needsGetServerInfo)
			{
				serverInfoType = oFF.HttpSemanticRequestType.SESSION_REQUEST;
			}
		}
	}
	this.m_sessionRequested = this.m_sessionRequested || needsContextId;
	if (needsGetServerInfo)
	{
		var synchronizationType = this.getActiveSyncType();
		if (synchronizationType === oFF.SyncType.BLOCKING)
		{
			var extResultServerMetadata = connection.getServerMetadataExt(synchronizationType, null, null, serverInfoType);
			this.onServerMetadataLoaded(extResultServerMetadata, extResultServerMetadata.getData(), null);
		}
		else
		{
			connection.getServerMetadataExt(synchronizationType, this, null, serverInfoType);
		}
	}
	else
	{
		var bwSessionRequest = needsContextId && useGetResponseForBwSession && method === oFF.HttpRequestMethod.HTTP_POST;
		var continueProcessing = true;
		if (bwSessionRequest)
		{
			var sessionRequest = connection.getSessionRequestSyncAction();
			if (oFF.notNull(sessionRequest) && this.getActiveSyncType() === oFF.SyncType.NON_BLOCKING)
			{
				var syncState = sessionRequest.getSyncState();
				if (syncState === oFF.SyncState.OUT_OF_SYNC || syncState === oFF.SyncState.PROCESSING)
				{
					var listenerReference = oFF.XPair.create(this, personalization);
					var rpcIdentifier = oFF.XNameGenericPair.create(oFF.RpcHttpFunction.BW_RPC_FUNCTION_REF, listenerReference);
					sessionRequest.attachListener(this, oFF.ListenerType.SPECIFIC, rpcIdentifier);
					continueProcessing = false;
				}
			}
		}
		if (continueProcessing)
		{
			var httpRequest = oFF.HttpRequest.create();
			httpRequest.setFromConnectionInfo(systemDescription);
			httpRequest.setIsLogoff(rpcRequest.isLogoff());
			var sysPrefix = httpRequest.getPrefix();
			var sysPath = httpRequest.getPath();
			var functionPath = rpcRequest.getUri().getPath();
			var targetPath = functionPath;
			if (oFF.XStringUtils.isNotNullAndNotEmpty(sysPath))
			{
				targetPath = oFF.XPath.smartPathConcatenate(sysPath, targetPath, true);
			}
			if (oFF.XStringUtils.isNotNullAndNotEmpty(sysPrefix))
			{
				targetPath = oFF.XPath.smartPathConcatenate(sysPrefix, targetPath, true);
				httpRequest.setPrefix(null);
			}
			var rewrittenSapPath = this.prepareRequestForSapSessionPath(connection, rpcRequest, httpRequest, targetPath);
			httpRequest.setPath(rewrittenSapPath);
			httpRequest.setMethod(method);
			httpRequest.setAcceptContentType(rpcRequest.getAcceptContentType());
			httpRequest.setRequestType(requestType);
			var headerFields = httpRequest.getHeaderFieldsBase();
			var customHeaders = connection.getCustomHeaders();
			var headerIt = customHeaders.getKeysAsIteratorOfString();
			while (headerIt.hasNext())
			{
				var headerName = headerIt.next();
				headerFields.put(headerName, customHeaders.getByKey(headerName));
			}
			if (httpRequest.getSessionCarrierType() === oFF.SessionCarrierType.SAP_CONTEXT_ID_HEADER)
			{
				headerFields.put(oFF.HttpConstants.HD_SAP_CONTEXT_ID, connection.getSapSessionContext());
			}
			this.appendTracingInfo(systemDescription, rpcRequest, headerFields);
			var process = this.getProcess();
			var bufferCid = oFF.XStringBuffer.create();
			bufferCid.append(oFF.XLibVersionUtil.getLibVersion(process.getSession()));
			bufferCid.append("[AppSessionId:");
			bufferCid.append(process.getAppSessionId());
			bufferCid.append("]");
			if (oFF.XStringUtils.isNotNullAndNotEmpty(process.getAppSessionId()))
			{
				bufferCid.append("[ApplicationName:");
				bufferCid.append(process.getApplicationName());
				bufferCid.append("]");
			}
			bufferCid.append("[ProcessType:");
			bufferCid.append(process.getProcessType().getName());
			bufferCid.append("]");
			bufferCid.append("[ConnectId:");
			bufferCid.append(connection.getConnectionUid());
			bufferCid.append("]");
			if (oFF.notNull(requestType))
			{
				bufferCid.append("[RequestType:");
				bufferCid.append(requestType.getName());
				bufferCid.append("]");
			}
			headerFields.put(oFF.HttpConstants.HD_SAP_CLIENT_ID, bufferCid.toString());
			var reentranceTicket = connection.getReentranceTicket();
			if (oFF.notNull(reentranceTicket))
			{
				headerFields.put(oFF.HttpConstants.HD_MYSAPSSO2, reentranceTicket);
			}
			var systemType = systemDescription.getSystemType();
			if (systemType.isTypeOf(oFF.SystemType.HANA))
			{
				var oemApplicationId = systemDescription.getOemApplicationId();
				if (oFF.notNull(oemApplicationId))
				{
					httpRequest.getHeaderFieldsBase().putString(oFF.HttpConstants.HD_OEM_APPLICATION_ID, oemApplicationId);
				}
			}
			var tenantId = systemDescription.getTenantId();
			if (oFF.notNull(personalization))
			{
				httpRequest.setFromConnectionPersonalization(personalization);
				var personalTenantId = personalization.getTenantId();
				if (oFF.notNull(personalTenantId))
				{
					tenantId = personalTenantId;
				}
				var internalUser = personalization.getInternalUser();
				if (oFF.notNull(internalUser))
				{
					var userStructure = oFF.PrFactory.createStructure();
					userStructure.putString("userName", internalUser);
					userStructure.putString("LANGUAGE", personalization.getLanguage());
					headerFields.put(oFF.HttpConstants.HD_SAP_BOC_USER_PROPERTIES, userStructure.toString());
				}
				if (personalization.isXAuthorizationRequired())
				{
					httpRequest.setIsXAuthorizationRequired(personalization.isXAuthorizationRequired());
				}
			}
			if (oFF.notNull(tenantId))
			{
				httpRequest.addQueryElement("tenant", tenantId);
			}
			var parameters = this.prepareParameters(httpRequest);
			var keys = parameters.getKeysAsIteratorOfString();
			var key;
			while (keys.hasNext())
			{
				key = keys.next();
				httpRequest.addQueryElement(key, parameters.getByKey(key));
			}
			if (connection.useSessionUrlRewrite())
			{
				httpRequest.addQueryElement(oFF.HttpConstants.QP_PARAM_SESSION_VIA_URL, "X");
			}
			this.prepareRequestForCsrf(connection, rpcRequest, httpRequest);
			if (systemDescription.getSystemType() === oFF.SystemType.UNV || systemDescription.getSystemType() === oFF.SystemType.UQAS)
			{
				this.setBoeTokenHeader(connection, headerFields);
			}
			var requestStructure = rpcRequest.getRequestStructure();
			var serializedJsonString = oFF.PrUtils.serialize(requestStructure, true, false, 0);
			if (process.isSapStatisticsEnabled())
			{
				httpRequest.addQueryElement(oFF.RpcHttpFunction.REQUEST_PARAM_SAP_STATISTICS, "true");
			}
			this.handleTracing(systemDescription, httpRequest, parameters, requestStructure, serializedJsonString);
			if (method !== oFF.HttpRequestMethod.HTTP_GET)
			{
				var requestContentType = rpcRequest.getRequestContentType();
				httpRequest.setContentType(requestContentType);
				if (requestContentType === oFF.ContentType.APPLICATION_JSON)
				{
					httpRequest.setString(serializedJsonString);
				}
				else if (requestContentType === oFF.ContentType.APPLICATION_FORM)
				{
					var buffer = oFF.XStringBuffer.create();
					var hasElement = false;
					keys = parameters.getKeysAsIteratorOfString();
					while (keys.hasNext())
					{
						if (hasElement)
						{
							buffer.append("&");
						}
						key = keys.next();
						buffer.append(oFF.XHttpUtils.encodeURIComponent(key)).append("=").append(oFF.XHttpUtils.encodeURIComponent(parameters.getByKey(key)));
						hasElement = true;
					}
					httpRequest.setString(buffer.toString());
					oFF.XObjectExt.release(buffer);
				}
				else
				{
					throw oFF.XException.createIllegalStateException("Unsupported request content type");
				}
			}
			var cookiesMasterStore = connection.getConnectionPool().getCookiesMasterStore();
			httpRequest.setCookiesMasterStore(cookiesMasterStore);
			var processingHint = rpcRequest.getProcessingHint();
			if (needsContextId)
			{
				processingHint.putBoolean(oFF.ConnectionParameters.CACHE_HINT_LEAVE_THROUGH, true);
			}
			this.getSession().getHttpExchangeEnhancer().handleRequest(httpRequest, processingHint);
			if (oFF.RpcHttpFunction.DEBUG_MODE)
			{
				this.log(httpRequest.toString());
			}
			if (oFF.RpcHttpFunction.PRINT_REQUESTS && method === oFF.HttpRequestMethod.HTTP_POST)
			{
				this.printExchangeDebugInfo(httpRequest);
			}
			if (oFF.RpcHttpFunction.TEST_MODE)
			{
				oFF.RpcHttpFunction.TEST_MODE_LAST_REQUEST = httpRequest;
			}
			if (rpcRequest.getRequestType() === oFF.HttpSemanticRequestType.PREFLIGHT)
			{
				var preflightUrl = systemDescription.getPreflightUrl();
				if (oFF.XStringUtils.isNotNullAndNotEmpty(preflightUrl))
				{
					httpRequest.setPrefix(null);
				}
			}
			var tmpClient;
			var cachingMode = connection.getCachingMode();
			if (cachingMode === oFF.HttpCachingMode.L3_LIVE_NO_CACHE)
			{
				tmpClient = httpRequest.newHttpClient(process);
			}
			else
			{
				tmpClient = oFF.HttpCacheClient.createDynamicCacheClient(process, cache, httpRequest, cachingMode);
			}
			this.m_httpClient = tmpClient;
			this.logBuffer(oFF.OriginLayer.IOLAYER, oFF.Severity.DEBUG, 0).append("doRpcHttpConnect URL: ").append(httpRequest.getUrlExt(true, true, true, false, true, true, true, true, false)).flush();
			var httpRequestIdentifier = bwSessionRequest ? oFF.RpcHttpFunction.BW_SESSION_REQUEST : "";
			var identifier = oFF.XNameGenericPair.create(httpRequestIdentifier, httpRequest);
			var httpRequestAction = tmpClient.processHttpRequest(this.getActiveSyncType(), this, identifier);
			this.setSyncChild(httpRequestAction);
			this.connectionCounter++;
			if (bwSessionRequest)
			{
				connection.setSessionRequestSyncAction(httpRequestAction);
			}
		}
	}
};
oFF.RpcHttpFunction.prototype.appendTracingInfo = function(systemDescription, rpcRequest, headerFields)
{
	if (systemDescription.isCorrelationIdActive())
	{
		headerFields.put(oFF.HttpConstants.HD_X_CORRELATION_ID, oFF.XGuid.getGuid());
	}
	var sapPassportActive = systemDescription.isSapPassportActive();
	if (!sapPassportActive)
	{
		sapPassportActive = this.getSession().getEnvironment().getBooleanByKeyExt(oFF.ConnectionParameters.SAP_PASSPORT_ACTIVE, false);
	}
	if (sapPassportActive === true)
	{
		var passport = this.getSession().getDsrPassport();
		passport = oFF.DsrPassport.createDsrPassportAsCopy(passport);
		passport.setAction(rpcRequest.getUri().toString());
		passport.setConnectionId(rpcRequest.getSapPassportConnectionId());
		passport.setPrevSystemId("RpcHttpFunction");
		passport.setConnectionCounter(this.connectionCounter);
		var client = systemDescription.getClient();
		if (oFF.notNull(client))
		{
			passport.setClientNumber(client);
		}
		var transactionId = rpcRequest.getSapPassportTransactionId();
		if (oFF.isNull(transactionId))
		{
			transactionId = this.getSession().getAppSessionId();
		}
		var convertedTransId = oFF.DsrConvert.byteArrayToHex(oFF.XByteArray.convertFromString(oFF.XString.replace(transactionId, "-", "")));
		passport.setTransId(convertedTransId);
		var netPassport = passport.getNetPassport();
		var convertedPassport = oFF.DsrConvert.byteArrayToHex(netPassport);
		headerFields.put(oFF.HttpConstants.HD_SAP_PASSPORT, convertedPassport);
	}
};
oFF.RpcHttpFunction.prototype.handleTracing = function(systemDescription, httpRequest, parameters, requestStructure, serializedJsonString)
{
	var traceType = this.getTraceType();
	var traceInfo = this.getRpcRequest().getTraceInfo();
	if (traceType === oFF.TraceType.JSON)
	{
		var protocolTrace = requestStructure.putNewStructure("ProtocolTrace");
		var traceName = traceInfo.getTraceName();
		if (oFF.XStringUtils.isNotNullAndNotEmpty(traceName))
		{
			protocolTrace.putString("Name", traceName);
		}
		protocolTrace.putInteger("Index", traceInfo.getTraceIndex());
	}
	else if (traceType === oFF.TraceType.BW_CATT)
	{
		httpRequest.addQueryElement(oFF.RpcHttpFunction.REQUEST_PARAM_SERVER_TRACE_FLAG, "C");
	}
	else if (traceType === oFF.TraceType.BW_STD)
	{
		httpRequest.addQueryElement(oFF.RpcHttpFunction.REQUEST_PARAM_SERVER_TRACE_FLAG, "X");
	}
	if (traceType === oFF.TraceType.FILE)
	{
		if (httpRequest.getMethod() === oFF.HttpRequestMethod.HTTP_POST)
		{
			var traceUrl = traceInfo.getTraceFolderInternal();
			if (oFF.isNull(traceUrl))
			{
				var traceFolderPath = traceInfo.getTraceFolderPath();
				var tracingFolderFile = oFF.XFile.create(this.getProcess(), traceFolderPath);
				if (tracingFolderFile.isExisting() && tracingFolderFile.isDirectory())
				{
					traceUrl = tracingFolderFile.getUrl();
					traceInfo.setTraceFolderInternal(traceUrl);
				}
			}
			if (oFF.notNull(traceUrl))
			{
				this.saveTraceFile(traceUrl, systemDescription, parameters, serializedJsonString);
			}
		}
	}
	if (traceType !== oFF.TraceType.NONE)
	{
		traceInfo.incrementTraceIndex();
	}
};
oFF.RpcHttpFunction.prototype.setBoeTokenHeader = function(connection, headerFields)
{
	var token = connection.getBoeSessionToken();
	if (oFF.isNull(token))
	{
		if (this.getRpcRequest().getMethod() === oFF.HttpRequestMethod.HTTP_GET && !connection.isLogoffSent())
		{
			headerFields.put(oFF.HttpConstants.HD_BOE_SESSION_TOKEN, oFF.HttpConstants.VA_BOE_SESSION_TOKEN_FETCH);
		}
	}
	else
	{
		headerFields.put(oFF.HttpConstants.HD_BOE_SESSION_TOKEN, token);
	}
};
oFF.RpcHttpFunction.prototype.saveTraceFile = function(traceUrl, systemDescription, parameters, serializedJsonString)
{
	var path = oFF.XStringBuffer.create();
	path.append(traceUrl);
	path.append("/").append(systemDescription.getHost());
	path.append("/").appendInt(systemDescription.getPort());
	var appName = parameters.getByKey(oFF.RpcRequestConstants.REQUEST_PARAM_TRACE_NAME);
	if (oFF.notNull(appName))
	{
		path.append("/").append(appName);
	}
	var tracePath = path.toString();
	var traceFolder = oFF.XFile.create(this.getProcess(), tracePath);
	if (!traceFolder.isExisting())
	{
		traceFolder.mkdirs();
	}
	path.append("/");
	var appReqIndex = parameters.getByKey(oFF.RpcRequestConstants.REQUEST_PARAM_TRACE_REQ_INDEX);
	if (oFF.notNull(appReqIndex))
	{
		var sizeReqIndex = oFF.XString.size(appReqIndex);
		if (sizeReqIndex === 1)
		{
			path.append("00");
		}
		else if (sizeReqIndex === 2)
		{
			path.append("0");
		}
		path.append(appReqIndex);
	}
	var temp = path.toString();
	path.append("_req.json");
	var traceFilePath = path.toString();
	oFF.XObjectExt.release(path);
	var traceFile = oFF.XFile.create(this.getProcess(), traceFilePath);
	if (traceFile.isExisting())
	{
		traceFile.deleteFile();
	}
	var traceResponseFilePath = oFF.XStringUtils.concatenate2(temp, "_res.json");
	this.m_traceResponseFile = oFF.XFile.create(this.getProcess(), traceResponseFilePath);
	if (this.m_traceResponseFile.isExisting())
	{
		this.m_traceResponseFile.deleteFile();
	}
	if (oFF.notNull(serializedJsonString))
	{
		var byteArray = oFF.XByteArray.convertFromStringWithCharset(serializedJsonString, oFF.XCharset.UTF8);
		traceFile.saveByteArray(byteArray);
	}
};
oFF.RpcHttpFunction.prototype.prepareParameters = function(httpRequest)
{
	var parameters = oFF.XProperties.createByMapCopy(this.m_rpcRequest.getAdditionalParameters());
	var systemDescription = this.getActionContext().getSystemDescription();
	var language = systemDescription.getLanguage();
	if (oFF.XStringUtils.isNullOrEmpty(language))
	{
		var userProfile = this.getProcess().getUserProfile();
		if (oFF.notNull(userProfile))
		{
			language = userProfile.getDataAccessLanguage();
		}
	}
	httpRequest.setLanguage(language);
	var systemType = systemDescription.getSystemType();
	if (systemType.isTypeOf(oFF.SystemType.ABAP))
	{
		parameters.putString(oFF.ConnectionConstants.SAP_CLIENT, systemDescription.getClient());
		if (oFF.notNull(language) && oFF.XString.size(language) > 0)
		{
			parameters.putString(oFF.ConnectionConstants.SAP_LANGUAGE, language);
		}
	}
	var traceType = this.getTraceType();
	if (traceType !== oFF.TraceType.NONE)
	{
		var traceInfo = this.getRpcRequest().getTraceInfo();
		var traceName = traceInfo.getTraceName();
		if (oFF.XStringUtils.isNotNullAndNotEmpty(traceName))
		{
			traceName = oFF.XString.replace(traceName, ":", ".");
			parameters.put(oFF.RpcRequestConstants.REQUEST_PARAM_TRACE_NAME, traceName);
			var index = oFF.XInteger.convertToString(traceInfo.getTraceIndex());
			parameters.put(oFF.RpcRequestConstants.REQUEST_PARAM_TRACE_REQ_INDEX, index);
			var tracePath = traceInfo.getTraceFolderPath();
			if (oFF.XStringUtils.isNotNullAndNotEmpty(tracePath))
			{
				parameters.put(oFF.RpcRequestConstants.REQUEST_PARAM_TRACE_PATH, tracePath);
			}
		}
	}
	var queryElements = this.m_rpcRequest.getUri().getQueryElements();
	if (oFF.notNull(queryElements))
	{
		for (var i = 0; i < queryElements.size(); i++)
		{
			var nameValuePair = queryElements.get(i);
			parameters.put(nameValuePair.getName(), nameValuePair.getValue());
		}
	}
	return parameters;
};
oFF.RpcHttpFunction.prototype.onHttpResponse = function(extResult, response, customIdentifier)
{
	var process = this.getProcess();
	var identifier = customIdentifier;
	var httpRequest = identifier.getObject();
	var connection = this.getActionContext();
	if (oFF.isNull(connection) || connection.isReleased())
	{
		this.addErrorExt(oFF.OriginLayer.PROTOCOL, oFF.ErrorCodes.SYSTEM_IO_HTTP, "Connection is already released", null);
		this.endSync();
	}
	else if (oFF.isNull(response))
	{
		this.clearMessages();
		this.addAllMessages(extResult);
		this.addErrorExt(oFF.OriginLayer.PROTOCOL, oFF.ErrorCodes.SYSTEM_IO_HTTP, "No response object given", null);
		this.endSync();
	}
	else if (response.isGoLiveRequired() === true && connection.getCachingMode() === oFF.HttpCachingMode.L1_INITIAL)
	{
		connection.setCachingMode(oFF.HttpCachingMode.L2_DYNAMIC);
		connection.setSessionContextId(null);
		connection.setCsrfToken(null);
		connection.setCsrfRequiredCount(0);
		this.clearMessages();
		this.doRpcHttpProcessing();
	}
	else
	{
		if (oFF.XString.isEqual(identifier.getName(), oFF.RpcHttpFunction.BW_RPC_FUNCTION_REF))
		{
			var waitingRpcFunction = identifier.getObject();
			waitingRpcFunction.getFirstObject().processWithPersonalisation(waitingRpcFunction.getSecondObject());
		}
		else
		{
			this.m_response = response;
			if (oFF.XString.isEqual(oFF.RpcHttpFunction.BW_SESSION_REQUEST, identifier.getName()))
			{
				connection.setSessionRequestSyncAction(null);
			}
			process.getHttpExchangeEnhancer().handleResponse(response);
			this.handleStatusCode(httpRequest, response, extResult);
			this.handleJson(response);
			this.handleTracingFoeResponse(response);
			this.handleSessionUrlRewrite(response);
			this.handleBoeSessionToken(httpRequest, response);
			this.handleCorrelationId(response);
			if (this.getRpcRequest().isFireAndForgetCall())
			{
				this.setData(this.m_rpcResponse);
				this.endSync();
			}
			else
			{
				var continueProcessing = true;
				continueProcessing = this.handleResponseForCsrf(connection, httpRequest, response);
				if (continueProcessing)
				{
					var credentialsProvider = process.getCredentialsProvider();
					var newAuthenticationType = this.getNewAuthenticationType(httpRequest, response);
					if (oFF.notNull(newAuthenticationType))
					{
						this.m_credentialsCallCounter = this.m_credentialsCallCounter + 1;
						this.handleProcessGetCredentials(null, newAuthenticationType);
					}
					else
					{
						var isValidContentType = !(connection.getSystemDescription().getAuthenticationType().isEqualTo(oFF.AuthenticationType.BASIC) && this.m_response.getContentType().isTypeOf(oFF.ContentType.TEXT_OR_HTML));
						var isValid = this.isValid() && isValidContentType;
						if (!isValid && credentialsProvider.supportsOnErrorHandling())
						{
							this.m_credentialsCallCounter = this.m_credentialsCallCounter + 1;
							this.handleProcessGetCredentials(response, null);
						}
						else
						{
							if (isValid)
							{
								credentialsProvider.notifyCredentialsSuccess(connection);
							}
							this.setData(this.m_rpcResponse);
							this.endSync();
						}
					}
				}
			}
		}
	}
};
oFF.RpcHttpFunction.prototype.handleCorrelationId = function(response)
{
	var headerFields = response.getHeaderFields();
	var correlationId = headerFields.getStringByKey(oFF.HttpConstants.HD_X_CORRELATION_ID);
	if (oFF.XStringUtils.isNullOrEmpty(correlationId))
	{
		correlationId = response.getHttpRequest().getHeaderFields().getStringByKey(oFF.HttpConstants.HD_X_CORRELATION_ID);
	}
	if (oFF.XStringUtils.isNotNullAndNotEmpty(correlationId))
	{
		this.addMessage(oFF.XMessage.createMessage(oFF.OriginLayer.IOLAYER, oFF.Severity.DEBUG, oFF.MessageCodes.CORRELATION_ID_CODE, correlationId, null, false, null));
	}
};
oFF.RpcHttpFunction.prototype.getNewAuthenticationType = function(request, response)
{
	var result = null;
	if (oFF.notNull(request) && oFF.notNull(response))
	{
		if (response.getStatusCode() === oFF.HttpStatusCode.SC_UNAUTHORIZED)
		{
			var authenticate = response.getHeaderFields().getStringByKey(oFF.HttpConstants.HD_WWW_AUTHENTICATE);
			if (oFF.XStringUtils.isNotNullAndNotEmpty(authenticate))
			{
				if (oFF.XString.startsWith(authenticate, oFF.HttpConstants.VA_AUTHORIZATION_BASIC))
				{
					if (request.getAuthenticationType() !== oFF.AuthenticationType.BASIC)
					{
						result = oFF.AuthenticationType.BASIC;
					}
				}
			}
		}
	}
	return result;
};
oFF.RpcHttpFunction.prototype.handleTracingFoeResponse = function(response)
{
	var traceType = this.getTraceType();
	if (traceType === oFF.TraceType.FILE && oFF.notNull(this.m_traceResponseFile))
	{
		var jsonContent = response.getJsonContent();
		if (oFF.notNull(jsonContent))
		{
			var json = jsonContent.toString();
			var byteArray = oFF.XByteArray.convertFromStringWithCharset(json, oFF.XCharset.UTF8);
			this.m_traceResponseFile.saveByteArray(byteArray);
		}
	}
};
oFF.RpcHttpFunction.prototype.handleJson = function(response)
{
	var jsonObject = response.getJsonContent();
	var stringContent = response.getStringContentExt(oFF.isNull(jsonObject), -1);
	this.getRpcResponse().setRootElement(jsonObject, stringContent);
};
oFF.RpcHttpFunction.prototype.handleSessionUrlRewrite = function(response)
{
	var connection = this.getActionContext();
	if (connection.useSessionUrlRewrite() === true)
	{
		var headerFields = response.getHeaderFields();
		var sessionUrlRewrite = headerFields.getStringByKey(oFF.HttpConstants.HD_SAP_URL_SESSION_ID);
		if (oFF.notNull(sessionUrlRewrite))
		{
			connection.setSessionUrlRewrite(sessionUrlRewrite);
		}
		else if (this.m_sessionRequested && !response.getHttpRequest().isLogoff())
		{
			this.logBuffer(oFF.OriginLayer.IOLAYER, oFF.Severity.WARNING, 0).append("New BW SessionId was requested, but the Response doesn't contain Header:").append(oFF.HttpConstants.HD_SAP_URL_SESSION_ID).append(". Url: ").append(response.getHttpRequest().getUrlExt(true, true, false, false, false, true, true, true, false)).flush();
		}
	}
};
oFF.RpcHttpFunction.prototype.handleBoeSessionToken = function(request, response)
{
	var connection = this.getActionContext();
	var systemDescription = connection.getSystemDescription();
	var systemType = systemDescription.getSystemType();
	if (systemType === oFF.SystemType.UNV || systemType === oFF.SystemType.UQAS)
	{
		var headerFields = response.getHeaderFields();
		var boeSessionToken = headerFields.getStringByKey(oFF.HttpConstants.HD_BOE_SESSION_TOKEN);
		if (oFF.notNull(boeSessionToken))
		{
			var serverStatusCode = this.getServerStatusCode();
			var isGetRequest = request.getMethod() === oFF.HttpRequestMethod.HTTP_GET;
			if (isGetRequest && serverStatusCode === oFF.HttpStatusCode.SC_OK)
			{
				connection.setBoeSessionToken(boeSessionToken);
			}
		}
	}
};
oFF.RpcHttpFunction.prototype.handleStatusCode = function(request, response, messages)
{
	this.clearMessages();
	this.addAllMessages(messages);
	var severity = oFF.Severity.DEBUG;
	var statusCode = response.getStatusCode();
	var statusDetails = response.getStatusCodeDetails();
	if (oFF.isNull(statusDetails))
	{
		statusDetails = oFF.XStringBuffer.create().append("Http Status Code: ").appendInt(response.getStatusCode()).toString();
	}
	this.setServerStatusCode(statusCode);
	this.setServerStatusDetails(statusDetails);
	if (messages.hasErrors() || oFF.HttpStatusCode.isError(statusCode))
	{
		severity = oFF.Severity.ERROR;
		var errorBuffer = oFF.XStringBuffer.create();
		if (oFF.XStringUtils.isNotNullAndNotEmpty(statusDetails))
		{
			errorBuffer.appendLine(statusDetails);
		}
		if (statusCode === oFF.HttpStatusCode.SC_NOT_FOUND)
		{
			errorBuffer.append("Path: ").appendLine(response.getHttpRequest().getPath());
			errorBuffer.append("Request: ").append(response.getHttpRequest().getString());
		}
		if (response.isStringContentSet())
		{
			var errorStringContent = response.getString();
			if (oFF.XStringUtils.isNotNullAndNotEmpty(errorStringContent))
			{
				if (oFF.XStringUtils.isNullOrEmpty(statusDetails) || !oFF.XString.containsString(statusDetails, errorStringContent))
				{
					errorBuffer.appendLine(errorStringContent);
				}
			}
		}
		this.addErrorExt(oFF.OriginLayer.PROTOCOL, statusCode, errorBuffer.toString(), null);
		oFF.XObjectExt.release(errorBuffer);
	}
	var url = request.getUrlWithoutAuthentication();
	this.logBuffer(oFF.OriginLayer.IOLAYER, severity, 0).append("onHttpResponse: URL:").append(url).appendNewLine().append("Http Status: ").appendInt(statusCode).append(" ").append(statusDetails).append(messages.getSummary()).flush();
	if (oFF.RpcHttpFunction.DEBUG_MODE)
	{
		this.printResponseDebugInfo(response);
	}
	if (oFF.RpcHttpFunction.PRINT_RESPONSES)
	{
		this.printExchangeDebugInfo(response);
	}
};
oFF.RpcHttpFunction.prototype.onServerMetadataLoaded = function(extResult, serverMetadata, customIdentifier)
{
	this.clearMessages();
	this.doRpcHttpProcessing();
};
oFF.RpcHttpFunction.prototype.printResponseDebugInfo = function(response) {};
oFF.RpcHttpFunction.prototype.printExchangeDebugInfo = function(httpExchange) {};
oFF.RpcHttpFunction.prototype.getProcess = function()
{
	return this.getSession();
};
oFF.RpcHttpFunction.prototype.prepareRequestForSapSessionPath = function(connection, rpcRequest, httpRequest, relativeUriPath)
{
	var result = relativeUriPath;
	if (rpcRequest.useStaticUrl() === false && (httpRequest.getSessionCarrierType() === oFF.SessionCarrierType.SAP_URL_REWRITING || httpRequest.isLogoff()))
	{
		var sessionUrlRewrite = connection.getSessionUrlRewrite();
		if (oFF.XStringUtils.isNotNullAndNotEmpty(sessionUrlRewrite))
		{
			var index = oFF.XString.indexOf(relativeUriPath, "/sap/");
			if (index !== -1)
			{
				var pathStart = oFF.XString.substring(relativeUriPath, 0, index + 4);
				var pathEnd = oFF.XString.substring(relativeUriPath, index + 4, -1);
				result = oFF.XStringUtils.concatenate3(pathStart, sessionUrlRewrite, pathEnd);
			}
		}
	}
	return result;
};
oFF.RpcHttpFunction.prototype.prepareRequestForCsrf = function(connection, rpcRequest, httpRequest)
{
	var csrfToken = connection.getCsrfToken();
	if (httpRequest.getMethod() === oFF.HttpRequestMethod.HTTP_GET)
	{
		var semanticRequestType = httpRequest.getRequestType();
		if (semanticRequestType === oFF.HttpSemanticRequestType.CHECK_CONNECTION || semanticRequestType === oFF.HttpSemanticRequestType.KEEP_ALIVE || semanticRequestType === oFF.HttpSemanticRequestType.SESSION_REQUEST)
		{
			csrfToken = oFF.HttpConstants.VA_CSRF_FETCH;
		}
		else if (semanticRequestType === oFF.HttpSemanticRequestType.CSRF_UPDATE)
		{
			csrfToken = oFF.HttpConstants.VA_CSRF_FETCH;
		}
		else if (oFF.isNull(csrfToken))
		{
			if (!connection.isLogoffSent())
			{
				csrfToken = oFF.HttpConstants.VA_CSRF_FETCH;
			}
		}
	}
	if (oFF.notNull(csrfToken))
	{
		var requestHeaderFields = httpRequest.getHeaderFieldsBase();
		requestHeaderFields.put(oFF.HttpConstants.HD_CSRF_TOKEN, csrfToken);
	}
};
oFF.RpcHttpFunction.prototype.handleResponseForCsrf = function(connection, httpRequest, httpResponse)
{
	var continueProcessing = true;
	var requestHeaderFields = httpRequest.getHeaderFields();
	var responseHeaderFields = httpResponse.getHeaderFields();
	var csrfToken = responseHeaderFields.getStringByKey(oFF.HttpConstants.HD_CSRF_TOKEN);
	if (oFF.isNull(csrfToken))
	{
		csrfToken = responseHeaderFields.getStringByKey(oFF.XString.toLowerCase(oFF.HttpConstants.HD_CSRF_TOKEN));
	}
	if (httpRequest.getMethod() === oFF.HttpRequestMethod.HTTP_GET)
	{
		var serverStatusCode = this.getServerStatusCode();
		if (oFF.HttpStatusCode.isOk(serverStatusCode))
		{
			var hasCsrfFetchRequest = oFF.XString.isEqual(requestHeaderFields.getStringByKey(oFF.HttpConstants.HD_CSRF_TOKEN), oFF.HttpConstants.VA_CSRF_FETCH);
			if (hasCsrfFetchRequest && (httpRequest.getRequestType() === oFF.HttpSemanticRequestType.CSRF_UPDATE || connection.getCsrfToken() === null))
			{
				connection.incCsrfRequiredCount();
			}
			if (oFF.notNull(csrfToken))
			{
				connection.setCsrfToken(csrfToken);
			}
		}
	}
	else
	{
		var isCsrfTokenRequired = false;
		if (oFF.notNull(csrfToken))
		{
			isCsrfTokenRequired = oFF.XString.isEqual(oFF.HttpConstants.VA_CSRF_REQUIRED, csrfToken);
		}
		if (isCsrfTokenRequired)
		{
			this.addErrorExt(oFF.OriginLayer.PROTOCOL, oFF.ErrorCodes.INVALID_STATE, "Cannot fetch csrf token from server", null);
			var isServerMetadataCall = false;
			var semanticRequestType = httpRequest.getRequestType();
			if (oFF.notNull(semanticRequestType))
			{
				isServerMetadataCall = semanticRequestType.isTypeOf(oFF.HttpSemanticRequestType.ABSTRACT_SERVER_GET);
			}
			if (connection.getCsrfRequiredCount() < 2 && isServerMetadataCall === false)
			{
				continueProcessing = false;
				var synchronizationType = this.getActiveSyncType();
				connection.getServerMetadataExt(synchronizationType, this, null, oFF.HttpSemanticRequestType.CSRF_UPDATE);
			}
			else
			{
				connection.setCsrfRequiredCount(0);
				connection.setCsrfToken(null);
				if (this.getSession().hasFeature(oFF.FeatureToggleOlap.SHARED_CSRF_TOKENS))
				{
					connection.getSystemConnect().setCsrfToken(null);
				}
			}
		}
		else
		{
			connection.setCsrfRequiredCount(1);
		}
	}
	return continueProcessing;
};

oFF.StandaloneSystemLandscape = function() {};
oFF.StandaloneSystemLandscape.prototype = new oFF.DfProcessContext();
oFF.StandaloneSystemLandscape.prototype._ff_c = "StandaloneSystemLandscape";

oFF.StandaloneSystemLandscape.s_masterSystemDescription = null;
oFF.StandaloneSystemLandscape.getStaticMasterSystemDescription = function()
{
	return oFF.StandaloneSystemLandscape.s_masterSystemDescription;
};
oFF.StandaloneSystemLandscape.setStaticMasterSystemDescription = function(masterSystem)
{
	oFF.StandaloneSystemLandscape.s_masterSystemDescription = masterSystem;
};
oFF.StandaloneSystemLandscape.create = function(sessionContext)
{
	var landscape = new oFF.StandaloneSystemLandscape();
	var process = null;
	if (oFF.notNull(sessionContext))
	{
		process = sessionContext.getProcess();
	}
	landscape.setupLandscape(process);
	return landscape;
};
oFF.StandaloneSystemLandscape.prototype.m_roleMap = null;
oFF.StandaloneSystemLandscape.prototype.m_systemMap = null;
oFF.StandaloneSystemLandscape.prototype.setupLandscape = function(process)
{
	this.setupProcessContext(process);
	this.m_systemMap = oFF.XHashMapByString.create();
	this.m_roleMap = oFF.XHashMapOfStringByString.create();
	if (oFF.notNull(oFF.StandaloneSystemLandscape.s_masterSystemDescription))
	{
		var properties = oFF.XProperties.createByMapCopy(oFF.StandaloneSystemLandscape.s_masterSystemDescription.getProperties());
		this.setSystem(oFF.StandaloneSystemLandscape.s_masterSystemDescription.getSystemName(), properties);
		this.setMasterSystemName(oFF.StandaloneSystemLandscape.s_masterSystemDescription.getSystemName());
	}
};
oFF.StandaloneSystemLandscape.prototype.releaseObject = function()
{
	this.m_systemMap = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_systemMap);
	oFF.DfProcessContext.prototype.releaseObject.call( this );
};
oFF.StandaloneSystemLandscape.prototype.getComponentType = function()
{
	return oFF.KernelComponentType.SYSTEM_LANDSCAPE;
};
oFF.StandaloneSystemLandscape.prototype.getApplication = oFF.noSupport;
oFF.StandaloneSystemLandscape.prototype.getChildElements = function()
{
	return oFF.XReadOnlyListWrapper.create(this.m_systemMap.getValuesAsReadOnlyList());
};
oFF.StandaloneSystemLandscape.prototype.clearSystems = function()
{
	this.m_systemMap.clear();
};
oFF.StandaloneSystemLandscape.prototype.createSystem = function()
{
	return oFF.SystemDescription.createExt(this.getSession(), this, null, null);
};
oFF.StandaloneSystemLandscape.prototype.existsSystemName = function(name)
{
	return this.m_systemMap.containsKey(name);
};
oFF.StandaloneSystemLandscape.prototype.getSystemDescription = function(name)
{
	if (oFF.isNull(name))
	{
		return this.getMasterSystem();
	}
	return this.m_systemMap.getByKey(name);
};
oFF.StandaloneSystemLandscape.prototype.getSystemNames = function()
{
	var systemNames = oFF.XListOfString.createFromReadOnlyList(this.m_systemMap.getKeysAsReadOnlyListOfString());
	systemNames.sortByDirection(oFF.XSortDirection.ASCENDING);
	return systemNames;
};
oFF.StandaloneSystemLandscape.prototype.removeSystem = function(name)
{
	this.m_systemMap.remove(name);
};
oFF.StandaloneSystemLandscape.prototype.setSystemByUri = function(name, uri, systemType)
{
	var systemDesc = oFF.SystemDescription.createExt(this.getSession(), this, name, null);
	this.setSystemByDescription(systemDesc);
	systemDesc.setAuthenticationType(uri.getAuthenticationType());
	if (uri.getUser() !== null)
	{
		systemDesc.setUser(uri.getUser());
		systemDesc.setPassword(uri.getPassword());
	}
	systemDesc.setHost(uri.getHost());
	systemDesc.setPort(uri.getPort());
	systemDesc.setProtocolType(oFF.ProtocolType.lookup(uri.getScheme()));
	systemDesc.setPath(uri.getPath());
	var queryElements = uri.getQueryElements();
	if (oFF.notNull(queryElements))
	{
		for (var i = 0; i < queryElements.size(); i++)
		{
			var queryElement = queryElements.get(i);
			var key = oFF.XString.toUpperCase(queryElement.getName());
			var value = queryElement.getValue();
			if (oFF.XString.isEqual(oFF.ConnectionParameters.TAGS, key))
			{
				systemDesc.setTags(value);
			}
			else if (oFF.XString.isEqual(oFF.ConnectionParameters.SYSTEM_TYPE, key) || oFF.XString.isEqual(oFF.ConnectionParameters.SYSTYPE, key))
			{
				value = oFF.XString.toUpperCase(value);
				systemDesc.setSystemType(oFF.SystemType.lookup(value));
			}
			else if (oFF.XString.isEqual(oFF.ConnectionParameters.LANGUAGE, key))
			{
				value = oFF.XString.toUpperCase(value);
				systemDesc.setLanguage(value);
			}
			else if (oFF.XString.isEqual(oFF.ConnectionParameters.TOKEN_VALUE, key))
			{
				systemDesc.setAccessToken(value);
			}
			else if (oFF.XString.isEqual(oFF.ConnectionParameters.AUTHENTICATION_TYPE, key))
			{
				var authtype = oFF.XString.toUpperCase(value);
				var lookup = oFF.AuthenticationType.lookup(authtype);
				systemDesc.setAuthenticationType(lookup);
			}
		}
	}
	if (oFF.notNull(systemType))
	{
		systemDesc.setSystemType(systemType);
	}
	return systemDesc;
};
oFF.StandaloneSystemLandscape.prototype.setSystem = function(name, properties)
{
	var systemDesc = oFF.SystemDescription.createExt(this.getSession(), this, name, properties);
	this.setSystemByDescription(systemDesc);
	return systemDesc;
};
oFF.StandaloneSystemLandscape.prototype.setSystemByDescription = function(systemDescription)
{
	var systemName = systemDescription.getSystemName();
	if (oFF.isNull(systemName))
	{
		systemName = systemDescription.getName();
		if (oFF.isNull(systemName))
		{
			throw oFF.XException.createIllegalArgumentException("NULL not allowed: systemDescription.getName() or .getSystemName() must not be NULL.");
		}
	}
	this.m_systemMap.put(systemName, systemDescription);
};
oFF.StandaloneSystemLandscape.prototype.getMasterSystemName = function()
{
	return this.getDefaultSystemName(oFF.SystemRole.MASTER);
};
oFF.StandaloneSystemLandscape.prototype.setMasterSystemName = function(name)
{
	this.setDefaultSystemName(oFF.SystemRole.MASTER, name);
};
oFF.StandaloneSystemLandscape.prototype.getMasterSystem = function()
{
	var masterSystemName = this.getDefaultSystemName(oFF.SystemRole.MASTER);
	return this.m_systemMap.getByKey(masterSystemName);
};
oFF.StandaloneSystemLandscape.prototype.getDefaultSystemName = function(systemRole)
{
	return this.m_roleMap.getByKey(systemRole.getName());
};
oFF.StandaloneSystemLandscape.prototype.setDefaultSystemName = function(systemRole, name)
{
	this.m_roleMap.put(systemRole.getName(), name);
};
oFF.StandaloneSystemLandscape.prototype.getDefaultSystem = function(systemRole)
{
	var name = this.m_roleMap.getByKey(systemRole.getName());
	return this.getSystemDescription(name);
};
oFF.StandaloneSystemLandscape.prototype.getSystemsByRole = function(role)
{
	var systems = oFF.XList.create();
	var iterator = this.m_systemMap.getIterator();
	while (iterator.hasNext())
	{
		var systemDescription = iterator.next();
		if (oFF.isNull(role))
		{
			systems.add(systemDescription);
		}
		else
		{
			var sysRoles = systemDescription.getRoles();
			if (sysRoles.contains(role))
			{
				systems.add(systemDescription);
			}
		}
	}
	oFF.XObjectExt.release(iterator);
	return systems;
};
oFF.StandaloneSystemLandscape.prototype.hasChildren = function()
{
	return this.m_systemMap.size() > 0;
};
oFF.StandaloneSystemLandscape.prototype.getChildSetState = function()
{
	return oFF.ChildSetState.COMPLETE;
};
oFF.StandaloneSystemLandscape.prototype.getName = function()
{
	return "SystemLandscape";
};
oFF.StandaloneSystemLandscape.prototype.getText = function()
{
	return "System Landscape";
};
oFF.StandaloneSystemLandscape.prototype.isNode = function()
{
	return true;
};
oFF.StandaloneSystemLandscape.prototype.isLeaf = function()
{
	return false;
};
oFF.StandaloneSystemLandscape.prototype.getTagValue = function(tagName)
{
	return null;
};
oFF.StandaloneSystemLandscape.prototype.processChildFetch = oFF.noSupport;
oFF.StandaloneSystemLandscape.prototype.getContentElement = function()
{
	return this;
};
oFF.StandaloneSystemLandscape.prototype.getContentConstant = function()
{
	return null;
};
oFF.StandaloneSystemLandscape.prototype.replaceOriginsWithMirror = function()
{
	var systems = this.m_systemMap.getValuesAsReadOnlyList();
	var mirrors = oFF.XListOfString.create();
	for (var i = 0; i < systems.size(); i++)
	{
		var system = systems.get(i);
		var origin = system.getProperties().getStringByKey(oFF.ConnectionParameters.ORIGIN);
		if (oFF.notNull(origin))
		{
			mirrors.add(system.getSystemName());
		}
	}
	for (var k = 0; k < mirrors.size(); k++)
	{
		var mirrorName = mirrors.get(k);
		var mirrorSystem = this.m_systemMap.getByKey(mirrorName);
		var originName = mirrorSystem.getProperties().getStringByKey(oFF.ConnectionParameters.ORIGIN);
		var originSystem = this.m_systemMap.getByKey(originName);
		if (oFF.notNull(originSystem))
		{
			this.m_systemMap.remove(mirrorName);
			this.m_systemMap.remove(originName);
			var mirrorBase = mirrorSystem;
			mirrorBase.setName(originName);
			this.m_systemMap.put(originName, mirrorBase);
		}
	}
};
oFF.StandaloneSystemLandscape.prototype.enforceUseSecure = function()
{
	var useSecure = false;
	var session = this.getSession();
	if (oFF.notNull(session))
	{
		useSecure = session.getEnvironment().getBooleanByKeyExt(oFF.XEnvironmentConstants.FIREFLY_SECURE, false);
	}
	return useSecure;
};
oFF.StandaloneSystemLandscape.prototype.toString = function()
{
	var sb = oFF.XStringBuffer.create();
	sb.appendLine("System landscape");
	if (oFF.XCollectionUtils.hasElements(this.m_systemMap))
	{
		var systemNameIterator = this.m_systemMap.getKeysAsIteratorOfString();
		while (systemNameIterator.hasNext())
		{
			var systemName = systemNameIterator.next();
			var systemDescription = this.m_systemMap.getByKey(systemName);
			if (oFF.isNull(systemDescription))
			{
				continue;
			}
			sb.appendNewLine();
			sb.append(systemDescription.toString());
		}
	}
	return sb.toString();
};

oFF.SystemLandscapeLoadAction = function() {};
oFF.SystemLandscapeLoadAction.prototype = new oFF.SyncActionExt();
oFF.SystemLandscapeLoadAction.prototype._ff_c = "SystemLandscapeLoadAction";

oFF.SystemLandscapeLoadAction.createAndRun = function(syncType, listener, customIdentifier, sessionContext, systemLandscape, connectionPool, uri)
{
	return oFF.SystemLandscapeLoadAction.createAndRunInternal(syncType, listener, customIdentifier, sessionContext, systemLandscape, connectionPool, uri, 0, oFF.XHashSetOfString.create());
};
oFF.SystemLandscapeLoadAction.createAndRunInternal = function(syncType, listener, customIdentifier, sessionContext, systemLandscape, connectionPool, url, level, uriSet)
{
	oFF.XObjectExt.assertNotNullExt(url, "No URL given");
	var newObject = new oFF.SystemLandscapeLoadAction();
	if (url.isRelativeUri())
	{
		var location = oFF.NetworkEnv.getLocation();
		var relative = url.getUrl();
		newObject.m_uri = oFF.XUri.createFromParentUriAndRelativeUrl(location, relative, false);
	}
	else
	{
		newObject.m_uri = url;
	}
	newObject.m_systemLandscape = systemLandscape;
	newObject.setData(systemLandscape);
	newObject.m_parents = oFF.XList.create();
	newObject.m_children = oFF.XList.create();
	newObject.m_all = oFF.XList.create();
	newObject.m_level = level;
	newObject.m_uriSet = uriSet;
	var fullUri = url.getUrl();
	uriSet.add(fullUri);
	newObject.setupActionAndRun(syncType, listener, customIdentifier, sessionContext);
	return newObject;
};
oFF.SystemLandscapeLoadAction.setSystems = function(systemsStructure, systemLandscape)
{
	oFF.SystemLandscapeLoadAction.setSystemsExt(systemsStructure, systemLandscape, null);
};
oFF.SystemLandscapeLoadAction.setSystemsExt = function(systemsStructure, systemLandscape, contextName)
{
	var elementNames = systemsStructure.getKeysAsReadOnlyListOfString();
	if (oFF.notNull(elementNames))
	{
		for (var i = 0; i < elementNames.size(); i++)
		{
			var systemName = elementNames.get(i);
			if (oFF.notNull(systemName))
			{
				var element = systemsStructure.getByKey(systemName);
				if (oFF.notNull(element) && element.getType() === oFF.PrElementType.STRUCTURE)
				{
					var systemStructure = element;
					var pair = oFF.SystemLandscapeLoadAction.readProperties(oFF.XProperties.create(), systemStructure, null);
					var prop = pair.getFirstObject();
					var systemDescription = systemLandscape.getSystemDescription(systemName);
					if (oFF.notNull(systemDescription))
					{
						var keysAsIteratorOfString = prop.getKeysAsIteratorOfString();
						while (keysAsIteratorOfString.hasNext())
						{
							var key = keysAsIteratorOfString.next();
							var value = prop.getStringByKey(key);
							systemDescription.setProperty(key, value);
						}
					}
					else
					{
						systemDescription = oFF.SystemDescription.createExt(systemLandscape.getSession(), systemLandscape, systemName, prop);
						systemLandscape.setSystemByDescription(systemDescription);
					}
					systemDescription.setRawContexts(pair.getSecondObject());
					var text = systemDescription.getSystemText();
					if (oFF.isNull(text))
					{
						systemDescription.setSystemText(systemDescription.getSystemName());
					}
				}
			}
		}
	}
};
oFF.SystemLandscapeLoadAction.getSystemPropertiesFromUri = function(uri)
{
	var properties = oFF.XProperties.create();
	var protocolType = uri.getProtocolType();
	if (oFF.notNull(protocolType))
	{
		properties.put(oFF.ConnectionParameters.PROTOCOL, protocolType.getName());
	}
	var host = uri.getHost();
	if (oFF.notNull(host))
	{
		properties.put(oFF.ConnectionParameters.HOST, uri.getHost());
	}
	var port = uri.getPort();
	if (port > 0)
	{
		properties.put(oFF.ConnectionParameters.PORT, oFF.XInteger.convertToString(port));
	}
	return oFF.ExtResult.create(properties, null);
};
oFF.SystemLandscapeLoadAction.readProperties = function(properties, systemStructure, contextName)
{
	var contexts = null;
	var elementNames = systemStructure.getKeysAsReadOnlyListOfString();
	var size = elementNames.size();
	for (var i = 0; i < size; i++)
	{
		var key = elementNames.get(i);
		if (oFF.XString.isEqual(key, oFF.ConnectionParameters.MAPPINGS))
		{
			var inaMappings = systemStructure.getListByKey(key);
			var sizeMappings = inaMappings.size();
			for (var idxMapping = 0; idxMapping < sizeMappings; idxMapping++)
			{
				var inaMapping = inaMappings.getStructureAt(idxMapping);
				var systemName = inaMapping.getStringByKey(oFF.ConnectionParameters.MAPPING_SYSTEM_NAME);
				properties.put(oFF.XStringUtils.concatenate3(oFF.ConnectionParameters.MAPPING_SYSTEM_NAME, "$$", systemName), systemName);
				var saveSchema = inaMapping.getStringByKey(oFF.ConnectionParameters.MAPPING_SERIALIZATION_SCHEMA);
				properties.put(oFF.XStringUtils.concatenate3(oFF.ConnectionParameters.MAPPING_SERIALIZATION_SCHEMA, "$$", systemName), saveSchema);
				var saveTable = inaMapping.getStringByKey(oFF.ConnectionParameters.MAPPING_SERIALIZATION_TABLE);
				properties.put(oFF.XStringUtils.concatenate3(oFF.ConnectionParameters.MAPPING_SERIALIZATION_TABLE, "$$", systemName), saveTable);
				var loadSchema = inaMapping.getStringByKey(oFF.ConnectionParameters.MAPPING_DESERIALIZATION_SCHEMA);
				properties.put(oFF.XStringUtils.concatenate3(oFF.ConnectionParameters.MAPPING_DESERIALIZATION_SCHEMA, "$$", systemName), loadSchema);
				var loadTable = inaMapping.getStringByKey(oFF.ConnectionParameters.MAPPING_DESERIALIZATION_TABLE);
				properties.put(oFF.XStringUtils.concatenate3(oFF.ConnectionParameters.MAPPING_DESERIALIZATION_TABLE, "$$", systemName), loadTable);
			}
		}
		else if (oFF.XString.isEqual(key, oFF.ConnectionParameters.CONTEXTS))
		{
			contexts = systemStructure.getStructureByKey(key);
			if (oFF.notNull(contextName))
			{
				var selectedContext = contexts.getStructureByKey(contextName);
				if (oFF.notNull(selectedContext))
				{
					oFF.SystemLandscapeLoadAction.readProperties(properties, selectedContext, null);
				}
			}
		}
		else if (oFF.XString.isEqual(key, oFF.ConnectionParameters.DEFINITION))
		{
			var definition = systemStructure.getStructureByKey(key);
			var sccHost = definition.getStringByKey(oFF.ConnectionParameters.SCC_VIRTUAL_HOST);
			if (oFF.notNull(sccHost))
			{
				properties.put(oFF.ConnectionParameters.HOST, sccHost);
			}
			var sccPort = definition.getStringByKey(oFF.ConnectionParameters.SCC_PORT);
			if (oFF.notNull(sccPort))
			{
				properties.put(oFF.ConnectionParameters.PORT, sccPort);
			}
		}
		else
		{
			var value = systemStructure.getStringByKey(key);
			properties.putStringNotNull(key, value);
		}
	}
	var pair = oFF.XPair.create(properties, contexts);
	return pair;
};
oFF.SystemLandscapeLoadAction.prototype.m_uri = null;
oFF.SystemLandscapeLoadAction.prototype.m_parents = null;
oFF.SystemLandscapeLoadAction.prototype.m_children = null;
oFF.SystemLandscapeLoadAction.prototype.m_all = null;
oFF.SystemLandscapeLoadAction.prototype.m_structure = null;
oFF.SystemLandscapeLoadAction.prototype.m_systemName = null;
oFF.SystemLandscapeLoadAction.prototype.m_finished = 0;
oFF.SystemLandscapeLoadAction.prototype.m_level = 0;
oFF.SystemLandscapeLoadAction.prototype.m_uriSet = null;
oFF.SystemLandscapeLoadAction.prototype.m_systemLandscape = null;
oFF.SystemLandscapeLoadAction.prototype.releaseObject = function()
{
	this.m_uri = null;
	this.m_systemName = null;
	this.m_structure = null;
	this.m_uriSet = null;
	this.m_systemLandscape = null;
	this.m_parents = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_parents);
	this.m_children = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_children);
	this.m_all = null;
	oFF.SyncActionExt.prototype.releaseObject.call( this );
};
oFF.SystemLandscapeLoadAction.prototype.processSynchronization = function(syncType)
{
	var file = oFF.XFile.createByUri(this.getProcess(), this.m_uri);
	file.processLoad(syncType, this, null, oFF.CompressionType.NONE);
	return true;
};
oFF.SystemLandscapeLoadAction.prototype.onFileLoaded = function(extResult, file, fileContent, customIdentifier)
{
	this.addAllMessages(extResult);
	if (extResult.hasErrors())
	{
		this.endSync();
	}
	else
	{
		var rootElement = fileContent.getJsonContent();
		this.parseStructure(rootElement);
	}
};
oFF.SystemLandscapeLoadAction.prototype.parseStructure = function(rootElement)
{
	if (oFF.isNull(rootElement))
	{
		this.addError(oFF.ErrorCodes.OTHER_ERROR, "No json root element in response");
		this.endSync();
	}
	else
	{
		this.m_structure = oFF.PrFactory.createStructureDeepCopy(rootElement);
		var parentReferences = this.m_structure.getListByKey("ParentLandscapeReferences");
		var referenceList = oFF.PrUtils.asListOfString(parentReferences);
		var furtherProcessing = false;
		if (oFF.notNull(referenceList) && referenceList.size() > 0)
		{
			if (this.m_level > 5)
			{
				this.addError(oFF.ErrorCodes.OTHER_ERROR, "System Landscape Network too deep: > 5 levels");
			}
			else
			{
				for (var i = 0; i < referenceList.size(); i++)
				{
					var parentRelativeUrlValue = referenceList.get(i);
					if (oFF.XStringUtils.isNotNullAndNotEmpty(parentRelativeUrlValue))
					{
						var url = oFF.XUri.createFromParentUriAndRelativeUrl(this.m_uri, parentRelativeUrlValue, true);
						var urlValue = url.getUrl();
						if (!this.m_uriSet.contains(urlValue))
						{
							var parentAction = oFF.SystemLandscapeLoadAction.createAndRunInternal(oFF.SyncType.DELAYED, this, oFF.XIntegerValue.create(i), this.getActionContext(), this.m_systemLandscape, null, url, this.m_level + 1, this.m_uriSet);
							this.m_parents.add(parentAction);
							this.m_all.add(parentAction);
							parentAction.setActiveSyncType(this.getActiveSyncType());
							parentAction.process();
							furtherProcessing = true;
						}
					}
				}
			}
		}
		if (this.m_level === 0)
		{
			var customUrl = oFF.XEnvironment.getInstance().getVariable(oFF.XEnvironmentConstants.LANDSCAPE_CUSTOMIZATION);
			if (oFF.notNull(customUrl))
			{
				var landscapeCustomUrl = oFF.XUri.createFromUrl(customUrl);
				var childAction = oFF.SystemLandscapeLoadAction.createAndRunInternal(oFF.SyncType.DELAYED, this, oFF.XIntegerValue.create(-1), this.getActionContext(), this.m_systemLandscape, null, landscapeCustomUrl, this.m_level + 1, this.m_uriSet);
				this.m_children.add(childAction);
				this.m_all.add(childAction);
				childAction.setActiveSyncType(this.getActiveSyncType());
				childAction.process();
				furtherProcessing = true;
			}
		}
		if (this.getActiveSyncType() === oFF.SyncType.BLOCKING || !furtherProcessing)
		{
			this.setData(this.getSystemLandscape());
			this.endSync();
		}
	}
};
oFF.SystemLandscapeLoadAction.prototype.onLandscapeNodeLoaded = function(extResult, landscape, customIdentifier)
{
	this.m_finished++;
	if (this.getActiveSyncType() === oFF.SyncType.NON_BLOCKING)
	{
		if (this.m_finished === this.m_all.size())
		{
			this.setData(this.getSystemLandscape());
			this.endSync();
		}
	}
};
oFF.SystemLandscapeLoadAction.prototype.endSync = function()
{
	if (this.m_level === 0)
	{
		this.removeTempSystems();
		this.mapSystems();
		this.adaptOrcaCloudSystem();
	}
	oFF.SyncActionExt.prototype.endSync.call( this );
};
oFF.SystemLandscapeLoadAction.prototype.removeTempSystems = function()
{
	for (var i = 0; i < this.m_all.size(); i++)
	{
		var node = this.m_all.get(i);
		node.removeTempSystems();
	}
	this.getSystemLandscape().removeSystem(this.m_systemName);
};
oFF.SystemLandscapeLoadAction.prototype.adaptOrcaCloudSystem = function()
{
	var process = this.getProcess();
	var environment = process.getEnvironment();
	var mainClibSys = environment.getStringByKey(oFF.XEnvironmentConstants.FIREFLY_MAIN_CLIB_SYS);
	var tenantId = environment.getStringByKey(oFF.XEnvironmentConstants.LOCAL_ORCA_TENANT_ID);
	if (oFF.XStringUtils.isNotNullAndNotEmpty(mainClibSys) || oFF.XStringUtils.isNotNullAndNotEmpty(tenantId))
	{
		var systemLandscape = this.getSystemLandscape();
		var systemNames = systemLandscape.getSystemNames();
		for (var i = 0; i < systemNames.size(); i++)
		{
			var sysName = systemNames.get(i);
			var systemDescription = systemLandscape.getSystemDescription(sysName);
			var systemType = systemDescription.getSystemType();
			var isOrca = systemType.isTypeOf(oFF.SystemType.ORCA);
			var isMainSys = oFF.XString.isEqual(sysName, mainClibSys);
			if (isOrca === false && oFF.notNull(mainClibSys) && isMainSys)
			{
				isOrca = true;
				systemType = oFF.SystemType.ORCA_MAIN;
				systemDescription.setSystemType(systemType);
			}
			if (isMainSys)
			{
				if (oFF.notNull(tenantId))
				{
					systemDescription.setTenantId(tenantId);
				}
			}
		}
	}
};
oFF.SystemLandscapeLoadAction.prototype.mapSystems = function()
{
	for (var i = 0; i < this.m_parents.size(); i++)
	{
		var parentNode = this.m_parents.get(i);
		parentNode.mapSystems();
	}
	this.mapStructureToSystem(this.m_structure);
	for (var j = 0; j < this.m_children.size(); j++)
	{
		var childNode = this.m_children.get(j);
		childNode.mapSystems();
	}
};
oFF.SystemLandscapeLoadAction.prototype.mapStructureToSystem = function(landscapeStructure)
{
	if (oFF.notNull(landscapeStructure))
	{
		var systemLandscape = this.getSystemLandscape();
		var systemsStructure = landscapeStructure.getStructureByKey("Systems");
		if (oFF.notNull(systemsStructure))
		{
			var contextName = this.getSession().getContextName();
			oFF.SystemLandscapeLoadAction.setSystemsExt(systemsStructure, systemLandscape, contextName);
		}
		var includeFilter = landscapeStructure.getListByKey("IncludeFilter");
		if (oFF.notNull(includeFilter))
		{
			var survivors = oFF.XList.create();
			for (var ex = 0; ex < includeFilter.size(); ex++)
			{
				var systemNameToIncude = includeFilter.getStringAt(ex);
				survivors.add(systemLandscape.getSystemDescription(systemNameToIncude));
			}
			systemLandscape.clearSystems();
			for (var k = 0; k < survivors.size(); k++)
			{
				systemLandscape.setSystemByDescription(survivors.get(k));
			}
		}
		var excludeFilter = landscapeStructure.getListByKey("ExcludeFilter");
		if (oFF.notNull(excludeFilter))
		{
			for (var ex1 = 0; ex1 < excludeFilter.size(); ex1++)
			{
				var systemNameToExclude = excludeFilter.getStringAt(ex1);
				systemLandscape.removeSystem(systemNameToExclude);
			}
		}
		var roles = landscapeStructure.getStructureByKey("Roles");
		if (oFF.notNull(roles))
		{
			var iterator = oFF.SystemRole.getAllRoles().getIterator();
			while (iterator.hasNext())
			{
				var currentRole = iterator.next();
				var masterName = roles.getStringByKey(currentRole.getName());
				if (oFF.XStringUtils.isNotNullAndNotEmpty(masterName))
				{
					systemLandscape.setDefaultSystemName(currentRole, masterName);
				}
			}
			oFF.XObjectExt.release(iterator);
		}
	}
};
oFF.SystemLandscapeLoadAction.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onLandscapeNodeLoaded(extResult, data, customIdentifier);
};
oFF.SystemLandscapeLoadAction.prototype.getSystemLandscape = function()
{
	return this.m_systemLandscape;
};

oFF.UserProfileSaveAction = function() {};
oFF.UserProfileSaveAction.prototype = new oFF.SyncActionExt();
oFF.UserProfileSaveAction.prototype._ff_c = "UserProfileSaveAction";

oFF.UserProfileSaveAction.createAndRun = function(syncType, listener, customIdentifier, context, userProfile)
{
	var object = new oFF.UserProfileSaveAction();
	object.m_userProfile = userProfile;
	object.setupActionAndRun(syncType, listener, customIdentifier, context);
	return object;
};
oFF.UserProfileSaveAction.prototype.m_userProfile = null;
oFF.UserProfileSaveAction.prototype.getLogLayer = function()
{
	return oFF.OriginLayer.SUBSYSTEM;
};
oFF.UserProfileSaveAction.prototype.processSynchronization = function(syncType)
{
	this.setData(this.m_userProfile);
	var documentFormat = this.m_userProfile.getDocumentFormat();
	var document = this.m_userProfile.getDocument();
	var canBeSaved = false;
	if (oFF.XString.isEqual(documentFormat, oFF.UserProfileAdapterLdap.DOC_FORMAT))
	{
		oFF.UserProfileAdapterLdap.serialize(this.m_userProfile, document);
		canBeSaved = true;
	}
	else if (oFF.XString.isEqual(documentFormat, oFF.UserProfileAdapterOrca.DOC_FORMAT))
	{
		oFF.UserProfileAdapterOrca.serialize(this.m_userProfile, document);
		canBeSaved = true;
	}
	if (canBeSaved === true)
	{
		var uri = this.m_userProfile.getDocumentUri();
		var saveFile = oFF.XFile.createByUri(this.getProcess(), uri);
		var content = oFF.XContent.createJsonObjectContent(oFF.ContentType.JSON, document);
		saveFile.processSave(syncType, this, null, content, oFF.CompressionType.NONE);
		return true;
	}
	else
	{
		this.addError(0, "Cannot save: No valid document format given");
		return false;
	}
};
oFF.UserProfileSaveAction.prototype.onFileSaved = function(extResult, file, fileContent, customIdentifier)
{
	this.addAllMessages(extResult);
	this.endSync();
};
oFF.UserProfileSaveAction.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onUserProfileSaved(extResult, data, customIdentifier);
};

oFF.CapabilityContainer = function() {};
oFF.CapabilityContainer.prototype = new oFF.XAbstractReadOnlyMap();
oFF.CapabilityContainer.prototype._ff_c = "CapabilityContainer";

oFF.CapabilityContainer.create = function(name)
{
	var object = new oFF.CapabilityContainer();
	object.setupExt(name);
	return object;
};
oFF.CapabilityContainer.prototype.m_name = null;
oFF.CapabilityContainer.prototype.cloneExt = function(flags)
{
	var clone = oFF.CapabilityContainer.create(this.getName());
	clone.m_storage = this.m_storage.createMapByStringCopy();
	return clone;
};
oFF.CapabilityContainer.prototype.setupExt = function(name)
{
	this.m_name = name;
	oFF.XAbstractReadOnlyMap.prototype.setup.call( this );
};
oFF.CapabilityContainer.prototype.releaseObject = function()
{
	this.m_name = null;
	oFF.XAbstractReadOnlyMap.prototype.releaseObject.call( this );
};
oFF.CapabilityContainer.prototype.addCapabilityInfo = function(capability)
{
	this.put(capability.getName(), capability);
};
oFF.CapabilityContainer.prototype.addCapability = function(name)
{
	this.put(name, oFF.Capability.createCapabilityInfo(name, null));
};
oFF.CapabilityContainer.prototype.put = function(key, element)
{
	if (this.m_storage.containsKey(key) === false)
	{
		this.m_storage.put(key, element);
	}
};
oFF.CapabilityContainer.prototype.getSortedCapabilityNames = function()
{
	return this.m_storage.getKeysAsReadOnlyListOfString();
};
oFF.CapabilityContainer.prototype.intersect = function(otherCapabilitySelection)
{
	var newContainer = oFF.CapabilityContainer.create(this.getName());
	if (oFF.notNull(otherCapabilitySelection))
	{
		var iterator = otherCapabilitySelection.getKeysAsIteratorOfString();
		while (iterator.hasNext())
		{
			var key = iterator.next();
			var capability = this.m_storage.getByKey(key);
			if (oFF.notNull(capability))
			{
				newContainer.addCapabilityInfo(otherCapabilitySelection.getByKey(key));
			}
		}
	}
	return newContainer;
};
oFF.CapabilityContainer.prototype.union = function(otherCapabilitySelection)
{
	var newContainer = this.clone();
	if (oFF.notNull(otherCapabilitySelection))
	{
		var iterator = otherCapabilitySelection.getKeysAsIteratorOfString();
		while (iterator.hasNext())
		{
			var key = iterator.next();
			var capability = otherCapabilitySelection.getByKey(key);
			newContainer.addCapabilityInfo(capability);
		}
	}
	return newContainer;
};
oFF.CapabilityContainer.prototype.remove = function(key)
{
	return this.m_storage.remove(key);
};
oFF.CapabilityContainer.prototype.clear = function()
{
	this.m_storage.clear();
};
oFF.CapabilityContainer.prototype.getName = function()
{
	return this.m_name;
};
oFF.CapabilityContainer.prototype.createMapByStringCopy = function()
{
	return this.m_storage.createMapByStringCopy();
};
oFF.CapabilityContainer.prototype.toString = function()
{
	var buffer = oFF.XStringBuffer.create();
	buffer.append(this.m_name);
	buffer.appendLine(" Capabilities:");
	buffer.appendLine("{");
	var capabilities = oFF.XCollectionUtils.createListCopy(this.m_storage.getValuesAsReadOnlyList());
	capabilities.sortByComparator(oFF.XComparatorName.create());
	var size = capabilities.size();
	for (var i = 0; i < size; i++)
	{
		if (i > 0)
		{
			buffer.appendLine(", ");
		}
		buffer.append(capabilities.get(i).toString());
	}
	oFF.XObjectExt.release(capabilities);
	buffer.appendNewLine();
	buffer.append("}");
	return buffer.toString();
};

oFF.XHttpFile = function() {};
oFF.XHttpFile.prototype = new oFF.DfXFileProviderNonBlocking();
oFF.XHttpFile.prototype._ff_c = "XHttpFile";

oFF.XHttpFile._create = function(process, fileSystem, uri)
{
	var file = new oFF.XHttpFile();
	file.setupHttpFile(process, fileSystem, uri);
	return file;
};
oFF.XHttpFile.prototype.m_isDir = false;
oFF.XHttpFile.prototype.m_isExecutable = false;
oFF.XHttpFile.prototype.setupHttpFile = function(process, fileSystem, uri)
{
	this.setupFile(process, fileSystem, uri);
	this.m_isDir = oFF.XString.endsWith(uri.getPath(), "/");
};
oFF.XHttpFile.prototype.newChildFile = function(childUri, childMetadata)
{
	var process = this.getProcess();
	var fileSystem = this.getFileSystem();
	var file = oFF.XHttpFile._create(process, fileSystem, childUri);
	return file;
};
oFF.XHttpFile.prototype.processProviderSave = oFF.noSupport;
oFF.XHttpFile.prototype.processProviderLoad = function(syncType, listener, customIdentifier, compression)
{
	return oFF.XHttpFileLoadAction.createAndRun(syncType, this, listener, customIdentifier);
};
oFF.XHttpFile.prototype.processProviderFetchChildren = function(syncType, listener, customIdentifier, config)
{
	return oFF.XHttpFileDirAction2.createAndRun(syncType, this, listener, customIdentifier);
};
oFF.XHttpFile.prototype.processProviderRename = oFF.noSupport;
oFF.XHttpFile.prototype.isDirectory = function()
{
	return this.m_isDir;
};
oFF.XHttpFile.prototype.setIsDirectory = function(isDirectory)
{
	this.m_isDir = isDirectory;
};
oFF.XHttpFile.prototype.isExecutable = function()
{
	return this.m_isExecutable;
};
oFF.XHttpFile.prototype.setIsExecutable = function(isExecutable)
{
	this.m_isExecutable = isExecutable;
};
oFF.XHttpFile.prototype.hasChildren = function()
{
	return true;
};
oFF.XHttpFile.prototype.isExisting = function()
{
	var extRes = this.processProviderLoad(oFF.SyncType.BLOCKING, null, null, oFF.CompressionType.NONE);
	return !extRes.hasErrors();
};
oFF.XHttpFile.prototype.getLastModifiedTimestamp = function()
{
	return 0;
};
oFF.XHttpFile.prototype.isHidden = function()
{
	return false;
};
oFF.XHttpFile.prototype.processProviderMkdir = oFF.noSupport;
oFF.XHttpFile.prototype.processRename = oFF.noSupport;
oFF.XHttpFile.prototype.processDelete = oFF.noSupport;

oFF.XRemoteHttpFile = function() {};
oFF.XRemoteHttpFile.prototype = new oFF.DfXFileProviderNonBlocking();
oFF.XRemoteHttpFile.prototype._ff_c = "XRemoteHttpFile";

oFF.XRemoteHttpFile._create = function(process, fileSystem, uri)
{
	var file = new oFF.XRemoteHttpFile();
	file.setupHttpFile(process, fileSystem, uri);
	return file;
};
oFF.XRemoteHttpFile.prototype.m_isDir = false;
oFF.XRemoteHttpFile.prototype.m_isExecutable = false;
oFF.XRemoteHttpFile.prototype.m_metadataLoaded = false;
oFF.XRemoteHttpFile.prototype.m_existing = false;
oFF.XRemoteHttpFile.prototype.m_hidden = false;
oFF.XRemoteHttpFile.prototype.setupHttpFile = function(process, fileSystem, uri)
{
	this.setupFile(process, fileSystem, uri);
};
oFF.XRemoteHttpFile.prototype.newChildFile = function(childUri, childMetadata)
{
	var process = this.getProcess();
	var fileSystem = this.getFileSystem();
	var file = oFF.XRemoteHttpFile._create(process, fileSystem, childUri);
	return file;
};
oFF.XRemoteHttpFile.prototype.processProviderLoad = function(syncType, listener, customIdentifier, compression)
{
	return this.processInternalLoad(syncType, oFF.XRemoteHttpFileRequestAdapter.create( function(fileRequestAction){
		var data = fileRequestAction.getData();
		if (oFF.notNull(listener))
		{
			listener.onFileLoaded(fileRequestAction, data, data.getFileContent(), customIdentifier);
		}
	}.bind(this)));
};
oFF.XRemoteHttpFile.prototype.processInternalLoad = function(syncType, listener)
{
	var requestAction = oFF.XRemoteHttpFileRequestAction.create(syncType, this, listener, oFF.XRemoteHttpFileRequestAction.LOAD);
	requestAction.process();
	return requestAction;
};
oFF.XRemoteHttpFile.prototype.processProviderRename = oFF.noSupport;
oFF.XRemoteHttpFile.prototype.processProviderFetchChildren = function(syncType, listener, customIdentifier, config)
{
	return this.processInternalLoad(syncType, oFF.XRemoteHttpFileRequestAdapter.create( function(fileRequestAction){
		var data = fileRequestAction.getData();
		if (oFF.notNull(listener))
		{
			listener.onChildrenFetched(fileRequestAction, data, data.getCachedChildFiles(), data.getCachedChildrenResultset(), customIdentifier);
		}
	}.bind(this)));
};
oFF.XRemoteHttpFile.prototype.processIsExisting = function(syncType, listener, customIdentifier)
{
	return this.processInternalLoad(syncType, oFF.XRemoteHttpFileRequestAdapter.create( function(fileRequestAction){
		var data = fileRequestAction.getData();
		if (oFF.notNull(listener))
		{
			listener.onFileExistsCheck(fileRequestAction, data, fileRequestAction.isValid() && oFF.notNull(data) && data.isExisting(), customIdentifier);
		}
	}.bind(this)));
};
oFF.XRemoteHttpFile.prototype.isDirectory = function()
{
	this.ensureLoaded();
	return this.m_isDir;
};
oFF.XRemoteHttpFile.prototype.setIsDirectory = function(isDirectory)
{
	this.m_isDir = isDirectory;
};
oFF.XRemoteHttpFile.prototype.isExecutable = function()
{
	this.ensureLoaded();
	return this.m_isExecutable;
};
oFF.XRemoteHttpFile.prototype.setIsExecutable = function(isExecutable)
{
	this.m_isExecutable = isExecutable;
};
oFF.XRemoteHttpFile.prototype.hasChildren = function()
{
	return this.isDirectory();
};
oFF.XRemoteHttpFile.prototype.isMetadataLoaded = function()
{
	return this.m_metadataLoaded;
};
oFF.XRemoteHttpFile.prototype.setMetadataLoaded = function(metadataLoaded)
{
	this.m_metadataLoaded = metadataLoaded;
};
oFF.XRemoteHttpFile.prototype.isExisting = function()
{
	this.ensureLoaded();
	return this.m_existing;
};
oFF.XRemoteHttpFile.prototype.ensureLoaded = function()
{
	if (!this.m_metadataLoaded)
	{
		this.processInternalLoad(oFF.SyncType.BLOCKING, null);
	}
};
oFF.XRemoteHttpFile.prototype.setExisting = function(existing)
{
	this.m_existing = existing;
};
oFF.XRemoteHttpFile.prototype.getLastModifiedTimestamp = function()
{
	return 0;
};
oFF.XRemoteHttpFile.prototype.isHidden = function()
{
	this.ensureLoaded();
	return this.m_hidden;
};
oFF.XRemoteHttpFile.prototype.setHidden = function(hidden)
{
	this.m_hidden = hidden;
};
oFF.XRemoteHttpFile.prototype.processProviderMkdir = function(syncType, listener, customIdentifier, includeParentDirs)
{
	var listenerAdapter = oFF.XRemoteHttpFileRequestAdapter.create( function(fileRequestAction){
		var data = fileRequestAction.getData();
		if (oFF.notNull(listener))
		{
			listener.onDirectoryCreated(fileRequestAction, data, customIdentifier);
		}
	}.bind(this));
	var requestAction = oFF.XRemoteHttpFileRequestAction.create(syncType, this, listenerAdapter, oFF.XRemoteHttpFileRequestAction.UPDATE);
	this.setIsDirectory(true);
	requestAction.process();
	return requestAction;
};
oFF.XRemoteHttpFile.prototype.processRename = function(syncType, listener, customIdentifier, destFile)
{
	var listenerAdapter = oFF.XRemoteHttpFileRequestAdapter.create( function(fileRequestAction){
		var data = fileRequestAction.getData();
		if (oFF.notNull(listener))
		{
			listener.onFileRenamed(fileRequestAction, data, customIdentifier);
		}
	}.bind(this));
	var requestAction = oFF.XRemoteHttpFileRequestAction.create(syncType, this, listenerAdapter, oFF.XRemoteHttpFileRequestAction.UPDATE);
	requestAction.setDestinationFile(destFile);
	requestAction.process();
	return requestAction;
};
oFF.XRemoteHttpFile.prototype.processDelete = function(syncType, listener, customIdentifier)
{
	var listenerAdapter = oFF.XRemoteHttpFileRequestAdapter.create( function(fileRequestAction){
		var data = fileRequestAction.getData();
		if (oFF.notNull(listener))
		{
			listener.onFileDeleted(fileRequestAction, data, customIdentifier);
		}
	}.bind(this));
	var requestAction = oFF.XRemoteHttpFileRequestAction.create(syncType, this, listenerAdapter, oFF.XRemoteHttpFileRequestAction.DELETE);
	requestAction.process();
	return requestAction;
};
oFF.XRemoteHttpFile.prototype.processProviderSave = function(syncType, listener, customIdentifier, content, compression)
{
	this.setFileContent(content);
	var listenerAdapter = oFF.XRemoteHttpFileRequestAdapter.create( function(fileRequestAction){
		var data = fileRequestAction.getData();
		if (oFF.notNull(listener))
		{
			listener.onFileSaved(fileRequestAction, data, content, customIdentifier);
		}
	}.bind(this));
	var requestAction = oFF.XRemoteHttpFileRequestAction.create(syncType, this, listenerAdapter, oFF.XRemoteHttpFileRequestAction.UPDATE);
	requestAction.process();
	return requestAction;
};
oFF.XRemoteHttpFile.prototype.updateName = function(fileName)
{
	var vfsUri = this.getUri();
	vfsUri.setPath(oFF.XStringUtils.concatenate2(vfsUri.getPathContainer().getParentPath(), fileName));
	this.getUri().setPath(oFF.XStringUtils.concatenate2(this.getUri().getPathContainer().getParentPath(), fileName));
};
oFF.XRemoteHttpFile.prototype.getTranslatedTargetUri = function()
{
	var translatedUri = oFF.XUri.createFromOther(this.getUri());
	if (translatedUri.getProtocolType() === oFF.ProtocolType.REMOTE_WEB)
	{
		translatedUri.setProtocolType(oFF.ProtocolType.HTTP);
	}
	else if (translatedUri.getProtocolType() === oFF.ProtocolType.REMOTE_WEB_SECURE)
	{
		translatedUri.setProtocolType(oFF.ProtocolType.HTTPS);
	}
	return translatedUri;
};
oFF.XRemoteHttpFile.prototype.processFetchMetadata = function(syncType, listener, customIdentifier)
{
	return oFF.XRemoteHttpFileActionFetchMetadata.createAndRun(syncType, listener, customIdentifier, this.getFileSystem(), this);
};

oFF.XRemoteHttpFileActionFetchMetadata = function() {};
oFF.XRemoteHttpFileActionFetchMetadata.prototype = new oFF.DfFileAction();
oFF.XRemoteHttpFileActionFetchMetadata.prototype._ff_c = "XRemoteHttpFileActionFetchMetadata";

oFF.XRemoteHttpFileActionFetchMetadata.createAndRun = function(syncType, listener, customIdentifier, fileSystem, file)
{
	var object = new oFF.XRemoteHttpFileActionFetchMetadata();
	object.setData(file);
	object.setupActionAndRun(syncType, listener, customIdentifier, fileSystem);
	return object;
};
oFF.XRemoteHttpFileActionFetchMetadata.prototype.processSynchronization = function(syncType)
{
	var file = this.getFile();
	var requestAction = oFF.XRemoteHttpFileRequestAction.create(syncType, file, this, oFF.XRemoteHttpFileRequestAction.LOAD);
	requestAction.process();
	return true;
};
oFF.XRemoteHttpFileActionFetchMetadata.prototype.onHttpFileProcessed = function(extResult, data, customIdentifier)
{
	this.addAllMessages(extResult);
	if (extResult.isValid())
	{
		var file = this.getFile();
		file.setMetadataFromProperties();
	}
	this.endSync();
};
oFF.XRemoteHttpFileActionFetchMetadata.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onFileFetchMetadata(extResult, data, data.getCachedMetadata(), customIdentifier);
};

oFF.XFileProviderClassic = function() {};
oFF.XFileProviderClassic.prototype = new oFF.DfXFileProviderBlocking();
oFF.XFileProviderClassic.prototype._ff_c = "XFileProviderClassic";

oFF.XFileProviderClassic.createExt = function(process, fileSystem, uri)
{
	var file = new oFF.XFileProviderClassic();
	file.setupFileExt(process, fileSystem, uri);
	return file;
};
oFF.XFileProviderClassic.prototype.m_nativePath = null;
oFF.XFileProviderClassic.prototype.setupFileExt = function(process, fs, uri)
{
	oFF.DfXFileProviderBlocking.prototype.setupFile.call( this , process, fs, uri);
	this.m_nativePath = fs.convertToNativeFilePath(uri);
	this.writeDebugMessage("set up");
};
oFF.XFileProviderClassic.prototype.handleErrorMessages = function(messages)
{
	this.clearMessages();
	this.addAllMessages(messages);
	if (oFF.XFile.DEBUG_MODE && this.hasErrors())
	{
		this.log(this.getSummary());
	}
};
oFF.XFileProviderClassic.prototype.getNativePath = function()
{
	return this.m_nativePath;
};
oFF.XFileProviderClassic.prototype.getFsBase = function()
{
	return this.m_fs;
};
oFF.XFileProviderClassic.prototype.newChildFile = function(childUri, childMetadata)
{
	var file = oFF.XFileProviderClassic.createExt(this.getProcess(), this.getFsBase(), childUri);
	if (oFF.notNull(childMetadata))
	{
		file.setMetadata(childMetadata);
	}
	return file;
};
oFF.XFileProviderClassic.prototype.getFileType = function()
{
	return this.getFsBase().getFileType(this);
};
oFF.XFileProviderClassic.prototype.isReadable = function()
{
	var result = this.getFsBase().isReadableExt(this);
	if (result)
	{
		this.writeDebugMessage("is readable");
	}
	return result;
};
oFF.XFileProviderClassic.prototype.isExecutable = function()
{
	var result = this.getFsBase().isExecutableExt(this);
	if (result)
	{
		this.writeDebugMessage("is executable");
	}
	return result;
};
oFF.XFileProviderClassic.prototype.isDirectory = function()
{
	var result = this.getFsBase().isDirectoryExt(this);
	if (result)
	{
		this.writeDebugMessage("is directory");
	}
	return result;
};
oFF.XFileProviderClassic.prototype.isFile = function()
{
	var result = this.getFsBase().isFileExt(this);
	if (result)
	{
		this.writeDebugMessage("is file");
	}
	return result;
};
oFF.XFileProviderClassic.prototype.isExisting = function()
{
	var result = this.getFsBase().isExistingExt(this);
	if (result)
	{
		this.writeDebugMessage("is existing");
	}
	return result;
};
oFF.XFileProviderClassic.prototype.supportsSetLastModified = function()
{
	this.writeDebugMessage("supports set last modified");
	return true;
};
oFF.XFileProviderClassic.prototype.getLastModifiedTimestamp = function()
{
	var result = this.getFsBase().getLastModifiedTimestampExt(this);
	this.writeDebugMessage(oFF.XStringUtils.concatenate2("get last modified timestamp ", oFF.XLong.convertToString(result)));
	return result;
};
oFF.XFileProviderClassic.prototype.isHidden = function()
{
	var result = this.getFsBase().isHiddenExt(this);
	if (result)
	{
		this.writeDebugMessage("is hidden");
	}
	return result;
};
oFF.XFileProviderClassic.prototype.isWriteable = function()
{
	var result = this.getFsBase().isWriteableExt(this);
	if (result)
	{
		this.writeDebugMessage("is writeable");
	}
	return result;
};
oFF.XFileProviderClassic.prototype.setWritable = function(writable, ownerOnly)
{
	if (oFF.XFile.DEBUG_MODE)
	{
		var sb = oFF.XStringBuffer.create();
		sb.append("set writeable ").appendBoolean(writable);
		if (ownerOnly)
		{
			sb.append(" owner only");
		}
		this.writeDebugMessage(sb.toString());
	}
	this.handleErrorMessages(this.getFsBase().setWritableExt(this, writable, ownerOnly));
};
oFF.XFileProviderClassic.prototype.getAttributes = function()
{
	return this.getFsBase().getAttributes(this);
};
oFF.XFileProviderClassic.prototype.saveExt = function(content, compression)
{
	this.getFsBase().saveExt(this, content, compression);
};
oFF.XFileProviderClassic.prototype.loadExt = function(compression)
{
	this.getFsBase().loadExt2(this, compression);
	return this.getFileContent();
};
oFF.XFileProviderClassic.prototype.processExecute = function(syncType, listener, customIdentifier)
{
	return this.getFsBase().processExecute(syncType, listener, customIdentifier, this);
};
oFF.XFileProviderClassic.prototype.deleteFile = function()
{
	this.getFsBase().deleteFileExt(this);
};
oFF.XFileProviderClassic.prototype.supportsRenameTo = function()
{
	this.writeDebugMessage("supports rename to");
	return true;
};
oFF.XFileProviderClassic.prototype.renameTo = function(dest)
{
	var result;
	if (oFF.isNull(dest))
	{
		this.writeDebugMessage("Destination was null");
		result = oFF.ExtResult.createWithErrorMessage("Destination was null");
	}
	else
	{
		this.writeDebugMessage(oFF.XStringUtils.concatenate2("rename to ", dest.getNativePath()));
		this.getFsBase().renameToExt(this, dest);
		result = oFF.ExtResult.create(dest, null);
	}
	return result;
};
oFF.XFileProviderClassic.prototype.processProviderRename = oFF.noSupport;
oFF.XFileProviderClassic.prototype.mkdirExt = function(includeParentDirs)
{
	this.getFsBase().mkdirExt(this, includeParentDirs);
};
oFF.XFileProviderClassic.prototype.getChildren = function()
{
	var childrenMetadata = this.getFsBase().getChildrenMetadata(this);
	this.setChildMetadata(childrenMetadata, -1);
	return this.getCachedChildFiles();
};

oFF.XFileActionDelete = function() {};
oFF.XFileActionDelete.prototype = new oFF.DfFileAction();
oFF.XFileActionDelete.prototype._ff_c = "XFileActionDelete";

oFF.XFileActionDelete.createAndRun = function(syncType, listener, customIdentifier, fileSystem, file)
{
	var object = new oFF.XFileActionDelete();
	object.setData(file);
	object.setupActionAndRun(syncType, listener, customIdentifier, fileSystem);
	return object;
};
oFF.XFileActionDelete.prototype.processSynchronization = function(syncType)
{
	var file = this.getFile();
	file.deleteFile();
	this.addAllMessages(file);
	return false;
};
oFF.XFileActionDelete.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onFileDeleted(extResult, data, customIdentifier);
};

oFF.XFileActionExecute = function() {};
oFF.XFileActionExecute.prototype = new oFF.DfFileAction();
oFF.XFileActionExecute.prototype._ff_c = "XFileActionExecute";

oFF.XFileActionExecute.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onFileExecuted(extResult, data, data.getFileContent(), customIdentifier);
};

oFF.XFileActionFetchChildren = function() {};
oFF.XFileActionFetchChildren.prototype = new oFF.DfFileAction();
oFF.XFileActionFetchChildren.prototype._ff_c = "XFileActionFetchChildren";

oFF.XFileActionFetchChildren.createAndRun = function(syncType, listener, customIdentifier, fileSystem, file)
{
	var object = new oFF.XFileActionFetchChildren();
	object.setData(file);
	object.setupActionAndRun(syncType, listener, customIdentifier, fileSystem);
	return object;
};
oFF.XFileActionFetchChildren.prototype.processSynchronization = function(syncType)
{
	var file = this.getFile();
	file.getChildren();
	this.addAllMessages(file);
	return false;
};
oFF.XFileActionFetchChildren.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onChildrenFetched(extResult, data, data.getCachedChildFiles(), data.getCachedChildrenResultset(), customIdentifier);
};

oFF.XFileActionFetchMetadata = function() {};
oFF.XFileActionFetchMetadata.prototype = new oFF.DfFileAction();
oFF.XFileActionFetchMetadata.prototype._ff_c = "XFileActionFetchMetadata";

oFF.XFileActionFetchMetadata.createAndRun = function(syncType, listener, customIdentifier, fileSystem, file)
{
	var object = new oFF.XFileActionFetchMetadata();
	object.setData(file);
	object.setupActionAndRun(syncType, listener, customIdentifier, fileSystem);
	return object;
};
oFF.XFileActionFetchMetadata.prototype.processSynchronization = function(syncType)
{
	var file = this.getFile();
	file.setMetadataFromProperties();
	this.addAllMessages(file);
	return false;
};
oFF.XFileActionFetchMetadata.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onFileFetchMetadata(extResult, data, data.getCachedMetadata(), customIdentifier);
};

oFF.XFileActionIsExisting = function() {};
oFF.XFileActionIsExisting.prototype = new oFF.DfFileAction();
oFF.XFileActionIsExisting.prototype._ff_c = "XFileActionIsExisting";

oFF.XFileActionIsExisting.createAndRun = function(syncType, listener, customIdentifier, fileSystem, file)
{
	var object = new oFF.XFileActionIsExisting();
	object.setData(file);
	object.setupActionAndRun(syncType, listener, customIdentifier, fileSystem);
	return object;
};
oFF.XFileActionIsExisting.prototype.processSynchronization = function(syncType)
{
	var file = this.getFile();
	var isExisting = file.isExisting();
	file.setIsExisting(isExisting);
	this.addAllMessages(file);
	return false;
};
oFF.XFileActionIsExisting.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onFileExistsCheck(extResult, data, data.getCachedIsExisting(), customIdentifier);
};

oFF.XFileActionLoad = function() {};
oFF.XFileActionLoad.prototype = new oFF.DfFileAction();
oFF.XFileActionLoad.prototype._ff_c = "XFileActionLoad";

oFF.XFileActionLoad.createAndRun = function(syncType, listener, customIdentifier, fileSystem, file, compression)
{
	var object = new oFF.XFileActionLoad();
	object.m_compression = compression;
	object.setData(file);
	object.setupActionAndRun(syncType, listener, customIdentifier, fileSystem);
	return object;
};
oFF.XFileActionLoad.prototype.m_compression = null;
oFF.XFileActionLoad.prototype.processSynchronization = function(syncType)
{
	var file = this.getFile();
	if (this.m_compression === oFF.CompressionType.GZIP)
	{
		file.loadGzipped();
	}
	else
	{
		file.load();
	}
	this.addAllMessages(this.getFile());
	return false;
};
oFF.XFileActionLoad.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onFileLoaded(extResult, data, data.getFileContent(), customIdentifier);
};

oFF.XFileActionMkdir = function() {};
oFF.XFileActionMkdir.prototype = new oFF.DfFileAction();
oFF.XFileActionMkdir.prototype._ff_c = "XFileActionMkdir";

oFF.XFileActionMkdir.createAndRun = function(syncType, listener, customIdentifier, fileSystem, file, includeParentDirs)
{
	var object = new oFF.XFileActionMkdir();
	object.m_includeParentDirs = includeParentDirs;
	object.setData(file);
	object.setupActionAndRun(syncType, listener, customIdentifier, fileSystem);
	return object;
};
oFF.XFileActionMkdir.prototype.m_includeParentDirs = false;
oFF.XFileActionMkdir.prototype.processSynchronization = function(syncType)
{
	var file = this.getFile();
	if (this.m_includeParentDirs === true)
	{
		file.mkdirs();
	}
	else
	{
		file.mkdir();
	}
	this.addAllMessages(file);
	return false;
};
oFF.XFileActionMkdir.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onDirectoryCreated(extResult, data, customIdentifier);
};

oFF.XFileActionRename = function() {};
oFF.XFileActionRename.prototype = new oFF.DfFileAction();
oFF.XFileActionRename.prototype._ff_c = "XFileActionRename";

oFF.XFileActionRename.createAndRun = function(syncType, listener, customIdentifier, fileSystem, sourceFile, targetFile)
{
	var object = new oFF.XFileActionRename();
	object.m_targetFile = targetFile;
	object.setData(sourceFile);
	object.setupActionAndRun(syncType, listener, customIdentifier, fileSystem);
	return object;
};
oFF.XFileActionRename.prototype.m_targetFile = null;
oFF.XFileActionRename.prototype.processSynchronization = function(syncType)
{
	var file = this.getFile();
	file.renameTo(this.m_targetFile);
	this.addAllMessages(file);
	return false;
};
oFF.XFileActionRename.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onFileRenamed(extResult, data, customIdentifier);
};

oFF.XFileActionSave = function() {};
oFF.XFileActionSave.prototype = new oFF.DfFileAction();
oFF.XFileActionSave.prototype._ff_c = "XFileActionSave";

oFF.XFileActionSave.createAndRun = function(syncType, listener, customIdentifier, fileSystem, file, content, compression)
{
	var object = new oFF.XFileActionSave();
	object.m_content = content;
	object.m_compression = compression;
	object.setData(file);
	object.setupActionAndRun(syncType, listener, customIdentifier, fileSystem);
	return object;
};
oFF.XFileActionSave.prototype.m_content = null;
oFF.XFileActionSave.prototype.m_compression = null;
oFF.XFileActionSave.prototype.processSynchronization = function(syncType)
{
	var file = this.getFile();
	if (this.m_compression === oFF.CompressionType.GZIP)
	{
		file.saveByteArrayGzipped(this.m_content.getByteArray());
	}
	else
	{
		if (this.m_content.getContentType() === oFF.ContentType.BINARY)
		{
			file.saveByteArray(this.m_content.getByteArray());
		}
		else
		{
			var fileContentBinary = oFF.XByteArray.convertFromString(this.m_content.getString());
			file.saveByteArray(fileContentBinary);
		}
	}
	this.addAllMessages(file);
	return false;
};
oFF.XFileActionSave.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onFileSaved(extResult, data, this.m_content, customIdentifier);
};

oFF.VfsActionFetchChildren = function() {};
oFF.VfsActionFetchChildren.prototype = new oFF.DfFileAction();
oFF.VfsActionFetchChildren.prototype._ff_c = "VfsActionFetchChildren";

oFF.VfsActionFetchChildren.createAndRun = function(syncType, listener, customIdentifier, fileSystem, file, pathInfo)
{
	var object = new oFF.VfsActionFetchChildren();
	object.m_pathInfo = pathInfo;
	object.setData(file);
	object.setupActionAndRun(syncType, listener, customIdentifier, fileSystem);
	return object;
};
oFF.VfsActionFetchChildren.prototype.m_pathInfo = null;
oFF.VfsActionFetchChildren.prototype.processSynchronization = function(syncType)
{
	var file = this.getFile();
	var process = file.getProcess();
	var fileSystem = file.getFileSystem();
	var element = this.m_pathInfo.getElement();
	var type = element.getComponentType();
	var uri = file.getUri();
	if (type === oFF.VfsElementType.DIR)
	{
		var dir = element;
		var childElementList = dir.getChildElements();
		var fileList = oFF.XList.create();
		var childFile;
		var childName;
		var childUri;
		var childPathInfo;
		var size = childElementList.size();
		var childElement;
		for (var i = 0; i < size; i++)
		{
			childElement = childElementList.get(i);
			childName = childElement.getName();
			childUri = oFF.XUri.createChildFile(uri, childName);
			childPathInfo = fileSystem.getPathInfo(childUri.getPath());
			childFile = oFF.VfsFileProvider.createExt(process, fileSystem, childUri, childPathInfo, null, childElement);
			fileList.add(childFile);
		}
		file.setChildFiles(fileList, size);
	}
	else if (type === oFF.VfsElementType.MOUNT_POINT)
	{
		var mountPoint = this.m_pathInfo.getMountPoint();
		if (oFF.notNull(mountPoint))
		{
			var targetUri = mountPoint.calculateTargetUri(uri);
			var fileSystemManager = process.getFileSystemManager();
			fileSystemManager.processFetchFile(syncType, this, null, process, targetUri);
			return true;
		}
	}
	else
	{
		var childMetadata = this.m_pathInfo.getChildMetadata();
		file.setChildMetadata(childMetadata, -1);
	}
	this.addAllMessages(file);
	return false;
};
oFF.VfsActionFetchChildren.prototype.onFileFetched = function(extResult, file, customIdentifier)
{
	this.addAllMessages(extResult);
	if (extResult.isValid())
	{
		var targetFile = file;
		var myFile = this.getFile();
		myFile.setTargetMountFile(targetFile);
		targetFile.processProviderFetchChildren(this.getActiveSyncType(), this, null, null);
	}
	else
	{
		this.endSync();
	}
};
oFF.VfsActionFetchChildren.prototype.onChildrenFetched = function(extResult, file, children, resultset, customIdentifier)
{
	this.addAllMessages(file);
	if (extResult.isValid())
	{
		var myFile = this.getFile();
		myFile.setChildFiles(children, children.size());
	}
	this.endSync();
};
oFF.VfsActionFetchChildren.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onChildrenFetched(extResult, data, data.getCachedChildFiles(), data.getCachedChildrenResultset(), customIdentifier);
};

oFF.VfsFileProvider = function() {};
oFF.VfsFileProvider.prototype = new oFF.DfXFileProviderBlocking();
oFF.VfsFileProvider.prototype._ff_c = "VfsFileProvider";

oFF.VfsFileProvider.createExt = function(process, fileSystem, uri, pathInfo, metadata, element)
{
	var file = new oFF.VfsFileProvider();
	file.setupFileExt(process, fileSystem, uri, pathInfo, metadata, element);
	return file;
};
oFF.VfsFileProvider.prototype.m_nativePath = null;
oFF.VfsFileProvider.prototype.m_pathInfo = null;
oFF.VfsFileProvider.prototype.m_element = null;
oFF.VfsFileProvider.prototype.m_targetMountFile = null;
oFF.VfsFileProvider.prototype.setupFileExt = function(process, fs, uri, pathInfo, metadata, element)
{
	oFF.DfXFileProviderBlocking.prototype.setupFile.call( this , process, fs, uri);
	this.m_nativePath = uri.getPath();
	this.m_pathInfo = pathInfo;
	this.m_element = element;
	if (oFF.isNull(this.m_element) && oFF.notNull(this.m_pathInfo))
	{
		this.m_element = this.m_pathInfo.getElement();
	}
	var theMetadata = metadata;
	if (oFF.isNull(theMetadata))
	{
		if (oFF.notNull(this.m_element))
		{
			theMetadata = this.m_element.getMetadata();
		}
		else
		{
			theMetadata = oFF.PrStructure.create();
		}
	}
	this.setMetadata(theMetadata);
	this.writeDebugMessage("set up");
};
oFF.VfsFileProvider.prototype.getNativePath = function()
{
	return this.m_nativePath;
};
oFF.VfsFileProvider.prototype.getTargetMountFile = function()
{
	return this.m_targetMountFile;
};
oFF.VfsFileProvider.prototype.setTargetMountFile = function(file)
{
	this.m_targetMountFile = file;
};
oFF.VfsFileProvider.prototype.getAttributes = function()
{
	return this.getCachedMetadata();
};
oFF.VfsFileProvider.prototype.getFileType = function()
{
	var fileTypeValue = this.getCachedMetadata().getStringByKeyExt(oFF.XFileAttribute.FILE_TYPE.getName(), null);
	return oFF.XFileType.lookup(fileTypeValue);
};
oFF.VfsFileProvider.prototype.isDirectory = function()
{
	return this.getCachedMetadata().getBooleanByKeyExt(oFF.XFileAttribute.IS_DIRECTORY.getName(), false);
};
oFF.VfsFileProvider.prototype.isFile = function()
{
	return this.getCachedMetadata().getBooleanByKeyExt(oFF.XFileAttribute.IS_FILE.getName(), false);
};
oFF.VfsFileProvider.prototype.isExisting = function()
{
	return this.getCachedMetadata().getBooleanByKeyExt(oFF.XFileAttribute.IS_EXISTING.getName(), false);
};
oFF.VfsFileProvider.prototype.isHidden = function()
{
	return this.getCachedMetadata().getBooleanByKeyExt(oFF.XFileAttribute.IS_HIDDEN.getName(), false);
};
oFF.VfsFileProvider.prototype.getDescription = function()
{
	return this.getCachedMetadata().getStringByKeyExt(oFF.XFileAttribute.DESCRIPTION.getName(), null);
};
oFF.VfsFileProvider.prototype.getDisplayName = function()
{
	return this.getCachedMetadata().getStringByKeyExt(oFF.XFileAttribute.DISPLAY_NAME.getName(), null);
};
oFF.VfsFileProvider.prototype.supportsSetLastModified = function()
{
	return this.getCachedMetadata().getBooleanByKeyExt(oFF.XFileAttribute.SUPPORTS_SET_LAST_MODIFIED.getName(), false);
};
oFF.VfsFileProvider.prototype.getLastModifiedTimestamp = function()
{
	return this.getCachedMetadata().getLongByKeyExt(oFF.XFileAttribute.CHANGED_AT.getName(), 0);
};
oFF.VfsFileProvider.prototype.getSize = function()
{
	return this.getCachedMetadata().getLongByKeyExt(oFF.XFileAttribute.SIZE.getName(), 0);
};
oFF.VfsFileProvider.prototype.isWriteable = function()
{
	return this.getCachedMetadata().getBooleanByKeyExt(oFF.XFileAttribute.IS_WRITEABLE.getName(), false);
};
oFF.VfsFileProvider.prototype.setWritable = function(writable, ownerOnly) {};
oFF.VfsFileProvider.prototype.saveExt = function(content, compression)
{
	if (oFF.notNull(this.m_pathInfo))
	{
		this.m_pathInfo.saveExt(content, compression);
	}
	else
	{
		oFF.noSupport();
	}
};
oFF.VfsFileProvider.prototype.isReadable = function()
{
	return this.getCachedMetadata().getBooleanByKeyExt(oFF.XFileAttribute.IS_READABLE.getName(), false);
};
oFF.VfsFileProvider.prototype.loadExt = function(compression)
{
	var fileContent = this.m_pathInfo.loadExt(compression);
	this.setFileContent(fileContent);
	return fileContent;
};
oFF.VfsFileProvider.prototype.isExecutable = function()
{
	return this.getCachedMetadata().getBooleanByKeyExt(oFF.XFileAttribute.IS_EXECUTABLE.getName(), false);
};
oFF.VfsFileProvider.prototype.deleteFile = function()
{
	if (oFF.notNull(this.m_pathInfo))
	{
		this.m_pathInfo.deleteFile();
	}
	else
	{
		oFF.noSupport();
	}
};
oFF.VfsFileProvider.prototype.supportsRenameTo = function()
{
	this.writeDebugMessage("supports rename to");
	return false;
};
oFF.VfsFileProvider.prototype.renameTo = oFF.noSupport;
oFF.VfsFileProvider.prototype.processProviderRename = oFF.noSupport;
oFF.VfsFileProvider.prototype.mkdirExt = function(includeParentDirs)
{
	if (oFF.notNull(this.m_pathInfo))
	{
		this.m_pathInfo.mkdirExt(includeParentDirs);
	}
	else
	{
		oFF.noSupport();
	}
};
oFF.VfsFileProvider.prototype.processProviderFetchChildren = function(syncType, listener, customIdentifier, config)
{
	return oFF.VfsActionFetchChildren.createAndRun(syncType, listener, customIdentifier, this.getFileSystem(), this, this.m_pathInfo);
};
oFF.VfsFileProvider.prototype.getChildren = function()
{
	this.processFetchChildren(oFF.SyncType.BLOCKING, null, null, null);
	return this.getCachedChildFiles();
};

oFF.ProgramArgs = function() {};
oFF.ProgramArgs.prototype = new oFF.XObject();
oFF.ProgramArgs.prototype._ff_c = "ProgramArgs";

oFF.ProgramArgs.createWithString = function(argString)
{
	var startDef = new oFF.ProgramArgs();
	startDef.setup();
	startDef.setArgumentString(argString);
	return startDef;
};
oFF.ProgramArgs.createWithList = function(argList)
{
	var startDef = new oFF.ProgramArgs();
	startDef.setup();
	startDef.setArgumentList(argList);
	return startDef;
};
oFF.ProgramArgs.createWithStructure = function(argStructure)
{
	var startDef = new oFF.ProgramArgs();
	startDef.setup();
	startDef.setArgumentStructure(argStructure);
	return startDef;
};
oFF.ProgramArgs.create = function()
{
	var startDef = new oFF.ProgramArgs();
	startDef.setup();
	return startDef;
};
oFF.ProgramArgs.prototype.m_argString = null;
oFF.ProgramArgs.prototype.m_argList = null;
oFF.ProgramArgs.prototype.m_argStructure = null;
oFF.ProgramArgs.prototype.m_defaultArgStructure = null;
oFF.ProgramArgs.prototype.m_argObjs = null;
oFF.ProgramArgs.prototype.m_isArgumentStringOrigin = false;
oFF.ProgramArgs.prototype.m_isArgumentListOrigin = false;
oFF.ProgramArgs.prototype.m_isArgumentStructureOrigin = false;
oFF.ProgramArgs.prototype.m_argDefs = null;
oFF.ProgramArgs.prototype.setup = function()
{
	oFF.XObject.prototype.setup.call( this );
	this.m_argObjs = oFF.XHashMapByString.create();
};
oFF.ProgramArgs.prototype.releaseObject = function()
{
	this.m_argDefs = null;
	this.m_argString = null;
	this.m_argList = null;
	this.m_argStructure = null;
	this.m_defaultArgStructure = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.ProgramArgs.prototype.cloneExt = function(flags)
{
	var programArgs = oFF.ProgramArgs.create();
	programArgs.m_argString = this.m_argString;
	programArgs.m_argStructure = oFF.XObjectExt.cloneIfNotNull(this.m_argStructure);
	if (oFF.notNull(this.m_argList))
	{
		programArgs.m_argList = oFF.XListOfString.createFromReadOnlyList(this.m_argList);
	}
	oFF.XMapUtils.putAllObjects(this.m_argObjs, programArgs.m_argObjs);
	programArgs.m_isArgumentStringOrigin = this.m_isArgumentStringOrigin;
	programArgs.m_isArgumentListOrigin = this.m_isArgumentListOrigin;
	programArgs.m_isArgumentStructureOrigin = this.m_isArgumentStructureOrigin;
	programArgs.m_defaultArgStructure = this.m_defaultArgStructure;
	programArgs.m_argDefs = this.m_argDefs;
	return programArgs;
};
oFF.ProgramArgs.prototype.setArgumentString = function(argString)
{
	this.m_argString = argString;
	this.m_isArgumentStringOrigin = true;
};
oFF.ProgramArgs.prototype.getArgumentString = function()
{
	return this.m_argString;
};
oFF.ProgramArgs.prototype.setArgumentList = function(argList)
{
	this.m_argList = argList;
	this.m_isArgumentListOrigin = true;
};
oFF.ProgramArgs.prototype.getArgumentList = function()
{
	if (oFF.isNull(this.m_argList) && oFF.notNull(this.m_argString))
	{
		this.m_argList = oFF.ProgramUtils.createArgValueList(this.m_argString);
	}
	if (oFF.isNull(this.m_argList))
	{
		this.m_argList = oFF.XListOfString.create();
	}
	return this.m_argList;
};
oFF.ProgramArgs.prototype.setArgumentStructure = function(argStructure)
{
	this.m_argStructure = argStructure;
	this.m_isArgumentStructureOrigin = true;
};
oFF.ProgramArgs.prototype.getArgumentStructure = function()
{
	if (oFF.isNull(this.m_argStructure) && oFF.notNull(this.m_argDefs))
	{
		var initArgumentsList = this.getArgumentList();
		if (oFF.notNull(initArgumentsList))
		{
			this.m_argStructure = oFF.ProgramUtils.createArgStructureFromList(this.m_argDefs, initArgumentsList, 0);
		}
	}
	if (oFF.isNull(this.m_argStructure))
	{
		this.m_argStructure = oFF.PrFactory.createStructure();
	}
	return this.m_argStructure;
};
oFF.ProgramArgs.prototype.getDefaultArgumentStructure = function()
{
	return this.m_defaultArgStructure;
};
oFF.ProgramArgs.prototype.setDefaultArgumentStructure = function(defaultArgStructure)
{
	this.m_defaultArgStructure = defaultArgStructure;
};
oFF.ProgramArgs.prototype.setArgumentDefinitions = function(argDefs)
{
	this.m_argDefs = argDefs;
};
oFF.ProgramArgs.prototype.getArgumentDefinitions = function()
{
	return this.m_argDefs;
};
oFF.ProgramArgs.prototype.isArgumentStringOrigin = function()
{
	return this.m_isArgumentStringOrigin;
};
oFF.ProgramArgs.prototype.isArgumentListOrigin = function()
{
	return this.m_isArgumentListOrigin;
};
oFF.ProgramArgs.prototype.isArgumentStructureOrigin = function()
{
	return this.m_isArgumentStructureOrigin;
};
oFF.ProgramArgs.prototype.convertToStructure = function()
{
	this.getArgumentStructure();
	this.m_isArgumentStringOrigin = false;
	this.m_isArgumentListOrigin = false;
	this.m_isArgumentStructureOrigin = true;
};
oFF.ProgramArgs.prototype.getStringByKey = function(name)
{
	return this.getStringByKeyExt(name, null);
};
oFF.ProgramArgs.prototype.getStringByKeyExt = function(name, defaultValue)
{
	var value = defaultValue;
	var argumentStructure = this.getArgumentStructure();
	if (argumentStructure.containsKey(name))
	{
		value = argumentStructure.getStringByKeyExt(name, defaultValue);
	}
	else if (oFF.notNull(this.m_defaultArgStructure) && this.m_defaultArgStructure.containsKey(name))
	{
		value = this.m_defaultArgStructure.getStringByKeyExt(name, defaultValue);
	}
	return value;
};
oFF.ProgramArgs.prototype.getBooleanByKey = function(name)
{
	return this.getBooleanByKeyExt(name, false);
};
oFF.ProgramArgs.prototype.getBooleanByKeyExt = function(name, defaultValue)
{
	var value = defaultValue;
	var argumentStructure = this.getArgumentStructure();
	if (argumentStructure.containsKey(name))
	{
		value = argumentStructure.getBooleanByKeyExt(name, true);
	}
	else if (oFF.notNull(this.m_defaultArgStructure) && this.m_defaultArgStructure.containsKey(name))
	{
		value = this.m_defaultArgStructure.getBooleanByKeyExt(name, true);
	}
	return value;
};
oFF.ProgramArgs.prototype.getIntegerByKey = function(name)
{
	return this.getIntegerByKeyExt(name, -1);
};
oFF.ProgramArgs.prototype.getIntegerByKeyExt = function(name, defaultValue)
{
	var value = defaultValue;
	var argumentStructure = this.getArgumentStructure();
	if (argumentStructure.containsKey(name))
	{
		value = argumentStructure.getIntegerByKeyExt(name, defaultValue);
	}
	else if (oFF.notNull(this.m_defaultArgStructure) && this.m_defaultArgStructure.containsKey(name))
	{
		value = this.m_defaultArgStructure.getIntegerByKeyExt(name, defaultValue);
	}
	return value;
};
oFF.ProgramArgs.prototype.getLongByKey = function(name)
{
	return this.getLongByKeyExt(name, -1);
};
oFF.ProgramArgs.prototype.getLongByKeyExt = function(name, defaultValue)
{
	var value = defaultValue;
	var argumentStructure = this.getArgumentStructure();
	if (argumentStructure.containsKey(name))
	{
		value = argumentStructure.getLongByKeyExt(name, defaultValue);
	}
	else if (oFF.notNull(this.m_defaultArgStructure) && this.m_defaultArgStructure.containsKey(name))
	{
		value = this.m_defaultArgStructure.getLongByKeyExt(name, defaultValue);
	}
	return value;
};
oFF.ProgramArgs.prototype.getDoubleByKey = function(name)
{
	return this.getDoubleByKeyExt(name, 0.0);
};
oFF.ProgramArgs.prototype.getDoubleByKeyExt = function(name, defaultValue)
{
	var value = defaultValue;
	var argumentStructure = this.getArgumentStructure();
	if (argumentStructure.containsKey(name))
	{
		value = argumentStructure.getDoubleByKeyExt(name, defaultValue);
	}
	else if (oFF.notNull(this.m_defaultArgStructure) && this.m_defaultArgStructure.containsKey(name))
	{
		value = this.m_defaultArgStructure.getDoubleByKeyExt(name, defaultValue);
	}
	return value;
};
oFF.ProgramArgs.prototype.getStructureByKey = function(name)
{
	var argumentStructure = this.getArgumentStructure();
	var value = argumentStructure.getStructureByKey(name);
	if (oFF.isNull(value) && oFF.notNull(this.m_defaultArgStructure))
	{
		value = this.m_defaultArgStructure.getStructureByKey(name);
	}
	return value;
};
oFF.ProgramArgs.prototype.getListByKey = function(name)
{
	var argumentStructure = this.getArgumentStructure();
	var value = argumentStructure.getListByKey(name);
	if (oFF.isNull(value) && oFF.notNull(this.m_defaultArgStructure))
	{
		value = this.m_defaultArgStructure.getListByKey(name);
	}
	return value;
};
oFF.ProgramArgs.prototype.getByKey = function(key)
{
	var argumentStructure = this.getArgumentStructure();
	var value = argumentStructure.getByKey(key);
	if (oFF.isNull(value) && oFF.notNull(this.m_defaultArgStructure))
	{
		value = this.m_defaultArgStructure.getByKey(key);
	}
	return value;
};
oFF.ProgramArgs.prototype.getXObjectByKey = function(name)
{
	return this.getXObjectByKeyExt(name, null);
};
oFF.ProgramArgs.prototype.getXObjectByKeyExt = function(name, defaultValue)
{
	var result = defaultValue;
	if (this.m_argObjs.containsKey(name) === true)
	{
		result = this.m_argObjs.getByKey(name);
	}
	return result;
};
oFF.ProgramArgs.prototype.hasNullByKey = function(name)
{
	var argumentStructure = this.getArgumentStructure();
	var value = argumentStructure.hasNullByKey(name);
	if (value === false && oFF.notNull(this.m_defaultArgStructure))
	{
		value = this.m_defaultArgStructure.hasNullByKey(name);
	}
	return value;
};
oFF.ProgramArgs.prototype.putString = function(name, stringValue)
{
	var argumentStructure = this.getArgumentStructure();
	argumentStructure.putString(name, stringValue);
};
oFF.ProgramArgs.prototype.putStringNotNull = function(name, stringValue)
{
	var argumentStructure = this.getArgumentStructure();
	argumentStructure.putStringNotNull(name, stringValue);
};
oFF.ProgramArgs.prototype.putStringNotNullAndNotEmpty = function(name, stringValue)
{
	var argumentStructure = this.getArgumentStructure();
	argumentStructure.putStringNotNullAndNotEmpty(name, stringValue);
};
oFF.ProgramArgs.prototype.putBoolean = function(key, booleanValue)
{
	var argumentStructure = this.getArgumentStructure();
	argumentStructure.putBoolean(key, booleanValue);
};
oFF.ProgramArgs.prototype.putInteger = function(name, intValue)
{
	var argumentStructure = this.getArgumentStructure();
	argumentStructure.putInteger(name, intValue);
};
oFF.ProgramArgs.prototype.putLong = function(name, longValue)
{
	var argumentStructure = this.getArgumentStructure();
	argumentStructure.putLong(name, longValue);
};
oFF.ProgramArgs.prototype.putDouble = function(name, doubleValue)
{
	var argumentStructure = this.getArgumentStructure();
	argumentStructure.putDouble(name, doubleValue);
};
oFF.ProgramArgs.prototype.remove = function(key)
{
	var argumentStructure = this.getArgumentStructure();
	return argumentStructure.remove(key);
};
oFF.ProgramArgs.prototype.clear = function()
{
	var argumentStructure = this.getArgumentStructure();
	argumentStructure.clear();
};
oFF.ProgramArgs.prototype.putNewList = function(name)
{
	var argumentStructure = this.getArgumentStructure();
	return argumentStructure.putNewList(name);
};
oFF.ProgramArgs.prototype.putNewStructure = function(name)
{
	var argumentStructure = this.getArgumentStructure();
	return argumentStructure.putNewStructure(name);
};
oFF.ProgramArgs.prototype.putXObject = function(name, objValue)
{
	this.m_argObjs.put(name, objValue);
};
oFF.ProgramArgs.prototype.putNull = function(name)
{
	var argumentStructure = this.getArgumentStructure();
	argumentStructure.putNull(name);
};
oFF.ProgramArgs.prototype.containsKey = function(key)
{
	var keys = this.mergeKeys();
	return keys.contains(key);
};
oFF.ProgramArgs.prototype.getKeysAsReadOnlyListOfString = function()
{
	var keys = this.mergeKeys();
	return keys.getValuesAsReadOnlyListOfString();
};
oFF.ProgramArgs.prototype.getKeysAsIteratorOfString = function()
{
	var keys = this.mergeKeys();
	return keys.getIterator();
};
oFF.ProgramArgs.prototype.size = function()
{
	var keys = this.mergeKeys();
	return keys.size();
};
oFF.ProgramArgs.prototype.isEmpty = function()
{
	var keys = this.mergeKeys();
	return keys.isEmpty();
};
oFF.ProgramArgs.prototype.hasElements = function()
{
	var keys = this.mergeKeys();
	return keys.hasElements();
};
oFF.ProgramArgs.prototype.mergeKeys = function()
{
	var keys = oFF.XHashSetOfString.create();
	if (oFF.notNull(this.m_defaultArgStructure))
	{
		keys.addAll(this.m_defaultArgStructure.getKeysAsReadOnlyListOfString());
	}
	keys.addAll(this.getArgumentStructure().getKeysAsReadOnlyListOfString());
	return keys;
};

oFF.ProgramExitValues = function() {};
oFF.ProgramExitValues.prototype = new oFF.XObject();
oFF.ProgramExitValues.prototype._ff_c = "ProgramExitValues";

oFF.ProgramExitValues.create = function()
{
	var newObj = new oFF.ProgramExitValues();
	newObj.setup();
	return newObj;
};
oFF.ProgramExitValues.prototype.m_statusCode = 0;
oFF.ProgramExitValues.prototype.m_statusCodeDetails = null;
oFF.ProgramExitValues.prototype.m_exitObject = null;
oFF.ProgramExitValues.prototype.m_exitContent = null;
oFF.ProgramExitValues.prototype.m_properties = null;
oFF.ProgramExitValues.prototype.m_objectMap = null;
oFF.ProgramExitValues.prototype.setup = function()
{
	this.m_objectMap = oFF.XHashMapByString.create();
	this.m_properties = oFF.XProperties.create();
};
oFF.ProgramExitValues.prototype.releaseObject = function()
{
	this.m_objectMap = null;
	this.m_properties = null;
	this.m_exitObject = null;
	this.m_statusCode = 0;
};
oFF.ProgramExitValues.prototype.getStatusCode = function()
{
	return this.m_statusCode;
};
oFF.ProgramExitValues.prototype.setStatusCode = function(statusCode)
{
	this.m_statusCode = statusCode;
};
oFF.ProgramExitValues.prototype.getStatusCodeDetails = function()
{
	return this.m_statusCodeDetails;
};
oFF.ProgramExitValues.prototype.setStatusCodeDetails = function(details)
{
	this.m_statusCodeDetails = details;
};
oFF.ProgramExitValues.prototype.getExitObject = function()
{
	return this.m_exitObject;
};
oFF.ProgramExitValues.prototype.setExitObject = function(exitObject)
{
	this.m_exitObject = exitObject;
};
oFF.ProgramExitValues.prototype.getStringByKey = function(name)
{
	return this.m_properties.getStringByKey(name);
};
oFF.ProgramExitValues.prototype.getStringByKeyExt = function(name, defaultValue)
{
	return this.m_properties.getStringByKeyExt(name, defaultValue);
};
oFF.ProgramExitValues.prototype.getIntegerByKey = function(name)
{
	return this.m_properties.getIntegerByKey(name);
};
oFF.ProgramExitValues.prototype.getIntegerByKeyExt = function(name, defaultValue)
{
	return this.m_properties.getIntegerByKeyExt(name, defaultValue);
};
oFF.ProgramExitValues.prototype.getLongByKey = function(name)
{
	return this.m_properties.getLongByKey(name);
};
oFF.ProgramExitValues.prototype.getLongByKeyExt = function(name, defaultValue)
{
	return this.m_properties.getLongByKeyExt(name, defaultValue);
};
oFF.ProgramExitValues.prototype.getDoubleByKey = function(name)
{
	return this.m_properties.getDoubleByKey(name);
};
oFF.ProgramExitValues.prototype.getDoubleByKeyExt = function(name, defaultValue)
{
	return this.m_properties.getDoubleByKeyExt(name, defaultValue);
};
oFF.ProgramExitValues.prototype.getBooleanByKey = function(name)
{
	return this.m_properties.getBooleanByKey(name);
};
oFF.ProgramExitValues.prototype.getBooleanByKeyExt = function(name, defaultValue)
{
	return this.m_properties.getBooleanByKeyExt(name, defaultValue);
};
oFF.ProgramExitValues.prototype.hasNullByKey = function(name)
{
	return this.m_properties.hasNullByKey(name);
};
oFF.ProgramExitValues.prototype.putString = function(name, stringValue)
{
	this.m_properties.putString(name, stringValue);
};
oFF.ProgramExitValues.prototype.putStringNotNull = function(name, stringValue)
{
	this.m_properties.putStringNotNull(name, stringValue);
};
oFF.ProgramExitValues.prototype.putStringNotNullAndNotEmpty = function(name, stringValue)
{
	this.m_properties.putStringNotNullAndNotEmpty(name, stringValue);
};
oFF.ProgramExitValues.prototype.putInteger = function(name, intValue)
{
	this.m_properties.putInteger(name, intValue);
};
oFF.ProgramExitValues.prototype.putLong = function(name, longValue)
{
	this.m_properties.putLong(name, longValue);
};
oFF.ProgramExitValues.prototype.putDouble = function(name, doubleValue)
{
	this.m_properties.putDouble(name, doubleValue);
};
oFF.ProgramExitValues.prototype.putBoolean = function(key, booleanValue)
{
	this.m_properties.putBoolean(key, booleanValue);
};
oFF.ProgramExitValues.prototype.putNull = function(name)
{
	this.m_properties.putNull(name);
};
oFF.ProgramExitValues.prototype.getXObjectByKey = function(name)
{
	return this.m_objectMap.getByKey(name);
};
oFF.ProgramExitValues.prototype.getXObjectByKeyExt = function(name, defaultValue)
{
	var retValue = defaultValue;
	if (this.m_objectMap.containsKey(name))
	{
		retValue = this.m_objectMap.getByKey(name);
	}
	return retValue;
};
oFF.ProgramExitValues.prototype.putXObject = function(name, objValue)
{
	this.m_objectMap.put(name, objValue);
};
oFF.ProgramExitValues.prototype.getExitContent = function()
{
	return this.m_exitContent;
};
oFF.ProgramExitValues.prototype.setExitContent = function(content)
{
	this.m_exitContent = content;
};
oFF.ProgramExitValues.prototype.containsKey = oFF.noSupport;
oFF.ProgramExitValues.prototype.getKeysAsReadOnlyListOfString = oFF.noSupport;
oFF.ProgramExitValues.prototype.getKeysAsIteratorOfString = oFF.noSupport;
oFF.ProgramExitValues.prototype.size = oFF.noSupport;
oFF.ProgramExitValues.prototype.isEmpty = oFF.noSupport;
oFF.ProgramExitValues.prototype.hasElements = oFF.noSupport;
oFF.ProgramExitValues.prototype.getStructureByKey = oFF.noSupport;
oFF.ProgramExitValues.prototype.getListByKey = oFF.noSupport;
oFF.ProgramExitValues.prototype.remove = oFF.noSupport;
oFF.ProgramExitValues.prototype.clear = oFF.noSupport;
oFF.ProgramExitValues.prototype.putNewList = oFF.noSupport;
oFF.ProgramExitValues.prototype.putNewStructure = oFF.noSupport;
oFF.ProgramExitValues.prototype.getByKey = oFF.noSupport;

oFF.PrgExecuteAction = function() {};
oFF.PrgExecuteAction.prototype = new oFF.XFileActionExecute();
oFF.PrgExecuteAction.prototype._ff_c = "PrgExecuteAction";

oFF.PrgExecuteAction.create = function(session, file)
{
	var newObj = new oFF.PrgExecuteAction();
	newObj.setupSessionContext(session);
	newObj.setData(file);
	return newObj;
};

oFF.KernelImplModule = function() {};
oFF.KernelImplModule.prototype = new oFF.DfModule();
oFF.KernelImplModule.prototype._ff_c = "KernelImplModule";

oFF.KernelImplModule.s_module = null;
oFF.KernelImplModule.getInstance = function()
{
	if (oFF.isNull(oFF.KernelImplModule.s_module))
	{
		oFF.DfModule.checkInitialized(oFF.KernelApiBaseModule.getInstance());
		oFF.KernelImplModule.s_module = oFF.DfModule.startExt(new oFF.KernelImplModule());
		oFF.ProgramArgumentType.staticSetup();
		oFF.ProgramArgument.setupDefaultArguments();
		oFF.RpcFunctionFactory.staticSetupFunctionFactory();
		oFF.ProgramContainerFactory.staticSetup();
		oFF.ProgramRegistration.staticSetup();
		oFF.ModuleManager.staticSetup();
		oFF.ModuleLoaderDummy.staticSetup();
		oFF.ModuleResources.staticSetup();
		oFF.ProgramResources.staticSetup();
		oFF.SigSelManager.staticSetup();
		oFF.Kernel.staticSetup();
		oFF.VfsMatchResultType.staticSetup();
		oFF.VfsElementType.staticSetupVfsComponentType();
		oFF.XCacheProviderBasicFactory.staticSetup();
		oFF.HttpFileFactory.staticSetup();
		oFF.XFileSystemFactory.staticSetupFactory();
		oFF.XHttpFileSystemFactory.staticSetup();
		oFF.XWebDAVFactory.staticSetup();
		oFF.SubSysUserProfileBootstrapFactory.staticSetup();
		oFF.SubSysCredentialsProviderBootstrapFactory.staticSetup();
		oFF.ProgramRegistration.setProgramFactory(new oFF.SubSysSystemLandscapePrg());
		oFF.ProgramRegistration.setProgramFactory(new oFF.SubSysUserProfilePrg());
		oFF.ProgramRegistration.setProgramFactory(new oFF.SubSysCachePrg());
		oFF.ProgramRegistration.setProgramFactory(new oFF.SubSysLiteCredentialsProviderPrg());
		oFF.ProgramRegistration.setProgramFactory(new oFF.SubSysSharedServersPrg());
		oFF.DfModule.stopExt(oFF.KernelImplModule.s_module);
	}
	return oFF.KernelImplModule.s_module;
};
oFF.KernelImplModule.prototype.getName = function()
{
	return "ff1030.kernel.impl";
};

oFF.KernelImplModule.getInstance();

return sap.firefly;
	} );