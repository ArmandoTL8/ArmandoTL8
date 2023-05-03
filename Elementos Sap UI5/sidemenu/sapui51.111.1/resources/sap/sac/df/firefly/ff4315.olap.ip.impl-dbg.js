/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
[
"sap/sac/df/firefly/ff4310.olap.impl"
],
function(oFF)
{
"use strict";

oFF.XCommandCallback = function() {};
oFF.XCommandCallback.prototype = new oFF.XObject();
oFF.XCommandCallback.prototype._ff_c = "XCommandCallback";

oFF.XCommandCallback.create = function(callbackListener)
{
	var callback = new oFF.XCommandCallback();
	callback.m_callbackListener = callbackListener;
	return callback;
};
oFF.XCommandCallback.prototype.m_callbackListener = null;
oFF.XCommandCallback.prototype.onCommandProcessed = function(extResult, commandResult, customIdentifier)
{
	this.m_callbackListener.onXCommandCallbackProcessed(extResult, commandResult, customIdentifier);
};

oFF.XPlanningCommandCallback = function() {};
oFF.XPlanningCommandCallback.prototype = new oFF.XObject();
oFF.XPlanningCommandCallback.prototype._ff_c = "XPlanningCommandCallback";

oFF.XPlanningCommandCallback.create = function(commandListener)
{
	var callback = new oFF.XPlanningCommandCallback();
	callback.m_commandListener = commandListener;
	return callback;
};
oFF.XPlanningCommandCallback.prototype.m_commandListener = null;
oFF.XPlanningCommandCallback.prototype.onCommandProcessed = function(extPlanningCommandResult)
{
	this.m_commandListener.onXPlanningCommandProcessed(extPlanningCommandResult);
};

oFF.PlanningState = {

	isApplicable:function(application, systemName, response)
	{
			if (oFF.isNull(application))
		{
			return false;
		}
		if (oFF.XStringUtils.isNullOrEmpty(systemName))
		{
			return false;
		}
		return oFF.notNull(response);
	},
	update:function(application, systemName, response, messageCollector)
	{
			if (oFF.PlanningState.isApplicable(application, systemName, response))
		{
			oFF.DataAreaState.updateState(application, systemName, response);
			oFF.PlanningModel.updateState(application, systemName, response, messageCollector);
		}
	},
	updateFromResponse:function(application, systemName, request, response, messageCollector)
	{
			if (oFF.PlanningState.isApplicable(application, systemName, response) && oFF.notNull(request))
		{
			oFF.PlanningModel.updateStateFromResponse(application, systemName, request, response, messageCollector);
		}
	}
};

oFF.DataAreaState = function() {};
oFF.DataAreaState.prototype = new oFF.XObject();
oFF.DataAreaState.prototype._ff_c = "DataAreaState";

oFF.DataAreaState.SINGLETON_KEY = "com.oFF.ip.da.DataAreaState.Map";
oFF.DataAreaState.updateState = function(application, systemName, response)
{
	var systemLandscape = application.getSystemLandscape();
	if (oFF.isNull(systemLandscape))
	{
		return;
	}
	var systemDescription = systemLandscape.getSystemDescription(systemName);
	if (oFF.isNull(systemDescription))
	{
		return;
	}
	var systemType = systemDescription.getSystemType();
	if (!systemType.isTypeOf(oFF.SystemType.BW))
	{
		return;
	}
	var dataAreasList = oFF.PrUtils.getListProperty(response, "DataAreas");
	if (oFF.isNull(dataAreasList))
	{
		return;
	}
	for (var i = 0; i < dataAreasList.size(); i++)
	{
		var dataAreaStructure = oFF.PrUtils.getStructureElement(dataAreasList, i);
		if (oFF.isNull(dataAreaStructure))
		{
			continue;
		}
		var nameString = oFF.PrUtils.getStringProperty(dataAreaStructure, "Name");
		if (oFF.isNull(nameString))
		{
			continue;
		}
		var dataAreaState = oFF.DataAreaState.getDataAreaStateByName(application, systemName, nameString.getString());
		if (oFF.isNull(dataAreaState))
		{
			continue;
		}
		dataAreaState.setSubmitted();
		var modelString = oFF.PrUtils.getStringProperty(dataAreaStructure, "Model");
		if (oFF.notNull(modelString))
		{
			dataAreaState.setModel(modelString.getString());
		}
		var environmentString = oFF.PrUtils.getStringProperty(dataAreaStructure, "Environment");
		if (oFF.notNull(environmentString))
		{
			dataAreaState.setEnvrionment(environmentString.getString());
		}
		var cellLockingString = oFF.PrUtils.getStringProperty(dataAreaStructure, "CellLocking");
		if (oFF.notNull(cellLockingString))
		{
			dataAreaState.setCellLocking(oFF.CellLockingType.lookupByBWName(cellLockingString.getString()));
		}
		var changeCounterNumber = oFF.PrUtils.getNumberProperty(dataAreaStructure, "ChangeCounter");
		if (oFF.notNull(changeCounterNumber))
		{
			dataAreaState.setChangeCounter(changeCounterNumber.getInteger());
		}
		var changedDataBoolean = oFF.PrUtils.getBooleanProperty(dataAreaStructure, "HasChangedData");
		if (oFF.notNull(changedDataBoolean))
		{
			dataAreaState.setChangedData(changedDataBoolean.getBoolean());
		}
		var workStatusActiveBoolean = oFF.PrUtils.getBooleanProperty(dataAreaStructure, "IsWorkStatusActive");
		if (oFF.notNull(workStatusActiveBoolean))
		{
			dataAreaState.setWorkStatusActive(workStatusActiveBoolean.getBoolean());
		}
	}
};
oFF.DataAreaState.getDataAreaStates = function(application, systemName)
{
	if (oFF.isNull(application))
	{
		return null;
	}
	if (oFF.XStringUtils.isNullOrEmpty(systemName))
	{
		return null;
	}
	var singletons = application.getSession().getSessionSingletons();
	if (oFF.isNull(singletons))
	{
		return null;
	}
	var system2DataAreaStates = singletons.getByKey(oFF.DataAreaState.SINGLETON_KEY);
	if (oFF.isNull(system2DataAreaStates))
	{
		system2DataAreaStates = oFF.XHashMapByString.create();
		singletons.put(oFF.DataAreaState.SINGLETON_KEY, system2DataAreaStates);
	}
	var dataAreaStates = system2DataAreaStates.getByKey(systemName);
	if (oFF.isNull(dataAreaStates))
	{
		dataAreaStates = oFF.XHashMapByString.create();
		system2DataAreaStates.put(systemName, dataAreaStates);
	}
	return dataAreaStates;
};
oFF.DataAreaState.createDataAreaState = function(application, systemName, dataArea, environment, model, cellLocking)
{
	var dataAreaStates = oFF.DataAreaState.getDataAreaStates(application, systemName);
	if (oFF.isNull(dataAreaStates))
	{
		return null;
	}
	var dataAreaName = dataArea;
	if (oFF.XStringUtils.isNullOrEmpty(dataAreaName))
	{
		dataAreaName = "DEFAULT";
	}
	var cellLockingType = cellLocking;
	if (oFF.isNull(cellLockingType))
	{
		cellLockingType = oFF.CellLockingType.DEFAULT_SETTING_BACKEND;
	}
	var dataAreaState = dataAreaStates.getByKey(dataAreaName);
	if (oFF.notNull(dataAreaState))
	{
		throw oFF.XException.createIllegalStateException("data area already existing");
	}
	if (oFF.XString.isEqual(dataAreaName, "DEFAULT"))
	{
		if (oFF.XStringUtils.isNotNullAndNotEmpty(environment))
		{
			throw oFF.XException.createIllegalStateException("DEFAULT data area - environment not supported");
		}
		if (oFF.XStringUtils.isNotNullAndNotEmpty(model))
		{
			throw oFF.XException.createIllegalStateException("DEFAULT data area - model not supported");
		}
	}
	dataAreaState = new oFF.DataAreaState();
	dataAreaState.m_systemName = systemName;
	dataAreaState.m_dataArea = dataAreaName;
	dataAreaState.setModel(model);
	dataAreaState.setEnvrionment(environment);
	dataAreaState.setCellLocking(cellLockingType);
	dataAreaState.setChangeCounter(-1);
	dataAreaState.setChangedData(false);
	dataAreaState.setWorkStatusActive(false);
	dataAreaStates.put(dataAreaState.m_dataArea, dataAreaState);
	return dataAreaState;
};
oFF.DataAreaState.getDataAreaStateByName = function(application, systemName, dataArea)
{
	var dataAreaStates = oFF.DataAreaState.getDataAreaStates(application, systemName);
	if (oFF.isNull(dataAreaStates))
	{
		return null;
	}
	var dataAreaName = dataArea;
	if (oFF.XStringUtils.isNullOrEmpty(dataAreaName))
	{
		dataAreaName = "DEFAULT";
	}
	return dataAreaStates.getByKey(dataAreaName);
};
oFF.DataAreaState.removeDataAreaStateByName = function(application, systemName, dataArea)
{
	var dataAreaStates = oFF.DataAreaState.getDataAreaStates(application, systemName);
	if (oFF.isNull(dataAreaStates))
	{
		return;
	}
	var dataAreaName = dataArea;
	if (oFF.XStringUtils.isNullOrEmpty(dataAreaName))
	{
		dataAreaName = "DEFAULT";
	}
	dataAreaStates.remove(dataAreaName);
};
oFF.DataAreaState.getQueryConsumerServicesByName = function(application, systemName, dataArea)
{
	return oFF.DataAreaUtil.getQueryConsumerServicesByName(application, systemName, dataArea);
};
oFF.DataAreaState.getQueryConsumerServices = function(dataArea)
{
	return oFF.DataAreaUtil.getQueryConsumerServices(dataArea);
};
oFF.DataAreaState.getDataAreaStateByQueryConsumerService = function(queryManager)
{
	if (oFF.isNull(queryManager))
	{
		return null;
	}
	var systemType = queryManager.getSystemType();
	if (!systemType.isTypeOf(oFF.SystemType.BW))
	{
		return null;
	}
	var datasource = queryManager.getDataSource();
	if (oFF.isNull(datasource))
	{
		return null;
	}
	var queryDataArea = datasource.getDataArea();
	if (oFF.XStringUtils.isNullOrEmpty(queryDataArea))
	{
		queryDataArea = "DEFAULT";
	}
	return oFF.DataAreaState.getDataAreaStateByName(queryManager.getApplication(), queryManager.getSystemName(), queryDataArea);
};
oFF.DataAreaState.getDataAreaState = function(dataArea)
{
	if (oFF.isNull(dataArea))
	{
		return null;
	}
	var planningService = dataArea.getPlanningService();
	return oFF.DataAreaState.getDataAreaStateByPlanningService(planningService);
};
oFF.DataAreaState.removeDataAreaState = function(dataArea)
{
	if (oFF.isNull(dataArea))
	{
		return;
	}
	var planningService = dataArea.getPlanningService();
	oFF.DataAreaState.removeDataAreaStateByPlanningService(planningService);
};
oFF.DataAreaState.getDataAreaStateByPlanningService = function(planningService)
{
	if (oFF.isNull(planningService))
	{
		return null;
	}
	var serviceConfig = planningService.getPlanningServiceConfig();
	if (oFF.isNull(serviceConfig))
	{
		return null;
	}
	var systemType = serviceConfig.getSystemType();
	if (!systemType.isTypeOf(oFF.SystemType.BW))
	{
		return null;
	}
	var properties = serviceConfig.getProperties();
	if (oFF.isNull(properties))
	{
		return null;
	}
	var planningServiceDataArea = properties.getStringByKeyExt(oFF.PlanningConstants.DATA_AREA, "DEFAULT");
	return oFF.DataAreaState.getDataAreaStateByName(planningService.getApplication(), serviceConfig.getSystemName(), planningServiceDataArea);
};
oFF.DataAreaState.removeDataAreaStateByPlanningService = function(planningService)
{
	if (oFF.isNull(planningService))
	{
		return;
	}
	var serviceConfig = planningService.getPlanningServiceConfig();
	if (oFF.isNull(serviceConfig))
	{
		return;
	}
	var systemType = serviceConfig.getSystemType();
	if (!systemType.isTypeOf(oFF.SystemType.BW))
	{
		return;
	}
	var properties = serviceConfig.getProperties();
	if (oFF.isNull(properties))
	{
		return;
	}
	var planningServiceDataArea = properties.getStringByKeyExt(oFF.PlanningConstants.DATA_AREA, "DEFAULT");
	oFF.DataAreaState.removeDataAreaStateByName(planningService.getApplication(), serviceConfig.getSystemName(), planningServiceDataArea);
};
oFF.DataAreaState.prototype.m_systemName = null;
oFF.DataAreaState.prototype.m_dataArea = null;
oFF.DataAreaState.prototype.m_environment = null;
oFF.DataAreaState.prototype.m_model = null;
oFF.DataAreaState.prototype.m_cellLocking = null;
oFF.DataAreaState.prototype.m_submitted = false;
oFF.DataAreaState.prototype.m_changeCounter = 0;
oFF.DataAreaState.prototype.m_changedData = false;
oFF.DataAreaState.prototype.m_workStatusActive = false;
oFF.DataAreaState.prototype.releaseObject = function()
{
	this.m_systemName = null;
	this.m_dataArea = null;
	this.m_environment = null;
	this.m_model = null;
	this.m_cellLocking = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.DataAreaState.prototype.getSystemName = function()
{
	return this.m_systemName;
};
oFF.DataAreaState.prototype.getDataArea = function()
{
	return this.m_dataArea;
};
oFF.DataAreaState.prototype.getEnvironment = function()
{
	return this.m_environment;
};
oFF.DataAreaState.prototype.setEnvrionment = function(environment)
{
	if (oFF.XStringUtils.isNullOrEmpty(environment))
	{
		this.m_environment = null;
	}
	else
	{
		this.m_environment = environment;
	}
};
oFF.DataAreaState.prototype.getModel = function()
{
	return this.m_model;
};
oFF.DataAreaState.prototype.setModel = function(model)
{
	if (oFF.XStringUtils.isNullOrEmpty(model))
	{
		this.m_model = null;
	}
	else
	{
		this.m_model = model;
	}
};
oFF.DataAreaState.prototype.getCellLocking = function()
{
	return this.m_cellLocking;
};
oFF.DataAreaState.prototype.setCellLocking = function(cellLocking)
{
	if (oFF.isNull(cellLocking))
	{
		this.m_cellLocking = oFF.CellLockingType.DEFAULT_SETTING_BACKEND;
	}
	else
	{
		this.m_cellLocking = cellLocking;
	}
};
oFF.DataAreaState.prototype.isSubmitted = function()
{
	return this.m_submitted;
};
oFF.DataAreaState.prototype.setSubmitted = function()
{
	this.m_submitted = true;
};
oFF.DataAreaState.prototype.getChangeCounter = function()
{
	return this.m_changeCounter;
};
oFF.DataAreaState.prototype.setChangeCounter = function(changeCounter)
{
	this.m_changeCounter = changeCounter;
};
oFF.DataAreaState.prototype.hasChangedData = function()
{
	return this.m_changedData;
};
oFF.DataAreaState.prototype.setChangedData = function(changedData)
{
	this.m_changedData = changedData;
};
oFF.DataAreaState.prototype.isWorkStatusActive = function()
{
	return this.m_workStatusActive;
};
oFF.DataAreaState.prototype.setWorkStatusActive = function(workStatusActive)
{
	this.m_workStatusActive = workStatusActive;
};
oFF.DataAreaState.prototype.isEqualSettings = function(environment, model, cellLocking)
{
	if (!oFF.XString.isEqual(this.m_environment, environment))
	{
		return false;
	}
	if (!oFF.XString.isEqual(this.m_model, model))
	{
		return false;
	}
	return this.m_cellLocking === cellLocking;
};
oFF.DataAreaState.prototype.serializeToJson = function()
{
	var structure = oFF.PrFactory.createStructure();
	structure.putStringNotNull("Name", this.m_dataArea);
	structure.putStringNotNull("Environment", this.m_environment);
	structure.putStringNotNull("Model", this.m_model);
	structure.putString("BackendCellLocking", this.m_cellLocking.toBwName());
	return structure;
};

oFF.PlanningOperationMetadata = function() {};
oFF.PlanningOperationMetadata.prototype = new oFF.XObject();
oFF.PlanningOperationMetadata.prototype._ff_c = "PlanningOperationMetadata";

oFF.PlanningOperationMetadata.prototype.m_dataArea = null;
oFF.PlanningOperationMetadata.prototype.m_planningOperationIdentifier = null;
oFF.PlanningOperationMetadata.prototype.m_instanceId = null;
oFF.PlanningOperationMetadata.prototype.m_dimensions = null;
oFF.PlanningOperationMetadata.prototype.m_variables = null;
oFF.PlanningOperationMetadata.prototype.getDataArea = function()
{
	return this.m_dataArea;
};
oFF.PlanningOperationMetadata.prototype.setDataArea = function(dataArea)
{
	this.m_dataArea = dataArea;
};
oFF.PlanningOperationMetadata.prototype.getPlanningOperationIdentifier = function()
{
	return this.m_planningOperationIdentifier;
};
oFF.PlanningOperationMetadata.prototype.setPlanningOperationIdentifier = function(planningOperationIdentifier)
{
	this.m_planningOperationIdentifier = planningOperationIdentifier;
};
oFF.PlanningOperationMetadata.prototype.getInstanceId = function()
{
	return this.m_instanceId;
};
oFF.PlanningOperationMetadata.prototype.setInstanceId = function(instanceId)
{
	this.m_instanceId = instanceId;
};
oFF.PlanningOperationMetadata.prototype.getDimensions = function()
{
	return this.m_dimensions;
};
oFF.PlanningOperationMetadata.prototype.setDimenstions = function(dimensions)
{
	this.m_dimensions = dimensions;
};
oFF.PlanningOperationMetadata.prototype.getVariables = function()
{
	return this.m_variables;
};
oFF.PlanningOperationMetadata.prototype.setVariables = function(variables)
{
	this.m_variables = variables;
};

oFF.PlanningSequenceStepMetadata = function() {};
oFF.PlanningSequenceStepMetadata.prototype = new oFF.XObject();
oFF.PlanningSequenceStepMetadata.prototype._ff_c = "PlanningSequenceStepMetadata";

oFF.PlanningSequenceStepMetadata.prototype.m_number = 0;
oFF.PlanningSequenceStepMetadata.prototype.m_baseDatasource = null;
oFF.PlanningSequenceStepMetadata.prototype.m_type = null;
oFF.PlanningSequenceStepMetadata.prototype.m_filterName = null;
oFF.PlanningSequenceStepMetadata.prototype.m_planningFunctionName = null;
oFF.PlanningSequenceStepMetadata.prototype.m_queryName = null;
oFF.PlanningSequenceStepMetadata.prototype.m_planningFunctionDescription = null;
oFF.PlanningSequenceStepMetadata.prototype.m_commandType = null;
oFF.PlanningSequenceStepMetadata.prototype.getNumber = function()
{
	return this.m_number;
};
oFF.PlanningSequenceStepMetadata.prototype.setNumber = function(number)
{
	this.m_number = number;
};
oFF.PlanningSequenceStepMetadata.prototype.getBaseDataSource = function()
{
	return this.m_baseDatasource;
};
oFF.PlanningSequenceStepMetadata.prototype.setBaseDataSource = function(baseDatasource)
{
	this.m_baseDatasource = baseDatasource;
};
oFF.PlanningSequenceStepMetadata.prototype.getType = function()
{
	return this.m_type;
};
oFF.PlanningSequenceStepMetadata.prototype.setType = function(type)
{
	this.m_type = type;
};
oFF.PlanningSequenceStepMetadata.prototype.getFilterName = function()
{
	return this.m_filterName;
};
oFF.PlanningSequenceStepMetadata.prototype.setFilterName = function(filterName)
{
	this.m_filterName = filterName;
};
oFF.PlanningSequenceStepMetadata.prototype.getPlanningFunctionName = function()
{
	return this.m_planningFunctionName;
};
oFF.PlanningSequenceStepMetadata.prototype.setPlanningFunctionName = function(name)
{
	this.m_planningFunctionName = name;
};
oFF.PlanningSequenceStepMetadata.prototype.getQueryName = function()
{
	return this.m_queryName;
};
oFF.PlanningSequenceStepMetadata.prototype.setQueryName = function(name)
{
	this.m_queryName = name;
};
oFF.PlanningSequenceStepMetadata.prototype.getPlanningFunctionDescription = function()
{
	return this.m_planningFunctionDescription;
};
oFF.PlanningSequenceStepMetadata.prototype.setPlanningFunctionDescription = function(description)
{
	this.m_planningFunctionDescription = description;
};
oFF.PlanningSequenceStepMetadata.prototype.getCommendType = function()
{
	return this.m_commandType;
};
oFF.PlanningSequenceStepMetadata.prototype.setCommendType = function(type)
{
	this.m_commandType = type;
};

oFF.PlanningBatchRequestDecorator = function() {};
oFF.PlanningBatchRequestDecorator.prototype = new oFF.XObject();
oFF.PlanningBatchRequestDecorator.prototype._ff_c = "PlanningBatchRequestDecorator";

oFF.PlanningBatchRequestDecorator.getBatchRequestDecorator = function(requestStructure)
{
	if (oFF.isNull(requestStructure))
	{
		return null;
	}
	var planningStructure = oFF.PrUtils.getStructureProperty(requestStructure, "Planning");
	if (oFF.isNull(planningStructure))
	{
		return null;
	}
	var commandsList = oFF.PrUtils.getListProperty(planningStructure, "commands");
	if (oFF.isNull(commandsList))
	{
		return null;
	}
	var requestItems = oFF.XList.create();
	for (var i = 0; i < commandsList.size(); i++)
	{
		var requestStructureElement = oFF.PrUtils.getStructureElement(commandsList, i);
		oFF.XObjectExt.assertNotNullExt(requestStructureElement, "illegal planning batch commands syntax");
		var planningRequestItems = oFF.PrFactory.createStructure();
		planningRequestItems.put("Planning", requestStructureElement);
		requestItems.add(planningRequestItems);
	}
	var decorator = new oFF.PlanningBatchRequestDecorator();
	decorator.m_requestItems = requestItems;
	return decorator;
};
oFF.PlanningBatchRequestDecorator.prototype.m_requestItems = null;
oFF.PlanningBatchRequestDecorator.prototype.getItemsSize = function()
{
	return this.m_requestItems.size();
};
oFF.PlanningBatchRequestDecorator.prototype.getRequestItems = function()
{
	return this.m_requestItems;
};
oFF.PlanningBatchRequestDecorator.prototype.buildResponse = function(responseItems)
{
	if (responseItems.size() !== this.getItemsSize())
	{
		throw oFF.XException.createIllegalStateException("illegal planning batch response structure");
	}
	var result = oFF.PrFactory.createStructure();
	var planningList = result.putNewList("Planning");
	for (var i = 0; i < responseItems.size(); i++)
	{
		var responseStructure = responseItems.get(i);
		var planningStructure = oFF.PrUtils.getStructureProperty(responseStructure, "Planning");
		oFF.XObjectExt.assertNotNullExt(planningStructure, "illegal planning batch response structure");
		planningList.add(planningStructure);
	}
	return result;
};

oFF.PlanningBatchRequestDecoratorProvider = function() {};
oFF.PlanningBatchRequestDecoratorProvider.prototype = new oFF.XObject();
oFF.PlanningBatchRequestDecoratorProvider.prototype._ff_c = "PlanningBatchRequestDecoratorProvider";

oFF.PlanningBatchRequestDecoratorProvider.CLAZZ = null;
oFF.PlanningBatchRequestDecoratorProvider.staticSetup = function()
{
	oFF.PlanningBatchRequestDecoratorProvider.CLAZZ = oFF.XClass.create(oFF.PlanningBatchRequestDecoratorProvider);
};
oFF.PlanningBatchRequestDecoratorProvider.prototype.getBatchRequestDecorator = function(requestStructure)
{
	return oFF.PlanningBatchRequestDecorator.getBatchRequestDecorator(requestStructure);
};

oFF.PlanningRsRequestDecorator = function() {};
oFF.PlanningRsRequestDecorator.prototype = new oFF.XObject();
oFF.PlanningRsRequestDecorator.prototype._ff_c = "PlanningRsRequestDecorator";

oFF.PlanningRsRequestDecorator.getResultsetRequestDecorator = function(application, systemDescription, requestStructure)
{
	if (oFF.isNull(application))
	{
		return null;
	}
	if (oFF.isNull(systemDescription))
	{
		return null;
	}
	var systemType = systemDescription.getSystemType();
	if (oFF.isNull(systemType))
	{
		return null;
	}
	if (!systemType.isTypeOf(oFF.SystemType.HANA))
	{
		return null;
	}
	if (oFF.isNull(requestStructure))
	{
		return null;
	}
	var analyticsStructure = oFF.PrUtils.getStructureProperty(requestStructure, "Analytics");
	if (oFF.isNull(analyticsStructure))
	{
		return null;
	}
	var definitionStructure = oFF.PrUtils.getStructureProperty(analyticsStructure, "Definition");
	if (oFF.isNull(definitionStructure))
	{
		return null;
	}
	var newValuesList = oFF.PrUtils.getListProperty(definitionStructure, "NewValues");
	if (oFF.PrUtils.isListEmpty(newValuesList))
	{
		return null;
	}
	var dataSourceStructure = oFF.PrUtils.getStructureProperty(analyticsStructure, "DataSource");
	if (oFF.isNull(dataSourceStructure))
	{
		return null;
	}
	var typeString = oFF.PrUtils.getStringProperty(dataSourceStructure, "Type");
	if (oFF.isNull(typeString))
	{
		return null;
	}
	var type = oFF.MetaObjectType.lookup(typeString.getString());
	if (oFF.isNull(type))
	{
		return null;
	}
	if (type !== oFF.MetaObjectType.PLANNING)
	{
		return null;
	}
	var dataSource = oFF.QFactory.createDataSourceWithType(type, oFF.PrUtils.getStringValueProperty(dataSourceStructure, "ObjectName", null));
	dataSource.setSchemaName(oFF.PrUtils.getStringValueProperty(dataSourceStructure, "SchemaName", null));
	var systemName = systemDescription.getSystemName();
	var planningService = oFF.PlanningModelUtil.getPlanningServiceFromQueryDataSource(application, systemName, dataSource);
	if (oFF.isNull(planningService))
	{
		return null;
	}
	var planningModel = planningService.getPlanningContext();
	if (oFF.isNull(planningModel))
	{
		return null;
	}
	var refreshCommand = planningModel.createCommandRefresh();
	if (oFF.isNull(refreshCommand))
	{
		return null;
	}
	var planningRefreshStructure = refreshCommand.serializeToElement(oFF.QModelFormat.INA_DATA).asStructure();
	if (oFF.isNull(planningRefreshStructure))
	{
		return null;
	}
	var planningBatchDecorator = oFF.PlanningBatchRequestDecorator.getBatchRequestDecorator(planningRefreshStructure);
	var decoratedRequest = oFF.PrFactory.createStructure();
	var batchList = decoratedRequest.putNewList(oFF.ConnectionConstants.INA_BATCH);
	batchList.add(requestStructure);
	if (oFF.isNull(planningBatchDecorator))
	{
		batchList.add(planningRefreshStructure);
	}
	else
	{
		var planningRequests = planningBatchDecorator.getRequestItems();
		if (oFF.notNull(planningRequests))
		{
			for (var i = 0; i < planningRequests.size(); i++)
			{
				batchList.add(planningRequests.get(i));
			}
		}
	}
	var decorator = new oFF.PlanningRsRequestDecorator();
	decorator.m_decoratedRequest = decoratedRequest;
	decorator.m_planningRequest = planningRefreshStructure;
	decorator.m_planningBatchDecorator = planningBatchDecorator;
	return decorator;
};
oFF.PlanningRsRequestDecorator.prototype.m_decoratedRequest = null;
oFF.PlanningRsRequestDecorator.prototype.m_planningRequest = null;
oFF.PlanningRsRequestDecorator.prototype.m_planningResponse = null;
oFF.PlanningRsRequestDecorator.prototype.m_planningBatchDecorator = null;
oFF.PlanningRsRequestDecorator.prototype.getDecoratedRequest = function()
{
	return this.m_decoratedRequest;
};
oFF.PlanningRsRequestDecorator.prototype.getPlanningRequest = function()
{
	return this.m_planningRequest;
};
oFF.PlanningRsRequestDecorator.prototype.getPlanningResponse = function()
{
	return this.m_planningResponse;
};
oFF.PlanningRsRequestDecorator.prototype.buildResponse = function(decoratedResponse)
{
	this.m_planningResponse = null;
	if (oFF.isNull(decoratedResponse))
	{
		return null;
	}
	var batchList = oFF.PrUtils.getListProperty(decoratedResponse, oFF.ConnectionConstants.INA_BATCH);
	if (oFF.isNull(batchList))
	{
		return null;
	}
	var expectedBatchSize;
	if (oFF.isNull(this.m_planningBatchDecorator))
	{
		expectedBatchSize = 2;
	}
	else
	{
		expectedBatchSize = 1 + this.m_planningBatchDecorator.getItemsSize();
	}
	if (batchList.size() !== expectedBatchSize)
	{
		return null;
	}
	var rsResponseStructure = oFF.PrUtils.getStructureElement(batchList, 0);
	if (oFF.isNull(rsResponseStructure))
	{
		return null;
	}
	oFF.PrUtils.removeProperty(rsResponseStructure, "Planning");
	var planningResponseStructure;
	if (oFF.isNull(this.m_planningBatchDecorator))
	{
		planningResponseStructure = oFF.PrUtils.getStructureElement(batchList, 1);
	}
	else
	{
		var responseItems = oFF.XList.create();
		for (var planningBatchIndex = 1; planningBatchIndex < expectedBatchSize; planningBatchIndex++)
		{
			responseItems.add(oFF.PrUtils.getStructureElement(batchList, planningBatchIndex));
		}
		planningResponseStructure = this.m_planningBatchDecorator.buildResponse(responseItems);
	}
	if (oFF.isNull(planningResponseStructure))
	{
		return null;
	}
	this.m_planningResponse = planningResponseStructure;
	return rsResponseStructure;
};

oFF.PlanningRsRequestDecoratorProvider = function() {};
oFF.PlanningRsRequestDecoratorProvider.prototype = new oFF.XObject();
oFF.PlanningRsRequestDecoratorProvider.prototype._ff_c = "PlanningRsRequestDecoratorProvider";

oFF.PlanningRsRequestDecoratorProvider.CLAZZ = null;
oFF.PlanningRsRequestDecoratorProvider.staticSetup = function()
{
	oFF.PlanningRsRequestDecoratorProvider.CLAZZ = oFF.XClass.create(oFF.PlanningRsRequestDecoratorProvider);
};
oFF.PlanningRsRequestDecoratorProvider.prototype.getResultsetRequestDecorator = function(application, systemDescription, requestStructure)
{
	return oFF.PlanningRsRequestDecorator.getResultsetRequestDecorator(application, systemDescription, requestStructure);
};

oFF.PlanningManager = function() {};
oFF.PlanningManager.prototype = new oFF.XObject();
oFF.PlanningManager.prototype._ff_c = "PlanningManager";

oFF.PlanningManager.create = function(queryManager)
{
	var planningManager = new oFF.PlanningManager();
	planningManager.m_queryManager = oFF.XWeakReferenceUtil.getWeakRef(queryManager);
	planningManager.m_allPlanningVersionSettings = oFF.XList.create();
	planningManager.m_planningActionSequenceSettingsMode = oFF.PlanningVersionSettingsMode.SERVER_DEFAULT;
	planningManager.m_versionAliases = oFF.XHashMapOfStringByString.create();
	return planningManager;
};
oFF.PlanningManager.prototype.m_queryManager = null;
oFF.PlanningManager.prototype.m_allPlanningVersionSettings = null;
oFF.PlanningManager.prototype.m_versionRestrictionType = null;
oFF.PlanningManager.prototype.m_planningActionSequenceSettingsMode = null;
oFF.PlanningManager.prototype.m_isPublicVersionEditPossible = false;
oFF.PlanningManager.prototype.m_versionAliases = null;
oFF.PlanningManager.prototype.getQueryManager = function()
{
	return oFF.XWeakReferenceUtil.getHardRef(this.m_queryManager);
};
oFF.PlanningManager.prototype.getResultSetContainer = function()
{
	return this.getQueryManager().getActiveResultSetContainer();
};
oFF.PlanningManager.prototype.getQueryModel = function()
{
	return this.getQueryManager().getQueryModelBase();
};
oFF.PlanningManager.prototype.releaseObject = function()
{
	this.m_queryManager = oFF.XObjectExt.release(this.m_queryManager);
	this.m_allPlanningVersionSettings = oFF.XObjectExt.release(this.m_allPlanningVersionSettings);
	this.m_versionRestrictionType = null;
	this.m_planningActionSequenceSettingsMode = null;
	this.m_versionAliases = oFF.XObjectExt.release(this.m_versionAliases);
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.PlanningManager.prototype.hasChangedValues = function()
{
	var resultSetContainer = this.getResultSetContainer();
	if (!resultSetContainer.hasDataEntryCollection())
	{
		return false;
	}
	var dataEntryCollection = resultSetContainer.getDataEntryCollection();
	return dataEntryCollection.hasChangedValues();
};
oFF.PlanningManager.prototype.hasChangedValueLocks = function()
{
	var resultSetContainer = this.getResultSetContainer();
	if (!resultSetContainer.hasDataEntryCollection())
	{
		return false;
	}
	var dataEntryCollection = resultSetContainer.getDataEntryCollection();
	return dataEntryCollection.hasChangedValueLocks();
};
oFF.PlanningManager.prototype.hasChangedCells = function()
{
	var resultSetContainer = this.getResultSetContainer();
	if (!resultSetContainer.hasDataEntryCollection())
	{
		return false;
	}
	var dataEntryCollection = resultSetContainer.getDataEntryCollection();
	return dataEntryCollection.hasChangedDataEntries();
};
oFF.PlanningManager.prototype.transferNewValues = function()
{
	var resultSetContainer = this.getResultSetContainer();
	var resultSetId = resultSetContainer.getId();
	var dataEntryCollection = resultSetContainer.getDataEntryCollection();
	resultSetContainer.setDataEntryCollection(null);
	var newLineCollection = resultSetContainer.getNewLineCollection();
	resultSetContainer.setNewLineCollection(null);
	var documentIdCollection = resultSetContainer.getDocumentIdCollection();
	resultSetContainer.setDocumentIdCollection(null);
	this.getQueryManager().invalidateState();
	resultSetContainer = this.getResultSetContainer();
	resultSetContainer.setId(resultSetId);
	resultSetContainer.setDataEntryCollection(dataEntryCollection);
	resultSetContainer.setNewLineCollection(newLineCollection);
	resultSetContainer.setDocumentIdCollection(documentIdCollection);
};
oFF.PlanningManager.prototype.resetNewValues = function()
{
	var activeResultSetContainer = this.getResultSetContainer();
	activeResultSetContainer.resetDataEntryCollection();
	activeResultSetContainer.resetNewLineCollection();
};
oFF.PlanningManager.prototype.hasNewValues = function()
{
	var resultSetContainer = this.getResultSetContainer();
	if (resultSetContainer.hasDataEntryCollection())
	{
		var dataEntryCollection = resultSetContainer.getDataEntryCollection();
		if (dataEntryCollection.hasChangedDataEntries())
		{
			return true;
		}
	}
	if (resultSetContainer.hasNewLineCollection())
	{
		var newLineCollection = resultSetContainer.getNewLineCollection();
		return newLineCollection.hasValidNewLines();
	}
	return false;
};
oFF.PlanningManager.prototype.setDataEntryReadOnly = function(dataEntryReadOnly)
{
	this.getQueryModel().setDataEntryReadOnly(dataEntryReadOnly);
};
oFF.PlanningManager.prototype.isDataEntryReadOnly = function()
{
	return this.getQueryModel().isDataEntryReadOnly();
};
oFF.PlanningManager.prototype.isDataEntryEnabled = function()
{
	return this.getQueryModel().isDataEntryEnabled();
};
oFF.PlanningManager.prototype.getPlanningModel = function()
{
	var queryManager = this.getQueryManager();
	if (this.getQueryManager().isReleased())
	{
		return null;
	}
	var application = queryManager.getApplication();
	if (oFF.isNull(application))
	{
		return null;
	}
	var dataSource = queryManager.getDataSource();
	if (oFF.isNull(dataSource))
	{
		return null;
	}
	var planningService = oFF.PlanningModelUtil.getPlanningServiceFromQueryDataSource(application, queryManager.getSystemName(), dataSource);
	if (oFF.isNull(planningService))
	{
		return null;
	}
	var planningContext = planningService.getPlanningContext();
	if (oFF.isNull(planningContext))
	{
		return null;
	}
	return planningContext;
};
oFF.PlanningManager.prototype.getDataAreaName = function()
{
	var queryModel = this.getQueryModel();
	if (oFF.isNull(queryModel))
	{
		return null;
	}
	return queryModel.getDataArea();
};
oFF.PlanningManager.prototype.getDataArea = function()
{
	var dataAreaName = this.getDataAreaName();
	if (oFF.XStringUtils.isNullOrEmpty(dataAreaName))
	{
		return null;
	}
	var queryManager = this.getQueryManager();
	var application = queryManager.getApplication();
	if (oFF.isNull(application))
	{
		return null;
	}
	var planningService = oFF.DataAreaUtil.getPlanningService(application, queryManager.getSystemName(), dataAreaName);
	if (oFF.isNull(planningService))
	{
		return null;
	}
	var planningContext = planningService.getPlanningContext();
	if (oFF.isNull(planningContext))
	{
		return null;
	}
	return planningContext;
};
oFF.PlanningManager.prototype.createDataAreaCommand = function(commandType)
{
	var dataArea = this.getDataArea();
	return oFF.isNull(dataArea) ? null : dataArea.createPlanningContextCommand(commandType);
};
oFF.PlanningManager.prototype.createDataAreaCommandRefresh = function()
{
	return this.createDataAreaCommand(oFF.PlanningContextCommandType.REFRESH);
};
oFF.PlanningManager.prototype.createDataAreaCommandDocSave = function()
{
	return this.createDataAreaCommand(oFF.PlanningContextCommandType.DOC_SAVE);
};
oFF.PlanningManager.prototype.createDataAreaCommandDocReset = function()
{
	return this.createDataAreaCommand(oFF.PlanningContextCommandType.DOC_RESET);
};
oFF.PlanningManager.prototype.getPlanningMode = function()
{
	return this.getQueryModel().getPlanningMode();
};
oFF.PlanningManager.prototype.setPlanningMode = function(planningMode)
{
	this.getQueryModel().setPlanningMode(planningMode);
};
oFF.PlanningManager.prototype.getPlanningRestriction = function()
{
	return this.m_versionRestrictionType;
};
oFF.PlanningManager.prototype.setPlanningRestriction = function(restrictionType)
{
	this.m_versionRestrictionType = restrictionType;
};
oFF.PlanningManager.prototype.supportsDataEntryReadOnly = function()
{
	return this.getQueryModel().supportsDataEntryReadOnly();
};
oFF.PlanningManager.prototype.getPlanningVersionIdentifier = function(versionId, sharedVersion, versionOwner)
{
	return oFF.PlanningVersionIdentifier.create(versionId, sharedVersion, versionOwner);
};
oFF.PlanningManager.prototype.getPlanningVersionSettings = function(versionIdentifier, sequenceId, useExternalView)
{
	return oFF.PlanningVersionSettings.create(versionIdentifier, sequenceId, useExternalView);
};
oFF.PlanningManager.prototype.getPlanningVersionSettingsSimple = function(versionId, sequenceId, useExternalView)
{
	return oFF.PlanningVersionSettingsSimple.create(versionId, sequenceId, useExternalView);
};
oFF.PlanningManager.prototype.addPlanningVersionSettings = function(sequenceSettings)
{
	if (oFF.isNull(sequenceSettings))
	{
		return null;
	}
	var existingSettings = this.findPlanningActionSequenceSettingsInternal(sequenceSettings);
	if (this.isPlanningVersionSettingsEqual(existingSettings, sequenceSettings))
	{
		return existingSettings;
	}
	this.m_allPlanningVersionSettings.removeElement(existingSettings);
	this.m_allPlanningVersionSettings.add(sequenceSettings);
	this.getQueryManager().invalidateState();
	return sequenceSettings;
};
oFF.PlanningManager.prototype.findPlanningActionSequenceSettingsInternal = function(versionIdentifier)
{
	if (oFF.isNull(versionIdentifier))
	{
		return null;
	}
	var versionUniqueName = versionIdentifier.getVersionUniqueName();
	var allPlanningVersionSettingsSize = this.m_allPlanningVersionSettings.size();
	for (var i = 0; i < allPlanningVersionSettingsSize; i++)
	{
		var settings = this.m_allPlanningVersionSettings.get(i);
		if (oFF.XString.isEqual(settings.getVersionUniqueName(), versionUniqueName))
		{
			return settings;
		}
	}
	return null;
};
oFF.PlanningManager.prototype.isPlanningVersionSettingsEqual = function(s1, s2)
{
	if (s1 === s2)
	{
		return true;
	}
	if (oFF.isNull(s1) || oFF.isNull(s2))
	{
		return false;
	}
	if (!oFF.XString.isEqual(s1.getVersionUniqueName(), s2.getVersionUniqueName()))
	{
		return false;
	}
	if (!oFF.XString.isEqual(s1.getActionSequenceId(), s2.getActionSequenceId()))
	{
		return false;
	}
	if (s1.getUseExternalView() !== s2.getUseExternalView())
	{
		return false;
	}
	return s1.getIsRestrictionEnabled() === s2.getIsRestrictionEnabled();
};
oFF.PlanningManager.prototype.deletePlanningVersionSettings = function(versionIdentifier)
{
	var settings = this.findPlanningActionSequenceSettingsInternal(versionIdentifier);
	return this.m_allPlanningVersionSettings.removeElement(settings);
};
oFF.PlanningManager.prototype.getAllPlanningVersionSettings = function()
{
	return this.m_allPlanningVersionSettings;
};
oFF.PlanningManager.prototype.setPlanningVersionSettingsMode = function(settingsMode)
{
	if (oFF.isNull(settingsMode))
	{
		this.m_planningActionSequenceSettingsMode = oFF.PlanningVersionSettingsMode.SERVER_DEFAULT;
	}
	else
	{
		this.m_planningActionSequenceSettingsMode = settingsMode;
	}
};
oFF.PlanningManager.prototype.getPlanningVersionSettingsMode = function()
{
	if (oFF.isNull(this.m_planningActionSequenceSettingsMode))
	{
		return oFF.PlanningVersionSettingsMode.SERVER_DEFAULT;
	}
	return this.m_planningActionSequenceSettingsMode;
};
oFF.PlanningManager.prototype.setDataEntryEnabled = function(dataEntryEnabled)
{
	this.getQueryModel().setDataEntryEnabled(dataEntryEnabled);
};
oFF.PlanningManager.prototype.initializeDataAreaState = function()
{
	var msgMgr = oFF.MessageManagerSimple.createMessageManager();
	if (this.isDataEntryEnabled())
	{
		var queryManager = this.getQueryManager();
		var systemType = queryManager.getSystemType();
		if (systemType.isTypeOf(oFF.SystemType.BW))
		{
			var systemName = queryManager.getSystemName();
			var application = queryManager.getApplication();
			var dataArea = this.getDataAreaName();
			var dataAreaState = oFF.DataAreaState.getDataAreaStateByName(application, systemName, dataArea);
			if (oFF.isNull(dataAreaState))
			{
				dataAreaState = oFF.DataAreaState.createDataAreaState(application, systemName, dataArea, null, null, null);
				if (oFF.isNull(dataAreaState))
				{
					msgMgr.addError(oFF.ErrorCodes.INVALID_STATE, "illegal data area");
				}
			}
			else
			{
				if (!dataAreaState.isSubmitted())
				{
					msgMgr.addErrorExt(oFF.OriginLayer.DRIVER, 0, "illegal data area", dataAreaState);
				}
			}
		}
	}
	return msgMgr;
};
oFF.PlanningManager.prototype.isPublicVersionEditPossible = function()
{
	return this.m_isPublicVersionEditPossible && this.getPlanningMode() === oFF.PlanningMode.FORCE_PLANNING;
};
oFF.PlanningManager.prototype.setPublicVersionEditPossible = function(publicVersionEdit)
{
	this.m_isPublicVersionEditPossible = publicVersionEdit;
};
oFF.PlanningManager.prototype.setVersionAliasById = function(aliasName, versionId)
{
	this.m_versionAliases.put(aliasName, versionId);
	var queryManager = this.getQueryManager();
	if (oFF.notNull(queryManager))
	{
		queryManager.invalidateState();
	}
};
oFF.PlanningManager.prototype.removeVersionAlias = function(aliasName)
{
	this.m_versionAliases.remove(aliasName);
	var queryManager = this.getQueryManager();
	if (oFF.notNull(queryManager))
	{
		queryManager.invalidateState();
	}
};
oFF.PlanningManager.prototype.clearVersionAliases = function()
{
	this.m_versionAliases.clear();
	var queryManager = this.getQueryManager();
	if (oFF.notNull(queryManager))
	{
		queryManager.invalidateState();
	}
};
oFF.PlanningManager.prototype.getVersionAliases = function()
{
	return this.m_versionAliases;
};

oFF.PlanningManagerFactoryImpl = function() {};
oFF.PlanningManagerFactoryImpl.prototype = new oFF.XObject();
oFF.PlanningManagerFactoryImpl.prototype._ff_c = "PlanningManagerFactoryImpl";

oFF.PlanningManagerFactoryImpl.create = function()
{
	return new oFF.PlanningManagerFactoryImpl();
};
oFF.PlanningManagerFactoryImpl.prototype.createPlanningManager = function(queryManager)
{
	return oFF.PlanningManager.create(queryManager);
};

oFF.PlanningModelQueryDataSource = function() {};
oFF.PlanningModelQueryDataSource.prototype = new oFF.XObject();
oFF.PlanningModelQueryDataSource.prototype._ff_c = "PlanningModelQueryDataSource";

oFF.PlanningModelQueryDataSource.prototype.m_description = null;
oFF.PlanningModelQueryDataSource.prototype.m_datasource = null;
oFF.PlanningModelQueryDataSource.prototype.m_primary = false;
oFF.PlanningModelQueryDataSource.prototype.releaseObject = function()
{
	this.m_description = null;
	this.m_datasource = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.PlanningModelQueryDataSource.prototype.getDescription = function()
{
	return this.m_description;
};
oFF.PlanningModelQueryDataSource.prototype.setDescription = function(description)
{
	this.m_description = description;
};
oFF.PlanningModelQueryDataSource.prototype.getDataSource = function()
{
	return this.m_datasource;
};
oFF.PlanningModelQueryDataSource.prototype.setDataSource = function(datasource)
{
	this.m_datasource = datasource;
};
oFF.PlanningModelQueryDataSource.prototype.isPrimary = function()
{
	return this.m_primary;
};
oFF.PlanningModelQueryDataSource.prototype.setPrimary = function(primary)
{
	this.m_primary = primary;
};

oFF.PlanningVersionIdentifier = function() {};
oFF.PlanningVersionIdentifier.prototype = new oFF.XObject();
oFF.PlanningVersionIdentifier.prototype._ff_c = "PlanningVersionIdentifier";

oFF.PlanningVersionIdentifier.create = function(versionId, sharedVersion, versionOwner)
{
	var identifier = new oFF.PlanningVersionIdentifier();
	identifier.m_versionId = versionId;
	identifier.m_sharedVersion = sharedVersion;
	identifier.m_versionOwner = versionOwner;
	return identifier;
};
oFF.PlanningVersionIdentifier.prototype.m_versionId = 0;
oFF.PlanningVersionIdentifier.prototype.m_sharedVersion = false;
oFF.PlanningVersionIdentifier.prototype.m_versionOwner = null;
oFF.PlanningVersionIdentifier.prototype.releaseObject = function()
{
	this.m_versionOwner = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.PlanningVersionIdentifier.prototype.getVersionId = function()
{
	return this.m_versionId;
};
oFF.PlanningVersionIdentifier.prototype.isSharedVersion = function()
{
	return this.m_sharedVersion;
};
oFF.PlanningVersionIdentifier.prototype.getVersionOwner = function()
{
	return this.m_versionOwner;
};
oFF.PlanningVersionIdentifier.prototype.getVersionUniqueName = function()
{
	var sb = oFF.XStringBuffer.create();
	sb.append(oFF.XInteger.convertToString(this.m_versionId));
	if (this.m_sharedVersion)
	{
		sb.append(":");
		if (oFF.XStringUtils.isNotNullAndNotEmpty(this.m_versionOwner))
		{
			sb.append(this.m_versionOwner);
		}
	}
	return sb.toString();
};
oFF.PlanningVersionIdentifier.prototype.toString = function()
{
	return this.getVersionUniqueName();
};

oFF.PlanningVersionParameterMetadata = function() {};
oFF.PlanningVersionParameterMetadata.prototype = new oFF.XObject();
oFF.PlanningVersionParameterMetadata.prototype._ff_c = "PlanningVersionParameterMetadata";

oFF.PlanningVersionParameterMetadata.prototype.m_name = null;
oFF.PlanningVersionParameterMetadata.prototype.m_description = null;
oFF.PlanningVersionParameterMetadata.prototype.m_type = null;
oFF.PlanningVersionParameterMetadata.prototype.m_valueAllowed = false;
oFF.PlanningVersionParameterMetadata.prototype.m_hasValue = false;
oFF.PlanningVersionParameterMetadata.prototype.m_valueElement = null;
oFF.PlanningVersionParameterMetadata.prototype.releaseObject = function()
{
	this.m_name = null;
	this.m_description = null;
	this.m_type = null;
	this.m_valueElement = oFF.XObjectExt.release(this.m_valueElement);
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.PlanningVersionParameterMetadata.prototype.setName = function(name)
{
	this.m_name = name;
};
oFF.PlanningVersionParameterMetadata.prototype.getName = function()
{
	return this.m_name;
};
oFF.PlanningVersionParameterMetadata.prototype.setDescription = function(description)
{
	this.m_description = description;
};
oFF.PlanningVersionParameterMetadata.prototype.getDescription = function()
{
	return this.m_description;
};
oFF.PlanningVersionParameterMetadata.prototype.setType = function(type)
{
	this.m_type = type;
};
oFF.PlanningVersionParameterMetadata.prototype.getType = function()
{
	return this.m_type;
};
oFF.PlanningVersionParameterMetadata.prototype.setValueAllowed = function(valueAllowed)
{
	this.m_valueAllowed = valueAllowed;
};
oFF.PlanningVersionParameterMetadata.prototype.isValueAllowed = function()
{
	return this.m_valueAllowed;
};
oFF.PlanningVersionParameterMetadata.prototype.setHasValue = function(hasValue)
{
	this.m_hasValue = hasValue;
};
oFF.PlanningVersionParameterMetadata.prototype.hasValue = function()
{
	return this.m_hasValue;
};
oFF.PlanningVersionParameterMetadata.prototype.setValue = function(valueElement)
{
	if (oFF.isNull(valueElement))
	{
		this.m_valueElement = null;
	}
	else
	{
		this.m_valueElement = oFF.PrUtils.deepCopyElement(valueElement);
	}
};
oFF.PlanningVersionParameterMetadata.prototype.getValue = function()
{
	return this.m_valueElement;
};

oFF.PlanningVersionStateDescription = function() {};
oFF.PlanningVersionStateDescription.prototype = new oFF.XObject();
oFF.PlanningVersionStateDescription.prototype._ff_c = "PlanningVersionStateDescription";

oFF.PlanningVersionStateDescription.create = function(stateId, description, userName, startTime, endTime, changeCount)
{
	var stateDescription = new oFF.PlanningVersionStateDescription();
	stateDescription.m_id = stateId;
	stateDescription.m_description = description;
	stateDescription.m_userName = userName;
	stateDescription.m_startTime = startTime;
	stateDescription.m_endTime = endTime;
	stateDescription.m_changeCount = changeCount;
	return stateDescription;
};
oFF.PlanningVersionStateDescription.prototype.m_id = null;
oFF.PlanningVersionStateDescription.prototype.m_description = null;
oFF.PlanningVersionStateDescription.prototype.m_userName = null;
oFF.PlanningVersionStateDescription.prototype.m_startTime = null;
oFF.PlanningVersionStateDescription.prototype.m_endTime = null;
oFF.PlanningVersionStateDescription.prototype.m_changeCount = 0;
oFF.PlanningVersionStateDescription.prototype.getId = function()
{
	return this.m_id;
};
oFF.PlanningVersionStateDescription.prototype.getDescription = function()
{
	return this.m_description;
};
oFF.PlanningVersionStateDescription.prototype.getUserName = function()
{
	return this.m_userName;
};
oFF.PlanningVersionStateDescription.prototype.getChangeCount = function()
{
	return this.m_changeCount;
};
oFF.PlanningVersionStateDescription.prototype.getStartTime = function()
{
	return this.m_startTime;
};
oFF.PlanningVersionStateDescription.prototype.getEndTime = function()
{
	return this.m_endTime;
};
oFF.PlanningVersionStateDescription.prototype.toString = function()
{
	var buffer = oFF.XStringBuffer.create();
	buffer.append("(");
	buffer.append("id: ").append(this.m_id);
	buffer.append(", ");
	buffer.append("description: ").append("\"").append(this.m_description).append("\"");
	buffer.append(")");
	return buffer.toString();
};

oFF.PlanningModelCommandHelper = {

	s_helper:null,
	SetHelper:function(helper)
	{
			oFF.PlanningModelCommandHelper.s_helper = helper;
	},
	convertRequestToBatch:function(request)
	{
			return oFF.PlanningModelCommandHelper.s_helper.convertRequestToBatch(request);
	},
	convertResponseFromBatch:function(response)
	{
			return oFF.PlanningModelCommandHelper.s_helper.convertResponseFromBatch(response);
	},
	getCommandResponse:function(commands, responses, commandName)
	{
			return oFF.PlanningModelCommandHelper.s_helper.getCommandResponse(commands, responses, commandName);
	},
	getResponsesReturnCodeStrict:function(responseStructure, messageManager)
	{
			return oFF.PlanningModelCommandHelper.s_helper.getResponsesReturnCodeStrict(responseStructure, messageManager);
	},
	resetVersionParameters:function(commandResponse, version)
	{
			oFF.PlanningModelCommandHelper.s_helper.resetVersionParameters(commandResponse, version);
	},
	processResponseGetVersions:function(commands, responses, model)
	{
			return oFF.PlanningModelCommandHelper.s_helper.processResponseGetVersions(commands, responses, model);
	}
};

oFF.PlanningActionParameterMetadata = function() {};
oFF.PlanningActionParameterMetadata.prototype = new oFF.XObject();
oFF.PlanningActionParameterMetadata.prototype._ff_c = "PlanningActionParameterMetadata";

oFF.PlanningActionParameterMetadata.prototype.m_actionMetadata = null;
oFF.PlanningActionParameterMetadata.prototype.m_parameters = null;
oFF.PlanningActionParameterMetadata.prototype.getActionMetadata = function()
{
	return oFF.XWeakReferenceUtil.getHardRef(this.m_actionMetadata);
};
oFF.PlanningActionParameterMetadata.prototype.setActionMetadata = function(actionMetadata)
{
	this.m_actionMetadata = oFF.XWeakReferenceUtil.getWeakRef(actionMetadata);
};
oFF.PlanningActionParameterMetadata.prototype.getParameters = function()
{
	return this.m_parameters;
};
oFF.PlanningActionParameterMetadata.prototype.setParameters = function(parameters)
{
	this.m_parameters = parameters;
};
oFF.PlanningActionParameterMetadata.prototype.hasParameters = function()
{
	return oFF.PrUtils.isListEmpty(this.m_parameters);
};
oFF.PlanningActionParameterMetadata.prototype.toString = function()
{
	if (oFF.isNull(this.m_parameters))
	{
		return "no parameters";
	}
	return oFF.PrUtils.serialize(this.m_parameters, true, true, 4);
};

oFF.PlanningFunctionMetadata = function() {};
oFF.PlanningFunctionMetadata.prototype = new oFF.PlanningOperationMetadata();
oFF.PlanningFunctionMetadata.prototype._ff_c = "PlanningFunctionMetadata";

oFF.PlanningFunctionMetadata.prototype.m_baseDatasource = null;
oFF.PlanningFunctionMetadata.prototype.getPlanningFunctionIdentifier = function()
{
	return this.getPlanningOperationIdentifier();
};
oFF.PlanningFunctionMetadata.prototype.getBaseDataSource = function()
{
	return this.m_baseDatasource;
};
oFF.PlanningFunctionMetadata.prototype.setBaseDataSource = function(baseDataSource)
{
	this.m_baseDatasource = baseDataSource;
};

oFF.PlanningSequenceMetadata = function() {};
oFF.PlanningSequenceMetadata.prototype = new oFF.PlanningOperationMetadata();
oFF.PlanningSequenceMetadata.prototype._ff_c = "PlanningSequenceMetadata";

oFF.PlanningSequenceMetadata.prototype.m_stepMetadataList = null;
oFF.PlanningSequenceMetadata.prototype.getPlanningSequenceIdentifier = function()
{
	return this.getPlanningOperationIdentifier();
};
oFF.PlanningSequenceMetadata.prototype.getStepMetadataList = function()
{
	return this.m_stepMetadataList;
};
oFF.PlanningSequenceMetadata.prototype.setStepMetadataList = function(stepMetadataList)
{
	this.m_stepMetadataList = stepMetadataList;
};

oFF.PlanningVersionPrivilege = function() {};
oFF.PlanningVersionPrivilege.prototype = new oFF.XObject();
oFF.PlanningVersionPrivilege.prototype._ff_c = "PlanningVersionPrivilege";

oFF.PlanningVersionPrivilege.create = function(planningModel, queryDataSource, versionIdentifier, privilege, grantee)
{
	var result = new oFF.PlanningVersionPrivilege();
	result.setupExt(planningModel, queryDataSource, versionIdentifier, privilege, grantee);
	return result;
};
oFF.PlanningVersionPrivilege.createQualifiedName = function(planningModel, queryDataSource, versionIdentifier, privilege, grantee)
{
	oFF.XObjectExt.assertNotNullExt(planningModel, "planning model null");
	var sb = oFF.XStringBuffer.create();
	sb.append("model:[").append(planningModel.getPlanningModelSchema()).append("]");
	sb.append("[").append(planningModel.getPlanningModelName()).append("]");
	oFF.XObjectExt.assertNotNullExt(queryDataSource, "query data source null");
	if (queryDataSource.getType() !== oFF.MetaObjectType.PLANNING)
	{
		throw oFF.XException.createIllegalArgumentException("illegal query data source object type");
	}
	sb.append("datasource:[").append(queryDataSource.getSchemaName()).append("]");
	sb.append("[").append(queryDataSource.getPackageName()).append("]");
	sb.append("[").append(queryDataSource.getObjectName()).append("]");
	sb.append("version:[").append(versionIdentifier.getVersionUniqueName()).append("]");
	oFF.XObjectExt.assertNotNullExt(privilege, "planning privilege null");
	sb.append("privilege:[").append(privilege.getName()).append("]");
	oFF.XStringUtils.checkStringNotEmpty(grantee, "Grantee null");
	sb.append("grantee:[").append(grantee).append("]");
	return sb.toString();
};
oFF.PlanningVersionPrivilege.prototype.m_planningModel = null;
oFF.PlanningVersionPrivilege.prototype.m_queryDataSource = null;
oFF.PlanningVersionPrivilege.prototype.m_versionIdentifier = null;
oFF.PlanningVersionPrivilege.prototype.m_privilege = null;
oFF.PlanningVersionPrivilege.prototype.m_grantee = null;
oFF.PlanningVersionPrivilege.prototype.m_serverState = null;
oFF.PlanningVersionPrivilege.prototype.m_clientState = null;
oFF.PlanningVersionPrivilege.prototype.m_qualifiedName = null;
oFF.PlanningVersionPrivilege.prototype.releaseObject = function()
{
	this.m_qualifiedName = null;
	this.m_clientState = null;
	this.m_serverState = null;
	this.m_grantee = null;
	this.m_privilege = null;
	this.m_versionIdentifier = oFF.XObjectExt.release(this.m_versionIdentifier);
	this.m_queryDataSource = null;
	this.m_planningModel = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.PlanningVersionPrivilege.prototype.getQualifiedName = function()
{
	return this.m_qualifiedName;
};
oFF.PlanningVersionPrivilege.prototype.setupExt = function(planningModel, queryDataSource, versionIdentifier, privilege, grantee)
{
	oFF.XObjectExt.assertNotNullExt(planningModel, "Planning model null");
	this.m_planningModel = planningModel;
	oFF.XObjectExt.assertNotNullExt(queryDataSource, "Query data source null");
	this.m_queryDataSource = queryDataSource;
	if (this.m_queryDataSource.getType() !== oFF.MetaObjectType.PLANNING)
	{
		throw oFF.XException.createIllegalArgumentException("illegal query data source object type");
	}
	this.m_versionIdentifier = this.getPlanningModel().copyVersionIdentifier(versionIdentifier);
	oFF.XObjectExt.assertNotNullExt(privilege, "Planning privilege null");
	this.m_privilege = privilege;
	oFF.XStringUtils.checkStringNotEmpty(grantee, "grantee null");
	this.m_grantee = grantee;
	this.m_serverState = oFF.PlanningPrivilegeState.NEW;
	this.m_clientState = oFF.PlanningPrivilegeState.NEW;
	this.m_qualifiedName = oFF.PlanningVersionPrivilege.createQualifiedName(this.m_planningModel, this.m_queryDataSource, this.m_versionIdentifier, this.m_privilege, this.m_grantee);
};
oFF.PlanningVersionPrivilege.prototype.getPlanningModel = function()
{
	return this.m_planningModel;
};
oFF.PlanningVersionPrivilege.prototype.getQueryDataSource = function()
{
	return this.m_queryDataSource;
};
oFF.PlanningVersionPrivilege.prototype.getVersionId = function()
{
	return this.m_versionIdentifier.getVersionId();
};
oFF.PlanningVersionPrivilege.prototype.isSharedVersion = function()
{
	return this.m_versionIdentifier.isSharedVersion();
};
oFF.PlanningVersionPrivilege.prototype.getVersionOwner = function()
{
	return this.m_versionIdentifier.getVersionOwner();
};
oFF.PlanningVersionPrivilege.prototype.getVersionUniqueName = function()
{
	return this.m_versionIdentifier.getVersionUniqueName();
};
oFF.PlanningVersionPrivilege.prototype.getPrivilege = function()
{
	return this.m_privilege;
};
oFF.PlanningVersionPrivilege.prototype.getGrantee = function()
{
	return this.m_grantee;
};
oFF.PlanningVersionPrivilege.prototype.getPrivilegeState = function()
{
	return this.m_clientState;
};
oFF.PlanningVersionPrivilege.prototype.getPrivilegeStateServer = function()
{
	return this.m_serverState;
};
oFF.PlanningVersionPrivilege.prototype.setPrivilegeState = function(privilegeState)
{
	this.m_clientState = privilegeState;
};
oFF.PlanningVersionPrivilege.prototype.setPrivilegeStateServer = function(privilegeState)
{
	this.m_serverState = privilegeState;
};
oFF.PlanningVersionPrivilege.prototype.doGrant = function()
{
	if (this.m_serverState === oFF.PlanningPrivilegeState.GRANTED)
	{
		this.m_clientState = oFF.PlanningPrivilegeState.GRANTED;
	}
	else
	{
		this.m_clientState = oFF.PlanningPrivilegeState.TO_BE_GRANTED;
	}
};
oFF.PlanningVersionPrivilege.prototype.doRevoke = function()
{
	if (this.m_serverState === oFF.PlanningPrivilegeState.NEW)
	{
		this.m_clientState = oFF.PlanningPrivilegeState.NEW;
	}
	else
	{
		this.m_clientState = oFF.PlanningPrivilegeState.TO_BE_REVOKED;
	}
};
oFF.PlanningVersionPrivilege.prototype.toString = function()
{
	var sb = oFF.XStringBuffer.create();
	sb.append(this.getQualifiedName());
	var clientState = this.getPrivilegeState();
	if (oFF.notNull(clientState))
	{
		sb.append(" - ");
		sb.append(clientState.getName());
	}
	return sb.toString();
};

oFF.PlanningVersionSettings = function() {};
oFF.PlanningVersionSettings.prototype = new oFF.XObject();
oFF.PlanningVersionSettings.prototype._ff_c = "PlanningVersionSettings";

oFF.PlanningVersionSettings.create = function(versionIdentifier, sequenceId, useExternalView)
{
	var settings = new oFF.PlanningVersionSettings();
	settings.m_versionIdentifier = oFF.PlanningVersionIdentifier.create(versionIdentifier.getVersionId(), versionIdentifier.isSharedVersion(), versionIdentifier.getVersionOwner());
	settings.m_sequenceId = sequenceId;
	settings.m_useExternalView = useExternalView;
	return settings;
};
oFF.PlanningVersionSettings.prototype.m_versionIdentifier = null;
oFF.PlanningVersionSettings.prototype.m_sequenceId = null;
oFF.PlanningVersionSettings.prototype.m_useExternalView = false;
oFF.PlanningVersionSettings.prototype.releaseObject = function()
{
	this.m_versionIdentifier = null;
	this.m_sequenceId = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.PlanningVersionSettings.prototype.getVersionId = function()
{
	return this.m_versionIdentifier.getVersionId();
};
oFF.PlanningVersionSettings.prototype.isSharedVersion = function()
{
	return this.m_versionIdentifier.isSharedVersion();
};
oFF.PlanningVersionSettings.prototype.getVersionOwner = function()
{
	return this.m_versionIdentifier.getVersionOwner();
};
oFF.PlanningVersionSettings.prototype.getVersionUniqueName = function()
{
	return this.m_versionIdentifier.getVersionUniqueName();
};
oFF.PlanningVersionSettings.prototype.getActionSequenceId = function()
{
	return this.m_sequenceId;
};
oFF.PlanningVersionSettings.prototype.getUseExternalView = function()
{
	return this.m_useExternalView;
};
oFF.PlanningVersionSettings.prototype.toString = function()
{
	return this.getVersionUniqueName();
};
oFF.PlanningVersionSettings.prototype.getIsRestrictionEnabled = function()
{
	return true;
};
oFF.PlanningVersionSettings.prototype.createVersionSettings = function()
{
	return oFF.PlanningVersionSettings.create(this, this.getActionSequenceId(), this.getUseExternalView());
};

oFF.PlanningVersionSettingsSimple = function() {};
oFF.PlanningVersionSettingsSimple.prototype = new oFF.XObject();
oFF.PlanningVersionSettingsSimple.prototype._ff_c = "PlanningVersionSettingsSimple";

oFF.PlanningVersionSettingsSimple.create = function(versionId, sequenceId, useExternalView)
{
	var settings = new oFF.PlanningVersionSettingsSimple();
	settings.m_versionId = versionId;
	settings.m_sequenceId = sequenceId;
	settings.m_useExternalView = useExternalView;
	return settings;
};
oFF.PlanningVersionSettingsSimple.prototype.m_versionId = null;
oFF.PlanningVersionSettingsSimple.prototype.m_sequenceId = null;
oFF.PlanningVersionSettingsSimple.prototype.m_useExternalView = false;
oFF.PlanningVersionSettingsSimple.prototype.releaseObject = function()
{
	this.m_versionId = null;
	this.m_sequenceId = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.PlanningVersionSettingsSimple.prototype.getVersionId = function()
{
	return -1;
};
oFF.PlanningVersionSettingsSimple.prototype.isSharedVersion = function()
{
	return false;
};
oFF.PlanningVersionSettingsSimple.prototype.getVersionOwner = function()
{
	return null;
};
oFF.PlanningVersionSettingsSimple.prototype.getVersionUniqueName = function()
{
	return this.m_versionId;
};
oFF.PlanningVersionSettingsSimple.prototype.getActionSequenceId = function()
{
	return this.m_sequenceId;
};
oFF.PlanningVersionSettingsSimple.prototype.getUseExternalView = function()
{
	return this.m_useExternalView;
};
oFF.PlanningVersionSettingsSimple.prototype.toString = function()
{
	return this.getVersionUniqueName();
};
oFF.PlanningVersionSettingsSimple.prototype.getIsRestrictionEnabled = function()
{
	return true;
};
oFF.PlanningVersionSettingsSimple.prototype.createVersionSettings = function()
{
	return oFF.PlanningVersionSettingsSimple.create(this.m_versionId, this.m_sequenceId, this.m_useExternalView);
};

oFF.PlanningActionMetadata = function() {};
oFF.PlanningActionMetadata.prototype = new oFF.XObject();
oFF.PlanningActionMetadata.prototype._ff_c = "PlanningActionMetadata";

oFF.PlanningActionMetadata.prototype.m_actionId = null;
oFF.PlanningActionMetadata.prototype.m_actionName = null;
oFF.PlanningActionMetadata.prototype.m_actionDescription = null;
oFF.PlanningActionMetadata.prototype.m_defaultAction = false;
oFF.PlanningActionMetadata.prototype.m_actionType = null;
oFF.PlanningActionMetadata.prototype.m_actionParameterMetadata = null;
oFF.PlanningActionMetadata.prototype.m_actionParameterNames = null;
oFF.PlanningActionMetadata.prototype.getActionId = function()
{
	return this.m_actionId;
};
oFF.PlanningActionMetadata.prototype.setActionId = function(actionId)
{
	this.m_actionId = actionId;
};
oFF.PlanningActionMetadata.prototype.getActionName = function()
{
	return this.m_actionName;
};
oFF.PlanningActionMetadata.prototype.setActionName = function(actionName)
{
	this.m_actionName = actionName;
};
oFF.PlanningActionMetadata.prototype.getActionDescription = function()
{
	return this.m_actionDescription;
};
oFF.PlanningActionMetadata.prototype.setActionDescription = function(actionDescription)
{
	this.m_actionDescription = actionDescription;
};
oFF.PlanningActionMetadata.prototype.getActionType = function()
{
	if (oFF.isNull(this.m_actionType))
	{
		return oFF.PlanningActionType.UNKNOWN;
	}
	return this.m_actionType;
};
oFF.PlanningActionMetadata.prototype.setActionType = function(actionType)
{
	this.m_actionType = actionType;
};
oFF.PlanningActionMetadata.prototype.isDefault = function()
{
	return this.m_defaultAction;
};
oFF.PlanningActionMetadata.prototype.setDefault = function(defaultAction)
{
	this.m_defaultAction = defaultAction;
};
oFF.PlanningActionMetadata.prototype.getActionParameterMetadata = function()
{
	return this.m_actionParameterMetadata;
};
oFF.PlanningActionMetadata.prototype.setActionParameterMetadata = function(actionParameterMetadata)
{
	this.m_actionParameterMetadata = actionParameterMetadata;
};
oFF.PlanningActionMetadata.prototype.setActionParameterNames = function(parameterNames)
{
	if (oFF.notNull(this.m_actionParameterNames))
	{
		throw oFF.XException.createIllegalStateException("already set");
	}
	this.m_actionParameterNames = oFF.XListOfString.create();
	if (oFF.notNull(parameterNames))
	{
		this.m_actionParameterNames.addAll(parameterNames);
	}
};
oFF.PlanningActionMetadata.prototype.getActionParameterNames = function()
{
	oFF.XObjectExt.assertNotNullExt(this.m_actionParameterNames, "not set");
	return this.m_actionParameterNames;
};
oFF.PlanningActionMetadata.prototype.toString = function()
{
	var sb = oFF.XStringBuffer.create();
	sb.append("action: ");
	sb.append("id: ");
	if (oFF.notNull(this.m_actionId))
	{
		sb.append(this.m_actionId);
	}
	sb.appendNewLine();
	sb.append("name: ");
	if (oFF.notNull(this.m_actionName))
	{
		sb.append(this.m_actionName);
	}
	sb.appendNewLine();
	sb.append("description: ");
	if (oFF.notNull(this.m_actionDescription))
	{
		sb.append(this.m_actionDescription);
	}
	sb.appendNewLine();
	sb.append("type: ");
	if (oFF.notNull(this.m_actionType))
	{
		sb.append(this.m_actionType.toString());
		sb.append(" ");
	}
	if (this.m_defaultAction)
	{
		sb.append("default=true");
	}
	sb.appendNewLine();
	var actionParameterMetadata = this.getActionParameterMetadata();
	if (oFF.isNull(actionParameterMetadata))
	{
		sb.append("action does not have parameters");
	}
	else
	{
		sb.appendLine("parameters:");
		sb.append(actionParameterMetadata.toString());
	}
	sb.appendNewLine();
	return sb.toString();
};

oFF.XCmdCreatePlanningOperation = function() {};
oFF.XCmdCreatePlanningOperation.prototype = new oFF.XCommand();
oFF.XCmdCreatePlanningOperation.prototype._ff_c = "XCmdCreatePlanningOperation";

oFF.XCmdCreatePlanningOperation.CLAZZ = null;
oFF.XCmdCreatePlanningOperation.CMD_NAME = "CREATE_PLANNING_OPERATION";
oFF.XCmdCreatePlanningOperation.PARAM_I_DATA_AREA = "DATA_AREA";
oFF.XCmdCreatePlanningOperation.PARAM_I_PLANNING_OPERATION_IDENTIFIER = "PLANNING_OPERATION_IDENTIFIER";
oFF.XCmdCreatePlanningOperation.PARAM_E_PLANNING_OPERATION = "PLANNING_OPERATION";
oFF.XCmdCreatePlanningOperation.staticSetup = function()
{
	oFF.XCmdCreatePlanningOperation.CLAZZ = oFF.XClass.create(oFF.XCmdCreatePlanningOperation);
};
oFF.XCmdCreatePlanningOperation.prototype.getCommandResultClass = function()
{
	return oFF.XCmdCreatePlanningOperationResult.CLAZZ;
};

oFF.XCmdCreatePlanningOperationResult = function() {};
oFF.XCmdCreatePlanningOperationResult.prototype = new oFF.XCommandResult();
oFF.XCmdCreatePlanningOperationResult.prototype._ff_c = "XCmdCreatePlanningOperationResult";

oFF.XCmdCreatePlanningOperationResult.CLAZZ = null;
oFF.XCmdCreatePlanningOperationResult.staticSetup = function()
{
	oFF.XCmdCreatePlanningOperationResult.CLAZZ = oFF.XClass.create(oFF.XCmdCreatePlanningOperationResult);
};
oFF.XCmdCreatePlanningOperationResult.prototype.process = function()
{
	var dataArea = this.getParameter(oFF.XCmdCreatePlanningOperation.PARAM_I_DATA_AREA);
	var planningOperationIdentifier = this.getParameter(oFF.XCmdCreatePlanningOperation.PARAM_I_PLANNING_OPERATION_IDENTIFIER);
	var planningOperationType = planningOperationIdentifier.getPlanningOperationType();
	if (planningOperationType !== oFF.PlanningOperationType.PLANNING_FUNCTION && planningOperationType !== oFF.PlanningOperationType.PLANNING_SEQUENCE)
	{
		this.getMessageManager().addError(0, "illegal planning operation type");
		this.onProcessFinished();
		return;
	}
	var requestGetPlanningOperationMetadata = dataArea.createRequestGetPlanningOperationMetadata(planningOperationIdentifier);
	requestGetPlanningOperationMetadata.processCommand(this.getSyncType(), oFF.XPlanningCommandCallback.create(this), null);
};
oFF.XCmdCreatePlanningOperationResult.prototype.onXPlanningCommandProcessed = function(extPlanningCommandResult)
{
	this.getMessageManager().addAllMessages(extPlanningCommandResult);
	if (extPlanningCommandResult.isValid())
	{
		var dataArea = this.getParameter(oFF.XCmdCreatePlanningOperation.PARAM_I_DATA_AREA);
		var planningOperationIdentifier = this.getParameter(oFF.XCmdCreatePlanningOperation.PARAM_I_PLANNING_OPERATION_IDENTIFIER);
		var planningOperationType = planningOperationIdentifier.getPlanningOperationType();
		var planningOperation = null;
		if (planningOperationType === oFF.PlanningOperationType.PLANNING_FUNCTION)
		{
			var planningFunction = new oFF.PlanningFunction();
			planningFunction.setCommandType(oFF.PlanningCommandType.PLANNING_FUNCTION);
			planningFunction.setPlanningService(dataArea.getPlanningService());
			planningFunction.setPlanningContext(dataArea);
			planningFunction.setCommandIdentifier(planningOperationIdentifier);
			planningFunction.setPlanningOperationMetadata(extPlanningCommandResult.getData().getPlanningFunctionMetadata());
			planningFunction.initializePlanningOperation();
			planningOperation = planningFunction;
		}
		else if (planningOperationType === oFF.PlanningOperationType.PLANNING_SEQUENCE)
		{
			var planningSequence = new oFF.PlanningSequence();
			planningSequence.setCommandType(oFF.PlanningCommandType.PLANNING_SEQUENCE);
			planningSequence.setPlanningService(dataArea.getPlanningService());
			planningSequence.setPlanningContext(dataArea);
			planningSequence.setCommandIdentifier(planningOperationIdentifier);
			planningSequence.setPlanningOperationMetadata(extPlanningCommandResult.getData().getPlanningSequenceMetadata());
			planningSequence.initializePlanningOperation();
			planningOperation = planningSequence;
		}
		if (oFF.isNull(planningOperation))
		{
			this.getMessageManager().addError(0, "illegal planning operation type");
			this.onProcessFinished();
			return;
		}
		this.addResultParameter(oFF.XCmdCreatePlanningOperation.PARAM_E_PLANNING_OPERATION, planningOperation);
	}
	this.onProcessFinished();
};

oFF.XCmdInitPlanningStep = function() {};
oFF.XCmdInitPlanningStep.prototype = new oFF.XCommand();
oFF.XCmdInitPlanningStep.prototype._ff_c = "XCmdInitPlanningStep";

oFF.XCmdInitPlanningStep.CLAZZ = null;
oFF.XCmdInitPlanningStep.CMD_NAME = "INIT_PLANNING_STEP";
oFF.XCmdInitPlanningStep.PARAM_I_PLANNING_MODEL = "PLANNING_MODEL";
oFF.XCmdInitPlanningStep.PARAM_I_STEP = "STEP";
oFF.XCmdInitPlanningStep.STEP_1_REFRESH_VERSIONS = null;
oFF.XCmdInitPlanningStep.STEP_2_INIT_VERSIONS = null;
oFF.XCmdInitPlanningStep.staticSetup = function()
{
	oFF.XCmdInitPlanningStep.CLAZZ = oFF.XClass.create(oFF.XCmdInitPlanningStep);
	oFF.XCmdInitPlanningStep.STEP_1_REFRESH_VERSIONS = oFF.XStringValue.create("STEP_1_REFRESH_VERSIONS");
	oFF.XCmdInitPlanningStep.STEP_2_INIT_VERSIONS = oFF.XStringValue.create("STEP_2_INIT_VERSIONS");
};
oFF.XCmdInitPlanningStep.prototype.getCommandResultClass = function()
{
	return oFF.XCmdInitPlanningStepResult.CLAZZ;
};

oFF.XCmdInitPlanningStepResult = function() {};
oFF.XCmdInitPlanningStepResult.prototype = new oFF.XCommandResult();
oFF.XCmdInitPlanningStepResult.prototype._ff_c = "XCmdInitPlanningStepResult";

oFF.XCmdInitPlanningStepResult.CLAZZ = null;
oFF.XCmdInitPlanningStepResult.staticSetup = function()
{
	oFF.XCmdInitPlanningStepResult.CLAZZ = oFF.XClass.create(oFF.XCmdInitPlanningStepResult);
};
oFF.XCmdInitPlanningStepResult.prototype.process = function()
{
	var planningModel = this.getParameter(oFF.XCmdInitPlanningStep.PARAM_I_PLANNING_MODEL);
	if (oFF.isNull(planningModel))
	{
		this.onProcessFinished();
	}
	var step = this.getParameter(oFF.XCmdInitPlanningStep.PARAM_I_STEP);
	if (step === oFF.XCmdInitPlanningStep.STEP_1_REFRESH_VERSIONS)
	{
		this.processStep1RefreshVersions(planningModel);
	}
	else if (step === oFF.XCmdInitPlanningStep.STEP_2_INIT_VERSIONS)
	{
		this.processStep2InitVersions(planningModel);
	}
	else
	{
		this.onProcessFinished();
	}
};
oFF.XCmdInitPlanningStepResult.prototype.processStep1RefreshVersions = function(planningModel)
{
	if (planningModel.isWithSharedVersions())
	{
		var userName = planningModel.getBackendUserName();
		if (oFF.XStringUtils.isNullOrEmpty(userName))
		{
			this.getMessageManager().addErrorExt(oFF.OriginLayer.DRIVER, oFF.ErrorCodes.INVALID_STATE, "undo/redo stack with shared versions requires backend user", null);
		}
	}
	var planningModelBehaviour = planningModel.getPlanningModelBehaviour();
	if (oFF.isNull(planningModelBehaviour))
	{
		this.getMessageManager().addErrorExt(oFF.OriginLayer.DRIVER, oFF.ErrorCodes.INVALID_STATE, "planning model behavior is null", null);
	}
	var commandType = oFF.PlanningContextCommandType.REFRESH;
	if (planningModelBehaviour === oFF.PlanningModelBehaviour.ENFORCE_NO_VERSION_HARD_DELETE)
	{
		commandType = oFF.PlanningContextCommandType.HARD_DELETE;
	}
	var command = planningModel.createPlanningContextCommand(commandType);
	command.processCommand(this.getSyncType(), oFF.XPlanningCommandCallback.create(this), oFF.XCmdInitPlanningStep.STEP_1_REFRESH_VERSIONS);
};
oFF.XCmdInitPlanningStepResult.prototype.processStep2InitVersions = function(planningModel)
{
	var planningModelBehaviour = planningModel.getPlanningModelBehaviour();
	if (planningModelBehaviour === oFF.PlanningModelBehaviour.CREATE_DEFAULT_VERSION)
	{
		if (this.checkBlocking(planningModelBehaviour))
		{
			oFF.PlanningModelUtil.initCreateDefaultVersion(planningModel);
		}
	}
	else if (planningModelBehaviour === oFF.PlanningModelBehaviour.ENFORCE_NO_VERSION || planningModelBehaviour === oFF.PlanningModelBehaviour.ENFORCE_NO_VERSION_HARD_DELETE)
	{
		if (this.checkBlocking(planningModelBehaviour))
		{
			oFF.PlanningModelUtil.initEnforceNoVersion(planningModel);
		}
	}
	else if (planningModelBehaviour === oFF.PlanningModelBehaviour.ENFORCE_SINGLE_VERSION)
	{
		if (this.checkBlocking(planningModelBehaviour))
		{
			oFF.PlanningModelUtil.initEnforceSingleVersion(planningModel);
		}
	}
	this.onProcessFinished();
};
oFF.XCmdInitPlanningStepResult.prototype.checkBlocking = function(planningModelBehaviour)
{
	if (this.getSyncType() !== oFF.SyncType.BLOCKING)
	{
		this.getMessageManager().addErrorExt(oFF.OriginLayer.DRIVER, oFF.ErrorCodes.INVALID_STATE, oFF.XStringBuffer.create().append("Planning model behaviour ").append(planningModelBehaviour.getName()).append(" is only supported in blocking mode").toString(), null);
		return false;
	}
	return true;
};
oFF.XCmdInitPlanningStepResult.prototype.onXPlanningCommandProcessed = function(extPlanningCommandResult)
{
	this.getMessageManager().addAllMessages(extPlanningCommandResult);
	this.onProcessFinished();
};

oFF.PlanningVersion = function() {};
oFF.PlanningVersion.prototype = new oFF.XObject();
oFF.PlanningVersion.prototype._ff_c = "PlanningVersion";

oFF.PlanningVersion.create = function()
{
	var version = new oFF.PlanningVersion();
	version.m_useExternalView = true;
	version.m_isRestrictionEnabled = true;
	return version;
};
oFF.PlanningVersion.parametersStructure2ParametersStringMap = function(parametersStructure)
{
	if (oFF.isNull(parametersStructure))
	{
		return null;
	}
	var parameters = oFF.XHashMapOfStringByString.create();
	var names = oFF.PrUtils.getKeysAsReadOnlyListOfString(parametersStructure, null);
	if (oFF.notNull(names))
	{
		for (var i = 0; i < names.size(); i++)
		{
			var name = names.get(i);
			var valueElement = oFF.PrUtils.getProperty(parametersStructure, name);
			if (oFF.isNull(valueElement))
			{
				continue;
			}
			if (valueElement.getType() !== oFF.PrElementType.STRING)
			{
				continue;
			}
			var stringElement = valueElement;
			parameters.put(name, stringElement.getString());
		}
	}
	return parameters;
};
oFF.PlanningVersion.parametersStringMap2ParametersStructure = function(parameters)
{
	if (oFF.isNull(parameters))
	{
		return null;
	}
	var parametersStructure = oFF.PrFactory.createStructure();
	var keys = parameters.getKeysAsIteratorOfString();
	while (keys.hasNext())
	{
		var key = keys.next();
		var value = parameters.getByKey(key);
		parametersStructure.putString(key, value);
	}
	return parametersStructure;
};
oFF.PlanningVersion.prototype.m_planningModel = null;
oFF.PlanningVersion.prototype.m_versionIdentifier = null;
oFF.PlanningVersion.prototype.m_versionDescription = null;
oFF.PlanningVersion.prototype.m_versionState = null;
oFF.PlanningVersion.prototype.m_privilege = null;
oFF.PlanningVersion.prototype.m_parametersStructure = null;
oFF.PlanningVersion.prototype.m_creationTime = null;
oFF.PlanningVersion.prototype.m_backupTime = null;
oFF.PlanningVersion.prototype.m_actionSequenceId = null;
oFF.PlanningVersion.prototype.m_useExternalView = false;
oFF.PlanningVersion.prototype.m_totalChangesSize = 0;
oFF.PlanningVersion.prototype.m_undoChangesSize = 0;
oFF.PlanningVersion.prototype.m_sequenceActive = false;
oFF.PlanningVersion.prototype.m_sequenceDescription = null;
oFF.PlanningVersion.prototype.m_sequenceCreateTime = null;
oFF.PlanningVersion.prototype.m_actionActive = false;
oFF.PlanningVersion.prototype.m_actionStartTime = null;
oFF.PlanningVersion.prototype.m_actionEndTime = null;
oFF.PlanningVersion.prototype.m_isRestrictionEnabled = false;
oFF.PlanningVersion.prototype.m_userName = null;
oFF.PlanningVersion.prototype.m_isShowingAsPublicVersion = false;
oFF.PlanningVersion.prototype.m_sourceVersionName = null;
oFF.PlanningVersion.prototype.releaseObject = function()
{
	this.m_planningModel = null;
	this.m_versionIdentifier = oFF.XObjectExt.release(this.m_versionIdentifier);
	this.m_versionDescription = null;
	this.m_versionState = null;
	this.m_privilege = null;
	this.m_parametersStructure = oFF.XObjectExt.release(this.m_parametersStructure);
	this.m_creationTime = oFF.XObjectExt.release(this.m_creationTime);
	this.m_backupTime = oFF.XObjectExt.release(this.m_backupTime);
	this.m_sequenceCreateTime = oFF.XObjectExt.release(this.m_sequenceCreateTime);
	this.m_actionStartTime = oFF.XObjectExt.release(this.m_actionStartTime);
	this.m_actionEndTime = oFF.XObjectExt.release(this.m_actionEndTime);
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.PlanningVersion.prototype.isEqualTo = function(other)
{
	if (oFF.isNull(other))
	{
		return false;
	}
	var otherVersion = other;
	if (otherVersion.getPlanningModel() !== this.getPlanningModel())
	{
		return false;
	}
	if (!oFF.XString.isEqual(otherVersion.getVersionUniqueName(), this.getVersionUniqueName()))
	{
		return false;
	}
	if (otherVersion.getVersionState() !== this.getVersionState())
	{
		return false;
	}
	if (otherVersion.isActive() !== this.isActive())
	{
		return false;
	}
	return true;
};
oFF.PlanningVersion.prototype.toString = function()
{
	var sb = oFF.XStringBuffer.create();
	sb.append("Id  : ");
	sb.append(this.m_versionIdentifier.getVersionUniqueName());
	sb.append(", Active : ");
	sb.append(oFF.XBoolean.convertToString(this.isActive()));
	sb.append(", State : ");
	if (oFF.isNull(this.m_versionState))
	{
		sb.append("null");
	}
	else
	{
		sb.append(this.m_versionState.getName());
	}
	return sb.toString();
};
oFF.PlanningVersion.prototype.getPlanningModel = function()
{
	return this.m_planningModel;
};
oFF.PlanningVersion.prototype.setPlanningModel = function(planningModel)
{
	this.m_planningModel = planningModel;
};
oFF.PlanningVersion.prototype.checkModelInitialized = function()
{
	this.getPlanningModel().checkModelInitialized();
};
oFF.PlanningVersion.prototype.invalidateVersion = function()
{
	this.m_creationTime = null;
	this.m_backupTime = null;
	this.m_parametersStructure = oFF.XObjectExt.release(this.m_parametersStructure);
	this.m_privilege = null;
	this.m_versionDescription = null;
	this.m_versionState = null;
};
oFF.PlanningVersion.prototype.resetVersionState = function()
{
	this.m_versionState = null;
};
oFF.PlanningVersion.prototype.updateInvalidPrivileges = function()
{
	if (oFF.notNull(this.m_versionState))
	{
		return;
	}
	var planningModel = this.getPlanningModel();
	if (oFF.notNull(planningModel) && planningModel.isVersionPrivilegesInitialized())
	{
		var privileges = planningModel.getVersionPrivileges();
		if (oFF.notNull(privileges))
		{
			for (var i = 0; i < privileges.size(); i++)
			{
				var privilege = privileges.get(i);
				if (oFF.XString.isEqual(privilege.getVersionUniqueName(), this.getVersionUniqueName()))
				{
					privilege.setPrivilegeState(oFF.PlanningPrivilegeState.NEW);
					privilege.setPrivilegeStateServer(oFF.PlanningPrivilegeState.NEW);
				}
			}
		}
	}
};
oFF.PlanningVersion.prototype.setVersionIdentifier = function(versionIdentifier)
{
	this.m_versionIdentifier = this.getPlanningModel().copyVersionIdentifier(versionIdentifier);
};
oFF.PlanningVersion.prototype.getVersionId = function()
{
	return this.m_versionIdentifier.getVersionId();
};
oFF.PlanningVersion.prototype.isSharedVersion = function()
{
	return this.m_versionIdentifier.isSharedVersion();
};
oFF.PlanningVersion.prototype.getVersionOwner = function()
{
	return this.m_versionIdentifier.getVersionOwner();
};
oFF.PlanningVersion.prototype.getVersionUniqueName = function()
{
	return this.m_versionIdentifier.getVersionUniqueName();
};
oFF.PlanningVersion.prototype.getVersionDescription = function()
{
	return this.m_versionDescription;
};
oFF.PlanningVersion.prototype.setVersionDescription = function(versionDescription)
{
	if (this.getPlanningModel().isWithUniqueVersionDescriptions())
	{
		this.assertVersionDescriptionUniqueAndNotNullOrEmpty(versionDescription);
	}
	this.m_versionDescription = versionDescription;
};
oFF.PlanningVersion.prototype.assertVersionDescriptionUniqueAndNotNullOrEmpty = function(versionDescription)
{
	oFF.XStringUtils.checkStringNotEmpty(versionDescription, "version description is null or empty.");
	if (oFF.XString.isEqual(this.m_versionDescription, versionDescription))
	{
		return;
	}
	if (!this.getPlanningModel().isVersionDescriptionUnique(versionDescription))
	{
		throw oFF.XException.createIllegalArgumentException("version description is not unique.");
	}
};
oFF.PlanningVersion.prototype.isActive = function()
{
	var planningVersionState = this.getVersionState();
	if (oFF.isNull(planningVersionState))
	{
		return false;
	}
	return planningVersionState.isActive();
};
oFF.PlanningVersion.prototype.getVersionState = function()
{
	return this.m_versionState;
};
oFF.PlanningVersion.prototype.getTotalChangesSize = function()
{
	return this.m_totalChangesSize;
};
oFF.PlanningVersion.prototype.setTotalChangesSize = function(undoSize)
{
	this.m_totalChangesSize = undoSize;
};
oFF.PlanningVersion.prototype.getUndoChangesSize = function()
{
	return this.m_undoChangesSize;
};
oFF.PlanningVersion.prototype.setUndoChangesSize = function(redoSize)
{
	this.m_undoChangesSize = redoSize;
};
oFF.PlanningVersion.prototype.setVersionState = function(versionState)
{
	oFF.XObjectExt.assertNotNullExt(versionState, "illegal version state");
	this.m_versionState = versionState;
	if (oFF.isNull(this.m_privilege))
	{
		if (this.isSharedVersion())
		{
			throw oFF.XException.createIllegalStateException("illegal privilege");
		}
		this.m_privilege = oFF.PlanningPrivilege.OWNER;
	}
};
oFF.PlanningVersion.prototype.getPrivilege = function()
{
	return this.m_privilege;
};
oFF.PlanningVersion.prototype.setPrivilege = function(privilege)
{
	oFF.XObjectExt.assertNotNullExt(privilege, "illegal privilege");
	this.m_privilege = privilege;
};
oFF.PlanningVersion.prototype.getActionIdentifiers = function()
{
	this.checkModelInitialized();
	var result = oFF.XList.create();
	var actionMetadataList = this.getPlanningModel().getActionMetadataList();
	for (var i = 0; i < actionMetadataList.size(); i++)
	{
		var actionMetadata = actionMetadataList.get(i);
		var actionIdentifier = this.getActionIdentifier(actionMetadata.getActionId());
		if (oFF.isNull(actionIdentifier))
		{
			continue;
		}
		result.add(actionIdentifier);
	}
	return result;
};
oFF.PlanningVersion.prototype.getActionIdentifier = function(actionId)
{
	this.checkModelInitialized();
	return this.getPlanningModel().getActionIdentifierById(actionId, this);
};
oFF.PlanningVersion.prototype.createRequestVersion = function(requestType)
{
	this.checkModelInitialized();
	if (!requestType.isTypeOf(oFF.PlanningModelRequestType.VERSION_REQUEST))
	{
		throw oFF.XException.createIllegalStateException("illegal request type");
	}
	var request;
	if (requestType === oFF.PlanningModelRequestType.INIT_VERSION)
	{
		request = new oFF.PlanningModelRequestVersionInit();
	}
	else if (requestType === oFF.PlanningModelRequestType.SET_PARAMETERS)
	{
		request = new oFF.PlanningModelRequestVersionSetParameters();
	}
	else if (requestType === oFF.PlanningModelRequestType.SET_TIMEOUT)
	{
		request = new oFF.PlanningModelRequestVersionSetTimeout();
	}
	else if (requestType === oFF.PlanningModelRequestType.CLOSE_VERSION)
	{
		request = new oFF.PlanningModelRequestVersionClose();
		request.setCloseMode(oFF.CloseModeType.DISCARD);
	}
	else if (requestType === oFF.PlanningModelRequestType.START_ACTION_SEQUENCE)
	{
		request = new oFF.PlanningModelRequestVersionStartActionSequence();
	}
	else if (requestType === oFF.PlanningModelRequestType.END_ACTION_SEQUENCE)
	{
		request = new oFF.PlanningModelRequestVersionEndActionSequence();
	}
	else if (requestType === oFF.PlanningModelRequestType.UNDO_VERSION || requestType === oFF.PlanningModelRequestType.REDO_VERSION)
	{
		request = new oFF.PlanningModelRequestVersionUndoRedo();
	}
	else if (requestType === oFF.PlanningModelRequestType.GET_VERSION_STATE_DESCRIPTIONS)
	{
		request = new oFF.PlanningModelRequestVersionStateDescriptions();
	}
	else
	{
		request = new oFF.PlanningModelRequestVersion();
	}
	request.setPlanningService(this.getPlanningModel().getPlanningService());
	request.setCommandType(oFF.PlanningCommandType.PLANNING_MODEL_REQUEST);
	request.setRequestType(requestType);
	request.setPlanningContext(this.getPlanningModel());
	request.setPlanningVersion(this);
	request.setInvalidatingResultSet(requestType.isInvalidatingResultSet());
	return request;
};
oFF.PlanningVersion.prototype.createRequestInitVersion = function()
{
	return this.createRequestVersion(oFF.PlanningModelRequestType.INIT_VERSION);
};
oFF.PlanningVersion.prototype.createRequestSetParameters = function()
{
	return this.createRequestVersion(oFF.PlanningModelRequestType.SET_PARAMETERS);
};
oFF.PlanningVersion.prototype.createRequestBackupVersion = function()
{
	return this.createRequestVersion(oFF.PlanningModelRequestType.BACKUP_VERSION);
};
oFF.PlanningVersion.prototype.createRequestCloseVersion = function()
{
	return this.createRequestVersion(oFF.PlanningModelRequestType.CLOSE_VERSION);
};
oFF.PlanningVersion.prototype.createRequestDropVersion = function()
{
	return this.createRequestVersion(oFF.PlanningModelRequestType.DROP_VERSION);
};
oFF.PlanningVersion.prototype.createRequestResetVersion = function()
{
	return this.createRequestVersion(oFF.PlanningModelRequestType.RESET_VERSION);
};
oFF.PlanningVersion.prototype.createRequestUndoVersion = function()
{
	return this.createRequestVersion(oFF.PlanningModelRequestType.UNDO_VERSION);
};
oFF.PlanningVersion.prototype.createRequestRedoVersion = function()
{
	return this.createRequestVersion(oFF.PlanningModelRequestType.REDO_VERSION);
};
oFF.PlanningVersion.prototype.createRequestSetTimeout = function()
{
	return this.createRequestVersion(oFF.PlanningModelRequestType.SET_TIMEOUT);
};
oFF.PlanningVersion.prototype.createRequestUpdateParameters = function()
{
	return this.createRequestVersion(oFF.PlanningModelRequestType.UPDATE_PARAMETERS);
};
oFF.PlanningVersion.prototype.createRequestStateDescriptions = function()
{
	return this.createRequestVersion(oFF.PlanningModelRequestType.GET_VERSION_STATE_DESCRIPTIONS);
};
oFF.PlanningVersion.prototype.createRequestStartActionSequence = function()
{
	return this.createRequestVersion(oFF.PlanningModelRequestType.START_ACTION_SEQUENCE);
};
oFF.PlanningVersion.prototype.createRequestEndActionSequence = function()
{
	return this.createRequestVersion(oFF.PlanningModelRequestType.END_ACTION_SEQUENCE);
};
oFF.PlanningVersion.prototype.createRequestKillActionSequence = function()
{
	return this.createRequestVersion(oFF.PlanningModelRequestType.KILL_ACTION_SEQUENCE);
};
oFF.PlanningVersion.prototype.initializeVersion = function(restoreBackupType)
{
	this.checkModelInitialized();
	return this.initializeVersionWithParameters(restoreBackupType, null);
};
oFF.PlanningVersion.prototype.initializeVersionWithParameters = function(restoreBackupType, parameters)
{
	var parametersStructure = oFF.PlanningVersion.parametersStringMap2ParametersStructure(parameters);
	if (oFF.notNull(parameters))
	{
		parametersStructure = oFF.PrFactory.createStructure();
		var keys = parameters.getKeysAsIteratorOfString();
		while (keys.hasNext())
		{
			var key = keys.next();
			var value = parameters.getByKey(key);
			parametersStructure.putString(key, value);
		}
	}
	return this.initializeVersionWithParametersJson(restoreBackupType, parametersStructure);
};
oFF.PlanningVersion.prototype.initializeVersionWithParametersJson = function(restoreBackupType, parametersJson)
{
	this.checkModelInitialized();
	var command = this.createRequestVersion(oFF.PlanningModelRequestType.INIT_VERSION);
	command.setRestoreBackupType(restoreBackupType);
	if (this.getPlanningModel().supportsVersionParameters())
	{
		command.setVersionParametersAsJson(parametersJson);
	}
	var commandResult = command.processCommand(oFF.SyncType.BLOCKING, null, null);
	return oFF.ExtResult.create(commandResult.getData(), commandResult);
};
oFF.PlanningVersion.prototype.updateParameters = function()
{
	this.checkModelInitialized();
	var command = this.createRequestVersion(oFF.PlanningModelRequestType.UPDATE_PARAMETERS);
	var commandResult = command.processCommand(oFF.SyncType.BLOCKING, null, null);
	return oFF.ExtResult.create(commandResult.getData(), commandResult);
};
oFF.PlanningVersion.prototype.setTimeout = function(seconds)
{
	this.checkModelInitialized();
	var command = this.createRequestVersion(oFF.PlanningModelRequestType.SET_TIMEOUT);
	command.setTimeout(seconds);
	var commandResult = command.processCommand(oFF.SyncType.BLOCKING, null, null);
	return oFF.ExtResult.create(commandResult.getData(), commandResult);
};
oFF.PlanningVersion.prototype.backup = function()
{
	this.checkModelInitialized();
	return this.processVersionRequest(oFF.PlanningModelRequestType.BACKUP_VERSION);
};
oFF.PlanningVersion.prototype.close = function()
{
	this.checkModelInitialized();
	var command = this.createRequestVersion(oFF.PlanningModelRequestType.CLOSE_VERSION);
	var commandResult = command.processCommand(oFF.SyncType.BLOCKING, null, null);
	return oFF.ExtResult.create(commandResult.getData(), commandResult);
};
oFF.PlanningVersion.prototype.drop = function()
{
	this.checkModelInitialized();
	var command = this.createRequestVersion(oFF.PlanningModelRequestType.DROP_VERSION);
	var commandResult = command.processCommand(oFF.SyncType.BLOCKING, null, null);
	return oFF.ExtResult.create(commandResult.getData(), commandResult);
};
oFF.PlanningVersion.prototype.startActionSequence = function()
{
	this.checkModelInitialized();
	var command = this.createRequestVersion(oFF.PlanningModelRequestType.START_ACTION_SEQUENCE);
	var commandResult = command.processCommand(oFF.SyncType.BLOCKING, null, null);
	return oFF.ExtResult.create(commandResult.getData(), commandResult);
};
oFF.PlanningVersion.prototype.endActionSequence = function()
{
	this.checkModelInitialized();
	var command = this.createRequestVersion(oFF.PlanningModelRequestType.END_ACTION_SEQUENCE);
	var commandResult = command.processCommand(oFF.SyncType.BLOCKING, null, null);
	return oFF.ExtResult.create(commandResult.getData(), commandResult);
};
oFF.PlanningVersion.prototype.killActionSequence = function()
{
	this.checkModelInitialized();
	return this.processVersionRequest(oFF.PlanningModelRequestType.KILL_ACTION_SEQUENCE);
};
oFF.PlanningVersion.prototype.reset = function()
{
	this.checkModelInitialized();
	return this.processVersionRequest(oFF.PlanningModelRequestType.RESET_VERSION);
};
oFF.PlanningVersion.prototype.undo = function()
{
	this.checkModelInitialized();
	return this.processVersionRequest(oFF.PlanningModelRequestType.UNDO_VERSION);
};
oFF.PlanningVersion.prototype.redo = function()
{
	this.checkModelInitialized();
	return this.processVersionRequest(oFF.PlanningModelRequestType.REDO_VERSION);
};
oFF.PlanningVersion.prototype.processVersionRequest = function(planningModelRequestType)
{
	this.checkModelInitialized();
	var command = this.createRequestVersion(planningModelRequestType);
	var commandResult = command.processCommand(oFF.SyncType.BLOCKING, null, null);
	return oFF.ExtResult.create(commandResult.getData(), commandResult);
};
oFF.PlanningVersion.prototype.getParameters = function()
{
	if (oFF.isNull(this.m_parametersStructure))
	{
		return oFF.XHashMapOfStringByString.create();
	}
	return oFF.PlanningVersion.parametersStructure2ParametersStringMap(this.m_parametersStructure);
};
oFF.PlanningVersion.prototype.getParametersStructure = function()
{
	if (oFF.isNull(this.m_parametersStructure))
	{
		return oFF.PrFactory.createStructure();
	}
	return oFF.PrFactory.createStructureDeepCopy(this.m_parametersStructure);
};
oFF.PlanningVersion.prototype.setParametersStructureInternal = function(parametersStructure)
{
	if (oFF.isNull(parametersStructure))
	{
		this.m_parametersStructure = null;
	}
	else
	{
		this.m_parametersStructure = oFF.PrFactory.createStructureDeepCopy(parametersStructure);
	}
};
oFF.PlanningVersion.prototype.getCreationTime = function()
{
	return this.m_creationTime;
};
oFF.PlanningVersion.prototype.setCreationTime = function(creationTime)
{
	this.m_creationTime = creationTime;
};
oFF.PlanningVersion.prototype.getBackupTime = function()
{
	return this.m_backupTime;
};
oFF.PlanningVersion.prototype.setBackupTime = function(backupTime)
{
	this.m_backupTime = backupTime;
};
oFF.PlanningVersion.prototype.getAction = function(actionIdentifier)
{
	return this.getPlanningModel().getAction(actionIdentifier);
};
oFF.PlanningVersion.prototype.getActionSequenceId = function()
{
	return this.m_actionSequenceId;
};
oFF.PlanningVersion.prototype.setActionSequenceId = function(sequenceId)
{
	this.m_actionSequenceId = sequenceId;
};
oFF.PlanningVersion.prototype.getUseExternalView = function()
{
	return this.m_useExternalView;
};
oFF.PlanningVersion.prototype.setUseExternalView = function(useExternalView)
{
	if (this.m_useExternalView === useExternalView)
	{
		return;
	}
	this.m_useExternalView = useExternalView;
	this.getPlanningModel().invalidate();
};
oFF.PlanningVersion.prototype.isActionSequenceActive = function()
{
	return this.m_sequenceActive;
};
oFF.PlanningVersion.prototype.setActionSequenceActive = function(sequenceActive)
{
	this.m_sequenceActive = sequenceActive;
	if (!this.m_sequenceActive)
	{
		this.m_sequenceCreateTime = null;
		this.m_sequenceDescription = null;
		this.m_actionSequenceId = null;
	}
};
oFF.PlanningVersion.prototype.getActionSequenceDescription = function()
{
	return this.m_sequenceDescription;
};
oFF.PlanningVersion.prototype.setActionSequenceDescription = function(sequenceDescription)
{
	this.m_sequenceDescription = sequenceDescription;
};
oFF.PlanningVersion.prototype.getActionSequenceCreateTime = function()
{
	return this.m_sequenceCreateTime;
};
oFF.PlanningVersion.prototype.setActionSequenceCreateTime = function(sequenceCreateTime)
{
	this.m_sequenceCreateTime = sequenceCreateTime;
};
oFF.PlanningVersion.prototype.isActionActive = function()
{
	return this.m_actionActive;
};
oFF.PlanningVersion.prototype.setActionActive = function(actionActive)
{
	this.m_actionActive = actionActive;
};
oFF.PlanningVersion.prototype.getActionEndTime = function()
{
	return this.m_actionEndTime;
};
oFF.PlanningVersion.prototype.setActionEndTime = function(actionEndTime)
{
	this.m_actionEndTime = actionEndTime;
};
oFF.PlanningVersion.prototype.getActionStartTime = function()
{
	return this.m_actionStartTime;
};
oFF.PlanningVersion.prototype.setActionStartTime = function(actionStartTime)
{
	this.m_actionStartTime = actionStartTime;
};
oFF.PlanningVersion.prototype.getIsRestrictionEnabled = function()
{
	return this.m_isRestrictionEnabled;
};
oFF.PlanningVersion.prototype.setIsRestrictionEnabled = function(restrictionEnabled)
{
	this.m_isRestrictionEnabled = restrictionEnabled;
};
oFF.PlanningVersion.prototype.getUserName = function()
{
	return this.m_userName;
};
oFF.PlanningVersion.prototype.setUserName = function(userName)
{
	this.m_userName = userName;
};
oFF.PlanningVersion.prototype.isShowingAsPublicVersion = function()
{
	return this.m_isShowingAsPublicVersion;
};
oFF.PlanningVersion.prototype.setShowingAsPublicVersion = function(isShowingAsPublicVersion)
{
	this.m_isShowingAsPublicVersion = isShowingAsPublicVersion;
};
oFF.PlanningVersion.prototype.getSourceVersionName = function()
{
	return this.m_sourceVersionName;
};
oFF.PlanningVersion.prototype.setSourceVersionName = function(sourceVersionName)
{
	this.m_sourceVersionName = sourceVersionName;
};
oFF.PlanningVersion.prototype.createVersionSettings = function()
{
	return oFF.PlanningVersionSettings.create(this, this.getActionSequenceId(), this.getUseExternalView());
};

oFF.PlanningService = function() {};
oFF.PlanningService.prototype = new oFF.DfService();
oFF.PlanningService.prototype._ff_c = "PlanningService";

oFF.PlanningService.CLAZZ = null;
oFF.PlanningService.s_capabilitiesProviderFactory = null;
oFF.PlanningService.staticSetup = function()
{
	oFF.PlanningService.CLAZZ = oFF.XClass.create(oFF.PlanningService);
};
oFF.PlanningService.prototype.m_planningContext = null;
oFF.PlanningService.prototype.m_initialized = false;
oFF.PlanningService.prototype.m_capabilitiesProvider = null;
oFF.PlanningService.prototype.getInaCapabilities = function()
{
	return this.m_capabilitiesProvider;
};
oFF.PlanningService.prototype.isInitialized = function()
{
	return this.m_initialized;
};
oFF.PlanningService.prototype.getActiveCapabilities = function()
{
	return this.m_capabilitiesProvider.getActiveCapabilities();
};
oFF.PlanningService.prototype.releaseObject = function()
{
	this.releasePlanningContext();
	this.m_capabilitiesProvider = null;
	oFF.DfService.prototype.releaseObject.call( this );
};
oFF.PlanningService.prototype.isServiceConfigMatching = function(serviceConfig, connection, messages)
{
	var serviceConfigPlanning = serviceConfig;
	var systemType = serviceConfigPlanning.getSystemType();
	if (oFF.isNull(systemType))
	{
		messages.addErrorExt(oFF.OriginLayer.DRIVER, oFF.ErrorCodes.INVALID_SYSTEM, "illegal system type", null);
		return false;
	}
	if (systemType.isTypeOf(oFF.SystemType.BW))
	{
		var properties = serviceConfigPlanning.getProperties();
		var dataArea = properties.getStringByKeyExt(oFF.PlanningConstants.DATA_AREA, "DEFAULT");
		var environment = properties.getStringByKey(oFF.PlanningConstants.ENVIRONMENT);
		var model = properties.getStringByKey(oFF.PlanningConstants.MODEL);
		var cellLocking = oFF.CellLockingType.lookupWithDefault(properties.getStringByKey(oFF.PlanningConstants.CELL_LOCKING), oFF.CellLockingType.DEFAULT_SETTING_BACKEND);
		var dataAreaState = oFF.DataAreaState.getDataAreaStateByPlanningService(this);
		if (oFF.isNull(dataAreaState))
		{
			var application = serviceConfigPlanning.getApplication();
			var systemName = serviceConfigPlanning.getSystemName();
			dataAreaState = oFF.DataAreaState.createDataAreaState(application, systemName, dataArea, environment, model, cellLocking);
			if (oFF.isNull(dataAreaState))
			{
				messages.addErrorExt(oFF.OriginLayer.DRIVER, oFF.ErrorCodes.INVALID_STATE, "illegal data area", properties);
				return false;
			}
		}
		else if (!dataAreaState.isEqualSettings(environment, model, cellLocking))
		{
			messages.addErrorExt(oFF.OriginLayer.DRIVER, oFF.ErrorCodes.INVALID_STATE, "data area with different settings already existing", properties);
			return false;
		}
	}
	return true;
};
oFF.PlanningService.prototype.getPlanningServiceConfig = function()
{
	return this.getServiceConfig();
};
oFF.PlanningService.prototype.processSynchronization = function(syncType)
{
	if (this.m_initialized)
	{
		return false;
	}
	this.initializeContext(syncType);
	return true;
};
oFF.PlanningService.prototype.getPlanningContext = function()
{
	this.initializeContext(oFF.SyncType.BLOCKING);
	return this.m_planningContext;
};
oFF.PlanningService.prototype.initializeContext = function(syncType)
{
	if (this.m_initialized)
	{
		return;
	}
	var serverMetadata = this.getConnection().getSystemConnect().getServerMetadata();
	this.m_capabilitiesProvider = oFF.PlanningService.s_capabilitiesProviderFactory.create(this.getSession(), serverMetadata, oFF.ProviderType.PLANNING_COMMAND);
	var serviceConfig = this.getPlanningServiceConfig();
	var properties = serviceConfig.getProperties();
	var systemType = serviceConfig.getSystemType();
	if (systemType.isTypeOf(oFF.SystemType.BW))
	{
		var dataArea = oFF.DataArea.create();
		dataArea.setPlanningService(this);
		dataArea.setDataArea(properties.getStringByKeyExt(oFF.PlanningConstants.DATA_AREA, "DEFAULT"));
		dataArea.setEnvironment(properties.getStringByKey(oFF.PlanningConstants.ENVIRONMENT));
		dataArea.setModel(properties.getStringByKey(oFF.PlanningConstants.MODEL));
		dataArea.setCellLockingType(oFF.CellLockingType.lookupWithDefault(properties.getStringByKey(oFF.PlanningConstants.CELL_LOCKING), oFF.CellLockingType.DEFAULT_SETTING_BACKEND));
		this._setInitialized(dataArea);
	}
	if (systemType.isTypeOf(oFF.SystemType.HANA))
	{
		var planningModel = oFF.PlanningModel.create();
		planningModel.setPlanningService(this);
		planningModel.setPlanningModelSchema(properties.getStringByKey(oFF.PlanningConstants.PLANNING_SCHEMA));
		planningModel.setPlanningModelName(properties.getStringByKey(oFF.PlanningConstants.PLANNING_MODEL));
		planningModel.setPlanningModelBehaviour(oFF.PlanningModelBehaviour.lookupWithDefault(properties.getStringByKey(oFF.PlanningConstants.PLANNING_MODEL_BEHAVIOUR), oFF.PlanningModelBehaviour.STANDARD));
		planningModel.setBackendUserName(properties.getStringByKeyExt(oFF.PlanningConstants.BACKEND_USER_NAME, serviceConfig.getSystemDescription().getUser()));
		planningModel.setWithSharedVersions(properties.getBooleanByKeyExt(oFF.PlanningConstants.WITH_SHARED_VERSIONS, false));
		planningModel.setPersistenceType(oFF.PlanningPersistenceType.lookupWithDefault(properties.getStringByKeyExt(oFF.PlanningConstants.PERSISTENCE_TYPE, null), oFF.PlanningPersistenceType.DEFAULT));
		planningModel.initializePlanningModel(syncType);
	}
};
oFF.PlanningService.prototype._setInitialized = function(planningContext)
{
	if (this.m_initialized)
	{
		throw oFF.XException.createInitializationException();
	}
	this.m_initialized = true;
	this.m_planningContext = planningContext;
	this.setData(this);
	this.endSync();
};
oFF.PlanningService.prototype.processCommand = function(synchronizationType, planningCommand, callback, customIdentifier)
{
	return planningCommand.processCommand(synchronizationType, callback, customIdentifier);
};
oFF.PlanningService.prototype.releasePlanningContext = function()
{
	this.m_initialized = false;
	this.m_planningContext = oFF.XObjectExt.release(this.m_planningContext);
};
oFF.PlanningService.prototype.getOlapEnv = function()
{
	return this.getApplication().getOlapEnvironment();
};
oFF.PlanningService.prototype.toString = function()
{
	var sb = oFF.XStringBuffer.create();
	var planningServiceConfig = this.getPlanningServiceConfig();
	if (oFF.notNull(planningServiceConfig))
	{
		sb.append(planningServiceConfig.toString());
	}
	return sb.toString();
};
oFF.PlanningService.prototype.supportsPlanningValueHelp = function()
{
	var activeCapabilities = this.getActiveCapabilities();
	return activeCapabilities.containsKey(oFF.InACapabilities.C054_EXTENDED_SORT) && activeCapabilities.containsKey(oFF.InACapabilities.C100_EXPAND_BOTTOM_UP);
};

oFF.PlanningContext = function() {};
oFF.PlanningContext.prototype = new oFF.QModelComponent();
oFF.PlanningContext.prototype._ff_c = "PlanningContext";

oFF.PlanningContext.prototype.m_planningService = null;
oFF.PlanningContext.prototype.getPlanningService = function()
{
	return this.m_planningService;
};
oFF.PlanningContext.prototype.releaseObject = function()
{
	this.m_planningService = null;
	oFF.QModelComponent.prototype.releaseObject.call( this );
};
oFF.PlanningContext.prototype.setPlanningService = function(planningService)
{
	this.m_planningService = planningService;
};
oFF.PlanningContext.prototype.createPlanningCommand = function(commandIdentifier)
{
	var extResult = this.createRequestCreateCommandWithId(commandIdentifier).processCommand(oFF.SyncType.BLOCKING, null, null);
	return oFF.ExtResult.create(extResult.getData(), extResult);
};
oFF.PlanningContext.prototype.executeCommandBlocking = function(commandType)
{
	var command = this.createPlanningContextCommand(commandType);
	var commandResult = command.processCommand(oFF.SyncType.BLOCKING, null, null);
	return oFF.ExtResult.create(commandResult.getData(), commandResult);
};
oFF.PlanningContext.prototype.publish = function()
{
	return this.executeCommandBlocking(oFF.PlanningContextCommandType.PUBLISH);
};
oFF.PlanningContext.prototype.backup = function()
{
	return this.executeCommandBlocking(oFF.PlanningContextCommandType.BACKUP);
};
oFF.PlanningContext.prototype.refresh = function()
{
	return this.executeCommandBlocking(oFF.PlanningContextCommandType.REFRESH);
};
oFF.PlanningContext.prototype.hardDelete = function()
{
	return this.executeCommandBlocking(oFF.PlanningContextCommandType.HARD_DELETE);
};
oFF.PlanningContext.prototype.reset = function()
{
	return this.executeCommandBlocking(oFF.PlanningContextCommandType.RESET);
};
oFF.PlanningContext.prototype.close = function()
{
	return this.executeCommandBlocking(oFF.PlanningContextCommandType.CLOSE);
};
oFF.PlanningContext.prototype.createCommandRefresh = function()
{
	return this.createPlanningContextCommand(oFF.PlanningContextCommandType.REFRESH);
};
oFF.PlanningContext.prototype.createCommandHardDelete = function()
{
	return this.createPlanningContextCommand(oFF.PlanningContextCommandType.HARD_DELETE);
};
oFF.PlanningContext.prototype.createCommandReset = function()
{
	return this.createPlanningContextCommand(oFF.PlanningContextCommandType.RESET);
};
oFF.PlanningContext.prototype.createCommandDocSave = function()
{
	return this.createPlanningContextCommand(oFF.PlanningContextCommandType.DOC_SAVE);
};
oFF.PlanningContext.prototype.createCommandDocReset = function()
{
	return this.createPlanningContextCommand(oFF.PlanningContextCommandType.DOC_RESET);
};
oFF.PlanningContext.prototype.invalidate = function()
{
	var queryConsumerServices = this.getQueryConsumerServices();
	if (oFF.notNull(queryConsumerServices))
	{
		for (var i = 0; i < queryConsumerServices.size(); i++)
		{
			var queryManager = queryConsumerServices.get(i);
			queryManager.invalidateState();
		}
	}
};
oFF.PlanningContext.prototype.toString = function()
{
	var sb = oFF.XStringBuffer.create();
	sb.appendLine(this.getPlanningContextType().toString());
	if (oFF.notNull(this.m_planningService))
	{
		sb.appendLine(this.m_planningService.toString());
	}
	sb.appendLine("Related query consumer services:");
	var queryConsumerServices = this.getQueryConsumerServices();
	if (oFF.notNull(queryConsumerServices))
	{
		for (var i = 0; i < queryConsumerServices.size(); i++)
		{
			var queryConsumerService = queryConsumerServices.get(i);
			sb.appendLine(queryConsumerService.toString());
		}
	}
	return sb.toString();
};

oFF.PlanningPropertiesObject = function() {};
oFF.PlanningPropertiesObject.prototype = new oFF.QModelComponent();
oFF.PlanningPropertiesObject.prototype._ff_c = "PlanningPropertiesObject";

oFF.PlanningPropertiesObject.prototype.m_properties = null;
oFF.PlanningPropertiesObject.prototype.getProperties = function()
{
	if (oFF.isNull(this.m_properties))
	{
		this.m_properties = oFF.XHashMapByString.create();
	}
	return this.m_properties;
};
oFF.PlanningPropertiesObject.prototype.releaseObject = function()
{
	this.m_properties = oFF.XObjectExt.release(this.m_properties);
	oFF.QModelComponent.prototype.releaseObject.call( this );
};
oFF.PlanningPropertiesObject.prototype.getPropertiesCopy = function()
{
	var copy = null;
	if (oFF.notNull(this.m_properties))
	{
		copy = this.m_properties.createMapByStringCopy();
	}
	return copy;
};
oFF.PlanningPropertiesObject.prototype.setProperties = function(properties)
{
	this.m_properties = properties;
};
oFF.PlanningPropertiesObject.prototype.getPropertyObject = function(propertyName)
{
	return this.getProperties().getByKey(propertyName);
};
oFF.PlanningPropertiesObject.prototype.setPropertyObject = function(propertyName, propertyValue)
{
	if (oFF.isNull(propertyValue))
	{
		this.getProperties().remove(propertyName);
	}
	else
	{
		this.getProperties().put(propertyName, propertyValue);
	}
};
oFF.PlanningPropertiesObject.prototype.getPropertyString = function(propertyName)
{
	var objectValue = this.getPropertyObject(propertyName);
	if (oFF.isNull(objectValue))
	{
		return null;
	}
	return objectValue.getString();
};
oFF.PlanningPropertiesObject.prototype.setPropertyString = function(propertyName, propertyValue)
{
	var objectValue = this.getPropertyObject(propertyName);
	if (oFF.isNull(objectValue))
	{
		objectValue = oFF.XStringValue.create(propertyValue);
		this.getProperties().put(propertyName, objectValue);
	}
	else
	{
		objectValue.setString(propertyValue);
	}
};
oFF.PlanningPropertiesObject.prototype.getPropertyBoolean = function(propertyName)
{
	var objectValue = this.getPropertyObject(propertyName);
	if (oFF.isNull(objectValue))
	{
		return false;
	}
	return objectValue.getBoolean();
};
oFF.PlanningPropertiesObject.prototype.setPropertyBoolean = function(propertyName, propertyValue)
{
	var objectValue = this.getPropertyObject(propertyName);
	if (oFF.isNull(objectValue))
	{
		objectValue = oFF.XBooleanValue.create(propertyValue);
		this.getProperties().put(propertyName, objectValue);
	}
	else
	{
		objectValue.setBoolean(propertyValue);
	}
};
oFF.PlanningPropertiesObject.prototype.getPropertyInteger = function(propertyName)
{
	var objectValue = this.getPropertyObject(propertyName);
	if (oFF.isNull(objectValue))
	{
		return 0;
	}
	return objectValue.getInteger();
};
oFF.PlanningPropertiesObject.prototype.setPropertyInteger = function(propertyName, propertyValue)
{
	var objectValue = this.getPropertyObject(propertyName);
	if (oFF.isNull(objectValue))
	{
		objectValue = oFF.XIntegerValue.create(propertyValue);
		this.getProperties().put(propertyName, objectValue);
	}
	else
	{
		objectValue.setInteger(propertyValue);
	}
};

oFF.PlanningServiceConfig = function() {};
oFF.PlanningServiceConfig.prototype = new oFF.DfServiceConfigClassic();
oFF.PlanningServiceConfig.prototype._ff_c = "PlanningServiceConfig";

oFF.PlanningServiceConfig.CLAZZ = null;
oFF.PlanningServiceConfig.staticSetup = function()
{
	oFF.PlanningServiceConfig.CLAZZ = oFF.XClass.create(oFF.PlanningServiceConfig);
};
oFF.PlanningServiceConfig.prototype.m_properties = null;
oFF.PlanningServiceConfig.prototype.setupConfig = function(application)
{
	oFF.DfServiceConfigClassic.prototype.setupConfig.call( this , application);
	this.m_properties = oFF.XProperties.create();
};
oFF.PlanningServiceConfig.prototype.releaseObject = function()
{
	this.m_properties = oFF.XObjectExt.release(this.m_properties);
	oFF.DfServiceConfigClassic.prototype.releaseObject.call( this );
};
oFF.PlanningServiceConfig.prototype.getProperties = function()
{
	return this.m_properties;
};
oFF.PlanningServiceConfig.prototype.getDataSource = function()
{
	var dataSource = oFF.QFactory.createDataSource();
	var properties = this.getProperties();
	if (properties.containsKey(oFF.PlanningConstants.PLANNING_MODEL))
	{
		dataSource.setType(oFF.MetaObjectType.PLANNING_MODEL);
		dataSource.setObjectName(properties.getStringByKey(oFF.PlanningConstants.PLANNING_MODEL));
		if (properties.contains(oFF.PlanningConstants.PLANNING_SCHEMA))
		{
			dataSource.setSchemaName(properties.getByKey(oFF.PlanningConstants.PLANNING_SCHEMA));
		}
	}
	else
	{
		if (properties.contains(oFF.PlanningConstants.MODEL))
		{
			dataSource.setModelName(oFF.PlanningConstants.MODEL);
		}
		if (properties.contains(oFF.PlanningConstants.ENVIRONMENT))
		{
			dataSource.setEnvironmentName(oFF.PlanningConstants.ENVIRONMENT);
		}
		var dataArea = null;
		if (properties.contains(oFF.PlanningConstants.DATA_AREA))
		{
			dataArea = properties.getByKey(oFF.PlanningConstants.DATA_AREA);
		}
		if (oFF.XStringUtils.isNullOrEmpty(dataArea))
		{
			dataArea = oFF.PlanningConstants.DATA_AREA_DEFAULT;
		}
		dataSource.setDataArea(dataArea);
	}
	return dataSource;
};
oFF.PlanningServiceConfig.prototype.setDataSourceName = function(dataSourceName)
{
	this.setDataSource(oFF.QFactory.createDataSourceWithFqn(dataSourceName));
};
oFF.PlanningServiceConfig.prototype.setDataSource = function(dataSource)
{
	var properties = this.getProperties();
	properties.remove(oFF.PlanningConstants.PLANNING_MODEL);
	properties.remove(oFF.PlanningConstants.PLANNING_SCHEMA);
	properties.remove(oFF.PlanningConstants.MODEL);
	properties.remove(oFF.PlanningConstants.ENVIRONMENT);
	properties.remove(oFF.PlanningConstants.DATA_AREA);
	if (oFF.isNull(dataSource))
	{
		return;
	}
	var type = dataSource.getType();
	if (type === oFF.MetaObjectType.PLANNING_MODEL)
	{
		this.setStringNotEmpty(properties, oFF.PlanningConstants.PLANNING_SCHEMA, dataSource.getSchemaName());
		this.setStringNotEmpty(properties, oFF.PlanningConstants.PLANNING_MODEL, dataSource.getObjectName());
	}
	else if (oFF.isNull(type))
	{
		this.setStringNotEmpty(properties, oFF.PlanningConstants.MODEL, dataSource.getModelName());
		this.setStringNotEmpty(properties, oFF.PlanningConstants.ENVIRONMENT, dataSource.getEnvironmentName());
		var dataArea = dataSource.getDataArea();
		if (oFF.XStringUtils.isNullOrEmpty(dataArea))
		{
			dataArea = oFF.PlanningConstants.DATA_AREA_DEFAULT;
		}
		properties.putString(oFF.PlanningConstants.DATA_AREA, dataArea);
	}
};
oFF.PlanningServiceConfig.prototype.setStringNotEmpty = function(properties, name, value)
{
	if (oFF.XStringUtils.isNotNullAndNotEmpty(value))
	{
		properties.putString(name, value);
	}
};
oFF.PlanningServiceConfig.prototype.getMatchingServiceForServiceName = function(serviceReferenceName)
{
	var properties = this.getProperties();
	var existingServices = oFF.XList.create();
	if (this.getSystemType() === oFF.SystemType.BW)
	{
		var dataArea = properties.getStringByKeyExt(oFF.PlanningConstants.DATA_AREA, "DEFAULT");
		existingServices = oFF.DataAreaUtil.getPlanningServices(this.getApplication(), this.getSystemName(), dataArea);
	}
	else if (this.getSystemType().isTypeOf(oFF.SystemType.HANA))
	{
		var planningSchema = properties.getStringByKey(oFF.PlanningConstants.PLANNING_SCHEMA);
		var planningModel = properties.getStringByKey(oFF.PlanningConstants.PLANNING_MODEL);
		existingServices = oFF.PlanningModelUtil.getPlanningServices(this.getApplication(), this.getSystemName(), planningSchema, planningModel);
	}
	var connectionContainer = this.getConnectionContainer();
	var tmpMessageMgr = oFF.MessageManager.createMessageManagerExt(this.getSession());
	for (var i = 0; i < existingServices.size(); i++)
	{
		var planningService = existingServices.get(i);
		if (planningService.isServiceConfigMatching(this, connectionContainer, tmpMessageMgr))
		{
			return planningService;
		}
	}
	return oFF.DfServiceConfigClassic.prototype.getMatchingServiceForServiceName.call( this , serviceReferenceName);
};
oFF.PlanningServiceConfig.prototype.toString = function()
{
	if (this.hasErrors())
	{
		return this.getSummary();
	}
	var sb = oFF.XStringBuffer.create();
	if (oFF.notNull(this.m_properties))
	{
		var configKeys = this.m_properties.getKeysAsReadOnlyListOfString();
		for (var i = 0; i < configKeys.size(); i++)
		{
			var configKey = configKeys.get(i);
			var configValue = this.m_properties.getByKey(configKey);
			sb.append(configKey).append("=").appendLine(configValue);
		}
	}
	return sb.toString();
};

oFF.PlanningCommandModelComponent = function() {};
oFF.PlanningCommandModelComponent.prototype = new oFF.QModelComponent();
oFF.PlanningCommandModelComponent.prototype._ff_c = "PlanningCommandModelComponent";

oFF.PlanningCommandModelComponent.create = function(context, planningCommand)
{
	var component = new oFF.PlanningCommandModelComponent();
	component.setupModelComponent(context, null);
	component.m_planningCommand = oFF.XWeakReferenceUtil.getWeakRef(planningCommand);
	return component;
};
oFF.PlanningCommandModelComponent.prototype.m_planningCommand = null;
oFF.PlanningCommandModelComponent.prototype.getPlanningCommand = function()
{
	return oFF.XWeakReferenceUtil.getHardRef(this.m_planningCommand);
};
oFF.PlanningCommandModelComponent.prototype.getOlapComponentType = function()
{
	return oFF.OlapComponentType.PLANNING_X_COMMAND;
};
oFF.PlanningCommandModelComponent.prototype.getContext = function()
{
	return this;
};
oFF.PlanningCommandModelComponent.prototype.getFieldAccessorSingle = function()
{
	return this.getPlanningCommand();
};

oFF.PlanningCommand = function() {};
oFF.PlanningCommand.prototype = new oFF.PlanningPropertiesObject();
oFF.PlanningCommand.prototype._ff_c = "PlanningCommand";

oFF.PlanningCommand.PLANNING_SERVICE = "PLANNING_SERVICE";
oFF.PlanningCommand.COMMAND_TYPE = "COMMAND_TYPE";
oFF.PlanningCommand.PLANNING_COMMAND_JSON = "PLANNING_COMMAND_JSON";
oFF.PlanningCommand.INVALIDATE_RESULT_SET = "INVALIDATE_RESULT_SET";
oFF.PlanningCommand.RESULT = "RESULT";
oFF.PlanningCommand.prototype.m_synchronizationType = null;
oFF.PlanningCommand.prototype.m_extPlanningCommandResult = null;
oFF.PlanningCommand.prototype.m_analyticsCapabilities = null;
oFF.PlanningCommand.prototype.m_connection = null;
oFF.PlanningCommand.prototype.setCommandType = function(commandType)
{
	this.setPropertyObject(oFF.PlanningCommand.COMMAND_TYPE, commandType);
};
oFF.PlanningCommand.prototype.getCommandType = function()
{
	return this.getPropertyObject(oFF.PlanningCommand.COMMAND_TYPE);
};
oFF.PlanningCommand.prototype.getPlanningService = function()
{
	return this.getPropertyObject(oFF.PlanningCommand.PLANNING_SERVICE);
};
oFF.PlanningCommand.prototype.setPlanningService = function(planningService)
{
	this.setPropertyObject(oFF.PlanningCommand.PLANNING_SERVICE, planningService);
	this.setupContext(planningService.getOlapEnv().getContext());
};
oFF.PlanningCommand.prototype.isInvalidatingResultSet = function()
{
	var objectValue = this.getPropertyObject(oFF.PlanningCommand.INVALIDATE_RESULT_SET);
	if (oFF.isNull(objectValue))
	{
		return true;
	}
	return objectValue.getBoolean();
};
oFF.PlanningCommand.prototype.setInvalidatingResultSet = function(invalidating)
{
	this.setPropertyBoolean(oFF.PlanningCommand.INVALIDATE_RESULT_SET, invalidating);
	return this;
};
oFF.PlanningCommand.prototype.serializeToJson = function()
{
	var planningCommandJson = this.getPropertyObject(oFF.PlanningCommand.PLANNING_COMMAND_JSON);
	if (oFF.isNull(planningCommandJson))
	{
		planningCommandJson = this.createCommandStructure();
		this.setPropertyObject(oFF.PlanningCommand.PLANNING_COMMAND_JSON, planningCommandJson);
	}
	return planningCommandJson;
};
oFF.PlanningCommand.prototype.resetCommand = function()
{
	this.setPropertyObject(oFF.PlanningCommand.PLANNING_COMMAND_JSON, null);
};
oFF.PlanningCommand.prototype.createCommandStructure = oFF.noSupport;
oFF.PlanningCommand.prototype.createCommandResult = function(callback, customIdentifier)
{
	var commandResult = this.createCommandResultInstance();
	commandResult.setCustomIdentifier(customIdentifier);
	commandResult.setPlanningCommand(this);
	commandResult.setPlanningCommandCallback(callback);
	return commandResult;
};
oFF.PlanningCommand.prototype.onCommandProcessed = function(extPlanningCommandResult)
{
	var commandCallback = extPlanningCommandResult.getData().getPlanningCommandCallback();
	if (oFF.notNull(commandCallback))
	{
		commandCallback.onCommandProcessed(extPlanningCommandResult);
	}
};
oFF.PlanningCommand.prototype.processCommand = function(synchronizationType, callback, customIdentifier)
{
	var planningCommandResult = this.createCommandResult(callback, customIdentifier);
	this.m_synchronizationType = synchronizationType;
	this.doProcessCommand(synchronizationType, planningCommandResult);
	var result = null;
	if (synchronizationType === oFF.SyncType.BLOCKING)
	{
		result = this.m_extPlanningCommandResult;
		this.m_extPlanningCommandResult = null;
	}
	return result;
};
oFF.PlanningCommand.prototype.getCapabilities = function()
{
	if (oFF.isNull(this.m_analyticsCapabilities))
	{
		var connection = this.getConnection();
		var serverMetadata = connection.getSystemConnect().getServerMetadata();
		this.m_analyticsCapabilities = serverMetadata.getMetadataForService(oFF.ServerService.ANALYTIC);
	}
	return this.m_analyticsCapabilities;
};
oFF.PlanningCommand.prototype.getServicePath = function()
{
	var connection = this.getConnection();
	var systemDescription = connection.getSystemDescription();
	var fastPathCap = this.getCapabilities().getByKey(oFF.InACapabilities.C032_FAST_PATH);
	if (oFF.notNull(fastPathCap) && fastPathCap.getValue() !== null)
	{
		return fastPathCap.getValue();
	}
	return systemDescription.getSystemType().getInAPath();
};
oFF.PlanningCommand.prototype.setConnection = function(connection)
{
	this.m_connection = connection;
};
oFF.PlanningCommand.prototype.getConnection = function()
{
	if (oFF.notNull(this.m_connection))
	{
		return this.m_connection;
	}
	var planningService = this.getPlanningService();
	var connection = planningService.getPlanningServiceConfig().getConnectionContainer();
	if (oFF.isNull(connection))
	{
		var systemName = planningService.getServiceConfig().getSystemName();
		connection = planningService.getApplication().getConnectionPool().getConnection(systemName);
	}
	return connection;
};
oFF.PlanningCommand.prototype.doProcessCommand = function(synchronizationType, planningCommandResult)
{
	var connection = this.getConnection();
	var servicePath = this.getServicePath();
	var ocpFunction = connection.newRpcFunction(servicePath);
	var request = ocpFunction.getRpcRequest();
	var requestStructure;
	if (this.getOlapComponentType() !== oFF.OlapComponentType.OLAP)
	{
		requestStructure = this.serializeToElement(oFF.QModelFormat.INA_DATA);
	}
	else
	{
		requestStructure = this.serializeToJson();
	}
	if (connection.getSystemDescription().getSystemType().isTypeOf(oFF.SystemType.HANA) && this.getSession().hasFeature(oFF.FeatureToggleOlap.PLANNING_BATCH))
	{
		requestStructure = oFF.PlanningModelCommandHelper.convertRequestToBatch(requestStructure);
	}
	request.setRequestStructure(requestStructure);
	ocpFunction.processFunctionExecution(synchronizationType, this, planningCommandResult);
};
oFF.PlanningCommand.prototype.onFunctionExecuted = function(extResult, response, customIdentifier)
{
	var planningCommandResult = customIdentifier;
	var extPlanningCommandResult;
	if (extResult.hasErrors())
	{
		extPlanningCommandResult = oFF.ExtResult.create(planningCommandResult, extResult);
	}
	else
	{
		this.onSuccessfulCommand();
		var responseStructure = oFF.PrFactory.createStructureDeepCopy(response.getRootElement());
		if (this.getConnection().getSystemDescription().getSystemType().isTypeOf(oFF.SystemType.HANA) && this.getSession().hasFeature(oFF.FeatureToggleOlap.PLANNING_BATCH))
		{
			responseStructure = oFF.PlanningModelCommandHelper.convertResponseFromBatch(responseStructure);
		}
		var messageManager = oFF.MessageManager.createMessageManagerExt(this.getSession());
		this.updatePlanningContext(responseStructure, messageManager);
		if (this.getOlapComponentType() !== oFF.OlapComponentType.OLAP)
		{
			messageManager.addAllMessages(this.deserializeFromElementExt(oFF.QModelFormat.INA_DATA, responseStructure));
		}
		else
		{
			planningCommandResult.processResponseStructrue(responseStructure, messageManager);
		}
		extPlanningCommandResult = oFF.ExtResult.create(planningCommandResult, messageManager);
	}
	this.onCommandExecuted(extPlanningCommandResult);
};
oFF.PlanningCommand.prototype.updatePlanningContext = function(responseStructure, messageManager)
{
	if (oFF.isNull(responseStructure))
	{
		return;
	}
	var planningService = this.getPlanningService();
	if (oFF.isNull(planningService))
	{
		return;
	}
	var application = planningService.getApplication();
	if (oFF.isNull(application))
	{
		return;
	}
	var serviceConfig = planningService.getServiceConfig();
	if (oFF.isNull(serviceConfig))
	{
		return;
	}
	var systemName = serviceConfig.getSystemName();
	oFF.PlanningState.update(application, systemName, responseStructure, messageManager);
};
oFF.PlanningCommand.prototype.onCommandExecuted = function(extPlanningCommandResult)
{
	if (this.m_synchronizationType === oFF.SyncType.BLOCKING)
	{
		this.m_extPlanningCommandResult = extPlanningCommandResult;
	}
	var commandCallback = extPlanningCommandResult.getData().getPlanningCommandCallback();
	if (oFF.notNull(commandCallback))
	{
		commandCallback.onCommandProcessed(extPlanningCommandResult);
	}
};
oFF.PlanningCommand.prototype.getResult = function()
{
	return this.getPropertyObject(oFF.PlanningCommand.RESULT);
};
oFF.PlanningCommand.prototype.setResult = function(result)
{
	this.setPropertyObject(oFF.PlanningCommand.RESULT, result);
};
oFF.PlanningCommand.prototype.createCommandResultInstance = function()
{
	var result = this.getResult();
	if (oFF.notNull(result))
	{
		oFF.XObjectExt.release(result);
	}
	result = this.createCommandResultInstanceInternal();
	this.setResult(result);
	return result;
};
oFF.PlanningCommand.prototype.onSuccessfulCommand = function()
{
	this.resetCommand();
};
oFF.PlanningCommand.prototype.createCommandResultInstanceInternal = function()
{
	return new oFF.PlanningModelCommandResult();
};

oFF.PlanningCommandResult = function() {};
oFF.PlanningCommandResult.prototype = new oFF.PlanningPropertiesObject();
oFF.PlanningCommandResult.prototype._ff_c = "PlanningCommandResult";

oFF.PlanningCommandResult.PLANNING_COMMAND = "PLANNING_COMMAND";
oFF.PlanningCommandResult.CUSTOM_IDENTIFIER = "CUSTOM_IDENTIFIER";
oFF.PlanningCommandResult.PLANNING_COMMAND_CALLBACK = "PLANNING_COMMAND_CALLBACK";
oFF.PlanningCommandResult.prototype.getPlanningCommand = function()
{
	return this.getPropertyObject(oFF.PlanningCommandResult.PLANNING_COMMAND);
};
oFF.PlanningCommandResult.prototype.setPlanningCommand = function(planningCommand)
{
	this.setPropertyObject(oFF.PlanningCommandResult.PLANNING_COMMAND, planningCommand);
};
oFF.PlanningCommandResult.prototype.getCustomIdentifier = function()
{
	return this.getPropertyObject(oFF.PlanningCommandResult.CUSTOM_IDENTIFIER);
};
oFF.PlanningCommandResult.prototype.setCustomIdentifier = function(customIdentifier)
{
	this.setPropertyObject(oFF.PlanningCommandResult.CUSTOM_IDENTIFIER, customIdentifier);
};
oFF.PlanningCommandResult.prototype.getPlanningCommandCallback = function()
{
	return this.getPropertyObject(oFF.PlanningCommandResult.PLANNING_COMMAND_CALLBACK);
};
oFF.PlanningCommandResult.prototype.setPlanningCommandCallback = function(planningCommandCallback)
{
	this.setPropertyObject(oFF.PlanningCommandResult.PLANNING_COMMAND_CALLBACK, planningCommandCallback);
};
oFF.PlanningCommandResult.prototype.cloneOlapComponent = function(context, parent)
{
	var command = this.getPlanningCommand();
	var copy = command.createCommandResultInstance();
	copy.setProperties(this.getPropertiesCopy());
	return copy;
};
oFF.PlanningCommandResult.prototype.processResponseStructrue = function(responseStructure, messageManager)
{
	this.initResponseStructureCommand(responseStructure, messageManager);
	if (this.isValidResponseStructure(responseStructure, messageManager))
	{
		this.processResponseStructureCommand(responseStructure, messageManager, messageManager.hasErrors());
	}
	this.getPlanningCommand().resetCommand();
	this.checkErrorState();
};
oFF.PlanningCommandResult.prototype.initResponseStructureCommand = function(responseStructure, messageManager) {};
oFF.PlanningCommandResult.prototype.processResponseStructureCommand = function(responseStructure, messageManager, hasErrors) {};
oFF.PlanningCommandResult.prototype.checkErrorState = function() {};
oFF.PlanningCommandResult.prototype.onCommandProcessed = oFF.noSupport;
oFF.PlanningCommandResult.prototype.isValidResponseStructure = function(responseStructure, messageManager)
{
	if (oFF.isNull(responseStructure))
	{
		return false;
	}
	if (oFF.isNull(messageManager))
	{
		return false;
	}
	oFF.InAHelper.importMessages(responseStructure, messageManager);
	return true;
};

oFF.PlanningCommandIdentifier = function() {};
oFF.PlanningCommandIdentifier.prototype = new oFF.PlanningPropertiesObject();
oFF.PlanningCommandIdentifier.prototype._ff_c = "PlanningCommandIdentifier";

oFF.PlanningCommandIdentifier.PLANNING_COMMAND_TYPE = "PLANNING_COMMAND_TYPE";
oFF.PlanningCommandIdentifier.COMMAND_ID = "COMMAND_ID";
oFF.PlanningCommandIdentifier.prototype.getPlanningCommandType = function()
{
	return this.getPropertyObject(oFF.PlanningCommandIdentifier.PLANNING_COMMAND_TYPE);
};
oFF.PlanningCommandIdentifier.prototype.setPlanningCommandType = function(planningCommandType)
{
	this.setPropertyObject(oFF.PlanningCommandIdentifier.PLANNING_COMMAND_TYPE, planningCommandType);
};
oFF.PlanningCommandIdentifier.prototype.getCommandId = function()
{
	return this.getPropertyString(oFF.PlanningCommandIdentifier.COMMAND_ID);
};
oFF.PlanningCommandIdentifier.prototype.setCommandId = function(commandId)
{
	this.setPropertyString(oFF.PlanningCommandIdentifier.COMMAND_ID, commandId);
};

oFF.DataArea = function() {};
oFF.DataArea.prototype = new oFF.PlanningContext();
oFF.DataArea.prototype._ff_c = "DataArea";

oFF.DataArea.create = function()
{
	return new oFF.DataArea();
};
oFF.DataArea.prototype.m_dataArea = null;
oFF.DataArea.prototype.m_environment = null;
oFF.DataArea.prototype.m_model = null;
oFF.DataArea.prototype.m_cellLockingType = null;
oFF.DataArea.prototype.releaseObject = function()
{
	this.m_dataArea = null;
	this.m_environment = null;
	this.m_model = null;
	this.m_cellLockingType = null;
	oFF.PlanningContext.prototype.releaseObject.call( this );
};
oFF.DataArea.prototype.getPlanningContextType = function()
{
	return oFF.PlanningContextType.DATA_AREA;
};
oFF.DataArea.prototype.getDataArea = function()
{
	return this.m_dataArea;
};
oFF.DataArea.prototype.setDataArea = function(dataArea)
{
	this.m_dataArea = dataArea;
};
oFF.DataArea.prototype.getEnvironment = function()
{
	var dataAreaState = oFF.DataAreaState.getDataAreaState(this);
	if (oFF.notNull(dataAreaState))
	{
		return dataAreaState.getEnvironment();
	}
	return this.m_environment;
};
oFF.DataArea.prototype.setEnvironment = function(environment)
{
	this.m_environment = environment;
};
oFF.DataArea.prototype.getModel = function()
{
	var dataAreaState = oFF.DataAreaState.getDataAreaState(this);
	if (oFF.notNull(dataAreaState))
	{
		return dataAreaState.getModel();
	}
	return this.m_model;
};
oFF.DataArea.prototype.setModel = function(model)
{
	this.m_model = model;
};
oFF.DataArea.prototype.getCellLockingType = function()
{
	var dataAreaState = oFF.DataAreaState.getDataAreaState(this);
	if (oFF.notNull(dataAreaState))
	{
		return dataAreaState.getCellLocking();
	}
	return this.m_cellLockingType;
};
oFF.DataArea.prototype.setCellLockingType = function(cellLockingType)
{
	this.m_cellLockingType = cellLockingType;
};
oFF.DataArea.prototype.getQueryConsumerServices = function()
{
	return oFF.DataAreaUtil.getQueryConsumerServices(this);
};
oFF.DataArea.prototype.supportsPlanningContextCommandType = function(planningContextCommandType)
{
	if (oFF.isNull(planningContextCommandType))
	{
		return false;
	}
	if (planningContextCommandType === oFF.PlanningContextCommandType.PUBLISH)
	{
		return true;
	}
	if (planningContextCommandType === oFF.PlanningContextCommandType.REFRESH)
	{
		return true;
	}
	if (planningContextCommandType === oFF.PlanningContextCommandType.RESET)
	{
		return true;
	}
	if (planningContextCommandType === oFF.PlanningContextCommandType.DOC_RESET || planningContextCommandType === oFF.PlanningContextCommandType.DOC_SAVE)
	{
		return true;
	}
	if (planningContextCommandType === oFF.PlanningContextCommandType.CLOSE)
	{
		return this.supportsClose();
	}
	return false;
};
oFF.DataArea.prototype.m_supportsClose = false;
oFF.DataArea.prototype.m_supportsCloseChecked = false;
oFF.DataArea.prototype.supportsClose = function()
{
	if (!this.m_supportsCloseChecked)
	{
		this.m_supportsClose = this._supportsClose();
		this.m_supportsCloseChecked = true;
	}
	return this.m_supportsClose;
};
oFF.DataArea.prototype._getServiceConfig = function()
{
	var planningService = this.getPlanningService();
	return oFF.isNull(planningService) ? null : planningService.getServiceConfig();
};
oFF.DataArea.prototype._supportsCapability = function(capabilityName)
{
	var serviceConfig = this._getServiceConfig();
	if (oFF.isNull(serviceConfig))
	{
		return false;
	}
	var application = serviceConfig.getApplication();
	if (oFF.isNull(application))
	{
		return false;
	}
	var connectionContainer = application.getConnectionPool().getConnection(serviceConfig.getSystemName());
	return connectionContainer.supportsAnalyticCapability(capabilityName);
};
oFF.DataArea.prototype._supportsChangedData = function()
{
	return this._supportsCapability("ChangeCounter");
};
oFF.DataArea.prototype._supportsClose = function()
{
	return this._supportsCapability("ActionClose");
};
oFF.DataArea.prototype.createPlanningContextCommand = function(planningContextCommandType)
{
	if (!this.supportsPlanningContextCommandType(planningContextCommandType))
	{
		return null;
	}
	var dataAreaCommand;
	if (planningContextCommandType === oFF.PlanningContextCommandType.CLOSE)
	{
		dataAreaCommand = new oFF.DataAreaCommandClose();
	}
	else
	{
		dataAreaCommand = new oFF.DataAreaCommand();
	}
	dataAreaCommand.setPlanningService(this.getPlanningService());
	dataAreaCommand.setCommandType(oFF.PlanningCommandType.DATA_AREA_COMMAND);
	dataAreaCommand.setPlanningContext(this);
	dataAreaCommand.setPlanningContextCommandType(planningContextCommandType);
	dataAreaCommand.setInvalidatingResultSet(planningContextCommandType.isInvalidatingResultSet());
	return dataAreaCommand;
};
oFF.DataArea.prototype.createRequestCreateCommandWithId = function(commandIdentifier)
{
	return this.createRequestCreatePlanningOperation(commandIdentifier);
};
oFF.DataArea.prototype.createPlanningFunctionIdentifier = function(planningFunctionName)
{
	var identifier = new oFF.PlanningFunctionIdentifier();
	identifier.setPlanningCommandType(oFF.PlanningCommandType.PLANNING_FUNCTION);
	identifier.setPlanningOperationType(oFF.PlanningOperationType.PLANNING_FUNCTION);
	identifier.setCommandId(planningFunctionName);
	return identifier;
};
oFF.DataArea.prototype.createRequestGetPlanningFunctionMetadata = function(planningFunctionIdentifier)
{
	var request = new oFF.DataAreaRequestGetPlanningFunctionMetadata();
	request.setPlanningService(this.getPlanningService());
	request.setCommandType(oFF.PlanningCommandType.PLANNING_MODEL_REQUEST);
	request.setRequestType(oFF.DataAreaRequestType.GET_PLANNING_FUNCTION_METADATA);
	request.setPlanningOperationIdentifier(planningFunctionIdentifier);
	request.setPlanningContext(this);
	return request;
};
oFF.DataArea.prototype.createPlanningSequenceIdentifier = function(planningSequenceName)
{
	var identifier = new oFF.PlanningSequenceIdentifier();
	identifier.setPlanningCommandType(oFF.PlanningCommandType.PLANNING_SEQUENCE);
	identifier.setPlanningOperationType(oFF.PlanningOperationType.PLANNING_SEQUENCE);
	identifier.setCommandId(planningSequenceName);
	return identifier;
};
oFF.DataArea.prototype.createRequestGetPlanningSequenceMetadata = function(planningSequenceIdentifier)
{
	var request = new oFF.DataAreaRequestGetPlanningSequenceMetadata();
	request.setPlanningService(this.getPlanningService());
	request.setCommandType(oFF.PlanningCommandType.PLANNING_MODEL_REQUEST);
	request.setRequestType(oFF.DataAreaRequestType.GET_PLANNING_SEQUENCE_METADATA);
	request.setPlanningOperationIdentifier(planningSequenceIdentifier);
	request.setPlanningContext(this);
	return request;
};
oFF.DataArea.prototype.createPlanningOperationIdentifierByDataSource = function(dataSource)
{
	if (oFF.isNull(dataSource))
	{
		return null;
	}
	var planningOperationName = dataSource.getObjectName();
	var type = dataSource.getType();
	if (type === oFF.MetaObjectType.PLANNING_FUNCTION)
	{
		return this.createPlanningFunctionIdentifier(planningOperationName);
	}
	else if (type === oFF.MetaObjectType.PLANNING_SEQUENCE)
	{
		return this.createPlanningSequenceIdentifier(planningOperationName);
	}
	return null;
};
oFF.DataArea.prototype.createPlanningOperationIdentifier = function(planningOperationName, planningOperationType)
{
	if (planningOperationType === oFF.PlanningOperationType.PLANNING_FUNCTION)
	{
		return this.createPlanningFunctionIdentifier(planningOperationName);
	}
	if (planningOperationType === oFF.PlanningOperationType.PLANNING_SEQUENCE)
	{
		return this.createPlanningSequenceIdentifier(planningOperationName);
	}
	oFF.noSupport();
};
oFF.DataArea.prototype.createRequestGetPlanningOperationMetadata = function(planningOperationIdentifier)
{
	var planningOperationType = planningOperationIdentifier.getPlanningOperationType();
	if (planningOperationType === oFF.PlanningOperationType.PLANNING_FUNCTION)
	{
		return this.createRequestGetPlanningFunctionMetadata(planningOperationIdentifier);
	}
	if (planningOperationType === oFF.PlanningOperationType.PLANNING_SEQUENCE)
	{
		return this.createRequestGetPlanningSequenceMetadata(planningOperationIdentifier);
	}
	oFF.noSupport();
};
oFF.DataArea.prototype.createRequestCreatePlanningOperation = function(planningOperationIdentifier)
{
	var operationType = planningOperationIdentifier.getPlanningOperationType();
	if (operationType === oFF.PlanningOperationType.PLANNING_FUNCTION)
	{
		return this.createRequestCreatePlanningFunction(planningOperationIdentifier);
	}
	else if (operationType === oFF.PlanningOperationType.PLANNING_SEQUENCE)
	{
		return this.createRequestCreatePlanningSequence(planningOperationIdentifier);
	}
	throw oFF.XException.createRuntimeException("illegal operation identifier");
};
oFF.DataArea.prototype.createRequestCreatePlanningFunction = function(planningFunctionIdentifier)
{
	var planningService = this.getPlanningService();
	var request = oFF.DataAreaRequestCreatePlanningFunction.create(planningService);
	request.setCommandType(oFF.PlanningCommandType.PLANNING_MODEL_REQUEST);
	request.setRequestType(oFF.DataAreaRequestType.CREATE_PLANNING_FUNCTION);
	request.setCommandIdentifier(planningFunctionIdentifier);
	request.setPlanningContext(this);
	return request;
};
oFF.DataArea.prototype.createRequestCreatePlanningSequence = function(planningSequenceIdentifier)
{
	var request = oFF.DataAreaRequestCreatePlanningSequence.create(this.getPlanningService());
	request.setCommandType(oFF.PlanningCommandType.PLANNING_MODEL_REQUEST);
	request.setRequestType(oFF.DataAreaRequestType.CREATE_PLANNING_SEQUENCE);
	request.setCommandIdentifier(planningSequenceIdentifier);
	request.setPlanningContext(this);
	return request;
};
oFF.DataArea.prototype.supportsChangedData = function()
{
	if (!this.m_supportsChangedDataChecked)
	{
		this.m_supportsChangedData = this._supportsChangedData();
		this.m_supportsChangedDataChecked = true;
	}
	return this.m_supportsChangedData;
};
oFF.DataArea.prototype.m_supportsChangedData = false;
oFF.DataArea.prototype.m_supportsChangedDataChecked = false;
oFF.DataArea.prototype.hasChangedData = function()
{
	var dataAreaState = oFF.DataAreaState.getDataAreaState(this);
	if (oFF.isNull(dataAreaState))
	{
		return false;
	}
	return dataAreaState.hasChangedData();
};
oFF.DataArea.prototype.supportsWorkStatus = function()
{
	return this.supportsChangedData();
};
oFF.DataArea.prototype.isWorkStatusActive = function()
{
	var dataAreaState = oFF.DataAreaState.getDataAreaState(this);
	if (oFF.isNull(dataAreaState))
	{
		return false;
	}
	return dataAreaState.isWorkStatusActive();
};
oFF.DataArea.prototype.isInitializedAtServer = function()
{
	var dataAreaState = oFF.DataAreaState.getDataAreaState(this);
	if (oFF.isNull(dataAreaState))
	{
		return false;
	}
	return dataAreaState.isSubmitted();
};
oFF.DataArea.prototype.createCommandPublish = function()
{
	return this.createPlanningContextCommand(oFF.PlanningContextCommandType.PUBLISH);
};
oFF.DataArea.prototype.createCommandClose = function()
{
	return this.createPlanningContextCommand(oFF.PlanningContextCommandType.CLOSE);
};

oFF.PlanningModel = function() {};
oFF.PlanningModel.prototype = new oFF.PlanningContext();
oFF.PlanningModel.prototype._ff_c = "PlanningModel";

oFF.PlanningModel.create = function()
{
	var model = new oFF.PlanningModel();
	model.m_versionParametersMetadata = oFF.XHashMapByString.create();
	model.m_planningModelBehaviour = oFF.PlanningModelBehaviour.STANDARD;
	model.m_persistenceType = oFF.PlanningPersistenceType.DEFAULT;
	return model;
};
oFF.PlanningModel.updateStateFromResponse = function(application, systemName, request, response, messageCollector)
{
	var systemLandscape = application.getSystemLandscape();
	if (oFF.isNull(systemLandscape) || !systemLandscape.existsSystemName(systemName))
	{
		return;
	}
	var systemType = systemLandscape.getSystemDescription(systemName).getSystemType();
	if (oFF.isNull(systemType) || !systemType.isTypeOf(oFF.SystemType.HANA))
	{
		return;
	}
	var hasErrors = oFF.InAHelper.importMessages(response, messageCollector);
	if (hasErrors)
	{
		return;
	}
	var commands = request.getStructureByKey("Planning").getListByKey("commands");
	var command = oFF.PrUtils.getStructureWithKeyValuePair(commands, "command", "get_versions");
	var planningService = oFF.PlanningModelUtil.getPlanningService(application, systemName, command.getStringByKey("schema"), command.getStringByKey("model"));
	if (oFF.isNull(planningService))
	{
		return;
	}
	if (oFF.PlanningModelCommandHelper.getResponsesReturnCodeStrict(response, messageCollector) !== 0)
	{
		return;
	}
	var planningModel = planningService.getPlanningContext();
	var responses = response.getListByKey("Planning");
	if (!oFF.PlanningModelCommandHelper.processResponseGetVersions(commands, responses, planningModel))
	{
		messageCollector.addErrorExt(oFF.OriginLayer.PROTOCOL, 0, "Planning response structure invalid", null);
	}
};
oFF.PlanningModel.updateState = function(application, systemName, responseStructure, messageCollector)
{
	var systemLandscape = application.getSystemLandscape();
	if (oFF.isNull(systemLandscape))
	{
		return;
	}
	var systemDescription = systemLandscape.getSystemDescription(systemName);
	if (oFF.isNull(systemDescription))
	{
		return;
	}
	var systemType = systemDescription.getSystemType();
	if (oFF.isNull(systemType))
	{
		return;
	}
	if (!systemType.isTypeOf(oFF.SystemType.HANA))
	{
		return;
	}
	var planningStructure = oFF.PrUtils.getStructureProperty(responseStructure, "Planning");
	if (oFF.isNull(planningStructure))
	{
		return;
	}
	var returnCode = oFF.PrUtils.getIntegerValueProperty(planningStructure, "return_code", -1);
	if (returnCode !== 0)
	{
		messageCollector.addErrorExt(oFF.OriginLayer.SERVER, 0, oFF.XStringBuffer.create().append("Planning return code: ").appendInt(returnCode).toString(), null);
		return;
	}
	if (!oFF.PlanningModel.updateVersionsState(application, systemName, planningStructure))
	{
		messageCollector.addErrorExt(oFF.OriginLayer.PROTOCOL, 0, oFF.XStringBuffer.create().append("Planning response structure invalid").toString(), null);
	}
};
oFF.PlanningModel.updateVersionsState = function(application, systemName, planningStructure)
{
	var isOk = true;
	var versionsList = oFF.PrUtils.getListProperty(planningStructure, "versions");
	var len = oFF.PrUtils.getListSize(versionsList, 0);
	for (var i = 0; i < len; i++)
	{
		var versionStructure = oFF.PrUtils.getStructureElement(versionsList, i);
		if (!oFF.PlanningModel.updateVersionState(application, systemName, versionStructure))
		{
			isOk = false;
		}
	}
	return isOk;
};
oFF.PlanningModel.updateVersionState = function(application, systemName, versionStructure)
{
	if (oFF.isNull(versionStructure))
	{
		return false;
	}
	var planningSchema = oFF.PrUtils.getStringValueProperty(versionStructure, "schema", null);
	if (oFF.isNull(planningSchema))
	{
		return false;
	}
	var planningModel = oFF.PrUtils.getStringValueProperty(versionStructure, "model", null);
	if (oFF.isNull(planningModel))
	{
		return false;
	}
	var planningService = oFF.PlanningModelUtil.getPlanningService(application, systemName, planningSchema, planningModel);
	if (oFF.isNull(planningService))
	{
		return false;
	}
	var model = planningService.getPlanningContext();
	return oFF.isNull(model) ? false : model.updateVersionStateInternalIgnoreUndesired(versionStructure);
};
oFF.PlanningModel.prototype.m_planningModelSchema = null;
oFF.PlanningModel.prototype.m_planningModelName = null;
oFF.PlanningModel.prototype.m_planningModelBehaviour = null;
oFF.PlanningModel.prototype.m_versionsList = null;
oFF.PlanningModel.prototype.m_versionsMap = null;
oFF.PlanningModel.prototype.m_dataSources = null;
oFF.PlanningModel.prototype.m_actionMetadataList = null;
oFF.PlanningModel.prototype.m_actionMetadataMap = null;
oFF.PlanningModel.prototype.m_privileges = null;
oFF.PlanningModel.prototype.m_privilegesMap = null;
oFF.PlanningModel.prototype.m_modelInitialized = false;
oFF.PlanningModel.prototype.m_versionPrivilegesInitialized = false;
oFF.PlanningModel.prototype.m_versionParametersMetadata = null;
oFF.PlanningModel.prototype.m_withSharedVersions = false;
oFF.PlanningModel.prototype.m_backendUserName = null;
oFF.PlanningModel.prototype.m_persistenceType = null;
oFF.PlanningModel.prototype.m_withUniqueVersionDescriptions = false;
oFF.PlanningModel.prototype.m_withPublicVersionEdit = false;
oFF.PlanningModel.prototype.m_isPublicVersionEditInProgress = false;
oFF.PlanningModel.prototype.getOlapComponentType = function()
{
	return oFF.OlapComponentType.PLANNING_MODEL;
};
oFF.PlanningModel.prototype.getPlanningContextType = function()
{
	return oFF.PlanningContextType.PLANNING_MODEL;
};
oFF.PlanningModel.prototype.isModelInitialized = function()
{
	return this.m_modelInitialized;
};
oFF.PlanningModel.prototype.checkModelInitialized = function()
{
	if (!this.isModelInitialized())
	{
		throw oFF.XException.createIllegalStateException("planning model is not initialized");
	}
};
oFF.PlanningModel.prototype.setModelInitialized = function()
{
	this.m_modelInitialized = true;
	this.invalidate();
};
oFF.PlanningModel.prototype.invalidate = function()
{
	if (!this.isModelInitialized())
	{
		return;
	}
	if (this.supportsPublicVersionEdit() && this.isPublicVersionEditInProgress())
	{
		this.setPublicVersionEditInProgress(false);
	}
	oFF.PlanningContext.prototype.invalidate.call( this );
};
oFF.PlanningModel.prototype.resetPlanningModel = function()
{
	if (this.supportsPublicVersionEdit() && this.isPublicVersionEditInProgress())
	{
		this.setPublicVersionEditInProgress(false);
	}
	this.m_modelInitialized = false;
	this.getActionMetadataListInternal().clear();
	this.resetAllVersionStates();
	this.updateAllInvalidPrivileges();
};
oFF.PlanningModel.prototype.isVersionPrivilegesInitialized = function()
{
	return this.m_versionPrivilegesInitialized;
};
oFF.PlanningModel.prototype.setVersionPrivilegesInitialized = function()
{
	this.m_versionPrivilegesInitialized = true;
};
oFF.PlanningModel.prototype.hasChangedVersionPrivileges = function()
{
	if (!this.isVersionPrivilegesInitialized())
	{
		return false;
	}
	var versionPrivileges = this.getVersionPrivileges();
	if (oFF.isNull(versionPrivileges) || versionPrivileges.isEmpty())
	{
		return false;
	}
	for (var i = 0; i < versionPrivileges.size(); i++)
	{
		var versionPrivilege = versionPrivileges.get(i);
		var privilegeState = versionPrivilege.getPrivilegeState();
		if (privilegeState === oFF.PlanningPrivilegeState.TO_BE_GRANTED || privilegeState === oFF.PlanningPrivilegeState.TO_BE_REVOKED)
		{
			return true;
		}
	}
	return false;
};
oFF.PlanningModel.prototype.resetAllVersionStates = function()
{
	if (oFF.isNull(this.m_versionsList))
	{
		return;
	}
	for (var i = 0; i < this.m_versionsList.size(); i++)
	{
		var version = this.m_versionsList.get(i);
		version.resetVersionState();
	}
};
oFF.PlanningModel.prototype.updateAllInvalidPrivileges = function()
{
	if (oFF.isNull(this.m_versionsList))
	{
		return;
	}
	for (var i = 0; i < this.m_versionsList.size(); i++)
	{
		var version = this.m_versionsList.get(i);
		version.updateInvalidPrivileges();
	}
};
oFF.PlanningModel.prototype.getVersionIdentifier = function(versionId, sharedVersion, versionOwner)
{
	return oFF.PlanningVersionIdentifier.create(versionId, sharedVersion, versionOwner);
};
oFF.PlanningModel.prototype.copyVersionIdentifier = function(versionIdentifier)
{
	return oFF.PlanningVersionIdentifier.create(versionIdentifier.getVersionId(), versionIdentifier.isSharedVersion(), versionIdentifier.getVersionOwner());
};
oFF.PlanningModel.prototype.getVersionByIdInternal = function(versionIdentifier)
{
	return this.m_versionsMap.getByKey(versionIdentifier.getVersionUniqueName());
};
oFF.PlanningModel.prototype.addInputEnabledPublicVersion = function(sourceVersionName)
{
	this.checkModelInitialized();
	var planningVersion = this.m_versionsMap.getByKey(sourceVersionName);
	if (oFF.isNull(planningVersion))
	{
		planningVersion = oFF.PlanningVersion.create();
		planningVersion.setPlanningModel(this);
		planningVersion.setVersionIdentifier(oFF.PlanningVersionIdentifier.create(-1, false, null));
	}
	planningVersion.setSourceVersionName(sourceVersionName);
	planningVersion.setShowingAsPublicVersion(true);
	planningVersion.updateInvalidPrivileges();
	planningVersion.setVersionState(oFF.PlanningVersionState.CLEAN);
	this.m_versionsMap.put(sourceVersionName, planningVersion);
	this.m_versionsList.add(planningVersion);
	this.setWithPublicVersionEdit(true);
	this.setPublicVersionEditInProgress(true);
	return true;
};
oFF.PlanningModel.prototype.getVersionById = function(versionIdentifier, versionDescription)
{
	this.checkModelInitialized();
	var planningVersion = this.getVersionByIdInternal(versionIdentifier);
	if (oFF.isNull(planningVersion))
	{
		planningVersion = oFF.PlanningVersion.create();
		planningVersion.setPlanningModel(this);
		planningVersion.setVersionIdentifier(versionIdentifier);
		planningVersion.setVersionDescription(versionDescription);
		planningVersion.updateInvalidPrivileges();
		this.m_versionsMap.put(versionIdentifier.getVersionUniqueName(), planningVersion);
		this.m_versionsList.add(planningVersion);
	}
	else if (planningVersion.getVersionState() === null)
	{
		planningVersion.setVersionDescription(versionDescription);
	}
	return planningVersion;
};
oFF.PlanningModel.prototype.getDataSourcesInternal = function()
{
	return this.m_dataSources;
};
oFF.PlanningModel.prototype.getActionMetadataListInternal = function()
{
	this.m_actionMetadataMap = oFF.XObjectExt.release(this.m_actionMetadataMap);
	return this.m_actionMetadataList;
};
oFF.PlanningModel.prototype.getActionMetadataMap = function()
{
	this.checkModelInitialized();
	if (oFF.isNull(this.m_actionMetadataMap))
	{
		this.m_actionMetadataMap = oFF.XHashMapByString.create();
		for (var i = 0; i < this.m_actionMetadataList.size(); i++)
		{
			var actionMetadata = this.m_actionMetadataList.get(i);
			var actionId = actionMetadata.getActionId();
			this.m_actionMetadataMap.put(actionId, actionMetadata);
		}
	}
	return this.m_actionMetadataMap;
};
oFF.PlanningModel.prototype.getPlanningModelSchema = function()
{
	return this.m_planningModelSchema;
};
oFF.PlanningModel.prototype.setPlanningModelSchema = function(planningModelSchema)
{
	this.m_planningModelSchema = planningModelSchema;
};
oFF.PlanningModel.prototype.getPlanningModelName = function()
{
	return this.m_planningModelName;
};
oFF.PlanningModel.prototype.setPlanningModelName = function(planningModelName)
{
	this.m_planningModelName = planningModelName;
};
oFF.PlanningModel.prototype.getPlanningModelBehaviour = function()
{
	return this.m_planningModelBehaviour;
};
oFF.PlanningModel.prototype.setPlanningModelBehaviour = function(planningModelBehaviour)
{
	this.m_planningModelBehaviour = planningModelBehaviour;
};
oFF.PlanningModel.prototype.initializePlanningModel = function(syncType)
{
	this.m_dataSources = oFF.XList.create();
	this.m_versionsList = oFF.XList.create();
	this.m_versionsMap = oFF.XHashMapByString.create();
	this.m_actionMetadataList = oFF.XList.create();
	this.m_privileges = oFF.XList.create();
	this.m_privilegesMap = oFF.XHashMapByString.create();
	var commandFactory = oFF.XCommandFactory.create(this.getPlanningService().getApplication());
	var cmdStep1 = commandFactory.createCommand(oFF.XCmdInitPlanningStep.CMD_NAME);
	cmdStep1.addParameter(oFF.XCmdInitPlanningStep.PARAM_I_PLANNING_MODEL, this);
	cmdStep1.addParameter(oFF.XCmdInitPlanningStep.PARAM_I_STEP, oFF.XCmdInitPlanningStep.STEP_1_REFRESH_VERSIONS);
	var cmdStep2 = commandFactory.createCommand(oFF.XCmdInitPlanningStep.CMD_NAME);
	cmdStep2.addParameter(oFF.XCmdInitPlanningStep.PARAM_I_PLANNING_MODEL, this);
	cmdStep2.addParameter(oFF.XCmdInitPlanningStep.PARAM_I_STEP, oFF.XCmdInitPlanningStep.STEP_2_INIT_VERSIONS);
	cmdStep1.setFollowUpCommand(oFF.XCommandFollowUpType.SUCCESS, cmdStep2);
	cmdStep1.processCommand(syncType, this, null);
};
oFF.PlanningModel.prototype.onCommandProcessed = function(extResult, commandResult, customIdentifier)
{
	var planningService = this.getPlanningService();
	planningService.addAllMessages(extResult);
	this.getPlanningService()._setInitialized(this);
};
oFF.PlanningModel.prototype.supportsPlanningContextCommandType = function(planningContextCommandType)
{
	if (oFF.isNull(planningContextCommandType))
	{
		return false;
	}
	if (planningContextCommandType === oFF.PlanningContextCommandType.SAVE)
	{
		return true;
	}
	if (planningContextCommandType === oFF.PlanningContextCommandType.BACKUP)
	{
		return true;
	}
	if (planningContextCommandType === oFF.PlanningContextCommandType.REFRESH)
	{
		return true;
	}
	if (planningContextCommandType === oFF.PlanningContextCommandType.RESET)
	{
		return true;
	}
	if (planningContextCommandType === oFF.PlanningContextCommandType.CLOSE)
	{
		return true;
	}
	return planningContextCommandType === oFF.PlanningContextCommandType.HARD_DELETE;
};
oFF.PlanningModel.prototype.createPlanningContextCommand = function(planningContextCommandType)
{
	if (!this.supportsPlanningContextCommandType(planningContextCommandType))
	{
		return null;
	}
	var planningModelCommand;
	if (planningContextCommandType === oFF.PlanningContextCommandType.CLOSE)
	{
		planningModelCommand = new oFF.PlanningModelCloseCommand();
	}
	else
	{
		planningModelCommand = new oFF.PlanningModelCommand();
	}
	planningModelCommand.setPlanningService(this.getPlanningService());
	planningModelCommand.setCommandType(oFF.PlanningCommandType.PLANNING_MODEL_COMMAND);
	planningModelCommand.setPlanningContext(this);
	planningModelCommand.setPlanningContextCommandType(planningContextCommandType);
	planningModelCommand.setInvalidatingResultSet(planningContextCommandType.isInvalidatingResultSet());
	return planningModelCommand;
};
oFF.PlanningModel.prototype.createRequestUpdateVersionPrivileges = function()
{
	this.checkModelInitialized();
	var request = new oFF.PlanningModelRequestUpdateVersionPrivileges();
	this.initializePlanningModelRequest(request, oFF.PlanningModelRequestType.UPDATE_PRIVILEGES);
	return request;
};
oFF.PlanningModel.prototype.updateVersionPrivileges = function()
{
	this.checkModelInitialized();
	var command = this.createRequestUpdateVersionPrivileges();
	var commandResult = command.processCommand(oFF.SyncType.BLOCKING, null, null);
	return oFF.ExtResult.create(commandResult.getData(), commandResult);
};
oFF.PlanningModel.prototype.createRequestCleanup = function()
{
	this.checkModelInitialized();
	var request = new oFF.PlanningModelRequestCleanup();
	this.initializePlanningModelRequest(request, oFF.PlanningModelRequestType.CLEANUP);
	return request;
};
oFF.PlanningModel.prototype.createRequestCreateCommandWithId = function(commandIdentifier)
{
	this.checkModelInitialized();
	var actionIdentifier = commandIdentifier;
	oFF.XObjectExt.assertNotNullExt(actionIdentifier, "Action  is not yet known by client");
	var request = new oFF.PlanningModelRequestCreateAction();
	this.initializePlanningModelRequest(request, oFF.PlanningModelRequestType.CREATE_PLANNING_ACTION);
	request.setCommandIdentifier(actionIdentifier);
	var metadata = this.getActionMetadata(actionIdentifier.getActionId()).getActionParameterMetadata();
	request.setActionParameters(metadata);
	return request;
};
oFF.PlanningModel.prototype.getActionIdentifierById = function(actionId, planningVersionIdentifier)
{
	this.checkModelInitialized();
	var actionMetadata = this.getActionMetadata(actionId);
	if (oFF.isNull(actionMetadata))
	{
		return null;
	}
	var actionType = actionMetadata.getActionType();
	if (oFF.isNull(actionType))
	{
		return null;
	}
	if (!actionType.isTypeOf(oFF.PlanningActionType.VERSION_ACTION))
	{
		return null;
	}
	var actionIdentifier = new oFF.PlanningActionIdentifier();
	actionIdentifier.setActionMetadata(actionMetadata);
	actionIdentifier.setCommandId(actionMetadata.getActionId());
	actionIdentifier.setPlanningCommandType(oFF.PlanningCommandType.PLANNING_ACTION);
	actionIdentifier.setVersionIdentifier(planningVersionIdentifier);
	return actionIdentifier;
};
oFF.PlanningModel.prototype.getQueryDataSources = function()
{
	this.checkModelInitialized();
	var result = oFF.XList.create();
	result.addAll(this.m_dataSources);
	return result;
};
oFF.PlanningModel.prototype.getVersions = function()
{
	return this._getVersions(true, false, true);
};
oFF.PlanningModel.prototype.getActiveVersions = function()
{
	return this._getVersions(true, false, false);
};
oFF.PlanningModel.prototype.getAllVersions = function()
{
	return this._getVersions(true, true, true);
};
oFF.PlanningModel.prototype.getSharedVersions = function()
{
	return this._getVersions(false, true, true);
};
oFF.PlanningModel.prototype._getVersions = function(withOwnVersions, withSharedVersions, withInactiveVersions)
{
	this.checkModelInitialized();
	var result = oFF.XList.create();
	for (var i = 0; i < this.m_versionsList.size(); i++)
	{
		var version = this.m_versionsList.get(i);
		if (version.getVersionState() === null)
		{
			continue;
		}
		if (!withOwnVersions)
		{
			if (!version.isSharedVersion())
			{
				continue;
			}
		}
		if (!withSharedVersions)
		{
			if (version.isSharedVersion())
			{
				continue;
			}
		}
		if (!withInactiveVersions)
		{
			if (!version.isActive())
			{
				continue;
			}
		}
		result.add(version);
	}
	return result;
};
oFF.PlanningModel.prototype.getActionIdentifiers = function()
{
	this.checkModelInitialized();
	var versions = this.getAllVersions();
	var result = oFF.XList.create();
	for (var i = 0; i < this.m_actionMetadataList.size(); i++)
	{
		var actionMetadata = this.m_actionMetadataList.get(i);
		for (var j = 0; j < versions.size(); j++)
		{
			var version = versions.get(j);
			if (!version.isActive())
			{
				continue;
			}
			var actionIdentifier = this.getActionIdentifierById(actionMetadata.getActionId(), version);
			if (oFF.isNull(actionIdentifier))
			{
				continue;
			}
			result.add(actionIdentifier);
		}
	}
	return result;
};
oFF.PlanningModel.prototype.getActionMetadataList = function()
{
	this.checkModelInitialized();
	var result = oFF.XList.create();
	result.addAll(this.m_actionMetadataList);
	return result;
};
oFF.PlanningModel.prototype.getActionMetadata = function(actionId)
{
	this.checkModelInitialized();
	var actionMetadataMap = this.getActionMetadataMap();
	return actionMetadataMap.getByKey(actionId);
};
oFF.PlanningModel.prototype.getQueryConsumerServices = function()
{
	this.checkModelInitialized();
	return oFF.PlanningModelUtil.getQueryConsumerServices(this);
};
oFF.PlanningModel.prototype.supportsChangedData = function()
{
	return true;
};
oFF.PlanningModel.prototype.hasChangedData = function()
{
	for (var i = 0; i < this.m_versionsList.size(); i++)
	{
		var version = this.m_versionsList.get(i);
		if (version.getVersionState() === oFF.PlanningVersionState.CHANGED)
		{
			return true;
		}
	}
	return false;
};
oFF.PlanningModel.prototype.supportsWorkStatus = function()
{
	return false;
};
oFF.PlanningModel.prototype.isWorkStatusActive = function()
{
	return false;
};
oFF.PlanningModel.prototype.getVersionPrivilege = function(queryDataSource, planningVersionId, planningPrivilege, grantee)
{
	return this.getVersionPrivilegeById(queryDataSource, this.getVersionIdentifier(planningVersionId, false, null), planningPrivilege, grantee);
};
oFF.PlanningModel.prototype.getVersionPrivilegeById = function(queryDataSource, planningVersionIdentifier, planningPrivilege, grantee)
{
	if (!this.isVersionPrivilegesInitialized())
	{
		throw oFF.XException.createIllegalStateException("version privileges are not yet initialized");
	}
	if (planningVersionIdentifier.isSharedVersion())
	{
		oFF.noSupport();
	}
	var qualifiedName = oFF.PlanningVersionPrivilege.createQualifiedName(this, queryDataSource, planningVersionIdentifier, planningPrivilege, grantee);
	var result = this.m_privilegesMap.getByKey(qualifiedName);
	if (oFF.isNull(result))
	{
		var newPlanningVersionPrivilege = oFF.PlanningVersionPrivilege.create(this, queryDataSource, planningVersionIdentifier, planningPrivilege, grantee);
		if (!oFF.XString.isEqual(newPlanningVersionPrivilege.getQualifiedName(), qualifiedName))
		{
			throw oFF.XException.createIllegalStateException("illegal qualified name");
		}
		this.m_privileges.add(newPlanningVersionPrivilege);
		this.m_privilegesMap.put(qualifiedName, newPlanningVersionPrivilege);
		result = newPlanningVersionPrivilege;
	}
	return result;
};
oFF.PlanningModel.prototype.getVersionPrivileges = function()
{
	if (!this.isVersionPrivilegesInitialized())
	{
		throw oFF.XException.createIllegalStateException("version privileges are not yet initialized");
	}
	return this.m_privileges;
};
oFF.PlanningModel.prototype.getActionForQueryIdentifiers = function()
{
	this.checkModelInitialized();
	var result = oFF.XList.create();
	var actionMetadataList = this.getActionMetadataList();
	for (var i = 0; i < actionMetadataList.size(); i++)
	{
		var actionMetadata = actionMetadataList.get(i);
		var actionIdentifier = this.getActionForQueryIdentifier(actionMetadata.getActionId());
		if (oFF.isNull(actionIdentifier))
		{
			continue;
		}
		result.add(actionIdentifier);
	}
	return result;
};
oFF.PlanningModel.prototype.getActionForQueryIdentifier = function(actionId)
{
	this.checkModelInitialized();
	var actionMetadata = this.getActionMetadata(actionId);
	if (oFF.isNull(actionMetadata))
	{
		return null;
	}
	var actionType = actionMetadata.getActionType();
	if (oFF.isNull(actionType))
	{
		return null;
	}
	if (!actionType.isTypeOf(oFF.PlanningActionType.QUERY_ACTION))
	{
		return null;
	}
	var actionIdentifier = new oFF.PlanningActionForQueryIdentifier();
	actionIdentifier.setActionMetadata(actionMetadata);
	actionIdentifier.setCommandId(actionMetadata.getActionId());
	actionIdentifier.setPlanningCommandType(oFF.PlanningCommandType.PLANNING_ACTION);
	return actionIdentifier;
};
oFF.PlanningModel.prototype.initializePlanningModelRequest = function(request, requestType)
{
	request.setCommandType(oFF.PlanningCommandType.PLANNING_MODEL_REQUEST);
	request.setRequestType(requestType);
	request.setPlanningContext(this);
	request.setPlanningService(this.getPlanningService());
	request.setInvalidatingResultSet(requestType.isInvalidatingResultSet());
};
oFF.PlanningModel.prototype.getVersionParametersMetadata = function()
{
	return this.m_versionParametersMetadata;
};
oFF.PlanningModel.prototype.getVersionParametersMetadataInternal = function()
{
	return this.m_versionParametersMetadata;
};
oFF.PlanningModel.prototype.getPlanningCapabilities = function()
{
	var olapEnvironment = this.getPlanningService().getApplication().getOlapEnvironment();
	var systemContainer = olapEnvironment.getSystemContainer(this.getPlanningService().getServiceConfig().getSystemName());
	return systemContainer.getServiceCapabilities(oFF.ServerService.PLANNING);
};
oFF.PlanningModel.prototype.supportsVersionParameters = function()
{
	return this.getPlanningCapabilities().supportsVersionParameters();
};
oFF.PlanningModel.prototype.supportsVersionPrivileges = function()
{
	return this.getPlanningCapabilities().supportsVersionPrivileges();
};
oFF.PlanningModel.prototype.createRequestRefreshVersions = function()
{
	this.checkModelInitialized();
	var request = new oFF.PlanningModelRequestRefreshVersions();
	this.initializePlanningModelRequest(request, oFF.PlanningModelRequestType.REFRESH_VERSIONS);
	return request;
};
oFF.PlanningModel.prototype.createRequestRefreshActions = function()
{
	this.checkModelInitialized();
	var request = new oFF.PlanningModelRequestRefreshActions();
	this.initializePlanningModelRequest(request, oFF.PlanningModelRequestType.REFRESH_ACTIONS);
	return request;
};
oFF.PlanningModel.prototype.refreshVersions = function()
{
	this.checkModelInitialized();
	var command = this.createRequestRefreshVersions();
	var commandResult = command.processCommand(oFF.SyncType.BLOCKING, null, null);
	return oFF.ExtResult.create(commandResult.getData(), commandResult);
};
oFF.PlanningModel.prototype.setBackendUserName = function(backendUserName)
{
	this.m_backendUserName = backendUserName;
};
oFF.PlanningModel.prototype.getBackendUserName = function()
{
	return this.m_backendUserName;
};
oFF.PlanningModel.prototype.setWithSharedVersions = function(withSharedVersions)
{
	this.m_withSharedVersions = withSharedVersions;
};
oFF.PlanningModel.prototype.isWithSharedVersions = function()
{
	return this.m_withSharedVersions;
};
oFF.PlanningModel.prototype.getPersistenceType = function()
{
	return this.m_persistenceType;
};
oFF.PlanningModel.prototype.setPersistenceType = function(persistenceType)
{
	oFF.XObjectExt.assertNotNullExt(persistenceType, "persistence type must not be null");
	this.m_persistenceType = persistenceType;
};
oFF.PlanningModel.prototype.updateVersionStateInternalIgnoreUndesired = function(versionStructure)
{
	var versionIdElement = oFF.PrUtils.getIntegerProperty(versionStructure, "version_id");
	if (oFF.isNull(versionIdElement))
	{
		return false;
	}
	var activeBoolean = oFF.PrUtils.getBooleanProperty(versionStructure, "active");
	if (oFF.isNull(activeBoolean))
	{
		return false;
	}
	var versionState = oFF.PlanningVersionState.lookup(versionStructure.getStringByKey("state"));
	if (oFF.isNull(versionState))
	{
		return false;
	}
	var isActive = activeBoolean.getBoolean();
	if (isActive !== versionState.isActive())
	{
		return false;
	}
	var totalChangesSize = versionStructure.getIntegerByKeyExt("changes", 0);
	var undoChangesSize = versionStructure.getIntegerByKeyExt("undo_changes", 0);
	var sharedVersion = false;
	var versionOwner = versionStructure.getStringByKey("owner");
	if (!oFF.XStringUtils.isNullOrEmpty(versionOwner) || oFF.XString.isEqual(versionOwner, this.m_backendUserName))
	{
		versionOwner = null;
	}
	var privilege = oFF.PlanningPrivilege.lookup(versionStructure.getStringByKey("privilege"));
	if (oFF.XStringUtils.isNullOrEmpty(versionOwner) && oFF.isNull(privilege))
	{
		privilege = oFF.PlanningPrivilege.OWNER;
	}
	if (privilege === oFF.PlanningPrivilege.OWNER)
	{
		versionOwner = null;
	}
	else
	{
		sharedVersion = true;
	}
	if (sharedVersion && !this.m_withSharedVersions && !oFF.XStringUtils.isNullOrEmpty(this.m_backendUserName))
	{
		return true;
	}
	if (!sharedVersion && privilege !== oFF.PlanningPrivilege.OWNER)
	{
		return false;
	}
	if (sharedVersion && privilege === oFF.PlanningPrivilege.OWNER)
	{
		return false;
	}
	var versionId = versionIdElement.getInteger();
	var versionDescription = versionStructure.getStringByKey("description");
	var planningVersionIdentifier = this.getVersionIdentifier(versionId, sharedVersion, versionOwner);
	var planningVersion = this.getVersionById(planningVersionIdentifier, versionDescription);
	if (planningVersion.getVersionState() === null)
	{
		return false;
	}
	planningVersion.setVersionState(versionState);
	planningVersion.setTotalChangesSize(totalChangesSize);
	planningVersion.setUndoChangesSize(undoChangesSize);
	return true;
};
oFF.PlanningModel.prototype.getAction = function(actionIdentifier)
{
	var action = new oFF.PlanningAction();
	action.setCommandType(oFF.PlanningCommandType.PLANNING_ACTION);
	action.setPlanningService(this.getPlanningService());
	action.setPlanningContext(this);
	action.setCommandIdentifier(actionIdentifier);
	var metadata = this.getActionMetadata(actionIdentifier.getActionId()).getActionParameterMetadata();
	action.setActionParameterMetadata(metadata);
	return action;
};
oFF.PlanningModel.prototype.getActionForQuery = function(actionIdentifier)
{
	this.checkModelInitialized();
	if (oFF.isNull(actionIdentifier))
	{
		return null;
	}
	var action = new oFF.PlanningAction();
	action.setCommandType(oFF.PlanningCommandType.PLANNING_ACTION);
	action.setPlanningService(this.getPlanningService());
	action.setPlanningContext(this);
	action.setCommandIdentifier(actionIdentifier);
	var metadata = this.getActionMetadata(actionIdentifier.getActionId()).getActionParameterMetadata();
	action.setActionParameterMetadata(metadata);
	return action;
};
oFF.PlanningModel.prototype.isWithUniqueVersionDescriptions = function()
{
	return this.m_withUniqueVersionDescriptions;
};
oFF.PlanningModel.prototype.setWithUniqueVersionDescriptions = function(uniqueVersionDescriptions)
{
	this.m_withUniqueVersionDescriptions = uniqueVersionDescriptions;
};
oFF.PlanningModel.prototype.isVersionDescriptionUnique = function(versionDescription)
{
	var versionIterator = this.getVersions().getIterator();
	var newDescription = oFF.XString.toLowerCase(versionDescription);
	while (versionIterator.hasNext())
	{
		var oldDescription = oFF.XString.toLowerCase(versionIterator.next().getVersionDescription());
		if (oFF.XString.isEqual(oldDescription, newDescription))
		{
			return false;
		}
	}
	return true;
};
oFF.PlanningModel.prototype.createCommandSave = function()
{
	return this.createPlanningContextCommand(oFF.PlanningContextCommandType.SAVE);
};
oFF.PlanningModel.prototype.createCommandClose = function()
{
	return this.createPlanningContextCommand(oFF.PlanningContextCommandType.CLOSE);
};
oFF.PlanningModel.prototype.createCommandBackup = function()
{
	return this.createPlanningContextCommand(oFF.PlanningContextCommandType.BACKUP);
};
oFF.PlanningModel.prototype.isWithIgnoreUndesiredSharedVersions = function()
{
	return true;
};
oFF.PlanningModel.prototype.hasActiveActions = function()
{
	if (!this.isModelInitialized())
	{
		return false;
	}
	var versions = this.getAllVersions();
	if (oFF.isNull(versions))
	{
		return false;
	}
	for (var i = 0; i < versions.size(); i++)
	{
		var version = versions.get(i);
		if (oFF.isNull(version))
		{
			continue;
		}
		if (version.isActionActive())
		{
			return true;
		}
	}
	return false;
};
oFF.PlanningModel.prototype.hasActiveActionSequences = function()
{
	if (!this.isModelInitialized())
	{
		return false;
	}
	var versions = this.getAllVersions();
	if (oFF.isNull(versions))
	{
		return false;
	}
	for (var i = 0; i < versions.size(); i++)
	{
		var version = versions.get(i);
		if (oFF.isNull(version))
		{
			continue;
		}
		if (version.isActionSequenceActive())
		{
			return true;
		}
	}
	return false;
};
oFF.PlanningModel.prototype.supportsPublicVersionEdit = function()
{
	return this.m_withPublicVersionEdit;
};
oFF.PlanningModel.prototype.setWithPublicVersionEdit = function(publicVersionEdit)
{
	this.m_withPublicVersionEdit = publicVersionEdit;
};
oFF.PlanningModel.prototype.setPublicVersionEditInProgress = function(inProgress)
{
	var services = this.getQueryConsumerServices();
	if (oFF.notNull(services))
	{
		var iterator = services.getIterator();
		while (iterator.hasNext())
		{
			var queryManager = iterator.next();
			queryManager.setPublicVersionEditPossible(inProgress);
		}
	}
	this.m_isPublicVersionEditInProgress = inProgress;
};
oFF.PlanningModel.prototype.isPublicVersionEditInProgress = function()
{
	return this.m_isPublicVersionEditInProgress;
};
oFF.PlanningModel.prototype.releaseObject = function()
{
	if (this.supportsPublicVersionEdit() && this.isPublicVersionEditInProgress())
	{
		this.setPublicVersionEditInProgress(false);
	}
	this.m_privileges = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_privileges);
	this.m_privilegesMap = oFF.XObjectExt.release(this.m_privilegesMap);
	this.m_planningModelSchema = null;
	this.m_backendUserName = null;
	this.m_persistenceType = null;
	this.m_planningModelBehaviour = null;
	this.m_planningModelName = null;
	this.m_versionParametersMetadata = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_versionParametersMetadata);
	this.m_versionsList = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_versionsList);
	this.m_versionsMap = oFF.XObjectExt.release(this.m_versionsMap);
	this.m_dataSources = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_dataSources);
	this.m_actionMetadataList = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_actionMetadataList);
	this.m_actionMetadataMap = oFF.XObjectExt.release(this.m_actionMetadataMap);
	oFF.PlanningContext.prototype.releaseObject.call( this );
};

oFF.PlanningContextCommand = function() {};
oFF.PlanningContextCommand.prototype = new oFF.PlanningCommand();
oFF.PlanningContextCommand.prototype._ff_c = "PlanningContextCommand";

oFF.PlanningContextCommand.PLANNING_CONTEXT = "PLANNING_CONTEXT";
oFF.PlanningContextCommand.PLANNING_CONTEXT_COMMAND_TYPE = "PLANNING_CONTEXT_COMMAND_TYPE";
oFF.PlanningContextCommand.prototype.getPlanningContext = function()
{
	return this.getPropertyObject(oFF.PlanningContextCommand.PLANNING_CONTEXT);
};
oFF.PlanningContextCommand.prototype.setPlanningContext = function(planningContext)
{
	this.setPropertyObject(oFF.PlanningContextCommand.PLANNING_CONTEXT, planningContext);
};
oFF.PlanningContextCommand.prototype.getPlanningContextCommandType = function()
{
	return this.getPropertyObject(oFF.PlanningContextCommand.PLANNING_CONTEXT_COMMAND_TYPE);
};
oFF.PlanningContextCommand.prototype.setPlanningContextCommandType = function(planningContextCommandType)
{
	this.setPropertyObject(oFF.PlanningContextCommand.PLANNING_CONTEXT_COMMAND_TYPE, planningContextCommandType);
};
oFF.PlanningContextCommand.prototype.onSuccessfulCommand = function()
{
	oFF.PlanningCommand.prototype.onSuccessfulCommand.call( this );
	if (this.isInvalidatingResultSet())
	{
		this.getPlanningContext().invalidate();
	}
};

oFF.PlanningContextCommandResult = function() {};
oFF.PlanningContextCommandResult.prototype = new oFF.PlanningCommandResult();
oFF.PlanningContextCommandResult.prototype._ff_c = "PlanningContextCommandResult";

oFF.PlanningContextCommandResult.prototype.getPlanningContextCommand = function()
{
	return this.getPlanningCommand();
};
oFF.PlanningContextCommandResult.prototype.initResponseStructureCommand = function(responseStructure, messageManager)
{
	var command = this.getPlanningContextCommand();
	if (command.isInvalidatingResultSet())
	{
		command.getPlanningContext().invalidate();
	}
};

oFF.PlanningCommandWithId = function() {};
oFF.PlanningCommandWithId.prototype = new oFF.PlanningCommand();
oFF.PlanningCommandWithId.prototype._ff_c = "PlanningCommandWithId";

oFF.PlanningCommandWithId.PLANNING_CONTEXT = "PLANNING_CONTEXT";
oFF.PlanningCommandWithId.COMMAND_IDENTIFIER = "COMMAND_IDENTIFIER";
oFF.PlanningCommandWithId.SELECTOR = "SELECTOR";
oFF.PlanningCommandWithId.VARIABLES = "VARIABLES";
oFF.PlanningCommandWithId.VARIABLE_PROCESSOR = "VARIABLE_PROCESSOR";
oFF.PlanningCommandWithId.VARIABLE_PROCESSOR_PROVIDER = "VARIABLE_PROCESSOR_PROVIDER";
oFF.PlanningCommandWithId.VARIABLE_HELP_PROVIDER = "VARIABLE_HELP_PROVIDER";
oFF.PlanningCommandWithId.s_variableHelpProviderFactory = null;
oFF.PlanningCommandWithId.prototype.getPlanningContext = function()
{
	return this.getPropertyObject(oFF.PlanningCommandWithId.PLANNING_CONTEXT);
};
oFF.PlanningCommandWithId.prototype.releaseObject = function()
{
	var variableProcessorProvider = this.getVariableProcessorProvider();
	if (oFF.notNull(variableProcessorProvider))
	{
		oFF.XObjectExt.release(variableProcessorProvider);
	}
	oFF.PlanningCommand.prototype.releaseObject.call( this );
};
oFF.PlanningCommandWithId.prototype.setPlanningContext = function(planningContext)
{
	this.setPropertyObject(oFF.PlanningCommandWithId.PLANNING_CONTEXT, planningContext);
};
oFF.PlanningCommandWithId.prototype.getCommandIdentifier = function()
{
	return this.getPropertyObject(oFF.PlanningCommandWithId.COMMAND_IDENTIFIER);
};
oFF.PlanningCommandWithId.prototype.setCommandIdentifier = function(commandIdentifier)
{
	this.setPropertyObject(oFF.PlanningCommandWithId.COMMAND_IDENTIFIER, commandIdentifier);
};
oFF.PlanningCommandWithId.prototype.getSelector = function()
{
	return this.getPropertyObject(oFF.PlanningCommandWithId.SELECTOR);
};
oFF.PlanningCommandWithId.prototype.setSelector = function(selector)
{
	this.setPropertyObject(oFF.PlanningCommandWithId.SELECTOR, selector);
};
oFF.PlanningCommandWithId.prototype.getDimensionAccessor = function()
{
	var selector = this.getSelector();
	if (oFF.isNull(selector))
	{
		return null;
	}
	return selector.getSelectableDimensions();
};
oFF.PlanningCommandWithId.prototype.getListOfVariables = function()
{
	return this.getPropertyObject(oFF.PlanningCommandWithId.VARIABLES);
};
oFF.PlanningCommandWithId.prototype.setListOfVariables = function(variables)
{
	this.setPropertyObject(oFF.PlanningCommandWithId.VARIABLES, variables);
};
oFF.PlanningCommandWithId.prototype.hasVariables = function()
{
	return oFF.XCollectionUtils.hasElements(this.getListOfVariables());
};
oFF.PlanningCommandWithId.prototype.hasInputEnabledVariables = function()
{
	return oFF.QVariableUtils.hasInputEnabledVariables(this.getListOfVariables());
};
oFF.PlanningCommandWithId.prototype.hasInputEnabledAndNonTechnicalVariables = function()
{
	return oFF.XCollectionUtils.hasElements(this.getInputEnabledAndNonTechnicalVariables());
};
oFF.PlanningCommandWithId.prototype.clearExternalVariablesRepresentations = function()
{
	this.queueEventing();
	oFF.QVariableUtils.clearExternalVariablesRepresentations(this.getListOfVariables());
	this.resumeEventing();
};
oFF.PlanningCommandWithId.prototype.hasMandatoryVariables = function()
{
	return oFF.QVariableUtils.hasMandatoryVariables(this.getListOfVariables());
};
oFF.PlanningCommandWithId.prototype.getVariables = function()
{
	var variables = this.getListOfVariables();
	if (oFF.isNull(variables))
	{
		variables = oFF.XListOfNameObject.create();
		this.setListOfVariables(variables);
	}
	return variables;
};
oFF.PlanningCommandWithId.prototype.getInputEnabledVariables = function()
{
	return oFF.QVariableUtils.getInputEnabledVariables(this.getListOfVariables());
};
oFF.PlanningCommandWithId.prototype.getInputEnabledAndNonTechnicalVariables = function()
{
	return oFF.QVariableUtils.getInputEnabledAndNonTechnicalVariables(this.getListOfVariables());
};
oFF.PlanningCommandWithId.prototype.getInputEnabledVariable = function(name)
{
	return oFF.QVariableUtils.getInputEnabledVariable(this.getListOfVariables(), name);
};
oFF.PlanningCommandWithId.prototype.getHierarchyNodeVariable = function(name)
{
	return oFF.QVariableUtils.getVariableByType(this.getListOfVariables(), name, oFF.VariableType.HIERARCHY_NODE_VARIABLE);
};
oFF.PlanningCommandWithId.prototype.getHierarchyNameVariable = function(name)
{
	return oFF.QVariableUtils.getVariableByType(this.getListOfVariables(), name, oFF.VariableType.HIERARCHY_NAME_VARIABLE);
};
oFF.PlanningCommandWithId.prototype.getHierarchyNameVariables = function()
{
	return oFF.QVariableUtils.getHierarchyNameVariables(this.getListOfVariables());
};
oFF.PlanningCommandWithId.prototype.getDimensionMemberVariables = function()
{
	return oFF.QVariableUtils.getDimensionMemberVariables(this.getListOfVariables());
};
oFF.PlanningCommandWithId.prototype.addVariable = function(variable)
{
	var variables = this.getVariables();
	if (!variables.containsKey(variable.getName()))
	{
		variables.add(variable);
	}
};
oFF.PlanningCommandWithId.prototype.clearVariables = function()
{
	var variables = this.getVariables();
	variables.clear();
};
oFF.PlanningCommandWithId.prototype.removeVariable = function(name)
{
	var variables = this.getVariables();
	var variable = variables.getByKey(name);
	variables.removeElement(variable);
};
oFF.PlanningCommandWithId.prototype.getVariableBaseAt = function(index)
{
	var variables = this.getVariables();
	return variables.get(index);
};
oFF.PlanningCommandWithId.prototype.getVariableBaseByName = function(name)
{
	var variables = this.getVariables();
	return variables.getByKey(name);
};
oFF.PlanningCommandWithId.prototype.getModelComponentBase = function()
{
	return null;
};
oFF.PlanningCommandWithId.prototype.getSystemDescription = function()
{
	return this.getPlanningService().getServiceConfig().getSystemDescription();
};
oFF.PlanningCommandWithId.prototype.getSystemName = function()
{
	return this.getSystemDescription().getSystemName();
};
oFF.PlanningCommandWithId.prototype.getSystemType = function()
{
	return this.getSystemDescription().getSystemType();
};
oFF.PlanningCommandWithId.prototype.setVariableProcessorBase = function(processor)
{
	this.setPropertyObject(oFF.PlanningCommandWithId.VARIABLE_PROCESSOR, processor);
};
oFF.PlanningCommandWithId.prototype.getVariableProcessor = function()
{
	return this.getPropertyObject(oFF.PlanningCommandWithId.VARIABLE_PROCESSOR);
};
oFF.PlanningCommandWithId.prototype.getVariableHelpProvider = function()
{
	return this.getPropertyObject(oFF.PlanningCommandWithId.VARIABLE_HELP_PROVIDER);
};
oFF.PlanningCommandWithId.prototype.getVariableProcessorProvider = function()
{
	return this.getPropertyObject(oFF.PlanningCommandWithId.VARIABLE_PROCESSOR_PROVIDER);
};
oFF.PlanningCommandWithId.prototype.setVariableHelpProvider = function(provider)
{
	this.setPropertyObject(oFF.PlanningCommandWithId.VARIABLE_HELP_PROVIDER, provider);
};
oFF.PlanningCommandWithId.prototype.setVariableProcessorProvider = function(provider)
{
	this.setPropertyObject(oFF.PlanningCommandWithId.VARIABLE_PROCESSOR_PROVIDER, provider);
};
oFF.PlanningCommandWithId.prototype.fillVariableRequestorDataRequestContext = oFF.noSupport;
oFF.PlanningCommandWithId.prototype.getFieldByName = function(name)
{
	var dimensions = this.getDimensionAccessor();
	for (var i = 0; i < dimensions.size(); i++)
	{
		var field = dimensions.get(i).getFieldByName(name);
		if (oFF.notNull(field))
		{
			return field;
		}
	}
	return null;
};
oFF.PlanningCommandWithId.prototype.getFieldByNameOrAlias = function(name)
{
	var dimensions = this.getDimensionAccessor();
	for (var i = 0; i < dimensions.size(); i++)
	{
		var field = dimensions.get(i).getFieldByNameOrAlias(name);
		if (oFF.notNull(field))
		{
			return field;
		}
	}
	return null;
};
oFF.PlanningCommandWithId.prototype.getVariableMode = function()
{
	return null;
};
oFF.PlanningCommandWithId.prototype.getCommandForExport = function()
{
	return this.createCommandStructure();
};
oFF.PlanningCommandWithId.prototype.onSuccessfulCommand = function()
{
	oFF.PlanningCommand.prototype.onSuccessfulCommand.call( this );
	if (this.isInvalidatingResultSet())
	{
		this.getPlanningContext().invalidate();
	}
};

oFF.PlanningCommandWithIdResult = function() {};
oFF.PlanningCommandWithIdResult.prototype = new oFF.PlanningCommandResult();
oFF.PlanningCommandWithIdResult.prototype._ff_c = "PlanningCommandWithIdResult";

oFF.PlanningCommandWithIdResult.prototype.getPlanningCommandWithId = function()
{
	return this.getPlanningCommand();
};
oFF.PlanningCommandWithIdResult.prototype.initResponseStructureCommand = function(responseStructure, messageManager)
{
	var command = this.getPlanningCommandWithId();
	if (command.isInvalidatingResultSet())
	{
		command.getPlanningContext().invalidate();
	}
};

oFF.PlanningRequest = function() {};
oFF.PlanningRequest.prototype = new oFF.PlanningCommand();
oFF.PlanningRequest.prototype._ff_c = "PlanningRequest";

oFF.PlanningRequest.PLANNING_CONTEXT = "PLANNING_CONTEXT";
oFF.PlanningRequest.prototype.getPlanningContext = function()
{
	return this.getPropertyObject(oFF.PlanningRequest.PLANNING_CONTEXT);
};
oFF.PlanningRequest.prototype.setPlanningContext = function(planningContext)
{
	this.setPropertyObject(oFF.PlanningRequest.PLANNING_CONTEXT, planningContext);
};

oFF.PlanningResponse = function() {};
oFF.PlanningResponse.prototype = new oFF.PlanningCommandResult();
oFF.PlanningResponse.prototype._ff_c = "PlanningResponse";

oFF.PlanningResponse.prototype.getPlanningRequest = function()
{
	return this.getPlanningCommand();
};

oFF.PlanningOperationIdentifier = function() {};
oFF.PlanningOperationIdentifier.prototype = new oFF.PlanningCommandIdentifier();
oFF.PlanningOperationIdentifier.prototype._ff_c = "PlanningOperationIdentifier";

oFF.PlanningOperationIdentifier.PLANNING_OPERATION_TYPE = "PLANNING_OPERATION_TYPE";
oFF.PlanningOperationIdentifier.prototype.getPlanningOperationName = function()
{
	return this.getCommandId();
};
oFF.PlanningOperationIdentifier.prototype.getPlanningOperationType = function()
{
	return this.getPropertyObject(oFF.PlanningOperationIdentifier.PLANNING_OPERATION_TYPE);
};
oFF.PlanningOperationIdentifier.prototype.setPlanningOperationType = function(planningOperationType)
{
	this.setPropertyObject(oFF.PlanningOperationIdentifier.PLANNING_OPERATION_TYPE, planningOperationType);
};
oFF.PlanningOperationIdentifier.prototype.getDataSource = function()
{
	var planningOperationType = this.getPlanningOperationType();
	if (planningOperationType === oFF.PlanningOperationType.PLANNING_FUNCTION)
	{
		return oFF.QFactory.createDataSourceWithType(oFF.MetaObjectType.PLANNING_FUNCTION, this.getPlanningOperationName());
	}
	else if (planningOperationType === oFF.PlanningOperationType.PLANNING_SEQUENCE)
	{
		return oFF.QFactory.createDataSourceWithType(oFF.MetaObjectType.PLANNING_SEQUENCE, this.getPlanningOperationName());
	}
	else
	{
		return null;
	}
};

oFF.PlanningActionIdentifierBase = function() {};
oFF.PlanningActionIdentifierBase.prototype = new oFF.PlanningCommandIdentifier();
oFF.PlanningActionIdentifierBase.prototype._ff_c = "PlanningActionIdentifierBase";

oFF.PlanningActionIdentifierBase.ACTION_METADATA = "ACTION_METADATA";
oFF.PlanningActionIdentifierBase.prototype.setActionMetadata = function(actionMetadata)
{
	this.setPropertyObject(oFF.PlanningActionIdentifierBase.ACTION_METADATA, actionMetadata);
};
oFF.PlanningActionIdentifierBase.prototype.getActionMetadata = function()
{
	return this.getPropertyObject(oFF.PlanningActionIdentifierBase.ACTION_METADATA);
};
oFF.PlanningActionIdentifierBase.prototype.getActionId = function()
{
	return this.getActionMetadata().getActionId();
};
oFF.PlanningActionIdentifierBase.prototype.getActionName = function()
{
	return this.getActionMetadata().getActionName();
};
oFF.PlanningActionIdentifierBase.prototype.getActionDescription = function()
{
	return this.getActionMetadata().getActionDescription();
};
oFF.PlanningActionIdentifierBase.prototype.getActionType = function()
{
	return this.getActionMetadata().getActionType();
};
oFF.PlanningActionIdentifierBase.prototype.isDefault = function()
{
	return this.getActionMetadata().isDefault();
};
oFF.PlanningActionIdentifierBase.prototype.getActionParameterMetadata = function()
{
	return this.getActionMetadata().getActionParameterMetadata();
};
oFF.PlanningActionIdentifierBase.prototype.setActionParameterMetadata = function(actionParameterMetadata)
{
	this.getActionMetadata().setActionParameterMetadata(actionParameterMetadata);
};
oFF.PlanningActionIdentifierBase.prototype.setActionParameterNames = function(parameterNames)
{
	this.getActionMetadata().setActionParameterNames(parameterNames);
};
oFF.PlanningActionIdentifierBase.prototype.getActionParameterNames = function()
{
	return this.getActionMetadata().getActionParameterNames();
};

oFF.DataAreaCommand = function() {};
oFF.DataAreaCommand.prototype = new oFF.PlanningContextCommand();
oFF.DataAreaCommand.prototype._ff_c = "DataAreaCommand";

oFF.DataAreaCommand.prototype.getOlapComponentType = function()
{
	return oFF.OlapComponentType.DATA_AREA_COMMAND;
};
oFF.DataAreaCommand.prototype.getDataArea = function()
{
	return this.getPlanningContext();
};
oFF.DataAreaCommand.prototype.createCommandResultInstanceInternal = function()
{
	return new oFF.DataAreaCommandResult();
};

oFF.DataAreaCommandResult = function() {};
oFF.DataAreaCommandResult.prototype = new oFF.PlanningContextCommandResult();
oFF.DataAreaCommandResult.prototype._ff_c = "DataAreaCommandResult";

oFF.DataAreaCommandResult.EXECUTED = "EXECUTED";
oFF.DataAreaCommandResult.prototype.getDataAreaCommand = function()
{
	return this.getPlanningCommand();
};
oFF.DataAreaCommandResult.prototype.isExecuted = function()
{
	return this.getPropertyBoolean(oFF.DataAreaCommandResult.EXECUTED);
};
oFF.DataAreaCommandResult.prototype.setExecuted = function(executed)
{
	this.setPropertyBoolean(oFF.DataAreaCommandResult.EXECUTED, executed);
};

oFF.PlanningFunctionIdentifier = function() {};
oFF.PlanningFunctionIdentifier.prototype = new oFF.PlanningOperationIdentifier();
oFF.PlanningFunctionIdentifier.prototype._ff_c = "PlanningFunctionIdentifier";

oFF.PlanningFunctionIdentifier.prototype.getPlanningFunctionName = function()
{
	return this.getPlanningOperationName();
};

oFF.PlanningOperation = function() {};
oFF.PlanningOperation.prototype = new oFF.PlanningCommandWithId();
oFF.PlanningOperation.prototype._ff_c = "PlanningOperation";

oFF.PlanningOperation.PLANNING_OPERATION_METADATA = "PLANNING_OPERATION_METADATA";
oFF.PlanningOperation.DIMENSIONS = "DIMENSIONS";
oFF.PlanningOperation.prototype.getDataArea = function()
{
	return this.getPlanningContext();
};
oFF.PlanningOperation.prototype.getPlanningOperationIdentifier = function()
{
	return this.getCommandIdentifier();
};
oFF.PlanningOperation.prototype.getPlanningOperationMetadata = function()
{
	return this.getPropertyObject(oFF.PlanningOperation.PLANNING_OPERATION_METADATA);
};
oFF.PlanningOperation.prototype.setPlanningOperationMetadata = function(planningOperationMetadata)
{
	this.setPropertyObject(oFF.PlanningOperation.PLANNING_OPERATION_METADATA, planningOperationMetadata);
};
oFF.PlanningOperation.prototype.initializePlanningOperation = function()
{
	var metadata = this.getPlanningOperationMetadata();
	this.initializeSelector(metadata.getDimensions());
	this.initializeVariables(metadata.getVariables());
};
oFF.PlanningOperation.prototype.m_planningCommandModelComponent = null;
oFF.PlanningOperation.prototype.getPlanningCommandModelComponent = function()
{
	if (oFF.isNull(this.m_planningCommandModelComponent))
	{
		this.m_planningCommandModelComponent = oFF.PlanningCommandModelComponent.create(this.getContext(), this);
	}
	return this.m_planningCommandModelComponent;
};
oFF.PlanningOperation.prototype.initializeSelector = function(dimensions)
{
	if (oFF.isNull(dimensions))
	{
		return;
	}
	var dimensionList = oFF.QDimensionList.createDimensionList(this, null, null);
	this.setPropertyObject(oFF.PlanningOperation.DIMENSIONS, dimensionList);
	var capabilities = this.getOlapEnv().getSystemContainer(this.getSystemName()).getServiceCapabilitiesExt(oFF.ProviderType.PLANNING_VALUE_HELP);
	var importMetadata = oFF.QInAImportFactory.createForMetadata(this.getApplication(), capabilities);
	for (var i = 0; i < dimensions.size(); i++)
	{
		var dimensionStructure = oFF.PrUtils.getStructureElement(dimensions, i);
		var dimension = importMetadata.importDimension(dimensionStructure, this);
		dimensionList.add(dimension);
	}
	var modelComponent = this.getPlanningCommandModelComponent();
	var selector = oFF.QFilter.createWithModelComponent(this, modelComponent);
	this.setSelector(selector);
};
oFF.PlanningOperation.prototype.initializeVariables = function(inaVariableList)
{
	this.clearVariables();
	this.setVariableProcessorProvider(null);
	this.setVariableHelpProvider(null);
	if (!oFF.PrUtils.isListEmpty(inaVariableList))
	{
		var vhProvider = oFF.PlanningCommandWithId.s_variableHelpProviderFactory.createVariableHelpProvider(this);
		var provider = oFF.PlanningCommandWithId.s_variableHelpProviderFactory.createProcessorProvider(this.getDataSource(), this, this);
		provider.importVariables(inaVariableList, this);
		this.setVariableHelpProvider(vhProvider);
		this.setVariableProcessorProvider(provider);
	}
};
oFF.PlanningOperation.prototype.createCommandStructure = function()
{
	var request = oFF.PrFactory.createStructure();
	this.fillRequest(request, false);
	return request;
};
oFF.PlanningOperation.prototype.fillRequest = function(request, withVariables)
{
	var dataAreaState = oFF.DataAreaState.getDataAreaState(this.getDataArea());
	if (!dataAreaState.isSubmitted())
	{
		var dataAreaStructure = dataAreaState.serializeToJson();
		if (oFF.notNull(dataAreaStructure))
		{
			request.putNewList("DataAreas").add(dataAreaStructure);
		}
	}
	var dataArea = this.getDataArea();
	var planning = request.putNewStructure("Planning");
	this.getPlanningService().getInaCapabilities().exportActiveCapabilities(planning);
	var command = planning.putNewStructure("Command");
	var dataSource = command.putNewStructure("DataSource");
	var dataAreaName = dataArea.getDataArea();
	if (oFF.isNull(dataAreaName))
	{
		dataAreaName = "DEFAULT";
	}
	dataSource.putString("DataArea", dataAreaName);
	var metadata = this.getPlanningOperationMetadata();
	var identifier = metadata.getPlanningOperationIdentifier();
	dataSource.putString("ObjectName", identifier.getPlanningOperationName());
	dataSource.putString("Type", this.getPlanningType());
	dataSource.putString("InstanceId", metadata.getInstanceId());
	var selection = this.getSelectionJson();
	if (oFF.notNull(selection))
	{
		command.put("Filter", selection);
	}
	if (withVariables)
	{
		var provider = this.getVariableProcessorProvider();
		provider.exportVariables(this, command);
	}
};
oFF.PlanningOperation.prototype.getDataSource = function()
{
	var planningOperationIdentifier = this.getPlanningOperationMetadata().getPlanningOperationIdentifier();
	var dataSource = oFF.QFactory.createDataSource();
	dataSource.setObjectName(planningOperationIdentifier.getPlanningOperationName());
	dataSource.setSystemName(this.getPlanningService().getConnection().getSystemDescription().getSystemName());
	if (planningOperationIdentifier.getPlanningOperationType() === oFF.PlanningOperationType.PLANNING_SEQUENCE)
	{
		dataSource.setType(oFF.MetaObjectType.PLANNING_SEQUENCE);
	}
	else if (planningOperationIdentifier.getPlanningOperationType() === oFF.PlanningOperationType.PLANNING_FUNCTION)
	{
		dataSource.setType(oFF.MetaObjectType.PLANNING_FUNCTION);
	}
	return dataSource;
};
oFF.PlanningOperation.prototype.getPlanningType = oFF.noSupport;
oFF.PlanningOperation.prototype.getSelectionJson = function()
{
	return null;
};
oFF.PlanningOperation.prototype.fillVariableRequestorDataRequestContext = function(structure, withVariables, processingDirective)
{
	this.fillRequest(structure, withVariables);
	var inaContext = structure.getStructureByKey("Planning");
	if (oFF.notNull(processingDirective))
	{
		var inaProcessingDirective = inaContext.putNewStructure("ProcessingDirectives");
		inaProcessingDirective.putString("ProcessingStep", processingDirective);
	}
	return inaContext.getStructureByKey("Command");
};
oFF.PlanningOperation.prototype.getVariable = function(name)
{
	return this.getVariableBaseByName(name);
};
oFF.PlanningOperation.prototype.getDimensionAccessor = function()
{
	return this.getPropertyObject(oFF.PlanningOperation.DIMENSIONS);
};
oFF.PlanningOperation.prototype.getContext = function()
{
	return this;
};
oFF.PlanningOperation.prototype.getVariableContainerBase = function()
{
	return this;
};
oFF.PlanningOperation.prototype.getVariableContainer = function()
{
	return this;
};
oFF.PlanningOperation.prototype.getFieldAccessorSingle = function()
{
	return this;
};
oFF.PlanningOperation.prototype.setWinControlInAutoSubmitByType = function(variableType, isWinControlInAutoSubmit, isLimitToExitVariable)
{
	return;
};

oFF.PlanningOperationResult = function() {};
oFF.PlanningOperationResult.prototype = new oFF.PlanningCommandWithIdResult();
oFF.PlanningOperationResult.prototype._ff_c = "PlanningOperationResult";

oFF.PlanningOperationResult.prototype.getPlanningOperation = function()
{
	return this.getPlanningCommand();
};

oFF.PlanningSequenceIdentifier = function() {};
oFF.PlanningSequenceIdentifier.prototype = new oFF.PlanningOperationIdentifier();
oFF.PlanningSequenceIdentifier.prototype._ff_c = "PlanningSequenceIdentifier";

oFF.PlanningSequenceIdentifier.prototype.getPlanningSequenceName = function()
{
	return this.getPlanningOperationName();
};

oFF.DataAreaRequest = function() {};
oFF.DataAreaRequest.prototype = new oFF.PlanningRequest();
oFF.DataAreaRequest.prototype._ff_c = "DataAreaRequest";

oFF.DataAreaRequest.REQUEST_TYPE = "REQUEST_TYPE";
oFF.DataAreaRequest.prototype.getDataArea = function()
{
	return this.getPlanningContext();
};
oFF.DataAreaRequest.prototype.getRequestType = function()
{
	return this.getPropertyObject(oFF.DataAreaRequest.REQUEST_TYPE);
};
oFF.DataAreaRequest.prototype.setRequestType = function(requestType)
{
	this.setPropertyObject(oFF.DataAreaRequest.REQUEST_TYPE, requestType);
};

oFF.DataAreaResponse = function() {};
oFF.DataAreaResponse.prototype = new oFF.PlanningResponse();
oFF.DataAreaResponse.prototype._ff_c = "DataAreaResponse";

oFF.DataAreaResponse.prototype.getDataAreaRequest = function()
{
	return this.getPlanningRequest();
};
oFF.DataAreaResponse.prototype.processResponseStructureCommand = function(responseStructure, messageManager, hasErrors)
{
	if (hasErrors)
	{
		return;
	}
	if (!this.processResponseStructureInternal(responseStructure, messageManager))
	{
		messageManager.addErrorExt(oFF.OriginLayer.DRIVER, oFF.ErrorCodes.PARSER_ERROR, "error in processing response structure", responseStructure);
	}
};
oFF.DataAreaResponse.prototype.processResponseStructureInternal = oFF.noSupport;

oFF.PlanningModelCommand = function() {};
oFF.PlanningModelCommand.prototype = new oFF.PlanningContextCommand();
oFF.PlanningModelCommand.prototype._ff_c = "PlanningModelCommand";

oFF.PlanningModelCommand.prototype.getOlapComponentType = function()
{
	return oFF.OlapComponentType.PLANNING_MODEL_COMMAND;
};
oFF.PlanningModelCommand.prototype.getPlanningModel = function()
{
	return this.getPlanningContext();
};
oFF.PlanningModelCommand.prototype.createCommandResultInstanceInternal = function()
{
	return new oFF.PlanningModelCommandResult();
};

oFF.PlanningModelCommandResult = function() {};
oFF.PlanningModelCommandResult.prototype = new oFF.PlanningContextCommandResult();
oFF.PlanningModelCommandResult.prototype._ff_c = "PlanningModelCommandResult";

oFF.PlanningModelCommandResult.RETURN_CODE = "RETURN_CODE";
oFF.PlanningModelCommandResult.prototype.getPlanningModelCommand = function()
{
	return this.getPlanningCommand();
};
oFF.PlanningModelCommandResult.prototype.getReturnCode = function()
{
	return this.getPropertyInteger(oFF.PlanningModelCommandResult.RETURN_CODE);
};
oFF.PlanningModelCommandResult.prototype.setReturnCode = function(returnCode)
{
	this.setPropertyInteger(oFF.PlanningModelCommandResult.RETURN_CODE, returnCode);
};

oFF.PlanningAction = function() {};
oFF.PlanningAction.prototype = new oFF.PlanningCommandWithId();
oFF.PlanningAction.prototype._ff_c = "PlanningAction";

oFF.PlanningAction.PARAMETER_METADATA = "PARAMETER_METADATA";
oFF.PlanningAction.ACTION_PARAMETERS = "ACTION_PARAMETERS";
oFF.PlanningAction.ACTION_GROUP = "ACTION_GROUP";
oFF.PlanningAction.TARGET_VERSION_ID = "TARGET_VERSION_ID";
oFF.PlanningAction.SEQUENCE_ID = "SEQUENCE_ID";
oFF.PlanningAction.DESCRIPTION = "DESCRIPTION";
oFF.PlanningAction.TARGET_CELL_ROW = "TARGET_CELL_ROW";
oFF.PlanningAction.TARGET_CELL_COLUMN = "TARGET_CELL_COLUMN";
oFF.PlanningAction.TARGET_CELL_RS = "TARGET_CELL_RS";
oFF.PlanningAction.prototype.getOlapComponentType = function()
{
	return oFF.OlapComponentType.PLANNING_ACTION;
};
oFF.PlanningAction.prototype.getPlanningModel = function()
{
	return this.getPlanningContext();
};
oFF.PlanningAction.prototype.getActionIdentifier = function()
{
	return this.getCommandIdentifier();
};
oFF.PlanningAction.prototype.getActionForQueryIdentifier = function()
{
	return this.getCommandIdentifier();
};
oFF.PlanningAction.prototype.getActionParameterMetadata = function()
{
	return this.getPropertyObject(oFF.PlanningAction.PARAMETER_METADATA);
};
oFF.PlanningAction.prototype.setActionParameterMetadata = function(parameterMetadata)
{
	this.setPropertyObject(oFF.PlanningAction.PARAMETER_METADATA, parameterMetadata);
	if (oFF.notNull(parameterMetadata) && !oFF.PrUtils.isListEmpty(parameterMetadata.getParameters()))
	{
		this.initializeVariables(parameterMetadata.getParameters());
	}
};
oFF.PlanningAction.prototype.initializeVariables = function(variables)
{
	var inaVariablesList = oFF.PrFactory.createList();
	for (var i = 0; i < variables.size(); i++)
	{
		var inaParameter = oFF.PrUtils.getStructureElement(variables, i);
		if (oFF.isNull(inaParameter))
		{
			continue;
		}
		var parameterOptionOccurence = inaParameter.getStringByKeyExt("optionOccurrence", null);
		if (oFF.notNull(parameterOptionOccurence))
		{
			var inaVariable = inaVariablesList.addNewStructure();
			inaVariable.putString("Name", inaParameter.getStringByKey("name"));
			inaVariable.putString("Description", inaParameter.getStringByKey("description"));
			inaVariable.putString("VariableType", "OptionListVariable");
			inaVariable.putString("Type", "String");
			inaVariable.putString("InputType", "Optional");
			inaVariable.putNewList("DependentOfVariable");
			if (oFF.XString.isEqual(parameterOptionOccurence, "exactly-one"))
			{
				inaVariable.putBoolean("MultipleValues", false);
			}
			else
			{
				inaVariable.putBoolean("MultipleValues", true);
			}
			inaVariable.putBoolean("InputEnabled", true);
			var parameterOptions = inaParameter.getListByKey("options");
			var inaOptionList = inaVariable.putNewList("Options");
			if (!oFF.PrUtils.isListEmpty(parameterOptions))
			{
				for (var j = 0; j < parameterOptions.size(); j++)
				{
					var parameterOption = parameterOptions.getStructureAt(j);
					var optionNameId = parameterOption.getIntegerByKeyExt("id", -1);
					if (optionNameId !== -1)
					{
						var optionDescription = parameterOption.getStringByKey("description");
						var inaVariableOption = inaOptionList.addNewStructure();
						inaVariableOption.putString("Name", oFF.XInteger.convertToString(optionNameId));
						inaVariableOption.putString("Description", optionDescription);
					}
				}
				var parameterDefaultOptions = inaParameter.getListByKey("defaultOptions");
				var inaVariableOptionValue = inaVariable.putNewList("OptionValues");
				if (oFF.notNull(parameterDefaultOptions))
				{
					for (var k = 0; k < parameterDefaultOptions.size(); k++)
					{
						var parameterOptionValue = parameterDefaultOptions.getIntegerAt(k);
						inaVariableOptionValue.addString(oFF.XInteger.convertToString(parameterOptionValue));
					}
				}
			}
		}
		else
		{
			inaVariablesList.add(inaParameter.clone());
		}
	}
	this.clearVariables();
	this.setVariableProcessorProvider(null);
	this.setVariableHelpProvider(null);
	if (!oFF.PrUtils.isListEmpty(inaVariablesList))
	{
		var vhProvider = oFF.PlanningCommandWithId.s_variableHelpProviderFactory.createVariableHelpProvider(this);
		var provider = oFF.PlanningCommandWithId.s_variableHelpProviderFactory.createProcessorProvider(this.getDataSource(), this, this);
		provider.setIsVariableSubmitNeeded(false);
		provider.importVariables(inaVariablesList, this);
		this.setVariableHelpProvider(vhProvider);
		this.setVariableProcessorProvider(provider);
	}
};
oFF.PlanningAction.prototype.setActionParameters = function(actionParameters)
{
	this.setPropertyObject(oFF.PlanningAction.ACTION_PARAMETERS, actionParameters);
	this.tryPublicVersionEdit(actionParameters);
};
oFF.PlanningAction.prototype.setActionGroup = function(actionGroup)
{
	this.setPropertyString(oFF.PlanningAction.ACTION_GROUP, actionGroup);
};
oFF.PlanningAction.prototype.tryPublicVersionEdit = function(actionParameters)
{
	if (this.getSystemType() !== oFF.SystemType.HANA)
	{
		return;
	}
	var planningModel = this.getPlanningModel();
	if (oFF.isNull(planningModel) || !planningModel.supportsPublicVersionEdit())
	{
		return;
	}
	var actionMetadata = planningModel.getActionMetadata(this.getActionIdentifier().getActionId());
	if (oFF.isNull(actionMetadata))
	{
		return;
	}
	var actionType = actionMetadata.getActionType();
	if (oFF.isNull(actionType))
	{
		return;
	}
	if (!actionType.isTypeOf(oFF.PlanningActionType.VERSION_ACTION))
	{
		return;
	}
	var actionId = this.getActionIdentifier().getActionId();
	if (!oFF.XString.isEqual(actionId, "populate_single_version"))
	{
		return;
	}
	var version = this.getVersion();
	if (oFF.isNull(version) || !version.isShowingAsPublicVersion())
	{
		return;
	}
	if (oFF.XStringUtils.isNullOrEmpty(version.getSourceVersionName()))
	{
		return;
	}
	if (oFF.isNull(actionParameters))
	{
		return;
	}
	var paramStructure = actionParameters.getStructureByKey("epmPopulate.fromVersion");
	if (oFF.isNull(paramStructure))
	{
		return;
	}
	var fromVersion = paramStructure.getStringByKey("value");
	if (oFF.XStringUtils.isNullOrEmpty(fromVersion))
	{
		return;
	}
	planningModel.setPublicVersionEditInProgress(true);
	var publicVersionEdit = oFF.XString.endsWith(fromVersion, version.getSourceVersionName());
	this.setInvalidatingResultSet(!publicVersionEdit);
};
oFF.PlanningAction.prototype.getActionParameters = function()
{
	return this.getPropertyObject(oFF.PlanningAction.ACTION_PARAMETERS);
};
oFF.PlanningAction.prototype.getActionGroup = function()
{
	return this.getPropertyString(oFF.PlanningAction.ACTION_GROUP);
};
oFF.PlanningAction.prototype.getVersion = function()
{
	var planningModel = this.getPlanningModel();
	return planningModel.getVersionByIdInternal(this.getActionIdentifier());
};
oFF.PlanningAction.prototype.createCommandResultInstanceInternal = function()
{
	return new oFF.PlanningActionResult();
};
oFF.PlanningAction.prototype.getVariableContainerBase = function()
{
	return this;
};
oFF.PlanningAction.prototype.getVariableContainer = function()
{
	return this;
};
oFF.PlanningAction.prototype.getVariable = function(name)
{
	return this.getVariableBaseByName(name);
};
oFF.PlanningAction.prototype.setTargetVersionId = function(targetVersionId)
{
	this.setPropertyString(oFF.PlanningAction.TARGET_VERSION_ID, targetVersionId);
	return this;
};
oFF.PlanningAction.prototype.getTargetVersionId = function()
{
	return this.getPropertyString(oFF.PlanningAction.TARGET_VERSION_ID);
};
oFF.PlanningAction.prototype.setSequenceId = function(sequenceId)
{
	this.setPropertyString(oFF.PlanningAction.SEQUENCE_ID, sequenceId);
	return this;
};
oFF.PlanningAction.prototype.getSequenceId = function()
{
	return this.getPropertyString(oFF.PlanningAction.SEQUENCE_ID);
};
oFF.PlanningAction.prototype.getSequenceIdEffective = function()
{
	var sequenceId = this.getPropertyString(oFF.PlanningAction.SEQUENCE_ID);
	if (oFF.XStringUtils.isNullOrEmpty(sequenceId))
	{
		sequenceId = this.getVersion().getActionSequenceId();
	}
	return sequenceId;
};
oFF.PlanningAction.prototype.setDescription = function(description)
{
	this.setPropertyString(oFF.PlanningAction.DESCRIPTION, description);
	return this;
};
oFF.PlanningAction.prototype.getDescription = function()
{
	return this.getPropertyString(oFF.PlanningAction.DESCRIPTION);
};
oFF.PlanningAction.prototype.setTargetCell = function(targetCell)
{
	if (oFF.isNull(targetCell))
	{
		this.getProperties().remove(oFF.PlanningAction.TARGET_CELL_ROW);
		this.getProperties().remove(oFF.PlanningAction.TARGET_CELL_RS);
	}
	else
	{
		this.setPropertyInteger(oFF.PlanningAction.TARGET_CELL_COLUMN, targetCell.getColumn());
		this.setPropertyInteger(oFF.PlanningAction.TARGET_CELL_ROW, targetCell.getRow());
	}
	return this;
};
oFF.PlanningAction.prototype.setTargetColumn = function(column)
{
	this.setPropertyInteger(oFF.PlanningAction.TARGET_CELL_COLUMN, column);
	return this;
};
oFF.PlanningAction.prototype.setTargetRow = function(row)
{
	this.setPropertyInteger(oFF.PlanningAction.TARGET_CELL_ROW, row);
	return this;
};
oFF.PlanningAction.prototype.hasTargetCell = function()
{
	return this.getProperties().getByKey(oFF.PlanningAction.TARGET_CELL_COLUMN) !== null && this.getProperties().getByKey(oFF.PlanningAction.TARGET_CELL_ROW) !== null;
};
oFF.PlanningAction.prototype.getTargetRow = function()
{
	return this.getPropertyInteger(oFF.PlanningAction.TARGET_CELL_ROW);
};
oFF.PlanningAction.prototype.getTargetColumn = function()
{
	return this.getPropertyInteger(oFF.PlanningAction.TARGET_CELL_COLUMN);
};
oFF.PlanningAction.prototype.setWinControlInAutoSubmitByType = function(variableType, isWinControlInAutoSubmit, isLimitToExitVariable)
{
	return;
};

oFF.PlanningActionForQueryIdentifier = function() {};
oFF.PlanningActionForQueryIdentifier.prototype = new oFF.PlanningActionIdentifierBase();
oFF.PlanningActionForQueryIdentifier.prototype._ff_c = "PlanningActionForQueryIdentifier";

oFF.PlanningActionForQueryIdentifier.prototype.cloneOlapComponent = function(context, parent)
{
	var copy = new oFF.PlanningActionForQueryIdentifier();
	copy.setProperties(this.getPropertiesCopy());
	return copy;
};
oFF.PlanningActionForQueryIdentifier.prototype.toString = function()
{
	var sb = oFF.XStringBuffer.create();
	sb.appendLine("Planning action for query identifier");
	sb.append(this.getActionMetadata().toString());
	return sb.toString();
};

oFF.PlanningActionIdentifier = function() {};
oFF.PlanningActionIdentifier.prototype = new oFF.PlanningActionIdentifierBase();
oFF.PlanningActionIdentifier.prototype._ff_c = "PlanningActionIdentifier";

oFF.PlanningActionIdentifier.VERSION_IDENTIFIER = "VERSION_IDENDTIFIER";
oFF.PlanningActionIdentifier.prototype.cloneOlapComponent = function(context, parent)
{
	var copy = new oFF.PlanningActionIdentifier();
	copy.setProperties(this.getPropertiesCopy());
	return copy;
};
oFF.PlanningActionIdentifier.prototype.getVersionIdentifier = function()
{
	return this.getPropertyObject(oFF.PlanningActionIdentifier.VERSION_IDENTIFIER);
};
oFF.PlanningActionIdentifier.prototype.setVersionIdentifier = function(versionIdentifier)
{
	this.setPropertyObject(oFF.PlanningActionIdentifier.VERSION_IDENTIFIER, versionIdentifier);
};
oFF.PlanningActionIdentifier.prototype.getVersionId = function()
{
	return this.getVersionIdentifier().getVersionId();
};
oFF.PlanningActionIdentifier.prototype.isSharedVersion = function()
{
	return this.getVersionIdentifier().isSharedVersion();
};
oFF.PlanningActionIdentifier.prototype.getVersionOwner = function()
{
	return this.getVersionIdentifier().getVersionOwner();
};
oFF.PlanningActionIdentifier.prototype.getVersionUniqueName = function()
{
	return this.getVersionIdentifier().getVersionUniqueName();
};
oFF.PlanningActionIdentifier.prototype.toString = function()
{
	var sb = oFF.XStringBuffer.create();
	sb.append("Planning action identifier for version \"");
	sb.append(this.getVersionIdentifier().getVersionUniqueName());
	sb.appendLine("\"");
	sb.append(this.getActionMetadata().toString());
	return sb.toString();
};

oFF.PlanningActionResult = function() {};
oFF.PlanningActionResult.prototype = new oFF.PlanningCommandWithIdResult();
oFF.PlanningActionResult.prototype._ff_c = "PlanningActionResult";

oFF.PlanningActionResult.RETURN_CODE = "RETURN_CODE";
oFF.PlanningActionResult.prototype.getPlanningAction = function()
{
	return this.getPlanningCommand();
};
oFF.PlanningActionResult.prototype.getReturnCode = function()
{
	return this.getPropertyInteger(oFF.PlanningActionResult.RETURN_CODE);
};
oFF.PlanningActionResult.prototype.setReturnCode = function(returnCode)
{
	this.setPropertyInteger(oFF.PlanningActionResult.RETURN_CODE, returnCode);
};
oFF.PlanningActionResult.prototype.checkErrorState = function()
{
	var returnCode = this.getReturnCode();
	if (returnCode === 3042)
	{
		var planningModel = this.getPlanningAction().getPlanningModel();
		planningModel.resetPlanningModel();
	}
};

oFF.PlanningModelRequest = function() {};
oFF.PlanningModelRequest.prototype = new oFF.PlanningRequest();
oFF.PlanningModelRequest.prototype._ff_c = "PlanningModelRequest";

oFF.PlanningModelRequest.REQUEST_TYPE = "REQUEST_TYPE";
oFF.PlanningModelRequest.prototype.getPlanningModel = function()
{
	return this.getPlanningContext();
};
oFF.PlanningModelRequest.prototype.getRequestType = function()
{
	return this.getPropertyObject(oFF.PlanningModelRequest.REQUEST_TYPE);
};
oFF.PlanningModelRequest.prototype.setRequestType = function(requestType)
{
	this.setPropertyObject(oFF.PlanningModelRequest.REQUEST_TYPE, requestType);
};
oFF.PlanningModelRequest.prototype.createCommandResultInstanceInternal = function()
{
	return new oFF.PlanningModelResponse();
};

oFF.PlanningModelResponse = function() {};
oFF.PlanningModelResponse.prototype = new oFF.PlanningResponse();
oFF.PlanningModelResponse.prototype._ff_c = "PlanningModelResponse";

oFF.PlanningModelResponse.RETURN_CODE = "RETURN_CODE";
oFF.PlanningModelResponse.prototype.getPlanningModelRequest = function()
{
	return this.getPlanningCommand();
};
oFF.PlanningModelResponse.prototype.getReturnCode = function()
{
	return this.getPropertyInteger(oFF.PlanningModelResponse.RETURN_CODE);
};
oFF.PlanningModelResponse.prototype.setReturnCode = function(returnCode)
{
	this.setPropertyInteger(oFF.PlanningModelResponse.RETURN_CODE, returnCode);
};
oFF.PlanningModelResponse.prototype.processResponseStructureCommand = function(responseStructure, messageManager, hasErrors)
{
	var returnCode = oFF.PlanningModelCommandHelper.getResponsesReturnCodeStrict(responseStructure, messageManager);
	this.setReturnCode(returnCode);
	if (returnCode !== 0)
	{
		return;
	}
	if (hasErrors)
	{
		return;
	}
	if (!this.processResponseStructureInternal(responseStructure, messageManager))
	{
		messageManager.addErrorExt(oFF.OriginLayer.DRIVER, oFF.ErrorCodes.PARSER_ERROR, "error in processing response structure", responseStructure);
	}
};
oFF.PlanningModelResponse.prototype.processResponseStructureInternal = oFF.noSupport;

oFF.DataAreaCommandClose = function() {};
oFF.DataAreaCommandClose.prototype = new oFF.DataAreaCommand();
oFF.DataAreaCommandClose.prototype._ff_c = "DataAreaCommandClose";

oFF.DataAreaCommandClose.prototype.getOlapComponentType = function()
{
	return oFF.OlapComponentType.DATA_AREA_COMMAND_CLOSE;
};

oFF.PlanningFunction = function() {};
oFF.PlanningFunction.prototype = new oFF.PlanningOperation();
oFF.PlanningFunction.prototype._ff_c = "PlanningFunction";

oFF.PlanningFunction.prototype.createCommandResultInstanceInternal = function()
{
	return new oFF.PlanningFunctionResult();
};
oFF.PlanningFunction.prototype.getPlanningFunctionIdentifier = function()
{
	return this.getPlanningOperationIdentifier();
};
oFF.PlanningFunction.prototype.getPlanningFunctionMetadata = function()
{
	return this.getPlanningOperationMetadata();
};
oFF.PlanningFunction.prototype.getPlanningType = function()
{
	return "PlanningFunction";
};
oFF.PlanningFunction.prototype.getSelectionJson = function()
{
	var selector = this.getSelector();
	if (oFF.notNull(selector))
	{
		var selectionContainer = selector.getDynamicFilter();
		if (oFF.notNull(selectionContainer))
		{
			return selectionContainer.serializeToElement(oFF.QModelFormat.INA_DATA);
		}
	}
	return null;
};

oFF.PlanningFunctionResult = function() {};
oFF.PlanningFunctionResult.prototype = new oFF.PlanningOperationResult();
oFF.PlanningFunctionResult.prototype._ff_c = "PlanningFunctionResult";

oFF.PlanningFunctionResult.prototype.getPlanningFunction = function()
{
	return this.getPlanningOperation();
};

oFF.PlanningSequence = function() {};
oFF.PlanningSequence.prototype = new oFF.PlanningOperation();
oFF.PlanningSequence.prototype._ff_c = "PlanningSequence";

oFF.PlanningSequence.QUERY_MANAGER = "QUERY_MANAGER";
oFF.PlanningSequence.prototype.createCommandResultInstanceInternal = function()
{
	return new oFF.PlanningSequenceResult();
};
oFF.PlanningSequence.prototype.getPlanningSequenceIdentifier = function()
{
	return this.getCommandIdentifier();
};
oFF.PlanningSequence.prototype.getPlanningSequenceMetadata = function()
{
	return this.getPlanningOperationMetadata();
};
oFF.PlanningSequence.prototype.getPlanningType = function()
{
	return "PlanningSequence";
};
oFF.PlanningSequence.prototype.submitVariables = function(syncType, listener, customIdentifier)
{
	return this.getVariableProcessor().submitVariables(syncType, listener, customIdentifier);
};
oFF.PlanningSequence.prototype.getQueryManagerForDimension = function(sourceDimension)
{
	var systemName = this.getDataSource().getSystemName();
	var dimensionQueryManager = this.getPropertyObject(oFF.XStringUtils.concatenate2(oFF.PlanningSequence.QUERY_MANAGER, sourceDimension.getName()));
	var targetDimension;
	if (oFF.isNull(dimensionQueryManager))
	{
		var dimensionDataSource = oFF.QFactory.createDataSourceWithType(oFF.MetaObjectType.DIMENSION, sourceDimension.getName());
		var queryServiceConfig = oFF.QueryServiceConfig.createWithDataSource(sourceDimension.getApplication(), systemName, dimensionDataSource);
		var result = queryServiceConfig.processQueryManagerCreation(oFF.SyncType.BLOCKING, null, null);
		oFF.MessageUtil.checkNoError(result);
		dimensionQueryManager = result.getData();
		targetDimension = dimensionQueryManager.getQueryModel().getDimensionByName(sourceDimension.getName());
		targetDimension.getFieldContainer().copyFrom(sourceDimension.getFieldContainer(), null);
		this.setPropertyObject(oFF.XStringUtils.concatenate2(oFF.PlanningSequence.QUERY_MANAGER, sourceDimension.getName()), dimensionQueryManager);
	}
	else
	{
		targetDimension = dimensionQueryManager.getQueryModel().getDimensionByName(sourceDimension.getName());
	}
	var selectorFields = sourceDimension.getSelectorFields();
	var targetSelectorFields = targetDimension.getSelectorFields();
	for (var i = 0; i < selectorFields.size(); i++)
	{
		targetSelectorFields.add(targetDimension.getFieldByName(selectorFields.get(i).getName()));
	}
	var displayKeyField = targetDimension.getFieldByPresentationType(oFF.PresentationType.DISPLAY_KEY);
	if (oFF.notNull(displayKeyField))
	{
		targetDimension.getSelectorFields().add(displayKeyField);
	}
	var descriptionField = targetDimension.getFieldByPresentationType(oFF.PresentationType.TEXT);
	if (oFF.notNull(descriptionField))
	{
		targetDimension.getSelectorFields().add(descriptionField);
	}
	var originQFilterExpression = this.getSelector().getValuehelpFilter();
	var targetQFilterExpression = dimensionQueryManager.getQueryModel().getFilter().getValuehelpFilter();
	targetQFilterExpression.copyFrom(originQFilterExpression, null);
	var selectorHierarchyNode = sourceDimension.getSelectorHierarchyNode();
	if (oFF.notNull(selectorHierarchyNode))
	{
		targetDimension.setSelectorHierarchyNode(selectorHierarchyNode);
	}
	return dimensionQueryManager;
};

oFF.PlanningSequenceResult = function() {};
oFF.PlanningSequenceResult.prototype = new oFF.PlanningOperationResult();
oFF.PlanningSequenceResult.prototype._ff_c = "PlanningSequenceResult";

oFF.PlanningSequenceResult.prototype.getPlanningSequence = function()
{
	return this.getPlanningCommand();
};

oFF.DataAreaRequestCreatePlanningOperation = function() {};
oFF.DataAreaRequestCreatePlanningOperation.prototype = new oFF.DataAreaRequest();
oFF.DataAreaRequestCreatePlanningOperation.prototype._ff_c = "DataAreaRequestCreatePlanningOperation";

oFF.DataAreaRequestCreatePlanningOperation.COMMAND_IDENTIFIER = "COMMAND_IDENTIFIER";
oFF.DataAreaRequestCreatePlanningOperation.prototype.getCommandIdentifier = function()
{
	return this.getPropertyObject(oFF.DataAreaRequestCreatePlanningOperation.COMMAND_IDENTIFIER);
};
oFF.DataAreaRequestCreatePlanningOperation.prototype.setCommandIdentifier = function(commandIdentifier)
{
	this.setPropertyObject(oFF.DataAreaRequestCreatePlanningOperation.COMMAND_IDENTIFIER, commandIdentifier);
};
oFF.DataAreaRequestCreatePlanningOperation.prototype.getPlanningOperationIdentifier = function()
{
	return this.getCommandIdentifier();
};
oFF.DataAreaRequestCreatePlanningOperation.prototype.doProcessCommand = function(synchronizationType, planningCommandResult)
{
	var commandFactory = oFF.XCommandFactory.create(this.getApplication());
	var cmdCreatePlanningOperation = commandFactory.createCommand(oFF.XCmdCreatePlanningOperation.CMD_NAME);
	cmdCreatePlanningOperation.addParameter(oFF.XCmdCreatePlanningOperation.PARAM_I_DATA_AREA, this.getDataArea());
	cmdCreatePlanningOperation.addParameter(oFF.XCmdCreatePlanningOperation.PARAM_I_PLANNING_OPERATION_IDENTIFIER, this.getPlanningOperationIdentifier());
	cmdCreatePlanningOperation.processCommand(synchronizationType, oFF.XCommandCallback.create(this), planningCommandResult);
};
oFF.DataAreaRequestCreatePlanningOperation.prototype.onXCommandCallbackProcessed = function(extResult, commandResult, customIdentifier)
{
	var extPlanningCommandResult = oFF.ExtResult.create(customIdentifier, extResult);
	if (extResult.isValid())
	{
		var response = customIdentifier;
		response.setCreatedPlanningOperation(commandResult.getResultParameter(oFF.XCmdCreatePlanningOperation.PARAM_E_PLANNING_OPERATION));
	}
	this.onCommandExecuted(extPlanningCommandResult);
};

oFF.DataAreaRequestGetPlanningOperationMetadata = function() {};
oFF.DataAreaRequestGetPlanningOperationMetadata.prototype = new oFF.DataAreaRequest();
oFF.DataAreaRequestGetPlanningOperationMetadata.prototype._ff_c = "DataAreaRequestGetPlanningOperationMetadata";

oFF.DataAreaRequestGetPlanningOperationMetadata.PLANNING_OPERATION_IDENTIFIER = "PLANNING_OPERATION_IDENTIFIER";
oFF.DataAreaRequestGetPlanningOperationMetadata.INSTANCE_ID = "INSTANCE_ID";
oFF.DataAreaRequestGetPlanningOperationMetadata.prototype.getPlanningOperationIdentifier = function()
{
	return this.getPropertyObject(oFF.DataAreaRequestGetPlanningOperationMetadata.PLANNING_OPERATION_IDENTIFIER);
};
oFF.DataAreaRequestGetPlanningOperationMetadata.prototype.setPlanningOperationIdentifier = function(planningOperationIdentifier)
{
	this.setPropertyObject(oFF.DataAreaRequestGetPlanningOperationMetadata.PLANNING_OPERATION_IDENTIFIER, planningOperationIdentifier);
};
oFF.DataAreaRequestGetPlanningOperationMetadata.prototype.getInstanceId = function()
{
	var instanceId = this.getPropertyString(oFF.DataAreaRequestGetPlanningOperationMetadata.INSTANCE_ID);
	if (oFF.isNull(instanceId))
	{
		instanceId = this.getPlanningService().getApplication().createNextInstanceId();
		this.setPropertyString(oFF.DataAreaRequestGetPlanningOperationMetadata.INSTANCE_ID, instanceId);
	}
	return instanceId;
};

oFF.DataAreaResponseCreatePlanningOperation = function() {};
oFF.DataAreaResponseCreatePlanningOperation.prototype = new oFF.DataAreaResponse();
oFF.DataAreaResponseCreatePlanningOperation.prototype._ff_c = "DataAreaResponseCreatePlanningOperation";

oFF.DataAreaResponseCreatePlanningOperation.CREATED_PLANNING_OPERATION = "CREATED_PLANNING_OPERATION";
oFF.DataAreaResponseCreatePlanningOperation.prototype.getPlanningRequestCreateCommandWithId = function()
{
	return this.getPlanningCommand();
};
oFF.DataAreaResponseCreatePlanningOperation.prototype.getCreatedPlanningCommandWithId = function()
{
	return this.getCreatedPlanningOperation();
};
oFF.DataAreaResponseCreatePlanningOperation.prototype.setCreatedPlanningOperation = function(planningOperation)
{
	this.setPropertyObject(oFF.DataAreaResponseCreatePlanningOperation.CREATED_PLANNING_OPERATION, planningOperation);
};
oFF.DataAreaResponseCreatePlanningOperation.prototype.getDataAreaRequestCreatePlanningOperation = function()
{
	return this.getPlanningRequestCreateCommandWithId();
};
oFF.DataAreaResponseCreatePlanningOperation.prototype.getCreatedPlanningOperation = function()
{
	return this.getPropertyObject(oFF.DataAreaResponseCreatePlanningOperation.CREATED_PLANNING_OPERATION);
};

oFF.DataAreaResponseGetPlanningOperationMetadata = function() {};
oFF.DataAreaResponseGetPlanningOperationMetadata.prototype = new oFF.DataAreaResponse();
oFF.DataAreaResponseGetPlanningOperationMetadata.prototype._ff_c = "DataAreaResponseGetPlanningOperationMetadata";

oFF.DataAreaResponseGetPlanningOperationMetadata.PLANNING_OPERATION_METADATA = "PLANNING_OPERATION_METADATA";
oFF.DataAreaResponseGetPlanningOperationMetadata.prototype.getDataAreaRequestGetPlanningOperationMetadata = function()
{
	return this.getPlanningRequest();
};
oFF.DataAreaResponseGetPlanningOperationMetadata.prototype.getPlanningOperationMetadata = function()
{
	return this.getPropertyObject(oFF.DataAreaResponseGetPlanningOperationMetadata.PLANNING_OPERATION_METADATA);
};
oFF.DataAreaResponseGetPlanningOperationMetadata.prototype.setPlanningOperationMetadata = function(planningOperationMetadata)
{
	this.setPropertyObject(oFF.DataAreaResponseGetPlanningOperationMetadata.PLANNING_OPERATION_METADATA, planningOperationMetadata);
};

oFF.PlanningModelCloseCommand = function() {};
oFF.PlanningModelCloseCommand.prototype = new oFF.PlanningModelCommand();
oFF.PlanningModelCloseCommand.prototype._ff_c = "PlanningModelCloseCommand";

oFF.PlanningModelCloseCommand.CLOSE_MODE = "CLOSE_MODE";
oFF.PlanningModelCloseCommand.prototype.setCloseMode = function(closeMode)
{
	this.setPropertyObject(oFF.PlanningModelCloseCommand.CLOSE_MODE, closeMode);
	return this;
};
oFF.PlanningModelCloseCommand.prototype.getCloseMode = function()
{
	return this.getPropertyObject(oFF.PlanningModelCloseCommand.CLOSE_MODE);
};

oFF.PlanningModelRequestCleanup = function() {};
oFF.PlanningModelRequestCleanup.prototype = new oFF.PlanningModelRequest();
oFF.PlanningModelRequestCleanup.prototype._ff_c = "PlanningModelRequestCleanup";

oFF.PlanningModelRequestCleanup.prototype.getOlapComponentType = function()
{
	return oFF.OlapComponentType.PLANNING_MODEL_CLEANUP_COMMAND;
};
oFF.PlanningModelRequestCleanup.prototype.createCommandResultInstanceInternal = function()
{
	return new oFF.PlanningModelResponseCleanup();
};

oFF.PlanningModelRequestCreateAction = function() {};
oFF.PlanningModelRequestCreateAction.prototype = new oFF.PlanningModelRequest();
oFF.PlanningModelRequestCreateAction.prototype._ff_c = "PlanningModelRequestCreateAction";

oFF.PlanningModelRequestCreateAction.COMMAND_IDENTIFIER = "COMMAND_IDENTIFIER";
oFF.PlanningModelRequestCreateAction.ACTION_PARAMETERS = "ACTION_PARAMETERS";
oFF.PlanningModelRequestCreateAction.prototype.getCommandIdentifier = function()
{
	return this.getPropertyObject(oFF.PlanningModelRequestCreateAction.COMMAND_IDENTIFIER);
};
oFF.PlanningModelRequestCreateAction.prototype.setCommandIdentifier = function(commandIdentifier)
{
	this.setPropertyObject(oFF.PlanningModelRequestCreateAction.COMMAND_IDENTIFIER, commandIdentifier);
};
oFF.PlanningModelRequestCreateAction.prototype.getActionParameters = function()
{
	return this.getPropertyObject(oFF.PlanningModelRequestCreateAction.ACTION_PARAMETERS);
};
oFF.PlanningModelRequestCreateAction.prototype.setActionParameters = function(actionParameters)
{
	this.setPropertyObject(oFF.PlanningModelRequestCreateAction.ACTION_PARAMETERS, actionParameters);
};
oFF.PlanningModelRequestCreateAction.prototype.doProcessCommand = function(synchronizationType, planningCommandResult)
{
	var extResultActionParameters = this.getActionParameters();
	var extResult;
	var messages = oFF.MessageManager.createMessageManagerExt(this.getSession());
	if (oFF.isNull(extResultActionParameters))
	{
		messages.addError(0, "illegal state - not action parameters");
		extResult = oFF.ExtResult.create(planningCommandResult, messages);
	}
	else
	{
		var action = new oFF.PlanningAction();
		action.setCommandType(oFF.PlanningCommandType.PLANNING_ACTION);
		action.setPlanningService(this.getPlanningService());
		action.setPlanningContext(this.getPlanningModel());
		action.setCommandIdentifier(this.getActionIdentifier());
		action.setActionParameterMetadata(extResultActionParameters);
		planningCommandResult.setCreatedPlanningAction(action);
		extResult = oFF.ExtResult.create(planningCommandResult, messages);
	}
	this.onCommandExecuted(oFF.ExtResult.create(extResult.getData(), extResult));
};
oFF.PlanningModelRequestCreateAction.prototype.createCommandResultInstanceInternal = function()
{
	return new oFF.PlanningModelResponseCreateAction();
};
oFF.PlanningModelRequestCreateAction.prototype.getActionIdentifier = function()
{
	return this.getCommandIdentifier();
};

oFF.PlanningModelRequestRefreshActions = function() {};
oFF.PlanningModelRequestRefreshActions.prototype = new oFF.PlanningModelRequest();
oFF.PlanningModelRequestRefreshActions.prototype._ff_c = "PlanningModelRequestRefreshActions";

oFF.PlanningModelRequestRefreshActions.prototype.getOlapComponentType = function()
{
	return oFF.OlapComponentType.PLANNING_MODEL_REFRESH_ACTIONS_COMMAND;
};
oFF.PlanningModelRequestRefreshActions.prototype.createCommandResultInstanceInternal = function()
{
	return new oFF.PlanningModelResponseRefreshActions();
};

oFF.PlanningModelRequestRefreshVersions = function() {};
oFF.PlanningModelRequestRefreshVersions.prototype = new oFF.PlanningModelRequest();
oFF.PlanningModelRequestRefreshVersions.prototype._ff_c = "PlanningModelRequestRefreshVersions";

oFF.PlanningModelRequestRefreshVersions.prototype.getOlapComponentType = function()
{
	return oFF.OlapComponentType.PLANNING_MODEL_REFRESH_VERSIONS_COMMAND;
};
oFF.PlanningModelRequestRefreshVersions.prototype.createCommandResultInstanceInternal = function()
{
	return new oFF.PlanningModelResponseRefreshVersions();
};

oFF.PlanningModelRequestUpdateVersionPrivileges = function() {};
oFF.PlanningModelRequestUpdateVersionPrivileges.prototype = new oFF.PlanningModelRequest();
oFF.PlanningModelRequestUpdateVersionPrivileges.prototype._ff_c = "PlanningModelRequestUpdateVersionPrivileges";

oFF.PlanningModelRequestUpdateVersionPrivileges.prototype.getOlapComponentType = function()
{
	return oFF.OlapComponentType.PLANNING_MODEL_UPDATE_VERSION_PRIVILEGES_COMMAND;
};
oFF.PlanningModelRequestUpdateVersionPrivileges.prototype.doProcessCommand = function(synchronizationType, planningCommandResult)
{
	if (this.isServerRoundtripRequired())
	{
		oFF.PlanningModelRequest.prototype.doProcessCommand.call( this , synchronizationType, planningCommandResult);
	}
	else
	{
		var messageManager = oFF.MessageManager.createMessageManagerExt(this.getSession());
		var extPlanningCommandResult = oFF.ExtResult.create(planningCommandResult, messageManager);
		this.onCommandExecuted(extPlanningCommandResult);
	}
};
oFF.PlanningModelRequestUpdateVersionPrivileges.prototype.isServerRoundtripRequired = function()
{
	var planningModel = this.getPlanningModel();
	if (!planningModel.hasChangedVersionPrivileges())
	{
		return false;
	}
	var versions = planningModel.getVersions();
	return !versions.isEmpty();
};
oFF.PlanningModelRequestUpdateVersionPrivileges.prototype.createCommandResultInstanceInternal = function()
{
	return new oFF.PlanningModelResponseUpdateVersionPrivileges();
};

oFF.PlanningModelRequestVersion = function() {};
oFF.PlanningModelRequestVersion.prototype = new oFF.PlanningModelRequest();
oFF.PlanningModelRequestVersion.prototype._ff_c = "PlanningModelRequestVersion";

oFF.PlanningModelRequestVersion.PLANNING_VERSION = "PLANNING_VERSION";
oFF.PlanningModelRequestVersion.prototype.getOlapComponentType = function()
{
	return oFF.OlapComponentType.PLANNING_VERSION_COMMAND;
};
oFF.PlanningModelRequestVersion.prototype.getPlanningVersion = function()
{
	return this.getPropertyObject(oFF.PlanningModelRequestVersion.PLANNING_VERSION);
};
oFF.PlanningModelRequestVersion.prototype.setPlanningVersion = function(planningVersion)
{
	this.setPropertyObject(oFF.PlanningModelRequestVersion.PLANNING_VERSION, planningVersion);
};
oFF.PlanningModelRequestVersion.prototype.supportsTryOption = function()
{
	return false;
};
oFF.PlanningModelRequestVersion.prototype.setTryOption = function(useTryOption)
{
	return this;
};
oFF.PlanningModelRequestVersion.prototype.useTryOption = function()
{
	return false;
};
oFF.PlanningModelRequestVersion.prototype.useStateUpdate = function()
{
	var requestType = this.getRequestType();
	if (oFF.isNull(requestType))
	{
		return false;
	}
	return requestType.isTypeOf(oFF.PlanningModelRequestType.VERSION_REQUEST_WITH_STATE_UPDATE);
};
oFF.PlanningModelRequestVersion.prototype.createCommandStructure = oFF.noSupport;
oFF.PlanningModelRequestVersion.prototype.createCommandResultInstanceInternal = function()
{
	return new oFF.PlanningModelResponseVersion();
};
oFF.PlanningModelRequestVersion.prototype.onCommandExecuted = function(extPlanningCommandResult)
{
	var result = extPlanningCommandResult.getData();
	if (result.getReturnCode() === 3042)
	{
		this.getPlanningModel().resetPlanningModel();
	}
	this.resetCommand();
	oFF.PlanningModelRequest.prototype.onCommandExecuted.call( this , extPlanningCommandResult);
};

oFF.PlanningModelResponseCleanup = function() {};
oFF.PlanningModelResponseCleanup.prototype = new oFF.PlanningModelResponse();
oFF.PlanningModelResponseCleanup.prototype._ff_c = "PlanningModelResponseCleanup";

oFF.PlanningModelResponseCleanup.prototype.getPlanningModelRequestCleanup = function()
{
	return this.getPlanningCommand();
};

oFF.PlanningModelResponseCreateAction = function() {};
oFF.PlanningModelResponseCreateAction.prototype = new oFF.PlanningModelResponse();
oFF.PlanningModelResponseCreateAction.prototype._ff_c = "PlanningModelResponseCreateAction";

oFF.PlanningModelResponseCreateAction.CREATED_PLANNING_ACTION = "CREATED_PLANNING_ACTION";
oFF.PlanningModelResponseCreateAction.prototype.getPlanningRequestCreateCommandWithId = function()
{
	return this.getPlanningCommand();
};
oFF.PlanningModelResponseCreateAction.prototype.getCreatedPlanningCommandWithId = function()
{
	return this.getCreatedPlanningAction();
};
oFF.PlanningModelResponseCreateAction.prototype.setCreatedPlanningAction = function(planningAction)
{
	this.setPropertyObject(oFF.PlanningModelResponseCreateAction.CREATED_PLANNING_ACTION, planningAction);
};
oFF.PlanningModelResponseCreateAction.prototype.getCreatedPlanningAction = function()
{
	return this.getPropertyObject(oFF.PlanningModelResponseCreateAction.CREATED_PLANNING_ACTION);
};
oFF.PlanningModelResponseCreateAction.prototype.getPlanningModelRequestCreateAction = function()
{
	return this.getPlanningCommand();
};

oFF.PlanningModelResponseRefreshActions = function() {};
oFF.PlanningModelResponseRefreshActions.prototype = new oFF.PlanningModelResponse();
oFF.PlanningModelResponseRefreshActions.prototype._ff_c = "PlanningModelResponseRefreshActions";

oFF.PlanningModelResponseRefreshActions.prototype.getPlanningModelRequestRefreshVersions = function()
{
	return this.getPlanningCommand();
};

oFF.PlanningModelResponseRefreshVersions = function() {};
oFF.PlanningModelResponseRefreshVersions.prototype = new oFF.PlanningModelResponse();
oFF.PlanningModelResponseRefreshVersions.prototype._ff_c = "PlanningModelResponseRefreshVersions";

oFF.PlanningModelResponseRefreshVersions.prototype.getPlanningModelRequestRefreshVersions = function()
{
	return this.getPlanningCommand();
};

oFF.PlanningModelResponseUpdateVersionPrivileges = function() {};
oFF.PlanningModelResponseUpdateVersionPrivileges.prototype = new oFF.PlanningModelResponse();
oFF.PlanningModelResponseUpdateVersionPrivileges.prototype._ff_c = "PlanningModelResponseUpdateVersionPrivileges";

oFF.PlanningModelResponseUpdateVersionPrivileges.getVersionDataSource = function(querySourceStructure)
{
	var dataSource = oFF.QFactory.createDataSourceWithType(oFF.MetaObjectType.PLANNING, oFF.PrUtils.getStringValueProperty(querySourceStructure, "query_source", null));
	dataSource.setSchemaName(oFF.PrUtils.getStringValueProperty(querySourceStructure, "query_source_schema", null));
	return dataSource;
};
oFF.PlanningModelResponseUpdateVersionPrivileges.updateVersionPrivileges = function(planningModel, dataSource, planningVersionIdentifier, versionPrivilegeList)
{
	var len = oFF.PrUtils.getListSize(versionPrivilegeList, 0);
	for (var i = 0; i < len; i++)
	{
		var versionPrivilegeStructure = oFF.PrUtils.getStructureElement(versionPrivilegeList, i);
		var planningPrivilege = oFF.PlanningPrivilege.lookupWithDefault(oFF.PrUtils.getStringValueProperty(versionPrivilegeStructure, "privilege", null), null);
		var grantee = oFF.PrUtils.getStringValueProperty(versionPrivilegeStructure, "grantee", null);
		var versionPrivilege = planningModel.getVersionPrivilegeById(dataSource, planningVersionIdentifier, planningPrivilege, grantee);
		versionPrivilege.setPrivilegeStateServer(oFF.PlanningPrivilegeState.GRANTED);
	}
};
oFF.PlanningModelResponseUpdateVersionPrivileges.resetVersionPrivilegesServerState = function(planningModel)
{
	var versionPrivileges = planningModel.getVersionPrivileges();
	for (var i = 0; i < versionPrivileges.size(); i++)
	{
		var versionPrivilege = versionPrivileges.get(i);
		versionPrivilege.setPrivilegeStateServer(oFF.PlanningPrivilegeState.NEW);
	}
};
oFF.PlanningModelResponseUpdateVersionPrivileges.resetVersionPrivilegesClientState = function(planningModel)
{
	var versionPrivileges = planningModel.getVersionPrivileges();
	for (var i = 0; i < versionPrivileges.size(); i++)
	{
		var versionPrivilege = versionPrivileges.get(i);
		var serverState = versionPrivilege.getPrivilegeStateServer();
		var clientState;
		if (serverState === oFF.PlanningPrivilegeState.GRANTED)
		{
			clientState = oFF.PlanningPrivilegeState.GRANTED;
		}
		else if (serverState === oFF.PlanningPrivilegeState.NEW)
		{
			clientState = oFF.PlanningPrivilegeState.NEW;
		}
		else
		{
			throw oFF.XException.createIllegalStateException("illegal state");
		}
		versionPrivilege.setPrivilegeState(clientState);
	}
};
oFF.PlanningModelResponseUpdateVersionPrivileges.prototype.getPlanningModelRequestUpdateVersionPrivileges = function()
{
	return this.getPlanningCommand();
};

oFF.PlanningModelResponseVersion = function() {};
oFF.PlanningModelResponseVersion.prototype = new oFF.PlanningModelResponse();
oFF.PlanningModelResponseVersion.prototype._ff_c = "PlanningModelResponseVersion";

oFF.PlanningModelResponseVersion.prototype.getPlanningModelRequestVersion = function()
{
	return this.getPlanningCommand();
};

oFF.DataAreaRequestCreatePlanningFunction = function() {};
oFF.DataAreaRequestCreatePlanningFunction.prototype = new oFF.DataAreaRequestCreatePlanningOperation();
oFF.DataAreaRequestCreatePlanningFunction.prototype._ff_c = "DataAreaRequestCreatePlanningFunction";

oFF.DataAreaRequestCreatePlanningFunction.create = function(planningService)
{
	var newObj = new oFF.DataAreaRequestCreatePlanningFunction();
	var olapApplication = planningService.getApplication().getOlapEnvironment();
	var context = olapApplication.getContext();
	newObj.setupModelComponent(context, null);
	newObj.setPlanningService(planningService);
	return newObj;
};
oFF.DataAreaRequestCreatePlanningFunction.prototype.getPlanningFunctionIdentifier = function()
{
	return this.getPlanningOperationIdentifier();
};
oFF.DataAreaRequestCreatePlanningFunction.prototype.createCommandResultInstanceInternal = function()
{
	return new oFF.DataAreaResponseCreatePlanningFunction();
};

oFF.DataAreaRequestCreatePlanningSequence = function() {};
oFF.DataAreaRequestCreatePlanningSequence.prototype = new oFF.DataAreaRequestCreatePlanningOperation();
oFF.DataAreaRequestCreatePlanningSequence.prototype._ff_c = "DataAreaRequestCreatePlanningSequence";

oFF.DataAreaRequestCreatePlanningSequence.create = function(planningService)
{
	var newObj = new oFF.DataAreaRequestCreatePlanningSequence();
	var olapApplication = planningService.getApplication().getOlapEnvironment();
	var context = olapApplication.getContext();
	newObj.setupModelComponent(context, null);
	newObj.setPlanningService(planningService);
	return newObj;
};
oFF.DataAreaRequestCreatePlanningSequence.prototype.getPlanningSequenceIdentifier = function()
{
	return this.getPlanningOperationIdentifier();
};
oFF.DataAreaRequestCreatePlanningSequence.prototype.createCommandResultInstanceInternal = function()
{
	return new oFF.DataAreaResponseCreatePlanningSequence();
};

oFF.DataAreaRequestGetPlanningFunctionMetadata = function() {};
oFF.DataAreaRequestGetPlanningFunctionMetadata.prototype = new oFF.DataAreaRequestGetPlanningOperationMetadata();
oFF.DataAreaRequestGetPlanningFunctionMetadata.prototype._ff_c = "DataAreaRequestGetPlanningFunctionMetadata";

oFF.DataAreaRequestGetPlanningFunctionMetadata.prototype.getOlapComponentType = function()
{
	return oFF.OlapComponentType.DATA_AREA_GET_FUNCTION_METADATA;
};
oFF.DataAreaRequestGetPlanningFunctionMetadata.prototype.getPlanningFunctionIdentifier = function()
{
	return this.getPlanningOperationIdentifier();
};
oFF.DataAreaRequestGetPlanningFunctionMetadata.prototype.createCommandResultInstanceInternal = function()
{
	return new oFF.DataAreaResponseGetPlanningFunctionMetadata();
};

oFF.DataAreaRequestGetPlanningSequenceMetadata = function() {};
oFF.DataAreaRequestGetPlanningSequenceMetadata.prototype = new oFF.DataAreaRequestGetPlanningOperationMetadata();
oFF.DataAreaRequestGetPlanningSequenceMetadata.prototype._ff_c = "DataAreaRequestGetPlanningSequenceMetadata";

oFF.DataAreaRequestGetPlanningSequenceMetadata.prototype.getOlapComponentType = function()
{
	return oFF.OlapComponentType.DATA_AREA_GET_SEQUENCE_METADATA;
};
oFF.DataAreaRequestGetPlanningSequenceMetadata.prototype.getPlanningSequenceIdentifier = function()
{
	return this.getPlanningOperationIdentifier();
};
oFF.DataAreaRequestGetPlanningSequenceMetadata.prototype.createCommandResultInstanceInternal = function()
{
	return new oFF.DataAreaResponseGetPlanningSequenceMetadata();
};

oFF.DataAreaResponseCreatePlanningFunction = function() {};
oFF.DataAreaResponseCreatePlanningFunction.prototype = new oFF.DataAreaResponseCreatePlanningOperation();
oFF.DataAreaResponseCreatePlanningFunction.prototype._ff_c = "DataAreaResponseCreatePlanningFunction";

oFF.DataAreaResponseCreatePlanningFunction.prototype.getDataAreaRequestCreatePlanningFunction = function()
{
	return this.getDataAreaRequestCreatePlanningOperation();
};
oFF.DataAreaResponseCreatePlanningFunction.prototype.getCreatedPlanningFunction = function()
{
	return this.getCreatedPlanningOperation();
};

oFF.DataAreaResponseCreatePlanningSequence = function() {};
oFF.DataAreaResponseCreatePlanningSequence.prototype = new oFF.DataAreaResponseCreatePlanningOperation();
oFF.DataAreaResponseCreatePlanningSequence.prototype._ff_c = "DataAreaResponseCreatePlanningSequence";

oFF.DataAreaResponseCreatePlanningSequence.prototype.getDataAreaRequestCreatePlanningSequence = function()
{
	return this.getDataAreaRequestCreatePlanningOperation();
};
oFF.DataAreaResponseCreatePlanningSequence.prototype.getCreatedPlanningSequence = function()
{
	return this.getCreatedPlanningOperation();
};

oFF.DataAreaResponseGetPlanningFunctionMetadata = function() {};
oFF.DataAreaResponseGetPlanningFunctionMetadata.prototype = new oFF.DataAreaResponseGetPlanningOperationMetadata();
oFF.DataAreaResponseGetPlanningFunctionMetadata.prototype._ff_c = "DataAreaResponseGetPlanningFunctionMetadata";

oFF.DataAreaResponseGetPlanningFunctionMetadata.prototype.getDataAreaRequestGetPlanningFunctionMetadata = function()
{
	return this.getDataAreaRequestGetPlanningOperationMetadata();
};
oFF.DataAreaResponseGetPlanningFunctionMetadata.prototype.getPlanningFunctionMetadata = function()
{
	return this.getPlanningOperationMetadata();
};

oFF.DataAreaResponseGetPlanningSequenceMetadata = function() {};
oFF.DataAreaResponseGetPlanningSequenceMetadata.prototype = new oFF.DataAreaResponseGetPlanningOperationMetadata();
oFF.DataAreaResponseGetPlanningSequenceMetadata.prototype._ff_c = "DataAreaResponseGetPlanningSequenceMetadata";

oFF.DataAreaResponseGetPlanningSequenceMetadata.prototype.getDataAreaRequestGetPlanningSequenceMetadata = function()
{
	return this.getDataAreaRequestGetPlanningOperationMetadata();
};
oFF.DataAreaResponseGetPlanningSequenceMetadata.prototype.getPlanningSequenceMetadata = function()
{
	return this.getPlanningOperationMetadata();
};

oFF.PlanningModelRequestVersionClose = function() {};
oFF.PlanningModelRequestVersionClose.prototype = new oFF.PlanningModelRequestVersion();
oFF.PlanningModelRequestVersionClose.prototype._ff_c = "PlanningModelRequestVersionClose";

oFF.PlanningModelRequestVersionClose.CLOSE_MODE = "CLOSE_MODE";
oFF.PlanningModelRequestVersionClose.prototype.getOlapComponentType = function()
{
	return oFF.OlapComponentType.PLANNING_VERSION_CLOSE_COMMAND;
};
oFF.PlanningModelRequestVersionClose.prototype.setCloseMode = function(closeMode)
{
	this.setPropertyObject(oFF.PlanningModelRequestVersionClose.CLOSE_MODE, closeMode);
	return this;
};
oFF.PlanningModelRequestVersionClose.prototype.getCloseMode = function()
{
	return this.getPropertyObject(oFF.PlanningModelRequestVersionClose.CLOSE_MODE);
};

oFF.PlanningModelRequestVersionEndActionSequence = function() {};
oFF.PlanningModelRequestVersionEndActionSequence.prototype = new oFF.PlanningModelRequestVersion();
oFF.PlanningModelRequestVersionEndActionSequence.prototype._ff_c = "PlanningModelRequestVersionEndActionSequence";

oFF.PlanningModelRequestVersionEndActionSequence.SEQUENCE_ID = "SEQUENCE_ID";
oFF.PlanningModelRequestVersionEndActionSequence.DESCRIPTION = "DESCRIPTION";
oFF.PlanningModelRequestVersionEndActionSequence.prototype.getOlapComponentType = function()
{
	return oFF.OlapComponentType.PLANNING_VERSION_END_ACTION_SEQUENCE_COMMAND;
};
oFF.PlanningModelRequestVersionEndActionSequence.prototype.setSequenceId = function(sequenceId)
{
	this.setPropertyString(oFF.PlanningModelRequestVersionEndActionSequence.SEQUENCE_ID, sequenceId);
	return this;
};
oFF.PlanningModelRequestVersionEndActionSequence.prototype.getSequenceId = function()
{
	return this.getPropertyString(oFF.PlanningModelRequestVersionEndActionSequence.SEQUENCE_ID);
};
oFF.PlanningModelRequestVersionEndActionSequence.prototype.setDescription = function(description)
{
	this.setPropertyString(oFF.PlanningModelRequestVersionEndActionSequence.DESCRIPTION, description);
	return this;
};
oFF.PlanningModelRequestVersionEndActionSequence.prototype.getDescription = function()
{
	return this.getPropertyString(oFF.PlanningModelRequestVersionEndActionSequence.DESCRIPTION);
};

oFF.PlanningModelRequestVersionSetParameters = function() {};
oFF.PlanningModelRequestVersionSetParameters.prototype = new oFF.PlanningModelRequestVersion();
oFF.PlanningModelRequestVersionSetParameters.prototype._ff_c = "PlanningModelRequestVersionSetParameters";

oFF.PlanningModelRequestVersionSetParameters.VERSION_PARAMETERS_STRUCTURE = "VERSION_PARAMETERS_STRUCTURE";
oFF.PlanningModelRequestVersionSetParameters.prototype.getOlapComponentType = function()
{
	return oFF.OlapComponentType.PLANNING_VERSION_SET_PARAMETERS_COMMAND;
};
oFF.PlanningModelRequestVersionSetParameters.prototype.setVersionParametersAsJson = function(parametersJson)
{
	this.setPropertyObject(oFF.PlanningModelRequestVersionSetParameters.VERSION_PARAMETERS_STRUCTURE, parametersJson);
	if (oFF.notNull(parametersJson))
	{
		var version = this.getPlanningVersion();
		var showAsPublicVersion = parametersJson.getIntegerByKeyExt("showAsPublicVersion", -1);
		version.setShowingAsPublicVersion(showAsPublicVersion === 1);
		var sourceVersionName = parametersJson.getStringByKeyExt("source version", null);
		if (!oFF.XStringUtils.isNullOrEmpty(sourceVersionName))
		{
			sourceVersionName = oFF.XStringUtils.concatenate3("public", ".", sourceVersionName);
		}
		version.setSourceVersionName(sourceVersionName);
	}
	return this;
};
oFF.PlanningModelRequestVersionSetParameters.prototype.getVersionParametersStructure = function()
{
	return this.getPropertyObject(oFF.PlanningModelRequestVersionSetParameters.VERSION_PARAMETERS_STRUCTURE);
};

oFF.PlanningModelRequestVersionSetTimeout = function() {};
oFF.PlanningModelRequestVersionSetTimeout.prototype = new oFF.PlanningModelRequestVersion();
oFF.PlanningModelRequestVersionSetTimeout.prototype._ff_c = "PlanningModelRequestVersionSetTimeout";

oFF.PlanningModelRequestVersionSetTimeout.TIMEOUT = "TIMEOUT";
oFF.PlanningModelRequestVersionSetTimeout.prototype.getOlapComponentType = function()
{
	return oFF.OlapComponentType.PLANNING_VERSION_SET_TIMEOUT_COMMAND;
};
oFF.PlanningModelRequestVersionSetTimeout.prototype.setTimeout = function(seconds)
{
	this.setPropertyInteger(oFF.PlanningModelRequestVersionSetTimeout.TIMEOUT, seconds);
	return this;
};
oFF.PlanningModelRequestVersionSetTimeout.prototype.getTimeout = function()
{
	return this.getPropertyInteger(oFF.PlanningModelRequestVersionSetTimeout.TIMEOUT);
};

oFF.PlanningModelRequestVersionStartActionSequence = function() {};
oFF.PlanningModelRequestVersionStartActionSequence.prototype = new oFF.PlanningModelRequestVersion();
oFF.PlanningModelRequestVersionStartActionSequence.prototype._ff_c = "PlanningModelRequestVersionStartActionSequence";

oFF.PlanningModelRequestVersionStartActionSequence.SEQUENCE_ID = "SEQUENCE_ID";
oFF.PlanningModelRequestVersionStartActionSequence.DESCRIPTION = "DESCRIPTION";
oFF.PlanningModelRequestVersionStartActionSequence.prototype.getOlapComponentType = function()
{
	return oFF.OlapComponentType.PLANNING_VERSION_START_ACTION_SEQUENCE_COMMAND;
};
oFF.PlanningModelRequestVersionStartActionSequence.prototype.setSequenceId = function(sequenceId)
{
	this.setPropertyString(oFF.PlanningModelRequestVersionStartActionSequence.SEQUENCE_ID, sequenceId);
	return this;
};
oFF.PlanningModelRequestVersionStartActionSequence.prototype.getSequenceId = function()
{
	return this.getPropertyString(oFF.PlanningModelRequestVersionStartActionSequence.SEQUENCE_ID);
};
oFF.PlanningModelRequestVersionStartActionSequence.prototype.setDescription = function(description)
{
	this.setPropertyString(oFF.PlanningModelRequestVersionStartActionSequence.DESCRIPTION, description);
	return this;
};
oFF.PlanningModelRequestVersionStartActionSequence.prototype.getDescription = function()
{
	return this.getPropertyString(oFF.PlanningModelRequestVersionStartActionSequence.DESCRIPTION);
};
oFF.PlanningModelRequestVersionStartActionSequence.prototype.createCommandResultInstanceInternal = function()
{
	return new oFF.PlanningModelResponseVersionStartActionSequence();
};

oFF.PlanningModelRequestVersionStateDescriptions = function() {};
oFF.PlanningModelRequestVersionStateDescriptions.prototype = new oFF.PlanningModelRequestVersion();
oFF.PlanningModelRequestVersionStateDescriptions.prototype._ff_c = "PlanningModelRequestVersionStateDescriptions";

oFF.PlanningModelRequestVersionStateDescriptions.START_INDEX = "START_INDEX";
oFF.PlanningModelRequestVersionStateDescriptions.COUNT = "COUNT";
oFF.PlanningModelRequestVersionStateDescriptions.prototype.getOlapComponentType = function()
{
	return oFF.OlapComponentType.PLANNING_VERSION_STATE_DESCRIPTIONS_COMMAND;
};
oFF.PlanningModelRequestVersionStateDescriptions.prototype.setStartIndex = function(startIndex)
{
	this.setPropertyInteger(oFF.PlanningModelRequestVersionStateDescriptions.START_INDEX, startIndex);
	return this;
};
oFF.PlanningModelRequestVersionStateDescriptions.prototype.getStartIndex = function()
{
	return this.getPropertyInteger(oFF.PlanningModelRequestVersionStateDescriptions.START_INDEX);
};
oFF.PlanningModelRequestVersionStateDescriptions.prototype.setCount = function(count)
{
	this.setPropertyInteger(oFF.PlanningModelRequestVersionStateDescriptions.COUNT, count);
	return this;
};
oFF.PlanningModelRequestVersionStateDescriptions.prototype.getCount = function()
{
	return this.getPropertyInteger(oFF.PlanningModelRequestVersionStateDescriptions.COUNT);
};
oFF.PlanningModelRequestVersionStateDescriptions.prototype.createCommandResultInstanceInternal = function()
{
	return new oFF.PlanningModelResponseVersionStateDescriptions();
};

oFF.PlanningModelRequestVersionUndoRedo = function() {};
oFF.PlanningModelRequestVersionUndoRedo.prototype = new oFF.PlanningModelRequestVersion();
oFF.PlanningModelRequestVersionUndoRedo.prototype._ff_c = "PlanningModelRequestVersionUndoRedo";

oFF.PlanningModelRequestVersionUndoRedo.NUM_UNDO_REDO_STEPS = "NUM_UNDO_REDO_STEPS";
oFF.PlanningModelRequestVersionUndoRedo.prototype.getOlapComponentType = function()
{
	return oFF.OlapComponentType.PLANNING_VERSION_UNDO_REDO_COMMAND;
};
oFF.PlanningModelRequestVersionUndoRedo.prototype.setSteps = function(steps)
{
	this.setPropertyInteger(oFF.PlanningModelRequestVersionUndoRedo.NUM_UNDO_REDO_STEPS, steps);
	return this;
};
oFF.PlanningModelRequestVersionUndoRedo.prototype.getSteps = function()
{
	return this.getPropertyInteger(oFF.PlanningModelRequestVersionUndoRedo.NUM_UNDO_REDO_STEPS);
};

oFF.PlanningModelResponseVersionStartActionSequence = function() {};
oFF.PlanningModelResponseVersionStartActionSequence.prototype = new oFF.PlanningModelResponseVersion();
oFF.PlanningModelResponseVersionStartActionSequence.prototype._ff_c = "PlanningModelResponseVersionStartActionSequence";

oFF.PlanningModelResponseVersionStartActionSequence.SEQUENCE_ID = "SEQUENCE_ID";
oFF.PlanningModelResponseVersionStartActionSequence.prototype.getPlanningModelRequestVersion = function()
{
	return this.getPlanningCommand();
};
oFF.PlanningModelResponseVersionStartActionSequence.prototype.getSequenceId = function()
{
	return this.getPropertyString(oFF.PlanningModelResponseVersionStartActionSequence.SEQUENCE_ID);
};
oFF.PlanningModelResponseVersionStartActionSequence.prototype.setSequenceId = function(sequenceId)
{
	this.setPropertyString(oFF.PlanningModelResponseVersionStartActionSequence.SEQUENCE_ID, sequenceId);
};

oFF.PlanningModelResponseVersionStateDescriptions = function() {};
oFF.PlanningModelResponseVersionStateDescriptions.prototype = new oFF.PlanningModelResponseVersion();
oFF.PlanningModelResponseVersionStateDescriptions.prototype._ff_c = "PlanningModelResponseVersionStateDescriptions";

oFF.PlanningModelResponseVersionStateDescriptions.VERSION_IDENTIFIER = "VERSION_IDENTIFIER";
oFF.PlanningModelResponseVersionStateDescriptions.VERSION_DESCRIPTION = "VERSION_DESCRIPTION";
oFF.PlanningModelResponseVersionStateDescriptions.AVAILABLE_UNDOS = "AVAILABLE_UNDOS";
oFF.PlanningModelResponseVersionStateDescriptions.AVAILABLE_REDOS = "AVAILABLE_REDOS";
oFF.PlanningModelResponseVersionStateDescriptions.DESCRIPTIONS = "DESCRIPTIONS";
oFF.PlanningModelResponseVersionStateDescriptions.prototype.getPlanningModelRequestVersion = function()
{
	return this.getPlanningCommand();
};
oFF.PlanningModelResponseVersionStateDescriptions.prototype.getVersionIdentifier = function()
{
	return this.getPropertyObject(oFF.PlanningModelResponseVersionStateDescriptions.VERSION_IDENTIFIER);
};
oFF.PlanningModelResponseVersionStateDescriptions.prototype.setVersionIdentifier = function(identifier)
{
	this.setPropertyObject(oFF.PlanningModelResponseVersionStateDescriptions.VERSION_IDENTIFIER, identifier);
};
oFF.PlanningModelResponseVersionStateDescriptions.prototype.getVersionId = function()
{
	return this.getVersionIdentifier().getVersionId();
};
oFF.PlanningModelResponseVersionStateDescriptions.prototype.isSharedVersion = function()
{
	return this.getVersionIdentifier().isSharedVersion();
};
oFF.PlanningModelResponseVersionStateDescriptions.prototype.getVersionOwner = function()
{
	return this.getVersionIdentifier().getVersionOwner();
};
oFF.PlanningModelResponseVersionStateDescriptions.prototype.getVersionUniqueName = function()
{
	return this.getVersionIdentifier().getVersionUniqueName();
};
oFF.PlanningModelResponseVersionStateDescriptions.prototype.getVersionDescription = function()
{
	return this.getPropertyString(oFF.PlanningModelResponseVersionStateDescriptions.VERSION_DESCRIPTION);
};
oFF.PlanningModelResponseVersionStateDescriptions.prototype.setVersionDescription = function(versionDescription)
{
	this.setPropertyString(oFF.PlanningModelResponseVersionStateDescriptions.VERSION_DESCRIPTION, versionDescription);
};
oFF.PlanningModelResponseVersionStateDescriptions.prototype.getAvailableUndos = function()
{
	return this.getPropertyInteger(oFF.PlanningModelResponseVersionStateDescriptions.AVAILABLE_UNDOS);
};
oFF.PlanningModelResponseVersionStateDescriptions.prototype.setAvailableUndos = function(undos)
{
	this.setPropertyInteger(oFF.PlanningModelResponseVersionStateDescriptions.AVAILABLE_UNDOS, undos);
};
oFF.PlanningModelResponseVersionStateDescriptions.prototype.getAvailableRedos = function()
{
	return this.getPropertyInteger(oFF.PlanningModelResponseVersionStateDescriptions.AVAILABLE_REDOS);
};
oFF.PlanningModelResponseVersionStateDescriptions.prototype.setAvailableRedos = function(redos)
{
	this.setPropertyInteger(oFF.PlanningModelResponseVersionStateDescriptions.AVAILABLE_REDOS, redos);
};
oFF.PlanningModelResponseVersionStateDescriptions.prototype.getVersionStateDescriptionList = function()
{
	return this.getPropertyObject(oFF.PlanningModelResponseVersionStateDescriptions.DESCRIPTIONS);
};
oFF.PlanningModelResponseVersionStateDescriptions.prototype.getVersionStateDescription = function(index)
{
	return this.getVersionStateDescriptionList().get(index);
};
oFF.PlanningModelResponseVersionStateDescriptions.prototype.getVersionStateDescriptionIterator = function()
{
	return this.getVersionStateDescriptionList().getIterator();
};
oFF.PlanningModelResponseVersionStateDescriptions.prototype.getVersionStateDescriptionSize = function()
{
	return this.getVersionStateDescriptionList().size();
};
oFF.PlanningModelResponseVersionStateDescriptions.prototype.setVersionStateDescriptions = function(descriptions)
{
	this.setPropertyObject(oFF.PlanningModelResponseVersionStateDescriptions.DESCRIPTIONS, descriptions);
};
oFF.PlanningModelResponseVersionStateDescriptions.prototype.toString = function()
{
	var buffer = oFF.XStringBuffer.create();
	buffer.append("version id: ").appendInt(this.getVersionId()).append("\n");
	buffer.append("version description: ").append(this.getVersionDescription()).append("\n");
	buffer.append("undos: ").appendInt(this.getAvailableUndos()).append("\n");
	buffer.append("redos: ").appendInt(this.getAvailableRedos()).append("\n");
	var descriptionIterator = this.getVersionStateDescriptionIterator();
	buffer.append("state descriptions: [");
	while (descriptionIterator.hasNext())
	{
		buffer.append(descriptionIterator.next().toString());
		if (descriptionIterator.hasNext())
		{
			buffer.append(", ");
		}
	}
	buffer.append("]");
	return buffer.toString();
};

oFF.PlanningModelRequestVersionInit = function() {};
oFF.PlanningModelRequestVersionInit.prototype = new oFF.PlanningModelRequestVersionSetParameters();
oFF.PlanningModelRequestVersionInit.prototype._ff_c = "PlanningModelRequestVersionInit";

oFF.PlanningModelRequestVersionInit.RESTORE_BACKUP_TYPE = "RESTORE_BACKUP_TYPE";
oFF.PlanningModelRequestVersionInit.prototype.getOlapComponentType = function()
{
	return oFF.OlapComponentType.PLANNING_VERSION_INIT_COMMAND;
};
oFF.PlanningModelRequestVersionInit.prototype.setRestoreBackupType = function(restoreBackupType)
{
	this.setPropertyObject(oFF.PlanningModelRequestVersionInit.RESTORE_BACKUP_TYPE, restoreBackupType);
	return this;
};
oFF.PlanningModelRequestVersionInit.prototype.getRestoreBackupType = function()
{
	var restoreBackupType = this.getPropertyObject(oFF.PlanningModelRequestVersionInit.RESTORE_BACKUP_TYPE);
	if (oFF.isNull(restoreBackupType))
	{
		restoreBackupType = oFF.RestoreBackupType.NONE;
	}
	return restoreBackupType;
};
oFF.PlanningModelRequestVersionInit.prototype.setVersionParameters = function(parameters)
{
	var parametersStructure = oFF.PlanningVersion.parametersStringMap2ParametersStructure(parameters);
	this.setVersionParametersAsJson(parametersStructure);
	return this;
};
oFF.PlanningModelRequestVersionInit.prototype.setVersionParametersAsJson = function(parametersJson)
{
	oFF.PlanningModelRequestVersionSetParameters.prototype.setVersionParametersAsJson.call( this , parametersJson);
	if (oFF.notNull(parametersJson))
	{
		this.tryPublicVersionEdit();
	}
	return this;
};
oFF.PlanningModelRequestVersionInit.prototype.tryPublicVersionEdit = function()
{
	var planningModel = this.getPlanningModel();
	if (oFF.isNull(planningModel) || !planningModel.supportsPublicVersionEdit())
	{
		return;
	}
	var version = this.getPlanningVersion();
	var publicVersionEdit = version.isShowingAsPublicVersion() && oFF.XStringUtils.isNotNullAndNotEmpty(version.getSourceVersionName());
	this.setInvalidatingResultSet(!publicVersionEdit);
};
oFF.PlanningModelRequestVersionInit.prototype.getVersionParameters = function()
{
	var parametersStructure = this.getVersionParametersStructure();
	return oFF.PlanningVersion.parametersStructure2ParametersStringMap(parametersStructure);
};

oFF.IpImplModule = function() {};
oFF.IpImplModule.prototype = new oFF.DfModule();
oFF.IpImplModule.prototype._ff_c = "IpImplModule";

oFF.IpImplModule.s_module = null;
oFF.IpImplModule.getInstance = function()
{
	if (oFF.isNull(oFF.IpImplModule.s_module))
	{
		oFF.DfModule.checkInitialized(oFF.OlapImplModule.getInstance());
		oFF.IpImplModule.s_module = oFF.DfModule.startExt(new oFF.IpImplModule());
		var registrationService = oFF.RegistrationService.getInstance();
		oFF.PlanningServiceConfig.staticSetup();
		registrationService.addServiceConfig(oFF.OlapApiModule.XS_PLANNING, oFF.PlanningServiceConfig.CLAZZ);
		oFF.PlanningService.staticSetup();
		registrationService.addService(oFF.OlapApiModule.XS_PLANNING, oFF.PlanningService.CLAZZ);
		oFF.XCmdInitPlanningStep.staticSetup();
		oFF.XCmdInitPlanningStepResult.staticSetup();
		registrationService.addCommand(oFF.XCmdInitPlanningStep.CMD_NAME, oFF.XCmdInitPlanningStep.CLAZZ);
		oFF.XCmdCreatePlanningOperation.staticSetup();
		oFF.XCmdCreatePlanningOperationResult.staticSetup();
		registrationService.addCommand(oFF.XCmdCreatePlanningOperation.CMD_NAME, oFF.XCmdCreatePlanningOperation.CLAZZ);
		oFF.PlanningBatchRequestDecoratorProvider.staticSetup();
		registrationService.addReference(oFF.BatchRequestDecoratorFactory.BATCH_REQUEST_DECORATOR_PROVIDER, oFF.PlanningBatchRequestDecoratorProvider.CLAZZ);
		oFF.PlanningRsRequestDecoratorProvider.staticSetup();
		registrationService.addReference(oFF.RsRequestDecoratorFactory.RESULTSET_REQUEST_DECORATOR_PROVIDER, oFF.PlanningRsRequestDecoratorProvider.CLAZZ);
		oFF.PlanningFactory.setInstance(new oFF.PlanningManagerFactoryImpl());
		oFF.DfModule.stopExt(oFF.IpImplModule.s_module);
	}
	return oFF.IpImplModule.s_module;
};
oFF.IpImplModule.prototype.getName = function()
{
	return "ff4315.olap.ip.impl";
};

oFF.IpImplModule.getInstance();

return sap.firefly;
	} );