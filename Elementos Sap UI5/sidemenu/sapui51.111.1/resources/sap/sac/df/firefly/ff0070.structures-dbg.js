/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
[
"sap/sac/df/firefly/ff0060.commons.ext"
],
function(oFF)
{
"use strict";

oFF.JsonFilteringSerializerFactory = function() {};
oFF.JsonFilteringSerializerFactory.prototype = new oFF.XObject();
oFF.JsonFilteringSerializerFactory.prototype._ff_c = "JsonFilteringSerializerFactory";

oFF.JsonFilteringSerializerFactory.s_activeFactory = null;
oFF.JsonFilteringSerializerFactory.newFilteringSerializer = function()
{
	return oFF.JsonFilteringSerializerFactory.s_activeFactory.newInstance();
};
oFF.JsonFilteringSerializerFactory.setActiveFactory = function(activeFactory)
{
	oFF.JsonFilteringSerializerFactory.s_activeFactory = activeFactory;
};
oFF.JsonFilteringSerializerFactory.staticSetup = function()
{
	oFF.JsonFilteringSerializerFactory.setActiveFactory(new oFF.JsonFilteringSerializerFactory());
};
oFF.JsonFilteringSerializerFactory.prototype.newInstance = function()
{
	return oFF.PrUniversalFilteringSerializer.create();
};

oFF.JsonParserErrorCode = {

	JSON_PARSER_ROOT_ERROR:2000,
	JSON_PARSER_ILLEGAL_STATE:2001
};

oFF.JsonParserGenericStackElement = function() {};
oFF.JsonParserGenericStackElement.prototype = new oFF.XObject();
oFF.JsonParserGenericStackElement.prototype._ff_c = "JsonParserGenericStackElement";

oFF.JsonParserGenericStackElement.create = function()
{
	var jsonLevelInfo = new oFF.JsonParserGenericStackElement();
	jsonLevelInfo.reset();
	return jsonLevelInfo;
};
oFF.JsonParserGenericStackElement.prototype.m_element = null;
oFF.JsonParserGenericStackElement.prototype.m_name = null;
oFF.JsonParserGenericStackElement.prototype.m_valueSet = false;
oFF.JsonParserGenericStackElement.prototype.m_hasElements = false;
oFF.JsonParserGenericStackElement.prototype.m_isPreparedForNextElement = false;
oFF.JsonParserGenericStackElement.prototype.reset = function()
{
	this.m_element = null;
	this.m_name = null;
	this.m_valueSet = false;
	this.m_hasElements = false;
	this.m_isPreparedForNextElement = false;
};
oFF.JsonParserGenericStackElement.prototype.getElement = function()
{
	return this.m_element;
};
oFF.JsonParserGenericStackElement.prototype.setElement = function(element)
{
	this.m_element = element;
};
oFF.JsonParserGenericStackElement.prototype.getName = function()
{
	return this.m_name;
};
oFF.JsonParserGenericStackElement.prototype.setName = function(name)
{
	this.m_name = name;
};
oFF.JsonParserGenericStackElement.prototype.isNameSet = function()
{
	return oFF.notNull(this.m_name);
};
oFF.JsonParserGenericStackElement.prototype.setValueSet = function(valueSet)
{
	this.m_valueSet = valueSet;
};
oFF.JsonParserGenericStackElement.prototype.isValueSet = function()
{
	return this.m_valueSet;
};
oFF.JsonParserGenericStackElement.prototype.addElement = function()
{
	if (this.m_hasElements === false)
	{
		if (this.m_isPreparedForNextElement)
		{
			return false;
		}
		this.m_hasElements = true;
		return true;
	}
	if (this.m_isPreparedForNextElement === false)
	{
		return false;
	}
	this.m_isPreparedForNextElement = false;
	return true;
};
oFF.JsonParserGenericStackElement.prototype.nextElement = function()
{
	if (this.m_isPreparedForNextElement)
	{
		return false;
	}
	if (this.m_hasElements === false)
	{
		return false;
	}
	this.m_isPreparedForNextElement = true;
	return true;
};
oFF.JsonParserGenericStackElement.prototype.finishElements = function()
{
	if (this.m_isPreparedForNextElement)
	{
		return false;
	}
	return true;
};

oFF.XJson = function() {};
oFF.XJson.prototype = new oFF.XObject();
oFF.XJson.prototype._ff_c = "XJson";

oFF.XJson.s_extractor = null;
oFF.XJson.extractJsonContent = function(jsonObject)
{
	var element = null;
	if (oFF.notNull(jsonObject))
	{
		if (oFF.notNull(oFF.XJson.s_extractor))
		{
			element = oFF.XJson.s_extractor.extractJsonContent(jsonObject);
		}
		else
		{
			var xjson = jsonObject;
			element = xjson.getElement();
		}
	}
	return element;
};
oFF.XJson.setJsonExtractor = function(extractor)
{
	oFF.XJson.s_extractor = extractor;
};
oFF.XJson.prototype.toString = function()
{
	return this.getElement().toString();
};

oFF.PrSerializerFactory = function() {};
oFF.PrSerializerFactory.prototype = new oFF.XObject();
oFF.PrSerializerFactory.prototype._ff_c = "PrSerializerFactory";

oFF.PrSerializerFactory.s_activeFactory = null;
oFF.PrSerializerFactory.newSerializer = function(sortStructureElements, prettyPrint, indentation)
{
	return oFF.PrSerializerFactory.s_activeFactory.newInstance(sortStructureElements, prettyPrint, indentation);
};
oFF.PrSerializerFactory.setActiveFactory = function(activeFactory)
{
	oFF.PrSerializerFactory.s_activeFactory = activeFactory;
};
oFF.PrSerializerFactory.staticSetup = function()
{
	oFF.PrSerializerFactory.setActiveFactory(new oFF.PrSerializerFactory());
};
oFF.PrSerializerFactory.prototype.newInstance = function(sortStructureElements, prettyPrint, indentation)
{
	return oFF.PrUniversalSerializer.create(sortStructureElements, prettyPrint, indentation);
};

oFF.PrFilter = function() {};
oFF.PrFilter.prototype = new oFF.XObject();
oFF.PrFilter.prototype._ff_c = "PrFilter";

oFF.PrFilter.create = function()
{
	return new oFF.PrFilter();
};
oFF.PrFilter.addJsonPathElementToMap = function(jsonPath, element, existingResult)
{
	if (oFF.isNull(jsonPath))
	{
		return existingResult;
	}
	if (oFF.isNull(element))
	{
		return existingResult;
	}
	var result = existingResult;
	if (oFF.isNull(result))
	{
		result = oFF.XHashMapByString.create();
	}
	result.put(jsonPath, element);
	return result;
};
oFF.PrFilter.prototype.m_withStructures = false;
oFF.PrFilter.prototype.m_withLists = false;
oFF.PrFilter.prototype.m_withStrings = false;
oFF.PrFilter.prototype.m_withBooleans = false;
oFF.PrFilter.prototype.m_withNumbers = false;
oFF.PrFilter.prototype.m_withDoubles = false;
oFF.PrFilter.prototype.m_withLongs = false;
oFF.PrFilter.prototype.m_withIntegers = false;
oFF.PrFilter.prototype.m_withNulls = false;
oFF.PrFilter.prototype.withStructures = function()
{
	this.m_withStructures = true;
	return this;
};
oFF.PrFilter.prototype.withLists = function()
{
	this.m_withLists = true;
	return this;
};
oFF.PrFilter.prototype.withStrings = function()
{
	this.m_withStrings = true;
	return this;
};
oFF.PrFilter.prototype.withBooleans = function()
{
	this.m_withBooleans = true;
	return this;
};
oFF.PrFilter.prototype.withNumbers = function()
{
	this.m_withNumbers = true;
	return this;
};
oFF.PrFilter.prototype.withDoubles = function()
{
	this.m_withDoubles = true;
	return this;
};
oFF.PrFilter.prototype.withLongs = function()
{
	this.m_withLongs = true;
	return this;
};
oFF.PrFilter.prototype.withIntegers = function()
{
	this.m_withIntegers = true;
	return this;
};
oFF.PrFilter.prototype.withNulls = function()
{
	this.m_withNulls = true;
	return this;
};
oFF.PrFilter.prototype.filterJsonPathElements = function(jsonPathElements)
{
	if (oFF.isNull(jsonPathElements) || jsonPathElements.size() < 1)
	{
		return null;
	}
	var result = null;
	var jsonPaths = jsonPathElements.getKeysAsReadOnlyListOfString();
	for (var i = 0; i < jsonPaths.size(); i++)
	{
		var jsonPath = jsonPaths.get(i);
		var element = jsonPathElements.getByKey(jsonPath);
		var filteredElement = this.getElementFiltered(element);
		result = oFF.PrFilter.addJsonPathElementToMap(jsonPath, filteredElement, result);
	}
	return result;
};
oFF.PrFilter.prototype.getElementFiltered = function(element)
{
	if (oFF.isNull(element))
	{
		return null;
	}
	var type = element.getType();
	if (oFF.isNull(type))
	{
		return null;
	}
	if (type === oFF.PrElementType.STRUCTURE && this.m_withStructures)
	{
		return element;
	}
	if (type === oFF.PrElementType.LIST && this.m_withLists)
	{
		return element;
	}
	if (type === oFF.PrElementType.STRING && this.m_withStrings)
	{
		return element;
	}
	if (type === oFF.PrElementType.BOOLEAN && this.m_withBooleans)
	{
		return element;
	}
	if (type === oFF.PrElementType.DOUBLE && (this.m_withDoubles || this.m_withNumbers))
	{
		return element;
	}
	if (type === oFF.PrElementType.LONG && (this.m_withLongs || this.m_withNumbers))
	{
		return element;
	}
	if (type === oFF.PrElementType.INTEGER && (this.m_withIntegers || this.m_withNumbers))
	{
		return element;
	}
	if (type === oFF.PrElementType.THE_NULL && this.m_withNulls)
	{
		return element;
	}
	return null;
};

oFF.PrUniversalFilteringSerializer = function() {};
oFF.PrUniversalFilteringSerializer.prototype = new oFF.XObject();
oFF.PrUniversalFilteringSerializer.prototype._ff_c = "PrUniversalFilteringSerializer";

oFF.PrUniversalFilteringSerializer.create = function()
{
	var serializer = new oFF.PrUniversalFilteringSerializer();
	return serializer;
};
oFF.PrUniversalFilteringSerializer.prototype.m_buffer = null;
oFF.PrUniversalFilteringSerializer.prototype.serializeWithFilter = function(element, prFilter)
{
	this.m_buffer = oFF.XStringBuffer.create();
	this.appendElementBl(element, prFilter);
	var result = this.m_buffer.toString();
	this.m_buffer = oFF.XObjectExt.release(this.m_buffer);
	return result;
};
oFF.PrUniversalFilteringSerializer.prototype.appendElementBl = function(element, prFilter)
{
	if (oFF.isNull(element))
	{
		this.m_buffer.append("null");
	}
	else
	{
		var type = element.getType();
		if (type === oFF.PrElementType.STRUCTURE)
		{
			this.appendStructureBl(element, prFilter);
		}
		else if (type === oFF.PrElementType.LIST)
		{
			this.appendListBl(element, prFilter);
		}
		else if (type === oFF.PrElementType.STRING)
		{
			var stringValue = element.asString().getString();
			if (oFF.isNull(stringValue))
			{
				this.m_buffer.append("null");
			}
			else
			{
				this.m_buffer.append("\"");
				this.m_buffer.append(oFF.XStringUtils.escapeControlChars(oFF.XHttpUtils.escapeToJsonString(stringValue)));
				this.m_buffer.append("\"");
			}
		}
		else if (type === oFF.PrElementType.DOUBLE)
		{
			this.m_buffer.appendDouble(element.asNumber().getDouble());
		}
		else if (type.isNumber())
		{
			this.m_buffer.appendLong(element.asNumber().getLong());
		}
		else if (type === oFF.PrElementType.BOOLEAN)
		{
			this.m_buffer.appendBoolean(element.asBoolean().getBoolean());
		}
		else if (type === oFF.PrElementType.THE_NULL)
		{
			this.m_buffer.append("null");
		}
	}
};
oFF.PrUniversalFilteringSerializer.prototype.appendListBl = function(element, prFilter)
{
	this.m_buffer.append("[");
	var hasElements = false;
	var list = element;
	var size = list.size();
	var subFilter = oFF.isNull(prFilter) ? null : prFilter.getListSubFilter();
	for (var i = 0; i < size; i++)
	{
		if (hasElements)
		{
			this.m_buffer.append(",");
		}
		hasElements = true;
		var listElement = list.get(i);
		if (oFF.notNull(subFilter))
		{
			subFilter.submitIndex(i, listElement);
		}
		this.appendElementBl(listElement, subFilter);
	}
	this.m_buffer.append("]");
};
oFF.PrUniversalFilteringSerializer.prototype.appendStructureBl = function(element, prFilter)
{
	this.m_buffer.append("{");
	var hasElements = false;
	var structure = element;
	var structureElementNames = structure.getKeysAsReadOnlyListOfString();
	if (oFF.notNull(structureElementNames))
	{
		var structureSize = structureElementNames.size();
		structureElementNames.sortByDirection(oFF.XSortDirection.ASCENDING);
		for (var i = 0; i < structureSize; i++)
		{
			var structureElementName = structureElementNames.get(i);
			var structureElement = structure.getByKey(structureElementName);
			var subFilter = oFF.isNull(prFilter) ? null : prFilter.getSubFilter(structureElementName);
			if (oFF.notNull(subFilter) && subFilter.isIgnore(structureElementName, structureElement))
			{
				continue;
			}
			if (hasElements)
			{
				this.m_buffer.append(",");
			}
			hasElements = true;
			this.m_buffer.append("\"");
			this.m_buffer.append(this.escapeQuote(structureElementName));
			this.m_buffer.append("\":");
			this.appendElementBl(structureElement, subFilter);
		}
	}
	this.m_buffer.append("}");
};
oFF.PrUniversalFilteringSerializer.prototype.escapeQuote = function(name)
{
	return oFF.XString.containsString(name, "\"") ? oFF.XString.replace(name, "\"", "\\\"") : name;
};

oFF.PrUniversalSerializer = function() {};
oFF.PrUniversalSerializer.prototype = new oFF.XObject();
oFF.PrUniversalSerializer.prototype._ff_c = "PrUniversalSerializer";

oFF.PrUniversalSerializer.create = function(sortStructureElements, prettyPrint, indentation)
{
	var serializer = new oFF.PrUniversalSerializer();
	serializer.m_indentation = indentation;
	serializer.m_pretty = prettyPrint;
	serializer.m_sort = sortStructureElements;
	return serializer;
};
oFF.PrUniversalSerializer.prototype.m_sort = false;
oFF.PrUniversalSerializer.prototype.m_pretty = false;
oFF.PrUniversalSerializer.prototype.m_indentation = 0;
oFF.PrUniversalSerializer.prototype.m_buffer = null;
oFF.PrUniversalSerializer.prototype.m_indentationLevel = 0;
oFF.PrUniversalSerializer.prototype.serialize = function(element)
{
	var result = null;
	if (oFF.notNull(element))
	{
		this.m_buffer = oFF.XStringBuffer.create();
		this.appendElement(element, null);
		result = this.m_buffer.toString();
		this.m_buffer = oFF.XObjectExt.release(this.m_buffer);
	}
	return result;
};
oFF.PrUniversalSerializer.prototype.appendElement = function(element, elementName)
{
	if (this.m_pretty)
	{
		this.appendIndentationString();
	}
	if (oFF.notNull(elementName))
	{
		this.m_buffer.append("\"");
		this.m_buffer.append(this.escape(elementName));
		this.m_buffer.append("\":");
		if (this.m_pretty)
		{
			this.m_buffer.append(" ");
		}
	}
	if (oFF.isNull(element))
	{
		this.m_buffer.append("null");
	}
	else
	{
		var type = element.getType();
		if (type === oFF.PrElementType.STRUCTURE)
		{
			this.appendStructure(element);
		}
		else if (type === oFF.PrElementType.LIST)
		{
			this.appendList(element);
		}
		else if (type === oFF.PrElementType.STRING)
		{
			var stringValue = element.asString().getString();
			if (oFF.isNull(stringValue))
			{
				this.m_buffer.append("null");
			}
			else
			{
				this.m_buffer.append("\"");
				this.m_buffer.append(oFF.XStringUtils.escapeControlChars(oFF.XHttpUtils.escapeToJsonString(stringValue)));
				this.m_buffer.append("\"");
			}
		}
		else if (type === oFF.PrElementType.DOUBLE)
		{
			this.m_buffer.appendDouble(element.asNumber().getDouble());
		}
		else if (type.isNumber())
		{
			this.m_buffer.appendLong(element.asNumber().getLong());
		}
		else if (type === oFF.PrElementType.BOOLEAN)
		{
			if (element.getBoolean())
			{
				this.m_buffer.append("true");
			}
			else
			{
				this.m_buffer.append("false");
			}
		}
		else if (type === oFF.PrElementType.THE_NULL)
		{
			this.m_buffer.append("null");
		}
	}
};
oFF.PrUniversalSerializer.prototype.appendList = function(element)
{
	this.m_buffer.append("[");
	var hasElements = false;
	var list = element;
	var size = list.size();
	for (var i = 0; i < size; i++)
	{
		if (hasElements)
		{
			this.m_buffer.append(",");
		}
		hasElements = true;
		var listElement = list.get(i);
		if (this.m_pretty)
		{
			this.m_buffer.appendNewLine();
			this.m_indentationLevel++;
			this.appendElement(listElement, null);
			this.m_indentationLevel--;
		}
		else
		{
			this.appendElement(listElement, null);
		}
	}
	if (this.m_pretty && hasElements)
	{
		this.m_buffer.appendNewLine();
		this.appendIndentationString();
	}
	this.m_buffer.append("]");
};
oFF.PrUniversalSerializer.prototype.appendStructure = function(element)
{
	this.m_buffer.append("{");
	var hasElements = false;
	var structure = element;
	var structureElementNames = structure.getKeysAsReadOnlyListOfString();
	if (oFF.notNull(structureElementNames))
	{
		var structureSize = structureElementNames.size();
		if (this.m_sort && structureSize > 1)
		{
			structureElementNames.sortByDirection(oFF.XSortDirection.ASCENDING);
		}
		for (var i = 0; i < structureSize; i++)
		{
			if (hasElements)
			{
				this.m_buffer.append(",");
			}
			hasElements = true;
			var structureElementName = structureElementNames.get(i);
			var structureElement = structure.getByKey(structureElementName);
			if (this.m_pretty)
			{
				this.m_buffer.appendNewLine();
				this.m_indentationLevel++;
				this.appendElement(structureElement, structureElementName);
				this.m_indentationLevel--;
			}
			else
			{
				this.appendElement(structureElement, structureElementName);
			}
		}
	}
	if (this.m_pretty && hasElements)
	{
		this.m_buffer.appendNewLine();
		this.appendIndentationString();
	}
	this.m_buffer.append("}");
};
oFF.PrUniversalSerializer.prototype.appendIndentationString = function()
{
	if (this.m_indentation >= 1 && this.m_indentationLevel >= 1)
	{
		var spaces = this.m_indentation * this.m_indentationLevel;
		for (var i = 0; i < spaces; i++)
		{
			this.m_buffer.append(" ");
		}
	}
};
oFF.PrUniversalSerializer.prototype.escape = function(name)
{
	var result = name;
	result = oFF.XString.replace(result, "\\", "\\\\");
	result = oFF.XString.replace(result, "\"", "\\\"");
	result = oFF.XString.replace(result, "\b", "\\b");
	result = oFF.XString.replace(result, "\f", "\\f");
	result = oFF.XString.replace(result, "\n", "\\n");
	result = oFF.XString.replace(result, "\r", "\\r");
	result = oFF.XString.replace(result, "\t", "\\t");
	return result;
};

oFF.PrUtils = {

	asListOfString:function(list)
	{
			var result = oFF.XListOfString.create();
		if (!oFF.PrUtils.isElementValid(list, oFF.PrElementType.LIST))
		{
			return result;
		}
		var size = list.size();
		for (var i = 0; i < size; i++)
		{
			result.add(oFF.PrUtils.getStringValueElement(list, i, null));
		}
		return result;
	},
	asStructure:function(element)
	{
			return oFF.PrUtils.isElementValid(element, oFF.PrElementType.STRUCTURE) ? element : null;
	},
	asList:function(element)
	{
			return oFF.PrUtils.isElementValid(element, oFF.PrElementType.LIST) ? element : null;
	},
	isListEmpty:function(list)
	{
			return oFF.isNull(list) || list.isEmpty();
	},
	asString:function(element)
	{
			return oFF.PrUtils.isElementValid(element, oFF.PrElementType.STRING) ? element : null;
	},
	asBoolean:function(element)
	{
			return oFF.PrUtils.isElementValid(element, oFF.PrElementType.BOOLEAN) ? element : null;
	},
	asNumber:function(element)
	{
			if (!oFF.PrUtils.isElementValid(element, oFF.PrElementType.DOUBLE) && !oFF.PrUtils.isElementValid(element, oFF.PrElementType.INTEGER) && !oFF.PrUtils.isElementValid(element, oFF.PrElementType.LONG))
		{
			return null;
		}
		return element.asNumber();
	},
	asDouble:function(element)
	{
			return oFF.PrUtils.isElementValid(element, oFF.PrElementType.DOUBLE) ? element : null;
	},
	asInteger:function(element)
	{
			return oFF.PrUtils.isElementValid(element, oFF.PrElementType.INTEGER) ? element : null;
	},
	asLong:function(element)
	{
			return oFF.PrUtils.isElementValid(element, oFF.PrElementType.LONG) ? element : null;
	},
	copyIntegerValues:function(parameterList, existingArray)
	{
			var size = parameterList.size();
		var localArray;
		if (oFF.isNull(existingArray) || existingArray.size() !== size)
		{
			localArray = oFF.XArrayOfInt.create(size);
		}
		else
		{
			localArray = existingArray;
		}
		for (var i = 0; i < size; i++)
		{
			localArray.set(i, parameterList.getIntegerAt(i));
		}
		return localArray;
	},
	getProperty:function(structure, name)
	{
			if (oFF.isNull(structure) || oFF.isNull(name))
		{
			return null;
		}
		return structure.getByKey(name);
	},
	isElementValid:function(element, type)
	{
			return oFF.isNull(element) ? false : element.getType() === type;
	},
	getStructureProperty:function(structure, name)
	{
			var element = oFF.PrUtils.getProperty(structure, name);
		return oFF.PrUtils.asStructure(element);
	},
	getListProperty:function(structure, name)
	{
			var element = oFF.PrUtils.getProperty(structure, name);
		return oFF.PrUtils.asList(element);
	},
	getPropertyAsList:function(structure, name)
	{
			return oFF.PrUtils.convertToList(oFF.PrUtils.getProperty(structure, name));
	},
	convertToList:function(element)
	{
			if (oFF.isNull(element))
		{
			return null;
		}
		if (element.isList())
		{
			return element;
		}
		var list = oFF.PrFactory.createList();
		list.add(element);
		return list;
	},
	getStringProperty:function(structure, name)
	{
			var element = oFF.PrUtils.getProperty(structure, name);
		return oFF.PrUtils.convertElementToString(element);
	},
	getStringValueProperty:function(structure, name, defaultValue)
	{
			var element = oFF.PrUtils.getProperty(structure, name);
		return oFF.PrUtils.convertElementToStringValue(element, defaultValue);
	},
	getBooleanProperty:function(structure, name)
	{
			var element = oFF.PrUtils.getProperty(structure, name);
		return oFF.PrUtils.convertElementToBoolean(element);
	},
	getBooleanValueProperty:function(structure, name, defaultValue)
	{
			var element = oFF.PrUtils.getProperty(structure, name);
		return oFF.PrUtils.convertElementToBooleanValue(element, defaultValue);
	},
	getNumberProperty:function(structure, name)
	{
			var element = oFF.PrUtils.getProperty(structure, name);
		return oFF.PrUtils.convertElementToNumber(element);
	},
	getIntegerProperty:function(structure, name)
	{
			var element = oFF.PrUtils.getProperty(structure, name);
		return oFF.PrUtils.convertElementToInteger(element);
	},
	getIntegerValueProperty:function(structure, name, defaultValue)
	{
			var element = oFF.PrUtils.getProperty(structure, name);
		return oFF.PrUtils.convertElementToIntegerValue(element, defaultValue);
	},
	getDoubleProperty:function(structure, name)
	{
			var element = oFF.PrUtils.getProperty(structure, name);
		return oFF.PrUtils.convertElementToDouble(element);
	},
	getDoubleValueProperty:function(structure, name, defaultValue)
	{
			var element = oFF.PrUtils.getProperty(structure, name);
		return oFF.PrUtils.convertElementToDoubleValue(element, defaultValue);
	},
	getLongProperty:function(structure, name)
	{
			var element = oFF.PrUtils.getProperty(structure, name);
		return oFF.PrUtils.convertElementToLong(element);
	},
	getLongValueProperty:function(structure, name, defaultValue)
	{
			var element = oFF.PrUtils.getProperty(structure, name);
		return oFF.PrUtils.convertElementToLongValue(element, defaultValue);
	},
	getDateProperty:function(structure, name, isSapFormat, defaultValue)
	{
			var stringProperty = oFF.PrUtils.getStringProperty(structure, name);
		if (oFF.isNull(stringProperty))
		{
			return defaultValue;
		}
		var result = oFF.XDate.createDateFromStringWithFlag(stringProperty.getString(), isSapFormat);
		return oFF.isNull(result) ? defaultValue : result;
	},
	getTimeProperty:function(structure, name, isSapFormat, defaultValue)
	{
			var stringProperty = oFF.PrUtils.getStringProperty(structure, name);
		if (oFF.isNull(stringProperty))
		{
			return defaultValue;
		}
		var result = oFF.XTime.createTimeFromStringWithFlag(stringProperty.getString(), isSapFormat);
		return oFF.isNull(result) ? defaultValue : result;
	},
	getDateTimeProperty:function(structure, name, isSapFormat, defaultValue)
	{
			var stringProperty = oFF.PrUtils.getStringProperty(structure, name);
		if (oFF.isNull(stringProperty))
		{
			return defaultValue;
		}
		var result = oFF.XDateTime.createDateTimeFromStringWithFlag(stringProperty.getString(), isSapFormat);
		return oFF.isNull(result) ? defaultValue : result;
	},
	getElement:function(list, index)
	{
			if (oFF.isNull(list) || index < 0 || index >= list.size())
		{
			return null;
		}
		return list.get(index);
	},
	getStructureElement:function(list, index)
	{
			var element = oFF.PrUtils.getElement(list, index);
		return oFF.PrUtils.asStructure(element);
	},
	getListElement:function(list, index)
	{
			var element = oFF.PrUtils.getElement(list, index);
		return oFF.PrUtils.asList(element);
	},
	getStringElement:function(list, index)
	{
			var element = oFF.PrUtils.getElement(list, index);
		return oFF.PrUtils.convertElementToString(element);
	},
	getStringValueElement:function(list, index, defaultValue)
	{
			var element = oFF.PrUtils.getElement(list, index);
		return oFF.PrUtils.convertElementToStringValue(element, defaultValue);
	},
	getBooleanElement:function(list, index)
	{
			var element = oFF.PrUtils.getElement(list, index);
		return oFF.PrUtils.convertElementToBoolean(element);
	},
	getBooleanValueElement:function(list, index, defaultValue)
	{
			var element = oFF.PrUtils.getElement(list, index);
		return oFF.PrUtils.convertElementToBooleanValue(element, defaultValue);
	},
	getNumberElement:function(list, index)
	{
			var element = oFF.PrUtils.getElement(list, index);
		return oFF.PrUtils.convertElementToNumber(element);
	},
	getIntegerElement:function(list, index)
	{
			var element = oFF.PrUtils.getElement(list, index);
		return oFF.PrUtils.convertElementToInteger(element);
	},
	getIntegerValueElement:function(list, index, defaultValue)
	{
			var element = oFF.PrUtils.getElement(list, index);
		return oFF.PrUtils.convertElementToIntegerValue(element, defaultValue);
	},
	getDoubleElement:function(list, index)
	{
			var element = oFF.PrUtils.getElement(list, index);
		return oFF.PrUtils.convertElementToDouble(element);
	},
	getDoubleValueElement:function(list, index, defaultValue)
	{
			var element = oFF.PrUtils.getElement(list, index);
		return oFF.PrUtils.convertElementToDoubleValue(element, defaultValue);
	},
	getLongElement:function(list, index)
	{
			var element = oFF.PrUtils.getElement(list, index);
		return oFF.PrUtils.convertElementToLong(element);
	},
	getLongValueElement:function(list, index, defaultValue)
	{
			var element = oFF.PrUtils.getElement(list, index);
		return oFF.PrUtils.convertElementToLongValue(element, defaultValue);
	},
	getDateElement:function(list, index, isSapFormat, defaultValue)
	{
			var stringElement = oFF.PrUtils.getStringElement(list, index);
		if (oFF.isNull(stringElement))
		{
			return defaultValue;
		}
		var result = oFF.XDate.createDateFromStringWithFlag(stringElement.getString(), isSapFormat);
		return oFF.isNull(result) ? defaultValue : result;
	},
	getTimeElement:function(list, index, isSapFormat, defaultValue)
	{
			var stringElement = oFF.PrUtils.getStringElement(list, index);
		if (oFF.isNull(stringElement))
		{
			return defaultValue;
		}
		var result = oFF.XTime.createTimeFromStringWithFlag(stringElement.getString(), isSapFormat);
		return oFF.isNull(result) ? defaultValue : result;
	},
	getDateTimeElement:function(list, index, isSapFormat, defaultValue)
	{
			var stringElement = oFF.PrUtils.getStringElement(list, index);
		if (oFF.isNull(stringElement))
		{
			return defaultValue;
		}
		var result = oFF.XDateTime.createDateTimeFromStringWithFlag(stringElement.getString(), isSapFormat);
		return oFF.isNull(result) ? defaultValue : result;
	},
	convertIntegerToString:function(element)
	{
			var integerElement = element;
		return oFF.XInteger.convertToString(integerElement.getInteger());
	},
	convertDoubleToString:function(element)
	{
			var doubleElement = element;
		return oFF.XDouble.convertToString(doubleElement.getDouble());
	},
	convertLongToString:function(element)
	{
			var longElement = element;
		return oFF.XLong.convertToString(longElement.getLong());
	},
	convertBoolToString:function(element)
	{
			var booleanElement = element;
		return oFF.XBoolean.convertToString(booleanElement.getBoolean());
	},
	getTypeFromElement:function(element)
	{
			return oFF.isNull(element) ? null : element.getType();
	},
	convertElementToString:function(element)
	{
			var type = oFF.PrUtils.getTypeFromElement(element);
		if (oFF.isNull(type))
		{
			return null;
		}
		var stringValue = null;
		if (type === oFF.PrElementType.STRING)
		{
			return element;
		}
		else if (type === oFF.PrElementType.BOOLEAN)
		{
			stringValue = oFF.PrUtils.convertBoolToString(element);
		}
		else if (type === oFF.PrElementType.INTEGER)
		{
			stringValue = oFF.PrUtils.convertIntegerToString(element);
		}
		else if (type === oFF.PrElementType.DOUBLE)
		{
			stringValue = oFF.PrUtils.convertDoubleToString(element);
		}
		else if (type === oFF.PrElementType.LONG)
		{
			stringValue = oFF.PrUtils.convertLongToString(element);
		}
		return oFF.PrFactory.createString(stringValue);
	},
	convertElementToStringValue:function(element, defaultValue)
	{
			if (oFF.isNull(element))
		{
			return defaultValue;
		}
		var prString = oFF.PrUtils.convertElementToString(element);
		return oFF.isNull(prString) ? defaultValue : prString.getString();
	},
	convertElementToBoolean:function(element)
	{
			var type = oFF.PrUtils.getTypeFromElement(element);
		if (oFF.isNull(type))
		{
			return null;
		}
		if (type === oFF.PrElementType.BOOLEAN)
		{
			return element;
		}
		if (type === oFF.PrElementType.STRING)
		{
			try
			{
				var booleanValue = oFF.XBoolean.convertFromString(element.getString());
				return oFF.PrFactory.createBoolean(booleanValue);
			}
			catch (t)
			{
				return null;
			}
		}
		return null;
	},
	convertElementToBooleanValue:function(element, defaultValue)
	{
			var elementAsBoolean = oFF.PrUtils.convertElementToBoolean(element);
		return oFF.isNull(elementAsBoolean) ? defaultValue : elementAsBoolean.getBoolean();
	},
	convertElementToNumber:function(element)
	{
			var type = oFF.PrUtils.getTypeFromElement(element);
		if (oFF.isNull(type))
		{
			return null;
		}
		if (type === oFF.PrElementType.STRING)
		{
			try
			{
				var doubleValue = oFF.XDouble.convertFromString(element.getString());
				return oFF.PrFactory.createDouble(doubleValue);
			}
			catch (t)
			{
				return null;
			}
		}
		if (type.isNumber())
		{
			return element.asNumber();
		}
		return null;
	},
	convertElementToInteger:function(element)
	{
			var type = oFF.PrUtils.getTypeFromElement(element);
		if (oFF.isNull(type))
		{
			return null;
		}
		if (type === oFF.PrElementType.INTEGER)
		{
			return element;
		}
		if (type.isNumber())
		{
			return oFF.PrFactory.createInteger(element.asNumber().getInteger());
		}
		if (type === oFF.PrElementType.STRING)
		{
			try
			{
				var integerValue = oFF.XInteger.convertFromStringWithRadix(element.getString(), 10);
				return oFF.PrFactory.createInteger(integerValue);
			}
			catch (t1)
			{
				return null;
			}
		}
		return null;
	},
	convertElementToIntegerValue:function(element, defaultValue)
	{
			var elementAsInteger = oFF.PrUtils.convertElementToInteger(element);
		return oFF.isNull(elementAsInteger) ? defaultValue : elementAsInteger.getInteger();
	},
	convertElementToLong:function(element)
	{
			var type = oFF.PrUtils.getTypeFromElement(element);
		if (oFF.isNull(type))
		{
			return null;
		}
		if (type === oFF.PrElementType.LONG)
		{
			return element;
		}
		if (type.isNumber())
		{
			return oFF.PrFactory.createLong(element.asNumber().getLong());
		}
		if (type === oFF.PrElementType.STRING)
		{
			try
			{
				var longValue = oFF.XLong.convertFromString(element.getString());
				return oFF.PrFactory.createLong(longValue);
			}
			catch (t1)
			{
				return null;
			}
		}
		return null;
	},
	convertElementToLongValue:function(element, defaultValue)
	{
			var elementAsLong = oFF.PrUtils.convertElementToLong(element);
		return oFF.isNull(elementAsLong) ? defaultValue : elementAsLong.getLong();
	},
	convertElementToDouble:function(element)
	{
			var type = oFF.PrUtils.getTypeFromElement(element);
		if (oFF.isNull(type))
		{
			return null;
		}
		if (type === oFF.PrElementType.DOUBLE)
		{
			return element;
		}
		if (type.isNumber())
		{
			return oFF.PrFactory.createDouble(element.asNumber().getDouble());
		}
		if (type === oFF.PrElementType.STRING)
		{
			try
			{
				var doubleValue = oFF.XDouble.convertFromString(element.getString());
				return oFF.PrFactory.createDouble(doubleValue);
			}
			catch (t1)
			{
				return null;
			}
		}
		return null;
	},
	convertElementToDoubleValue:function(element, defaultValue)
	{
			var elementAsDouble = oFF.PrUtils.convertElementToDouble(element);
		return oFF.isNull(elementAsDouble) ? defaultValue : elementAsDouble.getDouble();
	},
	getListSize:function(element, defaultSize)
	{
			return oFF.PrUtils.isElementValid(element, oFF.PrElementType.LIST) ? element.size() : defaultSize;
	},
	getKeysAsReadOnlyListOfString:function(element, defaultNames)
	{
			return oFF.PrUtils.isElementValid(element, oFF.PrElementType.STRUCTURE) ? element.getKeysAsReadOnlyListOfString() : defaultNames;
	},
	getStructureSize:function(element, defaultSize)
	{
			var elementNames = oFF.PrUtils.getKeysAsReadOnlyListOfString(element, null);
		return oFF.isNull(elementNames) ? defaultSize : elementNames.size();
	},
	createDeepCopy:function(element)
	{
			return oFF.PrUtils.createDeepCopyExt(element, null);
	},
	createDeepCopyExt:function(element, target)
	{
			var type = oFF.PrUtils.getTypeFromElement(element);
		if (oFF.isNull(type))
		{
			return null;
		}
		var prStruct = oFF.PrElementType.STRUCTURE;
		var prList = oFF.PrElementType.LIST;
		var prBoolean = oFF.PrElementType.BOOLEAN;
		var prString = oFF.PrElementType.STRING;
		var prInt = oFF.PrElementType.INTEGER;
		var prLong = oFF.PrElementType.LONG;
		var prDouble = oFF.PrElementType.DOUBLE;
		var childCopy;
		var originChild;
		if (type === prStruct)
		{
			var originStruct = element;
			var structure = target;
			if (oFF.isNull(structure))
			{
				structure = oFF.PrFactory.createStructure();
			}
			else
			{
				structure.clear();
			}
			var elementNames = originStruct.getKeysAsReadOnlyListOfString();
			var len = elementNames.size();
			for (var i = 0; i < len; i++)
			{
				var name = elementNames.get(i);
				originChild = originStruct.getByKey(name);
				childCopy = oFF.PrUtils.createDeepCopyExt(originChild, null);
				structure.put(name, childCopy);
			}
			return structure;
		}
		else if (type === prList)
		{
			var originList = element;
			var list = target;
			if (oFF.isNull(list))
			{
				list = oFF.PrFactory.createList();
			}
			else
			{
				list.clear();
			}
			var size = originList.size();
			for (var k = 0; k < size; k++)
			{
				originChild = originList.get(k);
				childCopy = oFF.PrUtils.createDeepCopyExt(originChild, null);
				list.add(childCopy);
			}
			return list;
		}
		else if (type === prBoolean)
		{
			var originBoolean = element;
			return oFF.PrFactory.createBoolean(originBoolean.getBoolean());
		}
		else if (type === prString)
		{
			var originString = element;
			return oFF.PrFactory.createString(originString.getString());
		}
		else if (type === prInt)
		{
			var originInt = element;
			return oFF.PrFactory.createInteger(originInt.getInteger());
		}
		else if (type === prLong)
		{
			var originLong = element;
			return oFF.PrFactory.createLong(originLong.getLong());
		}
		else if (type === prDouble)
		{
			var originDouble = element;
			return oFF.PrFactory.createDouble(originDouble.getDouble());
		}
		return null;
	},
	mergeStructures:function(mainStructure, overlayStructure)
	{
			if (oFF.notNull(mainStructure) && oFF.notNull(overlayStructure))
		{
			var elementNames = overlayStructure.getKeysAsReadOnlyListOfString();
			var len = elementNames.size();
			for (var i = 0; i < len; i++)
			{
				var name = elementNames.get(i);
				var type = overlayStructure.getElementTypeByKey(name);
				if (type === oFF.PrElementType.BOOLEAN)
				{
					mainStructure.putBoolean(name, overlayStructure.getBooleanByKey(name));
				}
				else if (type === oFF.PrElementType.INTEGER)
				{
					mainStructure.putInteger(name, overlayStructure.getIntegerByKey(name));
				}
				else if (type === oFF.PrElementType.LONG)
				{
					mainStructure.putLong(name, overlayStructure.getLongByKey(name));
				}
				else if (type === oFF.PrElementType.DOUBLE)
				{
					mainStructure.putDouble(name, overlayStructure.getDoubleByKey(name));
				}
				else if (type === oFF.PrElementType.STRING)
				{
					mainStructure.putString(name, overlayStructure.getStringByKey(name));
				}
				else if (type === oFF.PrElementType.STRUCTURE || type === oFF.PrElementType.LIST)
				{
					var element = overlayStructure.getByKey(name);
					var targetElement = oFF.PrUtils.createDeepCopy(element);
					mainStructure.put(name, targetElement);
				}
			}
		}
	},
	removeProperty:function(structure, name)
	{
			if (oFF.notNull(structure) && oFF.PrUtils.getProperty(structure, name) !== null)
		{
			return structure.remove(name);
		}
		return null;
	},
	createElementDeepCopy:function(element)
	{
			return oFF.isNull(element) ? null : oFF.PrUtils.copyElement(element);
	},
	copyElement:function(element)
	{
			if (oFF.isNull(element))
		{
			return null;
		}
		var prElementType = element.getType();
		if (oFF.PrElementType.BOOLEAN === prElementType)
		{
			return oFF.PrFactory.createBoolean(element.getBoolean());
		}
		else if (oFF.PrElementType.THE_NULL === prElementType)
		{
			return null;
		}
		else if (oFF.PrElementType.INTEGER === prElementType)
		{
			return oFF.PrFactory.createInteger(element.asNumber().getInteger());
		}
		else if (oFF.PrElementType.LONG === prElementType)
		{
			return oFF.PrFactory.createLong(element.asNumber().getLong());
		}
		else if (oFF.PrElementType.DOUBLE === prElementType)
		{
			return oFF.PrFactory.createDouble(element.asNumber().getDouble());
		}
		else if (oFF.PrElementType.STRING === prElementType)
		{
			return oFF.PrFactory.createString(element.getString());
		}
		else if (oFF.PrElementType.STRUCTURE === prElementType)
		{
			return oFF.PrUtils.copyStructure(element);
		}
		else if (oFF.PrElementType.LIST === prElementType)
		{
			return oFF.PrUtils.copyList(element);
		}
		throw oFF.XException.createIllegalStateException("unknown type");
	},
	copyStructure:function(structure)
	{
			var structureCopy = oFF.PrFactory.createStructure();
		var structureElementNames = structure.getKeysAsReadOnlyListOfString();
		var structureElementNamesSize = structureElementNames.size();
		for (var i = 0; i < structureElementNamesSize; i++)
		{
			var structureElementName = structureElementNames.get(i);
			var structureElement = structure.getByKey(structureElementName);
			var structureElementCopy = oFF.PrUtils.copyElement(structureElement);
			structureCopy.put(structureElementName, structureElementCopy);
		}
		return structureCopy;
	},
	copyList:function(list)
	{
			var listCopy = oFF.PrFactory.createList();
		var listSize = list.size();
		for (var i = 0; i < listSize; i++)
		{
			var listElement = list.get(i);
			var listElementCopy = oFF.PrUtils.copyElement(listElement);
			listCopy.add(listElementCopy);
		}
		return listCopy;
	},
	serialize:function(element, sortStructureElements, prettyPrint, indentation)
	{
			var serializer = oFF.PrSerializerFactory.newSerializer(sortStructureElements, prettyPrint, indentation);
		return serializer.serialize(element);
	},
	deepCopyElement:function(origin)
	{
			if (oFF.isNull(origin))
		{
			return null;
		}
		var type = origin.getType();
		if (type === oFF.PrElementType.STRUCTURE)
		{
			return oFF.PrStructure.createDeepCopy(origin);
		}
		else if (type === oFF.PrElementType.LIST)
		{
			return oFF.PrList.createDeepCopy(origin);
		}
		return origin.getPermaCopy();
	},
	contains:function(list, element)
	{
			return oFF.PrUtils.indexOf(list, element) > -1;
	},
	indexOf:function(list, element)
	{
			if (oFF.PrUtils.isListEmpty(list))
		{
			return -1;
		}
		var size = list.size();
		for (var i = 0; i < size; i++)
		{
			if (oFF.XObjectExt.areEqual(list.get(i), element))
			{
				return i;
			}
		}
		return -1;
	},
	getStructureWithKeyValuePair:function(list, key, value)
	{
			if (oFF.XCollectionUtils.hasElements(list) && oFF.XStringUtils.isNotNullAndNotEmpty(key) && oFF.XStringUtils.isNotNullAndNotEmpty(value))
		{
			var size = list.size();
			for (var i = 0; i < size; i++)
			{
				var structure = list.getStructureAt(i);
				if (oFF.XString.isEqual(oFF.PrUtils.getStringValueProperty(structure, key, null), value))
				{
					return structure;
				}
			}
		}
		return null;
	}
};

oFF.PrUtilsJsonPath = {

	getJsonPathTokens:function(jsonPath)
	{
			if (oFF.XStringUtils.isNullOrEmpty(jsonPath))
		{
			return null;
		}
		var startsWithDot = oFF.XString.startsWith(jsonPath, ".");
		var endsWithDot = oFF.XString.endsWith(jsonPath, ".");
		var jsonPathNormalized = jsonPath;
		if (startsWithDot || endsWithDot)
		{
			var sb = oFF.XStringBuffer.create();
			if (startsWithDot)
			{
				sb.append("startsWithDot");
			}
			sb.append(jsonPath);
			if (endsWithDot)
			{
				sb.append("endsWithDot");
			}
			jsonPathNormalized = sb.toString();
		}
		var tokens = oFF.XStringTokenizer.splitString(jsonPathNormalized, ".");
		if (oFF.isNull(tokens) || tokens.size() < 1)
		{
			return null;
		}
		if (startsWithDot || endsWithDot)
		{
			var normalizedTokens = oFF.XListOfString.create();
			for (var tokenIndex = 0; tokenIndex < tokens.size(); tokenIndex++)
			{
				if (tokenIndex === 0 && startsWithDot)
				{
					continue;
				}
				if (tokenIndex + 1 === tokens.size() && endsWithDot)
				{
					continue;
				}
				normalizedTokens.add(tokens.get(tokenIndex));
			}
			tokens = normalizedTokens;
		}
		return tokens;
	},
	getJsonPathIndexOperatorTokens:function(indexOperator)
	{
			if (oFF.XStringUtils.isNullOrEmpty(indexOperator))
		{
			return null;
		}
		var tokens = oFF.XStringTokenizer.splitString(indexOperator, ",");
		if (oFF.isNull(tokens) || tokens.size() < 1)
		{
			return null;
		}
		return tokens;
	},
	getJsonPathSinglePath:function(elements)
	{
			if (oFF.isNull(elements) || elements.size() !== 1)
		{
			return null;
		}
		return elements.getKeysAsReadOnlyListOfString().get(0);
	},
	getJsonPathSingleElement:function(elements)
	{
			if (oFF.isNull(elements) || elements.size() !== 1)
		{
			return null;
		}
		return elements.getByKey(elements.getKeysAsReadOnlyListOfString().get(0));
	},
	getFirstElementFromPath:function(element, jsonPath)
	{
			return oFF.PrUtilsJsonPath.getJsonPathSingleElement(oFF.PrUtilsJsonPath.getJsonPathElements(element, jsonPath));
	},
	getJsonPathElements:function(element, jsonPath)
	{
			var tokens = oFF.PrUtilsJsonPath.getJsonPathTokens(jsonPath);
		var pathsToElements = oFF.PrUtilsJsonPath.getJsonPathElementsInternal(element, tokens, 0, null, null);
		return pathsToElements;
	},
	checkJsonPathConstraints:function(jsonPath)
	{
			var tokens = oFF.PrUtilsJsonPath.getJsonPathTokens(jsonPath);
		if (oFF.isNull(tokens))
		{
			return oFF.XMessage.createError(oFF.OriginLayer.UTILITY, "json path null", null, false, null);
		}
		if (tokens.isEmpty())
		{
			return oFF.XMessage.createError(oFF.OriginLayer.UTILITY, "json path must start with $", null, false, null);
		}
		var isRecursiveSearch = false;
		for (var tokenIndex = 0; tokenIndex < tokens.size(); tokenIndex++)
		{
			var token = tokens.get(tokenIndex);
			if (oFF.isNull(token))
			{
				return oFF.XMessage.createError(oFF.OriginLayer.UTILITY, "json path token must not be null", null, false, null);
			}
			if (!oFF.XString.isEqual(token, oFF.XString.trim(token)))
			{
				return oFF.XMessage.createError(oFF.OriginLayer.UTILITY, "json path token must not contain whitespaces", null, false, null);
			}
			var node;
			var indexOperators = oFF.PrUtilsJsonPath.getJsonPathIndexOperators(token);
			if (oFF.isNull(indexOperators))
			{
				node = token;
			}
			else
			{
				node = oFF.PrUtilsJsonPath.getJsonPathNode(token);
			}
			if (!oFF.XString.isEqual(node, oFF.XString.trim(node)))
			{
				return oFF.XMessage.createError(oFF.OriginLayer.UTILITY, "json path token must not contain whitespaces", null, false, null);
			}
			if (tokenIndex === 0)
			{
				if (!oFF.XString.isEqual(node, "$"))
				{
					return oFF.XMessage.createError(oFF.OriginLayer.UTILITY, "json path must start with $", null, false, null);
				}
			}
			else
			{
				if (oFF.XString.isEqual(node, "$"))
				{
					return oFF.XMessage.createError(oFF.OriginLayer.UTILITY, "$ must only be used at first position", null, false, null);
				}
				else if (oFF.XString.isEqual(token, ""))
				{
					if (isRecursiveSearch)
					{
						return oFF.XMessage.createError(oFF.OriginLayer.UTILITY, "... is not valid, instead use .. for recursive search", null, false, null);
					}
					isRecursiveSearch = true;
				}
				else
				{
					isRecursiveSearch = false;
				}
			}
			if (oFF.notNull(indexOperators))
			{
				for (var operatorsIndex = 0; operatorsIndex < indexOperators.size(); operatorsIndex++)
				{
					var indexOperator = indexOperators.get(operatorsIndex);
					var operatorTokens = oFF.PrUtilsJsonPath.getJsonPathIndexOperatorTokens(indexOperator);
					if (oFF.isNull(operatorTokens))
					{
						return oFF.XMessage.createError(oFF.OriginLayer.UTILITY, "[] empty operator is not valid", null, false, null);
					}
					for (var operatorTokenIndex = 0; operatorTokenIndex < operatorTokens.size(); operatorTokenIndex++)
					{
						var operatorToken = operatorTokens.get(operatorTokenIndex);
						if (oFF.isNull(operatorToken))
						{
							return oFF.XMessage.createError(oFF.OriginLayer.UTILITY, "[] empty operator is not valid", null, false, null);
						}
						if (!oFF.XString.isEqual(operatorToken, oFF.XString.trim(operatorToken)))
						{
							return oFF.XMessage.createError(oFF.OriginLayer.UTILITY, "operator must not contain whitespaces", null, false, null);
						}
						if (oFF.XString.isEqual(operatorToken, ""))
						{
							return oFF.XMessage.createError(oFF.OriginLayer.UTILITY, "[] empty operator is not valid", null, false, null);
						}
						if (oFF.XString.isEqual(operatorToken, "*"))
						{
							if (operatorTokenIndex > 0)
							{
								return oFF.XMessage.createError(oFF.OriginLayer.UTILITY, "[*] operator is not valid in combination with other operators", null, false, null);
							}
							continue;
						}
						var operatorFirst = oFF.PrUtilsJsonPath.getJsonPathIndexOperatorFirst(operatorToken);
						if (operatorFirst < -1)
						{
							return oFF.XMessage.createError(oFF.OriginLayer.UTILITY, oFF.XStringUtils.concatenate3("[", operatorToken, "] invalid first operator, valid is 1 to n"), null, false, null);
						}
						if (operatorFirst > 0)
						{
							continue;
						}
						var operatorLast = oFF.PrUtilsJsonPath.getJsonPathIndexOperatorLast(operatorToken);
						if (operatorLast < -1)
						{
							return oFF.XMessage.createError(oFF.OriginLayer.UTILITY, oFF.XStringUtils.concatenate3("[", operatorToken, "] invalid last operator, valid is -1 to -n"), null, false, null);
						}
						if (operatorLast > 0)
						{
							continue;
						}
						var operatorNumber = oFF.PrUtilsJsonPath.getJsonPathIndexOperatorNumber(operatorToken);
						if (operatorNumber < 0)
						{
							return oFF.XMessage.createError(oFF.OriginLayer.UTILITY, oFF.XStringUtils.concatenate3("[", operatorToken, "] invalid number, valid is 0 to n"), null, false, null);
						}
					}
				}
			}
		}
		return null;
	},
	sortJsonPaths:function(paths)
	{
			if (oFF.isNull(paths) || paths.size() < 1)
		{
			return null;
		}
		var pathsToTokens = oFF.XHashMapByString.create();
		var maxTokenSize = 0;
		for (var pathIndex1 = 0; pathIndex1 < paths.size(); pathIndex1++)
		{
			var path1 = paths.get(pathIndex1);
			var tokens1 = oFF.PrUtilsJsonPath.getJsonPathTokens(path1);
			pathsToTokens.put(path1, tokens1);
			var tokenSize1 = tokens1.size();
			if (tokenSize1 > maxTokenSize)
			{
				maxTokenSize = tokenSize1;
			}
		}
		var tokenIndexMaxChars = oFF.XArrayOfInt.create(maxTokenSize);
		for (var pathIndex2 = 0; pathIndex2 < paths.size(); pathIndex2++)
		{
			var path2 = paths.get(pathIndex2);
			var tokens2 = pathsToTokens.getByKey(path2);
			for (var tokenIndex2 = 0; tokenIndex2 < tokens2.size(); tokenIndex2++)
			{
				var tokenChars2 = oFF.XString.size(tokens2.get(tokenIndex2));
				if (tokenChars2 > tokenIndexMaxChars.get(tokenIndex2))
				{
					tokenIndexMaxChars.set(tokenIndex2, tokenChars2);
				}
			}
		}
		var normalizedPathsToPaths = oFF.XHashMapOfStringByString.create();
		for (var pathIndex3 = 0; pathIndex3 < paths.size(); pathIndex3++)
		{
			var path3 = paths.get(pathIndex3);
			var tokens3 = pathsToTokens.getByKey(path3);
			var normalizedPath3 = oFF.XStringBuffer.create();
			for (var tokenIndex3 = 0; tokenIndex3 < tokens3.size(); tokenIndex3++)
			{
				if (tokenIndex3 > 0)
				{
					normalizedPath3.append(".");
				}
				var token3 = tokens3.get(tokenIndex3);
				normalizedPath3.append(token3);
				var actualTokenChars3 = oFF.XString.size(token3);
				var maxTokenChars3 = tokenIndexMaxChars.get(tokenIndex3);
				for (var missingCharsIndex3 = 0; missingCharsIndex3 < maxTokenChars3 - actualTokenChars3; missingCharsIndex3++)
				{
					normalizedPath3.append(" ");
				}
			}
			normalizedPathsToPaths.put(normalizedPath3.toString(), path3);
		}
		var normalizedSortedPaths = oFF.XListOfString.createFromReadOnlyList(normalizedPathsToPaths.getKeysAsReadOnlyListOfString());
		normalizedSortedPaths.sortByDirection(oFF.XSortDirection.ASCENDING);
		var sortedPaths = oFF.XListOfString.create();
		for (var normalizedPathIndex = 0; normalizedPathIndex < normalizedSortedPaths.size(); normalizedPathIndex++)
		{
			var normalizedPath = normalizedSortedPaths.get(normalizedPathIndex);
			var path = normalizedPathsToPaths.getByKey(normalizedPath);
			sortedPaths.add(path);
		}
		return sortedPaths;
	},
	sortJsonPathElements:function(pathsToElements)
	{
			if (oFF.isNull(pathsToElements) || pathsToElements.size() < 1)
		{
			return null;
		}
		var sortedPaths = oFF.PrUtilsJsonPath.sortJsonPaths(pathsToElements.getKeysAsReadOnlyListOfString());
		var result = oFF.XList.create();
		for (var pathIndex = 0; pathIndex < sortedPaths.size(); pathIndex++)
		{
			var element = pathsToElements.getByKey(sortedPaths.get(pathIndex));
			result.add(element);
		}
		return result;
	},
	increaseJsonPath:function(existingJsonPath, newPathToken, index)
	{
			var sb = oFF.XStringBuffer.create();
		if (oFF.notNull(existingJsonPath))
		{
			sb.append(existingJsonPath);
		}
		if (oFF.notNull(newPathToken))
		{
			if (sb.length() > 0)
			{
				sb.append(".");
			}
			sb.append(newPathToken);
		}
		if (index > -1)
		{
			sb.append("[");
			sb.appendInt(index);
			sb.append("]");
		}
		if (sb.length() === 0)
		{
			return null;
		}
		return sb.toString();
	},
	addJsonPathElementsRecursive:function(currentJsonPath, element, existingResult, recursive)
	{
			var result = existingResult;
		var structure = oFF.PrUtils.asStructure(element);
		if (oFF.notNull(structure))
		{
			var propertyNames = structure.getKeysAsReadOnlyListOfString();
			if (oFF.notNull(propertyNames))
			{
				for (var structureIndex = 0; structureIndex < propertyNames.size(); structureIndex++)
				{
					var propertyName = propertyNames.get(structureIndex);
					var structureProperty = structure.getByKey(propertyName);
					if (oFF.isNull(structureProperty))
					{
						continue;
					}
					var jsonPathWithProperty = oFF.PrUtilsJsonPath.increaseJsonPath(currentJsonPath, propertyName, -1);
					result = oFF.PrUtilsJsonPath.addJsonPathElementToMap(jsonPathWithProperty, structureProperty, result);
					if (recursive)
					{
						result = oFF.PrUtilsJsonPath.addJsonPathElementsRecursive(jsonPathWithProperty, structureProperty, result, recursive);
					}
				}
			}
		}
		var list = oFF.PrUtils.asList(element);
		if (oFF.notNull(list))
		{
			for (var listIndex = 0; listIndex < oFF.PrUtils.getListSize(list, 0); listIndex++)
			{
				var listElement = oFF.PrUtils.getElement(list, listIndex);
				if (oFF.isNull(listElement))
				{
					continue;
				}
				var jsonPathWithElementIndex = oFF.PrUtilsJsonPath.increaseJsonPath(currentJsonPath, null, listIndex);
				result = oFF.PrUtilsJsonPath.addJsonPathElementToMap(jsonPathWithElementIndex, listElement, result);
				if (recursive)
				{
					result = oFF.PrUtilsJsonPath.addJsonPathElementsRecursive(jsonPathWithElementIndex, listElement, result, recursive);
				}
			}
		}
		return result;
	},
	getJsonPathElementsInternal:function(element, tokens, tokenIndex, existingResult, currentJsonPath)
	{
			var tokenSize = tokens.size();
		if (tokenSize <= tokenIndex)
		{
			return null;
		}
		var token = tokens.get(tokenIndex);
		var node;
		var indexOperators = oFF.PrUtilsJsonPath.getJsonPathIndexOperators(token);
		if (oFF.isNull(indexOperators))
		{
			node = token;
		}
		else
		{
			node = oFF.PrUtilsJsonPath.getJsonPathNode(token);
		}
		var navTargets = null;
		if (oFF.XString.isEqual(node, "$"))
		{
			navTargets = oFF.PrUtilsJsonPath.addJsonPathElementToMap(oFF.PrUtilsJsonPath.increaseJsonPath(currentJsonPath, "$", -1), element, navTargets);
		}
		else if (oFF.XString.isEqual(node, "*"))
		{
			navTargets = oFF.PrUtilsJsonPath.addJsonPathElementsRecursive(currentJsonPath, element, navTargets, false);
		}
		else if (oFF.XString.isEqual(node, ""))
		{
			navTargets = oFF.PrUtilsJsonPath.addJsonPathElementToMap(currentJsonPath, element, navTargets);
			navTargets = oFF.PrUtilsJsonPath.addJsonPathElementsRecursive(currentJsonPath, element, navTargets, true);
		}
		else
		{
			var structureProperty = oFF.PrUtils.getProperty(oFF.PrUtils.asStructure(element), node);
			if (oFF.notNull(structureProperty))
			{
				navTargets = oFF.PrUtilsJsonPath.addJsonPathElementToMap(oFF.PrUtilsJsonPath.increaseJsonPath(currentJsonPath, node, -1), structureProperty, navTargets);
			}
		}
		if (oFF.notNull(indexOperators))
		{
			navTargets = oFF.PrFilter.create().withLists().filterJsonPathElements(navTargets);
			if (oFF.notNull(navTargets))
			{
				var navTargetsResolved = null;
				var navTargetPaths = navTargets.getKeysAsReadOnlyListOfString();
				for (var navTargetIndex = 0; navTargetIndex < navTargetPaths.size(); navTargetIndex++)
				{
					var navTargetPath = navTargetPaths.get(navTargetIndex);
					var navTargetList = navTargets.getByKey(navTargetPath);
					navTargetsResolved = oFF.PrUtilsJsonPath.resolveJsonPathIndexOperators(navTargetPath, navTargetList, navTargetsResolved, indexOperators, 0);
				}
				navTargets = navTargetsResolved;
			}
		}
		var result = existingResult;
		if (oFF.notNull(navTargets) && navTargets.size() > 0)
		{
			var isFinalToken = tokenIndex + 1 === tokenSize;
			var navTargetJsonPaths = navTargets.getKeysAsReadOnlyListOfString();
			for (var navTargetIndex2 = 0; navTargetIndex2 < navTargetJsonPaths.size(); navTargetIndex2++)
			{
				var navTargetJsonPath = navTargetJsonPaths.get(navTargetIndex2);
				var navTargetElement = navTargets.getByKey(navTargetJsonPath);
				if (isFinalToken)
				{
					result = oFF.PrUtilsJsonPath.addJsonPathElementToMap(navTargetJsonPath, navTargetElement, result);
				}
				else
				{
					result = oFF.PrUtilsJsonPath.getJsonPathElementsInternal(navTargetElement, tokens, tokenIndex + 1, result, navTargetJsonPath);
				}
			}
		}
		return result;
	},
	resolveJsonPathIndexOperators:function(jsonPath, list, existingResults, indexOperators, operatorIndex)
	{
			if (oFF.isNull(list))
		{
			return existingResults;
		}
		if (oFF.isNull(indexOperators))
		{
			return existingResults;
		}
		if (operatorIndex < 0)
		{
			return existingResults;
		}
		var operatorSize = indexOperators.size();
		if (operatorIndex >= operatorSize)
		{
			return existingResults;
		}
		var indexOperator = indexOperators.get(operatorIndex);
		var operatorTokens = oFF.PrUtilsJsonPath.getJsonPathIndexOperatorTokens(indexOperator);
		if (oFF.isNull(operatorTokens))
		{
			return existingResults;
		}
		var navResults = null;
		for (var tokenIndex = 0; tokenIndex < operatorTokens.size(); tokenIndex++)
		{
			var operatorToken = operatorTokens.get(tokenIndex);
			if (oFF.XString.isEqual(operatorToken, "*"))
			{
				navResults = oFF.PrUtilsJsonPath.addJsonPathElementsRecursive(jsonPath, list, navResults, false);
			}
			else
			{
				var listSize = oFF.PrUtils.getListSize(list, 0);
				var operatorFirst = oFF.PrUtilsJsonPath.getJsonPathIndexOperatorFirst(operatorToken);
				if (operatorFirst > 0)
				{
					if (operatorFirst > listSize)
					{
						operatorFirst = listSize;
					}
					for (var firstIndex = 0; firstIndex < operatorFirst; firstIndex++)
					{
						navResults = oFF.PrUtilsJsonPath.addJsonPathElementToMap(oFF.PrUtilsJsonPath.increaseJsonPath(jsonPath, null, firstIndex), oFF.PrUtils.getElement(list, firstIndex), navResults);
					}
				}
				else
				{
					var operatorLast = oFF.PrUtilsJsonPath.getJsonPathIndexOperatorLast(operatorToken);
					if (operatorLast > 0)
					{
						if (operatorLast > listSize)
						{
							operatorLast = listSize;
						}
						var lastIncrement = listSize - operatorLast;
						for (var lastIndex = lastIncrement; lastIndex < operatorLast + lastIncrement; lastIndex++)
						{
							navResults = oFF.PrUtilsJsonPath.addJsonPathElementToMap(oFF.PrUtilsJsonPath.increaseJsonPath(jsonPath, null, lastIndex), oFF.PrUtils.getElement(list, lastIndex), navResults);
						}
					}
					else
					{
						var operatorNumber = oFF.PrUtilsJsonPath.getJsonPathIndexOperatorNumber(operatorToken);
						if (operatorNumber > -1)
						{
							navResults = oFF.PrUtilsJsonPath.addJsonPathElementToMap(oFF.PrUtilsJsonPath.increaseJsonPath(jsonPath, null, operatorNumber), oFF.PrUtils.getElement(list, operatorNumber), navResults);
						}
					}
				}
			}
		}
		var results = existingResults;
		var isFinalOperator = operatorIndex + 1 === operatorSize;
		if (!isFinalOperator)
		{
			navResults = oFF.PrFilter.create().withLists().filterJsonPathElements(navResults);
		}
		if (oFF.notNull(navResults))
		{
			var navResultPaths = navResults.getKeysAsReadOnlyListOfString();
			for (var navResultIndex = 0; navResultIndex < navResultPaths.size(); navResultIndex++)
			{
				var navResultPath = navResultPaths.get(navResultIndex);
				var navResultElement = navResults.getByKey(navResultPath);
				if (isFinalOperator)
				{
					results = oFF.PrUtilsJsonPath.addJsonPathElementToMap(navResultPath, navResultElement, results);
				}
				else
				{
					results = oFF.PrUtilsJsonPath.resolveJsonPathIndexOperators(navResultPath, oFF.PrUtils.asList(navResultElement), results, indexOperators, operatorIndex + 1);
				}
			}
		}
		return results;
	},
	getJsonPathIndexOperatorLast:function(indexOperator)
	{
			if (oFF.isNull(indexOperator))
		{
			return -1;
		}
		if (!oFF.XString.endsWith(indexOperator, ":"))
		{
			return -1;
		}
		var lastString = oFF.XStringUtils.stripRight(indexOperator, 1);
		var last = oFF.XInteger.convertFromStringWithDefault(lastString, 0);
		if (last > -1)
		{
			return -2;
		}
		return last * -1;
	},
	getJsonPathIndexOperatorFirst:function(indexOperator)
	{
			if (oFF.isNull(indexOperator))
		{
			return -1;
		}
		if (!oFF.XString.startsWith(indexOperator, ":"))
		{
			return -1;
		}
		var firstString = oFF.XString.substring(indexOperator, 1, oFF.XString.size(indexOperator));
		var first = oFF.XInteger.convertFromStringWithDefault(firstString, 0);
		if (first < 1)
		{
			return -2;
		}
		return first;
	},
	getJsonPathIndexOperatorNumber:function(indexOperator)
	{
			return oFF.XInteger.convertFromStringWithDefault(indexOperator, -1);
	},
	getJsonPathNode:function(token)
	{
			if (oFF.isNull(token))
		{
			return null;
		}
		if (!oFF.XString.endsWith(token, "]"))
		{
			return token;
		}
		var firstIndex = oFF.XString.indexOf(token, "[");
		if (firstIndex < 0)
		{
			return token;
		}
		return oFF.XString.substring(token, 0, firstIndex);
	},
	getJsonPathIndexOperators:function(token)
	{
			if (oFF.isNull(token))
		{
			return null;
		}
		if (!oFF.XString.endsWith(token, "]"))
		{
			return null;
		}
		var firstIndex = oFF.XString.indexOf(token, "[");
		if (firstIndex < 0)
		{
			return null;
		}
		var operators = oFF.XString.substring(token, firstIndex + 1, oFF.XString.size(token) - 1);
		return oFF.XStringTokenizer.splitString(operators, "][");
	},
	addJsonPathElementToMap:function(jsonPath, element, existingResult)
	{
			if (oFF.isNull(jsonPath))
		{
			return existingResult;
		}
		if (oFF.isNull(element))
		{
			return existingResult;
		}
		var result = existingResult;
		if (oFF.isNull(result))
		{
			result = oFF.XHashMapByString.create();
		}
		result.put(jsonPath, element);
		return result;
	}
};

oFF.ReplaceTagHandler = {

	charDot:46,
	handle:function(element, value)
	{
			var result = value;
		while (oFF.XString.containsString(result, "<<") || oFF.XString.containsString(result, ">>"))
		{
			result = oFF.ReplaceTagHandler.handleReplaceTags(element, result);
		}
		return result;
	},
	handleReplaceTags:function(element, value)
	{
			var buffer = oFF.XStringBuffer.create();
		var pieces = oFF.XStringTokenizer.splitString(value, "<<");
		var len = pieces.size();
		for (var i = 0; i < len; i++)
		{
			var piece = pieces.get(i);
			if (oFF.XStringUtils.isNullOrEmpty(piece))
			{
				continue;
			}
			var closeIndex = oFF.XString.indexOf(piece, ">>");
			if (closeIndex === -1)
			{
				buffer.append(piece);
				continue;
			}
			var tag = oFF.XString.substring(piece, 0, closeIndex);
			var replaceValue = oFF.ReplaceTagHandler.findTagValue(element, tag);
			if (oFF.isNull(replaceValue))
			{
				return null;
			}
			buffer.append(replaceValue);
			buffer.append(oFF.XString.substring(piece, closeIndex + 2, -1));
		}
		return buffer.toString();
	},
	findTagValue:function(startElement, tag)
	{
			var dots = 0;
		var tagLen = oFF.XString.size(tag);
		while (dots < tagLen && oFF.XString.getCharAt(tag, dots) === oFF.ReplaceTagHandler.charDot)
		{
			dots++;
		}
		var current = startElement;
		for (var j = 0; j < dots - 1; j++)
		{
			current = current.getParent();
			if (current.isList())
			{
				current = current.getParent();
			}
		}
		var tagName = oFF.XString.substring(tag, dots, -1);
		return oFF.PrUtils.convertElementToStringValue(current.asStructure().getByKey(tagName), null);
	}
};

oFF.TemplateWalker = {

	TEMPLATES:"templates",
	root:null,
	walk:function(root)
	{
			if (!root.containsKey(oFF.TemplateWalker.TEMPLATES))
		{
			return root;
		}
		var copy = oFF.PrUtils.deepCopyElement(root).asStructure();
		oFF.TemplateWalker.root = copy;
		oFF.TemplateWalker.walkStructure(copy);
		return copy;
	},
	walkStructure:function(parentStruct)
	{
			var elementNames = parentStruct.getKeysAsReadOnlyListOfString();
		var len = elementNames.size();
		for (var i = 0; i < len; i++)
		{
			var childName = elementNames.get(i);
			var childElement = parentStruct.getByKey(childName);
			if (oFF.isNull(childElement) || oFF.XString.isEqual(childName, oFF.TemplateWalker.TEMPLATES))
			{
				continue;
			}
			var childType = childElement.getType();
			if (childType === oFF.PrElementType.STRUCTURE)
			{
				var childStruct = childElement.asStructure();
				if (childStruct.containsKey("$ref"))
				{
					var templateStructure = oFF.PrTemplateStructure.createStructureWrapper(oFF.TemplateWalker.root, parentStruct, childStruct);
					parentStruct.put(childName, templateStructure);
				}
				else
				{
					oFF.TemplateWalker.walkStructure(childStruct);
				}
			}
			else if (childType === oFF.PrElementType.LIST)
			{
				oFF.TemplateWalker.walkList(childElement.asList());
			}
		}
	},
	walkList:function(parentList)
	{
			var len = parentList.size();
		for (var i = 0; i < len; i++)
		{
			var childElement = parentList.get(i);
			if (oFF.isNull(childElement))
			{
				continue;
			}
			var childType = childElement.getType();
			if (childType === oFF.PrElementType.STRUCTURE)
			{
				var childStruct = childElement.asStructure();
				if (childStruct.containsKey("$ref"))
				{
					var templateStructure = oFF.PrTemplateStructure.createStructureWrapper(oFF.TemplateWalker.root, parentList, childStruct);
					parentList.set(i, templateStructure);
				}
				else
				{
					oFF.TemplateWalker.walkStructure(childStruct);
				}
			}
			else if (childType === oFF.PrElementType.LIST)
			{
				oFF.TemplateWalker.walkList(childElement.asList());
			}
		}
	}
};

oFF.XmlDocumentSerializer = function() {};
oFF.XmlDocumentSerializer.prototype = new oFF.XObject();
oFF.XmlDocumentSerializer.prototype._ff_c = "XmlDocumentSerializer";

oFF.XmlDocumentSerializer.create = function()
{
	var object = new oFF.XmlDocumentSerializer();
	object.initialize(false, false, 0);
	return object;
};
oFF.XmlDocumentSerializer.createSort = function()
{
	var object = new oFF.XmlDocumentSerializer();
	object.initialize(true, false, 0);
	return object;
};
oFF.XmlDocumentSerializer.createPretty = function(indentation)
{
	var object = new oFF.XmlDocumentSerializer();
	object.initialize(false, true, indentation);
	return object;
};
oFF.XmlDocumentSerializer.createSortPretty = function(indentation)
{
	var object = new oFF.XmlDocumentSerializer();
	object.initialize(true, true, indentation);
	return object;
};
oFF.XmlDocumentSerializer.prototype.m_prettyPrint = false;
oFF.XmlDocumentSerializer.prototype.m_indentation = 0;
oFF.XmlDocumentSerializer.prototype.m_sortStructureElements = false;
oFF.XmlDocumentSerializer.prototype.m_buffer = null;
oFF.XmlDocumentSerializer.prototype.isPrettyPrint = function()
{
	return this.m_prettyPrint;
};
oFF.XmlDocumentSerializer.prototype.setPrettyPrint = function(prettyPrint)
{
	this.m_prettyPrint = prettyPrint;
};
oFF.XmlDocumentSerializer.prototype.getIndentation = function()
{
	return this.m_indentation;
};
oFF.XmlDocumentSerializer.prototype.setIndentation = function(indentation)
{
	this.m_indentation = indentation;
};
oFF.XmlDocumentSerializer.prototype.isSortStructureElements = function()
{
	return this.m_sortStructureElements;
};
oFF.XmlDocumentSerializer.prototype.setSortStructureElements = function(sortStructureElements)
{
	this.m_sortStructureElements = sortStructureElements;
};
oFF.XmlDocumentSerializer.prototype.getBuffer = function()
{
	return this.m_buffer;
};
oFF.XmlDocumentSerializer.prototype.setBuffer = function(buffer)
{
	this.m_buffer = buffer;
};
oFF.XmlDocumentSerializer.prototype.initialize = function(sortStructureElements, prettyPrint, indentation)
{
	this.setBuffer(oFF.XStringBuffer.create());
	this.setSortStructureElements(sortStructureElements);
	this.setPrettyPrint(prettyPrint);
	this.setIndentation(indentation);
};
oFF.XmlDocumentSerializer.prototype.serialize = function(element)
{
	this.getBuffer().clear();
	if (!element.isStructure())
	{
		throw oFF.XException.createIllegalArgumentException("INVALID ROOT ELEMENT: Must be Structure");
	}
	var structure = element.asStructure();
	var elementNames = structure.getKeysAsReadOnlyListOfString();
	if (oFF.isNull(elementNames))
	{
		throw oFF.XException.createIllegalArgumentException("INVALID ROOT ELEMENT: Must be Structure");
	}
	var prologDirectives = oFF.XStream.ofString(elementNames).filter( function(spr){
		return oFF.XString.startsWith(spr.getString(), "?");
	}.bind(this)).collect(oFF.XStreamCollector.toListOfString( function(ipem){
		return ipem.getString();
	}.bind(this)));
	var documentElementNames = oFF.XStream.ofString(elementNames).filter( function(str){
		return !oFF.XString.startsWith(str.getString(), "?");
	}.bind(this)).collect(oFF.XStreamCollector.toListOfString( function(item){
		return item.getString();
	}.bind(this)));
	var structureSize = documentElementNames.size();
	if (structureSize !== 1)
	{
		throw oFF.XException.createIllegalArgumentException("INVALID ROOT ELEMENT: Must be at most one root element");
	}
	for (var i = 0; i < prologDirectives.size(); i++)
	{
		var prologDirectiveName = prologDirectives.get(i);
		this.appendPrologElement(structure.getStructureByKey(prologDirectiveName), prologDirectiveName);
	}
	var structureElementName = documentElementNames.get(0);
	var structureElement = structure.getByKey(structureElementName);
	if (structureElement.isStructure())
	{
		this.appendStructure(structureElement, structureElementName, 0);
	}
	else
	{
		throw oFF.XException.createIllegalArgumentException("INVALID ROOT ELEMENT: Must be Structure");
	}
	return this.getBuffer().toString();
};
oFF.XmlDocumentSerializer.prototype.appendPrologElement = function(prologDirective, prologDirectiveName)
{
	if (oFF.notNull(prologDirective))
	{
		this.getBuffer().append("<").append(prologDirectiveName);
		var prologAttributeNames = prologDirective.getKeysAsReadOnlyListOfString();
		for (var i = 0; i < prologAttributeNames.size(); i++)
		{
			var prologAttributeName = prologAttributeNames.get(i);
			var prologElement = prologDirective.getByKey(prologAttributeName);
			if (oFF.XString.startsWith(prologAttributeName, "-") && (prologElement.isString() || prologElement.isDouble() || prologElement.isBoolean() || prologElement.isNumeric() || prologElement.getType() === oFF.PrElementType.THE_NULL))
			{
				this.appendAttribute(prologElement, oFF.XString.substring(prologAttributeName, 1, oFF.XString.size(prologAttributeName)));
			}
			else
			{
				throw oFF.XException.createIllegalArgumentException("INVALID PROLOG RULE");
			}
		}
		this.getBuffer().append("?>");
	}
	else
	{
		throw oFF.XException.createIllegalArgumentException("INVALID PROLOG RULE");
	}
};
oFF.XmlDocumentSerializer.prototype.appendIndentationString = function(indentationLevel)
{
	if (this.getIndentation() >= 1 && indentationLevel >= 1)
	{
		var spaces = this.getIndentation() * indentationLevel;
		for (var i = 0; i < spaces; i++)
		{
			this.getBuffer().append(" ");
		}
	}
};
oFF.XmlDocumentSerializer.prototype.appendAttribute = function(element, elementName)
{
	this.getBuffer().append(" ");
	if (oFF.isNull(elementName))
	{
		this.getBuffer().append("null");
	}
	else
	{
		this.getBuffer().append(elementName);
	}
	this.getBuffer().append("=\"");
	this.appendTextContent(element, oFF.XmlUtils.ATTRIBUTE_ESCAPE);
	this.getBuffer().append("\"");
};
oFF.XmlDocumentSerializer.prototype.appendElement = function(element, elementName, indentationLevel)
{
	if (this.isPrettyPrint())
	{
		this.appendIndentationString(indentationLevel);
	}
	if (oFF.isNull(element))
	{
		this.getBuffer().append("null");
	}
	else
	{
		if (element.isStructure())
		{
			this.appendStructure(element, elementName, indentationLevel);
		}
		else if (element.isList())
		{
			this.appendList(element, elementName, indentationLevel);
		}
		else
		{
			if (this.isPrettyPrint())
			{
				this.getBuffer().appendNewLine();
				this.appendIndentationString(indentationLevel);
			}
			this.appendTextContent(element, oFF.XmlUtils.TEXT_NODE_ESCAPE);
		}
	}
};
oFF.XmlDocumentSerializer.prototype.appendStructure = function(element, elementName, indentationLevel)
{
	var i;
	var structureElementName;
	var structureElement;
	if (this.isPrettyPrint())
	{
		this.getBuffer().appendNewLine();
		this.appendIndentationString(indentationLevel);
	}
	this.getBuffer().append("<");
	this.getBuffer().append(elementName);
	if (element.isString() || element.isDouble() || element.isBoolean() || element.isNumeric() || element.getType() === oFF.PrElementType.THE_NULL)
	{
		this.getBuffer().append(">");
		if (this.isPrettyPrint())
		{
			this.getBuffer().appendNewLine();
			this.appendIndentationString(indentationLevel + 1);
		}
		this.appendTextContent(element, oFF.XmlUtils.TEXT_NODE_ESCAPE);
		if (this.isPrettyPrint())
		{
			this.getBuffer().appendNewLine();
			this.appendIndentationString(indentationLevel);
		}
		this.getBuffer().append("</");
		this.getBuffer().append(elementName);
		this.getBuffer().append(">");
		return;
	}
	var structure = element.asStructure();
	var structureElementNames = oFF.XListOfString.createFromReadOnlyList(structure.getKeysAsReadOnlyListOfString());
	var emptyTag = true;
	if (oFF.notNull(structureElementNames))
	{
		var structureSize = structureElementNames.size();
		if (this.isSortStructureElements() && structureSize > 1)
		{
			structureElementNames.sortByDirection(oFF.XSortDirection.ASCENDING);
		}
		for (i = 0; i < structureSize; i++)
		{
			structureElementName = structureElementNames.get(i);
			structureElement = structure.getByKey(structureElementName);
			if (oFF.XString.startsWith(structureElementName, "-") && (structureElement.isString() || structureElement.isDouble() || structureElement.isBoolean() || structureElement.isNumeric() || structureElement.getType() === oFF.PrElementType.THE_NULL))
			{
				this.appendAttribute(structureElement, oFF.XString.substring(structureElementName, 1, oFF.XString.size(structureElementName)));
			}
			else
			{
				emptyTag = false;
			}
		}
		if (emptyTag)
		{
			this.getBuffer().append("/");
		}
		this.getBuffer().append(">");
		for (i = 0; i < structureSize; i++)
		{
			structureElementName = structureElementNames.get(i);
			structureElement = structure.getByKey(structureElementName);
			if (oFF.XString.startsWith(structureElementName, "-") && (structureElement.isString() || structureElement.isDouble() || structureElement.isBoolean() || structureElement.isNumeric() || structureElement.getType() === oFF.PrElementType.THE_NULL))
			{
				continue;
			}
			this.appendElement(structureElement, structureElementName, indentationLevel + 1);
		}
	}
	else
	{
		this.getBuffer().append("/");
		this.getBuffer().append(">");
	}
	if (!emptyTag)
	{
		if (this.isPrettyPrint())
		{
			this.getBuffer().appendNewLine();
			this.appendIndentationString(indentationLevel);
		}
		this.getBuffer().append("</");
		this.getBuffer().append(elementName);
		this.getBuffer().append(">");
	}
};
oFF.XmlDocumentSerializer.prototype.appendTextContent = function(element, ESCAPE_LEVEL)
{
	if (element.isString())
	{
		var stringValue = element.asString().getString();
		if (oFF.isNull(stringValue))
		{
			this.getBuffer().append("null");
		}
		else
		{
			this.getBuffer().append(oFF.XmlUtils.escapeXml(oFF.XmlUtils.unescapeJson(stringValue), ESCAPE_LEVEL));
		}
	}
	else if (element.isDouble())
	{
		this.getBuffer().appendDouble(element.asNumber().getDouble());
	}
	else if (element.isNumeric())
	{
		this.getBuffer().appendLong(element.asNumber().getLong());
	}
	else if (element.isBoolean())
	{
		if (element.asBoolean().getBoolean())
		{
			this.getBuffer().append("true");
		}
		else
		{
			this.getBuffer().append("false");
		}
	}
	else if (element.getType() === oFF.PrElementType.THE_NULL)
	{
		this.getBuffer().append("null");
	}
};
oFF.XmlDocumentSerializer.prototype.appendList = function(element, elementName, indentationLevel)
{
	var list = element.asList();
	var size = list.size();
	for (var i = 0; i < size; i++)
	{
		this.appendStructure(list.get(i), elementName, indentationLevel);
	}
};

oFF.XmlDomPrUtil = {

	createDocument:function()
	{
			return oFF.PrFactory.createStructure();
	},
	appendChildElementWithTextContent:function(baseElement, elementName, textNodeContent)
	{
			var baseElementType = baseElement.getElementTypeByKey(elementName);
		var newStructure = null;
		if (baseElementType === oFF.PrElementType.THE_NULL)
		{
			newStructure = baseElement.putNewStructure(elementName);
		}
		else if (baseElementType === oFF.PrElementType.LIST)
		{
			newStructure = baseElement.getListByKey(elementName).addNewStructure();
		}
		else if (baseElementType === oFF.PrElementType.STRUCTURE)
		{
			var existingElement = baseElement.getStructureByKey(elementName);
			var newList = baseElement.putNewList(elementName);
			newList.add(existingElement);
			newStructure = newList.addNewStructure();
		}
		if (oFF.isNull(newStructure))
		{
			throw oFF.XException.createIllegalStateException("Cannot mix element children types");
		}
		else if (oFF.notNull(textNodeContent))
		{
			newStructure.putString(elementName, textNodeContent);
		}
		return newStructure;
	},
	appendChildElement:function(baseElement, elementName)
	{
			return oFF.XmlDomPrUtil.appendChildElementWithTextContent(baseElement, elementName, null);
	},
	appendPrologElement:function(baseElement, elementName)
	{
			return baseElement.putNewStructure(oFF.XStringUtils.concatenate2("?", elementName));
	},
	setAttribute:function(baseElement, attributeName, attributeValue)
	{
			baseElement.putString(oFF.XStringUtils.concatenate2("-", attributeName), attributeValue);
		return baseElement;
	},
	getAttribute:function(baseElement, attributeName)
	{
			return baseElement.getStringByKey(oFF.XStringUtils.concatenate2("-", attributeName));
	}
};

oFF.XmlUtils = {

	QUOT_CHAR:"\"",
	AMP_CHAR:"&",
	APOS_CHAR:"'",
	LT_CHAR:"<",
	GT_CHAR:">",
	QUOT_ENTITY:"&quot;",
	AMP_ENTITY:"&amp;",
	APOS_ENTITY:"&apos;",
	LT_ENTITY:"&lt;",
	GT_ENTITY:"&gt;",
	entityMappings:null,
	extendedEntityMappings:null,
	MUST_NOT_ESCAPE:0,
	TEXT_NODE_ESCAPE:1,
	ATTRIBUTE_ESCAPE:2,
	FULL_ESCAPE:3,
	staticSetup:function()
	{
			oFF.XmlUtils.entityMappings = oFF.XHashMapOfStringByString.create();
		oFF.XmlUtils.extendedEntityMappings = oFF.XHashMapOfStringByString.create();
		oFF.XmlUtils.entityMappings.put("&quot;", "\"");
		oFF.XmlUtils.entityMappings.put("&apos;", "'");
		oFF.XmlUtils.entityMappings.put("&amp;", "&");
		oFF.XmlUtils.entityMappings.put("&lt;", "<");
		oFF.XmlUtils.entityMappings.put("&gt;", ">");
		oFF.XmlUtils.extendedEntityMappings.put("&Acirc;", "\u00C2");
		oFF.XmlUtils.extendedEntityMappings.put("&acirc;", "\u00E2");
		oFF.XmlUtils.extendedEntityMappings.put("&acute;", "\u00B4");
		oFF.XmlUtils.extendedEntityMappings.put("&AElig;", "\u00C6");
		oFF.XmlUtils.extendedEntityMappings.put("&aelig;", "\u00E6");
		oFF.XmlUtils.extendedEntityMappings.put("&Agrave;", "\u00C0");
		oFF.XmlUtils.extendedEntityMappings.put("&agrave;", "\u00E0");
		oFF.XmlUtils.extendedEntityMappings.put("&alefsym;", "\u2135");
		oFF.XmlUtils.extendedEntityMappings.put("&Alpha;", "\u0391");
		oFF.XmlUtils.extendedEntityMappings.put("&alpha;", "\u03B1");
		oFF.XmlUtils.extendedEntityMappings.put("&amp;", "&");
		oFF.XmlUtils.extendedEntityMappings.put("&and;", "\u2227");
		oFF.XmlUtils.extendedEntityMappings.put("&ang;", "\u2220");
		oFF.XmlUtils.extendedEntityMappings.put("&apos;", "'");
		oFF.XmlUtils.extendedEntityMappings.put("&Aring;", "\u00C5");
		oFF.XmlUtils.extendedEntityMappings.put("&aring;", "\u00E5");
		oFF.XmlUtils.extendedEntityMappings.put("&asymp;", "\u2248");
		oFF.XmlUtils.extendedEntityMappings.put("&Atilde;", "\u00C3");
		oFF.XmlUtils.extendedEntityMappings.put("&atilde;", "\u00E3");
		oFF.XmlUtils.extendedEntityMappings.put("&Auml;", "\u00C4");
		oFF.XmlUtils.extendedEntityMappings.put("&auml;", "\u00E4");
		oFF.XmlUtils.extendedEntityMappings.put("&bdquo;", "\u201E");
		oFF.XmlUtils.extendedEntityMappings.put("&Beta;", "\u0392");
		oFF.XmlUtils.extendedEntityMappings.put("&beta;", "\u03B2");
		oFF.XmlUtils.extendedEntityMappings.put("&brvbar;", "\u00A6");
		oFF.XmlUtils.extendedEntityMappings.put("&bull;", "\u2022");
		oFF.XmlUtils.extendedEntityMappings.put("&cap;", "\u2229");
		oFF.XmlUtils.extendedEntityMappings.put("&Ccedil;", "\u00C7");
		oFF.XmlUtils.extendedEntityMappings.put("&ccedil;", "\u00E7");
		oFF.XmlUtils.extendedEntityMappings.put("&cedil;", "\u00B8");
		oFF.XmlUtils.extendedEntityMappings.put("&cent;", "\u00A2");
		oFF.XmlUtils.extendedEntityMappings.put("&Chi;", "\u03A7");
		oFF.XmlUtils.extendedEntityMappings.put("&chi;", "\u03C7");
		oFF.XmlUtils.extendedEntityMappings.put("&circ;", "\u02C6");
		oFF.XmlUtils.extendedEntityMappings.put("&clubs;", "\u2663");
		oFF.XmlUtils.extendedEntityMappings.put("&cong;", "\u2245");
		oFF.XmlUtils.extendedEntityMappings.put("&copy;", "\u00A9");
		oFF.XmlUtils.extendedEntityMappings.put("&crarr;", "\u21B5");
		oFF.XmlUtils.extendedEntityMappings.put("&cup;", "\u222A");
		oFF.XmlUtils.extendedEntityMappings.put("&curren;", "\u00A4");
		oFF.XmlUtils.extendedEntityMappings.put("&Dagger;", "\u2021");
		oFF.XmlUtils.extendedEntityMappings.put("&dagger;", "\u2020");
		oFF.XmlUtils.extendedEntityMappings.put("&dArr;", "\u21D3");
		oFF.XmlUtils.extendedEntityMappings.put("&darr;", "\u2193");
		oFF.XmlUtils.extendedEntityMappings.put("&deg;", "\u00B0");
		oFF.XmlUtils.extendedEntityMappings.put("&Delta;", "\u0394");
		oFF.XmlUtils.extendedEntityMappings.put("&delta;", "\u03B4");
		oFF.XmlUtils.extendedEntityMappings.put("&diams;", "\u2666");
		oFF.XmlUtils.extendedEntityMappings.put("&divide;", "\u00F7");
		oFF.XmlUtils.extendedEntityMappings.put("&Eacute;", "\u00C9");
		oFF.XmlUtils.extendedEntityMappings.put("&eacute;", "\u00E9");
		oFF.XmlUtils.extendedEntityMappings.put("&Ecirc;", "\u00CA");
		oFF.XmlUtils.extendedEntityMappings.put("&ecirc;", "\u00EA");
		oFF.XmlUtils.extendedEntityMappings.put("&Egrave;", "\u00C8");
		oFF.XmlUtils.extendedEntityMappings.put("&egrave;", "\u00E8");
		oFF.XmlUtils.extendedEntityMappings.put("&empty;", "\u2205");
		oFF.XmlUtils.extendedEntityMappings.put("&emsp;", "\u2003");
		oFF.XmlUtils.extendedEntityMappings.put("&ensp;", "\u2002");
		oFF.XmlUtils.extendedEntityMappings.put("&Epsilon;", "\u0395");
		oFF.XmlUtils.extendedEntityMappings.put("&epsilon;", "\u03B5");
		oFF.XmlUtils.extendedEntityMappings.put("&equiv;", "\u2261");
		oFF.XmlUtils.extendedEntityMappings.put("&Eta;", "\u0397");
		oFF.XmlUtils.extendedEntityMappings.put("&eta;", "\u03B7");
		oFF.XmlUtils.extendedEntityMappings.put("&ETH;", "\u00D0");
		oFF.XmlUtils.extendedEntityMappings.put("&eth;", "\u00F0");
		oFF.XmlUtils.extendedEntityMappings.put("&Euml;", "\u00CB");
		oFF.XmlUtils.extendedEntityMappings.put("&euml;", "\u00EB");
		oFF.XmlUtils.extendedEntityMappings.put("&euro;", "\u20AC");
		oFF.XmlUtils.extendedEntityMappings.put("&exist;", "\u2203");
		oFF.XmlUtils.extendedEntityMappings.put("&fnof;", "\u0192");
		oFF.XmlUtils.extendedEntityMappings.put("&forall;", "\u2200");
		oFF.XmlUtils.extendedEntityMappings.put("&frac12;", "\u00BD");
		oFF.XmlUtils.extendedEntityMappings.put("&frac14;", "\u00BC");
		oFF.XmlUtils.extendedEntityMappings.put("&frac34;", "\u00BE");
		oFF.XmlUtils.extendedEntityMappings.put("&frasl;", "\u2044");
		oFF.XmlUtils.extendedEntityMappings.put("&Gamma;", "\u0393");
		oFF.XmlUtils.extendedEntityMappings.put("&gamma;", "\u03B3");
		oFF.XmlUtils.extendedEntityMappings.put("&ge;", "\u2265");
		oFF.XmlUtils.extendedEntityMappings.put("&gt;", ">");
		oFF.XmlUtils.extendedEntityMappings.put("&hArr;", "\u21D4");
		oFF.XmlUtils.extendedEntityMappings.put("&harr;", "\u2194");
		oFF.XmlUtils.extendedEntityMappings.put("&hearts;", "\u2665");
		oFF.XmlUtils.extendedEntityMappings.put("&hellip;", "\u2026");
		oFF.XmlUtils.extendedEntityMappings.put("&Iacute;", "\u00CD");
		oFF.XmlUtils.extendedEntityMappings.put("&iacute;", "\u00ED");
		oFF.XmlUtils.extendedEntityMappings.put("&Icirc;", "\u00CE");
		oFF.XmlUtils.extendedEntityMappings.put("&icirc;", "\u00EE");
		oFF.XmlUtils.extendedEntityMappings.put("&iexcl;", "\u00A1");
		oFF.XmlUtils.extendedEntityMappings.put("&Igrave;", "\u00CC");
		oFF.XmlUtils.extendedEntityMappings.put("&igrave;", "\u00EC");
		oFF.XmlUtils.extendedEntityMappings.put("&image;", "\u2111");
		oFF.XmlUtils.extendedEntityMappings.put("&infin;", "\u221E");
		oFF.XmlUtils.extendedEntityMappings.put("&int;", "\u222B");
		oFF.XmlUtils.extendedEntityMappings.put("&Iota;", "\u0399");
		oFF.XmlUtils.extendedEntityMappings.put("&iota;", "\u03B9");
		oFF.XmlUtils.extendedEntityMappings.put("&iquest;", "\u00BF");
		oFF.XmlUtils.extendedEntityMappings.put("&isin;", "\u2208");
		oFF.XmlUtils.extendedEntityMappings.put("&Iuml;", "\u00CF");
		oFF.XmlUtils.extendedEntityMappings.put("&iuml;", "\u00EF");
		oFF.XmlUtils.extendedEntityMappings.put("&Kappa;", "\u039A");
		oFF.XmlUtils.extendedEntityMappings.put("&kappa;", "\u03BA");
		oFF.XmlUtils.extendedEntityMappings.put("&Lambda;", "\u039B");
		oFF.XmlUtils.extendedEntityMappings.put("&lambda;", "\u03BB");
		oFF.XmlUtils.extendedEntityMappings.put("&lang;", "\u27E8");
		oFF.XmlUtils.extendedEntityMappings.put("&laquo;", "\u00AB");
		oFF.XmlUtils.extendedEntityMappings.put("&lArr;", "\u21D0");
		oFF.XmlUtils.extendedEntityMappings.put("&larr;", "\u2190");
		oFF.XmlUtils.extendedEntityMappings.put("&lceil;", "\u2308");
		oFF.XmlUtils.extendedEntityMappings.put("&ldquo;", "\u201C");
		oFF.XmlUtils.extendedEntityMappings.put("&le;", "\u2264");
		oFF.XmlUtils.extendedEntityMappings.put("&lfloor;", "\u230A");
		oFF.XmlUtils.extendedEntityMappings.put("&lowast;", "\u2217");
		oFF.XmlUtils.extendedEntityMappings.put("&loz;", "\u25CA");
		oFF.XmlUtils.extendedEntityMappings.put("&lsaquo;", "\u2039");
		oFF.XmlUtils.extendedEntityMappings.put("&lsquo;", "\u2018");
		oFF.XmlUtils.extendedEntityMappings.put("&lt;", "<");
		oFF.XmlUtils.extendedEntityMappings.put("&macr;", "\u00AF");
		oFF.XmlUtils.extendedEntityMappings.put("&mdash;", "\u2014");
		oFF.XmlUtils.extendedEntityMappings.put("&micro;", "\u00B5");
		oFF.XmlUtils.extendedEntityMappings.put("&middot;", "\u00B7");
		oFF.XmlUtils.extendedEntityMappings.put("&minus;", "\u2212");
		oFF.XmlUtils.extendedEntityMappings.put("&Mu;", "\u039C");
		oFF.XmlUtils.extendedEntityMappings.put("&mu;", "\u03BC");
		oFF.XmlUtils.extendedEntityMappings.put("&nabla;", "\u2207");
		oFF.XmlUtils.extendedEntityMappings.put("&nbsp;", " ");
		oFF.XmlUtils.extendedEntityMappings.put("&ndash;", "\u2013");
		oFF.XmlUtils.extendedEntityMappings.put("&ne;", "\u2260");
		oFF.XmlUtils.extendedEntityMappings.put("&ni;", "\u220B");
		oFF.XmlUtils.extendedEntityMappings.put("&not;", "\u00AC");
		oFF.XmlUtils.extendedEntityMappings.put("&notin;", "\u2209");
		oFF.XmlUtils.extendedEntityMappings.put("&nsub;", "\u2284");
		oFF.XmlUtils.extendedEntityMappings.put("&Ntilde;", "\u00D1");
		oFF.XmlUtils.extendedEntityMappings.put("&ntilde;", "\u00F1");
		oFF.XmlUtils.extendedEntityMappings.put("&Nu;", "\u039D");
		oFF.XmlUtils.extendedEntityMappings.put("&nu;", "\u03BD");
		oFF.XmlUtils.extendedEntityMappings.put("&Oacute;", "\u00D3");
		oFF.XmlUtils.extendedEntityMappings.put("&oacute;", "\u00F3");
		oFF.XmlUtils.extendedEntityMappings.put("&Ocirc;", "\u00D4");
		oFF.XmlUtils.extendedEntityMappings.put("&ocirc;", "\u00F4");
		oFF.XmlUtils.extendedEntityMappings.put("&OElig;", "\u0152");
		oFF.XmlUtils.extendedEntityMappings.put("&oelig;", "\u0153");
		oFF.XmlUtils.extendedEntityMappings.put("&Ograve;", "\u00D2");
		oFF.XmlUtils.extendedEntityMappings.put("&ograve;", "\u00F2");
		oFF.XmlUtils.extendedEntityMappings.put("&oline;", "\u203E");
		oFF.XmlUtils.extendedEntityMappings.put("&Omega;", "\u03A9");
		oFF.XmlUtils.extendedEntityMappings.put("&omega;", "\u03C9");
		oFF.XmlUtils.extendedEntityMappings.put("&Omicron;", "\u039F");
		oFF.XmlUtils.extendedEntityMappings.put("&omicron;", "\u03BF");
		oFF.XmlUtils.extendedEntityMappings.put("&oplus;", "\u2295");
		oFF.XmlUtils.extendedEntityMappings.put("&or;", "\u2228");
		oFF.XmlUtils.extendedEntityMappings.put("&ordf;", "\u00AA");
		oFF.XmlUtils.extendedEntityMappings.put("&ordm;", "\u00BA");
		oFF.XmlUtils.extendedEntityMappings.put("&Oslash;", "\u00D8");
		oFF.XmlUtils.extendedEntityMappings.put("&oslash;", "\u00F8");
		oFF.XmlUtils.extendedEntityMappings.put("&Otilde;", "\u00D5");
		oFF.XmlUtils.extendedEntityMappings.put("&otilde;", "\u00F5");
		oFF.XmlUtils.extendedEntityMappings.put("&otimes;", "\u2297");
		oFF.XmlUtils.extendedEntityMappings.put("&Ouml;", "\u00D6");
		oFF.XmlUtils.extendedEntityMappings.put("&ouml;", "\u00F6");
		oFF.XmlUtils.extendedEntityMappings.put("&para;", "\u00B6");
		oFF.XmlUtils.extendedEntityMappings.put("&part;", "\u2202");
		oFF.XmlUtils.extendedEntityMappings.put("&permil;", "\u2030");
		oFF.XmlUtils.extendedEntityMappings.put("&perp;", "\u22A5");
		oFF.XmlUtils.extendedEntityMappings.put("&Phi;", "\u03A6");
		oFF.XmlUtils.extendedEntityMappings.put("&phi;", "\u03C6");
		oFF.XmlUtils.extendedEntityMappings.put("&Pi;", "\u03A0");
		oFF.XmlUtils.extendedEntityMappings.put("&pi;", "\u03C0");
		oFF.XmlUtils.extendedEntityMappings.put("&piv;", "\u03D6");
		oFF.XmlUtils.extendedEntityMappings.put("&plusmn;", "\u00B1");
		oFF.XmlUtils.extendedEntityMappings.put("&pound;", "\u00A3");
		oFF.XmlUtils.extendedEntityMappings.put("&Prime;", "\u2033");
		oFF.XmlUtils.extendedEntityMappings.put("&prime;", "\u2032");
		oFF.XmlUtils.extendedEntityMappings.put("&prod;", "\u220F");
		oFF.XmlUtils.extendedEntityMappings.put("&prop;", "\u221D");
		oFF.XmlUtils.extendedEntityMappings.put("&Psi;", "\u03A8");
		oFF.XmlUtils.extendedEntityMappings.put("&psi;", "\u03C8");
		oFF.XmlUtils.extendedEntityMappings.put("&quot;", "\"");
		oFF.XmlUtils.extendedEntityMappings.put("&radic;", "\u221A");
		oFF.XmlUtils.extendedEntityMappings.put("&rang;", "\u27E9");
		oFF.XmlUtils.extendedEntityMappings.put("&raquo;", "\u00BB");
		oFF.XmlUtils.extendedEntityMappings.put("&rArr;", "\u21D2");
		oFF.XmlUtils.extendedEntityMappings.put("&rarr;", "\u2192");
		oFF.XmlUtils.extendedEntityMappings.put("&rceil;", "\u2309");
		oFF.XmlUtils.extendedEntityMappings.put("&rdquo;", "\u201D");
		oFF.XmlUtils.extendedEntityMappings.put("&real;", "\u211C");
		oFF.XmlUtils.extendedEntityMappings.put("&reg;", "\u00AE");
		oFF.XmlUtils.extendedEntityMappings.put("&rfloor;", "\u230B");
		oFF.XmlUtils.extendedEntityMappings.put("&Rho;", "\u03A1");
		oFF.XmlUtils.extendedEntityMappings.put("&rho;", "\u03C1");
		oFF.XmlUtils.extendedEntityMappings.put("&rsaquo;", "\u203A");
		oFF.XmlUtils.extendedEntityMappings.put("&rsquo;", "\u2019");
		oFF.XmlUtils.extendedEntityMappings.put("&sbquo;", "\u201A");
		oFF.XmlUtils.extendedEntityMappings.put("&Scaron;", "\u0160");
		oFF.XmlUtils.extendedEntityMappings.put("&scaron;", "\u0161");
		oFF.XmlUtils.extendedEntityMappings.put("&sdot;", "\u22C5");
		oFF.XmlUtils.extendedEntityMappings.put("&sect;", "\u00A7");
		oFF.XmlUtils.extendedEntityMappings.put("&Sigma;", "\u03A3");
		oFF.XmlUtils.extendedEntityMappings.put("&sigma;", "\u03C3");
		oFF.XmlUtils.extendedEntityMappings.put("&sigmaf;", "\u03C2");
		oFF.XmlUtils.extendedEntityMappings.put("&sim;", "\u223C");
		oFF.XmlUtils.extendedEntityMappings.put("&spades;", "\u2660");
		oFF.XmlUtils.extendedEntityMappings.put("&sub;", "\u2282");
		oFF.XmlUtils.extendedEntityMappings.put("&sube;", "\u2286");
		oFF.XmlUtils.extendedEntityMappings.put("&sum;", "\u2211");
		oFF.XmlUtils.extendedEntityMappings.put("&sup;", "\u2283");
		oFF.XmlUtils.extendedEntityMappings.put("&sup1;", "\u00B9");
		oFF.XmlUtils.extendedEntityMappings.put("&sup2;", "\u00B2");
		oFF.XmlUtils.extendedEntityMappings.put("&sup3;", "\u00B3");
		oFF.XmlUtils.extendedEntityMappings.put("&supe;", "\u2287");
		oFF.XmlUtils.extendedEntityMappings.put("&szlig;", "\u00DF");
		oFF.XmlUtils.extendedEntityMappings.put("&Tau;", "\u03A4");
		oFF.XmlUtils.extendedEntityMappings.put("&tau;", "\u03C4");
		oFF.XmlUtils.extendedEntityMappings.put("&there4;", "\u2234");
		oFF.XmlUtils.extendedEntityMappings.put("&Theta;", "\u0398");
		oFF.XmlUtils.extendedEntityMappings.put("&theta;", "\u03B8");
		oFF.XmlUtils.extendedEntityMappings.put("&thetasym;", "\u03D1");
		oFF.XmlUtils.extendedEntityMappings.put("&thinsp;", "\u2009");
		oFF.XmlUtils.extendedEntityMappings.put("&THORN;", "\u00DE");
		oFF.XmlUtils.extendedEntityMappings.put("&thorn;", "\u00FE");
		oFF.XmlUtils.extendedEntityMappings.put("&tilde;", "\u02DC");
		oFF.XmlUtils.extendedEntityMappings.put("&times;", "\u00D7");
		oFF.XmlUtils.extendedEntityMappings.put("&trade;", "\u2122");
		oFF.XmlUtils.extendedEntityMappings.put("&Uacute;", "\u00DA");
		oFF.XmlUtils.extendedEntityMappings.put("&uacute;", "\u00FA");
		oFF.XmlUtils.extendedEntityMappings.put("&uArr;", "\u21D1");
		oFF.XmlUtils.extendedEntityMappings.put("&uarr;", "\u2191");
		oFF.XmlUtils.extendedEntityMappings.put("&Ucirc;", "\u00DB");
		oFF.XmlUtils.extendedEntityMappings.put("&ucirc;", "\u00FB");
		oFF.XmlUtils.extendedEntityMappings.put("&Ugrave;", "\u00D9");
		oFF.XmlUtils.extendedEntityMappings.put("&ugrave;", "\u00F9");
		oFF.XmlUtils.extendedEntityMappings.put("&uml;", "\u00A8");
		oFF.XmlUtils.extendedEntityMappings.put("&upsih;", "\u03D2");
		oFF.XmlUtils.extendedEntityMappings.put("&Upsilon;", "\u03A5");
		oFF.XmlUtils.extendedEntityMappings.put("&upsilon;", "\u03C5");
		oFF.XmlUtils.extendedEntityMappings.put("&Uuml;", "\u00DC");
		oFF.XmlUtils.extendedEntityMappings.put("&uuml;", "\u00FC");
		oFF.XmlUtils.extendedEntityMappings.put("&weierp;", "\u2118");
		oFF.XmlUtils.extendedEntityMappings.put("&Xi;", "\u039E");
		oFF.XmlUtils.extendedEntityMappings.put("&xi;", "\u03BE");
		oFF.XmlUtils.extendedEntityMappings.put("&Yacute;", "\u00DD");
		oFF.XmlUtils.extendedEntityMappings.put("&yacute;", "\u00FD");
		oFF.XmlUtils.extendedEntityMappings.put("&yen;", "\u00A5");
		oFF.XmlUtils.extendedEntityMappings.put("&Yuml;", "\u0178");
		oFF.XmlUtils.extendedEntityMappings.put("&yuml;", "\u00FF");
		oFF.XmlUtils.extendedEntityMappings.put("&Zeta;", "\u0396");
		oFF.XmlUtils.extendedEntityMappings.put("&zeta;", "\u03B6");
	},
	unescapeJson:function(string)
	{
			if (oFF.isNull(string))
		{
			return null;
		}
		var buffer = oFF.XStringBuffer.create();
		oFF.XmlUtils.unescapeJsonToBuffer(string, buffer);
		return buffer.toString();
	},
	unescapeJsonToBuffer:function(string, buffer)
	{
			if (oFF.isNull(string))
		{
			return;
		}
		var startOfUnescaped = 0;
		var escaper = oFF.XString.indexOf(string, "\\");
		while (escaper > -1)
		{
			buffer.append(oFF.XString.substring(string, startOfUnescaped, escaper));
			if (escaper >= oFF.XString.size(string) - 1)
			{
				buffer.append("\\");
				return;
			}
			startOfUnescaped = escaper + 2;
			switch (oFF.XString.getCharAt(string, escaper + 1))
			{
				case 110:
					buffer.append("\n");
					break;

				case 114:
					buffer.append("\r");
					break;

				case 116:
					buffer.append("\t");
					break;

				case 98:
					buffer.append("\b");
					break;

				case 102:
					buffer.append("\f");
					break;

				case 47:
					buffer.append("/");
					break;

				case 92:
					buffer.append("\\");
					break;

				case 34:
					buffer.append("\"");
					break;

				default:
					buffer.append(oFF.XString.substring(string, escaper, escaper + 2));
			}
			if (startOfUnescaped >= oFF.XString.size(string))
			{
				return;
			}
			escaper = oFF.XString.indexOfFrom(string, "\\", startOfUnescaped);
		}
		if (escaper === -1)
		{
			buffer.append(oFF.XString.substring(string, startOfUnescaped, oFF.XString.size(string)));
		}
		else
		{
			buffer.append(oFF.XString.substring(string, startOfUnescaped, escaper));
		}
	},
	escapeXml:function(string, ESCAPE_LEVEL)
	{
			if (oFF.isNull(string))
		{
			return null;
		}
		switch (ESCAPE_LEVEL)
		{
			case oFF.XmlUtils.MUST_NOT_ESCAPE:
				return string;

			case oFF.XmlUtils.TEXT_NODE_ESCAPE:
				return oFF.XmlUtils.escapeXmlTextNodeLazy(string);

			case oFF.XmlUtils.ATTRIBUTE_ESCAPE:
				return oFF.XmlUtils.escapeXmlAttributeLazy(string);

			default:
				return oFF.XmlUtils.escapeXmlString(string);
		}
	},
	escapeXmlString:function(string)
	{
			if (oFF.isNull(string))
		{
			return null;
		}
		var result = oFF.XString.containsString(string, oFF.XmlUtils.AMP_CHAR) ? oFF.XString.replace(string, oFF.XmlUtils.AMP_CHAR, oFF.XmlUtils.AMP_ENTITY) : string;
		result = oFF.XString.containsString(result, oFF.XmlUtils.QUOT_CHAR) ? oFF.XString.replace(result, oFF.XmlUtils.QUOT_CHAR, oFF.XmlUtils.QUOT_ENTITY) : result;
		result = oFF.XString.containsString(result, oFF.XmlUtils.APOS_CHAR) ? oFF.XString.replace(result, oFF.XmlUtils.APOS_CHAR, oFF.XmlUtils.APOS_ENTITY) : result;
		result = oFF.XString.containsString(result, oFF.XmlUtils.LT_CHAR) ? oFF.XString.replace(result, oFF.XmlUtils.LT_CHAR, oFF.XmlUtils.LT_ENTITY) : result;
		return oFF.XString.containsString(result, oFF.XmlUtils.GT_CHAR) ? oFF.XString.replace(result, oFF.XmlUtils.GT_CHAR, oFF.XmlUtils.GT_ENTITY) : result;
	},
	escapeXmlAttributeLazy:function(string)
	{
			if (oFF.isNull(string))
		{
			return null;
		}
		var result = oFF.XString.containsString(string, oFF.XmlUtils.AMP_CHAR) ? oFF.XString.replace(string, oFF.XmlUtils.AMP_CHAR, oFF.XmlUtils.AMP_ENTITY) : string;
		result = oFF.XString.containsString(result, oFF.XmlUtils.QUOT_CHAR) ? oFF.XString.replace(result, oFF.XmlUtils.QUOT_CHAR, oFF.XmlUtils.QUOT_ENTITY) : result;
		return oFF.XString.containsString(result, oFF.XmlUtils.LT_CHAR) ? oFF.XString.replace(result, oFF.XmlUtils.LT_CHAR, oFF.XmlUtils.LT_ENTITY) : result;
	},
	escapeXmlTextNodeLazy:function(string)
	{
			if (oFF.isNull(string))
		{
			return null;
		}
		var result = oFF.XString.containsString(string, oFF.XmlUtils.AMP_CHAR) ? oFF.XString.replace(string, oFF.XmlUtils.AMP_CHAR, oFF.XmlUtils.AMP_ENTITY) : string;
		return oFF.XString.containsString(result, oFF.XmlUtils.LT_CHAR) ? oFF.XString.replace(result, oFF.XmlUtils.LT_CHAR, oFF.XmlUtils.LT_ENTITY) : result;
	},
	unescapeRawXmlString:function(string, extended)
	{
			if (oFF.isNull(string))
		{
			return null;
		}
		var buffer = oFF.XStringBuffer.create();
		oFF.XmlUtils.unescapeRawXmlStringToBuffer(string, buffer, extended);
		return buffer.toString();
	},
	unescapeRawXmlStringToBuffer:function(string, buffer, extended)
	{
			if (oFF.isNull(string))
		{
			return;
		}
		var entityStartIndex = oFF.XString.indexOf(string, "&");
		if (entityStartIndex > -1)
		{
			buffer.append(oFF.XString.substring(string, 0, entityStartIndex));
		}
		else
		{
			buffer.append(string);
			return;
		}
		while (entityStartIndex > -1)
		{
			var entityEndIndex = oFF.XString.indexOfFrom(string, ";", entityStartIndex + 1);
			var entityMatched = false;
			if (entityEndIndex > entityStartIndex + 1)
			{
				var entityDefinition = oFF.XString.substring(string, entityStartIndex, entityEndIndex + 1);
				entityMatched = true;
				if (extended && oFF.XmlUtils.extendedEntityMappings.containsKey(entityDefinition))
				{
					buffer.append(oFF.XmlUtils.extendedEntityMappings.getByKey(entityDefinition));
				}
				else if (!extended && oFF.XmlUtils.entityMappings.containsKey(entityDefinition))
				{
					buffer.append(oFF.XmlUtils.entityMappings.getByKey(entityDefinition));
				}
				else if (oFF.XString.startsWith(entityDefinition, "&#x"))
				{
					try
					{
						buffer.appendChar(oFF.XInteger.convertFromStringWithRadix(oFF.XString.substring(entityDefinition, 3, oFF.XString.size(entityDefinition) - 1), 16));
						entityMatched = true;
					}
					catch (t)
					{
						entityMatched = false;
					}
				}
				else if (oFF.XString.startsWith(entityDefinition, "&#"))
				{
					try
					{
						buffer.appendChar(oFF.XInteger.convertFromStringWithRadix(oFF.XString.substring(entityDefinition, 2, oFF.XString.size(entityDefinition) - 1), 10));
						entityMatched = true;
					}
					catch (t1)
					{
						entityMatched = false;
					}
				}
				else
				{
					entityMatched = false;
				}
			}
			else
			{
				buffer.append(oFF.XString.substring(string, entityStartIndex, oFF.XString.size(string)));
				break;
			}
			if (!entityMatched)
			{
				buffer.append("&");
				entityEndIndex = entityStartIndex;
			}
			if (entityEndIndex >= oFF.XString.size(string))
			{
				break;
			}
			entityStartIndex = oFF.XString.indexOfFrom(string, "&", entityEndIndex + 1);
			if (entityStartIndex === -1)
			{
				buffer.append(oFF.XString.substring(string, entityEndIndex + 1, oFF.XString.size(string)));
				break;
			}
			buffer.append(oFF.XString.substring(string, entityEndIndex + 1, entityStartIndex));
		}
	}
};

oFF.JsonParserFactory = function() {};
oFF.JsonParserFactory.prototype = new oFF.XObject();
oFF.JsonParserFactory.prototype._ff_c = "JsonParserFactory";

oFF.JsonParserFactory.s_jsonParserFactoryNative = null;
oFF.JsonParserFactory.s_jsonParserFactoryGeneric = null;
oFF.JsonParserFactory.staticSetupJsonParserFactory = function() {};
oFF.JsonParserFactory.newInstance = function()
{
	if (oFF.notNull(oFF.JsonParserFactory.s_jsonParserFactoryNative))
	{
		return oFF.JsonParserFactory.s_jsonParserFactoryNative.newParserInstance();
	}
	else if (oFF.notNull(oFF.JsonParserFactory.s_jsonParserFactoryGeneric))
	{
		return oFF.JsonParserFactory.s_jsonParserFactoryGeneric.newParserInstance();
	}
	else
	{
		return null;
	}
};
oFF.JsonParserFactory.createFromString = function(simpleJson)
{
	return oFF.JsonParserFactory.createFromSafeString(simpleJson);
};
oFF.JsonParserFactory.createFromSafeString = function(simpleJson)
{
	var parser = oFF.JsonParserFactory.newInstance();
	var rootElement = parser.parseUnsafe(simpleJson);
	if (parser.hasErrors() && oFF.isNull(rootElement))
	{
		throw oFF.XException.createIllegalArgumentException(parser.getSummary());
	}
	oFF.XObjectExt.release(parser);
	return rootElement;
};
oFF.JsonParserFactory.createComplexJsonDocument = function(docsMap)
{
	if (oFF.isNull(docsMap) || !docsMap.hasElements())
	{
		return null;
	}
	var inaComplexContent = oFF.PrFactory.createStructure();
	var docsKeyList = docsMap.getKeysAsReadOnlyListOfString();
	var mapSize = docsKeyList.size();
	for (var i = 0; i < mapSize; i++)
	{
		var inAKeyForDoc = docsKeyList.get(i);
		inaComplexContent.put(inAKeyForDoc, oFF.JsonParserFactory.createFromString(docsMap.getByKey(inAKeyForDoc)));
	}
	return inaComplexContent;
};
oFF.JsonParserFactory.setJsonParserFactory = function(jsonParserFactory)
{
	oFF.JsonParserFactory.s_jsonParserFactoryNative = jsonParserFactory;
};
oFF.JsonParserFactory.setJsonParserFactoryGeneric = function(jsonParserFactory)
{
	oFF.JsonParserFactory.s_jsonParserFactoryGeneric = jsonParserFactory;
};

oFF.PrFactory = function() {};
oFF.PrFactory.prototype = new oFF.XObject();
oFF.PrFactory.prototype._ff_c = "PrFactory";

oFF.PrFactory.s_universalFactory = null;
oFF.PrFactory.s_nativeFactory = null;
oFF.PrFactory.s_activeFactory = null;
oFF.PrFactory.createStructure = function()
{
	return oFF.PrFactory.s_activeFactory.newStructure();
};
oFF.PrFactory.createStructureDeepCopy = function(origin)
{
	return oFF.PrFactory.s_activeFactory.newStructureDeepCopy(origin);
};
oFF.PrFactory.createList = function()
{
	return oFF.PrFactory.s_activeFactory.newList();
};
oFF.PrFactory.createListDeepCopy = function(origin)
{
	return oFF.PrFactory.s_activeFactory.newListDeepCopy(origin);
};
oFF.PrFactory.createBoolean = function(value)
{
	return oFF.PrFactory.s_activeFactory.newBoolean(value);
};
oFF.PrFactory.createString = function(string)
{
	return oFF.PrFactory.s_activeFactory.newString(string);
};
oFF.PrFactory.createInteger = function(number)
{
	return oFF.PrFactory.s_activeFactory.newInteger(number);
};
oFF.PrFactory.createLong = function(number)
{
	return oFF.PrFactory.s_activeFactory.newLong(number);
};
oFF.PrFactory.createDouble = function(number)
{
	return oFF.PrFactory.s_activeFactory.newDouble(number);
};
oFF.PrFactory.createObject = function()
{
	return oFF.PrFactory.s_activeFactory.newObject();
};
oFF.PrFactory.setNativeFactory = function(factory)
{
	oFF.PrFactory.s_nativeFactory = factory;
};
oFF.PrFactory.getNativeParameterFactory = function()
{
	return oFF.PrFactory.s_nativeFactory;
};
oFF.PrFactory.setUniversalFactory = function(factory)
{
	oFF.PrFactory.s_universalFactory = factory;
};
oFF.PrFactory.getUniversalParameterFactory = function()
{
	return oFF.PrFactory.s_universalFactory;
};
oFF.PrFactory.setActiveFactory = function(factory)
{
	oFF.PrFactory.s_activeFactory = factory;
};
oFF.PrFactory.getActiveParameterFactory = function()
{
	return oFF.PrFactory.s_activeFactory;
};
oFF.PrFactory.prototype.newStructureDeepCopy = function(origin)
{
	return oFF.PrStructure.createDeepCopy(origin);
};
oFF.PrFactory.prototype.newListDeepCopy = function(origin)
{
	return oFF.PrList.createDeepCopy(origin);
};
oFF.PrFactory.prototype.newObject = function()
{
	return oFF.PrObject.create();
};

oFF.PrPathFilter = function() {};
oFF.PrPathFilter.prototype = new oFF.XObject();
oFF.PrPathFilter.prototype._ff_c = "PrPathFilter";

oFF.PrPathFilter.createReplacerInternal = function(transientPathCollector, name, parent, ignored, transientAttribute)
{
	var instance = new oFF.PrPathFilter();
	instance.m_transientPathCollector = transientPathCollector;
	instance.m_children = oFF.XHashMapByString.create();
	instance.m_name = name;
	if (oFF.notNull(parent))
	{
		parent.m_children.put(name, instance);
		instance.m_parent = oFF.XWeakReferenceUtil.getWeakRef(parent);
	}
	instance.m_ignored = ignored;
	instance.m_transient = transientAttribute;
	return instance;
};
oFF.PrPathFilter.create = function(transientPathCollector)
{
	return oFF.PrPathFilter.createReplacerInternal(transientPathCollector, null, null, false, false);
};
oFF.PrPathFilter.prototype.m_parent = null;
oFF.PrPathFilter.prototype.m_children = null;
oFF.PrPathFilter.prototype.m_name = null;
oFF.PrPathFilter.prototype.m_ignored = false;
oFF.PrPathFilter.prototype.m_transient = false;
oFF.PrPathFilter.prototype.m_path = null;
oFF.PrPathFilter.prototype.m_index = -1;
oFF.PrPathFilter.prototype.m_transientPathCollector = null;
oFF.PrPathFilter.prototype.m_escapeIgnore = false;
oFF.PrPathFilter.prototype.getPath = function()
{
	if (oFF.isNull(this.m_path))
	{
		if (oFF.isNull(this.m_parent))
		{
			this.m_path = this.getLocalPath();
		}
		else
		{
			this.m_path = oFF.XStringUtils.concatenate2(oFF.XWeakReferenceUtil.getHardRef(this.m_parent).getPath(), this.getLocalPath());
		}
	}
	return this.m_path;
};
oFF.PrPathFilter.prototype.getLocalPath = function()
{
	if (oFF.isNull(this.m_name))
	{
		return "$";
	}
	if (oFF.XString.isEqual(this.m_name, "*") || oFF.XString.isEqual(this.m_name, "."))
	{
		return oFF.XStringUtils.concatenate3("[", oFF.XInteger.convertToString(this.m_index), "]");
	}
	return oFF.XStringUtils.concatenate2(".", this.m_name);
};
oFF.PrPathFilter.prototype.addChild = function(name, ignored, transientAttribute)
{
	return oFF.PrPathFilter.createReplacerInternal(this.m_transientPathCollector, name, this, ignored, transientAttribute);
};
oFF.PrPathFilter.prototype.addListChild = function()
{
	return this.addChild("*", false, false);
};
oFF.PrPathFilter.prototype.addListFirstElementChild = function()
{
	return this.addChild(".", false, false);
};
oFF.PrPathFilter.prototype.addPlainChild = function(name)
{
	return this.addChild(name, false, false);
};
oFF.PrPathFilter.prototype.addNoSerializeChild = function(name)
{
	return this.addChild(name, true, false);
};
oFF.PrPathFilter.prototype.addTransientChild = function(name)
{
	return this.addChild(name, true, true);
};
oFF.PrPathFilter.prototype.getOrCreateChild = function(name)
{
	return this.m_children.containsKey(name) ? this.m_children.getByKey(name) : this.addPlainChild(name);
};
oFF.PrPathFilter.prototype.getOrCreateListChild = function()
{
	return this.m_children.containsKey("*") ? this.m_children.getByKey("*") : this.addListChild();
};
oFF.PrPathFilter.prototype.getOrCreateListFirstElementChild = function()
{
	return this.m_children.containsKey(".") ? this.m_children.getByKey(".") : this.addListFirstElementChild();
};
oFF.PrPathFilter.prototype.isEscapeIgnore = function()
{
	return this.m_escapeIgnore;
};
oFF.PrPathFilter.prototype.getSubFilter = function(key)
{
	return this.m_children.getByKey(key);
};
oFF.PrPathFilter.prototype.hasSubFilter = function(key)
{
	return this.m_children.containsKey(key);
};
oFF.PrPathFilter.prototype.isIgnore = function(key, value)
{
	var escapeIgnore = this.isEscapeIgnore();
	if (this.m_transient && !escapeIgnore)
	{
		this.m_transientPathCollector.addTransientPropertyPath(this.getPath(), value.asString().getString());
	}
	return this.m_ignored && !escapeIgnore;
};
oFF.PrPathFilter.prototype.setEscapeIgnore = function(escapeIgnore)
{
	this.m_escapeIgnore = escapeIgnore;
};
oFF.PrPathFilter.prototype.setEscapeIgnoreForChildren = function(ignore)
{
	oFF.XCollectionUtils.forEach(this.m_children,  function(child){
		child.setEscapeIgnore(ignore);
	}.bind(this));
};
oFF.PrPathFilter.prototype.submitIndex = function(index, value)
{
	if (oFF.XString.isEqual(".", this.m_name) && index !== 0)
	{
		this.setEscapeIgnoreForChildren(true);
	}
	else if (oFF.XString.isEqual("*", this.m_name) || oFF.XString.isEqual(".", this.m_name))
	{
		this.setEscapeIgnoreForChildren(false);
		this.m_index = index;
		this.resetPath();
	}
};
oFF.PrPathFilter.prototype.getListSubFilter = function()
{
	return this.hasSubFilter("*") ? this.getSubFilter("*") : this.getSubFilter(".");
};
oFF.PrPathFilter.prototype.resetPath = function()
{
	this.m_path = null;
	var values = this.m_children.getValuesAsReadOnlyList();
	for (var i = 0; i < values.size(); i++)
	{
		values.get(i).resetPath();
	}
};

oFF.XmlParserFactory = function() {};
oFF.XmlParserFactory.prototype = new oFF.XObject();
oFF.XmlParserFactory.prototype._ff_c = "XmlParserFactory";

oFF.XmlParserFactory.s_xmlParserFactory = null;
oFF.XmlParserFactory.staticSetupXmlParserFactory = function()
{
	oFF.XmlParserFactory.s_xmlParserFactory = new oFF.XmlParserFactory();
};
oFF.XmlParserFactory.newInstance = function()
{
	return oFF.XmlParserFactory.s_xmlParserFactory.newParserInstance();
};
oFF.XmlParserFactory.createFromString = function(xml)
{
	var parser = oFF.XmlParserFactory.newInstance();
	var rootElement = parser.parse(xml);
	if (parser.isValid())
	{
		return rootElement;
	}
	throw oFF.XException.createIllegalArgumentException(parser.getSummary());
};
oFF.XmlParserFactory.prototype.newParserInstance = function()
{
	return oFF.XmlParser.create();
};

oFF.JsonParserGenericFactory = function() {};
oFF.JsonParserGenericFactory.prototype = new oFF.JsonParserFactory();
oFF.JsonParserGenericFactory.prototype._ff_c = "JsonParserGenericFactory";

oFF.JsonParserGenericFactory.staticSetup = function()
{
	var factory = new oFF.JsonParserGenericFactory();
	oFF.JsonParserFactory.setJsonParserFactoryGeneric(factory);
};
oFF.JsonParserGenericFactory.prototype.newParserInstance = function()
{
	return oFF.JsonParserGeneric.create();
};

oFF.PrCleanup = function() {};
oFF.PrCleanup.prototype = new oFF.XObjectExt();
oFF.PrCleanup.prototype._ff_c = "PrCleanup";

oFF.PrCleanup.create = function()
{
	var instance = new oFF.PrCleanup();
	instance.m_toRemove = oFF.XHashSetOfString.create();
	return instance;
};
oFF.PrCleanup.prototype.m_toRemove = null;
oFF.PrCleanup.prototype.m_cdata = null;
oFF.PrCleanup.prototype.m_ignored = null;
oFF.PrCleanup.prototype.addCdataTags = function(names)
{
	if (oFF.isNull(this.m_cdata))
	{
		this.m_cdata = oFF.XHashSetOfString.create();
	}
	this.m_cdata.addAll(names);
	return this;
};
oFF.PrCleanup.prototype.tagsToRemove = function(names)
{
	this.m_toRemove.addAll(names);
	return this;
};
oFF.PrCleanup.prototype.addIgnoredTagsValue = function(name, value)
{
	if (oFF.isNull(this.m_ignored))
	{
		this.m_ignored = oFF.XProperties.create();
	}
	this.m_ignored.put(name, value);
	return this;
};
oFF.PrCleanup.prototype.cleanupInAJson = function(element)
{
	var result = oFF.PrUtils.deepCopyElement(element);
	this.cleanupInAJsonInternal(result);
	return result;
};
oFF.PrCleanup.prototype.cleanupInAJsonInternal = function(element)
{
	if (oFF.isNull(element))
	{
		return null;
	}
	var myElementType = element.getType();
	if (myElementType === oFF.PrElementType.STRUCTURE)
	{
		this.cleanupStructure(element);
	}
	else if (myElementType === oFF.PrElementType.LIST)
	{
		this.cleanupList(element);
	}
	else if (myElementType === oFF.PrElementType.DOUBLE)
	{
		var doubleValue = element.asDouble();
		var value2 = doubleValue.getDouble();
		var asLong2 = oFF.XDouble.convertToLong(value2);
		var backAsDouble2 = asLong2;
		if (backAsDouble2 === value2)
		{
			return oFF.PrFactory.createLong(asLong2);
		}
	}
	return null;
};
oFF.PrCleanup.prototype.cleanupStructure = function(element)
{
	var structure = element.asStructure();
	var names = oFF.XListOfString.createFromReadOnlyList(structure.getKeysAsReadOnlyListOfString());
	var size = names.size();
	for (var i = 0; i < size; i++)
	{
		var name = names.get(i);
		if (oFF.notNull(this.m_ignored) && this.m_ignored.containsKey(name))
		{
			if (!oFF.XString.containsString(structure.getStringByKey(name), this.m_ignored.getByKey(name)))
			{
				structure.remove(name);
				continue;
			}
		}
		else if (oFF.notNull(this.m_cdata) && this.m_cdata.contains(name))
		{
			var cdataType = structure.getElementTypeByKey(name);
			if (cdataType === oFF.PrElementType.STRING)
			{
				var value = structure.getStringByKey(name);
				if (oFF.XStringUtils.isNotNullAndNotEmpty(value))
				{
					var parser = oFF.JsonParserFactory.newInstance();
					var rootElement = parser.parse(value);
					if (parser.isValid() && oFF.notNull(rootElement))
					{
						structure.put(name, rootElement);
					}
					else
					{
						structure.putString(name, "PARSER ERROR");
					}
					oFF.XObjectExt.release(parser);
				}
			}
		}
		else if (this.m_toRemove.contains(name))
		{
			structure.remove(name);
			continue;
		}
		var currentStructureElement = structure.getByKey(name);
		var returnStructureElement = this.cleanupInAJsonInternal(currentStructureElement);
		if (oFF.notNull(returnStructureElement))
		{
			structure.put(name, returnStructureElement);
		}
	}
};
oFF.PrCleanup.prototype.cleanupList = function(myElement)
{
	var list = myElement.asList();
	var size = list.size();
	for (var k = 0; k < size; k++)
	{
		var currentListElement = list.get(k);
		var returnListElement = this.cleanupInAJsonInternal(currentListElement);
		if (oFF.notNull(returnListElement))
		{
			list.set(k, returnListElement);
		}
	}
};
oFF.PrCleanup.prototype.releaseObject = function()
{
	oFF.XObjectExt.prototype.releaseObject.call( this );
	this.m_cdata = oFF.XObjectExt.release(this.m_cdata);
	this.m_ignored = oFF.XObjectExt.release(this.m_ignored);
	this.m_toRemove = oFF.XObjectExt.release(this.m_toRemove);
};

oFF.PrFactoryUniversal = function() {};
oFF.PrFactoryUniversal.prototype = new oFF.PrFactory();
oFF.PrFactoryUniversal.prototype._ff_c = "PrFactoryUniversal";

oFF.PrFactoryUniversal.staticSetup = function()
{
	oFF.PrInteger.staticSetup();
	oFF.PrBoolean.staticSetup();
	oFF.PrString.staticSetup();
	oFF.PrDouble.staticSetup();
	var factory = new oFF.PrFactoryUniversal();
	oFF.PrFactory.setUniversalFactory(factory);
	oFF.PrFactory.setActiveFactory(factory);
};
oFF.PrFactoryUniversal.prototype.newBoolean = function(value)
{
	return oFF.PrBoolean.createWithValue(value);
};
oFF.PrFactoryUniversal.prototype.newInteger = function(number)
{
	return oFF.PrInteger.createWithValue(number);
};
oFF.PrFactoryUniversal.prototype.newLong = function(number)
{
	return oFF.PrLong.createWithValue(number);
};
oFF.PrFactoryUniversal.prototype.newDouble = function(number)
{
	return oFF.PrDouble.createWithValue(number);
};
oFF.PrFactoryUniversal.prototype.newString = function(string)
{
	return oFF.PrString.createWithValue(string);
};
oFF.PrFactoryUniversal.prototype.newStructure = function()
{
	return oFF.PrStructure.create();
};
oFF.PrFactoryUniversal.prototype.newStructureDeepCopy = function(origin)
{
	return oFF.PrStructure.createDeepCopy(origin);
};
oFF.PrFactoryUniversal.prototype.newList = function()
{
	return oFF.PrList.create();
};
oFF.PrFactoryUniversal.prototype.newListDeepCopy = function(origin)
{
	return oFF.PrList.createDeepCopy(origin);
};
oFF.PrFactoryUniversal.prototype.newNull = function()
{
	return null;
};
oFF.PrFactoryUniversal.prototype.newObject = function()
{
	return oFF.PrObject.create();
};

oFF.DfDocumentParser = function() {};
oFF.DfDocumentParser.prototype = new oFF.MessageManagerSimple();
oFF.DfDocumentParser.prototype._ff_c = "DfDocumentParser";

oFF.DfDocumentParser.prototype.parseByteArray = function(byteContent)
{
	var content = oFF.XByteArray.convertToString(byteContent);
	return this.parse(content);
};
oFF.DfDocumentParser.prototype.parseUnsafe = function(content)
{
	return this.parse(content);
};
oFF.DfDocumentParser.prototype.convertFromNative = function(content)
{
	return oFF.XObject.castFromNative(content);
};
oFF.DfDocumentParser.prototype.convertToNative = function(element)
{
	return element;
};

oFF.PrElement = function() {};
oFF.PrElement.prototype = new oFF.XJson();
oFF.PrElement.prototype._ff_c = "PrElement";

oFF.PrElement.prototype.isProxy = function()
{
	return false;
};
oFF.PrElement.prototype.getElement = function()
{
	return this;
};
oFF.PrElement.prototype.asList = function()
{
	return null;
};
oFF.PrElement.prototype.asStructure = function()
{
	return null;
};
oFF.PrElement.prototype.asString = function()
{
	return null;
};
oFF.PrElement.prototype.asNumber = function()
{
	return null;
};
oFF.PrElement.prototype.asInteger = function()
{
	return null;
};
oFF.PrElement.prototype.asLong = function()
{
	return null;
};
oFF.PrElement.prototype.asDouble = function()
{
	return null;
};
oFF.PrElement.prototype.asBoolean = function()
{
	return null;
};
oFF.PrElement.prototype.asObject = function()
{
	return null;
};
oFF.PrElement.prototype.getType = function()
{
	return null;
};
oFF.PrElement.prototype.getValueType = function()
{
	var type = this.getType();
	if (type === oFF.PrElementType.STRUCTURE)
	{
		return oFF.XValueType.STRUCTURE;
	}
	else if (type === oFF.PrElementType.LIST)
	{
		return oFF.XValueType.LIST;
	}
	return null;
};
oFF.PrElement.prototype.getComponentType = function()
{
	return this.getValueType();
};
oFF.PrElement.prototype.getPermaCopy = function()
{
	return oFF.PrUtils.deepCopyElement(this);
};
oFF.PrElement.prototype.isStructure = function()
{
	return this.getType() === oFF.PrElementType.STRUCTURE;
};
oFF.PrElement.prototype.isList = function()
{
	return this.getType() === oFF.PrElementType.LIST;
};
oFF.PrElement.prototype.isString = function()
{
	return this.getType() === oFF.PrElementType.STRING;
};
oFF.PrElement.prototype.isInteger = function()
{
	return this.getType() === oFF.PrElementType.INTEGER;
};
oFF.PrElement.prototype.isDouble = function()
{
	return this.getType() === oFF.PrElementType.DOUBLE;
};
oFF.PrElement.prototype.isLong = function()
{
	return this.getType() === oFF.PrElementType.LONG;
};
oFF.PrElement.prototype.isObject = function()
{
	return this.getType() === oFF.PrElementType.OBJECT;
};
oFF.PrElement.prototype.isBoolean = function()
{
	return this.getType() === oFF.PrElementType.BOOLEAN;
};
oFF.PrElement.prototype.isNumeric = function()
{
	return this.isLong() || this.isDouble() || this.isInteger();
};
oFF.PrElement.prototype.isEqualTo = function(other)
{
	var isEqual = false;
	if (oFF.notNull(other))
	{
		var otherElement = other;
		var myType = this.getType();
		var otherType = otherElement.getType();
		if (myType.isNumber() && otherType.isNumber())
		{
			isEqual = this.asNumber().getDouble() === otherElement.asNumber().getDouble();
		}
		else
		{
			if (myType === otherType)
			{
				if (myType === oFF.PrElementType.BOOLEAN)
				{
					isEqual = this.getBoolean() === otherElement.getBoolean();
				}
				else if (myType === oFF.PrElementType.INTEGER)
				{
					isEqual = this.getInteger() === otherElement.getInteger();
				}
				else if (myType === oFF.PrElementType.LONG)
				{
					isEqual = this.getLong() === otherElement.getLong();
				}
				else if (myType === oFF.PrElementType.DOUBLE)
				{
					isEqual = this.getDouble() === otherElement.getDouble();
				}
				else if (myType === oFF.PrElementType.STRING)
				{
					isEqual = oFF.XString.isEqual(this.getString(), otherElement.getString());
				}
				else if (myType === oFF.PrElementType.OBJECT)
				{
					isEqual = this.asObject().getObject() === otherElement.asObject().getObject();
				}
				else if (myType === oFF.PrElementType.THE_NULL)
				{
					isEqual = true;
				}
				else
				{
					if (myType === oFF.PrElementType.LIST)
					{
						var myList = this;
						var otherList = otherElement;
						var sizeList = myList.size();
						if (sizeList === otherList.size())
						{
							isEqual = true;
							var myListElement;
							var otherListElement;
							for (var i = 0; i < sizeList && isEqual === true; i++)
							{
								myListElement = myList.get(i);
								otherListElement = otherList.get(i);
								if (oFF.isNull(myListElement) || oFF.isNull(otherListElement))
								{
									isEqual = myListElement === otherListElement;
								}
								else if (!myListElement.isEqualTo(otherListElement))
								{
									isEqual = false;
								}
							}
						}
					}
					else if (myType === oFF.PrElementType.STRUCTURE)
					{
						var myStructure = this;
						var otherStructure = otherElement;
						var myNames = myStructure.getKeysAsReadOnlyListOfString();
						var otherNames = otherStructure.getKeysAsReadOnlyListOfString();
						var sizeStruct = myNames.size();
						if (sizeStruct === otherNames.size())
						{
							isEqual = true;
							var myStructureElement;
							var otherStructureElement;
							for (var k = 0; k < sizeStruct && isEqual === true; k++)
							{
								var myName = myNames.get(k);
								if (!otherStructure.containsKey(myName))
								{
									isEqual = false;
								}
								else
								{
									myStructureElement = myStructure.getByKey(myName);
									otherStructureElement = otherStructure.getByKey(myName);
									if (oFF.isNull(myStructureElement) && oFF.notNull(otherStructureElement) || oFF.notNull(myStructureElement) && oFF.isNull(otherStructureElement))
									{
										isEqual = false;
									}
									else if (oFF.notNull(myStructureElement))
									{
										if (!myStructureElement.isEqualTo(otherStructureElement))
										{
											isEqual = false;
										}
									}
								}
							}
						}
					}
					else
					{
						throw oFF.XException.createIllegalStateException("Unknown type");
					}
				}
			}
		}
	}
	return isEqual;
};
oFF.PrElement.prototype.getStringRepresentation = function()
{
	return oFF.PrUtils.serialize(this, true, false, 0);
};
oFF.PrElement.prototype.convertToNative = function()
{
	var parser = oFF.JsonParserFactory.newInstance();
	var nativeObject = parser.convertToNative(this);
	oFF.XObjectExt.release(parser);
	return nativeObject;
};
oFF.PrElement.prototype.copyFrom = function(other, flags)
{
	oFF.PrUtils.createDeepCopyExt(other, this);
};
oFF.PrElement.prototype.cloneExt = function(flags)
{
	return oFF.PrUtils.createDeepCopyExt(this, null);
};
oFF.PrElement.prototype.toString = function()
{
	return oFF.PrUtils.serialize(this, true, false, 0);
};
oFF.PrElement.prototype.copyAsPrimitiveXValue = function()
{
	var elementType = this.getType();
	var returnValue = null;
	if (elementType === oFF.PrElementType.STRING)
	{
		returnValue = oFF.XStringValue.create(this.asString().getString());
	}
	else if (elementType === oFF.PrElementType.BOOLEAN)
	{
		returnValue = oFF.XBooleanValue.create(this.asBoolean().getBoolean());
	}
	else if (elementType === oFF.PrElementType.DOUBLE)
	{
		returnValue = oFF.XDoubleValue.create(this.asDouble().getDouble());
	}
	else if (elementType === oFF.PrElementType.LONG)
	{
		returnValue = oFF.XLongValue.create(this.asLong().getLong());
	}
	else if (elementType === oFF.PrElementType.INTEGER)
	{
		returnValue = oFF.XIntegerValue.create(this.asInteger().getInteger());
	}
	return returnValue;
};

oFF.DocumentFormatType = function() {};
oFF.DocumentFormatType.prototype = new oFF.XConstant();
oFF.DocumentFormatType.prototype._ff_c = "DocumentFormatType";

oFF.DocumentFormatType.JSON = null;
oFF.DocumentFormatType.XML = null;
oFF.DocumentFormatType.staticSetup = function()
{
	oFF.DocumentFormatType.JSON = oFF.XConstant.setupName(new oFF.DocumentFormatType(), "Json");
	oFF.DocumentFormatType.XML = oFF.XConstant.setupName(new oFF.DocumentFormatType(), "Xml");
};

oFF.JsonParserGeneric = function() {};
oFF.JsonParserGeneric.prototype = new oFF.DfDocumentParser();
oFF.JsonParserGeneric.prototype._ff_c = "JsonParserGeneric";

oFF.JsonParserGeneric.create = function()
{
	var object = new oFF.JsonParserGeneric();
	object.setupParser(null, false);
	return object;
};
oFF.JsonParserGeneric.createEmbedded = function(source)
{
	var object = new oFF.JsonParserGeneric();
	object.setupParser(source, true);
	return object;
};
oFF.JsonParserGeneric.prototype.m_source = null;
oFF.JsonParserGeneric.prototype.m_isEmbedded = false;
oFF.JsonParserGeneric.prototype.m_stringDelimiter = 0;
oFF.JsonParserGeneric.prototype.m_rootElement = null;
oFF.JsonParserGeneric.prototype.m_elementStack = null;
oFF.JsonParserGeneric.prototype.m_currentStackIndex = 0;
oFF.JsonParserGeneric.prototype.m_pos = 0;
oFF.JsonParserGeneric.prototype.m_isInsideString = false;
oFF.JsonParserGeneric.prototype.m_isInsideVariable = false;
oFF.JsonParserGeneric.prototype.m_isInsideEscape = false;
oFF.JsonParserGeneric.prototype.m_isInsideNumber = false;
oFF.JsonParserGeneric.prototype.m_isInsideDoubleNumber = false;
oFF.JsonParserGeneric.prototype.m_isInsideUnicode = false;
oFF.JsonParserGeneric.prototype.m_unicodePos = 0;
oFF.JsonParserGeneric.prototype.m_stringStartPos = 0;
oFF.JsonParserGeneric.prototype.m_escapedString = null;
oFF.JsonParserGeneric.prototype.m_numberStartPos = 0;
oFF.JsonParserGeneric.prototype.m_structureDepth = 0;
oFF.JsonParserGeneric.prototype.setupParser = function(source, isEmbedded)
{
	this.setup();
	this.m_isEmbedded = isEmbedded;
	if (this.m_isEmbedded)
	{
		this.m_stringDelimiter = 39;
	}
	else
	{
		this.m_stringDelimiter = 34;
	}
	if (oFF.notNull(source))
	{
		this.resetParsing(source);
	}
};
oFF.JsonParserGeneric.prototype.releaseObject = function()
{
	oFF.DfDocumentParser.prototype.releaseObject.call( this );
	this.resetParsing(null);
};
oFF.JsonParserGeneric.prototype.resetParsing = function(source)
{
	this.m_rootElement = null;
	this.m_elementStack = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_elementStack);
	if (oFF.notNull(source))
	{
		this.m_elementStack = oFF.XList.create();
	}
	this.m_currentStackIndex = -1;
	this.m_pos = 0;
	this.m_isInsideString = false;
	this.m_isInsideVariable = false;
	this.m_isInsideEscape = false;
	this.m_isInsideNumber = false;
	this.m_isInsideDoubleNumber = false;
	this.m_isInsideUnicode = false;
	this.m_unicodePos = 0;
	this.m_stringStartPos = 0;
	this.m_escapedString = oFF.XObjectExt.release(this.m_escapedString);
	this.m_numberStartPos = 0;
	this.m_structureDepth = 0;
	this.m_source = source;
};
oFF.JsonParserGeneric.prototype.parse = function(content)
{
	this.resetParsing(content);
	if (oFF.notNull(content))
	{
		if (this.runWalker())
		{
			return this.m_rootElement;
		}
	}
	return null;
};
oFF.JsonParserGeneric.prototype.enterStructure = function()
{
	return this.enter(oFF.PrFactory.createStructure());
};
oFF.JsonParserGeneric.prototype.raiseWrongCommaError = function()
{
	this.raiseError("Object properties and array items must be separated by single comma.");
};
oFF.JsonParserGeneric.prototype.leaveStructure = function()
{
	var topStackElement = this.getTopStackElement();
	if (!topStackElement.finishElements())
	{
		this.raiseWrongCommaError();
		return false;
	}
	this.m_currentStackIndex--;
	return true;
};
oFF.JsonParserGeneric.prototype.enterArray = function()
{
	return this.enter(oFF.PrFactory.createList());
};
oFF.JsonParserGeneric.prototype.leaveArray = function()
{
	var topStackElement = this.getTopStackElement();
	if (!topStackElement.finishElements())
	{
		this.raiseWrongCommaError();
		return false;
	}
	this.m_currentStackIndex--;
	return true;
};
oFF.JsonParserGeneric.prototype.checkStructure = function(jsonStackElement)
{
	if (!jsonStackElement.isNameSet())
	{
		this.raiseError("Name in structure is not set");
		return false;
	}
	if (jsonStackElement.isValueSet())
	{
		this.raiseError("Value in structure is already set");
		return false;
	}
	jsonStackElement.setValueSet(true);
	return true;
};
oFF.JsonParserGeneric.prototype.checkList = function(jsonStackElement)
{
	if (jsonStackElement.isNameSet())
	{
		this.raiseError("Name cannot be set in list");
		return false;
	}
	if (jsonStackElement.isValueSet())
	{
		this.raiseError("Value in list is already set");
		return false;
	}
	jsonStackElement.setValueSet(true);
	return true;
};
oFF.JsonParserGeneric.prototype.enter = function(nextElement)
{
	if (this.m_currentStackIndex === -1)
	{
		this.m_rootElement = nextElement;
	}
	else
	{
		var jsonStackElement = this.getTopStackElement();
		if (!jsonStackElement.addElement())
		{
			this.raiseWrongCommaError();
			return false;
		}
		var element = jsonStackElement.getElement();
		var type = element.getType();
		if (type === oFF.PrElementType.STRUCTURE)
		{
			if (!this.checkStructure(jsonStackElement))
			{
				return false;
			}
			var name = jsonStackElement.getName();
			var structure = element;
			structure.put(name, nextElement);
		}
		else if (type === oFF.PrElementType.LIST)
		{
			if (!this.checkList(jsonStackElement))
			{
				return false;
			}
			var list = element;
			list.add(nextElement);
		}
		else
		{
			this.raiseError("Illegal type");
			return false;
		}
	}
	var nextStackElement;
	if (this.m_currentStackIndex === this.m_elementStack.size() - 1)
	{
		nextStackElement = oFF.JsonParserGenericStackElement.create();
		this.m_elementStack.add(nextStackElement);
	}
	else
	{
		nextStackElement = this.m_elementStack.get(this.m_currentStackIndex + 1);
		nextStackElement.reset();
	}
	nextStackElement.setElement(nextElement);
	this.m_currentStackIndex++;
	return true;
};
oFF.JsonParserGeneric.prototype.setVariable = function(value)
{
	var newElement = null;
	var isKey = false;
	if (oFF.XString.isEqual("true", value))
	{
		newElement = oFF.PrFactory.createBoolean(true);
		isKey = true;
	}
	else if (oFF.XString.isEqual("false", value))
	{
		newElement = oFF.PrFactory.createBoolean(false);
		isKey = true;
	}
	else if (oFF.XString.isEqual("null", value))
	{
		isKey = true;
	}
	if (!isKey)
	{
		if (this.m_isEmbedded)
		{
			return this.setString(value);
		}
		this.raiseError(oFF.XStringUtils.concatenate2("Unknown value: ", value));
		return false;
	}
	var jsonStackElement = this.getTopStackElement();
	if (!jsonStackElement.addElement())
	{
		this.raiseWrongCommaError();
		return false;
	}
	var element = jsonStackElement.getElement();
	var type = element.getType();
	if (type === oFF.PrElementType.STRUCTURE)
	{
		if (!this.checkStructure(jsonStackElement))
		{
			return false;
		}
		var name = jsonStackElement.getName();
		var structure = element;
		structure.put(name, newElement);
	}
	else if (type === oFF.PrElementType.LIST)
	{
		if (!this.checkList(jsonStackElement))
		{
			return false;
		}
		var list = element;
		list.add(newElement);
	}
	else
	{
		this.raiseError("Illegal type");
		return false;
	}
	return true;
};
oFF.JsonParserGeneric.prototype.setString = function(value)
{
	var jsonStackElement = this.getTopStackElement();
	var element = jsonStackElement.getElement();
	var type = element.getType();
	if (type === oFF.PrElementType.STRUCTURE)
	{
		if (!jsonStackElement.isNameSet())
		{
			if (jsonStackElement.isValueSet())
			{
				this.raiseError("Name in structure is not set");
				return false;
			}
			jsonStackElement.setName(value);
		}
		else
		{
			if (jsonStackElement.addElement() === false)
			{
				this.raiseWrongCommaError();
				return false;
			}
			if (this.checkStructure(jsonStackElement) === false)
			{
				return false;
			}
			var name = jsonStackElement.getName();
			var structure = element;
			structure.putString(name, value);
		}
	}
	else if (type === oFF.PrElementType.LIST)
	{
		if (jsonStackElement.addElement() === false)
		{
			return false;
		}
		if (this.checkList(jsonStackElement) === false)
		{
			return false;
		}
		var list = element;
		list.add(oFF.PrFactory.createString(value));
	}
	else
	{
		this.raiseError("Illegal type");
		return false;
	}
	return true;
};
oFF.JsonParserGeneric.prototype.leaveString = function()
{
	return true;
};
oFF.JsonParserGeneric.prototype.enterNumber = function()
{
	return true;
};
oFF.JsonParserGeneric.prototype.leaveNumber = function()
{
	return true;
};
oFF.JsonParserGeneric.prototype.setDouble = function(value)
{
	var jsonStackElement = this.getTopStackElement();
	if (jsonStackElement.addElement() === false)
	{
		this.raiseWrongCommaError();
		return false;
	}
	var element = jsonStackElement.getElement();
	var type = element.getType();
	if (type === oFF.PrElementType.STRUCTURE)
	{
		if (this.checkStructure(jsonStackElement) === false)
		{
			return false;
		}
		var name = jsonStackElement.getName();
		var structure = element;
		structure.putDouble(name, value);
	}
	else if (type === oFF.PrElementType.LIST)
	{
		if (this.checkList(jsonStackElement) === false)
		{
			return false;
		}
		var list = element;
		list.add(oFF.PrFactory.createDouble(value));
	}
	else
	{
		this.raiseError("Illegal type");
		return false;
	}
	return true;
};
oFF.JsonParserGeneric.prototype.setInteger = function(value)
{
	var jsonStackElement = this.getTopStackElement();
	if (jsonStackElement.addElement() === false)
	{
		this.raiseWrongCommaError();
		return false;
	}
	var element = jsonStackElement.getElement();
	var type = element.getType();
	if (type === oFF.PrElementType.STRUCTURE)
	{
		if (this.checkStructure(jsonStackElement) === false)
		{
			return false;
		}
		var name = jsonStackElement.getName();
		var structure = element;
		structure.putInteger(name, value);
	}
	else if (type === oFF.PrElementType.LIST)
	{
		if (this.checkList(jsonStackElement) === false)
		{
			return false;
		}
		var list = element;
		list.add(oFF.PrFactory.createInteger(value));
	}
	else
	{
		this.raiseError("Illegal type");
		return false;
	}
	return true;
};
oFF.JsonParserGeneric.prototype.setLong = function(value)
{
	var jsonStackElement = this.getTopStackElement();
	if (jsonStackElement.addElement() === false)
	{
		this.raiseWrongCommaError();
		return false;
	}
	var element = jsonStackElement.getElement();
	var type = element.getType();
	if (type === oFF.PrElementType.STRUCTURE)
	{
		if (this.checkStructure(jsonStackElement) === false)
		{
			return false;
		}
		var name = jsonStackElement.getName();
		var structure = element;
		structure.putLong(name, value);
	}
	else if (type === oFF.PrElementType.LIST)
	{
		if (this.checkList(jsonStackElement) === false)
		{
			return false;
		}
		var list = element;
		list.add(oFF.PrFactory.createLong(value));
	}
	else
	{
		this.raiseError("Illegal type");
		return false;
	}
	return true;
};
oFF.JsonParserGeneric.prototype.enterValueZone = function()
{
	return true;
};
oFF.JsonParserGeneric.prototype.nextItem = function()
{
	var jsonStackElement = this.getTopStackElement();
	jsonStackElement.setName(null);
	jsonStackElement.setValueSet(false);
	if (jsonStackElement.nextElement() === false)
	{
		this.raiseWrongCommaError();
		return false;
	}
	return true;
};
oFF.JsonParserGeneric.prototype.getTopStackElement = function()
{
	return this.m_elementStack.get(this.m_currentStackIndex);
};
oFF.JsonParserGeneric.prototype.getRootElement = function()
{
	return this.m_rootElement;
};
oFF.JsonParserGeneric.prototype.endParsing = function()
{
	this.m_escapedString = oFF.XObjectExt.release(this.m_escapedString);
	if (this.m_currentStackIndex === -1)
	{
		return true;
	}
	this.addParserError(oFF.JsonParserErrorCode.JSON_PARSER_ILLEGAL_STATE, "Json does not close correctly");
	return false;
};
oFF.JsonParserGeneric.prototype.runWalker = function()
{
	var len = oFF.XString.size(this.m_source);
	var c;
	var isValid = true;
	for (var pos = 0; pos < len && isValid; )
	{
		c = oFF.XString.getCharAt(this.m_source, pos);
		if (pos === 0 && c === 65279)
		{
			pos++;
		}
		else
		{
			isValid = this.parseSingleCharacter(c, pos);
			pos++;
		}
	}
	if (isValid)
	{
		this.endParsing();
	}
	return isValid;
};
oFF.JsonParserGeneric.prototype.unicode4 = function(pos)
{
	var value = oFF.XString.substring(this.m_source, pos - 3, pos + 1);
	try
	{
		var intValue = oFF.XInteger.convertFromStringWithRadix(value, 16);
		this.m_escapedString.appendChar(intValue);
	}
	catch (nfe3)
	{
		this.addParserError(oFF.JsonParserErrorCode.JSON_PARSER_ILLEGAL_STATE, oFF.XException.getStackTrace(nfe3, 0));
		return false;
	}
	this.m_isInsideUnicode = false;
	this.m_isInsideEscape = false;
	this.m_stringStartPos = pos + 1;
	return true;
};
oFF.JsonParserGeneric.prototype.escapedString = function(c, pos)
{
	if (c === 114)
	{
		this.m_escapedString.append("\r");
	}
	else if (c === 110)
	{
		this.m_escapedString.append("\n");
	}
	else if (c === 116)
	{
		this.m_escapedString.append("\t");
	}
	else if (c === 102)
	{
		this.m_escapedString.append("\f");
	}
	else if (c === 98)
	{
		this.m_escapedString.append("\b");
	}
	else if (c === 34)
	{
		this.m_escapedString.append("\"");
	}
	else if (c === 92)
	{
		this.m_escapedString.append("\\");
	}
	else if (c === 47)
	{
		this.m_escapedString.append("/");
	}
	else
	{
		this.addParserError(oFF.JsonParserErrorCode.JSON_PARSER_ILLEGAL_STATE, "Parser Error");
		return false;
	}
	this.m_isInsideEscape = false;
	this.m_stringStartPos = pos + 1;
	return true;
};
oFF.JsonParserGeneric.prototype.parseSingleCharacter = function(c, pos)
{
	var value;
	var placeHolder = true;
	this.m_pos = pos;
	var shouldContinue = true;
	while (shouldContinue)
	{
		if (this.m_isInsideString)
		{
			if (this.m_isInsideEscape)
			{
				if (this.m_isInsideUnicode)
				{
					this.m_unicodePos++;
					if (this.m_unicodePos === 4)
					{
						if (this.unicode4(pos) === false)
						{
							return false;
						}
					}
				}
				else
				{
					if (c === 117)
					{
						this.m_isInsideUnicode = true;
						this.m_unicodePos = 0;
					}
					else
					{
						if (this.escapedString(c, pos) === false)
						{
							return false;
						}
					}
				}
			}
			else
			{
				if (c === this.m_stringDelimiter)
				{
					if (this.insideString(pos) === false)
					{
						return false;
					}
				}
				else if (c === 92)
				{
					this.enterEscapedString(pos);
				}
			}
		}
		else if (this.m_isInsideNumber)
		{
			if (c >= 48 && c <= 57 || c === 43 || c === 45)
			{
				placeHolder = true;
			}
			else if (c === 46 || c === 101 || c === 69)
			{
				this.m_isInsideDoubleNumber = true;
			}
			else
			{
				value = oFF.XString.substring(this.m_source, this.m_numberStartPos, pos);
				if (this.m_isInsideDoubleNumber)
				{
					if (this.insideDouble(value) === false)
					{
						return false;
					}
				}
				else
				{
					if (this.insideInt(value) === false)
					{
						return false;
					}
				}
				this.m_isInsideNumber = false;
				this.m_isInsideDoubleNumber = false;
				if (this.leaveNumber() === false)
				{
					return false;
				}
				continue;
			}
		}
		else if (this.m_isInsideVariable)
		{
			if (c === 58 || c === 123 || c === 125 || c === 91 || c === 93 || c === 44 || c === 9 || c === 13 || c === 10 || c === 32)
			{
				value = oFF.XString.substring(this.m_source, this.m_stringStartPos, pos);
				if (this.setVariable(value) === false)
				{
					return false;
				}
				this.m_isInsideVariable = false;
				continue;
			}
		}
		else
		{
			if (c >= 48 && c <= 57 || c === 45)
			{
				if (this.enterNumber() === false)
				{
					return false;
				}
				this.m_isInsideNumber = true;
				this.m_numberStartPos = pos;
			}
			else if (c === 46)
			{
				if (this.enterNumber() === false)
				{
					return false;
				}
				this.m_isInsideNumber = true;
				this.m_isInsideDoubleNumber = true;
				this.m_numberStartPos = pos;
			}
			else if (c === 123)
			{
				if (this.enterStructure() === false)
				{
					return false;
				}
				this.m_structureDepth++;
			}
			else if (c === 125)
			{
				if (this.leaveStructure() === false)
				{
					return false;
				}
				this.m_structureDepth--;
			}
			else if (c === 91)
			{
				if (this.enterArray() === false)
				{
					return false;
				}
			}
			else if (c === 93)
			{
				if (this.leaveArray() === false)
				{
					return false;
				}
			}
			else if (c === 58)
			{
				if (this.enterValueZone() === false)
				{
					return false;
				}
			}
			else if (c === 44)
			{
				if (this.nextItem() === false)
				{
					return false;
				}
			}
			else if (c === 32 || c === 9 || c === 10 || c === 13)
			{
				placeHolder = true;
			}
			else if (c === this.m_stringDelimiter)
			{
				this.m_isInsideString = true;
				this.m_stringStartPos = pos + 1;
			}
			else
			{
				this.m_isInsideVariable = true;
				this.m_stringStartPos = pos;
			}
		}
		break;
	}
	return placeHolder;
};
oFF.JsonParserGeneric.prototype.enterEscapedString = function(pos)
{
	this.m_isInsideEscape = true;
	if (oFF.isNull(this.m_escapedString))
	{
		this.m_escapedString = oFF.XStringBuffer.create();
	}
	var value = oFF.XString.substring(this.m_source, this.m_stringStartPos, pos);
	this.m_escapedString.append(value);
};
oFF.JsonParserGeneric.prototype.insideInt = function(value)
{
	try
	{
		var isInt = true;
		var leni = oFF.XString.size(value);
		var minus = oFF.XString.getCharAt(value, 0);
		if (minus === 45)
		{
			isInt = leni <= 10;
		}
		else
		{
			isInt = leni <= 9;
		}
		if (isInt)
		{
			var intValue = oFF.XInteger.convertFromString(value);
			if (this.setInteger(intValue) === false)
			{
				return false;
			}
		}
		else
		{
			var longValue = oFF.XLong.convertFromString(value);
			if (this.setLong(longValue) === false)
			{
				return false;
			}
		}
	}
	catch (nfe2)
	{
		this.addParserError(oFF.JsonParserErrorCode.JSON_PARSER_ILLEGAL_STATE, oFF.XException.getStackTrace(nfe2, 0));
		return false;
	}
	return true;
};
oFF.JsonParserGeneric.prototype.insideDouble = function(value)
{
	try
	{
		var doubleValue = oFF.XDouble.convertFromString(value);
		if (!this.setDouble(doubleValue))
		{
			return false;
		}
	}
	catch (nfe)
	{
		this.addParserError(oFF.JsonParserErrorCode.JSON_PARSER_ILLEGAL_STATE, oFF.XException.getStackTrace(nfe, 0));
		return false;
	}
	return true;
};
oFF.JsonParserGeneric.prototype.insideString = function(pos)
{
	var value = oFF.XString.substring(this.m_source, this.m_stringStartPos, pos);
	if (oFF.notNull(this.m_escapedString))
	{
		this.m_escapedString.append(value);
		value = this.m_escapedString.toString();
		this.m_escapedString = oFF.XObjectExt.release(this.m_escapedString);
	}
	if (!this.setString(value))
	{
		return false;
	}
	if (!this.leaveString())
	{
		return false;
	}
	this.m_isInsideString = false;
	return true;
};
oFF.JsonParserGeneric.prototype.addParserError = function(code, message)
{
	var start = this.m_pos - 10;
	if (start < 0)
	{
		start = 0;
	}
	var end = this.m_pos + 10;
	if (end > oFF.XString.size(this.m_source))
	{
		end = oFF.XString.size(this.m_source);
	}
	var errorValue = oFF.XString.substring(this.m_source, start, end);
	var buffer = oFF.XStringBuffer.create();
	buffer.append("Json Parser Error at position ");
	buffer.appendInt(this.m_pos).append(": ").appendLine(message);
	buffer.append("...").append(errorValue).append("...");
	var messageExt = buffer.toString();
	return oFF.DfDocumentParser.prototype.addErrorExt.call( this , oFF.OriginLayer.IOLAYER, code, messageExt, null);
};
oFF.JsonParserGeneric.prototype.raiseError = function(errorText)
{
	this.addParserError(oFF.JsonParserErrorCode.JSON_PARSER_ILLEGAL_STATE, errorText);
};
oFF.JsonParserGeneric.prototype.isEmbeddedParsingFinished = function()
{
	return this.m_structureDepth === 0;
};

