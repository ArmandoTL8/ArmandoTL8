/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
[
"sap/sac/df/firefly/ff4400.olap.providers","sap/sac/df/firefly/ff4315.olap.ip.impl"
],
function(oFF)
{
"use strict";

oFF.PlanningStateHandlerImpl = function() {};
oFF.PlanningStateHandlerImpl.prototype = new oFF.XObject();
oFF.PlanningStateHandlerImpl.prototype._ff_c = "PlanningStateHandlerImpl";

oFF.PlanningStateHandlerImpl.prototype.update = function(application, systemName, response, messageCollector)
{
	oFF.PlanningState.update(application, systemName, response, messageCollector);
};
oFF.PlanningStateHandlerImpl.prototype.updateFromResponse = function(application, systemName, request, response, messageCollector)
{
	oFF.PlanningState.updateFromResponse(application, systemName, request, response, messageCollector);
};
oFF.PlanningStateHandlerImpl.prototype.getDataAreaStateByName = function(application, systemName, dataArea)
{
	return oFF.DataAreaState.getDataAreaStateByName(application, systemName, dataArea);
};

oFF.PlanningVariableProcessorProviderFactory = function() {};
oFF.PlanningVariableProcessorProviderFactory.prototype = new oFF.XObject();
oFF.PlanningVariableProcessorProviderFactory.prototype._ff_c = "PlanningVariableProcessorProviderFactory";

oFF.PlanningVariableProcessorProviderFactory.staticSetup = function()
{
	oFF.PlanningCommandWithId.s_variableHelpProviderFactory = new oFF.PlanningVariableProcessorProviderFactory();
};
oFF.PlanningVariableProcessorProviderFactory.prototype.createVariableHelpProvider = function(planningCommandWithValueHelp)
{
	return oFF.InAPlanningValueHelpProvider.create(planningCommandWithValueHelp);
};
oFF.PlanningVariableProcessorProviderFactory.prototype.createProcessorProvider = function(dataSource, variableRequestor, requestorProvider)
{
	return oFF.InAPlanningVarProcessorProvider.createInAVariableProcessorProvider(dataSource, variableRequestor, requestorProvider);
};

oFF.InADataAreaRequestHelper = {

	createGetMetadataRequestStructure:function(request)
	{
			var inaRequestStructure = oFF.PrFactory.createStructure();
		var dataAreaState = oFF.DataAreaState.getDataAreaState(request.getDataArea());
		if (!dataAreaState.isSubmitted())
		{
			inaRequestStructure.putNewList("DataAreas").add(dataAreaState.serializeToJson());
		}
		var metadata = inaRequestStructure.putNewStructure("Metadata");
		request.getPlanningService().getInaCapabilities().exportActiveCapabilities(metadata);
		metadata.putString("Context", "Planning");
		var expand = metadata.putNewList("Expand");
		expand.addString("Command");
		var dataSource = metadata.putNewStructure("DataSource");
		var dataAreaName = request.getDataArea().getDataArea();
		if (oFF.isNull(dataAreaName))
		{
			dataAreaName = "DEFAULT";
		}
		dataSource.putString("DataArea", dataAreaName);
		dataSource.putString("InstanceId", request.getInstanceId());
		return inaRequestStructure;
	},
	extractBaseDataSource:function(step)
	{
			var baseDataSource = oFF.PrUtils.getStructureProperty(step, "BaseDataSource");
		if (oFF.isNull(baseDataSource))
		{
			return null;
		}
		var objectName = oFF.PrUtils.getStringValueProperty(baseDataSource, "ObjectName", null);
		if (oFF.isNull(objectName))
		{
			return null;
		}
		var metaObjectType = oFF.MetaObjectType.lookup(oFF.PrUtils.getStringValueProperty(baseDataSource, "Type", null));
		if (oFF.isNull(metaObjectType))
		{
			return null;
		}
		return oFF.QFactory.createDataSourceWithType(metaObjectType, objectName);
	}
};

oFF.InAPlanningHelper = {

	DEFAULT_RETURN_CODE:9999,
	createCommandsList:function(rootStructure)
	{
			var planning = rootStructure.putNewStructure("Planning");
		return planning.putNewList("commands");
	},
	getCommandResponse:function(commands, responses, commandName)
	{
			var commandIndex = oFF.InAPlanningHelper.getCommandIndex(commands, commandName);
		return oFF.PrUtils.getStructureElement(responses, commandIndex);
	},
	getCommandIndex:function(commands, commandName)
	{
			if (oFF.isNull(commands))
		{
			return -1;
		}
		var effectiveCommandName = commandName;
		var checkMode = false;
		var modeToCheck = null;
		if (oFF.XString.isEqual("get_action_parameters", commandName))
		{
			effectiveCommandName = "get_parameters";
			checkMode = true;
			modeToCheck = "LIST_ACTIONS";
		}
		for (var i = 0; i < commands.size(); i++)
		{
			var command = oFF.PrUtils.getStructureElement(commands, i);
			var commandString = oFF.PrUtils.getStringProperty(command, "command");
			if (oFF.isNull(commandString))
			{
				continue;
			}
			if (oFF.XString.isEqual(commandString.getString(), effectiveCommandName))
			{
				if (!checkMode)
				{
					return i;
				}
				var modeString = oFF.PrUtils.getStringProperty(command, "mode");
				if (oFF.notNull(modeString))
				{
					if (oFF.XString.isEqual(modeString.getString(), modeToCheck))
					{
						return i;
					}
				}
				var modeList = oFF.PrUtils.getListProperty(command, "mode");
				var len = oFF.PrUtils.getListSize(modeList, 0);
				for (var modeIndex = 0; modeIndex < len; modeIndex++)
				{
					var modeStringElement = oFF.PrUtils.getStringElement(modeList, modeIndex);
					if (oFF.notNull(modeStringElement))
					{
						if (oFF.XString.isEqual(modeStringElement.getString(), modeToCheck))
						{
							return i;
						}
					}
				}
			}
		}
		return -1;
	},
	getResponsesReturnCodeStrict:function(responseStructure, messageManager)
	{
			if (oFF.isNull(responseStructure) || oFF.isNull(messageManager))
		{
			return -1;
		}
		var returnCode = 0;
		var hasPlanningStructure = false;
		var planningStructure = oFF.PrUtils.getStructureProperty(responseStructure, "Planning");
		if (oFF.isNull(planningStructure))
		{
			var planningList = oFF.PrUtils.getListProperty(responseStructure, "Planning");
			if (oFF.notNull(planningList))
			{
				hasPlanningStructure = true;
				for (var i = 0; i < planningList.size(); i++)
				{
					planningStructure = oFF.PrUtils.getStructureElement(planningList, i);
					if (oFF.notNull(planningStructure))
					{
						var planningReturnCode = oFF.InAPlanningHelper.isValidPlanningStructure(planningStructure, messageManager);
						if (planningReturnCode !== 0)
						{
							returnCode = planningReturnCode;
							break;
						}
					}
				}
			}
		}
		else
		{
			hasPlanningStructure = true;
			returnCode = oFF.InAPlanningHelper.isValidPlanningStructure(planningStructure, messageManager);
		}
		if (!hasPlanningStructure)
		{
			messageManager.addErrorExt(oFF.OriginLayer.DRIVER, oFF.ErrorCodes.PARSER_ERROR, "Planning structure is missing", responseStructure);
			return oFF.InAPlanningHelper.DEFAULT_RETURN_CODE;
		}
		return returnCode;
	},
	isValidPlanningStructure:function(planningStructure, messageManager)
	{
			var returnCode = oFF.PrUtils.getIntegerValueProperty(planningStructure, "return_code", oFF.InAPlanningHelper.DEFAULT_RETURN_CODE);
		if (oFF.isNull(planningStructure))
		{
			messageManager.addError(oFF.ErrorCodes.PARSER_ERROR, "Planning structure is missing");
			return returnCode;
		}
		var exceptionText = oFF.PrUtils.getStringValueProperty(planningStructure, "exception_text", null);
		if (oFF.notNull(exceptionText))
		{
			messageManager.addErrorExt(oFF.OriginLayer.DRIVER, oFF.ErrorCodes.OTHER_ERROR, exceptionText, planningStructure);
			return returnCode;
		}
		var message = oFF.PrUtils.getStringValueProperty(planningStructure, "message", null);
		if (oFF.notNull(message))
		{
			messageManager.addErrorExt(oFF.OriginLayer.DRIVER, oFF.ErrorCodes.OTHER_ERROR, message, planningStructure);
			return returnCode;
		}
		return returnCode;
	},
	processResponseGetQuerySources:function(commands, responses, model)
	{
			var commandResponse = oFF.InAPlanningHelper.getCommandResponse(commands, responses, "get_query_sources");
		if (oFF.isNull(commandResponse))
		{
			return false;
		}
		var dataSources = model.getDataSourcesInternal();
		dataSources.clear();
		var querySources = oFF.PrUtils.getListProperty(commandResponse, "query_sources");
		if (oFF.isNull(querySources))
		{
			return false;
		}
		for (var i = 0; i < querySources.size(); i++)
		{
			var querySource = oFF.PrUtils.getStructureElement(querySources, i);
			var schema = oFF.PrUtils.getStringValueProperty(querySource, "schema", null);
			if (oFF.isNull(schema))
			{
				return false;
			}
			var name = oFF.PrUtils.getStringValueProperty(querySource, "name", null);
			if (oFF.isNull(name))
			{
				return false;
			}
			var identifier = oFF.QFactory.createDataSourceWithType(oFF.MetaObjectType.PLANNING, name);
			identifier.setSchemaName(schema);
			var queryDataSource = new oFF.PlanningModelQueryDataSource();
			var description = oFF.PrUtils.getStringValueProperty(querySource, "description", null);
			queryDataSource.setDescription(description);
			queryDataSource.setDataSource(identifier);
			queryDataSource.setPrimary(querySource.getBooleanByKeyExt("primary", true));
			dataSources.add(queryDataSource);
		}
		return true;
	},
	processResponseGetActionParameters:function(commands, responses, model)
	{
			var commandResponse = oFF.InAPlanningHelper.getCommandResponse(commands, responses, "get_action_parameters");
		if (oFF.isNull(commandResponse))
		{
			return false;
		}
		var parametersMap = oFF.XHashMapByString.create();
		var parametersList = oFF.PrUtils.getListProperty(commandResponse, "parameters");
		var len = oFF.PrUtils.getListSize(parametersList, 0);
		for (var i = 0; i < len; i++)
		{
			var parameterStructure = oFF.PrUtils.getStructureElement(parametersList, i);
			var parameterNameString = oFF.PrUtils.getStringProperty(parameterStructure, "name");
			if (oFF.isNull(parameterNameString))
			{
				return false;
			}
			var parameterName = parameterNameString.getString();
			if (parametersMap.containsKey(parameterName))
			{
				return false;
			}
			parametersMap.put(parameterName, parameterStructure);
		}
		var actionMetadataList = model.getActionMetadataListInternal();
		if (oFF.notNull(actionMetadataList))
		{
			for (var actionIndex = 0; actionIndex < actionMetadataList.size(); actionIndex++)
			{
				var actionMetadata = actionMetadataList.get(actionIndex);
				var actionParameterNames = actionMetadata.getActionParameterNames();
				var actionParameterMetadata = new oFF.PlanningActionParameterMetadata();
				actionParameterMetadata.setActionMetadata(actionMetadata);
				var actionParameterList = oFF.PrFactory.createList();
				if (oFF.notNull(actionParameterNames))
				{
					for (var actionParameterIndex = 0; actionParameterIndex < actionParameterNames.size(); actionParameterIndex++)
					{
						var actionParameterName = actionParameterNames.get(actionParameterIndex);
						if (!parametersMap.containsKey(actionParameterName))
						{
							return false;
						}
						var actionParameterStructure = parametersMap.getByKey(actionParameterName);
						actionParameterList.add(oFF.PrUtils.deepCopyElement(actionParameterStructure));
					}
				}
				actionParameterMetadata.setParameters(actionParameterList);
				actionMetadata.setActionParameterMetadata(actionParameterMetadata);
			}
		}
		return true;
	},
	processResponseGetParametersForModelTemplate:function(commands, responses, model)
	{
			if (!model.supportsVersionParameters())
		{
			return true;
		}
		var commandResponse = oFF.InAPlanningHelper.getCommandResponse(commands, responses, "get_parameters");
		if (oFF.isNull(commandResponse))
		{
			return false;
		}
		var versionParametersMetadata = model.getVersionParametersMetadataInternal();
		versionParametersMetadata.clear();
		var parametersList = oFF.PrUtils.getListProperty(commandResponse, "parameters");
		if (oFF.isNull(parametersList))
		{
			return true;
		}
		for (var i = 0; i < parametersList.size(); i++)
		{
			var parameterStructure = oFF.PrUtils.getStructureElement(parametersList, i);
			if (oFF.isNull(parameterStructure))
			{
				continue;
			}
			var nameString = oFF.PrUtils.getStringProperty(parameterStructure, "name");
			if (oFF.isNull(nameString))
			{
				continue;
			}
			var name = nameString.getString();
			if (oFF.XStringUtils.isNullOrEmpty(name))
			{
				continue;
			}
			var parameterMetadata = new oFF.PlanningVersionParameterMetadata();
			parameterMetadata.setName(name);
			var descriptionString = oFF.PrUtils.getStringProperty(parameterStructure, "description");
			if (oFF.notNull(descriptionString))
			{
				parameterMetadata.setDescription(descriptionString.getString());
			}
			var typeString = oFF.PrUtils.getStringProperty(parameterStructure, "type");
			if (oFF.notNull(typeString))
			{
				parameterMetadata.setType(typeString.getString());
			}
			var valueAllowed = oFF.PrUtils.getBooleanValueProperty(parameterStructure, "valueAllowed", false);
			parameterMetadata.setValueAllowed(valueAllowed);
			var hasValue = oFF.PrUtils.getBooleanValueProperty(parameterStructure, "hasValue", false);
			parameterMetadata.setHasValue(hasValue);
			parameterMetadata.setValue(oFF.PrUtils.getProperty(parameterStructure, "value"));
			versionParametersMetadata.put(parameterMetadata.getName(), parameterMetadata);
		}
		return true;
	},
	processResponseGetActions:function(commands, responses, model)
	{
			var commandResponse = oFF.InAPlanningHelper.getCommandResponse(commands, responses, "get_actions");
		if (oFF.isNull(commandResponse))
		{
			return false;
		}
		var actionMetadataList = model.getActionMetadataListInternal();
		actionMetadataList.clear();
		var actions = oFF.PrUtils.getListProperty(commandResponse, "actions");
		if (oFF.isNull(actions))
		{
			return false;
		}
		for (var i = 0; i < actions.size(); i++)
		{
			var action = oFF.PrUtils.getStructureElement(actions, i);
			var actionId = oFF.PrUtils.getStringValueProperty(action, "id", null);
			if (oFF.isNull(actionId))
			{
				return false;
			}
			var actionName = oFF.PrUtils.getStringValueProperty(action, "name", null);
			if (oFF.isNull(actionName))
			{
				return false;
			}
			var actionType = oFF.PlanningActionType.lookup(oFF.PrUtils.getIntegerValueProperty(action, "type", -1));
			if (oFF.PrUtils.getBooleanValueProperty(action, "publish", false))
			{
				actionType = oFF.PlanningActionType.PUBLISH;
			}
			var actionMetadata = new oFF.PlanningActionMetadata();
			actionMetadata.setActionId(actionId);
			actionMetadata.setActionName(actionName);
			var actionDescription = oFF.PrUtils.getStringValueProperty(action, "description", null);
			actionMetadata.setActionDescription(actionDescription);
			actionMetadata.setActionType(actionType);
			var isDefault = oFF.PrUtils.getBooleanValueProperty(action, "default", false);
			actionMetadata.setDefault(isDefault);
			var parameterNames = null;
			var parametersList = oFF.PrUtils.getListProperty(action, "parameters");
			var len = oFF.PrUtils.getListSize(parametersList, 0);
			for (var parametersIndex = 0; parametersIndex < len; parametersIndex++)
			{
				var parameterStringElement = oFF.PrUtils.getStringElement(parametersList, parametersIndex);
				if (oFF.notNull(parameterStringElement))
				{
					if (oFF.isNull(parameterNames))
					{
						parameterNames = oFF.XListOfString.create();
					}
					parameterNames.add(parameterStringElement.getString());
				}
			}
			actionMetadata.setActionParameterNames(parameterNames);
			actionMetadataList.add(actionMetadata);
		}
		return true;
	},
	getResponsesList:function(rootStructure)
	{
			return oFF.PrUtils.getListProperty(rootStructure, "Planning");
	},
	getCommandsList:function(rootStructure)
	{
			var planning = oFF.PrUtils.getStructureProperty(rootStructure, "Planning");
		return oFF.PrUtils.getListProperty(planning, "commands");
	},
	processResponseGetVersionState:function(commands, responses, version)
	{
			var commandResponse = oFF.InAPlanningHelper.getCommandResponse(commands, responses, "get_version_state");
		if (oFF.isNull(commandResponse))
		{
			return false;
		}
		var versionStateResponse = oFF.PrUtils.getStructureProperty(commandResponse, "version_state");
		if (oFF.isNull(versionStateResponse))
		{
			return false;
		}
		return oFF.InAPlanningHelper.setVersionState(versionStateResponse, version);
	},
	setVersionState:function(versionStateResponse, version)
	{
			var stateString = oFF.PrUtils.getStringValueProperty(versionStateResponse, "state", null);
		var planningVersionState = oFF.PlanningVersionState.lookup(stateString);
		if (oFF.isNull(planningVersionState))
		{
			return false;
		}
		var totalChangesSize = oFF.PrUtils.getIntegerValueProperty(versionStateResponse, "changes", 0);
		var undoChangesSize = oFF.PrUtils.getIntegerValueProperty(versionStateResponse, "undo_changes", 0);
		version.setVersionState(planningVersionState);
		version.setTotalChangesSize(totalChangesSize);
		version.setUndoChangesSize(undoChangesSize);
		var versionCreationTime = oFF.PrUtils.getStringProperty(versionStateResponse, "create_time");
		if (oFF.notNull(versionCreationTime))
		{
			var creationTime = oFF.XDateTime.createDateTimeFromIsoFormat(versionCreationTime.getString());
			version.setCreationTime(creationTime);
		}
		var versionBackupTime = oFF.PrUtils.getStringProperty(versionStateResponse, "backup_time");
		if (oFF.notNull(versionBackupTime))
		{
			var backupTime = oFF.XDateTime.createDateTimeFromIsoFormat(versionBackupTime.getString());
			version.setBackupTime(backupTime);
		}
		oFF.InAPlanningHelper.resetActionState(versionStateResponse, version);
		return true;
	},
	resetActionState:function(versionStructure, planningVersion)
	{
			var sequenceActive = false;
		var sequenceDescription = null;
		var sequenceCreateTime = null;
		var actionActive = false;
		var actionStartTime = null;
		var actionEndTime = null;
		var userName = null;
		var actionStateStructure = oFF.PrUtils.getStructureProperty(versionStructure, "action_state");
		if (oFF.notNull(actionStateStructure))
		{
			sequenceActive = oFF.PrUtils.getBooleanValueProperty(actionStateStructure, "sequence_active", false);
			if (sequenceActive)
			{
				sequenceDescription = oFF.PrUtils.getStringValueProperty(actionStateStructure, "sequence_description", null);
				if (oFF.isNull(sequenceDescription))
				{
					sequenceDescription = oFF.PrUtils.getStringValueProperty(actionStateStructure, "description", null);
				}
				sequenceCreateTime = oFF.PrUtils.getDateTimeProperty(actionStateStructure, "sequence_create_time", false, null);
				actionEndTime = oFF.PrUtils.getDateTimeProperty(actionStateStructure, "action_end_time", false, null);
				userName = oFF.PrUtils.getStringValueProperty(actionStateStructure, "user_name", null);
			}
			actionActive = oFF.PrUtils.getBooleanValueProperty(actionStateStructure, "action_active", false);
			if (actionActive)
			{
				actionStartTime = oFF.PrUtils.getDateTimeProperty(actionStateStructure, "action_start_time", false, null);
			}
		}
		planningVersion.setActionSequenceActive(sequenceActive);
		planningVersion.setActionSequenceDescription(sequenceDescription);
		planningVersion.setActionSequenceCreateTime(sequenceCreateTime);
		planningVersion.setActionActive(actionActive);
		planningVersion.setActionStartTime(actionStartTime);
		planningVersion.setActionEndTime(actionEndTime);
		planningVersion.setUserName(userName);
	},
	processResponseGetVersions:function(commands, responses, model)
	{
			var commandResponse = oFF.InAPlanningHelper.getCommandResponse(commands, responses, "get_versions");
		if (oFF.isNull(commandResponse))
		{
			return false;
		}
		var versionsList = oFF.PrUtils.getListProperty(commandResponse, "versions");
		if (oFF.isNull(versionsList))
		{
			return false;
		}
		model.resetAllVersionStates();
		model.setVersionPrivilegesInitialized();
		oFF.PlanningModelResponseUpdateVersionPrivileges.resetVersionPrivilegesServerState(model);
		var isOk = true;
		for (var i = 0; i < versionsList.size(); i++)
		{
			var versionStructure = oFF.PrUtils.getStructureElement(versionsList, i);
			if (!oFF.InAPlanningHelper.processVersionStructure(versionStructure, model))
			{
				isOk = false;
			}
		}
		oFF.PlanningModelResponseUpdateVersionPrivileges.resetVersionPrivilegesClientState(model);
		model.updateAllInvalidPrivileges();
		return isOk;
	},
	processVersionStructure:function(versionStructure, model)
	{
			if (oFF.isNull(versionStructure))
		{
			return false;
		}
		var schema = oFF.PrUtils.getStringValueProperty(versionStructure, "schema", null);
		if (oFF.isNull(schema))
		{
			return false;
		}
		if (!oFF.XString.isEqual(oFF.PrUtils.getStringValueProperty(versionStructure, "model", null), model.getPlanningModelName()))
		{
			return false;
		}
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
		var versionState = oFF.PlanningVersionState.lookup(oFF.PrUtils.getStringValueProperty(versionStructure, "state", null));
		if (oFF.isNull(versionState))
		{
			return false;
		}
		var isActive = activeBoolean.getBoolean();
		if (isActive !== versionState.isActive())
		{
			return false;
		}
		var totalChangesSize = oFF.PrUtils.getIntegerValueProperty(versionStructure, "changes", 0);
		var undoChangesSize = oFF.PrUtils.getIntegerValueProperty(versionStructure, "undo_changes", 0);
		var sharedVersion = false;
		var versionOwner = oFF.PrUtils.getStringValueProperty(versionStructure, "owner", null);
		var privilege = oFF.PlanningPrivilege.lookupWithDefault(oFF.PrUtils.getStringValueProperty(versionStructure, "privilege", null), null);
		if (oFF.isNull(privilege))
		{
			if (model.isWithSharedVersions())
			{
				return false;
			}
			versionOwner = null;
			privilege = oFF.PlanningPrivilege.OWNER;
		}
		else
		{
			if (privilege === oFF.PlanningPrivilege.OWNER)
			{
				versionOwner = null;
			}
			else
			{
				sharedVersion = true;
			}
		}
		if (sharedVersion === (privilege === oFF.PlanningPrivilege.OWNER))
		{
			return false;
		}
		var versionId = versionIdElement.getInteger();
		var versionDescription = oFF.PrUtils.getStringValueProperty(versionStructure, "description", null);
		var planningVersionIdentifier = model.getVersionIdentifier(versionId, sharedVersion, versionOwner);
		var planningVersion = model.getVersionById(planningVersionIdentifier, versionDescription);
		planningVersion.setPrivilege(privilege);
		planningVersion.setVersionState(versionState);
		planningVersion.setTotalChangesSize(totalChangesSize);
		planningVersion.setUndoChangesSize(undoChangesSize);
		var versionCreationTime = oFF.PrUtils.getStringProperty(versionStructure, "create_time");
		if (oFF.notNull(versionCreationTime))
		{
			var creationTime = oFF.XDateTime.createDateTimeFromIsoFormat(versionCreationTime.getString());
			planningVersion.setCreationTime(creationTime);
		}
		var versionBackupTime = oFF.PrUtils.getStringProperty(versionStructure, "backup_time");
		if (oFF.notNull(versionBackupTime))
		{
			var backupTime = oFF.XDateTime.createDateTimeFromIsoFormat(versionBackupTime.getString());
			planningVersion.setBackupTime(backupTime);
		}
		oFF.InAPlanningHelper.resetVersionParameters(versionStructure, planningVersion);
		if (!planningVersionIdentifier.isSharedVersion())
		{
			var querySourceList = oFF.PrUtils.getListProperty(versionStructure, "query_sources");
			var len = oFF.PrUtils.getListSize(querySourceList, 0);
			for (var querySourceIndex = 0; querySourceIndex < len; querySourceIndex++)
			{
				var querySourceStructure = oFF.PrUtils.getStructureElement(querySourceList, querySourceIndex);
				var dataSource = oFF.PlanningModelResponseUpdateVersionPrivileges.getVersionDataSource(querySourceStructure);
				var versionPrivilegeList = oFF.PrUtils.getListProperty(querySourceStructure, "version_privileges");
				oFF.PlanningModelResponseUpdateVersionPrivileges.updateVersionPrivileges(model, dataSource, planningVersionIdentifier, versionPrivilegeList);
			}
		}
		oFF.InAPlanningHelper.resetActionState(versionStructure, planningVersion);
		return true;
	},
	hasErrors:function(importer, request, inaStructure)
	{
			var result = request.getResult();
		var responses = oFF.InAPlanningHelper.getResponsesList(inaStructure);
		if (oFF.isNull(responses))
		{
			importer.addError(oFF.ErrorCodes.PARSER_ERROR, "Couldn't find command responses.");
			return true;
		}
		oFF.InAHelper.importMessages(inaStructure, importer);
		var returnCode = oFF.InAPlanningHelper.getResponsesReturnCodeStrict(inaStructure, importer);
		result.setReturnCode(returnCode);
		if (importer.hasErrors() || returnCode !== 0)
		{
			if (returnCode === 3042)
			{
				request.getPlanningModel().resetPlanningModel();
			}
			return true;
		}
		return false;
	},
	resetVersionParameters:function(commandResponse, version)
	{
			var versionParameters = oFF.PrFactory.createStructure();
		var parametersList = oFF.PrUtils.getListProperty(commandResponse, "parameters");
		if (oFF.notNull(parametersList))
		{
			for (var i = 0; i < parametersList.size(); i++)
			{
				var parameterStructure = oFF.PrUtils.getStructureElement(parametersList, i);
				if (oFF.isNull(parameterStructure))
				{
					continue;
				}
				if (!oFF.PrUtils.getBooleanValueProperty(parameterStructure, "hasValue", false))
				{
					continue;
				}
				var nameString = oFF.PrUtils.getStringProperty(parameterStructure, "name");
				if (oFF.isNull(nameString))
				{
					continue;
				}
				var valueElement = oFF.PrUtils.getProperty(parameterStructure, "value");
				versionParameters.put(nameString.getString(), valueElement);
			}
		}
		version.setParametersStructureInternal(versionParameters);
	},
	createVersionCommand:function(version, commandName)
	{
			var model = version.getPlanningModel();
		var command = oFF.PrFactory.createStructure();
		command.putString("command", commandName);
		command.putString("schema", model.getPlanningModelSchema());
		command.putString("model", model.getPlanningModelName());
		command.putInteger("version_id", version.getVersionId());
		if (version.isSharedVersion())
		{
			command.putString("owner", version.getVersionOwner());
		}
		if (oFF.XString.isEqual("get_version_state", commandName))
		{
			var modeListGetVersionState = command.putNewList("mode");
			modeListGetVersionState.addString("LIST_BACKUP_TIMESTAMP");
			modeListGetVersionState.addString("LIST_ACTION_STATE");
		}
		else if (oFF.XString.isEqual("get_parameters", commandName))
		{
			command.putString("mode", "LIST_PERSISTENT");
		}
		else if (oFF.XString.isEqual("init", commandName))
		{
			var persistenceType = version.getPlanningModel().getPersistenceType();
			if (oFF.notNull(persistenceType) && persistenceType !== oFF.PlanningPersistenceType.DEFAULT)
			{
				command.putString("persistent_pdcs", persistenceType.getName());
			}
		}
		else if (oFF.XString.isEqual("close", commandName))
		{
			command.putString("mode", oFF.CloseModeType.BACKUP.getName());
		}
		return command;
	},
	createModelCommand:function(model, commandName)
	{
			var command = oFF.PrFactory.createStructure();
		var effectiveCommandName = commandName;
		if (oFF.XString.isEqual("get_action_parameters", commandName))
		{
			effectiveCommandName = "get_parameters";
		}
		command.putString("command", effectiveCommandName);
		command.putString("schema", model.getPlanningModelSchema());
		command.putString("model", model.getPlanningModelName());
		if (oFF.XString.isEqual("get_parameters", commandName))
		{
			command.putString("mode", "LIST_PERSISTENT");
		}
		else if (oFF.XString.isEqual("get_versions", commandName))
		{
			var modeListGetVersions = command.putNewList("mode");
			modeListGetVersions.addString("LIST_PERSISTENT_PARAMETERS");
			if (model.isWithSharedVersions())
			{
				modeListGetVersions.addString("LIST_SHARED_VERSIONS");
			}
			modeListGetVersions.addString("LIST_QUERY_SOURCES");
			modeListGetVersions.addString("LIST_SHARED_PRIVILEGES");
			modeListGetVersions.addString("LIST_BACKUP_TIMESTAMP");
			modeListGetVersions.addString("LIST_ACTION_STATE");
		}
		else if (oFF.XString.isEqual("get_actions", commandName))
		{
			var modeListGetActions = command.putNewList("mode");
			modeListGetActions.addString("LIST_ACTION_PARAMETERS");
		}
		else if (oFF.XString.isEqual("get_action_parameters", commandName))
		{
			var modeListGetParameters = command.putNewList("mode");
			modeListGetParameters.addString("LIST_ACTIONS");
		}
		return command;
	}
};

oFF.InAPlanningHelperTmp = function() {};
oFF.InAPlanningHelperTmp.prototype = new oFF.XObject();
oFF.InAPlanningHelperTmp.prototype._ff_c = "InAPlanningHelperTmp";

oFF.InAPlanningHelperTmp.staticSetup = function()
{
	oFF.PlanningModelCommandHelper.SetHelper(new oFF.InAPlanningHelperTmp());
};
oFF.InAPlanningHelperTmp.prototype.getCommandResponse = function(commands, responses, commandName)
{
	return oFF.InAPlanningHelper.getCommandResponse(commands, responses, commandName);
};
oFF.InAPlanningHelperTmp.prototype.getResponsesReturnCodeStrict = function(responseStructure, messageManager)
{
	return oFF.InAPlanningHelper.getResponsesReturnCodeStrict(responseStructure, messageManager);
};
oFF.InAPlanningHelperTmp.prototype.resetVersionParameters = function(commandResponse, version)
{
	oFF.InAPlanningHelper.resetVersionParameters(commandResponse, version);
};
oFF.InAPlanningHelperTmp.prototype.processResponseGetVersions = function(commands, responses, model)
{
	return oFF.InAPlanningHelper.processResponseGetVersions(commands, responses, model);
};
oFF.InAPlanningHelperTmp.prototype.convertRequestToBatch = function(request)
{
	var newRequestStructure = oFF.PrStructure.create();
	var batchList = newRequestStructure.putNewList(oFF.ConnectionConstants.INA_BATCH);
	var planningStructure = request.getStructureByKey("Planning");
	var commands = planningStructure.getListByKey("commands");
	for (var i = 0; i < commands.size(); i++)
	{
		var batchEntry = batchList.addNewStructure();
		batchEntry.put("Planning", commands.getStructureAt(i));
	}
	return newRequestStructure;
};
oFF.InAPlanningHelperTmp.prototype.convertResponseFromBatch = function(response)
{
	var newResponseStructure = oFF.PrStructure.create();
	var planningList = newResponseStructure.putNewList("Planning");
	var batchList = response.getListByKey(oFF.ConnectionConstants.INA_BATCH);
	for (var i = 0; i < batchList.size(); i++)
	{
		planningList.add(batchList.getStructureAt(i).getStructureByKey("Planning"));
	}
	return newResponseStructure;
};

oFF.InAPlanningCapabilitiesProviderFactory = function() {};
oFF.InAPlanningCapabilitiesProviderFactory.prototype = new oFF.XObject();
oFF.InAPlanningCapabilitiesProviderFactory.prototype._ff_c = "InAPlanningCapabilitiesProviderFactory";

oFF.InAPlanningCapabilitiesProviderFactory.staticSetup = function()
{
	oFF.PlanningService.s_capabilitiesProviderFactory = new oFF.InAPlanningCapabilitiesProviderFactory();
};
oFF.InAPlanningCapabilitiesProviderFactory.prototype.create = function(session, serverMetadata, providerType)
{
	return oFF.InACapabilitiesProvider.create(session, serverMetadata, providerType, null);
};

oFF.InADataAreaRequestGetPlanningFunctionMetadata = function() {};
oFF.InADataAreaRequestGetPlanningFunctionMetadata.prototype = new oFF.QInAComponentWithStructure();
oFF.InADataAreaRequestGetPlanningFunctionMetadata.prototype._ff_c = "InADataAreaRequestGetPlanningFunctionMetadata";

oFF.InADataAreaRequestGetPlanningFunctionMetadata.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.DATA_AREA_GET_FUNCTION_METADATA;
};
oFF.InADataAreaRequestGetPlanningFunctionMetadata.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	oFF.InAHelper.importMessages(inaStructure, importer);
	var request = modelComponent;
	var result = request.getResult();
	var command = oFF.PrUtils.getStructureProperty(inaStructure, "Command");
	if (oFF.isNull(command))
	{
		return null;
	}
	var dataSource = oFF.PrUtils.getStructureProperty(command, "DataSource");
	var dataAreaName = oFF.PrUtils.getStringValueProperty(dataSource, "DataArea", "DEFAULT");
	var dataArea = request.getDataArea();
	if (!oFF.XString.isEqual(dataArea.getDataArea(), dataAreaName))
	{
		return null;
	}
	var instanceIdRequest = request.getInstanceId();
	if (oFF.isNull(instanceIdRequest))
	{
		return null;
	}
	var objectName = oFF.PrUtils.getStringValueProperty(dataSource, "ObjectName", null);
	var planningFunctionIdentifier = request.getPlanningFunctionIdentifier();
	if (!oFF.XString.isEqual(objectName, planningFunctionIdentifier.getPlanningFunctionName()))
	{
		return null;
	}
	var type = oFF.PrUtils.getStringValueProperty(dataSource, "Type", null);
	if (!oFF.XString.isEqual(type, "PlanningFunction"))
	{
		return null;
	}
	var dimensions = oFF.PrUtils.getListProperty(command, "Dimensions");
	var variables = oFF.PrUtils.getListProperty(command, "Variables");
	var baseDatasource = oFF.InADataAreaRequestHelper.extractBaseDataSource(command);
	var metadata = new oFF.PlanningFunctionMetadata();
	metadata.setPlanningOperationIdentifier(planningFunctionIdentifier);
	metadata.setDataArea(dataArea);
	metadata.setInstanceId(instanceIdRequest);
	metadata.setDimenstions(dimensions);
	metadata.setVariables(variables);
	metadata.setBaseDataSource(baseDatasource);
	result.setPlanningOperationMetadata(metadata);
	return modelComponent;
};
oFF.InADataAreaRequestGetPlanningFunctionMetadata.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var request = modelComponent;
	var inaRequestStructure = oFF.InADataAreaRequestHelper.createGetMetadataRequestStructure(request);
	var metadata = inaRequestStructure.getStructureByKey("Metadata");
	var dataSource = metadata.getStructureByKey("DataSource");
	dataSource.putString("ObjectName", request.getPlanningFunctionIdentifier().getPlanningFunctionName());
	dataSource.putString("Type", "PlanningFunction");
	return inaRequestStructure;
};

