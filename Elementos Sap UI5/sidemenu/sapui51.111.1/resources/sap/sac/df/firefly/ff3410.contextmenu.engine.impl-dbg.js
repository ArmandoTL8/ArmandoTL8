/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
[
"sap/sac/df/firefly/ff3400.contextmenu.engine"
],
function(oFF)
{
"use strict";

oFF.CMEAbstractAction = function() {};
oFF.CMEAbstractAction.prototype = new oFF.XObject();
oFF.CMEAbstractAction.prototype._ff_c = "CMEAbstractAction";

oFF.CMEAbstractAction.mapParams = function(context, operation)
{
	return oFF.XStream.of(operation.getParameters()).map( function(refParam){
		return oFF.XReflectionParam.create(refParam.resolve(context));
	}.bind(this)).collect(oFF.XStreamCollector.toList());
};
oFF.CMEAbstractAction.prototype.m_nameProvider = null;
oFF.CMEAbstractAction.prototype.m_iconProvider = null;
oFF.CMEAbstractAction.prototype.m_textProvider = null;
oFF.CMEAbstractAction.prototype.m_explanationProvider = null;
oFF.CMEAbstractAction.prototype.m_availableProvider = null;
oFF.CMEAbstractAction.prototype.m_enabledProvider = null;
oFF.CMEAbstractAction.prototype.m_highlightProcedure = null;
oFF.CMEAbstractAction.prototype.m_unHighlightProcedure = null;
oFF.CMEAbstractAction.prototype.getName = function(context)
{
	return oFF.isNull(this.m_nameProvider) ? null : this.m_nameProvider(context);
};
oFF.CMEAbstractAction.prototype.getLocalizedText = function(context)
{
	return oFF.isNull(this.m_textProvider) ? null : this.m_textProvider(context);
};
oFF.CMEAbstractAction.prototype.getLocalizedExplanation = function(context)
{
	return oFF.isNull(this.m_explanationProvider) ? null : this.m_explanationProvider(context);
};
oFF.CMEAbstractAction.prototype.getIcon = function(context)
{
	return oFF.isNull(this.m_iconProvider) ? null : this.m_iconProvider(context);
};
oFF.CMEAbstractAction.prototype.isAvailable = function(context)
{
	return oFF.isNull(this.m_availableProvider) ? true : this.m_availableProvider(context);
};
oFF.CMEAbstractAction.prototype.isEnabled = function(context)
{
	return oFF.isNull(this.m_enabledProvider) ? true : this.m_enabledProvider(context);
};
oFF.CMEAbstractAction.prototype.setNameProvider = function(nameProvider)
{
	this.m_nameProvider = nameProvider;
};
oFF.CMEAbstractAction.prototype.setIconProvider = function(iconProvider)
{
	this.m_iconProvider = iconProvider;
};
oFF.CMEAbstractAction.prototype.setReflectionNameProvider = function(registry, operationCreator)
{
	this.setNameProvider( function(context){
		var result = oFF.XReflection.invokeMethodWithArgs(registry.getFacade(operationCreator.getReceiverFacade()), operationCreator.getName(), oFF.CMEAbstractAction.mapParams(context, operationCreator));
		return result.getString();
	}.bind(this));
};
oFF.CMEAbstractAction.prototype.setTextProvider = function(textProvider)
{
	this.m_textProvider = textProvider;
};
oFF.CMEAbstractAction.prototype.setExplanationProvider = function(explanationProvider)
{
	this.m_explanationProvider = explanationProvider;
};
oFF.CMEAbstractAction.prototype.setReflectionTextProvider = function(registry, operationCreator)
{
	this.setTextProvider( function(context){
		var result = oFF.XReflection.invokeMethodWithArgs(registry.getFacade(operationCreator.getReceiverFacade()), operationCreator.getName(), oFF.CMEAbstractAction.mapParams(context, operationCreator));
		return result.getString();
	}.bind(this));
};
oFF.CMEAbstractAction.prototype.setAvailableProvider = function(availableProvider)
{
	this.m_availableProvider = availableProvider;
};
oFF.CMEAbstractAction.prototype.setReflectionAvailableProvider = function(registry, operationCreator)
{
	this.setAvailableProvider( function(context){
		var result = oFF.XReflection.invokeMethodWithArgs(registry.getFacade(operationCreator.getReceiverFacade()), operationCreator.getName(), oFF.CMEAbstractAction.mapParams(context, operationCreator));
		return result.getBoolean();
	}.bind(this));
};
oFF.CMEAbstractAction.prototype.setEnabledProvider = function(enabledProvider)
{
	this.m_enabledProvider = enabledProvider;
};
oFF.CMEAbstractAction.prototype.setReflectionEnabledProvider = function(registry, operationCreator)
{
	this.setEnabledProvider( function(context){
		var result = oFF.XReflection.invokeMethodWithArgs(registry.getFacade(operationCreator.getReceiverFacade()), operationCreator.getName(), oFF.CMEAbstractAction.mapParams(context, operationCreator));
		return result.getBoolean();
	}.bind(this));
};
oFF.CMEAbstractAction.prototype.mapGenericPropertiesToMenuCreator = function(controller, menuItemCreator)
{
	if (oFF.notNull(controller))
	{
		var stringResolver = oFF.CMEValueStringFunctionalResolver.create();
		stringResolver.setFunction( function(nameContext){
			return controller.retrieveName(this, nameContext);
		}.bind(this));
		menuItemCreator.setName(stringResolver);
		stringResolver = oFF.CMEValueStringFunctionalResolver.create();
		stringResolver.setFunction( function(textContext){
			return controller.retrieveText(this, textContext);
		}.bind(this));
		menuItemCreator.setText(stringResolver);
		stringResolver = oFF.CMEValueStringFunctionalResolver.create();
		stringResolver.setFunction( function(iconContext){
			return controller.retrieveIcon(this, iconContext);
		}.bind(this));
		menuItemCreator.setIcon(stringResolver);
		stringResolver = oFF.CMEValueStringFunctionalResolver.create();
		stringResolver.setFunction( function(explanationContext){
			return controller.retrieveExplanation(this, explanationContext);
		}.bind(this));
		menuItemCreator.setExplanation(stringResolver);
		var functionalResolver = oFF.CMEValueFunctionalResolver.create();
		functionalResolver.setFunction( function(enabledContext){
			return oFF.XBooleanValue.create(controller.checkEnabled(this, enabledContext));
		}.bind(this));
		menuItemCreator.addEnabledConstraint(functionalResolver);
		functionalResolver = oFF.CMEValueFunctionalResolver.create();
		functionalResolver.setFunction( function(availableContext){
			return oFF.XBooleanValue.create(controller.checkAvailable(this, availableContext));
		}.bind(this));
		menuItemCreator.addVisibleConstraint(functionalResolver);
		menuItemCreator.setHighlightProcedure( function(highlightContext){
			controller.onHighlight(this, highlightContext);
		}.bind(this));
		menuItemCreator.setUnHighlightProcedure( function(unHighlightContext){
			controller.onUnHighlight(this, unHighlightContext);
		}.bind(this));
	}
	else
	{
		if (oFF.notNull(this.m_nameProvider))
		{
			var nameResolver = oFF.CMEValueStringFunctionalResolver.create();
			nameResolver.setFunction(this.m_nameProvider);
			menuItemCreator.setName(nameResolver);
		}
		if (oFF.notNull(this.m_iconProvider))
		{
			var iconResolver = oFF.CMEValueStringFunctionalResolver.create();
			iconResolver.setFunction(this.m_iconProvider);
			menuItemCreator.setIcon(iconResolver);
		}
		if (oFF.notNull(this.m_textProvider))
		{
			var textResolver = oFF.CMEValueStringFunctionalResolver.create();
			textResolver.setFunction(this.m_textProvider);
			menuItemCreator.setText(textResolver);
		}
		if (oFF.notNull(this.m_explanationProvider))
		{
			var explanationResolver = oFF.CMEValueStringFunctionalResolver.create();
			explanationResolver.setFunction(this.m_explanationProvider);
			menuItemCreator.setExplanation(explanationResolver);
		}
		var enablementResolver = oFF.CMEValueFunctionalResolver.create();
		enablementResolver.setFunction( function(input){
			return oFF.XBooleanValue.create(oFF.isNull(this.m_enabledProvider) || this.m_enabledProvider(input));
		}.bind(this));
		menuItemCreator.addEnabledConstraint(enablementResolver);
		var availableResolver = oFF.CMEValueFunctionalResolver.create();
		availableResolver.setFunction( function(input2){
			return oFF.XBooleanValue.create(oFF.isNull(this.m_availableProvider) || this.m_availableProvider(input2));
		}.bind(this));
		menuItemCreator.addVisibleConstraint(availableResolver);
		menuItemCreator.setHighlightProcedure(this.m_highlightProcedure);
		menuItemCreator.setUnHighlightProcedure(this.m_unHighlightProcedure);
	}
};
oFF.CMEAbstractAction.prototype.setHighlightProcedure = function(highlightProcedure)
{
	this.m_highlightProcedure = highlightProcedure;
};
oFF.CMEAbstractAction.prototype.setUnHighlightProcedure = function(unHighlightProcedure)
{
	this.m_unHighlightProcedure = unHighlightProcedure;
};
oFF.CMEAbstractAction.prototype.highlight = function(context)
{
	if (oFF.notNull(this.m_highlightProcedure))
	{
		this.m_highlightProcedure(context);
	}
};
oFF.CMEAbstractAction.prototype.unHighlight = function(context)
{
	if (oFF.notNull(this.m_unHighlightProcedure))
	{
		this.m_unHighlightProcedure(context);
	}
};
oFF.CMEAbstractAction.prototype.resolveHighlightProcedure = function(contextAccess)
{
	var result = null;
	if (oFF.notNull(this.m_highlightProcedure))
	{
		result =  function(){
			this.m_highlightProcedure(contextAccess);
		}.bind(this);
	}
	return result;
};
oFF.CMEAbstractAction.prototype.resolveUnHighlightProcedure = function(contextAccess)
{
	var result = null;
	if (oFF.notNull(this.m_unHighlightProcedure))
	{
		result =  function(){
			this.m_unHighlightProcedure(contextAccess);
		}.bind(this);
	}
	return result;
};
oFF.CMEAbstractAction.prototype.asMultiSelectAction = function()
{
	return null;
};
oFF.CMEAbstractAction.prototype.asSingleSelectAction = function()
{
	return null;
};
oFF.CMEAbstractAction.prototype.asToggleAction = function()
{
	return null;
};
oFF.CMEAbstractAction.prototype.asTriggerAction = function()
{
	return null;
};

oFF.CMEActionProviderMapper = function() {};
oFF.CMEActionProviderMapper.prototype = new oFF.XObject();
oFF.CMEActionProviderMapper.prototype._ff_c = "CMEActionProviderMapper";

oFF.CMEActionProviderMapper.create = function(provider)
{
	var instance = new oFF.CMEActionProviderMapper();
	instance.m_provider = provider;
	return instance;
};
oFF.CMEActionProviderMapper.prototype.m_provider = null;
oFF.CMEActionProviderMapper.prototype.releaseObject = function()
{
	this.m_provider = oFF.XObjectExt.release(this.m_provider);
};
oFF.CMEActionProviderMapper.prototype.retrieveName = function(action, context)
{
	return null;
};
oFF.CMEActionProviderMapper.prototype.retrieveText = function(action, context)
{
	return null;
};
oFF.CMEActionProviderMapper.prototype.retrieveIcon = function(action, context)
{
	return null;
};
oFF.CMEActionProviderMapper.prototype.retrieveExplanation = function(action, context)
{
	return null;
};
oFF.CMEActionProviderMapper.prototype.checkAvailable = function(action, context)
{
	return this.m_provider.isActionVisible(action.getName(context), context);
};
oFF.CMEActionProviderMapper.prototype.checkEnabled = function(action, context)
{
	return this.m_provider.isActionEnabled(action.getName(context), context);
};
oFF.CMEActionProviderMapper.prototype.checkToggled = function(action, context)
{
	return null;
};
oFF.CMEActionProviderMapper.prototype.onHighlight = function(action, context) {};
oFF.CMEActionProviderMapper.prototype.onUnHighlight = function(action, context) {};
oFF.CMEActionProviderMapper.prototype.onActionTriggered = function(action, context)
{
	this.m_provider.onActionTriggered(action.getName(context), context);
};
oFF.CMEActionProviderMapper.prototype.onActionToggled = function(action, context) {};
oFF.CMEActionProviderMapper.prototype.onActionSingleSelect = function(action, option, context) {};
oFF.CMEActionProviderMapper.prototype.onActionMultiSelect = function(action, option, selected, context) {};

oFF.CMEConstants = {

	NULL:"null",
	TRUE:"true",
	FALSE:"false",
	VAR_PREFIX:"$",
	VAR_PREFIX_SIZE:1,
	ENV_PREFIX:"$env.",
	ENV_PREFIX_SIZE:5,
	DOUBLE_QUOTE:"\"",
	SINGLE_QUOTE:"'"
};

oFF.CMELocalizableTextContextCompound = function() {};
oFF.CMELocalizableTextContextCompound.prototype = new oFF.XObject();
oFF.CMELocalizableTextContextCompound.prototype._ff_c = "CMELocalizableTextContextCompound";

oFF.CMELocalizableTextContextCompound.create = function(match, creator)
{
	var instance = new oFF.CMELocalizableTextContextCompound();
	instance.setupExt(match, creator);
	return instance;
};
oFF.CMELocalizableTextContextCompound.prototype.setupExt = function(match, creator)
{
	this.m_contextMatchConstant = match;
	this.m_localizableTextCreator = creator;
};
oFF.CMELocalizableTextContextCompound.prototype.releaseObject = function()
{
	this.m_localizableTextCreator = oFF.XObjectExt.release(this.m_localizableTextCreator);
	this.m_contextMatchConstant = null;
};
oFF.CMELocalizableTextContextCompound.prototype.m_contextMatchConstant = null;
oFF.CMELocalizableTextContextCompound.prototype.m_localizableTextCreator = null;
oFF.CMELocalizableTextContextCompound.prototype.getMatch = function(contextAccess)
{
	if (contextAccess.resolveValue(this.m_contextMatchConstant) !== null || oFF.XCollectionUtils.hasElements(contextAccess.getSubContexts(this.m_contextMatchConstant)))
	{
		return this.m_localizableTextCreator;
	}
	return null;
};

oFF.CMELocalizableTextCreatorAbstract = function() {};
oFF.CMELocalizableTextCreatorAbstract.prototype = new oFF.XObject();
oFF.CMELocalizableTextCreatorAbstract.prototype._ff_c = "CMELocalizableTextCreatorAbstract";


oFF.CMEMenuCreator = function() {};
oFF.CMEMenuCreator.prototype = new oFF.XObject();
oFF.CMEMenuCreator.prototype._ff_c = "CMEMenuCreator";

oFF.CMEMenuCreator.prototype.m_subContexts = null;
oFF.CMEMenuCreator.prototype.resolveElement = function(parameter, context)
{
	if (oFF.XString.startsWith(parameter, oFF.CMEConstants.VAR_PREFIX))
	{
		return context.getByKey(oFF.XString.substring(parameter, oFF.CMEConstants.VAR_PREFIX_SIZE, oFF.XString.size(parameter)));
	}
	else if (oFF.XString.isEqual(parameter, oFF.CMEConstants.NULL))
	{
		return null;
	}
	else if (oFF.XString.isEqual(parameter, oFF.CMEConstants.TRUE))
	{
		return oFF.PrFactory.createBoolean(true);
	}
	else if (oFF.XString.isEqual(parameter, oFF.CMEConstants.FALSE))
	{
		return oFF.PrFactory.createBoolean(false);
	}
	else if (oFF.XString.match(parameter, "([0-9]*\\.[0-9]+)|[0-9]+"))
	{
		return oFF.PrFactory.createDouble(oFF.XDouble.convertFromString(parameter));
	}
	else if (oFF.XString.startsWith(parameter, oFF.CMEConstants.DOUBLE_QUOTE) && oFF.XString.endsWith(parameter, oFF.CMEConstants.DOUBLE_QUOTE) || oFF.XString.startsWith(parameter, oFF.CMEConstants.SINGLE_QUOTE) && oFF.XString.endsWith(parameter, oFF.CMEConstants.SINGLE_QUOTE))
	{
		return oFF.PrFactory.createString(oFF.XString.substring(parameter, 1, oFF.XString.size(parameter) - 1));
	}
	else
	{
		return oFF.JsonParserFactory.createFromString(parameter);
	}
};
oFF.CMEMenuCreator.prototype.resolveBoolean = function(parameter, context)
{
	var element = this.resolveElement(parameter, context);
	if (oFF.notNull(element))
	{
		return element.asBoolean().getBoolean();
	}
	else
	{
		return oFF.XBoolean.convertFromString(parameter);
	}
};
oFF.CMEMenuCreator.prototype.resolveNumber = function(parameter, context)
{
	var element = this.resolveElement(parameter, context);
	if (oFF.notNull(element))
	{
		return element.asDouble().getDouble();
	}
	else
	{
		return oFF.XDouble.convertFromString(parameter);
	}
};
oFF.CMEMenuCreator.prototype.resolveString = function(parameter, context)
{
	var element = this.resolveElement(parameter, context);
	if (oFF.notNull(element))
	{
		return element.asString().getString();
	}
	else
	{
		return parameter;
	}
};
oFF.CMEMenuCreator.prototype.resolveStructure = function(parameter, context)
{
	var element = this.resolveElement(parameter, context);
	if (oFF.notNull(element))
	{
		return element.asStructure();
	}
	else
	{
		return null;
	}
};
oFF.CMEMenuCreator.prototype.resolveList = function(parameter, context)
{
	var element = this.resolveElement(parameter, context);
	if (oFF.notNull(element))
	{
		return element.asList();
	}
	else
	{
		return null;
	}
};
oFF.CMEMenuCreator.prototype.setSubContextReference = function(context)
{
	this.m_subContexts = context;
};
oFF.CMEMenuCreator.prototype.getSubContext = function(context)
{
	return context.getSubContext(this.m_subContexts);
};
oFF.CMEMenuCreator.prototype.isGroupCreator = function()
{
	return false;
};

oFF.CMEValueContextCompound = function() {};
oFF.CMEValueContextCompound.prototype = new oFF.XObject();
oFF.CMEValueContextCompound.prototype._ff_c = "CMEValueContextCompound";

oFF.CMEValueContextCompound.create = function(contextExpression, resolver)
{
	var instance = new oFF.CMEValueContextCompound();
	instance.setupExpression(contextExpression, resolver);
	return instance;
};
oFF.CMEValueContextCompound.prototype.m_contextExpression = null;
oFF.CMEValueContextCompound.prototype.m_resolver = null;
oFF.CMEValueContextCompound.prototype.setupExpression = function(contextExpression, resolver)
{
	this.m_resolver = resolver;
	this.m_contextExpression = contextExpression;
};
oFF.CMEValueContextCompound.prototype.releaseObject = function()
{
	this.m_resolver = oFF.XObjectExt.release(this.m_resolver);
	this.m_contextExpression = null;
};
oFF.CMEValueContextCompound.prototype.getExpression = function(contextAccess)
{
	if (contextAccess.resolveValue(this.m_contextExpression) !== null || oFF.XCollectionUtils.hasElements(contextAccess.getSubContexts(this.m_contextExpression)))
	{
		return this.m_resolver;
	}
	return null;
};

oFF.CMEValueResolver = function() {};
oFF.CMEValueResolver.prototype = new oFF.XObject();
oFF.CMEValueResolver.prototype._ff_c = "CMEValueResolver";

oFF.CMEValueResolver.prototype.resolveString = function(context)
{
	return oFF.XValueUtil.getString(this.resolve(context));
};
oFF.CMEValueResolver.prototype.resolveNumber = function(context)
{
	return oFF.XValueUtil.getDouble(this.resolve(context), false, true);
};
oFF.CMEValueResolver.prototype.resolveInteger = function(context)
{
	return oFF.XValueUtil.getInteger(this.resolve(context), false, true);
};
oFF.CMEValueResolver.prototype.resolveBoolean = function(context)
{
	return oFF.XValueUtil.getBoolean(this.resolve(context), false, true);
};

oFF.CMECreatorJsonConstants = {

	CME_MENU_FILTERS:"MenuFilters",
	CME_EXCLUDE:"Exclude",
	CME_INCLUDE:"Include",
	CME_ITEM:"Item",
	CME_ITEMS:"Items",
	CME_MENU_NAMES:"MenuNames",
	CME_UI_CONTEXT:"UiContext",
	CME_DATA_CONTEXT:"DataContext",
	CME_OVERFLOW_PRIORITY:"OverflowPriority",
	CME_OVERFLOW_PRIORITY_NEVER:"Never",
	CME_OVERFLOW_PRIORITY_LOW:"Low",
	CME_OVERFLOW_PRIORITY_HIGH:"High",
	CME_OVERFLOW_PRIORITY_DISAPPEAR:"Disappear",
	CME_OVERFLOW_PRIORITY_ALWAYS:"Always",
	CME_OVERFLOW_PRIORITY_NEVER_VALUE:0,
	CME_OVERFLOW_PRIORITY_LOW_VALUE:1,
	CME_OVERFLOW_PRIORITY_HIGH_VALUE:2,
	CME_OVERFLOW_PRIORITY_DISAPPEAR_VALUE:3,
	CME_OVERFLOW_PRIORITY_ALWAYS_VALUE:4,
	CME_MENU_EXTENSIONS:"MenuExtensions",
	CME_EXTENSION:"Extension",
	CME_OPERATION:"Operation",
	CME_OPERATION_REDEFINE:"Redefine",
	CME_OPERATION_PREPEND_INTO:"PrependInto",
	CME_OPERATION_APPEND_INTO:"AppendInto",
	CME_OPERATION_INSERT_BEFORE:"InsertBefore",
	CME_OPERATION_INSERT_AFTER:"InsertAfter",
	CME_REFERENCE:"Reference",
	CME_REFERENCE_ROOT:"$Root",
	CME_ACTION:"Action",
	CME_OPTION:"Option",
	CME_SUBMENU:"Submenu",
	CME_TYPE:"Type",
	CME_NAME:"Name",
	CME_DEFAULT_TEXT:"DefaultText",
	CME_LOCALIZATION_KEY:"LocalizationKey",
	CME_ENABLED:"Enabled",
	CME_VISIBLE:"Visible",
	CME_ICON:"Icon",
	CME_SEPARATOR:"Separator",
	CME_SUBMENUS:"Submenus",
	CME_MENUS:"Menus",
	CME_CONTEXT_ITERATION:"ContextIteration",
	CME_CONTEXT_REMAP:"ContextRemap",
	CME_STRUCTURE_CONFIG:"StructureConfig",
	CME_ACTIONS_FILTER:"ActionFilter",
	CME_CONFIG_ENVIRONMENT:"Environment",
	CME_MAIN:"Main",
	CME_TEMPLATE:"Template",
	CME_SUB_CONTEXT:"SubContext",
	CME_PRIMITIVE:"Primitive",
	CME_PRIMITIVE_GROUP_MENU_ITEM:"GroupMenuItem",
	CME_PRIMITIVE_LEAF_MENU_ITEM:"LeafMenuItem",
	CME_PARAMETERS:"Parameters",
	CME_PARAMETER_NAME:"Name",
	CME_PARAMETER_TEXT:"Text",
	CME_PARAMETER_EXPLANATION:"Explanation",
	CME_PARAMETER_EXPLANATION_LOCALIZATION_KEY:"ExplanationKey",
	CME_PARAMETER_LOCALIZABLE_TEXT:"LocalizableText",
	CME_PARAMETER_LOCALIZATION_KEY:"LocalizationKey",
	CME_PARAMETER_KEY:"Key",
	CME_REPLACEMENTS:"Replacements",
	CME_PARAMETER_ICON:"Icon",
	CME_PARAMETER_ENABLED:"Enabled",
	CME_PARAMETER_VISIBLE:"Visible",
	CME_PARAMETER_ACTIVE:"Active",
	CME_PARAMETER_RESOLVE:"Resolve",
	CME_MATCH_CONTEXT:"MatchContext",
	CME_LOOP_CONTEXT:"LoopContext",
	CME_PARAMETER_FIRST_SUBOPTION_IS_DEFAULT:"FirstSubOptionIsDefault",
	CME_PARAMETER_KEEP_TITLE_FOR_FLAT:"KeepTitleForFlat",
	CME_PARAMETER_FLAT:"Flat",
	CME_PARAMETER_FLAT_IF_LESS_THAN_N_ITEMS:"FlatIfLessThanNItems",
	CME_PARAMETER_HIDE_IF_LESS_THAN_N_ITEMS:"HideIfLessThanNItems",
	CME_PARAMETER_DISABLE_IF_LESS_THAN_N_ITEMS:"DisableIfLessThanNItems",
	CME_PARAMETER_DISABLE_IF_LESS_THAN_N_ENABLED_ITEMS:"DisableIfLessThanNEnabledItems",
	CME_PARAMETER_OVERFLOW_IF_MORE_THAN_N_ITEMS:"OverflowIfMoreThanNItems",
	CME_PARAMETER_OVERFLOW_LOCALIZATION_KEY:"OverflowLocalizationKey",
	CME_PARAMETER_OVERFLOW_TEXT:"OverflowText",
	CME_SUB_ITEMS:"SubItems",
	CME_CONTEXT_MATCH:"ContextMatch",
	CME_OPERATIONS:"Operations",
	CME_FOREACH:"Foreach",
	CME_APPLY:"Apply",
	CME_SWITCH:"Switch",
	CME_MATCH:"Match",
	CME_MIN_SIZE:"MinSize",
	CME_MAX_SIZE:"MaxSize",
	CME_EQUAL:"Equal",
	CME_NOT_EQUAL:"NotEqual",
	CME_EXISTS:"Exists",
	CME_NOT_EXISTS:"NotExists",
	CME_PARAMETER_TOGGLE:"Toggle",
	CME_AND:"And",
	CME_OR:"Or",
	CME_NONE:"None",
	CME_NOT:"Not",
	CME_CONTEXT_TEXT_SUFFIX:".TEXT",
	CME_CONTEXT_PATH_SEPARATOR:"/",
	CME_CONTEXT_REFOCUS:"RefocusContext",
	CME_ACQUIRE_TEXT_FROM_CONTEXT:"AcquireTextFromContext",
	CME_LOGGING_ENABLED:"LoggingEnabled"
};

oFF.CMECreatorJsonHelper = {

	createMainFrom:function(inputStructure, menuName)
	{
			var mainCreator = null;
		if (inputStructure.containsKey(menuName))
		{
			mainCreator = oFF.CMEGroupCreator.create();
			mainCreator.setName(oFF.CMEValueLiteralResolver.create(oFF.XStringValue.create(menuName)));
			var subContextReferences = oFF.XListOfString.create();
			var mainList = inputStructure.getListByKey(menuName);
			oFF.CMECreatorJsonHelper.createSubItemsForGroup(mainCreator, mainList, inputStructure, subContextReferences);
		}
		return mainCreator;
	},
	createSubItemsForGroup:function(groupCreator, subList, inputStructure, context)
	{
			if (oFF.notNull(subList))
		{
			for (var i = 0; i < subList.size(); i++)
			{
				var subElement = subList.get(i);
				if (subElement.isStructure())
				{
					oFF.CMECreatorJsonHelper.generateSubItemFromStructure(groupCreator, subElement, context, inputStructure, null);
				}
				else if (subElement.isString() && oFF.XString.isEqual(oFF.CMECreatorJsonConstants.CME_SEPARATOR, subElement.asString().getString()))
				{
					groupCreator.addMenuCreator(oFF.CMESeparatorCreator.create());
				}
			}
		}
	},
	generateSubItemFromStructure:function(groupCreator, subElement, context, inputStructure, controller)
	{
			var subItem = subElement.asStructure();
		var subContext = context.createListOfStringCopy();
		var receivingGroup = groupCreator;
		if (subItem.hasStringByKey(oFF.CMECreatorJsonConstants.CME_SUB_CONTEXT))
		{
			subContext.add(subItem.getStringByKey(oFF.CMECreatorJsonConstants.CME_SUB_CONTEXT));
		}
		if (subItem.containsKey(oFF.CMECreatorJsonConstants.CME_MATCH_CONTEXT))
		{
			var condMenuCreator = oFF.CMECreatorJsonHelper.createConditionsMenuItem(subItem, inputStructure, context);
			receivingGroup.addMenuCreator(condMenuCreator);
			receivingGroup = condMenuCreator;
			subContext = oFF.XListOfString.create();
		}
		if (subItem.hasStringByKey(oFF.CMECreatorJsonConstants.CME_LOOP_CONTEXT))
		{
			var loopCreator = oFF.CMELoopedMenuCreator.createLoop();
			loopCreator.setSubContextReference(context);
			var loopParam = subItem.getStringByKey(oFF.CMECreatorJsonConstants.CME_LOOP_CONTEXT);
			loopCreator.setLoopParameter(loopParam);
			receivingGroup.addMenuCreator(loopCreator);
			receivingGroup = loopCreator;
			subContext = oFF.XListOfString.create();
		}
		if (subItem.containsKey(oFF.CMECreatorJsonConstants.CME_SUBMENU))
		{
			oFF.CMECreatorJsonHelper.createSubmenuForGroup(receivingGroup, subItem, inputStructure, subContext);
		}
		else if (subItem.containsKey(oFF.CMECreatorJsonConstants.CME_ACTION))
		{
			oFF.CMECreatorJsonHelper.mapAction(receivingGroup, subItem, oFF.CMEFactory.getRegistry(), controller);
		}
		else
		{
			oFF.CMECreatorJsonHelper.createGroupMenuSubItemForGroup(receivingGroup, subItem, inputStructure, subContext);
		}
	},
	mapAction:function(groupCreator, subItem, registry, controller)
	{
			var actionString = subItem.getStringByKey(oFF.CMECreatorJsonConstants.CME_ACTION);
		var action = registry.getAction(actionString);
		var subCreator;
		if (oFF.isNull(action))
		{
			oFF.XLogger.println(oFF.XStringUtils.concatenate3("Adding dummy action ", actionString, " to registry"));
			action = oFF.CMETriggerAction.create();
			action.setNameProvider( function(c){
				return actionString;
			}.bind(this));
			registry.registerAction(actionString, action);
			subCreator = action.mapToMenuCreator(controller);
		}
		else
		{
			subCreator = action.mapToMenuCreator(controller);
			if (subItem.containsKey(oFF.CMECreatorJsonConstants.CME_ITEMS) && subCreator.isGroupCreator())
			{
				var optionList = subItem.getListByKey(oFF.CMECreatorJsonConstants.CME_ITEMS);
				for (var i = 0; i < optionList.size(); i++)
				{
					var optionElement = optionList.getStructureAt(i);
					if (optionElement.hasStringByKey(oFF.CMECreatorJsonConstants.CME_OPTION))
					{
						var option = registry.getOption(optionElement.getStringByKey(oFF.CMECreatorJsonConstants.CME_OPTION));
						if (oFF.notNull(option))
						{
							var optionSub = option.mapToMenuCreator(controller);
							oFF.CMECreatorJsonHelper.setOverrideProperties(optionSub, optionElement);
							subCreator.addMenuCreator(optionSub);
						}
					}
				}
			}
		}
		groupCreator.addMenuCreator(subCreator);
		oFF.CMECreatorJsonHelper.setOverrideProperties(subCreator, subItem);
	},
	setOverrideProperties:function(subCreator, subItem)
	{
			if (subItem.containsKey(oFF.CMECreatorJsonConstants.CME_CONTEXT_REFOCUS) && (subCreator.getText() === null || subCreator.getText() === oFF.CMEValueLiteralResolver.getNullResolver() || subItem.getBooleanByKey(oFF.CMECreatorJsonConstants.CME_ACQUIRE_TEXT_FROM_CONTEXT)))
		{
			subCreator.setLocalizableText(null);
			subCreator.setText(oFF.CMECreatorJsonHelper.createContextPathText(subItem.getStringByKey(oFF.CMECreatorJsonConstants.CME_CONTEXT_REFOCUS)));
		}
		if (subItem.containsKey(oFF.CMECreatorJsonConstants.CME_CONTEXT_ITERATION) && (subCreator.getText() === null || subCreator.getText() === oFF.CMEValueLiteralResolver.getNullResolver() || subItem.getBooleanByKey(oFF.CMECreatorJsonConstants.CME_ACQUIRE_TEXT_FROM_CONTEXT)))
		{
			subCreator.setLocalizableText(null);
			subCreator.setText(oFF.CMECreatorJsonHelper.createContextPathText(subItem.getStringByKey(oFF.CMECreatorJsonConstants.CME_CONTEXT_ITERATION)));
		}
		if (subItem.containsKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_NAME))
		{
			subCreator.setName(oFF.CMECreatorJsonHelper.createResolver(subItem.getByKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_NAME)));
		}
		if (subItem.containsKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_LOCALIZATION_KEY))
		{
			subCreator.setText(null);
			subCreator.setLocalizableText(oFF.CMECreatorJsonHelper.createLocalizableText(subItem.getByKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_LOCALIZATION_KEY)));
		}
		if (subItem.containsKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_TEXT))
		{
			subCreator.setLocalizableText(null);
			subCreator.setText(oFF.CMECreatorJsonHelper.createResolver(subItem.getByKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_TEXT)));
		}
		if (subItem.containsKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_EXPLANATION))
		{
			subCreator.setLocalizableExplanation(null);
			subCreator.setExplanation(oFF.CMECreatorJsonHelper.createResolver(subItem.getByKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_EXPLANATION)));
		}
		if (subItem.containsKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_ICON))
		{
			subCreator.setIcon(oFF.CMECreatorJsonHelper.createResolver(subItem.getByKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_ICON)));
		}
		if (subItem.containsKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_ENABLED))
		{
			subCreator.addEnabledConstraint(oFF.CMECreatorJsonHelper.createResolverExt(subItem.getByKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_ENABLED), oFF.CMEValueLiteralResolver.getTrueResolver()));
		}
		if (subItem.containsKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_VISIBLE))
		{
			subCreator.addVisibleConstraint(oFF.CMECreatorJsonHelper.createResolverExt(subItem.getByKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_VISIBLE), oFF.CMEValueLiteralResolver.getTrueResolver()));
		}
		if (subItem.containsKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_FLAT))
		{
			subCreator.setFlatIfLessThanNItems(subItem.getBooleanByKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_FLAT) ? oFF.CMEValueLiteralResolver.getMinus1Resolver() : oFF.CMEValueLiteralResolver.getPlus1Resolver());
		}
		if (subItem.containsKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_FLAT_IF_LESS_THAN_N_ITEMS))
		{
			subCreator.setFlatIfLessThanNItems(oFF.CMECreatorJsonHelper.createResolverExt(subItem.getByKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_FLAT_IF_LESS_THAN_N_ITEMS), oFF.CMEValueLiteralResolver.getPlus1Resolver()));
		}
		if (subItem.containsKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_KEEP_TITLE_FOR_FLAT))
		{
			subCreator.setKeepTitleForFlat(subItem.getBooleanByKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_KEEP_TITLE_FOR_FLAT));
		}
		if (subItem.containsKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_FIRST_SUBOPTION_IS_DEFAULT))
		{
			subCreator.setFirstSubOptionIsDefault(subItem.getBooleanByKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_FIRST_SUBOPTION_IS_DEFAULT));
		}
		if (subItem.containsKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_HIDE_IF_LESS_THAN_N_ITEMS))
		{
			subCreator.setHideIfLessThanNItems(oFF.CMECreatorJsonHelper.createResolverExt(subItem.getByKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_HIDE_IF_LESS_THAN_N_ITEMS), oFF.CMEValueLiteralResolver.getPlus1Resolver()));
		}
		if (subItem.containsKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_DISABLE_IF_LESS_THAN_N_ITEMS))
		{
			subCreator.setDisableIfLessThanNItems(oFF.CMECreatorJsonHelper.createResolverExt(subItem.getByKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_DISABLE_IF_LESS_THAN_N_ITEMS), oFF.CMEValueLiteralResolver.getPlus1Resolver()));
		}
		if (subItem.containsKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_DISABLE_IF_LESS_THAN_N_ENABLED_ITEMS))
		{
			subCreator.setDisableIfLessThanNEnabledItems(oFF.CMECreatorJsonHelper.createResolverExt(subItem.getByKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_DISABLE_IF_LESS_THAN_N_ENABLED_ITEMS), oFF.CMEValueLiteralResolver.getPlus1Resolver()));
		}
		if (subItem.containsKey(oFF.CMECreatorJsonConstants.CME_OVERFLOW_PRIORITY))
		{
			switch (subItem.getStringByKey(oFF.CMECreatorJsonConstants.CME_OVERFLOW_PRIORITY))
			{
				case oFF.CMECreatorJsonConstants.CME_OVERFLOW_PRIORITY_ALWAYS:
					subCreator.setOverflowPriority(oFF.CMECreatorJsonConstants.CME_OVERFLOW_PRIORITY_ALWAYS_VALUE);
					break;

				case oFF.CMECreatorJsonConstants.CME_OVERFLOW_PRIORITY_DISAPPEAR:
					subCreator.setOverflowPriority(oFF.CMECreatorJsonConstants.CME_OVERFLOW_PRIORITY_DISAPPEAR_VALUE);
					break;

				case oFF.CMECreatorJsonConstants.CME_OVERFLOW_PRIORITY_HIGH:
					subCreator.setOverflowPriority(oFF.CMECreatorJsonConstants.CME_OVERFLOW_PRIORITY_HIGH_VALUE);
					break;

				case oFF.CMECreatorJsonConstants.CME_OVERFLOW_PRIORITY_LOW:
					subCreator.setOverflowPriority(oFF.CMECreatorJsonConstants.CME_OVERFLOW_PRIORITY_LOW_VALUE);
					break;

				case oFF.CMECreatorJsonConstants.CME_OVERFLOW_PRIORITY_NEVER:
					subCreator.setOverflowPriority(oFF.CMECreatorJsonConstants.CME_OVERFLOW_PRIORITY_NEVER_VALUE);
					break;
			}
		}
		if (subItem.containsKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_OVERFLOW_IF_MORE_THAN_N_ITEMS))
		{
			subCreator.setOverflowIfMoreThanNItems(oFF.CMECreatorJsonHelper.createResolverExt(subItem.getByKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_OVERFLOW_IF_MORE_THAN_N_ITEMS), oFF.CMEValueLiteralResolver.getMinus1Resolver()));
		}
		if (subItem.containsKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_OVERFLOW_TEXT))
		{
			subCreator.setOverflowText(oFF.CMECreatorJsonHelper.createResolver(subItem.getByKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_OVERFLOW_TEXT)));
		}
		if (subItem.containsKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_OVERFLOW_LOCALIZATION_KEY))
		{
			subCreator.setOverflowLocalizableText(oFF.CMECreatorJsonHelper.createLocalizableText(subItem.getByKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_OVERFLOW_LOCALIZATION_KEY)));
		}
		if (subItem.containsKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_EXPLANATION_LOCALIZATION_KEY))
		{
			subCreator.setLocalizableExplanation(oFF.CMECreatorJsonHelper.createLocalizableText(subItem.getByKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_EXPLANATION_LOCALIZATION_KEY)));
		}
	},
	createContextPathText:function(contextString)
	{
			var lastContextPathSegment = oFF.XString.substring(contextString, oFF.XString.lastIndexOf(contextString, oFF.CMECreatorJsonConstants.CME_CONTEXT_PATH_SEPARATOR) + 1, -1);
		return oFF.CMEValuePathResolver.create(oFF.XStringUtils.concatenate2(lastContextPathSegment, oFF.CMECreatorJsonConstants.CME_CONTEXT_TEXT_SUFFIX));
	},
	createConditionsMenuItem:function(subItem, inputStructure, context)
	{
			var matchCondition = oFF.CMECreatorJsonHelper.getCondition(subItem);
		var conditionalCreator = oFF.CMEConditionalMenuCreator.create();
		conditionalCreator.setSubContextReference(context);
		conditionalCreator.setContextCondition(matchCondition);
		return conditionalCreator;
	},
	createMatchCondition:function(conditionItem)
	{
			var condition = null;
		if (conditionItem.isString())
		{
			condition = oFF.CMECreatorJsonHelper.createConditionLeaf(conditionItem.asString().getString(), oFF.CMEValueLiteralResolver.getNullResolver(), oFF.CMEConditionalType.EXISTS);
		}
		else if (conditionItem.isStructure())
		{
			var conditionStructure = conditionItem.asStructure();
			if (conditionStructure.containsKey(oFF.CMECreatorJsonConstants.CME_AND))
			{
				condition = oFF.CMECreatorJsonHelper.decorateAlgebraParameters(oFF.CMEContextConditionAlgebra.createAnd(), conditionStructure.getListByKey(oFF.CMECreatorJsonConstants.CME_AND));
			}
			else if (conditionStructure.containsKey(oFF.CMECreatorJsonConstants.CME_OR))
			{
				condition = oFF.CMECreatorJsonHelper.decorateAlgebraParameters(oFF.CMEContextConditionAlgebra.createOr(), conditionStructure.getListByKey(oFF.CMECreatorJsonConstants.CME_OR));
			}
			else if (conditionStructure.containsKey(oFF.CMECreatorJsonConstants.CME_NONE))
			{
				condition = oFF.CMECreatorJsonHelper.decorateAlgebraParameters(oFF.CMEContextConditionAlgebra.createNone(), conditionStructure.getListByKey(oFF.CMECreatorJsonConstants.CME_NONE));
			}
			else if (conditionStructure.containsKey(oFF.CMECreatorJsonConstants.CME_NOT))
			{
				var notCondition = oFF.CMEContextConditionNot.create();
				notCondition.setBaseCondition(oFF.CMECreatorJsonHelper.createMatchCondition(conditionStructure.getByKey(oFF.CMECreatorJsonConstants.CME_NOT)));
				condition = notCondition;
			}
			else
			{
				var conditionalType = oFF.CMEConditionalType.EXISTS;
				var resolver = oFF.CMEValueLiteralResolver.getNullResolver();
				var matchString = conditionStructure.getStringByKey(oFF.CMECreatorJsonConstants.CME_MATCH);
				if (conditionStructure.containsKey(oFF.CMECreatorJsonConstants.CME_MIN_SIZE))
				{
					conditionalType = oFF.CMEConditionalType.MIN_SIZE;
					resolver = oFF.CMECreatorJsonHelper.createResolver(conditionStructure.getByKey(oFF.CMECreatorJsonConstants.CME_MIN_SIZE));
				}
				else if (conditionStructure.containsKey(oFF.CMECreatorJsonConstants.CME_MAX_SIZE))
				{
					conditionalType = oFF.CMEConditionalType.MAX_SIZE;
					resolver = oFF.CMECreatorJsonHelper.createResolver(conditionStructure.getByKey(oFF.CMECreatorJsonConstants.CME_MAX_SIZE));
				}
				else if (conditionStructure.containsKey(oFF.CMECreatorJsonConstants.CME_EQUAL))
				{
					conditionalType = oFF.CMEConditionalType.EQUAL;
					resolver = oFF.CMECreatorJsonHelper.createResolver(conditionStructure.getByKey(oFF.CMECreatorJsonConstants.CME_EQUAL));
				}
				else if (conditionStructure.containsKey(oFF.CMECreatorJsonConstants.CME_NOT_EQUAL))
				{
					conditionalType = oFF.CMEConditionalType.NOT_EQUAL;
					resolver = oFF.CMECreatorJsonHelper.createResolver(conditionStructure.getByKey(oFF.CMECreatorJsonConstants.CME_NOT_EQUAL));
				}
				else if (conditionStructure.containsKey(oFF.CMECreatorJsonConstants.CME_NOT_EXISTS))
				{
					conditionalType = oFF.CMEConditionalType.NOT_EXISTS;
				}
				condition = oFF.CMECreatorJsonHelper.createConditionLeaf(matchString, resolver, conditionalType);
			}
		}
		return condition;
	},
	decorateAlgebraParameters:function(condition, subConditionList)
	{
			for (var i = 0; i < subConditionList.size(); i++)
		{
			condition.addSubCondition(oFF.CMECreatorJsonHelper.createMatchCondition(subConditionList.get(i)));
		}
		return condition;
	},
	createConditionLeaf:function(matchString, resolver, conditionalType)
	{
			var result = oFF.CMEContextConditionLeaf.create();
		result.setConditionalType(conditionalType);
		result.setComparison(resolver);
		result.setMatchString(matchString);
		return result;
	},
	createLocalizableText:function(element)
	{
			var result = null;
		var simple;
		if (oFF.notNull(element) && element.isStructure())
		{
			simple = oFF.CMELocalizableTextCreatorSimple.create();
			result = simple;
			var structure = element.asStructure();
			simple.setKey(structure.getStringByKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_KEY));
			var list = structure.getListByKey(oFF.CMECreatorJsonConstants.CME_REPLACEMENTS);
			if (oFF.XCollectionUtils.hasElements(list))
			{
				for (var i = 0; i < list.size(); i++)
				{
					simple.addReplacement(oFF.CMECreatorJsonHelper.createResolver(list.get(i)));
				}
			}
		}
		else if (oFF.notNull(element) && element.isList())
		{
			var compound = oFF.CMELocalizableTextCreatorContextCompound.create();
			result = compound;
			var elementList = element.asList();
			for (var j = 0; j < elementList.size(); j++)
			{
				var listElement = elementList.getStructureAt(j);
				compound.addReplacer(listElement.getStringByKey(oFF.CMECreatorJsonConstants.CME_MATCH_CONTEXT), oFF.CMECreatorJsonHelper.createLocalizableText(listElement));
			}
		}
		else if (oFF.notNull(element) && element.isString())
		{
			simple = oFF.CMELocalizableTextCreatorSimple.create();
			result = simple;
			simple.setKey(element.asString().getString());
		}
		return result;
	},
	createGroupMenuSubItemForGroup:function(groupCreator, subItem, inputStructure, context)
	{
			var subCreator = oFF.CMEGroupCreator.create();
		subCreator.setSubContextReference(context);
		var parameters = subItem.getStructureByKey(oFF.CMECreatorJsonConstants.CME_PARAMETERS);
		if (oFF.notNull(parameters))
		{
			subCreator.setName(oFF.CMECreatorJsonHelper.createResolver(parameters.getByKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_NAME)));
			subCreator.setLocalizableText(oFF.CMECreatorJsonHelper.createLocalizableText(parameters.getByKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_LOCALIZABLE_TEXT)));
			subCreator.setText(oFF.CMECreatorJsonHelper.createResolver(parameters.getByKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_TEXT)));
			subCreator.setExplanation(oFF.CMECreatorJsonHelper.createResolver(parameters.getByKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_EXPLANATION)));
			subCreator.setIcon(oFF.CMECreatorJsonHelper.createResolver(parameters.getByKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_ICON)));
			subCreator.addEnabledConstraint(oFF.CMECreatorJsonHelper.createResolverExt(parameters.getByKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_ENABLED), oFF.CMEValueLiteralResolver.getTrueResolver()));
			subCreator.addVisibleConstraint(oFF.CMECreatorJsonHelper.createResolverExt(parameters.getByKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_VISIBLE), oFF.CMEValueLiteralResolver.getTrueResolver()));
			subCreator.setFlatIfLessThanNItems(parameters.getBooleanByKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_FLAT) ? oFF.CMEValueLiteralResolver.getMinus1Resolver() : oFF.CMEValueLiteralResolver.getZeroResolver());
		}
		var subItems = subItem.getListByKey(oFF.CMECreatorJsonConstants.CME_SUB_ITEMS);
		oFF.CMECreatorJsonHelper.createSubItemsForGroup(subCreator, subItems, inputStructure, oFF.XListOfString.create());
		groupCreator.addMenuCreator(subCreator);
	},
	createResolver:function(element)
	{
			return oFF.CMECreatorJsonHelper.createResolverExt(element, oFF.CMEValueLiteralResolver.getNullResolver());
	},
	createResolverExt:function(element, defaultResolver)
	{
			if (oFF.isNull(element))
		{
			return defaultResolver;
		}
		else if (element.isStructure() && element.asStructure().containsKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_RESOLVE))
		{
			return oFF.CMEValuePathResolver.create(element.asStructure().getStringByKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_RESOLVE));
		}
		else if (element.isList())
		{
			var elementList = element.asList();
			var resolver = oFF.CMEValueContextSwitchResolver.create();
			for (var i = 0; i < elementList.size(); i++)
			{
				var listElement = elementList.getStructureAt(i);
				resolver.addConditionalValue(listElement.getStringByKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_RESOLVE), oFF.CMECreatorJsonHelper.createResolverExt(listElement, defaultResolver));
			}
			return resolver;
		}
		else
		{
			return oFF.CMEValueLiteralResolver.create(element.copyAsPrimitiveXValue());
		}
	},
	createSubmenuForGroup:function(groupCreator, subItem, inputStructure, context)
	{
			var templateReference = subItem.getStringByKey(oFF.CMECreatorJsonConstants.CME_SUBMENU);
		if (inputStructure.containsKey(templateReference))
		{
			oFF.CMECreatorJsonHelper.createSubItemsForGroup(groupCreator, inputStructure.getListByKey(templateReference), inputStructure, context);
		}
	},
	remapSubMenuDefinitions:function(subMenusList)
	{
			var subMenuMap = oFF.XHashMapByString.create();
		if (oFF.XCollectionUtils.hasElements(subMenusList))
		{
			for (var i = 0; i < subMenusList.size(); i++)
			{
				var subMenuStruct = subMenusList.getStructureAt(i);
				subMenuMap.put(subMenuStruct.getStringByKey(oFF.CMECreatorJsonConstants.CME_NAME), subMenuStruct);
			}
		}
		return subMenuMap;
	},
	createMenuGenerator:function(menus, subMenuMap, cmeRegistry, controller)
	{
			return oFF.CMECreatorJsonHelper.createConditionalMenuCreatorGroup(menus, subMenuMap, cmeRegistry, controller);
	},
	createConditionalMenuCreatorGroup:function(menus, subMenuMap, cmeRegistry, controller)
	{
			var menuCreatorGroup = oFF.CMEConditionalMenuCreatorGroup.create();
		for (var i = 0; i < menus.size(); i++)
		{
			var structure = menus.getStructureAt(i);
			var conditionalMenuCreator = oFF.CMECreatorJsonHelper.createConditionalMenuCreator(structure, subMenuMap, cmeRegistry, controller);
			menuCreatorGroup.addConditionalMenuCreator(conditionalMenuCreator);
		}
		return menuCreatorGroup;
	},
	createConditionalMenuCreator:function(structure, subMenuMap, cmeRegistry, controller)
	{
			var menuCreator = oFF.CMEConditionalMenuCreator.create();
		var condition = oFF.CMEContextCondition.create();
		oFF.CMECreatorJsonHelper.setupConditionFromStructure(condition, structure);
		menuCreator.setContextCondition(condition);
		var name = structure.getStringByKey(oFF.CMECreatorJsonConstants.CME_NAME);
		menuCreator.setName(oFF.CMEValueLiteralResolver.create(oFF.XStringValue.create(name)));
		oFF.CMECreatorJsonHelper.addChildCreators(menuCreator, structure, subMenuMap, cmeRegistry, controller);
		return menuCreator;
	},
	addChildCreators:function(menuCreator, structure, subMenuMap, cmeRegistry, controller)
	{
			var children = structure.getListByKey(oFF.CMECreatorJsonConstants.CME_ITEMS);
		for (var i = 0; i < children.size(); i++)
		{
			var menuItemStructure = children.getStructureAt(i);
			var condition = oFF.CMECreatorJsonHelper.getCondition(menuItemStructure);
			if (oFF.notNull(condition))
			{
				var condCreator = oFF.CMEConditionalMenuCreator.create();
				condCreator.setContextCondition(condition);
				oFF.CMECreatorJsonHelper.createMenuCreator(condCreator, menuItemStructure, subMenuMap, cmeRegistry, controller);
				menuCreator.addMenuCreator(condCreator);
			}
			else
			{
				oFF.CMECreatorJsonHelper.createMenuCreator(menuCreator, menuItemStructure, subMenuMap, cmeRegistry, controller);
			}
		}
	},
	createMenuCreator:function(menuCreator, menuItemStructure, subMenuMap, cmeRegistry, controller)
	{
			var groupCreator;
		var remappedCreator;
		if (menuItemStructure.hasStringByKey(oFF.CMECreatorJsonConstants.CME_ACTION))
		{
			remappedCreator = oFF.CMECreatorJsonHelper.checkCreateRefocusCreator(menuCreator, menuItemStructure);
			remappedCreator = oFF.CMECreatorJsonHelper.checkCreateLoopCreator(remappedCreator, menuItemStructure);
			oFF.CMECreatorJsonHelper.mapAction(remappedCreator, menuItemStructure, cmeRegistry, controller);
		}
		else if (menuItemStructure.hasStringByKey(oFF.CMECreatorJsonConstants.CME_SUBMENU))
		{
			var submenuString = menuItemStructure.getStringByKey(oFF.CMECreatorJsonConstants.CME_SUBMENU);
			var subMenuStructure = subMenuMap.getByKey(submenuString);
			if (oFF.isNull(subMenuStructure))
			{
				oFF.XLogger.println(oFF.XStringUtils.concatenate2("Missing submenu config for: ", submenuString));
			}
			else
			{
				remappedCreator = oFF.CMECreatorJsonHelper.checkCreateRefocusCreator(menuCreator, menuItemStructure);
				remappedCreator = oFF.CMECreatorJsonHelper.checkCreateLoopCreator(remappedCreator, menuItemStructure);
				remappedCreator = oFF.CMECreatorJsonHelper.checkCreateRefocusCreator(remappedCreator, subMenuStructure);
				remappedCreator = oFF.CMECreatorJsonHelper.checkCreateLoopCreator(remappedCreator, subMenuStructure);
				groupCreator = oFF.CMEGroupCreator.create();
				remappedCreator.addMenuCreator(groupCreator);
				oFF.CMECreatorJsonHelper.setOverrideProperties(groupCreator, subMenuStructure);
				oFF.CMECreatorJsonHelper.setOverrideProperties(groupCreator, menuItemStructure);
				oFF.CMECreatorJsonHelper.addChildCreators(groupCreator, subMenuStructure, subMenuMap, cmeRegistry, controller);
			}
		}
		else if (menuItemStructure.hasStringByKey(oFF.CMECreatorJsonConstants.CME_TYPE))
		{
			var typeString = menuItemStructure.getStringByKey(oFF.CMECreatorJsonConstants.CME_TYPE);
			if (oFF.XString.isEqual(typeString, oFF.CMECreatorJsonConstants.CME_SEPARATOR))
			{
				var separatorCreator = oFF.CMESeparatorCreator.create();
				menuCreator.addMenuCreator(separatorCreator);
				oFF.CMECreatorJsonHelper.setOverrideProperties(separatorCreator, menuItemStructure);
			}
			else if (oFF.XString.isEqual(typeString, oFF.CMECreatorJsonConstants.CME_SUBMENU))
			{
				remappedCreator = oFF.CMECreatorJsonHelper.checkCreateRefocusCreator(menuCreator, menuItemStructure);
				remappedCreator = oFF.CMECreatorJsonHelper.checkCreateLoopCreator(remappedCreator, menuItemStructure);
				groupCreator = oFF.CMEGroupCreator.create();
				remappedCreator.addMenuCreator(groupCreator);
				oFF.CMECreatorJsonHelper.setOverrideProperties(groupCreator, menuItemStructure);
				oFF.CMECreatorJsonHelper.addChildCreators(groupCreator, menuItemStructure, subMenuMap, cmeRegistry, controller);
			}
		}
	},
	checkCreateRefocusCreator:function(menuCreator, menuItemStructure)
	{
			var resultCreator = menuCreator;
		if (menuItemStructure.hasStringByKey(oFF.CMECreatorJsonConstants.CME_CONTEXT_REFOCUS))
		{
			var refocusedMenuCreator = oFF.CMERefocusedMenuCreator.createRefocus();
			refocusedMenuCreator.setRefocusParameter(menuItemStructure.getStringByKey(oFF.CMECreatorJsonConstants.CME_CONTEXT_REFOCUS));
			menuCreator.addMenuCreator(refocusedMenuCreator);
			resultCreator = refocusedMenuCreator;
		}
		return resultCreator;
	},
	checkCreateLoopCreator:function(menuCreator, menuItemStructure)
	{
			var resultCreator = menuCreator;
		if (menuItemStructure.hasStringByKey(oFF.CMECreatorJsonConstants.CME_CONTEXT_ITERATION))
		{
			var loopMenuCreator = oFF.CMELoopedMenuCreator.createLoop();
			loopMenuCreator.setLoopParameter(menuItemStructure.getStringByKey(oFF.CMECreatorJsonConstants.CME_CONTEXT_ITERATION));
			menuCreator.addMenuCreator(loopMenuCreator);
			resultCreator = loopMenuCreator;
		}
		return resultCreator;
	},
	getCondition:function(structure)
	{
			var condition = null;
		if (structure.containsKey(oFF.CMECreatorJsonConstants.CME_MENU_NAMES) || structure.containsKey(oFF.CMECreatorJsonConstants.CME_UI_CONTEXT) || structure.containsKey(oFF.CMECreatorJsonConstants.CME_DATA_CONTEXT))
		{
			condition = oFF.CMEContextCondition.create();
			oFF.CMECreatorJsonHelper.setupConditionFromStructure(condition, structure);
		}
		return condition;
	},
	createMenuExtender:function(menuMenuExtensions, subMenuMap, cmeRegistry, controller)
	{
			var result = oFF.CMEMenuExtensionGroup.create();
		for (var i = 0; i < menuMenuExtensions.size(); i++)
		{
			var structure = menuMenuExtensions.getStructureAt(i);
			var extension = result.addNewExtension();
			var condition = oFF.CMEContextCondition.create();
			oFF.CMECreatorJsonHelper.setupConditionFromStructure(condition, structure);
			extension.setCondition(condition);
			var list = structure.getListByKey(oFF.CMECreatorJsonConstants.CME_EXTENSION);
			if (oFF.XCollectionUtils.hasElements(list))
			{
				for (var j = 0; j < list.size(); j++)
				{
					var operation = extension.addNewOperation();
					var operationStructure = list.getStructureAt(j);
					var operationType = oFF.CMEMenuExtensionOperationType.lookup(operationStructure.getStringByKeyExt(oFF.CMECreatorJsonConstants.CME_OPERATION, oFF.CMECreatorJsonConstants.CME_OPERATION_REDEFINE));
					operation.setOperationType(operationType);
					operation.setReference(operationStructure.getStringByKeyExt(oFF.CMECreatorJsonConstants.CME_REFERENCE, oFF.CMECreatorJsonConstants.CME_REFERENCE_ROOT));
					condition = oFF.CMEContextCondition.create();
					oFF.CMECreatorJsonHelper.setupConditionFromStructure(condition, operationStructure);
					operation.setCondition(condition);
					var groupCreator = oFF.CMEGroupCreator.create();
					oFF.CMECreatorJsonHelper.addChildCreators(groupCreator, operationStructure, subMenuMap, cmeRegistry, controller);
					operation.setGroupCreator(groupCreator);
				}
			}
		}
		return result;
	},
	createMenuFilter:function(menuFilters)
	{
			var result = oFF.CMEMenuFilterList.create();
		for (var i = 0; i < menuFilters.size(); i++)
		{
			var j;
			var structure = menuFilters.getStructureAt(i);
			var filter = result.addNewMenuFilter();
			var condition = oFF.CMEContextCondition.create();
			oFF.CMECreatorJsonHelper.setupConditionFromStructure(condition, structure);
			filter.setCondition(condition);
			var list;
			if (structure.containsKey(oFF.CMECreatorJsonConstants.CME_EXCLUDE))
			{
				list = structure.getListByKey(oFF.CMECreatorJsonConstants.CME_EXCLUDE);
				for (j = 0; j < list.size(); j++)
				{
					oFF.CMECreatorJsonHelper.setupFilterOperation(filter.addNewExcludeOperation(), list.getStructureAt(j));
				}
			}
			if (structure.containsKey(oFF.CMECreatorJsonConstants.CME_INCLUDE))
			{
				list = structure.getListByKey(oFF.CMECreatorJsonConstants.CME_INCLUDE);
				for (j = 0; j < list.size(); j++)
				{
					oFF.CMECreatorJsonHelper.setupFilterOperation(filter.addNewIncludeOperation(), list.getStructureAt(j));
				}
			}
		}
		return result;
	},
	setupFilterOperation:function(operation, structure)
	{
			var condition = oFF.CMEContextCondition.create();
		oFF.CMECreatorJsonHelper.setupConditionFromStructure(condition, structure);
		operation.setCondition(condition);
		operation.setPath(structure.getStringByKey(oFF.CMECreatorJsonConstants.CME_ITEM));
	},
	setupConditionFromStructure:function(condition, structure)
	{
			var j;
		if (structure.containsKey(oFF.CMECreatorJsonConstants.CME_MENU_NAMES))
		{
			var menuNames = structure.getListByKey(oFF.CMECreatorJsonConstants.CME_MENU_NAMES);
			for (j = 0; j < menuNames.size(); j++)
			{
				condition.addMatchingMenuName(menuNames.getStringAt(j));
			}
		}
		if (structure.containsKey(oFF.CMECreatorJsonConstants.CME_UI_CONTEXT))
		{
			var uiContext = structure.getListByKey(oFF.CMECreatorJsonConstants.CME_UI_CONTEXT);
			for (j = 0; j < uiContext.size(); j++)
			{
				condition.addMatchingUiContext(uiContext.getStringAt(j));
			}
		}
		if (structure.containsKey(oFF.CMECreatorJsonConstants.CME_DATA_CONTEXT))
		{
			var dataContext = structure.getListByKey(oFF.CMECreatorJsonConstants.CME_DATA_CONTEXT);
			for (j = 0; j < dataContext.size(); j++)
			{
				condition.addMatchingDataContext(dataContext.getStringAt(j));
			}
		}
	}
};