oFF.PrElementType = function() {};
oFF.PrElementType.prototype = new oFF.XConstant();
oFF.PrElementType.prototype._ff_c = "PrElementType";

oFF.PrElementType.STRUCTURE = null;
oFF.PrElementType.LIST = null;
oFF.PrElementType.STRING = null;
oFF.PrElementType.INTEGER = null;
oFF.PrElementType.LONG = null;
oFF.PrElementType.DOUBLE = null;
oFF.PrElementType.BOOLEAN = null;
oFF.PrElementType.OBJECT = null;
oFF.PrElementType.THE_NULL = null;
oFF.PrElementType.ANY = null;
oFF.PrElementType.create = function(name, isNumber)
{
	var newConstant = new oFF.PrElementType();
	newConstant._setupInternal(name);
	newConstant.m_isNumber = isNumber;
	return newConstant;
};
oFF.PrElementType.staticSetup = function()
{
	oFF.PrElementType.STRUCTURE = oFF.PrElementType.create("Structure", false);
	oFF.PrElementType.LIST = oFF.PrElementType.create("List", false);
	oFF.PrElementType.STRING = oFF.PrElementType.create("String", false);
	oFF.PrElementType.INTEGER = oFF.PrElementType.create("Integer", true);
	oFF.PrElementType.LONG = oFF.PrElementType.create("Long", true);
	oFF.PrElementType.DOUBLE = oFF.PrElementType.create("Double", true);
	oFF.PrElementType.BOOLEAN = oFF.PrElementType.create("Boolean", false);
	oFF.PrElementType.OBJECT = oFF.PrElementType.create("Object", false);
	oFF.PrElementType.THE_NULL = oFF.PrElementType.create("Null", false);
	oFF.PrElementType.ANY = oFF.PrElementType.create("Any", false);
};
oFF.PrElementType.prototype.m_isNumber = false;
oFF.PrElementType.prototype.isNumber = function()
{
	return this.m_isNumber;
};