oFF.InADataAreaRequestGetPlanningSequenceMetadata = function() {};
oFF.InADataAreaRequestGetPlanningSequenceMetadata.prototype = new oFF.QInAComponentWithStructure();
oFF.InADataAreaRequestGetPlanningSequenceMetadata.prototype._ff_c = "InADataAreaRequestGetPlanningSequenceMetadata";

oFF.InADataAreaRequestGetPlanningSequenceMetadata.extractStepMetadataList = function(command)
{
	var steps = oFF.PrUtils.getListProperty(command, "Steps");
	if (oFF.isNull(steps))
	{
		return null;
	}
	var result = oFF.XList.create();
	for (var i = 0; i < steps.size(); i++)
	{
		var step = oFF.PrUtils.getStructureElement(steps, i);
		if (oFF.isNull(step))
		{
			continue;
		}
		var number = oFF.PrUtils.getIntegerValueProperty(step, "StepNumber", 0);
		var type = oFF.PlanningSequenceStepType.lookup(oFF.PrUtils.getStringValueProperty(step, "StepType", null));
		var baseDataSource = oFF.InADataAreaRequestHelper.extractBaseDataSource(step);
		var filterName = oFF.PrUtils.getStringValueProperty(step, "FilterName", null);
		var planningFunctionName = oFF.PrUtils.getStringValueProperty(step, "PlanningFunctionName", null);
		var queryName = oFF.PrUtils.getStringValueProperty(step, "QueryName", null);
		var planningFunctionDescription = oFF.PrUtils.getStringValueProperty(step, "Description", null);
		var commandType = oFF.PrUtils.getStringValueProperty(step, "CommandType", null);
		var stepMetadata = new oFF.PlanningSequenceStepMetadata();
		stepMetadata.setNumber(number);
		stepMetadata.setType(type);
		stepMetadata.setBaseDataSource(baseDataSource);
		stepMetadata.setFilterName(filterName);
		stepMetadata.setPlanningFunctionName(planningFunctionName);
		stepMetadata.setQueryName(queryName);
		stepMetadata.setPlanningFunctionDescription(planningFunctionDescription);
		stepMetadata.setCommendType(commandType);
		result.add(stepMetadata);
	}
	return result;
};
oFF.InADataAreaRequestGetPlanningSequenceMetadata.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.DATA_AREA_GET_SEQUENCE_METADATA;
};
oFF.InADataAreaRequestGetPlanningSequenceMetadata.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	oFF.InAHelper.importMessages(inaStructure, importer);
	var request = modelComponent;
	var result = request.getResult();
	var command = oFF.PrUtils.getStructureProperty(inaStructure, "Command");
	if (oFF.isNull(command))
	{
		return null;
	}
	var dataSource = oFF.PrUtils.getStructureProperty(command, "DataSource");
	var dataAreaName = oFF.PrUtils.getStringValueProperty(dataSource, "DataArea", "DEFAULT");
	var dataArea = request.getDataArea();
	if (!oFF.XString.isEqual(dataArea.getDataArea(), dataAreaName))
	{
		return null;
	}
	var instanceIdRequest = request.getInstanceId();
	if (oFF.isNull(instanceIdRequest))
	{
		return null;
	}
	var instanceId = oFF.PrUtils.getStringValueProperty(dataSource, "InstanceId", null);
	if (oFF.isNull(instanceId))
	{
		instanceId = instanceIdRequest;
	}
	else
	{
		if (!oFF.XString.isEqual(instanceId, instanceIdRequest))
		{
			return null;
		}
	}
	var objectName = oFF.PrUtils.getStringValueProperty(dataSource, "ObjectName", null);
	var planningSequenceIdentifier = request.getPlanningSequenceIdentifier();
	if (!oFF.XString.isEqual(objectName, planningSequenceIdentifier.getPlanningSequenceName()))
	{
		return null;
	}
	var type = oFF.PrUtils.getStringValueProperty(dataSource, "Type", null);
	if (!oFF.XString.isEqual(type, "PlanningSequence"))
	{
		return null;
	}
	var dimensions = oFF.PrUtils.getListProperty(command, "Dimensions");
	var variables = oFF.PrUtils.getListProperty(command, "Variables");
	var stepMetadataList = oFF.InADataAreaRequestGetPlanningSequenceMetadata.extractStepMetadataList(command);
	var metadata = new oFF.PlanningSequenceMetadata();
	metadata.setPlanningOperationIdentifier(planningSequenceIdentifier);
	metadata.setDataArea(dataArea);
	metadata.setInstanceId(instanceId);
	metadata.setDimenstions(dimensions);
	metadata.setVariables(variables);
	metadata.setStepMetadataList(stepMetadataList);
	result.setPlanningOperationMetadata(metadata);
	return modelComponent;
};
oFF.InADataAreaRequestGetPlanningSequenceMetadata.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var request = modelComponent;
	var inaRequestStructure = oFF.InADataAreaRequestHelper.createGetMetadataRequestStructure(request);
	var metadata = inaRequestStructure.getStructureByKey("Metadata");
	var dataSource = metadata.getStructureByKey("DataSource");
	dataSource.putString("ObjectName", request.getPlanningSequenceIdentifier().getPlanningSequenceName());
	dataSource.putString("Type", "PlanningSequence");
	return inaRequestStructure;
};

