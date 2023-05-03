/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
[
"sap/sac/df/firefly/ff2100.runtime","sap/sac/df/firefly/ff2600.visualization.abstract"
],
function(oFF)
{
"use strict";

oFF.BlendingCapabilities = {

	BLENDING_CAPABILITY_LOCAL:"CubeBlending",
	BLENDING_CAPABILITY_REMOTE:"RemoteBlending",
	BLENDING_CAPABILITY_REMOTE_BW:"RemoteBlendingBW",
	isObjectTypeSupportedForBlending:function(type)
	{
			return type === oFF.MetaObjectType.DBVIEW || type === oFF.MetaObjectType.QUERY || type === oFF.MetaObjectType.PLANNING || type === oFF.MetaObjectType.BLENDING || type === oFF.MetaObjectType.INA_MODEL || type === oFF.MetaObjectType.CDS_PROJECTION_VIEW;
	},
	isDimensionTypeSupportedForBlending:function(type)
	{
			if (oFF.isNull(type))
		{
			return false;
		}
		return type.isValidForBlending();
	},
	getMaxNumberOfBlendingQueries:function()
	{
			return 2;
	},
	isAxisTypeSupportedForBlending:function(type)
	{
			if (oFF.isNull(type))
		{
			return false;
		}
		return type === oFF.AxisType.COLUMNS || type === oFF.AxisType.ROWS;
	},
	getMinCapabilityForBlendingHost:function(sources)
	{
			if (!oFF.XCollectionUtils.hasElements(sources))
		{
			return null;
		}
		var minCapability = oFF.BlendingCapabilities.BLENDING_CAPABILITY_LOCAL;
		var primarySystemName = sources.get(0).getQueryModel().getQueryManager().getSystemName();
		for (var i = 0; i < sources.size(); i++)
		{
			var source = sources.get(i);
			var queryModel = source.getQueryModel();
			var systemType = queryModel.getSystemType();
			if (systemType.isTypeOf(oFF.SystemType.BW) || systemType.isTypeOf(oFF.SystemType.VIRTUAL_INA))
			{
				minCapability = oFF.BlendingCapabilities.BLENDING_CAPABILITY_REMOTE_BW;
			}
			else if (!systemType.isTypeOf(oFF.SystemType.HANA))
			{
				return null;
			}
			if (oFF.XString.isEqual(minCapability, oFF.BlendingCapabilities.BLENDING_CAPABILITY_LOCAL) && !oFF.XString.isEqual(primarySystemName, queryModel.getQueryManager().getSystemName()))
			{
				minCapability = oFF.BlendingCapabilities.BLENDING_CAPABILITY_REMOTE;
			}
		}
		return minCapability;
	},
	sourceSupportsCapability:function(source, minBlendingCapability)
	{
			if (oFF.XString.isEqual(minBlendingCapability, oFF.BlendingCapabilities.BLENDING_CAPABILITY_REMOTE))
		{
			return source.getQueryModel().getModelCapabilities().supportsRemoteBlending();
		}
		if (oFF.XString.isEqual(minBlendingCapability, oFF.BlendingCapabilities.BLENDING_CAPABILITY_REMOTE_BW))
		{
			return source.getQueryModel().getModelCapabilities().supportsRemoteBlendingBW();
		}
		return false;
	},
	blendingHostSupportsCapability:function(blendingHost, minBlendingCapability)
	{
			if (oFF.isNull(blendingHost))
		{
			return false;
		}
		if (oFF.XString.isEqual(minBlendingCapability, oFF.BlendingCapabilities.BLENDING_CAPABILITY_REMOTE))
		{
			return blendingHost.supportsRemoteBlending();
		}
		if (oFF.XString.isEqual(minBlendingCapability, oFF.BlendingCapabilities.BLENDING_CAPABILITY_REMOTE_BW))
		{
			return blendingHost.supportsRemoteBlendingBW();
		}
		return false;
	}
};

oFF.BlendingConstants = {

	ERROR_INVALID_QUERY_MODEL:3001,
	ERROR_INVALID_DIMENSION:3002,
	ERROR_INVALID_MAPPING:3003,
	ERROR_INVALID_BLENDING_DATA_SOURCE:3004,
	ERROR_INVALID_BLENDING_DEFINITION:3005,
	ERROR_INVALID_FIELD:3005,
	EXCEPTION_SETTING_BLENDING_DUPLICATE:"BlendingDuplicate",
	EXCEPTION_SETTING_BLENDING_AGGREGATE:"BlendingAggregate",
	REMOTE_BLENDING_USE_REQUEST_ONLY_FOR_ID_CALCULATION:false
};

oFF.BlendingValidation = {

	addError:function(messages, errorCode, message, extendedInfo)
	{
			var messageSb = oFF.XStringBuffer.create();
		messageSb.append("Blending Validation Error ").appendInt(errorCode).append(": ").append(message);
		oFF.XObjectExt.assertNotNullExt(messages, messageSb.toString());
		messages.addErrorExt(oFF.OriginLayer.DRIVER, errorCode, messageSb.toString(), extendedInfo);
	},
	isQueryModelValidForBlending:function(queryModel, messageManager)
	{
			if (oFF.isNull(queryModel))
		{
			oFF.BlendingValidation.addError(messageManager, oFF.BlendingConstants.ERROR_INVALID_QUERY_MODEL, "The QueryModel is null", null);
			return false;
		}
		if (!queryModel.getModelCapabilities().supportsCubeBlending())
		{
			oFF.BlendingValidation.addError(messageManager, oFF.BlendingConstants.ERROR_INVALID_QUERY_MODEL, "Currently only HANA and BW support blending", queryModel);
			return false;
		}
		var dataSource = queryModel.getDataSource();
		if (oFF.isNull(dataSource))
		{
			oFF.BlendingValidation.addError(messageManager, oFF.BlendingConstants.ERROR_INVALID_QUERY_MODEL, "The DataSource is null", queryModel);
			return false;
		}
		if (!oFF.BlendingCapabilities.isObjectTypeSupportedForBlending(dataSource.getType()))
		{
			oFF.BlendingValidation.addError(messageManager, oFF.BlendingConstants.ERROR_INVALID_QUERY_MODEL, oFF.XStringUtils.concatenate3("The DataSource Type '", dataSource.getType().getCamelCaseName(), "' is not supported"), queryModel);
			return false;
		}
		return true;
	},
	isFieldImplicitlyRequested:function(field)
	{
			if (field.isAlwaysRequested())
		{
			return true;
		}
		if (field.isKeyField())
		{
			return true;
		}
		if (field.getDimension().getKeyField() === field)
		{
			return true;
		}
		if (field.isDefaultTextField())
		{
			return true;
		}
		if (field.getDimension().getTextField() === field)
		{
			return true;
		}
		if (field.hasSorting() && field.getResultSetSorting().getDirection() !== oFF.XSortDirection.DEFAULT_VALUE)
		{
			return true;
		}
		return false;
	},
	isFieldValidForBlending:function(field, messageManager, validateAll)
	{
			if (oFF.isNull(field))
		{
			oFF.BlendingValidation.addError(messageManager, oFF.BlendingConstants.ERROR_INVALID_FIELD, "The field is null", null);
			return false;
		}
		if (validateAll)
		{
			if (!oFF.BlendingValidation.isDimensionValidForBlending(field.getDimension(), messageManager, validateAll))
			{
				return false;
			}
		}
		if (oFF.BlendingValidation.isFieldImplicitlyRequested(field))
		{
			return true;
		}
		var resultSetFields = field.getDimension().getResultSetFields();
		if (resultSetFields.contains(field))
		{
			return true;
		}
		oFF.BlendingValidation.addError(messageManager, oFF.BlendingConstants.ERROR_INVALID_FIELD, oFF.XStringUtils.concatenate3("The field '", field.getName(), "' is not requested"), field);
		return false;
	},
	isDimensionValidForBlending:function(dimension, messageManager, validateAll)
	{
			if (oFF.isNull(dimension))
		{
			oFF.BlendingValidation.addError(messageManager, oFF.BlendingConstants.ERROR_INVALID_DIMENSION, "The Dimension is null", null);
			return false;
		}
		if (validateAll)
		{
			if (!oFF.BlendingValidation.isQueryModelValidForBlending(dimension.getQueryModel(), messageManager))
			{
				return false;
			}
		}
		var isNotAccount = dimension.getDimensionType() !== oFF.DimensionType.ACCOUNT;
		var isNotMeasure = dimension.getDimensionType() !== oFF.DimensionType.MEASURE_STRUCTURE;
		if (!oFF.BlendingCapabilities.isAxisTypeSupportedForBlending(dimension.getAxisType()) && isNotAccount && isNotMeasure)
		{
			oFF.BlendingValidation.addError(messageManager, oFF.BlendingConstants.ERROR_INVALID_DIMENSION, oFF.XStringUtils.concatenate3("The axis of the dimension '", dimension.getName(), "' is not supported for blending"), dimension);
			return false;
		}
		if (!oFF.BlendingCapabilities.isDimensionTypeSupportedForBlending(dimension.getDimensionType()))
		{
			oFF.BlendingValidation.addError(messageManager, oFF.BlendingConstants.ERROR_INVALID_DIMENSION, oFF.XStringUtils.concatenate3("The type of the dimension '", dimension.getName(), "' is not supported for blending"), dimension);
			return false;
		}
		return true;
	},
	assertBlendingDefinitionIsValid:function(blendingDefinition)
	{
			oFF.BlendingValidation.isBlendingDefinitionValid(blendingDefinition, null);
	},
	isBlendingDefinitionValid:function(blendingDefinition, messageManager)
	{
			if (oFF.isNull(blendingDefinition))
		{
			oFF.BlendingValidation.addError(messageManager, oFF.BlendingConstants.ERROR_INVALID_BLENDING_DEFINITION, "The BlendingDefinition is null", null);
			return false;
		}
		if (blendingDefinition.getSources().size() < 2)
		{
			oFF.BlendingValidation.addError(messageManager, oFF.BlendingConstants.ERROR_INVALID_BLENDING_DEFINITION, "At least 2 sources must be defined for blending", blendingDefinition);
			return false;
		}
		if (!oFF.BlendingValidation.assertMandatoryJoinTypes(blendingDefinition, messageManager))
		{
			return false;
		}
		var mappings = blendingDefinition.getMappings();
		var mappingIterator = mappings.getIterator();
		while (mappingIterator.hasNext())
		{
			var mapping = mappingIterator.next();
			if (mapping.getConstantMappings().hasElements() && mapping.getLinkType() !== oFF.BlendingLinkType.ALL_DATA && mapping.getLinkType() !== oFF.BlendingLinkType.NONE)
			{
				oFF.XObjectExt.release(mappingIterator);
				oFF.BlendingValidation.addError(messageManager, oFF.BlendingConstants.ERROR_INVALID_BLENDING_DEFINITION, "Constant Mappings are only allowed for ALL_DATA or NONE links", mapping);
				return false;
			}
		}
		oFF.XObjectExt.release(mappingIterator);
		return true;
	},
	assertMandatoryJoinTypes:function(blendingDefinition, messageManager)
	{
			var containsJoin = false;
		var containsUnion = false;
		var mappings = blendingDefinition.getMappings();
		var mappingIterator = mappings.getIterator();
		while (mappingIterator.hasNext())
		{
			var mapping = mappingIterator.next();
			if (mapping.getLinkType() === oFF.BlendingLinkType.ALL_DATA || mapping.getLinkType() === oFF.BlendingLinkType.PRIMARY || mapping.getLinkType() === oFF.BlendingLinkType.INTERSECT)
			{
				containsJoin = true;
			}
			if (mapping.getLinkType() === oFF.BlendingLinkType.COEXIST)
			{
				containsUnion = true;
			}
			if (containsJoin && containsUnion)
			{
				return true;
			}
		}
		oFF.XObjectExt.release(mappingIterator);
		if (!containsJoin)
		{
			oFF.BlendingValidation.addError(messageManager, oFF.BlendingConstants.ERROR_INVALID_BLENDING_DEFINITION, "There has to be at least one mapping with linktype 'ALL_DATA', 'PRIMARY' or 'INTERSECT'", blendingDefinition);
		}
		if (!containsUnion)
		{
			oFF.BlendingValidation.addError(messageManager, oFF.BlendingConstants.ERROR_INVALID_BLENDING_DEFINITION, "There has to be at least one mapping with linktype 'CO_EXIST'", blendingDefinition);
		}
		return false;
	}
};

oFF.QCanonicalDateProvider = function() {};
oFF.QCanonicalDateProvider.prototype = new oFF.XObject();
oFF.QCanonicalDateProvider.prototype._ff_c = "QCanonicalDateProvider";

oFF.QCanonicalDateProvider.m_nativeInstance = null;
oFF.QCanonicalDateProvider.getInstance = function()
{
	return oFF.QCanonicalDateProvider.m_nativeInstance;
};
oFF.QCanonicalDateProvider.setInstance = function(prompt)
{
	oFF.QCanonicalDateProvider.m_nativeInstance = prompt;
};
oFF.QCanonicalDateProvider.staticSetup = function()
{
	var canonicalDateUtilPlugin = new oFF.QCanonicalDateProvider();
	oFF.QCanonicalDateProvider.setInstance(canonicalDateUtilPlugin);
};
oFF.QCanonicalDateProvider.prototype.createCanonicalDatesFromEntityValues = function(canonicalDateContext, entityValues)
{
	return oFF.XList.create();
};
oFF.QCanonicalDateProvider.prototype.createCanonicalDateFromEntityValueInfo = function(canonicalDateContext, entityKeyValue, granularity)
{
	return null;
};
oFF.QCanonicalDateProvider.prototype.castCanonicalDateToLevel = function(canonicalDateContext, canonicalDate, targetGranularity, useLast)
{
	return canonicalDate;
};
oFF.QCanonicalDateProvider.prototype.incrementCanonicalDate = function(canonicalDateContext, canonicalDate, increments, incrementGranularity)
{
	return canonicalDate;
};
oFF.QCanonicalDateProvider.prototype.createEntityValueFromCanonicalDate = function(canonicalDateContext, canonicalDate)
{
	return "";
};
oFF.QCanonicalDateProvider.prototype.getEntityValueKeyFromCanonicalDate = function(canonicalDateContext, canonicalDate)
{
	return "";
};
oFF.QCanonicalDateProvider.prototype.createCurrentCanonicalDate = function(canonicalDateContext, granularity)
{
	return null;
};
oFF.QCanonicalDateProvider.prototype.createCurrentCanonicalDateWithTimeZoneOffset = function(canonicalDateContext, granularity, timeZoneOffsetInMinutes)
{
	return null;
};
oFF.QCanonicalDateProvider.prototype.getGranularityFromEntityValue = function(canonicalDateContext, entityValue)
{
	return null;
};
oFF.QCanonicalDateProvider.prototype.getGranularityFromEntityValueWithFlexibleSupport = function(queryManager, canonicalDateContext, entityValue)
{
	return null;
};
oFF.QCanonicalDateProvider.prototype.getAncestorEntityValues = function(queryManager, canonicalDateContext, memberId)
{
	return null;
};
oFF.QCanonicalDateProvider.prototype.isBefore = function(canonicalDateContext, firstCanonicalDate, secondCanonicalDate)
{
	return true;
};
oFF.QCanonicalDateProvider.prototype.isSameOrBefore = function(canonicalDateContext, firstCanonicalDate, secondCanonicalDate)
{
	return true;
};
oFF.QCanonicalDateProvider.prototype.isAfter = function(canonicalDateContext, firstCanonicalDate, secondCanonicalDate)
{
	return true;
};
oFF.QCanonicalDateProvider.prototype.isSameOrAfter = function(canonicalDateContext, firstCanonicalDate, secondCanonicalDate)
{
	return true;
};
oFF.QCanonicalDateProvider.prototype.convertCanonicalDateToTargetLevelAndFiscalSpace = function(sourceCanonicalDateContext, sourceCanonicalDate, targetGranularity, targetFiscalSpace)
{
	return null;
};

oFF.CmdCreateQueryManager = {

	CMD_NAME:"CREATE_QUERY_MANAGER",
	PARAM_I_APPLICATION:"APPLICATION",
	PARAM_I_SYSTEM:"SYSTEM",
	PARAM_I_DATA_SOURCE:"DATA_SOURCE",
	PARAM_I_ENFORCE_INACTIVE_CAPABILITIES:"PARAM_I_ENFORCE_INACTIVE_CAPABILITIES",
	PARAM_I_QUERY_MODEL_STRUCTURE_INA_REPOSITORY:"QUERY_MODEL_STRUCTURE_INA_REPOSITORY",
	PARAM_I_MODELLER_CONTENT_INA_REPOSITORY:"PARAM_I_MODELLER_CONTENT_INA_REPOSITORY",
	PARAM_E_QUERY_MANAGER:"QUERY_MANAGER",
	PARAM_I_EXT_DIMS_INFO:"EXTENDED_DIMENSIONS_INFO"
};

oFF.CmdDeserializeBlending = {

	CMD_NAME:"DESERIALIZE_BLENDING",
	PARAM_I_ENFORCE_INACTIVE_CAPABILITIES:"PARAM_I_ENFORCE_INACTIVE_CAPABILITIES",
	PARAM_I_QUERY_MODEL_STRING_INA_REPOSITORY:"QUERY_MODEL_STRING_INA_REPOSITORY",
	PARAM_I_APPLICATION:"APPLICATION",
	PARAM_I_SYSTEM:"SYSTEM",
	PARAM_I_SYSTEMS:"SYSTEMS",
	PARAM_E_QUERY_MANAGER:"QUERY_MANAGER",
	PARAM_I_EXT_DIMS_INFO:"EXTENDED_DIMENSIONS_INFO"
};

oFF.CmdDeserializeBlendingNodes = {

	CMD_NAME:"DESERIALIZE_BLENDING_NODES",
	PARAM_I_QUERY_MODEL_STRING_INA_REPOSITORY:"QUERY_MODEL_STRING_INA_REPOSITORY",
	PARAM_I_APPLICATION:"APPLICATION",
	PARAM_I_SYSTEM:"SYSTEM",
	PARAM_I_SYSTEMS:"SYSTEMS",
	PARAM_I_LEAF_QUERY_MODELS:"LEAF_QUERY_MODELS",
	PARAM_I_EXT_DIMS_INFO:"EXTENDED_DIMENSIONS_INFO",
	PARAM_I_ENFORCE_INACTIVE_CAPABILITIES:"PARAM_I_ENFORCE_INACTIVE_CAPABILITIES",
	PARAM_E_QUERY_MANAGER:"EXPORT_QUERY_MANAGER"
};

oFF.CmdDeserializeBlendingSources = {

	CMD_NAME:"DESERIALIZE_BLENDING_SOURCES",
	PARAM_I_ENFORCE_INACTIVE_CAPABILITIES:"PARAM_I_ENFORCE_INACTIVE_CAPABILITIES",
	PARAM_I_QUERY_MODEL_STRING_INA_REPOSITORY:"QUERY_MODEL_STRING_INA_REPOSITORY",
	PARAM_I_MODELLER_CONTENT_LIST_INA_REPOSITORY:"PARAM_I_MODELLER_CONTENT_LIST_INA_REPOSITORY",
	PARAM_I_APPLICATION:"APPLICATION",
	PARAM_I_SYSTEM:"SYSTEM",
	PARAM_I_SYSTEMS:"SYSTEMS",
	PARAM_E_QUERY_MANAGER:"QUERY_MANAGER",
	PARAM_E_QUERY_MANAGERS:"QUERY_MANAGERS",
	PARAM_I_EXT_DIMS_INFO:"EXTENDED_DIMENSIONS_INFO"
};

oFF.CmdDeserializeCalculatedDimension = {

	CMD_NAME:"DESERIALIZE_CALCULATED_DIMENSION",
	PARAM_I_QUERY_MODELS_STRING_INA_REPOSITORY:"QUERY_MODELS_STRING_INA_REPOSITORY",
	PARAM_I_APPLICATION:"APPLICATION",
	PARAM_I_SYSTEM:"SYSTEM"
};

oFF.CmdDeserializeExtendedDimension = {

	CMD_NAME:"DESERIALIZE_EXTENDED_DIMENSION",
	PARAM_I_QUERY_MODEL_STRING_INA_REPOSITORY:"QUERY_MODEL_STRING_INA_REPOSITORY",
	PARAM_I_ENFORCE_INACTIVE_CAPABILITIES:"PARAM_I_ENFORCE_INACTIVE_CAPABILITIES",
	PARAM_I_QUERY_MODEL:"QUERYMODEL",
	PARAM_E_QUERY_MANAGER:"QUERY_MANAGER",
	PARAM_I_EXT_DIMS_INFO:"EXTENDED_DIMENSIONS_INFO"
};

oFF.QConditionProperties = {

	QY_CONDITIONS_ACTIVE:"Active",
	QY_BREAK_GROUP:"BreakGroup",
	QY_CONDITIONS_ON_DISABLED_WARNING:"OnDisabled",
	QY_CONDITIONS_AFTER_VISIBILITY_FILTER:"AfterVisibilityFilter",
	QY_CONDITIONS_BREAK_HIERARCHY:"BreakHierarchy",
	QY_LEAVES_ONLY:"LeavesOnly",
	QY_CONDITIONS_EVALUATE_ON_DIMENSIONS:"~EvaluateOnDimensions",
	QY_CONDITIONS_COMPARISON:"~Comparison"
};

oFF.MeasureModelConstants = {

	DEFAULT_CUSTOMDIMENSION2_MEMBER:"MeasureValues"
};

oFF.CurrencyConstants = {

	DEFAULT_CURRENCY:"PeriodicInDefaultCurrency",
	LOCAL_CURRENCY:"PeriodicInLocalCurrency"
};

oFF.CurrencyTranslationConstants = {

	DYNAMIC:"@@DYNAMIC@@",
	QUERY_LEVEL:"@@QUERY_LEVEL_CURRENCY_TRANSLATION@@",
	DEFAULT:"@@DEFAULT@@",
	DEFINED:"Defined",
	POSSIBLE:"Possible",
	NO_CURRENCY:"NoCurrency",
	SIGNED_DATA:"SignedData",
	SIGNED_DATA_LOCAL:"SignedDataLocal",
	SAC_RATE_VERSION:"SAC::RateVersion",
	SAC_RATE_TYPE:"SAC::RateType",
	SAC_CURRENCY_CONVERSION_CATEGORY:"SAC::CurrencyConversionCategory"
};

oFF.QCurrencyTranslationProperties = {

	QY_DATE_OFFSET:"~DateOffset",
	QY_MAX_NUMBER_OF_CONVERSIONS:"~MaxNumberOfCurrencyTranslations",
	QY_CURRENCY_TRANSLATION_OPERATION:"~Operation",
	QY_CATEGORY:"~Category",
	QY_RATE_TYPE:"RateType",
	QY_DATE_OFFSET_GRANULARITY:"~DateOffsetGranularity"
};

oFF.QDataCellProperties = {

	QY_CUMULATION:"Cumulation",
	QY_EMPHASIZED:"Emphasized",
	QY_SIGN_REVERSAL:"SignReversal",
	QY_INPUT_ENABLED:"InputEnabled",
	QY_SCALING_FACTOR:"ScalingFactor",
	QY_DECIMAL_PLACES:"DecimalPlaces",
	QY_DISAGGREGATION_MODE:"~DisaggregationMode",
	QY_DISAGGREGATION_REF_CELL_NAME:"~DisaggregationReferenceCellName",
	QY_CURRENCY_PRESENTATION:"~CurrencyPresentation",
	QY_SCALE_FORMAT:"~ScaleFormat",
	QY_SIGN_PRESENTATION:"~SignPresentation",
	QY_SCALE_AND_UNIT_PLACEMENT:"~ScaleAndUnitPlacement"
};

oFF.QDimensionProperties = {

	IS_CUMULATIVE:"isCumulative",
	QY_SKIP:"Skip",
	QY_TOP:"Top",
	QY_SELECTOR_INITIAL_DRILL_LEVEL:"SelectorInitialDrillLevel",
	QY_FIELD_LAYOUT_TYPE:"~FieldLayoutType",
	QY_READ_MODE:"~ReadMode",
	QY_SELECTOR_READ_MODE:"~SelectorReadMode",
	QY_VARIABLE_READ_MODE:"~VariableReadMode",
	QY_OVERRIDE_TEXT:"~OverrideText"
};

oFF.QTransientConstants = {

	TAG_IS_TRANSIENT:"isTransient",
	TAG_TARGET_AXIS:"targetAxis",
	TAG_TARGET_AXIS_ROWS:"Rows",
	TAG_TARGET_AXIS_COLUMNS:"Columns",
	TAG_SERIALIZE_MEMBER:"serializeMember",
	TAG_RESULT_IS_HIDDEN:"resultIsHidden",
	TAG_OVERRIDE_DESCRIPTION:"overrideDescription",
	TAG_IS_TRANSIENT_MEMBER_COPY:"isTransientMemberCopy",
	TAG_IS_TRANSIENT_FILTER_ELEMENT:"isTransientFilterElement",
	TAG_IS_TRANSIENT_BLENDING_PROCESS:"isTransientBlendingProcess"
};

oFF.QDimensionMemberProperties = {

	QY_VISIBILITY:"~Visibility"
};

oFF.CommentingFactory = {

	s_factory:null,
	_getInstance:function()
	{
			return oFF.CommentingFactory.s_factory;
	},
	setInstance:function(factory)
	{
			oFF.CommentingFactory.s_factory = factory;
	},
	createCommentingThread:function(creator)
	{
			return oFF.CommentingFactory.s_factory.newCommentingThread(creator);
	},
	createCommentingThreadFromStructure:function(structure)
	{
			return oFF.CommentingFactory.s_factory.newCommentingThreadFromStructure(structure);
	}
};

oFF.QDrillProperties = {

	QY_DRILL_LEVEL:"~DrillLevel",
	QY_INITIAL_DRILL_OFFSET:"~InitialDrillOffset",
	QY_DRILL_STATE:"DrillState"
};

oFF.QExceptionProperties = {

	QY_ACTIVE:"Active",
	QY_EVALUATE_ALL_MEMBERS_MEASURE_DIMENSION:"~EvaluateAllMembers_MeasureDimension",
	QY_EVALUATE_ALL_MEMBERS_SECONDARY_STRUCTURE:"~EvaluateAllMembers_SecondaryStructure",
	QY_AUTO_SIGN_FLIP:"AutoSignFlip",
	QY_IS_PRIMARY:"IsPrimary",
	QY_NULL_AS_ZERO:"NullAsZero",
	QY_FORMULA_RESULT_VISIBLE:"FormulaResultVisible",
	QY_EVALUATE_BEFORE_POST_AGGREGATION:"EvaluateBeforePostAggregation",
	QY_CHANGEABLE:"Changegable",
	QY_PRIORITY:"Priority"
};

oFF.QFieldProperties = {

	QY_RS_FIXED_ATTRIBUTES:"ResultSetFixedAttributes",
	QY_AUTO_SIGN_FLIP:"AutoSignFlip",
	QY_OBTAINABILITY:"~Obtainability"
};

oFF.QFilterProperties = {

	QY_CONVERT_TO_FLAT_SELECTION_FO:"ConvertToFlatSelection_FilterOperation",
	QY_CONVERT_TO_FLAT_SELECTION_CL:"ConvertToFlatSelection_CartesianList",
	QY_IS_SUPPRESSING_NULLS:"IsSuppressingNulls"
};

oFF.FormulaItemInfo = function() {};
oFF.FormulaItemInfo.prototype = new oFF.XObject();
oFF.FormulaItemInfo.prototype._ff_c = "FormulaItemInfo";

oFF.FormulaItemInfo.create = function()
{
	var formulaItemInfo = new oFF.FormulaItemInfo();
	formulaItemInfo.m_attributeNames = oFF.XListOfString.create();
	formulaItemInfo.m_memberNames = oFF.XListOfString.create();
	formulaItemInfo.m_dimensionNames = oFF.XListOfString.create();
	return formulaItemInfo;
};
oFF.FormulaItemInfo.prototype.m_attributeNames = null;
oFF.FormulaItemInfo.prototype.m_memberNames = null;
oFF.FormulaItemInfo.prototype.m_dimensionNames = null;
oFF.FormulaItemInfo.prototype.addAttributeName = function(name)
{
	if (oFF.notNull(name) && !this.m_attributeNames.contains(name))
	{
		this.m_attributeNames.add(name);
	}
};
oFF.FormulaItemInfo.prototype.addMemberName = function(name)
{
	if (oFF.notNull(name))
	{
		this.m_memberNames.add(name);
	}
};
oFF.FormulaItemInfo.prototype.addDimensionName = function(name)
{
	if (oFF.notNull(name) && !this.m_dimensionNames.contains(name))
	{
		this.m_dimensionNames.add(name);
	}
};
oFF.FormulaItemInfo.prototype.getAttributeNames = function()
{
	return this.m_attributeNames;
};
oFF.FormulaItemInfo.prototype.getMemberNames = function()
{
	return this.m_memberNames;
};
oFF.FormulaItemInfo.prototype.getDimensionNames = function()
{
	return this.m_dimensionNames;
};
oFF.FormulaItemInfo.prototype.removeAttributeName = function(name)
{
	this.m_attributeNames.removeElement(name);
};
oFF.FormulaItemInfo.prototype.removeMemberName = function(name)
{
	this.m_memberNames.removeElement(name);
};
oFF.FormulaItemInfo.prototype.removeDimensionName = function(name)
{
	this.m_dimensionNames.removeElement(name);
};

oFF.FormulaItemUtils = {

	getFieldNamesFromFormula:function(formulaItem)
	{
			var formulaItemInfo = oFF.FormulaItemInfo.create();
		if (oFF.isNull(formulaItem))
		{
			return formulaItemInfo;
		}
		if (formulaItem.getOlapComponentType() === oFF.OlapComponentType.FORMULA_ITEM_ATTRIBUTE)
		{
			formulaItemInfo.addAttributeName(formulaItem.getFieldName());
		}
		else if (formulaItem.getOlapComponentType() === oFF.OlapComponentType.FORMULA_ITEM_MEMBER)
		{
			var dimensionName = formulaItem.getDimensionName();
			if (oFF.XStringUtils.isNotNullAndNotEmpty(dimensionName))
			{
				if (formulaItem.getQueryModel() !== null)
				{
					var dimension = formulaItem.getQueryModel().getDimensionByName(dimensionName);
					if (oFF.notNull(dimension) && (dimension.isStructure() || dimension.getDimensionType() === oFF.DimensionType.ACCOUNT))
					{
						formulaItemInfo.addMemberName(formulaItem.getMemberName());
					}
				}
				formulaItemInfo.addDimensionName(dimensionName);
			}
			else
			{
				formulaItemInfo.addMemberName(formulaItem.getMemberName());
			}
		}
		else if (formulaItem.getOlapComponentType() === oFF.OlapComponentType.FORMULA_FUNCTION)
		{
			var formula = formulaItem;
			var formulaIterator = formula.getIterator();
			while (formulaIterator.hasNext())
			{
				var nestedFormulaItemInfo = oFF.FormulaItemUtils.getFieldNamesFromFormula(formulaIterator.next());
				var functionFieldNamesIterator = nestedFormulaItemInfo.getAttributeNames().getIterator();
				while (functionFieldNamesIterator.hasNext())
				{
					formulaItemInfo.addAttributeName(functionFieldNamesIterator.next());
				}
				var functionMemberNamesIterator = nestedFormulaItemInfo.getMemberNames().getIterator();
				while (functionMemberNamesIterator.hasNext())
				{
					formulaItemInfo.addMemberName(functionMemberNamesIterator.next());
				}
				var functionDimensionNamesIterator = nestedFormulaItemInfo.getDimensionNames().getIterator();
				while (functionDimensionNamesIterator.hasNext())
				{
					formulaItemInfo.addDimensionName(functionDimensionNamesIterator.next());
				}
			}
		}
		return formulaItemInfo;
	},
	getFormulaMembers:function(formulaItem)
	{
			var usedMember = oFF.XList.create();
		oFF.FormulaItemUtils._addUsedMember(formulaItem, usedMember);
		return usedMember;
	},
	_addUsedMember:function(formulaItem, usedMember)
	{
			if (oFF.isNull(formulaItem))
		{
			return;
		}
		if (formulaItem.getOlapComponentType() === oFF.OlapComponentType.FORMULA_ITEM_MEMBER)
		{
			var formulaMember = formulaItem;
			usedMember.add(formulaMember);
		}
		else if (formulaItem.getOlapComponentType() === oFF.OlapComponentType.FORMULA_FUNCTION)
		{
			var formulaFunction = formulaItem;
			var formulaIterator = formulaFunction.getIterator();
			while (formulaIterator.hasNext())
			{
				oFF.FormulaItemUtils._addUsedMember(formulaIterator.next(), usedMember);
			}
		}
	},
	convertFormulaMembersToSignedData:function(formulaItem, signFlipSignedData, measureMemberName)
	{
			if (formulaItem.getOlapComponentType() === oFF.OlapComponentType.FORMULA_ITEM_MEMBER)
		{
			var context = formulaItem.getContext();
			var newFormulaMember = oFF.QFactory.createFormulaMember(context);
			if (oFF.XStringUtils.isNotNullAndNotEmpty(measureMemberName))
			{
				newFormulaMember.setMemberName(measureMemberName);
			}
			else
			{
				newFormulaMember.setMemberName("SignedData");
			}
			if (signFlipSignedData)
			{
				var op = oFF.QFactory.createFormulaOperation(context);
				op.setOperator(oFF.MathOperator.MULT);
				op.setLeftSide(oFF.QFactory.createFormulaConstantWithIntValue(context, -1));
				op.setRightSide(newFormulaMember);
				return op;
			}
			return newFormulaMember;
		}
		else if (formulaItem.getOlapComponentType() === oFF.OlapComponentType.FORMULA_FUNCTION)
		{
			var formulaFunction = formulaItem;
			var copyFormulaFunction = oFF.QFactory.createFormulaFunction(formulaItem.getContext());
			copyFormulaFunction.setFunctionName(formulaFunction.getFunctionName());
			var formulaIterator = formulaFunction.getIterator();
			while (formulaIterator.hasNext())
			{
				copyFormulaFunction.add(oFF.FormulaItemUtils.convertFormulaMembersToSignedData(formulaIterator.next(), signFlipSignedData, measureMemberName));
			}
			return copyFormulaFunction;
		}
		return formulaItem;
	}
};

oFF.QDocFusionFactory = function() {};
oFF.QDocFusionFactory.prototype = new oFF.XObject();
oFF.QDocFusionFactory.prototype._ff_c = "QDocFusionFactory";

oFF.QDocFusionFactory.s_factory = null;
oFF.QDocFusionFactory.create = function(application)
{
	if (oFF.notNull(oFF.QDocFusionFactory.s_factory))
	{
		return oFF.QDocFusionFactory.s_factory.newDocFusion(application);
	}
	return null;
};
oFF.QDocFusionFactory.registerFactory = function(driverFactory)
{
	oFF.QDocFusionFactory.s_factory = driverFactory;
};

oFF.HierarchyPathUtil = {

	PATH_ELEMENT_NAME:"Name",
	PATH_ELEMENT_DESCRIPTION:"Description",
	PATH_ELEMENT_UNIQUE_NAME:"UniqueName",
	getPathField:function(queryModel, dimensionName)
	{
			if (oFF.isNull(queryModel))
		{
			return null;
		}
		if (!queryModel.getModelCapabilities().supportsUniqueHierarchyPath())
		{
			return null;
		}
		var dimension = queryModel.getDimensionByName(dimensionName);
		if (oFF.isNull(dimension))
		{
			return null;
		}
		var pathFieldName = oFF.XStringUtils.concatenate3("[", dimension.getName(), "].path");
		return dimension.getFieldByName(pathFieldName);
	},
	addPathFieldToResultSet:function(queryModel, dimensionName, asHiddenField)
	{
			var field = oFF.HierarchyPathUtil.getPathField(queryModel, dimensionName);
		if (oFF.isNull(field))
		{
			return null;
		}
		var convenienceCommands = queryModel.getConvenienceCommands();
		if (asHiddenField)
		{
			var hiddenField = convenienceCommands.clearFieldFromResultSet(dimensionName, field.getName());
			if (oFF.notNull(hiddenField))
			{
				hiddenField.setAlwaysRequested(true);
			}
		}
		else
		{
			convenienceCommands.addFieldToResultSet(dimensionName, field.getName());
		}
		return field;
	},
	addPathFieldToSelector:function(queryModel, dimensionName)
	{
			var field = oFF.HierarchyPathUtil.getPathField(queryModel, dimensionName);
		if (oFF.notNull(field))
		{
			queryModel.getConvenienceCommands().addFieldToSelector(dimensionName, field.getName());
		}
		return field;
	},
	getPathStructureFromDimensionMember:function(dimensionMember)
	{
			var dimension = dimensionMember.getDimension();
		var pathField = oFF.HierarchyPathUtil.getPathField(dimension.getQueryModel(), dimension.getName());
		if (oFF.isNull(pathField))
		{
			return null;
		}
		var fieldValue = dimensionMember.getFieldValue(pathField);
		if (oFF.isNull(fieldValue))
		{
			return null;
		}
		if (fieldValue.getValueType() !== oFF.XValueType.STRING)
		{
			throw oFF.XException.createIllegalStateException("illegal value type");
		}
		var pathValues = fieldValue.getString();
		return oFF.HierarchyPathUtil.parsePathValues(pathValues);
	},
	parsePathValues:function(pathValues)
	{
			if (oFF.XStringUtils.isNullOrEmpty(pathValues))
		{
			return null;
		}
		var stringToParse;
		if (oFF.XString.endsWith(pathValues, "\"}"))
		{
			var sb = oFF.XStringBuffer.create();
			sb.append(oFF.XStringUtils.stripRight(pathValues, 2));
			sb.append("}");
			stringToParse = sb.toString();
		}
		else
		{
			stringToParse = pathValues;
		}
		var jsonParser = oFF.JsonParserFactory.newInstance();
		var jsonElement = jsonParser.parse(stringToParse);
		oFF.MessageUtil.checkNoError(jsonParser);
		oFF.XObjectExt.release(jsonParser);
		if (oFF.isNull(jsonElement))
		{
			return null;
		}
		oFF.XBooleanUtils.checkTrue(jsonElement.getType() === oFF.PrElementType.STRUCTURE, "JSON string is not a structure");
		return jsonElement;
	}
};

oFF.QHierarchyProperties = {

	QY_HIERARCHY_ACTIVE:"HierarchyActive",
	QY_NODE_CONDENSATION:"NodeCondensation",
	QY_IS_MODELED:"IsModeled",
	QY_DUE_DATE:"~DueDate",
	QY_LOWER_LEVEL_NODE_ALIGNMENT:"~LowerLevelNodeAlignment",
	QY_DRILL_LEVEL:"~DrillLevel",
	QY_MAX_DRILL_LEVEL:"~MaxDrillLevel",
	QY_MAX_RUNTIME_LEVEL:"~MaxRuntimeLevel",
	QY_MEMBER_OF_POSTED_NODE_VISIBILITY:"~MemberOfPostedNodeVisibility"
};

oFF.HierarchyCatalogUtil = {

	supportsHierarchyCatalog2:function(application, systemDescription)
	{
			if (oFF.isNull(systemDescription))
		{
			return false;
		}
		if (oFF.isNull(application))
		{
			return false;
		}
		var olapEnvironment = application.getOlapEnvironment();
		var systemContainer = olapEnvironment.getSystemContainer(systemDescription.getSystemName());
		var serviceCapabilities = systemContainer.getServiceCapabilities(oFF.ServerService.ANALYTIC);
		return serviceCapabilities.supportsHierarchyCatalog();
	},
	getHierarchyItems:function(catalogResult)
	{
			if (oFF.notNull(catalogResult))
		{
			return oFF.XCollectionUtils.createListOfClones(catalogResult.getObjects());
		}
		return oFF.XList.create();
	},
	getHierarchyNames:function(catalogResult)
	{
			var result = oFF.XListOfString.create();
		if (oFF.notNull(catalogResult))
		{
			var iterator = catalogResult.getObjectsIterator();
			while (iterator.hasNext())
			{
				var key = iterator.next().getHierarchyName();
				if (!result.contains(key))
				{
					result.add(key);
				}
			}
			oFF.XObjectExt.release(iterator);
		}
		return result;
	},
	getVersionNames:function(catalogResult)
	{
			var result = oFF.XListOfString.create();
		if (oFF.notNull(catalogResult))
		{
			var iterator = catalogResult.getObjectsIterator();
			while (iterator.hasNext())
			{
				var key = iterator.next().getVersionName();
				if (!result.contains(key))
				{
					result.add(key);
				}
			}
			oFF.XObjectExt.release(iterator);
		}
		return result;
	},
	getHierarchyLevelCount:function(catalogResult, hierarchyName)
	{
			var hierarchies = catalogResult.getObjects();
		if (oFF.notNull(hierarchies))
		{
			for (var i = 0; i < hierarchies.size(); i++)
			{
				var hierarchy = hierarchies.get(i);
				if (hierarchy.supportsHierarchyLevels() && oFF.XString.isEqual(hierarchy.getHierarchyName(), hierarchyName) && hierarchy.getHierarchyLevels() !== null)
				{
					return hierarchy.getHierarchyLevels().size();
				}
			}
		}
		return -1;
	}
};

oFF.PlanningConstants = {

	DATA_AREA:"DATA_AREA",
	ENVIRONMENT:"ENVIRONMENT",
	MODEL:"MODEL",
	CELL_LOCKING:"CELL_LOCKING",
	PLANNING_SCHEMA:"PLANNING_SCHEMA",
	PLANNING_MODEL:"PLANNING_MODEL",
	PLANNING_MODEL_BEHAVIOUR:"PLANNING_MODEL_BEHAVIOUR",
	WITH_SHARED_VERSIONS:"WITH_SHARED_VERSIONS",
	WITH_BACKUP_TIMESTAMP:"WITH_BACKUP_TIMESTAMP",
	WITH_FAST_ACTION_PARAMETERS:"WITH_FAST_ACTION_PARAMETERS",
	WITH_UNDO_REDO_STACK:"WITH_UNDO_REDO_STACK",
	WITH_ACTION_STATE:"WITH_ACTION_STATE",
	WITH_STRICT_ERROR_HANDLING:"WITH_STRICT_ERROR_HANDLING",
	PERSISTENCE_TYPE:"PERSISTENCE_TYPE",
	BACKEND_USER_NAME:"BACKEND_USER_NAME",
	DATA_AREA_DEFAULT:"DEFAULT"
};

oFF.DataAreaUtil = {

	getPlanningService:function(application, systemName, dataArea)
	{
			var planningServices = oFF.DataAreaUtil.getPlanningServices(application, systemName, dataArea);
		if (planningServices.size() !== 1)
		{
			return null;
		}
		return planningServices.get(0);
	},
	isServiceQueryRelated:function(queryManager, systemName, dataAreaName)
	{
			var systemType = queryManager.getSystemType();
		if (!systemType.isTypeOf(oFF.SystemType.BW))
		{
			return false;
		}
		if (!oFF.XString.isEqual(systemName, queryManager.getSystemName()))
		{
			return false;
		}
		var datasource = queryManager.getDataSource();
		if (oFF.isNull(datasource) || datasource.getType() === null)
		{
			return false;
		}
		var queryDataArea = datasource.getDataArea();
		if (oFF.XStringUtils.isNullOrEmpty(queryDataArea))
		{
			queryDataArea = oFF.PlanningConstants.DATA_AREA_DEFAULT;
		}
		return oFF.XString.isEqual(dataAreaName, queryDataArea);
	},
	isServicePlanningRelated:function(service, systemName, dataAreaName)
	{
			var serviceConfig = service.getPlanningServiceConfig();
		if (oFF.isNull(serviceConfig))
		{
			return false;
		}
		if (!oFF.XString.isEqual(systemName, serviceConfig.getSystemName()))
		{
			return false;
		}
		if (!serviceConfig.getSystemType().isTypeOf(oFF.SystemType.BW))
		{
			return false;
		}
		var properties = serviceConfig.getProperties();
		var serviceDataArea = properties.getStringByKeyExt(oFF.PlanningConstants.DATA_AREA, oFF.PlanningConstants.DATA_AREA_DEFAULT);
		return oFF.XString.isEqual(dataAreaName, serviceDataArea);
	},
	getPlanningServices:function(application, systemName, dataArea)
	{
			var result = oFF.XList.create();
		if (oFF.isNull(application))
		{
			return result;
		}
		if (oFF.isNull(systemName))
		{
			return result;
		}
		var dataAreaName = dataArea;
		if (oFF.isNull(dataAreaName))
		{
			dataAreaName = oFF.PlanningConstants.DATA_AREA_DEFAULT;
		}
		var services = application.getServices(oFF.OlapApiModule.SERVICE_TYPE_PLANNING);
		if (oFF.isNull(services))
		{
			return result;
		}
		for (var i = 0; i < services.size(); i++)
		{
			var service = services.get(i);
			if (!oFF.DataAreaUtil.isServicePlanningRelated(service, systemName, dataAreaName))
			{
				continue;
			}
			result.add(service);
		}
		return result;
	},
	getQueryConsumerServices:function(dataArea)
	{
			if (oFF.isNull(dataArea))
		{
			return null;
		}
		var planningService = dataArea.getPlanningService();
		if (oFF.isNull(planningService))
		{
			return null;
		}
		var application = planningService.getApplication();
		if (oFF.isNull(application))
		{
			return null;
		}
		var dataAreaName = dataArea.getDataArea();
		if (oFF.isNull(dataAreaName))
		{
			dataAreaName = oFF.PlanningConstants.DATA_AREA_DEFAULT;
		}
		var systemName = dataArea.getPlanningService().getPlanningServiceConfig().getSystemName();
		return oFF.DataAreaUtil.getQueryConsumerServicesByName(application, systemName, dataAreaName);
	},
	getQueryConsumerServicesByName:function(application, systemName, dataArea)
	{
			var services = application.getServices(oFF.OlapApiModule.SERVICE_TYPE_QUERY_CONSUMER);
		if (oFF.isNull(services))
		{
			return null;
		}
		var dataAreaName = dataArea;
		if (oFF.isNull(dataAreaName))
		{
			dataAreaName = oFF.PlanningConstants.DATA_AREA_DEFAULT;
		}
		var result = null;
		for (var i = 0; i < services.size(); i++)
		{
			var queryManager = services.get(i);
			if (!oFF.DataAreaUtil.isServiceQueryRelated(queryManager, systemName, dataAreaName))
			{
				continue;
			}
			if (oFF.isNull(result))
			{
				result = oFF.XList.create();
			}
			result.add(queryManager);
		}
		return result;
	}
};

oFF.PlanningModelUtil = {

	closeActiveVersions:function(versions, doDropVersions)
	{
			for (var i = 0; i < versions.size(); i++)
		{
			var version = versions.get(i);
			if (!version.isSharedVersion())
			{
				if (version.isActive())
				{
					oFF.PlanningModelUtil.assertCommandOk(version.createRequestCloseVersion().setCloseMode(oFF.CloseModeType.KILL_ACTION_SEQUENCE).processCommand(oFF.SyncType.BLOCKING, null, null));
				}
				if (doDropVersions)
				{
					oFF.PlanningModelUtil.assertCommandOk(version.createRequestDropVersion().processCommand(oFF.SyncType.BLOCKING, null, null));
				}
			}
		}
	},
	initEnforceNoVersion:function(planningModel)
	{
			if (oFF.isNull(planningModel))
		{
			return;
		}
		oFF.PlanningModelUtil.closeActiveVersions(planningModel.getVersions(), true);
		oFF.XBooleanUtils.checkTrue(planningModel.getVersions().size() === 0, "Illegal versions");
	},
	initCreateDefaultVersion:function(planningModel)
	{
			if (oFF.isNull(planningModel))
		{
			return;
		}
		var version;
		var versions = planningModel.getVersions();
		if (versions.isEmpty())
		{
			var versionIdentifier = planningModel.getVersionIdentifier(oFF.PlanningModelUtil.getNewPlanningVersionId(versions), false, null);
			version = planningModel.getVersionById(versionIdentifier, "Planning Version");
		}
		else
		{
			oFF.PlanningModelUtil.closeActiveVersions(versions, false);
			version = versions.get(0);
		}
		var restoreBackupType = oFF.RestoreBackupType.NONE;
		if (version.getVersionState() === oFF.PlanningVersionState.DIRTY)
		{
			restoreBackupType = oFF.RestoreBackupType.RESTORE_FALSE;
		}
		var planningInitVersion = version.createRequestVersion(oFF.PlanningModelRequestType.INIT_VERSION);
		planningInitVersion.setRestoreBackupType(restoreBackupType);
		oFF.PlanningModelUtil.assertCommandOk(planningInitVersion.processCommand(oFF.SyncType.BLOCKING, null, null));
	},
	initEnforceSingleVersion:function(planningModel)
	{
			if (oFF.isNull(planningModel))
		{
			return;
		}
		var versions = planningModel.getVersions();
		oFF.PlanningModelUtil.closeActiveVersions(versions, true);
		var versionIdentifier = planningModel.getVersionIdentifier(oFF.PlanningModelUtil.getNewPlanningVersionId(versions), false, null);
		var version = planningModel.getVersionById(versionIdentifier, "Planning Version");
		oFF.XBooleanUtils.checkTrue(version.getVersionId() === 1, "Illegal versions");
		var planningInitVersion = version.createRequestVersion(oFF.PlanningModelRequestType.INIT_VERSION);
		planningInitVersion.setRestoreBackupType(oFF.RestoreBackupType.NONE);
		oFF.PlanningModelUtil.assertCommandOk(planningInitVersion.processCommand(oFF.SyncType.BLOCKING, null, null));
		versions = planningModel.getVersions();
		oFF.XBooleanUtils.checkTrue(versions.size() === 1, "Illegal versions");
		oFF.XBooleanUtils.checkTrue(versions.get(0) === version, "Illegal versions");
	},
	dropAllVersions:function(planningModel)
	{
			if (oFF.isNull(planningModel))
		{
			return;
		}
		var versions = planningModel.getVersions();
		oFF.PlanningModelUtil.closeActiveVersions(versions, true);
		oFF.XBooleanUtils.checkTrue(planningModel.getVersions().size() === 0, "Illegal versions");
	},
	assertCommandOk:function(commandResult)
	{
			oFF.XObjectExt.assertNotNullExt(commandResult, "Command result null");
		oFF.MessageUtil.checkNoError(commandResult);
	},
	getNewPlanningVersionId:function(planningVersions)
	{
			var newVersionId = 1;
		while (oFF.PlanningModelUtil.containsPlanningVersionId(planningVersions, newVersionId))
		{
			newVersionId++;
		}
		return newVersionId;
	},
	containsPlanningVersionId:function(planningVersions, versionId)
	{
			for (var i = 0; i < planningVersions.size(); i++)
		{
			var planningVersion = planningVersions.get(i);
			if (planningVersion.isSharedVersion())
			{
				continue;
			}
			if (planningVersion.getVersionId() === versionId)
			{
				return true;
			}
		}
		return false;
	},
	getPlanningService:function(application, systemName, planningSchema, planningModel)
	{
			var planningServices = oFF.PlanningModelUtil.getPlanningServices(application, systemName, planningSchema, planningModel);
		if (planningServices.size() === 1)
		{
			return planningServices.get(0);
		}
		return null;
	},
	skipServiceConfig:function(serviceConfig, systemName)
	{
			if (oFF.isNull(serviceConfig))
		{
			return true;
		}
		if (!oFF.XString.isEqual(systemName, serviceConfig.getSystemName()))
		{
			return true;
		}
		var systemType = serviceConfig.getSystemType();
		if (oFF.isNull(systemType))
		{
			return true;
		}
		if (!systemType.isTypeOf(oFF.SystemType.HANA))
		{
			return true;
		}
		return false;
	},
	getPlanningServices:function(application, systemName, planningSchema, planningModel)
	{
			var result = oFF.XList.create();
		if (oFF.isNull(application))
		{
			return result;
		}
		var services = application.getServices(oFF.OlapApiModule.SERVICE_TYPE_PLANNING);
		if (oFF.isNull(services))
		{
			return result;
		}
		for (var i = 0; i < services.size(); i++)
		{
			var service = services.get(i);
			var serviceConfig = service.getPlanningServiceConfig();
			if (oFF.PlanningModelUtil.skipServiceConfig(serviceConfig, systemName))
			{
				continue;
			}
			var properties = serviceConfig.getProperties();
			if (!oFF.XString.isEqual(planningSchema, properties.getStringByKeyExt(oFF.PlanningConstants.PLANNING_SCHEMA, null)))
			{
				continue;
			}
			if (!oFF.XString.isEqual(planningModel, properties.getStringByKeyExt(oFF.PlanningConstants.PLANNING_MODEL, null)))
			{
				continue;
			}
			result.add(service);
		}
		return result;
	},
	getPlanningServiceFromQueryDataSource:function(application, systemName, dataSource)
	{
			var planningServices = oFF.PlanningModelUtil.getPlanningServicesFromQueryDataSource(application, systemName, dataSource);
		if (planningServices.size() === 1)
		{
			return planningServices.get(0);
		}
		return null;
	},
	getPlanningServicesFromQueryDataSource:function(application, systemName, dataSource)
	{
			var result = oFF.XList.create();
		if (oFF.isNull(application) || oFF.isNull(systemName) || oFF.isNull(dataSource))
		{
			return result;
		}
		var services = application.getServices(oFF.OlapApiModule.SERVICE_TYPE_PLANNING);
		if (oFF.isNull(services))
		{
			return result;
		}
		var fullQualifiedName = dataSource.getFullQualifiedName();
		for (var i = 0; i < services.size(); i++)
		{
			var service = services.get(i);
			var serviceConfig = service.getPlanningServiceConfig();
			if (oFF.PlanningModelUtil.skipServiceConfig(serviceConfig, systemName))
			{
				continue;
			}
			var planningContext = service.getPlanningContext();
			if (oFF.isNull(planningContext))
			{
				continue;
			}
			if (planningContext.getPlanningContextType() !== oFF.PlanningContextType.PLANNING_MODEL)
			{
				continue;
			}
			var planningModel = planningContext;
			var dataSources = planningModel.getQueryDataSources();
			if (oFF.isNull(dataSources))
			{
				continue;
			}
			for (var j = 0; j < dataSources.size(); j++)
			{
				var queryDataSource = dataSources.get(j);
				if (oFF.XString.isEqual(queryDataSource.getDataSource().getFullQualifiedName(), fullQualifiedName) && queryDataSource.isPrimary())
				{
					result.add(service);
					break;
				}
			}
		}
		return result;
	},
	getQueryConsumerServices:function(planningModel)
	{
			var result = oFF.XList.create();
		if (oFF.isNull(planningModel))
		{
			return result;
		}
		var application = planningModel.getPlanningService().getApplication();
		var services = application.getServices(oFF.OlapApiModule.SERVICE_TYPE_QUERY_CONSUMER);
		if (oFF.isNull(services))
		{
			return result;
		}
		var dataSources = planningModel.getQueryDataSources();
		if (oFF.isNull(dataSources))
		{
			return result;
		}
		var dataSourcesMap = oFF.XHashMapByString.create();
		for (var i = 0; i < dataSources.size(); i++)
		{
			var dataSource = dataSources.get(i);
			var dataSourceName = dataSource.getDataSource().getFullQualifiedName();
			dataSourcesMap.put(dataSourceName, dataSource);
		}
		if (dataSourcesMap.isEmpty())
		{
			return result;
		}
		var systemName = planningModel.getPlanningService().getPlanningServiceConfig().getSystemName();
		for (var j = 0; j < services.size(); j++)
		{
			var queryManager = services.get(j);
			var systemType = queryManager.getSystemType();
			if (!systemType.isTypeOf(oFF.SystemType.HANA))
			{
				continue;
			}
			if (!oFF.XString.isEqual(systemName, queryManager.getSystemName()))
			{
				continue;
			}
			var datasource = queryManager.getDataSource();
			if (oFF.isNull(datasource))
			{
				continue;
			}
			if (!dataSourcesMap.containsKey(datasource.getFullQualifiedName()))
			{
				continue;
			}
			if (!result.contains(queryManager))
			{
				result.add(queryManager);
			}
		}
		return result;
	}
};

oFF.KeyRefConstants = {

	MAIN_STORAGE:"main",
	MODELLER_MEMBER:"ModellerMember",
	MODELLER_MEMBER_GROUP:"ModellerMemberGroup",
	MODEL_FORMULA_EXCEPTIONS:"ModelFormulaExceptions"
};

oFF.QFactory = {

	s_factory:null,
	_getInstance:function()
	{
			return oFF.QFactory.s_factory;
	},
	setInstance:function(factory)
	{
			oFF.QFactory.s_factory = factory;
	},
	createRuntimeQuery:function(batch, queryManager)
	{
			return oFF.QFactory.s_factory.newRuntimeQuery(batch, queryManager);
	},
	createQueryServiceConfig:function(application)
	{
			return oFF.QFactory.s_factory.newQueryServiceConfig(application);
	},
	newDimensionLinkKey:function(systemName, cubeName, dimensionName, fieldName)
	{
			return oFF.QFactory.s_factory.newDimensionLinkKey(systemName, cubeName, dimensionName, fieldName);
	},
	newDimensionLinkKey2:function(context, systemName, cubeName, dimensionName, fieldName)
	{
			return oFF.QFactory.s_factory.newDimensionLinkKey2(context, systemName, cubeName, dimensionName, fieldName);
	},
	newDimensionLinkPart:function(context, fieldKey, hierarchyName, queryManagerKey)
	{
			return oFF.QFactory.s_factory.newDimensionLinkPart(context, fieldKey, hierarchyName, queryManagerKey);
	},
	createDimensionLinkPart:function(context, fieldKey, hierarchyName, queryManagerKey)
	{
			return oFF.QFactory.s_factory.newDimensionLinkPart(context, fieldKey, hierarchyName, queryManagerKey);
	},
	newBlendingDefinition:function()
	{
			return oFF.QFactory.s_factory.newBlendingDefinition();
	},
	createBlendingDefinition:function()
	{
			return oFF.QFactory.s_factory.newBlendingDefinition();
	},
	newMeasureBasedFilter:function(context, name)
	{
			return oFF.QFactory.s_factory.newFilterMeasureBased(context, name);
	},
	newFilterMeasureBased:function(context, name)
	{
			return oFF.QFactory.createFilterMeasureBased(context, name);
	},
	createFilterMeasureBased:function(context, name)
	{
			oFF.XBooleanUtils.checkTrue(oFF.notNull(context) && context.getModelCapabilities().supportsFilterMeasureBased(), "Filter Measure Based is not supported!");
		return oFF.QFactory.s_factory.newFilterMeasureBased(context, name);
	},
	newClusteringGrid:function(spatialClusterContext)
	{
			return oFF.QFactory.s_factory.newClustering(oFF.ClusterAlgorithm.GRID, spatialClusterContext);
	},
	createClusteringGrid:function(spatialClusterContext)
	{
			return oFF.QFactory.s_factory.newClustering(oFF.ClusterAlgorithm.GRID, spatialClusterContext);
	},
	newClusteringDbScan:function(spatialClusterContext)
	{
			return oFF.QFactory.s_factory.newClustering(oFF.ClusterAlgorithm.DB_SCAN, spatialClusterContext);
	},
	createClusteringDbScan:function(spatialClusterContext)
	{
			return oFF.QFactory.s_factory.newClustering(oFF.ClusterAlgorithm.DB_SCAN, spatialClusterContext);
	},
	newClusteringKmeans:function(spatialClusterContext)
	{
			return oFF.QFactory.s_factory.newClustering(oFF.ClusterAlgorithm.K_MEANS, spatialClusterContext);
	},
	createClusteringKmeans:function(spatialClusterContext)
	{
			return oFF.QFactory.s_factory.newClustering(oFF.ClusterAlgorithm.K_MEANS, spatialClusterContext);
	},
	createMemberNavigation:function(memberFunction)
	{
			return oFF.QFactory.s_factory.newMemberNavigation(memberFunction);
	},
	createCustomHierarchyDefinition:function(dimension, description)
	{
			return oFF.QFactory.s_factory.newCustomHierarchyDefinition(dimension, description);
	},
	createNavigationParameterWithStringConstant:function(constantValue)
	{
			return oFF.QFactory.s_factory.newNavigationParameterWithStringConstant(constantValue);
	},
	createNavigationParameterWithIntegerConstant:function(constantValue)
	{
			return oFF.QFactory.s_factory.newNavigationParameterWithIntegerConstant(constantValue);
	},
	createNavigationParameterWithLevelLiteral:function(levelValue)
	{
			return oFF.QFactory.s_factory.newNavigationParameterWithLevelLiteral(levelValue);
	},
	createNavigationParameterWithLevelNumber:function(levelValue)
	{
			return oFF.QFactory.s_factory.newNavigationParameterWithLevelNumber(levelValue);
	},
	createNavigationParameterWithMemberName:function(fqnName)
	{
			return oFF.QFactory.s_factory.newNavigationParameterWithMemberName(fqnName);
	},
	createNavigationParameterWithShift:function(levelValue, constantValue)
	{
			return oFF.QFactory.s_factory.newNavigationParameterWithShift(levelValue, constantValue);
	},
	createNavigationParameterWithRange:function(levelValue, offsetLow, offsetHigh)
	{
			return oFF.QFactory.s_factory.newNavigationParameterWithRange(levelValue, offsetLow, offsetHigh);
	},
	createNavigationParameterWithNoValuesAboveLevel:function(maxLevelValue)
	{
			return oFF.QFactory.s_factory.newNavigationParameterWithNoValuesAboveLevel(maxLevelValue);
	},
	createNavigationParameterWithErrorAboveLevel:function(maxLevelValue)
	{
			return oFF.QFactory.s_factory.newNavigationParameterWithErrorAboveLevel(maxLevelValue);
	},
	newFormulaConstant:function(context)
	{
			return oFF.QFactory.s_factory.newFormulaConstant(context);
	},
	createFormulaConstant:function(context)
	{
			return oFF.QFactory.s_factory.newFormulaConstant(context);
	},
	newFormulaConstantWithStringValue:function(context, stringValue)
	{
			return oFF.QFactory.createFormulaConstantWithStringValue(context, stringValue);
	},
	createFormulaConstantWithStringValue:function(context, stringValue)
	{
			var newStringConstant = oFF.QFactory.createFormulaConstant(context);
		newStringConstant.setString(stringValue);
		return newStringConstant;
	},
	newFormulaConstantWithIntValue:function(context, intValue)
	{
			return oFF.QFactory.createFormulaConstantWithIntValue(context, intValue);
	},
	createFormulaConstantWithIntValue:function(context, intValue)
	{
			var newIntConstant = oFF.QFactory.createFormulaConstant(context);
		newIntConstant.setInteger(intValue);
		return newIntConstant;
	},
	newFormulaConstantWithDoubleValue:function(context, doubleValue)
	{
			return oFF.QFactory.createFormulaConstantWithDoubleValue(context, doubleValue);
	},
	createFormulaConstantWithDoubleValue:function(context, doubleValue)
	{
			var newDobuleConstant = oFF.QFactory.createFormulaConstant(context);
		newDobuleConstant.setDouble(doubleValue);
		return newDobuleConstant;
	},
	newFormulaOperation:function(context)
	{
			return oFF.QFactory.s_factory.newFormulaOperationExt(context);
	},
	createFormulaOperation:function(context)
	{
			return oFF.QFactory.s_factory.newFormulaOperationExt(context);
	},
	newFormulaAttributeWithName:function(context, fieldName)
	{
			return oFF.QFactory.createFormulaAttributeWithName(context, fieldName);
	},
	createFormulaAttributeWithName:function(context, fieldName)
	{
			var newFormulaAttribute = oFF.QFactory.s_factory.newFormulaAttributeExt(context);
		newFormulaAttribute.setFieldByName(fieldName);
		return newFormulaAttribute;
	},
	newFormulaFunction:function(context)
	{
			return oFF.QFactory.s_factory.newFormulaFunction(context);
	},
	createFormulaInverseFormula:function(context)
	{
			return oFF.QFactory.s_factory.newFormulaInverseFormula(context);
	},
	createFormulaFunction:function(context)
	{
			return oFF.QFactory.s_factory.newFormulaFunction(context);
	},
	newFieldValue:function(field, valueException, value, formattedValue)
	{
			return oFF.QFactory.s_factory.newFieldValue(field, valueException, value, formattedValue);
	},
	createFieldValue:function(field, valueException, value, formattedValue)
	{
			return oFF.QFactory.s_factory.newFieldValue(field, valueException, value, formattedValue);
	},
	newFieldValueEmpty:function(field, valueException, formattedValue)
	{
			return oFF.QFactory.s_factory.newFieldValueEmpty(field, valueException, formattedValue);
	},
	createFieldValueEmpty:function(field, valueException, formattedValue)
	{
			return oFF.QFactory.s_factory.newFieldValueEmpty(field, valueException, formattedValue);
	},
	newField:function(context, fieldName)
	{
			return oFF.QFactory.s_factory.newField(context, fieldName);
	},
	createField:function(context, fieldName)
	{
			return oFF.QFactory.s_factory.newField(context, fieldName);
	},
	newFormulaFunctionWithName:function(context, functionName)
	{
			return oFF.QFactory.createFormulaFunctionWithName(context, functionName);
	},
	createFormulaFunctionWithName:function(context, functionName)
	{
			var newFormulaFunction = oFF.QFactory.createFormulaFunction(context);
		newFormulaFunction.setFunctionName(functionName);
		return newFormulaFunction;
	},
	newFormulaMember:function(context)
	{
			return oFF.QFactory.s_factory.newFormulaMember(context);
	},
	createFormulaMember:function(context)
	{
			return oFF.QFactory.s_factory.newFormulaMember(context);
	},
	newFormulaMemberWithName:function(context, memberName)
	{
			return oFF.QFactory.createFormulaMemberWithName(context, memberName);
	},
	createFormulaMemberWithName:function(context, memberName)
	{
			var newFormulaMember = oFF.QFactory.createFormulaMember(context);
		newFormulaMember.setMemberName(memberName);
		return newFormulaMember;
	},
	newFilterAnd:function(context)
	{
			return oFF.QFactory.s_factory.newFilterAnd(context, null);
	},
	createFilterAnd:function(context)
	{
			return oFF.QFactory.s_factory.newFilterAnd(context, null);
	},
	createFilterAndWithParent:function(context, filterExpression)
	{
			return oFF.QFactory.s_factory.newFilterAnd(context, filterExpression);
	},
	createFilterAndWithoutContext:function(fieldName, values, hierarchyName, convertToFlatSelection)
	{
			return oFF.QFactory.s_factory.newFilterAndWithoutContext(fieldName, values, hierarchyName, convertToFlatSelection);
	},
	createFilterCartesianListWithoutContext:function(fieldName, values, hierarchyName, convertToFlatSelection, isExcluding)
	{
			return oFF.QFactory.s_factory.newFilterCartesianListWithoutContext(fieldName, values, hierarchyName, convertToFlatSelection, isExcluding);
	},
	newFilterTuple:function(context)
	{
			return oFF.QFactory.createFilterTuple(context);
	},
	createFilterTuple:function(context)
	{
			oFF.XBooleanUtils.checkTrue(context.getModelCapabilities().supportsTuplesOperand(), "TupleOperand is not supported!");
		return oFF.QFactory.s_factory.newFilterTupleExt(context);
	},
	newFilterOr:function(context)
	{
			return oFF.QFactory.s_factory.newFilterOr(context, null);
	},
	createFilterOr:function(context)
	{
			return oFF.QFactory.s_factory.newFilterOr(context, null);
	},
	createFilterOrWithParent:function(context, filterExpression)
	{
			return oFF.QFactory.s_factory.newFilterOr(context, filterExpression);
	},
	newFilterNot:function(context)
	{
			return oFF.QFactory.s_factory.newFilterNot(context, null);
	},
	createFilterNot:function(context)
	{
			return oFF.QFactory.s_factory.newFilterNot(context, null);
	},
	createFilterNotWithParent:function(context, filterExpression)
	{
			return oFF.QFactory.s_factory.newFilterNot(context, filterExpression);
	},
	createFilterExpressionByContext:function(context)
	{
			var retValue = null;
		if (oFF.notNull(context))
		{
			var componentType = context.getComponentType();
			if (componentType === oFF.OlapComponentType.FILTER_EXPRESSION)
			{
				retValue = context;
			}
		}
		return retValue;
	},
	newFilterOperation:function(context, field)
	{
			return oFF.QFactory.createFilterOperationWithOperator(context, field, oFF.ComparisonOperator.EQUAL);
	},
	createFilterOperation:function(context, field)
	{
			return oFF.QFactory.createFilterOperationWithOperator(context, field, oFF.ComparisonOperator.EQUAL);
	},
	newFilterOperationWithOperator:function(context, field, operator)
	{
			return oFF.QFactory.createFilterOperationWithOperator(context, field, operator);
	},
	createFilterOperationWithOperator:function(context, field, operator)
	{
			var filterExpression = oFF.QFactory.createFilterExpressionByContext(context);
		var filterOperation = oFF.QFactory.s_factory.newFilterOperation(context, filterExpression);
		filterOperation.setField(field);
		filterOperation.setComparisonOperator(operator);
		return filterOperation;
	},
	createFilterOperationDateRange:function(context, field)
	{
			var filterExpression = oFF.QFactory.createFilterExpressionByContext(context);
		var filterOperation = oFF.QFactory.s_factory.newFilterOperationDateRange(context, filterExpression);
		filterOperation.setField(field);
		return filterOperation;
	},
	newCellValueOperand:function(context)
	{
			return oFF.QFactory.createCellValueOperand(context);
	},
	createCellValueOperand:function(context)
	{
			var filterExpression = oFF.QFactory.createFilterExpressionByContext(context);
		var cellValueOperand = oFF.QFactory.s_factory.newCellValueOperand(context, filterExpression);
		return cellValueOperand;
	},
	newFilterCartesianElement:function(context)
	{
			return oFF.QFactory.s_factory.newFilterCartesianElement(context);
	},
	createFilterCartesianElement:function(context)
	{
			return oFF.QFactory.s_factory.newFilterCartesianElement(context);
	},
	newFilterCartesianProduct:function(context)
	{
			return oFF.QFactory.createFilterCartesianProduct(context);
	},
	createFilterCartesianProduct:function(context)
	{
			var filterExpression = oFF.QFactory.createFilterExpressionByContext(context);
		return oFF.QFactory.s_factory.newFilterCartesianProduct(context, filterExpression);
	},
	newFilterCartesianList:function(context)
	{
			return oFF.QFactory.createFilterCartesianList(context);
	},
	createFilterCartesianList:function(context)
	{
			var filterExpression = oFF.QFactory.createFilterExpressionByContext(context);
		return oFF.QFactory.s_factory.newFilterCartesianList(context, filterExpression);
	},
	newFilterCartesianListForDimensionMemberVariable:function(context, dimensionMemberVariable, fieldMd, hierarchyName)
	{
			return oFF.QFactory.s_factory.newFilterCartesianListForDimensionMemberVariable(context, dimensionMemberVariable, fieldMd, hierarchyName);
	},
	createFilterCartesianListForDimensionMemberVariable:function(context, dimensionMemberVariable, fieldMd, hierarchyName)
	{
			return oFF.QFactory.s_factory.newFilterCartesianListForDimensionMemberVariable(context, dimensionMemberVariable, fieldMd, hierarchyName);
	},
	newFilterCartesianListWithField:function(context, field)
	{
			return oFF.QFactory.createFilterCartesianListWithField(context, field);
	},
	createFilterCartesianListWithField:function(context, field)
	{
			var filterCartesianList = oFF.QFactory.createFilterCartesianList(context);
		filterCartesianList.setField(field);
		return filterCartesianList;
	},
	newFilterConvertedTimeCartesianList:function(context)
	{
			return oFF.QFactory.createFilterConvertedTimeCartesianList(context);
	},
	createFilterConvertedTimeCartesianList:function(context)
	{
			var filterExpression = oFF.QFactory.createFilterExpressionByContext(context);
		return oFF.QFactory.s_factory.newFilterConvertedTimeCartesianList(context, filterExpression);
	},
	newFilterConvertedTimeCartesianListWithField:function(context, field)
	{
			return oFF.QFactory.createFilterConvertedTimeCartesianListWithField(context, field);
	},
	createFilterConvertedTimeCartesianListWithField:function(context, field)
	{
			var cartesianList = oFF.QFactory.createFilterConvertedTimeCartesianList(context);
		cartesianList.setField(field);
		return cartesianList;
	},
	newDimensionElement:function(selectField, hierarchyName, value)
	{
			return oFF.QFactory.s_factory.newDimensionElement(selectField, hierarchyName, value);
	},
	createDimensionElement:function(selectField, hierarchyName, value)
	{
			return oFF.QFactory.s_factory.newDimensionElement(selectField, hierarchyName, value);
	},
	newDimensionElementWithContext:function(context, selectField, hierarchyName, value)
	{
			return oFF.QFactory.s_factory.newDimensionElementWithContext(context, selectField, hierarchyName, value);
	},
	createDimensionElementWithContext:function(context, selectField, hierarchyName, value)
	{
			return oFF.QFactory.s_factory.newDimensionElementWithContext(context, selectField, hierarchyName, value);
	},
	newDimensionMemberFromTupleElement:function(tupleElement)
	{
			return oFF.QFactory.s_factory.newDimensionMemberFromTupleElement(tupleElement);
	},
	createDimensionMemberFromTupleElement:function(tupleElement)
	{
			return oFF.QFactory.s_factory.newDimensionMemberFromTupleElement(tupleElement);
	},
	newDrillPathElement:function(context, name, dimension)
	{
			return oFF.QFactory.createDrillPathElement(context, name, dimension);
	},
	createDrillPathElement:function(context, name, dimension)
	{
			var drillPathElement = oFF.QFactory.s_factory.newDrillPathElementExt(context);
		drillPathElement.setDimension(dimension);
		drillPathElement.setName(name);
		return drillPathElement;
	},
	newFilterDynamicVariables:function(context, dataSource)
	{
			return oFF.QFactory.createFilterDynamicVariables(context, dataSource);
	},
	createFilterDynamicVariables:function(context, dataSource)
	{
			oFF.XBooleanUtils.checkTrue(context.getModelCapabilities().supportsDynamicVariableRefresh(), "Refresh of dynamic variables is not supported.");
		var virtualDataSource = oFF.QFactory.s_factory.newFilterVirtualDatasource(context);
		if (oFF.notNull(dataSource))
		{
			virtualDataSource.setDetails(dataSource.getSchemaName(), dataSource.getPackageName(), dataSource.getObjectName());
		}
		return virtualDataSource;
	},
	newAggregationLevel:function(context, name)
	{
			return oFF.QFactory.s_factory.newAggregationLevelExt(context, name);
	},
	createAggregationLevel:function(context, name)
	{
			return oFF.QFactory.s_factory.newAggregationLevelExt(context, name);
	},
	newDataSourceExt:function(context)
	{
			return oFF.QFactory.s_factory.newDataSource(context);
	},
	createDataSourceExt:function(context)
	{
			return oFF.QFactory.s_factory.newDataSource(context);
	},
	newDataSource:function()
	{
			return oFF.QFactory.s_factory.newDataSource(null);
	},
	createDataSource:function()
	{
			return oFF.QFactory.s_factory.newDataSource(null);
	},
	newDataSourceWithType:function(type, name)
	{
			var dataSource = oFF.QFactory.s_factory.newDataSource(null);
		dataSource.setObjectName(name);
		dataSource.setType(type);
		return dataSource;
	},
	createDataSourceWithType:function(type, name)
	{
			var dataSource = oFF.QFactory.s_factory.newDataSource(null);
		dataSource.setObjectName(name);
		dataSource.setType(type);
		return dataSource;
	},
	newDataSourceWithFqn:function(fqn)
	{
			return oFF.QFactory.createDataSourceWithFqn(fqn);
	},
	createDataSourceWithFqn:function(fqn)
	{
			var dataSource = oFF.QFactory.s_factory.newDataSource(null);
		dataSource.setFullQualifiedName(fqn);
		return dataSource;
	},
	newDrillManager:function(context)
	{
			return oFF.QFactory.s_factory.newDrillManager(context);
	},
	createDrillManager:function(context)
	{
			return oFF.QFactory.s_factory.newDrillManager(context);
	},
	newUniversalDisplayHierarchies:function(context)
	{
			return oFF.QFactory.s_factory.newUniversalDisplayHierarchies(context);
	},
	createUniversalDisplayHierarchies:function(context)
	{
			return oFF.QFactory.s_factory.newUniversalDisplayHierarchies(context);
	},
	newVizDef:function(context)
	{
			return oFF.QFactory.s_factory.newVizDef(context);
	},
	createVizDef:function(context)
	{
			return oFF.QFactory.s_factory.newVizDef(context);
	},
	newFormulaCalculatedDimension:function(context, name)
	{
			return oFF.QFactory.s_factory.newFormulaCalculatedDimension(context, name);
	},
	createFormulaCalculatedDimension:function(context, name)
	{
			return oFF.QFactory.s_factory.newFormulaCalculatedDimension(context, name);
	},
	newFilterAcrossModelsCalculatedDimension:function(context, name)
	{
			return oFF.QFactory.s_factory.newFilterAcrossModelsCalculatedDimension(context, name);
	},
	createFilterAcrossModelsCalculatedDimension:function(context, name)
	{
			return oFF.QFactory.s_factory.newFilterAcrossModelsCalculatedDimension(context, name);
	},
	newFilterMeasureBasedCalculatedDimension:function(context, name)
	{
			return oFF.QFactory.s_factory.newMeasureBasedFilterCalculatedDimension(context, name);
	},
	createFilterMeasureBasedCalculatedDimension:function(context, name)
	{
			return oFF.QFactory.s_factory.newMeasureBasedFilterCalculatedDimension(context, name);
	},
	createDimensionFromType:function(context, originDimension, dimensionManager)
	{
			return oFF.QFactory.s_factory.newDimensionFromType(context, originDimension, dimensionManager);
	},
	createFieldFromType:function(context, dimension, presentationType, name)
	{
			return oFF.QFactory.s_factory.newFieldFromType(context, dimension, presentationType, name);
	},
	newFilterAcrossModels:function(context, name)
	{
			return oFF.QFactory.s_factory.newFilterAcrossModels(context, name);
	},
	createFilterAcrossModels:function(context, name)
	{
			return oFF.QFactory.s_factory.newFilterAcrossModels(context, name);
	},
	createFilterDynamicTimeRegularRange:function(context, name)
	{
			return oFF.QFactory.s_factory.newFilterDynamicTimeRegularRange(context, name);
	},
	createFilterFixedTimeRange:function(context, name)
	{
			return oFF.QFactory.s_factory.newFilterFixedTimeRange(context, name);
	},
	createFilterDynamicTimeToDateRange:function(context, name)
	{
			return oFF.QFactory.s_factory.newFilterDynamicTimeToDateRange(context, name);
	},
	newReadModeManager:function(dimension)
	{
			return oFF.QFactory.s_factory.newReadModeManager(dimension);
	},
	createReadModeManager:function(dimension)
	{
			return oFF.QFactory.s_factory.newReadModeManager(dimension);
	},
	newAttributeContainer:function(context, dimension)
	{
			return oFF.QFactory.s_factory.newAttributeContainer(context, dimension);
	},
	createAttributeContainer:function(context, dimension)
	{
			return oFF.QFactory.s_factory.newAttributeContainer(context, dimension);
	},
	newFieldContainer:function(context, dimension)
	{
			return oFF.QFactory.s_factory.newFieldContainer(context, dimension);
	},
	createFieldContainer:function(context, dimension)
	{
			return oFF.QFactory.s_factory.newFieldContainer(context, dimension);
	},
	newHierarchyManager:function(context, parent)
	{
			return oFF.QFactory.s_factory.newHierarchyManager(context, parent);
	},
	createHierarchyManager:function(context, parent)
	{
			return oFF.QFactory.s_factory.newHierarchyManager(context, parent);
	},
	newKeyRefStorage:function(context, name)
	{
			return oFF.QFactory.s_factory.newKeyRefStorage(context, name);
	},
	createKeyRefStorage:function(context, name)
	{
			return oFF.QFactory.s_factory.newKeyRefStorage(context, name);
	},
	newKeyRefStoreContext:function(context, storageName)
	{
			return oFF.QFactory.s_factory.newKeyRefStoreContext(context, storageName);
	},
	createKeyRefStoreContext:function(context, storageName)
	{
			return oFF.QFactory.s_factory.newKeyRefStoreContext(context, storageName);
	},
	newKeyRefStoreContextWithCapabilities:function(context, storageName, capabilities)
	{
			return oFF.QFactory.s_factory.newKeyRefStoreContextWithCapabilities(context, storageName, capabilities);
	},
	createKeyRefStoreContextWithCapabilities:function(context, storageName, capabilities)
	{
			return oFF.QFactory.s_factory.newKeyRefStoreContextWithCapabilities(context, storageName, capabilities);
	},
	newKeyRef:function(storageName, groupName, objectName)
	{
			return oFF.QFactory.s_factory.newKeyRef(storageName, groupName, objectName);
	},
	createKeyRef:function(storageName, groupName, objectName)
	{
			return oFF.QFactory.s_factory.newKeyRef(storageName, groupName, objectName);
	},
	createFormulaMeasure:function(context, dimension, name, text, alias)
	{
			return oFF.QFactory.s_factory.newFormulaMeasure(context, dimension, name, text, alias);
	},
	createRestrictedMeasure:function(context, dimension, name, text, alias)
	{
			return oFF.QFactory.s_factory.newRestrictedMeasure(context, dimension, name, text, alias);
	},
	createVarianceMeasure:function(context, dimension, name, text, alias)
	{
			return oFF.QFactory.s_factory.newVarianceMeasure(context, dimension, name, text, alias);
	},
	createExceptionAggregationMeasure:function(context, dimension, name, text, alias)
	{
			return oFF.QFactory.s_factory.newExceptionAggregationMeasure(context, dimension, name, text, alias);
	},
	newResultStructureController:function(context, parentNode, location)
	{
			return oFF.QFactory.s_factory.newResultStructureController(context, parentNode, location);
	},
	createResultStructureController:function(context, parentNode, location)
	{
			return oFF.QFactory.s_factory.newResultStructureController(context, parentNode, location);
	},
	newFilterExpression:function(context, parentNode)
	{
			return oFF.QFactory.s_factory.newFilterExpression(context, parentNode);
	},
	createFilterExpression:function(context, parentNode)
	{
			return oFF.QFactory.s_factory.newFilterExpression(context, parentNode);
	},
	newVariableValue:function(variable)
	{
			return oFF.QFactory.s_factory.newVariableValue(variable);
	},
	createVariableValue:function(variable)
	{
			return oFF.QFactory.s_factory.newVariableValue(variable);
	},
	newVariable:function(context, parent, originVariable)
	{
			return oFF.QFactory.s_factory.newVariable(context, parent, originVariable);
	},
	createVariable:function(context, parent, originVariable)
	{
			return oFF.QFactory.s_factory.newVariable(context, parent, originVariable);
	},
	createXVariable:function(variableType, fieldName, variableName, values)
	{
			return oFF.QFactory.s_factory.newXVariable(variableType, fieldName, variableName, values);
	},
	newCanonicalDate:function(year, member, granularity)
	{
			return oFF.QFactory.s_factory.newCanonicalDate(year, member, granularity);
	},
	createCanonicalDate:function(year, member, granularity)
	{
			return oFF.QFactory.s_factory.newCanonicalDate(year, member, granularity);
	},
	newCanonicalDateWithTimestamp:function(year, timestamp, granularity)
	{
			return oFF.QFactory.s_factory.newCanonicalDateWithTimestamp(year, timestamp, granularity);
	},
	createCanonicalDateWithTimestamp:function(year, timestamp, granularity)
	{
			return oFF.QFactory.s_factory.newCanonicalDateWithTimestamp(year, timestamp, granularity);
	},
	newCanonicalDateContext:function(queryModel, timeDimension, hierarchyName)
	{
			return oFF.QFactory.s_factory.newCanonicalDateContext(queryModel, timeDimension, hierarchyName);
	},
	createCanonicalDateContext:function(queryModel, timeDimension, hierarchyName)
	{
			return oFF.QFactory.s_factory.newCanonicalDateContext(queryModel, timeDimension, hierarchyName);
	},
	newTimeOperation:function(context, parent, timeDimensionName, timeOperationFunction, timeOperationGranularity, period)
	{
			return oFF.QFactory.s_factory.newTimeOperation(context, parent, timeDimensionName, timeOperationFunction, timeOperationGranularity, period);
	},
	createTimeOperation:function(context, parent, timeDimensionName, timeOperationFunction, timeOperationGranularity, period)
	{
			return oFF.QFactory.s_factory.newTimeOperation(context, parent, timeDimensionName, timeOperationFunction, timeOperationGranularity, period);
	},
	newPersistedPlaceholderTagFilter:function(name, filterId, qmFilterModel, canonicalDateContext)
	{
			return oFF.QFactory.s_factory.newPersistedPlaceholderTagFilter(name, filterId, qmFilterModel, canonicalDateContext);
	},
	createPersistedPlaceholderTagFilter:function(name, filterId, qmFilterModel, canonicalDateContext)
	{
			return oFF.QFactory.s_factory.newPersistedPlaceholderTagFilter(name, filterId, qmFilterModel, canonicalDateContext);
	},
	newPersistedPlaceholderTagFilterFromPlaceholderString:function(persistedPlaceholderFilterStringTag)
	{
			return oFF.QFactory.s_factory.newPersistedPlaceholderTagFilterFromPlaceholderString(persistedPlaceholderFilterStringTag);
	},
	createPersistedPlaceholderTagFilterFromPlaceholderString:function(persistedPlaceholderFilterStringTag)
	{
			return oFF.QFactory.s_factory.newPersistedPlaceholderTagFilterFromPlaceholderString(persistedPlaceholderFilterStringTag);
	},
	newPersistedPlaceholderTagCalculation:function(name, selectionPlaceholder, canonicalDateContext)
	{
			return oFF.QFactory.s_factory.newPersistedPlaceholderTagCalculation(name, selectionPlaceholder, canonicalDateContext);
	},
	createPersistedPlaceholderTagCalculation:function(name, selectionPlaceholder, canonicalDateContext)
	{
			return oFF.QFactory.s_factory.newPersistedPlaceholderTagCalculation(name, selectionPlaceholder, canonicalDateContext);
	},
	newPersistedPlaceholderTagCalculationFromPlaceholderString:function(persistedPlaceholderStringTag)
	{
			return oFF.QFactory.s_factory.newPersistedPlaceholderTagCalculationFromPlaceholderString(persistedPlaceholderStringTag);
	},
	createPersistedPlaceholderTagCalculationFromPlaceholderString:function(persistedPlaceholderStringTag)
	{
			return oFF.QFactory.s_factory.newPersistedPlaceholderTagCalculationFromPlaceholderString(persistedPlaceholderStringTag);
	},
	newTimeSelectionPlaceholderFromPlaceholderString:function(selectionPlaceholderString)
	{
			return oFF.QFactory.s_factory.newTimeSelectionPlaceholderFromPlaceholderString(selectionPlaceholderString);
	},
	createTimeSelectionPlaceholderFromPlaceholderString:function(selectionPlaceholderString)
	{
			return oFF.QFactory.s_factory.newTimeSelectionPlaceholderFromPlaceholderString(selectionPlaceholderString);
	},
	newTimeSelectionPlaceholderToDateFromPlaceholderString:function(selectionPlaceholderString)
	{
			return oFF.QFactory.s_factory.newTimeSelectionPlaceholderToDateFromPlaceholderString(selectionPlaceholderString);
	},
	createTimeSelectionPlaceholderToDateFromPlaceholderString:function(selectionPlaceholderString)
	{
			return oFF.QFactory.s_factory.newTimeSelectionPlaceholderToDateFromPlaceholderString(selectionPlaceholderString);
	},
	newTimeConvertedFAMSelectionPlaceholderFromPlaceholderString:function(selectionPlaceholderString)
	{
			return oFF.QFactory.s_factory.newTimeConvertedFAMSelectionPlaceholderFromPlaceholderString(selectionPlaceholderString);
	},
	createTimeConvertedFAMSelectionPlaceholderFromPlaceholderString:function(selectionPlaceholderString)
	{
			return oFF.QFactory.s_factory.newTimeConvertedFAMSelectionPlaceholderFromPlaceholderString(selectionPlaceholderString);
	},
	newTimeConvertedFAMSelectionPlaceholder:function(queryModel, timeDimension, filterOp, qmFilterModel, sourceDatasetId, sourceTimeDimensionName, sourceHierarchyName)
	{
			return oFF.QFactory.s_factory.newTimeConvertedFAMSelectionPlaceholder(queryModel, timeDimension, filterOp, qmFilterModel, sourceDatasetId, sourceTimeDimensionName, sourceHierarchyName);
	},
	createTimeConvertedFAMSelectionPlaceholder:function(queryModel, timeDimension, filterOp, qmFilterModel, sourceDatasetId, sourceTimeDimensionName, sourceHierarchyName)
	{
			return oFF.QFactory.s_factory.newTimeConvertedFAMSelectionPlaceholder(queryModel, timeDimension, filterOp, qmFilterModel, sourceDatasetId, sourceTimeDimensionName, sourceHierarchyName);
	},
	newPersistedPlaceholderTagSelection:function(name, selectionPlaceholder, canonicalDateContext)
	{
			return oFF.QFactory.s_factory.newPersistedPlaceholderTagSelection(name, selectionPlaceholder, canonicalDateContext);
	},
	createPersistedPlaceholderTagSelection:function(name, selectionPlaceholder, canonicalDateContext)
	{
			return oFF.QFactory.s_factory.newPersistedPlaceholderTagSelection(name, selectionPlaceholder, canonicalDateContext);
	},
	newPersistedPlaceholderTagSelectionFromPlaceholderString:function(persistedPlaceholderStringTag)
	{
			return oFF.QFactory.s_factory.newPersistedPlaceholderTagSelectionFromPlaceholderString(persistedPlaceholderStringTag);
	},
	createPersistedPlaceholderTagSelectionFromPlaceholderString:function(persistedPlaceholderStringTag)
	{
			return oFF.QFactory.s_factory.newPersistedPlaceholderTagSelectionFromPlaceholderString(persistedPlaceholderStringTag);
	},
	newReflectionCommand:function(methodName, primitiveReturnType, signature, signatureList)
	{
			return oFF.QFactory.s_factory.newReflectionCommand(methodName, primitiveReturnType, signature, signatureList);
	},
	createReflectionCommand:function(methodName, primitiveReturnType, signature, signatureList)
	{
			return oFF.QFactory.s_factory.newReflectionCommand(methodName, primitiveReturnType, signature, signatureList);
	},
	createFilterValueBag:function(context, filterExpression, parentNode)
	{
			return oFF.QFactory.s_factory.newFilterValueBag(context, filterExpression, parentNode);
	},
	newFormulaException:function(context, name, text)
	{
			return oFF.QFactory.s_factory.newFormulaException(context, name, text);
	},
	createFormulaException:function(context, name, text)
	{
			return oFF.QFactory.s_factory.newFormulaException(context, name, text);
	},
	createRankInfo:function(maxRows, complexSortForRank, conditionForRank)
	{
			return oFF.QFactory.s_factory.newRankInfo(maxRows, complexSortForRank, conditionForRank);
	},
	createRankSettings:function()
	{
			return oFF.QFactory.s_factory.newRankSettings();
	},
	createBlendableMeasureSort:function(context)
	{
			return oFF.QFactory.s_factory.newBlendableMeasureSort(context);
	},
	createBlendableDimensionSort:function(fieldName, datasetId, sortDirection, preserveGrouping, language)
	{
			return oFF.QFactory.s_factory.newBlendableDimensionSort(fieldName, datasetId, sortDirection, preserveGrouping, language);
	},
	createBlendableCustomSort:function(name, datasetId, dimensionId, hierarchyId, id, sortFromStart, sortFromEnd, movedNodes)
	{
			return oFF.QFactory.s_factory.newBlendableCustomSort(name, datasetId, dimensionId, hierarchyId, id, sortFromStart, sortFromEnd, movedNodes);
	},
	newFilterCartesianProductWithContextAndParent:function(context, filterExpression)
	{
			return oFF.QFactory.s_factory.newFilterCartesianProduct(context, filterExpression);
	},
	createFilterCartesianProductWithContextAndParent:function(context, filterExpression)
	{
			return oFF.QFactory.s_factory.newFilterCartesianProduct(context, filterExpression);
	},
	createCapabilitiesDecorator:function(parent)
	{
			return oFF.QFactory.s_factory.newCapabilitiesDecorator(parent);
	},
	createValueHelpVarDimMember:function(context, dimensionMemberVariable)
	{
			return oFF.QFactory.s_factory.newValueHelpVarDimMember(context, dimensionMemberVariable);
	},
	createFilterCapability:function(context, parent, field, olapComponentType)
	{
			return oFF.QFactory.s_factory.newFilterCapability(context, parent, field, olapComponentType);
	},
	createFilterCapabilitiesForVariable:function(context, variable)
	{
			return oFF.QFactory.s_factory.newFilterCapabilitiesForVariable(context, variable);
	},
	createFilterForQueryModel:function(queryModel)
	{
			return oFF.QFactory.s_factory.newFilterForQueryModel(queryModel);
	},
	createWindowFunction:function(type)
	{
			return oFF.QFactory.s_factory.newWindowFunction(type);
	},
	createValueHelpListenerDecorator:function(originalListener)
	{
			return oFF.QFactory.s_factory.newValueHelpListenerDecorator(originalListener);
	},
	createModellingCurrencyTranslationManager:function(cttdFieldName, rateTypeFieldName, rateVersionFieldName, categoryFieldName)
	{
			return oFF.QFactory.s_factory.newModellingCurrencyTranslationManager(cttdFieldName, rateTypeFieldName, rateVersionFieldName, categoryFieldName);
	},
	createDimensionSelector:function(dimension)
	{
			return oFF.QFactory.s_factory.newDimensionSelector(dimension);
	},
	createMeasureHelpMetadataSelector:function()
	{
			return oFF.QFactory.s_factory.newMeasureHelpMetadataSelector();
	},
	createIteration:function(context)
	{
			return oFF.QFactory.s_factory.newFormulaIteration(context);
	},
	createIterationDimension:function(context)
	{
			return oFF.QFactory.s_factory.newFormulaIterationDimension(context);
	},
	newMeasureHelpNode:function(name, measure)
	{
			return oFF.QFactory.s_factory.newMeasureHelpNode(name, measure);
	},
	createMeasureHelpNode:function(name, measure)
	{
			return oFF.QFactory.s_factory.newMeasureHelpNode(name, measure);
	},
	newLovProcess:function(queryManager, lovProcessConfig)
	{
			return oFF.QFactory.s_factory.newLovProcess(queryManager, lovProcessConfig);
	},
	createLovProcess:function(queryManager, lovProcessConfig)
	{
			return oFF.QFactory.s_factory.newLovProcess(queryManager, lovProcessConfig);
	},
	newRequestSettings:function(offset, windowSize, isHierarchyShot)
	{
			return oFF.QFactory.s_factory.newRequestSettings(offset, windowSize, isHierarchyShot);
	},
	createRequestSettings:function(offset, windowSize, isHierarchyShot)
	{
			return oFF.QFactory.s_factory.newRequestSettings(offset, windowSize, isHierarchyShot);
	},
	newValueHelpNode:function(valueHelp, parentNode, member, displayLevel, absoluteLevel)
	{
			return oFF.QFactory.s_factory.newValueHelpNode(valueHelp, parentNode, member, displayLevel, absoluteLevel);
	},
	createValueHelpNode:function(valueHelp, parentNode, member, displayLevel, absoluteLevel)
	{
			return oFF.QFactory.s_factory.newValueHelpNode(valueHelp, parentNode, member, displayLevel, absoluteLevel);
	},
	newHierarchyCatalogResult:function()
	{
			return oFF.QFactory.s_factory.newHierarchyCatalogResult();
	},
	createHierarchyCatalogResult:function()
	{
			return oFF.QFactory.s_factory.newHierarchyCatalogResult();
	},
	createHierarchyCatalogManager:function(queryManager, dataSource, dimensionName, dimensionQueryModel)
	{
			return oFF.QFactory.s_factory.newHierarchyCatalogManager(queryManager, dataSource, dimensionName, dimensionQueryModel);
	},
	createCacheKeyWithDataSource:function(context, systemName, dataSource, providerType, key1, key2, validationHash, dimensionGroupNames)
	{
			return oFF.QFactory.s_factory.newCacheKeyWithDataSource(context, systemName, dataSource, providerType, key1, key2, validationHash, dimensionGroupNames);
	},
	createCacheKey:function(context, systemName, dataSourceHashKey, providerType, key1, key2, validationHash, dimensionGroupNames)
	{
			return oFF.QFactory.s_factory.newCacheKey(context, systemName, dataSourceHashKey, providerType, key1, key2, validationHash, dimensionGroupNames);
	},
	createCacheKeyForField:function(context, fieldName, dimensionName)
	{
			return oFF.QFactory.s_factory.newCacheKeyForField(context, fieldName, dimensionName);
	},
	createCacheKeyByContext:function(context)
	{
			return oFF.QFactory.s_factory.newCacheKeyByContext(context);
	},
	createVariableVariant:function(dataSource, name, text, scope)
	{
			return oFF.QFactory.s_factory.newVariableVariant(dataSource, name, text, scope);
	},
	createCustomVariableConfig:function(queryManager)
	{
			return oFF.QFactory.s_factory.newCustomVariableConfig(queryManager);
	},
	createRsDefStructureMemberProperties:function(placeholderAliasMappings, minimumDrillStateMap, unsatisfiedRequiredDimensionNames, availableFormulaExceptionIds, outOfContextMembers)
	{
			return oFF.QFactory.s_factory.newRsDefStructureMemberProperties(placeholderAliasMappings, minimumDrillStateMap, unsatisfiedRequiredDimensionNames, availableFormulaExceptionIds, outOfContextMembers);
	},
	createCellContext:function(context, name)
	{
			return oFF.QFactory.s_factory.newCellContext(context, name);
	},
	createDocumentIdManager:function(queryManager)
	{
			return oFF.QFactory.s_factory.newDocumentIdManager(queryManager);
	},
	createCellIndexInfo:function()
	{
			return oFF.QFactory.s_factory.newCellIndexInfo();
	}
};

oFF.QModelConstants = {

	UPDATE_DYN_VAR_VIRTUAL_DATASOURCE:"view:[_SYS_BIC][][$$VariableValues$$]",
	MEASURE_SIGNED_DATA:"SignedData",
	CALCULATION_PLACEHOLDER_ID_PREFIX:"C4A#CALC",
	FILTER_CATEGORY_INPUT_SCHEDULE:"Input schedule"
};

oFF.ChartRendererFactory = {

	s_factory:null,
	setInstance:function(factory)
	{
			oFF.ChartRendererFactory.s_factory = factory;
	},
	createRenderer:function(protocolType)
	{
			return oFF.ChartRendererFactory.s_factory.newRenderer(protocolType);
	}
};

oFF.ChartRendererFactoryDummyImpl = function() {};
oFF.ChartRendererFactoryDummyImpl.prototype = new oFF.XObject();
oFF.ChartRendererFactoryDummyImpl.prototype._ff_c = "ChartRendererFactoryDummyImpl";

oFF.ChartRendererFactoryDummyImpl.create = function()
{
	return new oFF.ChartRendererFactoryDummyImpl();
};
oFF.ChartRendererFactoryDummyImpl.prototype.newRenderer = function(protocolType)
{
	return null;
};

oFF.CustomRendererRegistry = {

	s_defaultRenderer:null,
	s_rendererMap:null,
	staticSetup:function()
	{
			oFF.CustomRendererRegistry.s_rendererMap = oFF.XSimpleMap.create();
	},
	registerDefaultRenderer:function(defaultRenderer)
	{
			oFF.CustomRendererRegistry.s_defaultRenderer = defaultRenderer;
	},
	registerRenderer:function(protocolBindingType, renderer)
	{
			oFF.CustomRendererRegistry.s_rendererMap.put(protocolBindingType, renderer);
	},
	render:function(protocolBindingType, resultSetContainer, customVisualizationContainer)
	{
			var result = null;
		var renderer = oFF.CustomRendererRegistry.s_rendererMap.getByKey(protocolBindingType);
		if (oFF.isNull(renderer))
		{
			renderer = oFF.CustomRendererRegistry.s_defaultRenderer;
		}
		if (oFF.notNull(renderer))
		{
			result = renderer.render(resultSetContainer, customVisualizationContainer);
		}
		else
		{
			oFF.XLogger.println("No custom renderer registered neither for the specific protocol binding type nor as fallback.");
		}
		return result;
	}
};

oFF.AnalyticTableExportHelperFactory = {

	s_factory:null,
	setInstance:function(factory)
	{
			oFF.AnalyticTableExportHelperFactory.s_factory = factory;
	},
	createTableExportHelper:function(analyticsTable, niceDataSourceTitle)
	{
			return oFF.AnalyticTableExportHelperFactory.s_factory.newTableExportHelper(analyticsTable, niceDataSourceTitle);
	}
};

oFF.GridRendererFactory = {

	s_factory:null,
	setInstance:function(factory)
	{
			oFF.GridRendererFactory.s_factory = factory;
	},
	createRenderer:function(protocolType)
	{
			return oFF.GridRendererFactory.s_factory.newRenderer(protocolType);
	}
};

oFF.GridRendererFactoryDummyImpl = function() {};
oFF.GridRendererFactoryDummyImpl.prototype = new oFF.XObject();
oFF.GridRendererFactoryDummyImpl.prototype._ff_c = "GridRendererFactoryDummyImpl";

oFF.GridRendererFactoryDummyImpl.create = function()
{
	return new oFF.GridRendererFactoryDummyImpl();
};
oFF.GridRendererFactoryDummyImpl.prototype.newRenderer = function(protocolType)
{
	return null;
};

oFF.TableClipboardHelperFactory = {

	s_factory:null,
	setInstance:function(factory)
	{
			oFF.TableClipboardHelperFactory.s_factory = factory;
	},
	createClipboardHelper:function(analyticsTable)
	{
			return oFF.TableClipboardHelperFactory.s_factory.newClipboardHelper(analyticsTable);
	}
};

oFF.FioriGridFactory = {

	s_factory:null,
	setInstance:function(factory)
	{
			oFF.FioriGridFactory.s_factory = factory;
	},
	createFioriGrid:function(resultSet)
	{
			return oFF.FioriGridFactory.s_factory.createFioriGrid(resultSet);
	}
};

oFF.FioriGridFactoryDummyImpl = function() {};
oFF.FioriGridFactoryDummyImpl.prototype = new oFF.XObject();
oFF.FioriGridFactoryDummyImpl.prototype._ff_c = "FioriGridFactoryDummyImpl";

oFF.FioriGridFactoryDummyImpl.create = function()
{
	return new oFF.FioriGridFactoryDummyImpl();
};
oFF.FioriGridFactoryDummyImpl.prototype.createFioriGrid = function(resultSet)
{
	return null;
};

oFF.ReferenceGridFactory = {

	s_factory:null,
	setInstance:function(factory)
	{
			oFF.ReferenceGridFactory.s_factory = factory;
	},
	createReferenceGridSimple:function(resultSet)
	{
			return oFF.ReferenceGridFactory.s_factory.createReferenceGridSimple(resultSet);
	},
	createReferenceGridWithDetails:function(resultSet)
	{
			return oFF.ReferenceGridFactory.s_factory.createReferenceGridWithDetails(resultSet);
	},
	createReferenceGrid:function(resultSet, withDetails)
	{
			return oFF.ReferenceGridFactory.s_factory.createReferenceGrid(resultSet, withDetails);
	},
	createReferenceGridWithName:function(name, resultSet)
	{
			return oFF.ReferenceGridFactory.s_factory.createReferenceGridWithName(name, resultSet);
	},
	createReferenceGridWithNameAndDetails:function(name, resultSet)
	{
			return oFF.ReferenceGridFactory.s_factory.createReferenceGridWithNameAndDetails(name, resultSet);
	},
	createForVizGrid:function(resultSet)
	{
			return oFF.ReferenceGridFactory.s_factory.createForVizGrid(resultSet);
	}
};

oFF.ReferenceGridFactoryDummyImpl = function() {};
oFF.ReferenceGridFactoryDummyImpl.prototype = new oFF.XObject();
oFF.ReferenceGridFactoryDummyImpl.prototype._ff_c = "ReferenceGridFactoryDummyImpl";

oFF.ReferenceGridFactoryDummyImpl.create = function()
{
	return new oFF.ReferenceGridFactoryDummyImpl();
};
oFF.ReferenceGridFactoryDummyImpl.prototype.createReferenceGridSimple = function(resultSet)
{
	return null;
};
oFF.ReferenceGridFactoryDummyImpl.prototype.createReferenceGridWithDetails = function(resultSet)
{
	return null;
};
oFF.ReferenceGridFactoryDummyImpl.prototype.createReferenceGrid = function(resultSet, withDetails)
{
	return null;
};
oFF.ReferenceGridFactoryDummyImpl.prototype.createReferenceGridWithName = function(name, resultSet)
{
	return null;
};
oFF.ReferenceGridFactoryDummyImpl.prototype.createReferenceGridWithNameAndDetails = function(name, resultSet)
{
	return null;
};
oFF.ReferenceGridFactoryDummyImpl.prototype.createForVizGrid = function(resultSet)
{
	return null;
};

oFF.KpiRendererFactory = {

	s_factory:null,
	setInstance:function(factory)
	{
			oFF.KpiRendererFactory.s_factory = factory;
	},
	createRenderer:function(protocolType)
	{
			return oFF.KpiRendererFactory.s_factory.newRenderer(protocolType);
	}
};

oFF.KpiRendererFactoryDummyImpl = function() {};
oFF.KpiRendererFactoryDummyImpl.prototype = new oFF.XObject();
oFF.KpiRendererFactoryDummyImpl.prototype._ff_c = "KpiRendererFactoryDummyImpl";

oFF.KpiRendererFactoryDummyImpl.create = function()
{
	return new oFF.KpiRendererFactoryDummyImpl();
};
oFF.KpiRendererFactoryDummyImpl.prototype.newRenderer = function(protocolType)
{
	return null;
};

oFF.DocConverterFactory = function() {};
oFF.DocConverterFactory.prototype = new oFF.XObject();
oFF.DocConverterFactory.prototype._ff_c = "DocConverterFactory";

oFF.DocConverterFactory.s_factories = null;
oFF.DocConverterFactory.staticSetup = function()
{
	oFF.DocConverterFactory.s_factories = oFF.XHashMapByString.create();
};
oFF.DocConverterFactory.registerFactory = function(sourceType, targetType, factory)
{
	var key = oFF.XStringUtils.concatenate3(sourceType.getName(), "==>", targetType.getName());
	oFF.DocConverterFactory.s_factories.put(key, factory);
};
oFF.DocConverterFactory.createDocConverter = function(sourceType, targetType)
{
	var key = oFF.XStringUtils.concatenate3(sourceType.getName(), "==>", targetType.getName());
	var factory = oFF.DocConverterFactory.s_factories.getByKey(key);
	var newDocConverter = null;
	if (oFF.notNull(factory))
	{
		newDocConverter = factory.newDocConverter(sourceType, targetType);
	}
	return newDocConverter;
};

oFF.QueryServiceConfig = {

	create:function(application)
	{
			var queryServiceConfig = oFF.QFactory.createQueryServiceConfig(application);
		return queryServiceConfig;
	},
	createWithDataSourceName:function(application, systemName, datasource)
	{
			var queryServiceConfig = oFF.QFactory.createQueryServiceConfig(application);
		queryServiceConfig.setSystemName(systemName);
		queryServiceConfig.setDataSourceByName(datasource);
		return queryServiceConfig;
	},
	createWithDataSource:function(application, systemName, datasource)
	{
			var queryServiceConfig = oFF.QFactory.createQueryServiceConfig(application);
		queryServiceConfig.setSystemName(systemName);
		queryServiceConfig.setDataSource(datasource);
		return queryServiceConfig;
	},
	createByDefinition:function(application, systemName, definition)
	{
			var queryServiceConfig = oFF.QFactory.createQueryServiceConfig(application);
		queryServiceConfig.setSystemName(systemName);
		queryServiceConfig.setDefinitionByContent(definition);
		return queryServiceConfig;
	},
	createForRawQueryMode:function(application, systemName, definition)
	{
			var queryServiceConfig = oFF.QueryServiceConfig.createByDefinition(application, systemName, definition);
		queryServiceConfig.setMode(oFF.QueryManagerMode.RAW_QUERY);
		return queryServiceConfig;
	},
	createWithDataRequest:function(application, systemName, dataRequest)
	{
			var queryServiceConfig = oFF.QFactory.createQueryServiceConfig(application);
		queryServiceConfig.setSystemName(systemName);
		queryServiceConfig.setDataRequest(dataRequest);
		queryServiceConfig.setMode(oFF.QueryManagerMode.RAW_QUERY);
		return queryServiceConfig;
	},
	createWithDataRequestString:function(application, systemName, dataRequestString)
	{
			var queryServiceConfig = oFF.QFactory.createQueryServiceConfig(application);
		queryServiceConfig.setSystemName(systemName);
		queryServiceConfig.setDataRequestAsString(dataRequestString);
		queryServiceConfig.setMode(oFF.QueryManagerMode.RAW_QUERY);
		return queryServiceConfig;
	},
	createWithBlendingDefinition:function(application, blendingDefinition)
	{
			var blendingHost = blendingDefinition.getBlendingHost();
		oFF.XObjectExt.assertNotNullExt(blendingHost, "No suitable blending host found!");
		oFF.XBooleanUtils.checkTrue(blendingHost.supportsCubeBlending(), "The backend is not capable of blending!");
		oFF.BlendingValidation.assertBlendingDefinitionIsValid(blendingDefinition);
		var queryServiceConfig = oFF.QFactory.createQueryServiceConfig(application);
		queryServiceConfig.setSystemName(blendingHost.getSystemName());
		queryServiceConfig.setBlendingDefinition(blendingDefinition);
		return queryServiceConfig;
	},
	createWithMicroCube:function(application, systemName, microCube)
	{
			var queryServiceConfig = oFF.QFactory.createQueryServiceConfig(application);
		queryServiceConfig.setSystemName(systemName);
		queryServiceConfig.setDataSourceBasedOnMicroCube(microCube);
		return queryServiceConfig;
	},
	createLightweight:function(application, datasource, startVariables)
	{
			var queryServiceConfig = oFF.QFactory.createQueryServiceConfig(application);
		queryServiceConfig.setSystemName(datasource.getSystemName());
		queryServiceConfig.setDataSource(datasource);
		queryServiceConfig.setLightweight(true);
		queryServiceConfig.setStartVariables(startVariables);
		return queryServiceConfig;
	}
};

oFF.QSortProperties = {

	QY_PRESERVE_GROUPING:"PreserveGrouping",
	QY_CASE_SENSITIVE:"CaseSensitive"
};

oFF.QStateConstants = {

	TAG_UNDO_IGNORE:"TAG_UNDO_IGNORE",
	TAG_UNDO_INCLUDE:"TAG_UNDO_INCLUDE",
	TAG_HAS_TRANSIENT_DEPS:"hasTransientDependencies",
	MANAGER_DATASET_ID:"datasetId",
	QUERY_MODEL:"QueryModel",
	MANAGER_SYSTEM_NAME:"SystemName",
	MANAGER_TAGS:"ComponentTags",
	QUERY_MANAGER_EXTERNAL_FILTERS:"QueryManagerExtFilters"
};

oFF.QMeasureProperties = {

	QY_DISABLE_IGNORE_EXTDIM_ON_FIXEDFILTERS:"DisableIgnoreExtDimOnFixedFilters",
	QY_AUTO_SIGN_FLIP_FOR_RM_ONLY:"AutoSignFlipForRMOnly",
	QY_CALCULATE_BEFORE_AGGREGATION:"CalculateBeforeAggregation",
	QY_FLATTEN_DEPENDENT_RESTRICTED_MEASURES:"FlattenDependentRestrictedMeasures",
	QY_FLATTEN_BASE_FILTER:"FlattenBaseFilter",
	QY_FLATTEN_REFERENCE_FILTER:"FlattenReferenceFilter",
	QY_EXCEPTION_AGGREGATION_ON_SELECTION:"ExceptionAggregationOnSelection",
	QY_CONDITION_TYPE:"ConditionType"
};

oFF.QStructureMemberProperties = {

	NULL_INDICATOR_FOR_INTEGERS:-9999,
	QY_NUMERIC_PRECISION:"~NumericPrecision",
	QY_NUMERIC_SCALE:"~NumericScale",
	QY_NUMERIC_SHIFT:"~NumericShift",
	QY_SOLVE_ORDER:"~SolveOrder",
	QY_DATA_TYPE_PRECISION:"~DataTypePrecision",
	QY_DATA_TYPE_SCALE:"~DataTypeScale",
	QY_AGGERGATION_TYPE:"~AggregatioinType",
	QY_POST_AGGERGATION_TYPE:"~PostAggregatioinType",
	QY_EXCEPTION_AGGERGATION_TYPE:"~ExceptionAggregatioinType",
	QY_EXCEPTION_AGGREGATION_DIMENSIONS:"~ExceptionAggregationDimensions",
	QY_RATE_TYPE:"~RateType",
	QY_RESULT_CALCULATION:"~ResultCalculation",
	QY_SINGLE_VALUE_CALCULATION:"~SingleValueCalculation",
	QY_UNIT_TYPE:"~UnitType",
	QY_UNIT_FIXED:"~UnitFixed",
	QY_UNIT_NAME:"~UnitName",
	QY_UNIT_TEXT_NAME:"~UnitTextName",
	QY_DATA_TYPE:"~DataType",
	QY_DATA_TYPE_INTERNAL:"~DataTypeInternal",
	QY_ACCOUNT_TYPE:"~AccountType",
	QY_IS_SELECTION_CANDIDATE:"~IsSelectionCandidate",
	QY_PRESENTATION_SIGN_REVERSAL:"~PresentationSignReversal",
	QY_AUTO_SIGN_FLIP:"~AutoSignFlip",
	QY_POST_AGGREGATION_IGNORE_HIERARCHY:"~PostAggregationIgnoreHierarchy",
	QY_CURRENCY_TRANSLATION_NAME:"~CurrencyTranslationName",
	QY_AGGREGATION_DIMENSION:"~AggregationDimension",
	QY_OVERRIDE_TEXT:"~OverrideText",
	QY_POST_AGGREGATION_DIMENSIONS:"~PostAggregationDimensions",
	QY_RUNNING_TOTAL_OPERATOR:"~RunningTotalOperator",
	QY_ITERATION_DIMENSIONS:"~IterationDimensions",
	QY_CURRENCY_PRESENTATION:"~CurrencyPresentation",
	QY_SCALE_FORMAT:"~ScaleFormat",
	QY_SIGN_PRESENTATION:"~SignPresentation",
	QY_SCALE_AND_UNIT_PLACEMENT:"~ScaleAndUnitPlacement",
	QY_IGNORE_EXTERNAL_DIMENSIONS:"~IgnoreExternalDimensions"
};

oFF.QUniversalDisplayHierarchyProperties = {

	QY_ACTIVE:"Active",
	QY_CUSTOM_DIMENSIONS:"CustomDimensions",
	QY_INITIAL_DRILL_LEVEL:"InitialDrillLevel",
	QY_LOWER_LEVEL_NODE_ALIGNMENT:"~LowerLevelNodeAlignment",
	QY_DIMENSION_NAMES:"~DimensionNames"
};

oFF.QVariableUtils = function() {};
oFF.QVariableUtils.prototype = new oFF.XObject();
oFF.QVariableUtils.prototype._ff_c = "QVariableUtils";

oFF.QVariableUtils.EXTENSION_USAGE = "Usage";
oFF.QVariableUtils.EXTENSION_DIMENSION = "Dimension";
oFF.QVariableUtils.EXTENSION_HIERARCHY = "Hierarchy";
oFF.QVariableUtils.CURRENT_DATE = "Current.Date";
oFF.QVariableUtils.CURRENT_PERIOD = "CurrentPeriod";
oFF.QVariableUtils.getInputEnabledVariable = function(variables, name)
{
	var variable = variables.getByKey(name);
	if (oFF.notNull(variable) && variable.isInputEnabled())
	{
		return variable;
	}
	return null;
};
oFF.QVariableUtils.getVariablesByType = function(variables, type)
{
	var variablesByType = oFF.XListOfNameObject.create();
	var variablesSize = variables.size();
	for (var i = 0; i < variablesSize; i++)
	{
		var variable = variables.get(i);
		if (variable.getVariableType().isTypeOf(type))
		{
			variablesByType.add(variable);
		}
	}
	return variablesByType;
};
oFF.QVariableUtils.getHierarchyNameVariables = function(variables)
{
	return oFF.QVariableUtils.getVariablesByType(variables, oFF.VariableType.HIERARCHY_NAME_VARIABLE);
};
oFF.QVariableUtils.getDimensionMemberVariables = function(variables)
{
	return oFF.QVariableUtils.getVariablesByType(variables, oFF.VariableType.DIMENSION_MEMBER_VARIABLE);
};
oFF.QVariableUtils.getVariableByType = function(variables, name, type)
{
	var variable = variables.getByKey(name);
	if (oFF.notNull(variable) && variable.getVariableType() === type)
	{
		return variable;
	}
	return null;
};
oFF.QVariableUtils.getInputEnabledVariables = function(variables)
{
	var inputEnabledVariables = oFF.XListOfNameObject.create();
	var variablesSize = variables.size();
	for (var i = 0; i < variablesSize; i++)
	{
		var variable = variables.get(i);
		if (variable.isInputEnabled())
		{
			inputEnabledVariables.add(variable);
		}
	}
	return inputEnabledVariables;
};
oFF.QVariableUtils.getInputEnabledAndNonTechnicalVariables = function(variables)
{
	var result = oFF.XListOfNameObject.create();
	var variablesSize = variables.size();
	for (var i = 0; i < variablesSize; i++)
	{
		var variable = variables.get(i);
		if (variable.isInputEnabled() && !variable.isTechnicalVariable())
		{
			result.add(variable);
		}
	}
	return result;
};
oFF.QVariableUtils.hasInputEnabledVariables = function(variables)
{
	if (oFF.isNull(variables))
	{
		return false;
	}
	var variablesSize = variables.size();
	for (var i = 0; i < variablesSize; i++)
	{
		if (variables.get(i).isInputEnabled())
		{
			return true;
		}
	}
	return false;
};
oFF.QVariableUtils.hasMandatoryVariables = function(variables)
{
	if (oFF.isNull(variables))
	{
		return false;
	}
	var variablesSize = variables.size();
	for (var i = 0; i < variablesSize; i++)
	{
		if (variables.get(i).isMandatory())
		{
			return true;
		}
	}
	return false;
};
oFF.QVariableUtils.clearExternalVariablesRepresentations = function(variables)
{
	if (oFF.notNull(variables))
	{
		var variablesSize = variables.size();
		for (var i = 0; i < variablesSize; i++)
		{
			variables.get(i).setExternalRepresentation(null);
		}
	}
};
oFF.QVariableUtils.hasSingleValueFilterOnDimension = function(variables, dimensionName)
{
	if (oFF.isNull(variables))
	{
		return false;
	}
	var dimensionMemberVariables = oFF.QVariableUtils.getDimensionMemberVariables(variables);
	for (var i = 0; i < dimensionMemberVariables.size(); i++)
	{
		var variable = dimensionMemberVariables.get(i);
		if (variable.getDimension() !== null && oFF.XString.isEqual(variable.getDimension().getName(), dimensionName) && variable.hasSingleValueMemberFilter())
		{
			return true;
		}
	}
	return false;
};
oFF.QVariableUtils.getCurrentPeriodVariableByDimensionAndHierarchyName = function(queryModel, dimensionName, hierarchyName)
{
	var variable = null;
	if (queryModel.hasVariables())
	{
		variable = oFF.XCollectionUtils.findFirst(queryModel.getVariables().getValuesAsReadOnlyList(),  function(variableToFind){
			return oFF.XString.isEqual(variableToFind.getExtensionByName(oFF.QVariableUtils.EXTENSION_USAGE), oFF.QVariableUtils.CURRENT_PERIOD) && oFF.XString.isEqual(variableToFind.getExtensionByName(oFF.QVariableUtils.EXTENSION_HIERARCHY), hierarchyName) && oFF.XString.isEqual(variableToFind.getExtensionByName(oFF.QVariableUtils.EXTENSION_DIMENSION), dimensionName);
		}.bind(this));
	}
	return variable;
};
oFF.QVariableUtils.getCurrentDateVariable = function(queryModel)
{
	var variable = null;
	if (queryModel.hasVariables())
	{
		variable = oFF.XCollectionUtils.findFirst(queryModel.getVariables(),  function(variableToFind){
			return oFF.XString.isEqual(variableToFind.getExtensionByName(oFF.QVariableUtils.EXTENSION_USAGE), oFF.QVariableUtils.CURRENT_PERIOD) && oFF.XString.isEqual(variableToFind.getName(), oFF.QVariableUtils.CURRENT_DATE);
		}.bind(this));
	}
	return variable;
};

oFF.QVariableProperties = {

	VA_VARIABLE_VALUE:"~VariableValue"
};

oFF.XCommandFactory = function() {};
oFF.XCommandFactory.prototype = new oFF.XObject();
oFF.XCommandFactory.prototype._ff_c = "XCommandFactory";

oFF.XCommandFactory.create = function(application)
{
	var commandFactory = new oFF.XCommandFactory();
	commandFactory.m_xVersion = application.getXVersion();
	return commandFactory;
};
oFF.XCommandFactory.prototype.m_xVersion = 0;
oFF.XCommandFactory.prototype.createCommand = function(commandName)
{
	return this.createWithType(oFF.XCommandType.CUSTOM, commandName);
};
oFF.XCommandFactory.prototype.createCommandArray = function(commandType)
{
	if (commandType !== oFF.XCommandType.ARRAY_CONCURRENT && commandType !== oFF.XCommandType.ARRAY_BATCH)
	{
		return null;
	}
	return this.createWithType(commandType, "DEFAULT");
};
oFF.XCommandFactory.prototype.createWithType = function(commandType, commandName)
{
	var registrationService = oFF.RegistrationService.getInstance();
	var fqn = oFF.XStringUtils.concatenate5(oFF.RegistrationService.COMMAND, ".", commandType.getName(), ".", commandName);
	var references = registrationService.getReferences(fqn);
	if (oFF.isNull(references))
	{
		return null;
	}
	if (references.size() !== 1)
	{
		return null;
	}
	var commandClass = references.get(0);
	var command = commandClass.newInstance(this);
	command.setupCommand(this);
	return command;
};
oFF.XCommandFactory.prototype.getXVersion = function()
{
	return this.m_xVersion;
};

oFF.QDimensionMemberNameUtil = function() {};
oFF.QDimensionMemberNameUtil.prototype = new oFF.XObjectExt();
oFF.QDimensionMemberNameUtil.prototype._ff_c = "QDimensionMemberNameUtil";

oFF.QDimensionMemberNameUtil.isCalculationPlaceholderMemberName = function(memberName)
{
	var placeholderPattern = oFF.XStringUtils.concatenate2("].&[", oFF.QModelConstants.CALCULATION_PLACEHOLDER_ID_PREFIX);
	return oFF.XString.startsWith(memberName, "[") && oFF.XString.indexOf(memberName, placeholderPattern) !== -1;
};
oFF.QDimensionMemberNameUtil.isMDXHierarchyKey = function(memberName)
{
	return oFF.XString.startsWith(memberName, "[") && oFF.XString.containsString(memberName, "].[") && oFF.XString.containsString(memberName, "].&[");
};
oFF.QDimensionMemberNameUtil.parseHierarchyAndFlatMemberName = function(memberName)
{
	var result;
	if (oFF.QDimensionMemberNameUtil.isMDXHierarchyKey(memberName))
	{
		var indexHierarchy = oFF.XString.indexOf(memberName, "].[") + 3;
		var endHierarchy = oFF.XString.indexOfFrom(memberName, "]", indexHierarchy);
		var indexMemberName = oFF.XString.indexOfFrom(memberName, "].&[", endHierarchy) + 4;
		var endMemberName = oFF.XString.indexOfFrom(memberName, "]", indexMemberName);
		var noPrefixHierarchyName = oFF.XString.substring(memberName, indexHierarchy, endHierarchy);
		var noPrefixMemberName = oFF.XString.substring(memberName, indexMemberName, endMemberName);
		result = oFF.XPairOfString.create(noPrefixHierarchyName, noPrefixMemberName);
	}
	else
	{
		result = oFF.XPairOfString.create(null, memberName);
	}
	return result;
};
oFF.QDimensionMemberNameUtil.parseFlatMemberName = function(memberName)
{
	return oFF.QDimensionMemberNameUtil.parseHierarchyAndFlatMemberName(memberName).getSecondString();
};
oFF.QDimensionMemberNameUtil.buildMDXHierarchyKey = function(dimensionName, hierarchyName, memberName)
{
	var convertedMemberKey = oFF.XStringUtils.concatenate5("[", dimensionName, "].[", hierarchyName, "].&[");
	return oFF.XStringUtils.concatenate3(convertedMemberKey, memberName, "]");
};

oFF.RsVisualizationContainerFactory = function() {};
oFF.RsVisualizationContainerFactory.prototype = new oFF.XObjectExt();
oFF.RsVisualizationContainerFactory.prototype._ff_c = "RsVisualizationContainerFactory";

oFF.RsVisualizationContainerFactory.s_instance = null;
oFF.RsVisualizationContainerFactory.setInstance = function(instance)
{
	oFF.RsVisualizationContainerFactory.s_instance = instance;
};
oFF.RsVisualizationContainerFactory.createVisualizationContainer = function(visualizationDefinition)
{
	return oFF.RsVisualizationContainerFactory.s_instance.newVisualizationContainer(visualizationDefinition);
};

oFF.QueryPreparatorFactory = function() {};
oFF.QueryPreparatorFactory.prototype = new oFF.XObjectExt();
oFF.QueryPreparatorFactory.prototype._ff_c = "QueryPreparatorFactory";

oFF.QueryPreparatorFactory.s_factoryMap = null;
oFF.QueryPreparatorFactory.staticSetup = function()
{
	oFF.QueryPreparatorFactory.s_factoryMap = oFF.XHashMapByString.create();
};
oFF.QueryPreparatorFactory.newInstance = function(modelFormat)
{
	var factory = oFF.QueryPreparatorFactory.s_factoryMap.getByKey(modelFormat.getName());
	if (oFF.notNull(factory))
	{
		return factory.newInstanceFromFactory();
	}
	return null;
};
oFF.QueryPreparatorFactory.put = function(modelFormat, factory)
{
	oFF.QueryPreparatorFactory.s_factoryMap.put(modelFormat.getName(), factory);
};

oFF.QTimeMemberNavigationGenerator = function() {};
oFF.QTimeMemberNavigationGenerator.prototype = new oFF.XObjectExt();
oFF.QTimeMemberNavigationGenerator.prototype._ff_c = "QTimeMemberNavigationGenerator";

oFF.QTimeMemberNavigationGenerator.createParallelPeriodMemberNavigation = function(context, levelValue, constantValue, leveledHierarchy)
{
	var memberNav;
	if (context.getModelCapabilities().supportsInaCurrentMember())
	{
		if (context.getSession().hasFeature(oFF.FeatureToggleOlap.INA_SHIFT_PERIOD_FOR_TRANSIENT_TIME_OPERATIONS) && context.getModelCapabilities().supportsErrorAboveLevel())
		{
			if (oFF.XStringUtils.isNotNullAndNotEmpty(levelValue))
			{
				memberNav = oFF.QFactory.createMemberNavigation(oFF.CurrentMemberFunction.INA_PARALLEL_PERIOD);
				memberNav.addParameter(oFF.QFactory.createNavigationParameterWithShift(levelValue, constantValue * -1));
				memberNav.addParameter(oFF.QFactory.createNavigationParameterWithErrorAboveLevel(levelValue));
			}
			else
			{
				memberNav = oFF.QFactory.createMemberNavigation(oFF.CurrentMemberFunction.INA_SHIFT_PERIOD);
				memberNav.addParameter(oFF.QFactory.createNavigationParameterWithIntegerConstant(constantValue * -1));
				if (oFF.notNull(leveledHierarchy))
				{
					memberNav.addParameter(oFF.QFactory.createNavigationParameterWithErrorAboveLevel(leveledHierarchy.getMostCoarseLevel().getLevelName()));
				}
			}
		}
		else
		{
			memberNav = oFF.QFactory.createMemberNavigation(oFF.CurrentMemberFunction.INA_PARALLEL_PERIOD);
			memberNav.addParameter(oFF.QFactory.createNavigationParameterWithShift(levelValue, constantValue * -1));
		}
	}
	else
	{
		memberNav = oFF.QFactory.createMemberNavigation(oFF.CurrentMemberFunction.PARALLEL_PERIOD);
		memberNav.addParameter(oFF.QFactory.createNavigationParameterWithLevelLiteral(levelValue));
		memberNav.addParameter(oFF.QFactory.createNavigationParameterWithIntegerConstant(constantValue));
	}
	return memberNav;
};
oFF.QTimeMemberNavigationGenerator.createPeriodsToDateMemberNavigation = function(levelName)
{
	var memberNav = oFF.QFactory.createMemberNavigation(oFF.CurrentMemberFunction.PERIODS_TO_DATE);
	memberNav.addParameter(oFF.QFactory.createNavigationParameterWithLevelLiteral(levelName));
	return memberNav;
};
oFF.QTimeMemberNavigationGenerator.generateOffsetRange = function(queryModel, levelName, lookBack, lookAhead, offsetFunction, offsetLevelName, offsetAmount, leveledHierarchy, currentLevel, pivotLevelName)
{
	var memberNavigations = oFF.XList.create();
	memberNavigations.addAll(oFF.QTimeMemberNavigationGenerator.getPivotLevelShiftMemberNavigations(leveledHierarchy, currentLevel, pivotLevelName));
	var offsetMemberNav = oFF.QTimeMemberNavigationGenerator.generateOffsetMemberNav(queryModel, offsetFunction, offsetLevelName, offsetAmount, leveledHierarchy);
	if (oFF.notNull(offsetMemberNav))
	{
		memberNavigations.add(offsetMemberNav);
	}
	var ancestor = oFF.QFactory.createMemberNavigation(oFF.CurrentMemberFunction.ANCESTOR);
	ancestor.addParameter(oFF.QFactory.createNavigationParameterWithLevelLiteral(levelName));
	memberNavigations.add(ancestor);
	var lagStart = oFF.QFactory.createMemberNavigation(oFF.CurrentMemberFunction.LAG);
	memberNavigations.add(lagStart);
	lagStart.addParameter(oFF.QFactory.createNavigationParameterWithIntegerConstant(lookBack));
	var rangeNav = oFF.QFactory.createMemberNavigation(oFF.CurrentMemberFunction.RANGE);
	var pivotLevelShiftMemberNavigationsIter = oFF.QTimeMemberNavigationGenerator.getPivotLevelShiftMemberNavigations(leveledHierarchy, currentLevel, pivotLevelName).getIterator();
	while (pivotLevelShiftMemberNavigationsIter.hasNext())
	{
		rangeNav.addNavigation(pivotLevelShiftMemberNavigationsIter.next());
	}
	if (oFF.notNull(offsetMemberNav))
	{
		rangeNav.addNavigation(offsetMemberNav);
	}
	rangeNav.addNavigation(ancestor);
	if (lookAhead !== 0)
	{
		var leadEnd = oFF.QFactory.createMemberNavigation(oFF.CurrentMemberFunction.LEAD);
		rangeNav.addNavigation(leadEnd);
		leadEnd.addParameter(oFF.QFactory.createNavigationParameterWithIntegerConstant(lookAhead));
	}
	memberNavigations.add(rangeNav);
	return memberNavigations;
};
oFF.QTimeMemberNavigationGenerator.getPivotLevelShiftMemberNavigations = function(leveledHierarchy, currentLevel, pivotLevelName)
{
	var memberNavigations = oFF.XList.create();
	if (oFF.notNull(pivotLevelName))
	{
		var pivotLevel = leveledHierarchy.getLevelByName(pivotLevelName);
		if (oFF.isNull(pivotLevel))
		{
			throw oFF.XException.createRuntimeException(oFF.XStringUtils.concatenate2("pivot level not found in time dimension:", pivotLevelName));
		}
		var pivotLevelShift = currentLevel.getLevelNumber() - pivotLevel.getLevelNumber();
		if (pivotLevelShift > 0)
		{
			var ancestorStart = oFF.QFactory.createMemberNavigation(oFF.CurrentMemberFunction.ANCESTOR);
			ancestorStart.addParameter(oFF.QFactory.createNavigationParameterWithLevelLiteral(pivotLevel.getLevelName()));
			memberNavigations.add(ancestorStart);
		}
		else
		{
			var levelOffset = pivotLevel.getLevelNumber() - currentLevel.getLevelNumber();
			for (var i = 0; i < levelOffset; i++)
			{
				memberNavigations.add(oFF.QFactory.createMemberNavigation(oFF.CurrentMemberFunction.FIRST_CHILD));
			}
		}
	}
	return memberNavigations;
};
oFF.QTimeMemberNavigationGenerator.generateStartToClosingPeriodOffsetRange = function(timeDimension, hierarchyName, levelName)
{
	var leveledHierarchy = timeDimension.getLeveledHierarchy(hierarchyName);
	var topLevel = leveledHierarchy.getMostCoarseLevel();
	var level = leveledHierarchy.getLevelByName(levelName);
	var offset = level.getLevelNumber() - topLevel.getLevelNumber();
	var memberNavigations = oFF.XList.create();
	var ancestorStart = oFF.QFactory.createMemberNavigation(oFF.CurrentMemberFunction.ANCESTOR);
	ancestorStart.addParameter(oFF.QFactory.createNavigationParameterWithLevelLiteral(level.getLevelName()));
	memberNavigations.add(ancestorStart);
	var rangeNav = oFF.QFactory.createMemberNavigation(oFF.CurrentMemberFunction.RANGE);
	var ancestorTopLevel = oFF.QFactory.createMemberNavigation(oFF.CurrentMemberFunction.ANCESTOR);
	ancestorTopLevel.addParameter(oFF.QFactory.createNavigationParameterWithLevelLiteral(topLevel.getLevelName()));
	rangeNav.addNavigation(ancestorTopLevel);
	for (var j = 0; j < offset; j++)
	{
		rangeNav.addNavigation(oFF.QFactory.createMemberNavigation(oFF.CurrentMemberFunction.LAST_CHILD));
	}
	memberNavigations.add(rangeNav);
	return memberNavigations;
};
oFF.QTimeMemberNavigationGenerator.generateOpeningPeriodToEndOffsetRange = function(timeDimension, hierarchyName, levelName)
{
	var leveledHierarchy = timeDimension.getLeveledHierarchy(hierarchyName);
	var topLevel = leveledHierarchy.getMostCoarseLevel();
	var level = leveledHierarchy.getLevelByName(levelName);
	var offset = level.getLevelNumber() - topLevel.getLevelNumber();
	var memberNavigations = oFF.XList.create();
	var ancestorTopLevel = oFF.QFactory.createMemberNavigation(oFF.CurrentMemberFunction.ANCESTOR);
	ancestorTopLevel.addParameter(oFF.QFactory.createNavigationParameterWithLevelLiteral(topLevel.getLevelName()));
	memberNavigations.add(ancestorTopLevel);
	for (var i = 0; i < offset; i++)
	{
		memberNavigations.add(oFF.QFactory.createMemberNavigation(oFF.CurrentMemberFunction.FIRST_CHILD));
	}
	var rangeNav = oFF.QFactory.createMemberNavigation(oFF.CurrentMemberFunction.RANGE);
	var ancestorEnd = oFF.QFactory.createMemberNavigation(oFF.CurrentMemberFunction.ANCESTOR);
	ancestorEnd.addParameter(oFF.QFactory.createNavigationParameterWithLevelLiteral(level.getLevelName()));
	rangeNav.addNavigation(ancestorEnd);
	memberNavigations.add(rangeNav);
	return memberNavigations;
};
oFF.QTimeMemberNavigationGenerator.generateOpeningPeriodToClosingPeriodOffsetRangeFromAllNode = function(timeDimension, hierarchyName, levelName)
{
	var leveledHierarchy = timeDimension.getLeveledHierarchy(hierarchyName);
	var topLevel = leveledHierarchy.getMostCoarseLevel();
	var level = leveledHierarchy.getLevelByName(levelName);
	var offset = level.getLevelNumber() - topLevel.getLevelNumber();
	var memberNavigations = oFF.XList.create();
	var ancestorTopLevel = oFF.QFactory.createMemberNavigation(oFF.CurrentMemberFunction.ANCESTOR);
	ancestorTopLevel.addParameter(oFF.QFactory.createNavigationParameterWithLevelLiteral(topLevel.getLevelName()));
	memberNavigations.add(ancestorTopLevel);
	for (var i = 0; i < offset; i++)
	{
		memberNavigations.add(oFF.QFactory.createMemberNavigation(oFF.CurrentMemberFunction.FIRST_CHILD));
	}
	var rangeNav = oFF.QFactory.createMemberNavigation(oFF.CurrentMemberFunction.RANGE);
	rangeNav.addNavigation(ancestorTopLevel);
	for (var j = 0; j < offset; j++)
	{
		rangeNav.addNavigation(oFF.QFactory.createMemberNavigation(oFF.CurrentMemberFunction.LAST_CHILD));
	}
	memberNavigations.add(rangeNav);
	return memberNavigations;
};
oFF.QTimeMemberNavigationGenerator.generateToDateRange = function(queryModel, timeDimension, hierarchyName, initialLevelName, toDateLevelName, lookBack, offsetFunction, offsetLevelName, offsetAmount, pivotLevelName)
{
	var memberNavigations = oFF.XList.create();
	var leveledHierarchy = timeDimension.getLeveledHierarchy(hierarchyName);
	if (oFF.isNull(leveledHierarchy))
	{
		throw oFF.XException.createRuntimeException(oFF.XStringUtils.concatenate2("leveled hierarchy not found for hierarchy name:", hierarchyName));
	}
	var initialLevel = leveledHierarchy.getLevelByName(initialLevelName);
	if (oFF.isNull(initialLevel))
	{
		throw oFF.XException.createRuntimeException("initial level not found in time dimension.");
	}
	memberNavigations.addAll(oFF.QTimeMemberNavigationGenerator.getPivotLevelShiftMemberNavigations(leveledHierarchy, initialLevel, pivotLevelName));
	var offsetMemberNav = oFF.QTimeMemberNavigationGenerator.generateOffsetMemberNav(queryModel, offsetFunction, offsetLevelName, offsetAmount, timeDimension.getLeveledHierarchy(hierarchyName));
	if (oFF.notNull(offsetMemberNav))
	{
		memberNavigations.add(offsetMemberNav);
	}
	var ancestor = oFF.QFactory.createMemberNavigation(oFF.CurrentMemberFunction.ANCESTOR);
	ancestor.addParameter(oFF.QFactory.createNavigationParameterWithLevelLiteral(toDateLevelName));
	memberNavigations.add(ancestor);
	var level = leveledHierarchy.getLevelByName(toDateLevelName);
	if (oFF.isNull(level))
	{
		throw oFF.XException.createRuntimeException("toDate level not found in time dimension.");
	}
	var distance;
	if (oFF.notNull(pivotLevelName))
	{
		var pivotLevel = leveledHierarchy.getLevelByName(pivotLevelName);
		distance = pivotLevel.getLevelNumber() - level.getLevelNumber();
	}
	else
	{
		distance = initialLevel.getLevelNumber() - level.getLevelNumber();
	}
	if (distance < 0)
	{
		throw oFF.XException.createRuntimeException("toDate level cannot be the lower than the initial level.");
	}
	else if (distance === 0)
	{
		memberNavigations.add(oFF.QFactory.createMemberNavigation(oFF.CurrentMemberFunction.FIRST_SIBLING));
	}
	else
	{
		for (var i = 0; i < distance; i++)
		{
			memberNavigations.add(oFF.QFactory.createMemberNavigation(oFF.CurrentMemberFunction.FIRST_CHILD));
		}
	}
	if (lookBack !== 0)
	{
		memberNavigations.add(oFF.QTimeMemberNavigationGenerator.createParallelPeriodMemberNavigation(queryModel, toDateLevelName, lookBack, leveledHierarchy));
	}
	var rangeNav = oFF.QFactory.createMemberNavigation(oFF.CurrentMemberFunction.RANGE);
	var pivotLevelShiftMemberNavigationsIter = oFF.QTimeMemberNavigationGenerator.getPivotLevelShiftMemberNavigations(leveledHierarchy, initialLevel, pivotLevelName).getIterator();
	while (pivotLevelShiftMemberNavigationsIter.hasNext())
	{
		rangeNav.addNavigation(pivotLevelShiftMemberNavigationsIter.next());
	}
	if (oFF.notNull(offsetMemberNav))
	{
		rangeNav.addNavigation(offsetMemberNav);
	}
	else
	{
		var leadNav = oFF.QFactory.createMemberNavigation(oFF.CurrentMemberFunction.LEAD);
		leadNav.addParameter(oFF.QFactory.createNavigationParameterWithIntegerConstant(0));
		rangeNav.addNavigation(leadNav);
	}
	memberNavigations.add(rangeNav);
	return memberNavigations;
};
oFF.QTimeMemberNavigationGenerator.generateOffsetMemberNav = function(queryModel, offsetFunction, offsetLevelName, offsetAmount, leveledHierarchy)
{
	var offsetMemberNav = null;
	if (oFF.notNull(offsetFunction) && oFF.XStringUtils.isNotNullAndNotEmpty(offsetLevelName) && offsetAmount > 0)
	{
		var offsetValue = offsetFunction === oFF.TimeOffsetFunction.LOOK_BACK ? offsetAmount : offsetAmount * -1;
		offsetMemberNav = oFF.QTimeMemberNavigationGenerator.createParallelPeriodMemberNavigation(queryModel, offsetLevelName, offsetValue, leveledHierarchy);
	}
	return offsetMemberNav;
};

oFF.DfOlapEnvContext = function() {};
oFF.DfOlapEnvContext.prototype = new oFF.XObject();
oFF.DfOlapEnvContext.prototype._ff_c = "DfOlapEnvContext";

oFF.DfOlapEnvContext.prototype.m_olapEnv = null;
oFF.DfOlapEnvContext.prototype.setupOlapApplicationContext = function(application)
{
	this.m_olapEnv = oFF.XWeakReferenceUtil.getWeakRef(application);
};
oFF.DfOlapEnvContext.prototype.releaseObject = function()
{
	this.m_olapEnv = oFF.XObjectExt.release(this.m_olapEnv);
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.DfOlapEnvContext.prototype.getSession = function()
{
	return this.getOlapEnv().getSession();
};
oFF.DfOlapEnvContext.prototype.getProcess = function()
{
	return this.getOlapEnv().getProcess();
};
oFF.DfOlapEnvContext.prototype.getApplication = function()
{
	return this.getOlapEnv().getApplication();
};
oFF.DfOlapEnvContext.prototype.getOlapEnv = function()
{
	return oFF.XWeakReferenceUtil.getHardRef(this.m_olapEnv);
};

oFF.BlendingLinkType = function() {};
oFF.BlendingLinkType.prototype = new oFF.XConstant();
oFF.BlendingLinkType.prototype._ff_c = "BlendingLinkType";

oFF.BlendingLinkType.s_all = null;
oFF.BlendingLinkType.NONE = null;
oFF.BlendingLinkType.COEXIST = null;
oFF.BlendingLinkType.PRIMARY = null;
oFF.BlendingLinkType.ALL_DATA = null;
oFF.BlendingLinkType.INTERSECT = null;
oFF.BlendingLinkType.staticSetup = function()
{
	oFF.BlendingLinkType.s_all = oFF.XSetOfNameObject.create();
	oFF.BlendingLinkType.NONE = oFF.BlendingLinkType.create("None");
	oFF.BlendingLinkType.COEXIST = oFF.BlendingLinkType.create("Coexist");
	oFF.BlendingLinkType.PRIMARY = oFF.BlendingLinkType.create("Primary");
	oFF.BlendingLinkType.ALL_DATA = oFF.BlendingLinkType.create("AllData");
	oFF.BlendingLinkType.INTERSECT = oFF.BlendingLinkType.create("Intersect");
};
oFF.BlendingLinkType.create = function(name)
{
	var newConstant = oFF.XConstant.setupName(new oFF.BlendingLinkType(), name);
	oFF.BlendingLinkType.s_all.add(newConstant);
	return newConstant;
};
oFF.BlendingLinkType.lookup = function(name)
{
	return oFF.BlendingLinkType.s_all.getByKey(name);
};

oFF.BlendingMappingDefinitionType = function() {};
oFF.BlendingMappingDefinitionType.prototype = new oFF.XConstant();
oFF.BlendingMappingDefinitionType.prototype._ff_c = "BlendingMappingDefinitionType";

oFF.BlendingMappingDefinitionType.s_all = null;
oFF.BlendingMappingDefinitionType.DIMENSION = null;
oFF.BlendingMappingDefinitionType.ATTRIBUTE = null;
oFF.BlendingMappingDefinitionType.CONSTANT = null;
oFF.BlendingMappingDefinitionType.staticSetup = function()
{
	oFF.BlendingMappingDefinitionType.s_all = oFF.XSetOfNameObject.create();
	oFF.BlendingMappingDefinitionType.DIMENSION = oFF.BlendingMappingDefinitionType.create("Dimension");
	oFF.BlendingMappingDefinitionType.ATTRIBUTE = oFF.BlendingMappingDefinitionType.create("Attribute");
	oFF.BlendingMappingDefinitionType.CONSTANT = oFF.BlendingMappingDefinitionType.create("Constant");
};
oFF.BlendingMappingDefinitionType.create = function(name)
{
	var newConstant = oFF.XConstant.setupName(new oFF.BlendingMappingDefinitionType(), name);
	oFF.BlendingMappingDefinitionType.s_all.add(newConstant);
	return newConstant;
};
oFF.BlendingMappingDefinitionType.lookup = function(name)
{
	return oFF.BlendingMappingDefinitionType.s_all.getByKey(name);
};
oFF.BlendingMappingDefinitionType.lookupWithDefault = function(name, defaultValue)
{
	var mode = oFF.BlendingMappingDefinitionType.lookup(name);
	if (oFF.isNull(mode))
	{
		return defaultValue;
	}
	return mode;
};

oFF.BlendingPersistenceType = function() {};
oFF.BlendingPersistenceType.prototype = new oFF.XConstant();
oFF.BlendingPersistenceType.prototype._ff_c = "BlendingPersistenceType";

oFF.BlendingPersistenceType.VIEW = null;
oFF.BlendingPersistenceType.CUBE = null;
oFF.BlendingPersistenceType.ALL_DATA = null;
oFF.BlendingPersistenceType.staticSetup = function()
{
	oFF.BlendingPersistenceType.VIEW = oFF.XConstant.setupName(new oFF.BlendingPersistenceType(), "View");
	oFF.BlendingPersistenceType.CUBE = oFF.XConstant.setupName(new oFF.BlendingPersistenceType(), "Cube");
	oFF.BlendingPersistenceType.ALL_DATA = oFF.XConstant.setupName(new oFF.BlendingPersistenceType(), "AllData");
};

oFF.UnlinkedDimensionJoinType = function() {};
oFF.UnlinkedDimensionJoinType.prototype = new oFF.XConstant();
oFF.UnlinkedDimensionJoinType.prototype._ff_c = "UnlinkedDimensionJoinType";

oFF.UnlinkedDimensionJoinType.CREATE_NEW_MEMBERS = null;
oFF.UnlinkedDimensionJoinType.MERGE_MEMBERS = null;
oFF.UnlinkedDimensionJoinType.s_all = null;
oFF.UnlinkedDimensionJoinType.staticSetup = function()
{
	oFF.UnlinkedDimensionJoinType.s_all = oFF.XSetOfNameObject.create();
	oFF.UnlinkedDimensionJoinType.CREATE_NEW_MEMBERS = oFF.UnlinkedDimensionJoinType.create("createNewMembers");
	oFF.UnlinkedDimensionJoinType.MERGE_MEMBERS = oFF.UnlinkedDimensionJoinType.create("mergeMembers");
};
oFF.UnlinkedDimensionJoinType.create = function(name)
{
	var newConstant = oFF.XConstant.setupName(new oFF.UnlinkedDimensionJoinType(), name);
	oFF.UnlinkedDimensionJoinType.s_all.add(newConstant);
	return newConstant;
};
oFF.UnlinkedDimensionJoinType.lookup = function(name)
{
	return oFF.UnlinkedDimensionJoinType.s_all.getByKey(name);
};

oFF.FiscalSpaceType = function() {};
oFF.FiscalSpaceType.prototype = new oFF.XConstant();
oFF.FiscalSpaceType.prototype._ff_c = "FiscalSpaceType";

oFF.FiscalSpaceType.FISCAL = null;
oFF.FiscalSpaceType.CALENDAR = null;
oFF.FiscalSpaceType.s_lookup = null;
oFF.FiscalSpaceType.staticSetup = function()
{
	oFF.FiscalSpaceType.s_lookup = oFF.XSetOfNameObject.create();
	oFF.FiscalSpaceType.FISCAL = oFF.FiscalSpaceType.create("fiscal");
	oFF.FiscalSpaceType.CALENDAR = oFF.FiscalSpaceType.create("calendar");
};
oFF.FiscalSpaceType.create = function(name)
{
	var newConstant = oFF.XConstant.setupName(new oFF.FiscalSpaceType(), name);
	oFF.FiscalSpaceType.s_lookup.add(newConstant);
	return newConstant;
};
oFF.FiscalSpaceType.lookup = function(name)
{
	return oFF.FiscalSpaceType.s_lookup.getByKey(name);
};

oFF.QClientQueryObjectType = function() {};
oFF.QClientQueryObjectType.prototype = new oFF.XConstant();
oFF.QClientQueryObjectType.prototype._ff_c = "QClientQueryObjectType";

oFF.QClientQueryObjectType.PRIMARY_STRUCTURE_MEMBER = null;
oFF.QClientQueryObjectType.SECONDARY_STRUCTURE_MEMBER = null;
oFF.QClientQueryObjectType.FORMULA_CALCDIM_PROPERTIES = null;
oFF.QClientQueryObjectType.FORMULA_CALCDIM_FIELD_LIST = null;
oFF.QClientQueryObjectType.FORMULA_EXCEPTION = null;
oFF.QClientQueryObjectType.s_instances = null;
oFF.QClientQueryObjectType.staticSetup = function()
{
	oFF.QClientQueryObjectType.s_instances = oFF.XHashMapByString.create();
	oFF.QClientQueryObjectType.PRIMARY_STRUCTURE_MEMBER = oFF.QClientQueryObjectType.create("primaryStructure");
	oFF.QClientQueryObjectType.SECONDARY_STRUCTURE_MEMBER = oFF.QClientQueryObjectType.create("secondaryStructure");
	oFF.QClientQueryObjectType.FORMULA_CALCDIM_PROPERTIES = oFF.QClientQueryObjectType.create("calculatedDimension");
	oFF.QClientQueryObjectType.FORMULA_CALCDIM_FIELD_LIST = oFF.QClientQueryObjectType.create("calculatedDimensionFieldList");
	oFF.QClientQueryObjectType.FORMULA_EXCEPTION = oFF.QClientQueryObjectType.create("formulaException");
};
oFF.QClientQueryObjectType.create = function(name)
{
	var type = oFF.XConstant.setupName(new oFF.QClientQueryObjectType(), name);
	oFF.QClientQueryObjectType.s_instances.put(name, type);
	return type;
};
oFF.QClientQueryObjectType.lookup = function(name)
{
	return oFF.QClientQueryObjectType.s_instances.getByKey(name);
};

oFF.XCommandFollowUpType = function() {};
oFF.XCommandFollowUpType.prototype = new oFF.XConstant();
oFF.XCommandFollowUpType.prototype._ff_c = "XCommandFollowUpType";

oFF.XCommandFollowUpType.ALWAYS = null;
oFF.XCommandFollowUpType.SUCCESS = null;
oFF.XCommandFollowUpType.ERROR = null;
oFF.XCommandFollowUpType.staticSetup = function()
{
	oFF.XCommandFollowUpType.ALWAYS = oFF.XConstant.setupName(new oFF.XCommandFollowUpType(), "ALWAYS");
	oFF.XCommandFollowUpType.SUCCESS = oFF.XConstant.setupName(new oFF.XCommandFollowUpType(), "SUCCESS");
	oFF.XCommandFollowUpType.ERROR = oFF.XConstant.setupName(new oFF.XCommandFollowUpType(), "ERROR");
};

oFF.XCommandType = function() {};
oFF.XCommandType.prototype = new oFF.XConstant();
oFF.XCommandType.prototype._ff_c = "XCommandType";

oFF.XCommandType.CUSTOM = null;
oFF.XCommandType.ARRAY_CONCURRENT = null;
oFF.XCommandType.ARRAY_BATCH = null;
oFF.XCommandType.staticSetup = function()
{
	oFF.XCommandType.CUSTOM = oFF.XConstant.setupName(new oFF.XCommandType(), "CUSTOM");
	oFF.XCommandType.ARRAY_CONCURRENT = oFF.XConstant.setupName(new oFF.XCommandType(), "ARRAY_CONCURRENT");
	oFF.XCommandType.ARRAY_BATCH = oFF.XConstant.setupName(new oFF.XCommandType(), "ARRAY_BATCH");
};

oFF.ActionChoice = function() {};
oFF.ActionChoice.prototype = new oFF.XConstant();
oFF.ActionChoice.prototype._ff_c = "ActionChoice";

oFF.ActionChoice.OFF = null;
oFF.ActionChoice.ONCE = null;
oFF.ActionChoice.ON = null;
oFF.ActionChoice.staticSetup = function()
{
	oFF.ActionChoice.OFF = oFF.XConstant.setupName(new oFF.ActionChoice(), "Off");
	oFF.ActionChoice.ONCE = oFF.XConstant.setupName(new oFF.ActionChoice(), "Once");
	oFF.ActionChoice.ON = oFF.XConstant.setupName(new oFF.ActionChoice(), "On");
};

oFF.AggregationType = function() {};
oFF.AggregationType.prototype = new oFF.XConstant();
oFF.AggregationType.prototype._ff_c = "AggregationType";

oFF.AggregationType.s_all = null;
oFF.AggregationType.s_statisticalAggregations = null;
oFF.AggregationType.AVERAGE = null;
oFF.AggregationType.COUNT = null;
oFF.AggregationType.COUNT_DISTINCT = null;
oFF.AggregationType.FIRST = null;
oFF.AggregationType.LAST = null;
oFF.AggregationType.MAX = null;
oFF.AggregationType.MIN = null;
oFF.AggregationType.RANK = null;
oFF.AggregationType.RANK_DENSE = null;
oFF.AggregationType.RANK_OLYMPIC = null;
oFF.AggregationType.RANK_PERCENTILE = null;
oFF.AggregationType.RANK_PERCENT = null;
oFF.AggregationType.SUM = null;
oFF.AggregationType.STANDARD_DEVIATION = null;
oFF.AggregationType.VARIANCE = null;
oFF.AggregationType.NOP_NULL = null;
oFF.AggregationType.NOP_NULL_ZERO = null;
oFF.AggregationType.AVERAGE_NULL = null;
oFF.AggregationType.AVERAGE_NULL_ZERO = null;
oFF.AggregationType.COUNT_NULL = null;
oFF.AggregationType.COUNT_NULL_ZERO = null;
oFF.AggregationType.MEDIAN = null;
oFF.AggregationType.MEDIAN_NULL = null;
oFF.AggregationType.MEDIAN_NULL_ZERO = null;
oFF.AggregationType.FIRST_QUARTILE = null;
oFF.AggregationType.FIRST_QUARTILE_NULL = null;
oFF.AggregationType.FIRST_QUARTILE_NULL_ZERO = null;
oFF.AggregationType.THIRD_QUARTILE = null;
oFF.AggregationType.THIRD_QUARTILE_NULL = null;
oFF.AggregationType.THIRD_QUARTILE_NULL_ZERO = null;
oFF.AggregationType.OUTLIERS = null;
oFF.AggregationType.OUTLIERS_NULL = null;
oFF.AggregationType.OUTLIERS_NULL_ZERO = null;
oFF.AggregationType.staticSetup = function()
{
	oFF.AggregationType.s_all = oFF.XSetOfNameObject.create();
	oFF.AggregationType.s_statisticalAggregations = oFF.XSetOfNameObject.create();
	oFF.AggregationType.AVERAGE = oFF.AggregationType.create("AVERAGE");
	oFF.AggregationType.COUNT = oFF.AggregationType.create("COUNT");
	oFF.AggregationType.COUNT_DISTINCT = oFF.AggregationType.create("COUNT_DISTINCT");
	oFF.AggregationType.FIRST = oFF.AggregationType.create("FIRST");
	oFF.AggregationType.LAST = oFF.AggregationType.create("LAST");
	oFF.AggregationType.MAX = oFF.AggregationType.create("MAX");
	oFF.AggregationType.MIN = oFF.AggregationType.create("MIN");
	oFF.AggregationType.RANK = oFF.AggregationType.create("RANK");
	oFF.AggregationType.RANK_DENSE = oFF.AggregationType.create("RANK_DENSE");
	oFF.AggregationType.RANK_OLYMPIC = oFF.AggregationType.create("RANK_OLYMPIC");
	oFF.AggregationType.RANK_PERCENTILE = oFF.AggregationType.create("RANK_PERCENTILE");
	oFF.AggregationType.RANK_PERCENT = oFF.AggregationType.create("RANK_PERCENT");
	oFF.AggregationType.SUM = oFF.AggregationType.create("SUM");
	oFF.AggregationType.STANDARD_DEVIATION = oFF.AggregationType.create("STANDARD_DEVIATION");
	oFF.AggregationType.VARIANCE = oFF.AggregationType.create("VARIANCE");
	oFF.AggregationType.NOP_NULL = oFF.AggregationType.create("NOPNULL");
	oFF.AggregationType.NOP_NULL_ZERO = oFF.AggregationType.create("NOPNULLZERO");
	oFF.AggregationType.AVERAGE_NULL = oFF.AggregationType.create("AVERAGENULL");
	oFF.AggregationType.AVERAGE_NULL_ZERO = oFF.AggregationType.create("AVERAGENULLZERO");
	oFF.AggregationType.COUNT_NULL = oFF.AggregationType.create("COUNTNULL");
	oFF.AggregationType.COUNT_NULL_ZERO = oFF.AggregationType.create("COUNTNULLZERO");
	oFF.AggregationType.MEDIAN = oFF.AggregationType.create("MEDIAN");
	oFF.AggregationType.MEDIAN_NULL = oFF.AggregationType.create("MEDIANNULL");
	oFF.AggregationType.MEDIAN_NULL_ZERO = oFF.AggregationType.create("MEDIANNULLZERO");
	oFF.AggregationType.FIRST_QUARTILE = oFF.AggregationType.create("1STQUARTILE");
	oFF.AggregationType.FIRST_QUARTILE_NULL = oFF.AggregationType.create("1STQUARTILENULL");
	oFF.AggregationType.FIRST_QUARTILE_NULL_ZERO = oFF.AggregationType.create("1STQUARTILENULLZERO");
	oFF.AggregationType.THIRD_QUARTILE = oFF.AggregationType.create("3RDQUARTILE");
	oFF.AggregationType.THIRD_QUARTILE_NULL = oFF.AggregationType.create("3RDQUARTILENULL");
	oFF.AggregationType.THIRD_QUARTILE_NULL_ZERO = oFF.AggregationType.create("3RDQUARTILENULLZERO");
	oFF.AggregationType.OUTLIERS = oFF.AggregationType.create("OUTLIERS");
	oFF.AggregationType.OUTLIERS_NULL = oFF.AggregationType.create("OUTLIERSNULL");
	oFF.AggregationType.OUTLIERS_NULL_ZERO = oFF.AggregationType.create("OUTLIERSNULLZERO");
};
oFF.AggregationType.create = function(name)
{
	var newConstant = oFF.XConstant.setupName(new oFF.AggregationType(), name);
	oFF.AggregationType.s_all.add(newConstant);
	if (newConstant === oFF.AggregationType.FIRST_QUARTILE || newConstant === oFF.AggregationType.FIRST_QUARTILE_NULL || newConstant === oFF.AggregationType.FIRST_QUARTILE_NULL_ZERO || newConstant === oFF.AggregationType.MEDIAN || newConstant === oFF.AggregationType.MEDIAN_NULL || newConstant === oFF.AggregationType.MEDIAN_NULL_ZERO || newConstant === oFF.AggregationType.THIRD_QUARTILE || newConstant === oFF.AggregationType.THIRD_QUARTILE_NULL || newConstant === oFF.AggregationType.THIRD_QUARTILE_NULL_ZERO)
	{
		oFF.AggregationType.s_statisticalAggregations.add(newConstant);
	}
	return newConstant;
};
oFF.AggregationType.lookupOrCreate = function(name)
{
	if (oFF.XStringUtils.isNullOrEmpty(name))
	{
		return null;
	}
	var aggrType = oFF.AggregationType.lookup(name);
	if (oFF.isNull(aggrType))
	{
		aggrType = oFF.AggregationType.create(name);
	}
	return aggrType;
};
oFF.AggregationType.lookup = function(name)
{
	return oFF.AggregationType.s_all.getByKey(name);
};
oFF.AggregationType.lookupStatisticalAggregation = function(name)
{
	return oFF.AggregationType.s_statisticalAggregations.getByKey(name);
};
oFF.AggregationType.getAll = function()
{
	return oFF.AggregationType.s_all;
};

oFF.AlertCategory = function() {};
oFF.AlertCategory.prototype = new oFF.XConstant();
oFF.AlertCategory.prototype._ff_c = "AlertCategory";

oFF.AlertCategory.NORMAL = null;
oFF.AlertCategory.GOOD = null;
oFF.AlertCategory.CRITICAL = null;
oFF.AlertCategory.BAD = null;
oFF.AlertCategory.staticSetup = function()
{
	oFF.AlertCategory.NORMAL = oFF.AlertCategory.create("NORMAL", 0);
	oFF.AlertCategory.GOOD = oFF.AlertCategory.create("GOOD", 1);
	oFF.AlertCategory.CRITICAL = oFF.AlertCategory.create("CRITICAL", 2);
	oFF.AlertCategory.BAD = oFF.AlertCategory.create("BAD", 3);
};
oFF.AlertCategory.create = function(name, priority)
{
	var object = oFF.XConstant.setupName(new oFF.AlertCategory(), name);
	object.m_priority = priority;
	return object;
};
oFF.AlertCategory.prototype.m_priority = 0;
oFF.AlertCategory.prototype.getPriority = function()
{
	return this.m_priority;
};

oFF.AlertLevel = function() {};
oFF.AlertLevel.prototype = new oFF.XConstant();
oFF.AlertLevel.prototype._ff_c = "AlertLevel";

oFF.AlertLevel.NORMAL = null;
oFF.AlertLevel.GOOD_1 = null;
oFF.AlertLevel.GOOD_2 = null;
oFF.AlertLevel.GOOD_3 = null;
oFF.AlertLevel.CRITICAL_1 = null;
oFF.AlertLevel.CRITICAL_2 = null;
oFF.AlertLevel.CRITICAL_3 = null;
oFF.AlertLevel.BAD_1 = null;
oFF.AlertLevel.BAD_2 = null;
oFF.AlertLevel.BAD_3 = null;
oFF.AlertLevel.staticSetup = function()
{
	oFF.AlertLevel.NORMAL = oFF.AlertLevel.create(0, oFF.AlertCategory.NORMAL, 1);
	oFF.AlertLevel.GOOD_1 = oFF.AlertLevel.create(1, oFF.AlertCategory.GOOD, 1);
	oFF.AlertLevel.GOOD_2 = oFF.AlertLevel.create(2, oFF.AlertCategory.GOOD, 2);
	oFF.AlertLevel.GOOD_3 = oFF.AlertLevel.create(3, oFF.AlertCategory.GOOD, 3);
	oFF.AlertLevel.CRITICAL_1 = oFF.AlertLevel.create(4, oFF.AlertCategory.CRITICAL, 1);
	oFF.AlertLevel.CRITICAL_2 = oFF.AlertLevel.create(5, oFF.AlertCategory.CRITICAL, 2);
	oFF.AlertLevel.CRITICAL_3 = oFF.AlertLevel.create(6, oFF.AlertCategory.CRITICAL, 3);
	oFF.AlertLevel.BAD_1 = oFF.AlertLevel.create(7, oFF.AlertCategory.BAD, 1);
	oFF.AlertLevel.BAD_2 = oFF.AlertLevel.create(8, oFF.AlertCategory.BAD, 2);
	oFF.AlertLevel.BAD_3 = oFF.AlertLevel.create(9, oFF.AlertCategory.BAD, 3);
};
oFF.AlertLevel.create = function(value, category, priority)
{
	var object = new oFF.AlertLevel();
	object.setupExt(value, priority, category);
	return object;
};
oFF.AlertLevel.prototype.m_priority = 0;
oFF.AlertLevel.prototype.m_category = null;
oFF.AlertLevel.prototype.m_level = 0;
oFF.AlertLevel.prototype.setupExt = function(value, priority, category)
{
	this._setupInternal(oFF.XInteger.convertToString(value));
	this.m_priority = priority;
	this.m_level = value;
	this.m_category = category;
};
oFF.AlertLevel.prototype.getPriority = function()
{
	return this.m_priority;
};
oFF.AlertLevel.prototype.getLevel = function()
{
	return this.m_level;
};
oFF.AlertLevel.prototype.getCategory = function()
{
	return this.m_category;
};

oFF.AlertSymbol = function() {};
oFF.AlertSymbol.prototype = new oFF.XConstant();
oFF.AlertSymbol.prototype._ff_c = "AlertSymbol";

oFF.AlertSymbol.s_instances = null;
oFF.AlertSymbol.GOOD = null;
oFF.AlertSymbol.WARNING = null;
oFF.AlertSymbol.ALERT = null;
oFF.AlertSymbol.DIAMOND = null;
oFF.AlertSymbol.staticSetup = function()
{
	oFF.AlertSymbol.s_instances = oFF.XHashMapByString.create();
	oFF.AlertSymbol.GOOD = oFF.AlertSymbol.create("Good");
	oFF.AlertSymbol.WARNING = oFF.AlertSymbol.create("Warning");
	oFF.AlertSymbol.ALERT = oFF.AlertSymbol.create("Alert");
	oFF.AlertSymbol.DIAMOND = oFF.AlertSymbol.create("Diamond");
};
oFF.AlertSymbol.create = function(name)
{
	var object = oFF.XConstant.setupName(new oFF.AlertSymbol(), name);
	oFF.AlertSymbol.s_instances.put(name, object);
	return object;
};
oFF.AlertSymbol.lookup = function(name)
{
	return oFF.AlertSymbol.s_instances.getByKey(name);
};

oFF.Alignment = function() {};
oFF.Alignment.prototype = new oFF.XConstant();
oFF.Alignment.prototype._ff_c = "Alignment";

oFF.Alignment.DEFAULT_VALUE = null;
oFF.Alignment.CHILDREN_BELOW_PARENT = null;
oFF.Alignment.CHILDREN_ABOVE_PARENT = null;
oFF.Alignment.INHERIT_FROM_FIRST_DIMENSION_ON_AXIS = null;
oFF.Alignment.s_lookup = null;
oFF.Alignment.staticSetup = function()
{
	oFF.Alignment.s_lookup = oFF.XHashMapByString.create();
	oFF.Alignment.DEFAULT_VALUE = oFF.Alignment.createAlignment("Default");
	oFF.Alignment.CHILDREN_BELOW_PARENT = oFF.Alignment.createAlignment("Below");
	oFF.Alignment.CHILDREN_ABOVE_PARENT = oFF.Alignment.createAlignment("Above");
	oFF.Alignment.INHERIT_FROM_FIRST_DIMENSION_ON_AXIS = oFF.Alignment.createAlignment("InheritFromFirstDimensionOnAxis");
};
oFF.Alignment.createAlignment = function(name)
{
	var alignment = oFF.XConstant.setupName(new oFF.Alignment(), name);
	oFF.Alignment.s_lookup.put(name, alignment);
	return alignment;
};
oFF.Alignment.lookup = function(name)
{
	return oFF.Alignment.s_lookup.getByKey(name);
};
oFF.Alignment.isExplicit = function(alignment)
{
	return alignment === oFF.Alignment.CHILDREN_BELOW_PARENT || alignment === oFF.Alignment.CHILDREN_ABOVE_PARENT;
};

oFF.CellAlignmentHorizontal = function() {};
oFF.CellAlignmentHorizontal.prototype = new oFF.XConstant();
oFF.CellAlignmentHorizontal.prototype._ff_c = "CellAlignmentHorizontal";

oFF.CellAlignmentHorizontal.s_instances = null;
oFF.CellAlignmentHorizontal.LEFT = null;
oFF.CellAlignmentHorizontal.CENTER = null;
oFF.CellAlignmentHorizontal.RIGHT = null;
oFF.CellAlignmentHorizontal.INHERIT = null;
oFF.CellAlignmentHorizontal.staticSetup = function()
{
	oFF.CellAlignmentHorizontal.s_instances = oFF.XHashMapByString.create();
	oFF.CellAlignmentHorizontal.LEFT = oFF.CellAlignmentHorizontal.create("Left");
	oFF.CellAlignmentHorizontal.CENTER = oFF.CellAlignmentHorizontal.create("Center");
	oFF.CellAlignmentHorizontal.RIGHT = oFF.CellAlignmentHorizontal.create("Right");
	oFF.CellAlignmentHorizontal.INHERIT = oFF.CellAlignmentHorizontal.create("Inherit");
};
oFF.CellAlignmentHorizontal.create = function(name)
{
	var object = oFF.XConstant.setupName(new oFF.CellAlignmentHorizontal(), name);
	oFF.CellAlignmentHorizontal.s_instances.put(name, object);
	return object;
};
oFF.CellAlignmentHorizontal.lookup = function(name)
{
	return oFF.CellAlignmentHorizontal.s_instances.getByKey(name);
};

oFF.CellAlignmentVertical = function() {};
oFF.CellAlignmentVertical.prototype = new oFF.XConstant();
oFF.CellAlignmentVertical.prototype._ff_c = "CellAlignmentVertical";

oFF.CellAlignmentVertical.s_instances = null;
oFF.CellAlignmentVertical.TOP = null;
oFF.CellAlignmentVertical.MIDDLE = null;
oFF.CellAlignmentVertical.BOTTOM = null;
oFF.CellAlignmentVertical.INHERIT = null;
oFF.CellAlignmentVertical.staticSetup = function()
{
	oFF.CellAlignmentVertical.s_instances = oFF.XHashMapByString.create();
	oFF.CellAlignmentVertical.TOP = oFF.CellAlignmentVertical.create("Top");
	oFF.CellAlignmentVertical.MIDDLE = oFF.CellAlignmentVertical.create("Middle");
	oFF.CellAlignmentVertical.BOTTOM = oFF.CellAlignmentVertical.create("Bottom");
	oFF.CellAlignmentVertical.INHERIT = oFF.CellAlignmentVertical.create("Inherit");
};
oFF.CellAlignmentVertical.create = function(name)
{
	var object = oFF.XConstant.setupName(new oFF.CellAlignmentVertical(), name);
	oFF.CellAlignmentVertical.s_instances.put(name, object);
	return object;
};
oFF.CellAlignmentVertical.lookup = function(name)
{
	return oFF.CellAlignmentVertical.s_instances.getByKey(name);
};

oFF.ChartOrientation = function() {};
oFF.ChartOrientation.prototype = new oFF.XConstant();
oFF.ChartOrientation.prototype._ff_c = "ChartOrientation";

oFF.ChartOrientation.s_instances = null;
oFF.ChartOrientation.DEFAULT = null;
oFF.ChartOrientation.HORIZONTAL = null;
oFF.ChartOrientation.VERTICAL = null;
oFF.ChartOrientation.staticSetup = function()
{
	oFF.ChartOrientation.s_instances = oFF.XHashMapByString.create();
	oFF.ChartOrientation.DEFAULT = oFF.ChartOrientation.create("Default");
	oFF.ChartOrientation.HORIZONTAL = oFF.ChartOrientation.create("Horizontal");
	oFF.ChartOrientation.VERTICAL = oFF.ChartOrientation.create("Vertical");
};
oFF.ChartOrientation.create = function(name)
{
	var chartOrientation = new oFF.ChartOrientation();
	chartOrientation._setupInternal(name);
	oFF.ChartOrientation.s_instances.put(name, chartOrientation);
	return chartOrientation;
};

oFF.ChartStackingType = function() {};
oFF.ChartStackingType.prototype = new oFF.XConstant();
oFF.ChartStackingType.prototype._ff_c = "ChartStackingType";

oFF.ChartStackingType.s_instances = null;
oFF.ChartStackingType.NONE = null;
oFF.ChartStackingType.NORMAL = null;
oFF.ChartStackingType.PERCENT = null;
oFF.ChartStackingType.staticSetup = function()
{
	oFF.ChartStackingType.s_instances = oFF.XHashMapByString.create();
	oFF.ChartStackingType.NONE = oFF.ChartStackingType.create("None");
	oFF.ChartStackingType.NORMAL = oFF.ChartStackingType.create("Normal");
	oFF.ChartStackingType.PERCENT = oFF.ChartStackingType.create("Percent");
};
oFF.ChartStackingType.create = function(name)
{
	var chartStacking = new oFF.ChartStackingType();
	chartStacking._setupInternal(name);
	oFF.ChartStackingType.s_instances.put(name, chartStacking);
	return chartStacking;
};

oFF.ChartType = function() {};
oFF.ChartType.prototype = new oFF.XConstant();
oFF.ChartType.prototype._ff_c = "ChartType";

oFF.ChartType.s_instances = null;
oFF.ChartType.NONE = null;
oFF.ChartType.BAR_COLUMN = null;
oFF.ChartType.POINT = null;
oFF.ChartType.LINE = null;
oFF.ChartType.AREA = null;
oFF.ChartType.BELL_CURVE = null;
oFF.ChartType.VARI_WIDE = null;
oFF.ChartType.BOX_PLOT = null;
oFF.ChartType.BUBBLE = null;
oFF.ChartType.PACKED_BUBBLE = null;
oFF.ChartType.RADAR = null;
oFF.ChartType.VIOLIN = null;
oFF.ChartType.HISTOGRAM = null;
oFF.ChartType.WATERFALL = null;
oFF.ChartType.WORD_CLOUD = null;
oFF.ChartType.PIE = null;
oFF.ChartType.DOUGHNUT = null;
oFF.ChartType.VARIABLE_PIE = null;
oFF.ChartType.SCATTER_PLOT = null;
oFF.ChartType.HEAT_MAP = null;
oFF.ChartType.TREE_MAP = null;
oFF.ChartType.METRIC = null;
oFF.ChartType.BULLET = null;
oFF.ChartType.SPLINE = null;
oFF.ChartType.TIME_SERIES = null;
oFF.ChartType.staticSetup = function()
{
	oFF.ChartType.s_instances = oFF.XHashMapByString.create();
	oFF.ChartType.NONE = oFF.ChartType.create("None");
	oFF.ChartType.BAR_COLUMN = oFF.ChartType.create("BarColumn");
	oFF.ChartType.POINT = oFF.ChartType.create("Point");
	oFF.ChartType.LINE = oFF.ChartType.create("Line");
	oFF.ChartType.AREA = oFF.ChartType.create("Area");
	oFF.ChartType.BELL_CURVE = oFF.ChartType.create("BellCurve");
	oFF.ChartType.BOX_PLOT = oFF.ChartType.create("BoxPlot");
	oFF.ChartType.HISTOGRAM = oFF.ChartType.create("Histogram");
	oFF.ChartType.VIOLIN = oFF.ChartType.create("Violin");
	oFF.ChartType.BUBBLE = oFF.ChartType.create("Bubble");
	oFF.ChartType.PACKED_BUBBLE = oFF.ChartType.create("PackedBubble");
	oFF.ChartType.SCATTER_PLOT = oFF.ChartType.create("ScatterPlot");
	oFF.ChartType.SPLINE = oFF.ChartType.create("Spline");
	oFF.ChartType.TIME_SERIES = oFF.ChartType.create("TimeSeries");
	oFF.ChartType.METRIC = oFF.ChartType.create("Metric");
	oFF.ChartType.BULLET = oFF.ChartType.create("Bullet");
	oFF.ChartType.HEAT_MAP = oFF.ChartType.create("HeatMap");
	oFF.ChartType.TREE_MAP = oFF.ChartType.create("TreeMap");
	oFF.ChartType.DOUGHNUT = oFF.ChartType.create("Doughnut");
	oFF.ChartType.PIE = oFF.ChartType.create("Pie");
	oFF.ChartType.VARIABLE_PIE = oFF.ChartType.create("VariablePie");
	oFF.ChartType.VARI_WIDE = oFF.ChartType.create("VariWide");
	oFF.ChartType.RADAR = oFF.ChartType.create("Radar");
	oFF.ChartType.WATERFALL = oFF.ChartType.create("Waterfall");
	oFF.ChartType.WORD_CLOUD = oFF.ChartType.create("WordCloud");
};
oFF.ChartType.create = function(name)
{
	var chartStacking = new oFF.ChartType();
	chartStacking._setupInternal(name);
	oFF.ChartType.s_instances.put(name, chartStacking);
	return chartStacking;
};

oFF.ClusterAlgorithm = function() {};
oFF.ClusterAlgorithm.prototype = new oFF.XConstant();
oFF.ClusterAlgorithm.prototype._ff_c = "ClusterAlgorithm";

oFF.ClusterAlgorithm.K_MEANS = null;
oFF.ClusterAlgorithm.GRID = null;
oFF.ClusterAlgorithm.DB_SCAN = null;
oFF.ClusterAlgorithm.staticSetup = function()
{
	oFF.ClusterAlgorithm.K_MEANS = oFF.XConstant.setupName(new oFF.ClusterAlgorithm(), "K-Means");
	oFF.ClusterAlgorithm.GRID = oFF.XConstant.setupName(new oFF.ClusterAlgorithm(), "Grid");
	oFF.ClusterAlgorithm.DB_SCAN = oFF.XConstant.setupName(new oFF.ClusterAlgorithm(), "DB-Scan");
};

oFF.ConditionDimensionEvaluationType = function() {};
oFF.ConditionDimensionEvaluationType.prototype = new oFF.XConstant();
oFF.ConditionDimensionEvaluationType.prototype._ff_c = "ConditionDimensionEvaluationType";

oFF.ConditionDimensionEvaluationType.ALL_IN_DRILL_DOWN = null;
oFF.ConditionDimensionEvaluationType.MOST_DETAILED_ON_ROWS = null;
oFF.ConditionDimensionEvaluationType.MOST_DETAILED_ON_COLS = null;
oFF.ConditionDimensionEvaluationType.GIVEN_LIST = null;
oFF.ConditionDimensionEvaluationType.s_lookupNames = null;
oFF.ConditionDimensionEvaluationType.staticSetup = function()
{
	oFF.ConditionDimensionEvaluationType.s_lookupNames = oFF.XHashMapByString.create();
	oFF.ConditionDimensionEvaluationType.ALL_IN_DRILL_DOWN = oFF.ConditionDimensionEvaluationType.create("allInDrilldown");
	oFF.ConditionDimensionEvaluationType.MOST_DETAILED_ON_ROWS = oFF.ConditionDimensionEvaluationType.create("mostDetailedOnRows");
	oFF.ConditionDimensionEvaluationType.MOST_DETAILED_ON_COLS = oFF.ConditionDimensionEvaluationType.create("mostDetailedOnCols");
	oFF.ConditionDimensionEvaluationType.GIVEN_LIST = oFF.ConditionDimensionEvaluationType.create("givenList");
};
oFF.ConditionDimensionEvaluationType.create = function(name)
{
	var newObj = oFF.XConstant.setupName(new oFF.ConditionDimensionEvaluationType(), name);
	oFF.ConditionDimensionEvaluationType.s_lookupNames.put(name, newObj);
	return newObj;
};
oFF.ConditionDimensionEvaluationType.lookupName = function(name)
{
	return oFF.ConditionDimensionEvaluationType.s_lookupNames.getByKey(name);
};

oFF.CurrencyTranslationOperation = function() {};
oFF.CurrencyTranslationOperation.prototype = new oFF.XConstant();
oFF.CurrencyTranslationOperation.prototype._ff_c = "CurrencyTranslationOperation";

oFF.CurrencyTranslationOperation.TARGET = null;
oFF.CurrencyTranslationOperation.DEFINITION = null;
oFF.CurrencyTranslationOperation.BOTH = null;
oFF.CurrencyTranslationOperation.ORIGINAL = null;
oFF.CurrencyTranslationOperation.s_lookup = null;
oFF.CurrencyTranslationOperation.staticSetup = function()
{
	oFF.CurrencyTranslationOperation.s_lookup = oFF.XHashMapByString.create();
	oFF.CurrencyTranslationOperation.TARGET = oFF.CurrencyTranslationOperation.createCurrencyTranslationOperation("Target");
	oFF.CurrencyTranslationOperation.DEFINITION = oFF.CurrencyTranslationOperation.createCurrencyTranslationOperation("Definition");
	oFF.CurrencyTranslationOperation.BOTH = oFF.CurrencyTranslationOperation.createCurrencyTranslationOperation("Both");
	oFF.CurrencyTranslationOperation.ORIGINAL = oFF.CurrencyTranslationOperation.createCurrencyTranslationOperation("Original");
};
oFF.CurrencyTranslationOperation.createCurrencyTranslationOperation = function(name)
{
	var newConstant = oFF.XConstant.setupName(new oFF.CurrencyTranslationOperation(), name);
	oFF.CurrencyTranslationOperation.s_lookup.put(name, newConstant);
	return newConstant;
};
oFF.CurrencyTranslationOperation.lookup = function(name)
{
	return oFF.CurrencyTranslationOperation.s_lookup.getByKey(name);
};
oFF.CurrencyTranslationOperation.prototype.isConsiderMetadataDefinedCurrencyTranslation = function()
{
	return this === oFF.CurrencyTranslationOperation.BOTH || this === oFF.CurrencyTranslationOperation.DEFINITION;
};
oFF.CurrencyTranslationOperation.prototype.isConsiderClientDefinedCurrencyTranslation = function()
{
	return this === oFF.CurrencyTranslationOperation.BOTH || this === oFF.CurrencyTranslationOperation.TARGET;
};

oFF.CurrentMemberFunction = function() {};
oFF.CurrentMemberFunction.prototype = new oFF.XConstant();
oFF.CurrentMemberFunction.prototype._ff_c = "CurrentMemberFunction";

oFF.CurrentMemberFunction.ASCENDANTS = null;
oFF.CurrentMemberFunction.CHILDREN = null;
oFF.CurrentMemberFunction.FIRST_CHILD = null;
oFF.CurrentMemberFunction.FIRST_SIBLING = null;
oFF.CurrentMemberFunction.LAST_CHILD = null;
oFF.CurrentMemberFunction.LAST_SIBLING = null;
oFF.CurrentMemberFunction.LEAVES = null;
oFF.CurrentMemberFunction.MTD = null;
oFF.CurrentMemberFunction.NEXT_MEMBER = null;
oFF.CurrentMemberFunction.PARENT = null;
oFF.CurrentMemberFunction.PREV_MEMBER = null;
oFF.CurrentMemberFunction.QTD = null;
oFF.CurrentMemberFunction.SIBLINGS = null;
oFF.CurrentMemberFunction.WTD = null;
oFF.CurrentMemberFunction.YTD = null;
oFF.CurrentMemberFunction.DEFAULT_MEMBER = null;
oFF.CurrentMemberFunction.ANCESTOR = null;
oFF.CurrentMemberFunction.ANCESTOR_UP_TO_LEVEL = null;
oFF.CurrentMemberFunction.CLOSING_PERIOD = null;
oFF.CurrentMemberFunction.COUSIN = null;
oFF.CurrentMemberFunction.DESCENDANTS = null;
oFF.CurrentMemberFunction.DISTINCT = null;
oFF.CurrentMemberFunction.DRILLDOWN_LEVEL = null;
oFF.CurrentMemberFunction.DRILLDOWN_MEMBER = null;
oFF.CurrentMemberFunction.DRILLUP_LEVEL = null;
oFF.CurrentMemberFunction.DRILLUP_MEMBER = null;
oFF.CurrentMemberFunction.HEAD = null;
oFF.CurrentMemberFunction.HIERARCHIZE = null;
oFF.CurrentMemberFunction.LAG = null;
oFF.CurrentMemberFunction.LAST_PERIODS = null;
oFF.CurrentMemberFunction.LEAD = null;
oFF.CurrentMemberFunction.MEMBERS = null;
oFF.CurrentMemberFunction.MEMBERS_ASCENDANTS_DESCENDANTS = null;
oFF.CurrentMemberFunction.OPENING_PERIOD = null;
oFF.CurrentMemberFunction.PARALLEL_PERIOD = null;
oFF.CurrentMemberFunction.PERIODS_TO_DATE = null;
oFF.CurrentMemberFunction.RANGE = null;
oFF.CurrentMemberFunction.SUBSET = null;
oFF.CurrentMemberFunction.TAIL = null;
oFF.CurrentMemberFunction.UNION = null;
oFF.CurrentMemberFunction.INA_PARALLEL_PERIOD = null;
oFF.CurrentMemberFunction.INA_SHIFT_PERIOD = null;
oFF.CurrentMemberFunction.INA_TO_DATE = null;
oFF.CurrentMemberFunction.INA_LAST_PERIODS = null;
oFF.CurrentMemberFunction.INA_CURRENT = null;
oFF.CurrentMemberFunction.s_all = null;
oFF.CurrentMemberFunction.staticSetup = function()
{
	oFF.CurrentMemberFunction.s_all = oFF.XSetOfNameObject.create();
	oFF.CurrentMemberFunction.ASCENDANTS = oFF.CurrentMemberFunction.create("Ascendants");
	oFF.CurrentMemberFunction.CHILDREN = oFF.CurrentMemberFunction.create("Children");
	oFF.CurrentMemberFunction.FIRST_CHILD = oFF.CurrentMemberFunction.create("FirstChild");
	oFF.CurrentMemberFunction.FIRST_SIBLING = oFF.CurrentMemberFunction.create("FirstSibling");
	oFF.CurrentMemberFunction.LAST_CHILD = oFF.CurrentMemberFunction.create("LastChild");
	oFF.CurrentMemberFunction.LAST_SIBLING = oFF.CurrentMemberFunction.create("LastSibling");
	oFF.CurrentMemberFunction.LEAVES = oFF.CurrentMemberFunction.create("Leaves");
	oFF.CurrentMemberFunction.MTD = oFF.CurrentMemberFunction.create("MTD");
	oFF.CurrentMemberFunction.NEXT_MEMBER = oFF.CurrentMemberFunction.create("NextMember");
	oFF.CurrentMemberFunction.PARENT = oFF.CurrentMemberFunction.create("Parent");
	oFF.CurrentMemberFunction.PREV_MEMBER = oFF.CurrentMemberFunction.create("PrevMember");
	oFF.CurrentMemberFunction.QTD = oFF.CurrentMemberFunction.create("QTD");
	oFF.CurrentMemberFunction.SIBLINGS = oFF.CurrentMemberFunction.create("Siblings");
	oFF.CurrentMemberFunction.WTD = oFF.CurrentMemberFunction.create("WTD");
	oFF.CurrentMemberFunction.YTD = oFF.CurrentMemberFunction.create("YTD");
	oFF.CurrentMemberFunction.DEFAULT_MEMBER = oFF.CurrentMemberFunction.create("DefaultMember");
	oFF.CurrentMemberFunction.ANCESTOR = oFF.CurrentMemberFunction.create("Ancestor");
	oFF.CurrentMemberFunction.ANCESTOR_UP_TO_LEVEL = oFF.CurrentMemberFunction.create("AncestorUpToLevel");
	oFF.CurrentMemberFunction.CLOSING_PERIOD = oFF.CurrentMemberFunction.create("ClosingPeriod");
	oFF.CurrentMemberFunction.COUSIN = oFF.CurrentMemberFunction.create("Cousin");
	oFF.CurrentMemberFunction.DESCENDANTS = oFF.CurrentMemberFunction.create("Descendants");
	oFF.CurrentMemberFunction.DISTINCT = oFF.CurrentMemberFunction.create("Distinct");
	oFF.CurrentMemberFunction.DRILLDOWN_LEVEL = oFF.CurrentMemberFunction.create("DrillDownLevel");
	oFF.CurrentMemberFunction.DRILLDOWN_MEMBER = oFF.CurrentMemberFunction.create("DrillDownMember");
	oFF.CurrentMemberFunction.DRILLUP_LEVEL = oFF.CurrentMemberFunction.create("DrillUpLevel");
	oFF.CurrentMemberFunction.DRILLUP_MEMBER = oFF.CurrentMemberFunction.create("DrillUpMember");
	oFF.CurrentMemberFunction.HEAD = oFF.CurrentMemberFunction.create("Head");
	oFF.CurrentMemberFunction.HIERARCHIZE = oFF.CurrentMemberFunction.create("Hierarchize");
	oFF.CurrentMemberFunction.LAG = oFF.CurrentMemberFunction.create("Lag");
	oFF.CurrentMemberFunction.LAST_PERIODS = oFF.CurrentMemberFunction.create("LastPeriods");
	oFF.CurrentMemberFunction.LEAD = oFF.CurrentMemberFunction.create("Lead");
	oFF.CurrentMemberFunction.MEMBERS = oFF.CurrentMemberFunction.create("Members");
	oFF.CurrentMemberFunction.MEMBERS_ASCENDANTS_DESCENDANTS = oFF.CurrentMemberFunction.create("MembersAscendantsDescendants");
	oFF.CurrentMemberFunction.OPENING_PERIOD = oFF.CurrentMemberFunction.create("OpeningPeriod");
	oFF.CurrentMemberFunction.PARALLEL_PERIOD = oFF.CurrentMemberFunction.create("ParallelPeriod");
	oFF.CurrentMemberFunction.PERIODS_TO_DATE = oFF.CurrentMemberFunction.create("PeriodsToDate");
	oFF.CurrentMemberFunction.RANGE = oFF.CurrentMemberFunction.create("Range");
	oFF.CurrentMemberFunction.SUBSET = oFF.CurrentMemberFunction.create("SubSet");
	oFF.CurrentMemberFunction.TAIL = oFF.CurrentMemberFunction.create("Tail");
	oFF.CurrentMemberFunction.UNION = oFF.CurrentMemberFunction.create("Union");
	oFF.CurrentMemberFunction.INA_PARALLEL_PERIOD = oFF.CurrentMemberFunction.create("INAParallelPeriod");
	oFF.CurrentMemberFunction.INA_SHIFT_PERIOD = oFF.CurrentMemberFunction.create("INAShiftPeriod");
	oFF.CurrentMemberFunction.INA_TO_DATE = oFF.CurrentMemberFunction.create("INAToDate");
	oFF.CurrentMemberFunction.INA_LAST_PERIODS = oFF.CurrentMemberFunction.create("INALastPeriods");
	oFF.CurrentMemberFunction.INA_CURRENT = oFF.CurrentMemberFunction.create("INACurrent");
};
oFF.CurrentMemberFunction.create = function(name)
{
	var newConstant = oFF.XConstant.setupName(new oFF.CurrentMemberFunction(), name);
	oFF.CurrentMemberFunction.s_all.add(newConstant);
	return newConstant;
};
oFF.CurrentMemberFunction.lookup = function(name)
{
	return oFF.CurrentMemberFunction.s_all.getByKey(name);
};
oFF.CurrentMemberFunction.isToDate = function(memberFunction)
{
	return memberFunction === oFF.CurrentMemberFunction.YTD || memberFunction === oFF.CurrentMemberFunction.QTD || memberFunction === oFF.CurrentMemberFunction.MTD || memberFunction === oFF.CurrentMemberFunction.WTD || memberFunction === oFF.CurrentMemberFunction.PERIODS_TO_DATE;
};

oFF.CustomSortPosition = function() {};
oFF.CustomSortPosition.prototype = new oFF.XConstant();
oFF.CustomSortPosition.prototype._ff_c = "CustomSortPosition";

oFF.CustomSortPosition.TOP = null;
oFF.CustomSortPosition.BOTTOM = null;
oFF.CustomSortPosition.s_lookup = null;
oFF.CustomSortPosition.staticSetup = function()
{
	oFF.CustomSortPosition.s_lookup = oFF.XHashMapByString.create();
	oFF.CustomSortPosition.TOP = oFF.CustomSortPosition.createJoinCardinality("Top");
	oFF.CustomSortPosition.BOTTOM = oFF.CustomSortPosition.createJoinCardinality("Bottom");
};
oFF.CustomSortPosition.createJoinCardinality = function(name)
{
	var newConstant = oFF.XConstant.setupName(new oFF.CustomSortPosition(), name);
	oFF.CustomSortPosition.s_lookup.put(name, newConstant);
	return newConstant;
};
oFF.CustomSortPosition.lookup = function(name)
{
	return oFF.CustomSortPosition.s_lookup.getByKey(name);
};

oFF.DataEntryProcessingType = function() {};
oFF.DataEntryProcessingType.prototype = new oFF.XConstant();
oFF.DataEntryProcessingType.prototype._ff_c = "DataEntryProcessingType";

oFF.DataEntryProcessingType.FULL = null;
oFF.DataEntryProcessingType.IGNORE_AGGREGATION_TYPE = null;
oFF.DataEntryProcessingType.IGNORE_CALCULATIONS = null;
oFF.DataEntryProcessingType.staticSetup = function()
{
	oFF.DataEntryProcessingType.FULL = oFF.XConstant.setupName(new oFF.DataEntryProcessingType(), "Full");
	oFF.DataEntryProcessingType.IGNORE_AGGREGATION_TYPE = oFF.XConstant.setupName(new oFF.DataEntryProcessingType(), "IgnoreAggregationType");
	oFF.DataEntryProcessingType.IGNORE_CALCULATIONS = oFF.XConstant.setupName(new oFF.DataEntryProcessingType(), "IgnoreCalculations");
};

oFF.DateOffsetGranularity = function() {};
oFF.DateOffsetGranularity.prototype = new oFF.XConstant();
oFF.DateOffsetGranularity.prototype._ff_c = "DateOffsetGranularity";

oFF.DateOffsetGranularity.DAY = null;
oFF.DateOffsetGranularity.WEEK = null;
oFF.DateOffsetGranularity.MONTH = null;
oFF.DateOffsetGranularity.QUARTER = null;
oFF.DateOffsetGranularity.YEAR = null;
oFF.DateOffsetGranularity.s_lookup = null;
oFF.DateOffsetGranularity.staticSetup = function()
{
	oFF.DateOffsetGranularity.s_lookup = oFF.XHashMapByString.create();
	oFF.DateOffsetGranularity.DAY = oFF.DateOffsetGranularity.createDateOffsetGranularity("Day", 0, 1);
	oFF.DateOffsetGranularity.WEEK = oFF.DateOffsetGranularity.createDateOffsetGranularity("Week", 0, 7);
	oFF.DateOffsetGranularity.MONTH = oFF.DateOffsetGranularity.createDateOffsetGranularity("Month", 1, 30);
	oFF.DateOffsetGranularity.QUARTER = oFF.DateOffsetGranularity.createDateOffsetGranularity("Quarter", 3, 91);
	oFF.DateOffsetGranularity.YEAR = oFF.DateOffsetGranularity.createDateOffsetGranularity("Year", 12, 365);
};
oFF.DateOffsetGranularity.createDateOffsetGranularity = function(name, monthFactor, dayFactor)
{
	var newConstant = oFF.XConstant.setupName(new oFF.DateOffsetGranularity(), name);
	newConstant.setMonthFactor(monthFactor);
	newConstant.setDayFactor(dayFactor);
	oFF.DateOffsetGranularity.s_lookup.put(name, newConstant);
	return newConstant;
};
oFF.DateOffsetGranularity.lookup = function(name)
{
	return oFF.DateOffsetGranularity.s_lookup.getByKey(name);
};
oFF.DateOffsetGranularity.prototype.m_monthFactor = 0;
oFF.DateOffsetGranularity.prototype.m_dayFactor = 0;
oFF.DateOffsetGranularity.prototype.getMonthFactor = function()
{
	return this.m_monthFactor;
};
oFF.DateOffsetGranularity.prototype.setMonthFactor = function(monthFactor)
{
	this.m_monthFactor = monthFactor;
};
oFF.DateOffsetGranularity.prototype.getDayFactor = function()
{
	return this.m_dayFactor;
};
oFF.DateOffsetGranularity.prototype.setDayFactor = function(dayFactor)
{
	this.m_dayFactor = dayFactor;
};

oFF.DimensionSearchMode = function() {};
oFF.DimensionSearchMode.prototype = new oFF.XConstant();
oFF.DimensionSearchMode.prototype._ff_c = "DimensionSearchMode";

oFF.DimensionSearchMode.KEY = null;
oFF.DimensionSearchMode.TEXT = null;
oFF.DimensionSearchMode.RS_TEXT_FIELD = null;
oFF.DimensionSearchMode.KEY_OR_TEXT = null;
oFF.DimensionSearchMode.KEY_OR_RS_TEXT_FIELD = null;
oFF.DimensionSearchMode.staticSetup = function()
{
	oFF.DimensionSearchMode.KEY = oFF.DimensionSearchMode.create("Key");
	oFF.DimensionSearchMode.TEXT = oFF.DimensionSearchMode.create("Text");
	oFF.DimensionSearchMode.RS_TEXT_FIELD = oFF.DimensionSearchMode.create("RsTextField");
	oFF.DimensionSearchMode.KEY_OR_TEXT = oFF.DimensionSearchMode.create("KeyOrText");
	oFF.DimensionSearchMode.KEY_OR_RS_TEXT_FIELD = oFF.DimensionSearchMode.create("KeyOrRsTextField");
};
oFF.DimensionSearchMode.create = function(name)
{
	var object = new oFF.DimensionSearchMode();
	object.setupExt(name);
	return object;
};
oFF.DimensionSearchMode.prototype.setupExt = function(name)
{
	this._setupInternal(name);
};

oFF.DimensionVisibility = function() {};
oFF.DimensionVisibility.prototype = new oFF.XConstant();
oFF.DimensionVisibility.prototype._ff_c = "DimensionVisibility";

oFF.DimensionVisibility.VISIBLE = null;
oFF.DimensionVisibility.METADATA = null;
oFF.DimensionVisibility.HIDDEN = null;
oFF.DimensionVisibility.s_lookup = null;
oFF.DimensionVisibility.staticSetup = function()
{
	oFF.DimensionVisibility.s_lookup = oFF.XHashMapByString.create();
	oFF.DimensionVisibility.VISIBLE = oFF.DimensionVisibility.createDimensionVisibility("Visible");
	oFF.DimensionVisibility.METADATA = oFF.DimensionVisibility.createDimensionVisibility("Metadata");
	oFF.DimensionVisibility.HIDDEN = oFF.DimensionVisibility.createDimensionVisibility("Hidden");
};
oFF.DimensionVisibility.createDimensionVisibility = function(constant)
{
	var dv = new oFF.DimensionVisibility();
	dv._setupInternal(constant);
	oFF.DimensionVisibility.s_lookup.put(constant, dv);
	return dv;
};
oFF.DimensionVisibility.lookup = function(name)
{
	return oFF.DimensionVisibility.s_lookup.getByKey(name);
};

oFF.DisaggregationMode = function() {};
oFF.DisaggregationMode.prototype = new oFF.XConstant();
oFF.DisaggregationMode.prototype._ff_c = "DisaggregationMode";

oFF.DisaggregationMode.ABSOLUTE = null;
oFF.DisaggregationMode.COPY = null;
oFF.DisaggregationMode.DELTA = null;
oFF.DisaggregationMode.NONE = null;
oFF.DisaggregationMode.s_all = null;
oFF.DisaggregationMode.staticSetup = function()
{
	oFF.DisaggregationMode.s_all = oFF.XSetOfNameObject.create();
	oFF.DisaggregationMode.ABSOLUTE = oFF.DisaggregationMode.create("Absolute");
	oFF.DisaggregationMode.COPY = oFF.DisaggregationMode.create("Copy");
	oFF.DisaggregationMode.DELTA = oFF.DisaggregationMode.create("Delta");
	oFF.DisaggregationMode.NONE = oFF.DisaggregationMode.create("None");
};
oFF.DisaggregationMode.create = function(name)
{
	var newConstant = oFF.XConstant.setupName(new oFF.DisaggregationMode(), name);
	oFF.DisaggregationMode.s_all.add(newConstant);
	return newConstant;
};
oFF.DisaggregationMode.lookup = function(name)
{
	return oFF.DisaggregationMode.s_all.getByKey(name);
};
oFF.DisaggregationMode.lookupWithDefault = function(name, defaultValue)
{
	var mode = oFF.DisaggregationMode.s_all.getByKey(name);
	if (oFF.isNull(mode))
	{
		return defaultValue;
	}
	return mode;
};

oFF.DocumentsIdsAction = function() {};
oFF.DocumentsIdsAction.prototype = new oFF.XConstant();
oFF.DocumentsIdsAction.prototype._ff_c = "DocumentsIdsAction";

oFF.DocumentsIdsAction.CREATE = null;
oFF.DocumentsIdsAction.DELETE = null;
oFF.DocumentsIdsAction.s_all = null;
oFF.DocumentsIdsAction.staticSetup = function()
{
	oFF.DocumentsIdsAction.s_all = oFF.XSetOfNameObject.create();
	oFF.DocumentsIdsAction.CREATE = oFF.DocumentsIdsAction.create("Create");
	oFF.DocumentsIdsAction.DELETE = oFF.DocumentsIdsAction.create("Delete");
};
oFF.DocumentsIdsAction.create = function(name)
{
	var newConstant = oFF.XConstant.setupName(new oFF.DocumentsIdsAction(), name);
	oFF.DocumentsIdsAction.s_all.add(newConstant);
	return newConstant;
};

oFF.DocumentsIdsScope = function() {};
oFF.DocumentsIdsScope.prototype = new oFF.XConstant();
oFF.DocumentsIdsScope.prototype._ff_c = "DocumentsIdsScope";

oFF.DocumentsIdsScope.NONE = null;
oFF.DocumentsIdsScope.RESULT_SET_BOUND = null;
oFF.DocumentsIdsScope.SYSTEM_UNIQUE = null;
oFF.DocumentsIdsScope.s_all = null;
oFF.DocumentsIdsScope.staticSetup = function()
{
	oFF.DocumentsIdsScope.s_all = oFF.XSetOfNameObject.create();
	oFF.DocumentsIdsScope.NONE = oFF.DocumentsIdsScope.create("None");
	oFF.DocumentsIdsScope.RESULT_SET_BOUND = oFF.DocumentsIdsScope.create("ResultSetBound");
	oFF.DocumentsIdsScope.SYSTEM_UNIQUE = oFF.DocumentsIdsScope.create("SystemUnique");
};
oFF.DocumentsIdsScope.create = function(name)
{
	var newConstant = oFF.XConstant.setupName(new oFF.DocumentsIdsScope(), name);
	oFF.DocumentsIdsScope.s_all.add(newConstant);
	return newConstant;
};

oFF.DocumentsRequestAction = function() {};
oFF.DocumentsRequestAction.prototype = new oFF.XConstant();
oFF.DocumentsRequestAction.prototype._ff_c = "DocumentsRequestAction";

oFF.DocumentsRequestAction.GET = null;
oFF.DocumentsRequestAction.PUT = null;
oFF.DocumentsRequestAction.DELETE = null;
oFF.DocumentsRequestAction.s_all = null;
oFF.DocumentsRequestAction.staticSetup = function()
{
	oFF.DocumentsRequestAction.s_all = oFF.XSetOfNameObject.create();
	oFF.DocumentsRequestAction.GET = oFF.DocumentsRequestAction.create("Get");
	oFF.DocumentsRequestAction.PUT = oFF.DocumentsRequestAction.create("Put");
	oFF.DocumentsRequestAction.DELETE = oFF.DocumentsRequestAction.create("Delete");
};
oFF.DocumentsRequestAction.create = function(name)
{
	var newConstant = oFF.XConstant.setupName(new oFF.DocumentsRequestAction(), name);
	oFF.DocumentsRequestAction.s_all.add(newConstant);
	return newConstant;
};

oFF.DocumentsSupportType = function() {};
oFF.DocumentsSupportType.prototype = new oFF.XConstant();
oFF.DocumentsSupportType.prototype._ff_c = "DocumentsSupportType";

oFF.DocumentsSupportType.NONE = null;
oFF.DocumentsSupportType.READ = null;
oFF.DocumentsSupportType.READ_WRITE = null;
oFF.DocumentsSupportType.s_all = null;
oFF.DocumentsSupportType.staticSetup = function()
{
	oFF.DocumentsSupportType.s_all = oFF.XSetOfNameObject.create();
	oFF.DocumentsSupportType.NONE = oFF.DocumentsSupportType.create("None");
	oFF.DocumentsSupportType.READ = oFF.DocumentsSupportType.create("Read");
	oFF.DocumentsSupportType.READ_WRITE = oFF.DocumentsSupportType.create("ReadWrite");
};
oFF.DocumentsSupportType.create = function(name)
{
	var newConstant = oFF.XConstant.setupName(new oFF.DocumentsSupportType(), name);
	oFF.DocumentsSupportType.s_all.add(newConstant);
	return newConstant;
};

oFF.DrillState = function() {};
oFF.DrillState.prototype = new oFF.XConstant();
oFF.DrillState.prototype._ff_c = "DrillState";

oFF.DrillState.EXPANDED = null;
oFF.DrillState.COLLAPSED = null;
oFF.DrillState.LEAF = null;
oFF.DrillState.LEAF_DRILLDOWN_ALLOWED = null;
oFF.DrillState.LEAF_UDH = null;
oFF.DrillState.LEAF_UDH_EXPAND_ALLOWED = null;
oFF.DrillState.COLLAPSED_EXPAND_AND_DRILLDOWN_ALLOWED = null;
oFF.DrillState.DRILL_DOWN = null;
oFF.DrillState.DRILLED = null;
oFF.DrillState.staticSetup = function()
{
	oFF.DrillState.EXPANDED = oFF.DrillState.create("Expanded", false);
	oFF.DrillState.COLLAPSED = oFF.DrillState.create("Collapsed", false);
	oFF.DrillState.LEAF = oFF.DrillState.create("Leaf", false);
	oFF.DrillState.LEAF_DRILLDOWN_ALLOWED = oFF.DrillState.create("LeafDrilldownAllowed", true);
	oFF.DrillState.LEAF_UDH = oFF.DrillState.create("LeafUDH", true);
	oFF.DrillState.LEAF_UDH_EXPAND_ALLOWED = oFF.DrillState.create("LeafUDHExpandAllowed", true);
	oFF.DrillState.COLLAPSED_EXPAND_AND_DRILLDOWN_ALLOWED = oFF.DrillState.create("CollapsedExpandDrilldownAllowed", true);
	oFF.DrillState.DRILL_DOWN = oFF.DrillState.create("DrillDown", true);
	oFF.DrillState.DRILLED = oFF.DrillState.create("Drilled", true);
};
oFF.DrillState.create = function(name, isOnlyForUdh)
{
	var drillState = oFF.XConstant.setupName(new oFF.DrillState(), name);
	drillState.m_isOnlyForUdh = isOnlyForUdh;
	return drillState;
};
oFF.DrillState.prototype.m_isOnlyForUdh = false;
oFF.DrillState.prototype.isOnlyForUdh = function()
{
	return this.m_isOnlyForUdh;
};

oFF.ExceptionSetting = function() {};
oFF.ExceptionSetting.prototype = new oFF.XConstant();
oFF.ExceptionSetting.prototype._ff_c = "ExceptionSetting";

oFF.ExceptionSetting.ALERT_LEVEL = null;
oFF.ExceptionSetting.NUMERIC_PRECISION = null;
oFF.ExceptionSetting.NUMERIC_SCALE = null;
oFF.ExceptionSetting.NUMERIC_SHIFT = null;
oFF.ExceptionSetting.POSTFIX = null;
oFF.ExceptionSetting.PREFIX = null;
oFF.ExceptionSetting.SIGN_INVERSION = null;
oFF.ExceptionSetting.s_all = null;
oFF.ExceptionSetting.staticSetup = function()
{
	oFF.ExceptionSetting.s_all = oFF.XHashMapByString.create();
	oFF.ExceptionSetting.ALERT_LEVEL = oFF.ExceptionSetting.create("$$AlertLevel$$");
	oFF.ExceptionSetting.NUMERIC_PRECISION = oFF.ExceptionSetting.create("$$NumericPrecision$$");
	oFF.ExceptionSetting.NUMERIC_SCALE = oFF.ExceptionSetting.create("$$NumericScale$$");
	oFF.ExceptionSetting.NUMERIC_SHIFT = oFF.ExceptionSetting.create("$$NumericShift$$");
	oFF.ExceptionSetting.POSTFIX = oFF.ExceptionSetting.create("$$Postfix$$");
	oFF.ExceptionSetting.PREFIX = oFF.ExceptionSetting.create("$$Prefix$$");
	oFF.ExceptionSetting.SIGN_INVERSION = oFF.ExceptionSetting.create("$$SignInversion$$");
};
oFF.ExceptionSetting.create = function(name)
{
	var setting = oFF.XConstant.setupName(new oFF.ExceptionSetting(), name);
	oFF.ExceptionSetting.s_all.put(name, setting);
	return setting;
};
oFF.ExceptionSetting.getByName = function(name)
{
	return oFF.ExceptionSetting.s_all.getByKey(name);
};

oFF.ExecutionEngine = function() {};
oFF.ExecutionEngine.prototype = new oFF.XConstant();
oFF.ExecutionEngine.prototype._ff_c = "ExecutionEngine";

oFF.ExecutionEngine.SQL = null;
oFF.ExecutionEngine.MDS = null;
oFF.ExecutionEngine.CALC_ENGINE = null;
oFF.ExecutionEngine.s_lookupNames = null;
oFF.ExecutionEngine.staticSetup = function()
{
	oFF.ExecutionEngine.s_lookupNames = oFF.XHashMapByString.create();
	oFF.ExecutionEngine.SQL = oFF.ExecutionEngine.create("SQL");
	oFF.ExecutionEngine.MDS = oFF.ExecutionEngine.create("MDS");
	oFF.ExecutionEngine.CALC_ENGINE = oFF.ExecutionEngine.create("CE");
};
oFF.ExecutionEngine.create = function(name)
{
	var newObj = oFF.XConstant.setupName(new oFF.ExecutionEngine(), name);
	oFF.ExecutionEngine.s_lookupNames.put(name, newObj);
	return newObj;
};
oFF.ExecutionEngine.lookupName = function(name)
{
	return oFF.ExecutionEngine.s_lookupNames.getByKey(name);
};

oFF.FieldLayoutType = function() {};
oFF.FieldLayoutType.prototype = new oFF.XConstant();
oFF.FieldLayoutType.prototype._ff_c = "FieldLayoutType";

oFF.FieldLayoutType.FIELD_BASED = null;
oFF.FieldLayoutType.ATTRIBUTE_BASED = null;
oFF.FieldLayoutType.ATTRIBUTES_AND_PRESENTATIONS = null;
oFF.FieldLayoutType.staticSetup = function()
{
	oFF.FieldLayoutType.FIELD_BASED = oFF.XConstant.setupName(new oFF.FieldLayoutType(), "FieldBased");
	oFF.FieldLayoutType.ATTRIBUTE_BASED = oFF.XConstant.setupName(new oFF.FieldLayoutType(), "AttributeBased");
	oFF.FieldLayoutType.ATTRIBUTES_AND_PRESENTATIONS = oFF.XConstant.setupName(new oFF.FieldLayoutType(), "AttributesAndPresentations");
};

oFF.FieldUsageType = function() {};
oFF.FieldUsageType.prototype = new oFF.XConstant();
oFF.FieldUsageType.prototype._ff_c = "FieldUsageType";

oFF.FieldUsageType.HIERARCHY = null;
oFF.FieldUsageType.FLAT = null;
oFF.FieldUsageType.ALL = null;
oFF.FieldUsageType.s_lookup = null;
oFF.FieldUsageType.staticSetup = function()
{
	oFF.FieldUsageType.s_lookup = oFF.XHashMapByString.create();
	oFF.FieldUsageType.HIERARCHY = oFF.FieldUsageType.create("Hierarchy");
	oFF.FieldUsageType.FLAT = oFF.FieldUsageType.create("Flat");
	oFF.FieldUsageType.ALL = oFF.FieldUsageType.create("All");
};
oFF.FieldUsageType.create = function(name)
{
	var pt = oFF.XConstant.setupName(new oFF.FieldUsageType(), name);
	oFF.FieldUsageType.s_lookup.put(name, pt);
	return pt;
};
oFF.FieldUsageType.lookup = function(name)
{
	return oFF.FieldUsageType.s_lookup.getByKey(name);
};

oFF.FilterLayer = function() {};
oFF.FilterLayer.prototype = new oFF.XConstant();
oFF.FilterLayer.prototype._ff_c = "FilterLayer";

oFF.FilterLayer.ALL = null;
oFF.FilterLayer.FIXED = null;
oFF.FilterLayer.DYNAMIC = null;
oFF.FilterLayer.VISIBILITY = null;
oFF.FilterLayer.EXTERNAL = null;
oFF.FilterLayer.staticSetup = function()
{
	oFF.FilterLayer.ALL = oFF.XConstant.setupName(new oFF.FilterLayer(), "All");
	oFF.FilterLayer.FIXED = oFF.XConstant.setupName(new oFF.FilterLayer(), "Fixed");
	oFF.FilterLayer.DYNAMIC = oFF.XConstant.setupName(new oFF.FilterLayer(), "Dynamic");
	oFF.FilterLayer.VISIBILITY = oFF.XConstant.setupName(new oFF.FilterLayer(), "Visibility");
	oFF.FilterLayer.EXTERNAL = oFF.XConstant.setupName(new oFF.FilterLayer(), "External");
};

oFF.FilterScopeVariables = function() {};
oFF.FilterScopeVariables.prototype = new oFF.XConstant();
oFF.FilterScopeVariables.prototype._ff_c = "FilterScopeVariables";

oFF.FilterScopeVariables.IGNORE = null;
oFF.FilterScopeVariables.NOT_AFFECTED_BY_VARIABLES = null;
oFF.FilterScopeVariables.NOT_CREATED_BY_VARIABLES = null;
oFF.FilterScopeVariables.staticSetup = function()
{
	oFF.FilterScopeVariables.IGNORE = oFF.XConstant.setupName(new oFF.FilterScopeVariables(), "Fixed");
	oFF.FilterScopeVariables.NOT_AFFECTED_BY_VARIABLES = oFF.XConstant.setupName(new oFF.FilterScopeVariables(), "NotAffectedByVariables");
	oFF.FilterScopeVariables.NOT_CREATED_BY_VARIABLES = oFF.XConstant.setupName(new oFF.FilterScopeVariables(), "NotCreatedByVariables");
};

oFF.FrameEndType = function() {};
oFF.FrameEndType.prototype = new oFF.XConstant();
oFF.FrameEndType.prototype._ff_c = "FrameEndType";

oFF.FrameEndType.UNBOUNDED_FOLLOWING = null;
oFF.FrameEndType.CURRENT_ROW = null;
oFF.FrameEndType.FOLLOWING = null;
oFF.FrameEndType.s_instances = null;
oFF.FrameEndType.staticSetup = function()
{
	oFF.FrameEndType.s_instances = oFF.XHashMapByString.create();
	oFF.FrameEndType.UNBOUNDED_FOLLOWING = oFF.FrameEndType.create("UNBOUNDED FOLLOWING");
	oFF.FrameEndType.CURRENT_ROW = oFF.FrameEndType.create("CURRENT ROW");
	oFF.FrameEndType.FOLLOWING = oFF.FrameEndType.create("FOLLOWING");
};
oFF.FrameEndType.create = function(name)
{
	var directionType = oFF.XConstant.setupName(new oFF.FrameEndType(), name);
	oFF.FrameEndType.s_instances.put(name, directionType);
	return directionType;
};
oFF.FrameEndType.lookup = function(name)
{
	return oFF.FrameEndType.s_instances.getByKey(name);
};

oFF.FrameStartType = function() {};
oFF.FrameStartType.prototype = new oFF.XConstant();
oFF.FrameStartType.prototype._ff_c = "FrameStartType";

oFF.FrameStartType.UNBOUNDED_PRECEDING = null;
oFF.FrameStartType.CURRENT_ROW = null;
oFF.FrameStartType.PRECEDING = null;
oFF.FrameStartType.s_instances = null;
oFF.FrameStartType.staticSetup = function()
{
	oFF.FrameStartType.s_instances = oFF.XHashMapByString.create();
	oFF.FrameStartType.UNBOUNDED_PRECEDING = oFF.FrameStartType.create("UNBOUNDED PRECEDING");
	oFF.FrameStartType.CURRENT_ROW = oFF.FrameStartType.create("CURRENT ROW");
	oFF.FrameStartType.PRECEDING = oFF.FrameStartType.create("PRECEDING");
};
oFF.FrameStartType.create = function(name)
{
	var directionType = oFF.XConstant.setupName(new oFF.FrameStartType(), name);
	oFF.FrameStartType.s_instances.put(name, directionType);
	return directionType;
};
oFF.FrameStartType.lookup = function(name)
{
	return oFF.FrameStartType.s_instances.getByKey(name);
};

oFF.HierarchyLevelType = function() {};
oFF.HierarchyLevelType.prototype = new oFF.XConstant();
oFF.HierarchyLevelType.prototype._ff_c = "HierarchyLevelType";

oFF.HierarchyLevelType.REGULAR = null;
oFF.HierarchyLevelType.ALL = null;
oFF.HierarchyLevelType.TIME_YEAR = null;
oFF.HierarchyLevelType.TIME_HALF_YEAR = null;
oFF.HierarchyLevelType.TIME_QUARTER = null;
oFF.HierarchyLevelType.TIME_MONTH = null;
oFF.HierarchyLevelType.TIME_WEEK = null;
oFF.HierarchyLevelType.TIME_DAY = null;
oFF.HierarchyLevelType.TIME_HOUR = null;
oFF.HierarchyLevelType.TIME_MINUTE = null;
oFF.HierarchyLevelType.TIME_SECOND = null;
oFF.HierarchyLevelType.s_lookup = null;
oFF.HierarchyLevelType.staticSetup = function()
{
	oFF.HierarchyLevelType.s_lookup = oFF.XSetOfNameObject.create();
	oFF.HierarchyLevelType.REGULAR = oFF.HierarchyLevelType.create("Regular", 0);
	oFF.HierarchyLevelType.ALL = oFF.HierarchyLevelType.create("All", 1);
	oFF.HierarchyLevelType.TIME_YEAR = oFF.HierarchyLevelType.create("TIME_YEAR", 2);
	oFF.HierarchyLevelType.TIME_HALF_YEAR = oFF.HierarchyLevelType.create("TIME_HALF_YEAR", 3);
	oFF.HierarchyLevelType.TIME_QUARTER = oFF.HierarchyLevelType.create("TIME_QUARTAL", 4);
	oFF.HierarchyLevelType.TIME_MONTH = oFF.HierarchyLevelType.create("TIME_MONTH", 5);
	oFF.HierarchyLevelType.TIME_WEEK = oFF.HierarchyLevelType.create("TIME_WEEK", 6);
	oFF.HierarchyLevelType.TIME_DAY = oFF.HierarchyLevelType.create("TIME_DAY", 7);
	oFF.HierarchyLevelType.TIME_HOUR = oFF.HierarchyLevelType.create("TIME_HOUR", 8);
	oFF.HierarchyLevelType.TIME_MINUTE = oFF.HierarchyLevelType.create("TIME_MINUTE", 9);
	oFF.HierarchyLevelType.TIME_SECOND = oFF.HierarchyLevelType.create("TIME_SECOND", 10);
};
oFF.HierarchyLevelType.create = function(name, levelIndex)
{
	var newConstant = oFF.XConstant.setupName(new oFF.HierarchyLevelType(), name);
	newConstant.m_levelIndex = levelIndex;
	oFF.HierarchyLevelType.s_lookup.add(newConstant);
	return newConstant;
};
oFF.HierarchyLevelType.lookup = function(name)
{
	return oFF.HierarchyLevelType.s_lookup.getByKey(name);
};
oFF.HierarchyLevelType.getHighestDateRangeGranularity = function(dimension)
{
	if (oFF.notNull(dimension) && (dimension.getDimensionType() === oFF.DimensionType.TIME || dimension.getDimensionType() === oFF.DimensionType.DATE))
	{
		var hierarchies = dimension.getLeveledHierarchies();
		if (oFF.XCollectionUtils.hasElements(hierarchies))
		{
			var mostGranularLevel = oFF.HierarchyLevelType.getMostGranularLevel(hierarchies);
			if (mostGranularLevel === oFF.HierarchyLevelType.TIME_YEAR)
			{
				return oFF.DateRangeGranularity.YEAR;
			}
			if (mostGranularLevel === oFF.HierarchyLevelType.TIME_QUARTER)
			{
				return oFF.DateRangeGranularity.QUARTER;
			}
			if (mostGranularLevel === oFF.HierarchyLevelType.TIME_MONTH)
			{
				return oFF.DateRangeGranularity.MONTH;
			}
			if (mostGranularLevel === oFF.HierarchyLevelType.TIME_DAY)
			{
				return oFF.DateRangeGranularity.DAY;
			}
		}
	}
	return null;
};
oFF.HierarchyLevelType.getMostGranularLevel = function(hierarchies)
{
	return oFF.XStream.of(hierarchies).map( function(hierarchy){
		return hierarchy.getMostGranularLevel();
	}.bind(this)).filterNullValues().map( function(hierachyLevel){
		return hierachyLevel.getLevelType();
	}.bind(this)).filterNullValues().reduce(oFF.HierarchyLevelType.REGULAR,  function(first, second){
		return first.getLevelIndex() > second.getLevelIndex() ? first : second;
	}.bind(this));
};
oFF.HierarchyLevelType.prototype.m_levelIndex = 0;
oFF.HierarchyLevelType.prototype.getLevelIndex = function()
{
	return this.m_levelIndex;
};

oFF.InfoObjectType = function() {};
oFF.InfoObjectType.prototype = new oFF.XConstant();
oFF.InfoObjectType.prototype._ff_c = "InfoObjectType";

oFF.InfoObjectType.CHA = null;
oFF.InfoObjectType.KYF = null;
oFF.InfoObjectType.TIM = null;
oFF.InfoObjectType.UNI = null;
oFF.InfoObjectType.DPA = null;
oFF.InfoObjectType.ATR = null;
oFF.InfoObjectType.MTA = null;
oFF.InfoObjectType.XXL = null;
oFF.InfoObjectType.ALL = null;
oFF.InfoObjectType.staticSetupInfoObject = function()
{
	oFF.InfoObjectType.CHA = oFF.XConstant.setupName(new oFF.InfoObjectType(), "CHA");
	oFF.InfoObjectType.KYF = oFF.XConstant.setupName(new oFF.InfoObjectType(), "KYF");
	oFF.InfoObjectType.TIM = oFF.XConstant.setupName(new oFF.InfoObjectType(), "TIM");
	oFF.InfoObjectType.UNI = oFF.XConstant.setupName(new oFF.InfoObjectType(), "UNI");
	oFF.InfoObjectType.DPA = oFF.XConstant.setupName(new oFF.InfoObjectType(), "DPA");
	oFF.InfoObjectType.ATR = oFF.XConstant.setupName(new oFF.InfoObjectType(), "ATR");
	oFF.InfoObjectType.MTA = oFF.XConstant.setupName(new oFF.InfoObjectType(), "MTA");
	oFF.InfoObjectType.XXL = oFF.XConstant.setupName(new oFF.InfoObjectType(), "XXL");
	oFF.InfoObjectType.ALL = oFF.XConstant.setupName(new oFF.InfoObjectType(), "ALL");
};

oFF.InitCacheOption = function() {};
oFF.InitCacheOption.prototype = new oFF.XConstant();
oFF.InitCacheOption.prototype._ff_c = "InitCacheOption";

oFF.InitCacheOption.OFF = null;
oFF.InitCacheOption.CREATE_ON_INVALID_HASH = null;
oFF.InitCacheOption.staticSetup = function()
{
	oFF.InitCacheOption.OFF = oFF.XConstant.setupName(new oFF.InitCacheOption(), "Off");
	oFF.InitCacheOption.CREATE_ON_INVALID_HASH = oFF.XConstant.setupName(new oFF.InitCacheOption(), "CreateOnInvalidHash");
};

oFF.InputReadinessType = function() {};
oFF.InputReadinessType.prototype = new oFF.XConstant();
oFF.InputReadinessType.prototype._ff_c = "InputReadinessType";

oFF.InputReadinessType.INPUT_ENABLED = null;
oFF.InputReadinessType.PUBLIC_VERSION = null;
oFF.InputReadinessType.INACTIVE_VERSION = null;
oFF.InputReadinessType.NON_PLANNABLE_EXCEPTION_AGGREGATION_RESULT = null;
oFF.InputReadinessType.MISSING_INVERSE_FORMULA = null;
oFF.InputReadinessType.CURRENT_MEMBER_NAVIGATION = null;
oFF.InputReadinessType.UNSUPPORTED_POST_AGGREGATION_TYPE = null;
oFF.InputReadinessType.UNSUPPORTED_AGGREGATION_EXCEPTION_AGGREGATION_COMBINATION = null;
oFF.InputReadinessType.UNSUPPORTED_EXCEPTION_AGGREGATION_TYPE = null;
oFF.InputReadinessType.UNSUPPORTED_AGGREGATION_TYPE = null;
oFF.InputReadinessType.EXCEPTION_AGGREGATION_ON_FORMULA = null;
oFF.InputReadinessType.CALCULATION_BEFORE_AGGREGATION = null;
oFF.InputReadinessType.AGGREGATE_OF_DIFFERENT_VERSIONS = null;
oFF.InputReadinessType.HAS_CHILDREN_WITH_DIFFERENT_FEATURES = null;
oFF.InputReadinessType.HAS_EPM_EXCEPTION = null;
oFF.InputReadinessType.NO_ACTION_AVAILABLE = null;
oFF.InputReadinessType.UNBOOKED = null;
oFF.InputReadinessType.BLENDING_RESULT = null;
oFF.InputReadinessType.UNSUPPORTED_VALUE_TYPE = null;
oFF.InputReadinessType.NO_VERSION = null;
oFF.InputReadinessType.PLANNING_DISABLED = null;
oFF.InputReadinessType.UNSUPPORTED_CALCULATION_STEP = null;
oFF.InputReadinessType.QUERY_HAS_CALCULATED_DIMENSION = null;
oFF.InputReadinessType.NESTED_FORMULA = null;
oFF.InputReadinessType.QUERY_HAS_MEASURE_BASED_CALCULATED_DIMENSION = null;
oFF.InputReadinessType.UNBOOKED_NAVIGATIONAL_ATTRIBUTE_ON_AXIS = null;
oFF.InputReadinessType.s_instances = null;
oFF.InputReadinessType.staticSetup = function()
{
	oFF.InputReadinessType.s_instances = oFF.XHashMapByString.create();
	oFF.InputReadinessType.INPUT_ENABLED = oFF.InputReadinessType.create("InputEnabled", "IE");
	oFF.InputReadinessType.PUBLIC_VERSION = oFF.InputReadinessType.create("PublicVersion", "PV");
	oFF.InputReadinessType.INACTIVE_VERSION = oFF.InputReadinessType.create("InactiveVersion", "IV");
	oFF.InputReadinessType.NON_PLANNABLE_EXCEPTION_AGGREGATION_RESULT = oFF.InputReadinessType.create("NonPlannableExceptionAggregationResult", "NPEAR");
	oFF.InputReadinessType.MISSING_INVERSE_FORMULA = oFF.InputReadinessType.create("MissingInverseFormula", "MIF");
	oFF.InputReadinessType.CURRENT_MEMBER_NAVIGATION = oFF.InputReadinessType.create("CurrentMemberNavigation", "CMN");
	oFF.InputReadinessType.UNSUPPORTED_POST_AGGREGATION_TYPE = oFF.InputReadinessType.create("UnsupportedPostAggregationType", "UPT");
	oFF.InputReadinessType.UNSUPPORTED_AGGREGATION_EXCEPTION_AGGREGATION_COMBINATION = oFF.InputReadinessType.create("UnsupportedAggregationExceptionAggregationCombination", "UAEAC");
	oFF.InputReadinessType.UNSUPPORTED_EXCEPTION_AGGREGATION_TYPE = oFF.InputReadinessType.create("UnsupportedExceptionAggregationType", "UEAT");
	oFF.InputReadinessType.UNSUPPORTED_AGGREGATION_TYPE = oFF.InputReadinessType.create("UnsupportedAggregationType", "UAT");
	oFF.InputReadinessType.EXCEPTION_AGGREGATION_ON_FORMULA = oFF.InputReadinessType.create("ExceptionAggregationOnFormula", "AEOF");
	oFF.InputReadinessType.CALCULATION_BEFORE_AGGREGATION = oFF.InputReadinessType.create("CalculationBeforeAggregation", "CBA");
	oFF.InputReadinessType.AGGREGATE_OF_DIFFERENT_VERSIONS = oFF.InputReadinessType.create("AggregateOfDifferentVersions", "ADV");
	oFF.InputReadinessType.HAS_CHILDREN_WITH_DIFFERENT_FEATURES = oFF.InputReadinessType.create("HasChildrenWithDifferentFeatures", "HCWDF");
	oFF.InputReadinessType.HAS_EPM_EXCEPTION = oFF.InputReadinessType.create("HasEPMException", "HEE");
	oFF.InputReadinessType.NO_ACTION_AVAILABLE = oFF.InputReadinessType.create("NoActionAvailable", "NAA");
	oFF.InputReadinessType.UNBOOKED = oFF.InputReadinessType.create("Unbooked", "U");
	oFF.InputReadinessType.BLENDING_RESULT = oFF.InputReadinessType.create("BlendingResult", "BR");
	oFF.InputReadinessType.UNSUPPORTED_VALUE_TYPE = oFF.InputReadinessType.create("UnsupportedValueType", "UVT");
	oFF.InputReadinessType.NO_VERSION = oFF.InputReadinessType.create("NoVersion", "NV");
	oFF.InputReadinessType.PLANNING_DISABLED = oFF.InputReadinessType.create("PlanningDisabled", "PD");
	oFF.InputReadinessType.UNSUPPORTED_CALCULATION_STEP = oFF.InputReadinessType.create("UnsupportedCalculationStep", "UCS");
	oFF.InputReadinessType.QUERY_HAS_CALCULATED_DIMENSION = oFF.InputReadinessType.create("QueryHasCalculatedDimension", "QHCD");
	oFF.InputReadinessType.NESTED_FORMULA = oFF.InputReadinessType.create("NestedFormula", "NF");
	oFF.InputReadinessType.QUERY_HAS_MEASURE_BASED_CALCULATED_DIMENSION = oFF.InputReadinessType.create("QueryHasMeasureBasedCalculatedDimension", "QHMBCD");
	oFF.InputReadinessType.UNBOOKED_NAVIGATIONAL_ATTRIBUTE_ON_AXIS = oFF.InputReadinessType.create("UnbookedCellWithNavigationalAttributeOnAxis", "UNA");
};
oFF.InputReadinessType.create = function(name, shortcut)
{
	var flag = oFF.XConstant.setupName(new oFF.InputReadinessType(), name);
	flag.m_shortcut = shortcut;
	oFF.InputReadinessType.s_instances.put(name, flag);
	return flag;
};
oFF.InputReadinessType.get = function(name)
{
	return oFF.InputReadinessType.s_instances.getByKey(name);
};
oFF.InputReadinessType.getOrCreate = function(name)
{
	if (oFF.XStringUtils.isNullOrEmpty(name))
	{
		return null;
	}
	var readinessType = oFF.InputReadinessType.get(name);
	return oFF.notNull(readinessType) ? readinessType : oFF.InputReadinessType.create(name, name);
};
oFF.InputReadinessType.prototype.m_shortcut = null;
oFF.InputReadinessType.prototype.getShortcut = function()
{
	return this.m_shortcut;
};

oFF.JoinCardinality = function() {};
oFF.JoinCardinality.prototype = new oFF.XConstant();
oFF.JoinCardinality.prototype._ff_c = "JoinCardinality";

oFF.JoinCardinality.ONE_ONE = null;
oFF.JoinCardinality.N_ONE = null;
oFF.JoinCardinality.N_N = null;
oFF.JoinCardinality.ONE_N = null;
oFF.JoinCardinality.s_lookup = null;
oFF.JoinCardinality.staticSetup = function()
{
	oFF.JoinCardinality.s_lookup = oFF.XHashMapByString.create();
	oFF.JoinCardinality.ONE_ONE = oFF.JoinCardinality.createJoinCardinality("1_1");
	oFF.JoinCardinality.N_ONE = oFF.JoinCardinality.createJoinCardinality("N_1");
	oFF.JoinCardinality.N_N = oFF.JoinCardinality.createJoinCardinality("N_N");
	oFF.JoinCardinality.ONE_N = oFF.JoinCardinality.createJoinCardinality("1_N");
};
oFF.JoinCardinality.createJoinCardinality = function(name)
{
	var newConstant = oFF.XConstant.setupName(new oFF.JoinCardinality(), name);
	oFF.JoinCardinality.s_lookup.put(name, newConstant);
	return newConstant;
};
oFF.JoinCardinality.lookup = function(name)
{
	return oFF.JoinCardinality.s_lookup.getByKey(name);
};

oFF.LinePatternType = function() {};
oFF.LinePatternType.prototype = new oFF.XConstant();
oFF.LinePatternType.prototype._ff_c = "LinePatternType";

oFF.LinePatternType.s_instances = null;
oFF.LinePatternType.HATCHIING_1 = null;
oFF.LinePatternType.HATCHIING_2 = null;
oFF.LinePatternType.HATCHIING_3 = null;
oFF.LinePatternType.HATCHIING_4 = null;
oFF.LinePatternType.HATCHIING_5 = null;
oFF.LinePatternType.HATCHIING_6 = null;
oFF.LinePatternType.HATCHIING_7 = null;
oFF.LinePatternType.HATCHIING_8 = null;
oFF.LinePatternType.NOFILL = null;
oFF.LinePatternType.SOLID = null;
oFF.LinePatternType.BACKGROUND_IMAGE = null;
oFF.LinePatternType.WHITE_FILL = null;
oFF.LinePatternType.INHERIT = null;
oFF.LinePatternType.staticSetup = function()
{
	oFF.LinePatternType.s_instances = oFF.XHashMapByString.create();
	oFF.LinePatternType.HATCHIING_1 = oFF.LinePatternType.create("Hatching1");
	oFF.LinePatternType.HATCHIING_2 = oFF.LinePatternType.create("Hatching2");
	oFF.LinePatternType.HATCHIING_3 = oFF.LinePatternType.create("Hatching3");
	oFF.LinePatternType.HATCHIING_4 = oFF.LinePatternType.create("Hatching4");
	oFF.LinePatternType.HATCHIING_5 = oFF.LinePatternType.create("Hatching5");
	oFF.LinePatternType.HATCHIING_6 = oFF.LinePatternType.create("Hatching6");
	oFF.LinePatternType.HATCHIING_7 = oFF.LinePatternType.create("Hatching7");
	oFF.LinePatternType.HATCHIING_8 = oFF.LinePatternType.create("Hatching8");
	oFF.LinePatternType.NOFILL = oFF.LinePatternType.create("Nofill");
	oFF.LinePatternType.SOLID = oFF.LinePatternType.create("Solid");
	oFF.LinePatternType.BACKGROUND_IMAGE = oFF.LinePatternType.create("BackgroundImage");
	oFF.LinePatternType.WHITE_FILL = oFF.LinePatternType.create("WhiteFill");
	oFF.LinePatternType.INHERIT = oFF.LinePatternType.create("Inherit");
};
oFF.LinePatternType.create = function(name)
{
	var object = oFF.XConstant.setupName(new oFF.LinePatternType(), name);
	oFF.LinePatternType.s_instances.put(name, object);
	return object;
};
oFF.LinePatternType.lookup = function(name)
{
	return oFF.LinePatternType.s_instances.getByKey(name);
};

oFF.LocalityType = function() {};
oFF.LocalityType.prototype = new oFF.XConstant();
oFF.LocalityType.prototype._ff_c = "LocalityType";

oFF.LocalityType.CENTRAL = null;
oFF.LocalityType.LOCAL = null;
oFF.LocalityType.staticSetupLocality = function()
{
	oFF.LocalityType.CENTRAL = oFF.XConstant.setupName(new oFF.LocalityType(), "C");
	oFF.LocalityType.LOCAL = oFF.XConstant.setupName(new oFF.LocalityType(), "L");
};
oFF.LocalityType.getLocalityType = function(type)
{
	if (oFF.XString.isEqual(oFF.LocalityType.CENTRAL.getName(), type))
	{
		return oFF.LocalityType.CENTRAL;
	}
	else if (oFF.XString.isEqual(oFF.LocalityType.LOCAL.getName(), type))
	{
		return oFF.LocalityType.LOCAL;
	}
	return null;
};

oFF.LocationType = function() {};
oFF.LocationType.prototype = new oFF.XConstant();
oFF.LocationType.prototype._ff_c = "LocationType";

oFF.LocationType.AREA = null;
oFF.LocationType.LATLONG = null;
oFF.LocationType.s_lookup = null;
oFF.LocationType.staticSetup = function()
{
	oFF.LocationType.s_lookup = oFF.XHashMapByString.create();
	oFF.LocationType.AREA = oFF.LocationType.createLocationType("area");
	oFF.LocationType.LATLONG = oFF.LocationType.createLocationType("latlong");
};
oFF.LocationType.createLocationType = function(name)
{
	var newConstant = oFF.XConstant.setupName(new oFF.LocationType(), name);
	oFF.LocationType.s_lookup.put(name, newConstant);
	return newConstant;
};
oFF.LocationType.lookup = function(name)
{
	return oFF.LocationType.s_lookup.getByKey(name);
};

oFF.MemberNavigationType = function() {};
oFF.MemberNavigationType.prototype = new oFF.XConstant();
oFF.MemberNavigationType.prototype._ff_c = "MemberNavigationType";

oFF.MemberNavigationType.FUNCTION_PARAM_CONSTANT = null;
oFF.MemberNavigationType.FUNCTION_PARAM_LEVEL = null;
oFF.MemberNavigationType.FUNCTION_PARAM_MEMBER = null;
oFF.MemberNavigationType.FUNCTION_PARAM_NO_VALUES_ABOVE_LEVEL = null;
oFF.MemberNavigationType.FUNCTION_PARAM_ERROR_ABOVE_LEVEL = null;
oFF.MemberNavigationType.FUNCTION_PARAM_SHIFT = null;
oFF.MemberNavigationType.FUNCTION_PARAM_RANGE = null;
oFF.MemberNavigationType.s_lookup = null;
oFF.MemberNavigationType.staticSetup = function()
{
	oFF.MemberNavigationType.s_lookup = oFF.XHashMapByString.create();
	oFF.MemberNavigationType.FUNCTION_PARAM_CONSTANT = oFF.MemberNavigationType.createMemberNavigationType("Constant");
	oFF.MemberNavigationType.FUNCTION_PARAM_LEVEL = oFF.MemberNavigationType.createMemberNavigationType("Level");
	oFF.MemberNavigationType.FUNCTION_PARAM_MEMBER = oFF.MemberNavigationType.createMemberNavigationType("Member");
	oFF.MemberNavigationType.FUNCTION_PARAM_NO_VALUES_ABOVE_LEVEL = oFF.MemberNavigationType.createMemberNavigationType("NoValuesAboveLevel");
	oFF.MemberNavigationType.FUNCTION_PARAM_ERROR_ABOVE_LEVEL = oFF.MemberNavigationType.createMemberNavigationType("ErrorAboveLevel");
	oFF.MemberNavigationType.FUNCTION_PARAM_SHIFT = oFF.MemberNavigationType.createMemberNavigationType("Shift");
	oFF.MemberNavigationType.FUNCTION_PARAM_RANGE = oFF.MemberNavigationType.createMemberNavigationType("Range");
};
oFF.MemberNavigationType.createMemberNavigationType = function(name)
{
	var newConstant = oFF.XConstant.setupName(new oFF.MemberNavigationType(), name);
	oFF.MemberNavigationType.s_lookup.put(name, newConstant);
	return newConstant;
};
oFF.MemberNavigationType.lookup = function(name)
{
	return oFF.MemberNavigationType.s_lookup.getByKey(name);
};

oFF.MetaObjectType = function() {};
oFF.MetaObjectType.prototype = new oFF.XConstant();
oFF.MetaObjectType.prototype._ff_c = "MetaObjectType";

oFF.MetaObjectType.QUERY = null;
oFF.MetaObjectType.QUERY_VALUEHELP = null;
oFF.MetaObjectType.QUERY_VALUEHELP_DESIGNTIME = null;
oFF.MetaObjectType.DEFAULT_PLAN_QUERY = null;
oFF.MetaObjectType.DEFAULT_REPORT_QUERY = null;
oFF.MetaObjectType.LOCAL_QUERY = null;
oFF.MetaObjectType.QUERY_VIEW = null;
oFF.MetaObjectType.INFOPROVIDER = null;
oFF.MetaObjectType.DBVIEW = null;
oFF.MetaObjectType.CATEGORY = null;
oFF.MetaObjectType.CONNECTOR = null;
oFF.MetaObjectType.CATALOG_VIEW = null;
oFF.MetaObjectType.CATALOG_VIEW_2 = null;
oFF.MetaObjectType.WORKSTATUS = null;
oFF.MetaObjectType.PLANNING = null;
oFF.MetaObjectType.PLANNING_VALUEHELP = null;
oFF.MetaObjectType.CUBE = null;
oFF.MetaObjectType.ALVL = null;
oFF.MetaObjectType.DIMENSION = null;
oFF.MetaObjectType.INFO_CUBE = null;
oFF.MetaObjectType.LOG_PARTITIONED_OBJECT = null;
oFF.MetaObjectType.HYBRIDPROVIDER = null;
oFF.MetaObjectType.MULTIPROVIDER = null;
oFF.MetaObjectType.HCPR = null;
oFF.MetaObjectType.ADSO = null;
oFF.MetaObjectType.INFOSET = null;
oFF.MetaObjectType.AGGREGATION_LEVEL = null;
oFF.MetaObjectType.VIRTUAL_PROVIDER = null;
oFF.MetaObjectType.AINX_PROVIDER = null;
oFF.MetaObjectType.INFOOBJECT = null;
oFF.MetaObjectType.REPOSITORY = null;
oFF.MetaObjectType.HIERARCHY = null;
oFF.MetaObjectType.HIERARCHY_MEMBER = null;
oFF.MetaObjectType.HIERARCHY_INTERVAL = null;
oFF.MetaObjectType.MASTERDATA = null;
oFF.MetaObjectType.USER_MANAGEMENT = null;
oFF.MetaObjectType.INA_MODEL = null;
oFF.MetaObjectType.PLANNING_MODEL = null;
oFF.MetaObjectType.PLANNING_FUNCTION = null;
oFF.MetaObjectType.PLANNING_SEQUENCE = null;
oFF.MetaObjectType.PLANNING_SEQUENCE_VALUEHELP = null;
oFF.MetaObjectType.PLANNING_FUNCTION_VALUEHELP = null;
oFF.MetaObjectType.FILTER = null;
oFF.MetaObjectType.MULTI_SOURCE = null;
oFF.MetaObjectType.BLENDING = null;
oFF.MetaObjectType.TRANSIENT_QUERY = null;
oFF.MetaObjectType.MODEL = null;
oFF.MetaObjectType.MODEL_VALUEHELP = null;
oFF.MetaObjectType.UNX = null;
oFF.MetaObjectType.UQAS = null;
oFF.MetaObjectType.YTABLE = null;
oFF.MetaObjectType.UQM = null;
oFF.MetaObjectType.URL = null;
oFF.MetaObjectType.ODSO = null;
oFF.MetaObjectType.CURRENCY_TRANSLATION = null;
oFF.MetaObjectType.CURRENCY = null;
oFF.MetaObjectType.FORMULA_OPERATORS = null;
oFF.MetaObjectType.CDS_PROJECTION_VIEW = null;
oFF.MetaObjectType.CDS_PROJECTION_VIEW_VALUEHELP = null;
oFF.MetaObjectType.SFX = null;
oFF.MetaObjectType.s_instances = null;
oFF.MetaObjectType.staticSetup = function()
{
	oFF.MetaObjectType.s_instances = oFF.XHashMapByString.create();
	oFF.MetaObjectType.QUERY = oFF.MetaObjectType.create("Query");
	oFF.MetaObjectType.QUERY_VALUEHELP = oFF.MetaObjectType.create("Query/ValueHelp");
	oFF.MetaObjectType.QUERY_VALUEHELP_DESIGNTIME = oFF.MetaObjectType.create("Query/ValueHelp/DesignTime");
	oFF.MetaObjectType.DEFAULT_PLAN_QUERY = oFF.MetaObjectType.create("DefaultPlanQuery");
	oFF.MetaObjectType.DEFAULT_REPORT_QUERY = oFF.MetaObjectType.create("DefaultReportQuery");
	oFF.MetaObjectType.LOCAL_QUERY = oFF.MetaObjectType.create("LocalQuery");
	oFF.MetaObjectType.QUERY_VIEW = oFF.MetaObjectType.create("QueryView");
	oFF.MetaObjectType.INFOPROVIDER = oFF.MetaObjectType.create("InfoProvider");
	oFF.MetaObjectType.DBVIEW = oFF.MetaObjectType.create("View");
	oFF.MetaObjectType.CATEGORY = oFF.MetaObjectType.create("Category");
	oFF.MetaObjectType.CONNECTOR = oFF.MetaObjectType.create("Connector");
	oFF.MetaObjectType.CATALOG_VIEW = oFF.MetaObjectType.create("CatalogView");
	oFF.MetaObjectType.CATALOG_VIEW_2 = oFF.MetaObjectType.create("CatalogView2");
	oFF.MetaObjectType.PLANNING = oFF.MetaObjectType.create("Planning");
	oFF.MetaObjectType.PLANNING_VALUEHELP = oFF.MetaObjectType.create("Planning/ValueHelp");
	oFF.MetaObjectType.CUBE = oFF.MetaObjectType.create("Cube");
	oFF.MetaObjectType.ALVL = oFF.MetaObjectType.create("ALVL");
	oFF.MetaObjectType.WORKSTATUS = oFF.MetaObjectType.create("WorkStatus");
	oFF.MetaObjectType.DIMENSION = oFF.MetaObjectType.create("Dimension");
	oFF.MetaObjectType.INFO_CUBE = oFF.MetaObjectType.create("InfoCube");
	oFF.MetaObjectType.LOG_PARTITIONED_OBJECT = oFF.MetaObjectType.create("LogPartitionedObject");
	oFF.MetaObjectType.HYBRIDPROVIDER = oFF.MetaObjectType.create("Hybridprovider");
	oFF.MetaObjectType.MULTIPROVIDER = oFF.MetaObjectType.create("MultiProvider");
	oFF.MetaObjectType.HCPR = oFF.MetaObjectType.create("HCPR");
	oFF.MetaObjectType.ADSO = oFF.MetaObjectType.create("ADSO");
	oFF.MetaObjectType.INFOSET = oFF.MetaObjectType.create("InfoSet");
	oFF.MetaObjectType.AGGREGATION_LEVEL = oFF.MetaObjectType.create("AggregationLevel");
	oFF.MetaObjectType.VIRTUAL_PROVIDER = oFF.MetaObjectType.create("VirtualProvider");
	oFF.MetaObjectType.AINX_PROVIDER = oFF.MetaObjectType.create("AINXProvider");
	oFF.MetaObjectType.INFOOBJECT = oFF.MetaObjectType.create("InfoObject");
	oFF.MetaObjectType.REPOSITORY = oFF.MetaObjectType.create("Repository");
	oFF.MetaObjectType.HIERARCHY = oFF.MetaObjectType.create("Hierarchy");
	oFF.MetaObjectType.HIERARCHY_MEMBER = oFF.MetaObjectType.create("HierarchyMember");
	oFF.MetaObjectType.HIERARCHY_INTERVAL = oFF.MetaObjectType.create("HierarchyInterval");
	oFF.MetaObjectType.MASTERDATA = oFF.MetaObjectType.create("Masterdata");
	oFF.MetaObjectType.USER_MANAGEMENT = oFF.MetaObjectType.create("UserManagement");
	oFF.MetaObjectType.INA_MODEL = oFF.MetaObjectType.create("InAModel");
	oFF.MetaObjectType.PLANNING_MODEL = oFF.MetaObjectType.create("PlanningModel");
	oFF.MetaObjectType.PLANNING_FUNCTION = oFF.MetaObjectType.create("PlanningFunction");
	oFF.MetaObjectType.PLANNING_SEQUENCE = oFF.MetaObjectType.create("PlanningSequence");
	oFF.MetaObjectType.PLANNING_SEQUENCE_VALUEHELP = oFF.MetaObjectType.create("PlanningSequence/ValueHelp");
	oFF.MetaObjectType.PLANNING_FUNCTION_VALUEHELP = oFF.MetaObjectType.create("PlanningFunction/ValueHelp");
	oFF.MetaObjectType.FILTER = oFF.MetaObjectType.create("Filter");
	oFF.MetaObjectType.MULTI_SOURCE = oFF.MetaObjectType.create("MultiSource");
	oFF.MetaObjectType.BLENDING = oFF.MetaObjectType.create("Blending");
	oFF.MetaObjectType.TRANSIENT_QUERY = oFF.MetaObjectType.create("TRPR");
	oFF.MetaObjectType.MODEL = oFF.MetaObjectType.create("Model");
	oFF.MetaObjectType.MODEL_VALUEHELP = oFF.MetaObjectType.create("Model/ValueHelp");
	oFF.MetaObjectType.UNX = oFF.MetaObjectType.create("Unx");
	oFF.MetaObjectType.UQAS = oFF.MetaObjectType.create("Uqas");
	oFF.MetaObjectType.YTABLE = oFF.MetaObjectType.create("YTable");
	oFF.MetaObjectType.UQM = oFF.MetaObjectType.create("Uqm");
	oFF.MetaObjectType.URL = oFF.MetaObjectType.create("Url");
	oFF.MetaObjectType.ODSO = oFF.MetaObjectType.create("ODSO");
	oFF.MetaObjectType.CURRENCY_TRANSLATION = oFF.MetaObjectType.create("CurrencyTranslation");
	oFF.MetaObjectType.CURRENCY = oFF.MetaObjectType.create("Currency");
	oFF.MetaObjectType.FORMULA_OPERATORS = oFF.MetaObjectType.create("FormulaOperators");
	oFF.MetaObjectType.CDS_PROJECTION_VIEW = oFF.MetaObjectType.create("CDSProjectionView");
	oFF.MetaObjectType.CDS_PROJECTION_VIEW_VALUEHELP = oFF.MetaObjectType.create("CDSProjectionView/ValueHelp");
	oFF.MetaObjectType.SFX = oFF.MetaObjectType.create("Sfx");
};
oFF.MetaObjectType.create = function(camelCaseName)
{
	var name = oFF.XString.toLowerCase(camelCaseName);
	var newConstant = oFF.XConstant.setupName(new oFF.MetaObjectType(), name);
	newConstant.m_camelCaseName = camelCaseName;
	oFF.MetaObjectType.s_instances.put(name, newConstant);
	return newConstant;
};
oFF.MetaObjectType.lookup = function(name)
{
	var lowerCase = oFF.XString.toLowerCase(name);
	return oFF.MetaObjectType.s_instances.getByKey(lowerCase);
};
oFF.MetaObjectType.lookupAndCreate = function(camelCaseName)
{
	var result = oFF.MetaObjectType.lookup(camelCaseName);
	if (oFF.isNull(result))
	{
		result = oFF.MetaObjectType.create(camelCaseName);
	}
	return result;
};
oFF.MetaObjectType.getAll = function()
{
	return oFF.MetaObjectType.s_instances.getIterator();
};
oFF.MetaObjectType.prototype.m_camelCaseName = null;
oFF.MetaObjectType.prototype.getCamelCaseName = function()
{
	return this.m_camelCaseName;
};

oFF.NullsType = function() {};
oFF.NullsType.prototype = new oFF.XConstant();
oFF.NullsType.prototype._ff_c = "NullsType";

oFF.NullsType.FIRST = null;
oFF.NullsType.LAST = null;
oFF.NullsType.NONE = null;
oFF.NullsType.s_instances = null;
oFF.NullsType.staticSetup = function()
{
	oFF.NullsType.s_instances = oFF.XHashMapByString.create();
	oFF.NullsType.FIRST = oFF.NullsType.create("FIRST");
	oFF.NullsType.LAST = oFF.NullsType.create("LAST");
	oFF.NullsType.NONE = oFF.NullsType.create("NONE");
};
oFF.NullsType.create = function(name)
{
	var directionType = oFF.XConstant.setupName(new oFF.NullsType(), name);
	oFF.NullsType.s_instances.put(name, directionType);
	return directionType;
};
oFF.NullsType.lookup = function(name)
{
	return oFF.NullsType.s_instances.getByKey(name);
};

oFF.ObtainabilityType = function() {};
oFF.ObtainabilityType.prototype = new oFF.XConstant();
oFF.ObtainabilityType.prototype._ff_c = "ObtainabilityType";

oFF.ObtainabilityType.s_all = null;
oFF.ObtainabilityType.ALWAYS = null;
oFF.ObtainabilityType.USER_INTERFACE = null;
oFF.ObtainabilityType.SERVICE = null;
oFF.ObtainabilityType.SERVER = null;
oFF.ObtainabilityType.staticSetup = function()
{
	oFF.ObtainabilityType.s_all = oFF.XSetOfNameObject.create();
	oFF.ObtainabilityType.ALWAYS = oFF.ObtainabilityType.create("Always");
	oFF.ObtainabilityType.USER_INTERFACE = oFF.ObtainabilityType.create("UserInterface");
	oFF.ObtainabilityType.SERVICE = oFF.ObtainabilityType.create("Service");
	oFF.ObtainabilityType.SERVER = oFF.ObtainabilityType.create("Server");
};
oFF.ObtainabilityType.create = function(name)
{
	var newConstant = oFF.XConstant.setupName(new oFF.ObtainabilityType(), name);
	oFF.ObtainabilityType.s_all.add(newConstant);
	return newConstant;
};
oFF.ObtainabilityType.lookup = function(name)
{
	return oFF.ObtainabilityType.s_all.getByKey(name);
};

oFF.OptimizerHint = function() {};
oFF.OptimizerHint.prototype = new oFF.XConstant();
oFF.OptimizerHint.prototype._ff_c = "OptimizerHint";

oFF.OptimizerHint.CUBE_CACHE_WITH_ID = null;
oFF.OptimizerHint.MDS_PLAN_USE_CE_NEW = null;
oFF.OptimizerHint.staticSetup = function()
{
	oFF.OptimizerHint.CUBE_CACHE_WITH_ID = oFF.OptimizerHint.create("cube_cache_with_id");
	oFF.OptimizerHint.MDS_PLAN_USE_CE_NEW = oFF.OptimizerHint.create("mds_plan_use_ce_new");
};
oFF.OptimizerHint.create = function(name)
{
	return oFF.XConstant.setupName(new oFF.OptimizerHint(), name);
};

oFF.PresentationSelect = function() {};
oFF.PresentationSelect.prototype = new oFF.XConstant();
oFF.PresentationSelect.prototype._ff_c = "PresentationSelect";

oFF.PresentationSelect.KEY = null;
oFF.PresentationSelect.TEXT = null;
oFF.PresentationSelect.KEY_AND_TEXT = null;
oFF.PresentationSelect.staticSetup = function()
{
	oFF.PresentationSelect.KEY = oFF.XConstant.setupName(new oFF.PresentationSelect(), "Key");
	oFF.PresentationSelect.TEXT = oFF.XConstant.setupName(new oFF.PresentationSelect(), "Text");
	oFF.PresentationSelect.KEY_AND_TEXT = oFF.XConstant.setupName(new oFF.PresentationSelect(), "KeyAndText");
};

oFF.ProcessingStep = function() {};
oFF.ProcessingStep.prototype = new oFF.XConstant();
oFF.ProcessingStep.prototype._ff_c = "ProcessingStep";

oFF.ProcessingStep.VARIABLE_SUBMIT = null;
oFF.ProcessingStep.VARIABLE_CANCEL = null;
oFF.ProcessingStep.VARIABLE_DEFINITION = null;
oFF.ProcessingStep.HIERARCHY_SUBMIT = null;
oFF.ProcessingStep.VARIANT_DELETE = null;
oFF.ProcessingStep.VARIANT_SAVE = null;
oFF.ProcessingStep.staticSetup = function()
{
	oFF.ProcessingStep.VARIABLE_SUBMIT = oFF.XConstant.setupName(new oFF.ProcessingStep(), "VariableSubmit");
	oFF.ProcessingStep.VARIABLE_CANCEL = oFF.XConstant.setupName(new oFF.ProcessingStep(), "VariableCancel");
	oFF.ProcessingStep.VARIABLE_DEFINITION = oFF.XConstant.setupName(new oFF.ProcessingStep(), "VariableDefinition");
	oFF.ProcessingStep.HIERARCHY_SUBMIT = oFF.XConstant.setupName(new oFF.ProcessingStep(), "TransientHierarchySubmit");
	oFF.ProcessingStep.VARIANT_DELETE = oFF.XConstant.setupName(new oFF.ProcessingStep(), "VariantDelete");
	oFF.ProcessingStep.VARIANT_SAVE = oFF.XConstant.setupName(new oFF.ProcessingStep(), "VariantCreateUpdate");
};

oFF.ProcessingType = function() {};
oFF.ProcessingType.prototype = new oFF.XConstant();
oFF.ProcessingType.prototype._ff_c = "ProcessingType";

oFF.ProcessingType.PARAMETER = null;
oFF.ProcessingType.CURRENCY_CONVERSION = null;
oFF.ProcessingType.staticSetup = function()
{
	oFF.ProcessingType.PARAMETER = oFF.ProcessingType.create("Parameter");
	oFF.ProcessingType.CURRENCY_CONVERSION = oFF.ProcessingType.create("CurrencyConversion");
};
oFF.ProcessingType.create = function(name)
{
	return oFF.XConstant.setupName(new oFF.ProcessingType(), name);
};

oFF.ProviderType = function() {};
oFF.ProviderType.prototype = new oFF.XConstant();
oFF.ProviderType.prototype._ff_c = "ProviderType";

oFF.ProviderType.ANALYTICS = null;
oFF.ProviderType.ANALYTICS_VALUE_HELP = null;
oFF.ProviderType.PLANNING = null;
oFF.ProviderType.CATALOG = null;
oFF.ProviderType.PLANNING_COMMAND = null;
oFF.ProviderType.LIST_REPORTING = null;
oFF.ProviderType.DIMENSION_EXTENSION = null;
oFF.ProviderType.PLANNING_VALUE_HELP = null;
oFF.ProviderType.DOCUMENTS = null;
oFF.ProviderType.s_instances = null;
oFF.ProviderType.staticSetup = function()
{
	oFF.ProviderType.s_instances = oFF.XHashMapByString.create();
	oFF.ProviderType.ANALYTICS = oFF.ProviderType.create("Analytics");
	oFF.ProviderType.ANALYTICS_VALUE_HELP = oFF.ProviderType.create("AnalyticsValueHelp");
	oFF.ProviderType.ANALYTICS.m_associatedValueHelp = oFF.ProviderType.ANALYTICS_VALUE_HELP;
	oFF.ProviderType.LIST_REPORTING = oFF.ProviderType.create("ListReporting");
	oFF.ProviderType.PLANNING = oFF.ProviderType.create("Planning");
	oFF.ProviderType.CATALOG = oFF.ProviderType.create("Catalog");
	oFF.ProviderType.PLANNING_COMMAND = oFF.ProviderType.create("PlanningCommand");
	oFF.ProviderType.DIMENSION_EXTENSION = oFF.ProviderType.create("DimensionExtension");
	oFF.ProviderType.PLANNING_VALUE_HELP = oFF.ProviderType.create("PlanningValueHelp");
	oFF.ProviderType.DOCUMENTS = oFF.ProviderType.create("Documents");
};
oFF.ProviderType.create = function(name)
{
	var newConstant = oFF.XConstant.setupName(new oFF.ProviderType(), name);
	oFF.ProviderType.s_instances.put(name, newConstant);
	newConstant.m_associatedValueHelp = newConstant;
	return newConstant;
};
oFF.ProviderType.getAll = function()
{
	return oFF.ProviderType.s_instances;
};
oFF.ProviderType.prototype.m_associatedValueHelp = null;
oFF.ProviderType.prototype.getAssociatedValueHelp = function()
{
	return this.m_associatedValueHelp;
};

oFF.QContextType = function() {};
oFF.QContextType.prototype = new oFF.XConstant();
oFF.QContextType.prototype._ff_c = "QContextType";

oFF.QContextType.RESULT_SET = null;
oFF.QContextType.SELECTOR = null;
oFF.QContextType.VARIABLE = null;
oFF.QContextType.s_instances = null;
oFF.QContextType.staticSetup = function()
{
	oFF.QContextType.s_instances = oFF.XSetOfNameObject.create();
	oFF.QContextType.RESULT_SET = oFF.QContextType.create("ResultSet");
	oFF.QContextType.SELECTOR = oFF.QContextType.create("Selector");
	oFF.QContextType.VARIABLE = oFF.QContextType.create("Variable");
};
oFF.QContextType.create = function(name)
{
	var newConstant = oFF.XConstant.setupName(new oFF.QContextType(), name);
	oFF.QContextType.s_instances.add(newConstant);
	return newConstant;
};
oFF.QContextType.lookup = function(name)
{
	return oFF.QContextType.s_instances.getByKey(name);
};

oFF.QExceptionEvalType = function() {};
oFF.QExceptionEvalType.prototype = new oFF.XConstant();
oFF.QExceptionEvalType.prototype._ff_c = "QExceptionEvalType";

oFF.QExceptionEvalType.TOTALS = null;
oFF.QExceptionEvalType.DATA = null;
oFF.QExceptionEvalType.ALL = null;
oFF.QExceptionEvalType.staticSetup = function()
{
	oFF.QExceptionEvalType.TOTALS = oFF.XConstant.setupName(new oFF.QExceptionEvalType(), "Totals");
	oFF.QExceptionEvalType.DATA = oFF.XConstant.setupName(new oFF.QExceptionEvalType(), "Data");
	oFF.QExceptionEvalType.ALL = oFF.XConstant.setupName(new oFF.QExceptionEvalType(), "All");
};
oFF.QExceptionEvalType.lookupExceptionEvalType = function(name)
{
	if (oFF.XString.isEqual(name, oFF.QExceptionEvalType.TOTALS.getName()))
	{
		return oFF.QExceptionEvalType.TOTALS;
	}
	if (oFF.XString.isEqual(name, oFF.QExceptionEvalType.DATA.getName()))
	{
		return oFF.QExceptionEvalType.DATA;
	}
	return oFF.QExceptionEvalType.ALL;
};

oFF.QExceptionHeaderSettings = function() {};
oFF.QExceptionHeaderSettings.prototype = new oFF.XConstant();
oFF.QExceptionHeaderSettings.prototype._ff_c = "QExceptionHeaderSettings";

oFF.QExceptionHeaderSettings.NONE = null;
oFF.QExceptionHeaderSettings.ROW = null;
oFF.QExceptionHeaderSettings.COLUMN = null;
oFF.QExceptionHeaderSettings.ROW_AND_COLUMN = null;
oFF.QExceptionHeaderSettings.staticSetup = function()
{
	oFF.QExceptionHeaderSettings.NONE = oFF.XConstant.setupName(new oFF.QExceptionHeaderSettings(), "none");
	oFF.QExceptionHeaderSettings.ROW = oFF.XConstant.setupName(new oFF.QExceptionHeaderSettings(), "row");
	oFF.QExceptionHeaderSettings.COLUMN = oFF.XConstant.setupName(new oFF.QExceptionHeaderSettings(), "column");
	oFF.QExceptionHeaderSettings.ROW_AND_COLUMN = oFF.XConstant.setupName(new oFF.QExceptionHeaderSettings(), "rowAndColumn");
};
oFF.QExceptionHeaderSettings.lookupExceptionHeaderSetting = function(name)
{
	if (oFF.XString.isEqual(name, oFF.QExceptionHeaderSettings.ROW_AND_COLUMN.getName()))
	{
		return oFF.QExceptionHeaderSettings.ROW_AND_COLUMN;
	}
	if (oFF.XString.isEqual(name, oFF.QExceptionHeaderSettings.COLUMN.getName()))
	{
		return oFF.QExceptionHeaderSettings.COLUMN;
	}
	if (oFF.XString.isEqual(name, oFF.QExceptionHeaderSettings.ROW.getName()))
	{
		return oFF.QExceptionHeaderSettings.ROW;
	}
	return oFF.QExceptionHeaderSettings.NONE;
};

oFF.QFormulaType = function() {};
oFF.QFormulaType.prototype = new oFF.XConstant();
oFF.QFormulaType.prototype._ff_c = "QFormulaType";

oFF.QFormulaType.FORMULA = null;
oFF.QFormulaType.MODEL_LINK = null;
oFF.QFormulaType.s_all = null;
oFF.QFormulaType.staticSetup = function()
{
	oFF.QFormulaType.s_all = oFF.XSetOfNameObject.create();
	oFF.QFormulaType.FORMULA = oFF.QFormulaType.create("Formula");
	oFF.QFormulaType.MODEL_LINK = oFF.QFormulaType.create("ModelLink");
};
oFF.QFormulaType.create = function(name)
{
	var newConstant = oFF.XConstant.setupName(new oFF.QFormulaType(), name);
	oFF.QFormulaType.s_all.add(newConstant);
	return newConstant;
};
oFF.QFormulaType.lookup = function(name)
{
	return oFF.QFormulaType.s_all.getByKey(name);
};

oFF.QPersistedPlaceholderTagType = function() {};
oFF.QPersistedPlaceholderTagType.prototype = new oFF.XConstant();
oFF.QPersistedPlaceholderTagType.prototype._ff_c = "QPersistedPlaceholderTagType";

oFF.QPersistedPlaceholderTagType.DYNAMIC_TIME_RANGE_FILTER = null;
oFF.QPersistedPlaceholderTagType.DYNAMIC_TIME_CALCULATION_SELECTION_PLACEHOLDER = null;
oFF.QPersistedPlaceholderTagType.DYNAMIC_TIME_CALCULATION_TO_DATE_SELECTION_PLACEHOLDER = null;
oFF.QPersistedPlaceholderTagType.DATE_DIFFERENCE_CALCULATION_FORMULA_PLACEHOLDER = null;
oFF.QPersistedPlaceholderTagType.CALCULATION_FORMULA_START_VALUE_PLACEHOLDER = null;
oFF.QPersistedPlaceholderTagType.CALCULATION_FORMULA_END_VALUE_PLACEHOLDER = null;
oFF.QPersistedPlaceholderTagType.CONVERTED_FAM_PLACEHOLDER = null;
oFF.QPersistedPlaceholderTagType.CURRENT_DATE_VARIABLE = null;
oFF.QPersistedPlaceholderTagType.s_all = null;
oFF.QPersistedPlaceholderTagType.staticSetup = function()
{
	oFF.QPersistedPlaceholderTagType.s_all = oFF.XSetOfNameObject.create();
	oFF.QPersistedPlaceholderTagType.DYNAMIC_TIME_RANGE_FILTER = oFF.QPersistedPlaceholderTagType.create("dynamicTimeRangeFilter");
	oFF.QPersistedPlaceholderTagType.DYNAMIC_TIME_CALCULATION_SELECTION_PLACEHOLDER = oFF.QPersistedPlaceholderTagType.create("DynamicTimeCalculationSelectionPlaceholder");
	oFF.QPersistedPlaceholderTagType.DYNAMIC_TIME_CALCULATION_TO_DATE_SELECTION_PLACEHOLDER = oFF.QPersistedPlaceholderTagType.create("DynamicTimeCalculationToDateSelectionPlaceholder");
	oFF.QPersistedPlaceholderTagType.DATE_DIFFERENCE_CALCULATION_FORMULA_PLACEHOLDER = oFF.QPersistedPlaceholderTagType.create("DateDifferenceCalculationFormulaPlaceholder");
	oFF.QPersistedPlaceholderTagType.CALCULATION_FORMULA_START_VALUE_PLACEHOLDER = oFF.QPersistedPlaceholderTagType.create("CalculationFormulaStartValuePlaceholder");
	oFF.QPersistedPlaceholderTagType.CALCULATION_FORMULA_END_VALUE_PLACEHOLDER = oFF.QPersistedPlaceholderTagType.create("CalculationFormulaEndValuePlaceholder");
	oFF.QPersistedPlaceholderTagType.CONVERTED_FAM_PLACEHOLDER = oFF.QPersistedPlaceholderTagType.create("ConvertedFAMPlaceholder");
	oFF.QPersistedPlaceholderTagType.CURRENT_DATE_VARIABLE = oFF.QPersistedPlaceholderTagType.create("CurrentDateVariable");
};
oFF.QPersistedPlaceholderTagType.create = function(name)
{
	var newConstant = oFF.XConstant.setupName(new oFF.QPersistedPlaceholderTagType(), name);
	oFF.QPersistedPlaceholderTagType.s_all.add(newConstant);
	return newConstant;
};

oFF.QTimeOperationFunction = function() {};
oFF.QTimeOperationFunction.prototype = new oFF.XConstant();
oFF.QTimeOperationFunction.prototype._ff_c = "QTimeOperationFunction";

oFF.QTimeOperationFunction.PREVIOUS = null;
oFF.QTimeOperationFunction.NEXT = null;
oFF.QTimeOperationFunction.TO_DATE = null;
oFF.QTimeOperationFunction.CURRENT_DATE = null;
oFF.QTimeOperationFunction.CURRENT = null;
oFF.QTimeOperationFunction.s_all = null;
oFF.QTimeOperationFunction.staticSetup = function()
{
	oFF.QTimeOperationFunction.s_all = oFF.XSetOfNameObject.create();
	oFF.QTimeOperationFunction.PREVIOUS = oFF.QTimeOperationFunction.create("Previous");
	oFF.QTimeOperationFunction.NEXT = oFF.QTimeOperationFunction.create("Next");
	oFF.QTimeOperationFunction.TO_DATE = oFF.QTimeOperationFunction.create("ToDate");
	oFF.QTimeOperationFunction.CURRENT_DATE = oFF.QTimeOperationFunction.create("CurrentDate");
	oFF.QTimeOperationFunction.CURRENT = oFF.QTimeOperationFunction.create("Current");
};
oFF.QTimeOperationFunction.create = function(name)
{
	var newConstant = oFF.XConstant.setupName(new oFF.QTimeOperationFunction(), name);
	oFF.QTimeOperationFunction.s_all.add(newConstant);
	return newConstant;
};
oFF.QTimeOperationFunction.lookup = function(name)
{
	return oFF.QTimeOperationFunction.s_all.getByKey(name);
};

oFF.QTimeOperationGranularity = function() {};
oFF.QTimeOperationGranularity.prototype = new oFF.XConstant();
oFF.QTimeOperationGranularity.prototype._ff_c = "QTimeOperationGranularity";

oFF.QTimeOperationGranularity.PERIOD = null;
oFF.QTimeOperationGranularity.YEAR = null;
oFF.QTimeOperationGranularity.HALF_YEAR = null;
oFF.QTimeOperationGranularity.QUARTER = null;
oFF.QTimeOperationGranularity.MONTH = null;
oFF.QTimeOperationGranularity.WEEK = null;
oFF.QTimeOperationGranularity.DAY = null;
oFF.QTimeOperationGranularity.OTHER = null;
oFF.QTimeOperationGranularity.s_all = null;
oFF.QTimeOperationGranularity.staticSetup = function()
{
	oFF.QTimeOperationGranularity.s_all = oFF.XSetOfNameObject.create();
	oFF.QTimeOperationGranularity.PERIOD = oFF.QTimeOperationGranularity.create("Period");
	oFF.QTimeOperationGranularity.YEAR = oFF.QTimeOperationGranularity.create("Year");
	oFF.QTimeOperationGranularity.HALF_YEAR = oFF.QTimeOperationGranularity.create("HalfYear");
	oFF.QTimeOperationGranularity.QUARTER = oFF.QTimeOperationGranularity.create("Quarter");
	oFF.QTimeOperationGranularity.MONTH = oFF.QTimeOperationGranularity.create("Month");
	oFF.QTimeOperationGranularity.WEEK = oFF.QTimeOperationGranularity.create("Week");
	oFF.QTimeOperationGranularity.DAY = oFF.QTimeOperationGranularity.create("Day");
	oFF.QTimeOperationGranularity.OTHER = oFF.QTimeOperationGranularity.create("Other");
};
oFF.QTimeOperationGranularity.create = function(name)
{
	var newConstant = oFF.XConstant.setupName(new oFF.QTimeOperationGranularity(), name);
	oFF.QTimeOperationGranularity.s_all.add(newConstant);
	return newConstant;
};
oFF.QTimeOperationGranularity.lookup = function(name)
{
	return oFF.QTimeOperationGranularity.s_all.getByKey(name);
};

oFF.QTimeOperationLagPeriod = function() {};
oFF.QTimeOperationLagPeriod.prototype = new oFF.XConstant();
oFF.QTimeOperationLagPeriod.prototype._ff_c = "QTimeOperationLagPeriod";

oFF.QTimeOperationLagPeriod.NO_LAG_PERIOD = null;
oFF.QTimeOperationLagPeriod.YEAR_TO_HALF_YEAR = null;
oFF.QTimeOperationLagPeriod.YEAR_TO_QUARTER = null;
oFF.QTimeOperationLagPeriod.YEAR_TO_MONTH = null;
oFF.QTimeOperationLagPeriod.YEAR_TO_WEEK = null;
oFF.QTimeOperationLagPeriod.HALF_YEAR_TO_QUARTER = null;
oFF.QTimeOperationLagPeriod.HALF_YEAR_TO_MONTH = null;
oFF.QTimeOperationLagPeriod.HALF_YEAR_TO_WEEK = null;
oFF.QTimeOperationLagPeriod.QUARTER_TO_MONTH = null;
oFF.QTimeOperationLagPeriod.QUARTER_TO_WEEK = null;
oFF.QTimeOperationLagPeriod.QUARTER_TO_HALF_YEAR = null;
oFF.QTimeOperationLagPeriod.MONTH_TO_WEEK = null;
oFF.QTimeOperationLagPeriod.WEEK_TO_DAY = null;
oFF.QTimeOperationLagPeriod.create = function(constant, lagPeriod)
{
	var object = oFF.XConstant.setupName(new oFF.QTimeOperationLagPeriod(), constant);
	object.m_lagPeriod = lagPeriod;
	return object;
};
oFF.QTimeOperationLagPeriod.staticSetup = function()
{
	oFF.QTimeOperationLagPeriod.NO_LAG_PERIOD = oFF.QTimeOperationLagPeriod.create("NO_LAG_PERIOD", 1);
	oFF.QTimeOperationLagPeriod.YEAR_TO_HALF_YEAR = oFF.QTimeOperationLagPeriod.create("YEAR_TO_HALF_YEAR", 2);
	oFF.QTimeOperationLagPeriod.YEAR_TO_QUARTER = oFF.QTimeOperationLagPeriod.create("YEAR_TO_QUARTER", 4);
	oFF.QTimeOperationLagPeriod.YEAR_TO_MONTH = oFF.QTimeOperationLagPeriod.create("YEAR_TO_MONTH", 12);
	oFF.QTimeOperationLagPeriod.YEAR_TO_WEEK = oFF.QTimeOperationLagPeriod.create("YEAR_TO_WEEK", 52);
	oFF.QTimeOperationLagPeriod.HALF_YEAR_TO_QUARTER = oFF.QTimeOperationLagPeriod.create("HALF_YEAR_TO_QUARTER", 2);
	oFF.QTimeOperationLagPeriod.HALF_YEAR_TO_MONTH = oFF.QTimeOperationLagPeriod.create("HALF_YEAR_TO_MONTH", 6);
	oFF.QTimeOperationLagPeriod.HALF_YEAR_TO_WEEK = oFF.QTimeOperationLagPeriod.create("HALF_YEAR_TO_WEEK", 26);
	oFF.QTimeOperationLagPeriod.QUARTER_TO_MONTH = oFF.QTimeOperationLagPeriod.create("QUARTER_TO_MONTH", 3);
	oFF.QTimeOperationLagPeriod.QUARTER_TO_WEEK = oFF.QTimeOperationLagPeriod.create("QUARTER_TO_WEEK", 13);
	oFF.QTimeOperationLagPeriod.QUARTER_TO_HALF_YEAR = oFF.QTimeOperationLagPeriod.create("QUARTER_TO_HALF_YEAR", 2);
	oFF.QTimeOperationLagPeriod.MONTH_TO_WEEK = oFF.QTimeOperationLagPeriod.create("MONTH_TO_WEEK", 4);
	oFF.QTimeOperationLagPeriod.WEEK_TO_DAY = oFF.QTimeOperationLagPeriod.create("WEEK_TO_DAY", 7);
};
oFF.QTimeOperationLagPeriod.prototype.m_lagPeriod = 0;
oFF.QTimeOperationLagPeriod.prototype.getLagPeriod = function()
{
	return this.m_lagPeriod;
};

oFF.QTimePeriodOperationLevel = function() {};
oFF.QTimePeriodOperationLevel.prototype = new oFF.XConstant();
oFF.QTimePeriodOperationLevel.prototype._ff_c = "QTimePeriodOperationLevel";

oFF.QTimePeriodOperationLevel.ALL_LEVELS = null;
oFF.QTimePeriodOperationLevel.LOWEST_LEVEL = null;
oFF.QTimePeriodOperationLevel.s_all = null;
oFF.QTimePeriodOperationLevel.staticSetup = function()
{
	oFF.QTimePeriodOperationLevel.s_all = oFF.XSetOfNameObject.create();
	oFF.QTimePeriodOperationLevel.ALL_LEVELS = oFF.QTimePeriodOperationLevel.create("allLevels");
	oFF.QTimePeriodOperationLevel.LOWEST_LEVEL = oFF.QTimePeriodOperationLevel.create("lowestLevel");
};
oFF.QTimePeriodOperationLevel.create = function(name)
{
	var newConstant = oFF.XConstant.setupName(new oFF.QTimePeriodOperationLevel(), name);
	oFF.QTimePeriodOperationLevel.s_all.add(newConstant);
	return newConstant;
};
oFF.QTimePeriodOperationLevel.lookup = function(name)
{
	return oFF.QTimePeriodOperationLevel.s_all.getByKey(name);
};

oFF.QueryFilterUsage = function() {};
oFF.QueryFilterUsage.prototype = new oFF.XConstant();
oFF.QueryFilterUsage.prototype._ff_c = "QueryFilterUsage";

oFF.QueryFilterUsage.QUERY_FILTER_EFFECTIVE = null;
oFF.QueryFilterUsage.QUERY_FILTER = null;
oFF.QueryFilterUsage.QUERY_FILTER_EXCLUDING_DIMENSION = null;
oFF.QueryFilterUsage.SELECTOR_FILTER = null;
oFF.QueryFilterUsage.staticSetup = function()
{
	oFF.QueryFilterUsage.QUERY_FILTER_EFFECTIVE = oFF.XConstant.setupName(new oFF.QueryFilterUsage(), "Effective");
	oFF.QueryFilterUsage.QUERY_FILTER = oFF.XConstant.setupName(new oFF.QueryFilterUsage(), "Complete");
	oFF.QueryFilterUsage.QUERY_FILTER_EXCLUDING_DIMENSION = oFF.XConstant.setupName(new oFF.QueryFilterUsage(), "ExludingDimension");
	oFF.QueryFilterUsage.SELECTOR_FILTER = oFF.XConstant.setupName(new oFF.QueryFilterUsage(), "Selector");
};

oFF.ReorderingCapability = function() {};
oFF.ReorderingCapability.prototype = new oFF.XConstant();
oFF.ReorderingCapability.prototype._ff_c = "ReorderingCapability";

oFF.ReorderingCapability.NONE = null;
oFF.ReorderingCapability.RESTRICTED = null;
oFF.ReorderingCapability.FULL = null;
oFF.ReorderingCapability.staticSetup = function()
{
	oFF.ReorderingCapability.NONE = oFF.XConstant.setupName(new oFF.ReorderingCapability(), "None");
	oFF.ReorderingCapability.RESTRICTED = oFF.XConstant.setupName(new oFF.ReorderingCapability(), "Restricted");
	oFF.ReorderingCapability.FULL = oFF.XConstant.setupName(new oFF.ReorderingCapability(), "Full");
};

oFF.RestoreAction = function() {};
oFF.RestoreAction.prototype = new oFF.XConstant();
oFF.RestoreAction.prototype._ff_c = "RestoreAction";

oFF.RestoreAction.COPY = null;
oFF.RestoreAction.CONDITIONAL_COPY = null;
oFF.RestoreAction.DEFAULT_VALUE = null;
oFF.RestoreAction.staticSetup = function()
{
	oFF.RestoreAction.COPY = oFF.XConstant.setupName(new oFF.RestoreAction(), "Copy");
	oFF.RestoreAction.CONDITIONAL_COPY = oFF.XConstant.setupName(new oFF.RestoreAction(), "ConditionalCopy");
	oFF.RestoreAction.DEFAULT_VALUE = oFF.XConstant.setupName(new oFF.RestoreAction(), "DefaultValue");
};

oFF.ResultAlignment = function() {};
oFF.ResultAlignment.prototype = new oFF.XConstant();
oFF.ResultAlignment.prototype._ff_c = "ResultAlignment";

oFF.ResultAlignment.TOP = null;
oFF.ResultAlignment.BOTTOM = null;
oFF.ResultAlignment.TOPBOTTOM = null;
oFF.ResultAlignment.NONE = null;
oFF.ResultAlignment.STRUCTURE = null;
oFF.ResultAlignment.s_lookup = null;
oFF.ResultAlignment.staticSetup = function()
{
	oFF.ResultAlignment.s_lookup = oFF.XHashMapByString.create();
	oFF.ResultAlignment.TOP = oFF.ResultAlignment.createAlignment("Top");
	oFF.ResultAlignment.BOTTOM = oFF.ResultAlignment.createAlignment("Bottom");
	oFF.ResultAlignment.TOPBOTTOM = oFF.ResultAlignment.createAlignment("TopBottom");
	oFF.ResultAlignment.NONE = oFF.ResultAlignment.createAlignment("None");
	oFF.ResultAlignment.STRUCTURE = oFF.ResultAlignment.createAlignment("Structure");
};
oFF.ResultAlignment.createAlignment = function(name)
{
	var constant = oFF.XConstant.setupName(new oFF.ResultAlignment(), name);
	oFF.ResultAlignment.s_lookup.put(name, constant);
	return constant;
};
oFF.ResultAlignment.lookup = function(name)
{
	return oFF.ResultAlignment.s_lookup.getByKey(name);
};

oFF.ResultCalculation = function() {};
oFF.ResultCalculation.prototype = new oFF.XConstant();
oFF.ResultCalculation.prototype._ff_c = "ResultCalculation";

oFF.ResultCalculation.NOT_DEFINED = null;
oFF.ResultCalculation.MINIMUM = null;
oFF.ResultCalculation.MAXIMUM = null;
oFF.ResultCalculation.SUM = null;
oFF.ResultCalculation.SUMMATION_OF_ROUNDED_VALUES = null;
oFF.ResultCalculation.COUNTER_FOR_ALL_DETAILED_VALUES = null;
oFF.ResultCalculation.COUNTER_FOR_ALL_DETAILED_VALUES_NZ_NULL_ERROR = null;
oFF.ResultCalculation.FIRST_VALUE = null;
oFF.ResultCalculation.FIRST_VALUE_NOT_ZERO_NULL_ERROR = null;
oFF.ResultCalculation.LAST_VALUE = null;
oFF.ResultCalculation.LAST_VALUE_NOT_ZERO_NULL_ERROR = null;
oFF.ResultCalculation.AVERAGE = null;
oFF.ResultCalculation.AVERAGE_DETAILED_VALUES_NOT_ZERO_NULL_ERROR = null;
oFF.ResultCalculation.STANDARD_DEVIATION = null;
oFF.ResultCalculation.MEDIAN = null;
oFF.ResultCalculation.MEDIAN_DETAILED_VALUES_NOT_ZERO_NULL_ERROR = null;
oFF.ResultCalculation.VARIANCE = null;
oFF.ResultCalculation.HIDE = null;
oFF.ResultCalculation.staticSetup = function()
{
	oFF.ResultCalculation.NOT_DEFINED = oFF.XConstant.setupName(new oFF.ResultCalculation(), "00");
	oFF.ResultCalculation.SUM = oFF.XConstant.setupName(new oFF.ResultCalculation(), "01");
	oFF.ResultCalculation.MAXIMUM = oFF.XConstant.setupName(new oFF.ResultCalculation(), "02");
	oFF.ResultCalculation.MINIMUM = oFF.XConstant.setupName(new oFF.ResultCalculation(), "03");
	oFF.ResultCalculation.COUNTER_FOR_ALL_DETAILED_VALUES = oFF.XConstant.setupName(new oFF.ResultCalculation(), "04");
	oFF.ResultCalculation.COUNTER_FOR_ALL_DETAILED_VALUES_NZ_NULL_ERROR = oFF.XConstant.setupName(new oFF.ResultCalculation(), "05");
	oFF.ResultCalculation.AVERAGE = oFF.XConstant.setupName(new oFF.ResultCalculation(), "06");
	oFF.ResultCalculation.AVERAGE_DETAILED_VALUES_NOT_ZERO_NULL_ERROR = oFF.XConstant.setupName(new oFF.ResultCalculation(), "07");
	oFF.ResultCalculation.STANDARD_DEVIATION = oFF.XConstant.setupName(new oFF.ResultCalculation(), "08");
	oFF.ResultCalculation.VARIANCE = oFF.XConstant.setupName(new oFF.ResultCalculation(), "09");
	oFF.ResultCalculation.FIRST_VALUE = oFF.XConstant.setupName(new oFF.ResultCalculation(), "11");
	oFF.ResultCalculation.LAST_VALUE = oFF.XConstant.setupName(new oFF.ResultCalculation(), "12");
	oFF.ResultCalculation.SUMMATION_OF_ROUNDED_VALUES = oFF.XConstant.setupName(new oFF.ResultCalculation(), "13");
	oFF.ResultCalculation.HIDE = oFF.XConstant.setupName(new oFF.ResultCalculation(), "14");
};

oFF.ResultSetEncoding = function() {};
oFF.ResultSetEncoding.prototype = new oFF.XConstant();
oFF.ResultSetEncoding.prototype._ff_c = "ResultSetEncoding";

oFF.ResultSetEncoding.NONE = null;
oFF.ResultSetEncoding.AUTO = null;
oFF.ResultSetEncoding.DELTA_RUN_LENGTH = null;
oFF.ResultSetEncoding.staticSetup = function()
{
	oFF.ResultSetEncoding.NONE = oFF.XConstant.setupName(new oFF.ResultSetEncoding(), "None");
	oFF.ResultSetEncoding.AUTO = oFF.XConstant.setupName(new oFF.ResultSetEncoding(), "Auto");
	oFF.ResultSetEncoding.DELTA_RUN_LENGTH = oFF.XConstant.setupName(new oFF.ResultSetEncoding(), "DeltaRunLength");
};

oFF.ResultStructureElement = function() {};
oFF.ResultStructureElement.prototype = new oFF.XConstant();
oFF.ResultStructureElement.prototype._ff_c = "ResultStructureElement";

oFF.ResultStructureElement.MEMBERS = null;
oFF.ResultStructureElement.TOTAL = null;
oFF.ResultStructureElement.TOTAL_INCLUDED_MEMBERS = null;
oFF.ResultStructureElement.TOTAL_REMAINING_MEMBERS = null;
oFF.ResultStructureElement.staticSetup = function()
{
	oFF.ResultStructureElement.MEMBERS = oFF.XConstant.setupName(new oFF.ResultStructureElement(), "Members");
	oFF.ResultStructureElement.TOTAL = oFF.XConstant.setupName(new oFF.ResultStructureElement(), "Total");
	oFF.ResultStructureElement.TOTAL_INCLUDED_MEMBERS = oFF.XConstant.setupName(new oFF.ResultStructureElement(), "TotalIncludedMembers");
	oFF.ResultStructureElement.TOTAL_REMAINING_MEMBERS = oFF.XConstant.setupName(new oFF.ResultStructureElement(), "TotalRemainingMembers");
};
oFF.ResultStructureElement.getStructureElementByMemberType = function(memberType)
{
	if (memberType === oFF.MemberType.RESULT)
	{
		return oFF.ResultStructureElement.TOTAL;
	}
	if (memberType === oFF.MemberType.CONDITION_OTHERS_RESULT)
	{
		return oFF.ResultStructureElement.TOTAL_REMAINING_MEMBERS;
	}
	if (memberType === oFF.MemberType.CONDITION_RESULT)
	{
		return oFF.ResultStructureElement.TOTAL_INCLUDED_MEMBERS;
	}
	if (memberType.isTypeOf(oFF.MemberType.MEMBER))
	{
		return oFF.ResultStructureElement.MEMBERS;
	}
	return null;
};

oFF.ReturnedDataSelection = function() {};
oFF.ReturnedDataSelection.prototype = new oFF.XConstant();
oFF.ReturnedDataSelection.prototype._ff_c = "ReturnedDataSelection";

oFF.ReturnedDataSelection.s_lookup = null;
oFF.ReturnedDataSelection.CELL_DATA_TYPE = null;
oFF.ReturnedDataSelection.ACTIONS = null;
oFF.ReturnedDataSelection.CELL_FORMAT = null;
oFF.ReturnedDataSelection.CELL_VALUE_TYPES = null;
oFF.ReturnedDataSelection.CELL_MEASURE = null;
oFF.ReturnedDataSelection.EXCEPTION_ALERTLEVEL = null;
oFF.ReturnedDataSelection.EXCEPTION_NAME = null;
oFF.ReturnedDataSelection.EXCEPTION_SETTINGS = null;
oFF.ReturnedDataSelection.EXCEPTIONS = null;
oFF.ReturnedDataSelection.INPUT_ENABLED = null;
oFF.ReturnedDataSelection.INPUT_READINESS_STATES = null;
oFF.ReturnedDataSelection.NUMERIC_ROUNDING = null;
oFF.ReturnedDataSelection.NUMERIC_SHIFT = null;
oFF.ReturnedDataSelection.TUPLE_DISPLAY_LEVEL = null;
oFF.ReturnedDataSelection.TUPLE_DRILL_STATE = null;
oFF.ReturnedDataSelection.TUPLE_ELEMENT_IDS = null;
oFF.ReturnedDataSelection.TUPLE_ELEMENT_INDEXES = null;
oFF.ReturnedDataSelection.TUPLE_LEVEL = null;
oFF.ReturnedDataSelection.TUPLE_PARENT_INDEXES = null;
oFF.ReturnedDataSelection.UNIT_DESCRIPTIONS = null;
oFF.ReturnedDataSelection.UNIT_INDEX = null;
oFF.ReturnedDataSelection.UNIT_TYPES = null;
oFF.ReturnedDataSelection.UNITS = null;
oFF.ReturnedDataSelection.VALUES = null;
oFF.ReturnedDataSelection.VALUES_FORMATTED = null;
oFF.ReturnedDataSelection.VALUES_ROUNDED = null;
oFF.ReturnedDataSelection.CELL_EXPLAIN = null;
oFF.ReturnedDataSelection.staticSetup = function()
{
	oFF.ReturnedDataSelection.s_lookup = oFF.XHashMapByString.create();
	oFF.ReturnedDataSelection.ACTIONS = oFF.ReturnedDataSelection.createReturnedDataSelectionType("Actions");
	oFF.ReturnedDataSelection.CELL_DATA_TYPE = oFF.ReturnedDataSelection.createReturnedDataSelectionType("CellDataType");
	oFF.ReturnedDataSelection.CELL_FORMAT = oFF.ReturnedDataSelection.createReturnedDataSelectionType("CellFormat");
	oFF.ReturnedDataSelection.CELL_MEASURE = oFF.ReturnedDataSelection.createReturnedDataSelectionType("CellMeasure");
	oFF.ReturnedDataSelection.CELL_VALUE_TYPES = oFF.ReturnedDataSelection.createReturnedDataSelectionType("CellValueTypes");
	oFF.ReturnedDataSelection.EXCEPTION_ALERTLEVEL = oFF.ReturnedDataSelection.createReturnedDataSelectionType("ExceptionAlertLevel");
	oFF.ReturnedDataSelection.EXCEPTION_NAME = oFF.ReturnedDataSelection.createReturnedDataSelectionType("ExceptionName");
	oFF.ReturnedDataSelection.EXCEPTION_SETTINGS = oFF.ReturnedDataSelection.createReturnedDataSelectionType("ExceptionSettings");
	oFF.ReturnedDataSelection.EXCEPTIONS = oFF.ReturnedDataSelection.createReturnedDataSelectionType("Exceptions");
	oFF.ReturnedDataSelection.INPUT_ENABLED = oFF.ReturnedDataSelection.createReturnedDataSelectionType("InputEnabled");
	oFF.ReturnedDataSelection.INPUT_READINESS_STATES = oFF.ReturnedDataSelection.createReturnedDataSelectionType("InputReadinessStates");
	oFF.ReturnedDataSelection.NUMERIC_ROUNDING = oFF.ReturnedDataSelection.createReturnedDataSelectionType("NumericRounding");
	oFF.ReturnedDataSelection.NUMERIC_SHIFT = oFF.ReturnedDataSelection.createReturnedDataSelectionType("NumericShift");
	oFF.ReturnedDataSelection.TUPLE_DISPLAY_LEVEL = oFF.ReturnedDataSelection.createReturnedDataSelectionType("TupleDisplayLevel");
	oFF.ReturnedDataSelection.TUPLE_DRILL_STATE = oFF.ReturnedDataSelection.createReturnedDataSelectionType("TupleDrillState");
	oFF.ReturnedDataSelection.TUPLE_ELEMENT_IDS = oFF.ReturnedDataSelection.createReturnedDataSelectionType("TupleElementIds");
	oFF.ReturnedDataSelection.TUPLE_ELEMENT_INDEXES = oFF.ReturnedDataSelection.createReturnedDataSelectionType("TupleElementIndexes");
	oFF.ReturnedDataSelection.TUPLE_LEVEL = oFF.ReturnedDataSelection.createReturnedDataSelectionType("TupleLevel");
	oFF.ReturnedDataSelection.TUPLE_PARENT_INDEXES = oFF.ReturnedDataSelection.createReturnedDataSelectionType("TupleParentIndexes");
	oFF.ReturnedDataSelection.UNIT_DESCRIPTIONS = oFF.ReturnedDataSelection.createReturnedDataSelectionType("UnitDescriptions");
	oFF.ReturnedDataSelection.UNIT_INDEX = oFF.ReturnedDataSelection.createReturnedDataSelectionType("UnitIndex");
	oFF.ReturnedDataSelection.UNIT_TYPES = oFF.ReturnedDataSelection.createReturnedDataSelectionType("UnitTypes");
	oFF.ReturnedDataSelection.UNITS = oFF.ReturnedDataSelection.createReturnedDataSelectionType("Units");
	oFF.ReturnedDataSelection.VALUES = oFF.ReturnedDataSelection.createReturnedDataSelectionType("Values");
	oFF.ReturnedDataSelection.VALUES_FORMATTED = oFF.ReturnedDataSelection.createReturnedDataSelectionType("ValuesFormatted");
	oFF.ReturnedDataSelection.VALUES_ROUNDED = oFF.ReturnedDataSelection.createReturnedDataSelectionType("ValuesRounded");
	oFF.ReturnedDataSelection.CELL_EXPLAIN = oFF.ReturnedDataSelection.createReturnedDataSelectionType("CellExplain");
};
oFF.ReturnedDataSelection.createReturnedDataSelectionType = function(name)
{
	var newConstant = oFF.XConstant.setupName(new oFF.ReturnedDataSelection(), name);
	oFF.ReturnedDataSelection.s_lookup.put(name, newConstant);
	return newConstant;
};
oFF.ReturnedDataSelection.lookup = function(name)
{
	return oFF.ReturnedDataSelection.s_lookup.getByKey(name);
};
oFF.ReturnedDataSelection.getAllReturnedDataSelections = function()
{
	return oFF.ReturnedDataSelection.s_lookup.getValuesAsReadOnlyList();
};

oFF.RunningTotalOperator = function() {};
oFF.RunningTotalOperator.prototype = new oFF.XConstant();
oFF.RunningTotalOperator.prototype._ff_c = "RunningTotalOperator";

oFF.RunningTotalOperator.MIN = null;
oFF.RunningTotalOperator.MAX = null;
oFF.RunningTotalOperator.COUNT = null;
oFF.RunningTotalOperator.SUM = null;
oFF.RunningTotalOperator.AVERAGE = null;
oFF.RunningTotalOperator.staticSetupRunningTotalOperators = function()
{
	oFF.RunningTotalOperator.MIN = oFF.RunningTotalOperator.create("Min");
	oFF.RunningTotalOperator.MAX = oFF.RunningTotalOperator.create("Max");
	oFF.RunningTotalOperator.COUNT = oFF.RunningTotalOperator.create("Count");
	oFF.RunningTotalOperator.SUM = oFF.RunningTotalOperator.create("Sum");
	oFF.RunningTotalOperator.AVERAGE = oFF.RunningTotalOperator.create("Average");
};
oFF.RunningTotalOperator.create = function(name)
{
	var newConstant = new oFF.RunningTotalOperator();
	newConstant._setupInternal(name);
	return newConstant;
};

oFF.Scope = function() {};
oFF.Scope.prototype = new oFF.XConstant();
oFF.Scope.prototype._ff_c = "Scope";

oFF.Scope.GLOBAL = null;
oFF.Scope.USER = null;
oFF.Scope.s_allScopes = null;
oFF.Scope.staticSetup = function()
{
	oFF.Scope.s_allScopes = oFF.XHashMapByString.create();
	oFF.Scope.GLOBAL = oFF.Scope.create("Global");
	oFF.Scope.USER = oFF.Scope.create("User");
};
oFF.Scope.create = function(name)
{
	var newVariant = oFF.XConstant.setupName(new oFF.Scope(), name);
	oFF.Scope.s_allScopes.put(name, newVariant);
	return newVariant;
};
oFF.Scope.lookupByName = function(name)
{
	return oFF.Scope.s_allScopes.getByKey(name);
};

oFF.SetSign = function() {};
oFF.SetSign.prototype = new oFF.XConstant();
oFF.SetSign.prototype._ff_c = "SetSign";

oFF.SetSign.INCLUDING = null;
oFF.SetSign.EXCLUDING = null;
oFF.SetSign.s_lookup = null;
oFF.SetSign.staticSetup = function()
{
	oFF.SetSign.s_lookup = oFF.XHashMapByString.create();
	oFF.SetSign.INCLUDING = oFF.SetSign.create("INCLUDING");
	oFF.SetSign.EXCLUDING = oFF.SetSign.create("EXCLUDING");
};
oFF.SetSign.create = function(name)
{
	var newConstant = oFF.XConstant.setupName(new oFF.SetSign(), name);
	oFF.SetSign.s_lookup.put(name, newConstant);
	return newConstant;
};
oFF.SetSign.lookup = function(name)
{
	return oFF.SetSign.s_lookup.getByKey(name);
};

oFF.SingleValueCalculation = function() {};
oFF.SingleValueCalculation.prototype = new oFF.XConstant();
oFF.SingleValueCalculation.prototype._ff_c = "SingleValueCalculation";

oFF.SingleValueCalculation.NOT_DEFINED = null;
oFF.SingleValueCalculation.MINIMUM = null;
oFF.SingleValueCalculation.MAXIMUM = null;
oFF.SingleValueCalculation.SUM = null;
oFF.SingleValueCalculation.MINIMUM_VALUES_NOT_ZERO_NULL_ERROR = null;
oFF.SingleValueCalculation.COUNTER_FOR_ALL_DETAILED_VALUES = null;
oFF.SingleValueCalculation.COUNTER_FOR_ALL_DETAILED_VALUES_NZ_NULL_ERROR = null;
oFF.SingleValueCalculation.AVERAGE = null;
oFF.SingleValueCalculation.AVERAGE_DETAILED_VALUES_NOT_ZERO_NULL_ERROR = null;
oFF.SingleValueCalculation.HIDE = null;
oFF.SingleValueCalculation.MOVING_MAX_VALUE = null;
oFF.SingleValueCalculation.MOVING_MIN_VALUE = null;
oFF.SingleValueCalculation.MAX_VALUE_NOT_ZERO_NULL_ERROR = null;
oFF.SingleValueCalculation.RANK_NUMBER = null;
oFF.SingleValueCalculation.OLYMPIC_RANK_NUMBER = null;
oFF.SingleValueCalculation.NORMALIZED_UNRESTRICTED_OVERALL_RESULT = null;
oFF.SingleValueCalculation.NORMALIZED_OVERALL_RESULT = null;
oFF.SingleValueCalculation.NORMALIZED_NEXT_GROUP_LEVEL_RESULT = null;
oFF.SingleValueCalculation.staticSetup = function()
{
	oFF.SingleValueCalculation.NOT_DEFINED = oFF.XConstant.setupName(new oFF.SingleValueCalculation(), "NotDefined");
	oFF.SingleValueCalculation.SUM = oFF.XConstant.setupName(new oFF.SingleValueCalculation(), "1");
	oFF.SingleValueCalculation.MAXIMUM = oFF.XConstant.setupName(new oFF.SingleValueCalculation(), "2");
	oFF.SingleValueCalculation.MINIMUM = oFF.XConstant.setupName(new oFF.SingleValueCalculation(), "3");
	oFF.SingleValueCalculation.COUNTER_FOR_ALL_DETAILED_VALUES = oFF.XConstant.setupName(new oFF.SingleValueCalculation(), "4");
	oFF.SingleValueCalculation.COUNTER_FOR_ALL_DETAILED_VALUES_NZ_NULL_ERROR = oFF.XConstant.setupName(new oFF.SingleValueCalculation(), "5");
	oFF.SingleValueCalculation.AVERAGE = oFF.XConstant.setupName(new oFF.SingleValueCalculation(), "6");
	oFF.SingleValueCalculation.AVERAGE_DETAILED_VALUES_NOT_ZERO_NULL_ERROR = oFF.XConstant.setupName(new oFF.SingleValueCalculation(), "7");
	oFF.SingleValueCalculation.MINIMUM_VALUES_NOT_ZERO_NULL_ERROR = oFF.XConstant.setupName(new oFF.SingleValueCalculation(), "E");
	oFF.SingleValueCalculation.MAX_VALUE_NOT_ZERO_NULL_ERROR = oFF.XConstant.setupName(new oFF.SingleValueCalculation(), "D");
	oFF.SingleValueCalculation.MOVING_MIN_VALUE = oFF.XConstant.setupName(new oFF.SingleValueCalculation(), "B");
	oFF.SingleValueCalculation.NORMALIZED_NEXT_GROUP_LEVEL_RESULT = oFF.XConstant.setupName(new oFF.SingleValueCalculation(), "C");
	oFF.SingleValueCalculation.NORMALIZED_OVERALL_RESULT = oFF.XConstant.setupName(new oFF.SingleValueCalculation(), "G");
	oFF.SingleValueCalculation.NORMALIZED_UNRESTRICTED_OVERALL_RESULT = oFF.XConstant.setupName(new oFF.SingleValueCalculation(), "R");
	oFF.SingleValueCalculation.RANK_NUMBER = oFF.XConstant.setupName(new oFF.SingleValueCalculation(), "S");
	oFF.SingleValueCalculation.OLYMPIC_RANK_NUMBER = oFF.XConstant.setupName(new oFF.SingleValueCalculation(), "O");
	oFF.SingleValueCalculation.HIDE = oFF.XConstant.setupName(new oFF.SingleValueCalculation(), "0");
};

oFF.TableHeaderCompactionType = function() {};
oFF.TableHeaderCompactionType.prototype = new oFF.XConstant();
oFF.TableHeaderCompactionType.prototype._ff_c = "TableHeaderCompactionType";

oFF.TableHeaderCompactionType.s_instances = null;
oFF.TableHeaderCompactionType.NONE = null;
oFF.TableHeaderCompactionType.COLUMN = null;
oFF.TableHeaderCompactionType.ROW = null;
oFF.TableHeaderCompactionType.PREFERABLY_COLUMN = null;
oFF.TableHeaderCompactionType.PREFERABLY_ROW = null;
oFF.TableHeaderCompactionType.DEFAULT = null;
oFF.TableHeaderCompactionType.staticSetup = function()
{
	oFF.TableHeaderCompactionType.s_instances = oFF.XHashMapByString.create();
	oFF.TableHeaderCompactionType.NONE = oFF.TableHeaderCompactionType.create("None");
	oFF.TableHeaderCompactionType.COLUMN = oFF.TableHeaderCompactionType.create("Column");
	oFF.TableHeaderCompactionType.ROW = oFF.TableHeaderCompactionType.create("Row");
	oFF.TableHeaderCompactionType.PREFERABLY_COLUMN = oFF.TableHeaderCompactionType.create("PreferablyColumn");
	oFF.TableHeaderCompactionType.PREFERABLY_ROW = oFF.TableHeaderCompactionType.create("PreferablyRow");
	oFF.TableHeaderCompactionType.DEFAULT = oFF.TableHeaderCompactionType.create("Default");
};
oFF.TableHeaderCompactionType.create = function(name)
{
	var object = oFF.XConstant.setupName(new oFF.TableHeaderCompactionType(), name);
	oFF.TableHeaderCompactionType.s_instances.put(name, object);
	return object;
};
oFF.TableHeaderCompactionType.lookup = function(name)
{
	return oFF.TableHeaderCompactionType.s_instances.getByKey(name);
};

oFF.TableLineStyle = function() {};
oFF.TableLineStyle.prototype = new oFF.XConstant();
oFF.TableLineStyle.prototype._ff_c = "TableLineStyle";

oFF.TableLineStyle.s_instances = null;
oFF.TableLineStyle.NONE = null;
oFF.TableLineStyle.SOLID = null;
oFF.TableLineStyle.DASHED = null;
oFF.TableLineStyle.DOTTED = null;
oFF.TableLineStyle.INHERIT = null;
oFF.TableLineStyle.staticSetup = function()
{
	oFF.TableLineStyle.s_instances = oFF.XHashMapByString.create();
	oFF.TableLineStyle.NONE = oFF.TableLineStyle.create("None");
	oFF.TableLineStyle.SOLID = oFF.TableLineStyle.create("Solid");
	oFF.TableLineStyle.DASHED = oFF.TableLineStyle.create("Dashed");
	oFF.TableLineStyle.DOTTED = oFF.TableLineStyle.create("Dotted");
	oFF.TableLineStyle.INHERIT = oFF.TableLineStyle.create("Inherit");
};
oFF.TableLineStyle.create = function(name)
{
	var object = oFF.XConstant.setupName(new oFF.TableLineStyle(), name);
	oFF.TableLineStyle.s_instances.put(name, object);
	return object;
};
oFF.TableLineStyle.lookup = function(name)
{
	return oFF.TableLineStyle.s_instances.getByKey(name);
};

oFF.TableMemberHeaderHandling = function() {};
oFF.TableMemberHeaderHandling.prototype = new oFF.XConstant();
oFF.TableMemberHeaderHandling.prototype._ff_c = "TableMemberHeaderHandling";

oFF.TableMemberHeaderHandling.s_instances = null;
oFF.TableMemberHeaderHandling.BAND = null;
oFF.TableMemberHeaderHandling.FIRST_MEMBER = null;
oFF.TableMemberHeaderHandling.REPETITIVE = null;
oFF.TableMemberHeaderHandling.MERGE = null;
oFF.TableMemberHeaderHandling.INHERIT = null;
oFF.TableMemberHeaderHandling.staticSetup = function()
{
	oFF.TableMemberHeaderHandling.s_instances = oFF.XHashMapByString.create();
	oFF.TableMemberHeaderHandling.BAND = oFF.TableMemberHeaderHandling.create("Band");
	oFF.TableMemberHeaderHandling.FIRST_MEMBER = oFF.TableMemberHeaderHandling.create("FirstMember");
	oFF.TableMemberHeaderHandling.REPETITIVE = oFF.TableMemberHeaderHandling.create("Repetitive");
	oFF.TableMemberHeaderHandling.MERGE = oFF.TableMemberHeaderHandling.create("Merge");
	oFF.TableMemberHeaderHandling.INHERIT = oFF.TableMemberHeaderHandling.create("Inherit");
};
oFF.TableMemberHeaderHandling.create = function(name)
{
	var object = oFF.XConstant.setupName(new oFF.TableMemberHeaderHandling(), name);
	oFF.TableMemberHeaderHandling.s_instances.put(name, object);
	return object;
};
oFF.TableMemberHeaderHandling.lookup = function(name)
{
	return oFF.TableMemberHeaderHandling.s_instances.getByKey(name);
};

oFF.TablePageBreakHandling = function() {};
oFF.TablePageBreakHandling.prototype = new oFF.XConstant();
oFF.TablePageBreakHandling.prototype._ff_c = "TablePageBreakHandling";

oFF.TablePageBreakHandling.s_instances = null;
oFF.TablePageBreakHandling.AUTOMATIC = null;
oFF.TablePageBreakHandling.ALWAYS = null;
oFF.TablePageBreakHandling.AVOID = null;
oFF.TablePageBreakHandling.staticSetup = function()
{
	oFF.TablePageBreakHandling.s_instances = oFF.XHashMapByString.create();
	oFF.TablePageBreakHandling.AUTOMATIC = oFF.TablePageBreakHandling.create("Automatic");
	oFF.TablePageBreakHandling.ALWAYS = oFF.TablePageBreakHandling.create("Always");
	oFF.TablePageBreakHandling.AVOID = oFF.TablePageBreakHandling.create("Avoid");
};
oFF.TablePageBreakHandling.create = function(name)
{
	var object = oFF.XConstant.setupName(new oFF.TablePageBreakHandling(), name);
	oFF.TablePageBreakHandling.s_instances.put(name, object);
	return object;
};
oFF.TablePageBreakHandling.lookup = function(name)
{
	return oFF.TablePageBreakHandling.s_instances.getByKey(name);
};

oFF.UsageShapeType = function() {};
oFF.UsageShapeType.prototype = new oFF.XConstant();
oFF.UsageShapeType.prototype._ff_c = "UsageShapeType";

oFF.UsageShapeType.NOT_VISIBLE = null;
oFF.UsageShapeType.DISPLAY_ONLY = null;
oFF.UsageShapeType.CHANGE_TO_EXISTING = null;
oFF.UsageShapeType.ADD_NEW = null;
oFF.UsageShapeType.staticSetupUsageShapey = function()
{
	oFF.UsageShapeType.NOT_VISIBLE = oFF.XConstant.setupName(new oFF.UsageShapeType(), "I");
	oFF.UsageShapeType.DISPLAY_ONLY = oFF.XConstant.setupName(new oFF.UsageShapeType(), "D");
	oFF.UsageShapeType.CHANGE_TO_EXISTING = oFF.XConstant.setupName(new oFF.UsageShapeType(), "C");
	oFF.UsageShapeType.ADD_NEW = oFF.XConstant.setupName(new oFF.UsageShapeType(), "A");
};
oFF.UsageShapeType.getUsageShapeType = function(type)
{
	if (oFF.XString.isEqual(oFF.UsageShapeType.NOT_VISIBLE.getName(), type))
	{
		return oFF.UsageShapeType.NOT_VISIBLE;
	}
	if (oFF.XString.isEqual(oFF.UsageShapeType.DISPLAY_ONLY.getName(), type))
	{
		return oFF.UsageShapeType.DISPLAY_ONLY;
	}
	if (oFF.XString.isEqual(oFF.UsageShapeType.CHANGE_TO_EXISTING.getName(), type))
	{
		return oFF.UsageShapeType.CHANGE_TO_EXISTING;
	}
	if (oFF.XString.isEqual(oFF.UsageShapeType.ADD_NEW.getName(), type))
	{
		return oFF.UsageShapeType.ADD_NEW;
	}
	return null;
};

oFF.ValueException = function() {};
oFF.ValueException.prototype = new oFF.XConstant();
oFF.ValueException.prototype._ff_c = "ValueException";

oFF.ValueException.NORMAL = null;
oFF.ValueException.NULL_VALUE = null;
oFF.ValueException.ZERO = null;
oFF.ValueException.UNDEFINED = null;
oFF.ValueException.OVERFLOW = null;
oFF.ValueException.NO_PRESENTATION = null;
oFF.ValueException.DIFF0 = null;
oFF.ValueException.ERROR = null;
oFF.ValueException.NO_AUTHORITY = null;
oFF.ValueException.MIXED_CURRENCIES_OR_UNITS = null;
oFF.ValueException.UNDEFINED_NOP = null;
oFF.ValueException.s_instances = null;
oFF.ValueException.staticSetup = function()
{
	oFF.ValueException.s_instances = oFF.XHashMapByString.create();
	oFF.ValueException.NORMAL = oFF.ValueException.create("Normal", true, 0);
	oFF.ValueException.NULL_VALUE = oFF.ValueException.create("NullValue", true, -1);
	oFF.ValueException.ZERO = oFF.ValueException.create("Zero", true, 0);
	oFF.ValueException.UNDEFINED = oFF.ValueException.create("Undefined", false, 3);
	oFF.ValueException.OVERFLOW = oFF.ValueException.create("Overflow", false, 5);
	oFF.ValueException.NO_PRESENTATION = oFF.ValueException.create("NoPresentation", false, 4);
	oFF.ValueException.DIFF0 = oFF.ValueException.create("Diff0", false, 6);
	oFF.ValueException.ERROR = oFF.ValueException.create("Error", false, 7);
	oFF.ValueException.NO_AUTHORITY = oFF.ValueException.create("NoAuthority", false, 2);
	oFF.ValueException.MIXED_CURRENCIES_OR_UNITS = oFF.ValueException.create("MixedCurrenciesOrUnits", false, 2);
	oFF.ValueException.UNDEFINED_NOP = oFF.ValueException.create("UndefinedNop", false, 2);
};
oFF.ValueException.create = function(constant, validValue, naturalOrderValue)
{
	var sp = oFF.XConstant.setupName(new oFF.ValueException(), constant);
	sp.setupExt(validValue, naturalOrderValue);
	oFF.ValueException.s_instances.put(constant, sp);
	return sp;
};
oFF.ValueException.get = function(name)
{
	return oFF.ValueException.s_instances.getByKey(name);
};
oFF.ValueException.prototype.m_valid = false;
oFF.ValueException.prototype.m_naturalOrderValue = 0;
oFF.ValueException.prototype.setupExt = function(validValue, naturalOrderValue)
{
	this.m_valid = validValue;
	this.m_naturalOrderValue = naturalOrderValue;
};
oFF.ValueException.prototype.isValidValue = function()
{
	return this.m_valid;
};
oFF.ValueException.prototype.compareTo = function(objectToCompare)
{
	return objectToCompare.m_naturalOrderValue - this.m_naturalOrderValue;
};

oFF.ValueSign = function() {};
oFF.ValueSign.prototype = new oFF.XConstant();
oFF.ValueSign.prototype._ff_c = "ValueSign";

oFF.ValueSign.NORMAL = null;
oFF.ValueSign.NULL_VALUE = null;
oFF.ValueSign.ZERO = null;
oFF.ValueSign.UNDEFINED = null;
oFF.ValueSign.UNBOOKED = null;
oFF.ValueSign.POSITIVE = null;
oFF.ValueSign.NEGATIVE = null;
oFF.ValueSign.s_instances = null;
oFF.ValueSign.staticSetup = function()
{
	oFF.ValueSign.s_instances = oFF.XHashMapByString.create();
	oFF.ValueSign.NORMAL = oFF.ValueSign.create("Normal");
	oFF.ValueSign.NULL_VALUE = oFF.ValueSign.create("Null");
	oFF.ValueSign.ZERO = oFF.ValueSign.create("Zero");
	oFF.ValueSign.UNDEFINED = oFF.ValueSign.create("Undefined");
	oFF.ValueSign.UNBOOKED = oFF.ValueSign.create("Unbooked");
	oFF.ValueSign.POSITIVE = oFF.ValueSign.create("Positive");
	oFF.ValueSign.NEGATIVE = oFF.ValueSign.create("Negative");
};
oFF.ValueSign.create = function(constant)
{
	var sp = oFF.XConstant.setupName(new oFF.ValueSign(), constant);
	oFF.ValueSign.s_instances.put(constant, sp);
	return sp;
};
oFF.ValueSign.get = function(name)
{
	return oFF.ValueSign.s_instances.getByKey(name);
};

oFF.VariableMode = function() {};
oFF.VariableMode.prototype = new oFF.XConstant();
oFF.VariableMode.prototype._ff_c = "VariableMode";

oFF.VariableMode.SUBMIT_AND_REINIT = null;
oFF.VariableMode.DIRECT_VALUE_TRANSFER = null;
oFF.VariableMode.staticSetup = function()
{
	oFF.VariableMode.SUBMIT_AND_REINIT = oFF.XConstant.setupName(new oFF.VariableMode(), "SubmitAndReInit");
	oFF.VariableMode.DIRECT_VALUE_TRANSFER = oFF.XConstant.setupName(new oFF.VariableMode(), "DirectValueTransfer");
};

oFF.VisibilityType = function() {};
oFF.VisibilityType.prototype = new oFF.XConstant();
oFF.VisibilityType.prototype._ff_c = "VisibilityType";

oFF.VisibilityType.CENTRAL = null;
oFF.VisibilityType.CENTRAL_NOT_VISIBLE = null;
oFF.VisibilityType.CENTRAL_DISPLAY_ONLY = null;
oFF.VisibilityType.CENTRAL_CHANGE_TO_EXISTING = null;
oFF.VisibilityType.CENTRAL_ADD_NEW = null;
oFF.VisibilityType.LOCAL = null;
oFF.VisibilityType.LOCAL_NOT_VISIBLE = null;
oFF.VisibilityType.LOCAL_DISPLAY_ONLY = null;
oFF.VisibilityType.LOCAL_CHANGE_TO_EXISTING = null;
oFF.VisibilityType.LOCAL_ADD_NEW = null;
oFF.VisibilityType.staticSetupVisibility = function()
{
	oFF.VisibilityType.CENTRAL = oFF.XConstant.setupName(new oFF.VisibilityType(), "C");
	oFF.VisibilityType.CENTRAL_NOT_VISIBLE = oFF.XConstant.setupName(new oFF.VisibilityType(), "C/I");
	oFF.VisibilityType.CENTRAL_DISPLAY_ONLY = oFF.XConstant.setupName(new oFF.VisibilityType(), "C/D");
	oFF.VisibilityType.CENTRAL_CHANGE_TO_EXISTING = oFF.XConstant.setupName(new oFF.VisibilityType(), "C/C");
	oFF.VisibilityType.CENTRAL_ADD_NEW = oFF.XConstant.setupName(new oFF.VisibilityType(), "C/A");
	oFF.VisibilityType.LOCAL = oFF.XConstant.setupName(new oFF.VisibilityType(), "L");
	oFF.VisibilityType.LOCAL_NOT_VISIBLE = oFF.XConstant.setupName(new oFF.VisibilityType(), "L/I");
	oFF.VisibilityType.LOCAL_DISPLAY_ONLY = oFF.XConstant.setupName(new oFF.VisibilityType(), "L/D");
	oFF.VisibilityType.LOCAL_CHANGE_TO_EXISTING = oFF.XConstant.setupName(new oFF.VisibilityType(), "L/C");
	oFF.VisibilityType.LOCAL_ADD_NEW = oFF.XConstant.setupName(new oFF.VisibilityType(), "L/A");
};
oFF.VisibilityType.getLocalityType = function(type)
{
	if (oFF.isNull(type) || oFF.XString.size(type.getName()) < 1)
	{
		return null;
	}
	return oFF.LocalityType.getLocalityType(oFF.XString.substring(type.getName(), 0, 1));
};
oFF.VisibilityType.getUsageShapeType = function(type)
{
	if (oFF.isNull(type) || oFF.XString.size(type.getName()) < 3)
	{
		return null;
	}
	return oFF.UsageShapeType.getUsageShapeType(oFF.XString.substring(type.getName(), 2, 3));
};

oFF.WindowFunctionType = function() {};
oFF.WindowFunctionType.prototype = new oFF.XConstant();
oFF.WindowFunctionType.prototype._ff_c = "WindowFunctionType";

oFF.WindowFunctionType.SUM = null;
oFF.WindowFunctionType.AVERAGE = null;
oFF.WindowFunctionType.COUNT = null;
oFF.WindowFunctionType.MIN = null;
oFF.WindowFunctionType.MAX = null;
oFF.WindowFunctionType.s_instances = null;
oFF.WindowFunctionType.staticSetup = function()
{
	oFF.WindowFunctionType.s_instances = oFF.XHashMapByString.create();
	oFF.WindowFunctionType.SUM = oFF.WindowFunctionType.create("SUM");
	oFF.WindowFunctionType.AVERAGE = oFF.WindowFunctionType.create("AVERAGE");
	oFF.WindowFunctionType.COUNT = oFF.WindowFunctionType.create("COUNT");
	oFF.WindowFunctionType.MIN = oFF.WindowFunctionType.create("MIN");
	oFF.WindowFunctionType.MAX = oFF.WindowFunctionType.create("MAX");
};
oFF.WindowFunctionType.create = function(name)
{
	var operationType = oFF.XConstant.setupName(new oFF.WindowFunctionType(), name);
	oFF.WindowFunctionType.s_instances.put(name, operationType);
	return operationType;
};
oFF.WindowFunctionType.lookup = function(name)
{
	return oFF.WindowFunctionType.s_instances.getByKey(name);
};

oFF.ZeroSuppressionType = function() {};
oFF.ZeroSuppressionType.prototype = new oFF.XConstant();
oFF.ZeroSuppressionType.prototype._ff_c = "ZeroSuppressionType";

oFF.ZeroSuppressionType.NONE = null;
oFF.ZeroSuppressionType.TOTAL_IS_ZERO = null;
oFF.ZeroSuppressionType.ALL_CELLS_ARE_ZERO = null;
oFF.ZeroSuppressionType.ALL_CELLS_ARE_NULL = null;
oFF.ZeroSuppressionType.s_all = null;
oFF.ZeroSuppressionType.create = function(constant, index)
{
	var object = oFF.XConstant.setupName(new oFF.ZeroSuppressionType(), constant);
	object.m_index = index;
	oFF.ZeroSuppressionType.s_all.add(object);
	return object;
};
oFF.ZeroSuppressionType.staticSetup = function()
{
	oFF.ZeroSuppressionType.s_all = oFF.XSetOfNameObject.create();
	oFF.ZeroSuppressionType.NONE = oFF.ZeroSuppressionType.create("NONE", 0);
	oFF.ZeroSuppressionType.TOTAL_IS_ZERO = oFF.ZeroSuppressionType.create("TOTAL_IS_ZERO", 1);
	oFF.ZeroSuppressionType.ALL_CELLS_ARE_ZERO = oFF.ZeroSuppressionType.create("ALl_CELLS_ARE_ZERO", 2);
	oFF.ZeroSuppressionType.ALL_CELLS_ARE_NULL = oFF.ZeroSuppressionType.create("ALl_CELLS_ARE_NULL", 3);
};
oFF.ZeroSuppressionType.lookup = function(name)
{
	return oFF.ZeroSuppressionType.s_all.getByKey(name);
};
oFF.ZeroSuppressionType.prototype.m_index = 0;
oFF.ZeroSuppressionType.prototype.getIndex = function()
{
	return this.m_index;
};

oFF.DrillOperationType = function() {};
oFF.DrillOperationType.prototype = new oFF.XConstant();
oFF.DrillOperationType.prototype._ff_c = "DrillOperationType";

oFF.DrillOperationType.CONTEXT = null;
oFF.DrillOperationType.ROOT = null;
oFF.DrillOperationType.staticSetup = function()
{
	oFF.DrillOperationType.CONTEXT = oFF.XConstant.setupName(new oFF.DrillOperationType(), "Context");
	oFF.DrillOperationType.ROOT = oFF.XConstant.setupName(new oFF.DrillOperationType(), "Root");
};

oFF.FormulaExceptionType = function() {};
oFF.FormulaExceptionType.prototype = new oFF.XConstant();
oFF.FormulaExceptionType.prototype._ff_c = "FormulaExceptionType";

oFF.FormulaExceptionType.POSITIVE_RATIO_NEGATIVE_VARIANCE = null;
oFF.FormulaExceptionType.BASE_MEASURE_ONLY = null;
oFF.FormulaExceptionType.s_instances = null;
oFF.FormulaExceptionType.staticSetup = function()
{
	oFF.FormulaExceptionType.s_instances = oFF.XHashMapByString.create();
	oFF.FormulaExceptionType.POSITIVE_RATIO_NEGATIVE_VARIANCE = oFF.FormulaExceptionType.create("POSITIVE_RATIO_NEGATIVE_VARIANCE");
	oFF.FormulaExceptionType.BASE_MEASURE_ONLY = oFF.FormulaExceptionType.create("BASE_MEASURE_ONLY");
};
oFF.FormulaExceptionType.create = function(name)
{
	var type = oFF.XConstant.setupName(new oFF.FormulaExceptionType(), name);
	oFF.FormulaExceptionType.s_instances.put(name, type);
	return type;
};
oFF.FormulaExceptionType.lookup = function(name)
{
	return oFF.FormulaExceptionType.s_instances.getByKey(name);
};

oFF.QFormulaExceptionConstants = function() {};
oFF.QFormulaExceptionConstants.prototype = new oFF.XConstant();
oFF.QFormulaExceptionConstants.prototype._ff_c = "QFormulaExceptionConstants";

oFF.QFormulaExceptionConstants.MODEL_THRESHOLD_PREFIX = null;
oFF.QFormulaExceptionConstants.staticSetup = function()
{
	oFF.QFormulaExceptionConstants.MODEL_THRESHOLD_PREFIX = oFF.XConstant.setupName(new oFF.QFormulaExceptionConstants(), "ModelThreshold");
};

oFF.QGeoConstants = function() {};
oFF.QGeoConstants.prototype = new oFF.XConstant();
oFF.QGeoConstants.prototype._ff_c = "QGeoConstants";

oFF.QGeoConstants.CHOROPLETH_HIERARCHY_DIMENSIONS = null;
oFF.QGeoConstants.CHOROPLETH_HIERARCHY_PACKAGENAME = "sap.fpa.services.spatial.choropleth";
oFF.QGeoConstants.CHOROPLETH_HIERARCHY_OBJECTNAME = "CHOROPLETH_CUSTOM_HIERARCHY";
oFF.QGeoConstants.CHOROPLETH_HIERARCHY_SCHEMANAME = "_SYS_BIC";
oFF.QGeoConstants.CHOROPLETH_DATASOURCE_PACKAGENAME = "FPA_SPATIAL_DATA.choropleth";
oFF.QGeoConstants.CHOROPLETH_DATASOURCE_OBJECTNAME = "CHOROPLETH";
oFF.QGeoConstants.CHOROPLETH_DATASOURCE_SCHEMANAME = "_SYS_BIC";
oFF.QGeoConstants.CHOROPLETH_DATASOURCE_VERSION_OBJECTNAME = "VERSION";
oFF.QGeoConstants.CHOROPLETH_HIERARCHY_SYNONYM_PACKAGENAME = "";
oFF.QGeoConstants.CHOROPLETH_HIERARCHY_SYNONYM_OBJECTNAME = "SAC_CHOROPLETH_HIER";
oFF.QGeoConstants.CHOROPLETH_HIERARCHY_SYNONYM_SCHEMANAME = "PUBLIC";
oFF.QGeoConstants.CHOROPLETH_DATASOURCE_SYNONYM_PACKAGENAME = "";
oFF.QGeoConstants.CHOROPLETH_DATASOURCE_SYNONYM_OBJECTNAME = "SAC_CHOROPLETH_DATA";
oFF.QGeoConstants.CHOROPLETH_DATASOURCE_SYNONYM_SCHEMANAME = "PUBLIC";
oFF.QGeoConstants.CHOROPLETH_DATASOURCE_SYNONYM_VERSION_OBJECTNAME = "VERSION";
oFF.QGeoConstants.SPATIAL_JOIN_PARAMETER_0 = "0";
oFF.QGeoConstants.SPATIAL_JOIN_PARAMETER_METER = "meter";
oFF.QGeoConstants.CHOROPLETH_METADATA_FEATURE_ID = "FEATURE_ID";
oFF.QGeoConstants.CHOROPLETH_METADATA_AREA_ID = "AREA_ID";
oFF.QGeoConstants.CHOROPLETH_METADATA_SHAPEPOINT = "SHAPEPOINT";
oFF.QGeoConstants.CHOROPLETH_METADATA_LEVEL = "LEVEL";
oFF.QGeoConstants.CHOROPLETH_METADATA_CUSTOM_ID = "ID";
oFF.QGeoConstants.CHOROPLETH_METADATA_IS_LEAF = "IS_LEAF";
oFF.QGeoConstants.CHOROPLETH_LEVEL_COLUMN_LABEL_NAME = "name";
oFF.QGeoConstants.SPATIAL_REFERENCE_WGS_1984_WEB_MERCATOR_AUXILIARY_SPHERE = 3857;
oFF.QGeoConstants.SPATIAL_REFERENCE_GCS_WGS_1984 = 4326;
oFF.QGeoConstants.AREA_ENRICHED_PREFIXES = null;
oFF.QGeoConstants.AGILE_AREA_SEMANTIC_TYPES = null;
oFF.QGeoConstants.AGILE_LATLONG_SEMANTIC_TYPE = "SAC::GeoLatLong";
oFF.QGeoConstants.staticSetup = function()
{
	oFF.QGeoConstants.setChoroplethHierarchyDimensions();
	oFF.QGeoConstants.setSupportedAreaEnrichedPrefixes();
	oFF.QGeoConstants.setAgileAreaSemanticTypes();
};
oFF.QGeoConstants.setChoroplethHierarchyDimensions = function()
{
	oFF.QGeoConstants.CHOROPLETH_HIERARCHY_DIMENSIONS = oFF.XListOfString.create();
	oFF.QGeoConstants.CHOROPLETH_HIERARCHY_DIMENSIONS.add("HIERARCHYID");
	oFF.QGeoConstants.CHOROPLETH_HIERARCHY_DIMENSIONS.add("NAME");
	oFF.QGeoConstants.CHOROPLETH_HIERARCHY_DIMENSIONS.add("LEVEL");
	oFF.QGeoConstants.CHOROPLETH_HIERARCHY_DIMENSIONS.add("LNAME");
	oFF.QGeoConstants.CHOROPLETH_HIERARCHY_DIMENSIONS.add("LOCATION");
	oFF.QGeoConstants.CHOROPLETH_HIERARCHY_DIMENSIONS.add("OBJECT");
	oFF.QGeoConstants.CHOROPLETH_HIERARCHY_DIMENSIONS.add("PACKAGE");
	oFF.QGeoConstants.CHOROPLETH_HIERARCHY_DIMENSIONS.add("SCHEMA");
	oFF.QGeoConstants.CHOROPLETH_HIERARCHY_DIMENSIONS.add("COLUMN");
	oFF.QGeoConstants.CHOROPLETH_HIERARCHY_DIMENSIONS.add("COLUMNLABEL");
};
oFF.QGeoConstants.setSupportedAreaEnrichedPrefixes = function()
{
	oFF.QGeoConstants.AREA_ENRICHED_PREFIXES = oFF.XListOfString.create();
	oFF.QGeoConstants.AREA_ENRICHED_PREFIXES.add("COUNTRY");
	oFF.QGeoConstants.AREA_ENRICHED_PREFIXES.add("REGION");
	oFF.QGeoConstants.AREA_ENRICHED_PREFIXES.add("SUBREGION1");
};
oFF.QGeoConstants.setAgileAreaSemanticTypes = function()
{
	oFF.QGeoConstants.AGILE_AREA_SEMANTIC_TYPES = oFF.XListOfString.create();
	oFF.QGeoConstants.AGILE_AREA_SEMANTIC_TYPES.add("SAC::GeoAreaId_Level1");
	oFF.QGeoConstants.AGILE_AREA_SEMANTIC_TYPES.add("SAC::GeoAreaId_Level2");
	oFF.QGeoConstants.AGILE_AREA_SEMANTIC_TYPES.add("SAC::GeoAreaId_Level3");
};

oFF.HierarchyType = function() {};
oFF.HierarchyType.prototype = new oFF.XConstant();
oFF.HierarchyType.prototype._ff_c = "HierarchyType";

oFF.HierarchyType.UNKNOWN = null;
oFF.HierarchyType.FULLY_BALANCED = null;
oFF.HierarchyType.RAGGED_BALANCED = null;
oFF.HierarchyType.UNBALANCED = null;
oFF.HierarchyType.NETWORK = null;
oFF.HierarchyType.s_instances = null;
oFF.HierarchyType.staticSetup = function()
{
	oFF.HierarchyType.s_instances = oFF.XHashMapByString.create();
	oFF.HierarchyType.UNKNOWN = oFF.HierarchyType.create("Unknown", false);
	oFF.HierarchyType.FULLY_BALANCED = oFF.HierarchyType.create("FullyBalanced", true);
	oFF.HierarchyType.RAGGED_BALANCED = oFF.HierarchyType.create("RaggedBalanced", true);
	oFF.HierarchyType.NETWORK = oFF.HierarchyType.create("Network", false);
	oFF.HierarchyType.UNBALANCED = oFF.HierarchyType.create("Unbalanced", false);
};
oFF.HierarchyType.create = function(camelCaseName, leveledHierarchy)
{
	var newConstant = new oFF.HierarchyType();
	newConstant._setupInternal(camelCaseName);
	newConstant.m_leveledHierarchy = leveledHierarchy;
	oFF.HierarchyType.s_instances.put(camelCaseName, newConstant);
	return newConstant;
};
oFF.HierarchyType.lookup = function(name)
{
	var result = oFF.HierarchyType.s_instances.getByKey(name);
	if (oFF.isNull(result))
	{
		return oFF.HierarchyType.UNKNOWN;
	}
	return result;
};
oFF.HierarchyType.prototype.m_leveledHierarchy = false;
oFF.HierarchyType.prototype.isLeveledHierarchy = function()
{
	return this.m_leveledHierarchy;
};

oFF.PlanningContextType = function() {};
oFF.PlanningContextType.prototype = new oFF.XConstant();
oFF.PlanningContextType.prototype._ff_c = "PlanningContextType";

oFF.PlanningContextType.DATA_AREA = null;
oFF.PlanningContextType.PLANNING_MODEL = null;
oFF.PlanningContextType.staticSetup = function()
{
	oFF.PlanningContextType.DATA_AREA = oFF.XConstant.setupName(new oFF.PlanningContextType(), "DATA_AREA");
	oFF.PlanningContextType.PLANNING_MODEL = oFF.XConstant.setupName(new oFF.PlanningContextType(), "PLANNING_MODEL");
};

oFF.PlanningMode = function() {};
oFF.PlanningMode.prototype = new oFF.XConstant();
oFF.PlanningMode.prototype._ff_c = "PlanningMode";

oFF.PlanningMode.FOR_PRIVATE_VERSIONS_ONLY = null;
oFF.PlanningMode.DISABLE_PLANNING = null;
oFF.PlanningMode.FORCE_PLANNING = null;
oFF.PlanningMode.SERVER_DEFAULT = null;
oFF.PlanningMode.staticSetup = function()
{
	oFF.PlanningMode.FOR_PRIVATE_VERSIONS_ONLY = oFF.XConstant.setupName(new oFF.PlanningMode(), "ForPrivateVersionsOnly");
	oFF.PlanningMode.DISABLE_PLANNING = oFF.XConstant.setupName(new oFF.PlanningMode(), "DisablePlanning");
	oFF.PlanningMode.FORCE_PLANNING = oFF.XConstant.setupName(new oFF.PlanningMode(), "ForcePlanning");
	oFF.PlanningMode.SERVER_DEFAULT = oFF.XConstant.setupName(new oFF.PlanningMode(), "ServerDefault");
};

oFF.PlanningVersionRestrictionType = function() {};
oFF.PlanningVersionRestrictionType.prototype = new oFF.XConstant();
oFF.PlanningVersionRestrictionType.prototype._ff_c = "PlanningVersionRestrictionType";

oFF.PlanningVersionRestrictionType.NONE = null;
oFF.PlanningVersionRestrictionType.ONLY_PRIVATE_VERSIONS = null;
oFF.PlanningVersionRestrictionType.CONSTRAIN_PRIVATE_VERSIONS = null;
oFF.PlanningVersionRestrictionType.SERVER_DEFAULT = null;
oFF.PlanningVersionRestrictionType.staticSetup = function()
{
	oFF.PlanningVersionRestrictionType.NONE = oFF.XConstant.setupName(new oFF.PlanningVersionRestrictionType(), "NONE");
	oFF.PlanningVersionRestrictionType.ONLY_PRIVATE_VERSIONS = oFF.XConstant.setupName(new oFF.PlanningVersionRestrictionType(), "OnlyPrivateVersion");
	oFF.PlanningVersionRestrictionType.CONSTRAIN_PRIVATE_VERSIONS = oFF.XConstant.setupName(new oFF.PlanningVersionRestrictionType(), "ConstrainPrivateVersions");
	oFF.PlanningVersionRestrictionType.SERVER_DEFAULT = oFF.XConstant.setupName(new oFF.PlanningVersionRestrictionType(), "ServerDefault");
};
oFF.PlanningVersionRestrictionType.prototype.isExplicitlyRestricted = function()
{
	return this !== oFF.PlanningVersionRestrictionType.NONE && this !== oFF.PlanningVersionRestrictionType.SERVER_DEFAULT;
};

oFF.PlanningVersionSettingsMode = function() {};
oFF.PlanningVersionSettingsMode.prototype = new oFF.XConstant();
oFF.PlanningVersionSettingsMode.prototype._ff_c = "PlanningVersionSettingsMode";

oFF.PlanningVersionSettingsMode.SERVER_DEFAULT = null;
oFF.PlanningVersionSettingsMode.QUERY_SERVICE = null;
oFF.PlanningVersionSettingsMode.PLANNING_SERVICE = null;
oFF.PlanningVersionSettingsMode.staticSetup = function()
{
	oFF.PlanningVersionSettingsMode.SERVER_DEFAULT = oFF.XConstant.setupName(new oFF.PlanningVersionSettingsMode(), "ServerDefault");
	oFF.PlanningVersionSettingsMode.QUERY_SERVICE = oFF.XConstant.setupName(new oFF.PlanningVersionSettingsMode(), "QueryService");
	oFF.PlanningVersionSettingsMode.PLANNING_SERVICE = oFF.XConstant.setupName(new oFF.PlanningVersionSettingsMode(), "PlanningService");
};

oFF.PlanningContextCommandType = function() {};
oFF.PlanningContextCommandType.prototype = new oFF.XConstant();
oFF.PlanningContextCommandType.prototype._ff_c = "PlanningContextCommandType";

oFF.PlanningContextCommandType.PUBLISH = null;
oFF.PlanningContextCommandType.SAVE = null;
oFF.PlanningContextCommandType.BACKUP = null;
oFF.PlanningContextCommandType.RESET = null;
oFF.PlanningContextCommandType.REFRESH = null;
oFF.PlanningContextCommandType.CLOSE = null;
oFF.PlanningContextCommandType.HARD_DELETE = null;
oFF.PlanningContextCommandType.DOC_SAVE = null;
oFF.PlanningContextCommandType.DOC_RESET = null;
oFF.PlanningContextCommandType.staticSetup = function()
{
	oFF.PlanningContextCommandType.PUBLISH = oFF.PlanningContextCommandType.create("PUBLISH", true);
	oFF.PlanningContextCommandType.SAVE = oFF.PlanningContextCommandType.create("SAVE", false);
	oFF.PlanningContextCommandType.BACKUP = oFF.PlanningContextCommandType.create("BACKUP", true);
	oFF.PlanningContextCommandType.RESET = oFF.PlanningContextCommandType.create("RESET", true);
	oFF.PlanningContextCommandType.REFRESH = oFF.PlanningContextCommandType.create("REFRESH", true);
	oFF.PlanningContextCommandType.CLOSE = oFF.PlanningContextCommandType.create("CLOSE", true);
	oFF.PlanningContextCommandType.HARD_DELETE = oFF.PlanningContextCommandType.create("HARD_DELETE", true);
	oFF.PlanningContextCommandType.DOC_SAVE = oFF.PlanningContextCommandType.create("DOC_SAVE", false);
	oFF.PlanningContextCommandType.DOC_RESET = oFF.PlanningContextCommandType.create("DOC_RESET", true);
};
oFF.PlanningContextCommandType.create = function(name, isInvalidatingResultSet)
{
	var object = new oFF.PlanningContextCommandType();
	object._setupInternal(name);
	object.setInvalidatingResultSet(isInvalidatingResultSet);
	return object;
};
oFF.PlanningContextCommandType.prototype.m_isInvalidatingResultSet = false;
oFF.PlanningContextCommandType.prototype.isInvalidatingResultSet = function()
{
	return this.m_isInvalidatingResultSet;
};
oFF.PlanningContextCommandType.prototype.setInvalidatingResultSet = function(isInvalidatingResultSet)
{
	this.m_isInvalidatingResultSet = isInvalidatingResultSet;
};

oFF.CellLockingType = function() {};
oFF.CellLockingType.prototype = new oFF.XConstant();
oFF.CellLockingType.prototype._ff_c = "CellLockingType";

oFF.CellLockingType.s_all = null;
oFF.CellLockingType.ALL_CONTEXTS = null;
oFF.CellLockingType.LOCAL_CONTEXT = null;
oFF.CellLockingType.OFF = null;
oFF.CellLockingType.DEFAULT_SETTING_BACKEND = null;
oFF.CellLockingType.staticSetup = function()
{
	oFF.CellLockingType.s_all = oFF.XSetOfNameObject.create();
	oFF.CellLockingType.ALL_CONTEXTS = oFF.CellLockingType.create("ALL_CONTEXTS");
	oFF.CellLockingType.LOCAL_CONTEXT = oFF.CellLockingType.create("LOCAL_CONTEXT");
	oFF.CellLockingType.OFF = oFF.CellLockingType.create("OFF");
	oFF.CellLockingType.DEFAULT_SETTING_BACKEND = oFF.CellLockingType.create("DEFAULT_SETTING_BACKEND");
};
oFF.CellLockingType.create = function(name)
{
	var object = oFF.XConstant.setupName(new oFF.CellLockingType(), name);
	oFF.CellLockingType.s_all.add(object);
	return object;
};
oFF.CellLockingType.lookup = function(name)
{
	return oFF.CellLockingType.s_all.getByKey(name);
};
oFF.CellLockingType.lookupByBWName = function(bwName)
{
	if (oFF.XStringUtils.isNullOrEmpty(bwName))
	{
		return oFF.CellLockingType.DEFAULT_SETTING_BACKEND;
	}
	if (oFF.XString.isEqual("X", bwName))
	{
		return oFF.CellLockingType.ALL_CONTEXTS;
	}
	if (oFF.XString.isEqual("L", bwName))
	{
		return oFF.CellLockingType.LOCAL_CONTEXT;
	}
	if (oFF.XString.isEqual("#", bwName))
	{
		return oFF.CellLockingType.OFF;
	}
	return oFF.CellLockingType.DEFAULT_SETTING_BACKEND;
};
oFF.CellLockingType.lookupWithDefault = function(name, defaultValue)
{
	var result = oFF.CellLockingType.s_all.getByKey(name);
	if (oFF.isNull(result))
	{
		return defaultValue;
	}
	return result;
};
oFF.CellLockingType.prototype.toBwName = function()
{
	if (this === oFF.CellLockingType.ALL_CONTEXTS)
	{
		return "X";
	}
	if (this === oFF.CellLockingType.LOCAL_CONTEXT)
	{
		return "L";
	}
	if (this === oFF.CellLockingType.OFF)
	{
		return "#";
	}
	if (this === oFF.CellLockingType.DEFAULT_SETTING_BACKEND)
	{
		return "";
	}
	throw oFF.XException.createRuntimeException("illegal cell locking type");
};

oFF.PlanningOperationType = function() {};
oFF.PlanningOperationType.prototype = new oFF.XConstant();
oFF.PlanningOperationType.prototype._ff_c = "PlanningOperationType";

oFF.PlanningOperationType.PLANNING_FUNCTION = null;
oFF.PlanningOperationType.PLANNING_SEQUENCE = null;
oFF.PlanningOperationType.T_PLANNING_FUNCTION = "PlanningFunction";
oFF.PlanningOperationType.T_PLANNING_SEQUENCE = "PlanningSequence";
oFF.PlanningOperationType.staticSetup = function()
{
	oFF.PlanningOperationType.PLANNING_FUNCTION = oFF.XConstant.setupName(new oFF.PlanningOperationType(), "PLANNING_FUNCTION");
	oFF.PlanningOperationType.PLANNING_SEQUENCE = oFF.XConstant.setupName(new oFF.PlanningOperationType(), "PLANNING_SEQUENCE");
};
oFF.PlanningOperationType.lookup = function(planningType)
{
	if (oFF.XString.isEqual(planningType, oFF.PlanningOperationType.T_PLANNING_FUNCTION))
	{
		return oFF.PlanningOperationType.PLANNING_FUNCTION;
	}
	if (oFF.XString.isEqual(planningType, oFF.PlanningOperationType.T_PLANNING_SEQUENCE))
	{
		return oFF.PlanningOperationType.PLANNING_SEQUENCE;
	}
	return null;
};
oFF.PlanningOperationType.prototype.getCamelCaseName = function()
{
	if (this === oFF.PlanningOperationType.PLANNING_FUNCTION)
	{
		return oFF.PlanningOperationType.T_PLANNING_FUNCTION;
	}
	if (this === oFF.PlanningOperationType.PLANNING_SEQUENCE)
	{
		return oFF.PlanningOperationType.T_PLANNING_SEQUENCE;
	}
	return null;
};

oFF.PlanningSequenceStepType = function() {};
oFF.PlanningSequenceStepType.prototype = new oFF.XConstant();
oFF.PlanningSequenceStepType.prototype._ff_c = "PlanningSequenceStepType";

oFF.PlanningSequenceStepType.s_all = null;
oFF.PlanningSequenceStepType.SERVICE = null;
oFF.PlanningSequenceStepType.MANUAL_ENTRY = null;
oFF.PlanningSequenceStepType.staticSetup = function()
{
	oFF.PlanningSequenceStepType.s_all = oFF.XSetOfNameObject.create();
	oFF.PlanningSequenceStepType.SERVICE = oFF.PlanningSequenceStepType.create("Service");
	oFF.PlanningSequenceStepType.MANUAL_ENTRY = oFF.PlanningSequenceStepType.create("ManualEntry");
};
oFF.PlanningSequenceStepType.create = function(name)
{
	var object = oFF.XConstant.setupName(new oFF.PlanningSequenceStepType(), name);
	oFF.PlanningSequenceStepType.s_all.add(object);
	return object;
};
oFF.PlanningSequenceStepType.lookup = function(name)
{
	return oFF.PlanningSequenceStepType.s_all.getByKey(name);
};

oFF.PlanningModelBehaviour = function() {};
oFF.PlanningModelBehaviour.prototype = new oFF.XConstant();
oFF.PlanningModelBehaviour.prototype._ff_c = "PlanningModelBehaviour";

oFF.PlanningModelBehaviour.s_all = null;
oFF.PlanningModelBehaviour.STANDARD = null;
oFF.PlanningModelBehaviour.CREATE_DEFAULT_VERSION = null;
oFF.PlanningModelBehaviour.ENFORCE_NO_VERSION = null;
oFF.PlanningModelBehaviour.ENFORCE_SINGLE_VERSION = null;
oFF.PlanningModelBehaviour.ENFORCE_NO_VERSION_HARD_DELETE = null;
oFF.PlanningModelBehaviour.staticSetup = function()
{
	oFF.PlanningModelBehaviour.s_all = oFF.XSetOfNameObject.create();
	oFF.PlanningModelBehaviour.STANDARD = oFF.PlanningModelBehaviour.create("STANDARD");
	oFF.PlanningModelBehaviour.CREATE_DEFAULT_VERSION = oFF.PlanningModelBehaviour.create("CREATE_DEFAULT_VERSION");
	oFF.PlanningModelBehaviour.ENFORCE_NO_VERSION = oFF.PlanningModelBehaviour.create("ENFORCE_NO_VERSION");
	oFF.PlanningModelBehaviour.ENFORCE_SINGLE_VERSION = oFF.PlanningModelBehaviour.create("ENFORCE_SINGLE_VERSION");
	oFF.PlanningModelBehaviour.ENFORCE_NO_VERSION_HARD_DELETE = oFF.PlanningModelBehaviour.create("ENFORCE_NO_VERSION_HARD_DELETE");
};
oFF.PlanningModelBehaviour.create = function(name)
{
	var object = oFF.XConstant.setupName(new oFF.PlanningModelBehaviour(), name);
	oFF.PlanningModelBehaviour.s_all.add(object);
	return object;
};
oFF.PlanningModelBehaviour.lookup = function(name)
{
	return oFF.PlanningModelBehaviour.s_all.getByKey(name);
};
oFF.PlanningModelBehaviour.lookupWithDefault = function(name, defaultValue)
{
	var result = oFF.PlanningModelBehaviour.s_all.getByKey(name);
	if (oFF.isNull(result))
	{
		return defaultValue;
	}
	return result;
};

oFF.PlanningPersistenceType = function() {};
oFF.PlanningPersistenceType.prototype = new oFF.XConstant();
oFF.PlanningPersistenceType.prototype._ff_c = "PlanningPersistenceType";

oFF.PlanningPersistenceType.s_all = null;
oFF.PlanningPersistenceType.DEFAULT = null;
oFF.PlanningPersistenceType.ALWAYS = null;
oFF.PlanningPersistenceType.NON_PUBLISH_CONTAINERS = null;
oFF.PlanningPersistenceType.NEVER = null;
oFF.PlanningPersistenceType.AUTO = null;
oFF.PlanningPersistenceType.staticSetup = function()
{
	oFF.PlanningPersistenceType.s_all = oFF.XSetOfNameObject.create();
	oFF.PlanningPersistenceType.DEFAULT = oFF.PlanningPersistenceType.create("default");
	oFF.PlanningPersistenceType.ALWAYS = oFF.PlanningPersistenceType.create("always");
	oFF.PlanningPersistenceType.NON_PUBLISH_CONTAINERS = oFF.PlanningPersistenceType.create("non_publish_containers");
	oFF.PlanningPersistenceType.NEVER = oFF.PlanningPersistenceType.create("never");
	oFF.PlanningPersistenceType.AUTO = oFF.PlanningPersistenceType.create("auto");
};
oFF.PlanningPersistenceType.create = function(name)
{
	var object = oFF.XConstant.setupName(new oFF.PlanningPersistenceType(), name);
	oFF.PlanningPersistenceType.s_all.add(object);
	return object;
};
oFF.PlanningPersistenceType.lookup = function(name)
{
	return oFF.PlanningPersistenceType.s_all.getByKey(name);
};
oFF.PlanningPersistenceType.lookupWithDefault = function(name, defaultValue)
{
	var result = oFF.PlanningPersistenceType.s_all.getByKey(name);
	if (oFF.isNull(result))
	{
		return defaultValue;
	}
	return result;
};

oFF.PlanningPrivilege = function() {};
oFF.PlanningPrivilege.prototype = new oFF.XConstant();
oFF.PlanningPrivilege.prototype._ff_c = "PlanningPrivilege";

oFF.PlanningPrivilege.s_all = null;
oFF.PlanningPrivilege.READ = null;
oFF.PlanningPrivilege.WRITE = null;
oFF.PlanningPrivilege.PUBLISH = null;
oFF.PlanningPrivilege.OWNER = null;
oFF.PlanningPrivilege.staticSetup = function()
{
	oFF.PlanningPrivilege.s_all = oFF.XSetOfNameObject.create();
	oFF.PlanningPrivilege.READ = oFF.PlanningPrivilege.create("read");
	oFF.PlanningPrivilege.WRITE = oFF.PlanningPrivilege.create("write");
	oFF.PlanningPrivilege.PUBLISH = oFF.PlanningPrivilege.create("publish");
	oFF.PlanningPrivilege.OWNER = oFF.PlanningPrivilege.create("owner");
};
oFF.PlanningPrivilege.create = function(name)
{
	var object = oFF.XConstant.setupName(new oFF.PlanningPrivilege(), name);
	oFF.PlanningPrivilege.s_all.add(object);
	return object;
};
oFF.PlanningPrivilege.lookup = function(name)
{
	return oFF.PlanningPrivilege.s_all.getByKey(name);
};
oFF.PlanningPrivilege.lookupWithDefault = function(name, defaultValue)
{
	var result = oFF.PlanningPrivilege.s_all.getByKey(name);
	if (oFF.isNull(result))
	{
		return defaultValue;
	}
	return result;
};

oFF.PlanningPrivilegeState = function() {};
oFF.PlanningPrivilegeState.prototype = new oFF.XConstant();
oFF.PlanningPrivilegeState.prototype._ff_c = "PlanningPrivilegeState";

oFF.PlanningPrivilegeState.s_all = null;
oFF.PlanningPrivilegeState.NEW = null;
oFF.PlanningPrivilegeState.GRANTED = null;
oFF.PlanningPrivilegeState.TO_BE_GRANTED = null;
oFF.PlanningPrivilegeState.TO_BE_REVOKED = null;
oFF.PlanningPrivilegeState.staticSetup = function()
{
	oFF.PlanningPrivilegeState.s_all = oFF.XSetOfNameObject.create();
	oFF.PlanningPrivilegeState.NEW = oFF.PlanningPrivilegeState.create("new");
	oFF.PlanningPrivilegeState.GRANTED = oFF.PlanningPrivilegeState.create("granted");
	oFF.PlanningPrivilegeState.TO_BE_GRANTED = oFF.PlanningPrivilegeState.create("to_be_granted");
	oFF.PlanningPrivilegeState.TO_BE_REVOKED = oFF.PlanningPrivilegeState.create("to_be_revoked");
};
oFF.PlanningPrivilegeState.create = function(name)
{
	var object = oFF.XConstant.setupName(new oFF.PlanningPrivilegeState(), name);
	oFF.PlanningPrivilegeState.s_all.add(object);
	return object;
};
oFF.PlanningPrivilegeState.lookup = function(name)
{
	return oFF.PlanningPrivilegeState.s_all.getByKey(name);
};
oFF.PlanningPrivilegeState.lookupWithDefault = function(name, defaultValue)
{
	var result = oFF.PlanningPrivilegeState.s_all.getByKey(name);
	if (oFF.isNull(result))
	{
		return defaultValue;
	}
	return result;
};

oFF.PlanningVersionState = function() {};
oFF.PlanningVersionState.prototype = new oFF.XConstant();
oFF.PlanningVersionState.prototype._ff_c = "PlanningVersionState";

oFF.PlanningVersionState.s_all = null;
oFF.PlanningVersionState.CHANGED = null;
oFF.PlanningVersionState.UNCHANGED = null;
oFF.PlanningVersionState.CLEAN = null;
oFF.PlanningVersionState.DIRTY = null;
oFF.PlanningVersionState.RECOVERED = null;
oFF.PlanningVersionState.SLEEPING = null;
oFF.PlanningVersionState.staticSetup = function()
{
	oFF.PlanningVersionState.s_all = oFF.XSetOfNameObject.create();
	oFF.PlanningVersionState.CHANGED = oFF.PlanningVersionState.create("changed", true);
	oFF.PlanningVersionState.UNCHANGED = oFF.PlanningVersionState.create("unchanged", true);
	oFF.PlanningVersionState.CLEAN = oFF.PlanningVersionState.create("clean", false);
	oFF.PlanningVersionState.DIRTY = oFF.PlanningVersionState.create("dirty", false);
	oFF.PlanningVersionState.RECOVERED = oFF.PlanningVersionState.create("recovered", false);
	oFF.PlanningVersionState.SLEEPING = oFF.PlanningVersionState.create("sleeping", false);
};
oFF.PlanningVersionState.create = function(name, isActive)
{
	var object = oFF.XConstant.setupName(new oFF.PlanningVersionState(), name);
	object.m_active = isActive;
	oFF.PlanningVersionState.s_all.add(object);
	return object;
};
oFF.PlanningVersionState.lookup = function(name)
{
	return oFF.PlanningVersionState.s_all.getByKey(name);
};
oFF.PlanningVersionState.prototype.m_active = false;
oFF.PlanningVersionState.prototype.isActive = function()
{
	return this.m_active;
};

oFF.CloseModeType = function() {};
oFF.CloseModeType.prototype = new oFF.XConstant();
oFF.CloseModeType.prototype._ff_c = "CloseModeType";

oFF.CloseModeType.s_all = null;
oFF.CloseModeType.BACKUP = null;
oFF.CloseModeType.NONE = null;
oFF.CloseModeType.KILL_ACTION_SEQUENCE = null;
oFF.CloseModeType.DISCARD = null;
oFF.CloseModeType.KILL_ACTION_SEQUENCE_AND_DISCARD = null;
oFF.CloseModeType.staticSetup = function()
{
	oFF.CloseModeType.s_all = oFF.XSetOfNameObject.create();
	oFF.CloseModeType.BACKUP = oFF.CloseModeType.create("BACKUP", false, false);
	oFF.CloseModeType.NONE = oFF.CloseModeType.create("NONE", true, false);
	oFF.CloseModeType.KILL_ACTION_SEQUENCE = oFF.CloseModeType.create("KILL_ACTION_SEQUENCE", true, true);
	oFF.CloseModeType.DISCARD = oFF.CloseModeType.create("DISCARD", false, false);
	oFF.CloseModeType.KILL_ACTION_SEQUENCE_AND_DISCARD = oFF.CloseModeType.create("KILL_ACTION_SEQUENCE_AND_DISCARD", false, true);
};
oFF.CloseModeType.create = function(name, onlyClient, killActionSequence)
{
	var object = oFF.XConstant.setupName(new oFF.CloseModeType(), name);
	object.m_onlyClient = onlyClient;
	object.m_killActionSequence = killActionSequence;
	oFF.CloseModeType.s_all.add(object);
	return object;
};
oFF.CloseModeType.lookup = function(name)
{
	return oFF.CloseModeType.s_all.getByKey(name);
};
oFF.CloseModeType.lookupWithDefault = function(name, defaultValue)
{
	var result = oFF.CloseModeType.s_all.getByKey(name);
	if (oFF.isNull(result))
	{
		return defaultValue;
	}
	return result;
};
oFF.CloseModeType.prototype.m_onlyClient = false;
oFF.CloseModeType.prototype.m_killActionSequence = false;
oFF.CloseModeType.prototype.isOnlyClient = function()
{
	return this.m_onlyClient;
};
oFF.CloseModeType.prototype.isWithKillActionSequence = function()
{
	return this.m_killActionSequence;
};

oFF.RestoreBackupType = function() {};
oFF.RestoreBackupType.prototype = new oFF.XConstant();
oFF.RestoreBackupType.prototype._ff_c = "RestoreBackupType";

oFF.RestoreBackupType.s_all = null;
oFF.RestoreBackupType.RESTORE_TRUE = null;
oFF.RestoreBackupType.RESTORE_FALSE = null;
oFF.RestoreBackupType.NONE = null;
oFF.RestoreBackupType.staticSetup = function()
{
	oFF.RestoreBackupType.s_all = oFF.XSetOfNameObject.create();
	oFF.RestoreBackupType.RESTORE_TRUE = oFF.RestoreBackupType.create("TRUE");
	oFF.RestoreBackupType.RESTORE_FALSE = oFF.RestoreBackupType.create("FALSE");
	oFF.RestoreBackupType.NONE = oFF.RestoreBackupType.create("NONE");
};
oFF.RestoreBackupType.create = function(name)
{
	var object = oFF.XConstant.setupName(new oFF.RestoreBackupType(), name);
	oFF.RestoreBackupType.s_all.add(object);
	return object;
};
oFF.RestoreBackupType.lookup = function(name)
{
	return oFF.RestoreBackupType.s_all.getByKey(name);
};
oFF.RestoreBackupType.lookupWithDefault = function(name, defaultValue)
{
	var result = oFF.RestoreBackupType.s_all.getByKey(name);
	if (oFF.isNull(result))
	{
		return defaultValue;
	}
	return result;
};

oFF.QueryCloneMode = function() {};
oFF.QueryCloneMode.prototype = new oFF.XConstant();
oFF.QueryCloneMode.prototype._ff_c = "QueryCloneMode";

oFF.QueryCloneMode.CURRENT_STATE_INA = null;
oFF.QueryCloneMode.CURRENT_STATE = null;
oFF.QueryCloneMode.BASE_STATE = null;
oFF.QueryCloneMode.MICRO_CUBE = null;
oFF.QueryCloneMode.s_lookup = null;
oFF.QueryCloneMode.staticSetup = function()
{
	oFF.QueryCloneMode.s_lookup = oFF.XHashMapByString.create();
	oFF.QueryCloneMode.CURRENT_STATE = oFF.QueryCloneMode.create("CurrentStateCopyCtor");
	oFF.QueryCloneMode.CURRENT_STATE_INA = oFF.QueryCloneMode.create("CurrentState");
	oFF.QueryCloneMode.BASE_STATE = oFF.QueryCloneMode.create("BaseState");
	oFF.QueryCloneMode.MICRO_CUBE = oFF.QueryCloneMode.create("MicroCube");
};
oFF.QueryCloneMode.create = function(name)
{
	var value = oFF.XConstant.setupName(new oFF.QueryCloneMode(), name);
	oFF.QueryCloneMode.s_lookup.put(name, value);
	return value;
};
oFF.QueryCloneMode.findInFlags = function(flags, defaultValue)
{
	var result = defaultValue;
	if (oFF.notNull(flags))
	{
		var list = oFF.XStringTokenizer.splitString(flags, ",");
		var lookupValue = null;
		for (var i = 0; i < list.size(); i++)
		{
			var currentFlag = list.get(i);
			lookupValue = oFF.QueryCloneMode.s_lookup.getByKey(currentFlag);
			if (oFF.notNull(lookupValue))
			{
				result = lookupValue;
				break;
			}
		}
	}
	return result;
};
oFF.QueryCloneMode.lookup = function(name)
{
	return oFF.QueryCloneMode.s_lookup.getByKey(name);
};

oFF.ResultSetType = function() {};
oFF.ResultSetType.prototype = new oFF.XConstant();
oFF.ResultSetType.prototype._ff_c = "ResultSetType";

oFF.ResultSetType.CLASSIC = null;
oFF.ResultSetType.CURSOR = null;
oFF.ResultSetType.s_instances = null;
oFF.ResultSetType.staticSetup = function()
{
	oFF.ResultSetType.s_instances = oFF.XHashMapByString.create();
	oFF.ResultSetType.CLASSIC = oFF.ResultSetType.create("Classic");
	oFF.ResultSetType.CURSOR = oFF.ResultSetType.create("Cursor");
};
oFF.ResultSetType.create = function(camelCaseName)
{
	var newConstant = oFF.XConstant.setupName(new oFF.ResultSetType(), camelCaseName);
	oFF.ResultSetType.s_instances.put(camelCaseName, newConstant);
	return newConstant;
};
oFF.ResultSetType.lookup = function(name)
{
	return oFF.ResultSetType.s_instances.getByKey(name);
};

oFF.AccountType = function() {};
oFF.AccountType.prototype = new oFF.XConstant();
oFF.AccountType.prototype._ff_c = "AccountType";

oFF.AccountType.INC = null;
oFF.AccountType.EXP = null;
oFF.AccountType.AST = null;
oFF.AccountType.LEQ = null;
oFF.AccountType.NFIN = null;
oFF.AccountType.s_instances = null;
oFF.AccountType.staticSetup = function()
{
	oFF.AccountType.s_instances = oFF.XHashMapByString.create();
	oFF.AccountType.INC = oFF.AccountType.create("INC");
	oFF.AccountType.EXP = oFF.AccountType.create("EXP");
	oFF.AccountType.AST = oFF.AccountType.create("AST");
	oFF.AccountType.LEQ = oFF.AccountType.create("LEQ");
	oFF.AccountType.NFIN = oFF.AccountType.create("NFIN");
};
oFF.AccountType.create = function(name)
{
	var unitType = new oFF.AccountType();
	unitType._setupInternal(name);
	oFF.AccountType.s_instances.put(name, unitType);
	return unitType;
};
oFF.AccountType.lookup = function(name)
{
	return oFF.AccountType.s_instances.getByKey(name);
};

oFF.CellChartOrientation = function() {};
oFF.CellChartOrientation.prototype = new oFF.XConstant();
oFF.CellChartOrientation.prototype._ff_c = "CellChartOrientation";

oFF.CellChartOrientation.HORIZONTAL = null;
oFF.CellChartOrientation.VERTICAL = null;
oFF.CellChartOrientation.s_instances = null;
oFF.CellChartOrientation.staticSetup = function()
{
	oFF.CellChartOrientation.s_instances = oFF.XHashMapByString.create();
	oFF.CellChartOrientation.HORIZONTAL = oFF.CellChartOrientation.create("Horizontal");
	oFF.CellChartOrientation.VERTICAL = oFF.CellChartOrientation.create("Vertical");
};
oFF.CellChartOrientation.create = function(name)
{
	var unitType = new oFF.CellChartOrientation();
	unitType._setupInternal(name);
	oFF.CellChartOrientation.s_instances.put(name, unitType);
	return unitType;
};
oFF.CellChartOrientation.lookup = function(name)
{
	return oFF.CellChartOrientation.s_instances.getByKey(name);
};

oFF.CellChartType = function() {};
oFF.CellChartType.prototype = new oFF.XConstant();
oFF.CellChartType.prototype._ff_c = "CellChartType";

oFF.CellChartType.NONE = null;
oFF.CellChartType.BAR = null;
oFF.CellChartType.VARIANCE_BAR = null;
oFF.CellChartType.PIN = null;
oFF.CellChartType.s_instances = null;
oFF.CellChartType.staticSetup = function()
{
	oFF.CellChartType.s_instances = oFF.XHashMapByString.create();
	oFF.CellChartType.NONE = oFF.CellChartType.create("none");
	oFF.CellChartType.BAR = oFF.CellChartType.create("bar");
	oFF.CellChartType.VARIANCE_BAR = oFF.CellChartType.create("varianceBar");
	oFF.CellChartType.PIN = oFF.CellChartType.create("pin");
};
oFF.CellChartType.create = function(name)
{
	var unitType = new oFF.CellChartType();
	unitType._setupInternal(name);
	oFF.CellChartType.s_instances.put(name, unitType);
	return unitType;
};
oFF.CellChartType.lookup = function(name)
{
	return oFF.CellChartType.s_instances.getByKey(name);
};

oFF.CtCategory = function() {};
oFF.CtCategory.prototype = new oFF.XConstant();
oFF.CtCategory.prototype._ff_c = "CtCategory";

oFF.CtCategory.ACTUALS = null;
oFF.CtCategory.BUDGET = null;
oFF.CtCategory.PLANNING = null;
oFF.CtCategory.FORECAST = null;
oFF.CtCategory.ROLLING_FORECAST = null;
oFF.CtCategory.s_instances = null;
oFF.CtCategory.staticSetup = function()
{
	oFF.CtCategory.s_instances = oFF.XHashMapByString.create();
	oFF.CtCategory.ACTUALS = oFF.CtCategory.create("Actuals");
	oFF.CtCategory.BUDGET = oFF.CtCategory.create("Budget");
	oFF.CtCategory.PLANNING = oFF.CtCategory.create("Planning");
	oFF.CtCategory.FORECAST = oFF.CtCategory.create("Forecast");
	oFF.CtCategory.ROLLING_FORECAST = oFF.CtCategory.create("RollingForecast");
};
oFF.CtCategory.create = function(name)
{
	var category = new oFF.CtCategory();
	category._setupInternal(name);
	oFF.CtCategory.s_instances.put(name, category);
	return category;
};
oFF.CtCategory.lookup = function(name)
{
	return oFF.CtCategory.s_instances.getByKey(name);
};
oFF.CtCategory.isDefined = function(category)
{
	return oFF.notNull(category);
};

oFF.CtErrorHandlingMode = function() {};
oFF.CtErrorHandlingMode.prototype = new oFF.XConstant();
oFF.CtErrorHandlingMode.prototype._ff_c = "CtErrorHandlingMode";

oFF.CtErrorHandlingMode.KEEP_UNCONVERTED = null;
oFF.CtErrorHandlingMode.SET_TO_NULL = null;
oFF.CtErrorHandlingMode.FAIL_ON_ERROR = null;
oFF.CtErrorHandlingMode.s_instances = null;
oFF.CtErrorHandlingMode.staticSetup = function()
{
	oFF.CtErrorHandlingMode.s_instances = oFF.XHashMapByString.create();
	oFF.CtErrorHandlingMode.KEEP_UNCONVERTED = oFF.CtErrorHandlingMode.create("KeepUnconverted");
	oFF.CtErrorHandlingMode.SET_TO_NULL = oFF.CtErrorHandlingMode.create("SetToNull");
	oFF.CtErrorHandlingMode.FAIL_ON_ERROR = oFF.CtErrorHandlingMode.create("FailOnError");
};
oFF.CtErrorHandlingMode.create = function(name)
{
	var rateType = new oFF.CtErrorHandlingMode();
	rateType._setupInternal(name);
	oFF.CtErrorHandlingMode.s_instances.put(name, rateType);
	return rateType;
};
oFF.CtErrorHandlingMode.lookup = function(name)
{
	return oFF.CtErrorHandlingMode.s_instances.getByKey(name);
};

oFF.CtRateType = function() {};
oFF.CtRateType.prototype = new oFF.XConstant();
oFF.CtRateType.prototype._ff_c = "CtRateType";

oFF.CtRateType.DEFAULT = null;
oFF.CtRateType.AVERAGE = null;
oFF.CtRateType.CLOSING = null;
oFF.CtRateType.s_instances = null;
oFF.CtRateType.staticSetup = function()
{
	oFF.CtRateType.s_instances = oFF.XHashMapByString.create();
	oFF.CtRateType.DEFAULT = oFF.CtRateType.create("Default");
	oFF.CtRateType.AVERAGE = oFF.CtRateType.create("Average");
	oFF.CtRateType.CLOSING = oFF.CtRateType.create("Closing");
};
oFF.CtRateType.create = function(name)
{
	var rateType = new oFF.CtRateType();
	rateType._setupInternal(name);
	oFF.CtRateType.s_instances.put(name, rateType);
	return rateType;
};
oFF.CtRateType.lookup = function(name)
{
	return oFF.CtRateType.s_instances.getByKey(name);
};
oFF.CtRateType.isDefined = function(rateType)
{
	return oFF.notNull(rateType);
};

oFF.ExceptionAggregationConditionType = function() {};
oFF.ExceptionAggregationConditionType.prototype = new oFF.XConstant();
oFF.ExceptionAggregationConditionType.prototype._ff_c = "ExceptionAggregationConditionType";

oFF.ExceptionAggregationConditionType.VALUES_IN = null;
oFF.ExceptionAggregationConditionType.VALUES_NOT_IN = null;
oFF.ExceptionAggregationConditionType.s_instances = null;
oFF.ExceptionAggregationConditionType.staticSetup = function()
{
	oFF.ExceptionAggregationConditionType.s_instances = oFF.XHashMapByString.create();
	oFF.ExceptionAggregationConditionType.VALUES_IN = oFF.ExceptionAggregationConditionType.create("valuesIn");
	oFF.ExceptionAggregationConditionType.VALUES_NOT_IN = oFF.ExceptionAggregationConditionType.create("valuesNotIn");
};
oFF.ExceptionAggregationConditionType.create = function(name)
{
	var conditionType = oFF.XConstant.setupName(new oFF.ExceptionAggregationConditionType(), name);
	oFF.ExceptionAggregationConditionType.s_instances.put(name, conditionType);
	return conditionType;
};
oFF.ExceptionAggregationConditionType.lookup = function(name)
{
	return oFF.ExceptionAggregationConditionType.s_instances.getByKey(name);
};

oFF.QStructureMemberQueryProperties = function() {};
oFF.QStructureMemberQueryProperties.prototype = new oFF.XConstant();
oFF.QStructureMemberQueryProperties.prototype._ff_c = "QStructureMemberQueryProperties";

oFF.QStructureMemberQueryProperties.MINIMUM_DRILL_STATE_DIMENSIONS = null;
oFF.QStructureMemberQueryProperties.ALL_REQUIRED_DIMENSIONS = null;
oFF.QStructureMemberQueryProperties.UNSATISFIED_REQUIRED_DIMENSIONS = null;
oFF.QStructureMemberQueryProperties.staticSetup = function()
{
	oFF.QStructureMemberQueryProperties.MINIMUM_DRILL_STATE_DIMENSIONS = oFF.XConstant.setupName(new oFF.QStructureMemberQueryProperties(), "minimumDrillStateDimensions");
	oFF.QStructureMemberQueryProperties.ALL_REQUIRED_DIMENSIONS = oFF.XConstant.setupName(new oFF.QStructureMemberQueryProperties(), "allRequiredDimensions");
	oFF.QStructureMemberQueryProperties.UNSATISFIED_REQUIRED_DIMENSIONS = oFF.XConstant.setupName(new oFF.QStructureMemberQueryProperties(), "unsatisfiedRequiredDimensions");
};

oFF.UnitType = function() {};
oFF.UnitType.prototype = new oFF.XConstant();
oFF.UnitType.prototype._ff_c = "UnitType";

oFF.UnitType.NONE = null;
oFF.UnitType.UNIT = null;
oFF.UnitType.CURRENCY = null;
oFF.UnitType.MIXED = null;
oFF.UnitType.UNDEFINED = null;
oFF.UnitType.NULL_VALUE = null;
oFF.UnitType.CONVERSION_FAILED = null;
oFF.UnitType.s_instances = null;
oFF.UnitType.staticSetup = function()
{
	oFF.UnitType.s_instances = oFF.XHashMapByString.create();
	oFF.UnitType.NONE = oFF.UnitType.create("NON");
	oFF.UnitType.UNIT = oFF.UnitType.create("UNI");
	oFF.UnitType.CURRENCY = oFF.UnitType.create("CUR");
	oFF.UnitType.MIXED = oFF.UnitType.create("*");
	oFF.UnitType.UNDEFINED = oFF.UnitType.create("UDF");
	oFF.UnitType.NULL_VALUE = oFF.UnitType.create("NULL");
	oFF.UnitType.CONVERSION_FAILED = oFF.UnitType.create("CONVERSION_FAILED");
};
oFF.UnitType.create = function(name)
{
	var unitType = new oFF.UnitType();
	unitType._setupInternal(name);
	oFF.UnitType.s_instances.put(name, unitType);
	return unitType;
};
oFF.UnitType.lookup = function(name)
{
	return oFF.UnitType.s_instances.getByKey(name);
};

oFF.VarianceCalculationType = function() {};
oFF.VarianceCalculationType.prototype = new oFF.XConstant();
oFF.VarianceCalculationType.prototype._ff_c = "VarianceCalculationType";

oFF.VarianceCalculationType.ABSOLUTE = null;
oFF.VarianceCalculationType.PERCENTAGE_DIVIDE_BY_BASE = null;
oFF.VarianceCalculationType.PERCENTAGE_DIVIDE_BY_REFERENCE = null;
oFF.VarianceCalculationType.PERCENTAGE_WITH_ABSOLUTE_BASE_DIVIDE_BY_BASE = null;
oFF.VarianceCalculationType.PERCENTAGE_WITH_ABSOLUTE_BASE_DIVIDE_BY_REFERENCE = null;
oFF.VarianceCalculationType.s_instances = null;
oFF.VarianceCalculationType.staticSetup = function()
{
	oFF.VarianceCalculationType.s_instances = oFF.XHashMapByString.create();
	oFF.VarianceCalculationType.ABSOLUTE = oFF.VarianceCalculationType.create("absolute");
	oFF.VarianceCalculationType.PERCENTAGE_DIVIDE_BY_BASE = oFF.VarianceCalculationType.create("percentageDivideByBase");
	oFF.VarianceCalculationType.PERCENTAGE_DIVIDE_BY_REFERENCE = oFF.VarianceCalculationType.create("percentageDivideByReference");
	oFF.VarianceCalculationType.PERCENTAGE_WITH_ABSOLUTE_BASE_DIVIDE_BY_BASE = oFF.VarianceCalculationType.create("percentageWithAbsoluteBaseDivideByBase");
	oFF.VarianceCalculationType.PERCENTAGE_WITH_ABSOLUTE_BASE_DIVIDE_BY_REFERENCE = oFF.VarianceCalculationType.create("percentageWithAbsoluteBaseDivideByReference");
};
oFF.VarianceCalculationType.create = function(name)
{
	var varianceType = oFF.XConstant.setupName(new oFF.VarianceCalculationType(), name);
	oFF.VarianceCalculationType.s_instances.put(name, varianceType);
	return varianceType;
};
oFF.VarianceCalculationType.lookup = function(name)
{
	return oFF.VarianceCalculationType.s_instances.getByKey(name);
};

oFF.VarianceNullHandlingType = function() {};
oFF.VarianceNullHandlingType.prototype = new oFF.XConstant();
oFF.VarianceNullHandlingType.prototype._ff_c = "VarianceNullHandlingType";

oFF.VarianceNullHandlingType.NULL_AS_NULL_REFERENCE_MINUS_BASE = null;
oFF.VarianceNullHandlingType.NULL_AS_ZERO_REFERENCE_MINUS_BASE = null;
oFF.VarianceNullHandlingType.NULL_AS_NULL_BASE_MINUS_REFERENCE = null;
oFF.VarianceNullHandlingType.NULL_AS_ZERO_BASE_MINUS_REFERENCE = null;
oFF.VarianceNullHandlingType.s_instances = null;
oFF.VarianceNullHandlingType.staticSetup = function()
{
	oFF.VarianceNullHandlingType.s_instances = oFF.XHashMapByString.create();
	oFF.VarianceNullHandlingType.NULL_AS_NULL_REFERENCE_MINUS_BASE = oFF.VarianceNullHandlingType.create("nullAsNullReferenceMinusBase");
	oFF.VarianceNullHandlingType.NULL_AS_ZERO_REFERENCE_MINUS_BASE = oFF.VarianceNullHandlingType.create("nullAsZeroReferenceMinusBase");
	oFF.VarianceNullHandlingType.NULL_AS_NULL_BASE_MINUS_REFERENCE = oFF.VarianceNullHandlingType.create("nullAsNullBaseMinusReference");
	oFF.VarianceNullHandlingType.NULL_AS_ZERO_BASE_MINUS_REFERENCE = oFF.VarianceNullHandlingType.create("nullAsZeroBaseMinusReference");
};
oFF.VarianceNullHandlingType.create = function(name)
{
	var varianceType = oFF.XConstant.setupName(new oFF.VarianceNullHandlingType(), name);
	oFF.VarianceNullHandlingType.s_instances.put(name, varianceType);
	return varianceType;
};
oFF.VarianceNullHandlingType.lookup = function(name)
{
	return oFF.VarianceNullHandlingType.s_instances.getByKey(name);
};

oFF.TimeOffsetFunction = function() {};
oFF.TimeOffsetFunction.prototype = new oFF.XConstant();
oFF.TimeOffsetFunction.prototype._ff_c = "TimeOffsetFunction";

oFF.TimeOffsetFunction.LOOK_BACK = null;
oFF.TimeOffsetFunction.LOOK_AHEAD = null;
oFF.TimeOffsetFunction.s_all = null;
oFF.TimeOffsetFunction.staticSetup = function()
{
	oFF.TimeOffsetFunction.s_all = oFF.XSetOfNameObject.create();
	oFF.TimeOffsetFunction.LOOK_BACK = oFF.TimeOffsetFunction.create("lookBack");
	oFF.TimeOffsetFunction.LOOK_AHEAD = oFF.TimeOffsetFunction.create("lookAhead");
};
oFF.TimeOffsetFunction.create = function(name)
{
	var newConstant = oFF.XConstant.setupName(new oFF.TimeOffsetFunction(), name);
	oFF.TimeOffsetFunction.s_all.add(newConstant);
	return newConstant;
};
oFF.TimeOffsetFunction.lookup = function(name)
{
	return oFF.TimeOffsetFunction.s_all.getByKey(name);
};

oFF.TimeRangeFilterType = function() {};
oFF.TimeRangeFilterType.prototype = new oFF.XConstant();
oFF.TimeRangeFilterType.prototype._ff_c = "TimeRangeFilterType";

oFF.TimeRangeFilterType.FIXED_OPENING_PERIOD_TO_CLOSING_PERIOD = null;
oFF.TimeRangeFilterType.FIXED_OPENING_PERIOD_TO_END = null;
oFF.TimeRangeFilterType.FIXED_START_TO_CLOSING_OPERIOD = null;
oFF.TimeRangeFilterType.s_all = null;
oFF.TimeRangeFilterType.staticSetup = function()
{
	oFF.TimeRangeFilterType.s_all = oFF.XSetOfNameObject.create();
	oFF.TimeRangeFilterType.FIXED_OPENING_PERIOD_TO_CLOSING_PERIOD = oFF.TimeRangeFilterType.create("fixedOpeningPeriodToClosingPeriod");
	oFF.TimeRangeFilterType.FIXED_OPENING_PERIOD_TO_END = oFF.TimeRangeFilterType.create("fixedOpeningPeriodToEnd");
	oFF.TimeRangeFilterType.FIXED_START_TO_CLOSING_OPERIOD = oFF.TimeRangeFilterType.create("fixedStartToClosingPeriod");
};
oFF.TimeRangeFilterType.create = function(name)
{
	var newConstant = oFF.XConstant.setupName(new oFF.TimeRangeFilterType(), name);
	oFF.TimeRangeFilterType.s_all.add(newConstant);
	return newConstant;
};
oFF.TimeRangeFilterType.lookup = function(name)
{
	return oFF.TimeRangeFilterType.s_all.getByKey(name);
};

oFF.JoinType = function() {};
oFF.JoinType.prototype = new oFF.XConstantWithParent();
oFF.JoinType.prototype._ff_c = "JoinType";

oFF.JoinType._TIME = null;
oFF.JoinType.INNER = null;
oFF.JoinType.LEFT_OUTER = null;
oFF.JoinType.RIGHT_OUTER = null;
oFF.JoinType._SPATIAL = null;
oFF.JoinType.EQUALS = null;
oFF.JoinType.DISJOINT = null;
oFF.JoinType.INTERSECTS = null;
oFF.JoinType.TOUCHES = null;
oFF.JoinType.CROSSES = null;
oFF.JoinType.WITHIN = null;
oFF.JoinType.CONTAINS = null;
oFF.JoinType.OVERLAPS = null;
oFF.JoinType.COVERS = null;
oFF.JoinType.COVERED_BY = null;
oFF.JoinType.WITHIN_DISTANCE = null;
oFF.JoinType.RELATE = null;
oFF.JoinType.s_lookup = null;
oFF.JoinType.staticSetup = function()
{
	oFF.JoinType.s_lookup = oFF.XHashMapByString.create();
	oFF.JoinType._TIME = oFF.JoinType.createJoinType("TIME", null);
	oFF.JoinType.INNER = oFF.JoinType.createJoinType("INNER", oFF.JoinType._TIME);
	oFF.JoinType.LEFT_OUTER = oFF.JoinType.createJoinType("LEFT_OUTER", oFF.JoinType._TIME);
	oFF.JoinType.RIGHT_OUTER = oFF.JoinType.createJoinType("RIGHT_OUTER", oFF.JoinType._TIME);
	oFF.JoinType._SPATIAL = oFF.JoinType.createJoinType("SPATIAL", null);
	oFF.JoinType.CONTAINS = oFF.JoinType.createJoinType("CONTAINS", oFF.JoinType._SPATIAL);
	oFF.JoinType.COVERED_BY = oFF.JoinType.createJoinType("COVERED_BY", oFF.JoinType._SPATIAL);
	oFF.JoinType.COVERS = oFF.JoinType.createJoinType("COVERS", oFF.JoinType._SPATIAL);
	oFF.JoinType.CROSSES = oFF.JoinType.createJoinType("CROSSES", oFF.JoinType._SPATIAL);
	oFF.JoinType.EQUALS = oFF.JoinType.createJoinType("EQUALS", oFF.JoinType._SPATIAL);
	oFF.JoinType.DISJOINT = oFF.JoinType.createJoinType("DISJOINT", oFF.JoinType._SPATIAL);
	oFF.JoinType.INTERSECTS = oFF.JoinType.createJoinType("INTERSECTS", oFF.JoinType._SPATIAL);
	oFF.JoinType.OVERLAPS = oFF.JoinType.createJoinType("OVERLAPS", oFF.JoinType._SPATIAL);
	oFF.JoinType.RELATE = oFF.JoinType.createJoinType("RELATE", oFF.JoinType._SPATIAL);
	oFF.JoinType.TOUCHES = oFF.JoinType.createJoinType("TOUCHES", oFF.JoinType._SPATIAL);
	oFF.JoinType.WITHIN = oFF.JoinType.createJoinType("WITHIN", oFF.JoinType._SPATIAL);
	oFF.JoinType.WITHIN_DISTANCE = oFF.JoinType.createJoinType("WITHIN_DISTANCE", oFF.JoinType._SPATIAL);
};
oFF.JoinType.createJoinType = function(name, parent)
{
	var newConstant = new oFF.JoinType();
	newConstant.setupExt(name, parent);
	oFF.JoinType.s_lookup.put(name, newConstant);
	return newConstant;
};
oFF.JoinType.lookup = function(name)
{
	return oFF.JoinType.s_lookup.getByKey(name);
};

oFF.Operator = function() {};
oFF.Operator.prototype = new oFF.XConstantWithParent();
oFF.Operator.prototype._ff_c = "Operator";

oFF.Operator.GRAVITY_0 = 0;
oFF.Operator.GRAVITY_1 = 1;
oFF.Operator.GRAVITY_2 = 2;
oFF.Operator.GRAVITY_3 = 3;
oFF.Operator.GRAVITY_4 = 4;
oFF.Operator.GRAVITY_5 = 5;
oFF.Operator.GRAVITY_6 = 6;
oFF.Operator.GRAVITY_7 = 7;
oFF.Operator.GRAVITY_8 = 8;
oFF.Operator.GRAVITY_9 = 9;
oFF.Operator._LOGICAL = null;
oFF.Operator._COMPARISON = null;
oFF.Operator._MATH = null;
oFF.Operator._ASSIGN = null;
oFF.Operator.staticSetup = function()
{
	oFF.Operator._LOGICAL = oFF.Operator.createOperator("Logical");
	oFF.Operator._COMPARISON = oFF.Operator.createOperator("Comparison");
	oFF.Operator._MATH = oFF.Operator.createOperator("Math");
	oFF.Operator._ASSIGN = oFF.Operator.createOperator("Assign");
};
oFF.Operator.createOperator = function(name)
{
	var operator = new oFF.Operator();
	operator.setupOperator(null, name, name, 0, 0, true);
	return operator;
};
oFF.Operator.prototype.m_displayString = null;
oFF.Operator.prototype.m_hasLeftSideHigherPrioWhenEqual = false;
oFF.Operator.prototype.m_numberOfParameters = 0;
oFF.Operator.prototype.m_prio = 0;
oFF.Operator.prototype.setupOperator = function(parent, name, displayString, numberOfParameters, gravity, hasLeftSideHigherPrioWhenEqual)
{
	this.setupExt(name, parent);
	this.setDisplayString(displayString);
	this.setNumberOfParameters(numberOfParameters);
	this.m_prio = gravity;
	this.m_hasLeftSideHigherPrioWhenEqual = hasLeftSideHigherPrioWhenEqual;
};
oFF.Operator.prototype.getDisplayString = function()
{
	return this.m_displayString;
};
oFF.Operator.prototype.setDisplayString = function(displayString)
{
	this.m_displayString = displayString;
};
oFF.Operator.prototype.getNumberOfParameters = function()
{
	return this.m_numberOfParameters;
};
oFF.Operator.prototype.setNumberOfParameters = function(numberOfParameters)
{
	this.m_numberOfParameters = numberOfParameters;
};
oFF.Operator.prototype.getPrio = function()
{
	return this.m_prio;
};
oFF.Operator.prototype.hasLeftSideHigherPrioWhenEqual = function()
{
	return this.m_hasLeftSideHigherPrioWhenEqual;
};

oFF.QMemberReadMode = function() {};
oFF.QMemberReadMode.prototype = new oFF.XConstantWithParent();
oFF.QMemberReadMode.prototype._ff_c = "QMemberReadMode";

oFF.QMemberReadMode.DEFAULT_VALUE = null;
oFF.QMemberReadMode.UNDEFINED = null;
oFF.QMemberReadMode.NONE = null;
oFF.QMemberReadMode.MASTER = null;
oFF.QMemberReadMode.MASTER_AND_SPACE = null;
oFF.QMemberReadMode.MASTER_AND_SPACE_AND_STATE = null;
oFF.QMemberReadMode.REL_MASTER = null;
oFF.QMemberReadMode.REL_MASTER_AND_SPACE = null;
oFF.QMemberReadMode.REL_MASTER_AND_SPACE_AND_STATE = null;
oFF.QMemberReadMode.BOOKED = null;
oFF.QMemberReadMode.BOOKED_AND_SPACE = null;
oFF.QMemberReadMode.BOOKED_AND_SPACE_AND_STATE = null;
oFF.QMemberReadMode.REL_BOOKED = null;
oFF.QMemberReadMode.REL_BOOKED_AND_SPACE = null;
oFF.QMemberReadMode.REL_BOOKED_AND_SPACE_AND_STATE = null;
oFF.QMemberReadMode.s_lookup = null;
oFF.QMemberReadMode.s_lookup_c = null;
oFF.QMemberReadMode.staticSetup = function()
{
	oFF.QMemberReadMode.s_lookup = oFF.XHashMapByString.create();
	oFF.QMemberReadMode.s_lookup_c = oFF.XHashMapByString.create();
	oFF.QMemberReadMode.DEFAULT_VALUE = oFF.QMemberReadMode.create("Default", null);
	oFF.QMemberReadMode.UNDEFINED = oFF.QMemberReadMode.create("Undefined", null);
	oFF.QMemberReadMode.NONE = oFF.QMemberReadMode.create("None", null);
	oFF.QMemberReadMode.MASTER = oFF.QMemberReadMode.create("Master", null);
	oFF.QMemberReadMode.MASTER_AND_SPACE = oFF.QMemberReadMode.create("MasterAndSpace", oFF.QMemberReadMode.MASTER);
	oFF.QMemberReadMode.MASTER_AND_SPACE_AND_STATE = oFF.QMemberReadMode.create("MasterAndSpaceAndState", oFF.QMemberReadMode.MASTER_AND_SPACE);
	oFF.QMemberReadMode.REL_MASTER = oFF.QMemberReadMode.create("RelatedMaster", null);
	oFF.QMemberReadMode.REL_MASTER_AND_SPACE = oFF.QMemberReadMode.create("RelatedMasterAndSpace", oFF.QMemberReadMode.MASTER);
	oFF.QMemberReadMode.REL_MASTER_AND_SPACE_AND_STATE = oFF.QMemberReadMode.create("RelatedMasterAndSpaceAndState", oFF.QMemberReadMode.REL_MASTER_AND_SPACE);
	oFF.QMemberReadMode.BOOKED = oFF.QMemberReadMode.create("Booked", null);
	oFF.QMemberReadMode.BOOKED_AND_SPACE = oFF.QMemberReadMode.create("BookedAndSpace", oFF.QMemberReadMode.BOOKED);
	oFF.QMemberReadMode.BOOKED_AND_SPACE_AND_STATE = oFF.QMemberReadMode.create("BookedAndSpaceAndState", oFF.QMemberReadMode.BOOKED_AND_SPACE);
	oFF.QMemberReadMode.REL_BOOKED = oFF.QMemberReadMode.create("RelatedBooked", null);
	oFF.QMemberReadMode.REL_BOOKED_AND_SPACE = oFF.QMemberReadMode.create("RelatedBookedAndSpace", oFF.QMemberReadMode.REL_BOOKED);
	oFF.QMemberReadMode.REL_BOOKED_AND_SPACE_AND_STATE = oFF.QMemberReadMode.create("RelatedBookedAndSpaceAndState", oFF.QMemberReadMode.REL_BOOKED_AND_SPACE);
	oFF.QMemberReadMode.MASTER.setChildAndSibling(oFF.QMemberReadMode.MASTER_AND_SPACE, oFF.QMemberReadMode.BOOKED, 0);
	oFF.QMemberReadMode.MASTER_AND_SPACE.setChildAndSibling(oFF.QMemberReadMode.MASTER_AND_SPACE_AND_STATE, oFF.QMemberReadMode.BOOKED_AND_SPACE, 1);
	oFF.QMemberReadMode.MASTER_AND_SPACE_AND_STATE.setChildAndSibling(null, oFF.QMemberReadMode.BOOKED_AND_SPACE_AND_STATE, 2);
	oFF.QMemberReadMode.REL_MASTER.setChildAndSibling(oFF.QMemberReadMode.REL_MASTER_AND_SPACE, oFF.QMemberReadMode.MASTER, 0);
	oFF.QMemberReadMode.REL_MASTER_AND_SPACE.setChildAndSibling(oFF.QMemberReadMode.REL_MASTER_AND_SPACE_AND_STATE, oFF.QMemberReadMode.MASTER_AND_SPACE, 1);
	oFF.QMemberReadMode.REL_MASTER_AND_SPACE_AND_STATE.setChildAndSibling(null, oFF.QMemberReadMode.MASTER_AND_SPACE_AND_STATE, 2);
	oFF.QMemberReadMode.BOOKED.setChildAndSibling(oFF.QMemberReadMode.BOOKED_AND_SPACE, oFF.QMemberReadMode.MASTER, 0);
	oFF.QMemberReadMode.BOOKED_AND_SPACE.setChildAndSibling(oFF.QMemberReadMode.BOOKED_AND_SPACE_AND_STATE, oFF.QMemberReadMode.MASTER_AND_SPACE, 1);
	oFF.QMemberReadMode.BOOKED_AND_SPACE_AND_STATE.setChildAndSibling(null, oFF.QMemberReadMode.MASTER_AND_SPACE_AND_STATE, 2);
	oFF.QMemberReadMode.REL_BOOKED.setChildAndSibling(oFF.QMemberReadMode.REL_BOOKED_AND_SPACE, oFF.QMemberReadMode.BOOKED, 0);
	oFF.QMemberReadMode.REL_BOOKED_AND_SPACE.setChildAndSibling(oFF.QMemberReadMode.REL_BOOKED_AND_SPACE_AND_STATE, oFF.QMemberReadMode.BOOKED_AND_SPACE, 1);
	oFF.QMemberReadMode.REL_BOOKED_AND_SPACE_AND_STATE.setChildAndSibling(null, oFF.QMemberReadMode.BOOKED_AND_SPACE_AND_STATE, 2);
};
oFF.QMemberReadMode.create = function(name, parent)
{
	var newConstant = new oFF.QMemberReadMode();
	newConstant.setupExt(name, parent);
	oFF.QMemberReadMode.addToLookupTable(name, newConstant);
	return newConstant;
};
oFF.QMemberReadMode.addToLookupTable = function(name, newConstant)
{
	oFF.QMemberReadMode.s_lookup.put(name, newConstant);
	oFF.QMemberReadMode.s_lookup_c.put(oFF.XString.toUpperCase(name), newConstant);
};
oFF.QMemberReadMode.lookup = function(name)
{
	return oFF.QMemberReadMode.s_lookup.getByKey(name);
};
oFF.QMemberReadMode.lookupCaseInsensitive = function(name)
{
	return oFF.QMemberReadMode.s_lookup_c.getByKey(oFF.XString.toUpperCase(name));
};
oFF.QMemberReadMode.prototype.m_child = null;
oFF.QMemberReadMode.prototype.m_sibling = null;
oFF.QMemberReadMode.prototype.m_order = 0;
oFF.QMemberReadMode.prototype.setChildAndSibling = function(child, sibling, order)
{
	this.m_child = child;
	this.m_sibling = sibling;
	this.m_order = order;
};
oFF.QMemberReadMode.prototype.getChild = function()
{
	return this.m_child;
};
oFF.QMemberReadMode.prototype.getSibling = function()
{
	return this.m_sibling;
};
oFF.QMemberReadMode.prototype.getOrder = function()
{
	return this.m_order;
};

oFF.QModelLevel = function() {};
oFF.QModelLevel.prototype = new oFF.XConstantWithParent();
oFF.QModelLevel.prototype._ff_c = "QModelLevel";

oFF.QModelLevel.NONE = null;
oFF.QModelLevel.QUERY = null;
oFF.QModelLevel.AXES = null;
oFF.QModelLevel.DIMENSIONS = null;
oFF.QModelLevel.staticSetup = function()
{
	oFF.QModelLevel.NONE = oFF.QModelLevel.create("None", null, 0);
	oFF.QModelLevel.QUERY = oFF.QModelLevel.create("Query", oFF.QModelLevel.NONE, 1);
	oFF.QModelLevel.AXES = oFF.QModelLevel.create("Axes", oFF.QModelLevel.QUERY, 2);
	oFF.QModelLevel.DIMENSIONS = oFF.QModelLevel.create("Dimensions", oFF.QModelLevel.AXES, 3);
};
oFF.QModelLevel.create = function(name, parent, level)
{
	var object = new oFF.QModelLevel();
	object.setupExt(name, parent);
	object.m_level = level;
	return object;
};
oFF.QModelLevel.prototype.m_level = 0;
oFF.QModelLevel.prototype.getLevel = function()
{
	return this.m_level;
};

oFF.QModelOrigin = function() {};
oFF.QModelOrigin.prototype = new oFF.XConstantWithParent();
oFF.QModelOrigin.prototype._ff_c = "QModelOrigin";

oFF.QModelOrigin.INITIAL_SERVER_CALL = null;
oFF.QModelOrigin.IMPORTER = null;
oFF.QModelOrigin.VARIABLE_SUBMIT = null;
oFF.QModelOrigin.CLONING = null;
oFF.QModelOrigin.staticSetup = function()
{
	oFF.QModelOrigin.INITIAL_SERVER_CALL = oFF.QModelOrigin.create("InitialServerCall", null);
	oFF.QModelOrigin.IMPORTER = oFF.QModelOrigin.create("Importer", null);
	oFF.QModelOrigin.VARIABLE_SUBMIT = oFF.QModelOrigin.create("VariableSubmit", null);
	oFF.QModelOrigin.CLONING = oFF.QModelOrigin.create("Cloning", null);
};
oFF.QModelOrigin.create = function(name, parent)
{
	var modelFormat = new oFF.QModelOrigin();
	modelFormat.setupExt(name, parent);
	return modelFormat;
};

oFF.QSetSignComparisonOperatorGroup = function() {};
oFF.QSetSignComparisonOperatorGroup.prototype = new oFF.XConstantWithParent();
oFF.QSetSignComparisonOperatorGroup.prototype._ff_c = "QSetSignComparisonOperatorGroup";

oFF.QSetSignComparisonOperatorGroup.SINGLE_VALUE = null;
oFF.QSetSignComparisonOperatorGroup.SINGLE_VALUE_INCLUDE_ONLY = null;
oFF.QSetSignComparisonOperatorGroup.INTERVAL = null;
oFF.QSetSignComparisonOperatorGroup.INTERVAL_INCLUDE_ONLY = null;
oFF.QSetSignComparisonOperatorGroup.RANGE = null;
oFF.QSetSignComparisonOperatorGroup.RANGE_INCLUDE_ONLY = null;
oFF.QSetSignComparisonOperatorGroup.staticSetup = function()
{
	oFF.QSetSignComparisonOperatorGroup.SINGLE_VALUE = oFF.QSetSignComparisonOperatorGroup.create("SingleValue", null, true);
	oFF.QSetSignComparisonOperatorGroup.SINGLE_VALUE_INCLUDE_ONLY = oFF.QSetSignComparisonOperatorGroup.create("SingleValueIncludeOnly", oFF.QSetSignComparisonOperatorGroup.SINGLE_VALUE, false);
	oFF.QSetSignComparisonOperatorGroup.INTERVAL = oFF.QSetSignComparisonOperatorGroup.create("Interval", null, true);
	oFF.QSetSignComparisonOperatorGroup.INTERVAL_INCLUDE_ONLY = oFF.QSetSignComparisonOperatorGroup.create("IntervalIncludeOnly", oFF.QSetSignComparisonOperatorGroup.INTERVAL, false);
	oFF.QSetSignComparisonOperatorGroup.RANGE = oFF.QSetSignComparisonOperatorGroup.create("Range", null, true);
	oFF.QSetSignComparisonOperatorGroup.RANGE_INCLUDE_ONLY = oFF.QSetSignComparisonOperatorGroup.create("RangeIncludeOnly", oFF.QSetSignComparisonOperatorGroup.RANGE, false);
};
oFF.QSetSignComparisonOperatorGroup.create = function(name, parent, withExcludeSign)
{
	var newConstant = new oFF.QSetSignComparisonOperatorGroup();
	newConstant.setupExt(name, parent);
	newConstant.setupOperatorGroup(withExcludeSign);
	return newConstant;
};
oFF.QSetSignComparisonOperatorGroup.prototype.m_setSigns = null;
oFF.QSetSignComparisonOperatorGroup.prototype.m_comparisonOperators = null;
oFF.QSetSignComparisonOperatorGroup.prototype.setupOperatorGroup = function(withExcludeSign)
{
	this.m_setSigns = oFF.XListOfNameObject.create();
	this.m_comparisonOperators = oFF.XHashMapByString.create();
	if (oFF.XString.startsWith(this.getName(), "SingleValue"))
	{
		this.m_setSigns.add(oFF.SetSign.INCLUDING);
		var svOperatorSignIncluding = oFF.XListOfNameObject.create();
		svOperatorSignIncluding.add(oFF.ComparisonOperator.EQUAL);
		this.m_comparisonOperators.put(oFF.SetSign.INCLUDING.getName(), svOperatorSignIncluding);
		if (withExcludeSign)
		{
			this.m_setSigns.add(oFF.SetSign.EXCLUDING);
			var svOperatorSignExcluding = oFF.XListOfNameObject.create();
			svOperatorSignExcluding.add(oFF.ComparisonOperator.EQUAL);
			this.m_comparisonOperators.put(oFF.SetSign.EXCLUDING.getName(), svOperatorSignExcluding);
		}
	}
	else if (oFF.XString.startsWith(this.getName(), "Interval"))
	{
		this.m_setSigns.add(oFF.SetSign.INCLUDING);
		var iOperatorSignIncluding = oFF.XListOfNameObject.create();
		iOperatorSignIncluding.add(oFF.ComparisonOperator.BETWEEN);
		iOperatorSignIncluding.add(oFF.ComparisonOperator.EQUAL);
		this.m_comparisonOperators.put(oFF.SetSign.INCLUDING.getName(), iOperatorSignIncluding);
		if (withExcludeSign)
		{
			this.m_setSigns.add(oFF.SetSign.EXCLUDING);
			var iOperatorSignExcluding = oFF.XListOfNameObject.create();
			iOperatorSignExcluding.add(oFF.ComparisonOperator.BETWEEN);
			iOperatorSignExcluding.add(oFF.ComparisonOperator.EQUAL);
			this.m_comparisonOperators.put(oFF.SetSign.EXCLUDING.getName(), iOperatorSignExcluding);
		}
	}
	else if (oFF.XString.startsWith(this.getName(), "Range"))
	{
		this.m_setSigns.add(oFF.SetSign.INCLUDING);
		var operatorSignIncluding = oFF.XListOfNameObject.create();
		operatorSignIncluding.add(oFF.ComparisonOperator.BETWEEN);
		operatorSignIncluding.add(oFF.ComparisonOperator.EQUAL);
		operatorSignIncluding.add(oFF.ComparisonOperator.GREATER_EQUAL);
		operatorSignIncluding.add(oFF.ComparisonOperator.GREATER_THAN);
		operatorSignIncluding.add(oFF.ComparisonOperator.LESS_EQUAL);
		operatorSignIncluding.add(oFF.ComparisonOperator.LESS_THAN);
		operatorSignIncluding.add(oFF.ComparisonOperator.NOT_EQUAL);
		operatorSignIncluding.add(oFF.ComparisonOperator.NOT_BETWEEN);
		operatorSignIncluding.add(oFF.ComparisonOperator.LIKE);
		operatorSignIncluding.add(oFF.ComparisonOperator.MATCH);
		this.m_comparisonOperators.put(oFF.SetSign.INCLUDING.getName(), operatorSignIncluding);
		if (withExcludeSign)
		{
			this.m_setSigns.add(oFF.SetSign.EXCLUDING);
			var operatorSignExcluding = oFF.XListOfNameObject.create();
			operatorSignExcluding.add(oFF.ComparisonOperator.BETWEEN);
			operatorSignExcluding.add(oFF.ComparisonOperator.EQUAL);
			operatorSignExcluding.add(oFF.ComparisonOperator.GREATER_EQUAL);
			operatorSignExcluding.add(oFF.ComparisonOperator.GREATER_THAN);
			operatorSignExcluding.add(oFF.ComparisonOperator.LESS_EQUAL);
			operatorSignExcluding.add(oFF.ComparisonOperator.LESS_THAN);
			operatorSignExcluding.add(oFF.ComparisonOperator.NOT_EQUAL);
			operatorSignExcluding.add(oFF.ComparisonOperator.NOT_BETWEEN);
			operatorSignExcluding.add(oFF.ComparisonOperator.LIKE);
			operatorSignExcluding.add(oFF.ComparisonOperator.MATCH);
			this.m_comparisonOperators.put(oFF.SetSign.EXCLUDING.getName(), operatorSignExcluding);
		}
	}
};
oFF.QSetSignComparisonOperatorGroup.prototype.getSetSigns = function()
{
	return this.m_setSigns;
};
oFF.QSetSignComparisonOperatorGroup.prototype.getComparisonOperatorsForSign = function(sign)
{
	return this.m_comparisonOperators.getByKey(sign.getName());
};

oFF.ResultSetState = function() {};
oFF.ResultSetState.prototype = new oFF.XConstantWithParent();
oFF.ResultSetState.prototype._ff_c = "ResultSetState";

oFF.ResultSetState.INITIAL = null;
oFF.ResultSetState.FETCHING = null;
oFF.ResultSetState.TERMINATED = null;
oFF.ResultSetState.DATA_AVAILABLE = null;
oFF.ResultSetState.SIZE_LIMIT_EXCEEDED = null;
oFF.ResultSetState.SUCCESSFUL_PERSISTED = null;
oFF.ResultSetState.NO_DATA_AVAILABLE = null;
oFF.ResultSetState.USER_NOT_AUTHORIZED = null;
oFF.ResultSetState.ERROR = null;
oFF.ResultSetState.INVALID_VARIABLE_VALUES = null;
oFF.ResultSetState.UNSUBMITTED_VARIABLES = null;
oFF.ResultSetState.DATA_ACCESS_PROBLEMS = null;
oFF.ResultSetState.INVALID_QUERY_VIEW_STATE = null;
oFF.ResultSetState.EMPTY_JSON = null;
oFF.ResultSetState.staticSetup = function()
{
	oFF.ResultSetState.INITIAL = oFF.ResultSetState.create("INITIAL", null);
	oFF.ResultSetState.FETCHING = oFF.ResultSetState.create("FETCHING", null);
	oFF.ResultSetState.TERMINATED = oFF.ResultSetState.create("TERMINATED", null);
	oFF.ResultSetState.DATA_AVAILABLE = oFF.ResultSetState.create("DATA_AVAILABLE", null);
	oFF.ResultSetState.SIZE_LIMIT_EXCEEDED = oFF.ResultSetState.create("SIZE_LIMIT_EXCEEDED", null);
	oFF.ResultSetState.NO_DATA_AVAILABLE = oFF.ResultSetState.create("NO_DATA_AVAILABLE", null);
	oFF.ResultSetState.USER_NOT_AUTHORIZED = oFF.ResultSetState.create("USER_NOT_AUTHORIZED", null);
	oFF.ResultSetState.SUCCESSFUL_PERSISTED = oFF.ResultSetState.create("SUCCESSFUL_PERSISTED", null);
	oFF.ResultSetState.EMPTY_JSON = oFF.ResultSetState.create("EMPTY_JSON", null);
	oFF.ResultSetState.ERROR = oFF.ResultSetState.create("ERROR", null);
	oFF.ResultSetState.INVALID_VARIABLE_VALUES = oFF.ResultSetState.create("INVALID_VARIABLE_VALUES", oFF.ResultSetState.ERROR);
	oFF.ResultSetState.UNSUBMITTED_VARIABLES = oFF.ResultSetState.create("UNSUBMITTED_VARIABLES", oFF.ResultSetState.ERROR);
	oFF.ResultSetState.DATA_ACCESS_PROBLEMS = oFF.ResultSetState.create("DATA_ACCESS_PROBLEMS", oFF.ResultSetState.ERROR);
	oFF.ResultSetState.INVALID_QUERY_VIEW_STATE = oFF.ResultSetState.create("INVALID_QUERY_VIEW_STATE", oFF.ResultSetState.ERROR);
};
oFF.ResultSetState.create = function(name, parent)
{
	var state = new oFF.ResultSetState();
	state.setupExt(name, parent);
	return state;
};
oFF.ResultSetState.prototype.hasData = function()
{
	return this === oFF.ResultSetState.DATA_AVAILABLE;
};
oFF.ResultSetState.prototype.isErrorState = function()
{
	return this.isTypeOf(oFF.ResultSetState.ERROR);
};

oFF.ResultVisibility = function() {};
oFF.ResultVisibility.prototype = new oFF.XConstantWithParent();
oFF.ResultVisibility.prototype._ff_c = "ResultVisibility";

oFF.ResultVisibility.VISIBLE = null;
oFF.ResultVisibility.ALWAYS = null;
oFF.ResultVisibility.HIDDEN = null;
oFF.ResultVisibility.HIDDEN_DESCENDANTS_SELF_AFTER = null;
oFF.ResultVisibility.CONDITIONAL = null;
oFF.ResultVisibility.s_lookup = null;
oFF.ResultVisibility.staticSetup = function()
{
	oFF.ResultVisibility.s_lookup = oFF.XHashMapByString.create();
	oFF.ResultVisibility.VISIBLE = oFF.ResultVisibility.createResultVisibility("Visible", null);
	oFF.ResultVisibility.ALWAYS = oFF.ResultVisibility.createResultVisibility("Always", null);
	oFF.ResultVisibility.HIDDEN = oFF.ResultVisibility.createResultVisibility("Hidden", null);
	oFF.ResultVisibility.HIDDEN_DESCENDANTS_SELF_AFTER = oFF.ResultVisibility.createResultVisibility("HiddenDescSelfAfter", oFF.ResultVisibility.HIDDEN);
	oFF.ResultVisibility.CONDITIONAL = oFF.ResultVisibility.createResultVisibility("Conditional", null);
};
oFF.ResultVisibility.createResultVisibility = function(name, parent)
{
	var resultVisibility = new oFF.ResultVisibility();
	resultVisibility.setupExt(name, parent);
	oFF.ResultVisibility.s_lookup.put(name, resultVisibility);
	return resultVisibility;
};
oFF.ResultVisibility.lookup = function(name)
{
	return oFF.ResultVisibility.s_lookup.getByKey(name);
};

oFF.SortType = function() {};
oFF.SortType.prototype = new oFF.XConstantWithParent();
oFF.SortType.prototype._ff_c = "SortType";

oFF.SortType.ABSTRACT_DIMENSION_SORT = null;
oFF.SortType.MEMBER_KEY = null;
oFF.SortType.MEMBER_TEXT = null;
oFF.SortType.FILTER = null;
oFF.SortType.HIERARCHY = null;
oFF.SortType.DATA_CELL_VALUE = null;
oFF.SortType.FIELD = null;
oFF.SortType.MEASURE = null;
oFF.SortType.COMPLEX = null;
oFF.SortType.CUSTOM = null;
oFF.SortType.s_all = null;
oFF.SortType.staticSetup = function()
{
	oFF.SortType.s_all = oFF.XLinkedHashMapByString.create();
	oFF.SortType.ABSTRACT_DIMENSION_SORT = oFF.SortType.create("AbstractDimensionSort", null);
	oFF.SortType.MEMBER_KEY = oFF.SortType.create("MemberKey", oFF.SortType.ABSTRACT_DIMENSION_SORT);
	oFF.SortType.MEMBER_TEXT = oFF.SortType.create("MemberText", oFF.SortType.ABSTRACT_DIMENSION_SORT);
	oFF.SortType.FILTER = oFF.SortType.create("Filter", oFF.SortType.ABSTRACT_DIMENSION_SORT);
	oFF.SortType.HIERARCHY = oFF.SortType.create("Hierarchy", oFF.SortType.ABSTRACT_DIMENSION_SORT);
	oFF.SortType.FIELD = oFF.SortType.create("Field", oFF.SortType.ABSTRACT_DIMENSION_SORT);
	oFF.SortType.DATA_CELL_VALUE = oFF.SortType.create("DataCellValue", null);
	oFF.SortType.MEASURE = oFF.SortType.create("Measure", null);
	oFF.SortType.COMPLEX = oFF.SortType.create("Complex", null);
	oFF.SortType.CUSTOM = oFF.SortType.create("Custom", null);
};
oFF.SortType.create = function(name, parent)
{
	var newConstant = new oFF.SortType();
	newConstant.setupExt(name, parent);
	oFF.SortType.s_all.put(name, newConstant);
	return newConstant;
};
oFF.SortType.getAllSortTypes = function()
{
	return oFF.SortType.s_all.getValuesAsReadOnlyList();
};
oFF.SortType.lookup = function(name)
{
	return oFF.SortType.s_all.getByKey(name);
};

oFF.TextTransformationType = function() {};
oFF.TextTransformationType.prototype = new oFF.XConstantWithParent();
oFF.TextTransformationType.prototype._ff_c = "TextTransformationType";

oFF.TextTransformationType.STRING_TRANSFORMATION = null;
oFF.TextTransformationType.SPATIAL_TRANSFORMATION = null;
oFF.TextTransformationType.UPPERCASE = null;
oFF.TextTransformationType.LOWERCASE = null;
oFF.TextTransformationType.CAPITALIZE = null;
oFF.TextTransformationType.SPATIAL_AS_BINARY = null;
oFF.TextTransformationType.SPATIAL_AS_EWKB = null;
oFF.TextTransformationType.SPATIAL_AS_EWKT = null;
oFF.TextTransformationType.SPATIAL_AS_GEOJSON = null;
oFF.TextTransformationType.SPATIAL_AS_TEXT = null;
oFF.TextTransformationType.SPATIAL_AS_WKB = null;
oFF.TextTransformationType.SPATIAL_AS_WKT = null;
oFF.TextTransformationType.SPATIAL_AS_SVG = null;
oFF.TextTransformationType.s_lookupNames = null;
oFF.TextTransformationType.staticSetup = function()
{
	oFF.TextTransformationType.s_lookupNames = oFF.XHashMapByString.create();
	oFF.TextTransformationType.STRING_TRANSFORMATION = oFF.TextTransformationType.create("StringTransformation", null);
	oFF.TextTransformationType.UPPERCASE = oFF.TextTransformationType.create("Uppercase", oFF.TextTransformationType.STRING_TRANSFORMATION);
	oFF.TextTransformationType.LOWERCASE = oFF.TextTransformationType.create("Lowercase", oFF.TextTransformationType.STRING_TRANSFORMATION);
	oFF.TextTransformationType.CAPITALIZE = oFF.TextTransformationType.create("Capitalize", oFF.TextTransformationType.STRING_TRANSFORMATION);
	oFF.TextTransformationType.SPATIAL_TRANSFORMATION = oFF.TextTransformationType.create("SpatialTransformation", null);
	oFF.TextTransformationType.SPATIAL_AS_BINARY = oFF.TextTransformationType.create("SpatialAsBinary", oFF.TextTransformationType.SPATIAL_TRANSFORMATION);
	oFF.TextTransformationType.SPATIAL_AS_EWKB = oFF.TextTransformationType.create("SpatialAsEWKB", oFF.TextTransformationType.SPATIAL_TRANSFORMATION);
	oFF.TextTransformationType.SPATIAL_AS_EWKT = oFF.TextTransformationType.create("SpatialAsEWKT", oFF.TextTransformationType.SPATIAL_TRANSFORMATION);
	oFF.TextTransformationType.SPATIAL_AS_GEOJSON = oFF.TextTransformationType.create("SpatialAsGeoJSON", oFF.TextTransformationType.SPATIAL_TRANSFORMATION);
	oFF.TextTransformationType.SPATIAL_AS_TEXT = oFF.TextTransformationType.create("SpatialAsText", oFF.TextTransformationType.SPATIAL_TRANSFORMATION);
	oFF.TextTransformationType.SPATIAL_AS_WKB = oFF.TextTransformationType.create("SpatialAsWKB", oFF.TextTransformationType.SPATIAL_TRANSFORMATION);
	oFF.TextTransformationType.SPATIAL_AS_WKT = oFF.TextTransformationType.create("SpatialAsWKT", oFF.TextTransformationType.SPATIAL_TRANSFORMATION);
	oFF.TextTransformationType.SPATIAL_AS_SVG = oFF.TextTransformationType.create("SpatialAsSVG", oFF.TextTransformationType.SPATIAL_TRANSFORMATION);
};
oFF.TextTransformationType.create = function(name, parent)
{
	var newObj = new oFF.TextTransformationType();
	newObj.setupExt(name, parent);
	oFF.TextTransformationType.s_lookupNames.put(name, newObj);
	return newObj;
};
oFF.TextTransformationType.lookupName = function(name)
{
	return oFF.TextTransformationType.s_lookupNames.getByKey(name);
};

oFF.PlanningCommandType = function() {};
oFF.PlanningCommandType.prototype = new oFF.XConstantWithParent();
oFF.PlanningCommandType.prototype._ff_c = "PlanningCommandType";

oFF.PlanningCommandType.PLANNING_CONTEXT_COMMAND = null;
oFF.PlanningCommandType.DATA_AREA_COMMAND = null;
oFF.PlanningCommandType.PLANNING_MODEL_COMMAND = null;
oFF.PlanningCommandType.PLANNING_REQUEST = null;
oFF.PlanningCommandType.DATA_AREA_REQUEST = null;
oFF.PlanningCommandType.PLANNING_MODEL_REQUEST = null;
oFF.PlanningCommandType.PLANNING_COMMAND_WITH_ID = null;
oFF.PlanningCommandType.PLANNING_OPERATION = null;
oFF.PlanningCommandType.PLANNING_FUNCTION = null;
oFF.PlanningCommandType.PLANNING_SEQUENCE = null;
oFF.PlanningCommandType.PLANNING_ACTION = null;
oFF.PlanningCommandType.staticSetup = function()
{
	oFF.PlanningCommandType.PLANNING_CONTEXT_COMMAND = oFF.PlanningCommandType.create("PLANNING_CONTEXT_COMMAND", null);
	oFF.PlanningCommandType.DATA_AREA_COMMAND = oFF.PlanningCommandType.create("DATA_AREA_COMMAND", oFF.PlanningCommandType.PLANNING_CONTEXT_COMMAND);
	oFF.PlanningCommandType.PLANNING_MODEL_COMMAND = oFF.PlanningCommandType.create("PLANNING_MODEL_COMMAND", oFF.PlanningCommandType.PLANNING_CONTEXT_COMMAND);
	oFF.PlanningCommandType.PLANNING_REQUEST = oFF.PlanningCommandType.create("PLANNING_REQUEST", null);
	oFF.PlanningCommandType.DATA_AREA_REQUEST = oFF.PlanningCommandType.create("DATA_AREA_REQUEST", oFF.PlanningCommandType.PLANNING_REQUEST);
	oFF.PlanningCommandType.PLANNING_MODEL_REQUEST = oFF.PlanningCommandType.create("PLANNING_CONTEXT_COMMAND", oFF.PlanningCommandType.PLANNING_REQUEST);
	oFF.PlanningCommandType.PLANNING_COMMAND_WITH_ID = oFF.PlanningCommandType.create("PLANNING_COMMAND_WITH_ID", null);
	oFF.PlanningCommandType.PLANNING_OPERATION = oFF.PlanningCommandType.create("PLANNING_OPERATION", oFF.PlanningCommandType.PLANNING_COMMAND_WITH_ID);
	oFF.PlanningCommandType.PLANNING_FUNCTION = oFF.PlanningCommandType.create("PLANNING_FUNCTION", oFF.PlanningCommandType.PLANNING_OPERATION);
	oFF.PlanningCommandType.PLANNING_SEQUENCE = oFF.PlanningCommandType.create("PLANNING_SEQUENCE", oFF.PlanningCommandType.PLANNING_OPERATION);
	oFF.PlanningCommandType.PLANNING_ACTION = oFF.PlanningCommandType.create("PLANNING_ACTION", oFF.PlanningCommandType.PLANNING_COMMAND_WITH_ID);
};
oFF.PlanningCommandType.create = function(name, parent)
{
	var object = new oFF.PlanningCommandType();
	object.setupExt(name, parent);
	return object;
};

oFF.DataAreaRequestType = function() {};
oFF.DataAreaRequestType.prototype = new oFF.XConstantWithParent();
oFF.DataAreaRequestType.prototype._ff_c = "DataAreaRequestType";

oFF.DataAreaRequestType.GET_PLANNING_OPERATION_METADATA = null;
oFF.DataAreaRequestType.GET_PLANNING_FUNCTION_METADATA = null;
oFF.DataAreaRequestType.GET_PLANNING_SEQUENCE_METADATA = null;
oFF.DataAreaRequestType.CREATE_PLANNING_OPERATION = null;
oFF.DataAreaRequestType.CREATE_PLANNING_FUNCTION = null;
oFF.DataAreaRequestType.CREATE_PLANNING_SEQUENCE = null;
oFF.DataAreaRequestType.staticSetup = function()
{
	oFF.DataAreaRequestType.GET_PLANNING_OPERATION_METADATA = oFF.DataAreaRequestType.create("GET_PLANNING_OPERATION_METADATA", null);
	oFF.DataAreaRequestType.GET_PLANNING_FUNCTION_METADATA = oFF.DataAreaRequestType.create("GET_PLANNING_FUNCTION_METADATA", oFF.DataAreaRequestType.GET_PLANNING_OPERATION_METADATA);
	oFF.DataAreaRequestType.GET_PLANNING_SEQUENCE_METADATA = oFF.DataAreaRequestType.create("GET_PLANNING_SEQUENCE_METADATA", oFF.DataAreaRequestType.GET_PLANNING_OPERATION_METADATA);
	oFF.DataAreaRequestType.CREATE_PLANNING_OPERATION = oFF.DataAreaRequestType.create("CREATE_PLANNING_OPERATION", null);
	oFF.DataAreaRequestType.CREATE_PLANNING_FUNCTION = oFF.DataAreaRequestType.create("CREATE_PLANNING_FUNCTION", oFF.DataAreaRequestType.CREATE_PLANNING_OPERATION);
	oFF.DataAreaRequestType.CREATE_PLANNING_SEQUENCE = oFF.DataAreaRequestType.create("CREATE_PLANNING_SEQUENCE", oFF.DataAreaRequestType.CREATE_PLANNING_OPERATION);
};
oFF.DataAreaRequestType.create = function(name, parentType)
{
	var object = new oFF.DataAreaRequestType();
	object.setupExt(name, parentType);
	return object;
};

oFF.PlanningActionType = function() {};
oFF.PlanningActionType.prototype = new oFF.XConstantWithParent();
oFF.PlanningActionType.prototype._ff_c = "PlanningActionType";

oFF.PlanningActionType.VERSION_ACTION = null;
oFF.PlanningActionType.QUERY_ACTION = null;
oFF.PlanningActionType.DATA_ENTRY = null;
oFF.PlanningActionType.PUBLISH = null;
oFF.PlanningActionType.INITIAL_POPULATE = null;
oFF.PlanningActionType.GENERAL = null;
oFF.PlanningActionType.QUERY_SINGLE = null;
oFF.PlanningActionType.QUERY_MULTIPLE = null;
oFF.PlanningActionType.UNKNOWN = null;
oFF.PlanningActionType.staticSetup = function()
{
	oFF.PlanningActionType.UNKNOWN = oFF.PlanningActionType.create("UNKNOWN", null);
	oFF.PlanningActionType.VERSION_ACTION = oFF.PlanningActionType.create("VERSION_ACTION", null);
	oFF.PlanningActionType.PUBLISH = oFF.PlanningActionType.create("PUBLISH", oFF.PlanningActionType.VERSION_ACTION);
	oFF.PlanningActionType.INITIAL_POPULATE = oFF.PlanningActionType.create("INITIAL_POPULATE", oFF.PlanningActionType.VERSION_ACTION);
	oFF.PlanningActionType.GENERAL = oFF.PlanningActionType.create("GENERAL", oFF.PlanningActionType.VERSION_ACTION);
	oFF.PlanningActionType.QUERY_ACTION = oFF.PlanningActionType.create("QUERY_ACTION", null);
	oFF.PlanningActionType.DATA_ENTRY = oFF.PlanningActionType.create("DATA_ENTRY", oFF.PlanningActionType.QUERY_ACTION);
	oFF.PlanningActionType.QUERY_SINGLE = oFF.PlanningActionType.create("QUERY_SINGLE", oFF.PlanningActionType.QUERY_ACTION);
	oFF.PlanningActionType.QUERY_MULTIPLE = oFF.PlanningActionType.create("QUERY_MULTIPLE", oFF.PlanningActionType.QUERY_SINGLE);
};
oFF.PlanningActionType.create = function(name, parent)
{
	var object = new oFF.PlanningActionType();
	object.setupExt(name, parent);
	return object;
};
oFF.PlanningActionType.lookup = function(actionTypeId)
{
	switch (actionTypeId)
	{
		case 0:
			return oFF.PlanningActionType.DATA_ENTRY;

		case 1:
			return oFF.PlanningActionType.PUBLISH;

		case 2:
			return oFF.PlanningActionType.INITIAL_POPULATE;

		case 3:
			return oFF.PlanningActionType.GENERAL;

		case 4:
			return oFF.PlanningActionType.QUERY_SINGLE;

		case 5:
			return oFF.PlanningActionType.QUERY_MULTIPLE;
	}
	return oFF.PlanningActionType.UNKNOWN;
};

oFF.PlanningModelRequestType = function() {};
oFF.PlanningModelRequestType.prototype = new oFF.XConstantWithParent();
oFF.PlanningModelRequestType.prototype._ff_c = "PlanningModelRequestType";

oFF.PlanningModelRequestType.GET_ACTION_PARAMETERS = null;
oFF.PlanningModelRequestType.CREATE_PLANNING_ACTION = null;
oFF.PlanningModelRequestType.CREATE_PLANNING_ACTION_BASE = null;
oFF.PlanningModelRequestType.VERSION_REQUEST = null;
oFF.PlanningModelRequestType.VERSION_REQUEST_WITH_STATE_UPDATE = null;
oFF.PlanningModelRequestType.INIT_VERSION = null;
oFF.PlanningModelRequestType.SET_PARAMETERS = null;
oFF.PlanningModelRequestType.BACKUP_VERSION = null;
oFF.PlanningModelRequestType.CLOSE_VERSION = null;
oFF.PlanningModelRequestType.DROP_VERSION = null;
oFF.PlanningModelRequestType.SET_TIMEOUT = null;
oFF.PlanningModelRequestType.RESET_VERSION = null;
oFF.PlanningModelRequestType.UNDO_VERSION = null;
oFF.PlanningModelRequestType.REDO_VERSION = null;
oFF.PlanningModelRequestType.UPDATE_PRIVILEGES = null;
oFF.PlanningModelRequestType.DELETE_ALL_VERSIONS = null;
oFF.PlanningModelRequestType.CLEANUP = null;
oFF.PlanningModelRequestType.UPDATE_PARAMETERS = null;
oFF.PlanningModelRequestType.REFRESH_VERSIONS = null;
oFF.PlanningModelRequestType.REFRESH_ACTIONS = null;
oFF.PlanningModelRequestType.START_ACTION_SEQUENCE = null;
oFF.PlanningModelRequestType.END_ACTION_SEQUENCE = null;
oFF.PlanningModelRequestType.KILL_ACTION_SEQUENCE = null;
oFF.PlanningModelRequestType.GET_VERSION_STATE_DESCRIPTIONS = null;
oFF.PlanningModelRequestType.staticSetup = function()
{
	oFF.PlanningModelRequestType.GET_ACTION_PARAMETERS = oFF.PlanningModelRequestType.create("GET_ACTION_PARAMETERS", false);
	oFF.PlanningModelRequestType.CREATE_PLANNING_ACTION_BASE = oFF.PlanningModelRequestType.create("CREATE_PLANNING_ACTION_BASE", true);
	oFF.PlanningModelRequestType.CREATE_PLANNING_ACTION = oFF.PlanningModelRequestType.create("CREATE_PLANNING_ACTION", true);
	oFF.PlanningModelRequestType.UPDATE_PRIVILEGES = oFF.PlanningModelRequestType.create("UPDATE_VERSION_PRIVILEGES", true);
	oFF.PlanningModelRequestType.DELETE_ALL_VERSIONS = oFF.PlanningModelRequestType.create("DELETE_ALL_VERSIONS", true);
	oFF.PlanningModelRequestType.CLEANUP = oFF.PlanningModelRequestType.create("CLEANUP", true);
	oFF.PlanningModelRequestType.REFRESH_VERSIONS = oFF.PlanningModelRequestType.create("REFRESH_VERSIONS", true);
	oFF.PlanningModelRequestType.REFRESH_ACTIONS = oFF.PlanningModelRequestType.create("REFRESH_ACTIONS", true);
	oFF.PlanningModelRequestType.VERSION_REQUEST = oFF.PlanningModelRequestType.create("VERSION_REQUEST", true);
	oFF.PlanningModelRequestType.VERSION_REQUEST_WITH_STATE_UPDATE = oFF.PlanningModelRequestType.createWithParent("VERSION_REQUEST_WITH_STATE_UPDATE", oFF.PlanningModelRequestType.VERSION_REQUEST, true);
	oFF.PlanningModelRequestType.INIT_VERSION = oFF.PlanningModelRequestType.createWithParent("init", oFF.PlanningModelRequestType.VERSION_REQUEST_WITH_STATE_UPDATE, true);
	oFF.PlanningModelRequestType.SET_PARAMETERS = oFF.PlanningModelRequestType.createWithParent("set_parameters", oFF.PlanningModelRequestType.VERSION_REQUEST_WITH_STATE_UPDATE, true);
	oFF.PlanningModelRequestType.BACKUP_VERSION = oFF.PlanningModelRequestType.createWithParent("backup", oFF.PlanningModelRequestType.VERSION_REQUEST_WITH_STATE_UPDATE, true);
	oFF.PlanningModelRequestType.CLOSE_VERSION = oFF.PlanningModelRequestType.createWithParent("close", oFF.PlanningModelRequestType.VERSION_REQUEST_WITH_STATE_UPDATE, true);
	oFF.PlanningModelRequestType.DROP_VERSION = oFF.PlanningModelRequestType.createWithParent("drop_version", oFF.PlanningModelRequestType.VERSION_REQUEST_WITH_STATE_UPDATE, true);
	oFF.PlanningModelRequestType.RESET_VERSION = oFF.PlanningModelRequestType.createWithParent("reset_version", oFF.PlanningModelRequestType.VERSION_REQUEST_WITH_STATE_UPDATE, true);
	oFF.PlanningModelRequestType.UNDO_VERSION = oFF.PlanningModelRequestType.createWithParent("undo", oFF.PlanningModelRequestType.VERSION_REQUEST_WITH_STATE_UPDATE, true);
	oFF.PlanningModelRequestType.REDO_VERSION = oFF.PlanningModelRequestType.createWithParent("redo", oFF.PlanningModelRequestType.VERSION_REQUEST_WITH_STATE_UPDATE, true);
	oFF.PlanningModelRequestType.SET_TIMEOUT = oFF.PlanningModelRequestType.createWithParent("set_timeout", oFF.PlanningModelRequestType.VERSION_REQUEST_WITH_STATE_UPDATE, false);
	oFF.PlanningModelRequestType.UPDATE_PARAMETERS = oFF.PlanningModelRequestType.createWithParent("update_parameters", oFF.PlanningModelRequestType.VERSION_REQUEST_WITH_STATE_UPDATE, true);
	oFF.PlanningModelRequestType.START_ACTION_SEQUENCE = oFF.PlanningModelRequestType.createWithParent("start_action_sequence", oFF.PlanningModelRequestType.VERSION_REQUEST_WITH_STATE_UPDATE, false);
	oFF.PlanningModelRequestType.END_ACTION_SEQUENCE = oFF.PlanningModelRequestType.createWithParent("end_action_sequence", oFF.PlanningModelRequestType.VERSION_REQUEST_WITH_STATE_UPDATE, true);
	oFF.PlanningModelRequestType.KILL_ACTION_SEQUENCE = oFF.PlanningModelRequestType.createWithParent("kill_action_sequence", oFF.PlanningModelRequestType.VERSION_REQUEST_WITH_STATE_UPDATE, true);
	oFF.PlanningModelRequestType.GET_VERSION_STATE_DESCRIPTIONS = oFF.PlanningModelRequestType.createWithParent("get_version_state_descriptions", oFF.PlanningModelRequestType.VERSION_REQUEST, false);
};
oFF.PlanningModelRequestType.create = function(name, isInvalidatingResultSet)
{
	return oFF.PlanningModelRequestType.createWithParent(name, null, isInvalidatingResultSet);
};
oFF.PlanningModelRequestType.createWithParent = function(name, parentType, isInvalidatingResultSet)
{
	var object = new oFF.PlanningModelRequestType();
	object.setupExt(name, parentType);
	object.setInvalidatingResultSet(isInvalidatingResultSet);
	return object;
};
oFF.PlanningModelRequestType.prototype.m_isInvalidatingResultSet = false;
oFF.PlanningModelRequestType.prototype.isInvalidatingResultSet = function()
{
	return this.m_isInvalidatingResultSet;
};
oFF.PlanningModelRequestType.prototype.setInvalidatingResultSet = function(isInvalidatingResultSet)
{
	this.m_isInvalidatingResultSet = isInvalidatingResultSet;
};

oFF.QueryManagerMode = function() {};
oFF.QueryManagerMode.prototype = new oFF.XConstantWithParent();
oFF.QueryManagerMode.prototype._ff_c = "QueryManagerMode";

oFF.QueryManagerMode.DEFAULT = null;
oFF.QueryManagerMode.RAW_QUERY = null;
oFF.QueryManagerMode.BLENDING = null;
oFF.QueryManagerMode.staticSetup = function()
{
	oFF.QueryManagerMode.DEFAULT = oFF.QueryManagerMode.create("Default", null);
	oFF.QueryManagerMode.RAW_QUERY = oFF.QueryManagerMode.create("RawQuery", null);
	oFF.QueryManagerMode.BLENDING = oFF.QueryManagerMode.create("Blending", null);
};
oFF.QueryManagerMode.create = function(name, parent)
{
	var mode = oFF.XConstant.setupName(new oFF.QueryManagerMode(), name);
	mode.setParent(parent);
	return mode;
};

oFF.FioriCellType = function() {};
oFF.FioriCellType.prototype = new oFF.XConstantWithParent();
oFF.FioriCellType.prototype._ff_c = "FioriCellType";

oFF.FioriCellType.CELL = null;
oFF.FioriCellType.REAL_CELL = null;
oFF.FioriCellType.ANCHOR_CELL = null;
oFF.FioriCellType.CONTENT = null;
oFF.FioriCellType.SELECT = null;
oFF.FioriCellType.HEAD_AREA = null;
oFF.FioriCellType.TITLE = null;
oFF.FioriCellType.TWIN = null;
oFF.FioriCellType.HEADER = null;
oFF.FioriCellType.HIERARCHY = null;
oFF.FioriCellType.SCALING = null;
oFF.FioriCellType.SELECT_ROWS = null;
oFF.FioriCellType.SELECT_COLUMNS = null;
oFF.FioriCellType.DATA = null;
oFF.FioriCellType.staticSetup = function()
{
	oFF.FioriCellType.CELL = oFF.FioriCellType.create("CELL", null);
	oFF.FioriCellType.REAL_CELL = oFF.FioriCellType.create("REAL_CELL", oFF.FioriCellType.CELL);
	oFF.FioriCellType.ANCHOR_CELL = oFF.FioriCellType.create("ANCHOR_CELL", oFF.FioriCellType.CELL);
	oFF.FioriCellType.CONTENT = oFF.FioriCellType.create("CONTENT", oFF.FioriCellType.REAL_CELL);
	oFF.FioriCellType.SELECT = oFF.FioriCellType.create("SELECT", oFF.FioriCellType.REAL_CELL);
	oFF.FioriCellType.HEAD_AREA = oFF.FioriCellType.create("HEAD_AREA", oFF.FioriCellType.CONTENT);
	oFF.FioriCellType.TITLE = oFF.FioriCellType.create("TITLE", oFF.FioriCellType.HEAD_AREA);
	oFF.FioriCellType.TWIN = oFF.FioriCellType.create("TWIN", oFF.FioriCellType.TITLE);
	oFF.FioriCellType.HEADER = oFF.FioriCellType.create("HEADER", oFF.FioriCellType.HEAD_AREA);
	oFF.FioriCellType.HIERARCHY = oFF.FioriCellType.create("HIERARCHY", oFF.FioriCellType.HEADER);
	oFF.FioriCellType.SCALING = oFF.FioriCellType.create("SCALING", oFF.FioriCellType.HEADER);
	oFF.FioriCellType.SELECT_ROWS = oFF.FioriCellType.create("SELECT_ROWS", oFF.FioriCellType.SELECT);
	oFF.FioriCellType.SELECT_COLUMNS = oFF.FioriCellType.create("SELECT_COLUMNS", oFF.FioriCellType.SELECT);
	oFF.FioriCellType.DATA = oFF.FioriCellType.create("DATA", oFF.FioriCellType.CONTENT);
};
oFF.FioriCellType.create = function(name, parent)
{
	var object = new oFF.FioriCellType();
	object.setupExt(name, parent);
	return object;
};

oFF.VariableProcessorState = function() {};
oFF.VariableProcessorState.prototype = new oFF.XConstantWithParent();
oFF.VariableProcessorState.prototype._ff_c = "VariableProcessorState";

oFF.VariableProcessorState.INITIAL = null;
oFF.VariableProcessorState.MIXED = null;
oFF.VariableProcessorState.CHANGEABLE = null;
oFF.VariableProcessorState.CHANGEABLE_DIRECT_VALUE_TRANSFER = null;
oFF.VariableProcessorState.CHANGEABLE_STATEFUL = null;
oFF.VariableProcessorState.CHANGEABLE_STARTUP = null;
oFF.VariableProcessorState.CHANGEABLE_REINIT = null;
oFF.VariableProcessorState.SUBMITTED = null;
oFF.VariableProcessorState.SUBMIT_FAILED = null;
oFF.VariableProcessorState.VALUE_HELP = null;
oFF.VariableProcessorState.PROCESSING = null;
oFF.VariableProcessorState.PROCESSING_DEFINITION = null;
oFF.VariableProcessorState.PROCESSING_UPDATE_VALUES = null;
oFF.VariableProcessorState.PROCESSING_UPDATE_DYNAMIC_VALUES = null;
oFF.VariableProcessorState.PROCESSING_CHECK = null;
oFF.VariableProcessorState.PROCESSING_SUBMIT = null;
oFF.VariableProcessorState.PROCESSING_AUTO_SUBMIT = null;
oFF.VariableProcessorState.PROCESSING_AUTO_SUBMIT_AFTER_REINIT = null;
oFF.VariableProcessorState.PROCESSING_SUBMIT_AFTER_REINIT = null;
oFF.VariableProcessorState.PROCESSING_CANCEL = null;
oFF.VariableProcessorState.PROCESSING_REINIT = null;
oFF.VariableProcessorState.PROCESSING_EMPTY_VARIABLE_DEFINITION = null;
oFF.VariableProcessorState.PROCESSING_VARIANT_ACTIVATION = null;
oFF.VariableProcessorState.PROCESSING_VARIANT_DELETION = null;
oFF.VariableProcessorState.PROCESSING_VARIANT_SAVE = null;
oFF.VariableProcessorState.staticSetup = function()
{
	oFF.VariableProcessorState.INITIAL = oFF.VariableProcessorState.create("Initial", null, null);
	oFF.VariableProcessorState.MIXED = oFF.VariableProcessorState.create("Mixed", null, null);
	oFF.VariableProcessorState.CHANGEABLE = oFF.VariableProcessorState.create("Changeable", null, null);
	oFF.VariableProcessorState.CHANGEABLE_DIRECT_VALUE_TRANSFER = oFF.VariableProcessorState.create("ChangeableDirectValueTransfer", oFF.VariableProcessorState.CHANGEABLE, null);
	oFF.VariableProcessorState.CHANGEABLE_STATEFUL = oFF.VariableProcessorState.create("ChangeableStateful", oFF.VariableProcessorState.CHANGEABLE, null);
	oFF.VariableProcessorState.CHANGEABLE_STARTUP = oFF.VariableProcessorState.create("ChangeableStartup", oFF.VariableProcessorState.CHANGEABLE_STATEFUL, null);
	oFF.VariableProcessorState.CHANGEABLE_REINIT = oFF.VariableProcessorState.create("ChangeableReinit", oFF.VariableProcessorState.CHANGEABLE_STATEFUL, null);
	oFF.VariableProcessorState.SUBMITTED = oFF.VariableProcessorState.create("Submitted", null, null);
	oFF.VariableProcessorState.SUBMIT_FAILED = oFF.VariableProcessorState.create("SubmitFailed", oFF.VariableProcessorState.CHANGEABLE_STATEFUL, null);
	oFF.VariableProcessorState.VALUE_HELP = oFF.VariableProcessorState.create("ValueHelp", oFF.VariableProcessorState.SUBMITTED, null);
	oFF.VariableProcessorState.PROCESSING = oFF.VariableProcessorState.create("Processing", null, null);
	oFF.VariableProcessorState.PROCESSING_DEFINITION = oFF.VariableProcessorState.create("ProcessingDefinition", oFF.VariableProcessorState.PROCESSING, oFF.VariableProcessorState.CHANGEABLE_STARTUP);
	oFF.VariableProcessorState.PROCESSING_SUBMIT = oFF.VariableProcessorState.create("ProcessingSubmit", oFF.VariableProcessorState.PROCESSING, oFF.VariableProcessorState.SUBMITTED);
	oFF.VariableProcessorState.PROCESSING_AUTO_SUBMIT = oFF.VariableProcessorState.create("ProcessingAutoSubmit", oFF.VariableProcessorState.PROCESSING_SUBMIT, oFF.VariableProcessorState.SUBMITTED);
	oFF.VariableProcessorState.PROCESSING_AUTO_SUBMIT_AFTER_REINIT = oFF.VariableProcessorState.create("ProcessingAutoSubmitAfterReinit", oFF.VariableProcessorState.PROCESSING_SUBMIT, oFF.VariableProcessorState.SUBMITTED);
	oFF.VariableProcessorState.PROCESSING_SUBMIT_AFTER_REINIT = oFF.VariableProcessorState.create("ProcessingSubmitAfterReinit", oFF.VariableProcessorState.PROCESSING_SUBMIT, oFF.VariableProcessorState.SUBMITTED);
	oFF.VariableProcessorState.PROCESSING_CANCEL = oFF.VariableProcessorState.create("ProcessingCancel", oFF.VariableProcessorState.PROCESSING, oFF.VariableProcessorState.SUBMITTED);
	oFF.VariableProcessorState.PROCESSING_REINIT = oFF.VariableProcessorState.create("ProcessingReinit", oFF.VariableProcessorState.PROCESSING, oFF.VariableProcessorState.CHANGEABLE_REINIT);
	oFF.VariableProcessorState.PROCESSING_UPDATE_VALUES = oFF.VariableProcessorState.create("ProcessingUpdateValues", oFF.VariableProcessorState.PROCESSING, null);
	oFF.VariableProcessorState.PROCESSING_UPDATE_DYNAMIC_VALUES = oFF.VariableProcessorState.create("ProcessingUpdateDynamicValues", oFF.VariableProcessorState.PROCESSING, null);
	oFF.VariableProcessorState.PROCESSING_CHECK = oFF.VariableProcessorState.create("ProcessingCheck", oFF.VariableProcessorState.PROCESSING, null);
	oFF.VariableProcessorState.PROCESSING_EMPTY_VARIABLE_DEFINITION = oFF.VariableProcessorState.create("ProcessingEmptyVariableDefinition", oFF.VariableProcessorState.PROCESSING, null);
	oFF.VariableProcessorState.PROCESSING_VARIANT_ACTIVATION = oFF.VariableProcessorState.create("ProcessingVariantActivation", oFF.VariableProcessorState.PROCESSING, null);
	oFF.VariableProcessorState.PROCESSING_VARIANT_DELETION = oFF.VariableProcessorState.create("ProcessingVariantDeletion", oFF.VariableProcessorState.PROCESSING, null);
	oFF.VariableProcessorState.PROCESSING_VARIANT_SAVE = oFF.VariableProcessorState.create("ProcessingVariantSave", oFF.VariableProcessorState.PROCESSING, null);
};
oFF.VariableProcessorState.create = function(name, parent, nextState)
{
	var newConstant = new oFF.VariableProcessorState();
	newConstant.setupExt(name, parent);
	newConstant.m_nextState = nextState;
	return newConstant;
};
oFF.VariableProcessorState.prototype.m_nextState = null;
oFF.VariableProcessorState.prototype.getNextState = function()
{
	return this.m_nextState;
};
oFF.VariableProcessorState.prototype.isSubmitNeeded = function()
{
	return this.isTypeOf(oFF.VariableProcessorState.CHANGEABLE_STATEFUL) || this === oFF.VariableProcessorState.PROCESSING_EMPTY_VARIABLE_DEFINITION;
};
oFF.VariableProcessorState.prototype.isReinitNeeded = function()
{
	return this === oFF.VariableProcessorState.SUBMITTED;
};
oFF.VariableProcessorState.prototype.isCancelNeeded = function()
{
	return this === oFF.VariableProcessorState.CHANGEABLE_REINIT;
};

oFF.AssignOperator = function() {};
oFF.AssignOperator.prototype = new oFF.Operator();
oFF.AssignOperator.prototype._ff_c = "AssignOperator";

oFF.AssignOperator.ASSIGN = null;
oFF.AssignOperator.ASSIGN_DEF = null;
oFF.AssignOperator.ASSIGN_PROP = null;
oFF.AssignOperator.staticSetupAssignOps = function()
{
	oFF.AssignOperator.ASSIGN_PROP = oFF.AssignOperator.createAssign("AssignProp", "=>", oFF.Operator.GRAVITY_3);
	oFF.AssignOperator.ASSIGN_DEF = oFF.AssignOperator.createAssign("AssignDef", "=:", oFF.Operator.GRAVITY_9);
	oFF.AssignOperator.ASSIGN = oFF.AssignOperator.createAssign("Assign", "=", oFF.Operator.GRAVITY_9);
};
oFF.AssignOperator.createAssign = function(name, displayString, gravity)
{
	var newConstant = new oFF.AssignOperator();
	newConstant.setupOperator(oFF.Operator._MATH, name, displayString, 0, gravity, true);
	return newConstant;
};

oFF.ComparisonOperator = function() {};
oFF.ComparisonOperator.prototype = new oFF.Operator();
oFF.ComparisonOperator.prototype._ff_c = "ComparisonOperator";

oFF.ComparisonOperator.UNDEFINED = null;
oFF.ComparisonOperator.IS_NULL = null;
oFF.ComparisonOperator.LIKE = null;
oFF.ComparisonOperator.MATCH = null;
oFF.ComparisonOperator.NOT_MATCH = null;
oFF.ComparisonOperator.EQUAL = null;
oFF.ComparisonOperator.NOT_EQUAL = null;
oFF.ComparisonOperator.GREATER_THAN = null;
oFF.ComparisonOperator.GREATER_EQUAL = null;
oFF.ComparisonOperator.LESS_THAN = null;
oFF.ComparisonOperator.LESS_EQUAL = null;
oFF.ComparisonOperator.BETWEEN = null;
oFF.ComparisonOperator.NOT_BETWEEN = null;
oFF.ComparisonOperator.BETWEEN_EXCLUDING = null;
oFF.ComparisonOperator.NOT_BETWEEN_EXCLUDING = null;
oFF.ComparisonOperator.FUZZY = null;
oFF.ComparisonOperator.SEARCH = null;
oFF.ComparisonOperator.IN = null;
oFF.ComparisonOperator.ALL = null;
oFF.ComparisonOperator.AGGREGATED = null;
oFF.ComparisonOperator.NON_AGGREGATED = null;
oFF.ComparisonOperator.LEVEL = null;
oFF.ComparisonOperator.s_lookup = null;
oFF.ComparisonOperator.staticSetupComparisonOps = function()
{
	oFF.ComparisonOperator.s_lookup = oFF.XHashMapByString.create();
	oFF.ComparisonOperator.UNDEFINED = oFF.ComparisonOperator.createComparison("UNDEFINED", "?", 0);
	oFF.ComparisonOperator.IS_NULL = oFF.ComparisonOperator.createComparison("IS_NULL", "IS_NULL", 0);
	oFF.ComparisonOperator.EQUAL = oFF.ComparisonOperator.createComparison("EQUAL", "==", 1);
	oFF.ComparisonOperator.NOT_EQUAL = oFF.ComparisonOperator.createComparison("NOT_EQUAL", "!=", 1);
	oFF.ComparisonOperator.GREATER_THAN = oFF.ComparisonOperator.createComparison("GREATER_THAN", ">", 1);
	oFF.ComparisonOperator.GREATER_EQUAL = oFF.ComparisonOperator.createComparison("GREATER_EQUAL", ">=", 1);
	oFF.ComparisonOperator.LESS_THAN = oFF.ComparisonOperator.createComparison("LESS_THAN", "<", 1);
	oFF.ComparisonOperator.LESS_EQUAL = oFF.ComparisonOperator.createComparison("LESS_EQUAL", "<=", 1);
	oFF.ComparisonOperator.LIKE = oFF.ComparisonOperator.createComparison("LIKE", "like", 1);
	oFF.ComparisonOperator.MATCH = oFF.ComparisonOperator.createComparison("MATCH", "match", 1);
	oFF.ComparisonOperator.NOT_MATCH = oFF.ComparisonOperator.createComparison("NOT_MATCH", "notMatch", 1);
	oFF.ComparisonOperator.BETWEEN = oFF.ComparisonOperator.createComparison("BETWEEN", "between", 2);
	oFF.ComparisonOperator.NOT_BETWEEN = oFF.ComparisonOperator.createComparison("NOT_BETWEEN", "notBetween", 2);
	oFF.ComparisonOperator.BETWEEN_EXCLUDING = oFF.ComparisonOperator.createComparison("BETWEEN_EXCLUDING", "betweenExcluding", 2);
	oFF.ComparisonOperator.NOT_BETWEEN_EXCLUDING = oFF.ComparisonOperator.createComparison("NOT_BETWEEN_EXCLUDING", "notBetweenExcluding", 2);
	oFF.ComparisonOperator.FUZZY = oFF.ComparisonOperator.createComparison("FUZZY", "fuzzy", 2);
	oFF.ComparisonOperator.SEARCH = oFF.ComparisonOperator.createComparison("SEARCH", "search", 1);
	oFF.ComparisonOperator.IN = oFF.ComparisonOperator.createComparison("IN", "in", 1);
	oFF.ComparisonOperator.ALL = oFF.ComparisonOperator.createComparison("ALL", "all", 0);
	oFF.ComparisonOperator.AGGREGATED = oFF.ComparisonOperator.createComparison("AGGREGATED", "aggregated", 0);
	oFF.ComparisonOperator.NON_AGGREGATED = oFF.ComparisonOperator.createComparison("NON-AGGREGATED", "NON-AGGREGATED", 0);
	oFF.ComparisonOperator.LEVEL = oFF.ComparisonOperator.createComparison("LEVEL", "level", 0);
};
oFF.ComparisonOperator.createComparison = function(name, displayString, numberOfParameters)
{
	var newConstant = new oFF.ComparisonOperator();
	newConstant.setupOperator(oFF.Operator._COMPARISON, name, displayString, numberOfParameters, oFF.Operator.GRAVITY_3, true);
	oFF.ComparisonOperator.s_lookup.put(name, newConstant);
	return newConstant;
};
oFF.ComparisonOperator.lookup = function(name)
{
	return oFF.ComparisonOperator.s_lookup.getByKey(name);
};
oFF.ComparisonOperator.prototype.isRange = function()
{
	return this === oFF.ComparisonOperator.GREATER_THAN || this === oFF.ComparisonOperator.GREATER_EQUAL || this === oFF.ComparisonOperator.LESS_THAN || this === oFF.ComparisonOperator.LESS_EQUAL || this === oFF.ComparisonOperator.BETWEEN || this === oFF.ComparisonOperator.NOT_BETWEEN || this === oFF.ComparisonOperator.BETWEEN_EXCLUDING || this === oFF.ComparisonOperator.NOT_BETWEEN_EXCLUDING;
};

oFF.ConditionComparisonOperator = function() {};
oFF.ConditionComparisonOperator.prototype = new oFF.Operator();
oFF.ConditionComparisonOperator.prototype._ff_c = "ConditionComparisonOperator";

oFF.ConditionComparisonOperator.EQUAL = null;
oFF.ConditionComparisonOperator.NOT_EQUAL = null;
oFF.ConditionComparisonOperator.GREATER_THAN = null;
oFF.ConditionComparisonOperator.GREATER_EQUAL = null;
oFF.ConditionComparisonOperator.LESS_THAN = null;
oFF.ConditionComparisonOperator.LESS_EQUAL = null;
oFF.ConditionComparisonOperator.BETWEEN = null;
oFF.ConditionComparisonOperator.NOT_BETWEEN = null;
oFF.ConditionComparisonOperator.TOP_N = null;
oFF.ConditionComparisonOperator.BOTTOM_N = null;
oFF.ConditionComparisonOperator.TOP_PERCENT = null;
oFF.ConditionComparisonOperator.BOTTOM_PERCENT = null;
oFF.ConditionComparisonOperator.TOP_SUM = null;
oFF.ConditionComparisonOperator.BOTTOM_SUM = null;
oFF.ConditionComparisonOperator.s_tConstants = null;
oFF.ConditionComparisonOperator.s_lookupNames = null;
oFF.ConditionComparisonOperator.staticSetupComparisonOps = function()
{
	oFF.ConditionComparisonOperator.s_lookupNames = oFF.XHashMapByString.create();
	oFF.ConditionComparisonOperator.s_tConstants = oFF.XHashMapByString.create();
	oFF.ConditionComparisonOperator.EQUAL = oFF.ConditionComparisonOperator.createComparison("=", "==", 1);
	oFF.ConditionComparisonOperator.NOT_EQUAL = oFF.ConditionComparisonOperator.createComparison("<>", "<>", 1);
	oFF.ConditionComparisonOperator.GREATER_THAN = oFF.ConditionComparisonOperator.createComparison(">", ">", 1);
	oFF.ConditionComparisonOperator.GREATER_EQUAL = oFF.ConditionComparisonOperator.createComparison(">=", ">=", 1);
	oFF.ConditionComparisonOperator.LESS_THAN = oFF.ConditionComparisonOperator.createComparison("<", "<", 1);
	oFF.ConditionComparisonOperator.LESS_EQUAL = oFF.ConditionComparisonOperator.createComparison("<=", "<=", 1);
	oFF.ConditionComparisonOperator.BETWEEN = oFF.ConditionComparisonOperator.createComparison("BETWEEN", "BETWEEN", 2);
	oFF.ConditionComparisonOperator.NOT_BETWEEN = oFF.ConditionComparisonOperator.createComparison("NOTBETWEEN", "NOTBETWEEN", 2);
	oFF.ConditionComparisonOperator.TOP_N = oFF.ConditionComparisonOperator.createComparison("TOP_N", "TOP_N", 2);
	oFF.ConditionComparisonOperator.BOTTOM_N = oFF.ConditionComparisonOperator.createComparison("BOTTOM_N", "BOTTOM_N", 2);
	oFF.ConditionComparisonOperator.TOP_PERCENT = oFF.ConditionComparisonOperator.createComparison("TOP_PERCENT", "TOP_PERCENT", 1);
	oFF.ConditionComparisonOperator.BOTTOM_PERCENT = oFF.ConditionComparisonOperator.createComparison("BOTTOM_PERCENT", "BOTTOM_PERCENT", 1);
	oFF.ConditionComparisonOperator.TOP_SUM = oFF.ConditionComparisonOperator.createComparison("TOP_SUM", "TOP_SUM", 1);
	oFF.ConditionComparisonOperator.BOTTOM_SUM = oFF.ConditionComparisonOperator.createComparison("BOTTOM_SUM", "BOTTOM_SUM", 1);
};
oFF.ConditionComparisonOperator.createComparison = function(name, displayString, numberOfParameters)
{
	var newConstant = new oFF.ConditionComparisonOperator();
	newConstant.setupOperator(oFF.Operator._COMPARISON, name, displayString, numberOfParameters, oFF.Operator.GRAVITY_3, true);
	oFF.ConditionComparisonOperator.s_lookupNames.put(displayString, newConstant);
	oFF.ConditionComparisonOperator.s_tConstants.put(name, newConstant);
	return newConstant;
};
oFF.ConditionComparisonOperator.sLookupName = function(name)
{
	return oFF.ConditionComparisonOperator.s_tConstants.getByKey(name);
};
oFF.ConditionComparisonOperator.lookupName = function(name)
{
	return oFF.ConditionComparisonOperator.s_lookupNames.getByKey(name);
};

oFF.LogicalBoolOperator = function() {};
oFF.LogicalBoolOperator.prototype = new oFF.Operator();
oFF.LogicalBoolOperator.prototype._ff_c = "LogicalBoolOperator";

oFF.LogicalBoolOperator.AND = null;
oFF.LogicalBoolOperator.OR = null;
oFF.LogicalBoolOperator.NOT = null;
oFF.LogicalBoolOperator.staticSetupLogicalOps = function()
{
	oFF.LogicalBoolOperator.AND = oFF.LogicalBoolOperator.create("AND", "&&", 2, oFF.Operator.GRAVITY_6);
	oFF.LogicalBoolOperator.OR = oFF.LogicalBoolOperator.create("OR", "||", 2, oFF.Operator.GRAVITY_5);
	oFF.LogicalBoolOperator.NOT = oFF.LogicalBoolOperator.create("NOT", "!", 1, oFF.Operator.GRAVITY_5);
};
oFF.LogicalBoolOperator.create = function(name, displayString, numberOfParameters, gravity)
{
	var newConstant = new oFF.LogicalBoolOperator();
	newConstant.setupOperator(oFF.Operator._LOGICAL, name, displayString, numberOfParameters, gravity, false);
	return newConstant;
};

oFF.MathOperator = function() {};
oFF.MathOperator.prototype = new oFF.Operator();
oFF.MathOperator.prototype._ff_c = "MathOperator";

oFF.MathOperator.MULT = null;
oFF.MathOperator.DIV = null;
oFF.MathOperator.PLUS = null;
oFF.MathOperator.MINUS = null;
oFF.MathOperator.MODULO = null;
oFF.MathOperator.POWER = null;
oFF.MathOperator.staticSetupMathOps = function()
{
	oFF.MathOperator.MULT = oFF.MathOperator.create("Mult", "*", oFF.Operator.GRAVITY_1);
	oFF.MathOperator.DIV = oFF.MathOperator.create("Div", "/", oFF.Operator.GRAVITY_1);
	oFF.MathOperator.PLUS = oFF.MathOperator.create("Plus", "+", oFF.Operator.GRAVITY_2);
	oFF.MathOperator.MINUS = oFF.MathOperator.create("Minus", "-", oFF.Operator.GRAVITY_2);
	oFF.MathOperator.POWER = oFF.MathOperator.create("Power", "**", oFF.Operator.GRAVITY_1);
};
oFF.MathOperator.create = function(name, displayString, gravity)
{
	var newConstant = new oFF.MathOperator();
	newConstant.setupOperator(oFF.Operator._MATH, name, displayString, 0, gravity, true);
	return newConstant;
};

oFF.OlapComponentType = function() {};
oFF.OlapComponentType.prototype = new oFF.XComponentType();
oFF.OlapComponentType.prototype._ff_c = "OlapComponentType";

oFF.OlapComponentType.OLAP_ENVIRONMENT = null;
oFF.OlapComponentType.OLAP_FILTER_MANAGER = null;
oFF.OlapComponentType.GEO_MANAGER = null;
oFF.OlapComponentType.QUERY_SERVICE_CONFIG = null;
oFF.OlapComponentType.CHART_DATA_PROVIDER = null;
oFF.OlapComponentType.CONVENIENCE_CMDS = null;
oFF.OlapComponentType.OLAP = null;
oFF.OlapComponentType.QUERY_MANAGER = null;
oFF.OlapComponentType.DATA_SOURCE = null;
oFF.OlapComponentType.DOCUMENTS_INFO = null;
oFF.OlapComponentType.SELECTOR = null;
oFF.OlapComponentType.ATTRIBUTE_CONTAINER = null;
oFF.OlapComponentType.ATTRIBUTE = null;
oFF.OlapComponentType.FILTER_EXPRESSION = null;
oFF.OlapComponentType.FILTER_LITERAL = null;
oFF.OlapComponentType.FILTER_FIXED = null;
oFF.OlapComponentType.FILTER_DYNAMIC = null;
oFF.OlapComponentType.FILTER_VISIBILITY = null;
oFF.OlapComponentType.FILTER_ELEMENT = null;
oFF.OlapComponentType.FILTER_CELL_VALUE_OPERAND = null;
oFF.OlapComponentType.KEY_REF_STORE_CONTEXT = null;
oFF.OlapComponentType.QUERY_CONTEXT = null;
oFF.OlapComponentType.DIMENSION_CONTEXT = null;
oFF.OlapComponentType.DIMENSIONS = null;
oFF.OlapComponentType.MODELLER_CURRENCY_TRANSLATION = null;
oFF.OlapComponentType.MODELLER_DIMENSIONS = null;
oFF.OlapComponentType.MODELLER_METADATA_PROPERTIES = null;
oFF.OlapComponentType.MODELLER_VARIABLES = null;
oFF.OlapComponentType.EXCEPTION_MANAGER = null;
oFF.OlapComponentType.FORMULA_EXCEPTION_MANAGER = null;
oFF.OlapComponentType.FORMULA_EXCEPTION = null;
oFF.OlapComponentType.QUERY_MODEL = null;
oFF.OlapComponentType.AXES_MANAGER = null;
oFF.OlapComponentType.QUERY_SETTINGS = null;
oFF.OlapComponentType.HIERARCHY = null;
oFF.OlapComponentType.HIERARCHY_MANAGER = null;
oFF.OlapComponentType.CUSTOM_HIERARCHY_REPOSITORY = null;
oFF.OlapComponentType.CUSTOM_HIERARCHY_DEFINITION = null;
oFF.OlapComponentType.DIMENSION_MANAGER = null;
oFF.OlapComponentType.DRILL_MANAGER = null;
oFF.OlapComponentType.CELL_CONTEXT_MANAGER = null;
oFF.OlapComponentType.CELL_CONTEXT = null;
oFF.OlapComponentType.CURRENCY_TRANSLATION_MANAGER = null;
oFF.OlapComponentType.CURRENCY_TRANSLATION_LIST = null;
oFF.OlapComponentType.CURRENCY_TRANSLATION_ITEM = null;
oFF.OlapComponentType.MEASURE_TRANSLATIONS = null;
oFF.OlapComponentType.DRILL_OPERATION = null;
oFF.OlapComponentType.SORT_MANAGER = null;
oFF.OlapComponentType.VIZ_MANAGER = null;
oFF.OlapComponentType.COMPONENT_LIST = null;
oFF.OlapComponentType.AXIS = null;
oFF.OlapComponentType.AXES_SETTINGS = null;
oFF.OlapComponentType.FIELD_CONTAINER = null;
oFF.OlapComponentType.FIELD_LIST = null;
oFF.OlapComponentType.FIELD = null;
oFF.OlapComponentType.PROPERTY = null;
oFF.OlapComponentType.VARIABLE_CONTEXT = null;
oFF.OlapComponentType.VARIABLE_CONTAINER = null;
oFF.OlapComponentType.VARIABLE_LIST = null;
oFF.OlapComponentType.VISUALIZATION_AXIS = null;
oFF.OlapComponentType.VISUALIZATION_CATEGORY = null;
oFF.OlapComponentType.VISUALIZATION_AXIS_MEMBER_SELECTION = null;
oFF.OlapComponentType.VISUALIZATION_CHART_SETTING = null;
oFF.OlapComponentType.VISUALIZATION_VALUE = null;
oFF.OlapComponentType.VISUALIZATION_DEFINITION = null;
oFF.OlapComponentType.VISUALIZATION_TABLE_DEFINITION = null;
oFF.OlapComponentType.VISUALIZATION_CHART_DEFINITION = null;
oFF.OlapComponentType.VISUALIZATION_CUSTOM_DEFINITION = null;
oFF.OlapComponentType.VISUALIZATION_MANAGER = null;
oFF.OlapComponentType.VISUALIZATION_CELL_REFERENCE_SCOPE = null;
oFF.OlapComponentType.FORMULA_ITERATOR = null;
oFF.OlapComponentType.FORMULA_ITERATION_DIMENSION = null;
oFF.OlapComponentType.FORMULA_CONSTANT = null;
oFF.OlapComponentType.FORMULA_ITEM_MEMBER = null;
oFF.OlapComponentType.FORMULA_ITEM_ATTRIBUTE = null;
oFF.OlapComponentType.FORMULA_OPERATION = null;
oFF.OlapComponentType.FORMULA_FUNCTION = null;
oFF.OlapComponentType.PLANNING_X_COMMAND = null;
oFF.OlapComponentType.PLANNING_MODEL = null;
oFF.OlapComponentType.PLANNING_ACTION = null;
oFF.OlapComponentType.PLANNING_MODEL_COMMAND = null;
oFF.OlapComponentType.PLANNING_MODEL_CLOSE_COMMAND = null;
oFF.OlapComponentType.PLANNING_MODEL_CLEANUP_COMMAND = null;
oFF.OlapComponentType.PLANNING_MODEL_REFRESH_ACTIONS_COMMAND = null;
oFF.OlapComponentType.PLANNING_MODEL_REFRESH_VERSIONS_COMMAND = null;
oFF.OlapComponentType.PLANNING_MODEL_UPDATE_VERSION_PRIVILEGES_COMMAND = null;
oFF.OlapComponentType.PLANNING_VERSION_COMMAND = null;
oFF.OlapComponentType.PLANNING_VERSION_INIT_COMMAND = null;
oFF.OlapComponentType.PLANNING_VERSION_CLOSE_COMMAND = null;
oFF.OlapComponentType.PLANNING_VERSION_START_ACTION_SEQUENCE_COMMAND = null;
oFF.OlapComponentType.PLANNING_VERSION_END_ACTION_SEQUENCE_COMMAND = null;
oFF.OlapComponentType.PLANNING_VERSION_SET_PARAMETERS_COMMAND = null;
oFF.OlapComponentType.PLANNING_VERSION_SET_TIMEOUT_COMMAND = null;
oFF.OlapComponentType.PLANNING_VERSION_STATE_DESCRIPTIONS_COMMAND = null;
oFF.OlapComponentType.PLANNING_VERSION_UNDO_REDO_COMMAND = null;
oFF.OlapComponentType.DATA_AREA_GET_FUNCTION_METADATA = null;
oFF.OlapComponentType.DATA_AREA_GET_SEQUENCE_METADATA = null;
oFF.OlapComponentType.DATA_AREA_COMMAND = null;
oFF.OlapComponentType.LIGHTWEIGHT_DATA_AREA_COMMAND = null;
oFF.OlapComponentType.DATA_AREA_COMMAND_CLOSE = null;
oFF.OlapComponentType.GENERIC_SORTING = null;
oFF.OlapComponentType.DIMENSION_SORTING = null;
oFF.OlapComponentType.FIELD_SORTING = null;
oFF.OlapComponentType.DATA_CELL_SORTING = null;
oFF.OlapComponentType.COMPLEX_SORTING = null;
oFF.OlapComponentType.MEASURE_SORTING = null;
oFF.OlapComponentType.RESULT_STRUCTURE = null;
oFF.OlapComponentType.VARIABLE_MANAGER = null;
oFF.OlapComponentType.ABSTRACT_LAYER_MODEL = null;
oFF.OlapComponentType.LAYER_MODEL = null;
oFF.OlapComponentType.LAYER = null;
oFF.OlapComponentType.LAYER_SYNC_DEFINITION = null;
oFF.OlapComponentType.LAYER_REFERENCE_DEFINITION = null;
oFF.OlapComponentType.FILTER_CAPABILITY = null;
oFF.OlapComponentType.FILTER_CAPABILITY_GROUP = null;
oFF.OlapComponentType.CONDITIONS = null;
oFF.OlapComponentType.CONDITIONS_THRESHOLD = null;
oFF.OlapComponentType.CONDITIONS_MANAGER = null;
oFF.OlapComponentType.CONDITION = null;
oFF.OlapComponentType.DATA_CELL = null;
oFF.OlapComponentType.DATA_CELLS = null;
oFF.OlapComponentType.TOTALS = null;
oFF.OlapComponentType.MEMBERS = null;
oFF.OlapComponentType.ABSTRACT_DIMENSION = null;
oFF.OlapComponentType.ATTRIBUTE_LIST = null;
oFF.OlapComponentType.CATALOG_SPACE = null;
oFF.OlapComponentType.GROUP_BY_NODE = null;
oFF.OlapComponentType.CATALOG_TYPE = null;
oFF.OlapComponentType.CATALOG_SCHEMA = null;
oFF.OlapComponentType.CATALOG_PACKAGE = null;
oFF.OlapComponentType.CATALOG_OBJECT = null;
oFF.OlapComponentType.RD_DATA_CELL = null;
oFF.OlapComponentType.OLAP_METADATA_MODEL = null;
oFF.OlapComponentType.UNIVERSAL_DISPLAY_HIERARCHY = null;
oFF.OlapComponentType.UNIVERSAL_DISPLAY_HIERARCHIES = null;
oFF.OlapComponentType.EXCEPTION_AGGREGATION_MANAGER = null;
oFF.OlapComponentType.OLAP_CLIENT_QUERY_OBJECT_MANAGER = null;
oFF.OlapComponentType.QUERY_CELL = null;
oFF.OlapComponentType.QUERY_CELLS = null;
oFF.OlapComponentType.BLENDABLE_QUERY_MANAGER = null;
oFF.OlapComponentType.QUERYMODEL_LINK_SETTINGS = null;
oFF.OlapComponentType.BLENDED_FORMULA_MEASURE = null;
oFF.OlapComponentType.MODEL_DIMENSION_LINKS = null;
oFF.OlapComponentType.staticSetupOlapType = function()
{
	oFF.OlapComponentType.QUERY_SERVICE_CONFIG = oFF.OlapComponentType.createOlapType("QueryServiceConfig", oFF.IoComponentType.DATA_PROVIDER);
	oFF.OlapComponentType.CHART_DATA_PROVIDER = oFF.OlapComponentType.createOlapType("ChartDataProvider", oFF.IoComponentType.DATA_PROVIDER);
	oFF.OlapComponentType.CONVENIENCE_CMDS = oFF.OlapComponentType.createOlapType("OlapCmds", oFF.XComponentType._ROOT);
	oFF.OlapComponentType.OLAP = oFF.OlapComponentType.createOlapType("Olap", oFF.XComponentType._ROOT);
	oFF.OlapComponentType.OLAP_ENVIRONMENT = oFF.OlapComponentType.createOlapType("OlapEnvironment", oFF.OlapComponentType.OLAP);
	oFF.OlapComponentType.OLAP_FILTER_MANAGER = oFF.OlapComponentType.createOlapType("FilterManager", oFF.OlapComponentType.OLAP);
	oFF.OlapComponentType.GEO_MANAGER = oFF.OlapComponentType.createOlapType("GeoManager", oFF.OlapComponentType.OLAP);
	oFF.OlapComponentType.QUERY_MANAGER = oFF.OlapComponentType.createOlapType("QueryManager", oFF.OlapComponentType.OLAP);
	oFF.OlapComponentType.QUERY_CONTEXT = oFF.OlapComponentType.createOlapType("QueryContext", oFF.OlapComponentType.OLAP);
	oFF.OlapComponentType.COMPONENT_LIST = oFF.OlapComponentType.createOlapType("ComponentList", oFF.OlapComponentType.QUERY_CONTEXT);
	oFF.OlapComponentType.DATA_SOURCE = oFF.OlapComponentType.createOlapType("DataSource", oFF.OlapComponentType.OLAP);
	oFF.OlapComponentType.DOCUMENTS_INFO = oFF.OlapComponentType.createOlapType("DocumentsInfo", oFF.OlapComponentType.OLAP);
	oFF.OlapComponentType.SELECTOR = oFF.OlapComponentType.createOlapType("Selector", oFF.OlapComponentType.QUERY_CONTEXT);
	oFF.OlapComponentType.FILTER_EXPRESSION = oFF.OlapComponentType.createOlapType("FilterExpression", oFF.OlapComponentType.QUERY_CONTEXT);
	oFF.OlapComponentType.FILTER_LITERAL = oFF.OlapComponentType.createOlapType("FilterLiteral", oFF.OlapComponentType.QUERY_CONTEXT);
	oFF.OlapComponentType.FILTER_FIXED = oFF.OlapComponentType.createOlapType("FilterFixed", oFF.OlapComponentType.QUERY_CONTEXT);
	oFF.OlapComponentType.FILTER_DYNAMIC = oFF.OlapComponentType.createOlapType("FilterDynamic", oFF.OlapComponentType.QUERY_CONTEXT);
	oFF.OlapComponentType.FILTER_VISIBILITY = oFF.OlapComponentType.createOlapType("FilterVisibility", oFF.OlapComponentType.QUERY_CONTEXT);
	oFF.OlapComponentType.FILTER_ELEMENT = oFF.OlapComponentType.createOlapType("FilterElement", oFF.OlapComponentType.QUERY_CONTEXT);
	oFF.OlapComponentType.QUERY_MODEL = oFF.OlapComponentType.createOlapType("QueryModel", oFF.OlapComponentType.QUERY_CONTEXT);
	oFF.OlapComponentType.QUERY_SETTINGS = oFF.OlapComponentType.createOlapType("QuerySettings", oFF.OlapComponentType.QUERY_CONTEXT);
	oFF.OlapComponentType.DIMENSION_MANAGER = oFF.OlapComponentType.createOlapType("DimensionManager", oFF.OlapComponentType.COMPONENT_LIST);
	oFF.OlapComponentType.DRILL_MANAGER = oFF.OlapComponentType.createOlapType("DrillManager", oFF.OlapComponentType.QUERY_CONTEXT);
	oFF.OlapComponentType.DRILL_OPERATION = oFF.OlapComponentType.createOlapType("DrillOperation", oFF.OlapComponentType.QUERY_CONTEXT);
	oFF.OlapComponentType.CELL_CONTEXT_MANAGER = oFF.OlapComponentType.createOlapType("CellContextManager", oFF.OlapComponentType.QUERY_CONTEXT);
	oFF.OlapComponentType.CELL_CONTEXT = oFF.OlapComponentType.createOlapType("CellContext", oFF.OlapComponentType.QUERY_CONTEXT);
	oFF.OlapComponentType.MEASURE_TRANSLATIONS = oFF.OlapComponentType.createOlapType("MeasureTranslations", oFF.OlapComponentType.QUERY_CONTEXT);
	oFF.OlapComponentType.CURRENCY_TRANSLATION_MANAGER = oFF.OlapComponentType.createOlapType("CurrencyTranslationManager", oFF.OlapComponentType.QUERY_CONTEXT);
	oFF.OlapComponentType.CURRENCY_TRANSLATION_LIST = oFF.OlapComponentType.createOlapType("CurrencyTranslationList", oFF.OlapComponentType.QUERY_CONTEXT);
	oFF.OlapComponentType.CURRENCY_TRANSLATION_ITEM = oFF.OlapComponentType.createOlapType("CurrencyTranslationItem", oFF.OlapComponentType.QUERY_CONTEXT);
	oFF.OlapComponentType.AXES_MANAGER = oFF.OlapComponentType.createOlapType("AxesManager", oFF.OlapComponentType.QUERY_CONTEXT);
	oFF.OlapComponentType.AXIS = oFF.OlapComponentType.createOlapType("Axis", oFF.OlapComponentType.QUERY_CONTEXT);
	oFF.OlapComponentType.AXES_SETTINGS = oFF.OlapComponentType.createOlapType("AxesSettings", oFF.OlapComponentType.QUERY_CONTEXT);
	oFF.OlapComponentType.ATTRIBUTE_CONTAINER = oFF.OlapComponentType.createOlapType("AttributeContainer", oFF.OlapComponentType.QUERY_CONTEXT);
	oFF.OlapComponentType.ATTRIBUTE = oFF.OlapComponentType.createOlapType("Attribute", oFF.OlapComponentType.QUERY_CONTEXT);
	oFF.OlapComponentType.PLANNING_X_COMMAND = oFF.OlapComponentType.createOlapType("PlanningXCommand", oFF.OlapComponentType.OLAP);
	oFF.OlapComponentType.PLANNING_MODEL = oFF.OlapComponentType.createOlapType("PlanningModel", oFF.OlapComponentType.OLAP);
	oFF.OlapComponentType.PLANNING_ACTION = oFF.OlapComponentType.createOlapType("PlanningAction", oFF.OlapComponentType.OLAP);
	oFF.OlapComponentType.PLANNING_MODEL_COMMAND = oFF.OlapComponentType.createOlapType("PlanningModelCommand", oFF.OlapComponentType.OLAP);
	oFF.OlapComponentType.PLANNING_MODEL_CLOSE_COMMAND = oFF.OlapComponentType.createOlapType("PlanningModelCloseCommand", oFF.OlapComponentType.PLANNING_MODEL_COMMAND);
	oFF.OlapComponentType.PLANNING_MODEL_CLEANUP_COMMAND = oFF.OlapComponentType.createOlapType("PlanningModelCleanupCommand", oFF.OlapComponentType.PLANNING_MODEL_COMMAND);
	oFF.OlapComponentType.PLANNING_MODEL_REFRESH_ACTIONS_COMMAND = oFF.OlapComponentType.createOlapType("PlanningModelRefreshActionsCommand", oFF.OlapComponentType.PLANNING_MODEL_COMMAND);
	oFF.OlapComponentType.PLANNING_MODEL_REFRESH_VERSIONS_COMMAND = oFF.OlapComponentType.createOlapType("PlanningModelRefreshVersionsCommand", oFF.OlapComponentType.PLANNING_MODEL_COMMAND);
	oFF.OlapComponentType.PLANNING_MODEL_UPDATE_VERSION_PRIVILEGES_COMMAND = oFF.OlapComponentType.createOlapType("PlanningModelUpdateVersionPrivilegesCommand", oFF.OlapComponentType.PLANNING_MODEL_COMMAND);
	oFF.OlapComponentType.PLANNING_VERSION_COMMAND = oFF.OlapComponentType.createOlapType("PlanningVersionCommand", oFF.OlapComponentType.OLAP);
	oFF.OlapComponentType.PLANNING_VERSION_INIT_COMMAND = oFF.OlapComponentType.createOlapType("PlanningVersionInitCommand", oFF.OlapComponentType.PLANNING_VERSION_COMMAND);
	oFF.OlapComponentType.PLANNING_VERSION_CLOSE_COMMAND = oFF.OlapComponentType.createOlapType("PlanningVersionCloseCommand", oFF.OlapComponentType.PLANNING_VERSION_COMMAND);
	oFF.OlapComponentType.PLANNING_VERSION_START_ACTION_SEQUENCE_COMMAND = oFF.OlapComponentType.createOlapType("PlanningVersionStartActionSequenceCommand", oFF.OlapComponentType.PLANNING_VERSION_COMMAND);
	oFF.OlapComponentType.PLANNING_VERSION_END_ACTION_SEQUENCE_COMMAND = oFF.OlapComponentType.createOlapType("PlanningVersionEndActionSequenceCommand", oFF.OlapComponentType.PLANNING_VERSION_COMMAND);
	oFF.OlapComponentType.PLANNING_VERSION_SET_PARAMETERS_COMMAND = oFF.OlapComponentType.createOlapType("PlanningVersionSetParametersCommand", oFF.OlapComponentType.PLANNING_VERSION_COMMAND);
	oFF.OlapComponentType.PLANNING_VERSION_SET_TIMEOUT_COMMAND = oFF.OlapComponentType.createOlapType("PlanningVersionSetTimeoutCommand", oFF.OlapComponentType.PLANNING_VERSION_COMMAND);
	oFF.OlapComponentType.PLANNING_VERSION_STATE_DESCRIPTIONS_COMMAND = oFF.OlapComponentType.createOlapType("PlanningVersionStateDescriptionsCommand", oFF.OlapComponentType.PLANNING_VERSION_COMMAND);
	oFF.OlapComponentType.PLANNING_VERSION_UNDO_REDO_COMMAND = oFF.OlapComponentType.createOlapType("PlanningVersionUndoRedoCommand", oFF.OlapComponentType.PLANNING_VERSION_COMMAND);
	oFF.OlapComponentType.DATA_AREA_COMMAND = oFF.OlapComponentType.createOlapType("DataAreaCommand", oFF.OlapComponentType.OLAP);
	oFF.OlapComponentType.DATA_AREA_COMMAND_CLOSE = oFF.OlapComponentType.createOlapType("DataAreaCommandClose", oFF.OlapComponentType.DATA_AREA_COMMAND);
	oFF.OlapComponentType.DATA_AREA_GET_FUNCTION_METADATA = oFF.OlapComponentType.createOlapType("DataAreaGetFunctionMetadata", oFF.OlapComponentType.OLAP);
	oFF.OlapComponentType.DATA_AREA_GET_SEQUENCE_METADATA = oFF.OlapComponentType.createOlapType("DataAreaGetSequenceMetadata", oFF.OlapComponentType.OLAP);
	oFF.OlapComponentType.LIGHTWEIGHT_DATA_AREA_COMMAND = oFF.OlapComponentType.createOlapType("LightweightDataAreaCommand", oFF.OlapComponentType.DATA_AREA_COMMAND);
	oFF.OlapComponentType.GENERIC_SORTING = oFF.OlapComponentType.createOlapType("GenericSorting", oFF.OlapComponentType.QUERY_CONTEXT);
	oFF.OlapComponentType.DIMENSION_SORTING = oFF.OlapComponentType.createOlapType("DimensionSorting", oFF.OlapComponentType.GENERIC_SORTING);
	oFF.OlapComponentType.FIELD_SORTING = oFF.OlapComponentType.createOlapType("FieldSorting", oFF.OlapComponentType.GENERIC_SORTING);
	oFF.OlapComponentType.DATA_CELL_SORTING = oFF.OlapComponentType.createOlapType("DataCellSorting", oFF.OlapComponentType.GENERIC_SORTING);
	oFF.OlapComponentType.COMPLEX_SORTING = oFF.OlapComponentType.createOlapType("ComplexSorting", oFF.OlapComponentType.GENERIC_SORTING);
	oFF.OlapComponentType.MEASURE_SORTING = oFF.OlapComponentType.createOlapType("MeasureSorting", oFF.OlapComponentType.GENERIC_SORTING);
	oFF.OlapComponentType.RESULT_STRUCTURE = oFF.OlapComponentType.createOlapType("ResultStructure", oFF.OlapComponentType.QUERY_CONTEXT);
	oFF.OlapComponentType.DIMENSION_CONTEXT = oFF.OlapComponentType.createOlapType("DimensionContext", oFF.OlapComponentType.QUERY_CONTEXT);
	oFF.OlapComponentType.DIMENSIONS = oFF.OlapComponentType.createOlapType("Dimensions", oFF.OlapComponentType.QUERY_CONTEXT);
	oFF.OlapComponentType.MODELLER_CURRENCY_TRANSLATION = oFF.OlapComponentType.createOlapType("ModellerCurrencyTranslation", oFF.OlapComponentType.QUERY_CONTEXT);
	oFF.OlapComponentType.MODELLER_DIMENSIONS = oFF.OlapComponentType.createOlapType("ModellerDimensions", oFF.OlapComponentType.QUERY_CONTEXT);
	oFF.OlapComponentType.MODELLER_METADATA_PROPERTIES = oFF.OlapComponentType.createOlapType("ModellerMetadataProperties", oFF.OlapComponentType.QUERY_CONTEXT);
	oFF.OlapComponentType.MODELLER_VARIABLES = oFF.OlapComponentType.createOlapType("ModellerVariables", oFF.OlapComponentType.QUERY_CONTEXT);
	oFF.OlapComponentType.FIELD_CONTAINER = oFF.OlapComponentType.createOlapType("FieldContainer", oFF.OlapComponentType.QUERY_CONTEXT);
	oFF.OlapComponentType.FIELD_LIST = oFF.OlapComponentType.createOlapType("FieldList", oFF.OlapComponentType.QUERY_CONTEXT);
	oFF.OlapComponentType.FIELD = oFF.OlapComponentType.createOlapType("Field", oFF.OlapComponentType.QUERY_CONTEXT);
	oFF.OlapComponentType.VARIABLE_CONTEXT = oFF.OlapComponentType.createOlapType("VariableContext", oFF.OlapComponentType.QUERY_CONTEXT);
	oFF.OlapComponentType.PROPERTY = oFF.OlapComponentType.createOlapType("Property", oFF.XComponentType._VALUE);
	oFF.OlapComponentType.FORMULA_ITERATOR = oFF.OlapComponentType.createOlapType("FormulaIterator", oFF.XComponentType._MODEL);
	oFF.OlapComponentType.FORMULA_ITERATION_DIMENSION = oFF.OlapComponentType.createOlapType("FormulaIterationDimension", oFF.XComponentType._MODEL);
	oFF.OlapComponentType.FORMULA_CONSTANT = oFF.OlapComponentType.createOlapType("FormulaConstant", oFF.XComponentType._MODEL);
	oFF.OlapComponentType.FORMULA_ITEM_MEMBER = oFF.OlapComponentType.createOlapType("FormulaItemMember", oFF.XComponentType._MODEL);
	oFF.OlapComponentType.FORMULA_ITEM_ATTRIBUTE = oFF.OlapComponentType.createOlapType("FormulaItemAttribute", oFF.XComponentType._MODEL);
	oFF.OlapComponentType.FORMULA_OPERATION = oFF.OlapComponentType.createOlapType("FormulaOperation", oFF.XComponentType._MODEL);
	oFF.OlapComponentType.FORMULA_FUNCTION = oFF.OlapComponentType.createOlapType("FormulaFunction", oFF.XComponentType._MODEL);
	oFF.OlapComponentType.SORT_MANAGER = oFF.OlapComponentType.createOlapType("SortManager", oFF.OlapComponentType.QUERY_CONTEXT);
	oFF.OlapComponentType.VIZ_MANAGER = oFF.OlapComponentType.createOlapType("VizManager", oFF.OlapComponentType.QUERY_CONTEXT);
	oFF.OlapComponentType.VISUALIZATION_AXIS = oFF.OlapComponentType.createOlapType("VisualizationAxis", oFF.OlapComponentType.QUERY_CONTEXT);
	oFF.OlapComponentType.VISUALIZATION_CATEGORY = oFF.OlapComponentType.createOlapType("VisualizationCategory", oFF.OlapComponentType.QUERY_CONTEXT);
	oFF.OlapComponentType.VISUALIZATION_AXIS_MEMBER_SELECTION = oFF.OlapComponentType.createOlapType("VisualizationAxisMemberSelection", oFF.OlapComponentType.QUERY_CONTEXT);
	oFF.OlapComponentType.VISUALIZATION_CHART_SETTING = oFF.OlapComponentType.createOlapType("VisualizationChartSetting", oFF.OlapComponentType.QUERY_CONTEXT);
	oFF.OlapComponentType.VISUALIZATION_VALUE = oFF.OlapComponentType.createOlapType("VisualizationValue", oFF.OlapComponentType.QUERY_CONTEXT);
	oFF.OlapComponentType.VISUALIZATION_DEFINITION = oFF.OlapComponentType.createOlapType("VisualizationDefinition", oFF.OlapComponentType.QUERY_CONTEXT);
	oFF.OlapComponentType.VISUALIZATION_TABLE_DEFINITION = oFF.OlapComponentType.createOlapType("VisualizationChartDefinition", oFF.OlapComponentType.VISUALIZATION_DEFINITION);
	oFF.OlapComponentType.VISUALIZATION_CHART_DEFINITION = oFF.OlapComponentType.createOlapType("VisualizationTableDefinition", oFF.OlapComponentType.VISUALIZATION_DEFINITION);
	oFF.OlapComponentType.VISUALIZATION_CUSTOM_DEFINITION = oFF.OlapComponentType.createOlapType("VisualizationCustomDefinition", oFF.OlapComponentType.VISUALIZATION_DEFINITION);
	oFF.OlapComponentType.VISUALIZATION_MANAGER = oFF.OlapComponentType.createOlapType("VisualizationManager", oFF.OlapComponentType.QUERY_CONTEXT);
	oFF.OlapComponentType.VISUALIZATION_CELL_REFERENCE_SCOPE = oFF.OlapComponentType.createOlapType("VisualizationCellReferenceScope", oFF.OlapComponentType.QUERY_CONTEXT);
	oFF.OlapComponentType.VARIABLE_CONTAINER = oFF.OlapComponentType.createOlapType("VariableContainer", oFF.OlapComponentType.QUERY_CONTEXT);
	oFF.OlapComponentType.VARIABLE_LIST = oFF.OlapComponentType.createOlapType("VariableList", oFF.OlapComponentType.QUERY_CONTEXT);
	oFF.OlapComponentType.VARIABLE_MANAGER = oFF.OlapComponentType.createOlapType("VariableManager", oFF.OlapComponentType.VARIABLE_CONTAINER);
	oFF.OlapComponentType.ABSTRACT_LAYER_MODEL = oFF.OlapComponentType.createOlapType("AbstractLayerModel", oFF.OlapComponentType.OLAP);
	oFF.OlapComponentType.LAYER_MODEL = oFF.OlapComponentType.createOlapType("LayerModel", oFF.OlapComponentType.ABSTRACT_LAYER_MODEL);
	oFF.OlapComponentType.LAYER = oFF.OlapComponentType.createOlapType("Layer", oFF.OlapComponentType.ABSTRACT_LAYER_MODEL);
	oFF.OlapComponentType.LAYER_SYNC_DEFINITION = oFF.OlapComponentType.createOlapType("LayerSyncDefinition", oFF.OlapComponentType.ABSTRACT_LAYER_MODEL);
	oFF.OlapComponentType.LAYER_REFERENCE_DEFINITION = oFF.OlapComponentType.createOlapType("LayerReferenceDefinition", oFF.OlapComponentType.ABSTRACT_LAYER_MODEL);
	oFF.OlapComponentType.FILTER_CAPABILITY = oFF.OlapComponentType.createOlapType("FilterCapability", oFF.XComponentType._MODEL);
	oFF.OlapComponentType.FILTER_CAPABILITY_GROUP = oFF.OlapComponentType.createOlapType("FilterCapabilityGroup", oFF.OlapComponentType.FILTER_CAPABILITY);
	oFF.OlapComponentType.CONDITIONS = oFF.OlapComponentType.createOlapType("Conditions", oFF.OlapComponentType.OLAP);
	oFF.OlapComponentType.CONDITIONS_MANAGER = oFF.OlapComponentType.createOlapType("ConditionManager", oFF.OlapComponentType.CONDITIONS);
	oFF.OlapComponentType.CONDITION = oFF.OlapComponentType.createOlapType("Condition", oFF.OlapComponentType.OLAP);
	oFF.OlapComponentType.CONDITIONS_THRESHOLD = oFF.OlapComponentType.createOlapType("ConditionThreshold", oFF.OlapComponentType.OLAP);
	oFF.OlapComponentType.QUERY_CELL = oFF.OlapComponentType.createOlapType("QueryCell", oFF.OlapComponentType.OLAP);
	oFF.OlapComponentType.QUERY_CELLS = oFF.OlapComponentType.createOlapType("QueryCells", oFF.OlapComponentType.OLAP);
	oFF.OlapComponentType.DATA_CELL = oFF.OlapComponentType.createOlapType("DataCell", oFF.OlapComponentType.OLAP);
	oFF.OlapComponentType.DATA_CELLS = oFF.OlapComponentType.createOlapType("DataCells", oFF.OlapComponentType.OLAP);
	oFF.OlapComponentType.FILTER_CELL_VALUE_OPERAND = oFF.OlapComponentType.createOlapType("FilterCellValueOperand", oFF.OlapComponentType.OLAP);
	oFF.OlapComponentType.TOTALS = oFF.OlapComponentType.createOlapType("Totals", oFF.OlapComponentType.OLAP);
	oFF.OlapComponentType.MEMBERS = oFF.OlapComponentType.createOlapType("Members", oFF.OlapComponentType.OLAP);
	oFF.OlapComponentType.HIERARCHY = oFF.OlapComponentType.createOlapType("Hierarchy", oFF.OlapComponentType.OLAP);
	oFF.OlapComponentType.HIERARCHY_MANAGER = oFF.OlapComponentType.createOlapType("HierarchyManager", oFF.OlapComponentType.OLAP);
	oFF.OlapComponentType.CUSTOM_HIERARCHY_REPOSITORY = oFF.OlapComponentType.createOlapType("CustomHierarchyRepository", oFF.OlapComponentType.OLAP);
	oFF.OlapComponentType.CUSTOM_HIERARCHY_DEFINITION = oFF.OlapComponentType.createOlapType("CustomHierarchyDefinition", oFF.OlapComponentType.QUERY_CONTEXT);
	oFF.OlapComponentType.EXCEPTION_MANAGER = oFF.OlapComponentType.createOlapType("Exceptions", oFF.OlapComponentType.OLAP);
	oFF.OlapComponentType.FORMULA_EXCEPTION_MANAGER = oFF.OlapComponentType.createOlapType("FormulaExceptions", oFF.OlapComponentType.OLAP);
	oFF.OlapComponentType.FORMULA_EXCEPTION = oFF.OlapComponentType.createOlapType("FormulaException", oFF.OlapComponentType.OLAP);
	oFF.OlapComponentType.ABSTRACT_DIMENSION = oFF.OlapComponentType.createOlapType("AbstractDimension", oFF.XComponentType._ROOT);
	oFF.OlapComponentType.ATTRIBUTE_LIST = oFF.OlapComponentType.createOlapType("AttributeList", oFF.OlapComponentType.COMPONENT_LIST);
	oFF.OlapComponentType.CATALOG_SPACE = oFF.OlapComponentType.createOlapType("CatalogSpace", oFF.XComponentType._ROOT);
	oFF.OlapComponentType.GROUP_BY_NODE = oFF.OlapComponentType.createOlapType("GroupByNode", oFF.XComponentType._ROOT);
	oFF.OlapComponentType.CATALOG_TYPE = oFF.OlapComponentType.createOlapType("CatalogType", oFF.XComponentType._ROOT);
	oFF.OlapComponentType.CATALOG_SCHEMA = oFF.OlapComponentType.createOlapType("CatalogSchema", oFF.XComponentType._ROOT);
	oFF.OlapComponentType.CATALOG_PACKAGE = oFF.OlapComponentType.createOlapType("CatalogPackage", oFF.XComponentType._ROOT);
	oFF.OlapComponentType.CATALOG_OBJECT = oFF.OlapComponentType.createOlapType("CatalogObject", oFF.XComponentType._ROOT);
	oFF.OlapComponentType.RD_DATA_CELL = oFF.OlapComponentType.createOlapType("RS_DATA_CELL", oFF.XComponentType._ROOT);
	oFF.OlapComponentType.OLAP_METADATA_MODEL = oFF.OlapComponentType.createOlapType("OlapMetadataModel", oFF.XComponentType._ROOT);
	oFF.OlapComponentType.UNIVERSAL_DISPLAY_HIERARCHY = oFF.OlapComponentType.createOlapType("UniversalDisplayHierarchy", oFF.XComponentType._ROOT);
	oFF.OlapComponentType.UNIVERSAL_DISPLAY_HIERARCHIES = oFF.OlapComponentType.createOlapType("UniversalDisplayHierarchies", oFF.XComponentType._ROOT);
	oFF.OlapComponentType.EXCEPTION_AGGREGATION_MANAGER = oFF.OlapComponentType.createOlapType("ExceptionAggregationManager", oFF.OlapComponentType.QUERY_CONTEXT);
	oFF.OlapComponentType.OLAP_CLIENT_QUERY_OBJECT_MANAGER = oFF.OlapComponentType.createOlapType("ClientQueryObjectManager", oFF.XComponentType._ROOT);
	oFF.OlapComponentType.KEY_REF_STORE_CONTEXT = oFF.OlapComponentType.createOlapType("KeyRefStoreContext", oFF.XComponentType._ROOT);
	oFF.OlapComponentType.MODEL_DIMENSION_LINKS = oFF.OlapComponentType.createOlapType("ModelDimensionLinks", oFF.OlapComponentType.OLAP);
	oFF.OlapComponentType.BLENDABLE_QUERY_MANAGER = oFF.OlapComponentType.createOlapType("BlendableQueryManager", oFF.OlapComponentType.OLAP);
	oFF.OlapComponentType.BLENDED_FORMULA_MEASURE = oFF.OlapComponentType.createOlapType("BlendedFormulaMeasure", oFF.OlapComponentType.OLAP);
};
oFF.OlapComponentType.createOlapType = function(constant, parent)
{
	var mt = new oFF.OlapComponentType();
	mt.setupExt(constant, parent);
	return mt;
};

oFF.PresentationType = function() {};
oFF.PresentationType.prototype = new oFF.XComponentType();
oFF.PresentationType.prototype._ff_c = "PresentationType";

oFF.PresentationType.UNDEFINED = null;
oFF.PresentationType.SELF = null;
oFF.PresentationType.DEFAULT_CONTENT = null;
oFF.PresentationType.VALUE = null;
oFF.PresentationType.ABSTRACT_KEY = null;
oFF.PresentationType.ABSTRACT_TEXT = null;
oFF.PresentationType.ACTIVE_KEY = null;
oFF.PresentationType.ACTIVE_DISPLAY_KEY = null;
oFF.PresentationType.ACTIVE_TEXT = null;
oFF.PresentationType.KEY = null;
oFF.PresentationType.ID = null;
oFF.PresentationType.KEY_NOT_COMPOUND = null;
oFF.PresentationType.DISPLAY_KEY = null;
oFF.PresentationType.DISPLAY_KEY_MIXED_COMPOUNDMENT = null;
oFF.PresentationType.DISPLAY_KEY_NOT_COMPOUND = null;
oFF.PresentationType.SHORT_TEXT = null;
oFF.PresentationType.MEDIUM_TEXT = null;
oFF.PresentationType.LONG_TEXT = null;
oFF.PresentationType.XL_LONG_TEXT = null;
oFF.PresentationType.TEXT = null;
oFF.PresentationType.DOCUMENT_LINK = null;
oFF.PresentationType.BUSINESS_OBJECT_NODE_IDENTIFIER = null;
oFF.PresentationType.WHY_FOUND = null;
oFF.PresentationType.RELATED_ACTIONS = null;
oFF.PresentationType.HIERARCHY_KEY = null;
oFF.PresentationType.HIERARCHY_TEXT = null;
oFF.PresentationType.HIERARCHY_DISPLAY_KEY = null;
oFF.PresentationType.HIERARCHY_PATH = null;
oFF.PresentationType.NAME_PATH = null;
oFF.PresentationType.URL = null;
oFF.PresentationType.BLOB = null;
oFF.PresentationType.QUERY_TEXT = null;
oFF.PresentationType.staticSetupPresentation = function()
{
	oFF.PresentationType.SELF = oFF.PresentationType.createPresentation("Self", null, 0);
	oFF.PresentationType.UNDEFINED = oFF.PresentationType.createPresentation("Undefined", null, 1000);
	oFF.PresentationType.DEFAULT_CONTENT = oFF.PresentationType.createPresentation("DefaultContent", null, 1005);
	oFF.PresentationType.VALUE = oFF.PresentationType.createPresentation("Value", null, 1010);
	oFF.PresentationType.ID = oFF.PresentationType.createPresentation("Id", null, 5);
	oFF.PresentationType.ABSTRACT_KEY = oFF.PresentationType.createPresentation("AbstractKey", null, 0);
	oFF.PresentationType.ABSTRACT_TEXT = oFF.PresentationType.createPresentation("AbstractText", null, 0);
	oFF.PresentationType.ACTIVE_KEY = oFF.PresentationType.createPresentation("ActiveKey", oFF.PresentationType.ABSTRACT_KEY, 0);
	oFF.PresentationType.ACTIVE_DISPLAY_KEY = oFF.PresentationType.createPresentation("ActiveDisplayKey", oFF.PresentationType.ABSTRACT_KEY, 0);
	oFF.PresentationType.ACTIVE_TEXT = oFF.PresentationType.createPresentation("ActiveText", oFF.PresentationType.ABSTRACT_TEXT, 0);
	oFF.PresentationType.KEY = oFF.PresentationType.createPresentation("KEY", oFF.PresentationType.ABSTRACT_KEY, 10);
	oFF.PresentationType.KEY_NOT_COMPOUND = oFF.PresentationType.createPresentation("KEY_NOT_COMPOUND", oFF.PresentationType.ABSTRACT_KEY, 15);
	oFF.PresentationType.DISPLAY_KEY = oFF.PresentationType.createPresentation("DISPLAY_KEY", oFF.PresentationType.ABSTRACT_KEY, 20);
	oFF.PresentationType.DISPLAY_KEY_MIXED_COMPOUNDMENT = oFF.PresentationType.createPresentation("DISPLAY_KEY_MIXED_COMPOUNDMENT", oFF.PresentationType.DISPLAY_KEY, 25);
	oFF.PresentationType.DISPLAY_KEY_NOT_COMPOUND = oFF.PresentationType.createPresentation("DISPLAY_KEY_NC", oFF.PresentationType.DISPLAY_KEY, 30);
	oFF.PresentationType.TEXT = oFF.PresentationType.createPresentation("TEXT", oFF.PresentationType.ABSTRACT_TEXT, 35);
	oFF.PresentationType.SHORT_TEXT = oFF.PresentationType.createPresentation("SHORT_TEXT", oFF.PresentationType.TEXT, 40);
	oFF.PresentationType.MEDIUM_TEXT = oFF.PresentationType.createPresentation("MIDDLE_TEXT", oFF.PresentationType.TEXT, 45);
	oFF.PresentationType.LONG_TEXT = oFF.PresentationType.createPresentation("LONG_TEXT", oFF.PresentationType.TEXT, 50);
	oFF.PresentationType.XL_LONG_TEXT = oFF.PresentationType.createPresentation("XL_LONG_TEXT", oFF.PresentationType.TEXT, 55);
	oFF.PresentationType.HIERARCHY_KEY = oFF.PresentationType.createPresentation("HierarchyKey", oFF.PresentationType.ABSTRACT_KEY, 60);
	oFF.PresentationType.HIERARCHY_DISPLAY_KEY = oFF.PresentationType.createPresentation("HierarchyDisplayKey", oFF.PresentationType.ABSTRACT_KEY, 65);
	oFF.PresentationType.HIERARCHY_TEXT = oFF.PresentationType.createPresentation("HierarchyText", oFF.PresentationType.ABSTRACT_TEXT, 70);
	oFF.PresentationType.HIERARCHY_PATH = oFF.PresentationType.createPresentation("HierarchyPath", null, 75);
	oFF.PresentationType.NAME_PATH = oFF.PresentationType.createPresentation("NamePath", null, 80);
	oFF.PresentationType.BUSINESS_OBJECT_NODE_IDENTIFIER = oFF.PresentationType.createPresentation("BusinessObjectNodeIdentifier", null, 85);
	oFF.PresentationType.DOCUMENT_LINK = oFF.PresentationType.createPresentation("DocumentLink", null, 90);
	oFF.PresentationType.WHY_FOUND = oFF.PresentationType.createPresentation("WhyFound", null, 1030);
	oFF.PresentationType.RELATED_ACTIONS = oFF.PresentationType.createPresentation("RelatedActions", null, 1040);
	oFF.PresentationType.URL = oFF.PresentationType.createPresentation("Url", null, 1041);
	oFF.PresentationType.BLOB = oFF.PresentationType.createPresentation("XXL", null, 1042);
	oFF.PresentationType.QUERY_TEXT = oFF.PresentationType.createPresentation("QueryText", null, 1043);
};
oFF.PresentationType.createPresentation = function(name, parent, priority)
{
	var type = new oFF.PresentationType();
	type.setupExt(name, parent);
	type.setPriority(priority);
	return type;
};
oFF.PresentationType.isTextPresentation = function(presentationType)
{
	if (oFF.isNull(presentationType))
	{
		return false;
	}
	return presentationType.isTypeOf(oFF.PresentationType.TEXT) || presentationType === oFF.PresentationType.HIERARCHY_TEXT;
};
oFF.PresentationType.isKeyPresentation = function(presentationType)
{
	if (oFF.isNull(presentationType))
	{
		return false;
	}
	return presentationType.isTypeOf(oFF.PresentationType.ABSTRACT_KEY) || presentationType === oFF.PresentationType.HIERARCHY_KEY || presentationType === oFF.PresentationType.HIERARCHY_DISPLAY_KEY;
};
oFF.PresentationType.lookup = function(name)
{
	return oFF.XComponentType.lookupComponentType(name);
};
oFF.PresentationType.prototype.m_priority = 0;
oFF.PresentationType.prototype.setPriority = function(prioriry)
{
	this.m_priority = prioriry;
};
oFF.PresentationType.prototype.getPriority = function()
{
	return this.m_priority;
};

oFF.QModelFormat = function() {};
oFF.QModelFormat.prototype = new oFF.ContentType();
oFF.QModelFormat.prototype._ff_c = "QModelFormat";

oFF.QModelFormat.ABSTRACT_JSON_MODEL = null;
oFF.QModelFormat.INA_ABSTRACT_MODEL = null;
oFF.QModelFormat.INA_DATA = null;
oFF.QModelFormat.INA_DATA_MERGE_PROCESSING = null;
oFF.QModelFormat.INA_PERSISTED_QUERY_DATA = null;
oFF.QModelFormat.INA_DATA_BLENDING_SOURCE = null;
oFF.QModelFormat.INA_DATA_BLENDING_SOURCE_METADATA = null;
oFF.QModelFormat.INA_DATA_REINIT = null;
oFF.QModelFormat.INA_REPOSITORY = null;
oFF.QModelFormat.INA_REPOSITORY_NO_VARS = null;
oFF.QModelFormat.INA_REPOSITORY_DATA = null;
oFF.QModelFormat.INA_REPOSITORY_DELTA = null;
oFF.QModelFormat.INA_REPOSITORY_DATA_RENDERING = null;
oFF.QModelFormat.INA_REPOSITORY_DATA_NO_VARS = null;
oFF.QModelFormat.INA_METADATA_CORE = null;
oFF.QModelFormat.INA_METADATA_RENDERING = null;
oFF.QModelFormat.INA_METADATA = null;
oFF.QModelFormat.INA_CLONE = null;
oFF.QModelFormat.INA_CLONE_RENDERING = null;
oFF.QModelFormat.INA_METADATA_BLENDING = null;
oFF.QModelFormat.INA_VALUE_HELP = null;
oFF.QModelFormat.COMMANDS = null;
oFF.QModelFormat.EXPRESSION = null;
oFF.QModelFormat.LAYER = null;
oFF.QModelFormat.VIZDEF = null;
oFF.QModelFormat.GRIDDEF = null;
oFF.QModelFormat.GLOBALDEF = null;
oFF.QModelFormat.UQM = null;
oFF.QModelFormat.TMX = null;
oFF.QModelFormat.CSN_METADATA = null;
oFF.QModelFormat.SFX = null;
oFF.QModelFormat.RENDER_INFO = null;
oFF.QModelFormat.s_subModelFormatInAKey = null;
oFF.QModelFormat.s_allFormats = null;
oFF.QModelFormat.staticSetupModelFormat = function()
{
	oFF.QModelFormat.s_allFormats = oFF.XList.create();
	oFF.QModelFormat.s_subModelFormatInAKey = oFF.XHashMapOfStringByString.create();
	oFF.QModelFormat.ABSTRACT_JSON_MODEL = oFF.QModelFormat.createModelFormat("AbstractJsonModel", oFF.ContentType.APPLICATION_JSON, false, false, false, null);
	oFF.QModelFormat.INA_METADATA_CORE = oFF.QModelFormat.createModelFormat("InAMetadataCore", oFF.QModelFormat.ABSTRACT_JSON_MODEL, true, false, false, null);
	oFF.QModelFormat.INA_METADATA = oFF.QModelFormat.createModelFormat("InAMetadata", oFF.QModelFormat.ABSTRACT_JSON_MODEL, true, true, false, null);
	oFF.QModelFormat.INA_METADATA_BLENDING = oFF.QModelFormat.createModelFormat("InAMetadataBlending", oFF.QModelFormat.ABSTRACT_JSON_MODEL, true, false, false, null);
	oFF.QModelFormat.INA_METADATA_RENDERING = oFF.QModelFormat.createModelFormat("InAMetadataRendering", oFF.QModelFormat.ABSTRACT_JSON_MODEL, true, false, false, null);
	oFF.QModelFormat.INA_ABSTRACT_MODEL = oFF.QModelFormat.createModelFormat("InAAbstractModel", oFF.QModelFormat.ABSTRACT_JSON_MODEL, false, true, false, null);
	oFF.QModelFormat.INA_REPOSITORY = oFF.QModelFormat.createModelFormat("InARepository", oFF.QModelFormat.INA_ABSTRACT_MODEL, false, true, false, "ffq");
	oFF.QModelFormat.INA_REPOSITORY_NO_VARS = oFF.QModelFormat.createModelFormat("InARepositoryNoVars", oFF.QModelFormat.INA_REPOSITORY, false, true, false, null);
	oFF.QModelFormat.INA_REPOSITORY_DATA = oFF.QModelFormat.createModelFormat("InARepositoryData", oFF.QModelFormat.INA_REPOSITORY, false, true, false, null);
	oFF.QModelFormat.INA_REPOSITORY_DATA_RENDERING = oFF.QModelFormat.createModelFormat("InARepositoryDataRendering", oFF.QModelFormat.INA_REPOSITORY_DATA, false, true, false, null);
	oFF.QModelFormat.INA_REPOSITORY_DATA_NO_VARS = oFF.QModelFormat.createModelFormat("InARepositoryDataNoVars", oFF.QModelFormat.INA_REPOSITORY_DATA, false, true, false, null);
	oFF.QModelFormat.INA_REPOSITORY_DELTA = oFF.QModelFormat.createModelFormat("InARepositoryDelta", oFF.QModelFormat.INA_REPOSITORY, false, true, false, null);
	oFF.QModelFormat.INA_VALUE_HELP = oFF.QModelFormat.createModelFormat("InAValueHelp", oFF.QModelFormat.INA_ABSTRACT_MODEL, false, true, false, null);
	oFF.QModelFormat.INA_DATA = oFF.QModelFormat.createModelFormat("InAData", oFF.QModelFormat.INA_ABSTRACT_MODEL, false, true, false, "ina");
	oFF.QModelFormat.INA_DATA_REINIT = oFF.QModelFormat.createModelFormat("InADataReinit", oFF.QModelFormat.INA_DATA, false, true, false, null);
	oFF.QModelFormat.INA_DATA_BLENDING_SOURCE = oFF.QModelFormat.createModelFormat("InADataBlendingSource", oFF.QModelFormat.INA_DATA, false, true, false, null);
	oFF.QModelFormat.INA_DATA_BLENDING_SOURCE_METADATA = oFF.QModelFormat.createModelFormat("InADataBlendingSourceMetadata", oFF.QModelFormat.INA_DATA_BLENDING_SOURCE, false, true, false, null);
	oFF.QModelFormat.INA_PERSISTED_QUERY_DATA = oFF.QModelFormat.createModelFormat("InAPersistedQueryData", oFF.QModelFormat.INA_DATA, false, true, false, null);
	oFF.QModelFormat.INA_DATA_MERGE_PROCESSING = oFF.QModelFormat.createModelFormat("InADataMergeProcessing", oFF.QModelFormat.INA_DATA, false, true, false, null);
	oFF.QModelFormat.INA_METADATA_CORE.addUsage(oFF.QModelFormat.INA_METADATA);
	oFF.QModelFormat.INA_METADATA_CORE.addUsage(oFF.QModelFormat.INA_METADATA_RENDERING);
	oFF.QModelFormat.INA_DATA.addUsage(oFF.QModelFormat.INA_VALUE_HELP);
	oFF.QModelFormat.INA_DATA.addUsage(oFF.QModelFormat.INA_DATA_REINIT);
	oFF.QModelFormat.INA_DATA.addUsage(oFF.QModelFormat.INA_DATA_BLENDING_SOURCE);
	oFF.QModelFormat.INA_DATA.addUsage(oFF.QModelFormat.INA_DATA_BLENDING_SOURCE_METADATA);
	oFF.QModelFormat.INA_DATA.addUsage(oFF.QModelFormat.INA_PERSISTED_QUERY_DATA);
	oFF.QModelFormat.INA_DATA.addUsage(oFF.QModelFormat.INA_DATA_MERGE_PROCESSING);
	oFF.QModelFormat.INA_REPOSITORY.addUsage(oFF.QModelFormat.INA_REPOSITORY_NO_VARS);
	oFF.QModelFormat.INA_REPOSITORY.addUsage(oFF.QModelFormat.INA_REPOSITORY_DATA);
	oFF.QModelFormat.INA_REPOSITORY.addUsage(oFF.QModelFormat.INA_REPOSITORY_DATA_RENDERING);
	oFF.QModelFormat.INA_REPOSITORY.addUsage(oFF.QModelFormat.INA_REPOSITORY_DATA_NO_VARS);
	oFF.QModelFormat.INA_REPOSITORY.addUsage(oFF.QModelFormat.INA_REPOSITORY_DELTA);
	oFF.QModelFormat.INA_CLONE = oFF.QModelFormat.createModelFormat("InAClone", oFF.QModelFormat.ABSTRACT_JSON_MODEL, true, true, true, null);
	oFF.QModelFormat.INA_CLONE_RENDERING = oFF.QModelFormat.createModelFormat("InACloneRendering", oFF.QModelFormat.ABSTRACT_JSON_MODEL, true, true, true, null);
	oFF.QModelFormat.COMMANDS = oFF.QModelFormat.createModelFormat("Commands", oFF.QModelFormat.ABSTRACT_JSON_MODEL, false, true, false, null);
	oFF.QModelFormat.EXPRESSION = oFF.QModelFormat.createModelFormat("Expression", oFF.QModelFormat.ABSTRACT_JSON_MODEL, false, true, false, null);
	oFF.QModelFormat.LAYER = oFF.QModelFormat.createModelFormat("Layer", oFF.QModelFormat.ABSTRACT_JSON_MODEL, false, true, false, null);
	oFF.QModelFormat.GRIDDEF = oFF.QModelFormat.createModelFormat("GridDef", oFF.QModelFormat.ABSTRACT_JSON_MODEL, false, true, false, null);
	oFF.QModelFormat.VIZDEF = oFF.QModelFormat.createModelFormat("VizDef", oFF.QModelFormat.ABSTRACT_JSON_MODEL, false, true, false, null);
	oFF.QModelFormat.GLOBALDEF = oFF.QModelFormat.createModelFormat("GlobalDef", oFF.QModelFormat.ABSTRACT_JSON_MODEL, false, true, false, null);
	oFF.QModelFormat.UQM = oFF.QModelFormat.createModelFormat("Uqm", oFF.QModelFormat.ABSTRACT_JSON_MODEL, false, true, false, "uqm");
	oFF.QModelFormat.TMX = oFF.QModelFormat.createModelFormat("Tmx", oFF.ContentType.TEXT_PLAIN, false, false, false, null);
	oFF.QModelFormat.CSN_METADATA = oFF.QModelFormat.createModelFormat("CsnMetadata", oFF.QModelFormat.ABSTRACT_JSON_MODEL, false, false, false, null);
	oFF.QModelFormat.RENDER_INFO = oFF.QModelFormat.createModelFormat("RenderInfo", oFF.QModelFormat.ABSTRACT_JSON_MODEL, false, false, false, null);
	oFF.QModelFormat.SFX = oFF.QModelFormat.createModelFormat("Sfx", oFF.QModelFormat.ABSTRACT_JSON_MODEL, false, false, false, "sfx");
	oFF.QModelFormat.s_subModelFormatInAKey.put(oFF.QModelFormat.INA_METADATA_CORE.getName(), oFF.InAConstantsBios.QY_METADATA);
	oFF.QModelFormat.s_subModelFormatInAKey.put(oFF.QModelFormat.INA_METADATA_RENDERING.getName(), oFF.InAConstantsBios.QY_METADATA);
	oFF.QModelFormat.s_subModelFormatInAKey.put(oFF.QModelFormat.INA_REPOSITORY.getName(), oFF.InAConstantsBios.QY_RUNTIME);
	oFF.QModelFormat.s_subModelFormatInAKey.put(oFF.QModelFormat.INA_REPOSITORY_DATA_RENDERING.getName(), oFF.InAConstantsBios.QY_RUNTIME);
	oFF.QModelFormat.addComplexModelFormatSettings(oFF.QModelFormat.INA_CLONE, 0, oFF.QModelFormat.INA_METADATA_CORE);
	oFF.QModelFormat.addComplexModelFormatSettings(oFF.QModelFormat.INA_CLONE, 1, oFF.QModelFormat.INA_REPOSITORY);
	oFF.QModelFormat.addComplexModelFormatSettings(oFF.QModelFormat.INA_CLONE_RENDERING, 0, oFF.QModelFormat.INA_METADATA_RENDERING);
	oFF.QModelFormat.addComplexModelFormatSettings(oFF.QModelFormat.INA_CLONE_RENDERING, 1, oFF.QModelFormat.INA_REPOSITORY_DATA_RENDERING);
};
oFF.QModelFormat.createModelFormat = function(name, parent, containsMetadata, containsModel, isComplexModelFormat, extension)
{
	var modelFormat = new oFF.QModelFormat();
	modelFormat.setupContentType(name, null, parent, extension, null, null);
	modelFormat.m_containsMetadata = containsMetadata;
	modelFormat.m_containsModel = containsModel;
	modelFormat.m_isComplexModelFormat = isComplexModelFormat;
	modelFormat.m_allUsages = oFF.XList.create();
	modelFormat.m_allUsages.add(modelFormat);
	oFF.QModelFormat.s_allFormats.add(modelFormat);
	return modelFormat;
};
oFF.QModelFormat.addComplexModelFormatSettings = function(complexModelFormat, indx, subModelFormat)
{
	if (complexModelFormat.isComplexModelFormat())
	{
		if (oFF.isNull(complexModelFormat.m_complexSettings))
		{
			complexModelFormat.m_complexSettings = oFF.XSimpleMap.create();
		}
		complexModelFormat.m_complexSettings.put(oFF.XIntegerValue.create(indx), subModelFormat);
	}
};
oFF.QModelFormat.getInAKeyForModelFormat = function(modelFormat)
{
	return oFF.QModelFormat.s_subModelFormatInAKey.getByKey(modelFormat.getName());
};
oFF.QModelFormat.getAllModelFormats = function()
{
	return oFF.QModelFormat.s_allFormats;
};
oFF.QModelFormat.prototype.m_containsMetadata = false;
oFF.QModelFormat.prototype.m_containsModel = false;
oFF.QModelFormat.prototype.m_isComplexModelFormat = false;
oFF.QModelFormat.prototype.m_complexSettings = null;
oFF.QModelFormat.prototype.m_allUsages = null;
oFF.QModelFormat.prototype.containsMetadata = function()
{
	return this.m_containsMetadata;
};
oFF.QModelFormat.prototype.containsModel = function()
{
	return this.m_containsModel;
};
oFF.QModelFormat.prototype.isComplexModelFormat = function()
{
	return this.m_isComplexModelFormat;
};
oFF.QModelFormat.prototype.getSubModelFormat = function(indx)
{
	return this.m_complexSettings.getByKey(oFF.XIntegerValue.create(indx));
};
oFF.QModelFormat.prototype.getSizeOfComplexModelFormat = function()
{
	return this.m_complexSettings.size();
};
oFF.QModelFormat.prototype.addUsage = function(modelFormat)
{
	this.m_allUsages.add(modelFormat);
};
oFF.QModelFormat.prototype.getUsages = function()
{
	return this.m_allUsages;
};

oFF.AxisType = function() {};
oFF.AxisType.prototype = new oFF.OlapComponentType();
oFF.AxisType.prototype._ff_c = "AxisType";

oFF.AxisType.COLUMNS = null;
oFF.AxisType.ROWS = null;
oFF.AxisType.FREE = null;
oFF.AxisType.DYNAMIC = null;
oFF.AxisType.REPOSITORY = null;
oFF.AxisType.FILTER = null;
oFF.AxisType.VIRTUAL = null;
oFF.AxisType.TECHNICAL = null;
oFF.AxisType.s_all = null;
oFF.AxisType.staticSetup = function()
{
	oFF.AxisType.s_all = oFF.XSetOfNameObject.create();
	oFF.AxisType.REPOSITORY = oFF.AxisType.create("Repository", 3, null, false);
	oFF.AxisType.FREE = oFF.AxisType.create("Free", 2, oFF.AxisType.REPOSITORY, false);
	oFF.AxisType.COLUMNS = oFF.AxisType.create("Columns", 0, oFF.AxisType.FREE, true);
	oFF.AxisType.ROWS = oFF.AxisType.create("Rows", 1, oFF.AxisType.FREE, true);
	oFF.AxisType.DYNAMIC = oFF.AxisType.create("Dynamic", 4, oFF.AxisType.FREE, false);
	oFF.AxisType.FILTER = oFF.AxisType.create("Filter", 4, oFF.AxisType.REPOSITORY, false);
	oFF.AxisType.TECHNICAL = oFF.AxisType.create("Technical", 5, oFF.AxisType.REPOSITORY, false);
	oFF.AxisType.VIRTUAL = oFF.AxisType.create("Virtual", 999, oFF.AxisType.VIRTUAL, false);
};
oFF.AxisType.create = function(name, index, fallback, isVisible)
{
	var newConstant = new oFF.AxisType();
	newConstant.setupAxis(name, index, fallback, isVisible);
	oFF.AxisType.s_all.add(newConstant);
	return newConstant;
};
oFF.AxisType.getAll = function()
{
	return oFF.AxisType.s_all.getValuesAsReadOnlyList();
};
oFF.AxisType.lookup = function(name)
{
	return oFF.AxisType.s_all.getByKey(name);
};
oFF.AxisType.prototype.m_index = 0;
oFF.AxisType.prototype.m_fallbackAxis = null;
oFF.AxisType.prototype.m_isVisible = false;
oFF.AxisType.prototype.setupAxis = function(name, index, fallback, isVisible)
{
	oFF.OlapComponentType.prototype.setupExt.call( this , name, oFF.OlapComponentType.AXIS);
	this.m_index = index;
	this.m_fallbackAxis = fallback;
	this.m_isVisible = isVisible;
};
oFF.AxisType.prototype.getOrthogonalAxisType = function()
{
	var orthogonalAxisType = null;
	if (this === oFF.AxisType.COLUMNS)
	{
		orthogonalAxisType = oFF.AxisType.ROWS;
	}
	else if (this === oFF.AxisType.ROWS)
	{
		orthogonalAxisType = oFF.AxisType.COLUMNS;
	}
	return orthogonalAxisType;
};
oFF.AxisType.prototype.getIndex = function()
{
	return this.m_index;
};
oFF.AxisType.prototype.getFallbackAxis = function()
{
	return this.m_fallbackAxis;
};
oFF.AxisType.prototype.isVisible = function()
{
	return this.m_isVisible;
};

oFF.DimensionType = function() {};
oFF.DimensionType.prototype = new oFF.OlapComponentType();
oFF.DimensionType.prototype._ff_c = "DimensionType";

oFF.DimensionType.ATTRIBUTE_DIM = null;
oFF.DimensionType.PRESENTATION = null;
oFF.DimensionType.CONTAINER = null;
oFF.DimensionType.CURRENCY = null;
oFF.DimensionType.UNIT = null;
oFF.DimensionType.DIMENSION = null;
oFF.DimensionType.TIME = null;
oFF.DimensionType.DATE = null;
oFF.DimensionType.HIERARCHY_VERSION = null;
oFF.DimensionType.HIERARCHY_NAME = null;
oFF.DimensionType.SEARCH_DIMENSION = null;
oFF.DimensionType.ACCOUNT = null;
oFF.DimensionType.GIS_DIMENSION = null;
oFF.DimensionType.SEARCH_RESULT = null;
oFF.DimensionType.SUGGEST_TERM = null;
oFF.DimensionType.SUGGEST_SCOPE = null;
oFF.DimensionType.SUGGEST_ATTRIBUTE = null;
oFF.DimensionType.ABSTRACT_STRUCTURE = null;
oFF.DimensionType.MEASURE_STRUCTURE = null;
oFF.DimensionType.SECONDARY_STRUCTURE = null;
oFF.DimensionType.CALCULATED_DIMENSION = null;
oFF.DimensionType.DIMENSION_INCOMPLETE = null;
oFF.DimensionType.FORMULA_CALCULATED_DIMENSION = null;
oFF.DimensionType.FILTER_ACROSS_MODELS_CALCULATED_DIMENSION = null;
oFF.DimensionType.MEASURE_BASED_FILTER_CALCULATED_DIMENSION = null;
oFF.DimensionType.GENERAL_VERSION = null;
oFF.DimensionType.VERSION = null;
oFF.DimensionType.VERSION_EPM = null;
oFF.DimensionType.VERSION_IBP = null;
oFF.DimensionType.staticSetupDimensionType = function()
{
	oFF.DimensionType.DIMENSION = oFF.DimensionType.createDimensionType("Dimension", oFF.OlapComponentType.ABSTRACT_DIMENSION, true);
	oFF.DimensionType.SEARCH_DIMENSION = oFF.DimensionType.createDimensionType("SearchDimension", oFF.DimensionType.DIMENSION, false);
	oFF.DimensionType.GIS_DIMENSION = oFF.DimensionType.createDimensionType("GisDimension", oFF.DimensionType.DIMENSION, false);
	oFF.DimensionType.ABSTRACT_STRUCTURE = oFF.DimensionType.createDimensionType("AbstractStructure", oFF.OlapComponentType.ABSTRACT_DIMENSION, false);
	oFF.DimensionType.MEASURE_STRUCTURE = oFF.DimensionType.createDimensionType("MeasureStructure", oFF.DimensionType.ABSTRACT_STRUCTURE, true);
	oFF.DimensionType.SECONDARY_STRUCTURE = oFF.DimensionType.createDimensionType("SecondaryStructure", oFF.DimensionType.ABSTRACT_STRUCTURE, true);
	oFF.DimensionType.CURRENCY = oFF.DimensionType.createDimensionType("CurrencyDimension", oFF.DimensionType.DIMENSION, true);
	oFF.DimensionType.UNIT = oFF.DimensionType.createDimensionType("UnitDimension", oFF.DimensionType.DIMENSION, true);
	oFF.DimensionType.TIME = oFF.DimensionType.createDimensionType("TimeDimension", oFF.DimensionType.DIMENSION, true);
	oFF.DimensionType.DATE = oFF.DimensionType.createDimensionType("DateDimension", oFF.DimensionType.DIMENSION, true);
	oFF.DimensionType.HIERARCHY_VERSION = oFF.DimensionType.createDimensionType("HierarchyVersionDimension", oFF.DimensionType.DIMENSION, false);
	oFF.DimensionType.HIERARCHY_NAME = oFF.DimensionType.createDimensionType("HierarchyNameDimension", oFF.DimensionType.DIMENSION, false);
	oFF.DimensionType.SEARCH_RESULT = oFF.DimensionType.createDimensionType("SearchResultDimension", oFF.DimensionType.DIMENSION, false);
	oFF.DimensionType.SUGGEST_TERM = oFF.DimensionType.createDimensionType("SuggestTermDimension", oFF.DimensionType.DIMENSION, false);
	oFF.DimensionType.SUGGEST_SCOPE = oFF.DimensionType.createDimensionType("SuggestScopeDimension", oFF.DimensionType.DIMENSION, false);
	oFF.DimensionType.SUGGEST_ATTRIBUTE = oFF.DimensionType.createDimensionType("SuggestAttributeDimension", oFF.DimensionType.DIMENSION, false);
	oFF.DimensionType.ACCOUNT = oFF.DimensionType.createDimensionType("AccountDimension", oFF.DimensionType.DIMENSION, true);
	oFF.DimensionType.GENERAL_VERSION = oFF.DimensionType.createDimensionType("GeneralVersion", oFF.DimensionType.DIMENSION, true);
	oFF.DimensionType.VERSION_EPM = oFF.DimensionType.createDimensionType("VersionDimension", oFF.DimensionType.GENERAL_VERSION, true);
	oFF.DimensionType.VERSION = oFF.DimensionType.VERSION_EPM;
	oFF.DimensionType.VERSION_IBP = oFF.DimensionType.createDimensionType("VersionIBP", oFF.DimensionType.GENERAL_VERSION, true);
	oFF.DimensionType.ATTRIBUTE_DIM = oFF.DimensionType.createDimensionType("AttributeDimension", oFF.OlapComponentType.ABSTRACT_DIMENSION, false);
	oFF.DimensionType.PRESENTATION = oFF.DimensionType.createDimensionType("PresentationDimension", oFF.DimensionType.ATTRIBUTE_DIM, false);
	oFF.DimensionType.CONTAINER = oFF.DimensionType.createDimensionType("ContainerDimension", oFF.DimensionType.ATTRIBUTE_DIM, false);
	oFF.DimensionType.CALCULATED_DIMENSION = oFF.DimensionType.createDimensionType("CalculatedDimension", oFF.DimensionType.DIMENSION, true);
	oFF.DimensionType.FORMULA_CALCULATED_DIMENSION = oFF.DimensionType.createDimensionType("FormulaCalculatedDimension", oFF.DimensionType.CALCULATED_DIMENSION, true);
	oFF.DimensionType.FILTER_ACROSS_MODELS_CALCULATED_DIMENSION = oFF.DimensionType.createDimensionType("FamCalculatedDimension", oFF.DimensionType.FORMULA_CALCULATED_DIMENSION, true);
	oFF.DimensionType.MEASURE_BASED_FILTER_CALCULATED_DIMENSION = oFF.DimensionType.createDimensionType("MbfCalculatedDimension", oFF.DimensionType.FORMULA_CALCULATED_DIMENSION, true);
	oFF.DimensionType.DIMENSION_INCOMPLETE = oFF.DimensionType.createDimensionType("DimensionIncomplete", oFF.DimensionType.DIMENSION, false);
};
oFF.DimensionType.createDimensionType = function(name, parent, isValidForBlending)
{
	var newConstant = new oFF.DimensionType();
	newConstant.setupExt(name, parent);
	newConstant.m_isValidForBlending = isValidForBlending;
	return newConstant;
};
oFF.DimensionType.prototype.m_isValidForBlending = false;
oFF.DimensionType.prototype.isValidForBlending = function()
{
	return this.m_isValidForBlending;
};

oFF.FilterComponentType = function() {};
oFF.FilterComponentType.prototype = new oFF.OlapComponentType();
oFF.FilterComponentType.prototype._ff_c = "FilterComponentType";

oFF.FilterComponentType.BOOLEAN_ALGEBRA = null;
oFF.FilterComponentType.AND = null;
oFF.FilterComponentType.TUPLE = null;
oFF.FilterComponentType.OR = null;
oFF.FilterComponentType.NOT = null;
oFF.FilterComponentType.OPERATION = null;
oFF.FilterComponentType.DATE_RANGE_OPERATION = null;
oFF.FilterComponentType.CARTESIAN_LIST = null;
oFF.FilterComponentType.CONVERTED_TIME_CARTESIAN_LIST = null;
oFF.FilterComponentType.CARTESIAN_PRODUCT = null;
oFF.FilterComponentType.SPATIAL_FILTER = null;
oFF.FilterComponentType.VIRTUAL_DATASOURCE = null;
oFF.FilterComponentType.TRANSIENT_FILTER = null;
oFF.FilterComponentType.FILTER_MEASURE_BASED = null;
oFF.FilterComponentType.FILTER_ACROSS_MODELS = null;
oFF.FilterComponentType.FILTER_TIME_RANGE = null;
oFF.FilterComponentType.FILTER_DYNAMIC_TIME_REGULAR_RANGE = null;
oFF.FilterComponentType.FILTER_DYNAMIC_TIME_TO_DATE_RANGE = null;
oFF.FilterComponentType.FILTER_FIXED_TIME_RANGE = null;
oFF.FilterComponentType.staticSetup = function()
{
	oFF.FilterComponentType.OPERATION = oFF.FilterComponentType.create("Operation", oFF.OlapComponentType.FILTER_ELEMENT);
	oFF.FilterComponentType.BOOLEAN_ALGEBRA = oFF.FilterComponentType.create("BooleanAlgebra", oFF.OlapComponentType.FILTER_ELEMENT);
	oFF.FilterComponentType.OR = oFF.FilterComponentType.create("Or", oFF.FilterComponentType.BOOLEAN_ALGEBRA);
	oFF.FilterComponentType.AND = oFF.FilterComponentType.create("And", oFF.FilterComponentType.BOOLEAN_ALGEBRA);
	oFF.FilterComponentType.NOT = oFF.FilterComponentType.create("Not", oFF.FilterComponentType.BOOLEAN_ALGEBRA);
	oFF.FilterComponentType.TUPLE = oFF.FilterComponentType.create("Tuple", oFF.OlapComponentType.FILTER_ELEMENT);
	oFF.FilterComponentType.VIRTUAL_DATASOURCE = oFF.FilterComponentType.create("VirtualDatasource", oFF.OlapComponentType.FILTER_ELEMENT);
	oFF.FilterComponentType.TRANSIENT_FILTER = oFF.FilterComponentType.create("TransientFilter", oFF.OlapComponentType.FILTER_ELEMENT);
	oFF.FilterComponentType.FILTER_MEASURE_BASED = oFF.FilterComponentType.create("MeasureBasedFilter", oFF.FilterComponentType.TRANSIENT_FILTER);
	oFF.FilterComponentType.FILTER_ACROSS_MODELS = oFF.FilterComponentType.create("FilterAcrossModels", oFF.FilterComponentType.TRANSIENT_FILTER);
	oFF.FilterComponentType.FILTER_TIME_RANGE = oFF.FilterComponentType.create("AbstractDynamicTimeRangeFilter", oFF.FilterComponentType.TRANSIENT_FILTER);
	oFF.FilterComponentType.FILTER_DYNAMIC_TIME_REGULAR_RANGE = oFF.FilterComponentType.create("FilterDynamicTimeRegularRange", oFF.FilterComponentType.FILTER_TIME_RANGE);
	oFF.FilterComponentType.FILTER_DYNAMIC_TIME_TO_DATE_RANGE = oFF.FilterComponentType.create("FilterDynamicTimeToDateRange", oFF.FilterComponentType.FILTER_TIME_RANGE);
	oFF.FilterComponentType.FILTER_FIXED_TIME_RANGE = oFF.FilterComponentType.create("FilterFixedTimeToDateRange", oFF.FilterComponentType.FILTER_TIME_RANGE);
	oFF.FilterComponentType.DATE_RANGE_OPERATION = oFF.FilterComponentType.create("DateRangeOperation", oFF.FilterComponentType.OPERATION);
	oFF.FilterComponentType.CARTESIAN_PRODUCT = oFF.FilterComponentType.create("CartesianProduct", oFF.FilterComponentType.AND);
	oFF.FilterComponentType.CARTESIAN_LIST = oFF.FilterComponentType.create("CartesianList", oFF.FilterComponentType.OR);
	oFF.FilterComponentType.CONVERTED_TIME_CARTESIAN_LIST = oFF.FilterComponentType.create("ConvertedTimeCartesianList", oFF.FilterComponentType.CARTESIAN_LIST);
	oFF.FilterComponentType.SPATIAL_FILTER = oFF.FilterComponentType.create("Spatial", oFF.OlapComponentType.FILTER_ELEMENT);
};
oFF.FilterComponentType.create = function(name, parent)
{
	var newConstant = new oFF.FilterComponentType();
	newConstant.setupExt(name, parent);
	return newConstant;
};

oFF.FormulaOperator = function() {};
oFF.FormulaOperator.prototype = new oFF.OlapComponentType();
oFF.FormulaOperator.prototype._ff_c = "FormulaOperator";

oFF.FormulaOperator.MULTIPLICATION = null;
oFF.FormulaOperator.POWER_OF = null;
oFF.FormulaOperator.ADDITION = null;
oFF.FormulaOperator.SUBTRACTION = null;
oFF.FormulaOperator.DIVISION = null;
oFF.FormulaOperator.ABS = null;
oFF.FormulaOperator.AND = null;
oFF.FormulaOperator.CEIL = null;
oFF.FormulaOperator.EXP = null;
oFF.FormulaOperator.FLOOR = null;
oFF.FormulaOperator.GRAND_TOTAL = null;
oFF.FormulaOperator.LOG = null;
oFF.FormulaOperator.LOG_10 = null;
oFF.FormulaOperator.MIN = null;
oFF.FormulaOperator.MAX = null;
oFF.FormulaOperator.NOT = null;
oFF.FormulaOperator.OR = null;
oFF.FormulaOperator.ROUND = null;
oFF.FormulaOperator.SQRT = null;
oFF.FormulaOperator.NE = null;
oFF.FormulaOperator.LT = null;
oFF.FormulaOperator.LE = null;
oFF.FormulaOperator.EQ = null;
oFF.FormulaOperator.GT = null;
oFF.FormulaOperator.GE = null;
oFF.FormulaOperator.IF = null;
oFF.FormulaOperator.IN = null;
oFF.FormulaOperator.ISNULL = null;
oFF.FormulaOperator.MOD_MDS = null;
oFF.FormulaOperator.CELL_VALUE = null;
oFF.FormulaOperator.DECFLOAT = null;
oFF.FormulaOperator.STRING = null;
oFF.FormulaOperator.DOUBLE = null;
oFF.FormulaOperator.FLOAT = null;
oFF.FormulaOperator.HIERARCHYAGGREGATE = null;
oFF.FormulaOperator.INT = null;
oFF.FormulaOperator.MEMBERINDEX = null;
oFF.FormulaOperator.TRUNCATE = null;
oFF.FormulaOperator.MOD_BW = null;
oFF.FormulaOperator.NODIM = null;
oFF.FormulaOperator.SIN = null;
oFF.FormulaOperator.COS = null;
oFF.FormulaOperator.TAN = null;
oFF.FormulaOperator.ASIN = null;
oFF.FormulaOperator.ACOS = null;
oFF.FormulaOperator.ATAN = null;
oFF.FormulaOperator.SINH = null;
oFF.FormulaOperator.COSH = null;
oFF.FormulaOperator.TANH = null;
oFF.FormulaOperator.DIV = null;
oFF.FormulaOperator.FRAC = null;
oFF.FormulaOperator.MAX0 = null;
oFF.FormulaOperator.MIN0 = null;
oFF.FormulaOperator.SIGN = null;
oFF.FormulaOperator.DATE = null;
oFF.FormulaOperator.TIME = null;
oFF.FormulaOperator.NOERR = null;
oFF.FormulaOperator.NDIV0 = null;
oFF.FormulaOperator.PERCENT = null;
oFF.FormulaOperator.PERCENT_A = null;
oFF.FormulaOperator.XOR = null;
oFF.FormulaOperator.DELTA = null;
oFF.FormulaOperator.DIFF_NULL = null;
oFF.FormulaOperator.SIGN_FLIP = null;
oFF.FormulaOperator.MEMBERVALUE = null;
oFF.FormulaOperator.MDS_OPERATOR = null;
oFF.FormulaOperator.BW_OPERATOR = null;
oFF.FormulaOperator.staticSetup = function()
{
	oFF.FormulaOperator.MDS_OPERATOR = oFF.XList.create();
	oFF.FormulaOperator.BW_OPERATOR = oFF.XList.create();
	oFF.FormulaOperator.MULTIPLICATION = oFF.FormulaOperator.create("*", "Multiplication", oFF.TriStateBool._DEFAULT);
	oFF.FormulaOperator.POWER_OF = oFF.FormulaOperator.create("**", "Power of", oFF.TriStateBool._DEFAULT);
	oFF.FormulaOperator.ADDITION = oFF.FormulaOperator.create("+", "Addition", oFF.TriStateBool._DEFAULT);
	oFF.FormulaOperator.SUBTRACTION = oFF.FormulaOperator.create("-", "Subtraction / Negation", oFF.TriStateBool._DEFAULT);
	oFF.FormulaOperator.DIVISION = oFF.FormulaOperator.create("/", "Division", oFF.TriStateBool._DEFAULT);
	oFF.FormulaOperator.ABS = oFF.FormulaOperator.create("ABS", "Absolute Value", oFF.TriStateBool._DEFAULT);
	oFF.FormulaOperator.AND = oFF.FormulaOperator.create("AND", "Binary AND", oFF.TriStateBool._DEFAULT);
	oFF.FormulaOperator.CEIL = oFF.FormulaOperator.create("CEIL", "Round up", oFF.TriStateBool._DEFAULT);
	oFF.FormulaOperator.EXP = oFF.FormulaOperator.create("EXP", "Base-E exponential function", oFF.TriStateBool._DEFAULT);
	oFF.FormulaOperator.FLOOR = oFF.FormulaOperator.create("FLOOR", "Round down", oFF.TriStateBool._FALSE);
	oFF.FormulaOperator.GRAND_TOTAL = oFF.FormulaOperator.create("GT", "GrandTotal", oFF.TriStateBool._DEFAULT);
	oFF.FormulaOperator.LOG = oFF.FormulaOperator.create("LOG", "Natural Logarithm", oFF.TriStateBool._DEFAULT);
	oFF.FormulaOperator.LOG_10 = oFF.FormulaOperator.create("LOG10", "Common Logarithm", oFF.TriStateBool._DEFAULT);
	oFF.FormulaOperator.MIN = oFF.FormulaOperator.create("MIN", "Minimum", oFF.TriStateBool._DEFAULT);
	oFF.FormulaOperator.MAX = oFF.FormulaOperator.create("MAX", "Maximum", oFF.TriStateBool._DEFAULT);
	oFF.FormulaOperator.NOT = oFF.FormulaOperator.create("NOT", "Binary Negation", oFF.TriStateBool._DEFAULT);
	oFF.FormulaOperator.OR = oFF.FormulaOperator.create("OR", "Binary OR", oFF.TriStateBool._DEFAULT);
	oFF.FormulaOperator.ROUND = oFF.FormulaOperator.create("ROUND", "Round", oFF.TriStateBool._DEFAULT);
	oFF.FormulaOperator.SQRT = oFF.FormulaOperator.create("SQRT", "Square root", oFF.TriStateBool._DEFAULT);
	oFF.FormulaOperator.NE = oFF.FormulaOperator.create("!=", "Not equal", oFF.TriStateBool._FALSE);
	oFF.FormulaOperator.LT = oFF.FormulaOperator.create("<", "Less than", oFF.TriStateBool._DEFAULT);
	oFF.FormulaOperator.LE = oFF.FormulaOperator.create("<=", "Less or equal than", oFF.TriStateBool._DEFAULT);
	oFF.FormulaOperator.EQ = oFF.FormulaOperator.create("==", "Equal to", oFF.TriStateBool._DEFAULT);
	oFF.FormulaOperator.GT = oFF.FormulaOperator.create(">", "Greater than", oFF.TriStateBool._DEFAULT);
	oFF.FormulaOperator.GE = oFF.FormulaOperator.create(">=", "Greater or equal to", oFF.TriStateBool._DEFAULT);
	oFF.FormulaOperator.IF = oFF.FormulaOperator.create("IF", "if-then-else", oFF.TriStateBool._DEFAULT);
	oFF.FormulaOperator.IN = oFF.FormulaOperator.create("IN", "Contained in list", oFF.TriStateBool._FALSE);
	oFF.FormulaOperator.ISNULL = oFF.FormulaOperator.create("ISNULL", "Checks for NULL value", oFF.TriStateBool._FALSE);
	oFF.FormulaOperator.MOD_MDS = oFF.FormulaOperator.create("%", "Modulo", oFF.TriStateBool._FALSE);
	oFF.FormulaOperator.CELL_VALUE = oFF.FormulaOperator.create("CELLVALUE", "Cell value lookup", oFF.TriStateBool._FALSE);
	oFF.FormulaOperator.DECFLOAT = oFF.FormulaOperator.create("DECFLOAT", "Conversion to decfloat", oFF.TriStateBool._FALSE);
	oFF.FormulaOperator.STRING = oFF.FormulaOperator.create("STRING", "Conversion to string", oFF.TriStateBool._FALSE);
	oFF.FormulaOperator.DOUBLE = oFF.FormulaOperator.create("DOUBLE", "Conversion to double", oFF.TriStateBool._FALSE);
	oFF.FormulaOperator.FLOAT = oFF.FormulaOperator.create("FLOAT", "Conversion to float", oFF.TriStateBool._FALSE);
	oFF.FormulaOperator.HIERARCHYAGGREGATE = oFF.FormulaOperator.create("HIERARCHYAGGREGATE", "Member aggregation", oFF.TriStateBool._FALSE);
	oFF.FormulaOperator.INT = oFF.FormulaOperator.create("INT", "Conversion to int", oFF.TriStateBool._DEFAULT);
	oFF.FormulaOperator.MEMBERINDEX = oFF.FormulaOperator.create("MEMBERINDEX", "Member index", oFF.TriStateBool._FALSE);
	oFF.FormulaOperator.TRUNCATE = oFF.FormulaOperator.create("TRUNCATE", "Truncate", oFF.TriStateBool._DEFAULT);
	oFF.FormulaOperator.SIGN_FLIP = oFF.FormulaOperator.create("SIGNFLIP", "Sign Flip", oFF.TriStateBool._FALSE);
	oFF.FormulaOperator.MEMBERVALUE = oFF.FormulaOperator.create("MEMBERVALUE", "MemberValue", oFF.TriStateBool._FALSE);
	oFF.FormulaOperator.MOD_BW = oFF.FormulaOperator.create("MOD", "Modulo", oFF.TriStateBool._TRUE);
	oFF.FormulaOperator.NODIM = oFF.FormulaOperator.create("NODIM", "Values Without Dimensions / Units", oFF.TriStateBool._TRUE);
	oFF.FormulaOperator.SIN = oFF.FormulaOperator.create("SIN", "Sine", oFF.TriStateBool._TRUE);
	oFF.FormulaOperator.COS = oFF.FormulaOperator.create("COS", "Cosine", oFF.TriStateBool._TRUE);
	oFF.FormulaOperator.TAN = oFF.FormulaOperator.create("TAN", "Tangent", oFF.TriStateBool._TRUE);
	oFF.FormulaOperator.ASIN = oFF.FormulaOperator.create("ASIN", "Inverse Sine", oFF.TriStateBool._TRUE);
	oFF.FormulaOperator.ACOS = oFF.FormulaOperator.create("ACOS", "Inverse Cosine", oFF.TriStateBool._TRUE);
	oFF.FormulaOperator.ATAN = oFF.FormulaOperator.create("ATAN", "Inverse Tangent", oFF.TriStateBool._TRUE);
	oFF.FormulaOperator.SINH = oFF.FormulaOperator.create("SINH", "Hyperbolic Sine", oFF.TriStateBool._TRUE);
	oFF.FormulaOperator.COSH = oFF.FormulaOperator.create("COSH", "Hyperbolic Cosine", oFF.TriStateBool._TRUE);
	oFF.FormulaOperator.TANH = oFF.FormulaOperator.create("TANH", "Hyperbolic Tangent", oFF.TriStateBool._TRUE);
	oFF.FormulaOperator.DIV = oFF.FormulaOperator.create("DIV", "Division", oFF.TriStateBool._TRUE);
	oFF.FormulaOperator.FRAC = oFF.FormulaOperator.create("FRAC", "Keep only decimal places", oFF.TriStateBool._TRUE);
	oFF.FormulaOperator.MAX0 = oFF.FormulaOperator.create("MAX0", "Maximum or 0 if negativ", oFF.TriStateBool._TRUE);
	oFF.FormulaOperator.MIN0 = oFF.FormulaOperator.create("MIN1", "Minimum or 0 if negativ", oFF.TriStateBool._TRUE);
	oFF.FormulaOperator.SIGN = oFF.FormulaOperator.create("SIGN", "Int representation of sign", oFF.TriStateBool._TRUE);
	oFF.FormulaOperator.DATE = oFF.FormulaOperator.create("DATE", "Conversion to date", oFF.TriStateBool._TRUE);
	oFF.FormulaOperator.TIME = oFF.FormulaOperator.create("TIME", "Conversion to time", oFF.TriStateBool._TRUE);
	oFF.FormulaOperator.NOERR = oFF.FormulaOperator.create("NOERR", "Equal to 0 for undefined calculations, otherwise x", oFF.TriStateBool._TRUE);
	oFF.FormulaOperator.NDIV0 = oFF.FormulaOperator.create("NDIV0", "Equals 0 when divided by 0, otherwise x", oFF.TriStateBool._TRUE);
	oFF.FormulaOperator.PERCENT = oFF.FormulaOperator.create("%", "Percentage Deviation", oFF.TriStateBool._TRUE);
	oFF.FormulaOperator.PERCENT_A = oFF.FormulaOperator.create("%_A", "Percentage Amount with Signed Base Value", oFF.TriStateBool._TRUE);
	oFF.FormulaOperator.XOR = oFF.FormulaOperator.create("XOR", "Exlusive binary OR", oFF.TriStateBool._TRUE);
	oFF.FormulaOperator.DELTA = oFF.FormulaOperator.create("DELTA", "Delta Operator", oFF.TriStateBool._TRUE);
	oFF.FormulaOperator.DIFF_NULL = oFF.FormulaOperator.create("DIFF_NULL", "Diff0 Operator", oFF.TriStateBool._TRUE);
};
oFF.FormulaOperator.create = function(name, description, supportedOnlyByBw)
{
	var newOperator = oFF.XConstant.setupName(new oFF.FormulaOperator(), name);
	newOperator.m_description = description;
	if (supportedOnlyByBw === oFF.TriStateBool._TRUE)
	{
		oFF.FormulaOperator.BW_OPERATOR.add(newOperator);
	}
	else if (supportedOnlyByBw === oFF.TriStateBool._FALSE)
	{
		oFF.FormulaOperator.MDS_OPERATOR.add(newOperator);
	}
	else
	{
		oFF.FormulaOperator.BW_OPERATOR.add(newOperator);
		oFF.FormulaOperator.MDS_OPERATOR.add(newOperator);
	}
	return newOperator;
};
oFF.FormulaOperator.getSupportedFormulaOperator = function(systemType)
{
	if (systemType.isTypeOf(oFF.SystemType.BW))
	{
		return oFF.FormulaOperator.BW_OPERATOR;
	}
	if (systemType.isTypeOf(oFF.SystemType.HANA))
	{
		return oFF.FormulaOperator.MDS_OPERATOR;
	}
	return oFF.XList.create();
};
oFF.FormulaOperator.prototype.m_description = null;
oFF.FormulaOperator.prototype.getDescription = function()
{
	return this.m_description;
};

oFF.FormulaOperatorExt = function() {};
oFF.FormulaOperatorExt.prototype = new oFF.OlapComponentType();
oFF.FormulaOperatorExt.prototype._ff_c = "FormulaOperatorExt";

oFF.FormulaOperatorExt.IF = null;
oFF.FormulaOperatorExt.LOOKUP = null;
oFF.FormulaOperatorExt.RESTRICT = null;
oFF.FormulaOperatorExt.LOG = null;
oFF.FormulaOperatorExt.LOG10 = null;
oFF.FormulaOperatorExt.DECFLOAT = null;
oFF.FormulaOperatorExt.FLOAT = null;
oFF.FormulaOperatorExt.DOUBLE = null;
oFF.FormulaOperatorExt.INT = null;
oFF.FormulaOperatorExt.POWER = null;
oFF.FormulaOperatorExt.ABS = null;
oFF.FormulaOperatorExt.AND = null;
oFF.FormulaOperatorExt.OR = null;
oFF.FormulaOperatorExt.EQUAL = null;
oFF.FormulaOperatorExt.NOT_EQUAL = null;
oFF.FormulaOperatorExt.GREATER_THAN = null;
oFF.FormulaOperatorExt.LESS_THAN = null;
oFF.FormulaOperatorExt.GREATER_EQUAL = null;
oFF.FormulaOperatorExt.LESS_EQUAL = null;
oFF.FormulaOperatorExt.ADD = null;
oFF.FormulaOperatorExt.SUB = null;
oFF.FormulaOperatorExt.MULT = null;
oFF.FormulaOperatorExt.DIV = null;
oFF.FormulaOperatorExt.RESULTS_LOOKUP = null;
oFF.FormulaOperatorExt.MOD = null;
oFF.FormulaOperatorExt.SQRT = null;
oFF.FormulaOperatorExt.CEIL = null;
oFF.FormulaOperatorExt.FLOOR = null;
oFF.FormulaOperatorExt.ROUND = null;
oFF.FormulaOperatorExt.TRUNCATE = null;
oFF.FormulaOperatorExt.MAX_NUMBER = null;
oFF.FormulaOperatorExt.MIN_NUMBER = null;
oFF.FormulaOperatorExt.EXP = null;
oFF.FormulaOperatorExt.GRAND_TOTAL = null;
oFF.FormulaOperatorExt.PERCENTAGE_OF_GRAND_TOTAL = null;
oFF.FormulaOperatorExt.ISNULL = null;
oFF.FormulaOperatorExt.NOT = null;
oFF.FormulaOperatorExt.LENGTH = null;
oFF.FormulaOperatorExt.LIKE = null;
oFF.FormulaOperatorExt.SUBSTR = null;
oFF.FormulaOperatorExt.DATE_DIFF = null;
oFF.FormulaOperatorExt.CONCAT = null;
oFF.FormulaOperatorExt.FIRST = null;
oFF.FormulaOperatorExt.LAST = null;
oFF.FormulaOperatorExt.PREVIOUS = null;
oFF.FormulaOperatorExt.NEXT = null;
oFF.FormulaOperatorExt.CURRENT = null;
oFF.FormulaOperatorExt.LASTPERIODS = null;
oFF.FormulaOperatorExt.YOY = null;
oFF.FormulaOperatorExt.CAGR = null;
oFF.FormulaOperatorExt.SMA = null;
oFF.FormulaOperatorExt.CONVERT_NUMERIC = null;
oFF.FormulaOperatorExt.CONVERT_STRING = null;
oFF.FormulaOperatorExt.TRIM = null;
oFF.FormulaOperatorExt.UPPERCASE = null;
oFF.FormulaOperatorExt.LOWERCASE = null;
oFF.FormulaOperatorExt.FINDINDEX = null;
oFF.FormulaOperatorExt.ENDSWITH = null;
oFF.FormulaOperatorExt.LEFT = null;
oFF.FormulaOperatorExt.RIGHT = null;
oFF.FormulaOperatorExt.REPLACE = null;
oFF.FormulaOperatorExt.SPLIT = null;
oFF.FormulaOperatorExt.BW_BASELINE_OPERATORS_0 = null;
oFF.FormulaOperatorExt.MDS_BASELINE_OPERATORS_0 = null;
oFF.FormulaOperatorExt.MDS_BASELINE_OPERATORS_1 = null;
oFF.FormulaOperatorExt.MDS_BASELINE_OPERATORS_2 = null;
oFF.FormulaOperatorExt.MDS_BASELINE_OPERATORS_3 = null;
oFF.FormulaOperatorExt.MDS_BASELINE_OPERATORS_4 = null;
oFF.FormulaOperatorExt.MDS_BASELINE_OPERATORS_5 = null;
oFF.FormulaOperatorExt.MDS_BASELINE_OPERATORS_6 = null;
oFF.FormulaOperatorExt.UNV_BASELINE_OPERATORS_1 = null;
oFF.FormulaOperatorExt.UNV_BASELINE_OPERATORS_2 = null;
oFF.FormulaOperatorExt.UNV_BASELINE_OPERATORS_3 = null;
oFF.FormulaOperatorExt.UNV_BASELINE_OPERATORS_4 = null;
oFF.FormulaOperatorExt.UNV_BASELINE_OPERATORS_5 = null;
oFF.FormulaOperatorExt.staticSetup = function()
{
	oFF.FormulaOperatorExt.BW_BASELINE_OPERATORS_0 = oFF.XList.create();
	oFF.FormulaOperatorExt.MDS_BASELINE_OPERATORS_0 = oFF.XList.create();
	oFF.FormulaOperatorExt.MDS_BASELINE_OPERATORS_1 = oFF.XList.create();
	oFF.FormulaOperatorExt.MDS_BASELINE_OPERATORS_2 = oFF.XList.create();
	oFF.FormulaOperatorExt.MDS_BASELINE_OPERATORS_3 = oFF.XList.create();
	oFF.FormulaOperatorExt.MDS_BASELINE_OPERATORS_4 = oFF.XList.create();
	oFF.FormulaOperatorExt.MDS_BASELINE_OPERATORS_5 = oFF.XList.create();
	oFF.FormulaOperatorExt.MDS_BASELINE_OPERATORS_6 = oFF.XList.create();
	oFF.FormulaOperatorExt.UNV_BASELINE_OPERATORS_1 = oFF.XList.create();
	oFF.FormulaOperatorExt.UNV_BASELINE_OPERATORS_2 = oFF.XList.create();
	oFF.FormulaOperatorExt.UNV_BASELINE_OPERATORS_3 = oFF.XList.create();
	oFF.FormulaOperatorExt.UNV_BASELINE_OPERATORS_4 = oFF.XList.create();
	oFF.FormulaOperatorExt.UNV_BASELINE_OPERATORS_5 = oFF.XList.create();
	oFF.FormulaOperatorExt.IF = oFF.FormulaOperatorExt.create("IF", "if-then-else", 0, 0, 1);
	oFF.FormulaOperatorExt.LOOKUP = oFF.FormulaOperatorExt.create("LOOKUP", "lookup", 0, -1, -1);
	oFF.FormulaOperatorExt.RESTRICT = oFF.FormulaOperatorExt.create("RESTRICT", "restrict", 0, -1, -1);
	oFF.FormulaOperatorExt.LOG = oFF.FormulaOperatorExt.create("LOG", "Natural Logarithm", 0, 0, 1);
	oFF.FormulaOperatorExt.LOG10 = oFF.FormulaOperatorExt.create("LOG10", "Common Logarithm", 0, 0, 1);
	oFF.FormulaOperatorExt.DECFLOAT = oFF.FormulaOperatorExt.create("DECFLOAT", "Conversion to decfloat", 0, -1, 1);
	oFF.FormulaOperatorExt.FLOAT = oFF.FormulaOperatorExt.create("FLOAT", "Conversion to float", 0, -1, 1);
	oFF.FormulaOperatorExt.DOUBLE = oFF.FormulaOperatorExt.create("DOUBLE", "Conversion to double", 0, -1, 1);
	oFF.FormulaOperatorExt.INT = oFF.FormulaOperatorExt.create("INT", "Conversion to int", 0, 0, 1);
	oFF.FormulaOperatorExt.POWER = oFF.FormulaOperatorExt.create("**", "Power", 0, 0, 1);
	oFF.FormulaOperatorExt.ABS = oFF.FormulaOperatorExt.create("ABS", "Absolute Value", 0, 0, 1);
	oFF.FormulaOperatorExt.AND = oFF.FormulaOperatorExt.create("AND", "Binary AND", 0, -1, 1);
	oFF.FormulaOperatorExt.OR = oFF.FormulaOperatorExt.create("OR", "Binary OR", 0, -1, 1);
	oFF.FormulaOperatorExt.EQUAL = oFF.FormulaOperatorExt.create("==", "Equal to", 0, -1, 1);
	oFF.FormulaOperatorExt.NOT_EQUAL = oFF.FormulaOperatorExt.create("!=", "Not equal", 0, -1, 1);
	oFF.FormulaOperatorExt.GREATER_THAN = oFF.FormulaOperatorExt.create(">", "Greater than", 0, -1, 1);
	oFF.FormulaOperatorExt.LESS_THAN = oFF.FormulaOperatorExt.create("<", "Less than", 0, -1, 1);
	oFF.FormulaOperatorExt.GREATER_EQUAL = oFF.FormulaOperatorExt.create(">=", "Greater or equal to", 0, -1, 1);
	oFF.FormulaOperatorExt.LESS_EQUAL = oFF.FormulaOperatorExt.create("<=", "Less or equal to", 0, -1, 1);
	oFF.FormulaOperatorExt.ADD = oFF.FormulaOperatorExt.create("+", "Addition", 0, -1, 1);
	oFF.FormulaOperatorExt.SUB = oFF.FormulaOperatorExt.create("-", "Subtraction", 0, -1, 1);
	oFF.FormulaOperatorExt.MULT = oFF.FormulaOperatorExt.create("*", "Multiplication", 0, -1, 1);
	oFF.FormulaOperatorExt.DIV = oFF.FormulaOperatorExt.create("/", "Division", 0, -1, 1);
	oFF.FormulaOperatorExt.RESULTS_LOOKUP = oFF.FormulaOperatorExt.create("RESULTS_LOOKUP", "Results lookup", 1, -1, -1);
	oFF.FormulaOperatorExt.MOD = oFF.FormulaOperatorExt.create("MOD", "Modulo", 1, -1, -1);
	oFF.FormulaOperatorExt.SQRT = oFF.FormulaOperatorExt.create("SQRT", "Square root", 1, -1, -1);
	oFF.FormulaOperatorExt.CEIL = oFF.FormulaOperatorExt.create("CEIL", "Round up", 1, -1, -1);
	oFF.FormulaOperatorExt.FLOOR = oFF.FormulaOperatorExt.create("FLOOR", "Round down", 1, -1, -1);
	oFF.FormulaOperatorExt.ROUND = oFF.FormulaOperatorExt.create("ROUND", "Round", 1, -1, -1);
	oFF.FormulaOperatorExt.TRUNCATE = oFF.FormulaOperatorExt.create("TRUNCATE", "Truncate", 1, -1, -1);
	oFF.FormulaOperatorExt.MAX_NUMBER = oFF.FormulaOperatorExt.create("MAX", "Maximum number", 1, -1, -1);
	oFF.FormulaOperatorExt.MIN_NUMBER = oFF.FormulaOperatorExt.create("MIN", "Minimum number", 1, -1, -1);
	oFF.FormulaOperatorExt.EXP = oFF.FormulaOperatorExt.create("EXP", "Base-E exponential function", 1, -1, -1);
	oFF.FormulaOperatorExt.GRAND_TOTAL = oFF.FormulaOperatorExt.create("GrandTotal", "Grand total", 1, 0, 2);
	oFF.FormulaOperatorExt.PERCENTAGE_OF_GRAND_TOTAL = oFF.FormulaOperatorExt.create("PERCENTAGE_OF_GRAND_TOTAL", "Percentage of grand total", 1, 0, -1);
	oFF.FormulaOperatorExt.ISNULL = oFF.FormulaOperatorExt.create("ISNULL", "Checks for NULL value", 1, -1, 1);
	oFF.FormulaOperatorExt.NOT = oFF.FormulaOperatorExt.create("NOT", "Binary negation", 1, 0, 1);
	oFF.FormulaOperatorExt.LENGTH = oFF.FormulaOperatorExt.create("LENGTH", "Length function", 2, -1, 1);
	oFF.FormulaOperatorExt.LIKE = oFF.FormulaOperatorExt.create("LIKE", "Like function", 2, -1, 2);
	oFF.FormulaOperatorExt.SUBSTR = oFF.FormulaOperatorExt.create("SUBSTR", "Sub-String function", 2, -1, 1);
	oFF.FormulaOperatorExt.DATE_DIFF = oFF.FormulaOperatorExt.create("DATE_DIFF", "Date difference function", 2, -1, -1);
	oFF.FormulaOperatorExt.CONCAT = oFF.FormulaOperatorExt.create("CONCATENATE", "Concatenate", 2, -1, 4);
	oFF.FormulaOperatorExt.FIRST = oFF.FormulaOperatorExt.create("FIRST", "First", 2, -1, -1);
	oFF.FormulaOperatorExt.LAST = oFF.FormulaOperatorExt.create("LAST", "Last", 2, -1, -1);
	oFF.FormulaOperatorExt.PREVIOUS = oFF.FormulaOperatorExt.create("PREVIOUS", "Previous", 2, -1, -1);
	oFF.FormulaOperatorExt.NEXT = oFF.FormulaOperatorExt.create("NEXT", "Next", 2, -1, -1);
	oFF.FormulaOperatorExt.CURRENT = oFF.FormulaOperatorExt.create("CURRENT", "Current", 2, -1, -1);
	oFF.FormulaOperatorExt.LASTPERIODS = oFF.FormulaOperatorExt.create("LASTPERIODS", "Last periods", 2, -1, -1);
	oFF.FormulaOperatorExt.YOY = oFF.FormulaOperatorExt.create("YOY", "YOY", 2, -1, -1);
	oFF.FormulaOperatorExt.CAGR = oFF.FormulaOperatorExt.create("CAGR", "cagr", 2, -1, -1);
	oFF.FormulaOperatorExt.SMA = oFF.FormulaOperatorExt.create("SMA", "sma", 2, -1, -1);
	oFF.FormulaOperatorExt.CONVERT_NUMERIC = oFF.FormulaOperatorExt.create("CONVERT_NUMERIC", "Convert numeric", 3, -1, -1);
	oFF.FormulaOperatorExt.CONVERT_STRING = oFF.FormulaOperatorExt.create("CONVERT_STRING", "Convert string", 3, -1, -1);
	oFF.FormulaOperatorExt.TRIM = oFF.FormulaOperatorExt.create("TRIM", "Trim", 4, -1, 4);
	oFF.FormulaOperatorExt.UPPERCASE = oFF.FormulaOperatorExt.create("UPPERCASE", "Uppercase", 4, -1, 4);
	oFF.FormulaOperatorExt.LOWERCASE = oFF.FormulaOperatorExt.create("LOWERCASE", "Lowercase", 4, -1, 4);
	oFF.FormulaOperatorExt.FINDINDEX = oFF.FormulaOperatorExt.create("FINDINDEX", "Find index", 4, -1, 4);
	oFF.FormulaOperatorExt.ENDSWITH = oFF.FormulaOperatorExt.create("ENDSWITH", "Ends-With", 4, -1, 4);
	oFF.FormulaOperatorExt.LEFT = oFF.FormulaOperatorExt.create("LEFT", "Left", 4, -1, 4);
	oFF.FormulaOperatorExt.RIGHT = oFF.FormulaOperatorExt.create("RIGHT", "Right", 4, -1, 4);
	oFF.FormulaOperatorExt.REPLACE = oFF.FormulaOperatorExt.create("REPLACE", "Replace", 6, -1, 4);
	oFF.FormulaOperatorExt.SPLIT = oFF.FormulaOperatorExt.create("SPLIT", "Split", 6, -1, 4);
};
oFF.FormulaOperatorExt.create = function(name, description, mdsBaselineLogic, bwBaselineLogic, unvBaselineLogic)
{
	var newOperator = oFF.XConstant.setupName(new oFF.FormulaOperatorExt(), name);
	newOperator.m_description = description;
	if (bwBaselineLogic !== -1)
	{
		oFF.FormulaOperatorExt.BW_BASELINE_OPERATORS_0.add(newOperator);
	}
	if (mdsBaselineLogic !== -1)
	{
		oFF.FormulaOperatorExt._addMdsFormulaOperator(newOperator, mdsBaselineLogic);
	}
	if (unvBaselineLogic !== -1)
	{
		oFF.FormulaOperatorExt._addUnvFormulaOperator(newOperator, unvBaselineLogic);
	}
	return newOperator;
};
oFF.FormulaOperatorExt._addMdsFormulaOperator = function(newOperator, mdsBaselineLogic)
{
	if (mdsBaselineLogic === 0)
	{
		oFF.FormulaOperatorExt.MDS_BASELINE_OPERATORS_0.add(newOperator);
	}
	if (mdsBaselineLogic <= 1)
	{
		oFF.FormulaOperatorExt.MDS_BASELINE_OPERATORS_1.add(newOperator);
	}
	if (mdsBaselineLogic <= 2)
	{
		oFF.FormulaOperatorExt.MDS_BASELINE_OPERATORS_2.add(newOperator);
	}
	if (mdsBaselineLogic <= 3)
	{
		oFF.FormulaOperatorExt.MDS_BASELINE_OPERATORS_3.add(newOperator);
	}
	if (mdsBaselineLogic <= 4)
	{
		oFF.FormulaOperatorExt.MDS_BASELINE_OPERATORS_4.add(newOperator);
	}
	if (mdsBaselineLogic <= 5)
	{
		oFF.FormulaOperatorExt.MDS_BASELINE_OPERATORS_5.add(newOperator);
	}
	if (mdsBaselineLogic <= 6)
	{
		oFF.FormulaOperatorExt.MDS_BASELINE_OPERATORS_6.add(newOperator);
	}
};
oFF.FormulaOperatorExt._addUnvFormulaOperator = function(newOperator, unvBaselineLogic)
{
	if (unvBaselineLogic === 1)
	{
		oFF.FormulaOperatorExt.UNV_BASELINE_OPERATORS_1.add(newOperator);
	}
	if (unvBaselineLogic <= 2)
	{
		oFF.FormulaOperatorExt.UNV_BASELINE_OPERATORS_2.add(newOperator);
	}
	if (unvBaselineLogic <= 3)
	{
		oFF.FormulaOperatorExt.UNV_BASELINE_OPERATORS_3.add(newOperator);
	}
	if (unvBaselineLogic <= 4)
	{
		oFF.FormulaOperatorExt.UNV_BASELINE_OPERATORS_4.add(newOperator);
	}
	if (unvBaselineLogic <= 5)
	{
		oFF.FormulaOperatorExt.UNV_BASELINE_OPERATORS_5.add(newOperator);
	}
};
oFF.FormulaOperatorExt.getBaselineFormulaOperatorsExt = function(systemType, baselineLogic)
{
	if (systemType.isTypeOf(oFF.SystemType.BW))
	{
		return oFF.FormulaOperatorExt.BW_BASELINE_OPERATORS_0;
	}
	if (systemType.isTypeOf(oFF.SystemType.HANA))
	{
		switch (baselineLogic)
		{
			case 0:
				return oFF.FormulaOperatorExt.MDS_BASELINE_OPERATORS_0;

			case 1:
				return oFF.FormulaOperatorExt.MDS_BASELINE_OPERATORS_1;

			case 2:
				return oFF.FormulaOperatorExt.MDS_BASELINE_OPERATORS_2;

			case 3:
				return oFF.FormulaOperatorExt.MDS_BASELINE_OPERATORS_3;

			case 4:
				return oFF.FormulaOperatorExt.MDS_BASELINE_OPERATORS_4;

			case 5:
				return oFF.FormulaOperatorExt.MDS_BASELINE_OPERATORS_5;

			case 6:
				return oFF.FormulaOperatorExt.MDS_BASELINE_OPERATORS_6;

			case -2:
				return oFF.FormulaOperatorExt.MDS_BASELINE_OPERATORS_6;
		}
	}
	if (systemType.isTypeOf(oFF.SystemType.UNV))
	{
		switch (baselineLogic)
		{
			case 1:
				return oFF.FormulaOperatorExt.UNV_BASELINE_OPERATORS_1;

			case 2:
				return oFF.FormulaOperatorExt.UNV_BASELINE_OPERATORS_2;

			case 3:
				return oFF.FormulaOperatorExt.UNV_BASELINE_OPERATORS_3;

			case 4:
				return oFF.FormulaOperatorExt.UNV_BASELINE_OPERATORS_4;

			case 5:
				return oFF.FormulaOperatorExt.UNV_BASELINE_OPERATORS_5;

			case -2:
				return oFF.FormulaOperatorExt.UNV_BASELINE_OPERATORS_5;
		}
	}
	return oFF.XList.create();
};
oFF.FormulaOperatorExt.prototype.m_description = null;
oFF.FormulaOperatorExt.prototype.getDescription = function()
{
	return this.m_description;
};

oFF.MemberType = function() {};
oFF.MemberType.prototype = new oFF.OlapComponentType();
oFF.MemberType.prototype._ff_c = "MemberType";

oFF.MemberType.ABSTRACT_MEMBER = null;
oFF.MemberType.MEMBER = null;
oFF.MemberType.SINGLE_MEMBER_EXIT = null;
oFF.MemberType.MEMBER_EXITS = null;
oFF.MemberType.LITERAL_MEMBER = null;
oFF.MemberType.MEASURE = null;
oFF.MemberType.BASIC_MEASURE = null;
oFF.MemberType.CURRENCY_MEASURE = null;
oFF.MemberType.FORMULA = null;
oFF.MemberType.RUNNING_TOTAL = null;
oFF.MemberType.SERVER_BASED_FORMULA = null;
oFF.MemberType.RESTRICTED_MEASURE = null;
oFF.MemberType.VARIANCE = null;
oFF.MemberType.EXCEPTION_AGGREGATION = null;
oFF.MemberType.HIERARCHY_NODE = null;
oFF.MemberType.RESULT = null;
oFF.MemberType.CONDITION_RESULT = null;
oFF.MemberType.CONDITION_OTHERS_RESULT = null;
oFF.MemberType.DRILL_PATH_ELEMENT = null;
oFF.MemberType.SELECT_VALUE = null;
oFF.MemberType.FIELD_VALUE = null;
oFF.MemberType.VALUE_HELP_ELEMENT = null;
oFF.MemberType.VALUE_HELP_NODE = null;
oFF.MemberType.VALUE_HELP_SPLITTER_NODE = null;
oFF.MemberType.VALUE_HELP_WINDOW_SPLITTER_NODE = null;
oFF.MemberType.VALUE_HELP_ROOT_NODE = null;
oFF.MemberType.VALUE_HELP_LEAF = null;
oFF.MemberType.TUPLE_ELEMENT = null;
oFF.MemberType.TUPLE_ELEMENT_AS_MEMBER = null;
oFF.MemberType.TUPLE_ELEMENT_AS_NODE = null;
oFF.MemberType.s_instances = null;
oFF.MemberType._IS_NODE = true;
oFF.MemberType._IS_LEAF = false;
oFF.MemberType.BASIC_MEASURE_CODE = 1;
oFF.MemberType.RESTRICTED_MEASURE_CODE = 2;
oFF.MemberType.FORMULA_CODE = 4;
oFF.MemberType.EXCEPTION_AGGREGATION_CODE = 6;
oFF.MemberType.staticSetupMemberType = function()
{
	oFF.MemberType.ABSTRACT_MEMBER = oFF.MemberType.createMemberType("AbstractMember", oFF.OlapComponentType.DIMENSION_CONTEXT, false, oFF.MemberType._IS_LEAF, true, 3, false);
	oFF.MemberType.MEMBER = oFF.MemberType.createMemberType("Member", oFF.MemberType.ABSTRACT_MEMBER, false, oFF.MemberType._IS_LEAF, true, 3, false);
	oFF.MemberType.SINGLE_MEMBER_EXIT = oFF.MemberType.createMemberType("SingleMemberExit", oFF.MemberType.ABSTRACT_MEMBER, false, oFF.MemberType._IS_LEAF, true, 1, false);
	oFF.MemberType.MEMBER_EXITS = oFF.MemberType.createMemberType("MembersExit", oFF.MemberType.ABSTRACT_MEMBER, false, oFF.MemberType._IS_LEAF, false, 2, false);
	oFF.MemberType.LITERAL_MEMBER = oFF.MemberType.createMemberType("LiteralMember", oFF.MemberType.ABSTRACT_MEMBER, false, oFF.MemberType._IS_LEAF, false, 5, false);
	oFF.MemberType.MEASURE = oFF.MemberType.createMemberType("Measure", oFF.MemberType.ABSTRACT_MEMBER, false, oFF.MemberType._IS_LEAF, true, 4, false);
	oFF.MemberType.BASIC_MEASURE = oFF.MemberType.createMemberType("BasicMeasure", oFF.MemberType.MEASURE, false, oFF.MemberType._IS_LEAF, true, 4, false);
	oFF.MemberType.FORMULA = oFF.MemberType.createMemberType("FormulaMember", oFF.MemberType.MEASURE, false, oFF.MemberType._IS_LEAF, true, 4, true);
	oFF.MemberType.SERVER_BASED_FORMULA = oFF.MemberType.createMemberType("ServerBasedFormula", oFF.MemberType.ABSTRACT_MEMBER, false, oFF.MemberType._IS_LEAF, true, 4, false);
	oFF.MemberType.RESTRICTED_MEASURE = oFF.MemberType.createMemberType("RestrictedMeasure", oFF.MemberType.MEASURE, false, oFF.MemberType._IS_LEAF, true, 4, true);
	oFF.MemberType.VARIANCE = oFF.MemberType.createMemberType("Variance", oFF.MemberType.MEASURE, false, oFF.MemberType._IS_LEAF, true, 4, true);
	oFF.MemberType.EXCEPTION_AGGREGATION = oFF.MemberType.createMemberType("ExceptionAggregation", oFF.MemberType.MEASURE, false, oFF.MemberType._IS_LEAF, true, 4, true);
	oFF.MemberType.CURRENCY_MEASURE = oFF.MemberType.createMemberType("CurrencyMeasure", oFF.MemberType.MEASURE, false, oFF.MemberType._IS_LEAF, true, 4, true);
	oFF.MemberType.RUNNING_TOTAL = oFF.MemberType.createMemberType("RunningTotal", oFF.MemberType.MEASURE, false, oFF.MemberType._IS_LEAF, true, 4, true);
	oFF.MemberType.HIERARCHY_NODE = oFF.MemberType.createMemberType("HierarchyNode", oFF.MemberType.ABSTRACT_MEMBER, false, oFF.MemberType._IS_NODE, false, 6, false);
	oFF.MemberType.RESULT = oFF.MemberType.createMemberType("ResultMember", oFF.MemberType.ABSTRACT_MEMBER, true, oFF.MemberType._IS_LEAF, false, 12, false);
	oFF.MemberType.CONDITION_RESULT = oFF.MemberType.createMemberType("ConditionResult", oFF.MemberType.RESULT, true, oFF.MemberType._IS_LEAF, false, 10, false);
	oFF.MemberType.CONDITION_OTHERS_RESULT = oFF.MemberType.createMemberType("ConditionOthersResult", oFF.MemberType.RESULT, true, oFF.MemberType._IS_LEAF, false, 11, false);
	oFF.MemberType.DRILL_PATH_ELEMENT = oFF.MemberType.createMemberType("DrillPathElement", oFF.MemberType.ABSTRACT_MEMBER, false, oFF.MemberType._IS_LEAF, true, 0, false);
	oFF.MemberType.SELECT_VALUE = oFF.MemberType.createMemberType("SelectValue", oFF.MemberType.ABSTRACT_MEMBER, false, oFF.MemberType._IS_LEAF, false, 0, false);
	oFF.MemberType.FIELD_VALUE = oFF.MemberType.createMemberType("FieldValue", oFF.MemberType.FIELD_VALUE, false, oFF.MemberType._IS_LEAF, false, 0, false);
	oFF.MemberType.VALUE_HELP_ELEMENT = oFF.MemberType.createMemberType("ValueHelpElement", oFF.MemberType.ABSTRACT_MEMBER, false, oFF.MemberType._IS_NODE, true, 0, false);
	oFF.MemberType.VALUE_HELP_NODE = oFF.MemberType.createMemberType("ValueHelpNode", oFF.MemberType.VALUE_HELP_ELEMENT, false, oFF.MemberType._IS_NODE, true, 0, false);
	oFF.MemberType.VALUE_HELP_SPLITTER_NODE = oFF.MemberType.createMemberType("ValueHelpSplitterNode", oFF.MemberType.VALUE_HELP_NODE, false, oFF.MemberType._IS_NODE, true, 0, false);
	oFF.MemberType.VALUE_HELP_WINDOW_SPLITTER_NODE = oFF.MemberType.createMemberType("ValueHelpWindowSplitterNode", oFF.MemberType.VALUE_HELP_SPLITTER_NODE, false, oFF.MemberType._IS_NODE, true, 0, false);
	oFF.MemberType.VALUE_HELP_ROOT_NODE = oFF.MemberType.createMemberType("ValueHelpRootNode", oFF.MemberType.VALUE_HELP_NODE, false, oFF.MemberType._IS_NODE, true, 0, false);
	oFF.MemberType.VALUE_HELP_LEAF = oFF.MemberType.createMemberType("ValueHelpLeaf", oFF.MemberType.VALUE_HELP_ELEMENT, false, oFF.MemberType._IS_LEAF, true, 0, false);
	oFF.MemberType.TUPLE_ELEMENT = oFF.MemberType.createMemberType("TupleElement", oFF.MemberType.ABSTRACT_MEMBER, false, oFF.MemberType._IS_LEAF, true, 0, false);
	oFF.MemberType.TUPLE_ELEMENT_AS_MEMBER = oFF.MemberType.createMemberType("TupleElementAsMember", oFF.MemberType.TUPLE_ELEMENT, true, oFF.MemberType._IS_LEAF, true, 0, false);
	oFF.MemberType.TUPLE_ELEMENT_AS_NODE = oFF.MemberType.createMemberType("TupleElementAsNode", oFF.MemberType.TUPLE_ELEMENT, true, oFF.MemberType._IS_NODE, true, 0, false);
};
oFF.MemberType.createMemberType = function(constant, parentType, result, node, singleMember, sortOrder, isCustomMember)
{
	var mt = new oFF.MemberType();
	mt.setupExt(constant, parentType);
	mt.m_isNode = node;
	mt.m_isResult = result;
	mt.m_sortOrder = sortOrder;
	mt.m_singleMember = singleMember;
	mt.m_isCustomMember = isCustomMember;
	if (oFF.isNull(oFF.MemberType.s_instances))
	{
		oFF.MemberType.s_instances = oFF.XHashMapByString.create();
	}
	oFF.MemberType.s_instances.put(constant, mt);
	return mt;
};
oFF.MemberType.get = function(name)
{
	return oFF.MemberType.s_instances.getByKey(name);
};
oFF.MemberType.getSupportedMembersForCode = function(memberCode)
{
	var supportdMembers = oFF.XList.create();
	if (oFF.XMath.binaryAnd(memberCode, oFF.MemberType.BASIC_MEASURE_CODE) > 0)
	{
		supportdMembers.add(oFF.MemberType.BASIC_MEASURE);
	}
	if (oFF.XMath.binaryAnd(memberCode, oFF.MemberType.RESTRICTED_MEASURE_CODE) > 0)
	{
		supportdMembers.add(oFF.MemberType.RESTRICTED_MEASURE);
	}
	if (oFF.XMath.binaryAnd(memberCode, oFF.MemberType.FORMULA_CODE) > 0)
	{
		supportdMembers.add(oFF.MemberType.FORMULA);
	}
	if (oFF.XMath.binaryAnd(memberCode, oFF.MemberType.EXCEPTION_AGGREGATION_CODE) > 0)
	{
		supportdMembers.add(oFF.MemberType.EXCEPTION_AGGREGATION);
	}
	return supportdMembers;
};
oFF.MemberType.prototype.m_isNode = false;
oFF.MemberType.prototype.m_singleMember = false;
oFF.MemberType.prototype.m_isResult = false;
oFF.MemberType.prototype.m_sortOrder = 0;
oFF.MemberType.prototype.m_isCustomMember = false;
oFF.MemberType.prototype.isNode = function()
{
	return this.m_isNode;
};
oFF.MemberType.prototype.isLeaf = function()
{
	return !this.m_isNode;
};
oFF.MemberType.prototype.isSingleMember = function()
{
	return this.m_singleMember;
};
oFF.MemberType.prototype.isResult = function()
{
	return this.m_isResult;
};
oFF.MemberType.prototype.isArtificial = function()
{
	return !(this.m_isNode || this === oFF.MemberType.MEMBER || this === oFF.MemberType.SERVER_BASED_FORMULA);
};
oFF.MemberType.prototype.getSortOrder = function()
{
	return this.m_sortOrder;
};
oFF.MemberType.prototype.isCustomMember = function()
{
	return this.m_isCustomMember;
};

oFF.OlapProperty = function() {};
oFF.OlapProperty.prototype = new oFF.OlapComponentType();
oFF.OlapProperty.prototype._ff_c = "OlapProperty";

oFF.OlapProperty.NAME = null;
oFF.OlapProperty.TEXT = null;
oFF.OlapProperty.DATASOURCE = null;
oFF.OlapProperty.SIGN_PRESENTATION = null;
oFF.OlapProperty.RESULT_ALIGNMENT = null;
oFF.OlapProperty.LOWER_LEVEL_NODE_ALIGNMENT = null;
oFF.OlapProperty.staticSetup = function()
{
	oFF.OlapProperty.NAME = oFF.OlapProperty.create("Name");
	oFF.OlapProperty.TEXT = oFF.OlapProperty.create("Text");
	oFF.OlapProperty.DATASOURCE = oFF.OlapProperty.create("Datasource");
	oFF.OlapProperty.SIGN_PRESENTATION = oFF.OlapProperty.create("SignPresentation");
	oFF.OlapProperty.RESULT_ALIGNMENT = oFF.OlapProperty.create("ResultAlignment");
	oFF.OlapProperty.LOWER_LEVEL_NODE_ALIGNMENT = oFF.OlapProperty.create("LowerLevelNodeAlignment");
};
oFF.OlapProperty.create = function(name)
{
	var newConstant = new oFF.OlapProperty();
	newConstant.setupExt(name, oFF.OlapComponentType.PROPERTY);
	return newConstant;
};

oFF.SpatialComparisonOperator = function() {};
oFF.SpatialComparisonOperator.prototype = new oFF.ComparisonOperator();
oFF.SpatialComparisonOperator.prototype._ff_c = "SpatialComparisonOperator";

oFF.SpatialComparisonOperator.CONTAINS = null;
oFF.SpatialComparisonOperator.INTERSECTS = null;
oFF.SpatialComparisonOperator.INTERSECTS_RECT = null;
oFF.SpatialComparisonOperator.COVERS = null;
oFF.SpatialComparisonOperator.CROSSES = null;
oFF.SpatialComparisonOperator.DISJOINT = null;
oFF.SpatialComparisonOperator.OVERLAPS = null;
oFF.SpatialComparisonOperator.TOUCHES = null;
oFF.SpatialComparisonOperator.WITHIN = null;
oFF.SpatialComparisonOperator.WITHIN_DISTANCE = null;
oFF.SpatialComparisonOperator._SPATIAL = null;
oFF.SpatialComparisonOperator.staticSetupSpatialComparisonOps = function()
{
	oFF.SpatialComparisonOperator._SPATIAL = oFF.SpatialComparisonOperator.createSpatialComparison("SPATIAL", "SPATIAL", 0);
	oFF.SpatialComparisonOperator.CONTAINS = oFF.SpatialComparisonOperator.createSpatialComparison("CONTAINS", "contains", 1);
	oFF.SpatialComparisonOperator.INTERSECTS = oFF.SpatialComparisonOperator.createSpatialComparison("INTERSECTS", "intersects", 1);
	oFF.SpatialComparisonOperator.INTERSECTS_RECT = oFF.SpatialComparisonOperator.createSpatialComparison("INTERSECTS_RECT", "intersectsRect", 2);
	oFF.SpatialComparisonOperator.COVERS = oFF.SpatialComparisonOperator.createSpatialComparison("COVERS", "covers", 1);
	oFF.SpatialComparisonOperator.CROSSES = oFF.SpatialComparisonOperator.createSpatialComparison("CROSSES", "crosses", 1);
	oFF.SpatialComparisonOperator.DISJOINT = oFF.SpatialComparisonOperator.createSpatialComparison("DISJOINT", "disjoint", 1);
	oFF.SpatialComparisonOperator.OVERLAPS = oFF.SpatialComparisonOperator.createSpatialComparison("OVERLAPS", "overlaps", 1);
	oFF.SpatialComparisonOperator.TOUCHES = oFF.SpatialComparisonOperator.createSpatialComparison("TOUCHES", "touches", 1);
	oFF.SpatialComparisonOperator.WITHIN = oFF.SpatialComparisonOperator.createSpatialComparison("WITHIN", "within", 1);
	oFF.SpatialComparisonOperator.WITHIN_DISTANCE = oFF.SpatialComparisonOperator.createSpatialComparison("WITHIN_DISTANCE", "withinDistance", 3);
};
oFF.SpatialComparisonOperator.createSpatialComparison = function(name, displayString, numberOfParameters)
{
	var newConstant = new oFF.SpatialComparisonOperator();
	newConstant.setupOperator(oFF.SpatialComparisonOperator._SPATIAL, name, displayString, numberOfParameters, oFF.Operator.GRAVITY_3, true);
	return newConstant;
};

oFF.VariableType = function() {};
oFF.VariableType.prototype = new oFF.OlapComponentType();
oFF.VariableType.prototype._ff_c = "VariableType";

oFF.VariableType.SIMPLE_TYPE_VARIABLE = null;
oFF.VariableType.TEXT_VARIABLE = null;
oFF.VariableType.FORMULA_VARIABLE = null;
oFF.VariableType.DIMENSION_MEMBER_VARIABLE = null;
oFF.VariableType.HIERARCHY_NODE_VARIABLE = null;
oFF.VariableType.HIERARCHY_NAME_VARIABLE = null;
oFF.VariableType.OPTION_LIST_VARIABLE = null;
oFF.VariableType.HIERARCHY_VARIABLE = null;
oFF.VariableType.ANY_VARIABLE = null;
oFF.VariableType.staticSetup = function()
{
	oFF.VariableType.ANY_VARIABLE = oFF.VariableType.create("AnyVariable", oFF.OlapComponentType.VARIABLE_CONTEXT);
	oFF.VariableType.SIMPLE_TYPE_VARIABLE = oFF.VariableType.create("SimpleTypeVariable", oFF.VariableType.ANY_VARIABLE);
	oFF.VariableType.TEXT_VARIABLE = oFF.VariableType.create("TextVariable", oFF.VariableType.SIMPLE_TYPE_VARIABLE);
	oFF.VariableType.FORMULA_VARIABLE = oFF.VariableType.create("FormulaVariable", oFF.VariableType.SIMPLE_TYPE_VARIABLE);
	oFF.VariableType.DIMENSION_MEMBER_VARIABLE = oFF.VariableType.create("DimensionMemberVariable", oFF.VariableType.ANY_VARIABLE);
	oFF.VariableType.HIERARCHY_NODE_VARIABLE = oFF.VariableType.create("HierarchyNodeVariable", oFF.VariableType.DIMENSION_MEMBER_VARIABLE);
	oFF.VariableType.HIERARCHY_NAME_VARIABLE = oFF.VariableType.create("HierarchyNameVariable", oFF.VariableType.DIMENSION_MEMBER_VARIABLE);
	oFF.VariableType.OPTION_LIST_VARIABLE = oFF.VariableType.create("OptionListVariable", oFF.VariableType.ANY_VARIABLE);
	oFF.VariableType.HIERARCHY_VARIABLE = oFF.VariableType.create("HierarchyVariable", oFF.VariableType.OPTION_LIST_VARIABLE);
};
oFF.VariableType.create = function(name, parentType)
{
	var object = new oFF.VariableType();
	object.setupExt(name, parentType);
	return object;
};

oFF.VisualizationAxisType = function() {};
oFF.VisualizationAxisType.prototype = new oFF.OlapComponentType();
oFF.VisualizationAxisType.prototype._ff_c = "VisualizationAxisType";

oFF.VisualizationAxisType.COLUMN_GROUPS = null;
oFF.VisualizationAxisType.ROW_GROUPS = null;
oFF.VisualizationAxisType.CATEGORY_X = null;
oFF.VisualizationAxisType.CATEGORY_Y = null;
oFF.VisualizationAxisType.COLOR = null;
oFF.VisualizationAxisType.TEXTURE = null;
oFF.VisualizationAxisType.SHAPE = null;
oFF.VisualizationAxisType.TIME = null;
oFF.VisualizationAxisType.CONTEXT = null;
oFF.VisualizationAxisType.DISTRIBUTION = null;
oFF.VisualizationAxisType.s_all = null;
oFF.VisualizationAxisType.staticSetup = function()
{
	oFF.VisualizationAxisType.s_all = oFF.XSetOfNameObject.create();
	oFF.VisualizationAxisType.COLUMN_GROUPS = oFF.VisualizationAxisType.create("ColumnGroupsAxis");
	oFF.VisualizationAxisType.ROW_GROUPS = oFF.VisualizationAxisType.create("RowGroupsAxis");
	oFF.VisualizationAxisType.CATEGORY_X = oFF.VisualizationAxisType.create("CategoryXAxis");
	oFF.VisualizationAxisType.CATEGORY_Y = oFF.VisualizationAxisType.create("CategoryYAxis");
	oFF.VisualizationAxisType.COLOR = oFF.VisualizationAxisType.create("ColorAxis");
	oFF.VisualizationAxisType.TEXTURE = oFF.VisualizationAxisType.create("TextureAxis");
	oFF.VisualizationAxisType.SHAPE = oFF.VisualizationAxisType.create("ShapeAxis");
	oFF.VisualizationAxisType.TIME = oFF.VisualizationAxisType.create("TimeAxis");
	oFF.VisualizationAxisType.CONTEXT = oFF.VisualizationAxisType.create("ContextAxis");
	oFF.VisualizationAxisType.DISTRIBUTION = oFF.VisualizationAxisType.create("DistributionAxis");
};
oFF.VisualizationAxisType.create = function(name)
{
	var newConstant = new oFF.VisualizationAxisType();
	newConstant.setupAxis(name);
	oFF.VisualizationAxisType.s_all.add(newConstant);
	return newConstant;
};
oFF.VisualizationAxisType.getAll = function()
{
	return oFF.VisualizationAxisType.s_all.getValuesAsReadOnlyList();
};
oFF.VisualizationAxisType.lookup = function(name)
{
	return oFF.VisualizationAxisType.s_all.getByKey(name);
};
oFF.VisualizationAxisType.prototype.setupAxis = function(name)
{
	oFF.OlapComponentType.prototype.setupExt.call( this , name, oFF.OlapComponentType.VISUALIZATION_AXIS);
};

oFF.VisualizationCategoryType = function() {};
oFF.VisualizationCategoryType.prototype = new oFF.OlapComponentType();
oFF.VisualizationCategoryType.prototype._ff_c = "VisualizationCategoryType";

oFF.VisualizationCategoryType.COLOR = null;
oFF.VisualizationCategoryType.TEXTURE = null;
oFF.VisualizationCategoryType.SHAPE = null;
oFF.VisualizationCategoryType.s_all = null;
oFF.VisualizationCategoryType.staticSetup = function()
{
	oFF.VisualizationCategoryType.s_all = oFF.XSetOfNameObject.create();
	oFF.VisualizationCategoryType.COLOR = oFF.VisualizationCategoryType.create("ColorAxis");
	oFF.VisualizationCategoryType.TEXTURE = oFF.VisualizationCategoryType.create("TextureAxis");
	oFF.VisualizationCategoryType.SHAPE = oFF.VisualizationCategoryType.create("ShapeAxis");
};
oFF.VisualizationCategoryType.create = function(name)
{
	var newConstant = new oFF.VisualizationCategoryType();
	newConstant.setupAxis(name);
	oFF.VisualizationCategoryType.s_all.add(newConstant);
	return newConstant;
};
oFF.VisualizationCategoryType.getAll = function()
{
	return oFF.VisualizationCategoryType.s_all.getValuesAsReadOnlyList();
};
oFF.VisualizationCategoryType.lookup = function(name)
{
	return oFF.VisualizationCategoryType.s_all.getByKey(name);
};
oFF.VisualizationCategoryType.prototype.setupAxis = function(name)
{
	oFF.OlapComponentType.prototype.setupExt.call( this , name, oFF.OlapComponentType.VISUALIZATION_CATEGORY);
};

oFF.VisualizationValueType = function() {};
oFF.VisualizationValueType.prototype = new oFF.OlapComponentType();
oFF.VisualizationValueType.prototype._ff_c = "VisualizationValueType";

oFF.VisualizationValueType.VALUE = null;
oFF.VisualizationValueType.VALUE_B = null;
oFF.VisualizationValueType.VALUE_C = null;
oFF.VisualizationValueType.VALUE_VARIANCE = null;
oFF.VisualizationValueType.VALUE_VARIANCE_B = null;
oFF.VisualizationValueType.VALUE_VARIANCE_C = null;
oFF.VisualizationValueType.VALUE_X = null;
oFF.VisualizationValueType.VALUE_Y = null;
oFF.VisualizationValueType.VALUE_Z = null;
oFF.VisualizationValueType.WEIGHT = null;
oFF.VisualizationValueType.SIZE = null;
oFF.VisualizationValueType.COLOR = null;
oFF.VisualizationValueType.TARGET = null;
oFF.VisualizationValueType.REFERENCE = null;
oFF.VisualizationValueType.ERROR_MIN = null;
oFF.VisualizationValueType.ERROR_MAX = null;
oFF.VisualizationValueType.IDEAL_MIN = null;
oFF.VisualizationValueType.IDEAL_MAX = null;
oFF.VisualizationValueType.GOOD_MIN = null;
oFF.VisualizationValueType.GOOD_MAX = null;
oFF.VisualizationValueType.BAD_MIN = null;
oFF.VisualizationValueType.BAD_MAX = null;
oFF.VisualizationValueType.CRITICAL_MIN = null;
oFF.VisualizationValueType.CRITICAL_MAX = null;
oFF.VisualizationValueType.TOOL_TIP = null;
oFF.VisualizationValueType.s_all = null;
oFF.VisualizationValueType.staticSetup = function()
{
	oFF.VisualizationValueType.s_all = oFF.XSetOfNameObject.create();
	oFF.VisualizationValueType.VALUE = oFF.VisualizationValueType.create("Value");
	oFF.VisualizationValueType.VALUE_B = oFF.VisualizationValueType.create("ValueB");
	oFF.VisualizationValueType.VALUE_C = oFF.VisualizationValueType.create("ValueC");
	oFF.VisualizationValueType.VALUE_VARIANCE = oFF.VisualizationValueType.create("ValueVariance");
	oFF.VisualizationValueType.VALUE_VARIANCE_B = oFF.VisualizationValueType.create("ValueVarianceB");
	oFF.VisualizationValueType.VALUE_VARIANCE_C = oFF.VisualizationValueType.create("ValueVarianceC");
	oFF.VisualizationValueType.VALUE_X = oFF.VisualizationValueType.create("ValueX");
	oFF.VisualizationValueType.VALUE_Y = oFF.VisualizationValueType.create("ValueY");
	oFF.VisualizationValueType.VALUE_Z = oFF.VisualizationValueType.create("ValueZ");
	oFF.VisualizationValueType.WEIGHT = oFF.VisualizationValueType.create("Weight");
	oFF.VisualizationValueType.COLOR = oFF.VisualizationValueType.create("Color");
	oFF.VisualizationValueType.SIZE = oFF.VisualizationValueType.create("Size");
	oFF.VisualizationValueType.TARGET = oFF.VisualizationValueType.create("Target");
	oFF.VisualizationValueType.REFERENCE = oFF.VisualizationValueType.create("Reference");
	oFF.VisualizationValueType.ERROR_MIN = oFF.VisualizationValueType.create("ErrorMin");
	oFF.VisualizationValueType.ERROR_MAX = oFF.VisualizationValueType.create("ErrorMax");
	oFF.VisualizationValueType.IDEAL_MIN = oFF.VisualizationValueType.create("IdealMin");
	oFF.VisualizationValueType.IDEAL_MAX = oFF.VisualizationValueType.create("IdealMax");
	oFF.VisualizationValueType.GOOD_MIN = oFF.VisualizationValueType.create("GoodMin");
	oFF.VisualizationValueType.GOOD_MAX = oFF.VisualizationValueType.create("GoodMax");
	oFF.VisualizationValueType.BAD_MIN = oFF.VisualizationValueType.create("BadMin");
	oFF.VisualizationValueType.BAD_MAX = oFF.VisualizationValueType.create("BadMax");
	oFF.VisualizationValueType.CRITICAL_MIN = oFF.VisualizationValueType.create("CriticalMin");
	oFF.VisualizationValueType.CRITICAL_MAX = oFF.VisualizationValueType.create("CriticalMax");
	oFF.VisualizationValueType.TOOL_TIP = oFF.VisualizationValueType.create("ToolTip");
};
oFF.VisualizationValueType.create = function(name)
{
	var newConstant = new oFF.VisualizationValueType();
	newConstant.setupAxis(name);
	oFF.VisualizationValueType.s_all.add(newConstant);
	return newConstant;
};
oFF.VisualizationValueType.getAll = function()
{
	return oFF.VisualizationValueType.s_all.getValuesAsReadOnlyList();
};
oFF.VisualizationValueType.lookup = function(name)
{
	return oFF.VisualizationValueType.s_all.getByKey(name);
};
oFF.VisualizationValueType.prototype.setupAxis = function(name)
{
	oFF.OlapComponentType.prototype.setupExt.call( this , name, oFF.OlapComponentType.VISUALIZATION_VALUE);
};

oFF.OlapApiModule = function() {};
oFF.OlapApiModule.prototype = new oFF.DfModule();
oFF.OlapApiModule.prototype._ff_c = "OlapApiModule";

oFF.OlapApiModule.AGGREGATION_LEVEL_FACTORY = "AGGREGATION_LEVEL_FACTORY";
oFF.OlapApiModule.XS_QUERY_CONSUMER = "QUERY_CONSUMER";
oFF.OlapApiModule.SERVICE_TYPE_QUERY_CONSUMER = null;
oFF.OlapApiModule.XS_HIERARCHY_CATALOG = "HIERARCHY_CATALOG";
oFF.OlapApiModule.SERVICE_TYPE_HIERARCHY_CATALOG = null;
oFF.OlapApiModule.XS_PLANNING = "PLANNING";
oFF.OlapApiModule.SERVICE_TYPE_PLANNING = null;
oFF.OlapApiModule.s_module = null;
oFF.OlapApiModule.getInstance = function()
{
	if (oFF.isNull(oFF.OlapApiModule.s_module))
	{
		oFF.DfModule.checkInitialized(oFF.RuntimeModule.getInstance());
		oFF.OlapApiModule.s_module = oFF.DfModule.startExt(new oFF.OlapApiModule());
		oFF.OlapComponentType.staticSetupOlapType();
		oFF.Operator.staticSetup();
		oFF.OlapProperty.staticSetup();
		oFF.FormulaOperator.staticSetup();
		oFF.FormulaOperatorExt.staticSetup();
		oFF.AlertCategory.staticSetup();
		oFF.AlertLevel.staticSetup();
		oFF.AxisType.staticSetup();
		oFF.ClusterAlgorithm.staticSetup();
		oFF.JoinType.staticSetup();
		oFF.JoinCardinality.staticSetup();
		oFF.ZeroSuppressionType.staticSetup();
		oFF.DrillState.staticSetup();
		oFF.ResultSetType.staticSetup();
		oFF.DimensionType.staticSetupDimensionType();
		oFF.DimensionVisibility.staticSetup();
		oFF.ExceptionSetting.staticSetup();
		oFF.ExecutionEngine.staticSetup();
		oFF.PresentationType.staticSetupPresentation();
		oFF.PresentationSelect.staticSetup();
		oFF.InfoObjectType.staticSetupInfoObject();
		oFF.VisibilityType.staticSetupVisibility();
		oFF.LocalityType.staticSetupLocality();
		oFF.UsageShapeType.staticSetupUsageShapey();
		oFF.HierarchyLevelType.staticSetup();
		oFF.CurrentMemberFunction.staticSetup();
		oFF.AggregationType.staticSetup();
		oFF.ProcessingStep.staticSetup();
		oFF.ObtainabilityType.staticSetup();
		oFF.ActionChoice.staticSetup();
		oFF.TextTransformationType.staticSetup();
		oFF.QExceptionEvalType.staticSetup();
		oFF.QExceptionHeaderSettings.staticSetup();
		oFF.MemberType.staticSetupMemberType();
		oFF.QContextType.staticSetup();
		oFF.ProviderType.staticSetup();
		oFF.MetaObjectType.staticSetup();
		oFF.AssignOperator.staticSetupAssignOps();
		oFF.ComparisonOperator.staticSetupComparisonOps();
		oFF.SpatialComparisonOperator.staticSetupSpatialComparisonOps();
		oFF.LogicalBoolOperator.staticSetupLogicalOps();
		oFF.MathOperator.staticSetupMathOps();
		oFF.RunningTotalOperator.staticSetupRunningTotalOperators();
		oFF.SetSign.staticSetup();
		oFF.ResultSetState.staticSetup();
		oFF.SingleValueCalculation.staticSetup();
		oFF.ResultCalculation.staticSetup();
		oFF.QMemberReadMode.staticSetup();
		oFF.FilterComponentType.staticSetup();
		oFF.ValueException.staticSetup();
		oFF.SortType.staticSetup();
		oFF.ResultSetEncoding.staticSetup();
		oFF.ReorderingCapability.staticSetup();
		oFF.QModelLevel.staticSetup();
		oFF.QModelOrigin.staticSetup();
		oFF.DrillOperationType.staticSetup();
		oFF.QSetSignComparisonOperatorGroup.staticSetup();
		oFF.FieldLayoutType.staticSetup();
		oFF.Alignment.staticSetup();
		oFF.DisaggregationMode.staticSetup();
		oFF.DocumentsRequestAction.staticSetup();
		oFF.DocumentsIdsAction.staticSetup();
		oFF.DocumentsIdsScope.staticSetup();
		oFF.DocumentsSupportType.staticSetup();
		oFF.QModelFormat.staticSetupModelFormat();
		oFF.QueryFilterUsage.staticSetup();
		oFF.DimensionSearchMode.staticSetup();
		oFF.FieldUsageType.staticSetup();
		oFF.QueryManagerMode.staticSetup();
		oFF.QueryCloneMode.staticSetup();
		oFF.VariableMode.staticSetup();
		oFF.InputReadinessType.staticSetup();
		oFF.DataEntryProcessingType.staticSetup();
		oFF.FilterLayer.staticSetup();
		oFF.FilterScopeVariables.staticSetup();
		oFF.QueryPreparatorFactory.staticSetup();
		oFF.CustomSortPosition.staticSetup();
		oFF.InitCacheOption.staticSetup();
		oFF.QClientQueryObjectType.staticSetup();
		oFF.LocationType.staticSetup();
		oFF.FiscalSpaceType.staticSetup();
		oFF.OptimizerHint.staticSetup();
		oFF.InAMergeProcessingMode.staticSetup();
		oFF.AlertSymbol.staticSetup();
		oFF.CellAlignmentHorizontal.staticSetup();
		oFF.CellAlignmentVertical.staticSetup();
		oFF.LinePatternType.staticSetup();
		oFF.TableHeaderCompactionType.staticSetup();
		oFF.TableMemberHeaderHandling.staticSetup();
		oFF.TablePageBreakHandling.staticSetup();
		oFF.TableLineStyle.staticSetup();
		oFF.VisualizationAxisType.staticSetup();
		oFF.VisualizationCategoryType.staticSetup();
		oFF.VisualizationValueType.staticSetup();
		oFF.ChartType.staticSetup();
		oFF.ChartOrientation.staticSetup();
		oFF.ChartStackingType.staticSetup();
		oFF.ValueSign.staticSetup();
		oFF.VariableType.staticSetup();
		oFF.Scope.staticSetup();
		oFF.VariableProcessorState.staticSetup();
		oFF.ProcessingType.staticSetup();
		oFF.ResultVisibility.staticSetup();
		oFF.ResultAlignment.staticSetup();
		oFF.ResultStructureElement.staticSetup();
		oFF.RestoreAction.staticSetup();
		oFF.OlapApiModule.SERVICE_TYPE_QUERY_CONSUMER = oFF.ServiceType.createType(oFF.OlapApiModule.XS_QUERY_CONSUMER);
		oFF.OlapApiModule.SERVICE_TYPE_PLANNING = oFF.ServiceType.createType(oFF.OlapApiModule.XS_PLANNING);
		oFF.PlanningOperationType.staticSetup();
		oFF.PlanningSequenceStepType.staticSetup();
		oFF.CellLockingType.staticSetup();
		oFF.PlanningMode.staticSetup();
		oFF.PlanningVersionRestrictionType.staticSetup();
		oFF.PlanningVersionSettingsMode.staticSetup();
		oFF.PlanningContextType.staticSetup();
		oFF.PlanningCommandType.staticSetup();
		oFF.PlanningContextCommandType.staticSetup();
		oFF.PlanningModelRequestType.staticSetup();
		oFF.DataAreaRequestType.staticSetup();
		oFF.PlanningModelBehaviour.staticSetup();
		oFF.RestoreBackupType.staticSetup();
		oFF.PlanningActionType.staticSetup();
		oFF.PlanningVersionState.staticSetup();
		oFF.PlanningPrivilege.staticSetup();
		oFF.PlanningPrivilegeState.staticSetup();
		oFF.PlanningPersistenceType.staticSetup();
		oFF.CloseModeType.staticSetup();
		oFF.OlapApiModule.SERVICE_TYPE_HIERARCHY_CATALOG = oFF.ServiceType.createType(oFF.OlapApiModule.XS_HIERARCHY_CATALOG);
		oFF.BlendingLinkType.staticSetup();
		oFF.BlendingMappingDefinitionType.staticSetup();
		oFF.BlendingPersistenceType.staticSetup();
		oFF.UnlinkedDimensionJoinType.staticSetup();
		oFF.HierarchyType.staticSetup();
		oFF.UnitType.staticSetup();
		oFF.VarianceCalculationType.staticSetup();
		oFF.VarianceNullHandlingType.staticSetup();
		oFF.QStructureMemberQueryProperties.staticSetup();
		oFF.ExceptionAggregationConditionType.staticSetup();
		oFF.QFormulaType.staticSetup();
		oFF.QTimeOperationFunction.staticSetup();
		oFF.QTimeOperationGranularity.staticSetup();
		oFF.QTimeOperationLagPeriod.staticSetup();
		oFF.QTimePeriodOperationLevel.staticSetup();
		oFF.TimeOffsetFunction.staticSetup();
		oFF.TimeRangeFilterType.staticSetup();
		oFF.QPersistedPlaceholderTagType.staticSetup();
		oFF.AccountType.staticSetup();
		oFF.QFormulaExceptionConstants.staticSetup();
		oFF.FormulaExceptionType.staticSetup();
		oFF.WindowFunctionType.staticSetup();
		oFF.NullsType.staticSetup();
		oFF.FrameStartType.staticSetup();
		oFF.FrameEndType.staticSetup();
		oFF.CtRateType.staticSetup();
		oFF.CtCategory.staticSetup();
		oFF.CtErrorHandlingMode.staticSetup();
		oFF.CellChartOrientation.staticSetup();
		oFF.CellChartType.staticSetup();
		oFF.XCommandType.staticSetup();
		oFF.XCommandFollowUpType.staticSetup();
		oFF.ConditionDimensionEvaluationType.staticSetup();
		oFF.ConditionComparisonOperator.staticSetupComparisonOps();
		oFF.ReturnedDataSelection.staticSetup();
		oFF.FioriCellType.staticSetup();
		oFF.FioriGridFactory.setInstance(oFF.FioriGridFactoryDummyImpl.create());
		oFF.ReferenceGridFactory.setInstance(oFF.ReferenceGridFactoryDummyImpl.create());
		oFF.ChartRendererFactory.setInstance(oFF.ChartRendererFactoryDummyImpl.create());
		oFF.KpiRendererFactory.setInstance(oFF.KpiRendererFactoryDummyImpl.create());
		oFF.GridRendererFactory.setInstance(oFF.GridRendererFactoryDummyImpl.create());
		oFF.CustomRendererRegistry.staticSetup();
		oFF.CurrencyTranslationOperation.staticSetup();
		oFF.DateOffsetGranularity.staticSetup();
		oFF.MemberNavigationType.staticSetup();
		oFF.DfModule.stopExt(oFF.OlapApiModule.s_module);
	}
	return oFF.OlapApiModule.s_module;
};
oFF.OlapApiModule.prototype.getName = function()
{
	return "ff4200.olap.api";
};

oFF.OlapApiModule.getInstance();

return sap.firefly;
	} );