oFF.PrBoolean = function() {};
oFF.PrBoolean.prototype = new oFF.PrElement();
oFF.PrBoolean.prototype._ff_c = "PrBoolean";

oFF.PrBoolean.TRUE = null;
oFF.PrBoolean.FALSE = null;
oFF.PrBoolean.createWithValue = function(value)
{
	return value ? oFF.PrBoolean.TRUE : oFF.PrBoolean.FALSE;
};
oFF.PrBoolean.staticSetup = function()
{
	oFF.PrBoolean.TRUE = new oFF.PrBoolean();
	oFF.PrBoolean.TRUE.m_value = true;
	oFF.PrBoolean.FALSE = new oFF.PrBoolean();
	oFF.PrBoolean.FALSE.m_value = false;
};
oFF.PrBoolean.prototype.m_value = false;
oFF.PrBoolean.prototype.getPermaCopy = function()
{
	return oFF.PrBoolean.createWithValue(this.m_value);
};
oFF.PrBoolean.prototype.getBoolean = function()
{
	return this.m_value;
};
oFF.PrBoolean.prototype.getType = function()
{
	return oFF.PrElementType.BOOLEAN;
};
oFF.PrBoolean.prototype.asBoolean = function()
{
	return this;
};
oFF.PrBoolean.prototype.asString = function()
{
	return oFF.PrFactory.createString(oFF.XBoolean.convertToString(this.m_value));
};