oFF.InADataAreaCommand = function() {};
oFF.InADataAreaCommand.prototype = new oFF.QInAComponentWithStructure();
oFF.InADataAreaCommand.prototype._ff_c = "InADataAreaCommand";

oFF.InADataAreaCommand.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.DATA_AREA_COMMAND;
};
oFF.InADataAreaCommand.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	oFF.InAHelper.importMessages(inaStructure, importer);
	if (importer.hasErrors())
	{
		return null;
	}
	var command = modelComponent;
	var result = command.getResult();
	var commandResultsList = oFF.PrUtils.getListProperty(inaStructure, "CommandResults");
	if (oFF.isNull(commandResultsList) || commandResultsList.size() !== 1)
	{
		return null;
	}
	var commandResultStructure = oFF.PrUtils.getStructureElement(commandResultsList, 0);
	result.setExecuted(oFF.PrUtils.getBooleanProperty(commandResultStructure, "Executed").getBoolean());
	return command;
};
oFF.InADataAreaCommand.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var command = modelComponent;
	var requestStructure = oFF.PrFactory.createStructure();
	var dataAreaState = oFF.DataAreaState.getDataAreaState(command.getDataArea());
	if (!dataAreaState.isSubmitted())
	{
		var dataAreaStructure = dataAreaState.serializeToJson();
		requestStructure.putNewList("DataAreas").add(dataAreaStructure);
	}
	var planningStructure = requestStructure.putNewStructure("Planning");
	command.getPlanningService().getInaCapabilities().exportActiveCapabilities(planningStructure);
	var commandsList = planningStructure.putNewList("Commands");
	var planningContextCommandType = command.getPlanningContextCommandType();
	var objectName = planningContextCommandType.toString();
	if (planningContextCommandType === oFF.PlanningContextCommandType.PUBLISH)
	{
		objectName = "SAVE";
	}
	var planningContextDataArea = command.getDataArea();
	var dataArea = planningContextDataArea.getDataArea();
	if (oFF.isNull(dataArea))
	{
		dataArea = "DEFAULT";
	}
	var commandStructure = commandsList.addNewStructure();
	var dataSource = commandStructure.putNewStructure("DataSource");
	dataSource.putString("ObjectName", objectName);
	dataSource.putString("Type", "DataAreaCommand");
	dataSource.putString("DataArea", dataArea);
	return requestStructure;
};

