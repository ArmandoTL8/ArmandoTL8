/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
[
"sap/sac/df/firefly/ff0000.language.native"
],
function(oFF)
{
"use strict";

oFF.XApiVersion = {

	LIBRARY:21041200,
	GIT_COMMIT_ID:"$$GitCommitId$$",
	API_ACTIVE:0,
	API_MAX:3,
	API_MIN:2,
	API_DEFAULT:2,
	API_V2_COLLECTIONS:2,
	API_V3_SYNC_ACTION:3
};

oFF.DfIdObject = function() {};
oFF.DfIdObject.prototype = new oFF.XObject();
oFF.DfIdObject.prototype._ff_c = "DfIdObject";

oFF.DfIdObject.prototype.m_id = null;
oFF.DfIdObject.prototype.setupExt = function(identifier)
{
	oFF.XObject.prototype.setup.call( this );
	this.m_id = identifier;
};
oFF.DfIdObject.prototype.getId = function()
{
	return this.m_id;
};
oFF.DfIdObject.prototype.toString = function()
{
	return this.getId();
};
oFF.DfIdObject.prototype.releaseObject = function()
{
	this.m_id = null;
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.XBiConsumerHolder = function() {};
oFF.XBiConsumerHolder.prototype = new oFF.XObject();
oFF.XBiConsumerHolder.prototype._ff_c = "XBiConsumerHolder";

oFF.XBiConsumerHolder.create = function(consumer)
{
	var holderInstance = new oFF.XBiConsumerHolder();
	holderInstance.m_internalConsumer = consumer;
	return holderInstance;
};
oFF.XBiConsumerHolder.prototype.m_internalConsumer = null;
oFF.XBiConsumerHolder.prototype.releaseObject = function()
{
	this.m_internalConsumer = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.XBiConsumerHolder.prototype.accept = function(t, u)
{
	if (oFF.notNull(this.m_internalConsumer))
	{
		this.m_internalConsumer(t, u);
	}
};
oFF.XBiConsumerHolder.prototype.getConsumer = function()
{
	return this.m_internalConsumer;
};

oFF.XBiFunctionHolder = function() {};
oFF.XBiFunctionHolder.prototype = new oFF.XObject();
oFF.XBiFunctionHolder.prototype._ff_c = "XBiFunctionHolder";

oFF.XBiFunctionHolder.create = function(_function)
{
	var holderInstance = new oFF.XBiFunctionHolder();
	holderInstance.m_internalFunction = _function;
	return holderInstance;
};
oFF.XBiFunctionHolder.prototype.m_internalFunction = null;
oFF.XBiFunctionHolder.prototype.releaseObject = function()
{
	this.m_internalFunction = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.XBiFunctionHolder.prototype.apply = function(t, u)
{
	if (oFF.notNull(this.m_internalFunction))
	{
		return this.m_internalFunction(t, u);
	}
	return null;
};
oFF.XBiFunctionHolder.prototype.getFunction = function()
{
	return this.m_internalFunction;
};

oFF.XConsumerHolder = function() {};
oFF.XConsumerHolder.prototype = new oFF.XObject();
oFF.XConsumerHolder.prototype._ff_c = "XConsumerHolder";

oFF.XConsumerHolder.create = function(consumer)
{
	var holderInstance = new oFF.XConsumerHolder();
	holderInstance.m_internalConsumer = consumer;
	return holderInstance;
};
oFF.XConsumerHolder.prototype.m_internalConsumer = null;
oFF.XConsumerHolder.prototype.releaseObject = function()
{
	this.m_internalConsumer = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.XConsumerHolder.prototype.accept = function(t)
{
	if (oFF.notNull(this.m_internalConsumer))
	{
		this.m_internalConsumer(t);
	}
};
oFF.XConsumerHolder.prototype.getConsumer = function()
{
	return this.m_internalConsumer;
};

oFF.XFunctionHolder = function() {};
oFF.XFunctionHolder.prototype = new oFF.XObject();
oFF.XFunctionHolder.prototype._ff_c = "XFunctionHolder";

oFF.XFunctionHolder.create = function(_function)
{
	var holderInstance = new oFF.XFunctionHolder();
	holderInstance.m_internalFunction = _function;
	return holderInstance;
};
oFF.XFunctionHolder.prototype.m_internalFunction = null;
oFF.XFunctionHolder.prototype.releaseObject = function()
{
	this.m_internalFunction = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.XFunctionHolder.prototype.apply = function(t)
{
	if (oFF.notNull(this.m_internalFunction))
	{
		return this.m_internalFunction(t);
	}
	return null;
};

oFF.XKeyValuePair = function() {};
oFF.XKeyValuePair.prototype = new oFF.XObject();
oFF.XKeyValuePair.prototype._ff_c = "XKeyValuePair";

oFF.XKeyValuePair.create = function()
{
	return new oFF.XKeyValuePair();
};
oFF.XKeyValuePair.prototype.m_key = null;
oFF.XKeyValuePair.prototype.m_value = null;
oFF.XKeyValuePair.prototype.m_valueType = null;
oFF.XKeyValuePair.prototype.setKey = function(key)
{
	this.m_key = key;
};
oFF.XKeyValuePair.prototype.setValue = function(value)
{
	this.m_value = value;
};
oFF.XKeyValuePair.prototype.setKeyValue = function(key, value)
{
	this.m_key = key;
	this.m_value = value;
};
oFF.XKeyValuePair.prototype.getKey = function()
{
	return this.m_key;
};
oFF.XKeyValuePair.prototype.getValue = function()
{
	return this.m_value;
};
oFF.XKeyValuePair.prototype.setValueType = function(valueType)
{
	this.m_valueType = valueType;
};
oFF.XKeyValuePair.prototype.getValueType = function()
{
	return this.m_valueType;
};
oFF.XKeyValuePair.prototype.toString = function()
{
	var str = oFF.XStringBuffer.create();
	str.append("Key ");
	if (oFF.notNull(this.m_key))
	{
		str.append(this.m_key.toString());
	}
	str.append("Value ");
	if (oFF.notNull(this.m_value))
	{
		str.append(this.m_value.toString());
	}
	return str.toString();
};
oFF.XKeyValuePair.prototype.releaseObject = function()
{
	this.m_key = null;
	this.m_value = null;
	this.m_valueType = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.XKeyValuePair.prototype.cloneExt = function(flags)
{
	var clone = oFF.XKeyValuePair.create();
	clone.setKey(this.m_key);
	clone.setValue(this.m_value);
	clone.setValueType(this.getValueType());
	return clone;
};
oFF.XKeyValuePair.prototype.isEqualTo = function(other)
{
	if (oFF.isNull(other))
	{
		return false;
	}
	if (this === other)
	{
		return true;
	}
	var otherPair = other;
	if (otherPair.getValueType() !== this.getValueType())
	{
		return false;
	}
	if (!otherPair.getKey().isEqualTo(this.m_key))
	{
		return false;
	}
	if (!otherPair.getValue().isEqualTo(this.m_value))
	{
		return false;
	}
	return true;
};

oFF.XNameObjectConsumerHolder = function() {};
oFF.XNameObjectConsumerHolder.prototype = new oFF.XObject();
oFF.XNameObjectConsumerHolder.prototype._ff_c = "XNameObjectConsumerHolder";

oFF.XNameObjectConsumerHolder.create = function(biConsumer)
{
	var holderInstance = new oFF.XNameObjectConsumerHolder();
	holderInstance.m_internalBiConsumer = biConsumer;
	return holderInstance;
};
oFF.XNameObjectConsumerHolder.prototype.m_internalBiConsumer = null;
oFF.XNameObjectConsumerHolder.prototype.releaseObject = function()
{
	this.m_internalBiConsumer = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.XNameObjectConsumerHolder.prototype.accept = function(name, t)
{
	if (oFF.notNull(this.m_internalBiConsumer))
	{
		this.m_internalBiConsumer(name, t);
	}
};
oFF.XNameObjectConsumerHolder.prototype.getBiConsumer = function()
{
	return this.m_internalBiConsumer;
};

oFF.XProcedureHolder = function() {};
oFF.XProcedureHolder.prototype = new oFF.XObject();
oFF.XProcedureHolder.prototype._ff_c = "XProcedureHolder";

oFF.XProcedureHolder.create = function(procedure)
{
	var holderInstance = new oFF.XProcedureHolder();
	holderInstance.m_internalProcedure = procedure;
	return holderInstance;
};
oFF.XProcedureHolder.prototype.m_internalProcedure = null;
oFF.XProcedureHolder.prototype.releaseObject = function()
{
	this.m_internalProcedure = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.XProcedureHolder.prototype.execute = function()
{
	if (oFF.notNull(this.m_internalProcedure))
	{
		this.m_internalProcedure();
	}
};
oFF.XProcedureHolder.prototype.getProcedure = function()
{
	return this.m_internalProcedure;
};

oFF.XBooleanUtils = {

	checkTrue:function(value, message)
	{
			if (!value)
		{
			throw oFF.XException.createRuntimeException(message);
		}
	},
	checkFalse:function(value, message)
	{
			if (value)
		{
			throw oFF.XException.createRuntimeException(message);
		}
	}
};

oFF.XStringUtils = {

	checkStringNotEmpty:function(value, message)
	{
			if (oFF.XStringUtils.isNullOrEmpty(value))
		{
			if (oFF.isNull(message))
			{
				throw oFF.XException.createIllegalArgumentException("The value must not be null!");
			}
			throw oFF.XException.createIllegalArgumentException(message);
		}
	},
	stripChars:function(value, numberOfChars)
	{
			if (numberOfChars < 1)
		{
			return value;
		}
		var size = oFF.XString.size(value);
		if (numberOfChars * 2 > size)
		{
			return "";
		}
		return oFF.XString.substring(value, numberOfChars, size - numberOfChars);
	},
	stripStart:function(text, valueToRemove)
	{
			var result = text;
		if (oFF.XStringUtils.isNotNullAndNotEmpty(result) && oFF.XStringUtils.isNotNullAndNotEmpty(valueToRemove))
		{
			while (oFF.XString.startsWith(result, valueToRemove))
			{
				result = oFF.XString.substring(result, oFF.XString.size(valueToRemove), -1);
			}
		}
		return result;
	},
	stripRight:function(value, numberOfChars)
	{
			if (numberOfChars < 1)
		{
			return value;
		}
		var size = oFF.XString.size(value);
		if (numberOfChars > size)
		{
			return "";
		}
		return oFF.XString.substring(value, 0, size - numberOfChars);
	},
	leftPad:function(value, spacer, count)
	{
			var buffer = oFF.XStringBuffer.create();
		for (var i = 0; i < count; i++)
		{
			buffer.append(spacer);
		}
		buffer.append(value);
		return buffer.toString();
	},
	rightPad:function(value, spacer, count)
	{
			var buffer = oFF.XStringBuffer.create().append(value);
		for (var i = 0; i < count; i++)
		{
			buffer.append(spacer);
		}
		return buffer.toString();
	},
	isNullOrEmpty:function(value)
	{
			return oFF.isNull(value) || oFF.XString.isEqual(value, "");
	},
	assertNotNullOrEmpty:function(s)
	{
			if (oFF.XStringUtils.isNullOrEmpty(s))
		{
			throw oFF.XException.createRuntimeException("The string must not be null or empty.");
		}
		return s;
	},
	isNotNullAndNotEmpty:function(value)
	{
			return oFF.notNull(value) && !oFF.XString.isEqual(value, "");
	},
	concatenate2:function(s1, s2)
	{
			var buffer = oFF.XStringBuffer.create().append(s1).append(s2);
		return buffer.toString();
	},
	concatenate3:function(s1, s2, s3)
	{
			var buffer = oFF.XStringBuffer.create().append(s1).append(s2).append(s3);
		return buffer.toString();
	},
	concatenate4:function(s1, s2, s3, s4)
	{
			var buffer = oFF.XStringBuffer.create().append(s1).append(s2).append(s3).append(s4);
		return buffer.toString();
	},
	concatenate5:function(s1, s2, s3, s4, s5)
	{
			var buffer = oFF.XStringBuffer.create().append(s1).append(s2).append(s3).append(s4).append(s5);
		return buffer.toString();
	},
	concatenateWithInt:function(s1, s2)
	{
			var buffer = oFF.XStringBuffer.create().append(s1).appendInt(s2);
		return buffer.toString();
	},
	normalizeLineEndings:function(value)
	{
			if (oFF.XStringUtils.isNullOrEmpty(value))
		{
			return value;
		}
		var normalizedString = oFF.XString.replace(value, "\r\n", "\n");
		return oFF.XString.replace(normalizedString, "\r", "\n");
	},
	normalizeLineEndingsToUnix:function(value)
	{
			return oFF.XStringUtils.normalizeLineEndings(value);
	},
	normalizeLineEndingsToWindows:function(value)
	{
			if (oFF.XStringUtils.isNullOrEmpty(value))
		{
			return value;
		}
		var normalizedString = oFF.XString.replace(value, "\r\n", "\n");
		normalizedString = oFF.XString.replace(normalizedString, "\r", "\n");
		return oFF.XString.replace(normalizedString, "\n", "\r\n");
	},
	isAlphaNumeric:function(value)
	{
			if (oFF.XStringUtils.isNullOrEmpty(value))
		{
			return true;
		}
		var isCharPresent = false;
		var isNumPresent = false;
		var safeDefault = -999;
		var len = oFF.XString.size(value);
		for (var i = 0; i < len; i++)
		{
			var s = oFF.XString.substring(value, i, i + 1);
			var convertStringToIntegerWithDefault = oFF.XInteger.convertFromStringWithDefault(s, safeDefault);
			if (convertStringToIntegerWithDefault === safeDefault)
			{
				isCharPresent = true;
			}
			else
			{
				isNumPresent = true;
			}
			if (isNumPresent && isCharPresent)
			{
				return true;
			}
		}
		return false;
	},
	containsString:function(s1, s2, ignoreCase)
	{
			if (!ignoreCase)
		{
			return oFF.XString.containsString(s1, s2);
		}
		var isS1Empty = oFF.XStringUtils.isNullOrEmpty(s1);
		var isS2Empty = oFF.XStringUtils.isNullOrEmpty(s2);
		if (isS1Empty && isS2Empty)
		{
			return true;
		}
		if (isS1Empty !== isS2Empty)
		{
			return false;
		}
		var s1UC = oFF.XString.toUpperCase(s1);
		var s2UC = oFF.XString.toUpperCase(s2);
		return oFF.XString.containsString(s1UC, s2UC);
	},
	isWildcardPatternMatching:function(value, searchPattern)
	{
			var starting = null;
		var matching = true;
		var restPattern = searchPattern;
		var restValue = value;
		var pendingWildcardSkip = false;
		while (matching)
		{
			var pos = oFF.XString.indexOf(restPattern, "*");
			if (pos < 0)
			{
				matching = pendingWildcardSkip ? oFF.XString.size(restPattern) === 0 || oFF.XString.endsWith(restValue, restPattern) : oFF.XString.isEqual(restValue, restPattern);
				break;
			}
			else if (pos === 0)
			{
				pendingWildcardSkip = true;
				restPattern = oFF.XString.substring(restPattern, 1, -1);
			}
			else if (pos > 0)
			{
				starting = oFF.XString.substring(restPattern, 0, pos);
				var matchIndex = oFF.XString.indexOf(restValue, starting);
				matching = pendingWildcardSkip ? matchIndex > -1 : matchIndex === 0;
				if (matching)
				{
					restPattern = oFF.XString.substring(restPattern, pos, -1);
					restValue = oFF.XString.substring(restValue, matchIndex + pos, -1);
					pendingWildcardSkip = false;
				}
			}
		}
		return matching;
	},
	escapeHtml:function(text)
	{
			var result = oFF.XString.replace(text, "&", "&#38;");
		result = oFF.XString.replace(result, "<", "&#60;");
		result = oFF.XString.replace(result, ">", "&#62;");
		result = oFF.XString.replace(result, "\"", "&#34;");
		return result;
	},
	escapeCodeString:function(text)
	{
			var result = oFF.XString.replace(text, "\r", "\\r");
		result = oFF.XString.replace(result, "\n", "\\n");
		result = oFF.XString.replace(result, "\"", "\\\"");
		return result;
	},
	escapeJsonForCode:function(jsonValue)
	{
			var result = oFF.XString.replace(jsonValue, "\\", "\\\\");
		result = oFF.XString.replace(result, "\r", "\\r");
		result = oFF.XString.replace(result, "\n", "\\n");
		result = oFF.XString.replace(result, "\"", "\\\"");
		return result;
	},
	escapeControlChars:function(text)
	{
			var escapedString = text;
		if (oFF.XString.containsString(escapedString, "\u0001"))
		{
			escapedString = oFF.XString.replace(escapedString, "\u0001", "\\u0001");
		}
		if (oFF.XString.containsString(escapedString, "\u0002"))
		{
			escapedString = oFF.XString.replace(escapedString, "\u0002", "\\u0002");
		}
		if (oFF.XString.containsString(escapedString, "\u0003"))
		{
			escapedString = oFF.XString.replace(escapedString, "\u0003", "\\u0003");
		}
		if (oFF.XString.containsString(escapedString, "\u0004"))
		{
			escapedString = oFF.XString.replace(escapedString, "\u0004", "\\u0004");
		}
		if (oFF.XString.containsString(escapedString, "\u0005"))
		{
			escapedString = oFF.XString.replace(escapedString, "\u0005", "\\u0005");
		}
		if (oFF.XString.containsString(escapedString, "\u0006"))
		{
			escapedString = oFF.XString.replace(escapedString, "\u0006", "\\u0006");
		}
		if (oFF.XString.containsString(escapedString, "\u0007"))
		{
			escapedString = oFF.XString.replace(escapedString, "\u0007", "\\u0007");
		}
		if (oFF.XString.containsString(escapedString, "\u000B"))
		{
			escapedString = oFF.XString.replace(escapedString, "\u000B", "\\u000B");
		}
		if (oFF.XString.containsString(escapedString, "\u000E"))
		{
			escapedString = oFF.XString.replace(escapedString, "\u000E", "\\u000E");
		}
		if (oFF.XString.containsString(escapedString, "\u000F"))
		{
			escapedString = oFF.XString.replace(escapedString, "\u000F", "\\u000F");
		}
		if (oFF.XString.containsString(escapedString, "\u0010"))
		{
			escapedString = oFF.XString.replace(escapedString, "\u0010", "\\u0010");
		}
		if (oFF.XString.containsString(escapedString, "\u0011"))
		{
			escapedString = oFF.XString.replace(escapedString, "\u0011", "\\u0011");
		}
		if (oFF.XString.containsString(escapedString, "\u0012"))
		{
			escapedString = oFF.XString.replace(escapedString, "\u0012", "\\u0012");
		}
		if (oFF.XString.containsString(escapedString, "\u0013"))
		{
			escapedString = oFF.XString.replace(escapedString, "\u0013", "\\u0013");
		}
		if (oFF.XString.containsString(escapedString, "\u0014"))
		{
			escapedString = oFF.XString.replace(escapedString, "\u0014", "\\u0014");
		}
		if (oFF.XString.containsString(escapedString, "\u0015"))
		{
			escapedString = oFF.XString.replace(escapedString, "\u0015", "\\u0015");
		}
		if (oFF.XString.containsString(escapedString, "\u0016"))
		{
			escapedString = oFF.XString.replace(escapedString, "\u0016", "\\u0016");
		}
		if (oFF.XString.containsString(escapedString, "\u0017"))
		{
			escapedString = oFF.XString.replace(escapedString, "\u0017", "\\u0017");
		}
		if (oFF.XString.containsString(escapedString, "\u0018"))
		{
			escapedString = oFF.XString.replace(escapedString, "\u0018", "\\u0018");
		}
		if (oFF.XString.containsString(escapedString, "\u0019"))
		{
			escapedString = oFF.XString.replace(escapedString, "\u0019", "\\u0019");
		}
		if (oFF.XString.containsString(escapedString, "\u001A"))
		{
			escapedString = oFF.XString.replace(escapedString, "\u001A", "\\u001A");
		}
		if (oFF.XString.containsString(escapedString, "\u001B"))
		{
			escapedString = oFF.XString.replace(escapedString, "\u001B", "\\u001B");
		}
		if (oFF.XString.containsString(escapedString, "\u001C"))
		{
			escapedString = oFF.XString.replace(escapedString, "\u001C", "\\u001C");
		}
		if (oFF.XString.containsString(escapedString, "\u001D"))
		{
			escapedString = oFF.XString.replace(escapedString, "\u001D", "\\u001D");
		}
		if (oFF.XString.containsString(escapedString, "\u001E"))
		{
			escapedString = oFF.XString.replace(escapedString, "\u001E", "\\u001E");
		}
		if (oFF.XString.containsString(escapedString, "\u001F"))
		{
			escapedString = oFF.XString.replace(escapedString, "\u001F", "\\u001F");
		}
		return escapedString;
	},
	escapeLineEndings:function(text)
	{
			var escapedString = text;
		escapedString = oFF.XString.replace(escapedString, "\n", "&#10;");
		escapedString = oFF.XString.replace(escapedString, "\r", "&#13;");
		return escapedString;
	},
	unescapeLineEndings:function(text)
	{
			var escapedString = text;
		escapedString = oFF.XString.replace(escapedString, "&#10;", "\n");
		escapedString = oFF.XString.replace(escapedString, "&#13;", "\r");
		return escapedString;
	},
	_convertCamelCase:function(name, seperator)
	{
			var size = oFF.XString.size(name);
		var buffer = oFF.XStringBuffer.create();
		var mode = 0;
		for (var i = 0; i < size; i++)
		{
			var charAt = oFF.XString.getCharAt(name, i);
			var newMode = 0;
			if (charAt >= 48 && charAt <= 57)
			{
				newMode = 1;
			}
			else if (charAt >= 65 && charAt <= 90)
			{
				newMode = 2;
			}
			else if (charAt >= 97 && charAt <= 122)
			{
				newMode = 3;
			}
			if (newMode !== mode && newMode !== 3 && i > 0)
			{
				buffer.append(seperator);
			}
			mode = newMode;
			buffer.appendChar(charAt);
		}
		return buffer.toString();
	},
	camelCaseToKebapCase:function(name)
	{
			if (oFF.isNull(name))
		{
			return name;
		}
		return oFF.XStringUtils._convertCamelCase(name, "-");
	},
	camelCaseToUpperCase:function(name)
	{
			if (oFF.isNull(name))
		{
			return name;
		}
		return oFF.XString.toUpperCase(oFF.XStringUtils._convertCamelCase(name, "_"));
	},
	camelCaseToDisplayText:function(name)
	{
			if (oFF.isNull(name))
		{
			return name;
		}
		return oFF.XStringUtils._convertCamelCase(name, " ");
	},
	addNumberPadded:function(number, digitSize)
	{
			var buffer = oFF.XStringBuffer.create();
		var numberAsString = oFF.XInteger.convertToString(number);
		var size = oFF.XString.size(numberAsString);
		for (var i = size; i < digitSize; i++)
		{
			buffer.append("0");
		}
		buffer.append(numberAsString);
		return buffer.toString();
	},
	repeat:function(value, count)
	{
			var buffer = oFF.XStringBuffer.create();
		for (var i = 0; i < count; i++)
		{
			buffer.append(value);
		}
		return buffer.toString();
	},
	isNumber:function(inputString)
	{
			try
		{
			oFF.XDouble.convertFromString(inputString);
			return true;
		}
		catch (exception)
		{
			return false;
		}
	},
	capitalize:function(text)
	{
			if (oFF.XStringUtils.isNullOrEmpty(text))
		{
			return text;
		}
		var capitalizedText = oFF.XString.toLowerCase(text);
		capitalizedText = oFF.XStringUtils.concatenate2(oFF.XString.toUpperCase(oFF.XString.substring(capitalizedText, 0, 1)), oFF.XString.substring(capitalizedText, 1, -1));
		return capitalizedText;
	},
	nullToEmpty:function(value)
	{
			return oFF.isNull(value) ? "" : value;
	}
};

oFF.XLogBufferFlushing = function() {};
oFF.XLogBufferFlushing.prototype = new oFF.XObject();
oFF.XLogBufferFlushing.prototype._ff_c = "XLogBufferFlushing";

oFF.XLogBufferFlushing.create = function(logWriter, layer, severity, code)
{
	var bufferLog = new oFF.XLogBufferFlushing();
	bufferLog.m_logWriter = logWriter;
	bufferLog.m_layer = layer;
	bufferLog.m_severity = severity;
	bufferLog.m_code = code;
	bufferLog.m_buffer = oFF.XStringBuffer.create();
	return bufferLog;
};
oFF.XLogBufferFlushing.prototype.m_buffer = null;
oFF.XLogBufferFlushing.prototype.m_logWriter = null;
oFF.XLogBufferFlushing.prototype.m_layer = null;
oFF.XLogBufferFlushing.prototype.m_severity = null;
oFF.XLogBufferFlushing.prototype.m_code = 0;
oFF.XLogBufferFlushing.prototype.append = function(value)
{
	this.m_buffer.append(value);
	return this;
};
oFF.XLogBufferFlushing.prototype.appendChar = function(value)
{
	this.m_buffer.appendChar(value);
	return this;
};
oFF.XLogBufferFlushing.prototype.appendBoolean = function(value)
{
	this.m_buffer.appendBoolean(value);
	return this;
};
oFF.XLogBufferFlushing.prototype.appendInt = function(value)
{
	this.m_buffer.appendInt(value);
	return this;
};
oFF.XLogBufferFlushing.prototype.appendLong = function(value)
{
	this.m_buffer.appendLong(value);
	return this;
};
oFF.XLogBufferFlushing.prototype.appendDouble = function(value)
{
	this.m_buffer.appendDouble(value);
	return this;
};
oFF.XLogBufferFlushing.prototype.appendObject = function(value)
{
	this.m_buffer.appendObject(value);
	return this;
};
oFF.XLogBufferFlushing.prototype.appendNewLine = function()
{
	this.m_buffer.appendNewLine();
	return this;
};
oFF.XLogBufferFlushing.prototype.appendLine = function(value)
{
	this.m_buffer.appendLine(value);
	return this;
};
oFF.XLogBufferFlushing.prototype.length = function()
{
	return this.m_buffer.length();
};
oFF.XLogBufferFlushing.prototype.clear = function()
{
	this.m_buffer.clear();
};
oFF.XLogBufferFlushing.prototype.flush = function()
{
	if (oFF.notNull(this.m_logWriter) && this.m_logWriter.isLogWritten(this.m_layer, this.m_severity))
	{
		this.m_logWriter.logExt(this.m_layer, this.m_severity, this.m_code, this.m_buffer.toString());
	}
};

oFF.XAutoReleaseManager = function() {};
oFF.XAutoReleaseManager.prototype = new oFF.XObject();
oFF.XAutoReleaseManager.prototype._ff_c = "XAutoReleaseManager";

oFF.XAutoReleaseManager.s_manager = null;
oFF.XAutoReleaseManager.staticSetup = function()
{
	oFF.XAutoReleaseManager.setInstance(new oFF.XAutoReleaseManager());
};
oFF.XAutoReleaseManager.getInstance = function()
{
	return oFF.XAutoReleaseManager.s_manager;
};
oFF.XAutoReleaseManager.setInstance = function(manager)
{
	oFF.XAutoReleaseManager.s_manager = manager;
};
oFF.XAutoReleaseManager.prototype.execute = function(autoReleaseBlock)
{
	autoReleaseBlock.executeAutoReleaseBlock();
};
oFF.XAutoReleaseManager.prototype.getMemoryUsage = function()
{
	return -1;
};

oFF.XWeakReferenceUtil = {

	getHardRef:function(weakReference)
	{
			if (oFF.isNull(weakReference))
		{
			return null;
		}
		var reference = weakReference.getReference();
		if (oFF.isNull(reference) || reference.isReleased())
		{
			return null;
		}
		return reference;
	},
	getWeakRef:function(context)
	{
			if (oFF.isNull(context) || context.isReleased())
		{
			return null;
		}
		return oFF.XWeakReference.create(context);
	}
};

oFF.ErrorCodes = {

	OTHER_ERROR:0,
	PARSER_ERROR:10,
	IMPORT_FILTER_CAPABILITY_NOT_FOUND:20,
	IMPORT_FILTER_CAPABILITY_UNSUPPORTED_OPERATORS:21,
	IMPORT_VARIABE_NO_DIMENSION:30,
	IMPORT_EXCEPTION_INACTIVE:40,
	IMPORT_EXCEPTION_NO_THRESHOLDS:41,
	IMPORT_EXCEPTION_INVALID_EVALUATE:42,
	IMPORT_EXTERNAL_FILTER_NOT_FOUND:43,
	INVALID_STATE:50,
	INVALID_DATATYPE:51,
	INVALID_TOKEN:52,
	INVALID_OPERATOR:53,
	INVALID_DIMENSION:54,
	INVALID_PARAMETER:55,
	INVALID_FIELD:56,
	INVALID_URL:60,
	HOST_UNREACHABLE:61,
	SYSTEM_IO:70,
	SYSTEM_IO_READ_ACCESS:71,
	SYSTEM_IO_WRITE_ACCESS:72,
	SYSTEM_IO_HTTP:73,
	INVALID_SYSTEM:80,
	INVALID_SERVER_METADATA_JSON:81,
	PARSING_ERROR_DOUBLE_VALUE:85,
	PARSING_ERROR_INT_VALUE:86,
	PARSING_ERROR_LONG_VALUE:87,
	PARSING_ERROR_BOOLEAN_VALUE:88,
	PARSING_ERROR_DATE_VALUE:89,
	PARSING_ERROR_TIME_VALUE:90,
	PARSING_ERROR_DATE_TIME_VALUE:91,
	PARSING_ERROR_TIMESPAN:92,
	PARSING_ERROR_LINESTRING:93,
	PARSING_ERROR_MULTILINESTRING:94,
	PARSING_ERROR_POINT:95,
	PARSING_ERROR_MULTI_POINT:96,
	PARSING_ERROR_POLYGON:97,
	PARSING_ERROR_MULTI_POLYGON:98,
	PARSING_ERROR_CONDITIONS_COUNT:99,
	PARSING_ERROR_COMPLEX_UNITS:100,
	MODEL_INFRASTRUCTURE_TERMINATED:300,
	CUSTOM_HIERARCHY_EXPIRED:333,
	SERVICE_ROOT_EXCEPTION:2500,
	SERVICE_NOT_FOUND:2501,
	SERVER_METADATA_NOT_FOUND:2502,
	BASIC_AUTHENTICATION_CANCELED:2503,
	PROGRAM_FAILED_TO_START:2504,
	ET_WRONG_TYPE:2600,
	ET_WRONG_VALUE:2601,
	ET_ELEMENT_NOT_FOUND:2602,
	ET_INVALID_CHILDREN:2603,
	ET_INVALID_VALUE:2604,
	ET_BLACK_CAP:2605,
	ET_WHITE_CAP:2606,
	QM_CUBE_ENTRY_NOT_FOUND:2700,
	FREE_PLACEHOLDER_NOT_FOUND:2701,
	JOIN_FIELD_SET_AS_IGNORED_EXTERNAL_DIMENSION:2702,
	SAME_DIMENSION_FILTERS_IGNORED:2703,
	DYNAMIC_TIME_MEASURE_NOT_SUPPORTED:2800,
	DYNAMIC_TIME_MEASURE_INVALID_TIME_DIMENSION:2801,
	DYNAMIC_TIME_MEASURE_INVALID_TIME_OPERATION_FUNCTION:2802,
	DYNAMIC_TIME_MEASURE_INVALID_TIME_OPERATION_GRANULARITY:2803,
	DYNAMIC_TIME_MEASURE_INVALID_TIME_OPERATION_GRANULARITY_NOT_IN_HIERARCHY:2804,
	DYNAMIC_TIME_MEASURE_INVALID_TIME_OPERATION_GRANULARITY_IS_FINER_THAN_DRILL_LEVEL:2805,
	DYNAMIC_TIME_MEASURE_INVALID_TO_DATE_FUNCTION_GRANULARITY:2806,
	DYNAMIC_TIME_MEASURE_INVALID_DRILL_LEVEL:2807,
	DYNAMIC_TIME_MEASURE_INVALID_FINEST_DRILL_LEVEL:2808,
	DYNAMIC_TIME_MEASURE_INVALID_MULTIPLE_TIME_DIMENSION_IN_CARTESIAN_PRODUCT:2809,
	DYNAMIC_TIME_MEASURE_NO_TIME_IN_AXIS_OR_SINGLE_VALUE_FILTER:2810,
	DYNAMIC_TIME_MEASURE_INVALID_TIME_OPERATION_GRANULARITY_ON_WEEK_DAY_DRILL_LEVEL:2811,
	DYNAMIC_TIME_MEASURE_INVALID_TIME_OPERATION_GRANULARITY_ON_WEEK_DAY_FILTER_LEVEL:2812,
	DYNAMIC_TIME_MEASURE_INVALID_TIME_OPERATION_GRANULARITY_IS_FINER_THAN_FILTER_LEVEL:2813,
	DYNAMIC_TIME_MEASURE_INVALID_PREVIOUS_PERIOD_NOT_DRILLED:2814,
	DYNAMIC_TIME_MEASURE_OUT_OF_BOUND_MEMBER_NAVIGATION_WITH_FLAT_FILTER:2815,
	DYNAMIC_TIME_MEASURE_INVALID_MEMBER_NAVIGATION_WITH_FLAT_AND_HIERARCHICAL_FILTER:2816,
	DYNAMIC_TIME_MEASURE_INVALID_DEPENDENCY:2817,
	DYNAMIC_TIME_MEASURE_INVALID_WEEK_ACROSS_YEAR_SINGLE_VALUE_FILTER:2818,
	FORMULA_MEASURE_MISSING_REQUIRED_DIMENSION:2819,
	DYNAMIC_TIME_MEASURE_INVALID_TO_DATE_ACROSS_MULTIPLE_VALUES:2820,
	MEASURE_MISSING_REQUIRED_FIELD:2821,
	MEASURE_MISSING_REQUIRED_DIMENSION:2822,
	THRESHOLD_MISSING_REFERENCE_MEASURE:2823,
	THRESHOLD_INVALID_MEASURE_WITH_LINK_FORMULA:2824,
	DYNAMIC_TIME_MEASURE_INVALID_TIME_OPERATION_GRANULARITY_ON_DAY_DRILL_LEVEL:2825,
	DYNAMIC_TIME_MEASURE_INVALID_TIME_OPERATION_GRANULARITY_ON_DAY_FILTER_LEVEL:2826,
	THRESHOLD_INVALID_REFERENCE_MEASURE:2827,
	THRESHOLD_INVALID_REFERENCE_MEASURE_WITH_HIER_REQ_DIM:2828,
	VERSION_INVALID_NO_VERSION_IN_AXIS_OR_SINGLE_VALUE_FILTER:2829,
	VIRTUAL_VERSION_INVALID_NO_VERSION_IN_AXIS_OR_SINGLE_VALUE_FILTER:2830,
	FORMULA_EXCEPTION_INVALID_DISPLAY_MEASURE:2750,
	MAXIMUM_NUMBER_OF_CURRENCY_TRANSLATIONS_EXCEEDED:2850,
	NO_VALUE_EXTRACTED_FROM_FRONTEND_CURRENCY_TRANSLATION_VARIABLE:2860,
	CURRENCY_VARIABLE_NOT_AVAILABLE_FOR_CURRENT_QUERY_MODEL:2861,
	FAILED_TO_READ_CHOROPLETH_HIERARCHIES:2870,
	CHOROPLETH_DRILL_PATH_INVALID_PARAMETERS:2871,
	CHOROPLETH_DRILL_PATH_CHOROPLETH_HIERARCHIES_NOT_LOADED:2872,
	CHOROPLETH_DRILL_PATH_FIELD_NOT_FOUND:2873,
	FAILED_TO_GET_CHOROPLETH_DRILL_PATH:2874,
	MEASURE_CYCLICAL_DEPENDENCY:3000,
	MEASURE_MISSING_DEPENDENT:3001,
	MEASURE_CONTEXT_RELEASED:3002,
	MEASURE_PREFERRED_HIERARCHY_MISMATCH:3003,
	MEASURE_INVALID_DEPENDENCY:3004,
	TIME_RANGE_FILTER_INVALID_DIMENSION_HIERARCHY:3100,
	TIME_RANGE_FILTER_INVALID_HIERARCHY_LEVEL:3101,
	ABAP_PASSWORD_IS_INITIAL:10023,
	NO_VARIABLE_PROCESSOR_AFFECTED:4000,
	VARIABLE_PROCESSOR_ALREADY_PROCESSING:4001,
	CELL_DOCUMENT_ID_ACTION_FAILED:4250,
	FILTER_ACROSS_MODEL_MISSING_LOV:5000,
	FILTER_ACROSS_MODEL_CREATE_FILTER_FROM_TUPLE_ERROR:5001,
	FILTER_ACROSS_MODEL_DEPENDENT_QUERY_FAILED:5002,
	FILTER_ACROSS_MODEL_LOV_BASED_FAILED:5003,
	FILTER_ACROSS_MODEL_INCOMPLETE_RESULT_WARNING:5004,
	FILTER_ACROSS_MODEL_EMPTY_TARGET_FILTER:5005,
	FILTER_ACROSS_MODEL_TARGET_TIME_HIERARCHY:5006,
	FILTER_ACROSS_MODEL_INCOMPLETE_TARGET_RESULT_WARNING:5007,
	FILTER_ACROSS_MODEL_LOV_INVALID_DRILL_LEVEL_REST_NODE_DOES_NOT_EXIST:5008,
	FILTER_ACROSS_MODEL_INVALID_DIMENSION_HIERARCHY:5009,
	FILTER_ACROSS_MODEL_FTD_RANGE_FILTER_DIRECT_INCOMPATIBLE_HIERARCHY:5010,
	BLENDING_CONDITIONS_NOT_FULFILLED:6000,
	PERSISTED_INA_REMOTE_MODEL_WITH_PREQUERIES_NOT_SUPPORTED:6001,
	QUERYMODEL_NOT_IN_USE:6002,
	LINK_DIMENSION_NOT_IN_DRILL:6003,
	SECONDARY_LINK_DIMENSION_IN_DRILL:6004,
	CALCULATED_DIMENSIONS_CAPABILITY_NOT_SUPPORTED:7000,
	ATTRIBUTE_NOT_FOUND:57
};

oFF.MessageCodes = {

	CORRELATION_ID_CODE:99999
};

oFF.XPair = function() {};
oFF.XPair.prototype = new oFF.XObject();
oFF.XPair.prototype._ff_c = "XPair";

oFF.XPair.create = function(firstObject, secondObject)
{
	var newObject = new oFF.XPair();
	newObject.m_firstObject = firstObject;
	newObject.m_secondObject = secondObject;
	return newObject;
};
oFF.XPair.prototype.m_firstObject = null;
oFF.XPair.prototype.m_secondObject = null;
oFF.XPair.prototype.releaseObject = function()
{
	this.m_firstObject = null;
	this.m_secondObject = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.XPair.prototype.getFirstObject = function()
{
	return this.m_firstObject;
};
oFF.XPair.prototype.getSecondObject = function()
{
	return this.m_secondObject;
};
oFF.XPair.prototype.setFirstObject = function(firstObject)
{
	this.m_firstObject = firstObject;
};
oFF.XPair.prototype.setSecondObject = function(secondObject)
{
	this.m_secondObject = secondObject;
};

oFF.XPairOfString = function() {};
oFF.XPairOfString.prototype = new oFF.XObject();
oFF.XPairOfString.prototype._ff_c = "XPairOfString";

oFF.XPairOfString.create = function(firstString, secondString)
{
	var newObject = new oFF.XPairOfString();
	newObject.m_firstString = firstString;
	newObject.m_secondString = secondString;
	return newObject;
};
oFF.XPairOfString.prototype.m_firstString = null;
oFF.XPairOfString.prototype.m_secondString = null;
oFF.XPairOfString.prototype.releaseObject = function()
{
	this.m_firstString = null;
	this.m_secondString = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.XPairOfString.prototype.getFirstString = function()
{
	return this.m_firstString;
};
oFF.XPairOfString.prototype.getSecondString = function()
{
	return this.m_secondString;
};
oFF.XPairOfString.prototype.setFirstString = function(firstString)
{
	this.m_firstString = firstString;
};
oFF.XPairOfString.prototype.setSecondString = function(secondString)
{
	this.m_secondString = secondString;
};

oFF.XObjectExt = function() {};
oFF.XObjectExt.prototype = new oFF.XObject();
oFF.XObjectExt.prototype._ff_c = "XObjectExt";

oFF.XObjectExt.s_allocationTracer = null;
oFF.XObjectExt._setAllocationTracer = function(tracer)
{
	oFF.XObjectExt.s_allocationTracer = tracer;
};
oFF.XObjectExt.release = function(theObject)
{
	var ixobject = theObject;
	var xobject = ixobject;
	if (oFF.notNull(xobject) && xobject.isReleaseLocked() === false && xobject.isReleased() === false)
	{
		xobject.releaseObject();
	}
	return null;
};
oFF.XObjectExt.releaseWithAssert = function(theObject)
{
	var ixobject = theObject;
	var xobject = ixobject;
	if (oFF.isNull(xobject))
	{
		throw oFF.XException.createIllegalStateException("Object for release is null");
	}
	if (xobject.isReleaseLocked() === true)
	{
		throw oFF.XException.createIllegalStateException("Object for release is locked");
	}
	if (xobject.isReleased() === true)
	{
		throw oFF.XException.createIllegalStateException("Object for release is already released");
	}
	xobject.releaseObject();
	return null;
};
oFF.XObjectExt.cloneIfNotNull = function(origin)
{
	var result = null;
	if (oFF.notNull(origin))
	{
		result = origin.clone();
	}
	return result;
};
oFF.XObjectExt.cloneExtIfNotNull = function(origin, flags)
{
	var result = null;
	if (oFF.notNull(origin))
	{
		result = origin.cloneExt(flags);
	}
	return result;
};
oFF.XObjectExt.areEqual = function(o1, o2)
{
	var retValue = false;
	if (oFF.isNull(o1) && oFF.isNull(o2))
	{
		retValue = true;
	}
	else if (oFF.notNull(o1) && oFF.notNull(o2))
	{
		retValue = o1.isEqualTo(o2);
	}
	return retValue;
};
oFF.XObjectExt.assertFalse = function(actual)
{
	if (actual)
	{
		throw oFF.XException.createRuntimeException("assertFalse failed");
	}
};
oFF.XObjectExt.assertTrue = function(actual)
{
	oFF.XObjectExt.assertTrueExt(actual, "assertTrue failed");
};
oFF.XObjectExt.assertTrueExt = function(actual, message)
{
	if (!actual)
	{
		throw oFF.XException.createRuntimeException(message);
	}
};
oFF.XObjectExt.assertNull = function(actual)
{
	if (oFF.notNull(actual))
	{
		throw oFF.XException.createRuntimeException("assertNull failed");
	}
};
oFF.XObjectExt.assertNotNull = function(actual)
{
	return oFF.XObjectExt.assertNotNullExt(actual, "assertNotNull failed");
};
oFF.XObjectExt.assertNotNullExt = function(o1, message)
{
	if (oFF.isNull(o1))
	{
		var theMessage = message;
		if (oFF.isNull(theMessage))
		{
			theMessage = "The object must not be null!";
		}
		throw oFF.XException.createIllegalArgumentException(theMessage);
	}
	return o1;
};
oFF.XObjectExt.assertBool = function(actual, expected)
{
	if (actual !== expected)
	{
		var sb = oFF.XStringBuffer.create();
		sb.append("assertBool failed - actual \"");
		sb.appendBoolean(actual);
		sb.append("\" - expected \"");
		sb.appendBoolean(expected);
		sb.append("\"");
		throw oFF.XException.createRuntimeException(sb.toString());
	}
};
oFF.XObjectExt.assertStringNotInitial = function(actual)
{
	if (oFF.XString.isEqual(actual, null))
	{
		throw oFF.XException.createRuntimeException("assertStringNotInitial failed");
	}
};
oFF.XObjectExt.assertString = function(actual, expected)
{
	if (!oFF.XString.isEqual(actual, expected))
	{
		var sb = oFF.XStringBuffer.create();
		sb.append("assertString failed - actual ");
		if (oFF.isNull(actual))
		{
			sb.append("is null ");
		}
		else
		{
			sb.append("\"").append(actual).append("\" ");
		}
		sb.append("- expected ");
		if (oFF.isNull(expected))
		{
			sb.append("is null ");
		}
		else
		{
			sb.append("\"").append(expected).append("\"");
		}
		throw oFF.XException.createRuntimeException(sb.toString());
	}
};
oFF.XObjectExt.assertStringNotNullAndNotEmpty = function(actual)
{
	oFF.XObjectExt.assertStringNotNullAndNotEmptyExt(actual, "assertStringNotNullAndNotEmpty failed");
};
oFF.XObjectExt.assertStringNotNullAndNotEmptyExt = function(actual, message)
{
	if (oFF.XStringUtils.isNullOrEmpty(actual))
	{
		throw oFF.XException.createRuntimeException(message);
	}
};
oFF.XObjectExt.assertEquals = function(actual, expected)
{
	var areEqual = oFF.XObjectExt.areEqual(actual, expected);
	if (!areEqual)
	{
		var sb = oFF.XStringBuffer.create();
		sb.append("assertEquals failed - actual \"");
		if (oFF.isNull(actual))
		{
			sb.append("NULL");
		}
		else
		{
			sb.append(actual.toString());
		}
		sb.append("\" - expected \"");
		if (oFF.isNull(expected))
		{
			sb.append("NULL");
		}
		else
		{
			sb.append(expected.toString());
		}
		sb.append("\"");
		throw oFF.XException.createRuntimeException(sb.toString());
	}
};
oFF.XObjectExt.assertNotEquals = function(actual, expected)
{
	var areEqual = oFF.XObjectExt.areEqual(actual, expected);
	if (areEqual)
	{
		throw oFF.XException.createRuntimeException("XObjectExt.assertNotEquals failed - Objects are equal");
	}
};
oFF.XObjectExt.assertLong = function(actual, expected)
{
	if (actual !== expected)
	{
		var sb = oFF.XStringBuffer.create();
		sb.append("assertLong failed - actual \"");
		sb.appendLong(actual);
		sb.append("\" - expected \"");
		sb.appendLong(expected);
		sb.append("\"");
		throw oFF.XException.createRuntimeException(sb.toString());
	}
};
oFF.XObjectExt.assertInt = function(actual, expected)
{
	if (actual !== expected)
	{
		var sb = oFF.XStringBuffer.create();
		sb.append("assertInt failed - actual \"");
		sb.appendInt(actual);
		sb.append("\" - expected \"");
		sb.appendInt(expected);
		sb.append("\"");
		throw oFF.XException.createRuntimeException(sb.toString());
	}
};
oFF.XObjectExt.assertDouble = function(actual, expected)
{
	var valueAsString = oFF.XDouble.convertToString(actual);
	var compareAsString = oFF.XDouble.convertToString(expected);
	if (!oFF.XString.isEqual(valueAsString, compareAsString))
	{
		var sb = oFF.XStringBuffer.create();
		sb.append("assertDouble failed - actual \"");
		sb.append(valueAsString);
		sb.append("\" - expected \"");
		sb.append(compareAsString);
		sb.append("\"");
		throw oFF.XException.createRuntimeException(sb.toString());
	}
};
oFF.XObjectExt.assertDoubleWithTolerance = function(actual, expected, tolerance)
{
	var difference = actual - expected;
	if (difference < 0)
	{
		difference = difference * -1;
	}
	if (difference > tolerance)
	{
		var sb = oFF.XStringBuffer.create();
		sb.append("assertDoubleWithTolerance failed - actual \"");
		sb.appendDouble(actual);
		sb.append("\" - expected \"");
		sb.appendDouble(expected);
		sb.append("\" - difference \"");
		sb.appendDouble(difference);
		sb.append("\" larger than expected tolerance \"");
		sb.appendDouble(tolerance);
		sb.append("\"");
		throw oFF.XException.createRuntimeException(sb.toString());
	}
};
oFF.XObjectExt.prototype.m_objectId = null;
oFF.XObjectExt.prototype.copyFrom = function(other, flags)
{
	if (this !== other && (this.getComponentType() === null || this.getComponentType() === other.getComponentType()))
	{
		this.copyFromInternal(other, flags);
	}
};
oFF.XObjectExt.prototype.copyFromInternal = function(other, flags) {};
oFF.XObjectExt.prototype.setup = function()
{
	oFF.XObject.prototype.setup.call( this );
	if (oFF.notNull(oFF.XObjectExt.s_allocationTracer))
	{
		this.m_objectId = oFF.XObjectExt.s_allocationTracer.inc(this);
	}
};
oFF.XObjectExt.prototype.releaseObject = function()
{
	oFF.XObject.prototype.releaseObject.call( this );
	if (oFF.notNull(oFF.XObjectExt.s_allocationTracer))
	{
		oFF.XObjectExt.s_allocationTracer.dec(this, false);
	}
};
oFF.XObjectExt.prototype.destructor = function()
{
	if (oFF.notNull(oFF.XObjectExt.s_allocationTracer))
	{
		oFF.XObjectExt.s_allocationTracer.dec(this, true);
	}
};
oFF.XObjectExt.prototype.getObjectId = function()
{
	return this.m_objectId;
};
oFF.XObjectExt.prototype.getComponentType = function()
{
	return null;
};
oFF.XObjectExt.prototype.log = function(logline)
{
	var logger = this.getLogWriter();
	if (oFF.notNull(logger))
	{
		logger.logExt(this.getLogLayer(), this.getLogSeverity(), 0, logline);
	}
};
oFF.XObjectExt.prototype.logEmpty = function()
{
	var logger = this.getLogWriter();
	if (oFF.notNull(logger))
	{
		logger.logExt(this.getLogLayer(), this.getLogSeverity(), 0, null);
	}
};
oFF.XObjectExt.prototype.logObj = function(xobject)
{
	if (oFF.notNull(xobject))
	{
		var logger = this.getLogWriter();
		if (oFF.notNull(logger))
		{
			var logSeverity = this.getLogSeverity();
			var logLayer = this.getLogLayer();
			if (logger.isLogWritten(logLayer, logSeverity))
			{
				var logText = xobject.toString();
				logger.logExt(logLayer, logSeverity, 0, logText);
			}
		}
	}
};
oFF.XObjectExt.prototype.log2 = function(log1, log2)
{
	var logger = this.getLogWriter();
	if (oFF.notNull(logger))
	{
		oFF.XLogBufferFlushing.create(logger, this.getLogLayer(), this.getLogSeverity(), 0).append(log1).append(log2).flush();
	}
};
oFF.XObjectExt.prototype.log3 = function(log1, log2, log3)
{
	var logger = this.getLogWriter();
	if (oFF.notNull(logger))
	{
		oFF.XLogBufferFlushing.create(logger, this.getLogLayer(), this.getLogSeverity(), 0).append(log1).append(log2).append(log3).flush();
	}
};
oFF.XObjectExt.prototype.log4 = function(log1, log2, log3, log4)
{
	var logger = this.getLogWriter();
	if (oFF.notNull(logger))
	{
		oFF.XLogBufferFlushing.create(logger, this.getLogLayer(), this.getLogSeverity(), 0).append(log1).append(log2).append(log3).append(log4).flush();
	}
};
oFF.XObjectExt.prototype.logWarning = function(logline)
{
	var logger = this.getLogWriter();
	if (oFF.notNull(logger))
	{
		logger.logExt(this.getLogLayer(), oFF.Severity.WARNING, 0, logline);
	}
};
oFF.XObjectExt.prototype.logWarningMulti = function(logline)
{
	var logger = this.getLogWriter();
	return oFF.XLogBufferFlushing.create(logger, this.getLogLayer(), oFF.Severity.WARNING, 0).append(logline);
};
oFF.XObjectExt.prototype.logWarning2 = function(log1, log2)
{
	var logger = this.getLogWriter();
	if (oFF.notNull(logger))
	{
		oFF.XLogBufferFlushing.create(logger, this.getLogLayer(), oFF.Severity.WARNING, 0).append(log1).append(log2).flush();
	}
};
oFF.XObjectExt.prototype.logWarning3 = function(log1, log2, log3)
{
	var logger = this.getLogWriter();
	if (oFF.notNull(logger))
	{
		oFF.XLogBufferFlushing.create(logger, this.getLogLayer(), oFF.Severity.WARNING, 0).append(log1).append(log2).append(log3).flush();
	}
};
oFF.XObjectExt.prototype.logWarning4 = function(log1, log2, log3, log4)
{
	var logger = this.getLogWriter();
	if (oFF.notNull(logger))
	{
		oFF.XLogBufferFlushing.create(logger, this.getLogLayer(), oFF.Severity.WARNING, 0).append(log1).append(log2).append(log3).append(log4).flush();
	}
};
oFF.XObjectExt.prototype.logError = function(logline)
{
	var logger = this.getLogWriter();
	if (oFF.notNull(logger))
	{
		logger.logExt(this.getLogLayer(), oFF.Severity.ERROR, 0, logline);
	}
};
oFF.XObjectExt.prototype.logErrorMulti = function(logline)
{
	var logger = this.getLogWriter();
	return oFF.XLogBufferFlushing.create(logger, this.getLogLayer(), oFF.Severity.ERROR, 0).append(logline);
};
oFF.XObjectExt.prototype.logError2 = function(log1, log2)
{
	var logger = this.getLogWriter();
	if (oFF.notNull(logger))
	{
		oFF.XLogBufferFlushing.create(logger, this.getLogLayer(), oFF.Severity.ERROR, 0).append(log1).append(log2).flush();
	}
};
oFF.XObjectExt.prototype.logError3 = function(log1, log2, log3)
{
	var logger = this.getLogWriter();
	if (oFF.notNull(logger))
	{
		oFF.XLogBufferFlushing.create(logger, this.getLogLayer(), oFF.Severity.ERROR, 0).append(log1).append(log2).append(log3).flush();
	}
};
oFF.XObjectExt.prototype.logError4 = function(log1, log2, log3, log4)
{
	var logger = this.getLogWriter();
	if (oFF.notNull(logger))
	{
		oFF.XLogBufferFlushing.create(logger, this.getLogLayer(), oFF.Severity.ERROR, 0).append(log1).append(log2).append(log3).append(log4).flush();
	}
};
oFF.XObjectExt.prototype.logMulti = function(logline)
{
	var logger = this.getLogWriter();
	return oFF.XLogBufferFlushing.create(logger, this.getLogLayer(), this.getLogSeverity(), 0).append(logline);
};
oFF.XObjectExt.prototype.logBuffer = function(layer, severity, code)
{
	var logger = this.getLogWriter();
	return oFF.XLogBufferFlushing.create(logger, layer, severity, code);
};
oFF.XObjectExt.prototype.logExt = function(layer, severity, code, message)
{
	var logger = this.getLogWriter();
	if (oFF.notNull(logger))
	{
		logger.logExt(layer, severity, code, message);
	}
};
oFF.XObjectExt.prototype.isLogWritten = function(layer, severity)
{
	var logger = this.getLogWriter();
	return oFF.isNull(logger) ? false : logger.isLogWritten(layer, severity);
};
oFF.XObjectExt.prototype.getLogWriter = function()
{
	return null;
};
oFF.XObjectExt.prototype.getLogLayer = function()
{
	return oFF.OriginLayer.MISC;
};
oFF.XObjectExt.prototype.getLogSeverity = function()
{
	return oFF.Severity.DEBUG;
};
oFF.XObjectExt.prototype.toString = function()
{
	var buffer = oFF.XStringBuffer.create();
	var className = this.getClassName();
	if (oFF.notNull(className))
	{
		buffer.append(className);
	}
	else
	{
		buffer.append("[unknown class]");
	}
	var objectId = this.getObjectId();
	if (oFF.notNull(objectId))
	{
		buffer.append(": ").append(objectId);
	}
	return buffer.toString();
};

oFF.DfModule = function() {};
oFF.DfModule.prototype = new oFF.XObject();
oFF.DfModule.prototype._ff_c = "DfModule";

oFF.DfModule.s_allModules = null;
oFF.DfModule.checkInitialized = function(module)
{
	if (oFF.isNull(module))
	{
		throw oFF.XException.createInitializationException();
	}
};
oFF.DfModule.startExt = function(module)
{
	var name = module.getName();
	if (oFF.notNull(name))
	{
		if (oFF.isNull(oFF.DfModule.s_allModules))
		{
			oFF.DfModule.s_allModules = "ff0000.language.native";
		}
		oFF.DfModule.s_allModules = oFF.XStringUtils.concatenate3(oFF.DfModule.s_allModules, ",", name);
	}
	return module;
};
oFF.DfModule.stopExt = function(module) {};
oFF.DfModule.start = function(output)
{
	return 0;
};
oFF.DfModule.stop = function(startTimestamp) {};
oFF.DfModule.getLoadedModuleNames = function()
{
	return oFF.DfModule.s_allModules;
};
oFF.DfModule.prototype.getName = function()
{
	return null;
};

oFF.DfNameObject = function() {};
oFF.DfNameObject.prototype = new oFF.XObjectExt();
oFF.DfNameObject.prototype._ff_c = "DfNameObject";

oFF.DfNameObject.getSafeName = function(element)
{
	return oFF.isNull(element) ? null : element.getName();
};
oFF.DfNameObject.prototype.m_name = null;
oFF.DfNameObject.prototype._setupInternal = function(name)
{
	this.m_name = name;
};
oFF.DfNameObject.prototype.releaseObject = function()
{
	this.m_name = null;
	oFF.XObjectExt.prototype.releaseObject.call( this );
};
oFF.DfNameObject.prototype.getName = function()
{
	return this.m_name;
};
oFF.DfNameObject.prototype.toString = function()
{
	return this.m_name;
};
oFF.DfNameObject.prototype.isEqualTo = function(other)
{
	var theOther = other;
	if (oFF.isNull(other))
	{
		return false;
	}
	var isEqual = oFF.XString.isEqual(this.getName(), theOther.getName());
	return isEqual;
};

oFF.XNameGenericPair = function() {};
oFF.XNameGenericPair.prototype = new oFF.XObject();
oFF.XNameGenericPair.prototype._ff_c = "XNameGenericPair";

oFF.XNameGenericPair.create = function(name, object)
{
	var newObject = new oFF.XNameGenericPair();
	newObject.m_name = name;
	newObject.m_object = object;
	return newObject;
};
oFF.XNameGenericPair.prototype.m_name = null;
oFF.XNameGenericPair.prototype.m_object = null;
oFF.XNameGenericPair.prototype.releaseObject = function()
{
	this.m_name = null;
	this.m_object = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.XNameGenericPair.prototype.cloneExt = function(flags)
{
	return oFF.XNameGenericPair.create(this.m_name, this.m_object);
};
oFF.XNameGenericPair.prototype.getName = function()
{
	return this.m_name;
};
oFF.XNameGenericPair.prototype.getObject = function()
{
	return this.m_object;
};
oFF.XNameGenericPair.prototype.setName = function(name)
{
	this.m_name = name;
};
oFF.XNameGenericPair.prototype.setObject = function(object)
{
	this.m_object = object;
};
oFF.XNameGenericPair.prototype.toString = function()
{
	var response = oFF.XStringBuffer.create();
	response.append("Key ").append(this.getName());
	response.append("Value ");
	if (oFF.notNull(this.m_object))
	{
		response.appendObject(this.m_object);
	}
	return response.toString();
};
oFF.XNameGenericPair.prototype.isEqualTo = function(other)
{
	if (oFF.isNull(other))
	{
		return false;
	}
	if (this === other)
	{
		return true;
	}
	var otherPair;
	try
	{
		otherPair = other;
	}
	catch (t)
	{
		return false;
	}
	if (!oFF.XString.isEqual(this.getName(), otherPair.getName()))
	{
		return false;
	}
	return otherPair.getObject().isEqualTo(this.m_object);
};

oFF.XNameWeakGenericPair = function() {};
oFF.XNameWeakGenericPair.prototype = new oFF.XObject();
oFF.XNameWeakGenericPair.prototype._ff_c = "XNameWeakGenericPair";

oFF.XNameWeakGenericPair.create = function(name, object)
{
	var newObject = new oFF.XNameWeakGenericPair();
	newObject.m_name = name;
	newObject.m_object = oFF.XWeakReferenceUtil.getWeakRef(object);
	return newObject;
};
oFF.XNameWeakGenericPair.prototype.m_name = null;
oFF.XNameWeakGenericPair.prototype.m_object = null;
oFF.XNameWeakGenericPair.prototype.releaseObject = function()
{
	this.m_name = null;
	this.m_object = oFF.XObjectExt.release(this.m_object);
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.XNameWeakGenericPair.prototype.getName = function()
{
	return this.m_name;
};
oFF.XNameWeakGenericPair.prototype.getObject = function()
{
	return oFF.XWeakReferenceUtil.getHardRef(this.m_object);
};
oFF.XNameWeakGenericPair.prototype.setName = function(name)
{
	this.m_name = name;
};
oFF.XNameWeakGenericPair.prototype.setObject = function(object)
{
	this.m_object = oFF.XWeakReferenceUtil.getWeakRef(object);
};

oFF.XConstant = function() {};
oFF.XConstant.prototype = new oFF.DfNameObject();
oFF.XConstant.prototype._ff_c = "XConstant";

oFF.XConstant.setupName = function(a, name)
{
	a.setupConstant(name);
	return a;
};
oFF.XConstant.prototype.isReleaseLocked = function()
{
	return true;
};
oFF.XConstant.prototype.releaseObject = oFF.noSupport;
oFF.XConstant.prototype.setupConstant = function(name)
{
	oFF.DfNameObject.prototype._setupInternal.call( this , name);
};

oFF.DfIdNameObject = function() {};
oFF.DfIdNameObject.prototype = new oFF.DfNameObject();
oFF.DfIdNameObject.prototype._ff_c = "DfIdNameObject";

oFF.DfIdNameObject.prototype.m_id = null;
oFF.DfIdNameObject.prototype.setupExt = function(identifier, name)
{
	oFF.DfNameObject.prototype._setupInternal.call( this , name);
	this.m_id = identifier;
};
oFF.DfIdNameObject.prototype.getId = function()
{
	return this.m_id;
};
oFF.DfIdNameObject.prototype.toString = function()
{
	var sb = oFF.XStringBuffer.create();
	sb.append(this.getId()).append(": ").append(this.getName());
	return sb.toString();
};
oFF.DfIdNameObject.prototype.releaseObject = function()
{
	this.m_id = null;
	oFF.DfNameObject.prototype.releaseObject.call( this );
};

oFF.DfNameTextObject = function() {};
oFF.DfNameTextObject.prototype = new oFF.DfNameObject();
oFF.DfNameTextObject.prototype._ff_c = "DfNameTextObject";

oFF.DfNameTextObject.prototype.m_text = null;
oFF.DfNameTextObject.prototype.setupWithNameText = function(name, text)
{
	this._setupInternal(name);
	this.m_text = text;
};
oFF.DfNameTextObject.prototype.getText = function()
{
	return this.m_text;
};
oFF.DfNameTextObject.prototype.setText = function(text)
{
	this.m_text = text;
};
oFF.DfNameTextObject.prototype.releaseObject = function()
{
	this.m_text = null;
	oFF.DfNameObject.prototype.releaseObject.call( this );
};
oFF.DfNameTextObject.prototype.isEqualTo = function(other)
{
	var isEqual = oFF.DfNameObject.prototype.isEqualTo.call( this , other);
	var theOther = other;
	isEqual = isEqual && oFF.XString.isEqual(this.getText(), theOther.getText());
	return isEqual;
};

oFF.XNameValuePair = function() {};
oFF.XNameValuePair.prototype = new oFF.DfNameObject();
oFF.XNameValuePair.prototype._ff_c = "XNameValuePair";

oFF.XNameValuePair.create = function(name, value)
{
	var xNameValuePair = new oFF.XNameValuePair();
	xNameValuePair.setupWithNameValue(name, value);
	return xNameValuePair;
};
oFF.XNameValuePair.prototype.m_value = null;
oFF.XNameValuePair.prototype.setupWithNameValue = function(name, value)
{
	this._setupInternal(name);
	this.m_value = value;
};
oFF.XNameValuePair.prototype.releaseObject = function()
{
	this.m_value = null;
	oFF.DfNameObject.prototype.releaseObject.call( this );
};
oFF.XNameValuePair.prototype.getValue = function()
{
	return this.m_value;
};
oFF.XNameValuePair.prototype.compareTo = function(objectToCompare)
{
	if (oFF.isNull(objectToCompare))
	{
		return -1;
	}
	if (this === objectToCompare)
	{
		return 0;
	}
	var other = objectToCompare;
	var compare = oFF.XString.compare(this.getName(), other.getName());
	if (compare === 0)
	{
		compare = oFF.XString.compare(this.getValue(), other.getValue());
	}
	return compare;
};
oFF.XNameValuePair.prototype.toString = function()
{
	if (oFF.isNull(this.m_value))
	{
		return this.getName();
	}
	var tmp = oFF.XStringUtils.concatenate2(this.getName(), "=");
	return oFF.XStringUtils.concatenate2(tmp, this.m_value);
};

oFF.XAbstractValue = function() {};
oFF.XAbstractValue.prototype = new oFF.XObject();
oFF.XAbstractValue.prototype._ff_c = "XAbstractValue";

oFF.XAbstractValue.prototype.getComponentType = function()
{
	return this.getValueType();
};
oFF.XAbstractValue.prototype.assertValueType = function(valueType)
{
	if (this.getValueType() !== valueType)
	{
		throw oFF.XException.createIllegalArgumentException("Valuetype missmatch!");
	}
};
oFF.XAbstractValue.prototype.resetValue = function(value)
{
	oFF.XObjectExt.assertNotNullExt(value, "illegal value");
	this.assertValueType(value.getValueType());
};
oFF.XAbstractValue.prototype.isEqualTo = function(other)
{
	if (oFF.isNull(other))
	{
		return false;
	}
	if (this === other)
	{
		return true;
	}
	if (this.getValueType() !== other.getValueType())
	{
		return false;
	}
	return true;
};
oFF.XAbstractValue.prototype.getStringRepresentation = function()
{
	return this.toString();
};

oFF.XConstantWithParent = function() {};
oFF.XConstantWithParent.prototype = new oFF.XConstant();
oFF.XConstantWithParent.prototype._ff_c = "XConstantWithParent";

oFF.XConstantWithParent.prototype.m_parent = null;
oFF.XConstantWithParent.prototype.setupExt = function(name, parent)
{
	this.m_parent = parent;
	this.setupConstant(name);
};
oFF.XConstantWithParent.prototype.setParent = function(type)
{
	this.m_parent = type;
};
oFF.XConstantWithParent.prototype.getParent = function()
{
	return this.m_parent;
};
oFF.XConstantWithParent.prototype.isTypeOf = function(type)
{
	if (oFF.isNull(type))
	{
		return false;
	}
	if (this === type)
	{
		return true;
	}
	if (oFF.isNull(this.m_parent))
	{
		return false;
	}
	return this.m_parent.isTypeOf(type);
};

oFF.XLanguage = function() {};
oFF.XLanguage.prototype = new oFF.XConstant();
oFF.XLanguage.prototype._ff_c = "XLanguage";

oFF.XLanguage.JAVA = null;
oFF.XLanguage.JAVASCRIPT = null;
oFF.XLanguage.TYPESCRIPT = null;
oFF.XLanguage.OBJECTIVE_C = null;
oFF.XLanguage.CPP = null;
oFF.XLanguage.CSHARP = null;
oFF.XLanguage.ABAP = null;
oFF.XLanguage.s_language = null;
oFF.XLanguage.staticSetup = function()
{
	oFF.XLanguage.JAVA = oFF.XConstant.setupName(new oFF.XLanguage(), "JAVA");
	oFF.XLanguage.JAVASCRIPT = oFF.XConstant.setupName(new oFF.XLanguage(), "JAVASCRIPT");
	oFF.XLanguage.TYPESCRIPT = oFF.XConstant.setupName(new oFF.XLanguage(), "TYPESCRIPT");
	oFF.XLanguage.OBJECTIVE_C = oFF.XConstant.setupName(new oFF.XLanguage(), "OBJECTIVE_C");
	oFF.XLanguage.CPP = oFF.XConstant.setupName(new oFF.XLanguage(), "CPP");
	oFF.XLanguage.CSHARP = oFF.XConstant.setupName(new oFF.XLanguage(), "CSHARP");
	oFF.XLanguage.ABAP = oFF.XConstant.setupName(new oFF.XLanguage(), "ABAP");
};
oFF.XLanguage.getLanguage = function()
{
	return oFF.XLanguage.s_language;
};
oFF.XLanguage.setLanguage = function(language)
{
	if (oFF.isNull(oFF.XLanguage.s_language))
	{
		oFF.XLanguage.s_language = language;
	}
};

oFF.XSyncEnv = function() {};
oFF.XSyncEnv.prototype = new oFF.XConstant();
oFF.XSyncEnv.prototype._ff_c = "XSyncEnv";

oFF.XSyncEnv.EXTERNAL_MAIN_LOOP = null;
oFF.XSyncEnv.INTERNAL_MAIN_LOOP = null;
oFF.XSyncEnv.s_syncEnv = null;
oFF.XSyncEnv.staticSetup = function()
{
	oFF.XSyncEnv.EXTERNAL_MAIN_LOOP = oFF.XConstant.setupName(new oFF.XSyncEnv(), "EXTERNAL");
	oFF.XSyncEnv.INTERNAL_MAIN_LOOP = oFF.XConstant.setupName(new oFF.XSyncEnv(), "INTERNAL");
};
oFF.XSyncEnv.getSyncEnv = function()
{
	return oFF.XSyncEnv.s_syncEnv;
};
oFF.XSyncEnv.setSyncEnv = function(syncEnv)
{
	if (oFF.isNull(oFF.XSyncEnv.s_syncEnv))
	{
		oFF.XSyncEnv.s_syncEnv = syncEnv;
	}
};

oFF.XNameTextObject = function() {};
oFF.XNameTextObject.prototype = new oFF.DfNameTextObject();
oFF.XNameTextObject.prototype._ff_c = "XNameTextObject";

oFF.XNameTextObject.create = function(name, text)
{
	var loInstance = new oFF.XNameTextObject();
	loInstance.setupWithNameText(name, text);
	return loInstance;
};
oFF.XNameTextObject.prototype.releaseObject = function()
{
	oFF.DfNameTextObject.prototype.releaseObject.call( this );
};

oFF.XAmountValue = function() {};
oFF.XAmountValue.prototype = new oFF.XAbstractValue();
oFF.XAmountValue.prototype._ff_c = "XAmountValue";

oFF.XAmountValue.create = function(value)
{
	var object = new oFF.XAmountValue();
	object.setAmount(value);
	return object;
};
oFF.XAmountValue.prototype.m_amountValue = null;
oFF.XAmountValue.prototype.releaseObject = function()
{
	this.m_amountValue = null;
	oFF.XAbstractValue.prototype.releaseObject.call( this );
};
oFF.XAmountValue.prototype.getAmount = function()
{
	return this.m_amountValue;
};
oFF.XAmountValue.prototype.setAmount = function(value)
{
	this.m_amountValue = value;
};
oFF.XAmountValue.prototype.getValueType = function()
{
	return oFF.XValueType.AMOUNT;
};
oFF.XAmountValue.prototype.isEqualTo = function(other)
{
	if (!oFF.XAbstractValue.prototype.isEqualTo.call( this , other))
	{
		return false;
	}
	var otherValue = other;
	return oFF.XString.isEqual(this.m_amountValue, otherValue.m_amountValue);
};
oFF.XAmountValue.prototype.resetValue = function(value)
{
	oFF.XAbstractValue.prototype.resetValue.call( this , value);
	if (this === value)
	{
		return;
	}
	var otherValue = value;
	this.m_amountValue = otherValue.m_amountValue;
};
oFF.XAmountValue.prototype.cloneExt = function(flags)
{
	return oFF.XAmountValue.create(this.m_amountValue);
};
oFF.XAmountValue.prototype.toString = function()
{
	return this.m_amountValue;
};

oFF.XBooleanValue = function() {};
oFF.XBooleanValue.prototype = new oFF.XAbstractValue();
oFF.XBooleanValue.prototype._ff_c = "XBooleanValue";

oFF.XBooleanValue.create = function(value)
{
	var objectBoolean = new oFF.XBooleanValue();
	objectBoolean.setBoolean(value);
	return objectBoolean;
};
oFF.XBooleanValue.prototype.m_booleanValue = false;
oFF.XBooleanValue.prototype.getBoolean = function()
{
	return this.m_booleanValue;
};
oFF.XBooleanValue.prototype.setBoolean = function(value)
{
	this.m_booleanValue = value;
};
oFF.XBooleanValue.prototype.getValueType = function()
{
	return oFF.XValueType.BOOLEAN;
};
oFF.XBooleanValue.prototype.resetValue = function(value)
{
	oFF.XAbstractValue.prototype.resetValue.call( this , value);
	if (this === value)
	{
		return;
	}
	var otherValue = value;
	this.m_booleanValue = otherValue.m_booleanValue;
};
oFF.XBooleanValue.prototype.isEqualTo = function(other)
{
	if (!oFF.XAbstractValue.prototype.isEqualTo.call( this , other))
	{
		return false;
	}
	var otherValue = other;
	return this.m_booleanValue === otherValue.m_booleanValue;
};
oFF.XBooleanValue.prototype.cloneExt = function(flags)
{
	return oFF.XBooleanValue.create(this.m_booleanValue);
};
oFF.XBooleanValue.prototype.toString = function()
{
	return oFF.XBoolean.convertToString(this.m_booleanValue);
};

oFF.XDecFloatAbstract = function() {};
oFF.XDecFloatAbstract.prototype = new oFF.XAbstractValue();
oFF.XDecFloatAbstract.prototype._ff_c = "XDecFloatAbstract";

oFF.XDecFloatAbstract.prototype.getComponentType = function()
{
	return this.getValueType();
};
oFF.XDecFloatAbstract.prototype.getValueType = function()
{
	return oFF.XValueType.DECIMAL_FLOAT;
};
oFF.XDecFloatAbstract.prototype.isEqualTo = function(other)
{
	if (!oFF.XAbstractValue.prototype.isEqualTo.call( this , other))
	{
		return false;
	}
	var otherObj = other;
	var stringRepresentation = otherObj.getStringRepresentation();
	return oFF.XString.isEqual(this.getStringRepresentation(), stringRepresentation);
};
oFF.XDecFloatAbstract.prototype.toString = function()
{
	return this.getStringRepresentation();
};

oFF.XDoubleValue = function() {};
oFF.XDoubleValue.prototype = new oFF.XAbstractValue();
oFF.XDoubleValue.prototype._ff_c = "XDoubleValue";

oFF.XDoubleValue.create = function(value)
{
	var objectDouble = new oFF.XDoubleValue();
	objectDouble.setDouble(value);
	return objectDouble;
};
oFF.XDoubleValue.prototype.m_doubleValue = 0.0;
oFF.XDoubleValue.prototype.getDouble = function()
{
	return this.m_doubleValue;
};
oFF.XDoubleValue.prototype.setDouble = function(value)
{
	this.m_doubleValue = value;
};
oFF.XDoubleValue.prototype.getValueType = function()
{
	return oFF.XValueType.DOUBLE;
};
oFF.XDoubleValue.prototype.isEqualTo = function(other)
{
	if (!oFF.XAbstractValue.prototype.isEqualTo.call( this , other))
	{
		return false;
	}
	return this.m_doubleValue === other.m_doubleValue;
};
oFF.XDoubleValue.prototype.resetValue = function(value)
{
	oFF.XAbstractValue.prototype.resetValue.call( this , value);
	if (this === value)
	{
		return;
	}
	this.m_doubleValue = value.m_doubleValue;
};
oFF.XDoubleValue.prototype.cloneExt = function(flags)
{
	return oFF.XDoubleValue.create(this.m_doubleValue);
};
oFF.XDoubleValue.prototype.toString = function()
{
	return oFF.XDouble.convertToString(this.m_doubleValue);
};

oFF.XIntegerValue = function() {};
oFF.XIntegerValue.prototype = new oFF.XAbstractValue();
oFF.XIntegerValue.prototype._ff_c = "XIntegerValue";

oFF.XIntegerValue.create = function(value)
{
	var objectInteger = new oFF.XIntegerValue();
	objectInteger.setInteger(value);
	return objectInteger;
};
oFF.XIntegerValue.prototype.m_integerValue = 0;
oFF.XIntegerValue.prototype.getInteger = function()
{
	return this.m_integerValue;
};
oFF.XIntegerValue.prototype.setInteger = function(value)
{
	this.m_integerValue = value;
};
oFF.XIntegerValue.prototype.getValueType = function()
{
	return oFF.XValueType.INTEGER;
};
oFF.XIntegerValue.prototype.isEqualTo = function(other)
{
	if (!oFF.XAbstractValue.prototype.isEqualTo.call( this , other))
	{
		return false;
	}
	return this.m_integerValue === other.m_integerValue;
};
oFF.XIntegerValue.prototype.resetValue = function(value)
{
	oFF.XAbstractValue.prototype.resetValue.call( this , value);
	if (this === value)
	{
		return;
	}
	this.m_integerValue = value.m_integerValue;
};
oFF.XIntegerValue.prototype.cloneExt = function(flags)
{
	return oFF.XIntegerValue.create(this.m_integerValue);
};
oFF.XIntegerValue.prototype.toString = function()
{
	return oFF.XInteger.convertToString(this.m_integerValue);
};

oFF.XLongValue = function() {};
oFF.XLongValue.prototype = new oFF.XAbstractValue();
oFF.XLongValue.prototype._ff_c = "XLongValue";

oFF.XLongValue.create = function(value)
{
	var objectLong = new oFF.XLongValue();
	objectLong.setLong(value);
	return objectLong;
};
oFF.XLongValue.prototype.m_longValue = 0;
oFF.XLongValue.prototype.getLong = function()
{
	return this.m_longValue;
};
oFF.XLongValue.prototype.setLong = function(value)
{
	this.m_longValue = value;
};
oFF.XLongValue.prototype.getValueType = function()
{
	return oFF.XValueType.LONG;
};
oFF.XLongValue.prototype.isEqualTo = function(other)
{
	if (!oFF.XAbstractValue.prototype.isEqualTo.call( this , other))
	{
		return false;
	}
	return this.m_longValue === other.m_longValue;
};
oFF.XLongValue.prototype.resetValue = function(value)
{
	oFF.XAbstractValue.prototype.resetValue.call( this , value);
	if (this === value)
	{
		return;
	}
	this.m_longValue = value.m_longValue;
};
oFF.XLongValue.prototype.cloneExt = function(flags)
{
	return oFF.XLongValue.create(this.m_longValue);
};
oFF.XLongValue.prototype.toString = function()
{
	return oFF.XLong.convertToString(this.m_longValue);
};

oFF.XNumcValue = function() {};
oFF.XNumcValue.prototype = new oFF.XAbstractValue();
oFF.XNumcValue.prototype._ff_c = "XNumcValue";

oFF.XNumcValue.create = function(value)
{
	var object = new oFF.XNumcValue();
	object.setNumc(value);
	return object;
};
oFF.XNumcValue.prototype.m_numcValue = null;
oFF.XNumcValue.prototype.releaseObject = function()
{
	this.m_numcValue = null;
	oFF.XAbstractValue.prototype.releaseObject.call( this );
};
oFF.XNumcValue.prototype.getNumc = function()
{
	return this.m_numcValue;
};
oFF.XNumcValue.prototype.setNumc = function(value)
{
	this.m_numcValue = value;
};
oFF.XNumcValue.prototype.getValueType = function()
{
	return oFF.XValueType.NUMC;
};
oFF.XNumcValue.prototype.isEqualTo = function(other)
{
	if (!oFF.XAbstractValue.prototype.isEqualTo.call( this , other))
	{
		return false;
	}
	var otherValue = other;
	return oFF.XString.isEqual(this.m_numcValue, otherValue.m_numcValue);
};
oFF.XNumcValue.prototype.resetValue = function(value)
{
	oFF.XAbstractValue.prototype.resetValue.call( this , value);
	if (this === value)
	{
		return;
	}
	var otherValue = value;
	this.m_numcValue = otherValue.m_numcValue;
};
oFF.XNumcValue.prototype.cloneExt = function(flags)
{
	return oFF.XNumcValue.create(this.m_numcValue);
};
oFF.XNumcValue.prototype.toString = function()
{
	return this.m_numcValue;
};

oFF.XStringValue = function() {};
oFF.XStringValue.prototype = new oFF.XAbstractValue();
oFF.XStringValue.prototype._ff_c = "XStringValue";

oFF.XStringValue.create = function(value)
{
	var object = new oFF.XStringValue();
	object.setString(value);
	return object;
};
oFF.XStringValue.prototype.m_stringValue = null;
oFF.XStringValue.prototype.releaseObject = function()
{
	this.m_stringValue = null;
	oFF.XAbstractValue.prototype.releaseObject.call( this );
};
oFF.XStringValue.prototype.getString = function()
{
	return this.m_stringValue;
};
oFF.XStringValue.prototype.setString = function(value)
{
	this.m_stringValue = oFF.XString.asString(value);
};
oFF.XStringValue.prototype.getValueType = function()
{
	return oFF.XValueType.STRING;
};
oFF.XStringValue.prototype.isEqualTo = function(other)
{
	if (!oFF.XAbstractValue.prototype.isEqualTo.call( this , other))
	{
		return false;
	}
	var otherValue = other;
	return oFF.XString.isEqual(this.m_stringValue, otherValue.m_stringValue);
};
oFF.XStringValue.prototype.resetValue = function(value)
{
	oFF.XAbstractValue.prototype.resetValue.call( this , value);
	if (this === value)
	{
		return;
	}
	var otherValue = value;
	this.m_stringValue = otherValue.m_stringValue;
};
oFF.XStringValue.prototype.cloneExt = function(flags)
{
	return oFF.XStringValue.create(this.m_stringValue);
};
oFF.XStringValue.prototype.toString = function()
{
	return this.m_stringValue;
};

oFF.OriginLayer = function() {};
oFF.OriginLayer.prototype = new oFF.XConstant();
oFF.OriginLayer.prototype._ff_c = "OriginLayer";

oFF.OriginLayer.SERVER = "Server";
oFF.OriginLayer.PROTOCOL = "Protocol";
oFF.OriginLayer.IOLAYER = "IOLayer";
oFF.OriginLayer.KERNEL = "Kernel";
oFF.OriginLayer.DRIVER = "Driver";
oFF.OriginLayer.APPLICATION = "Application";
oFF.OriginLayer.SUBSYSTEM = "SubSystem";
oFF.OriginLayer.UTILITY = "Utility";
oFF.OriginLayer.TEST = "Test";
oFF.OriginLayer.MISC = "Misc";
oFF.OriginLayer.ALL = "All";
oFF.OriginLayer.NONE = "None";

oFF.Severity = function() {};
oFF.Severity.prototype = new oFF.XConstant();
oFF.Severity.prototype._ff_c = "Severity";

oFF.Severity.DEBUG = null;
oFF.Severity.INFO = null;
oFF.Severity.WARNING = null;
oFF.Severity.ERROR = null;
oFF.Severity.SEMANTICAL_ERROR = null;
oFF.Severity.PRINT = null;
oFF.Severity.staticSetup = function()
{
	oFF.Severity.DEBUG = oFF.Severity.create("Debug", 0);
	oFF.Severity.INFO = oFF.Severity.create("Info", 1);
	oFF.Severity.WARNING = oFF.Severity.create("Warning", 2);
	oFF.Severity.ERROR = oFF.Severity.create("Error", 3);
	oFF.Severity.SEMANTICAL_ERROR = oFF.Severity.create("SemanticalError", 3);
	oFF.Severity.PRINT = oFF.Severity.create("Print", 4);
};
oFF.Severity.create = function(name, level)
{
	var newObj = new oFF.Severity();
	newObj._setupInternal(name);
	newObj.m_level = level;
	return newObj;
};
oFF.Severity.fromName = function(name)
{
	var retValue = null;
	var upName = oFF.XString.toUpperCase(name);
	if (oFF.XString.isEqual("DEBUG", upName) || oFF.XString.isEqual("0", upName))
	{
		retValue = oFF.Severity.DEBUG;
	}
	else if (oFF.XString.isEqual("INFO", upName) || oFF.XString.isEqual("1", upName))
	{
		retValue = oFF.Severity.INFO;
	}
	else if (oFF.XString.isEqual("WARNING", upName) || oFF.XString.isEqual("2", upName))
	{
		retValue = oFF.Severity.WARNING;
	}
	else if (oFF.XString.isEqual("ERROR", upName) || oFF.XString.isEqual("3", upName))
	{
		retValue = oFF.Severity.ERROR;
	}
	else if (oFF.XString.isEqual("SEMANTICALERROR", upName))
	{
		retValue = oFF.Severity.SEMANTICAL_ERROR;
	}
	else if (oFF.XString.isEqual("PRINT", upName) || oFF.XString.isEqual("4", upName))
	{
		retValue = oFF.Severity.PRINT;
	}
	return retValue;
};
oFF.Severity.prototype.m_level = 0;
oFF.Severity.prototype.getLevel = function()
{
	return this.m_level;
};

oFF.XPlatform = function() {};
oFF.XPlatform.prototype = new oFF.XConstantWithParent();
oFF.XPlatform.prototype._ff_c = "XPlatform";

oFF.XPlatform.GENERIC = null;
oFF.XPlatform.HANA = null;
oFF.XPlatform.APPLE = null;
oFF.XPlatform.IOS = null;
oFF.XPlatform.IPHONE = null;
oFF.XPlatform.IPAD = null;
oFF.XPlatform.MAC_OS = null;
oFF.XPlatform.WATCH_OS = null;
oFF.XPlatform.MICROSOFT = null;
oFF.XPlatform.WINDOWS = null;
oFF.XPlatform.ANDROID = null;
oFF.XPlatform.BROWSER = null;
oFF.XPlatform.UI5 = null;
oFF.XPlatform.REACT = null;
oFF.XPlatform.ORCA_REACT = null;
oFF.XPlatform.FABRIC_REACT = null;
oFF.XPlatform.SWING = null;
oFF.XPlatform.SWT = null;
oFF.XPlatform.s_platform = null;
oFF.XPlatform.staticSetup = function()
{
	oFF.XPlatform.GENERIC = oFF.XPlatform.create("Generic", null);
	oFF.XPlatform.HANA = oFF.XPlatform.create("Hana", oFF.XPlatform.GENERIC);
	oFF.XPlatform.APPLE = oFF.XPlatform.create("Apple", oFF.XPlatform.GENERIC);
	oFF.XPlatform.IOS = oFF.XPlatform.create("iOS", oFF.XPlatform.APPLE);
	oFF.XPlatform.IPAD = oFF.XPlatform.create("iPad", oFF.XPlatform.IOS);
	oFF.XPlatform.IPHONE = oFF.XPlatform.create("iPhone", oFF.XPlatform.IOS);
	oFF.XPlatform.MAC_OS = oFF.XPlatform.create("MacOS", oFF.XPlatform.APPLE);
	oFF.XPlatform.WATCH_OS = oFF.XPlatform.create("WatchOS", oFF.XPlatform.APPLE);
	oFF.XPlatform.MICROSOFT = oFF.XPlatform.create("Microsoft", oFF.XPlatform.GENERIC);
	oFF.XPlatform.WINDOWS = oFF.XPlatform.create("Windows", oFF.XPlatform.MICROSOFT);
	oFF.XPlatform.ANDROID = oFF.XPlatform.create("Android", oFF.XPlatform.GENERIC);
	oFF.XPlatform.BROWSER = oFF.XPlatform.create("Browser", oFF.XPlatform.GENERIC);
	oFF.XPlatform.UI5 = oFF.XPlatform.create("Ui5", oFF.XPlatform.BROWSER);
	oFF.XPlatform.REACT = oFF.XPlatform.create("React", oFF.XPlatform.BROWSER);
	oFF.XPlatform.ORCA_REACT = oFF.XPlatform.create("OrcaReact", oFF.XPlatform.REACT);
	oFF.XPlatform.FABRIC_REACT = oFF.XPlatform.create("FabricReact", oFF.XPlatform.REACT);
	oFF.XPlatform.SWING = oFF.XPlatform.create("Swing", oFF.XPlatform.GENERIC);
	oFF.XPlatform.SWT = oFF.XPlatform.create("Swt", oFF.XPlatform.GENERIC);
	oFF.XPlatform.s_platform = oFF.XPlatform.GENERIC;
};
oFF.XPlatform.create = function(name, parent)
{
	var pt = new oFF.XPlatform();
	pt.setupExt(name, parent);
	return pt;
};
oFF.XPlatform.getPlatform = function()
{
	return oFF.XPlatform.s_platform;
};
oFF.XPlatform.setPlatform = function(platform)
{
	oFF.XPlatform.s_platform = platform;
};
oFF.XPlatform.lookup = function(name)
{
	if (oFF.XStringUtils.isNullOrEmpty(name))
	{
		return null;
	}
	var adjustedName = oFF.XString.replace(name, " ", "");
	switch (adjustedName)
	{
		case "Generic":
			return oFF.XPlatform.GENERIC;

		case "Hana":
			return oFF.XPlatform.HANA;

		case "Ui5":
			return oFF.XPlatform.UI5;

		case "Apple":
			return oFF.XPlatform.APPLE;

		case "iOS":
			return oFF.XPlatform.IOS;

		case "iPad":
			return oFF.XPlatform.IPAD;

		case "iPhone":
			return oFF.XPlatform.IPHONE;

		case "MacOS":
			return oFF.XPlatform.MAC_OS;

		case "WatchOS":
			return oFF.XPlatform.WATCH_OS;

		case "Microsoft":
			return oFF.XPlatform.MICROSOFT;

		case "Windows":
			return oFF.XPlatform.WINDOWS;

		case "Swing":
			return oFF.XPlatform.SWING;

		case "Swt":
			return oFF.XPlatform.SWT;

		case "Android":
			return oFF.XPlatform.ANDROID;

		case "Browser":
			return oFF.XPlatform.BROWSER;

		case "React":
			return oFF.XPlatform.REACT;

		case "OrcaReact":
			return oFF.XPlatform.ORCA_REACT;

		case "FabricReact":
			return oFF.XPlatform.FABRIC_REACT;

		default:
			return null;
	}
};
oFF.XPlatform.lookupWithDefault = function(name, defaultPlatform)
{
	var tmpPlatform = oFF.XPlatform.lookup(name);
	if (oFF.notNull(tmpPlatform))
	{
		return tmpPlatform;
	}
	return defaultPlatform;
};

oFF.XDecFloatByDouble = function() {};
oFF.XDecFloatByDouble.prototype = new oFF.XDecFloatAbstract();
oFF.XDecFloatByDouble.prototype._ff_c = "XDecFloatByDouble";

oFF.XDecFloatByDouble.create = function(value)
{
	var objectDecimalFloat = new oFF.XDecFloatByDouble();
	objectDecimalFloat.setupByDouble(value);
	return objectDecimalFloat;
};
oFF.XDecFloatByDouble.prototype.m_decimalFloatValue = 0.0;
oFF.XDecFloatByDouble.prototype.setupByDouble = function(value)
{
	this.m_decimalFloatValue = value;
};
oFF.XDecFloatByDouble.prototype.getDouble = function()
{
	return this.m_decimalFloatValue;
};
oFF.XDecFloatByDouble.prototype.cloneExt = function(flags)
{
	return oFF.XDecFloatByDouble.create(this.m_decimalFloatValue);
};
oFF.XDecFloatByDouble.prototype.getStringRepresentation = function()
{
	return oFF.XDouble.convertToString(this.m_decimalFloatValue);
};
oFF.XDecFloatByDouble.prototype.mayLoosePrecision = function()
{
	return true;
};

oFF.XDecFloatByString = function() {};
oFF.XDecFloatByString.prototype = new oFF.XDecFloatAbstract();
oFF.XDecFloatByString.prototype._ff_c = "XDecFloatByString";

oFF.XDecFloatByString.create = function(value)
{
	var objectDecimalFloat = new oFF.XDecFloatByString();
	objectDecimalFloat.setupByString(value);
	return objectDecimalFloat;
};
oFF.XDecFloatByString.prototype.m_decimalFloatValue = null;
oFF.XDecFloatByString.prototype.setupByString = function(value)
{
	this.m_decimalFloatValue = value;
};
oFF.XDecFloatByString.prototype.getDouble = function()
{
	return oFF.XDouble.convertFromString(this.m_decimalFloatValue);
};
oFF.XDecFloatByString.prototype.cloneExt = function(flags)
{
	return oFF.XDecFloatByString.create(this.m_decimalFloatValue);
};
oFF.XDecFloatByString.prototype.getStringRepresentation = function()
{
	return this.m_decimalFloatValue;
};
oFF.XDecFloatByString.prototype.mayLoosePrecision = function()
{
	return false;
};

oFF.XValueType = function() {};
oFF.XValueType.prototype = new oFF.XConstantWithParent();
oFF.XValueType.prototype._ff_c = "XValueType";

oFF.XValueType.BOOLEAN = null;
oFF.XValueType.KEY_VALUE = null;
oFF.XValueType.BYTE_ARRAY = null;
oFF.XValueType.LIST = null;
oFF.XValueType.NUMBER = null;
oFF.XValueType.INTEGER = null;
oFF.XValueType.DOUBLE = null;
oFF.XValueType.LONG = null;
oFF.XValueType.NUMC = null;
oFF.XValueType.CHAR = null;
oFF.XValueType.DATE_TIME = null;
oFF.XValueType.DATE = null;
oFF.XValueType.CALENDAR_DATE = null;
oFF.XValueType.TIME = null;
oFF.XValueType.LANGUAGE = null;
oFF.XValueType.DECIMAL_FLOAT = null;
oFF.XValueType.CALENDAR_DAY = null;
oFF.XValueType.TIMESPAN = null;
oFF.XValueType.PERCENT = null;
oFF.XValueType.STRING = null;
oFF.XValueType.PROPERTIES = null;
oFF.XValueType.STRUCTURE = null;
oFF.XValueType.STRUCTURE_LIST = null;
oFF.XValueType.UNSUPPORTED = null;
oFF.XValueType.ERROR_VALUE = null;
oFF.XValueType.POLYGON = null;
oFF.XValueType.MULTI_POLYGON = null;
oFF.XValueType.MULTI_POINT = null;
oFF.XValueType.POINT = null;
oFF.XValueType.LINE_STRING = null;
oFF.XValueType.MULTI_LINE_STRING = null;
oFF.XValueType.LOWER_CASE_STRING = null;
oFF.XValueType.UPPER_CASE_STRING = null;
oFF.XValueType.URI = null;
oFF.XValueType.VARIABLE = null;
oFF.XValueType.AMOUNT = null;
oFF.XValueType.QUANTITY = null;
oFF.XValueType.PRICE = null;
oFF.XValueType.DIMENSION_MEMBER = null;
oFF.XValueType.ENUM_CONSTANT = null;
oFF.XValueType.CURRENT_MEMBER = null;
oFF.XValueType.OPTION_LIST = null;
oFF.XValueType.OPTION_VALUE = null;
oFF.XValueType.ARRAY = null;
oFF.XValueType.CUKY = null;
oFF.XValueType.UNIT = null;
oFF.XValueType.OBJECT = null;
oFF.XValueType.UI_CONTROL = null;
oFF.XValueType.UI_CONSTANT = null;
oFF.XValueType.UI_COLOR = null;
oFF.XValueType.UI_CSS_LENGTH = null;
oFF.XValueType.UI_SIZE = null;
oFF.XValueType.UI_POSITION = null;
oFF.XValueType.UI_DROP_INFO = null;
oFF.XValueType.UI_CSS_BOX_EDGES = null;
oFF.XValueType.UI_CSS_TEXT_DECORATION = null;
oFF.XValueType.UI_CSS_BORDER_STYLE = null;
oFF.XValueType.UI_CSS_GAP = null;
oFF.XValueType.UI_LAYOUT_DATA = null;
oFF.XValueType.UI_GRID_LAYOUT = null;
oFF.XValueType.STRING_ARRAY = null;
oFF.XValueType.staticSetup = function()
{
	oFF.XValueType.BOOLEAN = oFF.XValueType.create("Boolean");
	oFF.XValueType.NUMC = oFF.XValueType.create("Numc");
	oFF.XValueType.CHAR = oFF.XValueType.create("Char");
	oFF.XValueType.NUMBER = oFF.XValueType.create("Number");
	oFF.XValueType.INTEGER = oFF.XValueType.createExt("Integer", oFF.XValueType.NUMBER, 0, 0);
	oFF.XValueType.DOUBLE = oFF.XValueType.createExt("Double", oFF.XValueType.NUMBER, 7, 2);
	oFF.XValueType.DECIMAL_FLOAT = oFF.XValueType.createExt("DecimalFloat", oFF.XValueType.DOUBLE, 7, 2);
	oFF.XValueType.LONG = oFF.XValueType.createExt("Long", oFF.XValueType.NUMBER, 0, 0);
	oFF.XValueType.PERCENT = oFF.XValueType.createExt("Percent", oFF.XValueType.NUMBER, 7, 3);
	oFF.XValueType.AMOUNT = oFF.XValueType.createExt("Amount", oFF.XValueType.NUMBER, 7, 2);
	oFF.XValueType.QUANTITY = oFF.XValueType.createExt("Quantity", oFF.XValueType.NUMBER, 7, 2);
	oFF.XValueType.PRICE = oFF.XValueType.createExt("Price", oFF.XValueType.NUMBER, 7, 2);
	oFF.XValueType.STRING = oFF.XValueType.create("String");
	oFF.XValueType.LOWER_CASE_STRING = oFF.XValueType.createExt("LowerCaseString", oFF.XValueType.STRING, 0, 0);
	oFF.XValueType.UPPER_CASE_STRING = oFF.XValueType.createExt("UpperCaseString", oFF.XValueType.STRING, 0, 0);
	oFF.XValueType.DATE = oFF.XValueType.create("Date");
	oFF.XValueType.DATE_TIME = oFF.XValueType.create("DateTime");
	oFF.XValueType.CALENDAR_DAY = oFF.XValueType.create("CalendarDay");
	oFF.XValueType.CALENDAR_DATE = oFF.XValueType.create("CalendarDate");
	oFF.XValueType.TIMESPAN = oFF.XValueType.create("TimeSpan");
	oFF.XValueType.TIME = oFF.XValueType.create("Time");
	oFF.XValueType.DIMENSION_MEMBER = oFF.XValueType.create("DimensionMember");
	oFF.XValueType.LANGUAGE = oFF.XValueType.create("Language");
	oFF.XValueType.PROPERTIES = oFF.XValueType.create("Properties");
	oFF.XValueType.STRUCTURE = oFF.XValueType.create("Structure");
	oFF.XValueType.STRUCTURE_LIST = oFF.XValueType.create("StructureList");
	oFF.XValueType.KEY_VALUE = oFF.XValueType.create("KeyValue");
	oFF.XValueType.BYTE_ARRAY = oFF.XValueType.create("ByteArray");
	oFF.XValueType.URI = oFF.XValueType.create("Uri");
	oFF.XValueType.VARIABLE = oFF.XValueType.create("Variable");
	oFF.XValueType.UNSUPPORTED = oFF.XValueType.create("Unsupported");
	oFF.XValueType.ENUM_CONSTANT = oFF.XValueType.create("EnumConstant");
	oFF.XValueType.POLYGON = oFF.XValueType.create("Polygon");
	oFF.XValueType.MULTI_POLYGON = oFF.XValueType.create("MultiPolygon");
	oFF.XValueType.POINT = oFF.XValueType.create("Point");
	oFF.XValueType.MULTI_POINT = oFF.XValueType.create("MultiPoint");
	oFF.XValueType.LINE_STRING = oFF.XValueType.create("LineString");
	oFF.XValueType.MULTI_LINE_STRING = oFF.XValueType.create("MultiLineString");
	oFF.XValueType.CURRENT_MEMBER = oFF.XValueType.create("CurrentMember");
	oFF.XValueType.ARRAY = oFF.XValueType.create("Array");
	oFF.XValueType.LIST = oFF.XValueType.create("List");
	oFF.XValueType.OPTION_LIST = oFF.XValueType.create("OptionList");
	oFF.XValueType.OPTION_VALUE = oFF.XValueType.create("OptionValue");
	oFF.XValueType.UNIT = oFF.XValueType.create("Unit");
	oFF.XValueType.CUKY = oFF.XValueType.create("Cuky");
	oFF.XValueType.OBJECT = oFF.XValueType.create("Object");
	oFF.XValueType.UI_CONTROL = oFF.XValueType.create("UiControl");
	oFF.XValueType.UI_CONSTANT = oFF.XValueType.create("UiConstant");
	oFF.XValueType.UI_DROP_INFO = oFF.XValueType.create("UiDropInfo");
	oFF.XValueType.UI_SIZE = oFF.XValueType.create("UiSize");
	oFF.XValueType.UI_POSITION = oFF.XValueType.create("UiPosition");
	oFF.XValueType.UI_COLOR = oFF.XValueType.create("UiColor");
	oFF.XValueType.UI_CSS_LENGTH = oFF.XValueType.create("UiCssLength");
	oFF.XValueType.UI_CSS_BOX_EDGES = oFF.XValueType.create("UiCssBoxEdges");
	oFF.XValueType.UI_CSS_TEXT_DECORATION = oFF.XValueType.create("UiCssTextDecoration");
	oFF.XValueType.UI_CSS_GAP = oFF.XValueType.create("UiCssGap");
	oFF.XValueType.UI_LAYOUT_DATA = oFF.XValueType.create("UiLayoutData");
	oFF.XValueType.UI_GRID_LAYOUT = oFF.XValueType.create("UiGridLayout");
	oFF.XValueType.STRING_ARRAY = oFF.XValueType.create("StringArray");
};
oFF.XValueType.create = function(constant)
{
	return oFF.XValueType.createExt(constant, null, 0, 0);
};
oFF.XValueType.createExt = function(constant, parent, defaultPrecision, defaultDecimals)
{
	var vt = new oFF.XValueType();
	if (oFF.notNull(parent))
	{
		vt.setupExt(constant, parent);
	}
	else
	{
		vt.setupExt(constant, null);
	}
	vt.m_decimals = defaultDecimals;
	vt.m_precision = defaultPrecision;
	return vt;
};
oFF.XValueType.prototype.m_decimals = 0;
oFF.XValueType.prototype.m_precision = 0;
oFF.XValueType.prototype.isBoolean = function()
{
	return this === oFF.XValueType.BOOLEAN;
};
oFF.XValueType.prototype.isNumber = function()
{
	return this === oFF.XValueType.INTEGER || this === oFF.XValueType.DOUBLE || this === oFF.XValueType.LONG || this === oFF.XValueType.PERCENT || this === oFF.XValueType.NUMC || this === oFF.XValueType.DECIMAL_FLOAT;
};
oFF.XValueType.prototype.isString = function()
{
	return this === oFF.XValueType.STRING || this === oFF.XValueType.LOWER_CASE_STRING || this === oFF.XValueType.UPPER_CASE_STRING;
};
oFF.XValueType.prototype.isDateBased = function()
{
	return this === oFF.XValueType.DATE || this === oFF.XValueType.DATE_TIME || this === oFF.XValueType.CALENDAR_DAY;
};
oFF.XValueType.prototype.isDateTime = function()
{
	return this.isDateBased() || this === oFF.XValueType.TIMESPAN || this === oFF.XValueType.TIME;
};
oFF.XValueType.prototype.isSpatial = function()
{
	return this === oFF.XValueType.POINT || this === oFF.XValueType.MULTI_POINT || this === oFF.XValueType.POLYGON || this === oFF.XValueType.MULTI_POLYGON || this === oFF.XValueType.LINE_STRING || this === oFF.XValueType.MULTI_LINE_STRING;
};
oFF.XValueType.prototype.isVariable = function()
{
	return this === oFF.XValueType.VARIABLE;
};
oFF.XValueType.prototype.getDefaultDecimalPlaces = function()
{
	return this.m_decimals;
};
oFF.XValueType.prototype.getDefaultPrecision = function()
{
	return this.m_precision;
};

oFF.LanguageExtModule = function() {};
oFF.LanguageExtModule.prototype = new oFF.DfModule();
oFF.LanguageExtModule.prototype._ff_c = "LanguageExtModule";

oFF.LanguageExtModule.s_module = null;
oFF.LanguageExtModule.getInstance = function()
{
	if (oFF.isNull(oFF.LanguageExtModule.s_module))
	{
		oFF.LanguageExtModule.s_module = oFF.DfModule.startExt(new oFF.LanguageExtModule());
		oFF.Severity.staticSetup();
		oFF.XSyncEnv.staticSetup();
		oFF.XLanguage.staticSetup();
		oFF.XPlatform.staticSetup();
		oFF.XAutoReleaseManager.staticSetup();
		oFF.XValueType.staticSetup();
		oFF.DfModule.stopExt(oFF.LanguageExtModule.s_module);
	}
	return oFF.LanguageExtModule.s_module;
};
oFF.LanguageExtModule.prototype.getName = function()
{
	return "ff0005.language.ext";
};

oFF.LanguageExtModule.getInstance();

return sap.firefly;
	} );