oFF.PrObject = function() {};
oFF.PrObject.prototype = new oFF.PrElement();
oFF.PrObject.prototype._ff_c = "PrObject";

oFF.PrObject.create = function()
{
	return new oFF.PrObject();
};
oFF.PrObject.prototype.m_value = null;
oFF.PrObject.prototype.releaseObject = function()
{
	this.m_value = null;
	oFF.PrElement.prototype.releaseObject.call( this );
};
oFF.PrObject.prototype.getObject = function()
{
	return this.m_value;
};
oFF.PrObject.prototype.getObjectValue = function()
{
	return this.getObject();
};
oFF.PrObject.prototype.setObject = function(value)
{
	this.m_value = value;
};
oFF.PrObject.prototype.getType = function()
{
	return oFF.PrElementType.OBJECT;
};
oFF.PrObject.prototype.asObject = function()
{
	return this;
};

oFF.PrString = function() {};
oFF.PrString.prototype = new oFF.PrElement();
oFF.PrString.prototype._ff_c = "PrString";

oFF.PrString.EMPTY = null;
oFF.PrString.createWithValue = function(value)
{
	if (oFF.isNull(value))
	{
		return null;
	}
	if (oFF.XString.size(value) === 0)
	{
		return oFF.PrString.EMPTY;
	}
	var newObj = new oFF.PrString();
	newObj.m_value = value;
	return newObj;
};
oFF.PrString.staticSetup = function()
{
	oFF.PrString.EMPTY = new oFF.PrString();
	oFF.PrString.EMPTY.m_value = "";
};
oFF.PrString.prototype.m_value = null;
oFF.PrString.prototype.getPermaCopy = function()
{
	return oFF.PrString.createWithValue(this.m_value);
};
oFF.PrString.prototype.releaseObject = function()
{
	this.m_value = null;
	oFF.PrElement.prototype.releaseObject.call( this );
};
oFF.PrString.prototype.getType = function()
{
	return oFF.PrElementType.STRING;
};
oFF.PrString.prototype.getString = function()
{
	return this.m_value;
};
oFF.PrString.prototype.asString = function()
{
	return this;
};