oFF.CMECreatorJsonHelperLegacy = {

	createMainFrom:function(inputStructure)
	{
			var mainCreator = null;
		if (inputStructure.containsKey(oFF.CMECreatorJsonConstants.CME_MAIN))
		{
			mainCreator = oFF.CMEGroupCreator.create();
			var subContextReferences = oFF.XListOfString.create();
			var mainList = inputStructure.getListByKey(oFF.CMECreatorJsonConstants.CME_MAIN);
			oFF.CMECreatorJsonHelperLegacy.createSubItemsForGroup(mainCreator, mainList, inputStructure, subContextReferences);
		}
		return mainCreator;
	},
	createSubItemsForGroup:function(groupCreator, subList, inputStructure, context)
	{
			if (oFF.notNull(subList))
		{
			for (var i = 0; i < subList.size(); i++)
			{
				var subItem = subList.getStructureAt(i);
				var subContext = context.createListOfStringCopy();
				if (subItem.hasStringByKey(oFF.CMECreatorJsonConstants.CME_SUB_CONTEXT))
				{
					subContext.add(subItem.getStringByKey(oFF.CMECreatorJsonConstants.CME_SUB_CONTEXT));
				}
				if (subItem.containsKey(oFF.CMECreatorJsonConstants.CME_TEMPLATE))
				{
					oFF.CMECreatorJsonHelperLegacy.createTemplateSubItemForGroup(groupCreator, subItem, inputStructure, subContext);
				}
				else if (subItem.containsKey(oFF.CMECreatorJsonConstants.CME_PRIMITIVE))
				{
					var primitiveString = subItem.getStringByKey(oFF.CMECreatorJsonConstants.CME_PRIMITIVE);
					if (oFF.XString.isEqual(primitiveString, oFF.CMECreatorJsonConstants.CME_PRIMITIVE_GROUP_MENU_ITEM))
					{
						oFF.CMECreatorJsonHelperLegacy.createGroupMenuSubItemForGroup(groupCreator, subItem, inputStructure, subContext);
					}
					else if (oFF.XString.isEqual(primitiveString, oFF.CMECreatorJsonConstants.CME_PRIMITIVE_LEAF_MENU_ITEM))
					{
						oFF.CMECreatorJsonHelperLegacy.createLeafMenuSubItemForGroup(groupCreator, subItem, inputStructure, subContext);
					}
				}
				else if (subItem.containsKey(oFF.CMECreatorJsonConstants.CME_FOREACH))
				{
					oFF.CMECreatorJsonHelperLegacy.createLoopMenuSubItemForGroup(groupCreator, subItem, inputStructure, subContext);
				}
				else if (subItem.containsKey(oFF.CMECreatorJsonConstants.CME_SWITCH))
				{
					oFF.CMECreatorJsonHelperLegacy.createConditionsGroupMenuSubItem(groupCreator, subItem, inputStructure, subContext);
				}
				else if (subItem.containsKey(oFF.CMECreatorJsonConstants.CME_ACTION))
				{
					oFF.CMECreatorJsonHelperLegacy.mapAction(groupCreator, subItem, inputStructure, subContext);
				}
			}
		}
	},
	mapAction:function(groupCreator, subItem, inputStructure, subContext)
	{
			var actionString = subItem.getStringByKey(oFF.CMECreatorJsonConstants.CME_ACTION);
		var registry = oFF.CMEFactory.getRegistry();
		var action = registry.getAction(actionString);
		if (oFF.isNull(action))
		{
			oFF.XLogger.println(oFF.XStringUtils.concatenate3("[ERROR] Cannot map action name ", actionString, " to action"));
		}
		else
		{
			groupCreator.addMenuCreator(action.mapToMenuCreator(null));
		}
	},
	createConditionsGroupMenuSubItem:function(groupCreator, subItem, inputStructure, context)
	{
			var subCreator = oFF.CMEConditionalMenuCreatorGroup.create();
		subCreator.setSubContextReference(context);
		var switchList = subItem.getListByKey(oFF.CMECreatorJsonConstants.CME_SWITCH);
		for (var i = 0; i < switchList.size(); i++)
		{
			var switchItem = switchList.getStructureAt(i);
			var subContext = oFF.XListOfString.create();
			if (switchItem.hasStringByKey(oFF.CMECreatorJsonConstants.CME_SUB_CONTEXT))
			{
				subContext.add(switchItem.getStringByKey(oFF.CMECreatorJsonConstants.CME_SUB_CONTEXT));
			}
		}
		groupCreator.addMenuCreator(subCreator);
	},
	createMatchCondition:function(conditionItem)
	{
			var condition = null;
		if (conditionItem.isString())
		{
			condition = oFF.CMECreatorJsonHelperLegacy.createConditionLeaf(conditionItem.asString().getString(), oFF.CMEValueLiteralResolver.getNullResolver(), oFF.CMEConditionalType.EXISTS);
		}
		else if (conditionItem.isStructure())
		{
			var conditionStructure = conditionItem.asStructure();
			if (conditionStructure.containsKey(oFF.CMECreatorJsonConstants.CME_AND))
			{
				condition = oFF.CMECreatorJsonHelperLegacy.decorateAlgebraParameters(oFF.CMEContextConditionAlgebra.createAnd(), conditionStructure.getListByKey(oFF.CMECreatorJsonConstants.CME_AND));
			}
			else if (conditionStructure.containsKey(oFF.CMECreatorJsonConstants.CME_OR))
			{
				condition = oFF.CMECreatorJsonHelperLegacy.decorateAlgebraParameters(oFF.CMEContextConditionAlgebra.createOr(), conditionStructure.getListByKey(oFF.CMECreatorJsonConstants.CME_OR));
			}
			else if (conditionStructure.containsKey(oFF.CMECreatorJsonConstants.CME_NONE))
			{
				condition = oFF.CMECreatorJsonHelperLegacy.decorateAlgebraParameters(oFF.CMEContextConditionAlgebra.createNone(), conditionStructure.getListByKey(oFF.CMECreatorJsonConstants.CME_NONE));
			}
			else if (conditionStructure.containsKey(oFF.CMECreatorJsonConstants.CME_NOT))
			{
				var notCondition = oFF.CMEContextConditionNot.create();
				notCondition.setBaseCondition(oFF.CMECreatorJsonHelperLegacy.createMatchCondition(conditionStructure.getByKey(oFF.CMECreatorJsonConstants.CME_NOT)));
				condition = notCondition;
			}
			else
			{
				var conditionalType = oFF.CMEConditionalType.EXISTS;
				var resolver = oFF.CMEValueLiteralResolver.getNullResolver();
				var matchString = conditionStructure.getStringByKey(oFF.CMECreatorJsonConstants.CME_MATCH);
				if (conditionStructure.containsKey(oFF.CMECreatorJsonConstants.CME_MIN_SIZE))
				{
					conditionalType = oFF.CMEConditionalType.MIN_SIZE;
					resolver = oFF.CMECreatorJsonHelperLegacy.createResolver(conditionStructure.getByKey(oFF.CMECreatorJsonConstants.CME_MIN_SIZE));
				}
				else if (conditionStructure.containsKey(oFF.CMECreatorJsonConstants.CME_MAX_SIZE))
				{
					conditionalType = oFF.CMEConditionalType.MAX_SIZE;
					resolver = oFF.CMECreatorJsonHelperLegacy.createResolver(conditionStructure.getByKey(oFF.CMECreatorJsonConstants.CME_MAX_SIZE));
				}
				else if (conditionStructure.containsKey(oFF.CMECreatorJsonConstants.CME_EQUAL))
				{
					conditionalType = oFF.CMEConditionalType.EQUAL;
					resolver = oFF.CMECreatorJsonHelperLegacy.createResolver(conditionStructure.getByKey(oFF.CMECreatorJsonConstants.CME_EQUAL));
				}
				else if (conditionStructure.containsKey(oFF.CMECreatorJsonConstants.CME_NOT_EQUAL))
				{
					conditionalType = oFF.CMEConditionalType.NOT_EQUAL;
					resolver = oFF.CMECreatorJsonHelperLegacy.createResolver(conditionStructure.getByKey(oFF.CMECreatorJsonConstants.CME_NOT_EQUAL));
				}
				else if (conditionStructure.containsKey(oFF.CMECreatorJsonConstants.CME_NOT_EXISTS))
				{
					conditionalType = oFF.CMEConditionalType.NOT_EXISTS;
				}
				condition = oFF.CMECreatorJsonHelperLegacy.createConditionLeaf(matchString, resolver, conditionalType);
			}
		}
		return condition;
	},
	decorateAlgebraParameters:function(condition, subConditionList)
	{
			for (var i = 0; i < subConditionList.size(); i++)
		{
			condition.addSubCondition(oFF.CMECreatorJsonHelperLegacy.createMatchCondition(subConditionList.get(i)));
		}
		return condition;
	},
	createConditionLeaf:function(matchString, resolver, conditionalType)
	{
			var result = oFF.CMEContextConditionLeaf.create();
		result.setConditionalType(conditionalType);
		result.setComparison(resolver);
		result.setMatchString(matchString);
		return result;
	},
	createLoopMenuSubItemForGroup:function(groupCreator, subItem, inputStructure, context)
	{
			var subCreator = oFF.CMELoopedMenuCreator.createLoop();
		subCreator.setSubContextReference(context);
		var loopParam = subItem.getStringByKey(oFF.CMECreatorJsonConstants.CME_FOREACH);
		subCreator.setLoopParameter(loopParam);
		var apply = subItem.getListByKey(oFF.CMECreatorJsonConstants.CME_APPLY);
		oFF.CMECreatorJsonHelperLegacy.createSubItemsForGroup(subCreator, apply, inputStructure, oFF.XListOfString.create());
		groupCreator.addMenuCreator(subCreator);
	},
	createLeafMenuSubItemForGroup:function(groupCreator, subItem, inputStructure, context)
	{
			var subCreator = oFF.CMELeafCreator.create();
		subCreator.setSubContextReference(context);
		var parameters = subItem.getStructureByKey(oFF.CMECreatorJsonConstants.CME_PARAMETERS);
		if (oFF.notNull(parameters))
		{
			subCreator.setName(oFF.CMECreatorJsonHelperLegacy.createResolver(parameters.getByKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_NAME)));
			subCreator.setLocalizableText(oFF.CMECreatorJsonHelperLegacy.createLocalizableText(parameters.getByKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_LOCALIZABLE_TEXT)));
			subCreator.setText(oFF.CMECreatorJsonHelperLegacy.createResolver(parameters.getByKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_TEXT)));
			subCreator.setIcon(oFF.CMECreatorJsonHelperLegacy.createResolver(parameters.getByKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_ICON)));
			subCreator.addEnabledConstraint(oFF.CMECreatorJsonHelperLegacy.createResolverExt(parameters.getByKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_ENABLED), oFF.CMEValueLiteralResolver.getTrueResolver()));
			subCreator.addVisibleConstraint(oFF.CMECreatorJsonHelperLegacy.createResolverExt(parameters.getByKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_VISIBLE), oFF.CMEValueLiteralResolver.getTrueResolver()));
			subCreator.setActive(oFF.CMECreatorJsonHelperLegacy.createResolverExt(parameters.getByKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_ACTIVE), oFF.CMEValueLiteralResolver.getTrueResolver()));
			subCreator.setToggle(parameters.getBooleanByKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_TOGGLE));
		}
		var subItems = subItem.getListByKey(oFF.CMECreatorJsonConstants.CME_OPERATIONS);
		if (oFF.notNull(subItems))
		{
			for (var i = 0; i < subItems.size(); i++)
			{
				var operation = subItems.get(i);
				var cmeOperation = oFF.CMEOperationCreator.create();
				cmeOperation.setName(operation.getStringByKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_NAME));
				var opParameters = operation.getListByKey(oFF.CMECreatorJsonConstants.CME_PARAMETERS);
				if (oFF.notNull(opParameters))
				{
					for (var j = 0; j < opParameters.size(); j++)
					{
						cmeOperation.addParameter(oFF.CMECreatorJsonHelperLegacy.createResolver(opParameters.get(j)));
					}
				}
				subCreator.addOperation(cmeOperation);
			}
		}
		groupCreator.addMenuCreator(subCreator);
	},
	createLocalizableText:function(element)
	{
			var result = null;
		if (oFF.notNull(element) && element.isStructure())
		{
			var simple = oFF.CMELocalizableTextCreatorSimple.create();
			result = simple;
			var structure = element.asStructure();
			simple.setKey(structure.getStringByKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_KEY));
			var list = structure.getListByKey(oFF.CMECreatorJsonConstants.CME_REPLACEMENTS);
			if (oFF.XCollectionUtils.hasElements(list))
			{
				for (var i = 0; i < list.size(); i++)
				{
					simple.addReplacement(oFF.CMECreatorJsonHelperLegacy.createResolver(list.get(i)));
				}
			}
		}
		else if (oFF.notNull(element) && element.isList())
		{
			var compound = oFF.CMELocalizableTextCreatorContextCompound.create();
			result = compound;
			var elementList = element.asList();
			for (var j = 0; j < elementList.size(); j++)
			{
				var listElement = elementList.getStructureAt(j);
				compound.addReplacer(listElement.getStringByKey(oFF.CMECreatorJsonConstants.CME_MATCH_CONTEXT), oFF.CMECreatorJsonHelperLegacy.createLocalizableText(listElement));
			}
		}
		return result;
	},
	createGroupMenuSubItemForGroup:function(groupCreator, subItem, inputStructure, context)
	{
			var subCreator = oFF.CMEGroupCreator.create();
		subCreator.setSubContextReference(context);
		var parameters = subItem.getStructureByKey(oFF.CMECreatorJsonConstants.CME_PARAMETERS);
		if (oFF.notNull(parameters))
		{
			subCreator.setName(oFF.CMECreatorJsonHelperLegacy.createResolver(parameters.getByKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_NAME)));
			subCreator.setLocalizableText(oFF.CMECreatorJsonHelperLegacy.createLocalizableText(parameters.getByKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_LOCALIZABLE_TEXT)));
			subCreator.setText(oFF.CMECreatorJsonHelperLegacy.createResolver(parameters.getByKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_TEXT)));
			subCreator.setIcon(oFF.CMECreatorJsonHelperLegacy.createResolver(parameters.getByKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_ICON)));
			subCreator.addEnabledConstraint(oFF.CMECreatorJsonHelperLegacy.createResolverExt(parameters.getByKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_ENABLED), oFF.CMEValueLiteralResolver.getTrueResolver()));
			subCreator.addVisibleConstraint(oFF.CMECreatorJsonHelperLegacy.createResolverExt(parameters.getByKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_VISIBLE), oFF.CMEValueLiteralResolver.getTrueResolver()));
			subCreator.setFlatIfLessThanNItems(parameters.getBooleanByKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_FLAT) ? oFF.CMEValueLiteralResolver.getMinus1Resolver() : oFF.CMEValueLiteralResolver.getZeroResolver());
		}
		var subItems = subItem.getListByKey(oFF.CMECreatorJsonConstants.CME_SUB_ITEMS);
		oFF.CMECreatorJsonHelperLegacy.createSubItemsForGroup(subCreator, subItems, inputStructure, oFF.XListOfString.create());
		groupCreator.addMenuCreator(subCreator);
	},
	createResolver:function(element)
	{
			return oFF.CMECreatorJsonHelperLegacy.createResolverExt(element, oFF.CMEValueLiteralResolver.getNullResolver());
	},
	createResolverExt:function(element, defaultResolver)
	{
			if (oFF.isNull(element))
		{
			return defaultResolver;
		}
		else if (element.isStructure() && element.asStructure().containsKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_RESOLVE))
		{
			return oFF.CMEValuePathResolver.create(element.asStructure().getStringByKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_RESOLVE));
		}
		else if (element.isList())
		{
			var elementList = element.asList();
			var resolver = oFF.CMEValueContextSwitchResolver.create();
			for (var i = 0; i < elementList.size(); i++)
			{
				var listElement = elementList.getStructureAt(i);
				resolver.addConditionalValue(listElement.getStringByKey(oFF.CMECreatorJsonConstants.CME_PARAMETER_RESOLVE), oFF.CMECreatorJsonHelperLegacy.createResolverExt(listElement, defaultResolver));
			}
			return resolver;
		}
		else
		{
			return oFF.CMEValueLiteralResolver.create(element.copyAsPrimitiveXValue());
		}
	},
	createTemplateSubItemForGroup:function(groupCreator, subItem, inputStructure, context)
	{
			var templateReference = subItem.getStringByKey(oFF.CMECreatorJsonConstants.CME_TEMPLATE);
		if (inputStructure.containsKey(templateReference))
		{
			oFF.CMECreatorJsonHelperLegacy.createSubItemsForGroup(groupCreator, inputStructure.getListByKey(templateReference), inputStructure, context);
		}
	}
};

