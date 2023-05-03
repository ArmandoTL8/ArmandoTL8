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

oFF.QInAComponent = function() {};
oFF.QInAComponent.prototype = new oFF.XObject();
oFF.QInAComponent.prototype._ff_c = "QInAComponent";

oFF.QInAComponent.prototype.getModelFormat = function()
{
	return null;
};
oFF.QInAComponent.prototype.isMatching = function(inaImportElement)
{
	return true;
};
oFF.QInAComponent.prototype.getName = function()
{
	return this.getComponentType().getName();
};
oFF.QInAComponent.prototype.getTagName = function()
{
	return null;
};
oFF.QInAComponent.prototype.toString = function()
{
	return this.getName();
};

oFF.QInAExportUtil = {

	extendStructure:function(exporter, modelComponent, source)
	{
			if (exporter.mode.isTypeOf(oFF.QModelFormat.INA_REPOSITORY))
		{
			var tagging = modelComponent.getTagging();
			if (oFF.XCollectionUtils.hasElements(tagging))
			{
				var keyList = tagging.getKeysAsReadOnlyListOfString();
				var componentTaggingList = source.putNewList("ComponentTags");
				for (var i = 0; i < keyList.size(); i++)
				{
					var currentKey = keyList.get(i);
					var currentValue = tagging.getByKey(currentKey);
					var newKeyValuePair = oFF.PrFactory.createStructure();
					componentTaggingList.add(newKeyValuePair);
					newKeyValuePair.putString("KEY", currentKey);
					if (oFF.isNull(currentValue))
					{
						newKeyValuePair.putNull("VALUE");
					}
					else
					{
						newKeyValuePair.putString("VALUE", currentValue);
					}
				}
			}
		}
		return source;
	},
	extendList:function(modelComponent, source)
	{
			return source;
	},
	setDate:function(exporter, structure, parameterName, date)
	{
			if (oFF.notNull(date))
		{
			structure.putString(parameterName, oFF.QInAExportUtil.dateTimeToString(exporter, date));
		}
	},
	isNumberSafe:function(value)
	{
			return oFF.XMath.abs(value) < 9007199254740992;
	},
	setNonEmptyString:function(structure, parameterName, value)
	{
			if (oFF.XStringUtils.isNotNullAndNotEmpty(value))
		{
			structure.putString(parameterName, value);
		}
	},
	setNameIfNotNull:function(structure, name, namedObject)
	{
			if (oFF.notNull(namedObject))
		{
			structure.putString(name, namedObject.getName());
		}
	},
	setIntegerIfNotNull:function(structure, name, value)
	{
			if (oFF.notNull(value))
		{
			structure.putInteger(name, value.getInteger());
		}
	},
	dateTimeToString:function(exporter, value)
	{
			return exporter.capabilities.supportsSapDate() ? value.toSAPFormat() : value.toIsoFormat();
	},
	getAccountDimensionMemberNameByAlias:function(queryModel, aliasName, exporter)
	{
			if ((exporter.getMode().isTypeOf(oFF.QModelFormat.INA_DATA) || exporter.mode.isTypeOf(oFF.QModelFormat.INA_VALUE_HELP)) && oFF.notNull(queryModel))
		{
			var name = queryModel.getConvenienceCommands().getAccountDimensionMemberNameByAlias(queryModel, aliasName);
			if (oFF.notNull(name))
			{
				return name;
			}
		}
		return aliasName;
	},
	getMeasureMemberNameByAlias:function(queryModel, aliasName, exporter)
	{
			var memberName = aliasName;
		if ((exporter.getMode().isTypeOf(oFF.QModelFormat.INA_DATA) || exporter.mode.isTypeOf(oFF.QModelFormat.INA_VALUE_HELP)) && oFF.notNull(queryModel))
		{
			var queryManager = queryModel.getQueryManager();
			if (queryManager.getMode() === oFF.QueryManagerMode.BLENDING)
			{
				var blendingSources = queryManager.getQueryModel().getBlendingSources();
				for (var i = 0; i < blendingSources.size(); i++)
				{
					var blendingSource = blendingSources.get(i);
					var prefix = oFF.XStringUtils.concatenate2(blendingSource.getQueryAliasName(), ".");
					if (oFF.XString.startsWith(aliasName, prefix))
					{
						var aliasNameWithoutPrefix = oFF.XString.replace(aliasName, prefix, "");
						var leafQueryModel = blendingSource.getQueryModel();
						var nameToProcess = oFF.QInAExportUtil.getMeasureMemberNameByAlias(leafQueryModel, aliasNameWithoutPrefix, exporter);
						if (oFF.notNull(nameToProcess))
						{
							if (oFF.XString.containsString(aliasName, prefix))
							{
								nameToProcess = oFF.XStringUtils.concatenate2(prefix, nameToProcess);
							}
							return nameToProcess;
						}
					}
				}
			}
			else
			{
				var name = queryModel.getConvenienceCommands().getMeasureMemberNameByAlias(queryModel, aliasName);
				if (oFF.notNull(name))
				{
					memberName = name;
				}
				if (exporter.getSession().hasFeature(oFF.FeatureToggleOlap.MULTIPLE_ACCOUNT_HIERARCHIES) && queryModel.getDimensionByType(oFF.DimensionType.ACCOUNT) !== null && oFF.notNull(memberName))
				{
					var accountDimension = queryModel.getAccountDimension();
					var accountDimensionMemberPrefix;
					var hierarchyName;
					var accountDimensionHierarchyMemberPrefix;
					if (oFF.XString.startsWith(memberName, oFF.QModelConstants.CALCULATION_PLACEHOLDER_ID_PREFIX))
					{
						accountDimensionMemberPrefix = oFF.XStringUtils.concatenate3("[", accountDimension.getName(), "].[");
						hierarchyName = accountDimension.getHierarchyName() !== null ? accountDimension.getHierarchyName() : accountDimension.getDefaultHierarchyName();
						accountDimensionHierarchyMemberPrefix = oFF.XStringUtils.concatenate3(accountDimensionMemberPrefix, hierarchyName, "].&[");
						memberName = oFF.XStringUtils.concatenate3(accountDimensionHierarchyMemberPrefix, memberName, "]");
					}
				}
			}
		}
		return memberName;
	},
	isFormulaCalculatedDimensionHidden:function(dimension)
	{
			if (oFF.notNull(dimension) && dimension.getDimensionType().isTypeOf(oFF.DimensionType.FORMULA_CALCULATED_DIMENSION))
		{
			var calcDim = dimension;
			return calcDim.isHidden();
		}
		return false;
	},
	exportComponentExtensions:function(exporter, inaElement, component)
	{
			if (oFF.isNull(inaElement) || !inaElement.isStructure() || oFF.isNull(component) || !component.canHaveExtensions())
		{
			return;
		}
		var inAStructure = inaElement;
		var modelComponent = component;
		var extensions = modelComponent.getExtensions();
		if (!extensions.hasElements())
		{
			return;
		}
		var inaExtensions = inAStructure.putNewStructure("Extensions");
		var iterator = extensions.getKeysAsIteratorOfString();
		while (iterator.hasNext())
		{
			var key = iterator.next();
			var value = extensions.getByKey(key);
			inaExtensions.putString(key, value);
		}
	}
};

oFF.QInAImportUtil = {

	importComponentTagging:function(importer, inaElement, modelComponent)
	{
			if (oFF.notNull(inaElement))
		{
			if (importer.mode.isTypeOf(oFF.QModelFormat.INA_REPOSITORY) && inaElement.isStructure() && oFF.notNull(modelComponent))
			{
				var inAStructure = inaElement;
				var componentTagList = inAStructure.getListByKey("ComponentTags");
				if (!oFF.PrUtils.isListEmpty(componentTagList))
				{
					var componentTagging = modelComponent.getTagging();
					for (var i = 0; i < componentTagList.size(); i++)
					{
						var currentComponentTag = componentTagList.getStructureAt(i);
						if (oFF.notNull(currentComponentTag))
						{
							var currentKey = currentComponentTag.getStringByKey("KEY");
							if (oFF.XStringUtils.isNotNullAndNotEmpty(currentKey))
							{
								componentTagging.put(currentKey, currentComponentTag.getStringByKey("VALUE"));
							}
						}
					}
				}
			}
		}
	},
	importComponentExtensions:function(importer, inaElement, component)
	{
			if (oFF.isNull(inaElement) || !inaElement.isStructure() || oFF.isNull(component) || !component.canHaveExtensions() || !importer.getMode().isTypeOf(oFF.QModelFormat.INA_METADATA_CORE))
		{
			return;
		}
		var inAStructure = inaElement;
		var inaExtensions = inAStructure.getStructureByKey("Extensions");
		if (!oFF.XCollectionUtils.hasElements(inaExtensions))
		{
			return;
		}
		var extensions = oFF.XHashMapOfStringByString.create();
		var keys = inaExtensions.getKeysAsReadOnlyListOfString();
		for (var i = 0; i < keys.size(); i++)
		{
			var key = keys.get(i);
			var value = inaExtensions.getStringByKey(key);
			if (oFF.isNull(value))
			{
				continue;
			}
			extensions.put(key, value);
		}
		component.setExtensions(extensions);
	}
};

oFF.QInAValueUtils = {

	importValueByType:function(importer, inaElement, parameterName, valueType)
	{
			return oFF.QInAValueUtils._importValueInternal(importer, null, inaElement, parameterName, valueType, null, true);
	},
	importSupplementsAndValue:function(importer, valueBag, inaElement, parameterName, valueType, field)
	{
			oFF.QInAValueUtils.importValue(importer, valueBag, inaElement, parameterName, valueType, field);
		var supplementsInA = inaElement.getListByKey("Supplements");
		if (oFF.notNull(supplementsInA) && supplementsInA.hasElements())
		{
			var numberOfSupplements = supplementsInA.size();
			for (var i = 0; i < numberOfSupplements; i++)
			{
				var supplementElement = supplementsInA.getStructureAt(i);
				var key = supplementElement.getByKey("Key");
				var value = supplementElement.getByKey("Value");
				var correctedKey = oFF.QInAValueUtils.correctRemovingUnwantedBackslashAndQuotes(key.getString());
				var correctedValue = oFF.QInAValueUtils.correctRemovingUnwantedBackslashAndQuotes(value.getString());
				valueBag.addSupplementValue(correctedKey, correctedValue);
			}
		}
	},
	containsEscapedQuote:function(junkKey)
	{
			return oFF.XStringUtils.isNotNullAndNotEmpty(junkKey) && (oFF.XString.getCharAt(junkKey, 0) === 92 || oFF.XString.getCharAt(junkKey, 0) === 34) && (oFF.XString.getCharAt(junkKey, oFF.XString.size(junkKey) - 1) === 92 || oFF.XString.getCharAt(junkKey, oFF.XString.size(junkKey) - 1) === 34);
	},
	correctRemovingUnwantedBackslashAndQuotes:function(junkKey)
	{
			var cleanedValue = junkKey;
		while (oFF.QInAValueUtils.containsEscapedQuote(cleanedValue))
		{
			cleanedValue = oFF.XStringUtils.stripChars(cleanedValue, 1);
		}
		return cleanedValue;
	},
	importValue:function(importer, valueBag, inaElement, parameterName, valueType, field)
	{
			oFF.QInAValueUtils._importValueInternal(importer, valueBag, inaElement, parameterName, valueType, field, false);
	},
	getDouble:function(inaElement, parameterName2)
	{
			var doubleValue;
		var doubleElement = inaElement.getByKey(parameterName2);
		if (doubleElement.isString())
		{
			var stringValue = doubleElement.getString();
			doubleValue = oFF.XDouble.convertFromString(stringValue);
		}
		else if (doubleElement.isDouble())
		{
			doubleValue = doubleElement.getDouble();
		}
		else if (doubleElement.isInteger())
		{
			doubleValue = doubleElement.getInteger();
		}
		else
		{
			doubleValue = 0.0;
		}
		return doubleValue;
	},
	_importValueInternal:function(importer, valueBag, inaElement, parameterName, valueType, field, returnValue)
	{
			var useSapDateFormat = importer.capabilities.supportsSapDate();
		var useFieldLiteralValue = oFF.PrUtils.getBooleanValueProperty(inaElement, "FieldLiteralValue", false);
		var parameterName2 = parameterName;
		if (oFF.isNull(parameterName2))
		{
			parameterName2 = "Value";
		}
		var valueType2 = valueType;
		if (oFF.isNull(valueType2))
		{
			var inaValueType = inaElement.getStringByKey(oFF.XStringUtils.concatenate2(parameterName2, "Type"));
			valueType2 = oFF.QInAConverter.lookupValueType(inaValueType);
			useSapDateFormat = false;
		}
		if ((valueType2 === oFF.XValueType.DOUBLE || valueType2 === oFF.XValueType.DECIMAL_FLOAT) && inaElement.hasStringByKey(parameterName2))
		{
			valueType2 = oFF.XValueType.STRING;
		}
		var fieldValue;
		var stringValue;
		if (valueType2 === oFF.XValueType.STRING)
		{
			stringValue = inaElement.getStringByKey(parameterName2);
			if (returnValue)
			{
				return oFF.XStringValue.create(stringValue);
			}
			if (oFF.isNull(field) || !useFieldLiteralValue)
			{
				valueBag.setString(stringValue);
			}
			else
			{
				var dimension = field.getDimension();
				var dimensionMember = dimension.getDimensionMember(stringValue);
				if (dimension.isStructure() && oFF.notNull(dimensionMember))
				{
					valueBag.setDimensionMember(dimensionMember);
				}
				else
				{
					fieldValue = field.createFieldLiteralValue();
					fieldValue.setString(stringValue);
					valueBag.setFieldValue(fieldValue);
				}
			}
		}
		else if (valueType2 === oFF.XValueType.DOUBLE || valueType2 === oFF.XValueType.DECIMAL_FLOAT)
		{
			var doubleValue = oFF.QInAValueUtils.getDouble(inaElement, parameterName2);
			if (returnValue)
			{
				return oFF.XDoubleValue.create(doubleValue);
			}
			if (oFF.isNull(field) || !useFieldLiteralValue)
			{
				valueBag.setDouble(doubleValue);
			}
			else
			{
				fieldValue = field.createFieldLiteralValue();
				fieldValue.setDouble(doubleValue);
				valueBag.setFieldValue(fieldValue);
			}
		}
		else if (valueType2 === oFF.XValueType.INTEGER)
		{
			var intValue = inaElement.getIntegerByKey(parameterName2);
			if (returnValue)
			{
				return oFF.XIntegerValue.create(intValue);
			}
			if (oFF.isNull(field) || !useFieldLiteralValue)
			{
				valueBag.setInteger(intValue);
			}
			else
			{
				fieldValue = field.createFieldLiteralValue();
				fieldValue.setInteger(intValue);
				valueBag.setFieldValue(fieldValue);
			}
		}
		else if (valueType2 === oFF.XValueType.BOOLEAN)
		{
			var booleanValue = inaElement.getBooleanByKey(parameterName2);
			if (returnValue)
			{
				return oFF.XBooleanValue.create(booleanValue);
			}
			valueBag.setBoolean(booleanValue);
		}
		else if (valueType2 === oFF.XValueType.LONG)
		{
			var longValue = oFF.PrUtils.getLongValueProperty(inaElement, parameterName2, 0);
			if (returnValue)
			{
				return oFF.XLongValue.create(longValue);
			}
			if (oFF.isNull(field) || !useFieldLiteralValue)
			{
				valueBag.setLong(longValue);
			}
			else
			{
				fieldValue = field.createFieldLiteralValue();
				fieldValue.setLong(longValue);
				valueBag.setFieldValue(fieldValue);
			}
		}
		else if (valueType2 === oFF.XValueType.DATE)
		{
			stringValue = inaElement.getStringByKey(parameterName2);
			var dateValue = oFF.XDate.createDateFromStringWithFlag(stringValue, useSapDateFormat);
			if (returnValue)
			{
				return dateValue;
			}
			if (oFF.isNull(field) || !useFieldLiteralValue)
			{
				valueBag.setDate(dateValue);
			}
			else
			{
				fieldValue = field.createFieldLiteralValue();
				fieldValue.setDate(dateValue);
				valueBag.setFieldValue(fieldValue);
			}
		}
		else if (valueType2 === oFF.XValueType.TIME)
		{
			stringValue = inaElement.getStringByKey(parameterName2);
			var timeValue = oFF.XTime.createTimeFromStringWithFlag(stringValue, useSapDateFormat);
			if (returnValue)
			{
				return timeValue;
			}
			valueBag.setTime(timeValue);
		}
		else if (valueType2 === oFF.XValueType.DATE_TIME)
		{
			stringValue = inaElement.getStringByKey(parameterName2);
			var dateTimeValue = oFF.XDateTime.createDateTimeFromStringWithFlag(stringValue, useSapDateFormat);
			if (returnValue)
			{
				return dateTimeValue;
			}
			if (oFF.isNull(field) || !useFieldLiteralValue)
			{
				valueBag.setDateTime(dateTimeValue);
			}
			else
			{
				fieldValue = field.createFieldLiteralValue();
				fieldValue.setDate(dateTimeValue);
				valueBag.setFieldValue(fieldValue);
			}
		}
		else if (valueType2.isSpatial())
		{
			stringValue = inaElement.getStringByKey(parameterName2);
			var geometry = oFF.XGeometryValue.createGeometryValueWithWkt(stringValue);
			if (returnValue)
			{
				return geometry;
			}
			valueBag.setValue(geometry);
			if (importer.capabilities.supportsSpatialFilterSrid() && inaElement.containsKey("SRID"))
			{
				valueBag.getGeometry().setSrid(oFF.XIntegerValue.create(inaElement.getIntegerByKey("SRID")));
			}
		}
		else if (valueType2 === oFF.XValueType.UNSUPPORTED)
		{
			return null;
		}
		else if (valueType2 === oFF.XValueType.VARIABLE || valueType2 === oFF.XValueType.CURRENT_MEMBER)
		{
			if (!returnValue)
			{
				valueBag.setFilterValueType(valueType2);
			}
			return null;
		}
		else
		{
			importer.addError(oFF.ErrorCodes.INVALID_TOKEN, oFF.XStringUtils.concatenate3("Unsupported value type '", valueType2.getName(), "'"));
			return null;
		}
		return null;
	},
	exportValue:function(exporter, parameterName, inaElement, valueAccess, valueType, _queryModel)
	{
			oFF.QInAValueUtils.exportFieldValue(exporter, parameterName, inaElement, null, valueAccess, valueType);
	},
	exportPlaceholderValue:function(exporter, parameterName, inaElement, valueAccess, valueType, queryModel)
	{
			var newValueAccess = valueAccess;
		if (valueType === oFF.XValueType.STRING || valueAccess.getValueType() === oFF.XValueType.STRING)
		{
			var updatedStringValue = oFF.QInAExportUtil.getMeasureMemberNameByAlias(queryModel, valueAccess.getString(), exporter);
			if (!oFF.XString.isEqual(updatedStringValue, valueAccess.getString()))
			{
				var placeholderValue = oFF.XValueAccess.createWithType(oFF.XValueType.STRING);
				placeholderValue.setString(updatedStringValue);
				newValueAccess = placeholderValue;
			}
		}
		oFF.QInAValueUtils.exportFieldValue(exporter, parameterName, inaElement, null, newValueAccess, valueType);
	},
	exportFieldValue:function(exporter, parameterName, inaElement, field, valueAccess, valueType)
	{
			var parameterName2 = parameterName;
		if (oFF.isNull(parameterName2))
		{
			parameterName2 = "Value";
		}
		var valueType2 = valueType;
		if (oFF.isNull(valueType2))
		{
			valueType2 = valueAccess.getValueType();
			var inaValueType = oFF.QInAConverter.lookupValueTypeInA(valueType2);
			inaElement.putString(oFF.XStringUtils.concatenate2(parameterName2, "Type"), inaValueType);
			exporter.capabilities.setSupportsSapDate(false);
		}
		var valueType3 = valueAccess.getValueType();
		if (valueType3 === oFF.XValueType.DATE || valueType3 === oFF.XValueType.TIME || valueType3 === oFF.XValueType.DATE_TIME)
		{
			valueType2 = valueType3;
		}
		if (valueType2 === oFF.XValueType.STRING)
		{
			inaElement.putString(parameterName2, valueAccess.getString());
		}
		else if (valueType2 === oFF.XValueType.INTEGER)
		{
			inaElement.putInteger(parameterName2, valueAccess.getInteger());
		}
		else if (valueType2 === oFF.XValueType.LONG)
		{
			inaElement.putLong(parameterName2, valueAccess.getLong());
		}
		else if (valueType2 === oFF.XValueType.DOUBLE || valueType2 === oFF.XValueType.DECIMAL_FLOAT)
		{
			if (valueAccess.getValueType() === oFF.XValueType.STRING || exporter.capabilities.supportsStringsForNumericValues())
			{
				inaElement.putString(parameterName2, valueAccess.getString());
			}
			else
			{
				inaElement.putDouble(parameterName2, valueAccess.getDouble());
			}
		}
		else if (valueType2 === oFF.XValueType.BOOLEAN)
		{
			inaElement.putBoolean(parameterName2, valueAccess.getBoolean());
		}
		else if (valueType2 === oFF.XValueType.DATE)
		{
			var dateToSet = oFF.XValueUtil.convertValue(valueAccess.getValue(), oFF.XValueType.DATE);
			if (oFF.notNull(dateToSet))
			{
				oFF.QInAExportUtil.setDate(exporter, inaElement, parameterName2, dateToSet);
			}
			else
			{
				inaElement.putStringNotNull(parameterName2, valueAccess.getString());
			}
		}
		else if (valueType2 === oFF.XValueType.TIME)
		{
			var timeToSet = oFF.XValueUtil.convertValue(valueAccess.getValue(), oFF.XValueType.TIME);
			if (oFF.notNull(timeToSet))
			{
				oFF.QInAExportUtil.setDate(exporter, inaElement, parameterName2, timeToSet);
			}
			else
			{
				inaElement.putStringNotNull(parameterName2, valueAccess.getString());
			}
		}
		else if (valueType2 === oFF.XValueType.DATE_TIME)
		{
			var dateTimeToSet = oFF.XValueUtil.convertValue(valueAccess.getValue(), oFF.XValueType.DATE_TIME);
			if (oFF.notNull(dateTimeToSet))
			{
				oFF.QInAExportUtil.setDate(exporter, inaElement, parameterName2, dateTimeToSet);
			}
			else
			{
				inaElement.putStringNotNull(parameterName2, valueAccess.getString());
			}
		}
		if (oFF.notNull(valueType2) && valueType2.isSpatial())
		{
			var geometry = valueAccess.getGeometry();
			inaElement.putString(parameterName2, geometry.toWKT());
			var srid = geometry.getSrid();
			if (exporter.capabilities.supportsSpatialFilterSrid() && oFF.notNull(srid))
			{
				inaElement.putInteger("SRID", srid.getInteger());
			}
		}
		if (oFF.notNull(field))
		{
			inaElement.putBoolean("FieldLiteralValue", true);
		}
	},
	exportSupplementsAndValue:function(exporter, parameterName, inaElement, field, value, valueType)
	{
			oFF.QInAValueUtils.exportFieldValue(exporter, parameterName, inaElement, field, value, valueType);
		var supplementValues = value.getSupplementValues();
		if (oFF.XCollectionUtils.hasElements(supplementValues))
		{
			var supplementValuesList = inaElement.putNewList("Supplements");
			var numberOfSupplementValues = supplementValues.size();
			for (var j = 0; j < numberOfSupplementValues; j++)
			{
				var supplement = supplementValuesList.addNewStructure();
				var ixKeyValuePair = supplementValues.get(j);
				supplement.putString("Key", ixKeyValuePair.getKey().toString());
				supplement.putString("Value", ixKeyValuePair.getValue().toString());
			}
		}
	},
	exportFilterValue:function(exporter, parameterName, inaElement, value, valueType)
	{
			if (valueType === oFF.XValueType.VARIABLE)
		{
			var variableValue = value.getVariableValue();
			if (oFF.notNull(variableValue))
			{
				inaElement.putString(parameterName, variableValue.getName());
				if (oFF.XString.isEqual(parameterName, "Low"))
				{
					inaElement.putString("LowIs", "Variable");
				}
				else if (oFF.XString.isEqual(parameterName, "High"))
				{
					inaElement.putString("HighIs", "Variable");
				}
			}
		}
		else
		{
			oFF.QInAValueUtils.exportPlaceholderValue(exporter, parameterName, inaElement, value, valueType, value.getQueryModel());
		}
	},
	importSupplements:function(importer, value, structure, parameter, supplementFieldNames)
	{
			if (importer.capabilities.supportsSupplements() && oFF.notNull(parameter) && oFF.XCollectionUtils.hasElements(supplementFieldNames))
		{
			var supplementValues = structure.getListByKey(parameter);
			if (oFF.notNull(supplementValues))
			{
				var sizeA = supplementValues.size();
				var sizeB = supplementFieldNames.size();
				if (sizeA === sizeB)
				{
					for (var i = 0; i < sizeA; i++)
					{
						value.addSupplementValue(supplementFieldNames.get(i), supplementValues.getStringAt(i));
					}
				}
				else
				{
					importer.addWarning(oFF.ErrorCodes.INVALID_STATE, "InA protocol error: Supplement sizes of values and field names do not match.");
				}
			}
		}
	},
	importValueCompounds:function(importer, value, inaStructure, parameter)
	{
			if (oFF.notNull(parameter))
		{
			var componentsIna = inaStructure.getListByKey(parameter);
			if (oFF.notNull(componentsIna))
			{
				for (var i = 0; i < componentsIna.size(); i++)
				{
					var componentIna = componentsIna.getStructureAt(i);
					var valueGroup = value.addNewFilterValueCompound(componentIna.getBooleanByKey("Internal"));
					var groupMembersInA = componentIna.getListByKey("Members");
					if (oFF.notNull(groupMembersInA))
					{
						for (var j = 0; j < groupMembersInA.size(); j++)
						{
							var groupMemberIna = groupMembersInA.getStructureAt(j);
							valueGroup.addMember(groupMemberIna.getStringByKey("Component"), groupMemberIna.getStringByKey("Key"));
						}
					}
				}
			}
		}
	},
	importValueList:function(importer, inaList, valueType)
	{
			if (oFF.notNull(inaList))
		{
			if (valueType.isNumber())
			{
				return oFF.QInAValueUtils.importNumericValues(importer, inaList, valueType);
			}
			if (valueType.isString())
			{
				return oFF.QInAValueUtils.importStringValues(inaList);
			}
			if (valueType === oFF.XValueType.DATE)
			{
				return oFF.QInAValueUtils.importDateValues(importer, inaList);
			}
			if (valueType === oFF.XValueType.TIME)
			{
				return oFF.QInAValueUtils.importTimeValues(importer, inaList);
			}
			if (valueType === oFF.XValueType.DATE_TIME)
			{
				return oFF.QInAValueUtils.importDateTimeValues(importer, inaList);
			}
			if (valueType === oFF.XValueType.BOOLEAN)
			{
				return oFF.QInAValueUtils.importBooleanValues(inaList);
			}
		}
		return oFF.XList.create();
	},
	importNumericValues:function(importer, inaList, valueType)
	{
			var list = oFF.XList.create();
		for (var i = 0; i < inaList.size(); i++)
		{
			var elementAt = inaList.get(i);
			if (importer.capabilities.supportsNumberAsString() && oFF.notNull(elementAt) && elementAt.getType() === oFF.PrElementType.STRING)
			{
				var valueAccess = oFF.XValueAccess.createWithType(valueType);
				valueAccess.parseString(inaList.getStringAt(i));
				list.add(valueAccess.getValue());
				continue;
			}
			if (valueType === oFF.XValueType.INTEGER)
			{
				var integerValue = inaList.getIntegerAt(i);
				list.add(oFF.XIntegerValue.create(integerValue));
			}
			else if (valueType === oFF.XValueType.DOUBLE || valueType === oFF.XValueType.DECIMAL_FLOAT)
			{
				var doubleValue = inaList.getDoubleAt(i);
				list.add(oFF.XDoubleValue.create(doubleValue));
			}
			else if (valueType === oFF.XValueType.LONG)
			{
				var longValue = inaList.getLongAt(i);
				list.add(oFF.XLongValue.create(longValue));
			}
		}
		return list;
	},
	importDateTimeValues:function(importer, inaList)
	{
			var list = oFF.XList.create();
		for (var i = 0; i < inaList.size(); i++)
		{
			var dateTimeValue = inaList.getStringAt(i);
			if (oFF.XStringUtils.isNotNullAndNotEmpty(dateTimeValue))
			{
				oFF.XCollectionUtils.addIfNotNull(list, oFF.XDateTime.createDateTimeFromStringWithFlag(dateTimeValue, importer.capabilities.supportsSapDate()));
			}
		}
		return list;
	},
	importTimeValues:function(importer, inaList)
	{
			var list = oFF.XList.create();
		for (var i = 0; i < inaList.size(); i++)
		{
			var timeValue = inaList.getStringAt(i);
			if (oFF.XStringUtils.isNotNullAndNotEmpty(timeValue))
			{
				oFF.XCollectionUtils.addIfNotNull(list, oFF.XTime.createTimeFromStringWithFlag(timeValue, importer.capabilities.supportsSapDate()));
			}
		}
		return list;
	},
	importDateValues:function(importer, inaList)
	{
			var list = oFF.XList.create();
		for (var i = 0; i < inaList.size(); i++)
		{
			var dateValue = inaList.getStringAt(i);
			if (oFF.XStringUtils.isNotNullAndNotEmpty(dateValue))
			{
				oFF.XCollectionUtils.addIfNotNull(list, oFF.XDate.createDateFromStringWithFlag(dateValue, importer.capabilities.supportsSapDate()));
			}
		}
		return list;
	},
	importStringValues:function(inaList)
	{
			var list = oFF.XList.create();
		for (var idxValue = 0; idxValue < inaList.size(); idxValue++)
		{
			list.add(oFF.XStringValue.create(inaList.getStringAt(idxValue)));
		}
		return list;
	},
	importBooleanValues:function(inaList)
	{
			var list = oFF.XList.create();
		for (var idxValue = 0; idxValue < inaList.size(); idxValue++)
		{
			list.add(oFF.XBooleanValue.create(inaList.getBooleanAt(idxValue)));
		}
		return list;
	}
};

oFF.QInARepoDataSourceBlending = {

	exportDataSourceBlending:function(format, blendingDefinition, isBlendingDataRequest)
	{
			var inaRequest = oFF.PrFactory.createStructure();
		var inaMetadata = inaRequest.putNewStructure("Metadata");
		var inaDataSource = inaMetadata.putNewStructure("DataSource");
		inaDataSource.putString("Type", oFF.QueryManagerMode.BLENDING.getName());
		var objectName = oFF.XStringBuffer.create();
		for (var idx = 0; idx < blendingDefinition.getSources().size(); idx++)
		{
			objectName.append(blendingDefinition.getSources().get(idx).getQueryAliasName());
		}
		var objectNameStr = objectName.toString();
		if (objectName.length() >= 256)
		{
			objectNameStr = oFF.XSha1.createSHA1(objectNameStr);
		}
		inaDataSource.putString("ObjectName", objectNameStr);
		var inaBlendingSources = oFF.QInARepoDataSourceBlending.exportBlendingSources(format, blendingDefinition, isBlendingDataRequest);
		inaDataSource.put("Sources", inaBlendingSources);
		var inaBlendingMappings = oFF.QInARepoDataSourceBlending.exportBlendingMappings(blendingDefinition.getMappings());
		inaDataSource.put("Mappings", inaBlendingMappings);
		return inaDataSource;
	},
	exportBlendingSources:function(format, blendingDefinition, isBlendingDataRequest)
	{
			var blendingSourceFormat = format;
		var inaSources = oFF.PrFactory.createList();
		var sourceIterator = blendingDefinition.getSources().getIterator();
		while (sourceIterator.hasNext())
		{
			var source = sourceIterator.next();
			var queryModel = source.getQueryModel();
			if (oFF.isNull(queryModel))
			{
				return null;
			}
			var inaSource = inaSources.addNewStructure();
			inaSource.putString("Type", "Query");
			inaSource.putString("AliasName", source.getQueryAliasName());
			inaSource.putString("ObjectName", source.getQueryAliasName());
			var inaDefiningContext = inaSource.putNewStructure("DefiningContext");
			var inaQuery = queryModel.serializeToElement(blendingSourceFormat).asStructure();
			oFF.QInARepoDataSourceBlending.exportOptimizerHints(inaQuery, queryModel.getOptimizerHintsByExecutionEngine(oFF.ExecutionEngine.MDS));
			var queryManager = queryModel.getQueryManager();
			var persistenceIdentifier = queryManager.getResultSetPersistenceIdentifier();
			if (!source.isRemoteSource() && oFF.XStringUtils.isNotNullAndNotEmpty(persistenceIdentifier) && isBlendingDataRequest)
			{
				inaQuery.getStructureByKey("DataSource").putString("InstanceId", persistenceIdentifier);
			}
			var inaResultSetFeatures = oFF.QInARepoDataSourceBlending.exportResultSetFeatures(queryModel, true);
			inaQuery.put("ResultSetFeatureRequest", inaResultSetFeatures);
			inaDefiningContext.put("Definition", inaQuery);
		}
		oFF.XObjectExt.release(sourceIterator);
		return inaSources;
	},
	updateRemoteDataSource:function(inaQuery, queryManager, isBlendingDataRequest, localSystemDescription)
	{
			var dataSource = inaQuery.putNewStructure("DataSource");
		dataSource.putString("Type", "SerializedData");
		dataSource.putString("InstanceId", queryManager.getResultSetPersistenceIdentifier());
		var resultSetContainer = queryManager.getActiveResultSetContainer();
		var systemDescription = queryManager.getSystemDescription();
		var hasSerializedData = oFF.XStringUtils.isNotNullAndNotEmpty(resultSetContainer.getSerializedView()) && (!isBlendingDataRequest || oFF.XStringUtils.isNotNullAndNotEmpty(resultSetContainer.getSerializedCube()));
		if (!hasSerializedData && localSystemDescription.isSystemMappingValid(systemDescription))
		{
			var mappingRemoteHost = systemDescription.getSystemMapping(localSystemDescription.getSystemName());
			dataSource.putString("ObjectName", mappingRemoteHost.getDeserializeTable());
			dataSource.putString("SchemaName", mappingRemoteHost.getDeserializeSchema());
		}
		else
		{
			var serializedData = dataSource.putNewStructure("SerializedData");
			serializedData.putString("View", resultSetContainer.getSerializedView());
			if (isBlendingDataRequest)
			{
				serializedData.putStringNotNullAndNotEmpty("Cube", resultSetContainer.getSerializedCube());
			}
		}
		oFF.QInARepoDataSourceBlending.updateBWRemoteSource(inaQuery, queryManager.getSystemType(), queryManager.getQueryModel());
	},
	exportOptimizerHints:function(inaDefinition, optimizerHints)
	{
			if (oFF.XCollectionUtils.hasElements(optimizerHints))
		{
			var sortedList = optimizerHints.getKeysAsReadOnlyListOfString();
			sortedList.sortByDirection(oFF.XSortDirection.ASCENDING);
			var inaOptimizerHints = inaDefinition.putNewStructure("Hints");
			var inaAEngineHints = inaOptimizerHints.putNewList(oFF.ExecutionEngine.MDS.getName());
			var sortedListSize = sortedList.size();
			for (var i = 0; i < sortedListSize; i++)
			{
				var hintName = sortedList.get(i);
				var inaHint = inaAEngineHints.addNewStructure();
				inaHint.putString("Key", hintName);
				inaHint.putString("Value", optimizerHints.getByKey(hintName));
			}
		}
	},
	updateBWRemoteSource:function(inaQuery, systemType, queryModel)
	{
			if (systemType.isTypeOf(oFF.SystemType.BW) || systemType.isTypeOf(oFF.SystemType.VIRTUAL_INA))
		{
			inaQuery.remove("FixedFilter");
			inaQuery.remove("DynamicFilter");
			inaQuery.remove("Filter");
			inaQuery.remove("Conditions");
			inaQuery.remove("Query");
			inaQuery.remove("QueryDataCells");
			inaQuery.remove("Sort");
			inaQuery.remove("ExtendedSortTypes");
			inaQuery.remove("Variables");
			inaQuery.remove("UniversalDisplayHierarchies");
			var extStructureMemberNames = oFF.QInARepoDataSourceBlending.getExtendedStructureMemberNames(queryModel);
			var inaDimensions = inaQuery.getListByKey("Dimensions");
			var dimensionCount = oFF.PrUtils.getListSize(inaDimensions, 0);
			for (var i = 0; i < dimensionCount; i++)
			{
				var inaMembers = inaDimensions.getStructureAt(i).getListByKey("Members");
				var memberCount = oFF.PrUtils.getListSize(inaMembers, 0);
				for (var k = 0; k < memberCount; k++)
				{
					var inaMember = inaMembers.getStructureAt(k);
					if (extStructureMemberNames.contains(inaMember.getStringByKey("Name")))
					{
						inaMember.remove("Selection");
					}
				}
			}
		}
	},
	getExtendedStructureMemberNames:function(queryModel)
	{
			var structureMembers = queryModel.getMeasureDimension().getExtendedStructureMembers();
		return oFF.XCollectionUtils.createListOfNames(structureMembers);
	},
	exportResultSetFeatures:function(sourceQueryModel, isSubQuery)
	{
			var options = oFF.PrFactory.createStructure();
		options.putBoolean("UseDefaultAttributeKey", false);
		var queryManager = sourceQueryModel.getQueryManager();
		if (queryManager.getMaxResultRecords() !== -1)
		{
			options.putLong("MaxResultRecords", queryManager.getMaxResultRecords());
		}
		oFF.QInARepoOptions.exportPaging(options, queryManager);
		oFF.QInARepoOptions.exportSuppressKeyfigureCalculation(options, queryManager);
		options.putString("ResultFormat", "Version2");
		options.putString("ResultEncoding", "None");
		if (isSubQuery)
		{
			options.putBoolean("IsCubeBlendingSubquery", true);
		}
		if (!queryManager.isResultSetTransportEnabled())
		{
			options.putBoolean("ReturnEmptyJsonResultSet", true);
		}
		return options;
	},
	exportDimensionMapping:function(dimensionMapping)
	{
			var inaMapping = oFF.PrFactory.createStructure();
		inaMapping.putString("DimensionName", dimensionMapping.getMemberName());
		inaMapping.putString("LinkType", dimensionMapping.getLinkType().getName());
		if (dimensionMapping.isPreservingMembers())
		{
			inaMapping.putBoolean("PreserveMembers", true);
		}
		if (!dimensionMapping.isReturningOriginKeys())
		{
			inaMapping.putBoolean("ReturnOriginKeys", false);
		}
		var definitionIterator = dimensionMapping.getMappingDefinitions().getIterator();
		var inaDefinitions = oFF.QInARepoDataSourceBlending.exportMappingDefinitions(definitionIterator);
		oFF.XObjectExt.release(definitionIterator);
		inaMapping.put("Mapping", inaDefinitions);
		if ((dimensionMapping.getLinkType() === oFF.BlendingLinkType.ALL_DATA || dimensionMapping.getLinkType() === oFF.BlendingLinkType.NONE) && dimensionMapping.getConstantMappings().hasElements())
		{
			oFF.QInARepoDataSourceBlending.exportConstantMapping(inaDefinitions, dimensionMapping.getConstantMappings().getIterator());
		}
		var inaAttributeMappings = oFF.PrFactory.createList();
		var attributeMappingIterator = dimensionMapping.getAttributeMappings().getIterator();
		while (attributeMappingIterator.hasNext())
		{
			var attributeMapping = attributeMappingIterator.next();
			var inaAttributeMapping = oFF.QInARepoDataSourceBlending.exportAttributeMapping(attributeMapping);
			inaAttributeMappings.add(inaAttributeMapping);
		}
		oFF.XObjectExt.release(attributeMappingIterator);
		if (!inaAttributeMappings.isEmpty())
		{
			inaMapping.put("AttributeMappings", inaAttributeMappings);
		}
		return inaMapping;
	},
	exportAttributeMapping:function(attributeMapping)
	{
			var inaAttributeMapping = oFF.PrFactory.createStructure();
		inaAttributeMapping.putString("AttributeName", attributeMapping.getAttributeName());
		inaAttributeMapping.putBoolean("IsLinkKey", attributeMapping.isLinkKey());
		var mappingIterator = attributeMapping.getAttributeMappingDefinitions().getIterator();
		var inaMappings = oFF.QInARepoDataSourceBlending.exportMappingDefinitions(mappingIterator);
		oFF.XObjectExt.release(mappingIterator);
		inaAttributeMapping.put("Mapping", inaMappings);
		oFF.QInARepoDataSourceBlending.exportConstantMapping(inaMappings, attributeMapping.getConstantMappings().getIterator());
		return inaAttributeMapping;
	},
	exportConstantMapping:function(inaDefinitions, definitionIterator)
	{
			while (definitionIterator.hasNext())
		{
			var constantMapping = definitionIterator.next();
			var inaConstantMapping = oFF.PrFactory.createStructure();
			inaConstantMapping.putString("AliasName", constantMapping.getQueryAliasName());
			var inaMappingDefinition = inaConstantMapping.putNewStructure("MappingDefinition");
			var inaMember = inaMappingDefinition.putNewStructure("Constant");
			inaMember.putString("Value", constantMapping.getMemberName());
			inaMember.putString("ValueType", oFF.QInAConverter.lookupValueTypeInA(constantMapping.getValueType()));
			inaDefinitions.add(inaConstantMapping);
		}
	},
	exportMappingDefinitions:function(definitionIterator)
	{
			var inaDefinitions = oFF.PrFactory.createList();
		while (definitionIterator.hasNext())
		{
			var definition = definitionIterator.next();
			var inaDefinition = inaDefinitions.addNewStructure();
			inaDefinition.putString("AliasName", definition.getQueryAliasName());
			var inaMappingDefinition = inaDefinition.putNewStructure("MappingDefinition");
			var inaMember = inaMappingDefinition.putNewStructure("Member");
			inaMember.putString("Name", definition.getMemberName());
		}
		return inaDefinitions;
	},
	exportBlendingMappings:function(mappings)
	{
			var inaMappings = oFF.PrFactory.createList();
		var mappingIterator = mappings.getIterator();
		while (mappingIterator.hasNext())
		{
			var mapping = mappingIterator.next();
			var inaMapping = oFF.QInARepoDataSourceBlending.exportDimensionMapping(mapping);
			inaMappings.add(inaMapping);
		}
		return inaMappings;
	}
};

oFF.QInARepoDataSourceExtDims = {

	importQd:function(importer, dataSource, inaDataSource)
	{
			if (importer.capabilities.supportsExtendedDimensions())
		{
			var extendedDimensionsBase = dataSource.getExtendedDimensionsBase();
			extendedDimensionsBase.clear();
			var inaExtendedDimensions = inaDataSource.getListByKey("ExtendedDimensions");
			if (oFF.notNull(inaExtendedDimensions))
			{
				var extDimSize = inaExtendedDimensions.size();
				for (var i = 0; i < extDimSize; i++)
				{
					var inaExtendedDimension = inaExtendedDimensions.getStructureAt(i);
					var name = inaExtendedDimension.getStringByKey("Name");
					var joinFieldName = inaExtendedDimension.getStringByKey("JoinFieldName");
					var joinFieldNameInExtendedDim = inaExtendedDimension.getStringByKey("JoinFieldNameInExtendedDimension");
					var extendedDimension = dataSource.addNewExtendedDimension(name, joinFieldName, joinFieldNameInExtendedDim);
					extendedDimension.setText(inaExtendedDimension.getStringByKey("Description"));
					var joinTypeValue = inaExtendedDimension.getStringByKey("JoinType");
					var joinType = oFF.JoinType.lookup(joinTypeValue);
					extendedDimension.setJoinType(joinType);
					oFF.QInARepoDataSourceExtDims.importJoinParameter(inaExtendedDimension, extendedDimension);
					oFF.QInARepoDataSourceExtDims.importExtendedDataSource(inaExtendedDimension, extendedDimension);
					var renamingMode = inaExtendedDimension.getStringByKey("FieldRenamingMode");
					if (oFF.notNull(renamingMode))
					{
						extendedDimension.setRenamingMode(renamingMode);
					}
					var joinCardinalityValue = inaExtendedDimension.getStringByKey("JoinCardinality");
					if (oFF.XStringUtils.isNotNullAndNotEmpty(joinCardinalityValue))
					{
						var joinCardinality = oFF.JoinCardinality.lookup(joinCardinalityValue);
						extendedDimension.setJoinCardinality(joinCardinality);
					}
					var extendedDimensionVisibility = inaExtendedDimension.getStringByKey("Visibility");
					if (oFF.XStringUtils.isNotNullAndNotEmpty(extendedDimensionVisibility))
					{
						var dimensionVisibility = oFF.DimensionVisibility.lookup(extendedDimensionVisibility);
						if (oFF.notNull(dimensionVisibility))
						{
							extendedDimension.setVisibility(dimensionVisibility);
						}
					}
				}
			}
		}
	},
	importExtendedDataSource:function(inaExtendedDimension, extendedDimension)
	{
			var inaExternalDataSource = inaExtendedDimension.getStructureByKey("DataSource");
		if (oFF.notNull(inaExternalDataSource))
		{
			var externalDataSource = oFF.QFactory.createDataSource();
			oFF.QInARepoDataSourceProperties.importQd(externalDataSource, inaExternalDataSource);
			var type;
			var inaType = inaExternalDataSource.getStringByKey("Type");
			if (oFF.isNull(inaType))
			{
				type = oFF.MetaObjectType.DBVIEW;
			}
			else
			{
				type = oFF.MetaObjectType.lookup(oFF.XString.toLowerCase(inaType));
			}
			externalDataSource.setType(type);
			extendedDimension.setDataSource(externalDataSource);
		}
	},
	importJoinParameter:function(inaExtendedDimension, extendedDimension)
	{
			var inaJoinParameters = inaExtendedDimension.getListByKey("JoinParameters");
		if (oFF.notNull(inaJoinParameters))
		{
			var joinParameters = extendedDimension.getJoinParameters();
			joinParameters.clear();
			var joinParamSize = inaJoinParameters.size();
			for (var j = 0; j < joinParamSize; j++)
			{
				joinParameters.add(inaJoinParameters.getStringAt(j));
			}
		}
	},
	checkIsValid:function(exporter, extDimension)
	{
			var joinType = extDimension.getJoinType();
		if (oFF.isNull(joinType))
		{
			exporter.addError(oFF.ErrorCodes.INVALID_PARAMETER, oFF.XStringUtils.concatenate3("Extended dimension '", extDimension.getName(), "' is missing a JoinType"));
			return false;
		}
		var dimensionType = extDimension.getDimensionType();
		if (dimensionType.isTypeOf(oFF.DimensionType.GIS_DIMENSION) && joinType.isTypeOf(oFF.JoinType._TIME))
		{
			exporter.addError(oFF.ErrorCodes.INVALID_PARAMETER, "Spatial extended dimensions must not have join type INNER");
			return false;
		}
		else if ((dimensionType.isTypeOf(oFF.DimensionType.TIME) || dimensionType.isTypeOf(oFF.DimensionType.DATE)) && joinType.isTypeOf(oFF.JoinType._SPATIAL))
		{
			exporter.addError(oFF.ErrorCodes.INVALID_PARAMETER, "Time extended dimensions must not have spatial join type");
			return false;
		}
		var externalDataSource = extDimension.getDataSource();
		if (oFF.isNull(externalDataSource))
		{
			exporter.addError(oFF.ErrorCodes.INVALID_PARAMETER, oFF.XStringUtils.concatenate3("Extended dimension '", extDimension.getName(), "' is missing its DataSource"));
			return false;
		}
		var joinParameters = extDimension.getJoinParameters();
		if (joinType === oFF.JoinType.WITHIN_DISTANCE && joinParameters.isEmpty())
		{
			exporter.addError(oFF.ErrorCodes.INVALID_PARAMETER, oFF.XStringUtils.concatenate3("Extended dimension '", extDimension.getName(), "' of joinType 'WITHIN_DISTANCE' is expected to have the 2 parameters 'distance' and 'unit of measure' (in that order)"));
			return false;
		}
		return true;
	},
	exportQd:function(exporter, dataSource, inaDataSource)
	{
			var extendedDimensions = dataSource.getExtendedDimensions();
		if (oFF.XCollectionUtils.hasElements(extendedDimensions))
		{
			var inaExtendedDimensions = inaDataSource.putNewList("ExtendedDimensions");
			for (var extDimIdx = 0; extDimIdx < extendedDimensions.size(); extDimIdx++)
			{
				var extDimension = extendedDimensions.get(extDimIdx);
				if (!oFF.QInARepoDataSourceExtDims.checkIsValid(exporter, extDimension))
				{
					return;
				}
				var inaExtendedDimension = inaExtendedDimensions.addNewStructure();
				inaExtendedDimension.putString("Name", extDimension.getName());
				inaExtendedDimension.putString("Description", extDimension.getText());
				inaExtendedDimension.putInteger("DimensionType", oFF.QInAConverter.lookupDimensionTypeInA(extDimension.getDimensionType()));
				inaExtendedDimension.putString("JoinFieldName", extDimension.getJoinField());
				inaExtendedDimension.putString("JoinFieldNameInExtendedDimension", extDimension.getJoinFieldNameExternal());
				inaExtendedDimension.putString("JoinType", extDimension.getJoinType().getName());
				var joinCardinality = extDimension.getJoinCardinality();
				if (oFF.notNull(joinCardinality))
				{
					inaExtendedDimension.putString("JoinCardinality", joinCardinality.getName());
				}
				var queryManager = dataSource.getQueryManager();
				var modelCapabilities = null;
				if (oFF.notNull(queryManager))
				{
					modelCapabilities = queryManager.getModelCapabilities();
				}
				if (oFF.isNull(modelCapabilities))
				{
					modelCapabilities = exporter.capabilities;
				}
				if (modelCapabilities.supportsDimensionVisibility() && modelCapabilities.supportsExtendedDimensionVisibility())
				{
					var dimensionVisibility = extDimension.getVisibility();
					if (oFF.notNull(dimensionVisibility))
					{
						inaExtendedDimension.putString("Visibility", dimensionVisibility.getName());
					}
				}
				var joinParameters = extDimension.getJoinParameters();
				if (joinParameters.hasElements())
				{
					var inaJoinParameters = inaExtendedDimension.putNewList("JoinParameters");
					inaJoinParameters.addAllStrings(joinParameters);
				}
				var externalDataSource = extDimension.getDataSource();
				var inaExternalDataSource = inaExtendedDimension.putNewStructure("DataSource");
				oFF.QInARepoDataSourceProperties.exportQd(exporter, externalDataSource, inaExternalDataSource, false);
				var type = externalDataSource.getType();
				if (oFF.isNull(type))
				{
					inaExternalDataSource.putString("Type", oFF.MetaObjectType.DBVIEW.getCamelCaseName());
				}
				else
				{
					inaExternalDataSource.putString("Type", type.getCamelCaseName());
				}
				if (modelCapabilities.supportsExtendedDimensionsChangeDefaultRenamingAndDescription())
				{
					inaExtendedDimension.putStringNotNull("FieldRenamingMode", extDimension.getRenamingMode());
				}
			}
		}
	}
};

oFF.QInARepoDataSourceProperties = {

	importQd:function(dataSource, structure)
	{
			var name = structure.getStringByKey("ObjectName");
		dataSource.setName(name);
		var environmentName = structure.getStringByKey("Environment");
		dataSource.setEnvironmentName(environmentName);
		var packageName = structure.getStringByKey("PackageName");
		dataSource.setPackageName(packageName);
		var schemaName = structure.getStringByKey("SchemaName");
		dataSource.setSchemaName(schemaName);
		var sourceQuery = structure.getStringByKey("SourceQuery");
		dataSource.setSourceQuery(sourceQuery);
		var aliasName = structure.getStringByKey("AliasName");
		dataSource.setAlias(aliasName);
		var dataArea = structure.getStringByKey("DataArea");
		dataSource.setDataArea(dataArea);
		var runAsUser = structure.getStringByKey("RunAsUser");
		dataSource.setRunAsUser(runAsUser);
		var text = structure.getStringByKey("Description");
		dataSource.setText(text);
		var inaCustomProperties = structure.getStructureByKey("CustomProperties");
		if (oFF.notNull(inaCustomProperties))
		{
			var customPropertyNames = inaCustomProperties.getKeysAsReadOnlyListOfString();
			var size = customPropertyNames.size();
			for (var i = 0; i < size; i++)
			{
				var key = customPropertyNames.get(i);
				dataSource.addCustomProperty(key, inaCustomProperties.getStringByKey(key));
			}
		}
	},
	exportQd:function(exporter, dataSource, inaDataSource, withRunAsUser)
	{
			oFF.QInAExportUtil.setNonEmptyString(inaDataSource, "ObjectName", dataSource.getObjectName());
		oFF.QInAExportUtil.setNonEmptyString(inaDataSource, "Environment", dataSource.getEnvironmentName());
		oFF.QInAExportUtil.setNonEmptyString(inaDataSource, "PackageName", dataSource.getPackageName());
		oFF.QInAExportUtil.setNonEmptyString(inaDataSource, "SchemaName", dataSource.getSchemaName());
		oFF.QInAExportUtil.setNonEmptyString(inaDataSource, "AliasName", dataSource.getAlias());
		if (exporter.getSession().hasFeature(oFF.FeatureToggleOlap.UNIVERSE_SOURCE_QUERY) && oFF.QInARepoDataSourceProperties.exportSourceQuery(dataSource))
		{
			oFF.QInAExportUtil.setNonEmptyString(inaDataSource, "SourceQuery", dataSource.getSourceQuery());
		}
		var customProperties = dataSource.getCustomProperties();
		var customPropertiesIt = customProperties.getKeysAsIteratorOfString();
		if (customPropertiesIt.hasNext())
		{
			var inaCustomProperties = inaDataSource.putNewStructure("CustomProperties");
			while (customPropertiesIt.hasNext())
			{
				var key = customPropertiesIt.next();
				if (!oFF.XString.isEqual(key, oFF.QDataSource.SOURCE_QUERY_INA) || oFF.QInARepoDataSourceProperties.exportSourceQuery(dataSource))
				{
					oFF.QInAExportUtil.setNonEmptyString(inaCustomProperties, key, customProperties.getByKey(key));
				}
			}
		}
		var dataArea = dataSource.getDataArea();
		if (!oFF.XString.isEqual(dataArea, "DEFAULT"))
		{
			oFF.QInAExportUtil.setNonEmptyString(inaDataSource, "DataArea", dataArea);
		}
		if (withRunAsUser)
		{
			oFF.QInAExportUtil.setNonEmptyString(inaDataSource, "RunAsUser", dataSource.getRunAsUser());
		}
		oFF.QInAExportUtil.setNonEmptyString(inaDataSource, "Description", dataSource.getText());
	},
	exportSourceQuery:function(dataSource)
	{
			var skipSourceQuery = false;
		var context = dataSource.getContext();
		if (oFF.notNull(context))
		{
			var queryManager = context.getQueryManager();
			if (oFF.notNull(queryManager))
			{
				var queryServiceConfig = queryManager.getQueryServiceConfig();
				skipSourceQuery = queryServiceConfig.isSkipSourceQueryForNonMetadataRequests();
			}
		}
		return !skipSourceQuery;
	}
};

oFF.QInARepoOptions = {

	exportOptions:function(provider)
	{
			var inaOptions = oFF.PrFactory.createStructure();
		inaOptions.putBoolean("UseDefaultAttributeKey", false);
		var resultSetContainer = provider.getActiveResultSetContainer();
		if (resultSetContainer.getMaxResultRecords() !== -1)
		{
			inaOptions.putLong("MaxResultRecords", resultSetContainer.getMaxResultRecords());
		}
		var dataRefreshEnabled = resultSetContainer.getDataRefreshEnabled();
		if (dataRefreshEnabled === oFF.ActionChoice.ON || dataRefreshEnabled === oFF.ActionChoice.ONCE)
		{
			inaOptions.putBoolean("Refresh", true);
		}
		var hasSchemaAndTable = false;
		if (oFF.XStringUtils.isNotNullAndNotEmpty(resultSetContainer.getResultSetPersistenceTable()))
		{
			inaOptions.putString("ResultSetPersistanceTable", resultSetContainer.getResultSetPersistenceTable());
			if (oFF.XStringUtils.isNotNullAndNotEmpty(resultSetContainer.getResultSetPersistenceSchema()))
			{
				inaOptions.putString("ResultSetPersistanceSchema", resultSetContainer.getResultSetPersistenceSchema());
				hasSchemaAndTable = true;
			}
		}
		if (!resultSetContainer.isResultSetTransportEnabled())
		{
			inaOptions.putBoolean("ReturnEmptyJsonResultSet", true);
		}
		oFF.QInARepoOptions.exportPaging(inaOptions, provider);
		oFF.QInARepoOptions.exportSuppressKeyfigureCalculation(inaOptions, provider);
		if (provider.getExecuteRequestOnOldResultSet())
		{
			inaOptions.putBoolean("ExecuteRequestOnOldResultSet", true);
		}
		if (provider.isIncludePerformanceNotDefault())
		{
			inaOptions.putBoolean("IncludePerformanceData", provider.isRequestingPerformanceData());
		}
		var capabilitiesBase = provider.getCapabilitiesBase();
		if (capabilitiesBase.supportsAutoVariableSubmit())
		{
			if (provider.getSession().hasFeature(oFF.FeatureToggleOlap.PREREQUISITE_FOR_AUTO_SUBMIT_AFTER_SUBMITTED))
			{
				inaOptions.putBoolean("IgnoreAutoSubmit", !provider.isProcessingAutoSubmit());
			}
			else
			{
				inaOptions.putBoolean("IgnoreAutoSubmit", !provider.getInitSettings().isEnableAutoVariableSubmit());
			}
		}
		var queryModel = provider.getQueryModel();
		if (capabilitiesBase.supportsEncodedResultset())
		{
			inaOptions.putString("ResultFormat", "Version2");
			inaOptions.putString("ResultEncoding", "None");
			if (resultSetContainer.getResultSetPersistenceIdentifier() !== null)
			{
				var isBlendingSubQuery = !resultSetContainer.isRemotePreQuery();
				if (isBlendingSubQuery)
				{
					inaOptions.putBoolean("IsCubeBlendingSubquery", true);
				}
				if (oFF.QInARepoOptions.isCubeCacheQuery(queryModel))
				{
					inaOptions.putString("ResultSetPersistanceIdentifier", resultSetContainer.getResultSetPersistenceIdentifier());
				}
				else
				{
					inaOptions.putString("ResultFormat", "SerializedData");
					if (hasSchemaAndTable)
					{
						inaOptions.putString("ResultSetPersistanceIdentifier", resultSetContainer.getResultSetPersistenceIdentifier());
					}
					if (provider.getSystemType().isTypeOf(oFF.SystemType.BW))
					{
						if (isBlendingSubQuery && provider.getResultSetPersistenceType() === oFF.BlendingPersistenceType.VIEW)
						{
							inaOptions.putString("ResultSetPersistanceType", "View");
						}
						else if (isBlendingSubQuery && provider.getResultSetPersistenceType() === oFF.BlendingPersistenceType.CUBE)
						{
							inaOptions.putString("ResultSetPersistanceType", "Cube");
						}
					}
				}
			}
		}
		if (oFF.notNull(queryModel) && capabilitiesBase.supportsKeepOriginalTexts())
		{
			inaOptions.putBoolean("ResultKeepOriginalTexts", queryModel.isKeepingOriginalTexts());
		}
		if (resultSetContainer.getSuppressCalculatedMembersWithoutBookedData() !== -1)
		{
			inaOptions.putInteger("SuppressCalculatedMembersWithoutBookedData", resultSetContainer.getSuppressCalculatedMembersWithoutBookedData());
		}
		return inaOptions;
	},
	isCubeCacheQuery:function(queryModel)
	{
			var hints = queryModel.getOptimizerHintsByExecutionEngine(oFF.ExecutionEngine.MDS);
		return oFF.notNull(hints) && hints.containsKey(oFF.OptimizerHint.CUBE_CACHE_WITH_ID.getName());
	},
	fillOptions:function(requestStructure, capabilities, session, initSettings)
	{
			var options = oFF.PrFactory.createList();
		if (capabilities.supportsServerState())
		{
			options.addString("StatefulServer");
		}
		var serverCustomizations = initSettings.getServerCustomizations();
		options.addAllStrings(serverCustomizations.getValuesAsReadOnlyListOfString());
		if (session.hasFeature(oFF.FeatureToggleOlap.NO_EMPTY_OPTIONS) === false || options.hasElements())
		{
			requestStructure.put("Options", options);
		}
	},
	setRequestTimeZone:function(requestStructure, provider)
	{
			if (oFF.notNull(requestStructure) && provider.getModelCapabilities().supportsRequestTimezone())
		{
			requestStructure.putStringNotNullAndNotEmpty("Timezone", provider.getQueryServiceConfig().getRequestTimeZone());
		}
	},
	setLanguage:function(requestStructure, provider)
	{
			var language = provider.getConnection().getSystemDescription().getLanguage();
		if (oFF.XStringUtils.isNotNullAndNotEmpty(language))
		{
			requestStructure.putString("Language", language);
		}
	},
	importReturnedDataSelections:function(inaResultStructureFeature, provider)
	{
			if (oFF.notNull(inaResultStructureFeature))
		{
			if (provider.supportsReturnedDataSelection())
			{
				var inaReturnedDataSelection = inaResultStructureFeature.getStructureByKey("ReturnedDataSelection");
				if (oFF.notNull(inaReturnedDataSelection) && inaReturnedDataSelection.hasElements())
				{
					var inaElementNames = inaReturnedDataSelection.getKeysAsReadOnlyListOfString();
					var size = inaElementNames.size();
					for (var i = 0; i < size; i++)
					{
						var dataSelection = oFF.QInAConverter.lookupReturnedDataSelection(inaElementNames.get(i));
						if (oFF.notNull(dataSelection))
						{
							var queryModel = provider.getQueryModel();
							if (dataSelection === oFF.ReturnedDataSelection.TUPLE_ELEMENT_IDS)
							{
								queryModel.toggleReturnedDataSelection(dataSelection, true);
								continue;
							}
							queryModel.toggleReturnedDataSelection(dataSelection, inaReturnedDataSelection.getBooleanByKeyExt(dataSelection.getName(), false));
						}
					}
				}
			}
		}
	},
	exportReturnedDataSelections:function(inaOptions, provider)
	{
			if (provider.supportsReturnedDataSelection())
		{
			var inaReturnedDataSelection = inaOptions.putNewStructure("ReturnedDataSelection");
			var allReturnedDataSelections = provider.getQueryModel().getAllReturnedDataSelections();
			var keysAsIterator = allReturnedDataSelections.getKeysAsIterator();
			while (keysAsIterator.hasNext())
			{
				var retDataSel = keysAsIterator.next();
				inaReturnedDataSelection.putBoolean(oFF.QInAConverter.lookupReturnedDataSelectionInA(retDataSel), allReturnedDataSelections.getByKey(retDataSel).getBoolean());
			}
		}
	},
	importOptimizerHints:function(inaDefinition, provider)
	{
			if (provider.getModelCapabilities().supportsCeScenarioParams())
		{
			provider.getQueryModel().clearAllOptimizerHints();
			var inaOptimizerHints = inaDefinition.getStructureByKey("Hints");
			if (oFF.notNull(inaOptimizerHints))
			{
				oFF.QInARepoOptions.importOptimizerHintsByEngine(inaOptimizerHints, oFF.ExecutionEngine.CALC_ENGINE, provider);
				oFF.QInARepoOptions.importOptimizerHintsByEngine(inaOptimizerHints, oFF.ExecutionEngine.MDS, provider);
				oFF.QInARepoOptions.importOptimizerHintsByEngine(inaOptimizerHints, oFF.ExecutionEngine.SQL, provider);
			}
		}
	},
	importOptimizerHintsByEngine:function(inaOptimizerHints, engine, provider)
	{
			var queryModel = provider.getQueryModel();
		var listByEngine = inaOptimizerHints.getListByKey(engine.getName());
		if (oFF.notNull(listByEngine))
		{
			var numberOfHints = listByEngine.size();
			for (var i = 0; i < numberOfHints; i++)
			{
				var hintElement = listByEngine.getStructureAt(i);
				var key = hintElement.getStringByKey("Key");
				var value = hintElement.getStringByKey("Value");
				queryModel.addOptimizerHint(engine, key, value);
			}
		}
	},
	exportOptimizerHints:function(inaDefinition, queryModel)
	{
			if (queryModel.getModelCapabilities().supportsCeScenarioParams())
		{
			var inaOptimizerHints = oFF.PrFactory.createStructure();
			oFF.QInARepoOptions.exportOptimizerHintsByEngine(inaOptimizerHints, queryModel, oFF.ExecutionEngine.CALC_ENGINE);
			oFF.QInARepoOptions.exportOptimizerHintsByEngine(inaOptimizerHints, queryModel, oFF.ExecutionEngine.MDS);
			oFF.QInARepoOptions.exportOptimizerHintsByEngine(inaOptimizerHints, queryModel, oFF.ExecutionEngine.SQL);
			if (inaOptimizerHints.hasElements())
			{
				inaDefinition.put("Hints", inaOptimizerHints);
			}
		}
	},
	exportOptimizerHintsByEngine:function(inaOptimizerHints, queryModel, engine)
	{
			var optimizerHints = queryModel.getOptimizerHintsByExecutionEngine(engine);
		if (oFF.notNull(optimizerHints) && optimizerHints.hasElements())
		{
			var sortedList = optimizerHints.getKeysAsReadOnlyListOfString();
			sortedList.sortByDirection(oFF.XSortDirection.ASCENDING);
			var inaAEngineHints = inaOptimizerHints.putNewList(engine.getName());
			var sortedListSize = sortedList.size();
			for (var i = 0; i < sortedListSize; i++)
			{
				var hintName = sortedList.get(i);
				var inaHint = inaAEngineHints.addNewStructure();
				inaHint.putString("Key", hintName);
				inaHint.putString("Value", optimizerHints.getByKey(hintName));
			}
		}
	},
	importSuppressKeyfigureCalculation:function(inaOptions, provider)
	{
			if (oFF.notNull(inaOptions) && oFF.notNull(provider))
		{
			provider.setSuppressKeyfigureCalculation(inaOptions.getBooleanByKeyExt("SuppressKeyfigureCalculation", false));
		}
	},
	exportSuppressKeyfigureCalculation:function(inaOptions, provider)
	{
			if (oFF.notNull(inaOptions) && oFF.notNull(provider) && provider.isKeyfigureCalculationSuppressed())
		{
			inaOptions.putBoolean("SuppressKeyfigureCalculation", true);
		}
	},
	importPaging:function(inaOptions, provider)
	{
			if (oFF.notNull(inaOptions))
		{
			var queryModel = provider.getQueryModel();
			var inaSubset = inaOptions.getStructureByKey("SubSetDescription");
			if (oFF.isNull(inaSubset) || !queryModel.getSession().hasFeature(oFF.FeatureToggleOlap.PERSIST_PAGING_IN_REPO) && !provider.isApplyingRepoState())
			{
				return;
			}
			var offsetRows = inaSubset.getIntegerByKey("RowFrom");
			if (offsetRows > -1)
			{
				provider.setOffsetRows(offsetRows);
				provider.setMaxRows(inaSubset.getIntegerByKey("RowTo") - offsetRows);
			}
			else
			{
				provider.setMaxRows(inaSubset.getIntegerByKey("RowTo"));
			}
			var offsetCols = inaSubset.getIntegerByKey("ColumnFrom");
			if (offsetCols > -1)
			{
				provider.setOffsetColumns(offsetCols);
				provider.setMaxColumns(inaSubset.getIntegerByKey("ColumnTo") - offsetCols);
			}
			else
			{
				provider.setMaxColumns(inaSubset.getIntegerByKey("ColumnTo"));
			}
		}
	},
	exportPaging:function(inaOptions, provider)
	{
			var resultSetContainer = provider.getActiveResultSetContainer();
		var subSetDescription = inaOptions.putNewStructure("SubSetDescription");
		var maxRows = resultSetContainer.getMaxRows();
		var offsetRows = resultSetContainer.getOffsetRows();
		subSetDescription.putInteger("RowFrom", offsetRows);
		if (maxRows === -1)
		{
			subSetDescription.putInteger("RowTo", -1);
		}
		else
		{
			subSetDescription.putInteger("RowTo", offsetRows + maxRows);
		}
		var maxColumns = resultSetContainer.getMaxColumns();
		var offsetColumns = resultSetContainer.getOffsetColumns();
		subSetDescription.putInteger("ColumnFrom", offsetColumns);
		if (maxColumns === -1)
		{
			subSetDescription.putInteger("ColumnTo", -1);
		}
		else
		{
			subSetDescription.putInteger("ColumnTo", offsetColumns + maxColumns);
		}
	},
	exportLOVAbstractionLayerSettings:function(inaStructure, provider)
	{
			if (provider.hasLovManager())
		{
			var lovManager = provider.getLovManager();
			var lovSettings = inaStructure.putNewStructure("LovAbstractionRepo");
			lovSettings.putBoolean("Enabled", lovManager.isLovAbstractionEnabled());
			lovSettings.putBoolean("Measures", lovManager.isIncludeMeasures());
			lovSettings.putBoolean("AutoVhReadModeConfig", lovManager.isAutomaticValueHelpReadModeConfigurationEnabled());
			lovSettings.putBoolean("AutoVhDrillLevelConfig", lovManager.isAutomaticValueHelpDrillLevelConfigurationEnabled());
			lovSettings.putBoolean("IgnoreMultipleDrillsInVh", lovManager.isIgnoreMultipleDrillsInValueHelp());
			lovSettings.putBoolean("RestoreSettingsAfterImplicitSubmit", lovManager.isRestoreSettingsAfterImplicitSubmit());
		}
	},
	importLOVAbstractionLayerSettings:function(inaStructure, provider)
	{
			var lovSettings = inaStructure.getStructureByKey("LovAbstractionRepo");
		if (oFF.notNull(lovSettings))
		{
			var lovManager = provider.getLovManager();
			lovManager.setLovAbstractionEnabled(lovSettings.getBooleanByKeyExt("Enabled", false), true);
			lovManager.setIncludeMeasures(lovSettings.getBooleanByKeyExt("Measures", false));
			lovManager.setAutomaticValueHelpReadModeConfigurationEnabled(lovSettings.getBooleanByKeyExt("AutoVhReadModeConfig", true));
			lovManager.setAutomaticValueHelpDrillLevelConfigurationEnabled(lovSettings.getBooleanByKeyExt("AutoVhReadModeConfig", true));
			lovManager.setIgnoreMultipleDrillsInValueHelp(lovSettings.getBooleanByKeyExt("IgnoreMultipleDrillsInVh", false));
			lovManager.setRestoreSettingsAfterImplicitSubmit(lovSettings.getBooleanByKeyExt("RestoreSettingsAfterImplicitSubmit", false));
		}
		else if (provider.hasLovManager())
		{
			provider.getLovManager().setLovAbstractionEnabled(false, true);
		}
	}
};

oFF.QInARepoUtils = {

	importLayeredFilters:function(importer, layeredFiltersContext, inaLayeredFilters)
	{
			var filterExpressions = oFF.XList.create();
		var size = inaLayeredFilters.size();
		for (var i = 0; i < size; i++)
		{
			var inaLayeredFilter = inaLayeredFilters.getStructureAt(i);
			var filterName = inaLayeredFilter.getStringByKey("Name");
			var filterExpression = oFF.QFilterExpression.create(layeredFiltersContext, layeredFiltersContext);
			importer.importFilterExpression(filterExpression, inaLayeredFilter, layeredFiltersContext, layeredFiltersContext);
			layeredFiltersContext.linkFilter(filterName, filterExpression);
			filterExpressions.add(filterExpression);
		}
		return filterExpressions;
	},
	importCacheKey:function(inaCache)
	{
			var systemName = inaCache.getStringByKey("System");
		var providerName = inaCache.getStringByKey("Providers");
		var cubeName = inaCache.getStringByKey("Cube");
		var fieldName = inaCache.getStringByKey("FieldName");
		var dimensionName = inaCache.getStringByKey("DimensionName");
		var validationHash = inaCache.getStringByKey("ValidationHash");
		var dimensionGroupNames = inaCache.getStringByKey("DimensionGroupNames");
		return oFF.QFactory.createCacheKey(null, systemName, cubeName, oFF.ProviderType.getAll().getByKey(providerName), fieldName, dimensionName, validationHash, dimensionGroupNames);
	},
	importValueByType:function(importer, inaElement, parameterName, valueType)
	{
			return oFF.QInARepoUtils._importValueInternal(importer, null, inaElement, parameterName, valueType, null, true);
	},
	importSupplementsAndValue:function(importer, valueBag, inaElement, parameterName, valueType, field)
	{
			oFF.QInARepoUtils.importValue(importer, valueBag, inaElement, parameterName, valueType, field);
		var supplementsInA = inaElement.getListByKey("Supplements");
		if (oFF.notNull(supplementsInA) && supplementsInA.hasElements())
		{
			var numberOfSupplements = supplementsInA.size();
			for (var i = 0; i < numberOfSupplements; i++)
			{
				var supplementElement = supplementsInA.getStructureAt(i);
				var key = supplementElement.getByKey("Key");
				var value = supplementElement.getByKey("Value");
				var correctedKey = oFF.QInARepoUtils.correctRemovingUnwantedBackslashAndQuotes(key.getString());
				var correctedValue = oFF.QInARepoUtils.correctRemovingUnwantedBackslashAndQuotes(value.getString());
				valueBag.addSupplementValue(correctedKey, correctedValue);
			}
		}
	},
	correctRemovingUnwantedBackslashAndQuotes:function(junkKey)
	{
			var cleanedValue = junkKey;
		while (oFF.QInARepoUtils.containsEscapedQuote(cleanedValue))
		{
			cleanedValue = oFF.XStringUtils.stripChars(cleanedValue, 1);
		}
		return cleanedValue;
	},
	containsEscapedQuote:function(junkKey)
	{
			return oFF.XStringUtils.isNotNullAndNotEmpty(junkKey) && (oFF.XString.getCharAt(junkKey, 0) === 92 || oFF.XString.getCharAt(junkKey, 0) === 34) && (oFF.XString.getCharAt(junkKey, oFF.XString.size(junkKey) - 1) === 92 || oFF.XString.getCharAt(junkKey, oFF.XString.size(junkKey) - 1) === 34);
	},
	importValue:function(importer, valueBag, inaElement, parameterName, valueType, field)
	{
			oFF.QInARepoUtils._importValueInternal(importer, valueBag, inaElement, parameterName, valueType, field, false);
	},
	getDouble:function(inaElement, parameterName2)
	{
			var doubleValue;
		var doubleElement = inaElement.getByKey(parameterName2);
		if (doubleElement.isString())
		{
			var stringValue = doubleElement.getString();
			doubleValue = oFF.XDouble.convertFromString(stringValue);
		}
		else if (doubleElement.isDouble())
		{
			doubleValue = doubleElement.getDouble();
		}
		else if (doubleElement.isInteger())
		{
			doubleValue = doubleElement.getInteger();
		}
		else
		{
			doubleValue = 0.0;
		}
		return doubleValue;
	},
	_importValueInternal:function(importer, valueBag, inaElement, parameterName, valueType, field, returnValue)
	{
			var useSapDateFormat = importer.capabilities.supportsSapDate();
		var useFieldLiteralValue = oFF.PrUtils.getBooleanValueProperty(inaElement, "FieldLiteralValue", false);
		var parameterName2 = parameterName;
		if (oFF.isNull(parameterName2))
		{
			parameterName2 = "Value";
		}
		var valueType2 = valueType;
		if (oFF.isNull(valueType2))
		{
			var inaValueType = inaElement.getStringByKey(oFF.XStringUtils.concatenate2(parameterName2, "Type"));
			valueType2 = oFF.QInAConverter.lookupValueType(inaValueType);
			useSapDateFormat = false;
		}
		var fieldValue;
		var stringValue;
		if (valueType2 === oFF.XValueType.STRING)
		{
			stringValue = inaElement.getStringByKey(parameterName2);
			if (returnValue)
			{
				return oFF.XStringValue.create(stringValue);
			}
			if (oFF.isNull(field) || !useFieldLiteralValue)
			{
				valueBag.setString(stringValue);
			}
			else
			{
				var dimension = field.getDimension();
				var dimensionMember = dimension.getDimensionMember(stringValue);
				if (dimension.isStructure() && oFF.notNull(dimensionMember))
				{
					valueBag.setDimensionMember(dimensionMember);
				}
				else
				{
					fieldValue = field.createFieldLiteralValue();
					fieldValue.setString(stringValue);
					valueBag.setFieldValue(fieldValue);
				}
			}
		}
		else if (valueType2 === oFF.XValueType.DOUBLE || valueType2 === oFF.XValueType.DECIMAL_FLOAT)
		{
			var doubleValue = oFF.QInARepoUtils.getDouble(inaElement, parameterName2);
			if (returnValue)
			{
				return oFF.XDoubleValue.create(doubleValue);
			}
			if (oFF.isNull(field) || !useFieldLiteralValue)
			{
				valueBag.setDouble(doubleValue);
			}
			else
			{
				fieldValue = field.createFieldLiteralValue();
				fieldValue.setDouble(doubleValue);
				valueBag.setFieldValue(fieldValue);
			}
		}
		else if (valueType2 === oFF.XValueType.INTEGER)
		{
			var intValue = inaElement.getIntegerByKey(parameterName2);
			if (returnValue)
			{
				return oFF.XIntegerValue.create(intValue);
			}
			if (oFF.isNull(field) || !useFieldLiteralValue)
			{
				valueBag.setInteger(intValue);
			}
			else
			{
				fieldValue = field.createFieldLiteralValue();
				fieldValue.setInteger(intValue);
				valueBag.setFieldValue(fieldValue);
			}
		}
		else if (valueType2 === oFF.XValueType.BOOLEAN)
		{
			var booleanValue = inaElement.getBooleanByKey(parameterName2);
			if (returnValue)
			{
				return oFF.XBooleanValue.create(booleanValue);
			}
			valueBag.setBoolean(booleanValue);
		}
		else if (valueType2 === oFF.XValueType.LONG)
		{
			var longValue = oFF.PrUtils.getLongValueProperty(inaElement, parameterName2, 0);
			if (returnValue)
			{
				return oFF.XLongValue.create(longValue);
			}
			if (oFF.isNull(field) || !useFieldLiteralValue)
			{
				valueBag.setLong(longValue);
			}
			else
			{
				fieldValue = field.createFieldLiteralValue();
				fieldValue.setLong(longValue);
				valueBag.setFieldValue(fieldValue);
			}
		}
		else if (valueType2 === oFF.XValueType.DATE)
		{
			stringValue = inaElement.getStringByKey(parameterName2);
			var dateValue = oFF.QInARepoUtils.createDate(stringValue);
			if (returnValue)
			{
				return dateValue;
			}
			if (oFF.isNull(field) || !useFieldLiteralValue)
			{
				valueBag.setDate(dateValue);
			}
			else
			{
				fieldValue = field.createFieldLiteralValue();
				fieldValue.setDate(dateValue);
				valueBag.setFieldValue(fieldValue);
			}
		}
		else if (valueType2 === oFF.XValueType.TIME)
		{
			stringValue = inaElement.getStringByKey(parameterName2);
			var timeValue = oFF.XTime.createTimeFromStringWithFlag(stringValue, useSapDateFormat);
			if (returnValue)
			{
				return timeValue;
			}
			valueBag.setTime(timeValue);
		}
		else if (valueType2 === oFF.XValueType.DATE_TIME)
		{
			stringValue = inaElement.getStringByKey(parameterName2);
			var dateTimeValue = oFF.XDateTime.createDateTimeFromStringWithFlag(stringValue, useSapDateFormat);
			if (returnValue)
			{
				return dateTimeValue;
			}
			if (oFF.isNull(field) || !useFieldLiteralValue)
			{
				valueBag.setDateTime(dateTimeValue);
			}
			else
			{
				fieldValue = field.createFieldLiteralValue();
				fieldValue.setDate(dateTimeValue);
				valueBag.setFieldValue(fieldValue);
			}
		}
		else if (valueType2.isSpatial())
		{
			stringValue = inaElement.getStringByKey(parameterName2);
			var geometry = oFF.XGeometryValue.createGeometryValueWithWkt(stringValue);
			if (returnValue)
			{
				return geometry;
			}
			valueBag.setValue(geometry);
			if (importer.capabilities.supportsSpatialFilterSrid() && inaElement.containsKey("SRID"))
			{
				valueBag.getGeometry().setSrid(oFF.XIntegerValue.create(inaElement.getIntegerByKey("SRID")));
			}
		}
		else if (valueType2 === oFF.XValueType.UNSUPPORTED)
		{
			return null;
		}
		else if (valueType2 === oFF.XValueType.VARIABLE || valueType2 === oFF.XValueType.CURRENT_MEMBER)
		{
			if (!returnValue)
			{
				valueBag.setFilterValueType(valueType2);
			}
			return null;
		}
		else
		{
			importer.addError(oFF.ErrorCodes.INVALID_TOKEN, oFF.XStringUtils.concatenate3("Unsupported value type '", valueType2.getName(), "'"));
			return null;
		}
		return null;
	},
	importSupplements:function(importer, value, structure, parameter, supplementFields)
	{
			if (importer.capabilities.supportsSupplements() && oFF.notNull(parameter) && oFF.XCollectionUtils.hasElements(supplementFields))
		{
			var supplementValues = structure.getListByKey(parameter);
			if (oFF.notNull(supplementValues))
			{
				var sizeA = supplementValues.size();
				var sizeB = supplementFields.size();
				if (sizeA === sizeB)
				{
					for (var i = 0; i < sizeA; i++)
					{
						value.addSupplementValue(supplementFields.get(i).getName(), supplementValues.getStringAt(i));
					}
				}
				else
				{
					importer.addWarning(oFF.ErrorCodes.INVALID_STATE, "InA protocol error: Supplement sizes of values and field names do not match.");
				}
			}
		}
	},
	createDate:function(date)
	{
			return oFF.XDate.createDateSafe(date);
	},
	importLinkPart:function(context, structure)
	{
			var systemName = structure.getStringByKey("System");
		var dataSource = structure.getStringByKey("DataSource");
		var fieldName = structure.getStringByKey("FieldName");
		var dimensionName = structure.getStringByKey("DimensionName");
		var hierarchyName = structure.getStringByKey("HierarchyName");
		var hierId = structure.getStringByKey("HierarchyId");
		var validationHash = structure.getStringByKey("ValidationHash");
		var queryManagerKey = structure.getStringByKey("QueryManagerKey");
		var isIncludeHierarchyNodeChildren = structure.getBooleanByKeyExt("IsIncludeHierarchyNodeChildren", false);
		var cacheKey = oFF.QFactory.createCacheKeyWithDataSource(context, systemName, dataSource, null, fieldName, dimensionName, validationHash, null);
		var dimensionLinkPart = oFF.QFactory.createDimensionLinkPart(context, cacheKey, hierarchyName, queryManagerKey);
		dimensionLinkPart.setHierId(hierId);
		dimensionLinkPart.setIncludeHierarchyNodeChildren(isIncludeHierarchyNodeChildren);
		dimensionLinkPart.setPropagateOnDefaultHierarchyKey(structure.getBooleanByKeyExt("PropagateOnDefaultHierarchyKey", false));
		dimensionLinkPart.setPropagateFlexibleTimeRangeFiltersDirect(structure.getBooleanByKeyExt("PropagateFlexibleTimeRangeFiltersDirect", true));
		dimensionLinkPart.setPropagateDirectFlexibleTimeMemberFiltersUsingHierarchy(structure.getBooleanByKeyExt("PropagateDirectFlexibleMemberFiltersHierarchy", false));
		return dimensionLinkPart;
	},
	importFilterTimeRange:function(importer, inaStructure, fixedTimeRangeFilter)
	{
			fixedTimeRangeFilter.setTimeDimensionName(inaStructure.getStringByKey("DimensionName"));
		fixedTimeRangeFilter.setHierarchyName(inaStructure.getStringByKey("HierarchyName"));
		fixedTimeRangeFilter.setLevelName(inaStructure.getStringByKey("LevelName"));
		fixedTimeRangeFilter.setConvertToFlatFilter(inaStructure.getBooleanByKey("ConvertToFlatSelection"));
		var isExcluding = inaStructure.getBooleanByKeyExt("IsExcluding", false);
		if (isExcluding)
		{
			fixedTimeRangeFilter.setSetSign(oFF.SetSign.EXCLUDING);
		}
		else
		{
			fixedTimeRangeFilter.setSetSign(oFF.SetSign.INCLUDING);
		}
		var inaFallBackFilterElement = inaStructure.getStructureByKey("Selection");
		if (oFF.notNull(inaFallBackFilterElement))
		{
			var filter = fixedTimeRangeFilter.getFallbackFilter();
			var filterElement = importer.importComponent(null, inaFallBackFilterElement, null, filter, fixedTimeRangeFilter);
			filter.setComplexRoot(filterElement);
		}
	},
	importFilterShiftableTimeRange:function(inaStructure, filterShiftableTimeRange)
	{
			filterShiftableTimeRange.setLookBack(inaStructure.getIntegerByKey("LookBack"));
		var offsetFunction = inaStructure.getStringByKey("OffsetFunction");
		if (oFF.XStringUtils.isNotNullAndNotEmpty(offsetFunction))
		{
			filterShiftableTimeRange.setOffsetFunction(oFF.TimeOffsetFunction.lookup(offsetFunction));
		}
		filterShiftableTimeRange.setOffsetLevelName(inaStructure.getStringByKey("OffsetLevelName"));
		filterShiftableTimeRange.setOffsetAmount(inaStructure.getIntegerByKey("OffsetAmount"));
		filterShiftableTimeRange.setPivotMemberLevelName(inaStructure.getStringByKey("PivotLevelName"));
	},
	exportLayeredFilters:function(exporter, layeredFilterContext)
	{
			return oFF.QInARepoUtils.exportLayeredFiltersExt(exporter, layeredFilterContext, null);
	},
	exportLayeredFiltersExt:function(exporter, layeredFilterContext, isValidFilterExpression)
	{
			var inaLayeredFilters = oFF.PrFactory.createList();
		var layeredFilters = layeredFilterContext.getLinkedFilters();
		var filterNames = layeredFilters.getKeysAsIteratorOfString();
		while (filterNames.hasNext())
		{
			var filterName = filterNames.next();
			var nextFilterExpression = layeredFilterContext.getLinkedFilter(filterName);
			if (oFF.QInARepoUtils.isValidFilterExpressionForRepository(nextFilterExpression) && (oFF.isNull(isValidFilterExpression) || isValidFilterExpression(nextFilterExpression).getBoolean()))
			{
				var filterExpression = exporter.exportFilterExpression(nextFilterExpression);
				filterExpression.putString("Name", filterName);
				inaLayeredFilters.add(filterExpression);
			}
		}
		return inaLayeredFilters;
	},
	isValidFilterExpressionForRepository:function(filterExpressionState)
	{
			return oFF.notNull(filterExpressionState) && !filterExpressionState.isReleased() && filterExpressionState.getFilterRootElement() !== null && !filterExpressionState.getFilterRootElement().isReleased();
	},
	exportCacheKey:function(cacheKey, queryManager)
	{
			var inaCache = oFF.PrFactory.createStructure();
		inaCache.putString("System", cacheKey.getSystemName());
		inaCache.putString("Providers", cacheKey.getProviderType().getName());
		inaCache.putString("Cube", cacheKey.getDataSourceHashKey());
		inaCache.putString("FieldName", cacheKey.getKey1());
		inaCache.putString("DimensionName", cacheKey.getKey2());
		inaCache.putString("ValidationHash", cacheKey.getValidationHash());
		inaCache.putString("DimensionGroupNames", cacheKey.getDimensionGroupNames());
		if (oFF.notNull(queryManager) && queryManager.getClientQueryObjectStorageName() !== null)
		{
			inaCache.putString("StorageName", queryManager.getClientQueryObjectStorageName());
		}
		return inaCache;
	},
	extendStructureWithTagging:function(exporter, modelComponentBase, source)
	{
			var tagging = modelComponentBase.getTagging();
		if (oFF.XCollectionUtils.hasElements(tagging))
		{
			var keyList = tagging.getKeysAsReadOnlyListOfString();
			var componentTaggingList = source.putNewList("ComponentTags");
			for (var i = 0; i < keyList.size(); i++)
			{
				var currentKey = keyList.get(i);
				var currentValue = tagging.getByKey(currentKey);
				var newKeyValuePair = oFF.PrFactory.createStructure();
				componentTaggingList.add(newKeyValuePair);
				newKeyValuePair.putString("KEY", currentKey);
				if (oFF.isNull(currentValue))
				{
					newKeyValuePair.putNull("VALUE");
				}
				else
				{
					newKeyValuePair.putString("VALUE", currentValue);
				}
			}
		}
		return source;
	},
	setDateIfNotNull:function(exporter, structure, parameterName, date)
	{
			if (oFF.notNull(date))
		{
			structure.putString(parameterName, date.toIsoFormat());
		}
	},
	setNameIfNotNull:function(structure, name, namedObject)
	{
			if (oFF.notNull(namedObject))
		{
			structure.putString(name, namedObject.getName());
		}
	},
	setIntegerIfNotNull:function(structure, name, value)
	{
			if (oFF.notNull(value))
		{
			structure.putInteger(name, value.getInteger());
		}
	},
	addKeyRefStructure:function(exporter, modelComponent, inaParentStructure, queryManager)
	{
			var keyRefId = inaParentStructure.putNewStructure("KeyRef");
		if (!exporter.getOriginalMode().isTypeOf(oFF.QModelFormat.INA_REPOSITORY) || oFF.isNull(queryManager) || queryManager.getClientQueryObjectStorageName() === null || !oFF.XString.isEqual(modelComponent.getStorageName(), queryManager.getClientQueryObjectStorageName()))
		{
			keyRefId.putString("StorageName", modelComponent.getStorageName());
		}
		keyRefId.putString("GroupName", modelComponent.getStorageGroupName());
		keyRefId.putString("ObjectName", modelComponent.getStorageObjectName());
		var olapComponentType = modelComponent.getComponentType();
		var ctypeValue = oFF.QInAConverter.lookupComponentTypeInA(olapComponentType);
		if (oFF.notNull(ctypeValue))
		{
			inaParentStructure.putString("CType", ctypeValue);
		}
	},
	exportValue:function(exporter, parameterName, inaElement, valueAccess, valueType)
	{
			oFF.QInARepoUtils.exportFieldValue(exporter, parameterName, inaElement, null, valueAccess, valueType);
	},
	exportFieldValue:function(exporter, parameterName, inaElement, field, valueAccess, valueType)
	{
			var parameterName2 = parameterName;
		if (oFF.isNull(parameterName2))
		{
			parameterName2 = "Value";
		}
		var valueType2 = valueType;
		if (oFF.isNull(valueType2))
		{
			valueType2 = valueAccess.getValueType();
			var inaValueType = oFF.QInAConverter.lookupValueTypeInA(valueType2);
			inaElement.putString(oFF.XStringUtils.concatenate2(parameterName2, "Type"), inaValueType);
		}
		if (valueType2 === oFF.XValueType.STRING)
		{
			var stringValue = valueAccess.getString();
			inaElement.putString(parameterName2, stringValue);
		}
		else if (valueType2 === oFF.XValueType.INTEGER)
		{
			inaElement.putInteger(parameterName2, valueAccess.getInteger());
		}
		else if (valueType2 === oFF.XValueType.LONG)
		{
			inaElement.putLong(parameterName2, valueAccess.getLong());
		}
		else if (valueType2 === oFF.XValueType.DOUBLE || valueType2 === oFF.XValueType.DECIMAL_FLOAT)
		{
			inaElement.putDouble(parameterName2, valueAccess.getDouble());
		}
		else if (valueType2 === oFF.XValueType.BOOLEAN)
		{
			inaElement.putBoolean(parameterName2, valueAccess.getBoolean());
		}
		else if (valueType2 === oFF.XValueType.DATE)
		{
			oFF.QInARepoUtils.setDateIfNotNull(exporter, inaElement, parameterName2, valueAccess.getDate());
		}
		else if (valueType2 === oFF.XValueType.TIME)
		{
			oFF.QInARepoUtils.setDateIfNotNull(exporter, inaElement, parameterName2, valueAccess.getTime());
		}
		else if (valueType2 === oFF.XValueType.DATE_TIME)
		{
			oFF.QInARepoUtils.setDateIfNotNull(exporter, inaElement, parameterName2, valueAccess.getDateTime());
		}
		if (oFF.notNull(valueType2) && valueType2.isSpatial())
		{
			var geometry = valueAccess.getGeometry();
			inaElement.putString(parameterName2, geometry.toWKT());
			var srid = geometry.getSrid();
			if (exporter.capabilities.supportsSpatialFilterSrid() && oFF.notNull(srid))
			{
				inaElement.putInteger("SRID", srid.getInteger());
			}
		}
		if (oFF.notNull(field))
		{
			inaElement.putBoolean("FieldLiteralValue", true);
		}
	},
	exportSupplementsAndValue:function(exporter, parameterName, inaElement, field, value, valueType)
	{
			oFF.QInARepoUtils.exportFieldValue(exporter, parameterName, inaElement, field, value, valueType);
		var supplementValues = value.getSupplementValues();
		if (oFF.XCollectionUtils.hasElements(supplementValues))
		{
			var supplementValuesList = inaElement.putNewList("Supplements");
			var numberOfSupplementValues = supplementValues.size();
			for (var j = 0; j < numberOfSupplementValues; j++)
			{
				var supplement = supplementValuesList.addNewStructure();
				var ixKeyValuePair = supplementValues.get(j);
				supplement.putString("Key", ixKeyValuePair.getKey().toString());
				supplement.putString("Value", ixKeyValuePair.getValue().toString());
			}
		}
	},
	exportFilterValue:function(exporter, parameterName, inaElement, value, valueType)
	{
			if (valueType === oFF.XValueType.VARIABLE)
		{
			var variableValue = value.getVariableValue();
			if (oFF.notNull(variableValue))
			{
				inaElement.putString(parameterName, variableValue.getName());
				if (oFF.XString.isEqual(parameterName, "Low"))
				{
					inaElement.putString("LowIs", "Variable");
				}
				else if (oFF.XString.isEqual(parameterName, "High"))
				{
					inaElement.putString("HighIs", "Variable");
				}
			}
		}
		else
		{
			oFF.QInARepoUtils.exportValue(exporter, parameterName, inaElement, value, valueType);
		}
	},
	setDate:function(exporter, structure, parameterName, date)
	{
			if (oFF.notNull(date))
		{
			structure.putString(parameterName, date.toIsoFormat());
		}
	},
	exportLinkPart:function(exporter, structure, linkPart)
	{
			structure.putString("System", linkPart.getSystemName());
		structure.putString("DataSource", linkPart.getCubeName());
		structure.putString("DimensionName", linkPart.getDimensionName());
		structure.putString("FieldName", linkPart.getFieldName());
		structure.putStringNotNullAndNotEmpty("QueryManagerKey", linkPart.getQueryManagerKey());
		if (linkPart.getHierarchyName() !== null)
		{
			structure.putString("HierarchyName", linkPart.getHierarchyName());
		}
		if (linkPart.getHierId() !== null)
		{
			structure.putString("HierarchyId", linkPart.getHierId());
		}
		if (linkPart.getFieldKey().getValidationHash() !== null)
		{
			structure.putString("ValidationHash", linkPart.getFieldKey().getValidationHash());
		}
		if (exporter.getSession().hasFeature(oFF.FeatureToggleOlap.LOV_BASED_FILTER_ACROSS_MODELS))
		{
			structure.putBoolean("IsIncludeHierarchyNodeChildren", linkPart.isIncludeHierarchyNodeChildren());
		}
		if (linkPart.getPropagateOnDefaultHierarchyKey())
		{
			structure.putBoolean("PropagateOnDefaultHierarchyKey", true);
		}
		if (exporter.getSession().hasFeature(oFF.FeatureToggleOlap.FLEXIBLE_TIME_DYNAMIC_TIME))
		{
			structure.putBoolean("PropagateFlexibleTimeRangeFiltersDirect", linkPart.getPropagateFlexibleTimeRangeFiltersDirect());
		}
		if (exporter.getSession().hasFeature(oFF.FeatureToggleOlap.FLEXIBLE_TIME_DYNAMIC_TIME))
		{
			structure.putBoolean("PropagateDirectFlexibleMemberFiltersHierarchy", linkPart.getPropagateDirectFlexibleTimeMemberFiltersUsingHierarchy());
		}
	},
	getFormulaCalcDimField:function(context, fieldName, clientQueryObjectManagerStorageName)
	{
			var clientQueryObjectManager = context.getOlapEnv().getClientQueryObjectManager();
		var formulaCalcDimProperties = clientQueryObjectManager.getFormulaCalcDimPropertiesByFieldName(fieldName, clientQueryObjectManagerStorageName);
		if (oFF.notNull(formulaCalcDimProperties))
		{
			return formulaCalcDimProperties.getFormulaCalcFields().getFieldByName(fieldName);
		}
		return null;
	},
	exportTimeRangeFilter:function(exporter, inaStructure, timeRangeFilter)
	{
			inaStructure.putString("DimensionName", timeRangeFilter.getTimeDimensionName());
		inaStructure.putString("HierarchyName", timeRangeFilter.getHierarchyName());
		inaStructure.putString("LevelName", timeRangeFilter.getLevelName());
		inaStructure.putBoolean("ConvertToFlatSelection", timeRangeFilter.isConvertToFlatFilter());
		if (timeRangeFilter.getLowValueType() !== null)
		{
			inaStructure.putString("LowValueType", timeRangeFilter.getLowValueType().getName());
		}
		inaStructure.putBoolean("IsExcluding", timeRangeFilter.getSetSign() === oFF.SetSign.EXCLUDING);
		var filterRoot = timeRangeFilter.getFallbackFilter().getFilterRootElement();
		if (oFF.notNull(filterRoot))
		{
			var inaElement = exporter.exportComponent(null, filterRoot, null, 0);
			inaStructure.put("Selection", inaElement);
		}
	},
	exportShiftableTimeRangeFilter:function(inaStructure, shiftableTimeRangeFilter)
	{
			inaStructure.putInteger("LookBack", shiftableTimeRangeFilter.getLookBack());
		var offsetFunction = shiftableTimeRangeFilter.getOffsetFunction();
		if (oFF.notNull(offsetFunction))
		{
			inaStructure.putString("OffsetFunction", offsetFunction.getName());
		}
		inaStructure.putString("OffsetLevelName", shiftableTimeRangeFilter.getOffsetLevelName());
		inaStructure.putInteger("OffsetAmount", shiftableTimeRangeFilter.getOffsetAmount());
		if (shiftableTimeRangeFilter.getPivotMemberLevelName() !== null)
		{
			inaStructure.putString("PivotLevelName", shiftableTimeRangeFilter.getPivotMemberLevelName());
		}
	},
	exportTimeOperation:function(inaTimeOperationStructure, timeOperation)
	{
			inaTimeOperationStructure.putString("Name", timeOperation.getDimensionName());
		inaTimeOperationStructure.putString("TimeOperationFunction", timeOperation.getFunction().getName());
		if (timeOperation.getGranularity() !== null)
		{
			inaTimeOperationStructure.putString("TimeOperationGranularity", timeOperation.getGranularity().getName());
		}
		inaTimeOperationStructure.putInteger("TimeOperationPeriod", timeOperation.getPeriod());
		inaTimeOperationStructure.putBoolean("TimeOperationForceMemberNavGeneration", timeOperation.getForceMemberNavigationGeneration());
		inaTimeOperationStructure.putBoolean("TimeOperationUseToDateFlatRangeSelection", timeOperation.getUseToDateFlatRangeSelection());
		inaTimeOperationStructure.putString("LevelName", timeOperation.getHierarchyLevelName());
		if (timeOperation.getFunction() === oFF.QTimeOperationFunction.PREVIOUS && timeOperation.getGranularity() === oFF.QTimeOperationGranularity.PERIOD)
		{
			inaTimeOperationStructure.putString("TimePeriodOperationLevel", timeOperation.getTimePeriodOperationLevel().getName());
		}
	}
};

oFF.QInAComponentWithList = function() {};
oFF.QInAComponentWithList.prototype = new oFF.QInAComponent();
oFF.QInAComponentWithList.prototype._ff_c = "QInAComponentWithList";

oFF.QInAComponentWithList.prototype.importComponent = function(importer, inaElement, modelComponent, parentComponent, context)
{
	var tagName = this.getTagName();
	var inaList = null;
	if (oFF.isNull(tagName))
	{
		inaList = inaElement;
	}
	else
	{
		if (oFF.notNull(inaElement))
		{
			var inaStructure = inaElement;
			inaList = inaStructure.getListByKey(tagName);
		}
	}
	return this.importComponentWithList(importer, inaList, modelComponent, parentComponent, context);
};
oFF.QInAComponentWithList.prototype.exportComponent = function(exporter, modelComponent, inaParentStructure, flags)
{
	var inaList = null;
	if (oFF.notNull(modelComponent))
	{
		inaList = this.exportComponentWithList(exporter, modelComponent, flags);
		var tagName = this.getTagName();
		if (oFF.notNull(tagName) && oFF.notNull(inaList))
		{
			var inaInsertStructure = inaParentStructure;
			if (oFF.isNull(inaInsertStructure))
			{
				inaInsertStructure = oFF.PrFactory.createStructure();
			}
			inaInsertStructure.put(tagName, inaList);
			return inaInsertStructure;
		}
	}
	return inaList;
};

oFF.QInAComponentWithStructure = function() {};
oFF.QInAComponentWithStructure.prototype = new oFF.QInAComponent();
oFF.QInAComponentWithStructure.prototype._ff_c = "QInAComponentWithStructure";

oFF.QInAComponentWithStructure.prototype.importComponent = function(importer, inaElement, modelComponent, parentComponent, context)
{
	var inaStructure = inaElement;
	var tagName = this.getTagName();
	if (oFF.notNull(tagName) && oFF.notNull(inaStructure))
	{
		var content = inaStructure.getByKey(tagName);
		inaStructure = oFF.notNull(content) && content.isStructure() ? content : null;
	}
	var myModelComponent = modelComponent;
	if (oFF.isNull(modelComponent))
	{
		var olapEnv = null;
		var application = null;
		if (oFF.notNull(context))
		{
			olapEnv = context.getOlapEnv();
			application = context.getApplication();
		}
		if (oFF.isNull(application))
		{
			application = importer.getApplication();
		}
		if (oFF.notNull(inaStructure))
		{
			var inaKeyRef = inaStructure.getStructureByKey("KeyRef");
			if (oFF.notNull(inaKeyRef) && oFF.notNull(context))
			{
				return this.getSharedObjectFromKeyRef(parentComponent, context, inaKeyRef);
			}
		}
		myModelComponent = this.newModelComponent(application, olapEnv, parentComponent, context);
		if (oFF.notNull(myModelComponent) && !importer.getMode().isTypeOf(oFF.QModelFormat.INA_REPOSITORY))
		{
			myModelComponent.stopEventing();
		}
	}
	var returnModelComponent = this.importComponentWithStructure(importer, inaStructure, myModelComponent, parentComponent, context);
	oFF.QInAImportUtil.importComponentTagging(importer, inaStructure, returnModelComponent);
	oFF.QInAImportUtil.importComponentExtensions(importer, inaStructure, returnModelComponent);
	this.importChangedProperties(returnModelComponent, inaStructure);
	if (oFF.isNull(modelComponent) && oFF.notNull(myModelComponent) && !importer.getMode().isTypeOf(oFF.QModelFormat.INA_REPOSITORY))
	{
		myModelComponent.resumeEventing();
	}
	return returnModelComponent;
};
oFF.QInAComponentWithStructure.prototype.importChangedProperties = function(modelComponent, inaStructure)
{
	if (oFF.notNull(inaStructure) && oFF.notNull(modelComponent))
	{
		var listOfChangedProperties = inaStructure.getListByKey("ChangedProperties");
		var changedPropertiesInDetailInA = inaStructure.getStructureByKey("ChangedPropertiesInDetail");
		var listOfChangedPropertiesFromModellerMD = inaStructure.getListByKey("ChangedPropertiesFromModellerMetadata");
		if (oFF.notNull(listOfChangedProperties) && listOfChangedProperties.size() > 0)
		{
			var changedProperties = oFF.XHashSetOfString.create();
			for (var i = 0; i < listOfChangedProperties.size(); i++)
			{
				changedProperties.add(listOfChangedProperties.getStringAt(i));
			}
			modelComponent.setChangedProperties(changedProperties);
		}
		if (oFF.notNull(changedPropertiesInDetailInA) && changedPropertiesInDetailInA.hasElements())
		{
			var changedPropertiesInDetail = modelComponent.getChangedPropertiesInDetail();
			var propertyKeysInA = changedPropertiesInDetailInA.getKeysAsReadOnlyListOfString();
			for (var propertyKeysIndex = 0; propertyKeysIndex < propertyKeysInA.size(); propertyKeysIndex++)
			{
				var propertyInA = propertyKeysInA.get(propertyKeysIndex);
				var valuesMap = oFF.XHashMapByString.create();
				changedPropertiesInDetail.put(propertyInA, valuesMap);
				var valuesInA = changedPropertiesInDetailInA.getStructureByKey(propertyInA);
				var keysAsReadOnlyListOfString = valuesInA.getKeysAsReadOnlyListOfString();
				for (var internalIndex = 0; internalIndex < keysAsReadOnlyListOfString.size(); internalIndex++)
				{
					var internalKey = keysAsReadOnlyListOfString.get(internalIndex);
					valuesMap.put(internalKey, oFF.XStringValue.create(valuesInA.getStringByKey(internalKey)));
				}
			}
		}
		if (oFF.notNull(listOfChangedPropertiesFromModellerMD) && listOfChangedPropertiesFromModellerMD.size() > 0)
		{
			var changedPropertiesFromModellerMetadata = modelComponent.getChangedPropertiesFromModellerMetadata();
			for (var index = 0; index < listOfChangedPropertiesFromModellerMD.size(); index++)
			{
				changedPropertiesFromModellerMetadata.add(listOfChangedPropertiesFromModellerMD.getStringAt(index));
			}
		}
	}
};
oFF.QInAComponentWithStructure.prototype.getSharedObjectFromKeyRef = function(parentComponent, context, inaKeyRef)
{
	var keyRef;
	var storageName = inaKeyRef.getStringByKey("StorageName");
	var effectiveStorageName = this.getClientQueryObjectStorageName(parentComponent);
	if (oFF.isNull(effectiveStorageName))
	{
		effectiveStorageName = this.getClientQueryObjectStorageName(context);
	}
	if (oFF.isNull(effectiveStorageName))
	{
		effectiveStorageName = storageName;
	}
	keyRef = oFF.QFactory.createKeyRef(effectiveStorageName, inaKeyRef.getStringByKey("GroupName"), inaKeyRef.getStringByKey("ObjectName"));
	var sharedObject = null;
	if (oFF.XString.isEqual(storageName, oFF.KeyRefConstants.MAIN_STORAGE) && parentComponent.getKeyRefStorage() !== null)
	{
		sharedObject = parentComponent.getKeyRefStorage().get(storageName, inaKeyRef.getStringByKey("GroupName"), inaKeyRef.getStringByKey("ObjectName"));
	}
	else
	{
		sharedObject = context.getOlapEnv().getClientQueryObjectManager().getClientQueryObjectIncludeReleasedByKeyRef(keyRef, null);
	}
	return sharedObject;
};
oFF.QInAComponentWithStructure.prototype.getClientQueryObjectStorageName = function(context)
{
	var name = null;
	if (oFF.notNull(context) && context.getQueryManager() !== null && context.getQueryManager().getClientQueryObjectStorageName() !== null)
	{
		name = context.getQueryManager().getClientQueryObjectStorageName();
	}
	return name;
};
oFF.QInAComponentWithStructure.prototype.newModelComponent = function(application, olapEnv, parentComponent, context)
{
	return null;
};
oFF.QInAComponentWithStructure.prototype.exportComponent = function(exporter, modelComponent, inaParentStructure, flags)
{
	var inaStructure = null;
	if (oFF.notNull(modelComponent))
	{
		var tagName = this.getTagName();
		if (oFF.isNull(tagName))
		{
			inaStructure = inaParentStructure;
		}
		if (oFF.isNull(inaStructure))
		{
			inaStructure = oFF.PrFactory.createStructure();
		}
		var isExportKeyReference = this.exportKeyReference(exporter, modelComponent, inaStructure);
		if (!isExportKeyReference)
		{
			inaStructure = this.exportComponentWithStructure(exporter, modelComponent, inaStructure, flags);
			if (oFF.notNull(inaStructure))
			{
				inaStructure = oFF.QInAExportUtil.extendStructure(exporter, modelComponent, inaStructure);
				inaStructure = this.extendCustom(exporter, modelComponent, inaStructure);
				oFF.QInAExportUtil.exportComponentExtensions(exporter, inaStructure, modelComponent);
			}
			if (oFF.notNull(tagName))
			{
				if (oFF.notNull(inaStructure))
				{
					var inaInsertStructure = inaParentStructure;
					if (oFF.isNull(inaInsertStructure))
					{
						inaInsertStructure = oFF.PrFactory.createStructure();
					}
					inaInsertStructure.put(tagName, inaStructure);
					inaStructure = inaInsertStructure;
				}
			}
		}
	}
	return inaStructure;
};
oFF.QInAComponentWithStructure.prototype.extendCustom = function(exporter, modelComponent, inaStructure)
{
	return inaStructure;
};
oFF.QInAComponentWithStructure.prototype.exportKeyReference = function(exporter, modelComponent, inaStructure)
{
	return false;
};

oFF.QInARepoFilterCartesianListLegacy = function() {};
oFF.QInARepoFilterCartesianListLegacy.prototype = new oFF.QInAComponent();
oFF.QInARepoFilterCartesianListLegacy.prototype._ff_c = "QInARepoFilterCartesianListLegacy";

oFF.QInARepoFilterCartesianListLegacy.prototype.getComponentType = function()
{
	return oFF.FilterComponentType.CARTESIAN_LIST;
};
oFF.QInARepoFilterCartesianListLegacy.prototype.getModelFormat = function()
{
	return oFF.QModelFormat.INA_REPOSITORY;
};
oFF.QInARepoFilterCartesianListLegacy.prototype.importComponent = function(importer, inaElement, modelComponent, parentComponent, context)
{
	var inaCartesianList = inaElement;
	var cartesianListExt = modelComponent;
	var filterExpression = parentComponent;
	var fieldAccessor = context.getFieldAccessorSingle();
	var fieldName = inaCartesianList.getStringByKey("FieldName");
	var cartesianList = cartesianListExt;
	if (oFF.notNull(fieldName))
	{
		var field = fieldAccessor.getFieldByName(fieldName);
		if (oFF.isNull(field))
		{
			var queryModel = filterExpression.getQueryModel();
			if (oFF.notNull(queryModel))
			{
				var dimensionByName = queryModel.getDimensionByNameFromExistingMetadata(fieldName);
				if (oFF.notNull(dimensionByName))
				{
					var inaHierarchy2 = inaCartesianList.getStructureByKey("Hierarchy");
					if (oFF.isNull(inaHierarchy2))
					{
						field = dimensionByName.getFlatKeyField();
					}
					else
					{
						field = dimensionByName.getHierarchyKeyField();
					}
				}
			}
		}
		if (oFF.notNull(field))
		{
			var inaHierarchy = inaCartesianList.getStructureByKey("Hierarchy");
			var inaHierarchyName = null;
			var inaHierarchyDueDate = null;
			var inaHierarchyVersion = null;
			if (oFF.notNull(inaHierarchy))
			{
				inaHierarchyName = inaHierarchy.getStringByKey("Name");
				if (importer.getSession().hasFeature(oFF.FeatureToggleOlap.HIERARCHY_INFO_IN_FILTER) && importer.isAbap(field))
				{
					var hierarchyDueDateValue = inaHierarchy.getStringByKey("DueDate");
					if (oFF.notNull(hierarchyDueDateValue))
					{
						inaHierarchyDueDate = oFF.XDate.createDateFromSAPFormat(hierarchyDueDateValue);
					}
					inaHierarchyVersion = inaHierarchy.getStringByKey("Version");
				}
			}
			if (oFF.isNull(cartesianList))
			{
				cartesianList = oFF.QFilterCartesianList._createMd(context, filterExpression, field.getMetadata(), inaHierarchyName);
				cartesianList.setHierarchyInfo(inaHierarchyName, inaHierarchyDueDate, inaHierarchyVersion);
			}
			else
			{
				cartesianList.clear();
			}
			var convertToFlatFilter = inaCartesianList.getBooleanByKeyExt("ConvertToFlatSelection", false);
			cartesianList.setConvertToFlatFilter(convertToFlatFilter);
			var supplementsFieldsNamesList = inaCartesianList.getListByKey("SupplementsFieldNames");
			if (oFF.notNull(supplementsFieldsNamesList))
			{
				var len = supplementsFieldsNamesList.size();
				for (var y = 0; y < len; y++)
				{
					var name = supplementsFieldsNamesList.getStringAt(y);
					var supplField = fieldAccessor.getFieldByName(name);
					cartesianList.addSupplementField(supplField);
				}
			}
			var elements = inaCartesianList.getListByKey("Elements");
			if (oFF.notNull(elements))
			{
				var size = elements.size();
				for (var i = 0; i < size; i++)
				{
					var setOperandElement = elements.getStructureAt(i);
					var element = importer.importFilterOperation(setOperandElement, cartesianList, context);
					cartesianList.add(element);
				}
			}
		}
	}
	return cartesianList;
};
oFF.QInARepoFilterCartesianListLegacy.prototype.exportComponent = oFF.noSupport;

oFF.InARepoStructureMemberLazyLoader = function() {};
oFF.InARepoStructureMemberLazyLoader.prototype = new oFF.XObjectExt();
oFF.InARepoStructureMemberLazyLoader.prototype._ff_c = "InARepoStructureMemberLazyLoader";

oFF.InARepoStructureMemberLazyLoader.create = function(dimension, mode, inaStructure)
{
	if (oFF.isNull(mode))
	{
		throw oFF.XException.createIllegalArgumentException("InARepoStrucutreMemberLazyLoader - QModelFormat mode is null");
	}
	if (!mode.isTypeOf(oFF.QModelFormat.INA_REPOSITORY))
	{
		throw oFF.XException.createIllegalArgumentException(oFF.XStringUtils.concatenate2("InARepoStrucutreMemberLazyLoader - Does not support QModelFormat:", mode.getName()));
	}
	var lazyLoader = new oFF.InARepoStructureMemberLazyLoader();
	lazyLoader.m_dimension = dimension;
	lazyLoader.m_importer = oFF.QInAImportFactory.createWithQueryManagerCapabilities(dimension.getApplication(), mode, dimension.getQueryManager());
	lazyLoader.m_modelFormat = mode;
	lazyLoader.m_inaStructure = inaStructure.cloneExt(null);
	lazyLoader.m_repoMetadataMap = oFF.XHashMapByString.create();
	lazyLoader.m_memberNameList = oFF.XListOfString.create();
	var inaMemberList = lazyLoader.m_inaStructure.getListByKey("MembersRepo");
	if (oFF.notNull(inaMemberList))
	{
		for (var i = 0; i < inaMemberList.size(); i++)
		{
			var inaMember = inaMemberList.get(i).asStructure();
			lazyLoader.m_repoMetadataMap.put(inaMember.getStringByKey("Name"), inaMember);
			lazyLoader.m_memberNameList.add(inaMember.getStringByKey("Name"));
		}
	}
	return lazyLoader;
};
oFF.InARepoStructureMemberLazyLoader.prototype.m_dimension = null;
oFF.InARepoStructureMemberLazyLoader.prototype.m_importer = null;
oFF.InARepoStructureMemberLazyLoader.prototype.m_modelFormat = null;
oFF.InARepoStructureMemberLazyLoader.prototype.m_repoMetadataMap = null;
oFF.InARepoStructureMemberLazyLoader.prototype.m_memberNameList = null;
oFF.InARepoStructureMemberLazyLoader.prototype.m_inaStructure = null;
oFF.InARepoStructureMemberLazyLoader.prototype.loadStructureMember = function(memberName)
{
	if (this.m_repoMetadataMap.getByKey(memberName) !== null)
	{
		var memberIdx = this.m_memberNameList.getIndex(memberName);
		if (memberIdx >= 0)
		{
			var inaMembersStructure = oFF.PrFactory.createStructure();
			var inaStructureKeys = this.m_inaStructure.getKeysAsIteratorOfString();
			while (inaStructureKeys.hasNext())
			{
				var key = inaStructureKeys.next();
				inaMembersStructure.put(key, this.m_inaStructure.getByKey(key));
			}
			var memberList = inaMembersStructure.putNewList("MembersRepo");
			memberList.add(this.m_repoMetadataMap.getByKey(memberName));
			this.m_repoMetadataMap.remove(memberName);
			var inaMemberList = this.m_inaStructure.getListByKey("MembersRepo");
			inaMemberList.removeAt(memberIdx);
			this.m_memberNameList.removeAt(memberIdx);
			this.loadStructureMemberStructure(inaMembersStructure);
		}
	}
};
oFF.InARepoStructureMemberLazyLoader.prototype.loadAllStructureMembers = function()
{
	var inaMemberList = this.m_inaStructure.getListByKey("MembersRepo");
	if (oFF.notNull(inaMemberList) && inaMemberList.size() > 0)
	{
		var inaMembersStructure = oFF.PrFactory.createStructure();
		var inaStructureKeys = this.m_inaStructure.getKeysAsIteratorOfString();
		while (inaStructureKeys.hasNext())
		{
			var key = inaStructureKeys.next();
			inaMembersStructure.put(key, this.m_inaStructure.getByKey(key));
		}
		var memberList = inaMembersStructure.putNewList("MembersRepo");
		memberList.addAll(inaMemberList);
		this.m_repoMetadataMap.clear();
		this.m_memberNameList.clear();
		inaMemberList.clear();
		this.loadStructureMemberStructure(inaMembersStructure);
	}
};
oFF.InARepoStructureMemberLazyLoader.prototype.loadStructureMemberStructure = function(inaMembersStructure)
{
	this.m_dimension.getQueryManager().stopEventing();
	var originalBasicMeasureAggregationExportedInRepo = this.m_dimension.getQueryModel().isBasicMeasureAggregationExportedInRepo();
	if (!originalBasicMeasureAggregationExportedInRepo)
	{
		this.m_dimension.getQueryModel().setBasicMeasureAggregationExportForRepo(true);
	}
	var originalBasicMeasureSettingsExportedInRepo = this.m_dimension.getQueryModel().isBasicMeasureSettingsExportedInRepo();
	if (!originalBasicMeasureSettingsExportedInRepo)
	{
		this.m_dimension.getQueryModel().setBasicMeasureSettingsExportedInRepo(true);
	}
	this.m_importer.importComponent(oFF.OlapComponentType.MEMBERS, inaMembersStructure, this.m_dimension, null, this.m_dimension.getContext());
	if (!originalBasicMeasureAggregationExportedInRepo)
	{
		this.m_dimension.getQueryModel().setBasicMeasureAggregationExportForRepo(false);
	}
	if (!originalBasicMeasureSettingsExportedInRepo)
	{
		this.m_dimension.getQueryModel().setBasicMeasureSettingsExportedInRepo(false);
	}
	this.m_dimension.getQueryManager().resumeEventing();
};
oFF.InARepoStructureMemberLazyLoader.prototype.copyStructureMemberLazyLoader = function(dimension)
{
	return oFF.InARepoStructureMemberLazyLoader.create(dimension, this.m_modelFormat, this.m_inaStructure);
};

oFF.QInARepoVariableManager = function() {};
oFF.QInARepoVariableManager.prototype = new oFF.QInAComponentWithList();
oFF.QInARepoVariableManager.prototype._ff_c = "QInARepoVariableManager";

oFF.QInARepoVariableManager.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.VARIABLE_MANAGER;
};
oFF.QInARepoVariableManager.prototype.getTagName = function()
{
	return "Variables";
};
oFF.QInARepoVariableManager.prototype.getModelFormat = function()
{
	return oFF.QModelFormat.INA_REPOSITORY;
};
oFF.QInARepoVariableManager.prototype.importComponentWithList = function(importer, inaList, modelComponent, parentComponent, context)
{
	var variableContainer = modelComponent;
	if (oFF.notNull(inaList))
	{
		var len = inaList.size();
		for (var varIdx = 0; varIdx < len; varIdx++)
		{
			var inaVariable = inaList.getStructureAt(varIdx);
			var variableName = inaVariable.getStringByKey("Name");
			var variable = variableContainer.getVariableBaseByName(variableName);
			if (oFF.notNull(variable))
			{
				var variableType = variable.getVariableType();
				if (variableType.isTypeOf(oFF.VariableType.SIMPLE_TYPE_VARIABLE))
				{
					importer.importSimpleTypeVariable(inaVariable, variable, context);
				}
				else if (variableType.isTypeOf(oFF.VariableType.DIMENSION_MEMBER_VARIABLE))
				{
					importer.importDimensionMemberVariable(inaVariable, variable, context);
				}
				else if (variableType.isTypeOf(oFF.VariableType.OPTION_LIST_VARIABLE))
				{
					importer.importOptionListVariable(inaVariable, variable, context);
				}
				else
				{
					importer.addError(oFF.ErrorCodes.INVALID_PARAMETER, oFF.XStringUtils.concatenate5("The variable '", variableName, "' of variable type '", variableType.getName(), "' was not imported correctly"));
				}
			}
			else
			{
				importer.addWarning(oFF.ErrorCodes.ET_ELEMENT_NOT_FOUND, oFF.XStringUtils.concatenate3("The variable '", variableName, "' was not found"));
			}
		}
	}
	return variableContainer;
};
oFF.QInARepoVariableManager.prototype.exportComponentWithList = function(exporter, modelComponent, flags)
{
	var output;
	var variableContainer = modelComponent;
	var queryModel = variableContainer.getQueryModel();
	if (oFF.notNull(queryModel) && !queryModel.isExportingVariables() && !queryModel.hasProcessingStep())
	{
		output = null;
	}
	else
	{
		output = null;
		var variables = variableContainer.getVariables();
		if (oFF.XCollectionUtils.hasElements(variables))
		{
			var inaVariableList = oFF.PrFactory.createList();
			var len = variables.size();
			for (var i = 0; i < len; i++)
			{
				var variable = variables.get(i);
				var shouldContinueExporting = exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || variable.getModCounter() > 0;
				if (shouldContinueExporting)
				{
					var inaVariable = exporter.exportVariable(variable, null);
					inaVariableList.add(inaVariable);
				}
			}
			output = inaVariableList;
		}
	}
	return output;
};

oFF.QInARepository = function() {};
oFF.QInARepository.prototype = new oFF.QInAComponentWithStructure();
oFF.QInARepository.prototype._ff_c = "QInARepository";

oFF.QInARepository.prototype.getModelFormat = function()
{
	return oFF.QModelFormat.INA_REPOSITORY;
};
oFF.QInARepository.prototype.newComponentCreationAllowed = function(importer, inaStructure)
{
	return importer.getMode() !== oFF.QModelFormat.INA_REPOSITORY_DELTA || importer.getMode() === oFF.QModelFormat.INA_REPOSITORY_DELTA && inaStructure.getBooleanByKeyExt("UserDefinedComponent", false);
};
oFF.QInARepository.prototype.isMatching = function(inaImportElement)
{
	var isMatching = oFF.QInAComponentWithStructure.prototype.isMatching.call( this , inaImportElement);
	if (isMatching && oFF.notNull(inaImportElement))
	{
		var inaStructure = inaImportElement;
		var tagName = this.getTagName();
		if (oFF.isNull(tagName))
		{
			if (inaStructure.getStringByKey("CType") === null)
			{
				isMatching = false;
			}
		}
		else
		{
			isMatching = inaStructure.containsKey(tagName);
		}
	}
	return isMatching;
};
oFF.QInARepository.prototype.extendCustom = function(exporter, modelComponent, inaStructure)
{
	var olapComponentType = this.getComponentType();
	var ctypeValue = oFF.QInAConverter.lookupComponentTypeInA(olapComponentType);
	if (oFF.isNull(ctypeValue))
	{
		throw oFF.XException.createRuntimeException("ctype not found");
	}
	if (inaStructure.hasElements())
	{
		inaStructure.putString("CType", ctypeValue);
		var repoDeltaFeatureActivated = modelComponent.getApplication() !== null && modelComponent.getSession().hasFeature(oFF.FeatureToggleOlap.INA_REPOSITORY_DELTA);
		if (repoDeltaFeatureActivated || exporter.getOriginalMode() === oFF.QModelFormat.INA_CLONE)
		{
			var changedProperties = modelComponent.getChangedProperties();
			var changedPropertiesInDetail = modelComponent.getChangedPropertiesInDetail();
			var changedPropertiesFromModellerMetadata = modelComponent.getChangedPropertiesFromModellerMetadata();
			if (oFF.XCollectionUtils.hasElements(changedProperties))
			{
				var changedPropertiesList = oFF.PrFactory.createList();
				var listToAdd = changedProperties.getValuesAsReadOnlyListOfString();
				changedPropertiesList.addAllStrings(listToAdd);
				inaStructure.put("ChangedProperties", changedPropertiesList);
			}
			if (oFF.XCollectionUtils.hasElements(changedPropertiesInDetail))
			{
				var changedPropertiesInDetailInA = oFF.PrFactory.createStructure();
				var keysAsReadOnlyListOfString = changedPropertiesInDetail.getKeysAsReadOnlyListOfString();
				for (var i = 0; i < keysAsReadOnlyListOfString.size(); i++)
				{
					var key = keysAsReadOnlyListOfString.get(i);
					var changedPropertiesForProperty = changedPropertiesInDetailInA.putNewStructure(key);
					var internalObject = changedPropertiesInDetail.getByKey(key);
					if (oFF.notNull(internalObject))
					{
						var internalKeys = internalObject.getKeysAsReadOnlyListOfString();
						for (var internalKeyIndex = 0; internalKeyIndex < internalKeys.size(); internalKeyIndex++)
						{
							var internalKey = internalKeys.get(internalKeyIndex);
							var byKey = internalObject.getByKey(internalKey);
							changedPropertiesForProperty.putString(internalKey, oFF.isNull(byKey) ? null : byKey.toString());
						}
					}
				}
				inaStructure.put("ChangedPropertiesInDetail", changedPropertiesInDetailInA);
			}
			if (oFF.XCollectionUtils.hasElements(changedPropertiesFromModellerMetadata))
			{
				var changedPropertiesFromModellerMetadataList = oFF.PrFactory.createList();
				changedPropertiesFromModellerMetadataList.addAllStrings(changedPropertiesFromModellerMetadata.getValuesAsReadOnlyListOfString());
				inaStructure.put("ChangedPropertiesFromModellerMetadata", changedPropertiesFromModellerMetadataList);
			}
			if (modelComponent.canMaterializeCompleteObject())
			{
				inaStructure.putBoolean("UserDefinedComponent", true);
			}
		}
	}
	return inaStructure;
};
oFF.QInARepository.prototype.exportKeyReference = function(exporter, modelComponent, inaStructure)
{
	var done = false;
	var modelComponent2 = modelComponent;
	var context = modelComponent2.getContext();
	var queryManager = null;
	var olapEnv = null;
	if (oFF.notNull(context))
	{
		queryManager = context.getQueryManager();
		olapEnv = context.getOlapEnv();
	}
	if (oFF.isNull(queryManager) || queryManager.isKeyRefSerializationEnabled())
	{
		if (oFF.notNull(olapEnv) && olapEnv.getClientQueryObjectManager().getClientQueryObjectIncludeReleasedByKeyRef(modelComponent, null) !== null)
		{
			oFF.QInARepoUtils.addKeyRefStructure(exporter, modelComponent, inaStructure, queryManager);
			done = true;
		}
		else if (oFF.isNull(olapEnv) && modelComponent.getStorageName() !== null && !oFF.XString.isEqual(modelComponent.getStorageName(), oFF.KeyRefConstants.MAIN_STORAGE) || modelComponent.isReleased())
		{
			oFF.QInARepoUtils.addKeyRefStructure(exporter, modelComponent, inaStructure, queryManager);
			done = true;
		}
	}
	return done;
};
oFF.QInARepository.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	return inaStructure;
};
oFF.QInARepository.prototype.removeModelElementsNotInInA = function(importer, inaList, componentManager, listInComponentManager)
{
	if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA)
	{
		var namesOfInAObjects = this.getNamesOfElementsInList(inaList);
		for (var i = 0; i < listInComponentManager.size(); i++)
		{
			var modelComponent = listInComponentManager.get(i);
			if (!namesOfInAObjects.contains(modelComponent.getName()))
			{
				componentManager.removeElement(modelComponent);
			}
		}
	}
};
oFF.QInARepository.prototype.getNamesOfElementsInList = function(inaList)
{
	var size = inaList.size();
	var namesOfInAObjects = oFF.XListOfString.create();
	for (var index = 0; index < size; index++)
	{
		var inaComponent = inaList.getStructureAt(index);
		namesOfInAObjects.add(inaComponent.getStringByKey("Name"));
	}
	return namesOfInAObjects;
};

oFF.QInARepoAttributeLegacy = function() {};
oFF.QInARepoAttributeLegacy.prototype = new oFF.QInAComponentWithStructure();
oFF.QInARepoAttributeLegacy.prototype._ff_c = "QInARepoAttributeLegacy";

oFF.QInARepoAttributeLegacy.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.ATTRIBUTE;
};
oFF.QInARepoAttributeLegacy.prototype.getModelFormat = function()
{
	return oFF.QModelFormat.INA_REPOSITORY;
};
oFF.QInARepoAttributeLegacy.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var dimension = parentComponent;
	var name = inaStructure.getStringByKey("Name");
	var attribute = dimension.getAttributeByName(name);
	if (oFF.notNull(attribute))
	{
		var inaResultSetFields = inaStructure.getListByKey("ResultSetFields");
		if (oFF.notNull(inaResultSetFields))
		{
			var resultSetFields = attribute.getResultSetFields();
			resultSetFields.clear();
			var len = inaResultSetFields.size();
			for (var i = 0; i < len; i++)
			{
				var field = attribute.getFieldByName(inaResultSetFields.getStringAt(i));
				if (oFF.notNull(field))
				{
					resultSetFields.add(field);
				}
			}
		}
	}
	return attribute;
};
oFF.QInARepoAttributeLegacy.prototype.exportComponentWithStructure = oFF.noSupport;

oFF.QInARepoAxesSettingsLegacy = function() {};
oFF.QInARepoAxesSettingsLegacy.prototype = new oFF.QInAComponentWithList();
oFF.QInARepoAxesSettingsLegacy.prototype._ff_c = "QInARepoAxesSettingsLegacy";

oFF.QInARepoAxesSettingsLegacy.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.AXES_SETTINGS;
};
oFF.QInARepoAxesSettingsLegacy.prototype.getTagName = function()
{
	return "Axes";
};
oFF.QInARepoAxesSettingsLegacy.prototype.getModelFormat = function()
{
	return oFF.QModelFormat.INA_REPOSITORY;
};
oFF.QInARepoAxesSettingsLegacy.prototype.importComponentWithList = function(importer, inaList, modelComponent, parentComponent, context)
{
	if (oFF.notNull(inaList))
	{
		var queryModel = context.getQueryModel();
		if (importer.capabilities.supportsZeroSuppression() || importer.capabilities.supportsNullZeroSuppression())
		{
			var all = oFF.AxisType.getAll();
			var allSize = all.size();
			for (var k = 0; k < allSize; k++)
			{
				var axis = queryModel.getAxisBase(all.get(k));
				if (oFF.notNull(axis))
				{
					axis.setSupportsZeroSuppression(true);
				}
			}
		}
		var len = inaList.size();
		for (var i = 0; i < len; i++)
		{
			importer.importAxis(inaList.getStructureAt(i), null, context);
		}
	}
	return null;
};
oFF.QInARepoAxesSettingsLegacy.prototype.exportComponentWithList = oFF.noSupport;

oFF.QInARepoAxisLegacy = function() {};
oFF.QInARepoAxisLegacy.prototype = new oFF.QInAComponentWithStructure();
oFF.QInARepoAxisLegacy.prototype._ff_c = "QInARepoAxisLegacy";

oFF.QInARepoAxisLegacy.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.AXIS;
};
oFF.QInARepoAxisLegacy.prototype.getModelFormat = function()
{
	return oFF.QModelFormat.INA_REPOSITORY;
};
oFF.QInARepoAxisLegacy.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var supportsZeroSuppression = importer.capabilities.supportsZeroSuppression();
	var axisType;
	var axisTypeValue = inaStructure.getStringByKey("Axis");
	if (oFF.isNull(axisTypeValue))
	{
		axisType = oFF.QInAConverter.lookupAxisTypeInt(inaStructure.getIntegerByKey("Type"));
	}
	else
	{
		axisType = oFF.QInAConverter.lookupAxisType(axisTypeValue);
	}
	var queryModel = context.getQueryModel();
	var axis = queryModel.getAxisBase(axisType);
	if (oFF.notNull(axis))
	{
		if (supportsZeroSuppression)
		{
			var valueType = inaStructure.getIntegerByKey("ZeroSuppressionType");
			var zeroSuppressionType = oFF.QInAConverter.lookupSuppressionType(valueType);
			axis.setZeroSuppressionType(zeroSuppressionType);
			axis.setDefaultZeroSuppression(zeroSuppressionType);
		}
		importer.importTotals(inaStructure, axis.getResultStructureControllerBase(), context);
	}
	return axis;
};
oFF.QInARepoAxisLegacy.prototype.exportComponentWithStructure = oFF.noSupport;

oFF.QInARepoConditionManagerLegacy = function() {};
oFF.QInARepoConditionManagerLegacy.prototype = new oFF.QInAComponentWithList();
oFF.QInARepoConditionManagerLegacy.prototype._ff_c = "QInARepoConditionManagerLegacy";

oFF.QInARepoConditionManagerLegacy.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.CONDITIONS_MANAGER;
};
oFF.QInARepoConditionManagerLegacy.prototype.getTagName = function()
{
	return "Conditions";
};
oFF.QInARepoConditionManagerLegacy.prototype.getModelFormat = function()
{
	return oFF.QModelFormat.INA_REPOSITORY;
};
oFF.QInARepoConditionManagerLegacy.prototype.importComponentWithList = function(importer, inaList, modelComponent, parentComponent, context)
{
	var conditionManager = modelComponent;
	if (oFF.notNull(conditionManager))
	{
		conditionManager.clear();
		if (oFF.notNull(inaList))
		{
			var queryModelBase = context.getQueryModel();
			var len = inaList.size();
			for (var i = 0; i < len; i++)
			{
				var inaCurrentCondition = inaList.getStructureAt(i);
				var currentCondition = importer.importCondition(queryModelBase, inaCurrentCondition, null);
				conditionManager.add(currentCondition);
			}
		}
	}
	return conditionManager;
};
oFF.QInARepoConditionManagerLegacy.prototype.exportComponentWithList = oFF.noSupport;

oFF.QInARepoConditionsConditionLegacy = function() {};
oFF.QInARepoConditionsConditionLegacy.prototype = new oFF.QInAComponentWithStructure();
oFF.QInARepoConditionsConditionLegacy.prototype._ff_c = "QInARepoConditionsConditionLegacy";

oFF.QInARepoConditionsConditionLegacy.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.CONDITION;
};
oFF.QInARepoConditionsConditionLegacy.prototype.getModelFormat = function()
{
	return oFF.QModelFormat.INA_REPOSITORY;
};
oFF.QInARepoConditionsConditionLegacy.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	if (oFF.isNull(inaStructure))
	{
		return modelComponent;
	}
	var newCondition;
	var inACondName = inaStructure.getStringByKey("Name");
	if (oFF.isNull(modelComponent))
	{
		if (importer.getMode() === oFF.QModelFormat.INA_REPOSITORY)
		{
			var isBackendCondition = inaStructure.getBooleanByKeyExt("IsBackendCondition", true);
			newCondition = oFF.QCondition.create(context, parentComponent, inACondName, isBackendCondition);
		}
		else
		{
			newCondition = oFF.QCondition.create(context, parentComponent, inACondName, true);
		}
	}
	else
	{
		newCondition = modelComponent;
		newCondition.setConditionName(inACondName);
	}
	newCondition.setActive(inaStructure.getBooleanByKey("Active"));
	newCondition.setUsedState(inaStructure.getStringByKey("IsUsed"));
	newCondition.setDescription(inaStructure.getStringByKey("Description"));
	var onDisabled = inaStructure.getStringByKey("OnDisabled");
	newCondition.setApplyConditionAfterVisibilityFilter(inaStructure.getBooleanByKeyExt("AfterVisibilityFilter", false));
	if (oFF.notNull(onDisabled))
	{
		if (oFF.XString.isEqual(onDisabled, "Error"))
		{
			newCondition.setOnDisabledToWarning(false);
		}
	}
	var inAEvaluateOnDimensionTypeString = inaStructure.getStringByKey("EvaluateOnDimensions");
	var conditionDimensionEvaluationType = oFF.ConditionDimensionEvaluationType.lookupName(inAEvaluateOnDimensionTypeString);
	if (oFF.notNull(conditionDimensionEvaluationType))
	{
		newCondition.setDimensionEvaluationType(conditionDimensionEvaluationType);
	}
	var queryModel = context.getQueryModel();
	var inADimensionList = inaStructure.getListByKey("EvaluateOnDimensionsList");
	var dimSize;
	var idxDim;
	if (!oFF.PrUtils.isListEmpty(inADimensionList) && oFF.notNull(queryModel))
	{
		dimSize = inADimensionList.size();
		for (idxDim = 0; idxDim < dimSize; idxDim++)
		{
			var inACurrentDimensionName = inADimensionList.getStringAt(idxDim);
			if (oFF.notNull(inACurrentDimensionName))
			{
				var currentDimension = queryModel.getDimensionByNameFromExistingMetadata(inACurrentDimensionName);
				if (oFF.notNull(currentDimension))
				{
					newCondition.addEvaluationDimension(currentDimension);
				}
			}
		}
	}
	var inAThresholds = inaStructure.getListByKey("Threshold");
	if (!oFF.PrUtils.isListEmpty(inAThresholds))
	{
		var thresholdSize = inAThresholds.size();
		for (var idxThreshold = 0; idxThreshold < thresholdSize; idxThreshold++)
		{
			var inACurrentThreshold = inAThresholds.getStructureAt(idxThreshold);
			if (oFF.notNull(inACurrentThreshold))
			{
				newCondition.addThreshold(importer.importConditionThreshold(queryModel, inACurrentThreshold, null, newCondition));
			}
		}
	}
	newCondition.setBreakGroup(inaStructure.getBooleanByKeyExt("BreakGroup", false));
	var inABreakDimensionList = inaStructure.getListByKey("BreakGroupList");
	if (!oFF.PrUtils.isListEmpty(inABreakDimensionList) && oFF.notNull(queryModel))
	{
		dimSize = inABreakDimensionList.size();
		for (idxDim = 0; idxDim < dimSize; idxDim++)
		{
			var inACurrentBreakDimensionName = inABreakDimensionList.getStringAt(idxDim);
			if (oFF.notNull(inACurrentBreakDimensionName))
			{
				var currentBreakDimension = queryModel.getDimensionByNameFromExistingMetadata(inACurrentBreakDimensionName);
				if (oFF.notNull(currentBreakDimension))
				{
					newCondition.addBreakGroupDimension(currentBreakDimension);
				}
			}
		}
	}
	return newCondition;
};
oFF.QInARepoConditionsConditionLegacy.prototype.exportComponentWithStructure = oFF.noSupport;

oFF.QInARepoCurrencyTranslationManagerLegacy = function() {};
oFF.QInARepoCurrencyTranslationManagerLegacy.prototype = new oFF.QInAComponentWithStructure();
oFF.QInARepoCurrencyTranslationManagerLegacy.prototype._ff_c = "QInARepoCurrencyTranslationManagerLegacy";

oFF.QInARepoCurrencyTranslationManagerLegacy.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.CURRENCY_TRANSLATION_MANAGER;
};
oFF.QInARepoCurrencyTranslationManagerLegacy.prototype.getTagName = function()
{
	return "CurrencyTranslation";
};
oFF.QInARepoCurrencyTranslationManagerLegacy.prototype.getModelFormat = function()
{
	return oFF.QModelFormat.INA_REPOSITORY;
};
oFF.QInARepoCurrencyTranslationManagerLegacy.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var currencyTranslationManagerBase = modelComponent;
	if (oFF.notNull(currencyTranslationManagerBase) && oFF.notNull(inaStructure))
	{
		var currencyTranslationDetails = currencyTranslationManagerBase.getCurrencyTranslationDetails();
		if (oFF.notNull(currencyTranslationDetails))
		{
			currencyTranslationDetails.setCurrencyTranslationName(inaStructure.getStringByKey("Name"));
			currencyTranslationDetails.setCurrencyTranslationOperation(oFF.CurrencyTranslationOperation.lookup(inaStructure.getStringByKey("Operation")));
			currencyTranslationDetails.setCurrencyTranslationTarget(inaStructure.getStringByKey("Target"));
		}
	}
	return currencyTranslationManagerBase;
};
oFF.QInARepoCurrencyTranslationManagerLegacy.prototype.exportComponentWithStructure = oFF.noSupport;

oFF.QInARepoCustomHierarchyDefinitionLegacy = function() {};
oFF.QInARepoCustomHierarchyDefinitionLegacy.prototype = new oFF.QInAComponentWithStructure();
oFF.QInARepoCustomHierarchyDefinitionLegacy.prototype._ff_c = "QInARepoCustomHierarchyDefinitionLegacy";

oFF.QInARepoCustomHierarchyDefinitionLegacy.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.CUSTOM_HIERARCHY_DEFINITION;
};
oFF.QInARepoCustomHierarchyDefinitionLegacy.prototype.getModelFormat = function()
{
	return oFF.QModelFormat.INA_REPOSITORY;
};
oFF.QInARepoCustomHierarchyDefinitionLegacy.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	if (!importer.getMode().isTypeOf(oFF.QModelFormat.INA_REPOSITORY))
	{
		return null;
	}
	var inaDimensions = oFF.PrUtils.getListProperty(inaStructure, "Dimensions");
	var inaDimension = oFF.PrUtils.getStructureElement(inaDimensions, 0);
	if (oFF.notNull(inaDimension))
	{
		var system = inaDimension.getStringByKey("System");
		var dataSource = inaDimension.getStringByKey("DataSource");
		var dimensionName = inaDimension.getStringByKey("Name");
		var inaHierarchy = inaDimension.getStructureByKey("Hierarchy");
		if (oFF.notNull(inaHierarchy) && oFF.XStringUtils.isNotNullAndNotEmpty(system) && oFF.XStringUtils.isNotNullAndNotEmpty(dimensionName))
		{
			var ignoreDatasource = true;
			var application = importer.getApplication();
			if (oFF.notNull(application))
			{
				var systemDescription = application.getSystemLandscape().getSystemDescription(system);
				ignoreDatasource = oFF.isNull(systemDescription) ? true : systemDescription.getSystemType().isTypeOf(oFF.SystemType.ABAP);
			}
			var hierarchyDefinition = oFF.QCustomHierarchyDefinition.createByData(system, dataSource, dimensionName, inaHierarchy.getStringByKey("Description"), ignoreDatasource);
			hierarchyDefinition.setName(inaHierarchy.getStringByKey("Name"));
			this.addHierarchyNodesFromStructure(hierarchyDefinition, inaHierarchy.getStructureByKey("Nodes"));
			return hierarchyDefinition;
		}
	}
	return null;
};
oFF.QInARepoCustomHierarchyDefinitionLegacy.prototype.addHierarchyNodesFromStructure = function(hierarchyDefinition, nodes)
{
	var nodeIds = oFF.PrUtils.getListProperty(nodes, "NodeId");
	var nodeParentIds = oFF.PrUtils.getListProperty(nodes, "ParentId");
	var nodeNames = oFF.PrUtils.getListProperty(nodes, "NodeName");
	var nodeTypes = oFF.PrUtils.getListProperty(nodes, "NodeType");
	var size = oFF.PrUtils.getListSize(nodeIds, 0);
	if (oFF.PrUtils.isListEmpty(nodeIds) || oFF.PrUtils.isListEmpty(nodeParentIds) || oFF.PrUtils.isListEmpty(nodeNames) || oFF.PrUtils.isListEmpty(nodeTypes) || nodeParentIds.size() !== size || nodeNames.size() !== size || nodeTypes.size() !== size)
	{
		return;
	}
	var nodeMap = oFF.XSimpleMap.create();
	for (var i = 0; i < size; i++)
	{
		var nodeId = nodeIds.getIntegerAt(i);
		var nodeName = nodeNames.getStringAt(i);
		var nodeType = nodeTypes.getStringAt(i);
		var nodeParentId = nodeParentIds.getIntegerAt(i);
		var parent = nodeParentId === -1 ? hierarchyDefinition : nodeMap.getByKey(oFF.XIntegerValue.create(nodeParentId));
		if (oFF.notNull(parent))
		{
			if (oFF.XString.isEqual(nodeType, "1HIER_NODE_SIMPLE"))
			{
				nodeMap.put(oFF.XIntegerValue.create(nodeId), parent.addTextNode(nodeName));
			}
			else
			{
				parent.addMemberNode(nodeName);
			}
		}
	}
	oFF.XObjectExt.release(nodeMap);
};
oFF.QInARepoCustomHierarchyDefinitionLegacy.prototype.exportComponentWithStructure = oFF.noSupport;

oFF.QInARepoDataCellsAllLegacy = function() {};
oFF.QInARepoDataCellsAllLegacy.prototype = new oFF.QInAComponentWithList();
oFF.QInARepoDataCellsAllLegacy.prototype._ff_c = "QInARepoDataCellsAllLegacy";

oFF.QInARepoDataCellsAllLegacy.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.DATA_CELLS;
};
oFF.QInARepoDataCellsAllLegacy.prototype.getTagName = function()
{
	return "QueryDataCells";
};
oFF.QInARepoDataCellsAllLegacy.prototype.getModelFormat = function()
{
	return oFF.QModelFormat.INA_REPOSITORY;
};
oFF.QInARepoDataCellsAllLegacy.prototype.importComponentWithList = function(importer, inaList, modelComponent, parentComponent, context)
{
	var capabilities = context.getModelCapabilities();
	var queryModel = context.getQueryModel();
	if (capabilities.supportsDataCells() && importer.mode !== oFF.QModelFormat.INA_DATA_REINIT && queryModel.getQueryManager().getInitSettings().isRequestingDataCells())
	{
		var queryDataCellList = queryModel.getQueryDataCellsBase();
		queryDataCellList.clear();
		if (oFF.notNull(inaList))
		{
			for (var i = 0; i < inaList.size(); i++)
			{
				importer.importDataCell(inaList.getStructureAt(i), queryModel);
			}
		}
	}
	return null;
};
oFF.QInARepoDataCellsAllLegacy.prototype.exportComponentWithList = oFF.noSupport;

oFF.QInARepoDimensionsAllLegacy = function() {};
oFF.QInARepoDimensionsAllLegacy.prototype = new oFF.QInAComponentWithList();
oFF.QInARepoDimensionsAllLegacy.prototype._ff_c = "QInARepoDimensionsAllLegacy";

oFF.QInARepoDimensionsAllLegacy.exportTechnicalDimension = function(exporter, query, inaDimensionList, exportedDimensions)
{
	if (!exporter.capabilities.supportsUniversalModel())
	{
		return;
	}
	var queryCellManager = query.getQueryCellManager();
	if (queryCellManager.isEmpty())
	{
		return;
	}
	var dimensionByName = query.getDimensionByName("$$Cells$$");
	oFF.QInARepoDimensionsAllLegacy.exportDimension(exporter, dimensionByName, inaDimensionList, exportedDimensions);
};
oFF.QInARepoDimensionsAllLegacy.exportAxisDimensionsWithHeuristic = function(exporter, axis, parameterDimensionList, usedDimensions, exportedDimensions)
{
	var queryModel = axis.getQueryModel();
	var repositoryData = exporter.mode.isTypeOf(oFF.QModelFormat.INA_REPOSITORY_DATA);
	var optimizedExportModeActive = queryModel.isOptimizedExportModeActive();
	var dimCount = axis.getDimensionCount();
	for (var i = 0; i < dimCount; i++)
	{
		var dimension = axis.get(i);
		if (optimizedExportModeActive && dimension.isIgnoredOnOptimizedExport())
		{
			continue;
		}
		if (repositoryData && !usedDimensions.contains(dimension.getName()))
		{
			continue;
		}
		oFF.QInARepoDimensionsAllLegacy.exportDimension(exporter, dimension, parameterDimensionList, exportedDimensions);
	}
};
oFF.QInARepoDimensionsAllLegacy.exportAxisDimensions = function(exporter, axis, parameterDimensionList, exportedDimensions)
{
	var dimCount = axis.getDimensionCount();
	for (var i = 0; i < dimCount; i++)
	{
		var dimension = axis.get(i);
		oFF.QInARepoDimensionsAllLegacy.exportDimension(exporter, dimension, parameterDimensionList, exportedDimensions);
	}
};
oFF.QInARepoDimensionsAllLegacy.exportDimension = function(exporter, dimension, inaDimensionList, exportedDimensions)
{
	if (!exportedDimensions.contains(dimension.getName()))
	{
		exportedDimensions.add(dimension.getName());
		inaDimensionList.add(exporter.exportDimension(dimension, null));
	}
};
oFF.QInARepoDimensionsAllLegacy.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.DIMENSIONS;
};
oFF.QInARepoDimensionsAllLegacy.prototype.getTagName = function()
{
	return "Dimensions";
};
oFF.QInARepoDimensionsAllLegacy.prototype.getModelFormat = function()
{
	return oFF.QModelFormat.INA_REPOSITORY;
};
oFF.QInARepoDimensionsAllLegacy.prototype.importComponentWithList = function(importer, inaList, modelComponent, parentComponent, context)
{
	if (oFF.notNull(inaList))
	{
		var queryModel = modelComponent;
		var dimensionManager = queryModel.getDimensionManagerBase();
		if (importer.mode !== oFF.QModelFormat.INA_DATA_REINIT)
		{
			var freeAxis = queryModel.getFreeAxis();
			freeAxis.addAll(dimensionManager);
		}
		var size = inaList.size();
		var dimensionReferences = dimensionManager.getDimensionReferences();
		for (var k = 0; k < size; k++)
		{
			var inaDimension = inaList.getStructureAt(k);
			var dimName = inaDimension.getStringByKey("Name");
			var dimAxisString = inaDimension.getStringByKey("Axis");
			var dimension = null;
			if (inaDimension.containsKey("FieldMappings"))
			{
				var importCalculatedDimension = importer.importCalculatedDimension(inaDimension, queryModel);
				dimensionManager.addDimension(importCalculatedDimension);
				dimensionManager.finalizeDimensionMetadataSetup(importCalculatedDimension);
			}
			else if (inaDimension.containsKey("CType") && oFF.XComponentType.lookupComponentType(inaDimension.getStringByKey("CType")) === oFF.DimensionType.FORMULA_CALCULATED_DIMENSION)
			{
				var importFormulaCalculatedDimension = importer.importFormulaCalculatedDimension(inaDimension, queryModel, null);
				dimensionManager.addDimension(importFormulaCalculatedDimension);
				dimensionManager.finalizeDimensionMetadataSetup(importFormulaCalculatedDimension);
			}
			else
			{
				if (dimensionReferences.containsKey(dimName))
				{
					var dimAxis = oFF.AxisType.lookup(dimAxisString);
					if (importer.getMode().isTypeOf(oFF.QModelFormat.INA_REPOSITORY) || dimAxis === oFF.AxisType.COLUMNS || dimAxis === oFF.AxisType.ROWS)
					{
						dimension = dimensionManager.getDimensionByNameFromExistingMetadata(dimName);
					}
				}
				importer.importDimension(inaDimension, queryModel);
			}
			if (importer.mode !== oFF.QModelFormat.INA_DATA_REINIT)
			{
				if (oFF.isNull(dimension))
				{
					dimension = dimensionManager.getDimensionByNameInternal(dimName);
					if (oFF.isNull(dimension))
					{
						continue;
					}
				}
				if (oFF.isNull(dimAxisString))
				{
					dimAxisString = inaDimension.getStringByKeyExt("AxisDefault", "Free");
				}
				queryModel.getAxis(oFF.QInAConverter.lookupAxisType(dimAxisString)).add(dimension);
			}
		}
	}
	return modelComponent;
};
oFF.QInARepoDimensionsAllLegacy.prototype.exportDimensionIfOnFreeAxis = function(dimension)
{
	var queryModel = dimension.getQueryModel();
	var usedDimensions = oFF.XHashSetOfString.create();
	var filter = queryModel.getFilter();
	if (filter.isDynamicFilterInitialized())
	{
		oFF.DimensionUsageAnalyzer2.addDimensionsUsedInContainer(filter.getDynamicFilter(), usedDimensions);
		oFF.DimensionUsageAnalyzer2.addDimensionsUsedInContainer(filter.getLinkedFilter(oFF.CalculatedDimensionPrequeryBuilder.FAM_MEASURE_FILTER), usedDimensions);
		oFF.DimensionUsageAnalyzer2.addDimensionsUsedInContainer(filter.getLinkedFilter(oFF.CalculatedDimensionPrequeryBuilder.FAM_SECONDARY_MEASURE_FILTER), usedDimensions);
	}
	var isDimensionFiltered = usedDimensions.contains(dimension.getName());
	if (dimension.isMeasureStructure())
	{
		var exceptionManager = queryModel.getExceptionManager();
		var hasExceptions = oFF.XCollectionUtils.hasElements(exceptionManager);
		return isDimensionFiltered || hasExceptions;
	}
	return isDimensionFiltered;
};
oFF.QInARepoDimensionsAllLegacy.prototype.exportComponentWithList = function(exporter, modelComponent, flags)
{
	var inaDimensionList = oFF.PrFactory.createList();
	if (exporter.mode !== oFF.QModelFormat.INA_VALUE_HELP)
	{
		var query = modelComponent;
		var capabilities = query.getModelCapabilities();
		var exportedDimensions = oFF.XHashSetOfString.create();
		oFF.QInARepoDimensionsAllLegacy.exportAxisDimensions(exporter, query.getAxis(oFF.AxisType.ROWS), inaDimensionList, exportedDimensions);
		oFF.QInARepoDimensionsAllLegacy.exportAxisDimensions(exporter, query.getAxis(oFF.AxisType.COLUMNS), inaDimensionList, exportedDimensions);
		if (exporter.mode.isTypeOf(oFF.QModelFormat.INA_REPOSITORY))
		{
			var usedDimensions = oFF.XHashSetOfString.create();
			if (exporter.mode === oFF.QModelFormat.INA_REPOSITORY_DATA || exporter.mode === oFF.QModelFormat.INA_REPOSITORY_DATA_NO_VARS)
			{
				oFF.DimensionUsageAnalyzer2.setupHeuristic(query, usedDimensions);
			}
			oFF.QInARepoDimensionsAllLegacy.exportAxisDimensionsWithHeuristic(exporter, query.getAxis(oFF.AxisType.FREE), inaDimensionList, usedDimensions, exportedDimensions);
		}
		else if (exporter.mode.isTypeOf(oFF.QModelFormat.INA_DATA))
		{
			var isOutOfContextBlending = capabilities.supportsCubeBlendingOutOfContext() && query.isBlendingModel();
			var doExportFreeAxisForPlanning = query.getDataSource().getType() === oFF.MetaObjectType.PLANNING && exporter.getSession().hasFeature(oFF.FeatureToggleOlap.EXPORT_FREE_AXIS_FOR_PLANNING);
			var freeAxis = query.getAxis(oFF.AxisType.FREE);
			var sizeFreeAxis = freeAxis.size();
			var isAbap = exporter.isAbap(query);
			for (var idxFree = 0; idxFree < sizeFreeAxis; idxFree++)
			{
				var freeDimension = freeAxis.get(idxFree);
				var freeDimensionType = freeDimension.getDimensionType();
				if (freeDimensionType === oFF.DimensionType.MEASURE_STRUCTURE || freeDimensionType === oFF.DimensionType.SECONDARY_STRUCTURE)
				{
					var exportStructure = this.exportDimensionIfOnFreeAxis(freeDimension);
					if (exportStructure)
					{
						oFF.QInARepoDimensionsAllLegacy.exportDimension(exporter, freeDimension, inaDimensionList, exportedDimensions);
					}
				}
				else if (freeDimensionType === oFF.DimensionType.ACCOUNT)
				{
					var exportAccountOnFreeAxis = this.exportDimensionIfOnFreeAxis(freeDimension);
					if (exportAccountOnFreeAxis)
					{
						oFF.QInARepoDimensionsAllLegacy.exportDimension(exporter, freeDimension, inaDimensionList, exportedDimensions);
					}
				}
				else if (freeDimensionType.isTypeOf(oFF.DimensionType.CALCULATED_DIMENSION) || isOutOfContextBlending || (isAbap || doExportFreeAxisForPlanning) && freeDimension.isHierarchyActive())
				{
					oFF.QInARepoDimensionsAllLegacy.exportDimension(exporter, freeDimension, inaDimensionList, exportedDimensions);
				}
			}
			oFF.QInARepoDimensionsAllLegacy.exportTechnicalDimension(exporter, query, inaDimensionList, exportedDimensions);
		}
	}
	return inaDimensionList;
};

oFF.QInARepoDimensionsLegacy = function() {};
oFF.QInARepoDimensionsLegacy.prototype = new oFF.QInAComponentWithList();
oFF.QInARepoDimensionsLegacy.prototype._ff_c = "QInARepoDimensionsLegacy";

oFF.QInARepoDimensionsLegacy.exportTechnicalDimension = function(exporter, query, inaDimensionList, exportedDimensions)
{
	if (!exporter.capabilities.supportsUniversalModel())
	{
		return;
	}
	var queryCellManager = query.getQueryCellManager();
	if (queryCellManager.isEmpty())
	{
		return;
	}
	var dimensionByName = query.getDimensionByName("$$Cells$$");
	oFF.QInARepoDimensionsLegacy.exportDimension(exporter, dimensionByName, inaDimensionList, exportedDimensions);
};
oFF.QInARepoDimensionsLegacy.exportAxisDimensionsWithHeuristic = function(exporter, axis, parameterDimensionList, usedDimensions, exportedDimensions)
{
	var queryModel = axis.getQueryModel();
	var repositoryData = exporter.mode.isTypeOf(oFF.QModelFormat.INA_REPOSITORY_DATA);
	var optimizedExportModeActive = queryModel.isOptimizedExportModeActive();
	var dimCount = axis.getDimensionCount();
	for (var i = 0; i < dimCount; i++)
	{
		var dimension = axis.get(i);
		if (optimizedExportModeActive && dimension.isIgnoredOnOptimizedExport())
		{
			continue;
		}
		if (repositoryData && !usedDimensions.contains(dimension.getName()))
		{
			continue;
		}
		oFF.QInARepoDimensionsLegacy.exportDimension(exporter, dimension, parameterDimensionList, exportedDimensions);
	}
};
oFF.QInARepoDimensionsLegacy.exportAxisDimensions = function(exporter, axis, parameterDimensionList, exportedDimensions)
{
	var dimCount = axis.getDimensionCount();
	for (var i = 0; i < dimCount; i++)
	{
		var dimension = axis.get(i);
		if (oFF.QInARepoDimensionsLegacy._isForRendering(exporter.getMode(), dimension))
		{
			continue;
		}
		oFF.QInARepoDimensionsLegacy.exportDimension(exporter, dimension, parameterDimensionList, exportedDimensions);
	}
};
oFF.QInARepoDimensionsLegacy._isForRendering = function(exporterMode, dimension)
{
	var dimAxisType = dimension.getAxisType();
	return exporterMode === oFF.QModelFormat.INA_REPOSITORY_DATA_RENDERING && dimAxisType !== oFF.AxisType.ROWS && dimAxisType !== oFF.AxisType.COLUMNS;
};
oFF.QInARepoDimensionsLegacy.exportDimension = function(exporter, dimension, inaDimensionList, exportedDimensions)
{
	if (!exportedDimensions.contains(dimension.getName()))
	{
		exportedDimensions.add(dimension.getName());
		inaDimensionList.add(exporter.exportDimension(dimension, null));
	}
};
oFF.QInARepoDimensionsLegacy.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.DIMENSIONS;
};
oFF.QInARepoDimensionsLegacy.prototype.getTagName = function()
{
	return "Dimensions";
};
oFF.QInARepoDimensionsLegacy.prototype.getModelFormat = function()
{
	return oFF.QModelFormat.INA_REPOSITORY;
};
oFF.QInARepoDimensionsLegacy.prototype.importComponentWithList = function(importer, inaList, modelComponent, parentComponent, context)
{
	if (oFF.isNull(inaList))
	{
		return modelComponent;
	}
	var queryModel = modelComponent;
	var dimensionManager = queryModel.getDimensionManagerBase();
	if (importer.mode !== oFF.QModelFormat.INA_DATA_REINIT)
	{
		var freeAxis = queryModel.getFreeAxis();
		freeAxis.addAll(dimensionManager);
	}
	var size = inaList.size();
	var dimensionReferences = dimensionManager.getDimensionReferences();
	for (var k = 0; k < size; k++)
	{
		var inaDimension = inaList.getStructureAt(k);
		var dimName = inaDimension.getStringByKey("Name");
		var dimAxisString = inaDimension.getStringByKey("Axis");
		var dimension = null;
		if (inaDimension.containsKey("FieldMappings"))
		{
			var importCalculatedDimension = importer.importCalculatedDimension(inaDimension, queryModel);
			dimensionManager.addDimension(importCalculatedDimension);
			dimensionManager.finalizeDimensionMetadataSetup(importCalculatedDimension);
		}
		else if (inaDimension.containsKey("CType") && oFF.XComponentType.lookupComponentType(inaDimension.getStringByKey("CType")) === oFF.DimensionType.FORMULA_CALCULATED_DIMENSION)
		{
			var importFormulaCalculatedDimension = importer.importFormulaCalculatedDimension(inaDimension, queryModel, null);
			dimensionManager.addDimension(importFormulaCalculatedDimension);
			dimensionManager.finalizeDimensionMetadataSetup(importFormulaCalculatedDimension);
		}
		else
		{
			if (dimensionReferences.containsKey(dimName))
			{
				var dimAxis = oFF.AxisType.lookup(dimAxisString);
				if (importer.getMode().isTypeOf(oFF.QModelFormat.INA_REPOSITORY) || dimAxis === oFF.AxisType.COLUMNS || dimAxis === oFF.AxisType.ROWS)
				{
					dimension = dimensionManager.getDimensionByNameFromExistingMetadata(dimName);
				}
			}
			importer.importDimension(inaDimension, queryModel);
		}
		if (importer.mode !== oFF.QModelFormat.INA_DATA_REINIT)
		{
			if (oFF.isNull(dimension))
			{
				dimension = dimensionManager.getDimensionByNameInternal(dimName);
				if (oFF.isNull(dimension))
				{
					continue;
				}
			}
			if (oFF.isNull(dimAxisString))
			{
				dimAxisString = inaDimension.getStringByKeyExt("AxisDefault", "Free");
			}
			queryModel.getAxis(oFF.QInAConverter.lookupAxisType(dimAxisString)).add(dimension);
		}
	}
	return queryModel;
};
oFF.QInARepoDimensionsLegacy.prototype.exportDimensionIfOnFreeAxis = function(dimension)
{
	var queryModel = dimension.getQueryModel();
	var usedDimensions = oFF.XHashSetOfString.create();
	if (queryModel.getFilter().isDynamicFilterInitialized())
	{
		oFF.DimensionUsageAnalyzer2.addDimensionsUsedInContainer(queryModel.getFilter().getDynamicFilter(), usedDimensions);
	}
	var isDimensionFiltered = usedDimensions.contains(dimension.getName());
	if (dimension.isMeasureStructure())
	{
		var exceptionManager = queryModel.getExceptionManager();
		var hasExceptions = oFF.XCollectionUtils.hasElements(exceptionManager);
		return isDimensionFiltered || hasExceptions;
	}
	return isDimensionFiltered;
};
oFF.QInARepoDimensionsLegacy.prototype.exportComponentWithList = function(exporter, modelComponent, flags)
{
	var inaDimensionList = oFF.PrFactory.createList();
	if (exporter.mode !== oFF.QModelFormat.INA_VALUE_HELP)
	{
		var query = modelComponent;
		var capabilities = query.getModelCapabilities();
		var exportedDimensions = oFF.XHashSetOfString.create();
		oFF.QInARepoDimensionsLegacy.exportAxisDimensions(exporter, query.getAxis(oFF.AxisType.ROWS), inaDimensionList, exportedDimensions);
		oFF.QInARepoDimensionsLegacy.exportAxisDimensions(exporter, query.getAxis(oFF.AxisType.COLUMNS), inaDimensionList, exportedDimensions);
		if (exporter.mode.isTypeOf(oFF.QModelFormat.INA_REPOSITORY))
		{
			var usedDimensions = oFF.XHashSetOfString.create();
			if (exporter.mode === oFF.QModelFormat.INA_REPOSITORY_DATA || exporter.mode === oFF.QModelFormat.INA_REPOSITORY_DATA_NO_VARS)
			{
				oFF.DimensionUsageAnalyzer2.setupHeuristic(query, usedDimensions);
			}
			oFF.QInARepoDimensionsLegacy.exportAxisDimensionsWithHeuristic(exporter, query.getAxis(oFF.AxisType.FREE), inaDimensionList, usedDimensions, exportedDimensions);
		}
		else if (exporter.mode.isTypeOf(oFF.QModelFormat.INA_DATA))
		{
			var isOutOfContextBlending = capabilities.supportsCubeBlendingOutOfContext() && query.isBlendingModel();
			var doExportFreeAxisForPlanning = query.getDataSource().getType() === oFF.MetaObjectType.PLANNING && exporter.getSession().hasFeature(oFF.FeatureToggleOlap.EXPORT_FREE_AXIS_FOR_PLANNING);
			var freeAxis = query.getAxis(oFF.AxisType.FREE);
			var sizeFreeAxis = freeAxis.size();
			var isAbap = exporter.isAbap(query);
			for (var idxFree = 0; idxFree < sizeFreeAxis; idxFree++)
			{
				var freeDimension = freeAxis.get(idxFree);
				var freeDimensionType = freeDimension.getDimensionType();
				if (freeDimensionType === oFF.DimensionType.MEASURE_STRUCTURE || freeDimensionType === oFF.DimensionType.SECONDARY_STRUCTURE)
				{
					var exportStructure = this.exportDimensionIfOnFreeAxis(freeDimension);
					if (exportStructure)
					{
						oFF.QInARepoDimensionsLegacy.exportDimension(exporter, freeDimension, inaDimensionList, exportedDimensions);
					}
				}
				else if (freeDimensionType === oFF.DimensionType.ACCOUNT)
				{
					var exportAccountOnFreeAxis = this.exportDimensionIfOnFreeAxis(freeDimension);
					if (exportAccountOnFreeAxis)
					{
						oFF.QInARepoDimensionsLegacy.exportDimension(exporter, freeDimension, inaDimensionList, exportedDimensions);
					}
				}
				else if (freeDimensionType.isTypeOf(oFF.DimensionType.CALCULATED_DIMENSION) || isOutOfContextBlending || (isAbap || doExportFreeAxisForPlanning) && freeDimension.isHierarchyActive())
				{
					oFF.QInARepoDimensionsLegacy.exportDimension(exporter, freeDimension, inaDimensionList, exportedDimensions);
				}
			}
			oFF.QInARepoDimensionsLegacy.exportTechnicalDimension(exporter, query, inaDimensionList, exportedDimensions);
		}
	}
	return inaDimensionList;
};

oFF.QInARepoDrillManagerLegacy = function() {};
oFF.QInARepoDrillManagerLegacy.prototype = new oFF.QInAComponentWithList();
oFF.QInARepoDrillManagerLegacy.prototype._ff_c = "QInARepoDrillManagerLegacy";

oFF.QInARepoDrillManagerLegacy.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.DRILL_MANAGER;
};
oFF.QInARepoDrillManagerLegacy.prototype.getTagName = function()
{
	return "HierarchyNavigations";
};
oFF.QInARepoDrillManagerLegacy.prototype.getModelFormat = function()
{
	return oFF.QModelFormat.INA_REPOSITORY;
};
oFF.QInARepoDrillManagerLegacy.prototype.importComponentWithList = function(importer, inaList, modelComponent, parentComponent, context)
{
	var drillManager = modelComponent;
	var size;
	drillManager.removeAllContextDrillOperations();
	drillManager.removeZoomDrillOperationsByDimension(null);
	if (oFF.notNull(inaList))
	{
		var previousZoomStackPosition = -1;
		size = inaList.size();
		for (var idxHierNav = 0; idxHierNav < size; idxHierNav++)
		{
			var subStructure = inaList.getStructureAt(idxHierNav);
			var zoomDrillStackPosition = subStructure.getIntegerByKeyExt("ZoomDrillStackPosition", -1);
			if (zoomDrillStackPosition === -1)
			{
				importer.importDrillOperation(subStructure, drillManager, context);
			}
			else if (zoomDrillStackPosition > -1)
			{
				var zoomDrillPath = this.getZoomDrillPath(importer, drillManager, subStructure, context);
				if (oFF.XCollectionUtils.hasElements(zoomDrillPath))
				{
					if (zoomDrillStackPosition !== previousZoomStackPosition)
					{
						drillManager.pushEmptyZoomDrillForDimension(zoomDrillPath.get(zoomDrillPath.size() - 1).getDimension());
						previousZoomStackPosition = zoomDrillStackPosition;
					}
					var hideRoots = subStructure.getIntegerByKeyExt("DrillOffset", 0) > 0;
					drillManager.addZoomDrillPath(zoomDrillPath, hideRoots);
				}
			}
		}
	}
	return modelComponent;
};
oFF.QInARepoDrillManagerLegacy.prototype.getZoomDrillPath = function(importer, drillManager, inaStructure, context)
{
	var drillPath = oFF.XList.create();
	var drillContext = inaStructure.getListByKey("DrillContextMembers");
	if (oFF.notNull(drillContext))
	{
		var size = drillContext.size();
		for (var idxHierCtx = 0; idxHierCtx < size; idxHierCtx++)
		{
			var drillCtx = drillContext.getStructureAt(idxHierCtx);
			var drillPathElement = importer.importDrillPathElement(drillCtx, drillManager, context);
			drillPath.add(drillPathElement);
		}
	}
	var drillState = inaStructure.getStringByKey("DrillState");
	var drillMember = inaStructure.getStructureByKey("DrillMember");
	if (oFF.isNull(drillMember) || oFF.isNull(drillState))
	{
		return null;
	}
	var drillPathElementMember = importer.importDrillPathElement(drillMember, drillManager, context);
	drillPath.add(drillPathElementMember);
	return drillPath;
};
oFF.QInARepoDrillManagerLegacy.prototype.exportComponentWithList = oFF.noSupport;

oFF.QInARepoDrillPathElementLegacy = function() {};
oFF.QInARepoDrillPathElementLegacy.prototype = new oFF.QInAComponentWithStructure();
oFF.QInARepoDrillPathElementLegacy.prototype._ff_c = "QInARepoDrillPathElementLegacy";

oFF.QInARepoDrillPathElementLegacy.prototype.getComponentType = function()
{
	return oFF.MemberType.DRILL_PATH_ELEMENT;
};
oFF.QInARepoDrillPathElementLegacy.prototype.getModelFormat = function()
{
	return oFF.QModelFormat.INA_REPOSITORY;
};
oFF.QInARepoDrillPathElementLegacy.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var drillManager = parentComponent;
	var queryModel = drillManager.getContext().getQueryModel();
	var fieldName = inaStructure.getStringByKey("FieldName");
	var dimensionName = inaStructure.getStringByKey("DimensionName");
	var dimension;
	if (oFF.XStringUtils.isNotNullAndNotEmpty(dimensionName))
	{
		dimension = queryModel.getDimensionByNameFromExistingMetadata(dimensionName);
	}
	else
	{
		var field = queryModel.getFieldByNameOrAlias(fieldName);
		if (oFF.isNull(field))
		{
			dimension = queryModel.getDimensionByNameFromExistingMetadata(fieldName);
			if (oFF.notNull(dimension))
			{
				field = dimension.getKeyField();
				fieldName = field.getName();
			}
		}
		else
		{
			dimension = field.getDimension();
		}
	}
	var element = oFF.QDrillPathElement._create(context);
	element.setDimension(dimension);
	var member = inaStructure.getStringByKey("Member");
	element.setName(member);
	element.setFieldName(fieldName);
	return element;
};
oFF.QInARepoDrillPathElementLegacy.prototype.exportComponentWithStructure = oFF.noSupport;

oFF.QInARepoExceptionsLegacy = function() {};
oFF.QInARepoExceptionsLegacy.prototype = new oFF.QInAComponentWithList();
oFF.QInARepoExceptionsLegacy.prototype._ff_c = "QInARepoExceptionsLegacy";

oFF.QInARepoExceptionsLegacy.importEvaluates = function(inaException, member, newException, importer)
{
	var inaEvaluates = inaException.getListByKey("EvaluateOn");
	if (oFF.isNull(inaEvaluates))
	{
		return;
	}
	var size = inaEvaluates.size();
	var queryModel = member.getQueryModel();
	for (var evalIdx = 0; evalIdx < size; evalIdx++)
	{
		var inaEvaluate = inaEvaluates.getStructureAt(evalIdx);
		var fieldName = inaEvaluate.getStringByKey("Name");
		var someField = queryModel.getFieldByName(fieldName);
		if (oFF.isNull(someField))
		{
			var dimensionByName = queryModel.getDimensionByNameFromExistingMetadata(fieldName);
			if (oFF.notNull(dimensionByName))
			{
				someField = dimensionByName.getKeyField();
			}
		}
		if (oFF.isNull(someField))
		{
			someField = member.getKeyFieldValue().getField();
		}
		if (oFF.isNull(someField))
		{
			importer.addError(oFF.ErrorCodes.INVALID_TOKEN, oFF.XStringUtils.concatenate3("Could not find field '", fieldName, "'!"));
			return;
		}
		if (!inaEvaluate.containsKey("Low"))
		{
			importer.addError(oFF.ErrorCodes.INVALID_PARAMETER, oFF.XStringUtils.concatenate2("No low value for field: ", fieldName));
			return;
		}
		var valueType = someField.getValueType();
		var lowValue = oFF.QInAValueUtils.importValueByType(importer, inaEvaluate, "Low", valueType);
		if (importer.hasErrors())
		{
			importer.addError(oFF.ErrorCodes.INVALID_DATATYPE, oFF.XStringUtils.concatenate2("Unexpected low valuetype for field: ", valueType.getName()));
			return;
		}
		var newEvaluate = newException._addNewEvaluateWithFieldInternal(someField, lowValue);
		if (inaEvaluate.containsKey("High"))
		{
			var highValue = oFF.QInAValueUtils.importValueByType(importer, inaEvaluate, "High", valueType);
			if (importer.hasErrors())
			{
				importer.addError(oFF.ErrorCodes.INVALID_DATATYPE, oFF.XStringUtils.concatenate2("Unexpected high valuetype for field: ", valueType.getName()));
				return;
			}
			newEvaluate.setHighValue(highValue);
		}
		newEvaluate.setEvaluate(oFF.QExceptionEvalType.lookupExceptionEvalType(inaEvaluate.getStringByKey("Evaluate")));
		var operatorName = inaEvaluate.getStringByKey("Comparison");
		var operator = oFF.QInAConverter.lookupComparison(operatorName);
		if (oFF.isNull(operator))
		{
			importer.addError(oFF.ErrorCodes.INVALID_OPERATOR, oFF.XStringUtils.concatenate3("Unexpected comparison operator for evaluate: Operator: '", operatorName, "'"));
			return;
		}
		newEvaluate.setOperator(operator);
	}
};
oFF.QInARepoExceptionsLegacy.importThresholds = function(inaException, newException)
{
	var inaThresholds = inaException.getListByKey("Threshold");
	if (oFF.notNull(inaThresholds))
	{
		var size = inaThresholds.size();
		for (var thresholdIdx = 0; thresholdIdx < size; thresholdIdx++)
		{
			var inaThreshold = inaThresholds.getStructureAt(thresholdIdx);
			var alertLevel = inaThreshold.getIntegerByKeyExt("AlertLevel", -9999);
			var newThreshold;
			var isDouble = !inaThreshold.hasStringByKey("Low");
			if (isDouble)
			{
				newThreshold = newException._addNewThresholdInternal(inaThreshold.getDoubleByKey("Low"), oFF.QInAConverter.lookupAlertLevel(alertLevel));
			}
			else
			{
				newThreshold = newException._addNewThresholdWithStringInternal(inaThreshold.getStringByKey("Low"), oFF.QInAConverter.lookupAlertLevel(alertLevel));
			}
			var name = inaThreshold.getStringByKey("Name");
			if (oFF.notNull(name))
			{
				newThreshold.setName(name);
			}
			var operator = oFF.QInAConverter.lookupComparison(inaThreshold.getStringByKey("Comparison"));
			newThreshold.setOperator(operator);
			if (operator.getNumberOfParameters() === 2)
			{
				if (isDouble)
				{
					var highDouble = inaThreshold.getDoubleByKey("High");
					newThreshold.setHighValue(highDouble);
				}
				else
				{
					var highString = inaThreshold.getStringByKey("High");
					newThreshold.setHigh(highString);
				}
			}
			oFF.QInARepoExceptionsLegacy.importSettings(inaThreshold.getListByKey("Settings"), newThreshold);
		}
	}
};
oFF.QInARepoExceptionsLegacy.importSettings = function(inaSettings, newThreshold)
{
	if (oFF.isNull(inaSettings))
	{
		return;
	}
	var size = inaSettings.size();
	for (var iSetting = 0; iSetting < size; iSetting++)
	{
		var inaSetting = inaSettings.getStructureAt(iSetting);
		var name = inaSetting.getStringByKey("Name");
		var priority = inaSetting.getIntegerByKey("Priority");
		var value = inaSetting.getStringByKey("Value");
		if (oFF.notNull(value) && !oFF.XString.isEqual(value, ""))
		{
			var newSetting = newThreshold.addNewSetting(name, priority);
			newSetting.setValue(value);
		}
	}
};
oFF.QInARepoExceptionsLegacy.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.EXCEPTION_MANAGER;
};
oFF.QInARepoExceptionsLegacy.prototype.getTagName = function()
{
	return "Exceptions";
};
oFF.QInARepoExceptionsLegacy.prototype.getModelFormat = function()
{
	return oFF.QModelFormat.INA_REPOSITORY;
};
oFF.QInARepoExceptionsLegacy.prototype.isVersion1 = function(qInA, modelComponent)
{
	var componentType = modelComponent.getOlapComponentType();
	return !qInA.capabilities.supportsExceptionsV2() && componentType.isTypeOf(oFF.MemberType.ABSTRACT_MEMBER);
};
oFF.QInARepoExceptionsLegacy.prototype.isVersion2 = function(qInA, modelComponent)
{
	var componentType = modelComponent.getOlapComponentType();
	return qInA.capabilities.supportsExceptionsV2() && componentType.isTypeOf(oFF.OlapComponentType.QUERY_MODEL);
};
oFF.QInARepoExceptionsLegacy.prototype.importComponentWithList = function(importer, inaList, modelComponent, parentComponent, context)
{
	var exceptionManager = modelComponent.getQueryModel().getExceptionManager();
	exceptionManager.queueEventing();
	if (this.isVersion1(importer, modelComponent))
	{
		exceptionManager.removeAllExceptionsOfMeasure(modelComponent);
		this.importFormatV1(importer, inaList, modelComponent, exceptionManager);
	}
	else if (this.isVersion2(importer, modelComponent))
	{
		exceptionManager.clear();
		this.importFormatV2(importer, inaList, modelComponent, exceptionManager);
	}
	exceptionManager.resumeEventing();
	return exceptionManager;
};
oFF.QInARepoExceptionsLegacy.prototype.importFormatV1 = function(importer, inaList, member, exceptionManager)
{
	if (oFF.notNull(inaList))
	{
		var size = inaList.size();
		for (var exceptionIdx = 0; exceptionIdx < size; exceptionIdx++)
		{
			var inaException = inaList.getStructureAt(exceptionIdx);
			var newException = this.importException(importer, member, exceptionManager, inaException);
			newException.setMeasure(member);
			newException.setIsChangeable(inaException.getBooleanByKeyExt("Changegable", true));
		}
	}
};
oFF.QInARepoExceptionsLegacy.prototype.importException = function(importer, member, exceptionManager, inaException)
{
	var exceptionName = inaException.getStringByKey("Name");
	var exceptionText = inaException.getStringByKey("Text");
	var evalType = oFF.QExceptionEvalType.lookupExceptionEvalType(inaException.getStringByKey("EvaluateDefault"));
	var headerSettings = oFF.QExceptionHeaderSettings.lookupExceptionHeaderSetting(inaException.getStringByKey("ApplySettingsToHeader"));
	var isActive = inaException.getBooleanByKeyExt("Active", true);
	var isEvalAfterCalc = inaException.getBooleanByKeyExt("EvaluateBeforePostAggregation", true);
	var newException = exceptionManager._addNewExceptionInternal(exceptionName, exceptionText, evalType, headerSettings, isActive, !isEvalAfterCalc);
	newException.queueEventing();
	oFF.QInARepoExceptionsLegacy.importEvaluates(inaException, member, newException, importer);
	oFF.QInARepoExceptionsLegacy.importThresholds(inaException, newException);
	newException.resumeEventing();
	return newException;
};
oFF.QInARepoExceptionsLegacy.prototype.importFormatV2 = function(importer, inaList, queryModel, exceptionManager)
{
	if (oFF.isNull(inaList))
	{
		return;
	}
	var sizeExceptions = inaList.size();
	for (var iException = 0; iException < sizeExceptions; iException++)
	{
		var inaException = inaList.getStructureAt(iException);
		var structureContext = inaException.getListByKey("StructureContext");
		if (!oFF.PrUtils.isListEmpty(structureContext))
		{
			var exception = this.importContextItem(structureContext.getStructureAt(0), queryModel, exceptionManager, null, importer, inaException);
			if (oFF.notNull(exception))
			{
				if (structureContext.size() > 1)
				{
					this.importContextItem(structureContext.getStructureAt(1), queryModel, exceptionManager, exception, importer, inaException);
				}
				exception.setIsChangeable(inaException.getBooleanByKeyExt("Changegable", true));
			}
		}
	}
};
oFF.QInARepoExceptionsLegacy.prototype.importContextItem = function(structure, queryModel, exceptionManager, exception, importer, inaException)
{
	var importedException = exception;
	var dimension = queryModel.getDimensionByNameFromExistingMetadata(structure.getStringByKey("DimensionName"));
	if (oFF.notNull(dimension))
	{
		var member = this.getMemberFromContextItem(structure, dimension);
		if (oFF.notNull(member))
		{
			if (oFF.isNull(importedException))
			{
				importedException = this.importException(importer, member, exceptionManager, inaException);
			}
			if (dimension.isMeasureStructure())
			{
				importedException.setMeasure(member);
			}
			else
			{
				importedException.setStructure(member);
			}
			importedException.displayOnOtherMember(member, dimension.getStructureMember(structure.getStringByKey("DisplayOnOtherMember")));
			importedException.setEvaluateAllMembers(dimension, structure.getBooleanByKeyExt("EvaluateAllMembers", false));
		}
	}
	return importedException;
};
oFF.QInARepoExceptionsLegacy.prototype.getMemberFromContextItem = function(structure, dimension)
{
	var member = dimension.getStructureMember(structure.getStringByKey("MemberName"));
	if (oFF.isNull(member))
	{
		var evaluateAllMembers = structure.getBooleanByKeyExt("EvaluateAllMembers", false);
		var allStructureMembers = dimension.getAllStructureMembers();
		if (evaluateAllMembers && !allStructureMembers.isEmpty())
		{
			return allStructureMembers.get(0);
		}
	}
	return member;
};
oFF.QInARepoExceptionsLegacy.prototype.exportComponentWithList = oFF.noSupport;

oFF.QInARepoFilterAlgebraLegacy = function() {};
oFF.QInARepoFilterAlgebraLegacy.prototype = new oFF.QInAComponentWithStructure();
oFF.QInARepoFilterAlgebraLegacy.prototype._ff_c = "QInARepoFilterAlgebraLegacy";

oFF.QInARepoFilterAlgebraLegacy.prototype.getComponentType = function()
{
	return oFF.FilterComponentType.BOOLEAN_ALGEBRA;
};
oFF.QInARepoFilterAlgebraLegacy.prototype.getTagName = function()
{
	return "Operator";
};
oFF.QInARepoFilterAlgebraLegacy.prototype.getModelFormat = function()
{
	return oFF.QModelFormat.INA_REPOSITORY;
};
oFF.QInARepoFilterAlgebraLegacy.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var filterExpression = parentComponent;
	var inaSubSelections = inaStructure.getListByKey("SubSelections");
	if (oFF.notNull(inaSubSelections))
	{
		var code = inaStructure.getStringByKey("Code");
		var setWithChildren;
		if (oFF.XString.isEqual(code, "And"))
		{
			setWithChildren = oFF.QFilterAnd._create(context, filterExpression);
		}
		else if (oFF.XString.isEqual(code, "Not"))
		{
			setWithChildren = oFF.QFilterNot._create(context, filterExpression);
		}
		else
		{
			setWithChildren = oFF.QFilterOr._create(context, filterExpression);
		}
		var size = inaSubSelections.size();
		for (var i = 0; i < size; i++)
		{
			var subSelection = inaSubSelections.getStructureAt(i);
			var child = importer.importFilterElement(subSelection, null, filterExpression, context);
			if (oFF.notNull(child))
			{
				setWithChildren.add(child);
			}
		}
		if (setWithChildren.hasElements())
		{
			return setWithChildren;
		}
	}
	return null;
};
oFF.QInARepoFilterAlgebraLegacy.prototype.exportComponentWithStructure = oFF.noSupport;

oFF.QInARepoFilterAllLegacy = function() {};
oFF.QInARepoFilterAllLegacy.prototype = new oFF.QInAComponentWithStructure();
oFF.QInARepoFilterAllLegacy.prototype._ff_c = "QInARepoFilterAllLegacy";

oFF.QInARepoFilterAllLegacy.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.SELECTOR;
};
oFF.QInARepoFilterAllLegacy.prototype.getModelFormat = function()
{
	return oFF.QModelFormat.INA_REPOSITORY;
};
oFF.QInARepoFilterAllLegacy.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var filterComponent = modelComponent;
	importer.importFixedFilter(inaStructure, filterComponent, context);
	importer.importDynamicFilter(inaStructure, filterComponent, context);
	importer.importVisibilityFilter(inaStructure, filterComponent, context);
	return filterComponent;
};
oFF.QInARepoFilterAllLegacy.prototype.exportComponentWithStructure = oFF.noSupport;

oFF.QInARepoFilterCellValueOperandLegacy = function() {};
oFF.QInARepoFilterCellValueOperandLegacy.prototype = new oFF.QInAComponentWithStructure();
oFF.QInARepoFilterCellValueOperandLegacy.prototype._ff_c = "QInARepoFilterCellValueOperandLegacy";

oFF.QInARepoFilterCellValueOperandLegacy.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.FILTER_CELL_VALUE_OPERAND;
};
oFF.QInARepoFilterCellValueOperandLegacy.prototype.getModelFormat = function()
{
	return oFF.QModelFormat.INA_REPOSITORY;
};
oFF.QInARepoFilterCellValueOperandLegacy.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var low = inaStructure.getStringByKey("Low");
	if (oFF.XString.isEqual(low, ""))
	{
		low = null;
	}
	var high = inaStructure.getStringByKey("High");
	if (oFF.XString.isEqual(high, ""))
	{
		high = null;
	}
	var operator = oFF.QInAConverter.lookupComparison(inaStructure.getStringByKey("Comparison"));
	var operand = oFF.QFilterCellValueOperand._create(context, null, low, high, operator);
	operand.setIsExcluding(inaStructure.getBooleanByKey("IsExcluding"));
	return operand;
};
oFF.QInARepoFilterCellValueOperandLegacy.prototype.exportComponentWithStructure = oFF.noSupport;

oFF.QInARepoFilterElementLegacy = function() {};
oFF.QInARepoFilterElementLegacy.prototype = new oFF.QInAComponentWithStructure();
oFF.QInARepoFilterElementLegacy.prototype._ff_c = "QInARepoFilterElementLegacy";

oFF.QInARepoFilterElementLegacy.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.FILTER_ELEMENT;
};
oFF.QInARepoFilterElementLegacy.prototype.getModelFormat = function()
{
	return oFF.QModelFormat.INA_REPOSITORY;
};
oFF.QInARepoFilterElementLegacy.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var filterExpression = parentComponent;
	var filterElement = modelComponent;
	if (inaStructure.containsKey("Operator"))
	{
		filterElement = importer.importFilterAlgebra(filterExpression, inaStructure, context);
	}
	else
	{
		var inaSetOperand = inaStructure.getStructureByKey("SetOperand");
		if (oFF.isNull(inaSetOperand))
		{
			if (inaStructure.containsKey("GeometryOperand"))
			{
				filterElement = importer.importFilterGeo(filterExpression, inaStructure, context);
			}
		}
		else
		{
			filterElement = importer.importCartesianList(inaSetOperand, filterElement, filterExpression, context);
		}
	}
	return filterElement;
};
oFF.QInARepoFilterElementLegacy.prototype.exportComponentWithStructure = oFF.noSupport;

oFF.QInARepoFilterExpressionLegacy = function() {};
oFF.QInARepoFilterExpressionLegacy.prototype = new oFF.QInAComponentWithStructure();
oFF.QInARepoFilterExpressionLegacy.prototype._ff_c = "QInARepoFilterExpressionLegacy";

oFF.QInARepoFilterExpressionLegacy.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.FILTER_EXPRESSION;
};
oFF.QInARepoFilterExpressionLegacy.prototype.getModelFormat = function()
{
	return oFF.QModelFormat.INA_REPOSITORY;
};
oFF.QInARepoFilterExpressionLegacy.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var filterExpression = modelComponent;
	if (oFF.isNull(filterExpression))
	{
		filterExpression = oFF.QFactory.createFilterExpression(context, parentComponent);
	}
	var version = 0;
	var inaSelection = null;
	if (oFF.notNull(inaStructure))
	{
		inaSelection = inaStructure.getStructureByKey("Selection");
		if (oFF.isNull(inaSelection))
		{
			inaSelection = inaStructure.getStructureByKey("SelectionRepo");
			version = 1;
		}
	}
	filterExpression.setCartesianProduct(null);
	filterExpression.setComplexRoot(null);
	if (oFF.notNull(inaSelection))
	{
		var filterElement = importer.importFilterElement(inaSelection, null, filterExpression, context);
		if (oFF.notNull(filterElement))
		{
			if (version >= 1)
			{
				filterExpression.setComplexRoot(filterElement);
			}
			else
			{
				var cartesianProduct = oFF.QFilterUtil.convertComplexFilterToCartesian(filterElement);
				if (oFF.notNull(cartesianProduct))
				{
					filterExpression.setCartesianProduct(cartesianProduct);
				}
				else
				{
					filterExpression.setComplexRoot(filterElement);
				}
			}
		}
	}
	if (filterExpression.getModelCapabilities().supportsCellValueOperand())
	{
		filterExpression.setIsSuppressingNulls(false);
		filterExpression.clearCellValueFilter();
		if (oFF.notNull(inaStructure))
		{
			if (importer.mode.isTypeOf(oFF.QModelFormat.INA_REPOSITORY))
			{
				filterExpression.setIsSuppressingNulls(inaStructure.getBooleanByKeyExt("IsSuppressingNulls", false));
			}
			if (oFF.notNull(inaSelection))
			{
				var inaCellValueOperand = inaSelection.getStructureByKey("CellValueOperand");
				if (oFF.isNull(inaCellValueOperand))
				{
					var inaFilterAnd = inaSelection.getStructureByKey("Operator");
					if (oFF.notNull(inaFilterAnd))
					{
						var inaSubSelections = inaFilterAnd.getListByKey("SubSelections");
						if (inaSubSelections.size() === 2)
						{
							var inaSubSelectionStructure = inaSubSelections.getStructureAt(1);
							inaCellValueOperand = inaSubSelectionStructure.getStructureByKey("CellValueOperand");
						}
					}
				}
				if (oFF.notNull(inaCellValueOperand))
				{
					var inaElements = inaCellValueOperand.getListByKey("Elements");
					if (oFF.notNull(inaElements))
					{
						var nullSuppressionReference = oFF.QFilterCellValueOperand.createForNullSuppression(context, null);
						var size = inaElements.size();
						if (size > 0)
						{
							var inaNullSuppression = inaElements.getStructureAt(0);
							var nullSuppression = importer.importFilterCellValueOperand(inaNullSuppression, context);
							var startIdx = 0;
							if (nullSuppression.isEqualTo(nullSuppressionReference))
							{
								filterExpression.setIsSuppressingNulls(true);
								startIdx = 1;
							}
							filterExpression.clearCellValueFilter();
							for (var idx = startIdx; idx < size; idx++)
							{
								var inaCellElement = inaElements.getStructureAt(idx);
								var operand = importer.importFilterCellValueOperand(inaCellElement, context);
								filterExpression.addCellValueFilter(operand);
							}
						}
					}
				}
			}
		}
	}
	return filterExpression;
};
oFF.QInARepoFilterExpressionLegacy.prototype.exportComponentWithStructure = oFF.noSupport;
oFF.QInARepoFilterExpressionLegacy.prototype.exportComponent = oFF.noSupport;

oFF.QInARepoFilterFixedLegacy = function() {};
oFF.QInARepoFilterFixedLegacy.prototype = new oFF.QInAComponentWithStructure();
oFF.QInARepoFilterFixedLegacy.prototype._ff_c = "QInARepoFilterFixedLegacy";

oFF.QInARepoFilterFixedLegacy.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.FILTER_FIXED;
};
oFF.QInARepoFilterFixedLegacy.prototype.getTagName = function()
{
	return "FixedFilter";
};
oFF.QInARepoFilterFixedLegacy.prototype.getModelFormat = function()
{
	return oFF.QModelFormat.INA_REPOSITORY;
};
oFF.QInARepoFilterFixedLegacy.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	if (oFF.isNull(inaStructure))
	{
		return null;
	}
	var filter = parentComponent;
	var filterExpression = importer.importFilterExpression(null, inaStructure, filter, context);
	if (oFF.notNull(filter) && oFF.notNull(filterExpression))
	{
		filter.setFixedFilter(filterExpression);
	}
	return filterExpression;
};
oFF.QInARepoFilterFixedLegacy.prototype.exportComponentWithStructure = oFF.noSupport;

oFF.QInARepoFilterGeoLegacy = function() {};
oFF.QInARepoFilterGeoLegacy.prototype = new oFF.QInAComponentWithStructure();
oFF.QInARepoFilterGeoLegacy.prototype._ff_c = "QInARepoFilterGeoLegacy";

oFF.QInARepoFilterGeoLegacy.tryCreateGeometry = function(strValue)
{
	var value = oFF.XGeometryValue.createGeometryValueWithWkt(strValue);
	if (oFF.isNull(value))
	{
		value = oFF.XStringValue.create(strValue);
	}
	return value;
};
oFF.QInARepoFilterGeoLegacy.prototype.getComponentType = function()
{
	return oFF.FilterComponentType.SPATIAL_FILTER;
};
oFF.QInARepoFilterGeoLegacy.prototype.getTagName = function()
{
	return "GeometryOperand";
};
oFF.QInARepoFilterGeoLegacy.prototype.getModelFormat = function()
{
	return oFF.QModelFormat.INA_REPOSITORY;
};
oFF.QInARepoFilterGeoLegacy.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var filterExpression = parentComponent;
	var fieldAccessor = context.getFieldAccessorSingle();
	var inaComparison = inaStructure.getStringByKey("Comparison");
	var inaFieldName = inaStructure.getStringByKey("FieldName");
	var inaValue1 = inaStructure.getStringByKey("Value1");
	if (oFF.XStringUtils.isNotNullAndNotEmpty(inaComparison) && oFF.XStringUtils.isNotNullAndNotEmpty(inaFieldName) && oFF.XStringUtils.isNotNullAndNotEmpty(inaValue1))
	{
		var comparison = oFF.QInAConverter.lookupComparison(inaComparison);
		if (oFF.isNull(comparison))
		{
			return null;
		}
		if (!comparison.isTypeOf(oFF.SpatialComparisonOperator._SPATIAL))
		{
			return null;
		}
		var field = fieldAccessor.getFieldByName(inaFieldName);
		if (oFF.isNull(field))
		{
			return null;
		}
		var geoFilter = oFF.QFactory.createFilterOperationWithOperator(filterExpression, field, comparison);
		var firstValue = oFF.QInARepoFilterGeoLegacy.tryCreateGeometry(inaValue1);
		geoFilter.getLow().setValue(firstValue);
		var inaValue2 = inaStructure.getStringByKey("Value2");
		if (oFF.XStringUtils.isNotNullAndNotEmpty(inaValue2))
		{
			var secondValue = oFF.QInARepoFilterGeoLegacy.tryCreateGeometry(inaValue2);
			geoFilter.getHigh().setValue(secondValue);
		}
		var inaValue3 = inaStructure.getStringByKey("Value3");
		if (oFF.XStringUtils.isNotNullAndNotEmpty(inaValue3))
		{
			var thirdValue = oFF.QInARepoFilterGeoLegacy.tryCreateGeometry(inaValue3);
			geoFilter.getThird().setValue(thirdValue);
		}
		return geoFilter;
	}
	return null;
};
oFF.QInARepoFilterGeoLegacy.prototype.exportComponentWithStructure = oFF.noSupport;

oFF.QInARepoFilterManagerLegacy = function() {};
oFF.QInARepoFilterManagerLegacy.prototype = new oFF.QInAComponentWithStructure();
oFF.QInARepoFilterManagerLegacy.prototype._ff_c = "QInARepoFilterManagerLegacy";

oFF.QInARepoFilterManagerLegacy.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.OLAP_FILTER_MANAGER;
};
oFF.QInARepoFilterManagerLegacy.prototype.getModelFormat = function()
{
	return oFF.QModelFormat.INA_REPOSITORY;
};
oFF.QInARepoFilterManagerLegacy.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var filterManager = modelComponent;
	if (oFF.isNull(filterManager))
	{
		filterManager = context.getOlapEnv().getFilterManager();
	}
	var inaFilterManager = inaStructure.getStructureByKey("OlapFilterManager");
	var inaFilters = inaFilterManager.getStructureByKey("OlapFilters");
	var filterNameIt = inaFilters.getKeysAsIteratorOfString();
	while (filterNameIt.hasNext())
	{
		var filterName = filterNameIt.next();
		var filterExpression = filterManager.getFilterByName(filterName);
		importer.importFilterExpression(filterExpression, inaFilters.getStructureByKey(filterName), filterManager, filterManager.getContext());
	}
	return filterManager;
};
oFF.QInARepoFilterManagerLegacy.prototype.exportComponentWithStructure = oFF.noSupport;

oFF.QInARepoFilterOperationLegacy = function() {};
oFF.QInARepoFilterOperationLegacy.prototype = new oFF.QInAComponentWithStructure();
oFF.QInARepoFilterOperationLegacy.prototype._ff_c = "QInARepoFilterOperationLegacy";

oFF.QInARepoFilterOperationLegacy.importValue = function(importer, variableContainer, field, value, valueType, inaElement, parameterName, parameterIsName, parameterNavigations)
{
	var inaValueIs = inaElement.getStringByKey(parameterIsName);
	if (oFF.XString.isEqual("Variable", inaValueIs))
	{
		value.setFilterValueType(oFF.XValueType.VARIABLE);
		var variableName = inaElement.getStringByKey(parameterName);
		var variable = variableContainer.getVariables().getByKey(variableName);
		if (oFF.notNull(variable))
		{
			value.setVariableValue(variable);
		}
	}
	else
	{
		var filterType = oFF.QInAConverter.lookupValueType(inaElement.getStringByKeyExt("LowIs", null));
		if (filterType === oFF.XValueType.CURRENT_MEMBER || filterType === oFF.XValueType.VARIABLE)
		{
			value.setFilterValueType(filterType);
		}
		if (oFF.notNull(parameterNavigations))
		{
			var lowNavigations = inaElement.getListByKey(parameterNavigations);
			if (oFF.notNull(lowNavigations))
			{
				var memberNavigations = value.getMemberNavigations();
				var lowSize = lowNavigations.size();
				for (var lowNaviIdx = 0; lowNaviIdx < lowSize; lowNaviIdx++)
				{
					memberNavigations.add(oFF.QInARepoFilterOperationLegacy.importMemberNavigation(lowNavigations.getStructureAt(lowNaviIdx)));
				}
			}
		}
		oFF.QInAValueUtils.importValue(importer, value, inaElement, parameterName, valueType, field);
	}
};
oFF.QInARepoFilterOperationLegacy.importMemberNavigation = function(inaNavigation)
{
	var memberNavigation = oFF.QFactory.createMemberNavigation(oFF.CurrentMemberFunction.lookup(inaNavigation.getStringByKey("Function")));
	if (inaNavigation.containsKey("Parameters"))
	{
		var inaParameters = inaNavigation.getListByKey("Parameters");
		var inaParaSize = inaParameters.size();
		for (var idxPara = 0; idxPara < inaParaSize; idxPara++)
		{
			var inaParameter = inaParameters.getStructureAt(idxPara);
			if (inaParameter.containsKey("Navigations"))
			{
				var inaNavigations = inaParameter.getListByKey("Navigations");
				var inaNaviSize = inaNavigations.size();
				for (var idxNavi = 0; idxNavi < inaNaviSize; idxNavi++)
				{
					memberNavigation.addNavigation(oFF.QInARepoFilterOperationLegacy.importMemberNavigation(inaNavigations.getStructureAt(idxNavi)));
				}
			}
			else
			{
				if (inaParameter.containsKey("Level"))
				{
					var inaLevelValue = inaParameter.getByKey("Level");
					if (inaLevelValue.isNumeric())
					{
						memberNavigation.addParameter(oFF.QFactory.createNavigationParameterWithLevelNumber(inaLevelValue.getInteger()));
					}
					else
					{
						memberNavigation.addParameter(oFF.QFactory.createNavigationParameterWithLevelLiteral(inaLevelValue.getString()));
					}
				}
				else if (inaParameter.containsKey("Member"))
				{
					memberNavigation.addParameter(oFF.QFactory.createNavigationParameterWithMemberName(inaParameter.getStringByKey("Member")));
				}
				else if (inaParameter.containsKey("NoValuesAboveLevel"))
				{
					memberNavigation.addParameter(oFF.QFactory.createNavigationParameterWithNoValuesAboveLevel(inaParameter.getStringByKey("NoValuesAboveLevel")));
				}
				else if (inaParameter.containsKey("ErrorAboveLevel"))
				{
					memberNavigation.addParameter(oFF.QFactory.createNavigationParameterWithErrorAboveLevel(inaParameter.getStringByKey("ErrorAboveLevel")));
				}
				else if (inaParameter.containsKey("Shift"))
				{
					var inaShift = inaParameter.getStructureByKey("Shift");
					memberNavigation.addParameter(oFF.QFactory.createNavigationParameterWithShift(inaShift.getStringByKey("Level"), inaShift.getIntegerByKey("Constant")));
				}
				else if (inaParameter.containsKey("Range"))
				{
					var inaRange = inaParameter.getStructureByKey("Range");
					memberNavigation.addParameter(oFF.QFactory.createNavigationParameterWithRange(inaRange.getStringByKey("Level"), inaRange.getIntegerByKey("OffsetLow"), inaRange.getIntegerByKey("OffsetHigh")));
				}
				else
				{
					var inaConstantValue = inaParameter.getByKey("Constant");
					if (inaConstantValue.isNumeric())
					{
						memberNavigation.addParameter(oFF.QFactory.createNavigationParameterWithIntegerConstant(inaConstantValue.getInteger()));
					}
					else
					{
						memberNavigation.addParameter(oFF.QFactory.createNavigationParameterWithStringConstant(inaConstantValue.getString()));
					}
				}
			}
		}
	}
	return memberNavigation;
};
oFF.QInARepoFilterOperationLegacy.prototype.getComponentType = function()
{
	return oFF.FilterComponentType.OPERATION;
};
oFF.QInARepoFilterOperationLegacy.prototype.getModelFormat = function()
{
	return oFF.QModelFormat.INA_REPOSITORY;
};
oFF.QInARepoFilterOperationLegacy.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var inaComparison = inaStructure.getStringByKeyExt("Comparison", "=");
	var comparisonOperator = oFF.QInAConverter.lookupComparison(inaComparison);
	if (oFF.isNull(comparisonOperator))
	{
		importer.addError(oFF.ErrorCodes.INVALID_OPERATOR, oFF.XStringUtils.concatenate2("Unsupported comparison operator: ", inaComparison));
		return null;
	}
	var cartesianList = parentComponent;
	var filterExpression = cartesianList.getFilterExpression();
	var field = cartesianList.getField();
	var filterOperation = oFF.QFactory.createFilterOperationWithOperator(filterExpression, field, comparisonOperator);
	var fieldValueType = field.getValueType();
	var isFuzzyOperator = comparisonOperator.isTypeOf(oFF.ComparisonOperator.LIKE) || comparisonOperator.isTypeOf(oFF.ComparisonOperator.MATCH) || comparisonOperator.isTypeOf(oFF.ComparisonOperator.NOT_MATCH);
	if (isFuzzyOperator)
	{
		fieldValueType = oFF.XValueType.STRING;
	}
	if (inaStructure.getBooleanByKeyExt("IsExcluding", false))
	{
		filterOperation.setSetSign(oFF.SetSign.EXCLUDING);
	}
	else
	{
		filterOperation.setSetSign(oFF.SetSign.INCLUDING);
	}
	filterOperation.resetDepth();
	var depth = inaStructure.getIntegerByKeyExt("Depth", -1);
	if (depth !== -1)
	{
		filterOperation.setDepth(depth);
	}
	filterOperation.resetLevelOffset();
	var levelOffset = inaStructure.getIntegerByKeyExt("LevelOffset", -1);
	if (levelOffset !== -1)
	{
		filterOperation.setLevelOffset(levelOffset);
	}
	var hierarchyStructure = inaStructure.getStructureByKey("Hierarchy");
	if (oFF.notNull(hierarchyStructure))
	{
		var hierarchyName = hierarchyStructure.getStringByKey("Name");
		var hierarchyDueDate = null;
		var hierarchyVersion = null;
		var queryModel = filterOperation.getQueryModel();
		if (importer.getSession().hasFeature(oFF.FeatureToggleOlap.HIERARCHY_INFO_IN_FILTER) && oFF.notNull(queryModel) && queryModel.getSystemType().isTypeOf(oFF.SystemType.ABAP))
		{
			var hierarchyDueDateValue = hierarchyStructure.getStringByKey("DueDate");
			if (oFF.notNull(hierarchyDueDateValue))
			{
				hierarchyDueDate = oFF.XDate.createDateFromSAPFormat(hierarchyDueDateValue);
			}
			hierarchyVersion = hierarchyStructure.getStringByKey("Version");
		}
		filterOperation.setHierarchyInfo(hierarchyName, hierarchyDueDate, hierarchyVersion);
	}
	if (importer.capabilities.supportsConvertToFlatFilter())
	{
		filterOperation.setConvertToFlatFilter(inaStructure.getBooleanByKeyExt("ConvertToFlatSelection", false));
	}
	var supplementFieldNames = cartesianList.getSupplementFieldNames();
	var variableContainer = context.getVariableContainer();
	var numberOfParameters = comparisonOperator.getNumberOfParameters();
	if (numberOfParameters >= 1)
	{
		var low = filterOperation.getLow();
		oFF.QInARepoFilterOperationLegacy.importValue(importer, variableContainer, field, low, fieldValueType, inaStructure, "Low", "LowIs", "LowNavigations");
		oFF.QInAValueUtils.importSupplements(importer, low, inaStructure, "LowSupplements", supplementFieldNames);
	}
	if (numberOfParameters >= 2)
	{
		var high = filterOperation.getHigh();
		oFF.QInARepoFilterOperationLegacy.importValue(importer, variableContainer, field, high, fieldValueType, inaStructure, "High", "HighIs", null);
		oFF.QInAValueUtils.importSupplements(importer, high, inaStructure, "HighSupplements", supplementFieldNames);
	}
	if (numberOfParameters >= 3)
	{
		var third = filterOperation.getThird();
		oFF.QInARepoFilterOperationLegacy.importValue(importer, variableContainer, field, third, fieldValueType, inaStructure, "Value3", "Value3Is", null);
		oFF.QInAValueUtils.importSupplements(importer, third, inaStructure, null, supplementFieldNames);
	}
	return filterOperation;
};
oFF.QInARepoFilterOperationLegacy.prototype.exportComponentWithStructure = oFF.noSupport;

oFF.QInARepoHierarchyLegacy = function() {};
oFF.QInARepoHierarchyLegacy.prototype = new oFF.QInAComponentWithStructure();
oFF.QInARepoHierarchyLegacy.prototype._ff_c = "QInARepoHierarchyLegacy";

oFF.QInARepoHierarchyLegacy.appendItemsToCatalogResult = function(catalogResult, hierarchiesList, dimensionName)
{
	var len = oFF.PrUtils.getListSize(hierarchiesList, 0);
	for (var i = 0; i < len; i++)
	{
		var hierarchyStructure = oFF.PrUtils.getStructureElement(hierarchiesList, i);
		var item = oFF.HierarchyCatalogItem.createCatalogItem();
		item.setDimensionName(dimensionName);
		var hierarchyName;
		if (hierarchyStructure.hasStringByKey("Name"))
		{
			hierarchyName = hierarchyStructure.getStringByKey("Name");
		}
		else
		{
			hierarchyName = hierarchyStructure.getStringByKey("HierarchyName");
		}
		if (oFF.XStringUtils.isNullOrEmpty(hierarchyName) || catalogResult.containsHierarchy(hierarchyName))
		{
			continue;
		}
		item.setHierarchyName(hierarchyName);
		item.setHierarchyUniqueName(hierarchyStructure.getStringByKey("UniqueName"));
		var hierarchyDescription = oFF.PrUtils.getStringProperty(hierarchyStructure, "Description");
		if (oFF.notNull(hierarchyDescription))
		{
			item.setHierarchyLongText(hierarchyDescription.getString());
		}
		var version = oFF.PrUtils.getStringProperty(hierarchyStructure, "Version");
		if (oFF.notNull(version))
		{
			item.setVersionName(version.getString());
		}
		var structure = oFF.PrUtils.getStringProperty(hierarchyStructure, "Structure");
		if (oFF.notNull(structure))
		{
			item.setHierarchyType(oFF.HierarchyType.lookup(structure.getString()));
		}
		var isModeled = oFF.PrUtils.getBooleanValueProperty(hierarchyStructure, "IsModeled", false);
		item.setIsModeled(isModeled);
		var dateTo = oFF.PrUtils.getStringProperty(hierarchyStructure, "DateTo");
		if (oFF.notNull(dateTo))
		{
			var dateToString = dateTo.getString();
			if (oFF.XStringUtils.isNotNullAndNotEmpty(dateToString))
			{
				item.setDateTo(oFF.XDate.createDateFromIsoFormat(dateToString));
			}
		}
		var levels = oFF.PrUtils.getListProperty(hierarchyStructure, "Levels");
		if (oFF.notNull(levels))
		{
			item.setSupportsHierarchyLevels(true);
			var levelList = oFF.XList.create();
			var lenLevel = oFF.PrUtils.getListSize(levels, 0);
			for (var levelIndex = 0; levelIndex < lenLevel; levelIndex++)
			{
				var levelStructure = oFF.PrUtils.getStructureElement(levels, levelIndex);
				if (oFF.isNull(levelStructure))
				{
					continue;
				}
				var catalogLevel = oFF.HierarchyCatalogLevel.createCatalogLevel();
				var level = oFF.PrUtils.getIntegerValueProperty(levelStructure, "Level", -1);
				if (level > -1)
				{
					catalogLevel.setLevel(level);
				}
				var levelName = oFF.PrUtils.getStringProperty(levelStructure, "LevelName");
				if (oFF.notNull(levelName))
				{
					catalogLevel.setLevelName(levelName.getString());
				}
				var levelCaption = oFF.PrUtils.getStringProperty(levelStructure, "LevelCaption");
				if (oFF.notNull(levelCaption))
				{
					catalogLevel.setLevelDescription(levelCaption.getString());
				}
				var levelUniqueName = oFF.PrUtils.getStringProperty(levelStructure, "LevelUniqueName");
				if (oFF.notNull(levelUniqueName))
				{
					catalogLevel.setLevelUniqueName(levelUniqueName.getString());
				}
				var levelDimensionName = oFF.PrUtils.getStringProperty(levelStructure, "DimensionName");
				if (oFF.notNull(levelDimensionName))
				{
					catalogLevel.setLevelDimensionName(levelDimensionName.getString());
				}
				var levelType = oFF.PrUtils.getIntegerProperty(levelStructure, "LevelType");
				if (oFF.notNull(levelType))
				{
					catalogLevel.setLevelType(oFF.QInAConverter.lookupHierarchyLevelType(levelType.getInteger()));
				}
				levelList.add(catalogLevel);
			}
			item.setHierarchyLevels(levelList);
		}
		var restNode = hierarchyStructure.getStringByKey("RestNode");
		if (oFF.notNull(restNode))
		{
			item.setRestNode(restNode);
		}
		var virtualRootNode = hierarchyStructure.getStringByKey("VirtualRootNode");
		if (oFF.notNull(virtualRootNode))
		{
			item.setVirtualRootNode(virtualRootNode);
		}
		catalogResult.addItem(item);
	}
	return catalogResult;
};
oFF.QInARepoHierarchyLegacy.importLeveledHierarchy = function(importer, context, dimension, inaHierarchy)
{
	var hier = oFF.QLeveledHierarchy.create(context, dimension, inaHierarchy.getStringByKey(inaHierarchy.containsKey("Name") ? "Name" : "HierarchyName"));
	hier.setHierarchyUniqueName(inaHierarchy.getStringByKey("UniqueName"));
	if (inaHierarchy.getStringByKey("DimensionName") === null)
	{
		hier.setDimensionName(dimension.getName());
	}
	else
	{
		hier.setDimensionName(inaHierarchy.getStringByKey("DimensionName"));
	}
	hier.setHierarchyType(oFF.HierarchyType.lookup(inaHierarchy.getStringByKey("Structure")));
	hier.setIsModeled(inaHierarchy.getBooleanByKeyExt("IsModeled", false));
	var hierDueDate = inaHierarchy.getStringByKey("DueDate");
	if (oFF.XStringUtils.isNotNullAndNotEmpty(hierDueDate))
	{
		hier.setDateTo(oFF.QInARepoUtils.createDate(hierDueDate));
	}
	hier.setHierarchyDescription(inaHierarchy.getStringByKey("Description"));
	var inaLevels = inaHierarchy.getListByKey("Levels");
	if (!oFF.PrUtils.isListEmpty(inaLevels))
	{
		oFF.QInARepoHierarchyLegacy.importLevels(hier, inaLevels);
	}
	return hier;
};
oFF.QInARepoHierarchyLegacy.importLevels = function(hier, inaLevels)
{
	var size = inaLevels.size();
	for (var levelIdx = 0; levelIdx < size; levelIdx++)
	{
		var inaLevel = inaLevels.getStructureAt(levelIdx);
		var level = oFF.QHierarchyLevel.create(hier, inaLevel.getStringByKey("LevelUniqueName"), inaLevel.getIntegerByKey("Level"));
		level.setLevelName(inaLevel.getStringByKey("LevelName"));
		level.setLevelText(inaLevel.getStringByKey("LevelCaption"));
		level.setLevelDimensionName(inaLevel.getStringByKey("DimensionName"));
		level.setLevelType(oFF.QInAConverter.lookupHierarchyLevelType(inaLevel.getIntegerByKey("LevelType")));
		level.setNavigationAttribute(inaLevel.getStringByKey("NavAttr"));
		hier.getAllLevelBase().add(level);
	}
};
oFF.QInARepoHierarchyLegacy.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.HIERARCHY;
};
oFF.QInARepoHierarchyLegacy.prototype.getTagName = function()
{
	return "Hierarchy";
};
oFF.QInARepoHierarchyLegacy.prototype.getModelFormat = function()
{
	return oFF.QModelFormat.INA_REPOSITORY;
};
oFF.QInARepoHierarchyLegacy.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var dimension = modelComponent;
	if (dimension.supportsHierarchy())
	{
		var fixInFilter = dimension.isDisplayHierarchyFixInFilter();
		dimension.getHierarchyManagerBase().setDisplayHierarchyFixInFilter(false);
		if (oFF.isNull(inaStructure))
		{
			dimension.setHierarchy(null);
		}
		else
		{
			var hierarchyName;
			if (inaStructure.hasStringByKey("Name"))
			{
				hierarchyName = inaStructure.getStringByKey("Name");
			}
			else
			{
				hierarchyName = inaStructure.getStringByKey("HierarchyName");
			}
			var hierarchy = null;
			if (oFF.XStringUtils.isNotNullAndNotEmpty(hierarchyName))
			{
				if (dimension.getModelCapabilities().supportsDimensionHierarchyLevels())
				{
					this.importHierarchyAsCatalogItem(inaStructure, dimension);
					this.importLeveledHierarchyToMetadata(importer, inaStructure, context, dimension);
				}
				if (inaStructure.getBooleanByKey("IsTransient"))
				{
					hierarchy = oFF.QHierarchy.createCustomHierarchy(dimension.getContext(), dimension, hierarchyName, inaStructure.getStringByKey("Description"));
				}
				else
				{
					hierarchy = oFF.QHierarchy.create(dimension.getContext(), dimension, hierarchyName);
				}
				hierarchy.setHierarchyVersion(inaStructure.getStringByKey("Version"));
				var dueDate = inaStructure.getStringByKey("DueDate");
				var dueDateIs = inaStructure.getStringByKey("DueDateIs");
				var isDueDateVariable = oFF.notNull(dueDateIs) && oFF.XString.isEqual("Variable", dueDateIs);
				dimension.setUseHierarchyDueDateVariable(isDueDateVariable);
				if (isDueDateVariable)
				{
					if (oFF.XStringUtils.isNullOrEmpty(dueDate))
					{
						dimension.setHierarchyDueDateVariableName(null);
					}
					else
					{
						dimension.setHierarchyDueDateVariableName(dueDate);
					}
				}
				else
				{
					hierarchy.setHierarchyDueDate(oFF.QInARepoUtils.createDate(dueDate));
				}
				var dateTo = inaStructure.getStringByKey("DateTo");
				hierarchy.setDateTo(oFF.QInARepoUtils.createDate(dateTo));
				var dateFrom = inaStructure.getStringByKey("0DATEFROM");
				hierarchy.setDateFrom(oFF.QInARepoUtils.createDate(dateFrom));
				var inaMetadata = inaStructure.getStructureByKey("Metadata");
				if (oFF.notNull(inaMetadata))
				{
					dateTo = inaMetadata.getStringByKey("DateTo");
					if (oFF.XStringUtils.isNotNullAndNotEmpty(dateTo))
					{
						hierarchy.setDateTo(oFF.QInARepoUtils.createDate(dateTo));
					}
					dateFrom = inaMetadata.getStringByKey("0DATEFROM");
					if (oFF.XStringUtils.isNotNullAndNotEmpty(dateFrom))
					{
						hierarchy.setDateFrom(oFF.QInARepoUtils.createDate(dateFrom));
					}
				}
				dimension.setHierarchy(hierarchy);
				var isActive = inaStructure.getBooleanByKeyExt("HierarchyActive", true);
				dimension.setHierarchyActive(isActive);
				dimension.setSelectorHierarchyActive(isActive);
			}
			var stickyDimensionMembers = inaStructure.getListByKey("StickyDimensionMembers");
			dimension.clearStickyMembers();
			if (oFF.XCollectionUtils.hasElements(stickyDimensionMembers))
			{
				for (var sdi = 0; sdi < stickyDimensionMembers.size(); sdi++)
				{
					dimension.addStickyMember(stickyDimensionMembers.getStringAt(sdi));
				}
			}
			var initialDrillOffset = inaStructure.getIntegerByKeyExt("InitialDrillOffset", 0);
			var initialDrillLevel = inaStructure.getIntegerByKeyExt("InitialDrillLevel", 0);
			var modelCapabilities = dimension.getModelCapabilities();
			if (modelCapabilities.supportsVisibilityFilter() || !importer.mode.isTypeOf(oFF.QModelFormat.INA_DATA))
			{
				dimension.setInitialDrillLevel(initialDrillLevel);
				dimension.setSelectorInitialDrillLevel(initialDrillLevel);
			}
			else
			{
				if (initialDrillLevel === -1)
				{
					dimension.setInitialDrillLevel(initialDrillLevel);
					dimension.setSelectorInitialDrillLevel(initialDrillLevel);
				}
				else if (initialDrillOffset === -1)
				{
					dimension.setInitialDrillLevel(0);
					dimension.setSelectorInitialDrillLevel(0);
				}
				else
				{
					dimension.setInitialDrillLevel(initialDrillLevel + initialDrillOffset);
					dimension.setSelectorInitialDrillLevel(initialDrillLevel + initialDrillOffset);
				}
			}
			dimension.setInitialDrillOffset(initialDrillOffset);
			dimension.setExplicitDrillOnFilteredNodes(inaStructure.getBooleanByKeyExt("ExplicitDrillOnFilteredNodes", false));
			var alignment = oFF.Alignment.DEFAULT_VALUE;
			if (context.getModelCapabilities().supportsExpandBottomUp())
			{
				var nodeAlignment = inaStructure.getStringByKeyExt("LowerLevelNodeAlignment", "Default");
				alignment = oFF.QInAConverter.lookupLowerLevelNodeAlignment(nodeAlignment);
				if (inaStructure.containsKey("ExpandBottomUp"))
				{
					var isExpandingBottomUp = inaStructure.getBooleanByKeyExt("ExpandBottomUp", false);
					if (isExpandingBottomUp)
					{
						alignment = oFF.Alignment.CHILDREN_ABOVE_PARENT;
					}
				}
			}
			dimension.setLowerLevelNodeAlignment(alignment);
			var nodeCondensation = inaStructure.getBooleanByKeyExt("NodeCondensation", false);
			dimension.setHasNodeCondensation(nodeCondensation);
			var memberOfPostedNodeVisibility = inaStructure.getStringByKeyExt("MemberOfPostedNodeVisibility", "Visible");
			var visibility = oFF.QInAConverter.lookupResultSetVisibility(memberOfPostedNodeVisibility);
			dimension.setMemberOfPostedNodeVisibility(visibility);
			dimension.getHierarchyManagerBase().setDisplayHierarchyFixInFilter(fixInFilter);
			return hierarchy;
		}
		dimension.getHierarchyManagerBase().setDisplayHierarchyFixInFilter(fixInFilter);
	}
	return null;
};
oFF.QInARepoHierarchyLegacy.prototype.importHierarchyAsCatalogItem = function(inaStructure, dimension)
{
	var hierarchyAsList = oFF.PrFactory.createList();
	hierarchyAsList.add(inaStructure);
	var hierarchyCatalogResult = dimension.getHierarchies();
	if (oFF.isNull(hierarchyCatalogResult))
	{
		hierarchyCatalogResult = oFF.QFactory.createHierarchyCatalogResult();
		oFF.QInARepoHierarchyLegacy.appendItemsToCatalogResult(hierarchyCatalogResult, hierarchyAsList, dimension.getName());
		dimension.getHierarchyManagerBase().setHierarchies(hierarchyCatalogResult);
	}
	else
	{
		oFF.QInARepoHierarchyLegacy.appendItemsToCatalogResult(hierarchyCatalogResult, hierarchyAsList, dimension.getName());
	}
};
oFF.QInARepoHierarchyLegacy.prototype.importLeveledHierarchyToMetadata = function(importer, inaStructure, context, dimension)
{
	var queryManager = dimension.getQueryModelBase().getQueryManagerBase();
	if (oFF.notNull(queryManager) && !oFF.PrUtils.isListEmpty(inaStructure.getListByKey("Levels")))
	{
		var metadataModel = queryManager.getMetadataModelBase();
		var metaHierarchies = metadataModel.getLeveledHierarchiesBase();
		var leveledHierarchy = oFF.QInARepoHierarchyLegacy.importLeveledHierarchy(importer, context, dimension, inaStructure);
		if (!metaHierarchies.contains(leveledHierarchy))
		{
			metaHierarchies.add(leveledHierarchy);
		}
	}
};
oFF.QInARepoHierarchyLegacy.prototype.exportComponentWithStructure = oFF.noSupport;

oFF.QInARepoMemberRestrictedLegacy = function() {};
oFF.QInARepoMemberRestrictedLegacy.prototype = new oFF.QInAComponentWithStructure();
oFF.QInARepoMemberRestrictedLegacy.prototype._ff_c = "QInARepoMemberRestrictedLegacy";

oFF.QInARepoMemberRestrictedLegacy.getFirstMemberForSignFlip = function(accountName, complexSelectionRoot)
{
	var iterator = complexSelectionRoot.getChildren();
	while (iterator.hasNext())
	{
		var filterElement = iterator.next();
		if (filterElement.getOlapComponentType() === oFF.FilterComponentType.OPERATION)
		{
			var filterOperation = filterElement;
			var dimensionName = filterOperation.getDimensionName();
			if (oFF.XString.isEqual(accountName, dimensionName))
			{
				return filterOperation.getLow().getValue().toString();
			}
		}
		var memberName = oFF.QInARepoMemberRestrictedLegacy.getFirstMemberForSignFlip(accountName, filterElement);
		if (oFF.notNull(memberName))
		{
			return memberName;
		}
	}
	return null;
};
oFF.QInARepoMemberRestrictedLegacy.getMemberForSignFlip = function(context, restrictedMeasure)
{
	if (restrictedMeasure.getAccountType() !== null)
	{
		return restrictedMeasure.getName();
	}
	var dim = restrictedMeasure.getDimensionContext(context.getQueryManager());
	var filter = restrictedMeasure.getFilter();
	var memberName = dim.getName();
	if (oFF.notNull(memberName))
	{
		if (filter.isAll())
		{
			memberName = oFF.QInARepoMemberRestrictedLegacy.getFirstMemberForSignFlip(memberName, filter.getFilterRootElement());
		}
		var member = dim.getStructureMemberByAliasOrMember(memberName);
		if (oFF.notNull(member) && member.getComponentType() === oFF.MemberType.RESTRICTED_MEASURE && member !== restrictedMeasure)
		{
			return oFF.QInARepoMemberRestrictedLegacy.getMemberForSignFlip(context, member);
		}
	}
	return memberName;
};
oFF.QInARepoMemberRestrictedLegacy.prototype.getComponentType = function()
{
	return oFF.MemberType.RESTRICTED_MEASURE;
};
oFF.QInARepoMemberRestrictedLegacy.prototype.getModelFormat = function()
{
	return oFF.QModelFormat.INA_REPOSITORY;
};
oFF.QInARepoMemberRestrictedLegacy.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var member;
	if (oFF.isNull(modelComponent))
	{
		var dimension = parentComponent;
		var newMemberName = this.getNameForImport(inaStructure, dimension);
		var newMemberText = this.getText(inaStructure, dimension);
		if (dimension.getModelCapabilities().supportsCustomMeasuresInMetadata() && dimension.getLoadedStructureMember(newMemberName) !== null)
		{
			member = dimension.getLoadedStructureMember(newMemberName);
		}
		else
		{
			member = dimension.addNewRestrictedMeasure(newMemberName, newMemberText);
		}
	}
	else
	{
		member = modelComponent;
	}
	var inaAggregationDimension = inaStructure.getStringByKey("AggregationDimension");
	if (oFF.XStringUtils.isNotNullAndNotEmpty(inaAggregationDimension))
	{
		member.setAggregationDimensionName(inaAggregationDimension);
	}
	var restrictedMeasureStructure = inaStructure;
	if (member.getModelCapabilities().supportsCustomMeasuresInMetadata() && importer.getMode() === oFF.QModelFormat.INA_DATA)
	{
		restrictedMeasureStructure = inaStructure.getStructureByKey("[Measures].[MemberDetails]");
	}
	if (member.getMemberType() === oFF.MemberType.RESTRICTED_MEASURE)
	{
		importer.importFilterExpression(member.getFilter(), restrictedMeasureStructure, member, context);
	}
	importer.importExceptions(restrictedMeasureStructure, member);
	return member;
};
oFF.QInARepoMemberRestrictedLegacy.prototype.getNameForImport = function(inaStructure, dimension)
{
	var memberName = inaStructure.getStringByKey("Name");
	if (oFF.isNull(memberName) && oFF.notNull(dimension))
	{
		var keyField = dimension.getKeyField();
		var keyName = keyField.getName();
		return inaStructure.getStringByKey(keyName);
	}
	return memberName;
};
oFF.QInARepoMemberRestrictedLegacy.prototype.getText = function(inaStructure, dimension)
{
	var memberText = inaStructure.getStringByKey("Description");
	if (oFF.isNull(memberText) && oFF.notNull(dimension))
	{
		var textField = dimension.getTextField();
		if (oFF.notNull(textField))
		{
			var keyName = textField.getName();
			return inaStructure.getStringByKey(keyName);
		}
	}
	return memberText;
};
oFF.QInARepoMemberRestrictedLegacy.prototype.exportComponentWithStructure = oFF.noSupport;

oFF.QInARepoMembersAllLegacy = function() {};
oFF.QInARepoMembersAllLegacy.prototype = new oFF.QInAComponentWithStructure();
oFF.QInARepoMembersAllLegacy.prototype._ff_c = "QInARepoMembersAllLegacy";

oFF.QInARepoMembersAllLegacy.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.MEMBERS;
};
oFF.QInARepoMembersAllLegacy.prototype.getModelFormat = function()
{
	return oFF.QModelFormat.INA_REPOSITORY;
};
oFF.QInARepoMembersAllLegacy.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var dimension = modelComponent;
	if (dimension.supportsCustomMembers())
	{
		dimension.removeCustomMembers();
	}
	var inaMemberList = inaStructure.getListByKey("MembersRepo");
	if (oFF.isNull(inaMemberList))
	{
		inaMemberList = inaStructure.getListByKey("Members");
		if (oFF.isNull(inaMemberList))
		{
			return null;
		}
	}
	var structureLayout = dimension.getStructureLayout();
	if (oFF.notNull(structureLayout))
	{
		structureLayout.clear();
		var inaMemberListSize = inaMemberList.size();
		for (var iMember = 0; iMember < inaMemberListSize; iMember++)
		{
			var inaMember = inaMemberList.getStructureAt(iMember);
			var member = importer.importStructureMember(dimension, inaMember, context);
			if (oFF.notNull(member))
			{
				var member2 = dimension.getLoadedStructureMember(member.getName());
				if (oFF.isNull(member2))
				{
					dimension.addMeasure(member);
				}
				else
				{
					if (member2 !== member)
					{
						throw oFF.XException.createIllegalStateException("Internal error: New member with same name not allowed");
					}
					structureLayout.removeElement(member2);
					structureLayout.add(member2);
				}
			}
		}
	}
	return dimension;
};
oFF.QInARepoMembersAllLegacy.prototype.exportComponentWithStructure = oFF.noSupport;

oFF.QInARepoQueryLegacy = function() {};
oFF.QInARepoQueryLegacy.prototype = new oFF.QInAComponentWithStructure();
oFF.QInARepoQueryLegacy.prototype._ff_c = "QInARepoQueryLegacy";

oFF.QInARepoQueryLegacy.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.QUERY_MODEL;
};
oFF.QInARepoQueryLegacy.prototype.getModelFormat = function()
{
	return oFF.QModelFormat.INA_REPOSITORY;
};
oFF.QInARepoQueryLegacy.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var queryModel = modelComponent;
	var inaDefinition = inaStructure;
	var inaQueries = inaDefinition.getListByKey("Queries");
	if (oFF.notNull(inaQueries))
	{
		inaDefinition = inaQueries.getStructureAt(inaQueries.size() - 1);
	}
	var inaBatch = inaDefinition.getListByKey(oFF.ConnectionConstants.INA_BATCH);
	if (oFF.notNull(inaBatch))
	{
		inaDefinition = inaBatch.getStructureAt(inaBatch.size() - 1);
	}
	if (oFF.notNull(inaDefinition) && inaDefinition.containsKey("Analytics"))
	{
		inaDefinition = inaDefinition.getStructureByKey("Analytics");
		if (oFF.notNull(inaDefinition) && inaDefinition.containsKey("Definition"))
		{
			inaDefinition = inaDefinition.getStructureByKey("Definition");
		}
	}
	if (oFF.notNull(inaDefinition) && inaDefinition.containsKey("Definition"))
	{
		inaDefinition = inaDefinition.getStructureByKey("Definition");
	}
	if (oFF.notNull(inaDefinition))
	{
		var isForRendering = importer.getOriginalMode() === oFF.QModelFormat.INA_CLONE_RENDERING && importer.mode.isTypeOf(oFF.QModelFormat.INA_REPOSITORY);
		var isInaRepMode = importer.mode.isTypeOf(oFF.QModelFormat.INA_REPOSITORY);
		if (isInaRepMode && inaDefinition.containsKey("ModellerDefinition"))
		{
			inaDefinition = inaDefinition.getStructureByKey("ModellerDefinition");
			var eventingStoppedBeforeModelingCall = queryModel.isEventingStopped();
			if (eventingStoppedBeforeModelingCall)
			{
				queryModel.setDeltaPhase(oFF.QDeltaOperationPhase.NOTE_MODELER_CHANGES);
			}
			importer.importModellerDimensions(inaDefinition, queryModel, queryModel);
			importer.importModellerDefinedVariables(inaDefinition, queryModel.getVariableManagerBase(), queryModel);
			importer.importModellerCurrencyTranslation(inaDefinition, queryModel.getCurrencyTranslationManagerBase(), queryModel);
			importer.importModellerMetadataProperties(inaDefinition, queryModel, queryModel);
			importer.importFormulaExceptionManager(inaDefinition, queryModel.getFormulaExceptionManagerBase(), queryModel);
			if (eventingStoppedBeforeModelingCall)
			{
				queryModel.finishModelerEventing();
			}
			return queryModel;
		}
		importer.importDimensions(inaDefinition, queryModel, queryModel);
		if (!isForRendering)
		{
			importer.importFilter(inaDefinition, queryModel.getFilterBase(), queryModel);
			importer.importExceptions(inaDefinition, queryModel);
			importer.importQueryCells(inaDefinition, queryModel.getQueryCellManager(), queryModel);
			importer.importUniversalDisplayHierarchies(inaDefinition, queryModel.getUniversalDisplayHierarchiesBase(), queryModel);
		}
		importer.importCurrencyTranslationManager(inaDefinition, queryModel.getCurrencyTranslationManager(), queryModel);
		importer.importSortingManager(inaDefinition, queryModel.getSortingManagerBase(), queryModel);
		importer.importDrillManager(inaDefinition, queryModel.getDrillManager(), queryModel);
		importer.importVariableManager(inaDefinition, queryModel.getVariableManagerBase(), queryModel);
		importer.importQuerySettings(inaDefinition, queryModel);
		importer.importDataCells(inaDefinition, queryModel);
		importer.importConditionManager(inaDefinition, queryModel.getConditionManagerBase(), queryModel);
		if (isInaRepMode)
		{
			importer.importFormulaExceptionManager(inaDefinition, queryModel.getFormulaExceptionManagerBase(), queryModel);
			this.importPaging(importer, inaDefinition, queryModel);
			oFF.QInARepoOptions.importSuppressKeyfigureCalculation(inaDefinition, queryModel.getQueryManager());
			var resultStructureController = queryModel.getResultStructureController();
			importer.importComponent(null, inaDefinition, resultStructureController, queryModel, queryModel);
			var queryManager = queryModel.getQueryManager();
			if (oFF.notNull(queryManager))
			{
				queryManager.setResultSetPersistanceTargetTable(inaStructure.getStringByKey("ResultSetPersistanceTable"));
				queryManager.setResultSetPersistanceTargetSchema(inaStructure.getStringByKey("ResultSetPersistanceSchema"));
				queryManager.setResultSetPersistenceIdentifier(inaStructure.getStringByKey("ResultSetPersistanceIdentifier"));
			}
			var inaPreQueries = inaDefinition.getListByKey("PreQueries");
			if (oFF.notNull(inaPreQueries))
			{
				var mainQuerySystemname = null;
				var inaDataSource = inaDefinition.getStructureByKey("DataSource");
				if (oFF.notNull(inaDataSource))
				{
					mainQuerySystemname = inaDataSource.getStringByKey("System");
				}
				this.importPreQueries(importer, queryModel, inaPreQueries, mainQuerySystemname);
			}
			if (importer.mode.isTypeOf(oFF.QModelFormat.INA_REPOSITORY_DATA) && queryModel.isBlendingModel())
			{
				this.importBlendingSources(importer, inaStructure, queryModel);
			}
		}
	}
	return queryModel;
};
oFF.QInARepoQueryLegacy.prototype.importBlendingSources = function(importer, inaStructure, queryModel)
{
	var sources = queryModel.getBlendingSources();
	if (!oFF.XCollectionUtils.hasElements(sources))
	{
		return;
	}
	var inaDataSource = oFF.PrUtils.getStructureProperty(inaStructure, "DataSource");
	var inaSources = oFF.PrUtils.getListProperty(inaDataSource, "Sources");
	if (oFF.PrUtils.isListEmpty(inaSources))
	{
		return;
	}
	for (var i = 0; i < sources.size(); i++)
	{
		var inaSource = oFF.PrUtils.getStructureElement(inaSources, i);
		var inaDefinitionContext = oFF.PrUtils.getStructureProperty(inaSource, "DefiningContext");
		if (oFF.notNull(inaDefinitionContext))
		{
			var sourceQueryModel = sources.get(i).getQueryModel();
			sourceQueryModel.deserializeFromElementExt(importer.mode, inaDefinitionContext);
		}
	}
};
oFF.QInARepoQueryLegacy.prototype.importPaging = function(importer, inaDefinition, queryModel)
{
	var inaSubset = inaDefinition.getStructureByKey("SubSetDescription");
	var queryManager = queryModel.getQueryManager();
	var isForRendering = importer.mode === oFF.QModelFormat.INA_REPOSITORY_DATA_RENDERING;
	if (oFF.isNull(inaSubset) || !queryModel.getSession().hasFeature(oFF.FeatureToggleOlap.PERSIST_PAGING_IN_REPO) || queryManager.applyingStateOnQueryManager() && !isForRendering)
	{
		return;
	}
	oFF.QInARepoOptions.importPaging(inaDefinition, queryManager);
};
oFF.QInARepoQueryLegacy.prototype.getInactiveCapabilities = function(queryModel)
{
	var capabilities = oFF.XHashMapByString.create();
	var allCapabilities = oFF.FeatureToggleOlap.getAllFeatureToggles();
	var allIterator = allCapabilities.getKeysAsIteratorOfString();
	while (allIterator.hasNext())
	{
		capabilities.put(allIterator.next(), oFF.XBooleanValue.create(false));
	}
	var experimentalFeatureSet = queryModel.getSession().getFeatureToggles();
	if (oFF.notNull(experimentalFeatureSet))
	{
		var activatedIterator = experimentalFeatureSet.getKeysAsIteratorOfString();
		while (activatedIterator.hasNext())
		{
			capabilities.put(activatedIterator.next(), oFF.XBooleanValue.create(true));
		}
	}
	return capabilities;
};
oFF.QInARepoQueryLegacy.prototype.importPreQueries = function(importer, queryModel, inaPreQueries, mainQuerySystemname)
{
	var modeHolder = importer.getMode();
	if (importer.getOriginalMode() !== oFF.QModelFormat.INA_CLONE_RENDERING)
	{
		importer.mode = importer.getOriginalMode();
	}
	var dsBuffer = oFF.XStringBuffer.create();
	var capabilitiesToActivate = this.getInactiveCapabilities(queryModel);
	var preQueriesSize = inaPreQueries.size();
	for (var i = 0; i < preQueriesSize; i++)
	{
		var inaPreQuery = inaPreQueries.getStructureAt(i);
		var inaRuntime = inaPreQuery.getStructureByKey("Runtime");
		if (oFF.isNull(inaRuntime))
		{
			inaRuntime = inaPreQuery;
		}
		var inaDataSource = inaRuntime.getStructureByKey("DataSource");
		dsBuffer.clear();
		dsBuffer.append(inaDataSource.getStringByKey("Type")).append(":[");
		dsBuffer.append(inaDataSource.getStringByKey("SchemaName"));
		dsBuffer.append("][");
		dsBuffer.append(inaDataSource.getStringByKey("PackageName"));
		dsBuffer.append("][");
		dsBuffer.append(inaDataSource.getStringByKey("ObjectName")).append("]");
		var commandFactory = oFF.XCommandFactory.create(queryModel.getApplication());
		var xCmdDeserialize = commandFactory.createCommand(oFF.CmdCreateQueryManager.CMD_NAME);
		xCmdDeserialize.addParameter(oFF.CmdCreateQueryManager.PARAM_I_APPLICATION, queryModel.getApplication());
		xCmdDeserialize.addParameter(oFF.CmdCreateQueryManager.PARAM_I_ENFORCE_INACTIVE_CAPABILITIES, capabilitiesToActivate);
		var preQuerySystemName = inaDataSource.getStringByKey("System");
		if (importer.mode === oFF.QModelFormat.INA_REPOSITORY && oFF.XString.isEqual(preQuerySystemName, mainQuerySystemname))
		{
			preQuerySystemName = queryModel.getDataSource().getSystemName();
		}
		xCmdDeserialize.addParameterString(oFF.CmdCreateQueryManager.PARAM_I_SYSTEM, preQuerySystemName);
		xCmdDeserialize.addParameterString(oFF.CmdCreateQueryManager.PARAM_I_DATA_SOURCE, dsBuffer.toString());
		var processCommand = xCmdDeserialize.processCommand(oFF.SyncType.BLOCKING, null, null);
		importer.addAllMessages(processCommand);
		oFF.XObjectExt.release(xCmdDeserialize);
		if (processCommand.isValid())
		{
			var preQuery = processCommand.getData().getResultParameter(oFF.CmdCreateQueryManager.PARAM_E_QUERY_MANAGER).getQueryModel();
			importer.importPreQuery(inaPreQuery, preQuery);
			var inaPreQueryName = inaPreQuery.getStringByKey("ObjectName");
			var preQueryExisting = queryModel.getPreQueryByName(inaPreQueryName);
			if (oFF.isNull(preQueryExisting))
			{
				queryModel.addPreQueryWithName(preQuery, inaPreQueryName);
			}
		}
	}
	importer.mode = modeHolder;
};
oFF.QInARepoQueryLegacy.prototype.exportComponentWithStructure = oFF.noSupport;

oFF.QInARepoQuerySettingsLegacy = function() {};
oFF.QInARepoQuerySettingsLegacy.prototype = new oFF.QInAComponentWithStructure();
oFF.QInARepoQuerySettingsLegacy.prototype._ff_c = "QInARepoQuerySettingsLegacy";

oFF.QInARepoQuerySettingsLegacy.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.QUERY_SETTINGS;
};
oFF.QInARepoQuerySettingsLegacy.prototype.getModelFormat = function()
{
	return oFF.QModelFormat.INA_REPOSITORY;
};
oFF.QInARepoQuerySettingsLegacy.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var definitionNameString = oFF.PrUtils.getStringProperty(inaStructure, "Name");
	var queryModel = context.getQueryModel();
	if (oFF.notNull(definitionNameString))
	{
		queryModel.setDefinitionName(definitionNameString.getString());
	}
	var inaQuery = inaStructure.getStructureByKey("Query");
	importer.importAxesSettings(inaQuery, queryModel);
	if (importer.mode.isTypeOf(oFF.QModelFormat.INA_REPOSITORY))
	{
		var inaCurrencyTranslation = inaStructure.getStructureByKey("CurrencyTranslation");
		if (oFF.notNull(inaCurrencyTranslation))
		{
			var currencyTranslationDetails = queryModel.getCurrencyTranslationManager().getCurrencyTranslationDetails();
			currencyTranslationDetails.setCurrencyTranslationName(inaCurrencyTranslation.getStringByKey("Name"));
			currencyTranslationDetails.setCurrencyTranslationOperation(oFF.CurrencyTranslationOperation.lookup(inaCurrencyTranslation.getStringByKey("Operation")));
			currencyTranslationDetails.setCurrencyTranslationTarget(inaCurrencyTranslation.getStringByKey("Target"));
		}
		var axesLayoutList = oFF.PrUtils.getListProperty(inaQuery, "AxesLayout");
		var len = oFF.PrUtils.getListSize(axesLayoutList, 0);
		for (var axesLayoutIndex = 0; axesLayoutIndex < len; axesLayoutIndex++)
		{
			var axisLayoutStructure = oFF.PrUtils.getStructureElement(axesLayoutList, axesLayoutIndex);
			var axisType = oFF.AxisType.lookup(oFF.PrUtils.getStringValueProperty(axisLayoutStructure, "Axis", null));
			var axis = queryModel.getAxis(axisType);
			if (oFF.isNull(axis))
			{
				continue;
			}
			var orderedDimensionNamesList = oFF.PrUtils.getListProperty(axisLayoutStructure, "OrderedDimensionNames");
			if (oFF.isNull(orderedDimensionNamesList))
			{
				continue;
			}
			var orderedDimensionNames = oFF.XListOfString.create();
			for (var dimensionNameIndex = 0; dimensionNameIndex < oFF.PrUtils.getListSize(orderedDimensionNamesList, 0); dimensionNameIndex++)
			{
				var dimensionNameString = oFF.PrUtils.getStringElement(orderedDimensionNamesList, dimensionNameIndex);
				if (oFF.isNull(dimensionNameString))
				{
					continue;
				}
				orderedDimensionNames.add(dimensionNameString.getString());
			}
			axis.reOrderDimensions(orderedDimensionNames);
		}
	}
	return queryModel;
};
oFF.QInARepoQuerySettingsLegacy.prototype.exportComponentWithStructure = oFF.noSupport;

oFF.QInARepoSortLegacy = function() {};
oFF.QInARepoSortLegacy.prototype = new oFF.QInAComponentWithList();
oFF.QInARepoSortLegacy.prototype._ff_c = "QInARepoSortLegacy";

oFF.QInARepoSortLegacy.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.SORT_MANAGER;
};
oFF.QInARepoSortLegacy.prototype.getTagName = function()
{
	return "Sort";
};
oFF.QInARepoSortLegacy.prototype.getModelFormat = function()
{
	return oFF.QModelFormat.INA_REPOSITORY;
};
oFF.QInARepoSortLegacy.prototype.importComponentWithList = function(importer, inaList, modelComponent, parentComponent, context)
{
	var sortingManager = modelComponent;
	if (importer.mode !== oFF.QModelFormat.INA_DATA_REINIT && importer.capabilities.supportsExtendedSort())
	{
		sortingManager.getSortingOperations().clear();
		if (oFF.notNull(inaList))
		{
			var queryModel = sortingManager.getQueryModel();
			for (var sortIdx = 0; sortIdx < inaList.size(); sortIdx++)
			{
				var inaSort = inaList.getStructureAt(sortIdx);
				var inaSortType = inaSort.getStringByKey("SortType");
				var sortType = oFF.QInAConverter.lookupSortType(inaSortType);
				var sortingOp;
				if (sortType === oFF.SortType.FIELD)
				{
					sortingOp = this.importFieldSorting(sortingManager, queryModel, inaSort);
				}
				else if (sortType === oFF.SortType.MEASURE)
				{
					sortingOp = this.importMeasureSorting(sortingManager, queryModel, inaSort);
				}
				else if (sortType === oFF.SortType.DATA_CELL_VALUE || sortType === oFF.SortType.COMPLEX)
				{
					sortingOp = this.importPathSorting(context, sortingManager, queryModel, inaSort, sortType);
				}
				else
				{
					sortingOp = this.importDimensionSorting(sortingManager, queryModel, inaSort, sortType);
				}
				if (oFF.notNull(sortingOp))
				{
					this.importGenericSorting(queryModel, inaSort, sortingOp);
				}
			}
		}
	}
	return sortingManager;
};
oFF.QInARepoSortLegacy.prototype.importGenericSorting = function(queryModel, inaSort, sortingOp)
{
	var inaDirection = inaSort.getStringByKey("Direction");
	if (oFF.notNull(inaDirection))
	{
		var sortDirection = oFF.QInAConverter.lookupSortDirection2(inaDirection);
		if (oFF.notNull(sortDirection))
		{
			sortingOp.setDirection(sortDirection);
		}
	}
	if (sortingOp.supportsPreserveGrouping() && sortingOp.supportsBreakGrouping())
	{
		sortingOp.setPreserveGrouping(inaSort.getBooleanByKeyExt("PreserveGrouping", false));
	}
	if (queryModel.getModelCapabilities().supportsLocaleSorting())
	{
		var inaCollator = inaSort.getStructureByKey("Collator");
		if (oFF.notNull(inaCollator))
		{
			sortingOp.setIsCaseSensitive(inaCollator.getBooleanByKeyExt("CaseSensitive", false));
			sortingOp.setLocale(inaCollator.getStringByKeyExt("Locale", null));
		}
	}
};
oFF.QInARepoSortLegacy.prototype.importPathSorting = function(context, sortingManager, queryModel, inaSort, sortType)
{
	var inaPath = inaSort.getListByKey("SortTuple");
	if (inaPath.isEmpty())
	{
		return null;
	}
	var path = oFF.XList.create();
	for (var idxStruct = 0; idxStruct < inaPath.size(); idxStruct++)
	{
		var pathElement = inaPath.getStructureAt(idxStruct);
		var inaFieldName = pathElement.getStringByKey("FieldName");
		var inaValue = pathElement.getStringByKey("Value");
		if (oFF.notNull(inaFieldName) && oFF.notNull(inaValue))
		{
			var field = queryModel.getFieldByName(inaFieldName);
			if (oFF.isNull(field))
			{
				return null;
			}
			var inaHierarchyName = pathElement.getStringByKey("Hierarchy");
			path.add(oFF.QSelectValue._createDimensionElement2(context, field, inaHierarchyName, inaValue));
		}
		else
		{
			return null;
		}
	}
	if (sortType === oFF.SortType.DATA_CELL_VALUE)
	{
		return sortingManager.getDataCellSorting(path, true);
	}
	return sortingManager.getComplexSorting(path, true);
};
oFF.QInARepoSortLegacy.prototype.importDimensionSorting = function(sortingManager, queryModel, inaSort, sortType)
{
	var dimension = queryModel.getDimensionByNameFromExistingMetadata(inaSort.getStringByKey("Dimension"));
	if (oFF.isNull(dimension) || dimension.isUniversalDisplayHierarchyDimension())
	{
		return null;
	}
	var dimensionSorting = sortingManager.getDimensionSorting(dimension, true);
	if (sortType === oFF.SortType.FILTER)
	{
		dimensionSorting.setSortByFilter();
	}
	else if (sortType === oFF.SortType.MEMBER_KEY)
	{
		dimensionSorting.setSortByKey();
		this.importCustomSortDetails(dimensionSorting, inaSort);
	}
	else if (sortType === oFF.SortType.MEMBER_TEXT)
	{
		dimensionSorting.setSortByText();
	}
	else if (sortType === oFF.SortType.HIERARCHY)
	{
		dimensionSorting.setSortByHierarchy();
	}
	return dimensionSorting;
};
oFF.QInARepoSortLegacy.prototype.importCustomSortDetails = function(dimensionSorting, inaSort)
{
	var customSortList = inaSort.getListByKey("CustomSort");
	if (!oFF.PrUtils.isListEmpty(customSortList))
	{
		var customSort = oFF.PrUtils.asListOfString(customSortList);
		dimensionSorting.setCustomSort(customSort);
		var customSortPosition = oFF.CustomSortPosition.lookup(inaSort.getStringByKey("CustomSortPosition"));
		dimensionSorting.setCustomSortPosition(customSortPosition);
	}
};
oFF.QInARepoSortLegacy.prototype.importMeasureSorting = function(sortingManager, queryModel, inaSort)
{
	var measureName = inaSort.getStringByKey("MeasureName");
	var measureSorting = null;
	if (oFF.notNull(measureName))
	{
		var measureDimension = queryModel.getMeasureDimension();
		var measure = measureDimension.getStructureMember(measureName);
		if (oFF.notNull(measure))
		{
			measureSorting = sortingManager.getMeasureSorting(measure, true);
		}
		var structureName = inaSort.getStringByKey("StructureName");
		var structure = queryModel.getNonMeasureDimension();
		if (oFF.notNull(structureName) && oFF.notNull(structure) && oFF.notNull(measureSorting))
		{
			measureSorting.setSecondaryMeasure(structure.getStructureMember(structureName));
		}
	}
	return measureSorting;
};
oFF.QInARepoSortLegacy.prototype.importFieldSorting = function(sortingManager, queryModel, inaSort)
{
	var fieldName = inaSort.getStringByKey("FieldName");
	var fieldSorting = null;
	if (oFF.notNull(fieldName))
	{
		var field = queryModel.getFieldByName(fieldName);
		if (oFF.notNull(field))
		{
			fieldSorting = sortingManager.getFieldSorting(field, true);
		}
	}
	return fieldSorting;
};
oFF.QInARepoSortLegacy.prototype.exportComponentWithList = oFF.noSupport;

oFF.QInARepoVarDimMemberLegacy = function() {};
oFF.QInARepoVarDimMemberLegacy.prototype = new oFF.QInAComponentWithStructure();
oFF.QInARepoVarDimMemberLegacy.prototype._ff_c = "QInARepoVarDimMemberLegacy";

oFF.QInARepoVarDimMemberLegacy.prototype.getComponentType = function()
{
	return oFF.VariableType.DIMENSION_MEMBER_VARIABLE;
};
oFF.QInARepoVarDimMemberLegacy.prototype.getModelFormat = function()
{
	return oFF.QModelFormat.INA_REPOSITORY;
};
oFF.QInARepoVarDimMemberLegacy.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var memberVariable = modelComponent;
	var inaValues = inaStructure.getStructureByKey("Values");
	if (oFF.notNull(inaValues))
	{
		var selectionContainer = oFF.QFactory.createFilterExpression(memberVariable, memberVariable);
		var newSelectionContainer = importer.importFilterExpression(selectionContainer, inaValues, memberVariable, context);
		memberVariable.setFilter(newSelectionContainer);
	}
	else if (memberVariable.getVariableType() === oFF.VariableType.HIERARCHY_NODE_VARIABLE && memberVariable.hasMemberFilter() && memberVariable.getDimension().getKeyField() !== memberVariable.getMemberFilter().getField())
	{
		memberVariable.setDimension(memberVariable.getDimension());
	}
	return memberVariable;
};
oFF.QInARepoVarDimMemberLegacy.prototype.exportComponentWithStructure = oFF.noSupport;

oFF.QInARepoVarOptionListLegacy = function() {};
oFF.QInARepoVarOptionListLegacy.prototype = new oFF.QInAComponentWithStructure();
oFF.QInARepoVarOptionListLegacy.prototype._ff_c = "QInARepoVarOptionListLegacy";

oFF.QInARepoVarOptionListLegacy.prototype.getComponentType = function()
{
	return oFF.VariableType.OPTION_LIST_VARIABLE;
};
oFF.QInARepoVarOptionListLegacy.prototype.getModelFormat = function()
{
	return oFF.QModelFormat.INA_REPOSITORY;
};
oFF.QInARepoVarOptionListLegacy.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var optionListVariable = modelComponent;
	var inaOptionValues = inaStructure.getListByKey("OptionValues");
	if (oFF.notNull(inaOptionValues))
	{
		var currentOption;
		if (optionListVariable.supportsMultipleValues())
		{
			optionListVariable.clear();
			var len = inaOptionValues.size();
			for (var idxOption = 0; idxOption < len; idxOption++)
			{
				currentOption = inaOptionValues.getStringAt(idxOption);
				optionListVariable.addString(currentOption);
			}
		}
		else if (inaOptionValues.size() === 1)
		{
			currentOption = inaOptionValues.getStringAt(0);
			optionListVariable.setString(currentOption);
		}
	}
	return optionListVariable;
};
oFF.QInARepoVarOptionListLegacy.prototype.exportComponentWithStructure = oFF.noSupport;

oFF.QInARepoVarSimpleTypeLegacy = function() {};
oFF.QInARepoVarSimpleTypeLegacy.prototype = new oFF.QInAComponentWithStructure();
oFF.QInARepoVarSimpleTypeLegacy.prototype._ff_c = "QInARepoVarSimpleTypeLegacy";

oFF.QInARepoVarSimpleTypeLegacy.prototype.getComponentType = function()
{
	return oFF.VariableType.SIMPLE_TYPE_VARIABLE;
};
oFF.QInARepoVarSimpleTypeLegacy.prototype.getModelFormat = function()
{
	return oFF.QModelFormat.INA_REPOSITORY;
};
oFF.QInARepoVarSimpleTypeLegacy.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var simpleTypeVariable = modelComponent;
	simpleTypeVariable.clear();
	var valueType = simpleTypeVariable.getValueType();
	if (valueType.isNumber())
	{
		this.importNumericValues(importer, inaStructure, simpleTypeVariable, valueType);
	}
	else if (valueType.isString())
	{
		this.importStringValues(inaStructure, simpleTypeVariable);
	}
	else if (valueType === oFF.XValueType.DATE)
	{
		this.importDateValues(importer, inaStructure, simpleTypeVariable);
	}
	else if (valueType === oFF.XValueType.TIME)
	{
		this.importTimeValues(importer, inaStructure, simpleTypeVariable);
	}
	else if (valueType === oFF.XValueType.DATE_TIME)
	{
		this.importDateTimeValues(importer, inaStructure, simpleTypeVariable);
	}
	else if (valueType === oFF.XValueType.BOOLEAN)
	{
		this.importBooleanValues(inaStructure, simpleTypeVariable);
	}
	return null;
};
oFF.QInARepoVarSimpleTypeLegacy.prototype.getFirstValueAsString = function(values)
{
	var element = values.get(0);
	if (oFF.notNull(element) && element.isString())
	{
		return element.getString();
	}
	return null;
};
oFF.QInARepoVarSimpleTypeLegacy.prototype.importDateTimeValues = function(importer, inaStructure, simpleTypeVariable)
{
	var inaSimpleDateTimeValues = inaStructure.getListByKey("SimpleStringValues");
	if (oFF.notNull(inaSimpleDateTimeValues))
	{
		var sizeValue = inaSimpleDateTimeValues.size();
		if (simpleTypeVariable.supportsMultipleValues())
		{
			for (var idxValue = 0; idxValue < sizeValue; idxValue++)
			{
				var dateTimeValue = inaSimpleDateTimeValues.getStringAt(idxValue);
				if (oFF.XStringUtils.isNotNullAndNotEmpty(dateTimeValue))
				{
					simpleTypeVariable.addDateTime(oFF.XDateTime.createDateTimeFromStringWithFlag(dateTimeValue, importer.capabilities.supportsSapDate()));
				}
			}
		}
		else if (sizeValue === 1)
		{
			var dateTimeValue2 = this.getFirstValueAsString(inaSimpleDateTimeValues);
			if (oFF.XStringUtils.isNotNullAndNotEmpty(dateTimeValue2))
			{
				simpleTypeVariable.setDateTime(oFF.XDateTime.createDateTimeFromStringWithFlag(dateTimeValue2, importer.capabilities.supportsSapDate()));
			}
		}
	}
};
oFF.QInARepoVarSimpleTypeLegacy.prototype.importTimeValues = function(importer, inaStructure, simpleTypeVariable)
{
	var inaSimpleTimeValues = inaStructure.getListByKey("SimpleStringValues");
	if (oFF.notNull(inaSimpleTimeValues))
	{
		var sizeValue = inaSimpleTimeValues.size();
		if (simpleTypeVariable.supportsMultipleValues())
		{
			for (var idxValue = 0; idxValue < sizeValue; idxValue++)
			{
				var timeValue = inaSimpleTimeValues.getStringAt(idxValue);
				if (oFF.XStringUtils.isNotNullAndNotEmpty(timeValue))
				{
					simpleTypeVariable.addTime(oFF.XTime.createTimeFromStringWithFlag(timeValue, importer.capabilities.supportsSapDate()));
				}
			}
		}
		else if (sizeValue === 1)
		{
			var timeValue2 = this.getFirstValueAsString(inaSimpleTimeValues);
			if (oFF.XStringUtils.isNotNullAndNotEmpty(timeValue2))
			{
				simpleTypeVariable.setTime(oFF.XTime.createTimeFromStringWithFlag(timeValue2, importer.capabilities.supportsSapDate()));
			}
		}
	}
};
oFF.QInARepoVarSimpleTypeLegacy.prototype.importDateValues = function(importer, inaStructure, simpleTypeVariable)
{
	var inaSimpleDateValues = inaStructure.getListByKey("SimpleStringValues");
	if (oFF.notNull(inaSimpleDateValues))
	{
		var sizeValue = inaSimpleDateValues.size();
		if (simpleTypeVariable.supportsMultipleValues())
		{
			for (var idxValue = 0; idxValue < sizeValue; idxValue++)
			{
				var dateValue = inaSimpleDateValues.getStringAt(idxValue);
				if (oFF.XStringUtils.isNotNullAndNotEmpty(dateValue))
				{
					simpleTypeVariable.addDate(oFF.QInARepoUtils.createDate(dateValue));
				}
			}
		}
		else if (sizeValue === 1)
		{
			var dateValue2 = this.getFirstValueAsString(inaSimpleDateValues);
			if (oFF.XStringUtils.isNotNullAndNotEmpty(dateValue2))
			{
				simpleTypeVariable.setDate(oFF.QInARepoUtils.createDate(dateValue2));
			}
		}
	}
};
oFF.QInARepoVarSimpleTypeLegacy.prototype.importStringValues = function(inaStructure, simpleTypeVariable)
{
	var inaSimpleStringValues = inaStructure.getListByKey("SimpleStringValues");
	if (oFF.notNull(inaSimpleStringValues))
	{
		var sizeValue = inaSimpleStringValues.size();
		if (simpleTypeVariable.supportsMultipleValues())
		{
			for (var idxValue = 0; idxValue < sizeValue; idxValue++)
			{
				simpleTypeVariable.addString(inaSimpleStringValues.getStringAt(idxValue));
			}
		}
		else if (sizeValue === 1)
		{
			var element = inaSimpleStringValues.get(0);
			if (oFF.notNull(element) && element.isString())
			{
				simpleTypeVariable.setString(element.getString());
			}
		}
	}
};
oFF.QInARepoVarSimpleTypeLegacy.prototype.importBooleanValues = function(inaStructure, simpleTypeVariable)
{
	var inaSimpleBooleanValues = inaStructure.getListByKey("SimpleStringValues");
	if (oFF.notNull(inaSimpleBooleanValues))
	{
		var sizeValue = inaSimpleBooleanValues.size();
		if (simpleTypeVariable.supportsMultipleValues())
		{
			for (var idxValue = 0; idxValue < sizeValue; idxValue++)
			{
				simpleTypeVariable.addBoolean(inaSimpleBooleanValues.getBooleanAt(idxValue));
			}
		}
		else if (sizeValue === 1)
		{
			var element = inaSimpleBooleanValues.get(0);
			if (oFF.notNull(element) && element.isBoolean())
			{
				simpleTypeVariable.setBoolean(element.asBoolean().getBoolean());
			}
		}
	}
};
oFF.QInARepoVarSimpleTypeLegacy.prototype.importNumericString = function(simpleTypeVariable, valueType, stringValue)
{
	if (valueType === oFF.XValueType.INTEGER)
	{
		simpleTypeVariable.addInteger(oFF.XInteger.convertFromString(stringValue));
	}
	else if (valueType === oFF.XValueType.DOUBLE || valueType === oFF.XValueType.DECIMAL_FLOAT)
	{
		simpleTypeVariable.addDouble(oFF.XDouble.convertFromString(stringValue));
	}
	else if (valueType === oFF.XValueType.LONG)
	{
		simpleTypeVariable.addLong(oFF.XLong.convertFromString(stringValue));
	}
};
oFF.QInARepoVarSimpleTypeLegacy.prototype.importNumericValues = function(importer, inaStructure, simpleTypeVariable, valueType)
{
	var inaSimpleNumericValues = inaStructure.getListByKey("SimpleNumericValues");
	if (oFF.notNull(inaSimpleNumericValues))
	{
		var sizeValue = inaSimpleNumericValues.size();
		if (simpleTypeVariable.supportsMultipleValues())
		{
			for (var idxValue = 0; idxValue < sizeValue; idxValue++)
			{
				var elementAt = inaSimpleNumericValues.get(idxValue);
				if (importer.capabilities.supportsNumberAsString() && oFF.notNull(elementAt) && elementAt.getType() === oFF.PrElementType.STRING)
				{
					this.importNumericString(simpleTypeVariable, valueType, inaSimpleNumericValues.getStringAt(idxValue));
					continue;
				}
				if (valueType === oFF.XValueType.INTEGER)
				{
					var integerValue = inaSimpleNumericValues.getIntegerAt(idxValue);
					simpleTypeVariable.addInteger(integerValue);
				}
				else if (valueType === oFF.XValueType.DOUBLE || valueType === oFF.XValueType.DECIMAL_FLOAT)
				{
					var doubleValue = inaSimpleNumericValues.getDoubleAt(idxValue);
					simpleTypeVariable.addDouble(doubleValue);
				}
				else if (valueType === oFF.XValueType.LONG)
				{
					var longValue = inaSimpleNumericValues.getLongAt(idxValue);
					simpleTypeVariable.addLong(longValue);
				}
			}
		}
		else if (sizeValue === 1)
		{
			var numericElement0 = inaSimpleNumericValues.get(0);
			if (oFF.notNull(numericElement0) && numericElement0.isNumeric())
			{
				if (valueType === oFF.XValueType.INTEGER)
				{
					simpleTypeVariable.setInteger(inaSimpleNumericValues.getIntegerAt(0));
				}
				else if (valueType === oFF.XValueType.DOUBLE)
				{
					simpleTypeVariable.setDouble(inaSimpleNumericValues.getDoubleAt(0));
				}
				else if (valueType === oFF.XValueType.DECIMAL_FLOAT)
				{
					simpleTypeVariable.setDecFloat(oFF.XDecFloatByDouble.create(inaSimpleNumericValues.getDoubleAt(0)));
				}
				else if (valueType === oFF.XValueType.LONG)
				{
					simpleTypeVariable.setLong(inaSimpleNumericValues.getLongAt(0));
				}
			}
		}
	}
};
oFF.QInARepoVarSimpleTypeLegacy.prototype.exportComponentWithStructure = oFF.noSupport;

oFF.QInARepoVariableContainerLegacy = function() {};
oFF.QInARepoVariableContainerLegacy.prototype = new oFF.QInAComponentWithList();
oFF.QInARepoVariableContainerLegacy.prototype._ff_c = "QInARepoVariableContainerLegacy";

oFF.QInARepoVariableContainerLegacy.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.VARIABLE_CONTAINER;
};
oFF.QInARepoVariableContainerLegacy.prototype.getTagName = function()
{
	return "Variables";
};
oFF.QInARepoVariableContainerLegacy.prototype.getModelFormat = function()
{
	return oFF.QModelFormat.INA_REPOSITORY;
};
oFF.QInARepoVariableContainerLegacy.prototype.importComponentWithList = function(importer, inaList, modelComponent, parentComponent, context)
{
	var variableContainer = modelComponent;
	importer.importVariableList(inaList, variableContainer);
	return modelComponent;
};
oFF.QInARepoVariableContainerLegacy.prototype.exportComponentWithList = oFF.noSupport;

oFF.QInARepoVariablesListLegacy = function() {};
oFF.QInARepoVariablesListLegacy.prototype = new oFF.QInAComponentWithList();
oFF.QInARepoVariablesListLegacy.prototype._ff_c = "QInARepoVariablesListLegacy";

oFF.QInARepoVariablesListLegacy.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.VARIABLE_LIST;
};
oFF.QInARepoVariablesListLegacy.prototype.getModelFormat = function()
{
	return oFF.QModelFormat.INA_REPOSITORY;
};
oFF.QInARepoVariablesListLegacy.prototype.importComponentWithList = function(importer, inaList, modelComponent, parentComponent, context)
{
	var variableContainer = modelComponent;
	if (oFF.notNull(inaList))
	{
		var len = inaList.size();
		for (var varIdx = 0; varIdx < len; varIdx++)
		{
			var inaVariable = inaList.getStructureAt(varIdx);
			var variableName = inaVariable.getStringByKey("Name");
			var variable = variableContainer.getVariableBaseByName(variableName);
			if (oFF.notNull(variable))
			{
				var variableType = variable.getVariableType();
				if (variableType.isTypeOf(oFF.VariableType.SIMPLE_TYPE_VARIABLE))
				{
					importer.importSimpleTypeVariable(inaVariable, variable, context);
				}
				else if (variableType.isTypeOf(oFF.VariableType.DIMENSION_MEMBER_VARIABLE))
				{
					importer.importDimensionMemberVariable(inaVariable, variable, context);
				}
				else if (variableType.isTypeOf(oFF.VariableType.OPTION_LIST_VARIABLE))
				{
					importer.importOptionListVariable(inaVariable, variable, context);
				}
				else
				{
					importer.addError(oFF.ErrorCodes.INVALID_PARAMETER, oFF.XStringUtils.concatenate5("The variable '", variableName, "' of variable type '", variableType.getName(), "' was not imported correctly"));
				}
			}
			else
			{
				importer.addWarning(oFF.ErrorCodes.ET_ELEMENT_NOT_FOUND, oFF.XStringUtils.concatenate3("The variable '", variableName, "' was not found"));
			}
		}
	}
	return modelComponent;
};
oFF.QInARepoVariablesListLegacy.prototype.exportComponentWithList = oFF.noSupport;

oFF.QInAComponentContainer = function() {};
oFF.QInAComponentContainer.prototype = new oFF.DfNameObject();
oFF.QInAComponentContainer.prototype._ff_c = "QInAComponentContainer";

oFF.QInAComponentContainer.create = function(type)
{
	var newObj = new oFF.QInAComponentContainer();
	newObj._setupInternal(type.getName());
	newObj.m_type = type;
	newObj.m_components = oFF.XList.create();
	return newObj;
};
oFF.QInAComponentContainer.prototype.m_components = null;
oFF.QInAComponentContainer.prototype.m_type = null;
oFF.QInAComponentContainer.prototype.isEmpty = function()
{
	return this.m_components.isEmpty();
};
oFF.QInAComponentContainer.prototype.hasElements = function()
{
	return this.m_components.hasElements();
};
oFF.QInAComponentContainer.prototype.size = function()
{
	return this.m_components.size();
};
oFF.QInAComponentContainer.prototype.get = function(inaImportElement)
{
	var size = this.m_components.size();
	var result = null;
	if (size > 1)
	{
		for (var i = 0; i < size; i++)
		{
			var currentComponent = this.m_components.get(i);
			if (currentComponent.isMatching(inaImportElement))
			{
				result = currentComponent;
				break;
			}
		}
	}
	if (oFF.isNull(result) && size > 0)
	{
		result = this.m_components.get(0);
	}
	return result;
};
oFF.QInAComponentContainer.prototype.add = function(component)
{
	oFF.XBooleanUtils.checkFalse(this.m_components.contains(component), "Container already exists");
	this.m_components.add(component);
};
oFF.QInAComponentContainer.prototype.getComponentType = function()
{
	return this.m_type;
};

oFF.QInARepoAttribute = function() {};
oFF.QInARepoAttribute.prototype = new oFF.QInARepository();
oFF.QInARepoAttribute.prototype._ff_c = "QInARepoAttribute";

oFF.QInARepoAttribute.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.ATTRIBUTE;
};
oFF.QInARepoAttribute.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var dimension = parentComponent;
	var name = inaStructure.getStringByKey("Name");
	var attribute = dimension.getAttributeByName(name);
	if (oFF.notNull(attribute))
	{
		var inaResultSetFields = inaStructure.getListByKey("ResultSetFields");
		if (oFF.notNull(inaResultSetFields))
		{
			var resultSetFields = attribute.getResultSetFields();
			resultSetFields.clear();
			var len = inaResultSetFields.size();
			for (var i = 0; i < len; i++)
			{
				var field = attribute.getFieldByName(inaResultSetFields.getStringAt(i));
				if (oFF.notNull(field))
				{
					resultSetFields.add(field);
				}
			}
		}
	}
	return attribute;
};
oFF.QInARepoAttribute.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var attribute = modelComponent;
	inaStructure.putString("Name", attribute.getName());
	var inaResultSetFields = inaStructure.putNewList("ResultSetFields");
	var resultSetFields = attribute.getResultSetFields();
	var len = resultSetFields.size();
	for (var i = 0; i < len; i++)
	{
		inaResultSetFields.addString(resultSetFields.get(i).getName());
	}
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};

oFF.QInARepoAxesSettings = function() {};
oFF.QInARepoAxesSettings.prototype = new oFF.QInARepository();
oFF.QInARepoAxesSettings.prototype._ff_c = "QInARepoAxesSettings";

oFF.QInARepoAxesSettings.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.AXES_SETTINGS;
};
oFF.QInARepoAxesSettings.prototype.getTagName = function()
{
	return "AxesRepo";
};
oFF.QInARepoAxesSettings.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	if (oFF.notNull(inaStructure))
	{
		var inaList = inaStructure.getListByKey("Elements");
		this.importComponentWithList(importer, inaList, modelComponent, parentComponent, context);
	}
	return modelComponent;
};
oFF.QInARepoAxesSettings.prototype.importComponentWithList = function(importer, inaList, modelComponent, parentComponent, context)
{
	if (oFF.notNull(inaList))
	{
		var queryModel = context.getQueryModel();
		if (importer.capabilities.supportsZeroSuppression() || importer.capabilities.supportsNullZeroSuppression())
		{
			var all = oFF.AxisType.getAll();
			var allSize = all.size();
			for (var k = 0; k < allSize; k++)
			{
				var axis = queryModel.getAxisBase(all.get(k));
				if (oFF.notNull(axis))
				{
					axis.setSupportsZeroSuppression(true);
				}
			}
		}
		var len = inaList.size();
		for (var i = 0; i < len; i++)
		{
			importer.importAxis(inaList.getStructureAt(i), null, context);
		}
	}
	return null;
};
oFF.QInARepoAxesSettings.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var inaList = this.exportComponentWithList(exporter, modelComponent, flags);
	inaStructure.put("Elements", inaList);
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};
oFF.QInARepoAxesSettings.prototype.exportComponentWithList = function(exporter, modelComponent, flags)
{
	var queryModel = modelComponent;
	var inaAxisStructureList = oFF.PrFactory.createList();
	var inaColumns = exporter.exportAxis(queryModel.getColumnsAxis(), null);
	inaAxisStructureList.add(inaColumns);
	var inaRows = exporter.exportAxis(queryModel.getRowsAxis(), null);
	inaAxisStructureList.add(inaRows);
	return inaAxisStructureList;
};

oFF.QInARepoAxis = function() {};
oFF.QInARepoAxis.prototype = new oFF.QInARepository();
oFF.QInARepoAxis.prototype._ff_c = "QInARepoAxis";

oFF.QInARepoAxis.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.AXIS;
};
oFF.QInARepoAxis.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var queryModel = context.getQueryModel();
	var axisType;
	var axisTypeValue = inaStructure.getStringByKey("Axis");
	if (oFF.notNull(axisTypeValue))
	{
		axisType = oFF.QInAConverter.lookupAxisType(axisTypeValue);
	}
	else
	{
		var axisTypeIntValue = inaStructure.getIntegerByKey("Type");
		axisType = oFF.QInAConverter.lookupAxisTypeInt(axisTypeIntValue);
	}
	var axis = queryModel.getAxisBase(axisType);
	if (oFF.notNull(axis))
	{
		if (axis.supportsZeroSuppression())
		{
			var valueType = inaStructure.getIntegerByKeyExt("ZeroSuppressionType", 0);
			var suppressionType = oFF.QInAConverter.lookupSuppressionType(valueType);
			axis.setZeroSuppressionType(suppressionType);
		}
		var inaLayout = inaStructure.getListByKey("Layout");
		if (oFF.notNull(inaLayout))
		{
			axis.clear();
			var dimensionManagerBase = queryModel.getDimensionManagerBase();
			for (var i = 0; i < inaLayout.size(); i++)
			{
				var dimensionName = inaLayout.getStringAt(i);
				var dimension = dimensionManagerBase.getDimensionByNameInternal(dimensionName);
				axis.add(dimension);
			}
		}
		importer.importTotals(inaStructure, axis.getResultStructureControllerBase(), context);
		if (inaStructure.containsKey("LowerLevelNodeAlignment"))
		{
			axis.setLowerLevelNodeAlignment(oFF.QInAConverter.lookupLowerLevelNodeAlignment(inaStructure.getStringByKey("LowerLevelNodeAlignment")));
		}
	}
	return axis;
};
oFF.QInARepoAxis.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var axis = modelComponent;
	inaStructure.putString("Axis", oFF.QInAConverter.lookupAxisTypeInA(axis.getType()));
	inaStructure.putInteger("Type", oFF.QInAConverter.lookupAxisTypeInAInt(axis.getType()));
	var typeZeroSuppression = axis.getZeroSuppressionType();
	inaStructure.putInteger("ZeroSuppressionType", oFF.QInAConverter.lookupSuppressionTypeInA(typeZeroSuppression));
	var inaLayout = inaStructure.putNewList("Layout");
	for (var i = 0; i < axis.size(); i++)
	{
		var dimension = axis.getDimensionAt(i);
		inaLayout.addString(dimension.getName());
	}
	exporter.exportTotals(axis.getResultStructureController(), inaStructure);
	var nodeAlignment = axis.getLowerLevelNodeAlignment();
	if (oFF.notNull(nodeAlignment))
	{
		inaStructure.putString("LowerLevelNodeAlignment", oFF.QInAConverter.lookupLowerLevelNodeAlignmentInA(nodeAlignment));
	}
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};

oFF.QInARepoBlendableQueryManager = function() {};
oFF.QInARepoBlendableQueryManager.prototype = new oFF.QInARepository();
oFF.QInARepoBlendableQueryManager.prototype._ff_c = "QInARepoBlendableQueryManager";

oFF.QInARepoBlendableQueryManager.importQueryModelLinkSettingStructure = function(inaQueryModelLinkSettings, blendableQueryManager, secondaryDatasetId)
{
	var inaQueryModelLinkSetting = inaQueryModelLinkSettings.getStructureByKey(secondaryDatasetId);
	blendableQueryManager.setLinkType(secondaryDatasetId, oFF.BlendingLinkType.lookup(inaQueryModelLinkSetting.getStringByKey("LinkType")));
	blendableQueryManager.setUnlinkedDimensionJoinType(secondaryDatasetId, oFF.UnlinkedDimensionJoinType.lookup(inaQueryModelLinkSetting.getStringByKey("UnlinkedDimensionJoinType")));
	var inaActiveLinkDimensionNames = inaQueryModelLinkSetting.getListByKey("ActiveDimensionLinks");
	if (oFF.notNull(inaActiveLinkDimensionNames))
	{
		var inaActiveLinkDimensionNamesIter = inaActiveLinkDimensionNames.getIterator();
		while (inaActiveLinkDimensionNamesIter.hasNext())
		{
			var inaActiveLinkDimensionName = inaActiveLinkDimensionNamesIter.next().asString().getString();
			if (blendableQueryManager.getPrimaryQueryManager().getQueryModel().getDimensionByName(inaActiveLinkDimensionName) !== null)
			{
				blendableQueryManager.addActivePrimaryLinkDimensionName(secondaryDatasetId, inaActiveLinkDimensionName);
			}
		}
	}
};
oFF.QInARepoBlendableQueryManager.importDrillOperations = function(blendableQueryManager, inaStructure)
{
	var inaDrillOperations = inaStructure.getListByKey("DrillOperations");
	blendableQueryManager.clearBlendedDrillOperations();
	if (oFF.notNull(inaDrillOperations))
	{
		var inaDrillOperationsIter = inaDrillOperations.getIterator();
		while (inaDrillOperationsIter.hasNext())
		{
			var inaDrillOperation = inaDrillOperationsIter.next().asStructure();
			var newBlendedDrillInfo = blendableQueryManager.addNewBlendedDrillOperation(inaDrillOperation.getStringByKey("DatasetId"), inaDrillOperation.getStringByKey("DimensionName"));
			newBlendedDrillInfo.setDrillState(oFF.QInAConverter.lookupDrillStateOp(inaDrillOperation.getStringByKey("DrillState")));
			var inaDrillPathElements = inaDrillOperation.getListByKey("DrillPathElements");
			if (oFF.notNull(inaDrillPathElements))
			{
				var inaDrillPathElementsIter = inaDrillPathElements.getIterator();
				while (inaDrillPathElementsIter.hasNext())
				{
					var inaDrillPathElement = inaDrillPathElementsIter.next().asStructure();
					newBlendedDrillInfo.addBlendedDrillPathElementInfo(inaDrillPathElement.getStringByKey("DatasetId"), inaDrillPathElement.getStringByKey("DimensionName"), inaDrillPathElement.getStringByKey("Member"));
				}
			}
		}
	}
};
oFF.QInARepoBlendableQueryManager.importBlendedDimensionInfoAxis = function(blendableQueryManager, inaDimensionOrderMap, axisType)
{
	var inaBlendedDimensionInfos = inaDimensionOrderMap.getListByKey(axisType.getName());
	if (oFF.notNull(inaBlendedDimensionInfos))
	{
		var inaBlendedDimensionInfosIter = inaBlendedDimensionInfos.getIterator();
		blendableQueryManager.clearBlendedDimensionInfosByAxis(axisType);
		while (inaBlendedDimensionInfosIter.hasNext())
		{
			var inaBlendedDimensionInfo = inaBlendedDimensionInfosIter.next().asStructure();
			var blendedDimensionInfo = blendableQueryManager.addBlendedDimensionInfoToAxis(axisType, inaBlendedDimensionInfo.getStringByKey("DatasetId"), inaBlendedDimensionInfo.getStringByKey("DimensionName"));
			if (inaBlendedDimensionInfo.containsKey("InitialDrillLevel"))
			{
				blendedDimensionInfo.setInitialDrillLevel(inaBlendedDimensionInfo.getIntegerByKey("InitialDrillLevel"));
			}
		}
	}
};
oFF.QInARepoBlendableQueryManager.importSorts = function(inaStructure, blendableQueryManager)
{
	var inaBlendableDimensionSorts = inaStructure.getListByKey("BlendableDimensionSorts");
	var inaBlendableMeasureMemberSort = inaStructure.getStructureByKey("BlendableMeasureMemberSort");
	blendableQueryManager.clearBlendableDimensionSorts();
	blendableQueryManager.clearPrimaryBlendableMemberMeasureSort();
	if (oFF.notNull(inaBlendableDimensionSorts))
	{
		oFF.QInARepoBlendableQueryManager.importDimensionSorts(blendableQueryManager, inaBlendableDimensionSorts);
	}
	else if (oFF.notNull(inaBlendableMeasureMemberSort))
	{
		oFF.QInARepoBlendableQueryManager.importMeasureMemberSort(blendableQueryManager, inaBlendableMeasureMemberSort);
	}
};
oFF.QInARepoBlendableQueryManager.importDimensionSorts = function(blendableQueryManager, inaBlendableDimensionSorts)
{
	var inaBlendableDimensionSortsIterator = inaBlendableDimensionSorts.getIterator();
	while (inaBlendableDimensionSortsIterator.hasNext())
	{
		var inaBlendableDimensionSort = inaBlendableDimensionSortsIterator.next().asStructure();
		var fieldName = inaBlendableDimensionSort.getStringByKey("FieldName");
		var datasetId = inaBlendableDimensionSort.getStringByKey("DatasetId");
		var sortDirection = oFF.QInAConverter.lookupSortDirection(inaBlendableDimensionSort.getIntegerByKey("SortDirection"));
		var preserveGrouping = inaBlendableDimensionSort.getBooleanByKey("PreserveGrouping");
		var contextLanguage = inaBlendableDimensionSort.getStringByKey("Locale");
		var inaBlendableCustomSort = inaBlendableDimensionSort.getStructureByKey("CustomSort");
		var customSort = oFF.QInARepoBlendableQueryManager.importCustomSort(inaBlendableCustomSort);
		var autoLimiterSort = inaBlendableDimensionSort.getStringByKey("AutoLimiterSort");
		var isDisplayedAsId = inaBlendableDimensionSort.getBooleanByKey("IsDisplayedAsId");
		var dimensionId = inaBlendableDimensionSort.getStringByKey("ID");
		var dimensionSort = oFF.QFactory.createBlendableDimensionSort(fieldName, datasetId, sortDirection, preserveGrouping, contextLanguage);
		dimensionSort.setCustomSortDefinition(customSort);
		dimensionSort.setAutoLimiterSort(autoLimiterSort);
		dimensionSort.setIsDisplayedAsId(isDisplayedAsId);
		dimensionSort.setDimensionId(dimensionId);
		blendableQueryManager.updateBlendableDimensionSort(dimensionSort);
	}
};
oFF.QInARepoBlendableQueryManager.importCustomSort = function(inaBlendableCustomSort)
{
	if (oFF.isNull(inaBlendableCustomSort))
	{
		return null;
	}
	var name = inaBlendableCustomSort.getStringByKey("Name");
	var datasetId = inaBlendableCustomSort.getStringByKey("DatasetId");
	var dimensionId = inaBlendableCustomSort.getStringByKey("ID");
	var hierarchyId = inaBlendableCustomSort.getStringByKey("HierarchyId");
	var id = inaBlendableCustomSort.getStringByKey("Id");
	var sortFromStart = oFF.QInARepoBlendableQueryManager.importListOfString(inaBlendableCustomSort, "SortFromStart");
	var sortFromEnd = oFF.QInARepoBlendableQueryManager.importListOfString(inaBlendableCustomSort, "SortFromEnd");
	var movedNodes = oFF.QInARepoBlendableQueryManager.importListOfString(inaBlendableCustomSort, "SortMovedNodes");
	return oFF.QFactory.createBlendableCustomSort(name, datasetId, dimensionId, hierarchyId, id, sortFromStart, sortFromEnd, movedNodes);
};
oFF.QInARepoBlendableQueryManager.importListOfString = function(inaStructure, key)
{
	var newList = oFF.XListOfString.create();
	var inaList = inaStructure.getListByKey(key);
	var inaIterator = inaList.getIterator();
	while (inaIterator.hasNext())
	{
		newList.add(inaIterator.next().asString().getString());
	}
	return newList.size() === 0 ? null : newList;
};
oFF.QInARepoBlendableQueryManager.importMeasureMemberSort = function(blendableQueryManager, inaBlendableMeasureMemberSort)
{
	var blendableMeasureSort = oFF.QFactory.createBlendableMeasureSort(blendableQueryManager);
	blendableMeasureSort.setPrimaryMeasure(inaBlendableMeasureMemberSort.getStringByKey("MeasureMemberName"), inaBlendableMeasureMemberSort.getStringByKey("DatasetId"), inaBlendableMeasureMemberSort.getBooleanByKey("PrimaryBlendableBlended"));
	blendableMeasureSort.setSecondaryMeasure(inaBlendableMeasureMemberSort.getStringByKey("SecondaryMeasureName"), inaBlendableMeasureMemberSort.getStringByKey("SecondaryDatasetId"), inaBlendableMeasureMemberSort.getBooleanByKey("SecondaryMeasureBlended"));
	var sortDirection = oFF.QInAConverter.lookupSortDirection(inaBlendableMeasureMemberSort.getIntegerByKey("SortDirection"));
	blendableMeasureSort.setSortDirection(sortDirection);
	blendableMeasureSort.setPreserveGrouping(inaBlendableMeasureMemberSort.getBooleanByKey("PreserveGrouping"));
	blendableMeasureSort.setVersionElementId(inaBlendableMeasureMemberSort.getStringByKey("VersionElementId"));
	var inaVersionDimension = inaBlendableMeasureMemberSort.getStructureByKey("VersionDimension");
	if (oFF.notNull(inaVersionDimension))
	{
		var datasetId = inaVersionDimension.getStringByKey("DatasetId");
		var leafQueryManager = blendableQueryManager.getQueryManagerByDatasetId(datasetId);
		if (oFF.notNull(leafQueryManager))
		{
			var dimensionName = inaVersionDimension.getStringByKey("Name");
			var dimension = leafQueryManager.getQueryModel().getDimensionByName(dimensionName);
			if (oFF.notNull(dimension))
			{
				blendableMeasureSort.setVersionDimension(dimension);
			}
		}
	}
	blendableQueryManager.setBlendableMeasureMemberSort(blendableMeasureSort);
};
oFF.QInARepoBlendableQueryManager.importRankSettingsList = function(inaStructure, blendableQueryManager)
{
	var rankSettingsList = inaStructure.getListByKey("RankSettings");
	blendableQueryManager.clearRankSettings();
	if (oFF.notNull(rankSettingsList))
	{
		for (var i = 0; i < rankSettingsList.size(); i++)
		{
			oFF.QInARepoBlendableQueryManager.importRankSettings(rankSettingsList.getStructureAt(i), blendableQueryManager);
		}
	}
};
oFF.QInARepoBlendableQueryManager.importRankSettings = function(inaRankSettings, blendableQueryManager)
{
	var rankSettings = oFF.QFactory.createRankSettings();
	rankSettings.setMeasure(inaRankSettings.getStringByKey("MeasureMemberName"));
	rankSettings.setPrimaryDatasetId(inaRankSettings.getStringByKey("MeasureMemberDatasetId"));
	rankSettings.setIsBlendedPrimaryMeasure(inaRankSettings.getBooleanByKey("PrimaryBlendableBlended"));
	rankSettings.setSecondaryMeasure(inaRankSettings.getStringByKey("SecondaryMeasureName"));
	rankSettings.setSecondaryDatasetId(inaRankSettings.getStringByKey("SecondaryDatasetId"));
	rankSettings.setIsBlendedSecondaryMeasure(inaRankSettings.getBooleanByKey("SecondaryMeasureBlended"));
	rankSettings.setMaxRows(inaRankSettings.getIntegerByKey("MaxRows"));
	rankSettings.setUseClientSideRanking(inaRankSettings.getBooleanByKey("ClientSideRanking"));
	rankSettings.setIsRankOnAllDimensions(inaRankSettings.getBooleanByKey("RankOnAllDimensions"));
	rankSettings.setIsApplyRankingsWithoutReset(inaRankSettings.getBooleanByKey("IsApplyRankingsWithoutReset"));
	rankSettings.setPreserveSort(inaRankSettings.getBooleanByKey("PreserveSort"));
	var inaDimensions = inaRankSettings.getListByKey("Dimensions");
	var dimensionName;
	var datasetId;
	var leafQueryManager;
	var dimension;
	for (var i = 0; i < inaDimensions.size(); i++)
	{
		var inaDimension = inaDimensions.get(i).asStructure();
		datasetId = inaDimension.getStringByKey("DatasetId");
		leafQueryManager = blendableQueryManager.getQueryManagerByDatasetId(datasetId);
		if (oFF.notNull(leafQueryManager))
		{
			dimensionName = inaDimension.getStringByKey("Name");
			dimension = leafQueryManager.getQueryModel().getDimensionByName(dimensionName);
			if (oFF.notNull(dimension))
			{
				rankSettings.addAppliedDimension(dimension);
			}
		}
	}
	var comparisonOperatorName = inaRankSettings.getStringByKey("Comparison");
	rankSettings.setComparisonOperator(oFF.ConditionComparisonOperator.lookupName(comparisonOperatorName));
	rankSettings.setVersionElementId(inaRankSettings.getStringByKey("VersionElementId"));
	var inaVersionDimension = inaRankSettings.getStructureByKey("VersionDimension");
	if (oFF.notNull(inaVersionDimension))
	{
		datasetId = inaVersionDimension.getStringByKey("DatasetId");
		leafQueryManager = blendableQueryManager.getQueryManagerByDatasetId(datasetId);
		if (oFF.notNull(leafQueryManager))
		{
			dimensionName = inaVersionDimension.getStringByKey("Name");
			dimension = leafQueryManager.getQueryModel().getDimensionByName(dimensionName);
			if (oFF.notNull(dimension))
			{
				rankSettings.setVersionDimension(dimension);
			}
		}
	}
	rankSettings.setUseDefaultSort(inaRankSettings.getBooleanByKey("UseDefaultSort"));
	blendableQueryManager.addRankSettings(rankSettings);
};
oFF.QInARepoBlendableQueryManager.exportQueryModelLinkSettingStructure = function(inaQueryModelLinkSettings, blendableQueryManager, primaryDatasetId, secondaryDatasetId)
{
	var inaQueryModelLinkSetting = oFF.PrStructure.create();
	inaQueryModelLinkSetting.putString("FirstModelName", primaryDatasetId);
	inaQueryModelLinkSetting.putString("SecondModelName", secondaryDatasetId);
	inaQueryModelLinkSetting.putString("LinkType", blendableQueryManager.getLinkType(secondaryDatasetId).getName());
	inaQueryModelLinkSetting.putString("UnlinkedDimensionJoinType", blendableQueryManager.getUnlinkedDimensionJoinType(secondaryDatasetId).getName());
	var inaActiveLinkDimensionNames = inaQueryModelLinkSetting.putNewList("ActiveDimensionLinks");
	var activeLinkDimensionNamesIter = blendableQueryManager.getActivePrimaryLinkDimensionNames(secondaryDatasetId).getIterator();
	while (activeLinkDimensionNamesIter.hasNext())
	{
		var activeLinkDimensionName = activeLinkDimensionNamesIter.next();
		inaActiveLinkDimensionNames.addString(activeLinkDimensionName);
	}
	inaQueryModelLinkSettings.put(secondaryDatasetId, inaQueryModelLinkSetting);
};
oFF.QInARepoBlendableQueryManager.exportDrillOperations = function(inaStructure, blendableQueryManager)
{
	var blendedDrillOperationsIter = blendableQueryManager.getBlendedDrillOperations().getIterator();
	var inaDrillOperations = inaStructure.putNewList("DrillOperations");
	while (blendedDrillOperationsIter.hasNext())
	{
		var blendedDrillOperation = blendedDrillOperationsIter.next();
		var inaDrillOperation = inaDrillOperations.addNewStructure();
		inaDrillOperation.putString("DimensionName", blendedDrillOperation.getDimensionName());
		inaDrillOperation.putString("DatasetId", blendedDrillOperation.getDatasetId());
		var inADrillState = oFF.QInAConverter.lookupDrillStateInA(blendedDrillOperation.getDrillState());
		inaDrillOperation.putString("DrillState", inADrillState);
		var inaDrillPathElements = inaDrillOperation.putNewList("DrillPathElements");
		var blendedDrillPathInfosIter = blendedDrillOperation.getBlendedDrillPathElementInfos().getIterator();
		while (blendedDrillPathInfosIter.hasNext())
		{
			var blendedDrillPathElementInfo = blendedDrillPathInfosIter.next();
			var inaBlendedDrillPathElementInfo = inaDrillPathElements.addNewStructure();
			inaBlendedDrillPathElementInfo.putString("DatasetId", blendedDrillPathElementInfo.getDatasetId());
			inaBlendedDrillPathElementInfo.putString("DimensionName", blendedDrillPathElementInfo.getDimensionName());
			inaBlendedDrillPathElementInfo.putString("Member", blendedDrillPathElementInfo.getDrillMember());
		}
	}
};
oFF.QInARepoBlendableQueryManager.exportBlendedDimensionAxis = function(blendableQueryManager, inaDimensionOrderMap, axisType)
{
	var inaRowDimensionOrder = inaDimensionOrderMap.putNewList(axisType.getName());
	var blendedDimensionInfos = blendableQueryManager.getBlendedDimensionsByAxis(axisType).getIterator();
	while (blendedDimensionInfos.hasNext())
	{
		var blendedDimensionInfo = blendedDimensionInfos.next();
		var inaRowDimension = inaRowDimensionOrder.addNewStructure();
		inaRowDimension.putString("DatasetId", blendedDimensionInfo.getDatasetId());
		inaRowDimension.putString("DimensionName", blendedDimensionInfo.getDimensionName());
		if (blendedDimensionInfo.getInitialDrillLevel() !== null)
		{
			inaRowDimension.putInteger("InitialDrillLevel", blendedDimensionInfo.getInitialDrillLevel().getInteger());
		}
	}
};
oFF.QInARepoBlendableQueryManager.exportSorts = function(inaStructure, blendableQueryManager)
{
	var blendableDimensionSorts = blendableQueryManager.getBlendableDimensionSorts();
	var primaryBlendableMeasureMemberSort = blendableQueryManager.getPrimaryBlendableMeasureMemberSort();
	if (blendableDimensionSorts.size() > 0)
	{
		oFF.QInARepoBlendableQueryManager.exportDimensionSorts(inaStructure, blendableDimensionSorts);
	}
	else if (oFF.notNull(primaryBlendableMeasureMemberSort))
	{
		oFF.QInARepoBlendableQueryManager.exportMeasureMemberSort(inaStructure, primaryBlendableMeasureMemberSort);
	}
};
oFF.QInARepoBlendableQueryManager.exportDimensionSorts = function(inaStructure, blendableDimensionSorts)
{
	var inaBlendableDimensionSorts = inaStructure.putNewList("BlendableDimensionSorts");
	var blendableDimensionSortsIterator = blendableDimensionSorts.getIterator();
	while (blendableDimensionSortsIterator.hasNext())
	{
		var dimensionFieldSort = blendableDimensionSortsIterator.next();
		var inaBlendableDimensionSort = oFF.PrStructure.create();
		inaBlendableDimensionSort.putString("FieldName", dimensionFieldSort.getFieldName());
		inaBlendableDimensionSort.putString("DatasetId", dimensionFieldSort.getDatasetId());
		inaBlendableDimensionSort.putInteger("SortDirection", oFF.QInAConverter.lookupSortDirectionInA(dimensionFieldSort.getSortDirection()));
		inaBlendableDimensionSort.putBoolean("PreserveGrouping", dimensionFieldSort.getPreserveGrouping());
		inaBlendableDimensionSort.putString("Locale", dimensionFieldSort.getContextLanguage());
		var customSort = dimensionFieldSort.getCustomSortDefinition();
		if (oFF.notNull(customSort))
		{
			var customSortStructure = inaBlendableDimensionSort.putNewStructure("CustomSort");
			customSortStructure.putString("Name", customSort.getName());
			customSortStructure.putString("DatasetId", customSort.getDatasetId());
			customSortStructure.putString("ID", customSort.getDimensionId());
			customSortStructure.putString("HierarchyId", customSort.getHierarchyId());
			customSortStructure.putString("Id", customSort.getId());
			customSortStructure.putNewList("SortFromStart").addAllStrings(customSort.getSortFromStart());
			customSortStructure.putNewList("SortFromEnd").addAllStrings(customSort.getSortFromEnd());
			customSortStructure.putNewList("SortMovedNodes").addAllStrings(customSort.getMovedNodes());
		}
		inaBlendableDimensionSort.putString("AutoLimiterSort", dimensionFieldSort.getAutoLimiterSort());
		inaBlendableDimensionSort.putBoolean("IsDisplayedAsId", dimensionFieldSort.isDisplayedAsId());
		inaBlendableDimensionSort.putString("ID", dimensionFieldSort.getDimensionId());
		inaBlendableDimensionSorts.add(inaBlendableDimensionSort);
	}
};
oFF.QInARepoBlendableQueryManager.exportMeasureMemberSort = function(inaStructure, blendableMeasureMemberSort)
{
	var inaBlendableMeasureMemberSort = inaStructure.putNewStructure("BlendableMeasureMemberSort");
	inaBlendableMeasureMemberSort.putString("MeasureMemberName", blendableMeasureMemberSort.getMeasureMemberName());
	inaBlendableMeasureMemberSort.putString("DatasetId", blendableMeasureMemberSort.getDatasetId());
	inaBlendableMeasureMemberSort.putBoolean("PrimaryBlendableBlended", blendableMeasureMemberSort.isPrimaryMeasureBlended());
	inaBlendableMeasureMemberSort.putInteger("SortDirection", oFF.QInAConverter.lookupSortDirectionInA(blendableMeasureMemberSort.getSortDirection()));
	inaBlendableMeasureMemberSort.putString("SecondaryMeasureName", blendableMeasureMemberSort.getSecondaryMeasureName());
	inaBlendableMeasureMemberSort.putString("SecondaryDatasetId", blendableMeasureMemberSort.getSecondaryDatasetId());
	inaBlendableMeasureMemberSort.putBoolean("SecondaryMeasureBlended", blendableMeasureMemberSort.isSecondaryMeasureBlended());
	inaBlendableMeasureMemberSort.putString("VersionElementId", blendableMeasureMemberSort.getVersionElementId());
	var versionDimension = blendableMeasureMemberSort.getVersionDimension();
	if (oFF.notNull(versionDimension))
	{
		var inaVersionDimension = inaBlendableMeasureMemberSort.putNewStructure("VersionDimension");
		inaVersionDimension.putString("DatasetId", versionDimension.getQueryModel().getDatasetId());
		inaVersionDimension.putString("Name", versionDimension.getName());
	}
	inaBlendableMeasureMemberSort.putBoolean("PreserveGrouping", blendableMeasureMemberSort.isPreserveGrouping());
};
oFF.QInARepoBlendableQueryManager.exportRankSettingsList = function(inaStructure, blendableQueryManager)
{
	var rankSettingsList = blendableQueryManager.getRankSettings();
	var inaRankSettingsList = inaStructure.putNewList("RankSettings");
	for (var i = 0; i < rankSettingsList.size(); i++)
	{
		oFF.QInARepoBlendableQueryManager.exportRankSettings(inaRankSettingsList.addNewStructure(), rankSettingsList.get(i));
	}
};
oFF.QInARepoBlendableQueryManager.exportRankSettings = function(inaRankSettings, rankSettings)
{
	inaRankSettings.putString("MeasureMemberName", rankSettings.getMeasure());
	inaRankSettings.putString("MeasureMemberDatasetId", rankSettings.getPrimaryMeasureDatasetId());
	inaRankSettings.putBoolean("PrimaryBlendableBlended", rankSettings.isBlendedPrimaryMeasure());
	inaRankSettings.putString("SecondaryMeasureName", rankSettings.getSecondaryMeasure());
	inaRankSettings.putString("SecondaryDatasetId", rankSettings.getSecondaryMeasureDatasetId());
	inaRankSettings.putBoolean("SecondaryMeasureBlended", rankSettings.isBlendedSecondaryMeasure());
	inaRankSettings.putInteger("MaxRows", rankSettings.getMaxRows());
	inaRankSettings.putBoolean("ClientSideRanking", rankSettings.isUseClientSideRanking());
	inaRankSettings.putBoolean("RankOnAllDimensions", rankSettings.isRankOnAllDimensions());
	inaRankSettings.putBoolean("IsApplyRankingsWithoutReset", rankSettings.isApplyRankingsWithoutReset());
	inaRankSettings.putBoolean("PreserveSort", rankSettings.isPreserveSort());
	var inaDimensions = inaRankSettings.putNewList("Dimensions");
	var appliedDimensions = rankSettings.getAppliedDimensions();
	for (var i = 0; i < appliedDimensions.size(); i++)
	{
		var dimension = appliedDimensions.get(i);
		var inaDimension = inaDimensions.addNewStructure();
		inaDimension.putString("DatasetId", dimension.getQueryModel().getDatasetId());
		inaDimension.putString("Name", dimension.getName());
	}
	if (rankSettings.getComparisonOperator() !== null)
	{
		inaRankSettings.putString("Comparison", rankSettings.getComparisonOperator().getName());
	}
	inaRankSettings.putString("VersionElementId", rankSettings.getVersionElementId());
	var versionDimension = rankSettings.getVersionDimension();
	if (oFF.notNull(versionDimension))
	{
		var inaVersionDimension = inaRankSettings.putNewStructure("VersionDimension");
		inaVersionDimension.putString("DatasetId", versionDimension.getQueryModel().getDatasetId());
		inaVersionDimension.putString("Name", versionDimension.getName());
	}
	inaRankSettings.putBoolean("UseDefaultSort", rankSettings.useDefaultSort());
};
oFF.QInARepoBlendableQueryManager.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.BLENDABLE_QUERY_MANAGER;
};
oFF.QInARepoBlendableQueryManager.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var blendableQueryManager = modelComponent;
	var inaPrimaryQueryManager = inaStructure.getStructureByKey("PrimaryQueryManager");
	var primaryDatasetId = inaPrimaryQueryManager.getStringByKey("DatasetId");
	var primaryQueryManager = blendableQueryManager.getPrimaryQueryManager();
	if (oFF.isNull(primaryQueryManager) || !oFF.XString.isEqual(primaryQueryManager.getQueryModel().getDatasetId(), primaryDatasetId))
	{
		primaryQueryManager = null;
		var primarySharedQueryManager = blendableQueryManager.getOlapEnv().getSharedQueryManager(primaryDatasetId);
		if (oFF.notNull(primarySharedQueryManager))
		{
			primaryQueryManager = primarySharedQueryManager.cloneQueryManagerExt(oFF.QueryCloneMode.CURRENT_STATE);
			blendableQueryManager.setPrimaryQueryManager(primaryQueryManager);
			primaryQueryManager.setClientQueryObjectStorageName(blendableQueryManager.getClientQueryObjectStorageName());
		}
	}
	if (oFF.notNull(primaryQueryManager))
	{
		primaryQueryManager.getQueryModel().deserializeFromElementExt(importer.getOriginalMode(), inaPrimaryQueryManager.getStructureByKey("Query"));
	}
	var modelLinkManager = context.getOlapEnv().getModelLinkManager();
	var inaSecondaryQueryManagers = inaStructure.getListByKey("QueryManagers");
	var inaQueryModelLinkSettings = inaStructure.getStructureByKey("QueryModelLinkSettings");
	blendableQueryManager.clearQueryModelLinkSettings();
	if (oFF.notNull(inaSecondaryQueryManagers))
	{
		var inaQueryManagersIter = inaSecondaryQueryManagers.getIterator();
		while (inaQueryManagersIter.hasNext())
		{
			var inaQueryManagerItem = inaQueryManagersIter.next().asStructure();
			var secondaryDatasetId = inaQueryManagerItem.getStringByKey("DatasetId");
			var secondaryQueryManager = blendableQueryManager.getQueryManagerByDatasetId(secondaryDatasetId);
			if (oFF.isNull(secondaryQueryManager))
			{
				var sharedQueryManager = blendableQueryManager.getOlapEnv().getSharedQueryManager(secondaryDatasetId);
				secondaryQueryManager = sharedQueryManager.cloneQueryManagerExt(oFF.QueryCloneMode.CURRENT_STATE);
				blendableQueryManager.addSecondaryQueryManager(secondaryQueryManager);
				secondaryQueryManager.setClientQueryObjectStorageName(blendableQueryManager.getClientQueryObjectStorageName());
			}
			if (modelLinkManager.getDimensionLinksByDatasetIds(blendableQueryManager.getStorageName(), primaryDatasetId, secondaryDatasetId, true).size() > 0)
			{
				secondaryQueryManager.getQueryModel().deserializeFromElementExt(importer.getOriginalMode(), inaQueryManagerItem.getStructureByKey("Query"));
				oFF.QInARepoBlendableQueryManager.importQueryModelLinkSettingStructure(inaQueryModelLinkSettings, blendableQueryManager, secondaryDatasetId);
			}
		}
	}
	blendableQueryManager.clearPrimaryBlendedMeasures();
	var inaBlendedMeasures = inaStructure.getListByKey("PrimaryBlendedMeasures");
	if (oFF.notNull(inaBlendedMeasures))
	{
		var inaBlendedMeasuresIter = inaBlendedMeasures.getIterator();
		while (inaBlendedMeasuresIter.hasNext())
		{
			var inaBlendedMeasure = inaBlendedMeasuresIter.next();
			var memberType = oFF.QInAConverter.lookupMeasureStructureMemberType(inaBlendedMeasure.getStringByKey("MemberType"));
			var member = importer.importComponent(memberType, inaBlendedMeasure, null, blendableQueryManager.getQueryModel().getPrimaryCalculationDimension(), blendableQueryManager.getQueryModel());
			blendableQueryManager.addPrimaryBlendedMeasure(member);
		}
	}
	oFF.QInARepoBlendableQueryManager.importBlendedDimensionInfoAxis(blendableQueryManager, inaStructure.getStructureByKey("DimensionOrder"), oFF.AxisType.ROWS);
	oFF.QInARepoBlendableQueryManager.importBlendedDimensionInfoAxis(blendableQueryManager, inaStructure.getStructureByKey("DimensionOrder"), oFF.AxisType.COLUMNS);
	oFF.QInARepoBlendableQueryManager.importDrillOperations(blendableQueryManager, inaStructure);
	oFF.QInARepoBlendableQueryManager.importSorts(inaStructure, blendableQueryManager);
	oFF.QInARepoBlendableQueryManager.importRankSettingsList(inaStructure, blendableQueryManager);
	blendableQueryManager.setUseEmptyAllMemberMeasureFilter(inaStructure.getBooleanByKey("UseAllMemberFilter"));
	var inaFormulaExceptionsList = inaStructure.getListByKey("FormulaExceptions");
	if (oFF.notNull(inaFormulaExceptionsList))
	{
		for (var j = 0; j < inaFormulaExceptionsList.size(); j++)
		{
			var inaFormulaException = inaFormulaExceptionsList.getStructureAt(j);
			var formulaExceptionQueryManager = blendableQueryManager.getQueryManagerByDatasetId(inaFormulaException.getStringByKey("DatasetId"));
			var formulaException = importer.importFormulaException(inaFormulaException, null, null, formulaExceptionQueryManager.getQueryModel());
			blendableQueryManager.addFormulaException(formulaException);
		}
	}
	blendableQueryManager.setBlendingRestrictionsEnabled(inaStructure.getBooleanByKeyExt("OutOfContextBlendingEnabled", true));
	return null;
};
oFF.QInARepoBlendableQueryManager.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var blendableQueryManager = modelComponent;
	var primaryQueryManager = blendableQueryManager.getPrimaryQueryManager();
	var primaryDatasetId = primaryQueryManager.getQueryModel().getDatasetId();
	inaStructure.putString("Name", blendableQueryManager.getName());
	var inaPrimaryQueryManager = inaStructure.putNewStructure("PrimaryQueryManager");
	inaPrimaryQueryManager.putString("Name", primaryQueryManager.getName());
	inaPrimaryQueryManager.putString("DatasetId", primaryDatasetId);
	inaPrimaryQueryManager.put("Query", primaryQueryManager.getQueryModel().serializeToElement(exporter.getOriginalMode()));
	inaStructure.putString("StorageName", blendableQueryManager.getStorageName());
	var inaSecondaryQueryManagers = inaStructure.putNewList("QueryManagers");
	var inaQueryModelLinkSettings = inaStructure.putNewStructure("QueryModelLinkSettings");
	var secondaryQueryManagersIterator = blendableQueryManager.getSecondaryQueryManagers().getIterator();
	while (secondaryQueryManagersIterator.hasNext())
	{
		var secondaryQueryManager = secondaryQueryManagersIterator.next();
		var secondaryDatasetId = secondaryQueryManager.getQueryModel().getDatasetId();
		var inaQueryManagerItem = inaSecondaryQueryManagers.addNewStructure();
		inaQueryManagerItem.putString("DatasetId", secondaryDatasetId);
		inaQueryManagerItem.putString("Name", secondaryQueryManager.getName());
		inaQueryManagerItem.put("Query", secondaryQueryManager.getQueryModel().serializeToElement(exporter.getOriginalMode()));
		oFF.QInARepoBlendableQueryManager.exportQueryModelLinkSettingStructure(inaQueryModelLinkSettings, blendableQueryManager, primaryDatasetId, secondaryDatasetId);
	}
	var inaBlendedMeasures = inaStructure.putNewList("PrimaryBlendedMeasures");
	var blendedMeasuresIter = blendableQueryManager.getPrimaryBlendedMeasures().getIterator();
	while (blendedMeasuresIter.hasNext())
	{
		var blendedMeasure = blendedMeasuresIter.next();
		exporter.exportComponent(blendedMeasure.getMemberType(), blendedMeasure, inaBlendedMeasures.addNewStructure(), flags);
	}
	var inaDimensionOrderMap = inaStructure.putNewStructure("DimensionOrder");
	oFF.QInARepoBlendableQueryManager.exportBlendedDimensionAxis(blendableQueryManager, inaDimensionOrderMap, oFF.AxisType.ROWS);
	oFF.QInARepoBlendableQueryManager.exportBlendedDimensionAxis(blendableQueryManager, inaDimensionOrderMap, oFF.AxisType.COLUMNS);
	oFF.QInARepoBlendableQueryManager.exportDrillOperations(inaStructure, blendableQueryManager);
	oFF.QInARepoBlendableQueryManager.exportSorts(inaStructure, blendableQueryManager);
	oFF.QInARepoBlendableQueryManager.exportRankSettingsList(inaStructure, blendableQueryManager);
	inaStructure.putBoolean("UseAllMemberFilter", blendableQueryManager.isUseEmptyAllMemberMeasureFilter());
	var formulaExceptions = oFF.PrFactory.createList();
	var formulaExceptionsIter = blendableQueryManager.getFormulaExceptions().getIterator();
	while (formulaExceptionsIter.hasNext())
	{
		var formulaException = formulaExceptionsIter.next();
		var inaException = oFF.PrFactory.createStructure();
		exporter.exportFormulaException(formulaException, inaException);
		inaException.putString("DatasetId", formulaException.getQueryModel().getDatasetId());
		formulaExceptions.add(inaException);
	}
	inaStructure.put("FormulaExceptions", formulaExceptions);
	inaStructure.putBoolean("OutOfContextBlendingEnabled", blendableQueryManager.isBlendingRestrictionsEnabled());
	return inaStructure;
};

oFF.QInARepoCellContext = function() {};
oFF.QInARepoCellContext.prototype = new oFF.QInARepository();
oFF.QInARepoCellContext.prototype._ff_c = "QInARepoCellContext";

oFF.QInARepoCellContext.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.CELL_CONTEXT;
};
oFF.QInARepoCellContext.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var cellContext = null;
	var name = inaStructure.getStringByKey("Name");
	if (oFF.isNull(modelComponent))
	{
		cellContext = oFF.QCellContext._create(context, name, parentComponent);
	}
	else if (modelComponent.getOlapComponentType() === oFF.OlapComponentType.CELL_CONTEXT)
	{
		cellContext = modelComponent;
	}
	cellContext.setRowIndex(inaStructure.getIntegerByKeyExt("Row", -1));
	cellContext.setColumnIndex(inaStructure.getIntegerByKeyExt("Column", -1));
	cellContext.setExternalKeys(inaStructure.getBooleanByKeyExt("ExternalKeys", false));
	cellContext.setComponentsExternal(inaStructure.getBooleanByKeyExt("ComponentsExternal", false));
	cellContext.setComponentsInternal(inaStructure.getBooleanByKeyExt("ComponentsInternal", false));
	var contextPathListIna = inaStructure.getListByKey("CellContextPaths");
	if (!oFF.PrUtils.isListEmpty(contextPathListIna))
	{
		var size = contextPathListIna.size();
		for (var i = 0; i < size; i++)
		{
			var contextPathStructIna = contextPathListIna.getStructureAt(i);
			var axisType = oFF.QInAConverter.lookupAxisType(contextPathStructIna.getStringByKey("Axis"));
			var pathListInA = contextPathStructIna.getListByKey("CellContextMembers");
			var pathSize = pathListInA.size();
			var contextPath = oFF.XList.create();
			for (var j = 0; j < pathSize; j++)
			{
				var pathElementStruct = pathListInA.getStructureAt(j);
				contextPath.add(importer.importDrillPathElement(pathElementStruct, cellContext, context));
			}
			cellContext.setTupleContextForAxis(contextPath, axisType);
		}
	}
	return cellContext;
};
oFF.QInARepoCellContext.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var cellContext = modelComponent;
	var inaStructureLocal = inaStructure;
	if (oFF.isNull(inaStructureLocal))
	{
		inaStructureLocal = oFF.PrFactory.createStructure();
	}
	inaStructureLocal.putString("Name", cellContext.getName());
	if (cellContext.getRowIndex() > -1)
	{
		inaStructureLocal.putInteger("Row", cellContext.getRowIndex());
	}
	if (cellContext.getColumnIndex() > -1)
	{
		inaStructureLocal.putInteger("Column", cellContext.getColumnIndex());
	}
	inaStructureLocal.putBoolean("ExternalKeys", cellContext.isExternalKeys());
	inaStructureLocal.putBoolean("ComponentsExternal", cellContext.isComponentsExternal());
	inaStructureLocal.putBoolean("ComponentsInternal", cellContext.isComponentsInternal());
	var axisContextMap = cellContext.getAxisContexts();
	if (oFF.XCollectionUtils.hasElements(axisContextMap))
	{
		var contextPathList = inaStructureLocal.putNewList("CellContextPaths");
		var keys = axisContextMap.getKeysAsIterator();
		while (keys.hasNext())
		{
			var axisType = keys.next();
			var cellContextPath = axisContextMap.getByKey(axisType);
			if (oFF.XCollectionUtils.hasElements(cellContextPath))
			{
				var contextPathStructure = contextPathList.addNewStructure();
				contextPathStructure.putString("Axis", oFF.QInAConverter.lookupAxisTypeInA(axisType));
				var contextMembersStructure = contextPathStructure.putNewList("CellContextMembers");
				var size = cellContextPath.size();
				for (var i = 0; i < size; i++)
				{
					contextMembersStructure.add(exporter.exportDrillPathElement(cellContextPath.get(i), true));
				}
			}
		}
	}
	return inaStructure;
};

oFF.QInARepoCellContextManager = function() {};
oFF.QInARepoCellContextManager.prototype = new oFF.QInARepository();
oFF.QInARepoCellContextManager.prototype._ff_c = "QInARepoCellContextManager";

oFF.QInARepoCellContextManager.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.CELL_CONTEXT_MANAGER;
};
oFF.QInARepoCellContextManager.prototype.getTagName = function()
{
	return "CellContextRequests";
};
oFF.QInARepoCellContextManager.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	if (oFF.notNull(inaStructure) && inaStructure.containsKey("Elements"))
	{
		var inaList = inaStructure.getListByKey("Elements");
		this.importComponentWithList(importer, inaList, modelComponent, parentComponent, context);
	}
	return modelComponent;
};
oFF.QInARepoCellContextManager.prototype.importComponentWithList = function(importer, inaList, modelComponent, parentComponent, context)
{
	if (modelComponent.getOlapComponentType() === oFF.OlapComponentType.CELL_CONTEXT_MANAGER)
	{
		var cellContextManager = modelComponent;
		var size = inaList.size();
		cellContextManager.clear();
		for (var i = 0; i < size; i++)
		{
			cellContextManager.addCellContext(importer.importCellContext(inaList.getStructureAt(i), cellContextManager, context));
		}
	}
	return modelComponent;
};
oFF.QInARepoCellContextManager.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var inaList = this.exportComponentWithList(exporter, modelComponent, flags);
	if (oFF.notNull(inaList))
	{
		inaStructure.put("Elements", inaList);
	}
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};
oFF.QInARepoCellContextManager.prototype.exportComponentWithList = function(exporter, modelComponent, flags)
{
	var cellContextManager = modelComponent;
	var inaOperationsList = oFF.PrFactory.createList();
	for (var i = 0; i < cellContextManager.size(); i++)
	{
		inaOperationsList.add(exporter.exportCellContext(cellContextManager.get(i)));
	}
	return inaOperationsList;
};

oFF.QInARepoConditionManager = function() {};
oFF.QInARepoConditionManager.prototype = new oFF.QInARepository();
oFF.QInARepoConditionManager.prototype._ff_c = "QInARepoConditionManager";

oFF.QInARepoConditionManager.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.CONDITIONS_MANAGER;
};
oFF.QInARepoConditionManager.prototype.getTagName = function()
{
	return "ConditionsRepo";
};
oFF.QInARepoConditionManager.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	if (oFF.notNull(inaStructure))
	{
		var inaList = inaStructure.getListByKey("Elements");
		this.importComponentWithList(importer, inaList, modelComponent, parentComponent, context);
	}
	return modelComponent;
};
oFF.QInARepoConditionManager.prototype.importComponentWithList = function(importer, inaList, modelComponent, parentComponent, context)
{
	var conditionManager = modelComponent;
	if (oFF.notNull(conditionManager))
	{
		if (!oFF.PrUtils.isListEmpty(inaList))
		{
			var queryModelBase = context.getQueryModel();
			var len = inaList.size();
			for (var i = 0; i < len; i++)
			{
				var inaCurrentCondition = inaList.getStructureAt(i);
				var currentCondition = importer.importCondition(queryModelBase, inaCurrentCondition, null);
				if (oFF.notNull(currentCondition) && !conditionManager.containsKey(currentCondition.getName()))
				{
					conditionManager.add(currentCondition);
				}
			}
			this.removeModelElementsNotInInA(importer, inaList, conditionManager, conditionManager.getValuesAsReadOnlyList());
		}
		else if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA)
		{
			conditionManager.clear();
		}
	}
	return conditionManager;
};
oFF.QInARepoConditionManager.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var inaList = this.exportComponentWithList(exporter, modelComponent, flags);
	if (oFF.notNull(inaList))
	{
		inaStructure.put("Elements", inaList);
	}
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};
oFF.QInARepoConditionManager.prototype.exportComponentWithList = function(exporter, modelComponent, flags)
{
	var inaConditionsList = null;
	var conditionManager = modelComponent;
	if (oFF.notNull(conditionManager))
	{
		var len = conditionManager.size();
		if (len > 0)
		{
			inaConditionsList = oFF.PrFactory.createList();
			for (var i = 0; i < len; i++)
			{
				var condition = conditionManager.get(i);
				if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || condition.isUserCondition() || condition.getModCounter() > 0)
				{
					var inACondition = exporter.exportCondition(condition);
					if (oFF.notNull(inACondition) && !inACondition.isEmpty())
					{
						inaConditionsList.add(inACondition);
					}
				}
			}
			if (inaConditionsList.isEmpty())
			{
				inaConditionsList = null;
			}
		}
	}
	return inaConditionsList;
};

oFF.QInARepoConditionsCondition = function() {};
oFF.QInARepoConditionsCondition.prototype = new oFF.QInARepository();
oFF.QInARepoConditionsCondition.prototype._ff_c = "QInARepoConditionsCondition";

oFF.QInARepoConditionsCondition.exportBreakGroupDimensionList = function(condition)
{
	if (oFF.isNull(condition))
	{
		return null;
	}
	var inaBreakGroupDimensionList = oFF.PrFactory.createList();
	var breakGroupDimensions = condition.getBreakGroupDimensions();
	var len = breakGroupDimensions.size();
	for (var i = 0; i < len; i++)
	{
		inaBreakGroupDimensionList.addString(breakGroupDimensions.get(i).getName());
	}
	return inaBreakGroupDimensionList;
};
oFF.QInARepoConditionsCondition.exportEvaluateOnDimensionsList = function(exporter, condition)
{
	if (oFF.isNull(condition))
	{
		return null;
	}
	var inaEvaluationDimensionList = oFF.PrFactory.createList();
	var evaluationDimensions = condition.getEvaluationDimensions();
	var shouldContinueExporting = exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || evaluationDimensions.getModCounter() > 0;
	if (shouldContinueExporting)
	{
		var len = evaluationDimensions.size();
		for (var i = 0; i < len; i++)
		{
			inaEvaluationDimensionList.addString(evaluationDimensions.get(i).getName());
		}
	}
	return inaEvaluationDimensionList;
};
oFF.QInARepoConditionsCondition.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.CONDITION;
};
oFF.QInARepoConditionsCondition.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var newCondition = null;
	if (oFF.notNull(inaStructure))
	{
		var inACondName = inaStructure.getStringByKey("Name");
		if (oFF.isNull(modelComponent))
		{
			var isBackendCondition = inaStructure.getBooleanByKeyExt("IsBackendCondition", true);
			var conditionManager = parentComponent;
			if (conditionManager.getByKey(inACondName) !== null)
			{
				newCondition = conditionManager.getConditionByName(inACondName);
			}
			else if (this.newComponentCreationAllowed(importer, inaStructure))
			{
				newCondition = oFF.QCondition.create(context, conditionManager, inACondName, isBackendCondition);
			}
		}
		else
		{
			newCondition = modelComponent;
			newCondition.setConditionName(inACondName);
		}
		if (oFF.notNull(newCondition))
		{
			if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || inaStructure.containsKey("Active"))
			{
				newCondition.setActive(inaStructure.getBooleanByKey("Active"));
			}
			newCondition.setUsedState(inaStructure.getStringByKey("IsUsed"));
			if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || inaStructure.containsKey("Description"))
			{
				newCondition.setDescription(inaStructure.getStringByKey("Description"));
			}
			var onDisabled = inaStructure.getStringByKey("OnDisabled");
			if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || inaStructure.containsKey("AfterVisibilityFilter"))
			{
				newCondition.setApplyConditionAfterVisibilityFilter(inaStructure.getBooleanByKeyExt("AfterVisibilityFilter", false));
			}
			if (oFF.notNull(onDisabled))
			{
				if (oFF.XString.isEqual(onDisabled, "Error"))
				{
					newCondition.setOnDisabledToWarning(false);
				}
			}
			if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || inaStructure.containsKey("EvaluateOnDimensions"))
			{
				var inAEvaluateOnDimensionTypeString = inaStructure.getStringByKey("EvaluateOnDimensions");
				var conditionDimensionEvaluationType = oFF.ConditionDimensionEvaluationType.lookupName(inAEvaluateOnDimensionTypeString);
				if (oFF.notNull(conditionDimensionEvaluationType))
				{
					newCondition.setDimensionEvaluationType(conditionDimensionEvaluationType);
				}
			}
			var queryModel = context.getQueryModel();
			var inADimensionList = inaStructure.getListByKey("EvaluateOnDimensionsList");
			var dimSize;
			var idxDim;
			if (!oFF.PrUtils.isListEmpty(inADimensionList) && oFF.notNull(queryModel))
			{
				dimSize = inADimensionList.size();
				newCondition.clearEvaluationDimensions();
				for (idxDim = 0; idxDim < dimSize; idxDim++)
				{
					var inACurrentDimensionName = inADimensionList.getStringAt(idxDim);
					if (oFF.notNull(inACurrentDimensionName))
					{
						var currentDimension = queryModel.getDimensionByNameFromExistingMetadata(inACurrentDimensionName);
						if (oFF.notNull(currentDimension))
						{
							newCondition.addEvaluationDimension(currentDimension);
						}
					}
				}
			}
			var inAThresholds = inaStructure.getListByKey("Threshold");
			if (!oFF.PrUtils.isListEmpty(inAThresholds))
			{
				var thresholdSize = inAThresholds.size();
				newCondition.clearThresholds();
				for (var idxThreshold = 0; idxThreshold < thresholdSize; idxThreshold++)
				{
					var inACurrentThreshold = inAThresholds.getStructureAt(idxThreshold);
					if (oFF.notNull(inACurrentThreshold))
					{
						newCondition.addThreshold(importer.importConditionThreshold(queryModel, inACurrentThreshold, null, newCondition));
					}
				}
			}
			if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || inaStructure.containsKey("BreakGroup"))
			{
				newCondition.setBreakGroup(inaStructure.getBooleanByKeyExt("BreakGroup", false));
			}
			var inABreakDimensionList = inaStructure.getListByKey("BreakGroupList");
			if (!oFF.PrUtils.isListEmpty(inABreakDimensionList) && oFF.notNull(queryModel))
			{
				dimSize = inABreakDimensionList.size();
				for (idxDim = 0; idxDim < dimSize; idxDim++)
				{
					var inACurrentBreakDimensionName = inABreakDimensionList.getStringAt(idxDim);
					if (oFF.notNull(inACurrentBreakDimensionName))
					{
						var currentBreakDimension = queryModel.getDimensionByNameFromExistingMetadata(inACurrentBreakDimensionName);
						if (oFF.notNull(currentBreakDimension))
						{
							newCondition.addBreakGroupDimension(currentBreakDimension);
						}
					}
				}
			}
			if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || inaStructure.containsKey("BreakHierarchy"))
			{
				newCondition.setBreakHierarchy(inaStructure.getBooleanByKeyExt("BreakHierarchy", false));
			}
		}
	}
	return newCondition;
};
oFF.QInARepoConditionsCondition.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var condition = modelComponent;
	if (exporter.mode === oFF.QModelFormat.INA_REPOSITORY_DELTA && condition.isBackendCondition() && condition.hasPropertyChanged(oFF.QConditionProperties.QY_CONDITIONS_ACTIVE))
	{
		inaStructure.putString("Name", condition.getName());
		inaStructure.putBoolean("Active", condition.isActive());
		inaStructure.putBoolean("IsBackendCondition", condition.isBackendCondition());
	}
	if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || condition.isUserCondition())
	{
		var queryModel = condition.getQueryModel();
		var isMds = queryModel.getSystemType().isTypeOf(oFF.SystemType.HANA);
		inaStructure.putBoolean("IsBackendCondition", condition.isBackendCondition());
		if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || condition.hasPropertyChanged(oFF.QConditionProperties.QY_CONDITIONS_ACTIVE))
		{
			inaStructure.putBoolean("Active", condition.isActive());
		}
		if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || condition.hasPropertyChanged(oFF.QConditionProperties.QY_CONDITIONS_AFTER_VISIBILITY_FILTER))
		{
			if (condition.isApplyingConditionAfterVisibilityFilter())
			{
				inaStructure.putBoolean("AfterVisibilityFilter", true);
			}
		}
		if (isMds)
		{
			inaStructure.putStringNotNullAndNotEmpty("Description", condition.getDescription());
		}
		else
		{
			inaStructure.putString("Description", condition.getDescription());
		}
		inaStructure.putString("Name", condition.getName());
		var dimensionEvaluationType = condition.getDimensionEvaluationType();
		if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || condition.hasPropertyChanged(oFF.QConditionProperties.QY_CONDITIONS_EVALUATE_ON_DIMENSIONS))
		{
			inaStructure.putString("EvaluateOnDimensions", dimensionEvaluationType.getName());
		}
		if (dimensionEvaluationType === oFF.ConditionDimensionEvaluationType.GIVEN_LIST)
		{
			var exportEvaluateOnDimensionsList = oFF.QInARepoConditionsCondition.exportEvaluateOnDimensionsList(exporter, condition);
			inaStructure.put("EvaluateOnDimensionsList", exportEvaluateOnDimensionsList);
		}
		var thresholds = condition.getThresholds();
		var shouldContinueExporting = exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || thresholds.getModCounter() > 0;
		if (shouldContinueExporting)
		{
			var thresholdSize = thresholds.size();
			if (thresholdSize > 0)
			{
				var inAThresholdList = oFF.PrFactory.createList();
				for (var i = 0; i < thresholdSize; i++)
				{
					var currentInAThreshold = exporter.exportConditionThreshold(thresholds.get(i));
					if (oFF.notNull(currentInAThreshold))
					{
						inAThresholdList.add(currentInAThreshold);
					}
				}
				if (!inAThresholdList.isEmpty())
				{
					inaStructure.put("Threshold", inAThresholdList);
				}
				else
				{
					return null;
				}
			}
		}
		if (isMds)
		{
			if (oFF.XCollectionUtils.hasElements(queryModel.getPreQueries()) && !condition.getOnDisabledToWarning())
			{
				inaStructure.putString("OnDisabled", "Error");
			}
			var isGroupBreaking = condition.isBreakGroup();
			if (isGroupBreaking)
			{
				if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || condition.hasPropertyChanged(oFF.QConditionProperties.QY_BREAK_GROUP))
				{
					inaStructure.putBoolean("BreakGroup", true);
				}
				var exportBreakGroupDimensionList = oFF.QInARepoConditionsCondition.exportBreakGroupDimensionList(condition);
				inaStructure.put("BreakGroupList", exportBreakGroupDimensionList);
			}
			if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || condition.hasPropertyChanged(oFF.QConditionProperties.QY_CONDITIONS_BREAK_HIERARCHY))
			{
				if (condition.isBreakHierarchy())
				{
					inaStructure.putBoolean("BreakHierarchy", true);
				}
			}
		}
	}
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};

oFF.QInARepoConditionsThreshold = function() {};
oFF.QInARepoConditionsThreshold.prototype = new oFF.QInARepository();
oFF.QInARepoConditionsThreshold.prototype._ff_c = "QInARepoConditionsThreshold";

oFF.QInARepoConditionsThreshold.importSingleMeasureCoordinate = function(queryModelBase, threshold, measureCoordinate)
{
	if (oFF.isNull(threshold) || oFF.isNull(measureCoordinate))
	{
		return;
	}
	var inADimensionName = measureCoordinate.getStringByKey("DimensionName");
	var inAMemberName = measureCoordinate.getStringByKey("MemberName");
	if (oFF.XStringUtils.isNullOrEmpty(inADimensionName) || oFF.XStringUtils.isNullOrEmpty(inAMemberName))
	{
		return;
	}
	var queryModel = queryModelBase;
	if (oFF.isNull(queryModel))
	{
		queryModel = threshold.getContext().getQueryModel();
	}
	if (oFF.notNull(queryModel))
	{
		var dimension = queryModel.getDimensionByNameFromExistingMetadata(inADimensionName);
		if (oFF.notNull(dimension))
		{
			var dimensionMember = dimension.getDimensionMember(inAMemberName);
			if (oFF.isNull(dimensionMember))
			{
				var clientQueryObjectManager = queryModel.getOlapEnv().getClientQueryObjectManager();
				var storageName = queryModel.getQueryManager().getClientQueryObjectStorageName();
				var isPrimaryStructure = dimension === queryModel.getPrimaryCalculationDimension();
				dimensionMember = clientQueryObjectManager.getStructuredMemberIncludeReleased(inAMemberName, storageName, isPrimaryStructure);
			}
			if (oFF.notNull(dimensionMember))
			{
				threshold.addMeasureCoordinate(dimensionMember);
			}
		}
	}
};
oFF.QInARepoConditionsThreshold.importThresholdValue = function(filterBag, inAValue)
{
	if (oFF.isNull(filterBag) || oFF.isNull(inAValue))
	{
		return;
	}
	if (inAValue.isBoolean())
	{
		filterBag.setBoolean(inAValue.getBoolean());
	}
	else if (inAValue.isString())
	{
		filterBag.setString(inAValue.getString());
	}
	else if (inAValue.isDouble())
	{
		filterBag.setDouble(inAValue.getDouble());
	}
	else if (inAValue.isInteger())
	{
		filterBag.setInteger(inAValue.getInteger());
	}
	else if (inAValue.isLong())
	{
		filterBag.setLong(inAValue.getLong());
	}
};
oFF.QInARepoConditionsThreshold.setValue = function(exporter, parameterName, inaElement, value, valueType)
{
	if (valueType === oFF.XValueType.VARIABLE)
	{
		var variableValue = value.getVariableValue();
		if (oFF.notNull(variableValue))
		{
			inaElement.putString(parameterName, variableValue.getName());
			if (oFF.XString.isEqual(parameterName, "Low"))
			{
				inaElement.putString("LowIs", "Variable");
			}
			else if (oFF.XString.isEqual(parameterName, "High"))
			{
				inaElement.putString("HighIs", "Variable");
			}
		}
	}
	else
	{
		oFF.QInAValueUtils.exportPlaceholderValue(exporter, parameterName, inaElement, value, valueType, value.getQueryModel());
	}
};
oFF.QInARepoConditionsThreshold.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.CONDITIONS_THRESHOLD;
};
oFF.QInARepoConditionsThreshold.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var newThreshold = null;
	if (oFF.notNull(inaStructure))
	{
		if (oFF.isNull(modelComponent))
		{
			newThreshold = oFF.QConditionThreshold.create(context, parentComponent);
		}
		else
		{
			newThreshold = modelComponent;
		}
		var inAComparisonOperator = inaStructure.getStringByKey("Comparison");
		var conditionComparisonOperator = oFF.ConditionComparisonOperator.lookupName(inAComparisonOperator);
		if (oFF.notNull(conditionComparisonOperator))
		{
			newThreshold.setComparisonOperator(conditionComparisonOperator);
		}
		var inALow = inaStructure.getByKey("Low");
		oFF.QInARepoConditionsThreshold.importThresholdValue(newThreshold.getLow(), inALow);
		var inALowIs = inaStructure.getByKey("LowIs");
		oFF.QInARepoConditionsThreshold.importThresholdValue(newThreshold.getLowIs(), inALowIs);
		var inAHigh = inaStructure.getByKey("High");
		oFF.QInARepoConditionsThreshold.importThresholdValue(newThreshold.getHigh(), inAHigh);
		var inAHighIs = inaStructure.getByKey("HighIs");
		oFF.QInARepoConditionsThreshold.importThresholdValue(newThreshold.getHighIs(), inAHighIs);
		var inAMeasureCoordinates = inaStructure.getListByKey("MeasureCoordinate");
		if (oFF.notNull(inAMeasureCoordinates))
		{
			var queryModel = context.getQueryModel();
			var len = inAMeasureCoordinates.size();
			for (var i = 0; i < len; i++)
			{
				oFF.QInARepoConditionsThreshold.importSingleMeasureCoordinate(queryModel, newThreshold, inAMeasureCoordinates.getStructureAt(i));
			}
		}
		newThreshold.setLeavesOnly(inaStructure.getBooleanByKeyExt("LeavesOnly", false));
		var inaLevel = inaStructure.getByKey("Level");
		if (oFF.notNull(inaLevel))
		{
			newThreshold.setLevel(oFF.XIntegerValue.create(inaLevel.getInteger()));
		}
	}
	return newThreshold;
};
oFF.QInARepoConditionsThreshold.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var conditionThreshold = modelComponent;
	var measureCoordinates = conditionThreshold.getMeasureCoordinates();
	var inAMeasureCoordinates = oFF.PrFactory.createList();
	var len = measureCoordinates.size();
	if (len === 0)
	{
		return null;
	}
	for (var i = 0; i < len; i++)
	{
		var currentDimensionMember = measureCoordinates.get(i);
		var singleInACoordinate = oFF.PrFactory.createStructure();
		var dimensionName;
		if (!currentDimensionMember.isReleased())
		{
			dimensionName = currentDimensionMember.getDimension().getName();
		}
		else
		{
			if (oFF.XString.isEqual(currentDimensionMember.getStorageGroupName(), oFF.QClientQueryObjectType.SECONDARY_STRUCTURE_MEMBER.getName()))
			{
				dimensionName = conditionThreshold.getQueryModel().getSecondaryCalculationDimension().getName();
			}
			else
			{
				dimensionName = conditionThreshold.getQueryModel().getPrimaryCalculationDimension().getName();
			}
		}
		singleInACoordinate.putString("DimensionName", dimensionName);
		singleInACoordinate.putString("MemberName", currentDimensionMember.getName());
		inAMeasureCoordinates.add(singleInACoordinate);
	}
	if (!inAMeasureCoordinates.isEmpty())
	{
		inaStructure.put("MeasureCoordinate", inAMeasureCoordinates);
	}
	var queryModel = conditionThreshold.getQueryModel();
	var isMds = queryModel.getSystemType().isTypeOf(oFF.SystemType.HANA);
	var lowValue = conditionThreshold.getLow();
	var highValue = conditionThreshold.getHigh();
	if (isMds)
	{
		if (lowValue.getValue() !== null)
		{
			oFF.QInARepoConditionsThreshold.setValue(exporter, "Low", inaStructure, lowValue, oFF.XValueType.INTEGER);
		}
		if (highValue.getValue() !== null)
		{
			oFF.QInARepoConditionsThreshold.setValue(exporter, "High", inaStructure, highValue, oFF.XValueType.INTEGER);
		}
		var level = conditionThreshold.getLevel();
		if (oFF.notNull(level))
		{
			inaStructure.putInteger("Level", level.getInteger());
		}
	}
	else
	{
		if (lowValue.getValue() !== null)
		{
			oFF.QInARepoConditionsThreshold.setValue(exporter, "Low", inaStructure, lowValue, lowValue.getValueType());
		}
		if (highValue.getValue() !== null)
		{
			oFF.QInARepoConditionsThreshold.setValue(exporter, "High", inaStructure, highValue, highValue.getValueType());
		}
		var lowValueIs = conditionThreshold.getLowIs();
		if (lowValueIs.getValue() !== null)
		{
			oFF.QInARepoConditionsThreshold.setValue(exporter, "LowIs", inaStructure, lowValueIs, lowValueIs.getValueType());
		}
		var highValueIs = conditionThreshold.getHighIs();
		if (highValueIs.getValue() !== null)
		{
			oFF.QInARepoConditionsThreshold.setValue(exporter, "HighIs", inaStructure, highValueIs, highValueIs.getValueType());
		}
	}
	var comparisonOperator = conditionThreshold.getComparisonOperator();
	inaStructure.putString("Comparison", comparisonOperator.getName());
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};

oFF.QInARepoCurrencyTranslationItem = function() {};
oFF.QInARepoCurrencyTranslationItem.prototype = new oFF.QInARepository();
oFF.QInARepoCurrencyTranslationItem.prototype._ff_c = "QInARepoCurrencyTranslationItem";

oFF.QInARepoCurrencyTranslationItem.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.CURRENCY_TRANSLATION_ITEM;
};
oFF.QInARepoCurrencyTranslationItem.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var currencyTranslation = modelComponent;
	if (oFF.notNull(currencyTranslation) && oFF.XCollectionUtils.hasElements(inaStructure))
	{
		currencyTranslation.setMetadataDefined(inaStructure.getBooleanByKeyExt("MetadataDefined", false));
		currencyTranslation.setSourceCurrency(this.importSpecificCurrencyTranslationElement(importer, currencyTranslation, oFF.XValueType.STRING, inaStructure.getStructureByKey("SourceCurrency")));
		currencyTranslation.setTargetCurrency(this.importSpecificCurrencyTranslationElement(importer, currencyTranslation, oFF.XValueType.STRING, inaStructure.getStructureByKey("TargetCurrency")));
		currencyTranslation.setErrorHandling(oFF.QInAConverter.lookupCtErrorHandlingMode(inaStructure.getStringByKey("ErrorHandling")));
		if (inaStructure.getBooleanByKeyExt("DefaultCurrency", false))
		{
			currencyTranslation.setDefaultCurrency();
		}
		currencyTranslation.setReferenceDate(this.importSpecificCurrencyTranslationElement(importer, currencyTranslation, oFF.XValueType.DATE, inaStructure.getStructureByKey("ReferenceDate")));
		if (inaStructure.containsKey("ReferenceDate"))
		{
			var inaReferenceDate = inaStructure.getStructureByKey("ReferenceDate");
			if (inaReferenceDate.containsKey("DateOffset") || inaReferenceDate.containsKey("DateOffsetGranularity"))
			{
				var dateOffset = currencyTranslation.getDateOffset();
				if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || inaReferenceDate.containsKey("DateOffset"))
				{
					dateOffset = inaReferenceDate.getIntegerByKey("DateOffset");
				}
				var dateOffsetGranularity = currencyTranslation.getDateOffsetGranularity();
				if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || inaReferenceDate.containsKey("DateOffsetGranularity"))
				{
					dateOffsetGranularity = oFF.DateOffsetGranularity.lookup(inaReferenceDate.getStringByKey("DateOffsetGranularity"));
				}
				if (oFF.notNull(dateOffsetGranularity))
				{
					if (currencyTranslation.getReferenceDateFieldName() !== null)
					{
						currencyTranslation.setReferenceDateByFieldNameOffsetAndGranularity(currencyTranslation.getReferenceDateFieldName(), dateOffset, dateOffsetGranularity);
					}
					else
					{
						currencyTranslation.setDynamicReferenceDateWithOffsetAndGranularity(dateOffset, dateOffsetGranularity);
					}
				}
			}
		}
		currencyTranslation.setRateName(this.importSpecificCurrencyTranslationElement(importer, currencyTranslation, oFF.XValueType.STRING, inaStructure.getStructureByKey("RateName")));
		if (inaStructure.containsKey("RateName"))
		{
			var inaRateName = inaStructure.getStructureByKey("RateName");
			if (inaRateName.hasStringByKey("RateType"))
			{
				currencyTranslation.setFixedRateType(oFF.QInAConverter.lookupRateType(inaRateName.getStringByKey("RateType")));
			}
			if (inaRateName.hasStringByKey("RateVersion"))
			{
				currencyTranslation.setFixedRateVersion(inaRateName.getStringByKey("RateVersion"));
			}
			if (inaRateName.hasStringByKey("Category"))
			{
				currencyTranslation.setFixedCategory(oFF.QInAConverter.lookupCategory(inaRateName.getStringByKey("Category")));
			}
		}
	}
	return modelComponent;
};
oFF.QInARepoCurrencyTranslationItem.prototype.importSpecificCurrencyTranslationElement = function(importer, specificCurrencyTranslationBase, valueType, structure)
{
	var value = null;
	if (oFF.notNull(structure))
	{
		if (structure.containsKey("Fixed"))
		{
			var stringValue = structure.getStringByKey("Fixed");
			if (valueType === oFF.XValueType.STRING)
			{
				value = oFF.QCurrencyLookupValue.createFixedByValue(specificCurrencyTranslationBase, oFF.XStringValue.create(stringValue));
			}
			else if (valueType === oFF.XValueType.DATE)
			{
				value = oFF.QCurrencyLookupValue.createFixedByValue(specificCurrencyTranslationBase, oFF.XDate.createDateSafe(stringValue));
			}
		}
		else if (structure.containsKey("DimensionAttribute"))
		{
			value = oFF.QCurrencyLookupValue.createByFieldName(specificCurrencyTranslationBase, structure.getStringByKey("DimensionAttribute"));
		}
		else if (structure.containsKey("Formula"))
		{
			var formulaItem = oFF.QInARepoMemberFormulaMeasure.importFormulaMeasure(importer, specificCurrencyTranslationBase.getQueryModel().getMeasureDimension(), structure.getStructureByKey("Formula"), null, null);
			value = oFF.QCurrencyLookupValue.createByFormulaItem(specificCurrencyTranslationBase, formulaItem);
		}
		else if (structure.containsKey("Variable"))
		{
			value = oFF.QCurrencyLookupValue.createByVariableName(specificCurrencyTranslationBase, structure.getStringByKey("Variable"));
		}
	}
	return value;
};
oFF.QInARepoCurrencyTranslationItem.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var measureCurrencyTranslation = modelComponent;
	if (oFF.notNull(measureCurrencyTranslation))
	{
		inaStructure.putStringNotNullAndNotEmpty("ErrorHandling", oFF.QInAConverter.lookupCtErrorHandlingModeInA(measureCurrencyTranslation.getErrorHandling()));
		inaStructure.putString("Name", measureCurrencyTranslation.getName());
		inaStructure.putString("Description", measureCurrencyTranslation.getText());
		inaStructure.putBoolean("MetadataDefined", measureCurrencyTranslation.isMetadataDefined());
		if (measureCurrencyTranslation.isDefaultCurrency())
		{
			inaStructure.putBoolean("DefaultCurrency", true);
		}
		var queryModel = measureCurrencyTranslation.getQueryModel();
		this.exportSpecificCurrencyTranslationProperty(exporter, inaStructure, "SourceCurrency", measureCurrencyTranslation.getSourceCurrency(), queryModel);
		this.exportSpecificCurrencyTranslationProperty(exporter, inaStructure, "TargetCurrency", measureCurrencyTranslation.getTargetCurrency(), queryModel);
		this.exportSpecificCurrencyTranslationProperty(exporter, inaStructure, "ReferenceDate", measureCurrencyTranslation.getReferenceDate(), queryModel);
		this.exportReferenceDateOffsets(inaStructure, measureCurrencyTranslation, exporter);
		this.exportSpecificCurrencyTranslationProperty(exporter, inaStructure, "RateName", measureCurrencyTranslation.getRateName(), queryModel);
		this.exportPlanningRateNameSettings(inaStructure, measureCurrencyTranslation, exporter);
	}
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};
oFF.QInARepoCurrencyTranslationItem.prototype.exportPlanningRateNameSettings = function(inaCurrencyTranslation, specificTranslation, exporter)
{
	if ((oFF.CtCategory.isDefined(specificTranslation.getFixedCategory()) || oFF.XStringUtils.isNotNullAndNotEmpty(specificTranslation.getFixedRateVersion()) || oFF.CtRateType.isDefined(specificTranslation.getFixedRateType())))
	{
		var inaRateName;
		if (inaCurrencyTranslation.containsKey("RateName"))
		{
			inaRateName = inaCurrencyTranslation.getStructureByKey("RateName");
		}
		else
		{
			inaRateName = inaCurrencyTranslation.putNewStructure("RateName");
		}
		if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || specificTranslation.hasPropertyChanged(oFF.QCurrencyTranslationProperties.QY_RATE_TYPE))
		{
			inaRateName.putStringNotNullAndNotEmpty("RateType", oFF.QInAConverter.lookupRateTypeInA(specificTranslation.getFixedRateType()));
		}
		inaRateName.putStringNotNullAndNotEmpty("RateVersion", specificTranslation.getFixedRateVersion());
		if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || specificTranslation.hasPropertyChanged(oFF.QCurrencyTranslationProperties.QY_CATEGORY))
		{
			inaRateName.putStringNotNullAndNotEmpty("Category", oFF.QInAConverter.lookupCategoryInA(specificTranslation.getFixedCategory()));
		}
	}
};
oFF.QInARepoCurrencyTranslationItem.prototype.exportReferenceDateOffsets = function(inaCurrencyTranslation, specificTranslation, exporter)
{
	if (specificTranslation.getDateOffsetGranularity() !== null)
	{
		var inaReferenceDate;
		if (inaCurrencyTranslation.containsKey("ReferenceDate"))
		{
			inaReferenceDate = inaCurrencyTranslation.getStructureByKey("ReferenceDate");
		}
		else
		{
			inaReferenceDate = inaCurrencyTranslation.putNewStructure("ReferenceDate");
		}
		if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || specificTranslation.hasPropertyChanged(oFF.QCurrencyTranslationProperties.QY_DATE_OFFSET_GRANULARITY))
		{
			inaReferenceDate.putString("DateOffsetGranularity", specificTranslation.getDateOffsetGranularity().getName());
		}
		if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || specificTranslation.hasPropertyChanged(oFF.QCurrencyTranslationProperties.QY_DATE_OFFSET))
		{
			inaReferenceDate.putInteger("DateOffset", specificTranslation.getDateOffset());
		}
	}
};
oFF.QInARepoCurrencyTranslationItem.prototype.exportSpecificCurrencyTranslationProperty = function(exporter, inaCurrencyTranslation, elementName, lookupValue, queryModel)
{
	if (oFF.notNull(lookupValue))
	{
		if (lookupValue.isFixed())
		{
			inaCurrencyTranslation.putNewStructure(elementName).putString("Fixed", lookupValue.getFixedValue().getStringRepresentation());
		}
		else if (lookupValue.isFieldBased())
		{
			inaCurrencyTranslation.putNewStructure(elementName).putString("DimensionAttribute", lookupValue.getFieldName());
		}
		else if (lookupValue.isFormulaBased())
		{
			var formula = inaCurrencyTranslation.putNewStructure(elementName).putNewStructure("Formula");
			oFF.QInARepoMemberAbstract.exportFormulaItem(exporter, lookupValue.getFormulaItem(), formula, queryModel);
		}
		else if (lookupValue.isVariableBased())
		{
			inaCurrencyTranslation.putNewStructure(elementName).putString("Variable", lookupValue.getVariableName());
		}
	}
};

oFF.QInARepoCurrencyTranslationList = function() {};
oFF.QInARepoCurrencyTranslationList.prototype = new oFF.QInARepository();
oFF.QInARepoCurrencyTranslationList.prototype._ff_c = "QInARepoCurrencyTranslationList";

oFF.QInARepoCurrencyTranslationList.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.CURRENCY_TRANSLATION_LIST;
};
oFF.QInARepoCurrencyTranslationList.prototype.getTagName = function()
{
	return "CurrencyTranslationsRepo";
};
oFF.QInARepoCurrencyTranslationList.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	if (oFF.notNull(inaStructure))
	{
		var inaList = inaStructure.getListByKey("Elements");
		this.importComponentWithList(importer, inaList, modelComponent, parentComponent, context);
	}
	return modelComponent;
};
oFF.QInARepoCurrencyTranslationList.prototype.importComponentWithList = function(importer, inaList, modelComponent, parentComponent, context)
{
	var currencyTranslationManagerBase = context.getQueryModel().getCurrencyTranslationManager();
	if (oFF.notNull(currencyTranslationManagerBase) && oFF.XCollectionUtils.hasElements(inaList))
	{
		var size = inaList.size();
		for (var i = 0; i < size; i++)
		{
			var inaSpecificCurrencyTranslation = inaList.getStructureAt(i);
			var name = inaSpecificCurrencyTranslation.getStringByKey("Name");
			var description = inaSpecificCurrencyTranslation.getStringByKey("Description");
			var currencyTranslation = currencyTranslationManagerBase.getMeasureCurrencyTranslation(name);
			if (oFF.isNull(currencyTranslation))
			{
				currencyTranslation = currencyTranslationManagerBase.addNewMeasureCurrencyTranslationBase(name, description);
			}
			importer.importCurrencyTranslationElement(inaSpecificCurrencyTranslation, currencyTranslation, context);
		}
	}
	return currencyTranslationManagerBase;
};
oFF.QInARepoCurrencyTranslationList.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var inaList = this.exportComponentWithList(exporter, modelComponent, flags);
	inaStructure.put("Elements", inaList);
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};
oFF.QInARepoCurrencyTranslationList.prototype.exportComponentWithList = function(exporter, modelComponent, flags)
{
	var inaCurTransList = null;
	var currencyTranslationManager = modelComponent;
	var specificCurrencyTranslations = currencyTranslationManager.getMeasureCurrencyTranslationsForInaData();
	if (oFF.XCollectionUtils.hasElements(specificCurrencyTranslations))
	{
		inaCurTransList = oFF.PrFactory.createList();
		var size = specificCurrencyTranslations.size();
		for (var i = 0; i < size; i++)
		{
			var specificTranslation = specificCurrencyTranslations.get(i);
			exporter.exportCurrencyTranslationElement(specificTranslation, inaCurTransList.addNewStructure());
		}
	}
	return inaCurTransList;
};

oFF.QInARepoCurrencyTranslationManager = function() {};
oFF.QInARepoCurrencyTranslationManager.prototype = new oFF.QInARepository();
oFF.QInARepoCurrencyTranslationManager.prototype._ff_c = "QInARepoCurrencyTranslationManager";

oFF.QInARepoCurrencyTranslationManager.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.CURRENCY_TRANSLATION_MANAGER;
};
oFF.QInARepoCurrencyTranslationManager.prototype.getTagName = function()
{
	return "CurrencyTranslationRepo";
};
oFF.QInARepoCurrencyTranslationManager.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var currencyTranslationManager = modelComponent;
	if (oFF.notNull(inaStructure) && oFF.notNull(currencyTranslationManager))
	{
		this.importQueryCurrencyTranslation(importer, inaStructure, currencyTranslationManager);
		this.importSpecificCurrencyTranslations(importer, inaStructure, currencyTranslationManager, context);
		this.importDefaultCurrencyTranslation(importer, inaStructure, currencyTranslationManager, context);
	}
	return modelComponent;
};
oFF.QInARepoCurrencyTranslationManager.prototype.importDefaultCurrencyTranslation = function(importer, inaStructure, currencyTranslationManager, context)
{
	var inaCurrencyTranslation = inaStructure.getStructureByKey("Query");
	if (oFF.notNull(inaCurrencyTranslation) && oFF.notNull(currencyTranslationManager))
	{
		var bridge = currencyTranslationManager.getQuery2MeasureCurrencyTranslationBridge();
		if (oFF.notNull(bridge))
		{
			bridge.setCurrencyTranslationName(inaStructure.getStringByKey("CurrencyTranslationName"));
			bridge.setApplyDefinedCurrencyTranslation(inaStructure.getBooleanByKeyExt("Active", false));
			bridge.setApplyToDefaultCurrencyTranslation(inaStructure.getBooleanByKeyExt("CurrencyTranslationApplyToDefault", false));
			importer.importCurrencyTranslationElement(inaCurrencyTranslation, bridge.getMeasureCurrencyTranslation(), context);
		}
	}
};
oFF.QInARepoCurrencyTranslationManager.prototype.importQueryCurrencyTranslation = function(importer, inaStructure, currencyTranslationManager)
{
	var currencyTranslationDetails = currencyTranslationManager.getCurrencyTranslationDetails();
	if (oFF.notNull(currencyTranslationDetails) && inaStructure.hasStringByKey("Name") && inaStructure.hasStringByKey("Operation"))
	{
		var inaCurrencyTranslationName = inaStructure.getStringByKey("Name");
		var inaCurrencyTranslationOperation = inaStructure.getStringByKey("Operation");
		var inaCurrencyTranslationTarget = inaStructure.getStringByKey("Target");
		if (!oFF.XStringUtils.isNullOrEmpty(currencyTranslationDetails.getCurrencyTranslationName()) && currencyTranslationDetails.getCurrencyTranslationOperation() !== null && !oFF.XStringUtils.isNullOrEmpty(currencyTranslationDetails.getCurrencyTranslationOperation().getName()) && (oFF.XStringUtils.isNullOrEmpty(inaCurrencyTranslationName) || oFF.XStringUtils.isNullOrEmpty(inaCurrencyTranslationOperation) || oFF.XStringUtils.isNullOrEmpty(inaCurrencyTranslationTarget)))
		{
			currencyTranslationManager.resetCurrencyTranslationDetails();
		}
		else
		{
			currencyTranslationDetails.setCurrencyTranslationName(inaCurrencyTranslationName);
			currencyTranslationDetails.setCurrencyTranslationOperation(oFF.CurrencyTranslationOperation.lookup(inaCurrencyTranslationOperation));
			currencyTranslationDetails.setCurrencyTranslationTarget(inaCurrencyTranslationTarget);
		}
	}
};
oFF.QInARepoCurrencyTranslationManager.prototype.importSpecificCurrencyTranslations = function(importer, inaStructure, currencyTranslationManager, context)
{
	var inaCurrencyTranslationsList = inaStructure.getListByKey("CurrencyTranslations");
	if (oFF.XCollectionUtils.hasElements(inaCurrencyTranslationsList))
	{
		var size = inaCurrencyTranslationsList.size();
		for (var i = 0; i < size; i++)
		{
			var inaSpecificCurrencyTranslation = inaCurrencyTranslationsList.getStructureAt(i);
			var name = inaSpecificCurrencyTranslation.getStringByKey("Name");
			var description = inaSpecificCurrencyTranslation.getStringByKey("Description");
			var currencyTranslation = currencyTranslationManager.getMeasureCurrencyTranslation(name);
			if (oFF.isNull(currencyTranslation))
			{
				currencyTranslation = currencyTranslationManager.addNewMeasureCurrencyTranslationBase(name, description);
			}
			importer.importCurrencyTranslationElement(inaSpecificCurrencyTranslation, currencyTranslation, context);
		}
	}
};
oFF.QInARepoCurrencyTranslationManager.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var currencyTranslationManager = modelComponent;
	this.exportCurrencyTranslationDetails(inaStructure, currencyTranslationManager);
	this.exportSpecificCurrencyTranslations(exporter, inaStructure, currencyTranslationManager);
	this.exportDefaultCurrencyTranslations(exporter, inaStructure, currencyTranslationManager);
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};
oFF.QInARepoCurrencyTranslationManager.prototype.exportDefaultCurrencyTranslations = function(exporter, inaStructure, currencyTranslationManager)
{
	var bridge = currencyTranslationManager.getQuery2MeasureCurrencyTranslationBridge();
	if (oFF.notNull(bridge))
	{
		var inaCurrencyTranslation = inaStructure.putNewStructure("Query");
		var specificTranslation = bridge.getMeasureCurrencyTranslation();
		exporter.exportCurrencyTranslationElement(specificTranslation, inaCurrencyTranslation);
		inaStructure.putStringNotNullAndNotEmpty("CurrencyTranslationName", bridge.getCurrencyTranslationName());
		inaStructure.putBoolean("Active", bridge.isApplyDefinedCurrencyTranslation());
		if (bridge.isApplyToDefaultCurrencyTranslation())
		{
			inaStructure.putBoolean("CurrencyTranslationApplyToDefault", bridge.isApplyToDefaultCurrencyTranslation());
		}
	}
};
oFF.QInARepoCurrencyTranslationManager.prototype.exportCurrencyTranslationDetails = function(inaStructure, currencyTranslationManager)
{
	if (oFF.isNull(currencyTranslationManager) || !currencyTranslationManager.getModelCapabilities().supportsQueryCurrencyTranslation())
	{
		return;
	}
	var currencyTranslationDetails = currencyTranslationManager.getCurrencyTranslationDetails();
	if (oFF.notNull(currencyTranslationDetails))
	{
		if (oFF.XStringUtils.isNotNullAndNotEmpty(currencyTranslationDetails.getCurrencyTranslationName()))
		{
			if (currencyTranslationDetails.getCurrencyTranslationOperation() === null)
			{
				throw oFF.XException.createIllegalArgumentException("CurrencyTranslation Operation required.");
			}
			inaStructure.putString("Operation", currencyTranslationDetails.getCurrencyTranslationOperation().getName());
			inaStructure.putString("Name", currencyTranslationDetails.getCurrencyTranslationName());
			if (currencyTranslationDetails.getCurrencyTranslationOperation() === oFF.CurrencyTranslationOperation.BOTH || currencyTranslationDetails.getCurrencyTranslationOperation() === oFF.CurrencyTranslationOperation.TARGET)
			{
				if (currencyTranslationDetails.getCurrencyTranslationTarget() === null)
				{
					throw oFF.XException.createIllegalArgumentException("CurrencyTranslation Target Currency required.");
				}
			}
			inaStructure.putString("Target", currencyTranslationDetails.getCurrencyTranslationTarget());
		}
		else
		{
			inaStructure.putString("Operation", "");
			inaStructure.putString("Name", "");
			inaStructure.putString("Target", "");
		}
	}
};
oFF.QInARepoCurrencyTranslationManager.prototype.exportSpecificCurrencyTranslations = function(exporter, inaStructure, currencyTranslationManager)
{
	if (oFF.isNull(currencyTranslationManager) || !currencyTranslationManager.getModelCapabilities().supportsCurrencyTranslation())
	{
		return;
	}
	var specificCurrencyTranslations = currencyTranslationManager.getMeasureCurrencyTranslations();
	if (oFF.XCollectionUtils.hasElements(specificCurrencyTranslations))
	{
		var currencyTranslations = inaStructure.putNewList("CurrencyTranslations");
		var size = specificCurrencyTranslations.size();
		for (var i = 0; i < size; i++)
		{
			var specificTranslation = specificCurrencyTranslations.get(i);
			exporter.exportCurrencyTranslationElement(specificTranslation, currencyTranslations.addNewStructure());
		}
	}
};

oFF.QInARepoDataCell = function() {};
oFF.QInARepoDataCell.prototype = new oFF.QInARepository();
oFF.QInARepoDataCell.prototype._ff_c = "QInARepoDataCell";

oFF.QInARepoDataCell.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.DATA_CELL;
};
oFF.QInARepoDataCell.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var queryModel = context.getQueryModel();
	var queryDataCellList = queryModel.getQueryDataCellsBase();
	var dataCell = this.getDataCellFromExistingList(queryModel, inaStructure);
	var createdNew = false;
	if (oFF.isNull(dataCell))
	{
		dataCell = queryDataCellList.newQueryDataCell(this.getDataCellName(inaStructure, queryModel));
		createdNew = true;
	}
	if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || inaStructure.containsKey("SignReversal"))
	{
		dataCell.setSignReversal(inaStructure.getBooleanByKeyExt("SignReversal", false));
	}
	if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || inaStructure.containsKey("Emphasized"))
	{
		dataCell.setEmphasized(inaStructure.getBooleanByKeyExt("Emphasized", false));
	}
	if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || inaStructure.containsKey("Cumulation"))
	{
		dataCell.setCumulation(inaStructure.getBooleanByKeyExt("Cumulation", false));
	}
	dataCell.setInputEnabled(inaStructure.getBooleanByKeyExt("InputEnabled", false));
	if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || inaStructure.containsKey("DisaggregationMode"))
	{
		dataCell.setDisaggregationMode(oFF.DisaggregationMode.lookupWithDefault(inaStructure.getStringByKeyExt("DisaggregationMode", null), oFF.DisaggregationMode.NONE));
	}
	if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || inaStructure.containsKey("DisaggregationReferenceCellName"))
	{
		dataCell.setDisaggregationRefCellName(inaStructure.getStringByKeyExt("DisaggregationReferenceCellName", null));
	}
	if ((createdNew || queryModel.isBasicMeasureSettingsExportedInRepo()) && (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || inaStructure.containsKey("ScalingFactor")))
	{
		dataCell.setScalingFactor(inaStructure.getIntegerByKeyExt("ScalingFactor", 1));
	}
	if ((createdNew || queryModel.isBasicMeasureSettingsExportedInRepo()) && (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || inaStructure.containsKey("Decimals")))
	{
		dataCell.setDecimalPlaces(inaStructure.getIntegerByKeyExt("Decimals", 0));
	}
	var inaBaseValueType = inaStructure.getIntegerByKeyExt("CellValueType", 0);
	var cellValueType = oFF.QInAConverter.lookupValueTypeByInt(inaBaseValueType);
	dataCell.setBaseCellValueType(cellValueType);
	if (cellValueType === oFF.XValueType.DIMENSION_MEMBER)
	{
		var dimensionReferenceName = inaStructure.getStringByKey("CellDimensionReference");
		dataCell.setDimensionReference(queryModel.getDimensions().getByKey(dimensionReferenceName));
	}
	var inaMemberReferences = inaStructure.getListByKey("DimensionMemberReferences");
	if (oFF.notNull(inaMemberReferences))
	{
		for (var k = 0; k < inaMemberReferences.size(); k++)
		{
			var memberReference = inaMemberReferences.getStringAt(k);
			if (!dataCell.hasMeasureReference(memberReference))
			{
				dataCell.addDimensionMemberReference(memberReference);
			}
		}
	}
	if (importer.getOriginalMode() !== oFF.QModelFormat.INA_CLONE && !dataCell.hasAnyMemberReferencesSet())
	{
		queryDataCellList.removeElement(dataCell);
	}
	if (inaStructure.hasStringByKey("SemanticObject"))
	{
		dataCell.setSemanticObject(inaStructure.getStringByKey("SemanticObject"));
	}
	if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || inaStructure.hasStringByKey("CurrencyPresentation"))
	{
		dataCell.setCurrencyPresentation(oFF.QInAConverter.lookupCurrencyPresentation(inaStructure.getStringByKey("CurrencyPresentation")));
	}
	if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || inaStructure.hasStringByKey("ScaleAndUnitPlacement"))
	{
		dataCell.setScaleAndUnitPlacement(oFF.QInAConverter.lookupScaleAndUnitPlacement(inaStructure.getStringByKey("ScaleAndUnitPlacement")));
	}
	if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || inaStructure.hasStringByKey("ScaleFormat"))
	{
		dataCell.setScaleFormat(oFF.QInAConverter.lookupScaleFormat(inaStructure.getStringByKey("ScaleFormat")));
	}
	if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || inaStructure.hasStringByKey("SignPresentation"))
	{
		dataCell.setSignPresentation(oFF.QInAConverter.lookupSignPresentation(inaStructure.getStringByKey("SignPresentation")));
	}
	return dataCell;
};
oFF.QInARepoDataCell.prototype.getDataCellFromExistingList = function(queryModel, inaStructure)
{
	var inaName = inaStructure.getStringByKey("Name");
	var inaMemberReferences = inaStructure.getListByKey("DimensionMemberReferences");
	var queryDataCells = queryModel.getQueryDataCellsBase();
	if (oFF.XCollectionUtils.hasElements(inaMemberReferences))
	{
		var member1 = inaMemberReferences.getStringAt(0);
		var member2 = inaMemberReferences.size() > 1 ? inaMemberReferences.getStringAt(1) : null;
		var member2Exists = oFF.XStringUtils.isNotNullAndNotEmpty(member2);
		return oFF.XCollectionUtils.findFirst(queryDataCells,  function(cell){
			return cell.hasMeasureReference(member1) && (member2Exists && cell.hasMeasureReference(member2) || !member2Exists && cell.getReferenceStructureElement2() === null);
		}.bind(this));
	}
	else if (oFF.XStringUtils.isNotNullAndNotEmpty(inaName))
	{
		var cellByName = queryDataCells.getByKey(inaName);
		if (oFF.notNull(cellByName) && cellByName.getReferenceStructureElement1() === null && cellByName.getReferenceStructureElement2() === null)
		{
			return cellByName;
		}
	}
	return null;
};
oFF.QInARepoDataCell.prototype.getDataCellName = function(inaStructure, queryModel)
{
	var name = inaStructure.getStringByKey("Name");
	var queryDataCells = queryModel.getQueryDataCells();
	if (queryDataCells.containsKey(name))
	{
		var i = queryDataCells.size();
		while (queryDataCells.containsKey(oFF.XInteger.convertToString(i)))
		{
			i++;
		}
		name = oFF.XInteger.convertToString(i);
	}
	return name;
};
oFF.QInARepoDataCell.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var dataCell = modelComponent;
	inaStructure.putString("Name", dataCell.getName());
	if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || dataCell.hasPropertyChanged(oFF.QDataCellProperties.QY_DISAGGREGATION_MODE))
	{
		var disaggregationMode = dataCell.getDisaggregationMode();
		oFF.QInAExportUtil.setNameIfNotNull(inaStructure, "DisaggregationMode", oFF.isNull(disaggregationMode) ? oFF.DisaggregationMode.NONE : disaggregationMode);
	}
	if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || dataCell.hasPropertyChanged(oFF.QDataCellProperties.QY_DISAGGREGATION_REF_CELL_NAME))
	{
		var referenceDataCell = dataCell.getDisaggregationRefCell();
		inaStructure.putString("DisaggregationReferenceCellName", oFF.isNull(referenceDataCell) ? "0" : referenceDataCell.getName());
	}
	if (oFF.XStringUtils.isNullOrEmpty(dataCell.getName()) || exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || dataCell.hasPropertyChanged(oFF.QDataCellProperties.QY_SCALING_FACTOR))
	{
		inaStructure.putInteger("ScalingFactor", dataCell.getScalingFactor());
	}
	if (oFF.XStringUtils.isNullOrEmpty(dataCell.getName()) || exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || dataCell.hasPropertyChanged(oFF.QDataCellProperties.QY_DECIMAL_PLACES))
	{
		inaStructure.putInteger("Decimals", dataCell.getDecimalPlaces());
	}
	if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || dataCell.hasPropertyChanged(oFF.QDataCellProperties.QY_SIGN_REVERSAL))
	{
		inaStructure.putBoolean("SignReversal", dataCell.hasSignReversal());
	}
	if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || dataCell.hasPropertyChanged(oFF.QDataCellProperties.QY_EMPHASIZED))
	{
		inaStructure.putBoolean("Emphasized", dataCell.isEmphasized());
	}
	if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || dataCell.hasPropertyChanged(oFF.QDataCellProperties.QY_CUMULATION))
	{
		inaStructure.putBoolean("Cumulation", dataCell.isCumulated());
	}
	if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || dataCell.hasPropertyChanged(oFF.QDataCellProperties.QY_CURRENCY_PRESENTATION))
	{
		inaStructure.putStringNotNullAndNotEmpty("CurrencyPresentation", oFF.QInAConverter.lookupCurrencyPresentationInA(dataCell.getCurrencyPresentation()));
	}
	if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || dataCell.hasPropertyChanged(oFF.QDataCellProperties.QY_SCALE_AND_UNIT_PLACEMENT))
	{
		inaStructure.putStringNotNullAndNotEmpty("ScaleAndUnitPlacement", oFF.QInAConverter.lookupScaleAndUnitPlacementInA(dataCell.getScaleAndUnitPlacement()));
	}
	if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || dataCell.hasPropertyChanged(oFF.QDataCellProperties.QY_SCALE_FORMAT))
	{
		inaStructure.putStringNotNullAndNotEmpty("ScaleFormat", oFF.QInAConverter.lookupScaleFormatInA(dataCell.getScaleFormat()));
	}
	if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || dataCell.hasPropertyChanged(oFF.QDataCellProperties.QY_SIGN_PRESENTATION))
	{
		inaStructure.putStringNotNullAndNotEmpty("SignPresentation", oFF.QInAConverter.lookupSignPresentationInA(dataCell.getSignPresentation()));
	}
	var baseValueType = dataCell.getBaseValueType();
	var inaBaseValueType = oFF.QInAConverter.lookupIntByValueType(baseValueType);
	inaStructure.putInteger("CellValueType", inaBaseValueType);
	var inaMemberReferences = inaStructure.putNewList("DimensionMemberReferences");
	var referenceStructureElement = dataCell.getReferenceStructureElement1();
	if (oFF.notNull(referenceStructureElement))
	{
		inaMemberReferences.addString(referenceStructureElement.getName());
		referenceStructureElement = dataCell.getReferenceStructureElement2();
		if (oFF.notNull(referenceStructureElement))
		{
			inaMemberReferences.addString(referenceStructureElement.getName());
		}
	}
	inaStructure.putStringNotNullAndNotEmpty("SemanticObject", dataCell.getSemanticObject());
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};

oFF.QInARepoDataCellsAll = function() {};
oFF.QInARepoDataCellsAll.prototype = new oFF.QInARepository();
oFF.QInARepoDataCellsAll.prototype._ff_c = "QInARepoDataCellsAll";

oFF.QInARepoDataCellsAll.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.DATA_CELLS;
};
oFF.QInARepoDataCellsAll.prototype.getTagName = function()
{
	return "QueryDataCellsRepo";
};
oFF.QInARepoDataCellsAll.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	if (oFF.notNull(inaStructure))
	{
		var inaList = inaStructure.getListByKey("Elements");
		this.importComponentWithList(importer, inaList, modelComponent, parentComponent, context);
	}
	return modelComponent;
};
oFF.QInARepoDataCellsAll.prototype.importComponentWithList = function(importer, inaList, modelComponent, parentComponent, context)
{
	var capabilities = context.getModelCapabilities();
	var queryModel = context.getQueryModel();
	if (capabilities.supportsDataCells() && queryModel.getQueryManager().getInitSettings().isRequestingDataCells())
	{
		if (oFF.notNull(inaList))
		{
			for (var i = 0; i < inaList.size(); i++)
			{
				importer.importDataCell(inaList.getStructureAt(i), queryModel);
			}
		}
	}
	return null;
};
oFF.QInARepoDataCellsAll.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var inaList = this.exportComponentWithList(exporter, modelComponent, flags);
	if (oFF.notNull(inaList))
	{
		inaStructure.put("Elements", inaList);
	}
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};
oFF.QInARepoDataCellsAll.prototype.exportComponentWithList = function(exporter, modelComponent, flags)
{
	var queryModel = modelComponent;
	var inaQueryDataCellList = null;
	var capabilities = queryModel.getModelCapabilities();
	if (capabilities.supportsDataCells() && queryModel.getQueryManager().getInitSettings().isRequestingDataCells())
	{
		var queryDataCells = queryModel.getQueryDataCells();
		inaQueryDataCellList = oFF.PrFactory.createList();
		var size = queryDataCells.size();
		for (var i = 0; i < size; i++)
		{
			var queryDataCell = queryDataCells.get(i);
			var shouldContinueExporting = exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || queryDataCell.isUserAddedDataCell() || queryDataCell.getModCounter() > 0;
			if (shouldContinueExporting)
			{
				var cellStructure = exporter.exportDataCell(queryDataCell, null);
				inaQueryDataCellList.add(cellStructure);
			}
		}
	}
	return inaQueryDataCellList;
};

oFF.QInARepoDataSource = function() {};
oFF.QInARepoDataSource.prototype = new oFF.QInARepository();
oFF.QInARepoDataSource.prototype._ff_c = "QInARepoDataSource";

oFF.QInARepoDataSource.importQd = function(importer, inaParent, name, context)
{
	var dataSource = null;
	var inaStructure = inaParent;
	if (oFF.notNull(name))
	{
		if (oFF.notNull(inaStructure) && !inaStructure.containsKey(name))
		{
			inaStructure = inaStructure.getStructureByKey("Analytics");
			if (oFF.notNull(inaStructure) && !inaStructure.containsKey(name))
			{
				inaStructure = inaStructure.getStructureByKey("Definition");
			}
		}
		if (oFF.notNull(inaStructure) && inaStructure.containsKey(name))
		{
			var type = inaStructure.getElementTypeByKey(name);
			if (type === oFF.PrElementType.STRING)
			{
				dataSource = oFF.QFactory.createDataSourceWithType(oFF.MetaObjectType.INFOPROVIDER, inaStructure.getStringByKey(name));
			}
			else if (type === oFF.PrElementType.STRUCTURE)
			{
				inaStructure = inaStructure.getStructureByKey(name);
			}
		}
		else if (oFF.notNull(inaStructure) && !inaStructure.containsKey(name))
		{
			inaStructure = null;
		}
	}
	if (oFF.isNull(dataSource) && oFF.notNull(inaStructure))
	{
		dataSource = oFF.QFactory.createDataSource();
		oFF.QInARepoDataSource.importDs2(importer, inaStructure, context, dataSource);
		var validationHash = inaParent.getStringByKey("ValidationHash");
		if (oFF.isNull(validationHash))
		{
			validationHash = inaStructure.getStringByKey("ValidationHash");
		}
		dataSource.setValidationHash(validationHash);
		var genericServiceDescription = inaParent.getStructureByKey("GenericServiceDescription");
		if (oFF.notNull(genericServiceDescription))
		{
			dataSource.setGenericServiceDescription(genericServiceDescription);
		}
	}
	return dataSource;
};
oFF.QInARepoDataSource.importDs2 = function(importer, inaStructure, context, dataSource)
{
	var systemName = inaStructure.getStringByKey("System");
	if (oFF.notNull(systemName))
	{
		dataSource.setSystemName(systemName);
	}
	var typeValue = inaStructure.getStringByKey("Type");
	var metaObjectType = null;
	if (oFF.notNull(typeValue))
	{
		typeValue = oFF.XString.toLowerCase(typeValue);
		metaObjectType = oFF.MetaObjectType.lookup(typeValue);
	}
	if (oFF.isNull(metaObjectType))
	{
		metaObjectType = oFF.MetaObjectType.DBVIEW;
	}
	dataSource.setType(metaObjectType);
	oFF.QInARepoDataSourceProperties.importQd(dataSource, inaStructure);
	if (metaObjectType === oFF.MetaObjectType.MULTI_SOURCE || metaObjectType === oFF.MetaObjectType.BLENDING)
	{
		var sources = oFF.PrUtils.getListProperty(inaStructure, "Sources");
		if (oFF.notNull(sources))
		{
			var multiSources = dataSource.getMultiSourcesBase();
			var sourceSize = sources.size();
			for (var i = 0; i < sourceSize; i++)
			{
				var sourceStructure = oFF.PrUtils.getStructureElement(sources, i);
				var multiSource = oFF.QFactory.createDataSource();
				oFF.QInARepoDataSource.importDs2(importer, sourceStructure, context, multiSource);
				multiSources.add(multiSource);
			}
		}
		var mappings = oFF.PrUtils.getListProperty(inaStructure, "Mappings");
		dataSource.setMappings(mappings);
	}
	oFF.QInARepoDataSourceExtDims.importQd(importer, dataSource, inaStructure);
	var validationHash = inaStructure.getStringByKey("ValidationHash");
	dataSource.setValidationHash(validationHash);
	var genericServiceDescription = inaStructure.getStructureByKey("GenericServiceDescription");
	if (oFF.notNull(genericServiceDescription))
	{
		dataSource.setGenericServiceDescription(genericServiceDescription);
	}
	return dataSource;
};
oFF.QInARepoDataSource.exportDataSource = function(exporter, dataSource, withRunAsUser, inaQueryModel)
{
	var inaDataSource = oFF.PrFactory.createStructure();
	var type = dataSource.getType();
	if (oFF.notNull(type))
	{
		inaDataSource.putString("Type", type.getCamelCaseName());
		var systemName = dataSource.getSystemName();
		if (oFF.notNull(systemName))
		{
			inaDataSource.putString("System", systemName);
		}
		var sources;
		if (type === oFF.MetaObjectType.MULTI_SOURCE)
		{
			sources = inaDataSource.putNewList("Sources");
			var multiSources = dataSource.getMultiSources();
			var multiSourcesSize = multiSources.size();
			for (var i = 0; i < multiSourcesSize; i++)
			{
				var multiSource = multiSources.get(i);
				var source = oFF.QInARepoDataSource.exportDataSource(exporter, multiSource, withRunAsUser, null);
				sources.add(source);
			}
			inaDataSource.put("Mappings", dataSource.getMappings());
		}
		else if (type === oFF.MetaObjectType.BLENDING)
		{
			var blendingDefinition = dataSource.getBlendingDefinition();
			if (oFF.notNull(blendingDefinition))
			{
				sources = oFF.QInARepoDataSourceBlending.exportBlendingSources(exporter.getMode(), blendingDefinition, true);
				inaDataSource.put("Sources", sources);
				var exportBlendingMappings = oFF.QInARepoDataSourceBlending.exportBlendingMappings(blendingDefinition.getMappings());
				inaDataSource.put("Mappings", exportBlendingMappings);
			}
		}
		var genericServiceDescription = dataSource.getGenericServiceDescription();
		if (oFF.notNull(genericServiceDescription))
		{
			inaDataSource.put("GenericServiceDescription", genericServiceDescription);
		}
	}
	oFF.QInARepoDataSourceProperties.exportQd(exporter, dataSource, inaDataSource, withRunAsUser);
	oFF.QInARepoDataSourceExtDims.exportQd(exporter, dataSource, inaDataSource);
	if (oFF.notNull(inaQueryModel))
	{
		inaQueryModel.put("DataSource", inaDataSource);
	}
	return inaDataSource;
};
oFF.QInARepoDataSource.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.DATA_SOURCE;
};
oFF.QInARepoDataSource.prototype.getTagName = function()
{
	return "DataSource";
};
oFF.QInARepoDataSource.prototype.newModelComponent = function(application, olapEnv, parentComponent, context)
{
	return oFF.QFactory.createDataSource();
};
oFF.QInARepoDataSource.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	return oFF.QInARepoDataSource.importDs2(importer, inaStructure, context, modelComponent);
};
oFF.QInARepoDataSource.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var withRunAsUser = oFF.XMath.binaryAnd(flags, oFF.QImExFlag.RUN_AS_USER) > 0;
	return oFF.QInARepoDataSource.exportDataSource(exporter, modelComponent, withRunAsUser, null);
};

oFF.QInARepoDimension = function() {};
oFF.QInARepoDimension.prototype = new oFF.QInARepository();
oFF.QInARepoDimension.prototype._ff_c = "QInARepoDimension";

oFF.QInARepoDimension.importRsAttributeNodes = function(importer, inaDimension, dimension)
{
	var inaResultSetAttributes = inaDimension.getListByKey("ResultSetAttributeNodes");
	var inaRsAttributeFields = inaDimension.getListByKey("ResultSetAttributeFields");
	var queryModelBase = dimension.getQueryModelBase();
	var requestingMinimizedAttributes = queryModelBase.getQueryManagerBase().getInitSettings().isRequestingMinimizedAttributes();
	if (oFF.notNull(inaResultSetAttributes))
	{
		var resultSetAttributes = dimension.getResultSetAttributes();
		resultSetAttributes.clear();
		var attributeSize = inaResultSetAttributes.size();
		for (var idxAttribute = 0; idxAttribute < attributeSize; idxAttribute++)
		{
			var attributeName = inaResultSetAttributes.getStringAt(idxAttribute);
			var attribute = dimension.getAttributeByName(attributeName);
			if (oFF.notNull(attribute))
			{
				resultSetAttributes.add(attribute);
				oFF.QInARepoDimension.importRsFieldsForAttribute(importer, attribute, inaRsAttributeFields, idxAttribute);
			}
			else if (requestingMinimizedAttributes && importer.getMessage(oFF.Severity.WARNING, oFF.ErrorCodes.ATTRIBUTE_NOT_FOUND) === null)
			{
				importer.addWarning(oFF.ErrorCodes.ATTRIBUTE_NOT_FOUND, "Some attributes saved in the Story no more exist in the Query");
			}
		}
	}
};
oFF.QInARepoDimension.importRsFieldsForAttribute = function(importer, attribute, inaRsAttributeFields, idxAttribute)
{
	if (oFF.isNull(inaRsAttributeFields) || inaRsAttributeFields.size() <= idxAttribute)
	{
		return;
	}
	var inaRsFields = inaRsAttributeFields.getListAt(idxAttribute);
	var attibuteRsFields = attribute.getResultSetFields();
	attibuteRsFields.clear();
	var rsSize = inaRsFields.size();
	var queryModelBase = attribute.getDimension().getQueryModelBase();
	var requestingMinimizedAttributes = queryModelBase.getQueryManagerBase().getInitSettings().isRequestingMinimizedAttributes();
	for (var idxAttributeField = 0; idxAttributeField < rsSize; idxAttributeField++)
	{
		var attributeRsFieldName;
		var obtainabilityType = null;
		if (inaRsFields.getElementTypeAt(idxAttributeField) === oFF.PrElementType.STRING)
		{
			attributeRsFieldName = inaRsFields.getStringAt(idxAttributeField);
		}
		else
		{
			attributeRsFieldName = inaRsFields.getStructureAt(idxAttributeField).getStringByKey("Name");
			var obtainabilityString = inaRsFields.getStructureAt(idxAttributeField).getStringByKey("Obtainability");
			if (oFF.XStringUtils.isNotNullAndNotEmpty(obtainabilityString))
			{
				obtainabilityType = oFF.ObtainabilityType.lookup(obtainabilityString);
			}
		}
		var rsField = attribute.getFieldByName(attributeRsFieldName);
		if (oFF.isNull(rsField))
		{
			rsField = attribute.getDimension().getFieldByName(attributeRsFieldName);
		}
		attibuteRsFields.add(rsField);
		if (oFF.notNull(obtainabilityType))
		{
			rsField.setObtainability(obtainabilityType);
		}
		if (oFF.isNull(rsField) && requestingMinimizedAttributes && importer.getMessage(oFF.Severity.WARNING, oFF.ErrorCodes.ATTRIBUTE_NOT_FOUND) === null)
		{
			importer.addWarning(oFF.ErrorCodes.ATTRIBUTE_NOT_FOUND, "Some attributes saved in the Story no more exist in the Query");
		}
	}
};
oFF.QInARepoDimension.importRsFields = function(importer, inaDimension, dimension)
{
	var inaResultSetFields = inaDimension.getListByKey("ResultSetFields");
	if (oFF.notNull(inaResultSetFields))
	{
		var queryModelBase = dimension.getQueryModelBase();
		var requestingMinimizedAttributes = queryModelBase.getQueryManagerBase().getInitSettings().isRequestingMinimizedAttributes();
		var resultSetFields = dimension.getResultSetFields();
		resultSetFields.clear();
		var fieldSize = inaResultSetFields.size();
		for (var idxField = 0; idxField < fieldSize; idxField++)
		{
			var fieldName;
			var obtainabilityType = null;
			if (inaResultSetFields.getElementTypeAt(idxField) === oFF.PrElementType.STRING)
			{
				fieldName = inaResultSetFields.getStringAt(idxField);
			}
			else
			{
				fieldName = inaResultSetFields.getStructureAt(idxField).getStringByKey("Name");
				var obtainabilityString = inaResultSetFields.getStructureAt(idxField).getStringByKey("Obtainability");
				if (oFF.XStringUtils.isNotNullAndNotEmpty(obtainabilityString))
				{
					obtainabilityType = oFF.ObtainabilityType.lookup(obtainabilityString);
				}
			}
			var field = dimension.getFieldByName(fieldName);
			if (oFF.notNull(field))
			{
				resultSetFields.add(field);
				if (oFF.notNull(obtainabilityType))
				{
					field.setObtainability(obtainabilityType);
				}
			}
			else if (requestingMinimizedAttributes && importer.getMessage(oFF.Severity.WARNING, oFF.ErrorCodes.ATTRIBUTE_NOT_FOUND) === null)
			{
				importer.addWarning(oFF.ErrorCodes.ATTRIBUTE_NOT_FOUND, "Some attributes saved in the Story no more exist in the Query");
			}
		}
	}
};
oFF.QInARepoDimension.exportListOfFields = function(fields, inaFields, exporter)
{
	var fieldsSize = fields.size();
	for (var i = 0; i < fieldsSize; i++)
	{
		var field = fields.get(i);
		if (field.getTextTransformation() === null && field.getDimension().getDimensionType() !== oFF.DimensionType.FORMULA_CALCULATED_DIMENSION)
		{
			continue;
		}
		inaFields.add(exporter.exportComponent(oFF.OlapComponentType.FIELD, field, null, oFF.QImExFlag.DEFAULT_ALL));
	}
};
oFF.QInARepoDimension.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.ABSTRACT_DIMENSION;
};
oFF.QInARepoDimension.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var queryModel = context.getQueryModel();
	var dimension = modelComponent;
	var dimName = inaStructure.getStringByKey("Name");
	if (oFF.isNull(dimension))
	{
		if (oFF.notNull(queryModel))
		{
			if (oFF.isNull(dimName) && inaStructure.getBooleanByKeyExt("MeasureStructure", false))
			{
				var measureDimension = queryModel.getMeasureDimension();
				if (oFF.notNull(measureDimension))
				{
					dimName = measureDimension.getName();
				}
			}
			dimension = queryModel.getDimensionManagerBase().getDimensionByNameInternal(dimName);
			var skipMetadataValidationOnRepoImport = inaStructure.getBooleanByKeyExt("SkipMetadataValidationOnRepoImport", false);
			if (oFF.isNull(dimension) && skipMetadataValidationOnRepoImport)
			{
				dimension = this.addNewDimensionWithDummyMetadata(importer, context, queryModel, dimName);
			}
			if (oFF.isNull(dimension))
			{
				importer.addWarning(oFF.ErrorCodes.INVALID_DIMENSION, oFF.XStringUtils.concatenate3("Dimension '", dimName, "' not found in QueryModel! Can't deserialize dimension."));
			}
		}
	}
	if (oFF.notNull(dimension))
	{
		var isAugmentModellerMetadata = inaStructure.getBooleanByKeyExt("IsDelta", false);
		var isMeasureDimension = false;
		if (oFF.notNull(queryModel) && queryModel.getMeasureDimension() !== null)
		{
			isMeasureDimension = oFF.XString.isEqual(dimName, queryModel.getMeasureDimension().getName());
		}
		var dimensionVisibility = inaStructure.getIntegerByKeyExt("Visibility", -1);
		if (dimensionVisibility !== -1)
		{
			dimension.getMetadataBase().setVisibility(oFF.QInAConverter.lookupDimensionVisibility(dimensionVisibility));
		}
		if (isAugmentModellerMetadata && dimension.getDimensionType() === oFF.DimensionType.ACCOUNT && importer.getSession().hasFeature(oFF.FeatureToggleOlap.SFX_STORE_HIERARCHY_MEMBER_NAMES_AS_FLAT) && importer.getSession().hasFeature(oFF.FeatureToggleOlap.MULTIPLE_ACCOUNT_HIERARCHIES))
		{
			dimension.setHierarchicalDimensionMemberNamesStoredAsFlat(true);
		}
		var membersWithAssignedPlaceholders = dimension.getPlaceholderIdMemberMap().getValuesAsReadOnlyList();
		var placeholderIds = inaStructure.getListByKey("PlaceholderIds");
		if (oFF.notNull(placeholderIds) && (isAugmentModellerMetadata || !isMeasureDimension))
		{
			dimension.clearPlaceholderIds();
		}
		if (dimension.getPlaceholderIds().size() === 0 && oFF.notNull(placeholderIds))
		{
			for (var i = 0; i < placeholderIds.size(); i++)
			{
				var placeholderId = placeholderIds.getStringAt(i);
				placeholderId = this.migratePlaceholderId(importer, queryModel, placeholderId);
				dimension.addPlaceholderId(placeholderId);
			}
		}
		if (membersWithAssignedPlaceholders.size() > dimension.getPlaceholderIdMemberMap().getValuesAsReadOnlyList().size())
		{
			var membersWithAssignedPlaceholdersIter = membersWithAssignedPlaceholders.getIterator();
			while (membersWithAssignedPlaceholdersIter.hasNext())
			{
				var memberWithAssignedPlaceholder = membersWithAssignedPlaceholdersIter.next();
				if (dimension.getPlaceholderIdByAlias(memberWithAssignedPlaceholder.getAliasOrMemberName()) === null)
				{
					dimension.assignFreePlaceholderToMember(memberWithAssignedPlaceholder);
				}
			}
		}
		if (!isAugmentModellerMetadata)
		{
			dimension.clearAlternativeFieldValues();
		}
		if (isAugmentModellerMetadata && oFF.XStringUtils.isNullOrEmpty(dimension.getDefaultHierarchyName()) && inaStructure.containsKey("DefaultHierarchy"))
		{
			dimension.getHierarchyManagerBase().setDefaultHierarchyName(inaStructure.getStringByKey("DefaultHierarchy"));
		}
		if (isAugmentModellerMetadata && importer.getSession().hasFeature(oFF.FeatureToggleOlap.LAZY_LOADING_SFX_ACCOUNT_MEMBERS) && dimension.getDimensionType() === oFF.DimensionType.ACCOUNT)
		{
			dimension.setStructureMemberLazyLoader(oFF.InARepoStructureMemberLazyLoader.create(dimension, importer.getMode(), inaStructure));
		}
		else
		{
			importer.importMembers(inaStructure, dimension, context);
		}
		if (!isAugmentModellerMetadata)
		{
			this.importFieldsLayout(importer, inaStructure, dimension, context);
			importer.importHierarchy(dimension, inaStructure);
			var modelCapabilities = queryModel.getModelCapabilities();
			if (!modelCapabilities.supportsExtendedSort())
			{
				if (modelCapabilities.supportsDimensionSorting(dimension, oFF.SortType.MEMBER_KEY))
				{
					var inaSortOrder = inaStructure.getIntegerByKeyExt("SortOrder", oFF.QInAConverter.lookupSortDirectionInA(oFF.XSortDirection.DEFAULT_VALUE));
					var sortOrder = oFF.QInAConverter.lookupSortDirection(inaSortOrder);
					dimension.getResultSetSorting().setDirection(sortOrder);
				}
			}
			if (importer.capabilities.supportsCummulative() && dimension.supportsCumulative())
			{
				if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || inaStructure.containsKey("IsCummulative"))
				{
					dimension.setIsCumulative(inaStructure.getBooleanByKeyExt("IsCummulative", false));
				}
			}
			if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || inaStructure.containsKey("Skip"))
			{
				var skipEntries = inaStructure.getIntegerByKeyExt("Skip", 0);
				dimension.setSkipEntries(skipEntries);
			}
			if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || inaStructure.containsKey("Top"))
			{
				var topEntries = inaStructure.getIntegerByKeyExt("Top", 0);
				dimension.setTopEntries(topEntries);
			}
			var inaReadMode = inaStructure.getStringByKey("ReadMode");
			if (oFF.notNull(inaReadMode))
			{
				var readMode = oFF.QInAConverter.lookupReadMode(inaReadMode);
				dimension.setReadModeGraceful(oFF.QContextType.RESULT_SET, readMode);
			}
			var inaSelectorReadMode = inaStructure.getStringByKey("SelectorReadMode");
			if (oFF.notNull(inaSelectorReadMode))
			{
				var selectorReadMode = oFF.QInAConverter.lookupReadMode(inaSelectorReadMode);
				dimension.setReadModeGraceful(oFF.QContextType.SELECTOR, selectorReadMode);
			}
			importer.importTotals(inaStructure, dimension.getResultStructureControllerBase(), context);
			this.importAlternativeFieldValues(inaStructure, dimension);
			var inaPlaceholderIdMemberMap = inaStructure.getStructureByKey("PlacholderIdMapping");
			if (oFF.notNull(inaPlaceholderIdMemberMap))
			{
				var inaPlaceholderIds = inaPlaceholderIdMemberMap.getKeysAsReadOnlyListOfString();
				for (var j = 0; j < inaPlaceholderIds.size(); j++)
				{
					var inaPlaceholderId = inaPlaceholderIds.get(j);
					var inaMember = inaPlaceholderIdMemberMap.getStringByKey(inaPlaceholderId);
					inaPlaceholderId = this.migratePlaceholderId(importer, queryModel, inaPlaceholderId);
					dimension.assignPlaceholderIdByAlias(inaPlaceholderId, inaMember);
				}
			}
			var inaMemberName;
			var inaMemberNames;
			if (dimension.getModelCapabilities().supportsMemberVisibility() && inaStructure.containsKey("VisibilityOverride"))
			{
				var inaVisiblitySettings = inaStructure.getStructureByKey("VisibilityOverride");
				inaMemberNames = inaVisiblitySettings.getKeysAsReadOnlyListOfString();
				for (var k = 0; k < inaMemberNames.size(); k++)
				{
					inaMemberName = inaMemberNames.get(k);
					var visibility = oFF.QInAConverter.lookupResultSetVisibility(inaVisiblitySettings.getStringByKey(inaMemberName));
					dimension.getOverdefinedMemberManager().setVisibilityOverride(inaMemberName, visibility);
				}
			}
			if (inaStructure.containsKey("NumericScaleOverride"))
			{
				var inaNumericScaleSettings = inaStructure.getStructureByKey("NumericScaleOverride");
				inaMemberNames = inaNumericScaleSettings.getKeysAsReadOnlyListOfString();
				for (var l = 0; l < inaMemberNames.size(); l++)
				{
					inaMemberName = inaMemberNames.get(l);
					dimension.getOverdefinedMemberManager().setNumericScaleOverride(inaMemberName, inaNumericScaleSettings.getIntegerByKey(inaMemberName));
				}
			}
			if (dimension.getModelCapabilities().supportsMemberVisibility() && inaStructure.containsKey("NumericShiftOverride"))
			{
				var inaNumericShiftSettings = inaStructure.getStructureByKey("NumericShiftOverride");
				inaMemberNames = inaNumericShiftSettings.getKeysAsReadOnlyListOfString();
				for (var m = 0; m < inaMemberNames.size(); m++)
				{
					inaMemberName = inaMemberNames.get(m);
					dimension.getOverdefinedMemberManager().setNumericShiftOverride(inaMemberName, inaNumericShiftSettings.getIntegerByKey(inaMemberName));
				}
			}
			if (inaStructure.containsKey("NumericPrecisionOverride"))
			{
				var inaNumericPrecisionSettings = inaStructure.getStructureByKey("NumericPrecisionOverride");
				inaMemberNames = inaNumericPrecisionSettings.getKeysAsReadOnlyListOfString();
				for (var n = 0; n < inaMemberNames.size(); n++)
				{
					inaMemberName = inaMemberNames.get(n);
					dimension.getOverdefinedMemberManager().setNumericPrecisionOverride(inaMemberName, inaNumericPrecisionSettings.getIntegerByKey(inaMemberName));
				}
			}
			var overrideText = inaStructure.getStringByKey("OverrideText");
			if (oFF.XStringUtils.isNotNullAndNotEmpty(overrideText))
			{
				dimension.setOverrideText(overrideText);
			}
		}
		var accountTypeAttributeName = inaStructure.getStringByKey("AccountTypeAttributeName");
		var dimensionMetadataBase = dimension.getMetadataBase();
		if (oFF.notNull(accountTypeAttributeName))
		{
			dimensionMetadataBase.setAccountTypeAttributeName(accountTypeAttributeName);
		}
		var fiscalEnabled = inaStructure.getBooleanByKeyExt("FiscalEnabled", false);
		if (fiscalEnabled)
		{
			dimensionMetadataBase.setFiscalEnabled(fiscalEnabled);
			dimensionMetadataBase.setFiscalDisplayPeriod(inaStructure.getStringByKey("FiscalDisplayPeriod"));
			dimensionMetadataBase.setFiscalShift(inaStructure.getIntegerByKeyExt("FiscalShift", 0));
		}
		if (inaStructure.containsKey("additionalPeriods"))
		{
			dimensionMetadataBase.setAdditionalPeriods(inaStructure.getIntegerByKey("additionalPeriods"));
		}
		if (inaStructure.containsKey("periodPrefix"))
		{
			dimensionMetadataBase.setPeriodPrefix(inaStructure.getStringByKey("periodPrefix"));
		}
		if (inaStructure.containsKey("useMonthLabel"))
		{
			dimensionMetadataBase.setUseMonthLabel(inaStructure.getBooleanByKey("useMonthLabel"));
		}
		if (inaStructure.containsKey("TimeConfigEnablePattern"))
		{
			dimensionMetadataBase.setTimeConfigEnablePattern(inaStructure.getBooleanByKey("TimeConfigEnablePattern"));
		}
		if (inaStructure.containsKey("IsUserManaged"))
		{
			dimensionMetadataBase.setIsUserManaged(inaStructure.getBooleanByKey("IsUserManaged"));
		}
		if (inaStructure.containsKey("Pattern"))
		{
			dimensionMetadataBase.setTimeConfigPattern(inaStructure.getStringByKey("Pattern"));
		}
		if (inaStructure.containsKey("FirstWeekDay"))
		{
			dimensionMetadataBase.setFirstWeekDay(inaStructure.getStringByKey("FirstWeekDay"));
		}
		if (inaStructure.containsKey("FirstYearWeekIndicator"))
		{
			dimensionMetadataBase.setFirstYearWeekIndicator(inaStructure.getStringByKey("FirstYearWeekIndicator"));
		}
		if (inaStructure.containsKey("unassignedMember"))
		{
			dimensionMetadataBase.setUnassignedMember(inaStructure.getStringByKey("unassignedMember"));
		}
		var hasDayTimeYYYYMMDDFormat = inaStructure.getBooleanByKeyExt("HasDayTimeYYYYMMDDFormat", false);
		if (hasDayTimeYYYYMMDDFormat)
		{
			dimensionMetadataBase.setHasDayTimeYYYYMMDDFormat(hasDayTimeYYYYMMDDFormat);
		}
		var description = inaStructure.getStringByKey("Description");
		if (oFF.XStringUtils.isNotNullAndNotEmpty(description))
		{
			dimension.setText(description);
		}
	}
	return dimension;
};
oFF.QInARepoDimension.prototype.migratePlaceholderId = function(importer, queryModel, placeholderId)
{
	var newPlaceholderId = placeholderId;
	var placeholderPrefix = oFF.XStringUtils.concatenate2("].&[", oFF.QModelConstants.CALCULATION_PLACEHOLDER_ID_PREFIX);
	if (importer.getSession().hasFeature(oFF.FeatureToggleOlap.MULTIPLE_ACCOUNT_HIERARCHIES) && oFF.notNull(queryModel) && queryModel.getDimensionByType(oFF.DimensionType.ACCOUNT) !== null && oFF.XString.startsWith(placeholderId, "[") && oFF.XString.indexOf(placeholderId, placeholderPrefix) !== -1)
	{
		var index = oFF.XString.indexOf(placeholderId, oFF.QModelConstants.CALCULATION_PLACEHOLDER_ID_PREFIX);
		var endindex = oFF.XString.indexOfFrom(placeholderId, "]", index);
		newPlaceholderId = oFF.XString.substring(placeholderId, index, endindex);
	}
	return newPlaceholderId;
};
oFF.QInARepoDimension.prototype.addNewDimensionWithDummyMetadata = function(importer, context, queryModel, dimName)
{
	var cacheKey = oFF.QCacheKey.createByContextForDimension(context, dimName, null);
	var dimensionMetadata = oFF.QDimensionMetadata.create(cacheKey);
	dimensionMetadata.addSupportedFieldLayoutType(oFF.FieldLayoutType.ATTRIBUTE_BASED);
	dimensionMetadata.addSupportedAxis(oFF.AxisType.FREE);
	dimensionMetadata.addSupportedAxis(oFF.AxisType.ROWS);
	dimensionMetadata.addSupportedAxis(oFF.AxisType.COLUMNS);
	dimensionMetadata.setDimensionType(oFF.DimensionType.DIMENSION);
	var olapEnvironment = importer.getApplication().getOlapEnvironment();
	olapEnvironment.setDimensionMetadata(dimensionMetadata);
	var dimension = oFF.QDimension._create(context, queryModel.getDimensionManagerBase());
	dimension.setName(dimName);
	dimension.setText(dimName);
	dimension.setMetadata(dimensionMetadata);
	dimension.setSkipMetadataValidationOnRepoImport(true);
	queryModel.addDimension(dimension);
	return dimension;
};
oFF.QInARepoDimension.prototype.importAlternativeFieldValues = function(inaStructure, dimension)
{
	var alternativeFieldValuesList = inaStructure.getListByKey("AlternativeFieldValues");
	if (oFF.notNull(alternativeFieldValuesList))
	{
		var size = alternativeFieldValuesList.size();
		for (var i = 0; i < size; i++)
		{
			var currentElement = alternativeFieldValuesList.get(i);
			if (currentElement.isStructure())
			{
				var currentStructure = currentElement;
				var strValueType = currentStructure.getStringByKey("ValueType");
				var valueType = oFF.QInAConverter.lookupValueType(strValueType);
				var valueAsString = currentStructure.getStringByKey("Value");
				var value = null;
				if (valueType === oFF.XValueType.INTEGER)
				{
					value = oFF.XIntegerValue.create(oFF.XInteger.convertFromStringWithRadix(valueAsString, 10));
				}
				else if (valueType === oFF.XValueType.LONG)
				{
					value = oFF.XLongValue.create(oFF.XLong.convertFromString(valueAsString));
				}
				else if (valueType === oFF.XValueType.DOUBLE)
				{
					value = oFF.XDoubleValue.create(oFF.XDouble.convertFromString(valueAsString));
				}
				else if (valueType === oFF.XValueType.STRING)
				{
					value = oFF.XStringValue.create(valueAsString);
				}
				else if (valueType === oFF.XValueType.DATE)
				{
					value = oFF.XDate.createDateFromIsoFormat(valueAsString);
				}
				else if (valueType === oFF.XValueType.DATE_TIME)
				{
					value = oFF.XDateTime.createDateTimeFromIsoFormat(valueAsString);
				}
				if (oFF.notNull(value))
				{
					var hierarchyKey = currentStructure.getBooleanByKey("HierarchyKey");
					var memberKey = currentStructure.getStringByKey("MemberKey");
					var fieldName = currentStructure.getStringByKey("FieldName");
					var language = currentStructure.getStringByKey("Language");
					dimension.setAlternativeFieldValue(hierarchyKey, memberKey, fieldName, value, language);
				}
			}
		}
	}
};
oFF.QInARepoDimension.prototype.importFieldsLayout = function(importer, inaDimension, dimension, context)
{
	var inaAllFields = inaDimension.getListByKey("FieldSettings");
	if (oFF.notNull(inaAllFields))
	{
		var inaAllFieldSize = inaAllFields.size();
		for (var p1 = 0; p1 < inaAllFieldSize; p1++)
		{
			importer.importComponent(oFF.OlapComponentType.FIELD, inaAllFields.getStructureAt(p1), null, dimension, context);
		}
	}
	var inaAllAttributes = inaDimension.getListByKey("AttributeSettings");
	if (oFF.notNull(inaAllAttributes))
	{
		var inaAllAttributesSize = inaAllAttributes.size();
		for (var p2 = 0; p2 < inaAllAttributesSize; p2++)
		{
			importer.importAttribute(inaAllAttributes.getStructureAt(p2), dimension, context);
		}
	}
	var clientDefaultField = dimension.getFieldByName(inaDimension.getStringByKey("ClientDefaultTextAttribute"));
	dimension.setClientDefaultTextField(clientDefaultField);
	clientDefaultField = dimension.getFieldByName(inaDimension.getStringByKey("ClientDefaultKeyAttribute"));
	dimension.setClientDefaultKeyField(clientDefaultField);
	oFF.QInARepoDimension.importRsFields(importer, inaDimension, dimension);
	oFF.QInARepoDimension.importRsAttributeNodes(importer, inaDimension, dimension);
	if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || inaDimension.containsKey("FieldLayoutType"))
	{
		var fieldLayoutType = oFF.QInAConverter.lookupFieldLayoutType(inaDimension.getStringByKey("FieldLayoutType"));
		dimension.setFieldLayoutType(fieldLayoutType);
	}
	if (inaDimension.containsKey("TextFieldModified"))
	{
		dimension.getFieldContainerBase().setShouldUseActualTextField(inaDimension.getBooleanByKey("TextFieldModified"));
	}
};
oFF.QInARepoDimension.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var dimension = modelComponent;
	inaStructure.putString("Name", dimension.getName());
	if (exporter.getMode() !== oFF.QModelFormat.INA_REPOSITORY_DELTA && !dimension.getModelCapabilities().supportsPersistedInA() || dimension.hasPropertyChanged(oFF.QDimensionProperties.QY_READ_MODE))
	{
		oFF.QInARepoUtils.setNameIfNotNull(inaStructure, "ReadMode", dimension.getReadMode(oFF.QContextType.RESULT_SET));
	}
	if (exporter.getMode() !== oFF.QModelFormat.INA_REPOSITORY_DELTA && !dimension.getModelCapabilities().supportsPersistedInA() || dimension.hasPropertyChanged(oFF.QDimensionProperties.QY_SELECTOR_READ_MODE))
	{
		oFF.QInARepoUtils.setNameIfNotNull(inaStructure, "SelectorReadMode", dimension.getReadMode(oFF.QContextType.SELECTOR));
	}
	inaStructure.putString("Axis", oFF.QInAConverter.lookupAxisTypeInA(dimension.getAxisType()));
	if (exporter.getMode() !== oFF.QModelFormat.INA_REPOSITORY_DELTA || dimension.hasPropertyChanged(oFF.QDimensionProperties.QY_SKIP))
	{
		var skipEntries = dimension.getSkipEntries();
		if (skipEntries > 0 || exporter.getMode() === oFF.QModelFormat.INA_REPOSITORY_DELTA && dimension.hasPropertyChanged(oFF.QDimensionProperties.QY_SKIP))
		{
			inaStructure.putInteger("Skip", skipEntries);
		}
	}
	if (exporter.getMode() !== oFF.QModelFormat.INA_REPOSITORY_DELTA || dimension.hasPropertyChanged(oFF.QDimensionProperties.QY_TOP))
	{
		var topEntries = dimension.getTopEntries();
		if (topEntries > 0 || exporter.getMode() === oFF.QModelFormat.INA_REPOSITORY_DELTA && dimension.hasPropertyChanged(oFF.QDimensionProperties.QY_TOP))
		{
			inaStructure.putInteger("Top", topEntries);
		}
	}
	if (dimension.supportsCumulative() && (exporter.getMode() !== oFF.QModelFormat.INA_REPOSITORY_DELTA || dimension.hasPropertyChanged(oFF.QDimensionProperties.IS_CUMULATIVE)))
	{
		inaStructure.putBoolean("IsCummulative", dimension.isCumulative());
	}
	exporter.exportHierarchy(dimension, inaStructure);
	if (dimension.supportsTotals())
	{
		if (exporter.getMode() !== oFF.QModelFormat.INA_REPOSITORY_DELTA || dimension.getResultStructureController().getModCounter() > 0)
		{
			exporter.exportTotals(dimension, inaStructure);
		}
	}
	if (dimension.getStructureLayout() !== null)
	{
		exporter.exportMembers(dimension, inaStructure);
	}
	this.exportFieldLayout(exporter, inaStructure, dimension);
	this.exportAlternativeFieldValues(inaStructure, dimension);
	if (dimension.getSkipMetadataValidationOnRepoImport())
	{
		inaStructure.putBoolean("SkipMetadataValidationOnRepoImport", true);
	}
	if (dimension.getPlaceholderIds() !== null && dimension.getPlaceholderIds().size() > 0 && exporter.getMode() !== oFF.QModelFormat.INA_REPOSITORY_DELTA)
	{
		var placeholderIds = inaStructure.putNewList("PlaceholderIds");
		placeholderIds.addAllStrings(dimension.getPlaceholderIds());
	}
	var assignedPlaceholderIds = dimension.getPlaceholderIdMemberMap().getKeysAsReadOnlyListOfString();
	if (dimension.getPlaceholderIds() !== null && dimension.getPlaceholderIds().size() > 0)
	{
		var inaPlaceholderIdMemberMap = inaStructure.putNewStructure("PlacholderIdMapping");
		for (var i = 0; i < assignedPlaceholderIds.size(); i++)
		{
			var assignedPlaceholderId = assignedPlaceholderIds.get(i);
			var member = dimension.getPlaceholderIdMemberMap().getByKey(assignedPlaceholderId);
			inaPlaceholderIdMemberMap.putString(assignedPlaceholderId, member.getAliasName());
		}
	}
	var memberVisibilities = dimension.getOverdefinedMemberManager().getVisibilityOverrideMap();
	var memberNames = memberVisibilities.getKeysAsReadOnlyListOfString();
	if (memberNames.size() > 0)
	{
		var inaVisibilitySettings = inaStructure.putNewStructure("VisibilityOverride");
		for (var j = 0; j < memberNames.size(); j++)
		{
			var resultVisibility = memberVisibilities.getByKey(memberNames.get(j));
			if (oFF.isNull(resultVisibility))
			{
				resultVisibility = oFF.ResultVisibility.VISIBLE;
			}
			inaVisibilitySettings.putString(memberNames.get(j), oFF.QInAConverter.lookupResultSetVisibilityInA(resultVisibility));
		}
	}
	var memberNumericScales = dimension.getOverdefinedMemberManager().getNumericScaleOverrideMap();
	memberNames = memberNumericScales.getKeysAsReadOnlyListOfString();
	if (memberNames.size() > 0)
	{
		var inaNumericScaleSettings = inaStructure.putNewStructure("NumericScaleOverride");
		for (var k = 0; k < memberNames.size(); k++)
		{
			var numericScale = memberNumericScales.getByKey(memberNames.get(k));
			inaNumericScaleSettings.putInteger(memberNames.get(k), numericScale.getInteger());
		}
	}
	var memberNumericShifts = dimension.getOverdefinedMemberManager().getNumericShiftOverrideMap();
	memberNames = memberNumericShifts.getKeysAsReadOnlyListOfString();
	if (memberNames.size() > 0)
	{
		var inaNumericShiftSettings = inaStructure.putNewStructure("NumericShiftOverride");
		for (var l = 0; l < memberNames.size(); l++)
		{
			var numericShift = memberNumericShifts.getByKey(memberNames.get(l));
			inaNumericShiftSettings.putInteger(memberNames.get(l), numericShift.getInteger());
		}
	}
	var memberNumericPrecision = dimension.getOverdefinedMemberManager().getNumericPrecisionOverrideMap();
	memberNames = memberNumericPrecision.getKeysAsReadOnlyListOfString();
	if (memberNames.size() > 0)
	{
		var inaNumericPrecisionSettings = inaStructure.putNewStructure("NumericPrecisionOverride");
		for (var m = 0; m < memberNames.size(); m++)
		{
			var numericPrecision = memberNumericPrecision.getByKey(memberNames.get(m));
			inaNumericPrecisionSettings.putInteger(memberNames.get(m), numericPrecision.getInteger());
		}
	}
	if (exporter.getMode() !== oFF.QModelFormat.INA_REPOSITORY_DELTA)
	{
		inaStructure.putStringNotNull("AccountTypeAttributeName", dimension.getMetadata().getAccountTypeAttributeName());
		var fiscalShift = dimension.getMetadata().getFiscalShift();
		if (fiscalShift !== 0)
		{
			inaStructure.putInteger("FiscalShift", fiscalShift);
		}
		var hasDayTimeYYYYMMDDFormat = dimension.getMetadata().hasDayTimeYYYYMMDDFormat();
		if (hasDayTimeYYYYMMDDFormat)
		{
			inaStructure.putBoolean("HasDayTimeYYYYMMDDFormat", hasDayTimeYYYYMMDDFormat);
		}
	}
	var overrideText = dimension.getOverrideText();
	if (oFF.XStringUtils.isNotNullAndNotEmpty(overrideText))
	{
		inaStructure.putString("OverrideText", overrideText);
	}
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};
oFF.QInARepoDimension.prototype.exportFieldLayout = function(exporter, inaDimension, dimension)
{
	if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || dimension.hasPropertyChanged(oFF.QDimensionProperties.QY_FIELD_LAYOUT_TYPE))
	{
		var fieldLayoutType = dimension.getFieldLayoutType();
		inaDimension.putString("FieldLayoutType", oFF.QInAConverter.lookupFieldLayoutTypeInA(fieldLayoutType));
	}
	var inaAllFields = inaDimension.putNewList("FieldSettings");
	oFF.QInARepoDimension.exportListOfFields(dimension.getFields(), inaAllFields, exporter);
	if (!dimension.isUseServerDefaultTextField())
	{
		inaDimension.putString("ClientDefaultTextAttribute", dimension.getClientDefaultTextField().getName());
	}
	if (!dimension.isUseServerDefaultKeyField())
	{
		inaDimension.putString("ClientDefaultKeyAttribute", dimension.getClientDefaultKeyField().getName());
	}
	var resultSetFieldsAtDim = dimension.getResultSetFields();
	if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || resultSetFieldsAtDim.getModCounter() > 0)
	{
		var inaResultSetFields = inaDimension.putNewList("ResultSetFields");
		var resultFieldSize = resultSetFieldsAtDim.size();
		for (var idxResultField = 0; idxResultField < resultFieldSize; idxResultField++)
		{
			var inaRsField = inaResultSetFields.addNewStructure();
			var field = resultSetFieldsAtDim.get(idxResultField);
			inaRsField.putString("Name", field.getName());
			var obtainability = field.getObtainability();
			if (oFF.notNull(obtainability))
			{
				inaRsField.putString("Obtainability", obtainability.getName());
			}
		}
	}
	var defaultResultSetTextField = dimension.getDefaultResultSetTextField();
	if (oFF.notNull(defaultResultSetTextField) && defaultResultSetTextField.haveAnyInAPropertiesChanged() || dimension.getShouldUseActualTextField())
	{
		inaDimension.putBoolean("TextFieldModified", true);
	}
	if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || this.exportResultSetAttributeDetails(dimension))
	{
		var inaResultSetAttributes = inaDimension.putNewList("ResultSetAttributeNodes");
		var inaAttributeRsFields = inaDimension.putNewList("ResultSetAttributeFields");
		var resultSetAttributesAtDim = dimension.getResultSetAttributes();
		var resultAttributeSize = resultSetAttributesAtDim.size();
		for (var idxResultAttribute = 0; idxResultAttribute < resultAttributeSize; idxResultAttribute++)
		{
			var rsAttribute = resultSetAttributesAtDim.get(idxResultAttribute);
			inaResultSetAttributes.addString(rsAttribute.getName());
			var attributeFields = inaAttributeRsFields.addNewList();
			var attributeRsFields = rsAttribute.getResultSetFields();
			var attRsFields = attributeRsFields.size();
			for (var idxAttributeResultField = 0; idxAttributeResultField < attRsFields; idxAttributeResultField++)
			{
				var inaAttRsField = attributeFields.addNewStructure();
				var attField = attributeRsFields.get(idxAttributeResultField);
				inaAttRsField.putString("Name", attField.getName());
				var attrObtainability = attField.getObtainability();
				if (oFF.notNull(attrObtainability))
				{
					inaAttRsField.putString("Obtainability", attrObtainability.getName());
				}
			}
		}
	}
};
oFF.QInARepoDimension.prototype.exportResultSetAttributeDetails = function(dimension)
{
	var exportInRepoDelta = false;
	var resultSetAttributesAtDim = dimension.getResultSetAttributes();
	if (resultSetAttributesAtDim.getModCounter() > 0)
	{
		exportInRepoDelta = true;
	}
	else
	{
		var resultAttributeSize = resultSetAttributesAtDim.size();
		for (var idxResultAttribute = 0; idxResultAttribute < resultAttributeSize; idxResultAttribute++)
		{
			var rsAttribute = resultSetAttributesAtDim.get(idxResultAttribute);
			var attributeRsFields = rsAttribute.getResultSetFields();
			if (attributeRsFields.getModCounter() > 0)
			{
				exportInRepoDelta = true;
				break;
			}
		}
	}
	return exportInRepoDelta;
};
oFF.QInARepoDimension.prototype.exportAlternativeFieldValues = function(inaStructure, dimension)
{
	this.exportAlternativeFieldValuesForKeyType(inaStructure, dimension, dimension.getAlternativeFieldValueMemberKeys(false), false);
	this.exportAlternativeFieldValuesForKeyType(inaStructure, dimension, dimension.getAlternativeFieldValueMemberKeys(true), true);
};
oFF.QInARepoDimension.prototype.exportAlternativeFieldValuesForKeyType = function(inaStructure, dimension, alternativeFieldValueMemberKeys, hierarchyKey)
{
	if (oFF.notNull(alternativeFieldValueMemberKeys))
	{
		var alternativeFieldValuesList = oFF.PrFactory.createList();
		var sizeKeys = alternativeFieldValueMemberKeys.size();
		for (var i = 0; i < sizeKeys; i++)
		{
			var memberKey = alternativeFieldValueMemberKeys.get(i);
			var alternativeFieldValueFields = dimension.getAlternativeFieldValueFields(hierarchyKey, memberKey);
			if (oFF.notNull(alternativeFieldValueFields))
			{
				var sizeFields = alternativeFieldValueFields.size();
				for (var j = 0; j < sizeFields; j++)
				{
					var fieldName = alternativeFieldValueFields.get(j);
					var alternativeFieldValueLanguages = dimension.getAlternativeFieldValueLanguages(hierarchyKey, memberKey, fieldName);
					if (oFF.notNull(alternativeFieldValueLanguages))
					{
						var sizeLanguages = alternativeFieldValueLanguages.size();
						for (var k = 0; k < sizeLanguages; k++)
						{
							var language = alternativeFieldValueLanguages.get(k);
							var alternativeFieldValue = dimension.getAlternativeFieldValue(hierarchyKey, memberKey, fieldName, language);
							if (oFF.notNull(alternativeFieldValue))
							{
								var fieldTransformationStruct = alternativeFieldValuesList.addNewStructure();
								fieldTransformationStruct.putBoolean("HierarchyKey", hierarchyKey);
								fieldTransformationStruct.putString("MemberKey", memberKey);
								fieldTransformationStruct.putString("FieldName", fieldName);
								fieldTransformationStruct.putString("Language", language);
								fieldTransformationStruct.putString("ValueType", oFF.QInAConverter.lookupValueTypeInA(alternativeFieldValue.getValueType()));
								fieldTransformationStruct.putString("Value", alternativeFieldValue.getStringRepresentation());
							}
						}
					}
				}
			}
		}
		if (alternativeFieldValuesList.size() > 0)
		{
			inaStructure.put("AlternativeFieldValues", alternativeFieldValuesList);
		}
	}
};

oFF.QInARepoDimensions = function() {};
oFF.QInARepoDimensions.prototype = new oFF.QInARepository();
oFF.QInARepoDimensions.prototype._ff_c = "QInARepoDimensions";

oFF.QInARepoDimensions.exportAxisDimensionsWithHeuristic = function(exporter, axis, parameterDimensionList, usedDimensions, exportedDimensions)
{
	var queryModel = axis.getQueryModel();
	var repositoryData = exporter.mode.isTypeOf(oFF.QModelFormat.INA_REPOSITORY_DATA);
	var optimizedExportModeActive = queryModel.isOptimizedExportModeActive();
	var dimCount = axis.getDimensionCount();
	for (var i = 0; i < dimCount; i++)
	{
		var dimension = axis.get(i);
		if (optimizedExportModeActive && dimension.isIgnoredOnOptimizedExport())
		{
			continue;
		}
		if (repositoryData && !usedDimensions.contains(dimension.getName()))
		{
			continue;
		}
		oFF.QInARepoDimensions.exportDimension(exporter, dimension, parameterDimensionList, exportedDimensions);
	}
};
oFF.QInARepoDimensions.exportAxisDimensions = function(exporter, axis, parameterDimensionList, exportedDimensions)
{
	var dimCount = axis.getDimensionCount();
	for (var i = 0; i < dimCount; i++)
	{
		var dimension = axis.get(i);
		if (oFF.QInARepoDimensions._isForRendering(exporter.getMode(), dimension))
		{
			continue;
		}
		oFF.QInARepoDimensions.exportDimension(exporter, dimension, parameterDimensionList, exportedDimensions);
	}
};
oFF.QInARepoDimensions._isForRendering = function(exporterMode, dimension)
{
	var dimAxisType = dimension.getAxisType();
	return exporterMode === oFF.QModelFormat.INA_REPOSITORY_DATA_RENDERING && dimAxisType !== oFF.AxisType.ROWS && dimAxisType !== oFF.AxisType.COLUMNS;
};
oFF.QInARepoDimensions.exportDimension = function(exporter, dimension, inaDimensionList, exportedDimensions)
{
	if (!exportedDimensions.contains(dimension.getName()))
	{
		exportedDimensions.add(dimension.getName());
		var isTransientFormulaCalcDim = dimension.getDimensionType().isTypeOf(oFF.DimensionType.FORMULA_CALCULATED_DIMENSION) && dimension.getTagging().containsKey(oFF.QTransientConstants.TAG_IS_TRANSIENT) && dimension.getAxis() !== null && dimension.getAxisType() === oFF.AxisType.FREE;
		var shouldContinueExporting = !isTransientFormulaCalcDim && (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || dimension.getDimensionType().isTypeOf(oFF.DimensionType.CALCULATED_DIMENSION) || dimension.getModCounter() > 0);
		if (shouldContinueExporting)
		{
			inaDimensionList.add(exporter.exportDimension(dimension, null));
		}
	}
};
oFF.QInARepoDimensions.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.DIMENSIONS;
};
oFF.QInARepoDimensions.prototype.getTagName = function()
{
	return "DimensionsRepo";
};
oFF.QInARepoDimensions.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	if (oFF.notNull(inaStructure))
	{
		var inaList = inaStructure.getListByKey("Elements");
		this.importComponentWithList(importer, inaList, modelComponent, parentComponent, context);
	}
	return modelComponent;
};
oFF.QInARepoDimensions.prototype.containsFormulaCalculatedDimensionInInaList = function(inaList, dimensionName)
{
	var size = inaList.size();
	for (var k = 0; k < size; k++)
	{
		var inaDimension = inaList.getStructureAt(k);
		var inaDimensionName = inaDimension.getStringByKey("Name");
		if (oFF.XString.isEqual(dimensionName, inaDimensionName))
		{
			return inaDimension.containsKey("CType") && oFF.XComponentType.lookupComponentType(inaDimension.getStringByKey("CType")) === oFF.DimensionType.FORMULA_CALCULATED_DIMENSION;
		}
	}
	return false;
};
oFF.QInARepoDimensions.prototype.importComponentWithList = function(importer, inaList, modelComponent, parentComponent, context)
{
	var queryModel = modelComponent;
	if (oFF.notNull(inaList))
	{
		var originalMode = importer.getOriginalMode();
		if (originalMode.isTypeOf(oFF.QModelFormat.INA_REPOSITORY) && !originalMode.isTypeOf(oFF.QModelFormat.INA_REPOSITORY_DELTA))
		{
			var loadedDimensions = queryModel.getLoadedDimensions();
			var loadedDimensionsSize = loadedDimensions.size();
			for (var i = loadedDimensionsSize - 1; i >= 0; i--)
			{
				var loadedDimension = loadedDimensions.get(i);
				var loadedDimensionName = loadedDimension.getName();
				if (loadedDimension.getDimensionType().isTypeOf(oFF.DimensionType.FORMULA_CALCULATED_DIMENSION) && oFF.notNull(loadedDimensionName))
				{
					if (!this.containsFormulaCalculatedDimensionInInaList(inaList, loadedDimensionName))
					{
						queryModel.removeCalculatedDimensionByName(loadedDimensionName);
					}
				}
			}
		}
		var dimensionManager = queryModel.getDimensionManagerBase();
		var freeAxis = queryModel.getFreeAxis();
		freeAxis.addAll(dimensionManager);
		var size = inaList.size();
		var dimensionReferences = dimensionManager.getDimensionReferences();
		for (var k = 0; k < size; k++)
		{
			var inaDimension = inaList.getStructureAt(k);
			var dimName = inaDimension.getStringByKey("Name");
			var dimAxisString = inaDimension.getStringByKey("Axis");
			var dimension = null;
			if (inaDimension.containsKey("FieldMappings"))
			{
				var importCalculatedDimension = importer.importCalculatedDimension(inaDimension, queryModel);
				dimensionManager.addDimension(importCalculatedDimension);
				dimensionManager.finalizeDimensionMetadataSetup(importCalculatedDimension);
			}
			else if (inaDimension.containsKey("CType") && oFF.XComponentType.lookupComponentType(inaDimension.getStringByKey("CType")) === oFF.DimensionType.FORMULA_CALCULATED_DIMENSION)
			{
				var existingCalcDimension = queryModel.getDimensionByName(dimName);
				var importFormulaCalculatedDimension = importer.importFormulaCalculatedDimension(inaDimension, queryModel, existingCalcDimension);
				dimensionManager.finalizeDimensionMetadataSetup(importFormulaCalculatedDimension);
			}
			else
			{
				if (dimensionReferences.containsKey(dimName))
				{
					dimension = dimensionManager.getDimensionByNameFromExistingMetadata(dimName);
				}
				importer.importDimension(inaDimension, queryModel);
			}
			if (oFF.isNull(dimension))
			{
				dimension = dimensionManager.getDimensionByNameInternal(dimName);
				if (oFF.isNull(dimension))
				{
					continue;
				}
			}
			if (oFF.isNull(dimAxisString))
			{
				dimAxisString = inaDimension.getStringByKeyExt("AxisDefault", "Free");
			}
			queryModel.getAxis(oFF.QInAConverter.lookupAxisType(dimAxisString)).add(dimension);
		}
	}
	return queryModel;
};
oFF.QInARepoDimensions.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var inaList = this.exportComponentWithList(exporter, modelComponent, flags);
	inaStructure.put("Elements", inaList);
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};
oFF.QInARepoDimensions.prototype.exportComponentWithList = function(exporter, modelComponent, flags)
{
	var inaDimensionList = oFF.PrFactory.createList();
	var query = modelComponent;
	var exportedDimensions = oFF.XHashSetOfString.create();
	oFF.QInARepoDimensions.exportAxisDimensions(exporter, query.getAxis(oFF.AxisType.ROWS), inaDimensionList, exportedDimensions);
	oFF.QInARepoDimensions.exportAxisDimensions(exporter, query.getAxis(oFF.AxisType.COLUMNS), inaDimensionList, exportedDimensions);
	var usedDimensions = oFF.XHashSetOfString.create();
	if (exporter.mode === oFF.QModelFormat.INA_REPOSITORY_DATA || exporter.mode === oFF.QModelFormat.INA_REPOSITORY_DATA_NO_VARS)
	{
		oFF.DimensionUsageAnalyzer2.setupHeuristic(query, usedDimensions);
	}
	oFF.QInARepoDimensions.exportAxisDimensionsWithHeuristic(exporter, query.getAxis(oFF.AxisType.FREE), inaDimensionList, usedDimensions, exportedDimensions);
	return inaDimensionList;
};

oFF.QInARepoDrillManager = function() {};
oFF.QInARepoDrillManager.prototype = new oFF.QInARepository();
oFF.QInARepoDrillManager.prototype._ff_c = "QInARepoDrillManager";

oFF.QInARepoDrillManager.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.DRILL_MANAGER;
};
oFF.QInARepoDrillManager.prototype.getTagName = function()
{
	return "HierarchyNavigationsRepo";
};
oFF.QInARepoDrillManager.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	if (oFF.notNull(inaStructure))
	{
		var inaList = inaStructure.getListByKey("Elements");
		this.importComponentWithList(importer, inaList, modelComponent, parentComponent, context);
	}
	return modelComponent;
};
oFF.QInARepoDrillManager.prototype.importComponentWithList = function(importer, inaList, modelComponent, parentComponent, context)
{
	var drillManager = modelComponent;
	var size;
	drillManager.removeAllContextDrillOperations();
	drillManager.removeZoomDrillOperationsByDimension(null);
	if (oFF.notNull(inaList))
	{
		var previousZoomStackPosition = -1;
		size = inaList.size();
		for (var idxHierNav = 0; idxHierNav < size; idxHierNav++)
		{
			var subStructure = inaList.getStructureAt(idxHierNav);
			var zoomDrillStackPosition = subStructure.getIntegerByKeyExt("ZoomDrillStackPosition", -1);
			if (zoomDrillStackPosition === -1)
			{
				importer.importDrillOperation(subStructure, drillManager, context);
			}
			else if (zoomDrillStackPosition > -1)
			{
				var zoomDrillPath = this.getZoomDrillPath(importer, drillManager, subStructure, context);
				if (oFF.XCollectionUtils.hasElements(zoomDrillPath))
				{
					if (zoomDrillStackPosition !== previousZoomStackPosition)
					{
						drillManager.pushEmptyZoomDrillForDimension(zoomDrillPath.get(zoomDrillPath.size() - 1).getDimension());
						previousZoomStackPosition = zoomDrillStackPosition;
					}
					var hideRoots = subStructure.getIntegerByKeyExt("DrillOffset", 0) > 0;
					drillManager.addZoomDrillPath(zoomDrillPath, hideRoots);
				}
			}
		}
	}
	return modelComponent;
};
oFF.QInARepoDrillManager.prototype.getZoomDrillPath = function(importer, drillManager, inaStructure, context)
{
	var drillPath = oFF.XList.create();
	var drillContext = inaStructure.getListByKey("DrillContextMembers");
	if (oFF.notNull(drillContext))
	{
		var size = drillContext.size();
		for (var idxHierCtx = 0; idxHierCtx < size; idxHierCtx++)
		{
			var drillCtx = drillContext.getStructureAt(idxHierCtx);
			var drillPathElement = importer.importDrillPathElement(drillCtx, drillManager, context);
			drillPath.add(drillPathElement);
		}
	}
	var drillState = inaStructure.getStringByKey("DrillState");
	var drillMember = inaStructure.getStructureByKey("DrillMember");
	if (oFF.isNull(drillMember) || oFF.isNull(drillState))
	{
		return null;
	}
	var drillPathElementMember = importer.importDrillPathElement(drillMember, drillManager, context);
	drillPath.add(drillPathElementMember);
	return drillPath;
};
oFF.QInARepoDrillManager.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var inaList = this.exportComponentWithList(exporter, modelComponent, flags);
	if (oFF.notNull(inaList))
	{
		inaStructure.put("Elements", inaList);
	}
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};
oFF.QInARepoDrillManager.prototype.exportComponentWithList = function(exporter, modelComponent, flags)
{
	var drillManager = modelComponent;
	var capabilities = drillManager.getModelCapabilities();
	var inaOperationsList = null;
	var drillOperations = drillManager.getDrillOperationsForInARepo();
	var drillOpCount = drillOperations.size();
	if (drillOpCount > 0)
	{
		var queryModel = drillManager.getQueryModel();
		var inaDeltaOperation = null;
		var deltaDimension = null;
		inaOperationsList = oFF.PrFactory.createList();
		var deltaOperation = null;
		if (capabilities.supportsHierarchyNavigationDeltaMode())
		{
			deltaOperation = drillOperations.get(drillOpCount - 1);
			var targetDimensionDelta = deltaOperation.getTargetDimension();
			if (oFF.notNull(targetDimensionDelta) && targetDimensionDelta.isHierarchyNavigationDeltaMode())
			{
				deltaDimension = targetDimensionDelta;
				inaDeltaOperation = exporter.exportDrillOperation(deltaOperation);
			}
		}
		var isAbap = exporter.isAbap(queryModel);
		var i;
		for (i = 0; i < drillOpCount; i++)
		{
			var operation = drillOperations.get(i);
			if (operation.getType() === oFF.DrillOperationType.CONTEXT)
			{
				var targetDimension = operation.getTargetDimension();
				if (oFF.isNull(deltaDimension) || deltaDimension !== targetDimension)
				{
					if (!isAbap && targetDimension.getInitialDrillLevel() < 0 && operation.getDrillState() === oFF.DrillState.EXPANDED)
					{
						continue;
					}
					inaOperationsList.add(exporter.exportDrillOperation(operation));
				}
			}
		}
		if (oFF.notNull(inaDeltaOperation))
		{
			inaOperationsList.add(inaDeltaOperation);
		}
		if (inaOperationsList.isEmpty())
		{
			inaOperationsList = null;
		}
	}
	return inaOperationsList;
};

oFF.QInARepoDrillPathElement = function() {};
oFF.QInARepoDrillPathElement.prototype = new oFF.QInARepository();
oFF.QInARepoDrillPathElement.prototype._ff_c = "QInARepoDrillPathElement";

oFF.QInARepoDrillPathElement.prototype.getComponentType = function()
{
	return oFF.MemberType.DRILL_PATH_ELEMENT;
};
oFF.QInARepoDrillPathElement.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var parentModelComponent = parentComponent;
	var queryModel = parentModelComponent.getContext().getQueryModel();
	var fieldName = inaStructure.getStringByKey("FieldName");
	var dimensionName = inaStructure.getStringByKey("DimensionName");
	var dimension;
	if (oFF.XStringUtils.isNotNullAndNotEmpty(dimensionName))
	{
		dimension = queryModel.getDimensionByNameFromExistingMetadata(dimensionName);
	}
	else
	{
		var field = queryModel.getFieldByNameOrAlias(fieldName);
		if (oFF.isNull(field))
		{
			dimension = queryModel.getDimensionByNameFromExistingMetadata(fieldName);
			if (oFF.notNull(dimension))
			{
				field = dimension.getKeyField();
				fieldName = field.getName();
			}
		}
		else
		{
			dimension = field.getDimension();
		}
	}
	var element = oFF.QDrillPathElement._create(context);
	element.setDimension(dimension);
	var member = inaStructure.getStringByKey("Member");
	element.setName(member);
	element.setFieldName(fieldName);
	return element;
};
oFF.QInARepoDrillPathElement.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var element = modelComponent;
	var name = element.getName();
	var fieldName = element.getFieldName();
	var shadowKeyFieldValue = element.getShadowKeyFieldValue();
	if (oFF.XStringUtils.isNotNullAndNotEmpty(shadowKeyFieldValue))
	{
		name = shadowKeyFieldValue;
		fieldName = element.getShadowKeyFieldName();
	}
	if (oFF.isNull(name))
	{
		inaStructure.putNull("Member");
	}
	else
	{
		var memberName = oFF.QInAExportUtil.getMeasureMemberNameByAlias(element.getQueryModel(), name, exporter);
		inaStructure.putString("Member", memberName);
	}
	inaStructure.putString("FieldName", fieldName);
	var dimension = element.getDimension();
	oFF.QInAExportUtil.setNameIfNotNull(inaStructure, "DimensionName", dimension);
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};

oFF.QInARepoDrillPathOperation = function() {};
oFF.QInARepoDrillPathOperation.prototype = new oFF.QInARepository();
oFF.QInARepoDrillPathOperation.prototype._ff_c = "QInARepoDrillPathOperation";

oFF.QInARepoDrillPathOperation.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.DRILL_OPERATION;
};
oFF.QInARepoDrillPathOperation.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var drillOperation = null;
	var drillManager = parentComponent;
	var drillState = inaStructure.getStringByKey("DrillState");
	var drillMember = inaStructure.getStructureByKey("DrillMember");
	if (oFF.notNull(drillMember) && oFF.notNull(drillState))
	{
		var drillPath = oFF.XList.create();
		var drillContext = inaStructure.getListByKey("DrillContextMembers");
		if (oFF.notNull(drillContext))
		{
			var size = drillContext.size();
			for (var idxHierCtx = 0; idxHierCtx < size; idxHierCtx++)
			{
				var drillCtx = drillContext.getStructureAt(idxHierCtx);
				var drillPathElement = importer.importDrillPathElement(drillCtx, drillManager, context);
				drillPath.add(drillPathElement);
			}
		}
		var drillPathElementMember = importer.importDrillPathElement(drillMember, drillManager, context);
		drillPath.add(drillPathElementMember);
		drillOperation = drillManager.setDrillState(drillPath, oFF.QInAConverter.lookupDrillStateOp(drillState));
		var level = inaStructure.getIntegerByKeyExt("DrillLevel", 1);
		drillOperation.setRelativeLevelCount(level);
	}
	return drillOperation;
};
oFF.QInARepoDrillPathOperation.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var operation = modelComponent;
	if (operation.getType() === oFF.DrillOperationType.CONTEXT)
	{
		var inADrillState = oFF.QInAConverter.lookupDrillStateInA(operation.getDrillState());
		inaStructure.putString("DrillState", inADrillState);
		var relativeLevelCount = operation.getRelativeLevelCount();
		if (relativeLevelCount !== 1)
		{
			inaStructure.putInteger("DrillLevel", relativeLevelCount);
		}
		if (operation.getZoomStackPosition() !== -1)
		{
			inaStructure.putInteger("ZoomDrillStackPosition", operation.getZoomStackPosition());
		}
		if (operation.getRelativeLevelOffset() !== 0)
		{
			inaStructure.putInteger("DrillOffset", operation.getRelativeLevelOffset());
		}
		var drillPath = operation.getDrillPath();
		var drillPathCount = drillPath.size();
		if (drillPathCount > 0)
		{
			var element = drillPath.get(drillPathCount - 1);
			var inaPathElement = exporter.exportDrillPathElement(element, false);
			inaStructure.put("DrillMember", inaPathElement);
			if (drillPathCount > 1)
			{
				var inaDrillContextMembers = oFF.PrFactory.createList();
				inaStructure.put("DrillContextMembers", inaDrillContextMembers);
				for (var k = 0; k < drillPathCount - 1; k++)
				{
					element = drillPath.get(k);
					inaPathElement = exporter.exportDrillPathElement(element, true);
					inaDrillContextMembers.add(inaPathElement);
				}
			}
		}
	}
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};

oFF.QInARepoExceptions = function() {};
oFF.QInARepoExceptions.prototype = new oFF.QInARepository();
oFF.QInARepoExceptions.prototype._ff_c = "QInARepoExceptions";

oFF.QInARepoExceptions.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.EXCEPTION_MANAGER;
};
oFF.QInARepoExceptions.prototype.getTagName = function()
{
	return "ExceptionsRepo";
};
oFF.QInARepoExceptions.prototype.isVersion1 = function(qInA, modelComponent)
{
	var componentType = modelComponent.getOlapComponentType();
	var supportsExceptionsV2 = modelComponent.getModelCapabilities().supportsExceptionsV2();
	return !supportsExceptionsV2 && componentType.isTypeOf(oFF.MemberType.ABSTRACT_MEMBER);
};
oFF.QInARepoExceptions.prototype.isVersion2 = function(qInA, modelComponent)
{
	var componentType = modelComponent.getOlapComponentType();
	var supportsExceptionsV2 = modelComponent.getModelCapabilities().supportsExceptionsV2();
	return supportsExceptionsV2 && componentType.isTypeOf(oFF.OlapComponentType.QUERY_MODEL);
};
oFF.QInARepoExceptions.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	if (oFF.notNull(inaStructure))
	{
		var inaElements = inaStructure.getListByKey("Elements");
		this.importComponentWithList(importer, inaElements, modelComponent, parentComponent, context);
	}
	return modelComponent;
};
oFF.QInARepoExceptions.prototype.importComponentWithList = function(importer, inaList, component, parentComponent, context)
{
	var modelComponent = component;
	var exceptionManager = modelComponent.getQueryModel().getExceptionManager();
	exceptionManager.queueEventing();
	if (this.isVersion1(importer, modelComponent))
	{
		this.importFormatV1(importer, inaList, modelComponent, exceptionManager);
	}
	else if (this.isVersion2(importer, modelComponent))
	{
		this.importFormatV2(importer, inaList, modelComponent, exceptionManager);
	}
	exceptionManager.resumeEventing();
	return exceptionManager;
};
oFF.QInARepoExceptions.prototype.importFormatV1 = function(importer, inaList, member, exceptionManager)
{
	if (!oFF.PrUtils.isListEmpty(inaList))
	{
		var size = inaList.size();
		for (var exceptionIdx = 0; exceptionIdx < size; exceptionIdx++)
		{
			var inaException = inaList.getStructureAt(exceptionIdx);
			var newException = this.importExceptionWithoutEvaluates(importer, exceptionManager, inaException);
			if (oFF.notNull(newException))
			{
				this.importEvaluates(inaException, member, newException, importer);
				newException.setMeasure(member);
				newException.setIsChangeable(inaException.getBooleanByKeyExt("Changegable", true));
			}
		}
		this.removeModelElementsNotInInA(importer, inaList, exceptionManager, exceptionManager.getAllExceptionsOfMeasure(member));
	}
	else if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA)
	{
		exceptionManager.removeAllExceptionsOfMeasure(member);
	}
};
oFF.QInARepoExceptions.prototype.importExceptionWithoutEvaluates = function(importer, exceptionManager, inaException)
{
	var exceptionName = inaException.getStringByKey("Name");
	var exceptionText = inaException.getStringByKey("Text");
	var newException = exceptionManager.getByKey(exceptionName);
	if (oFF.isNull(newException) && this.newComponentCreationAllowed(importer, inaException))
	{
		newException = exceptionManager.addNewException(exceptionName, exceptionText);
	}
	if (oFF.notNull(newException))
	{
		newException.stopEventing();
		newException.setIsChangeable(true);
		newException.resumeEventing();
		if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || inaException.containsKey("EvaluateDefault"))
		{
			var evalType = oFF.QExceptionEvalType.lookupExceptionEvalType(inaException.getStringByKey("EvaluateDefault"));
			newException.setEvaluateDefault(evalType);
		}
		if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || inaException.containsKey("ApplySettingsToHeader"))
		{
			var headerSettings = oFF.QExceptionHeaderSettings.lookupExceptionHeaderSetting(inaException.getStringByKey("ApplySettingsToHeader"));
			newException.setHeaderSettingBase(headerSettings);
		}
		if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || inaException.containsKey("Active"))
		{
			var isActive = inaException.getBooleanByKeyExt("Active", true);
			newException.setActive(isActive);
		}
		if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || inaException.containsKey("EvaluateBeforePostAggregation"))
		{
			var isEvalAfterCalc = inaException.getBooleanByKeyExt("EvaluateBeforePostAggregation", true);
			newException.setEvaluationAfterCalculations(!isEvalAfterCalc);
		}
		newException.queueEventing();
		this.importThresholds(inaException, newException);
		newException.resumeEventing();
	}
	return newException;
};
oFF.QInARepoExceptions.prototype.importFormatV2 = function(importer, inaList, queryModel, exceptionManager)
{
	if (!oFF.PrUtils.isListEmpty(inaList))
	{
		var sizeExceptions = inaList.size();
		for (var iException = 0; iException < sizeExceptions; iException++)
		{
			var inaException = inaList.getStructureAt(iException);
			var structureContext = inaException.getListByKey("StructureContext");
			if (!oFF.PrUtils.isListEmpty(structureContext))
			{
				var exception = this.importContextItem(structureContext.getStructureAt(0), queryModel, exceptionManager, null, importer, inaException);
				if (oFF.notNull(exception))
				{
					if (structureContext.size() > 1)
					{
						this.importContextItem(structureContext.getStructureAt(1), queryModel, exceptionManager, exception, importer, inaException);
					}
					exception.setIsChangeable(inaException.getBooleanByKeyExt("Changegable", true));
				}
			}
		}
		this.removeModelElementsNotInInA(importer, inaList, exceptionManager, exceptionManager.getValuesAsReadOnlyList());
	}
	else if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA)
	{
		exceptionManager.clear();
	}
};
oFF.QInARepoExceptions.prototype.importContextItem = function(structure, queryModel, exceptionManager, exception, importer, inaException)
{
	var importedException = exception;
	var dimension = queryModel.getDimensionByNameFromExistingMetadata(structure.getStringByKey("DimensionName"));
	if (oFF.notNull(dimension))
	{
		if (oFF.isNull(importedException))
		{
			importedException = this.importExceptionWithoutEvaluates(importer, exceptionManager, inaException);
		}
		if (oFF.notNull(importedException))
		{
			var evaluateAllMembers = importedException.isEvaluateAllMembers(dimension);
			if (structure.containsKey("EvaluateAllMembers"))
			{
				evaluateAllMembers = structure.getBooleanByKeyExt("EvaluateAllMembers", false);
			}
			var member = this.getMemberFromContextItem(structure, dimension, evaluateAllMembers);
			if (oFF.notNull(member))
			{
				if (oFF.isNull(exception))
				{
					this.importEvaluates(inaException, member, importedException, importer);
				}
				if (dimension.isMeasureStructure())
				{
					importedException.setMeasure(member);
				}
				else
				{
					importedException.setStructure(member);
				}
				importedException.displayOnOtherMember(member, dimension.getStructureMember(structure.getStringByKey("DisplayOnOtherMember")));
				importedException.setEvaluateAllMembers(dimension, evaluateAllMembers);
			}
		}
	}
	return importedException;
};
oFF.QInARepoExceptions.prototype.getMemberFromContextItem = function(structure, dimension, evaluateAllMembers)
{
	var member = dimension.getStructureMember(structure.getStringByKey("MemberName"));
	if (oFF.isNull(member))
	{
		var allStructureMembers = dimension.getAllStructureMembers();
		if (evaluateAllMembers && !allStructureMembers.isEmpty())
		{
			member = allStructureMembers.get(0);
		}
	}
	return member;
};
oFF.QInARepoExceptions.prototype.importEvaluates = function(inaException, member, newException, importer)
{
	newException.queueEventing();
	var inaEvaluates = inaException.getListByKey("EvaluateOn");
	if (!oFF.PrUtils.isListEmpty(inaEvaluates))
	{
		newException.removeAllEvaluates();
		var size = inaEvaluates.size();
		var queryModel = member.getQueryModel();
		for (var evalIdx = 0; evalIdx < size; evalIdx++)
		{
			var inaEvaluate = inaEvaluates.getStructureAt(evalIdx);
			var fieldName = inaEvaluate.getStringByKey("Name");
			var someField = queryModel.getFieldByName(fieldName);
			if (oFF.isNull(someField))
			{
				var dimensionByName = queryModel.getDimensionByNameFromExistingMetadata(fieldName);
				if (oFF.notNull(dimensionByName))
				{
					someField = dimensionByName.getKeyField();
				}
			}
			if (oFF.isNull(someField))
			{
				someField = member.getKeyFieldValue().getField();
			}
			if (oFF.isNull(someField))
			{
				importer.addError(oFF.ErrorCodes.INVALID_TOKEN, oFF.XStringUtils.concatenate3("Could not find field '", fieldName, "'!"));
				return;
			}
			if (!inaEvaluate.containsKey("Low"))
			{
				importer.addError(oFF.ErrorCodes.INVALID_PARAMETER, oFF.XStringUtils.concatenate2("No low value for field: ", fieldName));
				return;
			}
			var valueType = someField.getValueType();
			var lowValue = oFF.QInAValueUtils.importValueByType(importer, inaEvaluate, "Low", valueType);
			if (importer.hasErrors())
			{
				importer.addError(oFF.ErrorCodes.INVALID_DATATYPE, oFF.XStringUtils.concatenate2("Unexpected low valuetype for field: ", valueType.getName()));
				return;
			}
			var newEvaluate = newException._addNewEvaluateWithFieldInternal(someField, lowValue);
			if (inaEvaluate.containsKey("High"))
			{
				var highValue = oFF.QInAValueUtils.importValueByType(importer, inaEvaluate, "High", valueType);
				if (importer.hasErrors())
				{
					importer.addError(oFF.ErrorCodes.INVALID_DATATYPE, oFF.XStringUtils.concatenate2("Unexpected high valuetype for field: ", valueType.getName()));
					return;
				}
				newEvaluate.setHighValue(highValue);
			}
			newEvaluate.setEvaluate(oFF.QExceptionEvalType.lookupExceptionEvalType(inaEvaluate.getStringByKey("Evaluate")));
			var operatorName = inaEvaluate.getStringByKey("Comparison");
			var operator = oFF.QInAConverter.lookupComparison(operatorName);
			if (oFF.isNull(operator))
			{
				importer.addError(oFF.ErrorCodes.INVALID_OPERATOR, oFF.XStringUtils.concatenate3("Unexpected comparison operator for evaluate: Operator: '", operatorName, "'"));
				return;
			}
			newEvaluate.setOperator(operator);
		}
	}
	newException.resumeEventing();
};
oFF.QInARepoExceptions.prototype.importThresholds = function(inaException, newException)
{
	var inaThresholds = inaException.getListByKey("Threshold");
	if (!oFF.PrUtils.isListEmpty(inaThresholds))
	{
		newException.removeAllThresholds();
		var size = inaThresholds.size();
		for (var thresholdIdx = 0; thresholdIdx < size; thresholdIdx++)
		{
			var inaThreshold = inaThresholds.getStructureAt(thresholdIdx);
			var alertLevel = inaThreshold.getIntegerByKeyExt("AlertLevel", -9999);
			var newThreshold;
			var isDouble = !inaThreshold.hasStringByKey("Low");
			if (isDouble)
			{
				newThreshold = newException._addNewThresholdInternal(inaThreshold.getDoubleByKey("Low"), oFF.QInAConverter.lookupAlertLevel(alertLevel));
			}
			else
			{
				newThreshold = newException._addNewThresholdWithStringInternal(inaThreshold.getStringByKey("Low"), oFF.QInAConverter.lookupAlertLevel(alertLevel));
			}
			var name = inaThreshold.getStringByKey("Name");
			if (oFF.notNull(name))
			{
				newThreshold.setName(name);
			}
			var operator = oFF.QInAConverter.lookupComparison(inaThreshold.getStringByKey("Comparison"));
			newThreshold.setOperator(operator);
			if (operator.getNumberOfParameters() === 2)
			{
				if (isDouble)
				{
					var highDouble = inaThreshold.getDoubleByKey("High");
					newThreshold.setHighValue(highDouble);
				}
				else
				{
					var highString = inaThreshold.getStringByKey("High");
					newThreshold.setHigh(highString);
				}
			}
			this.importSettings(inaThreshold.getListByKey("Settings"), newThreshold);
		}
	}
};
oFF.QInARepoExceptions.prototype.importSettings = function(inaSettings, newThreshold)
{
	if (oFF.notNull(inaSettings))
	{
		var size = inaSettings.size();
		for (var iSetting = 0; iSetting < size; iSetting++)
		{
			var inaSetting = inaSettings.getStructureAt(iSetting);
			var name = inaSetting.getStringByKey("Name");
			var priority = inaSetting.getIntegerByKey("Priority");
			var value = inaSetting.getStringByKey("Value");
			if (oFF.notNull(value) && !oFF.XString.isEqual(value, ""))
			{
				var newSetting = newThreshold.addNewSetting(name, priority);
				newSetting.setValue(value);
			}
		}
	}
};
oFF.QInARepoExceptions.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var list = this.exportComponentWithList(exporter, modelComponent, flags);
	if (oFF.notNull(list))
	{
		inaStructure.put("Elements", list);
	}
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};
oFF.QInARepoExceptions.prototype.exportComponentWithList = function(exporter, modelComponent, flags)
{
	var inaResult = null;
	if (this.isVersion1(exporter, modelComponent))
	{
		inaResult = this.exportFormatV1(exporter, modelComponent);
	}
	else if (this.isVersion2(exporter, modelComponent))
	{
		inaResult = this.exportFormatV2(exporter, modelComponent);
	}
	return inaResult;
};
oFF.QInARepoExceptions.prototype.exportFormatV1 = function(exporter, structureMember)
{
	var inaExceptionsList = null;
	var exceptions = structureMember.getExceptions();
	if (oFF.notNull(exceptions))
	{
		var sizeExceptions = exceptions.size();
		if (sizeExceptions > 0)
		{
			inaExceptionsList = oFF.PrFactory.createList();
			var isBw = exporter.isAbap(structureMember);
			for (var iException = 0; iException < sizeExceptions; iException++)
			{
				var exception = exceptions.get(iException);
				var shouldContinueExporting = exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || exception.isChangeable() || exception.getModCounter() > 0;
				if (shouldContinueExporting)
				{
					var structure = this.exportException(exporter, exception, isBw);
					if (oFF.isNull(structure))
					{
						break;
					}
					inaExceptionsList.add(structure);
				}
			}
		}
	}
	return inaExceptionsList;
};
oFF.QInARepoExceptions.prototype.exportException = function(exporter, exception, isBw)
{
	var inaExceptionStruct = oFF.PrFactory.createStructure();
	if (exporter.mode === oFF.QModelFormat.INA_REPOSITORY_DELTA && !exception.isChangeable() && exception.hasPropertyChanged(oFF.QExceptionProperties.QY_ACTIVE))
	{
		inaExceptionStruct.putString("Name", exception.getName());
		inaExceptionStruct.putBoolean("Active", exception.isActive());
		inaExceptionStruct.putBoolean("Changegable", exception.isChangeable());
	}
	if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || exception.isChangeable())
	{
		if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || exception.hasPropertyChanged(oFF.QExceptionProperties.QY_ACTIVE))
		{
			inaExceptionStruct.putBoolean("Active", exception.isActive());
		}
		if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || exception.hasPropertyChanged(oFF.QExceptionProperties.QY_EVALUATE_BEFORE_POST_AGGREGATION))
		{
			inaExceptionStruct.putBoolean("EvaluateBeforePostAggregation", !exception.isEvaluatedAfterCalculations());
		}
		inaExceptionStruct.putBoolean("Changegable", exception.isChangeable());
		var thresholds = exception.getThresholds();
		this.exportThresholds(thresholds, exporter, inaExceptionStruct, isBw);
		this.exportEvaluates(exception.getEvaluates(), exporter, inaExceptionStruct, isBw);
		inaExceptionStruct.putString("Name", exception.getName());
		inaExceptionStruct.putString("Text", exception.getText());
		var headerSetting = exception.getHeaderSetting();
		if (headerSetting !== oFF.QExceptionHeaderSettings.NONE)
		{
			inaExceptionStruct.putString("ApplySettingsToHeader", headerSetting.getName());
		}
		inaExceptionStruct.putString("EvaluateDefault", exception.getEvaluateDefault().toString());
	}
	var repoDeltaFeatureActivated = exception.getSession().hasFeature(oFF.FeatureToggleOlap.INA_REPOSITORY_DELTA);
	if (repoDeltaFeatureActivated && exception.canMaterializeCompleteObject())
	{
		inaExceptionStruct.putBoolean("UserDefinedComponent", true);
	}
	return inaExceptionStruct;
};
oFF.QInARepoExceptions.prototype.exportFormatV2 = function(exporter, queryModel)
{
	var exceptions = null;
	var exceptionManager = queryModel.getExceptionManager();
	var size = exceptionManager.size();
	if (size > 0)
	{
		exceptions = oFF.PrFactory.createList();
		var isBw = exporter.isAbap(queryModel);
		for (var i = 0; i < size; i++)
		{
			var exception = exceptionManager.get(i);
			var shouldContinueExporting = exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || exception.isChangeable() || exception.getModCounter() > 0;
			if (shouldContinueExporting)
			{
				var inaException = this.getExportedExceptionStructureByName(exceptions, exception.getName());
				if (oFF.isNull(inaException))
				{
					inaException = this.exportException(exporter, exception, isBw);
					if (oFF.notNull(inaException))
					{
						inaException.putNewList("StructureContext");
						exceptions.add(inaException);
					}
				}
				if (oFF.notNull(inaException))
				{
					var structureContext = inaException.getListByKey("StructureContext");
					this.exportStructureContextItem(exporter, structureContext, exception.getMeasure(), exception);
					this.exportStructureContextItem(exporter, structureContext, exception.getStructure(), exception);
				}
			}
		}
	}
	return exceptions;
};
oFF.QInARepoExceptions.prototype.getExportedExceptionStructureByName = function(exceptions, exceptionName)
{
	var inaResult = null;
	var size = exceptions.size();
	for (var i = 0; i < size; i++)
	{
		var inaStructure = exceptions.getStructureAt(i);
		if (oFF.XString.isEqual(inaStructure.getStringByKey("Name"), exceptionName))
		{
			inaResult = inaStructure;
			break;
		}
	}
	return inaResult;
};
oFF.QInARepoExceptions.prototype.exportStructureContextItem = function(exporter, structureContext, member, exception)
{
	if (oFF.notNull(member))
	{
		var structure = structureContext.addNewStructure();
		var dimension = member.getDimension();
		structure.putString("DimensionName", dimension.getName());
		structure.putString("MemberName", member.getName());
		var evaluateAllMembers = exception.isEvaluateAllMembers(dimension);
		var deltaExportMode = exporter.mode === oFF.QModelFormat.INA_REPOSITORY_DELTA;
		var measureDimension = dimension.getDimensionType() === oFF.DimensionType.MEASURE_STRUCTURE;
		var shouldWrite = measureDimension && exception.hasPropertyChanged(oFF.QExceptionProperties.QY_EVALUATE_ALL_MEMBERS_MEASURE_DIMENSION) || !measureDimension && exception.hasPropertyChanged(oFF.QExceptionProperties.QY_EVALUATE_ALL_MEMBERS_SECONDARY_STRUCTURE);
		if (!deltaExportMode && evaluateAllMembers || deltaExportMode && shouldWrite)
		{
			structure.putBoolean("EvaluateAllMembers", evaluateAllMembers);
		}
		var memberForDisplay = exception.getDisplayOnOtherMember(member);
		oFF.QInAExportUtil.setNameIfNotNull(structure, "DisplayOnOtherMember", memberForDisplay);
	}
};
oFF.QInARepoExceptions.prototype.exportEvaluates = function(evaluates, exporter, inaStructure, isBw)
{
	var shouldContinueExporting = exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || evaluates.getModCounter() > 0;
	if (shouldContinueExporting)
	{
		if (evaluates.hasElements())
		{
			var inaEvaluatesList = inaStructure.putNewList("EvaluateOn");
			var sizeEvaluates = evaluates.size();
			for (var iEvaluate = 0; iEvaluate < sizeEvaluates; iEvaluate++)
			{
				var inaEvaluateStruct = inaEvaluatesList.addNewStructure();
				var evaluate = evaluates.get(iEvaluate);
				inaEvaluateStruct.putString("Name", evaluate.getField().getName());
				inaEvaluateStruct.putString("Evaluate", evaluate.getEvaluate().toString());
				var comparisonOperator = evaluate.getOperator();
				var comparison;
				if (comparisonOperator === oFF.ComparisonOperator.NOT_BETWEEN && isBw)
				{
					comparison = "NOTBETWEEN";
				}
				else
				{
					comparison = oFF.QInAConverter.lookupComparisonInA(comparisonOperator);
				}
				inaEvaluateStruct.putString("Comparison", comparison);
				oFF.QInAValueUtils.exportPlaceholderValue(exporter, "Low", inaEvaluateStruct, evaluate.getLowValue(), evaluate.getValueType(), evaluate.getQueryModel());
				if (!inaEvaluateStruct.containsKey("Low"))
				{
					inaEvaluateStruct.putString("Low", "");
				}
				if (comparisonOperator.getNumberOfParameters() > 1)
				{
					oFF.QInAValueUtils.exportPlaceholderValue(exporter, "High", inaEvaluateStruct, evaluate.getHighValue(), evaluate.getValueType(), evaluate.getQueryModel());
				}
			}
		}
	}
};
oFF.QInARepoExceptions.prototype.exportThresholds = function(thresholds, exporter, inaStructure, isBw)
{
	var shouldContinueExporting = exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || thresholds.getModCounter() > 0;
	if (shouldContinueExporting)
	{
		var inaThresholdsList = inaStructure.putNewList("Threshold");
		var sizeThresholds = thresholds.size();
		for (var iThreshold = 0; iThreshold < sizeThresholds; iThreshold++)
		{
			var threshold = thresholds.get(iThreshold);
			var inaThresholdStruct = inaThresholdsList.addNewStructure();
			var name = threshold.getName();
			if (!oFF.XString.isEqual(name, "Settings"))
			{
				inaThresholdStruct.putStringNotNull("Name", name);
			}
			var comparisonOperator = threshold.getOperator();
			var comparison;
			if (comparisonOperator === oFF.ComparisonOperator.NOT_BETWEEN && isBw)
			{
				comparison = "NOTBETWEEN";
			}
			else
			{
				comparison = oFF.QInAConverter.lookupComparisonInA(comparisonOperator);
			}
			inaThresholdStruct.putString("Comparison", comparison);
			var isDouble = threshold.getValueType() === oFF.XValueType.DOUBLE;
			if (threshold.getLowXValue() !== null)
			{
				if (isDouble)
				{
					inaThresholdStruct.putDouble("Low", threshold.getLowValue());
				}
				else
				{
					inaThresholdStruct.putString("Low", threshold.getLow());
				}
			}
			if (threshold.getHighXValue() !== null && comparisonOperator.getNumberOfParameters() > 1)
			{
				if (isDouble)
				{
					inaThresholdStruct.putDouble("High", threshold.getHighValue());
				}
				else
				{
					inaThresholdStruct.putString("High", threshold.getHigh());
				}
			}
			if (!threshold.isEmpty())
			{
				this.exportSettings(threshold, exporter, inaThresholdStruct);
			}
			else
			{
				inaThresholdStruct.putInteger("AlertLevel", threshold.getAlertLevel().getLevel());
			}
		}
	}
};
oFF.QInARepoExceptions.prototype.exportSettings = function(threshold, exporter, inaThresholdStruct)
{
	var inaSettings = inaThresholdStruct.putNewList("Settings");
	var size = threshold.size();
	for (var iSetting = 0; iSetting < size; iSetting++)
	{
		var setting = threshold.get(iSetting);
		var inaSetting = inaSettings.addNewStructure();
		inaSetting.putString("Name", setting.getName());
		inaSetting.putInteger("Priority", setting.getPriority());
		var value = setting.getValue();
		if (oFF.isNull(value) || oFF.XString.isEqual(value, ""))
		{
			exporter.addError(oFF.ErrorCodes.INVALID_PARAMETER, "Exception Threshold Setting is missing it's value");
		}
		else
		{
			inaSetting.putString("Value", value);
		}
	}
};

oFF.QInARepoField = function() {};
oFF.QInARepoField.prototype = new oFF.QInARepository();
oFF.QInARepoField.prototype._ff_c = "QInARepoField";

oFF.QInARepoField.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.FIELD;
};
oFF.QInARepoField.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var field = modelComponent;
	if (oFF.isNull(field))
	{
		var name = inaStructure.getStringByKey("Name");
		var dimension = parentComponent;
		if (dimension.getDimensionType() === oFF.DimensionType.FORMULA_CALCULATED_DIMENSION)
		{
			field = dimension.addNewFormulaCalcField(oFF.PresentationType.lookup(inaStructure.getStringByKey("PresentationType")), name);
		}
		else
		{
			field = dimension.getFieldByName(name);
		}
	}
	if (oFF.notNull(field))
	{
		var inaTextTransformation = inaStructure.getStringByKey("TextTransformation");
		if (oFF.notNull(inaTextTransformation))
		{
			var textTransformation = oFF.QInAConverter.lookupTextTransformation(inaTextTransformation);
			field.setTextTransformation(textTransformation);
		}
		field.setDisplayFormat(inaStructure.getStringByKey("DisplayFormat"));
		if (field.getDimension().getDimensionType() === oFF.DimensionType.FORMULA_CALCULATED_DIMENSION)
		{
			var inaFormula = inaStructure.getStructureByKey("Formula");
			if (oFF.notNull(inaFormula))
			{
				var newFieldFormula = oFF.QInARepoMemberFormulaMeasure.importFormulaMeasure(importer, field.getDimension(), inaStructure.getStructureByKey("Formula"), null, context);
				field.setFormulaItem(newFieldFormula);
			}
			if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || inaStructure.containsKey("AutoSignFlip"))
			{
				var autoSignFlip = inaStructure.getBooleanByKeyExt("AutoSignFlip", false);
				field.setAutoSignFlip(autoSignFlip);
			}
			var crossCalculationMeasure = inaStructure.getStringByKey("CrossCalculationMeasure");
			if (oFF.notNull(crossCalculationMeasure))
			{
				field.setCrossCalculationMeasure(crossCalculationMeasure);
			}
		}
	}
	return field;
};
oFF.QInARepoField.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var field = modelComponent;
	inaStructure.putString("Name", field.getName());
	inaStructure.putStringNotNull("DisplayFormat", field.getDisplayFormat());
	var textTransformationType = field.getTextTransformation();
	if (oFF.notNull(textTransformationType))
	{
		var inaTextTransform = oFF.QInAConverter.lookupTextTransformationInA(textTransformationType);
		inaStructure.putString("TextTransformation", inaTextTransform);
	}
	if (field.getDimension().getDimensionType() === oFF.DimensionType.FORMULA_CALCULATED_DIMENSION)
	{
		inaStructure.putString("PresentationType", field.getPresentationType().getName());
		var calcField = field;
		if (calcField.getFormulaItem() !== null)
		{
			oFF.QInARepoMemberAbstract.exportFormulaItem(exporter, calcField.getFormulaItem(), inaStructure.putNewStructure("Formula"), field);
		}
		if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || calcField.hasPropertyChanged(oFF.QFieldProperties.QY_AUTO_SIGN_FLIP))
		{
			if (calcField.isAutoSignFlip() || exporter.mode === oFF.QModelFormat.INA_REPOSITORY_DELTA && calcField.hasPropertyChanged(oFF.QFieldProperties.QY_AUTO_SIGN_FLIP))
			{
				inaStructure.putBoolean("AutoSignFlip", calcField.isAutoSignFlip());
			}
		}
		inaStructure.putStringNotNull("CrossCalculationMeasure", calcField.getCrossCalculationMeasure());
	}
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};

oFF.QInARepoFilter = function() {};
oFF.QInARepoFilter.prototype = new oFF.QInARepository();
oFF.QInARepoFilter.prototype._ff_c = "QInARepoFilter";

oFF.QInARepoFilter.prototype.exportFilter = function(exporter, filter, filterExpressionState, layeredFilter, tmpFilter)
{
	return exporter.exportFilterExpression(filterExpressionState);
};
oFF.QInARepoFilter.prototype.isValidFilterExpression = function(filterExpressionState)
{
	if (oFF.isNull(filterExpressionState))
	{
		return false;
	}
	var filterRootElement = filterExpressionState.getFilterRootElement();
	if (oFF.isNull(filterRootElement))
	{
		return false;
	}
	var filterComponentType = filterRootElement.getOlapComponentType();
	return filterComponentType !== oFF.FilterComponentType.FILTER_ACROSS_MODELS && filterComponentType !== oFF.FilterComponentType.FILTER_MEASURE_BASED;
};

oFF.QInARepoFilterAcrossModels = function() {};
oFF.QInARepoFilterAcrossModels.prototype = new oFF.QInARepository();
oFF.QInARepoFilterAcrossModels.prototype._ff_c = "QInARepoFilterAcrossModels";

oFF.QInARepoFilterAcrossModels.prototype.getComponentType = function()
{
	return oFF.FilterComponentType.FILTER_ACROSS_MODELS;
};
oFF.QInARepoFilterAcrossModels.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var name = inaStructure.getStringByKey("Name");
	var fam = modelComponent;
	if (oFF.isNull(fam))
	{
		fam = oFF.QFactory.createFilterAcrossModels(context, name);
	}
	var inaLinks = inaStructure.getListByKey("Links");
	var sizeLinks = inaLinks.size();
	for (var idxLink = 0; idxLink < sizeLinks; idxLink++)
	{
		var inaLink = inaLinks.getStructureAt(idxLink);
		var first = oFF.QInARepoUtils.importLinkPart(context, inaLink.getStructureByKey("FirstDimension"));
		var second = oFF.QInARepoUtils.importLinkPart(context, inaLink.getStructureByKey("SecondDimension"));
		fam.addNewLinkFromParts(first, second);
	}
	var inaMeasureNames = inaStructure.getListByKey("MeasureNames");
	var sizeMeasureNames = inaMeasureNames.size();
	for (var idxMeasureName = 0; idxMeasureName < sizeMeasureNames; idxMeasureName++)
	{
		fam.addMeasureName(inaMeasureNames.getStringAt(idxMeasureName));
	}
	var inaSecondaryMeasureNames = inaStructure.getListByKey("SecondaryMeasureNames");
	if (oFF.notNull(inaSecondaryMeasureNames))
	{
		for (var idxSecondaryMeasureName = 0; idxSecondaryMeasureName < inaSecondaryMeasureNames.size(); idxSecondaryMeasureName++)
		{
			fam.addSecondaryMeasureName(inaSecondaryMeasureNames.getStringAt(idxSecondaryMeasureName));
		}
	}
	oFF.QInARepoUtils.importLayeredFilters(importer, fam, inaStructure.getListByKey("LayeredFilters"));
	if (inaStructure.containsKey("PreferPrequeryBasedStrategy"))
	{
		fam.setPreferPrequeryBasedStrategy(true);
	}
	return fam;
};
oFF.QInARepoFilterAcrossModels.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var fam = modelComponent;
	inaStructure.putString("Name", fam.getName());
	var inaLinks = inaStructure.putNewList("Links");
	var iterator = fam.getLinks().getIterator();
	while (iterator.hasNext())
	{
		var inaLink = inaLinks.addNewStructure();
		var link = iterator.next();
		oFF.QInARepoUtils.exportLinkPart(exporter, inaLink.putNewStructure("FirstDimension"), link.getFirstPart());
		oFF.QInARepoUtils.exportLinkPart(exporter, inaLink.putNewStructure("SecondDimension"), link.getSecondPart());
	}
	var inaMeasureNames = inaStructure.putNewList("MeasureNames");
	inaMeasureNames.addAllStrings(fam.getMeasureNames());
	var inaSecondaryMeasureNames = inaStructure.putNewList("SecondaryMeasureNames");
	inaSecondaryMeasureNames.addAllStrings(fam.getSecondaryMeasureNames());
	inaStructure.put("LayeredFilters", oFF.QInARepoUtils.exportLayeredFilters(exporter, fam));
	if (fam.getPreferPrequeryBasedStrategy())
	{
		inaStructure.putBoolean("PreferPrequeryBasedStrategy", true);
	}
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};

oFF.QInARepoFilterAlgebra = function() {};
oFF.QInARepoFilterAlgebra.prototype = new oFF.QInARepository();
oFF.QInARepoFilterAlgebra.prototype._ff_c = "QInARepoFilterAlgebra";

oFF.QInARepoFilterAlgebra.prototype.getComponentType = function()
{
	return oFF.FilterComponentType.BOOLEAN_ALGEBRA;
};
oFF.QInARepoFilterAlgebra.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var filterExpression = null;
	if (oFF.notNull(parentComponent))
	{
		var parentFilterElement = parentComponent;
		filterExpression = parentFilterElement.getFilterExpression();
	}
	var code = inaStructure.getStringByKey("Code");
	var filterAlgebra;
	if (oFF.XString.isEqual(code, "And"))
	{
		filterAlgebra = oFF.QFilterAnd._create(context, filterExpression);
	}
	else if (oFF.XString.isEqual(code, "Not"))
	{
		filterAlgebra = oFF.QFilterNot._create(context, filterExpression);
	}
	else
	{
		filterAlgebra = oFF.QFilterOr._create(context, filterExpression);
	}
	var uniqueId = inaStructure.getStringByKey("Id");
	filterAlgebra.setUniqueId(uniqueId);
	var inaSubSelections = inaStructure.getListByKey("SubSelections");
	if (oFF.notNull(inaSubSelections))
	{
		var size = inaSubSelections.size();
		for (var i = 0; i < size; i++)
		{
			var subSelection = inaSubSelections.getStructureAt(i);
			var child = importer.importComponent(null, subSelection, null, filterAlgebra, context);
			if (oFF.notNull(child))
			{
				filterAlgebra.add(child);
			}
		}
	}
	return filterAlgebra;
};
oFF.QInARepoFilterAlgebra.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var type = modelComponent.getComponentType();
	var qLogicalContainer = modelComponent;
	if (type.isTypeOf(oFF.FilterComponentType.AND))
	{
		inaStructure.putString("Code", "And");
		inaStructure.putString("Id", qLogicalContainer.getUniqueId());
	}
	else if (type.isTypeOf(oFF.FilterComponentType.OR))
	{
		inaStructure.putString("Code", "Or");
		inaStructure.putString("Id", qLogicalContainer.getUniqueId());
	}
	else if (type.isTypeOf(oFF.FilterComponentType.NOT))
	{
		inaStructure.putString("Code", "Not");
		inaStructure.putString("Id", qLogicalContainer.getUniqueId());
	}
	var inaSubSelections = inaStructure.putNewList("SubSelections");
	var size = qLogicalContainer.size();
	for (var i = 0; i < size; i++)
	{
		var inaChildElement = exporter.exportComponent(null, qLogicalContainer.get(i), null, flags);
		if (oFF.notNull(inaChildElement))
		{
			inaSubSelections.add(inaChildElement);
		}
	}
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};

oFF.QInARepoFilterAll = function() {};
oFF.QInARepoFilterAll.prototype = new oFF.QInARepository();
oFF.QInARepoFilterAll.prototype._ff_c = "QInARepoFilterAll";

oFF.QInARepoFilterAll.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.SELECTOR;
};
oFF.QInARepoFilterAll.prototype.getTagName = function()
{
	return "FilterRepo";
};
oFF.QInARepoFilterAll.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var filter = modelComponent;
	var inaFilterExpression = inaStructure.getStructureByKey("DynamicFilter");
	if (oFF.notNull(inaFilterExpression))
	{
		var selectionStateContainer = filter.getDynamicFilter();
		importer.importFilterExpression(selectionStateContainer, inaFilterExpression, filter, context);
	}
	else if (filter.isDynamicFilterInitialized())
	{
		filter.setDynamicFilter(null);
	}
	var inaVisibilityExpression = inaStructure.getStructureByKey("VisibilityFilter");
	if (oFF.notNull(inaVisibilityExpression))
	{
		var selectionVisibilityContainer = filter.getVisibilityFilter();
		importer.importFilterExpression(selectionVisibilityContainer, inaVisibilityExpression, filter, context);
	}
	else if (filter.isVisibilityFilterInitialized())
	{
		filter.setVisibilityFilter(null);
	}
	var inaSpaceExpression = inaStructure.getStructureByKey("FixedFilter");
	if (oFF.notNull(inaSpaceExpression))
	{
		var selectionSpaceContainer = filter.getFixedFilter();
		importer.importFilterExpression(selectionSpaceContainer, inaSpaceExpression, filter, context);
	}
	else if (filter.isFixedFilterInitialized())
	{
		filter.setFixedFilter(null);
	}
	var inaValueHelpExpression = inaStructure.getStructureByKey("ValueHelpFilter");
	if (oFF.notNull(inaValueHelpExpression))
	{
		var valueHelpContainer = filter.getValuehelpFilter();
		importer.importFilterExpression(valueHelpContainer, inaValueHelpExpression, filter, context);
	}
	var inaValueHelpVisibilityExpression = inaStructure.getStructureByKey("ValueHelpVisibilityFilter");
	if (oFF.notNull(inaValueHelpVisibilityExpression))
	{
		var valueHelpVisibilityContainer = filter.getValuehelpVisibilityFilter();
		importer.importFilterExpression(valueHelpVisibilityContainer, inaValueHelpVisibilityExpression, filter, context);
	}
	var inaLayeredFilters = inaStructure.getListByKey("LayeredFilters");
	if (oFF.notNull(inaLayeredFilters))
	{
		var importedLayeredFilters = oFF.QInARepoUtils.importLayeredFilters(importer, filter, inaLayeredFilters);
		oFF.XCollectionUtils.forEach(importedLayeredFilters,  function(layeredFilter){
			layeredFilter.setPreserveOnRepoSerialization(true);
		}.bind(this));
	}
	return filter;
};
oFF.QInARepoFilterAll.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var filter = modelComponent;
	if (filter.isDynamicFilterInitialized())
	{
		var selectionStateContainer = filter.getDynamicFilter();
		var inaState = exporter.exportFilterExpression(selectionStateContainer);
		inaStructure.put("DynamicFilter", inaState);
	}
	if (filter.isVisibilityFilterInitialized())
	{
		var selectionVisibilityContainer = filter.getVisibilityFilter();
		var inaVisibility = exporter.exportFilterExpression(selectionVisibilityContainer);
		inaStructure.put("VisibilityFilter", inaVisibility);
	}
	if (filter.isFixedFilterInitialized())
	{
		var selectionSpaceContainer = filter.getFixedFilter();
		var inaSpace = exporter.exportFilterExpression(selectionSpaceContainer);
		inaStructure.put("FixedFilter", inaSpace);
	}
	if (filter.isValueHelpFilterInitialized())
	{
		var valueHelpContainer = filter.getValuehelpFilter();
		var inaValueHelp = exporter.exportFilterExpression(valueHelpContainer);
		inaStructure.put("ValueHelpFilter", inaValueHelp);
	}
	if (filter.isValueHelpVisibilityFilterInitialized())
	{
		var valueHelpVisibilityContainer = filter.getValuehelpVisibilityFilter();
		var inaValueHelpVisibility = exporter.exportFilterExpression(valueHelpVisibilityContainer);
		inaStructure.put("ValueHelpVisibilityFilter", inaValueHelpVisibility);
	}
	var layeredFilters = oFF.QInARepoUtils.exportLayeredFiltersExt(exporter, filter,  function(filterExpression){
		return oFF.XBooleanValue.create(filterExpression.isPreservedInRepoSerialization());
	}.bind(this));
	if (layeredFilters.hasElements())
	{
		inaStructure.put("LayeredFilters", layeredFilters);
	}
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};

oFF.QInARepoFilterCartesianList = function() {};
oFF.QInARepoFilterCartesianList.prototype = new oFF.QInARepository();
oFF.QInARepoFilterCartesianList.prototype._ff_c = "QInARepoFilterCartesianList";

oFF.QInARepoFilterCartesianList.prototype.getComponentType = function()
{
	return oFF.FilterComponentType.CARTESIAN_LIST;
};
oFF.QInARepoFilterCartesianList.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var filterExpression = null;
	if (oFF.notNull(parentComponent))
	{
		var parentFilterElement = parentComponent;
		filterExpression = parentFilterElement.getFilterExpression();
	}
	var cartesianList = modelComponent;
	if (oFF.isNull(cartesianList))
	{
		cartesianList = oFF.notNull(filterExpression) ? oFF.QFactory.createFilterCartesianList(filterExpression) : oFF.QFactory.createFilterCartesianList(context);
	}
	var fieldName = inaStructure.getStringByKey("FieldName");
	if (oFF.notNull(fieldName) && oFF.notNull(context))
	{
		var fieldAccessor = context.getFieldAccessorSingle();
		var calcDimField = null;
		if (oFF.isNull(fieldAccessor) || inaStructure.containsKey("QY_CACHE_CONTEXT"))
		{
			var inaCache = inaStructure.getStructureByKey("QY_CACHE_CONTEXT");
			if (oFF.isNull(inaCache))
			{
				return null;
			}
			var cacheKey = oFF.QInARepoUtils.importCacheKey(inaCache);
			var fieldMetadata = context.getOlapEnv().getFieldMetadata(cacheKey);
			if (oFF.isNull(fieldMetadata) && inaCache.containsKey("StorageName"))
			{
				var clientQueryObjectManagerStorageName = inaCache.getStringByKey("StorageName");
				calcDimField = oFF.QInARepoUtils.getFormulaCalcDimField(context, cacheKey.getKey1(), clientQueryObjectManagerStorageName);
				if (oFF.notNull(calcDimField))
				{
					cartesianList.setField(calcDimField);
				}
			}
			if (oFF.notNull(fieldMetadata))
			{
				cartesianList.setFieldMetadata(fieldMetadata);
			}
			else if (oFF.isNull(calcDimField))
			{
				return null;
			}
		}
		else
		{
			var field = fieldAccessor.getFieldByName(fieldName);
			if (oFF.isNull(field))
			{
				field = oFF.QInARepoUtils.getFormulaCalcDimField(context, fieldName, context.getQueryManager().getClientQueryObjectStorageName());
				if (oFF.isNull(field))
				{
					return null;
				}
			}
			if (field.getDimension().isEnforcedDynamicValue() && context.getQueryManager() !== null && context.getQueryManager().isSuppressExitVariableValuesInRepoMode())
			{
				return null;
			}
			cartesianList.setField(field);
			var supplementsFieldsNamesList = inaStructure.getListByKey("SupplementsFieldNames");
			if (oFF.notNull(supplementsFieldsNamesList))
			{
				var len = supplementsFieldsNamesList.size();
				for (var y = 0; y < len; y++)
				{
					var name = supplementsFieldsNamesList.getStringAt(y);
					var supplField = fieldAccessor.getFieldByName(name);
					cartesianList.addSupplementField(supplField);
				}
			}
		}
	}
	oFF.QInARepoHierarchy.importHierarchyForFilter(importer.isAbap(context), importer.getSession().hasFeature(oFF.FeatureToggleOlap.HIERARCHY_INFO_IN_FILTER), inaStructure, cartesianList, oFF.FilterComponentType.CARTESIAN_LIST);
	var uniqueId = inaStructure.getStringByKey("Id");
	cartesianList.setUniqueId(uniqueId);
	var isConvertToFlatFilter = inaStructure.getBooleanByKeyExt("ConvertToFlatSelection", false);
	cartesianList.setConvertToFlatFilter(isConvertToFlatFilter);
	var inaElements = inaStructure.getListByKey("Elements");
	cartesianList.clear();
	if (oFF.notNull(inaElements))
	{
		var size = inaElements.size();
		for (var i = 0; i < size; i++)
		{
			var inaSelection = inaElements.getStructureAt(i);
			var child = importer.importComponent(null, inaSelection, null, cartesianList, context);
			var filterElement = child;
			cartesianList.add(filterElement);
		}
	}
	return cartesianList;
};
oFF.QInARepoFilterCartesianList.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var cartesianList = modelComponent;
	var fieldMd = cartesianList.getFieldMetadata();
	var isEnforceDynamicValue = false;
	if (oFF.notNull(fieldMd))
	{
		var dimensionMd = fieldMd.getDimensionMetadata();
		if (oFF.isNull(dimensionMd))
		{
			var field = cartesianList.getField();
			var dimension = field.getDimension();
			if (oFF.notNull(dimension))
			{
				isEnforceDynamicValue = dimension.isEnforcedDynamicValue();
			}
		}
		else
		{
			isEnforceDynamicValue = dimensionMd.isEnforcedDynamicValue();
		}
		inaStructure.putString("FieldName", fieldMd.getName());
		var filterExpression = cartesianList.getFilterExpression();
		if (oFF.notNull(filterExpression))
		{
			var parent = filterExpression.getParent();
			if (oFF.notNull(parent) && parent.getOlapComponentType() === oFF.OlapComponentType.OLAP_FILTER_MANAGER)
			{
				var cacheKey = fieldMd.getCacheKey();
				inaStructure.put("QY_CACHE_CONTEXT", oFF.QInARepoUtils.exportCacheKey(cacheKey, cartesianList.getQueryManager()));
			}
		}
	}
	if (isEnforceDynamicValue && cartesianList.getQueryManager() !== null && cartesianList.getQueryManager().isSuppressExitVariableValuesInRepoMode())
	{
		return null;
	}
	inaStructure.putString("Id", cartesianList.getUniqueId());
	var hierarchyName = cartesianList.getHierarchyName();
	if (oFF.notNull(hierarchyName))
	{
		var filterExpr = cartesianList.getFilterExpression() !== null ? cartesianList.getFilterExpression() : cartesianList.getParent().getFilterExpression();
		oFF.QInARepoHierarchy.exportHierarchyForFilter(exporter, exporter.isAbap(cartesianList), inaStructure, null, filterExpr, cartesianList.getQueryManager(), hierarchyName, cartesianList.getHierarchyDueDate(), cartesianList.getHierarchyVersion());
	}
	if (exporter.capabilities.supportsSupplements())
	{
		var supplementFieldsNames = cartesianList.getSupplementFieldNames();
		if (oFF.XCollectionUtils.hasElements(supplementFieldsNames))
		{
			var inaSupplements = inaStructure.putNewList("SupplementsFieldNames");
			inaSupplements.addAllStrings(supplementFieldsNames);
		}
	}
	var isConvertToFlatFilter = cartesianList.isConvertToFlatFilter();
	var inaElements = inaStructure.putNewList("Elements");
	var size = cartesianList.size();
	for (var j = 0; j < size; j++)
	{
		var cartesianElement = cartesianList.getOp(j);
		var inaInnerElement = exporter.exportComponent(null, cartesianElement, null, flags);
		inaElements.add(inaInnerElement);
		isConvertToFlatFilter = isConvertToFlatFilter || cartesianElement.isConvertToFlatFilter();
	}
	inaStructure.putBoolean("ConvertToFlatSelection", isConvertToFlatFilter);
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};

oFF.QInARepoFilterCartesianProduct = function() {};
oFF.QInARepoFilterCartesianProduct.prototype = new oFF.QInARepository();
oFF.QInARepoFilterCartesianProduct.prototype._ff_c = "QInARepoFilterCartesianProduct";

oFF.QInARepoFilterCartesianProduct.prototype.getComponentType = function()
{
	return oFF.FilterComponentType.CARTESIAN_PRODUCT;
};
oFF.QInARepoFilterCartesianProduct.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var filterExpression = null;
	if (oFF.notNull(parentComponent))
	{
		var parentFilterElement = parentComponent;
		filterExpression = parentFilterElement.getFilterExpression();
	}
	var cartesianProduct = modelComponent;
	if (oFF.isNull(cartesianProduct))
	{
		cartesianProduct = oFF.notNull(filterExpression) ? oFF.QFactory.createFilterCartesianProduct(filterExpression) : oFF.QFactory.createFilterCartesianProduct(context);
	}
	cartesianProduct.clear();
	var uniqueId = inaStructure.getStringByKey("Id");
	cartesianProduct.setUniqueId(uniqueId);
	var inaElements = inaStructure.getListByKey("Elements");
	if (oFF.notNull(inaElements))
	{
		for (var i = 0; i < inaElements.size(); i++)
		{
			var inaSelection = inaElements.getStructureAt(i);
			var child = importer.importComponent(null, inaSelection, null, cartesianProduct, context);
			var msl = child;
			cartesianProduct.add(msl);
		}
	}
	return cartesianProduct;
};
oFF.QInARepoFilterCartesianProduct.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var cartesianProduct = modelComponent;
	inaStructure.putString("Id", cartesianProduct.getUniqueId());
	var inaSubSelections = inaStructure.putNewList("Elements");
	for (var i = 0; i < cartesianProduct.size(); i++)
	{
		var msl = cartesianProduct.getCartesianChild(i);
		var innerElement = exporter.exportComponent(null, msl, null, flags);
		if (oFF.notNull(innerElement))
		{
			inaSubSelections.add(innerElement);
		}
	}
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};

oFF.QInARepoFilterCellValueOperand = function() {};
oFF.QInARepoFilterCellValueOperand.prototype = new oFF.QInARepository();
oFF.QInARepoFilterCellValueOperand.prototype._ff_c = "QInARepoFilterCellValueOperand";

oFF.QInARepoFilterCellValueOperand.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.FILTER_CELL_VALUE_OPERAND;
};
oFF.QInARepoFilterCellValueOperand.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var operand = modelComponent;
	if (oFF.isNull(operand))
	{
		operand = oFF.QFilterCellValueOperand._create(context, null, null, null, null);
	}
	var comparison = inaStructure.getStringByKey("Comparison");
	var operator = oFF.QInAConverter.lookupComparison(comparison);
	operand.setComparisonOperator(operator);
	var isExcluding = inaStructure.getBooleanByKey("IsExcluding");
	operand.setIsExcluding(isExcluding);
	var inaValueList = inaStructure.getListByKey("Values");
	oFF.QInARepoFilterOperation.importValues(importer, inaValueList, operand, null, context);
	return operand;
};
oFF.QInARepoFilterCellValueOperand.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var cellValueOperand = modelComponent;
	inaStructure.putBoolean("IsExcluding", cellValueOperand.isExcluding());
	var comparisonOperator = cellValueOperand.getComparisonOperator();
	inaStructure.putString("Comparison", oFF.QInAConverter.lookupComparisonInA(comparisonOperator));
	var inaValueList = oFF.QInARepoFilterOperation.exportValues(exporter, cellValueOperand);
	inaStructure.put("Values", inaValueList);
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};

oFF.QInARepoFilterDateRange = function() {};
oFF.QInARepoFilterDateRange.prototype = new oFF.QInARepository();
oFF.QInARepoFilterDateRange.prototype._ff_c = "QInARepoFilterDateRange";

oFF.QInARepoFilterDateRange.prototype.getComponentType = function()
{
	return oFF.FilterComponentType.DATE_RANGE_OPERATION;
};
oFF.QInARepoFilterDateRange.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var filterOperation = modelComponent;
	var field = this.getField(inaStructure, parentComponent, context);
	if (oFF.isNull(filterOperation))
	{
		var filterExpression = null;
		if (oFF.notNull(parentComponent))
		{
			var parentFilterElement = parentComponent;
			filterExpression = parentFilterElement.getFilterExpression();
		}
		filterOperation = oFF.notNull(filterExpression) ? oFF.QFactory.createFilterOperationDateRange(filterExpression, field) : oFF.QFactory.createFilterOperationDateRange(context, field);
	}
	var queryModel = filterOperation.getQueryModel();
	var dateRange = oFF.XDateRange.create(oFF.notNull(queryModel) ? queryModel.getProcess().getDateTimeProvider() : null);
	var inaGranularity = inaStructure.getStringByKey("Granularity");
	if (oFF.notNull(inaGranularity))
	{
		dateRange.withGranularity(oFF.QInAConverter.lookupDateRangeGranularity(inaGranularity), inaStructure.getBooleanByKeyExt("UpToPeriod", false));
	}
	if (inaStructure.getBooleanByKeyExt("Fixed", false))
	{
		dateRange.withFixDates(oFF.XDate.createDateSafe(inaStructure.getStringByKey("FixedFrom")), oFF.XDate.createDateSafe(inaStructure.getStringByKey("FixedTo")));
	}
	else
	{
		var inaOffset = inaStructure.getStructureByKey("Offset");
		var inaOffsetGranularity = oFF.PrUtils.getStringProperty(inaOffset, "Granularity");
		var inaOffsetValue = oFF.PrUtils.getIntegerProperty(inaOffset, "Value");
		if (oFF.notNull(inaOffsetGranularity) && oFF.notNull(inaOffsetValue))
		{
			dateRange.withOffset(oFF.QInAConverter.lookupDateRangeGranularity(inaOffsetGranularity.getString()), inaOffsetValue.getInteger());
		}
		var inaLookBack = inaStructure.getStructureByKey("LookBack");
		var inaLookBackGranularity = oFF.PrUtils.getStringProperty(inaLookBack, "Granularity");
		var inaLookBacktValue = oFF.PrUtils.getIntegerProperty(inaLookBack, "Value");
		if (oFF.notNull(inaLookBackGranularity) && oFF.notNull(inaLookBacktValue))
		{
			dateRange.withLookBack(oFF.QInAConverter.lookupDateRangeGranularity(inaLookBackGranularity.getString()), inaLookBacktValue.getInteger());
		}
		var inaLookAhead = inaStructure.getStructureByKey("LookAhead");
		var inaLookAheadGranularity = oFF.PrUtils.getStringProperty(inaLookAhead, "Granularity");
		var inaLookAheadValue = oFF.PrUtils.getIntegerProperty(inaLookAhead, "Value");
		if (oFF.notNull(inaLookAheadGranularity) && oFF.notNull(inaLookAheadValue))
		{
			dateRange.withLookAhead(oFF.QInAConverter.lookupDateRangeGranularity(inaLookAheadGranularity.getString()), inaLookAheadValue.getInteger());
		}
	}
	filterOperation.setDateRange(dateRange, field);
	return filterOperation;
};
oFF.QInARepoFilterDateRange.prototype.getField = function(inaStructure, parentComponent, context)
{
	var fieldName = inaStructure.getStringByKey("FieldName");
	var field = context.getFieldAccessorSingle().getFieldByName(fieldName);
	if (oFF.isNull(field) && oFF.notNull(parentComponent) && parentComponent.getComponentType() === oFF.FilterComponentType.CARTESIAN_LIST)
	{
		field = parentComponent.getField();
	}
	return field;
};
oFF.QInARepoFilterDateRange.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var filterOperation = modelComponent;
	var fieldMetadata = filterOperation.getFieldMetadata();
	oFF.QInARepoUtils.setNameIfNotNull(inaStructure, "FieldName", fieldMetadata);
	var dateRange = filterOperation.getDateRange();
	if (oFF.notNull(dateRange))
	{
		inaStructure.putStringNotNull("Granularity", oFF.QInAConverter.lookupDateRangeGranularityInA(dateRange.getGranularity()));
		inaStructure.putBoolean("Fixed", dateRange.isFixedRange());
		if (dateRange.isFixedRange())
		{
			inaStructure.putStringNotNull("FixedFrom", dateRange.getFixedFromDate() !== null ? dateRange.getFixedFromDate().toIsoFormat() : null);
			inaStructure.putStringNotNull("FixedTo", dateRange.getFixedToDate() !== null ? dateRange.getFixedToDate().toIsoFormat() : null);
		}
		else
		{
			inaStructure.putBoolean("UpToPeriod", dateRange.isUpToCurrentPeriod());
			this.exportGranularitySettings(dateRange.getOffset(), inaStructure, "Offset");
			this.exportGranularitySettings(dateRange.getLookBack(), inaStructure, "LookBack");
			this.exportGranularitySettings(dateRange.getLookAhead(), inaStructure, "LookAhead");
		}
	}
	return inaStructure;
};
oFF.QInARepoFilterDateRange.prototype.exportGranularitySettings = function(value, inaStructure, inaName)
{
	if (oFF.notNull(value))
	{
		var offsetIna = inaStructure.putNewStructure(inaName);
		offsetIna.putStringNotNull("Granularity", oFF.QInAConverter.lookupDateRangeGranularityInA(value.getFirstObject()));
		offsetIna.putInteger("Value", value.getSecondObject().getInteger());
	}
};

oFF.QInARepoFilterDynamicTimeRegularRange = function() {};
oFF.QInARepoFilterDynamicTimeRegularRange.prototype = new oFF.QInARepository();
oFF.QInARepoFilterDynamicTimeRegularRange.prototype._ff_c = "QInARepoFilterDynamicTimeRegularRange";

oFF.QInARepoFilterDynamicTimeRegularRange.prototype.getComponentType = function()
{
	return oFF.FilterComponentType.FILTER_DYNAMIC_TIME_REGULAR_RANGE;
};
oFF.QInARepoFilterDynamicTimeRegularRange.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var name = inaStructure.getStringByKey("Name");
	var dynamicTimeRangeFilter = modelComponent;
	if (oFF.isNull(dynamicTimeRangeFilter))
	{
		dynamicTimeRangeFilter = oFF.QFactory.createFilterDynamicTimeRegularRange(context, name);
	}
	oFF.QInARepoUtils.importFilterTimeRange(importer, inaStructure, dynamicTimeRangeFilter);
	oFF.QInARepoUtils.importFilterShiftableTimeRange(inaStructure, dynamicTimeRangeFilter);
	dynamicTimeRangeFilter.setLookAhead(inaStructure.getIntegerByKey("LookAhead"));
	dynamicTimeRangeFilter.setLowValue(inaStructure.getStringByKey("LowValue"));
	var lowValueType = inaStructure.getStringByKey("LowValueType");
	if (oFF.notNull(lowValueType))
	{
		dynamicTimeRangeFilter.setLowValueType(oFF.QInAConverter.lookupValueType(lowValueType));
	}
	return dynamicTimeRangeFilter;
};
oFF.QInARepoFilterDynamicTimeRegularRange.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var dynamicTimeRangeFilter = modelComponent;
	inaStructure.putString("Name", dynamicTimeRangeFilter.getName());
	oFF.QInARepoUtils.exportTimeRangeFilter(exporter, inaStructure, dynamicTimeRangeFilter);
	oFF.QInARepoUtils.exportShiftableTimeRangeFilter(inaStructure, dynamicTimeRangeFilter);
	inaStructure.putInteger("LookAhead", dynamicTimeRangeFilter.getLookAhead());
	inaStructure.putString("LowValue", dynamicTimeRangeFilter.getLowValue());
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};

oFF.QInARepoFilterDynamicTimeToDateRange = function() {};
oFF.QInARepoFilterDynamicTimeToDateRange.prototype = new oFF.QInARepository();
oFF.QInARepoFilterDynamicTimeToDateRange.prototype._ff_c = "QInARepoFilterDynamicTimeToDateRange";

oFF.QInARepoFilterDynamicTimeToDateRange.prototype.getComponentType = function()
{
	return oFF.FilterComponentType.FILTER_DYNAMIC_TIME_TO_DATE_RANGE;
};
oFF.QInARepoFilterDynamicTimeToDateRange.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var name = inaStructure.getStringByKey("Name");
	var toDateRangeFilter = modelComponent;
	if (oFF.isNull(toDateRangeFilter))
	{
		toDateRangeFilter = oFF.QFactory.createFilterDynamicTimeToDateRange(context, name);
	}
	oFF.QInARepoUtils.importFilterTimeRange(importer, inaStructure, toDateRangeFilter);
	oFF.QInARepoUtils.importFilterShiftableTimeRange(inaStructure, toDateRangeFilter);
	toDateRangeFilter.setLowValue(inaStructure.getStringByKey("Member"));
	var lowValueType = inaStructure.getStringByKey("LowValueType");
	if (oFF.notNull(lowValueType))
	{
		toDateRangeFilter.setLowValueType(oFF.QInAConverter.lookupValueType(lowValueType));
	}
	return toDateRangeFilter;
};
oFF.QInARepoFilterDynamicTimeToDateRange.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var toDateRangeFilter = modelComponent;
	inaStructure.putString("Name", toDateRangeFilter.getName());
	oFF.QInARepoUtils.exportTimeRangeFilter(exporter, inaStructure, toDateRangeFilter);
	oFF.QInARepoUtils.exportShiftableTimeRangeFilter(inaStructure, toDateRangeFilter);
	inaStructure.putString("Member", toDateRangeFilter.getLowValue());
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};

oFF.QInARepoFilterElement = function() {};
oFF.QInARepoFilterElement.prototype = new oFF.QInARepository();
oFF.QInARepoFilterElement.prototype._ff_c = "QInARepoFilterElement";

oFF.QInARepoFilterElement.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.FILTER_ELEMENT;
};
oFF.QInARepoFilterElement.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var filterExpression = parentComponent;
	var filterElement = modelComponent;
	if (inaStructure.containsKey("Operator"))
	{
		filterElement = importer.importFilterAlgebra(filterExpression, inaStructure, context);
	}
	else
	{
		var inaSetOperand = inaStructure.getStructureByKey("SetOperand");
		if (oFF.isNull(inaSetOperand))
		{
			if (inaStructure.containsKey("GeometryOperand"))
			{
				filterElement = importer.importFilterGeo(filterExpression, inaStructure, context);
			}
		}
		else
		{
			filterElement = importer.importCartesianList(inaSetOperand, filterElement, filterExpression, context);
		}
	}
	return filterElement;
};
oFF.QInARepoFilterElement.prototype.m_exportingAtLevel1 = false;
oFF.QInARepoFilterElement.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var filterElement = modelComponent;
	var type = filterElement.getComponentType();
	if (type.isTypeOf(oFF.FilterComponentType.BOOLEAN_ALGEBRA))
	{
		if (type === oFF.FilterComponentType.CARTESIAN_LIST)
		{
			exporter.exportCartesianList(filterElement, inaStructure);
		}
		else if (type === oFF.FilterComponentType.CONVERTED_TIME_CARTESIAN_LIST)
		{
			exporter.exportConvertedTimeCartesianList(filterElement, inaStructure);
		}
		else if (type === oFF.FilterComponentType.CARTESIAN_PRODUCT)
		{
			exporter.exportFilterCartesianProduct(filterElement, inaStructure);
		}
		else
		{
			if (this.shouldContinueExport(filterElement, exporter))
			{
				exporter.exportFilterAlgebra(filterElement, inaStructure);
				if (this.m_exportingAtLevel1)
				{
					this.m_exportingAtLevel1 = false;
				}
			}
		}
	}
	else if (type.isTypeOf(oFF.FilterComponentType.OPERATION))
	{
		var filterOperation = filterElement;
		var comparisonOperator = filterOperation.getComparisonOperator();
		if (oFF.notNull(comparisonOperator))
		{
			if (comparisonOperator.isTypeOf(oFF.SpatialComparisonOperator._SPATIAL))
			{
				exporter.exportFilterGeo(filterOperation, inaStructure);
			}
			else
			{
				if (exporter.capabilities.supportsSetOperand())
				{
					var inaInnerElement = oFF.PrFactory.createStructure();
					var fieldMetadata = filterOperation.getFieldMetadata();
					if (oFF.notNull(fieldMetadata))
					{
						inaInnerElement.putString("FieldName", fieldMetadata.getName());
						var hierarchyName = filterOperation.getHierarchyName();
						if (oFF.notNull(hierarchyName))
						{
							var filterExpr = filterOperation.getFilterExpression() !== null ? filterOperation.getFilterExpression() : filterOperation.getParent().getFilterExpression();
							oFF.QInARepoHierarchy.exportHierarchyForFilter(exporter, exporter.isAbap(filterElement), inaInnerElement, null, filterExpr, filterOperation.getQueryManager(), hierarchyName, filterOperation.getHierarchyDueDate(), filterOperation.getHierarchyVersion());
						}
						if (filterOperation.isConvertToFlatFilter())
						{
							inaInnerElement.putBoolean("ConvertToFlatSelection", true);
						}
						var inaElementList = inaInnerElement.putNewList("Elements");
						var inaOperation = inaElementList.addNewStructure();
						exporter.exportFilterOperation(filterOperation, inaOperation);
						if (oFF.notNull(inaStructure))
						{
							inaStructure.put("SetOperand", inaInnerElement);
						}
					}
				}
			}
		}
	}
	else if (type.isTypeOf(oFF.OlapComponentType.FILTER_CELL_VALUE_OPERAND))
	{
		var cellValueOperand = oFF.PrFactory.createStructure();
		var elements = cellValueOperand.putNewList("Elements");
		elements.add(exporter.exportCellValueOperand(filterElement));
		inaStructure.put("CellValueOperand", cellValueOperand);
	}
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};
oFF.QInARepoFilterElement.prototype.shouldContinueExport = function(filterElement, exporter)
{
	var isReInitFlow = oFF.notNull(exporter.variableProcessingDirective) && exporter.variableProcessingDirective === oFF.ProcessingStep.VARIABLE_DEFINITION;
	if (!isReInitFlow)
	{
		return true;
	}
	var queryModel = filterElement.getQueryModel();
	var modelCapabilities = filterElement.getModelCapabilities();
	if (modelCapabilities.supportsComplexTupleFilter() && oFF.notNull(queryModel))
	{
		if (!this.m_exportingAtLevel1)
		{
			this.m_exportingAtLevel1 = true;
			return true;
		}
		return false;
	}
	return true;
};

oFF.QInARepoFilterExpression = function() {};
oFF.QInARepoFilterExpression.prototype = new oFF.QInARepository();
oFF.QInARepoFilterExpression.prototype._ff_c = "QInARepoFilterExpression";

oFF.QInARepoFilterExpression.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.FILTER_EXPRESSION;
};
oFF.QInARepoFilterExpression.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var expression = modelComponent;
	if (oFF.XString.isEqual(expression.getName(), "selectionSpaceContainer") === false || expression.getFilterRootElement() === null)
	{
		expression.setComplexRoot(null);
		var supportsCellValueOperand = expression.getModelCapabilities().supportsCellValueOperand();
		if (supportsCellValueOperand)
		{
			expression.setIsSuppressingNulls(false);
			expression.clearCellValueFilter();
		}
		if (oFF.notNull(inaStructure))
		{
			var uniqueId = inaStructure.getStringByKey("Id");
			expression.setUniqueId(uniqueId);
			if (supportsCellValueOperand)
			{
				var isSuppressingNulls = inaStructure.getBooleanByKeyExt("IsSuppressingNulls", false);
				expression.setIsSuppressingNulls(isSuppressingNulls);
			}
			var inaFilterElement = inaStructure.getStructureByKey("FilterRoot");
			if (oFF.notNull(inaFilterElement))
			{
				var component = importer.importComponent(null, inaFilterElement, null, expression, context);
				var filterElement = component;
				expression.setComplexRoot(filterElement);
			}
			if (supportsCellValueOperand)
			{
				var inaElements = inaStructure.getListByKey("CellValueOperand");
				if (oFF.notNull(inaElements))
				{
					for (var i = 0; i < inaElements.size(); i++)
					{
						var inaCellValueOperand = inaElements.getStructureAt(i);
						var cellValueOperand = importer.importComponent(oFF.OlapComponentType.FILTER_CELL_VALUE_OPERAND, inaCellValueOperand, null, expression, context);
						expression.addCellValueFilter(cellValueOperand);
					}
				}
			}
		}
	}
	return modelComponent;
};
oFF.QInARepoFilterExpression.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var expression = modelComponent;
	inaStructure.putString("Id", expression.getUniqueId());
	inaStructure.putBoolean("IsSuppressingNulls", expression.isSuppressingNulls());
	var rootElement = expression.getFilterRootElement();
	if (oFF.notNull(rootElement))
	{
		var inaRootElement = exporter.exportComponent(null, rootElement, null, oFF.QImExFlag.DEFAULT_ALL);
		inaStructure.put("FilterRoot", inaRootElement);
	}
	if (expression.getModelCapabilities().supportsCellValueOperand())
	{
		var inaElements = inaStructure.putNewList("CellValueOperand");
		var cellValueOperands = expression.getCellValueOperands();
		for (var i = 0; i < cellValueOperands.size(); i++)
		{
			var cellValueOperand = cellValueOperands.get(i);
			var inaCellValueOperand = exporter.exportCellValueOperand(cellValueOperand);
			inaElements.add(inaCellValueOperand);
		}
	}
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};

oFF.QInARepoFilterFixed = function() {};
oFF.QInARepoFilterFixed.prototype = new oFF.QInARepository();
oFF.QInARepoFilterFixed.prototype._ff_c = "QInARepoFilterFixed";

oFF.QInARepoFilterFixed.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.FILTER_FIXED;
};
oFF.QInARepoFilterFixed.prototype.getTagName = function()
{
	return "FixedFilterRepo";
};
oFF.QInARepoFilterFixed.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var filterExpression = null;
	if (oFF.notNull(inaStructure))
	{
		var filter = parentComponent;
		filterExpression = importer.importFilterExpression(null, inaStructure, filter, context);
		if (oFF.notNull(filter) && oFF.notNull(filterExpression))
		{
			filter.setFixedFilter(filterExpression);
		}
	}
	return filterExpression;
};
oFF.QInARepoFilterFixed.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var filter = modelComponent;
	if (!filter.isFixedFilterInitialized())
	{
		return null;
	}
	var filterExpression = filter.getFixedFilter();
	var inaStructure2 = exporter.exportFilterExpression(filterExpression);
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure2, flags);
};

oFF.QInARepoFilterFixedTimeRange = function() {};
oFF.QInARepoFilterFixedTimeRange.prototype = new oFF.QInARepository();
oFF.QInARepoFilterFixedTimeRange.prototype._ff_c = "QInARepoFilterFixedTimeRange";

oFF.QInARepoFilterFixedTimeRange.prototype.getComponentType = function()
{
	return oFF.FilterComponentType.FILTER_FIXED_TIME_RANGE;
};
oFF.QInARepoFilterFixedTimeRange.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var name = inaStructure.getStringByKey("Name");
	var fixedTimeRangeFilter = modelComponent;
	if (oFF.isNull(fixedTimeRangeFilter))
	{
		fixedTimeRangeFilter = oFF.QFactory.createFilterFixedTimeRange(context, name);
	}
	var lowValueType = null;
	var inaLowValueType = inaStructure.getStringByKey("LowValueType");
	if (oFF.notNull(inaLowValueType))
	{
		lowValueType = oFF.QInAConverter.lookupValueType(inaLowValueType);
	}
	var timeFilterRangeType = oFF.TimeRangeFilterType.lookup(inaStructure.getStringByKey("TimeRangeFilterType"));
	if (timeFilterRangeType === oFF.TimeRangeFilterType.FIXED_OPENING_PERIOD_TO_CLOSING_PERIOD)
	{
		fixedTimeRangeFilter.setOpeningPeriodToClosingPeriodFixedRange();
	}
	else if (timeFilterRangeType === oFF.TimeRangeFilterType.FIXED_START_TO_CLOSING_OPERIOD)
	{
		fixedTimeRangeFilter.setStartToClosingPeriodFixedRange(inaStructure.getStringByKey("LowValue"), lowValueType);
	}
	else if (timeFilterRangeType === oFF.TimeRangeFilterType.FIXED_OPENING_PERIOD_TO_END)
	{
		fixedTimeRangeFilter.setOpeningPeriodToEndFixedRange("LowValue", lowValueType);
	}
	oFF.QInARepoUtils.importFilterTimeRange(importer, inaStructure, fixedTimeRangeFilter);
	return fixedTimeRangeFilter;
};
oFF.QInARepoFilterFixedTimeRange.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var fixedTimeRangeFilter = modelComponent;
	inaStructure.putString("Name", fixedTimeRangeFilter.getName());
	oFF.QInARepoUtils.exportTimeRangeFilter(exporter, inaStructure, fixedTimeRangeFilter);
	inaStructure.putString("LowValue", fixedTimeRangeFilter.getLowValue());
	inaStructure.putString("TimeRangeFilterType", fixedTimeRangeFilter.getRangeFilterType().getName());
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};

oFF.QInARepoFilterGeo = function() {};
oFF.QInARepoFilterGeo.prototype = new oFF.QInARepository();
oFF.QInARepoFilterGeo.prototype._ff_c = "QInARepoFilterGeo";

oFF.QInARepoFilterGeo.tryCreateGeometry = function(strValue)
{
	var value = oFF.XGeometryValue.createGeometryValueWithWkt(strValue);
	if (oFF.isNull(value))
	{
		value = oFF.XStringValue.create(strValue);
	}
	return value;
};
oFF.QInARepoFilterGeo.prototype.getComponentType = function()
{
	return oFF.FilterComponentType.SPATIAL_FILTER;
};
oFF.QInARepoFilterGeo.prototype.getTagName = function()
{
	return "GeometryOperandRepo";
};
oFF.QInARepoFilterGeo.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var filterExpression = parentComponent;
	var fieldAccessor = context.getFieldAccessorSingle();
	var inaComparison = inaStructure.getStringByKey("Comparison");
	var inaFieldName = inaStructure.getStringByKey("FieldName");
	var inaValue1 = inaStructure.getStringByKey("Value1");
	var geoFilter = null;
	if (oFF.XStringUtils.isNotNullAndNotEmpty(inaComparison) && oFF.XStringUtils.isNotNullAndNotEmpty(inaFieldName) && oFF.XStringUtils.isNotNullAndNotEmpty(inaValue1))
	{
		var comparison = oFF.QInAConverter.lookupComparison(inaComparison);
		if (oFF.notNull(comparison))
		{
			if (comparison.isTypeOf(oFF.SpatialComparisonOperator._SPATIAL))
			{
				var field = fieldAccessor.getFieldByName(inaFieldName);
				if (oFF.notNull(field))
				{
					geoFilter = oFF.QFactory.createFilterOperationWithOperator(filterExpression, field, comparison);
					var firstValue = oFF.QInARepoFilterGeo.tryCreateGeometry(inaValue1);
					geoFilter.getLow().setValue(firstValue);
					var inaValue2 = inaStructure.getStringByKey("Value2");
					if (oFF.XStringUtils.isNotNullAndNotEmpty(inaValue2))
					{
						var secondValue = oFF.QInARepoFilterGeo.tryCreateGeometry(inaValue2);
						geoFilter.getHigh().setValue(secondValue);
					}
					var inaValue3 = inaStructure.getStringByKey("Value3");
					if (oFF.XStringUtils.isNotNullAndNotEmpty(inaValue3))
					{
						var thirdValue = oFF.QInARepoFilterGeo.tryCreateGeometry(inaValue3);
						geoFilter.getThird().setValue(thirdValue);
					}
				}
			}
		}
	}
	return geoFilter;
};
oFF.QInARepoFilterGeo.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var operation = modelComponent;
	var comparisonOperator = operation.getComparisonOperator();
	if (!comparisonOperator.isTypeOf(oFF.SpatialComparisonOperator._SPATIAL))
	{
		throw oFF.XException.createIllegalStateException("Not a spatial operator");
	}
	inaStructure.putString("Comparison", oFF.QInAConverter.lookupComparisonInA(comparisonOperator));
	var fieldMd = operation.getFieldMetadata();
	inaStructure.putString("FieldName", fieldMd.getName());
	var geoValue1 = operation.getLow();
	var blendingDataSource = operation.getDataSource();
	if (oFF.isNull(blendingDataSource))
	{
		if (oFF.notNull(geoValue1) && geoValue1.getValue() !== null)
		{
			oFF.QInAValueUtils.exportFilterValue(exporter, "Value1", inaStructure, geoValue1, geoValue1.getValueType());
			var srid = geoValue1.getGeometry().getSrid();
			if (exporter.capabilities.supportsSpatialFilterSrid() && oFF.notNull(srid))
			{
				inaStructure.putInteger("SRID", srid.getInteger());
			}
		}
	}
	else
	{
		if (oFF.notNull(geoValue1) && geoValue1.getValue() !== null)
		{
			oFF.QInAValueUtils.exportFilterValue(exporter, "Value1", inaStructure, geoValue1, oFF.XValueType.STRING);
		}
		var inaBlendingDataSource = exporter.exportDataSource(blendingDataSource, false);
		inaStructure.put("DataSource", inaBlendingDataSource);
	}
	var geoValue2 = operation.getHigh();
	if (oFF.notNull(geoValue2) && geoValue2.getValue() !== null)
	{
		oFF.QInAValueUtils.exportFilterValue(exporter, "Value2", inaStructure, geoValue2, oFF.XValueType.STRING);
	}
	var geoValue3 = operation.getThird();
	if (oFF.notNull(geoValue3) && geoValue3.getValue() !== null)
	{
		oFF.QInAValueUtils.exportFilterValue(exporter, "Value3", inaStructure, geoValue3, oFF.XValueType.STRING);
	}
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};

oFF.QInARepoFilterManager = function() {};
oFF.QInARepoFilterManager.prototype = new oFF.QInARepository();
oFF.QInARepoFilterManager.prototype._ff_c = "QInARepoFilterManager";

oFF.QInARepoFilterManager.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.OLAP_FILTER_MANAGER;
};
oFF.QInARepoFilterManager.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var filterManager = modelComponent;
	if (oFF.isNull(filterManager))
	{
		filterManager = context.getOlapEnv().getFilterManager();
	}
	var inaFilterManager = inaStructure.getStructureByKey("OlapFilterManager");
	var inaFilters = inaFilterManager.getStructureByKey("OlapFilters");
	var filterNameIt = inaFilters.getKeysAsIteratorOfString();
	while (filterNameIt.hasNext())
	{
		var filterName = filterNameIt.next();
		var filterExpression = filterManager.getFilterByName(filterName);
		importer.importFilterExpression(filterExpression, inaFilters.getStructureByKey(filterName), filterManager, filterManager.getContext());
	}
	return filterManager;
};
oFF.QInARepoFilterManager.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var inaFilterManager = inaStructure.putNewStructure("OlapFilterManager");
	var inaFilters = inaFilterManager.putNewStructure("OlapFilters");
	var filterManager = modelComponent;
	var filters = filterManager.getFilters();
	var filterNameIt = filters.getKeysAsIteratorOfString();
	while (filterNameIt.hasNext())
	{
		var filterName = filterNameIt.next();
		var filterExpression = filters.getByKey(filterName);
		if (oFF.QInARepoUtils.isValidFilterExpressionForRepository(filterExpression))
		{
			inaFilters.put(filterName, exporter.exportFilterExpression(filterExpression));
		}
	}
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};

oFF.QInARepoFilterMeasureBased = function() {};
oFF.QInARepoFilterMeasureBased.prototype = new oFF.QInARepository();
oFF.QInARepoFilterMeasureBased.prototype._ff_c = "QInARepoFilterMeasureBased";

oFF.QInARepoFilterMeasureBased.prototype.getComponentType = function()
{
	return oFF.FilterComponentType.FILTER_MEASURE_BASED;
};
oFF.QInARepoFilterMeasureBased.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var name = inaStructure.getStringByKey("Name");
	var mbf = modelComponent;
	if (oFF.isNull(mbf))
	{
		mbf = oFF.QFactory.createFilterMeasureBased(context, name);
	}
	var newFieldFormula = oFF.QInARepoMemberFormulaMeasure.importFormulaMeasure(importer, null, inaStructure.getStructureByKey("Formula"), null, context);
	mbf.setFormula(newFieldFormula);
	mbf.setCrossCalculationMeasure(inaStructure.getStringByKey("CrossCalculationMeasure"));
	var dimensionContext = inaStructure.getListByKey("AggregationFieldNames");
	var size = dimensionContext.size();
	for (var i = 0; i < size; i++)
	{
		mbf.addDimensionContext(dimensionContext.getStringAt(i));
	}
	oFF.QInARepoUtils.importLayeredFilters(importer, mbf, inaStructure.getListByKey("LayeredFilters"));
	return mbf;
};
oFF.QInARepoFilterMeasureBased.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var mbf = modelComponent;
	oFF.QInARepoMemberAbstract.exportFormulaItem(exporter, mbf.getFormula(), inaStructure.putNewStructure("Formula"), mbf);
	inaStructure.putString("Name", mbf.getName());
	inaStructure.putStringNotNullAndNotEmpty("CrossCalculationMeasure", mbf.getCrossCalculationMeasure());
	var dimensionContext = inaStructure.putNewList("AggregationFieldNames");
	dimensionContext.addAllStrings(mbf.getDimensionContext());
	inaStructure.put("LayeredFilters", oFF.QInARepoUtils.exportLayeredFilters(exporter, mbf));
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};

oFF.QInARepoFilterOperation = function() {};
oFF.QInARepoFilterOperation.prototype = new oFF.QInARepository();
oFF.QInARepoFilterOperation.prototype._ff_c = "QInARepoFilterOperation";

oFF.QInARepoFilterOperation.importValues = function(importer, inaValueList, filterValueContainer, field, context)
{
	var size = inaValueList.size();
	for (var i = 0; i < size && i < 3; i++)
	{
		var inaValueStructure = inaValueList.getStructureAt(i);
		var valueBag = filterValueContainer.getValueAt(i);
		var inaType = inaValueStructure.getStringByKey("Type");
		var filterValueType = oFF.QInAConverter.lookupValueType(inaType);
		if (filterValueType === oFF.XValueType.VARIABLE)
		{
			valueBag.setFilterValueType(filterValueType);
			var varName = inaValueStructure.getStringByKey("Value");
			if (oFF.notNull(varName))
			{
				var variables = context.getVariableContainer().getVariables();
				var variable = variables.getByKey(varName);
				valueBag.setVariableValue(variable);
			}
		}
		else
		{
			if (filterValueType === oFF.XValueType.CURRENT_MEMBER)
			{
				valueBag.setFilterValueType(filterValueType);
			}
			var inaNavigationList = oFF.PrUtils.getListProperty(inaValueStructure, "LowNavigations");
			if (oFF.isNull(inaNavigationList))
			{
				inaNavigationList = oFF.PrUtils.getListProperty(inaValueStructure, "Value");
			}
			if (oFF.notNull(inaNavigationList))
			{
				var navigations = valueBag.getMemberNavigations();
				navigations.clear();
				var inaNaviSize = inaNavigationList.size();
				for (var naviIdx = 0; naviIdx < inaNaviSize; naviIdx++)
				{
					var memberNavigation = oFF.QInARepoFilterOperation.importMemberNavigation(inaNavigationList.getStructureAt(naviIdx));
					navigations.add(memberNavigation);
				}
			}
			if (filterValueType !== oFF.XValueType.CURRENT_MEMBER)
			{
				oFF.QInARepoUtils.importSupplementsAndValue(importer, valueBag, inaValueStructure, null, null, field);
			}
		}
	}
};
oFF.QInARepoFilterOperation.importMemberNavigation = function(inaNavigation)
{
	var memberNavigation = oFF.QFactory.createMemberNavigation(oFF.CurrentMemberFunction.lookup(inaNavigation.getStringByKey("Function")));
	if (inaNavigation.containsKey("Parameters"))
	{
		var inaParameters = inaNavigation.getListByKey("Parameters");
		var inaParaSize = inaParameters.size();
		for (var idxPara = 0; idxPara < inaParaSize; idxPara++)
		{
			var inaParameter = inaParameters.getStructureAt(idxPara);
			if (inaParameter.containsKey("Navigations"))
			{
				var inaNavigations = inaParameter.getListByKey("Navigations");
				var inaNaviSize = inaNavigations.size();
				for (var idxNavi = 0; idxNavi < inaNaviSize; idxNavi++)
				{
					memberNavigation.addNavigation(oFF.QInARepoFilterOperation.importMemberNavigation(inaNavigations.getStructureAt(idxNavi)));
				}
			}
			else
			{
				if (inaParameter.containsKey("Level"))
				{
					var inaLevelValue = inaParameter.getByKey("Level");
					if (inaLevelValue.isNumeric())
					{
						memberNavigation.addParameter(oFF.QFactory.createNavigationParameterWithLevelNumber(inaLevelValue.getInteger()));
					}
					else
					{
						memberNavigation.addParameter(oFF.QFactory.createNavigationParameterWithLevelLiteral(inaLevelValue.getString()));
					}
				}
				else if (inaParameter.containsKey("Member"))
				{
					memberNavigation.addParameter(oFF.QFactory.createNavigationParameterWithMemberName(inaParameter.getStringByKey("Member")));
				}
				else if (inaParameter.containsKey("NoValuesAboveLevel"))
				{
					memberNavigation.addParameter(oFF.QFactory.createNavigationParameterWithNoValuesAboveLevel(inaParameter.getStringByKey("NoValuesAboveLevel")));
				}
				else if (inaParameter.containsKey("ErrorAboveLevel"))
				{
					memberNavigation.addParameter(oFF.QFactory.createNavigationParameterWithErrorAboveLevel(inaParameter.getStringByKey("ErrorAboveLevel")));
				}
				else if (inaParameter.containsKey("Shift"))
				{
					var inaShift = inaParameter.getStructureByKey("Shift");
					memberNavigation.addParameter(oFF.QFactory.createNavigationParameterWithShift(inaShift.getStringByKey("Level"), inaShift.getIntegerByKey("Constant")));
				}
				else if (inaParameter.containsKey("Range"))
				{
					var inaRange = inaParameter.getStructureByKey("Range");
					memberNavigation.addParameter(oFF.QFactory.createNavigationParameterWithRange(inaRange.getStringByKey("Level"), inaRange.getIntegerByKey("OffsetLow"), inaRange.getIntegerByKey("OffsetHigh")));
				}
				else
				{
					var inaConstantValue = inaParameter.getByKey("Constant");
					if (inaConstantValue.isNumeric())
					{
						memberNavigation.addParameter(oFF.QFactory.createNavigationParameterWithIntegerConstant(inaConstantValue.getInteger()));
					}
					else
					{
						memberNavigation.addParameter(oFF.QFactory.createNavigationParameterWithStringConstant(inaConstantValue.getString()));
					}
				}
			}
		}
	}
	return memberNavigation;
};
oFF.QInARepoFilterOperation.exportValues = function(exporter, filterValueContainer)
{
	var inaValueList = oFF.PrFactory.createList();
	var size = filterValueContainer.size();
	for (var i = 0; i < size; i++)
	{
		var valueBag = filterValueContainer.getValueAt(i);
		var inaValueStructure = inaValueList.addNewStructure();
		var filterValueType = valueBag.getFilterValueType();
		if (filterValueType === oFF.XValueType.VARIABLE)
		{
			inaValueStructure.putString("Type", "Variable");
			oFF.QInARepoUtils.setNameIfNotNull(inaValueStructure, "Value", valueBag.getVariableValue());
		}
		else
		{
			var inaNavigationList;
			if (filterValueType === oFF.XValueType.CURRENT_MEMBER)
			{
				inaValueStructure.putString("Type", "CurrentMember");
			}
			var literalField = null;
			var fieldValue = valueBag.getFieldValue();
			if (oFF.notNull(fieldValue))
			{
				literalField = fieldValue.getField();
			}
			oFF.QInARepoUtils.exportSupplementsAndValue(exporter, null, inaValueStructure, literalField, valueBag, null);
			var memberNavigations = valueBag.getMemberNavigations();
			var memberNavigationSize = memberNavigations.size();
			if (memberNavigationSize > 0)
			{
				inaNavigationList = inaValueStructure.putNewList("LowNavigations");
				for (var mnIdx = 0; mnIdx < memberNavigationSize; mnIdx++)
				{
					oFF.QInARepoFilterOperation.exportMemberNavigation(memberNavigations.get(mnIdx), inaNavigationList.addNewStructure());
				}
			}
		}
	}
	return inaValueList;
};
oFF.QInARepoFilterOperation.exportMemberNavigation = function(memberNavigation, inaLowNavigation)
{
	inaLowNavigation.putString("Function", memberNavigation.getMemberFunction().getName());
	var parameters = memberNavigation.getParameters();
	if (oFF.notNull(parameters))
	{
		var size = parameters.size();
		var inaParameters = inaLowNavigation.putNewList("Parameters");
		for (var i = 0; i < size; i++)
		{
			var parameter = parameters.get(i);
			var inaParameter = inaParameters.addNewStructure();
			var memberNavigationType = parameter.getMemberNavigationType();
			var key = oFF.QInAConverter.lookupMemberNavigationTypeInA(memberNavigationType);
			if (memberNavigationType === oFF.MemberNavigationType.FUNCTION_PARAM_SHIFT || memberNavigationType === oFF.MemberNavigationType.FUNCTION_PARAM_RANGE)
			{
				inaParameter = inaParameter.putNewStructure(key);
				oFF.QInARepoFilterOperation.setKeyValueForMemberNavigation(inaParameter, "Level", parameter.getLevelValue());
				oFF.QInARepoFilterOperation.setKeyValueForMemberNavigation(inaParameter, "Constant", parameter.getConstantValue());
				oFF.QInARepoFilterOperation.setKeyValueForMemberNavigation(inaParameter, "OffsetLow", parameter.getOffSetLow());
				oFF.QInARepoFilterOperation.setKeyValueForMemberNavigation(inaParameter, "OffsetHigh", parameter.getOffsetHigh());
			}
			else
			{
				if (!oFF.QInARepoFilterOperation.setKeyValueForMemberNavigation(inaParameter, key, parameter.getLevelValue()))
				{
					if (!oFF.QInARepoFilterOperation.setKeyValueForMemberNavigation(inaParameter, key, parameter.getConstantValue()))
					{
						oFF.QInARepoFilterOperation.setKeyValueForMemberNavigation(inaParameter, key, parameter.getFunctionName());
					}
				}
			}
		}
	}
	var navigations = memberNavigation.getNavigations();
	if (oFF.notNull(navigations))
	{
		var inaParameters2;
		if (inaLowNavigation.containsKey("Parameters"))
		{
			inaParameters2 = inaLowNavigation.getListByKey("Parameters");
		}
		else
		{
			inaParameters2 = inaLowNavigation.putNewList("Parameters");
		}
		var inaParameter2 = inaParameters2.addNewStructure();
		var inaNavigations = inaParameter2.putNewList("Navigations");
		var naviSize = navigations.size();
		for (var idxNavi = 0; idxNavi < naviSize; idxNavi++)
		{
			oFF.QInARepoFilterOperation.exportMemberNavigation(navigations.get(idxNavi), inaNavigations.addNewStructure());
		}
	}
};
oFF.QInARepoFilterOperation.setKeyValueForMemberNavigation = function(inaParameter, key, value)
{
	if (oFF.isNull(value))
	{
		return false;
	}
	if (value.getValueType().isNumber())
	{
		inaParameter.putDouble(key, value.getDouble());
	}
	else
	{
		inaParameter.putString(key, value.toString());
	}
	return true;
};
oFF.QInARepoFilterOperation.prototype.getComponentType = function()
{
	return oFF.FilterComponentType.OPERATION;
};
oFF.QInARepoFilterOperation.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var filterExpression = null;
	if (oFF.notNull(parentComponent))
	{
		var parentFilterElement = parentComponent;
		filterExpression = parentFilterElement.getFilterExpression();
	}
	var filterOperation = modelComponent;
	if (oFF.isNull(filterOperation))
	{
		filterOperation = oFF.notNull(filterExpression) ? oFF.QFactory.createFilterOperation(filterExpression, null) : oFF.QFactory.createFilterOperation(context, null);
	}
	var fieldName = inaStructure.getStringByKey("FieldName");
	var field = null;
	if (oFF.notNull(fieldName) && oFF.notNull(context))
	{
		var fieldAccessor = context.getFieldAccessorSingle();
		var calcDimField = null;
		if (oFF.isNull(fieldAccessor) || inaStructure.containsKey("QY_CACHE_CONTEXT"))
		{
			var inaCache = inaStructure.getStructureByKey("QY_CACHE_CONTEXT");
			if (oFF.isNull(inaCache))
			{
				return null;
			}
			var cacheKey = oFF.QInARepoUtils.importCacheKey(inaCache);
			var fieldMetadata = context.getOlapEnv().getFieldMetadata(cacheKey);
			if (oFF.isNull(fieldMetadata) && inaCache.containsKey("StorageName"))
			{
				calcDimField = oFF.QInARepoUtils.getFormulaCalcDimField(context, cacheKey.getKey1(), inaCache.getStringByKey("StorageName"));
				if (oFF.notNull(calcDimField))
				{
					filterOperation.setField(calcDimField);
				}
			}
			if (oFF.notNull(fieldMetadata))
			{
				filterOperation.setFieldMetadata(fieldMetadata);
			}
			else if (oFF.isNull(calcDimField))
			{
				return null;
			}
		}
		else
		{
			field = fieldAccessor.getFieldByName(fieldName);
			if (oFF.isNull(field))
			{
				calcDimField = oFF.QInARepoUtils.getFormulaCalcDimField(context, fieldName, context.getQueryManager().getClientQueryObjectStorageName());
				if (oFF.isNull(calcDimField))
				{
					return null;
				}
			}
			filterOperation.setField(field);
		}
	}
	var inaComparison = inaStructure.getStringByKeyExt("Comparison", "=");
	if (oFF.notNull(inaComparison))
	{
		var comparisonOperator = oFF.QInAConverter.lookupComparison(inaComparison);
		if (oFF.isNull(comparisonOperator))
		{
			importer.addError(oFF.ErrorCodes.INVALID_OPERATOR, oFF.XStringUtils.concatenate2("Unsupported comparison operator: ", inaComparison));
		}
		filterOperation.setComparisonOperator(comparisonOperator);
	}
	else
	{
		filterOperation.setComparisonOperator(null);
	}
	var isExcluding = inaStructure.getBooleanByKeyExt("IsExcluding", false);
	if (isExcluding)
	{
		filterOperation.setSetSign(oFF.SetSign.EXCLUDING);
	}
	else
	{
		filterOperation.setSetSign(oFF.SetSign.INCLUDING);
	}
	var hasLevelOffset = inaStructure.getBooleanByKeyExt("HasLevelOffset", false);
	if (!hasLevelOffset)
	{
		filterOperation.resetLevelOffset();
	}
	else
	{
		var levelOffset = inaStructure.getIntegerByKeyExt("LevelOffset", 0);
		filterOperation.setLevelOffset(levelOffset);
	}
	var hasDepth = inaStructure.getBooleanByKeyExt("HasDepth", false);
	if (!hasDepth)
	{
		filterOperation.resetDepth();
	}
	else
	{
		var depth = inaStructure.getIntegerByKeyExt("Depth", 0);
		filterOperation.setDepth(depth);
	}
	filterOperation.setConvertToFlatFilter(inaStructure.getBooleanByKeyExt("ConvertToFlatSelection", false));
	var uniqueId = inaStructure.getStringByKey("Id");
	filterOperation.setUniqueId(uniqueId);
	var exactness = inaStructure.getDoubleByKeyExt("Exactness", 0.0);
	filterOperation.setExactness(exactness);
	oFF.QInARepoHierarchy.importHierarchyForFilter(importer.isAbap(context), importer.getSession().hasFeature(oFF.FeatureToggleOlap.HIERARCHY_INFO_IN_FILTER), inaStructure, filterOperation, oFF.FilterComponentType.OPERATION);
	var inaValueList = inaStructure.getListByKey("Values");
	oFF.QInARepoFilterOperation.importValues(importer, inaValueList, filterOperation, field, context);
	return filterOperation;
};
oFF.QInARepoFilterOperation.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var filterOperation = modelComponent;
	inaStructure.putString("Id", filterOperation.getUniqueId());
	var fieldMetadata = filterOperation.getFieldMetadata();
	oFF.QInARepoUtils.setNameIfNotNull(inaStructure, "FieldName", fieldMetadata);
	var filterExpression = filterOperation.getFilterExpression();
	if (oFF.notNull(fieldMetadata))
	{
		if (oFF.notNull(filterExpression))
		{
			var parent = filterExpression.getParent();
			if (oFF.notNull(parent) && filterExpression.getParent().getOlapComponentType() === oFF.OlapComponentType.OLAP_FILTER_MANAGER)
			{
				var cacheKey = fieldMetadata.getCacheKey();
				inaStructure.put("QY_CACHE_CONTEXT", oFF.QInARepoUtils.exportCacheKey(cacheKey, filterOperation.getQueryManager()));
			}
		}
	}
	var comparisonOperator = filterOperation.getComparisonOperator();
	inaStructure.putString("Comparison", oFF.QInAConverter.lookupComparisonInA(comparisonOperator));
	inaStructure.putBoolean("IsExcluding", filterOperation.getSetSign() === oFF.SetSign.EXCLUDING);
	inaStructure.putBoolean("HasLevelOffset", filterOperation.hasLevelOffset());
	if (filterOperation.hasLevelOffset())
	{
		inaStructure.putInteger("LevelOffset", filterOperation.getLevelOffset());
	}
	inaStructure.putBoolean("HasDepth", filterOperation.hasDepth());
	if (filterOperation.hasDepth())
	{
		inaStructure.putInteger("Depth", filterOperation.getDepth());
	}
	inaStructure.putDouble("Exactness", filterOperation.getExactness());
	var hierarchyName = filterOperation.getHierarchyName();
	if (oFF.notNull(hierarchyName))
	{
		var filterExpr = filterOperation.getFilterExpression() !== null ? filterOperation.getFilterExpression() : filterOperation.getParent().getFilterExpression();
		var context = filterOperation.getContext();
		oFF.QInARepoHierarchy.exportHierarchyForFilter(exporter, exporter.isAbap(context), inaStructure, null, filterExpr, filterOperation.getQueryManager(), hierarchyName, filterOperation.getHierarchyDueDate(), filterOperation.getHierarchyVersion());
	}
	var inaValueList = oFF.QInARepoFilterOperation.exportValues(exporter, filterOperation);
	inaStructure.put("Values", inaValueList);
	if (filterOperation.isConvertToFlatFilter())
	{
		inaStructure.putBoolean("ConvertToFlatSelection", filterOperation.isConvertToFlatFilter());
	}
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};

oFF.QInARepoFilterTuple = function() {};
oFF.QInARepoFilterTuple.prototype = new oFF.QInARepository();
oFF.QInARepoFilterTuple.prototype._ff_c = "QInARepoFilterTuple";

oFF.QInARepoFilterTuple.prototype.getComponentType = function()
{
	return oFF.FilterComponentType.TUPLE;
};
oFF.QInARepoFilterTuple.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var filterExpression = null;
	if (oFF.notNull(parentComponent))
	{
		var parentFilterElement = parentComponent;
		filterExpression = parentFilterElement.getFilterExpression();
	}
	var filterTuple = oFF.QFilterTuple._create(context, filterExpression);
	filterTuple.setUniqueId(inaStructure.getStringByKey("Id"));
	var inaSubSelectionsOfTuples = inaStructure.getListByKey("SubSelections");
	if (oFF.notNull(inaSubSelectionsOfTuples))
	{
		var tuplesOperandInInA = inaSubSelectionsOfTuples.getStructureAt(0);
		tuplesOperandInInA = tuplesOperandInInA.getStructureByKey("TuplesOperand");
		var fieldNamesFromInA = tuplesOperandInInA.getListByKey("FieldNames");
		var fieldNames = oFF.PrUtils.asListOfString(fieldNamesFromInA);
		filterTuple.setFieldNames(fieldNames);
		var tuplesFromInA = tuplesOperandInInA.getListByKey("Tuples");
		for (var k = 0; k < tuplesFromInA.size(); k++)
		{
			var tupleDataInInA = tuplesFromInA.getListAt(k);
			var tupleData = oFF.PrUtils.asListOfString(tupleDataInInA);
			filterTuple.addTupleCriteria(tupleData);
		}
	}
	return filterTuple;
};
oFF.QInARepoFilterTuple.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var filterTuple = modelComponent;
	inaStructure.putString("Code", "Tuple");
	inaStructure.putString("Id", filterTuple.getUniqueId());
	var inaSubSelectionsTuples = inaStructure.putNewList("SubSelections");
	var tupleStructureInSubSelections = inaSubSelectionsTuples.addNewStructure();
	var tuplesOperandStructure = tupleStructureInSubSelections.putNewStructure("TuplesOperand");
	var fieldNames = tuplesOperandStructure.putNewList("FieldNames");
	var fieldNamesForFiltering = filterTuple.getFieldNames();
	fieldNames.addAllStrings(fieldNamesForFiltering);
	var tuplesInInA = tuplesOperandStructure.putNewList("Tuples");
	var tuples = filterTuple.getTuples();
	for (var l = 0; l < tuples.size(); l++)
	{
		var singleTupleCondition = tuples.get(l);
		var tuplesData = tuplesInInA.addNewList();
		for (var j = 0; j < fieldNamesForFiltering.size(); j++)
		{
			tuplesData.addString(singleTupleCondition.get(j));
		}
	}
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};

oFF.QInARepoFilterVirtualDatasource = function() {};
oFF.QInARepoFilterVirtualDatasource.prototype = new oFF.QInARepository();
oFF.QInARepoFilterVirtualDatasource.prototype._ff_c = "QInARepoFilterVirtualDatasource";

oFF.QInARepoFilterVirtualDatasource.prototype.getComponentType = function()
{
	return oFF.FilterComponentType.VIRTUAL_DATASOURCE;
};
oFF.QInARepoFilterVirtualDatasource.prototype.importComponentWithStructure = oFF.noSupport;
oFF.QInARepoFilterVirtualDatasource.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var virtualDSFilter = modelComponent;
	var inaInnerElement = oFF.PrFactory.createStructure();
	inaInnerElement.putString("Code", "And");
	var vdsSubSelections = inaInnerElement.putNewList("SubSelections");
	var schemaOperandElement = this.createMemberOperand("SchemaName", virtualDSFilter.getSchemaName());
	var packageOperandElement = this.createMemberOperand("PackageName", virtualDSFilter.getPackageName());
	var objectOperandElement = this.createMemberOperand("ObjectName", virtualDSFilter.getObjectName());
	vdsSubSelections.add(schemaOperandElement);
	vdsSubSelections.add(packageOperandElement);
	vdsSubSelections.add(objectOperandElement);
	inaStructure.put("Operator", inaInnerElement);
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};
oFF.QInARepoFilterVirtualDatasource.prototype.createMemberOperand = function(level, value)
{
	var schemaInA = oFF.PrFactory.createStructure();
	schemaInA.putString("AttributeName", level);
	var comparison = oFF.QInAConverter.lookupComparisonInA(oFF.ComparisonOperator.EQUAL);
	schemaInA.putString("Comparison", comparison);
	schemaInA.putString("Value", value);
	var schemaOperandElement = oFF.PrFactory.createStructure();
	schemaOperandElement.put("MemberOperand", schemaInA);
	return schemaOperandElement;
};

oFF.QInARepoFormulaCalculatedDimension = function() {};
oFF.QInARepoFormulaCalculatedDimension.prototype = new oFF.QInARepository();
oFF.QInARepoFormulaCalculatedDimension.prototype._ff_c = "QInARepoFormulaCalculatedDimension";

oFF.QInARepoFormulaCalculatedDimension.importFormulaCalculatedDimension = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var dimension = modelComponent;
	var calcDimName = inaStructure.getStringByKey("Name");
	if (oFF.isNull(dimension))
	{
		if (!context.getModelCapabilities().supportsCalculatedDimensionsExt())
		{
			importer.addWarning(oFF.ErrorCodes.CALCULATED_DIMENSIONS_CAPABILITY_NOT_SUPPORTED, oFF.ErrorMessages.CALCULATED_DIMENSIONS_CAPABILITY_NOT_SUPPORTED_DESERIALIZE);
		}
		dimension = oFF.QFactory.createFormulaCalculatedDimension(context, calcDimName);
		dimension.setParent(parentComponent);
		context.getQueryModel().addDimension(dimension);
	}
	else
	{
		var inaProperties = inaStructure.getStructureByKey("Properties");
		dimension.reset(oFF.notNull(inaProperties));
	}
	dimension.setDimensionType(oFF.DimensionType.FORMULA_CALCULATED_DIMENSION);
	dimension.setName(calcDimName);
	dimension.setTopEntries(inaStructure.getIntegerByKeyExt("Top", 0));
	dimension.setSkipEntries(inaStructure.getIntegerByKeyExt("Skip", 0));
	importer.importTotals(inaStructure, dimension.getResultStructureControllerBase(), context);
	var inaDependentCalcDims = inaStructure.getListByKey("DependentCalcDims");
	if (oFF.notNull(inaDependentCalcDims))
	{
		for (var j = 0; j < inaDependentCalcDims.size(); j++)
		{
			var inaDependentCalcDim = inaDependentCalcDims.get(j);
			var dependentCalcDim = oFF.QFactory.createFormulaCalculatedDimension(context, calcDimName);
			dependentCalcDim.setParent(parentComponent);
			oFF.QInARepoFormulaCalculatedDimension.importFormulaCalculatedDimension(importer, inaDependentCalcDim, dependentCalcDim, null, context);
			dimension.addDependentCalculatedDimension(dependentCalcDim);
		}
	}
	var inaDependentCustomMembers = inaStructure.getListByKey("DependentCustomMembers");
	if (oFF.notNull(inaDependentCustomMembers))
	{
		var queryModelBase = dimension.getQueryModelBase();
		var measureDimension = queryModelBase.getPrimaryCalculationDimension();
		for (var k = 0; k < inaDependentCustomMembers.size(); k++)
		{
			var inaDependentCustomMember = inaDependentCustomMembers.get(k);
			var memberName = inaDependentCustomMember.getStringByKey("Name");
			var aliasName = inaDependentCustomMember.getStringByKey("AliasName");
			if (oFF.XStringUtils.isNullOrEmpty(memberName) && oFF.XStringUtils.isNullOrEmpty(aliasName))
			{
				continue;
			}
			var dependentMeasure;
			if (measureDimension.getStructureMemberByAlias(aliasName) !== null)
			{
				dependentMeasure = measureDimension.getStructureMemberByAlias(aliasName);
			}
			else if (measureDimension.getStructureMember(memberName) !== null)
			{
				dependentMeasure = measureDimension.getStructureMember(memberName);
			}
			else
			{
				dependentMeasure = importer.importStructureMember(measureDimension, inaDependentCustomMember, context);
				if (measureDimension.getDimensionType() === oFF.DimensionType.ACCOUNT)
				{
					dependentMeasure.setAliasName(inaDependentCustomMember.getStringByKey("AliasName"));
				}
			}
			dimension.addDependentCustomMember(dependentMeasure);
		}
	}
	dimension.setApplyParentExternalFilters(inaStructure.getBooleanByKey("IsApplyParentExtFilters"));
	if (inaStructure.getStringByKey("Currency") !== null)
	{
		dimension.setCurrency(inaStructure.getStringByKey("Currency"));
	}
	oFF.QInARepoFormulaCalculatedDimension.importCalculatedDimensionProperties(importer, inaStructure, context, dimension);
	var additionalFilter = dimension.getAdditionalFilterContext();
	var additionalFilterElement = null;
	var inaAdditionalFilterElement = inaStructure.getStructureByKey("AdditionalFilterSelection");
	if (oFF.notNull(inaAdditionalFilterElement))
	{
		additionalFilterElement = importer.importComponent(null, inaAdditionalFilterElement, null, additionalFilter, context);
	}
	additionalFilter.setComplexRoot(additionalFilterElement);
	if (inaStructure.containsKey("IsHidden"))
	{
		dimension.setHidden(inaStructure.getBooleanByKey("IsHidden"));
	}
	return dimension;
};
oFF.QInARepoFormulaCalculatedDimension.importCalculatedDimensionProperties = function(importer, inaStructure, context, dimension)
{
	var inaProperties = inaStructure.getStructureByKey("Properties");
	if (oFF.notNull(inaProperties))
	{
		var inaKeyRef = inaProperties.getStructureByKey("KeyRef");
		var storageName;
		if (dimension.getQueryManager().getClientQueryObjectStorageName() !== null)
		{
			storageName = dimension.getQueryManager().getClientQueryObjectStorageName();
		}
		else
		{
			storageName = inaKeyRef.getStringByKey("StorageName");
		}
		var keyRef = oFF.QFactory.createKeyRef(storageName, inaKeyRef.getStringByKey("GroupName"), inaKeyRef.getStringByKey("ObjectName"));
		dimension.setPropertiesKeyRef(keyRef);
		return;
	}
	if (importer.getMode().isTypeOf(oFF.QModelFormat.INA_REPOSITORY))
	{
		var keyRefStorageName = dimension.getQueryManager().getClientQueryObjectStorageName();
		if (oFF.notNull(keyRefStorageName))
		{
			var clientQueryObjectManager = context.getOlapEnv().getClientQueryObjectManager();
			var properties = clientQueryObjectManager.getFormulaCalcDimProperties(dimension.getName(), keyRefStorageName);
			if (oFF.notNull(properties))
			{
				dimension.setPropertiesKeyRef(properties);
				return;
			}
		}
	}
	var inaCalculatedAttributes = inaStructure.getListByKey("CalculatedAttributes");
	if (oFF.notNull(inaCalculatedAttributes))
	{
		for (var l = 0; l < inaCalculatedAttributes.size(); l++)
		{
			var inaCalculatedAttribute = inaCalculatedAttributes.get(l);
			importer.importComponent(oFF.OlapComponentType.FIELD, inaCalculatedAttribute, null, dimension, context);
		}
	}
	var inaAggregationFieldNames = inaStructure.getListByKey("AggregationFieldNames");
	if (oFF.notNull(inaAggregationFieldNames))
	{
		for (var i = 0; i < inaAggregationFieldNames.size(); i++)
		{
			dimension.addAggregationFieldName(inaAggregationFieldNames.get(i).asString().getString());
		}
	}
	var filter = dimension.getFilterContext();
	var filterElement = null;
	var inaFilterElement = inaStructure.getStructureByKey("Selection");
	if (oFF.notNull(inaFilterElement))
	{
		filterElement = importer.importComponent(null, inaFilterElement, null, filter, context);
	}
	filter.setComplexRoot(filterElement);
	var inaAggregationDimensions = inaStructure.getListByKey("AggregationDimensions");
	if (oFF.notNull(inaAggregationDimensions))
	{
		for (var n = 0; n < inaAggregationDimensions.size(); n++)
		{
			var inaAggregationDimension = inaAggregationDimensions.get(n).asStructure();
			dimension.addAdditionalAggregationDimension(inaAggregationDimension.getStringByKey("DimensionName"), inaAggregationDimension.getStringByKey("HierarchyName"), inaAggregationDimension.getBooleanByKey("HierarchyActivation"));
		}
	}
	var inaExternalFilterIdsToApply = inaStructure.getListByKey("ExternalFilterIdsToApply");
	if (oFF.notNull(inaExternalFilterIdsToApply))
	{
		for (var m = 0; m < inaExternalFilterIdsToApply.size(); m++)
		{
			dimension.getProperties().addFilterIdsToApply(inaExternalFilterIdsToApply.get(m).asString().getString());
		}
	}
	dimension.getProperties().setIsApplyAdditionalFilterContext(inaStructure.getBooleanByKey("ApplyAdditionalFilterContext"));
};
oFF.QInARepoFormulaCalculatedDimension.exportFormulaDimensionParts = function(exporter, inaStructure, dimension)
{
	oFF.QInARepoFormulaCalculatedDimension.exportFormulaCalcProperties(exporter, inaStructure, dimension);
	var dependentCustomMembers = dimension.getDependentCustomMembers();
	if (!dependentCustomMembers.isEmpty())
	{
		var inaDependentCustomMembers = inaStructure.putNewList("DependentCustomMembers");
		var dependentCustomMembersIter = dependentCustomMembers.getIterator();
		while (dependentCustomMembersIter.hasNext())
		{
			var dependentCustomMember = dependentCustomMembersIter.next();
			var inaDependentCustomMember = oFF.QInARepoMemberAbstract.exportCustomMember(exporter, dependentCustomMember);
			if (oFF.notNull(inaDependentCustomMember))
			{
				inaDependentCustomMember.putString("AliasName", dependentCustomMember.getAliasName());
				inaDependentCustomMembers.add(inaDependentCustomMember);
			}
		}
	}
	var dependentDimensions = dimension.getDependentCalculatedDimensions();
	if (!dependentDimensions.isEmpty())
	{
		var inaDependentCalcDimensions = inaStructure.putNewList("DependentCalcDims");
		var dependentDimensionsIter = dependentDimensions.getIterator();
		while (dependentDimensionsIter.hasNext())
		{
			var dependentDimension = dependentDimensionsIter.next();
			exporter.exportDimension(dependentDimension, inaDependentCalcDimensions.addNewStructure());
		}
	}
	inaStructure.putBoolean("IsApplyParentExtFilters", dimension.isApplyParentExternalFilters());
	if (dimension.getCurrency() !== null)
	{
		inaStructure.putString("Currency", dimension.getCurrency());
	}
	var additionalFilterRoot = dimension.getAdditionalFilterContext().getFilterRootElement();
	if (oFF.notNull(additionalFilterRoot))
	{
		var inaAdditionalElement = exporter.exportComponent(null, additionalFilterRoot, null, oFF.QImExFlag.DEFAULT_ALL);
		inaStructure.put("AdditionalFilterSelection", inaAdditionalElement);
	}
};
oFF.QInARepoFormulaCalculatedDimension.exportFormulaCalcProperties = function(exporter, inaStructure, dimension)
{
	var isKeyRefSerializationEnabled = dimension.getQueryManager() !== null && dimension.getQueryManager().isKeyRefSerializationEnabled();
	if (isKeyRefSerializationEnabled && dimension.getOlapEnv() !== null)
	{
		var sharedProperties = dimension.getOlapEnv().getClientQueryObjectManager().getClientQueryObjectIncludeReleasedByKeyRef(dimension.getPropertiesKeyRef(), dimension.getQueryManager().getClientQueryObjectStorageName());
		if (oFF.notNull(sharedProperties))
		{
			var inaProperties = inaStructure.putNewStructure("Properties");
			oFF.QInARepoUtils.addKeyRefStructure(exporter, sharedProperties, inaProperties, dimension.getQueryManager());
			return;
		}
	}
	var filterRoot = dimension.getFilterContext().getFilterRootElement();
	if (oFF.notNull(filterRoot))
	{
		var inaElement = exporter.exportComponent(null, filterRoot, null, oFF.QImExFlag.DEFAULT_ALL);
		inaStructure.put("Selection", inaElement);
	}
	var calculatedAttributes = inaStructure.putNewList("CalculatedAttributes");
	var fieldIterator = dimension.getFieldIterator();
	while (fieldIterator.hasNext())
	{
		var field = fieldIterator.next();
		var calculatedAttribute = exporter.exportComponent(oFF.OlapComponentType.FIELD, field, null, oFF.QImExFlag.DEFAULT_ALL);
		if (calculatedAttribute.asStructure().getStringByKey("PresentationType") === null)
		{
			exporter.exportComponent(oFF.OlapComponentType.FIELD, field, null, oFF.QImExFlag.DEFAULT_ALL);
		}
		calculatedAttributes.add(calculatedAttribute);
	}
	var aggregationFieldNames = dimension.getAggregationFieldNames();
	if (oFF.notNull(aggregationFieldNames))
	{
		var inaAggregationFieldNames = inaStructure.putNewList("AggregationFieldNames");
		inaAggregationFieldNames.addAllStrings(aggregationFieldNames);
	}
	var aggregationDimensions = dimension.getAdditionalAggregationDimensions();
	if (oFF.notNull(aggregationDimensions))
	{
		var aggregationDimensionsIter = aggregationDimensions.getIterator();
		var inaAggregationDimensions = inaStructure.putNewList("AggregationDimensions");
		while (aggregationDimensionsIter.hasNext())
		{
			var aggregationDimension = aggregationDimensionsIter.next();
			var inaAggregationDimension = inaAggregationDimensions.addNewStructure();
			inaAggregationDimension.putString("DimensionName", aggregationDimension.getDimensionName());
			inaAggregationDimension.putString("HierarchyName", aggregationDimension.getHierarchyName());
			inaAggregationDimension.putBoolean("HierarchyActivation", aggregationDimension.activateHierarchy());
		}
	}
	var externalFilterIdsToApply = dimension.getProperties().getFilterIdsToApply();
	if (oFF.notNull(externalFilterIdsToApply))
	{
		var inaExternalFilterIdsToApply = inaStructure.putNewList("ExternalFilterIdsToApply");
		inaExternalFilterIdsToApply.addAllStrings(externalFilterIdsToApply);
	}
	inaStructure.putBoolean("ApplyAdditionalFilterContext", dimension.getProperties().isApplyAdditionalFilterContext());
};
oFF.QInARepoFormulaCalculatedDimension.prototype.getComponentType = function()
{
	return oFF.DimensionType.FORMULA_CALCULATED_DIMENSION;
};
oFF.QInARepoFormulaCalculatedDimension.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	return oFF.QInARepoFormulaCalculatedDimension.importFormulaCalculatedDimension(importer, inaStructure, modelComponent, parentComponent, context);
};
oFF.QInARepoFormulaCalculatedDimension.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var dimension = modelComponent;
	inaStructure.putString("Name", dimension.getName());
	if (dimension.getParent() !== null && dimension.getAxis() !== null)
	{
		var type = dimension.getAxisType();
		inaStructure.putString("Axis", oFF.QInAConverter.lookupAxisTypeInA(type));
	}
	var topEntries = dimension.getTopEntries();
	if (topEntries > 0)
	{
		inaStructure.putInteger("Top", topEntries);
	}
	var skipEntries = dimension.getSkipEntries();
	if (skipEntries > 0)
	{
		inaStructure.putInteger("Skip", skipEntries);
	}
	exporter.exportTotals(dimension, inaStructure);
	oFF.QInARepoFormulaCalculatedDimension.exportFormulaDimensionParts(exporter, inaStructure, dimension);
	if (dimension.isHidden())
	{
		inaStructure.putBoolean("IsHidden", true);
	}
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};

oFF.QInARepoFormulaException = function() {};
oFF.QInARepoFormulaException.prototype = new oFF.QInARepository();
oFF.QInARepoFormulaException.prototype._ff_c = "QInARepoFormulaException";

oFF.QInARepoFormulaException.importEvaluates = function(inaException, queryModel, newException, importer)
{
	var inaEvaluates = inaException.getListByKey("EvaluateOn");
	if (oFF.isNull(inaEvaluates))
	{
		return;
	}
	var size = inaEvaluates.size();
	for (var evalIdx = 0; evalIdx < size; evalIdx++)
	{
		var inaEvaluate = inaEvaluates.getStructureAt(evalIdx);
		var fieldName = inaEvaluate.getStringByKey("Name");
		var someField = queryModel.getFieldByName(fieldName);
		if (oFF.isNull(someField))
		{
			var dimensionByName = queryModel.getDimensionByNameFromExistingMetadata(fieldName);
			if (oFF.notNull(dimensionByName))
			{
				someField = dimensionByName.getKeyField();
			}
		}
		if (oFF.isNull(someField))
		{
			importer.addError(oFF.ErrorCodes.INVALID_TOKEN, oFF.XStringUtils.concatenate3("Could not find field '", fieldName, "'!"));
			return;
		}
		if (!inaEvaluate.containsKey("Low"))
		{
			importer.addError(oFF.ErrorCodes.INVALID_PARAMETER, oFF.XStringUtils.concatenate2("No low value for field: ", fieldName));
			return;
		}
		var valueType = someField.getValueType();
		var lowValue = oFF.QInARepoUtils.importValueByType(importer, inaEvaluate, "Low", valueType);
		if (importer.hasErrors())
		{
			importer.addError(oFF.ErrorCodes.INVALID_DATATYPE, oFF.XStringUtils.concatenate2("Unexpected low valuetype for field: ", valueType.getName()));
			return;
		}
		var newEvaluate = newException._addNewEvaluateWithFieldInternal(someField, lowValue);
		if (inaEvaluate.containsKey("High"))
		{
			var highValue = oFF.QInARepoUtils.importValueByType(importer, inaEvaluate, "High", valueType);
			if (importer.hasErrors())
			{
				importer.addError(oFF.ErrorCodes.INVALID_DATATYPE, oFF.XStringUtils.concatenate2("Unexpected high valuetype for field: ", valueType.getName()));
				return;
			}
			newEvaluate.setHighValue(highValue);
		}
		newEvaluate.setEvaluate(oFF.QExceptionEvalType.lookupExceptionEvalType(inaEvaluate.getStringByKey("Evaluate")));
		var operatorName = inaEvaluate.getStringByKey("Comparison");
		var operator = oFF.QInAConverter.lookupComparison(operatorName);
		if (oFF.isNull(operator))
		{
			importer.addError(oFF.ErrorCodes.INVALID_OPERATOR, oFF.XStringUtils.concatenate3("Unexpected comparison operator for evaluate: Operator: '", operatorName, "'"));
			return;
		}
		newEvaluate.setOperator(operator);
	}
};
oFF.QInARepoFormulaException.importThresholds = function(inaException, newException)
{
	var inaThresholds = inaException.getListByKey("Threshold");
	if (oFF.notNull(inaThresholds))
	{
		var size = inaThresholds.size();
		for (var thresholdIdx = 0; thresholdIdx < size; thresholdIdx++)
		{
			var inaThreshold = inaThresholds.getStructureAt(thresholdIdx);
			var alertLevel = inaThreshold.getIntegerByKeyExt("AlertLevel", -9999);
			var newThreshold;
			var isDouble = !inaThreshold.hasStringByKey("Low");
			if (isDouble)
			{
				newThreshold = newException._addNewThresholdInternal(inaThreshold.getDoubleByKey("Low"), oFF.QInAConverter.lookupAlertLevel(alertLevel));
			}
			else
			{
				newThreshold = newException._addNewThresholdWithStringInternal(inaThreshold.getStringByKey("Low"), oFF.QInAConverter.lookupAlertLevel(alertLevel));
			}
			var name = inaThreshold.getStringByKey("Name");
			if (oFF.notNull(name))
			{
				newThreshold.setName(name);
			}
			var text = inaThreshold.getStringByKey("Text");
			if (oFF.notNull(text))
			{
				newThreshold.setText(text);
			}
			var color = inaThreshold.getStringByKey("Color");
			if (oFF.notNull(color))
			{
				newThreshold.setColor(color);
			}
			var operator = oFF.QInAConverter.lookupComparison(inaThreshold.getStringByKey("Comparison"));
			newThreshold.setOperator(operator);
			if (operator.getNumberOfParameters() === 2)
			{
				if (isDouble)
				{
					var highDouble = inaThreshold.getDoubleByKey("High");
					newThreshold.setHighValue(highDouble);
				}
				else
				{
					var highString = inaThreshold.getStringByKey("High");
					newThreshold.setHigh(highString);
				}
			}
			oFF.QInARepoFormulaException.importSettings(inaThreshold.getListByKey("Settings"), newThreshold);
		}
	}
};
oFF.QInARepoFormulaException.importSettings = function(inaSettings, newThreshold)
{
	if (oFF.isNull(inaSettings))
	{
		return;
	}
	var size = inaSettings.size();
	for (var iSetting = 0; iSetting < size; iSetting++)
	{
		var inaSetting = inaSettings.getStructureAt(iSetting);
		var name = inaSetting.getStringByKey("Name");
		var priority = inaSetting.getIntegerByKey("Priority");
		var value = inaSetting.getStringByKey("Value");
		if (oFF.notNull(value) && !oFF.XString.isEqual(value, ""))
		{
			var newSetting = newThreshold.addNewSetting(name, priority);
			newSetting.setValue(value);
		}
	}
};
oFF.QInARepoFormulaException.exportEvaluates = function(evaluates, exporter, inaStructure, isBw)
{
	if (evaluates.isEmpty())
	{
		return;
	}
	var inaEvaluatesList = inaStructure.putNewList("EvaluateOn");
	var sizeEvaluates = evaluates.size();
	for (var iEvaluate = 0; iEvaluate < sizeEvaluates; iEvaluate++)
	{
		var inaEvaluateStruct = inaEvaluatesList.addNewStructure();
		var evaluate = evaluates.get(iEvaluate);
		inaEvaluateStruct.putString("Name", evaluate.getField().getName());
		inaEvaluateStruct.putString("Evaluate", evaluate.getEvaluate().toString());
		var comparisonOperator = evaluate.getOperator();
		var comparison;
		if (comparisonOperator === oFF.ComparisonOperator.NOT_BETWEEN && isBw)
		{
			comparison = "NOTBETWEEN";
		}
		else
		{
			comparison = oFF.QInAConverter.lookupComparisonInA(comparisonOperator);
		}
		inaEvaluateStruct.putString("Comparison", comparison);
		oFF.QInARepoUtils.exportValue(exporter, "Low", inaEvaluateStruct, evaluate.getLowValue(), evaluate.getValueType());
		if (comparisonOperator.getNumberOfParameters() > 1)
		{
			oFF.QInARepoUtils.exportValue(exporter, "High", inaEvaluateStruct, evaluate.getHighValue(), evaluate.getValueType());
		}
	}
};
oFF.QInARepoFormulaException.exportThresholds = function(thresholds, exporter, inaStructure, isBw)
{
	var inaThresholdsList = inaStructure.putNewList("Threshold");
	var sizeThresholds = thresholds.size();
	for (var iThreshold = 0; iThreshold < sizeThresholds; iThreshold++)
	{
		var threshold = thresholds.get(iThreshold);
		var inaThresholdStruct = inaThresholdsList.addNewStructure();
		var name = threshold.getName();
		if (!oFF.XString.isEqual(name, "Settings"))
		{
			inaThresholdStruct.putStringNotNull("Name", name);
		}
		var comparisonOperator = threshold.getOperator();
		var comparison;
		if (comparisonOperator === oFF.ComparisonOperator.NOT_BETWEEN && isBw)
		{
			comparison = "NOTBETWEEN";
		}
		else
		{
			comparison = oFF.QInAConverter.lookupComparisonInA(comparisonOperator);
		}
		inaThresholdStruct.putString("Comparison", comparison);
		var isDouble = threshold.getValueType() === oFF.XValueType.DOUBLE;
		if (threshold.getLowXValue() !== null)
		{
			if (isDouble)
			{
				inaThresholdStruct.putDouble("Low", threshold.getLowValue());
			}
			else
			{
				inaThresholdStruct.putString("Low", threshold.getLow());
			}
		}
		if (threshold.getHighXValue() !== null && comparisonOperator.getNumberOfParameters() > 1)
		{
			if (isDouble)
			{
				inaThresholdStruct.putDouble("High", threshold.getHighValue());
			}
			else
			{
				inaThresholdStruct.putString("High", threshold.getHigh());
			}
		}
		if (!threshold.isEmpty())
		{
			oFF.QInARepoFormulaException.exportSettings(threshold, exporter, inaThresholdStruct);
		}
		else
		{
			inaThresholdStruct.putInteger("AlertLevel", threshold.getAlertLevel().getLevel());
		}
	}
};
oFF.QInARepoFormulaException.exportSettings = function(threshold, exporter, inaThresholdStruct)
{
	var inaSettings = inaThresholdStruct.putNewList("Settings");
	var size = threshold.size();
	for (var iSetting = 0; iSetting < size; iSetting++)
	{
		var setting = threshold.get(iSetting);
		var inaSetting = inaSettings.addNewStructure();
		inaSetting.putString("Name", setting.getName());
		inaSetting.putInteger("Priority", setting.getPriority());
		var value = setting.getValue();
		if (oFF.isNull(value) || oFF.XString.isEqual(value, ""))
		{
			exporter.addError(oFF.ErrorCodes.INVALID_PARAMETER, "Exception Threshold Setting is missing it's value");
		}
		else
		{
			inaSetting.putString("Value", value);
		}
	}
};
oFF.QInARepoFormulaException.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.FORMULA_EXCEPTION;
};
oFF.QInARepoFormulaException.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var queryModel = context.getQueryModel();
	var formulaException = modelComponent;
	if (oFF.isNull(formulaException))
	{
		var name = inaStructure.getStringByKey("Name");
		var text = inaStructure.getStringByKey("Text");
		formulaException = oFF.QFactory.createFormulaException(context, name, text);
	}
	if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || inaStructure.containsKey("NullAsZero"))
	{
		formulaException.setHandleNullAsZero(inaStructure.getBooleanByKey("NullAsZero"));
	}
	if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || inaStructure.containsKey("AutoSignFlip"))
	{
		formulaException.setAutoSignFlip(inaStructure.getBooleanByKey("AutoSignFlip"));
	}
	if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || inaStructure.containsKey("IsPrimary"))
	{
		formulaException.setIsPrimaryMeasure(inaStructure.getBooleanByKeyExt("IsPrimary", true));
	}
	formulaException.setFormulaExceptionType(oFF.FormulaExceptionType.lookup(inaStructure.getStringByKey("Type")));
	var structureContext = inaStructure.getListByKey("StructureContext");
	var measureStructure = structureContext.getStructureAt(0);
	var measureDimName = this.getDimensionName(queryModel, measureStructure);
	var measureMemberName = measureStructure.getStringByKey("MemberName");
	if (oFF.notNull(measureDimName) && oFF.notNull(measureMemberName))
	{
		var measureDim = queryModel.getDimensionByNameFromExistingMetadata(measureDimName);
		var measureMember = measureDim.getStructureMemberByAliasOrMember(measureMemberName);
		if (oFF.isNull(measureMember))
		{
			measureMember = queryModel.getOlapEnv().getClientQueryObjectManager().getStructuredMember(measureMemberName, queryModel.getQueryManager().getClientQueryObjectStorageName(), measureDim === queryModel.getPrimaryCalculationDimension());
		}
		formulaException.setMeasure(measureMember);
	}
	var baseStructure = structureContext.getStructureAt(1);
	var baseDimName = this.getDimensionName(queryModel, baseStructure);
	var baseMemberName = baseStructure.getStringByKey("MemberName");
	if (oFF.notNull(baseDimName) && oFF.notNull(baseMemberName))
	{
		var baseDim = queryModel.getDimensionByNameFromExistingMetadata(baseDimName);
		var baseMember = baseDim.getStructureMemberByAliasOrMember(baseMemberName);
		if (oFF.isNull(baseMember))
		{
			return null;
		}
		formulaException.setBaseMeasure(baseMember);
	}
	else if (oFF.notNull(baseMemberName))
	{
		formulaException.setBaseMeasureName(baseMemberName);
	}
	oFF.QInARepoFormulaException.importEvaluates(inaStructure, queryModel, formulaException, importer);
	var referenceStructure = structureContext.getStructureAt(2);
	var referenceDimName = this.getDimensionName(queryModel, referenceStructure);
	var referenceMemberName = referenceStructure.getStringByKey("MemberName");
	if (oFF.notNull(referenceDimName) && oFF.notNull(referenceMemberName))
	{
		var referenceDim = queryModel.getDimensionByNameFromExistingMetadata(referenceDimName);
		var referenceMember = referenceDim.getStructureMemberByAliasOrMember(referenceMemberName);
		if (oFF.isNull(referenceMember))
		{
			return null;
		}
		formulaException.setReferenceMeasure(referenceMember);
	}
	else if (oFF.notNull(referenceMemberName))
	{
		formulaException.setReferenceMeasureName(referenceMemberName);
	}
	oFF.QInARepoFormulaException.importThresholds(inaStructure, formulaException);
	return formulaException;
};
oFF.QInARepoFormulaException.prototype.getDimensionName = function(queryModel, measureStructure)
{
	var measureDimName = measureStructure.getStringByKey("DimensionName");
	if (oFF.isNull(measureDimName) && measureStructure.getBooleanByKeyExt("MeasureStructure", false))
	{
		measureDimName = queryModel.getMeasureDimension().getName();
	}
	return measureDimName;
};
oFF.QInARepoFormulaException.prototype.importComponent = function(importer, inaElement, modelComponent, parentComponent, context)
{
	var inaStructure = inaElement;
	var tagName = this.getTagName();
	if (oFF.notNull(tagName) && oFF.notNull(inaStructure))
	{
		inaStructure = inaStructure.getStructureByKey(tagName);
	}
	if (oFF.notNull(context) && context.getQueryModel() !== null && oFF.notNull(inaStructure))
	{
		var inaKeyRef = inaStructure.getStructureByKey("KeyRef");
		if (oFF.notNull(inaKeyRef))
		{
			var keyRef = oFF.QFactory.createKeyRef(inaKeyRef.getStringByKey("StorageName"), inaKeyRef.getStringByKey("GroupName"), inaKeyRef.getStringByKey("ObjectName"));
			var modelFormulaException = context.getQueryModel().getFormulaExceptionManager().getModelFormulaExceptionByKeyRef(keyRef);
			if (oFF.notNull(modelFormulaException))
			{
				return modelFormulaException;
			}
		}
	}
	return oFF.QInARepository.prototype.importComponent.call( this , importer, inaElement, modelComponent, parentComponent, context);
};
oFF.QInARepoFormulaException.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var formulaException = modelComponent;
	inaStructure.putString("Name", formulaException.getName());
	inaStructure.putString("Type", formulaException.getFormulaExceptionType().getName());
	if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || formulaException.hasPropertyChanged(oFF.QExceptionProperties.QY_NULL_AS_ZERO))
	{
		inaStructure.putBoolean("NullAsZero", formulaException.isHandleNullAsZero());
	}
	if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || formulaException.hasPropertyChanged(oFF.QExceptionProperties.QY_AUTO_SIGN_FLIP))
	{
		if (formulaException.isAutoSignFlip() || exporter.mode === oFF.QModelFormat.INA_REPOSITORY_DELTA && formulaException.hasPropertyChanged(oFF.QExceptionProperties.QY_AUTO_SIGN_FLIP))
		{
			inaStructure.putBoolean("AutoSignFlip", formulaException.isAutoSignFlip());
		}
	}
	if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || formulaException.hasPropertyChanged(oFF.QExceptionProperties.QY_IS_PRIMARY))
	{
		inaStructure.putBoolean("IsPrimary", formulaException.isPrimaryMeasure());
	}
	var structureContext = inaStructure.putNewList("StructureContext");
	var measureMemberStruct = structureContext.addNewStructure();
	var measureMember = formulaException.getMeasure();
	if (oFF.notNull(measureMember))
	{
		var measureDim = measureMember.getDimension();
		measureMemberStruct.putString("DimensionName", measureDim.getName());
		measureMemberStruct.putStringNotNull("MemberName", measureMember.getAliasOrMemberName());
	}
	var baseMemberStruct = structureContext.addNewStructure();
	var baseMember = formulaException.getBaseMeasure();
	if (oFF.notNull(baseMember))
	{
		var baseDim = baseMember.getDimension();
		baseMemberStruct.putString("DimensionName", baseDim.getName());
		baseMemberStruct.putStringNotNull("MemberName", baseMember.getAliasOrMemberName());
	}
	else
	{
		baseMemberStruct.putStringNotNull("MemberName", formulaException.getBaseMeasureName());
	}
	var referenceMemberStruct = structureContext.addNewStructure();
	var referenceMember = formulaException.getReferenceMeasure();
	if (oFF.notNull(referenceMember))
	{
		var referenceDim = referenceMember.getDimension();
		referenceMemberStruct.putString("DimensionName", referenceDim.getName());
		referenceMemberStruct.putStringNotNull("MemberName", referenceMember.getAliasOrMemberName());
	}
	else
	{
		referenceMemberStruct.putStringNotNull("MemberName", formulaException.getReferenceMeasureName());
	}
	var queryModel = formulaException.getQueryModel();
	var isBw = exporter.isAbap(queryModel);
	oFF.QInARepoFormulaException.exportThresholds(formulaException.getThresholds(), exporter, inaStructure, isBw);
	oFF.QInARepoFormulaException.exportEvaluates(formulaException.getEvaluates(), exporter, inaStructure, isBw);
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};
oFF.QInARepoFormulaException.prototype.exportKeyReference = function(exporter, modelComponent, inaStructure)
{
	var modelComponent3 = modelComponent;
	if (modelComponent3.getQueryManager() !== null)
	{
		if (!modelComponent3.getQueryManager().isKeyRefSerializationEnabled())
		{
			return false;
		}
	}
	var queryModel = modelComponent3.getQueryModel();
	if (oFF.notNull(queryModel))
	{
		var formulaExceptionManager = queryModel.getFormulaExceptionManager();
		if (formulaExceptionManager.getModelFormulaException(modelComponent3.getName()) === modelComponent3)
		{
			oFF.QInARepoUtils.addKeyRefStructure(exporter, modelComponent3, inaStructure, modelComponent3.getQueryManager());
			return true;
		}
	}
	return oFF.QInARepository.prototype.exportKeyReference.call( this , exporter, modelComponent, inaStructure);
};

oFF.QInARepoFormulaExceptionManager = function() {};
oFF.QInARepoFormulaExceptionManager.prototype = new oFF.QInARepository();
oFF.QInARepoFormulaExceptionManager.prototype._ff_c = "QInARepoFormulaExceptionManager";

oFF.QInARepoFormulaExceptionManager.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.FORMULA_EXCEPTION_MANAGER;
};
oFF.QInARepoFormulaExceptionManager.prototype.getTagName = function()
{
	return "FormulaExceptionManager";
};
oFF.QInARepoFormulaExceptionManager.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var formulaExceptionManager = modelComponent;
	if (oFF.notNull(formulaExceptionManager))
	{
		formulaExceptionManager.clear();
		if (oFF.notNull(inaStructure))
		{
			if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || inaStructure.containsKey("FormulaResultVisible"))
			{
				formulaExceptionManager.setFormulaResultVisible(inaStructure.getBooleanByKeyExt("FormulaResultVisible", false));
			}
			var formulaException;
			var inaList = inaStructure.getListByKey("FormulaExceptionsModeler");
			if (oFF.notNull(inaList))
			{
				for (var i = 0; i < inaList.size(); i++)
				{
					var listItem = inaList.getStructureAt(i);
					var name = listItem.getStringByKey("Name");
					var text = listItem.getStringByKey("Text");
					formulaException = formulaExceptionManager.addNewModelFormulaException(name, text);
					var importedFormulaException = importer.importFormulaException(listItem, formulaException, formulaExceptionManager, context);
					if (oFF.isNull(importedFormulaException))
					{
						formulaExceptionManager.removeModelFormulaException(name, true);
					}
				}
			}
			inaList = inaStructure.getListByKey("FormulaExceptions");
			if (oFF.notNull(inaList))
			{
				for (var j = 0; j < inaList.size(); j++)
				{
					formulaException = importer.importFormulaException(inaList.getStructureAt(j), null, formulaExceptionManager, context);
					formulaExceptionManager.add(formulaException);
				}
			}
		}
	}
	return formulaExceptionManager;
};
oFF.QInARepoFormulaExceptionManager.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var formulaExceptionManager = modelComponent;
	if (oFF.notNull(formulaExceptionManager))
	{
		if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || formulaExceptionManager.hasPropertyChanged(oFF.QExceptionProperties.QY_FORMULA_RESULT_VISIBLE))
		{
			inaStructure.putBoolean("FormulaResultVisible", formulaExceptionManager.isFormulaResultVisible());
		}
		var formulaExceptions = oFF.PrFactory.createList();
		for (var i = 0; i < formulaExceptionManager.size(); i++)
		{
			var formulaException = formulaExceptionManager.get(i);
			if (oFF.notNull(formulaException))
			{
				if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || !oFF.XString.isEqual(formulaException.getStorageName(), oFF.KeyRefConstants.MODEL_FORMULA_EXCEPTIONS))
				{
					var inaException = oFF.PrFactory.createStructure();
					exporter.exportFormulaException(formulaException, inaException);
					formulaExceptions.add(inaException);
				}
			}
		}
		inaStructure.put("FormulaExceptions", formulaExceptions);
	}
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};

oFF.QInARepoHierarchy = function() {};
oFF.QInARepoHierarchy.prototype = new oFF.QInARepository();
oFF.QInARepoHierarchy.prototype._ff_c = "QInARepoHierarchy";

oFF.QInARepoHierarchy.hasPlaceHolderInStructure = function(inaStructure, placeHolderType, placeHolderReference)
{
	var placeHolder = inaStructure.getStringByKey(placeHolderType);
	var hasPlaceHolder = oFF.notNull(placeHolder) && oFF.XString.isEqual(placeHolderReference, placeHolder);
	return hasPlaceHolder;
};
oFF.QInARepoHierarchy.importHierarchyForFilter = function(isAbap, hasHierarchyInfoFeature, inaStructure, filterComponent, filterComponentType)
{
	var hierarchyName = inaStructure.getStringByKey("HierarchyName");
	var hierarchyDueDate = null;
	var hierarchyVersion = null;
	if (hasHierarchyInfoFeature && isAbap)
	{
		hierarchyVersion = inaStructure.getStringByKey("HierarchyVersion");
		var hierarchyDueDateValue = inaStructure.getStringByKey("HierarchyDueDate");
		if (oFF.notNull(hierarchyDueDateValue))
		{
			if (filterComponentType === oFF.FilterComponentType.CARTESIAN_LIST)
			{
				hierarchyDueDate = oFF.XDate.createDateSafe(hierarchyDueDateValue);
			}
			else if (filterComponentType === oFF.FilterComponentType.OPERATION)
			{
				hierarchyDueDate = oFF.XDate.createDateFromSAPFormat(hierarchyDueDateValue);
			}
		}
	}
	if (filterComponentType === oFF.FilterComponentType.CARTESIAN_LIST)
	{
		filterComponent.setHierarchyInfo(hierarchyName, hierarchyDueDate, hierarchyVersion);
	}
	else if (filterComponentType === oFF.FilterComponentType.OPERATION)
	{
		filterComponent.setHierarchyInfo(hierarchyName, hierarchyDueDate, hierarchyVersion);
	}
};
oFF.QInARepoHierarchy.appendItemsToCatalogResult = function(catalogResult, hierarchiesList, dimensionName)
{
	var len = oFF.PrUtils.getListSize(hierarchiesList, 0);
	for (var i = 0; i < len; i++)
	{
		var hierarchyStructure = oFF.PrUtils.getStructureElement(hierarchiesList, i);
		var item = oFF.HierarchyCatalogItem.createCatalogItem();
		item.setDimensionName(dimensionName);
		var hierarchyName;
		if (hierarchyStructure.hasStringByKey("Name"))
		{
			hierarchyName = hierarchyStructure.getStringByKey("Name");
		}
		else
		{
			hierarchyName = hierarchyStructure.getStringByKey("HierarchyName");
		}
		if (oFF.XStringUtils.isNullOrEmpty(hierarchyName) || catalogResult.containsHierarchy(hierarchyName))
		{
			continue;
		}
		item.setHierarchyName(hierarchyName);
		item.setHierarchyUniqueName(hierarchyStructure.getStringByKey("UniqueName"));
		var hierarchyDescription = oFF.PrUtils.getStringProperty(hierarchyStructure, "Description");
		if (oFF.notNull(hierarchyDescription))
		{
			item.setHierarchyLongText(hierarchyDescription.getString());
		}
		var version = oFF.PrUtils.getStringProperty(hierarchyStructure, "Version");
		if (oFF.notNull(version))
		{
			item.setVersionName(version.getString());
		}
		var structure = oFF.PrUtils.getStringProperty(hierarchyStructure, "Structure");
		if (oFF.notNull(structure))
		{
			item.setHierarchyType(oFF.HierarchyType.lookup(structure.getString()));
		}
		var isModeled = oFF.PrUtils.getBooleanValueProperty(hierarchyStructure, "IsModeled", false);
		item.setIsModeled(isModeled);
		var dateTo = oFF.PrUtils.getStringProperty(hierarchyStructure, "DateTo");
		if (oFF.notNull(dateTo))
		{
			var dateToString = dateTo.getString();
			if (oFF.XStringUtils.isNotNullAndNotEmpty(dateToString))
			{
				item.setDateTo(oFF.XDate.createDateFromIsoFormat(dateToString));
			}
		}
		var levels = oFF.PrUtils.getListProperty(hierarchyStructure, "Levels");
		if (oFF.notNull(levels))
		{
			item.setSupportsHierarchyLevels(true);
			var levelList = oFF.XList.create();
			var lenLevel = oFF.PrUtils.getListSize(levels, 0);
			for (var levelIndex = 0; levelIndex < lenLevel; levelIndex++)
			{
				var levelStructure = oFF.PrUtils.getStructureElement(levels, levelIndex);
				if (oFF.isNull(levelStructure))
				{
					continue;
				}
				var catalogLevel = oFF.HierarchyCatalogLevel.createCatalogLevel();
				var level = oFF.PrUtils.getIntegerValueProperty(levelStructure, "Level", -1);
				if (level > -1)
				{
					catalogLevel.setLevel(level);
				}
				var levelName = oFF.PrUtils.getStringProperty(levelStructure, "LevelName");
				if (oFF.notNull(levelName))
				{
					catalogLevel.setLevelName(levelName.getString());
				}
				var levelCaption = oFF.PrUtils.getStringProperty(levelStructure, "LevelCaption");
				if (oFF.notNull(levelCaption))
				{
					catalogLevel.setLevelDescription(levelCaption.getString());
				}
				var levelUniqueName = oFF.PrUtils.getStringProperty(levelStructure, "LevelUniqueName");
				if (oFF.notNull(levelUniqueName))
				{
					catalogLevel.setLevelUniqueName(levelUniqueName.getString());
				}
				var levelDimensionName = oFF.PrUtils.getStringProperty(levelStructure, "DimensionName");
				if (oFF.notNull(levelDimensionName))
				{
					catalogLevel.setLevelDimensionName(levelDimensionName.getString());
				}
				var levelType = oFF.PrUtils.getIntegerProperty(levelStructure, "LevelType");
				if (oFF.notNull(levelType))
				{
					catalogLevel.setLevelType(oFF.QInAConverter.lookupHierarchyLevelType(levelType.getInteger()));
				}
				levelList.add(catalogLevel);
			}
			item.setHierarchyLevels(levelList);
		}
		var restNode = hierarchyStructure.getStringByKey("RestNode");
		if (oFF.notNull(restNode))
		{
			item.setRestNode(restNode);
		}
		var virtualRootNode = hierarchyStructure.getStringByKey("VirtualRootNode");
		if (oFF.notNull(virtualRootNode))
		{
			item.setVirtualRootNode(virtualRootNode);
		}
		catalogResult.addItem(item);
	}
	return catalogResult;
};
oFF.QInARepoHierarchy.importLeveledHierarchy = function(importer, context, dimension, inaHierarchy)
{
	var hier = oFF.QLeveledHierarchy.create(context, dimension, inaHierarchy.getStringByKey(inaHierarchy.containsKey("Name") ? "Name" : "HierarchyName"));
	hier.setHierarchyUniqueName(inaHierarchy.getStringByKey("UniqueName"));
	if (inaHierarchy.getStringByKey("DimensionName") === null)
	{
		hier.setDimensionName(dimension.getName());
	}
	else
	{
		hier.setDimensionName(inaHierarchy.getStringByKey("DimensionName"));
	}
	hier.setHierarchyType(oFF.HierarchyType.lookup(inaHierarchy.getStringByKey("Structure")));
	hier.setIsModeled(inaHierarchy.getBooleanByKeyExt("IsModeled", false));
	var hierDueDate = inaHierarchy.getStringByKey("DueDate");
	if (oFF.XStringUtils.isNotNullAndNotEmpty(hierDueDate))
	{
		hier.setDateTo(oFF.QInARepoUtils.createDate(hierDueDate));
	}
	hier.setHierarchyDescription(inaHierarchy.getStringByKey("Description"));
	var inaLevels = inaHierarchy.getListByKey("Levels");
	if (!oFF.PrUtils.isListEmpty(inaLevels))
	{
		oFF.QInARepoHierarchy.importLevels(hier, inaLevels);
	}
	return hier;
};
oFF.QInARepoHierarchy.importLevels = function(hier, inaLevels)
{
	var size = inaLevels.size();
	for (var levelIdx = 0; levelIdx < size; levelIdx++)
	{
		var inaLevel = inaLevels.getStructureAt(levelIdx);
		var level = oFF.QHierarchyLevel.create(hier, inaLevel.getStringByKey("LevelUniqueName"), inaLevel.getIntegerByKey("Level"));
		level.setLevelName(inaLevel.getStringByKey("LevelName"));
		level.setLevelText(inaLevel.getStringByKey("LevelCaption"));
		level.setLevelDimensionName(inaLevel.getStringByKey("DimensionName"));
		level.setLevelType(oFF.QInAConverter.lookupHierarchyLevelType(inaLevel.getIntegerByKey("LevelType")));
		level.setNavigationAttribute(inaLevel.getStringByKey("NavAttr"));
		hier.getAllLevelBase().add(level);
	}
};
oFF.QInARepoHierarchy.isNamePlaceHolderForAutoSubmit = function(dimension)
{
	var isHierarchyNameVariableForAutoSubmit = false;
	if (oFF.notNull(dimension))
	{
		var queryManagerBase = dimension.getQueryManager();
		isHierarchyNameVariableForAutoSubmit = oFF.notNull(queryManagerBase) && queryManagerBase.isExecuteAutoVariableSubmit() && dimension.useHierarchyNameVariable() && oFF.XStringUtils.isNotNullAndNotEmpty(dimension.getHierarchyNameVariableName());
	}
	return isHierarchyNameVariableForAutoSubmit;
};
oFF.QInARepoHierarchy.isDueDatePlaceHolderForAutoSubmit = function(dimension)
{
	var isDueDateVariableForAutoSubmit = false;
	if (oFF.notNull(dimension))
	{
		var queryManagerBase = dimension.getQueryManager();
		isDueDateVariableForAutoSubmit = oFF.notNull(queryManagerBase) && queryManagerBase.isExecuteAutoVariableSubmit() && dimension.useHierarchyDueDateVariable() && oFF.XStringUtils.isNotNullAndNotEmpty(dimension.getHierarchyDueDateVariableName());
	}
	return isDueDateVariableForAutoSubmit;
};
oFF.QInARepoHierarchy.isVersionPlaceHolderForAutoSubmit = function(dimension)
{
	var isVersionVariableForAutoSubmit = false;
	if (oFF.notNull(dimension))
	{
		var queryManagerBase = dimension.getQueryManager();
		isVersionVariableForAutoSubmit = oFF.notNull(queryManagerBase) && queryManagerBase.isExecuteAutoVariableSubmit() && dimension.useHierarchyVersionVariable() && oFF.XStringUtils.isNotNullAndNotEmpty(dimension.getHierarchyVersionVariableName());
	}
	return isVersionVariableForAutoSubmit;
};
oFF.QInARepoHierarchy.exportLevels = function(inaHierarchy, hierarchyItem)
{
	if (hierarchyItem.supportsHierarchyLevels())
	{
		var inaLevels = inaHierarchy.putNewList("Levels");
		var hierarchyLevels = hierarchyItem.getHierarchyLevels();
		var size = hierarchyLevels.size();
		for (var levelIdx = 0; levelIdx < size; levelIdx++)
		{
			var currentLevel = hierarchyLevels.get(levelIdx);
			var inaLevel = inaLevels.addNewStructure();
			inaLevel.putString("LevelUniqueName", currentLevel.getLevelUniqueName());
			inaLevel.putInteger("Level", currentLevel.getLevel());
			inaLevel.putString("LevelName", currentLevel.getLevelName());
			inaLevel.putString("LevelCaption", currentLevel.getLevelDescription());
			inaLevel.putStringNotNull("DimensionName", currentLevel.getLevelDimensionName());
			inaLevel.putInteger("LevelType", oFF.QInAConverter.lookupHierarchyLevelTypeIna(currentLevel.getLevelType()));
		}
	}
};
oFF.QInARepoHierarchy.exportHierarchyForFilter = function(exporter, isAbap, inaStructure, dimension, filterExpression, queryManager, hierarchyName, dueDate, version)
{
	if (oFF.notNull(hierarchyName))
	{
		inaStructure.putString("HierarchyName", hierarchyName);
		if (exporter.getSession().hasFeature(oFF.FeatureToggleOlap.HIERARCHY_INFO_IN_FILTER) && isAbap)
		{
			if (oFF.isNull(filterExpression) || !oFF.XString.isEqual(filterExpression.getName(), oFF.QFilter.FIXED_FILTER_CONTAINER) || oFF.notNull(queryManager) && queryManager.isExecuteAutoVariableSubmit())
			{
				oFF.QInARepoUtils.setDateIfNotNull(exporter, inaStructure, "HierarchyDueDate", dueDate);
				inaStructure.putStringNotNull("HierarchyVersion", version);
			}
		}
	}
};
oFF.QInARepoHierarchy.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.HIERARCHY;
};
oFF.QInARepoHierarchy.prototype.getTagName = function()
{
	return "HierarchyRepo";
};
oFF.QInARepoHierarchy.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var dimension = modelComponent;
	if (dimension.supportsHierarchy())
	{
		var fixInFilter = dimension.isDisplayHierarchyFixInFilter();
		dimension.getHierarchyManagerBase().setDisplayHierarchyFixInFilter(false);
		if (oFF.isNull(inaStructure))
		{
			dimension.setHierarchy(null);
		}
		else if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || inaStructure.hasElements())
		{
			var hierarchyName = inaStructure.getStringByKey("Name") !== null ? inaStructure.getStringByKey("Name") : inaStructure.getStringByKey("HierarchyName");
			var isHierarchyNamePlaceHolderInStructure = oFF.QInARepoHierarchy.hasPlaceHolderInStructure(inaStructure, "NameIs", "Variable");
			dimension.getHierarchyManagerBase().setUseHierarchyNameVariable(isHierarchyNamePlaceHolderInStructure);
			if (isHierarchyNamePlaceHolderInStructure)
			{
				dimension.getHierarchyManagerBase().setHierarchyNameVariableName(hierarchyName);
			}
			var hierarchy = null;
			if (oFF.XStringUtils.isNotNullAndNotEmpty(hierarchyName))
			{
				if (dimension.getModelCapabilities().supportsDimensionHierarchyLevels())
				{
					this.importHierarchyAsCatalogItem(inaStructure, dimension);
					this.importLeveledHierarchyToMetadata(importer, inaStructure, context, dimension);
				}
				var leveledHierarchy = dimension.getLeveledHierarchy(hierarchyName);
				var isHierarchyActiveDefaultValue = false;
				if (importer.getMode() === oFF.QModelFormat.INA_REPOSITORY_DELTA && (oFF.XStringUtils.isNotNullAndNotEmpty(dimension.getHierarchyName()) || oFF.notNull(leveledHierarchy)))
				{
					if (dimension.getHierarchy() !== null && oFF.XString.isEqual(dimension.getHierarchyName(), hierarchyName))
					{
						hierarchy = dimension.getHierarchy();
						isHierarchyActiveDefaultValue = dimension.isHierarchyActive();
					}
					else if (oFF.notNull(leveledHierarchy) && oFF.XString.isEqual(leveledHierarchy.getName(), hierarchyName))
					{
						hierarchy = oFF.QHierarchy.create(dimension.getContext(), dimension, hierarchyName);
					}
				}
				else
				{
					if (inaStructure.getBooleanByKey("IsTransient"))
					{
						hierarchy = oFF.QHierarchy.createCustomHierarchy(dimension.getContext(), dimension, hierarchyName, inaStructure.getStringByKey("Description"));
					}
					else
					{
						hierarchy = oFF.QHierarchy.create(dimension.getContext(), dimension, hierarchyName);
					}
				}
				this.importHierarchyDueDate(importer, inaStructure, dimension, hierarchy);
				this.importHierarchyVersion(inaStructure, dimension, hierarchy);
				if (oFF.notNull(hierarchy))
				{
					dimension.setHierarchy(hierarchy);
					if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA)
					{
						isHierarchyActiveDefaultValue = true;
					}
					var isActive = isHierarchyNamePlaceHolderInStructure ? false : inaStructure.getBooleanByKeyExt("HierarchyActive", isHierarchyActiveDefaultValue);
					dimension.setHierarchyActive(isActive);
					dimension.setSelectorHierarchyActive(isActive);
					var queryManagerBase = dimension.getQueryManager();
					var isAutoSubmit = oFF.notNull(queryManagerBase) && queryManagerBase.isExecuteAutoVariableSubmit();
					if (isAutoSubmit && inaStructure.containsKey("UseDefaultDrillLevelOnChange"))
					{
						dimension.setUseDefaultDrillLevelOnChange(inaStructure.getBooleanByKey("UseDefaultDrillLevelOnChange"));
					}
				}
			}
			var stickyDimensionMembers = inaStructure.getListByKey("StickyDimensionMembers");
			dimension.clearStickyMembers();
			if (oFF.XCollectionUtils.hasElements(stickyDimensionMembers))
			{
				for (var sdi = 0; sdi < stickyDimensionMembers.size(); sdi++)
				{
					dimension.addStickyMember(stickyDimensionMembers.getStringAt(sdi));
				}
			}
			var defaultInitialDrillLevel = 0;
			if (importer.getMode() === oFF.QModelFormat.INA_REPOSITORY_DELTA)
			{
				defaultInitialDrillLevel = dimension.getInitialDrillLevel();
			}
			var initialDrillLevel = inaStructure.getIntegerByKeyExt("InitialDrillLevel", defaultInitialDrillLevel);
			var selectorInitialDrillLevel = dimension.getSelectorRootLevel();
			if (importer.getMode() !== oFF.QModelFormat.INA_REPOSITORY_DELTA)
			{
				selectorInitialDrillLevel = inaStructure.getIntegerByKeyExt("SelectorInitialDrillLevel", initialDrillLevel);
			}
			else if (inaStructure.containsKey("SelectorInitialDrillLevel"))
			{
				selectorInitialDrillLevel = inaStructure.getIntegerByKey("SelectorInitialDrillLevel");
			}
			dimension.setInitialDrillLevel(initialDrillLevel);
			dimension.setSelectorInitialDrillLevel(selectorInitialDrillLevel);
			if (dimension.getModelCapabilities().supportsMaxDrillLevel())
			{
				if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || inaStructure.containsKey("MaxDrillLevel"))
				{
					var maxDrillLevel = inaStructure.getIntegerByKeyExt("MaxDrillLevel", -1);
					dimension.getHierarchyManager().setMaxDrillLevel(maxDrillLevel);
				}
				if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || inaStructure.containsKey("MaxRuntimeLevel"))
				{
					var maxRuntimeLevel = inaStructure.getIntegerByKeyExt("MaxRuntimeLevel", -1);
					dimension.getHierarchyManager().setMaxRuntimeLevel(maxRuntimeLevel);
				}
			}
			var initialDrillOffset = inaStructure.getIntegerByKeyExt("InitialDrillOffset", 0);
			dimension.setInitialDrillOffset(initialDrillOffset);
			dimension.setExplicitDrillOnFilteredNodes(inaStructure.getBooleanByKeyExt("ExplicitDrillOnFilteredNodes", false));
			if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || inaStructure.containsKey("LowerLevelNodeAlignment") || inaStructure.containsKey("ExpandBottomUp"))
			{
				var alignment = oFF.Alignment.DEFAULT_VALUE;
				if (context.getModelCapabilities().supportsExpandBottomUp())
				{
					var nodeAlignment = inaStructure.getStringByKeyExt("LowerLevelNodeAlignment", "Default");
					alignment = oFF.QInAConverter.lookupLowerLevelNodeAlignment(nodeAlignment);
					if (inaStructure.containsKey("ExpandBottomUp"))
					{
						var isExpandingBottomUp = inaStructure.getBooleanByKeyExt("ExpandBottomUp", false);
						if (isExpandingBottomUp)
						{
							alignment = oFF.Alignment.CHILDREN_ABOVE_PARENT;
						}
					}
				}
				dimension.setLowerLevelNodeAlignment(alignment);
			}
			if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || inaStructure.containsKey("NodeCondensation"))
			{
				var nodeCondensation = inaStructure.getBooleanByKeyExt("NodeCondensation", false);
				dimension.setHasNodeCondensation(nodeCondensation);
			}
			if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || inaStructure.containsKey("MemberOfPostedNodeVisibility"))
			{
				var memberOfPostedNodeVisibility = inaStructure.getStringByKeyExt("MemberOfPostedNodeVisibility", "Visible");
				var visibility = oFF.QInAConverter.lookupResultSetVisibility(memberOfPostedNodeVisibility);
				dimension.setMemberOfPostedNodeVisibility(visibility);
			}
			dimension.getHierarchyManagerBase().setDisplayHierarchyFixInFilter(fixInFilter);
			return hierarchy;
		}
		dimension.getHierarchyManagerBase().setDisplayHierarchyFixInFilter(fixInFilter);
	}
	return null;
};
oFF.QInARepoHierarchy.prototype.importHierarchyDueDate = function(importer, inaStructure, dimension, hierarchy)
{
	var dueDate = inaStructure.getStringByKey("DueDate");
	var isHierarchyDueDatePlaceHolderInStructure = oFF.QInARepoHierarchy.hasPlaceHolderInStructure(inaStructure, "DueDateIs", "Variable");
	dimension.setUseHierarchyDueDateVariable(isHierarchyDueDatePlaceHolderInStructure);
	if (isHierarchyDueDatePlaceHolderInStructure)
	{
		dimension.setHierarchyDueDateVariableName(oFF.XStringUtils.isNullOrEmpty(dueDate) ? null : dueDate);
	}
	else if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || inaStructure.containsKey("DueDate"))
	{
		if (oFF.notNull(hierarchy))
		{
			hierarchy.setHierarchyDueDate(oFF.QInARepoUtils.createDate(dueDate));
		}
	}
	if (oFF.notNull(hierarchy))
	{
		var dateTo = inaStructure.getStringByKey("DateTo");
		hierarchy.setDateTo(oFF.QInARepoUtils.createDate(dateTo));
		var dateFrom = inaStructure.getStringByKey("0DATEFROM");
		hierarchy.setDateFrom(oFF.QInARepoUtils.createDate(dateFrom));
		var inaMetadata = inaStructure.getStructureByKey("Metadata");
		if (oFF.notNull(inaMetadata))
		{
			dateTo = inaMetadata.getStringByKey("DateTo");
			if (oFF.XStringUtils.isNotNullAndNotEmpty(dateTo))
			{
				hierarchy.setDateTo(oFF.QInARepoUtils.createDate(dateTo));
			}
			dateFrom = inaMetadata.getStringByKey("0DATEFROM");
			if (oFF.XStringUtils.isNotNullAndNotEmpty(dateFrom))
			{
				hierarchy.setDateFrom(oFF.QInARepoUtils.createDate(dateFrom));
			}
		}
	}
};
oFF.QInARepoHierarchy.prototype.importHierarchyVersion = function(inaStructure, dimension, hierarchy)
{
	var version = inaStructure.getStringByKey("Version");
	var isHierarchyVersionPlaceHolderInStructure = oFF.QInARepoHierarchy.hasPlaceHolderInStructure(inaStructure, "VersionIs", "Variable");
	dimension.getHierarchyManagerBase().setUseHierarchyVersionVariable(isHierarchyVersionPlaceHolderInStructure);
	if (isHierarchyVersionPlaceHolderInStructure)
	{
		dimension.getHierarchyManagerBase().setHierarchyVersionVariableName(oFF.XStringUtils.isNullOrEmpty(version) ? null : version);
	}
	else if (oFF.notNull(hierarchy))
	{
		hierarchy.setHierarchyVersion(version);
	}
};
oFF.QInARepoHierarchy.prototype.importHierarchyAsCatalogItem = function(inaStructure, dimension)
{
	var hierarchyAsList = oFF.PrFactory.createList();
	hierarchyAsList.add(inaStructure);
	var hierarchyCatalogResult = dimension.getHierarchies();
	if (oFF.isNull(hierarchyCatalogResult))
	{
		hierarchyCatalogResult = oFF.QFactory.createHierarchyCatalogResult();
		oFF.QInARepoHierarchy.appendItemsToCatalogResult(hierarchyCatalogResult, hierarchyAsList, dimension.getName());
		dimension.getHierarchyManagerBase().setHierarchies(hierarchyCatalogResult);
	}
	else
	{
		oFF.QInARepoHierarchy.appendItemsToCatalogResult(hierarchyCatalogResult, hierarchyAsList, dimension.getName());
	}
};
oFF.QInARepoHierarchy.prototype.importLeveledHierarchyToMetadata = function(importer, inaStructure, context, dimension)
{
	var queryManagerBase = dimension.getQueryModelBase().getQueryManagerBase();
	if (oFF.notNull(queryManagerBase) && !oFF.PrUtils.isListEmpty(inaStructure.getListByKey("Levels")))
	{
		var metadataModel = queryManagerBase.getMetadataModelBase();
		var metaHierarchies = metadataModel.getLeveledHierarchiesBase();
		var leveledHierarchy = oFF.QInARepoHierarchy.importLeveledHierarchy(importer, context, dimension, inaStructure);
		if (!metaHierarchies.contains(leveledHierarchy))
		{
			metaHierarchies.add(leveledHierarchy);
		}
	}
};
oFF.QInARepoHierarchy.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var dimension = modelComponent;
	if (dimension.supportsHierarchy())
	{
		var isHierarchyActive = dimension.isHierarchyActive();
		var isBw = exporter.isAbap(dimension.getQueryModel());
		var hierarchyName = dimension.getHierarchyName();
		var queryManagerBase = dimension.getQueryManager();
		var isAutoSubmit = oFF.notNull(queryManagerBase) && queryManagerBase.isExecuteAutoVariableSubmit();
		var isDueDateVariableForAutoSubmit = oFF.QInARepoHierarchy.isDueDatePlaceHolderForAutoSubmit(dimension);
		var isVersionVariableForAutoSubmit = oFF.QInARepoHierarchy.isVersionPlaceHolderForAutoSubmit(dimension);
		var isHierarchyNameVariableForAutoSubmit = oFF.QInARepoHierarchy.isNamePlaceHolderForAutoSubmit(dimension);
		var useVariableHierarchy = oFF.XStringUtils.isNullOrEmpty(hierarchyName) && isHierarchyNameVariableForAutoSubmit;
		var actualHierarchyOnDimension = hierarchyName;
		if (useVariableHierarchy)
		{
			hierarchyName = dimension.getHierarchyNameVariableName();
		}
		if (oFF.XStringUtils.isNotNullAndNotEmpty(hierarchyName))
		{
			var hierarchyManager = dimension.getHierarchyManagerBase();
			var shouldContinueExporting = exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || hierarchyManager.shouldExportInRepoDeltaFormat();
			if (shouldContinueExporting)
			{
				oFF.QInAExportUtil.setNonEmptyString(inaStructure, "HierarchyName", hierarchyName);
				oFF.QInAExportUtil.setNonEmptyString(inaStructure, "Name", hierarchyName);
				if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || hierarchyManager.hasPropertyChanged(oFF.QHierarchyProperties.QY_HIERARCHY_ACTIVE))
				{
					inaStructure.putBoolean("HierarchyActive", isHierarchyActive);
				}
				if (oFF.XStringUtils.isNullOrEmpty(actualHierarchyOnDimension) || oFF.XString.isEqual(actualHierarchyOnDimension, dimension.getHierarchyNameVariableName()))
				{
					inaStructure.putString("NameIs", "Variable");
				}
				if (dimension.useHierarchyDueDateVariable() || isDueDateVariableForAutoSubmit)
				{
					inaStructure.putString("DueDateIs", "Variable");
					oFF.QInAExportUtil.setNonEmptyString(inaStructure, "DueDate", dimension.getHierarchyDueDateVariableName());
				}
				else if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || hierarchyManager.hasPropertyChanged(oFF.QHierarchyProperties.QY_DUE_DATE))
				{
					oFF.QInARepoUtils.setDate(exporter, inaStructure, "DueDate", dimension.getHierarchyDueDate());
				}
				if (isVersionVariableForAutoSubmit)
				{
					inaStructure.putString("VersionIs", "Variable");
					oFF.QInAExportUtil.setNonEmptyString(inaStructure, "Version", dimension.getHierarchyVersionVariableName());
				}
				else
				{
					oFF.QInAExportUtil.setNonEmptyString(inaStructure, "Version", dimension.getHierarchyVersion());
				}
				if (isAutoSubmit && dimension.useDefaultDrillLevelOnChange())
				{
					inaStructure.putBoolean("UseDefaultDrillLevelOnChange", true);
				}
				var initialDrillLevel = 0;
				initialDrillLevel = dimension.getInitialDrillLevel();
				if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || dimension.hasPropertyChanged(oFF.QDimensionProperties.QY_SELECTOR_INITIAL_DRILL_LEVEL))
				{
					inaStructure.putInteger("SelectorInitialDrillLevel", dimension.getSelectorRootLevel());
				}
				if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || hierarchyManager.hasPropertyChanged(oFF.QHierarchyProperties.QY_DRILL_LEVEL))
				{
					inaStructure.putInteger("InitialDrillLevel", initialDrillLevel);
				}
				if (dimension.getInitialDrillOffset() !== 0)
				{
					inaStructure.putInteger("InitialDrillOffset", dimension.getInitialDrillOffset());
				}
				if (dimension.isExplicitDrillOnFilteredNodes())
				{
					inaStructure.putBoolean("ExplicitDrillOnFilteredNodes", dimension.isExplicitDrillOnFilteredNodes());
				}
				var isSupportMaxDrillLevel = dimension.getModelCapabilities() !== null && dimension.getModelCapabilities().supportsMaxDrillLevel();
				if (isSupportMaxDrillLevel)
				{
					if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || hierarchyManager.hasPropertyChanged(oFF.QHierarchyProperties.QY_MAX_DRILL_LEVEL))
					{
						var maxDrillLevel = dimension.getMaxDrillLevel();
						inaStructure.putInteger("MaxDrillLevel", maxDrillLevel);
					}
					if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || hierarchyManager.hasPropertyChanged(oFF.QHierarchyProperties.QY_MAX_RUNTIME_LEVEL))
					{
						var maxRuntimeLevel = dimension.getMaxRuntimeLevel();
						inaStructure.putInteger("MaxRuntimeLevel", maxRuntimeLevel);
					}
				}
				if (dimension.hasStickyMembers())
				{
					inaStructure.putNewList("StickyDimensionMembers").addAllStrings(dimension.getStickyMembers());
				}
				var alignment = dimension.getLowerLevelNodeAlignment();
				if (dimension.getModelCapabilities().supportsExpandBottomUp())
				{
					if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || hierarchyManager.hasPropertyChanged(oFF.QHierarchyProperties.QY_LOWER_LEVEL_NODE_ALIGNMENT))
					{
						inaStructure.putBoolean("ExpandBottomUp", alignment === oFF.Alignment.CHILDREN_ABOVE_PARENT);
					}
				}
				if (isBw)
				{
					if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || hierarchyManager.hasPropertyChanged(oFF.QHierarchyProperties.QY_LOWER_LEVEL_NODE_ALIGNMENT))
					{
						var nodeAlignment;
						var capabilities = dimension.getModelCapabilities();
						if (oFF.notNull(capabilities) && capabilities.supportsExpandBottomUp())
						{
							nodeAlignment = oFF.QInAConverter.lookupLowerLevelNodeAlignmentInA(alignment);
						}
						else
						{
							nodeAlignment = oFF.QInAConverter.lookupLowerLevelNodeAlignmentInA2(alignment);
						}
						inaStructure.putString("LowerLevelNodeAlignment", nodeAlignment);
					}
					if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || dimension.getHierarchyManager().hasPropertyChanged(oFF.QHierarchyProperties.QY_NODE_CONDENSATION))
					{
						var nodeCondensation = dimension.hasNodeCondensation();
						inaStructure.putBoolean("NodeCondensation", nodeCondensation);
					}
					if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || hierarchyManager.hasPropertyChanged(oFF.QHierarchyProperties.QY_MEMBER_OF_POSTED_NODE_VISIBILITY))
					{
						var visibility = dimension.getMemberOfPostedNodeVisibility();
						var memberOfPostedNodeVisibility = oFF.QInAConverter.lookupResultSetVisibilityInA(visibility);
						inaStructure.putString("MemberOfPostedNodeVisibility", memberOfPostedNodeVisibility);
					}
				}
				if (dimension.isHierarchyNavigationDeltaMode())
				{
					inaStructure.putBoolean("HierarchyNavigationDeltaMode", true);
				}
				if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA)
				{
					this.exportHierarchyLevels(inaStructure, dimension, hierarchyName);
				}
				var hierarchy = dimension.getHierarchy();
				if (oFF.notNull(hierarchy) && hierarchy.isCustomHierarchy())
				{
					inaStructure.putBoolean("IsTransient", true);
					inaStructure.putStringNotNull("Description", hierarchy.getHierarchyDescription());
				}
			}
			return inaStructure;
		}
	}
	return null;
};
oFF.QInARepoHierarchy.prototype.exportHierarchyLevels = function(inaStructure, dimension, hierarchyName)
{
	if (dimension.getModelCapabilities().supportsDimensionHierarchyLevels())
	{
		var hierarchies = dimension.getHierarchies();
		if (oFF.notNull(hierarchies))
		{
			var hierarchiesIt = hierarchies.getObjectsIterator();
			while (hierarchiesIt.hasNext())
			{
				var catalogItem = hierarchiesIt.next();
				if (oFF.XString.isEqual(catalogItem.getHierarchyName(), hierarchyName))
				{
					oFF.QInARepoHierarchy.exportLevels(inaStructure, catalogItem);
					return;
				}
			}
		}
	}
};

oFF.QInARepoMemberAbstract = function() {};
oFF.QInARepoMemberAbstract.prototype = new oFF.QInARepository();
oFF.QInARepoMemberAbstract.prototype._ff_c = "QInARepoMemberAbstract";

oFF.QInARepoMemberAbstract.importChartFormatting = function(inaStructure, member)
{
	member.setShowCellChart(inaStructure.getBooleanByKey("ShowCellChart"));
	member.setHideNumberForCellChart(inaStructure.getBooleanByKey("HideNumberForCellChart"));
	member.setCellChartBarColor(inaStructure.getStringByKey("CellChartBarColor"));
	member.setCellChartLineColor(inaStructure.getStringByKey("CellChartLineColor"));
	member.setCellChartType(oFF.QInAConverter.lookupCellChartType(inaStructure.getStringByKey("CellChartType")));
	member.setCellChartOrientation(oFF.QInAConverter.lookupCellChartOrientation(inaStructure.getStringByKey("CellChartOrientation")));
};
oFF.QInARepoMemberAbstract.importFormattingProperties = function(importer, measureIna, measure)
{
	if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || measureIna.hasStringByKey("CurrencyPresentation"))
	{
		measure.setCurrencyPresentation(oFF.QInAConverter.lookupCurrencyPresentation(measureIna.getStringByKey("CurrencyPresentation")));
	}
	if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || measureIna.hasStringByKey("ScaleAndUnitPlacement"))
	{
		measure.setScaleAndUnitPlacement(oFF.QInAConverter.lookupScaleAndUnitPlacement(measureIna.getStringByKey("ScaleAndUnitPlacement")));
	}
	if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || measureIna.hasStringByKey("ScaleFormat"))
	{
		measure.setScaleFormat(oFF.QInAConverter.lookupScaleFormat(measureIna.getStringByKey("ScaleFormat")));
	}
	if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || measureIna.hasStringByKey("SignPresentation"))
	{
		measure.setSignPresentation(oFF.QInAConverter.lookupSignPresentation(measureIna.getStringByKey("SignPresentation")));
	}
};
oFF.QInARepoMemberAbstract.importInternalDataType = function(measureIna, measure)
{
	if (measureIna.containsKey("DataTypeScale"))
	{
		measure.setDataTypeScale(measureIna.getIntegerByKey("DataTypeScale"));
	}
	if (measureIna.containsKey("DataTypePrecision"))
	{
		measure.setDataTypePrecision(measureIna.getIntegerByKey("DataTypePrecision"));
	}
	if (measureIna.containsKey("DataTypeInternal"))
	{
		measure.setDataTypeInternal(oFF.QInAConverter.lookupValueType(measureIna.getStringByKey("DataTypeInternal")));
	}
	if (measure.getDataTypeInternal() === null && measureIna.containsKey("[Measures].[SQLType]"))
	{
		var dataTypeName = measureIna.getStringByKey("[Measures].[SQLType]");
		if (oFF.XStringUtils.isNotNullAndNotEmpty(dataTypeName))
		{
			if (oFF.XString.startsWith(dataTypeName, oFF.XStringUtils.concatenate2("DECIMAL", "(")))
			{
				measure.setDataTypeInternal(oFF.XValueType.DECIMAL_FLOAT);
				var prefixEnd = oFF.XString.size("DECIMAL") + 1;
				var delimiter = oFF.XString.indexOf(dataTypeName, ",");
				var suffixStart = oFF.XString.size(dataTypeName) - 1;
				if (delimiter > prefixEnd && delimiter < suffixStart)
				{
					var precisionString = oFF.XString.substring(dataTypeName, prefixEnd, delimiter);
					var scaleString = oFF.XString.substring(dataTypeName, delimiter + 1, suffixStart);
					measure.setDataTypePrecision(oFF.XInteger.convertFromString(precisionString));
					measure.setDataTypeScale(oFF.XInteger.convertFromString(scaleString));
				}
			}
			else if (oFF.XString.isEqual(dataTypeName, "INTEGER"))
			{
				measure.setDataTypeInternal(oFF.XValueType.INTEGER);
			}
		}
	}
};
oFF.QInARepoMemberAbstract.importExceptionAggregationProperties = function(importer, inaStructure, queryModel, member)
{
	if (queryModel.getModelCapabilities().supportsExceptionAggregationDimsFormulas())
	{
		if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || inaStructure.containsKey("ExceptionAggregationDimensions"))
		{
			var exceptionAggregationDimensions = oFF.PrUtils.asListOfString(inaStructure.getListByKey("ExceptionAggregationDimensions"));
			member._setExceptionAggregationDimensionNames(exceptionAggregationDimensions);
		}
		if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || inaStructure.hasStringByKey("ExceptionAggregation"))
		{
			var exceptionAggregation = inaStructure.getStringByKey("ExceptionAggregation");
			member.setExceptionAggregationType(oFF.AggregationType.lookupOrCreate(exceptionAggregation));
		}
	}
	else if (member.getMemberType() === oFF.MemberType.BASIC_MEASURE || member.getMemberType() === oFF.MemberType.RESTRICTED_MEASURE)
	{
		var inaAggregationDimension = inaStructure.getStringByKey("AggregationDimension");
		if (oFF.XStringUtils.isNotNullAndNotEmpty(inaAggregationDimension))
		{
			member.setAggregationDimensionName(inaAggregationDimension);
		}
	}
};
oFF.QInARepoMemberAbstract.importMeasure = function(importer, inaStructure, context, queryModel, dimension)
{
	var newMemberType;
	newMemberType = oFF.QInARepoMemberAbstract.determineMemberType(importer, inaStructure, dimension);
	if (inaStructure.containsKey("MemberType") && oFF.isNull(newMemberType))
	{
		return null;
	}
	var member;
	if (importer.getSession().hasFeature(oFF.FeatureToggleOlap.MULTIPLE_ACCOUNT_HIERARCHIES) && oFF.notNull(dimension) && dimension.getDimensionType() === oFF.DimensionType.ACCOUNT)
	{
		var originalMemberName = inaStructure.getStringByKey("Name");
		var placeholderPrefix = oFF.XStringUtils.concatenate2("].&[", oFF.QModelConstants.CALCULATION_PLACEHOLDER_ID_PREFIX);
		if (oFF.notNull(originalMemberName) && oFF.XString.startsWith(originalMemberName, "[") && oFF.XString.indexOf(originalMemberName, placeholderPrefix) !== -1)
		{
			var index = oFF.XString.indexOf(originalMemberName, oFF.QModelConstants.CALCULATION_PLACEHOLDER_ID_PREFIX);
			var endindex = oFF.XString.indexOfFrom(originalMemberName, "]", index);
			var shortName = oFF.XString.substring(originalMemberName, index, endindex);
			if (dimension.getPlaceholderIds().contains(shortName))
			{
				inaStructure.putString("Name", shortName);
			}
		}
	}
	if (newMemberType === oFF.MemberType.RESTRICTED_MEASURE)
	{
		member = importer.importRestrictedMeasure(inaStructure, dimension, context);
	}
	else if (newMemberType === oFF.MemberType.FORMULA)
	{
		member = importer.importFormulaMeasure(inaStructure, dimension, queryModel);
	}
	else if (newMemberType === oFF.MemberType.MEASURE)
	{
		member = importer.importBasicMeasure(inaStructure, dimension, context);
	}
	else if (newMemberType === oFF.MemberType.VARIANCE)
	{
		member = importer.importVarianceMeasure(inaStructure, dimension, context);
	}
	else if (newMemberType === oFF.MemberType.EXCEPTION_AGGREGATION)
	{
		member = importer.importExceptionAggregationMeasure(inaStructure, dimension, context);
	}
	else if (newMemberType === oFF.MemberType.CURRENCY_MEASURE)
	{
		member = importer.importCurrencyMeasure(inaStructure, dimension, context);
	}
	else
	{
		member = null;
	}
	return member;
};
oFF.QInARepoMemberAbstract.determineMemberType = function(importer, inaStructure, dimension)
{
	var newMemberType;
	var dimensionMemberInA = inaStructure.getStringByKey(dimension.getKeyField().getName());
	if (inaStructure.containsKey("MemberType"))
	{
		var newInAMemberType = inaStructure.getStringByKeyExt("MemberType", "Measure");
		newMemberType = oFF.QInAConverter.lookupMeasureStructureMemberType(newInAMemberType);
		if (oFF.isNull(newMemberType))
		{
			importer.addError(oFF.ErrorCodes.INVALID_STATE, oFF.XStringUtils.concatenate3("MeasureStructure->MemberType unsupported: '", newInAMemberType, "'"));
			return null;
		}
	}
	else if (dimension.getModelCapabilities().supportsCustomMeasuresInMetadata() && oFF.notNull(dimensionMemberInA))
	{
		if (dimension.getDimensionType() === oFF.DimensionType.ACCOUNT)
		{
			newMemberType = oFF.MemberType.MEASURE;
		}
		else
		{
			newMemberType = dimension.getStructureMember(dimensionMemberInA).getMemberType();
			if (newMemberType === oFF.MemberType.BASIC_MEASURE)
			{
				newMemberType = oFF.MemberType.MEASURE;
			}
		}
	}
	else
	{
		if (inaStructure.containsKey("Formula"))
		{
			newMemberType = oFF.MemberType.FORMULA;
		}
		else
		{
			var inaSelection = inaStructure.getStructureByKey("Selection");
			if (oFF.isNull(inaSelection))
			{
				newMemberType = oFF.MemberType.MEASURE;
			}
			else
			{
				newMemberType = inaSelection.containsKey("Operator") ? oFF.MemberType.RESTRICTED_MEASURE : oFF.MemberType.MEASURE;
			}
		}
	}
	return newMemberType;
};
oFF.QInARepoMemberAbstract.importGenericRuntimeMemberProperties = function(importer, member, inaMember)
{
	if (member.getQueryModel().isBasicMeasureAggregationExportedInRepo() || !member.isCreatedFromMetadata())
	{
		var modelDefinedMember = inaMember.getBooleanByKeyExt("ModelDefinedMember", false);
		var preserveAggregationType = modelDefinedMember && member.getQueryManager().getInitSettings().getProviderType() === oFF.ProviderType.LIST_REPORTING;
		if (!preserveAggregationType)
		{
			oFF.QInARepoMemberAbstract.importAggregationType(importer, member, inaMember);
		}
	}
	oFF.QInARepoMemberAbstract.importGenericMemberProperties(importer, member, inaMember);
	if (inaMember.containsKey("DataType"))
	{
		member.setDataType(oFF.QInAConverter.lookupValueType(inaMember.getStringByKey("DataType")));
	}
	if (inaMember.getByKey("isModelDefinedMember") !== null)
	{
		member.setModelDefinedMember(inaMember.getBooleanByKey("isModelDefinedMember"));
	}
	oFF.QInARepoMemberAbstract.importIgnoredExternalDimensions(importer, member, inaMember);
	if ((member.getQueryModel().isBasicMeasureSettingsExportedInRepo() || !member.isCreatedFromMetadata() || importer.mode === oFF.QModelFormat.INA_REPOSITORY_DELTA) && inaMember.containsKey("SolveOrder"))
	{
		member.setSolveOrder(inaMember.getIntegerByKeyExt("SolveOrder", 0));
	}
	if (inaMember.containsKey("PreferredHierarchy"))
	{
		member.setPreferredHierarchy(inaMember.getStringByKey("PreferredHierarchy"));
	}
	oFF.QInARepoMemberAbstract.importAccountMemberProperties(inaMember, member);
};
oFF.QInARepoMemberAbstract.importAccountMemberProperties = function(inaMember, member)
{
	if (inaMember.getStringByKey("AliasName") !== null)
	{
		member.setAliasName(inaMember.getStringByKey("AliasName"));
	}
	if (inaMember.containsKey("AutoSignFlip"))
	{
		member.setAutoSignFlip(inaMember.getBooleanByKey("AutoSignFlip"));
	}
	if (inaMember.getStringByKey("AccountType") !== null)
	{
		member.setAccountType(oFF.AccountType.lookup(inaMember.getStringByKey("AccountType")));
	}
};
oFF.QInARepoMemberAbstract.importGenericMemberProperties = function(importer, member, inaMember)
{
	if (member.getQueryModel().isBasicMeasureSettingsExportedInRepo() || !member.isCreatedFromMetadata() || importer.mode === oFF.QModelFormat.INA_REPOSITORY_DELTA)
	{
		if (inaMember.containsKey("NumericShift"))
		{
			member.setNumericShift(inaMember.getIntegerByKey("NumericShift"));
		}
		if (inaMember.containsKey("NumericScale"))
		{
			member.setNumericScale(inaMember.getIntegerByKey("NumericScale"));
		}
		if (inaMember.containsKey("NumericPrecision"))
		{
			member.setNumericPrecision(inaMember.getIntegerByKey("NumericPrecision"));
		}
	}
	if (member.getModelCapabilities().supportsMemberVisibility() && (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || inaMember.hasStringByKey("Visibility")))
	{
		var inaVisibility = inaMember.getStringByKeyExt("Visibility", "Visible");
		member.setResultVisibility(oFF.QInAConverter.lookupResultSetVisibility(inaVisibility));
	}
	if (inaMember.hasStringByKey("PostAggregation") || importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA)
	{
		var inaPostAggregation = inaMember.getStringByKey("PostAggregation");
		var postAggregationType = oFF.QInAConverter.lookupAggregationType(inaPostAggregation);
		member.setPostAggregationType(postAggregationType);
	}
	if (inaMember.containsKey("PostAggregationIgnoreHierarchy"))
	{
		member.setPostAggregationIgnoreHierarchy(inaMember.getBooleanByKey("PostAggregationIgnoreHierarchy"));
	}
	if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || inaMember.containsKey("PostAggregationDimensions"))
	{
		var postAggregationDimensionsInA = oFF.PrUtils.asListOfString(inaMember.getListByKey("PostAggregationDimensions"));
		member._setPostAggregationDimensions(postAggregationDimensionsInA);
	}
	oFF.QInARepoMemberAbstract.importWindowFunction(member, inaMember);
	if (inaMember.containsKey("CurrencyTranslationName"))
	{
		member.setCurrencyTranslationName(inaMember.getStringByKey("CurrencyTranslationName"));
	}
};
oFF.QInARepoMemberAbstract.importWindowFunction = function(member, inaMember)
{
	var inaWindowFunction = inaMember.getStructureByKey("WindowFunction");
	if (oFF.notNull(inaWindowFunction))
	{
		var windowfunction = oFF.QWindowFunction._createWindowFunction(oFF.QInAConverter.lookupWindowFunctionType(inaWindowFunction.getStringByKey("Name")));
		var inaDimensionsNotInPartitionList = inaWindowFunction.getListByKey("DimensionsNotInPartition");
		if (oFF.notNull(inaDimensionsNotInPartitionList))
		{
			for (var idxNIPDimension = 0; idxNIPDimension < inaDimensionsNotInPartitionList.size(); idxNIPDimension++)
			{
				windowfunction.addNotInPartitionDimension(inaDimensionsNotInPartitionList.getStringAt(idxNIPDimension));
			}
		}
		var inaSortDimensionsList = inaWindowFunction.getListByKey("SortDimensions");
		if (oFF.notNull(inaSortDimensionsList))
		{
			for (var idxSortDimension = 0; idxSortDimension < inaSortDimensionsList.size(); idxSortDimension++)
			{
				var inaSortedDimension = inaSortDimensionsList.getStructureAt(idxSortDimension);
				var name = inaSortedDimension.getStringByKey("Name");
				var directionType = oFF.QInAConverter.lookupSortDirection2(inaSortedDimension.getStringByKey("Direction"));
				var nullsType = oFF.QInAConverter.lookupNullsType(inaSortedDimension.getStringByKey("Nulls"));
				windowfunction.addSortDimension(name, directionType, nullsType);
			}
		}
		var inaFrame = inaWindowFunction.getStructureByKey("Frame");
		if (oFF.notNull(inaFrame))
		{
			windowfunction.setFrame(oFF.QInAConverter.lookupFrameStartType(inaFrame.getStringByKey("Start")), inaFrame.getIntegerByKey("StartPreceding"), oFF.QInAConverter.lookupFrameEndType(inaFrame.getStringByKey("End")), inaFrame.getIntegerByKey("EndFollowing"));
		}
		member.setWindowFunction(windowfunction);
	}
};
oFF.QInARepoMemberAbstract.importCurrencyPlanningProperties = function(member, inaStructure)
{
	if (inaStructure.hasStringByKey("RateType"))
	{
		member.setRateType(oFF.QInAConverter.lookupRateType(inaStructure.getStringByKey("RateType")));
	}
	if (inaStructure.hasStringByKey("UnitDimension"))
	{
		member.setUnitDimensionName(inaStructure.getStringByKey("UnitDimension"));
	}
	if (inaStructure.hasStringByKey("UnitDimensionProperty"))
	{
		member.setUnitDimensionProperty(inaStructure.getStringByKey("UnitDimensionProperty"));
	}
};
oFF.QInARepoMemberAbstract.importIgnoredExternalDimensions = function(importer, member, inaMember)
{
	if (importer.capabilities.supportsIgnoreExternalDimensions())
	{
		if (inaMember.hasStringByKey("IgnoreExternalDimensions"))
		{
			var ignoreExternalDimensions = inaMember.getStringByKey("IgnoreExternalDimensions");
			if (oFF.XString.isEqual(ignoreExternalDimensions, "All"))
			{
				member.setIgnoreAllExternalDimensions(true);
			}
		}
		else if (inaMember.containsKey("IgnoreExternalDimensions"))
		{
			var inaIgnoreExternalDimensions = inaMember.getListByKey("IgnoreExternalDimensions");
			member._setExternalDimensionsToIgnore(oFF.PrUtils.asListOfString(inaIgnoreExternalDimensions));
		}
	}
	var overrideText = inaMember.getStringByKey("OverrideText");
	if (oFF.XStringUtils.isNotNullAndNotEmpty(overrideText))
	{
		member.setOverrideText(overrideText);
	}
};
oFF.QInARepoMemberAbstract.importAggregationType = function(importer, member, inaMember)
{
	var inaAggregation = inaMember.getStringByKey("Aggregation");
	var originalAggregationType = member.getAggregationType();
	var delta = importer.mode === oFF.QModelFormat.INA_REPOSITORY_DELTA || inaMember.getBooleanByKeyExt("ModelDefinedMember", false) && member.getDimension() !== null && member.getDimension().getDimensionType() !== oFF.DimensionType.ACCOUNT;
	if (oFF.XStringUtils.isNotNullAndNotEmpty(inaAggregation))
	{
		var aggregationType = oFF.QInAConverter.lookupAggregationType(inaAggregation);
		if (delta)
		{
			if (oFF.notNull(aggregationType) && oFF.AggregationType.lookupStatisticalAggregation(aggregationType.getName()) !== null && !member.getModelCapabilities().supportsStatisticalAggregations())
			{
				aggregationType = null;
			}
			if (oFF.isNull(aggregationType))
			{
				aggregationType = oFF.AggregationType.SUM;
			}
		}
		member.setAggregationType(aggregationType);
	}
	else if (delta)
	{
		member.setAggregationType(originalAggregationType);
	}
	else
	{
		member.setAggregationType(null);
	}
};
oFF.QInARepoMemberAbstract.importGenericMemberAbstractProperties = function(importer, member, inaMember)
{
	if (inaMember.containsKey("ModelDefinedMember"))
	{
		member.setModelDefinedMember(inaMember.getBooleanByKey("ModelDefinedMember"));
	}
	if (inaMember.containsKey("MinimumDrillState"))
	{
		var inaMinimumDrillStateIter = inaMember.getListByKey("MinimumDrillState").getIterator();
		while (inaMinimumDrillStateIter.hasNext())
		{
			member.addMinimumDrillState(inaMinimumDrillStateIter.next().asString().getString());
		}
	}
};
oFF.QInARepoMemberAbstract.exportCustomMember = function(exporter, modelComponent)
{
	var componentType = modelComponent.getComponentType();
	var inaStructure = null;
	if (componentType === oFF.MemberType.FORMULA || componentType === oFF.MemberType.VARIANCE)
	{
		inaStructure = oFF.PrFactory.createStructure();
		exporter.exportFormulaMeasure(modelComponent, inaStructure);
	}
	else if (componentType === oFF.MemberType.RESTRICTED_MEASURE)
	{
		inaStructure = oFF.PrFactory.createStructure();
		exporter.exportRestrictedMeasure(modelComponent, inaStructure);
	}
	else if (componentType === oFF.MemberType.EXCEPTION_AGGREGATION)
	{
		inaStructure = oFF.PrFactory.createStructure();
		exporter.exportExceptionAggregationMeasure(modelComponent, inaStructure);
	}
	else if (componentType === oFF.MemberType.CURRENCY_MEASURE)
	{
		inaStructure = oFF.PrFactory.createStructure();
		exporter.exportCurrencyMeasure(modelComponent, inaStructure);
	}
	return inaStructure;
};
oFF.QInARepoMemberAbstract.exportFormulaItem = function(exporter, formulaItem, inaFormula, context)
{
	var shouldContinueExporting = exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || oFF.notNull(formulaItem) && formulaItem.getModCounter() > 0;
	if (shouldContinueExporting)
	{
		oFF.QInARepoMemberAbstract.exportFormulaItemSignFlip(exporter, formulaItem, inaFormula, context, false, false);
	}
};
oFF.QInARepoMemberAbstract.exportFormulaItemSignFlip = function(exporter, formulaItem, inaFormula, context, autoSignFlip, autoSignFlipForRMOnly)
{
	if (oFF.notNull(formulaItem))
	{
		var componentType = formulaItem.getComponentType();
		if (componentType === oFF.OlapComponentType.FORMULA_CONSTANT)
		{
			var fic = formulaItem;
			var constStructure = inaFormula.putNewStructure("Constant");
			var ficUnit = fic.getUnit();
			if (oFF.XStringUtils.isNotNullAndNotEmpty(ficUnit))
			{
				constStructure.putString("Unit", ficUnit);
			}
			var ficCurrency = fic.getCurrency();
			if (oFF.XStringUtils.isNotNullAndNotEmpty(ficCurrency))
			{
				constStructure.putString("Currency", ficCurrency);
			}
			oFF.QInARepoMemberAbstract.exportFormulaConstantValue(exporter, constStructure, fic);
		}
		else if (componentType === oFF.OlapComponentType.FORMULA_OPERATION)
		{
			var fio = formulaItem;
			var opStructure = inaFormula.putNewStructure("Function");
			opStructure.putString("Name", fio.getOperator().getDisplayString());
			var parameters = opStructure.putNewList("Parameters");
			oFF.QInARepoMemberAbstract.exportFormulaItemSignFlip(exporter, fio.getLeftSide(), parameters.addNewStructure(), context, autoSignFlip, autoSignFlipForRMOnly);
			oFF.QInARepoMemberAbstract.exportFormulaItemSignFlip(exporter, fio.getRightSide(), parameters.addNewStructure(), context, autoSignFlip, autoSignFlipForRMOnly);
		}
		else if (componentType === oFF.OlapComponentType.FORMULA_FUNCTION)
		{
			var fif = formulaItem;
			var funcStructure = inaFormula.putNewStructure("Function");
			funcStructure.putString("Name", fif.getFunctionName());
			var funcParameters = funcStructure.putNewList("Parameters");
			var functionSize = fif.size();
			for (var i = 0; i < functionSize; i++)
			{
				oFF.QInARepoMemberAbstract.exportFormulaItemSignFlip(exporter, fif.get(i), funcParameters.addNewStructure(), context, autoSignFlip, autoSignFlipForRMOnly);
			}
			var solveOrder = fif.getSolveOrder();
			if (solveOrder !== 0)
			{
				inaFormula.putInteger("SolveOrder", solveOrder);
			}
		}
		else if (componentType === oFF.OlapComponentType.FORMULA_ITEM_MEMBER)
		{
			var fim = formulaItem;
			var queryModel = context.getQueryModel();
			var memberVariable = fim.getVariable();
			var memberStructure;
			if (oFF.isNull(memberVariable))
			{
				memberStructure = oFF.PrFactory.createStructure();
				var memberName;
				memberName = oFF.QInAExportUtil.getMeasureMemberNameByAlias(queryModel, fim.getMemberName(), exporter);
				memberStructure.putStringNotNull("Name", memberName);
				memberStructure.putStringNotNull("Dimension", fim.getDimensionName());
				if (fim.isBooked())
				{
					memberStructure.putString("NameIs", "Booked");
				}
				else if (fim.isPrevious())
				{
					memberStructure.putString("NameIs", "Previous");
				}
				if (autoSignFlip)
				{
					var functionStructure = oFF.QInARepoMemberAbstract.exportMemberWithSignFlip(exporter, fim);
					if (oFF.notNull(functionStructure))
					{
						inaFormula.put("Function", functionStructure.getByKey("Function"));
					}
					else
					{
						inaFormula.put("Member", memberStructure);
					}
				}
				else
				{
					inaFormula.put("Member", memberStructure);
				}
			}
			else
			{
				memberStructure = inaFormula.putNewStructure("Member");
				memberStructure.putString("Name", memberVariable.getName());
				memberStructure.putString("NameIs", "Variable");
			}
			oFF.QInARepoMemberAbstract.exportDimensionContext(fim, memberStructure);
		}
		else if (componentType === oFF.OlapComponentType.FORMULA_ITEM_ATTRIBUTE)
		{
			var fia = formulaItem;
			var inaAttributeValue = inaFormula.putNewStructure("AttributeValue");
			inaAttributeValue.putString("Name", fia.getFieldName());
			oFF.QInARepoMemberAbstract.exportDimensionContext(fia, inaAttributeValue);
		}
	}
};
oFF.QInARepoMemberAbstract.exportDimensionContext = function(formulaItem, inaFormulaItem)
{
	var dimensionContext;
	dimensionContext = formulaItem.getDimensionContext();
	if (oFF.notNull(dimensionContext))
	{
		var inaDimensionContext = inaFormulaItem.putNewStructure("DimensionContext");
		inaDimensionContext.putString("DatasetId", dimensionContext.getQueryModel().getDatasetId());
		inaDimensionContext.putString("DimensionName", dimensionContext.getName());
	}
};
oFF.QInARepoMemberAbstract.exportMemberWithSignFlip = function(exporter, formulaItemMember)
{
	return null;
};
oFF.QInARepoMemberAbstract.exportFormulaConstantValue = function(exporter, constStructure, fic)
{
	var valueIsNull = fic.getValue() === null && !oFF.XCollectionUtils.hasElements(fic.getStringValues());
	var variable = fic.getVariable();
	if (valueIsNull && oFF.isNull(variable))
	{
		constStructure.putNull("Value");
	}
	var valueType = fic.getValueType();
	if (valueType === oFF.XValueType.INTEGER)
	{
		constStructure.putString("ValueType", "Number");
		if (!valueIsNull)
		{
			constStructure.putInteger("Value", fic.getInteger());
		}
	}
	else if (valueType === oFF.XValueType.DOUBLE || valueType === oFF.XValueType.DECIMAL_FLOAT)
	{
		constStructure.putString("ValueType", "Number");
		if (!valueIsNull)
		{
			constStructure.putDouble("Value", fic.getDouble());
		}
	}
	else if (valueType === oFF.XValueType.LONG)
	{
		constStructure.putString("ValueType", "Number");
		if (!valueIsNull)
		{
			constStructure.putLong("Value", fic.getLong());
		}
	}
	else if (valueType === oFF.XValueType.STRING)
	{
		constStructure.putString("ValueType", "String");
		constStructure.putString("Value", fic.getString());
	}
	else if (valueType === oFF.XValueType.BOOLEAN)
	{
		constStructure.putString("ValueType", "Bool");
		if (!valueIsNull)
		{
			constStructure.putBoolean("Value", fic.getBoolean());
		}
	}
	else if (valueType === oFF.XValueType.DATE)
	{
		constStructure.putString("ValueType", "Date");
		if (!valueIsNull)
		{
			constStructure.putString("Value", fic.getDate().toString());
		}
	}
	else if (valueType === oFF.XValueType.DATE_TIME)
	{
		constStructure.putString("ValueType", "DateTime");
		if (!valueIsNull)
		{
			constStructure.putString("Value", fic.getDateTime().toString());
		}
	}
	else if (valueType.isSpatial())
	{
		constStructure.putString("ValueType", "String");
		if (!valueIsNull)
		{
			constStructure.putString("Value", fic.getGeometry().toWKT());
		}
	}
	else if (valueType === oFF.XValueType.TIMESPAN)
	{
		constStructure.putString("ValueType", "String");
		if (!valueIsNull)
		{
			var timeSpanValue = fic.getTimeSpan();
			constStructure.putString("Value", timeSpanValue.toString());
		}
	}
	else if (valueType === oFF.XValueType.VARIABLE)
	{
		oFF.QInAExportUtil.setNameIfNotNull(constStructure, "Value", variable);
		constStructure.putString("ValueIs", "Variable");
	}
	else if (valueType === oFF.XValueType.STRING_ARRAY)
	{
		constStructure.putString("ValueType", "StringArray");
		if (!valueIsNull)
		{
			var stringValues = fic.getStringValues();
			var values = constStructure.putNewList("Value");
			for (var i = 0; i < stringValues.size(); i++)
			{
				values.addString(stringValues.get(i).getString());
			}
		}
	}
};
oFF.QInARepoMemberAbstract.signFlipMember = function(formulaItemMember)
{
	var context = formulaItemMember.getContext();
	var op = oFF.QFactory.createFormulaOperation(context);
	op.setOperator(oFF.MathOperator.MULT);
	op.setLeftSide(oFF.QFactory.createFormulaConstantWithIntValue(context, -1));
	op.setRightSide(formulaItemMember);
	return op;
};
oFF.QInARepoMemberAbstract.getMemberForSignFlip = function(restrictedMeasure)
{
	var dim = restrictedMeasure.getDimension();
	var filter = restrictedMeasure.getFilter();
	var memberName = dim.getName();
	if (oFF.notNull(memberName))
	{
		if (filter.isAll())
		{
			memberName = oFF.QInARepoMemberAbstract.getFirstMemberForSignFlip(memberName, filter.getFilterRootElement());
		}
		var member = dim.getStructureMemberByAliasOrMember(memberName);
		if (oFF.notNull(member) && member.getComponentType() === oFF.MemberType.RESTRICTED_MEASURE && member !== restrictedMeasure)
		{
			return oFF.QInARepoMemberAbstract.getMemberForSignFlip(member);
		}
	}
	return memberName;
};
oFF.QInARepoMemberAbstract.getFirstMemberForSignFlip = function(accountName, complexSelectionRoot)
{
	var iterator = complexSelectionRoot.getChildren();
	while (iterator.hasNext())
	{
		var filterElement = iterator.next();
		if (filterElement.getOlapComponentType() === oFF.FilterComponentType.OPERATION)
		{
			var filterOperation = filterElement;
			if (oFF.XString.isEqual(accountName, filterOperation.getDimensionName()))
			{
				return filterOperation.getLow().getValue().toString();
			}
		}
		var memberName = oFF.QInARepoMemberAbstract.getFirstMemberForSignFlip(accountName, filterElement);
		if (oFF.notNull(memberName))
		{
			return memberName;
		}
	}
	return null;
};
oFF.QInARepoMemberAbstract.exportPostAggregation = function(exporter, member, inaMember)
{
	if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || member.hasPropertyChanged(oFF.QStructureMemberProperties.QY_POST_AGGERGATION_TYPE))
	{
		var postAggregationType = member.getPostAggregationType();
		if (oFF.notNull(postAggregationType))
		{
			inaMember.putString("PostAggregation", oFF.QInAConverter.lookupAggregationTypeInA(postAggregationType));
		}
	}
	if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || member.hasPropertyChanged(oFF.QStructureMemberProperties.QY_POST_AGGREGATION_IGNORE_HIERARCHY))
	{
		if (member.isPostAggregationIgnoringHierarchy() || exporter.mode === oFF.QModelFormat.INA_REPOSITORY_DELTA)
		{
			inaMember.putBoolean("PostAggregationIgnoreHierarchy", member.isPostAggregationIgnoringHierarchy());
		}
	}
	if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || member.hasPropertyChanged(oFF.QStructureMemberProperties.QY_POST_AGGREGATION_DIMENSIONS))
	{
		var postAggregationDimensions = member.getPostAggregationDimensions();
		if (postAggregationDimensions.hasElements())
		{
			var inaPostAggregationDimensions = inaMember.putNewList("PostAggregationDimensions");
			var iterator = postAggregationDimensions.getIterator();
			while (iterator.hasNext())
			{
				inaPostAggregationDimensions.add(oFF.PrFactory.createString(iterator.next()));
			}
		}
	}
};
oFF.QInARepoMemberAbstract.exportWindowFunction = function(member, inaMember)
{
	var windowFunction = member.getWindowFunction();
	if (oFF.notNull(windowFunction))
	{
		var inaWindowFunction = inaMember.putNewStructure("WindowFunction");
		inaWindowFunction.putString("Name", oFF.QInAConverter.lookupWindowFunctionTypeInA(windowFunction.getType()));
		var dimensionsNotInPartition = windowFunction.getNotInPartitionDimensions();
		var inaDimensionsNotInPartitionList = inaWindowFunction.putNewList("DimensionsNotInPartition");
		inaDimensionsNotInPartitionList.addAllStrings(dimensionsNotInPartition);
		var inaSortDimensionsList = inaWindowFunction.putNewList("SortDimensions");
		var sortedIter = windowFunction.getSortDimensions().getIterator();
		while (sortedIter.hasNext())
		{
			var sortDimension = sortedIter.next();
			var dimension = inaSortDimensionsList.addNewStructure();
			dimension.putString("Name", sortDimension.getName());
			var directionType = sortDimension.getDirection();
			if (directionType === oFF.XSortDirection.ASCENDING || directionType === oFF.XSortDirection.DESCENDING)
			{
				dimension.putString("Direction", oFF.QInAConverter.lookupSortDirectionInA2(directionType));
			}
			var nullsType = sortDimension.getNulls();
			if (oFF.notNull(nullsType) && nullsType !== oFF.NullsType.NONE)
			{
				dimension.putString("Nulls", oFF.QInAConverter.lookupNullsTypeInA(nullsType));
			}
		}
		var frame = windowFunction.getFrame();
		if (oFF.notNull(frame))
		{
			var inaFrame = inaWindowFunction.putNewStructure("Frame");
			inaFrame.putString("Start", oFF.QInAConverter.lookupFrameStartTypeInA(frame.getStart()));
			inaFrame.putInteger("StartPreceding", frame.getStartPreceding());
			inaFrame.putString("End", oFF.QInAConverter.lookupFrameEndTypeInA(frame.getEnd()));
			inaFrame.putInteger("EndFollowing", frame.getEndFollowing());
		}
	}
};
oFF.QInARepoMemberAbstract.exportCurrencyMetadataFusion = function(exporter, member, inaMember)
{
	if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || member.hasPropertyChanged(oFF.QStructureMemberProperties.QY_RATE_TYPE))
	{
		inaMember.putStringNotNullAndNotEmpty("RateType", oFF.QInAConverter.lookupRateTypeInA(member.getRateType()));
	}
	inaMember.putStringNotNullAndNotEmpty("UnitDimension", member.getUnitDimensionName());
	inaMember.putStringNotNullAndNotEmpty("UnitDimensionProperty", member.getUnitDimensionProperty());
};
oFF.QInARepoMemberAbstract.exportFormattingProperties = function(exporter, member, inaMember)
{
	if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || member.hasPropertyChanged(oFF.QStructureMemberProperties.QY_CURRENCY_PRESENTATION))
	{
		inaMember.putStringNotNullAndNotEmpty("CurrencyPresentation", oFF.QInAConverter.lookupCurrencyPresentationInA(member.getCurrencyPresentation()));
	}
	if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || member.hasPropertyChanged(oFF.QStructureMemberProperties.QY_SCALE_AND_UNIT_PLACEMENT))
	{
		inaMember.putStringNotNullAndNotEmpty("ScaleAndUnitPlacement", oFF.QInAConverter.lookupScaleAndUnitPlacementInA(member.getScaleAndUnitPlacement()));
	}
	if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || member.hasPropertyChanged(oFF.QStructureMemberProperties.QY_SCALE_FORMAT))
	{
		inaMember.putStringNotNullAndNotEmpty("ScaleFormat", oFF.QInAConverter.lookupScaleFormatInA(member.getScaleFormat()));
	}
	if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || member.hasPropertyChanged(oFF.QStructureMemberProperties.QY_SIGN_PRESENTATION))
	{
		inaMember.putStringNotNullAndNotEmpty("SignPresentation", oFF.QInAConverter.lookupSignPresentationInA(member.getSignPresentation()));
	}
};
oFF.QInARepoMemberAbstract.exportInternalDataType = function(exporter, member, inaMember)
{
	if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || member.hasPropertyChanged(oFF.QStructureMemberProperties.QY_DATA_TYPE_INTERNAL))
	{
		inaMember.putStringNotNullAndNotEmpty("DataTypeInternal", oFF.QInAConverter.lookupValueTypeInA(member.getDataTypeInternal()));
	}
	if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || member.hasPropertyChanged(oFF.QStructureMemberProperties.QY_DATA_TYPE_SCALE))
	{
		var dataTypeScale = member.getDataTypeScale();
		if (oFF.notNull(dataTypeScale))
		{
			inaMember.putInteger("DataTypeScale", dataTypeScale.getInteger());
		}
	}
	if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || member.hasPropertyChanged(oFF.QStructureMemberProperties.QY_DATA_TYPE_PRECISION))
	{
		var dataTypePrecision = member.getDataTypePrecision();
		if (oFF.notNull(dataTypePrecision))
		{
			inaMember.putInteger("DataTypePrecision", dataTypePrecision.getInteger());
		}
	}
};
oFF.QInARepoMemberAbstract.exportChartFormatting = function(exporter, member, inaMember)
{
	if (member.isShowCellChart())
	{
		inaMember.putBoolean("ShowCellChart", true);
	}
	if (member.isHideNumberForCellChart())
	{
		inaMember.putBoolean("HideNumberForCellChart", true);
	}
	inaMember.putStringNotNullAndNotEmpty("CellChartBarColor", member.getCellChartBarColor());
	inaMember.putStringNotNullAndNotEmpty("CellChartLineColor", member.getCellChartLineColor());
	inaMember.putStringNotNullAndNotEmpty("CellChartOrientation", oFF.QInAConverter.lookupCellChartOrientationInA(member.getCellChartOrientation()));
	inaMember.putStringNotNullAndNotEmpty("CellChartType", oFF.QInAConverter.lookupCellChartTypeInA(member.getCellChartType()));
};
oFF.QInARepoMemberAbstract.prototype.getComponentType = function()
{
	return oFF.MemberType.ABSTRACT_MEMBER;
};
oFF.QInARepoMemberAbstract.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var queryModel = context.getQueryModel();
	var dimension = parentComponent;
	if (oFF.isNull(dimension))
	{
		dimension = queryModel.getMeasureDimension();
	}
	var member = oFF.QInARepoMemberAbstract.importMeasure(importer, inaStructure, context, queryModel, dimension);
	if (oFF.notNull(member))
	{
		oFF.QInARepoMemberAbstract.importGenericRuntimeMemberProperties(importer, member, inaStructure);
		if (inaStructure.containsKey("PresentationSignReversal"))
		{
			member.setPresentationSignReversal(inaStructure.getBooleanByKey("PresentationSignReversal"));
		}
		var inaAggregationType = inaStructure.getIntegerByKeyExt("[Measures].[Aggregation]", -1);
		var aggregationType = oFF.QInAConverter.lookupAggregationType2(inaAggregationType);
		if (oFF.notNull(aggregationType))
		{
			member.setAggregationType(aggregationType);
		}
		if ((queryModel.isBasicMeasureSettingsExportedInRepo() || !member.isCreatedFromMetadata() || importer.mode === oFF.QModelFormat.INA_REPOSITORY_DELTA) && !oFF.XCollectionUtils.hasElements(inaStructure.getStructureByKey("[Measures].[MemberDetails]")))
		{
			this.setPrecisionAndScale(importer, inaStructure, queryModel, member);
			if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || inaStructure.hasStringByKey("UnitType"))
			{
				member.setUnitType(oFF.QInAConverter.lookupUnitType(inaStructure.getStringByKey("UnitType")));
			}
			member.setUnitFixed(inaStructure.getStringByKey("UnitFixed"));
			member.setUnitName(inaStructure.getStringByKey("UnitName"));
			member.setUnitTextName(inaStructure.getStringByKey("UnitTextName"));
		}
		importer.importExceptions(inaStructure, member);
		oFF.QInARepoMemberAbstract.importExceptionAggregationProperties(importer, inaStructure, dimension.getQueryModel(), member);
		oFF.QInARepoMemberAbstract.importCurrencyPlanningProperties(member, inaStructure);
		oFF.QInARepoMemberAbstract.importInternalDataType(inaStructure, member);
		oFF.QInARepoMemberAbstract.importFormattingProperties(importer, inaStructure, member);
		if (dimension.getDimensionType() === oFF.DimensionType.ACCOUNT && inaStructure.containsKey("HierarchyDisplayKey"))
		{
			var hierarchyDisplayKeyField = dimension.getHierarchyDisplayKeyField();
			if (oFF.notNull(hierarchyDisplayKeyField))
			{
				member.createAndAddFieldValueWithString(hierarchyDisplayKeyField, inaStructure.getStringByKey("HierarchyDisplayKey"));
			}
		}
		oFF.QInARepoMemberAbstract.importChartFormatting(inaStructure, member);
	}
	return member;
};
oFF.QInARepoMemberAbstract.prototype.setPrecisionAndScale = function(importer, inaStructure, queryModel, member)
{
	var numericPrecision = -1;
	var numericScale = -1;
	if (importer.isAbap(queryModel))
	{
		numericPrecision = inaStructure.getIntegerByKeyExt("Digits", -1);
		numericScale = inaStructure.getIntegerByKeyExt("FractDigits", -1);
	}
	else
	{
		numericPrecision = inaStructure.getIntegerByKeyExt("[Measures].[Digits]", -1);
		numericScale = inaStructure.getIntegerByKeyExt("[Measures].[FractDigits]", -1);
	}
	if (numericPrecision !== -1)
	{
		member.setNumericPrecision(numericPrecision);
	}
	if (numericScale !== -1)
	{
		member.setNumericScale(numericScale);
	}
};
oFF.QInARepoMemberAbstract.prototype.exportGenericMemberProperties = function(exporter, member, inaMember)
{
	if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || member.hasPropertyChanged(oFF.QDimensionMemberProperties.QY_VISIBILITY))
	{
		var resultVisibility = member.getResultVisibility();
		if (oFF.isNull(resultVisibility))
		{
			resultVisibility = oFF.ResultVisibility.VISIBLE;
		}
		inaMember.putString("Visibility", oFF.QInAConverter.lookupResultSetVisibilityInA(resultVisibility));
	}
	inaMember.putStringNotNullAndNotEmpty("CurrencyTranslationName", member.getCurrencyTranslationName());
	oFF.QInARepoMemberAbstract.exportCurrencyMetadataFusion(exporter, member, inaMember);
	oFF.QInARepoMemberAbstract.exportInternalDataType(exporter, member, inaMember);
	oFF.QInARepoMemberAbstract.exportFormattingProperties(exporter, member, inaMember);
	var memberType = member.getMemberType();
	if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || member.hasPropertyChanged(oFF.QStructureMemberProperties.QY_SOLVE_ORDER))
	{
		if ((memberType === oFF.MemberType.BASIC_MEASURE || member.isSolveOrderOverDefined()) && (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || member.hasPropertyChanged(oFF.QStructureMemberProperties.QY_SOLVE_ORDER)))
		{
			inaMember.putInteger("SolveOrder", member.getSolveOrder());
		}
	}
	oFF.QInARepoMemberAbstract.exportChartFormatting(exporter, member, inaMember);
	if (member.isModelDefinedMember())
	{
		inaMember.putBoolean("isModelDefinedMember", true);
	}
	inaMember.putStringNotNullAndNotEmpty("PreferredHierarchy", member.getPreferredHierarchy());
	inaMember.putString("MemberType", oFF.QInAConverter.lookupMeasureStructureMemberTypeIna(memberType));
	if (memberType !== oFF.MemberType.EXCEPTION_AGGREGATION)
	{
		if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || member.hasPropertyChanged(oFF.QStructureMemberProperties.QY_NUMERIC_SHIFT))
		{
			oFF.QInARepoUtils.setIntegerIfNotNull(inaMember, "NumericShift", member.getNumericShift());
		}
		if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || member.hasPropertyChanged(oFF.QStructureMemberProperties.QY_NUMERIC_SCALE))
		{
			oFF.QInARepoUtils.setIntegerIfNotNull(inaMember, "NumericScale", member.getNumericScale());
		}
		if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || member.hasPropertyChanged(oFF.QStructureMemberProperties.QY_NUMERIC_PRECISION))
		{
			oFF.QInARepoUtils.setIntegerIfNotNull(inaMember, "NumericPrecision", member.getNumericPrecision());
		}
		oFF.QInARepoMemberAbstract.exportPostAggregation(exporter, member, inaMember);
	}
	if (memberType !== oFF.MemberType.EXCEPTION_AGGREGATION && memberType !== oFF.MemberType.CURRENCY_MEASURE)
	{
		exporter.exportExceptions(member, inaMember);
	}
	if (memberType !== oFF.MemberType.VARIANCE && memberType !== oFF.MemberType.CURRENCY_MEASURE)
	{
		var exceptionAggregationType = member.getExceptionAggregationType();
		if (oFF.notNull(exceptionAggregationType))
		{
			if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || member.hasPropertyChanged(oFF.QStructureMemberProperties.QY_EXCEPTION_AGGERGATION_TYPE))
			{
				inaMember.putString("ExceptionAggregation", exceptionAggregationType.getName());
			}
			var inaExceptionAggregationDimensions = inaMember.putNewList("ExceptionAggregationDimensions");
			inaExceptionAggregationDimensions.addAllStrings(member.getExceptionAggregationDimensions());
		}
	}
	if (memberType !== oFF.MemberType.BASIC_MEASURE && memberType !== oFF.MemberType.EXCEPTION_AGGREGATION)
	{
		oFF.QInARepoMemberAbstract.exportWindowFunction(member, inaMember);
	}
	if (memberType === oFF.MemberType.RESTRICTED_MEASURE || memberType === oFF.MemberType.FORMULA || memberType === oFF.MemberType.EXCEPTION_AGGREGATION || memberType === oFF.MemberType.VARIANCE)
	{
		this.exportProperties(member, inaMember);
	}
	var overrideText = member.getOverrideText();
	if (oFF.XStringUtils.isNotNullAndNotEmpty(overrideText))
	{
		inaMember.putString("OverrideText", overrideText);
	}
	if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || member.hasPropertyChanged(oFF.QStructureMemberProperties.QY_IGNORE_EXTERNAL_DIMENSIONS))
	{
		if (member.isIgnoringAllExternalDimensions())
		{
			inaMember.putString("IgnoreExternalDimensions", "All");
		}
		else
		{
			var ignoredExternalDimensions = oFF.XListOfString.create();
			ignoredExternalDimensions.addAll(member.getIgnoredExternalDimensions());
			if (ignoredExternalDimensions.hasElements())
			{
				var inaIgnoredExternalDimensions = inaMember.putNewList("IgnoreExternalDimensions");
				inaIgnoredExternalDimensions.addAllStrings(ignoredExternalDimensions);
			}
		}
	}
};
oFF.QInARepoMemberAbstract.prototype.exportProperties = function(structureMember, inaMember)
{
	if (structureMember.getAliasName() !== null)
	{
		inaMember.putString("AliasName", structureMember.getAliasName());
	}
	if (structureMember.isAutoSignFlip())
	{
		inaMember.putBoolean("AutoSignFlip", structureMember.isAutoSignFlip());
	}
	if (structureMember.getAccountType() !== null)
	{
		inaMember.putString("AccountType", structureMember.getAccountType().getName());
	}
};

oFF.QInARepoMembersAll = function() {};
oFF.QInARepoMembersAll.prototype = new oFF.QInARepository();
oFF.QInARepoMembersAll.prototype._ff_c = "QInARepoMembersAll";

oFF.QInARepoMembersAll.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.MEMBERS;
};
oFF.QInARepoMembersAll.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var isDelta = inaStructure.getBooleanByKeyExt("IsDelta", false);
	var dimension = modelComponent;
	if (dimension.supportsCustomMembers() && !isDelta)
	{
		dimension.removeCustomMembers();
	}
	var inaMemberList = inaStructure.getListByKey("MembersRepo");
	if (oFF.isNull(inaMemberList))
	{
		return null;
	}
	var structureLayout = dimension.getStructureLayout();
	if (oFF.notNull(structureLayout))
	{
		if (!isDelta && importer.getMode() !== oFF.QModelFormat.INA_REPOSITORY_DELTA)
		{
			dimension.removeCustomMembers();
			var memberNames = this.getMemberNamesFromMemberList(inaMemberList);
			for (var i = structureLayout.size() - 1; i >= 0; i--)
			{
				var iqStructureMember = structureLayout.get(i);
				if (iqStructureMember.isModelDefinedMember() && (dimension.getDimensionType() === oFF.DimensionType.ACCOUNT || !memberNames.contains(iqStructureMember.getName())))
				{
					continue;
				}
				structureLayout.removeAt(i);
			}
		}
		var membersNotOverrideByDelta = oFF.XListOfString.create();
		if (isDelta)
		{
			var structureMemberIter = dimension.getLoadedStructureMembers().getIterator();
			while (structureMemberIter.hasNext())
			{
				var existingMember = structureMemberIter.next();
				if (oFF.notNull(existingMember) && (existingMember.getMemberType() === oFF.MemberType.BASIC_MEASURE || existingMember.isCreatedFromMetadata()))
				{
					membersNotOverrideByDelta.add(existingMember.getName());
				}
			}
		}
		var len = inaMemberList.size();
		for (var iMember = 0; iMember < len; iMember++)
		{
			var inaMember = inaMemberList.getStructureAt(iMember);
			var member = importer.importStructureMember(dimension, inaMember, context);
			if (oFF.notNull(member))
			{
				var name = member.getName();
				var member2 = dimension.getLoadedStructureMember(name);
				if (oFF.isNull(member2))
				{
					if (isDelta)
					{
						dimension.addModellerMember(member);
						var keyRef = dimension.getModellerMemberKeyRef(member.getStorageObjectName());
						dimension.addMeasure(keyRef);
						membersNotOverrideByDelta.removeElement(member.getName());
					}
					else
					{
						dimension.addMeasure(member);
					}
				}
				else if (isDelta)
				{
					dimension.addModellerMember(member);
					if (dimension.getStructureLayout().getByKey(member.getStorageObjectName()) === null)
					{
						dimension.getStructureLayout().addKeyRef(member);
					}
					membersNotOverrideByDelta.removeElement(member.getName());
				}
				else
				{
					if (member2 !== member && !member2.isModelDefinedMember())
					{
						throw oFF.XException.createIllegalStateException(oFF.XStringUtils.concatenate3("Internal error: New member with same name not allowed: '", name, "'!"));
					}
					structureLayout.removeElement(member2);
					structureLayout.add(member2);
				}
			}
		}
		if (isDelta && membersNotOverrideByDelta.size() > 0)
		{
			var orignalMemberNameIter = membersNotOverrideByDelta.getIterator();
			while (orignalMemberNameIter.hasNext())
			{
				var originalMemberName = orignalMemberNameIter.next();
				var originalMember = dimension.getLoadedStructureMember(originalMemberName);
				if (oFF.notNull(originalMember))
				{
					originalMember.setModelDefinedMember(true);
					dimension.addModellerMember(originalMember);
				}
			}
		}
	}
	return dimension;
};
oFF.QInARepoMembersAll.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var dimension = modelComponent;
	var olapEnv = dimension.getOlapEnv();
	var allStructureMembers = dimension.getStructureLayout();
	if (oFF.notNull(allStructureMembers))
	{
		if (!dimension.supportsBasicStructureMembers() && allStructureMembers.isEmpty())
		{
			return null;
		}
		var membersList = inaStructure.putNewList("MembersRepo");
		var len = allStructureMembers.size();
		for (var i = 0; i < len; i++)
		{
			var structureMember = allStructureMembers.get(i);
			if (oFF.isNull(structureMember))
			{
				continue;
			}
			var isKeyRefSerializationEnabled = dimension.getQueryManager() !== null && dimension.getQueryManager().isKeyRefSerializationEnabled();
			if (isKeyRefSerializationEnabled && oFF.notNull(olapEnv) && olapEnv.getClientQueryObjectManager().getClientQueryObjectIncludeReleasedByKeyRef(structureMember, dimension.getQueryManager().getClientQueryObjectStorageName()) !== null)
			{
				var inaSharedObjectMember = exporter.exportStructureMember(structureMember);
				membersList.add(inaSharedObjectMember);
				continue;
			}
			if (structureMember.isReleased())
			{
				continue;
			}
			var deltaExport = exporter.getOriginalMode() === oFF.QModelFormat.INA_REPOSITORY_DELTA;
			var accountDimension = dimension.getDimensionType() === oFF.DimensionType.ACCOUNT;
			if (structureMember.isModelDefinedMember() && !deltaExport)
			{
				if (exporter.getOriginalMode().isTypeOf(oFF.QModelFormat.INA_REPOSITORY))
				{
					if (accountDimension)
					{
						continue;
					}
					if (isKeyRefSerializationEnabled)
					{
						var inaModellerMember = membersList.addNewStructure();
						oFF.QInARepoUtils.addKeyRefStructure(exporter, structureMember, inaModellerMember, dimension.getQueryManager());
						continue;
					}
				}
				else if (exporter.getOriginalMode().isTypeOf(oFF.QModelFormat.INA_CLONE) && accountDimension)
				{
					continue;
				}
			}
			var measureMemberCustom = !accountDimension && !structureMember.isCreatedFromMetadata();
			var accountMemberCustom = accountDimension && !structureMember.isModelDefinedMember() && !structureMember.isCreatedFromMetadata();
			var measureAddedByUser = measureMemberCustom || accountMemberCustom;
			var shouldContinueExporting = exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || measureAddedByUser || structureMember.getModCounter() > 0;
			if (shouldContinueExporting)
			{
				var inaMember = exporter.exportStructureMember(structureMember);
				membersList.add(inaMember);
			}
		}
	}
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};
oFF.QInARepoMembersAll.prototype.getMemberNamesFromMemberList = function(inaMemberList)
{
	var memberNames = oFF.XHashSetOfString.create();
	for (var memberIdx = 0; memberIdx < inaMemberList.size(); memberIdx++)
	{
		var member = inaMemberList.getStructureAt(memberIdx);
		var memberKeyRef = member.getStructureByKey("KeyRef");
		var memberName = oFF.notNull(memberKeyRef) ? memberKeyRef.getStringByKey("ObjectName") : member.getStringByKey("Name");
		if (oFF.XStringUtils.isNotNullAndNotEmpty(memberName))
		{
			memberNames.add(memberName);
		}
	}
	return memberNames;
};

oFF.QInARepoModellerCurrencyTranslation = function() {};
oFF.QInARepoModellerCurrencyTranslation.prototype = new oFF.QInARepository();
oFF.QInARepoModellerCurrencyTranslation.prototype._ff_c = "QInARepoModellerCurrencyTranslation";

oFF.QInARepoModellerCurrencyTranslation.checkInitializeLegacyAccountCurrencyTranslation = function(maximumNumberOfTranslations, currencyTranslationManager)
{
	if (maximumNumberOfTranslations > 0)
	{
		var queryModel = currencyTranslationManager.getQueryModel();
		var placeholderIdsList = oFF.XListOfString.create();
		var measureDimension = queryModel.getMeasureDimension();
		var translationCount = 0;
		var memberIter = measureDimension.getStructureLayout().getIterator();
		while (memberIter.hasNext())
		{
			var member = memberIter.next();
			if (oFF.notNull(member))
			{
				var memberName = member.getName();
				if (oFF.XString.isEqual(memberName, "SignedDataLocal"))
				{
					placeholderIdsList.add("SignedDataLocal");
				}
				else if (oFF.XString.startsWith(memberName, "SignedDataOther") && oFF.QInARepoModellerCurrencyTranslation.checkCrossCalculationMember(memberName, queryModel) && translationCount < maximumNumberOfTranslations - 1)
				{
					placeholderIdsList.add(memberName);
					translationCount++;
				}
				else if (oFF.XString.isEqual(memberName, "SignedData") && oFF.QInARepoModellerCurrencyTranslation.checkCrossCalculationMember("SignedData", queryModel))
				{
					placeholderIdsList.add("SignedData");
				}
			}
		}
		measureDimension.setPlaceholderIds(placeholderIdsList);
	}
};
oFF.QInARepoModellerCurrencyTranslation.checkCrossCalculationMember = function(structureMemberName, queryModel)
{
	var variable = queryModel.getVariable(oFF.XStringUtils.concatenate3(structureMemberName, ".", "Currency"));
	return oFF.notNull(variable);
};
oFF.QInARepoModellerCurrencyTranslation.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.MODELLER_CURRENCY_TRANSLATION;
};
oFF.QInARepoModellerCurrencyTranslation.prototype.getTagName = function()
{
	return "ModellerCurrencyTranslation";
};
oFF.QInARepoModellerCurrencyTranslation.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var currencyTranslationManagerBase = modelComponent;
	if (oFF.notNull(currencyTranslationManagerBase) && oFF.notNull(inaStructure))
	{
		var extendedPlanningRateNameSettings = inaStructure.getBooleanByKeyExt("PlanningParametersForCurrencyTranslation", false);
		var accountBasedRateType = inaStructure.getBooleanByKeyExt("RateTypeFromAccount", false);
		var maxNumberOfCurrencyTranslations = inaStructure.getIntegerByKeyExt("MaxNumberOfCurrencyTranslations", -1);
		currencyTranslationManagerBase.setMaxNumberOfTranslations(maxNumberOfCurrencyTranslations);
		currencyTranslationManagerBase.setSupportsExtendedRateNameParameters(extendedPlanningRateNameSettings);
		currencyTranslationManagerBase.initializeLegacyCurrencyTranslation(!extendedPlanningRateNameSettings);
		currencyTranslationManagerBase.setDeriveRateTypeFromAccount(accountBasedRateType);
		var cttd = inaStructure.getStringByKey("CurrencyTranslationTimeDimension");
		currencyTranslationManagerBase.setCurrencyTranslationTimeDimensionName(cttd);
		currencyTranslationManagerBase.setCurrencyRateTableId(inaStructure.getStringByKey("CurrencyRateTableId"));
		var currencyDimension = inaStructure.getStringByKey("CurrencyDimension");
		if (oFF.XStringUtils.isNotNullAndNotEmpty(currencyDimension))
		{
			currencyTranslationManagerBase.setCurrencyDimensionName(currencyDimension);
		}
		var defaultCurrency = inaStructure.getStringByKey("DefaultCurrency");
		if (oFF.XStringUtils.isNotNullAndNotEmpty(defaultCurrency))
		{
			currencyTranslationManagerBase.setDefaultCurrency(defaultCurrency);
		}
		var i;
		var size;
		var subStructure;
		var rateVersions = inaStructure.getListByKey("RateVersions");
		if (oFF.XCollectionUtils.hasElements(rateVersions))
		{
			currencyTranslationManagerBase.clearAvailableRateVersions();
			size = rateVersions.size();
			for (i = 0; i < size; i++)
			{
				subStructure = rateVersions.getStructureAt(i);
				currencyTranslationManagerBase.addAvailableRateVersion(subStructure.getStringByKey("Name"), subStructure.getStringByKey("Text"));
			}
		}
		var currencies = inaStructure.getListByKey("Currencies");
		if (oFF.XCollectionUtils.hasElements(currencies))
		{
			currencyTranslationManagerBase.clearAvailableCurrencies();
			size = currencies.size();
			for (i = 0; i < size; i++)
			{
				subStructure = currencies.getStructureAt(i);
				currencyTranslationManagerBase.addAvailableCurrency(subStructure.getStringByKey("Name"), subStructure.getStringByKey("Text"));
			}
		}
		var categories = inaStructure.getListByKey("Categories");
		if (oFF.XCollectionUtils.hasElements(categories))
		{
			currencyTranslationManagerBase.clearAvailableCategories();
			size = categories.size();
			for (i = 0; i < size; i++)
			{
				subStructure = categories.getStructureAt(i);
				currencyTranslationManagerBase.addAvailableCategory(oFF.QInAConverter.lookupCategory(subStructure.getStringByKey("Name")));
			}
		}
		var rateTypes = inaStructure.getListByKey("RateTypes");
		if (oFF.XCollectionUtils.hasElements(rateTypes))
		{
			currencyTranslationManagerBase.clearAvailableRateTypes();
			size = rateTypes.size();
			for (i = 0; i < size; i++)
			{
				subStructure = rateTypes.getStructureAt(i);
				currencyTranslationManagerBase.addAvailableRateType(oFF.QInAConverter.lookupRateType(subStructure.getStringByKey("Name")));
			}
		}
		oFF.QInARepoModellerCurrencyTranslation.checkInitializeLegacyAccountCurrencyTranslation(maxNumberOfCurrencyTranslations, currencyTranslationManagerBase);
		currencyTranslationManagerBase.postImportInitialization();
		this.importModellerDefinedCurrencyTranslations(importer, inaStructure, currencyTranslationManagerBase, context);
	}
	return currencyTranslationManagerBase;
};
oFF.QInARepoModellerCurrencyTranslation.prototype.importModellerDefinedCurrencyTranslations = function(importer, inaStructure, currencyTranslationManager, context)
{
	var inaCurrencyTranslationsList = inaStructure.getListByKey("CurrencyTranslations");
	if (oFF.XCollectionUtils.hasElements(inaCurrencyTranslationsList))
	{
		var size = inaCurrencyTranslationsList.size();
		for (var i = 0; i < size; i++)
		{
			var inaSpecificCurrencyTranslation = inaCurrencyTranslationsList.getStructureAt(i);
			var name = inaSpecificCurrencyTranslation.getStringByKey("Name");
			var description = inaSpecificCurrencyTranslation.getStringByKey("Description");
			var currencyTranslation = currencyTranslationManager.getMeasureCurrencyTranslation(name);
			if (oFF.isNull(currencyTranslation))
			{
				currencyTranslation = currencyTranslationManager.addNewMeasureCurrencyTranslationBase(name, description);
			}
			importer.importCurrencyTranslationElement(inaSpecificCurrencyTranslation, currencyTranslation, context);
		}
	}
};
oFF.QInARepoModellerCurrencyTranslation.prototype.exportComponentWithStructure = oFF.noSupport;

oFF.QInARepoModellerDimensions = function() {};
oFF.QInARepoModellerDimensions.prototype = new oFF.QInARepository();
oFF.QInARepoModellerDimensions.prototype._ff_c = "QInARepoModellerDimensions";

oFF.QInARepoModellerDimensions.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.MODELLER_DIMENSIONS;
};
oFF.QInARepoModellerDimensions.prototype.getTagName = function()
{
	return "ModellerDimensions";
};
oFF.QInARepoModellerDimensions.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var queryModel = modelComponent;
	if (oFF.notNull(inaStructure))
	{
		var inaList = inaStructure.getListByKey("Dimensions");
		var size = inaList.size();
		var dimensionManager = queryModel.getDimensionManagerBase();
		var dimensionReferences = dimensionManager.getDimensionReferences();
		for (var k = 0; k < size; k++)
		{
			var inaDimension = inaList.getStructureAt(k);
			var dimName = inaDimension.getStringByKey("Name");
			if (dimensionReferences.containsKey(dimName))
			{
				var dimension = dimensionManager.getDimensionByNameFromExistingMetadata(dimName);
				if (queryModel.getSession().hasFeature(oFF.FeatureToggleOlap.SFX_HIDDEN_DIMENSIONS) && inaDimension.getBooleanByKey("IsHidden"))
				{
					var fieldIter = dimension.getFields().getIterator();
					while (fieldIter.hasNext())
					{
						dimensionManager.removeField(fieldIter.next());
						dimensionManager.removeDimension(dimension);
					}
				}
			}
			importer.importDimension(inaDimension, queryModel);
		}
		var extendedDimensions = queryModel.getExtendedDimensions();
		var sExtendedDimensions = inaStructure.getListByKey("ExtendedDimensions");
		if (oFF.notNull(extendedDimensions) && oFF.notNull(sExtendedDimensions) && !sExtendedDimensions.isEmpty())
		{
			for (var i = 0; i < extendedDimensions.size(); i++)
			{
				var extendedDimension = extendedDimensions.get(i);
				var name = extendedDimension.getName();
				for (var j = 0; j < sExtendedDimensions.size(); j++)
				{
					var sExtendedDimension = sExtendedDimensions.getStructureAt(j);
					if (oFF.XString.isEqual(name, sExtendedDimension.getStringByKey("Name")))
					{
						extendedDimension.setLocationType(oFF.LocationType.lookup(sExtendedDimension.getStringByKey("LocationType")));
					}
				}
			}
		}
	}
	return queryModel;
};
oFF.QInARepoModellerDimensions.prototype.exportComponentWithStructure = oFF.noSupport;

oFF.QInARepoModellerMetadataProperties = function() {};
oFF.QInARepoModellerMetadataProperties.prototype = new oFF.QInARepository();
oFF.QInARepoModellerMetadataProperties.prototype._ff_c = "QInARepoModellerMetadataProperties";

oFF.QInARepoModellerMetadataProperties.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.MODELLER_METADATA_PROPERTIES;
};
oFF.QInARepoModellerMetadataProperties.prototype.getTagName = function()
{
	return "ModellerMetadataProperties";
};
oFF.QInARepoModellerMetadataProperties.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	if (oFF.isNull(inaStructure))
	{
		return modelComponent;
	}
	var queryModel = modelComponent;
	var metadataProperties = queryModel.getMetadataPropertiesBase();
	if (oFF.notNull(metadataProperties))
	{
		metadataProperties.putBoolean("HasUserDefinedMeasures", inaStructure.getBooleanByKeyExt("HasUserDefinedMeasures", false));
		metadataProperties.putBoolean("IsPlanning", inaStructure.getBooleanByKeyExt("IsPlanning", false));
		metadataProperties.putStringNotNull("LeadingStructure", inaStructure.getStringByKey("LeadingStructure"));
		metadataProperties.putStringNotNull("MappedVersionDimension", inaStructure.getStringByKey("MappedVersionDimension"));
	}
	var mode = inaStructure.getStringByKey("Mode");
	var epmQuerySourceName = inaStructure.getStringByKey("EpmQuerySourceName");
	var epmModelName = inaStructure.getStringByKey("EpmModelName");
	var schemaName = inaStructure.getStringByKey("SchemaName");
	var packageName = inaStructure.getStringByKey("PackageName");
	var name = inaStructure.getStringByKey("Name");
	var shortDescription = inaStructure.getStringByKey("ShortDescription");
	var datasetEpmObject = oFF.QDatasetEpmObject.create(mode, epmModelName, epmQuerySourceName, schemaName, packageName, name, shortDescription);
	queryModel.setDatasetEpmObject(datasetEpmObject);
	return queryModel;
};
oFF.QInARepoModellerMetadataProperties.prototype.exportComponentWithStructure = oFF.noSupport;

oFF.QInARepoModellerVariableManager = function() {};
oFF.QInARepoModellerVariableManager.prototype = new oFF.QInARepository();
oFF.QInARepoModellerVariableManager.prototype._ff_c = "QInARepoModellerVariableManager";

oFF.QInARepoModellerVariableManager.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.MODELLER_VARIABLES;
};
oFF.QInARepoModellerVariableManager.prototype.getTagName = function()
{
	return "ModellerVariables";
};
oFF.QInARepoModellerVariableManager.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var variableContainer = modelComponent;
	if (oFF.notNull(inaStructure))
	{
		var inaList = inaStructure.getListByKey("Variables");
		if (oFF.notNull(inaList))
		{
			var len = inaList.size();
			for (var varIdx = 0; varIdx < len; varIdx++)
			{
				var inaVariable = inaList.getStructureAt(varIdx);
				var variableName = inaVariable.getStringByKey("Name");
				var variable = variableContainer.getVariableBaseByName(variableName);
				if (oFF.isNull(variable) && inaVariable.getBooleanByKeyExt("CustomVariable", false))
				{
					variable = this.createCustomVariable(context, inaVariable);
					var inputType = inaVariable.getStringByKey("InputType");
					var mandatory = oFF.XString.isEqual(inputType, "Mandatory") || oFF.XString.isEqual(inputType, "MandatoryNotInitial");
					variable.setMandatory(mandatory);
					var initialValueAllowed = oFF.XString.isEqual(inputType, "Mandatory") || oFF.XString.isEqual(inputType, "Optional");
					variable.setInitialValueAllowed(initialValueAllowed);
				}
				if (oFF.notNull(variable))
				{
					variable.setProcessingType(oFF.QInAConverter.lookupProcessingType(inaVariable.getStringByKey("ProcessingType")));
					var variableType = variable.getVariableType();
					if (variableType.isTypeOf(oFF.VariableType.SIMPLE_TYPE_VARIABLE))
					{
						importer.importSimpleTypeVariable(inaVariable, variable, context);
					}
					else if (variableType.isTypeOf(oFF.VariableType.DIMENSION_MEMBER_VARIABLE))
					{
						importer.importDimensionMemberVariable(inaVariable, variable, context);
					}
					else if (variableType.isTypeOf(oFF.VariableType.OPTION_LIST_VARIABLE))
					{
						importer.importOptionListVariable(inaVariable, variable, context);
					}
					else
					{
						importer.addError(oFF.ErrorCodes.INVALID_PARAMETER, oFF.XStringUtils.concatenate5("The variable '", variableName, "' of variable type '", variableType.getName(), "' was not imported correctly"));
					}
				}
				else
				{
					importer.addWarning(oFF.ErrorCodes.ET_ELEMENT_NOT_FOUND, oFF.XStringUtils.concatenate3("The variable '", variableName, "' was not found"));
				}
			}
		}
	}
	return variableContainer;
};
oFF.QInARepoModellerVariableManager.prototype.createCustomVariable = function(context, inaVariable)
{
	var variableConfig = oFF.QFactory.createCustomVariableConfig(context.getQueryManager());
	var inaOptionList = inaVariable.getListByKey("Options");
	var options = oFF.XList.create();
	if (!oFF.PrUtils.isListEmpty(inaOptionList))
	{
		var len2 = inaOptionList.size();
		for (var i = 0; i < len2; i++)
		{
			var inaOption = inaOptionList.getStructureAt(i);
			var inaOptionName = inaOption.getStringByKey("Name");
			var inaOptionText = inaOption.getStringByKey("Text");
			options.add(oFF.XPairOfString.create(inaOptionName, inaOptionText));
		}
	}
	return variableConfig.createOptionsListVariable(inaVariable.getStringByKey("Name"), inaVariable.getStringByKey("Text"), options);
};
oFF.QInARepoModellerVariableManager.prototype.exportComponentWithStructure = oFF.noSupport;

oFF.QInARepoQuery = function() {};
oFF.QInARepoQuery.prototype = new oFF.QInARepository();
oFF.QInARepoQuery.prototype._ff_c = "QInARepoQuery";

oFF.QInARepoQuery.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.QUERY_MODEL;
};
oFF.QInARepoQuery.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var queryModel = modelComponent.getQueryModel();
	var inaDefinition = inaStructure;
	var inaQueries = inaDefinition.getListByKey("Queries");
	if (oFF.notNull(inaQueries))
	{
		inaDefinition = inaQueries.getStructureAt(inaQueries.size() - 1);
	}
	var inaBatch = inaDefinition.getListByKey(oFF.ConnectionConstants.INA_BATCH);
	if (oFF.notNull(inaBatch))
	{
		inaDefinition = inaBatch.getStructureAt(inaBatch.size() - 1);
	}
	if (oFF.notNull(inaDefinition) && inaDefinition.containsKey("Analytics"))
	{
		inaDefinition = inaDefinition.getStructureByKey("Analytics");
		if (oFF.notNull(inaDefinition) && inaDefinition.containsKey("Definition"))
		{
			inaDefinition = inaDefinition.getStructureByKey("Definition");
		}
	}
	if (oFF.notNull(inaDefinition) && inaDefinition.containsKey("Definition"))
	{
		inaDefinition = inaDefinition.getStructureByKey("Definition");
	}
	if (oFF.notNull(inaDefinition))
	{
		var isForRendering = importer.getOriginalMode() === oFF.QModelFormat.INA_CLONE_RENDERING;
		if (inaDefinition.containsKey("ModellerDefinition"))
		{
			inaDefinition = inaDefinition.getStructureByKey("ModellerDefinition");
			var eventingStoppedBeforeModelingCall = queryModel.isEventingStopped();
			if (eventingStoppedBeforeModelingCall)
			{
				queryModel.setDeltaPhase(oFF.QDeltaOperationPhase.NOTE_MODELER_CHANGES);
			}
			importer.importModellerDimensions(inaDefinition, queryModel, queryModel);
			importer.importModellerDefinedVariables(inaDefinition, queryModel.getVariableManagerBase(), queryModel);
			importer.importModellerCurrencyTranslation(inaDefinition, queryModel.getCurrencyTranslationManagerBase(), queryModel);
			importer.importModellerMetadataProperties(inaDefinition, queryModel, queryModel);
			importer.importFormulaExceptionManager(inaDefinition, queryModel.getFormulaExceptionManagerBase(), queryModel);
			if (eventingStoppedBeforeModelingCall)
			{
				queryModel.finishModelerEventing();
			}
			return queryModel;
		}
		importer.importDimensions(inaDefinition, queryModel, queryModel);
		if (!isForRendering)
		{
			importer.importFilter(inaDefinition, queryModel.getFilterBase(), queryModel);
			importer.importExceptions(inaDefinition, queryModel);
			importer.importQueryCells(inaDefinition, queryModel.getQueryCellManager(), queryModel);
			importer.importUniversalDisplayHierarchies(inaDefinition, queryModel.getUniversalDisplayHierarchiesBase(), queryModel);
		}
		importer.importCurrencyTranslationManager(inaDefinition, queryModel.getCurrencyTranslationManager(), queryModel);
		importer.importSortingManager(inaDefinition, queryModel.getSortingManagerBase(), queryModel);
		importer.importDrillManager(inaDefinition, queryModel.getDrillManager(), queryModel);
		importer.importCellContextManager(inaDefinition, queryModel.getCellContextManager(), queryModel);
		importer.importVisualizationManager(inaDefinition, queryModel.getVisualizationManager(), queryModel);
		if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_NO_VARS && importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DATA_NO_VARS)
		{
			importer.importVariableManager(inaDefinition, queryModel.getVariableManagerBase(), queryModel);
		}
		importer.importQuerySettings(inaDefinition, queryModel);
		importer.importDataCells(inaDefinition, queryModel);
		importer.importConditionManager(inaDefinition, queryModel.getConditionManagerBase(), queryModel);
		importer.importFormulaExceptionManager(inaDefinition, queryModel.getFormulaExceptionManagerBase(), queryModel);
		this.importPaging(importer, inaDefinition, queryModel);
		var resultStructureController = queryModel.getResultStructureController();
		importer.importComponent(null, inaDefinition, resultStructureController, queryModel, queryModel);
		var queryManager = queryModel.getQueryManager();
		if (oFF.notNull(queryManager))
		{
			oFF.QInARepoOptions.importSuppressKeyfigureCalculation(inaDefinition, queryManager);
			oFF.QInARepoOptions.importLOVAbstractionLayerSettings(inaDefinition, queryManager);
			queryManager.setResultSetPersistanceTargetTable(inaStructure.getStringByKey("ResultSetPersistanceTable"));
			queryManager.setResultSetPersistanceTargetSchema(inaStructure.getStringByKey("ResultSetPersistanceSchema"));
			queryManager.setResultSetPersistenceIdentifier(inaStructure.getStringByKey("ResultSetPersistanceIdentifier"));
		}
		var inaPreQueries = inaDefinition.getListByKey("PreQueries");
		if (oFF.notNull(inaPreQueries))
		{
			var mainQuerySystemname = null;
			var inaDataSource = inaDefinition.getStructureByKey("DataSource");
			if (oFF.notNull(inaDataSource))
			{
				mainQuerySystemname = inaDataSource.getStringByKey("System");
			}
			this.importPreQueries(importer, queryModel, inaPreQueries, mainQuerySystemname);
		}
		if (importer.mode.isTypeOf(oFF.QModelFormat.INA_REPOSITORY_DATA) && queryModel.isBlendingModel())
		{
			this.importBlendingSources(importer, inaStructure, queryModel);
		}
		queryModel.setVersionDimensionValidationEnabled(inaDefinition.getBooleanByKeyExt("IsVersionDimensionValidationEnabled", false));
	}
	return queryModel;
};
oFF.QInARepoQuery.prototype.importBlendingSources = function(importer, inaStructure, queryModel)
{
	var sources = queryModel.getBlendingSources();
	if (!oFF.XCollectionUtils.hasElements(sources))
	{
		return;
	}
	var inaDataSource = oFF.PrUtils.getStructureProperty(inaStructure, "DataSource");
	var inaSources = oFF.PrUtils.getListProperty(inaDataSource, "Sources");
	if (oFF.PrUtils.isListEmpty(inaSources))
	{
		return;
	}
	for (var i = 0; i < sources.size(); i++)
	{
		var inaSource = oFF.PrUtils.getStructureElement(inaSources, i);
		var inaDefinitionContext = oFF.PrUtils.getStructureProperty(inaSource, "DefiningContext");
		if (oFF.notNull(inaDefinitionContext))
		{
			var sourceQueryModel = sources.get(i).getQueryModel();
			sourceQueryModel.deserializeFromElementExt(importer.mode, inaDefinitionContext);
		}
	}
};
oFF.QInARepoQuery.prototype.importPaging = function(importer, inaDefinition, queryModel)
{
	var inaSubset = inaDefinition.getStructureByKey("SubSetDescription");
	var queryManager = queryModel.getQueryManager();
	var isForRendering = importer.mode === oFF.QModelFormat.INA_REPOSITORY_DATA_RENDERING;
	if (oFF.isNull(inaSubset) || !queryModel.getSession().hasFeature(oFF.FeatureToggleOlap.PERSIST_PAGING_IN_REPO) || queryManager.applyingStateOnQueryManager() && !isForRendering)
	{
		return;
	}
	oFF.QInARepoOptions.importPaging(inaDefinition, queryManager);
};
oFF.QInARepoQuery.prototype.getInactiveCapabilities = function(queryModel)
{
	var capabilities = oFF.XHashMapByString.create();
	var allCapabilities = oFF.FeatureToggleOlap.getAllFeatureToggles();
	var allIterator = allCapabilities.getKeysAsIteratorOfString();
	while (allIterator.hasNext())
	{
		capabilities.put(allIterator.next(), oFF.XBooleanValue.create(false));
	}
	var experimentalFeatureSet = queryModel.getSession().getFeatureToggles();
	if (oFF.notNull(experimentalFeatureSet))
	{
		var activatedIterator = experimentalFeatureSet.getKeysAsIteratorOfString();
		while (activatedIterator.hasNext())
		{
			capabilities.put(activatedIterator.next(), oFF.XBooleanValue.create(true));
		}
	}
	return capabilities;
};
oFF.QInARepoQuery.prototype.importPreQueries = function(importer, queryModel, inaPreQueries, mainQuerySystemname)
{
	var modeHolder = importer.getMode();
	if (importer.getOriginalMode() !== oFF.QModelFormat.INA_CLONE_RENDERING)
	{
		importer.mode = importer.getOriginalMode();
	}
	var dsBuffer = oFF.XStringBuffer.create();
	var capabilitiesToActivate = this.getInactiveCapabilities(queryModel);
	var preQueriesSize = inaPreQueries.size();
	for (var i = 0; i < preQueriesSize; i++)
	{
		var inaPreQuery = inaPreQueries.getStructureAt(i);
		var inaRuntime = inaPreQuery.getStructureByKey("Runtime");
		if (oFF.isNull(inaRuntime))
		{
			inaRuntime = inaPreQuery;
		}
		var inaDataSource = inaRuntime.getStructureByKey("DataSource");
		dsBuffer.clear();
		dsBuffer.append(inaDataSource.getStringByKey("Type")).append(":[");
		dsBuffer.append(inaDataSource.getStringByKey("SchemaName"));
		dsBuffer.append("][");
		dsBuffer.append(inaDataSource.getStringByKey("PackageName"));
		dsBuffer.append("][");
		dsBuffer.append(inaDataSource.getStringByKey("ObjectName")).append("]");
		var commandFactory = oFF.XCommandFactory.create(queryModel.getApplication());
		var xCmdDeserialize = commandFactory.createCommand(oFF.CmdCreateQueryManager.CMD_NAME);
		xCmdDeserialize.addParameter(oFF.CmdCreateQueryManager.PARAM_I_APPLICATION, queryModel.getApplication());
		xCmdDeserialize.addParameter(oFF.CmdCreateQueryManager.PARAM_I_ENFORCE_INACTIVE_CAPABILITIES, capabilitiesToActivate);
		var preQuerySystemName = inaDataSource.getStringByKey("System");
		if (importer.mode === oFF.QModelFormat.INA_REPOSITORY && oFF.XString.isEqual(preQuerySystemName, mainQuerySystemname))
		{
			preQuerySystemName = queryModel.getDataSource().getSystemName();
		}
		xCmdDeserialize.addParameterString(oFF.CmdCreateQueryManager.PARAM_I_SYSTEM, preQuerySystemName);
		xCmdDeserialize.addParameterString(oFF.CmdCreateQueryManager.PARAM_I_DATA_SOURCE, dsBuffer.toString());
		var processCommand = xCmdDeserialize.processCommand(oFF.SyncType.BLOCKING, null, null);
		importer.addAllMessages(processCommand);
		oFF.XObjectExt.release(xCmdDeserialize);
		if (processCommand.isValid())
		{
			var preQuery = processCommand.getData().getResultParameter(oFF.CmdCreateQueryManager.PARAM_E_QUERY_MANAGER).getQueryModel();
			importer.importPreQuery(inaPreQuery, preQuery);
			oFF.QInARepoDataSource.importDs2(importer, inaDataSource, null, preQuery.getDataSourceBase());
			var inaPreQueryName = inaPreQuery.getStringByKey("ObjectName");
			var preQueryExisting = queryModel.getPreQueryByName(inaPreQueryName);
			if (oFF.isNull(preQueryExisting))
			{
				queryModel.addPreQueryWithName(preQuery, inaPreQueryName);
			}
		}
	}
	importer.mode = modeHolder;
};
oFF.QInARepoQuery.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var queryModel = modelComponent.getQueryModel();
	var isForRendering = exporter.mode === oFF.QModelFormat.INA_REPOSITORY_DATA_RENDERING;
	exporter.exportUniversalDisplayHierarchies(queryModel.getUniversalDisplayHierarchies(), inaStructure);
	var drillManager = queryModel.getDrillManager();
	exporter.exportDrillManager(drillManager, inaStructure);
	if (!drillManager.isValidatingContextFreeNavigations())
	{
		inaStructure.putBoolean("ValidateContextFreeNavigations", false);
	}
	var cellContextManager = queryModel.getCellContextManager();
	exporter.exportCellContextManager(cellContextManager, inaStructure);
	var withDataSource = oFF.XMath.binaryAnd(flags, oFF.QImExFlag.DATASOURCE) > 0;
	if (withDataSource)
	{
		oFF.QInARepoDataSource.exportDataSource(exporter, queryModel.getDataSource(), queryModel.getModelCapabilities().supportsRunAsUser(), inaStructure);
	}
	exporter.exportDimensions(queryModel, inaStructure);
	exporter.exportSortingManager(queryModel.getSortingManager(), inaStructure);
	exporter.exportCurrencyTranslationManager(queryModel.getCurrencyTranslationManager(), inaStructure);
	exporter.exportDataCells(queryModel, inaStructure);
	exporter.exportQuerySettings(queryModel, inaStructure);
	if (!isForRendering)
	{
		exporter.exportFilter(queryModel.getFilter(), inaStructure);
		exporter.exportExceptions(queryModel, inaStructure);
		exporter.exportQueryCells(queryModel.getQueryCellManager(), inaStructure);
	}
	exporter.exportConditionManager(queryModel.getConditionManager(), inaStructure);
	var withVariables = oFF.XMath.binaryAnd(flags, oFF.QImExFlag.VARIABLES) > 0;
	if (withVariables && exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_NO_VARS && exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DATA_NO_VARS)
	{
		if (queryModel.isExportingVariables() || queryModel.hasProcessingStep())
		{
			exporter.exportVariables(queryModel.getVariableContainer(), inaStructure);
		}
	}
	var queryManager = queryModel.getQueryManager();
	if (queryModel.isBatchModeForMicroCube())
	{
		inaStructure.putString("Name", queryManager.getNameForMicroCubeUse());
	}
	exporter.exportFormulaExceptionManager(queryModel.getFormulaExceptionManager(), inaStructure);
	this.exportPaging(inaStructure, queryModel);
	oFF.QInARepoOptions.exportSuppressKeyfigureCalculation(inaStructure, queryManager);
	oFF.QInARepoOptions.exportLOVAbstractionLayerSettings(inaStructure, queryManager);
	var preQueries = queryModel.getPreQueries();
	if (oFF.notNull(preQueries))
	{
		var preQueriesSize = preQueries.size();
		if (preQueriesSize > 0)
		{
			var inaPreQueries = inaStructure.getListByKey("PreQueries");
			if (oFF.isNull(inaPreQueries))
			{
				inaPreQueries = inaStructure.putNewList("PreQueries");
			}
			var modeHolder = exporter.getMode();
			if (exporter.getOriginalMode() !== oFF.QModelFormat.INA_CLONE_RENDERING)
			{
				exporter.mode = exporter.getOriginalMode();
			}
			for (var i = 0; i < preQueriesSize; i++)
			{
				var preQuery = preQueries.get(i);
				var inaPreQuery = exporter.exportPreQuery(preQuery.getObject());
				var preQueryName = preQuery.getName();
				inaPreQuery.putString("ObjectName", preQueryName);
				inaPreQueries.add(inaPreQuery);
			}
			exporter.mode = modeHolder;
			inaStructure.put("PreQueries", inaPreQueries);
		}
	}
	var resultStructureController = queryModel.getResultStructureController();
	exporter.exportComponent(null, resultStructureController, inaStructure, flags);
	var featureToggles = oFF.InactiveCapabilityUtil.exportFeatureToggles(queryManager.getSession().getFeatureToggles());
	inaStructure.putString("ExperimentalFeatures", featureToggles);
	inaStructure.putString("ResultSetPersistanceTable", queryManager.getResultSetPersistenceTable());
	inaStructure.putString("ResultSetPersistanceSchema", queryManager.getResultSetPersistenceSchema());
	inaStructure.putString("ResultSetPersistanceIdentifier", queryManager.getResultSetPersistenceIdentifier());
	exporter.exportVisualizationManager(queryModel.getVisualizationManager(), inaStructure);
	inaStructure.putBoolean("IsVersionDimensionValidationEnabled", queryModel.isVersionDimensionValidationEnabled());
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};
oFF.QInARepoQuery.prototype.exportPaging = function(inaStructure, queryModel)
{
	var queryManager = queryModel.getQueryManager();
	if (!queryModel.getSession().hasFeature(oFF.FeatureToggleOlap.PERSIST_PAGING_IN_REPO) || queryManager.recordingStateOfQueryManager())
	{
		return;
	}
	if (queryManager.getOffsetColumns() > 0 || queryManager.getOffsetRows() > 0 || queryManager.getMaxColumns() > -1 || queryManager.getMaxRows() > -1)
	{
		oFF.QInARepoOptions.exportPaging(inaStructure, queryManager);
	}
};

oFF.QInARepoQueryCells = function() {};
oFF.QInARepoQueryCells.prototype = new oFF.QInARepository();
oFF.QInARepoQueryCells.prototype._ff_c = "QInARepoQueryCells";

oFF.QInARepoQueryCells.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.QUERY_CELLS;
};
oFF.QInARepoQueryCells.prototype.getTagName = function()
{
	return "Cells";
};
oFF.QInARepoQueryCells.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var queryCellManager = modelComponent;
	if (oFF.notNull(queryCellManager))
	{
		queryCellManager.clear();
		if (oFF.notNull(inaStructure))
		{
			var inaQueryCells = inaStructure.getListByKey("Elements");
			if (oFF.notNull(inaQueryCells))
			{
				var dimensionAccessor = queryCellManager.getDimensionAccessor();
				var sizeCells = inaQueryCells.size();
				for (var idxCell = 0; idxCell < sizeCells; idxCell++)
				{
					var inaQueryCell = inaQueryCells.getStructureAt(idxCell);
					var queryCell = queryCellManager.addNewQueryCell(inaQueryCell.getStringByKey("Name"));
					queryCell.setCellCalculationMember(this.getMember(dimensionAccessor, inaQueryCell));
					var inaPositions = inaQueryCell.getListByKey("Position");
					var sizePositions = inaPositions.size();
					for (var idxPosition = 0; idxPosition < sizePositions; idxPosition++)
					{
						var inaPosition = inaPositions.getStructureAt(idxPosition);
						queryCell.addPosition(this.getMember(dimensionAccessor, inaPosition));
					}
				}
			}
		}
	}
	return queryCellManager;
};
oFF.QInARepoQueryCells.prototype.getMember = function(dimensionAccessor, inaStructure)
{
	var dimension = dimensionAccessor.getDimensionByName(inaStructure.getStringByKey("DimensionName"));
	return dimension.getStructureMember(inaStructure.getStringByKey("MemberName"));
};
oFF.QInARepoQueryCells.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var queryCellManager = modelComponent;
	if (oFF.notNull(queryCellManager) && queryCellManager.size() > 0)
	{
		var inaQueryCells = inaStructure.putNewList("Elements");
		var queryCellIt = queryCellManager.getIterator();
		while (queryCellIt.hasNext())
		{
			var queryCell = queryCellIt.next();
			var inaQueryCell = inaQueryCells.addNewStructure();
			inaQueryCell.putString("Name", queryCell.getName());
			var cellCalculationMember = queryCell.getCellCalculationMember();
			inaQueryCell.putString("DimensionName", cellCalculationMember.getDimension().getName());
			inaQueryCell.putString("MemberName", cellCalculationMember.getName());
			var inaPositions = inaQueryCell.putNewList("Position");
			var positions = queryCell.getPositions();
			var positionIt = positions.getIterator();
			while (positionIt.hasNext())
			{
				var queryCellPosition = positionIt.next();
				var inaPosition = inaPositions.addNewStructure();
				inaPosition.putString("DimensionName", queryCellPosition.getDimensionName());
				inaPosition.putString("MemberName", queryCellPosition.getMemberName());
			}
		}
	}
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};

oFF.QInARepoQueryManager = function() {};
oFF.QInARepoQueryManager.prototype = new oFF.QInARepository();
oFF.QInARepoQueryManager.prototype._ff_c = "QInARepoQueryManager";

oFF.QInARepoQueryManager.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.QUERY_MANAGER;
};
oFF.QInARepoQueryManager.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var queryManager = modelComponent;
	return queryManager;
};
oFF.QInARepoQueryManager.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var queryManager = modelComponent;
	var queryModel = queryManager.getQueryModel();
	if (oFF.notNull(queryModel))
	{
		var inaQueryModel = exporter.exportQueryModel(queryModel, true, true);
		inaStructure.put("QueryModel", inaQueryModel);
	}
	var initSettings = queryManager.getQueryServiceConfig();
	var inaQuerySettings = exporter.exportComponent(oFF.OlapComponentType.QUERY_SERVICE_CONFIG, initSettings, null, flags);
	inaStructure.put("QueryServiceConfig", inaQuerySettings);
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, queryManager, inaStructure, flags);
};

oFF.QInARepoQuerySettings = function() {};
oFF.QInARepoQuerySettings.prototype = new oFF.QInARepository();
oFF.QInARepoQuerySettings.prototype._ff_c = "QInARepoQuerySettings";

oFF.QInARepoQuerySettings.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.QUERY_SETTINGS;
};
oFF.QInARepoQuerySettings.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var queryModel = context.getQueryModel();
	var definitionNameString = oFF.PrUtils.getStringProperty(inaStructure, "Name");
	if (oFF.notNull(definitionNameString))
	{
		queryModel.setDefinitionName(definitionNameString.getString());
	}
	var inaQuery = inaStructure.getStructureByKey("Query");
	importer.importAxesSettings(inaQuery, queryModel);
	var axesLayoutList = oFF.PrUtils.getListProperty(inaQuery, "AxesLayout");
	var len = oFF.PrUtils.getListSize(axesLayoutList, 0);
	for (var axesLayoutIndex = 0; axesLayoutIndex < len; axesLayoutIndex++)
	{
		var axisLayoutStructure = oFF.PrUtils.getStructureElement(axesLayoutList, axesLayoutIndex);
		var axisType = oFF.AxisType.lookup(oFF.PrUtils.getStringValueProperty(axisLayoutStructure, "Axis", null));
		var axis = queryModel.getAxis(axisType);
		if (oFF.isNull(axis))
		{
			continue;
		}
		var orderedDimensionNamesList = oFF.PrUtils.getListProperty(axisLayoutStructure, "OrderedDimensionNames");
		if (oFF.isNull(orderedDimensionNamesList))
		{
			continue;
		}
		var orderedDimensionNames = oFF.XListOfString.create();
		for (var dimensionNameIndex = 0; dimensionNameIndex < oFF.PrUtils.getListSize(orderedDimensionNamesList, 0); dimensionNameIndex++)
		{
			var dimensionNameString = oFF.PrUtils.getStringElement(orderedDimensionNamesList, dimensionNameIndex);
			if (oFF.isNull(dimensionNameString))
			{
				continue;
			}
			orderedDimensionNames.add(dimensionNameString.getString());
		}
		axis.reOrderDimensions(orderedDimensionNames);
	}
	return queryModel;
};
oFF.QInARepoQuerySettings.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var queryModel = modelComponent;
	var definitionName = queryModel.getDefinitionName();
	if (oFF.XStringUtils.isNotNullAndNotEmpty(definitionName))
	{
		inaStructure.putString("Name", definitionName);
	}
	var inaQuery = inaStructure.getStructureByKey("Query");
	if (oFF.isNull(inaQuery))
	{
		inaQuery = inaStructure.putNewStructure("Query");
	}
	exporter.exportAxesSettings(queryModel, inaQuery);
	var axesLayoutList = inaQuery.putNewList("AxesLayout");
	var allAxisTypes = oFF.AxisType.getAll();
	for (var axisTypeIndex = 0; axisTypeIndex < allAxisTypes.size(); axisTypeIndex++)
	{
		var axisType = allAxisTypes.get(axisTypeIndex);
		var axis = queryModel.getAxis(axisType);
		if (oFF.isNull(axis))
		{
			continue;
		}
		var dimensionNames = axis.getOrderedDimensionNames();
		if (oFF.isNull(dimensionNames))
		{
			continue;
		}
		var axisLayoutStructure = axesLayoutList.addNewStructure();
		axisLayoutStructure.putString("Axis", axis.getName());
		var orderedDimensionNamesList = axisLayoutStructure.putNewList("OrderedDimensionNames");
		orderedDimensionNamesList.addAllStrings(dimensionNames);
	}
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};

oFF.QInARepoServiceConfig = function() {};
oFF.QInARepoServiceConfig.prototype = new oFF.QInARepository();
oFF.QInARepoServiceConfig.prototype._ff_c = "QInARepoServiceConfig";

oFF.QInARepoServiceConfig.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.QUERY_SERVICE_CONFIG;
};
oFF.QInARepoServiceConfig.prototype.newModelComponent = function(application, olapEnv, parentComponent, context)
{
	var serviceConfig = oFF.QueryServiceConfig.create(application);
	return serviceConfig;
};
oFF.QInARepoServiceConfig.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var config = modelComponent;
	var system = inaStructure.getStringByKey("System");
	if (oFF.XStringUtils.isNotNullAndNotEmpty(system))
	{
		config.setSystemName(system);
	}
	var inaDataSource = inaStructure.getStructureByKey("DataSource");
	if (oFF.notNull(inaDataSource))
	{
		var dataSource = importer.importDataSource(inaDataSource);
		config.setDataSource(dataSource);
	}
	return config;
};
oFF.QInARepoServiceConfig.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var config = modelComponent;
	inaStructure.putStringNotNullAndNotEmpty("System", config.getSystemName());
	var inaDataSource = exporter.exportDataSource(config.getDataSource(), false);
	inaStructure.putNotNullAndNotEmpty("DataSource", inaDataSource);
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, config, inaStructure, flags);
};

oFF.QInARepoSort = function() {};
oFF.QInARepoSort.prototype = new oFF.QInARepository();
oFF.QInARepoSort.prototype._ff_c = "QInARepoSort";

oFF.QInARepoSort.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.SORT_MANAGER;
};
oFF.QInARepoSort.prototype.getTagName = function()
{
	return "SortRepo";
};
oFF.QInARepoSort.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var sortingManager = modelComponent;
	var inaList = inaStructure.getListByKey("Elements");
	var sortingOperations = sortingManager.getSortingOperations();
	sortingOperations.clear();
	if (oFF.notNull(inaList))
	{
		for (var sortIdx = 0; sortIdx < inaList.size(); sortIdx++)
		{
			var inaSort = inaList.getStructureAt(sortIdx);
			var sortingOp = importer.importComponent(oFF.OlapComponentType.GENERIC_SORTING, inaSort, null, sortingManager, context);
			if (oFF.notNull(sortingOp))
			{
				sortingOperations.add(sortingOp);
			}
		}
	}
	return sortingManager;
};
oFF.QInARepoSort.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var sortingManager = modelComponent;
	var inaSortOps = inaStructure.putNewList("Elements");
	var sortingOperations = sortingManager.getSortingOperations();
	for (var i = 0; i < sortingOperations.size(); i++)
	{
		var sorting = sortingOperations.get(i);
		var isUdhDimension = sorting.supportsDimension() && sorting.getDimension() !== null && sorting.getDimension().isUniversalDisplayHierarchyDimension();
		if (!isUdhDimension)
		{
			inaSortOps.add(exporter.exportComponent(null, sorting, null, flags));
		}
	}
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};

oFF.QInARepoSortOperation = function() {};
oFF.QInARepoSortOperation.prototype = new oFF.QInARepository();
oFF.QInARepoSortOperation.prototype._ff_c = "QInARepoSortOperation";

oFF.QInARepoSortOperation.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.GENERIC_SORTING;
};
oFF.QInARepoSortOperation.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var parent = parentComponent;
	var sortingManager = null;
	if (parent.getOlapComponentType() === oFF.OlapComponentType.COMPONENT_LIST)
	{
		parent = parent.getParent();
	}
	if (parent.getOlapComponentType() === oFF.OlapComponentType.SORT_MANAGER)
	{
		sortingManager = parent;
	}
	var sortingOp = null;
	if (oFF.notNull(sortingManager))
	{
		var queryModel = context.getQueryModel();
		var modelCapabilities = queryModel.getModelCapabilities();
		var inaSortType = inaStructure.getStringByKey("SortType");
		var sortType = oFF.QInAConverter.lookupSortType(inaSortType);
		if (sortType === oFF.SortType.FIELD)
		{
			sortingOp = this.importFieldSorting(inaStructure, sortingManager, queryModel);
		}
		else if (sortType === oFF.SortType.MEASURE)
		{
			sortingOp = this.importMeasureSorting(inaStructure, sortingManager, queryModel);
		}
		else if (sortType === oFF.SortType.DATA_CELL_VALUE || sortType === oFF.SortType.COMPLEX && (modelCapabilities.supportsComplexSorting() || modelCapabilities.supportsDataCellSorting()))
		{
			sortingOp = this.importPathSorting(importer, inaStructure, context, sortingManager, queryModel, sortType);
		}
		else
		{
			sortingOp = this.importDimensionSorting(inaStructure, sortingManager, queryModel, sortType);
		}
		if (oFF.notNull(sortingOp))
		{
			this.importGenericSorting(importer, inaStructure, sortingOp, queryModel);
		}
	}
	return sortingOp;
};
oFF.QInARepoSortOperation.prototype.importGenericSorting = function(importer, inaStructure, sortingOp, queryModel)
{
	var inaDirection = inaStructure.getStringByKey("Direction");
	if (oFF.notNull(inaDirection))
	{
		var sortDirection = oFF.QInAConverter.lookupSortDirection2(inaDirection);
		if (oFF.notNull(sortDirection))
		{
			sortingOp.setDirection(sortDirection);
		}
	}
	if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || inaStructure.containsKey("PreserveGrouping"))
	{
		if (sortingOp.supportsPreserveGrouping() && sortingOp.supportsBreakGrouping())
		{
			sortingOp.setPreserveGrouping(inaStructure.getBooleanByKeyExt("PreserveGrouping", false));
		}
	}
	if (sortingOp.supportsDimension())
	{
		var dimName = inaStructure.getStringByKey("Dimension");
		if (oFF.isNull(dimName))
		{
			sortingOp.setDimension(null);
		}
		else
		{
			sortingOp.setDimension(queryModel.getDimensionByNameFromExistingMetadata(dimName));
		}
	}
	if (sortingOp.getModelCapabilities().supportsLocaleSorting())
	{
		var inaCollator = inaStructure.getStructureByKey("Collator");
		if (oFF.notNull(inaCollator))
		{
			if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || inaCollator.containsKey("CaseSensitive"))
			{
				sortingOp.setIsCaseSensitive(inaCollator.getBooleanByKeyExt("CaseSensitive", false));
			}
			sortingOp.setLocale(inaCollator.getStringByKeyExt("Locale", null));
		}
	}
	if (queryModel.getModelCapabilities().supportsPersistedInA() && importer.getOriginalMode() === oFF.QModelFormat.INA_CLONE && !inaStructure.getBooleanByKeyExt("ExportInPersistedInA", false))
	{
		sortingOp.setCreatedFromMetadata(true);
	}
};
oFF.QInARepoSortOperation.prototype.importDimensionSorting = function(inaStructure, sortingManager, queryModel, sortType)
{
	var dimensionName = inaStructure.getStringByKey("Dimension");
	var modelCapabilities = queryModel.getModelCapabilities();
	if (oFF.XStringUtils.isNotNullAndNotEmpty(dimensionName))
	{
		var dimension = queryModel.getDimensionByNameFromExistingMetadata(dimensionName);
		if (modelCapabilities.supportsDimensionSorting(dimension, sortType))
		{
			var dimensionSorting = sortingManager.newDimensionSorting(dimension);
			if (oFF.isNull(dimensionSorting))
			{
				return null;
			}
			if (sortType === oFF.SortType.FILTER)
			{
				dimensionSorting.setSortByFilter();
			}
			else if (sortType === oFF.SortType.MEMBER_KEY)
			{
				dimensionSorting.setSortByKey();
				dimensionSorting.setCustomSort(this.getCustomSortOrder(inaStructure));
				dimensionSorting.setCustomSortPosition(this.getCustomSortPosition(inaStructure));
			}
			else if (sortType === oFF.SortType.MEMBER_TEXT)
			{
				dimensionSorting.setSortByText();
			}
			else if (sortType === oFF.SortType.HIERARCHY)
			{
				dimensionSorting.setSortByHierarchy();
			}
			return dimensionSorting;
		}
	}
	return null;
};
oFF.QInARepoSortOperation.prototype.importPathSorting = function(importer, inaStructure, context, sortingManager, queryModel, sortType)
{
	var inaPath = inaStructure.getListByKey("SortTuple");
	if (inaPath.isEmpty())
	{
		return null;
	}
	var path = oFF.XList.create();
	for (var idxStruct = 0; idxStruct < inaPath.size(); idxStruct++)
	{
		var pathElement = inaPath.getStructureAt(idxStruct);
		var fieldName = pathElement.getStringByKey("FieldName");
		var inaValue = pathElement.getStringByKey("Value");
		if (oFF.isNull(fieldName) || oFF.isNull(inaValue))
		{
			return null;
		}
		var field = queryModel.getFieldByName(fieldName);
		if (oFF.isNull(field))
		{
			return null;
		}
		var inaHierarchyName = pathElement.getStringByKey("Hierarchy");
		var dimElement = oFF.QSelectValue._createDimensionElement2(context, field, inaHierarchyName, inaValue);
		oFF.QInAImportUtil.importComponentTagging(importer, pathElement, dimElement);
		path.add(dimElement);
	}
	var complexSorting = null;
	if (sortType === oFF.SortType.DATA_CELL_VALUE)
	{
		complexSorting = sortingManager.newDataCellSorting(path);
	}
	else
	{
		complexSorting = sortingManager.newComplexSorting(path);
	}
	var usedInRanking = inaStructure.getBooleanByKeyExt("SortOperationUsedInRanking", false);
	if (usedInRanking)
	{
		complexSorting.setUsedInRanking(true);
	}
	return complexSorting;
};
oFF.QInARepoSortOperation.prototype.importMeasureSorting = function(inaStructure, sortingManager, queryModel)
{
	var measureSorting = null;
	var modelCapabilities = queryModel.getModelCapabilities();
	var measureName = inaStructure.getStringByKey("MeasureName");
	if (oFF.notNull(measureName))
	{
		var measureStructure = queryModel.getMeasureDimension();
		var measure = measureStructure.getStructureMember(measureName);
		if (oFF.isNull(measure))
		{
			measure = queryModel.getOlapEnv().getClientQueryObjectManager().getStructuredMember(measureName, queryModel.getQueryManager().getClientQueryObjectStorageName(), true);
		}
		if (oFF.notNull(measure) && modelCapabilities.supportsMeasureSorting())
		{
			measureSorting = sortingManager.newMeasureSorting(measure);
		}
		var structureName = inaStructure.getStringByKey("StructureName");
		var structure = queryModel.getNonMeasureDimension();
		if (oFF.notNull(structureName) && oFF.notNull(structure) && oFF.notNull(measureSorting))
		{
			measureSorting.setSecondaryMeasure(structure.getStructureMember(structureName));
		}
	}
	return measureSorting;
};
oFF.QInARepoSortOperation.prototype.importFieldSorting = function(inaStructure, sortingManager, queryModel)
{
	var fieldSorting = null;
	var fieldName = inaStructure.getStringByKey("FieldName");
	if (oFF.notNull(fieldName))
	{
		var field = queryModel.getFieldByName(fieldName);
		var modelCapabilities = queryModel.getModelCapabilities();
		if (oFF.notNull(field) && modelCapabilities.supportsFieldSorting(field))
		{
			fieldSorting = sortingManager.newFieldSorting(field);
			fieldSorting.setCustomSort(this.getCustomSortOrder(inaStructure));
			fieldSorting.setCustomSortPosition(this.getCustomSortPosition(inaStructure));
		}
	}
	return fieldSorting;
};
oFF.QInARepoSortOperation.prototype.getCustomSortPosition = function(inaStructure)
{
	var customSortPosition = inaStructure.getStringByKey("CustomSortPosition");
	if (oFF.notNull(customSortPosition))
	{
		return oFF.CustomSortPosition.lookup(customSortPosition);
	}
	return null;
};
oFF.QInARepoSortOperation.prototype.getCustomSortOrder = function(inaStructure)
{
	var customOrderList = inaStructure.getListByKey("CustomSort");
	if (oFF.notNull(customOrderList) && customOrderList.hasElements())
	{
		return oFF.PrUtils.asListOfString(customOrderList);
	}
	return null;
};
oFF.QInARepoSortOperation.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var sortingOp = modelComponent;
	var sortingType = sortingOp.getSortingType();
	this.exportGenericSorting(exporter, inaStructure, sortingOp, sortingType);
	if (sortingType === oFF.SortType.FIELD)
	{
		this.exportFieldSorting(inaStructure, sortingOp);
	}
	else if (sortingType === oFF.SortType.MEASURE)
	{
		this.exportMeasureSorting(inaStructure, sortingOp);
	}
	else if (sortingType === oFF.SortType.DATA_CELL_VALUE || sortingType === oFF.SortType.COMPLEX)
	{
		this.exportPathSorting(exporter, inaStructure, sortingOp);
	}
	else if (sortingType === oFF.SortType.MEMBER_KEY)
	{
		var measureDimensionSorting = sortingOp;
		this.exportCustomSortDetails(measureDimensionSorting.getCustomSort(), measureDimensionSorting.getCustomSortPosition(), inaStructure);
	}
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};
oFF.QInARepoSortOperation.prototype.exportFieldSorting = function(inaStructure, sortingOp)
{
	var fieldSorting = sortingOp;
	inaStructure.putString("FieldName", fieldSorting.getField().getName());
	this.exportCustomSortDetails(fieldSorting.getCustomSort(), fieldSorting.getCustomSortPosition(), inaStructure);
};
oFF.QInARepoSortOperation.prototype.exportCustomSortDetails = function(customOrder, customSortPosition, inaStructure)
{
	if (oFF.XCollectionUtils.hasElements(customOrder))
	{
		var customOrderList = inaStructure.putNewList("CustomSort");
		var customOrderSize = customOrder.size();
		for (var customOrderIndex = 0; customOrderIndex < customOrderSize; customOrderIndex++)
		{
			customOrderList.addString(customOrder.get(customOrderIndex));
		}
	}
	oFF.QInARepoUtils.setNameIfNotNull(inaStructure, "CustomSortPosition", customSortPosition);
};
oFF.QInARepoSortOperation.prototype.exportGenericSorting = function(exporter, inaStructure, sortingOp, sortingType)
{
	var inaSortType = oFF.QInAConverter.lookupSortTypeInA(sortingType);
	inaStructure.putString("SortType", inaSortType);
	var direction = sortingOp.getDirection();
	if (direction !== oFF.XSortDirection.DEFAULT_VALUE)
	{
		inaStructure.putString("Direction", oFF.QInAConverter.lookupSortDirectionInA2(direction));
	}
	if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || sortingOp.hasPropertyChanged(oFF.QSortProperties.QY_PRESERVE_GROUPING))
	{
		if (sortingOp.supportsPreserveGrouping() && sortingOp.supportsBreakGrouping())
		{
			inaStructure.putBoolean("PreserveGrouping", sortingOp.isPreserveGroupingEnabled());
		}
	}
	if (sortingOp.getModelCapabilities().supportsLocaleSorting())
	{
		var inaCollator = oFF.PrFactory.createStructure();
		if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || sortingOp.hasPropertyChanged(oFF.QSortProperties.QY_CASE_SENSITIVE))
		{
			inaCollator.putBoolean("CaseSensitive", sortingOp.isCaseSensitive());
		}
		inaCollator.putString("Locale", sortingOp.getLocale());
		inaStructure.put("Collator", inaCollator);
	}
	if (sortingOp.supportsDimension())
	{
		oFF.QInARepoUtils.setNameIfNotNull(inaStructure, "Dimension", sortingOp.getDimension());
	}
	if (sortingOp.getModelCapabilities().supportsPersistedInA() && exporter.getOriginalMode() === oFF.QModelFormat.INA_CLONE && (!sortingOp.isCreatedFromMetadata() || sortingOp.getModCounter() > 0))
	{
		inaStructure.putBoolean("ExportInPersistedInA", true);
	}
};
oFF.QInARepoSortOperation.prototype.exportPathSorting = function(exporter, inaStructure, sortingOp)
{
	var pathOperation = sortingOp;
	var inaPath = inaStructure.putNewList("SortTuple");
	var elementPath = pathOperation.getElementPath();
	var size = elementPath.size();
	for (var i = 0; i < size; i++)
	{
		var dimElement = elementPath.get(i);
		var inaPathElement = inaPath.addNewStructure();
		inaPathElement.putString("FieldName", dimElement.getSelectField().getName());
		inaPathElement.putString("Value", dimElement.getSelectValue());
		var selectHierarchyName = dimElement.getSelectHierarchyName();
		if (oFF.XStringUtils.isNotNullAndNotEmpty(selectHierarchyName))
		{
			inaPathElement.putString("Hierarchy", selectHierarchyName);
		}
		oFF.QInARepoUtils.extendStructureWithTagging(exporter, dimElement, inaPathElement);
	}
	if (sortingOp.usedInRanking())
	{
		inaStructure.putBoolean("SortOperationUsedInRanking", true);
	}
};
oFF.QInARepoSortOperation.prototype.exportMeasureSorting = function(inaStructure, sortingOp)
{
	var measureSorting = sortingOp;
	var measureName = measureSorting.getMeasure().getName();
	inaStructure.putString("MeasureName", measureName);
	oFF.QInARepoUtils.setNameIfNotNull(inaStructure, "StructureName", measureSorting.getSecondaryMeasure());
};

oFF.QInARepoTotals = function() {};
oFF.QInARepoTotals.prototype = new oFF.QInARepository();
oFF.QInARepoTotals.prototype._ff_c = "QInARepoTotals";

oFF.QInARepoTotals.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.TOTALS;
};
oFF.QInARepoTotals.prototype.getTagName = function()
{
	return "ResultStructureRepo";
};
oFF.QInARepoTotals.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var rc = modelComponent;
	if (rc.supportsTotals())
	{
		if (oFF.notNull(inaStructure))
		{
			var rsAlignment = null;
			if (rc.supportsResultAlignment())
			{
				var inaAlignment = inaStructure.getStringByKey("ResultAlignment");
				if (oFF.XString.isEqual("Default", inaAlignment))
				{
					rc.restoreTotalsAlignment(oFF.RestoreAction.DEFAULT_VALUE, false);
				}
				else
				{
					rsAlignment = oFF.QInAConverter.lookupAlignment(inaAlignment);
					rc.setResultAlignmentBase(rsAlignment, false);
				}
			}
			if (rsAlignment === oFF.ResultAlignment.STRUCTURE)
			{
				var inaResultStructure = inaStructure.getListByKey("ResultStructure");
				if (oFF.notNull(inaResultStructure))
				{
					var advancedResultStructure = rc.getAdvancedResultStructure();
					advancedResultStructure.clear();
					for (var i = 0; i < inaResultStructure.size(); i++)
					{
						var inaElement = inaResultStructure.getStructureAt(i);
						var inaResult = inaElement.getStringByKey("Result");
						var result = oFF.QInAConverter.lookupResultStructureElement(inaResult);
						var resultSetVisibility = oFF.QInAConverter.lookupResultSetVisibility(inaElement.getStringByKey("Visibility"));
						advancedResultStructure.addWithVisibility(result, resultSetVisibility);
					}
				}
			}
			else
			{
				if (rc.supportsResultVisibility())
				{
					var inaVisibility = inaStructure.getStringByKey("Visibility");
					if (oFF.XString.isEqual("Default", inaVisibility))
					{
						rc.restoreTotalsVisibility(oFF.RestoreAction.DEFAULT_VALUE, false);
					}
					else
					{
						var inaVisibilitySettings = inaStructure.getListByKey("VisibilitySettings");
						if (oFF.isNull(inaVisibilitySettings))
						{
							var visibility = oFF.QInAConverter.lookupResultSetVisibility(inaVisibility);
							rc.setResultVisibility(visibility);
						}
						else
						{
							rc.clearResultVisibilitySettings();
							for (var k = 0; k < inaVisibilitySettings.size(); k++)
							{
								var inaTriplet = inaVisibilitySettings.getStructureAt(k);
								var alignment = oFF.QInAConverter.lookupAlignment(inaTriplet.getStringByKey("ResultAlignment"));
								var element = oFF.QInAConverter.lookupResultStructureElement(inaTriplet.getStringByKey("Result"));
								var cvisibility = oFF.QInAConverter.lookupResultSetVisibility(inaTriplet.getStringByKey("Visibility"));
								rc.setResultVisibilityByElementAndAlignment(alignment, element, cvisibility);
							}
						}
					}
				}
			}
		}
	}
	return rc;
};
oFF.QInARepoTotals.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var rc = modelComponent;
	if (!rc.supportsTotals())
	{
		return null;
	}
	var resultAlignment = null;
	if (rc.supportsResultAlignment())
	{
		if (rc.isTotalsAlignmentOnDefault())
		{
			inaStructure.putString("ResultAlignment", "Default");
		}
		else
		{
			resultAlignment = rc.getResultAlignment();
			inaStructure.putString("ResultAlignment", oFF.QInAConverter.lookupAlignmentInA(resultAlignment));
		}
	}
	if (resultAlignment === oFF.ResultAlignment.STRUCTURE)
	{
		var structure = inaStructure.putNewList("ResultStructure");
		var resultStructure = rc.getTotalsStructure();
		if (oFF.notNull(resultStructure))
		{
			for (var i = 0; i < resultStructure.size(); i++)
			{
				var item = resultStructure.get(i);
				var resultStructureLine = structure.addNewStructure();
				var element = item.getResultStructureElement();
				resultStructureLine.putString("Result", oFF.QInAConverter.lookupResultStructureElementInA(element));
				var visibility = item.getResultVisibility();
				resultStructureLine.putString("Visibility", oFF.QInAConverter.lookupResultSetVisibilityInA(visibility));
			}
		}
	}
	else if (rc.supportsResultVisibility())
	{
		if (rc.isTotalsVisibilityOnDefault())
		{
			inaStructure.putString("Visibility", "Default");
		}
		else
		{
			var inaVisibility = oFF.QInAConverter.lookupResultSetVisibilityInA(rc.getResultVisibility());
			inaStructure.putString("Visibility", inaVisibility);
			var settings = rc.getResultVisibilitySettings();
			if (oFF.notNull(settings))
			{
				var inaVisibilitySettings = inaStructure.putNewList("VisibilitySettings");
				while (settings.hasNext())
				{
					var triplet = settings.next();
					var inaTriplet = inaVisibilitySettings.addNewStructure();
					inaTriplet.putString("ResultAlignment", oFF.QInAConverter.lookupAlignmentInA(triplet.getAlignment()));
					inaTriplet.putString("Result", oFF.QInAConverter.lookupResultStructureElementInA(triplet.getElement()));
					inaTriplet.putString("Visibility", oFF.QInAConverter.lookupResultSetVisibilityInA(triplet.getVisibility()));
				}
				oFF.XObjectExt.release(settings);
			}
		}
	}
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};

oFF.QInARepoTranslationsManager = function() {};
oFF.QInARepoTranslationsManager.prototype = new oFF.QInARepository();
oFF.QInARepoTranslationsManager.prototype._ff_c = "QInARepoTranslationsManager";

oFF.QInARepoTranslationsManager.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.MEASURE_TRANSLATIONS;
};
oFF.QInARepoTranslationsManager.prototype.getTagName = function()
{
	return "Translations";
};
oFF.QInARepoTranslationsManager.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var currencyTranslationManagerBase = modelComponent;
	if (oFF.notNull(inaStructure) && inaStructure.containsKey("CurrencyTranslations"))
	{
		var inaList = inaStructure.getListByKey("CurrencyTranslations");
		if (oFF.notNull(inaList))
		{
			if (oFF.notNull(currencyTranslationManagerBase) && oFF.XCollectionUtils.hasElements(inaList))
			{
				var size = inaList.size();
				for (var i = 0; i < size; i++)
				{
					var inaSpecificCurrencyTranslation = inaList.getStructureAt(i);
					var name = inaSpecificCurrencyTranslation.getStringByKey("Name");
					var description = inaSpecificCurrencyTranslation.getStringByKey("Description");
					var currencyTranslation = currencyTranslationManagerBase.getMeasureCurrencyTranslation(name);
					if (oFF.isNull(currencyTranslation))
					{
						currencyTranslation = currencyTranslationManagerBase.addNewMeasureCurrencyTranslationBase(name, description);
					}
					importer.importCurrencyTranslationElement(inaSpecificCurrencyTranslation, currencyTranslation, context);
				}
			}
		}
	}
	return currencyTranslationManagerBase;
};
oFF.QInARepoTranslationsManager.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};

oFF.QInARepoUniversalDisplayHierarchies = function() {};
oFF.QInARepoUniversalDisplayHierarchies.prototype = new oFF.QInARepository();
oFF.QInARepoUniversalDisplayHierarchies.prototype._ff_c = "QInARepoUniversalDisplayHierarchies";

oFF.QInARepoUniversalDisplayHierarchies.assignAxesToHierarchies = function(universalDisplayHierarchies)
{
	var queryModel = universalDisplayHierarchies.getQueryModel();
	var hierarchies = universalDisplayHierarchies.getHierarchies();
	var assignedAxisTypes = oFF.XList.create();
	var size = hierarchies.size();
	for (var i = 0; i < size; i++)
	{
		var udh = hierarchies.get(i);
		if (udh.getHierarchyDedicatedAxis() !== null)
		{
			assignedAxisTypes.add(udh.getHierarchyDedicatedAxis().getType());
			continue;
		}
		var axis = oFF.QInARepoUniversalDisplayHierarchies.getAxisForDimensionList(udh.getDimensionNames(), queryModel);
		if (oFF.notNull(axis) && !assignedAxisTypes.contains(axis.getType()))
		{
			udh.setAxis(axis);
			assignedAxisTypes.add(axis.getType());
		}
	}
	for (var k = 0; k < size; k++)
	{
		var hierarchy = hierarchies.get(k);
		if (hierarchy.getHierarchyDedicatedAxis() === null)
		{
			hierarchy.setAxis(assignedAxisTypes.contains(oFF.AxisType.ROWS) ? queryModel.getColumnsAxis() : queryModel.getRowsAxis());
		}
	}
};
oFF.QInARepoUniversalDisplayHierarchies.getAxisForDimensionList = function(dimensions, queryModel)
{
	if (oFF.notNull(dimensions))
	{
		for (var i = 0; i < dimensions.size(); i++)
		{
			var dimension = queryModel.getDimensionByNameFromExistingMetadata(dimensions.get(i));
			if (oFF.notNull(dimension))
			{
				var axisType = dimension.getAxisType();
				if (axisType === oFF.AxisType.ROWS || axisType === oFF.AxisType.COLUMNS)
				{
					return dimension.getAxis();
				}
			}
		}
	}
	return null;
};
oFF.QInARepoUniversalDisplayHierarchies.importHierarchy = function(importer, universalDisplayHierarchies, hierarchy)
{
	var dimensionNames = null;
	var initialDrillLevel = 0;
	var alignment = oFF.Alignment.DEFAULT_VALUE;
	var active = false;
	var name = hierarchy.getStringByKey("Name");
	var existingHierarchy = universalDisplayHierarchies.getByName(name);
	if (oFF.notNull(existingHierarchy))
	{
		active = existingHierarchy.isActive();
		alignment = existingHierarchy.getAlignment();
		initialDrillLevel = existingHierarchy.getInitialDrillLevel();
		dimensionNames = existingHierarchy.getDimensionNames();
	}
	if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || hierarchy.containsKey("Active"))
	{
		active = hierarchy.getBooleanByKeyExt("Active", false);
	}
	if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || hierarchy.containsKey("LowerLevelNodeAlignment"))
	{
		alignment = oFF.QInAConverter.lookupLowerLevelNodeAlignment(hierarchy.getStringByKey("LowerLevelNodeAlignment"));
	}
	if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || hierarchy.containsKey("InitialDrillLevel"))
	{
		initialDrillLevel = hierarchy.getIntegerByKey("InitialDrillLevel");
	}
	if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || hierarchy.containsKey("DimensionNames"))
	{
		var hierarchyDimensions = hierarchy.getListByKey("DimensionNames");
		dimensionNames = oFF.PrUtils.asListOfString(hierarchyDimensions);
	}
	var customDimensions = hierarchy.getBooleanByKeyExt("CustomDimensions", false);
	if (importer.getMode() !== oFF.QModelFormat.INA_REPOSITORY_DELTA || oFF.notNull(existingHierarchy))
	{
		oFF.XObjectExt.assertNotNull(dimensionNames);
		universalDisplayHierarchies.addHierarchy(name, dimensionNames, initialDrillLevel, alignment, active, null, customDimensions);
	}
};
oFF.QInARepoUniversalDisplayHierarchies.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.UNIVERSAL_DISPLAY_HIERARCHIES;
};
oFF.QInARepoUniversalDisplayHierarchies.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var universalDisplayHierarchies = modelComponent;
	if (oFF.notNull(inaStructure))
	{
		var hierarchiesStructure = inaStructure.getByKey("UniversalDisplayHierarchies");
		if (oFF.notNull(hierarchiesStructure) && hierarchiesStructure.isList())
		{
			var hierarchies = hierarchiesStructure;
			var size = hierarchies.size();
			for (var i = 0; i < size; i++)
			{
				oFF.QInARepoUniversalDisplayHierarchies.importHierarchy(importer, universalDisplayHierarchies, hierarchies.getStructureAt(i));
			}
		}
	}
	oFF.QInARepoUniversalDisplayHierarchies.assignAxesToHierarchies(universalDisplayHierarchies);
	return universalDisplayHierarchies;
};
oFF.QInARepoUniversalDisplayHierarchies.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var universalDisplayHierarchies = modelComponent;
	if (oFF.notNull(universalDisplayHierarchies))
	{
		universalDisplayHierarchies.updateIncludedDimensions();
		var udhIterator = universalDisplayHierarchies.getChildrenIterator();
		if (udhIterator.hasNext())
		{
			var udhStructure = inaStructure.putNewList("UniversalDisplayHierarchies");
			while (udhIterator.hasNext())
			{
				var hierarchy = udhIterator.next();
				var shouldContinueExporting = exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || hierarchy.getModCounter() > 0;
				if (shouldContinueExporting)
				{
					this.exportHierarchy(exporter, udhStructure, hierarchy);
				}
			}
		}
	}
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};
oFF.QInARepoUniversalDisplayHierarchies.prototype.exportHierarchy = function(exporter, udhStructure, hierarchy)
{
	var dimensionListValid = true;
	if (hierarchy.isActive() && !hierarchy.isDimensionListValid())
	{
		dimensionListValid = false;
		exporter.addError(oFF.ErrorCodes.INVALID_STATE, oFF.XStringUtils.concatenate3("Dimensions for UDH '", hierarchy.getName(), "' must be placed next to each other on the axis"));
	}
	var hierarchyStructure = udhStructure.addNewStructure();
	hierarchyStructure.putString("Name", hierarchy.getName());
	if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || hierarchy.hasPropertyChanged(oFF.QUniversalDisplayHierarchyProperties.QY_INITIAL_DRILL_LEVEL))
	{
		hierarchyStructure.putInteger("InitialDrillLevel", hierarchy.getInitialDrillLevel());
	}
	if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || hierarchy.hasPropertyChanged(oFF.QUniversalDisplayHierarchyProperties.QY_LOWER_LEVEL_NODE_ALIGNMENT))
	{
		hierarchyStructure.putString("LowerLevelNodeAlignment", hierarchy.getAlignment().getName());
	}
	if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || hierarchy.hasPropertyChanged(oFF.QUniversalDisplayHierarchyProperties.QY_ACTIVE))
	{
		hierarchyStructure.putBoolean("Active", hierarchy.isActive() && dimensionListValid);
	}
	if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || hierarchy.hasPropertyChanged(oFF.QUniversalDisplayHierarchyProperties.QY_DIMENSION_NAMES))
	{
		hierarchyStructure.putNewList("DimensionNames").addAllStrings(hierarchy.getDimensionNames());
	}
	if (hierarchy.hasCustomDimensions())
	{
		hierarchyStructure.putBoolean("CustomDimensions", true);
	}
};

oFF.QInARepoVarDimMember = function() {};
oFF.QInARepoVarDimMember.prototype = new oFF.QInARepository();
oFF.QInARepoVarDimMember.prototype._ff_c = "QInARepoVarDimMember";

oFF.QInARepoVarDimMember.prototype.getComponentType = function()
{
	return oFF.VariableType.DIMENSION_MEMBER_VARIABLE;
};
oFF.QInARepoVarDimMember.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var memberVariable = modelComponent;
	var skipExitSelection = memberVariable.isEnforcedDynamicValue() && memberVariable.getQueryManager().isSuppressExitVariableValuesInRepoMode();
	if (!skipExitSelection)
	{
		var inaFilterElement = inaStructure.getStructureByKey("Selection");
		if (oFF.isNull(inaFilterElement))
		{
			memberVariable.setMemberFilter(null);
		}
		else
		{
			var filterElement = importer.importComponent(null, inaFilterElement, null, memberVariable, context);
			memberVariable.setMemberFilter(filterElement);
		}
	}
	return memberVariable;
};
oFF.QInARepoVarDimMember.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var memberVariable = modelComponent;
	inaStructure.putString("Name", memberVariable.getName());
	var skipExitSelection = memberVariable.isEnforcedDynamicValue() && memberVariable.getQueryManager().isSuppressExitVariableValuesInRepoMode();
	if (memberVariable.hasMemberFilter() && !skipExitSelection)
	{
		var memberSelection = memberVariable.getMemberFilter();
		var memberSelectionComponent = exporter.exportComponent(null, memberSelection, null, flags);
		if (oFF.notNull(memberSelectionComponent))
		{
			inaStructure.put("Selection", memberSelectionComponent);
		}
	}
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};

oFF.QInARepoVarOptionList = function() {};
oFF.QInARepoVarOptionList.prototype = new oFF.QInARepository();
oFF.QInARepoVarOptionList.prototype._ff_c = "QInARepoVarOptionList";

oFF.QInARepoVarOptionList.prototype.getComponentType = function()
{
	return oFF.VariableType.OPTION_LIST_VARIABLE;
};
oFF.QInARepoVarOptionList.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var optionListVariable = modelComponent;
	var inaOptionValues = inaStructure.getListByKey("OptionValues");
	if (oFF.notNull(inaOptionValues))
	{
		var currentOption;
		if (optionListVariable.supportsMultipleValues())
		{
			optionListVariable.clear();
			var len = inaOptionValues.size();
			for (var idxOption = 0; idxOption < len; idxOption++)
			{
				currentOption = inaOptionValues.getStringAt(idxOption);
				optionListVariable.addString(currentOption);
			}
		}
		else if (inaOptionValues.size() === 1)
		{
			currentOption = inaOptionValues.getStringAt(0);
			optionListVariable.setString(currentOption);
		}
	}
	return optionListVariable;
};
oFF.QInARepoVarOptionList.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var variable = modelComponent;
	inaStructure.putString("Name", variable.getName());
	var inaVariableOptionValues = inaStructure.putNewList("OptionValues");
	if (variable.supportsMultipleValues())
	{
		var multiOptionNames = variable.getValues();
		var len = multiOptionNames.size();
		for (var c = 0; c < len; c++)
		{
			var optionName = multiOptionNames.get(c);
			inaVariableOptionValues.addString(optionName.getString());
		}
	}
	else
	{
		var currentOption = variable.getCurrentOption();
		if (oFF.notNull(currentOption))
		{
			inaVariableOptionValues.addString(currentOption.getName());
		}
	}
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};

oFF.QInARepoVarSimpleType = function() {};
oFF.QInARepoVarSimpleType.prototype = new oFF.QInARepository();
oFF.QInARepoVarSimpleType.prototype._ff_c = "QInARepoVarSimpleType";

oFF.QInARepoVarSimpleType.prototype.getComponentType = function()
{
	return oFF.VariableType.SIMPLE_TYPE_VARIABLE;
};
oFF.QInARepoVarSimpleType.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var simpleTypeVariable = modelComponent;
	simpleTypeVariable.clear();
	var valueType = simpleTypeVariable.getValueType();
	if (valueType.isNumber())
	{
		this.importNumericValues(importer, inaStructure, simpleTypeVariable, valueType);
	}
	else if (valueType.isString())
	{
		this.importStringValues(inaStructure, simpleTypeVariable);
	}
	else if (valueType === oFF.XValueType.DATE)
	{
		this.importDateValues(importer, inaStructure, simpleTypeVariable);
	}
	else if (valueType === oFF.XValueType.TIME)
	{
		this.importTimeValues(importer, inaStructure, simpleTypeVariable);
	}
	else if (valueType === oFF.XValueType.DATE_TIME)
	{
		this.importDateTimeValues(importer, inaStructure, simpleTypeVariable);
	}
	else if (valueType === oFF.XValueType.BOOLEAN)
	{
		this.importBooleanValues(inaStructure, simpleTypeVariable);
	}
	return simpleTypeVariable;
};
oFF.QInARepoVarSimpleType.prototype.getFirstValueAsString = function(values)
{
	var element = values.get(0);
	if (oFF.notNull(element) && element.isString())
	{
		return element.getString();
	}
	return null;
};
oFF.QInARepoVarSimpleType.prototype.importDateTimeValues = function(importer, inaStructure, simpleTypeVariable)
{
	var inaSimpleDateTimeValues = inaStructure.getListByKey("SimpleStringValues");
	if (oFF.notNull(inaSimpleDateTimeValues))
	{
		var sizeValue = inaSimpleDateTimeValues.size();
		if (simpleTypeVariable.supportsMultipleValues())
		{
			for (var idxValue = 0; idxValue < sizeValue; idxValue++)
			{
				var dateTimeValue = inaSimpleDateTimeValues.getStringAt(idxValue);
				if (oFF.XStringUtils.isNotNullAndNotEmpty(dateTimeValue))
				{
					simpleTypeVariable.addDateTime(oFF.XDateTime.createDateTimeFromStringWithFlag(dateTimeValue, importer.capabilities.supportsSapDate()));
				}
			}
		}
		else if (sizeValue === 1)
		{
			var dateTimeValue2 = this.getFirstValueAsString(inaSimpleDateTimeValues);
			if (oFF.XStringUtils.isNotNullAndNotEmpty(dateTimeValue2))
			{
				simpleTypeVariable.setDateTime(oFF.XDateTime.createDateTimeFromStringWithFlag(dateTimeValue2, importer.capabilities.supportsSapDate()));
			}
		}
	}
};
oFF.QInARepoVarSimpleType.prototype.importTimeValues = function(importer, inaStructure, simpleTypeVariable)
{
	var inaSimpleTimeValues = inaStructure.getListByKey("SimpleStringValues");
	if (oFF.notNull(inaSimpleTimeValues))
	{
		var sizeValue = inaSimpleTimeValues.size();
		if (simpleTypeVariable.supportsMultipleValues())
		{
			for (var idxValue = 0; idxValue < sizeValue; idxValue++)
			{
				var timeValue = inaSimpleTimeValues.getStringAt(idxValue);
				if (oFF.XStringUtils.isNotNullAndNotEmpty(timeValue))
				{
					simpleTypeVariable.addTime(oFF.XTime.createTimeFromStringWithFlag(timeValue, importer.capabilities.supportsSapDate()));
				}
			}
		}
		else if (sizeValue === 1)
		{
			var timeValue2 = this.getFirstValueAsString(inaSimpleTimeValues);
			if (oFF.XStringUtils.isNotNullAndNotEmpty(timeValue2))
			{
				simpleTypeVariable.setTime(oFF.XTime.createTimeFromStringWithFlag(timeValue2, importer.capabilities.supportsSapDate()));
			}
		}
	}
};
oFF.QInARepoVarSimpleType.prototype.importDateValues = function(importer, inaStructure, simpleTypeVariable)
{
	var inaSimpleDateValues = inaStructure.getListByKey("SimpleStringValues");
	if (oFF.notNull(inaSimpleDateValues))
	{
		var sizeValue = inaSimpleDateValues.size();
		if (simpleTypeVariable.supportsMultipleValues())
		{
			for (var idxValue = 0; idxValue < sizeValue; idxValue++)
			{
				var dateValue = inaSimpleDateValues.getStringAt(idxValue);
				if (oFF.XStringUtils.isNotNullAndNotEmpty(dateValue))
				{
					simpleTypeVariable.addDate(oFF.QInARepoUtils.createDate(dateValue));
				}
			}
		}
		else if (sizeValue === 1)
		{
			var dateValue2 = this.getFirstValueAsString(inaSimpleDateValues);
			if (oFF.XStringUtils.isNotNullAndNotEmpty(dateValue2))
			{
				simpleTypeVariable.setDate(oFF.QInARepoUtils.createDate(dateValue2));
			}
		}
	}
};
oFF.QInARepoVarSimpleType.prototype.importStringValues = function(inaStructure, simpleTypeVariable)
{
	var inaSimpleStringValues = inaStructure.getListByKey("SimpleStringValues");
	if (oFF.notNull(inaSimpleStringValues))
	{
		var sizeValue = inaSimpleStringValues.size();
		if (simpleTypeVariable.supportsMultipleValues())
		{
			for (var idxValue = 0; idxValue < sizeValue; idxValue++)
			{
				simpleTypeVariable.addString(inaSimpleStringValues.getStringAt(idxValue));
			}
		}
		else if (sizeValue === 1)
		{
			var element = inaSimpleStringValues.get(0);
			if (oFF.notNull(element) && element.isString())
			{
				simpleTypeVariable.setString(element.getString());
			}
		}
	}
};
oFF.QInARepoVarSimpleType.prototype.importBooleanValues = function(inaStructure, simpleTypeVariable)
{
	var inaSimpleBooleanValues = inaStructure.getListByKey("SimpleStringValues");
	if (oFF.notNull(inaSimpleBooleanValues))
	{
		var sizeValue = inaSimpleBooleanValues.size();
		if (simpleTypeVariable.supportsMultipleValues())
		{
			for (var idxValue = 0; idxValue < sizeValue; idxValue++)
			{
				simpleTypeVariable.addBoolean(inaSimpleBooleanValues.getBooleanAt(idxValue));
			}
		}
		else if (sizeValue === 1)
		{
			var element = inaSimpleBooleanValues.get(0);
			if (oFF.notNull(element) && element.isBoolean())
			{
				simpleTypeVariable.setBoolean(element.asBoolean().getBoolean());
			}
		}
	}
};
oFF.QInARepoVarSimpleType.prototype.importNumericString = function(simpleTypeVariable, valueType, stringValue)
{
	if (valueType === oFF.XValueType.INTEGER)
	{
		simpleTypeVariable.addInteger(oFF.XInteger.convertFromString(stringValue));
	}
	else if (valueType === oFF.XValueType.DOUBLE || valueType === oFF.XValueType.DECIMAL_FLOAT)
	{
		simpleTypeVariable.addDouble(oFF.XDouble.convertFromString(stringValue));
	}
	else if (valueType === oFF.XValueType.LONG)
	{
		simpleTypeVariable.addLong(oFF.XLong.convertFromString(stringValue));
	}
};
oFF.QInARepoVarSimpleType.prototype.addIntegerValue = function(exporter, simpleValues, intValue)
{
	if (exporter.capabilities.supportsNumberAsString() && !oFF.QInAExportUtil.isNumberSafe(intValue))
	{
		simpleValues.addString(oFF.XInteger.convertToString(intValue));
	}
	else
	{
		simpleValues.addInteger(intValue);
	}
};
oFF.QInARepoVarSimpleType.prototype.addLongValue = function(exporter, simpleValues, longValue)
{
	if (exporter.capabilities.supportsNumberAsString() && !oFF.QInAExportUtil.isNumberSafe(longValue))
	{
		simpleValues.addString(oFF.XLong.convertToString(longValue));
	}
	else
	{
		simpleValues.addLong(longValue);
	}
};
oFF.QInARepoVarSimpleType.prototype.addDoubleValue = function(exporter, simpleValues, doubleValue)
{
	if (exporter.capabilities.supportsNumberAsString() && !oFF.QInAExportUtil.isNumberSafe(doubleValue))
	{
		simpleValues.addString(oFF.XDouble.convertToString(doubleValue));
	}
	else
	{
		simpleValues.addDouble(doubleValue);
	}
};
oFF.QInARepoVarSimpleType.prototype.importNumericValues = function(importer, inaStructure, simpleTypeVariable, valueType)
{
	var inaSimpleNumericValues = inaStructure.getListByKey("SimpleNumericValues");
	if (oFF.notNull(inaSimpleNumericValues))
	{
		var sizeValue = inaSimpleNumericValues.size();
		if (simpleTypeVariable.supportsMultipleValues())
		{
			for (var idxValue = 0; idxValue < sizeValue; idxValue++)
			{
				var elementAt = inaSimpleNumericValues.get(idxValue);
				if (importer.capabilities.supportsNumberAsString() && oFF.notNull(elementAt) && elementAt.getType() === oFF.PrElementType.STRING)
				{
					this.importNumericString(simpleTypeVariable, valueType, inaSimpleNumericValues.getStringAt(idxValue));
					continue;
				}
				if (valueType === oFF.XValueType.INTEGER)
				{
					var integerValue = inaSimpleNumericValues.getIntegerAt(idxValue);
					simpleTypeVariable.addInteger(integerValue);
				}
				else if (valueType === oFF.XValueType.DOUBLE || valueType === oFF.XValueType.DECIMAL_FLOAT)
				{
					var doubleValue = inaSimpleNumericValues.getDoubleAt(idxValue);
					simpleTypeVariable.addDouble(doubleValue);
				}
				else if (valueType === oFF.XValueType.LONG)
				{
					var longValue = inaSimpleNumericValues.getLongAt(idxValue);
					simpleTypeVariable.addLong(longValue);
				}
			}
		}
		else if (sizeValue === 1)
		{
			var numericElement0 = inaSimpleNumericValues.get(0);
			if (oFF.notNull(numericElement0) && numericElement0.isNumeric())
			{
				if (valueType === oFF.XValueType.INTEGER)
				{
					simpleTypeVariable.setInteger(inaSimpleNumericValues.getIntegerAt(0));
				}
				else if (valueType === oFF.XValueType.DOUBLE)
				{
					simpleTypeVariable.setDouble(inaSimpleNumericValues.getDoubleAt(0));
				}
				else if (valueType === oFF.XValueType.DECIMAL_FLOAT)
				{
					simpleTypeVariable.setDecFloat(oFF.XDecFloatByDouble.create(inaSimpleNumericValues.getDoubleAt(0)));
				}
				else if (valueType === oFF.XValueType.LONG)
				{
					simpleTypeVariable.setLong(inaSimpleNumericValues.getLongAt(0));
				}
			}
		}
	}
};
oFF.QInARepoVarSimpleType.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var variable = modelComponent;
	inaStructure.putString("Name", variable.getName());
	var valueType = variable.getValueType();
	var simpleValues;
	if (valueType === oFF.XValueType.STRING || valueType === oFF.XValueType.DATE || valueType === oFF.XValueType.TIME || valueType === oFF.XValueType.DATE_TIME || valueType === oFF.XValueType.BOOLEAN || valueType.isSpatial())
	{
		simpleValues = inaStructure.putNewList("SimpleStringValues");
	}
	else if (valueType === oFF.XValueType.DOUBLE || valueType === oFF.XValueType.DECIMAL_FLOAT || valueType === oFF.XValueType.LONG || valueType === oFF.XValueType.INTEGER)
	{
		simpleValues = inaStructure.putNewList("SimpleNumericValues");
	}
	else
	{
		exporter.addError(oFF.ErrorCodes.INVALID_DATATYPE, oFF.XStringUtils.concatenate3("SimpleTypeVariable '", variable.getName(), "' not exported"));
		return null;
	}
	if (variable.supportsMultipleValues())
	{
		this.exportMultipleValues(exporter, variable, valueType, simpleValues);
	}
	else
	{
		this.exportSingleValue(exporter, variable, valueType, simpleValues);
	}
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};
oFF.QInARepoVarSimpleType.prototype.exportSingleValue = function(exporter, variable, valueType, simpleValues)
{
	var repoFormatAndNoValue = !variable.hasValue() && (exporter.getMode() === oFF.QModelFormat.INA_REPOSITORY || variable.getQueryModel().getSystemType().isTypeOf(oFF.SystemType.VIRTUAL_INA));
	if (valueType === oFF.XValueType.INTEGER)
	{
		if (repoFormatAndNoValue)
		{
			simpleValues.addNull();
		}
		else
		{
			this.addIntegerValue(exporter, simpleValues, variable.getInteger());
		}
	}
	else if (valueType === oFF.XValueType.LONG)
	{
		if (repoFormatAndNoValue)
		{
			simpleValues.addNull();
		}
		else
		{
			this.addLongValue(exporter, simpleValues, variable.getLong());
		}
	}
	else if (valueType === oFF.XValueType.BOOLEAN)
	{
		if (repoFormatAndNoValue)
		{
			simpleValues.addNull();
		}
		else
		{
			simpleValues.addBoolean(variable.getBoolean());
		}
	}
	else if (valueType === oFF.XValueType.DOUBLE || valueType === oFF.XValueType.DECIMAL_FLOAT)
	{
		if (repoFormatAndNoValue)
		{
			simpleValues.addNull();
		}
		else
		{
			this.addDoubleValue(exporter, simpleValues, variable.getDouble());
		}
	}
	else
	{
		if (variable.hasValue())
		{
			if (valueType === oFF.XValueType.STRING || valueType.isSpatial())
			{
				simpleValues.addString(variable.getString());
			}
			else if (valueType === oFF.XValueType.DATE)
			{
				simpleValues.addString(oFF.QInAExportUtil.dateTimeToString(exporter, variable.getDate()));
			}
			else if (valueType === oFF.XValueType.TIME)
			{
				simpleValues.addString(oFF.QInAExportUtil.dateTimeToString(exporter, variable.getTime()));
			}
			else if (valueType === oFF.XValueType.DATE_TIME)
			{
				simpleValues.addString(oFF.QInAExportUtil.dateTimeToString(exporter, variable.getDateTime()));
			}
		}
	}
};
oFF.QInARepoVarSimpleType.prototype.exportMultipleValues = function(exporter, variable, valueType, simpleValues)
{
	var multiValues = variable.getValues();
	var size = multiValues.size();
	for (var idx = 0; idx < size; idx++)
	{
		if (valueType === oFF.XValueType.INTEGER)
		{
			var intValue = multiValues.get(idx);
			this.addIntegerValue(exporter, simpleValues, intValue.getInteger());
		}
		else if (valueType === oFF.XValueType.LONG)
		{
			var longValue = multiValues.get(idx);
			this.addLongValue(exporter, simpleValues, longValue.getLong());
		}
		else if (valueType === oFF.XValueType.DOUBLE)
		{
			var doubleValue = multiValues.get(idx);
			this.addDoubleValue(exporter, simpleValues, doubleValue.getDouble());
		}
		else if (valueType === oFF.XValueType.DECIMAL_FLOAT)
		{
			var floatValue = multiValues.get(idx);
			this.addDoubleValue(exporter, simpleValues, floatValue.getDouble());
		}
		else if (valueType === oFF.XValueType.STRING)
		{
			var stringValue = multiValues.get(idx);
			simpleValues.addString(stringValue.getString());
		}
		else if (valueType === oFF.XValueType.DATE || valueType === oFF.XValueType.TIME || valueType === oFF.XValueType.DATE_TIME)
		{
			var dateValue = multiValues.get(idx);
			simpleValues.addString(oFF.QInAExportUtil.dateTimeToString(exporter, dateValue));
		}
		else if (valueType === oFF.XValueType.BOOLEAN)
		{
			var booleanValue = multiValues.get(idx);
			simpleValues.addString(oFF.XBoolean.convertToString(booleanValue.getBoolean()));
		}
		else if (valueType.isSpatial())
		{
			var spatialValue = multiValues.get(idx);
			simpleValues.addString(spatialValue.toWKT());
		}
	}
};

oFF.QInaRepoCustomHierarchyDefinition = function() {};
oFF.QInaRepoCustomHierarchyDefinition.prototype = new oFF.QInARepository();
oFF.QInaRepoCustomHierarchyDefinition.prototype._ff_c = "QInaRepoCustomHierarchyDefinition";

oFF.QInaRepoCustomHierarchyDefinition.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.CUSTOM_HIERARCHY_DEFINITION;
};
oFF.QInaRepoCustomHierarchyDefinition.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var hierarchyDefinition = null;
	var inaDimensions = oFF.PrUtils.getListProperty(inaStructure, "Dimensions");
	var inaDimension = oFF.PrUtils.getStructureElement(inaDimensions, 0);
	if (oFF.notNull(inaDimension))
	{
		var system = inaDimension.getStringByKey("System");
		var dataSource = inaDimension.getStringByKey("DataSource");
		var dimensionName = inaDimension.getStringByKey("Name");
		var inaHierarchy = inaDimension.getStructureByKey("Hierarchy");
		if (oFF.notNull(inaHierarchy) && oFF.XStringUtils.isNotNullAndNotEmpty(system) && oFF.XStringUtils.isNotNullAndNotEmpty(dimensionName))
		{
			var ignoreDatasource = true;
			var application = importer.getApplication();
			if (oFF.notNull(application))
			{
				var systemDescription = application.getSystemLandscape().getSystemDescription(system);
				ignoreDatasource = oFF.isNull(systemDescription) ? true : systemDescription.getSystemType().isTypeOf(oFF.SystemType.ABAP);
			}
			hierarchyDefinition = oFF.QCustomHierarchyDefinition.createByData(system, dataSource, dimensionName, inaHierarchy.getStringByKey("Description"), ignoreDatasource);
			hierarchyDefinition.setName(inaHierarchy.getStringByKey("Name"));
			this.addHierarchyNodesFromStructure(hierarchyDefinition, inaHierarchy.getStructureByKey("Nodes"));
		}
	}
	return hierarchyDefinition;
};
oFF.QInaRepoCustomHierarchyDefinition.prototype.addHierarchyNodesFromStructure = function(hierarchyDefinition, nodes)
{
	var nodeIds = oFF.PrUtils.getListProperty(nodes, "NodeId");
	var nodeParentIds = oFF.PrUtils.getListProperty(nodes, "ParentId");
	var nodeNames = oFF.PrUtils.getListProperty(nodes, "NodeName");
	var nodeTypes = oFF.PrUtils.getListProperty(nodes, "NodeType");
	var size = oFF.PrUtils.getListSize(nodeIds, 0);
	if (oFF.PrUtils.isListEmpty(nodeIds) || oFF.PrUtils.isListEmpty(nodeParentIds) || oFF.PrUtils.isListEmpty(nodeNames) || oFF.PrUtils.isListEmpty(nodeTypes) || nodeParentIds.size() !== size || nodeNames.size() !== size || nodeTypes.size() !== size)
	{
		return;
	}
	var nodeMap = oFF.XSimpleMap.create();
	for (var i = 0; i < size; i++)
	{
		var nodeId = nodeIds.getIntegerAt(i);
		var nodeName = nodeNames.getStringAt(i);
		var nodeType = nodeTypes.getStringAt(i);
		var nodeParentId = nodeParentIds.getIntegerAt(i);
		var parent = nodeParentId === -1 ? hierarchyDefinition : nodeMap.getByKey(oFF.XIntegerValue.create(nodeParentId));
		if (oFF.notNull(parent))
		{
			if (oFF.XString.isEqual(nodeType, "1HIER_NODE_SIMPLE"))
			{
				nodeMap.put(oFF.XIntegerValue.create(nodeId), parent.addTextNode(nodeName));
			}
			else
			{
				parent.addMemberNode(nodeName);
			}
		}
	}
	oFF.XObjectExt.release(nodeMap);
};
oFF.QInaRepoCustomHierarchyDefinition.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var customHierarchyDefinition = modelComponent;
	var inaCustomHierarchyDimension = oFF.PrFactory.createStructure();
	inaCustomHierarchyDimension.putString("Name", customHierarchyDefinition.getDimensionName());
	inaCustomHierarchyDimension.putString("System", customHierarchyDefinition.getSystemName());
	inaCustomHierarchyDimension.putString("DataSource", customHierarchyDefinition.getDataSourceName());
	var inaCustomHierarchy = oFF.PrFactory.createStructure();
	this.exportCustomHierarchy(customHierarchyDefinition, inaCustomHierarchy);
	inaCustomHierarchyDimension.put("Hierarchy", inaCustomHierarchy);
	var inaDefStructure = oFF.PrFactory.createStructure();
	var inaDimensionsList = inaDefStructure.putNewList("Dimensions");
	inaDimensionsList.add(inaCustomHierarchyDimension);
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaDefStructure, flags);
};
oFF.QInaRepoCustomHierarchyDefinition.prototype.exportCustomHierarchy = function(customHierarchyDefinition, inaCustomHierarchy)
{
	var emptyString = "";
	var name = customHierarchyDefinition.getName();
	var customHierarchyDesc = customHierarchyDefinition.getDescription();
	inaCustomHierarchy.putString("Name", oFF.XStringUtils.isNotNullAndNotEmpty(name) ? name : emptyString);
	inaCustomHierarchy.putString("Version", emptyString);
	inaCustomHierarchy.putString("DueDate", emptyString);
	inaCustomHierarchy.putString("Description", oFF.notNull(customHierarchyDesc) ? customHierarchyDesc : emptyString);
	inaCustomHierarchy.putBoolean("IsTransient", true);
	inaCustomHierarchy.putBoolean("NoRestNodes", true);
	inaCustomHierarchy.put("Nodes", this.getHierarchyNodesAsStructure(customHierarchyDefinition));
};
oFF.QInaRepoCustomHierarchyDefinition.prototype.getHierarchyNodesAsStructure = function(customHierarchyDefinition)
{
	var structure = oFF.PrFactory.createStructure();
	structure.putNewList("NodeId");
	structure.putNewList("NodeName");
	structure.putNewList("Description");
	structure.putNewList("NodeType");
	structure.putNewList("ParentId");
	var nodes = customHierarchyDefinition.getChildNodes();
	var size = nodes.size();
	for (var i = 0; i < size; i++)
	{
		this.addHierarchyElementToStructure(nodes.get(i), structure, -1, customHierarchyDefinition.getDimensionName());
	}
	return structure;
};
oFF.QInaRepoCustomHierarchyDefinition.prototype.addHierarchyElementToStructure = function(element, structure, parentIndex, dimensionName)
{
	var nodeIds = structure.getListByKey("NodeId");
	var nodeId = nodeIds.size();
	nodeIds.addInteger(nodeId);
	structure.getListByKey("NodeName").addString(element.getName());
	structure.getListByKey("ParentId").addInteger(parentIndex);
	if (element.isMemberElement())
	{
		structure.getListByKey("Description").addString("");
		structure.getListByKey("NodeType").addString(element.isNode() ? dimensionName : "");
	}
	else
	{
		structure.getListByKey("Description").addString(element.getName());
		structure.getListByKey("NodeType").addString("1HIER_NODE_SIMPLE");
	}
	if (element.isNode())
	{
		var childNodes = element.getChildNodes();
		var size = childNodes.size();
		for (var i = 0; i < size; i++)
		{
			this.addHierarchyElementToStructure(childNodes.get(i), structure, nodeId, dimensionName);
		}
	}
};

oFF.QInARepoTotalsLegacy = function() {};
oFF.QInARepoTotalsLegacy.prototype = new oFF.QInARepository();
oFF.QInARepoTotalsLegacy.prototype._ff_c = "QInARepoTotalsLegacy";

oFF.QInARepoTotalsLegacy.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.TOTALS;
};
oFF.QInARepoTotalsLegacy.prototype.getTagName = function()
{
	return "ResultStructureBag";
};
oFF.QInARepoTotalsLegacy.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	if (importer.mode !== oFF.QModelFormat.INA_DATA_REINIT)
	{
		var controller = modelComponent;
		if (controller.supportsResultVisibility())
		{
			var inaResultStructure = this.getResultStructure(inaStructure);
			var alignment = this.importResultAlignment(controller, inaResultStructure);
			controller.restoreTotalsVisibility(oFF.RestoreAction.DEFAULT_VALUE, false);
			var inaInnerResultStructure = inaResultStructure.getListByKey("ResultStructure");
			if (oFF.notNull(inaInnerResultStructure))
			{
				var flexibleResultStructure;
				if (controller.supportsAdvancedResultStructure() && alignment === oFF.ResultAlignment.STRUCTURE)
				{
					flexibleResultStructure = controller.getAdvancedResultStructure();
					flexibleResultStructure.clear();
					if (oFF.isNull(alignment))
					{
						controller.setResultAlignmentBase(oFF.ResultAlignment.STRUCTURE, true);
					}
				}
				else
				{
					flexibleResultStructure = null;
				}
				var size = inaInnerResultStructure.size();
				for (var i = 0; i < size; i++)
				{
					var resultStructureItem = inaInnerResultStructure.getStructureAt(i);
					this.importResultStructureItem(resultStructureItem, controller, flexibleResultStructure);
				}
			}
		}
	}
	return null;
};
oFF.QInARepoTotalsLegacy.prototype.importResultAlignment = function(controller, inaResultStructure)
{
	if (controller.supportsResultAlignment())
	{
		controller.restoreTotalsAlignment(oFF.RestoreAction.DEFAULT_VALUE, false);
		var inaResultAlignment = inaResultStructure.getStringByKey("ResultAlignment");
		if (oFF.XStringUtils.isNullOrEmpty(inaResultAlignment))
		{
			return null;
		}
		var alignment = oFF.QInAConverter.lookupAlignment(inaResultAlignment);
		controller.setResultAlignmentBase(alignment, false);
		return alignment;
	}
	return null;
};
oFF.QInARepoTotalsLegacy.prototype.getResultStructure = function(inaStructure)
{
	var inaResultStructure = inaStructure.getStructureByKey("ResultStructureBag");
	if (oFF.isNull(inaResultStructure))
	{
		inaResultStructure = inaStructure.getStructureByKey("DefaultResultStructure");
		if (oFF.isNull(inaResultStructure))
		{
			return inaStructure;
		}
	}
	return inaResultStructure;
};
oFF.QInARepoTotalsLegacy.prototype.importResultStructureItem = function(resultStructureItem, controller, flexibleResultStructure)
{
	var resultStructureElement = resultStructureItem.getStringByKey("Result");
	var element;
	if (oFF.XString.isEqual(resultStructureElement, "Members"))
	{
		element = oFF.ResultStructureElement.MEMBERS;
	}
	else if (oFF.XString.isEqual(resultStructureElement, "Total"))
	{
		element = oFF.ResultStructureElement.TOTAL;
	}
	else if (oFF.XString.isEqual(resultStructureElement, "TotalIncludedMembers"))
	{
		element = oFF.ResultStructureElement.TOTAL_INCLUDED_MEMBERS;
	}
	else if (oFF.XString.isEqual(resultStructureElement, "TotalRemainingMembers"))
	{
		element = oFF.ResultStructureElement.TOTAL_REMAINING_MEMBERS;
	}
	else
	{
		return;
	}
	var inaVisibility = resultStructureItem.getStringByKey("Visibility");
	var visibility = oFF.QInAConverter.lookupResultSetVisibility(inaVisibility);
	if (oFF.isNull(flexibleResultStructure))
	{
		controller.setResultVisibilityByElement(element, visibility);
	}
	else
	{
		flexibleResultStructure.addWithVisibility(element, visibility);
	}
};
oFF.QInARepoTotalsLegacy.prototype.exportComponentWithStructure = oFF.noSupport;

oFF.QInARepoChartDefinition = function() {};
oFF.QInARepoChartDefinition.prototype = new oFF.QInARepository();
oFF.QInARepoChartDefinition.prototype._ff_c = "QInARepoChartDefinition";

oFF.QInARepoChartDefinition.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.VISUALIZATION_CHART_DEFINITION;
};
oFF.QInARepoChartDefinition.prototype.getTagName = function()
{
	return "ChartDefinition";
};
oFF.QInARepoChartDefinition.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	if (oFF.notNull(inaStructure) && oFF.notNull(modelComponent) && modelComponent.getOlapComponentType() === oFF.OlapComponentType.VISUALIZATION_CHART_DEFINITION)
	{
		var chartDefinitionBase = modelComponent;
		chartDefinitionBase.setTitle(inaStructure.getStringByKey("Title"));
	}
	return modelComponent;
};
oFF.QInARepoChartDefinition.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	if (oFF.notNull(modelComponent) && oFF.notNull(inaStructure))
	{
		var chartDefinition = modelComponent;
		inaStructure.putStringNotNullAndNotEmpty("Title", chartDefinition.getTitle());
		var keyFigureDimension = chartDefinition.getKeyFigureDimension();
		if (oFF.notNull(keyFigureDimension))
		{
			inaStructure.putStringNotNullAndNotEmpty("KeyFigureDimension", keyFigureDimension.getName());
		}
	}
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};

oFF.QInARepoTableCellReferenceScope = function() {};
oFF.QInARepoTableCellReferenceScope.prototype = new oFF.QInARepository();
oFF.QInARepoTableCellReferenceScope.prototype._ff_c = "QInARepoTableCellReferenceScope";

oFF.QInARepoTableCellReferenceScope.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.VISUALIZATION_CELL_REFERENCE_SCOPE;
};
oFF.QInARepoTableCellReferenceScope.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	if (oFF.notNull(modelComponent) && oFF.notNull(inaStructure) && modelComponent.getComponentType() === oFF.OlapComponentType.VISUALIZATION_CELL_REFERENCE_SCOPE)
	{
		var cellReferenceScope = modelComponent;
		cellReferenceScope.setMatchOrdinal(inaStructure.getIntegerByKey("MatchOrdinal"));
		cellReferenceScope.setMatchModulo(inaStructure.getIntegerByKey("MatchModulo"));
		cellReferenceScope.setMatchFullHeaderSection(inaStructure.getBooleanByKey("MatchHeaderSectionFull"));
		cellReferenceScope.setMatchHeaderSectionStart(inaStructure.getBooleanByKey("MatchHeaderSectionStart"));
		cellReferenceScope.setMatchHeaderSectionEnd(inaStructure.getBooleanByKey("MatchHeaderSectionEnd"));
		cellReferenceScope.setMatchFullDataSection(inaStructure.getBooleanByKey("MatchDataSectionFull"));
		cellReferenceScope.setMatchDataSectionStart(inaStructure.getBooleanByKey("MatchDataSectionStart"));
		cellReferenceScope.setMatchDataSectionEnd(inaStructure.getBooleanByKey("MatchDataSectionEnd"));
		this.importHeaderReferences(cellReferenceScope, inaStructure);
		this.importAxisPaths(cellReferenceScope, inaStructure);
	}
	return modelComponent;
};
oFF.QInARepoTableCellReferenceScope.prototype.importHeaderReferences = function(cellReferenceScope, inaStructure)
{
	var headerSectionInfoList = inaStructure.getListByKey("HeaderSectionInfo");
	if (oFF.notNull(headerSectionInfoList))
	{
		cellReferenceScope.clearHeaderSectionInfos();
		for (var i = 0; i < headerSectionInfoList.size(); i++)
		{
			var headerSectionInfoStruct = headerSectionInfoList.getStructureAt(i);
			var headerSectionInfo = cellReferenceScope.addNewHeaderSectionInfo();
			headerSectionInfo.setAxisLevel(headerSectionInfoStruct.getIntegerByKey("AxisLevel"));
			headerSectionInfo.setHeaderName(headerSectionInfoStruct.getStringByKey("HeaderName"));
			headerSectionInfo.setDimensionLevel(headerSectionInfoStruct.getBooleanByKey("HeaderDimension"));
			headerSectionInfo.setAttributeLevel(headerSectionInfoStruct.getBooleanByKey("HeaderAttribute"));
			headerSectionInfo.setFieldLevel(headerSectionInfoStruct.getBooleanByKey("HeaderField"));
			headerSectionInfo.setExactHeaderLevel(headerSectionInfoStruct.getBooleanByKey("HeaderLevelExact"));
		}
	}
};
oFF.QInARepoTableCellReferenceScope.prototype.importAxisPaths = function(cellReferenceScope, inaStructure)
{
	var axisPathList = inaStructure.getListByKey("ReferencePaths");
	if (oFF.notNull(axisPathList))
	{
		cellReferenceScope.clearAxisPaths();
		for (var i = 0; i < axisPathList.size(); i++)
		{
			var newAxisPath = cellReferenceScope.addNewAxisPath();
			var axisPathStruct = axisPathList.getStructureAt(i);
			newAxisPath.setMatchingDimensionSectionStart(this.getTriStateBool(axisPathStruct, "MatchDimensionSectionStart"));
			newAxisPath.setMatchingDimensionSectionEnd(this.getTriStateBool(axisPathStruct, "MatchDimensionSectionEnd"));
			newAxisPath.setMatchingHierarchyLevelStart(this.getTriStateBool(axisPathStruct, "MatchHierarchyLevelStart"));
			newAxisPath.setMatchingHierarchyLevelEnd(this.getTriStateBool(axisPathStruct, "MatchHierarchyLevelEnd"));
			var axisPathSubList = axisPathStruct.getListByKey("ReferencePathElements");
			if (oFF.XCollectionUtils.hasElements(axisPathSubList))
			{
				for (var j = 0; j < axisPathSubList.size(); j++)
				{
					var newAxisPathElement = newAxisPath.addNewElement();
					var axisPathElementStruct = axisPathSubList.getStructureAt(j);
					newAxisPathElement.setAxisLevel(axisPathElementStruct.getIntegerByKeyExt("AxisLevel", -1));
					newAxisPathElement.setHierarchyLevel(axisPathElementStruct.getIntegerByKeyExt("HierarchyLevel", -1));
					newAxisPathElement.setExactHierarchyLevel(axisPathElementStruct.getBooleanByKey("HierarchyLevelExact"));
					newAxisPathElement.setHierarchyLevelName(axisPathElementStruct.getStringByKey("HierarchyLevelName"));
					newAxisPathElement.setIncludeHeaderBand(this.getTriStateBool(axisPathElementStruct, "IncludeHeaderBand"));
					newAxisPathElement.setIncludeTotalsBand(this.getTriStateBool(axisPathElementStruct, "IncludeTotalsBand"));
					newAxisPathElement.setIncludeSubDrills(this.getTriStateBool(axisPathElementStruct, "IncludeSubdrills"));
					newAxisPathElement.setMatchesExpanded(this.getTriStateBool(axisPathElementStruct, "Expanded"));
					newAxisPathElement.setMatchesLeaves(this.getTriStateBool(axisPathElementStruct, "Leaves"));
					if (axisPathElementStruct.hasStringByKey("LowerLevelNodeAlignment"))
					{
						newAxisPathElement.setHierarchyAlignment(oFF.QInAConverter.lookupLowerLevelNodeAlignment(axisPathElementStruct.getStringByKey("LowerLevelNodeAlignment")));
					}
					oFF.XCollectionUtils.forEach(axisPathElementStruct.getListByKey("MemberNames"),  function(le){
						newAxisPathElement.addMemberName(le.asString().getString());
					}.bind(this));
					newAxisPathElement.setDimensionName(axisPathElementStruct.getStringByKey("DimensionName"));
				}
			}
		}
	}
};
oFF.QInARepoTableCellReferenceScope.prototype.getTriStateBool = function(struct, key)
{
	var result = oFF.TriStateBool._DEFAULT;
	if (struct.containsKey(key))
	{
		result = struct.getBooleanByKey(key) ? oFF.TriStateBool._TRUE : oFF.TriStateBool._FALSE;
	}
	return result;
};
oFF.QInARepoTableCellReferenceScope.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	if (oFF.notNull(inaStructure) && oFF.notNull(modelComponent))
	{
		var cellsReferenceScope = modelComponent;
		inaStructure.putInteger("MatchOrdinal", cellsReferenceScope.getMatchOrdinal());
		inaStructure.putInteger("MatchModulo", cellsReferenceScope.getMatchModulo());
		inaStructure.putBoolean("MatchHeaderSectionFull", cellsReferenceScope.isMatchFullHeaderSection());
		inaStructure.putBoolean("MatchHeaderSectionStart", cellsReferenceScope.isMatchHeaderSectionStart());
		inaStructure.putBoolean("MatchHeaderSectionEnd", cellsReferenceScope.isMatchHeaderSectionEnd());
		inaStructure.putBoolean("MatchDataSectionFull", cellsReferenceScope.isMatchFullDataSection());
		inaStructure.putBoolean("MatchDataSectionStart", cellsReferenceScope.isMatchDataSectionStart());
		inaStructure.putBoolean("MatchDataSectionEnd", cellsReferenceScope.isMatchDataSectionEnd());
		this.exportHeaderSectionInfo(cellsReferenceScope, inaStructure);
		this.exportAxisPaths(cellsReferenceScope, inaStructure);
	}
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};
oFF.QInARepoTableCellReferenceScope.prototype.exportHeaderSectionInfo = function(cellsReferenceScope, inaStructure)
{
	var headerSectionInfos = cellsReferenceScope.getHeaderSectionInfos();
	if (oFF.XCollectionUtils.hasElements(headerSectionInfos))
	{
		var headerSectionInfoList = inaStructure.putNewList("HeaderSectionInfo");
		for (var i = 0; i < headerSectionInfos.size(); i++)
		{
			var headerSectionInfo = headerSectionInfos.get(i);
			var headerSectionInfoStruct = headerSectionInfoList.addNewStructure();
			headerSectionInfoStruct.putInteger("AxisLevel", headerSectionInfo.getAxisLevel());
			headerSectionInfoStruct.putString("HeaderName", headerSectionInfo.getHeaderName());
			headerSectionInfoStruct.putBoolean("HeaderDimension", headerSectionInfo.isDimensionLevel());
			headerSectionInfoStruct.putBoolean("HeaderAttribute", headerSectionInfo.isAttributeLevel());
			headerSectionInfoStruct.putBoolean("HeaderField", headerSectionInfo.isFieldLevel());
			headerSectionInfoStruct.putBoolean("HeaderLevelExact", headerSectionInfo.isExactHeaderLevel());
		}
	}
};
oFF.QInARepoTableCellReferenceScope.prototype.exportAxisPaths = function(cellReferenceScope, inaStructure)
{
	var axisPaths = cellReferenceScope.getAxisPaths();
	if (oFF.XCollectionUtils.hasElements(axisPaths))
	{
		var axisPathList = inaStructure.putNewList("ReferencePaths");
		for (var i = 0; i < axisPaths.size(); i++)
		{
			var axisPath = axisPaths.get(i);
			var axisPathStruct = axisPathList.addNewStructure();
			this.setTriStateBool(axisPathStruct, "MatchDimensionSectionStart", axisPath.isMatchingDimensionSectionStart());
			this.setTriStateBool(axisPathStruct, "MatchDimensionSectionEnd", axisPath.isMatchingDimensionSectionEnd());
			this.setTriStateBool(axisPathStruct, "MatchHierarchyLevelStart", axisPath.isMatchingHierarchyLevelStart());
			this.setTriStateBool(axisPathStruct, "MatchHierarchyLevelEnd", axisPath.isMatchingHierarchyLevelEnd());
			var axisPathSubList = axisPathStruct.putNewList("ReferencePathElements");
			for (var j = 0; j < axisPath.size(); j++)
			{
				var axisPathElementStruct = axisPathSubList.addNewStructure();
				var axisPathElement = axisPath.get(j);
				axisPathElementStruct.putInteger("AxisLevel", axisPathElement.getAxisLevel());
				axisPathElementStruct.putInteger("HierarchyLevel", axisPathElement.getHierarchyLevel());
				axisPathElementStruct.putBoolean("HierarchyLevelExact", axisPathElement.isExactHierarchyLevel());
				axisPathElementStruct.putString("HierarchyLevelName", axisPathElement.getHierarchyLevelName());
				this.setTriStateBool(axisPathElementStruct, "IncludeHeaderBand", axisPathElement.isIncludeHeaderBand());
				this.setTriStateBool(axisPathElementStruct, "IncludeTotalsBand", axisPathElement.isIncludeTotalsBand());
				this.setTriStateBool(axisPathElementStruct, "IncludeSubdrills", axisPathElement.isIncludeSubDrills());
				this.setTriStateBool(axisPathElementStruct, "Expanded", axisPathElement.isMatchesExpanded());
				this.setTriStateBool(axisPathElementStruct, "Leaves", axisPathElement.isMatchesLeaves());
				axisPathElementStruct.putString("LowerLevelNodeAlignment", oFF.QInAConverter.lookupLowerLevelNodeAlignmentInA(axisPathElement.getHierarchyAlignment()));
				axisPathElementStruct.putNewList("MemberNames").addAllStrings(axisPathElement.getMemberNames());
				axisPathElementStruct.putString("DimensionName", axisPathElement.getDimensionName());
			}
		}
	}
};
oFF.QInARepoTableCellReferenceScope.prototype.setTriStateBool = function(struct, key, tsb)
{
	if (tsb === oFF.TriStateBool._TRUE)
	{
		struct.putBoolean(key, true);
	}
	else if (tsb === oFF.TriStateBool._FALSE)
	{
		struct.putBoolean(key, false);
	}
};

oFF.QInARepoTableDefinition = function() {};
oFF.QInARepoTableDefinition.prototype = new oFF.QInARepository();
oFF.QInARepoTableDefinition.prototype._ff_c = "QInARepoTableDefinition";

oFF.QInARepoTableDefinition.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.VISUALIZATION_TABLE_DEFINITION;
};
oFF.QInARepoTableDefinition.prototype.getTagName = function()
{
	return "TableDefinition";
};
oFF.QInARepoTableDefinition.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	if (oFF.notNull(modelComponent) && oFF.notNull(inaStructure) && modelComponent.getComponentType() === oFF.OlapComponentType.VISUALIZATION_TABLE_DEFINITION)
	{
		var tableDefinition = modelComponent;
		var i;
		if (inaStructure.containsKey("DimensionColorPalette"))
		{
			tableDefinition.clearDimensionColorPalette();
			var paletteList = inaStructure.getListByKey("DimensionColorPalette");
			for (i = 0; i < paletteList.size(); i++)
			{
				tableDefinition.addDimensionColor(paletteList.getStringAt(i));
			}
		}
		tableDefinition.setDimensionToColorate(inaStructure.getStringByKey("DimensionToColorate"));
		this.importFormattingStyles(tableDefinition, inaStructure);
		this.importDataPointStyles(tableDefinition, inaStructure);
		this.importScopedStyles(importer, tableDefinition, inaStructure);
		this.importTableMarkups(importer, tableDefinition, inaStructure);
		this.importIndexBasedCellDimensions(tableDefinition, inaStructure);
		if (inaStructure.containsKey("StripeDataColumns"))
		{
			tableDefinition.setStripeDataColumns(oFF.TriStateBool.lookup(inaStructure.getBooleanByKey("StripeDataColumns")));
		}
		if (inaStructure.containsKey("StripeDataRows"))
		{
			tableDefinition.setStripeDataRows(oFF.TriStateBool.lookup(inaStructure.getBooleanByKey("StripeDataRows")));
		}
		if (inaStructure.containsKey("FreezeHeaderRows"))
		{
			tableDefinition.setFreezeHeaderRows(oFF.TriStateBool.lookup(inaStructure.getBooleanByKey("FreezeHeaderRows")));
		}
		if (inaStructure.containsKey("FreezeHeaderColumns"))
		{
			tableDefinition.setFreezeHeaderColumns(oFF.TriStateBool.lookup(inaStructure.getBooleanByKey("FreezeHeaderColumns")));
		}
		tableDefinition.setFreezeUpToRow(inaStructure.getIntegerByKeyExt("FreezeUpToRow", -1));
		tableDefinition.setFreezeUpToColumn(inaStructure.getIntegerByKeyExt("FreezeUpToColumn", -1));
		if (inaStructure.containsKey("ShowFreezeLines"))
		{
			tableDefinition.setShowFreezeLines(oFF.TriStateBool.lookup(inaStructure.getBooleanByKey("ShowFreezeLines")));
		}
		if (inaStructure.containsKey("ShowGrid"))
		{
			tableDefinition.setShowGrid(oFF.TriStateBool.lookup(inaStructure.getBooleanByKey("ShowGrid")));
		}
		if (inaStructure.containsKey("ShowDimensionTitles"))
		{
			tableDefinition.setShowDimensionTitles(oFF.TriStateBool.lookup(inaStructure.getBooleanByKeyExt("ShowDimensionTitles", true)));
		}
		if (inaStructure.hasStringByKey("TableHeaderCompactionType"))
		{
			tableDefinition.setTableHeaderCompactionType(oFF.TableHeaderCompactionType.lookup(inaStructure.getStringByKey("TableHeaderCompactionType")));
		}
		if (inaStructure.getBooleanByKey("ShowRepetitiveMemberNames"))
		{
			tableDefinition.setRepetitiveMemberNames(true);
		}
		if (inaStructure.getBooleanByKey("MergeRepetitiveMemberCells"))
		{
			tableDefinition.setMergeRepetitiveMemberCells(true);
		}
		if (inaStructure.hasStringByKey("TableMemberHeaderHandling"))
		{
			tableDefinition.setTableMemberHeaderHandling(oFF.TableMemberHeaderHandling.lookup(inaStructure.getStringByKey("TableMemberHeaderHandling")));
		}
		if (inaStructure.containsKey("ShowCoordinateHeader"))
		{
			tableDefinition.setShowCoordinateHeader(oFF.TriStateBool.lookup(inaStructure.getBooleanByKey("ShowCoordinateHeader")));
		}
		tableDefinition.setHeaderColor(inaStructure.getStringByKey("HeaderColor"));
		tableDefinition.setTotalLevel6Color(inaStructure.getStringByKey("TotalLevel6Color"));
		tableDefinition.setTotalLevel5Color(inaStructure.getStringByKey("TotalLevel5Color"));
		tableDefinition.setTotalLevel4Color(inaStructure.getStringByKey("TotalLevel4Color"));
		tableDefinition.setTotalLevel3Color(inaStructure.getStringByKey("TotalLevel3Color"));
		tableDefinition.setTotalLevel2Color(inaStructure.getStringByKey("TotalLevel2Color"));
		tableDefinition.setTotalLevel1Color(inaStructure.getStringByKey("TotalLevel1Color"));
		tableDefinition.setTotalLevel0Color(inaStructure.getStringByKey("TotalLevel0Color"));
		tableDefinition.setTitle(inaStructure.getStringByKey("Title"));
		tableDefinition.setSerializeLinkedDefinitions(inaStructure.getBooleanByKey("LinkedDefinitionsSerialize"));
		if (inaStructure.containsKey("LinkedDefinitionPriorities"))
		{
			var linkPrioList = inaStructure.getListByKey("LinkedDefinitionPriorities");
			oFF.XCollectionUtils.forEach(linkPrioList,  function(linkPrioStruct){
				var linkPrioStructure = linkPrioStruct.asStructure();
				tableDefinition.putLinkedDefinitionPriority(linkPrioStructure.getStringByKey("Key"), linkPrioStructure.getIntegerByKey("Priority"));
			}.bind(this));
		}
		if (inaStructure.containsKey("LinkedDefinitionNames"))
		{
			var linkNameList = inaStructure.getListByKey("LinkedDefinitionNames");
			oFF.XCollectionUtils.forEach(linkNameList,  function(linkNameStruct){
				var linkNameStructure = linkNameStruct.asStructure();
				tableDefinition.putLinkedDefinitionName(linkNameStructure.getStringByKey("Key"), linkNameStructure.getStringByKey("Priority"));
			}.bind(this));
		}
		if (inaStructure.containsKey("LinkedDefinitions"))
		{
			var linkDefList = inaStructure.getListByKey("LinkedDefinitions");
			oFF.XCollectionUtils.forEach(linkDefList,  function(linkDefStruct){
				var linkDefStructure = linkDefStruct.asStructure();
				var linkedTableDef = oFF.QTableDefinition.create(context, null, null, tableDefinition.getProtocolBindingType(), tableDefinition.getSemanticBindingType());
				linkedTableDef.deserializeFromElementExt(importer.mode, linkDefStructure.getByKey("TableDefinition"));
				tableDefinition.putLinkedDefinition(linkDefStructure.getStringByKey("Key"), linkedTableDef);
			}.bind(this));
		}
	}
	return modelComponent;
};
oFF.QInARepoTableDefinition.prototype.importIndexBasedCellDimensions = function(tableDefinition, inaStructure)
{
	var i;
	var fixedPixelRowHeights = inaStructure.getListByKey("FixedPixelRowHeights");
	if (oFF.XCollectionUtils.hasElements(fixedPixelRowHeights))
	{
		tableDefinition.clearFixedPixelRowHeights();
		for (i = 0; i < fixedPixelRowHeights.size(); i++)
		{
			var rowHeight = fixedPixelRowHeights.getStructureAt(i);
			tableDefinition.setFixedPixelHeightForRow(rowHeight.getIntegerByKey("Index"), rowHeight.getIntegerByKey("Height"));
		}
	}
	var fixedPixelColumnWidths = inaStructure.getListByKey("FixedPixelColumnWidths");
	if (oFF.XCollectionUtils.hasElements(fixedPixelColumnWidths))
	{
		tableDefinition.clearFixedPixelColumnWidths();
		for (i = 0; i < fixedPixelColumnWidths.size(); i++)
		{
			var columnWidth = fixedPixelColumnWidths.getStructureAt(i);
			tableDefinition.setFixedPixelWidthForColumn(columnWidth.getIntegerByKey("Index"), columnWidth.getIntegerByKey("Width"));
		}
	}
};
oFF.QInARepoTableDefinition.prototype.importFormattingStyles = function(tableDefinition, inaStructure)
{
	var formattingStyleList = inaStructure.getListByKey("Styles");
	if (oFF.notNull(formattingStyleList))
	{
		tableDefinition.clearFormattingStyles();
	}
	if (oFF.XCollectionUtils.hasElements(formattingStyleList))
	{
		for (var i = 0; i < formattingStyleList.size(); i++)
		{
			var formattingStyleStruct = formattingStyleList.getStructureAt(i);
			var formattingName = formattingStyleStruct.getStringByKey("Name");
			var formattingText = formattingStyleStruct.getStringByKey("Text");
			var formattingStyle = tableDefinition.addNewFormattingStyle(formattingName, formattingText);
			formattingStyle.setAlertColor(formattingStyleStruct.getStringByKey("AlertColor"));
			formattingStyle.setAlertSymbol(oFF.AlertSymbol.lookup(formattingStyleStruct.getStringByKey("AlertSymbol")));
			formattingStyle.setAlertColor(formattingStyleStruct.getStringByKey("AlertColor"));
			this.importStyledLine(formattingStyle.getStyledLineLeft(), formattingStyleStruct.getStructureByKey("LeftLine"));
			this.importStyledLine(formattingStyle.getStyledLineRight(), formattingStyleStruct.getStructureByKey("RightLine"));
			this.importStyledLine(formattingStyle.getStyledLineTop(), formattingStyleStruct.getStructureByKey("TopLine"));
			this.importStyledLine(formattingStyle.getStyledLineBottom(), formattingStyleStruct.getStructureByKey("BottomLine"));
			formattingStyle.setFillColor(formattingStyleStruct.getStringByKey("FillColor"));
			if (formattingStyleStruct.containsKey("FontBold"))
			{
				formattingStyle.setFontBold(formattingStyleStruct.getBooleanByKey("FontBold"));
			}
			if (formattingStyleStruct.containsKey("FontItalic"))
			{
				formattingStyle.setFontItalic(formattingStyleStruct.getBooleanByKey("FontItalic"));
			}
			if (formattingStyleStruct.containsKey("FontUnderline"))
			{
				formattingStyle.setFontUnderline(formattingStyleStruct.getBooleanByKey("FontUnderline"));
			}
			if (formattingStyleStruct.containsKey("FontStrikeThrough"))
			{
				formattingStyle.setFontStrikeThrough(formattingStyleStruct.getBooleanByKey("FontStrikeThrough"));
			}
			formattingStyle.setFontSize(formattingStyleStruct.getDoubleByKey("FontSize"));
			formattingStyle.setFontFamily(formattingStyleStruct.getStringByKey("FontFamily"));
			formattingStyle.setFontColor(formattingStyleStruct.getStringByKey("FontColor"));
			formattingStyle.setCellChartBarColor(formattingStyleStruct.getStringByKey("CellChartBarColor"));
			formattingStyle.setCellChartLineColor(formattingStyleStruct.getStringByKey("CellChartLineColor"));
			formattingStyle.setVerticalAlignment(oFF.CellAlignmentVertical.lookup(formattingStyleStruct.getStringByKey("VerticalAlignment")));
			formattingStyle.setHorizontalAlignment(oFF.CellAlignmentHorizontal.lookup(formattingStyleStruct.getStringByKey("HorizontalAlignment")));
			formattingStyle.setPriority(formattingStyleStruct.getIntegerByKey("Priority"));
			formattingStyle.setBackgroundPatternType(oFF.LinePatternType.lookup(formattingStyleStruct.getStringByKey("PatternType")));
			formattingStyle.setBackgroundContent(formattingStyleStruct.getStringByKey("PatternBackground"));
		}
	}
};
oFF.QInARepoTableDefinition.prototype.importStyledLine = function(styledLine, importStructure)
{
	if (oFF.notNull(importStructure))
	{
		styledLine.setWidth(importStructure.getDoubleByKeyExt("LineWidth", -1));
		styledLine.setColor(importStructure.getStringByKey("LineColor"));
		styledLine.setPatternBackground(importStructure.getStringByKey("PatternBackground"));
		styledLine.setPatternWidth(importStructure.getDoubleByKey("PatternWidth"));
		styledLine.setPatternColor(importStructure.getStringByKey("PatternColor"));
		styledLine.setPatternBorderColor(importStructure.getStringByKey("PatternBorderColor"));
		styledLine.setPatternType(oFF.LinePatternType.lookup(importStructure.getStringByKey("PatternType")));
		styledLine.setLineStyle(oFF.TableLineStyle.lookup(importStructure.getStringByKey("LineStyle")));
		styledLine.setLeftPadding(importStructure.getDoubleByKeyExt("PaddingLeft", -1));
		styledLine.setRightPadding(importStructure.getDoubleByKeyExt("PaddingRight", -1));
		styledLine.setTopPadding(importStructure.getDoubleByKeyExt("PaddingTop", -1));
		styledLine.setBottomPadding(importStructure.getDoubleByKeyExt("PaddingBottom", -1));
	}
};
oFF.QInARepoTableDefinition.prototype.importDataPointStyles = function(tableDefinition, inaStructure)
{
	var dataPointStyleList = inaStructure.getListByKey("DataPointStyle");
	if (oFF.notNull(dataPointStyleList))
	{
		tableDefinition.clearDataPointStyles();
	}
	if (oFF.XCollectionUtils.hasElements(dataPointStyleList))
	{
		for (var i = 0; i < dataPointStyleList.size(); i++)
		{
			var dataPointFormatting = dataPointStyleList.getStructureAt(i);
			var format = tableDefinition.addNewDataPointStyle(dataPointFormatting.getStringByKey("Name"), dataPointFormatting.getStringByKey("Text"));
			format.setFormattingStyleName(dataPointFormatting.getStringByKey("Style"));
			format.setExceptionName(dataPointFormatting.getStringByKey("ExceptionName"));
			format.setAlertLevelMin(oFF.QInAConverter.lookupAlertLevel(dataPointFormatting.getIntegerByKeyExt("AlertLevelMin", -1)));
			format.setAlertLevelMax(oFF.QInAConverter.lookupAlertLevel(dataPointFormatting.getIntegerByKeyExt("AlertLevelMax", -1)));
			format.setValueSign(oFF.ValueSign.get(dataPointFormatting.getStringByKey("ValueSign")));
			format.setPriority(dataPointFormatting.getIntegerByKey("Priority"));
		}
	}
};
oFF.QInARepoTableDefinition.prototype.importScopedStyles = function(importer, tableDefinition, inaStructure)
{
	var scopedStyleList = inaStructure.getListByKey("ScopedStyle");
	if (oFF.notNull(scopedStyleList))
	{
		tableDefinition.clearScopedStylesStyles();
	}
	if (oFF.XCollectionUtils.hasElements(scopedStyleList))
	{
		for (var i = 0; i < scopedStyleList.size(); i++)
		{
			var scopedStyleStructure = scopedStyleList.getStructureAt(i);
			var format = tableDefinition.addNewScopedStyle(scopedStyleStructure.getStringByKey("Name"), scopedStyleStructure.getStringByKey("Text"));
			format.setStyleName(scopedStyleStructure.getStringByKey("Style"));
			importer.importVisualizationCellReferenceScope(scopedStyleStructure.getStructureByKey("ColumnsScope"), format.getOrthogonalColumnsScope(), tableDefinition);
			importer.importVisualizationCellReferenceScope(scopedStyleStructure.getStructureByKey("RowsScope"), format.getOrthogonalRowsScope(), tableDefinition);
		}
	}
};
oFF.QInARepoTableDefinition.prototype.importTableMarkups = function(importer, tableDefinition, inaStructure)
{
	var tableMarkupList = inaStructure.getListByKey("TableMarkup");
	if (oFF.notNull(tableMarkupList))
	{
		tableDefinition.clearTableMarkups();
	}
	if (oFF.XCollectionUtils.hasElements(tableMarkupList))
	{
		for (var i = 0; i < tableMarkupList.size(); i++)
		{
			var tableMarkupStructure = tableMarkupList.getStructureAt(i);
			var markup = tableDefinition.addNewTableMarkup(tableMarkupStructure.getStringByKey("Name"), tableMarkupStructure.getStringByKey("Text"));
			markup.setPageBreakHandlingBefore(oFF.TablePageBreakHandling.lookup(tableMarkupStructure.getStringByKey("PageBreakBefore")));
			markup.setPageBreakHandlingAfter(oFF.TablePageBreakHandling.lookup(tableMarkupStructure.getStringByKey("PageBreakAfter")));
			markup.setPageBreakHandlingInside(oFF.TablePageBreakHandling.lookup(tableMarkupStructure.getStringByKey("PageBreakInside")));
			markup.setHide(tableMarkupStructure.getBooleanByKey("Hidden"));
			markup.setCellHeight(tableMarkupStructure.getIntegerByKeyExt("Height", -1));
			markup.setCellWidth(tableMarkupStructure.getIntegerByKeyExt("Width", -1));
			markup.setPriority(tableMarkupStructure.getIntegerByKey("Priority"));
			importer.importVisualizationCellReferenceScope(tableMarkupStructure.getStructureByKey("RowsScope"), markup.getRowsScope(), tableDefinition);
			importer.importVisualizationCellReferenceScope(tableMarkupStructure.getStructureByKey("ColumnsScope"), markup.getColumnsScope(), tableDefinition);
			var scopedStyleList = tableMarkupStructure.getListByKey("ScopedStyle");
			if (oFF.notNull(scopedStyleList))
			{
				markup.clearScopedStyles();
				oFF.XCollectionUtils.forEach(scopedStyleList,  function(sc){
					markup.addScopedStyleName(sc.asString().getString());
				}.bind(this));
			}
			var tupleBeforeList = tableMarkupStructure.getListByKey("InsertedTupleBefore");
			this.importInsertedTuples(tupleBeforeList,  function(){
				markup.clearTuplesBefore();
			}.bind(this),  function(n1, t1){
				return markup.addNewTupleBefore(n1.getString(), t1.getString());
			}.bind(this));
			var tupleAfterList = tableMarkupStructure.getListByKey("InsertedTupleAfter");
			this.importInsertedTuples(tupleAfterList,  function(){
				markup.clearTuplesAfter();
			}.bind(this),  function(n2, t2){
				return markup.addNewTuplesAfter(n2.getString(), t2.getString());
			}.bind(this));
		}
	}
};
oFF.QInARepoTableDefinition.prototype.importInsertedTuples = function(tupleList, deleter, inserter)
{
	if (oFF.notNull(tupleList))
	{
		deleter();
		for (var i = 0; i < tupleList.size(); i++)
		{
			var structure = tupleList.getStructureAt(i);
			var insertedTuple = inserter(oFF.XStringValue.create(structure.getStringByKey("Name")), oFF.XStringValue.create(structure.getStringByKey("Text")));
			insertedTuple.setMerged(structure.getBooleanByKey("MergeCells"));
			insertedTuple.setCellHeight(structure.getIntegerByKeyExt("Height", -1));
			insertedTuple.setCellWidth(structure.getIntegerByKeyExt("Width", -1));
			insertedTuple.setFormattedText(structure.getStringByKey("FormattedText"));
			var scopedStyleList = structure.getListByKey("ScopedStyle");
			if (oFF.notNull(scopedStyleList))
			{
				oFF.XCollectionUtils.forEach(scopedStyleList,  function(el){
					insertedTuple.addScopedStyleName(el.asString().getString());
				}.bind(this));
			}
		}
	}
};
oFF.QInARepoTableDefinition.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	if (oFF.notNull(inaStructure) && oFF.notNull(modelComponent))
	{
		var tableDefinition = modelComponent;
		var list = inaStructure.putNewList("DimensionColorPalette");
		if (oFF.XCollectionUtils.hasElements(tableDefinition.getDimensionColorPalette()))
		{
			list.addAllStrings(tableDefinition.getDimensionColorPalette());
		}
		this.exportFormattingStyles(tableDefinition, inaStructure);
		this.exportDataPointStyles(tableDefinition, inaStructure);
		this.exportScopedStyles(exporter, tableDefinition, inaStructure);
		this.exportTableMarkups(exporter, tableDefinition, inaStructure);
		this.exportIndexBasedCellDimensions(tableDefinition, inaStructure);
		inaStructure.putString("DimensionToColorate", tableDefinition.getDimensionToColorate());
		if (this.isBooleanSet(tableDefinition.isStripeDataRows()))
		{
			inaStructure.putBoolean("StripeDataRows", tableDefinition.isStripeDataRows().getBoolean());
		}
		if (this.isBooleanSet(tableDefinition.isStripeDataColumns()))
		{
			inaStructure.putBoolean("StripeDataColumns", tableDefinition.isStripeDataColumns().getBoolean());
		}
		if (this.isBooleanSet(tableDefinition.isFreezeHeaderRows()))
		{
			inaStructure.putBoolean("FreezeHeaderRows", tableDefinition.isFreezeHeaderRows().getBoolean());
		}
		if (this.isBooleanSet(tableDefinition.isFreezeHeaderColumns()))
		{
			inaStructure.putBoolean("FreezeHeaderColumns", tableDefinition.isFreezeHeaderColumns().getBoolean());
		}
		inaStructure.putInteger("FreezeUpToRow", tableDefinition.getFreezeUpToRow());
		inaStructure.putInteger("FreezeUpToColumn", tableDefinition.getFreezeUpToColumn());
		if (this.isBooleanSet(tableDefinition.isShowFreezeLines()))
		{
			inaStructure.putBoolean("ShowFreezeLines", tableDefinition.isShowFreezeLines().getBoolean());
		}
		if (this.isBooleanSet(tableDefinition.isShowGrid()))
		{
			inaStructure.putBoolean("ShowGrid", tableDefinition.isShowGrid().getBoolean());
		}
		if (this.isBooleanSet(tableDefinition.isShowDimensionTitles()))
		{
			inaStructure.putBoolean("ShowDimensionTitles", tableDefinition.isShowDimensionTitles().getBoolean());
		}
		if (tableDefinition.getTableHeaderCompactionType() !== null)
		{
			inaStructure.putString("TableHeaderCompactionType", tableDefinition.getTableHeaderCompactionType().getName());
		}
		if (tableDefinition.getTableMemberHeaderHandling() !== null)
		{
			inaStructure.putString("TableMemberHeaderHandling", tableDefinition.getTableMemberHeaderHandling().getName());
		}
		if (this.isBooleanSet(tableDefinition.isShowCoordinateHeader()))
		{
			inaStructure.putBoolean("ShowCoordinateHeader", tableDefinition.isShowCoordinateHeader().getBoolean());
		}
		inaStructure.putStringNotNullAndNotEmpty("HeaderColor", tableDefinition.getHeaderColor());
		inaStructure.putStringNotNullAndNotEmpty("TotalLevel6Color", tableDefinition.getTotalLevel6Color());
		inaStructure.putStringNotNullAndNotEmpty("TotalLevel5Color", tableDefinition.getTotalLevel5Color());
		inaStructure.putStringNotNullAndNotEmpty("TotalLevel4Color", tableDefinition.getTotalLevel4Color());
		inaStructure.putStringNotNullAndNotEmpty("TotalLevel3Color", tableDefinition.getTotalLevel3Color());
		inaStructure.putStringNotNullAndNotEmpty("TotalLevel2Color", tableDefinition.getTotalLevel2Color());
		inaStructure.putStringNotNullAndNotEmpty("TotalLevel1Color", tableDefinition.getTotalLevel1Color());
		inaStructure.putStringNotNullAndNotEmpty("TotalLevel0Color", tableDefinition.getTotalLevel0Color());
		inaStructure.putStringNotNullAndNotEmpty("Title", tableDefinition.getTitle());
		var linkPriorities = tableDefinition.getLinkedDefinitionPriorities();
		if (oFF.XCollectionUtils.hasElements(linkPriorities))
		{
			var prioList = inaStructure.putNewList("LinkedDefinitionPriorities");
			oFF.XCollectionUtils.forEachString(linkPriorities.getKeysAsReadOnlyListOfString(),  function(prioKey){
				var prioStruct = prioList.addNewStructure();
				prioStruct.putString("Key", prioKey);
				prioStruct.putInteger("Priority", linkPriorities.getByKey(prioKey).getInteger());
			}.bind(this));
		}
		var linkNames = tableDefinition.getLinkedDefinitionNames();
		if (oFF.XCollectionUtils.hasElements(linkNames))
		{
			var nameList = inaStructure.putNewList("LinkedDefinitionNames");
			oFF.XCollectionUtils.forEachString(linkNames.getKeysAsReadOnlyListOfString(),  function(nameKey){
				var nameStruct = nameList.addNewStructure();
				nameStruct.putString("Key", nameKey);
				nameStruct.putString("Name", linkNames.getByKey(nameKey));
			}.bind(this));
		}
		if (tableDefinition.isSerializeLinkedDefinitions())
		{
			inaStructure.putBoolean("LinkedDefinitionsSerialize", true);
			var linkedDefinitions = tableDefinition.getLinkedDefinitions();
			if (oFF.XCollectionUtils.hasElements(linkedDefinitions))
			{
				var linkedDefinitionsList = inaStructure.putNewList("LinkedDefinitions");
				oFF.XCollectionUtils.forEachString(linkedDefinitions.getKeysAsReadOnlyListOfString(),  function(defKey){
					var linkedDefinitionStruct = linkedDefinitionsList.addNewStructure();
					linkedDefinitionStruct.putString("Key", defKey);
					linkedDefinitionStruct.put("TableDefinition", linkedDefinitions.getByKey(defKey).serializeToElement(exporter.mode));
				}.bind(this));
			}
		}
	}
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};
oFF.QInARepoTableDefinition.prototype.exportIndexBasedCellDimensions = function(tableDefinition, inaStructure)
{
	var keys;
	var key;
	var fixedRowHeights = tableDefinition.getFixedPixelHeightsForRows();
	if (oFF.XCollectionUtils.hasElements(fixedRowHeights))
	{
		var rowHeightsIna = inaStructure.putNewList("FixedPixelRowHeights");
		keys = fixedRowHeights.getKeysAsIterator();
		while (keys.hasNext())
		{
			key = keys.next();
			var rowHeight = rowHeightsIna.addNewStructure();
			rowHeight.putInteger("Index", key.getInteger());
			rowHeight.putInteger("Height", fixedRowHeights.getByKey(key).getInteger());
		}
	}
	var fixedColumnWidths = tableDefinition.getFixedPixelWidthsForColumns();
	if (oFF.XCollectionUtils.hasElements(fixedColumnWidths))
	{
		var columnWidthsIna = inaStructure.putNewList("FixedPixelColumnWidths");
		keys = fixedColumnWidths.getKeysAsIterator();
		while (keys.hasNext())
		{
			key = keys.next();
			var columnWidth = columnWidthsIna.addNewStructure();
			columnWidth.putInteger("Index", key.getInteger());
			columnWidth.putInteger("Width", fixedColumnWidths.getByKey(key).getInteger());
		}
	}
};
oFF.QInARepoTableDefinition.prototype.exportFormattingStyles = function(tableDefinition, inaStructure)
{
	var formattingStyles = tableDefinition.getFormattingStyles();
	if (oFF.XCollectionUtils.hasElements(formattingStyles))
	{
		var formattingStyleList = inaStructure.putNewList("Styles");
		for (var i = 0; i < formattingStyles.size(); i++)
		{
			var formattingStyle = formattingStyles.get(i);
			var formattingStyleStruct = formattingStyleList.addNewStructure();
			formattingStyleStruct.putString("Name", formattingStyle.getName());
			formattingStyleStruct.putString("Text", formattingStyle.getText());
			this.exportStyledLine(formattingStyle.getStyledLineLeft(), formattingStyleStruct.putNewStructure("LeftLine"));
			this.exportStyledLine(formattingStyle.getStyledLineRight(), formattingStyleStruct.putNewStructure("RightLine"));
			this.exportStyledLine(formattingStyle.getStyledLineTop(), formattingStyleStruct.putNewStructure("TopLine"));
			this.exportStyledLine(formattingStyle.getStyledLineBottom(), formattingStyleStruct.putNewStructure("BottomLine"));
			formattingStyleStruct.putString("FillColor", formattingStyle.getFillColor());
			if (this.isBooleanSet(formattingStyle.isFontBoldExt()))
			{
				formattingStyleStruct.putBoolean("FontBold", formattingStyle.isFontBold());
			}
			if (this.isBooleanSet(formattingStyle.isFontItalicExt()))
			{
				formattingStyleStruct.putBoolean("FontItalic", formattingStyle.isFontItalic());
			}
			if (this.isBooleanSet(formattingStyle.isFontUnderlineExt()))
			{
				formattingStyleStruct.putBoolean("FontUnderline", formattingStyle.isFontUnderline());
			}
			if (this.isBooleanSet(formattingStyle.isFontStrikeThroughExt()))
			{
				formattingStyleStruct.putBoolean("FontStrikeThrough", formattingStyle.isFontStrikeThrough());
			}
			formattingStyleStruct.putDouble("FontSize", formattingStyle.getFontSize());
			formattingStyleStruct.putString("FontFamily", formattingStyle.getFontFamily());
			formattingStyleStruct.putString("FontColor", formattingStyle.getFontColor());
			formattingStyleStruct.putString("CellChartBarColor", formattingStyle.getCellChartBarColor());
			formattingStyleStruct.putString("CellChartLineColor", formattingStyle.getCellChartLineColor());
			formattingStyleStruct.putString("AlertColor", formattingStyle.getAlertColor());
			if (formattingStyle.getAlertSymbol() !== null)
			{
				formattingStyleStruct.putString("AlertSymbol", formattingStyle.getAlertSymbol().getName());
			}
			if (formattingStyle.getVerticalAlignment() !== null)
			{
				formattingStyleStruct.putString("VerticalAlignment", formattingStyle.getVerticalAlignment().getName());
			}
			if (formattingStyle.getHorizontalAlignment() !== null)
			{
				formattingStyleStruct.putString("HorizontalAlignment", formattingStyle.getHorizontalAlignment().getName());
			}
			formattingStyleStruct.putInteger("Priority", formattingStyle.getPriority());
			if (formattingStyle.getBackgroundPatternType() !== null)
			{
				formattingStyleStruct.putString("PatternType", formattingStyle.getBackgroundPatternType().getName());
			}
			formattingStyleStruct.putStringNotNullAndNotEmpty("PatternBackground", formattingStyle.getBackgroundContent());
		}
	}
};
oFF.QInARepoTableDefinition.prototype.exportStyledLine = function(styledLine, exportStructure)
{
	if (styledLine.getWidth() > -1)
	{
		exportStructure.putDouble("LineWidth", styledLine.getWidth());
	}
	exportStructure.putStringNotNullAndNotEmpty("LineColor", styledLine.getColor());
	exportStructure.putStringNotNullAndNotEmpty("PatternBackground", styledLine.getPatternBackground());
	if (styledLine.getPatternWidth() > 0)
	{
		exportStructure.putDouble("PatternWidth", styledLine.getPatternWidth());
	}
	exportStructure.putStringNotNullAndNotEmpty("PatternColor", styledLine.getPatternColor());
	exportStructure.putStringNotNullAndNotEmpty("PatternBorderColor", styledLine.getPatternBorderColor());
	if (styledLine.getPatternType() !== null)
	{
		exportStructure.putString("PatternType", styledLine.getPatternType().getName());
	}
	if (styledLine.getLineStyle() !== null)
	{
		exportStructure.putString("LineStyle", styledLine.getLineStyle().getName());
	}
	if (styledLine.getLeftPadding() > -1)
	{
		exportStructure.putDouble("PaddingLeft", styledLine.getLeftPadding());
	}
	if (styledLine.getRightPadding() > -1)
	{
		exportStructure.putDouble("PaddingRight", styledLine.getRightPadding());
	}
	if (styledLine.getTopPadding() > -1)
	{
		exportStructure.putDouble("PaddingTop", styledLine.getTopPadding());
	}
	if (styledLine.getBottomPadding() > -1)
	{
		exportStructure.putDouble("PaddingBottom", styledLine.getBottomPadding());
	}
};
oFF.QInARepoTableDefinition.prototype.exportDataPointStyles = function(tableDefinition, inaStructure)
{
	var dataPointStyles = tableDefinition.getDataPointStyles();
	if (oFF.XCollectionUtils.hasElements(dataPointStyles))
	{
		var dataPointStyleList = inaStructure.putNewList("DataPointStyle");
		for (var i = 0; i < dataPointStyles.size(); i++)
		{
			var dataPointStyleStructure = dataPointStyleList.addNewStructure();
			var dataPointStyle = dataPointStyles.get(i);
			dataPointStyleStructure.putString("Name", dataPointStyle.getName());
			dataPointStyleStructure.putString("Text", dataPointStyle.getText());
			dataPointStyleStructure.putString("Style", dataPointStyle.getFormattingStyleName());
			dataPointStyleStructure.putString("ExceptionName", dataPointStyle.getExceptionName());
			if (dataPointStyle.getAlertLevelMin() !== null)
			{
				dataPointStyleStructure.putInteger("AlertLevelMin", dataPointStyle.getAlertLevelMin().getLevel());
			}
			if (dataPointStyle.getAlertLevelMax() !== null)
			{
				dataPointStyleStructure.putInteger("AlertLevelMax", dataPointStyle.getAlertLevelMax().getLevel());
			}
			if (dataPointStyle.getValueSign() !== null)
			{
				dataPointStyleStructure.putString("ValueSign", dataPointStyle.getValueSign().getName());
			}
			dataPointStyleStructure.putInteger("Priority", dataPointStyle.getPriority());
		}
	}
};
oFF.QInARepoTableDefinition.prototype.exportScopedStyles = function(exporter, tableDefinition, inaStructure)
{
	var scopedStyles = tableDefinition.getScopedStyles();
	if (oFF.XCollectionUtils.hasElements(scopedStyles))
	{
		var inaList = inaStructure.putNewList("ScopedStyle");
		for (var i = 0; i < scopedStyles.size(); i++)
		{
			var scopedStyle = scopedStyles.get(i);
			var scopedStyleStruct = inaList.addNewStructure();
			scopedStyleStruct.putString("Name", scopedStyle.getName());
			scopedStyleStruct.putString("Text", scopedStyle.getText());
			scopedStyleStruct.putString("Style", scopedStyle.getStyleName());
			exporter.exportVisualizationCellReferenceScope(scopedStyle.getOrthogonalRowsScope(), scopedStyleStruct.putNewStructure("RowsScope"));
			exporter.exportVisualizationCellReferenceScope(scopedStyle.getOrthogonalColumnsScope(), scopedStyleStruct.putNewStructure("ColumnsScope"));
		}
	}
};
oFF.QInARepoTableDefinition.prototype.exportTableMarkups = function(exporter, tableDefinition, inaStructure)
{
	var tableMarkups = tableDefinition.getTableMarkups();
	if (oFF.XCollectionUtils.hasElements(tableMarkups))
	{
		var tableMarkupInAList = inaStructure.putNewList("TableMarkup");
		for (var i = 0; i < tableMarkups.size(); i++)
		{
			var tableMarkup = tableMarkups.get(i);
			var tableMarkupStructure = tableMarkupInAList.addNewStructure();
			tableMarkupStructure.putString("Name", tableMarkup.getName());
			tableMarkupStructure.putString("Text", tableMarkup.getText());
			tableMarkupStructure.putInteger("Height", tableMarkup.getCellHeight());
			tableMarkupStructure.putInteger("Width", tableMarkup.getCellWidth());
			this.exportPageBreakHandling(tableMarkupStructure, "PageBreakBefore", tableMarkup.getPageBreakHandlingBefore());
			this.exportPageBreakHandling(tableMarkupStructure, "PageBreakAfter", tableMarkup.getPageBreakHandlingAfter());
			this.exportPageBreakHandling(tableMarkupStructure, "PageBreakInside", tableMarkup.getPageBreakHandlingInside());
			tableMarkupStructure.putInteger("Priority", tableMarkup.getPriority());
			var scopedStyleNames = tableMarkup.getScopedStyleNames();
			if (oFF.XCollectionUtils.hasElements(scopedStyleNames))
			{
				tableMarkupStructure.putNewList("ScopedStyle").addAllStrings(scopedStyleNames);
			}
			var tuplesBefore = tableMarkup.getTuplesBefore();
			this.exportInsertedTuples(tuplesBefore, tableMarkupStructure, "InsertedTupleBefore");
			var tuplesAfter = tableMarkup.getTuplesAfter();
			this.exportInsertedTuples(tuplesAfter, tableMarkupStructure, "InsertedTupleAfter");
			exporter.exportVisualizationCellReferenceScope(tableMarkup.getRowsScope(), tableMarkupStructure.putNewStructure("RowsScope"));
			exporter.exportVisualizationCellReferenceScope(tableMarkup.getColumnsScope(), tableMarkupStructure.putNewStructure("ColumnsScope"));
		}
	}
};
oFF.QInARepoTableDefinition.prototype.exportPageBreakHandling = function(tableMarkupStructure, key, pageBreakHandling)
{
	if (oFF.notNull(pageBreakHandling))
	{
		tableMarkupStructure.putString(key, pageBreakHandling.getName());
	}
};
oFF.QInARepoTableDefinition.prototype.exportInsertedTuples = function(tuples, tableMarkupStructure, tuplesExportKey)
{
	if (oFF.XCollectionUtils.hasElements(tuples))
	{
		var tuplesRepoList = tableMarkupStructure.putNewList(tuplesExportKey);
		for (var i = 0; i < tuples.size(); i++)
		{
			var tuple = tuples.get(i);
			var tupleRepoStructure = tuplesRepoList.addNewStructure();
			tupleRepoStructure.putString("Name", tuple.getName());
			tupleRepoStructure.putString("Text", tuple.getText());
			tupleRepoStructure.putString("FormattedText", tuple.getFormattedText());
			tupleRepoStructure.putInteger("Height", tuple.getCellHeight());
			tupleRepoStructure.putInteger("Width", tuple.getCellWidth());
			tupleRepoStructure.putBoolean("MergeCells", tuple.isMerged());
			var scopedStyleNames = tuple.getScopedStyleNames();
			if (oFF.XCollectionUtils.hasElements(scopedStyleNames))
			{
				tupleRepoStructure.putNewList("ScopedStyle").addAllStrings(scopedStyleNames);
			}
		}
	}
};
oFF.QInARepoTableDefinition.prototype.isBooleanSet = function(ttb)
{
	return oFF.notNull(ttb) && ttb !== oFF.TriStateBool._DEFAULT;
};

oFF.QInARepoVisualizationManager = function() {};
oFF.QInARepoVisualizationManager.prototype = new oFF.QInARepository();
oFF.QInARepoVisualizationManager.prototype._ff_c = "QInARepoVisualizationManager";

oFF.QInARepoVisualizationManager.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.VISUALIZATION_MANAGER;
};
oFF.QInARepoVisualizationManager.prototype.getTagName = function()
{
	return "VisualizationManager";
};
oFF.QInARepoVisualizationManager.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	if (oFF.notNull(inaStructure) && oFF.notNull(modelComponent) && modelComponent.getOlapComponentType() === oFF.OlapComponentType.VISUALIZATION_MANAGER)
	{
		var inaList = inaStructure.getListByKey("Elements");
		if (oFF.XCollectionUtils.hasElements(inaList))
		{
			this.importComponentWithList(importer, inaList, modelComponent, parentComponent, context);
		}
	}
	return modelComponent;
};
oFF.QInARepoVisualizationManager.prototype.importComponentWithList = function(importer, inaList, modelComponent, parentComponent, context)
{
	var visualizationManagerBase = modelComponent;
	visualizationManagerBase.setRepoSerializationActive(true);
	for (var i = 0; i < inaList.size(); i++)
	{
		var inaVisualizationDefinition = inaList.getStructureAt(i);
		var name = inaVisualizationDefinition.getStringByKey("Name");
		var protocolBindingType = oFF.QInAConverter.lookupProtocolBindingType(inaVisualizationDefinition.getStringByKey("ProtocolBindingType"));
		var semanticBindingType = oFF.QInAConverter.lookupSemanticBindingType(inaVisualizationDefinition.getStringByKey("SemanticBindingType"));
		var visualizationDefinition = visualizationManagerBase.getOrCreateVisualisationDefinition(name, protocolBindingType, semanticBindingType);
		importer.importVisualizationDefinition(inaVisualizationDefinition, visualizationDefinition);
	}
};
oFF.QInARepoVisualizationManager.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	if (oFF.notNull(modelComponent) && modelComponent.getOlapComponentType() === oFF.OlapComponentType.VISUALIZATION_MANAGER)
	{
		var inaList = this.exportComponentWithList(exporter, modelComponent, flags);
		if (oFF.XCollectionUtils.hasElements(inaList))
		{
			inaStructure.put("Elements", inaList);
		}
	}
	return oFF.QInARepository.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};
oFF.QInARepoVisualizationManager.prototype.exportComponentWithList = function(exporter, modelComponent, flags)
{
	var inaList = null;
	var visualizationManagerBase = modelComponent;
	var visualizationDefinitions = visualizationManagerBase.getVisualizationDefinitions();
	if (oFF.XCollectionUtils.hasElements(visualizationDefinitions))
	{
		inaList = oFF.PrFactory.createList();
		for (var i = 0; i < visualizationDefinitions.size(); i++)
		{
			var structure = inaList.addNewStructure();
			structure.putString("Name", visualizationDefinitions.get(i).getName());
			structure.putString("ProtocolBindingType", visualizationDefinitions.get(i).getProtocolBindingType().getName());
			structure.putString("SemanticBindingType", visualizationDefinitions.get(i).getSemanticBindingType().getName());
			exporter.exportVisualizationDefinition(visualizationDefinitions.get(i), structure);
		}
	}
	return inaList;
};

oFF.QInA = function() {};
oFF.QInA.prototype = new oFF.MessageManager();
oFF.QInA.prototype._ff_c = "QInA";

oFF.QInA.s_lookupByFormat = null;
oFF.QInA.staticSetup = function()
{
	oFF.QInA.s_lookupByFormat = oFF.XHashMapByString.create();
	oFF.QInA.addAllFormats();
	oFF.QInA.addAllTypes();
};
oFF.QInA.staticSetupForPlanning = function()
{
	oFF.QInA.addAllPlanningTypes();
};
oFF.QInA.addInAComponent = function(inaComponent)
{
	var componentTypeName = inaComponent.getComponentType().getName();
	var modelFormat = inaComponent.getModelFormat();
	if (oFF.isNull(modelFormat))
	{
		modelFormat = oFF.QModelFormat.INA_DATA;
	}
	var usages = modelFormat.getUsages();
	var size = usages.size();
	for (var k = 0; k < size; k++)
	{
		var otherModelFormat = usages.get(k);
		var usageFormatName = otherModelFormat.getName();
		var list = oFF.QInA.s_lookupByFormat.getByKey(usageFormatName);
		var container2 = list.getByKey(componentTypeName);
		oFF.XObjectExt.assertNotNullExt(container2, oFF.XStringUtils.concatenate2("Container not defined: ", componentTypeName));
		container2.add(inaComponent);
	}
};
oFF.QInA.addAllTypes = function()
{
	oFF.QInA.addType(oFF.OlapComponentType.CONDITIONS_MANAGER);
	oFF.QInA.addType(oFF.OlapComponentType.CONDITION);
	oFF.QInA.addType(oFF.OlapComponentType.CONDITIONS_THRESHOLD);
	oFF.QInA.addType(oFF.OlapComponentType.CONDITIONS);
	oFF.QInA.addType(oFF.OlapComponentType.QUERY_MODEL);
	oFF.QInA.addType(oFF.OlapComponentType.DATA_CELL);
	oFF.QInA.addType(oFF.OlapComponentType.AXIS);
	oFF.QInA.addType(oFF.OlapComponentType.SORT_MANAGER);
	oFF.QInA.addType(oFF.OlapComponentType.LAYER_MODEL);
	oFF.QInA.addType(oFF.OlapComponentType.DATA_SOURCE);
	oFF.QInA.addType(oFF.OlapComponentType.DOCUMENTS_INFO);
	oFF.QInA.addType(oFF.OlapComponentType.SELECTOR);
	oFF.QInA.addType(oFF.OlapComponentType.ATTRIBUTE_CONTAINER);
	oFF.QInA.addType(oFF.OlapComponentType.ATTRIBUTE);
	oFF.QInA.addType(oFF.OlapComponentType.CELL_CONTEXT_MANAGER);
	oFF.QInA.addType(oFF.OlapComponentType.CELL_CONTEXT);
	oFF.QInA.addType(oFF.OlapComponentType.DRILL_MANAGER);
	oFF.QInA.addType(oFF.OlapComponentType.DRILL_OPERATION);
	oFF.QInA.addType(oFF.OlapComponentType.CURRENCY_TRANSLATION_MANAGER);
	oFF.QInA.addType(oFF.OlapComponentType.CURRENCY_TRANSLATION_LIST);
	oFF.QInA.addType(oFF.OlapComponentType.CURRENCY_TRANSLATION_ITEM);
	oFF.QInA.addType(oFF.OlapComponentType.MEASURE_TRANSLATIONS);
	oFF.QInA.addType(oFF.OlapComponentType.FIELD_CONTAINER);
	oFF.QInA.addType(oFF.OlapComponentType.FIELD_LIST);
	oFF.QInA.addType(oFF.OlapComponentType.FIELD);
	oFF.QInA.addType(oFF.OlapComponentType.RESULT_STRUCTURE);
	oFF.QInA.addType(oFF.OlapComponentType.DATA_CELLS);
	oFF.QInA.addType(oFF.OlapComponentType.TOTALS);
	oFF.QInA.addType(oFF.OlapComponentType.EXCEPTION_MANAGER);
	oFF.QInA.addType(oFF.OlapComponentType.FORMULA_EXCEPTION_MANAGER);
	oFF.QInA.addType(oFF.OlapComponentType.FORMULA_EXCEPTION);
	oFF.QInA.addType(oFF.OlapComponentType.QUERY_SETTINGS);
	oFF.QInA.addType(oFF.OlapComponentType.HIERARCHY);
	oFF.QInA.addType(oFF.OlapComponentType.HIERARCHY_MANAGER);
	oFF.QInA.addType(oFF.OlapComponentType.CUSTOM_HIERARCHY_REPOSITORY);
	oFF.QInA.addType(oFF.OlapComponentType.CUSTOM_HIERARCHY_DEFINITION);
	oFF.QInA.addType(oFF.OlapComponentType.AXES_SETTINGS);
	oFF.QInA.addType(oFF.OlapComponentType.PROPERTY);
	oFF.QInA.addType(oFF.OlapComponentType.PLANNING_X_COMMAND);
	oFF.QInA.addType(oFF.OlapComponentType.UNIVERSAL_DISPLAY_HIERARCHIES);
	oFF.QInA.addType(oFF.OlapComponentType.QUERY_CELLS);
	oFF.QInA.addType(oFF.MemberType.DRILL_PATH_ELEMENT);
	oFF.QInA.addType(oFF.MemberType.MEMBER);
	oFF.QInA.addType(oFF.MemberType.SINGLE_MEMBER_EXIT);
	oFF.QInA.addType(oFF.MemberType.MEMBER_EXITS);
	oFF.QInA.addType(oFF.MemberType.LITERAL_MEMBER);
	oFF.QInA.addType(oFF.MemberType.BASIC_MEASURE);
	oFF.QInA.addType(oFF.MemberType.FORMULA);
	oFF.QInA.addType(oFF.MemberType.SERVER_BASED_FORMULA);
	oFF.QInA.addType(oFF.MemberType.RESTRICTED_MEASURE);
	oFF.QInA.addType(oFF.MemberType.VARIANCE);
	oFF.QInA.addType(oFF.MemberType.EXCEPTION_AGGREGATION);
	oFF.QInA.addType(oFF.MemberType.CURRENCY_MEASURE);
	oFF.QInA.addType(oFF.MemberType.RUNNING_TOTAL);
	oFF.QInA.addType(oFF.MemberType.HIERARCHY_NODE);
	oFF.QInA.addType(oFF.MemberType.RESULT);
	oFF.QInA.addType(oFF.MemberType.CONDITION_RESULT);
	oFF.QInA.addType(oFF.MemberType.CONDITION_OTHERS_RESULT);
	oFF.QInA.addType(oFF.MemberType.MEASURE);
	oFF.QInA.addType(oFF.MemberType.ABSTRACT_MEMBER);
	oFF.QInA.addType(oFF.OlapComponentType.EXCEPTION_AGGREGATION_MANAGER);
	oFF.QInA.addType(oFF.OlapComponentType.FORMULA_CONSTANT);
	oFF.QInA.addType(oFF.OlapComponentType.FORMULA_ITEM_MEMBER);
	oFF.QInA.addType(oFF.OlapComponentType.FORMULA_OPERATION);
	oFF.QInA.addType(oFF.OlapComponentType.FORMULA_FUNCTION);
	oFF.QInA.addType(oFF.OlapComponentType.MEMBERS);
	oFF.QInA.addType(oFF.OlapComponentType.DIMENSION_SORTING);
	oFF.QInA.addType(oFF.OlapComponentType.FIELD_SORTING);
	oFF.QInA.addType(oFF.OlapComponentType.DATA_CELL_SORTING);
	oFF.QInA.addType(oFF.OlapComponentType.COMPLEX_SORTING);
	oFF.QInA.addType(oFF.OlapComponentType.MEASURE_SORTING);
	oFF.QInA.addType(oFF.OlapComponentType.GENERIC_SORTING);
	oFF.QInA.addType(oFF.OlapComponentType.LAYER);
	oFF.QInA.addType(oFF.OlapComponentType.LAYER_SYNC_DEFINITION);
	oFF.QInA.addType(oFF.OlapComponentType.LAYER_REFERENCE_DEFINITION);
	oFF.QInA.addType(oFF.OlapComponentType.ABSTRACT_LAYER_MODEL);
	oFF.QInA.addType(oFF.OlapComponentType.VARIABLE_MANAGER);
	oFF.QInA.addType(oFF.OlapComponentType.VARIABLE_CONTAINER);
	oFF.QInA.addType(oFF.OlapComponentType.VARIABLE_LIST);
	oFF.QInA.addType(oFF.VariableType.TEXT_VARIABLE);
	oFF.QInA.addType(oFF.VariableType.FORMULA_VARIABLE);
	oFF.QInA.addType(oFF.VariableType.HIERARCHY_NODE_VARIABLE);
	oFF.QInA.addType(oFF.VariableType.HIERARCHY_NAME_VARIABLE);
	oFF.QInA.addType(oFF.VariableType.HIERARCHY_VARIABLE);
	oFF.QInA.addType(oFF.VariableType.OPTION_LIST_VARIABLE);
	oFF.QInA.addType(oFF.VariableType.DIMENSION_MEMBER_VARIABLE);
	oFF.QInA.addType(oFF.VariableType.SIMPLE_TYPE_VARIABLE);
	oFF.QInA.addType(oFF.VariableType.ANY_VARIABLE);
	oFF.QInA.addType(oFF.OlapComponentType.VARIABLE_CONTEXT);
	oFF.QInA.addType(oFF.OlapComponentType.OLAP_FILTER_MANAGER);
	oFF.QInA.addType(oFF.OlapComponentType.FILTER_CAPABILITY_GROUP);
	oFF.QInA.addType(oFF.OlapComponentType.FILTER_CAPABILITY);
	oFF.QInA.addType(oFF.OlapComponentType.FILTER_EXPRESSION);
	oFF.QInA.addType(oFF.OlapComponentType.FILTER_LITERAL);
	oFF.QInA.addType(oFF.OlapComponentType.FILTER_FIXED);
	oFF.QInA.addType(oFF.OlapComponentType.FILTER_DYNAMIC);
	oFF.QInA.addType(oFF.OlapComponentType.FILTER_VISIBILITY);
	oFF.QInA.addType(oFF.OlapComponentType.FILTER_CELL_VALUE_OPERAND);
	oFF.QInA.addType(oFF.FilterComponentType.CARTESIAN_LIST);
	oFF.QInA.addType(oFF.FilterComponentType.CONVERTED_TIME_CARTESIAN_LIST);
	oFF.QInA.addType(oFF.FilterComponentType.CARTESIAN_PRODUCT);
	oFF.QInA.addType(oFF.FilterComponentType.AND);
	oFF.QInA.addType(oFF.FilterComponentType.OR);
	oFF.QInA.addType(oFF.FilterComponentType.NOT);
	oFF.QInA.addType(oFF.FilterComponentType.SPATIAL_FILTER);
	oFF.QInA.addType(oFF.FilterComponentType.BOOLEAN_ALGEBRA);
	oFF.QInA.addType(oFF.FilterComponentType.OPERATION);
	oFF.QInA.addType(oFF.FilterComponentType.DATE_RANGE_OPERATION);
	oFF.QInA.addType(oFF.FilterComponentType.FILTER_MEASURE_BASED);
	oFF.QInA.addType(oFF.FilterComponentType.FILTER_ACROSS_MODELS);
	oFF.QInA.addType(oFF.FilterComponentType.FILTER_DYNAMIC_TIME_REGULAR_RANGE);
	oFF.QInA.addType(oFF.FilterComponentType.FILTER_DYNAMIC_TIME_TO_DATE_RANGE);
	oFF.QInA.addType(oFF.FilterComponentType.FILTER_FIXED_TIME_RANGE);
	oFF.QInA.addType(oFF.OlapComponentType.FILTER_ELEMENT);
	oFF.QInA.addType(oFF.OlapComponentType.DIMENSION_CONTEXT);
	oFF.QInA.addType(oFF.OlapComponentType.DIMENSIONS);
	oFF.QInA.addType(oFF.DimensionType.PRESENTATION);
	oFF.QInA.addType(oFF.DimensionType.CONTAINER);
	oFF.QInA.addType(oFF.DimensionType.ATTRIBUTE_DIM);
	oFF.QInA.addType(oFF.DimensionType.CURRENCY);
	oFF.QInA.addType(oFF.DimensionType.UNIT);
	oFF.QInA.addType(oFF.DimensionType.TIME);
	oFF.QInA.addType(oFF.DimensionType.DATE);
	oFF.QInA.addType(oFF.DimensionType.HIERARCHY_VERSION);
	oFF.QInA.addType(oFF.DimensionType.HIERARCHY_NAME);
	oFF.QInA.addType(oFF.DimensionType.SEARCH_DIMENSION);
	oFF.QInA.addType(oFF.DimensionType.VERSION_EPM);
	oFF.QInA.addType(oFF.DimensionType.VERSION_IBP);
	oFF.QInA.addType(oFF.DimensionType.ACCOUNT);
	oFF.QInA.addType(oFF.DimensionType.GIS_DIMENSION);
	oFF.QInA.addType(oFF.DimensionType.SEARCH_RESULT);
	oFF.QInA.addType(oFF.DimensionType.SUGGEST_TERM);
	oFF.QInA.addType(oFF.DimensionType.SUGGEST_SCOPE);
	oFF.QInA.addType(oFF.DimensionType.SUGGEST_ATTRIBUTE);
	oFF.QInA.addType(oFF.DimensionType.MEASURE_STRUCTURE);
	oFF.QInA.addType(oFF.DimensionType.SECONDARY_STRUCTURE);
	oFF.QInA.addType(oFF.DimensionType.ABSTRACT_STRUCTURE);
	oFF.QInA.addType(oFF.DimensionType.DIMENSION);
	oFF.QInA.addType(oFF.DimensionType.CALCULATED_DIMENSION);
	oFF.QInA.addType(oFF.DimensionType.FORMULA_CALCULATED_DIMENSION);
	oFF.QInA.addType(oFF.OlapComponentType.ABSTRACT_DIMENSION);
	oFF.QInA.addType(oFF.FilterComponentType.TUPLE);
	oFF.QInA.addType(oFF.FilterComponentType.VIRTUAL_DATASOURCE);
	oFF.QInA.addType(oFF.OlapComponentType.MODELLER_CURRENCY_TRANSLATION);
	oFF.QInA.addType(oFF.OlapComponentType.MODELLER_DIMENSIONS);
	oFF.QInA.addType(oFF.OlapComponentType.MODELLER_METADATA_PROPERTIES);
	oFF.QInA.addType(oFF.OlapComponentType.MODELLER_VARIABLES);
	oFF.QInA.addType(oFF.OlapComponentType.QUERY_MANAGER);
	oFF.QInA.addType(oFF.OlapComponentType.QUERY_SERVICE_CONFIG);
	oFF.QInA.addType(oFF.OlapComponentType.COMPONENT_LIST);
	oFF.QInA.addType(oFF.OlapComponentType.QUERY_CONTEXT);
	oFF.QInA.addType(oFF.OlapComponentType.OLAP);
	oFF.QInA.addType(oFF.OlapComponentType.BLENDABLE_QUERY_MANAGER);
	oFF.QInA.addType(oFF.OlapComponentType.VISUALIZATION_MANAGER);
	oFF.QInA.addType(oFF.OlapComponentType.VISUALIZATION_CELL_REFERENCE_SCOPE);
	oFF.QInA.addType(oFF.OlapComponentType.VISUALIZATION_DEFINITION);
	oFF.QInA.addType(oFF.OlapComponentType.VISUALIZATION_TABLE_DEFINITION);
	oFF.QInA.addType(oFF.OlapComponentType.VISUALIZATION_CHART_DEFINITION);
	oFF.QInA.addType(oFF.OlapComponentType.VISUALIZATION_CUSTOM_DEFINITION);
};
oFF.QInA.addAllPlanningTypes = function()
{
	oFF.QInA.addType(oFF.OlapComponentType.PLANNING_MODEL);
	oFF.QInA.addType(oFF.OlapComponentType.PLANNING_ACTION);
	oFF.QInA.addType(oFF.OlapComponentType.PLANNING_MODEL_COMMAND);
	oFF.QInA.addType(oFF.OlapComponentType.PLANNING_MODEL_CLOSE_COMMAND);
	oFF.QInA.addType(oFF.OlapComponentType.PLANNING_MODEL_CLEANUP_COMMAND);
	oFF.QInA.addType(oFF.OlapComponentType.PLANNING_MODEL_REFRESH_ACTIONS_COMMAND);
	oFF.QInA.addType(oFF.OlapComponentType.PLANNING_MODEL_REFRESH_VERSIONS_COMMAND);
	oFF.QInA.addType(oFF.OlapComponentType.PLANNING_MODEL_UPDATE_VERSION_PRIVILEGES_COMMAND);
	oFF.QInA.addType(oFF.OlapComponentType.PLANNING_VERSION_COMMAND);
	oFF.QInA.addType(oFF.OlapComponentType.PLANNING_VERSION_INIT_COMMAND);
	oFF.QInA.addType(oFF.OlapComponentType.PLANNING_VERSION_CLOSE_COMMAND);
	oFF.QInA.addType(oFF.OlapComponentType.PLANNING_VERSION_START_ACTION_SEQUENCE_COMMAND);
	oFF.QInA.addType(oFF.OlapComponentType.PLANNING_VERSION_END_ACTION_SEQUENCE_COMMAND);
	oFF.QInA.addType(oFF.OlapComponentType.PLANNING_VERSION_SET_PARAMETERS_COMMAND);
	oFF.QInA.addType(oFF.OlapComponentType.PLANNING_VERSION_SET_TIMEOUT_COMMAND);
	oFF.QInA.addType(oFF.OlapComponentType.PLANNING_VERSION_STATE_DESCRIPTIONS_COMMAND);
	oFF.QInA.addType(oFF.OlapComponentType.PLANNING_VERSION_UNDO_REDO_COMMAND);
	oFF.QInA.addType(oFF.OlapComponentType.DATA_AREA_COMMAND);
	oFF.QInA.addType(oFF.OlapComponentType.DATA_AREA_COMMAND_CLOSE);
	oFF.QInA.addType(oFF.OlapComponentType.DATA_AREA_GET_FUNCTION_METADATA);
	oFF.QInA.addType(oFF.OlapComponentType.DATA_AREA_GET_SEQUENCE_METADATA);
	oFF.QInA.addType(oFF.OlapComponentType.LIGHTWEIGHT_DATA_AREA_COMMAND);
};
oFF.QInA.addType = function(componentType)
{
	var all = oFF.QModelFormat.getAllModelFormats();
	var size = all.size();
	for (var i = 0; i < size; i++)
	{
		var name = all.get(i).getName();
		var list = oFF.QInA.s_lookupByFormat.getByKey(name);
		list.add(oFF.QInAComponentContainer.create(componentType));
	}
};
oFF.QInA.addAllFormats = function()
{
	var all = oFF.QModelFormat.getAllModelFormats();
	var size = all.size();
	for (var i = 0; i < size; i++)
	{
		var list = oFF.XListOfNameObject.create();
		var name = all.get(i).getName();
		oFF.QInA.s_lookupByFormat.put(name, list);
	}
};
oFF.QInA.removeEmptyContainers = function()
{
	var all = oFF.QModelFormat.getAllModelFormats();
	var allSize = all.size();
	for (var i = 0; i < allSize; i++)
	{
		var list = oFF.QInA.s_lookupByFormat.getByKey(all.get(i).getName());
		for (var k = 0; k < list.size(); )
		{
			var currentComponentContainer = list.get(k);
			if (currentComponentContainer.isEmpty())
			{
				list.removeAt(k);
			}
			else
			{
				k++;
			}
		}
	}
};
oFF.QInA.prototype.m_application = null;
oFF.QInA.prototype.mode = null;
oFF.QInA.prototype.m_originalMode = null;
oFF.QInA.prototype.capabilities = null;
oFF.QInA.prototype.variableProcessingDirective = null;
oFF.QInA.prototype.modelContext = null;
oFF.QInA.prototype.setupImportExport = function(application, mode, capabilities, memberReadModeContext)
{
	var session = null;
	if (oFF.notNull(application))
	{
		session = application.getSession();
	}
	this.setupSessionContext(session);
	this.setApplication(application);
	this.mode = mode;
	this.m_originalMode = mode;
	this.modelContext = memberReadModeContext;
	if (oFF.isNull(capabilities))
	{
		this.capabilities = oFF.QCapabilities.create();
		this.capabilities.setSupportsSetOperand(true);
		this.capabilities.setSupportsConvertToFlatFilter(true);
		this.capabilities.setSupportsCummulative(true);
		this.capabilities.setSupportsExtendedSort(true);
		this.capabilities.setSupportsSpatialFilter(true);
		this.capabilities.setSupportsSpatialFilterSrid(true);
		this.capabilities.setSupportsSpatialTransformation(true);
		this.capabilities.setSupportsMemberVisibility(true);
		this.capabilities.setSupportsCustomDimensionMemberExecutionStep(true);
		this.capabilities.setSupportsExtendedDimensions(true);
		this.capabilities.setSupportsIgnoreExternalDimensions(true);
		this.capabilities.setSupportsSupplements(true);
	}
	else
	{
		this.capabilities = capabilities;
	}
};
oFF.QInA.prototype.lookupInAComponent = function(olapComponentType, inaImportElement)
{
	var componentModel = null;
	var containerList = oFF.QInA.s_lookupByFormat.getByKey(this.mode.getName());
	var container = containerList.getByKey(olapComponentType.getName());
	if (oFF.isNull(container))
	{
		var size = containerList.size();
		for (var i = 0; i < size; i++)
		{
			container = containerList.get(i);
			if (olapComponentType.isTypeOf(container.getComponentType()))
			{
				componentModel = container.get(inaImportElement);
				break;
			}
		}
	}
	else
	{
		componentModel = container.get(inaImportElement);
	}
	if (oFF.isNull(componentModel))
	{
		this.addError(0, oFF.XStringUtils.concatenate2("Cannot find serialization/deserialization component for type: ", olapComponentType.getName()));
	}
	return componentModel;
};
oFF.QInA.prototype.getApplication = function()
{
	return oFF.XWeakReferenceUtil.getHardRef(this.m_application);
};
oFF.QInA.prototype.setApplication = function(application)
{
	this.m_application = oFF.XWeakReferenceUtil.getWeakRef(application);
};
oFF.QInA.prototype.getProcess = function()
{
	return this.getApplication().getProcess();
};
oFF.QInA.prototype.getMode = function()
{
	return this.mode;
};
oFF.QInA.prototype.getOriginalMode = function()
{
	return this.m_originalMode;
};
oFF.QInA.prototype.isAbap = function(context)
{
	var modelCapabilities = context.getModelCapabilities();
	if (oFF.notNull(modelCapabilities))
	{
		var systemType = modelCapabilities.getSystemType();
		if (oFF.notNull(systemType))
		{
			return systemType.isTypeOf(oFF.SystemType.ABAP);
		}
	}
	return false;
};
oFF.QInA.prototype.isVirtualInA = function(context)
{
	return oFF.notNull(context) && context.getModelCapabilities().getSystemType().isTypeOf(oFF.SystemType.VIRTUAL_INA) && !this.getMode().isTypeOf(oFF.QModelFormat.INA_DATA_BLENDING_SOURCE);
};

oFF.QInARepoCalculatedDimension = function() {};
oFF.QInARepoCalculatedDimension.prototype = new oFF.QInARepoDimension();
oFF.QInARepoCalculatedDimension.prototype._ff_c = "QInARepoCalculatedDimension";

oFF.QInARepoCalculatedDimension.prototype.getComponentType = function()
{
	return oFF.DimensionType.CALCULATED_DIMENSION;
};
oFF.QInARepoCalculatedDimension.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var queryModel = context.getQueryModel();
	var dimension = modelComponent;
	var calcDimName = inaStructure.getStringByKey("Name");
	if (oFF.isNull(dimension) && oFF.notNull(queryModel))
	{
		dimension = queryModel.getDimensionManagerBase().getDimensionByNameInternal(calcDimName);
	}
	if (oFF.isNull(dimension))
	{
		dimension = oFF.QCalculatedDimension._createCalculatedDimension(context, parentComponent, calcDimName);
	}
	dimension.setDimensionType(oFF.DimensionType.CALCULATED_DIMENSION);
	dimension.setName(calcDimName);
	dimension.setTopEntries(inaStructure.getIntegerByKeyExt("Top", 0));
	dimension.setSkipEntries(inaStructure.getIntegerByKeyExt("Skip", 0));
	var inaDataSource = inaStructure.getStructureByKey("DataSource");
	dimension.setPreQueryName(inaDataSource.getStringByKey("ObjectName"));
	dimension.setJoinType(oFF.JoinType.lookup(inaStructure.getStringByKey("JoinType")));
	var inaJoinFields = inaStructure.getListByKey("JoinFields");
	var size = inaJoinFields.size();
	var idx;
	for (idx = 0; idx < size; idx++)
	{
		var inaJoinField = inaJoinFields.getStructureAt(idx);
		dimension.addJoinFieldByString(inaJoinField.getStringByKey("JoinFieldName"), inaJoinField.getStringByKey("JoinFieldNameInReferencedData"));
	}
	var inaFieldMappings = inaStructure.getListByKey("FieldMappings");
	size = inaFieldMappings.size();
	for (idx = 0; idx < size; idx++)
	{
		var inaFieldMapping = inaFieldMappings.getStructureAt(idx);
		dimension.addFieldMappingByString(inaFieldMapping.getStringByKey("FieldName"), inaFieldMapping.getStringByKey("FieldNameInReferencedData"));
		if (inaFieldMapping.getStringByKey("CalculatedDimensionFieldValueType") !== null)
		{
			var fieldByName = dimension.getFieldByName(inaFieldMapping.getStringByKey("FieldName"));
			fieldByName.setValueType(oFF.QInAConverter.lookupValueType(inaFieldMapping.getStringByKey("CalculatedDimensionFieldValueType")));
		}
	}
	this.importFieldsLayout(importer, inaStructure, dimension, context);
	importer.importTotals(inaStructure, dimension.getResultStructureControllerBase(), context);
	if (inaStructure.containsKey("IsHidden"))
	{
		dimension.setHidden(inaStructure.getBooleanByKey("IsHidden"));
	}
	return dimension;
};
oFF.QInARepoCalculatedDimension.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var dimension = modelComponent;
	inaStructure.putString("Name", dimension.getName());
	var type = dimension.getAxisType();
	inaStructure.putString("Axis", oFF.QInAConverter.lookupAxisTypeInA(type));
	var topEntries = dimension.getTopEntries();
	if (topEntries > 0)
	{
		inaStructure.putInteger("Top", topEntries);
	}
	var skipEntries = dimension.getSkipEntries();
	if (skipEntries > 0)
	{
		inaStructure.putInteger("Skip", skipEntries);
	}
	var inaDataSource = inaStructure.putNewStructure("DataSource");
	inaDataSource.putString("ObjectName", dimension.getPreQueryName());
	inaDataSource.putString("Type", "Query");
	inaStructure.putString("JoinType", dimension.getJoinType().getName());
	var inaJoinFields = inaStructure.putNewList("JoinFields");
	var joinFields = dimension.getJoinFields();
	var size = joinFields.size();
	var i;
	for (i = 0; i < size; i++)
	{
		var fieldNamePair = joinFields.get(i);
		var inaJoinField = inaJoinFields.addNewStructure();
		inaJoinField.putString("JoinFieldName", fieldNamePair.getLocaleFieldName());
		inaJoinField.putString("JoinFieldNameInReferencedData", fieldNamePair.getReferencedFieldName());
	}
	var inaFieldMappings = inaStructure.putNewList("FieldMappings");
	var fieldMappings = dimension.getFieldMappings();
	size = fieldMappings.size();
	for (i = 0; i < size; i++)
	{
		var fieldMapping = fieldMappings.get(i);
		var inaFieldMapping = inaFieldMappings.addNewStructure();
		inaFieldMapping.putString("FieldName", fieldMapping.getLocaleFieldName());
		inaFieldMapping.putString("FieldNameInReferencedData", fieldMapping.getReferencedFieldName());
		var localFieldName = fieldMapping.getLocaleFieldName();
		if (dimension.getFieldByName(localFieldName).getValueType() !== oFF.XValueType.STRING)
		{
			var inaValueType = oFF.QInAConverter.lookupValueTypeInA(dimension.getFieldByName(localFieldName).getValueType());
			inaFieldMapping.putString("CalculatedDimensionFieldValueType", inaValueType);
		}
	}
	this.exportFieldLayout(exporter, inaStructure, dimension);
	exporter.exportTotals(dimension, inaStructure);
	if (dimension.isHidden())
	{
		inaStructure.putBoolean("IsHidden", true);
	}
	return oFF.QInARepoDimension.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};

oFF.QInARepoFilterConvertedTimeCartesianList = function() {};
oFF.QInARepoFilterConvertedTimeCartesianList.prototype = new oFF.QInARepoFilterCartesianList();
oFF.QInARepoFilterConvertedTimeCartesianList.prototype._ff_c = "QInARepoFilterConvertedTimeCartesianList";

oFF.QInARepoFilterConvertedTimeCartesianList.prototype.getComponentType = function()
{
	return oFF.FilterComponentType.CONVERTED_TIME_CARTESIAN_LIST;
};
oFF.QInARepoFilterConvertedTimeCartesianList.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var filterExpression = null;
	if (oFF.notNull(parentComponent))
	{
		var parentFilterElement = parentComponent;
		filterExpression = parentFilterElement.getFilterExpression();
	}
	var cartesianList = modelComponent;
	if (oFF.isNull(cartesianList))
	{
		cartesianList = oFF.notNull(filterExpression) ? oFF.QFactory.createFilterConvertedTimeCartesianList(filterExpression) : oFF.QFactory.createFilterConvertedTimeCartesianList(context);
	}
	cartesianList.setIsSingleValueSourceCartesianList(inaStructure.getBooleanByKey("isSingleValueSource"));
	var hierarchyLevelTypeName = inaStructure.getStringByKey("LevelType");
	if (oFF.notNull(hierarchyLevelTypeName))
	{
		cartesianList.setHierarchyLevelType(oFF.HierarchyLevelType.lookup(hierarchyLevelTypeName));
	}
	return oFF.QInARepoFilterCartesianList.prototype.importComponentWithStructure.call( this , importer, inaStructure, cartesianList, parentComponent, context);
};
oFF.QInARepoFilterConvertedTimeCartesianList.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	oFF.QInARepoFilterCartesianList.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
	var cartesianList = modelComponent;
	inaStructure.putBoolean("isSingleValueSource", cartesianList.isSingleValueSourceCartesianList());
	if (cartesianList.getHierarchyLevelType() !== null)
	{
		inaStructure.putString("LevelType", cartesianList.getHierarchyLevelType().getName());
	}
	return oFF.QInARepoFilterCartesianList.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};

oFF.QInARepoFilterDynamic = function() {};
oFF.QInARepoFilterDynamic.prototype = new oFF.QInARepoFilter();
oFF.QInARepoFilterDynamic.prototype._ff_c = "QInARepoFilterDynamic";

oFF.QInARepoFilterDynamic.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.FILTER_DYNAMIC;
};
oFF.QInARepoFilterDynamic.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var inaFilter = inaStructure.getStructureByKey("DynamicFilter");
	if (oFF.isNull(inaFilter))
	{
		inaFilter = inaStructure.getStructureByKey("Filter");
	}
	var filter = parentComponent;
	var filterExpression = null;
	if (oFF.notNull(filter))
	{
		filter.setIgnoreInternalNonMeasureFilters(inaStructure.getBooleanByKeyExt("IgnoreInternalNonMeasureFilters", false));
		if (inaStructure.containsKey("FlattenHierarchyNodeFiltersFromVariables"))
		{
			filter.setFlattenHierarchyNodeFiltersFromVariables(inaStructure.getBooleanByKey("FlattenHierarchyNodeFiltersFromVariables"));
		}
		if (inaStructure.containsKey("ConvertFiltersToFlatOnHierarchyChange"))
		{
			filter.setConvertFiltersToFlatOnHierarchyChange(inaStructure.getBooleanByKey("ConvertFiltersToFlatOnHierarchyChange"));
		}
		if (filter.isDynamicFilterInitialized())
		{
			filterExpression = filter.getDynamicFilter();
			filterExpression.setComplexRoot(null);
			if (filterExpression.getModelCapabilities().supportsCellValueOperand())
			{
				filterExpression.setIsSuppressingNulls(false);
			}
		}
		filter.resetEffectiveFilter();
	}
	if (oFF.notNull(inaFilter) && !inaFilter.isEmpty())
	{
		filterExpression = importer.importFilterExpression(filterExpression, inaFilter, filter, context);
	}
	if (oFF.notNull(filter))
	{
		filter.setDynamicFilter(filterExpression);
	}
	if (oFF.notNull(filterExpression))
	{
		filterExpression.setPreserveDuringSubmit(true);
	}
	return filterExpression;
};
oFF.QInARepoFilterDynamic.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var modelComponent2 = modelComponent;
	var modelComponent3 = modelComponent2;
	var filter = modelComponent3;
	inaStructure.putBoolean("IgnoreInternalNonMeasureFilters", filter.isIgnoreInternalNonMeasureFilter());
	inaStructure.putBoolean("FlattenHierarchyNodeFiltersFromVariables", filter.isFlattenHierarchyNodeFiltersFromVariables());
	inaStructure.putBoolean("ConvertFiltersToFlatOnHierarchyChange", filter.isConvertFiltersToFlatOnHierarchyChange());
	var filterExpressionState = null;
	if (filter.isDynamicFilterInitialized())
	{
		filterExpressionState = filter.getDynamicFilter();
	}
	var queryModel = modelComponent3.getQueryModel();
	var isAbap = exporter.isAbap(modelComponent3);
	var inaName;
	if (isAbap)
	{
		inaName = "Filter";
	}
	else
	{
		inaName = "DynamicFilter";
	}
	var useOnlyInternalFilter = oFF.notNull(exporter.variableProcessingDirective) && queryModel.getModelCapabilities().supportsVariableMasking();
	if (useOnlyInternalFilter)
	{
		var inaSelectionState = exporter.exportFilterExpression(filterExpressionState);
		if (oFF.notNull(inaSelectionState))
		{
			inaStructure.put(inaName, inaSelectionState);
		}
	}
	else
	{
		var tmpFilter = null;
		if (filter.isTmpFilterInitialized())
		{
			tmpFilter = filter.getTmpFilter();
		}
		var exportedFilter = this.exportFilter(exporter, filter, filterExpressionState, filter.getLinkedFilters(), tmpFilter);
		if (oFF.notNull(exportedFilter))
		{
			inaStructure.put(inaName, exportedFilter);
		}
	}
	return oFF.QInARepoFilter.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};

oFF.QInARepoFilterVisibility = function() {};
oFF.QInARepoFilterVisibility.prototype = new oFF.QInARepoFilter();
oFF.QInARepoFilterVisibility.prototype._ff_c = "QInARepoFilterVisibility";

oFF.QInARepoFilterVisibility.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.FILTER_VISIBILITY;
};
oFF.QInARepoFilterVisibility.prototype.getTagName = function()
{
	return "VisibilityFilter";
};
oFF.QInARepoFilterVisibility.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var filter = parentComponent;
	if (oFF.notNull(filter) && filter.isVisibilityFilterInitialized())
	{
		var filterExpression = filter.getVisibilityFilter();
		filterExpression.setComplexRoot(null);
		if (filterExpression.getModelCapabilities().supportsCellValueOperand())
		{
			filterExpression.setIsSuppressingNulls(false);
		}
	}
	var selectionContainerVisibility = null;
	if (oFF.notNull(inaStructure))
	{
		selectionContainerVisibility = importer.importFilterExpression(null, inaStructure, filter, context);
		if (oFF.notNull(filter) && oFF.notNull(selectionContainerVisibility))
		{
			filter.setVisibilityFilter(selectionContainerVisibility);
		}
	}
	return selectionContainerVisibility;
};
oFF.QInARepoFilterVisibility.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var filter = modelComponent;
	if (filter.getModelCapabilities().supportsVisibilityFilter())
	{
		var tmpVisibilityFilter = null;
		if (filter.isTmpVisibilityFilterInitialized())
		{
			tmpVisibilityFilter = filter.getTmpVisibilityFilter();
		}
		var visibilityFilter = null;
		if (filter.isVisibilityFilterInitialized())
		{
			visibilityFilter = filter.getVisibilityFilter();
		}
		return this.exportFilter(exporter, filter, visibilityFilter, filter.getLinkedVisibilityFilters(), tmpVisibilityFilter);
	}
	return null;
};
oFF.QInARepoFilterVisibility.prototype.isValidFilterExpression = function(filterExpressionState)
{
	return oFF.notNull(filterExpressionState);
};

oFF.QInARepoHierarchyManager = function() {};
oFF.QInARepoHierarchyManager.prototype = new oFF.QInARepoHierarchy();
oFF.QInARepoHierarchyManager.prototype._ff_c = "QInARepoHierarchyManager";

oFF.QInARepoHierarchyManager.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.HIERARCHY_MANAGER;
};
oFF.QInARepoHierarchyManager.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var hierarchyManager = modelComponent;
	return oFF.QInARepoHierarchy.prototype.importComponentWithStructure.call( this , importer, inaStructure, hierarchyManager.getDimension(), parentComponent, context);
};
oFF.QInARepoHierarchyManager.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var hierarchyManager = modelComponent;
	return oFF.QInARepoHierarchy.prototype.exportComponentWithStructure.call( this , exporter, hierarchyManager.getDimension(), inaStructure, flags);
};

oFF.QInARepoMemberBasicMeasure = function() {};
oFF.QInARepoMemberBasicMeasure.prototype = new oFF.QInARepoMemberAbstract();
oFF.QInARepoMemberBasicMeasure.prototype._ff_c = "QInARepoMemberBasicMeasure";

oFF.QInARepoMemberBasicMeasure.getNameFromOperand = function(inaStructure)
{
	var memberOperand = inaStructure.getStructureByKey("MemberOperand");
	if (oFF.notNull(memberOperand))
	{
		var isFilterOnMeasures = oFF.XString.isEqual(memberOperand.getStringByKey("AttributeName"), "Measures");
		var isFilterEqual = oFF.QInAConverter.lookupComparison(memberOperand.getStringByKey("Comparison")) === oFF.ComparisonOperator.EQUAL;
		if (isFilterOnMeasures && isFilterEqual)
		{
			return memberOperand.getStringByKey("Value");
		}
	}
	return null;
};
oFF.QInARepoMemberBasicMeasure.getNameForImport = function(inaStructure, dimension)
{
	var memberName = inaStructure.getStringByKey("Name");
	if (oFF.isNull(memberName) && oFF.notNull(dimension))
	{
		var keyField = dimension.getKeyField();
		var keyName = keyField.getName();
		return inaStructure.getStringByKey(keyName);
	}
	return memberName;
};
oFF.QInARepoMemberBasicMeasure.getText = function(inaStructure, dimension)
{
	var memberText = inaStructure.getStringByKey("Description");
	if (oFF.isNull(memberText) && oFF.notNull(dimension))
	{
		var textField = dimension.getTextField();
		if (oFF.notNull(textField))
		{
			var keyName = textField.getName();
			return inaStructure.getStringByKey(keyName);
		}
	}
	return memberText;
};
oFF.QInARepoMemberBasicMeasure.prototype.getComponentType = function()
{
	return oFF.MemberType.BASIC_MEASURE;
};
oFF.QInARepoMemberBasicMeasure.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var dimension = parentComponent;
	if (oFF.isNull(dimension))
	{
		dimension = context.getDimensionAccessor().getDimensionByNameFromExistingMetadata(inaStructure.getStringByKey("Dimension"));
	}
	var newMemberName = oFF.QInARepoMemberBasicMeasure.getNameForImport(inaStructure, dimension);
	var newMemberText = oFF.QInARepoMemberBasicMeasure.getText(inaStructure, dimension);
	if (oFF.XStringUtils.isNullOrEmpty(newMemberName))
	{
		newMemberName = oFF.QInARepoMemberBasicMeasure.getNameFromOperand(inaStructure);
	}
	var member = modelComponent;
	if (oFF.isNull(member))
	{
		member = dimension.getStructureMember(newMemberName);
		if (oFF.isNull(member))
		{
			if (this.newComponentCreationAllowed(importer, inaStructure) && inaStructure.getBooleanByKeyExt("Extended", true))
			{
				member = oFF.QBasicMeasure._createBasicMeasure(context, dimension);
				if (dimension.getQueryModel() !== null && importer.isAbap(dimension.getQueryModel()))
				{
					member.setNotFromMetadata();
				}
			}
		}
	}
	else
	{
		member.setDimension(dimension);
	}
	if (oFF.notNull(member))
	{
		member.setName(newMemberName);
		var overrideDescription = inaStructure.getBooleanByKeyExt("OverrideDescription", false);
		if (overrideDescription)
		{
			if (oFF.XStringUtils.isNullOrEmpty(newMemberText))
			{
				if (oFF.XStringUtils.isNullOrEmpty(member.getOriginalText()))
				{
					newMemberText = newMemberName;
				}
				else
				{
					newMemberText = member.getOriginalText();
				}
			}
			if (!oFF.XString.isEqual(newMemberText, member.getOriginalText()))
			{
				var textField = dimension.getTextField();
				if (oFF.notNull(textField))
				{
					dimension.setAlternativeFieldValue(false, newMemberName, textField.getName(), oFF.XStringValue.create(newMemberText), null);
				}
			}
		}
		if (oFF.notNull(newMemberText) && (member.getOriginalText() === null || overrideDescription))
		{
			member.setText(newMemberText);
		}
		member.initializeFieldValues();
		oFF.QInARepoMemberAbstract.importGenericMemberAbstractProperties(importer, member, inaStructure);
	}
	return member;
};
oFF.QInARepoMemberBasicMeasure.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var basicMeasure = modelComponent;
	var dimension = basicMeasure.getDimension();
	if (dimension.getDimensionType() === oFF.DimensionType.ACCOUNT && exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA)
	{
		inaStructure.putString("Name", basicMeasure.getName());
		return inaStructure;
	}
	var text = basicMeasure.getOriginalText();
	if (oFF.notNull(text))
	{
		inaStructure.putString("Description", text);
	}
	inaStructure.putString("Dimension", dimension.getName());
	var memberOperandElement = oFF.PrFactory.createStructure();
	memberOperandElement.putString("AttributeName", "Measures");
	inaStructure.put("MemberOperand", memberOperandElement);
	var queryModel = basicMeasure.getQueryModel();
	if (queryModel.isBasicMeasureAggregationExportedInRepo() || exporter.mode === oFF.QModelFormat.INA_REPOSITORY_DELTA && basicMeasure.hasPropertyChanged(oFF.QStructureMemberProperties.QY_AGGERGATION_TYPE))
	{
		var basicAggregationType = basicMeasure.getAggregationType();
		oFF.QInARepoUtils.setNameIfNotNull(inaStructure, "Aggregation", basicAggregationType);
	}
	if (!basicMeasure.getModelCapabilities().supportsExceptionAggregationDimsFormulas())
	{
		var basicAggregationDimensionName = basicMeasure.getAggregationDimensionName();
		if (oFF.notNull(basicAggregationDimensionName))
		{
			inaStructure.putString("AggregationDimension", basicAggregationDimensionName);
		}
	}
	if (!exporter.capabilities.supportsExtendedSort() && !exporter.isVirtualInA(queryModel))
	{
		var measureSorting = queryModel.getSortingManager().getMeasureSorting(basicMeasure, false);
		if (oFF.isNull(measureSorting))
		{
			inaStructure.putInteger("SortOrder", 0);
		}
		else
		{
			inaStructure.putInteger("SortOrder", oFF.QInAConverter.lookupSortDirectionInA(measureSorting.getDirection()));
		}
	}
	var value = basicMeasure.getKeyFieldValue();
	memberOperandElement.putString("Comparison", oFF.QInAConverter.lookupComparisonInA(oFF.ComparisonOperator.EQUAL));
	oFF.QInARepoUtils.exportValue(exporter, "Value", memberOperandElement, value, value.getValueType());
	oFF.QInARepoMemberAbstract.prototype.exportGenericMemberProperties.call( this , exporter, basicMeasure, inaStructure);
	if (queryModel.isBasicMeasureSettingsExportedInRepo() || exporter.mode === oFF.QModelFormat.INA_REPOSITORY_DELTA)
	{
		if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || basicMeasure.hasPropertyChanged(oFF.QStructureMemberProperties.QY_UNIT_TYPE))
		{
			inaStructure.putStringNotNull("UnitType", oFF.QInAConverter.lookupUnitTypeInA(basicMeasure.getUnitType()));
		}
		inaStructure.putStringNotNull("UnitFixed", basicMeasure.getUnitFixed());
		inaStructure.putStringNotNull("UnitName", basicMeasure.getUnitName());
		inaStructure.putStringNotNull("UnitTextName", basicMeasure.getUnitTextName());
		if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || basicMeasure.hasPropertyChanged(oFF.QStructureMemberProperties.QY_DATA_TYPE))
		{
			inaStructure.putStringNotNull("DataType", oFF.QInAConverter.lookupValueTypeInA(basicMeasure.getDataType()));
		}
	}
	return oFF.QInARepoMemberAbstract.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};

oFF.QInARepoMemberCurrency = function() {};
oFF.QInARepoMemberCurrency.prototype = new oFF.QInARepoMemberAbstract();
oFF.QInARepoMemberCurrency.prototype._ff_c = "QInARepoMemberCurrency";

oFF.QInARepoMemberCurrency.prototype.getComponentType = function()
{
	return oFF.MemberType.CURRENCY_MEASURE;
};
oFF.QInARepoMemberCurrency.prototype.newModelComponent = function(application, olapEnv, parentComponent, context)
{
	var newMember = oFF.QCurrencyMeasure._createCurrencyMeasure(context, null);
	newMember.setParent(parentComponent);
	return newMember;
};
oFF.QInARepoMemberCurrency.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var currencyMeasure = modelComponent;
	var dimension = parentComponent;
	var newMemberName = inaStructure.getStringByKey("Name");
	var newMemberText = inaStructure.getStringByKey("Description");
	if (oFF.isNull(currencyMeasure))
	{
		currencyMeasure = dimension.addNewCurrencyMeasure(newMemberName, newMemberText);
	}
	else
	{
		currencyMeasure.setDimension(dimension);
		currencyMeasure.setName(newMemberName);
		currencyMeasure.setText(newMemberText);
	}
	oFF.QInARepoMemberAbstract.importGenericMemberAbstractProperties(importer, currencyMeasure, inaStructure);
	currencyMeasure.setBaseMeasureName(inaStructure.getStringByKey("BaseMeasureName"));
	if (inaStructure.containsKey("CurrencyTranslationName"))
	{
		currencyMeasure.setCurrencyTranslationName(inaStructure.getStringByKey("CurrencyTranslationName"));
	}
	var currencyTranslation = currencyMeasure.getLocalCurrencyTranslation();
	var localCurrencyTranslation = inaStructure.getStructureByKey("CurrencyTranslation");
	if (oFF.isNull(localCurrencyTranslation))
	{
		currencyMeasure.setLocalCurrency();
	}
	else
	{
		importer.importCurrencyTranslationElement(localCurrencyTranslation, currencyTranslation, context);
	}
	currencyMeasure.setAutoSignFlip(inaStructure.getBooleanByKey("AutoSignFlip"));
	return currencyMeasure;
};
oFF.QInARepoMemberCurrency.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var currencyMeasure = modelComponent;
	inaStructure.putString("Name", currencyMeasure.getName());
	inaStructure.putString("Description", currencyMeasure.getOriginalText());
	inaStructure.putStringNotNullAndNotEmpty("BaseMeasureName", currencyMeasure.getBaseMeasureName());
	inaStructure.putStringNotNullAndNotEmpty("CurrencyTranslationName", currencyMeasure.getCurrencyTranslationName());
	if (!currencyMeasure.isLocalCurrency())
	{
		var specificTranslation = currencyMeasure.getLocalCurrencyTranslation();
		var inaCurrencyTranslation = inaStructure.putNewStructure("CurrencyTranslation");
		exporter.exportCurrencyTranslationElement(specificTranslation, inaCurrencyTranslation);
	}
	if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || currencyMeasure.hasPropertyChanged(oFF.QStructureMemberProperties.QY_AUTO_SIGN_FLIP))
	{
		if (currencyMeasure.isAutoSignFlip() || currencyMeasure.hasPropertyChanged(oFF.QStructureMemberProperties.QY_AUTO_SIGN_FLIP) && exporter.mode === oFF.QModelFormat.INA_REPOSITORY_DELTA)
		{
			inaStructure.putBoolean("AutoSignFlip", currencyMeasure.isAutoSignFlip());
		}
	}
	if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || currencyMeasure.hasPropertyChanged(oFF.QStructureMemberProperties.QY_UNIT_TYPE))
	{
		inaStructure.putStringNotNull("UnitType", oFF.QInAConverter.lookupUnitTypeInA(currencyMeasure.getUnitType()));
	}
	inaStructure.putStringNotNull("UnitFixed", currencyMeasure.getUnitFixed());
	inaStructure.putStringNotNull("UnitName", currencyMeasure.getUnitName());
	inaStructure.putStringNotNull("UnitTextName", currencyMeasure.getUnitTextName());
	if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || currencyMeasure.hasPropertyChanged(oFF.QStructureMemberProperties.QY_DATA_TYPE))
	{
		inaStructure.putStringNotNull("DataType", oFF.QInAConverter.lookupValueTypeInA(currencyMeasure.getDataType()));
	}
	oFF.QInARepoMemberAbstract.prototype.exportGenericMemberProperties.call( this , exporter, currencyMeasure, inaStructure);
	return oFF.QInARepoMemberAbstract.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};

oFF.QInARepoMemberExceptionAggregationMeasure = function() {};
oFF.QInARepoMemberExceptionAggregationMeasure.prototype = new oFF.QInARepoMemberAbstract();
oFF.QInARepoMemberExceptionAggregationMeasure.prototype._ff_c = "QInARepoMemberExceptionAggregationMeasure";

oFF.QInARepoMemberExceptionAggregationMeasure.prototype.getComponentType = function()
{
	return oFF.MemberType.EXCEPTION_AGGREGATION;
};
oFF.QInARepoMemberExceptionAggregationMeasure.prototype.newModelComponent = function(application, olapEnv, parentComponent, context)
{
	var newMember = oFF.QExceptionAggregationMeasure._createExceptionAggregationMeasure(context, null);
	newMember.setParent(parentComponent);
	return newMember;
};
oFF.QInARepoMemberExceptionAggregationMeasure.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var exceptionAggregation = modelComponent;
	var dimension = parentComponent;
	var newMemberName = inaStructure.getStringByKey("Name");
	var newMemberText = inaStructure.getStringByKey("Description");
	if (oFF.isNull(exceptionAggregation))
	{
		exceptionAggregation = dimension.addNewExceptionAggregationMeasure(newMemberName, newMemberText);
	}
	else
	{
		exceptionAggregation.setDimension(dimension);
		exceptionAggregation.setName(newMemberName);
		exceptionAggregation.setText(newMemberText);
	}
	exceptionAggregation.setMeasure(inaStructure.getStringByKey("MeasureName"));
	if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || inaStructure.hasStringByKey("ConditionType"))
	{
		exceptionAggregation.setConditionType(oFF.ExceptionAggregationConditionType.lookup(inaStructure.getStringByKey("ConditionType")));
	}
	if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || inaStructure.containsKey("ExceptionAggregationOnSelectionEnabled"))
	{
		exceptionAggregation.setIsExceptionAggregationOnSelectionEnabled(inaStructure.getBooleanByKey("ExceptionAggregationOnSelectionEnabled"));
	}
	var filter = exceptionAggregation.getFilter();
	var filterElement = null;
	var inaSelection = inaStructure.getStructureByKey("Selection");
	if (oFF.notNull(inaSelection))
	{
		filterElement = importer.importComponent(null, inaSelection, null, filter, context);
	}
	filter.setComplexRoot(filterElement);
	return exceptionAggregation;
};
oFF.QInARepoMemberExceptionAggregationMeasure.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var exceptionAggregation = modelComponent;
	inaStructure.putString("Name", exceptionAggregation.getName());
	inaStructure.putString("Description", exceptionAggregation.getOriginalText());
	inaStructure.putString("MeasureName", exceptionAggregation.getMeasure());
	if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || exceptionAggregation.hasPropertyChanged(oFF.QMeasureProperties.QY_CONDITION_TYPE))
	{
		inaStructure.putString("ConditionType", exceptionAggregation.getConditionType().getName());
	}
	if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || exceptionAggregation.hasPropertyChanged(oFF.QMeasureProperties.QY_EXCEPTION_AGGREGATION_ON_SELECTION))
	{
		inaStructure.putBoolean("ExceptionAggregationOnSelectionEnabled", exceptionAggregation.getIsExceptionAggregationOnSelectionEnabled());
	}
	var filterRoot = exceptionAggregation.getFilter().getFilterRootElement();
	if (oFF.notNull(filterRoot))
	{
		var inaFilterRootElement = exporter.exportComponent(null, filterRoot, null, flags);
		inaStructure.put("Selection", inaFilterRootElement);
	}
	oFF.QInARepoMemberAbstract.prototype.exportGenericMemberProperties.call( this , exporter, exceptionAggregation, inaStructure);
	return oFF.QInARepoMemberAbstract.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};

oFF.QInARepoMemberFormulaMeasure = function() {};
oFF.QInARepoMemberFormulaMeasure.prototype = new oFF.QInARepoMemberAbstract();
oFF.QInARepoMemberFormulaMeasure.prototype._ff_c = "QInARepoMemberFormulaMeasure";

oFF.QInARepoMemberFormulaMeasure.importIteration = function(importer, member, context, inaIteration)
{
	var iteration = oFF.QFactory.createIteration(context);
	member.setIteration(iteration);
	iteration.setStartValueMemberName(inaIteration.getStringByKey("StartValueMember"));
	var inaIterationDimensions = inaIteration.getListByKey("IterationDimensions");
	if (oFF.XCollectionUtils.hasElements(inaIterationDimensions))
	{
		var size = inaIterationDimensions.size();
		for (var i = 0; i < size; i++)
		{
			var inaIterationDimension = inaIterationDimensions.getStructureAt(i);
			var iterationDimension = oFF.QFactory.createIterationDimension(context);
			iterationDimension.setDimensionName(inaIterationDimension.getStringByKey("Name"));
			iterationDimension.setPartitionLevelName(inaIterationDimension.getStringByKey("PartitionLevel"));
			iteration.addIterationDimension(iterationDimension);
		}
	}
};
oFF.QInARepoMemberFormulaMeasure.importInverseFormulas = function(importer, member, context, inaInverseFormulas)
{
	var measureDimension = member.getDimension();
	var numberOfInverseFormulas = inaInverseFormulas.size();
	var inverseFormulaList = member.getInverseFormulaList();
	inverseFormulaList.clear();
	for (var i = 0; i < numberOfInverseFormulas; i++)
	{
		var inaInverseFormulaDetail = inaInverseFormulas.get(i);
		var inaInverseFormula = inaInverseFormulaDetail.getStructureByKey("Formula");
		var inverseFormulaItem = oFF.QInARepoMemberFormulaMeasure.importFormulaMeasure(importer, measureDimension, inaInverseFormula, null, context);
		var condition = null;
		var inaCondition = inaInverseFormulaDetail.getStructureByKey("Condition");
		if (oFF.notNull(inaCondition))
		{
			condition = oFF.QInARepoMemberFormulaMeasure.importFormulaMeasure(importer, measureDimension, inaCondition, null, context);
		}
		var inAInverseFormulaTarget = inaInverseFormulaDetail.getStructureByKey("Target");
		var targetMemberName = oFF.QInARepoMemberFormulaMeasure.importFormulaMeasure(importer, measureDimension, inAInverseFormulaTarget, null, context);
		var inverseFormula = oFF.QFormulaInverseFormula.createInverseFormula(context, member, condition, targetMemberName, inverseFormulaItem);
		inverseFormulaList.add(inverseFormula);
	}
};
oFF.QInARepoMemberFormulaMeasure.importNameAndText = function(inaStructure, member, dimension)
{
	var newMemberName = oFF.QInARepoMemberFormulaMeasure.getNameForImport(inaStructure, dimension);
	var newMemberText = oFF.QInARepoMemberFormulaMeasure.getText(inaStructure, dimension);
	if (oFF.XStringUtils.isNullOrEmpty(newMemberName) && oFF.XStringUtils.isNullOrEmpty(newMemberText))
	{
		newMemberName = inaStructure.getStringByKey("Name");
		newMemberText = inaStructure.getStringByKey("Description");
	}
	member.setName(newMemberName);
	member.setText(newMemberText);
};
oFF.QInARepoMemberFormulaMeasure.getNameForImport = function(inaStructure, dimension)
{
	var memberName = inaStructure.getStringByKey("Name");
	if (oFF.isNull(memberName) && oFF.notNull(dimension))
	{
		var keyField = dimension.getKeyField();
		var keyName = keyField.getName();
		return inaStructure.getStringByKey(keyName);
	}
	return memberName;
};
oFF.QInARepoMemberFormulaMeasure.getText = function(inaStructure, dimension)
{
	var memberText = inaStructure.getStringByKey("Description");
	if (oFF.isNull(memberText) && oFF.notNull(dimension))
	{
		var textField = dimension.getTextField();
		if (oFF.notNull(textField))
		{
			var keyName = textField.getName();
			memberText = inaStructure.getStringByKey(keyName);
		}
	}
	return memberText;
};
oFF.QInARepoMemberFormulaMeasure.importFormulaMeasure = function(importer, dimension, inaFormula, formulaItemx, context)
{
	var formulaItem = null;
	if (oFF.notNull(inaFormula))
	{
		var inaFunction = inaFormula.getStructureByKey("Function");
		formulaItem = formulaItemx;
		if (oFF.notNull(inaFunction))
		{
			var functionName = inaFunction.getStringByKey("Name");
			var functionParameters = inaFunction.getListByKey("Parameters");
			var newFormulaFunction = oFF.QFactory.createFormulaFunction(context);
			if (oFF.notNull(functionParameters))
			{
				newFormulaFunction.setFunctionName(functionName);
				var paramSize = functionParameters.size();
				for (var paraIdx = 0; paraIdx < paramSize; paraIdx++)
				{
					oFF.QInARepoMemberFormulaMeasure.importFormulaMeasure(importer, dimension, functionParameters.getStructureAt(paraIdx), newFormulaFunction, context);
				}
			}
			newFormulaFunction.setSolveOrder(inaFormula.getIntegerByKeyExt("SolveOrder", 0));
			if (oFF.isNull(formulaItem))
			{
				formulaItem = newFormulaFunction;
			}
			else
			{
				formulaItem.add(newFormulaFunction);
			}
		}
		else
		{
			var constPara = inaFormula.getStructureByKey("Constant");
			if (oFF.notNull(constPara))
			{
				var formulaConstant = oFF.QFactory.createFormulaConstant(context);
				if (oFF.XString.isEqual("Variable", constPara.getStringByKey("ValueIs")))
				{
					var value = constPara.getStringByKey("Value");
					if (oFF.XStringUtils.isNotNullAndNotEmpty(value))
					{
						var variableManager = dimension.getQueryModel().getVariableManager();
						formulaConstant.setVariable(variableManager.getVariables().getByKey(value));
					}
					if (oFF.isNull(formulaItem))
					{
						formulaItem = formulaConstant;
					}
					else
					{
						formulaItem.add(formulaConstant);
					}
				}
				else
				{
					var valueTypePara = constPara.getStringByKey("ValueType");
					var valueIsNull = !constPara.containsKey("Value") || constPara.getElementTypeByKey("Value") === oFF.PrElementType.THE_NULL;
					if (oFF.XString.isEqual(valueTypePara, "Number"))
					{
						if (valueIsNull)
						{
							formulaConstant.setNullByType(oFF.XValueType.DOUBLE);
						}
						else
						{
							formulaConstant.setDouble(constPara.getDoubleByKey("Value"));
						}
					}
					else if (oFF.XString.isEqual(valueTypePara, "String"))
					{
						if (valueIsNull)
						{
							formulaConstant.setNullByType(oFF.XValueType.STRING);
						}
						else
						{
							formulaConstant.setString(constPara.getStringByKey("Value"));
						}
					}
					else if (oFF.XString.isEqual(valueTypePara, "Bool"))
					{
						if (valueIsNull)
						{
							formulaConstant.setNullByType(oFF.XValueType.BOOLEAN);
						}
						else
						{
							formulaConstant.setBoolean(constPara.getBooleanByKey("Value"));
						}
					}
					else if (oFF.XString.isEqual(valueTypePara, "DateTime"))
					{
						if (valueIsNull)
						{
							formulaConstant.setNullByType(oFF.XValueType.DATE_TIME);
						}
						else
						{
							formulaConstant.setDateTime(oFF.XDateTime.createDateTimeFromStringWithFlag(constPara.getStringByKey("Value"), false));
						}
					}
					else if (oFF.XString.isEqual(valueTypePara, "Date"))
					{
						if (valueIsNull)
						{
							formulaConstant.setNullByType(oFF.XValueType.DATE);
						}
						else
						{
							formulaConstant.setDate(oFF.QInARepoUtils.createDate(constPara.getStringByKey("Value")));
						}
					}
					else if (oFF.XString.isEqual(valueTypePara, "StringArray"))
					{
						if (!valueIsNull)
						{
							var valuesList = constPara.getListByKey("Value");
							formulaConstant.setStringValues(oFF.PrUtils.asListOfString(valuesList));
						}
					}
					else
					{
						importer.addError(oFF.ErrorCodes.INVALID_TOKEN, "Constant value type is not supported");
						return null;
					}
					var constUnit = constPara.getStringByKey("Unit");
					if (oFF.XStringUtils.isNotNullAndNotEmpty(constUnit))
					{
						formulaConstant.setUnit(constUnit);
					}
					var constCurrency = constPara.getStringByKey("Currency");
					if (oFF.XStringUtils.isNotNullAndNotEmpty(constCurrency))
					{
						formulaConstant.setCurrency(constCurrency);
					}
					if (oFF.isNull(formulaItem))
					{
						formulaItem = formulaConstant;
					}
					else
					{
						formulaItem.add(formulaConstant);
					}
				}
			}
			else
			{
				var memberPara = inaFormula.getStructureByKey("Member");
				if (oFF.notNull(memberPara))
				{
					var formulaMember = oFF.QFactory.createFormulaMember(context);
					var memberParaName = memberPara.getStringByKey("Name");
					formulaMember.setMemberName(memberParaName);
					formulaMember.setDimensionName(memberPara.getStringByKey("Dimension"));
					var nameIs = memberPara.getStringByKey("NameIs");
					if (oFF.XString.isEqual(nameIs, "Booked"))
					{
						formulaMember.setBooked();
					}
					else if (oFF.XString.isEqual(nameIs, "Previous"))
					{
						formulaMember.setPrevious();
					}
					if (oFF.isNull(formulaItem))
					{
						formulaItem = formulaMember;
					}
					else
					{
						formulaItem.add(formulaMember);
					}
					oFF.QInARepoMemberFormulaMeasure.importDimensionContext(context, formulaMember, memberPara);
				}
				else
				{
					var attribute = inaFormula.getStructureByKey("AttributeValue");
					if (oFF.notNull(attribute))
					{
						var attributeName = attribute.getStringByKey("Name");
						var formulaAttribute = oFF.QFactory.createFormulaAttributeWithName(context, attributeName);
						if (oFF.isNull(formulaItem))
						{
							formulaItem = formulaAttribute;
						}
						else
						{
							formulaItem.add(formulaAttribute);
						}
						oFF.QInARepoMemberFormulaMeasure.importDimensionContext(context, formulaItem, attribute);
					}
				}
			}
		}
	}
	return formulaItem;
};
oFF.QInARepoMemberFormulaMeasure.importDimensionContext = function(context, formulaItem, inaFormulaItem)
{
	var inaDimensionContext = inaFormulaItem.getStructureByKey("DimensionContext");
	if (oFF.notNull(inaDimensionContext))
	{
		var datasetId = inaDimensionContext.getStringByKey("DatasetId");
		var sharedQueryManager = context.getOlapEnv().getSharedQueryManager(datasetId);
		if (oFF.notNull(sharedQueryManager))
		{
			var dimensionContext = sharedQueryManager.getQueryModel().getDimensionByName(inaDimensionContext.getStringByKey("DimensionName"));
			formulaItem.setDimensionContext(dimensionContext);
		}
	}
};
oFF.QInARepoMemberFormulaMeasure.exportIteration = function(exporter, formulaMeasure, inaFormula)
{
	var iteration = formulaMeasure.getIteration();
	if (exporter.getMode() !== oFF.QModelFormat.INA_REPOSITORY_DELTA || iteration.getModCounter() > 0)
	{
		var inaIteration = inaFormula.putNewStructure("Iteration");
		inaIteration.putString("StartValueMember", iteration.getStartValueMemberName());
		var iterationDimensions = iteration.getIterationDimensions();
		var inaIterationDimensions = inaIteration.putNewList("IterationDimensions");
		var size = iterationDimensions.size();
		for (var i = 0; i < size; i++)
		{
			var iterationDimension = iterationDimensions.get(i);
			var inaIterationDimension = inaIterationDimensions.addNewStructure();
			inaIterationDimension.putStringNotNullAndNotEmpty("Name", iterationDimension.getDimensionName());
			inaIterationDimension.putStringNotNullAndNotEmpty("PartitionLevel", iterationDimension.getPartitionLevelName());
		}
	}
};
oFF.QInARepoMemberFormulaMeasure.exportInverseFormulas = function(exporter, formulaMeasure, inaStructure)
{
	var inverseFormulaList = formulaMeasure.getInverseFormulaList();
	if (exporter.getMode() !== oFF.QModelFormat.INA_REPOSITORY_DELTA || inverseFormulaList.getModCounter() > 0)
	{
		var inaInverseFormulas = inaStructure.putNewList("InverseFormulas");
		var numberOfInverseFormulas = inverseFormulaList.size();
		for (var i = 0; i < numberOfInverseFormulas; i++)
		{
			var inaInverseFormula = oFF.PrFactory.createStructure();
			inaInverseFormulas.add(inaInverseFormula);
			var formulaInverseFormula = inverseFormulaList.get(i);
			var inaFormula = oFF.PrFactory.createStructure();
			oFF.QInARepoMemberAbstract.exportFormulaItem(exporter, formulaInverseFormula.getInternalFormulaItem(), inaFormula, formulaMeasure);
			inaInverseFormula.put("Formula", inaFormula);
			var targetMemberName = formulaInverseFormula.getTarget();
			if (oFF.notNull(targetMemberName))
			{
				var inaTarget = oFF.PrFactory.createStructure();
				inaInverseFormula.put("Target", inaTarget);
				oFF.QInARepoMemberAbstract.exportFormulaItem(exporter, targetMemberName, inaTarget, formulaMeasure.getContext());
			}
			var condition = formulaInverseFormula.getCondition();
			if (oFF.notNull(condition))
			{
				var inaCondition = oFF.PrFactory.createStructure();
				inaInverseFormula.put("Condition", inaCondition);
				oFF.QInARepoMemberAbstract.exportFormulaItem(exporter, condition, inaCondition, formulaMeasure);
			}
		}
	}
};
oFF.QInARepoMemberFormulaMeasure.prototype.getComponentType = function()
{
	return oFF.MemberType.FORMULA;
};
oFF.QInARepoMemberFormulaMeasure.prototype.newModelComponent = function(application, olapEnv, parentComponent, context)
{
	var formulaMeasure = null;
	if (oFF.isNull(parentComponent) || context.getModelCapabilities().supportsCustomMeasuresInMetadata() === false)
	{
		formulaMeasure = oFF.QFormulaMeasure._createFormulaMeasure(context, null);
		formulaMeasure.setParent(parentComponent);
	}
	return formulaMeasure;
};
oFF.QInARepoMemberFormulaMeasure.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var dimension = parentComponent;
	var queryModel = context.getQueryModel();
	if (oFF.isNull(dimension))
	{
		dimension = queryModel.getMeasureDimension();
	}
	var member = modelComponent;
	var newMemberName = oFF.QInARepoMemberFormulaMeasure.getNameForImport(inaStructure, dimension);
	if (oFF.isNull(member) && dimension.getModelCapabilities().supportsCustomMeasuresInMetadata())
	{
		member = dimension.getStructureMember(newMemberName);
	}
	if (oFF.isNull(member))
	{
		if (this.newComponentCreationAllowed(importer, inaStructure))
		{
			member = oFF.QFormulaMeasure._createFormulaMeasure(context, dimension);
		}
	}
	else
	{
		member.setDimension(dimension);
	}
	if (oFF.notNull(member))
	{
		oFF.QInARepoMemberFormulaMeasure.importNameAndText(inaStructure, member, dimension);
		var inaFormula = inaStructure.getStructureByKey("Formula");
		oFF.QInARepoMemberAbstract.importGenericMemberAbstractProperties(importer, member, inaStructure);
		if (member.getMemberType() === oFF.MemberType.FORMULA)
		{
			var importFormula = oFF.QInARepoMemberFormulaMeasure.importFormulaMeasure(importer, dimension, inaFormula, null, context);
			if (oFF.notNull(importFormula))
			{
				member.setFormula(importFormula);
			}
			var formulaType = inaStructure.getStringByKey("FormulaType");
			if (oFF.XStringUtils.isNotNullAndNotEmpty(formulaType))
			{
				member.setFormulaType(oFF.QFormulaType.lookup(formulaType));
			}
			if (member.supportsCalculatedBeforeAggregation() && (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || inaStructure.hasStringByKey("ExecutionStep")))
			{
				member.setIsCalculatedBeforeAggregation(oFF.XString.isEqual("CalculationBeforeAggregation", inaStructure.getStringByKey("ExecutionStep")));
			}
			var inaInverseFormulas = inaStructure.getListByKey("InverseFormulas");
			if (oFF.XCollectionUtils.hasElements(inaInverseFormulas))
			{
				oFF.QInARepoMemberFormulaMeasure.importInverseFormulas(importer, member, context, inaInverseFormulas);
			}
			var inaIteration = inaStructure.getStructureByKey("Iteration");
			if (oFF.XCollectionUtils.hasElements(inaIteration))
			{
				oFF.QInARepoMemberFormulaMeasure.importIteration(importer, member, context, inaIteration);
			}
			if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || inaStructure.containsKey("AutoSignFlipForRMOnly"))
			{
				member.setAutoSignFlipRestrictedMeasureOnly(inaStructure.getBooleanByKeyExt("AutoSignFlipForRMOnly", false));
			}
		}
	}
	return member;
};
oFF.QInARepoMemberFormulaMeasure.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var formulaMeasure = modelComponent;
	inaStructure.putString("Name", formulaMeasure.getName());
	inaStructure.putString("Description", formulaMeasure.getOriginalText());
	var inaFormula = oFF.PrFactory.createStructure();
	oFF.QInARepoMemberAbstract.exportFormulaItem(exporter, formulaMeasure.getFormula(), inaFormula, formulaMeasure);
	if (inaFormula.hasElements())
	{
		inaStructure.put("Formula", inaFormula);
	}
	if (formulaMeasure.getFormulaType() !== null)
	{
		inaStructure.putString("FormulaType", formulaMeasure.getFormulaType().getName());
	}
	if (formulaMeasure.supportsCalculatedBeforeAggregation() && (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || formulaMeasure.hasPropertyChanged(oFF.QMeasureProperties.QY_CALCULATE_BEFORE_AGGREGATION)))
	{
		if (formulaMeasure.isCalculatedBeforeAggregation())
		{
			inaStructure.putString("ExecutionStep", "CalculationBeforeAggregation");
		}
		else if (exporter.mode === oFF.QModelFormat.INA_REPOSITORY_DELTA)
		{
			inaStructure.putString("ExecutionStep", "CalculationAfterAggregation");
		}
	}
	if (oFF.XCollectionUtils.hasElements(formulaMeasure.getInverseFormulaList()))
	{
		oFF.QInARepoMemberFormulaMeasure.exportInverseFormulas(exporter, formulaMeasure, inaStructure);
	}
	if (formulaMeasure.getIteration() !== null)
	{
		oFF.QInARepoMemberFormulaMeasure.exportIteration(exporter, formulaMeasure, inaStructure);
	}
	oFF.QInARepoMemberAbstract.prototype.exportGenericMemberProperties.call( this , exporter, formulaMeasure, inaStructure);
	if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || formulaMeasure.hasPropertyChanged(oFF.QStructureMemberProperties.QY_UNIT_TYPE))
	{
		inaStructure.putStringNotNull("UnitType", oFF.QInAConverter.lookupUnitTypeInA(formulaMeasure.getUnitType()));
	}
	inaStructure.putStringNotNull("UnitFixed", formulaMeasure.getUnitFixed());
	if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || formulaMeasure.hasPropertyChanged(oFF.QStructureMemberProperties.QY_AGGERGATION_TYPE))
	{
		var basicAggregationType = formulaMeasure.getAggregationType();
		oFF.QInARepoUtils.setNameIfNotNull(inaStructure, "Aggregation", basicAggregationType);
	}
	if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || formulaMeasure.hasPropertyChanged(oFF.QStructureMemberProperties.QY_PRESENTATION_SIGN_REVERSAL))
	{
		var presentationSignReversal = formulaMeasure.getPresentationSignReversal();
		if (oFF.notNull(presentationSignReversal))
		{
			inaStructure.putBoolean("PresentationSignReversal", presentationSignReversal.getBoolean());
		}
	}
	if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || formulaMeasure.hasPropertyChanged(oFF.QMeasureProperties.QY_AUTO_SIGN_FLIP_FOR_RM_ONLY))
	{
		if (formulaMeasure.isAutoSignFlipRestrictedMeasureOnly() || exporter.mode === oFF.QModelFormat.INA_REPOSITORY_DELTA && formulaMeasure.hasPropertyChanged(oFF.QMeasureProperties.QY_AUTO_SIGN_FLIP_FOR_RM_ONLY))
		{
			inaStructure.putBoolean("AutoSignFlipForRMOnly", formulaMeasure.isAutoSignFlipRestrictedMeasureOnly());
		}
	}
	return oFF.QInARepoMemberAbstract.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};

oFF.QInARepoMemberRestricted = function() {};
oFF.QInARepoMemberRestricted.prototype = new oFF.QInARepoMemberAbstract();
oFF.QInARepoMemberRestricted.prototype._ff_c = "QInARepoMemberRestricted";

oFF.QInARepoMemberRestricted.prototype.getComponentType = function()
{
	return oFF.MemberType.RESTRICTED_MEASURE;
};
oFF.QInARepoMemberRestricted.prototype.newModelComponent = function(application, olapEnv, parentComponent, context)
{
	var newMember = null;
	if (oFF.isNull(parentComponent) || context.getModelCapabilities().supportsCustomMeasuresInMetadata() === false)
	{
		newMember = oFF.QRestrictedMeasure._createRestrictedMeasure(context, null);
		newMember.setParent(parentComponent);
	}
	return newMember;
};
oFF.QInARepoMemberRestricted.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var restrictedMeasure = modelComponent;
	var dimension = parentComponent;
	var newMemberName = inaStructure.getStringByKey("Name");
	var newMemberText = inaStructure.getStringByKey("Description");
	if (dimension.getModelCapabilities().supportsCustomMeasuresInMetadata())
	{
		restrictedMeasure = dimension.getStructureMember(newMemberName);
		if (oFF.notNull(restrictedMeasure) && restrictedMeasure.getMemberType() !== oFF.MemberType.RESTRICTED_MEASURE)
		{
			dimension.removeMeasureWithNoValidation(newMemberName);
			restrictedMeasure = null;
		}
	}
	if (oFF.isNull(restrictedMeasure))
	{
		if (this.newComponentCreationAllowed(importer, inaStructure))
		{
			restrictedMeasure = dimension.addNewRestrictedMeasure(newMemberName, newMemberText);
		}
	}
	else
	{
		restrictedMeasure.setDimension(dimension);
		restrictedMeasure.setName(newMemberName);
		restrictedMeasure.setText(newMemberText);
	}
	if (oFF.notNull(restrictedMeasure))
	{
		oFF.QInARepoMemberAbstract.importGenericMemberAbstractProperties(importer, restrictedMeasure, inaStructure);
		if (restrictedMeasure.getMemberType() === oFF.MemberType.RESTRICTED_MEASURE)
		{
			var filter = restrictedMeasure.getFilter();
			var inaFilterExpression = inaStructure.getStructureByKey("InAFilterExpression");
			if (oFF.notNull(inaFilterExpression))
			{
				var currentMode = importer.mode;
				importer.mode = oFF.QModelFormat.INA_DATA;
				importer.importFilterExpression(filter, inaFilterExpression, restrictedMeasure, context);
				importer.mode = currentMode;
			}
			else
			{
				var filterElement = null;
				var inaFilterElement = inaStructure.getStructureByKey("Selection");
				if (oFF.notNull(inaFilterElement))
				{
					filterElement = importer.importComponent(null, inaFilterElement, null, filter, context);
					filter.setComplexRoot(filterElement);
				}
			}
			var inaTimeOperationElement = inaStructure.getStructureByKey("TimeOperation");
			if (oFF.notNull(inaTimeOperationElement))
			{
				var dimensionName = inaTimeOperationElement.getStringByKey("Name");
				var timeFunction = oFF.QTimeOperationFunction.lookup(inaTimeOperationElement.getStringByKey("TimeOperationFunction"));
				var granularity = oFF.QTimeOperationGranularity.lookup(inaTimeOperationElement.getStringByKey("TimeOperationGranularity"));
				var period = inaTimeOperationElement.getIntegerByKey("TimeOperationPeriod");
				restrictedMeasure.setTimeOperation(dimensionName, timeFunction, granularity, period);
				restrictedMeasure.getTimeOperation().setForceMemberNavigationGeneration(inaTimeOperationElement.getBooleanByKey("TimeOperationForceMemberNavGeneration"));
				restrictedMeasure.getTimeOperation().setUseToDateFlatRangeSelection(inaTimeOperationElement.getBooleanByKey("TimeOperationUseToDateFlatRangeSelection"));
				restrictedMeasure.getTimeOperation().setHierarchyLevelName(inaTimeOperationElement.getStringByKey("LevelName"));
				var timePeriodOperationLevel = inaTimeOperationElement.getStringByKey("TimePeriodOperationLevel");
				if (oFF.notNull(timePeriodOperationLevel))
				{
					restrictedMeasure.getTimeOperation().setTimePeriodOperationLevel(oFF.QTimePeriodOperationLevel.lookup(timePeriodOperationLevel));
				}
			}
			var flattenDependentRMs = inaStructure.getBooleanByKey("FlattenDependentRestrictedMeasures");
			restrictedMeasure.setFlattenSelection(flattenDependentRMs);
			if (importer.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || inaStructure.containsKey("DisableIgnoreExtDimOnFixedFilters"))
			{
				restrictedMeasure.setDisableIgnoreExternalDimensionOnFixedFilters(inaStructure.getBooleanByKeyExt("DisableIgnoreExtDimOnFixedFilters", false));
			}
		}
	}
	return restrictedMeasure;
};
oFF.QInARepoMemberRestricted.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var restrictedMeasure = modelComponent;
	inaStructure.putString("Name", restrictedMeasure.getName());
	inaStructure.putString("Description", restrictedMeasure.getOriginalText());
	this.exportGenericMemberProperties(exporter, restrictedMeasure, inaStructure);
	var filterRoot = restrictedMeasure.getFilter().getFilterRootElement();
	if (oFF.notNull(filterRoot) && (exporter.getMode() !== oFF.QModelFormat.INA_REPOSITORY_DELTA || restrictedMeasure.getFilter().getModCounter() > 0))
	{
		var inaElement = exporter.exportComponent(null, filterRoot, null, flags);
		inaStructure.put("Selection", inaElement);
	}
	var timeOperation = restrictedMeasure.getTimeOperation();
	if (oFF.notNull(timeOperation))
	{
		var inaTimeOperationStructure = oFF.PrFactory.createStructure();
		oFF.QInARepoUtils.exportTimeOperation(inaTimeOperationStructure, timeOperation);
		inaStructure.put("TimeOperation", inaTimeOperationStructure);
	}
	var basicAggregationType = restrictedMeasure.getAggregationType();
	oFF.QInARepoUtils.setNameIfNotNull(inaStructure, "Aggregation", basicAggregationType);
	inaStructure.putStringNotNull("UnitType", oFF.QInAConverter.lookupUnitTypeInA(restrictedMeasure.getUnitType()));
	inaStructure.putStringNotNull("UnitFixed", restrictedMeasure.getUnitFixed());
	inaStructure.putStringNotNull("UnitName", restrictedMeasure.getUnitName());
	inaStructure.putStringNotNull("UnitTextName", restrictedMeasure.getUnitTextName());
	if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || restrictedMeasure.hasPropertyChanged(oFF.QStructureMemberProperties.QY_DATA_TYPE))
	{
		inaStructure.putStringNotNull("DataType", oFF.QInAConverter.lookupValueTypeInA(restrictedMeasure.getDataType()));
	}
	if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || restrictedMeasure.hasPropertyChanged(oFF.QStructureMemberProperties.QY_PRESENTATION_SIGN_REVERSAL))
	{
		var presentationSignReversal = restrictedMeasure.getPresentationSignReversal();
		if (oFF.notNull(presentationSignReversal))
		{
			inaStructure.putBoolean("PresentationSignReversal", presentationSignReversal.getBoolean());
		}
	}
	if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || restrictedMeasure.hasPropertyChanged(oFF.QMeasureProperties.QY_FLATTEN_DEPENDENT_RESTRICTED_MEASURES))
	{
		var flattenDependentRestrictedMeasures = restrictedMeasure.isFlattenSelection();
		if (flattenDependentRestrictedMeasures || exporter.mode === oFF.QModelFormat.INA_REPOSITORY_DELTA)
		{
			inaStructure.putBoolean("FlattenDependentRestrictedMeasures", flattenDependentRestrictedMeasures);
		}
	}
	if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || restrictedMeasure.hasPropertyChanged(oFF.QMeasureProperties.QY_DISABLE_IGNORE_EXTDIM_ON_FIXEDFILTERS))
	{
		if (restrictedMeasure.isDisableIgnoreExternalDimensionOnFixedFilters() || exporter.mode === oFF.QModelFormat.INA_REPOSITORY_DELTA && restrictedMeasure.hasPropertyChanged(oFF.QMeasureProperties.QY_DISABLE_IGNORE_EXTDIM_ON_FIXEDFILTERS))
		{
			inaStructure.putBoolean("DisableIgnoreExtDimOnFixedFilters", restrictedMeasure.isDisableIgnoreExternalDimensionOnFixedFilters());
		}
	}
	return oFF.QInARepoMemberAbstract.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};

oFF.QInARepoMemberRunningTotal = function() {};
oFF.QInARepoMemberRunningTotal.prototype = new oFF.QInARepoMemberAbstract();
oFF.QInARepoMemberRunningTotal.prototype._ff_c = "QInARepoMemberRunningTotal";

oFF.QInARepoMemberRunningTotal.prototype.getComponentType = function()
{
	return oFF.MemberType.RUNNING_TOTAL;
};
oFF.QInARepoMemberRunningTotal.prototype.newModelComponent = function(application, olapEnv, parentComponent, context)
{
	var newMember = oFF.QRunningTotalMeasure._createRunningTotalMeasure(context, null);
	newMember.setParent(parentComponent);
	return newMember;
};
oFF.QInARepoMemberRunningTotal.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var runningTotalMeasure = modelComponent;
	var dimension = parentComponent;
	var newMemberName = inaStructure.getStringByKey("Name");
	var newMemberText = inaStructure.getStringByKey("Description");
	if (oFF.isNull(runningTotalMeasure))
	{
		runningTotalMeasure = dimension.addNewRunningTotalMeasure(newMemberName, newMemberText);
	}
	else
	{
		runningTotalMeasure.setDimension(dimension);
		runningTotalMeasure.setName(newMemberName);
		runningTotalMeasure.setText(newMemberText);
	}
	runningTotalMeasure.setBaseMeasureName(inaStructure.getStringByKey("BaseMeasureName"));
	oFF.QInARepoMemberAbstract.importGenericMemberAbstractProperties(importer, runningTotalMeasure, inaStructure);
	runningTotalMeasure.setBaseMeasureName(inaStructure.getStringByKey("BaseMeasureName"));
	if (inaStructure.containsKey("Operator"))
	{
		runningTotalMeasure.setOperator(oFF.QInAConverter.lookupRunningTotalOperator("Operator"));
	}
	var list;
	if (inaStructure.containsKey("IterationDimensions"))
	{
		runningTotalMeasure.clearIterationDimensions();
		list = inaStructure.getListByKey("PartitionLevel");
		for (var i = 0; i < list.size(); i++)
		{
			var iterationDimension = runningTotalMeasure.addNewIterationDimension();
			var structure = list.getStructureAt(i);
			iterationDimension.setDimensionName(structure.getStringByKey("Name"));
			iterationDimension.setPartitionLevelName(structure.getStringByKey("PartitionLevel"));
		}
	}
	runningTotalMeasure.setAutoSignFlip(inaStructure.getBooleanByKey("AutoSignFlip"));
	return runningTotalMeasure;
};
oFF.QInARepoMemberRunningTotal.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var runningTotalMeasure = modelComponent;
	inaStructure.putString("Name", runningTotalMeasure.getName());
	inaStructure.putString("Description", runningTotalMeasure.getOriginalText());
	inaStructure.putString("BaseMeasureName", runningTotalMeasure.getBaseMeasureName());
	if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || runningTotalMeasure.hasPropertyChanged(oFF.QStructureMemberProperties.QY_RUNNING_TOTAL_OPERATOR))
	{
		inaStructure.putString("Operator", oFF.QInAConverter.lookupRunningTotalOperatorInA(runningTotalMeasure.getOperator()));
	}
	var list;
	if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || runningTotalMeasure.hasPropertyChanged(oFF.QStructureMemberProperties.QY_ITERATION_DIMENSIONS))
	{
		list = inaStructure.putNewList("IterationDimensions");
		var iterationList = runningTotalMeasure.getIterationDimensions();
		for (var i = 0; i < iterationList.size(); i++)
		{
			var structure = list.addNewStructure();
			var iterationDimension = iterationList.get(i);
			structure.putStringNotNullAndNotEmpty("Name", iterationDimension.getDimensionName());
			structure.putStringNotNullAndNotEmpty("PartitionLevel", iterationDimension.getPartitionLevelName());
		}
	}
	if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || runningTotalMeasure.hasPropertyChanged(oFF.QStructureMemberProperties.QY_AUTO_SIGN_FLIP))
	{
		if (runningTotalMeasure.isAutoSignFlip() || runningTotalMeasure.hasPropertyChanged(oFF.QStructureMemberProperties.QY_AUTO_SIGN_FLIP) && exporter.mode === oFF.QModelFormat.INA_REPOSITORY_DELTA)
		{
			inaStructure.putBoolean("AutoSignFlip", runningTotalMeasure.isAutoSignFlip());
		}
	}
	if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || runningTotalMeasure.hasPropertyChanged(oFF.QStructureMemberProperties.QY_UNIT_TYPE))
	{
		inaStructure.putStringNotNull("UnitType", oFF.QInAConverter.lookupUnitTypeInA(runningTotalMeasure.getUnitType()));
	}
	inaStructure.putStringNotNull("UnitFixed", runningTotalMeasure.getUnitFixed());
	inaStructure.putStringNotNull("UnitName", runningTotalMeasure.getUnitName());
	inaStructure.putStringNotNull("UnitTextName", runningTotalMeasure.getUnitTextName());
	if (exporter.mode !== oFF.QModelFormat.INA_REPOSITORY_DELTA || runningTotalMeasure.hasPropertyChanged(oFF.QStructureMemberProperties.QY_DATA_TYPE))
	{
		inaStructure.putStringNotNull("DataType", oFF.QInAConverter.lookupValueTypeInA(runningTotalMeasure.getDataType()));
	}
	oFF.QInARepoMemberAbstract.prototype.exportGenericMemberProperties.call( this , exporter, runningTotalMeasure, inaStructure);
	return oFF.QInARepoMemberAbstract.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};

oFF.QInARepoMemberVarianceMeasure = function() {};
oFF.QInARepoMemberVarianceMeasure.prototype = new oFF.QInARepoMemberAbstract();
oFF.QInARepoMemberVarianceMeasure.prototype._ff_c = "QInARepoMemberVarianceMeasure";

oFF.QInARepoMemberVarianceMeasure.prototype.getComponentType = function()
{
	return oFF.MemberType.VARIANCE;
};
oFF.QInARepoMemberVarianceMeasure.prototype.newModelComponent = function(application, olapEnv, parentComponent, context)
{
	var newMember = oFF.QVarianceMeasure._createVarianceMeasure(context, parentComponent);
	newMember.setParent(parentComponent);
	return newMember;
};
oFF.QInARepoMemberVarianceMeasure.prototype.importVarianceMember = function(inaStructure, member)
{
	member.setNullHandlingType(oFF.VarianceNullHandlingType.lookup(inaStructure.getStringByKey("NullHandling")));
	member.setCalculationType(oFF.VarianceCalculationType.lookup(inaStructure.getStringByKey("CalculationType")));
	member.setBaseMeasure(inaStructure.getStringByKey("BaseMeasureName"));
	member.setReferenceMeasure(inaStructure.getStringByKey("ReferenceMeasureName"));
	if (inaStructure.containsKey("BaseIgnoreExternalDimensions"))
	{
		var baseInAIgnoredExternalDimensions = inaStructure.getListByKey("BaseIgnoreExternalDimensions");
		for (var idxIgnore1 = 0; idxIgnore1 < baseInAIgnoredExternalDimensions.size(); idxIgnore1++)
		{
			member.addBaseExternalDimensionToIgnore(baseInAIgnoredExternalDimensions.getStringAt(idxIgnore1));
		}
	}
	if (inaStructure.containsKey("ReferenceIgnoreExternalDimensions"))
	{
		var referenceInAIgnoreExternalDimensions = inaStructure.getListByKey("ReferenceIgnoreExternalDimensions");
		for (var idxIgnore2 = 0; idxIgnore2 < referenceInAIgnoreExternalDimensions.size(); idxIgnore2++)
		{
			member.addReferenceExternalDimensionToIgnore(referenceInAIgnoreExternalDimensions.getStringAt(idxIgnore2));
		}
	}
	var inaBaseTimeOperationElement = inaStructure.getStructureByKey("BaseTimeOperation");
	if (oFF.notNull(inaBaseTimeOperationElement))
	{
		var baseDimensionName = inaBaseTimeOperationElement.getStringByKey("Name");
		var baseTimeFunction = oFF.QTimeOperationFunction.lookup(inaBaseTimeOperationElement.getStringByKey("TimeOperationFunction"));
		var baseGranularity = oFF.QTimeOperationGranularity.lookup(inaBaseTimeOperationElement.getStringByKey("TimeOperationGranularity"));
		var basePeriod = inaBaseTimeOperationElement.getIntegerByKey("TimeOperationPeriod");
		member.setBaseTimeOperation(baseDimensionName, baseTimeFunction, baseGranularity, basePeriod);
		member.getBaseTimeOperation().setForceMemberNavigationGeneration(inaBaseTimeOperationElement.getBooleanByKey("TimeOperationForceMemberNavGeneration"));
		member.getBaseTimeOperation().setUseToDateFlatRangeSelection(inaBaseTimeOperationElement.getBooleanByKey("TimeOperationUseToDateFlatRangeSelection"));
		member.getBaseTimeOperation().setHierarchyLevelName(inaBaseTimeOperationElement.getStringByKey("LevelName"));
		var baseTimePeriodOperationLevel = inaBaseTimeOperationElement.getStringByKey("TimePeriodOperationLevel");
		if (oFF.notNull(baseTimePeriodOperationLevel))
		{
			member.getBaseTimeOperation().setTimePeriodOperationLevel(oFF.QTimePeriodOperationLevel.lookup(baseTimePeriodOperationLevel));
		}
	}
	var inaReferenceTimeOperationElement = inaStructure.getStructureByKey("ReferenceTimeOperation");
	if (oFF.notNull(inaReferenceTimeOperationElement))
	{
		var referenceDimensionName = inaReferenceTimeOperationElement.getStringByKey("Name");
		var referenceTimeFunction = oFF.QTimeOperationFunction.lookup(inaReferenceTimeOperationElement.getStringByKey("TimeOperationFunction"));
		var referenceGranularity = oFF.QTimeOperationGranularity.lookup(inaReferenceTimeOperationElement.getStringByKey("TimeOperationGranularity"));
		var referencePeriod = inaReferenceTimeOperationElement.getIntegerByKey("TimeOperationPeriod");
		member.setReferenceTimeOperation(referenceDimensionName, referenceTimeFunction, referenceGranularity, referencePeriod);
		member.getReferenceTimeOperation().setForceMemberNavigationGeneration(inaReferenceTimeOperationElement.getBooleanByKey("TimeOperationForceMemberNavGeneration"));
		member.getReferenceTimeOperation().setUseToDateFlatRangeSelection(inaReferenceTimeOperationElement.getBooleanByKey("TimeOperationUseToDateFlatRangeSelection"));
		member.getReferenceTimeOperation().setHierarchyLevelName(inaReferenceTimeOperationElement.getStringByKey("LevelName"));
		var refTimePeriodOperationLevel = inaReferenceTimeOperationElement.getStringByKey("TimePeriodOperationLevel");
		if (oFF.notNull(refTimePeriodOperationLevel))
		{
			member.getReferenceTimeOperation().setTimePeriodOperationLevel(oFF.QTimePeriodOperationLevel.lookup(refTimePeriodOperationLevel));
		}
	}
};
oFF.QInARepoMemberVarianceMeasure.prototype.importComponentWithStructure = function(importer, inaStructure, modelComponent, parentComponent, context)
{
	var varianceMeasure = modelComponent;
	var dimension = parentComponent;
	var newMemberName = inaStructure.getStringByKey("Name");
	var newMemberText = inaStructure.getStringByKey("Description");
	if (oFF.isNull(varianceMeasure))
	{
		varianceMeasure = dimension.addNewVarianceMeasure(newMemberName, newMemberText);
	}
	else
	{
		varianceMeasure.setDimension(dimension);
		varianceMeasure.setName(newMemberName);
		varianceMeasure.setText(newMemberText);
	}
	var flattenBaseFilter = inaStructure.getBooleanByKey("FlattenBaseFilter");
	varianceMeasure.setFlattenBaseFilter(flattenBaseFilter);
	var flattenReferenceFilter = inaStructure.getBooleanByKey("FlattenReferenceFilter");
	varianceMeasure.setFlattenReferenceFilter(flattenReferenceFilter);
	this.importVarianceMember(inaStructure, varianceMeasure);
	this.importFilter(importer, inaStructure, context, varianceMeasure.getBaseFilter(), "SelectionBase");
	this.importFilter(importer, inaStructure, context, varianceMeasure.getReferenceFilter(), "SelectionReference");
	var refFilter = varianceMeasure.getReferenceFilter();
	var refFilterElement = null;
	var inaSelectionRef = inaStructure.getStructureByKey("SelectionReference");
	if (oFF.notNull(inaSelectionRef))
	{
		var inaSelectionRefElement = inaSelectionRef.getStructureByKey("Selection");
		refFilterElement = importer.importComponent(null, inaSelectionRefElement, null, refFilter, context);
	}
	refFilter.setComplexRoot(refFilterElement);
	return varianceMeasure;
};
oFF.QInARepoMemberVarianceMeasure.prototype.importFilter = function(importer, inaStructure, context, filter, key)
{
	var baseFilterElement = null;
	var inaSelectionBase = inaStructure.getStructureByKey(key);
	if (oFF.notNull(inaSelectionBase))
	{
		var inaSelectionBaseElement = inaSelectionBase.getStructureByKey("Selection");
		baseFilterElement = importer.importComponent(null, inaSelectionBaseElement, null, filter, context);
	}
	filter.setComplexRoot(baseFilterElement);
};
oFF.QInARepoMemberVarianceMeasure.prototype.exportComponentWithStructure = function(exporter, modelComponent, inaStructure, flags)
{
	var varianceMeasure = modelComponent;
	inaStructure.putString("Name", varianceMeasure.getName());
	inaStructure.putString("Description", varianceMeasure.getOriginalText());
	this.exportVarianceMember(inaStructure, varianceMeasure);
	this.exportGenericMemberProperties(exporter, varianceMeasure, inaStructure);
	this.exportFilter(exporter, inaStructure, flags, varianceMeasure.getBaseFilter(), "SelectionBase");
	this.exportFilter(exporter, inaStructure, flags, varianceMeasure.getReferenceFilter(), "SelectionReference");
	var flattenBaseFilter = varianceMeasure.isFlattenBaseFilter();
	if (flattenBaseFilter)
	{
		inaStructure.putBoolean("FlattenBaseFilter", flattenBaseFilter);
	}
	var flattenReferenceFilter = varianceMeasure.isFlattenReferenceFilter();
	if (flattenReferenceFilter)
	{
		inaStructure.putBoolean("FlattenReferenceFilter", flattenReferenceFilter);
	}
	return oFF.QInARepoMemberAbstract.prototype.exportComponentWithStructure.call( this , exporter, modelComponent, inaStructure, flags);
};
oFF.QInARepoMemberVarianceMeasure.prototype.exportVarianceMember = function(inaStructure, varianceMeasure)
{
	inaStructure.putString("BaseMeasureName", varianceMeasure.getBaseMeasure());
	inaStructure.putString("ReferenceMeasureName", varianceMeasure.getReferenceMeasure());
	oFF.QInARepoUtils.setNameIfNotNull(inaStructure, "CalculationType", varianceMeasure.getCalculationType());
	oFF.QInARepoUtils.setNameIfNotNull(inaStructure, "NullHandling", varianceMeasure.getNullHandlingType());
	var baseIgnoredExternalDimensions = varianceMeasure.getBaseIgnoredExternalDimensions();
	if (baseIgnoredExternalDimensions.hasElements())
	{
		var baseInAIgnoredExternalDimensions = inaStructure.putNewList("BaseIgnoreExternalDimensions");
		baseInAIgnoredExternalDimensions.addAllStrings(baseIgnoredExternalDimensions);
	}
	var referenceIgnoredExternalDimensions = varianceMeasure.getReferenceIgnoredExternalDimensions();
	if (referenceIgnoredExternalDimensions.hasElements())
	{
		var referenceInAIgnoreExternalDimensions = inaStructure.putNewList("ReferenceIgnoreExternalDimensions");
		referenceInAIgnoreExternalDimensions.addAllStrings(referenceIgnoredExternalDimensions);
	}
	var baseTimeOperation = varianceMeasure.getBaseTimeOperation();
	if (oFF.notNull(baseTimeOperation))
	{
		var inaBaseTimeOperationStructure = oFF.PrFactory.createStructure();
		oFF.QInARepoUtils.exportTimeOperation(inaBaseTimeOperationStructure, baseTimeOperation);
		inaStructure.put("BaseTimeOperation", inaBaseTimeOperationStructure);
	}
	var referenceTimeOperation = varianceMeasure.getReferenceTimeOperation();
	if (oFF.notNull(referenceTimeOperation))
	{
		var inaReferenceTimeOperationStructure = oFF.PrFactory.createStructure();
		oFF.QInARepoUtils.exportTimeOperation(inaReferenceTimeOperationStructure, referenceTimeOperation);
		inaStructure.put("ReferenceTimeOperation", inaReferenceTimeOperationStructure);
	}
};
oFF.QInARepoMemberVarianceMeasure.prototype.exportFilter = function(exporter, inaStructure, flags, filter, key)
{
	var baseFilterRoot = filter.getFilterRootElement();
	if (oFF.notNull(baseFilterRoot))
	{
		var inaBaseFilterRootElement = exporter.exportComponent(null, baseFilterRoot, null, flags);
		var inaBaseSelection = oFF.PrFactory.createStructure();
		inaBaseSelection.put("Selection", inaBaseFilterRootElement);
		inaStructure.put(key, inaBaseSelection);
	}
};

oFF.QInARepoVarHierNode = function() {};
oFF.QInARepoVarHierNode.prototype = new oFF.QInARepoVarDimMember();
oFF.QInARepoVarHierNode.prototype._ff_c = "QInARepoVarHierNode";

oFF.QInARepoVarHierNode.prototype.getComponentType = function()
{
	return oFF.VariableType.HIERARCHY_NODE_VARIABLE;
};

oFF.QInAExport = function() {};
oFF.QInAExport.prototype = new oFF.QInA();
oFF.QInAExport.prototype._ff_c = "QInAExport";


oFF.QInAImport = function() {};
oFF.QInAImport.prototype = new oFF.QInA();
oFF.QInAImport.prototype._ff_c = "QInAImport";

oFF.QInAImport.prototype.m_cacheKey = null;

oFF.OlapSerializationModule = function() {};
oFF.OlapSerializationModule.prototype = new oFF.DfModule();
oFF.OlapSerializationModule.prototype._ff_c = "OlapSerializationModule";

oFF.OlapSerializationModule.s_module = null;
oFF.OlapSerializationModule.getInstance = function()
{
	if (oFF.isNull(oFF.OlapSerializationModule.s_module))
	{
		oFF.DfModule.checkInitialized(oFF.OlapImplModule.getInstance());
		oFF.OlapSerializationModule.s_module = oFF.DfModule.startExt(new oFF.OlapSerializationModule());
		oFF.DfModule.stopExt(oFF.OlapSerializationModule.s_module);
	}
	return oFF.OlapSerializationModule.s_module;
};
oFF.OlapSerializationModule.prototype.getName = function()
{
	return "ff4394.olap.serialization";
};

oFF.OlapSerializationModule.getInstance();

return sap.firefly;
	} );