oFF.XmlParser = function() {};
oFF.XmlParser.prototype = new oFF.DfDocumentParser();
oFF.XmlParser.prototype._ff_c = "XmlParser";

oFF.XmlParser.SLASH = 47;
oFF.XmlParser.create = function()
{
	var xmlParser = new oFF.XmlParser();
	xmlParser.setup();
	return xmlParser;
};
oFF.XmlParser.prototype.parse = function(content)
{
	this.clearMessages();
	var xmlContent = oFF.XString.trim(content);
	if (oFF.XString.size(xmlContent) === 0)
	{
		this.addErrorExt(oFF.OriginLayer.PROTOCOL, oFF.ErrorCodes.PARSER_ERROR, "The XML content is empty.", oFF.XStringValue.create(xmlContent));
		return oFF.PrFactory.createStructure();
	}
	return this.parseInternal(xmlContent);
};
oFF.XmlParser.prototype.getClosingTag = function(tagName)
{
	return oFF.XStringUtils.concatenate3("</", tagName, ">");
};
oFF.XmlParser.prototype.getTagName = function(completeTag)
{
	var posFirstSpace = oFF.XString.indexOf(completeTag, " ");
	return oFF.XString.substring(completeTag, 0, posFirstSpace);
};
oFF.XmlParser.prototype.getAttributes = function(completeTag)
{
	var posFirstSpace = oFF.XString.indexOf(completeTag, " ");
	if (posFirstSpace === -1)
	{
		return "";
	}
	var attributes = oFF.XString.substring(completeTag, posFirstSpace, -1);
	if (oFF.XString.endsWith(attributes, "/"))
	{
		return oFF.XStringUtils.stripRight(attributes, 1);
	}
	return attributes;
};
oFF.XmlParser.prototype.handleAttributes = function(currentElement, attributes)
{
	if (currentElement.isList())
	{
		return;
	}
	var currentStructure = currentElement;
	var sizeAttributes = oFF.XString.size(attributes);
	var posAttr = 0;
	while (posAttr < sizeAttributes)
	{
		var posAssign = oFF.XString.indexOfFrom(attributes, "=", posAttr);
		if (posAssign === -1)
		{
			break;
		}
		var posEndAttributeValue;
		var quotationChar = oFF.XString.getCharAt(attributes, posAssign + 1);
		if (quotationChar === 34)
		{
			posEndAttributeValue = oFF.XString.indexOfFrom(attributes, "\"", posAssign + 2);
		}
		else
		{
			posEndAttributeValue = oFF.XString.indexOfFrom(attributes, "'", posAssign + 2);
		}
		var isLastAttribute = oFF.XString.indexOfFrom(attributes, " ", posAssign) === -1;
		var attributeValue;
		if (isLastAttribute)
		{
			attributeValue = oFF.XString.substring(attributes, posAssign + 1, sizeAttributes);
		}
		else
		{
			attributeValue = oFF.XString.substring(attributes, posAssign + 1, posEndAttributeValue + 1);
		}
		var attributeName = oFF.XStringUtils.concatenate2("-", oFF.XString.trim(oFF.XString.substring(attributes, posAttr, posAssign)));
		currentStructure.putString(attributeName, oFF.XStringUtils.stripChars(attributeValue, 1));
		if (isLastAttribute)
		{
			break;
		}
		posAttr = posEndAttributeValue + 1;
	}
};
oFF.XmlParser.prototype.handleContent = function(currentElement, tagContent, tagName)
{
	if (currentElement.isList())
	{
		var currentList = currentElement;
		currentList.addString(tagContent);
		return;
	}
	var currentStructure = currentElement;
	var closingTag = this.getClosingTag(tagName);
	if (oFF.XString.endsWith(tagContent, closingTag))
	{
		currentStructure.putString(tagName, oFF.XStringUtils.stripRight(tagContent, oFF.XString.size(closingTag)));
	}
	else
	{
		currentStructure.putString(tagName, tagContent);
	}
};
oFF.XmlParser.prototype.pop = function(path)
{
	return path.removeAt(path.size() - 1);
};
oFF.XmlParser.prototype.peek = function(path)
{
	if (path.isEmpty())
	{
		return null;
	}
	return path.get(path.size() - 1);
};
oFF.XmlParser.prototype.navigateToParent = function(xmlRoot, path)
{
	var parent = xmlRoot;
	for (var i = 0; i < path.size(); i++)
	{
		if (parent.isStructure())
		{
			parent = parent.getByKey(path.get(i));
			if (parent.isList())
			{
				var parentList = parent.asList();
				parent = parentList.getStructureAt(parentList.size() - 1);
			}
		}
	}
	return parent;
};
oFF.XmlParser.prototype.skipTag = function(xmlContent, startCurrentTag)
{
	var firstChar = oFF.XString.getCharAt(xmlContent, startCurrentTag + 1);
	return firstChar === 33 || firstChar === 63;
};
oFF.XmlParser.prototype.parseInternal = function(xmlContent)
{
	this.addProfileStep("Parse XML");
	var xmlRoot = oFF.PrFactory.createStructure();
	var currentElement = xmlRoot;
	var currentList;
	var pathToCurrentElement = oFF.XListOfString.create();
	var pos = 0;
	var sizeXml = oFF.XString.size(xmlContent);
	while (pos < sizeXml)
	{
		var startCurrentTag = oFF.XString.indexOfFrom(xmlContent, "<", pos);
		if (startCurrentTag === -1)
		{
			break;
		}
		var endOpeningCurrentTag = oFF.XString.indexOfFrom(xmlContent, ">", startCurrentTag);
		if (this.skipTag(xmlContent, startCurrentTag))
		{
			pos = endOpeningCurrentTag + 1;
			continue;
		}
		var currentCompleteTag = oFF.XString.substring(xmlContent, startCurrentTag + 1, endOpeningCurrentTag);
		var currentTagName = this.getTagName(currentCompleteTag);
		var isCurrentTagClosing = oFF.XString.getCharAt(currentTagName, 0) === oFF.XmlParser.SLASH;
		if (isCurrentTagClosing)
		{
			if (!oFF.XString.endsWith(currentTagName, this.peek(pathToCurrentElement)))
			{
				this.addErrorExt(oFF.OriginLayer.IOLAYER, oFF.ErrorCodes.PARSER_ERROR, oFF.XStringUtils.concatenate3("The tag '", currentTagName, "' is not opened properly."), oFF.XStringValue.create(xmlContent));
				break;
			}
			this.pop(pathToCurrentElement);
			currentElement = this.navigateToParent(xmlRoot, pathToCurrentElement);
			pos = endOpeningCurrentTag + 1;
			continue;
		}
		var currentAttributes = this.getAttributes(currentCompleteTag);
		var hasCurrentTagAttributes = oFF.XStringUtils.isNotNullAndNotEmpty(currentAttributes);
		var currentClosingTag = this.getClosingTag(currentTagName);
		var isCurrentTagSelfClosing = oFF.XString.getCharAt(currentCompleteTag, oFF.XString.size(currentCompleteTag) - 1) === oFF.XmlParser.SLASH;
		var endCurrentTag = oFF.XString.indexOfFrom(xmlContent, currentClosingTag, endOpeningCurrentTag);
		if (isCurrentTagSelfClosing && oFF.notNull(currentElement))
		{
			if (!hasCurrentTagAttributes)
			{
				if (xmlRoot.isEmpty() && currentElement.isStructure())
				{
					currentElement.asStructure().putNull(oFF.XStringUtils.stripRight(currentTagName, 1));
				}
				if (currentElement.isList())
				{
					currentElement.addNewStructure();
				}
				pos = endOpeningCurrentTag + 1;
				continue;
			}
		}
		else if (oFF.XString.indexOf(xmlContent, currentClosingTag) === -1)
		{
			this.addErrorExt(oFF.OriginLayer.IOLAYER, oFF.ErrorCodes.PARSER_ERROR, oFF.XStringUtils.concatenate3("The tag '", currentTagName, "' is not closed properly."), oFF.XStringValue.create(xmlContent));
			break;
		}
		var content = "";
		if (!isCurrentTagSelfClosing)
		{
			content = this.getContent(xmlContent, endOpeningCurrentTag, endCurrentTag);
		}
		var isContentEmpty = oFF.XString.isEqual(content, "");
		var isCurrentTagNested = !isContentEmpty && oFF.XString.getCharAt(content, 0) === 60;
		currentList = this.getListForElement(currentElement, currentTagName);
		if (oFF.notNull(currentList))
		{
			currentElement = currentList;
			if (hasCurrentTagAttributes || isContentEmpty || isCurrentTagNested)
			{
				currentElement = currentList.addNewStructure();
			}
		}
		else if (oFF.notNull(currentElement))
		{
			if (hasCurrentTagAttributes || isCurrentTagNested)
			{
				currentElement = currentElement.putNewStructure(currentTagName);
			}
		}
		if (!isContentEmpty && !isCurrentTagNested && !isCurrentTagSelfClosing && oFF.notNull(currentElement))
		{
			this.handleContent(currentElement, content, currentTagName);
		}
		if (hasCurrentTagAttributes && oFF.notNull(currentElement))
		{
			this.handleAttributes(currentElement, currentAttributes);
		}
		if (isCurrentTagSelfClosing)
		{
			currentElement = this.navigateToParent(xmlRoot, pathToCurrentElement);
		}
		else
		{
			pathToCurrentElement.add(currentTagName);
		}
		pos = endOpeningCurrentTag;
	}
	oFF.XObjectExt.release(pathToCurrentElement);
	this.endProfileStep();
	if (this.hasErrors())
	{
		return oFF.PrFactory.createStructure();
	}
	if (!xmlRoot.hasElements())
	{
		this.addErrorExt(oFF.OriginLayer.IOLAYER, oFF.ErrorCodes.PARSER_ERROR, "The XML contains no tags.", oFF.XStringValue.create(xmlContent));
	}
	return xmlRoot;
};
oFF.XmlParser.prototype.getListForElement = function(currentElement, currentTagName)
{
	if (oFF.notNull(currentElement) && currentElement.isStructure() && currentElement.asStructure().containsKey(currentTagName))
	{
		var currentStructure = currentElement.asStructure();
		var existingElement = currentStructure.getByKey(currentTagName);
		var list = oFF.PrUtils.convertToList(existingElement);
		currentStructure.put(currentTagName, list);
		return list;
	}
	return null;
};
oFF.XmlParser.prototype.getContent = function(xmlContent, endOpeningCurrentTag, endCurrentTag)
{
	if (endCurrentTag === -1)
	{
		return oFF.XString.trim(oFF.XString.substring(xmlContent, endOpeningCurrentTag + 1, -1));
	}
	return oFF.XString.trim(oFF.XString.substring(xmlContent, endOpeningCurrentTag + 1, endCurrentTag));
};