oFF.CMEContext = function() {};
oFF.CMEContext.prototype = new oFF.XObject();
oFF.CMEContext.prototype._ff_c = "CMEContext";

oFF.CMEContext.S_CONTEXT_PATH_DELIMITER = "/";
oFF.CMEContext.create = function()
{
	var instance = new oFF.CMEContext();
	instance.setup();
	return instance;
};
oFF.CMEContext.filterSubContextsLists = function(contexts, filter)
{
	var identity = oFF.XList.create();
	for (var i = 0; i < contexts.size(); i++)
	{
		identity.addAll(contexts.get(i).filterSubContextsSimple(filter));
	}
	return identity;
};
oFF.CMEContext.prototype.m_name = null;
oFF.CMEContext.prototype.m_text = null;
oFF.CMEContext.prototype.m_type = null;
oFF.CMEContext.prototype.m_contextParameters = null;
oFF.CMEContext.prototype.m_customObject = null;
oFF.CMEContext.prototype.m_subContexts = null;
oFF.CMEContext.prototype.m_subContextSupplier = null;
oFF.CMEContext.prototype.setup = function()
{
	oFF.XObject.prototype.setup.call( this );
	this.m_subContexts = oFF.XList.create();
};
oFF.CMEContext.prototype.releaseObject = function()
{
	this.m_subContexts = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_subContexts);
	this.m_name = null;
	this.m_type = null;
	this.m_text = null;
	this.m_subContextSupplier = null;
	this.m_customObject = null;
	this.m_contextParameters = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.CMEContext.prototype.getName = function()
{
	return this.m_name;
};
oFF.CMEContext.prototype.getText = function()
{
	return this.m_text;
};
oFF.CMEContext.prototype.getType = function()
{
	return this.m_type;
};
oFF.CMEContext.prototype.setName = function(name)
{
	this.m_name = name;
};
oFF.CMEContext.prototype.setText = function(text)
{
	this.m_text = text;
};
oFF.CMEContext.prototype.setType = function(type)
{
	this.m_type = type;
};
oFF.CMEContext.prototype.getSubContextsByType = function(type)
{
	return oFF.XStream.of(this.getSubContexts()).filter( function(el){
		return oFF.XString.isEqual(type, el.getType());
	}.bind(this)).collect(oFF.XStreamCollector.toList());
};
oFF.CMEContext.prototype.getSubContexts = function()
{
	if (!oFF.XCollectionUtils.hasElements(this.m_subContexts) && oFF.notNull(this.m_subContextSupplier))
	{
		this.m_subContexts.addAll(this.m_subContextSupplier());
	}
	return this.m_subContexts;
};
oFF.CMEContext.prototype.getSubContextsByName = function(name)
{
	return oFF.XStream.of(this.getSubContexts()).filter( function(el){
		return oFF.XString.isEqual(name, el.getName());
	}.bind(this)).collect(oFF.XStreamCollector.toList());
};
oFF.CMEContext.prototype.getSubContextsByTypeAndName = function(type, name)
{
	return oFF.XStream.of(this.getSubContexts()).filter( function(el){
		return (oFF.isNull(type) || oFF.XStringUtils.isWildcardPatternMatching(el.getType(), type)) && (oFF.isNull(name) || oFF.XStringUtils.isWildcardPatternMatching(el.getName(), name));
	}.bind(this)).collect(oFF.XStreamCollector.toList());
};
oFF.CMEContext.prototype.addSubContext = function()
{
	this.m_subContextSupplier = null;
	var newContext = oFF.CMEContext.create();
	this.m_subContexts.add(newContext);
	return newContext;
};
oFF.CMEContext.prototype.setSubContextsSupplier = function(contextSupplier)
{
	this.clearSubContexts();
	this.m_subContextSupplier = contextSupplier;
};
oFF.CMEContext.prototype.getCustomObject = function()
{
	return this.m_customObject;
};
oFF.CMEContext.prototype.clearSubContexts = function()
{
	oFF.XCollectionUtils.releaseEntriesFromCollection(this.m_subContexts);
	this.m_subContexts.clear();
};
oFF.CMEContext.prototype.setCustomObject = function(customObject)
{
	this.m_customObject = customObject;
};
oFF.CMEContext.prototype.filterSubContextsRecursive = function(filter)
{
	return this.filterSubContextsRecursiveByList(oFF.XStringTokenizer.splitString(filter, oFF.CMEContext.S_CONTEXT_PATH_DELIMITER));
};
oFF.CMEContext.prototype.filterSubContextsRecursiveByList = function(filter)
{
	var contextList = oFF.XList.create();
	contextList.add(this);
	var updateList = contextList;
	for (var i = 0; i < filter.size(); i++)
	{
		updateList = oFF.CMEContext.filterSubContextsLists(updateList, filter.get(i));
	}
	return updateList;
};
oFF.CMEContext.prototype.filterSubContextsSimple = function(filter)
{
	var size = oFF.XString.size(filter);
	var separatorIndex = oFF.XString.indexOf(filter, "[");
	var endIndex = oFF.XString.indexOf(filter, "]");
	var filterType = null;
	var filterName = null;
	if (separatorIndex === -1 && endIndex === -1)
	{
		filterType = filter;
	}
	else if (separatorIndex > 0 && endIndex === size - 1)
	{
		filterType = oFF.XString.substring(filter, 0, separatorIndex);
		filterName = oFF.XString.substring(filter, separatorIndex + 1, endIndex);
	}
	return this.getSubContextsByTypeAndName(filterType, filterName);
};
oFF.CMEContext.prototype.getContextParameters = function()
{
	return this.m_contextParameters;
};
oFF.CMEContext.prototype.setContextParameters = function(contextParameters)
{
	this.m_contextParameters = contextParameters;
};

oFF.CMEContextAccess = function() {};
oFF.CMEContextAccess.prototype = new oFF.XObject();
oFF.CMEContextAccess.prototype._ff_c = "CMEContextAccess";

oFF.CMEContextAccess.ENVIRONMENT = "ENVIRONMENT";
oFF.CMEContextAccess.PARAMETERS = "PARAMETERS";
oFF.CMEContextAccess.VALUE = "VALUE";
oFF.CMEContextAccess.TYPE = "TYPE";
oFF.CMEContextAccess.NAME = "NAME";
oFF.CMEContextAccess.TEXT = "TEXT";
oFF.CMEContextAccess.createWithContextAndEnvironment = function(globalContext, environment)
{
	var instance = new oFF.CMEContextAccess();
	instance.setup();
	instance.setGlobalContext(globalContext);
	instance.setLocalContext(globalContext);
	instance.setEnvironment(environment);
	return instance;
};
oFF.CMEContextAccess.createFromPrototype = function(context)
{
	var instance = new oFF.CMEContextAccess();
	instance.m_prStructure = oFF.PrFactory.createStructureDeepCopy(context.m_prStructure);
	instance.m_globalContext = context.m_globalContext;
	instance.m_localContext = context.m_localContext;
	instance.m_uiContext = context.m_uiContext;
	return instance;
};
oFF.CMEContextAccess.prototype.m_localContext = null;
oFF.CMEContextAccess.prototype.m_globalContext = null;
oFF.CMEContextAccess.prototype.m_uiContext = null;
oFF.CMEContextAccess.prototype.m_prStructure = null;
oFF.CMEContextAccess.prototype.setup = function()
{
	oFF.XObject.prototype.setup.call( this );
	this.m_prStructure = oFF.PrFactory.createStructure();
};
oFF.CMEContextAccess.prototype.getGlobalContext = function()
{
	return this.m_globalContext;
};
oFF.CMEContextAccess.prototype.getLocalContext = function()
{
	return this.m_localContext;
};
oFF.CMEContextAccess.prototype.getEnvironment = function()
{
	return this.m_prStructure.getStructureByKey(oFF.CMEContextAccess.ENVIRONMENT);
};
oFF.CMEContextAccess.prototype.getParameters = function()
{
	return this.m_prStructure.getStructureByKey(oFF.CMEContextAccess.PARAMETERS);
};
oFF.CMEContextAccess.prototype.getValue = function()
{
	return this.m_prStructure.getByKey(oFF.CMEContextAccess.VALUE);
};
oFF.CMEContextAccess.prototype.getCopy = function()
{
	return oFF.CMEContextAccess.createFromPrototype(this);
};
oFF.CMEContextAccess.prototype.setGlobalContext = function(globalContext)
{
	this.m_globalContext = globalContext;
};
oFF.CMEContextAccess.prototype.setLocalContext = function(localContext)
{
	this.m_localContext = localContext;
};
oFF.CMEContextAccess.prototype.setEnvironment = function(environment)
{
	this.m_prStructure.put(oFF.CMEContextAccess.ENVIRONMENT, environment);
};
oFF.CMEContextAccess.prototype.setParameters = function(parameters)
{
	this.m_prStructure.put(oFF.CMEContextAccess.PARAMETERS, parameters);
};
oFF.CMEContextAccess.prototype.setValue = function(value)
{
	this.m_prStructure.put(oFF.CMEContextAccess.VALUE, value);
};
oFF.CMEContextAccess.prototype.getStructure = function()
{
	return this.m_prStructure;
};
oFF.CMEContextAccess.prototype.getUiContext = function()
{
	return this.m_uiContext;
};
oFF.CMEContextAccess.prototype.setUiContext = function(uiContext)
{
	this.m_uiContext = uiContext;
};
oFF.CMEContextAccess.prototype.getSubContext = function(subContextKeys)
{
	var subContext = this;
	if (oFF.XCollectionUtils.hasElements(subContextKeys))
	{
		subContext = this.getCopy();
		for (var i = 0; i < subContextKeys.size(); i++)
		{
			var subContextKey = subContextKeys.get(i);
			var subContexts = this.getSubContexts(subContextKey);
			if (oFF.XCollectionUtils.hasElements(subContexts) && subContexts.size() === 1)
			{
				subContext.setLocalContext(subContexts.get(0));
			}
			else
			{
				subContext = null;
				break;
			}
		}
	}
	return subContext;
};
oFF.CMEContextAccess.prototype.getSubContexts = function(accessor)
{
	var subContexts = this.m_localContext.filterSubContextsRecursive(accessor);
	if (!oFF.XCollectionUtils.hasElements(subContexts))
	{
		subContexts = this.m_globalContext.filterSubContextsRecursive(accessor);
	}
	return subContexts;
};
oFF.CMEContextAccess.prototype.getSingleSubContext = function(accessor)
{
	var subContexts = this.getSubContexts(accessor);
	var result = null;
	if (oFF.XCollectionUtils.hasElements(subContexts) && subContexts.size() === 1)
	{
		result = subContexts.get(0);
	}
	return result;
};
oFF.CMEContextAccess.prototype.resolveValue = function(expression)
{
	var result = null;
	if (oFF.XString.startsWith(expression, oFF.CMEConstants.VAR_PREFIX))
	{
		var contextPath = oFF.PrUtilsJsonPath.getJsonPathElements(this.getStructure(), expression);
		var jsonResult = oFF.PrUtilsJsonPath.getJsonPathSingleElement(contextPath);
		result = oFF.isNull(jsonResult) ? null : jsonResult.copyAsPrimitiveXValue();
	}
	else
	{
		var endsWithType = oFF.XString.endsWith(expression, oFF.CMEContextAccess.TYPE);
		var endsWithName = !endsWithType && oFF.XString.endsWith(expression, oFF.CMEContextAccess.NAME);
		var endsWithText = !endsWithType && !endsWithName && oFF.XString.endsWith(expression, oFF.CMEContextAccess.TEXT);
		var size = oFF.XString.size(expression);
		var subContexts = null;
		if (endsWithType)
		{
			subContexts = this.getSubContexts(oFF.XString.substring(expression, 0, size - oFF.XString.size(oFF.CMEContextAccess.TYPE) - 1));
		}
		else if (endsWithName)
		{
			subContexts = this.getSubContexts(oFF.XString.substring(expression, 0, size - oFF.XString.size(oFF.CMEContextAccess.NAME) - 1));
		}
		else if (endsWithText)
		{
			subContexts = this.getSubContexts(oFF.XString.substring(expression, 0, size - oFF.XString.size(oFF.CMEContextAccess.TEXT) - 1));
		}
		if (oFF.XCollectionUtils.hasElements(subContexts) && subContexts.size() === 1)
		{
			var subContext = subContexts.get(0);
			if (endsWithType)
			{
				result = oFF.XStringValue.create(subContext.getType());
			}
			else if (endsWithName)
			{
				result = oFF.XStringValue.create(subContext.getName());
			}
			else if (endsWithText)
			{
				result = oFF.XStringValue.create(subContext.getText());
			}
		}
	}
	return result;
};
oFF.CMEContextAccess.prototype.getLocalSubContexts = function(accessor)
{
	return this.m_localContext.filterSubContextsRecursive(accessor);
};
oFF.CMEContextAccess.prototype.getSingleLocalSubContext = function(accessor)
{
	var subContexts = this.getLocalSubContexts(accessor);
	var result = null;
	if (oFF.XCollectionUtils.hasElements(subContexts) && subContexts.size() === 1)
	{
		result = subContexts.get(0);
	}
	return result;
};
oFF.CMEContextAccess.prototype.getGlobalSubContexts = function(accessor)
{
	return this.m_globalContext.filterSubContextsRecursive(accessor);
};
oFF.CMEContextAccess.prototype.getSingleGlobalSubContext = function(accessor)
{
	var subContexts = this.getGlobalSubContexts(accessor);
	var result = null;
	if (oFF.XCollectionUtils.hasElements(subContexts) && subContexts.size() === 1)
	{
		result = subContexts.get(0);
	}
	return result;
};

oFF.CMEContextCondition = function() {};
oFF.CMEContextCondition.prototype = new oFF.XObject();
oFF.CMEContextCondition.prototype._ff_c = "CMEContextCondition";