oFF.InADataAreaCommandClose = function() {};
oFF.InADataAreaCommandClose.prototype = new oFF.QInAComponentWithStructure();
oFF.InADataAreaCommandClose.prototype._ff_c = "InADataAreaCommandClose";

oFF.InADataAreaCommandClose.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.DATA_AREA_COMMAND_CLOSE;
};
oFF.InADataAreaCommandClose.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	oFF.InAHelper.importMessages(inaStructure, importer);
	if (importer.hasErrors())
	{
		return null;
	}
	var command = modelComponent;
	var result = command.getResult();
	var dataArea = command.getDataArea();
	var queryConsumerServices = oFF.DataAreaUtil.getQueryConsumerServices(dataArea);
	if (oFF.notNull(queryConsumerServices))
	{
		for (var i = 0; i < queryConsumerServices.size(); i++)
		{
			var queryConsumerService = queryConsumerServices.get(i);
			oFF.XObjectExt.release(queryConsumerService);
		}
	}
	oFF.DataAreaState.removeDataAreaState(dataArea);
	var planningService = dataArea.getPlanningService();
	oFF.XObjectExt.release(planningService);
	result.setExecuted(true);
	return modelComponent;
};
oFF.InADataAreaCommandClose.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var command = modelComponent;
	var dataAreaName = command.getDataArea().getDataArea();
	var requestStructure = oFF.PrFactory.createStructure();
	var planningStructure = requestStructure.putNewStructure("Analytics");
	var actionsList = planningStructure.putNewList("Actions");
	var actionStructure = actionsList.addNewStructure();
	actionStructure.putString("Type", "Close");
	var dataAreasList = actionStructure.putNewList("DataAreas");
	dataAreasList.addString(dataAreaName);
	return requestStructure;
};

oFF.InALightweightDataAreaCommand = function() {};
oFF.InALightweightDataAreaCommand.prototype = new oFF.QInAComponentWithStructure();
oFF.InALightweightDataAreaCommand.prototype._ff_c = "InALightweightDataAreaCommand";

oFF.InALightweightDataAreaCommand.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.LIGHTWEIGHT_DATA_AREA_COMMAND;
};
oFF.InALightweightDataAreaCommand.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	oFF.InAHelper.importMessages(inaStructure, importer);
	if (importer.hasErrors())
	{
		return null;
	}
	var command = modelComponent;
	var result = command.getResult();
	var commandResultsList = oFF.PrUtils.getListProperty(inaStructure, "CommandResults");
	if (oFF.isNull(commandResultsList) || commandResultsList.size() !== 1)
	{
		return null;
	}
	var commandResultStructure = oFF.PrUtils.getStructureElement(commandResultsList, 0);
	result.setExecuted(oFF.PrUtils.getBooleanProperty(commandResultStructure, "Executed").getBoolean());
	return result;
};
oFF.InALightweightDataAreaCommand.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var command = modelComponent;
	var requestStructure = oFF.PrFactory.createStructure();
	var planningStructure = requestStructure.putNewStructure("Planning");
	modelComponent.getQueryManager().getInaCapabilities().exportActiveCapabilities(planningStructure);
	var commandsList = planningStructure.putNewList("Commands");
	var planningContextCommandType = command.getPlanningContextCommandType();
	var objectName = planningContextCommandType.toString();
	var dataArea = command.getQueryModel().getDataArea();
	if (oFF.isNull(dataArea))
	{
		dataArea = "DEFAULT";
	}
	var commandStructure = commandsList.addNewStructure();
	var dataSource = commandStructure.putNewStructure("DataSource");
	dataSource.putString("ObjectName", objectName);
	dataSource.putString("Type", "DataAreaCommand");
	dataSource.putString("DataArea", dataArea);
	dataSource.putString("InstanceId", command.getQueryManager().getInstanceId());
	return requestStructure;
};

oFF.InaPlanningModel = function() {};
oFF.InaPlanningModel.prototype = new oFF.QInAComponentWithStructure();
oFF.InaPlanningModel.prototype._ff_c = "InaPlanningModel";

oFF.InaPlanningModel.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.PLANNING_MODEL;
};
oFF.InaPlanningModel.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	return null;
};
oFF.InaPlanningModel.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	return null;
};

oFF.InAPlanningModelRequestCleanup = function() {};
oFF.InAPlanningModelRequestCleanup.prototype = new oFF.QInAComponentWithStructure();
oFF.InAPlanningModelRequestCleanup.prototype._ff_c = "InAPlanningModelRequestCleanup";

oFF.InAPlanningModelRequestCleanup.createCleanupCommand = function()
{
	var command = oFF.PrFactory.createStructure();
	command.putString("command", "cleanup");
	return command;
};
oFF.InAPlanningModelRequestCleanup.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.PLANNING_MODEL_CLEANUP_COMMAND;
};
oFF.InAPlanningModelRequestCleanup.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var request = modelComponent;
	if (oFF.InAPlanningHelper.hasErrors(importer, request, inaStructure))
	{
		return null;
	}
	var commands = oFF.InAPlanningHelper.getCommandsList(request.serializeToElement(oFF.QModelFormat.INA_DATA).asStructure());
	var responses = oFF.InAPlanningHelper.getResponsesList(inaStructure);
	if (!oFF.InAPlanningHelper.processResponseGetVersions(commands, responses, request.getPlanningModel()))
	{
		importer.addErrorExt(oFF.OriginLayer.DRIVER, oFF.ErrorCodes.PARSER_ERROR, "error in processing response structure", inaStructure);
		return null;
	}
	return modelComponent;
};
oFF.InAPlanningModelRequestCleanup.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var request = modelComponent;
	var inaRequestStructure = oFF.PrFactory.createStructure();
	var commands = oFF.InAPlanningHelper.createCommandsList(inaRequestStructure);
	commands.add(oFF.InAPlanningModelRequestCleanup.createCleanupCommand());
	commands.add(oFF.InAPlanningHelper.createModelCommand(request.getPlanningModel(), "get_versions"));
	return inaRequestStructure;
};

oFF.InAPlanningModelRequestRefreshActions = function() {};
oFF.InAPlanningModelRequestRefreshActions.prototype = new oFF.QInAComponentWithStructure();
oFF.InAPlanningModelRequestRefreshActions.prototype._ff_c = "InAPlanningModelRequestRefreshActions";

oFF.InAPlanningModelRequestRefreshActions.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.PLANNING_MODEL_REFRESH_ACTIONS_COMMAND;
};
oFF.InAPlanningModelRequestRefreshActions.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var request = modelComponent;
	if (oFF.InAPlanningHelper.hasErrors(importer, request, inaStructure))
	{
		return null;
	}
	var commands = oFF.InAPlanningHelper.getCommandsList(request.serializeToElement(oFF.QModelFormat.INA_DATA).asStructure());
	var responses = oFF.InAPlanningHelper.getResponsesList(inaStructure);
	if (!oFF.InAPlanningHelper.processResponseGetActions(commands, responses, request.getPlanningModel()))
	{
		importer.addErrorExt(oFF.OriginLayer.DRIVER, oFF.ErrorCodes.PARSER_ERROR, "error in processing response structure", inaStructure);
		return null;
	}
	return modelComponent;
};
oFF.InAPlanningModelRequestRefreshActions.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var request = modelComponent;
	var inaRequestStructure = oFF.PrFactory.createStructure();
	var commands = oFF.InAPlanningHelper.createCommandsList(inaRequestStructure);
	var model = request.getPlanningModel();
	commands.add(oFF.InAPlanningHelper.createModelCommand(model, "get_actions"));
	commands.add(oFF.InAPlanningHelper.createModelCommand(model, "get_action_parameters"));
	return inaRequestStructure;
};

oFF.InAPlanningModelRequestRefreshVersions = function() {};
oFF.InAPlanningModelRequestRefreshVersions.prototype = new oFF.QInAComponentWithStructure();
oFF.InAPlanningModelRequestRefreshVersions.prototype._ff_c = "InAPlanningModelRequestRefreshVersions";

oFF.InAPlanningModelRequestRefreshVersions.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.PLANNING_MODEL_REFRESH_VERSIONS_COMMAND;
};
oFF.InAPlanningModelRequestRefreshVersions.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var request = modelComponent;
	if (oFF.InAPlanningHelper.hasErrors(importer, request, inaStructure))
	{
		return null;
	}
	var commands = oFF.InAPlanningHelper.getCommandsList(request.serializeToElement(oFF.QModelFormat.INA_DATA).asStructure());
	var responses = oFF.InAPlanningHelper.getResponsesList(inaStructure);
	if (!oFF.InAPlanningHelper.processResponseGetVersions(commands, responses, request.getPlanningModel()))
	{
		importer.addErrorExt(oFF.OriginLayer.DRIVER, oFF.ErrorCodes.PARSER_ERROR, "error in processing response structure", inaStructure);
		return null;
	}
	return modelComponent;
};
oFF.InAPlanningModelRequestRefreshVersions.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var request = modelComponent;
	var inaRequestStructure = oFF.PrFactory.createStructure();
	var commands = oFF.InAPlanningHelper.createCommandsList(inaRequestStructure);
	commands.add(oFF.InAPlanningHelper.createModelCommand(request.getPlanningModel(), "get_versions"));
	return inaRequestStructure;
};

oFF.InAPlanningModelRequestUpdateVersionPrivileges = function() {};
oFF.InAPlanningModelRequestUpdateVersionPrivileges.prototype = new oFF.QInAComponentWithStructure();
oFF.InAPlanningModelRequestUpdateVersionPrivileges.prototype._ff_c = "InAPlanningModelRequestUpdateVersionPrivileges";

oFF.InAPlanningModelRequestUpdateVersionPrivileges.addShowVersionPrivilegesCommands = function(commandsList, planningModel)
{
	var queryDataSources = planningModel.getQueryDataSources();
	var versions = planningModel.getVersions();
	for (var i = 0; i < queryDataSources.size(); i++)
	{
		var queryDataSource = queryDataSources.get(i).getDataSource();
		for (var j = 0; j < versions.size(); j++)
		{
			var version = versions.get(j);
			oFF.InAPlanningModelRequestUpdateVersionPrivileges.addShowVersionPrivilegesCommand(commandsList, planningModel, queryDataSource, version);
		}
	}
};
oFF.InAPlanningModelRequestUpdateVersionPrivileges.addShowVersionPrivilegesCommand = function(commandsList, planningModel, dataSource, version)
{
	var commandStructure = commandsList.addNewStructure();
	commandStructure.putString("command", "show_version_privileges");
	commandStructure.putString("schema", planningModel.getPlanningModelSchema());
	commandStructure.putString("model", planningModel.getPlanningModelName());
	commandStructure.putString("query_source_schema", dataSource.getSchemaName());
	commandStructure.putString("query_source", dataSource.getObjectName());
	commandStructure.putInteger("version_id", version.getVersionId());
	if (version.isSharedVersion())
	{
		commandStructure.putString("owner", version.getVersionOwner());
	}
};
oFF.InAPlanningModelRequestUpdateVersionPrivileges.addPrivilegeCommand = function(commandsList, versionPrivilege)
{
	var privilegeState = versionPrivilege.getPrivilegeState();
	if (privilegeState !== oFF.PlanningPrivilegeState.TO_BE_GRANTED && privilegeState !== oFF.PlanningPrivilegeState.TO_BE_REVOKED)
	{
		return;
	}
	var commandValue;
	if (privilegeState === oFF.PlanningPrivilegeState.TO_BE_GRANTED)
	{
		commandValue = "grant_version_privilege";
	}
	else if (privilegeState === oFF.PlanningPrivilegeState.TO_BE_REVOKED)
	{
		commandValue = "revoke_version_privilege";
	}
	else
	{
		throw oFF.XException.createIllegalStateException("illegal privilege command");
	}
	var commandStructure = commandsList.addNewStructure();
	commandStructure.putString("command", commandValue);
	var planningModel = versionPrivilege.getPlanningModel();
	commandStructure.putString("schema", planningModel.getPlanningModelSchema());
	commandStructure.putString("model", planningModel.getPlanningModelName());
	var dataSource = versionPrivilege.getQueryDataSource();
	commandStructure.putString("query_source_schema", dataSource.getSchemaName());
	commandStructure.putString("query_source", dataSource.getObjectName());
	commandStructure.putInteger("version_id", versionPrivilege.getVersionId());
	if (versionPrivilege.isSharedVersion())
	{
		commandStructure.putString("owner", versionPrivilege.getVersionOwner());
	}
	commandStructure.putString("privilege", versionPrivilege.getPrivilege().getName());
	commandStructure.putString("grantee", versionPrivilege.getGrantee());
};
oFF.InAPlanningModelRequestUpdateVersionPrivileges.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.PLANNING_MODEL_UPDATE_VERSION_PRIVILEGES_COMMAND;
};
oFF.InAPlanningModelRequestUpdateVersionPrivileges.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var request = modelComponent;
	if (oFF.InAPlanningHelper.hasErrors(importer, request, inaStructure))
	{
		return null;
	}
	var model = request.getPlanningModel();
	model.setVersionPrivilegesInitialized();
	var commands = oFF.InAPlanningHelper.getCommandsList(request.serializeToElement(oFF.QModelFormat.INA_DATA).asStructure());
	var responses = oFF.InAPlanningHelper.getResponsesList(inaStructure);
	if (oFF.isNull(commands) && oFF.isNull(responses))
	{
		return modelComponent;
	}
	if (oFF.isNull(commands) || oFF.isNull(responses) || commands.size() !== responses.size())
	{
		importer.addErrorExt(oFF.OriginLayer.DRIVER, oFF.ErrorCodes.PARSER_ERROR, "unexpected command response", inaStructure);
		return null;
	}
	oFF.PlanningModelResponseUpdateVersionPrivileges.resetVersionPrivilegesServerState(model);
	for (var i = 0; i < commands.size(); i++)
	{
		var command = oFF.PrUtils.getStructureElement(commands, i);
		var commandValue = oFF.PrUtils.getStringValueProperty(command, "command", null);
		if (!oFF.XString.isEqual(commandValue, "show_version_privileges"))
		{
			continue;
		}
		var response = oFF.PrUtils.getStructureElement(responses, i);
		var versionPrivilegeList = oFF.PrUtils.getListProperty(response, "version_privileges");
		if (oFF.isNull(versionPrivilegeList))
		{
			continue;
		}
		var dataSource = oFF.PlanningModelResponseUpdateVersionPrivileges.getVersionDataSource(command);
		var versionId = oFF.PrUtils.getIntegerValueProperty(command, "version_id", -1);
		var sharedVersion = false;
		var versionOwner = null;
		var owner = oFF.PrUtils.getStringProperty(command, "owner");
		if (oFF.notNull(owner))
		{
			sharedVersion = true;
			versionOwner = owner.getString();
		}
		var planningVersionIdentifier = model.getVersionIdentifier(versionId, sharedVersion, versionOwner);
		oFF.PlanningModelResponseUpdateVersionPrivileges.updateVersionPrivileges(model, dataSource, planningVersionIdentifier, versionPrivilegeList);
	}
	oFF.PlanningModelResponseUpdateVersionPrivileges.resetVersionPrivilegesClientState(model);
	return modelComponent;
};
oFF.InAPlanningModelRequestUpdateVersionPrivileges.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var request = modelComponent;
	var inaRequestStructure = oFF.PrFactory.createStructure();
	var planningStructure = inaRequestStructure.putNewStructure("Planning");
	var commandsList = planningStructure.putNewList("commands");
	var planningModel = request.getPlanningModel();
	if (planningModel.isVersionPrivilegesInitialized())
	{
		var versionPrivileges = planningModel.getVersionPrivileges();
		if (oFF.notNull(versionPrivileges))
		{
			for (var i = 0; i < versionPrivileges.size(); i++)
			{
				oFF.InAPlanningModelRequestUpdateVersionPrivileges.addPrivilegeCommand(commandsList, versionPrivileges.get(i));
			}
		}
	}
	oFF.InAPlanningModelRequestUpdateVersionPrivileges.addShowVersionPrivilegesCommands(commandsList, planningModel);
	return inaRequestStructure;
};