oFF.PrDouble = function() {};
oFF.PrDouble.prototype = new oFF.PrElement();
oFF.PrDouble.prototype._ff_c = "PrDouble";

oFF.PrDouble.ZERO = null;
oFF.PrDouble.staticSetup = function()
{
	oFF.PrDouble.ZERO = new oFF.PrDouble();
	oFF.PrDouble.ZERO.m_value = 0;
};
oFF.PrDouble.createWithValue = function(value)
{
	if (value === 0)
	{
		return oFF.PrDouble.ZERO;
	}
	var proxy = new oFF.PrDouble();
	proxy.m_value = value;
	return proxy;
};
oFF.PrDouble.prototype.m_value = 0.0;
oFF.PrDouble.prototype.getPermaCopy = function()
{
	return oFF.PrDouble.createWithValue(this.m_value);
};
oFF.PrDouble.prototype.getType = function()
{
	return oFF.PrElementType.DOUBLE;
};
oFF.PrDouble.prototype.getInteger = function()
{
	return oFF.XDouble.convertToInt(this.m_value);
};
oFF.PrDouble.prototype.getLong = function()
{
	return oFF.XDouble.convertToLong(this.m_value);
};
oFF.PrDouble.prototype.asNumber = function()
{
	return this;
};
oFF.PrDouble.prototype.asDouble = function()
{
	return this;
};
oFF.PrDouble.prototype.getDouble = function()
{
	return this.m_value;
};
oFF.PrDouble.prototype.asString = function()
{
	return oFF.PrString.createWithValue(oFF.XDouble.convertToString(this.m_value));
};