oFF.CMEContextCondition.AND_OPERATOR_STRING = "&&";
oFF.CMEContextCondition.NOT_OPERATOR_STRING = "!";
oFF.CMEContextCondition.create = function()
{
	var instance = new oFF.CMEContextCondition();
	instance.setup();
	return instance;
};
oFF.CMEContextCondition.prototype.m_uiContexts = null;
oFF.CMEContextCondition.prototype.m_menuNames = null;
oFF.CMEContextCondition.prototype.m_dataContextCondition = null;
oFF.CMEContextCondition.prototype.setup = function()
{
	oFF.XObject.prototype.setup.call( this );
	this.m_uiContexts = oFF.XListOfString.create();
	this.m_menuNames = oFF.XListOfString.create();
	this.m_dataContextCondition = oFF.CMEContextConditionAlgebra.createOr();
};
oFF.CMEContextCondition.prototype.releaseObject = function()
{
	this.m_uiContexts = oFF.XObjectExt.release(this.m_uiContexts);
	this.m_menuNames = oFF.XObjectExt.release(this.m_menuNames);
	this.m_dataContextCondition = oFF.XObjectExt.release(this.m_dataContextCondition);
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.CMEContextCondition.prototype.addMatchingUiContext = function(uiContext)
{
	this.m_uiContexts.add(uiContext);
};
oFF.CMEContextCondition.prototype.addMatchingMenuName = function(menuName)
{
	this.m_menuNames.add(menuName);
};
oFF.CMEContextCondition.prototype.addMatchingDataContext = function(dataContextString)
{
	var tokenizationResult = oFF.XStringTokenizer.splitString(dataContextString, oFF.CMEContextCondition.AND_OPERATOR_STRING);
	if (oFF.XCollectionUtils.hasElements(tokenizationResult))
	{
		if (tokenizationResult.size() === 1)
		{
			this.m_dataContextCondition.addSubCondition(this.parseLeafCondition(tokenizationResult.get(0)));
		}
		else
		{
			var conditionList = oFF.CMEContextConditionAlgebra.createAnd();
			for (var i = 0; i < tokenizationResult.size(); i++)
			{
				conditionList.addSubCondition(this.parseLeafCondition(tokenizationResult.get(i)));
			}
			this.m_dataContextCondition.addSubCondition(conditionList);
		}
	}
};
oFF.CMEContextCondition.prototype.parseLeafCondition = function(string)
{
	var trimmedString = oFF.XString.trim(string);
	var result;
	var leafCondition;
	if (oFF.XString.startsWith(trimmedString, oFF.CMEContextCondition.NOT_OPERATOR_STRING))
	{
		var notCondition = oFF.CMEContextConditionNot.create();
		leafCondition = oFF.CMEContextConditionLeaf.create();
		leafCondition.setMatchString(oFF.XString.trim(oFF.XString.substring(trimmedString, oFF.XString.size(oFF.CMEContextCondition.NOT_OPERATOR_STRING), oFF.XString.size(trimmedString))));
		leafCondition.setConditionalType(oFF.CMEConditionalType.EXISTS);
		notCondition.setBaseCondition(leafCondition);
		result = notCondition;
	}
	else
	{
		leafCondition = oFF.CMEContextConditionLeaf.create();
		leafCondition.setMatchString(oFF.XString.trim(trimmedString));
		leafCondition.setConditionalType(oFF.CMEConditionalType.EXISTS);
		result = leafCondition;
	}
	return result;
};
oFF.CMEContextCondition.prototype.matches = function(contextAccess, menuName)
{
	var match = true;
	match = match && this.m_dataContextCondition.checkCondition(contextAccess);
	match = match && this.checkStringWithWildCardListMatch(this.m_uiContexts, contextAccess.getUiContext());
	match = match && this.checkStringWithWildCardListMatch(this.m_menuNames, menuName);
	return match;
};
oFF.CMEContextCondition.prototype.checkStringWithWildCardListMatch = function(list, matchElement)
{
	var match = true;
	if (oFF.XCollectionUtils.hasElements(list))
	{
		match = false;
		if (oFF.XStringUtils.isNotNullAndNotEmpty(matchElement))
		{
			for (var i = 0; i < list.size(); i++)
			{
				if (oFF.XStringUtils.isWildcardPatternMatching(matchElement, list.get(i)))
				{
					match = true;
					break;
				}
			}
		}
	}
	return match;
};

oFF.CMEContextConditionAbstract = function() {};
oFF.CMEContextConditionAbstract.prototype = new oFF.XObject();
oFF.CMEContextConditionAbstract.prototype._ff_c = "CMEContextConditionAbstract";


oFF.CMEMenuDefinition = function() {};
oFF.CMEMenuDefinition.prototype = new oFF.XObject();
oFF.CMEMenuDefinition.prototype._ff_c = "CMEMenuDefinition";

oFF.CMEMenuDefinition.create = function()
{
	var instance = new oFF.CMEMenuDefinition();
	instance.setup();
	return instance;
};
oFF.CMEMenuDefinition.prototype.m_condition = null;
oFF.CMEMenuDefinition.prototype.m_groupCreator = null;
oFF.CMEMenuDefinition.prototype.m_menuName = null;
oFF.CMEMenuDefinition.prototype.setup = function()
{
	oFF.XObject.prototype.setup.call( this );
};
oFF.CMEMenuDefinition.prototype.releaseObject = function()
{
	this.m_groupCreator = oFF.XObjectExt.release(this.m_groupCreator);
	this.m_menuName = null;
	this.m_condition = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.CMEMenuDefinition.prototype.getCondition = function()
{
	return this.m_condition;
};
oFF.CMEMenuDefinition.prototype.setCondition = function(condition)
{
	this.m_condition = condition;
};
oFF.CMEMenuDefinition.prototype.getMenuName = function()
{
	return this.m_menuName;
};
oFF.CMEMenuDefinition.prototype.setMenuName = function(menuName)
{
	this.m_menuName = menuName;
};
oFF.CMEMenuDefinition.prototype.isApplicableTo = function(contextAccess)
{
	return this.m_condition.matches(contextAccess, null);
};
oFF.CMEMenuDefinition.prototype.createMenu = function(contextAccess)
{
	var groupingMenuItem = oFF.CMEGroupingMenuItem.create();
	groupingMenuItem.setName(this.m_menuName);
	this.m_groupCreator.transform(contextAccess, groupingMenuItem);
	return groupingMenuItem;
};

oFF.CMEMenuDefinitionGroup = function() {};
oFF.CMEMenuDefinitionGroup.prototype = new oFF.XObject();
oFF.CMEMenuDefinitionGroup.prototype._ff_c = "CMEMenuDefinitionGroup";

oFF.CMEMenuDefinitionGroup.create = function()
{
	var instance = new oFF.CMEMenuDefinitionGroup();
	instance.setup();
	return instance;
};
oFF.CMEMenuDefinitionGroup.prototype.m_definitions = null;
oFF.CMEMenuDefinitionGroup.prototype.setup = function()
{
	oFF.XObject.prototype.setup.call( this );
	this.m_definitions = oFF.XList.create();
};
oFF.CMEMenuDefinitionGroup.prototype.releaseObject = function()
{
	this.m_definitions = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_definitions);
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.CMEMenuDefinitionGroup.prototype.addNewDefinition = function()
{
	var newExtension = oFF.CMEMenuDefinition.create();
	this.m_definitions.add(newExtension);
	return newExtension;
};
oFF.CMEMenuDefinitionGroup.prototype.createMenu = function(contextAccess)
{
	var result = oFF.CMEGroupingMenuItem.create();
	for (var i = 0; i < this.m_definitions.size(); i++)
	{
		var definition = this.m_definitions.get(i);
		if (definition.isApplicableTo(contextAccess))
		{
			result = definition.createMenu(contextAccess);
			break;
		}
	}
	return result;
};

oFF.CMEMenuExtension = function() {};
oFF.CMEMenuExtension.prototype = new oFF.XObject();
oFF.CMEMenuExtension.prototype._ff_c = "CMEMenuExtension";

oFF.CMEMenuExtension.create = function()
{
	var instance = new oFF.CMEMenuExtension();
	instance.setup();
	return instance;
};
oFF.CMEMenuExtension.prototype.m_condition = null;
oFF.CMEMenuExtension.prototype.m_operations = null;
oFF.CMEMenuExtension.prototype.setup = function()
{
	oFF.XObject.prototype.setup.call( this );
	this.m_operations = oFF.XList.create();
};
oFF.CMEMenuExtension.prototype.releaseObject = function()
{
	this.m_operations = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_operations);
	this.m_condition = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.CMEMenuExtension.prototype.getCondition = function()
{
	return this.m_condition;
};
oFF.CMEMenuExtension.prototype.setCondition = function(condition)
{
	this.m_condition = condition;
};
oFF.CMEMenuExtension.prototype.addNewOperation = function()
{
	var newOperation = oFF.CMEMenuExtensionOperation.create();
	this.m_operations.add(newOperation);
	return newOperation;
};
oFF.CMEMenuExtension.prototype.isApplicableTo = function(inputItem)
{
	return this.m_condition.matches(inputItem.getContext(), inputItem.getName());
};
oFF.CMEMenuExtension.prototype.extend = function(inputItem)
{
	for (var i = 0; i < this.m_operations.size(); i++)
	{
		var operation = this.m_operations.get(i);
		if (operation.isApplicableTo(inputItem))
		{
			operation.extend(inputItem);
		}
	}
};

oFF.CMEMenuExtensionGroup = function() {};
oFF.CMEMenuExtensionGroup.prototype = new oFF.XObject();
oFF.CMEMenuExtensionGroup.prototype._ff_c = "CMEMenuExtensionGroup";

oFF.CMEMenuExtensionGroup.create = function()
{
	var instance = new oFF.CMEMenuExtensionGroup();
	instance.setup();
	return instance;
};
oFF.CMEMenuExtensionGroup.prototype.m_extensions = null;
oFF.CMEMenuExtensionGroup.prototype.setup = function()
{
	oFF.XObject.prototype.setup.call( this );
	this.m_extensions = oFF.XList.create();
};
oFF.CMEMenuExtensionGroup.prototype.releaseObject = function()
{
	this.m_extensions = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_extensions);
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.CMEMenuExtensionGroup.prototype.addNewExtension = function()
{
	var newExtension = oFF.CMEMenuExtension.create();
	this.m_extensions.add(newExtension);
	return newExtension;
};
oFF.CMEMenuExtensionGroup.prototype.extendMenu = function(inputItem)
{
	for (var i = 0; i < this.m_extensions.size(); i++)
	{
		var extension = this.m_extensions.get(i);
		if (extension.isApplicableTo(inputItem))
		{
			extension.extend(inputItem);
			break;
		}
	}
};

oFF.CMEMenuExtensionOperation = function() {};
oFF.CMEMenuExtensionOperation.prototype = new oFF.XObject();
oFF.CMEMenuExtensionOperation.prototype._ff_c = "CMEMenuExtensionOperation";

oFF.CMEMenuExtensionOperation.create = function()
{
	var instance = new oFF.CMEMenuExtensionOperation();
	instance.setup();
	return instance;
};
oFF.CMEMenuExtensionOperation.prototype.m_operationType = null;
oFF.CMEMenuExtensionOperation.prototype.m_reference = null;
oFF.CMEMenuExtensionOperation.prototype.m_condition = null;
oFF.CMEMenuExtensionOperation.prototype.m_groupCreator = null;
oFF.CMEMenuExtensionOperation.prototype.releaseObject = function()
{
	this.m_operationType = null;
	this.m_reference = null;
	this.m_condition = oFF.XObjectExt.release(this.m_condition);
	this.m_groupCreator = oFF.XObjectExt.release(this.m_groupCreator);
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.CMEMenuExtensionOperation.prototype.isApplicableTo = function(inputItem)
{
	return this.m_condition.matches(inputItem.getContext(), inputItem.getName());
};
oFF.CMEMenuExtensionOperation.prototype.extend = function(inputItem)
{
	var referenceItems = inputItem.findItemsByNameOrAlias(this.m_reference, true);
	if (oFF.XCollectionUtils.hasElements(referenceItems))
	{
		for (var i = 0; i < referenceItems.size(); i++)
		{
			var groupingItem = oFF.CMEGroupingMenuItem.create();
			this.m_groupCreator.transform(inputItem.getContext(), groupingItem);
			var subItems = groupingItem.getSubItems();
			if (oFF.XCollectionUtils.hasElements(subItems))
			{
				this.applyOperation(referenceItems.get(i), subItems.get(0).getActionGroup().getSubItems());
			}
		}
	}
};
oFF.CMEMenuExtensionOperation.prototype.applyOperation = function(abstractItem, subItems)
{
	if (this.m_operationType === oFF.CMEMenuExtensionOperationType.INSERT_BEFORE)
	{
		abstractItem.addSubItemsBefore(subItems);
	}
	else if (this.m_operationType === oFF.CMEMenuExtensionOperationType.INSERT_AFTER)
	{
		abstractItem.addSubItemsAfter(subItems);
	}
	else if (this.m_operationType === oFF.CMEMenuExtensionOperationType.PREPEND_INTO)
	{
		abstractItem.addSubItemsAtStart(subItems);
	}
	else if (this.m_operationType === oFF.CMEMenuExtensionOperationType.APPEND_INTO)
	{
		abstractItem.addSubItemsAtEnd(subItems);
	}
	else if (this.m_operationType === oFF.CMEMenuExtensionOperationType.REDEFINE)
	{
		abstractItem.clearSubItems();
		abstractItem.addSubItemsAtEnd(subItems);
	}
};
oFF.CMEMenuExtensionOperation.prototype.getOperationType = function()
{
	return this.m_operationType;
};
oFF.CMEMenuExtensionOperation.prototype.setOperationType = function(operationType)
{
	this.m_operationType = operationType;
};
oFF.CMEMenuExtensionOperation.prototype.getReference = function()
{
	return this.m_reference;
};
oFF.CMEMenuExtensionOperation.prototype.setReference = function(reference)
{
	this.m_reference = reference;
};
oFF.CMEMenuExtensionOperation.prototype.getCondition = function()
{
	return this.m_condition;
};
oFF.CMEMenuExtensionOperation.prototype.setCondition = function(condition)
{
	this.m_condition = condition;
};
oFF.CMEMenuExtensionOperation.prototype.getGroupCreator = function()
{
	return this.m_groupCreator;
};
oFF.CMEMenuExtensionOperation.prototype.setGroupCreator = function(groupCreator)
{
	this.m_groupCreator = groupCreator;
};

oFF.CMEFactoryImpl = function() {};
oFF.CMEFactoryImpl.prototype = new oFF.XObject();
oFF.CMEFactoryImpl.prototype._ff_c = "CMEFactoryImpl";

oFF.CMEFactoryImpl.create = function()
{
	return new oFF.CMEFactoryImpl();
};
oFF.CMEFactoryImpl.prototype.newGroupingMenuItem = function()
{
	return oFF.CMEGroupingMenuItem.create();
};
oFF.CMEFactoryImpl.prototype.newGroupingMenuItemFromPrStructure = function(input)
{
	return oFF.CMEMenuJsonHelper.deserialiseGroupingMenuItem(input);
};
oFF.CMEFactoryImpl.prototype.serializeGroupingMenuItemToPrStructure = function(groupingMenuItem)
{
	return oFF.CMEMenuJsonHelper.serializeGroupingMenuItem(groupingMenuItem, true);
};
oFF.CMEFactoryImpl.prototype.serializeGroupingMenuItemToPaths = function(groupingMenuItem)
{
	return oFF.CMEMenuJsonHelper.serializeGroupingMenuItemToPaths(groupingMenuItem);
};
oFF.CMEFactoryImpl.prototype.newSelectionOption = function()
{
	return oFF.CMESelectionOption.create();
};
oFF.CMEFactoryImpl.prototype.newMultiSelectAction = function()
{
	return oFF.CMEMultiSelectAction.create();
};
oFF.CMEFactoryImpl.prototype.newSingleSelectAction = function()
{
	return oFF.CMESingleSelectAction.create();
};
oFF.CMEFactoryImpl.prototype.newToggleAction = function()
{
	return oFF.CMEToggleAction.create();
};
oFF.CMEFactoryImpl.prototype.newTriggerAction = function()
{
	return oFF.CMETriggerAction.create();
};
oFF.CMEFactoryImpl.prototype.newRegistry = function()
{
	return oFF.CMERegistry.create();
};
oFF.CMEFactoryImpl.prototype.newContextAccess = function(globalContext, environment)
{
	return oFF.CMEContextAccess.createWithContextAndEnvironment(globalContext, environment);
};
oFF.CMEFactoryImpl.prototype.newContext = function()
{
	return oFF.CMEContext.create();
};
oFF.CMEFactoryImpl.prototype.newMenuTreeGenerator = function()
{
	return oFF.CMEMenuTreeGenerator.create();
};
oFF.CMEFactoryImpl.prototype.newMenuTreePopulator = function(widgetsFactory)
{
	var result = oFF.CMEMenuTreePopulatorSelfRef.create(widgetsFactory);
	return result;
};
oFF.CMEFactoryImpl.prototype.newMenuTreePopulatorWithSubMapper = function(widgetsFactory, subMapper)
{
	var result = oFF.CMEMenuTreePopulatorBranching.createWithSubMapper(widgetsFactory, subMapper);
	return result;
};

oFF.CMEMenuFilter = function() {};
oFF.CMEMenuFilter.prototype = new oFF.XObject();
oFF.CMEMenuFilter.prototype._ff_c = "CMEMenuFilter";

oFF.CMEMenuFilter.create = function()
{
	var instance = new oFF.CMEMenuFilter();
	instance.setup();
	return instance;
};
oFF.CMEMenuFilter.prototype.m_excludeOperations = null;
oFF.CMEMenuFilter.prototype.m_includeOperations = null;
oFF.CMEMenuFilter.prototype.m_condition = null;
oFF.CMEMenuFilter.prototype.setup = function()
{
	oFF.XObject.prototype.setup.call( this );
	this.m_excludeOperations = oFF.XList.create();
	this.m_includeOperations = oFF.XList.create();
};
oFF.CMEMenuFilter.prototype.addNewExcludeOperation = function()
{
	var operation = oFF.CMEMenuFilterOperation.create();
	this.m_excludeOperations.add(operation);
	return operation;
};
oFF.CMEMenuFilter.prototype.addNewIncludeOperation = function()
{
	var operation = oFF.CMEMenuFilterOperation.create();
	this.m_includeOperations.add(operation);
	return operation;
};
oFF.CMEMenuFilter.prototype.getCondition = function()
{
	return this.m_condition;
};
oFF.CMEMenuFilter.prototype.setCondition = function(condition)
{
	this.m_condition = condition;
};
oFF.CMEMenuFilter.prototype.releaseObject = function()
{
	this.m_excludeOperations = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_excludeOperations);
	this.m_includeOperations = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_includeOperations);
	this.m_condition = oFF.XObjectExt.release(this.m_condition);
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.CMEMenuFilter.prototype.isApplicableTo = function(inputItem)
{
	return this.m_condition.matches(inputItem.getContext(), inputItem.getName());
};
oFF.CMEMenuFilter.prototype.filter = function(inputItem)
{
	if (oFF.XCollectionUtils.hasElements(this.m_includeOperations))
	{
		inputItem.hideIncludingChildren();
		oFF.CMEMenuFilterUtil.setVisibleMatchingPathResults(inputItem, this.m_includeOperations, true);
	}
	if (oFF.XCollectionUtils.hasElements(this.m_excludeOperations))
	{
		oFF.CMEMenuFilterUtil.setVisibleMatchingPathResults(inputItem, this.m_excludeOperations, false);
	}
	return inputItem;
};

oFF.CMEMenuFilterList = function() {};
oFF.CMEMenuFilterList.prototype = new oFF.XObject();
oFF.CMEMenuFilterList.prototype._ff_c = "CMEMenuFilterList";

oFF.CMEMenuFilterList.create = function()
{
	var instance = new oFF.CMEMenuFilterList();
	instance.setup();
	return instance;
};
oFF.CMEMenuFilterList.prototype.m_filters = null;
oFF.CMEMenuFilterList.prototype.setup = function()
{
	oFF.XObject.prototype.setup.call( this );
	this.m_filters = oFF.XList.create();
};
oFF.CMEMenuFilterList.prototype.releaseObject = function()
{
	this.m_filters = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_filters);
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.CMEMenuFilterList.prototype.filterMenu = function(inputItem)
{
	var result = inputItem;
	for (var i = 0; i < this.m_filters.size(); i++)
	{
		var filter = this.m_filters.get(i);
		if (filter.isApplicableTo(inputItem))
		{
			result = filter.filter(inputItem);
			break;
		}
	}
	return result;
};
oFF.CMEMenuFilterList.prototype.addNewMenuFilter = function()
{
	var newFilter = oFF.CMEMenuFilter.create();
	this.m_filters.add(newFilter);
	return newFilter;
};

oFF.CMEMenuFilterOperation = function() {};
oFF.CMEMenuFilterOperation.prototype = new oFF.XObject();
oFF.CMEMenuFilterOperation.prototype._ff_c = "CMEMenuFilterOperation";

oFF.CMEMenuFilterOperation.create = function()
{
	var instance = new oFF.CMEMenuFilterOperation();
	instance.setup();
	return instance;
};
oFF.CMEMenuFilterOperation.prototype.m_path = null;
oFF.CMEMenuFilterOperation.prototype.m_condition = null;
oFF.CMEMenuFilterOperation.prototype.releaseObject = function()
{
	this.m_path = null;
	this.m_condition = oFF.XObjectExt.release(this.m_condition);
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.CMEMenuFilterOperation.prototype.getPath = function()
{
	return this.m_path;
};
oFF.CMEMenuFilterOperation.prototype.setPath = function(path)
{
	this.m_path = path;
};
oFF.CMEMenuFilterOperation.prototype.getCondition = function()
{
	return this.m_condition;
};
oFF.CMEMenuFilterOperation.prototype.setCondition = function(condition)
{
	this.m_condition = condition;
};
oFF.CMEMenuFilterOperation.prototype.isApplicableTo = function(inputItem)
{
	return this.m_condition.matches(inputItem.getContext(), inputItem.getName());
};

oFF.CMEMenuFilterUtil = {

	PATH_SEPARATOR:"/",
	WILDCARD:"*",
	setVisibleMatchingPathResults:function(menuItem, filterOperation, visible)
	{
			var matched = false;
		var iterator = filterOperation.getIterator();
		while (iterator.hasNext())
		{
			var operation = iterator.next();
			if (operation.isApplicableTo(menuItem))
			{
				matched = oFF.CMEMenuFilterUtil.subItemsMatchPathExt(menuItem, operation.getPath(), visible);
			}
		}
		return matched;
	},
	subItemsMatchPathExt:function(menuItem, matchPath, visible)
	{
			var result;
		if (oFF.XString.startsWith(matchPath, oFF.CMEMenuFilterUtil.PATH_SEPARATOR))
		{
			result = oFF.CMEMenuFilterUtil.oneOfSubItemsMatchesPath(menuItem, oFF.XString.substring(matchPath, oFF.XString.size(oFF.CMEMenuFilterUtil.PATH_SEPARATOR), oFF.XString.size(matchPath)), false, visible);
		}
		else
		{
			result = oFF.CMEMenuFilterUtil.oneOfSubItemsMatchesPath(menuItem, matchPath, true, visible);
		}
		return result;
	},
	itemMatchesPath:function(menuItem, matchPath, partialMatch, visible)
	{
			var abstractMenuItem = menuItem.getMenuItem();
		var separator = menuItem.getMenuSeparator();
		return oFF.notNull(separator) || oFF.notNull(abstractMenuItem) && oFF.CMEMenuFilterUtil.menuItemMatchesPath(abstractMenuItem, matchPath, partialMatch, visible);
	},
	menuItemMatchesPath:function(menuItem, matchPath, partialMatch, visible)
	{
			var result = false;
		var index = oFF.XString.indexOf(matchPath, oFF.CMEMenuFilterUtil.PATH_SEPARATOR);
		var head;
		var tail;
		if (index > -1)
		{
			head = oFF.XString.substring(matchPath, 0, index);
			tail = oFF.XString.substring(matchPath, index + 1, oFF.XString.size(matchPath));
		}
		else
		{
			head = matchPath;
			tail = null;
		}
		var menuItemName = menuItem.getName();
		var menuItemAlias = menuItem.getAlias();
		var groupMenuItem = menuItem.getActionGroup();
		if (oFF.XStringUtils.isNotNullAndNotEmpty(menuItemName) && oFF.XStringUtils.isWildcardPatternMatching(menuItemName, head) || oFF.XStringUtils.isNotNullAndNotEmpty(menuItemAlias) && oFF.XStringUtils.isWildcardPatternMatching(menuItemAlias, head) || oFF.XString.isEqual(head, oFF.CMEMenuFilterUtil.WILDCARD))
		{
			if (oFF.XStringUtils.isNullOrEmpty(tail))
			{
				if (visible)
				{
					menuItem.showIncludingParents();
				}
				else
				{
					menuItem.hideIncludingChildren();
				}
			}
			else if (oFF.XStringUtils.isNotNullAndNotEmpty(tail) && oFF.notNull(groupMenuItem))
			{
				result = oFF.CMEMenuFilterUtil.oneOfSubItemsMatchesPath(groupMenuItem, tail, false, visible);
			}
		}
		else if (partialMatch && oFF.notNull(groupMenuItem))
		{
			result = oFF.CMEMenuFilterUtil.oneOfSubItemsMatchesPath(groupMenuItem, matchPath, true, visible);
		}
		return result;
	},
	oneOfSubItemsMatchesPath:function(gmi, matchPath, partialMatch, visible)
	{
			var result = false;
		var subItems = gmi.getSubItems();
		for (var i = 0; i < subItems.size(); i++)
		{
			var subItem = subItems.get(i);
			if (oFF.CMEMenuFilterUtil.itemMatchesPath(subItem, matchPath, partialMatch, visible))
			{
				result = true;
			}
		}
		return result;
	}
};

oFF.CMEMenuCarrier = function() {};
oFF.CMEMenuCarrier.prototype = new oFF.XObject();
oFF.CMEMenuCarrier.prototype._ff_c = "CMEMenuCarrier";

oFF.CMEMenuCarrier.create = function(menuTreeConsumer, menuTree)
{
	var instance = new oFF.CMEMenuCarrier();
	instance.m_menuTreeConsumer = menuTreeConsumer;
	instance.m_menuTree = menuTree;
	instance.m_pluginMenuConfigs = oFF.XHashMapByString.create();
	return instance;
};
oFF.CMEMenuCarrier.prototype.m_menuTreeConsumer = null;
oFF.CMEMenuCarrier.prototype.m_menuTree = null;
oFF.CMEMenuCarrier.prototype.m_pluginMenuConfigs = null;
oFF.CMEMenuCarrier.prototype.releaseObject = function()
{
	oFF.XObject.prototype.releaseObject.call( this );
	this.m_menuTreeConsumer = null;
	this.m_menuTree = oFF.XObjectExt.release(this.m_menuTree);
	this.m_pluginMenuConfigs = oFF.XObjectExt.release(this.m_pluginMenuConfigs);
};
oFF.CMEMenuCarrier.prototype.getMenuTreeConsumer = function()
{
	return this.m_menuTreeConsumer;
};
oFF.CMEMenuCarrier.prototype.getMenuTree = function()
{
	return this.m_menuTree;
};
oFF.CMEMenuCarrier.prototype.getPluginMenuConfigs = function()
{
	return this.m_pluginMenuConfigs;
};

oFF.CMEMenuFiller = function() {};
oFF.CMEMenuFiller.prototype = new oFF.XObject();
oFF.CMEMenuFiller.prototype._ff_c = "CMEMenuFiller";

oFF.CMEMenuFiller.create = function(treeGenerator, menuPopulator, textMapper)
{
	var instance = new oFF.CMEMenuFiller();
	instance.setupWithTreePopulatorAndMapper(treeGenerator, menuPopulator, textMapper);
	return instance;
};
oFF.CMEMenuFiller.prototype.m_treeGenerator = null;
oFF.CMEMenuFiller.prototype.m_menuPolulator = null;
oFF.CMEMenuFiller.prototype.m_textMapper = null;
oFF.CMEMenuFiller.prototype.setupWithTreePopulatorAndMapper = function(treeGenerator, populator, textMapper)
{
	this.m_treeGenerator = treeGenerator;
	this.m_menuPolulator = populator;
	this.m_textMapper = textMapper;
};
oFF.CMEMenuFiller.prototype.releaseObject = function()
{
	this.m_treeGenerator = null;
	this.m_menuPolulator = null;
	this.m_textMapper = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.CMEMenuFiller.prototype.populateMenu = function(container, context, uiContext, localizator, clearer, consumer)
{
	this.m_treeGenerator.generate(context, uiContext,  function(abstractMenuTree){
		this.localize(abstractMenuTree, localizator);
		if (oFF.notNull(clearer))
		{
			clearer();
		}
		var success = this.remapMenuTreeSave(container, abstractMenuTree, false);
		if (oFF.notNull(consumer) && oFF.XCollectionUtils.hasElements(abstractMenuTree.getSubItems()))
		{
			consumer(abstractMenuTree, success);
		}
	}.bind(this));
};
oFF.CMEMenuFiller.prototype.localize = function(abstractMenuTree, localizator)
{
	if (oFF.notNull(this.m_textMapper) && oFF.notNull(localizator) && oFF.notNull(abstractMenuTree))
	{
		this.mapTexts(abstractMenuTree, localizator);
	}
};
oFF.CMEMenuFiller.prototype.mapTexts = function(menuItem, localizator)
{
	var localizableText = menuItem.getLocalizableText();
	var localizableExplanation = menuItem.getLocalizableExplanation();
	var actionGroup = menuItem.getActionGroup();
	if (oFF.notNull(localizableText))
	{
		menuItem.setText(this.m_textMapper.getMappedValue(localizableText.getKey(), localizableText.getReplacements(), localizator));
	}
	if (oFF.notNull(localizableExplanation))
	{
		menuItem.setExplanation(this.m_textMapper.getMappedValue(localizableText.getKey(), localizableExplanation.getReplacements(), localizator));
	}
	if (oFF.notNull(actionGroup))
	{
		localizableText = actionGroup.getOverflowLocalizableText();
		if (oFF.notNull(localizableText))
		{
			actionGroup.setOverflowText(this.m_textMapper.getMappedValue(localizableText.getKey(), localizableText.getReplacements(), localizator));
		}
		var subList = actionGroup.getSubItems();
		for (var i = 0; i < subList.size(); i++)
		{
			var subMenuItem = subList.get(i).getMenuItem();
			if (oFF.notNull(subMenuItem))
			{
				this.mapTexts(subMenuItem, localizator);
			}
		}
	}
};
oFF.CMEMenuFiller.prototype.remapMenuTreeSave = function(menuContainer, abstractMenuTree, createEmptyList)
{
	var success = oFF.notNull(abstractMenuTree);
	if (success)
	{
		this.m_menuPolulator.remapMenuTree(menuContainer, abstractMenuTree, -1);
	}
	return success;
};

oFF.CMEMenuTreeGenerator = function() {};
oFF.CMEMenuTreeGenerator.prototype = new oFF.XObject();
oFF.CMEMenuTreeGenerator.prototype._ff_c = "CMEMenuTreeGenerator";

oFF.CMEMenuTreeGenerator.create = function()
{
	var instance = new oFF.CMEMenuTreeGenerator();
	instance.setup();
	return instance;
};
oFF.CMEMenuTreeGenerator.prototype.m_envConfig = null;
oFF.CMEMenuTreeGenerator.prototype.m_actionFilter = null;
oFF.CMEMenuTreeGenerator.prototype.m_cmeRegistry = null;
oFF.CMEMenuTreeGenerator.prototype.m_actionController = null;
oFF.CMEMenuTreeGenerator.prototype.m_menuGenerator = null;
oFF.CMEMenuTreeGenerator.prototype.m_actionProviders = null;
oFF.CMEMenuTreeGenerator.prototype.m_actionProviderListeners = null;
oFF.CMEMenuTreeGenerator.prototype.setup = function()
{
	oFF.XObject.prototype.setup.call( this );
	this.m_cmeRegistry = oFF.CMERegistry.create();
	this.m_actionProviders = oFF.XHashMapByString.create();
	this.m_actionProviderListeners = oFF.XHashMapByString.create();
};
oFF.CMEMenuTreeGenerator.prototype.loadConfiguration = function(baseConfiguration)
{
	var envConfig = baseConfiguration.getStructureByKey(oFF.CMECreatorJsonConstants.CME_CONFIG_ENVIRONMENT);
	this.setEnvConfig(envConfig);
	var actionFilter = baseConfiguration.getStructureByKey(oFF.CMECreatorJsonConstants.CME_ACTIONS_FILTER);
	this.setActionFilter(actionFilter);
	var loggingEnabled = baseConfiguration.getBooleanByKey(oFF.CMECreatorJsonConstants.CME_LOGGING_ENABLED);
	this.m_actionController = oFF.CMEActionController.create(loggingEnabled);
	var menus = baseConfiguration.getListByKey(oFF.CMECreatorJsonConstants.CME_MENUS);
	var subMenus = baseConfiguration.getListByKey(oFF.CMECreatorJsonConstants.CME_SUBMENUS);
	var subMenuMap = oFF.CMECreatorJsonHelper.remapSubMenuDefinitions(subMenus);
	if (oFF.XCollectionUtils.hasElements(menus))
	{
		var menuGenerator = oFF.CMECreatorJsonHelper.createMenuGenerator(menus, subMenuMap, this.m_cmeRegistry, this.m_actionController);
		this.setMenuGenerator(menuGenerator);
	}
};
oFF.CMEMenuTreeGenerator.prototype.loadPluginConfiguration = function(configurationName, configuration)
{
	this.registerDynamicActionsProvider(configurationName, oFF.CMEDefaultPluginActionProvider.create(configurationName, configuration));
};
oFF.CMEMenuTreeGenerator.prototype.unloadPluginConfiguration = function(configurationName)
{
	this.unRegisterDynamicActionsProvider(configurationName);
};
oFF.CMEMenuTreeGenerator.prototype.dynamicallyFilterMenu = function(groupingMenuItem, inputStructure)
{
	var menuFilters = oFF.isNull(inputStructure) ? null : inputStructure.getListByKey(oFF.CMECreatorJsonConstants.CME_MENU_FILTERS);
	if (oFF.XCollectionUtils.hasElements(menuFilters))
	{
		var menuFilter = oFF.CMECreatorJsonHelper.createMenuFilter(menuFilters);
		if (oFF.notNull(menuFilter))
		{
			menuFilter.filterMenu(groupingMenuItem);
		}
	}
};
oFF.CMEMenuTreeGenerator.prototype.dynamicallyExtendMenu = function(groupingMenuItem, inputStructure)
{
	var subMenus = oFF.isNull(inputStructure) ? null : inputStructure.getListByKey(oFF.CMECreatorJsonConstants.CME_SUBMENUS);
	var subMenuMap = oFF.CMECreatorJsonHelper.remapSubMenuDefinitions(subMenus);
	var menuMenuExtensions = oFF.isNull(inputStructure) ? null : inputStructure.getListByKey(oFF.CMECreatorJsonConstants.CME_MENU_EXTENSIONS);
	if (oFF.XCollectionUtils.hasElements(menuMenuExtensions))
	{
		var menuExtender = oFF.CMECreatorJsonHelper.createMenuExtender(menuMenuExtensions, subMenuMap, this.m_cmeRegistry, this.m_actionController);
		if (oFF.notNull(menuExtender))
		{
			menuExtender.extendMenu(groupingMenuItem);
		}
	}
};
oFF.CMEMenuTreeGenerator.prototype.registerDynamicActionsProvider = function(name, actionsProvider)
{
	this.unRegisterDynamicActionsProvider(name);
	var mapperListener = oFF.CMEActionProviderMapper.create(actionsProvider);
	this.m_actionProviders.put(name, actionsProvider);
	this.m_actionProviderListeners.put(name, mapperListener);
	this.m_actionController.attachActionListener(mapperListener);
};
oFF.CMEMenuTreeGenerator.prototype.unRegisterDynamicActionsProvider = function(name)
{
	var listener = this.m_actionProviderListeners.getByKey(name);
	this.m_actionController.detachActionListener(listener);
	oFF.XObjectExt.release(listener);
	this.m_actionProviders.remove(name);
};
oFF.CMEMenuTreeGenerator.prototype.clearDynamicActionsProviders = function()
{
	var providerNames = this.m_actionProviders.getKeysAsIteratorOfString();
	while (providerNames.hasNext())
	{
		this.unRegisterDynamicActionsProvider(providerNames.next());
	}
};
oFF.CMEMenuTreeGenerator.prototype.setMenuGenerator = function(menuGenerator)
{
	this.m_menuGenerator = menuGenerator;
};
oFF.CMEMenuTreeGenerator.prototype.releaseObject = function()
{
	this.m_envConfig = oFF.XObjectExt.release(this.m_envConfig);
	this.m_actionFilter = oFF.XObjectExt.release(this.m_actionFilter);
	this.m_menuGenerator = oFF.XObjectExt.release(this.m_menuGenerator);
	this.m_actionProviders = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_actionProviders);
};
oFF.CMEMenuTreeGenerator.prototype.getRegistry = function()
{
	return this.m_cmeRegistry;
};
oFF.CMEMenuTreeGenerator.prototype.generate = function(context, uiContext, menuTreeConsumer)
{
	if (oFF.notNull(this.m_menuGenerator))
	{
		var groupItem = oFF.CMEGroupingMenuItem.create();
		var cmeContext = oFF.CMEContextAccess.createWithContextAndEnvironment(context, this.m_envConfig);
		cmeContext.setUiContext(uiContext);
		this.m_menuGenerator.transform(cmeContext, groupItem);
		groupItem.setContext(cmeContext);
		var tags = groupItem.getTags();
		if (oFF.XCollectionUtils.hasElements(tags))
		{
			groupItem.setName(tags.getValuesAsReadOnlyListOfString().get(0));
		}
		if (oFF.XCollectionUtils.hasElements(this.m_actionProviders))
		{
			var providerNames = this.m_actionProviders.getKeysAsIteratorOfString();
			var provider;
			var carrier = oFF.CMEMenuCarrier.create(menuTreeConsumer, groupItem);
			while (providerNames.hasNext())
			{
				provider = this.m_actionProviders.getByKey(providerNames.next());
				provider.provideMenuConfig(cmeContext, this, carrier);
			}
		}
		else
		{
			this.continueMenuCreation(null, groupItem, menuTreeConsumer);
		}
	}
	else
	{
		menuTreeConsumer(null);
	}
};
oFF.CMEMenuTreeGenerator.prototype.continueMenuCreation = function(subConfigs, groupingMenuItem, menuTreeConsumer)
{
	if (oFF.notNull(menuTreeConsumer) && oFF.notNull(groupingMenuItem))
	{
		if (oFF.notNull(subConfigs))
		{
			oFF.XStream.of(subConfigs.getValuesAsReadOnlyList()).forEach( function(fi){
				this.dynamicallyFilterMenu(groupingMenuItem, fi);
			}.bind(this));
			oFF.XStream.of(subConfigs.getValuesAsReadOnlyList()).forEach( function(ext){
				this.dynamicallyExtendMenu(groupingMenuItem, ext);
			}.bind(this));
		}
		menuTreeConsumer(groupingMenuItem);
	}
};
oFF.CMEMenuTreeGenerator.prototype.createMenuFiller = function(populator, textMapper)
{
	return oFF.CMEMenuFiller.create(this, populator, textMapper);
};
oFF.CMEMenuTreeGenerator.prototype.setEnvConfig = function(envConfig)
{
	this.m_envConfig = envConfig;
};
oFF.CMEMenuTreeGenerator.prototype.setActionFilter = function(actionFilter)
{
	this.m_actionFilter = actionFilter;
};
oFF.CMEMenuTreeGenerator.prototype.getActionFilter = function()
{
	return this.m_actionFilter;
};
oFF.CMEMenuTreeGenerator.prototype.onDynamicMenuConfigProvided = function(context, configName, config, carrier)
{
	var carrierInternal = carrier;
	var dynamicSubConfig = carrierInternal.getPluginMenuConfigs();
	dynamicSubConfig.put(configName, config);
	if (dynamicSubConfig.size() === this.m_actionProviders.size())
	{
		var menuTreeConsumer = carrierInternal.getMenuTreeConsumer();
		if (oFF.notNull(menuTreeConsumer))
		{
			this.continueMenuCreation(dynamicSubConfig, carrierInternal.getMenuTree(), menuTreeConsumer);
		}
		oFF.XObjectExt.release(carrier);
	}
};

oFF.CMEMenuTreePopulatorAbstract = function() {};
oFF.CMEMenuTreePopulatorAbstract.prototype = new oFF.XObject();
oFF.CMEMenuTreePopulatorAbstract.prototype._ff_c = "CMEMenuTreePopulatorAbstract";

oFF.CMEMenuTreePopulatorAbstract.prototype.m_factory = null;
oFF.CMEMenuTreePopulatorAbstract.prototype.releaseObject = function()
{
	this.m_factory = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.CMEMenuTreePopulatorAbstract.prototype.remapMenuTree = function(container, abstractMenuTree, defaultOverflowPriority)
{
	var hasElements = false;
	var sectionStart = this.m_factory.hasItemElements(container);
	var subItems = abstractMenuTree.getEffectiveSubItems();
	if (abstractMenuTree.isFlat() && abstractMenuTree.isKeepTitleForFlat() && oFF.XStringUtils.isNotNullAndNotEmpty(abstractMenuTree.getText()))
	{
		this.m_factory.createTitleItem(container, sectionStart, abstractMenuTree.getOverflowPriority(), abstractMenuTree.getName(), abstractMenuTree.getText(), abstractMenuTree.getIcon(), abstractMenuTree.getExplanation());
		sectionStart = false;
	}
	for (var i = 0; i < subItems.size(); i++)
	{
		var subAbstractItem = subItems.get(i);
		var subItem = subAbstractItem.getMenuItem();
		if (subAbstractItem.getMenuSeparator() !== null)
		{
			sectionStart = true;
		}
		else if (oFF.notNull(subItem) && subItem.isVisible())
		{
			var overflowPriority = subItem.getOverflowPriority();
			if (overflowPriority === -1)
			{
				overflowPriority = defaultOverflowPriority;
			}
			var group = subItem.getActionGroup();
			if (oFF.notNull(group) && group.isFlat())
			{
				var sizeBefore = this.m_factory.getItemCount(container);
				hasElements = this.remapMenuTree(container, group, overflowPriority) || hasElements;
				if (this.m_factory.getItemCount(container) - sizeBefore > 1)
				{
					sectionStart = true;
				}
			}
			else
			{
				hasElements = true;
				if (oFF.notNull(group))
				{
					var defaultAction = null;
					if (group.isFirstSubOptionIsDefault())
					{
						var groupItems = group.getSubItems();
						if (oFF.XCollectionUtils.hasElements(groupItems) && groupItems.get(0).getActionLeaf() !== null)
						{
							defaultAction = groupItems.get(0).getActionLeaf().getCommand();
						}
					}
					var menuItem = this.m_factory.createGroupItem(container, sectionStart, overflowPriority, subItem.getName(), subItem.getText(), subItem.getIcon(), subItem.isEnabled(), subItem.getExplanation(), subItem.getHighlightProcedure(), subItem.getUnHighlightProcedure(), defaultAction);
					this.getSubMapper().remapMenuTree(menuItem, group, overflowPriority);
				}
				var leaf = subItem.getActionLeaf();
				if (oFF.notNull(leaf))
				{
					if (leaf.isToggle())
					{
						this.m_factory.createToggleItem(container, sectionStart, overflowPriority, subItem.getName(), subItem.getText(), subItem.getIcon(), subItem.isEnabled(), subItem.getExplanation(), subItem.getHighlightProcedure(), subItem.getUnHighlightProcedure(), leaf.getCommand(), leaf.getActiveExtended(), leaf.getStateIcon());
					}
					else
					{
						this.m_factory.createTriggerItem(container, sectionStart, overflowPriority, subItem.getName(), subItem.getText(), subItem.getIcon(), subItem.isEnabled(), subItem.getExplanation(), subItem.getHighlightProcedure(), subItem.getUnHighlightProcedure(), leaf.getCommand());
					}
				}
				sectionStart = false;
			}
		}
	}
	return hasElements;
};
oFF.CMEMenuTreePopulatorAbstract.prototype.setFactory = function(factory)
{
	this.m_factory = factory;
};

oFF.CMEAbstractItem = function() {};
oFF.CMEAbstractItem.prototype = new oFF.XObject();
oFF.CMEAbstractItem.prototype._ff_c = "CMEAbstractItem";

oFF.CMEAbstractItem.prototype.m_name = null;
oFF.CMEAbstractItem.prototype.m_alias = null;
oFF.CMEAbstractItem.prototype.m_parent = null;
oFF.CMEAbstractItem.prototype.m_removed = false;
oFF.CMEAbstractItem.prototype.releaseObject = function()
{
	this.m_name = null;
	this.m_alias = null;
	this.m_parent = null;
	this.m_removed = false;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.CMEAbstractItem.prototype.getParent = function()
{
	return oFF.XWeakReferenceUtil.getHardRef(this.m_parent);
};
oFF.CMEAbstractItem.prototype.setParent = function(parent)
{
	this.m_parent = oFF.XWeakReferenceUtil.getWeakRef(parent);
};
oFF.CMEAbstractItem.prototype.getName = function()
{
	return this.m_name;
};
oFF.CMEAbstractItem.prototype.setName = function(name)
{
	this.m_name = name;
};
oFF.CMEAbstractItem.prototype.getAlias = function()
{
	return this.m_alias;
};
oFF.CMEAbstractItem.prototype.setAlias = function(alias)
{
	this.m_alias = alias;
};
oFF.CMEAbstractItem.prototype.getActionGroup = function()
{
	return null;
};
oFF.CMEAbstractItem.prototype.getActionLeaf = function()
{
	return null;
};
oFF.CMEAbstractItem.prototype.getMenuSeparator = function()
{
	return null;
};
oFF.CMEAbstractItem.prototype.getMenuItem = function()
{
	return null;
};
oFF.CMEAbstractItem.prototype.hideIncludingChildren = function()
{
	this.setRemoved(true);
};
oFF.CMEAbstractItem.prototype.showIncludingParents = function()
{
	this.setRemoved(false);
	var parent = this.getParent();
	if (oFF.notNull(parent))
	{
		parent.showIncludingParents();
	}
};
oFF.CMEAbstractItem.prototype.addSubItemsBefore = function(actionItems)
{
	this.insertSubItemsAsSiblingsAtSelfOffset(0, actionItems);
};
oFF.CMEAbstractItem.prototype.addSubItemsAfter = function(actionItems)
{
	this.insertSubItemsAsSiblingsAtSelfOffset(1, actionItems);
};
oFF.CMEAbstractItem.prototype.insertSubItems = function(index, actionItems) {};
oFF.CMEAbstractItem.prototype.addSubItemsAtStart = function(actionItems) {};
oFF.CMEAbstractItem.prototype.addSubItemsAtEnd = function(actionItems) {};
oFF.CMEAbstractItem.prototype.clearSubItems = function() {};
oFF.CMEAbstractItem.prototype.insertSubItemsAsSiblingsAtSelfOffset = function(selfOffset, actionItems)
{
	var parent = this.getParent();
	if (oFF.notNull(parent))
	{
		var index = parent.getSubItems().getIndex(this);
		parent.insertSubItems(index + selfOffset, actionItems);
	}
};
oFF.CMEAbstractItem.prototype.isRemoved = function()
{
	return this.m_removed;
};
oFF.CMEAbstractItem.prototype.setRemoved = function(removed)
{
	this.m_removed = removed;
};

oFF.CMEMenuJsonConstants = {

	CME_NAME:"Name",
	CME_TEXT:"Text",
	CME_LOCALIZABLE_TEXT:"LocalizableText",
	CME_KEY:"Key",
	CME_REPLACEMENTS:"Replacements",
	CME_ICON:"Icon",
	CME_ACTIVE:"Active",
	CME_ENABLED:"Enabled",
	CME_VISIBLE:"Visible",
	CME_TYPE:"Type",
	CME_TYPE_SEPARATOR:"Separator",
	CME_TYPE_LEAF:"Leaf",
	CME_TYPE_GROUP:"Group",
	CME_SUB_ITEMS:"SubItems",
	CME_OPERATIONS:"Operations",
	CME_TYPE_OPERATION:"Operation",
	CME_PARAMETERS:"Parameters",
	CME_TOGGLE:"Toggle",
	CME_FLAT:"Flat",
	CME_TAGS:"Tags"
};

oFF.CMEMenuJsonHelper = {

	serializeGroupingMenuItem:function(groupingMenuItem, keepHidden)
	{
			var prStructure = oFF.PrFactory.createStructure();
		if (oFF.notNull(groupingMenuItem))
		{
			oFF.CMEMenuJsonHelper.serializeGroupingMenuItemInternal(groupingMenuItem, prStructure, keepHidden);
		}
		return prStructure;
	},
	serializeGroupingMenuItemInternal:function(groupingMenuItem, result, keepHidden)
	{
			if (keepHidden || groupingMenuItem.isVisible())
		{
			oFF.CMEMenuJsonHelper.serializeGenericItemProperties(groupingMenuItem, result);
			result.putString(oFF.CMEMenuJsonConstants.CME_TYPE, oFF.CMEMenuJsonConstants.CME_TYPE_GROUP);
			result.putBoolean(oFF.CMEMenuJsonConstants.CME_FLAT, groupingMenuItem.isFlat());
			var subItems = groupingMenuItem.getSubItems();
			var subList = result.putNewList(oFF.CMEMenuJsonConstants.CME_SUB_ITEMS);
			for (var i = 0; i < subItems.size(); i++)
			{
				var subItem = subItems.get(i);
				var newStructure = subList.addNewStructure();
				if (subItem.getActionGroup() !== null)
				{
					oFF.CMEMenuJsonHelper.serializeGroupingMenuItemInternal(subItem.getActionGroup(), newStructure, keepHidden);
				}
				else if (subItem.getActionLeaf() !== null)
				{
					oFF.CMEMenuJsonHelper.serializeLeafMenuItemInternal(subItem.getActionLeaf(), newStructure, keepHidden);
				}
				else if (subItem.getMenuSeparator() !== null)
				{
					oFF.CMEMenuJsonHelper.serializeMenuSeparatorInternal(subItem.getMenuSeparator(), newStructure);
				}
			}
		}
	},
	serializeMenuSeparatorInternal:function(menuSeparator, result)
	{
			result.putString(oFF.CMEMenuJsonConstants.CME_TYPE, oFF.CMEMenuJsonConstants.CME_TYPE_SEPARATOR);
	},
	serializeGenericItemProperties:function(abstractMenuItem, result)
	{
			var localizableText = abstractMenuItem.getLocalizableText();
		if (oFF.notNull(localizableText))
		{
			var structure = result.putNewStructure(oFF.CMEMenuJsonConstants.CME_LOCALIZABLE_TEXT);
			structure.putString(oFF.CMEMenuJsonConstants.CME_KEY, localizableText.getKey());
			var replacements = localizableText.getReplacements();
			if (oFF.XCollectionUtils.hasElements(replacements))
			{
				var list = structure.putNewList(oFF.CMEMenuJsonConstants.CME_REPLACEMENTS);
				for (var i = 0; i < replacements.size(); i++)
				{
					list.addString(replacements.get(i));
				}
			}
		}
		result.putString(oFF.CMEMenuJsonConstants.CME_NAME, abstractMenuItem.getName());
		result.putString(oFF.CMEMenuJsonConstants.CME_TEXT, abstractMenuItem.getText());
		result.putString(oFF.CMEMenuJsonConstants.CME_ICON, abstractMenuItem.getIcon());
		result.putBoolean(oFF.CMEMenuJsonConstants.CME_ENABLED, abstractMenuItem.isEnabled());
		result.putBoolean(oFF.CMEMenuJsonConstants.CME_VISIBLE, abstractMenuItem.isVisible());
		if (oFF.XCollectionUtils.hasElements(abstractMenuItem.getTags()))
		{
			result.putNewList(oFF.CMEMenuJsonConstants.CME_TAGS).addAllStrings(abstractMenuItem.getTags().getValuesAsReadOnlyListOfString());
		}
	},
	serializeLeafMenuItemInternal:function(leafMenuItem, result, keepHidden)
	{
			if (keepHidden || leafMenuItem.isVisible())
		{
			oFF.CMEMenuJsonHelper.serializeGenericItemProperties(leafMenuItem, result);
			result.putString(oFF.CMEMenuJsonConstants.CME_TYPE, oFF.CMEMenuJsonConstants.CME_TYPE_LEAF);
			result.putBoolean(oFF.CMEMenuJsonConstants.CME_ACTIVE, leafMenuItem.isActive());
			result.putBoolean(oFF.CMEMenuJsonConstants.CME_TOGGLE, leafMenuItem.isToggle());
			var operationList = leafMenuItem.getOperationList();
			var subList = result.putNewList(oFF.CMEMenuJsonConstants.CME_OPERATIONS);
			for (var i = 0; i < operationList.size(); i++)
			{
				var operation = operationList.get(i);
				var subStructure = subList.addNewStructure();
				oFF.CMEMenuJsonHelper.serializeOperationInternal(operation, subStructure);
			}
		}
	},
	serializeOperationInternal:function(operation, result)
	{
			result.putString(oFF.CMEMenuJsonConstants.CME_TYPE, oFF.CMEMenuJsonConstants.CME_TYPE_OPERATION);
		result.putString(oFF.CMEMenuJsonConstants.CME_NAME, operation.getName());
		var parameters = operation.getParameters();
		var subList = result.putNewList(oFF.CMEMenuJsonConstants.CME_PARAMETERS);
		for (var i = 0; i < parameters.size(); i++)
		{
			var parameter = parameters.get(i);
			if (oFF.isNull(parameter))
			{
				subList.addNull();
			}
			else if (parameter.getValueType().isNumber())
			{
				subList.addDouble(oFF.XValueUtil.getDouble(parameter, false, true));
			}
			else if (parameter.getValueType().isBoolean())
			{
				subList.addBoolean(oFF.XValueUtil.getBoolean(parameter, false, true));
			}
			else if (parameter.getValueType().isString())
			{
				subList.addString(oFF.XValueUtil.getString(parameter));
			}
			else
			{
				throw oFF.XException.createIllegalArgumentException("Value not supported");
			}
		}
	},
	deserialiseGroupingMenuItem:function(prStructure)
	{
			var groupingMenuItem = oFF.CMEGroupingMenuItem.create();
		oFF.CMEMenuJsonHelper.configureGroupingMenuItem(groupingMenuItem, prStructure);
		return groupingMenuItem;
	},
	configureGroupingMenuItem:function(groupingMenuItem, prStructure)
	{
			oFF.CMEMenuJsonHelper.configureGenericProperties(groupingMenuItem, prStructure);
		var subList = prStructure.getListByKey(oFF.CMEMenuJsonConstants.CME_SUB_ITEMS);
		groupingMenuItem.setFlat(prStructure.getBooleanByKey(oFF.CMEMenuJsonConstants.CME_FLAT));
		for (var i = 0; i < subList.size(); i++)
		{
			var subStructure = subList.getStructureAt(i);
			var type = subStructure.getStringByKey(oFF.CMEMenuJsonConstants.CME_TYPE);
			if (oFF.XString.isEqual(type, oFF.CMEMenuJsonConstants.CME_TYPE_GROUP))
			{
				oFF.CMEMenuJsonHelper.configureGroupingMenuItem(groupingMenuItem.addNewGroup(), subStructure);
			}
			else if (oFF.XString.isEqual(type, oFF.CMEMenuJsonConstants.CME_TYPE_LEAF))
			{
				oFF.CMEMenuJsonHelper.configureLeafMenuItem(groupingMenuItem.addNewLeaf(), subStructure);
			}
			else if (oFF.XString.isEqual(type, oFF.CMEMenuJsonConstants.CME_TYPE_SEPARATOR))
			{
				oFF.CMEMenuJsonHelper.configureSeparator(groupingMenuItem.addNewSeparator(), subStructure);
			}
		}
	},
	configureSeparator:function(addNewSeparator, subStructure) {},
	configureGenericProperties:function(abstractMenuItem, prStructure)
	{
			abstractMenuItem.setName(prStructure.getStringByKey(oFF.CMEMenuJsonConstants.CME_NAME));
		abstractMenuItem.setText(prStructure.getStringByKey(oFF.CMEMenuJsonConstants.CME_TEXT));
		abstractMenuItem.setEnabled(prStructure.getBooleanByKeyExt(oFF.CMEMenuJsonConstants.CME_ENABLED, true));
		abstractMenuItem.setIcon(prStructure.getStringByKey(oFF.CMEMenuJsonConstants.CME_ICON));
		abstractMenuItem.setVisible(prStructure.getBooleanByKeyExt(oFF.CMEMenuJsonConstants.CME_VISIBLE, true));
		if (prStructure.containsKey(oFF.CMEMenuJsonConstants.CME_TAGS))
		{
			abstractMenuItem.addAllTags(oFF.XStream.of(prStructure.getListByKey(oFF.CMEMenuJsonConstants.CME_TAGS)).collect(oFF.XStreamCollector.toListOfString( function(el){
				return el.asString().getString();
			}.bind(this))));
		}
		var locText = prStructure.getStructureByKey(oFF.CMEMenuJsonConstants.CME_LOCALIZABLE_TEXT);
		if (oFF.notNull(locText))
		{
			var localizableText = oFF.CMELocalizableText.create();
			localizableText.setKey(locText.getStringByKey(oFF.CMEMenuJsonConstants.CME_KEY));
			var list = locText.getListByKey(oFF.CMEMenuJsonConstants.CME_REPLACEMENTS);
			if (oFF.XCollectionUtils.hasElements(list))
			{
				for (var i = 0; i < list.size(); i++)
				{
					localizableText.addReplacement(list.getStringAt(i));
				}
			}
			abstractMenuItem.setLocalizableText(localizableText);
		}
	},
	configureLeafMenuItem:function(leafMenuItem, prStructure)
	{
			oFF.CMEMenuJsonHelper.configureGenericProperties(leafMenuItem, prStructure);
		leafMenuItem.setActive(prStructure.getBooleanByKey(oFF.CMEMenuJsonConstants.CME_ACTIVE));
		leafMenuItem.setToggle(prStructure.getBooleanByKey(oFF.CMEMenuJsonConstants.CME_TOGGLE));
		var subList = prStructure.getListByKey(oFF.CMEMenuJsonConstants.CME_OPERATIONS);
		for (var i = 0; i < subList.size(); i++)
		{
			var subStructure = subList.getStructureAt(i);
			oFF.CMEMenuJsonHelper.configureOperation(leafMenuItem.addOperation(), subStructure);
		}
	},
	configureOperation:function(operation, prStructure)
	{
			operation.setName(prStructure.getStringByKey(oFF.CMEMenuJsonConstants.CME_NAME));
		var subList = prStructure.getListByKey(oFF.CMEMenuJsonConstants.CME_PARAMETERS);
		for (var i = 0; i < subList.size(); i++)
		{
			var param = subList.get(i);
			if (oFF.isNull(param))
			{
				operation.addNull();
			}
			else if (param.isNumeric())
			{
				operation.addNumber(param.asDouble().getDouble());
			}
			else if (param.isBoolean())
			{
				operation.addBoolean(param.asBoolean().getBoolean());
			}
			else if (param.isString())
			{
				operation.addString(param.asString().getString());
			}
			else
			{
				throw oFF.XException.createIllegalArgumentException("Value not supported");
			}
		}
	},
	serializeGroupingMenuItemToPaths:function(groupingMenuItem)
	{
			var buffi = oFF.XStringBuffer.create();
		oFF.CMEMenuJsonHelper.serializeGroupingMenuItemToPathsBuf(buffi, "", groupingMenuItem);
		return buffi.toString();
	},
	serializeGroupingMenuItemToPathsBuf:function(buffi, prefix, abstractItem)
	{
			var abstractMenuItem = abstractItem.getMenuItem();
		if (oFF.notNull(abstractMenuItem))
		{
			var groupingMenuItem = abstractMenuItem.getActionGroup();
			var leafMenuItem = abstractMenuItem.getActionLeaf();
			var flat = "";
			if (oFF.notNull(groupingMenuItem) && groupingMenuItem.isFlat())
			{
				flat = "{flat}";
			}
			if (oFF.notNull(leafMenuItem) && leafMenuItem.isToggle())
			{
				flat = "{toggle}";
			}
			var currentName = oFF.XStringUtils.concatenate5(abstractMenuItem.getName(), "(", abstractMenuItem.getText(), ")", flat);
			var tags = abstractMenuItem.getTags().getIterator();
			while (tags.hasNext())
			{
				currentName = oFF.XStringUtils.concatenate3(currentName, "/", tags.next());
			}
			var newPrefixName = oFF.XStringUtils.concatenate3(prefix, ".", currentName);
			buffi.appendNewLine();
			buffi.append(newPrefixName);
			var newPrefix = oFF.XStringUtils.concatenate3(prefix, ".", abstractMenuItem.getName());
			if (oFF.notNull(groupingMenuItem))
			{
				var children = groupingMenuItem.getSubItems();
				for (var i = 0; i < children.size(); i++)
				{
					oFF.CMEMenuJsonHelper.serializeGroupingMenuItemToPathsBuf(buffi, newPrefix, children.get(i));
				}
			}
		}
	}
};

oFF.CMEReflectionMapper = {

	mapReflectionObject:function(menuItem, commandFacade)
	{
			if (menuItem.getActionLeaf() !== null)
		{
			var leaf = menuItem.getActionLeaf();
			var operationList = leaf.getOperationList();
			leaf.setCommand( function(){
				for (var i = 0; i < operationList.size(); i++)
				{
					var operation = operationList.get(i);
					oFF.XReflection.invokeMethodWithArgs(commandFacade, operation.getName(), oFF.CMEReflectionMapper.mapParams(operation));
				}
			}.bind(this));
		}
		else if (menuItem.getActionGroup() !== null)
		{
			var subItems = menuItem.getActionGroup().getSubItems();
			for (var j = 0; j < subItems.size(); j++)
			{
				oFF.CMEReflectionMapper.mapReflectionObject(subItems.get(j), commandFacade);
			}
		}
	},
	mapParams:function(operation)
	{
			return oFF.XStream.of(operation.getParameters()).map( function(refParam){
			return oFF.XReflectionParam.create(refParam);
		}.bind(this)).collect(oFF.XStreamCollector.toList());
	}
};

oFF.CMERegistry = function() {};
oFF.CMERegistry.prototype = new oFF.XObject();
oFF.CMERegistry.prototype._ff_c = "CMERegistry";

oFF.CMERegistry.create = function()
{
	var instance = new oFF.CMERegistry();
	instance.setup();
	return instance;
};
oFF.CMERegistry.prototype.m_facadeRegistry = null;
oFF.CMERegistry.prototype.m_optionRegistry = null;
oFF.CMERegistry.prototype.m_actionRegistry = null;
oFF.CMERegistry.prototype.setup = function()
{
	oFF.XObject.prototype.setup.call( this );
	this.m_facadeRegistry = oFF.XHashMapByString.create();
	this.m_optionRegistry = oFF.XHashMapByString.create();
	this.m_actionRegistry = oFF.XHashMapByString.create();
};
oFF.CMERegistry.prototype.registerFacade = function(name, facade)
{
	this.m_facadeRegistry.put(name, facade);
};
oFF.CMERegistry.prototype.getFacade = function(name)
{
	return this.m_facadeRegistry.getByKey(name);
};
oFF.CMERegistry.prototype.registerOption = function(name, option)
{
	this.m_optionRegistry.put(name, option);
};
oFF.CMERegistry.prototype.getOption = function(name)
{
	return this.m_optionRegistry.getByKey(name);
};
oFF.CMERegistry.prototype.registerAction = function(name, action)
{
	this.m_actionRegistry.put(name, action);
};
oFF.CMERegistry.prototype.getAction = function(name)
{
	return this.m_actionRegistry.getByKey(name);
};
oFF.CMERegistry.prototype.getRegisteredActions = function()
{
	return this.m_actionRegistry.getValuesAsReadOnlyList();
};
oFF.CMERegistry.prototype.getRegisteredOptions = function()
{
	return this.m_optionRegistry.getValuesAsReadOnlyList();
};

oFF.CMEActionController = function() {};
oFF.CMEActionController.prototype = new oFF.XObject();
oFF.CMEActionController.prototype._ff_c = "CMEActionController";

oFF.CMEActionController.create = function(loggingEnabled)
{
	var instance = new oFF.CMEActionController();
	instance.setup();
	instance.m_loggingEnabled = loggingEnabled;
	return instance;
};
oFF.CMEActionController.getLogString = function(action, option, context)
{
	return oFF.XStringUtils.concatenate5(oFF.isNull(action) ? "" : action.getName(context), "::", oFF.isNull(option) ? "" : option.getName(context), "::", context.getUiContext());
};
oFF.CMEActionController.prototype.m_listeners = null;
oFF.CMEActionController.prototype.m_loggingEnabled = false;
oFF.CMEActionController.prototype.setup = function()
{
	oFF.XObject.prototype.setup.call( this );
	this.m_listeners = oFF.XList.create();
};
oFF.CMEActionController.prototype.releaseObject = function()
{
	this.m_listeners = oFF.XObjectExt.release(this.m_listeners);
};
oFF.CMEActionController.prototype.attachActionListener = function(actionControllerListener)
{
	this.m_listeners.add(actionControllerListener);
};
oFF.CMEActionController.prototype.detachActionListener = function(actionControllerListener)
{
	this.m_listeners.removeElement(actionControllerListener);
};
oFF.CMEActionController.prototype.retrieveName = function(action, context)
{
	var name = action.getName(context);
	for (var i = 0; oFF.isNull(name) && i < this.m_listeners.size(); i++)
	{
		name = this.m_listeners.get(i).retrieveName(action, context);
	}
	return name;
};
oFF.CMEActionController.prototype.retrieveText = function(action, context)
{
	var text = action.getLocalizedText(context);
	for (var i = 0; oFF.isNull(text) && i < this.m_listeners.size(); i++)
	{
		text = this.m_listeners.get(i).retrieveText(action, context);
	}
	return text;
};
oFF.CMEActionController.prototype.retrieveIcon = function(action, context)
{
	var icon = action.getIcon(context);
	for (var i = 0; oFF.isNull(icon) && i < this.m_listeners.size(); i++)
	{
		icon = this.m_listeners.get(i).retrieveIcon(action, context);
	}
	return icon;
};
oFF.CMEActionController.prototype.retrieveExplanation = function(action, context)
{
	var explanation = action.getLocalizedExplanation(context);
	for (var i = 0; oFF.isNull(explanation) && i < this.m_listeners.size(); i++)
	{
		explanation = this.m_listeners.get(i).retrieveExplanation(action, context);
	}
	return explanation;
};
oFF.CMEActionController.prototype.checkAvailable = function(action, context)
{
	var available = oFF.XStream.of(this.m_listeners).map( function(listener){
		return oFF.XBooleanValue.create(listener.checkAvailable(action, context));
	}.bind(this)).reduce(oFF.XBooleanValue.create(action.isAvailable(context)),  function(a, b){
		return oFF.XBooleanValue.create(a.getBoolean() && b.getBoolean());
	}.bind(this)).getBoolean();
	return available;
};
oFF.CMEActionController.prototype.checkEnabled = function(action, context)
{
	var enabled = oFF.XStream.of(this.m_listeners).map( function(listener){
		return oFF.XBooleanValue.create(listener.checkEnabled(action, context));
	}.bind(this)).reduce(oFF.XBooleanValue.create(action.isEnabled(context)),  function(a, b){
		return oFF.XBooleanValue.create(a.getBoolean() && b.getBoolean());
	}.bind(this)).getBoolean();
	return enabled;
};
oFF.CMEActionController.prototype.checkToggled = function(action, context)
{
	var toggled = oFF.XStream.of(this.m_listeners).map( function(listener){
		return listener.checkToggled(action, context);
	}.bind(this)).reduce(action.isToggledExt(context),  function(a, b){
		return a === oFF.TriStateBool._TRUE || b === oFF.TriStateBool._TRUE ? oFF.TriStateBool._TRUE : a === oFF.TriStateBool._DEFAULT || b === oFF.TriStateBool._DEFAULT ? oFF.TriStateBool._DEFAULT : oFF.TriStateBool._FALSE;
	}.bind(this));
	return toggled;
};
oFF.CMEActionController.prototype.onHighlight = function(action, context)
{
	if (this.m_loggingEnabled)
	{
		oFF.XLogger.println(oFF.XStringUtils.concatenate2("Highlighting Action: ", oFF.CMEActionController.getLogString(action, null, context)));
	}
	for (var i = 0; i < this.m_listeners.size(); i++)
	{
		this.m_listeners.get(i).onHighlight(action, context);
	}
	action.highlight(context);
};
oFF.CMEActionController.prototype.onUnHighlight = function(action, context)
{
	if (this.m_loggingEnabled)
	{
		oFF.XLogger.println(oFF.XStringUtils.concatenate2("UnHighlighting Action: ", oFF.CMEActionController.getLogString(action, null, context)));
	}
	for (var i = 0; i < this.m_listeners.size(); i++)
	{
		this.m_listeners.get(i).onUnHighlight(action, context);
	}
	action.unHighlight(context);
};
oFF.CMEActionController.prototype.onActionTriggered = function(action, context)
{
	if (this.m_loggingEnabled)
	{
		oFF.XLogger.println(oFF.XStringUtils.concatenate2("Executing Trigger Action: ", oFF.CMEActionController.getLogString(action, null, context)));
	}
	for (var i = 0; i < this.m_listeners.size(); i++)
	{
		this.m_listeners.get(i).onActionTriggered(action, context);
	}
	action.trigger(context);
};
oFF.CMEActionController.prototype.onActionToggled = function(action, context)
{
	if (this.m_loggingEnabled)
	{
		oFF.XLogger.println(oFF.XStringUtils.concatenate2("Executing Toggle Action: ", oFF.CMEActionController.getLogString(action, null, context)));
	}
	for (var i = 0; i < this.m_listeners.size(); i++)
	{
		this.m_listeners.get(i).onActionToggled(action, context);
	}
	action.toggle(context);
};
oFF.CMEActionController.prototype.onActionSingleSelect = function(action, option, context)
{
	if (this.m_loggingEnabled)
	{
		oFF.XLogger.println(oFF.XStringUtils.concatenate2("Executing Single Select Action: ", oFF.CMEActionController.getLogString(action, option, context)));
	}
	for (var i = 0; i < this.m_listeners.size(); i++)
	{
		this.m_listeners.get(i).onActionSingleSelect(action, option, context);
	}
	action.selectOption(context, option);
};
oFF.CMEActionController.prototype.onActionMultiSelect = function(action, option, selected, context)
{
	if (this.m_loggingEnabled)
	{
		oFF.XLogger.println(oFF.XStringUtils.concatenate2("Executing Multi Select Action: ", oFF.CMEActionController.getLogString(action, option, context)));
	}
	for (var i = 0; i < this.m_listeners.size(); i++)
	{
		this.m_listeners.get(i).onActionMultiSelect(action, option, selected, context);
	}
	action.selectOption(context, option, selected);
};

oFF.CMEMultiSelectAction = function() {};
oFF.CMEMultiSelectAction.prototype = new oFF.CMEAbstractAction();
oFF.CMEMultiSelectAction.prototype._ff_c = "CMEMultiSelectAction";

oFF.CMEMultiSelectAction.create = function()
{
	var instance = new oFF.CMEMultiSelectAction();
	instance.setup();
	return instance;
};
oFF.CMEMultiSelectAction.prototype.m_selectionConsumer = null;
oFF.CMEMultiSelectAction.prototype.m_optionsRetriever = null;
oFF.CMEMultiSelectAction.prototype.m_selectionRetriever = null;
oFF.CMEMultiSelectAction.prototype.m_doubtfulSelectionsRetriever = null;
oFF.CMEMultiSelectAction.prototype.selectOption = function(context, option, selected)
{
	if (oFF.notNull(this.m_selectionConsumer))
	{
		this.m_selectionConsumer(context, option, oFF.XBooleanValue.create(selected));
	}
};
oFF.CMEMultiSelectAction.prototype.getAvailableOptions = function(context)
{
	return this.m_optionsRetriever(context);
};
oFF.CMEMultiSelectAction.prototype.getSelectedOptions = function(context)
{
	return this.m_selectionRetriever(context);
};
oFF.CMEMultiSelectAction.prototype.setSelectionConsumer = function(selectionConsumer)
{
	this.m_selectionConsumer = selectionConsumer;
};
oFF.CMEMultiSelectAction.prototype.setReflectionConsumer = function(registry, operationCreators)
{
	this.setSelectionConsumer( function(context, param, sel){
		var newContext = context.getCopy();
		var newValue = oFF.PrFactory.createStructure();
		newValue.putString("OPTION", param.getName(context));
		newValue.putBoolean("SELECTED", sel.getBoolean());
		newContext.setValue(newValue);
		var operationCreatorIterator = operationCreators.getIterator();
		while (operationCreatorIterator.hasNext())
		{
			var operationCreator = operationCreatorIterator.next();
			oFF.XReflection.invokeMethodWithArgs(registry.getFacade(operationCreator.getReceiverFacade()), operationCreator.getName(), oFF.CMEAbstractAction.mapParams(newContext, operationCreator));
		}
	}.bind(this));
};
oFF.CMEMultiSelectAction.prototype.setOptionsRetriever = function(optionsRetriever)
{
	this.m_optionsRetriever = optionsRetriever;
};
oFF.CMEMultiSelectAction.prototype.setSelectionRetriever = function(selectionRetriever)
{
	this.m_selectionRetriever = selectionRetriever;
};
oFF.CMEMultiSelectAction.prototype.setDoubtfulSelectionsRetriever = function(selectionRetriever)
{
	this.m_doubtfulSelectionsRetriever = selectionRetriever;
};
oFF.CMEMultiSelectAction.prototype.mapToMenuCreator = function(controller)
{
	var groupCreator = oFF.CMEGroupCreator.create();
	this.mapGenericPropertiesToMenuCreator(controller, groupCreator);
	groupCreator.setOptionsRetriever(this.m_optionsRetriever);
	groupCreator.setSelectionsRetriever(this.m_selectionRetriever);
	groupCreator.setDoubtfulSelectionsRetriever(this.m_doubtfulSelectionsRetriever);
	if (oFF.isNull(controller))
	{
		groupCreator.setSelectionConsumer(this.m_selectionConsumer);
	}
	else
	{
		groupCreator.setSelectionConsumer( function(e, f, g){
			controller.onActionMultiSelect(this, f, g.getBoolean(), e);
		}.bind(this));
	}
	return groupCreator;
};
oFF.CMEMultiSelectAction.prototype.asMultiSelectAction = function()
{
	return this;
};

oFF.CMESelectionOption = function() {};
oFF.CMESelectionOption.prototype = new oFF.CMEAbstractAction();
oFF.CMESelectionOption.prototype._ff_c = "CMESelectionOption";

oFF.CMESelectionOption.create = function()
{
	var instance = new oFF.CMESelectionOption();
	instance.setup();
	return instance;
};
oFF.CMESelectionOption.prototype.m_customObject = null;
oFF.CMESelectionOption.prototype.releaseObject = function()
{
	this.m_customObject = null;
	oFF.CMEAbstractAction.prototype.releaseObject.call( this );
};
oFF.CMESelectionOption.prototype.mapToMenuCreator = function(controller)
{
	var leafCreator = oFF.CMELeafCreator.create();
	this.mapGenericPropertiesToMenuCreator(controller, leafCreator);
	return leafCreator;
};
oFF.CMESelectionOption.prototype.setCustomObject = function(customObject)
{
	this.m_customObject = customObject;
};
oFF.CMESelectionOption.prototype.getCustomObject = function()
{
	return this.m_customObject;
};

oFF.CMESingleSelectAction = function() {};
oFF.CMESingleSelectAction.prototype = new oFF.CMEAbstractAction();
oFF.CMESingleSelectAction.prototype._ff_c = "CMESingleSelectAction";

oFF.CMESingleSelectAction.create = function()
{
	var instance = new oFF.CMESingleSelectAction();
	instance.setup();
	return instance;
};
oFF.CMESingleSelectAction.prototype.m_selectionConsumer = null;
oFF.CMESingleSelectAction.prototype.m_optionsRetriever = null;
oFF.CMESingleSelectAction.prototype.m_selectionRetriever = null;
oFF.CMESingleSelectAction.prototype.m_doubtfulSelectionsRetriever = null;
oFF.CMESingleSelectAction.prototype.selectOption = function(context, option)
{
	if (oFF.notNull(this.m_selectionConsumer))
	{
		this.m_selectionConsumer(context, option);
	}
};
oFF.CMESingleSelectAction.prototype.getAvailableOptions = function(context)
{
	return this.m_optionsRetriever(context);
};
oFF.CMESingleSelectAction.prototype.getSelectedOption = function(context)
{
	return this.m_selectionRetriever(context);
};
oFF.CMESingleSelectAction.prototype.setSelectionConsumer = function(selectionConsumer)
{
	this.m_selectionConsumer = selectionConsumer;
};
oFF.CMESingleSelectAction.prototype.setReflectionConsumer = function(registry, operationCreators)
{
	this.setSelectionConsumer( function(context, param){
		var newContext = context.getCopy();
		newContext.setValue(oFF.PrFactory.createString(param.getName(context)));
		var operationCreatorIterator = operationCreators.getIterator();
		while (operationCreatorIterator.hasNext())
		{
			var operationCreator = operationCreatorIterator.next();
			oFF.XReflection.invokeMethodWithArgs(registry.getFacade(operationCreator.getReceiverFacade()), operationCreator.getName(), oFF.CMEAbstractAction.mapParams(newContext, operationCreator));
		}
	}.bind(this));
};
oFF.CMESingleSelectAction.prototype.setOptionsRetriever = function(optionsRetriever)
{
	this.m_optionsRetriever = optionsRetriever;
};
oFF.CMESingleSelectAction.prototype.setDoubtfulSelectionsRetriever = function(selectionRetriever)
{
	this.m_doubtfulSelectionsRetriever = selectionRetriever;
};
oFF.CMESingleSelectAction.prototype.setSelectionRetriever = function(selectionRetriever)
{
	this.m_selectionRetriever = selectionRetriever;
};
oFF.CMESingleSelectAction.prototype.setReflectionOptionProvider = function(registry, operationCreator)
{
	this.setSelectionRetriever( function(context){
		var result = oFF.XReflection.invokeMethodWithArgs(registry.getFacade(operationCreator.getReceiverFacade()), operationCreator.getName(), oFF.CMEAbstractAction.mapParams(context, operationCreator));
		return registry.getOption(result.getString());
	}.bind(this));
};
oFF.CMESingleSelectAction.prototype.mapToMenuCreator = function(controller)
{
	var groupCreator = oFF.CMEGroupCreator.create();
	this.mapGenericPropertiesToMenuCreator(controller, groupCreator);
	groupCreator.setOptionsRetriever(this.m_optionsRetriever);
	groupCreator.setSelectionRetriever(this.m_selectionRetriever);
	groupCreator.setDoubtfulSelectionsRetriever(this.m_doubtfulSelectionsRetriever);
	if (oFF.isNull(controller))
	{
		groupCreator.setSelectionConsumer( function(a, b, c){
			this.m_selectionConsumer(a, b);
		}.bind(this));
	}
	else
	{
		groupCreator.setSelectionConsumer( function(e, f, g){
			controller.onActionSingleSelect(this, f, e);
		}.bind(this));
	}
	return groupCreator;
};
oFF.CMESingleSelectAction.prototype.asSingleSelectAction = function()
{
	return this;
};

oFF.CMEToggleAction = function() {};
oFF.CMEToggleAction.prototype = new oFF.CMEAbstractAction();
oFF.CMEToggleAction.prototype._ff_c = "CMEToggleAction";

oFF.CMEToggleAction.create = function()
{
	var instance = new oFF.CMEToggleAction();
	instance.setup();
	return instance;
};
oFF.CMEToggleAction.prototype.m_consumer = null;
oFF.CMEToggleAction.prototype.m_provider = null;
oFF.CMEToggleAction.prototype.toggle = function(context)
{
	if (oFF.notNull(this.m_consumer))
	{
		this.m_consumer(context, oFF.XBooleanValue.create(!this.isToggled(context)));
	}
};
oFF.CMEToggleAction.prototype.isToggledExt = function(context)
{
	return oFF.isNull(this.m_provider) ? oFF.TriStateBool._FALSE : this.m_provider(context);
};
oFF.CMEToggleAction.prototype.isToggled = function(context)
{
	return oFF.isNull(this.m_provider) ? false : this.m_provider(context) === oFF.TriStateBool._TRUE;
};
oFF.CMEToggleAction.prototype.setConsumer = function(consumer)
{
	this.m_consumer = consumer;
};
oFF.CMEToggleAction.prototype.setReflectionConsumer = function(registry, operationCreators)
{
	this.setConsumer( function(context, param){
		var newContext = context.getCopy();
		newContext.setValue(oFF.PrFactory.createBoolean(param.getBoolean()));
		var operationCreatorIterator = operationCreators.getIterator();
		while (operationCreatorIterator.hasNext())
		{
			var operationCreator = operationCreatorIterator.next();
			oFF.XReflection.invokeMethodWithArgs(registry.getFacade(operationCreator.getReceiverFacade()), operationCreator.getName(), oFF.CMEAbstractAction.mapParams(newContext, operationCreator));
		}
	}.bind(this));
};
oFF.CMEToggleAction.prototype.setProvider = function(provider)
{
	this.m_provider =  function(context){
		return provider(context) ? oFF.TriStateBool._TRUE : oFF.TriStateBool._FALSE;
	}.bind(this);
};
oFF.CMEToggleAction.prototype.setProviderExt = function(provider)
{
	this.m_provider = provider;
};
oFF.CMEToggleAction.prototype.setReflectionProvider = function(registry, operationCreator)
{
	this.setProvider( function(context){
		var result = oFF.XReflection.invokeMethodWithArgs(registry.getFacade(operationCreator.getReceiverFacade()), operationCreator.getName(), oFF.CMEAbstractAction.mapParams(context, operationCreator));
		return result.getBoolean();
	}.bind(this));
};
oFF.CMEToggleAction.prototype.mapToMenuCreator = function(controller)
{
	var leafCreator = oFF.CMELeafCreator.create();
	this.mapGenericPropertiesToMenuCreator(controller, leafCreator);
	leafCreator.setToggle(true);
	if (oFF.notNull(this.m_provider))
	{
		var checked = oFF.CMEValueFunctionalResolver.create();
		var partiallyChecked = oFF.CMEValueFunctionalResolver.create();
		if (oFF.notNull(controller))
		{
			checked.setFunction( function(checkContext){
				return oFF.XBooleanValue.create(controller.checkToggled(this, checkContext) === oFF.TriStateBool._TRUE);
			}.bind(this));
			partiallyChecked.setFunction( function(partialContext){
				return oFF.XBooleanValue.create(controller.checkToggled(this, partialContext) === oFF.TriStateBool._DEFAULT);
			}.bind(this));
		}
		else
		{
			checked.setFunction( function(input){
				return oFF.XBooleanValue.create(this.m_provider(input) === oFF.TriStateBool._TRUE);
			}.bind(this));
			partiallyChecked.setFunction( function(pinput){
				return oFF.XBooleanValue.create(this.m_provider(pinput) === oFF.TriStateBool._DEFAULT);
			}.bind(this));
		}
		leafCreator.setActive(checked);
		leafCreator.setPartiallyActive(partiallyChecked);
	}
	if (oFF.notNull(controller))
	{
		leafCreator.setContextConsumer( function(consumerContext){
			controller.onActionToggled(this, consumerContext);
		}.bind(this));
	}
	else
	{
		leafCreator.setContextConsumer( function(context){
			this.m_consumer(context, oFF.XBooleanValue.create(this.m_provider(context) !== oFF.TriStateBool._TRUE));
		}.bind(this));
	}
	return leafCreator;
};
oFF.CMEToggleAction.prototype.asToggleAction = function()
{
	return this;
};

oFF.CMETriggerAction = function() {};
oFF.CMETriggerAction.prototype = new oFF.CMEAbstractAction();
oFF.CMETriggerAction.prototype._ff_c = "CMETriggerAction";

oFF.CMETriggerAction.create = function()
{
	var instance = new oFF.CMETriggerAction();
	instance.setup();
	return instance;
};
oFF.CMETriggerAction.prototype.m_trigger = null;
oFF.CMETriggerAction.prototype.trigger = function(context)
{
	if (oFF.notNull(this.m_trigger))
	{
		this.m_trigger(context);
	}
};
oFF.CMETriggerAction.prototype.setTrigger = function(trigger)
{
	this.m_trigger = trigger;
};
oFF.CMETriggerAction.prototype.setReflectionTrigger = function(registry, operationCreators)
{
	this.setTrigger( function(context){
		var operationCreatorIterator = operationCreators.getIterator();
		while (operationCreatorIterator.hasNext())
		{
			var operationCreator = operationCreatorIterator.next();
			oFF.XReflection.invokeMethodWithArgs(registry.getFacade(operationCreator.getReceiverFacade()), operationCreator.getName(), oFF.CMEAbstractAction.mapParams(context, operationCreator));
		}
	}.bind(this));
};
oFF.CMETriggerAction.prototype.mapToMenuCreator = function(controller)
{
	var leafCreator = oFF.CMELeafCreator.create();
	this.mapGenericPropertiesToMenuCreator(controller, leafCreator);
	if (oFF.isNull(controller))
	{
		leafCreator.setContextConsumer(this.m_trigger);
	}
	else
	{
		leafCreator.setContextConsumer( function(context){
			controller.onActionTriggered(this, context);
		}.bind(this));
	}
	return leafCreator;
};
oFF.CMETriggerAction.prototype.asTriggerAction = function()
{
	return this;
};

oFF.CMEConditionalMenuCreatorGroup = function() {};
oFF.CMEConditionalMenuCreatorGroup.prototype = new oFF.CMEMenuCreator();
oFF.CMEConditionalMenuCreatorGroup.prototype._ff_c = "CMEConditionalMenuCreatorGroup";

oFF.CMEConditionalMenuCreatorGroup.create = function()
{
	var instance = new oFF.CMEConditionalMenuCreatorGroup();
	instance.setup();
	return instance;
};
oFF.CMEConditionalMenuCreatorGroup.prototype.m_menuCreators = null;
oFF.CMEConditionalMenuCreatorGroup.prototype.setup = function()
{
	oFF.CMEMenuCreator.prototype.setup.call( this );
	this.m_menuCreators = oFF.XList.create();
};
oFF.CMEConditionalMenuCreatorGroup.prototype.addConditionalMenuCreator = function(creator)
{
	this.m_menuCreators.add(creator);
};
oFF.CMEConditionalMenuCreatorGroup.prototype.transform = function(parameters, resultContainer)
{
	for (var i = 0; i < this.m_menuCreators.size(); i++)
	{
		if (this.m_menuCreators.get(i).conditionalTransform(this.getSubContext(parameters), resultContainer))
		{
			break;
		}
	}
};

oFF.CMELocalizableTextCreatorContextCompound = function() {};
oFF.CMELocalizableTextCreatorContextCompound.prototype = new oFF.CMELocalizableTextCreatorAbstract();
oFF.CMELocalizableTextCreatorContextCompound.prototype._ff_c = "CMELocalizableTextCreatorContextCompound";

oFF.CMELocalizableTextCreatorContextCompound.create = function()
{
	var instance = new oFF.CMELocalizableTextCreatorContextCompound();
	instance.setup();
	return instance;
};
oFF.CMELocalizableTextCreatorContextCompound.prototype.m_conditionalReplacers = null;
oFF.CMELocalizableTextCreatorContextCompound.prototype.setup = function()
{
	oFF.CMELocalizableTextCreatorAbstract.prototype.setup.call( this );
	this.m_conditionalReplacers = oFF.XList.create();
};
oFF.CMELocalizableTextCreatorContextCompound.prototype.getKey = function(context)
{
	var key = null;
	for (var i = 0; i < this.m_conditionalReplacers.size(); i++)
	{
		var match = this.m_conditionalReplacers.get(i).getMatch(context);
		if (oFF.notNull(match))
		{
			key = match.getKey(context);
			break;
		}
	}
	return key;
};
oFF.CMELocalizableTextCreatorContextCompound.prototype.getReplacements = function(context)
{
	var replacements = null;
	for (var i = 0; i < this.m_conditionalReplacers.size(); i++)
	{
		var match = this.m_conditionalReplacers.get(i).getMatch(context);
		if (oFF.notNull(match))
		{
			replacements = match.getReplacements(context);
			break;
		}
	}
	return replacements;
};
oFF.CMELocalizableTextCreatorContextCompound.prototype.addReplacer = function(conditionalExpression, textCreatorAbstract)
{
	this.m_conditionalReplacers.add(oFF.CMELocalizableTextContextCompound.create(conditionalExpression, textCreatorAbstract));
};

oFF.CMELocalizableTextCreatorSimple = function() {};
oFF.CMELocalizableTextCreatorSimple.prototype = new oFF.CMELocalizableTextCreatorAbstract();
oFF.CMELocalizableTextCreatorSimple.prototype._ff_c = "CMELocalizableTextCreatorSimple";

oFF.CMELocalizableTextCreatorSimple.create = function()
{
	var instance = new oFF.CMELocalizableTextCreatorSimple();
	instance.setup();
	return instance;
};
oFF.CMELocalizableTextCreatorSimple.prototype.m_key = null;
oFF.CMELocalizableTextCreatorSimple.prototype.m_replacements = null;
oFF.CMELocalizableTextCreatorSimple.prototype.setup = function()
{
	oFF.CMELocalizableTextCreatorAbstract.prototype.setup.call( this );
	this.m_replacements = oFF.XList.create();
};
oFF.CMELocalizableTextCreatorSimple.prototype.getKey = function(context)
{
	return this.m_key;
};
oFF.CMELocalizableTextCreatorSimple.prototype.setKey = function(key)
{
	this.m_key = key;
};
oFF.CMELocalizableTextCreatorSimple.prototype.addReplacement = function(placeholder)
{
	this.m_replacements.add(placeholder);
};
oFF.CMELocalizableTextCreatorSimple.prototype.getReplacements = function(context)
{
	return this.m_replacements;
};

oFF.CMEMenuItemCreator = function() {};
oFF.CMEMenuItemCreator.prototype = new oFF.CMEMenuCreator();
oFF.CMEMenuItemCreator.prototype._ff_c = "CMEMenuItemCreator";

oFF.CMEMenuItemCreator.prototype.m_name = null;
oFF.CMEMenuItemCreator.prototype.m_text = null;
oFF.CMEMenuItemCreator.prototype.m_explanation = null;
oFF.CMEMenuItemCreator.prototype.m_localizableText = null;
oFF.CMEMenuItemCreator.prototype.m_localizableExplanation = null;
oFF.CMEMenuItemCreator.prototype.m_icon = null;
oFF.CMEMenuItemCreator.prototype.m_enabled = null;
oFF.CMEMenuItemCreator.prototype.m_visible = null;
oFF.CMEMenuItemCreator.prototype.m_overflowPriority = 0;
oFF.CMEMenuItemCreator.prototype.m_highlightProcedure = null;
oFF.CMEMenuItemCreator.prototype.m_unHighlightProcedure = null;
oFF.CMEMenuItemCreator.prototype.setup = function()
{
	oFF.CMEMenuCreator.prototype.setup.call( this );
	this.m_enabled = oFF.XList.create();
	this.m_visible = oFF.XList.create();
};
oFF.CMEMenuItemCreator.prototype.getName = function()
{
	return oFF.notNull(this.m_name) ? this.m_name : oFF.CMEValueLiteralResolver.getNullResolver();
};
oFF.CMEMenuItemCreator.prototype.setName = function(name)
{
	this.m_name = name;
};
oFF.CMEMenuItemCreator.prototype.getText = function()
{
	return oFF.notNull(this.m_text) ? this.m_text : oFF.CMEValueLiteralResolver.getNullResolver();
};
oFF.CMEMenuItemCreator.prototype.setText = function(text)
{
	this.m_text = text;
};
oFF.CMEMenuItemCreator.prototype.getExplanation = function()
{
	return oFF.notNull(this.m_explanation) ? this.m_explanation : oFF.CMEValueLiteralResolver.getNullResolver();
};
oFF.CMEMenuItemCreator.prototype.setExplanation = function(explanation)
{
	this.m_explanation = explanation;
};
oFF.CMEMenuItemCreator.prototype.getIcon = function()
{
	return oFF.notNull(this.m_icon) ? this.m_icon : oFF.CMEValueLiteralResolver.getNullResolver();
};
oFF.CMEMenuItemCreator.prototype.setIcon = function(icon)
{
	this.m_icon = icon;
};
oFF.CMEMenuItemCreator.prototype.resolveEnabled = function(context)
{
	var result = true;
	for (var i = 0; result && i < this.m_enabled.size(); i++)
	{
		result = result && this.m_enabled.get(i).resolveBoolean(context);
	}
	return result;
};
oFF.CMEMenuItemCreator.prototype.addEnabledConstraint = function(enabled)
{
	this.m_enabled.add(enabled);
};
oFF.CMEMenuItemCreator.prototype.resolveVisible = function(context)
{
	var result = true;
	for (var i = 0; result && i < this.m_visible.size(); i++)
	{
		result = result && this.m_visible.get(i).resolveBoolean(context);
	}
	return result;
};
oFF.CMEMenuItemCreator.prototype.addVisibleConstraint = function(visible)
{
	this.m_visible.add(visible);
};
oFF.CMEMenuItemCreator.prototype.setFlatIfLessThanNItems = function(flat) {};
oFF.CMEMenuItemCreator.prototype.setHideIfLessThanNItems = function(hide) {};
oFF.CMEMenuItemCreator.prototype.setDisableIfLessThanNItems = function(disable) {};
oFF.CMEMenuItemCreator.prototype.setDisableIfLessThanNEnabledItems = function(disable) {};
oFF.CMEMenuItemCreator.prototype.setFirstSubOptionIsDefault = function(firstSubOptionIsDefault) {};
oFF.CMEMenuItemCreator.prototype.setKeepTitleForFlat = function(keepTitleForFlat) {};
oFF.CMEMenuItemCreator.prototype.getLocalizableText = function()
{
	return this.m_localizableText;
};
oFF.CMEMenuItemCreator.prototype.getLocalizableExplanation = function()
{
	return this.m_localizableExplanation;
};
oFF.CMEMenuItemCreator.prototype.setLocalizableText = function(localizableText)
{
	this.m_localizableText = localizableText;
};
oFF.CMEMenuItemCreator.prototype.setLocalizableExplanation = function(localizableExplanation)
{
	this.m_localizableExplanation = localizableExplanation;
};
oFF.CMEMenuItemCreator.prototype.resolveLocalizableText = function(context)
{
	var result = null;
	if (oFF.notNull(this.m_localizableText))
	{
		result = oFF.CMELocalizableText.create();
		result.setKey(this.m_localizableText.getKey(context));
		var replacements = this.m_localizableText.getReplacements(context);
		for (var i = 0; i < replacements.size(); i++)
		{
			result.addReplacement(replacements.get(i).resolveString(context));
		}
	}
	return result;
};
oFF.CMEMenuItemCreator.prototype.resolveLocalizableExplanation = function(context)
{
	var result = null;
	if (oFF.notNull(this.m_localizableExplanation))
	{
		result = oFF.CMELocalizableText.create();
		result.setKey(this.m_localizableExplanation.getKey(context));
		var replacements = this.m_localizableExplanation.getReplacements(context);
		for (var i = 0; i < replacements.size(); i++)
		{
			result.addReplacement(replacements.get(i).resolveString(context));
		}
	}
	return result;
};
oFF.CMEMenuItemCreator.prototype.setOverflowIfMoreThanNItems = function(overflowIfMoreThanNItems) {};
oFF.CMEMenuItemCreator.prototype.setOverflowText = function(overflowText) {};
oFF.CMEMenuItemCreator.prototype.setOverflowLocalizableText = function(overflowLocalizableText) {};
oFF.CMEMenuItemCreator.prototype.setOverflowPriority = function(overflowPriority)
{
	this.m_overflowPriority = overflowPriority;
};
oFF.CMEMenuItemCreator.prototype.getOverflowPriority = function()
{
	return this.m_overflowPriority;
};
oFF.CMEMenuItemCreator.prototype.resolveHighlightProcedure = function(contextAccess)
{
	var result = null;
	if (oFF.notNull(this.m_highlightProcedure))
	{
		result =  function(){
			this.m_highlightProcedure(contextAccess);
		}.bind(this);
	}
	return result;
};
oFF.CMEMenuItemCreator.prototype.setHighlightProcedure = function(highlightProcedure)
{
	this.m_highlightProcedure = highlightProcedure;
};
oFF.CMEMenuItemCreator.prototype.resolveUnHighlightProcedure = function(contextAccess)
{
	var result = null;
	if (oFF.notNull(this.m_unHighlightProcedure))
	{
		result =  function(){
			this.m_unHighlightProcedure(contextAccess);
		}.bind(this);
	}
	return result;
};
oFF.CMEMenuItemCreator.prototype.setUnHighlightProcedure = function(unHighlightProcedure)
{
	this.m_unHighlightProcedure = unHighlightProcedure;
};

oFF.CMEOperationCreator = function() {};
oFF.CMEOperationCreator.prototype = new oFF.CMEMenuCreator();
oFF.CMEOperationCreator.prototype._ff_c = "CMEOperationCreator";

oFF.CMEOperationCreator.create = function()
{
	var instance = new oFF.CMEOperationCreator();
	instance.setup();
	return instance;
};
oFF.CMEOperationCreator.prototype.m_receiverFacade = null;
oFF.CMEOperationCreator.prototype.m_name = null;
oFF.CMEOperationCreator.prototype.m_parameters = null;
oFF.CMEOperationCreator.prototype.setup = function()
{
	oFF.CMEMenuCreator.prototype.setup.call( this );
	this.m_parameters = oFF.XList.create();
};
oFF.CMEOperationCreator.prototype.addParameter = function(parameter)
{
	this.m_parameters.add(parameter);
};
oFF.CMEOperationCreator.prototype.transform = function(parameters, resultContainer)
{
	var operation = resultContainer.addOperation();
	operation.setName(this.m_name);
	for (var i = 0; i < this.m_parameters.size(); i++)
	{
		var paramResolver = this.m_parameters.get(i);
		operation.addValue(paramResolver.resolve(parameters));
	}
};
oFF.CMEOperationCreator.prototype.getName = function()
{
	return this.m_name;
};
oFF.CMEOperationCreator.prototype.setName = function(name)
{
	this.m_name = name;
};
oFF.CMEOperationCreator.prototype.getReceiverFacade = function()
{
	return this.m_receiverFacade;
};
oFF.CMEOperationCreator.prototype.setReceiverFacade = function(receiverFacade)
{
	this.m_receiverFacade = receiverFacade;
};
oFF.CMEOperationCreator.prototype.getParameters = function()
{
	return this.m_parameters;
};

oFF.CMEReflectionResolver = function() {};
oFF.CMEReflectionResolver.prototype = new oFF.CMEValueResolver();
oFF.CMEReflectionResolver.prototype._ff_c = "CMEReflectionResolver";

oFF.CMEReflectionResolver.create = function()
{
	var instance = new oFF.CMEReflectionResolver();
	instance.setup();
	return instance;
};
oFF.CMEReflectionResolver.mapParams = function(context, operation)
{
	return oFF.XStream.of(operation.getParameters()).map( function(refParam){
		return oFF.XReflectionParam.create(refParam.resolve(context));
	}.bind(this)).collect(oFF.XStreamCollector.toList());
};
oFF.CMEReflectionResolver.prototype.m_operationCreator = null;
oFF.CMEReflectionResolver.prototype.setup = function()
{
	oFF.CMEValueResolver.prototype.setup.call( this );
	this.m_operationCreator = oFF.CMEOperationCreator.create();
};
oFF.CMEReflectionResolver.prototype.getOperationCreator = function()
{
	return this.m_operationCreator;
};
oFF.CMEReflectionResolver.prototype.resolve = function(context)
{
	var result = oFF.XReflection.invokeMethodWithArgs(oFF.CMEFactory.getRegistry().getFacade(this.m_operationCreator.getReceiverFacade()), this.m_operationCreator.getName(), oFF.CMEReflectionResolver.mapParams(context, this.m_operationCreator));
	var component = result.getValue();
	var type = component.getComponentType();
	if (type === oFF.XValueType.BOOLEAN || type === oFF.XValueType.STRING || type === oFF.XValueType.INTEGER || type === oFF.XValueType.LONG || type === oFF.XValueType.DOUBLE)
	{
		return component;
	}
	else
	{
		return null;
	}
};

oFF.CMEValueContextSwitchResolver = function() {};
oFF.CMEValueContextSwitchResolver.prototype = new oFF.CMEValueResolver();
oFF.CMEValueContextSwitchResolver.prototype._ff_c = "CMEValueContextSwitchResolver";

oFF.CMEValueContextSwitchResolver.create = function()
{
	var instance = new oFF.CMEValueContextSwitchResolver();
	instance.setup();
	return instance;
};
oFF.CMEValueContextSwitchResolver.prototype.m_conditionalValues = null;
oFF.CMEValueContextSwitchResolver.prototype.setup = function()
{
	oFF.CMEValueResolver.prototype.setup.call( this );
	this.m_conditionalValues = oFF.XList.create();
};
oFF.CMEValueContextSwitchResolver.prototype.releaseObject = function()
{
	this.m_conditionalValues = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_conditionalValues);
};
oFF.CMEValueContextSwitchResolver.prototype.resolve = function(context)
{
	var value = null;
	for (var i = 0; i < this.m_conditionalValues.size(); i++)
	{
		var expression = this.m_conditionalValues.get(i).getExpression(context);
		if (oFF.notNull(expression))
		{
			value = expression.resolve(context);
		}
	}
	return value;
};
oFF.CMEValueContextSwitchResolver.prototype.addConditionalValue = function(contextExpression, resolver)
{
	this.m_conditionalValues.add(oFF.CMEValueContextCompound.create(contextExpression, resolver));
};

oFF.CMEValueFunctionalResolver = function() {};
oFF.CMEValueFunctionalResolver.prototype = new oFF.CMEValueResolver();
oFF.CMEValueFunctionalResolver.prototype._ff_c = "CMEValueFunctionalResolver";

oFF.CMEValueFunctionalResolver.create = function()
{
	var instance = new oFF.CMEValueFunctionalResolver();
	instance.setup();
	return instance;
};
oFF.CMEValueFunctionalResolver.prototype.m_function = null;
oFF.CMEValueFunctionalResolver.prototype.getFunction = function()
{
	return this.m_function;
};
oFF.CMEValueFunctionalResolver.prototype.setFunction = function(_function)
{
	this.m_function = _function;
};
oFF.CMEValueFunctionalResolver.prototype.setup = function()
{
	oFF.CMEValueResolver.prototype.setup.call( this );
};
oFF.CMEValueFunctionalResolver.prototype.resolve = function(context)
{
	var result = this.m_function(context);
	return result;
};

oFF.CMEValueLiteralResolver = function() {};
oFF.CMEValueLiteralResolver.prototype = new oFF.CMEValueResolver();
oFF.CMEValueLiteralResolver.prototype._ff_c = "CMEValueLiteralResolver";

oFF.CMEValueLiteralResolver.NULL_RESOLVER = null;
oFF.CMEValueLiteralResolver.TRUE_RESOLVER = null;
oFF.CMEValueLiteralResolver.FALSE_RESOLVER = null;
oFF.CMEValueLiteralResolver.ZERO_RESOLVER = null;
oFF.CMEValueLiteralResolver.MINUS_1_RESOLVER = null;
oFF.CMEValueLiteralResolver.PLUS_1_RESOLVER = null;
oFF.CMEValueLiteralResolver.getPlus1Resolver = function()
{
	if (oFF.isNull(oFF.CMEValueLiteralResolver.PLUS_1_RESOLVER))
	{
		oFF.CMEValueLiteralResolver.PLUS_1_RESOLVER = oFF.CMEValueLiteralResolver.create(oFF.XDoubleValue.create(1));
	}
	return oFF.CMEValueLiteralResolver.PLUS_1_RESOLVER;
};
oFF.CMEValueLiteralResolver.getMinus1Resolver = function()
{
	if (oFF.isNull(oFF.CMEValueLiteralResolver.MINUS_1_RESOLVER))
	{
		oFF.CMEValueLiteralResolver.MINUS_1_RESOLVER = oFF.CMEValueLiteralResolver.create(oFF.XDoubleValue.create(-1));
	}
	return oFF.CMEValueLiteralResolver.MINUS_1_RESOLVER;
};
oFF.CMEValueLiteralResolver.getZeroResolver = function()
{
	if (oFF.isNull(oFF.CMEValueLiteralResolver.ZERO_RESOLVER))
	{
		oFF.CMEValueLiteralResolver.ZERO_RESOLVER = oFF.CMEValueLiteralResolver.create(oFF.XDoubleValue.create(0));
	}
	return oFF.CMEValueLiteralResolver.ZERO_RESOLVER;
};
oFF.CMEValueLiteralResolver.getNullResolver = function()
{
	if (oFF.isNull(oFF.CMEValueLiteralResolver.NULL_RESOLVER))
	{
		oFF.CMEValueLiteralResolver.NULL_RESOLVER = oFF.CMEValueLiteralResolver.create(null);
	}
	return oFF.CMEValueLiteralResolver.NULL_RESOLVER;
};
oFF.CMEValueLiteralResolver.getTrueResolver = function()
{
	if (oFF.isNull(oFF.CMEValueLiteralResolver.TRUE_RESOLVER))
	{
		oFF.CMEValueLiteralResolver.TRUE_RESOLVER = oFF.CMEValueLiteralResolver.create(oFF.XBooleanValue.create(true));
	}
	return oFF.CMEValueLiteralResolver.TRUE_RESOLVER;
};
oFF.CMEValueLiteralResolver.getFalseResolver = function()
{
	if (oFF.isNull(oFF.CMEValueLiteralResolver.FALSE_RESOLVER))
	{
		oFF.CMEValueLiteralResolver.FALSE_RESOLVER = oFF.CMEValueLiteralResolver.create(oFF.XBooleanValue.create(false));
	}
	return oFF.CMEValueLiteralResolver.FALSE_RESOLVER;
};
oFF.CMEValueLiteralResolver.create = function(value)
{
	var instance = new oFF.CMEValueLiteralResolver();
	instance.setupValue(value);
	return instance;
};
oFF.CMEValueLiteralResolver.prototype.m_value = null;
oFF.CMEValueLiteralResolver.prototype.setupValue = function(value)
{
	this.m_value = value;
};
oFF.CMEValueLiteralResolver.prototype.resolve = function(context)
{
	return this.m_value;
};

oFF.CMEValuePathResolver = function() {};
oFF.CMEValuePathResolver.prototype = new oFF.CMEValueResolver();
oFF.CMEValuePathResolver.prototype._ff_c = "CMEValuePathResolver";

oFF.CMEValuePathResolver.create = function(expression)
{
	var instance = new oFF.CMEValuePathResolver();
	instance.setupExpression(expression);
	return instance;
};
oFF.CMEValuePathResolver.prototype.m_expression = null;
oFF.CMEValuePathResolver.prototype.setupExpression = function(expression)
{
	this.m_expression = expression;
};
oFF.CMEValuePathResolver.prototype.resolve = function(context)
{
	return oFF.isNull(context) ? null : context.resolveValue(this.m_expression);
};

oFF.CMEValueStringFunctionalResolver = function() {};
oFF.CMEValueStringFunctionalResolver.prototype = new oFF.CMEValueResolver();
oFF.CMEValueStringFunctionalResolver.prototype._ff_c = "CMEValueStringFunctionalResolver";

oFF.CMEValueStringFunctionalResolver.create = function()
{
	var instance = new oFF.CMEValueStringFunctionalResolver();
	instance.setup();
	return instance;
};
oFF.CMEValueStringFunctionalResolver.prototype.m_function = null;
oFF.CMEValueStringFunctionalResolver.prototype.getFunction = function()
{
	return this.m_function;
};
oFF.CMEValueStringFunctionalResolver.prototype.setFunction = function(_function)
{
	this.m_function = _function;
};
oFF.CMEValueStringFunctionalResolver.prototype.setup = function()
{
	oFF.CMEValueResolver.prototype.setup.call( this );
};
oFF.CMEValueStringFunctionalResolver.prototype.resolve = function(context)
{
	if (oFF.notNull(this.m_function))
	{
		return oFF.XStringValue.create(this.m_function(context));
	}
	else
	{
		return null;
	}
};

oFF.CMEContextConditionAlgebra = function() {};
oFF.CMEContextConditionAlgebra.prototype = new oFF.CMEContextConditionAbstract();
oFF.CMEContextConditionAlgebra.prototype._ff_c = "CMEContextConditionAlgebra";

oFF.CMEContextConditionAlgebra.createAnd = function()
{
	var instance = new oFF.CMEContextConditionAlgebra();
	instance.setup();
	instance.m_allMatch = true;
	return instance;
};
oFF.CMEContextConditionAlgebra.createOr = function()
{
	var instance = new oFF.CMEContextConditionAlgebra();
	instance.setup();
	instance.m_someMatch = true;
	return instance;
};
oFF.CMEContextConditionAlgebra.createNone = function()
{
	var instance = new oFF.CMEContextConditionAlgebra();
	instance.setup();
	instance.m_noneMatch = true;
	return instance;
};
oFF.CMEContextConditionAlgebra.prototype.m_baseConditions = null;
oFF.CMEContextConditionAlgebra.prototype.m_allMatch = false;
oFF.CMEContextConditionAlgebra.prototype.m_someMatch = false;
oFF.CMEContextConditionAlgebra.prototype.m_noneMatch = false;
oFF.CMEContextConditionAlgebra.prototype.setup = function()
{
	oFF.CMEContextConditionAbstract.prototype.setup.call( this );
	this.m_baseConditions = oFF.XList.create();
};
oFF.CMEContextConditionAlgebra.prototype.checkCondition = function(contextAccess)
{
	var value = this.getInitialValue();
	for (var i = 0; i < this.m_baseConditions.size(); i++)
	{
		value = this.getNewValue(value, this.m_baseConditions.get(i), contextAccess);
		if (this.canBreak(value))
		{
			break;
		}
	}
	return value;
};
oFF.CMEContextConditionAlgebra.prototype.canBreak = function(value)
{
	return this.m_someMatch && value || !this.m_someMatch && !value;
};
oFF.CMEContextConditionAlgebra.prototype.getNewValue = function(value, cmeContextConditionAbstract, contextAccess)
{
	if (this.m_allMatch)
	{
		return value && cmeContextConditionAbstract.checkCondition(contextAccess);
	}
	else if (this.m_someMatch)
	{
		return value || cmeContextConditionAbstract.checkCondition(contextAccess);
	}
	else if (this.m_noneMatch)
	{
		return value && !cmeContextConditionAbstract.checkCondition(contextAccess);
	}
	return false;
};
oFF.CMEContextConditionAlgebra.prototype.getInitialValue = function()
{
	return !oFF.XCollectionUtils.hasElements(this.m_baseConditions) || !this.m_someMatch;
};
oFF.CMEContextConditionAlgebra.prototype.addSubCondition = function(matchCondition)
{
	this.m_baseConditions.add(matchCondition);
};

oFF.CMEContextConditionLeaf = function() {};
oFF.CMEContextConditionLeaf.prototype = new oFF.CMEContextConditionAbstract();
oFF.CMEContextConditionLeaf.prototype._ff_c = "CMEContextConditionLeaf";

oFF.CMEContextConditionLeaf.create = function()
{
	var instance = new oFF.CMEContextConditionLeaf();
	instance.setup();
	return instance;
};
oFF.CMEContextConditionLeaf.prototype.m_matchString = null;
oFF.CMEContextConditionLeaf.prototype.m_conditionalType = null;
oFF.CMEContextConditionLeaf.prototype.m_comparison = null;
oFF.CMEContextConditionLeaf.prototype.checkCondition = function(contextAccess)
{
	if (oFF.isNull(contextAccess))
	{
		return false;
	}
	var value = contextAccess.resolveValue(this.m_matchString);
	var subContexts = contextAccess.getSubContexts(this.m_matchString);
	var comparison = oFF.isNull(this.m_comparison) ? null : this.m_comparison.resolve(contextAccess);
	if (this.m_conditionalType === oFF.CMEConditionalType.MIN_SIZE)
	{
		return oFF.XCollectionUtils.hasElements(subContexts) && subContexts.size() >= this.m_comparison.resolveNumber(contextAccess);
	}
	else if (this.m_conditionalType === oFF.CMEConditionalType.MAX_SIZE)
	{
		return oFF.XCollectionUtils.hasElements(subContexts) && subContexts.size() <= this.m_comparison.resolveNumber(contextAccess);
	}
	else if (this.m_conditionalType === oFF.CMEConditionalType.EQUAL)
	{
		return oFF.notNull(value) && value.isEqualTo(comparison);
	}
	else if (this.m_conditionalType === oFF.CMEConditionalType.NOT_EQUAL)
	{
		return oFF.notNull(value) && value.isEqualTo(comparison);
	}
	else if (this.m_conditionalType === oFF.CMEConditionalType.EXISTS)
	{
		return oFF.XCollectionUtils.hasElements(subContexts) || oFF.notNull(value);
	}
	else if (this.m_conditionalType === oFF.CMEConditionalType.NOT_EXISTS)
	{
		return !oFF.XCollectionUtils.hasElements(subContexts) && oFF.isNull(value);
	}
	return false;
};
oFF.CMEContextConditionLeaf.prototype.getMatchString = function()
{
	return this.m_matchString;
};
oFF.CMEContextConditionLeaf.prototype.setMatchString = function(matchString)
{
	this.m_matchString = matchString;
};
oFF.CMEContextConditionLeaf.prototype.getConditionalType = function()
{
	return this.m_conditionalType;
};
oFF.CMEContextConditionLeaf.prototype.setConditionalType = function(conditionalType)
{
	this.m_conditionalType = conditionalType;
};
oFF.CMEContextConditionLeaf.prototype.getComparison = function()
{
	return this.m_comparison;
};
oFF.CMEContextConditionLeaf.prototype.setComparison = function(comparison)
{
	this.m_comparison = comparison;
};

oFF.CMEContextConditionNot = function() {};
oFF.CMEContextConditionNot.prototype = new oFF.CMEContextConditionAbstract();
oFF.CMEContextConditionNot.prototype._ff_c = "CMEContextConditionNot";

oFF.CMEContextConditionNot.create = function()
{
	var instance = new oFF.CMEContextConditionNot();
	instance.setup();
	return instance;
};
oFF.CMEContextConditionNot.prototype.m_baseCondition = null;
oFF.CMEContextConditionNot.prototype.checkCondition = function(contextAccess)
{
	return oFF.isNull(this.m_baseCondition) ? true : !this.m_baseCondition.checkCondition(contextAccess);
};
oFF.CMEContextConditionNot.prototype.getBaseCondition = function()
{
	return this.m_baseCondition;
};
oFF.CMEContextConditionNot.prototype.setBaseCondition = function(baseCondition)
{
	this.m_baseCondition = baseCondition;
};

oFF.CMEDefaultPluginActionProvider = function() {};
oFF.CMEDefaultPluginActionProvider.prototype = new oFF.CMEDynamicActionsProviderDefault();
oFF.CMEDefaultPluginActionProvider.prototype._ff_c = "CMEDefaultPluginActionProvider";

oFF.CMEDefaultPluginActionProvider.create = function(name, config)
{
	var instance = new oFF.CMEDefaultPluginActionProvider();
	instance.m_name = name;
	instance.m_config = config;
	return instance;
};
oFF.CMEDefaultPluginActionProvider.prototype.m_name = null;
oFF.CMEDefaultPluginActionProvider.prototype.m_config = null;
oFF.CMEDefaultPluginActionProvider.prototype.releaseObject = function()
{
	oFF.CMEDynamicActionsProviderDefault.prototype.releaseObject.call( this );
	this.m_name = null;
	this.m_config = null;
};
oFF.CMEDefaultPluginActionProvider.prototype.provideMenuConfig = function(cmeContextAccess, providerListener, carrier)
{
	providerListener.onDynamicMenuConfigProvided(cmeContextAccess, this.m_name, this.m_config, carrier);
};

oFF.CMEMenuTreePopulatorBranching = function() {};
oFF.CMEMenuTreePopulatorBranching.prototype = new oFF.CMEMenuTreePopulatorAbstract();
oFF.CMEMenuTreePopulatorBranching.prototype._ff_c = "CMEMenuTreePopulatorBranching";

oFF.CMEMenuTreePopulatorBranching.createWithSubMapper = function(factory, subPopulator)
{
	var instance = new oFF.CMEMenuTreePopulatorBranching();
	instance.setFactory(factory);
	instance.m_subMapper = subPopulator;
	return instance;
};
oFF.CMEMenuTreePopulatorBranching.prototype.m_subMapper = null;
oFF.CMEMenuTreePopulatorBranching.prototype.releaseObject = function()
{
	this.m_subMapper = null;
	oFF.CMEMenuTreePopulatorAbstract.prototype.releaseObject.call( this );
};
oFF.CMEMenuTreePopulatorBranching.prototype.getSubMapper = function()
{
	return this.m_subMapper;
};

oFF.CMEMenuTreePopulatorSelfRef = function() {};
oFF.CMEMenuTreePopulatorSelfRef.prototype = new oFF.CMEMenuTreePopulatorAbstract();
oFF.CMEMenuTreePopulatorSelfRef.prototype._ff_c = "CMEMenuTreePopulatorSelfRef";

oFF.CMEMenuTreePopulatorSelfRef.create = function(factory)
{
	var instance = new oFF.CMEMenuTreePopulatorSelfRef();
	instance.setFactory(factory);
	return instance;
};
oFF.CMEMenuTreePopulatorSelfRef.prototype.getSubMapper = function()
{
	return this;
};

oFF.CMEAbstractMenuItem = function() {};
oFF.CMEAbstractMenuItem.prototype = new oFF.CMEAbstractItem();
oFF.CMEAbstractMenuItem.prototype._ff_c = "CMEAbstractMenuItem";

oFF.CMEAbstractMenuItem.prototype.m_text = null;
oFF.CMEAbstractMenuItem.prototype.m_explanation = null;
oFF.CMEAbstractMenuItem.prototype.m_icon = null;
oFF.CMEAbstractMenuItem.prototype.m_enabled = false;
oFF.CMEAbstractMenuItem.prototype.m_visible = false;
oFF.CMEAbstractMenuItem.prototype.m_tags = null;
oFF.CMEAbstractMenuItem.prototype.m_localizableText = null;
oFF.CMEAbstractMenuItem.prototype.m_localizableExplanation = null;
oFF.CMEAbstractMenuItem.prototype.m_context = null;
oFF.CMEAbstractMenuItem.prototype.m_overflowPriority = 0;
oFF.CMEAbstractMenuItem.prototype.m_highlightProcedure = null;
oFF.CMEAbstractMenuItem.prototype.m_unHighlightProcedure = null;
oFF.CMEAbstractMenuItem.prototype.setup = function()
{
	oFF.CMEAbstractItem.prototype.setup.call( this );
	this.m_enabled = true;
	this.m_visible = true;
	this.m_overflowPriority = -1;
	this.m_tags = oFF.XHashSetOfString.create();
};
oFF.CMEAbstractMenuItem.prototype.releaseObject = function()
{
	this.m_tags = oFF.XObjectExt.release(this.m_tags);
	this.m_text = null;
	this.m_icon = null;
	this.m_enabled = false;
	this.m_visible = false;
	this.m_overflowPriority = -1;
	this.m_localizableText = oFF.XObjectExt.release(this.m_localizableText);
	this.m_context = null;
	this.m_explanation = null;
	this.m_localizableExplanation = oFF.XObjectExt.release(this.m_localizableExplanation);
	this.m_highlightProcedure = null;
	this.m_unHighlightProcedure = null;
	oFF.CMEAbstractItem.prototype.releaseObject.call( this );
};
oFF.CMEAbstractMenuItem.prototype.getText = function()
{
	return this.m_text;
};
oFF.CMEAbstractMenuItem.prototype.setText = function(text)
{
	this.m_text = text;
};
oFF.CMEAbstractMenuItem.prototype.getIcon = function()
{
	return this.m_icon;
};
oFF.CMEAbstractMenuItem.prototype.setIcon = function(icon)
{
	this.m_icon = icon;
};
oFF.CMEAbstractMenuItem.prototype.isEnabled = function()
{
	return this.m_enabled;
};
oFF.CMEAbstractMenuItem.prototype.setEnabled = function(enabled)
{
	this.m_enabled = enabled;
};
oFF.CMEAbstractMenuItem.prototype.isVisible = function()
{
	return this.m_visible && !this.isRemoved();
};
oFF.CMEAbstractMenuItem.prototype.setVisible = function(visible)
{
	this.m_visible = visible;
};
oFF.CMEAbstractMenuItem.prototype.getLocalizableText = function()
{
	return this.m_localizableText;
};
oFF.CMEAbstractMenuItem.prototype.setLocalizableText = function(localizableText)
{
	this.m_localizableText = localizableText;
};
oFF.CMEAbstractMenuItem.prototype.addTag = function(tag)
{
	this.m_tags.add(tag);
};
oFF.CMEAbstractMenuItem.prototype.hasTag = function(tag)
{
	return this.m_tags.contains(tag);
};
oFF.CMEAbstractMenuItem.prototype.removeTag = function(tag)
{
	this.m_tags.removeElement(tag);
};
oFF.CMEAbstractMenuItem.prototype.getTags = function()
{
	return this.m_tags;
};
oFF.CMEAbstractMenuItem.prototype.addAllTags = function(tags)
{
	this.m_tags.addAll(tags);
};
oFF.CMEAbstractMenuItem.prototype.getMenuItem = function()
{
	return this;
};
oFF.CMEAbstractMenuItem.prototype.getContext = function()
{
	return this.m_context;
};
oFF.CMEAbstractMenuItem.prototype.setContext = function(context)
{
	this.m_context = context;
};
oFF.CMEAbstractMenuItem.prototype.setOverflowPriority = function(overflowPriority)
{
	this.m_overflowPriority = overflowPriority;
};
oFF.CMEAbstractMenuItem.prototype.getOverflowPriority = function()
{
	return this.m_overflowPriority;
};
oFF.CMEAbstractMenuItem.prototype.getExplanation = function()
{
	return this.m_explanation;
};
oFF.CMEAbstractMenuItem.prototype.setExplanation = function(explanation)
{
	this.m_explanation = explanation;
};
oFF.CMEAbstractMenuItem.prototype.getLocalizableExplanation = function()
{
	return this.m_localizableExplanation;
};
oFF.CMEAbstractMenuItem.prototype.setLocalizableExplanation = function(localizableExplanation)
{
	this.m_localizableExplanation = localizableExplanation;
};
oFF.CMEAbstractMenuItem.prototype.setHighlightProcedure = function(highlightProcedure)
{
	this.m_highlightProcedure = highlightProcedure;
};
oFF.CMEAbstractMenuItem.prototype.setUnHighlightProcedure = function(unHighlightProcedure)
{
	this.m_unHighlightProcedure = unHighlightProcedure;
};
oFF.CMEAbstractMenuItem.prototype.getHighlightProcedure = function()
{
	return this.m_highlightProcedure;
};
oFF.CMEAbstractMenuItem.prototype.getUnHighlightProcedure = function()
{
	return this.m_unHighlightProcedure;
};

oFF.CMEMenuSeparator = function() {};
oFF.CMEMenuSeparator.prototype = new oFF.CMEAbstractItem();
oFF.CMEMenuSeparator.prototype._ff_c = "CMEMenuSeparator";

oFF.CMEMenuSeparator.create = function()
{
	var instance = new oFF.CMEMenuSeparator();
	instance.setup();
	return instance;
};
oFF.CMEMenuSeparator.prototype.getMenuSeparator = function()
{
	return this;
};

oFF.CMEAggregatedCreator = function() {};
oFF.CMEAggregatedCreator.prototype = new oFF.CMEMenuItemCreator();
oFF.CMEAggregatedCreator.prototype._ff_c = "CMEAggregatedCreator";

oFF.CMEAggregatedCreator.prototype.m_menuCreators = null;
oFF.CMEAggregatedCreator.prototype.addMenuCreator = function(menuCreator)
{
	this.m_menuCreators.add(menuCreator);
};
oFF.CMEAggregatedCreator.prototype.setup = function()
{
	oFF.CMEMenuItemCreator.prototype.setup.call( this );
	this.m_menuCreators = oFF.XList.create();
};
oFF.CMEAggregatedCreator.prototype.getMenuCreators = function()
{
	return this.m_menuCreators;
};
oFF.CMEAggregatedCreator.prototype.applyTransformation = function(group, parameters)
{
	if (oFF.notNull(parameters))
	{
		for (var i = 0; i < this.m_menuCreators.size(); i++)
		{
			var menuCreator = this.m_menuCreators.get(i);
			menuCreator.transform(parameters, group);
		}
	}
};

oFF.CMELeafCreator = function() {};
oFF.CMELeafCreator.prototype = new oFF.CMEMenuItemCreator();
oFF.CMELeafCreator.prototype._ff_c = "CMELeafCreator";

oFF.CMELeafCreator.create = function()
{
	var instance = new oFF.CMELeafCreator();
	instance.setup();
	return instance;
};
oFF.CMELeafCreator.prototype.m_active = null;
oFF.CMELeafCreator.prototype.m_partiallyActive = null;
oFF.CMELeafCreator.prototype.m_operations = null;
oFF.CMELeafCreator.prototype.m_toggle = false;
oFF.CMELeafCreator.prototype.m_contextConsumer = null;
oFF.CMELeafCreator.prototype.setup = function()
{
	oFF.CMEMenuItemCreator.prototype.setup.call( this );
	this.m_operations = oFF.XList.create();
};
oFF.CMELeafCreator.prototype.transform = function(parameters, resultContainer)
{
	var leaf = resultContainer.addNewLeaf();
	var subContext = this.getSubContext(parameters);
	leaf.setOverflowPriority(this.getOverflowPriority());
	leaf.setName(this.getName().resolveString(subContext));
	leaf.setText(this.getText().resolveString(subContext));
	leaf.setExplanation(this.getExplanation().resolveString(subContext));
	leaf.setLocalizableText(this.resolveLocalizableText(subContext));
	leaf.setLocalizableExplanation(this.resolveLocalizableExplanation(subContext));
	leaf.setIcon(this.getIcon().resolveString(subContext));
	leaf.setEnabled(this.resolveEnabled(subContext));
	leaf.setVisible(this.resolveVisible(subContext));
	if (this.getActive().resolveBoolean(subContext))
	{
		leaf.setActive(true);
	}
	else if (this.getPartiallyActive().resolveBoolean(subContext))
	{
		leaf.setActiveExtended(oFF.TriStateBool._DEFAULT);
	}
	leaf.setToggle(this.isToggle());
	leaf.setHighlightProcedure(this.resolveHighlightProcedure(parameters));
	leaf.setUnHighlightProcedure(this.resolveUnHighlightProcedure(parameters));
	for (var i = 0; i < this.m_operations.size(); i++)
	{
		var operationCreator = this.m_operations.get(i);
		operationCreator.transform(subContext, leaf);
	}
	if (oFF.notNull(this.m_contextConsumer))
	{
		leaf.setCommand( function(){
			this.m_contextConsumer(subContext);
		}.bind(this));
	}
};
oFF.CMELeafCreator.prototype.getActive = function()
{
	return oFF.notNull(this.m_active) ? this.m_active : oFF.CMEValueLiteralResolver.getFalseResolver();
};
oFF.CMELeafCreator.prototype.getPartiallyActive = function()
{
	return oFF.notNull(this.m_partiallyActive) ? this.m_partiallyActive : oFF.CMEValueLiteralResolver.getFalseResolver();
};
oFF.CMELeafCreator.prototype.setActive = function(active)
{
	this.m_active = active;
};
oFF.CMELeafCreator.prototype.setPartiallyActive = function(active)
{
	this.m_partiallyActive = active;
};
oFF.CMELeafCreator.prototype.getOperations = function()
{
	return this.m_operations;
};
oFF.CMELeafCreator.prototype.addOperation = function(operationCreator)
{
	this.m_operations.add(operationCreator);
};
oFF.CMELeafCreator.prototype.isToggle = function()
{
	return this.m_toggle;
};
oFF.CMELeafCreator.prototype.setToggle = function(toggle)
{
	this.m_toggle = toggle;
};
oFF.CMELeafCreator.prototype.setContextConsumer = function(trigger)
{
	this.m_contextConsumer = trigger;
};

oFF.CMESeparatorCreator = function() {};
oFF.CMESeparatorCreator.prototype = new oFF.CMEMenuItemCreator();
oFF.CMESeparatorCreator.prototype._ff_c = "CMESeparatorCreator";

oFF.CMESeparatorCreator.create = function()
{
	var instance = new oFF.CMESeparatorCreator();
	instance.setup();
	return instance;
};
oFF.CMESeparatorCreator.prototype.transform = function(parameters, resultContainer)
{
	var separator = resultContainer.addNewSeparator();
	separator.setName(this.getName().resolveString(parameters));
};

oFF.CMEGroupingMenuItem = function() {};
oFF.CMEGroupingMenuItem.prototype = new oFF.CMEAbstractMenuItem();
oFF.CMEGroupingMenuItem.prototype._ff_c = "CMEGroupingMenuItem";

oFF.CMEGroupingMenuItem.create = function()
{
	var instance = new oFF.CMEGroupingMenuItem();
	instance.setup();
	return instance;
};
oFF.CMEGroupingMenuItem.prototype.m_subItems = null;
oFF.CMEGroupingMenuItem.prototype.m_flatIfLessThanNItems = 0;
oFF.CMEGroupingMenuItem.prototype.m_overflowLocalizableText = null;
oFF.CMEGroupingMenuItem.prototype.m_overflowIfMoreThanNItems = 0;
oFF.CMEGroupingMenuItem.prototype.m_overflowText = null;
oFF.CMEGroupingMenuItem.prototype.m_hideIfLessThanNItems = 0;
oFF.CMEGroupingMenuItem.prototype.m_disableIfLessThanNItems = 0;
oFF.CMEGroupingMenuItem.prototype.m_disableIfLessThanNEnabledItems = 0;
oFF.CMEGroupingMenuItem.prototype.m_keepTitleForFlat = false;
oFF.CMEGroupingMenuItem.prototype.m_firstSubOptionIsDefault = false;
oFF.CMEGroupingMenuItem.prototype.m_cachedSubItemCount = 0;
oFF.CMEGroupingMenuItem.prototype.m_cachedEnabledSubItemCount = 0;
oFF.CMEGroupingMenuItem.prototype.setup = function()
{
	oFF.CMEAbstractMenuItem.prototype.setup.call( this );
	this.m_flatIfLessThanNItems = 1;
	this.m_hideIfLessThanNItems = 0;
	this.m_disableIfLessThanNItems = 1;
	this.m_disableIfLessThanNEnabledItems = 0;
	this.m_cachedSubItemCount = -1;
	this.m_cachedEnabledSubItemCount = -1;
	this.m_overflowIfMoreThanNItems = -1;
	this.m_subItems = oFF.XList.create();
};
oFF.CMEGroupingMenuItem.prototype.releaseObject = function()
{
	this.m_flatIfLessThanNItems = 1;
	this.m_hideIfLessThanNItems = 0;
	this.m_disableIfLessThanNItems = 1;
	this.m_disableIfLessThanNEnabledItems = 0;
	this.m_cachedSubItemCount = -1;
	this.m_cachedEnabledSubItemCount = -1;
	this.m_overflowIfMoreThanNItems = -1;
	this.m_subItems = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_subItems);
	oFF.CMEAbstractMenuItem.prototype.releaseObject.call( this );
};
oFF.CMEGroupingMenuItem.prototype.addNewSeparator = function()
{
	var newInstance = oFF.CMEMenuSeparator.create();
	this.addSubItem(newInstance);
	return newInstance;
};
oFF.CMEGroupingMenuItem.prototype.addNewGroup = function()
{
	var newInstance = oFF.CMEGroupingMenuItem.create();
	this.addSubItem(newInstance);
	return newInstance;
};
oFF.CMEGroupingMenuItem.prototype.addNewLeaf = function()
{
	var newInstance = oFF.CMELeafMenuItem.create();
	this.addSubItem(newInstance);
	return newInstance;
};
oFF.CMEGroupingMenuItem.prototype.getSubItems = function()
{
	return this.m_subItems;
};
oFF.CMEGroupingMenuItem.prototype.getEffectiveSubItems = function()
{
	var effectiveList = oFF.XList.create();
	var visibleItemsSeen = 0;
	var i = 0;
	var subItem;
	for (; i < this.m_subItems.size(); i++)
	{
		if (this.m_overflowIfMoreThanNItems > 0 && visibleItemsSeen >= this.m_overflowIfMoreThanNItems)
		{
			break;
		}
		subItem = this.m_subItems.get(i);
		var menuItem = subItem.getMenuItem();
		if (subItem.getMenuSeparator() !== null)
		{
			effectiveList.add(subItem);
		}
		else if (oFF.notNull(menuItem) && menuItem.isVisible())
		{
			effectiveList.add(subItem);
			visibleItemsSeen++;
		}
	}
	if (i < this.m_subItems.size())
	{
		var overflowItem = oFF.CMEGroupingMenuItem.create();
		overflowItem.setOverflowIfMoreThanNItems(this.m_overflowIfMoreThanNItems);
		overflowItem.setLocalizableText(this.m_overflowLocalizableText);
		overflowItem.setOverflowLocalizableText(this.m_overflowLocalizableText);
		overflowItem.setText(this.m_overflowText);
		overflowItem.setOverflowText(this.m_overflowText);
		overflowItem.setFlatIfLessThanNItems(2);
		effectiveList.add(overflowItem);
		for (; i < this.m_subItems.size(); i++)
		{
			overflowItem.addSubItem(this.m_subItems.get(i));
		}
	}
	return effectiveList;
};
oFF.CMEGroupingMenuItem.prototype.isVisible = function()
{
	return oFF.CMEAbstractMenuItem.prototype.isVisible.call( this ) && (this.m_hideIfLessThanNItems < 1 || this.getEffectiveSubItemCount() >= this.m_hideIfLessThanNItems);
};
oFF.CMEGroupingMenuItem.prototype.isEnabled = function()
{
	return oFF.CMEAbstractMenuItem.prototype.isEnabled.call( this ) && (this.m_disableIfLessThanNItems < 1 || this.getEffectiveSubItemCount() >= this.m_disableIfLessThanNItems) && (this.m_disableIfLessThanNEnabledItems < 1 || this.getEffectiveEnabledSubItemCount() >= this.m_disableIfLessThanNEnabledItems);
};
oFF.CMEGroupingMenuItem.prototype.removeItem = function(item)
{
	this.m_subItems.removeElement(item);
};
oFF.CMEGroupingMenuItem.prototype.addSubItem = function(actionItem)
{
	actionItem.setParent(this);
	this.m_subItems.add(actionItem);
};
oFF.CMEGroupingMenuItem.prototype.insertSubItems = function(index, actionItems)
{
	for (var i = 0; i < actionItems.size(); i++)
	{
		var actionItem = actionItems.get(i);
		actionItem.setParent(this);
		this.m_subItems.insert(i + index, actionItem);
	}
};
oFF.CMEGroupingMenuItem.prototype.addSubItemsAtStart = function(actionItems)
{
	this.insertSubItems(0, actionItems);
};
oFF.CMEGroupingMenuItem.prototype.addSubItemsAtEnd = function(actionItems)
{
	for (var i = 0; i < actionItems.size(); i++)
	{
		var actionItem = actionItems.get(i);
		actionItem.setParent(this);
		this.m_subItems.add(actionItem);
	}
};
oFF.CMEGroupingMenuItem.prototype.findItemsByNameOrAlias = function(nameOrAlias, recursive)
{
	var results = oFF.XList.create();
	if (oFF.XString.isEqual(nameOrAlias, oFF.CMECreatorJsonConstants.CME_REFERENCE_ROOT))
	{
		results.add(this);
	}
	else
	{
		this.findItemsByNameOrAliasInternal(nameOrAlias, recursive, results);
	}
	return results;
};
oFF.CMEGroupingMenuItem.prototype.findItemsByNameOrAliasInternal = function(nameOrAlias, recursive, results)
{
	for (var i = 0; i < this.m_subItems.size(); i++)
	{
		var subItem = this.m_subItems.get(i);
		if (oFF.XString.isEqual(subItem.getName(), nameOrAlias) || oFF.XString.isEqual(subItem.getAlias(), nameOrAlias))
		{
			results.add(subItem);
		}
		if (recursive)
		{
			var subGroupItem = subItem.getActionGroup();
			if (oFF.notNull(subGroupItem))
			{
				subGroupItem.findItemsByNameOrAliasInternal(nameOrAlias, recursive, results);
			}
		}
	}
};
oFF.CMEGroupingMenuItem.prototype.getActionGroup = function()
{
	return this;
};
oFF.CMEGroupingMenuItem.prototype.isFlat = function()
{
	return this.m_flatIfLessThanNItems === -1 || this.m_flatIfLessThanNItems > 0 && this.getEffectiveSubItemCount() < this.m_flatIfLessThanNItems;
};
oFF.CMEGroupingMenuItem.prototype.getEffectiveSubItemCount = function()
{
	if (this.m_cachedSubItemCount < 0)
	{
		this.m_cachedSubItemCount = this.getEffectiveSubItemCountInternal(false);
	}
	return this.m_cachedSubItemCount;
};
oFF.CMEGroupingMenuItem.prototype.hasEffectiveSubItems = function()
{
	return this.getEffectiveSubItemCount() > 0;
};
oFF.CMEGroupingMenuItem.prototype.getEffectiveEnabledSubItemCount = function()
{
	if (this.m_cachedEnabledSubItemCount < 0)
	{
		this.m_cachedEnabledSubItemCount = this.getEffectiveSubItemCountInternal(true);
	}
	return this.m_cachedEnabledSubItemCount;
};
oFF.CMEGroupingMenuItem.prototype.getEffectiveSubItemCountInternal = function(excludeDisabled)
{
	return oFF.XStream.of(this.m_subItems).filter( function(item){
		var mItem = item.getMenuItem();
		return oFF.notNull(mItem) && mItem.isVisible() && (!excludeDisabled || mItem.isEnabled());
	}.bind(this)).map( function(input){
		var ag = input.getActionGroup();
		return (oFF.notNull(ag) && ag.isFlat()) ? oFF.XIntegerValue.create(ag.getEffectiveSubItemCountInternal(excludeDisabled)) : oFF.XIntegerValue.create(1);
	}.bind(this)).reduce(oFF.XIntegerValue.create(0),  function(o1, o2){
		return oFF.XIntegerValue.create(o1.getInteger() + o2.getInteger());
	}.bind(this)).getInteger();
};
oFF.CMEGroupingMenuItem.prototype.setFlatIfLessThanNItems = function(numOfItems)
{
	this.m_flatIfLessThanNItems = numOfItems;
};
oFF.CMEGroupingMenuItem.prototype.getFlatIfLessThanNItems = function()
{
	return this.m_flatIfLessThanNItems;
};
oFF.CMEGroupingMenuItem.prototype.getRootName = function()
{
	var parent = this.getParent();
	if (oFF.isNull(parent))
	{
		return this.getName();
	}
	return parent.getRootName();
};
oFF.CMEGroupingMenuItem.prototype.setOverflowText = function(overflowText)
{
	this.m_overflowText = overflowText;
};
oFF.CMEGroupingMenuItem.prototype.setOverflowIfMoreThanNItems = function(overflowIfMoreThanNItems)
{
	this.m_overflowIfMoreThanNItems = overflowIfMoreThanNItems;
};
oFF.CMEGroupingMenuItem.prototype.setOverflowLocalizableText = function(overflowLocalizableText)
{
	this.m_overflowLocalizableText = overflowLocalizableText;
};
oFF.CMEGroupingMenuItem.prototype.clearSubItems = function()
{
	this.m_subItems.clear();
};
oFF.CMEGroupingMenuItem.prototype.setFlat = function(flat)
{
	this.m_flatIfLessThanNItems = flat ? -1 : 0;
};
oFF.CMEGroupingMenuItem.prototype.hideIncludingChildren = function()
{
	this.setRemoved(true);
	for (var i = 0; i < this.m_subItems.size(); i++)
	{
		this.m_subItems.get(i).hideIncludingChildren();
	}
};
oFF.CMEGroupingMenuItem.prototype.getOverflowLocalizableText = function()
{
	return this.m_overflowLocalizableText;
};
oFF.CMEGroupingMenuItem.prototype.setHideIfLessThanNItems = function(hideIfLessThanNItems)
{
	this.m_hideIfLessThanNItems = hideIfLessThanNItems;
};
oFF.CMEGroupingMenuItem.prototype.setDisableIfLessThanNItems = function(disableIfLessThanNItems)
{
	this.m_disableIfLessThanNItems = disableIfLessThanNItems;
};
oFF.CMEGroupingMenuItem.prototype.setDisableIfLessThanNEnabledItems = function(disableIfLessThanNEnabledItems)
{
	this.m_disableIfLessThanNEnabledItems = disableIfLessThanNEnabledItems;
};
oFF.CMEGroupingMenuItem.prototype.isKeepTitleForFlat = function()
{
	return this.m_keepTitleForFlat;
};
oFF.CMEGroupingMenuItem.prototype.setKeepTitleForFlat = function(keepTitleForFlat)
{
	this.m_keepTitleForFlat = keepTitleForFlat;
};
oFF.CMEGroupingMenuItem.prototype.isFirstSubOptionIsDefault = function()
{
	return this.m_firstSubOptionIsDefault;
};
oFF.CMEGroupingMenuItem.prototype.setFirstSubOptionIsDefault = function(firstSubOptionIsDefault)
{
	this.m_firstSubOptionIsDefault = firstSubOptionIsDefault;
};

oFF.CMELeafMenuItem = function() {};
oFF.CMELeafMenuItem.prototype = new oFF.CMEAbstractMenuItem();
oFF.CMELeafMenuItem.prototype._ff_c = "CMELeafMenuItem";

oFF.CMELeafMenuItem.create = function()
{
	var instance = new oFF.CMELeafMenuItem();
	instance.setup();
	return instance;
};
oFF.CMELeafMenuItem.prototype.m_operationList = null;
oFF.CMELeafMenuItem.prototype.m_activeExtended = null;
oFF.CMELeafMenuItem.prototype.m_command = null;
oFF.CMELeafMenuItem.prototype.m_toggle = false;
oFF.CMELeafMenuItem.prototype.m_activeIcon = null;
oFF.CMELeafMenuItem.prototype.m_inactiveIcon = null;
oFF.CMELeafMenuItem.prototype.m_partialIcon = null;
oFF.CMELeafMenuItem.prototype.setup = function()
{
	oFF.CMEAbstractMenuItem.prototype.setup.call( this );
	this.m_activeExtended = oFF.TriStateBool._FALSE;
	this.m_inactiveIcon = null;
	this.m_partialIcon = "less";
	this.m_activeIcon = "accept";
	this.m_operationList = oFF.XList.create();
};
oFF.CMELeafMenuItem.prototype.releaseObject = function()
{
	this.m_activeExtended = oFF.TriStateBool._FALSE;
	this.m_toggle = false;
	this.m_command = null;
	this.m_inactiveIcon = null;
	this.m_partialIcon = "less";
	this.m_activeIcon = "accept";
	oFF.CMEAbstractMenuItem.prototype.releaseObject.call( this );
};
oFF.CMELeafMenuItem.prototype.addOperation = function()
{
	var operation = oFF.CMEMenuOperation.create();
	this.m_operationList.add(operation);
	return operation;
};
oFF.CMELeafMenuItem.prototype.getOperationList = function()
{
	return this.m_operationList;
};
oFF.CMELeafMenuItem.prototype.isActive = function()
{
	return this.m_activeExtended === oFF.TriStateBool._TRUE;
};
oFF.CMELeafMenuItem.prototype.setActive = function(active)
{
	this.m_activeExtended = active ? oFF.TriStateBool._TRUE : oFF.TriStateBool._FALSE;
};
oFF.CMELeafMenuItem.prototype.getActionLeaf = function()
{
	return this;
};
oFF.CMELeafMenuItem.prototype.getCommand = function()
{
	return this.m_command;
};
oFF.CMELeafMenuItem.prototype.setCommand = function(command)
{
	this.m_command = command;
};
oFF.CMELeafMenuItem.prototype.execute = function()
{
	if (oFF.notNull(this.m_command))
	{
		this.m_command();
	}
};
oFF.CMELeafMenuItem.prototype.isToggle = function()
{
	return this.m_toggle;
};
oFF.CMELeafMenuItem.prototype.setToggle = function(toggle)
{
	this.m_toggle = toggle;
};
oFF.CMELeafMenuItem.prototype.getActiveExtended = function()
{
	return this.m_activeExtended;
};
oFF.CMELeafMenuItem.prototype.setActiveExtended = function(activeExtended)
{
	this.m_activeExtended = activeExtended;
};
oFF.CMELeafMenuItem.prototype.getActiveIcon = function()
{
	return this.m_activeIcon;
};
oFF.CMELeafMenuItem.prototype.setActiveIcon = function(activeIcon)
{
	this.m_activeIcon = activeIcon;
};
oFF.CMELeafMenuItem.prototype.getInactiveIcon = function()
{
	return this.m_inactiveIcon;
};
oFF.CMELeafMenuItem.prototype.setInactiveIcon = function(inactiveIcon)
{
	this.m_inactiveIcon = inactiveIcon;
};
oFF.CMELeafMenuItem.prototype.getPartialIcon = function()
{
	return this.m_partialIcon;
};
oFF.CMELeafMenuItem.prototype.setPartialIcon = function(partialIcon)
{
	this.m_partialIcon = partialIcon;
};
oFF.CMELeafMenuItem.prototype.getStateIcon = function()
{
	var stateIcon = null;
	if (this.isToggle())
	{
		if (this.m_activeExtended === oFF.TriStateBool._TRUE)
		{
			stateIcon = this.m_activeIcon;
		}
		else if (this.m_activeExtended === oFF.TriStateBool._DEFAULT)
		{
			stateIcon = this.m_partialIcon;
		}
		else
		{
			stateIcon = this.m_inactiveIcon;
		}
	}
	return stateIcon;
};

oFF.CMELocalizableText = function() {};
oFF.CMELocalizableText.prototype = new oFF.XObjectExt();
oFF.CMELocalizableText.prototype._ff_c = "CMELocalizableText";

oFF.CMELocalizableText.create = function()
{
	var instance = new oFF.CMELocalizableText();
	instance.setup();
	return instance;
};
oFF.CMELocalizableText.prototype.m_key = null;
oFF.CMELocalizableText.prototype.m_replacements = null;
oFF.CMELocalizableText.prototype.setup = function()
{
	oFF.XObjectExt.prototype.setup.call( this );
	this.m_replacements = oFF.XListOfString.create();
};
oFF.CMELocalizableText.prototype.releaseObject = function()
{
	this.m_key = null;
	this.m_replacements = oFF.XObjectExt.release(this.m_replacements);
	oFF.XObjectExt.prototype.releaseObject.call( this );
};
oFF.CMELocalizableText.prototype.getKey = function()
{
	return this.m_key;
};
oFF.CMELocalizableText.prototype.setKey = function(key)
{
	this.m_key = key;
};
oFF.CMELocalizableText.prototype.getReplacements = function()
{
	return this.m_replacements;
};
oFF.CMELocalizableText.prototype.addReplacement = function(replacement)
{
	this.m_replacements.add(replacement);
};

oFF.CMEMenuOperation = function() {};
oFF.CMEMenuOperation.prototype = new oFF.XObjectExt();
oFF.CMEMenuOperation.prototype._ff_c = "CMEMenuOperation";

oFF.CMEMenuOperation.create = function()
{
	var instance = new oFF.CMEMenuOperation();
	instance.setup();
	return instance;
};
oFF.CMEMenuOperation.prototype.m_name = null;
oFF.CMEMenuOperation.prototype.m_parameters = null;
oFF.CMEMenuOperation.prototype.setup = function()
{
	oFF.XObjectExt.prototype.setup.call( this );
	this.m_parameters = oFF.XList.create();
};
oFF.CMEMenuOperation.prototype.releaseObject = function()
{
	this.m_name = null;
	this.m_parameters = oFF.XObjectExt.release(this.m_parameters);
	oFF.XObjectExt.prototype.releaseObject.call( this );
};
oFF.CMEMenuOperation.prototype.getName = function()
{
	return this.m_name;
};
oFF.CMEMenuOperation.prototype.setName = function(name)
{
	this.m_name = name;
};
oFF.CMEMenuOperation.prototype.addNull = function()
{
	this.m_parameters.add(null);
};
oFF.CMEMenuOperation.prototype.addString = function(string)
{
	this.m_parameters.add(oFF.XStringValue.create(string));
};
oFF.CMEMenuOperation.prototype.addBoolean = function(boolVal)
{
	this.m_parameters.add(oFF.XBooleanValue.create(boolVal));
};
oFF.CMEMenuOperation.prototype.addValue = function(value)
{
	this.m_parameters.add(value);
};
oFF.CMEMenuOperation.prototype.addNumber = function(numberVal)
{
	this.m_parameters.add(oFF.XDoubleValue.create(numberVal));
};
oFF.CMEMenuOperation.prototype.getParameters = function()
{
	return this.m_parameters;
};

oFF.CMEConditionalMenuCreator = function() {};
oFF.CMEConditionalMenuCreator.prototype = new oFF.CMEAggregatedCreator();
oFF.CMEConditionalMenuCreator.prototype._ff_c = "CMEConditionalMenuCreator";

oFF.CMEConditionalMenuCreator.create = function()
{
	var instance = new oFF.CMEConditionalMenuCreator();
	instance.setup();
	return instance;
};
oFF.CMEConditionalMenuCreator.prototype.m_contextCondition = null;
oFF.CMEConditionalMenuCreator.prototype.checkCondition = function(parameters, name)
{
	return oFF.isNull(this.m_contextCondition) ? true : this.m_contextCondition.matches(parameters, name);
};
oFF.CMEConditionalMenuCreator.prototype.transform = function(parameters, resultContainer)
{
	this.conditionalTransform(parameters, resultContainer);
};
oFF.CMEConditionalMenuCreator.prototype.conditionalTransform = function(parameters, resultContainer)
{
	var conditionFulFilled = this.checkCondition(this.getSubContext(parameters), resultContainer.getRootName());
	if (conditionFulFilled)
	{
		this.applyTransformation(resultContainer, this.getSubContext(parameters));
		var currentName = this.getName().resolveString(parameters);
		if (oFF.notNull(currentName))
		{
			resultContainer.addTag(currentName);
		}
	}
	return conditionFulFilled;
};
oFF.CMEConditionalMenuCreator.prototype.setContextCondition = function(contextCondition)
{
	this.m_contextCondition = contextCondition;
};

oFF.CMEGroupCreator = function() {};
oFF.CMEGroupCreator.prototype = new oFF.CMEAggregatedCreator();
oFF.CMEGroupCreator.prototype._ff_c = "CMEGroupCreator";

oFF.CMEGroupCreator.create = function()
{
	var instance = new oFF.CMEGroupCreator();
	instance.setup();
	return instance;
};
oFF.CMEGroupCreator.prototype.m_flatIfLessThanNItems = null;
oFF.CMEGroupCreator.prototype.m_optionsRetriever = null;
oFF.CMEGroupCreator.prototype.m_selectionsRetriever = null;
oFF.CMEGroupCreator.prototype.m_doubtfulSelectionsRetriever = null;
oFF.CMEGroupCreator.prototype.m_selectionConsumer = null;
oFF.CMEGroupCreator.prototype.m_selectionRetriever = null;
oFF.CMEGroupCreator.prototype.m_overflowText = null;
oFF.CMEGroupCreator.prototype.m_overflowLocalizableText = null;
oFF.CMEGroupCreator.prototype.m_overflowIfMoreThanNItems = null;
oFF.CMEGroupCreator.prototype.m_hideIfLessThanNItems = null;
oFF.CMEGroupCreator.prototype.m_disableIfLessThanNItems = null;
oFF.CMEGroupCreator.prototype.m_disableIfLessThanNEnabledItems = null;
oFF.CMEGroupCreator.prototype.m_firstSubOptionIsDefault = false;
oFF.CMEGroupCreator.prototype.m_keepTitleForFlat = false;
oFF.CMEGroupCreator.prototype.transform = function(parameters, resultContainer)
{
	var subContext = this.getSubContext(parameters);
	if (oFF.notNull(subContext))
	{
		var group = resultContainer.addNewGroup();
		var isGroupEnabled = this.resolveEnabled(subContext);
		var isGroupVisible = this.resolveVisible(subContext);
		group.setOverflowPriority(this.getOverflowPriority());
		group.setName(this.getName().resolveString(subContext));
		group.setText(this.getText().resolveString(subContext));
		group.setExplanation(this.getExplanation().resolveString(subContext));
		group.setLocalizableExplanation(this.resolveLocalizableExplanation(subContext));
		group.setLocalizableText(this.resolveLocalizableText(subContext));
		group.setIcon(this.getIcon().resolveString(subContext));
		group.setEnabled(isGroupEnabled);
		group.setVisible(isGroupVisible);
		group.setKeepTitleForFlat(this.m_keepTitleForFlat);
		group.setFirstSubOptionIsDefault(this.m_firstSubOptionIsDefault);
		group.setFlatIfLessThanNItems(this.getFlatIfLessThanNItems().resolveInteger(subContext));
		group.setHideIfLessThanNItems(this.getHideIfLessThanNItems().resolveInteger(subContext));
		group.setDisableIfLessThanNItems(this.getDisableIfLessThanNItems().resolveInteger(subContext));
		group.setDisableIfLessThanNEnabledItems(this.getDisableIfLessThanNEnabledItems().resolveInteger(subContext));
		group.setOverflowIfMoreThanNItems(this.getOverflowIfMoreThanNItems().resolveInteger(subContext));
		group.setOverflowText(this.getOverflowText().resolveString(subContext));
		group.setOverflowLocalizableText(this.resolveOverflowLocalizableText(subContext));
		group.setHighlightProcedure(this.resolveHighlightProcedure(parameters));
		group.setUnHighlightProcedure(this.resolveUnHighlightProcedure(parameters));
		var leafMenuItem;
		if (oFF.notNull(this.m_optionsRetriever) && oFF.notNull(this.m_selectionConsumer))
		{
			var menuCreators = this.getMenuCreators();
			var optionsRaw = this.m_optionsRetriever(subContext);
			var selections = oFF.isNull(this.m_selectionsRetriever) ? null : this.m_selectionsRetriever(subContext);
			var doubtfulSelections = oFF.isNull(this.m_doubtfulSelectionsRetriever) ? null : this.m_doubtfulSelectionsRetriever(subContext);
			var selection = oFF.isNull(this.m_selectionRetriever) ? null : this.m_selectionRetriever(subContext);
			var i;
			if (oFF.XCollectionUtils.hasElements(menuCreators))
			{
				var optionsMap = oFF.XHashMapByString.create();
				var optionRaw;
				for (i = 0; i < optionsRaw.size(); i++)
				{
					optionRaw = optionsRaw.get(i);
					if (oFF.notNull(optionRaw))
					{
						optionsMap.put(optionRaw.getName(subContext), optionRaw);
					}
				}
				for (i = 0; i < menuCreators.size(); i++)
				{
					var menuCreator = menuCreators.get(i);
					var currentName = menuCreator.getName().resolveString(parameters);
					if (optionsMap.containsKey(currentName))
					{
						var currentOption = optionsMap.getByKey(currentName);
						leafMenuItem = group.addNewLeaf();
						var localizableText = menuCreator.resolveLocalizableText(parameters);
						leafMenuItem.setLocalizableText(localizableText);
						if (oFF.isNull(localizableText))
						{
							var currentText = menuCreator.getText().resolveString(parameters);
							if (oFF.isNull(currentText))
							{
								currentText = currentOption.getLocalizedText(parameters);
							}
							leafMenuItem.setText(currentText);
						}
						var localizableExplanation = menuCreator.resolveLocalizableExplanation(parameters);
						leafMenuItem.setLocalizableExplanation(localizableExplanation);
						if (oFF.isNull(localizableExplanation))
						{
							var currentExplanation = menuCreator.getExplanation().resolveString(parameters);
							if (oFF.isNull(currentExplanation))
							{
								currentExplanation = currentOption.getLocalizedExplanation(parameters);
							}
							leafMenuItem.setExplanation(currentExplanation);
						}
						leafMenuItem.setName(currentName);
						leafMenuItem.setVisible(isGroupVisible && currentOption.isAvailable(parameters) && menuCreator.resolveVisible(parameters));
						leafMenuItem.setEnabled(isGroupEnabled && currentOption.isEnabled(parameters) && menuCreator.resolveEnabled(parameters));
						if (selection === currentOption || oFF.notNull(selections) && selections.contains(currentOption))
						{
							leafMenuItem.setActive(true);
						}
						else if (oFF.notNull(doubtfulSelections) && doubtfulSelections.contains(currentOption))
						{
							leafMenuItem.setActiveExtended(oFF.TriStateBool._DEFAULT);
						}
						leafMenuItem.setCommand(this.getSelectionAcceptor(subContext, currentOption));
						leafMenuItem.setToggle(true);
						leafMenuItem.setHighlightProcedure(currentOption.resolveHighlightProcedure(parameters));
						leafMenuItem.setUnHighlightProcedure(currentOption.resolveUnHighlightProcedure(parameters));
					}
				}
			}
			else
			{
				for (i = 0; i < optionsRaw.size(); i++)
				{
					var option = optionsRaw.get(i);
					if (oFF.isNull(option))
					{
						continue;
					}
					leafMenuItem = group.addNewLeaf();
					leafMenuItem.setName(option.getName(subContext));
					leafMenuItem.setText(option.getLocalizedText(subContext));
					leafMenuItem.setVisible(isGroupVisible && option.isAvailable(subContext));
					leafMenuItem.setEnabled(isGroupEnabled && option.isEnabled(subContext));
					if (selection === option || oFF.notNull(selections) && selections.contains(option))
					{
						leafMenuItem.setActive(true);
					}
					else if (oFF.notNull(doubtfulSelections) && doubtfulSelections.contains(option))
					{
						leafMenuItem.setActiveExtended(oFF.TriStateBool._DEFAULT);
					}
					leafMenuItem.setCommand(this.getSelectionAcceptor(subContext, option));
					leafMenuItem.setToggle(true);
				}
			}
		}
		else
		{
			this.applyTransformation(group, subContext);
		}
	}
};
oFF.CMEGroupCreator.prototype.getSelectionAcceptor = function(subContext, currentOption)
{
	return  function(){
		this.m_selectionConsumer(subContext, currentOption, oFF.XBooleanValue.create(true));
	}.bind(this);
};
oFF.CMEGroupCreator.prototype.resolveOverflowLocalizableText = function(context)
{
	var result = null;
	if (oFF.notNull(this.m_overflowLocalizableText))
	{
		result = oFF.CMELocalizableText.create();
		result.setKey(this.m_overflowLocalizableText.getKey(context));
		var replacements = this.m_overflowLocalizableText.getReplacements(context);
		for (var i = 0; i < replacements.size(); i++)
		{
			result.addReplacement(replacements.get(i).resolveString(context));
		}
	}
	return result;
};
oFF.CMEGroupCreator.prototype.getFlatIfLessThanNItems = function()
{
	return oFF.notNull(this.m_flatIfLessThanNItems) ? this.m_flatIfLessThanNItems : oFF.CMEValueLiteralResolver.getPlus1Resolver();
};
oFF.CMEGroupCreator.prototype.getHideIfLessThanNItems = function()
{
	return oFF.notNull(this.m_hideIfLessThanNItems) ? this.m_hideIfLessThanNItems : oFF.CMEValueLiteralResolver.getPlus1Resolver();
};
oFF.CMEGroupCreator.prototype.getDisableIfLessThanNItems = function()
{
	return oFF.notNull(this.m_disableIfLessThanNItems) ? this.m_disableIfLessThanNItems : oFF.CMEValueLiteralResolver.getPlus1Resolver();
};
oFF.CMEGroupCreator.prototype.getDisableIfLessThanNEnabledItems = function()
{
	return oFF.notNull(this.m_disableIfLessThanNEnabledItems) ? this.m_disableIfLessThanNEnabledItems : oFF.CMEValueLiteralResolver.getPlus1Resolver();
};
oFF.CMEGroupCreator.prototype.setFlatIfLessThanNItems = function(flat)
{
	this.m_flatIfLessThanNItems = flat;
};
oFF.CMEGroupCreator.prototype.setHideIfLessThanNItems = function(hide)
{
	this.m_hideIfLessThanNItems = hide;
};
oFF.CMEGroupCreator.prototype.setDisableIfLessThanNItems = function(disable)
{
	this.m_disableIfLessThanNItems = disable;
};
oFF.CMEGroupCreator.prototype.setDisableIfLessThanNEnabledItems = function(disable)
{
	this.m_disableIfLessThanNEnabledItems = disable;
};
oFF.CMEGroupCreator.prototype.setOptionsRetriever = function(optionsRetriever)
{
	this.m_optionsRetriever = optionsRetriever;
};
oFF.CMEGroupCreator.prototype.setSelectionsRetriever = function(selectionsRetriever)
{
	this.m_selectionsRetriever = selectionsRetriever;
};
oFF.CMEGroupCreator.prototype.setDoubtfulSelectionsRetriever = function(selectionsRetriever)
{
	this.m_doubtfulSelectionsRetriever = selectionsRetriever;
};
oFF.CMEGroupCreator.prototype.setSelectionConsumer = function(selectionConsumer)
{
	this.m_selectionConsumer = selectionConsumer;
};
oFF.CMEGroupCreator.prototype.setSelectionRetriever = function(selectionRetriever)
{
	this.m_selectionRetriever = selectionRetriever;
};
oFF.CMEGroupCreator.prototype.getOverflowText = function()
{
	return oFF.isNull(this.m_overflowText) ? oFF.CMEValueLiteralResolver.getNullResolver() : this.m_overflowText;
};
oFF.CMEGroupCreator.prototype.setFirstSubOptionIsDefault = function(firstSubOptionIsDefault)
{
	this.m_firstSubOptionIsDefault = firstSubOptionIsDefault;
};
oFF.CMEGroupCreator.prototype.setKeepTitleForFlat = function(keepTitleForFlat)
{
	this.m_keepTitleForFlat = keepTitleForFlat;
};
oFF.CMEGroupCreator.prototype.setOverflowText = function(overflowText)
{
	this.m_overflowText = overflowText;
};
oFF.CMEGroupCreator.prototype.setOverflowLocalizableText = function(overflowLocalizableText)
{
	this.m_overflowLocalizableText = overflowLocalizableText;
};
oFF.CMEGroupCreator.prototype.getOverflowIfMoreThanNItems = function()
{
	return oFF.isNull(this.m_overflowIfMoreThanNItems) ? oFF.CMEValueLiteralResolver.getMinus1Resolver() : this.m_overflowIfMoreThanNItems;
};
oFF.CMEGroupCreator.prototype.setOverflowIfMoreThanNItems = function(overflowIfMoreThanNItems)
{
	this.m_overflowIfMoreThanNItems = overflowIfMoreThanNItems;
};
oFF.CMEGroupCreator.prototype.isGroupCreator = function()
{
	return true;
};

oFF.CMELoopedMenuCreator = function() {};
oFF.CMELoopedMenuCreator.prototype = new oFF.CMEAggregatedCreator();
oFF.CMELoopedMenuCreator.prototype._ff_c = "CMELoopedMenuCreator";

oFF.CMELoopedMenuCreator.createLoop = function()
{
	var instance = new oFF.CMELoopedMenuCreator();
	instance.setup();
	return instance;
};
oFF.CMELoopedMenuCreator.prototype.m_loopParameter = null;
oFF.CMELoopedMenuCreator.prototype.transform = function(parameters, resultContainer)
{
	var resultElements = this.getSubContext(parameters).getSubContexts(this.m_loopParameter);
	if (oFF.XCollectionUtils.hasElements(resultElements))
	{
		for (var i = 0; i < resultElements.size(); i++)
		{
			var subContext = resultElements.get(i);
			var subContextAccess = parameters.getCopy();
			var newLocalContext = oFF.CMEContext.create();
			subContextAccess.setLocalContext(newLocalContext);
			var newSubContext = newLocalContext.addSubContext();
			newSubContext.setName(subContext.getName());
			newSubContext.setText(subContext.getText());
			newSubContext.setType(subContext.getType());
			newSubContext.setCustomObject(subContext.getCustomObject());
			this.applyTransformation(resultContainer, subContextAccess);
		}
	}
};
oFF.CMELoopedMenuCreator.prototype.getLoopParameter = function()
{
	return this.m_loopParameter;
};
oFF.CMELoopedMenuCreator.prototype.setLoopParameter = function(loopParameter)
{
	this.m_loopParameter = loopParameter;
};

oFF.CMERefocusedMenuCreator = function() {};
oFF.CMERefocusedMenuCreator.prototype = new oFF.CMEAggregatedCreator();
oFF.CMERefocusedMenuCreator.prototype._ff_c = "CMERefocusedMenuCreator";

oFF.CMERefocusedMenuCreator.createRefocus = function()
{
	var instance = new oFF.CMERefocusedMenuCreator();
	instance.setup();
	return instance;
};
oFF.CMERefocusedMenuCreator.prototype.m_refocusParameter = null;
oFF.CMERefocusedMenuCreator.prototype.transform = function(parameters, resultContainer)
{
	var resultElements = this.getSubContext(parameters).getSubContexts(this.m_refocusParameter);
	if (oFF.XCollectionUtils.hasElements(resultElements))
	{
		var subContextAccess = parameters.getCopy();
		var newLocalContext = oFF.CMEContext.create();
		subContextAccess.setLocalContext(newLocalContext);
		for (var i = 0; i < resultElements.size(); i++)
		{
			var subContext = resultElements.get(i);
			var newSubContext = newLocalContext.addSubContext();
			newSubContext.setName(subContext.getName());
			newSubContext.setText(subContext.getText());
			newSubContext.setType(subContext.getType());
			newSubContext.setCustomObject(subContext.getCustomObject());
		}
		this.applyTransformation(resultContainer, subContextAccess);
	}
};
oFF.CMERefocusedMenuCreator.prototype.getRefocusParameter = function()
{
	return this.m_refocusParameter;
};
oFF.CMERefocusedMenuCreator.prototype.setRefocusParameter = function(loopParameter)
{
	this.m_refocusParameter = loopParameter;
};

oFF.CMEConditionalType = function() {};
oFF.CMEConditionalType.prototype = new oFF.XConstant();
oFF.CMEConditionalType.prototype._ff_c = "CMEConditionalType";

oFF.CMEConditionalType.EXISTS = null;
oFF.CMEConditionalType.NOT_EXISTS = null;
oFF.CMEConditionalType.EQUAL = null;
oFF.CMEConditionalType.NOT_EQUAL = null;
oFF.CMEConditionalType.MIN_SIZE = null;
oFF.CMEConditionalType.MAX_SIZE = null;
oFF.CMEConditionalType.s_instances = null;
oFF.CMEConditionalType.staticSetup = function()
{
	oFF.CMEConditionalType.s_instances = oFF.XHashMapByString.create();
	oFF.CMEConditionalType.EXISTS = oFF.CMEConditionalType.create("Exists");
	oFF.CMEConditionalType.NOT_EXISTS = oFF.CMEConditionalType.create("NotExists");
	oFF.CMEConditionalType.EQUAL = oFF.CMEConditionalType.create("Equal");
	oFF.CMEConditionalType.NOT_EQUAL = oFF.CMEConditionalType.create("NotEqual");
	oFF.CMEConditionalType.MIN_SIZE = oFF.CMEConditionalType.create("MinSize");
	oFF.CMEConditionalType.MAX_SIZE = oFF.CMEConditionalType.create("MaxSize");
};
oFF.CMEConditionalType.create = function(name)
{
	var condType = new oFF.CMEConditionalType();
	condType._setupInternal(name);
	oFF.CMEConditionalType.s_instances.put(name, condType);
	return condType;
};

oFF.CMEMenuExtensionOperationType = function() {};
oFF.CMEMenuExtensionOperationType.prototype = new oFF.XConstant();
oFF.CMEMenuExtensionOperationType.prototype._ff_c = "CMEMenuExtensionOperationType";

oFF.CMEMenuExtensionOperationType.PREPEND_INTO = null;
oFF.CMEMenuExtensionOperationType.APPEND_INTO = null;
oFF.CMEMenuExtensionOperationType.REDEFINE = null;
oFF.CMEMenuExtensionOperationType.INSERT_BEFORE = null;
oFF.CMEMenuExtensionOperationType.INSERT_AFTER = null;
oFF.CMEMenuExtensionOperationType.s_instances = null;
oFF.CMEMenuExtensionOperationType.staticSetup = function()
{
	oFF.CMEMenuExtensionOperationType.s_instances = oFF.XHashMapByString.create();
	oFF.CMEMenuExtensionOperationType.PREPEND_INTO = oFF.CMEMenuExtensionOperationType.create("PrependInto");
	oFF.CMEMenuExtensionOperationType.APPEND_INTO = oFF.CMEMenuExtensionOperationType.create("AppendInto");
	oFF.CMEMenuExtensionOperationType.REDEFINE = oFF.CMEMenuExtensionOperationType.create("Redefine");
	oFF.CMEMenuExtensionOperationType.INSERT_AFTER = oFF.CMEMenuExtensionOperationType.create("InsertAfter");
	oFF.CMEMenuExtensionOperationType.INSERT_BEFORE = oFF.CMEMenuExtensionOperationType.create("InsertBefore");
};
oFF.CMEMenuExtensionOperationType.create = function(name)
{
	var operationType = new oFF.CMEMenuExtensionOperationType();
	operationType._setupInternal(name);
	oFF.CMEMenuExtensionOperationType.s_instances.put(name, operationType);
	return operationType;
};
oFF.CMEMenuExtensionOperationType.lookup = function(name)
{
	return oFF.CMEMenuExtensionOperationType.s_instances.getByKey(name);
};

oFF.ContextMenuEngineImplModule = function() {};
oFF.ContextMenuEngineImplModule.prototype = new oFF.DfModule();
oFF.ContextMenuEngineImplModule.prototype._ff_c = "ContextMenuEngineImplModule";

oFF.ContextMenuEngineImplModule.s_module = null;
oFF.ContextMenuEngineImplModule.getInstance = function()
{
	if (oFF.isNull(oFF.ContextMenuEngineImplModule.s_module))
	{
		oFF.DfModule.checkInitialized(oFF.ContextMenuEngineModule.getInstance());
		oFF.ContextMenuEngineImplModule.s_module = oFF.DfModule.startExt(new oFF.ContextMenuEngineImplModule());
		oFF.CMEConditionalType.staticSetup();
		oFF.CMEMenuExtensionOperationType.staticSetup();
		oFF.CMEFactory.setFactory(oFF.CMEFactoryImpl.create());
		oFF.DfModule.stopExt(oFF.ContextMenuEngineImplModule.s_module);
	}
	return oFF.ContextMenuEngineImplModule.s_module;
};
oFF.ContextMenuEngineImplModule.prototype.getName = function()
{
	return "ff3410.contextmenu.engine.impl";
};

oFF.ContextMenuEngineImplModule.getInstance();

return sap.firefly;
	} );