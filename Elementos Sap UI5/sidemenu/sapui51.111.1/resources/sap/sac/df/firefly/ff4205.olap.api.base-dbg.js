/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
[
"sap/sac/df/firefly/ff4200.olap.api","sap/sac/df/firefly/ff2610.visualization.internal"
],
function(oFF)
{
"use strict";

oFF.QueryModelUtils = {

	getPreQueries:function(queryModel)
	{
			var result = oFF.XList.create();
		if (oFF.notNull(queryModel))
		{
			if (queryModel.isBlendingModel())
			{
				var dataSource = queryModel.getDataSource();
				var blendingDefinition = dataSource.getBlendingDefinition();
				if (oFF.notNull(blendingDefinition))
				{
					var sources = blendingDefinition.getSources();
					var sourcesIterator = sources.getIterator();
					while (sourcesIterator.hasNext())
					{
						var source = sourcesIterator.next();
						var sourceModel = source.getQueryModel();
						if (oFF.notNull(sourceModel) && !source.isRemoteSource())
						{
							result.addAll(oFF.QueryModelUtils.getPreQueries(sourceModel));
						}
					}
				}
			}
			else
			{
				var preQueries = queryModel.getPreQueries();
				if (oFF.XCollectionUtils.hasElements(preQueries))
				{
					result.addAll(preQueries);
				}
			}
		}
		return result;
	}
};

oFF.QImExFlag = {

	DEFAULT_ALL:3,
	DATASOURCE:1,
	VARIABLES:2,
	RUN_AS_USER:4,
	HIDE:8,
	DRILL_CONTEXT:16
};

oFF.QValueHelpExecutedListenerLambda = function() {};
oFF.QValueHelpExecutedListenerLambda.prototype = new oFF.XObject();
oFF.QValueHelpExecutedListenerLambda.prototype._ff_c = "QValueHelpExecutedListenerLambda";

oFF.QValueHelpExecutedListenerLambda.createSingleUse = function(callback)
{
	var obj = new oFF.QValueHelpExecutedListenerLambda();
	obj.m_callback = callback;
	return obj;
};
oFF.QValueHelpExecutedListenerLambda.prototype.m_callback = null;
oFF.QValueHelpExecutedListenerLambda.prototype.onValuehelpExecuted = function(extResult, resultSetContainer, customIdentifier)
{
	this.m_callback(extResult);
	oFF.XObjectExt.release(this);
};
oFF.QValueHelpExecutedListenerLambda.prototype.releaseObject = function()
{
	this.m_callback = null;
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.QDeltaBroadcastPhase = function() {};
oFF.QDeltaBroadcastPhase.prototype = new oFF.XConstant();
oFF.QDeltaBroadcastPhase.prototype._ff_c = "QDeltaBroadcastPhase";

oFF.QDeltaBroadcastPhase.BEFORE_EVENTS_BROADCAST = null;
oFF.QDeltaBroadcastPhase.AFTER_EVENTS_BROADCAST = null;
oFF.QDeltaBroadcastPhase.staticSetup = function()
{
	oFF.QDeltaBroadcastPhase.BEFORE_EVENTS_BROADCAST = oFF.XConstant.setupName(new oFF.QDeltaBroadcastPhase(), "BeforeEventsBroadcast");
	oFF.QDeltaBroadcastPhase.AFTER_EVENTS_BROADCAST = oFF.XConstant.setupName(new oFF.QDeltaBroadcastPhase(), "AfterEventsBroadcast");
};

oFF.QDeltaChangeState = function() {};
oFF.QDeltaChangeState.prototype = new oFF.XConstant();
oFF.QDeltaChangeState.prototype._ff_c = "QDeltaChangeState";

oFF.QDeltaChangeState.UNCHANGED = null;
oFF.QDeltaChangeState.NODE_CHANGED = null;
oFF.QDeltaChangeState.NODE_AND_CHILDREN_CHANGED = null;
oFF.QDeltaChangeState.CHILDREN_CHANGED = null;
oFF.QDeltaChangeState.staticSetup = function()
{
	oFF.QDeltaChangeState.UNCHANGED = oFF.XConstant.setupName(new oFF.QDeltaChangeState(), "Unchanged");
	oFF.QDeltaChangeState.NODE_CHANGED = oFF.XConstant.setupName(new oFF.QDeltaChangeState(), "NodeChanged");
	oFF.QDeltaChangeState.NODE_AND_CHILDREN_CHANGED = oFF.XConstant.setupName(new oFF.QDeltaChangeState(), "NodeAndChildrenChanged");
	oFF.QDeltaChangeState.CHILDREN_CHANGED = oFF.XConstant.setupName(new oFF.QDeltaChangeState(), "ChildrenChanged");
};

oFF.QDeltaOperationPhase = function() {};
oFF.QDeltaOperationPhase.prototype = new oFF.XConstant();
oFF.QDeltaOperationPhase.prototype._ff_c = "QDeltaOperationPhase";

oFF.QDeltaOperationPhase.QUEUE = null;
oFF.QDeltaOperationPhase.STOP = null;
oFF.QDeltaOperationPhase.RESUME = null;
oFF.QDeltaOperationPhase.NOTIFY_PAUSE_MODCOUNTER = null;
oFF.QDeltaOperationPhase.NOTIFY_DO_NOT_RAISEEVENTS = null;
oFF.QDeltaOperationPhase.NOTE_MODELER_CHANGES = null;
oFF.QDeltaOperationPhase.staticSetup = function()
{
	oFF.QDeltaOperationPhase.QUEUE = oFF.XConstant.setupName(new oFF.QDeltaOperationPhase(), "Queue");
	oFF.QDeltaOperationPhase.STOP = oFF.XConstant.setupName(new oFF.QDeltaOperationPhase(), "Stop");
	oFF.QDeltaOperationPhase.RESUME = oFF.XConstant.setupName(new oFF.QDeltaOperationPhase(), "Resume");
	oFF.QDeltaOperationPhase.NOTIFY_PAUSE_MODCOUNTER = oFF.XConstant.setupName(new oFF.QDeltaOperationPhase(), "MetadataUpdate");
	oFF.QDeltaOperationPhase.NOTIFY_DO_NOT_RAISEEVENTS = oFF.XConstant.setupName(new oFF.QDeltaOperationPhase(), "RunNotifyStackDoNotRaiseEvents");
	oFF.QDeltaOperationPhase.NOTE_MODELER_CHANGES = oFF.XConstant.setupName(new oFF.QDeltaOperationPhase(), "NoteModelerChange");
};

oFF.ProviderInitProcedure = function() {};
oFF.ProviderInitProcedure.prototype = new oFF.XConstant();
oFF.ProviderInitProcedure.prototype._ff_c = "ProviderInitProcedure";

oFF.ProviderInitProcedure.REQUEST_BY_MODEL = null;
oFF.ProviderInitProcedure.REQUEST_BY_STRUCTURE = null;
oFF.ProviderInitProcedure.SKIP = null;
oFF.ProviderInitProcedure.staticSetup = function()
{
	oFF.ProviderInitProcedure.REQUEST_BY_MODEL = oFF.XConstant.setupName(new oFF.ProviderInitProcedure(), "RequestByModel");
	oFF.ProviderInitProcedure.REQUEST_BY_STRUCTURE = oFF.XConstant.setupName(new oFF.ProviderInitProcedure(), "RequestByStructure");
	oFF.ProviderInitProcedure.SKIP = oFF.XConstant.setupName(new oFF.ProviderInitProcedure(), "Skip");
};

oFF.DfQContext = function() {};
oFF.DfQContext.prototype = new oFF.XObjectExt();
oFF.DfQContext.prototype._ff_c = "DfQContext";

oFF.DfQContext.prototype.m_context = null;
oFF.DfQContext.prototype.setupContext = function(context)
{
	this.setContext(context);
};
oFF.DfQContext.prototype.releaseObject = function()
{
	this.m_context = oFF.XObjectExt.release(this.m_context);
	oFF.XObjectExt.prototype.releaseObject.call( this );
};
oFF.DfQContext.prototype.setContext = function(context)
{
	if (oFF.notNull(context))
	{
		this.m_context = oFF.XWeakReferenceUtil.getWeakRef(context);
	}
};
oFF.DfQContext.prototype.getContext = function()
{
	return oFF.XWeakReferenceUtil.getHardRef(this.m_context);
};
oFF.DfQContext.prototype.getOriginContext = function()
{
	return oFF.XWeakReferenceUtil.getHardRef(this.m_context);
};
oFF.DfQContext.prototype.getLogWriter = function()
{
	var session = this.getSession();
	return oFF.isNull(session) ? null : session.getLogWriter();
};
oFF.DfQContext.prototype.getSession = function()
{
	return this.getApplication().getSession();
};
oFF.DfQContext.prototype.getProcess = function()
{
	return this.getApplication().getProcess();
};
oFF.DfQContext.prototype.getApplication = function()
{
	if (this.getOlapEnv() === null)
	{
		return null;
	}
	return this.getOlapEnv().getApplication();
};
oFF.DfQContext.prototype.getOlapEnv = function()
{
	var context = this.getOriginContext();
	return oFF.isNull(context) || context === this ? null : context.getOlapEnv();
};
oFF.DfQContext.prototype.getQueryManagerBase = function()
{
	return this.getQueryManager();
};
oFF.DfQContext.prototype.getConvenienceCommands = function()
{
	var queryManager = this.getQueryManager();
	return oFF.isNull(queryManager) ? null : queryManager.getConvenienceCommands();
};
oFF.DfQContext.prototype.getQueryManager = function()
{
	var context = this.getOriginContext();
	return oFF.isNull(context) ? null : context.getQueryManager();
};
oFF.DfQContext.prototype.getQueryModel = function()
{
	var context = this.getOriginContext();
	return oFF.isNull(context) ? null : context.getQueryModel();
};
oFF.DfQContext.prototype.getQueryModelBase = function()
{
	return this.getQueryModel();
};
oFF.DfQContext.prototype.getVariableContainer = function()
{
	var context = this.getOriginContext();
	return oFF.isNull(context) ? null : context.getVariableContainer();
};
oFF.DfQContext.prototype.getDimensionAccessor = function()
{
	var context = this.getOriginContext();
	return oFF.isNull(context) ? null : context.getDimensionAccessor();
};
oFF.DfQContext.prototype.getFieldAccessorSingle = function()
{
	var context = this.getOriginContext();
	return oFF.isNull(context) ? null : context.getFieldAccessorSingle();
};
oFF.DfQContext.prototype.getModelCapabilities = function()
{
	var context = this.getOriginContext();
	return oFF.isNull(context) ? null : context.getModelCapabilities();
};
oFF.DfQContext.prototype.getDrillManager = function()
{
	var context = this.getOriginContext();
	return oFF.isNull(context) ? null : context.getDrillManager();
};
oFF.DfQContext.prototype.getCellContextManager = function()
{
	var context = this.getOriginContext();
	return oFF.isNull(context) ? null : context.getCellContextManager();
};
oFF.DfQContext.prototype.getDataSourceOrigin = function()
{
	return this.getDataSource();
};
oFF.DfQContext.prototype.getDataSourceTarget = function()
{
	return this.getDataSource();
};
oFF.DfQContext.prototype.getDataSource = function()
{
	var context = this.getOriginContext();
	return oFF.isNull(context) ? null : context.getDataSource();
};
oFF.DfQContext.prototype.getKeyRefStorage = function()
{
	var context = this.getOriginContext();
	return oFF.isNull(context) ? null : context.getKeyRefStorage();
};
oFF.DfQContext.prototype.getSystemName = function()
{
	var systemName = null;
	var queryManager = this.getQueryManager();
	if (oFF.notNull(queryManager))
	{
		systemName = queryManager.getSystemName();
	}
	if (oFF.isNull(systemName))
	{
		var context = this.getContext();
		if (oFF.notNull(context))
		{
			systemName = context.getSystemName();
		}
	}
	return systemName;
};

oFF.OlapApiBaseModule = function() {};
oFF.OlapApiBaseModule.prototype = new oFF.DfModule();
oFF.OlapApiBaseModule.prototype._ff_c = "OlapApiBaseModule";

oFF.OlapApiBaseModule.s_module = null;
oFF.OlapApiBaseModule.getInstance = function()
{
	if (oFF.isNull(oFF.OlapApiBaseModule.s_module))
	{
		oFF.DfModule.checkInitialized(oFF.OlapApiModule.getInstance());
		oFF.OlapApiBaseModule.s_module = oFF.DfModule.startExt(new oFF.OlapApiBaseModule());
		oFF.ProviderInitProcedure.staticSetup();
		oFF.DfModule.stopExt(oFF.OlapApiBaseModule.s_module);
	}
	return oFF.OlapApiBaseModule.s_module;
};
oFF.OlapApiBaseModule.prototype.getName = function()
{
	return "ff4205.olap.api.base";
};

oFF.OlapApiBaseModule.getInstance();

return sap.firefly;
	} );