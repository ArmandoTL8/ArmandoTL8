/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
[
"sap/sac/df/firefly/ff0200.io"
],
function(oFF)
{
"use strict";

oFF.CMEDynamicActionsProviderDefault = function() {};
oFF.CMEDynamicActionsProviderDefault.prototype = new oFF.XObject();
oFF.CMEDynamicActionsProviderDefault.prototype._ff_c = "CMEDynamicActionsProviderDefault";

oFF.CMEDynamicActionsProviderDefault.prototype.onActionTriggered = function(action, context) {};
oFF.CMEDynamicActionsProviderDefault.prototype.isActionVisible = function(action, context)
{
	return true;
};
oFF.CMEDynamicActionsProviderDefault.prototype.isActionEnabled = function(action, context)
{
	return true;
};

oFF.CMEFactory = {

	s_factory:null,
	s_registry:null,
	setFactory:function(factory)
	{
			oFF.CMEFactory.s_factory = factory;
	},
	createGroupingMenuItem:function()
	{
			if (oFF.isNull(oFF.CMEFactory.s_factory))
		{
			throw oFF.XException.createIllegalStateException("Implementation for Context Menu Engine not initialized");
		}
		return oFF.CMEFactory.s_factory.newGroupingMenuItem();
	},
	createGroupingMenuItemFromPrStructure:function(input)
	{
			if (oFF.isNull(oFF.CMEFactory.s_factory))
		{
			throw oFF.XException.createIllegalStateException("Implementation for Context Menu Engine not initialized");
		}
		return oFF.CMEFactory.s_factory.newGroupingMenuItemFromPrStructure(input);
	},
	serializeGroupingMenuItemToPrStructure:function(groupingMenuItem)
	{
			if (oFF.isNull(oFF.CMEFactory.s_factory))
		{
			throw oFF.XException.createIllegalStateException("Implementation for Context Menu Engine not initialized");
		}
		return oFF.CMEFactory.s_factory.serializeGroupingMenuItemToPrStructure(groupingMenuItem);
	},
	serializeGroupingMenuItemToPaths:function(groupingMenuItem)
	{
			if (oFF.isNull(oFF.CMEFactory.s_factory))
		{
			throw oFF.XException.createIllegalStateException("Implementation for Context Menu Engine not initialized");
		}
		return oFF.CMEFactory.s_factory.serializeGroupingMenuItemToPaths(groupingMenuItem);
	},
	createSelectionOption:function()
	{
			if (oFF.isNull(oFF.CMEFactory.s_factory))
		{
			throw oFF.XException.createIllegalStateException("Implementation for Context Menu Engine not initialized");
		}
		return oFF.CMEFactory.s_factory.newSelectionOption();
	},
	createMultiSelectAction:function()
	{
			if (oFF.isNull(oFF.CMEFactory.s_factory))
		{
			throw oFF.XException.createIllegalStateException("Implementation for Context Menu Engine not initialized");
		}
		return oFF.CMEFactory.s_factory.newMultiSelectAction();
	},
	createSingleSelectAction:function()
	{
			if (oFF.isNull(oFF.CMEFactory.s_factory))
		{
			throw oFF.XException.createIllegalStateException("Implementation for Context Menu Engine not initialized");
		}
		return oFF.CMEFactory.s_factory.newSingleSelectAction();
	},
	createToggleAction:function()
	{
			if (oFF.isNull(oFF.CMEFactory.s_factory))
		{
			throw oFF.XException.createIllegalStateException("Implementation for Context Menu Engine not initialized");
		}
		return oFF.CMEFactory.s_factory.newToggleAction();
	},
	createTriggerAction:function()
	{
			if (oFF.isNull(oFF.CMEFactory.s_factory))
		{
			throw oFF.XException.createIllegalStateException("Implementation for Context Menu Engine not initialized");
		}
		return oFF.CMEFactory.s_factory.newTriggerAction();
	},
	getRegistry:function()
	{
			if (oFF.isNull(oFF.CMEFactory.s_factory))
		{
			throw oFF.XException.createIllegalStateException("Implementation for Context Menu Engine not initialized");
		}
		if (oFF.isNull(oFF.CMEFactory.s_registry))
		{
			oFF.CMEFactory.s_registry = oFF.CMEFactory.s_factory.newRegistry();
		}
		return oFF.CMEFactory.s_registry;
	},
	createContextAccess:function(globalContext, environment)
	{
			if (oFF.isNull(oFF.CMEFactory.s_factory))
		{
			throw oFF.XException.createIllegalStateException("Implementation for Context Menu Engine not initialized");
		}
		return oFF.CMEFactory.s_factory.newContextAccess(globalContext, environment);
	},
	createContext:function()
	{
			if (oFF.isNull(oFF.CMEFactory.s_factory))
		{
			throw oFF.XException.createIllegalStateException("Implementation for Context Menu Engine not initialized");
		}
		return oFF.CMEFactory.s_factory.newContext();
	},
	createMenuTreeGenerator:function()
	{
			if (oFF.isNull(oFF.CMEFactory.s_factory))
		{
			throw oFF.XException.createIllegalStateException("Implementation for Context Menu Engine not initialized");
		}
		return oFF.CMEFactory.s_factory.newMenuTreeGenerator();
	},
	createMenuTreePopulator:function(widgetsFactory)
	{
			if (oFF.isNull(oFF.CMEFactory.s_factory))
		{
			throw oFF.XException.createIllegalStateException("Implementation for Context Menu Engine not initialized");
		}
		return oFF.CMEFactory.s_factory.newMenuTreePopulator(widgetsFactory);
	},
	createMenuTreePopulatorWithSubMapper:function(widgetsFactory, subMapper)
	{
			if (oFF.isNull(oFF.CMEFactory.s_factory))
		{
			throw oFF.XException.createIllegalStateException("Implementation for Context Menu Engine not initialized");
		}
		return oFF.CMEFactory.s_factory.newMenuTreePopulatorWithSubMapper(widgetsFactory, subMapper);
	}
};

oFF.ContextMenuEngineModule = function() {};
oFF.ContextMenuEngineModule.prototype = new oFF.DfModule();
oFF.ContextMenuEngineModule.prototype._ff_c = "ContextMenuEngineModule";

oFF.ContextMenuEngineModule.s_module = null;
oFF.ContextMenuEngineModule.getInstance = function()
{
	if (oFF.isNull(oFF.ContextMenuEngineModule.s_module))
	{
		oFF.DfModule.checkInitialized(oFF.IoModule.getInstance());
		oFF.ContextMenuEngineModule.s_module = oFF.DfModule.startExt(new oFF.ContextMenuEngineModule());
		oFF.DfModule.stopExt(oFF.ContextMenuEngineModule.s_module);
	}
	return oFF.ContextMenuEngineModule.s_module;
};
oFF.ContextMenuEngineModule.prototype.getName = function()
{
	return "ff3400.contextmenu.engine";
};

oFF.ContextMenuEngineModule.getInstance();

return sap.firefly;
	} );