oFF.InAPlanningModelRequestVersion = function() {};
oFF.InAPlanningModelRequestVersion.prototype = new oFF.QInAComponentWithStructure();
oFF.InAPlanningModelRequestVersion.prototype._ff_c = "InAPlanningModelRequestVersion";

oFF.InAPlanningModelRequestVersion.processResponseEndActionSequence = function(commands, responses, version)
{
	var commandResponse = oFF.InAPlanningHelper.getCommandResponse(commands, responses, oFF.PlanningModelRequestType.END_ACTION_SEQUENCE.getName());
	if (oFF.notNull(commandResponse))
	{
		version.setActionSequenceId(null);
	}
};
oFF.InAPlanningModelRequestVersion.processResponseKillActionSequence = function(commands, responses, version)
{
	var commandResponse = oFF.InAPlanningHelper.getCommandResponse(commands, responses, oFF.PlanningModelRequestType.KILL_ACTION_SEQUENCE.getName());
	if (oFF.notNull(commandResponse))
	{
		version.setActionSequenceId(null);
	}
};
oFF.InAPlanningModelRequestVersion.processResponseGetParameters = function(commands, responses, version)
{
	var commandResponse = oFF.InAPlanningHelper.getCommandResponse(commands, responses, "get_parameters");
	if (oFF.notNull(commandResponse))
	{
		oFF.InAPlanningHelper.resetVersionParameters(commandResponse, version);
	}
};
oFF.InAPlanningModelRequestVersion.createGetParametersCommand = function(request)
{
	var requestType = request.getRequestType();
	if (requestType !== oFF.PlanningModelRequestType.INIT_VERSION && requestType !== oFF.PlanningModelRequestType.RESET_VERSION && requestType !== oFF.PlanningModelRequestType.UPDATE_PARAMETERS)
	{
		return null;
	}
	if (!request.getPlanningModel().supportsVersionParameters())
	{
		return null;
	}
	var version = request.getPlanningVersion();
	if (version.isSharedVersion())
	{
		return null;
	}
	return oFF.InAPlanningModelRequestVersion.createVersionCommand(version, "get_parameters");
};
oFF.InAPlanningModelRequestVersion.createCommandsList = function(rootStructure)
{
	var planning = rootStructure.putNewStructure("Planning");
	return planning.putNewList("commands");
};
oFF.InAPlanningModelRequestVersion.createVersionCommand = function(version, commandName)
{
	var model = version.getPlanningModel();
	var command = oFF.PrFactory.createStructure();
	command.putString("command", commandName);
	command.putString("schema", model.getPlanningModelSchema());
	command.putString("model", model.getPlanningModelName());
	command.putInteger("version_id", version.getVersionId());
	if (version.isSharedVersion())
	{
		command.putString("owner", version.getVersionOwner());
	}
	if (oFF.XString.isEqual("get_version_state", commandName))
	{
		var modeListGetVersionState = command.putNewList("mode");
		modeListGetVersionState.addString("LIST_BACKUP_TIMESTAMP");
		modeListGetVersionState.addString("LIST_ACTION_STATE");
	}
	else if (oFF.XString.isEqual("get_parameters", commandName))
	{
		command.putString("mode", "LIST_PERSISTENT");
	}
	else if (oFF.XString.isEqual("init", commandName))
	{
		var persistenceType = version.getPlanningModel().getPersistenceType();
		if (oFF.notNull(persistenceType) && persistenceType !== oFF.PlanningPersistenceType.DEFAULT)
		{
			command.putString("persistent_pdcs", persistenceType.getName());
		}
	}
	else if (oFF.XString.isEqual("close", commandName))
	{
		command.putString("mode", oFF.CloseModeType.BACKUP.getName());
	}
	return command;
};
oFF.InAPlanningModelRequestVersion.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.PLANNING_VERSION_COMMAND;
};
oFF.InAPlanningModelRequestVersion.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var request = modelComponent;
	if (oFF.InAPlanningHelper.hasErrors(importer, request, inaStructure))
	{
		return null;
	}
	if (request.isInvalidatingResultSet())
	{
		request.getPlanningContext().invalidate();
	}
	var version = request.getPlanningVersion();
	var commands = oFF.InAPlanningHelper.getCommandsList(request.serializeToElement(oFF.QModelFormat.INA_DATA).asStructure());
	var responses = oFF.InAPlanningHelper.getResponsesList(inaStructure);
	oFF.InAPlanningModelRequestVersion.processResponseEndActionSequence(commands, responses, version);
	oFF.InAPlanningModelRequestVersion.processResponseKillActionSequence(commands, responses, version);
	oFF.InAPlanningModelRequestVersion.processResponseGetParameters(commands, responses, version);
	if (!oFF.InAPlanningHelper.processResponseGetVersionState(commands, responses, version))
	{
		if (request.getRequestType() === oFF.PlanningModelRequestType.DROP_VERSION)
		{
			version.invalidateVersion();
			version.updateInvalidPrivileges();
		}
	}
	if (!this.importInternal(request, commands, responses))
	{
		importer.addErrorExt(oFF.OriginLayer.DRIVER, oFF.ErrorCodes.PARSER_ERROR, "error in processing response structure", inaStructure);
	}
	return modelComponent;
};
oFF.InAPlanningModelRequestVersion.prototype.importInternal = function(request, commands, responses)
{
	return true;
};
oFF.InAPlanningModelRequestVersion.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var request = modelComponent;
	var inaRequestStructure = oFF.PrStructure.create();
	var commands = oFF.InAPlanningModelRequestVersion.createCommandsList(inaRequestStructure);
	var requestType = request.getRequestType();
	var version = request.getPlanningVersion();
	if (requestType === oFF.PlanningModelRequestType.RESET_VERSION)
	{
		commands.add(oFF.InAPlanningModelRequestVersion.createVersionCommand(version, oFF.PlanningModelRequestType.CLOSE_VERSION.getName()));
		commands.add(oFF.InAPlanningModelRequestVersion.createVersionCommand(version, oFF.PlanningModelRequestType.INIT_VERSION.getName()));
	}
	else if (requestType !== oFF.PlanningModelRequestType.UPDATE_PARAMETERS)
	{
		if (requestType === oFF.PlanningModelRequestType.CLOSE_VERSION)
		{
			var requestCloseVersion = request;
			if (requestCloseVersion.getCloseMode().isWithKillActionSequence())
			{
				commands.add(oFF.InAPlanningModelRequestVersion.createVersionCommand(version, oFF.PlanningModelRequestType.KILL_ACTION_SEQUENCE.getName()));
			}
		}
		var commandStructure = oFF.InAPlanningModelRequestVersion.createVersionCommand(version, requestType.getName());
		this.addParametersToJson(request, commandStructure);
		commands.add(commandStructure);
	}
	oFF.XCollectionUtils.addIfNotNull(commands, oFF.InAPlanningModelRequestVersion.createGetParametersCommand(request));
	if (request.useStateUpdate() && requestType !== oFF.PlanningModelRequestType.DROP_VERSION)
	{
		commands.add(oFF.InAPlanningModelRequestVersion.createVersionCommand(version, "get_version_state"));
	}
	return inaRequestStructure;
};
oFF.InAPlanningModelRequestVersion.prototype.addParametersToJson = function(request, commandStructure) {};

oFF.InAPlanningModelCommand = function() {};
oFF.InAPlanningModelCommand.prototype = new oFF.QInAComponentWithStructure();
oFF.InAPlanningModelCommand.prototype._ff_c = "InAPlanningModelCommand";

oFF.InAPlanningModelCommand.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.PLANNING_MODEL_COMMAND;
};
oFF.InAPlanningModelCommand.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var command = modelComponent;
	var result = command.getResult();
	oFF.InAHelper.importMessages(inaStructure, importer);
	var returnCode = oFF.InAPlanningHelper.getResponsesReturnCodeStrict(inaStructure, importer);
	result.setReturnCode(returnCode);
	if (importer.hasErrors() || returnCode !== 0)
	{
		return null;
	}
	if (!this.processResponseStructureInternal(command, inaStructure))
	{
		importer.addErrorExt(oFF.OriginLayer.DRIVER, oFF.ErrorCodes.PARSER_ERROR, "error in processing response structure", inaStructure);
		return null;
	}
	return command;
};
oFF.InAPlanningModelCommand.prototype.processResponseStructureInternal = function(command, responseStructure)
{
	var commands = oFF.InAPlanningHelper.getCommandsList(command.serializeToElement(oFF.QModelFormat.INA_DATA).asStructure());
	if (oFF.isNull(commands))
	{
		return false;
	}
	var responses = oFF.InAPlanningHelper.getResponsesList(responseStructure);
	if (oFF.isNull(responses))
	{
		return false;
	}
	var commandType = command.getPlanningContextCommandType();
	if (commandType !== oFF.PlanningContextCommandType.REFRESH && commandType !== oFF.PlanningContextCommandType.RESET && commandType !== oFF.PlanningContextCommandType.SAVE && commandType !== oFF.PlanningContextCommandType.BACKUP && commandType !== oFF.PlanningContextCommandType.CLOSE && commandType !== oFF.PlanningContextCommandType.HARD_DELETE)
	{
		throw oFF.XException.createIllegalStateException("illegal command type");
	}
	var model = command.getPlanningModel();
	if (commandType === oFF.PlanningContextCommandType.REFRESH || commandType === oFF.PlanningContextCommandType.HARD_DELETE)
	{
		if (!this.refreshResponseStructrue(commands, responses, model))
		{
			if (!model.isModelInitialized())
			{
				return false;
			}
		}
		else
		{
			model.setModelInitialized();
		}
	}
	if (!oFF.PlanningModelCommandHelper.processResponseGetVersions(commands, responses, model))
	{
		return false;
	}
	if (commandType === oFF.PlanningContextCommandType.HARD_DELETE)
	{
		var versions = model.getVersions();
		return versions.size() <= 0;
	}
	return true;
};
oFF.InAPlanningModelCommand.prototype.refreshResponseStructrue = function(commands, responses, model)
{
	if (!oFF.InAPlanningHelper.processResponseGetQuerySources(commands, responses, model))
	{
		return false;
	}
	if (!oFF.InAPlanningHelper.processResponseGetActions(commands, responses, model))
	{
		return false;
	}
	if (!oFF.InAPlanningHelper.processResponseGetParametersForModelTemplate(commands, responses, model))
	{
		return false;
	}
	return oFF.InAPlanningHelper.processResponseGetActionParameters(commands, responses, model);
};
oFF.InAPlanningModelCommand.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var command = modelComponent;
	var model = command.getPlanningModel();
	var request = oFF.PrFactory.createStructure();
	var commandList = oFF.InAPlanningHelper.createCommandsList(request);
	this.fillCommandList(command, commandList, command.getPlanningContextCommandType());
	commandList.add(oFF.InAPlanningHelper.createModelCommand(model, "get_versions"));
	return request;
};
oFF.InAPlanningModelCommand.prototype.fillCommandList = function(command, commandList, commandType)
{
	if (commandType === oFF.PlanningContextCommandType.RESET)
	{
		this.addCommandPerActiveVersionToList(command, commandList, "close");
		this.addCommandPerActiveVersionToList(command, commandList, "init");
		return;
	}
	if (commandType === oFF.PlanningContextCommandType.SAVE)
	{
		this.addCommandPerActiveVersionToList(command, commandList, "save");
		return;
	}
	if (commandType === oFF.PlanningContextCommandType.BACKUP)
	{
		this.addCommandPerActiveVersionToList(command, commandList, "backup");
		return;
	}
	if (commandType === oFF.PlanningContextCommandType.CLOSE)
	{
		this.addCommandPerActiveVersionToList(command, commandList, "close");
		return;
	}
	if (commandType === oFF.PlanningContextCommandType.REFRESH || commandType === oFF.PlanningContextCommandType.HARD_DELETE)
	{
		if (commandType === oFF.PlanningContextCommandType.HARD_DELETE)
		{
			commandList.add(oFF.InAPlanningHelper.createModelCommand(command.getPlanningModel(), "delete_all_versions"));
		}
		this.addRefreshCommandsToList(command, commandList);
		return;
	}
	throw oFF.XException.createIllegalStateException("illegal command type");
};
oFF.InAPlanningModelCommand.prototype.addCommandPerActiveVersionToList = function(command, commandList, commandName)
{
	var versions = command.getPlanningModel().getActiveVersions();
	for (var i = 0; i < versions.size(); i++)
	{
		var version = versions.get(i);
		var commandStructure = oFF.InAPlanningHelper.createVersionCommand(version, commandName);
		this.addParametersToJson(command, commandStructure);
		commandList.add(commandStructure);
	}
};
oFF.InAPlanningModelCommand.prototype.addRefreshCommandsToList = function(command, commandList)
{
	var model = command.getPlanningModel();
	if (!model.isModelInitialized())
	{
		commandList.add(oFF.InAPlanningHelper.createModelCommand(model, "get_query_sources"));
		commandList.add(oFF.InAPlanningHelper.createModelCommand(model, "get_actions"));
		if (model.supportsVersionParameters())
		{
			commandList.add(oFF.InAPlanningHelper.createModelCommand(model, "get_parameters"));
		}
		commandList.add(oFF.InAPlanningHelper.createModelCommand(model, "get_action_parameters"));
	}
};
oFF.InAPlanningModelCommand.prototype.addParametersToJson = function(command, parametersStructure) {};

