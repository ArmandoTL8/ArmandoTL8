/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
[
"sap/sac/df/firefly/ff4200.olap.api"
],
function(oFF)
{
"use strict";

oFF.OlapCatalogServiceConfig = function() {};
oFF.OlapCatalogServiceConfig.prototype = new oFF.DfServiceConfig();
oFF.OlapCatalogServiceConfig.prototype._ff_c = "OlapCatalogServiceConfig";

oFF.OlapCatalogServiceConfig.CLAZZ = null;
oFF.OlapCatalogServiceConfig.staticSetup = function()
{
	oFF.OlapCatalogServiceConfig.CLAZZ = oFF.XClass.create(oFF.OlapCatalogServiceConfig);
};
oFF.OlapCatalogServiceConfig.prototype.metaObjectType = null;
oFF.OlapCatalogServiceConfig.prototype.releaseObject = function()
{
	this.metaObjectType = null;
	oFF.DfServiceConfig.prototype.releaseObject.call( this );
};
oFF.OlapCatalogServiceConfig.prototype.processOlapCatalogManagerCreation = function(syncType, listener, customIdentifier)
{
	this.metaObjectType = oFF.MetaObjectType.CATALOG_VIEW;
	return this.processSyncAction(syncType, listener, customIdentifier);
};
oFF.OlapCatalogServiceConfig.prototype.processLightweightOlapCatalogManagerCreation = function(syncType, listener, customIdentifier)
{
	this.metaObjectType = oFF.MetaObjectType.CATALOG_VIEW_2;
	return this.processSyncAction(syncType, listener, customIdentifier);
};
oFF.OlapCatalogServiceConfig.prototype.processCurrencyTranslationCatalogManagerCreation = function(syncType, listener, customIdentifier)
{
	this.metaObjectType = oFF.MetaObjectType.CURRENCY_TRANSLATION;
	return this.processSyncAction(syncType, listener, customIdentifier);
};
oFF.OlapCatalogServiceConfig.prototype.processCurrencyCatalogManagerCreation = function(syncType, listener, customIdentifier)
{
	this.metaObjectType = oFF.MetaObjectType.CURRENCY;
	return this.processSyncAction(syncType, listener, customIdentifier);
};
oFF.OlapCatalogServiceConfig.prototype.processFormulaOperatorsCatalogManagerCreation = function(syncType, listener, customIdentifier)
{
	this.metaObjectType = oFF.MetaObjectType.FORMULA_OPERATORS;
	return this.processSyncAction(syncType, listener, customIdentifier);
};
oFF.OlapCatalogServiceConfig.prototype.getMetaObjectType = function()
{
	return this.metaObjectType;
};
oFF.OlapCatalogServiceConfig.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onOlapCatalogManagerCreated(extResult, data, customIdentifier);
};
oFF.OlapCatalogServiceConfig.prototype.setDataFromService = function(service)
{
	this.setData(service.getCatalogManager());
};

oFF.OlapCatalogApiModule = function() {};
oFF.OlapCatalogApiModule.prototype = new oFF.DfModule();
oFF.OlapCatalogApiModule.prototype._ff_c = "OlapCatalogApiModule";

oFF.OlapCatalogApiModule.XS_OLAP_CATALOG = "OLAP_CATALOG";
oFF.OlapCatalogApiModule.SERVICE_TYPE_OLAP_CATALOG = null;
oFF.OlapCatalogApiModule.XS_PLANNING_MODEL_CATALOG = "PLANNING_MODEL_CATALOG";
oFF.OlapCatalogApiModule.SERVICE_TYPE_PLANNING_MODEL_CATALOG = null;
oFF.OlapCatalogApiModule.XS_PLANNING_CATALOG = "PLANNING_CATALOG";
oFF.OlapCatalogApiModule.SERVICE_TYPE_PLANNING_CATALOG = null;
oFF.OlapCatalogApiModule.s_module = null;
oFF.OlapCatalogApiModule.getInstance = function()
{
	if (oFF.isNull(oFF.OlapCatalogApiModule.s_module))
	{
		oFF.DfModule.checkInitialized(oFF.RuntimeModule.getInstance());
		oFF.OlapCatalogApiModule.s_module = oFF.DfModule.startExt(new oFF.OlapCatalogApiModule());
		oFF.OlapCatalogApiModule.SERVICE_TYPE_PLANNING_CATALOG = oFF.ServiceType.createType(oFF.OlapCatalogApiModule.XS_PLANNING_CATALOG);
		oFF.OlapCatalogApiModule.SERVICE_TYPE_PLANNING_MODEL_CATALOG = oFF.ServiceType.createType(oFF.OlapCatalogApiModule.XS_PLANNING_MODEL_CATALOG);
		oFF.OlapCatalogApiModule.SERVICE_TYPE_OLAP_CATALOG = oFF.ServiceType.createType(oFF.OlapCatalogApiModule.XS_OLAP_CATALOG);
		oFF.OlapCatalogServiceConfig.staticSetup();
		var registrationService = oFF.RegistrationService.getInstance();
		registrationService.addServiceConfig(oFF.OlapCatalogApiModule.XS_OLAP_CATALOG, oFF.OlapCatalogServiceConfig.CLAZZ);
		oFF.DfModule.stopExt(oFF.OlapCatalogApiModule.s_module);
	}
	return oFF.OlapCatalogApiModule.s_module;
};
oFF.OlapCatalogApiModule.prototype.getName = function()
{
	return "ff4220.olap.catalog.api";
};

oFF.OlapCatalogApiModule.getInstance();

return sap.firefly;
	} );