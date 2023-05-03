/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
[
"sap/sac/df/firefly/ff2100.runtime","sap/sac/df/firefly/ff4000.protocol.ina"
],
function(oFF)
{
"use strict";

oFF.OcOrcaUtils = {

	processTime:function(time)
	{
			var processedTime = oFF.XString.replace(time, "T", " ");
		return oFF.XStringUtils.stripRight(processedTime, 8);
	}
};

oFF.OcStoryCatalog = function() {};
oFF.OcStoryCatalog.prototype = new oFF.XObject();
oFF.OcStoryCatalog.prototype._ff_c = "OcStoryCatalog";

oFF.OcStoryCatalog.prototype.m_nameToStory = null;
oFF.OcStoryCatalog.prototype.hasElements = function()
{
	return this.getCatalogItems().hasElements();
};
oFF.OcStoryCatalog.prototype.getCatalogItems = function()
{
	return this.getStoryByNameMap().getValuesAsReadOnlyList();
};
oFF.OcStoryCatalog.prototype.getCatalogItemdByStoryId = function(storyId)
{
	var items = this.getCatalogItems();
	var size = items.size();
	for (var i = 0; i < size; i++)
	{
		var item = items.get(i);
		if (oFF.XString.isEqual(item.getId(), storyId))
		{
			return item;
		}
	}
	return null;
};
oFF.OcStoryCatalog.prototype.getCatalogItemByStoryName = function(storyName)
{
	return this.getStoryByNameMap().getByKey(storyName);
};
oFF.OcStoryCatalog.prototype.addStory = function(story)
{
	this.getStoryByNameMap().put(story.getName(), story);
};
oFF.OcStoryCatalog.prototype.getStoryByNameMap = function()
{
	if (oFF.isNull(this.m_nameToStory))
	{
		this.m_nameToStory = oFF.XLinkedHashMapByString.create();
	}
	return this.m_nameToStory;
};
oFF.OcStoryCatalog.prototype.releaseObject = function()
{
	this.m_nameToStory = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_nameToStory);
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.OcStoryCatalogLoadOptions = function() {};
oFF.OcStoryCatalogLoadOptions.prototype = new oFF.XObject();
oFF.OcStoryCatalogLoadOptions.prototype._ff_c = "OcStoryCatalogLoadOptions";

oFF.OcStoryCatalogLoadOptions.prototype.m_catalogType = null;
oFF.OcStoryCatalogLoadOptions.prototype.m_recentlyAccessedStories = 0;
oFF.OcStoryCatalogLoadOptions.prototype.getCatalogType = function()
{
	if (oFF.isNull(this.m_catalogType))
	{
		return oFF.OcStoryCatalogType.SEARCH_LIST;
	}
	return this.m_catalogType;
};
oFF.OcStoryCatalogLoadOptions.prototype.setCatalogType = function(catalogType)
{
	this.m_catalogType = catalogType;
};
oFF.OcStoryCatalogLoadOptions.prototype.getNumberOfRecentlyAccessedStories = function()
{
	return this.m_recentlyAccessedStories;
};
oFF.OcStoryCatalogLoadOptions.prototype.setNumberOfRecentlyAccessedStories = function(recentlyAccessedStories)
{
	this.m_recentlyAccessedStories = recentlyAccessedStories;
};
oFF.OcStoryCatalogLoadOptions.prototype.releaseObject = function()
{
	this.m_catalogType = null;
	this.m_recentlyAccessedStories = 0;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.OcStoryCatalogLoadOptions.prototype.toString = function()
{
	var sb = oFF.XStringBuffer.create();
	sb.append("Catalog Type: ").append(this.getCatalogType().getName()).appendNewLine().append("Number of recently accessed stories: ").appendInt(this.getNumberOfRecentlyAccessedStories());
	return sb.toString();
};

oFF.OcStoryCatalogParser = function() {};
oFF.OcStoryCatalogParser.prototype = new oFF.XObject();
oFF.OcStoryCatalogParser.prototype._ff_c = "OcStoryCatalogParser";

oFF.OcStoryCatalogParser.prototype.getStoryCatalog = function(orcaStories)
{
	if (oFF.isNull(orcaStories))
	{
		return new oFF.OcStoryCatalog();
	}
	var stories;
	if (orcaStories.getType() === oFF.PrElementType.STRUCTURE)
	{
		stories = orcaStories.asStructure().getListByKey(oFF.OcOrcaConstants.STORY_SUB_NODES);
	}
	else
	{
		stories = orcaStories.asList();
	}
	var catalog = this.parseStoryList(stories);
	return catalog;
};
oFF.OcStoryCatalogParser.prototype.parseStoryList = function(orcaStories)
{
	var catalog = new oFF.OcStoryCatalog();
	var size = orcaStories.size();
	for (var i = 0; i < size; i++)
	{
		var orcaStoryElement = orcaStories.get(i);
		if (orcaStoryElement.isStructure())
		{
			var storyCatalogItem = this.parseStoryElement(orcaStoryElement.asStructure());
			if (oFF.notNull(storyCatalogItem))
			{
				catalog.addStory(storyCatalogItem);
			}
		}
	}
	return catalog;
};
oFF.OcStoryCatalogParser.prototype.parseStoryElement = function(orcaStory)
{
	var resourceType = orcaStory.getStringByKey(oFF.OcOrcaConstants.STORY_RESOURCE_TYPE);
	if (oFF.XString.isEqual(resourceType, oFF.OcOrcaConstants.STORY_RESOURCE_TYPE_STORY))
	{
		return this.parseStory(orcaStory);
	}
	else if (oFF.XString.isEqual(resourceType, oFF.OcOrcaConstants.STORY_RESOURCE_TYPE_LINK))
	{
		return this.parseLink(orcaStory);
	}
	return null;
};
oFF.OcStoryCatalogParser.prototype.parseLink = function(orcaLink)
{
	var sourceResource = orcaLink.getByKey(oFF.OcOrcaConstants.STORY_SOURCE_RESOURCE);
	if (oFF.notNull(sourceResource) && sourceResource.isStructure())
	{
		return this.parseStory(sourceResource.asStructure());
	}
	return null;
};
oFF.OcStoryCatalogParser.prototype.parseStory = function(orcaStory)
{
	var storyId = orcaStory.getStringByKey(oFF.OcOrcaConstants.STORY_RESOURCE_ID);
	var storyName = orcaStory.getStringByKey(oFF.OcOrcaConstants.STORY_NAME);
	var storyCatalogInfo = oFF.OcStoryCatalogItem.create(storyId, storyName);
	storyCatalogInfo.setDescription(orcaStory.getStringByKey(oFF.OcOrcaConstants.STORY_DESCRIPTION));
	storyCatalogInfo.setCreateTime(oFF.OcOrcaUtils.processTime(orcaStory.getStringByKey(oFF.OcOrcaConstants.STORY_CREATED_TIME)));
	storyCatalogInfo.setModifiedTime(oFF.OcOrcaUtils.processTime(orcaStory.getStringByKey(oFF.OcOrcaConstants.STORY_MODIFIED_TIME)));
	storyCatalogInfo.setCreatedBy(orcaStory.getStringByKey(oFF.OcOrcaConstants.STORY_CREATED_BY));
	storyCatalogInfo.setModifiedBy(orcaStory.getStringByKey(oFF.OcOrcaConstants.STORY_MODIFIED_BY));
	storyCatalogInfo.setUpdateCounter(oFF.OcStoryUtils.getIntegerFromStructureByName(orcaStory, oFF.OcOrcaConstants.STORY_UPDATE_COUNTER));
	this.addDisplayNames(storyCatalogInfo, orcaStory);
	return storyCatalogInfo;
};
oFF.OcStoryCatalogParser.prototype.addDisplayNames = function(storyCatalogInfo, orcaStory)
{
	var createdByDisplayName = orcaStory.getStringByKey(oFF.OcOrcaConstants.STORY_CREATED_BY_DISPLAY_NAME);
	var modifiedByDisplayName = "";
	if (oFF.isNull(createdByDisplayName))
	{
		var storyData = orcaStory.getStructureByKey(oFF.OcOrcaConstants.STORY_DATA);
		if (oFF.notNull(storyData))
		{
			var storyMetadata = storyData.getStructureByKey(oFF.OcOrcaConstants.STORY_METADATA);
			if (oFF.notNull(storyMetadata))
			{
				createdByDisplayName = storyMetadata.getStringByKey(oFF.OcOrcaConstants.STORY_OWNER_DISPLAY_NAME);
				modifiedByDisplayName = storyMetadata.getStringByKey(oFF.OcOrcaConstants.STORY_CHANGED_BY_DISPLAY_NAME);
			}
		}
	}
	else
	{
		modifiedByDisplayName = orcaStory.getStringByKey(oFF.OcOrcaConstants.STORY_MODIFIED_BY_DISPLAY_NAME);
	}
	storyCatalogInfo.setCreatedByDisplayName(createdByDisplayName);
	storyCatalogInfo.setModifiedByDisplayName(modifiedByDisplayName);
};

oFF.OrcaSystemConverter = function() {};
oFF.OrcaSystemConverter.prototype = new oFF.XObject();
oFF.OrcaSystemConverter.prototype._ff_c = "OrcaSystemConverter";

oFF.OrcaSystemConverter.CLIENT_CONTEXT = "Client";
oFF.OrcaSystemConverter.s_orcaSystemConverter = null;
oFF.OrcaSystemConverter.create = function()
{
	if (oFF.isNull(oFF.OrcaSystemConverter.s_orcaSystemConverter))
	{
		oFF.OrcaSystemConverter.s_orcaSystemConverter = new oFF.OrcaSystemConverter();
	}
	return oFF.OrcaSystemConverter.s_orcaSystemConverter;
};
oFF.OrcaSystemConverter.setConverter = function(orcaSystemConverter)
{
	oFF.OrcaSystemConverter.s_orcaSystemConverter = orcaSystemConverter;
};
oFF.OrcaSystemConverter.getValue = function(input, name1, name2)
{
	var value = input.getStringByKey(name1);
	if (oFF.isNull(value))
	{
		value = input.getStringByKey(name2);
	}
	return value;
};
oFF.OrcaSystemConverter.prototype.convert = function(connection, connectionsJson, context)
{
	var masterSystem = connection.getSystemDescription();
	var session = connection.getSession();
	var list = oFF.XList.create();
	var systems = connectionsJson.getStructureByKey("Systems");
	if (oFF.notNull(systems))
	{
		var names = systems.getKeysAsReadOnlyListOfString();
		for (var index = 0; index < names.size(); index++)
		{
			var sysName = names.get(index);
			if (oFF.XString.isEqual(context, oFF.OrcaSystemConverter.CLIENT_CONTEXT) || !oFF.XString.isEqual(oFF.OcOrcaServiceConfig.ORCA_MASTER_SYSTEM_NAME, sysName) && !oFF.XString.isEqual(masterSystem.getSystemName(), sysName))
			{
				var currentSystemDesc = systems.getStructureByKey(names.get(index));
				var systemDescProperties = this.convertToProperties(currentSystemDesc, masterSystem, context);
				if (oFF.notNull(systemDescProperties))
				{
					var systemDesc = oFF.SystemDescription.createExt(session, null, sysName, systemDescProperties);
					list.add(systemDesc);
				}
			}
		}
	}
	return list;
};
oFF.OrcaSystemConverter.prototype.convertToProperties = function(input, masterSystem, context)
{
	var output = oFF.PrFactory.createStructure();
	var systemTypeValue = oFF.OrcaSystemConverter.getValue(input, "SYSTEM_TYPE", "systemType");
	var systemType = oFF.SystemType.lookup(systemTypeValue);
	if (oFF.isNull(systemType))
	{
		return null;
	}
	if (systemType.isTypeOf(oFF.SystemType.BW))
	{
		var client = oFF.OrcaSystemConverter.getValue(input, "CLIENT", "client");
		output.putString(oFF.ConnectionParameters.CLIENT, client);
	}
	var authMethod = oFF.OrcaSystemConverter.getValue(input, "FPA_AUTHENTICATION_METHOD", "authenticationMethod");
	if (oFF.isNull(authMethod) || oFF.XString.isEqual(authMethod, "NOAUTH") || oFF.XString.isEqual(authMethod, "NONE"))
	{
		output.putString(oFF.ConnectionParameters.AUTHENTICATION_TYPE, oFF.AuthenticationType.NONE.getName());
	}
	else if (oFF.XString.isEqual(authMethod, "SAML"))
	{
		output.putString(oFF.ConnectionParameters.AUTHENTICATION_TYPE, oFF.AuthenticationType.SAML_WITH_PASSWORD.getName());
	}
	else if (oFF.XString.isEqual(authMethod, "BASIC"))
	{
		output.putString(oFF.ConnectionParameters.AUTHENTICATION_TYPE, oFF.AuthenticationType.BASIC.getName());
	}
	var connectionType = oFF.OrcaSystemConverter.getValue(input, "FPA_CONNECTION_TYPE", "connectionType");
	output.putString("connectionType", connectionType);
	var isSFSF = input.getBooleanByKeyExt(oFF.OcOrcaConstants.STORY_IS_LIVE_INTEGRATION_TYPE, false);
	if (isSFSF)
	{
		output.putString(oFF.OcOrcaConstants.STORY_IS_LIVE_INTEGRATION_TYPE, "YES");
	}
	var protocol = oFF.OrcaSystemConverter.getValue(input, "PROTOCOL", "protocol");
	output.putString(oFF.ConnectionParameters.PROTOCOL, protocol);
	var host = oFF.OrcaSystemConverter.getValue(input, "HOST", "host");
	output.putString(oFF.ConnectionParameters.HOST, host);
	var port = oFF.OrcaSystemConverter.getValue(input, "PORT", "port");
	output.putString(oFF.ConnectionParameters.PORT, port);
	output.putString(oFF.ConnectionParameters.SYSTEM_TYPE, systemTypeValue);
	var webdispatcherUri = oFF.OrcaSystemConverter.getValue(input, "WEBDISPATCHER_URI", "webdispatcherUri");
	if (oFF.XStringUtils.isNotNullAndNotEmpty(webdispatcherUri))
	{
		var prefix = oFF.OrcaSystemConverter.getValue(input, "PREFIX", "prefix");
		output.putString(oFF.ConnectionParameters.PREFIX, prefix);
		var wdFinal = oFF.XStringBuffer.create().append(masterSystem.getScheme()).append("://").append(masterSystem.getHost()).append(":").appendInt(masterSystem.getPort()).append(webdispatcherUri).toString();
		output.putString(oFF.ConnectionParameters.WEBDISPATCHER_URI, wdFinal);
	}
	var properties = oFF.XProperties.create();
	var keys = output.getKeysAsReadOnlyListOfString();
	for (var i = 0; i < keys.size(); i++)
	{
		var key = keys.get(i);
		var value = output.getStringByKey(key);
		properties.put(key, value);
	}
	return properties;
};

oFF.OcOrcaContext = function() {};
oFF.OcOrcaContext.prototype = new oFF.XObject();
oFF.OcOrcaContext.prototype._ff_c = "OcOrcaContext";

oFF.OcOrcaContext.create = function(storyJson, session, connection)
{
	var context = new oFF.OcOrcaContext();
	context.setupContext(storyJson, session, connection);
	return context;
};
oFF.OcOrcaContext.prototype.m_tolerant = false;
oFF.OcOrcaContext.prototype.m_storyEntityHelper = null;
oFF.OcOrcaContext.prototype.m_storyEntityFactory = null;
oFF.OcOrcaContext.prototype.m_messageManager = null;
oFF.OcOrcaContext.prototype.m_connection = null;
oFF.OcOrcaContext.prototype.setupContext = function(storyJson, session, connection)
{
	oFF.XObject.prototype.setup.call( this );
	if (oFF.isNull(storyJson) || !storyJson.hasElements())
	{
		throw oFF.XException.createIllegalArgumentException("The story cannot be null or empty");
	}
	this.m_connection = connection;
	this.m_messageManager = this.createMessageManager(session);
	this.m_tolerant = true;
	this.m_storyEntityHelper = oFF.OcOrcaStoryEntityHelper.create(storyJson, this);
};
oFF.OcOrcaContext.prototype.getMessageManager = function()
{
	return this.m_messageManager;
};
oFF.OcOrcaContext.prototype.getConnection = function()
{
	return this.m_connection;
};
oFF.OcOrcaContext.prototype.isTolerant = function()
{
	return this.m_tolerant;
};
oFF.OcOrcaContext.prototype.setIsTolerant = function(value)
{
	this.m_tolerant = value;
};
oFF.OcOrcaContext.prototype.getStoryEntityFactory = function()
{
	if (oFF.isNull(this.m_storyEntityFactory))
	{
		this.m_storyEntityFactory = oFF.OcOrcaStoryEntityFactory.create(this);
	}
	return this.m_storyEntityFactory;
};
oFF.OcOrcaContext.prototype.getStoryEntityHelper = function()
{
	return this.m_storyEntityHelper;
};
oFF.OcOrcaContext.prototype.createMessageManager = function(session)
{
	if (oFF.isNull(session))
	{
		return oFF.MessageManagerSimple.createMessageManager();
	}
	return oFF.MessageManager.createMessageManagerExt(session);
};
oFF.OcOrcaContext.prototype.releaseObject = function()
{
	this.m_connection = null;
	this.m_messageManager = oFF.XObjectExt.release(this.m_messageManager);
	this.m_storyEntityHelper = oFF.XObjectExt.release(this.m_storyEntityHelper);
	this.m_storyEntityFactory = oFF.XObjectExt.release(this.m_storyEntityFactory);
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.OcOrcaStoryEntityFactory = function() {};
oFF.OcOrcaStoryEntityFactory.prototype = new oFF.XObject();
oFF.OcOrcaStoryEntityFactory.prototype._ff_c = "OcOrcaStoryEntityFactory";

oFF.OcOrcaStoryEntityFactory.create = function(context)
{
	var factory = new oFF.OcOrcaStoryEntityFactory();
	factory.setupFactory(context);
	return factory;
};
oFF.OcOrcaStoryEntityFactory.prototype.m_context = null;
oFF.OcOrcaStoryEntityFactory.prototype.m_pageWidgetHelper = null;
oFF.OcOrcaStoryEntityFactory.prototype.setupFactory = function(context)
{
	oFF.XObject.prototype.setup.call( this );
	this.m_context = context;
};
oFF.OcOrcaStoryEntityFactory.prototype.createPagesOfStory = function(story)
{
	return this.createPageByPageIdMap(story);
};
oFF.OcOrcaStoryEntityFactory.prototype.createWidgetsOfPage = function(page)
{
	return this.createWidgetByWidgetIdMap(page);
};
oFF.OcOrcaStoryEntityFactory.prototype.createDatasets = function()
{
	return oFF.OcOrcaDatasets.create(this.getContext());
};
oFF.OcOrcaStoryEntityFactory.prototype.createThresholds = function()
{
	return oFF.OcOrcaThresholds.create(this.getContext());
};
oFF.OcOrcaStoryEntityFactory.prototype.createCalculations = function()
{
	return oFF.OcOrcaCalculations.create(this.getContext());
};
oFF.OcOrcaStoryEntityFactory.prototype.createFieldSelections = function()
{
	return oFF.OcOrcaFieldSelections.create(this.getContext());
};
oFF.OcOrcaStoryEntityFactory.prototype.createCalculationVariables = function()
{
	return oFF.OcOrcaCalculationVariables.create(this.getContext());
};
oFF.OcOrcaStoryEntityFactory.prototype.createMeasurySyncs = function()
{
	return oFF.OcOrcaMeasureSyncs.create(this.getContext());
};
oFF.OcOrcaStoryEntityFactory.prototype.createImages = function(storyId)
{
	return oFF.OcOrcaImages.create(storyId, this.getContext());
};
oFF.OcOrcaStoryEntityFactory.prototype.createPageByPageIdMap = function(story)
{
	var pageByPageIdMap = oFF.XLinkedHashMapByString.create();
	var pageIds = this.getPageWidgetHelper().getPageIds();
	if (!oFF.XCollectionUtils.hasElements(pageIds))
	{
		return pageByPageIdMap;
	}
	for (var i = 0; i < pageIds.size(); i++)
	{
		var pageId = pageIds.get(i);
		var pageJson = this.getPageWidgetHelper().getPageJsonByPageId(pageId);
		if (oFF.notNull(pageJson))
		{
			var pageName = pageJson.getStringByKey(oFF.OcOrcaConstants.PAGE_TITLE);
			var page = oFF.OcOrcaPage.create(pageId, pageName, pageJson, story);
			if (oFF.notNull(page))
			{
				pageByPageIdMap.put(pageId, page);
			}
		}
	}
	return pageByPageIdMap;
};
oFF.OcOrcaStoryEntityFactory.prototype.createWidgetByWidgetIdMap = function(page)
{
	var widgetByWidgetIdMap = oFF.XLinkedHashMapByString.create();
	var widgetIds = this.getPageWidgetHelper().getWidgetIdsByPageId(page.getId());
	if (!oFF.XCollectionUtils.hasElements(widgetIds))
	{
		return widgetByWidgetIdMap;
	}
	for (var i = 0; i < widgetIds.size(); i++)
	{
		var widgetId = widgetIds.get(i);
		var widget = this.createWidget(widgetId, page);
		if (oFF.notNull(widget))
		{
			widgetByWidgetIdMap.put(widgetId, widget);
		}
	}
	return widgetByWidgetIdMap;
};
oFF.OcOrcaStoryEntityFactory.prototype.getFirstWidgetByType = function(page, targetWidgetType)
{
	var widgetIds = this.getPageWidgetHelper().getWidgetIdsByPageId(page.getId());
	if (!oFF.XCollectionUtils.hasElements(widgetIds))
	{
		return null;
	}
	for (var i = 0; i < widgetIds.size(); i++)
	{
		var widgetId = widgetIds.get(i);
		var widgetJson = this.getPageWidgetHelper().getWidgetJsonByWidgetId(widgetId);
		if (oFF.isNull(widgetJson))
		{
			return null;
		}
		var widgetType = widgetJson.getStringByKey(oFF.OcOrcaConstants.WIDGET_CLASS);
		var chartType = oFF.OcJsonPathEvaluator.getSingleJsonPathElementAsString(widgetJson, oFF.OcOrcaConstants.PATH_FROM_DEFINITION_TO_CHART_TYPE);
		if (targetWidgetType === oFF.OcWidgetType.KPI && oFF.XString.containsString(widgetType, oFF.OcOrcaConstants.WIDGET_TYPE_CHART) && (oFF.XString.isEqual(chartType, "metric") || oFF.XString.isEqual(chartType, "bullet")))
		{
			return oFF.OcOrcaKpiWidget.create(widgetId, widgetJson, page);
		}
		else if (targetWidgetType === oFF.OcWidgetType.ANALYTICAL_CARD && oFF.XString.containsString(widgetType, oFF.OcOrcaConstants.WIDGET_TYPE_CHART) && (oFF.XString.isEqual(chartType, "metric") || oFF.XString.isEqual(chartType, "bullet")))
		{
			return oFF.OcOrcaAnalyticalCardWidget.create(widgetId, widgetJson, page);
		}
		else if (targetWidgetType === oFF.OcWidgetType.CHART && oFF.XString.containsString(widgetType, oFF.OcOrcaConstants.WIDGET_TYPE_CHART) && !oFF.XString.isEqual(chartType, "metric") && !oFF.XString.isEqual(chartType, "bullet"))
		{
			return oFF.OcOrcaChartWidget.create(widgetId, widgetJson, page);
		}
		else if (targetWidgetType === oFF.OcWidgetType.GRID && oFF.XString.containsString(widgetType, oFF.OcOrcaConstants.WIDGET_TYPE_TABLE))
		{
			return oFF.OcOrcaGridWidget.create(widgetId, widgetJson, page);
		}
	}
	return null;
};
oFF.OcOrcaStoryEntityFactory.prototype.createWidget = function(widgetId, page)
{
	var widgetJson = this.getPageWidgetHelper().getWidgetJsonByWidgetId(widgetId);
	if (oFF.isNull(widgetJson))
	{
		return null;
	}
	var widgetType = widgetJson.getStringByKey(oFF.OcOrcaConstants.WIDGET_CLASS);
	if (oFF.XString.containsString(widgetType, oFF.OcOrcaConstants.WIDGET_TYPE_CHART))
	{
		return oFF.OcOrcaChartWidget.create(widgetId, widgetJson, page);
	}
	else if (oFF.XString.containsString(widgetType, oFF.OcOrcaConstants.WIDGET_TYPE_TABLE))
	{
		return oFF.OcOrcaGridWidget.create(widgetId, widgetJson, page);
	}
	else if (oFF.XString.containsString(widgetType, oFF.OcOrcaConstants.WIDGET_TYPE_TEXT) || oFF.XString.containsString(widgetType, oFF.OcOrcaConstants.WIDGET_TYPE_HEADER))
	{
		return oFF.OcOrcaWidget.create(widgetId, oFF.OcWidgetType.TEXT, widgetJson, page);
	}
	else if (oFF.XString.containsString(widgetType, oFF.OcOrcaConstants.WIDGET_TYPE_IMAGE))
	{
		return oFF.OcOrcaWidget.create(widgetId, oFF.OcWidgetType.IMAGE, widgetJson, page);
	}
	else if (oFF.XString.containsString(widgetType, oFF.OcOrcaConstants.WIDGET_TYPE_PICTOGRAM) || oFF.XString.containsString(widgetType, oFF.OcOrcaConstants.WIDGET_TYPE_PICTOGRAM_SHAPE))
	{
		return oFF.OcOrcaWidget.create(widgetId, oFF.OcWidgetType.PICTOGRAM, widgetJson, page);
	}
	else if (oFF.XString.containsString(widgetType, oFF.OcOrcaConstants.WIDGET_TYPE_PAGE_FILTER))
	{
		return oFF.OcOrcaWidget.create(widgetId, oFF.OcWidgetType.PAGE_FILTER, widgetJson, page);
	}
	else if (oFF.XString.containsString(widgetType, oFF.OcOrcaConstants.WIDGET_TYPE_CALC_INPUT_CONTROL))
	{
		return oFF.OcOrcaWidget.create(widgetId, oFF.OcWidgetType.CALCULATION_INPUT_CONTROL, widgetJson, page);
	}
	else if (oFF.XString.containsString(widgetType, oFF.OcOrcaConstants.WIDGET_TYPE_FIELD_SELECTION_INPUT_CONTROL))
	{
		return oFF.OcOrcaWidget.create(widgetId, oFF.OcWidgetType.FIELD_SELECTION_INPUT_CONTROL, widgetJson, page);
	}
	return null;
};
oFF.OcOrcaStoryEntityFactory.prototype.getPageWidgetHelper = function()
{
	if (oFF.isNull(this.m_pageWidgetHelper))
	{
		this.m_pageWidgetHelper = oFF.OcOrcaPageWidgetHelper.create(this.getContext());
	}
	return this.m_pageWidgetHelper;
};
oFF.OcOrcaStoryEntityFactory.prototype.getContext = function()
{
	return this.m_context;
};
oFF.OcOrcaStoryEntityFactory.prototype.releaseObject = function()
{
	this.m_context = null;
	this.m_pageWidgetHelper = oFF.XObjectExt.release(this.m_pageWidgetHelper);
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.OcOrcaCalculationVariables = function() {};
oFF.OcOrcaCalculationVariables.prototype = new oFF.XObject();
oFF.OcOrcaCalculationVariables.prototype._ff_c = "OcOrcaCalculationVariables";

oFF.OcOrcaCalculationVariables.create = function(context)
{
	var calculationVariables = new oFF.OcOrcaCalculationVariables();
	calculationVariables.setupCalculationVariables(context);
	return calculationVariables;
};
oFF.OcOrcaCalculationVariables.prototype.m_context = null;
oFF.OcOrcaCalculationVariables.prototype.m_calculationVariables = null;
oFF.OcOrcaCalculationVariables.prototype.setupCalculationVariables = function(context)
{
	oFF.XObject.prototype.setup.call( this );
	this.m_context = context;
};
oFF.OcOrcaCalculationVariables.prototype.getCalculationVariableById = function(calculationVariableId)
{
	return this.getCalculationVariables().getByKey(calculationVariableId);
};
oFF.OcOrcaCalculationVariables.prototype.getCalculationVariables = function()
{
	if (oFF.notNull(this.m_calculationVariables))
	{
		return this.m_calculationVariables;
	}
	this.m_calculationVariables = oFF.XHashMapByString.create();
	var selectionsJson = this.getStoryEntityHelper().getEntitiesAsJsonByEntityType(oFF.OcOrcaConstants.STORY_ENTITY_CALCULATION_VARIABLE);
	for (var i = 0; i < selectionsJson.size(); i++)
	{
		var selectionJson = selectionsJson.get(i);
		this.addOrcaCalcVarsToCalcVars(selectionJson, this.m_calculationVariables);
	}
	return this.m_calculationVariables;
};
oFF.OcOrcaCalculationVariables.prototype.addOrcaCalcVarsToCalcVars = function(selectionJson, selections)
{
	var calcVarEntitiesJson = selectionJson.getListByKey(oFF.OcOrcaConstants.STORY_CALCULATION_VARIABLE_ENTITIES);
	if (oFF.PrUtils.isListEmpty(calcVarEntitiesJson))
	{
		return;
	}
	for (var i = 0; i < calcVarEntitiesJson.size(); i++)
	{
		var calcVarEntityJson = calcVarEntitiesJson.getStructureAt(i);
		var calcvar = this.createCalcvarFromOrcaCalcVarEntity(calcVarEntityJson);
		if (oFF.notNull(calcvar))
		{
			selections.put(calcvar.getId(), calcvar);
		}
	}
};
oFF.OcOrcaCalculationVariables.prototype.createCalcvarFromOrcaCalcVarEntity = function(calcVarEntityJson)
{
	var calcVarEntityMetadataJson = calcVarEntityJson.getStructureByKey(oFF.OcOrcaConstants.ID_ELEMENT);
	if (oFF.isNull(calcVarEntityMetadataJson))
	{
		return null;
	}
	var calcVarEntityId = calcVarEntityMetadataJson.getStringByKey(oFF.OcOrcaConstants.ID_ELEMENT);
	var calcVarEntityName = calcVarEntityJson.getStringByKey(oFF.OcOrcaConstants.STORY_CALCULATION_VARIABLE_NAME);
	var calcVarEntityType = calcVarEntityMetadataJson.getStringByKey(oFF.OcOrcaConstants.STORY_CALCULATION_VARIABLE_TYPE);
	var calcVarValueType = calcVarEntityJson.getStringByKey(oFF.OcOrcaConstants.STORY_CALCULATION_VARIABLE_VALUE_TYPE);
	var calcVar = oFF.OcCalculationVariable.create(calcVarEntityId, calcVarEntityName, calcVarEntityType, calcVarValueType);
	if (oFF.XString.isEqual(calcVarEntityType, oFF.OcOrcaConstants.STORY_CALCULATION_VARIABLE))
	{
		calcVar.setSelectionInfos(calcVarEntityJson.getStructureByKey(oFF.OcOrcaConstants.STORY_CALCULATION_VARIABLE_SELECTION_INFO));
	}
	return calcVar;
};
oFF.OcOrcaCalculationVariables.prototype.getStoryEntityHelper = function()
{
	return this.getContext().getStoryEntityHelper();
};
oFF.OcOrcaCalculationVariables.prototype.getContext = function()
{
	return this.m_context;
};
oFF.OcOrcaCalculationVariables.prototype.toString = function()
{
	var calcVars = this.getCalculationVariables().getValuesAsReadOnlyList();
	var sb = oFF.XStringBuffer.create();
	sb.append("calc vars:");
	for (var i = 0; i < calcVars.size(); i++)
	{
		var calcVar = calcVars.get(i);
		sb.appendNewLine().appendInt(i + 1).append(". FieldSelection: ").append(calcVar.getId()).append(" of type ").append(calcVar.getCalculationVariableType());
	}
	return sb.toString();
};
oFF.OcOrcaCalculationVariables.prototype.releaseObject = function()
{
	this.m_context = null;
	this.m_calculationVariables = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_calculationVariables);
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.OcOrcaCalculations = function() {};
oFF.OcOrcaCalculations.prototype = new oFF.XObject();
oFF.OcOrcaCalculations.prototype._ff_c = "OcOrcaCalculations";

oFF.OcOrcaCalculations.create = function(context)
{
	var calculations = new oFF.OcOrcaCalculations();
	calculations.setupCalculations(context);
	return calculations;
};
oFF.OcOrcaCalculations.prototype.m_context = null;
oFF.OcOrcaCalculations.prototype.m_calculations = null;
oFF.OcOrcaCalculations.prototype.setupCalculations = function(context)
{
	oFF.XObject.prototype.setup.call( this );
	this.m_context = context;
};
oFF.OcOrcaCalculations.prototype.getCalculationByCalculationId = function(calculationId)
{
	return this.getCalculations().getByKey(calculationId);
};
oFF.OcOrcaCalculations.prototype.getCalculations = function()
{
	if (oFF.notNull(this.m_calculations))
	{
		return this.m_calculations;
	}
	this.m_calculations = oFF.XHashMapByString.create();
	var calculationsJson = this.getStoryEntityHelper().getEntitiesAsJsonByEntityType(oFF.OcOrcaConstants.STORY_ENTITY_CALCULATION);
	for (var i = 0; i < calculationsJson.size(); i++)
	{
		var calculationJson = calculationsJson.get(i);
		this.addOrcaCalculationToCalculations(calculationJson, this.m_calculations);
	}
	return this.m_calculations;
};
oFF.OcOrcaCalculations.prototype.addOrcaCalculationToCalculations = function(calculationJson, calculations)
{
	var calculationEntitiesJson = calculationJson.getListByKey(oFF.OcOrcaConstants.STORY_CALCULATION_ENTITIES);
	if (oFF.PrUtils.isListEmpty(calculationEntitiesJson))
	{
		return;
	}
	for (var i = 0; i < calculationEntitiesJson.size(); i++)
	{
		var calculationEntityJson = calculationEntitiesJson.getStructureAt(i);
		var calculation = this.createCalculationFromOrcaCalculationEntity(calculationEntityJson);
		if (oFF.notNull(calculation))
		{
			calculations.put(calculation.getId(), calculation);
		}
	}
};
oFF.OcOrcaCalculations.prototype.createCalculationFromOrcaCalculationEntity = function(calculationEntityJson)
{
	var calculationEntityMetadataJson = calculationEntityJson.getStructureByKey(oFF.OcOrcaConstants.ID_ELEMENT);
	if (oFF.isNull(calculationEntityMetadataJson))
	{
		return null;
	}
	var calculationEntityId = calculationEntityMetadataJson.getStringByKey(oFF.OcOrcaConstants.ID_ELEMENT);
	var calculationEntityName = calculationEntityJson.getStringByKey(oFF.OcOrcaConstants.STORY_CALCULATION_NAME);
	var calculationEntityType = calculationEntityMetadataJson.getStringByKey(oFF.OcOrcaConstants.STORY_CALCULATION_TYPE);
	var calculationType = calculationEntityJson.getStringByKey(oFF.OcOrcaConstants.STORY_CALCULATION_CALCULATION_TYPE);
	var calculationEntitySubType = calculationEntityMetadataJson.getStringByKey(oFF.OcOrcaConstants.STORY_CALCULATION_SUBTYPE);
	if (oFF.notNull(calculationEntitySubType) && !oFF.XString.startsWith(calculationEntitySubType, calculationEntityType))
	{
		calculationEntityType = oFF.XStringUtils.concatenate3(calculationEntityType, ".", calculationEntitySubType);
	}
	if (oFF.notNull(calculationType))
	{
		calculationEntityType = oFF.XStringUtils.concatenate3(calculationEntityType, ".", calculationType);
	}
	var calculation = oFF.OcCalculation.create(calculationEntityId, calculationEntityName, calculationEntityType);
	calculation.setFormatting(calculationEntityJson.getByKey(oFF.OcOrcaConstants.STORY_CALCULATION_FORMAT));
	if (oFF.XString.isEqual(calculationEntityType, oFF.OcOrcaConstants.STORY_CACLUALTION_RESTRICTED_MEASURE))
	{
		calculation.setMeasureId(calculationEntityJson.getByKey(oFF.OcOrcaConstants.STORY_CALCULATION_MEASURE_ID));
		calculation.setReferenceMeasureId(calculationEntityJson.getByKey(oFF.OcOrcaConstants.STORY_CALCULATION_REFERENCE_MEASURE_ID));
		calculation.setSelections(calculationEntityJson.getByKey(oFF.OcOrcaConstants.STORY_CALCULATION_SELECTIONS));
	}
	else if (oFF.XString.startsWith(calculationEntityType, oFF.OcOrcaConstants.STORY_ENTITY_CALCULATION) || oFF.XString.startsWith(calculationEntityType, oFF.OcOrcaConstants.STORY_ENTITY_CALCULATED_DIMENSION))
	{
		calculation.setMeasureId(calculationEntityJson.getByKey(oFF.OcOrcaConstants.STORY_CALCULATION_MEASURE_ID));
		calculation.setReferenceMeasureId(calculationEntityJson.getByKey(oFF.OcOrcaConstants.STORY_CALCULATION_REFERENCE_MEASURE_ID));
		if (calculationEntityJson.containsKey("formulaAST"))
		{
			var newFormula = oFF.PrFactory.createStructure();
			newFormula.putNotNullAndNotEmpty("ast", oFF.PrUtils.deepCopyElement(calculationEntityJson.getStructureByKey("formulaAST")));
			calculation.setFormula(newFormula);
		}
		else
		{
			calculation.setFormula(calculationEntityJson.getByKey(oFF.OcOrcaConstants.STORY_CALCULATION_FORMULA));
		}
		calculation.setAggregation(calculationEntityJson.getStringByKeyExt(oFF.OcOrcaConstants.STORY_CALCULATION_AGGREGATION, ""));
		calculation.setAggregationDimensions(calculationEntityJson.getListByKey(oFF.OcOrcaConstants.STORY_CALCULATION_AGGREGATION_DIMENSIONS));
		calculation.setExceptionAggregation(calculationEntityJson.getStringByKeyExt(oFF.OcOrcaConstants.STORY_CALCULATION_EXCEPTION_AGGREGATION, ""));
		calculation.setExceptionAggregationDimensions(calculationEntityJson.getListByKey(oFF.OcOrcaConstants.STORY_CALCULATION_EXCEPTION_AGGREGATION_DIMENSIONS));
		calculation.setValuesNotIn(calculationEntityJson.getBooleanByKeyExt(oFF.OcOrcaConstants.STORY_CALCULATION_VALUES_NOT_IN, false));
		calculation.setStartDate(calculationEntityJson.getStructureByKey(oFF.OcOrcaConstants.STORY_CALCULATION_START_DATE));
		calculation.setEndDate(calculationEntityJson.getStructureByKey(oFF.OcOrcaConstants.STORY_CALCULATION_END_DATE));
		calculation.setStartDateCurrentIfNull(calculationEntityJson.getBooleanByKeyExt(oFF.OcOrcaConstants.STORY_CALCULATION_START_DATE_IF_NULL, false));
		calculation.setEndDateCurrentIfNull(calculationEntityJson.getBooleanByKeyExt(oFF.OcOrcaConstants.STORY_CALCULATION_END_DATE_IF_NULL, false));
		calculation.setTimezoneOffsetForCurrentDate(calculationEntityJson.getIntegerByKeyExt(oFF.OcOrcaConstants.STORY_CALCULATION_TIME_ZONE_OFFSET_FOR_CURRENT_DATE, 0));
		calculation.setResultGranularity(calculationEntityJson.getStringByKey(oFF.OcOrcaConstants.STORY_CALCULATION_RESULT_GRANULARITY));
		calculation.setValueType(calculationEntityJson.getStringByKey(oFF.OcOrcaConstants.STORY_CALCULATION_VALUE_TYPE));
		calculation.setGroupThresholds(calculationEntityJson.getListByKey(oFF.OcOrcaConstants.STORY_CALCULATION_GROUP_THRESHOLDS));
		calculation.setSelectedDimensionId(calculationEntityJson.getStructureByKey(oFF.OcOrcaConstants.STORY_CALCULATION_SELECTED_DIMENSION_ID));
		calculation.setToText(calculationEntityJson.getBooleanByKeyExt(oFF.OcOrcaConstants.STORY_CALCULATION_TO_TEXT, false));
	}
	return calculation;
};
oFF.OcOrcaCalculations.prototype.getStoryEntityHelper = function()
{
	return this.getContext().getStoryEntityHelper();
};
oFF.OcOrcaCalculations.prototype.getContext = function()
{
	return this.m_context;
};
oFF.OcOrcaCalculations.prototype.toString = function()
{
	var calculations = this.getCalculations().getValuesAsReadOnlyList();
	var sb = oFF.XStringBuffer.create();
	sb.append("Calculations:");
	for (var i = 0; i < calculations.size(); i++)
	{
		var calculation = calculations.get(i);
		sb.appendNewLine().appendInt(i + 1).append(". Calculation: ").append(calculation.getId()).append(" of type ").append(calculation.getCalculationType());
	}
	return sb.toString();
};
oFF.OcOrcaCalculations.prototype.releaseObject = function()
{
	this.m_context = null;
	this.m_calculations = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_calculations);
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.OcOrcaFieldSelections = function() {};
oFF.OcOrcaFieldSelections.prototype = new oFF.XObject();
oFF.OcOrcaFieldSelections.prototype._ff_c = "OcOrcaFieldSelections";

oFF.OcOrcaFieldSelections.create = function(context)
{
	var selections = new oFF.OcOrcaFieldSelections();
	selections.setupFieldSelections(context);
	return selections;
};
oFF.OcOrcaFieldSelections.prototype.m_context = null;
oFF.OcOrcaFieldSelections.prototype.m_fieldSelections = null;
oFF.OcOrcaFieldSelections.prototype.setupFieldSelections = function(context)
{
	oFF.XObject.prototype.setup.call( this );
	this.m_context = context;
};
oFF.OcOrcaFieldSelections.prototype.getFieldSelectionByFieldSelectionId = function(fieldSelectionId)
{
	return this.getFieldSelections().getByKey(fieldSelectionId);
};
oFF.OcOrcaFieldSelections.prototype.getFieldSelections = function()
{
	if (oFF.notNull(this.m_fieldSelections))
	{
		return this.m_fieldSelections;
	}
	this.m_fieldSelections = oFF.XHashMapByString.create();
	var selectionsJson = this.getStoryEntityHelper().getEntitiesAsJsonByEntityType(oFF.OcOrcaConstants.STORY_ENTITY_FIELD_SELECTION);
	for (var i = 0; i < selectionsJson.size(); i++)
	{
		var selectionJson = selectionsJson.get(i);
		this.addOrcaFieldSelectionsToFieldSelections(selectionJson, this.m_fieldSelections);
	}
	return this.m_fieldSelections;
};
oFF.OcOrcaFieldSelections.prototype.addOrcaFieldSelectionsToFieldSelections = function(selectionJson, selections)
{
	var selectionEntitiesJson = selectionJson.getListByKey(oFF.OcOrcaConstants.STORY_FIELD_SELECTION_ENTITIES);
	if (oFF.PrUtils.isListEmpty(selectionEntitiesJson))
	{
		return;
	}
	for (var i = 0; i < selectionEntitiesJson.size(); i++)
	{
		var selectionEntityJson = selectionEntitiesJson.getStructureAt(i);
		var fieldSel = this.createFieldSelectionFromOrcaFieldSelectionEntity(selectionEntityJson);
		if (oFF.notNull(fieldSel))
		{
			selections.put(fieldSel.getId(), fieldSel);
		}
	}
};
oFF.OcOrcaFieldSelections.prototype.createFieldSelectionFromOrcaFieldSelectionEntity = function(selectionEntityJson)
{
	var fieldSelectionEntityMetadataJson = selectionEntityJson.getStructureByKey(oFF.OcOrcaConstants.ID_ELEMENT);
	if (oFF.isNull(fieldSelectionEntityMetadataJson))
	{
		return null;
	}
	var fieldSelectionEntityId = fieldSelectionEntityMetadataJson.getStringByKey(oFF.OcOrcaConstants.ID_ELEMENT);
	var fieldSelectionEntityName = selectionEntityJson.getStringByKey(oFF.OcOrcaConstants.STORY_FIELD_SELECTION_NAME);
	var fieldSelectionEntityType = fieldSelectionEntityMetadataJson.getStringByKey(oFF.OcOrcaConstants.STORY_FIELD_SELECTION_TYPE);
	var fieldSelection = oFF.OcFieldSelection.create(fieldSelectionEntityId, fieldSelectionEntityName, fieldSelectionEntityType);
	if (oFF.XString.isEqual(fieldSelectionEntityType, oFF.OcOrcaConstants.STORY_FIELD_SELECTION_DIMENSION) || oFF.XString.isEqual(fieldSelectionEntityType, oFF.OcOrcaConstants.STORY_FIELD_SELECTION_MEASURE))
	{
		fieldSelection.setSelectionInfos(selectionEntityJson.getStructureByKey(oFF.OcOrcaConstants.STORY_FIELD_SELECTION_INFO));
		fieldSelection.setEntityIds(selectionEntityJson.getByKey(oFF.OcOrcaConstants.STORY_FIELD_SELECTION_ENTITY_IDS));
	}
	return fieldSelection;
};
oFF.OcOrcaFieldSelections.prototype.getStoryEntityHelper = function()
{
	return this.getContext().getStoryEntityHelper();
};
oFF.OcOrcaFieldSelections.prototype.getContext = function()
{
	return this.m_context;
};
oFF.OcOrcaFieldSelections.prototype.toString = function()
{
	var selections = this.getFieldSelections().getValuesAsReadOnlyList();
	var sb = oFF.XStringBuffer.create();
	sb.append("selections:");
	for (var i = 0; i < selections.size(); i++)
	{
		var fieldSelection = selections.get(i);
		sb.appendNewLine().appendInt(i + 1).append(". FieldSelection: ").append(fieldSelection.getId()).append(" of type ").append(fieldSelection.getFieldSelectionType());
	}
	return sb.toString();
};
oFF.OcOrcaFieldSelections.prototype.releaseObject = function()
{
	this.m_context = null;
	this.m_fieldSelections = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_fieldSelections);
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.OcOrcaMeasureSyncs = function() {};
oFF.OcOrcaMeasureSyncs.prototype = new oFF.XObject();
oFF.OcOrcaMeasureSyncs.prototype._ff_c = "OcOrcaMeasureSyncs";

oFF.OcOrcaMeasureSyncs.create = function(context)
{
	var measureSyncs = new oFF.OcOrcaMeasureSyncs();
	measureSyncs.setupMeasureSyncs(context);
	return measureSyncs;
};
oFF.OcOrcaMeasureSyncs.prototype.m_context = null;
oFF.OcOrcaMeasureSyncs.prototype.m_measureSyncs = null;
oFF.OcOrcaMeasureSyncs.prototype.setupMeasureSyncs = function(context)
{
	oFF.XObject.prototype.setup.call( this );
	this.m_context = context;
};
oFF.OcOrcaMeasureSyncs.prototype.getMeasureSyncByMeasureName = function(measureName)
{
	return this.getMeasureSyncs().getByKey(measureName);
};
oFF.OcOrcaMeasureSyncs.prototype.getMeasureSyncs = function()
{
	if (oFF.notNull(this.m_measureSyncs))
	{
		return this.m_measureSyncs;
	}
	this.m_measureSyncs = oFF.XHashMapByString.create();
	var orcaStoryEntity = this.getStoryEntityHelper().getStoryEntityAsJson();
	var orcaMeasureSyncs = orcaStoryEntity.getListByKey(oFF.OcOrcaConstants.STORY_MEASURE_SYNC);
	if (oFF.PrUtils.isListEmpty(orcaMeasureSyncs))
	{
		return this.m_measureSyncs;
	}
	for (var i = 0; i < orcaMeasureSyncs.size(); i++)
	{
		var orcaMeasureSync = orcaMeasureSyncs.getStructureAt(i);
		var measureName = oFF.OcJsonPathEvaluator.getSingleJsonPathElementAsString(orcaMeasureSync, oFF.OcOrcaConstants.PATH_FROM_MEASURE_SYNC_TO_MEASURE_NAME);
		if (oFF.XStringUtils.isNotNullAndNotEmpty(measureName))
		{
			var measureSync = oFF.OcMeasureSync.create(measureName);
			measureSync.setColor(orcaMeasureSync.getStringByKey(oFF.OcOrcaConstants.STORY_MEASURE_SYNC_COLOR));
			measureSync.setPattern(orcaMeasureSync.getStringByKey(oFF.OcOrcaConstants.STORY_MEASURE_SYNC_PATTERN));
			this.m_measureSyncs.put(measureName, measureSync);
		}
	}
	return this.m_measureSyncs;
};
oFF.OcOrcaMeasureSyncs.prototype.getStoryEntityHelper = function()
{
	return this.getContext().getStoryEntityHelper();
};
oFF.OcOrcaMeasureSyncs.prototype.getContext = function()
{
	return this.m_context;
};
oFF.OcOrcaMeasureSyncs.prototype.toString = function()
{
	var measureSyncs = this.getMeasureSyncs().getValuesAsReadOnlyList();
	var sb = oFF.XStringBuffer.create();
	sb.append("Measure Syncs:");
	for (var i = 0; i < measureSyncs.size(); i++)
	{
		var measureSync = measureSyncs.get(i);
		sb.appendNewLine().appendInt(i + 1).append(". Measure sync for \"").append(measureSync.getName());
		sb.append("\", color ").append(measureSync.getColor()).append(", pattern ").append(measureSync.getPattern());
	}
	return sb.toString();
};
oFF.OcOrcaMeasureSyncs.prototype.releaseObject = function()
{
	this.m_context = null;
	this.m_measureSyncs = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_measureSyncs);
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.OcOrcaPageLayout = function() {};
oFF.OcOrcaPageLayout.prototype = new oFF.XObject();
oFF.OcOrcaPageLayout.prototype._ff_c = "OcOrcaPageLayout";

oFF.OcOrcaPageLayout.create = function(pageLayoutJson)
{
	var page = new oFF.OcOrcaPageLayout();
	page.setupOrcaPageLayout(pageLayoutJson);
	return page;
};
oFF.OcOrcaPageLayout.prototype.m_layoutType = null;
oFF.OcOrcaPageLayout.prototype.m_widgetLayoutJsonByWidgetIdMap = null;
oFF.OcOrcaPageLayout.prototype.m_widgetSectionLayoutJsonByWidgetIdMap = null;
oFF.OcOrcaPageLayout.prototype.m_widgetLaneLayoutJsonByWidgetIdMap = null;
oFF.OcOrcaPageLayout.prototype.m_pageLayoutJson = null;
oFF.OcOrcaPageLayout.prototype.setupOrcaPageLayout = function(pageLayoutJson)
{
	oFF.XObject.prototype.setup.call( this );
	this.m_pageLayoutJson = pageLayoutJson;
};
oFF.OcOrcaPageLayout.prototype.getPageLayoutJson = function()
{
	return this.m_pageLayoutJson;
};
oFF.OcOrcaPageLayout.prototype.getLayoutType = function()
{
	if (oFF.isNull(this.m_layoutType))
	{
		this.m_layoutType = oFF.OcJsonPathEvaluator.getSingleJsonPathElementAsString(this.getPageLayoutJson(), oFF.OcOrcaConstants.PATH_FROM_PAGE_LAYOUT_TO_LAYOUT_TYPE);
	}
	return this.m_layoutType;
};
oFF.OcOrcaPageLayout.prototype.processIsResponsive = function()
{
	return oFF.XString.isEqual(this.getLayoutType(), oFF.OcOrcaConstants.PAGE_IS_RESPONSIVE);
};
oFF.OcOrcaPageLayout.prototype.hasCanvasLayout = function()
{
	return oFF.XString.isEqual(this.getLayoutType(), oFF.OcOrcaConstants.PAGE_LAYOUT_CANVAS);
};
oFF.OcOrcaPageLayout.prototype.processBackgroundColor = function()
{
	return oFF.OcJsonPathEvaluator.getSingleJsonPathElementAsString(this.getPageLayoutJson(), oFF.OcOrcaConstants.PATH_FROM_PAGE_LAYOUT_TO_BACKGROUND_COLOR);
};
oFF.OcOrcaPageLayout.prototype.getSectionLayoutJsonByWidgetId = function(widgetId)
{
	return this.getWigdetSectionLayoutJsonByWidgetIdMap().getByKey(widgetId);
};
oFF.OcOrcaPageLayout.prototype.getLaneLayoutJsonByWidgetId = function(widgetId)
{
	return this.getLaneLayoutJsonByWidgetIdMap().getByKey(widgetId);
};
oFF.OcOrcaPageLayout.prototype.getWidgetLayoutJsonByWidgetId = function(widgetId)
{
	return this.getWigdetIdToWidgetLayoutJsonMap().getByKey(widgetId);
};
oFF.OcOrcaPageLayout.prototype.getWigdetSectionLayoutJsonByWidgetIdMap = function()
{
	if (oFF.notNull(this.m_widgetSectionLayoutJsonByWidgetIdMap))
	{
		return this.m_widgetSectionLayoutJsonByWidgetIdMap;
	}
	this.m_widgetSectionLayoutJsonByWidgetIdMap = oFF.XHashMapByString.create();
	var sectionsJson = oFF.OcJsonPathEvaluator.getJsonPathElementsAsStructures(this.getPageLayoutJson(), oFF.OcOrcaConstants.PATH_FROM_PAGE_LAYOUT_TO_SECTIONS);
	if (!oFF.XCollectionUtils.hasElements(sectionsJson))
	{
		return this.m_widgetSectionLayoutJsonByWidgetIdMap;
	}
	for (var i = 0; i < sectionsJson.size(); i++)
	{
		var sectionJson = sectionsJson.get(i);
		var sectionDefinitionJson = sectionJson.getStructureByKey(oFF.OcOrcaConstants.WIDGET_SECTION_DEFINITION);
		if (oFF.notNull(sectionDefinitionJson))
		{
			var widgetIds = oFF.OcJsonPathEvaluator.getJsonPathElementsAsStrings(sectionJson, oFF.OcOrcaConstants.PATH_FROM_SECTION_TO_WIDGET_ID);
			for (var j = 0; j < widgetIds.size(); j++)
			{
				this.m_widgetSectionLayoutJsonByWidgetIdMap.put(widgetIds.get(j), sectionDefinitionJson);
			}
		}
	}
	return this.m_widgetSectionLayoutJsonByWidgetIdMap;
};
oFF.OcOrcaPageLayout.prototype.getLaneLayoutJsonByWidgetIdMap = function()
{
	if (oFF.notNull(this.m_widgetLaneLayoutJsonByWidgetIdMap))
	{
		return this.m_widgetLaneLayoutJsonByWidgetIdMap;
	}
	this.m_widgetLaneLayoutJsonByWidgetIdMap = oFF.XHashMapByString.create();
	var widgetLayoutsJson = oFF.OcJsonPathEvaluator.getJsonPathElementsAsStructures(this.getPageLayoutJson(), oFF.OcOrcaConstants.PATH_FROM_PAGE_LAYOUT_TO_LANE_WIDGETS);
	if (!oFF.XCollectionUtils.hasElements(widgetLayoutsJson))
	{
		return this.m_widgetSectionLayoutJsonByWidgetIdMap;
	}
	for (var i = 0; i < widgetLayoutsJson.size(); i++)
	{
		var widgetLayoutJson = widgetLayoutsJson.get(i);
		var widgetId = widgetLayoutJson.getStringByKey(oFF.OcOrcaConstants.WIDGET_ID);
		if (oFF.XStringUtils.isNullOrEmpty(widgetId))
		{
			continue;
		}
		var layoutJson = oFF.OcJsonPathEvaluator.getSingleJsonPathElementAsStructure(widgetLayoutJson, oFF.OcOrcaConstants.PATH_FROM_WIDGET_TO_LAYOUT_DEFINITION);
		this.m_widgetLaneLayoutJsonByWidgetIdMap.put(widgetId, layoutJson);
	}
	return this.m_widgetLaneLayoutJsonByWidgetIdMap;
};
oFF.OcOrcaPageLayout.prototype.getWigdetIdToWidgetLayoutJsonMap = function()
{
	if (oFF.notNull(this.m_widgetLayoutJsonByWidgetIdMap))
	{
		return this.m_widgetLayoutJsonByWidgetIdMap;
	}
	this.m_widgetLayoutJsonByWidgetIdMap = oFF.XHashMapByString.create();
	var widgetLayoutsJson = oFF.OcJsonPathEvaluator.getJsonPathElementsAsStructures(this.getPageLayoutJson(), oFF.OcOrcaConstants.PATH_FROM_PAGE_LAYOUT_TO_WIDGETS);
	if (!oFF.XCollectionUtils.hasElements(widgetLayoutsJson))
	{
		return this.m_widgetLayoutJsonByWidgetIdMap;
	}
	for (var i = 0; i < widgetLayoutsJson.size(); i++)
	{
		var widgetLayoutJson = widgetLayoutsJson.get(i);
		var widgetId = widgetLayoutJson.getStringByKey(oFF.OcOrcaConstants.WIDGET_ID);
		if (oFF.XStringUtils.isNotNullAndNotEmpty(widgetId))
		{
			var widgetLayoutDefinitionJson = widgetLayoutJson.getStructureByKey(oFF.OcOrcaConstants.WIDGET_SECTION_DEFINITION);
			if (oFF.notNull(widgetLayoutDefinitionJson))
			{
				this.m_widgetLayoutJsonByWidgetIdMap.put(widgetId, widgetLayoutDefinitionJson);
			}
		}
	}
	return this.m_widgetLayoutJsonByWidgetIdMap;
};
oFF.OcOrcaPageLayout.prototype.releaseObject = function()
{
	this.m_layoutType = null;
	this.m_pageLayoutJson = null;
	this.m_widgetLayoutJsonByWidgetIdMap = oFF.XObjectExt.release(this.m_widgetLayoutJsonByWidgetIdMap);
	this.m_widgetSectionLayoutJsonByWidgetIdMap = oFF.XObjectExt.release(this.m_widgetSectionLayoutJsonByWidgetIdMap);
	this.m_widgetLaneLayoutJsonByWidgetIdMap = oFF.XObjectExt.release(this.m_widgetLaneLayoutJsonByWidgetIdMap);
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.OcOrcaThresholds = function() {};
oFF.OcOrcaThresholds.prototype = new oFF.XObject();
oFF.OcOrcaThresholds.prototype._ff_c = "OcOrcaThresholds";

oFF.OcOrcaThresholds.create = function(context)
{
	var thresholds = new oFF.OcOrcaThresholds();
	thresholds.setupThresholds(context);
	return thresholds;
};
oFF.OcOrcaThresholds.prototype.m_context = null;
oFF.OcOrcaThresholds.prototype.m_thresholds = null;
oFF.OcOrcaThresholds.prototype.setupThresholds = function(context)
{
	oFF.XObject.prototype.setup.call( this );
	this.m_context = context;
};
oFF.OcOrcaThresholds.prototype.getThresholdByDatasource = function(datasource)
{
	return this.getThresholds().getByKey(datasource);
};
oFF.OcOrcaThresholds.prototype.getThresholds = function()
{
	if (oFF.notNull(this.m_thresholds))
	{
		return this.m_thresholds;
	}
	this.m_thresholds = oFF.XHashMapByString.create();
	var storyEntityJson = this.getStoryEntityHelper().getStoryEntityAsJson();
	var thresholdsJson = oFF.OcJsonPathEvaluator.getSingleJsonPathElementAsStructure(storyEntityJson, oFF.OcOrcaConstants.PATH_FROM_STORY_TO_THRESHOLDS);
	if (oFF.isNull(thresholdsJson))
	{
		return this.m_thresholds;
	}
	var datasources = thresholdsJson.getKeysAsReadOnlyListOfString();
	for (var i = 0; i < datasources.size(); i++)
	{
		var datasource = datasources.get(i);
		this.addOrcaThresholdsToThresholdMap(datasource, thresholdsJson, this.m_thresholds);
	}
	return this.m_thresholds;
};
oFF.OcOrcaThresholds.prototype.addOrcaThresholdsToThresholdMap = function(datasource, thresholdsJson, thresholds)
{
	var tresholdJson = thresholdsJson.getStructureByKey(datasource);
	var dimensionNames = tresholdJson.getKeysAsReadOnlyListOfString();
	for (var i = 0; i < dimensionNames.size(); i++)
	{
		var dimensionName = dimensionNames.get(i);
		var dimensionJson = tresholdJson.getStructureByKey(dimensionName);
		this.addOrcaDimensionToThresholdMap(datasource, dimensionJson, thresholds);
	}
};
oFF.OcOrcaThresholds.prototype.addOrcaDimensionToThresholdMap = function(datasource, dimensionJson, thresholds)
{
	var memberNames = dimensionJson.getKeysAsReadOnlyListOfString();
	for (var i = 0; i < memberNames.size(); i++)
	{
		var memberName = memberNames.get(i);
		var memberJson = dimensionJson.getStructureByKey(memberName);
		var threshold = oFF.OcThreshold.create(datasource, memberJson);
		thresholds.put(datasource, threshold);
	}
};
oFF.OcOrcaThresholds.prototype.getStoryEntityHelper = function()
{
	return this.getContext().getStoryEntityHelper();
};
oFF.OcOrcaThresholds.prototype.getContext = function()
{
	return this.m_context;
};
oFF.OcOrcaThresholds.prototype.toString = function()
{
	var thresholds = this.getThresholds().getValuesAsReadOnlyList();
	var sb = oFF.XStringBuffer.create();
	sb.append("Thresholds:");
	for (var i = 0; i < thresholds.size(); i++)
	{
		var threshold = thresholds.get(i);
		sb.appendNewLine().appendInt(i + 1).append(". Threshold: ").append(threshold.getName());
	}
	return sb.toString();
};
oFF.OcOrcaThresholds.prototype.releaseObject = function()
{
	this.m_context = null;
	this.m_thresholds = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_thresholds);
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.OcOrcaPageWidgetHelper = function() {};
oFF.OcOrcaPageWidgetHelper.prototype = new oFF.XObject();
oFF.OcOrcaPageWidgetHelper.prototype._ff_c = "OcOrcaPageWidgetHelper";

oFF.OcOrcaPageWidgetHelper.create = function(context)
{
	var helper = new oFF.OcOrcaPageWidgetHelper();
	helper.setupStoryHelper(context);
	return helper;
};
oFF.OcOrcaPageWidgetHelper.prototype.m_pageIds = null;
oFF.OcOrcaPageWidgetHelper.prototype.m_widgetIds = null;
oFF.OcOrcaPageWidgetHelper.prototype.m_pageJsonByPageIdMap = null;
oFF.OcOrcaPageWidgetHelper.prototype.m_widgetJsonByWidgetIdMap = null;
oFF.OcOrcaPageWidgetHelper.prototype.m_widgetsIdsByPageIdMap = null;
oFF.OcOrcaPageWidgetHelper.prototype.setupStoryHelper = function(context)
{
	oFF.XObject.prototype.setup.call( this );
	this.m_pageJsonByPageIdMap = oFF.XLinkedHashMapByString.create();
	this.m_widgetJsonByWidgetIdMap = oFF.XHashMapByString.create();
	this.m_widgetsIdsByPageIdMap = oFF.XHashMapByString.create();
	var pagesJson = context.getStoryEntityHelper().getStoryEntityAsJson().getListByKey(oFF.OcOrcaConstants.STORY_PAGES);
	for (var i = 0; i < pagesJson.size(); i++)
	{
		var pageJson = pagesJson.getStructureAt(i);
		if (pageJson.getBooleanByKeyExt(oFF.OcOrcaConstants.PAGE_IS_HIDDEN, false))
		{
			continue;
		}
		var pageId = pageJson.getStringByKey(oFF.OcOrcaConstants.ID_ELEMENT);
		if (oFF.XStringUtils.isNullOrEmpty(pageId))
		{
			continue;
		}
		this.m_pageJsonByPageIdMap.put(pageId, pageJson);
		var widgetJsonByWidgetIdMap = this.getSortedWidgetJsonsFromPageJson(pageJson);
		var widgetIds = widgetJsonByWidgetIdMap.getKeysAsReadOnlyListOfString();
		this.m_widgetsIdsByPageIdMap.put(pageId, widgetIds);
		for (var j = 0; j < widgetIds.size(); j++)
		{
			var widgetId = widgetIds.get(j);
			this.m_widgetJsonByWidgetIdMap.put(widgetId, widgetJsonByWidgetIdMap.getByKey(widgetId));
		}
	}
};
oFF.OcOrcaPageWidgetHelper.prototype.getPageIds = function()
{
	if (oFF.isNull(this.m_pageIds))
	{
		this.m_pageIds = this.getPageJsonByPageIdMap().getKeysAsReadOnlyListOfString();
	}
	return this.m_pageIds;
};
oFF.OcOrcaPageWidgetHelper.prototype.getPageJsonByPageId = function(pageId)
{
	return this.getPageJsonByPageIdMap().getByKey(pageId);
};
oFF.OcOrcaPageWidgetHelper.prototype.getWidgetIdsByPageId = function(pageId)
{
	return this.getWidgetIdsByPageIdMap().getByKey(pageId);
};
oFF.OcOrcaPageWidgetHelper.prototype.getWidgetJsonByWidgetId = function(widgetId)
{
	return this.getWidgetJsonByWidgetIdMap().getByKey(widgetId);
};
oFF.OcOrcaPageWidgetHelper.prototype.getPageJsonByPageIdMap = function()
{
	return this.m_pageJsonByPageIdMap;
};
oFF.OcOrcaPageWidgetHelper.prototype.getWidgetJsonByWidgetIdMap = function()
{
	return this.m_widgetJsonByWidgetIdMap;
};
oFF.OcOrcaPageWidgetHelper.prototype.getWidgetIdsByPageIdMap = function()
{
	return this.m_widgetsIdsByPageIdMap;
};
oFF.OcOrcaPageWidgetHelper.prototype.getSortedWidgetJsonsFromPageJson = function(pageJson)
{
	var widgetJsonByWidgetIdMap = this.getWidgetJsonsFromPageJson(pageJson);
	var sortedWidgetIds = this.getSortedWidgetIds(pageJson);
	var sortedWidgetJsonByWidgetIdMap = oFF.XLinkedHashMapByString.create();
	for (var j = 0; j < sortedWidgetIds.size(); j++)
	{
		var sortedWidgetId = sortedWidgetIds.get(j);
		var sortedWidgetJson = widgetJsonByWidgetIdMap.getByKey(sortedWidgetId);
		if (oFF.notNull(sortedWidgetJson))
		{
			widgetJsonByWidgetIdMap.remove(sortedWidgetId);
			sortedWidgetJsonByWidgetIdMap.put(sortedWidgetId, sortedWidgetJson);
		}
	}
	var it = widgetJsonByWidgetIdMap.getKeysAsIteratorOfString();
	while (it.hasNext())
	{
		var remainingWidgetId = it.next();
		var widget = widgetJsonByWidgetIdMap.getByKey(remainingWidgetId);
		sortedWidgetJsonByWidgetIdMap.put(remainingWidgetId, widget);
	}
	return sortedWidgetJsonByWidgetIdMap;
};
oFF.OcOrcaPageWidgetHelper.prototype.getWidgetJsonsFromPageJson = function(pageJson)
{
	var widgetJsonByWidgetIdMap = oFF.XLinkedHashMapByString.create();
	var widgetsJson = oFF.OcJsonPathEvaluator.getJsonPathElementsAsStructures(pageJson, oFF.OcOrcaConstants.PATH_FROM_PAGE_TO_WIDGET);
	for (var i = 0; i < widgetsJson.size(); i++)
	{
		var widgetJson = widgetsJson.get(i);
		var widgetId = widgetJson.getStringByKey(oFF.OcOrcaConstants.ID_ELEMENT);
		if (oFF.XStringUtils.isNotNullAndNotEmpty(widgetId))
		{
			widgetJsonByWidgetIdMap.put(widgetId, widgetJson);
		}
	}
	return widgetJsonByWidgetIdMap;
};
oFF.OcOrcaPageWidgetHelper.prototype.getSortedWidgetIds = function(pageJson)
{
	if (this.isPageResponsive(pageJson))
	{
		return oFF.OcJsonPathEvaluator.getJsonPathElementsAsStrings(pageJson, oFF.OcOrcaConstants.PATH_FROM_PAGE_TO_LANES_WIDGET_ID);
	}
	return oFF.OcJsonPathEvaluator.getJsonPathElementsAsStrings(pageJson, oFF.OcOrcaConstants.PATH_FROM_PAGE_TO_SECTION_WIDGET_ID);
};
oFF.OcOrcaPageWidgetHelper.prototype.isPageResponsive = function(pageJson)
{
	var layoutTypes = oFF.OcJsonPathEvaluator.getJsonPathElementsAsStrings(pageJson, oFF.OcOrcaConstants.PATH_FROM_PAGE_TO_LAYOUT_TYPE);
	return oFF.XCollectionUtils.hasElements(layoutTypes) && oFF.XString.isEqual(layoutTypes.get(0), oFF.OcOrcaConstants.PAGE_IS_RESPONSIVE);
};
oFF.OcOrcaPageWidgetHelper.prototype.releaseObject = function()
{
	this.m_pageIds = oFF.XObjectExt.release(this.m_pageIds);
	this.m_widgetIds = oFF.XObjectExt.release(this.m_widgetIds);
	this.m_pageJsonByPageIdMap = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_pageJsonByPageIdMap);
	this.m_widgetJsonByWidgetIdMap = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_widgetJsonByWidgetIdMap);
	this.m_widgetsIdsByPageIdMap = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_widgetsIdsByPageIdMap);
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.OcOrcaStoryEntityHelper = function() {};
oFF.OcOrcaStoryEntityHelper.prototype = new oFF.XObject();
oFF.OcOrcaStoryEntityHelper.prototype._ff_c = "OcOrcaStoryEntityHelper";

oFF.OcOrcaStoryEntityHelper.create = function(storyJson, context)
{
	var helper = new oFF.OcOrcaStoryEntityHelper();
	helper.setupStoryEntityHelper(storyJson, context);
	return helper;
};
oFF.OcOrcaStoryEntityHelper.prototype.m_storyAsJson = null;
oFF.OcOrcaStoryEntityHelper.prototype.m_storyEntityAsJson = null;
oFF.OcOrcaStoryEntityHelper.prototype.m_entitiesAsJsonByEntityTypeMap = null;
oFF.OcOrcaStoryEntityHelper.prototype.m_gridDefinitionByGridIdMap = null;
oFF.OcOrcaStoryEntityHelper.prototype.m_context = null;
oFF.OcOrcaStoryEntityHelper.prototype.setupStoryEntityHelper = function(storyAsJson, context)
{
	oFF.XObject.prototype.setup.call( this );
	this.m_context = context;
	this.m_storyAsJson = storyAsJson;
};
oFF.OcOrcaStoryEntityHelper.prototype.getStoryAsJson = function()
{
	return this.m_storyAsJson;
};
oFF.OcOrcaStoryEntityHelper.prototype.getStoryEntityAsJson = function()
{
	if (oFF.notNull(this.m_storyEntityAsJson))
	{
		return this.m_storyEntityAsJson;
	}
	var entitiesAsJson = this.getEntitiesAsJsonByEntityType(oFF.OcOrcaConstants.STORY_ENTITY);
	if (oFF.notNull(entitiesAsJson) && entitiesAsJson.size() === 1)
	{
		this.m_storyEntityAsJson = entitiesAsJson.get(0).getStructureByKey(oFF.OcOrcaConstants.STORY_ENTITY_DATA);
	}
	if (oFF.isNull(this.m_storyEntityAsJson))
	{
		var message = oFF.OcMessage.newInvalidStoryError();
		this.getContext().getMessageManager().addMessage(message);
		throw oFF.XException.createIllegalArgumentException(message.getText());
	}
	return this.m_storyEntityAsJson;
};
oFF.OcOrcaStoryEntityHelper.prototype.getContext = function()
{
	return this.m_context;
};
oFF.OcOrcaStoryEntityHelper.prototype.getEntitiesAsJsonByEntityType = function(entityType)
{
	var entitiesAsJson = this.getEntitiesAsJsonByEntityTypeMap().getByKey(entityType);
	if (oFF.isNull(entitiesAsJson))
	{
		entitiesAsJson = oFF.XList.create();
		this.m_entitiesAsJsonByEntityTypeMap.put(entityType, entitiesAsJson);
	}
	return entitiesAsJson;
};
oFF.OcOrcaStoryEntityHelper.prototype.getEntitiesAsJsonByEntityTypeMap = function()
{
	if (oFF.notNull(this.m_entitiesAsJsonByEntityTypeMap))
	{
		return this.m_entitiesAsJsonByEntityTypeMap;
	}
	this.m_entitiesAsJsonByEntityTypeMap = oFF.XHashMapByString.create();
	var allEntitiesAsJson = oFF.OcJsonPathEvaluator.getJsonPathElementsAsStructures(this.getStoryAsJson(), oFF.OcOrcaConstants.PATH_FROM_STORY_TO_STORY_ENTITIES);
	for (var i = 0; i < allEntitiesAsJson.size(); i++)
	{
		var entityAsJson = allEntitiesAsJson.get(i);
		var entityType = entityAsJson.getStringByKey(oFF.OcOrcaConstants.STORY_ENTITY_TYPE);
		if (oFF.XStringUtils.isNullOrEmpty(entityType))
		{
			continue;
		}
		var entitiesAsJson = this.m_entitiesAsJsonByEntityTypeMap.getByKey(entityType);
		if (oFF.isNull(entitiesAsJson))
		{
			entitiesAsJson = oFF.XList.create();
			this.m_entitiesAsJsonByEntityTypeMap.put(entityType, entitiesAsJson);
		}
		entitiesAsJson.add(entityAsJson);
	}
	return this.m_entitiesAsJsonByEntityTypeMap;
};
oFF.OcOrcaStoryEntityHelper.prototype.getGridDefinitions = function()
{
	return this.getGridDefinitionByGridIdMap().getValuesAsReadOnlyList();
};
oFF.OcOrcaStoryEntityHelper.prototype.getGridDefinitionByGridId = function(gridId)
{
	return this.getGridDefinitionByGridIdMap().getByKey(gridId);
};
oFF.OcOrcaStoryEntityHelper.prototype.getGridDefinitionByGridIdMap = function()
{
	if (oFF.notNull(this.m_gridDefinitionByGridIdMap))
	{
		return this.m_gridDefinitionByGridIdMap;
	}
	this.m_gridDefinitionByGridIdMap = oFF.XHashMapByString.create();
	var gridDefinitionJsons = this.getEntitiesAsJsonByEntityType(oFF.OcOrcaConstants.STORY_ENTITY_GRID);
	for (var i = 0; i < gridDefinitionJsons.size(); i++)
	{
		var gridDefinitionJson = gridDefinitionJsons.get(i);
		var gridId = gridDefinitionJson.getStringByKey(oFF.OcOrcaConstants.ID_ELEMENT);
		if (oFF.notNull(gridId))
		{
			var gridDefinitions = oFF.OcJsonPathEvaluator.getJsonPathElementsAsStructures(gridDefinitionJson, oFF.OcOrcaConstants.PATH_FROM_GRID_ENTITIY_TO_DATA_DEFINITION);
			if (oFF.XCollectionUtils.hasElements(gridDefinitions))
			{
				this.m_gridDefinitionByGridIdMap.put(gridId, oFF.OcOrcaGridDefinition.create(gridId, gridDefinitions.get(0)));
			}
		}
	}
	return this.m_gridDefinitionByGridIdMap;
};
oFF.OcOrcaStoryEntityHelper.prototype.releaseObject = function()
{
	this.m_context = null;
	this.m_storyAsJson = oFF.XObjectExt.release(this.m_storyAsJson);
	this.m_storyEntityAsJson = oFF.XObjectExt.release(this.m_storyEntityAsJson);
	this.m_entitiesAsJsonByEntityTypeMap = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_entitiesAsJsonByEntityTypeMap);
	this.m_gridDefinitionByGridIdMap = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_gridDefinitionByGridIdMap);
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.OcQuasarDataProviderConverter = function() {};
oFF.OcQuasarDataProviderConverter.prototype = new oFF.XObject();
oFF.OcQuasarDataProviderConverter.prototype._ff_c = "OcQuasarDataProviderConverter";

oFF.OcQuasarDataProviderConverter.convert = function(widget, options, pageId)
{
	var document = oFF.PrFactory.createStructure();
	var dataProviderName = oFF.XStringUtils.concatenate3(widget.getStory().getNormalizedName(), "_", widget.getNormalizedDataReferenceId());
	document.putStringNotNullAndNotEmpty(oFF.OcQuasarConstants.QUASAR_DATA_PROVIDER_NAME, dataProviderName);
	oFF.OcQuasarDataProviderConverter.addDatasetsToDocument(widget, document);
	var widgetType = widget.getWidgetType();
	if (widgetType === oFF.OcWidgetType.CHART || widgetType === oFF.OcWidgetType.KPI || widgetType === oFF.OcWidgetType.ANALYTICAL_CARD)
	{
		var chartWidget = widget;
		document.put(oFF.OcQuasarConstants.QUASAR_GLOBAL_DEF, oFF.OcQuasarDataProviderConverter.getGlobalDefinition(chartWidget));
		var vizDef = chartWidget.getVizDef();
		if (oFF.notNull(pageId))
		{
			vizDef.putString(oFF.OcQuasarConstants.STORY_PAGE_ID, pageId);
		}
		document.put(oFF.OcQuasarConstants.QUASAR_DATA_PROVIDER_VIZ_DEF, vizDef);
		oFF.OcQuasarDataProviderConverter.addThresholdDefinition(chartWidget);
	}
	else if (widgetType === oFF.OcWidgetType.GRID)
	{
		var fireflyQuery = widget.getFireflyQuery();
		document.putStringNotNullAndNotEmpty(oFF.OcQuasarConstants.QUASAR_DATA_PROVIDER_FF_QUERY, fireflyQuery);
	}
	return document;
};
oFF.OcQuasarDataProviderConverter.addDatasetsToDocument = function(widget, document)
{
	var dataset = oFF.OcQuasarDataProviderConverter.getDataset(widget);
	if (oFF.isNull(dataset))
	{
		return;
	}
	document.putStringNotNullAndNotEmpty(oFF.OcQuasarConstants.QUASAR_DATA_PROVIDER_CUBE_NAME, dataset.getCubeName());
	document.putStringNotNullAndNotEmpty(oFF.OcQuasarConstants.QUASAR_DATA_PROVIDER_DATA_SOURCE, dataset.getDatasource());
	document.putStringNotNullAndNotEmpty(oFF.OcQuasarConstants.QUASAR_DATA_PROVIDER_MODEL_ID, dataset.getModelId());
	document.putStringNotNullAndNotEmpty(oFF.OcQuasarConstants.QUASAR_DATA_PROVIDER_SYSTEM, oFF.OcQuasarDataProviderConverter.getSystemName(dataset));
	if (dataset.getVariables() !== null && !dataset.getVariables().isEmpty())
	{
		var myList = document.putNewList(oFF.OcQuasarConstants.QUASAR_VARIABLES);
		myList.addAll(dataset.getVariables());
	}
};
oFF.OcQuasarDataProviderConverter.getDataset = function(widget)
{
	var datasets = widget.getDatasets();
	if (oFF.XCollectionUtils.hasElements(datasets))
	{
		return datasets.get(0);
	}
	return null;
};
oFF.OcQuasarDataProviderConverter.getSystemName = function(dataset)
{
	var systemName = dataset.getSystemName();
	if (oFF.XStringUtils.isNullOrEmpty(systemName))
	{
		return oFF.OcOrcaServiceConfig.ORCA_MASTER_SYSTEM_NAME;
	}
	return systemName;
};
oFF.OcQuasarDataProviderConverter.getGlobalDefinition = function(widget)
{
	var globalDefinition = oFF.PrFactory.createStructure();
	var dataset = oFF.OcQuasarDataProviderConverter.getDataset(widget);
	if (oFF.isNull(dataset))
	{
		return null;
	}
	var datasource = dataset.getDatasource();
	var colorsObject = widget.getStory().getColorSyncs();
	if (oFF.notNull(colorsObject))
	{
		var colorSync = colorsObject.getStructureByKey(datasource);
		globalDefinition.putNotNullAndNotEmpty(oFF.OcQuasarConstants.QUASAR_GLOBAL_DEF_COLOR_SYNC, colorSync);
	}
	return globalDefinition;
};
oFF.OcQuasarDataProviderConverter.addThresholdDefinition = function(widget)
{
	var vizDef = widget.getVizDef();
	var dataset = oFF.OcQuasarDataProviderConverter.getDataset(widget);
	if (oFF.isNull(dataset))
	{
		return;
	}
	var datasource = dataset.getDatasource();
	vizDef.putNotNullAndNotEmpty(oFF.OcQuasarConstants.QUASAR_VIZ_DEF_THRESHOLD, oFF.OcQuasarDataProviderConverter.getThresholdByDatasource(widget, datasource));
};
oFF.OcQuasarDataProviderConverter.getThresholdByDatasource = function(widget, datasource)
{
	var threshold = widget.getStory().getThresholds().getThresholdByDatasource(datasource);
	if (oFF.isNull(threshold))
	{
		return null;
	}
	var userThresholds = oFF.OcJsonPathEvaluator.getSingleJsonPathElementAsStructure(widget.getVizDef(), oFF.OcQuasarConstants.VIZ_DEF_PATH_TO_THRESHOLDS);
	if (oFF.notNull(userThresholds) && userThresholds.containsKey(datasource))
	{
		return threshold.getException();
	}
	return null;
};
oFF.OcQuasarDataProviderConverter.prototype.releaseObject = function()
{
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.OcQuasarOptions = function() {};
oFF.OcQuasarOptions.prototype = new oFF.XObject();
oFF.OcQuasarOptions.prototype._ff_c = "OcQuasarOptions";

oFF.OcQuasarOptions.create = function(context)
{
	var options = new oFF.OcQuasarOptions();
	options.setupOptions(context);
	return options;
};
oFF.OcQuasarOptions.prototype.m_mainLayoutType = null;
oFF.OcQuasarOptions.prototype.m_chartType = null;
oFF.OcQuasarOptions.prototype.m_useSingleWidgetLayout = false;
oFF.OcQuasarOptions.prototype.m_context = null;
oFF.OcQuasarOptions.prototype.setupOptions = function(context)
{
	oFF.XObject.prototype.setup.call( this );
	this.m_context = context;
	this.m_mainLayoutType = oFF.OcLayoutType.CANVAS;
	this.m_chartType = oFF.OcChartType.HIGHCHARTS;
};
oFF.OcQuasarOptions.prototype.getMainLayoutType = function()
{
	return this.m_mainLayoutType;
};
oFF.OcQuasarOptions.prototype.setMainLayoutType = function(mainLayoutType)
{
	this.m_mainLayoutType = mainLayoutType;
};
oFF.OcQuasarOptions.prototype.getChartType = function()
{
	return this.m_chartType;
};
oFF.OcQuasarOptions.prototype.setChartType = function(chartType)
{
	this.m_chartType = chartType;
};
oFF.OcQuasarOptions.prototype.useSingleWidgetLayout = function()
{
	return this.m_useSingleWidgetLayout;
};
oFF.OcQuasarOptions.prototype.setUseSingleWidgetLayout = function(useSingleWidgetLayout)
{
	this.m_useSingleWidgetLayout = useSingleWidgetLayout;
};
oFF.OcQuasarOptions.prototype.getContext = function()
{
	return this.m_context;
};
oFF.OcQuasarOptions.prototype.releaseObject = function()
{
	this.m_context = null;
	this.m_mainLayoutType = null;
	this.m_chartType = null;
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.OcQuasarPageContentConverter = {

	convert:function(page, options, document)
	{
			document.putStringNotNullAndNotEmpty(oFF.OcQuasarConstants.QUASAR_CONTENT_TYPE, oFF.OcQuasarPageContentConverter.getQuasarLayoutType(page, options));
		document.putStringNotNullAndNotEmpty(oFF.OcQuasarConstants.QUASAR_CONTENT_BACKGROUND_COLOR, page.getBackgroundColor());
		document.putStringNotNullAndNotEmpty(oFF.OcQuasarConstants.QUASAR_LAYOUT_WIDTH, "100%");
		document.putStringNotNullAndNotEmpty(oFF.OcQuasarConstants.QUASAR_LAYOUT_HEIGHT, "100%");
		document.putNotNullAndNotEmpty(oFF.OcQuasarConstants.QUASAR_CONTENT_ITEMS, oFF.OcQuasarPageContentConverter.getQuasarContentItems(page, options));
		oFF.OcQuasarPageContentConverter.addBackgroundPictureToQuasarContent(page, document, options);
	},
	getQuasarLayoutType:function(page, options)
	{
			var quasarLayoutType;
		if (page.isResponsive())
		{
			quasarLayoutType = oFF.OcLayoutType.FLOW.getName();
		}
		else
		{
			if (options.getMainLayoutType() === oFF.OcLayoutType.CANVAS)
			{
				quasarLayoutType = oFF.OcLayoutType.CANVAS.getName();
			}
			else
			{
				quasarLayoutType = oFF.OcLayoutType.FLOW.getName();
			}
		}
		return quasarLayoutType;
	},
	getQuasarContentItems:function(page, options)
	{
			var quasarContentItems = oFF.PrFactory.createList();
		var widgets = page.getWidgetManager().getWidgets();
		for (var i = 0; i < widgets.size(); i++)
		{
			var widget = widgets.get(i);
			var quasarContentItem = oFF.OcQuasarWidgetConverter.convert(widget, options);
			if (oFF.notNull(quasarContentItem))
			{
				quasarContentItems.add(quasarContentItem);
			}
		}
		return quasarContentItems;
	},
	addBackgroundPictureToQuasarContent:function(page, document, options)
	{
			if (options.getMainLayoutType() === oFF.OcLayoutType.CANVAS)
		{
			return;
		}
		var backgroundWidget = page.getWidgetManager().getBackgroundImageWidget();
		if (oFF.isNull(backgroundWidget))
		{
			return;
		}
		var backgroundImage = backgroundWidget.getImage();
		if (backgroundImage.hasImageData())
		{
			document.putStringNotNullAndNotEmpty(oFF.OcQuasarConstants.QUASAR_CONTENT_BACKGROUND_IMAGE_SRC, backgroundImage.getImageData());
		}
		else
		{
			document.putStringNotNullAndNotEmpty(oFF.OcQuasarConstants.QUASAR_CONTENT_BACKGROUND_IMAGE_SRC, backgroundWidget.getImageUrl());
		}
	},
	convertPageToAnalyticalCard:function(page, dataProviders, options)
	{
			var kpiWidget = page.getContext().getStoryEntityFactory().getFirstWidgetByType(page, oFF.OcWidgetType.ANALYTICAL_CARD);
		if (oFF.notNull(kpiWidget))
		{
			dataProviders.add(oFF.OcQuasarDataProviderConverter.convert(kpiWidget, options, page.getId()));
		}
		var chartWidget = page.getContext().getStoryEntityFactory().getFirstWidgetByType(page, oFF.OcWidgetType.CHART);
		if (oFF.notNull(chartWidget))
		{
			dataProviders.add(oFF.OcQuasarDataProviderConverter.convert(chartWidget, options, page.getId()));
		}
		if (oFF.isNull(kpiWidget) && oFF.isNull(chartWidget))
		{
			return null;
		}
		return oFF.OcQuasarWidgetConverter.convertCard(kpiWidget, chartWidget, options);
	},
	convertPageToCompositeAnalyticalCard:function(itemList, story, page, dataProviders, options)
	{
			var kpiWidget = page.getContext().getStoryEntityFactory().getFirstWidgetByType(page, oFF.OcWidgetType.KPI);
		if (oFF.notNull(kpiWidget))
		{
			dataProviders.add(oFF.OcQuasarDataProviderConverter.convert(kpiWidget, options, page.getId()));
		}
		var chartWidget = page.getContext().getStoryEntityFactory().getFirstWidgetByType(page, oFF.OcWidgetType.CHART);
		if (oFF.notNull(chartWidget))
		{
			dataProviders.add(oFF.OcQuasarDataProviderConverter.convert(chartWidget, options, page.getId()));
		}
		var gridWidget = page.getContext().getStoryEntityFactory().getFirstWidgetByType(page, oFF.OcWidgetType.GRID);
		if (oFF.notNull(gridWidget))
		{
			dataProviders.add(oFF.OcQuasarDataProviderConverter.convert(gridWidget, options, page.getId()));
		}
		return oFF.OcQuasarWidgetConverter.convertCompositeCard(itemList, story, kpiWidget, chartWidget, gridWidget, options);
	}
};

oFF.OcQuasarPageConverter = function() {};
oFF.OcQuasarPageConverter.prototype = new oFF.XObject();
oFF.OcQuasarPageConverter.prototype._ff_c = "OcQuasarPageConverter";

oFF.OcQuasarPageConverter.convertPage = function(page, options, quasarContent, dataProviders)
{
	oFF.OcQuasarPageContentConverter.convert(page, options, quasarContent);
	oFF.OcQuasarPageConverter.convertDataProvidersOfPage(page, options, dataProviders);
};
oFF.OcQuasarPageConverter.convertWidget = function(widget, options)
{
	var document = oFF.PrFactory.createStructure();
	var widgetDocument = oFF.OcQuasarWidgetConverter.convert(widget, options);
	document.putNotNullAndNotEmpty(oFF.OcQuasarConstants.QUASAR_CONTENT, widgetDocument);
	document.putNotNullAndNotEmpty(oFF.OcQuasarConstants.QUASAR_DATA_PROVIDERS, oFF.OcQuasarPageConverter.convertDataProviderOfWidget(widget, options));
	return document;
};
oFF.OcQuasarPageConverter.convertDataProviderOfWidget = function(widget, options)
{
	if (!widget.getWidgetType().hasDataProvider())
	{
		return null;
	}
	var dataProviderDocument = oFF.OcQuasarDataProviderConverter.convert(widget, options, null);
	if (oFF.isNull(dataProviderDocument))
	{
		return null;
	}
	var dataProviderDocuments = oFF.PrFactory.createList();
	dataProviderDocuments.add(dataProviderDocument);
	return dataProviderDocuments;
};
oFF.OcQuasarPageConverter.convertDataProvidersOfPage = function(page, options, dataProviderDocuments)
{
	var widgets = page.getWidgetManager().getWigdetsWithDataProvider();
	if (!oFF.XCollectionUtils.hasElements(widgets))
	{
		return;
	}
	for (var i = 0; i < widgets.size(); i++)
	{
		var widget = widgets.get(i);
		var dataProviderDocument = oFF.OcQuasarDataProviderConverter.convert(widget, options, page.getId());
		if (oFF.notNull(dataProviderDocument))
		{
			dataProviderDocuments.add(dataProviderDocument);
		}
	}
};
oFF.OcQuasarPageConverter.prototype.releaseObject = function()
{
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.OcQuasarStoryConverter = {

	convertStory:function(story, options)
	{
			var documents = oFF.XList.create();
		var pages = story.getPageManager().getPages();
		for (var i = 0; i < pages.size(); i++)
		{
			var document = oFF.PrFactory.createStructure();
			var page = pages.get(i);
			oFF.OcQuasarPageConverter.convertPage(page, options, document.putNewStructure(oFF.OcQuasarConstants.QUASAR_CONTENT), document.putNewList(oFF.OcQuasarConstants.QUASAR_DATA_PROVIDERS));
			documents.add(document);
		}
		return documents;
	},
	convertPage:function(page, options)
	{
			var document = oFF.PrFactory.createStructure();
		oFF.OcQuasarPageConverter.convertPage(page, options, document.putNewStructure(oFF.OcQuasarConstants.QUASAR_CONTENT), document.putNewList(oFF.OcQuasarConstants.QUASAR_DATA_PROVIDERS));
		return document;
	},
	convertWidget:function(widget, options)
	{
			return oFF.OcQuasarPageConverter.convertWidget(widget, options);
	}
};

oFF.OcQuasarWidgetConverter = function() {};
oFF.OcQuasarWidgetConverter.prototype = new oFF.XObject();
oFF.OcQuasarWidgetConverter.prototype._ff_c = "OcQuasarWidgetConverter";

oFF.OcQuasarWidgetConverter.convert = function(widget, options)
{
	var document = oFF.PrFactory.createStructure();
	document.putStringNotNullAndNotEmpty(oFF.OcQuasarConstants.QUASAR_ITEM_NAME, widget.getId());
	document.putStringNotNullAndNotEmpty(oFF.OcQuasarConstants.QUASAR_ENTITY_ID, widget.getNormalizedDataReferenceId());
	document.putStringNotNullAndNotEmpty(oFF.OcQuasarConstants.QUASAR_ITEM_TYPE, widget.getQuasarName(options));
	oFF.OcQuasarWidgetConverter.addBindingToDocument(widget, document);
	var added = oFF.OcQuasarWidgetConverter.addWidgetContentToDocument(widget, document, options);
	if (!added)
	{
		return null;
	}
	added = oFF.OcQuasarWidgetLayoutConverter.addLayoutToDocument(widget, document, options);
	if (!added)
	{
		return null;
	}
	return document;
};
oFF.OcQuasarWidgetConverter.convertCard = function(kpiWidget, chartWidget, options)
{
	var document = oFF.PrFactory.createStructure();
	var added = false;
	document.putStringNotNullAndNotEmpty(oFF.OcQuasarConstants.QUASAR_ITEM_TYPE, oFF.OcWidgetType.ANALYTICAL_CARD.getQuasarName());
	if (oFF.notNull(kpiWidget))
	{
		document.putStringNotNullAndNotEmpty(oFF.OcQuasarConstants.QUASAR_ITEM_NAME, kpiWidget.getId());
		document.putStringNotNullAndNotEmpty(oFF.OcQuasarConstants.QUASAR_ENTITY_ID, kpiWidget.getNormalizedDataReferenceId());
		added = oFF.OcQuasarWidgetLayoutConverter.addLayoutToDocument(kpiWidget, document, options);
	}
	else if (oFF.notNull(chartWidget))
	{
		document.putStringNotNullAndNotEmpty(oFF.OcQuasarConstants.QUASAR_ITEM_NAME, chartWidget.getId());
		document.putStringNotNullAndNotEmpty(oFF.OcQuasarConstants.QUASAR_ENTITY_ID, chartWidget.getNormalizedDataReferenceId());
		added = oFF.OcQuasarWidgetLayoutConverter.addLayoutToDocument(chartWidget, document, options);
	}
	if (!added)
	{
		return null;
	}
	oFF.OcQuasarWidgetConverter.addMultiBindingBindingToDocument(kpiWidget, chartWidget, document);
	return document;
};
oFF.OcQuasarWidgetConverter.convertCompositeCard = function(itemList, story, kpiWidget, chartWidget, gridWidget, options)
{
	var description = story.getDescription();
	if (oFF.XStringUtils.isNullOrEmpty(description))
	{
		description = story.getName();
	}
	oFF.OcQuasarWidgetConverter.addTextContent(itemList, description);
	oFF.OcQuasarWidgetConverter.addTextContent(itemList, story.getPublicUrl());
	var kpiWidgetDocument = null;
	if (oFF.notNull(kpiWidget))
	{
		kpiWidgetDocument = oFF.OcQuasarWidgetConverter.convert(kpiWidget, options);
		itemList.add(kpiWidgetDocument);
	}
	if (oFF.notNull(chartWidget))
	{
		itemList.add(oFF.OcQuasarWidgetConverter.convert(chartWidget, options));
	}
	if (oFF.notNull(gridWidget))
	{
		itemList.add(oFF.OcQuasarWidgetConverter.convert(gridWidget, options));
	}
	return kpiWidgetDocument;
};
oFF.OcQuasarWidgetConverter.addTextContent = function(document, text)
{
	var titleStructure = document.addNewStructure();
	titleStructure.putString(oFF.OcQuasarConstants.QUASAR_CONTENT_TYPE, oFF.OcQuasarConstants.QUASAR_ITEM_TEXT);
	titleStructure.putString(oFF.OcQuasarConstants.QUASAR_ITEM_TEXT, text);
};
oFF.OcQuasarWidgetConverter.addBindingToDocument = function(widget, document)
{
	var widgetType = widget.getWidgetType();
	if (widgetType !== oFF.OcWidgetType.ANALYTICAL_CARD && widgetType !== oFF.OcWidgetType.KPI && widgetType !== oFF.OcWidgetType.CHART && widgetType !== oFF.OcWidgetType.GRID)
	{
		return;
	}
	var bindingSource = oFF.XStringUtils.concatenate2("dp:", oFF.XStringUtils.concatenate3(widget.getStory().getNormalizedName(), "_", widget.getNormalizedDataReferenceId()));
	if (widgetType === oFF.OcWidgetType.KPI || widgetType === oFF.OcWidgetType.CHART)
	{
		var bindingStructure = oFF.PrFactory.createStructure();
		if (widgetType === oFF.OcWidgetType.KPI)
		{
			bindingStructure.putStringNotNullAndNotEmpty(oFF.OcQuasarConstants.QUASAR_ITEM_BINDING_TYPE, oFF.OcQuasarConstants.QUASAR_KPI_BINDING_TYPE);
		}
		else
		{
			bindingStructure.putStringNotNullAndNotEmpty(oFF.OcQuasarConstants.QUASAR_ITEM_BINDING_TYPE, oFF.OcQuasarConstants.QUASAR_CHART_BINDING_TYPE);
		}
		bindingStructure.putStringNotNullAndNotEmpty(oFF.OcQuasarConstants.QUASAR_ITEM_BINDING_SOURCE, bindingSource);
		document.put(oFF.OcQuasarConstants.QUASAR_ITEM_BINDING, bindingStructure);
	}
	else if (widgetType === oFF.OcWidgetType.ANALYTICAL_CARD)
	{
		var bindingStruct = oFF.PrFactory.createStructure();
		bindingStruct.putStringNotNullAndNotEmpty(oFF.OcQuasarConstants.QUASAR_ITEM_BINDING_TYPE, oFF.OcQuasarConstants.QUASAR_KPI_BINDING_TYPE);
		bindingStruct.putStringNotNullAndNotEmpty(oFF.OcQuasarConstants.QUASAR_ITEM_BINDING_SOURCE, bindingSource);
		document.putNewList(oFF.OcQuasarConstants.QUASAR_ITEM_BINDINGS).add(bindingStruct);
	}
	else if (widgetType === oFF.OcWidgetType.GRID)
	{
		document.putStringNotNullAndNotEmpty(oFF.OcQuasarConstants.QUASAR_ITEM_BINDING, bindingSource);
	}
};
oFF.OcQuasarWidgetConverter.addMultiBindingBindingToDocument = function(kpiWidget, chartWidget, document)
{
	var bindingList = document.putNewList(oFF.OcQuasarConstants.QUASAR_ITEM_BINDINGS);
	var bindingStructure;
	var bindingSource;
	if (oFF.notNull(kpiWidget))
	{
		bindingStructure = bindingList.addNewStructure();
		bindingSource = oFF.XStringUtils.concatenate2("dp:", oFF.XStringUtils.concatenate3(kpiWidget.getStory().getNormalizedName(), "_", kpiWidget.getNormalizedDataReferenceId()));
		bindingStructure.putStringNotNullAndNotEmpty(oFF.OcQuasarConstants.QUASAR_ITEM_BINDING_TYPE, oFF.OcQuasarConstants.QUASAR_KPI_BINDING_TYPE);
		bindingStructure.putStringNotNullAndNotEmpty(oFF.OcQuasarConstants.QUASAR_ITEM_BINDING_SOURCE, bindingSource);
	}
	if (oFF.notNull(chartWidget))
	{
		bindingStructure = bindingList.addNewStructure();
		bindingSource = oFF.XStringUtils.concatenate2("dp:", oFF.XStringUtils.concatenate3(chartWidget.getStory().getNormalizedName(), "_", chartWidget.getNormalizedDataReferenceId()));
		bindingStructure.putStringNotNullAndNotEmpty(oFF.OcQuasarConstants.QUASAR_ITEM_BINDING_TYPE, oFF.OcQuasarConstants.QUASAR_CHART_BODY_BINDING_TYPE);
		bindingStructure.putStringNotNullAndNotEmpty(oFF.OcQuasarConstants.QUASAR_ITEM_BINDING_SOURCE, bindingSource);
	}
};
oFF.OcQuasarWidgetConverter.addWidgetContentToDocument = function(widget, document, options)
{
	var added = true;
	var widgetType = widget.getWidgetType();
	if (widgetType === oFF.OcWidgetType.TEXT)
	{
		added = oFF.OcQuasarWidgetConverter.addTextContentToDocument(widget, document);
	}
	else if (widgetType === oFF.OcWidgetType.UNKNOWN)
	{
		added = oFF.OcQuasarWidgetConverter.addUnsupportedWidgetToDocument(document);
	}
	else if (widgetType === oFF.OcWidgetType.PICTOGRAM)
	{
		added = oFF.OcQuasarWidgetConverter.addPictogramContentToDocument(widget, document);
	}
	else if (widgetType === oFF.OcWidgetType.IMAGE)
	{
		added = oFF.OcQuasarWidgetConverter.addImageContentToDocument(widget, document, options);
	}
	else if (widgetType === oFF.OcWidgetType.PAGE_FILTER)
	{
		added = oFF.OcQuasarWidgetConverter.addPageFilterContentToDocument(widget, document);
	}
	else if (widgetType === oFF.OcWidgetType.FIELD_SELECTION_INPUT_CONTROL)
	{
		added = oFF.OcQuasarWidgetConverter.addFieldSelectionContentToDocument(widget, document);
	}
	else if (widgetType === oFF.OcWidgetType.CALCULATION_INPUT_CONTROL)
	{
		added = oFF.OcQuasarWidgetConverter.addCalculationVariableContentToDocument(widget, document);
	}
	return added;
};
oFF.OcQuasarWidgetConverter.addUnsupportedWidgetToDocument = function(document)
{
	document.putStringNotNullAndNotEmpty(oFF.OcQuasarConstants.QUASAR_ITEM_TEXT, oFF.OcQuasarConstants.QUASAR_ITEM_TEXT_UNSUPPORTED_WIDGET);
	return true;
};
oFF.OcQuasarWidgetConverter.addPictogramContentToDocument = function(widget, document)
{
	var svg = widget.getPictogram();
	document.putString(oFF.OcQuasarConstants.QUASAR_ITEM_PICTOGRAM_SVG, svg);
	return true;
};
oFF.OcQuasarWidgetConverter.addPageFilterContentToDocument = function(widget, document)
{
	var pageFilter = widget.getPageFilter();
	if (oFF.isNull(pageFilter))
	{
		return false;
	}
	document.putString("CustomControl", document.getStringByKey("CType"));
	document.remove("CType");
	document.putString("Id", pageFilter.getStringByKey("source"));
	return true;
};
oFF.OcQuasarWidgetConverter.addFieldSelectionContentToDocument = function(widget, document)
{
	var fieldSelection = widget.getFieldSelection();
	if (oFF.isNull(fieldSelection))
	{
		return false;
	}
	document.putString("CustomControl", document.getStringByKey("CType"));
	document.remove("CType");
	document.putString("Id", fieldSelection.getStringByKey("id"));
	return true;
};
oFF.OcQuasarWidgetConverter.addCalculationVariableContentToDocument = function(widget, document)
{
	var calcVar = widget.getCalcVar();
	if (oFF.isNull(calcVar))
	{
		return false;
	}
	document.putString("CustomControl", document.getStringByKey("CType"));
	document.remove("CType");
	document.putString("Id", calcVar.getStringByKey("id"));
	return true;
};
oFF.OcQuasarWidgetConverter.addTextContentToDocument = function(widget, document)
{
	var widgetText = widget.getWidgetText();
	document.putStringNotNullAndNotEmpty(oFF.OcQuasarConstants.QUASAR_ITEM_TEXT, widgetText);
	return true;
};
oFF.OcQuasarWidgetConverter.addImageContentToDocument = function(widget, document, options)
{
	if (widget.getLayout().isBackgroundWidget() && options.getMainLayoutType() !== oFF.OcLayoutType.CANVAS)
	{
		return false;
	}
	var image = widget.getImage();
	if (oFF.isNull(image))
	{
		return false;
	}
	if (image.hasImageData())
	{
		document.putStringNotNullAndNotEmpty(oFF.OcQuasarConstants.QUASAR_ITEM_IMAGE_SRC, image.getImageData());
	}
	else
	{
		document.putStringNotNullAndNotEmpty(oFF.OcQuasarConstants.QUASAR_ITEM_IMAGE_SRC, widget.getImageUrl());
	}
	return true;
};
oFF.OcQuasarWidgetConverter.prototype.releaseObject = function()
{
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.OcQuasarWidgetLayoutConverter = function() {};
oFF.OcQuasarWidgetLayoutConverter.prototype = new oFF.XObject();
oFF.OcQuasarWidgetLayoutConverter.prototype._ff_c = "OcQuasarWidgetLayoutConverter";

oFF.OcQuasarWidgetLayoutConverter.addLayoutToDocument = function(widget, document, options)
{
	if (options.useSingleWidgetLayout())
	{
		return oFF.OcQuasarWidgetLayoutConverter.addSingleWidgetLayout(document);
	}
	var layoutType = oFF.OcQuasarWidgetLayoutConverter.processLayoutType(widget, options);
	if (oFF.isNull(layoutType))
	{
		return false;
	}
	if (layoutType === oFF.OcLayoutType.FLOW_SIMPLE)
	{
		return oFF.OcQuasarWidgetLayoutConverter.addSimpleLayout(widget, document);
	}
	else if (layoutType === oFF.OcLayoutType.FLOW)
	{
		return oFF.OcQuasarWidgetLayoutConverter.addFlexLayout(widget, document);
	}
	return oFF.OcQuasarWidgetLayoutConverter.addCanvasLayout(widget, document);
};
oFF.OcQuasarWidgetLayoutConverter.addSingleWidgetLayout = function(document)
{
	document.putString(oFF.OcQuasarConstants.QUASAR_LAYOUT_HEIGHT, "100%");
	document.putString(oFF.OcQuasarConstants.QUASAR_LAYOUT_WIDTH, "100%");
	return true;
};
oFF.OcQuasarWidgetLayoutConverter.addCanvasLayout = function(widget, document)
{
	var widgetLayout = widget.getLayout();
	if (widgetLayout.getHeight() > 0)
	{
		document.putString(oFF.OcQuasarConstants.QUASAR_LAYOUT_HEIGHT, oFF.XStringUtils.concatenate2(oFF.XInteger.convertToString(widgetLayout.getHeight()), oFF.OcQuasarConstants.QUASAR_LAYOUT_PX));
	}
	document.putString(oFF.OcQuasarConstants.QUASAR_LAYOUT_WIDTH, oFF.XStringUtils.concatenate2(oFF.XInteger.convertToString(widgetLayout.getWidth()), oFF.OcQuasarConstants.QUASAR_LAYOUT_PX));
	document.putInteger(oFF.OcQuasarConstants.QUASAR_LAYOUT_X, widgetLayout.getX());
	document.putInteger(oFF.OcQuasarConstants.QUASAR_LAYOUT_Y, widgetLayout.getY());
	oFF.OcStoryUtils.addIntegerGtZeroToStructure(oFF.OcQuasarConstants.QUASAR_LAYOUT_BORDER_CORNER_RADIUS, widgetLayout.getCornerRadius(), document);
	oFF.OcQuasarWidgetLayoutConverter.addBackgroundAndBorderLayout(widget, document);
	return true;
};
oFF.OcQuasarWidgetLayoutConverter.addFlexLayout = function(widget, document)
{
	var widgetType = widget.getWidgetType();
	if (widgetType === oFF.OcWidgetType.CHART || widgetType === oFF.OcWidgetType.GRID || widgetType === oFF.OcWidgetType.IMAGE || widgetType === oFF.OcWidgetType.PICTOGRAM)
	{
		document.putString(oFF.OcQuasarConstants.QUASAR_LAYOUT_HEIGHT, "50%");
	}
	oFF.OcQuasarWidgetLayoutConverter.addBackgroundAndBorderLayout(widget, document);
	return true;
};
oFF.OcQuasarWidgetLayoutConverter.addSimpleLayout = function(widget, document)
{
	document.putString(oFF.OcQuasarConstants.QUASAR_LAYOUT_HEIGHT, "50%");
	oFF.OcQuasarWidgetLayoutConverter.addBackgroundAndBorderLayout(widget, document);
	return true;
};
oFF.OcQuasarWidgetLayoutConverter.addBackgroundAndBorderLayout = function(widget, document)
{
	var widgetLayout = widget.getLayout();
	if (!widgetLayout.isBackgroundWidget())
	{
		document.putStringNotNullAndNotEmpty(oFF.OcQuasarConstants.QUASAR_LAYOUT_BACKGROUND_COLOR, widgetLayout.getBackgroundColor());
		document.putStringNotNullAndNotEmpty(oFF.OcQuasarConstants.QUASAR_LAYOUT_BORDER_COLOR, widgetLayout.getBorderColor());
		document.putStringNotNullAndNotEmpty(oFF.OcQuasarConstants.QUASAR_LAYOUT_BORDER_FORMAT, widgetLayout.getBorderFormat());
		document.putStringNotNullAndNotEmpty(oFF.OcQuasarConstants.QUASAR_LAYOUT_BORDER_STYLE, widgetLayout.getBorderStyle());
		oFF.OcStoryUtils.addIntegerGtZeroToStructure(oFF.OcQuasarConstants.QUASAR_LAYOUT_BORDER_SIZE, widgetLayout.getBorderSize(), document);
	}
};
oFF.OcQuasarWidgetLayoutConverter.processLayoutType = function(widget, options)
{
	var layoutType = null;
	var mainLayoutType = options.getMainLayoutType();
	if (mainLayoutType === oFF.OcLayoutType.FLOW || widget.getPage().isResponsive())
	{
		layoutType = oFF.OcLayoutType.FLOW;
	}
	else if (mainLayoutType === oFF.OcLayoutType.FLOW_SIMPLE)
	{
		layoutType = oFF.OcLayoutType.FLOW_SIMPLE;
	}
	else
	{
		layoutType = oFF.OcLayoutType.CANVAS;
	}
	if (oFF.OcQuasarWidgetLayoutConverter.isLayoutTypeSupportedByWidget(widget, layoutType))
	{
		return layoutType;
	}
	return null;
};
oFF.OcQuasarWidgetLayoutConverter.isLayoutTypeSupportedByWidget = function(widget, layoutType)
{
	var widgetType = widget.getWidgetType();
	if (layoutType === oFF.OcLayoutType.FLOW)
	{
		return widgetType === oFF.OcWidgetType.CHART || widgetType === oFF.OcWidgetType.GRID || widgetType === oFF.OcWidgetType.IMAGE || widgetType === oFF.OcWidgetType.PICTOGRAM || widgetType === oFF.OcWidgetType.TEXT || widgetType === oFF.OcWidgetType.PAGE_FILTER || widgetType === oFF.OcWidgetType.FIELD_SELECTION_INPUT_CONTROL || widgetType === oFF.OcWidgetType.CALCULATION_INPUT_CONTROL;
	}
	else if (layoutType === oFF.OcLayoutType.FLOW_SIMPLE)
	{
		return widgetType === oFF.OcWidgetType.CHART || widgetType === oFF.OcWidgetType.GRID || widgetType === oFF.OcWidgetType.IMAGE;
	}
	return true;
};
oFF.OcQuasarWidgetLayoutConverter.prototype.releaseObject = function()
{
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.OcDatasets = function() {};
oFF.OcDatasets.prototype = new oFF.XObject();
oFF.OcDatasets.prototype._ff_c = "OcDatasets";

oFF.OcDatasets.prototype.m_context = null;
oFF.OcDatasets.prototype.m_datasets = null;
oFF.OcDatasets.prototype.setupDatasets = function(context)
{
	oFF.XObject.prototype.setup.call( this );
	this.m_context = context;
};
oFF.OcDatasets.prototype.getDatasetByDatasource = function(datasource)
{
	return this.getDatasets().getByKey(datasource);
};
oFF.OcDatasets.prototype.getCubeNames = function()
{
	var cubeNames = oFF.XListOfString.create();
	var datasets = this.getDatasetsAsReadOnlyList();
	for (var i = 0; i < datasets.size(); i++)
	{
		var cubeName = datasets.get(i).getCubeName();
		if (oFF.XStringUtils.isNotNullAndNotEmpty(cubeName))
		{
			cubeNames.add(cubeName);
		}
	}
	cubeNames.sortByDirection(oFF.XSortDirection.ASCENDING);
	return cubeNames;
};
oFF.OcDatasets.prototype.updateDatasetsWithCubesMetdata = function(cubesMetadata)
{
	if (!oFF.XCollectionUtils.hasElements(cubesMetadata))
	{
		return;
	}
	var datasets = this.getDatasetsAsReadOnlyList();
	for (var i = 0; i < datasets.size(); i++)
	{
		var dataset = datasets.get(i);
		var cubeName = dataset.getCubeName();
		if (oFF.XStringUtils.isNullOrEmpty(cubeName))
		{
			continue;
		}
		var cubeRefName = oFF.XString.replace(cubeName, "CUBE:", "");
		var cubeMetadata = cubesMetadata.getByKey(cubeRefName);
		if (oFF.isNull(cubeMetadata))
		{
			this.getContext().getMessageManager().addMessage(oFF.OcMessage.newDataSourceNotFound(oFF.Severity.WARNING, cubeName));
			continue;
		}
		if (oFF.XStringUtils.isNotNullAndNotEmpty(cubeMetadata.getDataSourceName()))
		{
			dataset.setDatasource(cubeMetadata.getDataSourceName());
		}
		if (cubeMetadata.getFormulas() !== null)
		{
			dataset.setFormulaAliases(cubeMetadata.getFormulas());
		}
		if (cubeMetadata.getMemberDefinitions() !== null)
		{
			dataset.setMemberDefinitions(cubeMetadata.getMemberDefinitions());
		}
		this.updateSystemName(dataset, cubeMetadata);
	}
};
oFF.OcDatasets.prototype.updateSystemName = function(dataset, cubeMetadata)
{
	var systemName = cubeMetadata.getSystemName();
	if (oFF.XStringUtils.isNotNullAndNotEmpty(systemName))
	{
		dataset.setSystemName(systemName);
	}
	else
	{
		var connection = this.getContext().getConnection();
		if (oFF.notNull(connection))
		{
			dataset.setSystemName(connection.getSystemName());
		}
	}
};
oFF.OcDatasets.prototype.getDatasets = function()
{
	if (oFF.isNull(this.m_datasets))
	{
		this.m_datasets = this.processDatasets();
		if (oFF.isNull(this.m_datasets))
		{
			this.m_datasets = oFF.XHashMapByString.create();
		}
	}
	return this.m_datasets;
};
oFF.OcDatasets.prototype.getDatasetsAsReadOnlyList = function()
{
	return this.getDatasets().getValuesAsReadOnlyList();
};
oFF.OcDatasets.prototype.getContext = function()
{
	return this.m_context;
};
oFF.OcDatasets.prototype.toString = function()
{
	var datasets = this.getDatasetsAsReadOnlyList();
	var sb = oFF.XStringBuffer.create();
	sb.append("Datasets:");
	for (var i = 0; i < datasets.size(); i++)
	{
		var dataset = datasets.get(i);
		sb.appendNewLine().appendInt(i + 1).append(". Dataset for datasource \"").append(dataset.getDatasource()).append("\", cube \"").append(dataset.getCubeName());
		sb.append("\" and model \"").append(dataset.getModelId()).append("\"");
	}
	return sb.toString();
};
oFF.OcDatasets.prototype.releaseObject = function()
{
	this.m_context = null;
	this.m_datasets = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_datasets);
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.OcImages = function() {};
oFF.OcImages.prototype = new oFF.XObject();
oFF.OcImages.prototype._ff_c = "OcImages";

oFF.OcImages.IMAGE_URL = "/sap/fpa/services/rest/fpa/story/get-static-content/";
oFF.OcImages.prototype.m_storyId = null;
oFF.OcImages.prototype.m_imageUrl = null;
oFF.OcImages.prototype.m_images = null;
oFF.OcImages.prototype.m_context = null;
oFF.OcImages.prototype.setupImages = function(storyId, context)
{
	oFF.XObject.prototype.setup.call( this );
	this.m_storyId = storyId;
	this.m_context = context;
};
oFF.OcImages.prototype.getImageByImageId = function(imageId)
{
	return this.getImages().getByKey(imageId);
};
oFF.OcImages.prototype.getImages = function()
{
	if (oFF.isNull(this.m_images))
	{
		this.m_images = this.processImages();
	}
	return this.m_images;
};
oFF.OcImages.prototype.getImageUrl = function()
{
	if (oFF.notNull(this.m_imageUrl))
	{
		return this.m_imageUrl;
	}
	this.m_imageUrl = "";
	var connection = this.getContext().getConnection();
	if (oFF.notNull(connection))
	{
		var uri = connection.getSystemUri();
		var tenantId = connection.getTenantId();
		this.m_imageUrl = oFF.XStringUtils.concatenate5(uri, oFF.OcImages.IMAGE_URL, this.getStoryId(), "/%s?tenant=", tenantId);
	}
	return this.m_imageUrl;
};
oFF.OcImages.prototype.getStoryId = function()
{
	return this.m_storyId;
};
oFF.OcImages.prototype.getContext = function()
{
	return this.m_context;
};
oFF.OcImages.prototype.releaseObject = function()
{
	this.m_storyId = null;
	this.m_context = null;
	this.m_images = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_images);
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.OcPageManager = function() {};
oFF.OcPageManager.prototype = new oFF.XObject();
oFF.OcPageManager.prototype._ff_c = "OcPageManager";

oFF.OcPageManager.create = function(story, context)
{
	var pageManager = new oFF.OcPageManager();
	pageManager.setupPageManager(story, context);
	return pageManager;
};
oFF.OcPageManager.prototype.m_pages = null;
oFF.OcPageManager.prototype.m_pageByPageIdMap = null;
oFF.OcPageManager.prototype.m_pageByPageNameMap = null;
oFF.OcPageManager.prototype.m_widgetByWidgetIdMap = null;
oFF.OcPageManager.prototype.setupPageManager = function(story, context)
{
	oFF.XObject.prototype.setup.call( this );
	this.m_pageByPageIdMap = context.getStoryEntityFactory().createPagesOfStory(story);
};
oFF.OcPageManager.prototype.hasPages = function()
{
	return this.getPageByPageIdMap().hasElements();
};
oFF.OcPageManager.prototype.getPages = function()
{
	if (oFF.isNull(this.m_pages))
	{
		this.m_pages = this.getPageByPageIdMap().getValuesAsReadOnlyList();
	}
	return this.m_pages;
};
oFF.OcPageManager.prototype.getPageByPageId = function(pageId)
{
	return this.getPageByPageIdMap().getByKey(pageId);
};
oFF.OcPageManager.prototype.getPageByPageName = function(pageName)
{
	return this.getPageByPageNameMap().getByKey(pageName);
};
oFF.OcPageManager.prototype.containsPage = function(pageId)
{
	return this.getPageByPageIdMap().containsKey(pageId);
};
oFF.OcPageManager.prototype.getPageByWidgetId = function(widgetId)
{
	var widget = this.getWidgetByWidgetIdMap().getByKey(widgetId);
	if (oFF.notNull(widget))
	{
		return widget.getPage();
	}
	return null;
};
oFF.OcPageManager.prototype.getWidgetByWidgetId = function(widgetId)
{
	return this.getWidgetByWidgetIdMap().getByKey(widgetId);
};
oFF.OcPageManager.prototype.getAllWidgetIds = function()
{
	return this.getWidgetByWidgetIdMap().getKeysAsReadOnlyListOfString();
};
oFF.OcPageManager.prototype.getAllWidgets = function()
{
	return this.getWidgetByWidgetIdMap().getValuesAsReadOnlyList();
};
oFF.OcPageManager.prototype.getAllWidgetIdsByWidgetType = function(widgetType)
{
	var widgetIds = oFF.XListOfString.create();
	var it = this.getWidgetByWidgetIdMap().getIterator();
	while (it.hasNext())
	{
		var widget = it.next();
		if (widget.getWidgetType() === widgetType)
		{
			widgetIds.add(widget.getId());
		}
	}
	return widgetIds;
};
oFF.OcPageManager.prototype.getPageByPageIdMap = function()
{
	return this.m_pageByPageIdMap;
};
oFF.OcPageManager.prototype.getPageByPageNameMap = function()
{
	if (oFF.notNull(this.m_pageByPageNameMap))
	{
		return this.m_pageByPageNameMap;
	}
	this.m_pageByPageNameMap = oFF.XHashMapByString.create();
	var pages = this.getPages();
	for (var i = 0; i < pages.size(); i++)
	{
		var page = pages.get(i);
		if (oFF.XStringUtils.isNotNullAndNotEmpty(page.getName()))
		{
			this.m_pageByPageNameMap.put(page.getName(), page);
		}
	}
	return this.m_pageByPageNameMap;
};
oFF.OcPageManager.prototype.getWidgetByWidgetIdMap = function()
{
	if (oFF.notNull(this.m_widgetByWidgetIdMap))
	{
		return this.m_widgetByWidgetIdMap;
	}
	this.m_widgetByWidgetIdMap = oFF.XHashMapByString.create();
	var pages = this.getPageByPageIdMap().getValuesAsReadOnlyList();
	for (var i = 0; i < pages.size(); i++)
	{
		var page = pages.get(i);
		var widgets = page.getWidgetManager().getWidgets();
		for (var j = 0; j < widgets.size(); j++)
		{
			var widget = widgets.get(j);
			this.m_widgetByWidgetIdMap.put(widget.getId(), widget);
		}
	}
	return this.m_widgetByWidgetIdMap;
};
oFF.OcPageManager.prototype.toString = function()
{
	if (oFF.isNull(this.m_pageByPageIdMap))
	{
		return "Pages not yet initialized";
	}
	var pages = this.getPages();
	var sb = oFF.XStringBuffer.create();
	sb.append("Pages: (").appendInt(pages.size()).append(")");
	for (var i = 0; i < pages.size(); i++)
	{
		var page = pages.get(i);
		sb.appendNewLine().appendInt(i + 1).append(". Page: ").append(page.getId()).append(" \"").append(page.getName()).append("\" (").appendInt(page.getWidgetManager().getWidgetIds().size()).append(" widgets)");
	}
	return sb.toString();
};
oFF.OcPageManager.prototype.releaseObject = function()
{
	this.m_pages = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_pages);
	this.m_pageByPageIdMap = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_pageByPageIdMap);
	this.m_pageByPageNameMap = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_pageByPageNameMap);
	this.m_widgetByWidgetIdMap = oFF.XObjectExt.release(this.m_widgetByWidgetIdMap);
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.OcWidgetLayout = function() {};
oFF.OcWidgetLayout.prototype = new oFF.XObject();
oFF.OcWidgetLayout.prototype._ff_c = "OcWidgetLayout";

oFF.OcWidgetLayout.prototype.m_x = 0;
oFF.OcWidgetLayout.prototype.m_y = 0;
oFF.OcWidgetLayout.prototype.m_width = 0;
oFF.OcWidgetLayout.prototype.m_height = 0;
oFF.OcWidgetLayout.prototype.m_backgroundWidget = false;
oFF.OcWidgetLayout.prototype.m_backgroundColor = null;
oFF.OcWidgetLayout.prototype.m_borderColor = null;
oFF.OcWidgetLayout.prototype.m_borderFormat = null;
oFF.OcWidgetLayout.prototype.m_borderStyle = null;
oFF.OcWidgetLayout.prototype.m_borderSize = 0;
oFF.OcWidgetLayout.prototype.m_cornerRadius = 0;
oFF.OcWidgetLayout.prototype.getX = function()
{
	return this.m_x;
};
oFF.OcWidgetLayout.prototype.setX = function(posX)
{
	this.m_x = posX;
};
oFF.OcWidgetLayout.prototype.getY = function()
{
	return this.m_y;
};
oFF.OcWidgetLayout.prototype.setY = function(posY)
{
	this.m_y = posY;
};
oFF.OcWidgetLayout.prototype.getWidth = function()
{
	return this.m_width;
};
oFF.OcWidgetLayout.prototype.setWidth = function(width)
{
	this.m_width = width;
};
oFF.OcWidgetLayout.prototype.getHeight = function()
{
	return this.m_height;
};
oFF.OcWidgetLayout.prototype.setHeight = function(height)
{
	this.m_height = height;
};
oFF.OcWidgetLayout.prototype.isBackgroundWidget = function()
{
	return this.m_backgroundWidget;
};
oFF.OcWidgetLayout.prototype.setIsBackgroundWidget = function(isBackgroundWidget)
{
	this.m_backgroundWidget = isBackgroundWidget;
};
oFF.OcWidgetLayout.prototype.getBackgroundColor = function()
{
	return this.m_backgroundColor;
};
oFF.OcWidgetLayout.prototype.setBackgroundColor = function(backgroundColor)
{
	this.m_backgroundColor = backgroundColor;
};
oFF.OcWidgetLayout.prototype.getBorderColor = function()
{
	return this.m_borderColor;
};
oFF.OcWidgetLayout.prototype.setBorderColor = function(borderColor)
{
	this.m_borderColor = borderColor;
};
oFF.OcWidgetLayout.prototype.getBorderFormat = function()
{
	return this.m_borderFormat;
};
oFF.OcWidgetLayout.prototype.setBorderFormat = function(borderFormat)
{
	this.m_borderFormat = borderFormat;
};
oFF.OcWidgetLayout.prototype.getBorderStyle = function()
{
	return this.m_borderStyle;
};
oFF.OcWidgetLayout.prototype.setBorderStyle = function(borderStyle)
{
	this.m_borderStyle = borderStyle;
};
oFF.OcWidgetLayout.prototype.getBorderSize = function()
{
	return this.m_borderSize;
};
oFF.OcWidgetLayout.prototype.setBorderSize = function(borderSize)
{
	this.m_borderSize = borderSize;
};
oFF.OcWidgetLayout.prototype.getCornerRadius = function()
{
	return this.m_cornerRadius;
};
oFF.OcWidgetLayout.prototype.setCornerRadius = function(cornerRadius)
{
	this.m_cornerRadius = cornerRadius;
};
oFF.OcWidgetLayout.prototype.releaseObject = function()
{
	this.m_backgroundColor = null;
	this.m_borderColor = null;
	this.m_borderFormat = null;
	this.m_borderStyle = null;
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.OcWidgetManager = function() {};
oFF.OcWidgetManager.prototype = new oFF.XObject();
oFF.OcWidgetManager.prototype._ff_c = "OcWidgetManager";

oFF.OcWidgetManager.create = function(page, context)
{
	var widgetManager = new oFF.OcWidgetManager();
	widgetManager.setupWidgetManager(page, context);
	return widgetManager;
};
oFF.OcWidgetManager.prototype.m_widgetByWidgetIdMap = null;
oFF.OcWidgetManager.prototype.m_widgetIds = null;
oFF.OcWidgetManager.prototype.m_widgets = null;
oFF.OcWidgetManager.prototype.m_widgetsWithDataProvider = null;
oFF.OcWidgetManager.prototype.m_hasBackgroundImageWidget = null;
oFF.OcWidgetManager.prototype.m_backgroundImageWidget = null;
oFF.OcWidgetManager.prototype.setupWidgetManager = function(page, context)
{
	oFF.XObject.prototype.setup.call( this );
	this.m_widgetByWidgetIdMap = context.getStoryEntityFactory().createWidgetsOfPage(page);
};
oFF.OcWidgetManager.prototype.getWidgetById = function(widgetId)
{
	return this.getWidgetByWidgetIdMap().getByKey(widgetId);
};
oFF.OcWidgetManager.prototype.getWidgets = function()
{
	if (oFF.isNull(this.m_widgets))
	{
		this.m_widgets = this.getWidgetByWidgetIdMap().getValuesAsReadOnlyList();
	}
	return this.m_widgets;
};
oFF.OcWidgetManager.prototype.hasWidgets = function()
{
	return oFF.XCollectionUtils.hasElements(this.getWidgetByWidgetIdMap());
};
oFF.OcWidgetManager.prototype.getWidgetIds = function()
{
	if (oFF.isNull(this.m_widgetIds))
	{
		this.m_widgetIds = this.getWidgetByWidgetIdMap().getKeysAsReadOnlyListOfString();
	}
	return this.m_widgetIds;
};
oFF.OcWidgetManager.prototype.containsWidget = function(widgetId)
{
	return this.getWidgetByWidgetIdMap().containsKey(widgetId);
};
oFF.OcWidgetManager.prototype.getBackgroundImageWidget = function()
{
	if (oFF.isNull(this.m_hasBackgroundImageWidget))
	{
		this.m_backgroundImageWidget = this.processBackgroundImageWidget();
		this.m_hasBackgroundImageWidget = oFF.TriStateBool.lookup(oFF.notNull(this.m_backgroundImageWidget));
	}
	return this.m_backgroundImageWidget;
};
oFF.OcWidgetManager.prototype.getWigdetsWithDataProvider = function()
{
	if (oFF.isNull(this.m_widgetsWithDataProvider))
	{
		return this.m_widgetsWithDataProvider = this.processWidgetsWithDataProvider();
	}
	return this.m_widgetsWithDataProvider;
};
oFF.OcWidgetManager.prototype.processWidgetsWithDataProvider = function()
{
	var widgetsWithDataProvider = oFF.XList.create();
	var widgets = this.getWidgets();
	for (var i = 0; i < widgets.size(); i++)
	{
		var widget = widgets.get(i);
		if (widget.getWidgetType().hasDataProvider())
		{
			widgetsWithDataProvider.add(widget);
		}
	}
	return widgetsWithDataProvider;
};
oFF.OcWidgetManager.prototype.processBackgroundImageWidget = function()
{
	var widgets = this.getWidgets();
	for (var i = 0; i < widgets.size(); i++)
	{
		var widget = widgets.get(i);
		if (widget.getWidgetType() === oFF.OcWidgetType.IMAGE && widget.getLayout().isBackgroundWidget())
		{
			return widget;
		}
	}
	return null;
};
oFF.OcWidgetManager.prototype.getWidgetByWidgetIdMap = function()
{
	return this.m_widgetByWidgetIdMap;
};
oFF.OcWidgetManager.prototype.toString = function()
{
	if (oFF.isNull(this.m_widgetByWidgetIdMap))
	{
		return "Widgets not yet initialized";
	}
	var widgets = this.getWidgets();
	var sb = oFF.XStringBuffer.create();
	sb.append("Widgets: (").appendInt(widgets.size()).append(")");
	for (var i = 0; i < widgets.size(); i++)
	{
		var widget = widgets.get(i);
		sb.appendNewLine().appendInt(i + 1).append(". Widget: ").append(widget.getId()).append(" of type ").append(widget.getWidgetType().getName());
	}
	return sb.toString();
};
oFF.OcWidgetManager.prototype.releaseObject = function()
{
	this.m_backgroundImageWidget = null;
	this.m_hasBackgroundImageWidget = oFF.XObjectExt.release(this.m_hasBackgroundImageWidget);
	this.m_widgetIds = oFF.XObjectExt.release(this.m_widgetIds);
	this.m_widgets = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_widgets);
	this.m_widgetByWidgetIdMap = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_widgetByWidgetIdMap);
	this.m_widgetsWithDataProvider = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_widgetsWithDataProvider);
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.OcJsonPath = function() {};
oFF.OcJsonPath.prototype = new oFF.XObject();
oFF.OcJsonPath.prototype._ff_c = "OcJsonPath";

oFF.OcJsonPath.create = function(path)
{
	var jsonPath = new oFF.OcJsonPath();
	jsonPath.setup();
	jsonPath.m_pathElements = oFF.XListOfString.create();
	var pathElements = oFF.XStringTokenizer.splitString(path, ".");
	if (oFF.XCollectionUtils.hasElements(pathElements))
	{
		for (var i = 0; i < pathElements.size(); i++)
		{
			jsonPath.m_pathElements.add(pathElements.get(i));
		}
	}
	return jsonPath;
};
oFF.OcJsonPath.prototype.m_pathElements = null;
oFF.OcJsonPath.prototype.hasPathElements = function()
{
	return this.m_pathElements.hasElements();
};
oFF.OcJsonPath.prototype.size = function()
{
	return this.m_pathElements.size();
};
oFF.OcJsonPath.prototype.getPathElementAt = function(index)
{
	return this.m_pathElements.get(index);
};
oFF.OcJsonPath.prototype.releaseObject = function()
{
	this.m_pathElements = oFF.XObjectExt.release(this.m_pathElements);
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.OcJsonPath.prototype.toString = function()
{
	var sb = oFF.XStringBuffer.create();
	for (var i = 0; i < this.m_pathElements.size(); i++)
	{
		if (i > 0)
		{
			sb.append(".");
		}
		sb.append(this.m_pathElements.get(i));
	}
	return sb.toString();
};

oFF.OcJsonPathEvaluator = {

	getJsonPathElements:function(prElement, jsonPath)
	{
			return oFF.OcJsonPathEvaluator.getJsonPathElementsInternal(prElement, jsonPath, false);
	},
	getJsonPathElementsAsStrings:function(prElement, jsonPath)
	{
			var resultsAsPrElements = oFF.OcJsonPathEvaluator.getJsonPathElements(prElement, jsonPath);
		return oFF.OcJsonPathEvaluator.convertResultsToListOfString(resultsAsPrElements);
	},
	getJsonPathElementsAsStructures:function(prElement, jsonPath)
	{
			var resultsAsPrElements = oFF.OcJsonPathEvaluator.getJsonPathElements(prElement, jsonPath);
		return oFF.OcJsonPathEvaluator.convertResultsToListOfStructures(resultsAsPrElements);
	},
	getSingleJsonPathElement:function(prElement, jsonPath)
	{
			var results = oFF.OcJsonPathEvaluator.getJsonPathElementsInternal(prElement, jsonPath, true);
		if (!oFF.XCollectionUtils.hasElements(results))
		{
			return null;
		}
		if (results.size() !== 1)
		{
			throw oFF.XException.createIllegalArgumentException(oFF.XStringUtils.concatenate3("PrElement \"", jsonPath.getPathElementAt(0), "\" is not of cardinality 1"));
		}
		return results.get(0);
	},
	getSingleJsonPathElementAsString:function(prElement, jsonPath)
	{
			var result = oFF.OcJsonPathEvaluator.getSingleJsonPathElement(prElement, jsonPath);
		if (oFF.notNull(result) && result.isString())
		{
			return result.asString().getString();
		}
		return null;
	},
	getSingleJsonPathElementAsStructure:function(prElement, jsonPath)
	{
			var result = oFF.OcJsonPathEvaluator.getSingleJsonPathElement(prElement, jsonPath);
		if (oFF.notNull(result) && result.isStructure())
		{
			return result.asStructure();
		}
		return null;
	},
	getSingleJsonPathElementAsList:function(prElement, jsonPath)
	{
			var result = oFF.OcJsonPathEvaluator.getSingleJsonPathElement(prElement, jsonPath);
		if (oFF.notNull(result) && result.isList())
		{
			return result.asList();
		}
		return null;
	},
	getJsonPathElementsInternal:function(prElement, jsonPath, isSingleMode)
	{
			var results = oFF.XList.create();
		if (oFF.isNull(jsonPath) || !jsonPath.hasPathElements())
		{
			return results;
		}
		oFF.OcJsonPathEvaluator.getElementsAndAddToResults(prElement, jsonPath, 0, results, isSingleMode);
		return results;
	},
	getElementsAndAddToResults:function(prElement, jsonPath, pathIndex, results, isSingleMode)
	{
			if (oFF.isNull(prElement) || !jsonPath.hasPathElements())
		{
			return;
		}
		if (prElement.isStructure())
		{
			oFF.OcJsonPathEvaluator.processStructure(prElement.asStructure(), jsonPath, pathIndex, results, isSingleMode);
		}
		else if (prElement.isList())
		{
			if (isSingleMode)
			{
				throw oFF.XException.createIllegalArgumentException(oFF.XStringUtils.concatenate3("PrElement \"", jsonPath.getPathElementAt(pathIndex - 1), "\" is not of cardinality 1"));
			}
			oFF.OcJsonPathEvaluator.processList(prElement.asList(), jsonPath, pathIndex, results, isSingleMode);
		}
		else
		{
			return;
		}
	},
	processStructure:function(prStructure, jsonPath, pathIndex, results, isSingleMode)
	{
			var pathElement = jsonPath.getPathElementAt(pathIndex);
		var nextPrElement = prStructure.getByKey(pathElement);
		if (oFF.notNull(nextPrElement))
		{
			if (pathIndex === jsonPath.size() - 1)
			{
				results.add(nextPrElement);
			}
			else
			{
				oFF.OcJsonPathEvaluator.getElementsAndAddToResults(nextPrElement, jsonPath, pathIndex + 1, results, isSingleMode);
			}
		}
	},
	processList:function(prList, jsonPath, pathIndex, results, isSingleMode)
	{
			for (var i = 0; i < prList.size(); i++)
		{
			var prElement = prList.get(i);
			oFF.OcJsonPathEvaluator.getElementsAndAddToResults(prElement, jsonPath, pathIndex, results, isSingleMode);
		}
	},
	convertResultsToListOfString:function(resultsAsPrElements)
	{
			var results = oFF.XListOfString.create();
		if (!oFF.XCollectionUtils.hasElements(resultsAsPrElements))
		{
			return results;
		}
		for (var i = 0; i < resultsAsPrElements.size(); i++)
		{
			var resultAsPrElement = resultsAsPrElements.get(i);
			if (resultAsPrElement.isString())
			{
				var resultAsString = oFF.PrUtils.convertElementToStringValue(resultAsPrElement, null);
				if (oFF.XStringUtils.isNotNullAndNotEmpty(resultAsString))
				{
					results.add(resultAsString);
				}
			}
			else if (resultAsPrElement.isList())
			{
				var resultAsPrList = resultAsPrElement.asList();
				for (var j = 0; j < resultAsPrList.size(); j++)
				{
					var result = resultAsPrList.getStringAt(j);
					if (oFF.XStringUtils.isNotNullAndNotEmpty(result))
					{
						results.add(result);
					}
				}
			}
		}
		return results;
	},
	convertResultsToListOfStructures:function(resultsAsPrElements)
	{
			var results = oFF.XList.create();
		if (!oFF.XCollectionUtils.hasElements(resultsAsPrElements))
		{
			return results;
		}
		for (var i = 0; i < resultsAsPrElements.size(); i++)
		{
			var resultAsPrElement = resultsAsPrElements.get(i);
			if (oFF.isNull(resultAsPrElement))
			{
				continue;
			}
			if (resultAsPrElement.isStructure())
			{
				results.add(resultAsPrElement.asStructure());
			}
			else if (resultAsPrElement.isList())
			{
				var resultAsPrList = resultAsPrElement.asList();
				for (var j = 0; j < resultAsPrList.size(); j++)
				{
					var resultAsPrStructure = resultAsPrList.getStructureAt(j);
					if (oFF.notNull(resultAsPrStructure))
					{
						results.add(resultAsPrStructure);
					}
				}
			}
		}
		return results;
	}
};

oFF.OcMessage = {

	UNEXPECTED_ERROR:"An error is preventing the story to be displayed",
	INVALID_STORY_NAME:"The story does not have a valid id and name",
	INVALID_STORY:"The story is not valid",
	MODEL_NOT_FOUND:"No model metadata found for data source \"{0}\".",
	PAGE_WITH_MULTIPLE_LAYOUTS:"The page \"{0}\" has {1} layouts. Pages with multiple layout definitions are not supported.",
	WIDGET_WITHOUT_CONTENT:"The widget \"{0}\" of type \"{1}\" on page \"{2}\" does not have content.",
	WIDGET_WITHOUT_DATA_SOURCE:"The widget \"{0}\" of type \"{1}\" on page \"{2}\" does not have a valid data source.",
	GRID_WITHOUT_DEFINITION:"The grid \"{0}\" on page \"{1}\" does not have a valid definition.",
	GRID_WITHOUT_FIREFLY_QUERY:"The grid \"{0}\" on page \"{1}\" does not have a valid query definition.",
	CHART_WITHOUT_VIZ_DEF:"The chart \"{0}\" on page \"{1}\" does not have valid VizDef.",
	KPI_WITHOUT_VIZ_DEF:"The kpi \"{0}\" on page \"{1}\" does not have valid VizDef.",
	newUnexpectedError:function(throwable)
	{
			return oFF.OcMessage.createErrorMessageWithCause(oFF.OcMessage.UNEXPECTED_ERROR, oFF.XErrorHelper.convertExceptionToString(throwable));
	},
	newInvalidStoryNameError:function()
	{
			return oFF.OcMessage.createMessage(oFF.Severity.ERROR, oFF.ErrorCodes.ET_INVALID_VALUE, oFF.OcMessage.INVALID_STORY_NAME);
	},
	newInvalidStoryError:function()
	{
			return oFF.OcMessage.createMessage(oFF.Severity.ERROR, oFF.ErrorCodes.ET_INVALID_VALUE, oFF.OcMessage.INVALID_STORY);
	},
	newDataSourceNotFound:function(severity, dataSourceName)
	{
			var text = oFF.OcMessage.createTextWithSingleArgument(oFF.OcMessage.MODEL_NOT_FOUND, dataSourceName);
		return oFF.OcMessage.createMessage(severity, oFF.ErrorCodes.ET_INVALID_VALUE, text);
	},
	newPageWithMultipleLayouts:function(severity, page, numberOfLayouts)
	{
			var text = oFF.OcMessage.createTextWithTwoArguments(oFF.OcMessage.PAGE_WITH_MULTIPLE_LAYOUTS, page.getName(), oFF.XInteger.convertToString(numberOfLayouts));
		return oFF.OcMessage.createMessage(severity, oFF.ErrorCodes.ET_INVALID_VALUE, text);
	},
	newWidgetWithoutContent:function(severity, widget)
	{
			var text = oFF.OcMessage.createTextWithThreeArguments(oFF.OcMessage.WIDGET_WITHOUT_CONTENT, widget.getId(), widget.getWidgetType().getName(), widget.getPage().getName());
		return oFF.OcMessage.createMessage(severity, oFF.ErrorCodes.ET_INVALID_VALUE, text);
	},
	newWidgetWithoutDatasource:function(severity, widget)
	{
			var text = oFF.OcMessage.createTextWithThreeArguments(oFF.OcMessage.WIDGET_WITHOUT_DATA_SOURCE, widget.getId(), widget.getWidgetType().getName(), widget.getPage().getName());
		return oFF.OcMessage.createMessage(severity, oFF.ErrorCodes.ET_INVALID_VALUE, text);
	},
	newGridWithoutDefinition:function(severity, widget)
	{
			var text = oFF.OcMessage.createTextWithTwoArguments(oFF.OcMessage.GRID_WITHOUT_DEFINITION, widget.getId(), widget.getPage().getName());
		return oFF.OcMessage.createMessage(severity, oFF.ErrorCodes.ET_INVALID_VALUE, text);
	},
	newGridWithoutQuery:function(severity, widget)
	{
			var text = oFF.OcMessage.createTextWithTwoArguments(oFF.OcMessage.GRID_WITHOUT_FIREFLY_QUERY, widget.getId(), widget.getPage().getName());
		return oFF.OcMessage.createMessage(severity, oFF.ErrorCodes.ET_INVALID_VALUE, text);
	},
	newChartWithoutVizDef:function(severity, widget)
	{
			var text = oFF.OcMessage.createTextWithTwoArguments(oFF.OcMessage.CHART_WITHOUT_VIZ_DEF, widget.getId(), widget.getPage().getName());
		return oFF.OcMessage.createMessage(severity, oFF.ErrorCodes.ET_INVALID_VALUE, text);
	},
	newKpiWithoutVizDef:function(severity, widget)
	{
			var text = oFF.OcMessage.createTextWithTwoArguments(oFF.OcMessage.KPI_WITHOUT_VIZ_DEF, widget.getId(), widget.getPage().getName());
		return oFF.OcMessage.createMessage(severity, oFF.ErrorCodes.ET_INVALID_VALUE, text);
	},
	createMessage:function(severity, code, text)
	{
			return oFF.XMessage.createMessage(oFF.OriginLayer.APPLICATION, severity, code, text, null, false, null);
	},
	createErrorMessageWithCause:function(text, errorCauseText)
	{
			var errorCause = oFF.XMessage.createError(oFF.OriginLayer.APPLICATION, errorCauseText, null, false, null);
		return oFF.XMessage.createError(oFF.OriginLayer.APPLICATION, text, errorCause, false, null);
	},
	createTextWithSingleArgument:function(message, argument)
	{
			return oFF.XString.replace(message, "{0}", argument);
	},
	createTextWithTwoArguments:function(message, argument1, argument2)
	{
			return oFF.XString.replace(oFF.OcMessage.createTextWithSingleArgument(message, argument1), "{1}", argument2);
	},
	createTextWithThreeArguments:function(message, argument1, argument2, argument3)
	{
			return oFF.XString.replace(oFF.OcMessage.createTextWithTwoArguments(message, argument1, argument2), "{2}", argument3);
	}
};

oFF.OcStoryUtils = {

	normalizeString:function(name)
	{
			var normalizedString = name;
		if (oFF.XStringUtils.isNotNullAndNotEmpty(normalizedString))
		{
			normalizedString = oFF.XString.replace(normalizedString, " ", "_");
			normalizedString = oFF.XString.replace(normalizedString, ",", "_");
			normalizedString = oFF.XString.replace(normalizedString, " ", "_");
			normalizedString = oFF.XString.replace(normalizedString, "-", "_");
			normalizedString = oFF.XString.replace(normalizedString, ".", "");
			normalizedString = oFF.XString.replace(normalizedString, "\\", "_");
			normalizedString = oFF.XString.replace(normalizedString, "/", "_");
			normalizedString = oFF.XString.replace(normalizedString, "(", "_");
			normalizedString = oFF.XString.replace(normalizedString, ")", "_");
			normalizedString = oFF.XString.replace(normalizedString, "+", "_");
			normalizedString = oFF.XString.replace(normalizedString, ":", "_");
			normalizedString = oFF.XString.replace(normalizedString, "<", "_");
			normalizedString = oFF.XString.replace(normalizedString, ">", "_");
			normalizedString = oFF.XString.toLowerCase(normalizedString);
		}
		return normalizedString;
	},
	addIntegerGtZeroToStructure:function(name, value, structure)
	{
			if (value > 0)
		{
			structure.putInteger(name, value);
		}
	},
	getIntegerFromStructureByName:function(structure, name)
	{
			if (oFF.isNull(structure))
		{
			return 0;
		}
		var element = structure.getByKey(name);
		if (oFF.isNull(element))
		{
			return 0;
		}
		var elementAsInt = oFF.PrUtils.convertElementToInteger(element);
		if (oFF.isNull(elementAsInt))
		{
			return 0;
		}
		return elementAsInt.getInteger();
	},
	getValueOrEmptyString:function(value)
	{
			return oFF.isNull(value) ? "" : value;
	}
};

oFF.OcOrcaDatasets = function() {};
oFF.OcOrcaDatasets.prototype = new oFF.OcDatasets();
oFF.OcOrcaDatasets.prototype._ff_c = "OcOrcaDatasets";

oFF.OcOrcaDatasets.create = function(context)
{
	var datasets = new oFF.OcOrcaDatasets();
	datasets.setupOrcaDatasets(context);
	return datasets;
};
oFF.OcOrcaDatasets.prototype.m_orcaContext = null;
oFF.OcOrcaDatasets.prototype.setupOrcaDatasets = function(context)
{
	oFF.OcDatasets.prototype.setupDatasets.call( this , context);
	this.m_orcaContext = context;
};
oFF.OcOrcaDatasets.prototype.processDatasets = function()
{
	var datasets = oFF.XHashMapByString.create();
	this.addDatasetsOfDatasetEntities(datasets);
	this.addDatasetsOfGridWidgets(datasets);
	return datasets;
};
oFF.OcOrcaDatasets.prototype.addDatasetsOfDatasetEntities = function(datasets)
{
	var datasetsJson = this.getStoryEntityHelper().getEntitiesAsJsonByEntityType(oFF.OcOrcaConstants.STORY_ENTITY_DATASET);
	var it = datasetsJson.getIterator();
	while (it.hasNext())
	{
		var datasetJson = it.next();
		var datasource = datasetJson.getStringByKey(oFF.OcOrcaConstants.ID_ELEMENT);
		if (oFF.isNull(datasource))
		{
			continue;
		}
		var modelId = oFF.OcJsonPathEvaluator.getSingleJsonPathElementAsString(datasetJson, oFF.OcOrcaConstants.PATH_FROM_DATASET_TO_MODEL_ID);
		var dataset = this.getDatasetFromDatasourceAndModel(datasource, modelId);
		if (oFF.notNull(dataset))
		{
			dataset.setVariables(oFF.OcJsonPathEvaluator.getSingleJsonPathElementAsList(datasetJson, oFF.OcOrcaConstants.PATH_FROM_DATASET_TO_VARIABLE));
			datasets.put(datasource, dataset);
		}
	}
};
oFF.OcOrcaDatasets.prototype.addDatasetsOfGridWidgets = function(datasets)
{
	var gridDefintions = this.getStoryEntityHelper().getGridDefinitions();
	for (var i = 0; i < gridDefintions.size(); i++)
	{
		var datasource = gridDefintions.get(i).getDatasource();
		if (datasets.containsKey(datasource))
		{
			continue;
		}
		var dataset = this.getDatasetFromDatasourceAndModel(datasource, null);
		if (oFF.notNull(dataset))
		{
			datasets.put(datasource, dataset);
		}
	}
};
oFF.OcOrcaDatasets.prototype.getDatasetFromDatasourceAndModel = function(datasource, baseModelId)
{
	if (oFF.isNull(datasource))
	{
		return null;
	}
	var modelId = baseModelId;
	if (oFF.isNull(modelId))
	{
		var tokens = oFF.XStringTokenizer.splitString(datasource, "[");
		var viewNameWithBrak = tokens.get(tokens.size() - 1);
		var splitedString = oFF.XStringTokenizer.splitString(viewNameWithBrak, "]");
		modelId = splitedString.get(0);
	}
	var cubeName = null;
	var viewTokens = oFF.XStringTokenizer.splitString(datasource, ":");
	var viewType = viewTokens.get(0);
	if (oFF.XString.isEqual(viewType, oFF.OcOrcaConstants.CUBE_DATA_SOURCE_TYPE_PLANNING))
	{
		var datasetId = viewTokens.get(1);
		var idElements = oFF.XStringTokenizer.splitString(datasetId, "[");
		var packageCubeName = idElements.get(idElements.size() - 1);
		packageCubeName = oFF.XString.substring(packageCubeName, 0, oFF.XString.size(packageCubeName) - 1);
		var refString = oFF.XString.substring(packageCubeName, 0, 1);
		if (oFF.XString.isEqual(refString, "/"))
		{
			packageCubeName = oFF.XString.substring(packageCubeName, 1, oFF.XString.size(packageCubeName));
			var cubeIdSplitString = oFF.XStringTokenizer.splitString(packageCubeName, "/");
			var packageId = cubeIdSplitString.get(0);
			var cubeRef = cubeIdSplitString.get(1);
			cubeRef = oFF.XString.replace(cubeRef, "_qs_changed", "");
			cubeRef = oFF.XString.replace(cubeRef, "_qs", "");
			packageCubeName = oFF.XStringUtils.concatenate3(packageId, ":", cubeRef);
		}
		cubeName = oFF.XStringUtils.concatenate3(oFF.OcOrcaConstants.CUBE, ":", packageCubeName);
	}
	else if (oFF.XString.isEqual(viewType, oFF.OcOrcaConstants.CUBE_DATA_SOURCE_TYPE_VIEW))
	{
		var datasetId1 = viewTokens.get(1);
		var idElements1 = oFF.XStringTokenizer.splitString(datasetId1, "[");
		var packageName = idElements1.get(2);
		packageName = oFF.XString.substring(packageName, 0, oFF.XString.size(packageName) - 1);
		var cubeName1 = idElements1.get(idElements1.size() - 1);
		cubeName1 = oFF.XString.substring(cubeName1, 0, oFF.XString.size(cubeName1) - 1);
		cubeName = oFF.XStringUtils.concatenate5(oFF.OcOrcaConstants.CUBE, ":", packageName, ":", cubeName1);
	}
	var dataset = oFF.OcDataset.create(datasource, modelId);
	if (oFF.notNull(cubeName))
	{
		dataset.setCubeName(cubeName);
	}
	return dataset;
};
oFF.OcOrcaDatasets.prototype.getStoryEntityHelper = function()
{
	return this.getOrcaContext().getStoryEntityHelper();
};
oFF.OcOrcaDatasets.prototype.getOrcaContext = function()
{
	return this.m_orcaContext;
};
oFF.OcOrcaDatasets.prototype.releaseObject = function()
{
	this.m_orcaContext = null;
	oFF.OcDatasets.prototype.releaseObject.call( this );
};

oFF.OcOrcaImages = function() {};
oFF.OcOrcaImages.prototype = new oFF.OcImages();
oFF.OcOrcaImages.prototype._ff_c = "OcOrcaImages";

oFF.OcOrcaImages.create = function(storyId, orcaContext)
{
	var images = new oFF.OcOrcaImages();
	images.setupImages(storyId, orcaContext);
	images.m_orcaContext = orcaContext;
	return images;
};
oFF.OcOrcaImages.prototype.m_orcaContext = null;
oFF.OcOrcaImages.prototype.processImages = function()
{
	var images = oFF.XHashMapByString.create();
	var imagesJson = this.getStoryEntityHelper().getEntitiesAsJsonByEntityType(oFF.OcOrcaConstants.STORY_ENTITY_IMAGE);
	for (var i = 0; i < imagesJson.size(); i++)
	{
		var imageJson = imagesJson.get(i);
		var imageId = imageJson.getStringByKey(oFF.OcOrcaConstants.ID_ELEMENT);
		if (oFF.XStringUtils.isNotNullAndNotEmpty(imageId))
		{
			var image = oFF.OcImage.create(imageId);
			image.setImageData(oFF.OcJsonPathEvaluator.getSingleJsonPathElementAsString(imageJson, oFF.OcOrcaConstants.PATH_FROM_IMAGE_TO_IMAGE_DATA));
			image.setThumbnail(oFF.OcJsonPathEvaluator.getSingleJsonPathElementAsString(imageJson, oFF.OcOrcaConstants.PATH_FROM_IMAGE_TO_IMAGE_THUMBNAIL));
			images.put(imageId, image);
		}
	}
	return images;
};
oFF.OcOrcaImages.prototype.getStoryEntityHelper = function()
{
	return this.getOrcaContext().getStoryEntityHelper();
};
oFF.OcOrcaImages.prototype.getOrcaContext = function()
{
	return this.m_orcaContext;
};
oFF.OcOrcaImages.prototype.releaseObject = function()
{
	this.m_orcaContext = null;
	oFF.OcImages.prototype.releaseObject.call( this );
};

oFF.OcOrcaGridDefinition = function() {};
oFF.OcOrcaGridDefinition.prototype = new oFF.DfIdObject();
oFF.OcOrcaGridDefinition.prototype._ff_c = "OcOrcaGridDefinition";

oFF.OcOrcaGridDefinition.create = function(gridId, gridJson)
{
	var grid = new oFF.OcOrcaGridDefinition();
	grid.setupGrid(gridId, gridJson);
	return grid;
};
oFF.OcOrcaGridDefinition.prototype.m_gridJson = null;
oFF.OcOrcaGridDefinition.prototype.m_datasource = null;
oFF.OcOrcaGridDefinition.prototype.setupGrid = function(gridId, gridJson)
{
	this.setupExt(gridId);
	this.m_gridJson = gridJson;
};
oFF.OcOrcaGridDefinition.prototype.getDatasource = function()
{
	if (oFF.isNull(this.m_datasource))
	{
		this.m_datasource = oFF.OcStoryUtils.getValueOrEmptyString(oFF.OcJsonPathEvaluator.getSingleJsonPathElementAsString(this.getGridJson(), oFF.OcOrcaConstants.PATH_FROM_GRID_DATA_DEFINITION_TO_DATASOURCE));
	}
	return this.m_datasource;
};
oFF.OcOrcaGridDefinition.prototype.getFireflyQuery = function()
{
	return this.getGridJson().getStringByKey(oFF.OcOrcaConstants.WIDGET_FIREFLY_QUERY);
};
oFF.OcOrcaGridDefinition.prototype.getGridJson = function()
{
	return this.m_gridJson;
};
oFF.OcOrcaGridDefinition.prototype.releaseObject = function()
{
	this.m_gridJson = null;
	this.m_datasource = null;
	oFF.DfIdObject.prototype.releaseObject.call( this );
};

oFF.OcDataset = function() {};
oFF.OcDataset.prototype = new oFF.XObject();
oFF.OcDataset.prototype._ff_c = "OcDataset";

oFF.OcDataset.create = function(datasource, modelId)
{
	var dataset = new oFF.OcDataset();
	dataset.setupDataset(datasource, modelId);
	return dataset;
};
oFF.OcDataset.prototype.m_datasource = null;
oFF.OcDataset.prototype.m_modelId = null;
oFF.OcDataset.prototype.m_cubeName = null;
oFF.OcDataset.prototype.m_systemName = null;
oFF.OcDataset.prototype.m_formulaAliases = null;
oFF.OcDataset.prototype.m_memberDefinitions = null;
oFF.OcDataset.prototype.m_variables = null;
oFF.OcDataset.prototype.setupDataset = function(datasource, modelId)
{
	oFF.XObject.prototype.setup.call( this );
	this.m_datasource = datasource;
	this.m_modelId = modelId;
};
oFF.OcDataset.prototype.getModelId = function()
{
	return this.m_modelId;
};
oFF.OcDataset.prototype.getVariables = function()
{
	return this.m_variables;
};
oFF.OcDataset.prototype.setVariables = function(variables)
{
	this.m_variables = variables;
};
oFF.OcDataset.prototype.getDatasource = function()
{
	return this.m_datasource;
};
oFF.OcDataset.prototype.setDatasource = function(datasource)
{
	this.m_datasource = datasource;
};
oFF.OcDataset.prototype.getCubeName = function()
{
	return this.m_cubeName;
};
oFF.OcDataset.prototype.setCubeName = function(cubeName)
{
	this.m_cubeName = cubeName;
};
oFF.OcDataset.prototype.getSystemName = function()
{
	return this.m_systemName;
};
oFF.OcDataset.prototype.setSystemName = function(system)
{
	this.m_systemName = system;
};
oFF.OcDataset.prototype.getFormulaAliases = function()
{
	return this.m_formulaAliases;
};
oFF.OcDataset.prototype.setFormulaAliases = function(formulaAliases)
{
	this.m_formulaAliases = formulaAliases;
};
oFF.OcDataset.prototype.getMemberDefinitions = function()
{
	return this.m_memberDefinitions;
};
oFF.OcDataset.prototype.setMemberDefinitions = function(memberDefinitions)
{
	this.m_memberDefinitions = memberDefinitions;
};
oFF.OcDataset.prototype.toString = function()
{
	var sb = oFF.XStringBuffer.create();
	sb.append("Dataset:").appendNewLine().append(" Datasource = ").append(this.getDatasource());
	sb.appendNewLine().append(" Model Id = ").append(this.getModelId());
	sb.appendNewLine().append(" Cube = ").append(this.getCubeName());
	return sb.toString();
};
oFF.OcDataset.prototype.releaseObject = function()
{
	this.m_datasource = null;
	this.m_modelId = null;
	this.m_cubeName = null;
	this.m_systemName = null;
	this.m_formulaAliases = null;
	this.m_memberDefinitions = null;
	this.m_variables = null;
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.OcImage = function() {};
oFF.OcImage.prototype = new oFF.DfIdObject();
oFF.OcImage.prototype._ff_c = "OcImage";

oFF.OcImage.create = function(imageId)
{
	var image = new oFF.OcImage();
	image.setupImage(imageId);
	return image;
};
oFF.OcImage.prototype.m_imageData = null;
oFF.OcImage.prototype.m_thumbnail = null;
oFF.OcImage.prototype.setupImage = function(imageId)
{
	this.setupExt(imageId);
};
oFF.OcImage.prototype.hasImageData = function()
{
	return this.getImageData() !== null;
};
oFF.OcImage.prototype.getImageData = function()
{
	return this.m_imageData;
};
oFF.OcImage.prototype.setImageData = function(imageData)
{
	this.m_imageData = imageData;
};
oFF.OcImage.prototype.getThumbnail = function()
{
	return this.m_thumbnail;
};
oFF.OcImage.prototype.setThumbnail = function(thumbnail)
{
	this.m_thumbnail = thumbnail;
};
oFF.OcImage.prototype.releaseObject = function()
{
	this.m_imageData = null;
	this.m_thumbnail = null;
	oFF.DfIdObject.prototype.releaseObject.call( this );
};

oFF.OcWidget = function() {};
oFF.OcWidget.prototype = new oFF.DfIdObject();
oFF.OcWidget.prototype._ff_c = "OcWidget";

oFF.OcWidget.prototype.m_widgetType = null;
oFF.OcWidget.prototype.m_dataReferenceId = null;
oFF.OcWidget.prototype.m_normalizedDataReferenceId = null;
oFF.OcWidget.prototype.m_layout = null;
oFF.OcWidget.prototype.m_page = null;
oFF.OcWidget.prototype.setupWidget = function(widgetId, widgetType, page)
{
	oFF.DfIdObject.prototype.setupExt.call( this , widgetId);
	this.m_widgetType = widgetType;
	this.m_page = page;
};
oFF.OcWidget.prototype.getWidgetType = function()
{
	return this.m_widgetType;
};
oFF.OcWidget.prototype.getDataReferenceId = function()
{
	if (oFF.isNull(this.m_dataReferenceId))
	{
		this.m_dataReferenceId = oFF.OcStoryUtils.getValueOrEmptyString(this.processDataReferenceId());
	}
	return this.m_dataReferenceId;
};
oFF.OcWidget.prototype.getNormalizedDataReferenceId = function()
{
	if (oFF.isNull(this.m_normalizedDataReferenceId))
	{
		this.m_normalizedDataReferenceId = oFF.OcStoryUtils.normalizeString(this.getDataReferenceId());
	}
	return this.m_normalizedDataReferenceId;
};
oFF.OcWidget.prototype.getQuasarName = function(quasarOptions)
{
	return this.m_widgetType.getQuasarName();
};
oFF.OcWidget.prototype.getLayout = function()
{
	if (oFF.isNull(this.m_layout))
	{
		this.m_layout = this.processLayout();
		if (oFF.isNull(this.m_layout))
		{
			this.m_layout = new oFF.OcWidgetLayout();
		}
	}
	return this.m_layout;
};
oFF.OcWidget.prototype.getStory = function()
{
	return this.getPage().getStory();
};
oFF.OcWidget.prototype.getPage = function()
{
	return this.m_page;
};
oFF.OcWidget.prototype.getContext = function()
{
	return this.getPage().getContext();
};
oFF.OcWidget.prototype.toString = function()
{
	var widgetType = this.getWidgetType();
	var sb = oFF.XStringBuffer.create();
	sb.append("Widget: ").append(this.getId()).appendNewLine().append(" Type = ").append(widgetType.getName());
	sb.appendNewLine().append(" Page = ").append(this.getPage().getName());
	var dataReferenceId = this.getDataReferenceId();
	if (oFF.XStringUtils.isNotNullAndNotEmpty(dataReferenceId))
	{
		sb.appendNewLine().append(" Data Reference id = ").append(dataReferenceId);
	}
	return sb.toString();
};
oFF.OcWidget.prototype.releaseObject = function()
{
	this.m_dataReferenceId = null;
	this.m_normalizedDataReferenceId = null;
	this.m_page = null;
	oFF.XObjectExt.release(this.m_layout);
	oFF.DfIdObject.prototype.releaseObject.call( this );
};

oFF.OcConnection = function() {};
oFF.OcConnection.prototype = new oFF.XObject();
oFF.OcConnection.prototype._ff_c = "OcConnection";

oFF.OcConnection.createByConnection = function(connectionContainer)
{
	var connection = new oFF.OcConnection();
	connection.setupConnection(connectionContainer);
	return connection;
};
oFF.OcConnection.prototype.m_systemName = null;
oFF.OcConnection.prototype.m_tenantId = null;
oFF.OcConnection.prototype.m_systemUri = null;
oFF.OcConnection.prototype.m_publicUrl = null;
oFF.OcConnection.prototype.setupConnection = function(connectionContainer)
{
	this.setup();
	if (oFF.notNull(connectionContainer))
	{
		var systemDescription = connectionContainer.getSystemDescription();
		if (oFF.notNull(systemDescription))
		{
			this.m_systemName = systemDescription.getSystemName();
			this.m_systemUri = systemDescription.getUrlExt(true, true, false, false, false, true, true, true, true);
		}
		this.m_tenantId = connectionContainer.getPersonalization().getTenantId();
		this.m_publicUrl = connectionContainer.getSystemConnect().getServerMetadata().getOrcaPublicUrl();
	}
};
oFF.OcConnection.prototype.getSystemName = function()
{
	return this.m_systemName;
};
oFF.OcConnection.prototype.getSystemUri = function()
{
	return this.m_systemUri;
};
oFF.OcConnection.prototype.getTenantId = function()
{
	return this.m_tenantId;
};
oFF.OcConnection.prototype.getOrcaPublicUrl = function()
{
	return this.m_publicUrl;
};

oFF.OcOrcaBaseWidget = function() {};
oFF.OcOrcaBaseWidget.prototype = new oFF.OcWidget();
oFF.OcOrcaBaseWidget.prototype._ff_c = "OcOrcaBaseWidget";

oFF.OcOrcaBaseWidget.prototype.m_widgetJson = null;
oFF.OcOrcaBaseWidget.prototype.m_orcaPage = null;
oFF.OcOrcaBaseWidget.prototype.setupOrcaBaseWidget = function(widgetId, widgetType, widgetJson, orcaPage)
{
	oFF.OcWidget.prototype.setupWidget.call( this , widgetId, widgetType, orcaPage);
	this.m_orcaPage = orcaPage;
	this.m_widgetJson = widgetJson;
};
oFF.OcOrcaBaseWidget.prototype.processDataReferenceId = function()
{
	return oFF.OcJsonPathEvaluator.getSingleJsonPathElementAsString(this.getWidgetJson(), oFF.OcOrcaConstants.PATH_FROM_WIDGET_TO_DATA_REFERENCE_ID);
};
oFF.OcOrcaBaseWidget.prototype.getWidgetJson = function()
{
	return this.m_widgetJson;
};
oFF.OcOrcaBaseWidget.prototype.getOrcaStory = function()
{
	return this.getOrcaPage().getOrcaStory();
};
oFF.OcOrcaBaseWidget.prototype.getOrcaPage = function()
{
	return this.m_orcaPage;
};
oFF.OcOrcaBaseWidget.prototype.getOrcaContext = function()
{
	return this.getOrcaStory().getOrcaContext();
};
oFF.OcOrcaBaseWidget.prototype.processLayout = function()
{
	if (this.getPageLayout().hasCanvasLayout())
	{
		return this.processCanvasLayout();
	}
	else if (this.getPage().isResponsive())
	{
		return this.processResponsivePageLayout();
	}
	return null;
};
oFF.OcOrcaBaseWidget.prototype.processCanvasLayout = function()
{
	var widgetLayout = new oFF.OcWidgetLayout();
	var pageLayout = this.getPageLayout();
	var sectionLayoutJson = pageLayout.getSectionLayoutJsonByWidgetId(this.getId());
	if (oFF.notNull(sectionLayoutJson))
	{
		widgetLayout.setX(oFF.OcStoryUtils.getIntegerFromStructureByName(sectionLayoutJson, oFF.OcOrcaConstants.WIDGET_POS_X));
		widgetLayout.setY(oFF.OcStoryUtils.getIntegerFromStructureByName(sectionLayoutJson, oFF.OcOrcaConstants.WIDGET_POS_Y));
		var widgetHeight = oFF.OcStoryUtils.getIntegerFromStructureByName(sectionLayoutJson, oFF.OcOrcaConstants.WIDGET_HEIGHT);
		var widgetWidth = oFF.OcStoryUtils.getIntegerFromStructureByName(sectionLayoutJson, oFF.OcOrcaConstants.WIDGET_WIDTH);
		widgetLayout.setHeight(widgetHeight);
		widgetLayout.setIsBackgroundWidget(this.processIsBackgroundWidget(widgetHeight, widgetWidth));
	}
	var widgetLayoutJson = pageLayout.getWidgetLayoutJsonByWidgetId(this.getId());
	if (oFF.notNull(widgetLayoutJson))
	{
		this.addBorderDefinition(widgetLayout, widgetLayoutJson);
		widgetLayout.setBackgroundColor(widgetLayoutJson.getStringByKey(oFF.OcOrcaConstants.WIDGET_BACKGROUND_COLOR));
		var xPos = widgetLayout.getX() + oFF.OcStoryUtils.getIntegerFromStructureByName(widgetLayoutJson, oFF.OcOrcaConstants.WIDGET_POS_X);
		widgetLayout.setX(xPos);
		var yPos = widgetLayout.getY() + oFF.OcStoryUtils.getIntegerFromStructureByName(widgetLayoutJson, oFF.OcOrcaConstants.WIDGET_POS_Y);
		widgetLayout.setY(yPos);
		widgetLayout.setWidth(oFF.OcStoryUtils.getIntegerFromStructureByName(widgetLayoutJson, oFF.OcOrcaConstants.WIDGET_WIDTH));
		widgetLayout.setHeight(oFF.OcStoryUtils.getIntegerFromStructureByName(widgetLayoutJson, oFF.OcOrcaConstants.WIDGET_HEIGHT));
	}
	return widgetLayout;
};
oFF.OcOrcaBaseWidget.prototype.processResponsivePageLayout = function()
{
	var widgetLayout = new oFF.OcWidgetLayout();
	var laneLayoutJson = this.getPageLayout().getLaneLayoutJsonByWidgetId(this.getId());
	if (oFF.notNull(laneLayoutJson))
	{
		this.addBorderDefinition(widgetLayout, laneLayoutJson);
	}
	widgetLayout.setIsBackgroundWidget(false);
	return widgetLayout;
};
oFF.OcOrcaBaseWidget.prototype.addBorderDefinition = function(widgetLayout, layoutJson)
{
	var borderJson = layoutJson.getStructureByKey(oFF.OcOrcaConstants.WIDGET_BORDER);
	if (oFF.isNull(borderJson))
	{
		return;
	}
	widgetLayout.setBorderColor(borderJson.getStringByKey(oFF.OcOrcaConstants.WIDGET_BORDER_COLOR));
	widgetLayout.setBorderFormat(borderJson.getStringByKey(oFF.OcOrcaConstants.WIDGET_BORDER_FORMAT));
	widgetLayout.setBorderSize(oFF.OcStoryUtils.getIntegerFromStructureByName(borderJson, oFF.OcOrcaConstants.WIDGET_BORDER_THICKNESS));
	widgetLayout.setBorderStyle(borderJson.getStringByKey(oFF.OcOrcaConstants.WIDGET_BORDER_STYLE));
	widgetLayout.setCornerRadius(oFF.OcStoryUtils.getIntegerFromStructureByName(borderJson, oFF.OcOrcaConstants.WIDGET_BORDER_RADIUS));
};
oFF.OcOrcaBaseWidget.prototype.processIsBackgroundWidget = function(widgetHeight, widgetWidth)
{
	var pageLayoutJson = this.getPageLayout().getPageLayoutJson();
	var widgetLayoutJson = oFF.OcJsonPathEvaluator.getSingleJsonPathElementAsStructure(pageLayoutJson, oFF.OcOrcaConstants.PATH_FROM_WIDGET_TO_LAYOUT_DEFINITION);
	var pageHeight = oFF.OcStoryUtils.getIntegerFromStructureByName(widgetLayoutJson, oFF.OcOrcaConstants.WIDGET_HEIGHT);
	var pageWidth = oFF.OcStoryUtils.getIntegerFromStructureByName(widgetLayoutJson, oFF.OcOrcaConstants.WIDGET_WIDTH);
	var isBackgroundWidget = widgetHeight > 0 && widgetHeight === pageHeight && widgetWidth > 0 && widgetWidth === pageWidth;
	return isBackgroundWidget;
};
oFF.OcOrcaBaseWidget.prototype.getPageLayout = function()
{
	return this.getOrcaPage().getPageLayout();
};
oFF.OcOrcaBaseWidget.prototype.releaseObject = function()
{
	this.m_orcaPage = null;
	this.m_widgetJson = null;
	oFF.OcWidget.prototype.releaseObject.call( this );
};

oFF.OcOrcaGridWidget = function() {};
oFF.OcOrcaGridWidget.prototype = new oFF.OcOrcaBaseWidget();
oFF.OcOrcaGridWidget.prototype._ff_c = "OcOrcaGridWidget";

oFF.OcOrcaGridWidget.create = function(widgetId, widgetJson, orcaPage)
{
	var widget = new oFF.OcOrcaGridWidget();
	widget.setupOrcaBaseWidget(widgetId, oFF.OcWidgetType.GRID, widgetJson, orcaPage);
	return widget;
};
oFF.OcOrcaGridWidget.prototype.m_fireflyQuery = null;
oFF.OcOrcaGridWidget.prototype.m_datasets = null;
oFF.OcOrcaGridWidget.prototype.m_hasGridDefinition = null;
oFF.OcOrcaGridWidget.prototype.m_gridDefinition = null;
oFF.OcOrcaGridWidget.prototype.getFireflyQuery = function()
{
	if (oFF.isNull(this.m_fireflyQuery))
	{
		var gridDefinition = this.getGridDefinition();
		if (oFF.isNull(gridDefinition))
		{
			this.m_fireflyQuery = "";
		}
		else
		{
			this.m_fireflyQuery = oFF.OcStoryUtils.getValueOrEmptyString(gridDefinition.getFireflyQuery());
			if (oFF.XStringUtils.isNullOrEmpty(this.m_fireflyQuery))
			{
				this.getContext().getMessageManager().addMessage(oFF.OcMessage.newGridWithoutQuery(oFF.Severity.WARNING, this));
			}
		}
	}
	return this.m_fireflyQuery;
};
oFF.OcOrcaGridWidget.prototype.getDatasets = function()
{
	if (oFF.notNull(this.m_datasets))
	{
		return this.m_datasets;
	}
	this.m_datasets = oFF.XList.create();
	var gridDefinition = this.getGridDefinition();
	if (oFF.isNull(gridDefinition))
	{
		return this.m_datasets;
	}
	var gridDatasource = gridDefinition.getDatasource();
	if (oFF.XStringUtils.isNotNullAndNotEmpty(gridDatasource))
	{
		var gridDataset = this.getStory().getDatasets().getDatasetByDatasource(gridDatasource);
		if (oFF.notNull(gridDataset))
		{
			this.m_datasets.add(gridDataset);
		}
	}
	if (!this.m_datasets.hasElements())
	{
		this.getContext().getMessageManager().addMessage(oFF.OcMessage.newWidgetWithoutDatasource(oFF.Severity.WARNING, this));
	}
	return this.m_datasets;
};
oFF.OcOrcaGridWidget.prototype.getGridDefinition = function()
{
	if (oFF.isNull(this.m_hasGridDefinition))
	{
		this.m_gridDefinition = this.getOrcaContext().getStoryEntityHelper().getGridDefinitionByGridId(this.getDataReferenceId());
		this.m_hasGridDefinition = oFF.TriStateBool.lookup(oFF.notNull(this.m_gridDefinition));
		if (!this.m_hasGridDefinition.getBoolean())
		{
			this.getContext().getMessageManager().addMessage(oFF.OcMessage.newGridWithoutDefinition(oFF.Severity.WARNING, this));
		}
	}
	return this.m_gridDefinition;
};
oFF.OcOrcaGridWidget.prototype.toString = function()
{
	var sb = oFF.XStringBuffer.create();
	sb.append(oFF.OcOrcaBaseWidget.prototype.toString.call( this ));
	var fireflyQuery = this.getFireflyQuery();
	if (oFF.XStringUtils.isNotNullAndNotEmpty(fireflyQuery))
	{
		sb.appendNewLine().append("FF query available");
	}
	else
	{
		sb.appendNewLine().append(" No FF query of grid available");
	}
	var datasets = this.getDatasets();
	if (oFF.XCollectionUtils.hasElements(datasets))
	{
		sb.appendNewLine().append(datasets.toString());
	}
	return sb.toString();
};
oFF.OcOrcaGridWidget.prototype.releaseObject = function()
{
	this.m_fireflyQuery = null;
	this.m_datasets = oFF.XObjectExt.release(this.m_datasets);
	this.m_hasGridDefinition = oFF.XObjectExt.release(this.m_hasGridDefinition);
	this.m_gridDefinition = oFF.XObjectExt.release(this.m_gridDefinition);
	oFF.OcOrcaBaseWidget.prototype.releaseObject.call( this );
};

oFF.OcOrcaWidget = function() {};
oFF.OcOrcaWidget.prototype = new oFF.OcOrcaBaseWidget();
oFF.OcOrcaWidget.prototype._ff_c = "OcOrcaWidget";

oFF.OcOrcaWidget.create = function(widgetId, widgetType, widgetJson, orcaPage)
{
	var widget = new oFF.OcOrcaWidget();
	widget.setupOrcaBaseWidget(widgetId, widgetType, widgetJson, orcaPage);
	return widget;
};
oFF.OcOrcaWidget.prototype.m_widgetText = null;
oFF.OcOrcaWidget.prototype.m_pictogram = null;
oFF.OcOrcaWidget.prototype.m_hasImage = null;
oFF.OcOrcaWidget.prototype.m_image = null;
oFF.OcOrcaWidget.prototype.getWidgetText = function()
{
	if (oFF.isNull(this.m_widgetText))
	{
		this.m_widgetText = oFF.OcStoryUtils.getValueOrEmptyString(oFF.OcJsonPathEvaluator.getSingleJsonPathElementAsString(this.getWidgetJson(), oFF.OcOrcaConstants.PATH_FROM_WIDGET_TO_TEXT));
		if (oFF.XStringUtils.isNullOrEmpty(this.m_widgetText))
		{
			this.getContext().getMessageManager().addMessage(oFF.OcMessage.newWidgetWithoutContent(oFF.Severity.INFO, this));
		}
	}
	return this.m_widgetText;
};
oFF.OcOrcaWidget.prototype.getPictogram = function()
{
	if (oFF.isNull(this.m_pictogram))
	{
		this.m_pictogram = oFF.OcStoryUtils.getValueOrEmptyString(oFF.OcJsonPathEvaluator.getSingleJsonPathElementAsString(this.getWidgetJson(), oFF.OcOrcaConstants.PATH_FROM_WIDGET_TO_SVG));
	}
	return this.m_pictogram;
};
oFF.OcOrcaWidget.prototype.getFieldSelection = function()
{
	var fieldSelections = this.getOrcaPage().getStory().getFieldSelections().getFieldSelections().getValuesAsReadOnlyList();
	for (var fieldSelectionInfoIndex = 0; fieldSelectionInfoIndex < fieldSelections.size(); fieldSelectionInfoIndex++)
	{
		var fieldSelectionInfo = fieldSelections.get(fieldSelectionInfoIndex);
		var sourceId = fieldSelectionInfo.getSelectionInfos().asStructure().getStringByKey("source");
		if (oFF.XString.isEqual(this.getId(), sourceId))
		{
			fieldSelectionInfo.getSelectionInfos().asStructure().putString("id", fieldSelectionInfo.getId());
			return fieldSelectionInfo.getSelectionInfos().asStructure();
		}
	}
	return null;
};
oFF.OcOrcaWidget.prototype.getCalcVar = function()
{
	var calcVars = this.getOrcaPage().getStory().getCalculationVariables().getCalculationVariables().getValuesAsReadOnlyList();
	for (var calcVarInfoIndex = 0; calcVarInfoIndex < calcVars.size(); calcVarInfoIndex++)
	{
		var calcVarSelectionInfo = calcVars.get(calcVarInfoIndex);
		var sourceId = calcVarSelectionInfo.getSelectionInfos().asStructure().getStringByKey("source");
		if (oFF.XString.isEqual(this.getId(), sourceId))
		{
			calcVarSelectionInfo.getSelectionInfos().asStructure().putString("id", calcVarSelectionInfo.getId());
			return calcVarSelectionInfo.getSelectionInfos().asStructure();
		}
	}
	return null;
};
oFF.OcOrcaWidget.prototype.getPageFilter = function()
{
	var pageFilters = this.getOrcaPage().getPageFilters();
	for (var pageFilterIndex = 0; pageFilterIndex < pageFilters.size(); pageFilterIndex++)
	{
		var filterDefinitionAt = pageFilters.getStructureAt(pageFilterIndex);
		var sourceId = filterDefinitionAt.getStringByKey("source");
		if (oFF.XString.isEqual(this.getId(), sourceId))
		{
			return filterDefinitionAt;
		}
	}
	return null;
};
oFF.OcOrcaWidget.prototype.getPageGroup = function()
{
	var result = oFF.PrFactory.createList();
	var pageGroups = this.getOrcaPage().getPageGroups();
	for (var pageGroupIndex = 0; pageGroupIndex < pageGroups.size(); pageGroupIndex++)
	{
		var pageGroupAt = pageGroups.getStructureAt(pageGroupIndex);
		var memberIds = pageGroupAt.getListByKey("members");
		for (var i = 0; i < memberIds.size(); i++)
		{
			if (oFF.XString.isEqual(memberIds.getStringAt(i), this.getId()))
			{
				var newStructure = result.addNewStructure();
				newStructure.putNotNullAndNotEmpty("driverGroupInfo", pageGroupAt.getStructureByKey("driverGroupInfo"));
			}
		}
	}
	return result;
};
oFF.OcOrcaWidget.prototype.getImage = function()
{
	if (oFF.isNull(this.m_hasImage))
	{
		this.m_image = this.getStory().getImages().getImageByImageId(this.getDataReferenceId());
		this.m_hasImage = oFF.TriStateBool.lookup(oFF.notNull(this.m_image));
		if (oFF.isNull(this.m_image))
		{
			this.getContext().getMessageManager().addMessage(oFF.OcMessage.newWidgetWithoutContent(oFF.Severity.WARNING, this));
		}
	}
	return this.m_image;
};
oFF.OcOrcaWidget.prototype.getImageUrl = function()
{
	return oFF.XString.replace(this.getStory().getImages().getImageUrl(), "%s", this.getDataReferenceId());
};
oFF.OcOrcaWidget.prototype.toString = function()
{
	var sb = oFF.XStringBuffer.create();
	sb.append(oFF.OcOrcaBaseWidget.prototype.toString.call( this ));
	var widgetType = this.getWidgetType();
	if (widgetType === oFF.OcWidgetType.TEXT)
	{
		var widgetText = this.getWidgetText();
		if (oFF.XStringUtils.isNullOrEmpty(widgetText))
		{
			sb.appendNewLine().append(" Text = The text of the widget is empty").append(widgetText);
		}
		else
		{
			sb.appendNewLine().append(" Text = ").append(widgetText);
		}
	}
	else if (widgetType === oFF.OcWidgetType.IMAGE)
	{
		var image = this.getImage();
		if (oFF.isNull(image) || !image.hasImageData())
		{
			sb.appendNewLine().append(" Image = No image available");
		}
		else
		{
			sb.appendNewLine().append(" Image = ").append(image.getId());
			if (oFF.XStringUtils.isNotNullAndNotEmpty(image.getThumbnail()))
			{
				sb.appendNewLine().append("Image thumbnail available");
			}
		}
	}
	return sb.toString();
};
oFF.OcOrcaWidget.prototype.releaseObject = function()
{
	this.m_widgetText = null;
	this.m_pictogram = null;
	this.m_hasImage = oFF.XObjectExt.release(this.m_hasImage);
	this.m_image = oFF.XObjectExt.release(this.m_image);
	oFF.OcOrcaBaseWidget.prototype.releaseObject.call( this );
};

oFF.OcOrcaWidgetWithDpAndVizDef = function() {};
oFF.OcOrcaWidgetWithDpAndVizDef.prototype = new oFF.OcOrcaBaseWidget();
oFF.OcOrcaWidgetWithDpAndVizDef.prototype._ff_c = "OcOrcaWidgetWithDpAndVizDef";

oFF.OcOrcaWidgetWithDpAndVizDef.prototype.m_vizDef = null;
oFF.OcOrcaWidgetWithDpAndVizDef.prototype.m_datasets = null;
oFF.OcOrcaWidgetWithDpAndVizDef.prototype.getVizDef = function()
{
	if (oFF.isNull(this.m_vizDef))
	{
		this.m_vizDef = this.getModifiedVizDef();
		if (oFF.isNull(this.m_vizDef))
		{
			this.m_vizDef = oFF.PrFactory.createStructure();
		}
		if (!this.m_vizDef.hasElements())
		{
			this.getContext().getMessageManager().addMessage(this.getMissingVitDefWarning());
		}
	}
	return this.m_vizDef;
};
oFF.OcOrcaWidgetWithDpAndVizDef.prototype.getDatasets = function()
{
	if (oFF.notNull(this.m_datasets))
	{
		return this.m_datasets;
	}
	this.m_datasets = oFF.XList.create();
	var datasources = oFF.OcJsonPathEvaluator.getJsonPathElementsAsStrings(this.getWidgetJson(), oFF.OcOrcaConstants.PATH_FROM_WIDGET_TO_DATASETS);
	for (var i = 0; i < datasources.size(); i++)
	{
		var dataset = this.getOrcaStory().getDatasets().getDatasetByDatasource(datasources.get(i));
		if (oFF.notNull(dataset))
		{
			this.m_datasets.add(dataset);
		}
	}
	if (!this.m_datasets.hasElements())
	{
		this.getContext().getMessageManager().addMessage(oFF.OcMessage.newWidgetWithoutDatasource(oFF.Severity.WARNING, this));
	}
	return this.m_datasets;
};
oFF.OcOrcaWidgetWithDpAndVizDef.prototype.getModifiedVizDef = function()
{
	var vizDef = oFF.PrFactory.createStructureDeepCopy(oFF.OcJsonPathEvaluator.getSingleJsonPathElementAsStructure(this.getWidgetJson(), oFF.OcOrcaConstants.PATH_FROM_WIDGET_TO_VIZ_DEF));
	if (oFF.isNull(vizDef))
	{
		return null;
	}
	vizDef.putString(oFF.OcQuasarConstants.QUASAR_WIDGET_ID, this.getWidgetJson().getStringByKey(oFF.OcOrcaConstants.ID_ELEMENT));
	vizDef.putStringNotNullAndNotEmpty(oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_BACKGROUND_COLOR, this.getLayout().getBackgroundColor());
	var chartDefinition = vizDef.getStructureByKey(oFF.OcOrcaConstants.VIZ_DEF_CHART);
	this.addDatasetInformationToVizDef(chartDefinition);
	var bindings = chartDefinition.getListByKey(oFF.OcOrcaConstants.VIZ_DEF_BINDING);
	for (var bindingIndex = 0; bindingIndex < bindings.size(); bindingIndex++)
	{
		var binding = bindings.getStructureAt(bindingIndex);
		var vizDefSources = binding.getListByKey(oFF.OcOrcaConstants.VIZ_DEF_SOURCE);
		for (var sourceIndex = 0; sourceIndex < vizDefSources.size(); sourceIndex++)
		{
			var vizDefSource = vizDefSources.getStructureAt(sourceIndex);
			var sourceType = vizDefSource.getStringByKey(oFF.OcOrcaConstants.VIZ_DEF_SOURCE_TYPE);
			if (oFF.isNull(sourceType))
			{
				continue;
			}
			if (oFF.XString.isEqual(sourceType, oFF.OcOrcaConstants.VIZ_DEF_SOURCE_TYPE_MEMBER) || oFF.XString.isEqual(sourceType, oFF.OcOrcaConstants.VIZ_DEF_SOURCE_TYPE_CALCULATION) || oFF.XString.isEqual(sourceType, oFF.OcOrcaConstants.VIZ_DEF_SOURCE_TYPE_RESTRICTED_MEASURE))
			{
				this.addMeasureSyncToVizDef(vizDefSource);
			}
			var parentSource = vizDefSource.getStructureByKey(oFF.OcOrcaConstants.VIZ_DEF_SOURCE_PARENT_KEY);
			var parentSourceType = parentSource.getStringByKey(oFF.OcOrcaConstants.VIZ_DEF_SOURCE_TYPE);
			if (oFF.XString.isEqual(sourceType, oFF.OcOrcaConstants.VIZ_DEF_SOURCE_TYPE_HIERARCHY) || oFF.XString.isEqual(parentSourceType, oFF.OcOrcaConstants.VIZ_DEF_SOURCE_TYPE_HIERARCHY))
			{
				var parentSourceDimensionName = parentSource.getStringByKey(oFF.OcOrcaConstants.VIZ_DEF_DIMENSION);
				if (oFF.isNull(parentSourceDimensionName))
				{
					parentSourceDimensionName = vizDefSource.getStringByKey(oFF.OcOrcaConstants.VIZ_DEF_DIMENSION);
				}
				var hierarchies = vizDef.getListByKey(oFF.OcOrcaConstants.VIZ_DEF_HIERARCHY_LEVEL_INFO);
				if (oFF.notNull(hierarchies))
				{
					for (var hierarchyIndex = 0; hierarchyIndex < hierarchies.size(); hierarchyIndex++)
					{
						var hierarchy = hierarchies.getStructureAt(hierarchyIndex);
						var hierarchyDimension = hierarchy.getStructureByKey(oFF.OcOrcaConstants.VIZ_DEF_ENTITY_ID);
						var hierarchyDimensionName = hierarchyDimension.getStringByKey(oFF.OcOrcaConstants.VIZ_DEF_DIMENSION);
						if (oFF.XString.isEqual(hierarchyDimensionName, parentSourceDimensionName))
						{
							vizDefSource.putInteger(oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_HIERARCHY_DRILL_LEVEL, oFF.OcStoryUtils.getIntegerFromStructureByName(hierarchy, oFF.OcOrcaConstants.VIZ_DEF_HIERARCHY_DRILL_LEVEL));
							vizDefSource.putString(oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_HIERARCHY_DRILL_MODE, hierarchy.getStringByKey(oFF.OcOrcaConstants.VIZ_DEF_HIERARCHY_DRILL_MODE));
						}
					}
				}
			}
		}
	}
	return vizDef;
};
oFF.OcOrcaWidgetWithDpAndVizDef.prototype.addDatasetInformationToVizDef = function(chartDefinition)
{
	var datasets = this.getDatasets();
	if (!oFF.XCollectionUtils.hasElements(datasets))
	{
		return;
	}
	var dataset = datasets.get(0);
	var formulaAliases = dataset.getFormulaAliases();
	if (oFF.notNull(formulaAliases))
	{
		chartDefinition.put(oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_FORMULA_ALIASES, formulaAliases);
	}
	var memberDefinitions = dataset.getMemberDefinitions();
	if (oFF.notNull(memberDefinitions))
	{
		chartDefinition.put(oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_MEMBER_DEFINITIONS, memberDefinitions);
	}
};
oFF.OcOrcaWidgetWithDpAndVizDef.prototype.addMeasureSyncToVizDef = function(vizDefSource)
{
	var sourceId = vizDefSource.getStringByKey(oFF.OcOrcaConstants.VIZ_DEF_SOURCE_ID);
	if (oFF.XStringUtils.isNullOrEmpty(sourceId))
	{
		return;
	}
	var measureSync = this.getStory().getMeasureSyncs().getMeasureSyncByMeasureName(sourceId);
	if (oFF.notNull(measureSync))
	{
		vizDefSource.putString(oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_COLOR, measureSync.getColor());
		vizDefSource.putString(oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_PATTERN, measureSync.getPattern());
	}
};
oFF.OcOrcaWidgetWithDpAndVizDef.prototype.toString = function()
{
	var sb = oFF.XStringBuffer.create();
	sb.append(oFF.OcOrcaBaseWidget.prototype.toString.call( this ));
	var vizDef = this.getVizDef();
	if (oFF.notNull(vizDef) && vizDef.hasElements())
	{
		sb.appendNewLine().append(" VizDef available");
	}
	else
	{
		sb.appendNewLine().append(" No VizDef of chart available");
	}
	var datasets = this.getDatasets();
	if (oFF.XCollectionUtils.hasElements(datasets))
	{
		sb.appendNewLine().append(datasets.toString());
	}
	return sb.toString();
};
oFF.OcOrcaWidgetWithDpAndVizDef.prototype.releaseObject = function()
{
	this.m_vizDef = null;
	this.m_datasets = oFF.XObjectExt.release(this.m_datasets);
	oFF.OcOrcaBaseWidget.prototype.releaseObject.call( this );
};

oFF.OcMeasureSync = function() {};
oFF.OcMeasureSync.prototype = new oFF.DfNameObject();
oFF.OcMeasureSync.prototype._ff_c = "OcMeasureSync";

oFF.OcMeasureSync.create = function(measureName)
{
	var calculation = new oFF.OcMeasureSync();
	calculation._setupInternal(measureName);
	return calculation;
};
oFF.OcMeasureSync.prototype.m_color = null;
oFF.OcMeasureSync.prototype.m_pattern = null;
oFF.OcMeasureSync.prototype.getColor = function()
{
	return this.m_color;
};
oFF.OcMeasureSync.prototype.setColor = function(color)
{
	this.m_color = color;
};
oFF.OcMeasureSync.prototype.getPattern = function()
{
	return this.m_pattern;
};
oFF.OcMeasureSync.prototype.setPattern = function(pattern)
{
	this.m_pattern = pattern;
};
oFF.OcMeasureSync.prototype.toString = function()
{
	var sb = oFF.XStringBuffer.create();
	sb.append("Measure Sync: ").append(this.getName());
	sb.appendNewLine().append("Color = ").append(this.getColor()).append(", Pattern = ").append(this.getPattern());
	return sb.toString();
};
oFF.OcMeasureSync.prototype.releaseObject = function()
{
	this.m_color = null;
	this.m_pattern = null;
	oFF.DfNameObject.prototype.releaseObject.call( this );
};

oFF.OcThreshold = function() {};
oFF.OcThreshold.prototype = new oFF.DfNameObject();
oFF.OcThreshold.prototype._ff_c = "OcThreshold";

oFF.OcThreshold.create = function(datasource, exception)
{
	var threshold = new oFF.OcThreshold();
	threshold.setupThreshold(datasource, exception);
	return threshold;
};
oFF.OcThreshold.prototype.m_exception = null;
oFF.OcThreshold.prototype.setupThreshold = function(datasource, exception)
{
	this._setupInternal(datasource);
	this.m_exception = exception;
};
oFF.OcThreshold.prototype.getException = function()
{
	return this.m_exception;
};
oFF.OcThreshold.prototype.toString = function()
{
	var sb = oFF.XStringBuffer.create();
	sb.append("Thresholds: ").append(this.getName());
	sb.appendNewLine().append(oFF.PrUtils.serialize(this.getException(), true, true, 4));
	return sb.toString();
};
oFF.OcThreshold.prototype.releaseObject = function()
{
	this.m_exception = null;
	oFF.DfNameObject.prototype.releaseObject.call( this );
};

oFF.OcOrcaConstants = function() {};
oFF.OcOrcaConstants.prototype = new oFF.XConstant();
oFF.OcOrcaConstants.prototype._ff_c = "OcOrcaConstants";

oFF.OcOrcaConstants.ID_ELEMENT = "id";
oFF.OcOrcaConstants.STORY_IS_LIVE_INTEGRATION_TYPE = "FPA_IS_LIVE_INTEGRATION";
oFF.OcOrcaConstants.STORY_NAME = "name";
oFF.OcOrcaConstants.STORY_RESOURCE_ID = "resourceId";
oFF.OcOrcaConstants.STORY_DESCRIPTION = "description";
oFF.OcOrcaConstants.STORY_METADATA = "metadata";
oFF.OcOrcaConstants.STORY_DATA = "data";
oFF.OcOrcaConstants.STORY_OWNER_DISPLAY_NAME = "ownerDisplayName";
oFF.OcOrcaConstants.STORY_CREATED_TIME = "createdTime";
oFF.OcOrcaConstants.STORY_CREATED_BY = "createdBy";
oFF.OcOrcaConstants.STORY_CREATED_BY_DISPLAY_NAME = "createdByDisplayName";
oFF.OcOrcaConstants.STORY_MODIFIED_TIME = "modifiedTime";
oFF.OcOrcaConstants.STORY_MODIFIED_BY = "modifiedBy";
oFF.OcOrcaConstants.STORY_MODIFIED_BY_DISPLAY_NAME = "modifiedByDisplayName";
oFF.OcOrcaConstants.STORY_CHANGED_BY_DISPLAY_NAME = "changedByDisplayName";
oFF.OcOrcaConstants.STORY_UPDATE_COUNTER = "updateCounter";
oFF.OcOrcaConstants.STORY_RESOURCE_TYPE = "resourceType";
oFF.OcOrcaConstants.STORY_RESOURCE_TYPE_LINK = "LINK";
oFF.OcOrcaConstants.STORY_RESOURCE_TYPE_STORY = "STORY";
oFF.OcOrcaConstants.STORY_SOURCE_RESOURCE = "sourceResource";
oFF.OcOrcaConstants.STORY_SUB_NODES = "subNodes";
oFF.OcOrcaConstants.DRIVER_GROUP_INFO = "driverGroupInfo";
oFF.OcOrcaConstants.FILTER_ID = "filterId";
oFF.OcOrcaConstants.MEMBERS = "members";
oFF.OcOrcaConstants.STORY_ENTITIES = "entities";
oFF.OcOrcaConstants.STORY_ENTITY = "story";
oFF.OcOrcaConstants.STORY_ENTITY_TYPE = "type";
oFF.OcOrcaConstants.STORY_ENTITY_DATA = "data";
oFF.OcOrcaConstants.STORY_ENTITY_DATASET = "dataset";
oFF.OcOrcaConstants.STORY_ENTITY_CALCULATION = "calculation";
oFF.OcOrcaConstants.STORY_ENTITY_FIELD_SELECTION = "fieldSelection";
oFF.OcOrcaConstants.STORY_ENTITY_CALCULATION_VARIABLE = "calculationVariable";
oFF.OcOrcaConstants.STORY_ENTITY_IMAGE = "sap.lumira.story.entity.image";
oFF.OcOrcaConstants.STORY_ENTITY_GRID = "analyticgrid.dynamictable";
oFF.OcOrcaConstants.STORY_MEASURE_SYNC = "measureSync";
oFF.OcOrcaConstants.STORY_MEASURE_SYNC_PATTERN = "pattern";
oFF.OcOrcaConstants.STORY_MEASURE_SYNC_COLOR = "color";
oFF.OcOrcaConstants.STORY_CALCULATION_ENTITIES = "entities";
oFF.OcOrcaConstants.STORY_FIELD_SELECTION_ENTITIES = "entities";
oFF.OcOrcaConstants.STORY_CALCULATION_VARIABLE_ENTITIES = "entities";
oFF.OcOrcaConstants.STORY_FIELD_SELECTION_NAME = "name";
oFF.OcOrcaConstants.STORY_CALCULATION_VARIABLE_NAME = "name";
oFF.OcOrcaConstants.STORY_FIELD_SELECTION_TYPE = "type";
oFF.OcOrcaConstants.STORY_CALCULATION_VARIABLE_TYPE = "type";
oFF.OcOrcaConstants.STORY_ENTITY_CALCULATED_DIMENSION = "calculatedDimension";
oFF.OcOrcaConstants.STORY_CALCULATION_VARIABLE_VALUE_TYPE = "valueType";
oFF.OcOrcaConstants.STORY_CALCULATION_NAME = "name";
oFF.OcOrcaConstants.STORY_CALCULATION_TYPE = "type";
oFF.OcOrcaConstants.STORY_CALCULATION_CALCULATION_TYPE = "calculationType";
oFF.OcOrcaConstants.STORY_CALCULATION_SUBTYPE = "subType";
oFF.OcOrcaConstants.STORY_CALCULATION_FORMULA = "formula";
oFF.OcOrcaConstants.STORY_CALCULATION_SELECTIONS = "selections";
oFF.OcOrcaConstants.STORY_CALCULATION_MEASURE_ID = "measureId";
oFF.OcOrcaConstants.STORY_CALCULATION_REFERENCE_MEASURE_ID = "referenceMeasureId";
oFF.OcOrcaConstants.STORY_CALCULATION_FORMAT = "format";
oFF.OcOrcaConstants.STORY_CACLUALTION_RESTRICTED_MEASURE = "restrictedMeasure";
oFF.OcOrcaConstants.STORY_CALCULATION_AGGREGATION = "aggregation";
oFF.OcOrcaConstants.STORY_CALCULATION_AGGREGATION_DIMENSIONS = "aggregationDimensions";
oFF.OcOrcaConstants.STORY_CALCULATION_EXCEPTION_AGGREGATION = "exceptionAggregation";
oFF.OcOrcaConstants.STORY_CALCULATION_EXCEPTION_AGGREGATION_DIMENSIONS = "exceptionAggregationDimensions";
oFF.OcOrcaConstants.STORY_CALCULATION_VALUES_NOT_IN = "valuesNotIn";
oFF.OcOrcaConstants.STORY_CALCULATION_START_DATE = "startDate";
oFF.OcOrcaConstants.STORY_CALCULATION_START_DATE_IF_NULL = "startDateCurrentIfNULL";
oFF.OcOrcaConstants.STORY_CALCULATION_END_DATE = "endDate";
oFF.OcOrcaConstants.STORY_CALCULATION_END_DATE_IF_NULL = "endDateCurrentIfNULL";
oFF.OcOrcaConstants.STORY_CALCULATION_RESULT_GRANULARITY = "resultGranularity";
oFF.OcOrcaConstants.STORY_CALCULATION_TIME_ZONE_OFFSET_FOR_CURRENT_DATE = "timezoneOffsetForCurrentDate";
oFF.OcOrcaConstants.STORY_CALCULATION_SELECTED_DIMENSION_ID = "selectedDimensionId";
oFF.OcOrcaConstants.STORY_CALCULATION_VALUE_TYPE = "valueType";
oFF.OcOrcaConstants.STORY_CALCULATION_TO_TEXT = "isToText";
oFF.OcOrcaConstants.STORY_CALCULATION_GROUP_THRESHOLDS = "groupThresholds";
oFF.OcOrcaConstants.STORY_FIELD_SELECTION_DIMENSION = "dimension.selection";
oFF.OcOrcaConstants.STORY_FIELD_SELECTION_MEASURE = "measure.selection";
oFF.OcOrcaConstants.STORY_CALCULATION_VARIABLE = "calculation.variable";
oFF.OcOrcaConstants.STORY_FIELD_SELECTION_INFO = "selectionInfo";
oFF.OcOrcaConstants.STORY_CALCULATION_VARIABLE_SELECTION_INFO = "selectionInfo";
oFF.OcOrcaConstants.STORY_FIELD_SELECTION_ENTITY_IDS = "entityIds";
oFF.OcOrcaConstants.STORY_FILTERS = "storyFilters";
oFF.OcOrcaConstants.STORY_THRESHOLD_INTERVALS = "intervals";
oFF.OcOrcaConstants.STORY_COLOR_SYNC = "colorSync";
oFF.OcOrcaConstants.STORY_PAGES = "pages";
oFF.OcOrcaConstants.PAGE_IS_HIDDEN = "hidden";
oFF.OcOrcaConstants.PAGE_IS_RESPONSIVE = "RESPONSIVE";
oFF.OcOrcaConstants.PAGE_TITLE = "title";
oFF.OcOrcaConstants.PAGE_LAYOUT_CANVAS = "CANVAS";
oFF.OcOrcaConstants.WIDGET_CLASS = "class";
oFF.OcOrcaConstants.WIDGET_ID = "widgetId";
oFF.OcOrcaConstants.WIDGET_POS_X = "x";
oFF.OcOrcaConstants.WIDGET_POS_Y = "y";
oFF.OcOrcaConstants.WIDGET_WIDTH = "width";
oFF.OcOrcaConstants.WIDGET_HEIGHT = "height";
oFF.OcOrcaConstants.WIDGET_TYPE_CHART = "InfochartVizWidget";
oFF.OcOrcaConstants.WIDGET_TYPE_HEADER = "HeaderWidget";
oFF.OcOrcaConstants.WIDGET_TYPE_FIELD_SELECTION_INPUT_CONTROL = "FieldSelectionInputControlWidget";
oFF.OcOrcaConstants.WIDGET_TYPE_CALC_INPUT_CONTROL = "CalcInputControlWidget";
oFF.OcOrcaConstants.WIDGET_TYPE_PLANNING_SEQUENCE_TRIGGER = "PlanningSequenceTriggerWidget";
oFF.OcOrcaConstants.WIDGET_TYPE_IMAGE = "ImageWidget";
oFF.OcOrcaConstants.WIDGET_TYPE_TEXT = "TextWidget";
oFF.OcOrcaConstants.WIDGET_TYPE_TABLE = "DynamicTableWidget";
oFF.OcOrcaConstants.WIDGET_TYPE_PAGE_FILTER = "PageFilterWidget";
oFF.OcOrcaConstants.WIDGET_TYPE_PICTOGRAM = "PictogramWidget";
oFF.OcOrcaConstants.WIDGET_TYPE_PICTOGRAM_SHAPE = "PictogramShapeWidget";
oFF.OcOrcaConstants.WIDGET_BACKGROUND_COLOR = "backgroundColor";
oFF.OcOrcaConstants.WIDGET_BORDER_RADIUS = "radius";
oFF.OcOrcaConstants.WIDGET_BORDER_STYLE = "style";
oFF.OcOrcaConstants.WIDGET_BORDER_THICKNESS = "thickness";
oFF.OcOrcaConstants.WIDGET_BORDER_FORMAT = "format";
oFF.OcOrcaConstants.WIDGET_BORDER_COLOR = "color";
oFF.OcOrcaConstants.WIDGET_BORDER = "border";
oFF.OcOrcaConstants.WIDGET_SECTION_DEFINITION = "definition";
oFF.OcOrcaConstants.WIDGET_FIREFLY_QUERY = "ffQuery";
oFF.OcOrcaConstants.VIZ_DEF_ENTITY_ID = "entityId";
oFF.OcOrcaConstants.VIZ_DEF_DIMENSION = "dimension";
oFF.OcOrcaConstants.VIZ_DEF_BINDING = "bindings";
oFF.OcOrcaConstants.VIZ_DEF_SOURCE = "source";
oFF.OcOrcaConstants.VIZ_DEF_SOURCE_ID = "id";
oFF.OcOrcaConstants.VIZ_DEF_SOURCE_TYPE = "type";
oFF.OcOrcaConstants.VIZ_DEF_SOURCE_TYPE_HIERARCHY = "hierarchy.pch";
oFF.OcOrcaConstants.VIZ_DEF_SOURCE_TYPE_MEMBER = "member";
oFF.OcOrcaConstants.VIZ_DEF_SOURCE_TYPE_DIMENSION_SELECTION = "dimension.selection";
oFF.OcOrcaConstants.VIZ_DEF_SOURCE_TYPE_CALCULATION_VARIABLE = "calculation.variable";
oFF.OcOrcaConstants.VIZ_DEF_SOURCE_TYPE_RESTRICTED_MEASURE = "restrictedMeasure";
oFF.OcOrcaConstants.VIZ_DEF_SOURCE_TYPE_CALCULATION = "calculation";
oFF.OcOrcaConstants.VIZ_DEF_SOURCE_PARENT_KEY = "parentKey";
oFF.OcOrcaConstants.VIZ_DEF_HIERARCHY_LEVEL_INFO = "hierarchyLevelInfo";
oFF.OcOrcaConstants.VIZ_DEF_HIERARCHY_DRILL_LEVEL = "hierarchyLevel";
oFF.OcOrcaConstants.VIZ_DEF_HIERARCHY_DRILL_MODE = "mode";
oFF.OcOrcaConstants.VIZ_DEF_CHART = "chart";
oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_CALCULATION_FORMULA = "formula";
oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_CALCULATION_TYPE = "type";
oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_CALCULATION_SELECTIONS = "selections";
oFF.OcOrcaConstants.VIZ_DEF_THRESHOLD = "threshold";
oFF.OcOrcaConstants.VIZ_DEF_COLOR_BINDING = "colorBinding";
oFF.OcOrcaConstants.VIZ_DEF_ACCOUNT_ENTITY_ID = "accountEntityId";
oFF.OcOrcaConstants.VIZ_DEF_ACCOUNT_ID = "accountId";
oFF.OcOrcaConstants.VIZ_DEF_THRESHOLD_NAME = "name";
oFF.OcOrcaConstants.VIZ_DEF_LOW = "low";
oFF.OcOrcaConstants.VIZ_DEF_LOW_INCLUSIVE = "lowInclusive";
oFF.OcOrcaConstants.VIZ_DEF_HIGH = "high";
oFF.OcOrcaConstants.VIZ_DEF_HIGH_INCLUSIVE = "highInclusive";
oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_CALCULATION_AGGREGATION = "aggregation";
oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_CALCULATION_AGGREGATION_DIMENSIONS = "aggregationDimensions";
oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_CALCULATION_EXCEPTION_AGGREGATION = "exceptionAggregation";
oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_CALCULATION_EXCEPTION_AGGREGATION_DIMENSIONS = "exceptionAggregationDimensions";
oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_CALCULATION_VALUES_NOT_IN = "valuesNotIn";
oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_CALCULATION_START_DATE = "startDate";
oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_CALCULATION_START_DATE_IF_NULL = "startDateCurrentIfNULL";
oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_CALCULATION_END_DATE = "endDate";
oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_CALCULATION_END_DATE_IF_NULL = "endDateCurrentIfNULL";
oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_CALCULATION_RESULT_GRANULARITY = "resultGranularity";
oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_CALCULATION_TIME_ZONE_OFFSET_FOR_CURRENT_DATE = "timezoneOffsetForCurrentDate";
oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_CALCULATION_SELECTED_DIMENSION_ID = "selectedDimensionId";
oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_CALCULATION_VALUE_TYPE = "valueType";
oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_CALCULATION_TO_TEXT = "isToText";
oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_CALCULATION_GROUP_THRESHOLDS = "groupThresholds";
oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_FIELD_SELECTION_INFOS = "selectionInfos";
oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_FIELD_SELECTION_ENTITY_IDS = "entityIds";
oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_CALCULATION_MEASURE_ID = "measureId";
oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_CALCULATION_REFERENCE_MEASURE_ID = "referenceMeasureId";
oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_CALCULATION_CALCULATTION_TYPE = "calculationType";
oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_CALCULATION_FORMATING_INFO = "formatingInfo";
oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_CALCULATION_NAME = "name";
oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_CALCULATION_ID = "id";
oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_FIELD_SELECTION_ID = "id";
oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_FIELD_SELECTION_NAME = "name";
oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_PATTERN = "pattern";
oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_COLOR = "color";
oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_PAGE_FILTER = "pageFilter";
oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_STORY_FILTERS = "storyFilters";
oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_BACKGROUND_COLOR = "BackgroundColor";
oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_SOURCE_DEF = "def";
oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_HIERARCHY_DRILL_MODE = "drillMode";
oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_HIERARCHY_DRILL_LEVEL = "drillLevel";
oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_FORMULA_ALIASES = "formulaAliases";
oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_MEMBER_DEFINITIONS = "memberDefinitions";
oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_CALCULATION_VARIABLE_ID = "id";
oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_CALCULATION_VARIABLE_NAME = "name";
oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_CALCULATION_VARIABLE_SELECTION_INFOS = "selectionInfos";
oFF.OcOrcaConstants.CUBE = "CUBE";
oFF.OcOrcaConstants.CUBE_DATA_SOURCE = "DataSource";
oFF.OcOrcaConstants.CUBE_DATA_SOURCE_TYPE = "Type";
oFF.OcOrcaConstants.CUBE_DATA_SOURCE_TYPE_QUERY = "query";
oFF.OcOrcaConstants.CUBE_DATA_SOURCE_TYPE_PLANNING = "planning";
oFF.OcOrcaConstants.CUBE_DATA_SOURCE_TYPE_VIEW = "view";
oFF.OcOrcaConstants.CUBE_DATA_SOURCE_SYSTEM = "System";
oFF.OcOrcaConstants.CUBE_DATA_SOURCE_OBJECT_NAME = "ObjectName";
oFF.OcOrcaConstants.CUBE_DATA_SOURCE_PACKAGE_NAME = "PackageName";
oFF.OcOrcaConstants.CUBE_DATA_SOURCE_SCHEMA = "SchemaName";
oFF.OcOrcaConstants.CUBE_FORMULAS = "formulas";
oFF.OcOrcaConstants.CUBE_FORMULAS_DATA = "Data";
oFF.OcOrcaConstants.CUBE_DEPENDENT_OBJECT_MEASURE = "measure";
oFF.OcOrcaConstants.CUBE_DEPENDENT_OBJECT_FORMULA = "formula";
oFF.OcOrcaConstants.CUBE_DEPENDENT_OBJECT_FORMULA_JSON = "jsonFormula";
oFF.OcOrcaConstants.CUBE_MEMBER_DEFINITION_FORMULA = "formula";
oFF.OcOrcaConstants.CUBE_MEMBER_DEFINITION_FORMULA_JSON = "formulaJson";
oFF.OcOrcaConstants.PATH_FROM_STORY_TO_THRESHOLDS = null;
oFF.OcOrcaConstants.PATH_FROM_STORY_TO_STORY_ENTITIES = null;
oFF.OcOrcaConstants.PATH_FROM_STORY_ENTITIY_TO_WIDGETS = null;
oFF.OcOrcaConstants.PATH_FROM_GRID_ENTITIY_TO_DATA_DEFINITION = null;
oFF.OcOrcaConstants.PATH_FROM_GRID_DATA_DEFINITION_TO_DATASOURCE = null;
oFF.OcOrcaConstants.PATH_FROM_PAGE_TO_LAYOUT_TYPE = null;
oFF.OcOrcaConstants.PATH_FROM_PAGE_TO_SECTION_WIDGET_ID = null;
oFF.OcOrcaConstants.PATH_FROM_PAGE_TO_LANES_WIDGET_ID = null;
oFF.OcOrcaConstants.PATH_FROM_PAGE_TO_WIDGET = null;
oFF.OcOrcaConstants.PATH_FROM_PAGE_TO_FILTERS = null;
oFF.OcOrcaConstants.PATH_FROM_PAGE_TO_GROUPS = null;
oFF.OcOrcaConstants.PATH_FROM_PAGE_TO_PAGE_LAYOUT = null;
oFF.OcOrcaConstants.PATH_FROM_PAGE_LAYOUT_TO_BACKGROUND_COLOR = null;
oFF.OcOrcaConstants.PATH_FROM_PAGE_LAYOUT_TO_LAYOUT_TYPE = null;
oFF.OcOrcaConstants.PATH_FROM_PAGE_LAYOUT_TO_WIDGETS = null;
oFF.OcOrcaConstants.PATH_FROM_PAGE_LAYOUT_TO_SECTIONS = null;
oFF.OcOrcaConstants.PATH_FROM_PAGE_LAYOUT_TO_LANE_WIDGETS = null;
oFF.OcOrcaConstants.PATH_FROM_DATASET_TO_MODEL_ID = null;
oFF.OcOrcaConstants.PATH_FROM_MEASURE_SYNC_TO_MEASURE_NAME = null;
oFF.OcOrcaConstants.PATH_FROM_IMAGE_TO_IMAGE_DATA = null;
oFF.OcOrcaConstants.PATH_FROM_IMAGE_TO_IMAGE_THUMBNAIL = null;
oFF.OcOrcaConstants.PATH_FROM_SECTION_TO_WIDGET_ID = null;
oFF.OcOrcaConstants.PATH_FROM_WIDGET_TO_TEXT = null;
oFF.OcOrcaConstants.PATH_FROM_FILTERS_TO_POSSIBLE_VALUES = null;
oFF.OcOrcaConstants.PATH_FROM_WIDGET_TO_SVG = null;
oFF.OcOrcaConstants.PATH_FROM_WIDGET_TO_DATA_REFERENCE_ID = null;
oFF.OcOrcaConstants.PATH_FROM_WIDGET_TO_VIZ_DEF = null;
oFF.OcOrcaConstants.PATH_FROM_WIDGET_TO_DATASETS = null;
oFF.OcOrcaConstants.PATH_FROM_WIDGET_TO_LAYOUT_DEFINITION = null;
oFF.OcOrcaConstants.PATH_FROM_CUBE_TO_DEPENDENT_OBJECTS = null;
oFF.OcOrcaConstants.PATH_FROM_DATASET_TO_VARIABLE = null;
oFF.OcOrcaConstants.PATH_FROM_DEFINITION_TO_CHART_TYPE = null;
oFF.OcOrcaConstants.staticSetup = function()
{
	oFF.OcOrcaConstants.PATH_FROM_STORY_TO_THRESHOLDS = oFF.OcJsonPath.create("thresholds.story");
	oFF.OcOrcaConstants.PATH_FROM_STORY_TO_STORY_ENTITIES = oFF.OcJsonPath.create("cdata.content.entities");
	oFF.OcOrcaConstants.PATH_FROM_STORY_ENTITIY_TO_WIDGETS = oFF.OcJsonPath.create("pages.content.widgets");
	oFF.OcOrcaConstants.PATH_FROM_GRID_ENTITIY_TO_DATA_DEFINITION = oFF.OcJsonPath.create("data.content.segments.dataRegion");
	oFF.OcOrcaConstants.PATH_FROM_GRID_DATA_DEFINITION_TO_DATASOURCE = oFF.OcJsonPath.create("dataSource.queryId");
	oFF.OcOrcaConstants.PATH_FROM_PAGE_TO_LAYOUT_TYPE = oFF.OcJsonPath.create("content.layouts.definition.page.definition.type");
	oFF.OcOrcaConstants.PATH_FROM_PAGE_TO_SECTION_WIDGET_ID = oFF.OcJsonPath.create("content.layouts.definition.page.sections.widgets.widgetId");
	oFF.OcOrcaConstants.PATH_FROM_PAGE_TO_LANES_WIDGET_ID = oFF.OcJsonPath.create("content.layouts.definition.page.rows.lanes.widgets.widgetId");
	oFF.OcOrcaConstants.PATH_FROM_PAGE_TO_FILTERS = oFF.OcJsonPath.create("content.filters");
	oFF.OcOrcaConstants.PATH_FROM_PAGE_TO_GROUPS = oFF.OcJsonPath.create("content.groups");
	oFF.OcOrcaConstants.PATH_FROM_PAGE_TO_PAGE_LAYOUT = oFF.OcJsonPath.create("content.layouts.definition.page");
	oFF.OcOrcaConstants.PATH_FROM_PAGE_LAYOUT_TO_BACKGROUND_COLOR = oFF.OcJsonPath.create("definition.backgroundColor");
	oFF.OcOrcaConstants.PATH_FROM_PAGE_LAYOUT_TO_LAYOUT_TYPE = oFF.OcJsonPath.create("definition.type");
	oFF.OcOrcaConstants.PATH_FROM_DATASET_TO_MODEL_ID = oFF.OcJsonPath.create("data.modelId");
	oFF.OcOrcaConstants.PATH_FROM_MEASURE_SYNC_TO_MEASURE_NAME = oFF.OcJsonPath.create("id.id");
	oFF.OcOrcaConstants.PATH_FROM_IMAGE_TO_IMAGE_DATA = oFF.OcJsonPath.create("data.src");
	oFF.OcOrcaConstants.PATH_FROM_IMAGE_TO_IMAGE_THUMBNAIL = oFF.OcJsonPath.create("data.thumbnail");
	oFF.OcOrcaConstants.PATH_FROM_PAGE_LAYOUT_TO_WIDGETS = oFF.OcJsonPath.create("sections.widgets");
	oFF.OcOrcaConstants.PATH_FROM_PAGE_TO_WIDGET = oFF.OcJsonPath.create("content.widgets");
	oFF.OcOrcaConstants.PATH_FROM_PAGE_LAYOUT_TO_SECTIONS = oFF.OcJsonPath.create("sections");
	oFF.OcOrcaConstants.PATH_FROM_PAGE_LAYOUT_TO_LANE_WIDGETS = oFF.OcJsonPath.create("rows.lanes.widgets");
	oFF.OcOrcaConstants.PATH_FROM_SECTION_TO_WIDGET_ID = oFF.OcJsonPath.create("widgets.widgetId");
	oFF.OcOrcaConstants.PATH_FROM_WIDGET_TO_TEXT = oFF.OcJsonPath.create("definition.text");
	oFF.OcOrcaConstants.PATH_FROM_WIDGET_TO_SVG = oFF.OcJsonPath.create("definition.svg");
	oFF.OcOrcaConstants.PATH_FROM_WIDGET_TO_DATA_REFERENCE_ID = oFF.OcJsonPath.create("definition.entityId");
	oFF.OcOrcaConstants.PATH_FROM_WIDGET_TO_VIZ_DEF = oFF.OcJsonPath.create("definition.vizContent.vizDefinition");
	oFF.OcOrcaConstants.PATH_FROM_WIDGET_TO_DATASETS = oFF.OcJsonPath.create("definition.datasets");
	oFF.OcOrcaConstants.PATH_FROM_WIDGET_TO_LAYOUT_DEFINITION = oFF.OcJsonPath.create("definition");
	oFF.OcOrcaConstants.PATH_FROM_CUBE_TO_DEPENDENT_OBJECTS = oFF.OcJsonPath.create("dependentObjects.data.measures");
	oFF.OcOrcaConstants.PATH_FROM_DATASET_TO_VARIABLE = oFF.OcJsonPath.create("promptValues.variables");
	oFF.OcOrcaConstants.PATH_FROM_DEFINITION_TO_CHART_TYPE = oFF.OcJsonPath.create("definition.vizContent.vizDefinition.chart.type");
};

oFF.OcStoryCatalogType = function() {};
oFF.OcStoryCatalogType.prototype = new oFF.XConstant();
oFF.OcStoryCatalogType.prototype._ff_c = "OcStoryCatalogType";

oFF.OcStoryCatalogType.FAVORITE = null;
oFF.OcStoryCatalogType.PRIVATE = null;
oFF.OcStoryCatalogType.SEARCH_LIST = null;
oFF.OcStoryCatalogType.staticSetup = function()
{
	oFF.OcStoryCatalogType.FAVORITE = oFF.XConstant.setupName(new oFF.OcStoryCatalogType(), "Favorite");
	oFF.OcStoryCatalogType.PRIVATE = oFF.XConstant.setupName(new oFF.OcStoryCatalogType(), "Private");
	oFF.OcStoryCatalogType.SEARCH_LIST = oFF.XConstant.setupName(new oFF.OcStoryCatalogType(), "Search List");
};

oFF.OcStoryCatalogItem = function() {};
oFF.OcStoryCatalogItem.prototype = new oFF.DfIdNameObject();
oFF.OcStoryCatalogItem.prototype._ff_c = "OcStoryCatalogItem";

oFF.OcStoryCatalogItem.create = function(storyId, storyName)
{
	var catalogItem = new oFF.OcStoryCatalogItem();
	catalogItem.setupExt(storyId, storyName);
	return catalogItem;
};
oFF.OcStoryCatalogItem.prototype.m_description = null;
oFF.OcStoryCatalogItem.prototype.m_createTime = null;
oFF.OcStoryCatalogItem.prototype.m_createdBy = null;
oFF.OcStoryCatalogItem.prototype.m_createdByDisplayName = null;
oFF.OcStoryCatalogItem.prototype.m_modifiedTime = null;
oFF.OcStoryCatalogItem.prototype.m_modifiedBy = null;
oFF.OcStoryCatalogItem.prototype.m_modifiedByDisplayName = null;
oFF.OcStoryCatalogItem.prototype.m_updateCounter = 0;
oFF.OcStoryCatalogItem.prototype.getDescription = function()
{
	return this.m_description;
};
oFF.OcStoryCatalogItem.prototype.setDescription = function(description)
{
	this.m_description = description;
};
oFF.OcStoryCatalogItem.prototype.getCreateTime = function()
{
	return this.m_createTime;
};
oFF.OcStoryCatalogItem.prototype.setCreateTime = function(createTime)
{
	this.m_createTime = createTime;
};
oFF.OcStoryCatalogItem.prototype.getCreatedBy = function()
{
	return this.m_createdBy;
};
oFF.OcStoryCatalogItem.prototype.setCreatedBy = function(createdBy)
{
	this.m_createdBy = createdBy;
};
oFF.OcStoryCatalogItem.prototype.getCreatedByDisplayName = function()
{
	return this.m_createdByDisplayName;
};
oFF.OcStoryCatalogItem.prototype.setCreatedByDisplayName = function(createdByDisplayName)
{
	this.m_createdByDisplayName = createdByDisplayName;
};
oFF.OcStoryCatalogItem.prototype.getModifiedTime = function()
{
	return this.m_modifiedTime;
};
oFF.OcStoryCatalogItem.prototype.setModifiedTime = function(modifiedTime)
{
	this.m_modifiedTime = modifiedTime;
};
oFF.OcStoryCatalogItem.prototype.getModifiedBy = function()
{
	return this.m_modifiedBy;
};
oFF.OcStoryCatalogItem.prototype.setModifiedBy = function(modifiedBy)
{
	this.m_modifiedBy = modifiedBy;
};
oFF.OcStoryCatalogItem.prototype.getModifiedByDisplayName = function()
{
	return this.m_modifiedByDisplayName;
};
oFF.OcStoryCatalogItem.prototype.setModifiedByDisplayName = function(modifiedByDisplayName)
{
	this.m_modifiedByDisplayName = modifiedByDisplayName;
};
oFF.OcStoryCatalogItem.prototype.getUpdateCounter = function()
{
	return this.m_updateCounter;
};
oFF.OcStoryCatalogItem.prototype.setUpdateCounter = function(updateCounter)
{
	this.m_updateCounter = updateCounter;
};
oFF.OcStoryCatalogItem.prototype.releaseObject = function()
{
	this.m_description = null;
	this.m_createTime = null;
	this.m_createdBy = null;
	this.m_createdByDisplayName = null;
	this.m_modifiedTime = null;
	this.m_modifiedBy = null;
	this.m_modifiedByDisplayName = null;
	this.m_updateCounter = 0;
	oFF.DfIdNameObject.prototype.releaseObject.call( this );
};
oFF.OcStoryCatalogItem.prototype.toString = function()
{
	var sb = oFF.XStringBuffer.create();
	sb.append(this.getId()).append(": ").append(this.getName());
	return sb.toString();
};

oFF.OcOrcaCubeMetadata = function() {};
oFF.OcOrcaCubeMetadata.prototype = new oFF.DfNameTextObject();
oFF.OcOrcaCubeMetadata.prototype._ff_c = "OcOrcaCubeMetadata";

oFF.OcOrcaCubeMetadata.create = function(cubeMetadataAsJson)
{
	var cubeMetadata = new oFF.OcOrcaCubeMetadata();
	cubeMetadata.setupExt(cubeMetadataAsJson);
	return cubeMetadata;
};
oFF.OcOrcaCubeMetadata.prototype.m_datasourceName = null;
oFF.OcOrcaCubeMetadata.prototype.m_systemName = null;
oFF.OcOrcaCubeMetadata.prototype.m_formulas = null;
oFF.OcOrcaCubeMetadata.prototype.m_memberDefinitions = null;
oFF.OcOrcaCubeMetadata.prototype.setupExt = function(cubeMetadataAsJson)
{
	this._setupInternal(cubeMetadataAsJson.getStringByKey(oFF.OcOrcaConstants.ID_ELEMENT));
	var datasource = cubeMetadataAsJson.getStructureByKey(oFF.OcOrcaConstants.CUBE_DATA_SOURCE);
	var dataSourceType = datasource.getStringByKey(oFF.OcOrcaConstants.CUBE_DATA_SOURCE_TYPE);
	dataSourceType = oFF.XString.toLowerCase(dataSourceType);
	if (oFF.XString.isEqual(dataSourceType, oFF.OcOrcaConstants.CUBE_DATA_SOURCE_TYPE_VIEW) || oFF.XString.isEqual(dataSourceType, oFF.OcOrcaConstants.CUBE_DATA_SOURCE_TYPE_PLANNING) || oFF.XString.isEqual(dataSourceType, oFF.OcOrcaConstants.CUBE_DATA_SOURCE_TYPE_QUERY))
	{
		var objectName = datasource.getStringByKey(oFF.OcOrcaConstants.CUBE_DATA_SOURCE_OBJECT_NAME);
		var packageName = datasource.getStringByKey(oFF.OcOrcaConstants.CUBE_DATA_SOURCE_PACKAGE_NAME);
		var schemaName = datasource.getStringByKey(oFF.OcOrcaConstants.CUBE_DATA_SOURCE_SCHEMA);
		var datasourceName = oFF.XStringUtils.concatenate4(packageName, "][", objectName, "]");
		datasourceName = oFF.XStringUtils.concatenate5(dataSourceType, ":[", schemaName, "][", datasourceName);
		this.m_datasourceName = datasourceName;
	}
	this.m_systemName = datasource.getStringByKey(oFF.OcOrcaConstants.CUBE_DATA_SOURCE_SYSTEM);
	var formulas = cubeMetadataAsJson.getStructureByKey(oFF.OcOrcaConstants.CUBE_FORMULAS);
	if (oFF.notNull(formulas))
	{
		this.m_formulas = formulas.getByKey(oFF.OcOrcaConstants.CUBE_FORMULAS_DATA);
	}
	this.m_memberDefinitions = this.processMemberDefinitions(cubeMetadataAsJson);
};
oFF.OcOrcaCubeMetadata.prototype.getDataSourceName = function()
{
	return this.m_datasourceName;
};
oFF.OcOrcaCubeMetadata.prototype.getFormulas = function()
{
	return this.m_formulas;
};
oFF.OcOrcaCubeMetadata.prototype.getSystemName = function()
{
	return this.m_systemName;
};
oFF.OcOrcaCubeMetadata.prototype.getMemberDefinitions = function()
{
	return this.m_memberDefinitions;
};
oFF.OcOrcaCubeMetadata.prototype.processMemberDefinitions = function(cubeMetadataAsJson)
{
	var measures = oFF.OcJsonPathEvaluator.getSingleJsonPathElementAsList(cubeMetadataAsJson, oFF.OcOrcaConstants.PATH_FROM_CUBE_TO_DEPENDENT_OBJECTS);
	if (oFF.PrUtils.isListEmpty(measures))
	{
		return null;
	}
	var memberDefinitions = oFF.PrFactory.createStructure();
	for (var i = 0; i < measures.size(); i++)
	{
		var measure = measures.getStructureAt(i);
		var measureName = measure.getStringByKey(oFF.OcOrcaConstants.CUBE_DEPENDENT_OBJECT_MEASURE);
		if (oFF.XStringUtils.isNullOrEmpty(measureName))
		{
			continue;
		}
		var formula = measure.getStringByKey(oFF.OcOrcaConstants.CUBE_DEPENDENT_OBJECT_FORMULA);
		if (oFF.XStringUtils.isNotNullAndNotEmpty(formula))
		{
			var formulaJson = measure.getStringByKey(oFF.OcOrcaConstants.CUBE_DEPENDENT_OBJECT_FORMULA_JSON);
			var memberDefinition = memberDefinitions.putNewStructure(measureName);
			memberDefinition.putString(oFF.OcOrcaConstants.CUBE_MEMBER_DEFINITION_FORMULA, formula);
			memberDefinition.putString(oFF.OcOrcaConstants.CUBE_MEMBER_DEFINITION_FORMULA_JSON, formulaJson);
		}
	}
	return memberDefinitions;
};
oFF.OcOrcaCubeMetadata.prototype.releaseObject = function()
{
	this.m_datasourceName = null;
	this.m_systemName = null;
	this.m_memberDefinitions = oFF.XObjectExt.release(this.m_memberDefinitions);
	oFF.DfNameTextObject.prototype.releaseObject.call( this );
};

oFF.OcOrcaAnalyticalCardWidget = function() {};
oFF.OcOrcaAnalyticalCardWidget.prototype = new oFF.OcOrcaWidgetWithDpAndVizDef();
oFF.OcOrcaAnalyticalCardWidget.prototype._ff_c = "OcOrcaAnalyticalCardWidget";

oFF.OcOrcaAnalyticalCardWidget.create = function(widgetId, widgetJson, orcaPage)
{
	var widget = new oFF.OcOrcaAnalyticalCardWidget();
	widget.setupOrcaBaseWidget(widgetId, oFF.OcWidgetType.ANALYTICAL_CARD, widgetJson, orcaPage);
	return widget;
};
oFF.OcOrcaAnalyticalCardWidget.prototype.getMissingVitDefWarning = function()
{
	return oFF.OcMessage.newKpiWithoutVizDef(oFF.Severity.WARNING, this);
};
oFF.OcOrcaAnalyticalCardWidget.prototype.toString = function()
{
	return oFF.XStringUtils.concatenate2("KPI:", oFF.OcOrcaWidgetWithDpAndVizDef.prototype.toString.call( this ));
};
oFF.OcOrcaAnalyticalCardWidget.prototype.processCanvasLayout = function()
{
	var result = oFF.OcOrcaWidgetWithDpAndVizDef.prototype.processCanvasLayout.call( this );
	result.setHeight(200);
	return result;
};

oFF.OcOrcaChartWidget = function() {};
oFF.OcOrcaChartWidget.prototype = new oFF.OcOrcaWidgetWithDpAndVizDef();
oFF.OcOrcaChartWidget.prototype._ff_c = "OcOrcaChartWidget";

oFF.OcOrcaChartWidget.create = function(widgetId, widgetJson, orcaPage)
{
	var widget = new oFF.OcOrcaChartWidget();
	widget.setupOrcaBaseWidget(widgetId, oFF.OcWidgetType.CHART, widgetJson, orcaPage);
	return widget;
};
oFF.OcOrcaChartWidget.prototype.getQuasarName = function(quasarOptions)
{
	if (oFF.notNull(quasarOptions) && quasarOptions.getChartType() !== null)
	{
		return quasarOptions.getChartType().getQuasarName();
	}
	return oFF.OcOrcaWidgetWithDpAndVizDef.prototype.getQuasarName.call( this , quasarOptions);
};
oFF.OcOrcaChartWidget.prototype.getMissingVitDefWarning = function()
{
	return oFF.OcMessage.newChartWithoutVizDef(oFF.Severity.WARNING, this);
};
oFF.OcOrcaChartWidget.prototype.toString = function()
{
	return oFF.XStringUtils.concatenate2("CHART:", oFF.OcOrcaWidgetWithDpAndVizDef.prototype.toString.call( this ));
};

oFF.OcOrcaKpiWidget = function() {};
oFF.OcOrcaKpiWidget.prototype = new oFF.OcOrcaWidgetWithDpAndVizDef();
oFF.OcOrcaKpiWidget.prototype._ff_c = "OcOrcaKpiWidget";

oFF.OcOrcaKpiWidget.create = function(widgetId, widgetJson, orcaPage)
{
	var widget = new oFF.OcOrcaKpiWidget();
	widget.setupOrcaBaseWidget(widgetId, oFF.OcWidgetType.KPI, widgetJson, orcaPage);
	return widget;
};
oFF.OcOrcaKpiWidget.prototype.getMissingVitDefWarning = function()
{
	return oFF.OcMessage.newKpiWithoutVizDef(oFF.Severity.WARNING, this);
};
oFF.OcOrcaKpiWidget.prototype.toString = function()
{
	return oFF.XStringUtils.concatenate2("KPI:", oFF.OcOrcaWidgetWithDpAndVizDef.prototype.toString.call( this ));
};
oFF.OcOrcaKpiWidget.prototype.processCanvasLayout = function()
{
	var result = oFF.OcOrcaWidgetWithDpAndVizDef.prototype.processCanvasLayout.call( this );
	result.setHeight(200);
	return result;
};

oFF.OcQuasarConstants = function() {};
oFF.OcQuasarConstants.prototype = new oFF.XConstant();
oFF.OcQuasarConstants.prototype._ff_c = "OcQuasarConstants";

oFF.OcQuasarConstants.QUASAR_VARIABLES = "Variables";
oFF.OcQuasarConstants.QUASAR_CONTENT = "Content";
oFF.OcQuasarConstants.QUASAR_CONTENT_BACKGROUND_COLOR = "BackgroundColor";
oFF.OcQuasarConstants.QUASAR_CONTENT_BACKGROUND_IMAGE_SRC = "BackgroundImageSrc";
oFF.OcQuasarConstants.QUASAR_CONTENT_ITEMS = "Items";
oFF.OcQuasarConstants.QUASAR_CONTENT_TYPE = "CType";
oFF.OcQuasarConstants.QUASAR_ITEM_NAME = "Name";
oFF.OcQuasarConstants.QUASAR_WIDGET_ID = "widgetId";
oFF.OcQuasarConstants.QUASAR_ENTITY_ID = "EntityId";
oFF.OcQuasarConstants.QUASAR_ITEM_TYPE = "CType";
oFF.OcQuasarConstants.QUASAR_ITEM_TEXT = "Text";
oFF.OcQuasarConstants.QUASAR_ITEM_TEXT_UNSUPPORTED_WIDGET = "Unsupported Widget";
oFF.OcQuasarConstants.QUASAR_ITEM_PICTOGRAM_SVG = "svg";
oFF.OcQuasarConstants.QUASAR_ITEM_PAGE_FILTER = "PageFilter";
oFF.OcQuasarConstants.QUASAR_ITEM_IMAGE_SRC = "Src";
oFF.OcQuasarConstants.QUASAR_ITEM_BINDING = "Binding";
oFF.OcQuasarConstants.QUASAR_ITEM_BINDINGS = "Bindings";
oFF.OcQuasarConstants.QUASAR_ITEM_BINDING_TYPE = "Type";
oFF.OcQuasarConstants.QUASAR_ITEM_BINDING_SOURCE = "Source";
oFF.OcQuasarConstants.QUASAR_LAYOUT_PERCENT = "%";
oFF.OcQuasarConstants.QUASAR_LAYOUT_PX = "px";
oFF.OcQuasarConstants.QUASAR_LAYOUT_X = "X";
oFF.OcQuasarConstants.QUASAR_LAYOUT_Y = "Y";
oFF.OcQuasarConstants.QUASAR_LAYOUT_WIDTH = "Width";
oFF.OcQuasarConstants.QUASAR_LAYOUT_HEIGHT = "Height";
oFF.OcQuasarConstants.QUASAR_LAYOUT_BORDER_SIZE = "BorderSize";
oFF.OcQuasarConstants.QUASAR_LAYOUT_BORDER_STYLE = "BorderStyle";
oFF.OcQuasarConstants.QUASAR_LAYOUT_BORDER_FORMAT = "BorderFormat";
oFF.OcQuasarConstants.QUASAR_LAYOUT_BORDER_COLOR = "BorderColor";
oFF.OcQuasarConstants.QUASAR_LAYOUT_BORDER_CORNER_RADIUS = "CornerRadius";
oFF.OcQuasarConstants.QUASAR_LAYOUT_BACKGROUND_COLOR = "BackgroundColor";
oFF.OcQuasarConstants.QUASAR_GLOBAL_DEF = "GlobalDef";
oFF.OcQuasarConstants.QUASAR_GLOBAL_DEF_COLOR_SYNC = "colorSync";
oFF.OcQuasarConstants.QUASAR_GLOBAL_DEF_THRESHOLDS = "thresholds";
oFF.OcQuasarConstants.QUASAR_VIZ_DEF_THRESHOLD = "threshold";
oFF.OcQuasarConstants.QUASAR_DATA_PROVIDERS = "DataProviders";
oFF.OcQuasarConstants.QUASAR_DATA_PROVIDER_VIZ_DEF = "VizDef";
oFF.OcQuasarConstants.QUASAR_DATA_PROVIDER_FF_QUERY = "ffQuery";
oFF.OcQuasarConstants.QUASAR_DATA_PROVIDER_SYSTEM = "System";
oFF.OcQuasarConstants.QUASAR_DATA_PROVIDER_CUBE_NAME = "CubeName";
oFF.OcQuasarConstants.QUASAR_DATA_PROVIDER_MODEL_ID = "ModelId";
oFF.OcQuasarConstants.QUASAR_DATA_PROVIDER_DATA_SOURCE = "DataSource";
oFF.OcQuasarConstants.QUASAR_DATA_PROVIDER_NAME = "Name";
oFF.OcQuasarConstants.QUASAR_CHART_BINDING_TYPE = "C";
oFF.OcQuasarConstants.QUASAR_KPI_BINDING_TYPE = "Kpi";
oFF.OcQuasarConstants.QUASAR_CHART_BODY_BINDING_TYPE = "Chart";
oFF.OcQuasarConstants.VIZ_DEF_PATH_TO_THRESHOLDS = null;
oFF.OcQuasarConstants.STORY_PAGE_ID = "pageId";
oFF.OcQuasarConstants.MEMBERS = "members";
oFF.OcQuasarConstants.QUASAR_GLOBAL_OBJECTS = "GlobalObjects";
oFF.OcQuasarConstants.QUASAR_GLOBAL_OBJECTS_PAGE_FILTERS = "PageFilters";
oFF.OcQuasarConstants.QUASAR_GLOBAL_OBJECTS_STORY_FILTERS = "StoryFilters";
oFF.OcQuasarConstants.QUASAR_GLOBAL_OBJECTS_CALCULATIONS = "Calculations";
oFF.OcQuasarConstants.QUASAR_GLOBAL_OBJECTS_CALCULATION_VARIABLES = "CalculationVariables";
oFF.OcQuasarConstants.QUASAR_GLOBAL_OBJECTS_FIELD_SELECTIONS = "FieldSelections";
oFF.OcQuasarConstants.QUASAR_GLOBAL_OBJECTS_THRESHOLDS = "Thresholds";
oFF.OcQuasarConstants.staticSetup = function()
{
	oFF.OcQuasarConstants.VIZ_DEF_PATH_TO_THRESHOLDS = oFF.OcJsonPath.create("userPreferences.threshold");
};

oFF.OcCacheableQuasarStory = function() {};
oFF.OcCacheableQuasarStory.prototype = new oFF.DfNameTextObject();
oFF.OcCacheableQuasarStory.prototype._ff_c = "OcCacheableQuasarStory";

oFF.OcCacheableQuasarStory.create = function(storyId, storyName)
{
	var storyInfo = new oFF.OcCacheableQuasarStory();
	storyInfo.setupWithNameText(storyId, storyName);
	return storyInfo;
};
oFF.OcCacheableQuasarStory.prototype.m_description = null;
oFF.OcCacheableQuasarStory.prototype.m_createTime = null;
oFF.OcCacheableQuasarStory.prototype.m_createdBy = null;
oFF.OcCacheableQuasarStory.prototype.m_modifiedTime = null;
oFF.OcCacheableQuasarStory.prototype.m_modifiedBy = null;
oFF.OcCacheableQuasarStory.prototype.m_updateCounter = 0;
oFF.OcCacheableQuasarStory.prototype.m_mainLayoutType = null;
oFF.OcCacheableQuasarStory.prototype.m_chartType = null;
oFF.OcCacheableQuasarStory.prototype.m_mediaUrl = null;
oFF.OcCacheableQuasarStory.prototype.m_pages = null;
oFF.OcCacheableQuasarStory.prototype.setDescription = function(description)
{
	this.m_description = description;
};
oFF.OcCacheableQuasarStory.prototype.getDescription = function()
{
	return this.m_description;
};
oFF.OcCacheableQuasarStory.prototype.setCreateTime = function(createTime)
{
	this.m_createTime = createTime;
};
oFF.OcCacheableQuasarStory.prototype.getCreateTime = function()
{
	return this.m_createTime;
};
oFF.OcCacheableQuasarStory.prototype.setCreatedBy = function(createdBy)
{
	this.m_createdBy = createdBy;
};
oFF.OcCacheableQuasarStory.prototype.getCreatedBy = function()
{
	return this.m_createdBy;
};
oFF.OcCacheableQuasarStory.prototype.setModifiedTime = function(modifiedTime)
{
	this.m_modifiedTime = modifiedTime;
};
oFF.OcCacheableQuasarStory.prototype.getModifiedTime = function()
{
	return this.m_modifiedTime;
};
oFF.OcCacheableQuasarStory.prototype.setModifiedBy = function(modifiedBy)
{
	this.m_modifiedBy = modifiedBy;
};
oFF.OcCacheableQuasarStory.prototype.getModifiedBy = function()
{
	return this.m_modifiedBy;
};
oFF.OcCacheableQuasarStory.prototype.setUpdateCounter = function(updateCounter)
{
	this.m_updateCounter = updateCounter;
};
oFF.OcCacheableQuasarStory.prototype.getUpdateCounter = function()
{
	return this.m_updateCounter;
};
oFF.OcCacheableQuasarStory.prototype.setMediaUrl = function(mediaUrl)
{
	this.m_mediaUrl = mediaUrl;
};
oFF.OcCacheableQuasarStory.prototype.getMediaUrl = function()
{
	return this.m_mediaUrl;
};
oFF.OcCacheableQuasarStory.prototype.setMainLayoutType = function(layoutType)
{
	this.m_mainLayoutType = layoutType;
};
oFF.OcCacheableQuasarStory.prototype.getMainLayoutType = function()
{
	return this.m_mainLayoutType;
};
oFF.OcCacheableQuasarStory.prototype.getChartType = function()
{
	return this.m_chartType;
};
oFF.OcCacheableQuasarStory.prototype.setChartType = function(chartType)
{
	this.m_chartType = chartType;
};
oFF.OcCacheableQuasarStory.prototype.getPages = function()
{
	return this.m_pages;
};
oFF.OcCacheableQuasarStory.prototype.setPages = function(pages)
{
	this.m_pages = pages;
};
oFF.OcCacheableQuasarStory.prototype.releaseObject = function()
{
	this.m_description = null;
	this.m_createTime = null;
	this.m_createdBy = null;
	this.m_modifiedTime = null;
	this.m_modifiedBy = null;
	this.m_mainLayoutType = null;
	this.m_chartType = null;
	this.m_mediaUrl = null;
	this.m_pages = null;
	oFF.DfNameTextObject.prototype.releaseObject.call( this );
};

oFF.OcQuasarStory = function() {};
oFF.OcQuasarStory.prototype = new oFF.DfIdNameObject();
oFF.OcQuasarStory.prototype._ff_c = "OcQuasarStory";

oFF.OcQuasarStory.create = function(story)
{
	var quasarStory = new oFF.OcQuasarStory();
	quasarStory.setupStory(story);
	return quasarStory;
};
oFF.OcQuasarStory.getSortedKeys = function(readOnlyListOfString)
{
	var keys = oFF.XListOfString.create();
	keys.addAll(readOnlyListOfString);
	keys.sortByDirection(oFF.XSortDirection.ASCENDING);
	return keys;
};
oFF.OcQuasarStory.prototype.m_story = null;
oFF.OcQuasarStory.prototype.m_mainLayoutType = null;
oFF.OcQuasarStory.prototype.m_chartType = null;
oFF.OcQuasarStory.prototype.setupStory = function(story)
{
	this.setupExt(story.getId(), story.getName());
	this.m_story = story;
	this.m_mainLayoutType = oFF.OcLayoutType.CANVAS;
	this.m_chartType = oFF.OcChartType.HIGHCHARTS;
};
oFF.OcQuasarStory.prototype.getDescription = function()
{
	return this.m_story.getDescription();
};
oFF.OcQuasarStory.prototype.getCreateTime = function()
{
	return this.m_story.getCreateTime();
};
oFF.OcQuasarStory.prototype.getCreatedBy = function()
{
	return this.m_story.getCreatedBy();
};
oFF.OcQuasarStory.prototype.getModifiedBy = function()
{
	return this.m_story.getModifiedBy();
};
oFF.OcQuasarStory.prototype.getModifiedTime = function()
{
	return this.m_story.getModifiedTime();
};
oFF.OcQuasarStory.prototype.getPublicUrl = function()
{
	return this.m_story.getPublicUrl();
};
oFF.OcQuasarStory.prototype.getQuasarAnalyticalCardDocument = function()
{
	return this.processQuasarAnalyticalCard();
};
oFF.OcQuasarStory.prototype.getQuasarCompositeAnalyticalCardDocument = function()
{
	return this.processQuasarCompositeAnalyticalCard();
};
oFF.OcQuasarStory.prototype.getQuasarTabStoryDocument = function()
{
	try
	{
		return this.processQuasarStory();
	}
	catch (t)
	{
		this.getContext().getMessageManager().addMessage(oFF.OcMessage.newUnexpectedError(t));
		return null;
	}
};
oFF.OcQuasarStory.prototype.getQuasarPages = function()
{
	try
	{
		return this.processQuasarPages();
	}
	catch (t)
	{
		this.getContext().getMessageManager().addMessage(oFF.OcMessage.newUnexpectedError(t));
		return oFF.XList.create();
	}
};
oFF.OcQuasarStory.prototype.getQuasarPageDocuments = function()
{
	try
	{
		return oFF.OcQuasarStoryConverter.convertStory(this.m_story, this.createQuasarOptions());
	}
	catch (t)
	{
		this.getContext().getMessageManager().addMessage(oFF.OcMessage.newUnexpectedError(t));
		return oFF.XList.create();
	}
};
oFF.OcQuasarStory.prototype.getCacheableQuasarStory = function()
{
	try
	{
		return this.processCacheableQuasarStory();
	}
	catch (t)
	{
		this.getContext().getMessageManager().addMessage(oFF.OcMessage.newUnexpectedError(t));
		return null;
	}
};
oFF.OcQuasarStory.prototype.getQuasarWidgetDocument = function(widgetId)
{
	try
	{
		return this.processQuasarWidgetDocument(widgetId);
	}
	catch (t)
	{
		this.getContext().getMessageManager().addMessage(oFF.OcMessage.newUnexpectedError(t));
		return oFF.PrFactory.createStructure();
	}
};
oFF.OcQuasarStory.prototype.getWidgetIds = function()
{
	try
	{
		return this.m_story.getPageManager().getAllWidgetIds();
	}
	catch (t)
	{
		this.getContext().getMessageManager().addMessage(oFF.OcMessage.newUnexpectedError(t));
		return oFF.XListOfString.create();
	}
};
oFF.OcQuasarStory.prototype.getWidgetIdsByWidgetType = function(widgetType)
{
	try
	{
		return this.m_story.getPageManager().getAllWidgetIdsByWidgetType(widgetType);
	}
	catch (t)
	{
		this.getContext().getMessageManager().addMessage(oFF.OcMessage.newUnexpectedError(t));
		return oFF.XListOfString.create();
	}
};
oFF.OcQuasarStory.prototype.getMessages = function()
{
	return this.getContext().getMessageManager();
};
oFF.OcQuasarStory.prototype.processCacheableQuasarStory = function()
{
	var story = this.m_story;
	var cacheableStory = oFF.OcCacheableQuasarStory.create(story.getId(), story.getNormalizedName());
	cacheableStory.setCreatedBy(story.getCreatedBy());
	cacheableStory.setDescription(story.getDescription());
	cacheableStory.setCreateTime(story.getCreateTime());
	cacheableStory.setModifiedTime(story.getModifiedTime());
	cacheableStory.setModifiedBy(story.getModifiedBy());
	cacheableStory.setUpdateCounter(story.getUpdateCounter());
	cacheableStory.setMainLayoutType(this.m_mainLayoutType);
	cacheableStory.setChartType(this.m_chartType);
	cacheableStory.setMediaUrl(story.getImages().getImageUrl());
	cacheableStory.setPages(this.processQuasarPages());
	return cacheableStory;
};
oFF.OcQuasarStory.prototype.processQuasarPages = function()
{
	var i;
	var pageFilters = oFF.PrFactory.createList();
	var quasarPages = oFF.XList.create();
	var quasarOptions = this.createQuasarOptions();
	var pages = this.m_story.getPageManager().getPages();
	for (i = 0; i < pages.size(); i++)
	{
		this.mapPageFilters(pageFilters, pages.get(i));
	}
	for (i = 0; i < pages.size(); i++)
	{
		var page = pages.get(i);
		var pageId = page.getId();
		var pageName = page.getName();
		var convertedPageStructure = oFF.OcQuasarStoryConverter.convertPage(page, quasarOptions);
		this.applyGlobalObjects(convertedPageStructure, pageFilters);
		var quasarPage = oFF.OcQuasarStoryPage.create(pageId, pageName, convertedPageStructure);
		quasarPages.add(quasarPage);
	}
	return quasarPages;
};
oFF.OcQuasarStory.prototype.processQuasarAnalyticalCard = function()
{
	var pageFilters = oFF.PrFactory.createList();
	var structure = oFF.PrFactory.createStructure();
	var content = structure.putNewStructure(oFF.OcQuasarConstants.QUASAR_CONTENT);
	content.putString(oFF.OcQuasarConstants.QUASAR_CONTENT_TYPE, "FlexLayout");
	var itemList = content.putNewList(oFF.OcQuasarConstants.QUASAR_CONTENT_ITEMS);
	var dataproviders = structure.putNewList(oFF.OcQuasarConstants.QUASAR_DATA_PROVIDERS);
	var quasarOptions = this.createQuasarOptions();
	var pages = this.m_story.getPageManager().getPages();
	var i = 0;
	for (; i < pages.size(); i++)
	{
		var page = pages.get(i);
		var quasarKpi = oFF.OcQuasarPageContentConverter.convertPageToAnalyticalCard(page, dataproviders, quasarOptions);
		if (oFF.XCollectionUtils.hasElements(quasarKpi))
		{
			quasarKpi.putString(oFF.OcQuasarConstants.QUASAR_ITEM_NAME, page.getId());
			quasarKpi.putString(oFF.OcQuasarConstants.QUASAR_ITEM_TEXT, page.getName());
			itemList.add(quasarKpi);
			this.mapPageFilters(pageFilters, page);
			break;
		}
	}
	this.applyGlobalObjects(structure, pageFilters);
	return structure;
};
oFF.OcQuasarStory.prototype.processQuasarCompositeAnalyticalCard = function()
{
	var pageFilters = oFF.PrFactory.createList();
	var structure = oFF.PrFactory.createStructure();
	var content = structure.putNewStructure(oFF.OcQuasarConstants.QUASAR_CONTENT);
	content.putString(oFF.OcQuasarConstants.QUASAR_CONTENT_TYPE, "FlexLayout");
	var itemList = content.putNewList(oFF.OcQuasarConstants.QUASAR_CONTENT_ITEMS);
	var dataproviders = structure.putNewList(oFF.OcQuasarConstants.QUASAR_DATA_PROVIDERS);
	var quasarOptions = this.createQuasarOptions();
	var pages = this.m_story.getPageManager().getPages();
	var i = 0;
	for (; i < pages.size(); i++)
	{
		var page = pages.get(i);
		var quasarKpi = oFF.OcQuasarPageContentConverter.convertPageToCompositeAnalyticalCard(itemList, this, page, dataproviders, quasarOptions);
		if (oFF.XCollectionUtils.hasElements(quasarKpi))
		{
			quasarKpi.putString(oFF.OcQuasarConstants.QUASAR_ITEM_NAME, page.getId());
			quasarKpi.putString(oFF.OcQuasarConstants.QUASAR_ITEM_TEXT, page.getName());
			this.mapPageFilters(pageFilters, page);
			break;
		}
	}
	this.applyGlobalObjects(structure, pageFilters);
	return structure;
};
oFF.OcQuasarStory.prototype.processQuasarStory = function()
{
	var pageFilters = oFF.PrFactory.createList();
	var structure = oFF.PrFactory.createStructure();
	var content = structure.putNewStructure(oFF.OcQuasarConstants.QUASAR_CONTENT);
	content.putString(oFF.OcQuasarConstants.QUASAR_CONTENT_BACKGROUND_COLOR, "transparent");
	content.putString(oFF.OcQuasarConstants.QUASAR_LAYOUT_HEIGHT, "100%");
	content.putString(oFF.OcQuasarConstants.QUASAR_LAYOUT_WIDTH, "100%");
	content.putString(oFF.OcQuasarConstants.QUASAR_CONTENT_TYPE, "TabStrip");
	var itemList = content.putNewList(oFF.OcQuasarConstants.QUASAR_CONTENT_ITEMS);
	var dataproviders = structure.putNewList(oFF.OcQuasarConstants.QUASAR_DATA_PROVIDERS);
	var quasarOptions = this.createQuasarOptions();
	var pages = this.m_story.getPageManager().getPages();
	for (var i = 0; i < pages.size(); i++)
	{
		var page = pages.get(i);
		var itemStructure = itemList.addNewStructure();
		itemStructure.putString(oFF.OcQuasarConstants.QUASAR_CONTENT_TYPE, "TabStripItem");
		itemStructure.putString(oFF.OcQuasarConstants.QUASAR_ITEM_NAME, page.getId());
		itemStructure.putString(oFF.OcQuasarConstants.QUASAR_ITEM_TEXT, page.getName());
		oFF.OcQuasarPageConverter.convertPage(page, quasarOptions, itemStructure.putNewStructure(oFF.OcQuasarConstants.QUASAR_CONTENT), dataproviders);
		this.mapPageFilters(pageFilters, page);
	}
	this.applyGlobalObjects(structure, pageFilters);
	return structure;
};
oFF.OcQuasarStory.prototype.mapPageFilters = function(pageFilters, page)
{
	var myPageFilters = oFF.JsonParserFactory.createFromSafeString(page.getPageFilters().toString()).asList();
	var myPageGroups = page.getPageGroups();
	for (var j = 0; j < myPageFilters.size(); j++)
	{
		var myPageFilterBase = myPageFilters.getStructureAt(j);
		var myPageFilter = oFF.PrFactory.createStructure();
		var myKeys = myPageFilterBase.getKeysAsReadOnlyListOfString();
		for (var ki = 0; ki < myKeys.size(); ki++)
		{
			var myKey = myKeys.get(ki);
			myPageFilter.put(myKey, myPageFilterBase.getByKey(myKey));
		}
		myPageFilter.putString(oFF.OcQuasarConstants.STORY_PAGE_ID, page.getId());
		for (var k = 0; k < myPageGroups.size(); k++)
		{
			var myPageGroup = myPageGroups.getStructureAt(k);
			var driverGroupInfos = myPageGroup.getListByKey(oFF.OcOrcaConstants.DRIVER_GROUP_INFO);
			if (oFF.notNull(driverGroupInfos))
			{
				for (var l = 0; l < driverGroupInfos.size(); l++)
				{
					var filterId = driverGroupInfos.getStructureAt(l).getStringByKey(oFF.OcOrcaConstants.FILTER_ID);
					if (oFF.notNull(filterId) && oFF.XString.isEqual(filterId, myPageFilter.getStringByKey(oFF.OcOrcaConstants.FILTER_ID)))
					{
						var subList = myPageGroup.getListByKey(oFF.OcOrcaConstants.MEMBERS);
						if (oFF.notNull(subList))
						{
							var subListElement = myPageFilter.putNewList(oFF.OcQuasarConstants.MEMBERS);
							subListElement.addAll(subList);
						}
					}
				}
			}
		}
		pageFilters.add(myPageFilter);
	}
};
oFF.OcQuasarStory.prototype.applyGlobalObjects = function(structure, pageFilters)
{
	var index;
	var globalObjects = structure.putNewStructure(oFF.OcQuasarConstants.QUASAR_GLOBAL_OBJECTS);
	var myPageFilters = globalObjects.putNewList(oFF.OcQuasarConstants.QUASAR_GLOBAL_OBJECTS_PAGE_FILTERS);
	myPageFilters.addAll(pageFilters);
	var globalStoryFilters = globalObjects.putNewList(oFF.OcQuasarConstants.QUASAR_GLOBAL_OBJECTS_STORY_FILTERS);
	var storyFilters = this.m_story.getStoryFilters();
	for (index = 0; index < storyFilters.size(); index++)
	{
		globalStoryFilters.add(storyFilters.getStructureAt(index));
	}
	var globalCalculations = globalObjects.putNewList(oFF.OcQuasarConstants.QUASAR_GLOBAL_OBJECTS_CALCULATIONS);
	var keys;
	var calculations = this.m_story.getCalculations().getCalculations();
	keys = oFF.OcQuasarStory.getSortedKeys(calculations.getKeysAsReadOnlyListOfString());
	for (index = 0; index < keys.size(); index++)
	{
		var globalCalculation = globalCalculations.addNewStructure();
		var calculation = calculations.getByKey(keys.get(index));
		globalCalculation.putString(oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_CALCULATION_ID, calculation.getId());
		globalCalculation.putStringNotNullAndNotEmpty(oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_CALCULATION_NAME, calculation.getName());
		globalCalculation.putNotNullAndNotEmpty(oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_CALCULATION_FORMATING_INFO, calculation.getFormatting());
		globalCalculation.putStringNotNullAndNotEmpty(oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_CALCULATION_TYPE, calculation.getCalculationType());
		globalCalculation.putNotNullAndNotEmpty(oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_CALCULATION_MEASURE_ID, calculation.getMeasureId());
		globalCalculation.putNotNullAndNotEmpty(oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_CALCULATION_REFERENCE_MEASURE_ID, calculation.getReferenceMeasureId());
		globalCalculation.putNotNullAndNotEmpty(oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_CALCULATION_SELECTIONS, calculation.getSelections());
		globalCalculation.putNotNullAndNotEmpty(oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_CALCULATION_FORMULA, calculation.getFormula());
		globalCalculation.putNotNullAndNotEmpty(oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_CALCULATION_START_DATE, calculation.getStartDate());
		globalCalculation.putNotNullAndNotEmpty(oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_CALCULATION_END_DATE, calculation.getEndDate());
		globalCalculation.putBoolean(oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_CALCULATION_START_DATE_IF_NULL, calculation.isStartDateCurrentIfNull());
		globalCalculation.putBoolean(oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_CALCULATION_END_DATE_IF_NULL, calculation.isEndDateCurrentIfNull());
		globalCalculation.putBoolean(oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_CALCULATION_VALUES_NOT_IN, calculation.isValuesNotIn());
		globalCalculation.putStringNotNullAndNotEmpty(oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_CALCULATION_AGGREGATION, calculation.getAggregation());
		globalCalculation.putNotNullAndNotEmpty(oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_CALCULATION_AGGREGATION_DIMENSIONS, calculation.getAggregationDimensions());
		globalCalculation.putStringNotNullAndNotEmpty(oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_CALCULATION_EXCEPTION_AGGREGATION, calculation.getExceptionAggregation());
		globalCalculation.putNotNullAndNotEmpty(oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_CALCULATION_EXCEPTION_AGGREGATION_DIMENSIONS, calculation.getExceptionAggregationDimensions());
		globalCalculation.putNotNullAndNotEmpty(oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_CALCULATION_GROUP_THRESHOLDS, calculation.getGroupThresholds());
		globalCalculation.putStringNotNullAndNotEmpty(oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_CALCULATION_RESULT_GRANULARITY, calculation.getResultGranularity());
		globalCalculation.putInteger(oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_CALCULATION_TIME_ZONE_OFFSET_FOR_CURRENT_DATE, calculation.getTimezoneOffsetForCurrentDate());
		globalCalculation.putNotNullAndNotEmpty(oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_CALCULATION_SELECTED_DIMENSION_ID, calculation.getSelectedDimensionId());
		globalCalculation.putStringNotNullAndNotEmpty(oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_CALCULATION_VALUE_TYPE, calculation.getValueType());
		globalCalculation.putBoolean(oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_CALCULATION_TO_TEXT, calculation.isToText());
	}
	var globalCalculationVariables = globalObjects.putNewList(oFF.OcQuasarConstants.QUASAR_GLOBAL_OBJECTS_CALCULATION_VARIABLES);
	var calculationVariables = this.m_story.getCalculationVariables().getCalculationVariables();
	keys = oFF.OcQuasarStory.getSortedKeys(calculationVariables.getKeysAsReadOnlyListOfString());
	for (index = 0; index < keys.size(); index++)
	{
		var calculationVariable = calculationVariables.getByKey(keys.get(index));
		var globalCalculationVariable = globalCalculationVariables.addNewStructure();
		globalCalculationVariable.putString(oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_CALCULATION_VARIABLE_ID, calculationVariable.getId());
		globalCalculationVariable.putStringNotNullAndNotEmpty(oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_CALCULATION_NAME, calculationVariable.getName());
		globalCalculationVariable.putNotNullAndNotEmpty(oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_CALCULATION_VARIABLE_SELECTION_INFOS, calculationVariable.getSelectionInfos());
	}
	var globalFieldSelections = globalObjects.putNewList(oFF.OcQuasarConstants.QUASAR_GLOBAL_OBJECTS_FIELD_SELECTIONS);
	var fieldSelections = this.m_story.getFieldSelections().getFieldSelections();
	keys = oFF.OcQuasarStory.getSortedKeys(fieldSelections.getKeysAsReadOnlyListOfString());
	for (index = 0; index < keys.size(); index++)
	{
		var fieldSelection = fieldSelections.getByKey(keys.get(index));
		var globalFieldSelection = globalFieldSelections.addNewStructure();
		globalFieldSelection.putString(oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_FIELD_SELECTION_ID, fieldSelection.getId());
		globalFieldSelection.putStringNotNullAndNotEmpty(oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_FIELD_SELECTION_NAME, fieldSelection.getName());
		globalFieldSelection.putNotNullAndNotEmpty(oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_FIELD_SELECTION_INFOS, fieldSelection.getSelectionInfos());
		globalFieldSelection.putNotNullAndNotEmpty(oFF.OcOrcaConstants.MODIFIED_VIZ_DEF_FIELD_SELECTION_ENTITY_IDS, fieldSelection.getEntityIds());
	}
};
oFF.OcQuasarStory.prototype.processQuasarWidgetDocument = function(widgetId)
{
	var widget = this.m_story.getPageManager().getWidgetByWidgetId(widgetId);
	if (oFF.isNull(widget))
	{
		return null;
	}
	var options = this.createQuasarOptions();
	options.setUseSingleWidgetLayout(true);
	return oFF.OcQuasarStoryConverter.convertWidget(widget, options);
};
oFF.OcQuasarStory.prototype.createQuasarOptions = function()
{
	var options = oFF.OcQuasarOptions.create(this.getContext());
	if (oFF.notNull(this.m_mainLayoutType))
	{
		options.setMainLayoutType(this.m_mainLayoutType);
	}
	if (oFF.notNull(this.m_chartType))
	{
		options.setChartType(this.m_chartType);
	}
	return options;
};
oFF.OcQuasarStory.prototype.getContext = function()
{
	return this.m_story.getContext();
};
oFF.OcQuasarStory.prototype.getQuasarMainLayoutType = function()
{
	return this.m_mainLayoutType;
};
oFF.OcQuasarStory.prototype.setQuasarMainLayoutType = function(layoutType)
{
	this.m_mainLayoutType = layoutType;
};
oFF.OcQuasarStory.prototype.getQuasarChartType = function()
{
	return this.m_chartType;
};
oFF.OcQuasarStory.prototype.setQuasarChartType = function(chartType)
{
	this.m_chartType = chartType;
};
oFF.OcQuasarStory.prototype.releaseObject = function()
{
	this.m_story = oFF.XObjectExt.release(this.m_story);
	oFF.DfIdNameObject.prototype.releaseObject.call( this );
};

oFF.OcQuasarStoryPage = function() {};
oFF.OcQuasarStoryPage.prototype = new oFF.DfIdNameObject();
oFF.OcQuasarStoryPage.prototype._ff_c = "OcQuasarStoryPage";

oFF.OcQuasarStoryPage.create = function(pageId, pageName, pageContent)
{
	var pageInfo = new oFF.OcQuasarStoryPage();
	pageInfo.setupPageInfo(pageId, pageName, pageContent);
	return pageInfo;
};
oFF.OcQuasarStoryPage.prototype.m_pageContent = null;
oFF.OcQuasarStoryPage.prototype.setupPageInfo = function(pageId, pageName, pageContent)
{
	oFF.DfIdNameObject.prototype.setupExt.call( this , pageId, pageName);
	this.m_pageContent = pageContent;
};
oFF.OcQuasarStoryPage.prototype.getPageContent = function()
{
	return this.m_pageContent;
};
oFF.OcQuasarStoryPage.prototype.releaseObject = function()
{
	this.m_pageContent = oFF.XObjectExt.release(this.m_pageContent);
	oFF.DfIdNameObject.prototype.releaseObject.call( this );
};

oFF.OcChartType = function() {};
oFF.OcChartType.prototype = new oFF.XConstant();
oFF.OcChartType.prototype._ff_c = "OcChartType";

oFF.OcChartType.HIGHCHARTS = null;
oFF.OcChartType.MICRO_CHART = null;
oFF.OcChartType.s_lookup = null;
oFF.OcChartType.staticSetup = function()
{
	oFF.OcChartType.s_lookup = oFF.XHashMapByString.create();
	oFF.OcChartType.HIGHCHARTS = oFF.OcChartType.createChartType("Highcharts", "Chart");
	oFF.OcChartType.MICRO_CHART = oFF.OcChartType.createChartType("MicroChart", "MicroChart");
};
oFF.OcChartType.createChartType = function(name, quasarType)
{
	var chartType = new oFF.OcChartType();
	chartType._setupInternal(name);
	chartType.m_quasarName = quasarType;
	oFF.OcChartType.s_lookup.put(name, chartType);
	oFF.OcChartType.s_lookup.put(oFF.XString.toLowerCase(name), chartType);
	oFF.OcChartType.s_lookup.put(oFF.XString.toUpperCase(name), chartType);
	return chartType;
};
oFF.OcChartType.lookup = function(value)
{
	return oFF.OcChartType.s_lookup.getByKey(value);
};
oFF.OcChartType.prototype.m_quasarName = null;
oFF.OcChartType.prototype.getQuasarName = function()
{
	return this.m_quasarName;
};

oFF.OcLayoutType = function() {};
oFF.OcLayoutType.prototype = new oFF.XConstant();
oFF.OcLayoutType.prototype._ff_c = "OcLayoutType";

oFF.OcLayoutType.CANVAS = null;
oFF.OcLayoutType.FLOW = null;
oFF.OcLayoutType.FLOW_SIMPLE = null;
oFF.OcLayoutType.s_typesByName = null;
oFF.OcLayoutType.s_typesByCode = null;
oFF.OcLayoutType.staticSetup = function()
{
	oFF.OcLayoutType.s_typesByName = oFF.XHashMapByString.create();
	oFF.OcLayoutType.s_typesByCode = oFF.XHashMapByString.create();
	oFF.OcLayoutType.CANVAS = oFF.OcLayoutType.create("CanvasLayout", 1);
	oFF.OcLayoutType.FLOW = oFF.OcLayoutType.create("FlowLayout", 2);
	oFF.OcLayoutType.FLOW_SIMPLE = oFF.OcLayoutType.create("FlowSimpleLayout", 3);
};
oFF.OcLayoutType.create = function(name, code)
{
	var layoutType = new oFF.OcLayoutType();
	layoutType._setupInternal(name);
	oFF.OcLayoutType.s_typesByName.put(name, layoutType);
	layoutType.m_code = code;
	oFF.OcLayoutType.s_typesByCode.put(oFF.XInteger.convertToString(code), layoutType);
	return layoutType;
};
oFF.OcLayoutType.getByCode = function(code)
{
	return oFF.OcLayoutType.s_typesByCode.getByKey(oFF.XInteger.convertToString(code));
};
oFF.OcLayoutType.getByName = function(name)
{
	return oFF.OcLayoutType.s_typesByName.getByKey(name);
};
oFF.OcLayoutType.prototype.m_code = 0;
oFF.OcLayoutType.prototype.getCode = function()
{
	return this.m_code;
};

oFF.OcCalculation = function() {};
oFF.OcCalculation.prototype = new oFF.DfIdNameObject();
oFF.OcCalculation.prototype._ff_c = "OcCalculation";

oFF.OcCalculation.create = function(calculationId, calculationName, calculationType)
{
	var calculation = new oFF.OcCalculation();
	calculation.setupCalculation(calculationId, calculationName, calculationType);
	return calculation;
};
oFF.OcCalculation.prototype.m_calculationType = null;
oFF.OcCalculation.prototype.m_formatting = null;
oFF.OcCalculation.prototype.m_measureId = null;
oFF.OcCalculation.prototype.m_referenceMeasureId = null;
oFF.OcCalculation.prototype.m_selections = null;
oFF.OcCalculation.prototype.m_formula = null;
oFF.OcCalculation.prototype.m_aggregation = null;
oFF.OcCalculation.prototype.m_aggregationDimensions = null;
oFF.OcCalculation.prototype.m_exceptionAggregation = null;
oFF.OcCalculation.prototype.m_exceptionAggregationDimensions = null;
oFF.OcCalculation.prototype.m_valuesNotIn = false;
oFF.OcCalculation.prototype.m_resultGranularity = null;
oFF.OcCalculation.prototype.m_startDate = null;
oFF.OcCalculation.prototype.m_endDate = null;
oFF.OcCalculation.prototype.m_startDateCurrentIfNull = false;
oFF.OcCalculation.prototype.m_endDateCurrentIfNull = false;
oFF.OcCalculation.prototype.m_timezoneOffsetForCurrentDate = 0;
oFF.OcCalculation.prototype.m_selectedDimensionId = null;
oFF.OcCalculation.prototype.m_valueType = null;
oFF.OcCalculation.prototype.m_groupThresholds = null;
oFF.OcCalculation.prototype.m_toText = false;
oFF.OcCalculation.prototype.getSelectedDimensionId = function()
{
	return this.m_selectedDimensionId;
};
oFF.OcCalculation.prototype.setSelectedDimensionId = function(selectedDimensionId)
{
	this.m_selectedDimensionId = selectedDimensionId;
};
oFF.OcCalculation.prototype.getValueType = function()
{
	return this.m_valueType;
};
oFF.OcCalculation.prototype.setValueType = function(valueType)
{
	this.m_valueType = valueType;
};
oFF.OcCalculation.prototype.getGroupThresholds = function()
{
	return this.m_groupThresholds;
};
oFF.OcCalculation.prototype.setGroupThresholds = function(groupThresholds)
{
	this.m_groupThresholds = groupThresholds;
};
oFF.OcCalculation.prototype.isToText = function()
{
	return this.m_toText;
};
oFF.OcCalculation.prototype.setToText = function(toText)
{
	this.m_toText = toText;
};
oFF.OcCalculation.prototype.getAggregation = function()
{
	return this.m_aggregation;
};
oFF.OcCalculation.prototype.setAggregation = function(aggregation)
{
	this.m_aggregation = aggregation;
};
oFF.OcCalculation.prototype.getAggregationDimensions = function()
{
	return this.m_aggregationDimensions;
};
oFF.OcCalculation.prototype.setAggregationDimensions = function(aggregationDimensions)
{
	this.m_aggregationDimensions = aggregationDimensions;
};
oFF.OcCalculation.prototype.getExceptionAggregation = function()
{
	return this.m_exceptionAggregation;
};
oFF.OcCalculation.prototype.setExceptionAggregation = function(exceptionAggregation)
{
	this.m_exceptionAggregation = exceptionAggregation;
};
oFF.OcCalculation.prototype.getExceptionAggregationDimensions = function()
{
	return this.m_exceptionAggregationDimensions;
};
oFF.OcCalculation.prototype.setExceptionAggregationDimensions = function(exceptionAggregationDimensions)
{
	this.m_exceptionAggregationDimensions = exceptionAggregationDimensions;
};
oFF.OcCalculation.prototype.isValuesNotIn = function()
{
	return this.m_valuesNotIn;
};
oFF.OcCalculation.prototype.setValuesNotIn = function(valuesNotIn)
{
	this.m_valuesNotIn = valuesNotIn;
};
oFF.OcCalculation.prototype.getResultGranularity = function()
{
	return this.m_resultGranularity;
};
oFF.OcCalculation.prototype.setResultGranularity = function(resultGranularity)
{
	this.m_resultGranularity = resultGranularity;
};
oFF.OcCalculation.prototype.getStartDate = function()
{
	return this.m_startDate;
};
oFF.OcCalculation.prototype.setStartDate = function(startDate)
{
	this.m_startDate = startDate;
};
oFF.OcCalculation.prototype.getEndDate = function()
{
	return this.m_endDate;
};
oFF.OcCalculation.prototype.setEndDate = function(endDate)
{
	this.m_endDate = endDate;
};
oFF.OcCalculation.prototype.isStartDateCurrentIfNull = function()
{
	return this.m_startDateCurrentIfNull;
};
oFF.OcCalculation.prototype.setStartDateCurrentIfNull = function(startDateCurrentIfNull)
{
	this.m_startDateCurrentIfNull = startDateCurrentIfNull;
};
oFF.OcCalculation.prototype.isEndDateCurrentIfNull = function()
{
	return this.m_endDateCurrentIfNull;
};
oFF.OcCalculation.prototype.setEndDateCurrentIfNull = function(endDateCurrentIfNull)
{
	this.m_endDateCurrentIfNull = endDateCurrentIfNull;
};
oFF.OcCalculation.prototype.getTimezoneOffsetForCurrentDate = function()
{
	return this.m_timezoneOffsetForCurrentDate;
};
oFF.OcCalculation.prototype.setTimezoneOffsetForCurrentDate = function(timezoneOffsetForCurrentDate)
{
	this.m_timezoneOffsetForCurrentDate = timezoneOffsetForCurrentDate;
};
oFF.OcCalculation.prototype.setupCalculation = function(calculationId, calculationName, calculationType)
{
	oFF.DfIdNameObject.prototype.setupExt.call( this , calculationId, calculationName);
	this.m_calculationType = calculationType;
};
oFF.OcCalculation.prototype.getCalculationType = function()
{
	return this.m_calculationType;
};
oFF.OcCalculation.prototype.getFormatting = function()
{
	return this.m_formatting;
};
oFF.OcCalculation.prototype.setFormatting = function(formatting)
{
	this.m_formatting = formatting;
};
oFF.OcCalculation.prototype.getMeasureId = function()
{
	return this.m_measureId;
};
oFF.OcCalculation.prototype.getReferenceMeasureId = function()
{
	return this.m_referenceMeasureId;
};
oFF.OcCalculation.prototype.setMeasureId = function(measureId)
{
	this.m_measureId = measureId;
};
oFF.OcCalculation.prototype.setReferenceMeasureId = function(referenceMeasureId)
{
	this.m_referenceMeasureId = referenceMeasureId;
};
oFF.OcCalculation.prototype.getSelections = function()
{
	return this.m_selections;
};
oFF.OcCalculation.prototype.setSelections = function(selections)
{
	this.m_selections = selections;
};
oFF.OcCalculation.prototype.getFormula = function()
{
	return this.m_formula;
};
oFF.OcCalculation.prototype.setFormula = function(formula)
{
	this.m_formula = formula;
};
oFF.OcCalculation.prototype.toString = function()
{
	var sb = oFF.XStringBuffer.create();
	sb.append("Calculation: ").append(this.getId());
	sb.appendNewLine().append(" Name = ").append(this.getName());
	sb.appendNewLine().append(" Type = ").append(this.getCalculationType());
	return sb.toString();
};
oFF.OcCalculation.prototype.releaseObject = function()
{
	this.m_calculationType = null;
	this.m_formatting = null;
	this.m_measureId = null;
	this.m_selections = null;
	this.m_formula = null;
	oFF.DfIdNameObject.prototype.releaseObject.call( this );
};

oFF.OcCalculationVariable = function() {};
oFF.OcCalculationVariable.prototype = new oFF.DfIdNameObject();
oFF.OcCalculationVariable.prototype._ff_c = "OcCalculationVariable";

oFF.OcCalculationVariable.create = function(calculationVariableId, calculationVariableName, calculationVariableType, calculationVariableValueType)
{
	var calculationVariable = new oFF.OcCalculationVariable();
	calculationVariable.setupCalculationVariable(calculationVariableId, calculationVariableName, calculationVariableType, calculationVariableValueType);
	return calculationVariable;
};
oFF.OcCalculationVariable.prototype.m_calculationVariableType = null;
oFF.OcCalculationVariable.prototype.m_calculationVariableValueType = null;
oFF.OcCalculationVariable.prototype.m_selectionInfos = null;
oFF.OcCalculationVariable.prototype.setupCalculationVariable = function(calculationVariableId, calculationVariableName, calculationVariableType, calculationVariableValueType)
{
	oFF.DfIdNameObject.prototype.setupExt.call( this , calculationVariableId, calculationVariableName);
	this.m_calculationVariableType = calculationVariableType;
	this.m_calculationVariableValueType = calculationVariableValueType;
};
oFF.OcCalculationVariable.prototype.getCalculationVariableType = function()
{
	return this.m_calculationVariableType;
};
oFF.OcCalculationVariable.prototype.getCalculationVariableValueType = function()
{
	return this.m_calculationVariableValueType;
};
oFF.OcCalculationVariable.prototype.getSelectionInfos = function()
{
	return this.m_selectionInfos;
};
oFF.OcCalculationVariable.prototype.setSelectionInfos = function(selectionInfos)
{
	this.m_selectionInfos = selectionInfos;
};
oFF.OcCalculationVariable.prototype.releaseObject = function()
{
	this.m_selectionInfos = null;
	oFF.DfIdNameObject.prototype.releaseObject.call( this );
};

oFF.OcFieldSelection = function() {};
oFF.OcFieldSelection.prototype = new oFF.DfIdNameObject();
oFF.OcFieldSelection.prototype._ff_c = "OcFieldSelection";

oFF.OcFieldSelection.create = function(fieldSelectionId, fieldSelectionName, fieldSelectionType)
{
	var fieldSelection = new oFF.OcFieldSelection();
	fieldSelection.setupFieldSelection(fieldSelectionId, fieldSelectionName, fieldSelectionType);
	return fieldSelection;
};
oFF.OcFieldSelection.prototype.m_fieldSelectionType = null;
oFF.OcFieldSelection.prototype.m_selectionInfos = null;
oFF.OcFieldSelection.prototype.m_entityIds = null;
oFF.OcFieldSelection.prototype.setupFieldSelection = function(fieldSelectionId, fieldSelectionName, fieldSelectionType)
{
	oFF.DfIdNameObject.prototype.setupExt.call( this , fieldSelectionId, fieldSelectionName);
	this.m_fieldSelectionType = fieldSelectionType;
};
oFF.OcFieldSelection.prototype.getFieldSelectionType = function()
{
	return this.m_fieldSelectionType;
};
oFF.OcFieldSelection.prototype.getSelectionInfos = function()
{
	return this.m_selectionInfos;
};
oFF.OcFieldSelection.prototype.getEntityIds = function()
{
	return this.m_entityIds;
};
oFF.OcFieldSelection.prototype.setSelectionInfos = function(selectionInfos)
{
	this.m_selectionInfos = selectionInfos;
};
oFF.OcFieldSelection.prototype.setEntityIds = function(entityIds)
{
	this.m_entityIds = entityIds;
};
oFF.OcFieldSelection.prototype.releaseObject = function()
{
	this.m_entityIds = null;
	this.m_selectionInfos = null;
	oFF.DfIdNameObject.prototype.releaseObject.call( this );
};

oFF.OcPage = function() {};
oFF.OcPage.prototype = new oFF.DfIdNameObject();
oFF.OcPage.prototype._ff_c = "OcPage";

oFF.OcPage.prototype.m_normalizedName = null;
oFF.OcPage.prototype.m_backgroundColor = null;
oFF.OcPage.prototype.m_isResponsive = null;
oFF.OcPage.prototype.m_pageFilters = null;
oFF.OcPage.prototype.m_pageGroups = null;
oFF.OcPage.prototype.m_widgetManager = null;
oFF.OcPage.prototype.m_story = null;
oFF.OcPage.prototype.setupPage = function(pageId, pageName, story)
{
	oFF.DfIdNameObject.prototype.setupExt.call( this , pageId, pageName);
	this.m_story = story;
};
oFF.OcPage.prototype.getNormalizedName = function()
{
	if (oFF.isNull(this.m_normalizedName))
	{
		this.m_normalizedName = oFF.OcStoryUtils.normalizeString(this.getName());
	}
	return this.m_normalizedName;
};
oFF.OcPage.prototype.getBackgroundColor = function()
{
	if (oFF.isNull(this.m_backgroundColor))
	{
		this.m_backgroundColor = oFF.OcStoryUtils.getValueOrEmptyString(this.processBackgroundColor());
	}
	return this.m_backgroundColor;
};
oFF.OcPage.prototype.isResponsive = function()
{
	if (oFF.isNull(this.m_isResponsive))
	{
		this.m_isResponsive = oFF.TriStateBool.lookup(this.processIsResponsive());
	}
	return this.m_isResponsive.getBoolean();
};
oFF.OcPage.prototype.getPageFilters = function()
{
	if (oFF.isNull(this.m_pageFilters))
	{
		this.m_pageFilters = this.processPageFilters();
		if (oFF.isNull(this.m_pageFilters))
		{
			this.m_pageFilters = oFF.PrFactory.createList();
		}
	}
	return this.m_pageFilters;
};
oFF.OcPage.prototype.getPageGroups = function()
{
	if (oFF.isNull(this.m_pageGroups))
	{
		this.m_pageGroups = this.processPageGroups();
		if (oFF.isNull(this.m_pageGroups))
		{
			this.m_pageGroups = oFF.PrFactory.createList();
		}
	}
	return this.m_pageGroups;
};
oFF.OcPage.prototype.getWidgetManager = function()
{
	if (oFF.isNull(this.m_widgetManager))
	{
		this.m_widgetManager = oFF.OcWidgetManager.create(this, this.getContext());
	}
	return this.m_widgetManager;
};
oFF.OcPage.prototype.getStory = function()
{
	return this.m_story;
};
oFF.OcPage.prototype.getContext = function()
{
	return this.getStory().getContext();
};
oFF.OcPage.prototype.releaseObject = function()
{
	this.m_normalizedName = null;
	this.m_backgroundColor = null;
	this.m_story = null;
	this.m_isResponsive = oFF.XObjectExt.release(this.m_isResponsive);
	this.m_widgetManager = oFF.XObjectExt.release(this.m_widgetManager);
	oFF.DfIdNameObject.prototype.releaseObject.call( this );
};

oFF.OcWidgetType = function() {};
oFF.OcWidgetType.prototype = new oFF.XConstant();
oFF.OcWidgetType.prototype._ff_c = "OcWidgetType";

oFF.OcWidgetType.CHART = null;
oFF.OcWidgetType.ANALYTICAL_CARD = null;
oFF.OcWidgetType.KPI = null;
oFF.OcWidgetType.GRID = null;
oFF.OcWidgetType.TEXT = null;
oFF.OcWidgetType.PICTOGRAM = null;
oFF.OcWidgetType.IMAGE = null;
oFF.OcWidgetType.PAGE_FILTER = null;
oFF.OcWidgetType.FIELD_SELECTION_INPUT_CONTROL = null;
oFF.OcWidgetType.CALCULATION_INPUT_CONTROL = null;
oFF.OcWidgetType.UNKNOWN = null;
oFF.OcWidgetType.staticSetup = function()
{
	oFF.OcWidgetType.CHART = oFF.OcWidgetType.createWidgetType("Chart", "Chart", true);
	oFF.OcWidgetType.ANALYTICAL_CARD = oFF.OcWidgetType.createWidgetType("AnalyticalCard", "AnalyticalCard", true);
	oFF.OcWidgetType.KPI = oFF.OcWidgetType.createWidgetType("Card", "Card", true);
	oFF.OcWidgetType.GRID = oFF.OcWidgetType.createWidgetType("Grid", "VizGrid", true);
	oFF.OcWidgetType.TEXT = oFF.OcWidgetType.createWidgetType("Text", "Html", false);
	oFF.OcWidgetType.PICTOGRAM = oFF.OcWidgetType.createWidgetType("Pictogram", "Pictogram", false);
	oFF.OcWidgetType.PAGE_FILTER = oFF.OcWidgetType.createWidgetType("PageFilter", "PageFilter", false);
	oFF.OcWidgetType.FIELD_SELECTION_INPUT_CONTROL = oFF.OcWidgetType.createWidgetType("FieldSelectionInputControl", "FieldSelectionInputControl", false);
	oFF.OcWidgetType.CALCULATION_INPUT_CONTROL = oFF.OcWidgetType.createWidgetType("CalculationInputControl", "CalculationInputControl", false);
	oFF.OcWidgetType.IMAGE = oFF.OcWidgetType.createWidgetType("Image", "Image", false);
	oFF.OcWidgetType.UNKNOWN = oFF.OcWidgetType.createWidgetType("Unknown", "Text", false);
};
oFF.OcWidgetType.createWidgetType = function(name, quasarName, hasDataProvider)
{
	var widgetType = new oFF.OcWidgetType();
	widgetType._setupInternal(name);
	widgetType.m_quasarName = quasarName;
	widgetType.m_hasDataProvider = hasDataProvider;
	return widgetType;
};
oFF.OcWidgetType.prototype.m_quasarName = null;
oFF.OcWidgetType.prototype.m_hasDataProvider = false;
oFF.OcWidgetType.prototype.hasDataProvider = function()
{
	return this.m_hasDataProvider;
};
oFF.OcWidgetType.prototype.getQuasarName = function()
{
	return this.m_quasarName;
};

oFF.OcStory = function() {};
oFF.OcStory.prototype = new oFF.DfIdNameObject();
oFF.OcStory.prototype._ff_c = "OcStory";

oFF.OcStory.prototype.m_context = null;
oFF.OcStory.prototype.m_normalizedName = null;
oFF.OcStory.prototype.m_description = null;
oFF.OcStory.prototype.m_createdBy = null;
oFF.OcStory.prototype.m_createdTime = null;
oFF.OcStory.prototype.m_modifiedTime = null;
oFF.OcStory.prototype.m_modifiedBy = null;
oFF.OcStory.prototype.m_colorSync = null;
oFF.OcStory.prototype.m_storyFilters = null;
oFF.OcStory.prototype.m_measureSyncs = null;
oFF.OcStory.prototype.m_datasets = null;
oFF.OcStory.prototype.m_calculations = null;
oFF.OcStory.prototype.m_fieldSelections = null;
oFF.OcStory.prototype.m_calculationVariables = null;
oFF.OcStory.prototype.m_thresholds = null;
oFF.OcStory.prototype.m_images = null;
oFF.OcStory.prototype.m_pageManager = null;
oFF.OcStory.prototype.m_updateCounter = null;
oFF.OcStory.prototype.getStoryFilters = function()
{
	if (oFF.isNull(this.m_storyFilters))
	{
		this.m_storyFilters = this.processStoryFilters();
		if (oFF.isNull(this.m_storyFilters))
		{
			this.m_storyFilters = oFF.PrFactory.createList();
		}
	}
	return this.m_storyFilters;
};
oFF.OcStory.prototype.setupStory = function(storyId, storyName, context)
{
	this.setupExt(storyId, storyName);
	this.m_context = context;
	if (oFF.XStringUtils.isNullOrEmpty(storyId) || oFF.XStringUtils.isNullOrEmpty(storyName))
	{
		var message = oFF.OcMessage.newInvalidStoryNameError();
		this.getContext().getMessageManager().addMessage(message);
		throw oFF.XException.createIllegalArgumentException(message.getText());
	}
};
oFF.OcStory.prototype.getContext = function()
{
	return this.m_context;
};
oFF.OcStory.prototype.getNormalizedName = function()
{
	if (oFF.isNull(this.m_normalizedName))
	{
		this.m_normalizedName = oFF.OcStoryUtils.normalizeString(this.getName());
	}
	return this.m_normalizedName;
};
oFF.OcStory.prototype.getDescription = function()
{
	if (oFF.isNull(this.m_description))
	{
		this.m_description = oFF.OcStoryUtils.getValueOrEmptyString(this.processDescription());
	}
	return this.m_description;
};
oFF.OcStory.prototype.getCreatedBy = function()
{
	if (oFF.isNull(this.m_createdBy))
	{
		this.m_createdBy = oFF.OcStoryUtils.getValueOrEmptyString(this.processCreatedBy());
	}
	return this.m_createdBy;
};
oFF.OcStory.prototype.getCreateTime = function()
{
	if (oFF.isNull(this.m_createdTime))
	{
		this.m_createdTime = oFF.OcStoryUtils.getValueOrEmptyString(this.processCreateTime());
	}
	return this.m_createdTime;
};
oFF.OcStory.prototype.getModifiedBy = function()
{
	if (oFF.isNull(this.m_modifiedBy))
	{
		this.m_modifiedBy = oFF.OcStoryUtils.getValueOrEmptyString(this.processModifiedBy());
	}
	return this.m_modifiedBy;
};
oFF.OcStory.prototype.getModifiedTime = function()
{
	if (oFF.isNull(this.m_modifiedTime))
	{
		this.m_modifiedTime = oFF.OcStoryUtils.getValueOrEmptyString(this.processModifiedTime());
	}
	return this.m_modifiedTime;
};
oFF.OcStory.prototype.getPublicUrl = function()
{
	var orcaPublicUrl = this.getContext().getConnection().getOrcaPublicUrl();
	if (oFF.isNull(orcaPublicUrl))
	{
		orcaPublicUrl = this.getContext().getConnection().getSystemUri();
	}
	return oFF.XStringUtils.concatenate3(orcaPublicUrl, "/sap/fpa/ui/app.html#;view_id=story;storyId=", this.getId());
};
oFF.OcStory.prototype.getUpdateCounter = function()
{
	if (oFF.isNull(this.m_updateCounter))
	{
		this.m_updateCounter = oFF.XIntegerValue.create(this.processUpdateCounter());
	}
	return this.m_updateCounter.getInteger();
};
oFF.OcStory.prototype.getColorSyncs = function()
{
	if (oFF.isNull(this.m_colorSync))
	{
		this.m_colorSync = this.processColorSyncs();
		if (oFF.isNull(this.m_colorSync))
		{
			this.m_colorSync = oFF.PrFactory.createStructure();
		}
	}
	return this.m_colorSync;
};
oFF.OcStory.prototype.getMeasureSyncs = function()
{
	if (oFF.isNull(this.m_measureSyncs))
	{
		this.m_measureSyncs = this.getStoryEntityFactory().createMeasurySyncs();
	}
	return this.m_measureSyncs;
};
oFF.OcStory.prototype.getThresholds = function()
{
	if (oFF.isNull(this.m_thresholds))
	{
		this.m_thresholds = this.getStoryEntityFactory().createThresholds();
	}
	return this.m_thresholds;
};
oFF.OcStory.prototype.getCalculations = function()
{
	if (oFF.isNull(this.m_calculations))
	{
		this.m_calculations = this.getStoryEntityFactory().createCalculations();
	}
	return this.m_calculations;
};
oFF.OcStory.prototype.getFieldSelections = function()
{
	if (oFF.isNull(this.m_fieldSelections))
	{
		this.m_fieldSelections = this.getStoryEntityFactory().createFieldSelections();
	}
	return this.m_fieldSelections;
};
oFF.OcStory.prototype.getCalculationVariables = function()
{
	if (oFF.isNull(this.m_calculationVariables))
	{
		this.m_calculationVariables = this.getStoryEntityFactory().createCalculationVariables();
	}
	return this.m_calculationVariables;
};
oFF.OcStory.prototype.getDatasets = function()
{
	if (oFF.isNull(this.m_datasets))
	{
		this.m_datasets = this.getStoryEntityFactory().createDatasets();
	}
	return this.m_datasets;
};
oFF.OcStory.prototype.getImages = function()
{
	if (oFF.isNull(this.m_images))
	{
		this.m_images = this.getStoryEntityFactory().createImages(this.getId());
	}
	return this.m_images;
};
oFF.OcStory.prototype.getPageManager = function()
{
	if (oFF.isNull(this.m_pageManager))
	{
		this.m_pageManager = oFF.OcPageManager.create(this, this.getContext());
	}
	return this.m_pageManager;
};
oFF.OcStory.prototype.getStoryEntityFactory = function()
{
	return this.getContext().getStoryEntityFactory();
};
oFF.OcStory.prototype.toString = function()
{
	var sb = oFF.XStringBuffer.create();
	sb.append("Story: ").append(this.getId()).append(" \"").append(this.getName()).append("\"");
	sb.appendNewLine().append(this.getPageManager().toString());
	return sb.toString();
};
oFF.OcStory.prototype.releaseObject = function()
{
	this.m_normalizedName = null;
	this.m_description = null;
	this.m_createdBy = null;
	this.m_createdTime = null;
	this.m_modifiedTime = null;
	this.m_modifiedBy = null;
	this.m_colorSync = null;
	this.m_datasets = oFF.XObjectExt.release(this.m_datasets);
	this.m_measureSyncs = oFF.XObjectExt.release(this.m_measureSyncs);
	this.m_calculations = oFF.XObjectExt.release(this.m_calculations);
	this.m_fieldSelections = oFF.XObjectExt.release(this.m_fieldSelections);
	this.m_thresholds = oFF.XObjectExt.release(this.m_thresholds);
	this.m_images = oFF.XObjectExt.release(this.m_images);
	this.m_pageManager = oFF.XObjectExt.release(this.m_pageManager);
	oFF.DfIdNameObject.prototype.releaseObject.call( this );
};

oFF.OcStoryCatalogLoadAction = function() {};
oFF.OcStoryCatalogLoadAction.prototype = new oFF.SyncAction();
oFF.OcStoryCatalogLoadAction.prototype._ff_c = "OcStoryCatalogLoadAction";

oFF.OcStoryCatalogLoadAction.create = function(options, context)
{
	var action = new oFF.OcStoryCatalogLoadAction();
	action.setupLoadAction(options, context);
	return action;
};
oFF.OcStoryCatalogLoadAction.prototype.m_options = null;
oFF.OcStoryCatalogLoadAction.prototype.setupLoadAction = function(options, context)
{
	if (oFF.isNull(options))
	{
		this.setOptions(new oFF.OcStoryCatalogLoadOptions());
	}
	else
	{
		this.setOptions(options);
	}
	this.setupAction(null, null, null, context);
};
oFF.OcStoryCatalogLoadAction.prototype.processSynchronization = function(syncType)
{
	var connection = this.getActionContext().getConnection();
	var ocpFunction = connection.newRpcFunction(this.getPath());
	var request = ocpFunction.getRpcRequest();
	request.setRequestStructure(this.getQuery());
	request.setMethod(oFF.HttpRequestMethod.HTTP_POST);
	ocpFunction.processFunctionExecution(syncType, this, null);
	return true;
};
oFF.OcStoryCatalogLoadAction.prototype.onFunctionExecuted = function(extResult, response, customIdentifier)
{
	this.addAllMessages(extResult);
	if (extResult.isValid())
	{
		this.setData(new oFF.OcStoryCatalogParser().getStoryCatalog(response.getRootElementGeneric()));
	}
	this.endSync();
};
oFF.OcStoryCatalogLoadAction.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onStoryCatalogLoaded(extResult, data, customIdentifier);
};
oFF.OcStoryCatalogLoadAction.prototype.getPath = function()
{
	return "/sap/fpa/services/rest/epm/contentlib";
};
oFF.OcStoryCatalogLoadAction.prototype.getQuery = function()
{
	var catalogType = this.getOptions().getCatalogType();
	if (catalogType === oFF.OcStoryCatalogType.FAVORITE)
	{
		return this.getQueryForFavoriteStories();
	}
	else if (catalogType === oFF.OcStoryCatalogType.PRIVATE)
	{
		return this.getQueryForPrivateStories();
	}
	else
	{
		return this.getQueryForAllStories();
	}
};
oFF.OcStoryCatalogLoadAction.prototype.getQueryForAllStories = function()
{
	var query = oFF.PrFactory.createStructure();
	query.putString("action", "getSearchList");
	var data = query.putNewStructure("data");
	data.putString("type", "STORY");
	data.putString("value", "*");
	data.putNewList("ownerType");
	data.putInteger("recentlyAccessed", this.getOptions().getNumberOfRecentlyAccessedStories());
	return query;
};
oFF.OcStoryCatalogLoadAction.prototype.getQueryForFavoriteStories = function()
{
	var query = oFF.PrFactory.createStructure();
	query.putString("action", "getAncestorAndSubNodes");
	var data = query.putNewStructure("data");
	data.putString("resourceId", oFF.XStringUtils.concatenate2("FAVORITES_", this.getOrcaUserName()));
	data.putBoolean("detail", false);
	data.putNewList("filter");
	data.putBoolean("bIncTemporary", true);
	data.putBoolean("allowAuthOverride", false);
	return query;
};
oFF.OcStoryCatalogLoadAction.prototype.getQueryForPrivateStories = function()
{
	var query = oFF.PrFactory.createStructure();
	query.putString("action", "getRepoView");
	var data = query.putNewStructure("data");
	data.putString("resourceId", oFF.XStringUtils.concatenate2("PRIVATE_", this.getOrcaUserName()));
	data.putBoolean("detail", false);
	data.putNewList("filter");
	data.putBoolean("bIncTemporary", true);
	data.putBoolean("allowAuthOverride", false);
	data.putBoolean("fetchAncestorNodes", true);
	data.putBoolean("showContentSharedWithUser", true);
	return query;
};
oFF.OcStoryCatalogLoadAction.prototype.getOrcaUserName = function()
{
	return oFF.XString.toUpperCase(this.getActionContext().getConnection().getPersonalization().getInternalUser());
};
oFF.OcStoryCatalogLoadAction.prototype.getOptions = function()
{
	return this.m_options;
};
oFF.OcStoryCatalogLoadAction.prototype.setOptions = function(options)
{
	this.m_options = options;
};
oFF.OcStoryCatalogLoadAction.prototype.releaseObject = function()
{
	oFF.XObjectExt.release(this.m_options);
	oFF.SyncAction.prototype.releaseObject.call( this );
};

oFF.OcStoryLoadAction = function() {};
oFF.OcStoryLoadAction.prototype = new oFF.SyncAction();
oFF.OcStoryLoadAction.prototype._ff_c = "OcStoryLoadAction";

oFF.OcStoryLoadAction.createAndRun = function(syncType, listener, customIdentifier, context, storyId)
{
	var action = new oFF.OcStoryLoadAction();
	action.m_storyId = storyId;
	action.setupActionAndRun(syncType, listener, customIdentifier, context);
	return action;
};
oFF.OcStoryLoadAction.prototype.m_storyId = null;
oFF.OcStoryLoadAction.prototype.m_story = null;
oFF.OcStoryLoadAction.prototype.processSynchronization = function(syncType)
{
	var uri = oFF.XUri.createFromUrl("/sap/fpa/services/rest/epm/contentlib");
	var connection = this.getActionContext().getConnection();
	var ocpFunction = connection.newRpcFunctionByUri(uri);
	var request = ocpFunction.getRpcRequest();
	request.setRequestStructure(this.getQuery());
	ocpFunction.processFunctionExecution(syncType, this, null);
	return true;
};
oFF.OcStoryLoadAction.prototype.getQuery = function()
{
	var query = oFF.PrFactory.createStructure();
	query.putString("action", "getContent");
	var data = query.putNewStructure("data");
	data.putString("resourceId", this.m_storyId);
	data.putBoolean("bIncDependency", false);
	return query;
};
oFF.OcStoryLoadAction.prototype.onFunctionExecuted = function(extResult, response, customIdentifier)
{
	this.addAllMessages(extResult);
	if (extResult.isValid())
	{
		var storyJson = response.getRootElement();
		if (oFF.isNull(storyJson))
		{
			this.addError(0, "No story returned");
			this.endSync();
		}
		else
		{
			var connection = oFF.OcConnection.createByConnection(this.getActionContext().getServiceConfig().getConnectionContainer());
			this.m_story = oFF.OcOrcaStory.create(oFF.OcOrcaContext.create(storyJson, this.getSession(), connection));
			this.getActionContext().processCubeMetadataLoad(this.getActiveSyncType(), this, null, this.m_story.getDatasets().getCubeNames());
		}
	}
	else
	{
		this.endSync();
	}
};
oFF.OcStoryLoadAction.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onStoryLoaded(extResult, data, customIdentifier);
};
oFF.OcStoryLoadAction.prototype.onCubeMetadataLoaded = function(extResult, cubesMetadata, customIdentifier)
{
	var datasets = this.m_story.getDatasets();
	datasets.updateDatasetsWithCubesMetdata(cubesMetadata);
	var datasetsAsReadOnlyList = datasets.getDatasetsAsReadOnlyList();
	var systemName = null;
	var isBearerTokenRequested = false;
	for (var dataSetsIndex = 0; dataSetsIndex < datasetsAsReadOnlyList.size(); dataSetsIndex++)
	{
		var iOcDataset = datasetsAsReadOnlyList.get(dataSetsIndex);
		if (oFF.isNull(systemName))
		{
			systemName = iOcDataset.getSystemName();
			isBearerTokenRequested = this.requestToken(systemName);
		}
		else if (!oFF.XString.isEqual(systemName, iOcDataset.getSystemName()))
		{
			systemName = iOcDataset.getSystemName();
			isBearerTokenRequested = this.requestToken(systemName);
		}
	}
	if (!isBearerTokenRequested)
	{
		this.setData(this.m_story);
		this.endSync();
	}
};
oFF.OcStoryLoadAction.prototype.requestToken = function(systemName)
{
	var connection = this.getActionContext().getServiceConfig().getConnectionContainer().getConnectionPool().getConnection(systemName);
	var systemDescription = connection.getSystemDescription();
	var properties = systemDescription.getProperties();
	var isSFSF = properties.getStringByKey(oFF.OcOrcaConstants.STORY_IS_LIVE_INTEGRATION_TYPE);
	if (oFF.notNull(isSFSF))
	{
		var authenticationToken = systemDescription.getAuthenticationToken();
		if (oFF.isNull(authenticationToken))
		{
			this.getActionContext().processBearerTokenLoad(this.getActiveSyncType(), this, null, systemName);
			return true;
		}
	}
	return false;
};
oFF.OcStoryLoadAction.prototype.releaseObject = function()
{
	this.m_storyId = null;
	this.m_story = oFF.XObjectExt.release(this.m_story);
	oFF.SyncAction.prototype.releaseObject.call( this );
};
oFF.OcStoryLoadAction.prototype.onBearerTokenLoaded = function(extResult, token, customIdentifier)
{
	this.setData(this.m_story);
	this.endSync();
};

oFF.OcCubeMetadataLoadAction = function() {};
oFF.OcCubeMetadataLoadAction.prototype = new oFF.SyncAction();
oFF.OcCubeMetadataLoadAction.prototype._ff_c = "OcCubeMetadataLoadAction";

oFF.OcCubeMetadataLoadAction.createAndRun = function(syncType, listener, customIdentifier, context, cubeNames)
{
	var action = new oFF.OcCubeMetadataLoadAction();
	action.m_cubeNames = cubeNames;
	action.setupActionAndRun(syncType, listener, customIdentifier, context);
	return action;
};
oFF.OcCubeMetadataLoadAction.prototype.m_cubeNames = null;
oFF.OcCubeMetadataLoadAction.prototype.processSynchronization = function(syncType)
{
	var uri = oFF.XUri.createFromUrl("/sap/fpa/services/rest/epm/objectmgr");
	var connection = this.getActionContext().getConnection();
	var ocpFunction = connection.newRpcFunctionByUri(uri);
	var request = ocpFunction.getRpcRequest();
	request.setRequestStructure(this.getQuery());
	ocpFunction.processFunctionExecution(syncType, this, null);
	return true;
};
oFF.OcCubeMetadataLoadAction.prototype.getQuery = function()
{
	var queryObject = oFF.PrFactory.createStructure();
	queryObject.putString("action", "readObjects");
	var dataObject = queryObject.putNewStructure("data");
	var p1List = dataObject.putNewList("p1");
	var cubeNames = this.m_cubeNames;
	for (var cubeIndex = 0; cubeIndex < cubeNames.size(); cubeIndex++)
	{
		var cubeItem = p1List.addNewStructure();
		cubeItem.putString("objectId", cubeNames.get(cubeIndex));
		cubeItem.putBoolean("incDependency", false);
		cubeItem.putBoolean("incSubItems", false);
		var extOptObject = cubeItem.putNewStructure("extOpt");
		extOptObject.putBoolean("detail", true);
		extOptObject.putBoolean("visualization", true);
		extOptObject.putBoolean("rate", true);
		extOptObject.putBoolean("listFormula", true);
		extOptObject.putBoolean("listVersion", true);
		extOptObject.putBoolean("addMetadata", true);
		extOptObject.putBoolean("inclSubObjectTypes", true);
	}
	return queryObject;
};
oFF.OcCubeMetadataLoadAction.prototype.onFunctionExecuted = function(extResult, response, customIdentifier)
{
	this.addAllMessages(extResult);
	if (extResult.isValid())
	{
		this.createCubesMetadata(response);
	}
	this.endSync();
};
oFF.OcCubeMetadataLoadAction.prototype.createCubesMetadata = function(response)
{
	var cubesMetadata = oFF.XSetOfNameObject.create();
	var cubesAsJson = response.getRootElementGeneric().asList();
	for (var i = 0; i < cubesAsJson.size(); i++)
	{
		var cubeAsJson = cubesAsJson.getStructureAt(i);
		var cubeMetadataAsJson = cubeAsJson.getStructureByKey("data");
		if (oFF.notNull(cubeMetadataAsJson))
		{
			var cubeMetadata = oFF.OcOrcaCubeMetadata.create(cubeMetadataAsJson);
			cubesMetadata.add(cubeMetadata);
		}
	}
	this.setData(cubesMetadata);
};
oFF.OcCubeMetadataLoadAction.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onCubeMetadataLoaded(extResult, data, customIdentifier);
};
oFF.OcCubeMetadataLoadAction.prototype.releaseObject = function()
{
	this.m_cubeNames = null;
	oFF.SyncAction.prototype.releaseObject.call( this );
};

oFF.OcBearerTokenLoadAction = function() {};
oFF.OcBearerTokenLoadAction.prototype = new oFF.SyncAction();
oFF.OcBearerTokenLoadAction.prototype._ff_c = "OcBearerTokenLoadAction";

oFF.OcBearerTokenLoadAction.createAndRun = function(syncType, listener, customIdentifier, context, systemName)
{
	var object = new oFF.OcBearerTokenLoadAction();
	object.m_systemName = systemName;
	object.setupActionAndRun(syncType, listener, customIdentifier, context);
	return object;
};
oFF.OcBearerTokenLoadAction.prototype.m_systemName = null;
oFF.OcBearerTokenLoadAction.prototype.processSynchronization = function(syncType)
{
	var uri = oFF.XUri.createFromUrl("/sap/fpa/services/rest/fpa/liveIntegrationConnectionManager?action=getToken");
	var connection = this.getActionContext().getConnection();
	var ocpFunction = connection.newRpcFunctionByUri(uri);
	var request = ocpFunction.getRpcRequest();
	request.setRequestStructure(this.getQuery());
	ocpFunction.processFunctionExecution(syncType, this, null);
	return true;
};
oFF.OcBearerTokenLoadAction.prototype.getQuery = function()
{
	var query = oFF.PrFactory.createStructure();
	query.putStringNotNullAndNotEmpty("connectionName", this.m_systemName);
	return query;
};
oFF.OcBearerTokenLoadAction.prototype.onFunctionExecuted = function(extResult, response, customIdentifier)
{
	this.addAllMessages(extResult);
	if (extResult.isValid())
	{
		var responseJson = response.getRootElement();
		if (oFF.isNull(responseJson))
		{
			this.addError(0, oFF.XStringUtils.concatenate2("System not found ", this.m_systemName));
		}
		else
		{
			var bearerToken = responseJson.getStringByKey("access_token");
			var tokenType = responseJson.getStringByKey("token_type");
			if (oFF.notNull(bearerToken) && oFF.XString.isEqual(tokenType, "Bearer"))
			{
				var connection = this.getActionContext().getServiceConfig().getConnectionContainer().getConnectionPool().getConnection(this.m_systemName);
				var systemDescription = connection.getSystemDescription();
				systemDescription.setAuthenticationType(oFF.AuthenticationType.BEARER);
				systemDescription.setAuthenticationToken(oFF.XAuthenticationToken.create(bearerToken));
				this.setData(oFF.XStringValue.create(bearerToken));
			}
		}
	}
	this.endSync();
};
oFF.OcBearerTokenLoadAction.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onBearerTokenLoaded(extResult, data, customIdentifier);
};

oFF.OcSystemsLoadAction = function() {};
oFF.OcSystemsLoadAction.prototype = new oFF.SyncAction();
oFF.OcSystemsLoadAction.prototype._ff_c = "OcSystemsLoadAction";

oFF.OcSystemsLoadAction.createAndRun = function(syncType, listener, customIdentifier, context, loadingContext)
{
	var object = new oFF.OcSystemsLoadAction();
	object.m_loadingContext = loadingContext;
	object.setupActionAndRun(syncType, listener, customIdentifier, context);
	return object;
};
oFF.OcSystemsLoadAction.getPath = function()
{
	return "/sap/fpa/services/connection/Systems.xsjs";
};
oFF.OcSystemsLoadAction.prototype.m_loadingContext = null;
oFF.OcSystemsLoadAction.prototype.processSynchronization = function(syncType)
{
	var uri = oFF.XUri.createFromUrl(oFF.OcSystemsLoadAction.getPath());
	uri.addQueryElement("currentSystem", this.getCurrentSystemQueryPath());
	uri.addQueryElement("timestamp", oFF.XLong.convertToString(oFF.XDateTime.createCurrentLocalDateTime().getMilliseconds()));
	uri.addQueryElement("$expand", "mapping");
	var connection = this.getActionContext().getConnection();
	var ocpFunction = connection.newRpcFunctionByUri(uri);
	var request = ocpFunction.getRpcRequest();
	request.setMethod(oFF.HttpRequestMethod.HTTP_GET);
	ocpFunction.processFunctionExecution(syncType, this, null);
	return true;
};
oFF.OcSystemsLoadAction.prototype.onFunctionExecuted = function(extResult, response, customIdentifier)
{
	this.addAllMessages(extResult);
	if (extResult.isValid())
	{
		var connData = response.getRootElement();
		if (oFF.isNull(connData))
		{
			this.addError(0, "No catalog returned");
		}
		else
		{
			var systemDescriptions = oFF.OrcaSystemConverter.create().convert(this.getActionContext().getConnection(), connData, this.m_loadingContext);
			this.setData(systemDescriptions);
		}
	}
	this.endSync();
};
oFF.OcSystemsLoadAction.prototype.getCurrentSystemQueryPath = function()
{
	var systemDescription = this.getActionContext().getConnection().getSystemDescription();
	var buffer = oFF.XStringBuffer.create();
	buffer.append("{");
	buffer.append("\"NAME\":\"").append(systemDescription.getSystemName()).append("\",");
	buffer.append("\"SYSTEM_TYPE\":\"").append(systemDescription.getSystemType().getName()).append("\",");
	buffer.append("\"PROTOCOL\":\"").append(systemDescription.getProtocolType().getName()).append("\",");
	buffer.append("\"FPA_AUTHENTICATION_METHOD\":\"").append(oFF.XString.toUpperCase(systemDescription.getAuthenticationType().getName())).append("\",");
	buffer.append("\"HOST\":\"").append(systemDescription.getHost()).append("\",");
	buffer.append("\"PORT\":\"").appendInt(systemDescription.getPort()).append("\",");
	buffer.append("\"TIMEOUT\":\"").appendInt(0).append("\",");
	buffer.append("\"LANGUAGE\":\"").append(systemDescription.getLanguage()).append("\"}");
	return buffer.toString();
};
oFF.OcSystemsLoadAction.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onSystemsLoaded(extResult, data, customIdentifier);
};
oFF.OcSystemsLoadAction.prototype.onBearerTokenLoaded = function(extResult, token, customIdentifier) {};

oFF.OcOrcaStory = function() {};
oFF.OcOrcaStory.prototype = new oFF.OcStory();
oFF.OcOrcaStory.prototype._ff_c = "OcOrcaStory";

oFF.OcOrcaStory.create = function(context)
{
	var story = new oFF.OcOrcaStory();
	story.setupOrcaStory(context);
	return story;
};
oFF.OcOrcaStory.prototype.m_orcaContext = null;
oFF.OcOrcaStory.prototype.setupOrcaStory = function(context)
{
	this.m_orcaContext = context;
	var orcaStoryJson = context.getStoryEntityHelper().getStoryAsJson();
	var storyId = orcaStoryJson.getStringByKey(oFF.OcOrcaConstants.STORY_RESOURCE_ID);
	var storyName = orcaStoryJson.getStringByKey(oFF.OcOrcaConstants.STORY_NAME);
	this.setupStory(storyId, storyName, context);
};
oFF.OcOrcaStory.prototype.processStoryFilters = function()
{
	return this.getStoryEntityHelper().getStoryEntityAsJson().getListByKey(oFF.OcOrcaConstants.STORY_FILTERS);
};
oFF.OcOrcaStory.prototype.processDescription = function()
{
	return this.getStoryEntityHelper().getStoryAsJson().getStringByKey(oFF.OcOrcaConstants.STORY_DESCRIPTION);
};
oFF.OcOrcaStory.prototype.processCreatedBy = function()
{
	return this.getStoryEntityHelper().getStoryAsJson().getStringByKey(oFF.OcOrcaConstants.STORY_CREATED_BY);
};
oFF.OcOrcaStory.prototype.processCreateTime = function()
{
	return oFF.OcOrcaUtils.processTime(this.getStoryEntityHelper().getStoryAsJson().getStringByKey(oFF.OcOrcaConstants.STORY_CREATED_TIME));
};
oFF.OcOrcaStory.prototype.processModifiedBy = function()
{
	return this.getStoryEntityHelper().getStoryAsJson().getStringByKey(oFF.OcOrcaConstants.STORY_MODIFIED_BY);
};
oFF.OcOrcaStory.prototype.processModifiedTime = function()
{
	return oFF.OcOrcaUtils.processTime(this.getStoryEntityHelper().getStoryAsJson().getStringByKey(oFF.OcOrcaConstants.STORY_MODIFIED_TIME));
};
oFF.OcOrcaStory.prototype.processUpdateCounter = function()
{
	return oFF.OcStoryUtils.getIntegerFromStructureByName(this.getStoryEntityHelper().getStoryAsJson(), oFF.OcOrcaConstants.STORY_UPDATE_COUNTER);
};
oFF.OcOrcaStory.prototype.processColorSyncs = function()
{
	return this.getStoryEntityHelper().getStoryEntityAsJson().getStructureByKey(oFF.OcOrcaConstants.STORY_COLOR_SYNC);
};
oFF.OcOrcaStory.prototype.getStoryEntityHelper = function()
{
	return this.getOrcaContext().getStoryEntityHelper();
};
oFF.OcOrcaStory.prototype.getOrcaContext = function()
{
	return this.m_orcaContext;
};
oFF.OcOrcaStory.prototype.releaseObject = function()
{
	this.m_orcaContext = null;
	oFF.OcStory.prototype.releaseObject.call( this );
};

oFF.OcOrcaPage = function() {};
oFF.OcOrcaPage.prototype = new oFF.OcPage();
oFF.OcOrcaPage.prototype._ff_c = "OcOrcaPage";

oFF.OcOrcaPage.create = function(pageId, pageName, pageJson, orcaStory)
{
	var page = new oFF.OcOrcaPage();
	page.setupOrcaPage(pageId, pageName, pageJson, orcaStory);
	return page;
};
oFF.OcOrcaPage.prototype.m_pageJson = null;
oFF.OcOrcaPage.prototype.m_orcaStory = null;
oFF.OcOrcaPage.prototype.m_pageLayout = null;
oFF.OcOrcaPage.prototype.setupOrcaPage = function(pageId, pageName, pageJson, orcaStory)
{
	this.setupPage(pageId, pageName, orcaStory);
	this.m_pageJson = pageJson;
	this.m_orcaStory = orcaStory;
};
oFF.OcOrcaPage.prototype.processPageFilters = function()
{
	return oFF.OcJsonPathEvaluator.getSingleJsonPathElementAsList(this.getPageJson(), oFF.OcOrcaConstants.PATH_FROM_PAGE_TO_FILTERS);
};
oFF.OcOrcaPage.prototype.processPageGroups = function()
{
	return oFF.OcJsonPathEvaluator.getSingleJsonPathElementAsList(this.getPageJson(), oFF.OcOrcaConstants.PATH_FROM_PAGE_TO_GROUPS);
};
oFF.OcOrcaPage.prototype.processBackgroundColor = function()
{
	return this.getPageLayout().processBackgroundColor();
};
oFF.OcOrcaPage.prototype.processIsResponsive = function()
{
	return this.getPageLayout().processIsResponsive();
};
oFF.OcOrcaPage.prototype.getPageLayout = function()
{
	if (oFF.isNull(this.m_pageLayout))
	{
		this.m_pageLayout = oFF.OcOrcaPageLayout.create(this.processPageLayoutJson());
	}
	return this.m_pageLayout;
};
oFF.OcOrcaPage.prototype.processPageLayoutJson = function()
{
	var layoutsJson = oFF.OcJsonPathEvaluator.getJsonPathElementsAsStructures(this.getPageJson(), oFF.OcOrcaConstants.PATH_FROM_PAGE_TO_PAGE_LAYOUT);
	if (oFF.XCollectionUtils.hasElements(layoutsJson))
	{
		if (layoutsJson.size() > 1)
		{
			this.handlePageLayoutError(layoutsJson);
		}
		return layoutsJson.get(0);
	}
	return oFF.PrFactory.createStructure();
};
oFF.OcOrcaPage.prototype.handlePageLayoutError = function(layoutsJson)
{
	if (this.getContext().isTolerant())
	{
		var warning = oFF.OcMessage.newPageWithMultipleLayouts(oFF.Severity.WARNING, this, layoutsJson.size());
		this.getContext().getMessageManager().addMessage(warning);
	}
	else
	{
		var error = oFF.OcMessage.newPageWithMultipleLayouts(oFF.Severity.ERROR, this, layoutsJson.size());
		this.getContext().getMessageManager().addMessage(error);
		throw oFF.XException.createIllegalArgumentException(error.getText());
	}
};
oFF.OcOrcaPage.prototype.getOrcaStory = function()
{
	return this.m_orcaStory;
};
oFF.OcOrcaPage.prototype.getOrcaContext = function()
{
	return this.getOrcaStory().getOrcaContext();
};
oFF.OcOrcaPage.prototype.getPageJson = function()
{
	return this.m_pageJson;
};
oFF.OcOrcaPage.prototype.releaseObject = function()
{
	this.m_pageJson = null;
	this.m_orcaStory = null;
	this.m_pageLayout = oFF.XObjectExt.release(this.m_pageLayout);
	oFF.OcPage.prototype.releaseObject.call( this );
};

oFF.OcQStoryConvProgram = function() {};
oFF.OcQStoryConvProgram.prototype = new oFF.DfShellProgramWithApplication();
oFF.OcQStoryConvProgram.prototype._ff_c = "OcQStoryConvProgram";

oFF.OcQStoryConvProgram.SYSTEM_NAME = "system";
oFF.OcQStoryConvProgram.STORY_ID = "story";
oFF.OcQStoryConvProgram.SAVE_PATH = "path";
oFF.OcQStoryConvProgram.SPLIT_PAGES = "split";
oFF.OcQStoryConvProgram.ANALYTIC_CARD = "card";
oFF.OcQStoryConvProgram.COMPOSIT_ANALYTIC_CARD = "compositCard";
oFF.OcQStoryConvProgram.SPLIT_UQM = "uqm";
oFF.OcQStoryConvProgram.prototype.doSetupProgramMetadata = function(metadata)
{
	oFF.DfShellProgramWithApplication.prototype.doSetupProgramMetadata.call( this , metadata);
	metadata.addOption(oFF.OcQStoryConvProgram.SYSTEM_NAME, "The system name", "", oFF.XValueType.STRING);
	metadata.addOption(oFF.OcQStoryConvProgram.STORY_ID, "The story id name", "", oFF.XValueType.STRING);
	metadata.addOption(oFF.OcQStoryConvProgram.SAVE_PATH, "The path where to save the story", "", oFF.XValueType.STRING);
	metadata.addOption(oFF.OcQStoryConvProgram.SPLIT_PAGES, "Whether to split the story into pages ", "", oFF.XValueType.BOOLEAN);
	metadata.addOption(oFF.OcQStoryConvProgram.SPLIT_UQM, "Whether to split the uqm from the pages ", "", oFF.XValueType.BOOLEAN);
	metadata.addOption(oFF.OcQStoryConvProgram.ANALYTIC_CARD, "Whether to extract an analytic card instead of a full story ", "", oFF.XValueType.BOOLEAN);
	metadata.addOption(oFF.OcQStoryConvProgram.COMPOSIT_ANALYTIC_CARD, "Whether to extract an analytic card instead of a full story (separated widgets) ", "", oFF.XValueType.BOOLEAN);
};
oFF.OcQStoryConvProgram.prototype.runProcess = function()
{
	var session = this.getSession();
	var stdLog = session.getStdlog();
	var prgArgs = this.getArguments();
	var systemName = prgArgs.getStringByKey(oFF.OcQStoryConvProgram.SYSTEM_NAME);
	var storyId = prgArgs.getStringByKey(oFF.OcQStoryConvProgram.STORY_ID);
	var savePath = prgArgs.getStringByKey(oFF.OcQStoryConvProgram.SAVE_PATH);
	var splitPages = prgArgs.getBooleanByKeyExt(oFF.OcQStoryConvProgram.SPLIT_PAGES, false);
	var splitUqm = prgArgs.getBooleanByKeyExt(oFF.OcQStoryConvProgram.SPLIT_UQM, false);
	var card = prgArgs.getBooleanByKeyExt(oFF.OcQStoryConvProgram.ANALYTIC_CARD, false);
	var compositCard = prgArgs.getBooleanByKeyExt(oFF.OcQStoryConvProgram.COMPOSIT_ANALYTIC_CARD, false);
	if (oFF.isNull(systemName) || oFF.isNull(storyId) || oFF.isNull(savePath))
	{
		stdLog.println("Argument(s) missing. You have to indicate a system name, a story id and a path where to store the story:");
		stdLog.println("Argument structure:");
		stdLog.println(oFF.XStringUtils.concatenate5(oFF.XStringUtils.concatenate5("\tstoryconverter -", oFF.OcQStoryConvProgram.SYSTEM_NAME, "=<SYSTEM_NAME> -", oFF.OcQStoryConvProgram.STORY_ID, "=<STORY_ID> -"), oFF.OcQStoryConvProgram.SAVE_PATH, "=<PATH_TO_SAVE> [ -", oFF.OcQStoryConvProgram.SPLIT_PAGES, " ]"));
		stdLog.println("Example call:");
		stdLog.println(oFF.XStringUtils.concatenate3(oFF.XStringUtils.concatenate5("\tstoryconverter -", oFF.OcQStoryConvProgram.SYSTEM_NAME, "=moses -", oFF.OcQStoryConvProgram.STORY_ID, "=7FA33C5B24775509E10000000AB4010F -"), oFF.OcQStoryConvProgram.SAVE_PATH, "=test/path"));
		stdLog.println(oFF.XStringUtils.concatenate3("If you specify the option \"-", oFF.OcQStoryConvProgram.SPLIT_PAGES, "\" external datasources are written into separate files"));
		return false;
	}
	var config = oFF.OcOrcaServiceConfig.create(this.getApplication(), systemName);
	var extServiceResult = config.processOrcaServiceCreation(oFF.SyncType.BLOCKING, null, null);
	if (extServiceResult.hasErrors())
	{
		stdLog.println(oFF.XStringUtils.concatenate2("Cannot connect to system ", systemName));
		return false;
	}
	var service = extServiceResult.getData();
	if (oFF.isNull(service))
	{
		stdLog.println(oFF.XStringUtils.concatenate2("Cannot create Orca service for system ", systemName));
		return false;
	}
	var extResult = service.processStoryLoad(oFF.SyncType.BLOCKING, null, null, storyId);
	if (extResult.hasErrors())
	{
		stdLog.println(oFF.XStringUtils.concatenate2("Cannot load story ", storyId));
		return false;
	}
	var story = extResult.getData();
	var quasarStory = oFF.OcQuasarStory.create(story);
	quasarStory.setQuasarMainLayoutType(oFF.OcLayoutType.CANVAS);
	var quasarTemplateGlobal;
	if (card)
	{
		quasarTemplateGlobal = quasarStory.getQuasarAnalyticalCardDocument();
	}
	else if (compositCard)
	{
		quasarTemplateGlobal = quasarStory.getQuasarCompositeAnalyticalCardDocument();
	}
	else
	{
		quasarTemplateGlobal = quasarStory.getQuasarTabStoryDocument();
	}
	var storyNormalizedName = oFF.OcStoryUtils.normalizeString(quasarStory.getName());
	var storyString = oFF.PrUtils.serialize(quasarTemplateGlobal, true, false, 0);
	storyString = oFF.XString.replace(storyString, oFF.OcOrcaServiceConfig.ORCA_MASTER_SYSTEM_NAME, systemName);
	var storyParent = oFF.XFile.createFromEnvVar(this.getProcess(), oFF.XEnvironmentConstants.FIREFLY_SDK, oFF.XStringUtils.concatenate2(savePath, "/"));
	var storyFolder = oFF.XFile.createFromEnvVar(this.getProcess(), oFF.XEnvironmentConstants.FIREFLY_SDK, oFF.XStringUtils.concatenate4(savePath, "/", storyNormalizedName, "/"));
	storyParent.mkdirs();
	if (!storyParent.isExisting())
	{
		stdLog.println(oFF.XStringUtils.concatenate2("Cannot create directory ", savePath));
		oFF.XObjectExt.release(quasarTemplateGlobal);
		return false;
	}
	var storyFile = storyParent.newChild(oFF.XStringUtils.concatenate2(storyNormalizedName, ".qsa"));
	var outputFileG = oFF.XFile.createByNativePath(this.getProcess(), storyFile.getNativePath());
	outputFileG.saveByteArray(oFF.XByteArray.convertFromString(storyString));
	if (splitPages && !card)
	{
		storyFolder.mkdirs();
		if (!storyFolder.isExisting())
		{
			stdLog.println(oFF.XStringUtils.concatenate2("Cannot create directory ", savePath));
			oFF.XObjectExt.release(quasarTemplateGlobal);
			return false;
		}
		var quasarTemplates = quasarStory.getQuasarPageDocuments();
		var parent = null;
		if (splitUqm)
		{
			parent = oFF.XFile.createByNativePath(this.getProcess(), oFF.XStringUtils.concatenate2(storyFolder.getNativePath(), "uqm"));
		}
		for (var pagesIndex = 0; pagesIndex < quasarTemplates.size(); pagesIndex++)
		{
			var quasarTemplate = quasarTemplates.get(pagesIndex);
			var pageString = oFF.PrUtils.serialize(quasarTemplate, true, false, 0);
			pageString = oFF.XString.replace(pageString, oFF.OcOrcaServiceConfig.ORCA_MASTER_SYSTEM_NAME, systemName);
			var pageStringVal = oFF.XInteger.convertToString(pagesIndex);
			var pageName = oFF.XStringUtils.concatenate3("page", pageStringVal, ".qsa");
			if (splitUqm)
			{
				var parser = oFF.JsonParserFactory.newInstance();
				var jsonContent = parser.parse(pageString);
				jsonContent = this.recursiveAdapt(parent, jsonContent, jsonContent);
				pageString = oFF.PrUtils.serialize(jsonContent, true, true, 4);
				pageName = oFF.XStringUtils.concatenate2("Xt_", pageName);
			}
			storyFolder.mkdirs();
			if (!storyFolder.isExisting())
			{
				stdLog.println(oFF.XStringUtils.concatenate2("Cannot create directory ", savePath));
				oFF.XObjectExt.release(quasarTemplates);
				return false;
			}
			var page = storyFolder.newChild(pageName);
			var outputFile = oFF.XFile.createByNativePath(this.getProcess(), page.getNativePath());
			outputFile.saveByteArray(oFF.XByteArray.convertFromString(pageString));
		}
		oFF.XObjectExt.release(quasarTemplates);
	}
	return true;
};
oFF.OcQStoryConvProgram.prototype.newProgram = function()
{
	var newPrg = new oFF.OcQStoryConvProgram();
	newPrg.setup();
	return newPrg;
};
oFF.OcQStoryConvProgram.prototype.getProgramName = function()
{
	return "storyconverter";
};
oFF.OcQStoryConvProgram.prototype.recursiveAdapt = function(directory, element, fullContent)
{
	if (element.isStructure())
	{
		var structure = element;
		var iterator = structure.getKeysAsIteratorOfString();
		while (iterator.hasNext())
		{
			var key = iterator.next();
			var child = structure.getByKey(key);
			if (oFF.XString.isEqual("DataProviders", key) && child.isList())
			{
				this.reduceDataproviders(directory, child, fullContent);
			}
			else
			{
				if (oFF.notNull(child))
				{
					var newChild = this.recursiveAdapt(directory, child, fullContent);
					if (newChild !== child)
					{
						structure.put(key, newChild);
					}
				}
			}
		}
	}
	else if (element.isList())
	{
		var list = element;
		for (var i = 0; i < list.size(); i++)
		{
			var child2 = list.get(i);
			var newChild2 = this.recursiveAdapt(directory, child2, fullContent);
			if (newChild2 !== child2)
			{
				list.set(i, newChild2);
			}
		}
	}
	return element;
};
oFF.OcQStoryConvProgram.prototype.reduceDataproviders = function(directory, list, fullContent)
{
	directory.mkdirs();
	for (var i = 0; i < list.size(); i++)
	{
		var dp = list.getStructureAt(i);
		if (oFF.notNull(dp))
		{
			var dataProviderName = dp.getStringByKey("Name");
			dp.putString("Name", dataProviderName);
			var fileName = oFF.XStringUtils.concatenate2(dataProviderName, ".uqm");
			var dpFile = directory.newChild(fileName);
			var output = oFF.PrUtils.serialize(dp, true, true, 4);
			dpFile.saveByteArray(oFF.XByteArray.convertFromString(output));
			dp.clear();
			var reference = oFF.XStringUtils.concatenate2("uqm/", fileName);
			dp.putString("ResourceRef", reference);
			dp.putString("Name", dataProviderName);
			this.recursiveRename(fullContent, dataProviderName);
		}
	}
};
oFF.OcQStoryConvProgram.prototype.recursiveRename = function(element, elementId)
{
	if (oFF.notNull(element))
	{
		if (element.isStructure())
		{
			var structure = element;
			var iterator = structure.getKeysAsIteratorOfString();
			while (iterator.hasNext())
			{
				var key = iterator.next();
				var child = structure.getByKey(key);
				if (oFF.XString.isEqual("Binding", key) && child.isStructure())
				{
					var binding = child;
					var source = binding.getStringByKey("Source");
					var theId = oFF.XString.substring(source, 1, -1);
					if (oFF.XString.isEqual(elementId, theId))
					{
						binding.putString("Source", oFF.XStringUtils.concatenate2("%", elementId));
						binding.putString("CacheId", elementId);
					}
				}
				else
				{
					var newChild = this.recursiveRename(child, elementId);
					if (newChild !== child)
					{
						structure.put(key, newChild);
					}
				}
			}
		}
		else if (element.isList())
		{
			var list = element;
			for (var i = 0; i < list.size(); i++)
			{
				var child3 = list.get(i);
				var newChild3 = this.recursiveRename(child3, elementId);
				if (newChild3 !== child3)
				{
					list.set(i, newChild3);
				}
			}
		}
	}
	return element;
};

oFF.OcOrcaService = function() {};
oFF.OcOrcaService.prototype = new oFF.DfService();
oFF.OcOrcaService.prototype._ff_c = "OcOrcaService";

oFF.OcOrcaService.CLAZZ = null;
oFF.OcOrcaService.staticSetup = function()
{
	oFF.OcOrcaService.CLAZZ = oFF.XClass.create(oFF.OcOrcaService);
};
oFF.OcOrcaService.prototype.requiresInitialization = function()
{
	return false;
};
oFF.OcOrcaService.prototype.processStoryLoad = function(syncType, listener, customIdentifier, storyId)
{
	return oFF.OcStoryLoadAction.createAndRun(syncType, listener, customIdentifier, this, storyId);
};
oFF.OcOrcaService.prototype.processSystemLandscapeLoad = function(syncType, listener, customIdentifier, loadingContext)
{
	return oFF.OcSystemsLoadAction.createAndRun(syncType, listener, customIdentifier, this, loadingContext);
};
oFF.OcOrcaService.prototype.processBearerTokenLoad = function(syncType, listener, customIdentifier, systemName)
{
	return oFF.OcBearerTokenLoadAction.createAndRun(syncType, listener, customIdentifier, this, systemName);
};
oFF.OcOrcaService.prototype.processStoryCatalogLoad = function(syncType, listener, customIdentifier, options)
{
	return oFF.OcStoryCatalogLoadAction.create(options, this).processSyncAction(syncType, listener, customIdentifier);
};
oFF.OcOrcaService.prototype.processCubeMetadataLoad = function(syncType, listener, customIdentifier, cubeNames)
{
	return oFF.OcCubeMetadataLoadAction.createAndRun(syncType, listener, customIdentifier, this, cubeNames);
};

oFF.OcOrcaServiceConfig = function() {};
oFF.OcOrcaServiceConfig.prototype = new oFF.DfServiceConfig();
oFF.OcOrcaServiceConfig.prototype._ff_c = "OcOrcaServiceConfig";

oFF.OcOrcaServiceConfig.ORCA_MASTER_SYSTEM_NAME = "orcaMaster";
oFF.OcOrcaServiceConfig.CLAZZ = null;
oFF.OcOrcaServiceConfig.staticSetup = function()
{
	oFF.OcOrcaServiceConfig.CLAZZ = oFF.XClass.create(oFF.OcOrcaServiceConfig);
};
oFF.OcOrcaServiceConfig.create = function(application, systemName)
{
	var object = new oFF.OcOrcaServiceConfig();
	object.setupConfig(application);
	object.setServiceTypeInfo(oFF.StoryModule.SERVICE_TYPE_ORCA_SERVICE);
	object.setSystemName(systemName);
	return object;
};
oFF.OcOrcaServiceConfig.prototype.processOrcaServiceCreation = function(syncType, listener, customIdentifier)
{
	return this.processSyncAction(syncType, listener, customIdentifier);
};
oFF.OcOrcaServiceConfig.prototype.setDataFromService = function(service)
{
	this.setData(service);
};
oFF.OcOrcaServiceConfig.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onOrcaServiceCreated(extResult, data, customIdentifier);
};

oFF.StoryModule = function() {};
oFF.StoryModule.prototype = new oFF.DfModule();
oFF.StoryModule.prototype._ff_c = "StoryModule";

oFF.StoryModule.XS_ORCA_SERVICE = "ORCA_SERVICE";
oFF.StoryModule.SERVICE_TYPE_ORCA_SERVICE = null;
oFF.StoryModule.s_module = null;
oFF.StoryModule.getInstance = function()
{
	if (oFF.isNull(oFF.StoryModule.s_module))
	{
		oFF.DfModule.checkInitialized(oFF.RuntimeModule.getInstance());
		oFF.DfModule.checkInitialized(oFF.ProtocolModule.getInstance());
		oFF.StoryModule.s_module = oFF.DfModule.startExt(new oFF.StoryModule());
		var registrationService = oFF.RegistrationService.getInstance();
		oFF.StoryModule.SERVICE_TYPE_ORCA_SERVICE = oFF.ServiceType.createType(oFF.StoryModule.XS_ORCA_SERVICE);
		oFF.OcOrcaServiceConfig.staticSetup();
		registrationService.addServiceConfig(oFF.StoryModule.XS_ORCA_SERVICE, oFF.OcOrcaServiceConfig.CLAZZ);
		oFF.OcOrcaService.staticSetup();
		registrationService.addService(oFF.StoryModule.XS_ORCA_SERVICE, oFF.OcOrcaService.CLAZZ);
		oFF.OcOrcaConstants.staticSetup();
		oFF.OcQuasarConstants.staticSetup();
		oFF.OcChartType.staticSetup();
		oFF.OcStoryCatalogType.staticSetup();
		oFF.OcWidgetType.staticSetup();
		oFF.OcLayoutType.staticSetup();
		oFF.ProgramRegistration.setProgramFactory(new oFF.OcQStoryConvProgram());
		oFF.DfModule.stopExt(oFF.StoryModule.s_module);
	}
	return oFF.StoryModule.s_module;
};
oFF.StoryModule.prototype.getName = function()
{
	return "ff5500.story";
};

oFF.StoryModule.getInstance();

return sap.firefly;
	} );