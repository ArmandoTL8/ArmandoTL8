/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
[
"sap/sac/df/firefly/ff0030.core.ext"
],
function(oFF)
{
"use strict";

oFF.XConverterUtils = {

	getString:function(component)
	{
			var type = component.getComponentType();
		if (type === oFF.XValueType.STRING)
		{
			return component.getString();
		}
		else if (type === oFF.XValueType.BOOLEAN)
		{
			return component.getStringRepresentation();
		}
		else if (type === oFF.XValueType.INTEGER)
		{
			return component.getStringRepresentation();
		}
		else if (type === oFF.XValueType.LONG)
		{
			return component.getStringRepresentation();
		}
		else if (type === oFF.XValueType.DOUBLE)
		{
			return component.getStringRepresentation();
		}
		else
		{
			return component.toString();
		}
	},
	getBoolean:function(component)
	{
			var type = component.getComponentType();
		if (type === oFF.XValueType.BOOLEAN)
		{
			return component.getBoolean();
		}
		else if (type === oFF.XValueType.STRING)
		{
			var strValue = component.getString();
			return oFF.XBoolean.convertFromString(strValue);
		}
		else if (type === oFF.XValueType.INTEGER)
		{
			var intValue = component.getInteger();
			return intValue !== 0;
		}
		else if (type === oFF.XValueType.LONG)
		{
			var longValue = oFF.XLong.convertToInt(component.getLong());
			return longValue !== 0;
		}
		else if (type === oFF.XValueType.DOUBLE)
		{
			var doubleValue = oFF.XDouble.convertToInt(component.getDouble());
			return doubleValue !== 0;
		}
		else
		{
			return false;
		}
	},
	getInteger:function(component)
	{
			var type = component.getComponentType();
		if (type === oFF.XValueType.INTEGER)
		{
			return component.getInteger();
		}
		else if (type === oFF.XValueType.LONG)
		{
			return oFF.XLong.convertToInt(component.getLong());
		}
		else if (type === oFF.XValueType.DOUBLE)
		{
			return oFF.XDouble.convertToInt(component.getDouble());
		}
		else if (type === oFF.XValueType.STRING)
		{
			var strValue = component.getString();
			return oFF.XInteger.convertFromString(strValue);
		}
		else
		{
			return 0;
		}
	},
	getLong:function(component)
	{
			var type = component.getComponentType();
		if (type === oFF.XValueType.INTEGER)
		{
			return component.getInteger();
		}
		else if (type === oFF.XValueType.LONG)
		{
			return component.getLong();
		}
		else if (type === oFF.XValueType.DOUBLE)
		{
			return oFF.XDouble.convertToLong(component.getDouble());
		}
		else if (type === oFF.XValueType.STRING)
		{
			var strValue = component.getString();
			return oFF.XLong.convertFromString(strValue);
		}
		else
		{
			return 0;
		}
	},
	getDouble:function(component)
	{
			var type = component.getComponentType();
		if (type === oFF.XValueType.INTEGER)
		{
			return oFF.XInteger.convertToDouble(component.getInteger());
		}
		else if (type === oFF.XValueType.LONG)
		{
			return oFF.XLong.convertToDouble(component.getLong());
		}
		else if (type === oFF.XValueType.DOUBLE)
		{
			return component.getDouble();
		}
		else if (type === oFF.XValueType.STRING)
		{
			var strValue = component.getString();
			return oFF.XDouble.convertFromString(strValue);
		}
		else
		{
			return 0.0;
		}
	}
};

oFF.XReflectionParam = function() {};
oFF.XReflectionParam.prototype = new oFF.XObject();
oFF.XReflectionParam.prototype._ff_c = "XReflectionParam";

oFF.XReflectionParam.create = function(obj)
{
	var param = new oFF.XReflectionParam();
	param.m_value = obj;
	return param;
};
oFF.XReflectionParam.createBoolean = function(value)
{
	var param = new oFF.XReflectionParam();
	param.m_value = oFF.XBooleanValue.create(value);
	param.m_isWrapped = true;
	return param;
};
oFF.XReflectionParam.createInteger = function(value)
{
	var param = new oFF.XReflectionParam();
	param.m_value = oFF.XIntegerValue.create(value);
	param.m_isWrapped = true;
	return param;
};
oFF.XReflectionParam.createDouble = function(value)
{
	var param = new oFF.XReflectionParam();
	param.m_value = oFF.XDoubleValue.create(value);
	param.m_isWrapped = true;
	return param;
};
oFF.XReflectionParam.createLong = function(value)
{
	var param = new oFF.XReflectionParam();
	param.m_value = oFF.XLongValue.create(value);
	param.m_isWrapped = true;
	return param;
};
oFF.XReflectionParam.createString = function(value)
{
	var param = new oFF.XReflectionParam();
	param.m_value = oFF.XStringValue.create(value);
	param.m_isWrapped = true;
	return param;
};
oFF.XReflectionParam.prototype.m_value = null;
oFF.XReflectionParam.prototype.m_isWrapped = false;
oFF.XReflectionParam.prototype.isWrapped = function()
{
	return this.m_isWrapped;
};
oFF.XReflectionParam.prototype.getValue = function()
{
	return this.m_value;
};
oFF.XReflectionParam.prototype.getBoolean = function()
{
	return oFF.XConverterUtils.getBoolean(this.m_value);
};
oFF.XReflectionParam.prototype.getInteger = function()
{
	return oFF.XConverterUtils.getInteger(this.m_value);
};
oFF.XReflectionParam.prototype.getDouble = function()
{
	return oFF.XConverterUtils.getDouble(this.m_value);
};
oFF.XReflectionParam.prototype.getLong = function()
{
	return oFF.XConverterUtils.getLong(this.m_value);
};
oFF.XReflectionParam.prototype.getString = function()
{
	return oFF.XConverterUtils.getString(this.m_value);
};
oFF.XReflectionParam.prototype.releaseObject = function()
{
	if (this.m_isWrapped)
	{
		this.m_value = oFF.XObjectExt.release(this.m_value);
	}
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.XLogBufferNull = function() {};
oFF.XLogBufferNull.prototype = new oFF.XObject();
oFF.XLogBufferNull.prototype._ff_c = "XLogBufferNull";

oFF.XLogBufferNull.SINGLETON = null;
oFF.XLogBufferNull.staticSetup = function()
{
	oFF.XLogBufferNull.SINGLETON = new oFF.XLogBufferNull();
};
oFF.XLogBufferNull.prototype.append = function(value)
{
	return this;
};
oFF.XLogBufferNull.prototype.appendChar = function(value)
{
	return this;
};
oFF.XLogBufferNull.prototype.appendBoolean = function(value)
{
	return this;
};
oFF.XLogBufferNull.prototype.appendInt = function(value)
{
	return this;
};
oFF.XLogBufferNull.prototype.appendLong = function(value)
{
	return this;
};
oFF.XLogBufferNull.prototype.appendDouble = function(value)
{
	return this;
};
oFF.XLogBufferNull.prototype.appendObject = function(value)
{
	return this;
};
oFF.XLogBufferNull.prototype.appendNewLine = function()
{
	return this;
};
oFF.XLogBufferNull.prototype.appendLine = function(value)
{
	return this;
};
oFF.XLogBufferNull.prototype.length = function()
{
	return 0;
};
oFF.XLogBufferNull.prototype.clear = function() {};
oFF.XLogBufferNull.prototype.flush = function() {};

oFF.XLogger = {

	s_logger:null,
	getInstance:function()
	{
			return oFF.XLogger.s_logger;
	},
	setInstance:function(logger)
	{
			oFF.XLogger.s_logger = logger;
	},
	println:function(logline)
	{
			oFF.XLogger.s_logger.logExt(null, null, 0, logline);
	}
};

oFF.InfoCodes = {

	OTHER_INFO:1000000,
	DIMENSION_LAZY_LOAD:1000001,
	QUERY_MODEL_VERSION_VALID:1000002
};

oFF.XStdio = {

	s_stdio:null,
	getInstance:function()
	{
			return oFF.XStdio.s_stdio;
	},
	setInstance:function(stdio)
	{
			oFF.XStdio.s_stdio = stdio;
	}
};

oFF.DfStdio = function() {};
oFF.DfStdio.prototype = new oFF.XObject();
oFF.DfStdio.prototype._ff_c = "DfStdio";

oFF.DfStdio.prototype.getStdin = function()
{
	return this;
};
oFF.DfStdio.prototype.getStdout = function()
{
	return this;
};
oFF.DfStdio.prototype.getStdlog = function()
{
	return this;
};
oFF.DfStdio.prototype.println = function(text) {};
oFF.DfStdio.prototype.print = function(text) {};
oFF.DfStdio.prototype.readLine = function(listener)
{
	return null;
};
oFF.DfStdio.prototype.supportsSyncType = function(syncType)
{
	return false;
};

oFF.XDateTimeFactory = function() {};
oFF.XDateTimeFactory.prototype = new oFF.XObjectExt();
oFF.XDateTimeFactory.prototype._ff_c = "XDateTimeFactory";

oFF.XDateTimeFactory.s_instance = null;
oFF.XDateTimeFactory.getInstance = function()
{
	return oFF.XDateTimeFactory.s_instance;
};

oFF.XNumberFormatterSettingsFactory = function() {};
oFF.XNumberFormatterSettingsFactory.prototype = new oFF.XObjectExt();
oFF.XNumberFormatterSettingsFactory.prototype._ff_c = "XNumberFormatterSettingsFactory";

oFF.XNumberFormatterSettingsFactory.s_instance = null;
oFF.XNumberFormatterSettingsFactory.getInstance = function()
{
	return oFF.XNumberFormatterSettingsFactory.s_instance;
};

oFF.XWriteStreamBuffer = function() {};
oFF.XWriteStreamBuffer.prototype = new oFF.XObjectExt();
oFF.XWriteStreamBuffer.prototype._ff_c = "XWriteStreamBuffer";

oFF.XWriteStreamBuffer.create = function()
{
	var streamBuffer = new oFF.XWriteStreamBuffer();
	streamBuffer.m_buffer = oFF.XStringBuffer.create();
	return streamBuffer;
};
oFF.XWriteStreamBuffer.prototype.m_buffer = null;
oFF.XWriteStreamBuffer.prototype.println = function(text)
{
	this.m_buffer.appendLine(text);
};
oFF.XWriteStreamBuffer.prototype.print = function(text)
{
	this.m_buffer.append(text);
};
oFF.XWriteStreamBuffer.prototype.toString = function()
{
	return this.m_buffer.toString();
};

oFF.XClassElement = function() {};
oFF.XClassElement.prototype = new oFF.DfNameObject();
oFF.XClassElement.prototype._ff_c = "XClassElement";

oFF.XClassElement.prototype.m_accessModifier = null;
oFF.XClassElement.prototype.getAccessModifier = function()
{
	return this.m_accessModifier;
};

oFF.DfLogWriter = function() {};
oFF.DfLogWriter.prototype = new oFF.XObject();
oFF.DfLogWriter.prototype._ff_c = "DfLogWriter";

oFF.DfLogWriter.createLogString = function(layer, severity, code, message)
{
	var buffer = oFF.XStringBuffer.create();
	buffer.append("[").append(oFF.XDateTimeFactory.getInstance().createTime().toIsoFormat()).append("] ");
	if (oFF.notNull(severity))
	{
		buffer.append("[").append(severity.getName()).append("] ");
	}
	if (oFF.notNull(layer))
	{
		buffer.append(layer).append(": ");
	}
	if (code !== oFF.ErrorCodes.OTHER_ERROR)
	{
		buffer.append("(#");
		buffer.appendInt(code);
		buffer.append(") ");
	}
	if (oFF.notNull(message))
	{
		buffer.append(message);
	}
	return buffer.toString();
};
oFF.DfLogWriter.prototype.isLogWritten = function(layer, severity)
{
	return true;
};
oFF.DfLogWriter.prototype.setLogFilterSeverity = function(filterLevel)
{
	this.setLogFilterLevel(filterLevel.getLevel());
};
oFF.DfLogWriter.prototype.setLogFilterLevel = function(filterLevel) {};
oFF.DfLogWriter.prototype.disableAllLogLayers = function() {};
oFF.DfLogWriter.prototype.enableAllLogLayers = function() {};
oFF.DfLogWriter.prototype.enableAllLogs = function()
{
	this.enableAllLogLayers();
	this.enableAllLogSeverity();
};
oFF.DfLogWriter.prototype.disableAllLogs = function()
{
	this.disableAllLogLayers();
	this.disableAllLogSeverity();
};
oFF.DfLogWriter.prototype.enableAllLogSeverity = function()
{
	this.setLogFilterLevel(oFF.Severity.DEBUG.getLevel());
};
oFF.DfLogWriter.prototype.disableAllLogSeverity = function()
{
	this.setLogFilterLevel(oFF.Severity.PRINT.getLevel());
};
oFF.DfLogWriter.prototype.addLogLayer = function(layer) {};
oFF.DfLogWriter.prototype.clear = function() {};
oFF.DfLogWriter.prototype.isEmpty = function()
{
	return true;
};
oFF.DfLogWriter.prototype.hasElements = function()
{
	return false;
};
oFF.DfLogWriter.prototype.size = function()
{
	return 0;
};

oFF.DateRangeGranularity = function() {};
oFF.DateRangeGranularity.prototype = new oFF.XConstant();
oFF.DateRangeGranularity.prototype._ff_c = "DateRangeGranularity";

oFF.DateRangeGranularity.YEAR = null;
oFF.DateRangeGranularity.QUARTER = null;
oFF.DateRangeGranularity.MONTH = null;
oFF.DateRangeGranularity.DAY = null;
oFF.DateRangeGranularity.CURRENT_YEAR = null;
oFF.DateRangeGranularity.CURRENT_QUARTER = null;
oFF.DateRangeGranularity.CURRENT_MONTH = null;
oFF.DateRangeGranularity.staticSetup = function()
{
	oFF.DateRangeGranularity.YEAR = oFF.XConstant.setupName(new oFF.DateRangeGranularity(), "Year");
	oFF.DateRangeGranularity.QUARTER = oFF.XConstant.setupName(new oFF.DateRangeGranularity(), "Quarter");
	oFF.DateRangeGranularity.MONTH = oFF.XConstant.setupName(new oFF.DateRangeGranularity(), "Month");
	oFF.DateRangeGranularity.DAY = oFF.XConstant.setupName(new oFF.DateRangeGranularity(), "Day");
	oFF.DateRangeGranularity.CURRENT_YEAR = oFF.XConstant.setupName(new oFF.DateRangeGranularity(), "CurrentYear");
	oFF.DateRangeGranularity.CURRENT_QUARTER = oFF.XConstant.setupName(new oFF.DateRangeGranularity(), "CurrentQuarter");
	oFF.DateRangeGranularity.CURRENT_MONTH = oFF.XConstant.setupName(new oFF.DateRangeGranularity(), "CurrentMonth");
};
oFF.DateRangeGranularity.getHighest = function(granularities)
{
	if (oFF.XCollectionUtils.hasElements(granularities))
	{
		if (granularities.contains(oFF.DateRangeGranularity.DAY))
		{
			return oFF.DateRangeGranularity.DAY;
		}
		if (granularities.contains(oFF.DateRangeGranularity.MONTH))
		{
			return oFF.DateRangeGranularity.MONTH;
		}
		if (granularities.contains(oFF.DateRangeGranularity.QUARTER))
		{
			return oFF.DateRangeGranularity.QUARTER;
		}
		return oFF.DateRangeGranularity.YEAR;
	}
	return null;
};
oFF.DateRangeGranularity.prototype.isYear = function()
{
	return this === oFF.DateRangeGranularity.YEAR || this === oFF.DateRangeGranularity.CURRENT_YEAR;
};
oFF.DateRangeGranularity.prototype.isQuarter = function()
{
	return this === oFF.DateRangeGranularity.QUARTER || this === oFF.DateRangeGranularity.CURRENT_QUARTER;
};
oFF.DateRangeGranularity.prototype.isMonth = function()
{
	return this === oFF.DateRangeGranularity.MONTH || this === oFF.DateRangeGranularity.CURRENT_MONTH;
};
oFF.DateRangeGranularity.prototype.isDay = function()
{
	return this === oFF.DateRangeGranularity.DAY;
};
oFF.DateRangeGranularity.prototype.isCurrentDateUnit = function()
{
	return this === oFF.DateRangeGranularity.CURRENT_YEAR || this === oFF.DateRangeGranularity.CURRENT_QUARTER || this === oFF.DateRangeGranularity.CURRENT_MONTH;
};

oFF.DateTimeFormat = function() {};
oFF.DateTimeFormat.prototype = new oFF.XConstant();
oFF.DateTimeFormat.prototype._ff_c = "DateTimeFormat";

oFF.DateTimeFormat.ISO = null;
oFF.DateTimeFormat.SAP = null;
oFF.DateTimeFormat.staticSetup = function()
{
	oFF.DateTimeFormat.ISO = oFF.XConstant.setupName(new oFF.DateTimeFormat(), "IsoDate");
	oFF.DateTimeFormat.SAP = oFF.XConstant.setupName(new oFF.DateTimeFormat(), "SapDate");
};

oFF.DateTimeGranularityType = function() {};
oFF.DateTimeGranularityType.prototype = new oFF.XConstant();
oFF.DateTimeGranularityType.prototype._ff_c = "DateTimeGranularityType";

oFF.DateTimeGranularityType.ALL = null;
oFF.DateTimeGranularityType.YEAR = null;
oFF.DateTimeGranularityType.HALFYEAR = null;
oFF.DateTimeGranularityType.CALQUARTER = null;
oFF.DateTimeGranularityType.CALMONTH = null;
oFF.DateTimeGranularityType.WEEK = null;
oFF.DateTimeGranularityType.DAY = null;
oFF.DateTimeGranularityType.HOUR = null;
oFF.DateTimeGranularityType.MINUTE = null;
oFF.DateTimeGranularityType.SECOND = null;
oFF.DateTimeGranularityType.MILLISECOND = null;
oFF.DateTimeGranularityType.s_lookup = null;
oFF.DateTimeGranularityType.staticSetup = function()
{
	oFF.DateTimeGranularityType.s_lookup = oFF.XSetOfNameObject.create();
	oFF.DateTimeGranularityType.ALL = oFF.DateTimeGranularityType.create("ALL");
	oFF.DateTimeGranularityType.YEAR = oFF.DateTimeGranularityType.create("YEAR");
	oFF.DateTimeGranularityType.HALFYEAR = oFF.DateTimeGranularityType.create("HALFYEAR");
	oFF.DateTimeGranularityType.CALQUARTER = oFF.DateTimeGranularityType.create("CALQUARTER");
	oFF.DateTimeGranularityType.CALMONTH = oFF.DateTimeGranularityType.create("CALMONTH");
	oFF.DateTimeGranularityType.WEEK = oFF.DateTimeGranularityType.create("WEEK");
	oFF.DateTimeGranularityType.DAY = oFF.DateTimeGranularityType.create("DAY");
	oFF.DateTimeGranularityType.HOUR = oFF.DateTimeGranularityType.create("HOUR");
	oFF.DateTimeGranularityType.MINUTE = oFF.DateTimeGranularityType.create("MINUTE");
	oFF.DateTimeGranularityType.SECOND = oFF.DateTimeGranularityType.create("SECOND");
	oFF.DateTimeGranularityType.MILLISECOND = oFF.DateTimeGranularityType.create("MILLISECOND");
};
oFF.DateTimeGranularityType.create = function(name)
{
	var newConstant = oFF.XConstant.setupName(new oFF.DateTimeGranularityType(), name);
	oFF.DateTimeGranularityType.s_lookup.add(newConstant);
	return newConstant;
};
oFF.DateTimeGranularityType.lookup = function(name)
{
	return oFF.DateTimeGranularityType.s_lookup.getByKey(name);
};

oFF.CurrencyPresentation = function() {};
oFF.CurrencyPresentation.prototype = new oFF.XConstant();
oFF.CurrencyPresentation.prototype._ff_c = "CurrencyPresentation";

oFF.CurrencyPresentation.s_all = null;
oFF.CurrencyPresentation.SYMBOL = null;
oFF.CurrencyPresentation.ISO = null;
oFF.CurrencyPresentation.staticSetup = function()
{
	oFF.CurrencyPresentation.s_all = oFF.XSetOfNameObject.create();
	oFF.CurrencyPresentation.SYMBOL = oFF.CurrencyPresentation.create("Symbol");
	oFF.CurrencyPresentation.ISO = oFF.CurrencyPresentation.create("Iso");
};
oFF.CurrencyPresentation.create = function(name)
{
	var newConstant = oFF.XConstant.setupName(new oFF.CurrencyPresentation(), name);
	oFF.CurrencyPresentation.s_all.add(newConstant);
	return newConstant;
};
oFF.CurrencyPresentation.lookup = function(name)
{
	return oFF.CurrencyPresentation.s_all.getByKey(name);
};

oFF.ScaleAndUnitPlacement = function() {};
oFF.ScaleAndUnitPlacement.prototype = new oFF.XConstant();
oFF.ScaleAndUnitPlacement.prototype._ff_c = "ScaleAndUnitPlacement";

oFF.ScaleAndUnitPlacement.s_all = null;
oFF.ScaleAndUnitPlacement.CELL = null;
oFF.ScaleAndUnitPlacement.ROWS = null;
oFF.ScaleAndUnitPlacement.COLUMNS = null;
oFF.ScaleAndUnitPlacement.SUBTITLE = null;
oFF.ScaleAndUnitPlacement.staticSetup = function()
{
	oFF.ScaleAndUnitPlacement.s_all = oFF.XSetOfNameObject.create();
	oFF.ScaleAndUnitPlacement.CELL = oFF.ScaleAndUnitPlacement.create("Cell");
	oFF.ScaleAndUnitPlacement.ROWS = oFF.ScaleAndUnitPlacement.create("Rows");
	oFF.ScaleAndUnitPlacement.COLUMNS = oFF.ScaleAndUnitPlacement.create("Columns");
	oFF.ScaleAndUnitPlacement.SUBTITLE = oFF.ScaleAndUnitPlacement.create("Subtitle");
};
oFF.ScaleAndUnitPlacement.create = function(name)
{
	var newConstant = oFF.XConstant.setupName(new oFF.ScaleAndUnitPlacement(), name);
	oFF.ScaleAndUnitPlacement.s_all.add(newConstant);
	return newConstant;
};
oFF.ScaleAndUnitPlacement.lookup = function(name)
{
	return oFF.ScaleAndUnitPlacement.s_all.getByKey(name);
};

oFF.ScaleFormat = function() {};
oFF.ScaleFormat.prototype = new oFF.XConstant();
oFF.ScaleFormat.prototype._ff_c = "ScaleFormat";

oFF.ScaleFormat.s_all = null;
oFF.ScaleFormat.SHORT = null;
oFF.ScaleFormat.LONG = null;
oFF.ScaleFormat.staticSetup = function()
{
	oFF.ScaleFormat.s_all = oFF.XSetOfNameObject.create();
	oFF.ScaleFormat.SHORT = oFF.ScaleFormat.create("Short");
	oFF.ScaleFormat.LONG = oFF.ScaleFormat.create("Long");
};
oFF.ScaleFormat.create = function(name)
{
	var newConstant = oFF.XConstant.setupName(new oFF.ScaleFormat(), name);
	oFF.ScaleFormat.s_all.add(newConstant);
	return newConstant;
};
oFF.ScaleFormat.lookup = function(name)
{
	return oFF.ScaleFormat.s_all.getByKey(name);
};

oFF.SignPresentation = function() {};
oFF.SignPresentation.prototype = new oFF.XConstant();
oFF.SignPresentation.prototype._ff_c = "SignPresentation";

oFF.SignPresentation.s_all = null;
oFF.SignPresentation.BEFORE_NUMBER = null;
oFF.SignPresentation.AFTER_NUMBER = null;
oFF.SignPresentation.BRACKETS = null;
oFF.SignPresentation.staticSetup = function()
{
	oFF.SignPresentation.s_all = oFF.XSetOfNameObject.create();
	oFF.SignPresentation.BEFORE_NUMBER = oFF.SignPresentation.create("BEFORE_NUMBER");
	oFF.SignPresentation.AFTER_NUMBER = oFF.SignPresentation.create("AFTER_NUMBER");
	oFF.SignPresentation.BRACKETS = oFF.SignPresentation.create("BRACKETS");
};
oFF.SignPresentation.create = function(name)
{
	var newConstant = oFF.XConstant.setupName(new oFF.SignPresentation(), name);
	oFF.SignPresentation.s_all.add(newConstant);
	return newConstant;
};
oFF.SignPresentation.lookup = function(name)
{
	return oFF.SignPresentation.s_all.getByKey(name);
};

oFF.TraceType = function() {};
oFF.TraceType.prototype = new oFF.XConstant();
oFF.TraceType.prototype._ff_c = "TraceType";

oFF.TraceType.NONE = null;
oFF.TraceType.URL = null;
oFF.TraceType.FILE = null;
oFF.TraceType.JSON = null;
oFF.TraceType.BW_STD = null;
oFF.TraceType.BW_CATT = null;
oFF.TraceType.staticSetup = function()
{
	oFF.TraceType.NONE = oFF.XConstant.setupName(new oFF.TraceType(), "None");
	oFF.TraceType.URL = oFF.XConstant.setupName(new oFF.TraceType(), "Url");
	oFF.TraceType.FILE = oFF.XConstant.setupName(new oFF.TraceType(), "File");
	oFF.TraceType.JSON = oFF.XConstant.setupName(new oFF.TraceType(), "JsonEmbedded");
	oFF.TraceType.BW_STD = oFF.XConstant.setupName(new oFF.TraceType(), "BWStd");
	oFF.TraceType.BW_CATT = oFF.XConstant.setupName(new oFF.TraceType(), "BWCATT");
};
oFF.TraceType.lookup = function(name)
{
	if (oFF.XStringUtils.isNullOrEmpty(name))
	{
		return null;
	}
	switch (name)
	{
		case "None":
			return oFF.TraceType.NONE;

		case "Url":
			return oFF.TraceType.URL;

		case "File":
			return oFF.TraceType.FILE;

		case "JsonEmbedded":
			return oFF.TraceType.JSON;

		case "BWStd":
			return oFF.TraceType.BW_STD;

		case "BWCATT":
			return oFF.TraceType.BW_CATT;

		default:
			return null;
	}
};

oFF.TriStateBool = function() {};
oFF.TriStateBool.prototype = new oFF.XConstant();
oFF.TriStateBool.prototype._ff_c = "TriStateBool";

oFF.TriStateBool._TRUE = null;
oFF.TriStateBool._FALSE = null;
oFF.TriStateBool._DEFAULT = null;
oFF.TriStateBool.staticSetup = function()
{
	oFF.TriStateBool._TRUE = oFF.TriStateBool.create("TRUE", true);
	oFF.TriStateBool._FALSE = oFF.TriStateBool.create("FALSE", false);
	oFF.TriStateBool._DEFAULT = oFF.TriStateBool.create("DEFAULT", false);
};
oFF.TriStateBool.create = function(constant, aequivalent)
{
	var object = new oFF.TriStateBool();
	object.setupExt(constant, aequivalent);
	return object;
};
oFF.TriStateBool.isExplicitBooleanValue = function(triStateBool)
{
	return triStateBool === oFF.TriStateBool._FALSE || triStateBool === oFF.TriStateBool._TRUE;
};
oFF.TriStateBool.getBooleanWithFallback = function(triStateBool, fallback)
{
	var result;
	if (triStateBool === oFF.TriStateBool._TRUE)
	{
		result = true;
	}
	else if (triStateBool === oFF.TriStateBool._FALSE)
	{
		result = false;
	}
	else
	{
		result = fallback;
	}
	return result;
};
oFF.TriStateBool.lookup = function(value)
{
	if (value)
	{
		return oFF.TriStateBool._TRUE;
	}
	return oFF.TriStateBool._FALSE;
};
oFF.TriStateBool.prototype.m_boolAequivalent = false;
oFF.TriStateBool.prototype.setupExt = function(constant, aequivalent)
{
	this._setupInternal(constant);
	this.m_boolAequivalent = aequivalent;
};
oFF.TriStateBool.prototype.getBoolean = function()
{
	return this.m_boolAequivalent;
};

oFF.XAccessModifier = function() {};
oFF.XAccessModifier.prototype = new oFF.XConstant();
oFF.XAccessModifier.prototype._ff_c = "XAccessModifier";

oFF.XAccessModifier.PRIVATE = null;
oFF.XAccessModifier.PROTECTED = null;
oFF.XAccessModifier.PUBLIC = null;
oFF.XAccessModifier.staticSetup = function()
{
	oFF.XAccessModifier.PRIVATE = oFF.XConstant.setupName(new oFF.XAccessModifier(), "Private");
	oFF.XAccessModifier.PROTECTED = oFF.XConstant.setupName(new oFF.XAccessModifier(), "Protected");
	oFF.XAccessModifier.PUBLIC = oFF.XConstant.setupName(new oFF.XAccessModifier(), "Public");
};

oFF.XMember = function() {};
oFF.XMember.prototype = new oFF.XClassElement();
oFF.XMember.prototype._ff_c = "XMember";

oFF.XMember.create = function(name, accessModifier)
{
	var member = new oFF.XMember();
	member._setupInternal(name);
	member.m_accessModifier = accessModifier;
	return member;
};

oFF.XMethod = function() {};
oFF.XMethod.prototype = new oFF.XClassElement();
oFF.XMethod.prototype._ff_c = "XMethod";

oFF.XMethod.create = function(name, accessModifier)
{
	var method = new oFF.XMethod();
	method._setupInternal(name);
	method.m_accessModifier = accessModifier;
	return method;
};

oFF.ExtendedInfoType = function() {};
oFF.ExtendedInfoType.prototype = new oFF.XConstant();
oFF.ExtendedInfoType.prototype._ff_c = "ExtendedInfoType";

oFF.ExtendedInfoType.UNKNOWN = null;
oFF.ExtendedInfoType.CONTEXT_STRUCTURE = null;
oFF.ExtendedInfoType.QUERY_MODEL_ID = null;
oFF.ExtendedInfoType.staticSetup = function()
{
	oFF.ExtendedInfoType.UNKNOWN = oFF.XConstant.setupName(new oFF.ExtendedInfoType(), "UNKNOWN");
	oFF.ExtendedInfoType.CONTEXT_STRUCTURE = oFF.XConstant.setupName(new oFF.ExtendedInfoType(), "CONTEXT_STRUCTURE");
	oFF.ExtendedInfoType.QUERY_MODEL_ID = oFF.XConstant.setupName(new oFF.ExtendedInfoType(), "QUERY_MODEL_ID");
};

oFF.SyncType = function() {};
oFF.SyncType.prototype = new oFF.XConstant();
oFF.SyncType.prototype._ff_c = "SyncType";

oFF.SyncType.BLOCKING = null;
oFF.SyncType.NON_BLOCKING = null;
oFF.SyncType.DELAYED = null;
oFF.SyncType.REGISTER = null;
oFF.SyncType.UNREGISTER = null;
oFF.SyncType.staticSetup = function()
{
	oFF.SyncType.BLOCKING = oFF.XConstant.setupName(new oFF.SyncType(), "Blocking");
	oFF.SyncType.NON_BLOCKING = oFF.XConstant.setupName(new oFF.SyncType(), "NonBlocking");
	oFF.SyncType.DELAYED = oFF.XConstant.setupName(new oFF.SyncType(), "Delayed");
	oFF.SyncType.REGISTER = oFF.XConstant.setupName(new oFF.SyncType(), "Register");
	oFF.SyncType.UNREGISTER = oFF.XConstant.setupName(new oFF.SyncType(), "Unregister");
};

oFF.XValueFormat = function() {};
oFF.XValueFormat.prototype = new oFF.XConstant();
oFF.XValueFormat.prototype._ff_c = "XValueFormat";

oFF.XValueFormat.ISO_DATE = null;
oFF.XValueFormat.SAP_DATE = null;
oFF.XValueFormat.staticSetup = function()
{
	oFF.XValueFormat.ISO_DATE = oFF.DateTimeFormat.ISO;
	oFF.XValueFormat.SAP_DATE = oFF.DateTimeFormat.SAP;
};

oFF.XComponentType = function() {};
oFF.XComponentType.prototype = new oFF.XConstantWithParent();
oFF.XComponentType.prototype._ff_c = "XComponentType";

oFF.XComponentType._ROOT = null;
oFF.XComponentType._ACTION = null;
oFF.XComponentType._UI = null;
oFF.XComponentType._DATASOURCE = null;
oFF.XComponentType._MODEL = null;
oFF.XComponentType._VALUE = null;
oFF.XComponentType._GENERIC = null;
oFF.XComponentType.PROGRAM = null;
oFF.XComponentType.s_lookupAll = null;
oFF.XComponentType.createType = function(name, parent)
{
	var newConstant = new oFF.XComponentType();
	newConstant.setupExt(name, parent);
	return newConstant;
};
oFF.XComponentType.staticSetupComponentType = function()
{
	oFF.XComponentType.s_lookupAll = oFF.XSetOfNameObject.create();
	oFF.XComponentType._ROOT = oFF.XComponentType.createType("_root", null);
	oFF.XComponentType._ACTION = oFF.XComponentType.createType("_action", oFF.XComponentType._ROOT);
	oFF.XComponentType._UI = oFF.XComponentType.createType("_ui", oFF.XComponentType._ROOT);
	oFF.XComponentType._DATASOURCE = oFF.XComponentType.createType("_datasource", oFF.XComponentType._ROOT);
	oFF.XComponentType._MODEL = oFF.XComponentType.createType("_model", oFF.XComponentType._ROOT);
	oFF.XComponentType._VALUE = oFF.XComponentType.createType("_value", oFF.XComponentType._ROOT);
	oFF.XComponentType._GENERIC = oFF.XComponentType.createType("_generic", oFF.XComponentType._ROOT);
	oFF.XComponentType.PROGRAM = oFF.XComponentType.createType("Program", oFF.XComponentType._ROOT);
};
oFF.XComponentType.lookupComponentType = function(name)
{
	return oFF.XComponentType.s_lookupAll.getByKey(name);
};
oFF.XComponentType.prototype.setupExt = function(name, parent)
{
	oFF.XConstantWithParent.prototype.setupExt.call( this , name, parent);
	oFF.XComponentType.s_lookupAll.add(this);
};

oFF.XErrorType = function() {};
oFF.XErrorType.prototype = new oFF.XConstantWithParent();
oFF.XErrorType.prototype._ff_c = "XErrorType";

oFF.XErrorType.GENERIC = null;
oFF.XErrorType.staticSetup = function()
{
	oFF.XErrorType.GENERIC = oFF.XErrorType.createExt("Generic", null);
};
oFF.XErrorType.createExt = function(constant, parent)
{
	var et = new oFF.XErrorType();
	if (oFF.notNull(parent))
	{
		et.setupExt(constant, parent);
	}
	else
	{
		et.setupExt(constant, null);
	}
	return et;
};
oFF.XErrorType.createError = function(a, errorName, parent)
{
	if (oFF.XStringUtils.isNullOrEmpty(errorName))
	{
		throw oFF.XException.createIllegalArgumentException("Missing name, you cannot create an error without a name!");
	}
	if (oFF.notNull(parent))
	{
		a.setupExt(errorName, parent);
	}
	else
	{
		a.setupExt(errorName, oFF.XErrorType.GENERIC);
	}
	return a;
};

oFF.CommonsModule = function() {};
oFF.CommonsModule.prototype = new oFF.DfModule();
oFF.CommonsModule.prototype._ff_c = "CommonsModule";

oFF.CommonsModule.s_module = null;
oFF.CommonsModule.getInstance = function()
{
	if (oFF.isNull(oFF.CommonsModule.s_module))
	{
		oFF.DfModule.checkInitialized(oFF.CoreExtModule.getInstance());
		oFF.CommonsModule.s_module = oFF.DfModule.startExt(new oFF.CommonsModule());
		oFF.XComponentType.staticSetupComponentType();
		oFF.XLogBufferNull.staticSetup();
		oFF.ExtendedInfoType.staticSetup();
		oFF.DateTimeFormat.staticSetup();
		oFF.DateTimeGranularityType.staticSetup();
		oFF.DateRangeGranularity.staticSetup();
		oFF.XValueFormat.staticSetup();
		oFF.CurrencyPresentation.staticSetup();
		oFF.ScaleFormat.staticSetup();
		oFF.ScaleAndUnitPlacement.staticSetup();
		oFF.SignPresentation.staticSetup();
		oFF.TraceType.staticSetup();
		oFF.TriStateBool.staticSetup();
		oFF.XAccessModifier.staticSetup();
		oFF.SyncType.staticSetup();
		oFF.XErrorType.staticSetup();
		oFF.DfModule.stopExt(oFF.CommonsModule.s_module);
	}
	return oFF.CommonsModule.s_module;
};
oFF.CommonsModule.prototype.getName = function()
{
	return "ff0040.commons";
};

oFF.CommonsModule.getInstance();

return sap.firefly;
	} );