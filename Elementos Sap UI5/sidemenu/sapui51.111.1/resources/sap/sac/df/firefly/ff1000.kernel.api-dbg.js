/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
[
"sap/sac/df/firefly/ff0230.io.ext"
],
function(oFF)
{
"use strict";

oFF.InAMergeProcessorFactory = function() {};
oFF.InAMergeProcessorFactory.prototype = new oFF.XObject();
oFF.InAMergeProcessorFactory.prototype._ff_c = "InAMergeProcessorFactory";

oFF.InAMergeProcessorFactory.s_factory = null;
oFF.InAMergeProcessorFactory.registerFactory = function(factory)
{
	oFF.InAMergeProcessorFactory.s_factory = factory;
};
oFF.InAMergeProcessorFactory.createInAMergeProcessor = function(connectionPool)
{
	var factory = oFF.InAMergeProcessorFactory.s_factory;
	var newObject = null;
	if (oFF.notNull(connectionPool))
	{
		if (oFF.notNull(factory) && connectionPool.getInAMergeProcessor() === null)
		{
			newObject = factory.newInAMergeProcessor(connectionPool);
		}
	}
	return newObject;
};

oFF.ConnectionParameters = {

	ALIAS:"ALIAS",
	AUTHENTICATION_TYPE:"AUTHENTICATION_TYPE",
	AUTHENTICATION_TYPE__BASIC:"BASIC",
	AUTHENTICATION_TYPE__NONE:"NONE",
	AUTHENTICATION_TYPE__BEARER:"BEARER",
	AUTHENTICATION_TYPE__SAML_WITH_PASSWORD:"SAML_WITH_PASSWORD",
	CONTENT_TYPE:"CONTENT_TYPE",
	PROTOCOL:"PROTOCOL",
	PROTOCOL_HTTP:"HTTP",
	PROTOCOL_HTTPS:"HTTPS",
	PROTOCOL_FILE:"FILE",
	APP_PROTOCOL_CIP:"CIP",
	APP_PROTOCOL_INA:"INA",
	APP_PROTOCOL_RSR:"RSR",
	APP_PROTOCOL_INA2:"INA2",
	APP_PROTOCOL_SQL:"SQL",
	HOST:"HOST",
	SECURE:"SECURE",
	URL:"URL",
	PASSWORD:"PASSWORD",
	TOKEN_VALUE:"TOKEN_VALUE",
	PORT:"PORT",
	PATH:"PATH",
	CLIENT:"CLIENT",
	WEBDISPATCHER_URI:"WEBDISPATCHER_URI",
	PREFLIGHT:"PREFLIGHT",
	PREFIX:"PREFIX",
	PROXY_HOST:"PROXY_HOST",
	PROXY_PORT:"PROXY_PORT",
	PROXY_TYPE:"PROXY_TYPE",
	PROXY_AUTHORIZATION:"PROXY_AUTHORIZATION",
	USER:"USER",
	SYSTEM_TYPE:"SYSTEM_TYPE",
	SYSTYPE:"SYSTYPE",
	ORIGIN:"ORIGIN",
	NAME:"NAME",
	DESCRIPTION:"DESCRIPTION",
	TIMEOUT:"TIMEOUT",
	IS_CSRF_REQUIRED:"IS_CSRF_REQUIRED",
	IS_CONTEXT_ID_REQUIRED:"IS_CONTEXT_ID_REQUIRED",
	KEEP_ALIVE_INTERVAL:"KEEP_ALIVE_INTERVAL",
	KEEP_ALIVE_DELAY:"KEEP_ALIVE_DELAY",
	LANGUAGE:"LANGUAGE",
	EQS_PATTERNS:"EQS_PATTERNS",
	TAGS:"TAGS",
	SESSION_CARRIER_TYPE:"SESSION_CARRIER_TYPE",
	CORRELATION_ID_ACTIVE:"CORRELATION_ID_ACTIVE",
	SAP_PASSPORT_ACTIVE:"SAP_PASSPORT_ACTIVE",
	ENABLE_TESTS:"ENABLE_TESTS",
	ENFORCE_TESTS:"ENFORCE_TESTS",
	X509CERTIFICATE:"X509CERTIFICATE",
	SECURE_LOGIN_PROFILE:"SECURE_LOGIN_PROFILE",
	SQL_DRIVER_JAVA:"SQL_DRIVER_JAVA",
	SQL_CONNECT_JAVA:"SQL_CONNECT_JAVA",
	MAPPING_SYSTEM_NAME:"MAPPING_SYSTEM_NAME",
	MAPPINGS:"MAPPINGS",
	CONTEXTS:"CONTEXTS",
	DEFINITION:"definition",
	SCC_VIRTUAL_HOST:"sccVirtualHost",
	SCC_PORT:"sccPort",
	MAPPING_SERIALIZATION_TABLE:"MAPPING_SERIALIZE_TABLE",
	MAPPING_SERIALIZATION_SCHEMA:"MAPPING_SERIALIZE_SCHEMA",
	MAPPING_DESERIALIZATION_TABLE:"MAPPING_DESERIALIZE_TABLE",
	MAPPING_DESERIALIZATION_SCHEMA:"MAPPING_DESERIALIZE_SCHEMA",
	ORGANIZATION_TOKEN:"ORGANIZATION",
	ELEMENT_TOKEN:"ELEMENT",
	USER_TOKEN:"USER_TOKEN",
	TENANT_ID:"TENANT_ID",
	TENANT_ROOT_PACKAGE:"TENANT_ROOT_PACKAGE",
	INTERNAL_USER:"INTERNAL_USER",
	ASSOCIATED_HANA_SYSTEM:"ASSOCIATED_HANA_SYSTEM",
	CACHE_HINTS_ENABLED:"CACHE_HINTS_ENABLED",
	CACHE_HINT_LEAVE_THROUGH:"CACHE_HINT_LEAVE_THROUGH",
	OEM_APPLICATION_ID:"OEM_APPLICATION_ID",
	IS_CONNECTED:"IS_CONNECTED",
	IS_X_AUTHORIZATION_REQUIRED:"IS_X_AUTHORIZATION_REQUIRED",
	FPA_CREATED_AT:"FPA_CREATED_AT",
	FPA_MODIFIED_AT:"FPA_MODIFIED_AT",
	FPA_CREATED_BY:"FPA_CREATED_BY",
	FPA_AUTHENTICATION_METHOD:"FPA_AUTHENTICATION_METHOD",
	FPA_IS_CONNECTED:"FPA_IS_CONNECTED",
	FPA_IS_NEED_CREDENTIAL:"FPA_IS_NEED_CREDENTIAL",
	FPA_CONNECTION_TYPE:"FPA_CONNECTION_TYPE",
	FPA_KEEP_ALIVE_INTERVAL:"FPA_KEEP_ALIVE_INTERVAL"
};

oFF.ServerService = {

	ANALYTIC:"Analytics",
	BWMASTERDATA:"BWMasterData",
	MASTERDATA:"Masterdata",
	MODEL_PERSISTENCY:"ModelPersistence",
	PLANNING:"Planning",
	VALUE_HELP:"ValueHelp",
	WORKSPACE:"Workspace",
	HIERARCHY_MEMBER:"HierarchyMember",
	CATALOG:"Catalog",
	INA:"InA",
	LIST_REPORTING:"ListReporting",
	DIMENSION_EXTENSION:"ffs4DimensionExtension",
	DOCUMENTS:"Documents"
};

oFF.RpcFunctionFactory = function() {};
oFF.RpcFunctionFactory.prototype = new oFF.XObject();
oFF.RpcFunctionFactory.prototype._ff_c = "RpcFunctionFactory";

oFF.RpcFunctionFactory.s_factoryByProtocol = null;
oFF.RpcFunctionFactory.s_factoryBySystemType = null;
oFF.RpcFunctionFactory.s_defaultFactory = null;
oFF.RpcFunctionFactory.staticSetupFunctionFactory = function()
{
	oFF.RpcFunctionFactory.s_factoryByProtocol = oFF.XHashMapByString.create();
	oFF.RpcFunctionFactory.s_factoryBySystemType = oFF.XHashMapByString.create();
};
oFF.RpcFunctionFactory.registerDefaultFactory = function(factory)
{
	oFF.RpcFunctionFactory.s_defaultFactory = factory;
};
oFF.RpcFunctionFactory.registerFactory = function(protocolType, systemType, factory)
{
	if (oFF.notNull(protocolType))
	{
		oFF.RpcFunctionFactory.s_factoryByProtocol.put(protocolType.getName(), factory);
	}
	if (oFF.notNull(systemType))
	{
		oFF.RpcFunctionFactory.s_factoryBySystemType.put(systemType.getName(), factory);
	}
};
oFF.RpcFunctionFactory.create = function(context, name, systemType, protocolType)
{
	var factory = null;
	if (oFF.notNull(systemType))
	{
		factory = oFF.RpcFunctionFactory.s_factoryBySystemType.getByKey(systemType.getName());
	}
	if (oFF.isNull(factory))
	{
		factory = oFF.RpcFunctionFactory.s_factoryByProtocol.getByKey(protocolType.getName());
	}
	if (oFF.isNull(factory))
	{
		factory = oFF.RpcFunctionFactory.s_defaultFactory;
	}
	var result = null;
	if (oFF.notNull(factory))
	{
		result = factory.newRpcFunction(context, name, systemType, protocolType);
	}
	return result;
};

oFF.ProcessEntity = {

	OLAP_ENVIRONMENT:"olap.OlapEnvironment",
	APPLICATION:"rt.Application",
	CONNECTION_POOL:"rt.ConnectionPool",
	CREDENTIALS_PROVIDER:"rt.CredentialsProvider",
	DATA_PROVIDER_POOL:"rt.DataProviderPool",
	GUI:"rt.Gui",
	SYSTEM_LANDSCAPE:"rt.SystemLandscape",
	SUB_SYSTEM:"rt.SubSystem",
	CACHE_PROVIDER:"rt.CacheProvider"
};

oFF.XFileFilterType = function() {};
oFF.XFileFilterType.prototype = new oFF.XConstant();
oFF.XFileFilterType.prototype._ff_c = "XFileFilterType";

oFF.XFileFilterType.EXACT = null;
oFF.XFileFilterType.ASTERISK = null;
oFF.XFileFilterType.NOT = null;
oFF.XFileFilterType.s_lookup = null;
oFF.XFileFilterType.staticSetup = function()
{
	oFF.XFileFilterType.s_lookup = oFF.XHashMapByString.create();
	oFF.XFileFilterType.EXACT = oFF.XFileFilterType.create("Exact");
	oFF.XFileFilterType.ASTERISK = oFF.XFileFilterType.create("Asterisk");
	oFF.XFileFilterType.NOT = oFF.XFileFilterType.create("Not");
};
oFF.XFileFilterType.create = function(name)
{
	var type = new oFF.XFileFilterType();
	type.setupConstant(name);
	oFF.XFileFilterType.s_lookup.put(name, type);
	return type;
};
oFF.XFileFilterType.lookup = function(name)
{
	return oFF.XFileFilterType.s_lookup.getByKey(name);
};

oFF.InAMergeProcessingMode = function() {};
oFF.InAMergeProcessingMode.prototype = new oFF.XConstant();
oFF.InAMergeProcessingMode.prototype._ff_c = "InAMergeProcessingMode";

oFF.InAMergeProcessingMode.MERGE_EXECUTE = null;
oFF.InAMergeProcessingMode.MERGE_PERSIST = null;
oFF.InAMergeProcessingMode.EXECUTE_PERSISTED = null;
oFF.InAMergeProcessingMode.staticSetup = function()
{
	oFF.InAMergeProcessingMode.MERGE_EXECUTE = oFF.InAMergeProcessingMode.create("MergeAndExecute");
	oFF.InAMergeProcessingMode.MERGE_PERSIST = oFF.InAMergeProcessingMode.create("MergeAndPersist");
	oFF.InAMergeProcessingMode.EXECUTE_PERSISTED = oFF.InAMergeProcessingMode.create("ExecutePersisted");
};
oFF.InAMergeProcessingMode.create = function(name)
{
	var newConstant = oFF.XConstant.setupName(new oFF.InAMergeProcessingMode(), name);
	return newConstant;
};

oFF.ServiceApiLevel = function() {};
oFF.ServiceApiLevel.prototype = new oFF.XConstant();
oFF.ServiceApiLevel.prototype._ff_c = "ServiceApiLevel";

oFF.ServiceApiLevel.BOOTSTRAP = null;
oFF.ServiceApiLevel.READ_ONLY = null;
oFF.ServiceApiLevel.PERSONALIZATION = null;
oFF.ServiceApiLevel.staticSetup = function()
{
	oFF.ServiceApiLevel.BOOTSTRAP = oFF.ServiceApiLevel.create("Bootstrap", 0);
	oFF.ServiceApiLevel.READ_ONLY = oFF.ServiceApiLevel.create("UserProfile", 1);
	oFF.ServiceApiLevel.PERSONALIZATION = oFF.ServiceApiLevel.create("BootstrapLandscape", 2);
};
oFF.ServiceApiLevel.create = function(name, level)
{
	var type = new oFF.ServiceApiLevel();
	type._setupInternal(name);
	type.m_level = level;
	return type;
};
oFF.ServiceApiLevel.prototype.m_level = 0;
oFF.ServiceApiLevel.prototype.getLevel = function()
{
	return this.m_level;
};

oFF.ResourceType = function() {};
oFF.ResourceType.prototype = new oFF.XConstant();
oFF.ResourceType.prototype._ff_c = "ResourceType";

oFF.ResourceType.JAVASCRIPT = null;
oFF.ResourceType.CSS = null;
oFF.ResourceType.CONTAINER = null;
oFF.ResourceType.MODULE_REF = null;
oFF.ResourceType.MODULE = null;
oFF.ResourceType.PROGRAM = null;
oFF.ResourceType.staticSetup = function()
{
	oFF.ResourceType.JAVASCRIPT = oFF.XConstant.setupName(new oFF.ResourceType(), "Javascript");
	oFF.ResourceType.CSS = oFF.XConstant.setupName(new oFF.ResourceType(), "Css");
	oFF.ResourceType.MODULE = oFF.XConstant.setupName(new oFF.ResourceType(), "Module");
	oFF.ResourceType.MODULE_REF = oFF.XConstant.setupName(new oFF.ResourceType(), "ModuleRef");
	oFF.ResourceType.CONTAINER = oFF.XConstant.setupName(new oFF.ResourceType(), "Container");
	oFF.ResourceType.PROGRAM = oFF.XConstant.setupName(new oFF.ResourceType(), "Program");
};

oFF.SystemRole = function() {};
oFF.SystemRole.prototype = new oFF.XConstant();
oFF.SystemRole.prototype._ff_c = "SystemRole";

oFF.SystemRole.MASTER = null;
oFF.SystemRole.DATA_PROVIDER = null;
oFF.SystemRole.REPOSITORY = null;
oFF.SystemRole.USER_MANAGEMENT = null;
oFF.SystemRole.SYSTEM_LANDSCAPE = null;
oFF.SystemRole.PRIMARY_BLENDING_HOST = null;
oFF.SystemRole.s_roles = null;
oFF.SystemRole.s_lookup = null;
oFF.SystemRole.staticSetup = function()
{
	oFF.SystemRole.s_roles = oFF.XList.create();
	oFF.SystemRole.s_lookup = oFF.XHashMapByString.create();
	oFF.SystemRole.MASTER = oFF.SystemRole.create("Master");
	oFF.SystemRole.DATA_PROVIDER = oFF.SystemRole.create("DataProvider");
	oFF.SystemRole.REPOSITORY = oFF.SystemRole.create("Repository");
	oFF.SystemRole.USER_MANAGEMENT = oFF.SystemRole.create("UserManagement");
	oFF.SystemRole.SYSTEM_LANDSCAPE = oFF.SystemRole.create("SystemLandscape");
	oFF.SystemRole.PRIMARY_BLENDING_HOST = oFF.SystemRole.create("PrimaryBlendingHost");
};
oFF.SystemRole.create = function(name)
{
	var newConstant = new oFF.SystemRole();
	newConstant._setupInternal(name);
	oFF.SystemRole.s_roles.add(newConstant);
	oFF.SystemRole.s_lookup.put(name, newConstant);
	return newConstant;
};
oFF.SystemRole.getAllRoles = function()
{
	return oFF.SystemRole.s_roles;
};
oFF.SystemRole.lookup = function(name)
{
	return oFF.SystemRole.s_lookup.getByKey(name);
};

oFF.ProgramCategory = function() {};
oFF.ProgramCategory.prototype = new oFF.XConstant();
oFF.ProgramCategory.prototype._ff_c = "ProgramCategory";

oFF.ProgramCategory.GENERIC = null;
oFF.ProgramCategory.MISC = null;
oFF.ProgramCategory.TEST = null;
oFF.ProgramCategory.SYSTEM = null;
oFF.ProgramCategory.OLAP = null;
oFF.ProgramCategory.QUASAR = null;
oFF.ProgramCategory.MOBILE = null;
oFF.ProgramCategory.SHELL = null;
oFF.ProgramCategory.SUB_SYSTEM = null;
oFF.ProgramCategory.s_lookup = null;
oFF.ProgramCategory.staticSetup = function()
{
	oFF.ProgramCategory.s_lookup = oFF.XHashMapByString.create();
	oFF.ProgramCategory.GENERIC = oFF.ProgramCategory.create("Generic");
	oFF.ProgramCategory.MISC = oFF.ProgramCategory.create("Misc");
	oFF.ProgramCategory.TEST = oFF.ProgramCategory.create("Test");
	oFF.ProgramCategory.SYSTEM = oFF.ProgramCategory.create("System");
	oFF.ProgramCategory.OLAP = oFF.ProgramCategory.create("Olap");
	oFF.ProgramCategory.QUASAR = oFF.ProgramCategory.create("Quasar");
	oFF.ProgramCategory.MOBILE = oFF.ProgramCategory.create("Mobile");
	oFF.ProgramCategory.SHELL = oFF.ProgramCategory.create("Shell");
	oFF.ProgramCategory.SUB_SYSTEM = oFF.ProgramCategory.create("SubSystem");
};
oFF.ProgramCategory.create = function(name)
{
	var theConstant = oFF.XConstant.setupName(new oFF.ProgramCategory(), name);
	oFF.ProgramCategory.s_lookup.put(name, theConstant);
	oFF.ProgramCategory.s_lookup.put(oFF.XString.toLowerCase(name), theConstant);
	oFF.ProgramCategory.s_lookup.put(oFF.XString.toUpperCase(name), theConstant);
	return theConstant;
};
oFF.ProgramCategory.lookup = function(name)
{
	var namerLower = oFF.XString.toLowerCase(name);
	return oFF.ProgramCategory.s_lookup.getByKey(namerLower);
};
oFF.ProgramCategory.lookupwithDefault = function(name, defaultCategory)
{
	var tmpCategory = oFF.ProgramCategory.lookup(name);
	if (oFF.notNull(tmpCategory))
	{
		return tmpCategory;
	}
	return defaultCategory;
};

oFF.ProgramContainerType = function() {};
oFF.ProgramContainerType.prototype = new oFF.XConstant();
oFF.ProgramContainerType.prototype._ff_c = "ProgramContainerType";

oFF.ProgramContainerType.NONE = null;
oFF.ProgramContainerType.CONSOLE = null;
oFF.ProgramContainerType.WINDOW = null;
oFF.ProgramContainerType.DIALOG = null;
oFF.ProgramContainerType.STANDALONE = null;
oFF.ProgramContainerType.CONTENT = null;
oFF.ProgramContainerType.s_lookup = null;
oFF.ProgramContainerType.staticSetup = function()
{
	oFF.ProgramContainerType.s_lookup = oFF.XHashMapByString.create();
	oFF.ProgramContainerType.NONE = oFF.ProgramContainerType.create("None");
	oFF.ProgramContainerType.CONSOLE = oFF.ProgramContainerType.create("Console");
	oFF.ProgramContainerType.WINDOW = oFF.ProgramContainerType.create("Window").markUiContainer().markFloatingContainer();
	oFF.ProgramContainerType.DIALOG = oFF.ProgramContainerType.create("Dialog").markUiContainer().markFloatingContainer();
	oFF.ProgramContainerType.STANDALONE = oFF.ProgramContainerType.create("Standalone").markUiContainer().markEmbeddedContainer();
	oFF.ProgramContainerType.CONTENT = oFF.ProgramContainerType.create("Content").markUiContainer().markEmbeddedContainer();
};
oFF.ProgramContainerType.create = function(name)
{
	var theConstant = oFF.XConstant.setupName(new oFF.ProgramContainerType(), name);
	theConstant.m_isUiContainer = false;
	theConstant.m_isFloatingContainer = false;
	theConstant.m_isEmbeddedContainer = false;
	oFF.ProgramContainerType.s_lookup.put(name, theConstant);
	return theConstant;
};
oFF.ProgramContainerType.lookup = function(name)
{
	return oFF.ProgramContainerType.s_lookup.getByKey(name);
};
oFF.ProgramContainerType.prototype.m_isUiContainer = false;
oFF.ProgramContainerType.prototype.m_isFloatingContainer = false;
oFF.ProgramContainerType.prototype.m_isEmbeddedContainer = false;
oFF.ProgramContainerType.prototype.isUiContainer = function()
{
	return this.m_isUiContainer;
};
oFF.ProgramContainerType.prototype.isFloatingContainer = function()
{
	return this.m_isFloatingContainer;
};
oFF.ProgramContainerType.prototype.isEmbeddedContainer = function()
{
	return this.m_isEmbeddedContainer;
};
oFF.ProgramContainerType.prototype.markUiContainer = function()
{
	this.m_isUiContainer = true;
	return this;
};
oFF.ProgramContainerType.prototype.markFloatingContainer = function()
{
	this.m_isFloatingContainer = true;
	return this;
};
oFF.ProgramContainerType.prototype.markEmbeddedContainer = function()
{
	this.m_isEmbeddedContainer = true;
	return this;
};

oFF.ProcessEventType = function() {};
oFF.ProcessEventType.prototype = new oFF.XConstant();
oFF.ProcessEventType.prototype._ff_c = "ProcessEventType";

oFF.ProcessEventType.CREATED = null;
oFF.ProcessEventType.ACTIVE = null;
oFF.ProcessEventType.PROGRAM_STARTED = null;
oFF.ProcessEventType.PROGRAM_STARTUP_ERROR = null;
oFF.ProcessEventType.START_CFG_CHANGED = null;
oFF.ProcessEventType.PROGRAM_TITLE_CHANGED = null;
oFF.ProcessEventType.BEFORE_SHUTDOWN_REQUEST = null;
oFF.ProcessEventType.SHUTDOWN_REQUEST = null;
oFF.ProcessEventType.SHUTDOWN_STARTED = null;
oFF.ProcessEventType.TERMINATED = null;
oFF.ProcessEventType.staticSetup = function()
{
	oFF.ProcessEventType.CREATED = oFF.ProcessEventType.create("Created");
	oFF.ProcessEventType.ACTIVE = oFF.ProcessEventType.create("Active");
	oFF.ProcessEventType.PROGRAM_STARTED = oFF.ProcessEventType.create("ProgramStarted");
	oFF.ProcessEventType.PROGRAM_STARTUP_ERROR = oFF.ProcessEventType.create("ProgramStartupError");
	oFF.ProcessEventType.START_CFG_CHANGED = oFF.ProcessEventType.create("StartCfgChanged");
	oFF.ProcessEventType.PROGRAM_TITLE_CHANGED = oFF.ProcessEventType.create("ProgramTitleChanged");
	oFF.ProcessEventType.BEFORE_SHUTDOWN_REQUEST = oFF.ProcessEventType.create("BeforeShutdownRequest");
	oFF.ProcessEventType.SHUTDOWN_REQUEST = oFF.ProcessEventType.create("ShutdownRequest");
	oFF.ProcessEventType.SHUTDOWN_STARTED = oFF.ProcessEventType.create("ShutdownStarted");
	oFF.ProcessEventType.TERMINATED = oFF.ProcessEventType.create("Terminated");
};
oFF.ProcessEventType.create = function(name)
{
	var theConstant = oFF.XConstant.setupName(new oFF.ProcessEventType(), name);
	return theConstant;
};

oFF.ProcessType = function() {};
oFF.ProcessType.prototype = new oFF.XConstant();
oFF.ProcessType.prototype._ff_c = "ProcessType";

oFF.ProcessType.ROOT = null;
oFF.ProcessType.SUBSYSTEM = null;
oFF.ProcessType.PROGRAM = null;
oFF.ProcessType.SERVICE = null;
oFF.ProcessType.PLUGIN = null;
oFF.ProcessType.s_lookup = null;
oFF.ProcessType.staticSetup = function()
{
	oFF.ProcessType.s_lookup = oFF.XHashMapByString.create();
	oFF.ProcessType.ROOT = oFF.ProcessType.create("Root");
	oFF.ProcessType.PROGRAM = oFF.ProcessType.create("Program");
	oFF.ProcessType.SUBSYSTEM = oFF.ProcessType.create("SubSystem");
	oFF.ProcessType.SERVICE = oFF.ProcessType.create("Service");
	oFF.ProcessType.PLUGIN = oFF.ProcessType.create("Plugin");
};
oFF.ProcessType.create = function(name)
{
	var theConstant = oFF.XConstant.setupName(new oFF.ProcessType(), name);
	oFF.ProcessType.s_lookup.put(name, theConstant);
	return theConstant;
};
oFF.ProcessType.lookup = function(name)
{
	return oFF.ProcessType.s_lookup.getByKey(name);
};

oFF.SigSelDomain = function() {};
oFF.SigSelDomain.prototype = new oFF.XConstant();
oFF.SigSelDomain.prototype._ff_c = "SigSelDomain";

oFF.SigSelDomain.UI = null;
oFF.SigSelDomain.DATA = null;
oFF.SigSelDomain.CONTEXT = null;
oFF.SigSelDomain.SUBSYSTEM = null;
oFF.SigSelDomain.DIALOG = null;
oFF.SigSelDomain.ENVVARS = null;
oFF.SigSelDomain.s_all = null;
oFF.SigSelDomain.staticSetup = function()
{
	oFF.SigSelDomain.s_all = oFF.XSetOfNameObject.create();
	oFF.SigSelDomain.UI = oFF.SigSelDomain.create("ui");
	oFF.SigSelDomain.DATA = oFF.SigSelDomain.create("dp");
	oFF.SigSelDomain.CONTEXT = oFF.SigSelDomain.create("Context");
	oFF.SigSelDomain.SUBSYSTEM = oFF.SigSelDomain.create("subsys");
	oFF.SigSelDomain.DIALOG = oFF.SigSelDomain.create("dialog");
	oFF.SigSelDomain.ENVVARS = oFF.SigSelDomain.create("env");
};
oFF.SigSelDomain.create = function(name)
{
	var domain = new oFF.SigSelDomain();
	domain._setupInternal(name);
	oFF.SigSelDomain.s_all.add(domain);
	return domain;
};
oFF.SigSelDomain.lookup = function(name)
{
	return oFF.SigSelDomain.s_all.getByKey(name);
};

oFF.SigSelIndexType = function() {};
oFF.SigSelIndexType.prototype = new oFF.XConstant();
oFF.SigSelIndexType.prototype._ff_c = "SigSelIndexType";

oFF.SigSelIndexType.NONE = null;
oFF.SigSelIndexType.NAME = null;
oFF.SigSelIndexType.POSITION = null;
oFF.SigSelIndexType.staticSetup = function()
{
	oFF.SigSelIndexType.NONE = oFF.XConstant.setupName(new oFF.SigSelIndexType(), "None");
	oFF.SigSelIndexType.NAME = oFF.XConstant.setupName(new oFF.SigSelIndexType(), "Name");
	oFF.SigSelIndexType.POSITION = oFF.XConstant.setupName(new oFF.SigSelIndexType(), "Position");
};

oFF.SigSelType = function() {};
oFF.SigSelType.prototype = new oFF.XConstant();
oFF.SigSelType.prototype._ff_c = "SigSelType";

oFF.SigSelType.MATCH = null;
oFF.SigSelType.MATCH_NAME = null;
oFF.SigSelType.MATCH_ID = null;
oFF.SigSelType.WILDCARD = null;
oFF.SigSelType.staticSetup = function()
{
	oFF.SigSelType.MATCH = oFF.XConstant.setupName(new oFF.SigSelType(), "Match");
	oFF.SigSelType.MATCH_ID = oFF.XConstant.setupName(new oFF.SigSelType(), "MatchId");
	oFF.SigSelType.MATCH_NAME = oFF.XConstant.setupName(new oFF.SigSelType(), "MatchName");
	oFF.SigSelType.WILDCARD = oFF.XConstant.setupName(new oFF.SigSelType(), "Wildcard");
};

oFF.SubSystemStatus = function() {};
oFF.SubSystemStatus.prototype = new oFF.XConstant();
oFF.SubSystemStatus.prototype._ff_c = "SubSystemStatus";

oFF.SubSystemStatus.INITIAL = null;
oFF.SubSystemStatus.BOOTSTRAP = null;
oFF.SubSystemStatus.LOADING = null;
oFF.SubSystemStatus.ACTIVE = null;
oFF.SubSystemStatus.INACTIVE = null;
oFF.SubSystemStatus.CLOSED = null;
oFF.SubSystemStatus.staticSetup = function()
{
	oFF.SubSystemStatus.INITIAL = oFF.SubSystemStatus.create("Initial");
	oFF.SubSystemStatus.BOOTSTRAP = oFF.SubSystemStatus.create("Bootstrap");
	oFF.SubSystemStatus.LOADING = oFF.SubSystemStatus.create("Loading");
	oFF.SubSystemStatus.ACTIVE = oFF.SubSystemStatus.create("Active");
	oFF.SubSystemStatus.INACTIVE = oFF.SubSystemStatus.create("Inactive");
	oFF.SubSystemStatus.CLOSED = oFF.SubSystemStatus.create("Closed");
};
oFF.SubSystemStatus.create = function(name)
{
	var unitType = new oFF.SubSystemStatus();
	unitType._setupInternal(name);
	return unitType;
};

oFF.SubSystemType = function() {};
oFF.SubSystemType.prototype = new oFF.XConstant();
oFF.SubSystemType.prototype._ff_c = "SubSystemType";

oFF.SubSystemType.GUI = null;
oFF.SubSystemType.BOOTSTRAP_LANDSCAPE = null;
oFF.SubSystemType.SYSTEM_LANDSCAPE = null;
oFF.SubSystemType.SHARED_SERVERS = null;
oFF.SubSystemType.USER_PROFILE = null;
oFF.SubSystemType.FILE_SYSTEM = null;
oFF.SubSystemType.VIRTUAL_FILE_SYSTEM = null;
oFF.SubSystemType.CACHE = null;
oFF.SubSystemType.CREDENTIALS_PROVIDER = null;
oFF.SubSystemType.CREDENTIALS_PROVIDER_LITE = null;
oFF.SubSystemType.DATA_PROVIDER_POOL = null;
oFF.SubSystemType.s_instances = null;
oFF.SubSystemType.staticSetup = function()
{
	oFF.SubSystemType.s_instances = oFF.XHashMapByString.create();
	oFF.SubSystemType.GUI = oFF.SubSystemType.create("Gui");
	oFF.SubSystemType.USER_PROFILE = oFF.SubSystemType.create("UserProfile");
	oFF.SubSystemType.BOOTSTRAP_LANDSCAPE = oFF.SubSystemType.create("BootstrapLandscape");
	oFF.SubSystemType.SYSTEM_LANDSCAPE = oFF.SubSystemType.create("SystemLandscape");
	oFF.SubSystemType.SHARED_SERVERS = oFF.SubSystemType.create("SharedServers");
	oFF.SubSystemType.FILE_SYSTEM = oFF.SubSystemType.create("FileSystem");
	oFF.SubSystemType.VIRTUAL_FILE_SYSTEM = oFF.SubSystemType.create("VirtualFileSystem");
	oFF.SubSystemType.CACHE = oFF.SubSystemType.create("Cache");
	oFF.SubSystemType.CREDENTIALS_PROVIDER = oFF.SubSystemType.create("CredentialsProvider");
	oFF.SubSystemType.CREDENTIALS_PROVIDER_LITE = oFF.SubSystemType.create("CredentialsProviderLite");
	oFF.SubSystemType.DATA_PROVIDER_POOL = oFF.SubSystemType.create("DataProviderPool");
};
oFF.SubSystemType.create = function(name)
{
	var type = new oFF.SubSystemType();
	type._setupInternal(name);
	oFF.SubSystemType.s_instances.put(name, type);
	return type;
};
oFF.SubSystemType.lookup = function(name)
{
	return oFF.SubSystemType.s_instances.getByKey(name);
};

oFF.XFileAttribute = function() {};
oFF.XFileAttribute.prototype = new oFF.XConstantWithParent();
oFF.XFileAttribute.prototype._ff_c = "XFileAttribute";

oFF.XFileAttribute.STRING_BASED = null;
oFF.XFileAttribute.INTEGER_BASED = null;
oFF.XFileAttribute.BOOLEAN_BASED = null;
oFF.XFileAttribute.DATE_MS_BASED = null;
oFF.XFileAttribute.URL_BASED = null;
oFF.XFileAttribute.STRUCTURE_BASED = null;
oFF.XFileAttribute.LIST_BASED = null;
oFF.XFileAttribute.NAME = null;
oFF.XFileAttribute.DISPLAY_NAME = null;
oFF.XFileAttribute.DESCRIPTION = null;
oFF.XFileAttribute.ICON = null;
oFF.XFileAttribute.NODE_TYPE = null;
oFF.XFileAttribute.SEMANTIC_TYPE = null;
oFF.XFileAttribute.SIZE = null;
oFF.XFileAttribute.FILE_TYPE = null;
oFF.XFileAttribute.TARGET_URL = null;
oFF.XFileAttribute.IS_EXISTING = null;
oFF.XFileAttribute.IS_DIRECTORY = null;
oFF.XFileAttribute.SPACE_ID = null;
oFF.XFileAttribute.IS_WORKSPACE_FILE = null;
oFF.XFileAttribute.IS_FILE = null;
oFF.XFileAttribute.IS_EXECUTABLE = null;
oFF.XFileAttribute.IS_HIDDEN = null;
oFF.XFileAttribute.IS_READABLE = null;
oFF.XFileAttribute.IS_WRITEABLE = null;
oFF.XFileAttribute.IS_LINK = null;
oFF.XFileAttribute.LINK_URL = null;
oFF.XFileAttribute.PROVIDER_LINK_URL = null;
oFF.XFileAttribute.USER = null;
oFF.XFileAttribute.CREATED_BY = null;
oFF.XFileAttribute.CREATED_AT = null;
oFF.XFileAttribute.CHANGED_BY = null;
oFF.XFileAttribute.CHANGED_AT = null;
oFF.XFileAttribute.OLAP_DATASOURCE = null;
oFF.XFileAttribute.OLAP_DATASOURCE_NAME = null;
oFF.XFileAttribute.OLAP_DATASOURCE_SCHEMA = null;
oFF.XFileAttribute.OLAP_DATASOURCE_PACKAGE = null;
oFF.XFileAttribute.OLAP_DATASOURCE_TYPE = null;
oFF.XFileAttribute.OLAP_DATASOURCE_SYSTEM = null;
oFF.XFileAttribute.OLAP_DATA_CATEGORY = null;
oFF.XFileAttribute.SYSTEM_TYPE = null;
oFF.XFileAttribute.SYSTEM_NAME = null;
oFF.XFileAttribute.UNIQUE_ID = null;
oFF.XFileAttribute.OWNER_FOLDER = null;
oFF.XFileAttribute.OWNER_TYPE = null;
oFF.XFileAttribute.PARENT_UNIQUE_ID = null;
oFF.XFileAttribute.UPDATE_COUNT = null;
oFF.XFileAttribute.ORIGINAL_LANGUAGE = null;
oFF.XFileAttribute.PACKAGE_ID = null;
oFF.XFileAttribute.NODE_SUB_TYPE = null;
oFF.XFileAttribute.MOBILE_SUPPORT = null;
oFF.XFileAttribute.CREATED_BY_DISPLAY_NAME = null;
oFF.XFileAttribute.CHANGED_BY_DISPLAY_NAME = null;
oFF.XFileAttribute.TEXTS = null;
oFF.XFileAttribute.VIEWS = null;
oFF.XFileAttribute.FAVOURTIE_RESOURCE_ID = null;
oFF.XFileAttribute.ANCESTOR_RESOURCE = null;
oFF.XFileAttribute.SOURCE_RESOURCE = null;
oFF.XFileAttribute.ANCESTOR_PATH = null;
oFF.XFileAttribute.IS_SHARED = null;
oFF.XFileAttribute.SHARED_TO_ANY = null;
oFF.XFileAttribute.SHARED = null;
oFF.XFileAttribute.SHAREABLE = null;
oFF.XFileAttribute.STORY_CONTENT = null;
oFF.XFileAttribute.METADATA = null;
oFF.XFileAttribute.DEPENDENT_OBJECTS = null;
oFF.XFileAttribute.SUB_OBJECTS = null;
oFF.XFileAttribute.IGNORE_QUICKFILTERS = null;
oFF.XFileAttribute.CAN_ASSIGN = null;
oFF.XFileAttribute.CAN_READ = null;
oFF.XFileAttribute.CAN_UPDATE = null;
oFF.XFileAttribute.CAN_DELETE = null;
oFF.XFileAttribute.CAN_CREATE_DOC = null;
oFF.XFileAttribute.CAN_CREATE_FOLDER = null;
oFF.XFileAttribute.CAN_COPY = null;
oFF.XFileAttribute.CAN_COMMENT_VIEW = null;
oFF.XFileAttribute.CAN_COMMENT_ADD = null;
oFF.XFileAttribute.CAN_COMMENT_DELETE = null;
oFF.XFileAttribute.CAN_MAINTAIN = null;
oFF.XFileAttribute.SUPPORTS_CARTESIAN_FILTER = null;
oFF.XFileAttribute.SUPPORTS_OFFSET = null;
oFF.XFileAttribute.SUPPORTS_MAX_ITEMS = null;
oFF.XFileAttribute.SUPPORTS_SINGLE_SORT = null;
oFF.XFileAttribute.SUPPORTS_SEARCH = null;
oFF.XFileAttribute.SUPPORTED_FILTERS = null;
oFF.XFileAttribute.SUPPORTED_FILTER_TYPES = null;
oFF.XFileAttribute.SUPPORTS_SET_LAST_MODIFIED = null;
oFF.XFileAttribute.SOURCE_PROGRAM = null;
oFF.XFileAttribute.s_lookup = null;
oFF.XFileAttribute.staticSetup = function()
{
	oFF.XFileAttribute.s_lookup = oFF.XHashMapByString.create();
	oFF.XFileAttribute.STRING_BASED = oFF.XFileAttribute.create("abstract.StringBasedAttribute", null);
	oFF.XFileAttribute.INTEGER_BASED = oFF.XFileAttribute.create("abstract.IntegerBasedAttribute", null);
	oFF.XFileAttribute.BOOLEAN_BASED = oFF.XFileAttribute.create("abstract.BooleanBased", null);
	oFF.XFileAttribute.STRUCTURE_BASED = oFF.XFileAttribute.create("abstract.StructureBased", null);
	oFF.XFileAttribute.LIST_BASED = oFF.XFileAttribute.create("abstract.ListBased", null);
	oFF.XFileAttribute.DATE_MS_BASED = oFF.XFileAttribute.create("abstract.DateMsBased", oFF.XFileAttribute.INTEGER_BASED);
	oFF.XFileAttribute.URL_BASED = oFF.XFileAttribute.create("abstract.UrlBased", oFF.XFileAttribute.STRING_BASED);
	oFF.XFileAttribute.NAME = oFF.XFileAttribute.create("os.name", oFF.XFileAttribute.STRING_BASED);
	oFF.XFileAttribute.DISPLAY_NAME = oFF.XFileAttribute.create("os.displayName", oFF.XFileAttribute.STRING_BASED);
	oFF.XFileAttribute.DESCRIPTION = oFF.XFileAttribute.create("os.node.description", oFF.XFileAttribute.STRING_BASED);
	oFF.XFileAttribute.ICON = oFF.XFileAttribute.create("os.node.icon", oFF.XFileAttribute.STRING_BASED);
	oFF.XFileAttribute.NODE_TYPE = oFF.XFileAttribute.create("os.node.type", oFF.XFileAttribute.STRING_BASED);
	oFF.XFileAttribute.SEMANTIC_TYPE = oFF.XFileAttribute.create("os.res.type", oFF.XFileAttribute.STRING_BASED);
	oFF.XFileAttribute.FILE_TYPE = oFF.XFileAttribute.create("os.fileType", oFF.XFileAttribute.STRING_BASED);
	oFF.XFileAttribute.SIZE = oFF.XFileAttribute.create("os.size", oFF.XFileAttribute.INTEGER_BASED);
	oFF.XFileAttribute.IS_EXISTING = oFF.XFileAttribute.create("os.isExisting", oFF.XFileAttribute.BOOLEAN_BASED);
	oFF.XFileAttribute.IS_DIRECTORY = oFF.XFileAttribute.create("os.isDirectory", oFF.XFileAttribute.BOOLEAN_BASED);
	oFF.XFileAttribute.IS_FILE = oFF.XFileAttribute.create("os.isFile", oFF.XFileAttribute.BOOLEAN_BASED);
	oFF.XFileAttribute.IS_EXECUTABLE = oFF.XFileAttribute.create("os.isExecutable", oFF.XFileAttribute.BOOLEAN_BASED);
	oFF.XFileAttribute.IS_HIDDEN = oFF.XFileAttribute.create("os.isHidden", oFF.XFileAttribute.BOOLEAN_BASED);
	oFF.XFileAttribute.IS_READABLE = oFF.XFileAttribute.create("os.isReadable", oFF.XFileAttribute.BOOLEAN_BASED);
	oFF.XFileAttribute.IS_WRITEABLE = oFF.XFileAttribute.create("os.isWriteable", oFF.XFileAttribute.BOOLEAN_BASED);
	oFF.XFileAttribute.IGNORE_QUICKFILTERS = oFF.XFileAttribute.create("os.ignoreQuickFilters", oFF.XFileAttribute.BOOLEAN_BASED);
	oFF.XFileAttribute.IS_WORKSPACE_FILE = oFF.XFileAttribute.create("os.isWorkspaceFile", oFF.XFileAttribute.BOOLEAN_BASED);
	oFF.XFileAttribute.SPACE_ID = oFF.XFileAttribute.create("os.spaceId", oFF.XFileAttribute.STRING_BASED);
	oFF.XFileAttribute.TARGET_URL = oFF.XFileAttribute.create("os.targetUrl", oFF.XFileAttribute.URL_BASED);
	oFF.XFileAttribute.IS_LINK = oFF.XFileAttribute.create("os.isLink", oFF.XFileAttribute.BOOLEAN_BASED);
	oFF.XFileAttribute.LINK_URL = oFF.XFileAttribute.create("os.linkUrl", oFF.XFileAttribute.URL_BASED);
	oFF.XFileAttribute.PROVIDER_LINK_URL = oFF.XFileAttribute.create("os.providerLinkUrl", oFF.XFileAttribute.URL_BASED);
	oFF.XFileAttribute.USER = oFF.XFileAttribute.create("abstract.User", oFF.XFileAttribute.STRING_BASED);
	oFF.XFileAttribute.CREATED_BY = oFF.XFileAttribute.create("os.createdBy", oFF.XFileAttribute.USER);
	oFF.XFileAttribute.CREATED_AT = oFF.XFileAttribute.create("os.createdAt", oFF.XFileAttribute.DATE_MS_BASED);
	oFF.XFileAttribute.CHANGED_BY = oFF.XFileAttribute.create("os.changedBy", oFF.XFileAttribute.USER);
	oFF.XFileAttribute.CHANGED_AT = oFF.XFileAttribute.create("os.changedAt", oFF.XFileAttribute.DATE_MS_BASED);
	oFF.XFileAttribute.OLAP_DATASOURCE = oFF.XFileAttribute.create("abstract.OlapDataSource", oFF.XFileAttribute.STRING_BASED);
	oFF.XFileAttribute.OLAP_DATASOURCE_NAME = oFF.XFileAttribute.create("olap.ds.name", oFF.XFileAttribute.OLAP_DATASOURCE);
	oFF.XFileAttribute.OLAP_DATASOURCE_SCHEMA = oFF.XFileAttribute.create("olap.ds.schema", oFF.XFileAttribute.OLAP_DATASOURCE);
	oFF.XFileAttribute.OLAP_DATASOURCE_PACKAGE = oFF.XFileAttribute.create("olap.ds.package", oFF.XFileAttribute.OLAP_DATASOURCE);
	oFF.XFileAttribute.OLAP_DATASOURCE_TYPE = oFF.XFileAttribute.create("olap.ds.type", oFF.XFileAttribute.OLAP_DATASOURCE);
	oFF.XFileAttribute.OLAP_DATASOURCE_SYSTEM = oFF.XFileAttribute.create("olap.ds.system", oFF.XFileAttribute.OLAP_DATASOURCE);
	oFF.XFileAttribute.OLAP_DATA_CATEGORY = oFF.XFileAttribute.create("olap.dt.category", oFF.XFileAttribute.OLAP_DATASOURCE);
	oFF.XFileAttribute.SYSTEM_TYPE = oFF.XFileAttribute.create("os.sys.type", oFF.XFileAttribute.STRING_BASED);
	oFF.XFileAttribute.SYSTEM_NAME = oFF.XFileAttribute.create("os.sys.name", oFF.XFileAttribute.STRING_BASED);
	oFF.XFileAttribute.UNIQUE_ID = oFF.XFileAttribute.create("os.uniqueId", oFF.XFileAttribute.STRING_BASED);
	oFF.XFileAttribute.OWNER_FOLDER = oFF.XFileAttribute.create("os.ownerFolder", oFF.XFileAttribute.STRING_BASED);
	oFF.XFileAttribute.OWNER_TYPE = oFF.XFileAttribute.create("os.ownerType", oFF.XFileAttribute.STRING_BASED);
	oFF.XFileAttribute.PARENT_UNIQUE_ID = oFF.XFileAttribute.create("os.parentUniqueId", oFF.XFileAttribute.STRING_BASED);
	oFF.XFileAttribute.UPDATE_COUNT = oFF.XFileAttribute.create("os.updateCount", oFF.XFileAttribute.INTEGER_BASED);
	oFF.XFileAttribute.ORIGINAL_LANGUAGE = oFF.XFileAttribute.create("os.originalLanguage", oFF.XFileAttribute.STRING_BASED);
	oFF.XFileAttribute.PACKAGE_ID = oFF.XFileAttribute.create("contentlib.packageId", oFF.XFileAttribute.STRING_BASED);
	oFF.XFileAttribute.NODE_SUB_TYPE = oFF.XFileAttribute.create("os.node.subType", oFF.XFileAttribute.STRING_BASED);
	oFF.XFileAttribute.MOBILE_SUPPORT = oFF.XFileAttribute.create("os.mobile.support", oFF.XFileAttribute.INTEGER_BASED);
	oFF.XFileAttribute.CREATED_BY_DISPLAY_NAME = oFF.XFileAttribute.create("os.createdBy.displayName", oFF.XFileAttribute.STRING_BASED);
	oFF.XFileAttribute.CHANGED_BY_DISPLAY_NAME = oFF.XFileAttribute.create("os.changedBy.displayName", oFF.XFileAttribute.STRING_BASED);
	oFF.XFileAttribute.SOURCE_RESOURCE = oFF.XFileAttribute.create("contentlib.sourceResource", oFF.XFileAttribute.STRUCTURE_BASED);
	oFF.XFileAttribute.ANCESTOR_RESOURCE = oFF.XFileAttribute.create("contentlib.ancestorResource", oFF.XFileAttribute.LIST_BASED);
	oFF.XFileAttribute.SHARED_TO_ANY = oFF.XFileAttribute.create("os.shared_to_any", oFF.XFileAttribute.BOOLEAN_BASED);
	oFF.XFileAttribute.IS_SHARED = oFF.XFileAttribute.create("os.is_shared", oFF.XFileAttribute.BOOLEAN_BASED);
	oFF.XFileAttribute.SHARED = oFF.XFileAttribute.create("os.shared", oFF.XFileAttribute.BOOLEAN_BASED);
	oFF.XFileAttribute.SHAREABLE = oFF.XFileAttribute.create("os.sharable", oFF.XFileAttribute.STRING_BASED);
	oFF.XFileAttribute.STORY_CONTENT = oFF.XFileAttribute.create("contentlib.storyContent", oFF.XFileAttribute.STRUCTURE_BASED);
	oFF.XFileAttribute.METADATA = oFF.XFileAttribute.create("contentlib.metadata", oFF.XFileAttribute.STRUCTURE_BASED);
	oFF.XFileAttribute.CAN_ASSIGN = oFF.XFileAttribute.create("auth.canAssign", oFF.XFileAttribute.BOOLEAN_BASED);
	oFF.XFileAttribute.CAN_READ = oFF.XFileAttribute.create("auth.canRead", oFF.XFileAttribute.BOOLEAN_BASED);
	oFF.XFileAttribute.CAN_UPDATE = oFF.XFileAttribute.create("auth.canUpdate", oFF.XFileAttribute.BOOLEAN_BASED);
	oFF.XFileAttribute.CAN_DELETE = oFF.XFileAttribute.create("auth.canDelete", oFF.XFileAttribute.BOOLEAN_BASED);
	oFF.XFileAttribute.CAN_CREATE_DOC = oFF.XFileAttribute.create("auth.canCreateDoc", oFF.XFileAttribute.BOOLEAN_BASED);
	oFF.XFileAttribute.CAN_CREATE_FOLDER = oFF.XFileAttribute.create("auth.canCreateDoc", oFF.XFileAttribute.BOOLEAN_BASED);
	oFF.XFileAttribute.CAN_COPY = oFF.XFileAttribute.create("auth.canCopy", oFF.XFileAttribute.BOOLEAN_BASED);
	oFF.XFileAttribute.CAN_COMMENT_VIEW = oFF.XFileAttribute.create("auth.canCommentView", oFF.XFileAttribute.BOOLEAN_BASED);
	oFF.XFileAttribute.CAN_COMMENT_ADD = oFF.XFileAttribute.create("auth.canCommentAdd", oFF.XFileAttribute.BOOLEAN_BASED);
	oFF.XFileAttribute.CAN_COMMENT_DELETE = oFF.XFileAttribute.create("auth.canCommentDelete", oFF.XFileAttribute.BOOLEAN_BASED);
	oFF.XFileAttribute.CAN_MAINTAIN = oFF.XFileAttribute.create("auth.canMaintain", oFF.XFileAttribute.BOOLEAN_BASED);
	oFF.XFileAttribute.SUPPORTS_CARTESIAN_FILTER = oFF.XFileAttribute.create("os.md.supportsCartesianFilter", oFF.XFileAttribute.BOOLEAN_BASED);
	oFF.XFileAttribute.SUPPORTS_OFFSET = oFF.XFileAttribute.create("os.md.supportsOffset", oFF.XFileAttribute.BOOLEAN_BASED);
	oFF.XFileAttribute.SUPPORTS_MAX_ITEMS = oFF.XFileAttribute.create("os.md.supportsMaxItems", oFF.XFileAttribute.BOOLEAN_BASED);
	oFF.XFileAttribute.SUPPORTS_SINGLE_SORT = oFF.XFileAttribute.create("os.md.supportsSingleSort", oFF.XFileAttribute.BOOLEAN_BASED);
	oFF.XFileAttribute.SUPPORTS_SEARCH = oFF.XFileAttribute.create("os.md.supportsSearch", oFF.XFileAttribute.BOOLEAN_BASED);
	oFF.XFileAttribute.SUPPORTS_SET_LAST_MODIFIED = oFF.XFileAttribute.create("os.md.supportsSetLastModified", oFF.XFileAttribute.BOOLEAN_BASED);
	oFF.XFileAttribute.SUPPORTED_FILTER_TYPES = oFF.XFileAttribute.create("os.md.supportedFilterTypes", oFF.XFileAttribute.LIST_BASED);
	oFF.XFileAttribute.SUPPORTED_FILTERS = oFF.XFileAttribute.create("os.md.supportedFilters", oFF.XFileAttribute.STRUCTURE_BASED);
	oFF.XFileAttribute.SOURCE_PROGRAM = oFF.XFileAttribute.create("os.sourceProgram", oFF.XFileAttribute.STRING_BASED);
};
oFF.XFileAttribute.create = function(name, parent)
{
	var type = new oFF.XFileAttribute();
	type.setupExt(name, parent);
	oFF.XFileAttribute.s_lookup.put(name, type);
	return type;
};
oFF.XFileAttribute.lookup = function(name)
{
	return oFF.XFileAttribute.s_lookup.getByKey(name);
};
oFF.XFileAttribute.prototype.isBoolean = function()
{
	return this.isTypeOf(oFF.XFileAttribute.BOOLEAN_BASED);
};
oFF.XFileAttribute.prototype.isString = function()
{
	return this.isTypeOf(oFF.XFileAttribute.STRING_BASED);
};
oFF.XFileAttribute.prototype.isInteger = function()
{
	return this.isTypeOf(oFF.XFileAttribute.INTEGER_BASED);
};
oFF.XFileAttribute.prototype.isLong = function()
{
	return this.isTypeOf(oFF.XFileAttribute.INTEGER_BASED);
};
oFF.XFileAttribute.prototype.isDouble = function()
{
	return false;
};
oFF.XFileAttribute.prototype.isNumeric = function()
{
	return this.isTypeOf(oFF.XFileAttribute.INTEGER_BASED);
};
oFF.XFileAttribute.prototype.isObject = function()
{
	return false;
};
oFF.XFileAttribute.prototype.isList = function()
{
	return this.isTypeOf(oFF.XFileAttribute.LIST_BASED);
};

oFF.ResourceStatus = function() {};
oFF.ResourceStatus.prototype = new oFF.XConstantWithParent();
oFF.ResourceStatus.prototype._ff_c = "ResourceStatus";

oFF.ResourceStatus.UNDEFINED = null;
oFF.ResourceStatus.INITIAL = null;
oFF.ResourceStatus.LOADING = null;
oFF.ResourceStatus.FINISHED = null;
oFF.ResourceStatus.LOADED = null;
oFF.ResourceStatus.FAILED = null;
oFF.ResourceStatus.staticSetup = function()
{
	oFF.ResourceStatus.UNDEFINED = oFF.ResourceStatus.create("Undefined", null);
	oFF.ResourceStatus.INITIAL = oFF.ResourceStatus.create("Initial", null);
	oFF.ResourceStatus.LOADING = oFF.ResourceStatus.create("Loading", null);
	oFF.ResourceStatus.FINISHED = oFF.ResourceStatus.create("Finished", null);
	oFF.ResourceStatus.LOADED = oFF.ResourceStatus.create("Loaded", oFF.ResourceStatus.FINISHED);
	oFF.ResourceStatus.FAILED = oFF.ResourceStatus.create("Failed", oFF.ResourceStatus.FINISHED);
};
oFF.ResourceStatus.create = function(name, parent)
{
	var type = new oFF.ResourceStatus();
	type.setupExt(name, parent);
	return type;
};

oFF.KernelComponentType = function() {};
oFF.KernelComponentType.prototype = new oFF.XComponentType();
oFF.KernelComponentType.prototype._ff_c = "KernelComponentType";

oFF.KernelComponentType.SIGSEL_RESULT_LIST = null;
oFF.KernelComponentType.SYSTEM_DESCRIPTION = null;
oFF.KernelComponentType.SYSTEM_LANDSCAPE = null;
oFF.KernelComponentType.staticSetupKernelComponentTypes = function()
{
	oFF.KernelComponentType.SIGSEL_RESULT_LIST = oFF.KernelComponentType.createKernelType("SigSelResultList", oFF.XComponentType._ROOT);
	oFF.KernelComponentType.SYSTEM_DESCRIPTION = oFF.KernelComponentType.createKernelType("SystemDescription", oFF.XComponentType._ROOT);
	oFF.KernelComponentType.SYSTEM_LANDSCAPE = oFF.KernelComponentType.createKernelType("SystemLandscape", oFF.XComponentType._ROOT);
};
oFF.KernelComponentType.createKernelType = function(constant, parent)
{
	var mt = new oFF.KernelComponentType();
	if (oFF.isNull(parent))
	{
		mt.setupExt(constant, oFF.XComponentType._ROOT);
	}
	else
	{
		mt.setupExt(constant, parent);
	}
	return mt;
};

oFF.KernelApiModule = function() {};
oFF.KernelApiModule.prototype = new oFF.DfModule();
oFF.KernelApiModule.prototype._ff_c = "KernelApiModule";

oFF.KernelApiModule.s_module = null;
oFF.KernelApiModule.getInstance = function()
{
	if (oFF.isNull(oFF.KernelApiModule.s_module))
	{
		oFF.DfModule.checkInitialized(oFF.IoExtModule.getInstance());
		oFF.KernelApiModule.s_module = oFF.DfModule.startExt(new oFF.KernelApiModule());
		oFF.ResourceType.staticSetup();
		oFF.ResourceStatus.staticSetup();
		oFF.SubSystemType.staticSetup();
		oFF.ProgramContainerType.staticSetup();
		oFF.ProgramCategory.staticSetup();
		oFF.SystemRole.staticSetup();
		oFF.SigSelType.staticSetup();
		oFF.SigSelDomain.staticSetup();
		oFF.SigSelIndexType.staticSetup();
		oFF.SubSystemStatus.staticSetup();
		oFF.ServiceApiLevel.staticSetup();
		oFF.KernelComponentType.staticSetupKernelComponentTypes();
		oFF.ProcessType.staticSetup();
		oFF.ProcessEventType.staticSetup();
		oFF.XFileAttribute.staticSetup();
		oFF.XFileFilterType.staticSetup();
		oFF.DfModule.stopExt(oFF.KernelApiModule.s_module);
	}
	return oFF.KernelApiModule.s_module;
};
oFF.KernelApiModule.prototype.getName = function()
{
	return "ff1000.kernel.api";
};

oFF.KernelApiModule.getInstance();

return sap.firefly;
	} );