oFF.InAPlanningAction = function() {};
oFF.InAPlanningAction.prototype = new oFF.QInAComponentWithStructure();
oFF.InAPlanningAction.prototype._ff_c = "InAPlanningAction";

oFF.InAPlanningAction.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.PLANNING_ACTION;
};
oFF.InAPlanningAction.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var planningAction = modelComponent;
	var result = planningAction.getResult();
	oFF.InAHelper.importMessages(inaStructure, importer);
	var returnCode = oFF.InAPlanningHelper.getResponsesReturnCodeStrict(inaStructure, importer);
	var responses = oFF.InAPlanningHelper.getResponsesList(inaStructure);
	if (oFF.isNull(responses))
	{
		if (returnCode === 0)
		{
			returnCode = -1;
		}
	}
	var commands = oFF.InAPlanningHelper.getCommandsList(planningAction.serializeToElement(oFF.QModelFormat.INA_DATA).asStructure());
	if (oFF.isNull(commands))
	{
		if (returnCode === 0)
		{
			returnCode = -1;
		}
	}
	var version = planningAction.getVersion();
	if (!oFF.InAPlanningHelper.processResponseGetVersionState(commands, responses, version))
	{
		if (returnCode === 0)
		{
			returnCode = -1;
		}
	}
	result.setReturnCode(returnCode);
	return planningAction;
};
oFF.InAPlanningAction.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var planningAction = modelComponent;
	var request = oFF.PrFactory.createStructure();
	var commands = oFF.InAPlanningHelper.createCommandsList(request);
	var command = this.addCommand(planningAction, commands, "action");
	var identifier = planningAction.getActionIdentifier();
	var actionId = identifier.getActionId();
	command.putString("action_id", actionId);
	var actionSequenceId = planningAction.getSequenceIdEffective();
	if (oFF.XStringUtils.isNotNullAndNotEmpty(actionSequenceId))
	{
		command.putString("sequence_id", actionSequenceId);
	}
	if (!planningAction.getVersion().isActionSequenceActive())
	{
		var actionDescription = planningAction.getDescription();
		if (oFF.XStringUtils.isNotNullAndNotEmpty(actionDescription))
		{
			command.putString("description", actionDescription);
		}
	}
	var actionParameters = planningAction.getActionParameters();
	if (oFF.notNull(actionParameters))
	{
		command.put("parameters", actionParameters);
	}
	else
	{
		if (planningAction.hasVariables())
		{
			var variables = planningAction.getVariableProcessor().getVariables();
			var parameterValues = command.putNewStructure("parameters");
			for (var i = 0; i < variables.size(); i++)
			{
				var variable = variables.get(i);
				if (variable.getVariableType().isTypeOf(oFF.VariableType.OPTION_LIST_VARIABLE))
				{
					var optionList = variable;
					var currentOption = optionList.getCurrentOption();
					parameterValues.putInteger(variable.getName(), oFF.XInteger.convertFromStringWithDefault(currentOption.getName(), -1));
				}
			}
		}
	}
	this.addCommand(planningAction, commands, "get_version_state");
	return request;
};
oFF.InAPlanningAction.prototype.addCommand = function(planningAction, commandsList, commandName)
{
	var version = planningAction.getVersion();
	var commandStructure = oFF.InAPlanningHelper.createVersionCommand(version, commandName);
	commandsList.add(commandStructure);
	return commandStructure;
};

oFF.InAPlanningModelRequestVersionClose = function() {};
oFF.InAPlanningModelRequestVersionClose.prototype = new oFF.InAPlanningModelRequestVersion();
oFF.InAPlanningModelRequestVersionClose.prototype._ff_c = "InAPlanningModelRequestVersionClose";

oFF.InAPlanningModelRequestVersionClose.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.PLANNING_VERSION_CLOSE_COMMAND;
};
oFF.InAPlanningModelRequestVersionClose.prototype.addParametersToJson = function(request, commandStructure)
{
	var closeRequest = request;
	var closeMode = closeRequest.getCloseMode();
	if (oFF.notNull(closeMode) && !closeMode.isOnlyClient())
	{
		commandStructure.putString("mode", closeMode.getName());
	}
};

oFF.InAPlanningModelRequestVersionEndActionSequence = function() {};
oFF.InAPlanningModelRequestVersionEndActionSequence.prototype = new oFF.InAPlanningModelRequestVersion();
oFF.InAPlanningModelRequestVersionEndActionSequence.prototype._ff_c = "InAPlanningModelRequestVersionEndActionSequence";

oFF.InAPlanningModelRequestVersionEndActionSequence.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.PLANNING_VERSION_END_ACTION_SEQUENCE_COMMAND;
};
oFF.InAPlanningModelRequestVersionEndActionSequence.prototype.addParametersToJson = function(request, commandStructure)
{
	var endRequest = request;
	var sequenceId = endRequest.getSequenceId();
	if (oFF.XStringUtils.isNullOrEmpty(sequenceId))
	{
		sequenceId = endRequest.getPlanningVersion().getActionSequenceId();
	}
	if (oFF.XStringUtils.isNotNullAndNotEmpty(sequenceId))
	{
		commandStructure.putString("sequence_id", sequenceId);
	}
	var description = endRequest.getDescription();
	if (oFF.XStringUtils.isNotNullAndNotEmpty(description))
	{
		commandStructure.putString("description", description);
	}
};

oFF.InAPlanningModelRequestVersionSetParameters = function() {};
oFF.InAPlanningModelRequestVersionSetParameters.prototype = new oFF.InAPlanningModelRequestVersion();
oFF.InAPlanningModelRequestVersionSetParameters.prototype._ff_c = "InAPlanningModelRequestVersionSetParameters";

oFF.InAPlanningModelRequestVersionSetParameters.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.PLANNING_VERSION_SET_PARAMETERS_COMMAND;
};
oFF.InAPlanningModelRequestVersionSetParameters.prototype.addParametersToJson = function(request, commandStructure)
{
	var setRequest = request;
	var versionParametersStructure = setRequest.getVersionParametersStructure();
	if (oFF.PrUtils.getStructureSize(versionParametersStructure, 0) > 0)
	{
		commandStructure.put("parameters", versionParametersStructure);
	}
};

oFF.InAPlanningModelRequestVersionSetTimeout = function() {};
oFF.InAPlanningModelRequestVersionSetTimeout.prototype = new oFF.InAPlanningModelRequestVersion();
oFF.InAPlanningModelRequestVersionSetTimeout.prototype._ff_c = "InAPlanningModelRequestVersionSetTimeout";

oFF.InAPlanningModelRequestVersionSetTimeout.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.PLANNING_VERSION_SET_TIMEOUT_COMMAND;
};
oFF.InAPlanningModelRequestVersionSetTimeout.prototype.addParametersToJson = function(request, commandStructure)
{
	var timeoutRequest = request;
	commandStructure.putInteger("timeout_value", timeoutRequest.getTimeout());
};

oFF.InAPlanningModelRequestVersionStartActionSequence = function() {};
oFF.InAPlanningModelRequestVersionStartActionSequence.prototype = new oFF.InAPlanningModelRequestVersion();
oFF.InAPlanningModelRequestVersionStartActionSequence.prototype._ff_c = "InAPlanningModelRequestVersionStartActionSequence";

oFF.InAPlanningModelRequestVersionStartActionSequence.processResponseStartActionSequence = function(commands, responses, response)
{
	var request = response.getPlanningModelRequestVersion();
	var commandName = request.getRequestType().getName();
	var commandResponse = oFF.InAPlanningHelper.getCommandResponse(commands, responses, commandName);
	if (oFF.isNull(commandResponse))
	{
		return false;
	}
	var sequenceIdString = oFF.PrUtils.getStringProperty(commandResponse, "sequence_id");
	if (oFF.isNull(sequenceIdString))
	{
		return false;
	}
	var sequenceId = sequenceIdString.getString();
	response.setSequenceId(sequenceId);
	var version = request.getPlanningVersion();
	version.setActionSequenceId(sequenceId);
	return true;
};
oFF.InAPlanningModelRequestVersionStartActionSequence.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.PLANNING_VERSION_START_ACTION_SEQUENCE_COMMAND;
};
oFF.InAPlanningModelRequestVersionStartActionSequence.prototype.addParametersToJson = function(request, commandStructure)
{
	var startRequest = request;
	var sequenceId = startRequest.getSequenceId();
	if (oFF.XStringUtils.isNotNullAndNotEmpty(sequenceId))
	{
		commandStructure.putString("sequence_id", sequenceId);
	}
	var description = startRequest.getDescription();
	if (oFF.XStringUtils.isNotNullAndNotEmpty(description))
	{
		commandStructure.putString("description", description);
	}
};
oFF.InAPlanningModelRequestVersionStartActionSequence.prototype.importInternal = function(request, commands, responses)
{
	var startRequest = request;
	var result = startRequest.getResult();
	return oFF.InAPlanningModelRequestVersionStartActionSequence.processResponseStartActionSequence(commands, responses, result);
};

oFF.InAPlanningModelRequestVersionStateDescriptions = function() {};
oFF.InAPlanningModelRequestVersionStateDescriptions.prototype = new oFF.InAPlanningModelRequestVersion();
oFF.InAPlanningModelRequestVersionStateDescriptions.prototype._ff_c = "InAPlanningModelRequestVersionStateDescriptions";

oFF.InAPlanningModelRequestVersionStateDescriptions.processResponseStateDescriptions = function(commands, responses, response)
{
	var request = response.getPlanningModelRequestVersion();
	var commandName = request.getRequestType().getName();
	var commandResponse = oFF.InAPlanningHelper.getCommandResponse(commands, responses, commandName);
	if (oFF.isNull(commandResponse))
	{
		return false;
	}
	var versionStateStructure = oFF.PrUtils.getStructureProperty(commandResponse, "version_state_descriptions");
	if (oFF.isNull(versionStateStructure))
	{
		return false;
	}
	var version = request.getPlanningVersion();
	var actionDescriptionResponse = response;
	actionDescriptionResponse.setVersionDescription(version.getVersionDescription());
	var identifier = oFF.PlanningVersionIdentifier.create(version.getVersionId(), version.isSharedVersion(), version.getVersionOwner());
	actionDescriptionResponse.setVersionIdentifier(identifier);
	var availableUndos = versionStateStructure.getIntegerByKey("available_undo");
	actionDescriptionResponse.setAvailableUndos(availableUndos);
	var availableRedos = versionStateStructure.getIntegerByKey("available_redo");
	actionDescriptionResponse.setAvailableRedos(availableRedos);
	var descriptions = oFF.InAPlanningModelRequestVersionStateDescriptions.getVersionStateDescriptionList(versionStateStructure);
	actionDescriptionResponse.setVersionStateDescriptions(descriptions);
	return true;
};
oFF.InAPlanningModelRequestVersionStateDescriptions.getVersionStateDescriptionList = function(stateDescriptionsStructure)
{
	var statesList = oFF.PrUtils.getListProperty(stateDescriptionsStructure, "states");
	if (oFF.isNull(statesList))
	{
		return null;
	}
	var descriptions = oFF.XList.create();
	for (var i = 0; i < statesList.size(); i++)
	{
		var stateDescription = oFF.InAPlanningModelRequestVersionStateDescriptions.getVersionStateDescription(statesList.getStructureAt(i));
		if (oFF.isNull(stateDescription))
		{
			continue;
		}
		descriptions.add(stateDescription);
	}
	return descriptions;
};
oFF.InAPlanningModelRequestVersionStateDescriptions.getVersionStateDescription = function(stateDescriptionStructure)
{
	var identifier = stateDescriptionStructure.getStringByKey("id");
	if (oFF.XStringUtils.isNullOrEmpty(identifier))
	{
		return null;
	}
	var integerProperty = oFF.PrUtils.getIntegerProperty(stateDescriptionStructure, "changes");
	if (oFF.isNull(integerProperty))
	{
		return null;
	}
	var startTime = oFF.PrUtils.getDateTimeProperty(stateDescriptionStructure, "start_time", false, null);
	if (oFF.isNull(startTime))
	{
		return null;
	}
	var endTime = oFF.PrUtils.getDateTimeProperty(stateDescriptionStructure, "end_time", false, null);
	if (oFF.isNull(endTime))
	{
		return null;
	}
	var description = stateDescriptionStructure.getStringByKey("description");
	var userName = stateDescriptionStructure.getStringByKey("user_name");
	return oFF.PlanningVersionStateDescription.create(identifier, description, userName, startTime, endTime, integerProperty.getInteger());
};
oFF.InAPlanningModelRequestVersionStateDescriptions.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.PLANNING_VERSION_STATE_DESCRIPTIONS_COMMAND;
};
oFF.InAPlanningModelRequestVersionStateDescriptions.prototype.addParametersToJson = function(request, commandStructure)
{
	var descriptionRequest = request;
	var startIndex = descriptionRequest.getStartIndex();
	if (startIndex !== 0)
	{
		commandStructure.putInteger("start", startIndex);
		var count = descriptionRequest.getCount();
		if (count !== 0)
		{
			commandStructure.putInteger("count", count);
		}
	}
};
oFF.InAPlanningModelRequestVersionStateDescriptions.prototype.importInternal = function(request, commands, responses)
{
	var startRequest = request;
	var result = startRequest.getResult();
	return oFF.InAPlanningModelRequestVersionStateDescriptions.processResponseStateDescriptions(commands, responses, result);
};

oFF.InAPlanningModelRequestVersionUndoRedo = function() {};
oFF.InAPlanningModelRequestVersionUndoRedo.prototype = new oFF.InAPlanningModelRequestVersion();
oFF.InAPlanningModelRequestVersionUndoRedo.prototype._ff_c = "InAPlanningModelRequestVersionUndoRedo";

oFF.InAPlanningModelRequestVersionUndoRedo.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.PLANNING_VERSION_UNDO_REDO_COMMAND;
};
oFF.InAPlanningModelRequestVersionUndoRedo.prototype.addParametersToJson = function(request, commandStructure)
{
	var undoRedoRequest = request;
	var steps = undoRedoRequest.getSteps();
	if (steps > 0)
	{
		commandStructure.putInteger("num_undo_redo_steps", steps);
	}
};

