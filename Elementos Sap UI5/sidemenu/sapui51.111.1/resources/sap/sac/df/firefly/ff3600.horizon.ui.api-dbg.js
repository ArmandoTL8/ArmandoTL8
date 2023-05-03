/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
[
"sap/sac/df/firefly/ff3100.system.ui"
],
function(oFF)
{
"use strict";

oFF.HuPluginRegistrationApi = {

	s_pluginsClasses:null,
	staticSetup:function()
	{
			oFF.HuPluginRegistrationApi.s_pluginsClasses = oFF.XLinkedHashMapByString.create();
	},
	registerPluginByClass:function(pluginClass)
	{
			if (oFF.notNull(pluginClass))
		{
			try
			{
				var tmpInstance = pluginClass.newInstance(null);
				var pluginName = tmpInstance.getName();
				if (!oFF.HuPluginRegistrationApi.s_pluginsClasses.containsKey(pluginName))
				{
					oFF.HuPluginRegistrationApi.s_pluginsClasses.put(pluginName, pluginClass);
				}
				tmpInstance = null;
			}
			catch (e)
			{
				throw oFF.XException.createRuntimeException("Failed to register plugin class! Class might be invalid!");
			}
		}
	},
	getPluginClass:function(pluginName)
	{
			return oFF.HuPluginRegistrationApi.s_pluginsClasses.getByKey(pluginName);
	},
	getAllApiPlugins:function()
	{
			var tmpPluginNamesSorted = oFF.HuPluginRegistrationApi.s_pluginsClasses.getKeysAsReadOnlyListOfString().createListOfStringCopy();
		tmpPluginNamesSorted.sortByDirection(oFF.XSortDirection.ASCENDING);
		return tmpPluginNamesSorted;
	}
};

oFF.HuDfHorizonPlugin = function() {};
oFF.HuDfHorizonPlugin.prototype = new oFF.XObject();
oFF.HuDfHorizonPlugin.prototype._ff_c = "HuDfHorizonPlugin";

oFF.HuDfHorizonPlugin.prototype.m_controller = null;
oFF.HuDfHorizonPlugin.prototype.getName = function()
{
	return this.getPluginName();
};
oFF.HuDfHorizonPlugin.prototype.processConfig = function(config) {};
oFF.HuDfHorizonPlugin.prototype.setupPlugin = function(controller)
{
	this.m_controller = controller;
};
oFF.HuDfHorizonPlugin.prototype.destroyPlugin = function()
{
	this.m_controller = null;
};
oFF.HuDfHorizonPlugin.prototype.getController = function()
{
	return this.m_controller;
};
oFF.HuDfHorizonPlugin.prototype.getConfig = function()
{
	return this.getController().getConfigJson();
};
oFF.HuDfHorizonPlugin.prototype.getDataSpace = function()
{
	return this.getController().getDataSpace();
};
oFF.HuDfHorizonPlugin.prototype.executeAction = function(actionId, customObject)
{
	this.getController().executeAction(actionId, customObject);
};

oFF.HuDfCommandPlugin = function() {};
oFF.HuDfCommandPlugin.prototype = new oFF.HuDfHorizonPlugin();
oFF.HuDfCommandPlugin.prototype._ff_c = "HuDfCommandPlugin";

oFF.HuDfCommandPlugin.prototype.getPluginType = function()
{
	return oFF.HuHorizonPluginType.COMMAND;
};
oFF.HuDfCommandPlugin.prototype.getCommandController = function()
{
	return this.getController();
};

oFF.HuDfDocumentPlugin = function() {};
oFF.HuDfDocumentPlugin.prototype = new oFF.HuDfHorizonPlugin();
oFF.HuDfDocumentPlugin.prototype._ff_c = "HuDfDocumentPlugin";

oFF.HuDfDocumentPlugin.prototype.getPluginType = function()
{
	return oFF.HuHorizonPluginType.DOCUMENT;
};
oFF.HuDfDocumentPlugin.prototype.getDocumentController = function()
{
	return this.getController();
};

oFF.HuDfViewPlugin = function() {};
oFF.HuDfViewPlugin.prototype = new oFF.HuDfHorizonPlugin();
oFF.HuDfViewPlugin.prototype._ff_c = "HuDfViewPlugin";

oFF.HuDfViewPlugin.prototype.getPluginType = function()
{
	return oFF.HuHorizonPluginType.VIEW;
};

oFF.HuHorizonPluginCategory = function() {};
oFF.HuHorizonPluginCategory.prototype = new oFF.UiBaseConstant();
oFF.HuHorizonPluginCategory.prototype._ff_c = "HuHorizonPluginCategory";

oFF.HuHorizonPluginCategory.SYSTEM = null;
oFF.HuHorizonPluginCategory.OLAP = null;
oFF.HuHorizonPluginCategory.DEBUG = null;
oFF.HuHorizonPluginCategory.OTHER = null;
oFF.HuHorizonPluginCategory.s_lookup = null;
oFF.HuHorizonPluginCategory.staticSetup = function()
{
	oFF.HuHorizonPluginCategory.s_lookup = oFF.XHashMapByString.create();
	oFF.HuHorizonPluginCategory.SYSTEM = oFF.HuHorizonPluginCategory.createWithName("System");
	oFF.HuHorizonPluginCategory.OLAP = oFF.HuHorizonPluginCategory.createWithName("Olap");
	oFF.HuHorizonPluginCategory.DEBUG = oFF.HuHorizonPluginCategory.createWithName("Debug").setIsDebug();
	oFF.HuHorizonPluginCategory.OTHER = oFF.HuHorizonPluginCategory.createWithName("Other");
};
oFF.HuHorizonPluginCategory.createWithName = function(name)
{
	var newType = oFF.UiBaseConstant.createUiConstant(new oFF.HuHorizonPluginCategory(), name, oFF.HuHorizonPluginCategory.s_lookup);
	newType.m_isDebug = false;
	return newType;
};
oFF.HuHorizonPluginCategory.lookup = function(name)
{
	return oFF.UiBaseConstant.lookupConstant(name, oFF.HuHorizonPluginCategory.s_lookup);
};
oFF.HuHorizonPluginCategory.prototype.m_isDebug = false;
oFF.HuHorizonPluginCategory.prototype.isDebug = function()
{
	return this.m_isDebug;
};
oFF.HuHorizonPluginCategory.prototype.setIsDebug = function()
{
	this.m_isDebug = true;
	return this;
};

oFF.HuHorizonPluginType = function() {};
oFF.HuHorizonPluginType.prototype = new oFF.UiBaseConstant();
oFF.HuHorizonPluginType.prototype._ff_c = "HuHorizonPluginType";

oFF.HuHorizonPluginType.DOCUMENT = null;
oFF.HuHorizonPluginType.VIEW = null;
oFF.HuHorizonPluginType.COMMAND = null;
oFF.HuHorizonPluginType.TOOLBAR_EXTENSION = null;
oFF.HuHorizonPluginType.MENU_EXTENSION = null;
oFF.HuHorizonPluginType.s_lookup = null;
oFF.HuHorizonPluginType.staticSetup = function()
{
	oFF.HuHorizonPluginType.s_lookup = oFF.XHashMapByString.create();
	oFF.HuHorizonPluginType.DOCUMENT = oFF.HuHorizonPluginType.createWithName("Document").setHasUi();
	oFF.HuHorizonPluginType.VIEW = oFF.HuHorizonPluginType.createWithName("View").setHasUi();
	oFF.HuHorizonPluginType.COMMAND = oFF.HuHorizonPluginType.createWithName("Command");
	oFF.HuHorizonPluginType.TOOLBAR_EXTENSION = oFF.HuHorizonPluginType.createWithName("ToolbarExtension");
	oFF.HuHorizonPluginType.MENU_EXTENSION = oFF.HuHorizonPluginType.createWithName("MenuExtension");
};
oFF.HuHorizonPluginType.createWithName = function(name)
{
	var newType = oFF.UiBaseConstant.createUiConstant(new oFF.HuHorizonPluginType(), name, oFF.HuHorizonPluginType.s_lookup);
	newType.m_hasUi = false;
	return newType;
};
oFF.HuHorizonPluginType.lookup = function(name)
{
	return oFF.UiBaseConstant.lookupConstant(name, oFF.HuHorizonPluginType.s_lookup);
};
oFF.HuHorizonPluginType.prototype.m_hasUi = false;
oFF.HuHorizonPluginType.prototype.hasUi = function()
{
	return this.m_hasUi;
};
oFF.HuHorizonPluginType.prototype.setHasUi = function()
{
	this.m_hasUi = true;
	return this;
};

oFF.HorizonUiApiModule = function() {};
oFF.HorizonUiApiModule.prototype = new oFF.DfModule();
oFF.HorizonUiApiModule.prototype._ff_c = "HorizonUiApiModule";

oFF.HorizonUiApiModule.s_module = null;
oFF.HorizonUiApiModule.getInstance = function()
{
	if (oFF.isNull(oFF.HorizonUiApiModule.s_module))
	{
		oFF.DfModule.checkInitialized(oFF.SystemUiModule.getInstance());
		oFF.HorizonUiApiModule.s_module = oFF.DfModule.startExt(new oFF.HorizonUiApiModule());
		oFF.HuHorizonPluginType.staticSetup();
		oFF.HuHorizonPluginCategory.staticSetup();
		oFF.HuPluginRegistrationApi.staticSetup();
		oFF.DfModule.stopExt(oFF.HorizonUiApiModule.s_module);
	}
	return oFF.HorizonUiApiModule.s_module;
};
oFF.HorizonUiApiModule.prototype.getName = function()
{
	return "ff3600.horizon.ui.api";
};

oFF.HorizonUiApiModule.getInstance();

return sap.firefly;
	} );