oFF.PrInteger = function() {};
oFF.PrInteger.prototype = new oFF.PrElement();
oFF.PrInteger.prototype._ff_c = "PrInteger";

oFF.PrInteger.ints = null;
oFF.PrInteger.staticSetup = function()
{
	oFF.PrInteger.ints = oFF.XArray.create(128);
	for (var i = -63; i < 64; i++)
	{
		var prInteger = new oFF.PrInteger();
		prInteger.m_value = i;
		oFF.PrInteger.ints.set(i + 63, prInteger);
	}
};
oFF.PrInteger.createWithValue = function(value)
{
	if (value >= -63 && value < 64)
	{
		return oFF.PrInteger.ints.get(value + 63);
	}
	var proxy = new oFF.PrInteger();
	proxy.m_value = value;
	return proxy;
};
oFF.PrInteger.prototype.m_value = 0;
oFF.PrInteger.prototype.getPermaCopy = function()
{
	return oFF.PrInteger.createWithValue(this.m_value);
};
oFF.PrInteger.prototype.getType = function()
{
	return oFF.PrElementType.INTEGER;
};
oFF.PrInteger.prototype.getInteger = function()
{
	return this.m_value;
};
oFF.PrInteger.prototype.getLong = function()
{
	return this.m_value;
};
oFF.PrInteger.prototype.asNumber = function()
{
	return this;
};
oFF.PrInteger.prototype.asInteger = function()
{
	return this;
};
oFF.PrInteger.prototype.getDouble = function()
{
	return this.m_value;
};
oFF.PrInteger.prototype.asString = function()
{
	return oFF.PrString.createWithValue(oFF.XInteger.convertToString(this.m_value));
};

oFF.PrLong = function() {};
oFF.PrLong.prototype = new oFF.PrElement();
oFF.PrLong.prototype._ff_c = "PrLong";

oFF.PrLong.create = function()
{
	return new oFF.PrLong();
};
oFF.PrLong.createWithValue = function(value)
{
	var newObj = new oFF.PrLong();
	newObj.m_value = value;
	return newObj;
};
oFF.PrLong.prototype.m_value = 0;
oFF.PrLong.prototype.getPermaCopy = function()
{
	return oFF.PrLong.createWithValue(this.m_value);
};
oFF.PrLong.prototype.getType = function()
{
	return oFF.PrElementType.LONG;
};
oFF.PrLong.prototype.getInteger = function()
{
	return oFF.XInteger.convertFromStringWithDefault(oFF.XLong.convertToString(this.m_value), 0);
};
oFF.PrLong.prototype.setLong = function(value)
{
	this.m_value = value;
};
oFF.PrLong.prototype.asNumber = function()
{
	return this;
};
oFF.PrLong.prototype.getDouble = function()
{
	return this.m_value;
};
oFF.PrLong.prototype.asLong = function()
{
	return this;
};
oFF.PrLong.prototype.getLong = function()
{
	return this.m_value;
};

oFF.XProperties = function() {};
oFF.XProperties.prototype = new oFF.DfAbstractMapOfStringByString();
oFF.XProperties.prototype._ff_c = "XProperties";

oFF.XProperties.create = function()
{
	var properties = new oFF.XProperties();
	properties.setupExt(null, null);
	return properties;
};
oFF.XProperties.createWithParent = function(parent)
{
	var properties = new oFF.XProperties();
	properties.setupExt(null, parent);
	return properties;
};
oFF.XProperties.createByMapCopy = function(origin)
{
	var properties = new oFF.XProperties();
	properties.setupExt(origin, null);
	return properties;
};
oFF.XProperties.prototype.m_storage = null;
oFF.XProperties.prototype.m_parent = null;
oFF.XProperties.prototype.m_isParentEnabled = false;
oFF.XProperties.prototype.setupExt = function(origin, parent)
{
	if (oFF.isNull(origin))
	{
		this.m_storage = oFF.XHashMapOfStringByString.create();
	}
	else
	{
		this.m_storage = oFF.XHashMapOfStringByString.createMapOfStringByStringStaticCopy(origin);
	}
	this.setParent(parent);
};
oFF.XProperties.prototype.releaseObject = function()
{
	this.m_storage = oFF.XObjectExt.release(this.m_storage);
	this.m_parent = null;
	oFF.DfAbstractMapOfStringByString.prototype.releaseObject.call( this );
};
oFF.XProperties.prototype.getComponentType = function()
{
	return this.getValueType();
};
oFF.XProperties.prototype.getValueType = function()
{
	return oFF.XValueType.PROPERTIES;
};
oFF.XProperties.prototype.cloneExt = function(flags)
{
	var target = oFF.XProperties.createByMapCopy(this);
	if (oFF.notNull(this.m_parent))
	{
		this.setParent(this.m_parent);
		this.setEnableParentProperties(this.m_isParentEnabled);
	}
	return target;
};
oFF.XProperties.prototype.createMapOfStringByStringCopy = function()
{
	var copy;
	if (this.m_isParentEnabled === true)
	{
		var keys = this.getKeysAsReadOnlyListOfString();
		copy = oFF.XHashMapOfStringByString.create();
		for (var i = 0; i < keys.size(); i++)
		{
			var key = keys.get(i);
			var value = this.getByKey(key);
			copy.put(key, value);
		}
	}
	else
	{
		copy = this.m_storage.createMapOfStringByStringCopy();
	}
	return copy;
};
oFF.XProperties.prototype.put = function(key, element)
{
	if (oFF.isNull(element))
	{
		this.m_storage.remove(key);
	}
	else
	{
		this.m_storage.put(key, element);
	}
};
oFF.XProperties.prototype.remove = function(key)
{
	return this.m_storage.remove(key);
};
oFF.XProperties.prototype.getKeysAsReadOnlyListOfString = function()
{
	var keys;
	keys = this.m_storage.getKeysAsReadOnlyListOfString();
	if (this.m_isParentEnabled === true)
	{
		var combinedList = oFF.XHashSetOfString.create();
		combinedList.addAll(keys);
		var parentList = this.m_parent.getKeysAsReadOnlyListOfString();
		combinedList.addAll(parentList);
		keys = combinedList.getValuesAsReadOnlyListOfString();
	}
	return keys;
};
oFF.XProperties.prototype.getValuesAsReadOnlyListOfString = function()
{
	var values;
	if (this.m_isParentEnabled === true)
	{
		var keys = this.getKeysAsReadOnlyListOfString();
		var target = oFF.XListOfString.create();
		for (var i = 0; i < keys.size(); i++)
		{
			var key = keys.get(i);
			var value = this.getByKey(key);
			target.add(value);
		}
		target.sortByDirection(oFF.XSortDirection.ASCENDING);
		values = target;
	}
	else
	{
		values = this.m_storage.getValuesAsReadOnlyListOfString();
	}
	return values;
};
oFF.XProperties.prototype.clear = function()
{
	this.m_storage.clear();
};
oFF.XProperties.prototype.size = function()
{
	var size;
	if (this.m_isParentEnabled === true)
	{
		size = this.getKeysAsReadOnlyListOfString().size();
	}
	else
	{
		size = this.m_storage.size();
	}
	return size;
};
oFF.XProperties.prototype.hasElements = function()
{
	var hasElements = this.m_storage.hasElements();
	if (hasElements === false && this.m_isParentEnabled === true)
	{
		hasElements = this.m_parent.hasElements();
	}
	return hasElements;
};
oFF.XProperties.prototype.contains = function(element)
{
	var contains = this.m_storage.contains(element);
	if (contains === false && this.m_isParentEnabled === true)
	{
		contains = this.m_parent.contains(element);
	}
	return contains;
};
oFF.XProperties.prototype.isValueDefault = function(key)
{
	return !this.isValueDefined(key);
};
oFF.XProperties.prototype.isValueDefined = function(key)
{
	return this.m_storage.containsKey(key);
};
oFF.XProperties.prototype.containsKey = function(key)
{
	var hasKey = this.m_storage.containsKey(key);
	if (hasKey === false && this.m_isParentEnabled === true)
	{
		hasKey = this.m_parent.containsKey(key);
	}
	return hasKey;
};
oFF.XProperties.prototype.assertNameAndGet = function(name)
{
	var value = this.getByKey(name);
	oFF.XStringUtils.checkStringNotEmpty(value, oFF.XStringUtils.concatenate2("Property cannot be found: ", name));
	return value;
};
oFF.XProperties.prototype.getByKey = function(key)
{
	var value = this.m_storage.getByKey(key);
	if (oFF.isNull(value) && this.m_isParentEnabled === true)
	{
		value = this.m_parent.getByKey(key);
	}
	return value;
};
oFF.XProperties.prototype.getIntegerByKey = function(name)
{
	return oFF.XInteger.convertFromStringWithRadix(this.assertNameAndGet(name), 10);
};
oFF.XProperties.prototype.getIntegerByKeyExt = function(name, defaultValue)
{
	var value = this.getByKey(name);
	return oFF.isNull(value) ? defaultValue : oFF.XInteger.convertFromStringWithDefault(value, defaultValue);
};
oFF.XProperties.prototype.putInteger = function(name, intValue)
{
	this.put(name, oFF.XInteger.convertToString(intValue));
};
oFF.XProperties.prototype.getLongByKey = function(name)
{
	return oFF.XLong.convertFromString(this.assertNameAndGet(name));
};
oFF.XProperties.prototype.getLongByKeyExt = function(name, defaultValue)
{
	var value = this.getByKey(name);
	return oFF.isNull(value) ? defaultValue : oFF.XLong.convertFromStringWithDefault(value, defaultValue);
};
oFF.XProperties.prototype.putLong = function(name, longValue)
{
	this.put(name, oFF.XLong.convertToString(longValue));
};
oFF.XProperties.prototype.getDoubleByKey = function(name)
{
	return oFF.XDouble.convertFromString(this.assertNameAndGet(name));
};
oFF.XProperties.prototype.getDoubleByKeyExt = function(name, defaultValue)
{
	var value = this.getByKey(name);
	return oFF.isNull(value) ? defaultValue : oFF.XDouble.convertFromStringWithDefault(value, defaultValue);
};
oFF.XProperties.prototype.putDouble = function(name, doubleValue)
{
	this.put(name, oFF.XDouble.convertToString(doubleValue));
};
oFF.XProperties.prototype.getBooleanByKey = function(name)
{
	return oFF.XBoolean.convertFromString(this.assertNameAndGet(name));
};
oFF.XProperties.prototype.getBooleanByKeyExt = function(name, defaultValue)
{
	var value = this.getByKey(name);
	return oFF.isNull(value) ? defaultValue : oFF.XBoolean.convertFromStringWithDefault(value, defaultValue);
};
oFF.XProperties.prototype.putBoolean = function(key, booleanValue)
{
	this.put(key, oFF.XBoolean.convertToString(booleanValue));
};
oFF.XProperties.prototype.getStringByKey = function(name)
{
	return this.getByKey(name);
};
oFF.XProperties.prototype.getStringByKeyExt = function(name, defaultValue)
{
	var value = this.getByKey(name);
	if (oFF.isNull(value))
	{
		value = defaultValue;
	}
	return value;
};
oFF.XProperties.prototype.putStringNotNull = function(name, stringValue)
{
	if (oFF.notNull(stringValue))
	{
		this.m_storage.put(name, stringValue);
	}
};
oFF.XProperties.prototype.putStringNotNullAndNotEmpty = function(name, stringValue)
{
	if (oFF.XStringUtils.isNotNullAndNotEmpty(stringValue))
	{
		this.putString(name, stringValue);
	}
};
oFF.XProperties.prototype.putString = function(name, stringValue)
{
	if (oFF.isNull(stringValue))
	{
		this.m_storage.remove(name);
	}
	else
	{
		this.m_storage.put(name, stringValue);
	}
};
oFF.XProperties.prototype.putNull = function(name)
{
	this.m_storage.put(name, null);
};
oFF.XProperties.prototype.hasNullByKey = function(name)
{
	return this.containsKey(name) && this.getByKey(name) === null;
};
oFF.XProperties.prototype.serialize = function()
{
	var keys = oFF.XListOfString.create();
	keys.addAll(this.getKeysAsReadOnlyListOfString());
	keys.sortByDirection(oFF.XSortDirection.ASCENDING);
	var buffer = oFF.XStringBuffer.create();
	for (var i = 0; i < keys.size(); i++)
	{
		var key = keys.get(i);
		var value = this.m_storage.getByKey(key);
		var unescapedProp = oFF.XStringUtils.concatenate3(key, "=", value);
		buffer.append(oFF.XStringUtils.escapeLineEndings(unescapedProp)).append("\n");
	}
	return buffer.toString();
};
oFF.XProperties.prototype.deserialize = function(content)
{
	var lines = oFF.XStringTokenizer.splitString(content, "\n");
	if (oFF.notNull(lines))
	{
		for (var i = 0; i < lines.size(); i++)
		{
			var escapedLine = lines.get(i);
			var currentLine = oFF.XStringUtils.unescapeLineEndings(escapedLine);
			if (oFF.XStringUtils.isNotNullAndNotEmpty(currentLine))
			{
				if (!oFF.XString.startsWith(currentLine, "#"))
				{
					var index = oFF.XString.indexOf(currentLine, "=");
					if (index !== -1)
					{
						var value = oFF.XString.substring(currentLine, index + 1, -1);
						var name = oFF.XString.trim(oFF.XString.substring(currentLine, 0, index));
						this.put(name, value);
					}
				}
			}
		}
	}
};
oFF.XProperties.prototype.getParent = function()
{
	return this.m_parent;
};
oFF.XProperties.prototype.setParent = function(parentProperties)
{
	this.m_parent = parentProperties;
	this.m_isParentEnabled = oFF.notNull(parentProperties);
};
oFF.XProperties.prototype.setEnableParentProperties = function(enableParentProperties)
{
	this.m_isParentEnabled = enableParentProperties && oFF.notNull(this.m_parent);
};
oFF.XProperties.prototype.isParentPropertiesEnabled = function()
{
	return this.m_isParentEnabled;
};
oFF.XProperties.prototype.getStringRepresentation = function()
{
	return this.toString();
};
oFF.XProperties.prototype.toString = function()
{
	return this.m_storage.toString();
};

oFF.DfPrProxyElement = function() {};
oFF.DfPrProxyElement.prototype = new oFF.PrElement();
oFF.DfPrProxyElement.prototype._ff_c = "DfPrProxyElement";

oFF.DfPrProxyElement.prototype.isProxy = function()
{
	return true;
};
oFF.DfPrProxyElement.prototype.getKeysAsIteratorOfString = function()
{
	return this.getKeysAsReadOnlyListOfString().getIterator();
};
oFF.DfPrProxyElement.prototype.isEmpty = function()
{
	return this.getKeysAsReadOnlyListOfString().size() === 0;
};
oFF.DfPrProxyElement.prototype.hasElements = function()
{
	return this.getKeysAsReadOnlyListOfString().size() > 0;
};
oFF.DfPrProxyElement.prototype.size = function()
{
	return this.getKeysAsReadOnlyListOfString().size();
};
oFF.DfPrProxyElement.prototype.putAll = function(other)
{
	oFF.XMapUtils.putAllObjects(other, this);
};
oFF.DfPrProxyElement.prototype.addAll = function(other)
{
	oFF.XListUtils.addAllObjects(other, this);
};
oFF.DfPrProxyElement.prototype.getIterator = function()
{
	return this.getValuesAsReadOnlyList().getIterator();
};
oFF.DfPrProxyElement.prototype.createArrayCopy = function()
{
	var theSize = this.size();
	var newArray = oFF.XArray.create(theSize);
	oFF.XArrayUtils.copyFromObjectArray(this, newArray, 0, 0, theSize);
	return newArray;
};
oFF.DfPrProxyElement.prototype.putIfNotNull = function(key, element)
{
	if (oFF.notNull(element))
	{
		this.put(key, element);
	}
};
oFF.DfPrProxyElement.prototype.createMapByStringCopy = function()
{
	var copy = oFF.XHashMapByString.create();
	copy.putAll(this);
	return copy;
};
oFF.DfPrProxyElement.prototype.hasNullByKey = function(name)
{
	return this.containsKey(name) && this.getByKey(name) === null;
};

oFF.PrList = function() {};
oFF.PrList.prototype = new oFF.PrElement();
oFF.PrList.prototype._ff_c = "PrList";

oFF.PrList.create = function()
{
	var list = new oFF.PrList();
	list.setup();
	return list;
};
oFF.PrList.createDeepCopy = function(origin)
{
	return oFF.PrUtils.createDeepCopyExt(origin, null);
};
oFF.PrList.prototype.m_list = null;
oFF.PrList.prototype.setup = function()
{
	this.m_list = oFF.XList.create();
};
oFF.PrList.prototype.releaseObject = function()
{
	this.m_list = oFF.XObjectExt.release(this.m_list);
	oFF.PrElement.prototype.releaseObject.call( this );
};
oFF.PrList.prototype.getType = function()
{
	return oFF.PrElementType.LIST;
};
oFF.PrList.prototype.getStructureAt = function(index)
{
	var element = this.m_list.get(index);
	if (oFF.isNull(element) || !element.isStructure())
	{
		return null;
	}
	return element;
};
oFF.PrList.prototype.getListAt = function(index)
{
	var element = this.m_list.get(index);
	if (oFF.isNull(element) || !element.isList())
	{
		return null;
	}
	return element;
};
oFF.PrList.prototype.get = function(index)
{
	var element = this.m_list.get(index);
	if (oFF.notNull(element) && element.getType() === oFF.PrElementType.THE_NULL)
	{
		return null;
	}
	return element;
};
oFF.PrList.prototype.getStringAt = function(index)
{
	var element = this.m_list.get(index);
	if (oFF.isNull(element) || !element.isString())
	{
		return null;
	}
	return element.getString();
};
oFF.PrList.prototype.getIntegerAt = function(index)
{
	var element = this.m_list.get(index);
	if (oFF.isNull(element) || !element.isNumeric())
	{
		return 0;
	}
	return element.getInteger();
};
oFF.PrList.prototype.getDoubleAt = function(index)
{
	var element = this.m_list.get(index);
	if (oFF.isNull(element) || !element.isNumeric())
	{
		return 0.0;
	}
	return element.getDouble();
};
oFF.PrList.prototype.getLongAt = function(index)
{
	var element = this.m_list.get(index);
	if (oFF.isNull(element) || !element.isNumeric())
	{
		return 0;
	}
	return element.getLong();
};
oFF.PrList.prototype.getElementTypeAt = function(index)
{
	var element = this.m_list.get(index);
	return oFF.isNull(element) ? oFF.PrElementType.THE_NULL : element.getType();
};
oFF.PrList.prototype.addAll = function(other)
{
	this.m_list.addAll(other);
};
oFF.PrList.prototype.addBoolean = function(booleanValue)
{
	this.m_list.add(oFF.PrBoolean.createWithValue(booleanValue));
};
oFF.PrList.prototype.setBooleanAt = function(index, booleanValue)
{
	this.m_list.set(index, oFF.PrBoolean.createWithValue(booleanValue));
};
oFF.PrList.prototype.addNull = function()
{
	this.m_list.add(null);
};
oFF.PrList.prototype.setNullAt = function(index)
{
	this.m_list.set(index, null);
};
oFF.PrList.prototype.addString = function(stringValue)
{
	this.m_list.add(oFF.PrString.createWithValue(stringValue));
};
oFF.PrList.prototype.setStringAt = function(index, stringValue)
{
	this.m_list.set(index, oFF.PrString.createWithValue(stringValue));
};
oFF.PrList.prototype.addInteger = function(intValue)
{
	this.m_list.add(oFF.PrInteger.createWithValue(intValue));
};
oFF.PrList.prototype.setIntegerAt = function(index, intValue)
{
	this.m_list.set(index, oFF.PrInteger.createWithValue(intValue));
};
oFF.PrList.prototype.addLong = function(longValue)
{
	this.m_list.add(oFF.PrLong.createWithValue(longValue));
};
oFF.PrList.prototype.setLongAt = function(index, longValue)
{
	this.m_list.set(index, oFF.PrLong.createWithValue(longValue));
};
oFF.PrList.prototype.set = function(index, element)
{
	this.m_list.set(index, element);
};
oFF.PrList.prototype.addDouble = function(doubleValue)
{
	this.m_list.add(oFF.PrDouble.createWithValue(doubleValue));
};
oFF.PrList.prototype.setDoubleAt = function(index, doubleValue)
{
	this.m_list.set(index, oFF.PrDouble.createWithValue(doubleValue));
};
oFF.PrList.prototype.getBooleanAt = function(index)
{
	return this.m_list.get(index).getBoolean();
};
oFF.PrList.prototype.hasNullAt = function(index)
{
	return this.m_list.get(index) === null;
};
oFF.PrList.prototype.add = function(element)
{
	this.m_list.add(element);
};
oFF.PrList.prototype.asList = function()
{
	return this;
};
oFF.PrList.prototype.size = function()
{
	return this.m_list.size();
};
oFF.PrList.prototype.isEmpty = function()
{
	return this.m_list.isEmpty();
};
oFF.PrList.prototype.hasElements = function()
{
	return this.m_list.hasElements();
};
oFF.PrList.prototype.addNewStructure = function()
{
	var structure = oFF.PrFactory.createStructure();
	this.add(structure);
	return structure;
};
oFF.PrList.prototype.addNewList = function()
{
	var list = oFF.PrList.create();
	this.add(list);
	return list;
};
oFF.PrList.prototype.getStringAtExt = function(index, defaultValue)
{
	if (this.isIndexValid(index) && this.getElementTypeAt(index) === oFF.PrElementType.STRING)
	{
		return this.getStringAt(index);
	}
	return defaultValue;
};
oFF.PrList.prototype.isIndexValid = function(index)
{
	return this.size() > index && index >= 0;
};
oFF.PrList.prototype.getIntegerAtExt = function(index, defaultValue)
{
	if (this.isIndexValid(index) && this.getElementTypeAt(index).isNumber())
	{
		return this.getIntegerAt(index);
	}
	return defaultValue;
};
oFF.PrList.prototype.getLongAtExt = function(index, defaultValue)
{
	if (this.isIndexValid(index) && this.getElementTypeAt(index).isNumber())
	{
		return this.getLongAt(index);
	}
	return defaultValue;
};
oFF.PrList.prototype.getDoubleAtExt = function(index, defaultValue)
{
	if (this.isIndexValid(index) && this.getElementTypeAt(index).isNumber())
	{
		return this.getDoubleAt(index);
	}
	return defaultValue;
};
oFF.PrList.prototype.getBooleanAtExt = function(index, defaultValue)
{
	if (this.isIndexValid(index) && this.getElementTypeAt(index) === oFF.PrElementType.BOOLEAN)
	{
		return this.getBooleanAt(index);
	}
	return defaultValue;
};
oFF.PrList.prototype.clear = function()
{
	this.m_list.clear();
};
oFF.PrList.prototype.addAllStrings = function(listToAdd)
{
	if (oFF.notNull(listToAdd))
	{
		var size = listToAdd.size();
		for (var i = 0; i < size; i++)
		{
			this.addString(listToAdd.get(i));
		}
	}
	return this;
};
oFF.PrList.prototype.insert = function(index, element)
{
	this.m_list.insert(index, element);
};
oFF.PrList.prototype.removeAt = function(index)
{
	return this.m_list.removeAt(index);
};
oFF.PrList.prototype.removeElement = function(element)
{
	return this.m_list.removeElement(element);
};
oFF.PrList.prototype.getValuesAsReadOnlyList = function()
{
	return this.m_list.getValuesAsReadOnlyList();
};
oFF.PrList.prototype.getIterator = function()
{
	return this.m_list.getIterator();
};
oFF.PrList.prototype.contains = function(element)
{
	return this.m_list.contains(element);
};
oFF.PrList.prototype.getIndex = function(element)
{
	return this.m_list.getIndex(element);
};
oFF.PrList.prototype.createArrayCopy = function()
{
	return this.m_list.createArrayCopy();
};

oFF.PrStructure = function() {};
oFF.PrStructure.prototype = new oFF.PrElement();
oFF.PrStructure.prototype._ff_c = "PrStructure";