oFF.InAPlanningModelCloseCommand = function() {};
oFF.InAPlanningModelCloseCommand.prototype = new oFF.InAPlanningModelCommand();
oFF.InAPlanningModelCloseCommand.prototype._ff_c = "InAPlanningModelCloseCommand";

oFF.InAPlanningModelCloseCommand.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.PLANNING_MODEL_CLOSE_COMMAND;
};
oFF.InAPlanningModelCloseCommand.prototype.addParametersToJson = function(command, parametersStructure)
{
	var closeCommand = command;
	var closeMode = closeCommand.getCloseMode();
	if (oFF.isNull(closeMode))
	{
		closeMode = oFF.CloseModeType.BACKUP;
	}
	parametersStructure.putString("mode", closeMode.getName());
};

oFF.InAPlanningVarProvider = function() {};
oFF.InAPlanningVarProvider.prototype = new oFF.DfOlapEnvContext();
oFF.InAPlanningVarProvider.prototype._ff_c = "InAPlanningVarProvider";

oFF.InAPlanningVarProvider.prototype.m_connection = null;
oFF.InAPlanningVarProvider.prototype.m_activeMainCapabilities = null;
oFF.InAPlanningVarProvider.prototype.m_importVariables = null;
oFF.InAPlanningVarProvider.prototype.m_export = null;
oFF.InAPlanningVarProvider.prototype.m_isVariableSubmitNeeded = false;
oFF.InAPlanningVarProvider.prototype.m_supportsReInitVariables = false;
oFF.InAPlanningVarProvider.prototype.m_directVariableTransfer = false;
oFF.InAPlanningVarProvider.prototype.m_supportsCheckVariables = false;
oFF.InAPlanningVarProvider.prototype.m_supportsVariableMasking = false;
oFF.InAPlanningVarProvider.prototype.setupVariablesProvider = function(application, connection, activeMainCapabilities)
{
	this.setupOlapApplicationContext(application.getOlapEnvironment());
	this.m_connection = connection;
	this.m_activeMainCapabilities = activeMainCapabilities;
	var capabilityModel = oFF.QCapabilities.create();
	oFF.InACapabilitiesProvider.importCapabilities(activeMainCapabilities, capabilityModel);
	this.m_export = oFF.QInAExportFactory.createForData(application, capabilityModel);
	this.m_importVariables = oFF.QInAImportFactory.createForMetadata(application, capabilityModel);
	this.m_isVariableSubmitNeeded = true;
	this.m_supportsCheckVariables = true;
	this.m_supportsReInitVariables = capabilityModel.supportsReInitVariables();
	this.m_supportsVariableMasking = capabilityModel.supportsVariableMasking();
};
oFF.InAPlanningVarProvider.prototype.releaseObject = function()
{
	this.m_connection = null;
	this.m_activeMainCapabilities = null;
	this.m_export = oFF.XObjectExt.release(this.m_export);
	this.m_importVariables = oFF.XObjectExt.release(this.m_importVariables);
	oFF.DfOlapEnvContext.prototype.releaseObject.call( this );
};
oFF.InAPlanningVarProvider.prototype.getConnection = function()
{
	return this.m_connection;
};
oFF.InAPlanningVarProvider.prototype.getSystemDescription = function()
{
	return this.m_connection.getSystemDescription();
};
oFF.InAPlanningVarProvider.prototype.getSystemName = function()
{
	var systemDescription = this.getSystemDescription();
	if (oFF.isNull(systemDescription))
	{
		return null;
	}
	return systemDescription.getSystemName();
};
oFF.InAPlanningVarProvider.prototype.getSystemType = function()
{
	return this.getSystemDescription().getSystemType();
};
oFF.InAPlanningVarProvider.prototype.getRequestPath = function()
{
	var fastPathCap = this.m_activeMainCapabilities.getByKey(oFF.InACapabilities.C032_FAST_PATH);
	if (oFF.notNull(fastPathCap) && fastPathCap.getValue() !== null)
	{
		return fastPathCap.getValue();
	}
	var systemDescription = this.m_connection.getSystemDescription();
	return systemDescription.getSystemType().getInAPath();
};
oFF.InAPlanningVarProvider.prototype.createFunction = function()
{
	return this.createFunctionExt(true);
};
oFF.InAPlanningVarProvider.prototype.createFunctionExt = function(batchable)
{
	var path = this.getRequestPath();
	var ocpFunction = batchable ? this.m_connection.newRpcFunction(path) : this.m_connection.newRpcFunctionForNonBatchableQuery(path);
	var request = ocpFunction.getRpcRequest();
	request.setMethod(oFF.HttpRequestMethod.HTTP_POST);
	return ocpFunction;
};
oFF.InAPlanningVarProvider.prototype.getVariablesExporter = function()
{
	return this.m_export;
};
oFF.InAPlanningVarProvider.prototype.getVariablesImporter = function()
{
	return this.m_importVariables;
};
oFF.InAPlanningVarProvider.prototype.isVariableValuesRuntimeNeeded = function()
{
	return false;
};
oFF.InAPlanningVarProvider.prototype.isVariableSubmitNeeded = function()
{
	return this.m_isVariableSubmitNeeded;
};
oFF.InAPlanningVarProvider.prototype.setIsVariableSubmitNeeded = function(submit)
{
	this.m_isVariableSubmitNeeded = submit;
};
oFF.InAPlanningVarProvider.prototype.supportsReInitVariables = function()
{
	return this.m_supportsReInitVariables;
};
oFF.InAPlanningVarProvider.prototype.supportsVariableMasking = function()
{
	return this.m_supportsVariableMasking;
};
oFF.InAPlanningVarProvider.prototype.processRetrieveVariableRuntimeInformation = oFF.noSupport;
oFF.InAPlanningVarProvider.prototype.processSetGetVariableValues = oFF.noSupport;
oFF.InAPlanningVarProvider.prototype.processVariableSubmit = oFF.noSupport;
oFF.InAPlanningVarProvider.prototype.processReInitVariableAfterSubmit = oFF.noSupport;
oFF.InAPlanningVarProvider.prototype.processVariableCancel = oFF.noSupport;
oFF.InAPlanningVarProvider.prototype.importVariables = oFF.noSupport;
oFF.InAPlanningVarProvider.prototype.exportVariables = oFF.noSupport;
oFF.InAPlanningVarProvider.prototype.setDirectVariableTransfer = function(directVariableTransfer)
{
	this.m_directVariableTransfer = directVariableTransfer;
};
oFF.InAPlanningVarProvider.prototype.isDirectVariableTransfer = function()
{
	return this.m_directVariableTransfer;
};
oFF.InAPlanningVarProvider.prototype.supportsCheckVariables = function()
{
	return this.m_supportsCheckVariables && this.isDirectVariableTransfer();
};
oFF.InAPlanningVarProvider.prototype.processCheckVariables = oFF.noSupport;
oFF.InAPlanningVarProvider.prototype.supportsDirectVariableTransfer = oFF.noSupport;
oFF.InAPlanningVarProvider.prototype.processActivateVariableVariant = oFF.noSupport;
oFF.InAPlanningVarProvider.prototype.processDeleteVariableVariant = oFF.noSupport;
oFF.InAPlanningVarProvider.prototype.processUpdateVariableVariantValues = oFF.noSupport;
oFF.InAPlanningVarProvider.prototype.processSaveVariableVariant = oFF.noSupport;
oFF.InAPlanningVarProvider.prototype.processEmptyVariableDefinition = oFF.noSupport;
oFF.InAPlanningVarProvider.prototype.processUpdateDynamicVariables = oFF.noSupport;
oFF.InAPlanningVarProvider.prototype.processResetExitOrDynamicVariable = oFF.noSupport;

oFF.InAPlanningModelRequestVersionInit = function() {};
oFF.InAPlanningModelRequestVersionInit.prototype = new oFF.InAPlanningModelRequestVersionSetParameters();
oFF.InAPlanningModelRequestVersionInit.prototype._ff_c = "InAPlanningModelRequestVersionInit";

oFF.InAPlanningModelRequestVersionInit.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.PLANNING_VERSION_INIT_COMMAND;
};
oFF.InAPlanningModelRequestVersionInit.prototype.addParametersToJson = function(request, commandStructure)
{
	oFF.InAPlanningModelRequestVersionSetParameters.prototype.addParametersToJson.call( this , request, commandStructure);
	var initRequest = request;
	var description = initRequest.getPlanningVersion().getVersionDescription();
	if (oFF.XStringUtils.isNotNullAndNotEmpty(description))
	{
		commandStructure.putString("description", description);
	}
	var restoreBackupType = initRequest.getRestoreBackupType();
	if (oFF.notNull(restoreBackupType))
	{
		if (oFF.RestoreBackupType.RESTORE_TRUE === restoreBackupType)
		{
			commandStructure.putBoolean("restore_backup", true);
		}
		else if (oFF.RestoreBackupType.RESTORE_FALSE === restoreBackupType)
		{
			commandStructure.putBoolean("restore_backup", false);
		}
	}
};

oFF.InAPlanningVarProcessorProvider = function() {};
oFF.InAPlanningVarProcessorProvider.prototype = new oFF.InAPlanningVarProvider();
oFF.InAPlanningVarProcessorProvider.prototype._ff_c = "InAPlanningVarProcessorProvider";

oFF.InAPlanningVarProcessorProvider.createInAVariableProcessorProvider = function(dataSource, variableRequestor, requestorProvider)
{
	var provider = new oFF.InAPlanningVarProcessorProvider();
	provider.setupInAVariableProcessorProvider(dataSource, variableRequestor, requestorProvider);
	return provider;
};
oFF.InAPlanningVarProcessorProvider.prototype.m_processor = null;
oFF.InAPlanningVarProcessorProvider.prototype.m_requestorProvider = null;
oFF.InAPlanningVarProcessorProvider.prototype.m_variableRequestorBase = null;
oFF.InAPlanningVarProcessorProvider.prototype.setupInAVariableProcessorProvider = function(dataSource, variableRequestorBase, requestorProvider)
{
	var application = variableRequestorBase.getApplication();
	var systemName = variableRequestorBase.getSystemName();
	var connection = application.getConnectionPool().getConnection(systemName);
	var serverMetadata = application.getConnectionPool().getSystemConnect(systemName).getServerMetadata();
	var capabilities = serverMetadata.getMetadataForService(oFF.ServerService.ANALYTIC);
	this.setupVariablesProvider(application, connection, capabilities);
	this.m_requestorProvider = requestorProvider;
	this.m_variableRequestorBase = variableRequestorBase;
	var context = this.getOlapEnv().getContext();
	this.m_processor = oFF.QVariableProcessor.createVariableProcessor(context, dataSource, this, this.m_variableRequestorBase);
	this.m_variableRequestorBase.setVariableProcessorBase(this.m_processor);
};
oFF.InAPlanningVarProcessorProvider.prototype.releaseObject = function()
{
	this.m_processor = oFF.XObjectExt.release(this.m_processor);
	this.m_requestorProvider = null;
	this.m_variableRequestorBase = null;
	oFF.InAPlanningVarProvider.prototype.releaseObject.call( this );
};
oFF.InAPlanningVarProcessorProvider.prototype.importVariables = function(variablesList, variableContext)
{
	var wrapper = oFF.PrFactory.createStructure();
	wrapper.put("Variables", variablesList);
	this.m_importVariables.importVariables(wrapper, variableContext);
};
oFF.InAPlanningVarProcessorProvider.prototype.exportVariables = function(variablesContext, parentStructure)
{
	var variableList = this.m_export.exportVariableList(variablesContext);
	parentStructure.putNotNullAndNotEmpty("Variables", variableList);
};
oFF.InAPlanningVarProcessorProvider.prototype.processRetrieveVariableRuntimeInformation = function(syncType, listener, customIdentifier)
{
	return oFF.InAPlanningVarGetRuntimeInfoAction.createAndRun(this, syncType, listener, customIdentifier);
};
oFF.InAPlanningVarProcessorProvider.prototype.processSetGetVariableValues = function(syncType, listener, customIdentifier)
{
	return oFF.InAPlanningVarSetGetValuesAction.createAndRun(this, syncType, listener, customIdentifier);
};
oFF.InAPlanningVarProcessorProvider.prototype.processVariableSubmit = function(syncType, listener, customIdentifier)
{
	return oFF.InAPlanningVarSubmitAction.createAndRun(this, syncType, listener, customIdentifier);
};
oFF.InAPlanningVarProcessorProvider.prototype.processReInitVariableAfterSubmit = function(syncType, listener, customIdentifier)
{
	return oFF.InAPlanningVarReInitAfterSubmitAction.createAndRun(this, syncType, listener, customIdentifier);
};
oFF.InAPlanningVarProcessorProvider.prototype.processVariableCancel = function(syncType, listener, customIdentifier)
{
	return oFF.InAPlanningVarCancelAction.createAndRun(this, syncType, listener, customIdentifier);
};
oFF.InAPlanningVarProcessorProvider.prototype.processCheckVariables = function(syncType, listener, customIdentifier)
{
	return oFF.InAPlanningVarCheckVariablesAction.createAndRun(this, syncType, listener, customIdentifier);
};
oFF.InAPlanningVarProcessorProvider.prototype.getRequestorProvider = function()
{
	return this.m_requestorProvider;
};
oFF.InAPlanningVarProcessorProvider.prototype.getVariableProcessor = function()
{
	return this.m_processor;
};
oFF.InAPlanningVarProcessorProvider.prototype.getContext = function()
{
	return null;
};
oFF.InAPlanningVarProcessorProvider.prototype.supportsMaintainsVariableVariants = function()
{
	return this.m_processor.supportsMaintainsVariableVariants();
};

oFF.InAPlanningVarAction = function() {};
oFF.InAPlanningVarAction.prototype = new oFF.QOlapSyncAction();
oFF.InAPlanningVarAction.prototype._ff_c = "InAPlanningVarAction";

oFF.InAPlanningVarAction.prototype.doStrictVariableProcessing = function()
{
	var parent = this.getActionContext();
	if (oFF.isNull(parent))
	{
		return false;
	}
	var application = parent.getApplication();
	return oFF.notNull(application);
};
oFF.InAPlanningVarAction.prototype.getProcessor = function()
{
	return this.getActionContext().getVariableProcessor();
};
oFF.InAPlanningVarAction.prototype.checkDirectValueTransfer = function()
{
	if (!this.doStrictVariableProcessing())
	{
		return;
	}
	var variableProcessor = this.getActionContext().getVariableProcessor();
	if (oFF.isNull(variableProcessor))
	{
		return;
	}
	if (variableProcessor.isDirectVariableTransferEnabled())
	{
		throw oFF.XException.createIllegalStateException("stateful variable handling cannot be mixed with direct variable transfer");
	}
};
oFF.InAPlanningVarAction.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onVariableProcessorExecuted(extResult, data, customIdentifier);
};
oFF.InAPlanningVarAction.prototype.createFunction = function()
{
	return this.getActionContext().createFunction();
};
oFF.InAPlanningVarAction.prototype.setVariablesStructure = function(rootElement)
{
	if (oFF.notNull(rootElement))
	{
		var deepCopy = oFF.PrFactory.createStructureDeepCopy(rootElement);
		var provider = this.getActionContext();
		oFF.PlanningState.update(provider.getApplication(), provider.getSystemName(), deepCopy, this);
		if (!oFF.InAHelper.importMessages(deepCopy, this))
		{
			var cubeStructure = deepCopy.getStructureByKey("Cube");
			if (oFF.isNull(cubeStructure))
			{
				var message2 = deepCopy.toString();
				this.addError(oFF.ErrorCodes.PARSER_ERROR, message2);
				return false;
			}
			var importer = this.getImporter();
			var processor = this.getProcessor();
			importer.importVariables(cubeStructure, processor.getVariableContainerBase());
			return true;
		}
	}
	return false;
};
oFF.InAPlanningVarAction.prototype.setStructure = function(rootElement)
{
	if (oFF.notNull(rootElement))
	{
		var deepCopy = oFF.PrFactory.createStructureDeepCopy(rootElement);
		var provider = this.getActionContext();
		oFF.PlanningState.update(provider.getApplication(), provider.getSystemName(), deepCopy, this);
		return !oFF.InAHelper.importMessages(deepCopy, this);
	}
	return false;
};
oFF.InAPlanningVarAction.prototype.getImporter = function()
{
	return this.getActionContext().getVariablesImporter();
};
oFF.InAPlanningVarAction.prototype.getExporter = function()
{
	return this.getActionContext().getVariablesExporter();
};
oFF.InAPlanningVarAction.prototype.isSuccessfullyProcessed = function()
{
	return this.isValid();
};
oFF.InAPlanningVarAction.prototype.getRequestorProvider = function()
{
	return this.getActionContext().getRequestorProvider();
};

oFF.InAPlanningVarCancelAction = function() {};
oFF.InAPlanningVarCancelAction.prototype = new oFF.InAPlanningVarAction();
oFF.InAPlanningVarCancelAction.prototype._ff_c = "InAPlanningVarCancelAction";

oFF.InAPlanningVarCancelAction.createAndRun = function(parent, syncType, listener, customIdentifier)
{
	var newObject = new oFF.InAPlanningVarCancelAction();
	newObject.setupActionAndRun(syncType, listener, customIdentifier, parent);
	return newObject;
};
oFF.InAPlanningVarCancelAction.prototype.processSynchronization = function(syncType)
{
	return false;
};
oFF.InAPlanningVarCancelAction.prototype.onFunctionExecuted = function(extResult, response, customIdentifier)
{
	this.addAllMessages(extResult);
	if (extResult.isValid() && oFF.notNull(response))
	{
		this.getQueryManagerBase().setVariableProcessorState(oFF.VariableProcessorState.SUBMITTED);
	}
	this.setData(this);
	this.endSync();
};

oFF.InAPlanningVarCheckVariablesAction = function() {};
oFF.InAPlanningVarCheckVariablesAction.prototype = new oFF.InAPlanningVarAction();
oFF.InAPlanningVarCheckVariablesAction.prototype._ff_c = "InAPlanningVarCheckVariablesAction";

oFF.InAPlanningVarCheckVariablesAction.createAndRun = function(parent, syncType, listener, customIdentifier)
{
	var newObject = new oFF.InAPlanningVarCheckVariablesAction();
	newObject.setupActionAndRun(syncType, listener, customIdentifier, parent);
	return newObject;
};
oFF.InAPlanningVarCheckVariablesAction.prototype.processSynchronization = function(syncType)
{
	return false;
};
oFF.InAPlanningVarCheckVariablesAction.prototype.onFunctionExecuted = function(extResult, response, customIdentifier)
{
	this.addAllMessages(extResult);
	if (extResult.isValid() && oFF.notNull(response))
	{
		var rootElement = response.getRootElement();
		this.setStructure(rootElement);
	}
	this.setData(this);
	this.endSync();
};

oFF.InAPlanningVarGetRuntimeInfoAction = function() {};
oFF.InAPlanningVarGetRuntimeInfoAction.prototype = new oFF.InAPlanningVarAction();
oFF.InAPlanningVarGetRuntimeInfoAction.prototype._ff_c = "InAPlanningVarGetRuntimeInfoAction";

oFF.InAPlanningVarGetRuntimeInfoAction.createAndRun = function(parent, syncType, listener, customIdentifier)
{
	var newObject = new oFF.InAPlanningVarGetRuntimeInfoAction();
	newObject.setupActionAndRun(syncType, listener, customIdentifier, parent);
	return newObject;
};
oFF.InAPlanningVarGetRuntimeInfoAction.prototype.processSynchronization = function(syncType)
{
	this.checkDirectValueTransfer();
	var ocpFunction = this.createFunction();
	var requestStructure = oFF.PrFactory.createStructure();
	var requestorProvider = this.getRequestorProvider();
	requestorProvider.fillVariableRequestorDataRequestContext(requestStructure, false, "VariableDefinition");
	this.getProcessor().setVariableProcessorState(oFF.VariableProcessorState.PROCESSING_UPDATE_VALUES);
	ocpFunction.getRpcRequest().setRequestStructure(requestStructure);
	ocpFunction.processFunctionExecution(syncType, this, null);
	return true;
};
oFF.InAPlanningVarGetRuntimeInfoAction.prototype.onFunctionExecuted = function(extResult, response, customIdentifier)
{
	this.addAllMessages(extResult);
	if (extResult.isValid() && oFF.notNull(response))
	{
		var rootElement = response.getRootElement();
		var successfullyProcessed = this.setVariablesStructure(rootElement);
		if (successfullyProcessed)
		{
			this.getProcessor().setVariableProcessorState(oFF.VariableProcessorState.CHANGEABLE_REINIT);
		}
		else
		{
			this.addError(oFF.ErrorCodes.OTHER_ERROR, "Error when setting variable structure");
		}
	}
	this.setData(this);
	this.endSync();
};

oFF.InAPlanningVarReInitAfterSubmitAction = function() {};
oFF.InAPlanningVarReInitAfterSubmitAction.prototype = new oFF.InAPlanningVarAction();
oFF.InAPlanningVarReInitAfterSubmitAction.prototype._ff_c = "InAPlanningVarReInitAfterSubmitAction";

oFF.InAPlanningVarReInitAfterSubmitAction.createAndRun = function(parent, syncType, listener, customIdentifier)
{
	var newObject = new oFF.InAPlanningVarReInitAfterSubmitAction();
	newObject.setupActionAndRun(syncType, listener, customIdentifier, parent);
	return newObject;
};
oFF.InAPlanningVarReInitAfterSubmitAction.prototype.processSynchronization = function(syncType)
{
	return false;
};
oFF.InAPlanningVarReInitAfterSubmitAction.prototype.onVariableProcessorExecuted = function(extResult, result, customIdentifier)
{
	this.addAllMessages(extResult);
	this.setData(this);
	this.endSync();
};

oFF.InAPlanningVarSetGetValuesAction = function() {};
oFF.InAPlanningVarSetGetValuesAction.prototype = new oFF.InAPlanningVarAction();
oFF.InAPlanningVarSetGetValuesAction.prototype._ff_c = "InAPlanningVarSetGetValuesAction";

oFF.InAPlanningVarSetGetValuesAction.createAndRun = function(parent, syncType, listener, customIdentifier)
{
	var newObject = new oFF.InAPlanningVarSetGetValuesAction();
	newObject.setupActionAndRun(syncType, listener, customIdentifier, parent);
	return newObject;
};
oFF.InAPlanningVarSetGetValuesAction.prototype.processSynchronization = function(syncType)
{
	var planningService = this.getRequestorProvider().getPlanningContext().getPlanningService();
	if (planningService.supportsPlanningValueHelp())
	{
		this.checkDirectValueTransfer();
		var ocpFunction = this.createFunction();
		var requestStructure = oFF.PrFactory.createStructure();
		var requestorProvider = this.getRequestorProvider();
		requestorProvider.fillVariableRequestorDataRequestContext(requestStructure, true, "VariableDefinition");
		ocpFunction.getRpcRequest().setRequestStructure(requestStructure);
		ocpFunction.processFunctionExecution(syncType, this, null);
		return true;
	}
	return false;
};
oFF.InAPlanningVarSetGetValuesAction.prototype.onFunctionExecuted = function(extResult, response, customIdentifier)
{
	this.addAllMessages(extResult);
	if (extResult.isValid() && oFF.notNull(response))
	{
		var rootElement = response.getRootElement();
		if (!this.setVariablesStructure(rootElement))
		{
			this.addError(oFF.ErrorCodes.OTHER_ERROR, "Error when setting variable structure");
		}
	}
	this.setData(this);
	this.endSync();
};

oFF.InAPlanningVarSubmitAction = function() {};
oFF.InAPlanningVarSubmitAction.prototype = new oFF.InAPlanningVarAction();
oFF.InAPlanningVarSubmitAction.prototype._ff_c = "InAPlanningVarSubmitAction";

oFF.InAPlanningVarSubmitAction.createAndRun = function(parent, syncType, listener, customIdentifier)
{
	var newObject = new oFF.InAPlanningVarSubmitAction();
	newObject.setupActionAndRun(syncType, listener, customIdentifier, parent);
	return newObject;
};
oFF.InAPlanningVarSubmitAction.prototype.processSynchronization = function(syncType)
{
	this.checkDirectValueTransfer();
	if (!this.getActionContext().isVariableSubmitNeeded())
	{
		this.setData(this);
		return false;
	}
	var ocpFunction = this.createFunction();
	var requestStructure = oFF.PrFactory.createStructure();
	var requestorProvider = this.getRequestorProvider();
	var inaDefinition = requestorProvider.fillVariableRequestorDataRequestContext(requestStructure, false, "VariableSubmit");
	this.getExporter().exportVariables(this.getProcessor().getVariableContainer(), inaDefinition);
	ocpFunction.getRpcRequest().setRequestStructure(requestStructure);
	ocpFunction.processFunctionExecution(syncType, this, null);
	return true;
};
oFF.InAPlanningVarSubmitAction.prototype.onFunctionExecuted = function(extResult, response, customIdentifier)
{
	this.addAllMessages(extResult);
	if (extResult.isValid() && oFF.notNull(response))
	{
		var rootElement = response.getRootElement();
		var successfullyProcessed = this.setStructure(rootElement);
		this.getProcessor().setVariableProcessorState(oFF.VariableProcessorState.SUBMITTED);
		if (!successfullyProcessed)
		{
			this.addError(oFF.ErrorCodes.OTHER_ERROR, "Error when setting variable structure");
		}
	}
	this.setData(this);
	this.endSync();
};

oFF.IpProviderModule = function() {};
oFF.IpProviderModule.prototype = new oFF.DfModule();
oFF.IpProviderModule.prototype._ff_c = "IpProviderModule";

oFF.IpProviderModule.s_module = null;
oFF.IpProviderModule.getInstance = function()
{
	if (oFF.isNull(oFF.IpProviderModule.s_module))
	{
		oFF.DfModule.checkInitialized(oFF.IpImplModule.getInstance());
		oFF.DfModule.checkInitialized(oFF.ProviderModule.getInstance());
		oFF.IpProviderModule.s_module = oFF.DfModule.startExt(new oFF.IpProviderModule());
		oFF.QInA.staticSetupForPlanning();
		oFF.InAPlanningCapabilitiesProviderFactory.staticSetup();
		oFF.PlanningVariableProcessorProviderFactory.staticSetup();
		oFF.PlanningStateHandler.setInstance(new oFF.PlanningStateHandlerImpl());
		oFF.InAPlanningHelperTmp.staticSetup();
		oFF.IpProviderModule.addAllComponents();
		oFF.QInA.removeEmptyContainers();
		oFF.DfModule.stopExt(oFF.IpProviderModule.s_module);
	}
	return oFF.IpProviderModule.s_module;
};
oFF.IpProviderModule.addAllComponents = function()
{
	oFF.QInA.addInAComponent(new oFF.InAPlanningAction());
	oFF.QInA.addInAComponent(new oFF.InAPlanningModelCommand());
	oFF.QInA.addInAComponent(new oFF.InAPlanningModelCloseCommand());
	oFF.QInA.addInAComponent(new oFF.InAPlanningModelRequestCleanup());
	oFF.QInA.addInAComponent(new oFF.InAPlanningModelRequestRefreshActions());
	oFF.QInA.addInAComponent(new oFF.InAPlanningModelRequestRefreshVersions());
	oFF.QInA.addInAComponent(new oFF.InAPlanningModelRequestUpdateVersionPrivileges());
	oFF.QInA.addInAComponent(new oFF.InAPlanningModelRequestVersion());
	oFF.QInA.addInAComponent(new oFF.InAPlanningModelRequestVersionClose());
	oFF.QInA.addInAComponent(new oFF.InAPlanningModelRequestVersionEndActionSequence());
	oFF.QInA.addInAComponent(new oFF.InAPlanningModelRequestVersionInit());
	oFF.QInA.addInAComponent(new oFF.InAPlanningModelRequestVersionSetParameters());
	oFF.QInA.addInAComponent(new oFF.InAPlanningModelRequestVersionSetTimeout());
	oFF.QInA.addInAComponent(new oFF.InAPlanningModelRequestVersionStartActionSequence());
	oFF.QInA.addInAComponent(new oFF.InAPlanningModelRequestVersionStateDescriptions());
	oFF.QInA.addInAComponent(new oFF.InAPlanningModelRequestVersionUndoRedo());
	oFF.QInA.addInAComponent(new oFF.InADataAreaCommand());
	oFF.QInA.addInAComponent(new oFF.InADataAreaCommandClose());
	oFF.QInA.addInAComponent(new oFF.InADataAreaRequestGetPlanningFunctionMetadata());
	oFF.QInA.addInAComponent(new oFF.InADataAreaRequestGetPlanningSequenceMetadata());
	oFF.QInA.addInAComponent(new oFF.InALightweightDataAreaCommand());
};
oFF.IpProviderModule.prototype.getName = function()
{
	return "ff4410.olap.ip.providers";
};

oFF.IpProviderModule.getInstance();

return sap.firefly;
	} );