oFF.PrStructure.create = function()
{
	var structure = new oFF.PrStructure();
	structure.setup();
	return structure;
};
oFF.PrStructure.createDeepCopy = function(origin)
{
	return oFF.PrUtils.createDeepCopyExt(origin, null);
};
oFF.PrStructure.prototype.m_elementValueMap = null;
oFF.PrStructure.prototype.setup = function()
{
	this.m_elementValueMap = oFF.XLinkedHashMapByString.create();
};
oFF.PrStructure.prototype.releaseObject = function()
{
	this.m_elementValueMap = oFF.XObjectExt.release(this.m_elementValueMap);
	oFF.PrElement.prototype.releaseObject.call( this );
};
oFF.PrStructure.prototype.getType = function()
{
	return oFF.PrElementType.STRUCTURE;
};
oFF.PrStructure.prototype.asStructure = function()
{
	return this;
};
oFF.PrStructure.prototype.getStringByKey = function(name)
{
	return this.getStringByKeyExt(name, null);
};
oFF.PrStructure.prototype.putString = function(name, stringValue)
{
	if (oFF.isNull(name))
	{
		throw oFF.XException.createRuntimeException("Missing key");
	}
	this.m_elementValueMap.put(name, oFF.PrString.createWithValue(stringValue));
};
oFF.PrStructure.prototype.getIntegerByKey = function(name)
{
	return this.getIntegerByKeyExt(name, 0);
};
oFF.PrStructure.prototype.getIntegerByKeyExt = function(name, defaultValue)
{
	var element = this.m_elementValueMap.getByKey(name);
	if (oFF.notNull(element))
	{
		if (element.isInteger())
		{
			return element.getInteger();
		}
		else if (element.isLong())
		{
			return oFF.XLong.convertToInt(element.getLong());
		}
		else if (element.isDouble())
		{
			return oFF.XDouble.convertToInt(element.getDouble());
		}
	}
	return defaultValue;
};
oFF.PrStructure.prototype.putInteger = function(name, intValue)
{
	if (oFF.XMath.isNaN(intValue))
	{
		this.putNull(name);
	}
	else
	{
		this.m_elementValueMap.put(name, oFF.PrInteger.createWithValue(intValue));
	}
};
oFF.PrStructure.prototype.getLongByKey = function(name)
{
	return this.getLongByKeyExt(name, 0);
};
oFF.PrStructure.prototype.putLong = function(name, longValue)
{
	if (oFF.XMath.isNaN(longValue))
	{
		this.putNull(name);
	}
	else
	{
		this.m_elementValueMap.put(name, oFF.PrLong.createWithValue(longValue));
	}
};
oFF.PrStructure.prototype.getDoubleByKey = function(name)
{
	return this.getDoubleByKeyExt(name, 0.0);
};
oFF.PrStructure.prototype.putDouble = function(name, doubleValue)
{
	if (oFF.XMath.isNaN(doubleValue))
	{
		this.putNull(name);
	}
	else
	{
		this.m_elementValueMap.put(name, oFF.PrDouble.createWithValue(doubleValue));
	}
};
oFF.PrStructure.prototype.getBooleanByKey = function(name)
{
	return this.getBooleanByKeyExt(name, false);
};
oFF.PrStructure.prototype.putBoolean = function(key, booleanValue)
{
	this.m_elementValueMap.put(key, oFF.PrBoolean.createWithValue(booleanValue));
};
oFF.PrStructure.prototype.putNull = function(name)
{
	this.m_elementValueMap.put(name, null);
};
oFF.PrStructure.prototype.hasNullByKey = function(name)
{
	return this.m_elementValueMap.containsKey(name) && this.m_elementValueMap.getByKey(name) === null;
};
oFF.PrStructure.prototype.getStructureByKey = function(name)
{
	return this.m_elementValueMap.getByKey(name);
};
oFF.PrStructure.prototype.getListByKey = function(name)
{
	return this.m_elementValueMap.getByKey(name);
};
oFF.PrStructure.prototype.putNotNullAndNotEmpty = function(name, element)
{
	if (oFF.notNull(element) && (!element.isList() || !element.asList().isEmpty()) && (!element.isStructure() || !element.asStructure().isEmpty()) && (!element.isString() || !oFF.XStringUtils.isNullOrEmpty(element.asString().getString())))
	{
		this.put(name, element);
	}
};
oFF.PrStructure.prototype.remove = function(key)
{
	return this.m_elementValueMap.remove(key);
};
oFF.PrStructure.prototype.getElementTypeByKey = function(name)
{
	var element = this.m_elementValueMap.getByKey(name);
	return oFF.isNull(element) ? oFF.PrElementType.THE_NULL : element.getType();
};
oFF.PrStructure.prototype.hasElements = function()
{
	return this.m_elementValueMap.hasElements();
};
oFF.PrStructure.prototype.isEmpty = function()
{
	return this.m_elementValueMap.isEmpty();
};
oFF.PrStructure.prototype.getBooleanByKeyExt = function(name, defaultValue)
{
	var element = this.m_elementValueMap.getByKey(name);
	var value = defaultValue;
	if (oFF.notNull(element))
	{
		if (element.isBoolean())
		{
			value = element.getBoolean();
		}
		else if (element.isString())
		{
			var stringValue = element.asString().getString();
			value = oFF.XBoolean.convertFromStringWithDefault(stringValue, defaultValue);
		}
	}
	return value;
};
oFF.PrStructure.prototype.getStringByKeyExt = function(name, defaultValue)
{
	if (this.containsKey(name))
	{
		var element = this.m_elementValueMap.getByKey(name);
		if (oFF.notNull(element) && element.isString())
		{
			return element.getString();
		}
		return null;
	}
	return defaultValue;
};
oFF.PrStructure.prototype.getLongByKeyExt = function(name, defaultValue)
{
	var element = this.m_elementValueMap.getByKey(name);
	if (oFF.notNull(element))
	{
		if (element.isLong())
		{
			return element.getLong();
		}
		else if (element.isInteger())
		{
			return element.getInteger();
		}
		else if (element.isDouble())
		{
			return oFF.XDouble.convertToLong(element.getDouble());
		}
	}
	return defaultValue;
};
oFF.PrStructure.prototype.getDoubleByKeyExt = function(name, defaultValue)
{
	var element = this.m_elementValueMap.getByKey(name);
	if (oFF.notNull(element))
	{
		if (element.isDouble())
		{
			return element.getDouble();
		}
		else if (element.isInteger())
		{
			return element.getInteger();
		}
		else if (element.isLong())
		{
			return element.getLong();
		}
	}
	return defaultValue;
};
oFF.PrStructure.prototype.putStringNotNull = function(name, stringValue)
{
	if (oFF.notNull(stringValue))
	{
		this.putString(name, stringValue);
	}
};
oFF.PrStructure.prototype.putStringNotNullAndNotEmpty = function(name, stringValue)
{
	if (oFF.XStringUtils.isNotNullAndNotEmpty(stringValue))
	{
		this.putString(name, stringValue);
	}
};
oFF.PrStructure.prototype.putNewList = function(name)
{
	var list = oFF.PrFactory.createList();
	this.put(name, list);
	return list;
};
oFF.PrStructure.prototype.putNewStructure = function(name)
{
	var structure = oFF.PrStructure.create();
	this.put(name, structure);
	return structure;
};
oFF.PrStructure.prototype.getKeysAsReadOnlyListOfStringSorted = function()
{
	var structureElementNames = this.getKeysAsReadOnlyListOfString();
	if (!oFF.XCollectionUtils.hasElements(structureElementNames))
	{
		return structureElementNames;
	}
	var sorted = oFF.XListOfString.createFromReadOnlyList(structureElementNames);
	sorted.sortByDirection(oFF.XSortDirection.ASCENDING);
	return sorted;
};
oFF.PrStructure.prototype.hasStringByKey = function(name)
{
	return this.containsKey(name) && this.getElementTypeByKey(name) === oFF.PrElementType.STRING;
};
oFF.PrStructure.prototype.size = function()
{
	return this.m_elementValueMap.size();
};
oFF.PrStructure.prototype.containsKey = function(key)
{
	return this.m_elementValueMap.containsKey(key);
};
oFF.PrStructure.prototype.contains = function(element)
{
	return this.m_elementValueMap.contains(element);
};
oFF.PrStructure.prototype.getKeysAsIteratorOfString = function()
{
	return this.m_elementValueMap.getKeysAsIteratorOfString();
};
oFF.PrStructure.prototype.getKeysAsReadOnlyListOfString = function()
{
	return this.m_elementValueMap.getKeysAsReadOnlyListOfString();
};
oFF.PrStructure.prototype.put = function(key, element)
{
	this.m_elementValueMap.put(key, element);
};
oFF.PrStructure.prototype.putAll = function(other)
{
	if (oFF.notNull(other))
	{
		var keys = other.getKeysAsReadOnlyListOfString();
		var size = keys.size();
		for (var i = 0; i < size; i++)
		{
			var key = keys.get(i);
			var value = other.getByKey(key);
			this.put(key, value);
		}
	}
};
oFF.PrStructure.prototype.clear = function()
{
	this.m_elementValueMap.clear();
};
oFF.PrStructure.prototype.getByKey = function(key)
{
	return this.m_elementValueMap.getByKey(key);
};
oFF.PrStructure.prototype.getIterator = function()
{
	return this.getValuesAsReadOnlyList().getIterator();
};
oFF.PrStructure.prototype.putIfNotNull = function(key, element)
{
	if (oFF.notNull(element))
	{
		this.m_elementValueMap.put(key, element);
	}
};
oFF.PrStructure.prototype.createMapByStringCopy = function()
{
	return this.m_elementValueMap.createMapByStringCopy();
};
oFF.PrStructure.prototype.getValuesAsReadOnlyList = function()
{
	var values = oFF.XList.create();
	var allValues = this.m_elementValueMap.getIterator();
	while (allValues.hasNext())
	{
		var next = allValues.next();
		if (oFF.isNull(next))
		{
			continue;
		}
		var type = next.getType();
		if (type.isNumber() || type === oFF.PrElementType.BOOLEAN || type === oFF.PrElementType.STRING)
		{
			values.add(next);
		}
	}
	return values;
};

oFF.PrTemplateList = function() {};
oFF.PrTemplateList.prototype = new oFF.PrElement();
oFF.PrTemplateList.prototype._ff_c = "PrTemplateList";

oFF.PrTemplateList.TEMPLATE_DELETE_NAME = "$delete";
oFF.PrTemplateList.createListWrapper = function(root, parent, list)
{
	var obj = new oFF.PrTemplateList();
	obj.setupListWrapper(root, parent, list, null);
	return obj;
};
oFF.PrTemplateList.createListWrapperWithTemplate = function(root, parent, list, templateList)
{
	var obj = new oFF.PrTemplateList();
	obj.setupListWrapper(root, parent, list, templateList);
	return obj;
};
oFF.PrTemplateList.prototype.m_root = null;
oFF.PrTemplateList.prototype.m_parent = null;
oFF.PrTemplateList.prototype.m_list = null;
oFF.PrTemplateList.prototype.m_template = null;
oFF.PrTemplateList.prototype.m_size = 0;
oFF.PrTemplateList.prototype.setupListWrapper = function(root, parent, list, templateList)
{
	this.m_parent = parent;
	this.m_list = list;
	this.m_root = root;
	this.m_template = templateList;
	if (oFF.isNull(this.m_template))
	{
		this.m_size = this.m_list.size();
	}
	else
	{
		this.m_size = oFF.XMath.max(this.m_size, this.m_template.size());
		var len = this.m_list.size();
		for (var i = 0; i < len; i++)
		{
			var structure = this.m_list.getStructureAt(i);
			if (oFF.isNull(structure))
			{
				break;
			}
			if (structure.getBooleanByKeyExt(oFF.PrTemplateList.TEMPLATE_DELETE_NAME, false))
			{
				this.m_size = i;
			}
		}
	}
};
oFF.PrTemplateList.prototype.isList = function()
{
	return true;
};
oFF.PrTemplateList.prototype.getPermaCopy = function()
{
	return this.m_list.getPermaCopy();
};
oFF.PrTemplateList.prototype.getType = function()
{
	return this.m_list.getType();
};
oFF.PrTemplateList.prototype.asList = function()
{
	return this;
};
oFF.PrTemplateList.prototype.getStringRepresentation = function()
{
	return this.m_list.getStringRepresentation();
};
oFF.PrTemplateList.prototype.getValueType = function()
{
	return this.m_list.getValueType();
};
oFF.PrTemplateList.prototype.getComponentType = function()
{
	return this.m_list.getComponentType();
};
oFF.PrTemplateList.prototype.getIntegerAt = function(index)
{
	return this.m_list.getIntegerAt(index);
};
oFF.PrTemplateList.prototype.getIntegerAtExt = function(index, defaultValue)
{
	return this.m_list.getIntegerAtExt(index, defaultValue);
};
oFF.PrTemplateList.prototype.getBooleanAt = function(index)
{
	return this.m_list.getBooleanAt(index);
};
oFF.PrTemplateList.prototype.getBooleanAtExt = function(index, defaultValue)
{
	return this.m_list.getBooleanAtExt(index, defaultValue);
};
oFF.PrTemplateList.prototype.getDoubleAt = function(index)
{
	return this.m_list.getDoubleAt(index);
};
oFF.PrTemplateList.prototype.getDoubleAtExt = function(index, defaultValue)
{
	return this.m_list.getDoubleAtExt(index, defaultValue);
};
oFF.PrTemplateList.prototype.getStringAt = function(index)
{
	var result = this.m_list.getStringAt(index);
	return oFF.ReplaceTagHandler.handle(this, result);
};
oFF.PrTemplateList.prototype.getStringAtExt = function(index, defaultValue)
{
	var result = this.getStringAt(index);
	if (oFF.notNull(result))
	{
		return result;
	}
	return defaultValue;
};
oFF.PrTemplateList.prototype.getLongAt = function(index)
{
	return this.m_list.getLongAt(index);
};
oFF.PrTemplateList.prototype.getLongAtExt = function(index, defaultValue)
{
	return this.m_list.getLongAtExt(index, defaultValue);
};
oFF.PrTemplateList.prototype.addInteger = oFF.noSupport;
oFF.PrTemplateList.prototype.setIntegerAt = oFF.noSupport;
oFF.PrTemplateList.prototype.clear = oFF.noSupport;
oFF.PrTemplateList.prototype.isEmpty = function()
{
	return this.m_list.isEmpty();
};
oFF.PrTemplateList.prototype.hasElements = function()
{
	return this.m_list.hasElements();
};
oFF.PrTemplateList.prototype.size = function()
{
	return this.m_size;
};
oFF.PrTemplateList.prototype.addLong = oFF.noSupport;
oFF.PrTemplateList.prototype.setLongAt = oFF.noSupport;
oFF.PrTemplateList.prototype.addBoolean = oFF.noSupport;
oFF.PrTemplateList.prototype.setBooleanAt = oFF.noSupport;
oFF.PrTemplateList.prototype.addDouble = oFF.noSupport;
oFF.PrTemplateList.prototype.setDoubleAt = oFF.noSupport;
oFF.PrTemplateList.prototype.addString = oFF.noSupport;
oFF.PrTemplateList.prototype.setStringAt = oFF.noSupport;
oFF.PrTemplateList.prototype.addNull = oFF.noSupport;
oFF.PrTemplateList.prototype.setNullAt = oFF.noSupport;
oFF.PrTemplateList.prototype.hasNullAt = function(index)
{
	return this.m_list.hasNullAt(index);
};
oFF.PrTemplateList.prototype.addAll = oFF.noSupport;
oFF.PrTemplateList.prototype.add = oFF.noSupport;
oFF.PrTemplateList.prototype.get = function(index)
{
	return this.m_list.get(index);
};
oFF.PrTemplateList.prototype.set = function(index, element)
{
	this.m_list.set(index, element);
};
oFF.PrTemplateList.prototype.getElementTypeAt = function(index)
{
	return this.m_list.getElementTypeAt(index);
};
oFF.PrTemplateList.prototype.getListAt = function(index)
{
	return this.m_list.getListAt(index);
};
oFF.PrTemplateList.prototype.addNewList = oFF.noSupport;
oFF.PrTemplateList.prototype.getStructureAt = function(index)
{
	if (index >= this.m_size)
	{
		throw oFF.XException.createIllegalArgumentException("Index out of range");
	}
	var isOriginalAvailable = index < this.m_list.size();
	var isTemplateAvailable = oFF.notNull(this.m_template) && index < this.m_template.size();
	if (isOriginalAvailable && isTemplateAvailable)
	{
		var original = this.m_list.getStructureAt(index);
		var templateStruct = oFF.PrTemplateStructure.createStructureWrapper(this.m_root, this, this.m_template.get(index).asStructure());
		return oFF.PrTemplateStructure.createStructureWrapperWithTemplate(this.m_root, this, original, templateStruct);
	}
	if (isTemplateAvailable)
	{
		return oFF.PrTemplateStructure.createStructureWrapper(this.m_root, this, this.m_template.get(index).asStructure());
	}
	if (isOriginalAvailable)
	{
		return oFF.PrTemplateStructure.createStructureWrapper(this.m_root, this, this.m_list.getStructureAt(index));
	}
	return null;
};
oFF.PrTemplateList.prototype.addNewStructure = oFF.noSupport;
oFF.PrTemplateList.prototype.getParent = function()
{
	return this.m_parent;
};
oFF.PrTemplateList.prototype.setParent = function(parent)
{
	this.m_parent = parent;
};
oFF.PrTemplateList.prototype.addAllStrings = oFF.noSupport;
oFF.PrTemplateList.prototype.toString = function()
{
	return this.m_list.toString();
};
oFF.PrTemplateList.prototype.releaseObject = function()
{
	this.m_list = oFF.XObjectExt.release(this.m_list);
	this.m_template = oFF.XObjectExt.release(this.m_template);
	this.m_parent = null;
	this.m_root = null;
	oFF.PrElement.prototype.releaseObject.call( this );
};
oFF.PrTemplateList.prototype.insert = oFF.noSupport;
oFF.PrTemplateList.prototype.removeAt = oFF.noSupport;
oFF.PrTemplateList.prototype.removeElement = oFF.noSupport;
oFF.PrTemplateList.prototype.getValuesAsReadOnlyList = function()
{
	return this.m_list.getValuesAsReadOnlyList();
};
oFF.PrTemplateList.prototype.getIterator = function()
{
	return this.m_list.getIterator();
};
oFF.PrTemplateList.prototype.contains = function(element)
{
	return this.m_list.contains(element);
};
oFF.PrTemplateList.prototype.getIndex = function(element)
{
	return this.m_list.getIndex(element);
};
oFF.PrTemplateList.prototype.createArrayCopy = function()
{
	return this.m_list.createArrayCopy();
};

oFF.PrTemplateStructure = function() {};
oFF.PrTemplateStructure.prototype = new oFF.PrElement();
oFF.PrTemplateStructure.prototype._ff_c = "PrTemplateStructure";

oFF.PrTemplateStructure.TEMPLATE_PATH_NAME = "$ref";
oFF.PrTemplateStructure.TEMPLATE_REPLACE_NAME = "$replace";
oFF.PrTemplateStructure.createStructureWrapper = function(root, parent, structure)
{
	var obj = new oFF.PrTemplateStructure();
	obj.setupStructureWrapper(root, parent, structure, null);
	return obj;
};
oFF.PrTemplateStructure.createStructureWrapperWithTemplate = function(root, parent, structure, templateStruct)
{
	var obj = new oFF.PrTemplateStructure();
	obj.setupStructureWrapper(root, parent, structure, templateStruct);
	return obj;
};
oFF.PrTemplateStructure.prototype.m_root = null;
oFF.PrTemplateStructure.prototype.m_parent = null;
oFF.PrTemplateStructure.prototype.m_structure = null;
oFF.PrTemplateStructure.prototype.m_template = null;
oFF.PrTemplateStructure.prototype.m_replaceTemplateFields = null;
oFF.PrTemplateStructure.prototype.setupStructureWrapper = function(root, parent, structure, templateStruct)
{
	this.m_parent = parent;
	this.m_structure = structure;
	var replaceList = this.m_structure.getListByKey(oFF.PrTemplateStructure.TEMPLATE_REPLACE_NAME);
	if (oFF.notNull(replaceList))
	{
		this.m_replaceTemplateFields = oFF.XHashSetOfString.create();
		var len = replaceList.size();
		for (var i = 0; i < len; i++)
		{
			this.m_replaceTemplateFields.add(replaceList.getStringAt(i));
		}
	}
	this.m_root = root;
	this.m_template = templateStruct;
	if (oFF.isNull(this.m_template))
	{
		oFF.XObjectExt.assertNotNullExt(this.m_root, "root shall never be null");
		this.m_template = this.tryGetTemplateFromRoot();
	}
};
oFF.PrTemplateStructure.prototype.tryGetTemplateFromRoot = function()
{
	var templatePath = this.m_structure.getStringByKey(oFF.PrTemplateStructure.TEMPLATE_PATH_NAME);
	if (oFF.XStringUtils.isNullOrEmpty(templatePath) || !oFF.XString.startsWith(templatePath, "#"))
	{
		return null;
	}
	var result = this.m_root;
	var splitPath = oFF.XStringTokenizer.splitString(templatePath, "/");
	var len = splitPath.size();
	for (var i = 1; i < len; i++)
	{
		result = result.getStructureByKey(splitPath.get(i));
	}
	return oFF.PrTemplateStructure.createStructureWrapper(this.m_root, this.getParent(), result);
};
oFF.PrTemplateStructure.prototype.isStructure = function()
{
	return true;
};
oFF.PrTemplateStructure.prototype.getPermaCopy = oFF.noSupport;
oFF.PrTemplateStructure.prototype.getType = function()
{
	return this.m_structure.getType();
};
oFF.PrTemplateStructure.prototype.asStructure = function()
{
	return this;
};
oFF.PrTemplateStructure.prototype.getStringRepresentation = function()
{
	return this.m_structure.getStringRepresentation();
};
oFF.PrTemplateStructure.prototype.getValueType = function()
{
	return this.m_structure.getValueType();
};
oFF.PrTemplateStructure.prototype.getComponentType = function()
{
	return this.m_structure.getComponentType();
};
oFF.PrTemplateStructure.prototype.getByKey = function(key)
{
	var result = this.m_structure.getByKey(key);
	if (oFF.isNull(result) && this.isTemplateAvailable(key))
	{
		result = this.m_template.getByKey(key);
	}
	return result;
};
oFF.PrTemplateStructure.prototype.getValuesAsReadOnlyList = function()
{
	var values = oFF.XList.create();
	values.addAll(this.m_structure.getValuesAsReadOnlyList());
	if (oFF.notNull(this.m_template))
	{
		values.addAll(this.m_template.getValuesAsReadOnlyList());
	}
	return values;
};
oFF.PrTemplateStructure.prototype.getIterator = function()
{
	return this.getValuesAsReadOnlyList().getIterator();
};
oFF.PrTemplateStructure.prototype.contains = function(element)
{
	var result = this.m_structure.contains(element);
	if (!result && oFF.notNull(this.m_template))
	{
		result = this.m_template.contains(element);
	}
	return result;
};
oFF.PrTemplateStructure.prototype.isEmpty = function()
{
	var result = this.m_structure.isEmpty();
	if (!result && oFF.notNull(this.m_template))
	{
		result = this.m_template.isEmpty();
	}
	return result;
};
oFF.PrTemplateStructure.prototype.hasElements = function()
{
	var result = this.m_structure.hasElements();
	if (!result && oFF.notNull(this.m_template))
	{
		result = this.m_template.hasElements();
	}
	return result;
};
oFF.PrTemplateStructure.prototype.size = function()
{
	var result = this.m_structure.size();
	if (oFF.notNull(this.m_template))
	{
		result = result + this.m_template.size();
	}
	return result;
};
oFF.PrTemplateStructure.prototype.containsKey = function(key)
{
	var result = this.m_structure.containsKey(key);
	if (!result && this.isTemplateAvailable(key))
	{
		result = this.m_template.containsKey(key);
	}
	return result;
};
oFF.PrTemplateStructure.prototype.getKeysAsReadOnlyListOfString = function()
{
	var keys = oFF.XListOfString.create();
	keys.addAll(this.m_structure.getKeysAsReadOnlyListOfString());
	if (oFF.notNull(this.m_template))
	{
		keys.addAll(this.m_template.getKeysAsReadOnlyListOfString());
	}
	return keys;
};
oFF.PrTemplateStructure.prototype.getKeysAsIteratorOfString = function()
{
	return this.getKeysAsReadOnlyListOfString().getIterator();
};
oFF.PrTemplateStructure.prototype.getStringByKey = function(name)
{
	var element = this.getByKey(name);
	if (oFF.isNull(element) || element.getType() !== oFF.PrElementType.STRING)
	{
		return null;
	}
	return oFF.ReplaceTagHandler.handle(this, element.asString().getString());
};
oFF.PrTemplateStructure.prototype.getStringByKeyExt = function(name, defaultValue)
{
	var result = this.getStringByKey(name);
	return oFF.isNull(result) ? defaultValue : result;
};
oFF.PrTemplateStructure.prototype.getIntegerByKey = function(name)
{
	return this.getByKey(name).asNumber().getInteger();
};
oFF.PrTemplateStructure.prototype.getIntegerByKeyExt = function(name, defaultValue)
{
	var element = this.getByKey(name);
	return oFF.isNull(element) ? defaultValue : element.asNumber().getInteger();
};
oFF.PrTemplateStructure.prototype.getLongByKey = function(name)
{
	return this.getByKey(name).asNumber().getLong();
};
oFF.PrTemplateStructure.prototype.getLongByKeyExt = function(name, defaultValue)
{
	var element = this.getByKey(name);
	return oFF.isNull(element) ? defaultValue : element.asNumber().getLong();
};
oFF.PrTemplateStructure.prototype.getDoubleByKey = function(name)
{
	return this.getByKey(name).asNumber().getDouble();
};
oFF.PrTemplateStructure.prototype.getDoubleByKeyExt = function(name, defaultValue)
{
	var element = this.getByKey(name);
	return oFF.isNull(element) ? defaultValue : element.asNumber().getDouble();
};
oFF.PrTemplateStructure.prototype.getBooleanByKey = function(name)
{
	return this.getByKey(name).asBoolean().getBoolean();
};
oFF.PrTemplateStructure.prototype.getBooleanByKeyExt = function(name, defaultValue)
{
	var element = this.getByKey(name);
	return oFF.isNull(element) ? defaultValue : element.asBoolean().getBoolean();
};
oFF.PrTemplateStructure.prototype.hasNullByKey = function(name)
{
	var result = this.m_structure.hasNullByKey(name);
	if (!result && this.isTemplateAvailable(name))
	{
		result = this.m_template.hasNullByKey(name);
	}
	return result;
};
oFF.PrTemplateStructure.prototype.putAll = function(other)
{
	var keys = other.getKeysAsReadOnlyListOfString();
	var size = keys.size();
	for (var i = 0; i < size; i++)
	{
		var key = keys.get(i);
		var value = other.getByKey(key);
		this.put(key, value);
	}
};
oFF.PrTemplateStructure.prototype.putString = oFF.noSupport;
oFF.PrTemplateStructure.prototype.putStringNotNull = oFF.noSupport;
oFF.PrTemplateStructure.prototype.putStringNotNullAndNotEmpty = oFF.noSupport;
oFF.PrTemplateStructure.prototype.remove = oFF.noSupport;
oFF.PrTemplateStructure.prototype.clear = oFF.noSupport;
oFF.PrTemplateStructure.prototype.putInteger = oFF.noSupport;
oFF.PrTemplateStructure.prototype.putLong = oFF.noSupport;
oFF.PrTemplateStructure.prototype.putDouble = oFF.noSupport;
oFF.PrTemplateStructure.prototype.putBoolean = oFF.noSupport;
oFF.PrTemplateStructure.prototype.putNull = oFF.noSupport;
oFF.PrTemplateStructure.prototype.put = oFF.noSupport;
oFF.PrTemplateStructure.prototype.getStructureByKey = function(name)
{
	var isOriginalAvailable = this.m_structure.containsKey(name);
	var isTemplateAvailable = this.isTemplateAvailable(name);
	if (isOriginalAvailable && isTemplateAvailable)
	{
		var original = this.m_structure.getStructureByKey(name);
		var templateStruct = oFF.PrTemplateStructure.createStructureWrapper(this.m_root, this, this.m_template.getByKey(name).asStructure());
		return oFF.PrTemplateStructure.createStructureWrapperWithTemplate(this.m_root, this, original, templateStruct);
	}
	if (isTemplateAvailable)
	{
		return oFF.PrTemplateStructure.createStructureWrapper(this.m_root, this, this.m_template.getByKey(name).asStructure());
	}
	if (isOriginalAvailable)
	{
		return oFF.PrTemplateStructure.createStructureWrapper(this.m_root, this, this.m_structure.getStructureByKey(name));
	}
	return null;
};
oFF.PrTemplateStructure.prototype.getListByKey = function(name)
{
	var isOriginalAvailable = this.m_structure.containsKey(name);
	var isTemplateAvailable = this.isTemplateAvailable(name);
	if (isOriginalAvailable && isTemplateAvailable)
	{
		var original = this.m_structure.getListByKey(name);
		var templateList = oFF.PrTemplateList.createListWrapper(this.m_root, this, this.m_template.getByKey(name).asList());
		return oFF.PrTemplateList.createListWrapperWithTemplate(this.m_root, this, original, templateList);
	}
	if (isTemplateAvailable)
	{
		return oFF.PrTemplateList.createListWrapper(this.m_root, this, this.m_template.getByKey(name).asList());
	}
	if (isOriginalAvailable)
	{
		return oFF.PrTemplateList.createListWrapper(this.m_root, this, this.m_structure.getListByKey(name));
	}
	return null;
};
oFF.PrTemplateStructure.prototype.putNotNullAndNotEmpty = function(name, element)
{
	this.m_structure.putNotNullAndNotEmpty(name, element);
};
oFF.PrTemplateStructure.prototype.putNewList = oFF.noSupport;
oFF.PrTemplateStructure.prototype.putNewStructure = oFF.noSupport;
oFF.PrTemplateStructure.prototype.getElementTypeByKey = function(name)
{
	var result = this.m_structure.getElementTypeByKey(name);
	if ((oFF.isNull(result) || result === oFF.PrElementType.THE_NULL) && oFF.notNull(this.m_template))
	{
		return this.m_template.getElementTypeByKey(name);
	}
	return result;
};
oFF.PrTemplateStructure.prototype.getCoreStructureElementNames = function()
{
	return this.m_structure.getKeysAsReadOnlyListOfString();
};
oFF.PrTemplateStructure.prototype.getKeysAsReadOnlyListOfStringSorted = function()
{
	var elementNames = this.getKeysAsReadOnlyListOfString();
	elementNames.sortByDirection(oFF.XSortDirection.ASCENDING);
	return elementNames;
};
oFF.PrTemplateStructure.prototype.hasStringByKey = function(name)
{
	var result = this.m_structure.hasStringByKey(name);
	if (!result && this.isTemplateAvailable(name))
	{
		return this.m_template.hasStringByKey(name);
	}
	return result;
};
oFF.PrTemplateStructure.prototype.getParent = function()
{
	return this.m_parent;
};
oFF.PrTemplateStructure.prototype.setParent = function(parent)
{
	this.m_parent = parent;
};
oFF.PrTemplateStructure.prototype.isTemplateAvailable = function(name)
{
	return oFF.notNull(this.m_template) && this.m_template.containsKey(name) && (oFF.isNull(this.m_replaceTemplateFields) || !this.m_replaceTemplateFields.contains(name));
};
oFF.PrTemplateStructure.prototype.releaseObject = function()
{
	this.m_structure = oFF.XObjectExt.release(this.m_structure);
	this.m_template = oFF.XObjectExt.release(this.m_template);
	this.m_replaceTemplateFields = oFF.XObjectExt.release(this.m_replaceTemplateFields);
	this.m_parent = null;
	this.m_root = null;
	oFF.PrElement.prototype.releaseObject.call( this );
};
oFF.PrTemplateStructure.prototype.putIfNotNull = oFF.noSupport;
oFF.PrTemplateStructure.prototype.createMapByStringCopy = oFF.noSupport;

oFF.StructuresModule = function() {};
oFF.StructuresModule.prototype = new oFF.DfModule();
oFF.StructuresModule.prototype._ff_c = "StructuresModule";

oFF.StructuresModule.s_module = null;
oFF.StructuresModule.getInstance = function()
{
	if (oFF.isNull(oFF.StructuresModule.s_module))
	{
		oFF.DfModule.checkInitialized(oFF.CommonsExtModule.getInstance());
		oFF.StructuresModule.s_module = oFF.DfModule.startExt(new oFF.StructuresModule());
		oFF.XmlParserFactory.staticSetupXmlParserFactory();
		oFF.JsonParserGenericFactory.staticSetup();
		oFF.DocumentFormatType.staticSetup();
		oFF.XmlUtils.staticSetup();
		oFF.PrElementType.staticSetup();
		oFF.PrFactoryUniversal.staticSetup();
		oFF.PrSerializerFactory.staticSetup();
		oFF.JsonParserFactory.staticSetupJsonParserFactory();
		oFF.JsonFilteringSerializerFactory.staticSetup();
		oFF.DfModule.stopExt(oFF.StructuresModule.s_module);
	}
	return oFF.StructuresModule.s_module;
};
oFF.StructuresModule.prototype.getName = function()
{
	return "ff0070.structures";
};

oFF.StructuresModule.getInstance();

return sap.firefly;
	} );