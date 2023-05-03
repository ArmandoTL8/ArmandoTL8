/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
[
"sap/sac/df/firefly/ff4000.protocol.ina","sap/sac/df/firefly/ff4205.olap.api.base","sap/sac/df/firefly/ff4250.olap.resultset","sap/sac/df/firefly/ff4305.olap.model"
],
function(oFF)
{
"use strict";

oFF.BlendableQMPersistedInAResult = function() {};
oFF.BlendableQMPersistedInAResult.prototype = new oFF.XObject();
oFF.BlendableQMPersistedInAResult.prototype._ff_c = "BlendableQMPersistedInAResult";

oFF.BlendableQMPersistedInAResult.create = function(mainQuery, dependentQueries, runtimeBlendedQueryManager, hostSystemName)
{
	var result = new oFF.BlendableQMPersistedInAResult();
	result.m_mainQuery = mainQuery;
	result.m_dependentQueries = dependentQueries;
	result.m_runtimeBlendedQueryManager = runtimeBlendedQueryManager;
	result.m_hostSystemName = hostSystemName;
	return result;
};
oFF.BlendableQMPersistedInAResult.prototype.m_mainQuery = null;
oFF.BlendableQMPersistedInAResult.prototype.m_dependentQueries = null;
oFF.BlendableQMPersistedInAResult.prototype.m_runtimeBlendedQueryManager = null;
oFF.BlendableQMPersistedInAResult.prototype.m_hostSystemName = null;
oFF.BlendableQMPersistedInAResult.prototype.releaseObject = function()
{
	this.m_mainQuery = null;
	this.m_dependentQueries = null;
	this.m_runtimeBlendedQueryManager = null;
};
oFF.BlendableQMPersistedInAResult.prototype.getMainQuery = function()
{
	return this.m_mainQuery;
};
oFF.BlendableQMPersistedInAResult.prototype.getDependentQueries = function()
{
	return this.m_dependentQueries;
};
oFF.BlendableQMPersistedInAResult.prototype.getRuntimeBlendedQueryManager = function()
{
	return this.m_runtimeBlendedQueryManager;
};
oFF.BlendableQMPersistedInAResult.prototype.getHostSystemName = function()
{
	return this.m_hostSystemName;
};

oFF.BlendedDrillPathElementInfo = function() {};
oFF.BlendedDrillPathElementInfo.prototype = new oFF.XObject();
oFF.BlendedDrillPathElementInfo.prototype._ff_c = "BlendedDrillPathElementInfo";

oFF.BlendedDrillPathElementInfo._createBlendedDrillPathElementInfo = function()
{
	var blendedDrillPathElementInfo = new oFF.BlendedDrillPathElementInfo();
	return blendedDrillPathElementInfo;
};
oFF.BlendedDrillPathElementInfo.createBlendedDrillPathElementInfo = function(datasetId, dimensionName, selectValue)
{
	var blendedDrillPathElementInfo = new oFF.BlendedDrillPathElementInfo();
	blendedDrillPathElementInfo.m_datasetId = datasetId;
	blendedDrillPathElementInfo.m_dimensionName = dimensionName;
	blendedDrillPathElementInfo.m_drillMember = selectValue;
	return blendedDrillPathElementInfo;
};
oFF.BlendedDrillPathElementInfo.prototype.m_datasetId = null;
oFF.BlendedDrillPathElementInfo.prototype.m_dimensionName = null;
oFF.BlendedDrillPathElementInfo.prototype.m_drillMember = null;
oFF.BlendedDrillPathElementInfo.prototype.cloneExt = function(flags)
{
	var copyBlendedDrillPathElementInfo = oFF.BlendedDrillPathElementInfo._createBlendedDrillPathElementInfo();
	copyBlendedDrillPathElementInfo.copyFrom(this, flags);
	return copyBlendedDrillPathElementInfo;
};
oFF.BlendedDrillPathElementInfo.prototype.copyFrom = function(other, flags)
{
	oFF.XObject.prototype.copyFrom.call( this , other, flags);
	var otherBlendedDrillPathElementInfo = other;
	this.m_datasetId = otherBlendedDrillPathElementInfo.getDatasetId();
	this.m_dimensionName = otherBlendedDrillPathElementInfo.getDimensionName();
	this.m_drillMember = otherBlendedDrillPathElementInfo.getDrillMember();
};
oFF.BlendedDrillPathElementInfo.prototype.releaseObject = function()
{
	oFF.XObject.prototype.releaseObject.call( this );
	this.m_datasetId = null;
	this.m_dimensionName = null;
	this.m_drillMember = null;
};
oFF.BlendedDrillPathElementInfo.prototype.getDimensionName = function()
{
	return this.m_dimensionName;
};
oFF.BlendedDrillPathElementInfo.prototype.getDatasetId = function()
{
	return this.m_datasetId;
};
oFF.BlendedDrillPathElementInfo.prototype.getDrillMember = function()
{
	return this.m_drillMember;
};

oFF.BlendingMappingUtils = {

	ID_ATTRIBUTE_NAME:"id",
	DESCRIPTION_ATTRIBUTE_NAME:"description",
	processTransientCalculations:function(queryModel, transientMembers, isUseEmptyAllMemberMeasureFilter)
	{
			if (oFF.notNull(transientMembers))
		{
			var transientMembersIter = transientMembers.getIterator();
			while (transientMembersIter.hasNext())
			{
				var transientMember = transientMembersIter.next();
				if (!oFF.XString.isEqual(queryModel.getName(), transientMember.getQueryModel().getName()))
				{
					continue;
				}
				var calculationDimension = queryModel.getDimensionByName(transientMember.getDimension().getName());
				var memberName = transientMember.getAliasOrMemberName();
				if (calculationDimension.getStructureMemberByAliasOrMember(memberName) === null)
				{
					calculationDimension.addMeasure(transientMember);
					transientMember.getTagging().put(oFF.QTransientConstants.TAG_IS_TRANSIENT, "");
					transientMember.getTagging().put(oFF.QTransientConstants.TAG_IS_TRANSIENT_BLENDING_PROCESS, "");
				}
				var measureFilter = null;
				if (isUseEmptyAllMemberMeasureFilter)
				{
					if (calculationDimension.getFilter() !== null && !calculationDimension.getFilter().isEmpty())
					{
						measureFilter = calculationDimension.getFilter();
					}
				}
				else
				{
					measureFilter = calculationDimension.getFilter();
					if (oFF.isNull(measureFilter))
					{
						measureFilter = queryModel.getFilter().getDynamicFilter().getCartesianListWithDefault(calculationDimension);
					}
				}
				if (oFF.notNull(measureFilter))
				{
					var memberNamesFromFilter = oFF.QFilterUtil.getMemberNamesFromFilter(calculationDimension.getFilter(), calculationDimension.getName());
					if (!memberNamesFromFilter.contains(memberName))
					{
						var newMeasureFilter = calculationDimension.getFilter().addNewCartesianElement();
						newMeasureFilter.setComparisonOperator(oFF.ComparisonOperator.EQUAL);
						newMeasureFilter.setLowString(memberName);
						newMeasureFilter.getTagging().put(oFF.QTransientConstants.TAG_IS_TRANSIENT, "");
					}
				}
				oFF.BlendingMappingUtils.addTransientZoomOrVisiblityFilters(queryModel, calculationDimension, memberName);
			}
		}
	},
	addTransientZoomOrVisiblityFilters:function(queryModel, calculationDimension, memberName)
	{
			if (calculationDimension.getDimensionType() === oFF.DimensionType.ACCOUNT && calculationDimension.isHierarchyActive() && calculationDimension.getInitialDrillLevel() > -1)
		{
			var zoomDrillOperations = queryModel.getDrillManager().getAllZoomDrillOperationsForDimension(calculationDimension);
			var drillPathExist = false;
			var drillPathElement = oFF.QFactory.createDrillPathElement(queryModel, memberName, calculationDimension);
			drillPathElement.getTagging().put(oFF.QTransientConstants.TAG_IS_TRANSIENT, "");
			if (oFF.notNull(zoomDrillOperations) && zoomDrillOperations.size() > 0)
			{
				for (var j = 0; j < zoomDrillOperations.size(); j++)
				{
					if (oFF.XCollectionUtils.contains(zoomDrillOperations.get(j).getDrillPath(),  function(zoomDrillPath){
						return oFF.XString.isEqual(zoomDrillPath.getSelectValue(), memberName);
					}.bind(this)))
					{
						drillPathExist = true;
					}
				}
				if (!drillPathExist)
				{
					queryModel.getDrillManager().addZoomDrillPathElement(drillPathElement, true);
				}
			}
			else
			{
				var drillOperations = queryModel.getDrillManager().getDrillOperationsByDimension(calculationDimension);
				if (oFF.notNull(drillOperations))
				{
					for (var i = 0; i < drillOperations.size(); i++)
					{
						if (oFF.XCollectionUtils.contains(drillOperations.get(i).getDrillPath(),  function(drillPath){
							return oFF.XString.isEqual(drillPath.getSelectValue(), memberName);
						}.bind(this)))
						{
							drillPathExist = true;
						}
					}
				}
				if (!drillPathExist)
				{
					queryModel.getDrillManager().setDrillStateElement(drillPathElement, oFF.DrillState.EXPANDED);
					var visibilityFilter = queryModel.getFilter().getVisibilityFilter();
					if (oFF.notNull(visibilityFilter))
					{
						var visiblityFilterList = visibilityFilter.getCartesianList(calculationDimension);
						if (oFF.notNull(visiblityFilterList) && visiblityFilterList.size() > 0)
						{
							var visibilityFilterElement = visiblityFilterList.addNewCartesianElement();
							visibilityFilterElement.setComparisonOperator(oFF.ComparisonOperator.EQUAL);
							visibilityFilterElement.setLowString(memberName);
							visibilityFilterElement.setDepth(0);
							visibilityFilterElement.setHierarchyName(calculationDimension.getHierarchyName());
							visibilityFilterElement.getTagging().put(oFF.QTransientConstants.TAG_IS_TRANSIENT, "");
						}
					}
				}
			}
		}
	},
	processCalculationDimensionMappings:function(blendingDefinition, primarySource, secondarySource, blendedDrillOperations)
	{
			var primaryQueryModel = primarySource.getQueryModel();
		var secondaryQueryModel = secondarySource.getQueryModel();
		var primaryQueryManager = primaryQueryModel.getQueryManager();
		var secondaryQueryManager = secondaryQueryModel.getQueryManager();
		var primaryAccountDimension = primaryQueryModel.getAccountDimension();
		var secondaryAccountDimension = secondaryQueryModel.getAccountDimension();
		var primaryMeasureDimension = primaryQueryModel.getMeasureDimension();
		var secondaryMeasureDimension = secondaryQueryModel.getMeasureDimension();
		var secondaryCalculationDimMapping;
		var primaryCalculationDimMapping;
		if (oFF.notNull(primaryAccountDimension))
		{
			if (oFF.BlendingMappingUtils.isLeafDimensionUsedInBlendedDrill(primaryAccountDimension.getName(), primaryQueryModel.getDatasetId(), blendedDrillOperations))
			{
				oFF.BlendingMappingUtils.autoExpandHierarchyDimension(primaryAccountDimension);
				oFF.BlendingMappingUtils.autoExpandHierarchyDimension(secondaryAccountDimension);
			}
			if (oFF.isNull(secondaryAccountDimension))
			{
				secondaryCalculationDimMapping = blendingDefinition.addNewDimensionMapping(oFF.BlendingLinkType.ALL_DATA, primaryMeasureDimension.getName());
				secondaryCalculationDimMapping.addNewDimensionMappingDefinition(primaryMeasureDimension, primarySource.getQueryAliasName());
				secondaryCalculationDimMapping.addNewConstantMapping("SignedData", secondarySource.getQueryAliasName());
				primaryCalculationDimMapping = blendingDefinition.addNewDimensionMapping(oFF.BlendingLinkType.COEXIST, primaryAccountDimension.getName());
				primaryCalculationDimMapping.addNewDimensionMappingDefinition(primaryAccountDimension, primarySource.getQueryAliasName());
				primaryCalculationDimMapping.addNewDimensionMappingDefinition(secondaryMeasureDimension, secondarySource.getQueryAliasName());
				var secondaryDescField = secondaryMeasureDimension.getTextField();
				var primaryDescField = primaryAccountDimension.getTextField();
				if (oFF.notNull(primaryDescField) && oFF.notNull(secondaryDescField))
				{
					var accountDescAttributeMapping = primaryCalculationDimMapping.addNewAttributeMappingByName(primaryDescField.getName(), false);
					accountDescAttributeMapping.addNewAttributeDimensionMappingDefinitionByName(primaryDescField.getName(), primarySource.getQueryAliasName());
					accountDescAttributeMapping.addNewAttributeDimensionMappingDefinitionByName(secondaryDescField.getName(), secondarySource.getQueryAliasName());
				}
				var secondaryKeyField = secondaryMeasureDimension.getKeyField();
				var primaryKeyField = primaryAccountDimension.getKeyField();
				if (oFF.notNull(primaryKeyField) && oFF.notNull(secondaryKeyField))
				{
					var accountKeyAttributeMapping = primaryCalculationDimMapping.addNewAttributeMappingByName(primaryKeyField.getName(), false);
					accountKeyAttributeMapping.addNewAttributeDimensionMappingDefinitionByName(primaryKeyField.getName(), primarySource.getQueryAliasName());
					accountKeyAttributeMapping.addNewAttributeDimensionMappingDefinitionByName(secondaryKeyField.getName(), secondarySource.getQueryAliasName());
				}
			}
			else
			{
				secondaryCalculationDimMapping = blendingDefinition.addNewDimensionMapping(oFF.BlendingLinkType.ALL_DATA, primaryMeasureDimension.getName());
				secondaryCalculationDimMapping.addNewDimensionMappingDefinition(secondaryMeasureDimension, secondarySource.getQueryAliasName());
				secondaryCalculationDimMapping.addNewDimensionMappingDefinition(primaryMeasureDimension, primarySource.getQueryAliasName());
				primaryCalculationDimMapping = blendingDefinition.addNewDimensionMapping(oFF.BlendingLinkType.COEXIST, primaryAccountDimension.getName());
				primaryCalculationDimMapping.addNewDimensionMappingDefinition(secondaryAccountDimension, secondarySource.getQueryAliasName());
				primaryCalculationDimMapping.addNewDimensionMappingDefinition(primaryAccountDimension, primarySource.getQueryAliasName());
			}
		}
		else
		{
			var primaryMeasureKeyField;
			var secondaryMeasureKeyField;
			var primaryMeasureDescField;
			var secondaryMeasureDescField;
			var primaryMeasureDimensionKeyAttributeName = oFF.XStringUtils.concatenate3("[", primaryMeasureDimension.getName(), "].key");
			if (oFF.notNull(secondaryAccountDimension))
			{
				secondaryCalculationDimMapping = blendingDefinition.addNewDimensionMapping(oFF.BlendingLinkType.ALL_DATA, "SignedData");
				secondaryCalculationDimMapping.addNewDimensionMappingDefinition(secondaryMeasureDimension, secondarySource.getQueryAliasName());
				var signedDataDimension = primarySource.getQueryModel().getDimensionByName("SignedData");
				if (oFF.notNull(signedDataDimension))
				{
					secondaryCalculationDimMapping.addNewDimensionMappingDefinition(signedDataDimension, primarySource.getQueryAliasName());
				}
				else
				{
					secondaryCalculationDimMapping.addNewConstantMapping("SignedData", primarySource.getQueryAliasName());
				}
				primaryCalculationDimMapping = blendingDefinition.addNewDimensionMapping(oFF.BlendingLinkType.COEXIST, primaryMeasureDimension.getName());
				primaryCalculationDimMapping.addNewDimensionMappingDefinition(secondaryAccountDimension, secondarySource.getQueryAliasName());
				primaryCalculationDimMapping.addNewDimensionMappingDefinition(primaryMeasureDimension, primarySource.getQueryAliasName());
				if (oFF.isNull(signedDataDimension))
				{
					primaryMeasureDescField = primaryMeasureDimension.getTextField();
					secondaryMeasureDescField = secondaryAccountDimension.getTextField();
					if (oFF.notNull(primaryMeasureDescField) && oFF.notNull(secondaryMeasureDescField))
					{
						var measureDimensionDescMapping = primaryCalculationDimMapping.addNewAttributeMappingByName(primaryMeasureDescField.getName(), false);
						measureDimensionDescMapping.addNewAttributeDimensionMappingDefinitionByName(secondaryMeasureDescField.getName(), secondarySource.getQueryAliasName());
						measureDimensionDescMapping.addNewAttributeDimensionMappingDefinitionByName(primaryMeasureDescField.getName(), primarySource.getQueryAliasName());
					}
					primaryMeasureKeyField = primaryMeasureDimension.getKeyField();
					secondaryMeasureKeyField = secondaryAccountDimension.getKeyField();
					if (oFF.notNull(primaryMeasureKeyField) && oFF.notNull(secondaryMeasureKeyField))
					{
						var measureDimensionKeyMapping = primaryCalculationDimMapping.addNewAttributeMappingByName(primaryMeasureDimensionKeyAttributeName, false);
						measureDimensionKeyMapping.addNewAttributeDimensionMappingDefinitionByName(secondaryMeasureKeyField.getName(), secondarySource.getQueryAliasName());
						if (primaryCalculationDimMapping.getBlendingDefinition().getBlendingSourceByAlias(primarySource.getQueryAliasName()).getFieldByName(primaryMeasureDimensionKeyAttributeName) !== null)
						{
							measureDimensionKeyMapping.addNewAttributeDimensionMappingDefinitionByName(primaryMeasureDimensionKeyAttributeName, primarySource.getQueryAliasName());
						}
						else
						{
							measureDimensionKeyMapping.addNewAttributeDimensionMappingDefinitionByName(primaryMeasureKeyField.getName(), primarySource.getQueryAliasName());
						}
					}
				}
			}
			else
			{
				primaryCalculationDimMapping = blendingDefinition.addNewDimensionMapping(oFF.BlendingLinkType.COEXIST, primaryMeasureDimension.getName());
				primaryCalculationDimMapping.addNewDimensionMappingDefinition(primaryMeasureDimension, primarySource.getQueryAliasName());
				primaryCalculationDimMapping.addNewDimensionMappingDefinition(secondaryMeasureDimension, secondarySource.getQueryAliasName());
				if (primaryQueryManager.getSystemType().isTypeOf(oFF.SystemType.BW) || secondaryQueryManager.getSystemType().isTypeOf(oFF.SystemType.BW))
				{
					primaryMeasureDescField = primaryMeasureDimension.getTextField();
					secondaryMeasureDescField = secondaryMeasureDimension.getTextField();
					if (oFF.notNull(primaryMeasureDescField) && oFF.notNull(secondaryMeasureDescField))
					{
						var primaryCalculationMeasureDescAttributeMapping = primaryCalculationDimMapping.addNewAttributeMappingByName(primaryMeasureDescField.getName(), false);
						primaryCalculationMeasureDescAttributeMapping.addNewAttributeDimensionMappingDefinitionByName(primaryMeasureDescField.getName(), primarySource.getQueryAliasName());
						primaryCalculationMeasureDescAttributeMapping.addNewAttributeDimensionMappingDefinitionByName(secondaryMeasureDescField.getName(), secondarySource.getQueryAliasName());
					}
					primaryMeasureKeyField = primaryMeasureDimension.getKeyField();
					secondaryMeasureKeyField = secondaryMeasureDimension.getKeyField();
					if (oFF.notNull(primaryMeasureKeyField) && oFF.notNull(secondaryMeasureKeyField))
					{
						var primaryCalculationMeasureKeyFieldAttributeMapping = primaryCalculationDimMapping.addNewAttributeMappingByName(primaryMeasureDimensionKeyAttributeName, false);
						if (primaryCalculationDimMapping.getBlendingDefinition().getBlendingSourceByAlias(primarySource.getQueryAliasName()).getFieldByName(primaryMeasureDimensionKeyAttributeName) !== null)
						{
							primaryCalculationMeasureKeyFieldAttributeMapping.addNewAttributeDimensionMappingDefinitionByName(primaryMeasureDimensionKeyAttributeName, primarySource.getQueryAliasName());
						}
						else
						{
							primaryCalculationMeasureKeyFieldAttributeMapping.addNewAttributeDimensionMappingDefinitionByName(primaryMeasureKeyField.getName(), primarySource.getQueryAliasName());
						}
						primaryCalculationMeasureKeyFieldAttributeMapping.addNewAttributeDimensionMappingDefinitionByName(secondaryMeasureKeyField.getName(), secondarySource.getQueryAliasName());
					}
				}
			}
		}
	},
	processLinkedDimensions:function(blendingProcessConfigs, blendingDefinition, primarySource, secondarySource, blendingProcess, blendedDrillOperations)
	{
			var primaryQueryModel = primarySource.getQueryModel();
		var secondaryQueryModel = secondarySource.getQueryModel();
		var blendingProcessConfigIter = blendingProcessConfigs.getIterator();
		while (blendingProcessConfigIter.hasNext())
		{
			var blendingProcessConfig = blendingProcessConfigIter.next();
			var dimensionLinksIter = blendingProcessConfig.getModelDimensionLinks().getIterator();
			while (dimensionLinksIter.hasNext())
			{
				var dimensionLink = dimensionLinksIter.next();
				var primaryLinkDimensionName = dimensionLink.getFirstPart().getDimensionName();
				var primaryLinkDimension = primaryQueryModel.getDimensionByName(primaryLinkDimensionName);
				if (oFF.isNull(primaryLinkDimension))
				{
					continue;
				}
				var primaryLinkDimensionOOC = oFF.BlendingMappingUtils.isOutOfContextDimension(primaryLinkDimension);
				if (primaryLinkDimensionOOC)
				{
					if (!blendingProcessConfig.getQueryModelLinkSettings().getActivePrimaryLinkDimensionNames().isEmpty() && !blendingProcessConfig.getQueryModelLinkSettings().getActivePrimaryLinkDimensionNames().contains(primaryLinkDimensionName))
					{
						continue;
					}
					primaryQueryModel.getRowsAxis().add(primaryLinkDimension);
					primaryLinkDimension.getTagging().put("transientRowAxis", "");
					blendingProcess.addOutOfContextLinkDimensionName(primaryLinkDimensionName);
				}
				if (primaryLinkDimension.supportsHierarchy())
				{
					if (primaryLinkDimensionOOC)
					{
						primaryLinkDimension.getTagging().put("transientInitialDrillLevel", oFF.XInteger.convertToString(primaryLinkDimension.getInitialDrillLevel()));
						primaryLinkDimension.setInitialDrillLevel(0);
					}
				}
				if (!oFF.XString.isEqual(secondaryQueryModel.getDatasetId(), dimensionLink.getSecondPart().getQueryManagerKey()))
				{
					continue;
				}
				var secondaryLinkDimensionName = dimensionLink.getSecondPart().getDimensionName();
				var secondaryLinkDimension = secondaryQueryModel.getDimensionByName(secondaryLinkDimensionName);
				if (oFF.isNull(secondaryLinkDimension))
				{
					continue;
				}
				var secondaryLinkDimensionOOC = oFF.BlendingMappingUtils.isOutOfContextDimension(secondaryLinkDimension);
				if (secondaryLinkDimensionOOC)
				{
					secondaryQueryModel.getRowsAxis().add(secondaryLinkDimension);
					secondaryLinkDimension.getTagging().put("transientRowAxis", "");
				}
				if (secondaryLinkDimension.supportsHierarchy())
				{
					secondaryLinkDimension.getTagging().put("transientInitialDrillLevel", oFF.XInteger.convertToString(secondaryLinkDimension.getInitialDrillLevel()));
					secondaryLinkDimension.setInitialDrillLevel(-1);
				}
				var linkMapping = blendingDefinition.addNewDimensionMapping(blendingProcessConfig.getQueryModelLinkSettings().getLinkType(), primaryLinkDimensionName);
				linkMapping.addNewDimensionMappingDefinitionByName(primaryLinkDimensionName, primarySource.getQueryAliasName());
				linkMapping.addNewDimensionMappingDefinitionByName(secondaryLinkDimensionName, secondarySource.getQueryAliasName());
				if (oFF.QTimeDimensionUtil.isDateOrTimeLikeDimension(primaryLinkDimension))
				{
					oFF.BlendingMappingUtils.processTimeDimensionAttributeMapping(primarySource, secondarySource, blendingProcess, primaryLinkDimension, secondaryLinkDimension, linkMapping);
				}
				else
				{
					oFF.BlendingMappingUtils.processHierarchies(primaryLinkDimension, secondaryLinkDimension, primaryLinkDimensionOOC, dimensionLink.isLinkOnMatchingHierarchies());
					if (oFF.BlendingMappingUtils.isLeafDimensionUsedInBlendedDrill(primaryLinkDimension.getName(), primaryQueryModel.getDatasetId(), blendedDrillOperations))
					{
						oFF.BlendingMappingUtils.autoExpandHierarchyDimension(primaryLinkDimension);
						oFF.BlendingMappingUtils.autoExpandHierarchyDimension(secondaryLinkDimension);
					}
					var primaryJoinField = oFF.BlendingMappingUtils.getAttributeJoinField(dimensionLink.getFirstPart(), primaryLinkDimension, blendingProcess);
					var secondaryJoinField = oFF.BlendingMappingUtils.getAttributeJoinField(dimensionLink.getSecondPart(), secondaryLinkDimension, blendingProcess);
					if (oFF.notNull(primaryJoinField) && oFF.notNull(secondaryJoinField))
					{
						var attributeMapping = linkMapping.addNewAttributeMappingByName(primaryJoinField.getName(), true);
						attributeMapping.addNewAttributeDimensionMappingDefinitionByName(primaryJoinField.getName(), primarySource.getQueryAliasName());
						attributeMapping.addNewAttributeDimensionMappingDefinitionByName(secondaryJoinField.getName(), secondarySource.getQueryAliasName());
					}
					oFF.BlendingMappingUtils.addDescriptionAttrMappingIfLinkByKey(primaryLinkDimension, secondaryLinkDimension, dimensionLink, linkMapping, primarySource.getQueryAliasName(), secondarySource.getQueryAliasName());
				}
			}
		}
	},
	processTimeDimensionAttributeMapping:function(primarySource, secondarySource, blendingProcess, primaryLinkDimension, secondaryLinkDimension, linkMapping)
	{
			oFF.BlendingMappingUtils.saveOriginalResultSetFields(primaryLinkDimension, blendingProcess);
		oFF.BlendingMappingUtils.saveOriginalResultSetFields(secondaryLinkDimension, blendingProcess);
		blendingProcess.addAutoMappingTimeLinkDimensionNames(linkMapping.getMemberName());
		secondaryLinkDimension.getTagging().put("originalHierarchy", secondaryLinkDimension.isHierarchyActive() ? secondaryLinkDimension.getHierarchyName() : null);
		secondaryLinkDimension.setHierarchyActive(primaryLinkDimension.isHierarchyActive());
		var primaryLeveledHierarchy = null;
		var secondaryLeveledHierarchy = null;
		var compatibleHierarchyFiscalSpaceType;
		if (primaryLinkDimension.isHierarchyActive())
		{
			primaryLeveledHierarchy = primaryLinkDimension.getLeveledHierarchy(primaryLinkDimension.getHierarchyName());
			compatibleHierarchyFiscalSpaceType = oFF.QTimeDimensionUtil.getFiscalSpaceType(primaryLinkDimension, primaryLinkDimension.getHierarchyName(), secondaryLinkDimension);
			secondaryLeveledHierarchy = oFF.QTimeDimensionUtil.findMostCompatibleHierarchy(secondaryLinkDimension, primaryLeveledHierarchy.getAllLevelTypes(), compatibleHierarchyFiscalSpaceType);
			oFF.BlendingMappingUtils.linkAttributesFromLeveledHierarchy(primarySource, secondarySource, primaryLinkDimension, secondaryLinkDimension, linkMapping, primaryLeveledHierarchy, secondaryLeveledHierarchy);
		}
		else
		{
			var primaryHierarchies = primaryLinkDimension.getHierarchies() !== null ? primaryLinkDimension.getHierarchies().getObjectsIterator() : null;
			if (oFF.notNull(primaryHierarchies))
			{
				while (primaryHierarchies.hasNext())
				{
					var primaryHierarchyCatalogItem = primaryHierarchies.next();
					primaryLeveledHierarchy = primaryLinkDimension.getLeveledHierarchy(primaryHierarchyCatalogItem.getHierarchyName());
					compatibleHierarchyFiscalSpaceType = oFF.QTimeDimensionUtil.getFiscalSpaceType(primaryLinkDimension, primaryHierarchyCatalogItem.getHierarchyName(), secondaryLinkDimension);
					secondaryLeveledHierarchy = oFF.QTimeDimensionUtil.findMostCompatibleHierarchy(secondaryLinkDimension, primaryLeveledHierarchy.getAllLevelTypes(), compatibleHierarchyFiscalSpaceType);
					if (oFF.notNull(secondaryLeveledHierarchy))
					{
						oFF.BlendingMappingUtils.linkAttributesFromLeveledHierarchy(primarySource, secondarySource, primaryLinkDimension, secondaryLinkDimension, linkMapping, primaryLeveledHierarchy, secondaryLeveledHierarchy);
					}
				}
			}
		}
	},
	linkAttributesFromLeveledHierarchy:function(primarySource, secondarySource, primaryLinkDimension, secondaryLinkDimension, linkMapping, primaryLeveledHierarchy, secondaryLeveledHierarchy)
	{
			if (oFF.notNull(primaryLeveledHierarchy) && oFF.notNull(secondaryLeveledHierarchy))
		{
			secondaryLinkDimension.setHierarchyName(secondaryLeveledHierarchy.getHierarchyName());
			var primaryHierarchyLevelsIter = primaryLeveledHierarchy.getAllLevel().getIterator();
			while (primaryHierarchyLevelsIter.hasNext())
			{
				var primaryHierarchyLevel = primaryHierarchyLevelsIter.next();
				if (primaryHierarchyLevel.getLevelType() === oFF.HierarchyLevelType.ALL)
				{
					continue;
				}
				var secondaryHierarchyLevel = secondaryLeveledHierarchy.getLevelByType(primaryHierarchyLevel.getLevelType());
				if (oFF.notNull(secondaryHierarchyLevel))
				{
					var primaryLevelHierarchyField = oFF.BlendingMappingUtils.getDimensionFieldOfHierarchyLevel(primaryLinkDimension, primaryHierarchyLevel);
					var secondaryLevelHierarchyField = oFF.BlendingMappingUtils.getDimensionFieldOfHierarchyLevel(secondaryLinkDimension, secondaryHierarchyLevel);
					primaryLinkDimension.getResultSetFields().add(primaryLevelHierarchyField);
					secondaryLinkDimension.getResultSetFields().add(secondaryLevelHierarchyField);
					var attributeMapping = linkMapping.addNewAttributeMappingByName(primaryLevelHierarchyField.getName(), true);
					attributeMapping.addNewAttributeDimensionMappingDefinitionByName(primaryLevelHierarchyField.getName(), primarySource.getQueryAliasName());
					attributeMapping.addNewAttributeDimensionMappingDefinitionByName(secondaryLevelHierarchyField.getName(), secondarySource.getQueryAliasName());
				}
			}
		}
	},
	getDimensionFieldOfHierarchyLevel:function(dimension, level)
	{
			return dimension.getFieldByName(level.getLevelDimensionName());
	},
	isLeafDimensionUsedInBlendedDrill:function(leafDimensionName, datasetId, blendedDrillOperations)
	{
			var blendedDrillOperationsIter = blendedDrillOperations.getIterator();
		while (blendedDrillOperationsIter.hasNext())
		{
			var blendedDrillOperation = blendedDrillOperationsIter.next();
			if (oFF.XString.isEqual(blendedDrillOperation.getDatasetId(), datasetId) && oFF.XString.isEqual(blendedDrillOperation.getDimensionName(), leafDimensionName))
			{
				return true;
			}
		}
		return false;
	},
	autoExpandHierarchyDimension:function(dimension)
	{
			if (oFF.notNull(dimension) && dimension.isHierarchyActive() && dimension.getDrillManager().getDrillOperationsByDimension(dimension).size() === 0 && dimension.getDrillManager().getAllZoomDrillOperationsForDimension(dimension).size() === 0)
		{
			dimension.getTagging().put("transientInitialDrillLevel", oFF.XInteger.convertToString(dimension.getInitialDrillLevel()));
			dimension.setInitialDrillLevel(-1);
		}
	},
	processUnlinkedDimensions:function(blendingSource, otherBlendingSource, blendingDefinition, qmLink, usedUnlinkDimensionNames, blendedDrillOperations)
	{
			var queryModel = blendingSource.getQueryModel();
		var queryAliasName = blendingSource.getQueryAliasName();
		var otherQueryAliasName = otherBlendingSource.getQueryAliasName();
		var dimensions = oFF.XList.create();
		dimensions.addAll(queryModel.getRowsAxis());
		dimensions.addAll(queryModel.getColumnsAxis());
		var dimensionsIter = dimensions.getIterator();
		var usedMappings = oFF.XHashMapByString.create();
		var mappingsIter = blendingDefinition.getMappings().getIterator();
		var mappingDimensionNames;
		while (mappingsIter.hasNext())
		{
			var mappings = mappingsIter.next();
			if (mappings.getMappingDefinitionType() === oFF.BlendingMappingDefinitionType.DIMENSION)
			{
				var mappingDefIter = mappings.getMappingDefinitions().getIterator();
				while (mappingDefIter.hasNext())
				{
					var mappingDef = mappingDefIter.next();
					mappingDimensionNames = usedMappings.getByKey(mappingDef.getQueryAliasName());
					if (oFF.isNull(mappingDimensionNames))
					{
						mappingDimensionNames = oFF.XHashSetOfString.create();
						usedMappings.put(mappingDef.getQueryAliasName(), mappingDimensionNames);
					}
					mappingDimensionNames.add(mappingDef.getMemberName());
				}
			}
		}
		while (dimensionsIter.hasNext())
		{
			var dimension = dimensionsIter.next();
			if (dimension.isMeasureStructure() || dimension.getDimensionType() === oFF.DimensionType.ACCOUNT)
			{
				continue;
			}
			mappingDimensionNames = usedMappings.getByKey(queryAliasName);
			var dimensionName = dimension.getName();
			if (oFF.isNull(mappingDimensionNames) || !mappingDimensionNames.contains(dimensionName))
			{
				var aliasDimensionName;
				if (usedUnlinkDimensionNames.contains(dimensionName) || queryModel.getQueryManager().getSystemType() === oFF.SystemType.BW)
				{
					aliasDimensionName = oFF.XStringUtils.concatenate3(queryAliasName, ".", dimensionName);
				}
				else
				{
					aliasDimensionName = dimensionName;
				}
				usedUnlinkDimensionNames.add(dimensionName);
				var mapping;
				if (qmLink.getUnlinkedDimensionJoinType() === oFF.UnlinkedDimensionJoinType.MERGE_MEMBERS)
				{
					mapping = blendingDefinition.addNewDimensionMapping(oFF.BlendingLinkType.NONE, aliasDimensionName);
					mapping.addNewDimensionMappingDefinition(dimension, queryAliasName);
					mapping.setIsPreservingMembers(true);
				}
				else if (qmLink.getUnlinkedDimensionJoinType() === oFF.UnlinkedDimensionJoinType.CREATE_NEW_MEMBERS)
				{
					mapping = blendingDefinition.addNewDimensionMapping(oFF.BlendingLinkType.ALL_DATA, aliasDimensionName);
					mapping.addNewDimensionMappingDefinition(dimension, queryAliasName);
					if (dimension.isMeasureStructure())
					{
						mapping.addNewConstantMapping("SignedData", queryAliasName);
					}
					else
					{
						mapping.addNewConstantMapping(null, otherQueryAliasName);
					}
				}
				if (oFF.BlendingMappingUtils.isLeafDimensionUsedInBlendedDrill(aliasDimensionName, queryModel.getDatasetId(), blendedDrillOperations))
				{
					oFF.BlendingMappingUtils.autoExpandHierarchyDimension(dimension);
				}
			}
		}
	},
	getMatchingSecondaryHierarchyName:function(primaryLinkDimension, secondaryLinkDimension)
	{
			var matchingSecondaryHierarchyName = null;
		var primaryHierarchyName = primaryLinkDimension.getHierarchyName();
		var secondaryHierarchies = secondaryLinkDimension.getHierarchies();
		if (oFF.BlendingMappingUtils.isMatchableHierarchy(primaryLinkDimension, primaryHierarchyName) && oFF.notNull(secondaryHierarchies))
		{
			var hierarchyIterator = secondaryHierarchies.getObjectsIterator();
			while (oFF.isNull(matchingSecondaryHierarchyName) && hierarchyIterator.hasNext())
			{
				var hierarchyCatalogItem = hierarchyIterator.next();
				var secondaryHierarchyName = hierarchyCatalogItem.getHierarchyName();
				if (oFF.XString.isEqual(secondaryHierarchyName, primaryHierarchyName) && oFF.BlendingMappingUtils.isMatchableHierarchy(secondaryLinkDimension, secondaryHierarchyName))
				{
					matchingSecondaryHierarchyName = secondaryHierarchyName;
				}
			}
			if (oFF.isNull(matchingSecondaryHierarchyName))
			{
				var primaryDefaultHierarchy = oFF.BlendingMappingUtils.getMatchableDefaultHierarchyName(primaryLinkDimension);
				var secondaryDefaultHierarchy = oFF.BlendingMappingUtils.getMatchableDefaultHierarchyName(secondaryLinkDimension);
				if (oFF.XString.isEqual(primaryHierarchyName, primaryDefaultHierarchy) && oFF.notNull(secondaryDefaultHierarchy))
				{
					matchingSecondaryHierarchyName = secondaryDefaultHierarchy;
				}
			}
		}
		return matchingSecondaryHierarchyName;
	},
	isOutOfContextDimension:function(dimension)
	{
			return dimension.getAxisType() !== oFF.AxisType.ROWS && dimension.getAxisType() !== oFF.AxisType.COLUMNS;
	},
	isMatchableHierarchy:function(dimension, hierarchyName)
	{
			return oFF.notNull(hierarchyName) && !oFF.QTimeDimensionUtil.isDateOrTimeLikeDimension(dimension) && !oFF.QFilterAcrossModelsDimensionUtil.isNonTimeLevelBasedHierarchy(dimension, hierarchyName);
	},
	getMatchableDefaultHierarchyName:function(dimension)
	{
			var matchableDefaultHierarchyName = null;
		if (dimension.getHierarchies() !== null)
		{
			var hierarchies = dimension.getHierarchies().getObjects();
			var numberOfHierarchies = hierarchies.size();
			if (numberOfHierarchies > 0)
			{
				var defaultHierarchyName = hierarchies.get(numberOfHierarchies - 1).getHierarchyName();
				if (oFF.BlendingMappingUtils.isMatchableHierarchy(dimension, defaultHierarchyName))
				{
					matchableDefaultHierarchyName = defaultHierarchyName;
				}
			}
		}
		return matchableDefaultHierarchyName;
	},
	getSecondaryHierarchyNameToActivate:function(primaryLinkDimension, secondaryLinkDimension, linkOnMatchingHierarchies)
	{
			var secondaryHierarchyNameToActivate = null;
		var matchingSecondaryHierarchyName = oFF.BlendingMappingUtils.getMatchingSecondaryHierarchyName(primaryLinkDimension, secondaryLinkDimension);
		var secondaryMatchableDefaultHierarchyName = oFF.BlendingMappingUtils.getMatchableDefaultHierarchyName(secondaryLinkDimension);
		if (linkOnMatchingHierarchies && oFF.notNull(matchingSecondaryHierarchyName))
		{
			secondaryHierarchyNameToActivate = matchingSecondaryHierarchyName;
		}
		else if (oFF.notNull(secondaryMatchableDefaultHierarchyName))
		{
			secondaryHierarchyNameToActivate = secondaryMatchableDefaultHierarchyName;
		}
		return secondaryHierarchyNameToActivate;
	},
	processHierarchies:function(primaryLinkDimension, secondaryLinkDimension, primaryLinkDimensionOOC, linkOnMatchingHierarchies)
	{
			var primaryMatchableDefaultHierarchyName = oFF.BlendingMappingUtils.getMatchableDefaultHierarchyName(primaryLinkDimension);
		if (!oFF.QFilterUtil.hasFilterForDimension(primaryLinkDimension.getQueryModel().getFilter(), primaryLinkDimension.getName()) && primaryLinkDimensionOOC && oFF.notNull(primaryMatchableDefaultHierarchyName))
		{
			var primaryOriginalHierarchy = primaryLinkDimension.isHierarchyActive() ? primaryLinkDimension.getHierarchyName() : null;
			primaryLinkDimension.getTagging().put("originalHierarchy", primaryOriginalHierarchy);
			primaryLinkDimension.activateHierarchy(primaryMatchableDefaultHierarchyName, null, null);
		}
		if (secondaryLinkDimension.getFilter() === null)
		{
			var secondaryHierarchyNameToActivate = oFF.BlendingMappingUtils.getSecondaryHierarchyNameToActivate(primaryLinkDimension, secondaryLinkDimension, linkOnMatchingHierarchies);
			if (oFF.notNull(secondaryHierarchyNameToActivate))
			{
				var secondaryOriginalHierarchy = secondaryLinkDimension.isHierarchyActive() ? secondaryLinkDimension.getHierarchyName() : null;
				secondaryLinkDimension.getTagging().put("originalHierarchy", secondaryOriginalHierarchy);
				secondaryLinkDimension.activateHierarchy(secondaryHierarchyNameToActivate, null, null);
			}
		}
	},
	addDescriptionAttrMappingIfLinkByKey:function(primaryLinkDimension, secondaryLinkDimension, activeDimensionLink, linkMapping, primaryQueryAliasName, secondaryQueryAliasName)
	{
			var isPrimaryLinkByKey = activeDimensionLink.getFirstPart().isLinkOnKeyField() || oFF.XString.isEqual(activeDimensionLink.getFirstPart().getFieldName(), oFF.BlendingMappingUtils.ID_ATTRIBUTE_NAME);
		var isSecondaryLinkByKey = activeDimensionLink.getSecondPart().isLinkOnKeyField() || oFF.XString.isEqual(activeDimensionLink.getSecondPart().getFieldName(), oFF.BlendingMappingUtils.ID_ATTRIBUTE_NAME);
		if (isPrimaryLinkByKey || isSecondaryLinkByKey)
		{
			var primaryDescriptionField = primaryLinkDimension.getTextField();
			var secondaryDescriptionField = secondaryLinkDimension.getTextField();
			if (oFF.notNull(primaryDescriptionField) && oFF.notNull(secondaryDescriptionField))
			{
				var attributeMapping = linkMapping.addNewAttributeMappingByName(primaryDescriptionField.getName(), false);
				attributeMapping.addNewAttributeDimensionMappingDefinitionByName(primaryDescriptionField.getName(), primaryQueryAliasName);
				attributeMapping.addNewAttributeDimensionMappingDefinitionByName(secondaryDescriptionField.getName(), secondaryQueryAliasName);
			}
		}
	},
	getAttributeJoinField:function(dimensionLinkPart, dimension, process)
	{
			var joinField = null;
		var displayKeyField = null;
		if (dimensionLinkPart.getFieldName() !== null && oFF.XString.isEqual(dimensionLinkPart.getFieldName(), oFF.BlendingMappingUtils.DESCRIPTION_ATTRIBUTE_NAME) || !dimensionLinkPart.containsEmptyDescriptionField() && !dimensionLinkPart.isLinkOnKeyField())
		{
			joinField = dimension.getTextField();
			if (dimension.isHierarchyActive())
			{
				if (dimension.getQueryManager().getConvenienceCommands().isBw())
				{
					joinField = dimension.getHierarchyTextField();
				}
				displayKeyField = dimension.getHierarchyDisplayKeyField();
			}
			else
			{
				if (dimension.getQueryManager().getConvenienceCommands().isBw())
				{
					joinField = dimension.getTextField();
				}
				displayKeyField = dimension.getDisplayKeyField();
			}
		}
		else if (dimensionLinkPart.getFieldName() !== null && oFF.XString.isEqual(dimensionLinkPart.getFieldName(), oFF.BlendingMappingUtils.ID_ATTRIBUTE_NAME) || dimensionLinkPart.isLinkOnKeyField())
		{
			joinField = dimension.getDisplayKeyField() !== null ? dimension.getDisplayKeyField() : dimension.getKeyField() !== null ? dimension.getKeyField() : dimension.getFlatKeyField();
			if (dimension.isHierarchyActive())
			{
				if (dimension.getQueryManager().getConvenienceCommands().isBw())
				{
					joinField = dimension.getHierarchyKeyField() !== null ? dimension.getHierarchyKeyField() : dimension.getHierarchyDisplayKeyField() !== null ? dimension.getHierarchyDisplayKeyField() : dimension.getFlatKeyField();
				}
				displayKeyField = dimension.getHierarchyDisplayKeyField();
			}
			else
			{
				if (dimension.getQueryManager().getConvenienceCommands().isBw())
				{
					joinField = dimension.getKeyField() !== null ? dimension.getKeyField() : dimension.getDisplayKeyField() !== null ? dimension.getDisplayKeyField() : dimension.getFlatKeyField();
				}
				displayKeyField = dimension.getDisplayKeyField();
			}
		}
		else
		{
			var keyFieldName = dimension.getFlatKeyField().getName();
			var descriptionFieldName = oFF.XStringUtils.concatenate2(oFF.XString.substring(keyFieldName, 0, oFF.XString.lastIndexOf(keyFieldName, ".") + 1), dimensionLinkPart.getFieldName());
			joinField = dimension.getFieldByName(descriptionFieldName) !== null ? dimension.getFieldByName(descriptionFieldName) : dimension.getFlatKeyField() !== null ? dimension.getFlatKeyField() : dimension.getFields().get(0);
		}
		if (oFF.isNull(joinField))
		{
			joinField = dimension.getFlatKeyField() !== null ? dimension.getFlatKeyField() : dimension.getTextField() !== null ? dimension.getTextField() : dimension.getFields().get(0);
		}
		var iterator = dimension.getFields().getIterator();
		while (iterator.hasNext())
		{
			var oRequestedField = iterator.next();
			if (oRequestedField.isHierarchyPathField() && oRequestedField.isAlwaysRequested() && dimension.getQueryManager().getInitSettings().getMode() !== oFF.QueryManagerMode.BLENDING)
			{
				oRequestedField.getTagging().put("transientAlwaysRequested", "");
				oRequestedField.setAlwaysRequested(false);
			}
		}
		oFF.BlendingMappingUtils.saveOriginalResultSetFields(dimension, process);
		if (dimension.getQueryManager().getInitSettings().getMode() !== oFF.QueryManagerMode.BLENDING)
		{
			dimension.getResultSetFields().clear();
		}
		if (oFF.notNull(joinField) && joinField.getName() !== null)
		{
			dimension.getResultSetFields().add(joinField);
			dimension.getResultSetFields().add(dimension.getCubeBlendingPropertiesField());
		}
		if (oFF.notNull(displayKeyField) && displayKeyField.getName() !== null)
		{
			dimension.getResultSetFields().add(displayKeyField);
		}
		return joinField;
	},
	saveOriginalResultSetFields:function(dimension, process)
	{
			var resultSetFieldsIter = dimension.getResultSetFields().getIterator();
		var cacheKey = oFF.QCacheKey.createByContextForDimension(dimension.getContext(), dimension.getName(), null);
		var originalResultSetFields = oFF.XListOfString.create();
		process.addOriginalDimensionResultSetFields(cacheKey.getKey1(), originalResultSetFields);
		while (resultSetFieldsIter.hasNext())
		{
			var resultSetField = resultSetFieldsIter.next();
			originalResultSetFields.add(resultSetField.getName());
		}
	}
};

oFF.BlendingSortUtils = {

	addSortByDimension:function(blendableQueryManager, queryModel, sortingManager, sort)
	{
			var keyField = queryModel.getFieldByName(sort.getFieldName());
		var sortField = null;
		if (oFF.notNull(blendableQueryManager) && oFF.isNull(keyField))
		{
			keyField = oFF.BlendingUtils.getBlendedFieldFromLeafField(sort.getFieldName(), sort.getDatasetId(), blendableQueryManager, queryModel);
		}
		var dimension = oFF.BlendingUtils.getBlendedDimensionFromLeafDimension(keyField.getDimension().getName(), sort.getDatasetId(), blendableQueryManager, queryModel);
		var supportsSortDirectionForHierarchySortType = queryModel.getModelCapabilities().supportsSortDirectionForHierarchySortType();
		var customSort = sort.getCustomSortDefinition();
		var supportsLocaleSorting = queryModel.getModelCapabilities().supportsLocaleSorting();
		if (oFF.notNull(customSort))
		{
			sortingManager.removeDimensionSorting(dimension);
			sortField = keyField;
			var startSorts = customSort.getSortFromStart();
			if (oFF.notNull(startSorts) && startSorts.hasElements())
			{
				oFF.BlendingSortUtils.setCustomSortForSortingManager(sortingManager, sortField, sort, supportsLocaleSorting, supportsSortDirectionForHierarchySortType, startSorts, oFF.CustomSortPosition.TOP);
			}
			var endSorts = customSort.getSortFromEnd();
			if (oFF.notNull(endSorts) && endSorts.hasElements())
			{
				oFF.BlendingSortUtils.setCustomSortForSortingManager(sortingManager, sortField, sort, supportsLocaleSorting, supportsSortDirectionForHierarchySortType, endSorts, oFF.CustomSortPosition.BOTTOM);
			}
			return;
		}
		var isFieldSorting = false;
		var isValueTypeTimeOrDate = false;
		if (oFF.notNull(blendableQueryManager))
		{
			var sortFieldValueType = blendableQueryManager.getQueryManagerByDatasetId(sort.getDatasetId()).getQueryModel().getFieldByName(sort.getFieldName()).getValueType();
			isValueTypeTimeOrDate = sortFieldValueType === oFF.XValueType.DATE || sortFieldValueType === oFF.XValueType.DATE_TIME;
		}
		if (isValueTypeTimeOrDate || oFF.QTimeDimensionUtil.isDateOrTimeLikeDimension(dimension) || oFF.QSortUtils.getDefaultDimensionSortType(dimension) === oFF.SortType.MEMBER_KEY)
		{
			sortField = keyField;
			if (sortingManager.supportsDimensionSorting(dimension, oFF.SortType.HIERARCHY) && dimension.isHierarchyActive())
			{
				oFF.BlendingSortUtils.addFieldOrDimensionSorting(sortingManager, sortField, sort, supportsLocaleSorting, isFieldSorting, supportsSortDirectionForHierarchySortType, null, null);
			}
			else if (sortingManager.supportsFieldSorting(sortField))
			{
				isFieldSorting = true;
				oFF.BlendingSortUtils.addFieldOrDimensionSorting(sortingManager, sortField, sort, supportsLocaleSorting, isFieldSorting, supportsSortDirectionForHierarchySortType, null, null);
			}
		}
		else if (sort.isDisplayedAsId())
		{
			sortField = keyField;
			if (sortingManager.supportsFieldSorting(null))
			{
				isFieldSorting = true;
				oFF.BlendingSortUtils.addFieldOrDimensionSorting(sortingManager, sortField, sort, supportsLocaleSorting, isFieldSorting, supportsSortDirectionForHierarchySortType, null, null);
			}
		}
		else
		{
			sortField = dimension.getTextField();
			if (oFF.isNull(sortField))
			{
				sortField = keyField;
			}
			if (sortingManager.supportsFieldSorting(null))
			{
				isFieldSorting = true;
				oFF.BlendingSortUtils.addFieldOrDimensionSorting(sortingManager, sortField, sort, supportsLocaleSorting, isFieldSorting, supportsSortDirectionForHierarchySortType, null, null);
			}
		}
		if (sortingManager.supportsFieldSorting(null))
		{
			var displayKeyField = dimension.getDisplayKeyField();
			isFieldSorting = true;
			oFF.BlendingSortUtils.addFieldOrDimensionSorting(sortingManager, displayKeyField, sort, supportsLocaleSorting, isFieldSorting, supportsSortDirectionForHierarchySortType, null, null);
		}
		else if (sortingManager.supportsDimensionSorting(dimension, null))
		{
			isFieldSorting = false;
			oFF.BlendingSortUtils.addFieldOrDimensionSorting(sortingManager, sortField, sort, supportsLocaleSorting, isFieldSorting, supportsSortDirectionForHierarchySortType, null, null);
		}
	},
	addFieldOrDimensionSorting:function(sortingManager, sortField, sort, supportsLocaleSorting, isFieldSorting, supportsSortDirectionForHierarchySortType, customSortOrder, customSortPosition)
	{
			var sortingObject = null;
		var sortType = null;
		if (isFieldSorting)
		{
			sortingObject = sortingManager.newFieldSorting(sortField);
			sortingManager.addSortOperation(sortingObject);
			sortType = oFF.SortType.FIELD;
		}
		else
		{
			var dimension = sortField.getDimension();
			sortingObject = sortingManager.getDimensionSorting(dimension, false);
			if (oFF.notNull(sortingObject) && (oFF.isNull(customSortOrder) || customSortOrder.isEmpty()))
			{
				sortingManager.removeDimensionSorting(dimension);
				sortingObject = null;
			}
			if (oFF.isNull(sortingObject))
			{
				sortingObject = sortingManager.getDimensionSorting(dimension, true);
			}
			if (oFF.notNull(customSortOrder) && !customSortOrder.isEmpty())
			{
				sortingObject = sortingManager.newDimensionSorting(dimension);
				sortingObject.setName(oFF.XStringUtils.concatenateWithInt(oFF.QSortUtils.SORT_OPERATION_INFO_PREFIX, oFF.QSortUtils.SORT_OPERATION_INFO_INDEX++));
				sortingManager.addSortOperation(sortingObject);
			}
			sortType = oFF.QSortUtils.getSortType(sortingObject, sortField, supportsSortDirectionForHierarchySortType, dimension.isHierarchyActive());
		}
		if (oFF.notNull(sortingObject) && oFF.notNull(sortType))
		{
			oFF.QSortUtils.addSortDirectionAndBreakGrouping(sortingManager, sortingObject, sortType, !sort.getPreserveGrouping(), sort.getSortDirection());
			if (supportsLocaleSorting)
			{
				sortingObject.setLocale(sort.getContextLanguage());
				sortingObject.setIsCaseSensitive(false);
			}
		}
		oFF.QSortUtils.applyCustomSortToSortingObject(customSortOrder, customSortPosition, sortingObject);
	},
	setCustomSortForSortingManager:function(sortingManager, sortField, sort, supportsLocaleSorting, supportsSortDirectionForHierarchySortType, customSortOrder, customSortPosition)
	{
			if (sortingManager.supportsFieldSorting(null))
		{
			oFF.BlendingSortUtils.addFieldOrDimensionSorting(sortingManager, sortField, sort, supportsLocaleSorting, true, supportsSortDirectionForHierarchySortType, customSortOrder, customSortPosition);
		}
		else
		{
			oFF.BlendingSortUtils.addFieldOrDimensionSorting(sortingManager, sortField, sort, supportsLocaleSorting, false, supportsSortDirectionForHierarchySortType, customSortOrder, customSortPosition);
		}
	}
};

oFF.DependentPersistedQueryInfo = function() {};
oFF.DependentPersistedQueryInfo.prototype = new oFF.XObject();
oFF.DependentPersistedQueryInfo.prototype._ff_c = "DependentPersistedQueryInfo";

oFF.DependentPersistedQueryInfo.create = function(systemName, inaQuery)
{
	var info = new oFF.DependentPersistedQueryInfo();
	info.m_systemName = systemName;
	info.m_inaQuery = inaQuery;
	return info;
};
oFF.DependentPersistedQueryInfo.prototype.m_inaQuery = null;
oFF.DependentPersistedQueryInfo.prototype.m_systemName = null;
oFF.DependentPersistedQueryInfo.prototype.releaseObject = function()
{
	this.m_inaQuery = oFF.XObjectExt.release(this.m_inaQuery);
	this.m_systemName = null;
};
oFF.DependentPersistedQueryInfo.prototype.getInaQuery = function()
{
	if (oFF.notNull(this.m_inaQuery))
	{
		return this.m_inaQuery.getStringRepresentation();
	}
	return null;
};
oFF.DependentPersistedQueryInfo.prototype.getSystemName = function()
{
	return this.m_systemName;
};

oFF.AbstractSpatialClustering = function() {};
oFF.AbstractSpatialClustering.prototype = new oFF.XObject();
oFF.AbstractSpatialClustering.prototype._ff_c = "AbstractSpatialClustering";

oFF.AbstractSpatialClustering.ORDER = null;
oFF.AbstractSpatialClustering.prototype.m_clusterField = null;
oFF.AbstractSpatialClustering.prototype.m_isActive = false;
oFF.AbstractSpatialClustering.prototype.m_thresholdNumberOfPoints = 0;
oFF.AbstractSpatialClustering.prototype.m_parameters = null;
oFF.AbstractSpatialClustering.prototype.m_dimensions = null;
oFF.AbstractSpatialClustering.prototype.setupSpatialClustering = function(spatialClusterContext)
{
	oFF.XObject.prototype.setup.call( this );
	if (oFF.isNull(oFF.AbstractSpatialClustering.ORDER))
	{
		this.createOrder();
	}
	this.m_parameters = oFF.XHashMapByString.create();
	this.m_dimensions = oFF.XListOfString.create();
	this.m_isActive = true;
	this.m_thresholdNumberOfPoints = -1;
	if (oFF.notNull(spatialClusterContext))
	{
		spatialClusterContext.setSpatialClusterSettings(this);
	}
};
oFF.AbstractSpatialClustering.prototype.cloneClustering = function(clone)
{
	clone.setActive(this.isActive());
	if (this.getClusterField() !== null)
	{
		clone.setClusterField(this.getClusterField());
	}
	clone.setThresholdNumberOfPoints(this.getThresholdNumberOfPoints());
};
oFF.AbstractSpatialClustering.prototype.createOrder = function()
{
	oFF.AbstractSpatialClustering.ORDER = oFF.XHashMapByString.create();
	var dbScanParameter = oFF.XArrayOfString.create(2);
	dbScanParameter.set(0, "EPS");
	dbScanParameter.set(1, "MinPoints");
	oFF.AbstractSpatialClustering.ORDER.put(oFF.ClusterAlgorithm.DB_SCAN.getName(), dbScanParameter);
	var gridParameter = oFF.XArrayOfString.create(6);
	gridParameter.set(0, "XCells");
	gridParameter.set(1, "YCells");
	gridParameter.set(2, "XLowerBound");
	gridParameter.set(3, "YLowerBound");
	gridParameter.set(4, "XUpperBound");
	gridParameter.set(5, "YUpperBound");
	oFF.AbstractSpatialClustering.ORDER.put(oFF.ClusterAlgorithm.GRID.getName(), gridParameter);
	var kMeansParameter = oFF.XArrayOfString.create(4);
	kMeansParameter.set(0, "Clusters");
	kMeansParameter.set(1, "MaxIterations");
	kMeansParameter.set(2, "Threshold");
	kMeansParameter.set(3, "Init");
	oFF.AbstractSpatialClustering.ORDER.put(oFF.ClusterAlgorithm.K_MEANS.getName(), kMeansParameter);
};
oFF.AbstractSpatialClustering.prototype.isEqualTo = function(other)
{
	if (oFF.isNull(other))
	{
		return false;
	}
	if (this === other)
	{
		return true;
	}
	var xOther = other;
	if (xOther.getClusterAlgorithm() !== this.getClusterAlgorithm())
	{
		return false;
	}
	if (xOther.isActive() !== this.isActive())
	{
		return false;
	}
	if (xOther.getClusterField() !== this.getClusterField())
	{
		return false;
	}
	if (xOther.getThresholdNumberOfPoints() !== this.getThresholdNumberOfPoints())
	{
		return false;
	}
	return this.areParametersEqual(oFF.AbstractSpatialClustering.ORDER.getByKey(xOther.getClusterAlgorithm().getName()), this.getParameters(), xOther.getParameters());
};
oFF.AbstractSpatialClustering.prototype.areParametersEqual = function(order, thisParameter, otherParameter)
{
	for (var i = 0; i < order.size(); i++)
	{
		var name = order.get(i);
		if (thisParameter.containsKey(name) !== otherParameter.containsKey(name))
		{
			return false;
		}
		var thisValue = thisParameter.getByKey(name);
		if (oFF.notNull(thisValue))
		{
			if (!thisValue.isEqualTo(otherParameter.getByKey(name)))
			{
				return false;
			}
		}
	}
	return true;
};
oFF.AbstractSpatialClustering.prototype.releaseObject = function()
{
	this.m_parameters = oFF.XObjectExt.release(this.m_parameters);
	this.m_dimensions = oFF.XObjectExt.release(this.m_dimensions);
	this.m_clusterField = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.AbstractSpatialClustering.prototype.getClusterField = function()
{
	return oFF.XWeakReferenceUtil.getHardRef(this.m_clusterField);
};
oFF.AbstractSpatialClustering.prototype.getParameters = function()
{
	return this.m_parameters;
};
oFF.AbstractSpatialClustering.prototype.isActive = function()
{
	return this.m_isActive;
};
oFF.AbstractSpatialClustering.prototype.setActive = function(isActive)
{
	this.m_isActive = isActive;
};
oFF.AbstractSpatialClustering.prototype.setClusterField = function(field)
{
	oFF.XObjectExt.assertNotNullExt(field, "The cluster field must not be null!");
	if (!field.getValueType().isSpatial())
	{
		throw oFF.XException.createIllegalArgumentException("The cluster field must be spatial!");
	}
	this.m_clusterField = oFF.XWeakReferenceUtil.getWeakRef(field);
};
oFF.AbstractSpatialClustering.prototype.addDimension = function(dimensionName)
{
	this.m_dimensions.add(dimensionName);
};
oFF.AbstractSpatialClustering.prototype.getDimensions = function()
{
	return this.m_dimensions;
};
oFF.AbstractSpatialClustering.prototype.setThresholdNumberOfPoints = function(thresholdNumberOfPoints)
{
	this.m_thresholdNumberOfPoints = thresholdNumberOfPoints;
};
oFF.AbstractSpatialClustering.prototype.getThresholdNumberOfPoints = function()
{
	return this.m_thresholdNumberOfPoints;
};

oFF.CommandSpaceFactory = {

	s_factory:null,
	setInstance:function(factory)
	{
			oFF.CommandSpaceFactory.s_factory = factory;
	},
	createCommandSpaceWithSelection:function(application, sigSelExpression)
	{
			return oFF.CommandSpaceFactory.s_factory.createCommandSpaceWithSelection(application, sigSelExpression);
	},
	createCommandSpaceWithElement:function(application, modelComponent)
	{
			return oFF.CommandSpaceFactory.s_factory.createCommandSpaceWithElement(application, modelComponent);
	}
};

oFF.CommandSpaceFactoryDummyImpl = function() {};
oFF.CommandSpaceFactoryDummyImpl.prototype = new oFF.XObject();
oFF.CommandSpaceFactoryDummyImpl.prototype._ff_c = "CommandSpaceFactoryDummyImpl";

oFF.CommandSpaceFactoryDummyImpl.create = function()
{
	return new oFF.CommandSpaceFactoryDummyImpl();
};
oFF.CommandSpaceFactoryDummyImpl.prototype.createCommandSpaceWithSelection = function(application, sigSelExpression)
{
	return null;
};
oFF.CommandSpaceFactoryDummyImpl.prototype.createCommandSpaceWithElement = function(application, modelComponent)
{
	return null;
};

oFF.RemoteBlendingCacheEntry = function() {};
oFF.RemoteBlendingCacheEntry.prototype = new oFF.XObject();
oFF.RemoteBlendingCacheEntry.prototype._ff_c = "RemoteBlendingCacheEntry";

oFF.RemoteBlendingCacheEntry.create = function(view, cube, dataSourceName)
{
	var entry = new oFF.RemoteBlendingCacheEntry();
	entry.m_view = view;
	entry.m_cube = cube;
	entry.m_dataSourceName = dataSourceName;
	return entry;
};
oFF.RemoteBlendingCacheEntry.prototype.m_view = null;
oFF.RemoteBlendingCacheEntry.prototype.m_cube = null;
oFF.RemoteBlendingCacheEntry.prototype.m_dataSourceName = null;
oFF.RemoteBlendingCacheEntry.prototype.releaseObject = function()
{
	oFF.XObject.prototype.releaseObject.call( this );
	this.m_view = null;
	this.m_cube = null;
	this.m_dataSourceName = null;
};
oFF.RemoteBlendingCacheEntry.prototype.getView = function()
{
	return this.m_view;
};
oFF.RemoteBlendingCacheEntry.prototype.getCube = function()
{
	return this.m_cube;
};
oFF.RemoteBlendingCacheEntry.prototype.getDataSourceName = function()
{
	return this.m_dataSourceName;
};

oFF.ComponentStateRef = function() {};
oFF.ComponentStateRef.prototype = new oFF.XObject();
oFF.ComponentStateRef.prototype._ff_c = "ComponentStateRef";

oFF.ComponentStateRef.create = function(modCounter, stateId)
{
	var componentStateRef = new oFF.ComponentStateRef();
	componentStateRef.m_modCounter = modCounter;
	componentStateRef.m_stateId = stateId;
	return componentStateRef;
};
oFF.ComponentStateRef.prototype.m_modCounter = 0;
oFF.ComponentStateRef.prototype.m_stateId = null;
oFF.ComponentStateRef.prototype.getModCounter = function()
{
	return this.m_modCounter;
};
oFF.ComponentStateRef.prototype.getStateId = function()
{
	return this.m_stateId;
};
oFF.ComponentStateRef.prototype.toString = function()
{
	return oFF.XStringUtils.concatenate3(oFF.XInteger.convertToString(this.m_modCounter), "-", this.m_stateId);
};

oFF.OlapEnvState = function() {};
oFF.OlapEnvState.prototype = new oFF.XObject();
oFF.OlapEnvState.prototype._ff_c = "OlapEnvState";

oFF.OlapEnvState.create = function()
{
	var olapEnvState = new oFF.OlapEnvState();
	olapEnvState.m_queryManagersState = oFF.XHashMapByString.create();
	return olapEnvState;
};
oFF.OlapEnvState.prototype.filterManagerState = null;
oFF.OlapEnvState.prototype.sharedObjectsState = null;
oFF.OlapEnvState.prototype.m_queryManagersState = null;
oFF.OlapEnvState.prototype.getFilterManagerState = function()
{
	return this.filterManagerState;
};
oFF.OlapEnvState.prototype.setFilterManagerState = function(filterManagerState)
{
	this.filterManagerState = filterManagerState;
};
oFF.OlapEnvState.prototype.getSharedObjectsState = function()
{
	return this.sharedObjectsState;
};
oFF.OlapEnvState.prototype.setSharedObjectsState = function(sharedObjectsState)
{
	this.sharedObjectsState = sharedObjectsState;
};
oFF.OlapEnvState.prototype.getQueryManagersState = function()
{
	return this.m_queryManagersState;
};

oFF.StateStackEntry = function() {};
oFF.StateStackEntry.prototype = new oFF.XObject();
oFF.StateStackEntry.prototype._ff_c = "StateStackEntry";

oFF.StateStackEntry.create = function(uuid, state)
{
	var entry = new oFF.StateStackEntry();
	entry.uuid = uuid;
	entry.state = state;
	entry.olapStateRefs = oFF.XHashSetOfString.create();
	return entry;
};
oFF.StateStackEntry.prototype.uuid = null;
oFF.StateStackEntry.prototype.state = null;
oFF.StateStackEntry.prototype.olapStateRefs = null;
oFF.StateStackEntry.prototype.getState = function()
{
	return this.state;
};
oFF.StateStackEntry.prototype.getName = function()
{
	return this.uuid;
};
oFF.StateStackEntry.prototype.getOlapStateRefs = function()
{
	return this.olapStateRefs;
};

oFF.CustomHierarchySessionData = function() {};
oFF.CustomHierarchySessionData.prototype = new oFF.XObject();
oFF.CustomHierarchySessionData.prototype._ff_c = "CustomHierarchySessionData";

oFF.CustomHierarchySessionData.CUSTOM_HIERARCHY_SESSION_DATA = "CustomHierarchySessionData";
oFF.CustomHierarchySessionData.create = function()
{
	var newObj = new oFF.CustomHierarchySessionData();
	newObj.m_createdCustomHierarchies = oFF.XList.create();
	newObj.m_activeHierarchySubmits = oFF.XList.create();
	return newObj;
};
oFF.CustomHierarchySessionData.prototype.m_createdCustomHierarchies = null;
oFF.CustomHierarchySessionData.prototype.m_activeHierarchySubmits = null;
oFF.CustomHierarchySessionData.prototype.releaseObject = function()
{
	this.m_createdCustomHierarchies = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_createdCustomHierarchies);
	this.m_activeHierarchySubmits = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_activeHierarchySubmits);
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.CustomHierarchySessionData.prototype.getHierarchyInAResponse = function(customHierarchyDefinition)
{
	for (var i = 0; i < this.m_createdCustomHierarchies.size(); i++)
	{
		var definition = this.m_createdCustomHierarchies.get(i);
		if (definition.isEqualTo(customHierarchyDefinition))
		{
			return definition.getInaHierarchy().getPermaCopy();
		}
	}
	return null;
};
oFF.CustomHierarchySessionData.prototype.registerOnActiveHierarchySubmit = function(customHierarchyDefinition, listener)
{
	var activeSubmit = this.getActiveSubmit(customHierarchyDefinition);
	if (oFF.notNull(activeSubmit))
	{
		activeSubmit.getSecondObject().add(listener);
		return true;
	}
	return false;
};
oFF.CustomHierarchySessionData.prototype.flagHierarchySubmitActive = function(customHierarchyDefinition)
{
	var activeSubmit = this.getActiveSubmit(customHierarchyDefinition);
	if (oFF.isNull(activeSubmit))
	{
		this.m_activeHierarchySubmits.add(oFF.XPair.create(customHierarchyDefinition, oFF.XList.create()));
	}
};
oFF.CustomHierarchySessionData.prototype.finishHierarchySubmit = function(customHierarchyDefinition, inaHierarchy)
{
	if (oFF.notNull(customHierarchyDefinition) && oFF.notNull(inaHierarchy))
	{
		var extendedHierarchyDefinition = oFF.QCustomHierarchyDefinitionExt.createExtendedHierarchyDefinition(customHierarchyDefinition, inaHierarchy.getPermaCopy());
		this.m_createdCustomHierarchies.removeElement(this.getHierarchyDefinitionByName(customHierarchyDefinition.getName()));
		this.m_createdCustomHierarchies.add(extendedHierarchyDefinition);
	}
	this.notifyListenersOnHierarchySubmit(customHierarchyDefinition, inaHierarchy);
};
oFF.CustomHierarchySessionData.prototype.notifyListenersOnHierarchySubmit = function(customHierarchyDefinition, inaHierarchy)
{
	var activeSubmit = this.getActiveSubmit(customHierarchyDefinition);
	if (oFF.notNull(activeSubmit))
	{
		var listeners = activeSubmit.getSecondObject();
		for (var i = 0; i < listeners.size(); i++)
		{
			listeners.get(i).onCustomHierarchySubmitted(customHierarchyDefinition, inaHierarchy);
		}
		this.m_activeHierarchySubmits.removeElement(activeSubmit);
		oFF.XObjectExt.release(activeSubmit);
	}
};
oFF.CustomHierarchySessionData.prototype.getHierarchyDefinitionByName = function(hierarchyName)
{
	if (oFF.XStringUtils.isNotNullAndNotEmpty(hierarchyName))
	{
		for (var i = 0; i < this.m_createdCustomHierarchies.size(); i++)
		{
			var hierarchyDefinition = this.m_createdCustomHierarchies.get(i);
			if (oFF.XString.isEqual(hierarchyDefinition.getName(), hierarchyName))
			{
				return hierarchyDefinition;
			}
		}
	}
	return null;
};
oFF.CustomHierarchySessionData.prototype.getHierarchyDefinitionNames = function()
{
	var hierarchiesNames = oFF.XListOfString.create();
	for (var i = 0; i < this.m_createdCustomHierarchies.size(); i++)
	{
		var customHierarchyName = this.m_createdCustomHierarchies.get(i).getName();
		if (oFF.XStringUtils.isNotNullAndNotEmpty(customHierarchyName))
		{
			hierarchiesNames.add(customHierarchyName);
		}
	}
	return hierarchiesNames;
};
oFF.CustomHierarchySessionData.prototype.getActiveSubmit = function(customHierarchyDefinition)
{
	for (var i = 0; i < this.m_activeHierarchySubmits.size(); i++)
	{
		var activeSubmit = this.m_activeHierarchySubmits.get(i);
		if (activeSubmit.getFirstObject().isEqualTo(customHierarchyDefinition))
		{
			return activeSubmit;
		}
	}
	return null;
};

oFF.PlanningFactory = {

	s_factory:null,
	setInstance:function(factory)
	{
			oFF.PlanningFactory.s_factory = factory;
	},
	createPlanningManager:function(queryManager)
	{
			return oFF.PlanningFactory.s_factory.createPlanningManager(queryManager);
	}
};

oFF.PlanningManagerDummy = function() {};
oFF.PlanningManagerDummy.prototype = new oFF.XObject();
oFF.PlanningManagerDummy.prototype._ff_c = "PlanningManagerDummy";

oFF.PlanningManagerDummy.create = function(queryManager)
{
	var newObj = new oFF.PlanningManagerDummy();
	newObj.setupExt(queryManager);
	return newObj;
};
oFF.PlanningManagerDummy.prototype.m_messageManager = null;
oFF.PlanningManagerDummy.prototype.setupExt = function(queryManager)
{
	this.m_messageManager = oFF.MessageManager.createMessageManagerExt(queryManager.getSession());
};
oFF.PlanningManagerDummy.prototype.isPublicVersionEditPossible = function()
{
	return false;
};
oFF.PlanningManagerDummy.prototype.hasChangedValues = function()
{
	return false;
};
oFF.PlanningManagerDummy.prototype.hasChangedValueLocks = function()
{
	return false;
};
oFF.PlanningManagerDummy.prototype.hasChangedCells = function()
{
	return false;
};
oFF.PlanningManagerDummy.prototype.transferNewValues = function() {};
oFF.PlanningManagerDummy.prototype.resetNewValues = function() {};
oFF.PlanningManagerDummy.prototype.hasNewValues = function()
{
	return false;
};
oFF.PlanningManagerDummy.prototype.setDataEntryReadOnly = function(dataEntryReadOnly) {};
oFF.PlanningManagerDummy.prototype.isDataEntryReadOnly = function()
{
	return true;
};
oFF.PlanningManagerDummy.prototype.isDataEntryEnabled = function()
{
	return false;
};
oFF.PlanningManagerDummy.prototype.getPlanningModel = function()
{
	return null;
};
oFF.PlanningManagerDummy.prototype.getDataArea = function()
{
	return null;
};
oFF.PlanningManagerDummy.prototype.createDataAreaCommand = function(commandType)
{
	return null;
};
oFF.PlanningManagerDummy.prototype.createDataAreaCommandRefresh = function()
{
	return null;
};
oFF.PlanningManagerDummy.prototype.createDataAreaCommandDocSave = function()
{
	return null;
};
oFF.PlanningManagerDummy.prototype.createDataAreaCommandDocReset = function()
{
	return null;
};
oFF.PlanningManagerDummy.prototype.getPlanningMode = function()
{
	return oFF.PlanningMode.SERVER_DEFAULT;
};
oFF.PlanningManagerDummy.prototype.setPlanningMode = function(planningMode) {};
oFF.PlanningManagerDummy.prototype.getPlanningRestriction = function()
{
	return oFF.PlanningVersionRestrictionType.SERVER_DEFAULT;
};
oFF.PlanningManagerDummy.prototype.setPlanningRestriction = function(restrictionType) {};
oFF.PlanningManagerDummy.prototype.supportsDataEntryReadOnly = function()
{
	return false;
};
oFF.PlanningManagerDummy.prototype.getPlanningVersionIdentifier = function(versionId, sharedVersion, versionOwner)
{
	return null;
};
oFF.PlanningManagerDummy.prototype.getPlanningVersionSettings = function(versionIdentifier, sequenceId, useExternalView)
{
	return null;
};
oFF.PlanningManagerDummy.prototype.getPlanningVersionSettingsSimple = function(versionId, sequenceId, useExternalView)
{
	return null;
};
oFF.PlanningManagerDummy.prototype.addPlanningVersionSettings = function(sequenceSettings)
{
	return null;
};
oFF.PlanningManagerDummy.prototype.deletePlanningVersionSettings = function(versionIdentifier)
{
	return null;
};
oFF.PlanningManagerDummy.prototype.getAllPlanningVersionSettings = function()
{
	return null;
};
oFF.PlanningManagerDummy.prototype.setPlanningVersionSettingsMode = function(settingsMode) {};
oFF.PlanningManagerDummy.prototype.getPlanningVersionSettingsMode = function()
{
	return null;
};
oFF.PlanningManagerDummy.prototype.setDataEntryEnabled = function(dataEntryEnabled) {};
oFF.PlanningManagerDummy.prototype.initializeDataAreaState = function()
{
	return this.m_messageManager;
};
oFF.PlanningManagerDummy.prototype.setPublicVersionEditPossible = function(publicVersionEdit) {};
oFF.PlanningManagerDummy.prototype.setVersionAliasById = function(aliasName, versionId) {};
oFF.PlanningManagerDummy.prototype.removeVersionAlias = function(aliasName) {};
oFF.PlanningManagerDummy.prototype.clearVersionAliases = function() {};
oFF.PlanningManagerDummy.prototype.getVersionAliases = function()
{
	return null;
};

oFF.PlanningManagerFactoryDummyImpl = function() {};
oFF.PlanningManagerFactoryDummyImpl.prototype = new oFF.XObject();
oFF.PlanningManagerFactoryDummyImpl.prototype._ff_c = "PlanningManagerFactoryDummyImpl";

oFF.PlanningManagerFactoryDummyImpl.create = function()
{
	return new oFF.PlanningManagerFactoryDummyImpl();
};
oFF.PlanningManagerFactoryDummyImpl.prototype.createPlanningManager = function(queryManager)
{
	return oFF.PlanningManagerDummy.create(queryManager);
};

oFF.QInAConverter = {

	s_lookupCtErrorHandlingMode:null,
	s_lookupCtErrorHandlingModeIna:null,
	s_lookupUnitType:null,
	s_lookupUnitTypeIna:null,
	s_lookupComparison:null,
	s_lookupComparisonIna:null,
	s_lookupPresentationType:null,
	s_lookupPresentationTypeIna:null,
	s_lookupInfoObjectType:null,
	s_lookupInfoObjectTypeIna:null,
	s_lookupVisibilityType:null,
	s_lookupVisibilityTypeIna:null,
	s_lookupReadMode:null,
	s_lookupReadModeIna:null,
	s_lookupEncoding:null,
	s_lookupSortType:null,
	s_lookupSortTypeIna:null,
	s_lookupAggregationType:null,
	s_lookupAggregationTypeIna:null,
	s_lookupComponentType:null,
	s_lookupComponentTypeIna:null,
	s_lookupValueType:null,
	s_lookupValueTypeIna:null,
	s_lookupCellValueType:null,
	s_textTransformation:null,
	s_textTransformationIna:null,
	s_lookupAlertLevelInt:null,
	s_lookupDimensionTypeInt:null,
	s_lookupResultsetState:null,
	s_lookupValueException:null,
	s_lookupAxisType:null,
	s_lookupAxisTypeIna:null,
	s_lookupSingleValueCalculation:null,
	s_lookupResultCalculation:null,
	s_lookupMemberNavigationTypeIna:null,
	s_lookupWindowFunctionType:null,
	s_lookupWindowFunctionTypeIna:null,
	s_lookupCategory:null,
	s_lookupCategoryIna:null,
	s_lookupRateType:null,
	s_lookupRateTypeIna:null,
	s_lookupProviderType:null,
	s_lookupProviderTypeIna:null,
	s_lookupProviderTypeFallbackIna:null,
	s_lookupProcessingType:null,
	s_lookupProcessingTypeIna:null,
	s_lookupReturnedDataSelection:null,
	s_lookupReturnedDataSelectionIna:null,
	s_lookupDocumentIdsScope:null,
	s_lookupDocumentIdsScopeIna:null,
	s_lookupDocumentIdsAction:null,
	s_lookupDocumentIdsActionIna:null,
	s_lookupDocumentSupportType:null,
	s_lookupDocumentSupportTypeIna:null,
	s_lookupCellChartType:null,
	s_lookupCellChartTypeIna:null,
	s_lookupCellChartOrientation:null,
	s_lookupCellChartOrientationIna:null,
	s_lookupProtocolBindingType:null,
	s_lookupProtocolBindingTypeIna:null,
	s_lookupSemanticBindingType:null,
	s_lookupSemanticBindingTypeIna:null,
	s_lookupRunningTotalOperator:null,
	s_lookupRunningTotalOperatorIna:null,
	s_lookupSignPresentation:null,
	s_lookupSignPresentationIna:null,
	s_lookupCurrencyPresentation:null,
	s_lookupCurrencyPresentationIna:null,
	s_lookupScaleFormat:null,
	s_lookupScaleFormatIna:null,
	s_lookupScaleAndUnitPlacement:null,
	s_lookupScaleAndUnitPlacementIna:null,
	s_lookupDateRangeGranularity:null,
	s_lookupDateRangeGranularityIna:null,
	s_lookupDimensionVisibilityInt:null,
	staticSetup:function()
	{
			oFF.QInAConverter.setupCtErrorHandlingMode();
		oFF.QInAConverter.setupRateType();
		oFF.QInAConverter.setupCategory();
		oFF.QInAConverter.setupAxisType();
		oFF.QInAConverter.setupUnitType();
		oFF.QInAConverter.setupDimensionType();
		oFF.QInAConverter.setupAlertLevel();
		oFF.QInAConverter.setupTextTransformation();
		oFF.QInAConverter.setupValueTypeMap();
		oFF.QInAConverter.setupComparisonMapping();
		oFF.QInAConverter.setupAggregationTypeMapping();
		oFF.QInAConverter.setupPresentationMapping();
		oFF.QInAConverter.setupProviderType();
		oFF.QInAConverter.setupInfoObjectType();
		oFF.QInAConverter.setupVisibilityMapping();
		oFF.QInAConverter.setupReadmodeMapping();
		oFF.QInAConverter.setupEncoding();
		oFF.QInAConverter.setupSortingMapping();
		oFF.QInAConverter.setupComponentTypeMapping();
		oFF.QInAConverter.setupMemberNavigationType();
		oFF.QInAConverter.setupResultSetState();
		oFF.QInAConverter.setupValueException();
		oFF.QInAConverter.setupSingleValueCalculation();
		oFF.QInAConverter.setupWindowFunctionTypeMapping();
		oFF.QInAConverter.setupResultCalculation();
		oFF.QInAConverter.setupValueDomain();
		oFF.QInAConverter.setupReturnedDataSelectionMapping();
		oFF.QInAConverter.setupCellChartOrientationMapping();
		oFF.QInAConverter.setupCellChartTypeMapping();
		oFF.QInAConverter.setupDocumentIdsScope();
		oFF.QInAConverter.setupDocumentIdsAction();
		oFF.QInAConverter.setupDocumentSupportType();
		oFF.QInAConverter.setupProtocolBindingType();
		oFF.QInAConverter.setupSemanticBindingType();
		oFF.QInAConverter.setupRunningTotalOperator();
		oFF.QInAConverter.setupCurrencyPresentation();
		oFF.QInAConverter.setupScaleAndUnitPlacement();
		oFF.QInAConverter.setupDateRangeGranularity();
		oFF.QInAConverter.setupScaleFormat();
		oFF.QInAConverter.setupSignPresentation();
		oFF.QInAConverter.setupDimensionVisibility();
	},
	setupUnitType:function()
	{
			oFF.QInAConverter.s_lookupUnitType = oFF.XHashMapByString.create();
		oFF.QInAConverter.s_lookupUnitTypeIna = oFF.XHashMapOfStringByString.create();
		oFF.QInAConverter.mapConstant(oFF.QInAConverter.s_lookupUnitType, oFF.QInAConverter.s_lookupUnitTypeIna, oFF.UnitType.CONVERSION_FAILED, "CONVERSION_FAILED");
		oFF.QInAConverter.mapConstant(oFF.QInAConverter.s_lookupUnitType, oFF.QInAConverter.s_lookupUnitTypeIna, oFF.UnitType.CURRENCY, "CURRENCY");
		oFF.QInAConverter.mapConstant(oFF.QInAConverter.s_lookupUnitType, oFF.QInAConverter.s_lookupUnitTypeIna, oFF.UnitType.CURRENCY, "CUR");
		oFF.QInAConverter.mapConstant(oFF.QInAConverter.s_lookupUnitType, oFF.QInAConverter.s_lookupUnitTypeIna, oFF.UnitType.UNIT, "UNIT");
		oFF.QInAConverter.mapConstant(oFF.QInAConverter.s_lookupUnitType, oFF.QInAConverter.s_lookupUnitTypeIna, oFF.UnitType.UNIT, "UNI");
		oFF.QInAConverter.mapConstant(oFF.QInAConverter.s_lookupUnitType, oFF.QInAConverter.s_lookupUnitTypeIna, oFF.UnitType.UNDEFINED, "UDF");
		oFF.QInAConverter.mapConstant(oFF.QInAConverter.s_lookupUnitType, oFF.QInAConverter.s_lookupUnitTypeIna, oFF.UnitType.MIXED, "*");
		oFF.QInAConverter.mapConstant(oFF.QInAConverter.s_lookupUnitType, oFF.QInAConverter.s_lookupUnitTypeIna, oFF.UnitType.NULL_VALUE, "NULL");
		oFF.QInAConverter.mapConstant(oFF.QInAConverter.s_lookupUnitType, oFF.QInAConverter.s_lookupUnitTypeIna, oFF.UnitType.NONE, "NON");
	},
	setupAxisType:function()
	{
			oFF.QInAConverter.s_lookupAxisType = oFF.XHashMapByString.create();
		oFF.QInAConverter.s_lookupAxisTypeIna = oFF.XHashMapOfStringByString.create();
		oFF.QInAConverter.mapConstant(oFF.QInAConverter.s_lookupAxisType, oFF.QInAConverter.s_lookupAxisTypeIna, oFF.AxisType.COLUMNS, "Columns");
		oFF.QInAConverter.mapConstant(oFF.QInAConverter.s_lookupAxisType, oFF.QInAConverter.s_lookupAxisTypeIna, oFF.AxisType.ROWS, "Rows");
		oFF.QInAConverter.mapConstant(oFF.QInAConverter.s_lookupAxisType, oFF.QInAConverter.s_lookupAxisTypeIna, oFF.AxisType.FREE, "Free");
		oFF.QInAConverter.mapConstant(oFF.QInAConverter.s_lookupAxisType, oFF.QInAConverter.s_lookupAxisTypeIna, oFF.AxisType.FREE, "None");
		oFF.QInAConverter.mapConstant(oFF.QInAConverter.s_lookupAxisType, oFF.QInAConverter.s_lookupAxisTypeIna, oFF.AxisType.DYNAMIC, "Dynamic");
		oFF.QInAConverter.mapConstant(oFF.QInAConverter.s_lookupAxisType, oFF.QInAConverter.s_lookupAxisTypeIna, oFF.AxisType.FILTER, "Filter");
		oFF.QInAConverter.mapConstant(oFF.QInAConverter.s_lookupAxisType, oFF.QInAConverter.s_lookupAxisTypeIna, oFF.AxisType.TECHNICAL, "Technical");
		oFF.QInAConverter.mapConstant(oFF.QInAConverter.s_lookupAxisType, oFF.QInAConverter.s_lookupAxisTypeIna, oFF.AxisType.REPOSITORY, "Repository");
		oFF.QInAConverter.mapConstant(oFF.QInAConverter.s_lookupAxisType, oFF.QInAConverter.s_lookupAxisTypeIna, oFF.AxisType.VIRTUAL, "Virtual");
	},
	setupDimensionType:function()
	{
			oFF.QInAConverter.s_lookupDimensionTypeInt = oFF.XArray.create(14);
		oFF.QInAConverter.s_lookupDimensionTypeInt.set(1, oFF.DimensionType.TIME);
		oFF.QInAConverter.s_lookupDimensionTypeInt.set(2, oFF.DimensionType.MEASURE_STRUCTURE);
		oFF.QInAConverter.s_lookupDimensionTypeInt.set(3, oFF.DimensionType.DIMENSION);
		oFF.QInAConverter.s_lookupDimensionTypeInt.set(4, oFF.DimensionType.CURRENCY);
		oFF.QInAConverter.s_lookupDimensionTypeInt.set(5, oFF.DimensionType.UNIT);
		oFF.QInAConverter.s_lookupDimensionTypeInt.set(6, oFF.DimensionType.SECONDARY_STRUCTURE);
		oFF.QInAConverter.s_lookupDimensionTypeInt.set(7, oFF.DimensionType.DATE);
		oFF.QInAConverter.s_lookupDimensionTypeInt.set(8, oFF.DimensionType.HIERARCHY_VERSION);
		oFF.QInAConverter.s_lookupDimensionTypeInt.set(9, oFF.DimensionType.HIERARCHY_NAME);
		oFF.QInAConverter.s_lookupDimensionTypeInt.set(10, oFF.DimensionType.GIS_DIMENSION);
		oFF.QInAConverter.s_lookupDimensionTypeInt.set(11, oFF.DimensionType.VERSION_EPM);
		oFF.QInAConverter.s_lookupDimensionTypeInt.set(12, oFF.DimensionType.ACCOUNT);
		oFF.QInAConverter.s_lookupDimensionTypeInt.set(13, oFF.DimensionType.VERSION_IBP);
	},
	setupAlertLevel:function()
	{
			oFF.QInAConverter.s_lookupAlertLevelInt = oFF.XArray.create(10);
		oFF.QInAConverter.s_lookupAlertLevelInt.set(0, oFF.AlertLevel.NORMAL);
		oFF.QInAConverter.s_lookupAlertLevelInt.set(1, oFF.AlertLevel.GOOD_1);
		oFF.QInAConverter.s_lookupAlertLevelInt.set(2, oFF.AlertLevel.GOOD_2);
		oFF.QInAConverter.s_lookupAlertLevelInt.set(3, oFF.AlertLevel.GOOD_3);
		oFF.QInAConverter.s_lookupAlertLevelInt.set(4, oFF.AlertLevel.CRITICAL_1);
		oFF.QInAConverter.s_lookupAlertLevelInt.set(5, oFF.AlertLevel.CRITICAL_2);
		oFF.QInAConverter.s_lookupAlertLevelInt.set(6, oFF.AlertLevel.CRITICAL_3);
		oFF.QInAConverter.s_lookupAlertLevelInt.set(7, oFF.AlertLevel.BAD_1);
		oFF.QInAConverter.s_lookupAlertLevelInt.set(8, oFF.AlertLevel.BAD_2);
		oFF.QInAConverter.s_lookupAlertLevelInt.set(9, oFF.AlertLevel.BAD_3);
	},
	setupTextTransformation:function()
	{
			oFF.QInAConverter.s_textTransformation = oFF.XHashMapByString.create();
		oFF.QInAConverter.s_textTransformationIna = oFF.XHashMapOfStringByString.create();
		oFF.QInAConverter.mapTextTransformation("Capitalize", oFF.TextTransformationType.CAPITALIZE);
		oFF.QInAConverter.mapTextTransformation("Lowercase", oFF.TextTransformationType.LOWERCASE);
		oFF.QInAConverter.mapTextTransformation("Uppercase", oFF.TextTransformationType.UPPERCASE);
		oFF.QInAConverter.mapTextTransformation("StringTransformation", oFF.TextTransformationType.STRING_TRANSFORMATION);
		oFF.QInAConverter.mapTextTransformation("SpatialAsBinary", oFF.TextTransformationType.SPATIAL_AS_BINARY);
		oFF.QInAConverter.mapTextTransformation("SpatialAsEWKB", oFF.TextTransformationType.SPATIAL_AS_EWKB);
		oFF.QInAConverter.mapTextTransformation("SpatialAsEWKT", oFF.TextTransformationType.SPATIAL_AS_EWKT);
		oFF.QInAConverter.mapTextTransformation("SpatialAsGeoJSON", oFF.TextTransformationType.SPATIAL_AS_GEOJSON);
		oFF.QInAConverter.mapTextTransformation("SpatialAsSVG", oFF.TextTransformationType.SPATIAL_AS_SVG);
		oFF.QInAConverter.mapTextTransformation("SpatialAsText", oFF.TextTransformationType.SPATIAL_AS_TEXT);
		oFF.QInAConverter.mapTextTransformation("SpatialAsWKB", oFF.TextTransformationType.SPATIAL_AS_WKB);
		oFF.QInAConverter.mapTextTransformation("SpatialAsWKT", oFF.TextTransformationType.SPATIAL_AS_WKT);
	},
	mapTextTransformation:function(inaString, ffConstant)
	{
			oFF.QInAConverter.s_textTransformation.put(inaString, ffConstant);
		oFF.QInAConverter.s_textTransformationIna.put(ffConstant.getName(), inaString);
	},
	setupComparisonMapping:function()
	{
			oFF.QInAConverter.s_lookupComparison = oFF.XHashMapByString.create();
		oFF.QInAConverter.s_lookupComparisonIna = oFF.XHashMapOfStringByString.create();
		oFF.QInAConverter.mapComparison("=", oFF.ComparisonOperator.EQUAL);
		oFF.QInAConverter.mapComparison("EQ", oFF.ComparisonOperator.EQUAL);
		oFF.QInAConverter.mapComparison("EQUAL", oFF.ComparisonOperator.EQUAL);
		oFF.QInAConverter.mapComparison("EQUALS", oFF.ComparisonOperator.EQUAL);
		oFF.QInAConverter.mapComparison("<>", oFF.ComparisonOperator.NOT_EQUAL);
		oFF.QInAConverter.mapComparison(">", oFF.ComparisonOperator.GREATER_THAN);
		oFF.QInAConverter.mapComparison("GT", oFF.ComparisonOperator.GREATER_THAN);
		oFF.QInAConverter.mapComparison("<", oFF.ComparisonOperator.LESS_THAN);
		oFF.QInAConverter.mapComparison("LT", oFF.ComparisonOperator.LESS_THAN);
		oFF.QInAConverter.mapComparison(">=", oFF.ComparisonOperator.GREATER_EQUAL);
		oFF.QInAConverter.mapComparison("GE", oFF.ComparisonOperator.GREATER_EQUAL);
		oFF.QInAConverter.mapComparison("<=", oFF.ComparisonOperator.LESS_EQUAL);
		oFF.QInAConverter.mapComparison("LE", oFF.ComparisonOperator.LESS_EQUAL);
		oFF.QInAConverter.mapComparison("LIKE", oFF.ComparisonOperator.LIKE);
		oFF.QInAConverter.mapComparison("MATCH", oFF.ComparisonOperator.MATCH);
		oFF.QInAConverter.mapComparison("NOT_MATCH", oFF.ComparisonOperator.NOT_MATCH);
		oFF.QInAConverter.mapComparison("IS_NULL", oFF.ComparisonOperator.IS_NULL);
		oFF.QInAConverter.mapComparison("IS NULL", oFF.ComparisonOperator.IS_NULL);
		oFF.QInAConverter.mapComparison("NL", oFF.ComparisonOperator.IS_NULL);
		oFF.QInAConverter.mapComparison("BETWEEN", oFF.ComparisonOperator.BETWEEN);
		oFF.QInAConverter.mapComparison("BT", oFF.ComparisonOperator.BETWEEN);
		oFF.QInAConverter.mapComparison("NOT_BETWEEN", oFF.ComparisonOperator.NOT_BETWEEN);
		oFF.QInAConverter.mapComparison("NOTBETWEEN", oFF.ComparisonOperator.NOT_BETWEEN);
		oFF.QInAConverter.mapComparison("BETWEEN_EXCLUDING", oFF.ComparisonOperator.BETWEEN_EXCLUDING);
		oFF.QInAConverter.mapComparison("NOT_BETWEEN_EXCLUDING", oFF.ComparisonOperator.NOT_BETWEEN_EXCLUDING);
		oFF.QInAConverter.mapComparison("FUZZY", oFF.ComparisonOperator.FUZZY);
		oFF.QInAConverter.mapComparison("SEARCH", oFF.ComparisonOperator.SEARCH);
		oFF.QInAConverter.mapComparison("ALL", oFF.ComparisonOperator.ALL);
		oFF.QInAConverter.mapComparison("AGGREGATED", oFF.ComparisonOperator.AGGREGATED);
		oFF.QInAConverter.mapComparison("NON-AGGREGATED", oFF.ComparisonOperator.NON_AGGREGATED);
		oFF.QInAConverter.mapComparison("LEVEL", oFF.ComparisonOperator.LEVEL);
		oFF.QInAConverter.mapComparison("CONTAINS", oFF.SpatialComparisonOperator.CONTAINS);
		oFF.QInAConverter.mapComparison("COVERS", oFF.SpatialComparisonOperator.COVERS);
		oFF.QInAConverter.mapComparison("CROSSES", oFF.SpatialComparisonOperator.CROSSES);
		oFF.QInAConverter.mapComparison("DISJOINT", oFF.SpatialComparisonOperator.DISJOINT);
		oFF.QInAConverter.mapComparison("OVERLAPS", oFF.SpatialComparisonOperator.OVERLAPS);
		oFF.QInAConverter.mapComparison("TOUCHES", oFF.SpatialComparisonOperator.TOUCHES);
		oFF.QInAConverter.mapComparison("INTERSECTS_RECT", oFF.SpatialComparisonOperator.INTERSECTS_RECT);
		oFF.QInAConverter.mapComparison("INTERSECT_RECT", oFF.SpatialComparisonOperator.INTERSECTS_RECT);
		oFF.QInAConverter.mapComparison("INTERSECTS", oFF.SpatialComparisonOperator.INTERSECTS);
		oFF.QInAConverter.mapComparison("WITHIN", oFF.SpatialComparisonOperator.WITHIN);
		oFF.QInAConverter.mapComparison("WITHIN_DISTANCE", oFF.SpatialComparisonOperator.WITHIN_DISTANCE);
	},
	setupAggregationTypeMapping:function()
	{
			oFF.QInAConverter.s_lookupAggregationType = oFF.XHashMapByString.create();
		oFF.QInAConverter.s_lookupAggregationTypeIna = oFF.XHashMapOfStringByString.create();
		oFF.QInAConverter.mapAggregationType("SUM", oFF.AggregationType.SUM);
		oFF.QInAConverter.mapAggregationType("COUNT", oFF.AggregationType.COUNT);
		oFF.QInAConverter.mapAggregationType("MAX", oFF.AggregationType.MAX);
		oFF.QInAConverter.mapAggregationType("MIN", oFF.AggregationType.MIN);
		oFF.QInAConverter.mapAggregationType("AVERAGE", oFF.AggregationType.AVERAGE);
		oFF.QInAConverter.mapAggregationType("COUNT_DISTINCT", oFF.AggregationType.COUNT_DISTINCT);
		oFF.QInAConverter.mapAggregationType("LAST", oFF.AggregationType.LAST);
		oFF.QInAConverter.mapAggregationType("FIRST", oFF.AggregationType.FIRST);
		oFF.QInAConverter.mapAggregationType("VARIANCE", oFF.AggregationType.VARIANCE);
		oFF.QInAConverter.mapAggregationType("STANDARD_DEVIATION", oFF.AggregationType.STANDARD_DEVIATION);
		oFF.QInAConverter.mapAggregationType("NOPNULL", oFF.AggregationType.NOP_NULL);
		oFF.QInAConverter.mapAggregationType("NOPNULLZERO", oFF.AggregationType.NOP_NULL_ZERO);
		oFF.QInAConverter.mapAggregationType("RANK", oFF.AggregationType.RANK);
		oFF.QInAConverter.mapAggregationType("RANK_DENSE", oFF.AggregationType.RANK_DENSE);
		oFF.QInAConverter.mapAggregationType("RANK_OLYMPIC", oFF.AggregationType.RANK_OLYMPIC);
		oFF.QInAConverter.mapAggregationType("RANK_PERCENT", oFF.AggregationType.RANK_PERCENT);
		oFF.QInAConverter.mapAggregationType("RANK_PERCENTILE", oFF.AggregationType.RANK_PERCENTILE);
		oFF.QInAConverter.mapAggregationType("AVERAGENULL", oFF.AggregationType.AVERAGE_NULL);
		oFF.QInAConverter.mapAggregationType("AVERAGENULLZERO", oFF.AggregationType.AVERAGE_NULL_ZERO);
		oFF.QInAConverter.mapAggregationType("COUNTNULL", oFF.AggregationType.COUNT_NULL);
		oFF.QInAConverter.mapAggregationType("COUNTNULLZERO", oFF.AggregationType.COUNT_NULL_ZERO);
		oFF.QInAConverter.mapAggregationType("MEDIAN", oFF.AggregationType.MEDIAN);
		oFF.QInAConverter.mapAggregationType("MEDIANNULL", oFF.AggregationType.MEDIAN_NULL);
		oFF.QInAConverter.mapAggregationType("MEDIANNULLZERO", oFF.AggregationType.MEDIAN_NULL_ZERO);
		oFF.QInAConverter.mapAggregationType("1STQUARTILE", oFF.AggregationType.FIRST_QUARTILE);
		oFF.QInAConverter.mapAggregationType("1STQUARTILENULL", oFF.AggregationType.FIRST_QUARTILE_NULL);
		oFF.QInAConverter.mapAggregationType("1STQUARTILENULLZERO", oFF.AggregationType.FIRST_QUARTILE_NULL_ZERO);
		oFF.QInAConverter.mapAggregationType("3RDQUARTILE", oFF.AggregationType.THIRD_QUARTILE);
		oFF.QInAConverter.mapAggregationType("3RDQUARTILENULL", oFF.AggregationType.THIRD_QUARTILE_NULL);
		oFF.QInAConverter.mapAggregationType("3RDQUARTILENULLZERO", oFF.AggregationType.THIRD_QUARTILE_NULL_ZERO);
		oFF.QInAConverter.mapAggregationType("OUTLIERS", oFF.AggregationType.OUTLIERS);
		oFF.QInAConverter.mapAggregationType("OUTLIERSNULL", oFF.AggregationType.OUTLIERS_NULL);
		oFF.QInAConverter.mapAggregationType("OUTLIERSNULLZERO", oFF.AggregationType.OUTLIERS_NULL_ZERO);
	},
	setupPresentationMapping:function()
	{
			oFF.QInAConverter.s_lookupPresentationType = oFF.XHashMapByString.create();
		oFF.QInAConverter.s_lookupPresentationTypeIna = oFF.XHashMapOfStringByString.create();
		oFF.QInAConverter.mapPresentationType("Undefined", oFF.PresentationType.UNDEFINED);
		oFF.QInAConverter.mapPresentationType("Key", oFF.PresentationType.KEY);
		oFF.QInAConverter.mapPresentationType("KeyNotCompound", oFF.PresentationType.KEY_NOT_COMPOUND);
		oFF.QInAConverter.mapPresentationType("DisplayKey", oFF.PresentationType.DISPLAY_KEY);
		oFF.QInAConverter.mapPresentationType("DisplayKeyMixedCompoundment", oFF.PresentationType.DISPLAY_KEY_MIXED_COMPOUNDMENT);
		oFF.QInAConverter.mapPresentationType("DisplayKeyNotCompound", oFF.PresentationType.DISPLAY_KEY_NOT_COMPOUND);
		oFF.QInAConverter.mapPresentationType("Id", oFF.PresentationType.ID);
		oFF.QInAConverter.mapPresentationType("Text", oFF.PresentationType.TEXT);
		oFF.QInAConverter.mapPresentationType("ShortText", oFF.PresentationType.SHORT_TEXT);
		oFF.QInAConverter.mapPresentationType("MediumText", oFF.PresentationType.MEDIUM_TEXT);
		oFF.QInAConverter.mapPresentationType("LongText", oFF.PresentationType.LONG_TEXT);
		oFF.QInAConverter.mapPresentationType("XLLongText", oFF.PresentationType.XL_LONG_TEXT);
		oFF.QInAConverter.mapPresentationType("HierarchyKey", oFF.PresentationType.HIERARCHY_KEY);
		oFF.QInAConverter.mapPresentationType("HierarchyText", oFF.PresentationType.HIERARCHY_TEXT);
		oFF.QInAConverter.mapPresentationType("HierarchyDisplayKey", oFF.PresentationType.HIERARCHY_DISPLAY_KEY);
		oFF.QInAConverter.mapPresentationType("HierarchyPath", oFF.PresentationType.HIERARCHY_PATH);
		oFF.QInAConverter.mapPresentationType("WhyFound", oFF.PresentationType.WHY_FOUND);
		oFF.QInAConverter.mapPresentationType("RelatedActions", oFF.PresentationType.RELATED_ACTIONS);
		oFF.QInAConverter.mapPresentationType("NamePath", oFF.PresentationType.NAME_PATH);
		oFF.QInAConverter.mapPresentationType("URL", oFF.PresentationType.URL);
		oFF.QInAConverter.mapPresentationType("XXL", oFF.PresentationType.BLOB);
		oFF.QInAConverter.mapPresentationType("QueryText", oFF.PresentationType.QUERY_TEXT);
	},
	setupVisibilityMapping:function()
	{
			oFF.QInAConverter.s_lookupVisibilityType = oFF.XHashMapByString.create();
		oFF.QInAConverter.s_lookupVisibilityTypeIna = oFF.XHashMapOfStringByString.create();
		oFF.QInAConverter.mapVisibilityType("C", oFF.VisibilityType.CENTRAL);
		oFF.QInAConverter.mapVisibilityType("C/I", oFF.VisibilityType.CENTRAL_NOT_VISIBLE);
		oFF.QInAConverter.mapVisibilityType("C/D", oFF.VisibilityType.CENTRAL_DISPLAY_ONLY);
		oFF.QInAConverter.mapVisibilityType("C/C", oFF.VisibilityType.CENTRAL_CHANGE_TO_EXISTING);
		oFF.QInAConverter.mapVisibilityType("C/A", oFF.VisibilityType.CENTRAL_ADD_NEW);
		oFF.QInAConverter.mapVisibilityType("L", oFF.VisibilityType.LOCAL);
		oFF.QInAConverter.mapVisibilityType("L/I", oFF.VisibilityType.LOCAL_NOT_VISIBLE);
		oFF.QInAConverter.mapVisibilityType("L/D", oFF.VisibilityType.LOCAL_DISPLAY_ONLY);
		oFF.QInAConverter.mapVisibilityType("L/C", oFF.VisibilityType.LOCAL_CHANGE_TO_EXISTING);
		oFF.QInAConverter.mapVisibilityType("L/A", oFF.VisibilityType.LOCAL_ADD_NEW);
	},
	setupReadmodeMapping:function()
	{
			oFF.QInAConverter.s_lookupReadMode = oFF.XHashMapByString.create();
		oFF.QInAConverter.s_lookupReadModeIna = oFF.XHashMapOfStringByString.create();
		oFF.QInAConverter.mapReadMode("Default", oFF.QMemberReadMode.DEFAULT_VALUE);
		oFF.QInAConverter.mapReadMode("Undefined", oFF.QMemberReadMode.UNDEFINED);
		oFF.QInAConverter.mapReadMode("None", oFF.QMemberReadMode.UNDEFINED);
		oFF.QInAConverter.mapReadMode("Master", oFF.QMemberReadMode.MASTER);
		oFF.QInAConverter.mapReadMode("MasterAndSpace", oFF.QMemberReadMode.MASTER_AND_SPACE);
		oFF.QInAConverter.mapReadMode("MasterAndSpaceAndState", oFF.QMemberReadMode.MASTER_AND_SPACE_AND_STATE);
		oFF.QInAConverter.mapReadMode("RelatedMaster", oFF.QMemberReadMode.REL_MASTER);
		oFF.QInAConverter.mapReadMode("RelatedMasterAndSpace", oFF.QMemberReadMode.REL_MASTER_AND_SPACE);
		oFF.QInAConverter.mapReadMode("RelatedMasterAndSpaceAndState", oFF.QMemberReadMode.REL_MASTER_AND_SPACE_AND_STATE);
		oFF.QInAConverter.mapReadMode("Booked", oFF.QMemberReadMode.BOOKED);
		oFF.QInAConverter.mapReadMode("BookedAndSpace", oFF.QMemberReadMode.BOOKED_AND_SPACE);
		oFF.QInAConverter.mapReadMode("BookedAndSpaceAndState", oFF.QMemberReadMode.BOOKED_AND_SPACE_AND_STATE);
		oFF.QInAConverter.mapReadMode("RelatedBooked", oFF.QMemberReadMode.REL_BOOKED);
		oFF.QInAConverter.mapReadMode("RelatedBookedAndSpace", oFF.QMemberReadMode.REL_BOOKED_AND_SPACE);
		oFF.QInAConverter.mapReadMode("RelatedBookedAndSpaceAndState", oFF.QMemberReadMode.REL_BOOKED_AND_SPACE_AND_STATE);
	},
	setupEncoding:function()
	{
			oFF.QInAConverter.s_lookupEncoding = oFF.XHashMapByString.create();
		oFF.QInAConverter.s_lookupEncoding.put("None", oFF.ResultSetEncoding.NONE);
		oFF.QInAConverter.s_lookupEncoding.put("Auto", oFF.ResultSetEncoding.AUTO);
		oFF.QInAConverter.s_lookupEncoding.put("DeltaRunLength", oFF.ResultSetEncoding.DELTA_RUN_LENGTH);
	},
	setupSortingMapping:function()
	{
			oFF.QInAConverter.s_lookupSortType = oFF.XHashMapByString.create();
		oFF.QInAConverter.s_lookupSortTypeIna = oFF.XHashMapOfStringByString.create();
		oFF.QInAConverter.mapSortType("Member", oFF.SortType.MEMBER_KEY);
		oFF.QInAConverter.mapSortType("MemberKey", oFF.SortType.MEMBER_KEY);
		oFF.QInAConverter.mapSortType("MemberText", oFF.SortType.MEMBER_TEXT);
		oFF.QInAConverter.mapSortType("Field", oFF.SortType.FIELD);
		oFF.QInAConverter.mapSortType("Selection", oFF.SortType.FILTER);
		oFF.QInAConverter.mapSortType("Filter", oFF.SortType.FILTER);
		oFF.QInAConverter.mapSortType("Datacell", oFF.SortType.DATA_CELL_VALUE);
		oFF.QInAConverter.mapSortType("Hierarchy", oFF.SortType.HIERARCHY);
		oFF.QInAConverter.mapSortType("Measure", oFF.SortType.MEASURE);
		oFF.QInAConverter.mapSortType("Complex", oFF.SortType.COMPLEX);
		oFF.QInAConverter.mapSortType("Custom", oFF.SortType.CUSTOM);
	},
	setupMemberNavigationType:function()
	{
			oFF.QInAConverter.s_lookupMemberNavigationTypeIna = oFF.XHashMapOfStringByString.create();
		oFF.QInAConverter.s_lookupMemberNavigationTypeIna.put(oFF.MemberNavigationType.FUNCTION_PARAM_CONSTANT.getName(), "Constant");
		oFF.QInAConverter.s_lookupMemberNavigationTypeIna.put(oFF.MemberNavigationType.FUNCTION_PARAM_LEVEL.getName(), "Level");
		oFF.QInAConverter.s_lookupMemberNavigationTypeIna.put(oFF.MemberNavigationType.FUNCTION_PARAM_MEMBER.getName(), "Member");
		oFF.QInAConverter.s_lookupMemberNavigationTypeIna.put(oFF.MemberNavigationType.FUNCTION_PARAM_NO_VALUES_ABOVE_LEVEL.getName(), "NoValuesAboveLevel");
		oFF.QInAConverter.s_lookupMemberNavigationTypeIna.put(oFF.MemberNavigationType.FUNCTION_PARAM_ERROR_ABOVE_LEVEL.getName(), "ErrorAboveLevel");
		oFF.QInAConverter.s_lookupMemberNavigationTypeIna.put(oFF.MemberNavigationType.FUNCTION_PARAM_RANGE.getName(), "Range");
		oFF.QInAConverter.s_lookupMemberNavigationTypeIna.put(oFF.MemberNavigationType.FUNCTION_PARAM_SHIFT.getName(), "Shift");
	},
	setupResultSetState:function()
	{
			oFF.QInAConverter.s_lookupResultsetState = oFF.XArray.create(7);
		oFF.QInAConverter.s_lookupResultsetState.set(0, oFF.ResultSetState.DATA_AVAILABLE);
		oFF.QInAConverter.s_lookupResultsetState.set(1, oFF.ResultSetState.NO_DATA_AVAILABLE);
		oFF.QInAConverter.s_lookupResultsetState.set(2, oFF.ResultSetState.NO_DATA_AVAILABLE);
		oFF.QInAConverter.s_lookupResultsetState.set(3, oFF.ResultSetState.ERROR);
		oFF.QInAConverter.s_lookupResultsetState.set(4, oFF.ResultSetState.SIZE_LIMIT_EXCEEDED);
		oFF.QInAConverter.s_lookupResultsetState.set(5, oFF.ResultSetState.SUCCESSFUL_PERSISTED);
		oFF.QInAConverter.s_lookupResultsetState.set(6, oFF.ResultSetState.EMPTY_JSON);
	},
	setupValueException:function()
	{
			oFF.QInAConverter.s_lookupValueException = oFF.XArray.create(11);
		oFF.QInAConverter.s_lookupValueException.set(0, oFF.ValueException.NORMAL);
		oFF.QInAConverter.s_lookupValueException.set(1, oFF.ValueException.NULL_VALUE);
		oFF.QInAConverter.s_lookupValueException.set(2, oFF.ValueException.ZERO);
		oFF.QInAConverter.s_lookupValueException.set(3, oFF.ValueException.UNDEFINED);
		oFF.QInAConverter.s_lookupValueException.set(4, oFF.ValueException.OVERFLOW);
		oFF.QInAConverter.s_lookupValueException.set(5, oFF.ValueException.NO_PRESENTATION);
		oFF.QInAConverter.s_lookupValueException.set(6, oFF.ValueException.DIFF0);
		oFF.QInAConverter.s_lookupValueException.set(7, oFF.ValueException.ERROR);
		oFF.QInAConverter.s_lookupValueException.set(8, oFF.ValueException.NO_AUTHORITY);
		oFF.QInAConverter.s_lookupValueException.set(9, oFF.ValueException.MIXED_CURRENCIES_OR_UNITS);
		oFF.QInAConverter.s_lookupValueException.set(10, oFF.ValueException.UNDEFINED_NOP);
	},
	setupSingleValueCalculation:function()
	{
			oFF.QInAConverter.s_lookupSingleValueCalculation = oFF.XHashMapByString.create();
		oFF.QInAConverter.s_lookupSingleValueCalculation.put(" ", oFF.SingleValueCalculation.NOT_DEFINED);
		oFF.QInAConverter.s_lookupSingleValueCalculation.put("1", oFF.SingleValueCalculation.SUM);
		oFF.QInAConverter.s_lookupSingleValueCalculation.put("2", oFF.SingleValueCalculation.MAXIMUM);
		oFF.QInAConverter.s_lookupSingleValueCalculation.put("3", oFF.SingleValueCalculation.MINIMUM);
		oFF.QInAConverter.s_lookupSingleValueCalculation.put("4", oFF.SingleValueCalculation.COUNTER_FOR_ALL_DETAILED_VALUES);
		oFF.QInAConverter.s_lookupSingleValueCalculation.put("5", oFF.SingleValueCalculation.COUNTER_FOR_ALL_DETAILED_VALUES_NZ_NULL_ERROR);
		oFF.QInAConverter.s_lookupSingleValueCalculation.put("6", oFF.SingleValueCalculation.AVERAGE);
		oFF.QInAConverter.s_lookupSingleValueCalculation.put("7", oFF.SingleValueCalculation.AVERAGE_DETAILED_VALUES_NOT_ZERO_NULL_ERROR);
		oFF.QInAConverter.s_lookupSingleValueCalculation.put("0", oFF.SingleValueCalculation.HIDE);
		oFF.QInAConverter.s_lookupSingleValueCalculation.put("O", oFF.SingleValueCalculation.OLYMPIC_RANK_NUMBER);
		oFF.QInAConverter.s_lookupSingleValueCalculation.put("B", oFF.SingleValueCalculation.MOVING_MIN_VALUE);
		oFF.QInAConverter.s_lookupSingleValueCalculation.put("C", oFF.SingleValueCalculation.NORMALIZED_NEXT_GROUP_LEVEL_RESULT);
		oFF.QInAConverter.s_lookupSingleValueCalculation.put("D", oFF.SingleValueCalculation.MAX_VALUE_NOT_ZERO_NULL_ERROR);
		oFF.QInAConverter.s_lookupSingleValueCalculation.put("E", oFF.SingleValueCalculation.MINIMUM_VALUES_NOT_ZERO_NULL_ERROR);
		oFF.QInAConverter.s_lookupSingleValueCalculation.put("G", oFF.SingleValueCalculation.NORMALIZED_OVERALL_RESULT);
		oFF.QInAConverter.s_lookupSingleValueCalculation.put("R", oFF.SingleValueCalculation.NORMALIZED_UNRESTRICTED_OVERALL_RESULT);
		oFF.QInAConverter.s_lookupSingleValueCalculation.put("S", oFF.SingleValueCalculation.RANK_NUMBER);
	},
	setupComponentTypeMapping:function()
	{
			oFF.QInAConverter.s_lookupComponentType = oFF.XHashMapByString.create();
		oFF.QInAConverter.s_lookupComponentTypeIna = oFF.XHashMapOfStringByString.create();
		oFF.QInAConverter.mapComponentType("Axis", oFF.OlapComponentType.AXIS);
		oFF.QInAConverter.mapComponentType("AbstractMember", oFF.MemberType.ABSTRACT_MEMBER);
		oFF.QInAConverter.mapComponentType("Attribute", oFF.OlapComponentType.ATTRIBUTE);
		oFF.QInAConverter.mapComponentType("QuerySettings", oFF.OlapComponentType.QUERY_SETTINGS);
		oFF.QInAConverter.mapComponentType("Condition", oFF.OlapComponentType.CONDITION);
		oFF.QInAConverter.mapComponentType("QueryModel", oFF.OlapComponentType.QUERY_MODEL);
		oFF.QInAConverter.mapComponentType("DataCell", oFF.OlapComponentType.DATA_CELL);
		oFF.QInAConverter.mapComponentType("CalculatedDimension", oFF.DimensionType.CALCULATED_DIMENSION);
		oFF.QInAConverter.mapComponentType("FilterManager", oFF.OlapComponentType.OLAP_FILTER_MANAGER);
		oFF.QInAConverter.mapComponentType("Filter", oFF.OlapComponentType.SELECTOR);
		oFF.QInAConverter.mapComponentType("FilterExpression", oFF.OlapComponentType.FILTER_EXPRESSION);
		oFF.QInAConverter.mapComponentType("FilterCartesianProduct", oFF.FilterComponentType.CARTESIAN_PRODUCT);
		oFF.QInAConverter.mapComponentType("FilterCartesianList", oFF.FilterComponentType.CARTESIAN_LIST);
		oFF.QInAConverter.mapComponentType("FilterConvertedTimeCartesianList", oFF.FilterComponentType.CONVERTED_TIME_CARTESIAN_LIST);
		oFF.QInAConverter.mapComponentType("FilterOperation", oFF.FilterComponentType.OPERATION);
		oFF.QInAConverter.mapComponentType("FilterDateRangeOperation", oFF.FilterComponentType.DATE_RANGE_OPERATION);
		oFF.QInAConverter.mapComponentType("FilterAlgebra", oFF.FilterComponentType.BOOLEAN_ALGEBRA);
		oFF.QInAConverter.mapComponentType("CustomHierarchyDefinition", oFF.OlapComponentType.CUSTOM_HIERARCHY_DEFINITION);
		oFF.QInAConverter.mapComponentType("MemberRestricted", oFF.MemberType.RESTRICTED_MEASURE);
		oFF.QInAConverter.mapComponentType("DimensionMemberVariable", oFF.VariableType.DIMENSION_MEMBER_VARIABLE);
		oFF.QInAConverter.mapComponentType("HierarchyNodeVariable", oFF.VariableType.HIERARCHY_NODE_VARIABLE);
		oFF.QInAConverter.mapComponentType("Hierarchy", oFF.OlapComponentType.HIERARCHY_MANAGER);
		oFF.QInAConverter.mapComponentType("Hierarchy", oFF.OlapComponentType.HIERARCHY);
		oFF.QInAConverter.mapComponentType("CellValueOperand", oFF.OlapComponentType.FILTER_CELL_VALUE_OPERAND);
		oFF.QInAConverter.mapComponentType("DataCells", oFF.OlapComponentType.DATA_CELLS);
		oFF.QInAConverter.mapComponentType("Sorting", oFF.OlapComponentType.SORT_MANAGER);
		oFF.QInAConverter.mapComponentType("CurrencyTranslationManager", oFF.OlapComponentType.CURRENCY_TRANSLATION_MANAGER);
		oFF.QInAConverter.mapComponentType("CurrencyTranslations", oFF.OlapComponentType.CURRENCY_TRANSLATION_LIST);
		oFF.QInAConverter.mapComponentType("CurrencyTranslationItem", oFF.OlapComponentType.CURRENCY_TRANSLATION_ITEM);
		oFF.QInAConverter.mapComponentType("Translations", oFF.OlapComponentType.MEASURE_TRANSLATIONS);
		oFF.QInAConverter.mapComponentType("SortOperation", oFF.OlapComponentType.GENERIC_SORTING);
		oFF.QInAConverter.mapComponentType("Totals", oFF.OlapComponentType.TOTALS);
		oFF.QInAConverter.mapComponentType("Dimensions", oFF.OlapComponentType.DIMENSIONS);
		oFF.QInAConverter.mapComponentType("ConditionsManager", oFF.OlapComponentType.CONDITIONS_MANAGER);
		oFF.QInAConverter.mapComponentType("Field", oFF.OlapComponentType.FIELD);
		oFF.QInAConverter.mapComponentType("DimensionManager", oFF.OlapComponentType.DIMENSION_MANAGER);
		oFF.QInAConverter.mapComponentType("Dimension", oFF.OlapComponentType.ABSTRACT_DIMENSION);
		oFF.QInAConverter.mapComponentType("UniversalDisplayHierarchies", oFF.OlapComponentType.UNIVERSAL_DISPLAY_HIERARCHIES);
		oFF.QInAConverter.mapComponentType("BasicMeasure", oFF.MemberType.BASIC_MEASURE);
		oFF.QInAConverter.mapComponentType("Formula", oFF.MemberType.FORMULA);
		oFF.QInAConverter.mapComponentType("Variance", oFF.MemberType.VARIANCE);
		oFF.QInAConverter.mapComponentType("ExceptionAggregation", oFF.MemberType.EXCEPTION_AGGREGATION);
		oFF.QInAConverter.mapComponentType("CurrencyMeasure", oFF.MemberType.CURRENCY_MEASURE);
		oFF.QInAConverter.mapComponentType("RunningTotal", oFF.MemberType.RUNNING_TOTAL);
		oFF.QInAConverter.mapComponentType("Members", oFF.OlapComponentType.MEMBERS);
		oFF.QInAConverter.mapComponentType("DrillOperation", oFF.OlapComponentType.DRILL_OPERATION);
		oFF.QInAConverter.mapComponentType("DrillManager", oFF.OlapComponentType.DRILL_MANAGER);
		oFF.QInAConverter.mapComponentType("DrillPathElement", oFF.MemberType.DRILL_PATH_ELEMENT);
		oFF.QInAConverter.mapComponentType("CellContextManager", oFF.OlapComponentType.CELL_CONTEXT_MANAGER);
		oFF.QInAConverter.mapComponentType("CellContext", oFF.OlapComponentType.CELL_CONTEXT);
		oFF.QInAConverter.mapComponentType("AxesSettings", oFF.OlapComponentType.AXES_SETTINGS);
		oFF.QInAConverter.mapComponentType("Tuple", oFF.FilterComponentType.TUPLE);
		oFF.QInAConverter.mapComponentType("MeasureBasedFilter", oFF.FilterComponentType.FILTER_MEASURE_BASED);
		oFF.QInAConverter.mapComponentType("FilterAcrossModels", oFF.FilterComponentType.FILTER_ACROSS_MODELS);
		oFF.QInAConverter.mapComponentType("FilterDynamicTimeRegularRange", oFF.FilterComponentType.FILTER_DYNAMIC_TIME_REGULAR_RANGE);
		oFF.QInAConverter.mapComponentType("FilterDynamicTimeToDateRange", oFF.FilterComponentType.FILTER_DYNAMIC_TIME_TO_DATE_RANGE);
		oFF.QInAConverter.mapComponentType("FilterFixedTimeRange", oFF.FilterComponentType.FILTER_FIXED_TIME_RANGE);
		oFF.QInAConverter.mapComponentType("FormulaCalculatedDimension", oFF.DimensionType.FORMULA_CALCULATED_DIMENSION);
		oFF.QInAConverter.mapComponentType("FormulaException", oFF.OlapComponentType.FORMULA_EXCEPTION);
		oFF.QInAConverter.mapComponentType("FormulaExceptions", oFF.OlapComponentType.FORMULA_EXCEPTION_MANAGER);
		oFF.QInAConverter.mapComponentType("OptionListVariable", oFF.VariableType.OPTION_LIST_VARIABLE);
		oFF.QInAConverter.mapComponentType("Cells", oFF.OlapComponentType.QUERY_CELLS);
		oFF.QInAConverter.mapComponentType("ModellerCurrencyTranslation", oFF.OlapComponentType.MODELLER_CURRENCY_TRANSLATION);
		oFF.QInAConverter.mapComponentType("ModellerDimensions", oFF.OlapComponentType.MODELLER_DIMENSIONS);
		oFF.QInAConverter.mapComponentType("ModellerMetadataProperties", oFF.OlapComponentType.MODELLER_METADATA_PROPERTIES);
		oFF.QInAConverter.mapComponentType("ModellerVariables", oFF.OlapComponentType.MODELLER_VARIABLES);
		oFF.QInAConverter.mapComponentType("ConditionThreshold", oFF.OlapComponentType.CONDITIONS_THRESHOLD);
		oFF.QInAConverter.mapComponentType("Exceptions", oFF.OlapComponentType.EXCEPTION_MANAGER);
		oFF.QInAConverter.mapComponentType("SimpleTypeVariable", oFF.VariableType.SIMPLE_TYPE_VARIABLE);
		oFF.QInAConverter.mapComponentType("QueryManager", oFF.OlapComponentType.QUERY_MANAGER);
		oFF.QInAConverter.mapComponentType("QueryServiceConfig", oFF.OlapComponentType.QUERY_SERVICE_CONFIG);
		oFF.QInAConverter.mapComponentType("DataSource", oFF.OlapComponentType.DATA_SOURCE);
		oFF.QInAConverter.mapComponentType("DocumentsInfo", oFF.OlapComponentType.DOCUMENTS_INFO);
		oFF.QInAConverter.mapComponentType("BlendableQueryManager", oFF.OlapComponentType.BLENDABLE_QUERY_MANAGER);
		oFF.QInAConverter.mapComponentType("VisualizationManager", oFF.OlapComponentType.VISUALIZATION_MANAGER);
		oFF.QInAConverter.mapComponentType("VisualizationCellReferenceScope", oFF.OlapComponentType.VISUALIZATION_CELL_REFERENCE_SCOPE);
		oFF.QInAConverter.mapComponentType("VisualizationDefinition", oFF.OlapComponentType.VISUALIZATION_DEFINITION);
		oFF.QInAConverter.mapComponentType("VisualizationTableDefinition", oFF.OlapComponentType.VISUALIZATION_TABLE_DEFINITION);
		oFF.QInAConverter.mapComponentType("VisualizationChartDefinition", oFF.OlapComponentType.VISUALIZATION_CHART_DEFINITION);
		oFF.QInAConverter.mapComponentType("VisualizationCustomDefinition", oFF.OlapComponentType.VISUALIZATION_CUSTOM_DEFINITION);
	},
	setupValueTypeMap:function()
	{
			oFF.QInAConverter.s_lookupValueType = oFF.XHashMapByString.create();
		oFF.QInAConverter.s_lookupValueTypeIna = oFF.XHashMapOfStringByString.create();
		oFF.QInAConverter.mapValueType("String", oFF.XValueType.STRING);
		oFF.QInAConverter.mapValueType("Numc", oFF.XValueType.NUMC);
		oFF.QInAConverter.mapValueType("Char", oFF.XValueType.CHAR);
		oFF.QInAConverter.mapValueType("Double", oFF.XValueType.DOUBLE);
		oFF.QInAConverter.mapValueType("Long", oFF.XValueType.LONG);
		oFF.QInAConverter.mapValueType("Int", oFF.XValueType.INTEGER);
		oFF.QInAConverter.mapValueType("Bool", oFF.XValueType.BOOLEAN);
		oFF.QInAConverter.mapValueType("Amount", oFF.XValueType.AMOUNT);
		oFF.QInAConverter.mapValueType("Date", oFF.XValueType.DATE);
		oFF.QInAConverter.mapValueType("Time", oFF.XValueType.TIME);
		oFF.QInAConverter.mapValueType("Timestamp", oFF.XValueType.DATE_TIME);
		oFF.QInAConverter.mapValueType("Timespan", oFF.XValueType.TIMESPAN);
		oFF.QInAConverter.mapValueType("Properties", oFF.XValueType.PROPERTIES);
		oFF.QInAConverter.mapValueType("Structure", oFF.XValueType.STRUCTURE);
		oFF.QInAConverter.mapValueType("StructureList", oFF.XValueType.STRUCTURE_LIST);
		oFF.QInAConverter.mapValueType("MultiPoint", oFF.XValueType.MULTI_POINT);
		oFF.QInAConverter.mapValueType("Point", oFF.XValueType.POINT);
		oFF.QInAConverter.mapValueType("MultiGeometry", oFF.XValueType.MULTI_POLYGON);
		oFF.QInAConverter.mapValueType("Geometry", oFF.XValueType.POLYGON);
		oFF.QInAConverter.mapValueType("MultiLineString", oFF.XValueType.MULTI_LINE_STRING);
		oFF.QInAConverter.mapValueType("LineString", oFF.XValueType.LINE_STRING);
		oFF.QInAConverter.mapValueType("Language", oFF.XValueType.LANGUAGE);
		oFF.QInAConverter.mapValueType("DecimalFloat", oFF.XValueType.DECIMAL_FLOAT);
		oFF.QInAConverter.mapValueType("Variable", oFF.XValueType.VARIABLE);
		oFF.QInAConverter.mapValueType("CurrentMember", oFF.XValueType.CURRENT_MEMBER);
		oFF.QInAConverter.mapValueType("Unit", oFF.XValueType.UNIT);
		oFF.QInAConverter.mapValueType("Cuky", oFF.XValueType.CUKY);
		oFF.QInAConverter.s_lookupCellValueType = oFF.XArray.create(15);
		oFF.QInAConverter.s_lookupCellValueType.set(0, oFF.XValueType.DOUBLE);
		oFF.QInAConverter.s_lookupCellValueType.set(1, oFF.XValueType.PERCENT);
		oFF.QInAConverter.s_lookupCellValueType.set(2, oFF.XValueType.DATE);
		oFF.QInAConverter.s_lookupCellValueType.set(3, oFF.XValueType.TIME);
		oFF.QInAConverter.s_lookupCellValueType.set(4, oFF.XValueType.STRING);
		oFF.QInAConverter.s_lookupCellValueType.set(5, oFF.XValueType.AMOUNT);
		oFF.QInAConverter.s_lookupCellValueType.set(6, oFF.XValueType.QUANTITY);
		oFF.QInAConverter.s_lookupCellValueType.set(7, oFF.XValueType.PRICE);
		oFF.QInAConverter.s_lookupCellValueType.set(8, oFF.XValueType.DIMENSION_MEMBER);
		oFF.QInAConverter.s_lookupCellValueType.set(9, oFF.XValueType.INTEGER);
		oFF.QInAConverter.s_lookupCellValueType.set(10, oFF.XValueType.DECIMAL_FLOAT);
		oFF.QInAConverter.s_lookupCellValueType.set(11, oFF.XValueType.DATE_TIME);
		oFF.QInAConverter.s_lookupCellValueType.set(12, oFF.XValueType.DATE_TIME);
		oFF.QInAConverter.s_lookupCellValueType.set(13, oFF.XValueType.BOOLEAN);
		oFF.QInAConverter.s_lookupCellValueType.set(14, oFF.XValueType.POLYGON);
	},
	setupWindowFunctionTypeMapping:function()
	{
			oFF.QInAConverter.s_lookupWindowFunctionType = oFF.XHashMapByString.create();
		oFF.QInAConverter.s_lookupWindowFunctionTypeIna = oFF.XHashMapOfStringByString.create();
		oFF.QInAConverter.mapWindowFunctionType("SUM", oFF.WindowFunctionType.SUM);
		oFF.QInAConverter.mapWindowFunctionType("AVG", oFF.WindowFunctionType.AVERAGE);
		oFF.QInAConverter.mapWindowFunctionType("COUNT", oFF.WindowFunctionType.COUNT);
		oFF.QInAConverter.mapWindowFunctionType("MAX", oFF.WindowFunctionType.MAX);
		oFF.QInAConverter.mapWindowFunctionType("MIN", oFF.WindowFunctionType.MIN);
	},
	setupCtErrorHandlingMode:function()
	{
			oFF.QInAConverter.s_lookupCtErrorHandlingMode = oFF.XHashMapByString.create();
		oFF.QInAConverter.s_lookupCtErrorHandlingModeIna = oFF.XHashMapOfStringByString.create();
		oFF.QInAConverter.mapCtErrorHandlingMode("set to null", oFF.CtErrorHandlingMode.SET_TO_NULL);
		oFF.QInAConverter.mapCtErrorHandlingMode("keep unconverted", oFF.CtErrorHandlingMode.KEEP_UNCONVERTED);
		oFF.QInAConverter.mapCtErrorHandlingMode("fail on error", oFF.CtErrorHandlingMode.FAIL_ON_ERROR);
	},
	setupRateType:function()
	{
			oFF.QInAConverter.s_lookupRateType = oFF.XHashMapByString.create();
		oFF.QInAConverter.s_lookupRateTypeIna = oFF.XHashMapOfStringByString.create();
		oFF.QInAConverter.mapRateType("", oFF.CtRateType.DEFAULT);
		oFF.QInAConverter.mapRateType("Average", oFF.CtRateType.AVERAGE);
		oFF.QInAConverter.mapRateType("Closing", oFF.CtRateType.CLOSING);
	},
	setupCategory:function()
	{
			oFF.QInAConverter.s_lookupCategory = oFF.XHashMapByString.create();
		oFF.QInAConverter.s_lookupCategoryIna = oFF.XHashMapOfStringByString.create();
		oFF.QInAConverter.mapCategory("Actuals", oFF.CtCategory.ACTUALS);
		oFF.QInAConverter.mapCategory("Budget", oFF.CtCategory.BUDGET);
		oFF.QInAConverter.mapCategory("Planning", oFF.CtCategory.PLANNING);
		oFF.QInAConverter.mapCategory("Forecast", oFF.CtCategory.FORECAST);
		oFF.QInAConverter.mapCategory("Rolling Forecast", oFF.CtCategory.ROLLING_FORECAST);
	},
	setupProviderType:function()
	{
			oFF.QInAConverter.s_lookupProviderType = oFF.XHashMapByString.create();
		oFF.QInAConverter.s_lookupProviderTypeIna = oFF.XHashMapOfStringByString.create();
		oFF.QInAConverter.s_lookupProviderTypeFallbackIna = oFF.XHashMapOfStringByString.create();
		oFF.QInAConverter.mapProviderType(oFF.ServerService.CATALOG, oFF.ServerService.ANALYTIC, oFF.ProviderType.CATALOG);
		oFF.QInAConverter.mapProviderType(oFF.ServerService.VALUE_HELP, oFF.ServerService.ANALYTIC, oFF.ProviderType.ANALYTICS_VALUE_HELP);
		oFF.QInAConverter.mapProviderType(oFF.ServerService.LIST_REPORTING, null, oFF.ProviderType.LIST_REPORTING);
		oFF.QInAConverter.mapProviderType(oFF.ServerService.ANALYTIC, oFF.ServerService.ANALYTIC, oFF.ProviderType.ANALYTICS);
		oFF.QInAConverter.mapProviderType(oFF.ServerService.DIMENSION_EXTENSION, null, oFF.ProviderType.DIMENSION_EXTENSION);
		oFF.QInAConverter.mapProviderType(oFF.ServerService.DOCUMENTS, null, oFF.ProviderType.DOCUMENTS);
		oFF.QInAConverter.mapProviderType(oFF.ServerService.PLANNING, oFF.ServerService.ANALYTIC, oFF.ProviderType.PLANNING_COMMAND);
		oFF.QInAConverter.mapProviderType(oFF.ServerService.PLANNING, oFF.ServerService.ANALYTIC, oFF.ProviderType.PLANNING_VALUE_HELP);
	},
	setupInfoObjectType:function()
	{
			oFF.QInAConverter.s_lookupInfoObjectType = oFF.XHashMapByString.create();
		oFF.QInAConverter.s_lookupInfoObjectTypeIna = oFF.XHashMapOfStringByString.create();
		oFF.QInAConverter.mapInfoObjectType("CHA", oFF.InfoObjectType.CHA);
		oFF.QInAConverter.mapInfoObjectType("KYF", oFF.InfoObjectType.KYF);
		oFF.QInAConverter.mapInfoObjectType("TIM", oFF.InfoObjectType.TIM);
		oFF.QInAConverter.mapInfoObjectType("UNI", oFF.InfoObjectType.UNI);
		oFF.QInAConverter.mapInfoObjectType("DPA", oFF.InfoObjectType.DPA);
		oFF.QInAConverter.mapInfoObjectType("ATR", oFF.InfoObjectType.ATR);
		oFF.QInAConverter.mapInfoObjectType("MTA", oFF.InfoObjectType.MTA);
		oFF.QInAConverter.mapInfoObjectType("XXL", oFF.InfoObjectType.XXL);
		oFF.QInAConverter.mapInfoObjectType("ALL", oFF.InfoObjectType.ALL);
	},
	setupResultCalculation:function()
	{
			oFF.QInAConverter.s_lookupResultCalculation = oFF.XHashMapByString.create();
		oFF.QInAConverter.s_lookupResultCalculation.put("00", oFF.ResultCalculation.NOT_DEFINED);
		oFF.QInAConverter.s_lookupResultCalculation.put("01", oFF.ResultCalculation.SUM);
		oFF.QInAConverter.s_lookupResultCalculation.put("02", oFF.ResultCalculation.MAXIMUM);
		oFF.QInAConverter.s_lookupResultCalculation.put("03", oFF.ResultCalculation.MINIMUM);
		oFF.QInAConverter.s_lookupResultCalculation.put("04", oFF.ResultCalculation.COUNTER_FOR_ALL_DETAILED_VALUES);
		oFF.QInAConverter.s_lookupResultCalculation.put("05", oFF.ResultCalculation.COUNTER_FOR_ALL_DETAILED_VALUES_NZ_NULL_ERROR);
		oFF.QInAConverter.s_lookupResultCalculation.put("06", oFF.ResultCalculation.AVERAGE);
		oFF.QInAConverter.s_lookupResultCalculation.put("07", oFF.ResultCalculation.AVERAGE_DETAILED_VALUES_NOT_ZERO_NULL_ERROR);
		oFF.QInAConverter.s_lookupResultCalculation.put("08", oFF.ResultCalculation.STANDARD_DEVIATION);
		oFF.QInAConverter.s_lookupResultCalculation.put("09", oFF.ResultCalculation.VARIANCE);
		oFF.QInAConverter.s_lookupResultCalculation.put("11", oFF.ResultCalculation.FIRST_VALUE);
		oFF.QInAConverter.s_lookupResultCalculation.put("12", oFF.ResultCalculation.LAST_VALUE);
		oFF.QInAConverter.s_lookupResultCalculation.put("13", oFF.ResultCalculation.SUMMATION_OF_ROUNDED_VALUES);
		oFF.QInAConverter.s_lookupResultCalculation.put("14", oFF.ResultCalculation.HIDE);
	},
	setupValueDomain:function()
	{
			oFF.QInAConverter.s_lookupProcessingType = oFF.XHashMapByString.create();
		oFF.QInAConverter.s_lookupProcessingTypeIna = oFF.XHashMapOfStringByString.create();
		oFF.QInAConverter.mapValueDomain("CurrencyConversion", oFF.ProcessingType.CURRENCY_CONVERSION);
	},
	setupCellChartOrientationMapping:function()
	{
			oFF.QInAConverter.s_lookupCellChartOrientation = oFF.XHashMapByString.create();
		oFF.QInAConverter.s_lookupCellChartOrientationIna = oFF.XHashMapOfStringByString.create();
		oFF.QInAConverter.mapCellChartOrientation("Horizontal", oFF.CellChartOrientation.HORIZONTAL);
		oFF.QInAConverter.mapCellChartOrientation("Vertical", oFF.CellChartOrientation.VERTICAL);
	},
	setupCellChartTypeMapping:function()
	{
			oFF.QInAConverter.s_lookupCellChartType = oFF.XHashMapByString.create();
		oFF.QInAConverter.s_lookupCellChartTypeIna = oFF.XHashMapOfStringByString.create();
		oFF.QInAConverter.mapCellChartType("Bar", oFF.CellChartType.BAR);
		oFF.QInAConverter.mapCellChartType("VarianceBar", oFF.CellChartType.VARIANCE_BAR);
		oFF.QInAConverter.mapCellChartType("Pin", oFF.CellChartType.PIN);
	},
	setupDocumentIdsAction:function()
	{
			oFF.QInAConverter.s_lookupDocumentIdsAction = oFF.XHashMapByString.create();
		oFF.QInAConverter.s_lookupDocumentIdsActionIna = oFF.XHashMapOfStringByString.create();
		oFF.QInAConverter.mapDocumentIdsAction("Create", oFF.DocumentsIdsAction.CREATE);
		oFF.QInAConverter.mapDocumentIdsAction("Delete", oFF.DocumentsIdsAction.DELETE);
	},
	setupDocumentIdsScope:function()
	{
			oFF.QInAConverter.s_lookupDocumentIdsScope = oFF.XHashMapByString.create();
		oFF.QInAConverter.s_lookupDocumentIdsScopeIna = oFF.XHashMapOfStringByString.create();
		oFF.QInAConverter.mapDocumentIdsScope("None", oFF.DocumentsIdsScope.NONE);
		oFF.QInAConverter.mapDocumentIdsScope("ResultSetBound", oFF.DocumentsIdsScope.RESULT_SET_BOUND);
		oFF.QInAConverter.mapDocumentIdsScope("SystemUnique", oFF.DocumentsIdsScope.SYSTEM_UNIQUE);
	},
	setupDocumentSupportType:function()
	{
			oFF.QInAConverter.s_lookupDocumentSupportType = oFF.XHashMapByString.create();
		oFF.QInAConverter.s_lookupDocumentSupportTypeIna = oFF.XHashMapOfStringByString.create();
		oFF.QInAConverter.mapDocumentSupportType("None", oFF.DocumentsSupportType.NONE);
		oFF.QInAConverter.mapDocumentSupportType("Read", oFF.DocumentsSupportType.READ);
		oFF.QInAConverter.mapDocumentSupportType("ReadWrite", oFF.DocumentsSupportType.READ_WRITE);
	},
	setupReturnedDataSelectionMapping:function()
	{
			oFF.QInAConverter.s_lookupReturnedDataSelection = oFF.XHashMapByString.create();
		oFF.QInAConverter.s_lookupReturnedDataSelectionIna = oFF.XHashMapOfStringByString.create();
		oFF.QInAConverter.mapReturnedDataSelection("Actions", oFF.ReturnedDataSelection.ACTIONS);
		oFF.QInAConverter.mapReturnedDataSelection("CellDataType", oFF.ReturnedDataSelection.CELL_DATA_TYPE);
		oFF.QInAConverter.mapReturnedDataSelection("CellFormat", oFF.ReturnedDataSelection.CELL_FORMAT);
		oFF.QInAConverter.mapReturnedDataSelection("CellMeasure", oFF.ReturnedDataSelection.CELL_MEASURE);
		oFF.QInAConverter.mapReturnedDataSelection("CellValueTypes", oFF.ReturnedDataSelection.CELL_VALUE_TYPES);
		oFF.QInAConverter.mapReturnedDataSelection("ExceptionAlertLevel", oFF.ReturnedDataSelection.EXCEPTION_ALERTLEVEL);
		oFF.QInAConverter.mapReturnedDataSelection("ExceptionName", oFF.ReturnedDataSelection.EXCEPTION_NAME);
		oFF.QInAConverter.mapReturnedDataSelection("ExceptionSettings", oFF.ReturnedDataSelection.EXCEPTION_SETTINGS);
		oFF.QInAConverter.mapReturnedDataSelection("Exceptions", oFF.ReturnedDataSelection.EXCEPTIONS);
		oFF.QInAConverter.mapReturnedDataSelection("InputEnabled", oFF.ReturnedDataSelection.INPUT_ENABLED);
		oFF.QInAConverter.mapReturnedDataSelection("InputReadinessStates", oFF.ReturnedDataSelection.INPUT_READINESS_STATES);
		oFF.QInAConverter.mapReturnedDataSelection("NumericRounding", oFF.ReturnedDataSelection.NUMERIC_ROUNDING);
		oFF.QInAConverter.mapReturnedDataSelection("NumericShift", oFF.ReturnedDataSelection.NUMERIC_SHIFT);
		oFF.QInAConverter.mapReturnedDataSelection("TupleDisplayLevel", oFF.ReturnedDataSelection.TUPLE_DISPLAY_LEVEL);
		oFF.QInAConverter.mapReturnedDataSelection("TupleDrillState", oFF.ReturnedDataSelection.TUPLE_DRILL_STATE);
		oFF.QInAConverter.mapReturnedDataSelection("TupleElementIds", oFF.ReturnedDataSelection.TUPLE_ELEMENT_IDS);
		oFF.QInAConverter.mapReturnedDataSelection("TupleElementIndexes", oFF.ReturnedDataSelection.TUPLE_ELEMENT_INDEXES);
		oFF.QInAConverter.mapReturnedDataSelection("TupleLevel", oFF.ReturnedDataSelection.TUPLE_LEVEL);
		oFF.QInAConverter.mapReturnedDataSelection("TupleParentIndexes", oFF.ReturnedDataSelection.TUPLE_PARENT_INDEXES);
		oFF.QInAConverter.mapReturnedDataSelection("UnitDescriptions", oFF.ReturnedDataSelection.UNIT_DESCRIPTIONS);
		oFF.QInAConverter.mapReturnedDataSelection("UnitIndex", oFF.ReturnedDataSelection.UNIT_INDEX);
		oFF.QInAConverter.mapReturnedDataSelection("UnitTypes", oFF.ReturnedDataSelection.UNIT_TYPES);
		oFF.QInAConverter.mapReturnedDataSelection("Units", oFF.ReturnedDataSelection.UNITS);
		oFF.QInAConverter.mapReturnedDataSelection("Values", oFF.ReturnedDataSelection.VALUES);
		oFF.QInAConverter.mapReturnedDataSelection("ValuesFormatted", oFF.ReturnedDataSelection.VALUES_FORMATTED);
		oFF.QInAConverter.mapReturnedDataSelection("ValuesRounded", oFF.ReturnedDataSelection.VALUES_ROUNDED);
		oFF.QInAConverter.mapReturnedDataSelection("CellExplain", oFF.ReturnedDataSelection.CELL_EXPLAIN);
	},
	setupProtocolBindingType:function()
	{
			oFF.QInAConverter.s_lookupProtocolBindingType = oFF.XHashMapByString.create();
		oFF.QInAConverter.s_lookupProtocolBindingTypeIna = oFF.XHashMapOfStringByString.create();
		oFF.QInAConverter.mapProtocolBindingType("HighChart", oFF.ProtocolBindingType.HIGH_CHART_PROTOCOL);
		oFF.QInAConverter.mapProtocolBindingType("GoogleChart", oFF.ProtocolBindingType.GOOGLE_CHART_PROTOCOL);
		oFF.QInAConverter.mapProtocolBindingType("MicroChart", oFF.ProtocolBindingType.MICRO_CHART_PROTOCOL);
		oFF.QInAConverter.mapProtocolBindingType("FireflyGrid", oFF.ProtocolBindingType.FIREFLY_GRID);
		oFF.QInAConverter.mapProtocolBindingType("SacTableGrid", oFF.ProtocolBindingType.SAC_TABLE_GRID);
		oFF.QInAConverter.mapProtocolBindingType("PlainGrid", oFF.ProtocolBindingType.PLAIN_GRID);
		oFF.QInAConverter.mapProtocolBindingType("VizFrame", oFF.ProtocolBindingType.VIZ_FRAME_PROTOCOL);
		oFF.QInAConverter.mapProtocolBindingType("SapKpi", oFF.ProtocolBindingType.SAP_KPI_PROTOCOL);
	},
	setupSemanticBindingType:function()
	{
			oFF.QInAConverter.s_lookupSemanticBindingType = oFF.XHashMapByString.create();
		oFF.QInAConverter.s_lookupSemanticBindingTypeIna = oFF.XHashMapOfStringByString.create();
		oFF.QInAConverter.mapSemanticBindingType("Chart", oFF.SemanticBindingType.CHART);
		oFF.QInAConverter.mapSemanticBindingType("Table", oFF.SemanticBindingType.TABLE);
		oFF.QInAConverter.mapSemanticBindingType("Grid", oFF.SemanticBindingType.GRID);
		oFF.QInAConverter.mapSemanticBindingType("Kpi", oFF.SemanticBindingType.KPI);
	},
	setupRunningTotalOperator:function()
	{
			oFF.QInAConverter.s_lookupRunningTotalOperatorIna = oFF.XHashMapOfStringByString.create();
		oFF.QInAConverter.s_lookupRunningTotalOperator = oFF.XHashMapByString.create();
		oFF.QInAConverter.mapRunningTotalOperator("Count", oFF.RunningTotalOperator.COUNT);
		oFF.QInAConverter.mapRunningTotalOperator("Min", oFF.RunningTotalOperator.MIN);
		oFF.QInAConverter.mapRunningTotalOperator("Max", oFF.RunningTotalOperator.MAX);
		oFF.QInAConverter.mapRunningTotalOperator("Sum", oFF.RunningTotalOperator.SUM);
		oFF.QInAConverter.mapRunningTotalOperator("Average", oFF.RunningTotalOperator.AVERAGE);
	},
	setupCurrencyPresentation:function()
	{
			oFF.QInAConverter.s_lookupCurrencyPresentationIna = oFF.XHashMapOfStringByString.create();
		oFF.QInAConverter.s_lookupCurrencyPresentation = oFF.XHashMapByString.create();
		oFF.QInAConverter.mapCurrencyPresentation("Iso", oFF.CurrencyPresentation.ISO);
		oFF.QInAConverter.mapCurrencyPresentation("Symbol", oFF.CurrencyPresentation.SYMBOL);
	},
	setupScaleAndUnitPlacement:function()
	{
			oFF.QInAConverter.s_lookupScaleAndUnitPlacementIna = oFF.XHashMapOfStringByString.create();
		oFF.QInAConverter.s_lookupScaleAndUnitPlacement = oFF.XHashMapByString.create();
		oFF.QInAConverter.mapScaleAndUnitPlacement("Cell", oFF.ScaleAndUnitPlacement.CELL);
		oFF.QInAConverter.mapScaleAndUnitPlacement("Rows", oFF.ScaleAndUnitPlacement.ROWS);
		oFF.QInAConverter.mapScaleAndUnitPlacement("Columns", oFF.ScaleAndUnitPlacement.COLUMNS);
		oFF.QInAConverter.mapScaleAndUnitPlacement("Subtitle", oFF.ScaleAndUnitPlacement.SUBTITLE);
	},
	setupDateRangeGranularity:function()
	{
			oFF.QInAConverter.s_lookupDateRangeGranularityIna = oFF.XHashMapOfStringByString.create();
		oFF.QInAConverter.s_lookupDateRangeGranularity = oFF.XHashMapByString.create();
		oFF.QInAConverter.mapDateRangeGranularity("Year", oFF.DateRangeGranularity.YEAR);
		oFF.QInAConverter.mapDateRangeGranularity("Quarter", oFF.DateRangeGranularity.QUARTER);
		oFF.QInAConverter.mapDateRangeGranularity("Month", oFF.DateRangeGranularity.MONTH);
		oFF.QInAConverter.mapDateRangeGranularity("Day", oFF.DateRangeGranularity.DAY);
		oFF.QInAConverter.mapDateRangeGranularity("CurrentYear", oFF.DateRangeGranularity.CURRENT_YEAR);
		oFF.QInAConverter.mapDateRangeGranularity("CurrentQuarter", oFF.DateRangeGranularity.CURRENT_QUARTER);
		oFF.QInAConverter.mapDateRangeGranularity("CurrentMonth", oFF.DateRangeGranularity.CURRENT_MONTH);
	},
	setupScaleFormat:function()
	{
			oFF.QInAConverter.s_lookupScaleFormatIna = oFF.XHashMapOfStringByString.create();
		oFF.QInAConverter.s_lookupScaleFormat = oFF.XHashMapByString.create();
		oFF.QInAConverter.mapScaleFormat("Short", oFF.ScaleFormat.SHORT);
		oFF.QInAConverter.mapScaleFormat("Long", oFF.ScaleFormat.LONG);
	},
	setupSignPresentation:function()
	{
			oFF.QInAConverter.s_lookupSignPresentationIna = oFF.XHashMapOfStringByString.create();
		oFF.QInAConverter.s_lookupSignPresentation = oFF.XHashMapByString.create();
		oFF.QInAConverter.mapSignPresentation("BeforeNumber", oFF.SignPresentation.BEFORE_NUMBER);
		oFF.QInAConverter.mapSignPresentation("AfterNumber", oFF.SignPresentation.AFTER_NUMBER);
		oFF.QInAConverter.mapSignPresentation("Brackets", oFF.SignPresentation.BRACKETS);
	},
	setupDimensionVisibility:function()
	{
			oFF.QInAConverter.s_lookupDimensionVisibilityInt = oFF.XArray.create(3);
		oFF.QInAConverter.s_lookupDimensionVisibilityInt.set(0, oFF.DimensionVisibility.VISIBLE);
		oFF.QInAConverter.s_lookupDimensionVisibilityInt.set(1, oFF.DimensionVisibility.METADATA);
		oFF.QInAConverter.s_lookupDimensionVisibilityInt.set(2, oFF.DimensionVisibility.HIDDEN);
	},
	mapConstant:function(mapToEnum, mapToIna, ffConstant, inaConstant)
	{
			mapToEnum.put(inaConstant, ffConstant);
		mapToIna.put(ffConstant.getName(), inaConstant);
	},
	mapValueType:function(inaConstant, ffConstant)
	{
			oFF.QInAConverter.mapConstant(oFF.QInAConverter.s_lookupValueType, oFF.QInAConverter.s_lookupValueTypeIna, ffConstant, inaConstant);
		oFF.QInAConverter.s_lookupValueType.put(oFF.XString.toUpperCase(inaConstant), ffConstant);
	},
	mapAggregationType:function(inaConstant, ffConstant)
	{
			oFF.QInAConverter.mapConstant(oFF.QInAConverter.s_lookupAggregationType, oFF.QInAConverter.s_lookupAggregationTypeIna, ffConstant, inaConstant);
	},
	mapComponentType:function(inaConstant, ffConstant)
	{
			oFF.QInAConverter.mapConstant(oFF.QInAConverter.s_lookupComponentType, oFF.QInAConverter.s_lookupComponentTypeIna, ffConstant, inaConstant);
	},
	mapSortType:function(inaConstant, ffConstant)
	{
			oFF.QInAConverter.mapConstant(oFF.QInAConverter.s_lookupSortType, oFF.QInAConverter.s_lookupSortTypeIna, ffConstant, inaConstant);
	},
	mapComparison:function(inaConstant, ffConstant)
	{
			oFF.QInAConverter.s_lookupComparison.put(inaConstant, ffConstant);
		if (!oFF.QInAConverter.s_lookupComparisonIna.containsKey(ffConstant.getName()))
		{
			oFF.QInAConverter.s_lookupComparisonIna.put(ffConstant.getName(), inaConstant);
		}
	},
	mapPresentationType:function(inaConstant, ffConstant)
	{
			oFF.QInAConverter.mapConstant(oFF.QInAConverter.s_lookupPresentationType, oFF.QInAConverter.s_lookupPresentationTypeIna, ffConstant, inaConstant);
	},
	mapInfoObjectType:function(inaConstant, ffConstant)
	{
			oFF.QInAConverter.mapConstant(oFF.QInAConverter.s_lookupInfoObjectType, oFF.QInAConverter.s_lookupInfoObjectTypeIna, ffConstant, inaConstant);
	},
	mapVisibilityType:function(inaConstant, ffConstant)
	{
			oFF.QInAConverter.mapConstant(oFF.QInAConverter.s_lookupVisibilityType, oFF.QInAConverter.s_lookupVisibilityTypeIna, ffConstant, inaConstant);
	},
	mapReadMode:function(inaConstant, ffConstant)
	{
			oFF.QInAConverter.mapConstant(oFF.QInAConverter.s_lookupReadMode, oFF.QInAConverter.s_lookupReadModeIna, ffConstant, inaConstant);
	},
	mapWindowFunctionType:function(inaConstant, ffConstant)
	{
			oFF.QInAConverter.mapConstant(oFF.QInAConverter.s_lookupWindowFunctionType, oFF.QInAConverter.s_lookupWindowFunctionTypeIna, ffConstant, inaConstant);
	},
	mapCtErrorHandlingMode:function(inaConstant, ffConstant)
	{
			oFF.QInAConverter.mapConstant(oFF.QInAConverter.s_lookupCtErrorHandlingMode, oFF.QInAConverter.s_lookupCtErrorHandlingModeIna, ffConstant, inaConstant);
	},
	mapRateType:function(inaConstant, ffConstant)
	{
			oFF.QInAConverter.mapConstant(oFF.QInAConverter.s_lookupRateType, oFF.QInAConverter.s_lookupRateTypeIna, ffConstant, inaConstant);
	},
	mapCategory:function(inaConstant, ffConstant)
	{
			oFF.QInAConverter.mapConstant(oFF.QInAConverter.s_lookupCategory, oFF.QInAConverter.s_lookupCategoryIna, ffConstant, inaConstant);
	},
	mapProviderType:function(inaConstant, inaConstantFallback, ffConstant)
	{
			oFF.QInAConverter.mapConstant(oFF.QInAConverter.s_lookupProviderType, oFF.QInAConverter.s_lookupProviderTypeIna, ffConstant, inaConstant);
		oFF.QInAConverter.s_lookupProviderTypeFallbackIna.put(ffConstant.getName(), inaConstantFallback);
	},
	mapValueDomain:function(inaConstant, ffConstant)
	{
			oFF.QInAConverter.mapConstant(oFF.QInAConverter.s_lookupProcessingType, oFF.QInAConverter.s_lookupProcessingTypeIna, ffConstant, inaConstant);
	},
	mapReturnedDataSelection:function(inaConstant, ffConstant)
	{
			oFF.QInAConverter.mapConstant(oFF.QInAConverter.s_lookupReturnedDataSelection, oFF.QInAConverter.s_lookupReturnedDataSelectionIna, ffConstant, inaConstant);
	},
	mapDocumentIdsScope:function(inaConstant, ffConstant)
	{
			oFF.QInAConverter.mapConstant(oFF.QInAConverter.s_lookupDocumentIdsScope, oFF.QInAConverter.s_lookupDocumentIdsScopeIna, ffConstant, inaConstant);
	},
	mapDocumentSupportType:function(inaConstant, ffConstant)
	{
			oFF.QInAConverter.mapConstant(oFF.QInAConverter.s_lookupDocumentSupportType, oFF.QInAConverter.s_lookupDocumentSupportTypeIna, ffConstant, inaConstant);
	},
	mapProtocolBindingType:function(inaConstant, ffConstant)
	{
			oFF.QInAConverter.mapConstant(oFF.QInAConverter.s_lookupProtocolBindingType, oFF.QInAConverter.s_lookupProtocolBindingTypeIna, ffConstant, inaConstant);
	},
	mapSemanticBindingType:function(inaConstant, ffConstant)
	{
			oFF.QInAConverter.mapConstant(oFF.QInAConverter.s_lookupSemanticBindingType, oFF.QInAConverter.s_lookupSemanticBindingTypeIna, ffConstant, inaConstant);
	},
	mapDocumentIdsAction:function(inaConstant, ffConstant)
	{
			oFF.QInAConverter.mapConstant(oFF.QInAConverter.s_lookupDocumentIdsAction, oFF.QInAConverter.s_lookupDocumentIdsActionIna, ffConstant, inaConstant);
	},
	mapCellChartOrientation:function(inaConstant, ffConstant)
	{
			oFF.QInAConverter.mapConstant(oFF.QInAConverter.s_lookupCellChartOrientation, oFF.QInAConverter.s_lookupCellChartOrientationIna, ffConstant, inaConstant);
	},
	mapCellChartType:function(inaConstant, ffConstant)
	{
			oFF.QInAConverter.mapConstant(oFF.QInAConverter.s_lookupCellChartType, oFF.QInAConverter.s_lookupCellChartTypeIna, ffConstant, inaConstant);
	},
	mapRunningTotalOperator:function(inaConstant, ffConstant)
	{
			oFF.QInAConverter.mapConstant(oFF.QInAConverter.s_lookupRunningTotalOperator, oFF.QInAConverter.s_lookupRunningTotalOperatorIna, ffConstant, inaConstant);
	},
	mapCurrencyPresentation:function(inaConstant, ffConstant)
	{
			oFF.QInAConverter.mapConstant(oFF.QInAConverter.s_lookupCurrencyPresentation, oFF.QInAConverter.s_lookupCurrencyPresentationIna, ffConstant, inaConstant);
	},
	mapScaleAndUnitPlacement:function(inaConstant, ffConstant)
	{
			oFF.QInAConverter.mapConstant(oFF.QInAConverter.s_lookupScaleAndUnitPlacement, oFF.QInAConverter.s_lookupScaleAndUnitPlacementIna, ffConstant, inaConstant);
	},
	mapDateRangeGranularity:function(inaConstant, ffConstant)
	{
			oFF.QInAConverter.mapConstant(oFF.QInAConverter.s_lookupDateRangeGranularity, oFF.QInAConverter.s_lookupDateRangeGranularityIna, ffConstant, inaConstant);
	},
	mapScaleFormat:function(inaConstant, ffConstant)
	{
			oFF.QInAConverter.mapConstant(oFF.QInAConverter.s_lookupScaleFormat, oFF.QInAConverter.s_lookupScaleFormatIna, ffConstant, inaConstant);
	},
	mapSignPresentation:function(inaConstant, ffConstant)
	{
			oFF.QInAConverter.mapConstant(oFF.QInAConverter.s_lookupSignPresentation, oFF.QInAConverter.s_lookupSignPresentationIna, ffConstant, inaConstant);
	},
	lookupInAString:function(map, ffConstant)
	{
			return oFF.isNull(ffConstant) ? null : map.getByKey(ffConstant.getName());
	},
	lookupContextNameForProvider:function(ffConstant)
	{
			var inaConstant;
		if (ffConstant === oFF.ProviderType.PLANNING || ffConstant === oFF.ProviderType.PLANNING_VALUE_HELP)
		{
			inaConstant = "Planning";
		}
		else if (ffConstant === oFF.ProviderType.LIST_REPORTING)
		{
			inaConstant = "ListReporting";
		}
		else
		{
			inaConstant = "Analytics";
		}
		return inaConstant;
	},
	lookupServiceNameForProvider:function(ffConstant)
	{
			return oFF.QInAConverter.s_lookupProviderTypeIna.getByKey(ffConstant.getName());
	},
	lookupFallbackServiceNameForProvider:function(ffConstant)
	{
			var inaConstant = null;
		if (ffConstant === oFF.ProviderType.ANALYTICS || ffConstant === oFF.ProviderType.ANALYTICS_VALUE_HELP || ffConstant === oFF.ProviderType.PLANNING || ffConstant === oFF.ProviderType.CATALOG)
		{
			inaConstant = oFF.ServerService.ANALYTIC;
		}
		return inaConstant;
	},
	lookupMeasureStructureMemberTypeIna:function(ffConstant)
	{
			var inaConstant = null;
		if (oFF.notNull(ffConstant))
		{
			if (ffConstant === oFF.MemberType.RESTRICTED_MEASURE)
			{
				inaConstant = "SelectionMeasure";
			}
			else if (ffConstant === oFF.MemberType.FORMULA)
			{
				inaConstant = "FormulaMeasure";
			}
			else if (ffConstant === oFF.MemberType.VARIANCE)
			{
				inaConstant = "VarianceMeasure";
			}
			else if (ffConstant === oFF.MemberType.EXCEPTION_AGGREGATION)
			{
				inaConstant = "ExceptionAggregationMeasure";
			}
			else if (ffConstant === oFF.MemberType.CURRENCY_MEASURE)
			{
				inaConstant = "CurrencyMeasure";
			}
			else if (ffConstant === oFF.MemberType.RUNNING_TOTAL)
			{
				inaConstant = "RunningTotal";
			}
			else
			{
				inaConstant = "Measure";
			}
		}
		return inaConstant;
	},
	lookupMeasureStructureMemberTypeInaForUniversalModels:function(ffConstant)
	{
			var inaConstant;
		if (oFF.isNull(ffConstant))
		{
			inaConstant = -1;
		}
		else if (ffConstant === oFF.MemberType.FORMULA)
		{
			inaConstant = 0;
		}
		else if (ffConstant === oFF.MemberType.RESTRICTED_MEASURE)
		{
			inaConstant = 1;
		}
		else
		{
			inaConstant = 2;
		}
		return inaConstant;
	},
	lookupAggregationTypeInA:function(ffConstant)
	{
			return oFF.QInAConverter.lookupInAString(oFF.QInAConverter.s_lookupAggregationTypeIna, ffConstant);
	},
	lookupAggregationType:function(inaConstant)
	{
			return oFF.QInAConverter.s_lookupAggregationType.getByKey(inaConstant);
	},
	lookupAggregationType2:function(inaAggregationType)
	{
			switch (inaAggregationType)
		{
			case 1:
				return oFF.AggregationType.SUM;

			case 2:
				return oFF.AggregationType.COUNT;

			case 3:
				return oFF.AggregationType.MIN;

			case 4:
				return oFF.AggregationType.MAX;

			case 5:
				return oFF.AggregationType.AVERAGE;

			case 6:
				return oFF.AggregationType.COUNT_DISTINCT;

			case 7:
				return oFF.AggregationType.LAST;

			case 8:
				return oFF.AggregationType.FIRST;

			case 9:
				return oFF.AggregationType.VARIANCE;

			case 10:
				return oFF.AggregationType.STANDARD_DEVIATION;

			case 11:
				return oFF.AggregationType.NOP_NULL;

			case 12:
				return oFF.AggregationType.NOP_NULL_ZERO;

			default:
				return null;
		}
	},
	lookupComparisonInA:function(ffConstant)
	{
			return oFF.QInAConverter.lookupInAString(oFF.QInAConverter.s_lookupComparisonIna, ffConstant);
	},
	lookupComparison:function(inaConstant)
	{
			return oFF.QInAConverter.s_lookupComparison.getByKey(inaConstant);
	},
	lookupConstantWithDefault:function(map, key, defaultConstant)
	{
			var ffConstant = map.getByKey(key);
		return oFF.isNull(ffConstant) ? defaultConstant : ffConstant;
	},
	lookupPresentationType:function(inaConstant)
	{
			return oFF.QInAConverter.lookupConstantWithDefault(oFF.QInAConverter.s_lookupPresentationType, inaConstant, oFF.PresentationType.VALUE);
	},
	lookupPresentationTypeInA:function(ffConstant)
	{
			return oFF.QInAConverter.lookupInAString(oFF.QInAConverter.s_lookupPresentationTypeIna, ffConstant);
	},
	lookupInfoObjectType:function(inaConstant)
	{
			return oFF.QInAConverter.s_lookupInfoObjectType.getByKey(inaConstant);
	},
	lookupInfoObjectTypeInA:function(ffConstant)
	{
			return oFF.QInAConverter.lookupInAString(oFF.QInAConverter.s_lookupInfoObjectTypeIna, ffConstant);
	},
	lookupVisibilityType:function(inaConstant)
	{
			return oFF.QInAConverter.s_lookupVisibilityType.getByKey(inaConstant);
	},
	lookupVisibilityTypeInA:function(ffConstant)
	{
			return oFF.QInAConverter.lookupInAString(oFF.QInAConverter.s_lookupVisibilityTypeIna, ffConstant);
	},
	lookupSortDirectionInA:function(ffConstant)
	{
			var inaConstant;
		if (ffConstant === oFF.XSortDirection.ASCENDING)
		{
			inaConstant = 1;
		}
		else if (ffConstant === oFF.XSortDirection.DESCENDING)
		{
			inaConstant = 2;
		}
		else if (ffConstant === oFF.XSortDirection.NONE)
		{
			inaConstant = 3;
		}
		else
		{
			inaConstant = 0;
		}
		return inaConstant;
	},
	lookupSortDirectionInA2:function(ffConstant)
	{
			var inaConstant;
		if (ffConstant === oFF.XSortDirection.ASCENDING)
		{
			inaConstant = "Asc";
		}
		else if (ffConstant === oFF.XSortDirection.DESCENDING)
		{
			inaConstant = "Desc";
		}
		else
		{
			inaConstant = "None";
		}
		return inaConstant;
	},
	lookupSortDirection:function(inaConstant)
	{
			switch (inaConstant)
		{
			case 1:
				return oFF.XSortDirection.ASCENDING;

			case 2:
				return oFF.XSortDirection.DESCENDING;

			case 3:
				return oFF.XSortDirection.NONE;

			default:
				return oFF.XSortDirection.DEFAULT_VALUE;
		}
	},
	lookupSortDirection2:function(inaConstant)
	{
			if (oFF.XString.isEqual("Asc", inaConstant))
		{
			return oFF.XSortDirection.ASCENDING;
		}
		else if (oFF.XString.isEqual("Desc", inaConstant))
		{
			return oFF.XSortDirection.DESCENDING;
		}
		else
		{
			return oFF.XSortDirection.NONE;
		}
	},
	lookupDimensionType:function(inaConstant)
	{
			if (inaConstant === -2)
		{
			return oFF.DimensionType.CALCULATED_DIMENSION;
		}
		else if (inaConstant === -3)
		{
			return oFF.DimensionType.FORMULA_CALCULATED_DIMENSION;
		}
		else if (inaConstant < 1 || inaConstant === 3)
		{
			return oFF.DimensionType.DIMENSION;
		}
		else if (inaConstant > 13)
		{
			throw oFF.XException.createIllegalStateException("Unknown dimension type");
		}
		else
		{
			return oFF.QInAConverter.s_lookupDimensionTypeInt.get(inaConstant);
		}
	},
	lookupDimensionVisibility:function(inaConstant)
	{
			if (inaConstant === 0)
		{
			return oFF.DimensionVisibility.VISIBLE;
		}
		if (inaConstant === 1)
		{
			return oFF.DimensionVisibility.METADATA;
		}
		if (inaConstant === 2)
		{
			return oFF.DimensionVisibility.HIDDEN;
		}
		throw oFF.XException.createIllegalStateException("Unknown dimension visibility");
	},
	indexOf:function(array, ffConstant)
	{
			var size = array.size();
		for (var i = 1; i < size; i++)
		{
			if (array.get(i) === ffConstant)
			{
				return i;
			}
		}
		return -1;
	},
	lookupDimensionTypeInA:function(ffConstant)
	{
			var inaConstant;
		if (ffConstant === oFF.DimensionType.CALCULATED_DIMENSION)
		{
			inaConstant = -2;
		}
		else if (ffConstant.isTypeOf(oFF.DimensionType.FORMULA_CALCULATED_DIMENSION))
		{
			inaConstant = -3;
		}
		else
		{
			inaConstant = oFF.QInAConverter.indexOf(oFF.QInAConverter.s_lookupDimensionTypeInt, ffConstant);
			if (inaConstant === -1)
			{
				throw oFF.XException.createIllegalStateException("Unknown dimension type");
			}
		}
		return inaConstant;
	},
	lookupDimensionVisibilityIna:function(visibility)
	{
			if (visibility === oFF.DimensionVisibility.VISIBLE)
		{
			return 0;
		}
		if (visibility === oFF.DimensionVisibility.METADATA)
		{
			return 1;
		}
		if (visibility === oFF.DimensionVisibility.HIDDEN)
		{
			return 2;
		}
		throw oFF.XException.createIllegalStateException("Unknown dimension visibility");
	},
	lookupValidOrDefault:function(actual, max, defaultConstant, constants)
	{
			return actual < 0 || actual > max ? defaultConstant : constants.get(actual);
	},
	lookupResultSetState:function(inaConstant)
	{
			return oFF.QInAConverter.lookupValidOrDefault(inaConstant, 6, oFF.ResultSetState.ERROR, oFF.QInAConverter.s_lookupResultsetState);
	},
	lookupReadModeInA:function(ffConstant)
	{
			return oFF.QInAConverter.lookupInAString(oFF.QInAConverter.s_lookupReadModeIna, ffConstant);
	},
	lookupReadMode:function(inaConstant)
	{
			return oFF.QInAConverter.s_lookupReadMode.getByKey(inaConstant);
	},
	lookupDrillState:function(inaConstant, convertUdhDrillStates)
	{
			switch (inaConstant)
		{
			case 2:
				return oFF.DrillState.COLLAPSED;

			case 3:
				return oFF.DrillState.EXPANDED;

			case 1:
				return oFF.DrillState.LEAF;

			case 4:
				return convertUdhDrillStates ? oFF.DrillState.EXPANDED : oFF.DrillState.DRILLED;

			case 100:
				return convertUdhDrillStates ? oFF.DrillState.EXPANDED : oFF.DrillState.LEAF_DRILLDOWN_ALLOWED;

			case 101:
				return convertUdhDrillStates ? oFF.DrillState.EXPANDED : oFF.DrillState.LEAF_UDH_EXPAND_ALLOWED;

			case 102:
				return convertUdhDrillStates ? oFF.DrillState.LEAF : oFF.DrillState.LEAF_UDH;

			case 103:
				return convertUdhDrillStates ? oFF.DrillState.COLLAPSED : oFF.DrillState.COLLAPSED_EXPAND_AND_DRILLDOWN_ALLOWED;

			default:
				return null;
		}
	},
	lookupDrillStateOp:function(inaConstant)
	{
			if (oFF.isNull(inaConstant))
		{
			return null;
		}
		switch (inaConstant)
		{
			case "Collapsed":
				return oFF.DrillState.COLLAPSED;

			case "Expanded":
				return oFF.DrillState.EXPANDED;

			case "Drilled":
				return oFF.DrillState.DRILLED;

			default:
				return null;
		}
	},
	lookupDrillStateInA:function(ffConstant)
	{
			var inaConstant = null;
		if (ffConstant === oFF.DrillState.COLLAPSED)
		{
			inaConstant = "Collapsed";
		}
		else if (ffConstant === oFF.DrillState.EXPANDED)
		{
			inaConstant = "Expanded";
		}
		else if (ffConstant === oFF.DrillState.DRILLED)
		{
			inaConstant = "Drilled";
		}
		return inaConstant;
	},
	lookupEncoding:function(inaConstant)
	{
			return oFF.QInAConverter.s_lookupEncoding.getByKey(inaConstant);
	},
	lookupHierarchyLevelTypeIna:function(ffConstant)
	{
			var inaConstant;
		if (ffConstant === oFF.HierarchyLevelType.ALL)
		{
			inaConstant = 1;
		}
		else if (ffConstant === oFF.HierarchyLevelType.TIME_YEAR)
		{
			inaConstant = 20;
		}
		else if (ffConstant === oFF.HierarchyLevelType.TIME_HALF_YEAR)
		{
			inaConstant = 36;
		}
		else if (ffConstant === oFF.HierarchyLevelType.TIME_QUARTER)
		{
			inaConstant = 68;
		}
		else if (ffConstant === oFF.HierarchyLevelType.TIME_MONTH)
		{
			inaConstant = 132;
		}
		else if (ffConstant === oFF.HierarchyLevelType.TIME_WEEK)
		{
			inaConstant = 260;
		}
		else if (ffConstant === oFF.HierarchyLevelType.TIME_DAY)
		{
			inaConstant = 516;
		}
		else if (ffConstant === oFF.HierarchyLevelType.TIME_HOUR)
		{
			inaConstant = 772;
		}
		else if (ffConstant === oFF.HierarchyLevelType.TIME_MINUTE)
		{
			inaConstant = 1028;
		}
		else if (ffConstant === oFF.HierarchyLevelType.TIME_SECOND)
		{
			inaConstant = 2052;
		}
		else
		{
			inaConstant = 0;
		}
		return inaConstant;
	},
	lookupHierarchyLevelType:function(inaConstant)
	{
			switch (inaConstant)
		{
			case 1:
				return oFF.HierarchyLevelType.ALL;

			case 20:
				return oFF.HierarchyLevelType.TIME_YEAR;

			case 36:
				return oFF.HierarchyLevelType.TIME_HALF_YEAR;

			case 68:
				return oFF.HierarchyLevelType.TIME_QUARTER;

			case 132:
				return oFF.HierarchyLevelType.TIME_MONTH;

			case 260:
				return oFF.HierarchyLevelType.TIME_WEEK;

			case 516:
				return oFF.HierarchyLevelType.TIME_DAY;

			case 772:
				return oFF.HierarchyLevelType.TIME_HOUR;

			case 1028:
				return oFF.HierarchyLevelType.TIME_MINUTE;

			case 2052:
				return oFF.HierarchyLevelType.TIME_SECOND;

			default:
				return oFF.HierarchyLevelType.REGULAR;
		}
	},
	lookupException:function(inaConstant)
	{
			return oFF.QInAConverter.lookupValidOrDefault(inaConstant, 10, oFF.ValueException.ERROR, oFF.QInAConverter.s_lookupValueException);
	},
	lookupSingleValueCalculation:function(inaConstant)
	{
			return oFF.QInAConverter.s_lookupSingleValueCalculation.getByKey(inaConstant);
	},
	lookupResultCalculation:function(inaConstant)
	{
			return oFF.QInAConverter.s_lookupResultCalculation.getByKey(inaConstant);
	},
	lookupMemberType:function(inaConstant)
	{
			switch (inaConstant)
		{
			case 1:
				return oFF.MemberType.RESULT;

			case 2:
				return oFF.MemberType.CONDITION_RESULT;

			case 3:
				return oFF.MemberType.CONDITION_OTHERS_RESULT;

			default:
				return oFF.MemberType.MEMBER;
		}
	},
	lookupMeasureStructureMemberType:function(inaConstant)
	{
			if (oFF.isNull(inaConstant))
		{
			return null;
		}
		switch (inaConstant)
		{
			case "Measure":
				return oFF.MemberType.MEASURE;

			case "SelectionMeasure":
				return oFF.MemberType.RESTRICTED_MEASURE;

			case "FormulaMeasure":
				return oFF.MemberType.FORMULA;

			case "VarianceMeasure":
				return oFF.MemberType.VARIANCE;

			case "ExceptionAggregationMeasure":
				return oFF.MemberType.EXCEPTION_AGGREGATION;

			case "CurrencyMeasure":
				return oFF.MemberType.CURRENCY_MEASURE;

			case "RunningTotal":
				return oFF.MemberType.RUNNING_TOTAL;

			default:
				return null;
		}
	},
	lookupValueTypeByInt:function(inaConstant)
	{
			return oFF.QInAConverter.lookupValidOrDefault(inaConstant, 14, oFF.XValueType.DOUBLE, oFF.QInAConverter.s_lookupCellValueType);
	},
	lookupIntByValueType:function(ffConstant)
	{
			var inaEncoded = oFF.QInAConverter.indexOf(oFF.QInAConverter.s_lookupCellValueType, ffConstant);
		return inaEncoded === -1 ? 0 : inaEncoded;
	},
	lookupValueTypeInA:function(ffConstant)
	{
			return oFF.QInAConverter.lookupInAString(oFF.QInAConverter.s_lookupValueTypeIna, ffConstant);
	},
	lookupValueType:function(inaConstant)
	{
			return oFF.QInAConverter.lookupConstantWithDefault(oFF.QInAConverter.s_lookupValueType, inaConstant, oFF.XValueType.UNSUPPORTED);
	},
	lookupAlignment:function(inaConstant)
	{
			if (oFF.isNull(inaConstant))
		{
			return oFF.ResultAlignment.NONE;
		}
		else
		{
			switch (inaConstant)
			{
				case "Top":
					return oFF.ResultAlignment.TOP;

				case "Bottom":
					return oFF.ResultAlignment.BOTTOM;

				case "TopBottom":
					return oFF.ResultAlignment.TOPBOTTOM;

				case "Structure":
					return oFF.ResultAlignment.STRUCTURE;

				default:
					return oFF.ResultAlignment.NONE;
			}
		}
	},
	lookupAlignmentInA:function(ffConstant)
	{
			var inaConstant = "None";
		if (ffConstant === oFF.ResultAlignment.TOP)
		{
			inaConstant = "Top";
		}
		else if (ffConstant === oFF.ResultAlignment.BOTTOM)
		{
			inaConstant = "Bottom";
		}
		else if (ffConstant === oFF.ResultAlignment.TOPBOTTOM)
		{
			inaConstant = "TopBottom";
		}
		else if (ffConstant === oFF.ResultAlignment.STRUCTURE)
		{
			inaConstant = "Structure";
		}
		return inaConstant;
	},
	lookupReordering:function(inaConstant)
	{
			if (oFF.isNull(inaConstant))
		{
			return oFF.ReorderingCapability.NONE;
		}
		else
		{
			switch (inaConstant)
			{
				case "Full":
					return oFF.ReorderingCapability.FULL;

				case "Restricted":
					return oFF.ReorderingCapability.RESTRICTED;

				default:
					return oFF.ReorderingCapability.NONE;
			}
		}
	},
	lookupReorderingInA:function(ffConstant)
	{
			var inaConstant = "None";
		if (ffConstant === oFF.ReorderingCapability.FULL)
		{
			inaConstant = "Full";
		}
		else if (ffConstant === oFF.ReorderingCapability.RESTRICTED)
		{
			inaConstant = "Restricted";
		}
		return inaConstant;
	},
	lookupAxisType:function(inaConstant)
	{
			return oFF.QInAConverter.lookupConstantWithDefault(oFF.QInAConverter.s_lookupAxisType, inaConstant, oFF.AxisType.FREE);
	},
	lookupAxisTypeInA:function(ffConstant)
	{
			return oFF.QInAConverter.lookupInAString(oFF.QInAConverter.s_lookupAxisTypeIna, ffConstant);
	},
	lookupAxisTypeInt:function(inaConstant)
	{
			switch (inaConstant)
		{
			case 1:
				return oFF.AxisType.ROWS;

			case 2:
				return oFF.AxisType.COLUMNS;

			default:
				return oFF.AxisType.FREE;
		}
	},
	lookupAxisTypeInAInt:function(ffConstant)
	{
			var inaConstant = 0;
		if (ffConstant === oFF.AxisType.ROWS)
		{
			inaConstant = 1;
		}
		else if (ffConstant === oFF.AxisType.COLUMNS)
		{
			inaConstant = 2;
		}
		else if (ffConstant === oFF.AxisType.FREE)
		{
			inaConstant = 3;
		}
		return inaConstant;
	},
	lookupSuppressionType:function(inaConstant)
	{
			switch (inaConstant)
		{
			case 1:
				return oFF.ZeroSuppressionType.TOTAL_IS_ZERO;

			case 2:
				return oFF.ZeroSuppressionType.ALL_CELLS_ARE_ZERO;

			case 3:
				return oFF.ZeroSuppressionType.ALL_CELLS_ARE_NULL;

			default:
				return oFF.ZeroSuppressionType.NONE;
		}
	},
	lookupSuppressionTypeInA:function(ffConstant)
	{
			var inaConstant = 0;
		if (ffConstant === oFF.ZeroSuppressionType.TOTAL_IS_ZERO)
		{
			inaConstant = 1;
		}
		else if (ffConstant === oFF.ZeroSuppressionType.ALL_CELLS_ARE_ZERO)
		{
			inaConstant = 2;
		}
		else if (ffConstant === oFF.ZeroSuppressionType.ALL_CELLS_ARE_NULL)
		{
			inaConstant = 3;
		}
		return inaConstant;
	},
	lookupFieldLayoutType:function(inaConstant)
	{
			if (oFF.isNull(inaConstant))
		{
			return oFF.FieldLayoutType.FIELD_BASED;
		}
		else
		{
			switch (inaConstant)
			{
				case "AttributeBased":
					return oFF.FieldLayoutType.ATTRIBUTE_BASED;

				case "AttributesAndPresentations":
					return oFF.FieldLayoutType.ATTRIBUTES_AND_PRESENTATIONS;

				default:
					return oFF.FieldLayoutType.FIELD_BASED;
			}
		}
	},
	lookupFieldLayoutTypeInA:function(ffConstant)
	{
			var inaConstant = "FieldBased";
		if (ffConstant === oFF.FieldLayoutType.ATTRIBUTE_BASED)
		{
			inaConstant = "AttributeBased";
		}
		else if (ffConstant === oFF.FieldLayoutType.ATTRIBUTES_AND_PRESENTATIONS)
		{
			inaConstant = "AttributesAndPresentations";
		}
		return inaConstant;
	},
	lookupLowerLevelNodeAlignment:function(inaConstant)
	{
			if (oFF.isNull(inaConstant))
		{
			return oFF.Alignment.DEFAULT_VALUE;
		}
		else
		{
			switch (inaConstant)
			{
				case "Above":
					return oFF.Alignment.CHILDREN_ABOVE_PARENT;

				case "Below":
					return oFF.Alignment.CHILDREN_BELOW_PARENT;

				case "InheritFromFirstDimensionOnAxis":
					return oFF.Alignment.INHERIT_FROM_FIRST_DIMENSION_ON_AXIS;

				default:
					return oFF.Alignment.DEFAULT_VALUE;
			}
		}
	},
	lookupLowerLevelNodeAlignmentInA:function(ffConstant)
	{
			var inaConstant = "Default";
		if (ffConstant === oFF.Alignment.CHILDREN_ABOVE_PARENT)
		{
			inaConstant = "Above";
		}
		else if (ffConstant === oFF.Alignment.CHILDREN_BELOW_PARENT)
		{
			inaConstant = "Below";
		}
		else if (ffConstant === oFF.Alignment.INHERIT_FROM_FIRST_DIMENSION_ON_AXIS)
		{
			inaConstant = "InheritFromFirstDimensionOnAxis";
		}
		return inaConstant;
	},
	lookupLowerLevelNodeAlignmentInA2:function(ffConstant)
	{
			var inaConstant = "Default";
		if (ffConstant === oFF.Alignment.CHILDREN_ABOVE_PARENT)
		{
			inaConstant = "Below";
		}
		else if (ffConstant === oFF.Alignment.CHILDREN_BELOW_PARENT)
		{
			inaConstant = "Above";
		}
		return inaConstant;
	},
	lookupResultSetVisibility:function(inaConstant)
	{
			if (oFF.isNull(inaConstant))
		{
			return oFF.ResultVisibility.HIDDEN;
		}
		else
		{
			switch (inaConstant)
			{
				case "Visible":
					return oFF.ResultVisibility.VISIBLE;

				case "Conditional":
					return oFF.ResultVisibility.CONDITIONAL;

				case "Always":
					return oFF.ResultVisibility.ALWAYS;

				case "HiddenDescSelfAfter":
					return oFF.ResultVisibility.HIDDEN_DESCENDANTS_SELF_AFTER;

				default:
					return oFF.ResultVisibility.HIDDEN;
			}
		}
	},
	lookupResultSetVisibilityInA:function(ffConstant)
	{
			var inaConstant = "Hidden";
		if (ffConstant === oFF.ResultVisibility.VISIBLE)
		{
			inaConstant = "Visible";
		}
		else if (ffConstant === oFF.ResultVisibility.CONDITIONAL)
		{
			inaConstant = "Conditional";
		}
		else if (ffConstant === oFF.ResultVisibility.ALWAYS)
		{
			inaConstant = "Always";
		}
		else if (ffConstant === oFF.ResultVisibility.HIDDEN_DESCENDANTS_SELF_AFTER)
		{
			inaConstant = "HiddenDescSelfAfter";
		}
		return inaConstant;
	},
	lookupAlertLevel:function(inaConstant)
	{
			return oFF.QInAConverter.lookupValidOrDefault(inaConstant, 9, null, oFF.QInAConverter.s_lookupAlertLevelInt);
	},
	lookupOperatorInA:function(ffConstant)
	{
			var inaConstant = null;
		if (oFF.notNull(ffConstant))
		{
			inaConstant = ffConstant === oFF.ComparisonOperator.EQUAL ? "=" : ffConstant.getDisplayString();
		}
		return inaConstant;
	},
	lookupSortType:function(inaConstant)
	{
			return oFF.QInAConverter.s_lookupSortType.getByKey(inaConstant);
	},
	lookupSortTypeInA:function(ffConstant)
	{
			return oFF.QInAConverter.lookupInAString(oFF.QInAConverter.s_lookupSortTypeIna, ffConstant);
	},
	lookupMemberNavigationTypeInA:function(ffConstant)
	{
			return oFF.QInAConverter.lookupInAString(oFF.QInAConverter.s_lookupMemberNavigationTypeIna, ffConstant);
	},
	lookupConfigLevel:function(inaConstant)
	{
			if (oFF.isNull(inaConstant))
		{
			return oFF.QModelLevel.NONE;
		}
		else
		{
			switch (inaConstant)
			{
				case "Query":
					return oFF.QModelLevel.QUERY;

				case "Axis":
					return oFF.QModelLevel.AXES;

				case "Dimension":
					return oFF.QModelLevel.DIMENSIONS;

				default:
					return oFF.QModelLevel.NONE;
			}
		}
	},
	lookupConfigLevelInA:function(ffConstant)
	{
			var inaConstant = "None";
		if (ffConstant === oFF.QModelLevel.QUERY)
		{
			inaConstant = "Query";
		}
		else if (ffConstant === oFF.QModelLevel.AXES)
		{
			inaConstant = "Axis";
		}
		else if (ffConstant === oFF.QModelLevel.DIMENSIONS)
		{
			inaConstant = "Dimension";
		}
		return inaConstant;
	},
	lookupRsSetSign:function(inaConstant)
	{
			if (oFF.isNull(inaConstant))
		{
			return null;
		}
		switch (inaConstant)
		{
			case "I":
				return oFF.SetSign.INCLUDING;

			case "E":
				return oFF.SetSign.EXCLUDING;
		}
		return null;
	},
	lookupComparisonGroup:function(inaConstant)
	{
			if (oFF.isNull(inaConstant))
		{
			return null;
		}
		switch (inaConstant)
		{
			case "SingleValue":
				return oFF.QSetSignComparisonOperatorGroup.SINGLE_VALUE;

			case "Interval":
				return oFF.QSetSignComparisonOperatorGroup.INTERVAL;

			case "Range":
				return oFF.QSetSignComparisonOperatorGroup.RANGE;

			default:
				return null;
		}
	},
	lookupComparisonGroupInA:function(ffConstant)
	{
			var inaConstant = null;
		if (oFF.notNull(ffConstant))
		{
			if (ffConstant.isTypeOf(oFF.QSetSignComparisonOperatorGroup.INTERVAL))
			{
				inaConstant = "Interval";
			}
			else if (ffConstant.isTypeOf(oFF.QSetSignComparisonOperatorGroup.RANGE))
			{
				inaConstant = "Range";
			}
			else if (ffConstant.isTypeOf(oFF.QSetSignComparisonOperatorGroup.SINGLE_VALUE))
			{
				inaConstant = "SingleValue";
			}
		}
		return inaConstant;
	},
	switchComparisonGroupToIncludeOnly:function(ffConstant)
	{
			if (ffConstant === oFF.QSetSignComparisonOperatorGroup.INTERVAL)
		{
			return oFF.QSetSignComparisonOperatorGroup.INTERVAL_INCLUDE_ONLY;
		}
		else if (ffConstant === oFF.QSetSignComparisonOperatorGroup.RANGE)
		{
			return oFF.QSetSignComparisonOperatorGroup.RANGE_INCLUDE_ONLY;
		}
		else if (ffConstant === oFF.QSetSignComparisonOperatorGroup.SINGLE_VALUE)
		{
			return oFF.QSetSignComparisonOperatorGroup.SINGLE_VALUE_INCLUDE_ONLY;
		}
		else
		{
			return ffConstant;
		}
	},
	lookupComponentTypeInA:function(ffConstant)
	{
			return oFF.QInAConverter.lookupInAString(oFF.QInAConverter.s_lookupComponentTypeIna, ffConstant);
	},
	lookupComponentType:function(inaConstant)
	{
			return oFF.QInAConverter.s_lookupComponentType.getByKey(inaConstant);
	},
	lookupResultStructureElementInA:function(ffConstant)
	{
			var inaConstant = null;
		if (ffConstant === oFF.ResultStructureElement.MEMBERS)
		{
			inaConstant = "Members";
		}
		else if (ffConstant === oFF.ResultStructureElement.TOTAL)
		{
			inaConstant = "Total";
		}
		else if (ffConstant === oFF.ResultStructureElement.TOTAL_INCLUDED_MEMBERS)
		{
			inaConstant = "TotalIncludedMembers";
		}
		else if (ffConstant === oFF.ResultStructureElement.TOTAL_REMAINING_MEMBERS)
		{
			inaConstant = "TotalRemainingMembers";
		}
		return inaConstant;
	},
	lookupResultStructureElement:function(inaConstant)
	{
			if (oFF.isNull(inaConstant))
		{
			return null;
		}
		else
		{
			switch (inaConstant)
			{
				case "Members":
					return oFF.ResultStructureElement.MEMBERS;

				case "Total":
					return oFF.ResultStructureElement.TOTAL;

				case "TotalIncludedMembers":
					return oFF.ResultStructureElement.TOTAL_INCLUDED_MEMBERS;

				case "TotalRemainingMembers":
					return oFF.ResultStructureElement.TOTAL_REMAINING_MEMBERS;

				default:
					return null;
			}
		}
	},
	lookupTextTransformationInA:function(ffConstant)
	{
			return oFF.QInAConverter.lookupInAString(oFF.QInAConverter.s_textTransformationIna, ffConstant);
	},
	lookupTextTransformation:function(inaConstant)
	{
			return oFF.QInAConverter.s_textTransformation.getByKey(inaConstant);
	},
	lookupWindowFunctionTypeInA:function(ffConstant)
	{
			return oFF.QInAConverter.lookupInAString(oFF.QInAConverter.s_lookupWindowFunctionTypeIna, ffConstant);
	},
	lookupWindowFunctionType:function(inaConstant)
	{
			return oFF.QInAConverter.s_lookupWindowFunctionType.getByKey(inaConstant);
	},
	lookupUnitTypeInA:function(ffConstant)
	{
			return oFF.QInAConverter.lookupInAString(oFF.QInAConverter.s_lookupUnitTypeIna, ffConstant);
	},
	lookupUnitType:function(inaConstant)
	{
			return oFF.QInAConverter.s_lookupUnitType.getByKey(inaConstant);
	},
	lookupDocumentsIdsScopeInA:function(ffConstant)
	{
			return oFF.QInAConverter.lookupInAString(oFF.QInAConverter.s_lookupDocumentIdsScopeIna, ffConstant);
	},
	lookupDocumentsIdsScope:function(inaConstant)
	{
			return oFF.QInAConverter.s_lookupDocumentIdsScope.getByKey(inaConstant);
	},
	lookupDocumentsIdsActionInA:function(ffConstant)
	{
			return oFF.QInAConverter.lookupInAString(oFF.QInAConverter.s_lookupDocumentIdsActionIna, ffConstant);
	},
	lookupDocumentsIdsAction:function(inaConstant)
	{
			return oFF.QInAConverter.s_lookupDocumentIdsAction.getByKey(inaConstant);
	},
	lookupDocumentsSupportTypeInA:function(ffConstant)
	{
			return oFF.QInAConverter.lookupInAString(oFF.QInAConverter.s_lookupDocumentSupportTypeIna, ffConstant);
	},
	lookupDocumentsSupportType:function(inaConstant)
	{
			return oFF.QInAConverter.s_lookupDocumentSupportType.getByKey(inaConstant);
	},
	lookupNullsTypeInA:function(ffConstant)
	{
			var inaConstant = null;
		if (ffConstant === oFF.NullsType.FIRST)
		{
			inaConstant = "FIRST";
		}
		else if (ffConstant === oFF.NullsType.LAST)
		{
			inaConstant = "LAST";
		}
		return inaConstant;
	},
	lookupNullsType:function(inaConstant)
	{
			if (oFF.isNull(inaConstant))
		{
			return null;
		}
		else
		{
			switch (inaConstant)
			{
				case "FIRST":
					return oFF.NullsType.FIRST;

				case "LAST":
					return oFF.NullsType.LAST;

				default:
					return oFF.NullsType.NONE;
			}
		}
	},
	lookupFrameStartTypeInA:function(ffConstant)
	{
			var inaConstant = "UNBOUNDED PRECEDING";
		if (ffConstant === oFF.FrameStartType.CURRENT_ROW)
		{
			inaConstant = "CURRENT ROW";
		}
		else if (ffConstant === oFF.FrameStartType.PRECEDING)
		{
			inaConstant = "PRECEDING";
		}
		return inaConstant;
	},
	lookupFrameStartType:function(inaConstant)
	{
			if (oFF.isNull(inaConstant))
		{
			return oFF.FrameStartType.UNBOUNDED_PRECEDING;
		}
		else
		{
			switch (inaConstant)
			{
				case "CURRENT ROW":
					return oFF.FrameStartType.CURRENT_ROW;

				case "PRECEDING":
					return oFF.FrameStartType.PRECEDING;

				default:
					return oFF.FrameStartType.UNBOUNDED_PRECEDING;
			}
		}
	},
	lookupFrameEndTypeInA:function(ffConstant)
	{
			var inaConstant = "CURRENT ROW";
		if (ffConstant === oFF.FrameEndType.UNBOUNDED_FOLLOWING)
		{
			inaConstant = "UNBOUNDED FOLLOWING";
		}
		else if (ffConstant === oFF.FrameEndType.FOLLOWING)
		{
			inaConstant = "FOLLOWING";
		}
		return inaConstant;
	},
	lookupFrameEndType:function(inaFrameEndType)
	{
			if (oFF.isNull(inaFrameEndType))
		{
			return oFF.FrameEndType.CURRENT_ROW;
		}
		else
		{
			switch (inaFrameEndType)
			{
				case "UNBOUNDED FOLLOWING":
					return oFF.FrameEndType.UNBOUNDED_FOLLOWING;

				case "FOLLOWING":
					return oFF.FrameEndType.FOLLOWING;

				default:
					return oFF.FrameEndType.CURRENT_ROW;
			}
		}
	},
	lookupByEncodedValue:function(inaConstant)
	{
			switch (inaConstant)
		{
			case 2:
				return oFF.UnitType.UNIT;

			case 1:
				return oFF.UnitType.CURRENCY;

			case 0:
				return oFF.UnitType.NONE;

			case -1:
				return oFF.UnitType.MIXED;

			case -2:
				return oFF.UnitType.UNDEFINED;

			case -3:
				return oFF.UnitType.NULL_VALUE;

			default:
				return oFF.UnitType.CONVERSION_FAILED;
		}
	},
	lookupRateType:function(inaConstant)
	{
			return oFF.QInAConverter.s_lookupRateType.getByKey(inaConstant);
	},
	lookupRateTypeInA:function(ffConstant)
	{
			return oFF.QInAConverter.lookupInAString(oFF.QInAConverter.s_lookupRateTypeIna, ffConstant);
	},
	lookupCategory:function(inaConstant)
	{
			return oFF.QInAConverter.s_lookupCategory.getByKey(inaConstant);
	},
	lookupCategoryInA:function(ffConstant)
	{
			return oFF.QInAConverter.lookupInAString(oFF.QInAConverter.s_lookupCategoryIna, ffConstant);
	},
	lookupCtErrorHandlingMode:function(inaConstant)
	{
			return oFF.QInAConverter.s_lookupCtErrorHandlingMode.getByKey(inaConstant);
	},
	lookupCtErrorHandlingModeInA:function(ffConstant)
	{
			return oFF.QInAConverter.lookupInAString(oFF.QInAConverter.s_lookupCtErrorHandlingModeIna, ffConstant);
	},
	lookupProcessingType:function(inaConstant)
	{
			return oFF.QInAConverter.s_lookupProcessingType.getByKey(inaConstant);
	},
	lookupProcessingTypeIna:function(ffConstant)
	{
			return oFF.QInAConverter.lookupInAString(oFF.QInAConverter.s_lookupProcessingTypeIna, ffConstant);
	},
	lookupReturnedDataSelection:function(inaConstant)
	{
			return oFF.QInAConverter.s_lookupReturnedDataSelection.getByKey(inaConstant);
	},
	lookupReturnedDataSelectionInA:function(ffConstant)
	{
			return oFF.QInAConverter.lookupInAString(oFF.QInAConverter.s_lookupReturnedDataSelectionIna, ffConstant);
	},
	lookupCellChartOrientation:function(inaConstant)
	{
			return oFF.QInAConverter.s_lookupCellChartOrientation.getByKey(inaConstant);
	},
	lookupCellChartOrientationInA:function(ffConstant)
	{
			return oFF.QInAConverter.lookupInAString(oFF.QInAConverter.s_lookupCellChartOrientationIna, ffConstant);
	},
	lookupCellChartType:function(inaConstant)
	{
			return oFF.QInAConverter.s_lookupCellChartType.getByKey(inaConstant);
	},
	lookupCellChartTypeInA:function(ffConstant)
	{
			return oFF.QInAConverter.lookupInAString(oFF.QInAConverter.s_lookupCellChartTypeIna, ffConstant);
	},
	lookupProtocolBindingType:function(inaConstant)
	{
			return oFF.QInAConverter.s_lookupProtocolBindingType.getByKey(inaConstant);
	},
	lookupProtocolBindingTypeInA:function(ffConstant)
	{
			return oFF.QInAConverter.lookupInAString(oFF.QInAConverter.s_lookupProtocolBindingTypeIna, ffConstant);
	},
	lookupSemanticBindingType:function(inaConstant)
	{
			return oFF.QInAConverter.s_lookupSemanticBindingType.getByKey(inaConstant);
	},
	lookupSemanticBindingTypeInA:function(ffConstant)
	{
			return oFF.QInAConverter.lookupInAString(oFF.QInAConverter.s_lookupSemanticBindingTypeIna, ffConstant);
	},
	lookupRunningTotalOperator:function(inaConstant)
	{
			return oFF.QInAConverter.s_lookupRunningTotalOperator.getByKey(inaConstant);
	},
	lookupRunningTotalOperatorInA:function(ffConstant)
	{
			return oFF.QInAConverter.lookupInAString(oFF.QInAConverter.s_lookupRunningTotalOperatorIna, ffConstant);
	},
	lookupCurrencyPresentation:function(inaConstant)
	{
			return oFF.QInAConverter.s_lookupCurrencyPresentation.getByKey(inaConstant);
	},
	lookupCurrencyPresentationInA:function(ffConstant)
	{
			return oFF.QInAConverter.lookupInAString(oFF.QInAConverter.s_lookupCurrencyPresentationIna, ffConstant);
	},
	lookupScaleAndUnitPlacement:function(inaConstant)
	{
			return oFF.QInAConverter.s_lookupScaleAndUnitPlacement.getByKey(inaConstant);
	},
	lookupScaleAndUnitPlacementInA:function(ffConstant)
	{
			return oFF.QInAConverter.lookupInAString(oFF.QInAConverter.s_lookupScaleAndUnitPlacementIna, ffConstant);
	},
	lookupDateRangeGranularity:function(inaConstant)
	{
			return oFF.QInAConverter.s_lookupDateRangeGranularity.getByKey(inaConstant);
	},
	lookupDateRangeGranularityInA:function(ffConstant)
	{
			return oFF.QInAConverter.lookupInAString(oFF.QInAConverter.s_lookupDateRangeGranularityIna, ffConstant);
	},
	lookupScaleFormat:function(inaConstant)
	{
			return oFF.QInAConverter.s_lookupScaleFormat.getByKey(inaConstant);
	},
	lookupScaleFormatInA:function(ffConstant)
	{
			return oFF.QInAConverter.lookupInAString(oFF.QInAConverter.s_lookupScaleFormatIna, ffConstant);
	},
	lookupSignPresentation:function(inaConstant)
	{
			return oFF.QInAConverter.s_lookupSignPresentation.getByKey(inaConstant);
	},
	lookupSignPresentationInA:function(ffConstant)
	{
			return oFF.QInAConverter.lookupInAString(oFF.QInAConverter.s_lookupSignPresentationIna, ffConstant);
	}
};

oFF.QRriTarget = function() {};
oFF.QRriTarget.prototype = new oFF.XObject();
oFF.QRriTarget.prototype._ff_c = "QRriTarget";

oFF.QRriTarget.create = function()
{
	var target = new oFF.QRriTarget();
	target.m_parameters = oFF.XHashMapOfStringByString.create();
	target.m_customProperties = oFF.XHashMapOfStringByString.create();
	return target;
};
oFF.QRriTarget.prototype.m_parameters = null;
oFF.QRriTarget.prototype.m_customProperties = null;
oFF.QRriTarget.prototype.releaseObject = function()
{
	this.m_parameters = oFF.XObjectExt.release(this.m_parameters);
	this.m_customProperties = oFF.XObjectExt.release(this.m_customProperties);
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.QRriTarget.prototype.getParameters = function()
{
	return this.m_parameters;
};
oFF.QRriTarget.prototype.getCustomProperties = function()
{
	return this.m_customProperties;
};
oFF.QRriTarget.prototype.getDataSource = function()
{
	var receiverApplicationType = this.m_parameters.getByKey("ReceiverApplicationType");
	if (!oFF.XString.isEqual(receiverApplicationType, "QURY"))
	{
		return null;
	}
	var query = this.m_customProperties.getByKey("QUERY");
	if (oFF.XStringUtils.isNullOrEmpty(query))
	{
		return null;
	}
	var rriName = this.m_customProperties.getByKey("RRI_PARAMETER_NAME");
	if (oFF.XStringUtils.isNullOrEmpty(rriName))
	{
		return null;
	}
	var rriValue = this.m_customProperties.getByKey("RRI_PARAMETER_VALUE");
	if (oFF.XStringUtils.isNullOrEmpty(rriValue))
	{
		return null;
	}
	var dataSource = oFF.QFactory.createDataSourceWithType(oFF.MetaObjectType.QUERY, query);
	dataSource.setRriName(rriName);
	dataSource.setRriValue(rriValue);
	return dataSource;
};
oFF.QRriTarget.prototype.canBeExecutedLocally = function()
{
	if (this.m_parameters.containsKey("LogicalDestination"))
	{
		var logicalDestination = this.m_parameters.getByKey("LogicalDestination");
		if (oFF.XStringUtils.isNullOrEmpty(logicalDestination))
		{
			return true;
		}
		return oFF.XString.isEqual(logicalDestination, "*");
	}
	return false;
};

oFF.QRriTargetCallbackIdentifier = function() {};
oFF.QRriTargetCallbackIdentifier.prototype = new oFF.XObject();
oFF.QRriTargetCallbackIdentifier.prototype._ff_c = "QRriTargetCallbackIdentifier";

oFF.QRriTargetCallbackIdentifier.create = function(manager, row, column, listener, customIdentifier)
{
	var newObj = new oFF.QRriTargetCallbackIdentifier();
	newObj.m_manager = manager;
	newObj.m_row = row;
	newObj.m_column = column;
	newObj.m_listener = listener;
	newObj.m_customIdentifier = customIdentifier;
	return newObj;
};
oFF.QRriTargetCallbackIdentifier.prototype.m_manager = null;
oFF.QRriTargetCallbackIdentifier.prototype.m_row = 0;
oFF.QRriTargetCallbackIdentifier.prototype.m_column = 0;
oFF.QRriTargetCallbackIdentifier.prototype.m_listener = null;
oFF.QRriTargetCallbackIdentifier.prototype.m_customIdentifier = null;
oFF.QRriTargetCallbackIdentifier.prototype.getManager = function()
{
	return this.m_manager;
};
oFF.QRriTargetCallbackIdentifier.prototype.getRow = function()
{
	return this.m_row;
};
oFF.QRriTargetCallbackIdentifier.prototype.getColumn = function()
{
	return this.m_column;
};
oFF.QRriTargetCallbackIdentifier.prototype.getListener = function()
{
	return this.m_listener;
};
oFF.QRriTargetCallbackIdentifier.prototype.getCustomIdentifier = function()
{
	return this.m_customIdentifier;
};

oFF.QRriTargetManager = function() {};
oFF.QRriTargetManager.prototype = new oFF.XObject();
oFF.QRriTargetManager.prototype._ff_c = "QRriTargetManager";

oFF.QRriTargetManager.create = function(queryManager)
{
	var rriTargetManager = new oFF.QRriTargetManager();
	rriTargetManager.setupInstance(queryManager);
	return rriTargetManager;
};
oFF.QRriTargetManager.prototype.m_resultSetRow = 0;
oFF.QRriTargetManager.prototype.m_resultSetColumn = 0;
oFF.QRriTargetManager.prototype.m_queryManager = null;
oFF.QRriTargetManager.prototype.m_extResult = null;
oFF.QRriTargetManager.prototype.setupInstance = function(queryManager)
{
	this.m_queryManager = oFF.XWeakReferenceUtil.getWeakRef(queryManager);
};
oFF.QRriTargetManager.prototype.releaseObject = function()
{
	this.m_queryManager = oFF.XObjectExt.release(this.m_queryManager);
	this.m_extResult = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.QRriTargetManager.prototype.setResult = function(extResult, identifier)
{
	this.m_extResult = extResult;
	if (identifier.getListener() !== null)
	{
		var rriTargets = null;
		if (extResult.isValid())
		{
			rriTargets = extResult.getData();
		}
		identifier.getListener().onRriTargetResolution(extResult, rriTargets, identifier.getCustomIdentifier());
	}
};
oFF.QRriTargetManager.prototype.setResultSetContext = function(resultSetRow, resultSetColumn)
{
	this.m_resultSetRow = resultSetRow;
	this.m_resultSetColumn = resultSetColumn;
};
oFF.QRriTargetManager.prototype.getResultSetRow = function()
{
	return this.m_resultSetRow;
};
oFF.QRriTargetManager.prototype.getResultSetColumn = function()
{
	return this.m_resultSetColumn;
};
oFF.QRriTargetManager.prototype.processRriTargetResolution = function(syncType, listener, customIdentifier)
{
	var identifier = oFF.QRriTargetCallbackIdentifier.create(this, this.m_resultSetRow, this.m_resultSetColumn, listener, customIdentifier);
	this.m_extResult = null;
	var queryManager = oFF.XWeakReferenceUtil.getHardRef(this.m_queryManager);
	queryManager.processRriTargetSync(syncType, identifier);
	var result = this.m_extResult;
	this.m_extResult = null;
	return result;
};

oFF.ClusteringDbScan = function() {};
oFF.ClusteringDbScan.prototype = new oFF.AbstractSpatialClustering();
oFF.ClusteringDbScan.prototype._ff_c = "ClusteringDbScan";

oFF.ClusteringDbScan.create = function(spatialClusterContext)
{
	var dbScan = new oFF.ClusteringDbScan();
	dbScan.setupDbScan(spatialClusterContext);
	return dbScan;
};
oFF.ClusteringDbScan.prototype.m_eps = null;
oFF.ClusteringDbScan.prototype.m_minPoints = null;
oFF.ClusteringDbScan.prototype.setupDbScan = function(spatialClusterContext)
{
	oFF.AbstractSpatialClustering.prototype.setupSpatialClustering.call( this , spatialClusterContext);
	this.m_eps = oFF.XDoubleValue.create(0);
	this.m_minPoints = oFF.XIntegerValue.create(0);
	this.m_parameters.put("EPS", this.m_eps);
	this.m_parameters.put("MinPoints", this.m_minPoints);
};
oFF.ClusteringDbScan.prototype.cloneExt = function(flags)
{
	var clone = oFF.ClusteringDbScan.create(null);
	this.cloneClustering(clone);
	clone.setEps(this.getEps());
	clone.setMinPoints(this.getMinPoints());
	return clone;
};
oFF.ClusteringDbScan.prototype.releaseObject = function()
{
	this.m_eps = oFF.XObjectExt.release(this.m_eps);
	this.m_minPoints = oFF.XObjectExt.release(this.m_minPoints);
	oFF.AbstractSpatialClustering.prototype.releaseObject.call( this );
};
oFF.ClusteringDbScan.prototype.getEps = function()
{
	return this.m_eps.getDouble();
};
oFF.ClusteringDbScan.prototype.setEps = function(eps)
{
	this.m_eps.setDouble(eps);
};
oFF.ClusteringDbScan.prototype.getMinPoints = function()
{
	return this.m_minPoints.getInteger();
};
oFF.ClusteringDbScan.prototype.setMinPoints = function(minPoints)
{
	this.m_minPoints.setInteger(minPoints);
};
oFF.ClusteringDbScan.prototype.getClusterAlgorithm = function()
{
	return oFF.ClusterAlgorithm.DB_SCAN;
};

oFF.ClusteringGrid = function() {};
oFF.ClusteringGrid.prototype = new oFF.AbstractSpatialClustering();
oFF.ClusteringGrid.prototype._ff_c = "ClusteringGrid";

oFF.ClusteringGrid.create = function(spatialClusterContext)
{
	var grid = new oFF.ClusteringGrid();
	grid.setupGrid(spatialClusterContext);
	return grid;
};
oFF.ClusteringGrid.prototype.m_lowerBoundX = null;
oFF.ClusteringGrid.prototype.m_upperBoundX = null;
oFF.ClusteringGrid.prototype.m_lowerBoundY = null;
oFF.ClusteringGrid.prototype.m_upperBoundY = null;
oFF.ClusteringGrid.prototype.m_cellsX = null;
oFF.ClusteringGrid.prototype.m_cellsY = null;
oFF.ClusteringGrid.prototype.setupGrid = function(spatialClusterContext)
{
	oFF.AbstractSpatialClustering.prototype.setupSpatialClustering.call( this , spatialClusterContext);
	this.m_cellsX = oFF.XIntegerValue.create(0);
	this.m_cellsY = oFF.XIntegerValue.create(0);
	this.m_parameters.put("XCells", this.m_cellsX);
	this.m_parameters.put("YCells", this.m_cellsY);
};
oFF.ClusteringGrid.prototype.cloneExt = function(flags)
{
	var clone = oFF.ClusteringGrid.create(null);
	this.cloneClustering(clone);
	clone.setCellsX(this.getCellsX());
	clone.setCellsY(this.getCellsY());
	if (oFF.notNull(this.m_lowerBoundX))
	{
		clone.setLowerBoundX(this.getLowerBoundX());
	}
	if (oFF.notNull(this.m_upperBoundX))
	{
		clone.setUpperBoundX(this.getUpperBoundX());
	}
	if (oFF.notNull(this.m_lowerBoundY))
	{
		clone.setLowerBoundY(this.getLowerBoundY());
	}
	if (oFF.notNull(this.m_upperBoundY))
	{
		clone.setUpperBoundY(this.getUpperBoundY());
	}
	return clone;
};
oFF.ClusteringGrid.prototype.releaseObject = function()
{
	this.m_lowerBoundX = oFF.XObjectExt.release(this.m_lowerBoundX);
	this.m_upperBoundX = oFF.XObjectExt.release(this.m_upperBoundX);
	this.m_lowerBoundY = oFF.XObjectExt.release(this.m_lowerBoundY);
	this.m_upperBoundY = oFF.XObjectExt.release(this.m_upperBoundY);
	this.m_cellsX = oFF.XObjectExt.release(this.m_cellsX);
	this.m_cellsY = oFF.XObjectExt.release(this.m_cellsY);
	oFF.AbstractSpatialClustering.prototype.releaseObject.call( this );
};
oFF.ClusteringGrid.prototype.getLowerBoundX = function()
{
	return oFF.isNull(this.m_lowerBoundX) ? 0 : this.m_lowerBoundX.getDouble();
};
oFF.ClusteringGrid.prototype.setLowerBoundX = function(lowerBoundX)
{
	if (oFF.isNull(this.m_lowerBoundX))
	{
		this.m_lowerBoundX = oFF.XDoubleValue.create(lowerBoundX);
		this.m_parameters.put("XLowerBound", this.m_lowerBoundX);
	}
	else
	{
		this.m_lowerBoundX.setDouble(lowerBoundX);
	}
};
oFF.ClusteringGrid.prototype.getLowerBoundY = function()
{
	return oFF.isNull(this.m_lowerBoundY) ? 0 : this.m_lowerBoundY.getDouble();
};
oFF.ClusteringGrid.prototype.setLowerBoundY = function(lowerBoundY)
{
	if (oFF.isNull(this.m_lowerBoundY))
	{
		this.m_lowerBoundY = oFF.XDoubleValue.create(lowerBoundY);
		this.m_parameters.put("YLowerBound", this.m_lowerBoundY);
	}
	else
	{
		this.m_lowerBoundY.setDouble(lowerBoundY);
	}
};
oFF.ClusteringGrid.prototype.getUpperBoundX = function()
{
	return oFF.isNull(this.m_upperBoundX) ? 0 : this.m_upperBoundX.getDouble();
};
oFF.ClusteringGrid.prototype.setUpperBoundX = function(upperBoundX)
{
	if (oFF.isNull(this.m_upperBoundX))
	{
		this.m_upperBoundX = oFF.XDoubleValue.create(upperBoundX);
		this.m_parameters.put("XUpperBound", this.m_upperBoundX);
	}
	else
	{
		this.m_upperBoundX.setDouble(upperBoundX);
	}
};
oFF.ClusteringGrid.prototype.getUpperBoundY = function()
{
	return oFF.isNull(this.m_upperBoundY) ? 0 : this.m_upperBoundY.getDouble();
};
oFF.ClusteringGrid.prototype.setUpperBoundY = function(upperBoundY)
{
	if (oFF.isNull(this.m_upperBoundY))
	{
		this.m_upperBoundY = oFF.XDoubleValue.create(upperBoundY);
		this.m_parameters.put("YUpperBound", this.m_upperBoundY);
	}
	else
	{
		this.m_upperBoundY.setDouble(upperBoundY);
	}
};
oFF.ClusteringGrid.prototype.getCellsX = function()
{
	return this.m_cellsX.getInteger();
};
oFF.ClusteringGrid.prototype.setCellsX = function(cellsX)
{
	this.m_cellsX.setInteger(cellsX);
};
oFF.ClusteringGrid.prototype.getCellsY = function()
{
	return this.m_cellsY.getInteger();
};
oFF.ClusteringGrid.prototype.setCellsY = function(cellsY)
{
	this.m_cellsY.setInteger(cellsY);
};
oFF.ClusteringGrid.prototype.getClusterAlgorithm = function()
{
	return oFF.ClusterAlgorithm.GRID;
};

oFF.ClusteringKmeans = function() {};
oFF.ClusteringKmeans.prototype = new oFF.AbstractSpatialClustering();
oFF.ClusteringKmeans.prototype._ff_c = "ClusteringKmeans";

oFF.ClusteringKmeans.create = function(spatialClusterContext)
{
	var kMeans = new oFF.ClusteringKmeans();
	kMeans.setupKMeans(spatialClusterContext);
	return kMeans;
};
oFF.ClusteringKmeans.prototype.m_clusters = null;
oFF.ClusteringKmeans.prototype.m_maxIterations = null;
oFF.ClusteringKmeans.prototype.m_threshold = null;
oFF.ClusteringKmeans.prototype.m_init = null;
oFF.ClusteringKmeans.prototype.setupKMeans = function(spatialClusterContext)
{
	this.setupSpatialClustering(spatialClusterContext);
	this.m_clusters = oFF.XIntegerValue.create(0);
	this.m_parameters.put("Clusters", this.m_clusters);
};
oFF.ClusteringKmeans.prototype.cloneExt = function(flags)
{
	var clone = oFF.ClusteringKmeans.create(null);
	this.cloneClustering(clone);
	clone.setClusters(this.getClusters());
	if (oFF.notNull(this.m_init))
	{
		clone.setInit(this.getInit());
	}
	if (oFF.notNull(this.m_maxIterations))
	{
		clone.setMaxIterations(this.getMaxIterations());
	}
	if (oFF.notNull(this.m_threshold))
	{
		clone.setThreshold(this.getThreshold());
	}
	return clone;
};
oFF.ClusteringKmeans.prototype.releaseObject = function()
{
	this.m_init = oFF.XObjectExt.release(this.m_init);
	this.m_clusters = oFF.XObjectExt.release(this.m_clusters);
	this.m_maxIterations = oFF.XObjectExt.release(this.m_maxIterations);
	this.m_threshold = oFF.XObjectExt.release(this.m_threshold);
	oFF.AbstractSpatialClustering.prototype.releaseObject.call( this );
};
oFF.ClusteringKmeans.prototype.getClusters = function()
{
	return this.m_clusters.getInteger();
};
oFF.ClusteringKmeans.prototype.setClusters = function(clusters)
{
	this.m_clusters.setInteger(clusters);
};
oFF.ClusteringKmeans.prototype.getMaxIterations = function()
{
	return oFF.isNull(this.m_maxIterations) ? 0 : this.m_maxIterations.getInteger();
};
oFF.ClusteringKmeans.prototype.setMaxIterations = function(maxIterations)
{
	if (oFF.isNull(this.m_maxIterations))
	{
		this.m_maxIterations = oFF.XIntegerValue.create(maxIterations);
		this.m_parameters.put("MaxIterations", this.m_maxIterations);
	}
	else
	{
		this.m_maxIterations.setInteger(maxIterations);
	}
};
oFF.ClusteringKmeans.prototype.getThreshold = function()
{
	return oFF.isNull(this.m_threshold) ? 0 : this.m_threshold.getDouble();
};
oFF.ClusteringKmeans.prototype.setThreshold = function(threshold)
{
	if (oFF.isNull(this.m_threshold))
	{
		this.m_threshold = oFF.XDoubleValue.create(threshold);
		this.m_parameters.put("Threshold", this.m_threshold);
	}
	else
	{
		this.m_threshold.setDouble(threshold);
	}
};
oFF.ClusteringKmeans.prototype.getInit = function()
{
	return oFF.isNull(this.m_init) ? null : this.m_init.getString();
};
oFF.ClusteringKmeans.prototype.setInit = function(setValue)
{
	if (oFF.isNull(this.m_init))
	{
		this.m_init = oFF.XStringValue.create(setValue);
		this.m_parameters.put("Init", this.m_init);
	}
	else
	{
		this.m_init.setString(setValue);
	}
};
oFF.ClusteringKmeans.prototype.getClusterAlgorithm = function()
{
	return oFF.ClusterAlgorithm.K_MEANS;
};

oFF.CommentingFactoryImpl = function() {};
oFF.CommentingFactoryImpl.prototype = new oFF.XObject();
oFF.CommentingFactoryImpl.prototype._ff_c = "CommentingFactoryImpl";

oFF.CommentingFactoryImpl.create = function()
{
	return new oFF.CommentingFactoryImpl();
};
oFF.CommentingFactoryImpl.prototype.newCommentingThread = function(creator)
{
	return oFF.CommentingThread.create(creator);
};
oFF.CommentingFactoryImpl.prototype.newCommentingThreadFromStructure = function(structure)
{
	return oFF.CommentingThread.createFromStructure(structure);
};

oFF.CustomHierarchyRepository = function() {};
oFF.CustomHierarchyRepository.prototype = new oFF.XObject();
oFF.CustomHierarchyRepository.prototype._ff_c = "CustomHierarchyRepository";

oFF.CustomHierarchyRepository.create = function(application)
{
	var newObj = new oFF.CustomHierarchyRepository();
	newObj.m_application = oFF.XWeakReferenceUtil.getWeakRef(application);
	newObj.m_customHierarchies = oFF.XList.create();
	return newObj;
};
oFF.CustomHierarchyRepository.getHierarchyNamesFromExportedJson = function(customHierarchyDefinitions)
{
	var hierarchyNames = oFF.XListOfString.create();
	var hierarchies = oFF.XStringUtils.isNotNullAndNotEmpty(customHierarchyDefinitions) ? oFF.JsonParserFactory.createFromSafeString(customHierarchyDefinitions).asList() : oFF.PrFactory.createList();
	var importer = oFF.QInAImportFactory.createForRepository(null, null);
	for (var i = 0; i < hierarchies.size(); i++)
	{
		hierarchyNames.add(importer.importCustomHierarchyDefinition(hierarchies.getStructureAt(i)).getName());
	}
	oFF.XObjectExt.release(importer);
	return hierarchyNames;
};
oFF.CustomHierarchyRepository.prototype.m_application = null;
oFF.CustomHierarchyRepository.prototype.m_customHierarchies = null;
oFF.CustomHierarchyRepository.prototype.releaseObject = function()
{
	this.m_application = null;
	this.m_customHierarchies = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_customHierarchies);
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.CustomHierarchyRepository.prototype.getCustomHierarchyDefinitions = function()
{
	return this.m_customHierarchies;
};
oFF.CustomHierarchyRepository.prototype.getCustomHierarchyDefinitionByName = function(hierarchyName)
{
	for (var i = 0; i < this.m_customHierarchies.size(); i++)
	{
		var hierarchyDefinition = this.m_customHierarchies.get(i);
		if (oFF.XString.isEqual(hierarchyDefinition.getName(), hierarchyName))
		{
			return hierarchyDefinition;
		}
	}
	return null;
};
oFF.CustomHierarchyRepository.prototype.getCustomHierarchyCatalogItems = function(dimension, hierarchyNameFilter)
{
	return this.convertToHierarchyCatalogItems(this.getCustomHierarchyDefinitionsByDimension(dimension), hierarchyNameFilter);
};
oFF.CustomHierarchyRepository.prototype._getCustomHierarchyCatalogItemsByDimensionName = function(system, dataSource, dimension, hierarchyNameFilter)
{
	return this.convertToHierarchyCatalogItems(this.getCustomHierarchyDefinitionsByDimensionName(system, dataSource, dimension), hierarchyNameFilter);
};
oFF.CustomHierarchyRepository.prototype.convertToHierarchyCatalogItems = function(hierarchyDefinitions, hierarchyNameFilter)
{
	var result = oFF.XList.create();
	for (var i = 0; i < hierarchyDefinitions.size(); i++)
	{
		var customHierarchyDefinition = hierarchyDefinitions.get(i);
		var name = customHierarchyDefinition.getName();
		var description = customHierarchyDefinition.getDescription();
		if (oFF.XStringUtils.isNullOrEmpty(hierarchyNameFilter) || oFF.XPattern.matches(name, hierarchyNameFilter) || oFF.XPattern.matches(description, hierarchyNameFilter))
		{
			var item = oFF.HierarchyCatalogItem.createCatalogItem();
			item.setDimensionName(customHierarchyDefinition.getDimensionName());
			item.setHierarchyName(name);
			item.setHierarchyShortText(description);
			item.setCustomHierarchyDefinition(customHierarchyDefinition);
			result.add(item);
		}
	}
	return result;
};
oFF.CustomHierarchyRepository.prototype.getCustomHierarchyDefinitionsByDimension = function(dimension)
{
	if (oFF.notNull(dimension))
	{
		var queryManager = dimension.getQueryManager();
		var datasourceName = queryManager.getSystemType().isTypeOf(oFF.SystemType.ABAP) ? null : dimension.getDataSource().getName();
		return this.getCustomHierarchyDefinitionsByDimensionName(queryManager.getSystemName(), datasourceName, dimension.getName());
	}
	return oFF.XList.create();
};
oFF.CustomHierarchyRepository.prototype.getCustomHierarchyDefinitionsByDimensionName = function(system, dataSource, dimension)
{
	var hierarchies = oFF.XList.create();
	if (oFF.notNull(dimension))
	{
		var size = this.m_customHierarchies.size();
		for (var i = 0; i < size; i++)
		{
			var hierarchy = this.m_customHierarchies.get(i);
			if (oFF.XString.isEqual(hierarchy.getSystemName(), system) && (oFF.isNull(dataSource) || oFF.XString.isEqual(hierarchy.getDataSourceName(), dataSource)) && oFF.XString.isEqual(hierarchy.getDimensionName(), dimension))
			{
				hierarchies.add(hierarchy);
			}
		}
	}
	return hierarchies;
};
oFF.CustomHierarchyRepository.prototype.exportCustomHierarchyDefinitions = function()
{
	return this.exportCustomHierarchiesInternal(this.m_customHierarchies);
};
oFF.CustomHierarchyRepository.prototype.exportCustomHierarchiesInternal = function(customHierarchies)
{
	var inaHierarchies = oFF.PrFactory.createList();
	var exporter = oFF.QInAExportFactory.createForRepository(oFF.XWeakReferenceUtil.getHardRef(this.m_application), null);
	for (var i = 0; i < customHierarchies.size(); i++)
	{
		inaHierarchies.add(exporter.exportCustomHierarchyDefinition(customHierarchies.get(i)));
	}
	oFF.XObjectExt.release(exporter);
	return inaHierarchies;
};
oFF.CustomHierarchyRepository.prototype.exportCustomHierarchyDefinitionsToJson = function()
{
	return this.exportCustomHierarchiesToJsonInternal(this.m_customHierarchies);
};
oFF.CustomHierarchyRepository.prototype.exportCustomHierarchyDefinitionsByNameToJson = function(customHierarchyNames)
{
	var customHierarchies = oFF.XList.create();
	var size = oFF.notNull(customHierarchyNames) ? customHierarchyNames.size() : 0;
	for (var i = 0; i < size; i++)
	{
		var customHierarchyDefinition = this.getCustomHierarchyDefinitionByName(customHierarchyNames.get(i));
		if (oFF.notNull(customHierarchyDefinition))
		{
			customHierarchies.add(customHierarchyDefinition);
		}
	}
	return this.exportCustomHierarchiesToJsonInternal(customHierarchies);
};
oFF.CustomHierarchyRepository.prototype.exportCustomHierarchiesToJsonInternal = function(customHierarchies)
{
	return oFF.PrUtils.serialize(this.exportCustomHierarchiesInternal(customHierarchies), true, false, 0);
};
oFF.CustomHierarchyRepository.prototype.importCustomHierarchyDefinitions = function(customHierarchyDefinitions)
{
	if (oFF.notNull(customHierarchyDefinitions) && customHierarchyDefinitions.isList())
	{
		var hierarchies = customHierarchyDefinitions.asList();
		var importer = oFF.QInAImportFactory.createForRepository(oFF.XWeakReferenceUtil.getHardRef(this.m_application), null);
		for (var i = 0; i < hierarchies.size(); i++)
		{
			this.addCustomHierarchy(importer.importCustomHierarchyDefinition(hierarchies.getStructureAt(i)));
		}
		oFF.XObjectExt.release(importer);
	}
};
oFF.CustomHierarchyRepository.prototype.importCustomHierarchyDefinitionsFromJson = function(customHierarchyDefinitions)
{
	this.importCustomHierarchyDefinitions(oFF.JsonParserFactory.createFromSafeString(customHierarchyDefinitions));
};
oFF.CustomHierarchyRepository.prototype.getHierarchyNamesFromExportedJsonExt = function(customHierarchyDefinitions)
{
	return oFF.CustomHierarchyRepository.getHierarchyNamesFromExportedJson(customHierarchyDefinitions);
};
oFF.CustomHierarchyRepository.prototype.addCustomHierarchy = function(customHierarchyDefinition)
{
	if (oFF.notNull(customHierarchyDefinition) && oFF.XStringUtils.isNotNullAndNotEmpty(customHierarchyDefinition.getName()))
	{
		this.m_customHierarchies.removeElement(this.getCustomHierarchyDefinitionByName(customHierarchyDefinition.getName()));
		this.m_customHierarchies.add(customHierarchyDefinition);
	}
};
oFF.CustomHierarchyRepository.prototype.removeCustomHierarchyDefinition = function(customHierarchyDefinition)
{
	if (oFF.notNull(customHierarchyDefinition) && oFF.XStringUtils.isNotNullAndNotEmpty(customHierarchyDefinition.getName()))
	{
		this.m_customHierarchies.removeElement(this.getCustomHierarchyDefinitionByName(customHierarchyDefinition.getName()));
	}
};
oFF.CustomHierarchyRepository.prototype.getCustomHierarchiesUsedInQueryModel = function(queryModel)
{
	var usedCustomHierarchies = oFF.XList.create();
	this.addCustomHierarchiesUsedByDimensions(queryModel.getRowsAxis().getDimensions(), usedCustomHierarchies);
	this.addCustomHierarchiesUsedByDimensions(queryModel.getColumnsAxis().getDimensions(), usedCustomHierarchies);
	if (queryModel.getMeasureDimension() !== null)
	{
		oFF.XStream.of(queryModel.getMeasureDimension().getExtendedStructureMembers()).filter( function(member){
			return member.getMemberType().isTypeOf(oFF.MemberType.RESTRICTED_MEASURE);
		}.bind(this)).map( function(restrictedMeasure){
			return restrictedMeasure.getFilter().getUsedCustomHierarchies();
		}.bind(this)).forEach( function(hierarchies){
			oFF.XCollectionUtils.addAllIfNotPresent(usedCustomHierarchies, hierarchies);
		}.bind(this));
	}
	oFF.XCollectionUtils.addAllIfNotPresent(usedCustomHierarchies, queryModel.getFilter().getEffectiveFilter().getUsedCustomHierarchies());
	return usedCustomHierarchies;
};
oFF.CustomHierarchyRepository.prototype.getHierarchyNamesUsedInQueryModel = function(queryModel)
{
	var usedHierarchyNames = oFF.XHashSetOfString.create();
	this.addHierarchyNamesUsedByDimensions(queryModel.getRowsAxis().getDimensions(), usedHierarchyNames);
	this.addHierarchyNamesUsedByDimensions(queryModel.getColumnsAxis().getDimensions(), usedHierarchyNames);
	if (queryModel.getMeasureDimension() !== null)
	{
		oFF.XStream.of(queryModel.getMeasureDimension().getExtendedStructureMembers()).filter( function(member){
			return member.getMemberType().isTypeOf(oFF.MemberType.RESTRICTED_MEASURE);
		}.bind(this)).forEach( function(restrictedMeasure){
			usedHierarchyNames.addAll(restrictedMeasure.getFilter().getUsedHierarchyNames());
		}.bind(this));
	}
	usedHierarchyNames.addAll(queryModel.getFilter().getEffectiveFilter().getUsedHierarchyNames());
	return usedHierarchyNames;
};
oFF.CustomHierarchyRepository.prototype.addHierarchyNamesUsedByDimensions = function(dimensions, hierarchies)
{
	oFF.XStream.of(dimensions).filter( function(dimension){
		return dimension.isHierarchyActive() && oFF.XStringUtils.isNotNullAndNotEmpty(dimension.getHierarchyName());
	}.bind(this)).forEach( function(dimWithHierarchy){
		hierarchies.add(dimWithHierarchy.getHierarchyName());
	}.bind(this));
};
oFF.CustomHierarchyRepository.prototype.addCustomHierarchiesUsedByDimensions = function(dimensions, usedCustomHierarchies)
{
	oFF.XStream.of(dimensions).map( function(dimension){
		return dimension.isHierarchyActive() ? dimension.getCustomHierarchyDefinition() : null;
	}.bind(this)).filterNullValues().forEach( function(hierarchy){
		usedCustomHierarchies.add(hierarchy);
	}.bind(this));
};

oFF.OlapEnvQueryManagerHandler = function() {};
oFF.OlapEnvQueryManagerHandler.prototype = new oFF.XObject();
oFF.OlapEnvQueryManagerHandler.prototype._ff_c = "OlapEnvQueryManagerHandler";

oFF.OlapEnvQueryManagerHandler.create = function(olapEnv)
{
	var olapEnvQueryManagerHandler = new oFF.OlapEnvQueryManagerHandler();
	olapEnvQueryManagerHandler.setupQueryManagerHandler(olapEnv);
	return olapEnvQueryManagerHandler;
};
oFF.OlapEnvQueryManagerHandler.prototype.m_queryManagers = null;
oFF.OlapEnvQueryManagerHandler.prototype.m_olapEnv = null;
oFF.OlapEnvQueryManagerHandler.prototype.m_listener = null;
oFF.OlapEnvQueryManagerHandler.prototype.m_identifier = null;
oFF.OlapEnvQueryManagerHandler.prototype.setupQueryManagerHandler = function(olapEnv)
{
	this.m_olapEnv = oFF.XWeakReferenceUtil.getWeakRef(olapEnv);
	this.m_queryManagers = oFF.XWeakMap.create();
	this.m_listener = oFF.XHashMapByString.create();
	this.m_identifier = oFF.XHashMapByString.create();
};
oFF.OlapEnvQueryManagerHandler.prototype.releaseObject = function()
{
	this.m_olapEnv = oFF.XObjectExt.release(this.m_olapEnv);
	this.m_queryManagers = oFF.XObjectExt.release(this.m_queryManagers);
	this.m_listener = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_listener);
	this.m_identifier = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_identifier);
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.OlapEnvQueryManagerHandler.prototype.getOlapEnv = function()
{
	return oFF.XWeakReferenceUtil.getHardRef(this.m_olapEnv);
};
oFF.OlapEnvQueryManagerHandler.prototype.processQueryManagerCreationWithDataSourceName = function(syncType, listener, customIdentifier, systemName, dataSourceName)
{
	var queryServiceConfig = oFF.QueryServiceConfig.createWithDataSourceName(this.getOlapEnv().getApplication(), systemName, dataSourceName);
	var guid = oFF.XGuid.getGuid();
	this.m_listener.put(guid, listener);
	this.m_identifier.put(guid, customIdentifier);
	return queryServiceConfig.processQueryManagerCreation(syncType, this, oFF.XStringValue.create(guid));
};
oFF.OlapEnvQueryManagerHandler.prototype.createQueryManagerWithMicroCube = function(microCube, systemName)
{
	var queryServiceConfig = oFF.QueryServiceConfig.createWithMicroCube(this.getOlapEnv().getApplication(), systemName, microCube);
	var queryManager = queryServiceConfig.getQueryManagerBasedOnMicroCube();
	this.m_queryManagers.put(queryManager.getInstanceId(), queryManager);
	return queryManager;
};
oFF.OlapEnvQueryManagerHandler.prototype.processQueryManagerCreationWithBlendingDefinition = function(syncType, listener, customIdentifier, blendingDefinition)
{
	var queryServiceConfig = oFF.QueryServiceConfig.createWithBlendingDefinition(this.getOlapEnv().getApplication(), blendingDefinition);
	var guid = oFF.XGuid.getGuid();
	this.m_listener.put(guid, listener);
	this.m_identifier.put(guid, customIdentifier);
	return queryServiceConfig.processQueryManagerCreation(syncType, this, oFF.XStringValue.create(guid));
};
oFF.OlapEnvQueryManagerHandler.prototype.onQueryManagerCreated = function(extResult, queryManager, customIdentifier)
{
	var xGuid = customIdentifier;
	var guid = xGuid.getString();
	if (extResult.isValid())
	{
		this.m_queryManagers.put(queryManager.getInstanceId(), queryManager);
	}
	var listener = this.m_listener.remove(guid);
	var identifier = this.m_identifier.remove(guid);
	if (oFF.notNull(listener))
	{
		listener.onQueryManagerCreated(extResult, queryManager, identifier);
	}
};

oFF.OlapEnvironmentFactoryImpl = function() {};
oFF.OlapEnvironmentFactoryImpl.prototype = new oFF.OlapEnvironmentFactory();
oFF.OlapEnvironmentFactoryImpl.prototype._ff_c = "OlapEnvironmentFactoryImpl";

oFF.OlapEnvironmentFactoryImpl.staticSetupImpl = function()
{
	var theFactory = new oFF.OlapEnvironmentFactoryImpl();
	oFF.OlapEnvironmentFactory.registerFactory(theFactory);
};
oFF.OlapEnvironmentFactoryImpl.prototype.newOlapEnvironmentInstance = function(application)
{
	return oFF.OlapEnvironment.create(application);
};

oFF.QFactoryImpl = function() {};
oFF.QFactoryImpl.prototype = new oFF.XObject();
oFF.QFactoryImpl.prototype._ff_c = "QFactoryImpl";

oFF.QFactoryImpl.create = function()
{
	return new oFF.QFactoryImpl();
};
oFF.QFactoryImpl.prototype.newRuntimeQuery = function(batch, queryManager)
{
	return oFF.RuntimeQuery.create(batch, queryManager);
};
oFF.QFactoryImpl.prototype.newMemberNavigation = function(memberFunction)
{
	var memberNavigation = new oFF.QMemberNavigation();
	memberNavigation.setMemberFunction(memberFunction);
	return memberNavigation;
};
oFF.QFactoryImpl.prototype.newNavigationParameterWithStringConstant = function(constantValue)
{
	var parameter = oFF.QMemberNavigationParameter.create();
	parameter.setConstantValue(oFF.XStringValue.create(constantValue));
	return parameter;
};
oFF.QFactoryImpl.prototype.newNavigationParameterWithIntegerConstant = function(constantValue)
{
	var parameter = oFF.QMemberNavigationParameter.create();
	parameter.setConstantValue(oFF.XIntegerValue.create(constantValue));
	return parameter;
};
oFF.QFactoryImpl.prototype.newNavigationParameterWithLevelLiteral = function(levelValue)
{
	var parameter = oFF.QMemberNavigationParameter.create();
	parameter.setLevelValue(oFF.XStringValue.create(levelValue));
	return parameter;
};
oFF.QFactoryImpl.prototype.newNavigationParameterWithLevelNumber = function(levelValue)
{
	var parameter = oFF.QMemberNavigationParameter.create();
	parameter.setLevelValue(oFF.XIntegerValue.create(levelValue));
	return parameter;
};
oFF.QFactoryImpl.prototype.newNavigationParameterWithMemberName = function(fqnName)
{
	var parameter = oFF.QMemberNavigationParameter.create();
	parameter.setMemberValue(fqnName);
	return parameter;
};
oFF.QFactoryImpl.prototype.newNavigationParameterWithShift = function(levelValue, constantValue)
{
	var parameter = oFF.QMemberNavigationParameter.create();
	parameter.setShift(oFF.XStringValue.create(levelValue), oFF.XIntegerValue.create(constantValue));
	return parameter;
};
oFF.QFactoryImpl.prototype.newNavigationParameterWithRange = function(levelValue, offsetLow, offsetHigh)
{
	var parameter = oFF.QMemberNavigationParameter.create();
	parameter.setRange(oFF.XStringValue.create(levelValue), offsetLow, offsetHigh);
	return parameter;
};
oFF.QFactoryImpl.prototype.newNavigationParameterWithNoValuesAboveLevel = function(levelValue)
{
	var parameter = oFF.QMemberNavigationParameter.create();
	parameter.setNoValuesAboveLevel(levelValue);
	return parameter;
};
oFF.QFactoryImpl.prototype.newNavigationParameterWithErrorAboveLevel = function(levelValue)
{
	var parameter = oFF.QMemberNavigationParameter.create();
	parameter.setErrorAboveLevel(levelValue);
	return parameter;
};
oFF.QFactoryImpl.prototype.newDimensionElement = function(selectField, hierarchyName, value)
{
	return oFF.QSelectValue._createDimensionElement2(selectField.getContext(), selectField, hierarchyName, value);
};
oFF.QFactoryImpl.prototype.newDimensionElementWithContext = function(context, selectField, hierarchyName, value)
{
	return oFF.QSelectValue._createDimensionElement2(context, selectField, hierarchyName, value);
};
oFF.QFactoryImpl.prototype.newDataSource = function(context)
{
	return oFF.QDataSource.createWithContext(context);
};
oFF.QFactoryImpl.prototype.newFormulaAttributeExt = function(context)
{
	return oFF.QFormulaItemAttribute._createMember(context, null);
};
oFF.QFactoryImpl.prototype.newFormulaConstant = function(context)
{
	return oFF.QFormulaItemConstant._createConstant(context, null);
};
oFF.QFactoryImpl.prototype.newFormulaOperationExt = function(context)
{
	return oFF.QFormulaItemOperation._createOperation(context, null);
};
oFF.QFactoryImpl.prototype.newFormulaFunction = function(context)
{
	return oFF.QFormulaItemFunction._createFunction(context, null);
};
oFF.QFactoryImpl.prototype.newFormulaMember = function(context)
{
	return oFF.QFormulaItemMember._createMember(context, null);
};
oFF.QFactoryImpl.prototype.newFilterAnd = function(context, filterExpression)
{
	return oFF.QFilterAnd._create(context, filterExpression);
};
oFF.QFactoryImpl.prototype.newFilterAndWithoutContext = function(fieldName, values, hierarchyName, convertToFlatSelection)
{
	return oFF.QFilterAnd._createWithParams(fieldName, values, hierarchyName, convertToFlatSelection);
};
oFF.QFactoryImpl.prototype.newFilterCartesianListWithoutContext = function(fieldName, values, hierarchyName, convertToFlatSelection, isExcluding)
{
	var iqFilterCartesianProductBase = oFF.QFilterCartesianProduct._createWithoutContext();
	return oFF.QFilterCartesianList._createWithParams(iqFilterCartesianProductBase, fieldName, values, hierarchyName, convertToFlatSelection, isExcluding);
};
oFF.QFactoryImpl.prototype.newFilterTupleExt = function(context)
{
	return oFF.QFilterTuple._create(context, null);
};
oFF.QFactoryImpl.prototype.newFilterOr = function(context, filterExpression)
{
	return oFF.QFilterOr._create(context, filterExpression);
};
oFF.QFactoryImpl.prototype.newFilterNot = function(context, filterExpression)
{
	return oFF.QFilterNot._create(context, filterExpression);
};
oFF.QFactoryImpl.prototype.newFilterOperation = function(context, filterExpression)
{
	return oFF.QFilterOperation._create(context, filterExpression, null);
};
oFF.QFactoryImpl.prototype.newFilterOperationDateRange = function(context, filterExpression)
{
	return oFF.QFilterDateRange.create(context, filterExpression);
};
oFF.QFactoryImpl.prototype.newCellValueOperand = function(context, filterExpression)
{
	return oFF.QFilterCellValueOperand.createWithExpression(context, filterExpression, null);
};
oFF.QFactoryImpl.prototype.newFilterCartesianProduct = function(context, filterExpression)
{
	return oFF.QFilterCartesianProduct._create(context, filterExpression);
};
oFF.QFactoryImpl.prototype.newFilterCartesianList = function(context, filterExpression)
{
	return oFF.QFilterCartesianList._createMd(context, filterExpression, null, null);
};
oFF.QFactoryImpl.prototype.newFilterCartesianListForDimensionMemberVariable = function(context, dimensionMemberVariable, fieldMd, hierarchyName)
{
	return oFF.QFilterCartesianList._createMd(context, dimensionMemberVariable, fieldMd, hierarchyName);
};
oFF.QFactoryImpl.prototype.newFilterConvertedTimeCartesianList = function(context, filterExpression)
{
	return oFF.QFilterConvertedTimeCartesianList._create(context, filterExpression, null, null);
};
oFF.QFactoryImpl.prototype.newFilterCartesianElement = function(context)
{
	return oFF.QFilterOperation._create(context, null, null);
};
oFF.QFactoryImpl.prototype.newFilterVirtualDatasource = function(context)
{
	return oFF.QFilterVirtualDatasource._create(context, null);
};
oFF.QFactoryImpl.prototype.newDrillPathElementExt = function(context)
{
	return oFF.QDrillPathElement._create(context);
};
oFF.QFactoryImpl.prototype.createNewAggregationLevel = function(name)
{
	var registrationService = oFF.RegistrationService.getInstance();
	var factoryClass = registrationService.getFirstReference(oFF.OlapApiModule.AGGREGATION_LEVEL_FACTORY, null);
	if (oFF.isNull(factoryClass))
	{
		oFF.noSupport();
	}
	var factory = factoryClass.newInstance(this);
	return factory.createIAggregationLevel(name);
};
oFF.QFactoryImpl.prototype.newAggregationLevelExt = function(context, name)
{
	return this.createNewAggregationLevel(name);
};
oFF.QFactoryImpl.prototype.newDrillManager = function(context)
{
	var queryModel = null;
	if (oFF.notNull(context))
	{
		queryModel = context.getQueryModel();
	}
	return oFF.QDrillManager.create(context, queryModel);
};
oFF.QFactoryImpl.prototype.newUniversalDisplayHierarchies = function(context)
{
	if (oFF.notNull(context))
	{
		var queryModel = context.getQueryModel();
		if (queryModel.getModelCapabilities().supportsUniversalDisplayHierarchies())
		{
			return oFF.QUniversalDisplayHierarchies.create(context, queryModel);
		}
	}
	return null;
};
oFF.QFactoryImpl.prototype.newVizDef = function(context)
{
	return oFF.QVizDef.create(context);
};
oFF.QFactoryImpl.prototype.newFieldValueEmpty = function(field, valueException, formattedValue)
{
	var fieldValue = oFF.QFieldValue.create(field.getContext(), field, null);
	fieldValue.setValueException(valueException);
	fieldValue.setFormattedValue(formattedValue);
	return fieldValue;
};
oFF.QFactoryImpl.prototype.newFieldValue = function(field, valueException, value, formattedValue)
{
	var fieldValue = oFF.QFieldValue.create(field.getContext(), field, null);
	fieldValue.setValueException(valueException);
	fieldValue.setValue(value);
	fieldValue.setFormattedValue(formattedValue);
	return fieldValue;
};
oFF.QFactoryImpl.prototype.newField = function(context, fieldName)
{
	var field = oFF.QField._createField(context, null, null);
	field.setName(fieldName);
	return field;
};
oFF.QFactoryImpl.prototype.newDimensionMemberFromTupleElement = function(tupleElement)
{
	var newMember;
	var textField = null;
	var dimension = tupleElement.getDimensionAtCurrentPositionFromQueryModel();
	if (oFF.isNull(dimension))
	{
		var rsDimension = tupleElement.getRsDimensionAtCurrentPosition();
		if (tupleElement.getRsDimensionAtCurrentPosition().getDimensionType().isTypeOf(oFF.DimensionType.ABSTRACT_STRUCTURE))
		{
			newMember = oFF.QStructureMember.createStructureMember(rsDimension.getContext(), null, oFF.MemberType.MEASURE);
		}
		else
		{
			newMember = oFF.QDimensionMember.createDimensionMember(rsDimension.getContext(), null);
		}
	}
	else
	{
		if (dimension.isMeasureStructure())
		{
			newMember = oFF.QStructureMember.createStructureMember(dimension.getContext(), dimension, oFF.MemberType.MEASURE);
		}
		else
		{
			newMember = oFF.QDimensionMember.createDimensionMember(dimension.getContext(), dimension);
		}
		textField = dimension.getTextField();
	}
	newMember.setType(tupleElement.getDimensionMemberType());
	newMember.setName(tupleElement.getDimensionMemberName());
	newMember.setDimensionMemberNameValueException(tupleElement.getDimensionMemberNameValueException());
	var fieldValues = tupleElement.getFieldValueList();
	var size = fieldValues.size();
	for (var idxField = 0; idxField < size; idxField++)
	{
		var cursorFieldValue = fieldValues.get(idxField);
		var fieldValue = cursorFieldValue.createFieldValueFromCurrentPosition();
		fieldValue.setDimensionMember(newMember);
		newMember.addFieldValue(fieldValue);
	}
	if (oFF.notNull(textField) && oFF.notNull(dimension))
	{
		var textFieldValue = newMember.getFieldValue(textField);
		if (oFF.notNull(textFieldValue))
		{
			var formattedValue = textFieldValue.getFormattedValue();
			var dimensionType = dimension.getDimensionType();
			if (dimensionType === oFF.DimensionType.ACCOUNT || dimensionType === oFF.DimensionType.MEASURE_STRUCTURE || dimensionType === oFF.DimensionType.SECONDARY_STRUCTURE)
			{
				var dimensionMember = dimension.getStructureMember(newMember.getName());
				if (oFF.notNull(dimensionMember))
				{
					if (dimensionType === oFF.DimensionType.MEASURE_STRUCTURE && (oFF.XString.isEqual(newMember.getName(), oFF.CurrencyConstants.DEFAULT_CURRENCY) || oFF.XString.isEqual(newMember.getName(), oFF.CurrencyConstants.LOCAL_CURRENCY)))
					{
						formattedValue = dimensionMember.getText();
					}
					var overrideText = dimensionMember.getOverrideText();
					if (oFF.notNull(overrideText))
					{
						newMember.setOverrideText(overrideText);
					}
				}
			}
			newMember.setText(formattedValue);
		}
	}
	return newMember;
};
oFF.QFactoryImpl.prototype.newCustomHierarchyDefinition = function(dimension, description)
{
	return oFF.QCustomHierarchyDefinition.create(dimension, description);
};
oFF.QFactoryImpl.prototype.newFormulaCalculatedDimension = function(context, name)
{
	return oFF.QFormulaCalculatedDimension._createFormulaCalculatedDimension(context, name);
};
oFF.QFactoryImpl.prototype.newFilterMeasureBased = function(context, name)
{
	return oFF.QFilterMeasureBased.createFilterMeasureBased(context, name);
};
oFF.QFactoryImpl.prototype.newFilterAcrossModels = function(context, name)
{
	return oFF.QFilterAcrossModels.createFilterAcrossModels(context, name);
};
oFF.QFactoryImpl.prototype.newFilterAcrossModelsCalculatedDimension = function(context, name)
{
	return oFF.QFilterAcrossModelsCalculatedDimension.createFilterAcrossModelsCalculatedDimension(context, name);
};
oFF.QFactoryImpl.prototype.newFilterDynamicTimeRegularRange = function(context, name)
{
	return oFF.QFilterDynamicTimeRegularRange.createFilterDynamicTimeRegularRange(context, name);
};
oFF.QFactoryImpl.prototype.newFilterDynamicTimeToDateRange = function(context, name)
{
	return oFF.QFilterDynamicTimeToDateRange.createFilterDynamicTimeToDateRange(context, name);
};
oFF.QFactoryImpl.prototype.newFilterFixedTimeRange = function(context, name)
{
	return oFF.QFilterFixedTimeRange.createFilterFixedTimeRange(context, name);
};
oFF.QFactoryImpl.prototype.newClustering = function(algorithm, spatialClusterContext)
{
	if (algorithm === oFF.ClusterAlgorithm.GRID)
	{
		return oFF.ClusteringGrid.create(spatialClusterContext);
	}
	if (algorithm === oFF.ClusterAlgorithm.DB_SCAN)
	{
		return oFF.ClusteringDbScan.create(spatialClusterContext);
	}
	if (algorithm === oFF.ClusterAlgorithm.K_MEANS)
	{
		return oFF.ClusteringKmeans.create(spatialClusterContext);
	}
	return null;
};
oFF.QFactoryImpl.prototype.newMeasureBasedFilterCalculatedDimension = function(context, name)
{
	return oFF.QMeasureBasedFilterCalculatedDimension._createMeasureBasedFilterCalculatedDimension(context, name);
};
oFF.QFactoryImpl.prototype.newDimensionFromType = function(context, originDimension, dimensionManager)
{
	if (oFF.isNull(originDimension))
	{
		return oFF.QDimension._create(context, dimensionManager);
	}
	var name = originDimension.getName();
	var dimensionType = originDimension.getDimensionType();
	var cloneDim;
	if (dimensionType === oFF.DimensionType.CALCULATED_DIMENSION)
	{
		cloneDim = oFF.QCalculatedDimension._createCalculatedDimension(context, dimensionManager, name);
	}
	else if (dimensionType === oFF.DimensionType.FORMULA_CALCULATED_DIMENSION)
	{
		cloneDim = this.newFormulaCalculatedDimension(context, name);
		cloneDim.setParent(dimensionManager);
	}
	else if (dimensionType === oFF.DimensionType.MEASURE_BASED_FILTER_CALCULATED_DIMENSION)
	{
		cloneDim = this.newMeasureBasedFilterCalculatedDimension(context, name);
		cloneDim.setParent(dimensionManager);
	}
	else if (dimensionType === oFF.DimensionType.FILTER_ACROSS_MODELS_CALCULATED_DIMENSION)
	{
		var otherQueryModelContext = originDimension.getQueryModel().getContext();
		cloneDim = this.newFilterAcrossModelsCalculatedDimension(otherQueryModelContext, name);
		cloneDim.setParent(dimensionManager);
	}
	else
	{
		cloneDim = oFF.QDimension._create(context, dimensionManager);
	}
	return cloneDim;
};
oFF.QFactoryImpl.prototype.newBlendingDefinition = function()
{
	return oFF.BlendingDefinition.create();
};
oFF.QFactoryImpl.prototype.newDimensionLinkKey = function(systemName, cubeName, dimensionName, fieldName)
{
	return oFF.QDimensionLinkKey.createLinkKey(systemName, cubeName, dimensionName, fieldName);
};
oFF.QFactoryImpl.prototype.newDimensionLinkKey2 = function(context, systemName, cubeName, dimensionName, fieldName)
{
	return oFF.QDimensionLinkKey.createLinkKeyExt(context, systemName, cubeName, dimensionName, fieldName);
};
oFF.QFactoryImpl.prototype.newDimensionLinkPart = function(context, fieldKey, hierarchyName, queryManagerKey)
{
	return oFF.QDimensionLinkPart.createDimensionLinkPart(context, fieldKey, hierarchyName, queryManagerKey);
};
oFF.QFactoryImpl.prototype.newAttributeContainer = function(context, dimension)
{
	return oFF.QAttributeContainer.create(context, dimension);
};
oFF.QFactoryImpl.prototype.newFieldContainer = function(context, dimension)
{
	return oFF.QFieldContainer.create(context, dimension);
};
oFF.QFactoryImpl.prototype.newHierarchyManager = function(context, parent)
{
	return oFF.QHierarchyManager.create(context, parent);
};
oFF.QFactoryImpl.prototype.newKeyRefStorage = function(context, name)
{
	return oFF.QKeyRefStorage.create(name);
};
oFF.QFactoryImpl.prototype.newKeyRefStoreContext = function(context, storageName)
{
	return oFF.QKeyRefStoreContext.create(context, storageName, null);
};
oFF.QFactoryImpl.prototype.newKeyRefStoreContextWithCapabilities = function(context, storageName, capabilities)
{
	return oFF.QKeyRefStoreContext.create(context, storageName, capabilities);
};
oFF.QFactoryImpl.prototype.newKeyRef = function(storageName, groupName, objectName)
{
	return oFF.QKeyRef.create(storageName, groupName, objectName);
};
oFF.QFactoryImpl.prototype.newFormulaMeasure = function(context, dimension, name, text, alias)
{
	var member = oFF.QFormulaMeasure._createFormulaMeasure(context, dimension);
	member.setName(name);
	member.setText(text);
	if (oFF.notNull(dimension) && dimension.getPlaceholderIds().size() > 0)
	{
		member.setAliasName(alias);
	}
	return member;
};
oFF.QFactoryImpl.prototype.newRestrictedMeasure = function(context, dimension, name, text, alias)
{
	var member = oFF.QRestrictedMeasure._createRestrictedMeasure(context, dimension);
	member.setName(name);
	member.setText(text);
	if (oFF.notNull(dimension) && dimension.getPlaceholderIds().size() > 0)
	{
		member.setAliasName(alias);
	}
	return member;
};
oFF.QFactoryImpl.prototype.newVarianceMeasure = function(context, dimension, name, text, alias)
{
	var member = oFF.QVarianceMeasure._createVarianceMeasure(context, dimension);
	member.setName(name);
	member.setText(text);
	if (oFF.notNull(dimension) && dimension.getPlaceholderIds().size() > 0)
	{
		member.setAliasName(alias);
	}
	return member;
};
oFF.QFactoryImpl.prototype.newExceptionAggregationMeasure = function(context, dimension, name, text, alias)
{
	var member = oFF.QExceptionAggregationMeasure._createExceptionAggregationMeasure(context, dimension);
	member.setName(name);
	member.setText(text);
	if (oFF.notNull(dimension) && dimension.getPlaceholderIds().size() > 0)
	{
		member.setAliasName(alias);
	}
	return member;
};
oFF.QFactoryImpl.prototype.newResultStructureController = function(context, parentNode, location)
{
	return oFF.QResultStructureController._create(context, parentNode, location);
};
oFF.QFactoryImpl.prototype.newFilterExpression = function(context, parentNode)
{
	return oFF.QFilterExpression.create(context, parentNode);
};
oFF.QFactoryImpl.prototype.newVariableValue = function(variable)
{
	return oFF.QVariableValue.create(variable);
};
oFF.QFactoryImpl.prototype.newVariable = function(context, parent, originVariable)
{
	var originType = originVariable.getVariableType();
	var parentBase = parent;
	var name = originVariable.getName();
	var text = originVariable.getText();
	if (originType === oFF.VariableType.DIMENSION_MEMBER_VARIABLE)
	{
		return oFF.QDimensionMemberVariable.createDimensionMemberVariable(context, parentBase, name, text);
	}
	else if (originType === oFF.VariableType.HIERARCHY_NAME_VARIABLE)
	{
		return oFF.QHierarchyNameVariable.createDimensionHierarchyVariable(context, parentBase, name, text);
	}
	else if (originType === oFF.VariableType.HIERARCHY_NODE_VARIABLE)
	{
		return oFF.QHierarchyNodeVariable.createHierarchyNodeVariable(context, parentBase, name, text);
	}
	else if (originType === oFF.VariableType.SIMPLE_TYPE_VARIABLE)
	{
		return oFF.QSimpleTypeVariable.createSimpleTypeVariable(context, parentBase, originVariable.getValueType(), name, text, originVariable.supportsMultipleValues());
	}
	else if (originType === oFF.VariableType.TEXT_VARIABLE)
	{
		return oFF.QSimpleTypeVariable.createTextVariable(context, parentBase, name, text, originVariable.supportsMultipleValues());
	}
	else if (originType === oFF.VariableType.FORMULA_VARIABLE)
	{
		return oFF.QSimpleTypeVariable.createFormulaVariable(context, parentBase, name, text, originVariable.supportsMultipleValues());
	}
	else if (originType === oFF.VariableType.OPTION_LIST_VARIABLE)
	{
		return oFF.QSimpleTypeVariable.createOptionListVariable(context, parentBase, name, text, originVariable.supportsMultipleValues());
	}
	else if (originType === oFF.VariableType.HIERARCHY_VARIABLE)
	{
		return oFF.QSimpleTypeVariable.createHierarchyVariable(context, parentBase, name, text, originVariable.supportsMultipleValues());
	}
	else
	{
		throw oFF.XException.createRuntimeException(oFF.XStringUtils.concatenate3("Unexpected variable type '", originType.getName(), "'!"));
	}
};
oFF.QFactoryImpl.prototype.newXVariable = function(variableType, fieldName, variableName, values)
{
	var newVariable;
	if (variableType.isTypeOf(oFF.VariableType.DIMENSION_MEMBER_VARIABLE))
	{
		newVariable = oFF.QDimensionMemberVariable.createDimensionMemberVariable(null, null, variableName, variableName);
	}
	else if (variableType.isTypeOf(oFF.VariableType.SIMPLE_TYPE_VARIABLE))
	{
		var valueType = oFF.XCollectionUtils.hasElements(values) ? values.get(0).getValueType() : oFF.XValueType.STRING;
		newVariable = oFF.QSimpleTypeVariable.createSimpleTypeVariable(null, null, valueType, variableName, variableName, true);
	}
	else
	{
		throw oFF.XException.createRuntimeException(oFF.XStringUtils.concatenate3("Unexpected variable type '", variableType.getName(), "'!"));
	}
	if (newVariable.getVariableType().isTypeOf(oFF.VariableType.SIMPLE_TYPE_VARIABLE))
	{
		var simpleVar = newVariable;
		simpleVar.setValues(values);
	}
	else if (newVariable.getVariableType().isTypeOf(oFF.VariableType.DIMENSION_MEMBER_VARIABLE))
	{
		var dimVar = newVariable;
		var memberFilter = oFF.QFactory.createFilterCartesianListForDimensionMemberVariable(null, null, null, null);
		dimVar.setMemberFilter(memberFilter);
		oFF.XObjectExt.assertFalse(oFF.XStringUtils.isNullOrEmpty(fieldName));
		memberFilter.setFieldName(fieldName);
		oFF.XStream.of(values).forEach( function(value){
			var addNewCartesianElement = memberFilter.addNewCartesianElement();
			addNewCartesianElement.getLow().setValue(value);
			addNewCartesianElement.setFieldName(fieldName);
		}.bind(this));
	}
	return newVariable;
};
oFF.QFactoryImpl.prototype.newCanonicalDate = function(year, member, granularity)
{
	return oFF.QCanonicalDate.create(year, member, null, granularity);
};
oFF.QFactoryImpl.prototype.newCanonicalDateWithTimestamp = function(year, timestamp, granularity)
{
	return oFF.QCanonicalDate.create(year, 0, timestamp, granularity);
};
oFF.QFactoryImpl.prototype.newCanonicalDateContext = function(queryModel, timeDimension, hierarchyName)
{
	return oFF.QCanonicalDateContext.create(queryModel, timeDimension, hierarchyName);
};
oFF.QFactoryImpl.prototype.newTimeOperation = function(context, parent, timeDimensionName, timeOperationFunction, timeOperationGranularity, period)
{
	var timeOperation = oFF.QTimeOperation.create(context, parent);
	timeOperation.setDimensionName(timeDimensionName);
	timeOperation.setFunction(timeOperationFunction);
	timeOperation.setGranularity(timeOperationGranularity);
	timeOperation.setPeriod(period);
	return timeOperation;
};
oFF.QFactoryImpl.prototype.newPersistedPlaceholderTagFilter = function(name, filterId, qmFilterModel, canonicalDateContext)
{
	return oFF.QPersistedPlaceholderTagFilter.create(name, filterId, qmFilterModel, canonicalDateContext);
};
oFF.QFactoryImpl.prototype.newPersistedPlaceholderTagFilterFromPlaceholderString = function(persistedPlaceholderFilterStringTag)
{
	return oFF.QPersistedPlaceholderTagFilter.createFromPlaceholderString(persistedPlaceholderFilterStringTag);
};
oFF.QFactoryImpl.prototype.newPersistedPlaceholderTagCalculation = function(name, selectionPlaceholder, canonicalDateContext)
{
	return oFF.QPersistedPlaceholderTagSelection.create(name, selectionPlaceholder, canonicalDateContext);
};
oFF.QFactoryImpl.prototype.newPersistedPlaceholderTagCalculationFromPlaceholderString = function(persistedPlaceholderStringTag)
{
	return oFF.QPersistedPlaceholderTagSelection.createFromPlaceholderString(persistedPlaceholderStringTag);
};
oFF.QFactoryImpl.prototype.newTimeSelectionPlaceholderFromPlaceholderString = function(selectionPlaceholderString)
{
	return oFF.QTimeSelectionPlaceholder.createTimeSelectionPlaceholderFromPlaceholderString(selectionPlaceholderString);
};
oFF.QFactoryImpl.prototype.newTimeSelectionPlaceholderToDateFromPlaceholderString = function(selectionPlaceholderString)
{
	return oFF.QTimeSelectionPlaceholderToDate.createTimeSelectionPlaceholderToDateFromPlaceholderString(selectionPlaceholderString);
};
oFF.QFactoryImpl.prototype.newTimeConvertedFAMSelectionPlaceholderFromPlaceholderString = function(selectionPlaceholderString)
{
	return oFF.QTimeConvertedFAMSelectionPlaceholder.createTimeConvertedFAMSelectionPlaceholderFromPlaceholderString(selectionPlaceholderString);
};
oFF.QFactoryImpl.prototype.newTimeConvertedFAMSelectionPlaceholder = function(queryModel, timeDimension, filterOp, qmFilterModel, sourceDatasetId, sourceTimeDimensionName, sourceHierarchyName)
{
	return oFF.QTimeConvertedFAMSelectionPlaceholder.createTimeConvertedFAMSelectionPlaceholder(queryModel, timeDimension, filterOp, qmFilterModel, sourceDatasetId, sourceTimeDimensionName, sourceHierarchyName);
};
oFF.QFactoryImpl.prototype.newPersistedPlaceholderTagSelection = function(name, selectionPlaceholder, canonicalDateContext)
{
	return oFF.QPersistedPlaceholderTagSelection.create(name, selectionPlaceholder, canonicalDateContext);
};
oFF.QFactoryImpl.prototype.newPersistedPlaceholderTagSelectionFromPlaceholderString = function(persistedPlaceholderStringTag)
{
	return oFF.QPersistedPlaceholderTagSelection.createFromPlaceholderString(persistedPlaceholderStringTag);
};
oFF.QFactoryImpl.prototype.newReflectionCommand = function(methodName, primitiveReturnType, signature, signatureList)
{
	return oFF.QGenericCmd.createGenericCmd(methodName, primitiveReturnType, signature, signatureList);
};
oFF.QFactoryImpl.prototype.newFilterValueBag = function(context, filterExpression, parentNode)
{
	return oFF.QFilterValueBag._create(context, filterExpression, parentNode);
};
oFF.QFactoryImpl.prototype.newFormulaException = function(context, name, text)
{
	var queryModel = null;
	if (oFF.notNull(context))
	{
		queryModel = context.getQueryModel();
	}
	return oFF.QFormulaException.createFormulaException(context, queryModel, name, text);
};
oFF.QFactoryImpl.prototype.newRankInfo = function(maxRows, complexSortForRank, conditionForRank)
{
	return oFF.QRankInfo.create(maxRows, complexSortForRank, conditionForRank);
};
oFF.QFactoryImpl.prototype.newRankSettings = function()
{
	return oFF.QRankSettings.create();
};
oFF.QFactoryImpl.prototype.newBlendableDimensionSort = function(fieldName, datasetId, sortDirection, preserveGrouping, language)
{
	return oFF.BlendableDimensionSort.createBlendableDimensionSortWithLanguage(oFF.QSortUtils.getBlendableDimensionSortMapKey(fieldName, datasetId), fieldName, datasetId, sortDirection, preserveGrouping, language);
};
oFF.QFactoryImpl.prototype.newBlendableCustomSort = function(name, datasetId, dimensionId, hierarchyId, id, sortFromStart, sortFromEnd, movedNodes)
{
	return oFF.BlendableCustomSort.createBlendableCustomSort(name, datasetId, dimensionId, hierarchyId, id, sortFromStart, sortFromEnd, movedNodes);
};
oFF.QFactoryImpl.prototype.newQueryServiceConfig = function(application)
{
	return oFF.QueryServiceConfigImpl._create(application);
};
oFF.QFactoryImpl.prototype.newCapabilitiesDecorator = function(parent)
{
	return oFF.QCapabilitiesDecorator.create(parent);
};
oFF.QFactoryImpl.prototype.newValueHelpVarDimMember = function(context, dimensionMemberVariable)
{
	return oFF.QValueHelpVarDimMember.create(context, dimensionMemberVariable);
};
oFF.QFactoryImpl.prototype.newFilterCapability = function(context, parent, field, olapComponentType)
{
	if (olapComponentType === oFF.OlapComponentType.FILTER_CAPABILITY)
	{
		return oFF.QFilterCapability._createFilterCapability(context, parent, field);
	}
	return oFF.QFilterCapabilityGroup._createFilterCapabilityGroup(context, parent, field);
};
oFF.QFactoryImpl.prototype.newFilterCapabilitiesForVariable = function(context, variable)
{
	return oFF.QFilterCapabilityList.createFilterCapabilitiesForVariable(context, variable);
};
oFF.QFactoryImpl.prototype.newFilterForQueryModel = function(queryModel)
{
	return oFF.QFilter.createWithModelComponent(queryModel, queryModel);
};
oFF.QFactoryImpl.prototype.newFieldFromType = function(context, dimension, presentationType, name)
{
	var dimensionType = dimension.getDimensionType();
	if (dimensionType === oFF.DimensionType.CALCULATED_DIMENSION)
	{
		return oFF.QFieldCalcDim._createFieldCalcDim(context, dimension, presentationType, name);
	}
	else if (dimensionType === oFF.DimensionType.FORMULA_CALCULATED_DIMENSION || dimensionType === oFF.DimensionType.MEASURE_BASED_FILTER_CALCULATED_DIMENSION || dimensionType === oFF.DimensionType.FILTER_ACROSS_MODELS_CALCULATED_DIMENSION)
	{
		return oFF.QFieldFormulaCalc._createFormulaCalcField(context, dimension, presentationType, name);
	}
	return oFF.QField._createField(context, dimension, presentationType);
};
oFF.QFactoryImpl.prototype.newWindowFunction = function(type)
{
	return oFF.QWindowFunction._createWindowFunction(type);
};
oFF.QFactoryImpl.prototype.newReadModeManager = function(dimension)
{
	return oFF.QDimensionReadModeManager._create(dimension);
};
oFF.QFactoryImpl.prototype.newValueHelpListenerDecorator = function(originalListener)
{
	return oFF.ValueHelpListenerDecorator.create(originalListener);
};
oFF.QFactoryImpl.prototype.newModellingCurrencyTranslationManager = function(cttdFieldName, rateTypeFieldName, rateVersionFieldName, categoryFieldName)
{
	return oFF.QCurrencyTranslationManager.createForModelling(cttdFieldName, rateTypeFieldName, rateVersionFieldName, categoryFieldName);
};
oFF.QFactoryImpl.prototype.newDimensionSelector = function(dimension)
{
	return oFF.QDimensionSelector.create(dimension);
};
oFF.QFactoryImpl.prototype.newMeasureHelpMetadataSelector = function()
{
	return oFF.QMeasureHelpMetadataSelector.createMeasureHelpMetadataSelector();
};
oFF.QFactoryImpl.prototype.newFormulaIteration = function(context)
{
	return oFF.QFormulaIteration._createFormulaIteration(context, null);
};
oFF.QFactoryImpl.prototype.newFormulaIterationDimension = function(context)
{
	return oFF.QFormulaIterationDimension._createFormulaIterationDimension(context, null);
};
oFF.QFactoryImpl.prototype.newMeasureHelpNode = function(name, measure)
{
	return oFF.QMeasureHelpNode.createMeasureHelpNode(name, measure);
};
oFF.QFactoryImpl.prototype.newLovProcess = function(queryManager, lovProcessConfig)
{
	return oFF.LovProcess.create(queryManager, lovProcessConfig);
};
oFF.QFactoryImpl.prototype.newRequestSettings = function(offset, windowSize, isHierarchyShot)
{
	return oFF.QRequestSettings.create(offset, windowSize, isHierarchyShot);
};
oFF.QFactoryImpl.prototype.newValueHelpNode = function(valueHelp, parentNode, member, displayLevel, absoluteLevel)
{
	return oFF.QValueHelpNode.create(valueHelp, parentNode, member, displayLevel, absoluteLevel);
};
oFF.QFactoryImpl.prototype.newHierarchyCatalogResult = function()
{
	return oFF.HierarchyCatalogResult.create();
};
oFF.QFactoryImpl.prototype.newHierarchyCatalogManager = function(queryManager, dataSource, dimensionName, dimensionQueryModel)
{
	return oFF.HierarchyCatalogManager.create(queryManager, dataSource, dimensionName, dimensionQueryModel);
};
oFF.QFactoryImpl.prototype.newCacheKeyWithDataSource = function(context, systemName, dataSource, providerType, key1, key2, validationHash, dimensionGroupNames)
{
	var tmpDataSrc = oFF.QDataSource.create();
	tmpDataSrc.setFullQualifiedName(dataSource);
	var dataSourceHashKey = tmpDataSrc.getCacheKeyName();
	var newObj = oFF.QCacheKey.createExt(context, systemName, dataSourceHashKey, providerType, key1, key2, validationHash, dimensionGroupNames);
	var olapEnv = context.getOlapEnv();
	var cubeContainer = olapEnv.getCubeContainer(newObj);
	if (cubeContainer.getDataSource() === null)
	{
		cubeContainer.setDataSource(tmpDataSrc);
	}
	return newObj;
};
oFF.QFactoryImpl.prototype.newCacheKey = function(context, systemName, dataSourceHashKey, providerType, key1, key2, validationHash, dimensionGroupNames)
{
	return oFF.QCacheKey.createExt(context, systemName, dataSourceHashKey, providerType, key1, key2, validationHash, dimensionGroupNames);
};
oFF.QFactoryImpl.prototype.newCacheKeyForField = function(context, fieldName, dimensionName)
{
	return oFF.QCacheKey.createByContextForField(context, fieldName, dimensionName);
};
oFF.QFactoryImpl.prototype.newCacheKeyByContext = function(context)
{
	return oFF.QCacheKey.createByContext(context);
};
oFF.QFactoryImpl.prototype.newVariableVariant = function(dataSource, name, text, scope)
{
	return oFF.QVariableVariant.createVariantWithScope(dataSource, name, text, scope);
};
oFF.QFactoryImpl.prototype.newCustomVariableConfig = function(queryManager)
{
	return oFF.QCustomVariableConfig.createConfig(queryManager);
};
oFF.QFactoryImpl.prototype.newFormulaInverseFormula = function(context)
{
	return oFF.QFormulaInverseFormula.createInverseFormula(context, null, null, null, null);
};
oFF.QFactoryImpl.prototype.newRsDefStructureMemberProperties = function(placeholderAliasMappings, minimumDrillStateMap, unsatisfiedRequiredDimensionNames, availableFormulaExceptionIds, outOfContextMembers)
{
	return oFF.RsDefStructureMemberProperties.create(placeholderAliasMappings, minimumDrillStateMap, unsatisfiedRequiredDimensionNames, availableFormulaExceptionIds, outOfContextMembers);
};
oFF.QFactoryImpl.prototype.newCellContext = function(context, name)
{
	var parent = null;
	if (oFF.notNull(context) && context.getQueryModel() !== null)
	{
		parent = context.getQueryModel().getCellContextManager();
	}
	return oFF.QCellContext._create(context, name, parent);
};
oFF.QFactoryImpl.prototype.newBlendableMeasureSort = function(context)
{
	return oFF.BlendableMeasureMemberSort.createBlendableMeasureSort(context);
};
oFF.QFactoryImpl.prototype.newDocumentIdManager = function(queryManager)
{
	return oFF.RsDocumentIdManager.create(queryManager);
};
oFF.QFactoryImpl.prototype.newCellIndexInfo = function()
{
	return oFF.RsCellIndexInfo.create();
};

oFF.RuntimeQuery = function() {};
oFF.RuntimeQuery.prototype = new oFF.XObject();
oFF.RuntimeQuery.prototype._ff_c = "RuntimeQuery";

oFF.RuntimeQuery.create = function(batch, queryManager)
{
	var session = null;
	if (oFF.notNull(queryManager))
	{
		session = queryManager.getSession();
	}
	return oFF.RuntimeQuery.createExt(batch, queryManager, session);
};
oFF.RuntimeQuery.createExt = function(batch, queryManager, session)
{
	var mainQuery = null;
	if (oFF.notNull(batch) && batch.hasElements())
	{
		var inaMainQuery = batch.getStructureAt(batch.size() - 1);
		mainQuery = oFF.RuntimeQuery.createQuery(session, oFF.RuntimeQuery._getSystemName(queryManager, inaMainQuery), null, inaMainQuery, oFF.RuntimeQuery._getLanguage(queryManager));
		mainQuery.setupPreQueries(session, batch, queryManager, inaMainQuery);
	}
	return mainQuery;
};
oFF.RuntimeQuery._getLanguage = function(queryManager)
{
	if (oFF.isNull(queryManager))
	{
		return null;
	}
	return queryManager.getSystemDescription().getLanguage();
};
oFF.RuntimeQuery._getSystemName = function(queryManager, inaMainQuery)
{
	var systemName = oFF.InARuntimeUtils.getSystemNameFromRequest(inaMainQuery);
	if (oFF.isNull(systemName) && oFF.notNull(queryManager))
	{
		systemName = queryManager.getSystemName();
	}
	return systemName;
};
oFF.RuntimeQuery.createQuery = function(session, systemName, mainQuery, inaRequest, language)
{
	var runtimeQuery = new oFF.RuntimeQuery();
	runtimeQuery.m_preQueries = oFF.XList.create();
	runtimeQuery.m_mainQuery = mainQuery;
	oFF.InARuntimeUtils.setLanguage(inaRequest, language);
	runtimeQuery.m_queryforLocal = inaRequest;
	runtimeQuery.m_systemName = systemName;
	runtimeQuery.m_session = session;
	return runtimeQuery;
};
oFF.RuntimeQuery.prototype.m_session = null;
oFF.RuntimeQuery.prototype.m_mainQuery = null;
oFF.RuntimeQuery.prototype.m_systemName = null;
oFF.RuntimeQuery.prototype.m_persistencyIdentifier = null;
oFF.RuntimeQuery.prototype.m_preQueries = null;
oFF.RuntimeQuery.prototype.m_queryForRemote = null;
oFF.RuntimeQuery.prototype.m_queryforLocal = null;
oFF.RuntimeQuery.prototype.m_isProcessed = false;
oFF.RuntimeQuery.prototype.m_validMapping = false;
oFF.RuntimeQuery.prototype.generateRemoteQuery = function(queryManager)
{
	var messageManager = oFF.MessageManagerSimple.createMessageManager();
	if (!this.isRemotePreQuery())
	{
		messageManager.addInfo(oFF.ErrorCodes.OTHER_ERROR, "Query is local, nothing to do");
		return oFF.ExtResult.create(null, messageManager);
	}
	var systemLandscape = queryManager.getApplication().getSystemLandscape();
	var remoteSystemDescription = systemLandscape.getSystemDescription(this.m_systemName);
	if (oFF.isNull(remoteSystemDescription))
	{
		messageManager.addError(oFF.ErrorCodes.INVALID_SYSTEM, oFF.XStringUtils.concatenate3("No matching system for name '", this.m_systemName, "' is available"));
		return oFF.ExtResult.create(null, messageManager);
	}
	var mainSystemDescription = systemLandscape.getSystemDescription(this.m_mainQuery.getSystemName());
	var systemMapping = mainSystemDescription.getSystemMapping(this.m_systemName);
	if (oFF.isNull(systemMapping) || !mainSystemDescription.isSystemMappingValid(remoteSystemDescription))
	{
		this.generateBrowserBased(messageManager);
	}
	else
	{
		this.generateSdi(mainSystemDescription, systemMapping);
	}
	this.m_isProcessed = true;
	return oFF.ExtResult.create(this.m_queryForRemote, messageManager);
};
oFF.RuntimeQuery.prototype.generateBrowserBased = function(messageManager)
{
	messageManager.addInfo(oFF.ErrorCodes.OTHER_ERROR, oFF.XStringUtils.concatenate5("No valid system mapping is defined for '", this.m_systemName, "' and '", this.m_mainQuery.getSystemName(), "'. Defaulting to browser-based blending"));
	var inaDataSource = oFF.InARuntimeUtils.getDataSourceFromRequest(this.m_queryforLocal);
	inaDataSource.remove("System");
	this.m_queryForRemote = oFF.PrUtils.createDeepCopy(this.m_queryforLocal);
	var inaRemoteContext = oFF.InARuntimeUtils.getRequestContext(this.m_queryForRemote);
	oFF.InARuntimeUtils.setPersistencyForRemote(inaRemoteContext, null);
	var request = oFF.InARuntimeUtils.getHashableRequest(inaRemoteContext);
	this.m_persistencyIdentifier = oFF.XSha1.createSHA1(request);
	inaDataSource.putString("Type", "SerializedData");
};
oFF.RuntimeQuery.prototype.generateSdi = function(mainSystemDescription, systemMapping)
{
	this.m_validMapping = true;
	var inaDataSource = oFF.InARuntimeUtils.getDataSourceFromRequest(this.m_queryforLocal);
	inaDataSource.remove("System");
	this.m_queryForRemote = oFF.PrUtils.createDeepCopy(this.m_queryforLocal);
	var inaRemoteContext = oFF.InARuntimeUtils.getRequestContext(this.m_queryForRemote);
	oFF.InARuntimeUtils.setPersistencyForRemote(inaRemoteContext, systemMapping);
	var request = oFF.InARuntimeUtils.getHashableRequest(inaRemoteContext);
	this.m_persistencyIdentifier = oFF.BlendingSource.createPersistenceIdentifierByRequest2(this.m_session, request, mainSystemDescription, null);
	oFF.InARuntimeUtils.setPersistencyIdentifier(inaRemoteContext, this.m_persistencyIdentifier);
	oFF.InARuntimeUtils.setPersistencyForLocal(inaDataSource, this.m_persistencyIdentifier, systemMapping);
};
oFF.RuntimeQuery.prototype.setupPreQueries = function(session, batch, queryManager, request)
{
	var dataSource = oFF.InARuntimeUtils.getDataSourceFromRequest(request);
	if (oFF.notNull(dataSource))
	{
		var blendingSources = dataSource.getListByKey("Sources");
		if (oFF.notNull(blendingSources))
		{
			var sizeSources = blendingSources.size();
			for (var idxSource = 0; idxSource < sizeSources; idxSource++)
			{
				var blendingSource = blendingSources.getStructureAt(idxSource);
				var blendingContext = blendingSource.getStructureByKey("DefiningContext");
				this.setupPreQueries(session, batch, queryManager, blendingContext);
			}
		}
		var inaDimensions = oFF.InARuntimeUtils.getDimensionsListFromRequest(request);
		var sizeDimensions = inaDimensions.size();
		var preQueryNames = oFF.XHashSetOfString.create();
		for (var idxDimension = 0; idxDimension < sizeDimensions; idxDimension++)
		{
			var inaDimension = inaDimensions.getStructureAt(idxDimension);
			var preQueryName = oFF.InARuntimeUtils.getObjectNameFromDimensionDataSource(inaDimension);
			if (oFF.isNull(preQueryName) || preQueryNames.contains(preQueryName))
			{
				continue;
			}
			preQueryNames.add(preQueryName);
			var preQueryRequest = this.getPreQueryRequest(batch, preQueryName);
			if (oFF.isNull(preQueryRequest))
			{
				continue;
			}
			var preQuery = oFF.RuntimeQuery.createQuery(session, oFF.RuntimeQuery._getSystemName(queryManager, preQueryRequest), this, preQueryRequest, oFF.RuntimeQuery._getLanguage(queryManager));
			preQuery.setupPreQueries(session, batch, queryManager, preQueryRequest);
			this.m_preQueries.add(preQuery);
		}
	}
};
oFF.RuntimeQuery.prototype.getPreQueryRequest = function(batch, preQueryName)
{
	var size = batch.size() - 1;
	for (var i = 0; i < size; i++)
	{
		var query = batch.getStructureAt(i);
		var context = oFF.InARuntimeUtils.getRequestContext(query);
		var queryNameFromContext = oFF.InARuntimeUtils.getQueryNameFromContext(context);
		if (oFF.XString.isEqual(queryNameFromContext, preQueryName))
		{
			return query;
		}
	}
	return null;
};
oFF.RuntimeQuery.prototype.releaseObject = function()
{
	this.m_systemName = null;
	this.m_persistencyIdentifier = null;
	oFF.XObjectExt.release(this.m_preQueries);
	this.m_queryforLocal = null;
	this.m_queryForRemote = null;
	this.m_mainQuery = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.RuntimeQuery.prototype.getPreQueries = function()
{
	return this.m_preQueries;
};
oFF.RuntimeQuery.prototype.getQueryForLocal = function()
{
	return this.m_queryforLocal;
};
oFF.RuntimeQuery.prototype.getMainQuery = function()
{
	return this.m_mainQuery;
};
oFF.RuntimeQuery.prototype.isRemotePreQuery = function()
{
	if (oFF.isNull(this.m_mainQuery))
	{
		return false;
	}
	return !oFF.XString.isEqual(this.m_systemName, this.m_mainQuery.getSystemName());
};
oFF.RuntimeQuery.prototype.getSystemName = function()
{
	return this.m_systemName;
};
oFF.RuntimeQuery.prototype.isProcessed = function()
{
	return this.m_isProcessed;
};
oFF.RuntimeQuery.prototype.setBrowserBasedPersistency = function(cube, view)
{
	var dataSource = oFF.InARuntimeUtils.getDataSourceFromRequest(this.m_queryforLocal);
	if (oFF.notNull(dataSource))
	{
		dataSource.remove("SchemaName");
		dataSource.remove("PackageName");
		dataSource.remove("ObjectName");
		var serializedData = dataSource.putNewStructure("SerializedData");
		serializedData.putString("Cube", cube);
		serializedData.putString("View", view);
	}
};
oFF.RuntimeQuery.prototype.isSdiRemote = function()
{
	return this.isRemotePreQuery() && this.m_validMapping;
};
oFF.RuntimeQuery.prototype.getPersistencyIdentifier = function()
{
	return this.m_persistencyIdentifier;
};

oFF.ModelDimensionLinksManagerHelper = function() {};
oFF.ModelDimensionLinksManagerHelper.prototype = new oFF.XObjectExt();
oFF.ModelDimensionLinksManagerHelper.prototype._ff_c = "ModelDimensionLinksManagerHelper";

oFF.ModelDimensionLinksManagerHelper.findModelDimensionLinksByDatasetIds = function(firstDatasetId, secondDatasetId, modelDimensionLinksList)
{
	var matchingDimensionlinks = null;
	if (oFF.notNull(modelDimensionLinksList))
	{
		var modelDimensionLinksListIter = modelDimensionLinksList.getIterator();
		while (modelDimensionLinksListIter.hasNext())
		{
			var modelDimensionLinks = modelDimensionLinksListIter.next();
			if (oFF.XString.isEqual(firstDatasetId, modelDimensionLinks.getFirstDatasetId()) && oFF.XString.isEqual(secondDatasetId, modelDimensionLinks.getSecondDatasetId()) || oFF.XString.isEqual(secondDatasetId, modelDimensionLinks.getFirstDatasetId()) && oFF.XString.isEqual(firstDatasetId, modelDimensionLinks.getSecondDatasetId()))
			{
				matchingDimensionlinks = modelDimensionLinks;
				break;
			}
		}
	}
	return matchingDimensionlinks;
};

oFF.QFilterAcrossModelsLovCacheManager = function() {};
oFF.QFilterAcrossModelsLovCacheManager.prototype = new oFF.XObjectExt();
oFF.QFilterAcrossModelsLovCacheManager.prototype._ff_c = "QFilterAcrossModelsLovCacheManager";

oFF.QFilterAcrossModelsLovCacheManager.create = function()
{
	var lovManager = new oFF.QFilterAcrossModelsLovCacheManager();
	lovManager.m_resultSetCache = oFF.QCache.create(null);
	lovManager.m_valueHelpCache = oFF.QCache.create(null);
	lovManager.m_datasetIdToCacheKeys = oFF.XHashMapByString.create();
	return lovManager;
};
oFF.QFilterAcrossModelsLovCacheManager.prototype.m_resultSetCache = null;
oFF.QFilterAcrossModelsLovCacheManager.prototype.m_valueHelpCache = null;
oFF.QFilterAcrossModelsLovCacheManager.prototype.m_datasetIdToCacheKeys = null;
oFF.QFilterAcrossModelsLovCacheManager.prototype.putResultSetEntry = function(key, resultSetAction)
{
	resultSetAction.attachListener(this, oFF.ListenerType.SYNC_LISTENER, oFF.XPairOfString.create("resultSet", key));
	this.m_resultSetCache.put(key, resultSetAction);
	this.addDatasetIdCacheKey(resultSetAction.getDatasetId(), key);
};
oFF.QFilterAcrossModelsLovCacheManager.prototype.addDatasetIdCacheKey = function(datasetId, cacheKey)
{
	if (oFF.notNull(datasetId))
	{
		if (!this.m_datasetIdToCacheKeys.containsKey(datasetId))
		{
			this.m_datasetIdToCacheKeys.put(datasetId, oFF.XHashSetOfString.create());
		}
		this.m_datasetIdToCacheKeys.getByKey(datasetId).add(cacheKey);
	}
};
oFF.QFilterAcrossModelsLovCacheManager.prototype.getResultSetEntry = function(key)
{
	return this.m_resultSetCache.useEntry(key);
};
oFF.QFilterAcrossModelsLovCacheManager.prototype.containsResultSetEntry = function(key)
{
	return this.m_resultSetCache.containsKey(key);
};
oFF.QFilterAcrossModelsLovCacheManager.prototype.removeResultSetEntry = function(key)
{
	this.m_resultSetCache.freeEntry(key);
};
oFF.QFilterAcrossModelsLovCacheManager.prototype.putValueHelpEntry = function(key, valueHelpAction)
{
	valueHelpAction.attachListener(this, oFF.ListenerType.SYNC_LISTENER, oFF.XPairOfString.create("valueHelp", key));
	this.m_valueHelpCache.put(key, valueHelpAction);
	this.addDatasetIdCacheKey(valueHelpAction.getDatasetId(), key);
};
oFF.QFilterAcrossModelsLovCacheManager.prototype.getValueHelpEntry = function(key)
{
	return this.m_valueHelpCache.useEntry(key);
};
oFF.QFilterAcrossModelsLovCacheManager.prototype.containsValueHelpEntry = function(key)
{
	return this.m_valueHelpCache.containsKey(key);
};
oFF.QFilterAcrossModelsLovCacheManager.prototype.removeValueHelpEntry = function(key)
{
	this.m_valueHelpCache.freeEntry(key);
};
oFF.QFilterAcrossModelsLovCacheManager.prototype.releaseObject = function()
{
	this.m_resultSetCache = oFF.XObjectExt.release(this.m_resultSetCache);
	this.m_valueHelpCache = oFF.XObjectExt.release(this.m_valueHelpCache);
	this.m_datasetIdToCacheKeys = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_datasetIdToCacheKeys);
	oFF.XObjectExt.prototype.releaseObject.call( this );
};
oFF.QFilterAcrossModelsLovCacheManager.prototype.onSynchronized = function(messages, data, customIdentifier)
{
	if (oFF.notNull(data))
	{
		var typeAndKey = customIdentifier;
		if (oFF.XString.isEqual(typeAndKey.getFirstString(), "resultSet"))
		{
			var queryManager = data.getQueryManager();
			queryManager.setActiveResultSetContainer(null);
		}
	}
};
oFF.QFilterAcrossModelsLovCacheManager.prototype.clearCache = function()
{
	oFF.XObjectExt.release(this.m_resultSetCache);
	oFF.XObjectExt.release(this.m_valueHelpCache);
	this.m_datasetIdToCacheKeys = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_datasetIdToCacheKeys);
	this.m_resultSetCache = oFF.QCache.create(null);
	this.m_valueHelpCache = oFF.QCache.create(null);
	this.m_datasetIdToCacheKeys = oFF.XHashMapByString.create();
};
oFF.QFilterAcrossModelsLovCacheManager.prototype.clearCacheByDatasetId = function(datasetId)
{
	var cacheKeys = this.m_datasetIdToCacheKeys.getByKey(datasetId);
	if (oFF.notNull(cacheKeys))
	{
		var iterator = cacheKeys.getIterator();
		while (iterator.hasNext())
		{
			var cacheKey = iterator.next();
			if (this.m_resultSetCache.containsKey(cacheKey))
			{
				oFF.XObjectExt.release(this.m_resultSetCache.remove(cacheKey));
			}
			if (this.m_valueHelpCache.containsKey(cacheKey))
			{
				oFF.XObjectExt.release(this.m_valueHelpCache.remove(cacheKey));
			}
		}
		oFF.XObjectExt.release(cacheKeys);
		this.m_datasetIdToCacheKeys.remove(datasetId);
	}
};

oFF.ModCounterState = function() {};
oFF.ModCounterState.prototype = new oFF.XObjectExt();
oFF.ModCounterState.prototype._ff_c = "ModCounterState";

oFF.ModCounterState.create = function(queryManager)
{
	var modCounterState = new oFF.ModCounterState();
	modCounterState.m_queryManager = queryManager;
	return modCounterState;
};
oFF.ModCounterState.prototype.m_queryManager = null;
oFF.ModCounterState.prototype.getDimensionInDrillModCounters = function()
{
	var dimensionModCounters = oFF.XList.create();
	var leafQMIter = this.getLeafQueryManagers().getIterator();
	while (leafQMIter.hasNext())
	{
		var queryManager = leafQMIter.next();
		var dimensionsUsed = oFF.XList.create();
		dimensionsUsed.addAll(queryManager.getQueryModel().getAxis(oFF.AxisType.ROWS));
		dimensionsUsed.addAll(queryManager.getQueryModel().getAxis(oFF.AxisType.COLUMNS));
		oFF.XCollectionUtils.forEach(dimensionsUsed,  function(dimension){
			dimensionModCounters.add(oFF.XPair.create(dimension, oFF.XIntegerValue.create(dimension.getModCounter())));
		}.bind(this));
	}
	return dimensionModCounters;
};
oFF.ModCounterState.prototype.getVarianceModCounters = function()
{
	var varianceModCounters = oFF.XList.create();
	var leafQMIter = this.getLeafQueryManagers().getIterator();
	while (leafQMIter.hasNext())
	{
		var queryManager = leafQMIter.next();
		if (queryManager.getQueryModel().getPrimaryCalculationDimension() !== null)
		{
			var loadedStructureMembers = queryManager.getQueryModel().getPrimaryCalculationDimension().getLoadedStructureMembers().getValuesAsReadOnlyList();
			for (var i = 0; i < loadedStructureMembers.size(); i++)
			{
				var loadedStructureMember = loadedStructureMembers.get(i);
				if (loadedStructureMember.getMemberType() === oFF.MemberType.VARIANCE)
				{
					varianceModCounters.add(oFF.XPair.create(loadedStructureMember, oFF.XIntegerValue.create(loadedStructureMember.getModCounter())));
				}
			}
		}
	}
	return varianceModCounters;
};
oFF.ModCounterState.prototype.getThresholdModCounters = function()
{
	var formulaExceptionCounters = oFF.XList.create();
	var leafQMIter = this.getLeafQueryManagers().getIterator();
	while (leafQMIter.hasNext())
	{
		var queryManager = leafQMIter.next();
		var formulaExceptions = queryManager.getQueryModel().getFormulaExceptionManager().getValuesAsReadOnlyList();
		for (var i = 0; i < formulaExceptions.size(); i++)
		{
			var formulaException = formulaExceptions.get(i);
			formulaExceptionCounters.add(oFF.XPair.create(formulaException, oFF.XIntegerValue.create(formulaException.getModCounter())));
		}
	}
	return formulaExceptionCounters;
};
oFF.ModCounterState.prototype.getLeafQueryManagers = function()
{
	var allQueryManagers = oFF.XList.create();
	if (this.m_queryManager.getOlapComponentType() === oFF.OlapComponentType.BLENDABLE_QUERY_MANAGER)
	{
		allQueryManagers.addAll(this.m_queryManager.getAllQueryManagers());
	}
	else
	{
		allQueryManagers.add(this.m_queryManager);
	}
	return allQueryManagers;
};
oFF.ModCounterState.prototype.getQueryModelModCounter = function()
{
	var modCounter = 0;
	if (this.m_queryManager.getOlapComponentType() === oFF.OlapComponentType.BLENDABLE_QUERY_MANAGER)
	{
		modCounter = this.m_queryManager.getModCounter();
	}
	else
	{
		modCounter = this.m_queryManager.getQueryModel().getModCounter();
	}
	return modCounter;
};
oFF.ModCounterState.prototype.getFilterModCounter = function()
{
	var leafQMIter = this.getLeafQueryManagers().getIterator();
	var modCounter = 0;
	while (leafQMIter.hasNext())
	{
		var queryManager = leafQMIter.next();
		modCounter = modCounter + queryManager.getQueryModel().getFilter().getModCounter();
	}
	return modCounter;
};
oFF.ModCounterState.prototype.getDrillManagerModCounter = function()
{
	var leafQMIter = this.getLeafQueryManagers().getIterator();
	var modCounter = 0;
	while (leafQMIter.hasNext())
	{
		var queryManager = leafQMIter.next();
		modCounter = modCounter + queryManager.getDrillManager().getModCounter();
	}
	return modCounter;
};
oFF.ModCounterState.prototype.getSortingModCounter = function()
{
	var modCounter = 0;
	if (this.m_queryManager.getOlapComponentType() === oFF.OlapComponentType.BLENDABLE_QUERY_MANAGER)
	{
		var blendableQueryManager = this.m_queryManager;
		modCounter = blendableQueryManager.getSortingContainer().getModCounter();
	}
	else
	{
		modCounter = this.m_queryManager.getQueryModel().getSortingManager().getModCounter();
	}
	return modCounter;
};
oFF.ModCounterState.prototype.getRankingsModCounter = function()
{
	var modCounter = 0;
	if (this.m_queryManager.getOlapComponentType() === oFF.OlapComponentType.BLENDABLE_QUERY_MANAGER)
	{
		modCounter = this.m_queryManager.getRankSettings().getModCounter();
	}
	else if (this.m_queryManager.getQueryModel().getConditionManager() !== null)
	{
		modCounter = this.m_queryManager.getQueryModel().getConditionManager().getModCounter();
	}
	return modCounter;
};
oFF.ModCounterState.prototype.getAxisModCounter = function(axisType)
{
	var leafQMIter = this.getLeafQueryManagers().getIterator();
	var modCounter = 0;
	while (leafQMIter.hasNext())
	{
		var queryManager = leafQMIter.next();
		modCounter = modCounter + queryManager.getQueryModel().getAxis(axisType).getModCounter();
	}
	return modCounter;
};
oFF.ModCounterState.prototype.getPrimaryMeasureFilterModCounter = function()
{
	var leafQMIter = this.getLeafQueryManagers().getIterator();
	var modCounter = 0;
	while (leafQMIter.hasNext())
	{
		var queryManager = leafQMIter.next();
		if (queryManager.getQueryModel().getPrimaryCalculationDimension() !== null && queryManager.getQueryModel().getPrimaryCalculationDimension().getFilter() !== null)
		{
			modCounter = modCounter + queryManager.getQueryModel().getPrimaryCalculationDimension().getFilter().getModCounter();
		}
	}
	return modCounter;
};
oFF.ModCounterState.prototype.getPrimaryCalculationDimensionModCounter = function()
{
	var leafQMIter = this.getLeafQueryManagers().getIterator();
	var modCounter = 0;
	while (leafQMIter.hasNext())
	{
		var queryManager = leafQMIter.next();
		if (queryManager.getQueryModel().getPrimaryCalculationDimension() !== null)
		{
			modCounter = modCounter + queryManager.getQueryModel().getPrimaryCalculationDimension().getModCounter();
		}
	}
	if (this.m_queryManager.getOlapComponentType() === oFF.OlapComponentType.BLENDABLE_QUERY_MANAGER)
	{
		modCounter = modCounter + this.m_queryManager.getPrimaryBlendedMeasures().getModCounter();
	}
	return modCounter;
};
oFF.ModCounterState.prototype.getSecondaryMeasureFilterModCounter = function()
{
	var leafQMIter = this.getLeafQueryManagers().getIterator();
	var modCounter = 0;
	while (leafQMIter.hasNext())
	{
		var queryManager = leafQMIter.next();
		if (queryManager.getQueryModel().getSecondaryCalculationDimension() !== null && queryManager.getQueryModel().getSecondaryCalculationDimension().getFilter() !== null)
		{
			modCounter = modCounter + queryManager.getQueryModel().getSecondaryCalculationDimension().getFilter().getModCounter();
		}
	}
	return modCounter;
};
oFF.ModCounterState.prototype.getSecondaryCalculationDimensionModCounter = function()
{
	var leafQMIter = this.getLeafQueryManagers().getIterator();
	var modCounter = 0;
	while (leafQMIter.hasNext())
	{
		var queryManager = leafQMIter.next();
		if (queryManager.getQueryModel().getSecondaryCalculationDimension() !== null)
		{
			modCounter = modCounter + queryManager.getQueryModel().getSecondaryCalculationDimension().getModCounter();
		}
	}
	return modCounter;
};
oFF.ModCounterState.prototype.getVariableManagerModCounter = function()
{
	var leafQMIter = this.getLeafQueryManagers().getIterator();
	var modCounter = 0;
	while (leafQMIter.hasNext())
	{
		var queryManager = leafQMIter.next();
		modCounter = modCounter + queryManager.getQueryModel().getVariableManager().getModCounter();
	}
	return modCounter;
};
oFF.ModCounterState.prototype.getCurrencyTranslationModCounter = function()
{
	var leafQMIter = this.getLeafQueryManagers().getIterator();
	var modCounter = 0;
	while (leafQMIter.hasNext())
	{
		var queryManager = leafQMIter.next();
		if (queryManager.getQueryModel().getCurrencyTranslationManager() !== null)
		{
			modCounter = modCounter + queryManager.getQueryModel().getCurrencyTranslationManager().getModCounter();
		}
	}
	return modCounter;
};
oFF.ModCounterState.prototype.getQueryModelLinksModCounter = function()
{
	var modCounter = 0;
	if (this.m_queryManager.getOlapComponentType() === oFF.OlapComponentType.BLENDABLE_QUERY_MANAGER)
	{
		modCounter = modCounter + this.m_queryManager.getAllQueryModelLinkSettings().getModCounter();
	}
	return modCounter;
};

oFF.QueryModelStateManager = function() {};
oFF.QueryModelStateManager.prototype = new oFF.XObjectExt();
oFF.QueryModelStateManager.prototype._ff_c = "QueryModelStateManager";

oFF.QueryModelStateManager.create = function(queryManager)
{
	var manager = new oFF.QueryModelStateManager();
	manager.m_queryManager = queryManager;
	manager.m_stateCache = oFF.XLinkedMap.createLinkedMap();
	manager.m_jsonParser = oFF.JsonParserFactory.newInstance();
	return manager;
};
oFF.QueryModelStateManager.prototype.m_queryManager = null;
oFF.QueryModelStateManager.prototype.m_stateCache = null;
oFF.QueryModelStateManager.prototype.m_jsonParser = null;
oFF.QueryModelStateManager.prototype.releaseObject = function()
{
	this.m_stateCache = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_stateCache);
	this.m_queryManager = null;
	this.m_jsonParser = oFF.XObjectExt.release(this.m_jsonParser);
	oFF.XObjectExt.prototype.releaseObject.call( this );
};
oFF.QueryModelStateManager.prototype.recordState = function()
{
	var structure = oFF.PrFactory.createStructure();
	var queryManagerProvider = this.m_queryManager;
	queryManagerProvider.recordStateOfQueryManager(structure);
	var currentState = oFF.PrUtils.serialize(structure, true, false, 0);
	var stateId = oFF.XGuid.getGuid();
	this.m_stateCache.add(oFF.StateStackEntry.create(stateId, currentState));
	return stateId;
};
oFF.QueryModelStateManager.prototype.applyState = function(stateId)
{
	var stateStackEntry = this.m_stateCache.getByKey(stateId);
	if (oFF.isNull(stateStackEntry))
	{
		return oFF.ExtResult.createWithErrorMessage(oFF.XStringUtils.concatenate3("State Id ", stateId, " not found"));
	}
	var queryManagerState = stateStackEntry.getState();
	var element = this.m_jsonParser.parse(queryManagerState);
	if (this.m_jsonParser.hasErrors())
	{
		return oFF.ExtResult.create(null, this.m_jsonParser);
	}
	var definition = element.getStructureByKey("Analytics").getStructureByKey("Definition");
	var queryManagerProvider = this.m_queryManager;
	var result = queryManagerProvider.applyStateOnQueryManager(definition);
	return oFF.ExtResult.create(this.m_queryManager, result);
};

oFF.InACapabilitiesProvider = function() {};
oFF.InACapabilitiesProvider.prototype = new oFF.DfSessionContext();
oFF.InACapabilitiesProvider.prototype._ff_c = "InACapabilitiesProvider";

oFF.InACapabilitiesProvider.SAC_DEV_CAPABILITIES = null;
oFF.InACapabilitiesProvider.staticSetup = function()
{
	oFF.InACapabilitiesProvider.SAC_DEV_CAPABILITIES = oFF.CapabilityContainer.create("sacExceptions");
	oFF.InACapabilitiesProvider.SAC_DEV_CAPABILITIES.addCapability(oFF.InACapabilities.C178_MASTER_READ_MODE_BY_DIMENSION_GROUPING);
	oFF.InACapabilitiesProvider.SAC_DEV_CAPABILITIES.addCapability(oFF.InACapabilities.C187_DIMENSION_DEFAULT_MEMBER);
	oFF.InACapabilitiesProvider.SAC_DEV_CAPABILITIES.addCapability(oFF.InACapabilities.C189_DIMENSION_VISIBILITY);
	oFF.InACapabilitiesProvider.SAC_DEV_CAPABILITIES.addCapability(oFF.InACapabilities.C193_INA_MODEL_METADATA);
	oFF.InACapabilitiesProvider.SAC_DEV_CAPABILITIES.addCapability(oFF.InACapabilities.C194_METADATA_EXTENDED_DIMENSION_VISIBILITY);
	oFF.InACapabilitiesProvider.SAC_DEV_CAPABILITIES.addCapability(oFF.InACapabilities.C191_DYNAMIC_VARIABLES);
	oFF.InACapabilitiesProvider.SAC_DEV_CAPABILITIES.addCapability(oFF.InACapabilities.C192_VIRTUAL_DS_VARIABLE_VALUES);
	oFF.InACapabilitiesProvider.SAC_DEV_CAPABILITIES.addCapability(oFF.InACapabilities.C188_LOCALE_SORTING);
	oFF.InACapabilitiesProvider.SAC_DEV_CAPABILITIES.addCapability(oFF.InACapabilities.C212_SORT_NEW_VALUES);
	oFF.InACapabilitiesProvider.SAC_DEV_CAPABILITIES.addCapability(oFF.InACapabilities.C215_MEASURE_MEMBER_DEFINITION);
	oFF.InACapabilitiesProvider.SAC_DEV_CAPABILITIES.addCapability(oFF.InACapabilities.C216_MEASURE_MEMBER_DETAILS);
	oFF.InACapabilitiesProvider.SAC_DEV_CAPABILITIES.addCapability(oFF.InACapabilities.V210_DATASOURCE_TYPE_QUERY_METADATA);
	oFF.InACapabilitiesProvider.SAC_DEV_CAPABILITIES.addCapability(oFF.InACapabilities.V212_DATASOURCE_TYPE_QUERY);
};
oFF.InACapabilitiesProvider.create = function(session, serverMetadata, providerType, featureToggles)
{
	var inaCapabilities = new oFF.InACapabilitiesProvider();
	inaCapabilities.setupExt(session, serverMetadata, providerType, featureToggles);
	return inaCapabilities;
};
oFF.InACapabilitiesProvider.isDevCapabilityValid = function(capabilityName, session)
{
	return session.hasFeature(oFF.FeatureToggleOlap.DEVELOPMENT_MODE) || oFF.InACapabilitiesProvider.SAC_DEV_CAPABILITIES.containsKey(capabilityName);
};
oFF.InACapabilitiesProvider.importCapabilities = function(sysCapabilities, queryCapabilities)
{
	var systemType = queryCapabilities.getSystemType();
	var isBW = false;
	var isHana = false;
	var isBpcs = false;
	if (oFF.notNull(systemType))
	{
		isBW = systemType.isTypeOf(oFF.SystemType.BW);
		isHana = systemType.isTypeOf(oFF.SystemType.HANA);
		isBpcs = systemType.isTypeOf(oFF.SystemType.BPCS);
	}
	queryCapabilities.setSupportsServerState(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C009_STATEFUL_SERVER, isBW));
	queryCapabilities.setSupportsShutdown(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C010_STATEFUL_DATA_PROVIDER, isBW || isHana));
	queryCapabilities.setSupportsDirectVariableTransfer(!isBW);
	queryCapabilities.setSupportsCheckVariables(!isBW);
	queryCapabilities.setSupportsHierarchyCatalog(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.V322_HIERARCHY_CATALOG, false));
	queryCapabilities.setSupportsDataCellMixedValues(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C113_DATA_CELL_MIXED_VALUES, false));
	queryCapabilities.setSupportsCancelRunningQueries(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C117_CANCEL_RUNNING_REQUESTS, false));
	queryCapabilities.setSupportsObtainability(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C005_OBTAINABILITY, false));
	queryCapabilities.setSupportsCustomDimensionFilterCapability(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C123_CUSTOM_DIMENSION_FILTER, isBW));
	queryCapabilities.setSupportsRestrictedMeasures(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C119_RESTRICTED_KEYFIGURES, isHana));
	queryCapabilities.setSupportsFormulaMeasures(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C118_CALCULATED_KEYFIGURES, isHana));
	queryCapabilities.setSupportsCartesianFilterIntersect(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C150_CARTESIAN_FILTER_INTERSECT, false));
	queryCapabilities.setSupportsIntersectLayers(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C150_CARTESIAN_FILTER_INTERSECT, false));
	queryCapabilities.setSupportsCellValueOperand(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C060_CELL_VALUE_OPERAND, false));
	queryCapabilities.setSupportsComplexFilter(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C013_COMPLEX_FILTERS, false));
	queryCapabilities.setSupportsVisibilityFilter(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C059_VISIBILITY_FILTER, false));
	queryCapabilities.setSupportsSetOperand(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C011_SET_OPERAND, false));
	queryCapabilities.setSupportsConvertToFlatFilter(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C058_HIERARCHY_SELECTION_AS_FLAT_SELECTION, false));
	queryCapabilities.setSupportsCummulative(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C018_CUMMULATIVE, false));
	queryCapabilities.setSupportsHierarchyNavCounter(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C035_HIERARCHY_NAVIGATION_COUNTER, false));
	queryCapabilities.setSupportsHierarchyAttHierFields(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C036_ATTRIBUTE_HIERARCHY_HIERARCHY_FIELDS, false));
	queryCapabilities.setSupportsHierarchyCarryingDim(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C036_ATTRIBUTE_HIERARCHY_HIERARCHY_FIELDS, isBW || isBpcs));
	queryCapabilities.setSupportsSortTypes(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.SORT_TYPE, false));
	queryCapabilities.setSupportsSpatialFilter(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C061_SPATIAL_FILTER, false));
	queryCapabilities.setSupportsSapDate(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C017_SAP_DATE, isBW || isBpcs));
	queryCapabilities.setSupportsCustomDimensionMemberExecutionStep(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C055_CUSTOM_DIMENSION_MEMBER_EXECUTION_STEP, false));
	queryCapabilities.setSupportsSupplements(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C037_SUPPLEMENTS, false));
	queryCapabilities.setSupportsNumberAsString(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.V172_NUMBER_AS_STRING, false));
	if (queryCapabilities.supportsSpatialFilter())
	{
		queryCapabilities.setSupportsSpatialFilterSrid(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C062_SPATIAL_FILTER_WITH_SRID, false));
	}
	queryCapabilities.setSupportsComplexTupleFilter(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C200_COMPLEX_TUPLE_FILTER, false));
	queryCapabilities.setSupportsTuplesOperand(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.V216_TUPLES_OPERAND, false));
	queryCapabilities.setSupportsExtendedDimensions(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C067_EXTENDED_DIMENSIONS, false));
	queryCapabilities.setSupportsExtendedDimensionsFieldMapping(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C068_EXTENDED_DIMENSIONS_FIELD_MAPPING, false));
	queryCapabilities.setSupportsExtendedDimensionsJoinColumns(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C069_EXTENDED_DIMENSIONS_JOIN_COLUMNS, false));
	queryCapabilities.setSupportsExtendedDimensionsOuterJoin(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C070_EXTENDED_DIMENSIONS_OUTER_JOIN, false));
	queryCapabilities.setSupportsExtendedDimensionsSkip(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C071_EXTENDED_DIMENSIONS_SKIP, false));
	queryCapabilities.setSupportsExtendedDimensionsJoinCardinality(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C143_EXTENDED_DIMENSIONS_JOIN_CARDINALITY, false));
	queryCapabilities.setSupportsSortNewValues(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C212_SORT_NEW_VALUES, false));
	queryCapabilities.setSupportsIgnoreUnitOfZeroValueInAggregation(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C152_IGNORE_UNIT_OF_ZERO_VALUE_IN_AGGREGATION, false));
	queryCapabilities.setSupportsCubeBlendingWithNSubqueries(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.V214_CUBE_BLENDING_N_QUERIES, false));
	queryCapabilities.setSupportsRemoteBlendingWithSplittedSerializationRequests(oFF.InACapabilitiesProvider.supports(sysCapabilities, isBW ? oFF.InACapabilities.C182_CUBE_BLENDING_PERSISTENCE_TYPE : oFF.InACapabilities.C206_REMOTE_BLENDING_METADATA, false));
	queryCapabilities.setSupportsExtendedDimensionsChangeDefaultRenamingAndDescription(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C156_EXTENDED_DIMENSION_CHANGE_DEFAULT_RENAMING_AND_DESCRIPTION, false));
	queryCapabilities.setSupportsExtendedDimensionsCopyAllHierarchies(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C157_EXTENDED_DIMENSION_COPY_ALL_HIERARCHIES, false));
	queryCapabilities.setSupportsFixMetadataHierarchyAttributes(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C158_FIX_METADATA_HIERARCHY_ATTRIBUTES, false));
	queryCapabilities.setSupportsUniversalDisplayHierarchies(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C139_UNIVERSAL_DISPLAY_HIERARCHIES, false));
	queryCapabilities.setSupportsUniversalDisplayHierarchiesCustomDimensions(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C204_UNIVERSAL_DISPLAY_HIERARCHY_CUSTOM_DIM, false));
	queryCapabilities.setSupportsUniversalDisplayHierarchiesZeroBased(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.V158_UNIVERSAL_DISPLAY_HIERARCHY_ZERO_BASED, false));
	queryCapabilities.setSupportsRemoteBlending(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C093_REMOTE_BLENDING, false));
	queryCapabilities.setSupportsRemoteFilter(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C180_REMOTE_FILTER, false));
	queryCapabilities.setSupportsCubeCache(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.V166_CUBE_CACHE, false));
	queryCapabilities.setSupportsCatalogServiceV2(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C140_CATALOG_SERVICE_V20, false));
	queryCapabilities.setSupportsExtendedVariableDefinition(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C146_EXTENDED_VARIABLE_DEFINITION, false));
	queryCapabilities.setSupportsCustomSort(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C149_CUSTOM_SORT, false));
	queryCapabilities.setSupportsDataRefreshAndDataTopicality(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C145_DATA_REFRESH_AND_DATA_TOPICALITY, false));
	queryCapabilities.setSupportsRemoteBlendingBW(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C196_REMOTE_BLENDING_BW, false));
	queryCapabilities.setSupportsCustomMeasureSortOrder(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C148_CUSTOM_MEASURE_SORTORDER, false));
	queryCapabilities.setSupportsExceptionAggregationAvgNullSelectionMember(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C105_EXCEPTION_AGGREGATION_AVGNULL_SELECTION_MEMBER, false));
	queryCapabilities.setSupportsExceptionAggregationCountNullSelectionMember(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C106_EXCEPTION_AGGREGATION_COUNTNULL_SELECTION_MEMBER, false));
	queryCapabilities.setSupportsStatisticalAggregations(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C107_STATISTICAL_AGGREGATIONS, false));
	queryCapabilities.setSupportsF4FilterForTextField(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C186_F4_FILTER_FOR_TEXT_FIELD, false));
	queryCapabilities.setSupportsSidPresentation(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.V232_SID_PRESENTATION, false));
	queryCapabilities.setSupportsVarianceOperator(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C153_VARIANCE_OPERATOR, false));
	queryCapabilities.setSupportsTotalOperator(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C198_OPERATOR_TOTALS, false));
	queryCapabilities.setSupportsAsyncRemoteModelValidation(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C154_MD_DS_DEF_VAL_EXPOSE_DS, false));
	queryCapabilities.setSupportsExtendedKeyFigureProperties(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.V168_EXT_KEYFIGURE_PROPERTIES, false));
	queryCapabilities.setSupportsDetailedResponseExpansion(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C201_DETAILED_RESPONSE_EXPANSION, false));
	queryCapabilities.setSupportsDynamicVariableRefresh(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C192_VIRTUAL_DS_VARIABLE_VALUES, false));
	queryCapabilities.setSupportsQueryCurrencyTranslation(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C160_QUERY_CURRENCY_TRANSLATION, false));
	queryCapabilities.setSupportsStructureRestrictionsInValueHelp(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C161_STRUCTURE_RESTRICTIONS_IN_VALUE_HELP, false));
	queryCapabilities.setSupportsCustomHierarchy(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C202_CUSTOM_HIERARCHY, false));
	queryCapabilities.setSupportsSpatialChoropleth(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C165_SPATIAL_CHOROPLETH, false));
	queryCapabilities.setSupportsInaCurrentMember(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C166_INA_CURRENT_MEMBER, false));
	queryCapabilities.setSupportsDimensionDefaultMember(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C187_DIMENSION_DEFAULT_MEMBER, false));
	queryCapabilities.setSupportsDimensionVisibility(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C189_DIMENSION_VISIBILITY, false));
	queryCapabilities.setSupportsDisplayHierarchyFixInFilter(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.V186_DISP_HIERARCHY_FIX_IN_FILTER, false));
	queryCapabilities.setSupportsCustomMemberKeySortOrder(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C203_CUSTOM_MEMBER_KEY_SORT_ORDER, false));
	queryCapabilities.setSupportsSpatialTransformation(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C063_SPATIAL_TRANSFORMATIONS, false));
	queryCapabilities.setSupportsMemberVisibility(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C048_MEMBER_VISIBILITY, false));
	queryCapabilities.setSupportsHierarchyMetadata(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C052_METADATA_HIERARCHY_STRUCTURE, false));
	queryCapabilities.setSupportsDimensionHierarchyLevels(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C169_DIMENSION_HIERARCHY_LEVELS, false));
	queryCapabilities.setSupportsHierarchyLevelMetadata(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C053_METADATA_HIERARCHY_LEVELS, false));
	queryCapabilities.setSupportsCubeBlendingProperties(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C097_CUBE_BLENDING_PROPERTIES, false));
	queryCapabilities.setSupportsHierarchyNavigationDeltaMode(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C111_HIERARCHY_NAVIGATION_DELTA_MODE, false));
	queryCapabilities.setSupportsCeScenarioParams(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C127_CE_SCENARIO_PARAMS, false));
	queryCapabilities.setSupportsLocaleSorting(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C188_LOCALE_SORTING, false));
	queryCapabilities.setSupportsHierarchyLevelOffsetFilter(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C126_HIERARCHY_LEVEL_OFFSET_FILTER, false));
	queryCapabilities.setSupportsHierarchyTrapezoidFilter(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C065_HIERARCHY_TRAPEZOID_FILTER, false));
	queryCapabilities.setSupportsUnifiedDataCells(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C210_UNIFIED_DATA_CELLS, false));
	queryCapabilities.setSupportsAverageCountNullZero(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C124_AVERAGE_COUNT_IGNORE_NULL_ZERO, false));
	queryCapabilities.setSupportsCubeBlendingOutOfContext(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C096_CUBE_BLENDING_OUT_OF_CONTEXT, false));
	queryCapabilities.setSupportsExceptionsV2(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C159_EXCEPTIONS_V2, false));
	queryCapabilities.setSupportsSpatialClustering(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C064_SPATIAL_CLUSTERING, false));
	queryCapabilities.setSupportsKeepOriginalTexts(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C122_ORIGINAL_TEXTS, false));
	queryCapabilities.setSupportsConditions(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C101_CONDITIONS, false));
	queryCapabilities.setSupportsExtendedSort(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C054_EXTENDED_SORT, false));
	queryCapabilities.setSupportsDataCells(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C026_QUERY_DATA_CELLS, false));
	queryCapabilities.setSupportsExpandBottomUp(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C100_EXPAND_BOTTOM_UP, false));
	queryCapabilities.setSupportsIgnoreExternalDimensions(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C073_IGNORE_EXTERNAL_DIMENSIONS, false));
	queryCapabilities.setSupportsExceptionAggregationDimsFormulas(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C104_EXCEPTION_AGGREGATION_DIMENSIONS_AND_FORMULAS, false));
	queryCapabilities.setSupportsExceptionSettings(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C024_EXCEPTION_SETTINGS, false));
	queryCapabilities.setSupportsExceptions(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C023_EXCEPTIONS, false));
	queryCapabilities.setSupportsHierarchyVirtualRootNode(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C163_HIERARCHY_VIRTUAL_ROOT_NODE, false));
	queryCapabilities.setSupportsHierarchyRestNode(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C164_HIERARCHY_REST_NODE, false));
	queryCapabilities.setSupportsCubeBlending(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C091_CUBE_BLENDING, false));
	queryCapabilities.setSupportsMetadataDataCategory(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C099_METADATA_DATA_CATEGORY, false));
	queryCapabilities.setSupportsExtendedDimensionVisibility(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C194_METADATA_EXTENDED_DIMENSION_VISIBILITY, false));
	queryCapabilities.setSupportsResultSetUnitIndex(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C195_RESULTSET_UNIT_INDEX, false));
	queryCapabilities.setSupportsAsyncBatchRequests(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C162_ASYNC_METADATA_BATCH_REQUEST, false));
	queryCapabilities.setSupportsMetadataDataSourceDefinitionValidation(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C144_METADATA_DATASOURCE_DEFINITION_VALIDATION, false));
	queryCapabilities.setSupportsVariableVariants(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C135_VARIABLE_VARIANTS, false));
	queryCapabilities.setSupportsCalculatedDimensions(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C171_CALCULATED_DIMENSION, false));
	queryCapabilities.setSupportsZeroSuppression(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C045_ZERO_SUPPRESSION, false));
	queryCapabilities.setSupportsResultSetInterval(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C049_RESULTSET_INTERVAL, false));
	queryCapabilities.setSupportsFixHierarchyFlatKeys(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C181_FIX_HIERARCHY_FLAT_KEYS, false));
	queryCapabilities.setSupportsAttributeValueLookup(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C115_ATTRIBUTE_VALUE_LOOKUP, false));
	queryCapabilities.setSupportsAggregationNopNull(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C102_AGGREGATION_NOP_NULL, false));
	queryCapabilities.setSupportsAggregationNopNullZero(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C103_AGGREGATION_NOP_NULL_ZERO, false));
	queryCapabilities.setSupportsPlanningOnCalculatedDimensions(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C172_PLANNING_ON_CALCULATED_DIMENSION, false));
	queryCapabilities.setSupportsCustomDimension2(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C211_CUSTOM_DIMENSION_2, false));
	queryCapabilities.setSupportsCubeBlendingAggregation(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C092_CUBE_BLENDING_AGGREGATION, false));
	queryCapabilities.setSupportsWindowFunction(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.V218_WINDOW_FUNCTION, false));
	queryCapabilities.setSupportsMultipleExAggDimsInCalcPlan(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.V126_MULTIPLE_EX_AGG_DIMS_IN_CALC_PLAN, false));
	queryCapabilities.setSupportsSetOperandCurrentMemberSingleNavigation(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C222_SET_OPERAND_CURRENT_MEMBER_SINGLE_NAVIGATION, false));
	queryCapabilities.setSupportsHierarchyPathPresentationType(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.V294_HIERARCHY_PATH_PRESENTATION_TYPE, false));
	queryCapabilities.setSupportsDimensionKeyAttributes(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.V296_DIMENSION_KEY_ATTRIBUTES, false));
	queryCapabilities.setSupportsCurrentMemberFilterExtension(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C120_CURRENT_MEMBER_FILTER_EXTENSION, false));
	queryCapabilities.setSupportsClientInfo(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C155_CLIENT_INFO, false));
	queryCapabilities.setSupportsDynamicRestrictionOnFormula(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C197_DYN_RESTRICTION_ON_FORMULA, false));
	queryCapabilities.setSupportsVisualAggregation(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C176_VISUAL_AGGREGATION, false));
	queryCapabilities.setSupportsNamedCustomMember(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.V236_NAMED_CUSTOM_DIMENSION_MEMBER, false));
	queryCapabilities.setSupportsReinitVariables(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C002_VARIABLE_RE_SUBMIT, false));
	queryCapabilities.setSupportsMultiSource(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C047_MULTI_SOURCE, false));
	queryCapabilities.setSupportsRequestTimezone(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C174_REQUEST_TIME_ZONE, false));
	queryCapabilities.setSupportsVariableMasking(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C199_AV_CAPABILITY_VARIABLE_MASKING, false));
	queryCapabilities.setSupportsSuppressKeyfigureCalculation(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C151_SUPPRESS_KEYFIGURE_CALCULATION, false));
	queryCapabilities.setSupportsInputReadinessStates(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C147_INPUT_READINESS_STATES, false));
	queryCapabilities.setSupportsReturnedDataSelection(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C141_RETURNED_DATA_SELECTION, false));
	queryCapabilities.setSupportsRunAsUser(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C025_RUN_AS_USER, false));
	queryCapabilities.setSupportsVirtualDescription(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C214_IS_VIRTUAL_DESCRIPTION, false));
	queryCapabilities.setSupportsVersionParameters(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C183_GET_PARAMETERS, false));
	queryCapabilities.setSupportsVersionPrivileges(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C184_VERSION_PRIVILEGES, false));
	queryCapabilities.setSupportsMeasureMemberDefinition(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C215_MEASURE_MEMBER_DEFINITION, false));
	queryCapabilities.setSupportsMeasureMemberDetails(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C216_MEASURE_MEMBER_DETAILS, false));
	queryCapabilities.setSupportsMeasureMemberType(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C217_MEASURE_MEMBER_TYPE, false));
	queryCapabilities.setSupportsValueHelpWithAttributes(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C185_VALUE_HELP_WITH_ATTRIBUTES, !isBW));
	queryCapabilities.setSupportsEncodedResultset(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C012_ENCODED_RESULTSET, false));
	queryCapabilities.setSupportsNewValuesImplicitUnlock(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C020_NEW_VALUES_IMPLICIT_UNLOCK, false));
	queryCapabilities.setSupportsNewValuesExtendedFormat(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C021_NEW_VALUES_EXTENDED_FORMAT, false));
	queryCapabilities.setSupportsReportReportInterface(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C050_REPORT_REPORT_INTERFACE, false));
	queryCapabilities.setSupportsResultSetHierarchyLevel(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.V149_RESULTSET_HIERARCHY_LEVEL, false));
	queryCapabilities.setSupportsQueryDataCellModelDefaults(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.V174_QDATA_CELL_MODEL_DEFAULTS, false));
	queryCapabilities.setSupportsCubeBlendingSorting(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C095_CUBE_BLENDING_MEMBER_SORTING, false));
	queryCapabilities.setSupportsCubeBlendingReadmode(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C098_CUBE_BLENDING_READ_MODE, false));
	queryCapabilities.setSupportsCubeBlendingCustomMember(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C094_CUBE_BLENDING_CUSTOM_MEMBERS, false));
	var c51 = oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C051_HIERARCHY_PATH, false);
	queryCapabilities.setSupportsHierarchyPath(c51);
	var c56 = oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C056_HIERARCHY_PATH_UNIQUE_NAME, false);
	queryCapabilities.setSupportsUniqueHierarchyPath(c51 && c56);
	queryCapabilities.setSupportsUniversalModel(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C221_UNIVERSAL_MODEL, false));
	queryCapabilities.setSupportsCurrencyTranslation(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C218_CURRENCY_TRANSLATION, false));
	queryCapabilities.setSupportsMeasureMemberCurrencyTranslations(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C219_MEASURE_MEMBER_CURRENCY_TRANSLATIONS, false));
	queryCapabilities.setSupportsTechnicalAxis(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C042_TECHNICAL_AXIS, false));
	queryCapabilities.setSupportsResultsetEffectiveFilter(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C205_RESUlTSET_EFFECTIVE_FILTER, false));
	queryCapabilities.setSupportsBatchRsStreaming(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C207_BATCH_RS_STREAMING, false));
	queryCapabilities.setSupportsBatchBlendingRsStreaming(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.V308_ASYNC_BLENDING_BATCH_REQUEST, false));
	queryCapabilities.setSupportsCorrectDimensionDescription(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.V198_DIMENSION_DESCRIPTION, false));
	queryCapabilities.setSupportsRootOrphansAfterVisibilityFilter(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C213_ROOT_ORPHANS_AFTER_VISIBILITY_FILTER, false));
	queryCapabilities.setSupportsMetadataDimensionOthers(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.V224_METADATA_DIMENSION_OTHERS, false));
	queryCapabilities.setSupportsRSCellFormatTypeSpecific(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.V268_RESULTSET_CELL_FORMAT_TYPE_SPECIFIC, false));
	queryCapabilities.setSupportsSuppressSupplements(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.V230_SUPPRESS_SUPPLEMENTS, false));
	queryCapabilities.setSupportsAutoVariableSubmit(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.V286_AUTO_VARIABLE_SUBMIT, false));
	queryCapabilities.setSupportsExceptionAggregationFirstLastSelectionMember(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C208_EXCEPTION_AGGREGATION_FIRST_LAST_SELECTION_MEMBER, false));
	queryCapabilities.setSupportsResultSetCellExplain(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C209_RESULTSET_CELL_EXPLAIN, false));
	queryCapabilities.setSupportsMaintainsVariableVariants(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.V320_MAINTAINS_VARIABLE_VARIANTS, false));
	queryCapabilities.setSupportsNullZeroSuppression(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.V254_NULL_ZERO_SUPPRESSION, false));
	queryCapabilities.setSupportsInputReadinessWithNavigationalAttributes(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.V256_INPUT_READINESS_WITH_NAVIGATIONAL_ATTRIBUTES, false));
	queryCapabilities.setSupportsIteratedFormula(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.V270_ITERATED_FORMULA, false));
	queryCapabilities.setSupportsCDSProjectionViews(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.V272_CDS_PROJECTION_VIEWS, false));
	queryCapabilities.setSupportsCellDocumentId(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.V274_CELL_DOCUMENT_ID, false));
	queryCapabilities.setSupportsUndefinedTupleCountTotals(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.C220_UNDEFINED_TUPLE_COUNT_TOTALS, false));
	queryCapabilities.setSupportsTextInHierarchyForCharacteristicsWithoutText(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.V302_TEXT_IN_HIERARCHY, false));
	queryCapabilities.setSupportsPagingTupleCountBeforeSlicing(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.V298_PAGING_TUPLE_COUNT_BEFORE_SLICING, false));
	queryCapabilities.setSupportsDataCellContexts(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.V324_DATA_CELL_CONTEXTS, false));
	queryCapabilities.setSupportsNamePath(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.V326_NAME_PATH, false));
	queryCapabilities.setSupportsMixedDisplayKey(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.V328_MIXED_DISPLAY_KEY, false));
	queryCapabilities.setSupportsSemanticObject(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.V332_SEMANTIC_OBJECT, false));
	queryCapabilities.setSupportsErrorAboveLevel(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.V336_ERROR_ABOVE_LEVEL, false));
	queryCapabilities.setSupportsInAModelExternalDimension(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.V342_INAMODEL_EXTERNAL_DIMENSION, false));
	queryCapabilities.setSupportsInAModelExternalValuehelp(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.V344_INAMODEL_EXTERNAL_VALUE_HELP, false));
	queryCapabilities.setSupportsPersistedInA(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.V340_INA_PERSISTED, false));
	queryCapabilities.setSupportsMaxDrillLevel(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.V346_MAX_DRILL_LEVEL, false));
	queryCapabilities.setSupportsSqlTypeBoolean(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.V354_SQL_TYPE_BOOLEAN, false));
	queryCapabilities.setSupportsNoDataActions(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.V128_NO_DATA_ACTIONS, false));
	queryCapabilities.setSupportsStructureOnFreeAxis(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.V356_STRUCTURE_ON_FREE_AXIS, false));
	queryCapabilities.setSupportsMetadataHasExternalHierarchies(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.V358_METADATA_HAS_EXTERNAL_HIERARCHIES, false));
	queryCapabilities.setSupportsExceptionThresholdNoPrec(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.V360_EXCEPTION_THRESHOLD_NO_PRECISION, false));
	queryCapabilities.setSupportsReturnMetadataExtensions(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.V362_RETURN_METADATA_EXTENSIONS, false));
	queryCapabilities.setSupportsMetadataResultFormatOptions(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.V368_METADATA_RESULT_FORMAT_OPTIONS, false));
	queryCapabilities.setSupportsLightweightMetadata(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.V370_LIGHTWEIGHT_METADATA, false));
	queryCapabilities.setSupportsResultSetV2MetadataExtension1(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.V266_RESULTSETV2_METADATA_EXTENSION1, false));
	queryCapabilities.setSupportsIDAttributeForMeasureDimension(oFF.InACapabilitiesProvider.supports(sysCapabilities, oFF.InACapabilities.V376_MEASURE_DIMENSION_ID_ATTRIBUTE, false));
};
oFF.InACapabilitiesProvider.supports = function(capabilityContainer, name, defaultValue)
{
	return defaultValue || oFF.notNull(capabilityContainer) && capabilityContainer.containsKey(name);
};
oFF.InACapabilitiesProvider.importDimensionExtensionCapabilities = function(sysCapabilities, queryCapabilities)
{
	queryCapabilities.setSupportsFunctionalValueHelp(oFF.notNull(sysCapabilities) && sysCapabilities.containsKey(oFF.ConnectionConstants.FAST_PATH));
};
oFF.InACapabilitiesProvider.prototype.m_serverMetadata = null;
oFF.InACapabilitiesProvider.prototype.m_providerType = null;
oFF.InACapabilitiesProvider.prototype.m_additionalFeatureToggles = null;
oFF.InACapabilitiesProvider.prototype.m_clientMainCapabilities = null;
oFF.InACapabilitiesProvider.prototype.m_clientFeatureToggleCapabilities = null;
oFF.InACapabilitiesProvider.prototype.m_serverMainCapabilities = null;
oFF.InACapabilitiesProvider.prototype.m_serverBetaCapabilities = null;
oFF.InACapabilitiesProvider.prototype.m_activeCapabilities = null;
oFF.InACapabilitiesProvider.prototype.m_serverPersistencyCapabilities = null;
oFF.InACapabilitiesProvider.prototype.m_deserializationDocumentCapabilities = null;
oFF.InACapabilitiesProvider.prototype.m_activeDeserializationCapabilities = null;
oFF.InACapabilitiesProvider.prototype.m_dimensionExtensionCapabilities = null;
oFF.InACapabilitiesProvider.prototype.m_documentCapabilities = null;
oFF.InACapabilitiesProvider.prototype.setupExt = function(session, serverMetadata, providerType, featureToggles)
{
	this.setupSessionContext(session);
	this.m_serverMetadata = serverMetadata;
	this.m_providerType = providerType;
	this.m_additionalFeatureToggles = featureToggles;
	this.m_clientMainCapabilities = this.createMainCapabilities(providerType);
	this.m_clientFeatureToggleCapabilities = this.createFeatureToggleCapabilities(providerType);
	if (oFF.notNull(this.m_serverMetadata) && oFF.notNull(this.m_providerType))
	{
		var mainCapabilities = this.getServerCapabilitiesForProviderType(this.m_providerType, false);
		this.m_serverMainCapabilities = oFF.XObjectExt.cloneIfNotNull(mainCapabilities);
		var betaCapabilitiesForAnalytic = this.getServerCapabilitiesForProviderType(this.m_providerType, true);
		this.m_serverBetaCapabilities = oFF.XObjectExt.cloneIfNotNull(betaCapabilitiesForAnalytic);
		var dimensionExtensionCapabilities = this.getServerCapabilitiesForProviderType(oFF.ProviderType.DIMENSION_EXTENSION, false);
		this.m_dimensionExtensionCapabilities = oFF.XObjectExt.cloneIfNotNull(dimensionExtensionCapabilities);
		var documentCapabilities = this.getServerCapabilitiesForProviderType(oFF.ProviderType.DOCUMENTS, false);
		this.m_documentCapabilities = oFF.XObjectExt.cloneIfNotNull(documentCapabilities);
	}
};
oFF.InACapabilitiesProvider.prototype.releaseObject = function()
{
	this.m_activeDeserializationCapabilities = oFF.XObjectExt.release(this.m_activeDeserializationCapabilities);
	this.m_serverPersistencyCapabilities = oFF.XObjectExt.release(this.m_serverPersistencyCapabilities);
	this.m_deserializationDocumentCapabilities = oFF.XObjectExt.release(this.m_deserializationDocumentCapabilities);
	this.m_dimensionExtensionCapabilities = oFF.XObjectExt.release(this.m_dimensionExtensionCapabilities);
	this.m_documentCapabilities = oFF.XObjectExt.release(this.m_documentCapabilities);
	this.m_clientMainCapabilities = oFF.XObjectExt.release(this.m_clientMainCapabilities);
	this.m_clientFeatureToggleCapabilities = oFF.XObjectExt.release(this.m_clientFeatureToggleCapabilities);
	this.m_serverMainCapabilities = oFF.XObjectExt.release(this.m_serverMainCapabilities);
	this.m_serverBetaCapabilities = oFF.XObjectExt.release(this.m_serverBetaCapabilities);
	this.m_activeCapabilities = oFF.XObjectExt.release(this.m_activeCapabilities);
	oFF.DfSessionContext.prototype.releaseObject.call( this );
};
oFF.InACapabilitiesProvider.prototype.createFeatureToggleCapabilities = function(providerType)
{
	var container = oFF.CapabilityContainer.create("featureToggle");
	if (providerType === oFF.ProviderType.PLANNING_COMMAND || providerType === oFF.ProviderType.PLANNING_VALUE_HELP)
	{
		container = this.createFeatureTogglePlanningCapabilities(container);
	}
	else
	{
		container = this.createFeatureToggleAnalyticsCapabilities(container);
	}
	return container;
};
oFF.InACapabilitiesProvider.prototype.createMainCapabilities = function(providerType)
{
	var container = oFF.CapabilityContainer.create("main");
	if (providerType === oFF.ProviderType.PLANNING_COMMAND || providerType === oFF.ProviderType.PLANNING_VALUE_HELP)
	{
		this.createMainPlanningCapabilities(container);
	}
	else
	{
		this.createMainAnalyticsCapabilities(container);
	}
	return container;
};
oFF.InACapabilitiesProvider.prototype.createFeatureToggleAnalyticsCapabilities = function(featureToggleCapabilities)
{
	var systemType = this.m_serverMetadata.getSystemDescription().getSystemType();
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.MULTIPLE_EX_AGG_DIMS_IN_CALC_PLAN, oFF.InACapabilities.V126_MULTIPLE_EX_AGG_DIMS_IN_CALC_PLAN);
	this.checkExt(featureToggleCapabilities, oFF.FeatureToggleOlap.UNIFIED_DATACELLS, oFF.InACapabilities.C210_UNIFIED_DATA_CELLS, systemType, oFF.SystemType.HANA);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.NO_DATA_ACTIONS, oFF.InACapabilities.V128_NO_DATA_ACTIONS);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.HIERARCHY_LEVEL, oFF.InACapabilities.V149_RESULTSET_HIERARCHY_LEVEL);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.NUMBER_AS_STRING, oFF.InACapabilities.V172_NUMBER_AS_STRING);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.UNIVERSAL_DISPLAY_HIERARCHY_ZERO_BASED, oFF.InACapabilities.V158_UNIVERSAL_DISPLAY_HIERARCHY_ZERO_BASED);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.CUBE_CACHE, oFF.InACapabilities.V166_CUBE_CACHE);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.EXT_KEYFIGURE_PROPERTIES, oFF.InACapabilities.V168_EXT_KEYFIGURE_PROPERTIES);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.QDATA_CELL_MODEL_DEFAULTS, oFF.InACapabilities.V174_QDATA_CELL_MODEL_DEFAULTS);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.DISP_HIERARCHY_FIX_IN_FILTER, oFF.InACapabilities.V186_DISP_HIERARCHY_FIX_IN_FILTER);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.CUSTOM_DIMENSION_2_FOR_AGILE_BI, oFF.InACapabilities.C211_CUSTOM_DIMENSION_2);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.CUSTOM_DIMENSION_2_FOR_INA_MODEL, oFF.InACapabilities.C211_CUSTOM_DIMENSION_2);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.MEMBER_VALUE_EXCEPTIONS, oFF.InACapabilities.V188_MEMBER_VALUE_EXCEPTIONS);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.DYN_MEMBERS_ON_NON_MEASURE_STRUCTURE, oFF.InACapabilities.V248_DYNAMIC_MEMBERS_ON_NON_MEASURE_STRUCTURE);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.RESULTSET_CELL_FORMAT_TYPE_SPECIFIC, oFF.InACapabilities.V268_RESULTSET_CELL_FORMAT_TYPE_SPECIFIC);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.CUBE_BLENDING_N_QUERIES, oFF.InACapabilities.V214_CUBE_BLENDING_N_QUERIES);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.DATASOURCE_TYPE_QUERY_METADATA, oFF.InACapabilities.V210_DATASOURCE_TYPE_QUERY_METADATA);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.DATASOURCE_TYPE_QUERY, oFF.InACapabilities.V212_DATASOURCE_TYPE_QUERY);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.TUPLES_OPERAND, oFF.InACapabilities.V216_TUPLES_OPERAND);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.UDH_ALIGNMENT, oFF.InACapabilities.V250_UDH_ALIGNMENT);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.SID_PRESENTATION, oFF.InACapabilities.V232_SID_PRESENTATION);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.METADATA_CUBE_RESPONSE_SUPPRESS_PROPERTIES, oFF.InACapabilities.V190_METADATA_CUBE_RESPONSE_SUPPRESS_PROPERTIES);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.HIERARCHY_CATALOG, oFF.InACapabilities.V322_HIERARCHY_CATALOG);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.METADATA_DIMENSION_OTHERS, oFF.InACapabilities.V224_METADATA_DIMENSION_OTHERS);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.METADATA_DIMENSION_IS_MODELED, oFF.InACapabilities.V226_METADATA_DIMENSION_IS_MODELED);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.RESULTSET_CELL_MEASURE, oFF.InACapabilities.V264_RESULTSET_CELL_MEASURE);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.RESULTSETV2_METADATA_EXTENSION1, oFF.InACapabilities.V266_RESULTSETV2_METADATA_EXTENSION1);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.CORRECT_DIMENSION_DESCRIPTION, oFF.InACapabilities.V198_DIMENSION_DESCRIPTION);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.SUPPRESS_SUPPLEMENTS, oFF.InACapabilities.V230_SUPPRESS_SUPPLEMENTS);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.WINDOW_FUNCTION, oFF.InACapabilities.V218_WINDOW_FUNCTION);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.HIERARCHY_PATH_PRESENTATION_TYPE, oFF.InACapabilities.V294_HIERARCHY_PATH_PRESENTATION_TYPE);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.DIMENSION_KEY_ATTRIBUTES, oFF.InACapabilities.V296_DIMENSION_KEY_ATTRIBUTES);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.NAMED_CUSTOM_DIMENSION_MEMBER, oFF.InACapabilities.V236_NAMED_CUSTOM_DIMENSION_MEMBER);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.AUTO_VARIABLE_SUBMIT_CAPABILITY, oFF.InACapabilities.V286_AUTO_VARIABLE_SUBMIT);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.NULL_ZERO_SUPPRESSION, oFF.InACapabilities.V254_NULL_ZERO_SUPPRESSION);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.INPUT_READINESS_WITH_NAVIGATIONAL_ATTRIBUTES, oFF.InACapabilities.V256_INPUT_READINESS_WITH_NAVIGATIONAL_ATTRIBUTES);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.ITERATED_FORMULA, oFF.InACapabilities.V270_ITERATED_FORMULA);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.CDS_PROJECTION_VIEWS, oFF.InACapabilities.V272_CDS_PROJECTION_VIEWS);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.CELL_DOCUMENT_ID, oFF.InACapabilities.V274_CELL_DOCUMENT_ID);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.TUPLE_COUNT_BEFORE_SLICING, oFF.InACapabilities.V298_PAGING_TUPLE_COUNT_BEFORE_SLICING);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.TEXT_IN_HIERARCHY, oFF.InACapabilities.V302_TEXT_IN_HIERARCHY);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.ASYNC_BLENDING_BATCH_REQUEST, oFF.InACapabilities.V308_ASYNC_BLENDING_BATCH_REQUEST);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.MAINTAIN_VARIABLE_VARIANTS, oFF.InACapabilities.V320_MAINTAINS_VARIABLE_VARIANTS);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.DATA_CELL_CONTEXTS, oFF.InACapabilities.V324_DATA_CELL_CONTEXTS);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.NAME_PATH, oFF.InACapabilities.V326_NAME_PATH);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.DISPLAY_KEY_MIXED_COMPOUNDMENT, oFF.InACapabilities.V328_MIXED_DISPLAY_KEY);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.SEMANTIC_OBJECT, oFF.InACapabilities.V332_SEMANTIC_OBJECT);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.ERROR_ABOVE_LEVEL, oFF.InACapabilities.V336_ERROR_ABOVE_LEVEL);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.BW_PERSISTED_INA, oFF.InACapabilities.V340_INA_PERSISTED);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.INAMODEL_EXTERNAL_DIMENSION, oFF.InACapabilities.V342_INAMODEL_EXTERNAL_DIMENSION);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.INAMODEL_EXTERNAL_VALUE_HELP, oFF.InACapabilities.V344_INAMODEL_EXTERNAL_VALUE_HELP);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.MAX_DRILL_LEVEL, oFF.InACapabilities.V346_MAX_DRILL_LEVEL);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.SQL_TYPE_BOOLEAN, oFF.InACapabilities.V354_SQL_TYPE_BOOLEAN);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.STRUCTURE_ON_FREE_AXIS, oFF.InACapabilities.V356_STRUCTURE_ON_FREE_AXIS);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.MDS_DISPLAY_ATTRIBUTES, oFF.InACapabilities.V340_DISPLAY_ATTRIBUTES);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.METADATA_HAS_EXTERNAL_HIERARCHIES, oFF.InACapabilities.V358_METADATA_HAS_EXTERNAL_HIERARCHIES);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.EXCEPTION_THRESHOLD_NO_PRECISION, oFF.InACapabilities.V360_EXCEPTION_THRESHOLD_NO_PRECISION);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.RETURN_METADATA_EXTENSIONS, oFF.InACapabilities.V362_RETURN_METADATA_EXTENSIONS);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.MDS_METADATA_RESULT_FORMAT_OPTIONS, oFF.InACapabilities.V368_METADATA_RESULT_FORMAT_OPTIONS);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.MDS_LIGHTWEIGHT_METADATA, oFF.InACapabilities.V370_LIGHTWEIGHT_METADATA);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.MDS_VIRTUAL_DATA_SOURCE_TYPE_COLUMNS, oFF.InACapabilities.V372_VIRTUAL_DATA_SOURCE_TYPE_COLUMNS);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.MDS_RESULTSET_NUMERIC_TYPES_AS_TEXT, oFF.InACapabilities.V375_RESULTSET_NUMERIC_TYPES_AS_TEXT);
	this.check(featureToggleCapabilities, oFF.FeatureToggleOlap.MEASURE_DIMENSION_ID_ATTRIBUTE, oFF.InACapabilities.V376_MEASURE_DIMENSION_ID_ATTRIBUTE);
	return featureToggleCapabilities;
};
oFF.InACapabilitiesProvider.prototype.createMainAnalyticsCapabilities = function(mainCapabilities)
{
	mainCapabilities.addCapability(oFF.InACapabilities.C000_ATTRIBUTE_HIERARCHY);
	mainCapabilities.addCapability(oFF.InACapabilities.C001_DATASOURCE_AT_SERVICE);
	mainCapabilities.addCapability(oFF.InACapabilities.C002_VARIABLE_RE_SUBMIT);
	mainCapabilities.addCapability(oFF.InACapabilities.C003_CLIENT_CAPABILITIES);
	mainCapabilities.addCapability(oFF.InACapabilities.C004_METADATA_SERVICE);
	mainCapabilities.addCapability(oFF.InACapabilities.C005_OBTAINABILITY);
	mainCapabilities.addCapability(oFF.InACapabilities.C006_READ_MODE);
	mainCapabilities.addCapability(oFF.InACapabilities.C007_RESPONSE_FIXED_ATTRIBUTE_SEQUENCE);
	mainCapabilities.addCapability(oFF.InACapabilities.C008_SERVER_STRUCTURE_NAMES);
	mainCapabilities.addCapability(oFF.InACapabilities.C009_STATEFUL_SERVER);
	mainCapabilities.addCapability(oFF.InACapabilities.C010_STATEFUL_DATA_PROVIDER);
	mainCapabilities.addCapability(oFF.InACapabilities.C011_SET_OPERAND);
	mainCapabilities.addCapability(oFF.InACapabilities.C012_ENCODED_RESULTSET);
	mainCapabilities.addCapability(oFF.InACapabilities.C013_COMPLEX_FILTERS);
	mainCapabilities.addCapability(oFF.InACapabilities.C014_UNIFIED_REQUEST_SYNTAX);
	mainCapabilities.addCapability(oFF.InACapabilities.C015_SEMANTICAL_ERROR_TYPE);
	mainCapabilities.addCapability(oFF.InACapabilities.C016_EXT_HIERARCHY);
	mainCapabilities.addCapability(oFF.InACapabilities.C017_SAP_DATE);
	mainCapabilities.addCapability(oFF.InACapabilities.C018_CUMMULATIVE);
	mainCapabilities.addCapability(oFF.InACapabilities.C019_EXTENDED_DIMENSION_TYPES);
	mainCapabilities.addCapability(oFF.InACapabilities.C020_NEW_VALUES_IMPLICIT_UNLOCK);
	mainCapabilities.addCapability(oFF.InACapabilities.C021_NEW_VALUES_EXTENDED_FORMAT);
	mainCapabilities.addCapability(oFF.InACapabilities.C022_HIERARCHY_NAME_VARIABLE);
	mainCapabilities.addCapability(oFF.InACapabilities.C023_EXCEPTIONS);
	mainCapabilities.addCapability(oFF.InACapabilities.C024_EXCEPTION_SETTINGS);
	mainCapabilities.addCapability(oFF.InACapabilities.C025_RUN_AS_USER);
	mainCapabilities.addCapability(oFF.InACapabilities.C026_QUERY_DATA_CELLS);
	mainCapabilities.addCapability(oFF.InACapabilities.C027_RESULTSET_CELL_VALUE_TYPES);
	mainCapabilities.addCapability(oFF.InACapabilities.C028_METADATA_DIMENSION_GROUP);
	mainCapabilities.addCapability(oFF.InACapabilities.C029_RESULTSET_CELL_FORMAT_STRING);
	mainCapabilities.addCapability(oFF.InACapabilities.C030_UNIQUE_ATTRIBUTE_NAMES);
	mainCapabilities.addCapability(oFF.InACapabilities.C031_METADATA_IS_DISPLAY_ATTRIBUTE);
	mainCapabilities.addCapability(oFF.InACapabilities.C032_FAST_PATH);
	mainCapabilities.addCapability(oFF.InACapabilities.C033_ATTRIBUTE_HIERARCHY_UNIQUE_FIELDS);
	mainCapabilities.addCapability(oFF.InACapabilities.C034_HIERARCHY_KEY_TEXT_NAME);
	mainCapabilities.addCapability(oFF.InACapabilities.C035_HIERARCHY_NAVIGATION_COUNTER);
	mainCapabilities.addCapability(oFF.InACapabilities.C036_ATTRIBUTE_HIERARCHY_HIERARCHY_FIELDS);
	mainCapabilities.addCapability(oFF.InACapabilities.C037_SUPPLEMENTS);
	mainCapabilities.addCapability(oFF.InACapabilities.C038_USE_EPM_VERSION);
	mainCapabilities.addCapability(oFF.InACapabilities.C039_DIMENSION_KIND_EPM_VERSION);
	mainCapabilities.addCapability(oFF.InACapabilities.C040_DIMENSION_KIND_CHART_OF_ACCOUNTS);
	mainCapabilities.addCapability(oFF.InACapabilities.C041_SP9);
	mainCapabilities.addCapability(oFF.InACapabilities.C042_TECHNICAL_AXIS);
	mainCapabilities.addCapability(oFF.InACapabilities.C043_DIMENSION_VALUEHELP_PROPERTY);
	mainCapabilities.addCapability(oFF.InACapabilities.C044_PAGING_TUPLE_COUNT_TOTAL);
	mainCapabilities.addCapability(oFF.InACapabilities.C045_ZERO_SUPPRESSION);
	mainCapabilities.addCapability(oFF.InACapabilities.C046_MANUAL_INPUT);
	mainCapabilities.addCapability(oFF.InACapabilities.C047_MULTI_SOURCE);
	mainCapabilities.addCapability(oFF.InACapabilities.C048_MEMBER_VISIBILITY);
	mainCapabilities.addCapability(oFF.InACapabilities.C049_RESULTSET_INTERVAL);
	mainCapabilities.addCapability(oFF.InACapabilities.C050_REPORT_REPORT_INTERFACE);
	mainCapabilities.addCapability(oFF.InACapabilities.C051_HIERARCHY_PATH);
	mainCapabilities.addCapability(oFF.InACapabilities.C052_METADATA_HIERARCHY_STRUCTURE);
	mainCapabilities.addCapability(oFF.InACapabilities.C053_METADATA_HIERARCHY_LEVELS);
	mainCapabilities.addCapability(oFF.InACapabilities.C054_EXTENDED_SORT);
	mainCapabilities.addCapability(oFF.InACapabilities.C055_CUSTOM_DIMENSION_MEMBER_EXECUTION_STEP);
	mainCapabilities.addCapability(oFF.InACapabilities.C056_HIERARCHY_PATH_UNIQUE_NAME);
	mainCapabilities.addCapability(oFF.InACapabilities.C057_HIERARCHY_DATA_AND_EXCLUDING_FILTERS);
	mainCapabilities.addCapability(oFF.InACapabilities.C058_HIERARCHY_SELECTION_AS_FLAT_SELECTION);
	mainCapabilities.addCapability(oFF.InACapabilities.C059_VISIBILITY_FILTER);
	mainCapabilities.addCapability(oFF.InACapabilities.C060_CELL_VALUE_OPERAND);
	mainCapabilities.addCapability(oFF.InACapabilities.C061_SPATIAL_FILTER);
	mainCapabilities.addCapability(oFF.InACapabilities.C062_SPATIAL_FILTER_WITH_SRID);
	mainCapabilities.addCapability(oFF.InACapabilities.C063_SPATIAL_TRANSFORMATIONS);
	mainCapabilities.addCapability(oFF.InACapabilities.C064_SPATIAL_CLUSTERING);
	mainCapabilities.addCapability(oFF.InACapabilities.C065_HIERARCHY_TRAPEZOID_FILTER);
	mainCapabilities.addCapability(oFF.InACapabilities.C066_SUBMIT_RETURNS_VARIABLE_VALUES);
	mainCapabilities.addCapability(oFF.InACapabilities.C067_EXTENDED_DIMENSIONS);
	mainCapabilities.addCapability(oFF.InACapabilities.C068_EXTENDED_DIMENSIONS_FIELD_MAPPING);
	mainCapabilities.addCapability(oFF.InACapabilities.C069_EXTENDED_DIMENSIONS_JOIN_COLUMNS);
	mainCapabilities.addCapability(oFF.InACapabilities.C070_EXTENDED_DIMENSIONS_OUTER_JOIN);
	mainCapabilities.addCapability(oFF.InACapabilities.C071_EXTENDED_DIMENSIONS_SKIP);
	mainCapabilities.addCapability(oFF.InACapabilities.C072_METADATA_DEFAULT_RESULT_ALIGNMENT_BOTTOM);
	mainCapabilities.addCapability(oFF.InACapabilities.C073_IGNORE_EXTERNAL_DIMENSIONS);
	mainCapabilities.addCapability(oFF.InACapabilities.C074_RETURN_RESTRICTED_AND_CALCULATED_MEMBERS_IN_READ_MODE_BOOKED);
	mainCapabilities.addCapability(oFF.InACapabilities.C075_PERSIST_RESULTSET);
	mainCapabilities.addCapability(oFF.InACapabilities.C076_RESTRICTED_MEMBERS_CONVERT_TO_FLAT_SELECTION);
	mainCapabilities.addCapability(oFF.InACapabilities.C077_VARIABLES);
	mainCapabilities.addCapability(oFF.InACapabilities.C078_TOTALS);
	mainCapabilities.addCapability(oFF.InACapabilities.C079_ENCODED_RESULTSET_2);
	mainCapabilities.addCapability(oFF.InACapabilities.C080_RESULTSET_STATE);
	mainCapabilities.addCapability(oFF.InACapabilities.C081_RESULTSET_CELL_NUMERIC_SHIFT);
	mainCapabilities.addCapability(oFF.InACapabilities.C082_RESULTSET_CELL_DATA_TYPE);
	mainCapabilities.addCapability(oFF.InACapabilities.C083_ORDER_BY);
	mainCapabilities.addCapability(oFF.InACapabilities.C084_METADATA_REPOSITORY_SUFFIX);
	mainCapabilities.addCapability(oFF.InACapabilities.C085_METADATA_CUBE_QUERY);
	mainCapabilities.addCapability(oFF.InACapabilities.C086_MAX_RESULT_RECORDS);
	mainCapabilities.addCapability(oFF.InACapabilities.C087_IGNORE_UNIT_OF_NULL_IN_AGGREGATION);
	mainCapabilities.addCapability(oFF.InACapabilities.C088_SET_NULL_CELLS_UNIT_TYPE);
	mainCapabilities.addCapability(oFF.InACapabilities.C089_DIMENSION_FILTER);
	mainCapabilities.addCapability(oFF.InACapabilities.C090_DIMENSION_F4_SELECTION_WITH_COMPOUNDMENT);
	mainCapabilities.addCapability(oFF.InACapabilities.C091_CUBE_BLENDING);
	mainCapabilities.addCapability(oFF.InACapabilities.C092_CUBE_BLENDING_AGGREGATION);
	mainCapabilities.addCapability(oFF.InACapabilities.C093_REMOTE_BLENDING);
	mainCapabilities.addCapability(oFF.InACapabilities.C094_CUBE_BLENDING_CUSTOM_MEMBERS);
	mainCapabilities.addCapability(oFF.InACapabilities.C095_CUBE_BLENDING_MEMBER_SORTING);
	mainCapabilities.addCapability(oFF.InACapabilities.C096_CUBE_BLENDING_OUT_OF_CONTEXT);
	mainCapabilities.addCapability(oFF.InACapabilities.C097_CUBE_BLENDING_PROPERTIES);
	mainCapabilities.addCapability(oFF.InACapabilities.C098_CUBE_BLENDING_READ_MODE);
	mainCapabilities.addCapability(oFF.InACapabilities.C099_METADATA_DATA_CATEGORY);
	mainCapabilities.addCapability(oFF.InACapabilities.C100_EXPAND_BOTTOM_UP);
	mainCapabilities.addCapability(oFF.InACapabilities.C101_CONDITIONS);
	mainCapabilities.addCapability(oFF.InACapabilities.C102_AGGREGATION_NOP_NULL);
	mainCapabilities.addCapability(oFF.InACapabilities.C103_AGGREGATION_NOP_NULL_ZERO);
	mainCapabilities.addCapability(oFF.InACapabilities.C104_EXCEPTION_AGGREGATION_DIMENSIONS_AND_FORMULAS);
	mainCapabilities.addCapability(oFF.InACapabilities.C105_EXCEPTION_AGGREGATION_AVGNULL_SELECTION_MEMBER);
	mainCapabilities.addCapability(oFF.InACapabilities.C106_EXCEPTION_AGGREGATION_COUNTNULL_SELECTION_MEMBER);
	mainCapabilities.addCapability(oFF.InACapabilities.C107_STATISTICAL_AGGREGATIONS);
	mainCapabilities.addCapability(oFF.InACapabilities.C108_MDS_EXPRESSION);
	mainCapabilities.addCapability(oFF.InACapabilities.C109_TOTALS_AFTER_VISIBILITY_FILTER);
	mainCapabilities.addCapability(oFF.InACapabilities.C110_DEFINITION_RETURNS_VARIABLE_VALUES);
	mainCapabilities.addCapability(oFF.InACapabilities.C111_HIERARCHY_NAVIGATION_DELTA_MODE);
	mainCapabilities.addCapability(oFF.InACapabilities.C112_FLAT_KEY_ON_HIERARCHY_DISPLAY);
	mainCapabilities.addCapability(oFF.InACapabilities.C113_DATA_CELL_MIXED_VALUES);
	mainCapabilities.addCapability(oFF.InACapabilities.C114_VALUES_ROUNDED);
	mainCapabilities.addCapability(oFF.InACapabilities.C115_ATTRIBUTE_VALUE_LOOKUP);
	mainCapabilities.addCapability(oFF.InACapabilities.C116_METADATA_HIERARCHY_UNIQUE_NAME);
	mainCapabilities.addCapability(oFF.InACapabilities.C117_CANCEL_RUNNING_REQUESTS);
	mainCapabilities.addCapability(oFF.InACapabilities.C118_CALCULATED_KEYFIGURES);
	mainCapabilities.addCapability(oFF.InACapabilities.C119_RESTRICTED_KEYFIGURES);
	mainCapabilities.addCapability(oFF.InACapabilities.C120_CURRENT_MEMBER_FILTER_EXTENSION);
	mainCapabilities.addCapability(oFF.InACapabilities.C121_RETURN_ERROR_FOR_INVALID_QUERYMODEL);
	mainCapabilities.addCapability(oFF.InACapabilities.C122_ORIGINAL_TEXTS);
	mainCapabilities.addCapability(oFF.InACapabilities.C123_CUSTOM_DIMENSION_FILTER);
	mainCapabilities.addCapability(oFF.InACapabilities.C124_AVERAGE_COUNT_IGNORE_NULL_ZERO);
	mainCapabilities.addCapability(oFF.InACapabilities.C125_MDS_LIKE_PAGING);
	mainCapabilities.addCapability(oFF.InACapabilities.C126_HIERARCHY_LEVEL_OFFSET_FILTER);
	mainCapabilities.addCapability(oFF.InACapabilities.C127_CE_SCENARIO_PARAMS);
	mainCapabilities.addCapability(oFF.InACapabilities.C128_METADATA_DIMENSION_CAN_BE_AGGREGATED);
	mainCapabilities.addCapability(oFF.InACapabilities.C129_INITIAL_DRILL_LEVEL_RELATIVE);
	mainCapabilities.addCapability(oFF.InACapabilities.C130_MDM_HIERARCHY_WITH_DRILL_LEVEL);
	mainCapabilities.addCapability(oFF.InACapabilities.C131_NO_HIERARCHY_PATH_ON_FLAT_DIMENSIONS);
	mainCapabilities.addCapability(oFF.InACapabilities.C132_DATA_REFRESH);
	mainCapabilities.addCapability(oFF.InACapabilities.C133_RESULTSET_AXIS_TYPE);
	mainCapabilities.addCapability(oFF.InACapabilities.C134_EPM_RESPONSE_LIST_SHARED_VERSIONS);
	mainCapabilities.addCapability(oFF.InACapabilities.C135_VARIABLE_VARIANTS);
	mainCapabilities.addCapability(oFF.InACapabilities.C136_READ_MODES_V2);
	mainCapabilities.addCapability(oFF.InACapabilities.C137_LIST_REPORTING);
	mainCapabilities.addCapability(oFF.InACapabilities.C138_DIMENSION_TYPE_TIME);
	mainCapabilities.addCapability(oFF.InACapabilities.C139_UNIVERSAL_DISPLAY_HIERARCHIES);
	mainCapabilities.addCapability(oFF.InACapabilities.C140_CATALOG_SERVICE_V20);
	mainCapabilities.addCapability(oFF.InACapabilities.C141_RETURNED_DATA_SELECTION);
	mainCapabilities.addCapability(oFF.InACapabilities.C142_KEYFIGURE_HIERARCHIES);
	mainCapabilities.addCapability(oFF.InACapabilities.C143_EXTENDED_DIMENSIONS_JOIN_CARDINALITY);
	mainCapabilities.addCapability(oFF.InACapabilities.C144_METADATA_DATASOURCE_DEFINITION_VALIDATION);
	mainCapabilities.addCapability(oFF.InACapabilities.C145_DATA_REFRESH_AND_DATA_TOPICALITY);
	mainCapabilities.addCapability(oFF.InACapabilities.C146_EXTENDED_VARIABLE_DEFINITION);
	mainCapabilities.addCapability(oFF.InACapabilities.C147_INPUT_READINESS_STATES);
	mainCapabilities.addCapability(oFF.InACapabilities.C148_CUSTOM_MEASURE_SORTORDER);
	mainCapabilities.addCapability(oFF.InACapabilities.C149_CUSTOM_SORT);
	mainCapabilities.addCapability(oFF.InACapabilities.C150_CARTESIAN_FILTER_INTERSECT);
	mainCapabilities.addCapability(oFF.InACapabilities.C151_SUPPRESS_KEYFIGURE_CALCULATION);
	mainCapabilities.addCapability(oFF.InACapabilities.C152_IGNORE_UNIT_OF_ZERO_VALUE_IN_AGGREGATION);
	mainCapabilities.addCapability(oFF.InACapabilities.C153_VARIANCE_OPERATOR);
	mainCapabilities.addCapability(oFF.InACapabilities.C154_MD_DS_DEF_VAL_EXPOSE_DS);
	mainCapabilities.addCapability(oFF.InACapabilities.C155_CLIENT_INFO);
	mainCapabilities.addCapability(oFF.InACapabilities.C156_EXTENDED_DIMENSION_CHANGE_DEFAULT_RENAMING_AND_DESCRIPTION);
	mainCapabilities.addCapability(oFF.InACapabilities.C157_EXTENDED_DIMENSION_COPY_ALL_HIERARCHIES);
	mainCapabilities.addCapability(oFF.InACapabilities.C158_FIX_METADATA_HIERARCHY_ATTRIBUTES);
	mainCapabilities.addCapability(oFF.InACapabilities.C159_EXCEPTIONS_V2);
	mainCapabilities.addCapability(oFF.InACapabilities.C160_QUERY_CURRENCY_TRANSLATION);
	mainCapabilities.addCapability(oFF.InACapabilities.C161_STRUCTURE_RESTRICTIONS_IN_VALUE_HELP);
	mainCapabilities.addCapability(oFF.InACapabilities.C162_ASYNC_METADATA_BATCH_REQUEST);
	mainCapabilities.addCapability(oFF.InACapabilities.C163_HIERARCHY_VIRTUAL_ROOT_NODE);
	mainCapabilities.addCapability(oFF.InACapabilities.C164_HIERARCHY_REST_NODE);
	mainCapabilities.addCapability(oFF.InACapabilities.C165_SPATIAL_CHOROPLETH);
	mainCapabilities.addCapability(oFF.InACapabilities.C166_INA_CURRENT_MEMBER);
	mainCapabilities.addCapability(oFF.InACapabilities.C167_FORMULA_OPERATORS_CATALOG);
	mainCapabilities.addCapability(oFF.InACapabilities.C168_READMODE_RELATED_BOOOKED);
	mainCapabilities.addCapability(oFF.InACapabilities.C169_DIMENSION_HIERARCHY_LEVELS);
	mainCapabilities.addCapability(oFF.InACapabilities.C170_MDM_HIERARCHY_DRILL_LEVEL);
	mainCapabilities.addCapability(oFF.InACapabilities.C171_CALCULATED_DIMENSION);
	mainCapabilities.addCapability(oFF.InACapabilities.C172_PLANNING_ON_CALCULATED_DIMENSION);
	mainCapabilities.addCapability(oFF.InACapabilities.C173_METADATA_BASE_MEASURE_NAME);
	mainCapabilities.addCapability(oFF.InACapabilities.C174_REQUEST_TIME_ZONE);
	mainCapabilities.addCapability(oFF.InACapabilities.C175_PRESENTATION_LENGTH);
	mainCapabilities.addCapability(oFF.InACapabilities.C176_VISUAL_AGGREGATION);
	mainCapabilities.addCapability(oFF.InACapabilities.C177_DATA_ENTRY_ON_UNBOOKED);
	mainCapabilities.addCapability(oFF.InACapabilities.C178_MASTER_READ_MODE_BY_DIMENSION_GROUPING);
	mainCapabilities.addCapability(oFF.InACapabilities.C179_UNASSIGNED_NODE_AS_DEFINED_IN_QUERY);
	mainCapabilities.addCapability(oFF.InACapabilities.C180_REMOTE_FILTER);
	mainCapabilities.addCapability(oFF.InACapabilities.C181_FIX_HIERARCHY_FLAT_KEYS);
	mainCapabilities.addCapability(oFF.InACapabilities.C182_CUBE_BLENDING_PERSISTENCE_TYPE);
	mainCapabilities.addCapability(oFF.InACapabilities.C183_GET_PARAMETERS);
	mainCapabilities.addCapability(oFF.InACapabilities.C184_VERSION_PRIVILEGES);
	mainCapabilities.addCapability(oFF.InACapabilities.C185_VALUE_HELP_WITH_ATTRIBUTES);
	mainCapabilities.addCapability(oFF.InACapabilities.C186_F4_FILTER_FOR_TEXT_FIELD);
	mainCapabilities.addCapability(oFF.InACapabilities.C187_DIMENSION_DEFAULT_MEMBER);
	mainCapabilities.addCapability(oFF.InACapabilities.C188_LOCALE_SORTING);
	mainCapabilities.addCapability(oFF.InACapabilities.C189_DIMENSION_VISIBILITY);
	mainCapabilities.addCapability(oFF.InACapabilities.C190_METADATA_SEMANTIC_TYPE);
	mainCapabilities.addCapability(oFF.InACapabilities.C191_DYNAMIC_VARIABLES);
	mainCapabilities.addCapability(oFF.InACapabilities.C192_VIRTUAL_DS_VARIABLE_VALUES);
	mainCapabilities.addCapability(oFF.InACapabilities.C193_INA_MODEL_METADATA);
	mainCapabilities.addCapability(oFF.InACapabilities.C194_METADATA_EXTENDED_DIMENSION_VISIBILITY);
	mainCapabilities.addCapability(oFF.InACapabilities.C195_RESULTSET_UNIT_INDEX);
	mainCapabilities.addCapability(oFF.InACapabilities.C196_REMOTE_BLENDING_BW);
	mainCapabilities.addCapability(oFF.InACapabilities.C197_DYN_RESTRICTION_ON_FORMULA);
	mainCapabilities.addCapability(oFF.InACapabilities.C198_OPERATOR_TOTALS);
	mainCapabilities.addCapability(oFF.InACapabilities.C199_AV_CAPABILITY_VARIABLE_MASKING);
	mainCapabilities.addCapability(oFF.InACapabilities.C200_COMPLEX_TUPLE_FILTER);
	if (this.getSession().hasFeature(oFF.FeatureToggleOlap.FUSION_SERVICE) === false)
	{
		mainCapabilities.addCapability(oFF.InACapabilities.C201_DETAILED_RESPONSE_EXPANSION);
	}
	mainCapabilities.addCapability(oFF.InACapabilities.C202_CUSTOM_HIERARCHY);
	mainCapabilities.addCapability(oFF.InACapabilities.C203_CUSTOM_MEMBER_KEY_SORT_ORDER);
	mainCapabilities.addCapability(oFF.InACapabilities.C204_UNIVERSAL_DISPLAY_HIERARCHY_CUSTOM_DIM);
	mainCapabilities.addCapability(oFF.InACapabilities.C205_RESUlTSET_EFFECTIVE_FILTER);
	mainCapabilities.addCapability(oFF.InACapabilities.C206_REMOTE_BLENDING_METADATA);
	mainCapabilities.addCapability(oFF.InACapabilities.C207_BATCH_RS_STREAMING);
	mainCapabilities.addCapability(oFF.InACapabilities.C208_EXCEPTION_AGGREGATION_FIRST_LAST_SELECTION_MEMBER);
	mainCapabilities.addCapability(oFF.InACapabilities.C209_RESULTSET_CELL_EXPLAIN);
	mainCapabilities.addCapability(oFF.InACapabilities.C211_CUSTOM_DIMENSION_2);
	mainCapabilities.addCapability(oFF.InACapabilities.C212_SORT_NEW_VALUES);
	mainCapabilities.addCapability(oFF.InACapabilities.C213_ROOT_ORPHANS_AFTER_VISIBILITY_FILTER);
	mainCapabilities.addCapability(oFF.InACapabilities.C214_IS_VIRTUAL_DESCRIPTION);
	mainCapabilities.addCapability(oFF.InACapabilities.C215_MEASURE_MEMBER_DEFINITION);
	mainCapabilities.addCapability(oFF.InACapabilities.C216_MEASURE_MEMBER_DETAILS);
	mainCapabilities.addCapability(oFF.InACapabilities.C217_MEASURE_MEMBER_TYPE);
	mainCapabilities.addCapability(oFF.InACapabilities.C218_CURRENCY_TRANSLATION);
	mainCapabilities.addCapability(oFF.InACapabilities.C219_MEASURE_MEMBER_CURRENCY_TRANSLATIONS);
	mainCapabilities.addCapability(oFF.InACapabilities.C220_UNDEFINED_TUPLE_COUNT_TOTALS);
	mainCapabilities.addCapability(oFF.InACapabilities.C221_UNIVERSAL_MODEL);
	mainCapabilities.addCapability(oFF.InACapabilities.C222_SET_OPERAND_CURRENT_MEMBER_SINGLE_NAVIGATION);
	this.addCapabilitiesFromEnv(mainCapabilities);
};
oFF.InACapabilitiesProvider.prototype.createFeatureTogglePlanningCapabilities = function(featureToggleCapabilities)
{
	if (this.getSession().hasFeature(oFF.FeatureToggleOlap.DEVELOPMENT_MODE_PLANNING))
	{
		featureToggleCapabilities.addCapability(oFF.InACapabilities.C001_DATASOURCE_AT_SERVICE);
		featureToggleCapabilities.addCapability(oFF.InACapabilities.C012_ENCODED_RESULTSET);
		featureToggleCapabilities.addCapability(oFF.InACapabilities.C054_EXTENDED_SORT);
		featureToggleCapabilities.addCapability(oFF.InACapabilities.C066_SUBMIT_RETURNS_VARIABLE_VALUES);
		featureToggleCapabilities.addCapability(oFF.InACapabilities.C100_EXPAND_BOTTOM_UP);
		featureToggleCapabilities.addCapability(oFF.InACapabilities.C136_READ_MODES_V2);
		featureToggleCapabilities.addCapability(oFF.InACapabilities.C129_INITIAL_DRILL_LEVEL_RELATIVE);
		featureToggleCapabilities.addCapability(oFF.InACapabilities.C032_FAST_PATH);
		featureToggleCapabilities.addCapability(oFF.InACapabilities.C113_DATA_CELL_MIXED_VALUES);
		featureToggleCapabilities.addCapability(oFF.InACapabilities.C110_DEFINITION_RETURNS_VARIABLE_VALUES);
		featureToggleCapabilities.addCapability(oFF.InACapabilities.C169_DIMENSION_HIERARCHY_LEVELS);
		featureToggleCapabilities.addCapability(oFF.InACapabilities.C159_EXCEPTIONS_V2);
		featureToggleCapabilities.addCapability(oFF.InACapabilities.C019_EXTENDED_DIMENSION_TYPES);
		featureToggleCapabilities.addCapability(oFF.InACapabilities.C146_EXTENDED_VARIABLE_DEFINITION);
		featureToggleCapabilities.addCapability(oFF.InACapabilities.C186_F4_FILTER_FOR_TEXT_FIELD);
		featureToggleCapabilities.addCapability(oFF.InACapabilities.C125_MDS_LIKE_PAGING);
		featureToggleCapabilities.addCapability(oFF.InACapabilities.C173_METADATA_BASE_MEASURE_NAME);
		featureToggleCapabilities.addCapability(oFF.InACapabilities.C175_PRESENTATION_LENGTH);
		featureToggleCapabilities.addCapability(oFF.InACapabilities.C179_UNASSIGNED_NODE_AS_DEFINED_IN_QUERY);
		featureToggleCapabilities.addCapability(oFF.InACapabilities.C142_KEYFIGURE_HIERARCHIES);
		featureToggleCapabilities.addCapability(oFF.InACapabilities.C048_MEMBER_VISIBILITY);
		featureToggleCapabilities.addCapability(oFF.InACapabilities.C119_RESTRICTED_KEYFIGURES);
		featureToggleCapabilities.addCapability(oFF.InACapabilities.C036_ATTRIBUTE_HIERARCHY_HIERARCHY_FIELDS);
		featureToggleCapabilities.addCapability(oFF.InACapabilities.C035_HIERARCHY_NAVIGATION_COUNTER);
		featureToggleCapabilities.addCapability(oFF.InACapabilities.C020_NEW_VALUES_IMPLICIT_UNLOCK);
		featureToggleCapabilities.addCapability(oFF.InACapabilities.C021_NEW_VALUES_EXTENDED_FORMAT);
		featureToggleCapabilities.addCapability(oFF.InACapabilities.C005_OBTAINABILITY);
		featureToggleCapabilities.addCapability(oFF.InACapabilities.C026_QUERY_DATA_CELLS);
		featureToggleCapabilities.addCapability(oFF.InACapabilities.C049_RESULTSET_INTERVAL);
		featureToggleCapabilities.addCapability(oFF.InACapabilities.C017_SAP_DATE);
		featureToggleCapabilities.addCapability(oFF.InACapabilities.C009_STATEFUL_SERVER);
		featureToggleCapabilities.addCapability(oFF.InACapabilities.C037_SUPPLEMENTS);
		featureToggleCapabilities.addCapability(oFF.InACapabilities.C018_CUMMULATIVE);
		featureToggleCapabilities.addCapability(oFF.InACapabilities.C011_SET_OPERAND);
		featureToggleCapabilities.addCapability(oFF.InACapabilities.C002_VARIABLE_RE_SUBMIT);
		featureToggleCapabilities.addCapability(oFF.InACapabilities.C045_ZERO_SUPPRESSION);
		featureToggleCapabilities.addCapability(oFF.InACapabilities.V158_UNIVERSAL_DISPLAY_HIERARCHY_ZERO_BASED);
		featureToggleCapabilities.addCapability(oFF.InACapabilities.V168_EXT_KEYFIGURE_PROPERTIES);
		featureToggleCapabilities.addCapability(oFF.InACapabilities.V174_QDATA_CELL_MODEL_DEFAULTS);
		featureToggleCapabilities.addCapability(oFF.InACapabilities.V186_DISP_HIERARCHY_FIX_IN_FILTER);
		featureToggleCapabilities.addCapability(oFF.InACapabilities.V230_SUPPRESS_SUPPLEMENTS);
		featureToggleCapabilities.addCapability(oFF.InACapabilities.V232_SID_PRESENTATION);
		featureToggleCapabilities.addCapability(oFF.InACapabilities.V322_HIERARCHY_CATALOG);
	}
	return featureToggleCapabilities;
};
oFF.InACapabilitiesProvider.prototype.createMainPlanningCapabilities = function(mainCapabilities)
{
	mainCapabilities.addCapability(oFF.InACapabilities.C000_ATTRIBUTE_HIERARCHY);
	mainCapabilities.addCapability(oFF.InACapabilities.C003_CLIENT_CAPABILITIES);
	mainCapabilities.addCapability(oFF.InACapabilities.C022_HIERARCHY_NAME_VARIABLE);
	this.addCapabilitiesFromEnv(mainCapabilities);
};
oFF.InACapabilitiesProvider.prototype.addCapabilitiesFromEnv = function(mainCapabilities)
{
	var environment = this.getSession().getEnvironment();
	var inaPlusCapability = environment.getVariable(oFF.XEnvironmentConstants.FIREFLY_ADD_INA_CAPABILITY);
	if (oFF.notNull(inaPlusCapability))
	{
		var plusCap = oFF.XStringTokenizer.splitString(inaPlusCapability, ",");
		var plusIterator = plusCap.getIterator();
		while (plusIterator.hasNext())
		{
			mainCapabilities.addCapability(plusIterator.next());
		}
	}
	var inaMinusCapability = environment.getVariable(oFF.XEnvironmentConstants.FIREFLY_REMOVE_INA_CAPABILITY);
	if (oFF.notNull(inaMinusCapability))
	{
		var minusCap = oFF.XStringTokenizer.splitString(inaMinusCapability, ",");
		var minusIterator = minusCap.getIterator();
		while (minusIterator.hasNext())
		{
			mainCapabilities.remove(minusIterator.next());
		}
	}
};
oFF.InACapabilitiesProvider.prototype.check = function(supportedCapabilities, featureToggle, capabilityName)
{
	if (this.getSession().hasFeature(featureToggle) || oFF.notNull(this.m_additionalFeatureToggles) && this.m_additionalFeatureToggles.contains(featureToggle))
	{
		supportedCapabilities.addCapability(capabilityName);
	}
};
oFF.InACapabilitiesProvider.prototype.checkExt = function(supportedCapabilities, featureToggle, capabilityName, actualSystemType, conditionalSystemType)
{
	if (actualSystemType.isTypeOf(conditionalSystemType))
	{
		this.check(supportedCapabilities, featureToggle, capabilityName);
	}
	else
	{
		supportedCapabilities.addCapability(capabilityName);
	}
};
oFF.InACapabilitiesProvider.prototype.getClientMainCapabilities = function()
{
	return this.m_clientMainCapabilities;
};
oFF.InACapabilitiesProvider.prototype.getClientFeatureToggleCapabilities = function()
{
	return this.m_clientFeatureToggleCapabilities;
};
oFF.InACapabilitiesProvider.prototype.getServerBetaCapabilities = function()
{
	return this.m_serverBetaCapabilities;
};
oFF.InACapabilitiesProvider.prototype.getServerMainCapabilities = function()
{
	return this.m_serverMainCapabilities;
};
oFF.InACapabilitiesProvider.prototype.getActiveCapabilities = function()
{
	if (oFF.isNull(this.m_activeCapabilities))
	{
		var activeServerCapabilities = null;
		var serverMainCapabilities = this.getServerMainCapabilities();
		var serverBetaCapabilities = this.getServerBetaCapabilities();
		var clientMainCapabilities = this.getClientMainCapabilities();
		var clientFeatureToggleCapabilities = this.getClientFeatureToggleCapabilities();
		if (this.getSession().hasFeature(oFF.FeatureToggleOlap.SIMPLIFIED_CAPABILITY_MERGE))
		{
			if (oFF.notNull(serverMainCapabilities))
			{
				if (this.getSession().hasFeature(oFF.FeatureToggleOlap.DEVELOPMENT_MODE))
				{
					activeServerCapabilities = serverMainCapabilities.union(serverBetaCapabilities);
				}
				else
				{
					var sacCapabilities = serverBetaCapabilities.intersect(oFF.InACapabilitiesProvider.SAC_DEV_CAPABILITIES);
					activeServerCapabilities = serverMainCapabilities.union(sacCapabilities);
				}
			}
			var activeClientCapabilities = clientMainCapabilities.union(clientFeatureToggleCapabilities);
			if (oFF.notNull(activeServerCapabilities))
			{
				this.m_activeCapabilities = activeServerCapabilities.intersect(activeClientCapabilities);
			}
		}
		else
		{
			activeServerCapabilities = this._sacFallback(serverMainCapabilities, serverBetaCapabilities);
			if (oFF.notNull(activeServerCapabilities))
			{
				var activeMainCapabilities = activeServerCapabilities.intersect(clientMainCapabilities);
				if (this.getSession().hasFeature(oFF.FeatureToggleOlap.DEVELOPMENT_MODE))
				{
					if (oFF.notNull(serverMainCapabilities))
					{
						activeServerCapabilities = serverMainCapabilities.union(serverBetaCapabilities);
					}
				}
				var activeFeatureToggleCapabilities = activeServerCapabilities.intersect(clientFeatureToggleCapabilities);
				this.m_activeCapabilities = activeMainCapabilities.union(activeFeatureToggleCapabilities);
			}
		}
		if (this.m_serverMetadata.getSystemDescription().getSystemType().isTypeOf(oFF.SystemType.HANA) && oFF.notNull(this.m_activeCapabilities) && this.m_activeCapabilities.containsKey(oFF.InACapabilities.C211_CUSTOM_DIMENSION_2) && (oFF.ServerVersionComparator.compare(this.m_serverMetadata.getVersion(), "1.0.122.14.00000000") === 1 || !this.doesServerSatisfyMinCustomDimension2CapabilitySet()))
		{
			this.m_activeCapabilities.remove(oFF.InACapabilities.C211_CUSTOM_DIMENSION_2);
		}
	}
	return this.m_activeCapabilities;
};
oFF.InACapabilitiesProvider.prototype.doesServerSatisfyMinCustomDimension2CapabilitySet = function()
{
	var analyticMain = this.m_serverMetadata.getMetadataForService(oFF.ServerService.ANALYTIC);
	if (oFF.isNull(analyticMain))
	{
		return false;
	}
	var sacBaselineLevel3Capabilities = this.getSACBaselineHANALevel3Capabilities();
	for (var i = 0; i < sacBaselineLevel3Capabilities.size(); i++)
	{
		if (!analyticMain.containsKey(sacBaselineLevel3Capabilities.get(i)))
		{
			return false;
		}
	}
	return true;
};
oFF.InACapabilitiesProvider.prototype.getSACBaselineHANALevel3Capabilities = function()
{
	var baselineLevel3Capabilities = oFF.XListOfString.create();
	baselineLevel3Capabilities.add("AttributeValueLookup");
	baselineLevel3Capabilities.add("CellValueOperand");
	baselineLevel3Capabilities.add("SupportsIgnoreExternalDimensions");
	baselineLevel3Capabilities.add("SetOperandCurrentMemberSingleNavigation");
	baselineLevel3Capabilities.add("CurrentMemberFilterExtension");
	baselineLevel3Capabilities.add("ExceptionAggregationDimsAndFormulas");
	baselineLevel3Capabilities.add("CubeBlending");
	baselineLevel3Capabilities.add("CubeBlendingProperties");
	baselineLevel3Capabilities.add("CubeBlendingMemberSorting");
	baselineLevel3Capabilities.add("CubeBlendingCustomMembers");
	baselineLevel3Capabilities.add("CubeBlendingReadMode");
	baselineLevel3Capabilities.add("CubeBlendingOutOfContext");
	baselineLevel3Capabilities.add("SupportsCubeBlendingAggregation");
	baselineLevel3Capabilities.add("ExceptionSettings");
	baselineLevel3Capabilities.add("AggregationNOPNULL");
	baselineLevel3Capabilities.add("AggregationNOPNULLZERO");
	baselineLevel3Capabilities.add("MultipleExAggDimsInCalcPlan");
	baselineLevel3Capabilities.add("ExtendedDimensionsChangeDefaultRenamingAndDescription");
	baselineLevel3Capabilities.add("ExtendedDimensionsCopyAllHierarchies");
	baselineLevel3Capabilities.add("FixMetaDataHierarchyAttributes");
	baselineLevel3Capabilities.add("RemoteBlending");
	baselineLevel3Capabilities.add("CalculatedDimension");
	baselineLevel3Capabilities.add("PlanningOnCalculatedDimension");
	baselineLevel3Capabilities.add("CustomDimension2");
	baselineLevel3Capabilities.add("ResultSetUnitIndex");
	baselineLevel3Capabilities.add("ExceptionAggregationCountNullInSelectionMember");
	baselineLevel3Capabilities.add("ExceptionAggregationAverageNullInSelectionMember");
	baselineLevel3Capabilities.add("ExceptionAggregationFirstLastInSelectionMember");
	return baselineLevel3Capabilities;
};
oFF.InACapabilitiesProvider.prototype._sacFallback = function(serverMainCapabilities, serverBetaCapabilities)
{
	if (oFF.notNull(serverBetaCapabilities) && oFF.notNull(serverMainCapabilities))
	{
		var iterator = oFF.InACapabilitiesProvider.SAC_DEV_CAPABILITIES.getKeysAsIteratorOfString();
		while (iterator.hasNext())
		{
			var capabilityToActiate = iterator.next();
			if (serverBetaCapabilities.containsKey(capabilityToActiate))
			{
				serverMainCapabilities.addCapability(capabilityToActiate);
			}
		}
	}
	return serverMainCapabilities;
};
oFF.InACapabilitiesProvider.prototype.exportActiveCapabilities = function(requestStructure)
{
	var list = this.exportActiveCapabilitiesAsList();
	if (oFF.notNull(list))
	{
		requestStructure.put("Capabilities", list);
	}
	return list;
};
oFF.InACapabilitiesProvider.prototype.exportActiveCapabilitiesAsList = function()
{
	var intersectCapabilities = null;
	var activeMainCapabilities = this.getActiveCapabilities();
	if (oFF.notNull(activeMainCapabilities))
	{
		if (activeMainCapabilities.containsKey(oFF.InACapabilities.C003_CLIENT_CAPABILITIES))
		{
			var sortedCapabilityNames = activeMainCapabilities.getSortedCapabilityNames();
			intersectCapabilities = oFF.PrFactory.createList();
			intersectCapabilities.addAllStrings(sortedCapabilityNames);
		}
	}
	return intersectCapabilities;
};
oFF.InACapabilitiesProvider.prototype.getDimensionExtensionCapabilities = function()
{
	return this.m_dimensionExtensionCapabilities;
};
oFF.InACapabilitiesProvider.prototype.getDocumentCapabilities = function()
{
	return this.m_documentCapabilities;
};
oFF.InACapabilitiesProvider.prototype.importDeserializationDocumentCapabilities = function(document)
{
	this.m_deserializationDocumentCapabilities = oFF.CapabilityContainer.create("Document");
	var analytics = document.getStructureByKey("Analytics");
	if (oFF.notNull(analytics))
	{
		var capabilities = analytics.getListByKey("Capabilities");
		if (oFF.notNull(capabilities))
		{
			for (var i = 0; i < capabilities.size(); i++)
			{
				var value = capabilities.getStringAt(i);
				this.m_deserializationDocumentCapabilities.addCapability(value);
			}
		}
	}
};
oFF.InACapabilitiesProvider.prototype.activateDevCapabilities = function(featureToggleNames)
{
	if (oFF.notNull(featureToggleNames) && featureToggleNames.hasElements())
	{
		var serverBetaCapabilities = this.getServerBetaCapabilities();
		var serverMainCapabilities = this.getServerMainCapabilities();
		var activeMainCapabilities = this.getActiveCapabilities();
		var iterator = featureToggleNames.getIterator();
		var session = this.getSession();
		while (iterator.hasNext())
		{
			var featureToggleName = iterator.next();
			if (oFF.XStringUtils.isNotNullAndNotEmpty(featureToggleName) && oFF.XString.containsString(featureToggleName, "."))
			{
				featureToggleName = oFF.XString.substring(featureToggleName, oFF.XString.indexOf(featureToggleName, ".") + 1, oFF.XString.size(featureToggleName));
			}
			if (serverBetaCapabilities.containsKey(featureToggleName) && oFF.InACapabilitiesProvider.isDevCapabilityValid(featureToggleName, session))
			{
				activeMainCapabilities.addCapability(featureToggleName);
			}
			if (serverMainCapabilities.containsKey(featureToggleName))
			{
				activeMainCapabilities.addCapability(featureToggleName);
			}
		}
	}
};
oFF.InACapabilitiesProvider.prototype.getServerMetadata = function()
{
	return this.m_serverMetadata;
};
oFF.InACapabilitiesProvider.prototype.getProviderType = function()
{
	return this.m_providerType;
};
oFF.InACapabilitiesProvider.prototype.toString = function()
{
	var buffer = oFF.XStringBuffer.create();
	if (oFF.notNull(this.m_serverMainCapabilities))
	{
		buffer.appendLine("=== Server Main Capabilities ===");
		buffer.appendLine(this.m_serverMainCapabilities.toString());
	}
	if (oFF.notNull(this.m_serverBetaCapabilities))
	{
		buffer.appendLine("=== Server Beta Capabilities ===");
		buffer.appendLine(this.m_serverBetaCapabilities.toString());
	}
	if (oFF.notNull(this.m_clientMainCapabilities))
	{
		buffer.appendLine("=== Client Main Capabilities ===");
		buffer.appendLine(this.m_clientMainCapabilities.toString());
	}
	if (oFF.notNull(this.m_clientFeatureToggleCapabilities))
	{
		buffer.appendLine("=== Client FeatureToggle Capabilities ===");
		buffer.appendLine(this.m_clientFeatureToggleCapabilities.toString());
	}
	if (oFF.notNull(this.m_activeCapabilities))
	{
		buffer.appendLine("=== Active Capabilities ===");
		buffer.appendLine(this.m_activeCapabilities.toString());
	}
	if (oFF.notNull(this.m_serverPersistencyCapabilities))
	{
		buffer.appendLine("=== Server Persistency Capabilities ===");
		buffer.appendLine(this.m_serverPersistencyCapabilities.toString());
	}
	return buffer.toString();
};
oFF.InACapabilitiesProvider.prototype.getServerCapabilitiesForProviderType = function(providerType, getBeta)
{
	var serviceName = oFF.QInAConverter.lookupServiceNameForProvider(providerType);
	if (oFF.isNull(serviceName))
	{
		serviceName = oFF.QInAConverter.lookupFallbackServiceNameForProvider(providerType);
	}
	if (oFF.notNull(serviceName))
	{
		var capaContainer = getBeta ? this.m_serverMetadata.getBetaMetadataForService(serviceName) : this.m_serverMetadata.getMetadataForService(serviceName);
		return capaContainer;
	}
	return null;
};
oFF.InACapabilitiesProvider.prototype.getQueryCapabilities = function()
{
	var newCapabilities = oFF.QCapabilities.create();
	newCapabilities.setSystemType(this.m_serverMetadata.getSystemDescription().getSystemType());
	newCapabilities.setSystemName(this.m_serverMetadata.getSystemDescription().getSystemName());
	newCapabilities.setServerMetadataVersion(this.m_serverMetadata.getVersion());
	var activeCapabilities = this.getActiveCapabilities();
	oFF.InACapabilitiesProvider.importCapabilities(activeCapabilities, newCapabilities);
	var dimensionExtensionCapabilities = this.getDimensionExtensionCapabilities();
	oFF.InACapabilitiesProvider.importDimensionExtensionCapabilities(dimensionExtensionCapabilities, newCapabilities);
	return newCapabilities;
};

oFF.AbstractOlapEnvQueryManagerHandler = function() {};
oFF.AbstractOlapEnvQueryManagerHandler.prototype = new oFF.XObject();
oFF.AbstractOlapEnvQueryManagerHandler.prototype._ff_c = "AbstractOlapEnvQueryManagerHandler";

oFF.AbstractOlapEnvQueryManagerHandler.prototype.m_olapEnvArea = null;
oFF.AbstractOlapEnvQueryManagerHandler.prototype.m_selectionMap = null;
oFF.AbstractOlapEnvQueryManagerHandler.prototype.setupQueryManagerHandler = function(olapEnvArea)
{
	this.m_selectionMap = oFF.XHashMapOfStringByString.create();
	this.m_olapEnvArea = oFF.XWeakReferenceUtil.getWeakRef(olapEnvArea);
};
oFF.AbstractOlapEnvQueryManagerHandler.prototype.releaseObject = function()
{
	this.m_olapEnvArea = oFF.XObjectExt.release(this.m_olapEnvArea);
	this.m_selectionMap = oFF.XObjectExt.release(this.m_selectionMap);
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.AbstractOlapEnvQueryManagerHandler.prototype.getTaggedQueryManagers = function()
{
	var queryManagerList = this.getOlapEnv().getAllAreaQueryManager();
	if (this.m_selectionMap.isEmpty())
	{
		return queryManagerList;
	}
	var selection = oFF.XList.create();
	var queryManagerSize = queryManagerList.size();
	for (var i = 0; i < queryManagerSize; i++)
	{
		var queryManager = queryManagerList.get(i);
		var checkTagging = queryManager.getTagging();
		var iterator = this.m_selectionMap.getKeysAsIteratorOfString();
		var ok = true;
		while (iterator.hasNext())
		{
			var key = iterator.next();
			var value = this.m_selectionMap.getByKey(key);
			var checkValue = checkTagging.getByKey(key);
			if (!oFF.XString.isEqual(value, checkValue))
			{
				ok = false;
				break;
			}
		}
		if (ok)
		{
			selection.add(queryManager);
		}
	}
	return selection;
};
oFF.AbstractOlapEnvQueryManagerHandler.prototype.getOlapEnv = function()
{
	return oFF.XWeakReferenceUtil.getHardRef(this.m_olapEnvArea);
};
oFF.AbstractOlapEnvQueryManagerHandler.prototype.getApplication = function()
{
	return this.getOlapEnv().getApplication();
};
oFF.AbstractOlapEnvQueryManagerHandler.prototype.getSession = function()
{
	return this.getOlapEnv().getSession();
};
oFF.AbstractOlapEnvQueryManagerHandler.prototype.getProcess = function()
{
	return this.getOlapEnv().getProcess();
};
oFF.AbstractOlapEnvQueryManagerHandler.prototype.getSelectionMap = function()
{
	return this.m_selectionMap;
};

oFF.OlapEnvVariable = function() {};
oFF.OlapEnvVariable.prototype = new oFF.DfNameObject();
oFF.OlapEnvVariable.prototype._ff_c = "OlapEnvVariable";

oFF.OlapEnvVariable.create = function(key, master)
{
	var newObj = new oFF.OlapEnvVariable();
	newObj._setupInternal(key);
	newObj.m_mainVariable = master;
	newObj.m_secondaryVariables = oFF.XList.create();
	return newObj;
};
oFF.OlapEnvVariable.prototype.m_mainVariable = null;
oFF.OlapEnvVariable.prototype.m_secondaryVariables = null;
oFF.OlapEnvVariable.prototype.releaseObject = function()
{
	this.m_mainVariable = null;
	this.m_secondaryVariables = oFF.XObjectExt.release(this.m_secondaryVariables);
	oFF.DfNameObject.prototype.releaseObject.call( this );
};
oFF.OlapEnvVariable.prototype.addSecondaryVariable = function(variable)
{
	this.m_secondaryVariables.add(variable);
};
oFF.OlapEnvVariable.prototype.getMainVariable = function()
{
	return this.m_mainVariable;
};
oFF.OlapEnvVariable.prototype.sync = function()
{
	var serialization = this.m_mainVariable.serializeToElement(oFF.QModelFormat.INA_REPOSITORY);
	for (var i = 0; i < this.m_secondaryVariables.size(); i++)
	{
		var secondary = this.m_secondaryVariables.get(i);
		secondary.deserializeFromElementExt(oFF.QModelFormat.INA_REPOSITORY, serialization);
	}
};

oFF.OlapEnvStateManager = function() {};
oFF.OlapEnvStateManager.prototype = new oFF.AbstractOlapEnvQueryManagerHandler();
oFF.OlapEnvStateManager.prototype._ff_c = "OlapEnvStateManager";

oFF.OlapEnvStateManager.create = function(olapEnvArea, session)
{
	var stateManager = new oFF.OlapEnvStateManager();
	stateManager.setupStateManager(olapEnvArea, session);
	return stateManager;
};
oFF.OlapEnvStateManager.prototype.m_stateCache = null;
oFF.OlapEnvStateManager.prototype.m_olapEnvStates = null;
oFF.OlapEnvStateManager.prototype.m_jsonParser = null;
oFF.OlapEnvStateManager.prototype.m_useIncludeMode = false;
oFF.OlapEnvStateManager.prototype.m_releaseQueryManagersEnabled = false;
oFF.OlapEnvStateManager.prototype.setupStateManager = function(olapEnvArea, session)
{
	this.setupQueryManagerHandler(olapEnvArea);
	this.m_stateCache = oFF.XLinkedMap.createLinkedMap();
	this.m_olapEnvStates = oFF.XHashMapByString.create();
	this.m_jsonParser = oFF.JsonParserFactory.newInstance();
	this.m_releaseQueryManagersEnabled = oFF.isNull(session) || session.hasFeature(oFF.FeatureToggleOlap.UNDO_RELEASE_QUERY_MANAGERS);
	this.setUseIncludeMode(oFF.notNull(session) && session.hasFeature(oFF.FeatureToggleOlap.UNDO_USE_ALLOW_LIST));
};
oFF.OlapEnvStateManager.prototype.releaseObject = function()
{
	this.m_stateCache = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_stateCache);
	this.m_jsonParser = oFF.XObjectExt.release(this.m_jsonParser);
	this.m_olapEnvStates = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_olapEnvStates);
	oFF.AbstractOlapEnvQueryManagerHandler.prototype.releaseObject.call( this );
};
oFF.OlapEnvStateManager.prototype.applyDocumentState = function(syncType, listener, customIdentifier, stateId)
{
	var olapState = this.m_olapEnvStates.getByKey(stateId);
	if (oFF.isNull(olapState))
	{
		return null;
	}
	return oFF.DocumentUpdateAction.createAndRun(syncType, listener, customIdentifier, this, olapState);
};
oFF.OlapEnvStateManager.prototype.recordDocumentState = function()
{
	var olapEnvState = oFF.OlapEnvState.create();
	var olapStateId = oFF.XGuid.getGuid();
	var filterManagerState = this.recordFilterManagerState(olapStateId);
	olapEnvState.setFilterManagerState(filterManagerState);
	var sharedObjectsState = this.recordClientQueryObjectManagerState();
	olapEnvState.setSharedObjectsState(sharedObjectsState);
	var queryManagers = this.getOlapEnv().getAllAreaQueryManager();
	oFF.XCollectionUtils.forEach(queryManagers,  function(queryManager){
		var element;
		if (queryManager.getOlapComponentType() === oFF.OlapComponentType.BLENDABLE_QUERY_MANAGER)
		{
			element = this.recordBlendableQueryManagerState(queryManager, olapStateId);
		}
		else
		{
			element = this.recordQueryManagerState(queryManager, olapStateId);
		}
		olapEnvState.getQueryManagersState().put(queryManager.getName(), element);
	}.bind(this));
	this.m_olapEnvStates.put(olapStateId, olapEnvState);
	return olapStateId;
};
oFF.OlapEnvStateManager.prototype.updateDocumentState = function(stateId)
{
	var olapState = this.m_olapEnvStates.getByKey(stateId);
	if (olapState.getFilterManagerState() === null)
	{
		var filterManagerState = this.recordFilterManagerState(stateId);
		olapState.setFilterManagerState(filterManagerState);
	}
	if (olapState.getSharedObjectsState() === null)
	{
		var sharedObjectsState = this.recordClientQueryObjectManagerState();
		olapState.setSharedObjectsState(sharedObjectsState);
	}
	var queryManagers = this.getOlapEnv().getAllAreaQueryManager();
	oFF.XCollectionUtils.forEach(queryManagers,  function(queryManager){
		var name = queryManager.getName();
		var qmState = this.getQmState(olapState, name);
		if (oFF.XStringUtils.isNullOrEmpty(qmState))
		{
			var element;
			if (queryManager.getOlapComponentType() === oFF.OlapComponentType.BLENDABLE_QUERY_MANAGER)
			{
				element = this.recordBlendableQueryManagerState(queryManager, stateId);
			}
			else
			{
				element = this.recordQueryManagerState(queryManager, stateId);
			}
			olapState.getQueryManagersState().put(queryManager.getName(), element);
		}
	}.bind(this));
};
oFF.OlapEnvStateManager.prototype.clearDocumentState = function(stateId)
{
	var olapState = this.m_olapEnvStates.remove(stateId);
	if (oFF.notNull(olapState))
	{
		this.releaseRef(olapState.getSharedObjectsState(), stateId);
		this.releaseRef(olapState.getFilterManagerState(), stateId);
		var iterator = olapState.getQueryManagersState().getValuesAsReadOnlyList().getIterator();
		while (iterator.hasNext())
		{
			this.releaseRef(iterator.next(), stateId);
		}
		olapState.getQueryManagersState().clear();
	}
};
oFF.OlapEnvStateManager.prototype.releaseRef = function(stateRef, olapStateId)
{
	if (oFF.isNull(stateRef))
	{
		return;
	}
	var byKey = this.m_stateCache.getByKey(stateRef.getStateId());
	if (oFF.notNull(byKey))
	{
		byKey.getOlapStateRefs().removeElement(olapStateId);
		if (byKey.getOlapStateRefs().isEmpty())
		{
			this.m_stateCache.removeElement(byKey);
		}
	}
};
oFF.OlapEnvStateManager.prototype.recordClientQueryObjectManagerState = function()
{
	return null;
};
oFF.OlapEnvStateManager.prototype.recordFilterManagerState = function(olapStateId)
{
	var filterManager = this.getOlapEnv().getFilterManager();
	var modCounter = filterManager.getModCounter();
	var state = this.getStateWithModeCounter(modCounter, "filterManager", olapStateId);
	if (oFF.notNull(state))
	{
		return state;
	}
	var rootStructure = filterManager.serializeToElement(oFF.QModelFormat.INA_REPOSITORY).asStructure();
	return this.addNewStateToCache(filterManager.getModCounter(), rootStructure, "filterManager", olapStateId);
};
oFF.OlapEnvStateManager.prototype.recordBlendableQueryManagerState = function(blendableQueryManager, olapStateId)
{
	var ignore = this.hasToBeIgnored(blendableQueryManager);
	var modCounter = 0;
	if (!ignore)
	{
		modCounter = blendableQueryManager.getModCounter();
	}
	var state = this.getStateWithModeCounter(modCounter, blendableQueryManager.getName(), olapStateId);
	if (oFF.isNull(state))
	{
		var rootStructure = oFF.PrFactory.createStructure();
		if (!ignore)
		{
			var element = blendableQueryManager.serializeToElement(oFF.QModelFormat.INA_REPOSITORY).asStructure();
			rootStructure.put(oFF.QStateConstants.QUERY_MODEL, element);
			rootStructure.put(oFF.QStateConstants.MANAGER_TAGS, element.getByKey(oFF.QStateConstants.MANAGER_TAGS));
			var queryManagersIter = blendableQueryManager.getAllQueryManagers().getIterator();
			var qmExtFilters = rootStructure.putNewList(oFF.QStateConstants.QUERY_MANAGER_EXTERNAL_FILTERS);
			while (queryManagersIter.hasNext())
			{
				var leafQueryManager = queryManagersIter.next();
				var qmExtFilter = qmExtFilters.addNewStructure();
				qmExtFilter.putString(oFF.QStateConstants.MANAGER_DATASET_ID, leafQueryManager.getQueryModel().getDatasetId());
				this.recordUsedExternalFilters(leafQueryManager, qmExtFilter);
			}
		}
		state = this.addNewStateToCache(modCounter, rootStructure, blendableQueryManager.getName(), olapStateId);
	}
	return state;
};
oFF.OlapEnvStateManager.prototype.recordQueryManagerState = function(queryManager, olapStateId)
{
	var queryModel = queryManager.getQueryModelBase();
	var ignore = this.hasToBeIgnored(queryManager);
	var modCounter = 0;
	if (!ignore)
	{
		modCounter = queryModel.getModCounter();
	}
	var state = this.getStateWithModeCounter(modCounter, queryManager.getName(), olapStateId);
	if (oFF.isNull(state))
	{
		var rootStructure = oFF.PrFactory.createStructure();
		if (!ignore)
		{
			var element = queryManager.serializeToElement(oFF.QModelFormat.INA_REPOSITORY).asStructure();
			var qmodel = element.getByKey(oFF.QStateConstants.QUERY_MODEL);
			rootStructure.put(oFF.QStateConstants.QUERY_MODEL, qmodel);
			rootStructure.put(oFF.QStateConstants.MANAGER_TAGS, element.getByKey(oFF.QStateConstants.MANAGER_TAGS));
			rootStructure.putString(oFF.QStateConstants.MANAGER_DATASET_ID, queryModel.getDatasetId());
			rootStructure.putString(oFF.QStateConstants.MANAGER_SYSTEM_NAME, queryManager.getSystemName());
			this.recordUsedExternalFilters(queryManager, rootStructure);
		}
		state = this.addNewStateToCache(modCounter, rootStructure, queryManager.getName(), olapStateId);
	}
	return state;
};
oFF.OlapEnvStateManager.prototype.hasToBeIgnored = function(queryManager)
{
	var tagging = queryManager.getTagging();
	var ignoredByTag = this.m_useIncludeMode ? !tagging.containsKey(oFF.QStateConstants.TAG_UNDO_INCLUDE) : tagging.containsKey(oFF.QStateConstants.TAG_UNDO_IGNORE);
	ignoredByTag = ignoredByTag || tagging.containsKey(oFF.QStateConstants.TAG_HAS_TRANSIENT_DEPS);
	return ignoredByTag || queryManager.isShallow() || queryManager.isBasedOnVirtualDataSource();
};
oFF.OlapEnvStateManager.prototype.addNewStateToCache = function(modCounter, rootStructure, qmName, olapStateId)
{
	var stateId = oFF.XStringUtils.concatenate2(qmName, oFF.XInteger.convertToString(modCounter));
	var stateString = rootStructure.isEmpty() ? "" : oFF.PrUtils.serialize(rootStructure, false, false, 0);
	var stackEntry = oFF.StateStackEntry.create(stateId, stateString);
	stackEntry.getOlapStateRefs().add(olapStateId);
	this.m_stateCache.add(stackEntry);
	return oFF.ComponentStateRef.create(modCounter, stateId);
};
oFF.OlapEnvStateManager.prototype.getStateWithModeCounter = function(modCounter, qmName, olapStateId)
{
	var stateId = oFF.XStringUtils.concatenate2(qmName, oFF.XInteger.convertToString(modCounter));
	var state = this.m_stateCache.getByKey(stateId);
	if (oFF.notNull(state))
	{
		state.getOlapStateRefs().add(olapStateId);
		return oFF.ComponentStateRef.create(modCounter, stateId);
	}
	return null;
};
oFF.OlapEnvStateManager.prototype.recordUsedExternalFilters = function(queryManager, inaQueryManager)
{
	var externalFilters = queryManager.getQueryModel().getFilter().getLinkedFilters();
	var inaUsedFilters = inaQueryManager.putNewList("OlapFilters");
	var itExtFilter = externalFilters.getKeysAsIteratorOfString();
	while (itExtFilter.hasNext())
	{
		var usedFilter = inaUsedFilters.addNewStructure();
		var key = itExtFilter.next();
		usedFilter.putString("Name", key);
		usedFilter.putString("Id", externalFilters.getByKey(key).getUniqueId());
	}
};
oFF.OlapEnvStateManager.prototype.dumpState = function(stateId)
{
	var dump = oFF.PrFactory.createStructure();
	var olapState = this.m_olapEnvStates.getByKey(stateId);
	var filterStructure = this.m_jsonParser.parse(this.m_stateCache.getByKey(olapState.getFilterManagerState().getStateId()).getState());
	dump.put("fm", filterStructure);
	var qmNames = olapState.getQueryManagersState().getKeysAsIteratorOfString();
	while (qmNames.hasNext())
	{
		var qmName = qmNames.next();
		var state = this.getQmState(olapState, qmName);
		var inaState;
		if (oFF.XStringUtils.isNotNullAndNotEmpty(state))
		{
			inaState = this.m_jsonParser.parse(state);
		}
		else
		{
			inaState = oFF.PrFactory.createStructure();
		}
		dump.put(qmName, inaState);
	}
	return dump;
};
oFF.OlapEnvStateManager.prototype.getQmState = function(olapState, qmName)
{
	var qmState = olapState.getQueryManagersState().getByKey(qmName);
	if (oFF.isNull(qmState))
	{
		return null;
	}
	return this.m_stateCache.getByKey(qmState.getStateId()).getState();
};
oFF.OlapEnvStateManager.prototype.setUseIncludeMode = function(useIncludeMode)
{
	this.m_useIncludeMode = useIncludeMode;
};
oFF.OlapEnvStateManager.prototype.onVariableProcessorExecuted = function(extResult, result, customIdentifier) {};
oFF.OlapEnvStateManager.prototype.isReleaseQueryManagersEnabled = function()
{
	return this.m_releaseQueryManagersEnabled;
};
oFF.OlapEnvStateManager.prototype.getStateCache = function()
{
	return this.m_stateCache;
};

oFF.PreQueryExecutor = function() {};
oFF.PreQueryExecutor.prototype = new oFF.MessageManager();
oFF.PreQueryExecutor.prototype._ff_c = "PreQueryExecutor";

oFF.PreQueryExecutor.create = function(queryManager)
{
	var preQueryExecutor = new oFF.PreQueryExecutor();
	preQueryExecutor.setupSessionContext(null);
	preQueryExecutor.m_queryManager = queryManager;
	preQueryExecutor.m_messageReceivers = oFF.XList.create();
	return preQueryExecutor;
};
oFF.PreQueryExecutor.prototype.m_queryManager = null;
oFF.PreQueryExecutor.prototype.m_preQueryManager = null;
oFF.PreQueryExecutor.prototype.m_preQueryExecutedListener = null;
oFF.PreQueryExecutor.prototype.m_messageReceivers = null;
oFF.PreQueryExecutor.prototype.releaseObject = function()
{
	oFF.MessageManager.prototype.releaseObject.call( this );
	this.m_queryManager = null;
	this.m_preQueryManager = null;
	this.m_preQueryExecutedListener = null;
	this.m_messageReceivers = oFF.XObjectExt.release(this.m_messageReceivers);
};
oFF.PreQueryExecutor.prototype.serializeRemotePreQueries = function(syncType, mainSystemName, preQueries, preQueryExecutedListener)
{
	this.clearMessages();
	this.m_preQueryExecutedListener = preQueryExecutedListener;
	if (oFF.XCollectionUtils.hasElements(preQueries))
	{
		for (var i = 0; i < preQueries.size(); i++)
		{
			var preQueryManager = preQueries.get(i).getObject().getQueryManager();
			var preQueryExecutor = preQueryManager.getPreQueryExecutor();
			if (!preQueryExecutor.serializeRemotePreQueries(syncType, preQueryManager.getSystemName(), preQueryManager.getQueryModel().getPreQueries(), preQueryExecutedListener))
			{
				this.addAllMessages(preQueryExecutor);
				return false;
			}
			if (!oFF.XString.isEqual(mainSystemName, preQueryManager.getSystemName()))
			{
				if (!this.serializeAsRemotePreQuery(preQueryManager, syncType, mainSystemName))
				{
					return false;
				}
			}
		}
	}
	return this.isValid();
};
oFF.PreQueryExecutor.prototype.serializeAsRemotePreQuery = function(preQueryManager, syncType, mainSystemName)
{
	var queryModel = preQueryManager.getQueryModelBase();
	queryModel.getUniversalDisplayHierarchiesBase().updateIncludedDimensions();
	queryModel.generateTransientObjects();
	queryModel.getDrillManager().checkRootNodeFetching();
	var persistenceIdentifier = this.updateResultSetPersistenceTarget(preQueryManager, mainSystemName);
	queryModel.destroyTransientObjects();
	preQueryManager.setResultSetPersistenceIdentifier(persistenceIdentifier);
	var resultSetSyncState = preQueryManager.getResultSetSyncState();
	if (resultSetSyncState === oFF.SyncState.OUT_OF_SYNC || resultSetSyncState === oFF.SyncState.PROCESSING)
	{
		this.m_preQueryManager = preQueryManager;
		var cache = preQueryManager.getOlapEnv().getCachedRemoteBlendingData(persistenceIdentifier);
		if (oFF.notNull(cache))
		{
			preQueryManager.getActiveResultSetContainer().setSerializedData(cache.getView(), cache.getCube());
		}
		else if (syncType === oFF.SyncType.BLOCKING)
		{
			var syncAction;
			var connection = preQueryManager.getConnection();
			if (connection.isBatchModeEnabled() && this.hasModelPrequeries(preQueryManager.getQueryModelBase()))
			{
				connection.getConnectionPool().disableBatchMode(oFF.SyncType.NON_BLOCKING, preQueryManager.getSystemName());
				syncAction = preQueryManager.processQueryExecutionAsRemotePreQuery(oFF.SyncType.BLOCKING, null, null);
				connection.getConnectionPool().enableBatchMode(preQueryManager.getSystemName());
			}
			else
			{
				syncAction = preQueryManager.processQueryExecutionAsRemotePreQuery(oFF.SyncType.BLOCKING, null, null);
			}
			this.addMessageReceiver(this);
			this.onPreQueryExecuted(syncAction, true);
		}
		else
		{
			this.addMessageReceiver(this);
			preQueryManager.processQueryExecutionAsRemotePreQuery(syncType, this, oFF.XStringValue.create("RemotePreQuerySerialization"));
			return false;
		}
	}
	else if (resultSetSyncState === oFF.SyncState.IN_SYNC_WITH_ERROR)
	{
		this.addAllMessages(preQueryManager.getActiveResultSetContainer());
	}
	return this.isValid();
};
oFF.PreQueryExecutor.prototype.hasModelPrequeries = function(preQueryModel)
{
	var hasPreQueries = this.hasPrequeries(preQueryModel);
	if (!hasPreQueries)
	{
		preQueryModel.generateTransientObjects();
		hasPreQueries = this.hasPrequeries(preQueryModel);
		preQueryModel.destroyTransientObjects();
	}
	return hasPreQueries;
};
oFF.PreQueryExecutor.prototype.hasPrequeries = function(preQueryModel)
{
	return oFF.XCollectionUtils.hasElements(preQueryModel.getPreQueries()) || oFF.XCollectionUtils.contains(preQueryModel.getLoadedDimensions(),  function(dim){
		return dim.getDimensionType().isTypeOf(oFF.DimensionType.FORMULA_CALCULATED_DIMENSION);
	}.bind(this));
};
oFF.PreQueryExecutor.prototype.onQueryExecuted = function(extResult, resultSetContainer, customIdentifier)
{
	if (oFF.notNull(customIdentifier) && oFF.XString.isEqual(customIdentifier.toString(), "RemotePreQuerySerialization"))
	{
		this.onPreQueryExecuted(extResult, true);
		this.m_preQueryExecutedListener.onPreQueryExecuted();
	}
	else
	{
		this.onPreQueryExecuted(extResult, false);
	}
};
oFF.PreQueryExecutor.prototype.onPreQueryExecuted = function(extResult, isRemotePreQuerySerialization)
{
	var queryModel = this.m_preQueryManager.getQueryModel();
	if (oFF.notNull(queryModel) && !queryModel.isReleased())
	{
		queryModel.addQueryModelIdToMessages(extResult.getMessages());
		if (isRemotePreQuerySerialization || this.isStreamingEnabled())
		{
			for (var i = 0; i < this.m_messageReceivers.size(); i++)
			{
				this.m_messageReceivers.get(i).copyAllMessages(extResult);
			}
		}
		this.m_messageReceivers.clear();
	}
};
oFF.PreQueryExecutor.prototype.isStreamingEnabled = function()
{
	var connectionContainer = this.m_preQueryManager.getServiceConfig().getConnectionContainer();
	if (oFF.notNull(connectionContainer))
	{
		var batchRequestManager = connectionContainer.getBatchRequestManager();
		if (oFF.notNull(batchRequestManager))
		{
			return batchRequestManager.isRsStreamingEnabled();
		}
	}
	return false;
};
oFF.PreQueryExecutor.prototype.processExecutionAsPreQueryInBatch = function(batchSystemName, preQueryName, messageReceiver)
{
	if (this.m_queryManager.getActiveResultSetContainer().getSyncState() === oFF.SyncState.PROCESSING)
	{
		this.addMessageReceiver(messageReceiver);
		return;
	}
	var tmpResultSetTransportEnabled = this.m_queryManager.isResultSetTransportEnabled();
	this.m_queryManager.setResultSetTransportEnabled(false);
	if (oFF.XString.isEqual(batchSystemName, this.m_queryManager.getSystemName()))
	{
		this.m_preQueryManager = this.m_queryManager;
		this.addMessageReceiver(messageReceiver);
		this.m_queryManager.setPreQueryName(preQueryName);
		this.m_queryManager.processQueryExecution(oFF.SyncType.NON_BLOCKING, this, null);
		this.restoreData(tmpResultSetTransportEnabled, null);
	}
	else
	{
		var service = this.m_queryManager;
		var tmpConnection = service.getConnection();
		service.setConnection(tmpConnection.getConnectionPool().getConnection(batchSystemName));
		this.m_queryManager.setPreQueryName(preQueryName);
		this.m_queryManager.processQueryExecutionAsRemotePreQuery(oFF.SyncType.NON_BLOCKING, null, null);
		this.restoreData(tmpResultSetTransportEnabled, tmpConnection);
	}
};
oFF.PreQueryExecutor.prototype.addMessageReceiver = function(messageReceiver)
{
	if (oFF.notNull(messageReceiver))
	{
		this.m_messageReceivers.add(messageReceiver);
	}
};
oFF.PreQueryExecutor.prototype.restoreData = function(resultSetTransportEnabled, connectionContainer)
{
	if (oFF.notNull(connectionContainer))
	{
		this.m_queryManager.setConnection(connectionContainer);
	}
	this.m_queryManager.getActiveResultSetContainer().setResultSetTransportEnabled(resultSetTransportEnabled);
	this.m_queryManager.setPreQueryName(null);
};
oFF.PreQueryExecutor.prototype.updateResultSetPersistenceTarget = function(queryManager, batchSystemName)
{
	var batchSystemDescription = queryManager.getApplication().getSystemLandscape().getSystemDescription(batchSystemName);
	if (oFF.notNull(batchSystemDescription))
	{
		if (batchSystemDescription.isSystemMappingValid(queryManager.getSystemDescription()))
		{
			var systemMapping = queryManager.getSystemDescription().getSystemMapping(batchSystemName);
			queryManager.setResultSetPersistanceTargetTable(systemMapping.getSerializeTable());
			queryManager.setResultSetPersistanceTargetSchema(systemMapping.getSerializeSchema());
		}
		else
		{
			queryManager.setResultSetPersistanceTargetTable(null);
			queryManager.setResultSetPersistanceTargetSchema(null);
			return oFF.BlendingSource.createPersistenceIdentifierForPreQuery(queryManager, false);
		}
	}
	return oFF.BlendingSource.createPersistenceIdentifierForPreQuery(queryManager, true);
};
oFF.PreQueryExecutor.prototype.processExecutionRuntimePrequery = function(syncType, runtimeQuery, preQueryExecutedListener)
{
	var generateRemoteQuery = runtimeQuery.generateRemoteQuery(this.m_queryManager);
	if (generateRemoteQuery.hasErrors())
	{
		var errorCollection = oFF.ExtResult.createWithExternalMessages(null, generateRemoteQuery);
		preQueryExecutedListener.onFunctionExecuted(errorCollection, null, runtimeQuery);
		return oFF.SyncActionExtRes.createSyncAction(null, generateRemoteQuery);
	}
	var connectionPool = this.m_queryManager.getApplication().getConnectionPool();
	var remoteConnection = connectionPool.getConnection(runtimeQuery.getSystemName());
	var systemDescription = remoteConnection.getSystemDescription();
	var remoteFunction = remoteConnection.newRpcFunction(systemDescription.getSystemType().getInAPath());
	var rpcRequest = remoteFunction.getRpcRequest();
	rpcRequest.setSapPassportConnectionId(this.m_queryManager.getInstanceId());
	rpcRequest.setRequestStructure(generateRemoteQuery.getData());
	return remoteFunction.processFunctionExecution(syncType, preQueryExecutedListener, runtimeQuery);
};

oFF.BlendableQMPersistedInAExportAction = function() {};
oFF.BlendableQMPersistedInAExportAction.prototype = new oFF.SyncAction();
oFF.BlendableQMPersistedInAExportAction.prototype._ff_c = "BlendableQMPersistedInAExportAction";

oFF.BlendableQMPersistedInAExportAction.create = function(blendableQueryManager)
{
	var runtimeBlendedQueryManagerAction = new oFF.BlendableQMPersistedInAExportAction();
	runtimeBlendedQueryManagerAction.setupAction(null, null, null, blendableQueryManager);
	return runtimeBlendedQueryManagerAction;
};
oFF.BlendableQMPersistedInAExportAction.prototype.m_blendingProcess = null;
oFF.BlendableQMPersistedInAExportAction.prototype.releaseObject = function()
{
	this.m_blendingProcess.postQueryExecution();
	this.m_blendingProcess = oFF.XObjectExt.release(this.m_blendingProcess);
	oFF.SyncAction.prototype.releaseObject.call( this );
};
oFF.BlendableQMPersistedInAExportAction.prototype.processSynchronization = function(syncType)
{
	var blendableQueryManager = this.getActionContext();
	this.m_blendingProcess = oFF.BlendingProcess.create(blendableQueryManager, blendableQueryManager.getBlendingProcessConfigs(this), null, null, true);
	if (this.hasErrors())
	{
		return false;
	}
	this.m_blendingProcess.processBlendedQueryManagerCreation(syncType, this, null);
	return true;
};
oFF.BlendableQMPersistedInAExportAction.prototype.onQueryManagerCreated = function(extResult, queryManager, customIdentifier)
{
	this.addAllMessages(extResult);
	if (!extResult.hasErrors())
	{
		this.m_blendingProcess.prepareQueryExecution();
		var blendingDefinition = queryManager.getQueryModel().getDataSource().getBlendingDefinition();
		var blendingHost = blendingDefinition.getBlendingHost();
		var blendingSources = oFF.BlendingUtils.getLeafBlendingSources(blendingDefinition);
		var dependentQueries = oFF.XList.create();
		for (var i = 0; i < blendingSources.size(); i++)
		{
			var source = blendingSources.get(i);
			var remoteQueryMangager = source.getQueryManager();
			var localSystemDescription = blendingHost.getSystemDescription();
			var remoteSystemDescription = remoteQueryMangager.getSystemDescription();
			remoteQueryMangager.getQueryModel().generateTransientObjects();
			var preQueries = remoteQueryMangager.getQueryModel().getPreQueries();
			if (oFF.notNull(preQueries))
			{
				for (var j = 0; j < preQueries.size(); j++)
				{
					var preQuery = preQueries.get(j);
					var preQueryModel = preQuery.getObject();
					if (!oFF.XString.isEqual(preQueryModel.getSystemName(), remoteQueryMangager.getSystemName()))
					{
						this.addWarning(oFF.ErrorCodes.PERSISTED_INA_REMOTE_MODEL_WITH_PREQUERIES_NOT_SUPPORTED, "Prequeries from different system are not supported with remote blend model.");
						this.setData(oFF.BlendableQMPersistedInAResult.create(null, oFF.XList.create(), queryManager, blendingHost.getSystemName()));
						this.endSync();
						remoteQueryMangager.getQueryModel().destroyTransientObjects();
						return;
					}
				}
			}
			if (source.isRemoteSource() && oFF.notNull(remoteSystemDescription))
			{
				this.addSecondaryInaToDependentQueries(remoteQueryMangager, localSystemDescription, remoteSystemDescription, dependentQueries);
			}
			remoteQueryMangager.getQueryModel().destroyTransientObjects();
		}
		var result = oFF.BlendableQMPersistedInAResult.create(queryManager.serializeToElement(oFF.QModelFormat.INA_PERSISTED_QUERY_DATA), dependentQueries, queryManager, blendingHost.getSystemName());
		this.setData(result);
	}
	this.m_blendingProcess.postQueryExecution();
	this.endSync();
};
oFF.BlendableQMPersistedInAExportAction.prototype.addSecondaryInaToDependentQueries = function(remoteQueryMangager, localSystemDescription, remoteSystemDescription, dependentQueries)
{
	var identifier = remoteQueryMangager.getResultSetPersistenceIdentifier();
	remoteQueryMangager.setResultSetPersistenceIdentifier(null);
	var secondaryInaQuery = remoteQueryMangager.serializeToElement(oFF.QModelFormat.INA_PERSISTED_QUERY_DATA);
	if (!localSystemDescription.isSystemMappingValid(remoteSystemDescription))
	{
		dependentQueries.add(oFF.DependentPersistedQueryInfo.create(remoteQueryMangager.getSystemName(), this.convertToBrowserSerializedDataQuery(secondaryInaQuery)));
	}
	else
	{
		dependentQueries.add(oFF.DependentPersistedQueryInfo.create(remoteQueryMangager.getSystemName(), secondaryInaQuery));
	}
	remoteQueryMangager.setResultSetPersistenceIdentifier(identifier);
};
oFF.BlendableQMPersistedInAExportAction.prototype.convertToBrowserSerializedDataQuery = function(originalQuery)
{
	var convertedQuery = oFF.PrUtils.createDeepCopy(originalQuery);
	var batchQuery = convertedQuery.getStructureByKey(oFF.ConnectionConstants.INA_BATCH);
	var inaDataSource;
	if (oFF.notNull(batchQuery))
	{
		var queryIter = batchQuery.getIterator();
		while (queryIter.hasNext())
		{
			var subquery = queryIter.next();
			inaDataSource = oFF.InARuntimeUtils.getDataSourceFromRequest(subquery);
			inaDataSource.remove("System");
			var subqueryInaRemoteContext = oFF.InARuntimeUtils.getRequestContext(subquery);
			var structureWalker = oFF.PrUtils.getStructureProperty(subquery, "Analytics");
			var definitionStructure = oFF.PrUtils.getStructureProperty(structureWalker, "Definition");
			var featureRequestStructure = oFF.PrUtils.getStructureProperty(definitionStructure, "ResultSetFeatureRequest");
			if (!featureRequestStructure.getBooleanByKeyExt(oFF.InAQueryMergeConstants.QY_RETURN_EMPTY_JSON_RESULTSET, false))
			{
				oFF.InARuntimeUtils.setPersistencyForRemote(subqueryInaRemoteContext, null);
			}
		}
	}
	else
	{
		inaDataSource = oFF.InARuntimeUtils.getDataSourceFromRequest(convertedQuery);
		inaDataSource.remove("System");
		var inaRemoteContext = oFF.InARuntimeUtils.getRequestContext(convertedQuery);
		oFF.InARuntimeUtils.setPersistencyForRemote(inaRemoteContext, null);
	}
	return convertedQuery;
};
oFF.BlendableQMPersistedInAExportAction.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onBlendableQMPersistedInAResult(extResult, data, customIdentifier);
};

oFF.BlendableQMVariableSubmitProcessor = function() {};
oFF.BlendableQMVariableSubmitProcessor.prototype = new oFF.SyncAction();
oFF.BlendableQMVariableSubmitProcessor.prototype._ff_c = "BlendableQMVariableSubmitProcessor";

oFF.BlendableQMVariableSubmitProcessor.createBlendableVariableSubmitProcessor = function(blendableQueryManager)
{
	var blendableVariableSubmitProcessor = new oFF.BlendableQMVariableSubmitProcessor();
	blendableVariableSubmitProcessor.setupAction(null, null, null, blendableQueryManager);
	return blendableVariableSubmitProcessor;
};
oFF.BlendableQMVariableSubmitProcessor.prototype.m_mode = null;
oFF.BlendableQMVariableSubmitProcessor.prototype.m_queryManagersToBeProcessCount = 0;
oFF.BlendableQMVariableSubmitProcessor.prototype.m_variableVariant = null;
oFF.BlendableQMVariableSubmitProcessor.prototype.m_transferVariable = null;
oFF.BlendableQMVariableSubmitProcessor.prototype.releaseObject = function()
{
	this.m_queryManagersToBeProcessCount = 0;
	oFF.SyncAction.prototype.releaseObject.call( this );
};
oFF.BlendableQMVariableSubmitProcessor.prototype.processSynchronization = function(syncType)
{
	var queryManagersToBeProcessed = oFF.XList.create();
	queryManagersToBeProcessed.addAll(this.getActionContext().getAllQueryManagers());
	this.m_queryManagersToBeProcessCount = queryManagersToBeProcessed.size();
	var queryManagersToBeProcessedIter = queryManagersToBeProcessed.getIterator();
	while (queryManagersToBeProcessedIter.hasNext())
	{
		var queryManagerToBeProcessed = queryManagersToBeProcessedIter.next();
		if (this.m_mode === oFF.VariableProcessorState.PROCESSING_SUBMIT)
		{
			queryManagerToBeProcessed.submitVariables(syncType, this, null);
		}
		else if (this.m_mode === oFF.VariableProcessorState.PROCESSING_REINIT)
		{
			queryManagerToBeProcessed.reInitVariablesAfterSubmit(syncType, this, null);
		}
		else if (this.m_mode === oFF.VariableProcessorState.PROCESSING_VARIANT_ACTIVATION)
		{
			queryManagerToBeProcessed.activateVariableVariant(this.m_variableVariant, syncType, this, null);
		}
		else if (this.m_mode === oFF.VariableProcessorState.PROCESSING_CANCEL)
		{
			queryManagerToBeProcessed.cancelReInitVariables(syncType, this, null);
		}
		else if (this.m_mode === oFF.VariableProcessorState.PROCESSING_UPDATE_VALUES)
		{
			if (oFF.notNull(this.m_transferVariable))
			{
				var transferVariablesByVariable = queryManagerToBeProcessed.transferVariablesByVariable(this.m_transferVariable, syncType, this, null);
				if (oFF.isNull(transferVariablesByVariable))
				{
					this.m_queryManagersToBeProcessCount--;
				}
			}
			else
			{
				queryManagerToBeProcessed.transferVariables(syncType, this, null);
			}
		}
		else if (this.m_mode === oFF.VariableProcessorState.PROCESSING_CHECK)
		{
			if (queryManagerToBeProcessed.supportsCheckVariables())
			{
				queryManagerToBeProcessed.checkVariables(syncType, this, null);
			}
			else
			{
				this.m_queryManagersToBeProcessCount--;
			}
		}
		else
		{
			throw oFF.XException.createRuntimeException(oFF.XStringUtils.concatenate2("Unknown mode: ", oFF.notNull(this.m_mode) ? this.m_mode.getName() : "null"));
		}
	}
	return this.m_queryManagersToBeProcessCount > 0;
};
oFF.BlendableQMVariableSubmitProcessor.prototype.onVariableProcessorExecuted = function(extResult, result, customIdentifier)
{
	this.addAllMessages(extResult);
	this.m_queryManagersToBeProcessCount--;
	if (this.m_queryManagersToBeProcessCount === 0)
	{
		this.setData(this);
		this.endSync();
	}
};
oFF.BlendableQMVariableSubmitProcessor.prototype.isSuccessfullyProcessed = function()
{
	return this.hasErrors();
};
oFF.BlendableQMVariableSubmitProcessor.prototype.setAndAssertVariableProcessMode = function(newMode)
{
	if (oFF.isNull(this.m_mode) || this.m_mode === newMode)
	{
		this.m_mode = newMode;
	}
	else
	{
		throw oFF.XException.createIllegalStateException(oFF.XStringUtils.concatenate4("BlendableQMVariableProcessor cannot perform operation: '", oFF.notNull(newMode) ? newMode.getName() : "null", "' because processor is already used for operation:", this.m_mode.getName()));
	}
};
oFF.BlendableQMVariableSubmitProcessor.prototype.submitVariables = function(syncType, listener, customIdentifier)
{
	this.setAndAssertVariableProcessMode(oFF.VariableProcessorState.PROCESSING_SUBMIT);
	this.processSyncAction(syncType, listener, customIdentifier);
	return this.processSyncAction(syncType, listener, customIdentifier);
};
oFF.BlendableQMVariableSubmitProcessor.prototype.reInitVariablesAfterSubmit = function(syncType, listener, customIdentifier)
{
	this.setAndAssertVariableProcessMode(oFF.VariableProcessorState.PROCESSING_REINIT);
	return this.processSyncAction(syncType, listener, customIdentifier);
};
oFF.BlendableQMVariableSubmitProcessor.prototype.activateVariableVariant = function(variableVariant, syncType, listener, customIdentifier)
{
	this.m_variableVariant = variableVariant;
	this.setAndAssertVariableProcessMode(oFF.VariableProcessorState.PROCESSING_VARIANT_ACTIVATION);
	return this.processSyncAction(syncType, listener, customIdentifier);
};
oFF.BlendableQMVariableSubmitProcessor.prototype.cancelReInitVariables = function(syncType, listener, customIdentifier)
{
	this.setAndAssertVariableProcessMode(oFF.VariableProcessorState.PROCESSING_CANCEL);
	return this.processSyncAction(syncType, listener, customIdentifier);
};
oFF.BlendableQMVariableSubmitProcessor.prototype.transferVariables = function(syncType, listener, customIdentifier)
{
	this.m_transferVariable = null;
	this.setAndAssertVariableProcessMode(oFF.VariableProcessorState.PROCESSING_UPDATE_VALUES);
	return this.processSyncAction(syncType, listener, customIdentifier);
};
oFF.BlendableQMVariableSubmitProcessor.prototype.transferVariablesByVariable = function(variable, syncType, listener, customIdentifier)
{
	this.m_transferVariable = variable;
	this.setAndAssertVariableProcessMode(oFF.VariableProcessorState.PROCESSING_UPDATE_VALUES);
	return this.processSyncAction(syncType, listener, customIdentifier);
};
oFF.BlendableQMVariableSubmitProcessor.prototype.checkVariables = function(syncType, listener, customIdentifier)
{
	this.setAndAssertVariableProcessMode(oFF.VariableProcessorState.PROCESSING_CHECK);
	return this.processSyncAction(syncType, listener, customIdentifier);
};

oFF.RuntimeBlendedQueryManagerAction = function() {};
oFF.RuntimeBlendedQueryManagerAction.prototype = new oFF.SyncAction();
oFF.RuntimeBlendedQueryManagerAction.prototype._ff_c = "RuntimeBlendedQueryManagerAction";

oFF.RuntimeBlendedQueryManagerAction.create = function(blendableQueryManager)
{
	var runtimeBlendedQueryManagerAction = new oFF.RuntimeBlendedQueryManagerAction();
	runtimeBlendedQueryManagerAction.setupAction(null, null, null, blendableQueryManager);
	return runtimeBlendedQueryManagerAction;
};
oFF.RuntimeBlendedQueryManagerAction.prototype.m_blendingProcess = null;
oFF.RuntimeBlendedQueryManagerAction.prototype.releaseObject = function()
{
	if (oFF.notNull(this.m_blendingProcess))
	{
		this.m_blendingProcess.postQueryExecution();
		this.m_blendingProcess = oFF.XObjectExt.release(this.m_blendingProcess);
	}
	oFF.SyncAction.prototype.releaseObject.call( this );
};
oFF.RuntimeBlendedQueryManagerAction.prototype.processSynchronization = function(syncType)
{
	var blendableQueryManager = this.getActionContext();
	var blendingProcessConfigs = blendableQueryManager.getBlendingProcessConfigs(this);
	if (this.hasErrors())
	{
		return false;
	}
	this.m_blendingProcess = oFF.BlendingProcess.create(blendableQueryManager, blendingProcessConfigs, null, null, true);
	this.m_blendingProcess.processBlendedQueryManagerCreation(syncType, this, null);
	return true;
};
oFF.RuntimeBlendedQueryManagerAction.prototype.onQueryManagerCreated = function(extResult, queryManager, customIdentifier)
{
	this.addAllMessages(extResult);
	if (!extResult.hasErrors())
	{
		this.m_blendingProcess.prepareQueryExecution();
		this.setData(queryManager);
	}
	this.endSync();
};
oFF.RuntimeBlendedQueryManagerAction.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onQueryManagerCreated(extResult, data, customIdentifier);
};

oFF.OlapEnvCapabilitiesExtAction = function() {};
oFF.OlapEnvCapabilitiesExtAction.prototype = new oFF.SyncAction();
oFF.OlapEnvCapabilitiesExtAction.prototype._ff_c = "OlapEnvCapabilitiesExtAction";

oFF.OlapEnvCapabilitiesExtAction.createAndRun = function(syncType, listener, customIdentifier, olapEnvSystem)
{
	var object = new oFF.OlapEnvCapabilitiesExtAction();
	object.setupActionAndRun(syncType, listener, customIdentifier, olapEnvSystem);
	return object;
};
oFF.OlapEnvCapabilitiesExtAction.prototype.releaseObject = function()
{
	oFF.SyncAction.prototype.releaseObject.call( this );
};
oFF.OlapEnvCapabilitiesExtAction.prototype.processSynchronization = function(syncType)
{
	var olapEnvSystem = this.getActionContext();
	var application = olapEnvSystem.getApplication();
	var systemConnect = application.getConnectionPool().getSystemConnect(olapEnvSystem.getSystemName());
	systemConnect.getServerMetadataExt(syncType, this, null);
	return true;
};
oFF.OlapEnvCapabilitiesExtAction.prototype.onServerMetadataLoaded = function(extResult, serverMetadata, customIdentifier)
{
	var session = this.getSession();
	var olapEnvSystem = this.getActionContext();
	var iterator = oFF.ProviderType.getAll().getIterator();
	while (iterator.hasNext())
	{
		var providerType = iterator.next();
		var capabilitiesProvider = oFF.InACapabilitiesProvider.create(session, serverMetadata, providerType, null);
		var capabilities = capabilitiesProvider.getQueryCapabilities();
		olapEnvSystem.addCapabilities(providerType, capabilities);
	}
};
oFF.OlapEnvCapabilitiesExtAction.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onCapabilitiesLoaded(extResult, data, customIdentifier);
};

oFF.OlapEnvCapabilityAction = function() {};
oFF.OlapEnvCapabilityAction.prototype = new oFF.SyncAction();
oFF.OlapEnvCapabilityAction.prototype._ff_c = "OlapEnvCapabilityAction";

oFF.OlapEnvCapabilityAction.create = function(context)
{
	var newObj = new oFF.OlapEnvCapabilityAction();
	newObj.setupAction(null, null, null, context);
	return newObj;
};
oFF.OlapEnvCapabilityAction.prototype.m_listener = null;
oFF.OlapEnvCapabilityAction.prototype.releaseObject = function()
{
	this.m_listener = null;
	oFF.SyncAction.prototype.releaseObject.call( this );
};
oFF.OlapEnvCapabilityAction.prototype.processSyncAction = function(syncType, listener, customIdentifier)
{
	this.m_listener = listener;
	var systemConnect = this.getActionContext();
	var serverMetadata = systemConnect.getServerMetadataExt(syncType, this, null);
	if (serverMetadata.isValid())
	{
		this.onServerMetadataLoaded(serverMetadata, serverMetadata.getData(), null);
	}
	return this;
};
oFF.OlapEnvCapabilityAction.prototype.onServerMetadataLoaded = function(extResult, serverMetadata, customIdentifier)
{
	this.copyAllMessages(extResult);
	var capabilities = oFF.XHashMapByString.create();
	var serviceIt = serverMetadata.getServices().getIterator();
	while (serviceIt.hasNext())
	{
		this.importServiceCapabilities(capabilities, serverMetadata, serviceIt.next());
	}
	this.setData(capabilities);
	if (oFF.notNull(this.m_listener))
	{
		this.m_listener.onCapabilities(this, capabilities, customIdentifier);
	}
};
oFF.OlapEnvCapabilityAction.prototype.importServiceCapabilities = function(capabilities, serverMetadata, serverService)
{
	var newCapabilities = oFF.QCapabilities.create();
	newCapabilities.setSystemType(serverMetadata.getSystemDescription().getSystemType());
	newCapabilities.setSystemName(serverMetadata.getSystemDescription().getSystemName());
	oFF.InACapabilitiesProvider.importCapabilities(serverMetadata.getMetadataForService(serverService), newCapabilities);
	this._sacFallback(serverMetadata, serverService, newCapabilities);
	capabilities.put(serverService, newCapabilities);
};
oFF.OlapEnvCapabilityAction.prototype._sacFallback = function(serverMetadata, serverService, newCapabilities)
{
	var betaMetadataForService = serverMetadata.getBetaMetadataForService(serverService);
	if (oFF.isNull(betaMetadataForService))
	{
		return;
	}
	if (betaMetadataForService.containsKey(oFF.InACapabilities.C188_LOCALE_SORTING))
	{
		newCapabilities.setSupportsLocaleSorting(true);
	}
	if (betaMetadataForService.containsKey(oFF.InACapabilities.C192_VIRTUAL_DS_VARIABLE_VALUES))
	{
		newCapabilities.setSupportsDynamicVariableRefresh(true);
	}
	if (betaMetadataForService.containsKey(oFF.InACapabilities.C187_DIMENSION_DEFAULT_MEMBER))
	{
		newCapabilities.setSupportsDimensionDefaultMember(true);
	}
	if (betaMetadataForService.containsKey(oFF.InACapabilities.C189_DIMENSION_VISIBILITY))
	{
		newCapabilities.setSupportsDimensionVisibility(true);
	}
	if (betaMetadataForService.containsKey(oFF.InACapabilities.C194_METADATA_EXTENDED_DIMENSION_VISIBILITY))
	{
		newCapabilities.setSupportsExtendedDimensionVisibility(true);
	}
	if (betaMetadataForService.containsKey(oFF.InACapabilities.C212_SORT_NEW_VALUES))
	{
		newCapabilities.setSupportsSortNewValues(true);
	}
	if (betaMetadataForService.containsKey(oFF.InACapabilities.C215_MEASURE_MEMBER_DEFINITION))
	{
		newCapabilities.setSupportsMeasureMemberDefinition(true);
	}
	if (betaMetadataForService.containsKey(oFF.InACapabilities.C216_MEASURE_MEMBER_DETAILS))
	{
		newCapabilities.setSupportsMeasureMemberDetails(true);
	}
	if (betaMetadataForService.containsKey(oFF.InACapabilities.C217_MEASURE_MEMBER_TYPE))
	{
		newCapabilities.setSupportsMeasureMemberType(true);
	}
};

oFF.OlapEnvCube = function() {};
oFF.OlapEnvCube.prototype = new oFF.XObjectExt();
oFF.OlapEnvCube.prototype._ff_c = "OlapEnvCube";

oFF.OlapEnvCube.create = function(olapEnvSystem, cubeName)
{
	var newObj = new oFF.OlapEnvCube();
	newObj.setupEnvCube(olapEnvSystem, cubeName);
	return newObj;
};
oFF.OlapEnvCube.prototype.m_olapEnvSystem = null;
oFF.OlapEnvCube.prototype.m_cubeName = null;
oFF.OlapEnvCube.prototype.m_dimensionMetadataCache = null;
oFF.OlapEnvCube.prototype.m_fieldMetadataCache = null;
oFF.OlapEnvCube.prototype.m_metadataCache = null;
oFF.OlapEnvCube.prototype.m_datasourceKeysToListeners = null;
oFF.OlapEnvCube.prototype.m_dataSource = null;
oFF.OlapEnvCube.prototype.m_dimensionOverrideTexts = null;
oFF.OlapEnvCube.prototype.m_memberOverrideTexts = null;
oFF.OlapEnvCube.prototype.setupEnvCube = function(olapEnvSystem, cubeName)
{
	this.m_olapEnvSystem = oFF.XWeakReferenceUtil.getWeakRef(olapEnvSystem);
	var session = olapEnvSystem.getSession();
	this.m_dimensionMetadataCache = oFF.QCache.create(session);
	this.m_fieldMetadataCache = oFF.QCache.create(session);
	this.m_cubeName = cubeName;
	this.m_metadataCache = oFF.QCache.create(session);
	this.m_datasourceKeysToListeners = oFF.XHashMapByString.create();
	this.m_dimensionOverrideTexts = oFF.XHashMapByString.create();
	this.m_memberOverrideTexts = oFF.XHashMapByString.create();
};
oFF.OlapEnvCube.prototype.releaseObject = function()
{
	this.m_olapEnvSystem = null;
	this.m_dimensionMetadataCache = oFF.XObjectExt.release(this.m_dimensionMetadataCache);
	this.m_fieldMetadataCache = oFF.XObjectExt.release(this.m_fieldMetadataCache);
	this.m_metadataCache = oFF.XObjectExt.release(this.m_metadataCache);
	this.m_datasourceKeysToListeners = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_datasourceKeysToListeners);
	this.m_dimensionOverrideTexts = oFF.XObjectExt.release(this.m_dimensionOverrideTexts);
	this.m_memberOverrideTexts = oFF.XObjectExt.release(this.m_memberOverrideTexts);
	oFF.XObjectExt.prototype.releaseObject.call( this );
};
oFF.OlapEnvCube.prototype.getOlapEnvSystem = function()
{
	return oFF.XWeakReferenceUtil.getHardRef(this.m_olapEnvSystem);
};
oFF.OlapEnvCube.prototype.getOlapEnv = function()
{
	return this.getOlapEnvSystem().getOlapEnv();
};
oFF.OlapEnvCube.prototype.getApplication = function()
{
	return this.getOlapEnv().getApplication();
};
oFF.OlapEnvCube.prototype.getSession = function()
{
	return this.getApplication().getSession();
};
oFF.OlapEnvCube.prototype.getProcess = function()
{
	return this.getApplication().getProcess();
};
oFF.OlapEnvCube.prototype.getSystemName = function()
{
	return this.getOlapEnvSystem().getSystemName();
};
oFF.OlapEnvCube.prototype.getCubeName = function()
{
	return this.m_cubeName;
};
oFF.OlapEnvCube.prototype.getDimensionMetadata = function(key)
{
	var cubeSpecificKey = key.getCubeSpecificKey();
	return this.m_dimensionMetadataCache.getByKey(cubeSpecificKey);
};
oFF.OlapEnvCube.prototype.getDimensionMetadataByKey = function(key)
{
	var cubeSpecificKey = key.getCubeSpecificKey();
	return this.m_dimensionMetadataCache.useEntry(cubeSpecificKey);
};
oFF.OlapEnvCube.prototype.setDimensionMetadata = function(metadata)
{
	var key = metadata.getCacheKey();
	var cubeSpecificKey = key.getCubeSpecificKey();
	this.m_dimensionMetadataCache.put(cubeSpecificKey, metadata);
};
oFF.OlapEnvCube.prototype.releaseDimensionMetadataByKey = function(key)
{
	var cubeSpecificKey = key.getCubeSpecificKey();
	this.m_dimensionMetadataCache.freeEntry(cubeSpecificKey);
};
oFF.OlapEnvCube.prototype.getFieldMetadata = function(key)
{
	var cubeSpecificKey = key.getCubeSpecificKey();
	return this.m_fieldMetadataCache.getByKey(cubeSpecificKey);
};
oFF.OlapEnvCube.prototype.getFieldMetadataByKey = function(key)
{
	var cubeSpecificKey = key.getCubeSpecificKey();
	return this.m_fieldMetadataCache.useEntry(cubeSpecificKey);
};
oFF.OlapEnvCube.prototype.setFieldMetadata = function(metadata)
{
	var key = metadata.getCacheKey();
	var cubeSpecificKey = key.getCubeSpecificKey();
	this.m_fieldMetadataCache.put(cubeSpecificKey, metadata);
};
oFF.OlapEnvCube.prototype.releaseFieldMetadataByKey = function(key)
{
	var cubeSpecificKey = key.getCubeSpecificKey();
	this.m_fieldMetadataCache.freeEntry(cubeSpecificKey);
};
oFF.OlapEnvCube.prototype.getKeyFieldMetadataByDimension = function(key)
{
	var resultFieldMd = null;
	var iterator = this.m_fieldMetadataCache.getIterator();
	while (iterator.hasNext())
	{
		var fieldMd = iterator.next();
		var cacheKey = fieldMd.getCacheKey();
		if (oFF.XString.isEqual(cacheKey.getSystemName(), key.getSystemName()) && oFF.XString.isEqual(cacheKey.getDataSourceHashKey(), key.getDataSourceHashKey()) && cacheKey.getProviderType() === key.getProviderType() && oFF.XString.isEqual(cacheKey.getKey2(), key.getKey1()) && oFF.XString.isEqual(cacheKey.getValidationHash(), key.getValidationHash()) && fieldMd.getPresentationType() === oFF.PresentationType.KEY)
		{
			resultFieldMd = fieldMd;
			break;
		}
	}
	return resultFieldMd;
};
oFF.OlapEnvCube.prototype.setQueryMetadata = function(key, entry)
{
	if (oFF.notNull(key) && oFF.notNull(entry))
	{
		var cubeSpecificKey = key.getCubeSpecificKey();
		if (this.m_metadataCache.containsKey(cubeSpecificKey))
		{
			this.m_metadataCache.useEntry(cubeSpecificKey);
		}
		else
		{
			var content = oFF.XContent.createJsonObjectContent(oFF.QModelFormat.INA_METADATA, entry);
			this.m_metadataCache.put(cubeSpecificKey, content);
		}
	}
};
oFF.OlapEnvCube.prototype.overwriteQueryMetadata = function(key, entry)
{
	if (oFF.notNull(key) && oFF.notNull(entry))
	{
		var cubeSpecificKey = key.getCubeSpecificKey();
		var content = oFF.XContent.createJsonObjectContent(oFF.QModelFormat.INA_METADATA, entry);
		this.m_metadataCache.updateEntry(cubeSpecificKey, content);
	}
};
oFF.OlapEnvCube.prototype.releaseQueryMetadata = function(key)
{
	if (oFF.notNull(key))
	{
		var cubeSpecificKey = key.getCubeSpecificKey();
		this.m_metadataCache.freeEntry(cubeSpecificKey);
	}
};
oFF.OlapEnvCube.prototype.releaseAllQueryMetadata = function()
{
	var cacheKeysIter = this.m_metadataCache.getKeysAsIteratorOfString();
	while (cacheKeysIter.hasNext())
	{
		var cacheKey = cacheKeysIter.next();
		var queryMetadata = this.m_metadataCache.remove(cacheKey);
		if (oFF.notNull(queryMetadata))
		{
			oFF.XObjectExt.release(queryMetadata);
		}
	}
};
oFF.OlapEnvCube.prototype.getQueryMetadata = function(key)
{
	var result = null;
	var cubeSpecificKey = null;
	if (oFF.notNull(key))
	{
		cubeSpecificKey = key.getCubeSpecificKey();
	}
	var content = this.m_metadataCache.getByKey(cubeSpecificKey);
	if (oFF.notNull(content))
	{
		result = content.getJsonContent();
	}
	return result;
};
oFF.OlapEnvCube.prototype.getMetadataAction = function(key)
{
	var action = null;
	var olapEnv = this.getOlapEnv();
	if (olapEnv.isCachingEnabled())
	{
		var cubeSpecificKey = key.getCubeSpecificKey();
		action = this.m_metadataCache.getAction(cubeSpecificKey);
	}
	return action;
};
oFF.OlapEnvCube.prototype.getDataSource = function()
{
	return this.m_dataSource;
};
oFF.OlapEnvCube.prototype.setDataSource = function(dataSource)
{
	var copyDataSoure = dataSource.clone();
	this.m_dataSource = copyDataSoure;
};
oFF.OlapEnvCube.prototype.toString = function()
{
	return this.m_cubeName;
};
oFF.OlapEnvCube.prototype.getDimensionOverrideText = function(storageName, dimensionName)
{
	return this.getDimensionOverrideTextByDatasetId(storageName, dimensionName, "");
};
oFF.OlapEnvCube.prototype.getDimensionOverrideTextByDatasetId = function(storageName, dimensionName, datasetId)
{
	if (oFF.notNull(storageName) && oFF.notNull(dimensionName) && oFF.notNull(datasetId))
	{
		var datasetIdMap = this.m_dimensionOverrideTexts.getByKey(storageName);
		if (oFF.notNull(datasetIdMap))
		{
			var overrideTextMap = datasetIdMap.getByKey(datasetId);
			if (oFF.notNull(overrideTextMap))
			{
				return overrideTextMap.getByKey(dimensionName);
			}
		}
	}
	return null;
};
oFF.OlapEnvCube.prototype.setDimensionOverrideText = function(storageName, dimensionName, overrideText)
{
	this.setDimensionOverrideTextByDatasetId(storageName, dimensionName, overrideText, "");
};
oFF.OlapEnvCube.prototype.setDimensionOverrideTextByDatasetId = function(storageName, dimensionName, overrideText, datasetId)
{
	if (oFF.notNull(storageName) && oFF.notNull(dimensionName) && oFF.XStringUtils.isNotNullAndNotEmpty(overrideText) && oFF.notNull(datasetId))
	{
		var datasetIdMap = this.m_dimensionOverrideTexts.getByKey(storageName);
		if (oFF.isNull(datasetIdMap))
		{
			datasetIdMap = oFF.XHashMapByString.create();
			this.m_dimensionOverrideTexts.put(storageName, datasetIdMap);
		}
		var overrideTextMap = datasetIdMap.getByKey(datasetId);
		if (oFF.isNull(overrideTextMap))
		{
			overrideTextMap = oFF.XHashMapOfStringByString.create();
			datasetIdMap.put(datasetId, overrideTextMap);
		}
		if (!oFF.XString.isEqual(overrideTextMap.getByKey(dimensionName), overrideText))
		{
			overrideTextMap.put(dimensionName, overrideText);
		}
	}
};
oFF.OlapEnvCube.prototype.removeDimensionOverrideText = function(storageName, dimensionName)
{
	this.removeDimensionOverrideTextByDatasetId(storageName, dimensionName, "");
};
oFF.OlapEnvCube.prototype.removeDimensionOverrideTextByDatasetId = function(storageName, dimensionName, datasetId)
{
	if (oFF.notNull(storageName) && oFF.notNull(dimensionName) && oFF.notNull(datasetId))
	{
		var datasetIdMap = this.m_dimensionOverrideTexts.getByKey(storageName);
		if (oFF.notNull(datasetIdMap))
		{
			var overrideTextMap = datasetIdMap.getByKey(datasetId);
			if (oFF.notNull(overrideTextMap))
			{
				overrideTextMap.remove(dimensionName);
			}
		}
	}
};
oFF.OlapEnvCube.prototype.removeOverrideTextsByStorage = function(storageName)
{
	this.removeOverrideTextsByStorageByDatasetId(storageName, null);
};
oFF.OlapEnvCube.prototype.removeOverrideTextsByStorageByDatasetId = function(storageName, datasetId)
{
	if (oFF.notNull(storageName))
	{
		if (oFF.notNull(datasetId))
		{
			var dimensionByDatasetIdMap = this.m_dimensionOverrideTexts.getByKey(storageName);
			if (oFF.notNull(dimensionByDatasetIdMap))
			{
				dimensionByDatasetIdMap.remove(datasetId);
			}
			var memberByDatasetIdMap = this.m_memberOverrideTexts.getByKey(storageName);
			if (oFF.notNull(memberByDatasetIdMap))
			{
				memberByDatasetIdMap.remove(datasetId);
			}
		}
		else
		{
			this.m_dimensionOverrideTexts.remove(storageName);
			this.m_memberOverrideTexts.remove(storageName);
		}
	}
	else
	{
		oFF.XObjectExt.release(this.m_dimensionOverrideTexts);
		oFF.XObjectExt.release(this.m_memberOverrideTexts);
		this.m_dimensionOverrideTexts = oFF.XHashMapByString.create();
		this.m_memberOverrideTexts = oFF.XHashMapByString.create();
	}
};
oFF.OlapEnvCube.prototype.getDimensionMemberOverrideText = function(storageName, dimensionName, memberName)
{
	return this.getDimensionMemberOverrideTextByDatasetId(storageName, dimensionName, memberName, "");
};
oFF.OlapEnvCube.prototype.getDimensionMemberOverrideTextByDatasetId = function(storageName, dimensionName, memberName, datasetId)
{
	if (oFF.notNull(storageName) && oFF.notNull(dimensionName) && oFF.notNull(memberName) && oFF.notNull(datasetId))
	{
		var datasetIdMap = this.m_memberOverrideTexts.getByKey(storageName);
		if (oFF.notNull(datasetIdMap))
		{
			var dimensionNameMap = datasetIdMap.getByKey(datasetId);
			if (oFF.notNull(dimensionNameMap))
			{
				var overrideTextMap = dimensionNameMap.getByKey(dimensionName);
				if (oFF.notNull(overrideTextMap))
				{
					return overrideTextMap.getByKey(memberName);
				}
			}
		}
	}
	return null;
};
oFF.OlapEnvCube.prototype.setDimensionMemberOverrideText = function(storageName, dimensionName, memberName, overrideText)
{
	this.setDimensionMemberOverrideTextByDatasetId(storageName, dimensionName, memberName, overrideText, "");
};
oFF.OlapEnvCube.prototype.setDimensionMemberOverrideTextByDatasetId = function(storageName, dimensionName, memberName, overrideText, datasetId)
{
	if (oFF.notNull(storageName) && oFF.notNull(dimensionName) && oFF.notNull(memberName) && oFF.XStringUtils.isNotNullAndNotEmpty(overrideText) && oFF.notNull(datasetId))
	{
		var datasetIdMap = this.m_memberOverrideTexts.getByKey(storageName);
		if (oFF.isNull(datasetIdMap))
		{
			datasetIdMap = oFF.XHashMapByString.create();
			this.m_memberOverrideTexts.put(storageName, datasetIdMap);
		}
		var dimensionNameMap = datasetIdMap.getByKey(datasetId);
		if (oFF.isNull(dimensionNameMap))
		{
			dimensionNameMap = oFF.XHashMapByString.create();
			datasetIdMap.put(datasetId, dimensionNameMap);
		}
		var overrideTextMap = dimensionNameMap.getByKey(dimensionName);
		if (oFF.isNull(overrideTextMap))
		{
			overrideTextMap = oFF.XHashMapOfStringByString.create();
			dimensionNameMap.put(dimensionName, overrideTextMap);
		}
		if (!oFF.XString.isEqual(overrideTextMap.getByKey(memberName), overrideText))
		{
			overrideTextMap.put(memberName, overrideText);
		}
	}
};
oFF.OlapEnvCube.prototype.removeDimensionMemberOverrideText = function(storageName, dimensionName, memberName)
{
	this.removeDimensionMemberOverrideTextByDatasetId(storageName, dimensionName, memberName, "");
};
oFF.OlapEnvCube.prototype.removeDimensionMemberOverrideTextByDatasetId = function(storageName, dimensionName, memberName, datasetId)
{
	if (oFF.notNull(storageName) && oFF.notNull(dimensionName) && oFF.notNull(memberName) && oFF.notNull(datasetId))
	{
		var datasetIdMap = this.m_memberOverrideTexts.getByKey(storageName);
		if (oFF.notNull(datasetIdMap))
		{
			var dimensionNameMap = datasetIdMap.getByKey(datasetId);
			if (oFF.notNull(dimensionNameMap))
			{
				var overrideTextMap = dimensionNameMap.getByKey(dimensionName);
				if (oFF.notNull(overrideTextMap))
				{
					overrideTextMap.remove(memberName);
				}
			}
		}
	}
};
oFF.OlapEnvCube.prototype.getMemberOverrideTextsByDimension = function(storageName, dimensionName)
{
	return this.getMemberOverrideTextsByDimensionByDatasetId(storageName, dimensionName, "");
};
oFF.OlapEnvCube.prototype.getMemberOverrideTextsByDimensionByDatasetId = function(storageName, dimensionName, datasetId)
{
	if (oFF.notNull(storageName) && oFF.notNull(dimensionName) && oFF.notNull(datasetId))
	{
		var datasetIdMap = this.m_memberOverrideTexts.getByKey(storageName);
		if (oFF.notNull(datasetIdMap))
		{
			var dimensionNameMap = datasetIdMap.getByKey(datasetId);
			if (oFF.notNull(dimensionNameMap))
			{
				return dimensionNameMap.getByKey(dimensionName);
			}
		}
	}
	return null;
};

oFF.OlapEnvSupportedFormulaAction = function() {};
oFF.OlapEnvSupportedFormulaAction.prototype = new oFF.SyncAction();
oFF.OlapEnvSupportedFormulaAction.prototype._ff_c = "OlapEnvSupportedFormulaAction";

oFF.OlapEnvSupportedFormulaAction.create = function(context, includeMemberNavigationOperations)
{
	var newObj = new oFF.OlapEnvSupportedFormulaAction();
	newObj.setupAction(null, null, null, context);
	newObj.m_includeMemberNavigationOperations = includeMemberNavigationOperations;
	return newObj;
};
oFF.OlapEnvSupportedFormulaAction.prototype.m_listener = null;
oFF.OlapEnvSupportedFormulaAction.prototype.m_includeMemberNavigationOperations = false;
oFF.OlapEnvSupportedFormulaAction.prototype.releaseObject = function()
{
	this.m_listener = null;
	oFF.SyncAction.prototype.releaseObject.call( this );
};
oFF.OlapEnvSupportedFormulaAction.prototype.processSyncAction = function(syncType, listener, customIdentifier)
{
	this.m_listener = listener;
	var systemConnect = this.getActionContext();
	var systemType = systemConnect.getSystemDescription().getSystemType();
	if (systemType.isTypeOf(oFF.SystemType.ABAP) && systemConnect.getServerMetadata().supportsCapability(oFF.ServerService.ANALYTIC, oFF.InACapabilities.C167_FORMULA_OPERATORS_CATALOG) || systemType.isTypeOf(oFF.SystemType.HANA))
	{
		var connection = systemConnect.getConnectionPoolBase().getOpenConnection(systemConnect.getSystemName());
		var _function = connection.newRpcFunction(systemType.getInAPath());
		_function.getRpcRequest().setRequestStructure(this.createRequest(connection));
		_function.processFunctionExecution(syncType, this, systemType);
		return this;
	}
	var supportedFormulas = oFF.XListOfString.create();
	if (systemType.isTypeOf(oFF.SystemType.ABAP))
	{
		var supportedFormulaOperators = oFF.FormulaOperator.getSupportedFormulaOperator(systemType);
		supportedFormulas = oFF.XCollectionUtils.createListOfNames(supportedFormulaOperators);
	}
	if (systemType.isTypeOf(oFF.SystemType.UNV) || systemType.isTypeOf(oFF.SystemType.UQAS))
	{
		supportedFormulas.add("abs");
		supportedFormulas.add("and");
		supportedFormulas.add("decfloat");
		supportedFormulas.add("double");
		supportedFormulas.add("float");
		supportedFormulas.add("if");
		supportedFormulas.add("int");
		supportedFormulas.add("isNull");
		supportedFormulas.add("length");
		supportedFormulas.add("like");
		supportedFormulas.add("log");
		supportedFormulas.add("log10");
		supportedFormulas.add("not");
		supportedFormulas.add("or");
		supportedFormulas.add("substring");
		supportedFormulas.add("-");
		supportedFormulas.add("/");
		supportedFormulas.add("+");
		supportedFormulas.add("*");
		supportedFormulas.add("**");
		supportedFormulas.add("==");
		supportedFormulas.add("!=");
		supportedFormulas.add(">=");
		supportedFormulas.add(">");
		supportedFormulas.add("<=");
		supportedFormulas.add("<");
	}
	if (systemConnect.getServerMetadata().supportsCapability(oFF.ServerService.ANALYTIC, oFF.InACapabilities.C153_VARIANCE_OPERATOR))
	{
		supportedFormulas.add("variance");
	}
	this.setData(supportedFormulas);
	if (oFF.notNull(this.m_listener))
	{
		this.m_listener.onSupportedFormula(this, supportedFormulas, customIdentifier);
	}
	return this;
};
oFF.OlapEnvSupportedFormulaAction.prototype.createRequest = function(connection)
{
	var request = oFF.PrFactory.createStructure();
	var inaAnalytics = request.putNewStructure("Analytics");
	var inaDefinition = inaAnalytics.putNewStructure("Definition");
	var systemType = connection.getSystemDescription().getSystemType();
	this.addCapabilities(inaAnalytics, connection);
	this.addDatasource(inaDefinition, systemType);
	this.addLayout(inaDefinition, systemType);
	this.addFeatureRequests(inaDefinition, connection);
	return request;
};
oFF.OlapEnvSupportedFormulaAction.prototype.addCapabilities = function(inaAnalytics, connection)
{
	if (connection.supportsAnalyticCapability(oFF.InACapabilities.C167_FORMULA_OPERATORS_CATALOG))
	{
		var capabilitiesBe = inaAnalytics.putNewList("Capabilities");
		capabilitiesBe.addString(oFF.InACapabilities.C167_FORMULA_OPERATORS_CATALOG);
	}
	if (connection.supportsAnalyticCapability(oFF.InACapabilities.C141_RETURNED_DATA_SELECTION))
	{
		var capabilitiesMds = inaAnalytics.putNewList("Capabilities");
		capabilitiesMds.addString(oFF.InACapabilities.C141_RETURNED_DATA_SELECTION);
	}
};
oFF.OlapEnvSupportedFormulaAction.prototype.addFeatureRequests = function(inaDefinition, connection)
{
	var inaRsFeatureRequest = inaDefinition.putNewStructure("ResultSetFeatureRequest");
	inaRsFeatureRequest.putBoolean("IncludePerformanceData", false);
	inaRsFeatureRequest.putString("ResultEncoding", "None");
	inaRsFeatureRequest.putString("ResultFormat", "Version2");
	if (connection.supportsAnalyticCapability(oFF.InACapabilities.C141_RETURNED_DATA_SELECTION))
	{
		var returnedDataSelection = inaRsFeatureRequest.putNewStructure("ReturnedDataSelection");
		if (!connection.supportsAnalyticCapability(oFF.InACapabilities.V128_NO_DATA_ACTIONS))
		{
			returnedDataSelection.putBoolean(oFF.ReturnedDataSelection.ACTIONS.getName(), false);
		}
		returnedDataSelection.putBoolean(oFF.ReturnedDataSelection.EXCEPTIONS.getName(), false);
		returnedDataSelection.putBoolean(oFF.ReturnedDataSelection.EXCEPTION_ALERTLEVEL.getName(), false);
		returnedDataSelection.putBoolean(oFF.ReturnedDataSelection.INPUT_ENABLED.getName(), false);
		returnedDataSelection.putBoolean(oFF.ReturnedDataSelection.UNIT_DESCRIPTIONS.getName(), false);
		returnedDataSelection.putBoolean(oFF.ReturnedDataSelection.UNIT_TYPES.getName(), false);
		returnedDataSelection.putBoolean(oFF.ReturnedDataSelection.UNITS.getName(), false);
		returnedDataSelection.putBoolean(oFF.ReturnedDataSelection.TUPLE_DISPLAY_LEVEL.getName(), false);
		returnedDataSelection.putBoolean(oFF.ReturnedDataSelection.TUPLE_DRILL_STATE.getName(), false);
		returnedDataSelection.putBoolean(oFF.ReturnedDataSelection.TUPLE_PARENT_INDEXES.getName(), false);
		returnedDataSelection.putBoolean(oFF.ReturnedDataSelection.VALUES.getName(), false);
		returnedDataSelection.putBoolean(oFF.ReturnedDataSelection.VALUES_FORMATTED.getName(), false);
	}
};
oFF.OlapEnvSupportedFormulaAction.prototype.addLayout = function(inaDefinition, systemType)
{
	var inaDimensions = inaDefinition.putNewList("Dimensions");
	var inaDimension = inaDimensions.addNewStructure();
	inaDimension.putString("Axis", "Rows");
	inaDimension.putString("Name", "FunctionName");
	inaDimension.putInteger("SortOrder", 1);
	if (systemType.isTypeOf(oFF.SystemType.ABAP))
	{
		inaDimension.putString("Name", "FormulaOperators");
		var inaAttributes = inaDimension.putNewList("Attributes");
		var attributeKey = inaAttributes.addNewStructure();
		attributeKey.putString("Name", "FormulaOperators.KEY");
		attributeKey.putString("Obtainability", oFF.ObtainabilityType.ALWAYS.getName());
	}
};
oFF.OlapEnvSupportedFormulaAction.prototype.addDatasource = function(inaDefinition, systemType)
{
	var inaDatasource = inaDefinition.putNewStructure("DataSource");
	if (systemType.isTypeOf(oFF.SystemType.HANA))
	{
		inaDatasource.putString("ObjectName", this.m_includeMemberNavigationOperations ? "$$AllFunctions$$" : "$$FormulaFunctions$$");
	}
	else if (systemType.isTypeOf(oFF.SystemType.ABAP))
	{
		inaDatasource.putString("ObjectName", "$$DataSource$$");
		inaDatasource.putString("Type", "FormulaOperators");
	}
};
oFF.OlapEnvSupportedFormulaAction.prototype.onFunctionExecuted = function(extResult, response, customIdentifier)
{
	var supportedFormulas = null;
	this.copyAllMessages(extResult);
	if (extResult.isValid())
	{
		var rootElement = response.getRootElement();
		oFF.InAHelper.importMessages(response.getRootElement(), this);
		if (this.isValid())
		{
			var grids = rootElement.getListByKey("Grids");
			var grid = grids.getStructureAt(0);
			var axes = grid.getListByKey("Axes");
			var axis = axes.getStructureAt(0);
			var dimensions = axis.getListByKey("Dimensions");
			var dimension = dimensions.getStructureAt(0);
			var attributes = dimension.getListByKey("Attributes");
			var attribute = attributes.getStructureAt(0);
			var values = attribute.getListByKey("Values");
			supportedFormulas = oFF.XListOfString.create();
			var size = values.size();
			for (var i = 0; i < size; i++)
			{
				supportedFormulas.add(values.getStringAt(i));
			}
		}
	}
	this.setData(supportedFormulas);
	if (oFF.notNull(this.m_listener))
	{
		this.m_listener.onSupportedFormula(this, supportedFormulas, customIdentifier);
	}
};

oFF.OlapEnvSystem = function() {};
oFF.OlapEnvSystem.prototype = new oFF.XObjectExt();
oFF.OlapEnvSystem.prototype._ff_c = "OlapEnvSystem";

oFF.OlapEnvSystem.create = function(olapEnv, systemName)
{
	var newObj = new oFF.OlapEnvSystem();
	newObj.setupEnvSys(olapEnv, systemName);
	return newObj;
};
oFF.OlapEnvSystem.prototype.m_olapEnv = null;
oFF.OlapEnvSystem.prototype.m_systemName = null;
oFF.OlapEnvSystem.prototype.m_cubes = null;
oFF.OlapEnvSystem.prototype.m_virtualQmByDatasource = null;
oFF.OlapEnvSystem.prototype.m_microCubes = null;
oFF.OlapEnvSystem.prototype.m_capabilities = null;
oFF.OlapEnvSystem.prototype.m_capabilitiesExt = null;
oFF.OlapEnvSystem.prototype.m_listenerCapabilities = null;
oFF.OlapEnvSystem.prototype.m_supportedFormulas = null;
oFF.OlapEnvSystem.prototype.m_listenerFormula = null;
oFF.OlapEnvSystem.prototype.m_variantsByDatasource = null;
oFF.OlapEnvSystem.prototype.setupEnvSys = function(olapEnv, systemName)
{
	this.m_olapEnv = oFF.XWeakReferenceUtil.getWeakRef(olapEnv);
	this.m_systemName = systemName;
	this.m_cubes = oFF.XHashMapByString.create();
	this.m_microCubes = oFF.XHashMapByString.create();
	this.m_capabilities = oFF.XHashMapByString.create();
	this.m_capabilitiesExt = oFF.XHashMapByString.create();
	this.m_virtualQmByDatasource = oFF.XHashMapByString.create();
	this.m_variantsByDatasource = oFF.XHashMapByString.create();
};
oFF.OlapEnvSystem.prototype.releaseObject = function()
{
	this.m_olapEnv = null;
	this.m_systemName = null;
	this.m_cubes = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_cubes);
	this.m_virtualQmByDatasource = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_virtualQmByDatasource);
	this.m_microCubes = oFF.XObjectExt.release(this.m_microCubes);
	this.m_capabilities = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_capabilities);
	this.m_capabilitiesExt = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_capabilitiesExt);
	this.m_listenerCapabilities = null;
	this.m_supportedFormulas = oFF.XObjectExt.release(this.m_supportedFormulas);
	this.m_listenerFormula = null;
	this.m_variantsByDatasource = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_variantsByDatasource);
	oFF.XObjectExt.prototype.releaseObject.call( this );
};
oFF.OlapEnvSystem.prototype.getOlapEnv = function()
{
	return oFF.XWeakReferenceUtil.getHardRef(this.m_olapEnv);
};
oFF.OlapEnvSystem.prototype.getApplication = function()
{
	return this.getOlapEnv().getApplication();
};
oFF.OlapEnvSystem.prototype.getSession = function()
{
	return this.getApplication().getSession();
};
oFF.OlapEnvSystem.prototype.getProcess = function()
{
	return this.getApplication().getProcess();
};
oFF.OlapEnvSystem.prototype.getSystemName = function()
{
	return this.m_systemName;
};
oFF.OlapEnvSystem.prototype.getDimensionMetadata = function(key)
{
	var container = this.getCubeContainerInternal(key);
	return container.getDimensionMetadata(key);
};
oFF.OlapEnvSystem.prototype.getDimensionMetadataByKey = function(key)
{
	var container = this.getCubeContainerInternal(key);
	return container.getDimensionMetadataByKey(key);
};
oFF.OlapEnvSystem.prototype.setDimensionMetadata = function(metadata)
{
	var key = metadata.getCacheKey();
	var container = this.getCubeContainerInternal(key);
	container.setDimensionMetadata(metadata);
};
oFF.OlapEnvSystem.prototype.releaseDimensionMetadataByKey = function(key)
{
	var container = this.getCubeContainerInternal(key);
	container.releaseDimensionMetadataByKey(key);
};
oFF.OlapEnvSystem.prototype.getFieldMetadata = function(key)
{
	var container = this.getCubeContainerInternal(key);
	return container.getFieldMetadata(key);
};
oFF.OlapEnvSystem.prototype.getFieldMetadataByKey = function(key)
{
	var container = this.getCubeContainerInternal(key);
	return container.getFieldMetadataByKey(key);
};
oFF.OlapEnvSystem.prototype.setFieldMetadata = function(metadata)
{
	var key = metadata.getCacheKey();
	var container = this.getCubeContainerInternal(key);
	container.setFieldMetadata(metadata);
};
oFF.OlapEnvSystem.prototype.releaseFieldMetadataByKey = function(key)
{
	var container = this.getCubeContainerInternal(key);
	container.releaseFieldMetadataByKey(key);
};
oFF.OlapEnvSystem.prototype.getKeyFieldMetadataByDimension = function(key)
{
	var container = this.getCubeContainerInternal(key);
	return container.getKeyFieldMetadataByDimension(key);
};
oFF.OlapEnvSystem.prototype.getQueryMetadata = function(key)
{
	var container = this.getCubeContainerInternal(key);
	return container.getQueryMetadata(key);
};
oFF.OlapEnvSystem.prototype.setQueryMetadata = function(key, entry)
{
	var container = this.getCubeContainerInternal(key);
	container.setQueryMetadata(key, entry);
};
oFF.OlapEnvSystem.prototype.overwriteQueryMetadata = function(key, entry)
{
	var container = this.getCubeContainerInternal(key);
	container.overwriteQueryMetadata(key, entry);
};
oFF.OlapEnvSystem.prototype.releaseQueryMetadata = function(key)
{
	var container = this.getCubeContainerInternal(key);
	container.releaseQueryMetadata(key);
};
oFF.OlapEnvSystem.prototype.releaseAllQueryMetadata = function()
{
	var cubesIter = this.m_cubes.getKeysAsIteratorOfString();
	while (cubesIter.hasNext())
	{
		var envCube = this.getCubeContainer(cubesIter.next());
		envCube.releaseAllQueryMetadata();
	}
};
oFF.OlapEnvSystem.prototype.getCubeContainerInternal = function(key)
{
	var cubeName = key.getDataSourceHashKey();
	return this.getCubeContainer(cubeName);
};
oFF.OlapEnvSystem.prototype.getCubeContainer = function(cubeName)
{
	var cube = this.m_cubes.getByKey(cubeName);
	if (oFF.isNull(cube))
	{
		cube = oFF.OlapEnvCube.create(this, cubeName);
		this.m_cubes.put(cubeName, cube);
	}
	return cube;
};
oFF.OlapEnvSystem.prototype.updateDynamicVariablesForQueryManager = function(queryManager, syncType, listener, customIdentifier)
{
	var datasourceName = queryManager.getDataSource().getFullQualifiedName();
	var virtualQm = this.m_virtualQmByDatasource.getByKey(datasourceName);
	if (oFF.isNull(virtualQm))
	{
		virtualQm = oFF.OlapEnvironmentQMCreationListener.create();
		this.m_virtualQmByDatasource.put(datasourceName, virtualQm);
	}
	virtualQm.processUpdate(syncType, listener, customIdentifier, queryManager);
};
oFF.OlapEnvSystem.prototype.getMicroCubesNames = function()
{
	return this.m_microCubes.getKeysAsReadOnlyListOfString();
};
oFF.OlapEnvSystem.prototype.isValidMicroCubeName = function(name)
{
	return oFF.XStringUtils.isNotNullAndNotEmpty(name) && !this.m_microCubes.containsKey(name);
};
oFF.OlapEnvSystem.prototype.addMicroCube = function(name, queryManager)
{
	var ok = false;
	if (this.isValidMicroCubeName(name))
	{
		this.m_microCubes.put(name, queryManager);
		ok = true;
	}
	return ok;
};
oFF.OlapEnvSystem.prototype.getMicroCube = function(name)
{
	return this.m_microCubes.getByKey(name);
};
oFF.OlapEnvSystem.prototype.removeMicroCubeName = function(name)
{
	if (this.m_microCubes.containsKey(name))
	{
		this.m_microCubes.remove(name);
	}
};
oFF.OlapEnvSystem.prototype.toString = function()
{
	return this.m_systemName;
};
oFF.OlapEnvSystem.prototype.getServiceCapabilities = function(serviceName)
{
	if (this.m_capabilities.hasElements() === false)
	{
		this.processCapabilities(oFF.SyncType.BLOCKING, this, null);
	}
	return this.m_capabilities.getByKey(serviceName);
};
oFF.OlapEnvSystem.prototype.processCapabilities = function(syncType, listener, identifier)
{
	var action;
	if (this.m_capabilities.hasElements())
	{
		action = oFF.SyncActionExtRes.createSyncAction(this.m_capabilities, null);
		if (oFF.notNull(listener))
		{
			listener.onCapabilities(action, this.m_capabilities, identifier);
		}
	}
	else
	{
		var capabilityAction = oFF.OlapEnvCapabilityAction.create(this.getApplication().getConnectionPool().getSystemConnect(this.m_systemName));
		capabilityAction.processSyncAction(syncType, this, identifier);
		action = capabilityAction;
	}
	return action;
};
oFF.OlapEnvSystem.prototype.getServiceCapabilitiesExt = function(providerType)
{
	if (this.m_capabilitiesExt.hasElements() === false)
	{
		this.processCapabilitiesExt(oFF.SyncType.BLOCKING, null, null);
	}
	return this.m_capabilitiesExt.getByKey(providerType.getName());
};
oFF.OlapEnvSystem.prototype.processCapabilitiesExt = function(syncType, listener, customIdentifier)
{
	return oFF.OlapEnvCapabilitiesExtAction.createAndRun(syncType, listener, customIdentifier, this);
};
oFF.OlapEnvSystem.prototype.addCapabilities = function(providerType, capabilities)
{
	this.m_capabilitiesExt.put(providerType.getName(), capabilities);
};
oFF.OlapEnvSystem.prototype.getSupportedBaselineFormulaOperators = function(providerType)
{
	var systemConnect = this.getApplication().getConnectionPool().getSystemConnect(this.m_systemName);
	var systemType = systemConnect.getSystemDescription().getSystemType();
	var capabilities = this.getServiceCapabilitiesExt(providerType);
	var supportedBaselineLogic = this._getSupportedBaselineLogic(systemType, capabilities);
	return oFF.FormulaOperatorExt.getBaselineFormulaOperatorsExt(systemType, supportedBaselineLogic);
};
oFF.OlapEnvSystem.prototype._getSupportedBaselineLogic = function(systemType, capabilities)
{
	var baselineLogic = -1;
	if (systemType.isTypeOf(oFF.SystemType.BW))
	{
		baselineLogic = 0;
	}
	if (systemType.isTypeOf(oFF.SystemType.HANA))
	{
		baselineLogic = capabilities.supportsMdsBaseline1() ? 1 : 0;
		baselineLogic = capabilities.supportsMdsBaseline2() ? 2 : baselineLogic;
		baselineLogic = capabilities.supportsMdsBaseline3() ? 3 : baselineLogic;
		baselineLogic = capabilities.supportsMdsBaseline4() ? 4 : baselineLogic;
		baselineLogic = capabilities.supportsMdsBaseline5() ? 5 : baselineLogic;
		baselineLogic = capabilities.supportsMdsBaseline6() ? 6 : baselineLogic;
	}
	if (systemType.isTypeOf(oFF.SystemType.UNV))
	{
		baselineLogic = capabilities.supportsUnvBaseline1() ? 1 : baselineLogic;
		baselineLogic = capabilities.supportsUnvBaseline2() ? 2 : baselineLogic;
		baselineLogic = capabilities.supportsUnvBaseline3() ? 3 : baselineLogic;
		baselineLogic = capabilities.supportsUnvBaseline4() ? 4 : baselineLogic;
		baselineLogic = capabilities.supportsUnvBaseline5() ? 5 : baselineLogic;
	}
	return baselineLogic;
};
oFF.OlapEnvSystem.prototype.processSupportedFormulaOperators = function(syncType, listener, identifier)
{
	return this._processSupportedFormulaAndMemberNavigationsOperators(syncType, listener, identifier, false);
};
oFF.OlapEnvSystem.prototype.processSupportedFormulaAndMemberNavigationsOperators = function(syncType, listener, identifier)
{
	return this._processSupportedFormulaAndMemberNavigationsOperators(syncType, listener, identifier, true);
};
oFF.OlapEnvSystem.prototype._processSupportedFormulaAndMemberNavigationsOperators = function(syncType, listener, identifier, includeMemberNavigations)
{
	var action;
	if (oFF.notNull(this.m_supportedFormulas))
	{
		action = oFF.SyncActionExtRes.createSyncAction(this.m_supportedFormulas, null);
		if (oFF.notNull(listener))
		{
			listener.onSupportedFormula(action, this.m_supportedFormulas, identifier);
		}
	}
	else
	{
		this.m_listenerFormula = listener;
		var systemConnect = this.getApplication().getConnectionPool().getSystemConnect(this.m_systemName);
		var supportedFormulaAction = oFF.OlapEnvSupportedFormulaAction.create(systemConnect, includeMemberNavigations);
		supportedFormulaAction.processSyncAction(syncType, this, null);
		action = supportedFormulaAction;
	}
	return action;
};
oFF.OlapEnvSystem.prototype.onSupportedFormula = function(data, result, identifier)
{
	this.m_supportedFormulas = result;
	if (oFF.notNull(this.m_listenerFormula))
	{
		this.m_listenerFormula.onSupportedFormula(data, result, identifier);
	}
};
oFF.OlapEnvSystem.prototype.onCapabilities = function(data, result, identifier)
{
	this.m_capabilities = result;
	if (oFF.notNull(this.m_listenerCapabilities))
	{
		this.m_listenerCapabilities.onCapabilities(data, result, identifier);
	}
};
oFF.OlapEnvSystem.prototype.getVariantsByDatasource = function(datasourceName)
{
	var variants = this.m_variantsByDatasource.getByKey(datasourceName);
	if (oFF.isNull(variants))
	{
		variants = oFF.XListOfNameObject.create();
		this.m_variantsByDatasource.put(datasourceName, variants);
	}
	return variants;
};

oFF.OlapEnvironmentQMCreationListener = function() {};
oFF.OlapEnvironmentQMCreationListener.prototype = new oFF.SyncAction();
oFF.OlapEnvironmentQMCreationListener.prototype._ff_c = "OlapEnvironmentQMCreationListener";

oFF.OlapEnvironmentQMCreationListener.create = function()
{
	var obj = new oFF.OlapEnvironmentQMCreationListener();
	obj.m_additionalListener = oFF.XList.create();
	obj.m_additionalQms = oFF.XList.create();
	return obj;
};
oFF.OlapEnvironmentQMCreationListener.prototype.m_virtualQueryManager = null;
oFF.OlapEnvironmentQMCreationListener.prototype.m_additionalListener = null;
oFF.OlapEnvironmentQMCreationListener.prototype.m_additionalQms = null;
oFF.OlapEnvironmentQMCreationListener.prototype.processUpdate = function(syncType, listener, customIdentifier, targetQm)
{
	var syncState = this.getSyncState();
	if (oFF.notNull(syncState))
	{
		if (syncState.isTypeOf(oFF.SyncState.PROCESSING))
		{
			this.m_additionalListener.add(oFF.XPair.create(listener, customIdentifier));
			this.m_additionalQms.add(targetQm);
			return;
		}
		else
		{
			this.resetSyncState();
		}
	}
	this.setupActionAndRun(syncType, listener, customIdentifier, targetQm);
};
oFF.OlapEnvironmentQMCreationListener.prototype.releaseObject = function()
{
	this.m_virtualQueryManager = oFF.XObjectExt.release(this.m_virtualQueryManager);
	this.m_additionalListener = oFF.XObjectExt.release(this.m_additionalListener);
	oFF.SyncAction.prototype.releaseObject.call( this );
};
oFF.OlapEnvironmentQMCreationListener.prototype.processSynchronization = function(syncType)
{
	if (oFF.isNull(this.m_virtualQueryManager))
	{
		var targetQm = this.getActionContext();
		var virtualQueryServiceConfig = oFF.QueryServiceConfig.createWithDataSourceName(targetQm.getApplication(), targetQm.getSystemName(), oFF.QModelConstants.UPDATE_DYN_VAR_VIRTUAL_DATASOURCE);
		virtualQueryServiceConfig.processQueryManagerCreation(syncType, this, null);
	}
	else
	{
		this.prepareVirtualQueryManager();
		this.m_virtualQueryManager.processQueryExecution(syncType, this, null);
	}
	return true;
};
oFF.OlapEnvironmentQMCreationListener.prototype.onQueryManagerCreated = function(extResult, queryManager, customIdentifier)
{
	this.addAllMessages(extResult);
	if (this.hasErrors())
	{
		this.endSync();
		return;
	}
	this.m_virtualQueryManager = queryManager;
	this.prepareVirtualQueryManager();
	this.m_virtualQueryManager.processQueryExecution(this.getActiveSyncType(), this, null);
};
oFF.OlapEnvironmentQMCreationListener.prototype.prepareVirtualQueryManager = function()
{
	var queryModelVirtualDs = this.m_virtualQueryManager.getQueryModel();
	var targetQueryModel = this.getActionContext().getQueryModel();
	var virtualDatasource = oFF.QFactory.createFilterDynamicVariables(queryModelVirtualDs, targetQueryModel.getDataSource());
	var session = this.getActionContext().getSession();
	var cc = queryModelVirtualDs.getConvenienceCommands();
	if (session.hasFeature(oFF.FeatureToggleOlap.IMPROVED_DYNAMIC_VARIABLE_UPDATE))
	{
		cc.clearFilters();
		cc.addSingleMemberFilterByDimensionName("SchemaName", virtualDatasource.getSchemaName(), oFF.ComparisonOperator.EQUAL);
		cc.addSingleMemberFilterByDimensionName("PackageName", virtualDatasource.getPackageName(), oFF.ComparisonOperator.EQUAL);
		cc.addSingleMemberFilterByDimensionName("ObjectName", virtualDatasource.getObjectName(), oFF.ComparisonOperator.EQUAL);
		cc.moveDimensionToRows("Name");
		cc.moveDimensionToRows("Low");
		cc.moveDimensionToRows("High");
		cc.moveDimensionToRows("Option");
		cc.moveDimensionToRows("Sign");
		var variables = targetQueryModel.getVariables();
		for (var i = 0; i < variables.size(); i++)
		{
			var variable = variables.get(i);
			if (variable.isDynamicVariable())
			{
				cc.addSingleMemberFilterByDimensionName("Name", variable.getName(), oFF.ComparisonOperator.EQUAL);
			}
		}
	}
	else
	{
		queryModelVirtualDs.getFilter().getDynamicFilter().setComplexRoot(virtualDatasource);
		cc.addAllDimensions();
	}
};
oFF.OlapEnvironmentQMCreationListener.prototype.onQueryExecuted = function(extResult, resultSetContainer, customIdentifier)
{
	this.addAllMessages(extResult);
	if (this.isValid())
	{
		this.updateVariablesInQueryManager();
		this.setData(extResult.getData());
	}
	this.endSync();
};
oFF.OlapEnvironmentQMCreationListener.prototype.updateVariablesInQueryManager = function()
{
	var targetQueryModel = this.getActionContext().getQueryModel();
	this.updateVariablesInQueryManagerInternal(targetQueryModel);
	if (oFF.XCollectionUtils.hasElements(this.m_additionalQms))
	{
		for (var i = 0; i < this.m_additionalQms.size(); i++)
		{
			var additionalTarget = this.m_additionalQms.get(i).getQueryModel();
			this.updateVariablesInQueryManagerInternal(additionalTarget);
		}
		this.m_additionalQms.clear();
	}
};
oFF.OlapEnvironmentQMCreationListener.prototype.updateVariablesInQueryManagerInternal = function(target)
{
	var session = this.getActionContext().getSession();
	if (session.hasFeature(oFF.FeatureToggleOlap.IMPROVED_DYNAMIC_VARIABLE_UPDATE))
	{
		this.updateVariablesInQueryManagerImproved(target);
	}
	else
	{
		this.updateVariablesInQueryManagerOld(target);
	}
};
oFF.OlapEnvironmentQMCreationListener.prototype.updateVariablesInQueryManagerImproved = function(target)
{
	var variables = target.getVariables();
	for (var v = 0; v < variables.size(); v++)
	{
		var targetVar = variables.get(v);
		if (targetVar.isDynamicVariable())
		{
			targetVar.clear();
		}
	}
	var virtualQueryModel = this.m_virtualQueryManager.getQueryModel();
	var nameDimension = virtualQueryModel.getDimensionByName("Name");
	var lowDimension = virtualQueryModel.getDimensionByName("Low");
	var highDimension = virtualQueryModel.getDimensionByName("High");
	var optionDimension = virtualQueryModel.getDimensionByName("Option");
	var signDimension = virtualQueryModel.getDimensionByName("Sign");
	var rowsAxis = this.m_virtualQueryManager.getClassicResultSet().getRowsAxis();
	for (var i = 0; i < rowsAxis.getTuplesCount(); i++)
	{
		var tuple = rowsAxis.getTupleAt(i);
		var variable = target.getVariable(tuple.getTupleElementByDimension(nameDimension).getName());
		var lowValue = tuple.getTupleElementByDimension(lowDimension).getName();
		var highValue = tuple.getTupleElementByDimension(highDimension).getName();
		var operator = oFF.QInAConverter.lookupComparison(tuple.getTupleElementByDimension(optionDimension).getName());
		if (oFF.isNull(operator))
		{
			operator = oFF.ComparisonOperator.EQUAL;
		}
		var setSign = oFF.QInAConverter.lookupRsSetSign(tuple.getTupleElementByDimension(signDimension).getName());
		if (oFF.isNull(setSign))
		{
			setSign = oFF.SetSign.INCLUDING;
		}
		if (variable.getVariableType().isTypeOf(oFF.VariableType.DIMENSION_MEMBER_VARIABLE))
		{
			var variableBase = variable;
			var dimension = variableBase.getDimension();
			var keyField = dimension.getKeyField();
			var memberFilter = oFF.QFactory.createFilterCartesianListForDimensionMemberVariable(variable.getContext(), variableBase, keyField.getMetadata(), null);
			var cartesianElement = memberFilter.addNewCartesianElement();
			cartesianElement.setComparisonOperator(operator);
			cartesianElement.setSetSign(setSign);
			var valueType = memberFilter.getField().getValueType();
			if (operator.getNumberOfParameters() > 0 && oFF.XStringUtils.isNotNullAndNotEmpty(lowValue))
			{
				var newValue1 = oFF.XValueAccess.createWithType(valueType);
				newValue1.parseString(lowValue);
				if (newValue1.getValue() !== null)
				{
					cartesianElement.getLow().setValue(newValue1.getValue());
				}
			}
			if (operator.getNumberOfParameters() > 1 && oFF.XStringUtils.isNotNullAndNotEmpty(highValue))
			{
				var newValue2 = oFF.XValueAccess.createWithType(valueType);
				newValue2.parseString(highValue);
				if (newValue2.getValue() !== null)
				{
					cartesianElement.getHigh().setValue(newValue2.getValue());
				}
			}
			if (operator.getNumberOfParameters() === 0 || cartesianElement.getLow() !== null && cartesianElement.getLow().getValue() !== null || cartesianElement.getHigh() !== null && cartesianElement.getHigh().getValue() !== null)
			{
				if (variableBase.hasMemberFilter())
				{
					variableBase.getMemberFilter().add(cartesianElement);
				}
				else
				{
					variableBase.setMemberFilter(memberFilter);
				}
			}
		}
		else if (variable.getVariableType().isTypeOf(oFF.VariableType.SIMPLE_TYPE_VARIABLE))
		{
			variable.addValueByString(lowValue);
		}
		else if (variable.getVariableType().isTypeOf(oFF.VariableType.OPTION_LIST_VARIABLE))
		{
			variable.setOptionByName(lowValue);
		}
	}
};
oFF.OlapEnvironmentQMCreationListener.prototype.updateVariablesInQueryManagerOld = function(target)
{
	var virtualQueryModel = this.m_virtualQueryManager.getQueryModel();
	var classicResultSet = this.m_virtualQueryManager.getClassicResultSet();
	var rowsAxis = classicResultSet.getRowsAxis();
	var names = rowsAxis.getAllMembers(virtualQueryModel.getDimensionByName("Name"));
	var lowValues = rowsAxis.getAllMembers(virtualQueryModel.getDimensionByName("Low"));
	var highValues = rowsAxis.getAllMembers(virtualQueryModel.getDimensionByName("High"));
	if (oFF.isNull(names) || names.size() === 0)
	{
		return;
	}
	var sizeNames = names.size();
	var variables = target.getVariables();
	var numberOfVariables = variables.size();
	for (var variableIndex = 0; variableIndex < numberOfVariables; variableIndex++)
	{
		var variable = variables.get(variableIndex);
		if (!variable.isDynamicVariable())
		{
			continue;
		}
		for (var memberIndex = 0; memberIndex < sizeNames; memberIndex++)
		{
			if (oFF.XString.isEqual(names.get(memberIndex).getName(), variable.getName()))
			{
				var lowValue = lowValues.get(memberIndex).getName();
				if (oFF.XStringUtils.isNotNullAndNotEmpty(lowValue))
				{
					variable.setValueByString(lowValue);
					if (variable.getVariableType() === oFF.VariableType.DIMENSION_MEMBER_VARIABLE && oFF.XStringUtils.isNotNullAndNotEmpty(highValues.get(memberIndex).getName()))
					{
						var dimensionMemberVariable = variable;
						var memberFilter = dimensionMemberVariable.getMemberFilter();
						var filterOperation = memberFilter.getCartesianElement(0);
						filterOperation.getHigh().setString(highValues.get(memberIndex).getName());
					}
				}
			}
		}
	}
};
oFF.OlapEnvironmentQMCreationListener.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	if (oFF.notNull(listener))
	{
		listener.onQueryExecuted(this, data, customIdentifier);
	}
	if (oFF.XCollectionUtils.hasElements(this.m_additionalListener))
	{
		for (var i = 0; i < this.m_additionalListener.size(); i++)
		{
			var pair = this.m_additionalListener.get(i);
			pair.getFirstObject().onQueryExecuted(this, data, pair.getSecondObject());
		}
		this.m_additionalListener.clear();
	}
};

oFF.DocumentUpdateAction = function() {};
oFF.DocumentUpdateAction.prototype = new oFF.SyncAction();
oFF.DocumentUpdateAction.prototype._ff_c = "DocumentUpdateAction";

oFF.DocumentUpdateAction.createAndRun = function(syncType, listener, customIdentifier, context, state)
{
	var action = new oFF.DocumentUpdateAction();
	action.m_olapEnvState = state;
	action.setupAction(syncType, listener, customIdentifier, context);
	action.namesOfHandledQM = oFF.XHashSetOfString.create();
	action.namesOfSubmitedQms = oFF.XHashSetOfString.create();
	action.insStates = oFF.XHashMapByString.create();
	action.modCounters = oFF.XHashMapByString.create();
	action.olapStateManager = context;
	action.process();
	return action;
};
oFF.DocumentUpdateAction.prototype.m_olapEnvState = null;
oFF.DocumentUpdateAction.prototype.namesOfHandledQM = null;
oFF.DocumentUpdateAction.prototype.namesOfSubmitedQms = null;
oFF.DocumentUpdateAction.prototype.olapStateManager = null;
oFF.DocumentUpdateAction.prototype.insStates = null;
oFF.DocumentUpdateAction.prototype.modCounters = null;
oFF.DocumentUpdateAction.prototype.processSynchronization = function(syncType)
{
	var messages = oFF.MessageManagerSimple.createMessageManager();
	var filterManagerState = this.m_olapEnvState.getFilterManagerState();
	var filterStateEntry = this.olapStateManager.getStateCache().getByKey(filterManagerState.getStateId());
	var olapEnv = this.olapStateManager.getOlapEnv();
	var olapFilterManager = olapEnv.getFilterManager();
	var jsonParser = oFF.JsonParserFactory.newInstance();
	var filterStructure = jsonParser.parse(filterStateEntry.getState());
	if (jsonParser.hasErrors())
	{
		this.addAllMessages(jsonParser);
		return false;
	}
	messages.copyAllMessages(olapFilterManager.deserializeFromElementExt(oFF.QModelFormat.INA_REPOSITORY, filterStructure));
	olapFilterManager.setModCounter(filterManagerState.getModCounter());
	var qmNames = this.m_olapEnvState.getQueryManagersState().getKeysAsIteratorOfString();
	var submited = false;
	var queryManagersNoSubmit = oFF.XSetOfNameObject.create();
	var queryManagersToSubmit = oFF.XSetOfNameObject.create();
	while (qmNames.hasNext())
	{
		var qmName = qmNames.next();
		this.namesOfHandledQM.add(qmName);
		var qmState = this.m_olapEnvState.getQueryManagersState().getByKey(qmName);
		var state = this.olapStateManager.getStateCache().getByKey(qmState.getStateId()).getState();
		var inaState = jsonParser.parse(state);
		if (oFF.notNull(inaState) && !inaState.isEmpty())
		{
			this.insStates.put(qmName, inaState);
			var queryManager = olapEnv.getQueryManagerByName(qmName);
			var qmDefinition = inaState.getStructureByKey(oFF.QStateConstants.QUERY_MODEL);
			var isBlendableQueryManagerDefinition = oFF.XComponentType.lookupComponentType(qmDefinition.getStringByKey("CType")) === oFF.OlapComponentType.BLENDABLE_QUERY_MANAGER;
			if (oFF.notNull(queryManager) && (queryManager.getOlapComponentType() === oFF.OlapComponentType.QUERY_MANAGER && isBlendableQueryManagerDefinition || queryManager.getOlapComponentType() === oFF.OlapComponentType.BLENDABLE_QUERY_MANAGER && !isBlendableQueryManagerDefinition))
			{
				queryManager = oFF.XObjectExt.release(queryManager);
			}
			if (oFF.isNull(queryManager))
			{
				queryManager = this.recreateQueryManager(qmDefinition, messages, inaState.getStringByKeyExt(oFF.QStateConstants.MANAGER_DATASET_ID, null), inaState.getByKey(oFF.QStateConstants.MANAGER_TAGS), inaState.getStringByKey(oFF.QStateConstants.MANAGER_SYSTEM_NAME));
				queryManager.setName(qmName);
			}
			this.namesOfSubmitedQms.add(qmName);
			if (queryManager.isSubmitNeeded())
			{
				queryManagersToSubmit.add(queryManager);
			}
			else
			{
				queryManagersNoSubmit.add(queryManager);
			}
			this.modCounters.put(qmName, oFF.XIntegerValue.create(qmState.getModCounter()));
		}
	}
	var noSubmitIter = queryManagersNoSubmit.getValuesAsReadOnlyList().getIterator();
	while (noSubmitIter.hasNext())
	{
		this.onVariableProcessorExecuted(null, null, noSubmitIter.next());
	}
	oFF.XObjectExt.release(noSubmitIter);
	var toSubmitIter = queryManagersToSubmit.getValuesAsReadOnlyList().getIterator();
	while (toSubmitIter.hasNext())
	{
		var queryManagerToSubmit = toSubmitIter.next();
		queryManagerToSubmit.submitVariables(syncType, this, queryManagerToSubmit);
		submited = true;
	}
	oFF.XObjectExt.release(toSubmitIter);
	return submited;
};
oFF.DocumentUpdateAction.prototype.onVariableProcessorExecuted = function(extResult, result, customIdentifier)
{
	this.addAllMessages(extResult);
	if (oFF.notNull(extResult) && extResult.hasErrors())
	{
		this.endSync();
	}
	else
	{
		var queryManager = customIdentifier;
		this.updateQueryManagerFromState(this.olapStateManager.getOlapEnv().getFilterManager(), queryManager);
		var name = queryManager.getName();
		queryManager.getQueryModelBase().setModCounter(this.modCounters.getByKey(queryManager.getName()).getInteger());
		this.namesOfSubmitedQms.removeElement(name);
		if (this.namesOfSubmitedQms.isEmpty())
		{
			if (this.olapStateManager.isReleaseQueryManagersEnabled())
			{
				var qmIterator = this.olapStateManager.getOlapEnv().getAllAreaQueryManager().getIterator();
				while (qmIterator.hasNext())
				{
					var existingQm = qmIterator.next();
					if (!existingQm.isReleased() && !this.namesOfHandledQM.contains(existingQm.getName()) && !this.olapStateManager.hasToBeIgnored(existingQm))
					{
						oFF.XObjectExt.release(existingQm);
					}
				}
			}
			this.setData(this.olapStateManager.getOlapEnv());
			this.endSync();
		}
	}
};
oFF.DocumentUpdateAction.prototype.updateQueryManagerFromState = function(olapFilterManager, queryManager)
{
	var inaState = this.insStates.getByKey(queryManager.getName());
	if (queryManager.getOlapComponentType() === oFF.OlapComponentType.BLENDABLE_QUERY_MANAGER)
	{
		queryManager.deserializeFromElementExt(oFF.QModelFormat.INA_REPOSITORY, inaState.getStructureByKey(oFF.QStateConstants.QUERY_MODEL));
		var blendableQueryManager = queryManager;
		var queryManagerExternalFiltersList = inaState.getListByKey(oFF.QStateConstants.QUERY_MANAGER_EXTERNAL_FILTERS);
		var queryManagerExternalFiltersListIter = queryManagerExternalFiltersList.getIterator();
		while (queryManagerExternalFiltersListIter.hasNext())
		{
			var queryManagerExternalFilters = queryManagerExternalFiltersListIter.next().asStructure();
			var queryManagerName = queryManagerExternalFilters.getStringByKey(oFF.QStateConstants.MANAGER_DATASET_ID);
			var leafQueryManager = blendableQueryManager.getQueryManagerByDatasetId(queryManagerName);
			if (oFF.notNull(leafQueryManager))
			{
				this.applyExternalFilterToQueryManager(olapFilterManager, leafQueryManager, queryManagerExternalFilters);
			}
		}
	}
	else
	{
		queryManager.getQueryModel().deserializeFromElementExt(oFF.QModelFormat.INA_REPOSITORY, inaState.getStructureByKey(oFF.QStateConstants.QUERY_MODEL));
		this.applyExternalFilterToQueryManager(olapFilterManager, queryManager, inaState);
	}
};
oFF.DocumentUpdateAction.prototype.applyExternalFilterToQueryManager = function(olapFilterManager, queryManager, inaState)
{
	var inaUsedExternalFilters = inaState.getListByKey("OlapFilters");
	if (oFF.notNull(inaUsedExternalFilters))
	{
		var filter = queryManager.getQueryModel().getFilter();
		var size = inaUsedExternalFilters.size();
		filter.unlinkFilters();
		for (var i = 0; i < size; i++)
		{
			var usedFilter = inaUsedExternalFilters.getStructureAt(i);
			var name = usedFilter.getStringByKey("Name");
			var externalFilter = olapFilterManager.getFilterById(usedFilter.getStringByKey("Id"));
			if (oFF.isNull(externalFilter))
			{
				this.addWarning(oFF.ErrorCodes.IMPORT_EXTERNAL_FILTER_NOT_FOUND, oFF.XStringUtils.concatenate3("Could not restore external filter '", name, "'!"));
			}
			else
			{
				filter.linkFilter(name, externalFilter);
			}
		}
	}
};
oFF.DocumentUpdateAction.prototype.recreateQueryManager = function(inaQueryManager, messages, datasetId, tags, systemName)
{
	var olapEnv = this.olapStateManager.getOlapEnv();
	var queryManager = null;
	var componentType = inaQueryManager.getStringByKey("CType");
	if (oFF.notNull(componentType) && oFF.XComponentType.lookupComponentType(componentType) === oFF.OlapComponentType.BLENDABLE_QUERY_MANAGER)
	{
		var inaPrimaryQueryManager = inaQueryManager.getStructureByKey("PrimaryQueryManager");
		var primaryDatasetId = inaPrimaryQueryManager.getStringByKey("DatasetId");
		var primarySharedQueryManager = olapEnv.getSharedQueryManager(primaryDatasetId);
		var blendableQueryManager = olapEnv.getModelLinkManager().createBlendableQueryManager(inaQueryManager.getStringByKey("StorageName"), primarySharedQueryManager.cloneQueryManagerExt(oFF.QueryCloneMode.CURRENT_STATE), inaQueryManager.getStringByKey("Name"));
		var inaSecondaryQueryManagers = inaQueryManager.getListByKey("QueryManagers");
		var inaSecondaryQueryManagersIter = inaSecondaryQueryManagers.getIterator();
		while (inaSecondaryQueryManagersIter.hasNext())
		{
			var inaSecondaryQueryManager = inaSecondaryQueryManagersIter.next().asStructure();
			var secondaryDatasetId = inaSecondaryQueryManager.getStringByKey("DatasetId");
			var secondarySharedQueryManager = olapEnv.getSharedQueryManager(secondaryDatasetId);
			blendableQueryManager.addSecondaryQueryManager(secondarySharedQueryManager.cloneQueryManagerExt(oFF.QueryCloneMode.CURRENT_STATE));
		}
		queryManager = blendableQueryManager;
	}
	else
	{
		if (oFF.XStringUtils.isNotNullAndNotEmpty(datasetId))
		{
			var sharedQueryManager = olapEnv.getSharedQueryManager(datasetId);
			if (oFF.notNull(sharedQueryManager) && !sharedQueryManager.isReleased())
			{
				queryManager = sharedQueryManager.cloneQueryManagerExt(oFF.QueryCloneMode.CURRENT_STATE);
				queryManager.getTagging().remove(oFF.QStateConstants.TAG_UNDO_IGNORE);
				queryManager.getTagging().remove(oFF.QStateConstants.TAG_UNDO_INCLUDE);
				queryManager.deserializeFromElementExt(oFF.QModelFormat.INA_REPOSITORY, inaQueryManager);
			}
		}
		if (oFF.isNull(queryManager))
		{
			var queryServiceConfig = oFF.QueryServiceConfig.create(olapEnv.getApplication());
			queryServiceConfig.setDefinitionByStructure(oFF.QModelFormat.INA_REPOSITORY, inaQueryManager);
			queryServiceConfig.setSystemName(systemName);
			var result = queryServiceConfig.processQueryManagerCreation(oFF.SyncType.BLOCKING, null, null);
			messages.addAllMessages(result);
			queryManager = result.getData();
		}
	}
	if (oFF.notNull(queryManager) && oFF.notNull(tags))
	{
		var tagsList = tags.asList();
		for (var i = 0; i < tagsList.size(); i++)
		{
			var tag = tagsList.get(i).asStructure();
			queryManager.getTagging().put(tag.getStringByKey("KEY"), tag.getStringByKey("VALUE"));
		}
	}
	return queryManager;
};
oFF.DocumentUpdateAction.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.documentStateApplied(extResult, data, customIdentifier);
};

oFF.ResultSetContainerProcessExecutionAction = function() {};
oFF.ResultSetContainerProcessExecutionAction.prototype = new oFF.SyncAction();
oFF.ResultSetContainerProcessExecutionAction.prototype._ff_c = "ResultSetContainerProcessExecutionAction";

oFF.ResultSetContainerProcessExecutionAction.createAction = function(resultSetContainer)
{
	var action = new oFF.ResultSetContainerProcessExecutionAction();
	action.m_resultSetContainer = resultSetContainer;
	action.setupAction(null, null, null, null);
	return action;
};
oFF.ResultSetContainerProcessExecutionAction.prototype.m_resultSetContainer = null;
oFF.ResultSetContainerProcessExecutionAction.prototype.m_resultSetContainerExecution = null;
oFF.ResultSetContainerProcessExecutionAction.prototype.releaseObject = function()
{
	oFF.SyncAction.prototype.releaseObject.call( this );
	this.m_resultSetContainer = null;
	this.m_resultSetContainerExecution = oFF.XObjectExt.release(this.m_resultSetContainerExecution);
};
oFF.ResultSetContainerProcessExecutionAction.prototype.processSynchronization = function(syncType)
{
	this.m_resultSetContainerExecution = this.m_resultSetContainer.processExecution(syncType, this, null);
	if (!this.getSyncState().isInSync() && (this.m_resultSetContainerExecution.getSyncState().isInSync() || this.m_resultSetContainerExecution.hasErrors()))
	{
		this.addAllMessages(this.m_resultSetContainerExecution);
		this.setData(this.m_resultSetContainerExecution.getData());
		return false;
	}
	return true;
};
oFF.ResultSetContainerProcessExecutionAction.prototype.onQueryExecuted = function(extResult, resultSetContainer, customIdentifier)
{
	this.addAllMessages(extResult);
	this.setData(resultSetContainer);
	this.endSync();
};
oFF.ResultSetContainerProcessExecutionAction.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onQueryExecuted(extResult, data, customIdentifier);
};

oFF.RpcBlendFunctionProcessExecutionAction = function() {};
oFF.RpcBlendFunctionProcessExecutionAction.prototype = new oFF.SyncAction();
oFF.RpcBlendFunctionProcessExecutionAction.prototype._ff_c = "RpcBlendFunctionProcessExecutionAction";

oFF.RpcBlendFunctionProcessExecutionAction.createAction = function(rpcFunction, queryManager)
{
	var action = new oFF.RpcBlendFunctionProcessExecutionAction();
	action.m_rpcFunction = rpcFunction;
	action.m_queryManager = queryManager;
	action.setupAction(null, null, null, null);
	return action;
};
oFF.RpcBlendFunctionProcessExecutionAction.prototype.m_rpcFunction = null;
oFF.RpcBlendFunctionProcessExecutionAction.prototype.m_rpcFunctionExecution = null;
oFF.RpcBlendFunctionProcessExecutionAction.prototype.m_queryManager = null;
oFF.RpcBlendFunctionProcessExecutionAction.prototype.releaseObject = function()
{
	oFF.SyncAction.prototype.releaseObject.call( this );
	this.m_rpcFunction = null;
	this.m_queryManager = null;
	this.m_rpcFunctionExecution = oFF.XObjectExt.release(this.m_rpcFunctionExecution);
};
oFF.RpcBlendFunctionProcessExecutionAction.prototype.processSynchronization = function(syncType)
{
	var serviceConfig = this.m_queryManager.getServiceConfig();
	var blendingDefinition = serviceConfig.getBlendingDefinition();
	var blendingSources = blendingDefinition.getSources();
	if (blendingSources.isEmpty())
	{
		this.addError(oFF.ErrorCodes.INVALID_STATE, "No blending sources set");
		return false;
	}
	for (var i = 0; i < blendingSources.size(); i++)
	{
		blendingSources.get(i).getQueryModel().destroyTransientObjects();
	}
	this.m_rpcFunctionExecution = this.m_rpcFunction.processFunctionExecution(syncType, this, null);
	if (!this.getSyncState().isInSync() && (this.m_rpcFunctionExecution.getSyncState().isInSync() || this.m_rpcFunctionExecution.hasErrors()))
	{
		this.addAllMessages(this.m_rpcFunctionExecution);
		this.setData(this.m_rpcFunctionExecution.getData());
		return false;
	}
	return true;
};
oFF.RpcBlendFunctionProcessExecutionAction.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onFunctionExecuted(extResult, data, customIdentifier);
};
oFF.RpcBlendFunctionProcessExecutionAction.prototype.onFunctionExecuted = function(extResult, response, customIdentifier)
{
	this.addAllMessages(extResult);
	this.setData(response);
	this.endSync();
};

oFF.OlapEnvironment = function() {};
oFF.OlapEnvironment.prototype = new oFF.DfNameObject();
oFF.OlapEnvironment.prototype._ff_c = "OlapEnvironment";

oFF.OlapEnvironment.SYSTEM_NAME = "systemName";
oFF.OlapEnvironment.QUERY_MANAGER = "queryManager";
oFF.OlapEnvironment.CUSTOM_IDENTIFIER = "customIdentifier";
oFF.OlapEnvironment.LISTENER = "listener";
oFF.OlapEnvironment.SYNC_TYPE = "syncType";
oFF.OlapEnvironment.create = function(application)
{
	var newObj = new oFF.OlapEnvironment();
	newObj.setupEnv(application);
	return newObj;
};
oFF.OlapEnvironment.prototype.m_application = null;
oFF.OlapEnvironment.prototype.m_varProcessor = null;
oFF.OlapEnvironment.prototype.m_stateManager = null;
oFF.OlapEnvironment.prototype.m_queryManagerHandler = null;
oFF.OlapEnvironment.prototype.m_customHierarchyRepo = null;
oFF.OlapEnvironment.prototype.m_queryManagers = null;
oFF.OlapEnvironment.prototype.m_isCmdTracing = false;
oFF.OlapEnvironment.prototype.m_variables = null;
oFF.OlapEnvironment.prototype.m_traceOffset = 0;
oFF.OlapEnvironment.prototype.m_traces = null;
oFF.OlapEnvironment.prototype.m_remoteBlendingCache = null;
oFF.OlapEnvironment.prototype.m_rsDataMaxCacheEntries = 10;
oFF.OlapEnvironment.prototype.m_resourceToStringRep = null;
oFF.OlapEnvironment.prototype.m_systems = null;
oFF.OlapEnvironment.prototype.m_filterManager = null;
oFF.OlapEnvironment.prototype.m_prequeries = null;
oFF.OlapEnvironment.prototype.m_transientQueryManager = null;
oFF.OlapEnvironment.prototype.m_sharedQueryManagers = null;
oFF.OlapEnvironment.prototype.m_allowedFormulaOperators = null;
oFF.OlapEnvironment.prototype.m_supportedFormulaOperators = null;
oFF.OlapEnvironment.prototype.m_clientQueryObjectManager = null;
oFF.OlapEnvironment.prototype.m_modelCache = null;
oFF.OlapEnvironment.prototype.m_filterAcrossModelsLovCacheManager = null;
oFF.OlapEnvironment.prototype.m_geoManager = null;
oFF.OlapEnvironment.prototype.m_modelLinkManager = null;
oFF.OlapEnvironment.prototype.setupEnv = function(application)
{
	this.setApplication(application);
	var process = this.getSession();
	if (oFF.notNull(process))
	{
		process.setEntity(oFF.ProcessEntity.OLAP_ENVIRONMENT, this);
	}
	this.m_remoteBlendingCache = oFF.XLinkedHashMapByString.create();
	this.m_resourceToStringRep = oFF.QCache.create(process);
	this.m_queryManagers = oFF.XListOfNameObject.create();
	this.m_varProcessor = oFF.OlapEnvVarProcessor.create(this);
	this.m_stateManager = oFF.OlapEnvStateManager.create(this, process);
	this.m_queryManagerHandler = oFF.OlapEnvQueryManagerHandler.create(this);
	this.m_systems = oFF.XHashMapByString.create();
	this.m_customHierarchyRepo = oFF.CustomHierarchyRepository.create(application);
	this.m_prequeries = oFF.XLinkedHashMapByString.create();
	this.m_transientQueryManager = oFF.XHashMapByString.create();
	this.m_sharedQueryManagers = oFF.XHashMapByString.create();
	this.m_modelCache = oFF.QCache.create(process);
};
oFF.OlapEnvironment.prototype.releaseObject = function()
{
	if (oFF.notNull(this.m_queryManagers))
	{
		for (var i = 0; i < this.m_queryManagers.size(); i++)
		{
			var queryManager = this.m_queryManagers.get(i);
			oFF.XObjectExt.release(queryManager);
		}
		oFF.XObjectExt.release(this.m_queryManagers);
		this.m_queryManagers = null;
	}
	this.m_systems = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_systems);
	this.m_varProcessor = oFF.XObjectExt.release(this.m_varProcessor);
	this.m_stateManager = oFF.XObjectExt.release(this.m_stateManager);
	this.m_queryManagerHandler = oFF.XObjectExt.release(this.m_queryManagerHandler);
	this.m_customHierarchyRepo = oFF.XObjectExt.release(this.m_customHierarchyRepo);
	this.m_remoteBlendingCache = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_remoteBlendingCache);
	this.m_application = null;
	this.m_resourceToStringRep = oFF.XObjectExt.release(this.m_resourceToStringRep);
	this.m_systems = oFF.XObjectExt.release(this.m_systems);
	this.m_filterManager = oFF.XObjectExt.release(this.m_filterManager);
	this.m_geoManager = oFF.XObjectExt.release(this.m_geoManager);
	this.m_modelLinkManager = oFF.XObjectExt.release(this.m_modelLinkManager);
	this.m_clientQueryObjectManager = oFF.XObjectExt.release(this.m_clientQueryObjectManager);
	this.m_filterAcrossModelsLovCacheManager = oFF.XObjectExt.release(this.m_filterAcrossModelsLovCacheManager);
	this.m_prequeries = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_prequeries);
	this.m_transientQueryManager = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_transientQueryManager);
	this.m_sharedQueryManagers = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_sharedQueryManagers);
	this.m_allowedFormulaOperators = oFF.XObjectExt.release(this.m_allowedFormulaOperators);
	this.m_supportedFormulaOperators = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_supportedFormulaOperators);
	oFF.DfNameObject.prototype.releaseObject.call( this );
};
oFF.OlapEnvironment.prototype.getComponentType = function()
{
	return oFF.OlapComponentType.OLAP_ENVIRONMENT;
};
oFF.OlapEnvironment.prototype.getSession = function()
{
	return this.getProcess();
};
oFF.OlapEnvironment.prototype.getProcess = function()
{
	var application = this.getApplication();
	return oFF.isNull(application) ? null : application.getProcess();
};
oFF.OlapEnvironment.prototype.getApplication = function()
{
	return oFF.XWeakReferenceUtil.getHardRef(this.m_application);
};
oFF.OlapEnvironment.prototype.getApplicationBase = function()
{
	return oFF.XWeakReferenceUtil.getHardRef(this.m_application);
};
oFF.OlapEnvironment.prototype.setApplication = function(application)
{
	this.m_application = oFF.XWeakReferenceUtil.getWeakRef(application);
};
oFF.OlapEnvironment.prototype.registerQueryManager = function(queryManager)
{
	this.m_queryManagers.add(queryManager);
};
oFF.OlapEnvironment.prototype.unregisterQueryManager = function(queryManager)
{
	if (oFF.notNull(this.m_queryManagers))
	{
		this.m_queryManagers.removeElement(queryManager);
	}
	var iter = this.m_sharedQueryManagers.getKeysAsIteratorOfString();
	while (iter.hasNext())
	{
		var key = iter.next();
		if (queryManager.isEqualTo(this.m_sharedQueryManagers))
		{
			this.m_sharedQueryManagers.remove(key);
		}
	}
};
oFF.OlapEnvironment.prototype.getSharedQueryManager = function(datasetId)
{
	return this.m_sharedQueryManagers.getByKey(datasetId);
};
oFF.OlapEnvironment.prototype.registerSharedQueryManager = function(datasetId, sharedQueryManager)
{
	this.m_sharedQueryManagers.put(datasetId, sharedQueryManager);
};
oFF.OlapEnvironment.prototype.getAllAreaQueryManager = function()
{
	var copy = oFF.XList.create();
	oFF.XCollectionUtils.addAll(copy, this.m_queryManagers);
	return copy;
};
oFF.OlapEnvironment.prototype.containsQueryManagerWithName = function(name)
{
	return this.m_queryManagers.containsKey(name);
};
oFF.OlapEnvironment.prototype.getQueryManagerByName = function(name)
{
	return this.m_queryManagers.getByKey(name);
};
oFF.OlapEnvironment.prototype.getVariableProcessor = function()
{
	return this.m_varProcessor;
};
oFF.OlapEnvironment.prototype.getCustomHierarchyRepository = function()
{
	return this.m_customHierarchyRepo;
};
oFF.OlapEnvironment.prototype.getOlapEnv = function()
{
	return this;
};
oFF.OlapEnvironment.prototype.setTracing = function(enableTracing)
{
	if (this.m_isCmdTracing !== enableTracing)
	{
		this.m_isCmdTracing = enableTracing;
		if (enableTracing)
		{
			this.m_traces = oFF.XList.create();
			this.m_traceOffset = 0;
		}
		else
		{
			this.m_traces = oFF.XObjectExt.release(this.m_traces);
		}
	}
};
oFF.OlapEnvironment.prototype.isTracing = function()
{
	return oFF.notNull(this.m_traces);
};
oFF.OlapEnvironment.prototype.getTracingLog = function()
{
	if (oFF.isNull(this.m_traces))
	{
		return "[Tracing not enabled]";
	}
	var buffer = oFF.XStringBuffer.create();
	for (var i = 0; i < this.m_traces.size(); i++)
	{
		var cmd = this.m_traces.get(i);
		buffer.appendLine(cmd.toString());
	}
	return buffer.toString();
};
oFF.OlapEnvironment.prototype.addTraceEntry = function(entry)
{
	if (oFF.notNull(this.m_traces))
	{
		this.m_traces.add(entry);
	}
};
oFF.OlapEnvironment.prototype.getTraceChunk = function()
{
	var chunk = this.m_traces;
	if (oFF.notNull(this.m_traces))
	{
		this.m_traceOffset = this.m_traceOffset + this.m_traces.size();
		this.m_traces = oFF.XList.create();
	}
	return chunk;
};
oFF.OlapEnvironment.prototype.getTraceOffset = function()
{
	return this.m_traceOffset;
};
oFF.OlapEnvironment.prototype.setReplacementVariables = function(variables, varPrefix, varPostfix, lookupNamespace)
{
	this.m_variables = variables;
};
oFF.OlapEnvironment.prototype.replaceVariable = function(name)
{
	return oFF.isNull(this.m_variables) ? name : this.m_variables.getStringByKeyExt(name, name);
};
oFF.OlapEnvironment.prototype.selectCmds = function(olapObject)
{
	return oFF.CommandSpaceFactory.createCommandSpaceWithElement(this, olapObject);
};
oFF.OlapEnvironment.prototype.select = function(sigSelExpression)
{
	return oFF.CommandSpaceFactory.createCommandSpaceWithSelection(this, sigSelExpression);
};
oFF.OlapEnvironment.prototype.getContext = function()
{
	return this;
};
oFF.OlapEnvironment.prototype.setContext = oFF.noSupport;
oFF.OlapEnvironment.prototype.getQueryManager = function()
{
	return null;
};
oFF.OlapEnvironment.prototype.getQueryModel = function()
{
	return null;
};
oFF.OlapEnvironment.prototype.getVariableContainer = function()
{
	return null;
};
oFF.OlapEnvironment.prototype.getDimensionAccessor = function()
{
	return null;
};
oFF.OlapEnvironment.prototype.getFieldAccessorSingle = function()
{
	return null;
};
oFF.OlapEnvironment.prototype.getModelCapabilities = function()
{
	return null;
};
oFF.OlapEnvironment.prototype.getDrillManager = function()
{
	return null;
};
oFF.OlapEnvironment.prototype.getCellContextManager = function()
{
	return null;
};
oFF.OlapEnvironment.prototype.getDataSourceOrigin = function()
{
	return this.getDataSource();
};
oFF.OlapEnvironment.prototype.getDataSourceTarget = function()
{
	return this.getDataSource();
};
oFF.OlapEnvironment.prototype.getDataSource = function()
{
	return null;
};
oFF.OlapEnvironment.prototype.getKeyRefStorage = function()
{
	return null;
};
oFF.OlapEnvironment.prototype.cacheRemoteBlendingData = function(queryManager, view, cube)
{
	var cacheId = queryManager.getResultSetPersistenceIdentifier();
	if (oFF.XStringUtils.isNotNullAndNotEmpty(cacheId) && (oFF.XStringUtils.isNotNullAndNotEmpty(view) || oFF.XStringUtils.isNotNullAndNotEmpty(cube)))
	{
		this.m_remoteBlendingCache.put(cacheId, oFF.RemoteBlendingCacheEntry.create(view, cube, queryManager.getDataSource().getFullQualifiedName()));
		if (this.m_remoteBlendingCache.size() > this.m_rsDataMaxCacheEntries)
		{
			this.invalidateRemoteBlendingCacheEntry(this.m_remoteBlendingCache.getKeysAsReadOnlyListOfString().get(0));
		}
	}
};
oFF.OlapEnvironment.prototype.invalidateRemoteBlendingCacheEntry = function(cacheId)
{
	if (oFF.XStringUtils.isNotNullAndNotEmpty(cacheId))
	{
		oFF.XObjectExt.release(this.m_remoteBlendingCache.getByKey(cacheId));
		this.m_remoteBlendingCache.remove(cacheId);
	}
};
oFF.OlapEnvironment.prototype.invalidateRemoteBlendingCacheByDataSource = function(dataSourceName)
{
	var cacheEntries = this.m_remoteBlendingCache.getValuesAsReadOnlyList();
	for (var i = cacheEntries.size() - 1; i >= 0; i--)
	{
		if (oFF.XString.isEqual(cacheEntries.get(i).getDataSourceName(), dataSourceName))
		{
			this.invalidateRemoteBlendingCacheEntry(this.m_remoteBlendingCache.getKeysAsReadOnlyListOfString().get(i));
		}
	}
};
oFF.OlapEnvironment.prototype.invalidateRemoteBlendingCache = function()
{
	oFF.XCollectionUtils.releaseEntriesFromCollection(this.m_remoteBlendingCache);
	this.m_remoteBlendingCache.clear();
};
oFF.OlapEnvironment.prototype.setRemoteBlendingCacheEntryCount = function(entryCount)
{
	this.m_rsDataMaxCacheEntries = oFF.XMath.max(entryCount, 0);
	while (this.m_remoteBlendingCache.hasElements() && this.m_remoteBlendingCache.size() > this.m_rsDataMaxCacheEntries)
	{
		this.invalidateRemoteBlendingCacheEntry(this.m_remoteBlendingCache.getKeysAsReadOnlyListOfString().get(0));
	}
};
oFF.OlapEnvironment.prototype.getRemoteBlendingCacheEntryCount = function()
{
	return this.m_rsDataMaxCacheEntries;
};
oFF.OlapEnvironment.prototype.getCachedRemoteBlendingData = function(cacheId)
{
	return this.m_remoteBlendingCache.getByKey(cacheId);
};
oFF.OlapEnvironment.prototype.getMicroCubesNames = function(systemName)
{
	return this.getSystemContainer(systemName).getMicroCubesNames();
};
oFF.OlapEnvironment.prototype.isValidMicroCubeName = function(systemName, name)
{
	return this.getSystemContainer(systemName).isValidMicroCubeName(name);
};
oFF.OlapEnvironment.prototype.addMicroCube = function(systemName, name, queryManager)
{
	return this.getSystemContainerBase(systemName).addMicroCube(name, queryManager);
};
oFF.OlapEnvironment.prototype.getMicroCube = function(systemName, name)
{
	return this.getSystemContainerBase(systemName).getMicroCube(name);
};
oFF.OlapEnvironment.prototype.removeMicroCubeName = function(systemName, name)
{
	this.getSystemContainerBase(systemName).removeMicroCubeName(name);
};
oFF.OlapEnvironment.prototype.processCmdContextCreation = function(syncType, listener, customIdentifier, serviceConfig, asBackgroundThread)
{
	var pair = oFF.XPair.create(listener, customIdentifier);
	serviceConfig.processQueryManagerCreation(oFF.SyncType.NON_BLOCKING, this, pair);
	return null;
};
oFF.OlapEnvironment.prototype.onQueryManagerCreated = function(extResult, queryManager, customIdentifier)
{
	var pair = customIdentifier;
	var listener = pair.getFirstObject();
	var targetCustomIdentifier = pair.getSecondObject();
	var cmdContext = null;
	if (oFF.notNull(queryManager))
	{
		cmdContext = this.selectCmds(queryManager);
	}
	var extResult2 = oFF.ExtResult.create(cmdContext, extResult);
	listener.onCmdContextCreated(extResult2, cmdContext, targetCustomIdentifier);
};
oFF.OlapEnvironment.prototype.updateDynamicVariablesForQueryManager = function(queryManager, syncType, listener, customIdentifier)
{
	var systemName = queryManager.getSystemDescription().getSystemName();
	var systemContainer = this.getSystemContainer(systemName);
	systemContainer.updateDynamicVariablesForQueryManager(queryManager, syncType, listener, customIdentifier);
};
oFF.OlapEnvironment.prototype.addBLOBDetailsToCache = function(resourceKey, contentAndMime)
{
	this.m_resourceToStringRep.put(resourceKey, contentAndMime);
};
oFF.OlapEnvironment.prototype.useBLOBDetailsForResourceId = function(resourceKey)
{
	return this.m_resourceToStringRep.useEntry(resourceKey);
};
oFF.OlapEnvironment.prototype.getBLOBDetailsForResourceId = function(resourceKey)
{
	return this.m_resourceToStringRep.getByKey(resourceKey);
};
oFF.OlapEnvironment.prototype.hasBLOBForResourceId = function(resourceKey)
{
	return this.m_resourceToStringRep.containsKey(resourceKey);
};
oFF.OlapEnvironment.prototype.releaseResource = function(resourceKey)
{
	this.m_resourceToStringRep.freeEntry(resourceKey);
};
oFF.OlapEnvironment.prototype.getDimensionMetadata = function(key)
{
	var container = this.getCubeContainerInternal(key);
	return container.getDimensionMetadata(key);
};
oFF.OlapEnvironment.prototype.getDimensionMetadataByKey = function(key)
{
	var container = this.getCubeContainerInternal(key);
	return container.getDimensionMetadataByKey(key);
};
oFF.OlapEnvironment.prototype.setDimensionMetadata = function(metadata)
{
	var container = this.getCubeContainerInternal(metadata.getCacheKey());
	container.setDimensionMetadata(metadata);
};
oFF.OlapEnvironment.prototype.releaseDimensionMetadataByKey = function(key)
{
	var container = this.getCubeContainerInternal(key);
	container.releaseDimensionMetadataByKey(key);
};
oFF.OlapEnvironment.prototype.getKeyFieldMetadataByDimension = function(key)
{
	var container = this.getCubeContainerInternal(key);
	return container.getKeyFieldMetadataByDimension(key);
};
oFF.OlapEnvironment.prototype.getFieldMetadata = function(key)
{
	var container = this.getCubeContainerInternal(key);
	return container.getFieldMetadata(key);
};
oFF.OlapEnvironment.prototype.getFieldMetadataByKey = function(key)
{
	var container = this.getCubeContainerInternal(key);
	return container.getFieldMetadataByKey(key);
};
oFF.OlapEnvironment.prototype.setFieldMetadata = function(metadata)
{
	var container = this.getCubeContainerInternal(metadata.getCacheKey());
	container.setFieldMetadata(metadata);
};
oFF.OlapEnvironment.prototype.releaseFieldMetadataByKey = function(key)
{
	var container = this.getCubeContainerInternal(key);
	container.releaseFieldMetadataByKey(key);
};
oFF.OlapEnvironment.prototype.setQueryMetadata = function(key, entry)
{
	if (oFF.notNull(key))
	{
		var container = this.getCubeContainerInternal(key);
		container.setQueryMetadata(key, entry);
	}
};
oFF.OlapEnvironment.prototype.overwriteQueryMetadata = function(key, entry)
{
	if (oFF.notNull(key))
	{
		var container = this.getCubeContainerInternal(key);
		container.overwriteQueryMetadata(key, entry);
	}
};
oFF.OlapEnvironment.prototype.releaseQueryMetadata = function(key)
{
	if (oFF.notNull(key))
	{
		var container = this.getCubeContainerInternal(key);
		container.releaseQueryMetadata(key);
	}
};
oFF.OlapEnvironment.prototype.releaseQueryMetadataExt = function(systemName, typeName, schemaName, packageName, objectName)
{
	var datasource = oFF.QFactory.createDataSource();
	datasource.setSchemaName(schemaName);
	datasource.setPackageName(packageName);
	datasource.setObjectName(objectName);
	datasource.setType(oFF.MetaObjectType.lookup(typeName));
	var systemContainer = this.getSystemContainer(systemName);
	if (oFF.notNull(systemContainer))
	{
		var cacheKeyName = datasource.getCacheKeyName();
		var cubeContainer = systemContainer.getCubeContainer(cacheKeyName);
		if (oFF.notNull(cubeContainer))
		{
			cubeContainer.releaseAllQueryMetadata();
			oFF.XObjectExt.release(datasource);
		}
	}
};
oFF.OlapEnvironment.prototype.releaseAllQueryMetadata = function()
{
	var systemNamesIter = this.m_systems.getKeysAsIteratorOfString();
	while (systemNamesIter.hasNext())
	{
		var envSystem = this.getSystemContainer(systemNamesIter.next());
		envSystem.releaseAllQueryMetadata();
	}
};
oFF.OlapEnvironment.prototype.getQueryMetadata = function(key)
{
	var retValue = null;
	if (oFF.notNull(key))
	{
		var container = this.getCubeContainerInternal(key);
		retValue = container.getQueryMetadata(key);
	}
	return retValue;
};
oFF.OlapEnvironment.prototype.getSystemContainerBase = function(systemName)
{
	return this.getSystemContainer(systemName);
};
oFF.OlapEnvironment.prototype.getSystemContainer = function(systemName)
{
	var theSystemName = systemName;
	if (oFF.isNull(theSystemName))
	{
		theSystemName = "@defaultSys";
	}
	var systemContainer = this.m_systems.getByKey(theSystemName);
	if (oFF.isNull(systemContainer))
	{
		systemContainer = oFF.OlapEnvSystem.create(this, theSystemName);
		this.m_systems.put(theSystemName, systemContainer);
	}
	return systemContainer;
};
oFF.OlapEnvironment.prototype.getCubeContainerInternal = function(key)
{
	var envSystem = this.getSystemContainer(key.getSystemName());
	return envSystem.getCubeContainerInternal(key);
};
oFF.OlapEnvironment.prototype.getCubeContainer = function(key)
{
	return this.getCubeContainerInternal(key);
};
oFF.OlapEnvironment.prototype.isCachingEnabled = function()
{
	var session = this.getSession();
	var isCachingEnabled = false;
	if (oFF.notNull(session))
	{
		isCachingEnabled = session.hasFeature(oFF.FeatureToggleOlap.METADATA_CACHING);
	}
	return isCachingEnabled;
};
oFF.OlapEnvironment.prototype.setCachingEnabled = function(isCachingEnabled)
{
	if (isCachingEnabled)
	{
		this.getSession().activateFeatureToggle(oFF.FeatureToggleOlap.METADATA_CACHING);
	}
	else
	{
		this.getSession().deactivateFeatureToggle(oFF.FeatureToggleOlap.METADATA_CACHING);
	}
};
oFF.OlapEnvironment.prototype.getFilterManager = function()
{
	if (oFF.isNull(this.m_filterManager))
	{
		this.m_filterManager = oFF.OlapFilterManager.create(this);
	}
	return this.m_filterManager;
};
oFF.OlapEnvironment.prototype.getGeoManager = function()
{
	if (oFF.isNull(this.m_geoManager))
	{
		this.m_geoManager = oFF.QGeoManager.create(this);
	}
	return this.m_geoManager;
};
oFF.OlapEnvironment.prototype.getClientQueryObjectManager = function()
{
	if (oFF.isNull(this.m_clientQueryObjectManager))
	{
		this.m_clientQueryObjectManager = oFF.OlapClientQueryObjectManager.create(this);
	}
	return this.m_clientQueryObjectManager;
};
oFF.OlapEnvironment.prototype.getFilterAcrossModelsLovCacheManager = function()
{
	if (oFF.isNull(this.m_filterAcrossModelsLovCacheManager))
	{
		this.m_filterAcrossModelsLovCacheManager = oFF.QFilterAcrossModelsLovCacheManager.create();
	}
	return this.m_filterAcrossModelsLovCacheManager;
};
oFF.OlapEnvironment.prototype.getPrequery = function(preQueryName)
{
	return this.m_prequeries.getByKey(preQueryName);
};
oFF.OlapEnvironment.prototype.addPrequery = function(preQueryName, queryModel)
{
	this.m_prequeries.put(preQueryName, queryModel);
};
oFF.OlapEnvironment.prototype.removePrequery = function(preQueryName)
{
	return this.m_prequeries.remove(preQueryName);
};
oFF.OlapEnvironment.prototype.toString = function()
{
	return oFF.isNull(this.m_application) ? "" : this.m_application.toString();
};
oFF.OlapEnvironment.prototype.getStateManager = function()
{
	return this.m_stateManager;
};
oFF.OlapEnvironment.prototype.processQueryManagerCreationWithDataSourceName = function(syncType, listener, customIdentifier, systemName, dataSourceName)
{
	return this.m_queryManagerHandler.processQueryManagerCreationWithDataSourceName(syncType, listener, customIdentifier, systemName, dataSourceName);
};
oFF.OlapEnvironment.prototype.createQueryManagerWithMicroCube = function(microCube, systemName)
{
	return this.m_queryManagerHandler.createQueryManagerWithMicroCube(microCube, systemName);
};
oFF.OlapEnvironment.prototype.processQueryManagerCreationWithBlendingDefinition = function(syncType, listener, customIdentifier, blendingDefinition)
{
	return this.m_queryManagerHandler.processQueryManagerCreationWithBlendingDefinition(syncType, listener, customIdentifier, blendingDefinition);
};
oFF.OlapEnvironment.prototype.getQueryManagerByDataSource = function(systemName, datasourceName)
{
	var size = this.m_queryManagers.size();
	for (var i = 0; i < size; i++)
	{
		var queryManager = this.m_queryManagers.get(i);
		if (oFF.XString.isEqual(queryManager.getSystemName(), systemName) && queryManager.getDataSource() !== null && oFF.XString.isEqual(queryManager.getDataSource().getFullQualifiedName(), datasourceName))
		{
			return queryManager;
		}
	}
	return null;
};
oFF.OlapEnvironment.prototype.setAllowedFormulaOperatorList = function(allowedFormulaOperators)
{
	this.m_allowedFormulaOperators = allowedFormulaOperators;
};
oFF.OlapEnvironment.prototype.getAllowedFormulaOperatorList = function()
{
	return this.m_allowedFormulaOperators;
};
oFF.OlapEnvironment.prototype.setModelByJsonObject = function(modelName, type, modelContent)
{
	var modelObject = oFF.XContent.createJsonObjectContent(type, modelContent);
	this.setModelByContent(modelName, modelObject);
};
oFF.OlapEnvironment.prototype.setModelByContent = function(modelName, model)
{
	this.m_modelCache.put(modelName, model);
};
oFF.OlapEnvironment.prototype.getModelContent = function(modelName)
{
	return this.m_modelCache.getByKey(modelName);
};
oFF.OlapEnvironment.prototype.getDocumentStateManager = function()
{
	return this.m_stateManager;
};
oFF.OlapEnvironment.prototype.clearTransientQueryManager = function()
{
	this.m_transientQueryManager.clear();
};
oFF.OlapEnvironment.prototype.getTransientQueryManager = function(preQueryName)
{
	return this.m_transientQueryManager.getByKey(preQueryName);
};
oFF.OlapEnvironment.prototype.putTransientQueryManager = function(preQueryName, transientQueryManager)
{
	this.m_transientQueryManager.put(preQueryName, transientQueryManager);
};
oFF.OlapEnvironment.prototype.getModelLinkManager = function()
{
	if (oFF.isNull(this.m_modelLinkManager))
	{
		this.m_modelLinkManager = oFF.QModelDimensionLinksManager.create(this);
	}
	return this.m_modelLinkManager;
};
oFF.OlapEnvironment.prototype.getSystemName = function()
{
	return null;
};

oFF.QueryManagerProcessingSequence = function() {};
oFF.QueryManagerProcessingSequence.prototype = new oFF.SyncActionSequence();
oFF.QueryManagerProcessingSequence.prototype._ff_c = "QueryManagerProcessingSequence";

oFF.QueryManagerProcessingSequence.createSequence = function(queryManager, resultSetContainer, varSubmitRequired, enforceCustomHierarchyRequests)
{
	var executor = new oFF.QueryManagerProcessingSequence();
	executor.setupAction(null, null, null, queryManager);
	executor.m_resultSetContainer = resultSetContainer;
	executor.m_varSubmitRequired = varSubmitRequired;
	executor.m_enforceCustomHierarchyRequests = enforceCustomHierarchyRequests;
	return executor;
};
oFF.QueryManagerProcessingSequence.supportsCustomHierarchies = function(queryModel)
{
	return oFF.notNull(queryModel) && queryModel.getSystemType().isTypeOf(oFF.SystemType.ABAP) && queryModel.getModelCapabilities().supportsCustomHierarchy();
};
oFF.QueryManagerProcessingSequence.prototype.m_resultSetContainer = null;
oFF.QueryManagerProcessingSequence.prototype.m_varSubmitRequired = false;
oFF.QueryManagerProcessingSequence.prototype.m_enforceCustomHierarchyRequests = false;
oFF.QueryManagerProcessingSequence.prototype.releaseObject = function()
{
	oFF.SyncActionSequence.prototype.releaseObject.call( this );
	this.m_resultSetContainer = null;
};
oFF.QueryManagerProcessingSequence.prototype.processSynchronization = function(syncType)
{
	var queryManager = this.getActionContext();
	var queryModel = queryManager.getQueryModel();
	var resultAction = this.m_resultSetContainer.processExecution(oFF.SyncType.DELAYED, null, null);
	if (oFF.QueryManagerProcessingSequence.supportsCustomHierarchies(queryModel))
	{
		var customHierarchyRepo = queryModel.getOlapEnv().getCustomHierarchyRepository();
		this.processCustomHierarchySubmits(customHierarchyRepo.getCustomHierarchiesUsedInQueryModel(queryModel), this.m_enforceCustomHierarchyRequests);
	}
	if (this.m_varSubmitRequired)
	{
		var submitAction = queryManager.submitVariables(oFF.SyncType.DELAYED, null, null);
		if (oFF.notNull(submitAction))
		{
			this.addAction(submitAction);
		}
	}
	this.setMainAction(resultAction);
	return oFF.SyncActionSequence.prototype.processSynchronization.call( this , syncType);
};
oFF.QueryManagerProcessingSequence.prototype.processCustomHierarchySubmits = function(hierarchyDefinitions, enforceCustomHierarchyRequests)
{
	if (oFF.notNull(hierarchyDefinitions))
	{
		for (var i = 0; i < hierarchyDefinitions.size(); i++)
		{
			var customHierarchyDefinition = hierarchyDefinitions.get(i);
			var customHierarchyProvider = this.getActionContext().createCustomHierarchyProvider(customHierarchyDefinition, enforceCustomHierarchyRequests);
			this.addAction(customHierarchyProvider.processExecution(oFF.SyncType.DELAYED, null, null));
		}
	}
};

oFF.ValueHelpProcessingSequence = function() {};
oFF.ValueHelpProcessingSequence.prototype = new oFF.SyncActionSequence();
oFF.ValueHelpProcessingSequence.prototype._ff_c = "ValueHelpProcessingSequence";

oFF.ValueHelpProcessingSequence.createSequence = function(queryManager, dimension, resultSetContainer, exportValueHelp, requiresCustomHierarchySubmit, requiresVariableSubmit)
{
	var executor = new oFF.ValueHelpProcessingSequence();
	executor.setupAction(null, null, null, queryManager);
	executor.m_resultSetContainer = resultSetContainer;
	executor.m_dimension = dimension;
	executor.m_exportValueHelp = exportValueHelp;
	executor.m_requiresCustomHierarchySubmit = requiresCustomHierarchySubmit;
	executor.m_requiresVariableSubmit = requiresVariableSubmit;
	return executor;
};
oFF.ValueHelpProcessingSequence.customHierarchySubmitRequiredForValueHelp = function(dimension)
{
	if (oFF.ValueHelpProcessingSequence.supportsCustomHierarchies(dimension.getQueryModel()))
	{
		return dimension.getCustomHierarchyDefinition() !== null && dimension.isHierarchyActive() && dimension.isSelectorHierarchyActive();
	}
	return false;
};
oFF.ValueHelpProcessingSequence.supportsCustomHierarchies = function(queryModel)
{
	return oFF.notNull(queryModel) && queryModel.getSystemType().isTypeOf(oFF.SystemType.ABAP) && queryModel.getModelCapabilities().supportsCustomHierarchy();
};
oFF.ValueHelpProcessingSequence.prototype.m_customHierarchySubmitAction = null;
oFF.ValueHelpProcessingSequence.prototype.m_resultSetContainer = null;
oFF.ValueHelpProcessingSequence.prototype.m_dimension = null;
oFF.ValueHelpProcessingSequence.prototype.m_exportValueHelp = null;
oFF.ValueHelpProcessingSequence.prototype.m_requiresCustomHierarchySubmit = false;
oFF.ValueHelpProcessingSequence.prototype.m_requiresVariableSubmit = false;
oFF.ValueHelpProcessingSequence.prototype.releaseObject = function()
{
	oFF.SyncActionSequence.prototype.releaseObject.call( this );
	this.m_customHierarchySubmitAction = null;
	this.m_exportValueHelp = null;
	this.m_resultSetContainer = null;
	this.m_dimension = null;
};
oFF.ValueHelpProcessingSequence.prototype.processSynchronization = function(syncType)
{
	var queryManager = this.getActionContext();
	if (this.m_requiresCustomHierarchySubmit && oFF.ValueHelpProcessingSequence.supportsCustomHierarchies(queryManager.getQueryModel()))
	{
		var customHierarchyProvider = queryManager.createCustomHierarchyProvider(this.m_dimension.getCustomHierarchyDefinition(), false);
		this.m_customHierarchySubmitAction = customHierarchyProvider.processExecution(oFF.SyncType.DELAYED, null, null);
		this.addAction(this.m_customHierarchySubmitAction);
	}
	if (this.m_requiresVariableSubmit)
	{
		var submitAction = queryManager.submitVariables(oFF.SyncType.DELAYED, null, null);
		if (oFF.notNull(submitAction))
		{
			this.addAction(submitAction);
		}
	}
	var resultAction = this.m_resultSetContainer.processExecution(oFF.SyncType.DELAYED, null, null);
	this.setMainAction(resultAction);
	return oFF.SyncActionSequence.prototype.processSynchronization.call( this , syncType);
};
oFF.ValueHelpProcessingSequence.prototype.onActionExecuted = function(syncAction)
{
	if (oFF.notNull(this.m_exportValueHelp) && syncAction === this.m_customHierarchySubmitAction)
	{
		var createdHierarchy = this.m_customHierarchySubmitAction.getData();
		if (oFF.notNull(createdHierarchy))
		{
			var dimension = createdHierarchy.getDimension();
			var inaDimension = oFF.notNull(dimension) ? this.getDimensionStructureFromMainRequest(dimension) : null;
			if (oFF.notNull(inaDimension))
			{
				this.m_exportValueHelp.exportHierarchy(dimension, inaDimension);
			}
		}
	}
};
oFF.ValueHelpProcessingSequence.prototype.getDimensionStructureFromMainRequest = function(dimension)
{
	var request = this.getMainAction().getRequest();
	var analytics = oFF.PrUtils.getStructureProperty(request, "Analytics");
	var definition = oFF.PrUtils.getStructureProperty(analytics, "Definition");
	var dimensions = oFF.PrUtils.getListProperty(definition, "Dimensions");
	for (var i = 0; i < oFF.PrUtils.getListSize(dimensions, 0); i++)
	{
		var inaDimension = dimensions.getStructureAt(0);
		if (oFF.XString.isEqual(inaDimension.getStringByKey("Name"), dimension.getName()))
		{
			return inaDimension;
		}
	}
	return null;
};

oFF.QOlapSyncAction = function() {};
oFF.QOlapSyncAction.prototype = new oFF.DfRsSyncAction();
oFF.QOlapSyncAction.prototype._ff_c = "QOlapSyncAction";

oFF.QOlapSyncAction.prototype.getQueryManagerBase = function()
{
	if (this.getContext() === null)
	{
		return null;
	}
	return this.getContext().getQueryManager();
};
oFF.QOlapSyncAction.prototype.getQueryModelBase = function()
{
	return this.getContext().getQueryModel();
};

oFF.BlendingProcess = function() {};
oFF.BlendingProcess.prototype = new oFF.DfRsSyncAction();
oFF.BlendingProcess.prototype._ff_c = "BlendingProcess";

oFF.BlendingProcess.PRIMARY_MEASURE_FILTER = "primaryMeasureFilter";
oFF.BlendingProcess.SECONDARY_MEASURE_FILTER = "secondaryMeasureFilter";
oFF.BlendingProcess.DUMMY_CALCULATION = "DummyCalculation";
oFF.BlendingProcess.create = function(blendableQueryManager, configs, runtimeBlendedQueryManager, lastModCounterState, isExportWorkflow)
{
	var blendingProcess = new oFF.BlendingProcess();
	blendingProcess.setupAction(null, null, null, blendableQueryManager.getQueryManager());
	blendingProcess.m_blendableQueryManager = blendableQueryManager;
	blendingProcess.m_configs = oFF.XList.create();
	blendingProcess.m_configs.addAll(configs);
	blendingProcess.m_primaryBlendedMeasures = oFF.XList.create();
	blendingProcess.m_outOfContextLinkDimensionNames = oFF.XListOfString.create();
	blendingProcess.m_blendedDimensionInfoAxisMap = oFF.XHashMapByString.create();
	var copyRowBlendedDimensionInfos = oFF.XList.create();
	oFF.XCollectionUtils.addAllClones(copyRowBlendedDimensionInfos, blendableQueryManager.getBlendedDimensionsByAxis(oFF.AxisType.ROWS));
	blendingProcess.m_blendedDimensionInfoAxisMap.put(oFF.AxisType.ROWS.getName(), copyRowBlendedDimensionInfos);
	var copyColumnBlendedDimensionInfos = oFF.XList.create();
	oFF.XCollectionUtils.addAllClones(copyColumnBlendedDimensionInfos, blendableQueryManager.getBlendedDimensionsByAxis(oFF.AxisType.COLUMNS));
	blendingProcess.m_blendedDimensionInfoAxisMap.put(oFF.AxisType.COLUMNS.getName(), copyColumnBlendedDimensionInfos);
	blendingProcess.m_blendedDrillOperations = oFF.XList.create();
	oFF.XCollectionUtils.addAllClones(blendingProcess.m_blendedDrillOperations, blendableQueryManager.getBlendedDrillOperations());
	blendingProcess.m_leafAccountDrillOperations = oFF.XList.create();
	blendingProcess.m_transientMembers = oFF.XHashMapByString.create();
	blendingProcess.m_transientPrimaryBlendedMeasures = oFF.XList.create();
	blendingProcess.m_originalProcess = blendingProcess;
	blendingProcess.m_originalDimensionResultSetFields = oFF.XHashMapByString.create();
	blendingProcess.m_lastModCounterState = oFF.XHashMapByString.create();
	blendingProcess.m_isExportWorkflow = isExportWorkflow;
	blendingProcess.m_automappingTimeLinkDimensionNames = oFF.XListOfString.create();
	blendingProcess = blendingProcess.validateCachedRuntimeBlendedQueryManager(blendableQueryManager, runtimeBlendedQueryManager, lastModCounterState);
	blendingProcess.preprocessBlendedCalculations(blendableQueryManager.getPrimaryBlendedMeasures(), false);
	blendingProcess.preprocessThresholds();
	return blendingProcess;
};
oFF.BlendingProcess.moveOOCLinkedDimensionsToFreeAxis = function(blendedQueryModel, outOfContextLinkDimensionNames)
{
	var outOfContextLinkDimensionNamesIter = outOfContextLinkDimensionNames.getIterator();
	while (outOfContextLinkDimensionNamesIter.hasNext())
	{
		var outOfContextLinkDimension = blendedQueryModel.getDimensionByName(outOfContextLinkDimensionNamesIter.next());
		blendedQueryModel.getFreeAxis().add(outOfContextLinkDimension);
	}
};
oFF.BlendingProcess.prototype.m_blendableQueryManager = null;
oFF.BlendingProcess.prototype.m_configs = null;
oFF.BlendingProcess.prototype.m_originalProcess = null;
oFF.BlendingProcess.prototype.m_childProcess = null;
oFF.BlendingProcess.prototype.m_blendedQueryManager = null;
oFF.BlendingProcess.prototype.m_cachedRuntimeBlendedQueryManagerResult = null;
oFF.BlendingProcess.prototype.m_primaryBlendedMeasures = null;
oFF.BlendingProcess.prototype.m_blendedDimensionInfoAxisMap = null;
oFF.BlendingProcess.prototype.m_blendedDrillOperations = null;
oFF.BlendingProcess.prototype.m_leafAccountDrillOperations = null;
oFF.BlendingProcess.prototype.m_queryManagerCreationSyncAction = null;
oFF.BlendingProcess.prototype.m_originalDimensionResultSetFields = null;
oFF.BlendingProcess.prototype.m_transientMembers = null;
oFF.BlendingProcess.prototype.m_transientPrimaryBlendedMeasures = null;
oFF.BlendingProcess.prototype.m_outOfContextLinkDimensionNames = null;
oFF.BlendingProcess.prototype.m_enableInaCacheHint = false;
oFF.BlendingProcess.prototype.m_lastModCounterState = null;
oFF.BlendingProcess.prototype.m_isExportWorkflow = false;
oFF.BlendingProcess.prototype.m_automappingTimeLinkDimensionNames = null;
oFF.BlendingProcess.prototype.validateCachedRuntimeBlendedQueryManager = function(blendableQueryManager, runtimeBlendedQueryManager, previousMeasureFilterModCounters)
{
	if (!oFF.BlendingUtils.containsFilterAcrossModels(blendableQueryManager))
	{
		this.m_cachedRuntimeBlendedQueryManagerResult = runtimeBlendedQueryManager;
	}
	var iterator = blendableQueryManager.getAllQueryManagers().getIterator();
	while (iterator.hasNext())
	{
		var queryModel = iterator.next().getQueryModel();
		var previousModCounter = oFF.notNull(previousMeasureFilterModCounters) && !previousMeasureFilterModCounters.isReleased() ? previousMeasureFilterModCounters.getByKey(queryModel.getDatasetId()) : null;
		var modCounters = oFF.XHashMapByString.create();
		var primaryCalculation = queryModel.getPrimaryCalculationDimension();
		var secondaryCalculation = queryModel.getSecondaryCalculationDimension();
		if (oFF.notNull(primaryCalculation) && primaryCalculation.getFilter() !== null)
		{
			var primaryModCounter = oFF.XIntegerValue.create(primaryCalculation.getFilter().getModCounter());
			if (oFF.isNull(previousModCounter) || previousModCounter.getByKey(oFF.BlendingProcess.PRIMARY_MEASURE_FILTER) !== null && !primaryModCounter.isEqualTo(previousModCounter.getByKey(oFF.BlendingProcess.PRIMARY_MEASURE_FILTER)))
			{
				this.m_cachedRuntimeBlendedQueryManagerResult = null;
			}
			modCounters.put(oFF.BlendingProcess.PRIMARY_MEASURE_FILTER, primaryModCounter);
		}
		if (oFF.notNull(secondaryCalculation) && secondaryCalculation.getFilter() !== null)
		{
			var secondaryModCounter = oFF.XIntegerValue.create(secondaryCalculation.getFilter().getModCounter());
			if (oFF.isNull(previousModCounter) || previousModCounter.getByKey(oFF.BlendingProcess.SECONDARY_MEASURE_FILTER) !== null && !secondaryModCounter.isEqualTo(previousModCounter.getByKey(oFF.BlendingProcess.SECONDARY_MEASURE_FILTER)))
			{
				this.m_cachedRuntimeBlendedQueryManagerResult = null;
			}
			modCounters.put(oFF.BlendingProcess.SECONDARY_MEASURE_FILTER, secondaryModCounter);
		}
		this.m_lastModCounterState.put(queryModel.getDatasetId(), modCounters);
	}
	return this;
};
oFF.BlendingProcess.prototype.getLastModCounterState = function()
{
	return this.m_lastModCounterState;
};
oFF.BlendingProcess.prototype.createSubProcess = function(configs, blendedQueryManager)
{
	var blendingProcess = new oFF.BlendingProcess();
	blendingProcess.m_blendableQueryManager = this.m_blendableQueryManager;
	blendingProcess.m_configs = oFF.XList.create();
	blendingProcess.m_configs.addAll(configs);
	blendingProcess.m_configs.get(0).setFirstQueryManager(blendedQueryManager);
	blendingProcess.m_originalProcess = this.m_originalProcess;
	blendingProcess.m_originalDimensionResultSetFields = oFF.XHashMapByString.create();
	blendingProcess.m_primaryBlendedMeasures = this.m_primaryBlendedMeasures.createListCopy();
	blendingProcess.m_blendedDimensionInfoAxisMap = this.m_blendedDimensionInfoAxisMap.createMapByStringCopy();
	blendingProcess.m_blendedDrillOperations = this.m_blendedDrillOperations.createListCopy();
	blendingProcess.m_leafAccountDrillOperations = this.m_leafAccountDrillOperations.createListCopy();
	blendingProcess.m_transientMembers = this.m_transientMembers;
	blendingProcess.m_transientPrimaryBlendedMeasures = this.m_transientPrimaryBlendedMeasures.createListCopy();
	blendingProcess.m_outOfContextLinkDimensionNames = this.m_outOfContextLinkDimensionNames.createListOfStringCopy();
	blendingProcess.m_cachedRuntimeBlendedQueryManagerResult = this.m_cachedRuntimeBlendedQueryManagerResult;
	blendingProcess.m_isExportWorkflow = this.m_isExportWorkflow;
	blendingProcess.m_lastModCounterState = this.m_lastModCounterState.createMapByStringCopy();
	blendingProcess.m_automappingTimeLinkDimensionNames = this.m_automappingTimeLinkDimensionNames.createListOfStringCopy();
	blendingProcess.setupAction(null, null, null, this.getActionContext());
	return blendingProcess;
};
oFF.BlendingProcess.prototype.releaseObject = function()
{
	this.m_childProcess = oFF.XObjectExt.release(this.m_childProcess);
	var queryManagerCreationSyncActionCompleted = oFF.notNull(this.m_queryManagerCreationSyncAction) && this.m_queryManagerCreationSyncAction.getData() !== null;
	if (queryManagerCreationSyncActionCompleted)
	{
		oFF.XObjectExt.release(this.m_queryManagerCreationSyncAction.getData());
		this.m_queryManagerCreationSyncAction = oFF.XObjectExt.release(this.m_queryManagerCreationSyncAction);
	}
	this.m_blendedQueryManager = oFF.XObjectExt.release(this.m_blendedQueryManager);
	this.m_configs = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_configs);
	this.m_originalProcess = null;
	this.m_originalDimensionResultSetFields = oFF.XObjectExt.release(this.m_originalDimensionResultSetFields);
	this.m_primaryBlendedMeasures = oFF.XObjectExt.release(this.m_primaryBlendedMeasures);
	this.m_blendedDimensionInfoAxisMap = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_blendedDimensionInfoAxisMap);
	this.m_blendedDrillOperations = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_blendedDrillOperations);
	this.m_leafAccountDrillOperations = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_leafAccountDrillOperations);
	this.m_cachedRuntimeBlendedQueryManagerResult = null;
	this.m_lastModCounterState = oFF.XObjectExt.release(this.m_lastModCounterState);
	this.m_outOfContextLinkDimensionNames = oFF.XObjectExt.release(this.m_outOfContextLinkDimensionNames);
	if (queryManagerCreationSyncActionCompleted)
	{
		oFF.DfRsSyncAction.prototype.releaseObject.call( this );
	}
};
oFF.BlendingProcess.prototype.processBlendedQueryManagerCreation = function(syncType, listener, customIdentifier)
{
	this.setActiveSyncType(syncType);
	return this.processSyncAction(syncType, listener, customIdentifier);
};
oFF.BlendingProcess.prototype.getUsedQueryManagers = function()
{
	var usedQueryManagers = oFF.XHashMapByString.create();
	var configIterator = this.m_configs.getIterator();
	while (configIterator.hasNext())
	{
		var config = configIterator.next();
		var primaryQueryManager = config.getPrimaryQueryManager();
		var secondaryQueryManager = config.getSecondaryQueryManager();
		if (usedQueryManagers.isEmpty())
		{
			usedQueryManagers.put(primaryQueryManager.getQueryModel().getDatasetId(), primaryQueryManager);
		}
		usedQueryManagers.put(secondaryQueryManager.getQueryModel().getDatasetId(), secondaryQueryManager);
	}
	return usedQueryManagers;
};
oFF.BlendingProcess.prototype.preprocessThresholds = function()
{
	var formulaExceptionsIter = this.m_blendableQueryManager.getFormulaExceptions().getIterator();
	while (formulaExceptionsIter.hasNext())
	{
		var formulaException = formulaExceptionsIter.next();
		var datasetId = formulaException.getQueryModel().getDatasetId();
		var blendQueryModelContext = this.m_blendableQueryManager.getQueryManagerByDatasetId(datasetId);
		var blendDimensionContext = formulaException.isPrimaryMeasure() ? blendQueryModelContext.getQueryModel().getPrimaryCalculationDimension() : blendQueryModelContext.getQueryModel().getSecondaryCalculationDimension();
		var thresholdMeasures = oFF.XList.create();
		if (formulaException.getMeasure() !== null)
		{
			thresholdMeasures.add(formulaException.getMeasure());
		}
		if (formulaException.getBaseMeasure() !== null)
		{
			thresholdMeasures.add(formulaException.getBaseMeasure());
		}
		else if (formulaException.getBaseMeasureName() !== null)
		{
			var baseStructureMember = blendDimensionContext.getStructureMemberByAliasOrMember(formulaException.getBaseMeasureName());
			if (oFF.isNull(baseStructureMember))
			{
				baseStructureMember = this.getOlapEnv().getClientQueryObjectManager().getStructuredMember(formulaException.getBaseMeasureName(), this.m_blendableQueryManager.getClientQueryObjectStorageName(), true);
			}
			if (oFF.notNull(baseStructureMember))
			{
				thresholdMeasures.add(baseStructureMember);
			}
		}
		if (formulaException.getReferenceMeasure() !== null)
		{
			thresholdMeasures.add(formulaException.getReferenceMeasure());
		}
		else if (formulaException.getReferenceMeasureName() !== null)
		{
			var refStructureMember = blendDimensionContext.getStructureMemberByAliasOrMember(formulaException.getReferenceMeasureName());
			if (oFF.isNull(refStructureMember))
			{
				refStructureMember = this.getOlapEnv().getClientQueryObjectManager().getStructuredMember(formulaException.getReferenceMeasureName(), this.m_blendableQueryManager.getClientQueryObjectStorageName(), true);
			}
			if (oFF.notNull(refStructureMember))
			{
				thresholdMeasures.add(refStructureMember);
			}
		}
		oFF.XCollectionUtils.forEach(thresholdMeasures,  function(thresholdMeasure){
			var isMeasureInUse = true;
			if (!thresholdMeasure.isMultiDataSourceMember(blendQueryModelContext))
			{
				isMeasureInUse = thresholdMeasure.isMeasureInUse(blendDimensionContext, false);
			}
			if (!isMeasureInUse)
			{
				var transientMemberList = this.m_transientMembers.getByKey(datasetId);
				if (oFF.notNull(transientMemberList) && transientMemberList.containsKey(thresholdMeasure.getName()))
				{
					return;
				}
				this.m_cachedRuntimeBlendedQueryManagerResult = null;
				if (oFF.isNull(transientMemberList))
				{
					transientMemberList = oFF.XListOfNameObject.create();
					this.m_transientMembers.put(datasetId, transientMemberList);
				}
				transientMemberList.add(thresholdMeasure);
			}
		}.bind(this));
	}
};
oFF.BlendingProcess.prototype.preprocessBlendedCalculations = function(blendedMeasures, isTransientMeasures)
{
	var blendedMeasuresIter = blendedMeasures.getIterator();
	var usedQueryManagers = this.getUsedQueryManagers();
	var transientBlendedMeasures = oFF.XList.create();
	while (blendedMeasuresIter.hasNext())
	{
		var blendedMeasure = blendedMeasuresIter.next();
		if (blendedMeasure.getMemberType() === oFF.MemberType.FORMULA)
		{
			var formulaItemMembers = oFF.FormulaItemUtils.getFormulaMembers(blendedMeasure.getFormula());
			var formulaItemMembersIter = formulaItemMembers.getIterator();
			var validFormula = true;
			var transientMembers = oFF.XHashMapByString.create();
			while (formulaItemMembersIter.hasNext())
			{
				var formulaItemMember = formulaItemMembersIter.next();
				if (!usedQueryManagers.containsKey(formulaItemMember.getQueryModel().getDatasetId()))
				{
					validFormula = false;
					break;
				}
				if (oFF.XCollectionUtils.contains(this.m_blendableQueryManager.getPrimaryBlendedMeasures(),  function(primaryBlendedMeasure){
					return oFF.XString.isEqual(primaryBlendedMeasure.getName(), formulaItemMember.getMemberName());
				}.bind(this)))
				{
					continue;
				}
				else
				{
					var sharedObjectDependentPrimaryBlendedMeasure = this.getOlapEnv().getClientQueryObjectManager().getStructuredMember(formulaItemMember.getMemberName(), this.m_blendableQueryManager.getClientQueryObjectStorageName(), true);
					if (oFF.notNull(sharedObjectDependentPrimaryBlendedMeasure) && sharedObjectDependentPrimaryBlendedMeasure.isMultiDataSourceMember(this.m_blendableQueryManager.getContext()))
					{
						transientBlendedMeasures.add(sharedObjectDependentPrimaryBlendedMeasure);
						this.m_transientPrimaryBlendedMeasures.insert(0, sharedObjectDependentPrimaryBlendedMeasure);
						continue;
					}
				}
				var formulaDimensionContext = formulaItemMember.getDimensionContext();
				if (oFF.notNull(formulaDimensionContext))
				{
					var datasetId = formulaDimensionContext.getQueryModel().getDatasetId();
					var transientMemberList = transientMembers.getByKey(datasetId);
					if (oFF.isNull(transientMemberList))
					{
						transientMemberList = oFF.XListOfNameObject.create();
						transientMembers.put(datasetId, transientMemberList);
					}
					var blendQueryModelContext = this.m_blendableQueryManager.getQueryManagerByDatasetId(datasetId);
					var blendDimensionContext = blendQueryModelContext.getQueryModel().getDimensionByName(formulaDimensionContext.getName());
					var structureMember = null;
					if (oFF.notNull(blendDimensionContext))
					{
						structureMember = blendDimensionContext.getStructureMemberByAliasOrMember(formulaItemMember.getMemberName());
						if (oFF.isNull(structureMember))
						{
							structureMember = this.getOlapEnv().getClientQueryObjectManager().getStructuredMember(formulaItemMember.getMemberName(), this.m_blendableQueryManager.getClientQueryObjectStorageName(), true);
						}
						if ((blendDimensionContext.getFilter() === null || blendDimensionContext.getFilter().isEmpty()) && this.m_blendableQueryManager.isUseEmptyAllMemberMeasureFilter())
						{
							structureMember = null;
						}
						else if (blendDimensionContext.getFilter() !== null && !blendDimensionContext.getFilter().isEmpty() && structureMember.isMeasureInUse(blendDimensionContext, isTransientMeasures))
						{
							structureMember = null;
						}
					}
					if (oFF.notNull(structureMember) && !transientMemberList.containsKey(structureMember.getName()))
					{
						transientMemberList.add(structureMember);
					}
				}
				else
				{
					throw oFF.XException.createRuntimeException(oFF.XStringUtils.concatenate3("Blendable formula measure '", blendedMeasure.getAliasOrMemberName(), "' contains formula(s) that is missing dimension context"));
				}
			}
			if (validFormula)
			{
				var transientMembersList;
				var previousTransientMemberDatasetIds = this.m_transientMembers.getKeysAsIteratorOfString();
				while (previousTransientMemberDatasetIds.hasNext())
				{
					if (oFF.isNull(this.m_cachedRuntimeBlendedQueryManagerResult))
					{
						break;
					}
					var previousTransientMemberDatasetId = previousTransientMemberDatasetIds.next();
					if (!transientMembers.getKeysAsReadOnlyListOfString().contains(previousTransientMemberDatasetId))
					{
						this.m_cachedRuntimeBlendedQueryManagerResult = null;
					}
					else
					{
						transientMembersList = transientMembers.getByKey(previousTransientMemberDatasetId);
						var previousTransientMembers = this.m_transientMembers.getByKey(previousTransientMemberDatasetId);
						if (previousTransientMembers.size() !== transientMembersList.size())
						{
							this.m_cachedRuntimeBlendedQueryManagerResult = null;
						}
						else
						{
							for (var i = 0; i < previousTransientMembers.size(); i++)
							{
								var previousTransientMemberName = previousTransientMembers.get(i).getName();
								if (!transientMembersList.containsKey(previousTransientMemberName))
								{
									this.m_cachedRuntimeBlendedQueryManagerResult = null;
									break;
								}
							}
						}
					}
				}
				if (!isTransientMeasures)
				{
					this.m_primaryBlendedMeasures.add(blendedMeasure);
				}
				var transientMemberDatasetIds = transientMembers.getKeysAsIteratorOfString();
				while (transientMemberDatasetIds.hasNext())
				{
					var transientMemberDatasetId = transientMemberDatasetIds.next();
					transientMembersList = transientMembers.getByKey(transientMemberDatasetId);
					var existingTransientList = this.m_transientMembers.getByKey(transientMemberDatasetId);
					if (oFF.isNull(existingTransientList))
					{
						existingTransientList = oFF.XListOfNameObject.create();
						this.m_transientMembers.put(transientMemberDatasetId, existingTransientList);
					}
					for (var j = 0; j < transientMembersList.size(); j++)
					{
						var transientMemberName = transientMembersList.get(j).getName();
						if (!existingTransientList.containsKey(transientMemberName))
						{
							existingTransientList.add(transientMembersList.get(j));
						}
					}
				}
			}
		}
	}
	if (transientBlendedMeasures.size() > 0)
	{
		this.preprocessBlendedCalculations(transientBlendedMeasures, true);
	}
};
oFF.BlendingProcess.prototype.processSynchronization = function(syncType)
{
	var continueProcessing = true;
	var primaryQueryManager = this.getActionContext().getQueryManager();
	var primaryQueryModel = primaryQueryManager.getQueryModel();
	if (this.m_configs.size() > 0)
	{
		this.processBlendingQueryManagerCreation();
	}
	else if (oFF.BlendingUtils.isQueryModelInUseForBlending(primaryQueryModel, this.m_blendableQueryManager.isUseEmptyAllMemberMeasureFilter(), false))
	{
		this.setData(primaryQueryManager);
		continueProcessing = false;
	}
	else
	{
		this.addError(oFF.ErrorCodes.BLENDING_CONDITIONS_NOT_FULFILLED, oFF.ErrorMessages.BLENDING_CONDITIONS_NOT_FULFILLED);
		continueProcessing = false;
	}
	return continueProcessing;
};
oFF.BlendingProcess.prototype.addDummyCalculationMeasure = function(leafQueryManager)
{
	if (leafQueryManager.getInitSettings().getMode() !== oFF.QueryManagerMode.DEFAULT)
	{
		return;
	}
	var queryModel = leafQueryManager.getQueryModel();
	var primaryCalculationDimension = queryModel.getPrimaryCalculationDimension();
	var filterRootElement = queryModel.getFilter().getDynamicFilter().getFilterRootElement();
	var memberNames = oFF.XHashSetOfString.create();
	memberNames.addAll(oFF.QFilterUtil.getMemberNamesFromFilter(filterRootElement, primaryCalculationDimension.getName()));
	if (memberNames.isEmpty())
	{
		var linkedFilters = queryModel.getFilter().getLinkedFilters().getValuesAsReadOnlyList();
		for (var i = 0; i < linkedFilters.size(); i++)
		{
			var filterElement = linkedFilters.get(i).getFilterRootElement();
			memberNames.addAll(oFF.QFilterUtil.getMemberNamesFromFilter(filterElement, primaryCalculationDimension.getName()));
		}
	}
	if (memberNames.isEmpty())
	{
		var dummyMeasure = oFF.QFactory.createFormulaMeasure(queryModel, primaryCalculationDimension, oFF.BlendingProcess.DUMMY_CALCULATION, null, oFF.BlendingProcess.DUMMY_CALCULATION);
		dummyMeasure.setFormula(oFF.QFactory.createFormulaConstantWithIntValue(leafQueryManager, 1));
		var transientMemberList = this.m_transientMembers.getByKey(queryModel.getDatasetId());
		if (oFF.isNull(transientMemberList))
		{
			transientMemberList = oFF.XListOfNameObject.create();
			this.m_transientMembers.put(queryModel.getDatasetId(), transientMemberList);
		}
		transientMemberList.add(dummyMeasure);
		primaryCalculationDimension.addMeasure(dummyMeasure);
		var newMeasureFilter = queryModel.getConvenienceCommands().addSingleMemberFilterByDimension(primaryCalculationDimension, dummyMeasure.getAliasOrMemberName(), oFF.ComparisonOperator.EQUAL);
		newMeasureFilter.getTagging().put(oFF.QTransientConstants.TAG_IS_TRANSIENT, "");
	}
};
oFF.BlendingProcess.prototype.processBlendingQueryManagerCreation = function()
{
	var blendingProcessConfig = this.m_configs.get(0);
	var blendingDefinition = oFF.QFactory.createBlendingDefinition();
	var qmLink = blendingProcessConfig.getQueryModelLinkSettings();
	var primaryQueryManager = blendingProcessConfig.getPrimaryQueryManager();
	var secondaryQueryManager = blendingProcessConfig.getSecondaryQueryManager();
	var primaryQueryModel = primaryQueryManager.getQueryModel();
	var secondaryQueryModel = secondaryQueryManager.getQueryModel();
	primaryQueryModel.stopEventing();
	secondaryQueryModel.stopEventing();
	var primaryQueryAliasName = oFF.BlendingUtils.getQueryAliasName(primaryQueryManager);
	var primarySource = blendingDefinition.addNewSource(primaryQueryModel, primaryQueryAliasName);
	if (!this.m_isExportWorkflow)
	{
		primarySource.setDelayCubeRequest(true);
	}
	var secondaryQueryAliasName = oFF.BlendingUtils.getQueryAliasName(secondaryQueryManager);
	var secondarySource = blendingDefinition.addNewSource(secondaryQueryModel, secondaryQueryAliasName);
	oFF.BlendingMappingUtils.processCalculationDimensionMappings(blendingDefinition, primarySource, secondarySource, this.m_blendedDrillOperations);
	oFF.BlendingMappingUtils.processLinkedDimensions(this.m_configs, blendingDefinition, primarySource, secondarySource, this, this.m_blendedDrillOperations);
	var unlinkedDimensionsNames = oFF.XHashSetOfString.create();
	oFF.BlendingMappingUtils.processUnlinkedDimensions(primarySource, secondarySource, blendingDefinition, qmLink, unlinkedDimensionsNames, this.m_blendedDrillOperations);
	oFF.BlendingMappingUtils.processUnlinkedDimensions(secondarySource, primarySource, blendingDefinition, qmLink, unlinkedDimensionsNames, this.m_blendedDrillOperations);
	this.processLeafQueryModelDrills(primaryQueryManager, secondaryQueryManager);
	oFF.BlendingMappingUtils.processTransientCalculations(primaryQueryModel, this.m_transientMembers.getByKey(primaryQueryModel.getDatasetId()), this.m_blendableQueryManager.isUseEmptyAllMemberMeasureFilter());
	oFF.BlendingMappingUtils.processTransientCalculations(secondaryQueryModel, this.m_transientMembers.getByKey(secondaryQueryModel.getDatasetId()), this.m_blendableQueryManager.isUseEmptyAllMemberMeasureFilter());
	if (!this.m_blendableQueryManager.isUseEmptyAllMemberMeasureFilter())
	{
		this.addDummyCalculationMeasure(primaryQueryManager);
		this.addDummyCalculationMeasure(secondaryQueryManager);
	}
	primaryQueryModel.resumeEventing();
	secondaryQueryModel.resumeEventing();
	if (oFF.notNull(this.m_cachedRuntimeBlendedQueryManagerResult))
	{
		var matchingQueryManager = oFF.BlendingUtils.getBlendedQueryModelByBlendDefinition(this.m_cachedRuntimeBlendedQueryManagerResult, blendingDefinition);
		if (oFF.notNull(matchingQueryManager))
		{
			this.onQueryManagerCreated(oFF.ExtResult.create(matchingQueryManager, this), matchingQueryManager, null);
			return;
		}
	}
	this.m_enableInaCacheHint = true;
	var blendingHost = blendingDefinition.getBlendingHost();
	var blendingHostSystemName = blendingHost.getSystemName();
	var iterator = blendingDefinition.getSources().getIterator();
	while (iterator.hasNext())
	{
		var queryModel = iterator.next().getQueryModel();
		var systemName = queryModel.getQueryManager().getSystemName();
		if (queryModel.getQueryManager().isCacheHintEnabled())
		{
			if (!oFF.XString.isEqual(blendingHostSystemName, systemName))
			{
				queryModel.getQueryManager().setCacheHintEnabled(false);
				queryModel.getQueryManager().getTagging().put("cacheHintDisabled", "");
			}
		}
		else
		{
			this.m_enableInaCacheHint = false;
		}
	}
	var blendingConfig = oFF.QueryServiceConfig.createWithBlendingDefinition(this.getActionContext().getApplication(), blendingDefinition);
	this.m_queryManagerCreationSyncAction = blendingConfig.processQueryManagerCreation(this.getActiveSyncType(), this, null);
};
oFF.BlendingProcess.prototype.processLeafQueryModelDrills = function(primaryQueryManager, secondaryQueryManager)
{
	var queryModel = primaryQueryManager.getQueryModel();
	if (queryModel.getAccountDimension() !== null)
	{
		if (oFF.XCollectionUtils.contains(this.m_blendedDrillOperations,  function(blendedDrillOperation){
			return oFF.XString.isEqual(blendedDrillOperation.getDimensionName(), queryModel.getAccountDimension().getName());
		}.bind(this)))
		{
			return;
		}
		if (primaryQueryManager.getInitSettings().getMode() === oFF.QueryManagerMode.DEFAULT)
		{
			this.processLeafAccountDrillOperations(queryModel);
		}
		var secondaryQueryModel = secondaryQueryManager.getQueryModel();
		if (secondaryQueryModel.getAccountDimension() !== null && secondaryQueryManager.getInitSettings().getMode() === oFF.QueryManagerMode.DEFAULT)
		{
			this.processLeafAccountDrillOperations(secondaryQueryModel);
		}
	}
};
oFF.BlendingProcess.prototype.processLeafAccountDrillOperations = function(queryModel)
{
	var drillManager = queryModel.getDrillManager();
	var drillOperations = drillManager.getDrillOperationsByDimension(queryModel.getAccountDimension());
	for (var k = 0; k < drillOperations.size(); k++)
	{
		var blendedDimensionDrillInfo = oFF.BlendedDrillInfo.createBlendedDimensionDrillInfo(null, queryModel.getDatasetId(), queryModel.getAccountDimension().getName());
		var drillOperation = drillOperations.get(k);
		blendedDimensionDrillInfo.setDrillState(drillOperation.getDrillState());
		var drillPaths = drillOperation.getDrillPath();
		oFF.XCollectionUtils.forEach(drillPaths,  function(drillPath){
			blendedDimensionDrillInfo.addBlendedDrillPathElementInfo(queryModel.getDatasetId(), queryModel.getAccountDimension().getName(), drillPath.getSelectValue());
		}.bind(this));
		this.m_leafAccountDrillOperations.add(blendedDimensionDrillInfo);
	}
};
oFF.BlendingProcess.prototype.cleanupTransientState = function(queryManager)
{
	var queryModel = queryManager.getQueryModel();
	if (queryManager.getInitSettings().getMode() === oFF.QueryManagerMode.BLENDING)
	{
		var blendingSources = queryModel.getBlendingSources();
		for (var i = 0; i < blendingSources.size(); i++)
		{
			var blendingSource = blendingSources.get(i);
			var leafQueryModel = blendingSource.getQueryModel();
			this.cleanupTransientState(leafQueryModel.getQueryManager());
		}
	}
	else
	{
		queryManager.stopEventing();
		var dimensionsInDrill = oFF.XList.create();
		dimensionsInDrill.addAll(queryModel.getColumnsAxis());
		dimensionsInDrill.addAll(queryModel.getRowsAxis());
		var dimensionsInDrillIter = dimensionsInDrill.getIterator();
		while (dimensionsInDrillIter.hasNext())
		{
			var dimensionInDrill = dimensionsInDrillIter.next();
			var cacheKey = oFF.QCacheKey.createByContextForDimension(queryModel, dimensionInDrill.getName(), null);
			var originalDimensionResultSetFields = this.m_originalDimensionResultSetFields.getByKey(cacheKey.getKey1());
			if (oFF.notNull(originalDimensionResultSetFields))
			{
				dimensionInDrill.getResultSetFields().clear();
				var originalDimensionResultSetFieldsIter = originalDimensionResultSetFields.getIterator();
				while (originalDimensionResultSetFieldsIter.hasNext())
				{
					var originalResultSetField = originalDimensionResultSetFieldsIter.next();
					dimensionInDrill.getResultSetFields().add(dimensionInDrill.getFieldByName(originalResultSetField));
				}
				var iterator = dimensionInDrill.getFields().getIterator();
				while (iterator.hasNext())
				{
					var oRequestedField = iterator.next();
					if (oRequestedField.isHierarchyPathField() && !oRequestedField.isAlwaysRequested() && oRequestedField.getTagging().containsKey("transientAlwaysRequested"))
					{
						oRequestedField.setAlwaysRequested(true);
						oRequestedField.getTagging().remove("transientAlwaysRequested");
					}
				}
			}
			var dimensionInDrillTagging = dimensionInDrill.getTagging();
			if (dimensionInDrillTagging.containsKey("transientRowAxis"))
			{
				queryModel.getFreeAxis().add(dimensionInDrill);
				dimensionInDrillTagging.remove("transientRowAxis");
			}
			if (dimensionInDrillTagging.containsKey("originalHierarchy"))
			{
				var originalHiearchy = dimensionInDrillTagging.getByKey("originalHierarchy");
				if (oFF.notNull(originalHiearchy))
				{
					dimensionInDrill.activateHierarchy(originalHiearchy, null, null);
				}
				else
				{
					dimensionInDrill.setHierarchyActive(false);
					dimensionInDrill.setHierarchy(null);
				}
				dimensionInDrillTagging.remove("originalHierarchy");
			}
			if (dimensionInDrillTagging.containsKey("transientInitialDrillLevel"))
			{
				var preInitialDrillLevel = dimensionInDrillTagging.getByKey("transientInitialDrillLevel");
				if (oFF.notNull(preInitialDrillLevel))
				{
					dimensionInDrill.setInitialDrillLevel(oFF.XInteger.convertFromString(preInitialDrillLevel));
				}
				dimensionInDrillTagging.remove("transientInitialDrillLevel");
			}
		}
		var transientMembers = this.m_transientMembers.getByKey(queryModel.getDatasetId());
		if (oFF.notNull(transientMembers))
		{
			var transientMembersIter = transientMembers.getIterator();
			while (transientMembersIter.hasNext())
			{
				var transientMember = transientMembersIter.next();
				if (transientMember.getTagging().containsKey(oFF.QTransientConstants.TAG_IS_TRANSIENT) || oFF.XString.isEqual(transientMember.getAliasOrMemberName(), "DummyCalculation"))
				{
					transientMember.getTagging().remove(oFF.QTransientConstants.TAG_IS_TRANSIENT);
					transientMember.getTagging().remove(oFF.QTransientConstants.TAG_IS_TRANSIENT_BLENDING_PROCESS);
					var measureDimension = queryModel.getDimensionByName(transientMember.getDimension().getName());
					measureDimension.removeMeasure(transientMember.getAliasOrMemberName());
				}
			}
		}
		this.cleanUpTransientMeasureFilters(queryModel.getPrimaryCalculationDimension());
		this.cleanUpTransientMeasureFilters(queryModel.getSecondaryCalculationDimension());
		this.cleanUpTransientDrills(queryModel);
		if (queryManager.getTagging().containsKey("originalMaxRows"))
		{
			var originalMaxRows = oFF.XInteger.convertFromString(queryManager.getTagging().getByKey("originalMaxRows"));
			queryManager.setMaxRows(originalMaxRows);
			queryManager.getTagging().remove("originalMaxRows");
		}
		queryManager.resumeEventing();
	}
};
oFF.BlendingProcess.prototype.cleanUpTransientMeasureFilters = function(dimension)
{
	if (oFF.notNull(dimension))
	{
		var filterElements = dimension.getFilter();
		if (oFF.notNull(filterElements))
		{
			for (var i = filterElements.size() - 1; i >= 0; i--)
			{
				var filterElement = filterElements.get(i);
				if (filterElement.getTagging().containsKey(oFF.QTransientConstants.TAG_IS_TRANSIENT))
				{
					filterElements.removeElement(filterElement);
				}
			}
		}
		var visibilityFilter = dimension.getQueryModel().getFilter().getVisibilityFilter();
		if (oFF.notNull(visibilityFilter))
		{
			var visiblityFilterList = visibilityFilter.getCartesianList(dimension);
			if (oFF.notNull(visiblityFilterList))
			{
				for (var j = visiblityFilterList.size() - 1; j >= 0; j--)
				{
					var visiblityFilterElement = visiblityFilterList.get(j);
					if (visiblityFilterElement.getTagging().containsKey(oFF.QTransientConstants.TAG_IS_TRANSIENT))
					{
						visiblityFilterList.removeElement(visiblityFilterElement);
					}
				}
			}
		}
	}
};
oFF.BlendingProcess.prototype.cleanUpTransientDrills = function(queryModel)
{
	var dimension = queryModel.getAccountDimension();
	var transientMembers = this.m_transientMembers.getByKey(queryModel.getDatasetId());
	if (oFF.notNull(dimension) && oFF.notNull(transientMembers) && transientMembers.size() > 0)
	{
		var drillManager = dimension.getDrillManager();
		var zoomDrillOperations = drillManager.getAllZoomDrillOperationsForDimension(dimension);
		this.removeTransientDrillPaths(drillManager, zoomDrillOperations);
		var drillOperations = drillManager.getDrillOperationsByDimension(dimension);
		drillManager.removeDrillOperationsByDimension(dimension);
		this.removeTransientDrillPaths(drillManager, drillOperations);
	}
};
oFF.BlendingProcess.prototype.removeTransientDrillPaths = function(drillManager, drillOperations)
{
	if (oFF.notNull(drillOperations))
	{
		for (var j = 0; j < drillOperations.size(); j++)
		{
			var drillOperation = drillOperations.get(j);
			var drillPaths = drillOperation.getDrillPath();
			var newDrillPaths = oFF.XCollectionUtils.filter(drillPaths,  function(drillPath){
				return !drillPath.getTagging().containsKey(oFF.QTransientConstants.TAG_IS_TRANSIENT);
			}.bind(this));
			if (newDrillPaths.size() > 0)
			{
				drillManager.setDrillState(newDrillPaths, drillOperation.getDrillState());
			}
		}
	}
};
oFF.BlendingProcess.prototype.onQueryManagerCreated = function(extResult, queryManager, customIdentifier)
{
	this.addAllMessages(extResult);
	if (extResult.hasErrors())
	{
		this.endSync();
	}
	else if (oFF.isNull(this.m_originalProcess))
	{
		oFF.XObjectExt.release(queryManager);
		this.m_queryManagerCreationSyncAction = oFF.XObjectExt.release(this.m_queryManagerCreationSyncAction);
		this.endSync();
		oFF.DfRsSyncAction.prototype.releaseObject.call( this );
	}
	else
	{
		var iterator = queryManager.getInitSettings().getBlendingDefinition().getSources().getIterator();
		while (iterator.hasNext())
		{
			var sourceQueryManager = iterator.next().getQueryManager();
			if (sourceQueryManager.getTagging().containsKey("cacheHintDisabled"))
			{
				sourceQueryManager.setCacheHintEnabled(true);
				sourceQueryManager.getTagging().remove("cacheHintDisabled");
			}
		}
		queryManager.setCacheHintEnabled(this.m_enableInaCacheHint);
		queryManager.getTagging().put(oFF.QStateConstants.TAG_UNDO_IGNORE, "");
		oFF.BlendingUtils.activateBlendedDimensionHierarchies(queryManager, null);
		var blendedQueryModel = queryManager.getQueryModel();
		var subProcessBlendingConfigs = this.m_configs.createListCopy();
		subProcessBlendingConfigs.removeAt(0);
		if (subProcessBlendingConfigs.size() > 0)
		{
			this.createSubBlendingProcess(subProcessBlendingConfigs, queryManager);
		}
		else
		{
			oFF.BlendingProcess.moveOOCLinkedDimensionsToFreeAxis(blendedQueryModel, this.m_outOfContextLinkDimensionNames);
			this.m_originalProcess.onRuntimeBlendedQueryManagerCreated(extResult, queryManager, customIdentifier);
		}
	}
};
oFF.BlendingProcess.prototype.applySorts = function()
{
	var blendableDimensionSorts = this.m_blendableQueryManager.getBlendableDimensionSorts();
	var blendableMeasureSort = this.m_blendableQueryManager.getBlendableMeasureMemberSort();
	if (blendableDimensionSorts.size() > 0)
	{
		this.applyDimensionSorts(blendableDimensionSorts);
	}
	else if (oFF.notNull(blendableMeasureSort))
	{
		this.applyMeasureSort(blendableMeasureSort);
	}
};
oFF.BlendingProcess.prototype.applyDimensionSorts = function(blendableDimensionSorts)
{
	var blendedQueryModel = this.m_blendedQueryManager.getQueryModel();
	var sortingManager = blendedQueryModel.getSortingManager();
	var blendableDimensionSortsIterator = blendableDimensionSorts.getIterator();
	while (blendableDimensionSortsIterator.hasNext())
	{
		var blendableDimensionSort = blendableDimensionSortsIterator.next();
		oFF.BlendingSortUtils.addSortByDimension(this.m_blendableQueryManager, blendedQueryModel, sortingManager, blendableDimensionSort);
	}
};
oFF.BlendingProcess.prototype.applyMeasureSort = function(blendableMeasureSort)
{
	var blendedQueryModel = this.m_blendedQueryManager.getQueryModel();
	var primaryMeasureName = null;
	if (blendableMeasureSort.getPrimaryMeasureName() !== null)
	{
		var primaryMeasure = null;
		if (!blendableMeasureSort.isPrimaryMeasureBlended() && blendableMeasureSort.getPrimaryDatasetId() !== null)
		{
			primaryMeasure = oFF.BlendingUtils.getBlendedMeasureMemberFromLeafMeasureMember(blendableMeasureSort.getPrimaryMeasureName(), true, blendableMeasureSort.getPrimaryDatasetId(), this.m_blendableQueryManager, blendedQueryModel);
		}
		else
		{
			primaryMeasure = blendedQueryModel.getPrimaryCalculationDimension().getStructureMember(blendableMeasureSort.getPrimaryMeasureName());
		}
		if (oFF.notNull(primaryMeasure))
		{
			primaryMeasureName = primaryMeasure.getName();
		}
	}
	var secondaryMeasureName = null;
	if (blendableMeasureSort.getSecondaryMeasureName() !== null)
	{
		var secondaryMeasure = null;
		if (!blendableMeasureSort.isSecondaryMeasureBlended() && blendableMeasureSort.getSecondaryDatasetId() !== null)
		{
			secondaryMeasure = oFF.BlendingUtils.getBlendedMeasureMemberFromLeafMeasureMember(blendableMeasureSort.getSecondaryMeasureName(), false, blendableMeasureSort.getSecondaryDatasetId(), this.m_blendableQueryManager, blendedQueryModel);
		}
		else
		{
			secondaryMeasure = blendedQueryModel.getSecondaryCalculationDimension().getStructureMember(blendableMeasureSort.getSecondaryMeasureName());
		}
		if (oFF.notNull(secondaryMeasure))
		{
			secondaryMeasureName = secondaryMeasure.getName();
		}
	}
	var versionDimension = null;
	if (blendableMeasureSort.getVersionDimension() !== null)
	{
		versionDimension = oFF.BlendingUtils.getBlendedDimensionFromLeafDimension(blendableMeasureSort.getVersionDimension().getName(), blendableMeasureSort.getVersionDimension().getQueryModel().getDatasetId(), this.m_blendableQueryManager, blendedQueryModel);
	}
	oFF.QSortUtils.addSortByMeasure(blendedQueryModel, primaryMeasureName, secondaryMeasureName, blendableMeasureSort.getSortDirection(), !blendableMeasureSort.isPreserveGrouping(), blendableMeasureSort.getVersionElementId(), versionDimension);
};
oFF.BlendingProcess.prototype.applyRanks = function()
{
	var blendedQueryModel = this.m_blendedQueryManager.getQueryModel();
	var rankSettingsIter = this.m_blendableQueryManager.getRankSettings().getIterator();
	var blendedRankSettings = oFF.XList.create();
	while (rankSettingsIter.hasNext())
	{
		var rankSettings = rankSettingsIter.next();
		var blendRankSettings = oFF.QFactory.createRankSettings();
		blendRankSettings.copyFrom(rankSettings, null);
		if (!blendRankSettings.isBlendedPrimaryMeasure())
		{
			var blendedMeasureMember = blendedQueryModel.getPrimaryCalculationDimension().getStructureMember(blendRankSettings.getMeasure());
			if (oFF.isNull(blendedMeasureMember))
			{
				blendedMeasureMember = oFF.BlendingUtils.getBlendedMeasureMemberFromLeafMeasureMember(blendRankSettings.getMeasure(), true, blendRankSettings.getPrimaryMeasureDatasetId(), this.m_blendableQueryManager, blendedQueryModel);
			}
			blendRankSettings.setMeasure(blendedMeasureMember.getName());
		}
		if (!blendRankSettings.isBlendedSecondaryMeasure())
		{
			if (blendRankSettings.getSecondaryMeasure() !== null)
			{
				var blendedSecondaryMeasureMember = blendedQueryModel.getSecondaryCalculationDimension().getStructureMember(blendRankSettings.getSecondaryMeasure());
				if (oFF.isNull(blendedSecondaryMeasureMember))
				{
					blendedSecondaryMeasureMember = oFF.BlendingUtils.getBlendedMeasureMemberFromLeafMeasureMember(blendRankSettings.getSecondaryMeasure(), false, blendRankSettings.getSecondaryMeasureDatasetId(), this.m_blendableQueryManager, blendedQueryModel);
				}
				blendRankSettings.setSecondaryMeasure(blendedSecondaryMeasureMember.getName());
			}
		}
		blendRankSettings.clearAppliedDimensions();
		var appliedDimensionsIter = rankSettings.getAppliedDimensions().getIterator();
		while (appliedDimensionsIter.hasNext())
		{
			var appliedDimension = appliedDimensionsIter.next();
			var blendedDimension = oFF.BlendingUtils.getBlendedDimensionFromLeafDimension(appliedDimension.getName(), appliedDimension.getQueryModel().getDatasetId(), this.m_blendableQueryManager, blendedQueryModel);
			if (oFF.notNull(blendedDimension))
			{
				blendRankSettings.addAppliedDimension(blendedDimension);
			}
		}
		var versionDimension;
		if (rankSettings.getVersionDimension() !== null)
		{
			versionDimension = oFF.BlendingUtils.getBlendedDimensionFromLeafDimension(rankSettings.getVersionDimension().getName(), rankSettings.getVersionDimension().getQueryModel().getDatasetId(), this.m_blendableQueryManager, blendedQueryModel);
			blendRankSettings.setVersionDimension(versionDimension);
		}
		if (blendRankSettings.useDefaultSort() && blendRankSettings.useRankConditions() && (this.m_blendableQueryManager.getBlendableMeasureMemberSort() !== null || this.m_blendableQueryManager.getBlendableDimensionSorts().size() > 0 || this.m_blendableQueryManager.isDefaultOrder()))
		{
			blendRankSettings.setUseDefaultSort(false);
		}
		blendedRankSettings.add(blendRankSettings);
	}
	if (blendedRankSettings.size() > 0)
	{
		this.m_blendedQueryManager.getConvenienceCommands().applyRankingsWithoutReset(blendedRankSettings);
	}
};
oFF.BlendingProcess.prototype.applyMeasureRenames = function()
{
	var blendedQueryModel = this.m_blendedQueryManager.getQueryModel();
	var measureDimension = blendedQueryModel.getPrimaryCalculationDimension();
	var blendedStructureMembers = measureDimension.getLoadedStructureMembers();
	var blendedStructureMembersIterator = blendedStructureMembers.getIterator();
	while (blendedStructureMembersIterator.hasNext())
	{
		var blendedStructureMember = blendedStructureMembersIterator.next();
		var blendedStructureMemberName = blendedStructureMember.getName();
		var leafStructureMember = oFF.BlendingUtils.getMatchingLeafMemberFromBlendedMember(blendedQueryModel, blendedStructureMemberName, true);
		if (oFF.notNull(leafStructureMember) && leafStructureMember.hasOverrideTextDefined())
		{
			var leafOverrideText = leafStructureMember.getText();
			blendedStructureMember.setOverrideText(leafOverrideText);
		}
	}
};
oFF.BlendingProcess.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onQueryManagerCreated(extResult, data, customIdentifier);
};
oFF.BlendingProcess.prototype.processBlendedDrills = function(queryManager, drillOperations)
{
	var blendedDrillInfoIter = drillOperations.getIterator();
	while (blendedDrillInfoIter.hasNext())
	{
		var blendedDrillInfo = blendedDrillInfoIter.next();
		var dimension = oFF.BlendingUtils.findContextDimensionFromDrillDimension(queryManager, blendedDrillInfo.getDimensionName(), blendedDrillInfo.getDatasetId());
		if (oFF.notNull(dimension))
		{
			if (!dimension.isHierarchyActive())
			{
				continue;
			}
			var blendedDrillPathElementInfosIter = blendedDrillInfo.getBlendedDrillPathElementInfos().getIterator();
			var drillPathElements = oFF.XList.create();
			while (blendedDrillPathElementInfosIter.hasNext())
			{
				var blendedDrillPathElementInfo = blendedDrillPathElementInfosIter.next();
				var contextDimension = oFF.BlendingUtils.findContextDimensionFromDrillDimension(queryManager, blendedDrillPathElementInfo.getDimensionName(), blendedDrillPathElementInfo.getDatasetId());
				if (oFF.notNull(contextDimension))
				{
					var memberName = null;
					if (contextDimension.getDimensionType() === oFF.DimensionType.ACCOUNT)
					{
						if (contextDimension.getStructureMember(blendedDrillPathElementInfo.getDrillMember()) !== null)
						{
							memberName = blendedDrillPathElementInfo.getDrillMember();
						}
						else
						{
							var leafQueryModel = oFF.BlendingUtils.getQueryModelFromDatasetId(queryManager, blendedDrillPathElementInfo.getDatasetId());
							if (leafQueryModel.getAccountDimension() !== null)
							{
								var accountMember = leafQueryModel.getAccountDimension().getStructureMember(blendedDrillPathElementInfo.getDrillMember());
								if (oFF.notNull(accountMember))
								{
									var blendedMember = oFF.BlendingUtils.getMatchingBlendedMemberFromLeafMember(queryManager.getQueryModel(), accountMember);
									if (oFF.notNull(blendedMember))
									{
										memberName = blendedMember.getName();
									}
								}
							}
						}
					}
					else
					{
						memberName = blendedDrillPathElementInfo.getDrillMember();
					}
					if (oFF.notNull(memberName))
					{
						drillPathElements.add(oFF.QFactory.createDrillPathElement(queryManager.getQueryModel(), memberName, contextDimension));
					}
				}
			}
			if (drillPathElements.size() > 0)
			{
				queryManager.getQueryModel().getDrillManager().setDrillState(drillPathElements, blendedDrillInfo.getDrillState());
			}
		}
	}
};
oFF.BlendingProcess.prototype.processBlendedDimensionsOnAxis = function(queryManager, axisType)
{
	var axisBlendedDimension = this.m_blendedDimensionInfoAxisMap.getByKey(axisType.getName());
	if (oFF.notNull(axisBlendedDimension))
	{
		if (!axisBlendedDimension.isEmpty())
		{
			queryManager.getQueryModel().getAxis(axisType).clear();
		}
		for (var rowIdx = 0; rowIdx < axisBlendedDimension.size(); rowIdx++)
		{
			var blendedDimensionInfo = axisBlendedDimension.get(rowIdx);
			var dimension = oFF.BlendingUtils.getBlendedDimensionFromLeafDimension(blendedDimensionInfo.getDimensionName(), blendedDimensionInfo.getDatasetId(), this.m_blendableQueryManager, queryManager.getQueryModel());
			if (oFF.notNull(dimension))
			{
				queryManager.getConvenienceCommands().moveDimensionOnAxisTo(dimension.getName(), axisType, rowIdx);
			}
		}
	}
};
oFF.BlendingProcess.prototype.processBlendedDimensionInitialDrillLevel = function(queryManager, axisType)
{
	var axisBlendedDimension = this.m_blendedDimensionInfoAxisMap.getByKey(axisType.getName());
	if (oFF.notNull(axisBlendedDimension))
	{
		for (var rowIdx = 0; rowIdx < axisBlendedDimension.size(); rowIdx++)
		{
			var blendedDimensionInfo = axisBlendedDimension.get(rowIdx);
			var dimensionName = blendedDimensionInfo.getDimensionName();
			var dimension = queryManager.getQueryModel().getDimensionByName(dimensionName);
			if (oFF.notNull(dimension))
			{
				if (dimension.supportsHierarchy() && dimension.isHierarchyActive() && blendedDimensionInfo.getInitialDrillLevel() !== null)
				{
					dimension.setInitialDrillLevel(blendedDimensionInfo.getInitialDrillLevel().getInteger());
				}
			}
		}
	}
};
oFF.BlendingProcess.prototype.prepareQueryExecution = function()
{
	if (oFF.notNull(this.m_blendedQueryManager))
	{
		this.m_blendedQueryManager.setMaxRows(this.m_blendableQueryManager.getActiveResultSetContainer().getMaxRows());
		this.processBlendedMeasures();
		this.processThresholds();
		this.processBlendedDimensionsOnAxis(this.m_blendedQueryManager, oFF.AxisType.ROWS);
		this.processBlendedDimensionsOnAxis(this.m_blendedQueryManager, oFF.AxisType.COLUMNS);
		oFF.BlendingUtils.activateBlendedDimensionHierarchies(this.m_blendedQueryManager, this.m_automappingTimeLinkDimensionNames);
		this.processBlendedDimensionInitialDrillLevel(this.m_blendedQueryManager, oFF.AxisType.ROWS);
		this.processBlendedDimensionInitialDrillLevel(this.m_blendedQueryManager, oFF.AxisType.COLUMNS);
		this.processBlendedDrills(this.m_blendedQueryManager, this.m_leafAccountDrillOperations);
		this.processBlendedDrills(this.m_blendedQueryManager, this.m_blendedDrillOperations);
		this.applyMeasureRenames();
		var blendedQueryModel = this.m_blendedQueryManager.getQueryModel();
		blendedQueryModel.getSortingManager().getSortingOperations().clear();
		blendedQueryModel.getConvenienceCommands().clearRank(null);
		this.applySorts();
		this.applyRanks();
	}
};
oFF.BlendingProcess.prototype.postQueryExecution = function()
{
	if (oFF.notNull(this.m_blendedQueryManager))
	{
		this.cleanupTransientState(this.m_blendedQueryManager);
	}
};
oFF.BlendingProcess.prototype.processBlendedMeasures = function()
{
	var primaryCalculationDimension = this.m_blendedQueryManager.getQueryModel().getPrimaryCalculationDimension();
	var primaryStructureMembers = primaryCalculationDimension.getAllStructureMembers();
	if (oFF.XCollectionUtils.contains(primaryStructureMembers,  function(structureMember){
		return structureMember.getMemberType().isCustomMember();
	}.bind(this)))
	{
		primaryCalculationDimension.removeCustomMembers();
	}
	this.applyBlendedMeasures(this.m_transientPrimaryBlendedMeasures, true);
	this.applyBlendedMeasures(this.m_primaryBlendedMeasures, false);
};
oFF.BlendingProcess.prototype.applyBlendedMeasures = function(blendedMeasures, isTransientMeasures)
{
	if (oFF.notNull(this.m_blendedQueryManager) && oFF.notNull(blendedMeasures))
	{
		var queryModel = this.m_blendedQueryManager.getQueryModel();
		var calculationDimension = queryModel.getPrimaryCalculationDimension();
		var blendedMeasuresIter = blendedMeasures.getIterator();
		while (blendedMeasuresIter.hasNext())
		{
			var blendedMeasure = blendedMeasuresIter.next();
			if (blendedMeasure.getMemberType() === oFF.MemberType.FORMULA)
			{
				var blendedFormulaMeasure = blendedMeasure;
				if (calculationDimension.getStructureMember(blendedMeasure.getName()) !== null)
				{
					calculationDimension.removeMeasure(blendedMeasure.getName());
				}
				var runtimeMeasure = oFF.QFactory.createFormulaMeasure(queryModel, calculationDimension, blendedMeasure.getName(), blendedMeasure.getText(), null);
				runtimeMeasure.setFormula(oFF.BlendingUtils.convertToBlendedFormula(blendedFormulaMeasure.getFormula(), runtimeMeasure));
				if (isTransientMeasures)
				{
					runtimeMeasure.setResultVisibility(oFF.ResultVisibility.HIDDEN);
				}
				calculationDimension.addMeasure(runtimeMeasure);
			}
		}
		var transientMemberListIter = this.m_transientMembers.getIterator();
		while (transientMemberListIter.hasNext())
		{
			var transientMemberList = transientMemberListIter.next();
			var transientMemberIter = transientMemberList.getIterator();
			while (transientMemberIter.hasNext())
			{
				var transientMember = transientMemberIter.next();
				var structureMember = oFF.BlendingUtils.getMatchingBlendedMemberFromLeafMember(queryModel, transientMember);
				if (oFF.notNull(structureMember))
				{
					structureMember.setResultVisibility(oFF.ResultVisibility.HIDDEN);
					if (calculationDimension.getStructureLayout().getByKey(structureMember.getName()) === null)
					{
						calculationDimension.getStructureLayout().add(structureMember);
					}
				}
			}
		}
	}
};
oFF.BlendingProcess.prototype.processThresholds = function()
{
	this.m_blendedQueryManager.getQueryModel().getFormulaExceptionManager().clear();
	var formulaExceptions = this.m_blendableQueryManager.getFormulaExceptions();
	var iter = formulaExceptions.getIterator();
	while (iter.hasNext())
	{
		var formulaException = iter.next();
		var blendFormulaException = this.m_blendedQueryManager.getQueryModel().getFormulaExceptionManager().addNewFormulaException(formulaException.getName(), formulaException.getText());
		blendFormulaException.copyFrom(formulaException, null);
		if (formulaException.getMeasure() !== null)
		{
			var convertedMeasure = this.getConvertedMeasure(formulaException, null, formulaException.getMeasure().getAliasOrMemberName());
			if (oFF.isNull(convertedMeasure))
			{
				continue;
			}
			blendFormulaException.setMeasure(convertedMeasure);
		}
		if (formulaException.getBaseMeasure() !== null || formulaException.getBaseMeasureName() !== null)
		{
			var convertedBaseMeasure = this.getConvertedMeasure(formulaException, formulaException.getBaseMeasure(), formulaException.getBaseMeasureName());
			if (oFF.isNull(convertedBaseMeasure))
			{
				continue;
			}
			blendFormulaException.setBaseMeasure(convertedBaseMeasure);
			blendFormulaException.setBaseMeasureName(convertedBaseMeasure.getName());
		}
		if (formulaException.getReferenceMeasure() !== null || formulaException.getReferenceMeasureName() !== null)
		{
			var convertedRefMeasure = this.getConvertedMeasure(formulaException, formulaException.getReferenceMeasure(), formulaException.getReferenceMeasureName());
			if (oFF.isNull(convertedRefMeasure))
			{
				continue;
			}
			blendFormulaException.setReferenceMeasure(convertedRefMeasure);
			blendFormulaException.setReferenceMeasureName(convertedRefMeasure.getName());
		}
		blendFormulaException.removeAllEvaluates();
		var evaluatesIter = formulaException.getEvaluates().getIterator();
		while (evaluatesIter.hasNext())
		{
			var evaluate = evaluatesIter.next();
			var evaluateField = evaluate.getField();
			if (oFF.notNull(evaluateField))
			{
				var blendedField = oFF.BlendingUtils.getBlendedFieldFromLeafField(evaluateField.getName(), evaluateField.getQueryModel().getDatasetId(), this.m_blendableQueryManager, this.m_blendedQueryManager.getQueryModel());
				if (oFF.notNull(blendedField))
				{
					var blendedEvaluate = blendFormulaException.addNewEvaluateWithField(blendedField, evaluate.getLowValue().getValue());
					blendedEvaluate.copyFrom(evaluateField, null);
					blendedEvaluate.setField(blendedField);
				}
			}
		}
	}
};
oFF.BlendingProcess.prototype.getConvertedMeasure = function(formulaException, measure, measureName)
{
	var effectiveMeasureName = oFF.isNull(measure) ? measureName : measure.getAliasOrMemberName();
	var effectiveMeasure = oFF.XCollectionUtils.findFirst(this.m_primaryBlendedMeasures,  function(primaryBlendedMeasure){
		return oFF.XString.isEqual(primaryBlendedMeasure.getName(), effectiveMeasureName);
	}.bind(this));
	if (oFF.isNull(effectiveMeasure))
	{
		effectiveMeasure = oFF.BlendingUtils.getBlendedMeasureMemberFromLeafMeasureMember(effectiveMeasureName, true, formulaException.getQueryModel().getDatasetId(), this.m_blendableQueryManager, this.m_blendedQueryManager.getQueryModel());
	}
	return effectiveMeasure;
};
oFF.BlendingProcess.prototype.createSubBlendingProcess = function(configs, blendedQueryManager)
{
	this.m_childProcess = this.createSubProcess(configs, blendedQueryManager);
	this.m_childProcess.processBlendingQueryManagerCreation();
};
oFF.BlendingProcess.prototype.addOriginalDimensionResultSetFields = function(dimensionCacheKey, originalResultSetFields)
{
	this.m_originalDimensionResultSetFields.put(dimensionCacheKey, originalResultSetFields);
};
oFF.BlendingProcess.prototype.addOutOfContextLinkDimensionName = function(dimensionName)
{
	this.m_outOfContextLinkDimensionNames.add(dimensionName);
};
oFF.BlendingProcess.prototype.addAutoMappingTimeLinkDimensionNames = function(dimensionName)
{
	this.m_automappingTimeLinkDimensionNames.add(dimensionName);
};
oFF.BlendingProcess.prototype.onRuntimeBlendedQueryManagerCreated = function(extResult, runtimeBlendedQueryManager, customIdentifier)
{
	this.addAllMessages(extResult);
	if (!extResult.hasErrors())
	{
		var primaryCalculationDimension = runtimeBlendedQueryManager.getQueryModel().getPrimaryCalculationDimension();
		if (oFF.notNull(primaryCalculationDimension))
		{
			var structureMembers = primaryCalculationDimension.getAllStructureMembers();
			for (var i = 0; i < structureMembers.size(); i++)
			{
				var structureMember = structureMembers.get(i);
				if (oFF.notNull(structureMember))
				{
					var leafStructureMember = oFF.BlendingUtils.getMatchingLeafMemberFromBlendedMember(runtimeBlendedQueryManager.getQueryModel(), structureMember.getName(), true);
					if (oFF.notNull(leafStructureMember) && leafStructureMember.getAliasName() !== null)
					{
						structureMember.setAliasName(leafStructureMember.getAliasName());
					}
				}
			}
		}
		runtimeBlendedQueryManager.setClientQueryObjectStorageName(this.m_blendableQueryManager.getClientQueryObjectStorageName());
		this.m_blendedQueryManager = runtimeBlendedQueryManager;
		this.m_cachedRuntimeBlendedQueryManagerResult = runtimeBlendedQueryManager;
		this.setData(runtimeBlendedQueryManager);
	}
	this.endSync();
};

oFF.OlapEnvVarProcessor = function() {};
oFF.OlapEnvVarProcessor.prototype = new oFF.AbstractOlapEnvQueryManagerHandler();
oFF.OlapEnvVarProcessor.prototype._ff_c = "OlapEnvVarProcessor";

oFF.OlapEnvVarProcessor.create = function(olapEnvArea)
{
	var newObj = new oFF.OlapEnvVarProcessor();
	newObj.setupQueryManagerHandler(olapEnvArea);
	return newObj;
};
oFF.OlapEnvVarProcessor.prototype.m_updateAction = null;
oFF.OlapEnvVarProcessor.prototype.releaseObject = function()
{
	oFF.AbstractOlapEnvQueryManagerHandler.prototype.releaseObject.call( this );
};
oFF.OlapEnvVarProcessor.prototype.supportsCheckVariables = function()
{
	return oFF.XStream.of(this.getTaggedQueryManagers()).anyMatch( function(qm){
		return qm.supportsCheckVariables();
	}.bind(this));
};
oFF.OlapEnvVarProcessor.prototype.supportsVariableMasking = function()
{
	return oFF.XStream.of(this.getTaggedQueryManagers()).anyMatch( function(qm){
		return qm.supportsVariableMasking();
	}.bind(this));
};
oFF.OlapEnvVarProcessor.prototype.supportsReInitVariables = function()
{
	return oFF.XStream.of(this.getTaggedQueryManagers()).anyMatch( function(qm){
		return qm.supportsReInitVariables();
	}.bind(this));
};
oFF.OlapEnvVarProcessor.prototype.supportsDirectVariableTransfer = function()
{
	var queryManagerList = this.getTaggedQueryManagers();
	var queryManagerSize = queryManagerList.size();
	for (var i = 0; i < queryManagerSize; i++)
	{
		var queryManager = queryManagerList.get(i);
		var variableProcessor = queryManager.getVariableProcessor();
		if (!variableProcessor.supportsReInitVariables())
		{
			return false;
		}
	}
	return true;
};
oFF.OlapEnvVarProcessor.prototype.getVariableMode = function()
{
	var queryManagerList = this.getTaggedQueryManagers();
	var queryManagerSize = queryManagerList.size();
	for (var i = 0; i < queryManagerSize; i++)
	{
		var queryManager = queryManagerList.get(i);
		var variableProcessor = queryManager.getVariableProcessor();
		if (variableProcessor.getVariableMode() === oFF.VariableMode.SUBMIT_AND_REINIT)
		{
			return oFF.VariableMode.SUBMIT_AND_REINIT;
		}
	}
	return oFF.VariableMode.DIRECT_VALUE_TRANSFER;
};
oFF.OlapEnvVarProcessor.prototype.hasInputEnabledVariables = function()
{
	return oFF.QVariableUtils.hasInputEnabledVariables(this.getVariables());
};
oFF.OlapEnvVarProcessor.prototype.hasInputEnabledAndNonTechnicalVariables = function()
{
	return oFF.XCollectionUtils.hasElements(this.getInputEnabledAndNonTechnicalVariables());
};
oFF.OlapEnvVarProcessor.prototype.clearExternalVariablesRepresentations = function()
{
	this.queueEventing();
	oFF.QVariableUtils.clearExternalVariablesRepresentations(this.getVariables());
	this.resumeEventing();
};
oFF.OlapEnvVarProcessor.prototype.hasMandatoryVariables = function()
{
	return oFF.QVariableUtils.hasMandatoryVariables(this.getVariables());
};
oFF.OlapEnvVarProcessor.prototype.hasVariables = function()
{
	return this.getVariables().hasElements();
};
oFF.OlapEnvVarProcessor.prototype.getInputEnabledVariable = function(name)
{
	return oFF.QVariableUtils.getInputEnabledVariable(this.getVariables(), name);
};
oFF.OlapEnvVarProcessor.prototype.getInputEnabledVariables = function()
{
	return oFF.QVariableUtils.getInputEnabledVariables(this.getVariables());
};
oFF.OlapEnvVarProcessor.prototype.getInputEnabledAndNonTechnicalVariables = function()
{
	return oFF.QVariableUtils.getInputEnabledAndNonTechnicalVariables(this.getVariables());
};
oFF.OlapEnvVarProcessor.prototype.getHierarchyNodeVariable = function(name)
{
	return oFF.QVariableUtils.getVariableByType(this.getVariables(), name, oFF.VariableType.HIERARCHY_NODE_VARIABLE);
};
oFF.OlapEnvVarProcessor.prototype.getHierarchyNameVariable = function(name)
{
	return oFF.QVariableUtils.getVariableByType(this.getVariables(), name, oFF.VariableType.HIERARCHY_NAME_VARIABLE);
};
oFF.OlapEnvVarProcessor.prototype.getHierarchyNameVariables = function()
{
	return oFF.QVariableUtils.getHierarchyNameVariables(this.getVariables());
};
oFF.OlapEnvVarProcessor.prototype.getDimensionMemberVariables = function()
{
	return oFF.QVariableUtils.getDimensionMemberVariables(this.getVariables());
};
oFF.OlapEnvVarProcessor.prototype.setWinControlInAutoSubmitByType = function(variableType, isWinControlInAutoSubmit, isLimitToExitVariable)
{
	return;
};
oFF.OlapEnvVarProcessor.prototype.syncVariableValues = function()
{
	var mergedVariables = this.getMergedVariables();
	var mergedVariablesSize = mergedVariables.size();
	for (var i = 0; i < mergedVariablesSize; i++)
	{
		mergedVariables.get(i).sync();
	}
};
oFF.OlapEnvVarProcessor.prototype.getVariables = function()
{
	var variables = oFF.XListOfNameObject.create();
	var mergedVariables = this.getMergedVariables();
	var mergedVariablesSize = mergedVariables.size();
	for (var i = 0; i < mergedVariablesSize; i++)
	{
		variables.add(mergedVariables.get(i).getMainVariable());
	}
	return variables;
};
oFF.OlapEnvVarProcessor.prototype.getVariable = function(name)
{
	var mergedVariables = this.getMergedVariables();
	for (var i = 0; i < mergedVariables.size(); i++)
	{
		var variable = mergedVariables.get(i).getMainVariable();
		if (oFF.XString.isEqual(variable.getName(), name))
		{
			return variable;
		}
	}
	return null;
};
oFF.OlapEnvVarProcessor.prototype.getMergedVariables = function()
{
	var mergedVariables = oFF.XListOfNameObject.create();
	var queryManagerList = this.getTaggedQueryManagers();
	var queryManagerSize = queryManagerList.size();
	for (var i = 0; i < queryManagerSize; i++)
	{
		var queryManager = queryManagerList.get(i);
		var variableProcessor = queryManager.getVariableProcessor();
		var variableContainer = variableProcessor.getVariableContainer();
		var contVariables = variableContainer.getVariables();
		var contVariablesSize = contVariables.size();
		for (var j = 0; j < contVariablesSize; j++)
		{
			var variable = contVariables.get(j);
			var key = this.createMergeVarKey(queryManager, variable);
			var mergedVar = mergedVariables.getByKey(key);
			if (oFF.isNull(mergedVar))
			{
				mergedVariables.add(oFF.OlapEnvVariable.create(key, variable));
			}
			else
			{
				mergedVar.addSecondaryVariable(variable);
			}
		}
	}
	return mergedVariables;
};
oFF.OlapEnvVarProcessor.prototype.createMergeVarKey = function(queryManager, variable)
{
	var buffer = oFF.XStringBuffer.create();
	buffer.append(queryManager.getSystemName());
	buffer.append("~");
	var dataSource = queryManager.getDataSource();
	buffer.append(dataSource.getFullQualifiedName());
	buffer.append("~");
	buffer.append(variable.getName());
	return buffer.toString();
};
oFF.OlapEnvVarProcessor.prototype.getDimensionAccessor = oFF.noSupport;
oFF.OlapEnvVarProcessor.prototype.getDrillManager = oFF.noSupport;
oFF.OlapEnvVarProcessor.prototype.getCellContextManager = oFF.noSupport;
oFF.OlapEnvVarProcessor.prototype.getKeyRefStorage = oFF.noSupport;
oFF.OlapEnvVarProcessor.prototype.submitVariables = function(syncType, listener, customIdentifier)
{
	return oFF.OlapEnvVarAction.createAndRunSubmit(this, syncType, listener, customIdentifier);
};
oFF.OlapEnvVarProcessor.prototype.reInitVariablesAfterSubmit = function(syncType, listener, customIdentifier)
{
	return oFF.OlapEnvVarAction.createAndRunReInitAfterSubmit(this, syncType, listener, customIdentifier);
};
oFF.OlapEnvVarProcessor.prototype.cancelReInitVariables = function(syncType, listener, customIdentifier)
{
	return oFF.OlapEnvVarAction.createAndRunCancel(this, syncType, listener, customIdentifier);
};
oFF.OlapEnvVarProcessor.prototype.transferVariables = function(syncType, listener, customIdentifier)
{
	return oFF.OlapEnvVarAction.createAndRunSetGetValues(this, syncType, listener, customIdentifier);
};
oFF.OlapEnvVarProcessor.prototype.emptyVariableDefinition = function(syncType, listener, customIdentifier)
{
	return oFF.OlapEnvVarAction.createAndRunEmptyVariableDefinition(this, syncType, listener, customIdentifier);
};
oFF.OlapEnvVarProcessor.prototype.checkVariables = function(syncType, listener, customIdentifier)
{
	return oFF.OlapEnvVarAction.createAndRunCheck(this, syncType, listener, customIdentifier);
};
oFF.OlapEnvVarProcessor.prototype.transferVariablesByVariable = oFF.noSupport;
oFF.OlapEnvVarProcessor.prototype.setDirectVariableTransferEnabled = oFF.noSupport;
oFF.OlapEnvVarProcessor.prototype.isDirectVariableTransferEnabled = function()
{
	return this.getVariableProcessorState() === oFF.VariableProcessorState.CHANGEABLE_DIRECT_VALUE_TRANSFER;
};
oFF.OlapEnvVarProcessor.prototype.isProcessingAutoSubmit = function()
{
	return this.getVariableProcessorState() === oFF.VariableProcessorState.PROCESSING_AUTO_SUBMIT || this.getVariableProcessorState() === oFF.VariableProcessorState.PROCESSING_AUTO_SUBMIT_AFTER_REINIT;
};
oFF.OlapEnvVarProcessor.prototype.isSubmitted = function()
{
	return this.getVariableProcessorState() === oFF.VariableProcessorState.SUBMITTED;
};
oFF.OlapEnvVarProcessor.prototype.getVariableProcessorState = function()
{
	if (oFF.notNull(this.m_updateAction) && this.m_updateAction.getSyncState() === oFF.SyncState.PROCESSING)
	{
		return oFF.VariableProcessorState.PROCESSING;
	}
	var variableProcessorState = null;
	var queryManagerList = this.getTaggedQueryManagers();
	var queryManagerSize = queryManagerList.size();
	for (var i = 0; i < queryManagerSize; i++)
	{
		var queryManager = queryManagerList.get(i);
		var variableProcessor = queryManager.getVariableProcessor();
		var currentState = variableProcessor.getVariableProcessorState();
		if (currentState.isTypeOf(oFF.VariableProcessorState.PROCESSING))
		{
			return oFF.VariableProcessorState.PROCESSING;
		}
		if (oFF.isNull(variableProcessorState))
		{
			variableProcessorState = currentState;
		}
		else if (variableProcessorState !== currentState)
		{
			var newState = null;
			if (variableProcessorState.isTypeOf(oFF.VariableProcessorState.CHANGEABLE))
			{
				if (currentState === oFF.VariableProcessorState.SUBMITTED)
				{
					newState = oFF.VariableProcessorState.SUBMITTED;
				}
				else if (currentState.isTypeOf(oFF.VariableProcessorState.CHANGEABLE))
				{
					if (currentState === oFF.VariableProcessorState.CHANGEABLE_REINIT || variableProcessorState === oFF.VariableProcessorState.CHANGEABLE_REINIT)
					{
						newState = oFF.VariableProcessorState.CHANGEABLE_REINIT;
					}
					else if (currentState === oFF.VariableProcessorState.SUBMIT_FAILED || variableProcessorState === oFF.VariableProcessorState.SUBMIT_FAILED)
					{
						newState = oFF.VariableProcessorState.SUBMIT_FAILED;
					}
					else
					{
						newState = oFF.VariableProcessorState.CHANGEABLE;
					}
				}
			}
			else if (variableProcessorState === oFF.VariableProcessorState.SUBMITTED && currentState.isTypeOf(oFF.VariableProcessorState.CHANGEABLE))
			{
				newState = oFF.VariableProcessorState.SUBMITTED;
			}
			if (oFF.isNull(newState))
			{
				newState = oFF.VariableProcessorState.MIXED;
			}
			variableProcessorState = newState;
		}
	}
	return variableProcessorState;
};
oFF.OlapEnvVarProcessor.prototype.registerVariableProcessorStateChangedListener = oFF.noSupport;
oFF.OlapEnvVarProcessor.prototype.unregisterVariableProcessorStateChangedListener = oFF.noSupport;
oFF.OlapEnvVarProcessor.prototype.getSelectedVariableProcessors = function(targetState)
{
	var varProcessorList = oFF.XList.create();
	var queryManagerList = this.getTaggedQueryManagers();
	var queryManagerSize = queryManagerList.size();
	for (var i = 0; i < queryManagerSize; i++)
	{
		var queryManager = queryManagerList.get(i);
		var variableProcessor = queryManager.getVariableProcessor();
		if (variableProcessor.hasVariables())
		{
			if (oFF.isNull(targetState))
			{
				varProcessorList.add(variableProcessor);
			}
			else
			{
				var variableProcessorState = variableProcessor.getVariableProcessorState();
				if (variableProcessorState.isTypeOf(targetState) || oFF.VariableProcessorState.PROCESSING_EMPTY_VARIABLE_DEFINITION === variableProcessorState)
				{
					varProcessorList.add(variableProcessor);
				}
			}
		}
	}
	return varProcessorList;
};
oFF.OlapEnvVarProcessor.prototype.getAllBWVariableProcessors = function()
{
	var varProcessorList = oFF.XList.create();
	var queryManagerList = this.getTaggedQueryManagers();
	var queryManagerSize = queryManagerList.size();
	for (var i = 0; i < queryManagerSize; i++)
	{
		var queryManager = queryManagerList.get(i);
		var variableProcessor = queryManager.getVariableProcessor();
		var convenienceCommands = queryManager.getConvenienceCommands();
		if (oFF.notNull(convenienceCommands) && convenienceCommands.isBw() && variableProcessor.hasVariables())
		{
			varProcessorList.add(variableProcessor);
		}
	}
	return varProcessorList;
};
oFF.OlapEnvVarProcessor.prototype.getVariableContainer = function()
{
	return this;
};
oFF.OlapEnvVarProcessor.prototype.registerChangedListener = oFF.noSupport;
oFF.OlapEnvVarProcessor.prototype.unregisterChangedListener = oFF.noSupport;
oFF.OlapEnvVarProcessor.prototype.getOlapComponentType = oFF.noSupport;
oFF.OlapEnvVarProcessor.prototype.isComponentNode = oFF.noSupport;
oFF.OlapEnvVarProcessor.prototype.getChildren = function()
{
	return this.getChildrenIterator();
};
oFF.OlapEnvVarProcessor.prototype.getChildrenIterator = oFF.noSupport;
oFF.OlapEnvVarProcessor.prototype.getNamedChildren = oFF.noSupport;
oFF.OlapEnvVarProcessor.prototype.getIndexedChildren = oFF.noSupport;
oFF.OlapEnvVarProcessor.prototype.serializeToStringExt = oFF.noSupport;
oFF.OlapEnvVarProcessor.prototype.serialize = oFF.noSupport;
oFF.OlapEnvVarProcessor.prototype.serializeToContent = oFF.noSupport;
oFF.OlapEnvVarProcessor.prototype.serializeToFormat = oFF.noSupport;
oFF.OlapEnvVarProcessor.prototype.serializeToString = oFF.noSupport;
oFF.OlapEnvVarProcessor.prototype.serializeToElement = function(modelFormat)
{
	return this.serializeToElementExt(modelFormat, null);
};
oFF.OlapEnvVarProcessor.prototype.serializeToElementExt = oFF.noSupport;
oFF.OlapEnvVarProcessor.prototype.deserializeExt = oFF.noSupport;
oFF.OlapEnvVarProcessor.prototype.deserializeFromContent = oFF.noSupport;
oFF.OlapEnvVarProcessor.prototype.deserializeFromElementExt = oFF.noSupport;
oFF.OlapEnvVarProcessor.prototype.deserializeNewComponentExt = oFF.noSupport;
oFF.OlapEnvVarProcessor.prototype.deserializeNewComponentFromElementExt = oFF.noSupport;
oFF.OlapEnvVarProcessor.prototype.getTagging = oFF.noSupport;
oFF.OlapEnvVarProcessor.prototype.isEventingStopped = oFF.noSupport;
oFF.OlapEnvVarProcessor.prototype.stopEventing = function()
{
	var queryManagerList = this.getTaggedQueryManagers();
	var queryManagerSize = queryManagerList.size();
	for (var i = 0; i < queryManagerSize; i++)
	{
		var queryManager = queryManagerList.get(i);
		var variableProcessor = queryManager.getVariableProcessor();
		var variableContainer = variableProcessor.getVariableContainer();
		variableContainer.stopEventing();
	}
};
oFF.OlapEnvVarProcessor.prototype.queueEventing = function()
{
	var queryManagerList = this.getTaggedQueryManagers();
	var queryManagerSize = queryManagerList.size();
	for (var i = 0; i < queryManagerSize; i++)
	{
		var queryManager = queryManagerList.get(i);
		var variableProcessor = queryManager.getVariableProcessor();
		var variableContainer = variableProcessor.getVariableContainer();
		variableContainer.queueEventing();
	}
};
oFF.OlapEnvVarProcessor.prototype.resumeEventing = function()
{
	var queryManagerList = this.getTaggedQueryManagers();
	var queryManagerSize = queryManagerList.size();
	for (var i = 0; i < queryManagerSize; i++)
	{
		var queryManager = queryManagerList.get(i);
		var variableProcessor = queryManager.getVariableProcessor();
		var variableContainer = variableProcessor.getVariableContainer();
		variableContainer.resumeEventing();
	}
};
oFF.OlapEnvVarProcessor.prototype.getComponentType = oFF.noSupport;
oFF.OlapEnvVarProcessor.prototype.getName = oFF.noSupport;
oFF.OlapEnvVarProcessor.prototype.getText = oFF.noSupport;
oFF.OlapEnvVarProcessor.prototype.getContext = oFF.noSupport;
oFF.OlapEnvVarProcessor.prototype.getFieldAccessorSingle = oFF.noSupport;
oFF.OlapEnvVarProcessor.prototype.getQueryModel = oFF.noSupport;
oFF.OlapEnvVarProcessor.prototype.getQueryManager = oFF.noSupport;
oFF.OlapEnvVarProcessor.prototype.getModelCapabilities = oFF.noSupport;
oFF.OlapEnvVarProcessor.prototype.isSubmitNeeded = function()
{
	return this.getVariableProcessorState().isSubmitNeeded();
};
oFF.OlapEnvVarProcessor.prototype.isReinitNeeded = function()
{
	return this.getVariableProcessorState().isReinitNeeded();
};
oFF.OlapEnvVarProcessor.prototype.isCancelNeeded = function()
{
	return this.getVariableProcessorState().isCancelNeeded();
};
oFF.OlapEnvVarProcessor.prototype.getTagValue = oFF.noSupport;
oFF.OlapEnvVarProcessor.prototype.getContentElement = oFF.noSupport;
oFF.OlapEnvVarProcessor.prototype.getContentConstant = oFF.noSupport;
oFF.OlapEnvVarProcessor.prototype.isNode = oFF.noSupport;
oFF.OlapEnvVarProcessor.prototype.isLeaf = oFF.noSupport;
oFF.OlapEnvVarProcessor.prototype.activateVariableVariant = function(variableVariant, syncType, listener, customIdentifier)
{
	return oFF.OlapEnvVarAction.createAndRunVariantActivation(this, syncType, listener, customIdentifier, variableVariant);
};
oFF.OlapEnvVarProcessor.prototype.deleteVariableVariant = function(variableVariant, syncType, listener, customIdentifier)
{
	var queryManager = this.findQmForDatasource(variableVariant.getDataSource());
	if (oFF.isNull(queryManager))
	{
		return oFF.OlapVarImmediateCallback.createAndRunError(oFF.ErrorCodes.INVALID_STATE, "No QueryManager found to delete the variant", syncType, listener, customIdentifier);
	}
	return queryManager.deleteVariableVariant(variableVariant, syncType, listener, customIdentifier);
};
oFF.OlapEnvVarProcessor.prototype.updateVariableVariantValues = function(variableVariant, syncType, listener, customIdentifier)
{
	var queryManager = this.findQmForDatasource(variableVariant.getDataSource());
	if (oFF.isNull(queryManager))
	{
		return oFF.OlapVarImmediateCallback.createAndRunError(oFF.ErrorCodes.INVALID_STATE, "No QueryManager found to save the variant", syncType, listener, customIdentifier);
	}
	this.syncVariableValues();
	return queryManager.updateVariableVariantValues(variableVariant, syncType, listener, customIdentifier);
};
oFF.OlapEnvVarProcessor.prototype.saveVariableVariant = function(variableVariant, syncType, listener, customIdentifier)
{
	var queryManager = this.findQmForDatasource(variableVariant.getDataSource());
	if (oFF.isNull(queryManager))
	{
		return oFF.OlapVarImmediateCallback.createAndRunError(oFF.ErrorCodes.INVALID_STATE, "No QueryManager found to modify the variant", syncType, listener, customIdentifier);
	}
	return queryManager.saveVariableVariant(variableVariant, syncType, listener, customIdentifier);
};
oFF.OlapEnvVarProcessor.prototype.findQmForDatasource = function(dataSource)
{
	var fullQualifiedName = dataSource.getFullQualifiedName();
	var system = dataSource.getSystemName();
	return oFF.XCollectionUtils.findFirst(this.getTaggedQueryManagers(),  function(qm){
		return oFF.XString.isEqual(qm.getDataSource().getFullQualifiedName(), fullQualifiedName) && oFF.XString.isEqual(qm.getDataSource().getSystemName(), system);
	}.bind(this));
};
oFF.OlapEnvVarProcessor.prototype.cloneOlapComponent = oFF.noSupport;
oFF.OlapEnvVarProcessor.prototype.getParent = function()
{
	return null;
};
oFF.OlapEnvVarProcessor.prototype.getDataSourceOrigin = function()
{
	return this.getDataSource();
};
oFF.OlapEnvVarProcessor.prototype.getDataSourceTarget = function()
{
	return this.getDataSource();
};
oFF.OlapEnvVarProcessor.prototype.getDataSource = function()
{
	var result = null;
	var taggedQueryManagers = this.getTaggedQueryManagers();
	for (var i = 0; i < taggedQueryManagers.size(); i++)
	{
		var dataSource = taggedQueryManagers.get(i).getDataSource();
		if (oFF.isNull(result))
		{
			result = dataSource;
			continue;
		}
		if (oFF.notNull(dataSource))
		{
			if (!oFF.XString.isEqual(result.getSystemName(), dataSource.getSystemName()) || !oFF.XString.isEqual(result.getFullQualifiedName(), dataSource.getFullQualifiedName()))
			{
				return null;
			}
		}
	}
	return result;
};
oFF.OlapEnvVarProcessor.prototype.updateDynamicVariables = function(syncType, listener, customIdentifier)
{
	this.m_updateAction = oFF.OlapEnvUpdateAction.createAndRunUpdateDynamicValues(this, syncType, listener, customIdentifier, false);
};
oFF.OlapEnvVarProcessor.prototype.resetExitOrUpdateDynamicVariable = function(syncType, listener, customIdentifier, overwriteDefaultForInputEnabledVar)
{
	this.m_updateAction = oFF.OlapEnvUpdateAction.createAndRunUpdateDynamicValues(this, syncType, listener, customIdentifier, overwriteDefaultForInputEnabledVar);
};
oFF.OlapEnvVarProcessor.prototype.getConvenienceCommands = oFF.noSupport;
oFF.OlapEnvVarProcessor.prototype.getVariableVariants = function()
{
	var allVariants = oFF.XListOfNameObject.create();
	var queryManagers = this.getTaggedQueryManagers();
	for (var i = 0; i < queryManagers.size(); i++)
	{
		var variants = queryManagers.get(i).getVariableVariants();
		if (!oFF.XCollectionUtils.hasElements(variants))
		{
			continue;
		}
		for (var j = 0; j < variants.size(); j++)
		{
			var variant = variants.get(j);
			if (!allVariants.containsKey(variant.getName()))
			{
				allVariants.add(variant);
			}
		}
	}
	return allVariants;
};
oFF.OlapEnvVarProcessor.prototype.getSelectionTagging = function()
{
	return this.getSelectionMap();
};
oFF.OlapEnvVarProcessor.prototype.getStorageName = oFF.noSupport;
oFF.OlapEnvVarProcessor.prototype.getStorageGroupName = oFF.noSupport;
oFF.OlapEnvVarProcessor.prototype.getStorageObjectName = oFF.noSupport;
oFF.OlapEnvVarProcessor.prototype.serializeToContentExt = function(modelFormat, capabilities)
{
	return null;
};
oFF.OlapEnvVarProcessor.prototype.hasPropertyChanged = function(propertyName)
{
	return false;
};
oFF.OlapEnvVarProcessor.prototype.getModCounter = oFF.noSupport;
oFF.OlapEnvVarProcessor.prototype.reconfigure = oFF.noSupport;
oFF.OlapEnvVarProcessor.prototype.getChangedProperties = function()
{
	return null;
};
oFF.OlapEnvVarProcessor.prototype.setChangedProperties = oFF.noSupport;
oFF.OlapEnvVarProcessor.prototype.getSystemName = function()
{
	return null;
};
oFF.OlapEnvVarProcessor.prototype.supportsMaintainsVariableVariants = function()
{
	return oFF.XStream.of(this.getTaggedQueryManagers()).anyMatch( function(qm){
		return qm.supportsMaintainsVariableVariants();
	}.bind(this));
};
oFF.OlapEnvVarProcessor.prototype.getMetaValue = oFF.noSupport;
oFF.OlapEnvVarProcessor.prototype.getExtensions = function()
{
	return null;
};
oFF.OlapEnvVarProcessor.prototype.getExtensionByName = function(key)
{
	return null;
};
oFF.OlapEnvVarProcessor.prototype.getChangedPropertiesInDetail = function()
{
	return null;
};
oFF.OlapEnvVarProcessor.prototype.setUseSavedPromptsForExitVariables = function(disableExitVariables)
{
	oFF.XStream.of(this.getOlapEnv().getAllAreaQueryManager()).forEach( function(qm){
		qm.setUseSavedPromptsForExitVariables(disableExitVariables);
	}.bind(this));
};
oFF.OlapEnvVarProcessor.prototype.isUsingSavedPromptsForExitVariables = function()
{
	return false;
};
oFF.OlapEnvVarProcessor.prototype.canMaterializeCompleteObject = function()
{
	return false;
};
oFF.OlapEnvVarProcessor.prototype.canHaveExtensions = function()
{
	return false;
};
oFF.OlapEnvVarProcessor.prototype.hasPropertyChangedForInAData = function(propertyName)
{
	return false;
};
oFF.OlapEnvVarProcessor.prototype.getChangedPropertiesFromModellerMetadata = function()
{
	return null;
};

oFF.BlendableResultSetContainer = function() {};
oFF.BlendableResultSetContainer.prototype = new oFF.ResultSetContainer();
oFF.BlendableResultSetContainer.prototype._ff_c = "BlendableResultSetContainer";

oFF.BlendableResultSetContainer.createBlendableResultSetContainer = function(blendableQueryManager, previousRuntimeBlendedQueryManager, lastModCounterState)
{
	var rsContainer = new oFF.BlendableResultSetContainer();
	rsContainer.setupBlendableResultSetContainer(blendableQueryManager);
	rsContainer.m_runtimeQueryManager = previousRuntimeBlendedQueryManager;
	rsContainer.m_lastModCounterState = lastModCounterState;
	return rsContainer;
};
oFF.BlendableResultSetContainer.prototype.m_runtimeQueryManager = null;
oFF.BlendableResultSetContainer.prototype.m_blendingProcess = null;
oFF.BlendableResultSetContainer.prototype.m_lastModCounterState = null;
oFF.BlendableResultSetContainer.prototype.setupBlendableResultSetContainer = function(blendableQueryManager)
{
	oFF.ResultSetContainer.prototype.setupContainer.call( this , blendableQueryManager, null, null, null, null);
};
oFF.BlendableResultSetContainer.prototype.releaseObject = function()
{
	this.m_runtimeQueryManager = null;
	this.m_lastModCounterState = oFF.XObjectExt.release(this.m_lastModCounterState);
	this.m_blendingProcess = oFF.XObjectExt.release(this.m_blendingProcess);
	oFF.ResultSetContainer.prototype.releaseObject.call( this );
};
oFF.BlendableResultSetContainer.prototype.getCursorResultSet = function()
{
	if (oFF.isNull(this.m_cursorResultSetInSync))
	{
		var syncState = this.getSyncState();
		if (syncState === oFF.SyncState.PROCESSING)
		{
			throw oFF.XException.createIllegalStateException("Cannot retrieve the resultset while processing");
		}
		if (syncState === oFF.SyncState.OUT_OF_SYNC)
		{
			var blendableQueryManager = this.getActionContext();
			if (oFF.isNull(this.m_blendingProcess) || this.m_blendingProcess.isSyncCanceled())
			{
				this.m_blendingProcess = oFF.XObjectExt.release(this.m_blendingProcess);
				var configs = blendableQueryManager.getBlendingProcessConfigs(this);
				if (this.hasErrors())
				{
					return null;
				}
				this.m_blendingProcess = oFF.BlendingProcess.create(blendableQueryManager, configs, this.m_runtimeQueryManager, this.m_lastModCounterState, false);
			}
			var processBlendQueryManagerCreation = this.m_blendingProcess.processBlendedQueryManagerCreation(oFF.SyncType.BLOCKING, null, null);
			this.m_runtimeQueryManager = processBlendQueryManagerCreation.getData();
			if (this.m_runtimeQueryManager.getInitSettings().getMode() === oFF.QueryManagerMode.BLENDING)
			{
				this.m_blendingProcess.prepareQueryExecution();
				oFF.ResultSetContainer.prototype.processExecution.call( this , oFF.SyncType.BLOCKING, null, null);
				this.m_blendingProcess.postQueryExecution();
			}
			else
			{
				oFF.ResultSetContainer.prototype.processExecution.call( this , oFF.SyncType.BLOCKING, null, null);
			}
		}
	}
	return oFF.XWeakReferenceUtil.getHardRef(this.m_cursorResultSetInSync);
};
oFF.BlendableResultSetContainer.prototype.processExecution = function(syncType, listener, customIdentifier)
{
	this.attachListener(listener, oFF.ListenerType.SPECIFIC, customIdentifier);
	if (this.getSyncState().isTypeOf(oFF.SyncState.IN_SYNC))
	{
		this.endSync();
	}
	else
	{
		var blendableQueryManager = this.getActionContext();
		if (oFF.isNull(this.m_blendingProcess) || this.m_blendingProcess.isSyncCanceled())
		{
			this.m_blendingProcess = oFF.XObjectExt.release(this.m_blendingProcess);
			var blendingProcessConfigs = blendableQueryManager.getBlendingProcessConfigs(this);
			if (this.hasErrors())
			{
				this.endSync();
			}
			else
			{
				this.m_blendingProcess = oFF.BlendingProcess.create(blendableQueryManager, blendingProcessConfigs, this.m_runtimeQueryManager, this.m_lastModCounterState, false);
				this.m_blendingProcess.processBlendedQueryManagerCreation(syncType, this, customIdentifier);
			}
		}
	}
	return this;
};
oFF.BlendableResultSetContainer.prototype._resetSyncStateInternal = function(enforce)
{
	if (enforce || this.getSyncState().isInSync())
	{
		this.m_blendingProcess = oFF.XObjectExt.release(this.m_blendingProcess);
		this.m_runtimeQueryManager = oFF.XObjectExt.release(this.m_runtimeQueryManager);
		this.m_lastModCounterState = oFF.XObjectExt.release(this.m_lastModCounterState);
	}
	oFF.ResultSetContainer.prototype._resetSyncStateInternal.call( this , enforce);
};
oFF.BlendableResultSetContainer.prototype.onQueryManagerCreated = function(extResult, queryManager, customIdentifier)
{
	this.addAllMessages(extResult);
	if (!extResult.hasErrors())
	{
		this.m_runtimeQueryManager = queryManager;
		this.m_blendingProcess.prepareQueryExecution();
		this.m_runtimeQueryManager.processQueryExecution(this.getActiveSyncType(), this, customIdentifier);
	}
	else
	{
		this.endSync();
	}
};
oFF.BlendableResultSetContainer.prototype.onQueryExecuted = function(extResult, resultSetContainer, customIdentifier)
{
	this.m_blendingProcess.postQueryExecution();
	this.addAllMessages(extResult);
	this.setData(resultSetContainer);
	this.endSync();
};
oFF.BlendableResultSetContainer.prototype.getContext = function()
{
	return this.m_runtimeQueryManager;
};
oFF.BlendableResultSetContainer.prototype.getRuntimeQueryManager = function()
{
	return this.m_runtimeQueryManager;
};
oFF.BlendableResultSetContainer.prototype.getBlendingProcess = function()
{
	return this.m_blendingProcess;
};

oFF.BlendedDimensionInfo = function() {};
oFF.BlendedDimensionInfo.prototype = new oFF.QModelComponent();
oFF.BlendedDimensionInfo.prototype._ff_c = "BlendedDimensionInfo";

oFF.BlendedDimensionInfo.createBlendedDimensionInfo = function(datasetId, dimensionName)
{
	var blendedDimensionInfo = new oFF.BlendedDimensionInfo();
	blendedDimensionInfo.m_datasetId = datasetId;
	blendedDimensionInfo.m_dimensionName = dimensionName;
	return blendedDimensionInfo;
};
oFF.BlendedDimensionInfo.prototype.m_dimensionName = null;
oFF.BlendedDimensionInfo.prototype.m_datasetId = null;
oFF.BlendedDimensionInfo.prototype.m_initialDrillLevel = null;
oFF.BlendedDimensionInfo.prototype.releaseObject = function()
{
	oFF.QModelComponent.prototype.releaseObject.call( this );
	this.m_datasetId = null;
	this.m_dimensionName = null;
	this.m_initialDrillLevel = null;
};
oFF.BlendedDimensionInfo.prototype.cloneExt = function(flags)
{
	var copyBlendedDimensionInfo = oFF.BlendedDimensionInfo.createBlendedDimensionInfo(this.getDatasetId(), this.getDimensionName());
	copyBlendedDimensionInfo.copyFrom(this, null);
	return copyBlendedDimensionInfo;
};
oFF.BlendedDimensionInfo.prototype.copyFromInternal = function(other, flags)
{
	oFF.QModelComponent.prototype.copyFromInternal.call( this , other, flags);
	var otherBlendedDimensionInfo = other;
	this.m_datasetId = otherBlendedDimensionInfo.getDatasetId();
	this.m_dimensionName = otherBlendedDimensionInfo.getDimensionName();
	if (otherBlendedDimensionInfo.getInitialDrillLevel() !== null)
	{
		this.m_initialDrillLevel = oFF.XIntegerValue.create(otherBlendedDimensionInfo.getInitialDrillLevel().getInteger());
	}
	else
	{
		this.m_initialDrillLevel = null;
	}
};
oFF.BlendedDimensionInfo.prototype.getDatasetId = function()
{
	return this.m_datasetId;
};
oFF.BlendedDimensionInfo.prototype.getDimensionName = function()
{
	return this.m_dimensionName;
};
oFF.BlendedDimensionInfo.prototype.getInitialDrillLevel = function()
{
	return this.m_initialDrillLevel;
};
oFF.BlendedDimensionInfo.prototype.setInitialDrillLevel = function(initialDrillLevel)
{
	this.m_initialDrillLevel = oFF.XIntegerValue.create(initialDrillLevel);
};

oFF.BlendedDrillInfo = function() {};
oFF.BlendedDrillInfo.prototype = new oFF.QModelComponent();
oFF.BlendedDrillInfo.prototype._ff_c = "BlendedDrillInfo";

oFF.BlendedDrillInfo.createBlendedDimensionDrillInfo = function(blendableQueryManager, datasetId, dimensionName)
{
	var blendedDimensionDrillInfo = new oFF.BlendedDrillInfo();
	blendedDimensionDrillInfo.setupModelComponent(blendableQueryManager, blendableQueryManager);
	blendedDimensionDrillInfo.m_blendedDrillPathElementInfos = oFF.XList.create();
	blendedDimensionDrillInfo.m_dimensionName = dimensionName;
	blendedDimensionDrillInfo.m_datasetId = datasetId;
	return blendedDimensionDrillInfo;
};
oFF.BlendedDrillInfo.prototype.m_dimensionName = null;
oFF.BlendedDrillInfo.prototype.m_datasetId = null;
oFF.BlendedDrillInfo.prototype.m_blendedDrillPathElementInfos = null;
oFF.BlendedDrillInfo.prototype.m_drillState = null;
oFF.BlendedDrillInfo.prototype.releaseObject = function()
{
	oFF.QModelComponent.prototype.releaseObject.call( this );
	this.m_dimensionName = null;
	this.m_datasetId = null;
	this.m_blendedDrillPathElementInfos = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_blendedDrillPathElementInfos);
	this.m_drillState = null;
};
oFF.BlendedDrillInfo.prototype.copyFromInternal = function(other, flags)
{
	var otherBlendedDrillInfo = other;
	this.m_dimensionName = otherBlendedDrillInfo.getDimensionName();
	this.m_datasetId = otherBlendedDrillInfo.getDatasetId();
	oFF.XCollectionUtils.addAllClones(this.m_blendedDrillPathElementInfos, otherBlendedDrillInfo.getBlendedDrillPathElementInfos());
	this.m_drillState = otherBlendedDrillInfo.getDrillState();
};
oFF.BlendedDrillInfo.prototype.cloneOlapComponent = function(context, parent)
{
	var newBlendedDrillInfo = oFF.BlendedDrillInfo.createBlendedDimensionDrillInfo(this.getContext(), this.m_datasetId, this.m_dimensionName);
	newBlendedDrillInfo.copyFrom(this, null);
	return newBlendedDrillInfo;
};
oFF.BlendedDrillInfo.prototype.getDimensionName = function()
{
	return this.m_dimensionName;
};
oFF.BlendedDrillInfo.prototype.getDatasetId = function()
{
	return this.m_datasetId;
};
oFF.BlendedDrillInfo.prototype.getDrillState = function()
{
	return this.m_drillState;
};
oFF.BlendedDrillInfo.prototype.setDrillState = function(drillstate)
{
	this.m_drillState = drillstate;
	this.notifyNodeChanged();
};
oFF.BlendedDrillInfo.prototype.getBlendedDrillPathElementInfos = function()
{
	return this.m_blendedDrillPathElementInfos;
};
oFF.BlendedDrillInfo.prototype.addBlendedDrillPathElementInfo = function(datasetId, dimensionName, selectValue)
{
	this.m_blendedDrillPathElementInfos.add(oFF.BlendedDrillPathElementInfo.createBlendedDrillPathElementInfo(datasetId, dimensionName, selectValue));
	this.notifyNodeChanged();
};
oFF.BlendedDrillInfo.prototype.removeBlendedDrillPathElementInfo = function(blendedDrillPathElementInfo)
{
	this.m_blendedDrillPathElementInfos.removeElement(blendedDrillPathElementInfo);
	this.notifyNodeChanged();
};
oFF.BlendedDrillInfo.prototype.clearBlendedDrillPathElementInfos = function()
{
	this.m_blendedDrillPathElementInfos.clear();
	this.notifyNodeChanged();
};

oFF.QBlendingSortContainer = function() {};
oFF.QBlendingSortContainer.prototype = new oFF.QModelComponent();
oFF.QBlendingSortContainer.prototype._ff_c = "QBlendingSortContainer";

oFF.QBlendingSortContainer.create = function(blendableQueryManager)
{
	var sortContainer = new oFF.QBlendingSortContainer();
	sortContainer.setupModelComponent(blendableQueryManager, blendableQueryManager);
	sortContainer.m_blendableDimensionSorts = oFF.QModelComponentList.createModelComponentList(blendableQueryManager, sortContainer, true, "Blendable Dimension Sorts");
	sortContainer.setIsDefaultOrder(false);
	return sortContainer;
};
oFF.QBlendingSortContainer.prototype.m_blendableDimensionSorts = null;
oFF.QBlendingSortContainer.prototype.m_primaryMeasureSort = null;
oFF.QBlendingSortContainer.prototype.m_isDefaultOrder = false;
oFF.QBlendingSortContainer.prototype.copyFromInternal = function(other, flags)
{
	var origin = other;
	this.m_blendableDimensionSorts.clear();
	var blendableDimensionSortsIterator = origin.m_blendableDimensionSorts.getIterator();
	while (blendableDimensionSortsIterator.hasNext())
	{
		var blendableDimensionSort = blendableDimensionSortsIterator.next();
		var dimensionSort = oFF.QFactory.createBlendableDimensionSort(blendableDimensionSort.getFieldName(), blendableDimensionSort.getDatasetId(), blendableDimensionSort.getSortDirection(), blendableDimensionSort.getPreserveGrouping(), blendableDimensionSort.getContextLanguage());
		dimensionSort.copyFrom(blendableDimensionSort, null);
		this.updateBlendableDimensionSort(dimensionSort);
	}
	if (origin.getPrimaryBlendableMeasureMemberSort() !== null)
	{
		var measureSort = origin.getPrimaryBlendableMeasureMemberSort();
		this.m_primaryMeasureSort = oFF.BlendableMeasureMemberSort.createBlendableMeasureSort(this);
		this.m_primaryMeasureSort.copyFrom(measureSort, null);
	}
	this.m_isDefaultOrder = origin.isDefaultOrder();
};
oFF.QBlendingSortContainer.prototype.releaseObject = function()
{
	this.m_blendableDimensionSorts = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_blendableDimensionSorts);
	this.m_primaryMeasureSort = oFF.XObjectExt.release(this.m_primaryMeasureSort);
	oFF.QModelComponent.prototype.releaseObject.call( this );
};
oFF.QBlendingSortContainer.prototype.shouldAddOrUpdateDimensionSort = function(field, datasetId, sortDirection, preserveGrouping)
{
	var blendableQueryManager = this.getParent();
	var blendableDimensionSort = this.m_blendableDimensionSorts.getByKey(oFF.QSortUtils.getBlendableDimensionSortMapKey(field.getName(), datasetId));
	var isNewBlendableDimensionSort = oFF.isNull(blendableDimensionSort) || sortDirection !== blendableDimensionSort.getSortDirection() || preserveGrouping !== blendableDimensionSort.getPreserveGrouping();
	var isFromPrimary = oFF.XString.isEqual(datasetId, blendableQueryManager.getPrimaryQueryManager().getQueryModel().getDatasetId());
	var isFromLinkedDimension = oFF.BlendingUtils.isDimensionFromLinkedDimension(blendableQueryManager, field.getDimension().getName(), datasetId);
	return isNewBlendableDimensionSort && (isFromPrimary || !isFromLinkedDimension);
};
oFF.QBlendingSortContainer.prototype.updateBlendableDimensionSort = function(dimensionSort)
{
	var blendableQueryManager = this.getParent();
	var datasetId = dimensionSort.getDatasetId();
	var fieldName = dimensionSort.getFieldName();
	var sortDirection = dimensionSort.getSortDirection();
	var preserveGrouping = dimensionSort.getPreserveGrouping();
	var queryManager = blendableQueryManager.getQueryManagerByDatasetId(datasetId);
	var queryModel = oFF.notNull(queryManager) ? queryManager.getQueryModel() : null;
	var field = oFF.notNull(queryModel) ? queryModel.getFieldByName(fieldName) : null;
	if (oFF.notNull(field) && this.shouldAddOrUpdateDimensionSort(field, datasetId, sortDirection, preserveGrouping))
	{
		this.removeBlendableDimensionSort(fieldName, datasetId);
		if (this.getPrimaryBlendableMeasureMemberSort() !== null)
		{
			this.clearPrimaryBlendableMemberMeasureSort();
		}
		this.m_blendableDimensionSorts.add(dimensionSort);
	}
};
oFF.QBlendingSortContainer.prototype.addBlendableDimensionSort = function(fieldName, datasetId, sortDirection, preserveGrouping)
{
	var blendableQueryManager = this.getParent();
	var queryManager = blendableQueryManager.getQueryManagerByDatasetId(datasetId);
	var queryModel = oFF.notNull(queryManager) ? queryManager.getQueryModel() : null;
	var field = oFF.notNull(queryModel) ? queryModel.getFieldByName(fieldName) : null;
	if (oFF.notNull(field) && this.shouldAddOrUpdateDimensionSort(field, datasetId, sortDirection, preserveGrouping))
	{
		this.removeBlendableDimensionSort(fieldName, datasetId);
		if (this.getPrimaryBlendableMeasureMemberSort() !== null)
		{
			this.clearPrimaryBlendableMemberMeasureSort();
		}
		this.m_blendableDimensionSorts.add(oFF.BlendableDimensionSort.createBlendableDimensionSort(fieldName, datasetId, sortDirection, preserveGrouping));
	}
};
oFF.QBlendingSortContainer.prototype.removeBlendableDimensionSort = function(fieldName, datasetId)
{
	var blendableDimensionSort = this.m_blendableDimensionSorts.getByKey(oFF.QSortUtils.getBlendableDimensionSortMapKey(fieldName, datasetId));
	if (oFF.notNull(blendableDimensionSort))
	{
		this.m_blendableDimensionSorts.removeElement(blendableDimensionSort);
		oFF.XObjectExt.release(blendableDimensionSort);
	}
};
oFF.QBlendingSortContainer.prototype.clearBlendableDimensionSorts = function()
{
	if (this.m_blendableDimensionSorts.size() > 0)
	{
		oFF.XCollectionUtils.releaseEntriesFromCollection(this.m_blendableDimensionSorts);
		this.m_blendableDimensionSorts.clear();
	}
};
oFF.QBlendingSortContainer.prototype.getBlendableDimensionSorts = function()
{
	return this.m_blendableDimensionSorts;
};
oFF.QBlendingSortContainer.prototype.setPrimaryBlendableMeasureMemberSort = function(measureMemberName, datasetId, sortDirection)
{
	var blendableMeasureMemberSort = this.getPrimaryBlendableMeasureMemberSort();
	var isNewBlendableMeasureMemberSort = oFF.isNull(blendableMeasureMemberSort) || !oFF.XString.isEqual(measureMemberName, blendableMeasureMemberSort.getMeasureMemberName()) || !oFF.XString.isEqual(datasetId, blendableMeasureMemberSort.getDatasetId()) || sortDirection !== blendableMeasureMemberSort.getSortDirection();
	var isValidSort = false;
	var blendableQueryManager = this.getParent();
	if (oFF.notNull(datasetId))
	{
		var queryManager = blendableQueryManager.getQueryManagerByDatasetId(datasetId);
		var queryModel = oFF.notNull(queryManager) ? queryManager.getQueryModel() : null;
		var primaryCalculationDimension = oFF.notNull(queryModel) ? queryModel.getPrimaryCalculationDimension() : null;
		isValidSort = oFF.notNull(primaryCalculationDimension) && (primaryCalculationDimension.getStructureMember(measureMemberName) !== null || primaryCalculationDimension.getDimensionMember(measureMemberName) !== null);
	}
	else
	{
		isValidSort = oFF.XCollectionUtils.contains(blendableQueryManager.getPrimaryBlendedMeasures(),  function(blendedMeasure){
			return oFF.XString.isEqual(blendedMeasure.getName(), measureMemberName);
		}.bind(this));
	}
	if (isNewBlendableMeasureMemberSort && isValidSort)
	{
		this.m_primaryMeasureSort = oFF.BlendableMeasureMemberSort.createBlendableMeasureSort(this);
		this.m_primaryMeasureSort.setPrimaryMeasure(measureMemberName, datasetId, false);
		this.m_primaryMeasureSort.setSortDirection(sortDirection);
		this.notifyNodeChanged();
	}
};
oFF.QBlendingSortContainer.prototype.clearPrimaryBlendableMemberMeasureSort = function()
{
	this.m_primaryMeasureSort = oFF.XObjectExt.release(this.m_primaryMeasureSort);
	this.notifyNodeChanged();
};
oFF.QBlendingSortContainer.prototype.getPrimaryBlendableMeasureMemberSort = function()
{
	return this.m_primaryMeasureSort;
};
oFF.QBlendingSortContainer.prototype.setBlendableMeasureMemberSort = function(blendableMeasureSort)
{
	this.m_primaryMeasureSort = blendableMeasureSort;
	this.notifyNodeChanged();
};
oFF.QBlendingSortContainer.prototype.getBlendableMeasureMemberSort = function()
{
	return this.m_primaryMeasureSort;
};
oFF.QBlendingSortContainer.prototype.isDefaultOrder = function()
{
	return this.m_isDefaultOrder;
};
oFF.QBlendingSortContainer.prototype.setIsDefaultOrder = function(isDefaultOrder)
{
	this.m_isDefaultOrder = isDefaultOrder;
};

oFF.QLightweightDataAreaCommand = function() {};
oFF.QLightweightDataAreaCommand.prototype = new oFF.QModelComponent();
oFF.QLightweightDataAreaCommand.prototype._ff_c = "QLightweightDataAreaCommand";

oFF.QLightweightDataAreaCommand.create = function(context, parent, commandType)
{
	var instance = new oFF.QLightweightDataAreaCommand();
	instance.setupModelComponent(context, parent);
	instance.setPlanningContextCommandType(commandType);
	return instance;
};
oFF.QLightweightDataAreaCommand.prototype.m_synchronizationType = null;
oFF.QLightweightDataAreaCommand.prototype.m_extPlanningCommandResult = null;
oFF.QLightweightDataAreaCommand.prototype.m_planningContextCommandType = null;
oFF.QLightweightDataAreaCommand.prototype.m_commandResult = null;
oFF.QLightweightDataAreaCommand.prototype.m_invalidatingResultSet = false;
oFF.QLightweightDataAreaCommand.prototype.getResult = function()
{
	return this.m_commandResult;
};
oFF.QLightweightDataAreaCommand.prototype.setPlanningContextCommandType = function(commandType)
{
	this.m_planningContextCommandType = commandType;
	this.m_invalidatingResultSet = commandType.isInvalidatingResultSet();
};
oFF.QLightweightDataAreaCommand.prototype.getOlapComponentType = function()
{
	return oFF.OlapComponentType.LIGHTWEIGHT_DATA_AREA_COMMAND;
};
oFF.QLightweightDataAreaCommand.prototype.getDataArea = function()
{
	return this.getPlanningContext();
};
oFF.QLightweightDataAreaCommand.prototype.createCommandResultInstance = function()
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
oFF.QLightweightDataAreaCommand.prototype.setResult = function(result)
{
	this.m_commandResult = result;
};
oFF.QLightweightDataAreaCommand.prototype.createCommandResultInstanceInternal = function()
{
	return new oFF.QLightweightDataAreaCommandResult();
};
oFF.QLightweightDataAreaCommand.prototype.processCommand = function(synchronizationType, callback, customIdentifier)
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
oFF.QLightweightDataAreaCommand.prototype.createCommandResult = function(callback, customIdentifier)
{
	var commandResult = this.createCommandResultInstance();
	commandResult.setCustomIdentifier(customIdentifier);
	commandResult.setPlanningCommand(this);
	commandResult.setPlanningCommandCallback(callback);
	return commandResult;
};
oFF.QLightweightDataAreaCommand.prototype.getServicePath = function()
{
	var connection = this.getQueryManagerBase().getConnection();
	var systemDescription = connection.getSystemDescription();
	var serverMetadata = connection.getSystemConnect().getServerMetadata();
	var capabilities = serverMetadata.getMetadataForService(oFF.ServerService.ANALYTIC);
	var fastPath = capabilities.getByKey(oFF.InACapabilities.C032_FAST_PATH);
	if (oFF.notNull(fastPath) && fastPath.getValue() !== null)
	{
		return fastPath.getValue();
	}
	return systemDescription.getSystemType().getInAPath();
};
oFF.QLightweightDataAreaCommand.prototype.doProcessCommand = function(synchronizationType, planningCommandResult)
{
	var connection = this.getQueryManagerBase().getConnection();
	var servicePath = this.getServicePath();
	var ocpFunction = connection.newRpcFunction(servicePath);
	var request = ocpFunction.getRpcRequest();
	var requestStructure = this.serializeToElement(oFF.QModelFormat.INA_DATA);
	request.setRequestStructure(requestStructure);
	ocpFunction.processFunctionExecution(synchronizationType, this, planningCommandResult);
};
oFF.QLightweightDataAreaCommand.prototype.onFunctionExecuted = function(extResult, response, customIdentifier)
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
		var messageManager = oFF.MessageManager.createMessageManagerExt(this.getSession());
		messageManager.addAllMessages(this.deserializeFromElementExt(oFF.QModelFormat.INA_DATA, responseStructure));
		extPlanningCommandResult = oFF.ExtResult.create(planningCommandResult, messageManager);
	}
	this.onCommandExecuted(extPlanningCommandResult);
};
oFF.QLightweightDataAreaCommand.prototype.onCommandExecuted = function(extPlanningCommandResult)
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
oFF.QLightweightDataAreaCommand.prototype.isInvalidatingResultSet = function()
{
	return this.m_invalidatingResultSet;
};
oFF.QLightweightDataAreaCommand.prototype.setInvalidatingResultSet = function(invalidating)
{
	this.m_invalidatingResultSet = invalidating;
	return this;
};
oFF.QLightweightDataAreaCommand.prototype.setConnection = oFF.noSupport;
oFF.QLightweightDataAreaCommand.prototype.getCommandType = function()
{
	return oFF.PlanningCommandType.DATA_AREA_COMMAND;
};
oFF.QLightweightDataAreaCommand.prototype.getPlanningContext = function()
{
	return null;
};
oFF.QLightweightDataAreaCommand.prototype.getPlanningContextCommandType = function()
{
	return this.m_planningContextCommandType;
};
oFF.QLightweightDataAreaCommand.prototype.onCommandProcessed = function(extPlanningCommandResult)
{
	this.m_extPlanningCommandResult = extPlanningCommandResult;
};
oFF.QLightweightDataAreaCommand.prototype.onSuccessfulCommand = function()
{
	if (this.isInvalidatingResultSet())
	{
		this.getQueryManager().invalidateState();
	}
};

oFF.QLightweightDataAreaCommandResult = function() {};
oFF.QLightweightDataAreaCommandResult.prototype = new oFF.QModelComponent();
oFF.QLightweightDataAreaCommandResult.prototype._ff_c = "QLightweightDataAreaCommandResult";

oFF.QLightweightDataAreaCommandResult.EXECUTED = "EXECUTED";
oFF.QLightweightDataAreaCommandResult.prototype.m_customIdentifier = null;
oFF.QLightweightDataAreaCommandResult.prototype.m_lightweightDataAreaCommand = null;
oFF.QLightweightDataAreaCommandResult.prototype.m_planningCommandCallback = null;
oFF.QLightweightDataAreaCommandResult.prototype.m_executed = false;
oFF.QLightweightDataAreaCommandResult.prototype.getDataAreaCommand = function()
{
	return this.getPlanningCommand();
};
oFF.QLightweightDataAreaCommandResult.prototype.isExecuted = function()
{
	return this.m_executed;
};
oFF.QLightweightDataAreaCommandResult.prototype.setExecuted = function(executed)
{
	this.m_executed = executed;
};
oFF.QLightweightDataAreaCommandResult.prototype.getPlanningCommand = function()
{
	return this.m_lightweightDataAreaCommand;
};
oFF.QLightweightDataAreaCommandResult.prototype.getCustomIdentifier = function()
{
	return this.m_customIdentifier;
};
oFF.QLightweightDataAreaCommandResult.prototype.getPlanningCommandCallback = function()
{
	return this.m_planningCommandCallback;
};
oFF.QLightweightDataAreaCommandResult.prototype.getPlanningContextCommand = function()
{
	return this.m_lightweightDataAreaCommand;
};
oFF.QLightweightDataAreaCommandResult.prototype.setCustomIdentifier = function(customIdentifier)
{
	this.m_customIdentifier = customIdentifier;
};
oFF.QLightweightDataAreaCommandResult.prototype.setPlanningCommand = function(lightweightDataAreaCommand)
{
	this.m_lightweightDataAreaCommand = lightweightDataAreaCommand;
};
oFF.QLightweightDataAreaCommandResult.prototype.setPlanningCommandCallback = function(callback)
{
	this.m_planningCommandCallback = callback;
};

oFF.OlapEnvUpdateAction = function() {};
oFF.OlapEnvUpdateAction.prototype = new oFF.QOlapSyncAction();
oFF.OlapEnvUpdateAction.prototype._ff_c = "OlapEnvUpdateAction";

oFF.OlapEnvUpdateAction.createAndRunUpdateDynamicValues = function(parent, syncType, listener, customIdentifier, overwriteDefaultForInputEnabledVar)
{
	var newObject = new oFF.OlapEnvUpdateAction();
	newObject.m_overwriteDefaultForInputEnabledVar = overwriteDefaultForInputEnabledVar;
	newObject.setupVarActionAndRun(syncType, parent, listener, customIdentifier);
	return newObject;
};
oFF.OlapEnvUpdateAction.prototype.m_finishedCount = 0;
oFF.OlapEnvUpdateAction.prototype.m_affectedVarProcessors = null;
oFF.OlapEnvUpdateAction.prototype.m_overwriteDefaultForInputEnabledVar = false;
oFF.OlapEnvUpdateAction.prototype.releaseObject = function()
{
	this.m_affectedVarProcessors = oFF.XObjectExt.release(this.m_affectedVarProcessors);
	oFF.QOlapSyncAction.prototype.releaseObject.call( this );
};
oFF.OlapEnvUpdateAction.prototype.setupVarActionAndRun = function(syncType, context, listener, customIdentifier)
{
	oFF.QOlapSyncAction.prototype.setupActionAndRun.call( this , syncType, listener, customIdentifier, context);
};
oFF.OlapEnvUpdateAction.prototype.processSynchronization = function(syncType)
{
	var varProc = this.getActionContext();
	var allHanaProcessors = varProc.getSelectedVariableProcessors(oFF.VariableProcessorState.CHANGEABLE_DIRECT_VALUE_TRANSFER);
	var allBWProcessors = varProc.getAllBWVariableProcessors();
	var finalList = oFF.XList.create();
	finalList.addAll(allBWProcessors);
	finalList.addAll(allHanaProcessors);
	this.m_affectedVarProcessors = finalList;
	if (this.m_affectedVarProcessors.isEmpty())
	{
		this.addWarning(oFF.ErrorCodes.NO_VARIABLE_PROCESSOR_AFFECTED, "No affected variable processor was found.");
		return false;
	}
	var activeSyncType = this.getActiveSyncType();
	for (var i = 0; i < this.m_affectedVarProcessors.size(); i++)
	{
		var variableProcessor = this.m_affectedVarProcessors.get(i);
		variableProcessor.resetExitOrUpdateDynamicVariable(activeSyncType, this, null, this.m_overwriteDefaultForInputEnabledVar);
	}
	return true;
};
oFF.OlapEnvUpdateAction.prototype.onQueryExecuted = function(extResult, resultSetContainer, customIdentifier)
{
	this.addAllMessages(extResult);
	this.m_finishedCount++;
	if (this.m_finishedCount >= this.m_affectedVarProcessors.size())
	{
		this.endSync();
	}
};
oFF.OlapEnvUpdateAction.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onQueryExecuted(extResult, data, customIdentifier);
};

oFF.OlapEnvVarAction = function() {};
oFF.OlapEnvVarAction.prototype = new oFF.QOlapSyncAction();
oFF.OlapEnvVarAction.prototype._ff_c = "OlapEnvVarAction";

oFF.OlapEnvVarAction.createAndRunVariantActivation = function(parent, syncType, listener, customIdentifier, variableVariant)
{
	var newObject = new oFF.OlapEnvVarAction();
	newObject.m_activeVariant = variableVariant;
	newObject.setupVarActionAndRun(syncType, parent, listener, customIdentifier, oFF.VariableProcessorState.PROCESSING_VARIANT_ACTIVATION);
	return newObject;
};
oFF.OlapEnvVarAction.createAndRunSubmit = function(parent, syncType, listener, customIdentifier)
{
	var newObject = new oFF.OlapEnvVarAction();
	newObject.setupVarActionAndRun(syncType, parent, listener, customIdentifier, oFF.VariableProcessorState.PROCESSING_SUBMIT);
	return newObject;
};
oFF.OlapEnvVarAction.createAndRunCancel = function(parent, syncType, listener, customIdentifier)
{
	var newObject = new oFF.OlapEnvVarAction();
	newObject.setupVarActionAndRun(syncType, parent, listener, customIdentifier, oFF.VariableProcessorState.PROCESSING_CANCEL);
	return newObject;
};
oFF.OlapEnvVarAction.createAndRunCheck = function(parent, syncType, listener, customIdentifier)
{
	var newObject = new oFF.OlapEnvVarAction();
	newObject.setupVarActionAndRun(syncType, parent, listener, customIdentifier, oFF.VariableProcessorState.PROCESSING_CHECK);
	return newObject;
};
oFF.OlapEnvVarAction.createAndRunReInitAfterSubmit = function(parent, syncType, listener, customIdentifier)
{
	var newObject = new oFF.OlapEnvVarAction();
	newObject.setupVarActionAndRun(syncType, parent, listener, customIdentifier, oFF.VariableProcessorState.PROCESSING_REINIT);
	return newObject;
};
oFF.OlapEnvVarAction.createAndRunSetGetValues = function(parent, syncType, listener, customIdentifier)
{
	var newObject = new oFF.OlapEnvVarAction();
	newObject.setupVarActionAndRun(syncType, parent, listener, customIdentifier, oFF.VariableProcessorState.PROCESSING_UPDATE_VALUES);
	return newObject;
};
oFF.OlapEnvVarAction.createAndRunEmptyVariableDefinition = function(parent, syncType, listener, customIdentifier)
{
	var newObject = new oFF.OlapEnvVarAction();
	newObject.setupVarActionAndRun(syncType, parent, listener, customIdentifier, oFF.VariableProcessorState.PROCESSING_EMPTY_VARIABLE_DEFINITION);
	return newObject;
};
oFF.OlapEnvVarAction.prototype.m_actionState = null;
oFF.OlapEnvVarAction.prototype.m_finishedCount = 0;
oFF.OlapEnvVarAction.prototype.m_affectedVarProcessors = null;
oFF.OlapEnvVarAction.prototype.m_activeVariant = null;
oFF.OlapEnvVarAction.prototype.releaseObject = function()
{
	this.m_actionState = null;
	this.m_affectedVarProcessors = oFF.XObjectExt.release(this.m_affectedVarProcessors);
	this.m_activeVariant = null;
	oFF.QOlapSyncAction.prototype.releaseObject.call( this );
};
oFF.OlapEnvVarAction.prototype.setupVarActionAndRun = function(syncType, context, listener, customIdentifier, state)
{
	this.m_actionState = state;
	oFF.QOlapSyncAction.prototype.setupActionAndRun.call( this , syncType, listener, customIdentifier, context);
};
oFF.OlapEnvVarAction.prototype.processSynchronization = function(syncType)
{
	this.setData(this);
	var varProc = this.getActionContext();
	if (this.m_actionState === oFF.VariableProcessorState.PROCESSING_SUBMIT || this.m_actionState === oFF.VariableProcessorState.PROCESSING_AUTO_SUBMIT)
	{
		varProc.syncVariableValues();
		this.m_affectedVarProcessors = varProc.getSelectedVariableProcessors(oFF.VariableProcessorState.CHANGEABLE_STATEFUL);
	}
	else if (this.m_actionState === oFF.VariableProcessorState.PROCESSING_CANCEL)
	{
		this.m_affectedVarProcessors = varProc.getSelectedVariableProcessors(oFF.VariableProcessorState.CHANGEABLE_STATEFUL);
	}
	else if (this.m_actionState === oFF.VariableProcessorState.PROCESSING_CHECK)
	{
		varProc.syncVariableValues();
		this.m_affectedVarProcessors = varProc.getSelectedVariableProcessors(oFF.VariableProcessorState.CHANGEABLE_STATEFUL);
	}
	else if (this.m_actionState === oFF.VariableProcessorState.PROCESSING_UPDATE_VALUES)
	{
		varProc.syncVariableValues();
		this.m_affectedVarProcessors = varProc.getSelectedVariableProcessors(oFF.VariableProcessorState.CHANGEABLE_STATEFUL);
	}
	else if (this.m_actionState === oFF.VariableProcessorState.PROCESSING_REINIT)
	{
		this.m_affectedVarProcessors = varProc.getSelectedVariableProcessors(oFF.VariableProcessorState.SUBMITTED);
	}
	else if (this.m_actionState === oFF.VariableProcessorState.PROCESSING_VARIANT_ACTIVATION)
	{
		this.m_affectedVarProcessors = varProc.getSelectedVariableProcessors(oFF.VariableProcessorState.CHANGEABLE_STATEFUL);
	}
	if (this.m_affectedVarProcessors.isEmpty())
	{
		this.addWarning(oFF.ErrorCodes.NO_VARIABLE_PROCESSOR_AFFECTED, "No affected variable processor was found.");
		return false;
	}
	var activeSyncType = this.getActiveSyncType();
	for (var i = 0; i < this.m_affectedVarProcessors.size(); i++)
	{
		var variableProcessor = this.m_affectedVarProcessors.get(i);
		if (this.m_actionState === oFF.VariableProcessorState.PROCESSING_SUBMIT)
		{
			variableProcessor.submitVariables(activeSyncType, this, null);
		}
		else if (this.m_actionState === oFF.VariableProcessorState.PROCESSING_CANCEL)
		{
			variableProcessor.cancelReInitVariables(activeSyncType, this, null);
		}
		else if (this.m_actionState === oFF.VariableProcessorState.PROCESSING_CHECK)
		{
			variableProcessor.checkVariables(activeSyncType, this, null);
		}
		else if (this.m_actionState === oFF.VariableProcessorState.PROCESSING_UPDATE_VALUES)
		{
			variableProcessor.transferVariables(activeSyncType, this, null);
		}
		else if (this.m_actionState === oFF.VariableProcessorState.PROCESSING_REINIT)
		{
			variableProcessor.reInitVariablesAfterSubmit(activeSyncType, this, null);
		}
		else if (this.m_actionState.isTypeOf(oFF.VariableProcessorState.PROCESSING_VARIANT_ACTIVATION))
		{
			variableProcessor.activateVariableVariant(this.m_activeVariant.clone(), activeSyncType, this, null);
		}
	}
	return true;
};
oFF.OlapEnvVarAction.prototype.onVariableProcessorExecuted = function(extResult, result, customIdentifier)
{
	this.addAllMessages(extResult);
	this.m_finishedCount++;
	if (this.m_finishedCount >= this.m_affectedVarProcessors.size())
	{
		this.endSync();
	}
};
oFF.OlapEnvVarAction.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onVariableProcessorExecuted(extResult, data, customIdentifier);
};
oFF.OlapEnvVarAction.prototype.isSuccessfullyProcessed = function()
{
	return this.getSyncState().isInSync() && this.isValid();
};

oFF.OlapFilterManager = function() {};
oFF.OlapFilterManager.prototype = new oFF.QModelComponent();
oFF.OlapFilterManager.prototype._ff_c = "OlapFilterManager";

oFF.OlapFilterManager.TAGGING_STORY_VARIABLES = "TAGGING_STORY_VARIABLES";
oFF.OlapFilterManager.TAGGING_VARIABLE_DIALOG_HAS_BEEN_SET = "TAGGING_VARIABLE_DIALOG_HAS_BEEN_SET";
oFF.OlapFilterManager.create = function(context)
{
	var filterManager = new oFF.OlapFilterManager();
	filterManager.setupExt(context);
	return filterManager;
};
oFF.OlapFilterManager.prototype.m_filters = null;
oFF.OlapFilterManager.prototype.m_prunedDimensions = null;
oFF.OlapFilterManager.prototype.m_flattenedComplexFilters = null;
oFF.OlapFilterManager.prototype.m_externalizeMeasureFilters = null;
oFF.OlapFilterManager.prototype.m_capabilities = null;
oFF.OlapFilterManager.prototype.setupExt = function(context)
{
	this.setupModelComponentWithName(context, null, "FilterManager");
	this.m_filters = oFF.XHashMapByString.create();
	this.m_prunedDimensions = oFF.XHashMapByString.create();
	this.m_externalizeMeasureFilters = oFF.XHashSetOfString.create();
	this.m_flattenedComplexFilters = oFF.XHashSetOfString.create();
	this.m_capabilities = oFF.QCapabilities.create();
	this.m_capabilities.setSupportsVisibilityFilter(true);
	this.m_capabilities.setSupportsComplexFilter(true);
	this.m_capabilities.setSupportsCellValueOperand(true);
	this.m_capabilities.setSupportsIntersectLayers(true);
	this.m_capabilities.setSupportsHierarchyLevelOffsetFilter(true);
	this.m_capabilities.setSupportsHierarchyTrapezoidFilter(true);
	this.m_capabilities.setSupportsTuplesOperand(true);
	this.m_capabilities.setSupportsComplexTupleFilter(true);
	this.m_capabilities.setSupportsCalculatedDimensions(true);
	this.m_capabilities.setSupportsFormulaMeasures(true);
	this.m_capabilities.setSupportsDynamicVariableRefresh(true);
};
oFF.OlapFilterManager.prototype.getOlapComponentType = function()
{
	return oFF.OlapComponentType.OLAP_FILTER_MANAGER;
};
oFF.OlapFilterManager.prototype.releaseObject = function()
{
	this.m_filters = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_filters);
	oFF.QModelComponent.prototype.releaseObject.call( this );
};
oFF.OlapFilterManager.prototype.getFilterByName = function(name)
{
	if (oFF.isNull(name))
	{
		return null;
	}
	if (this.m_filters.containsKey(name))
	{
		return this.m_filters.getByKey(name);
	}
	this.notifyNodeChanged();
	var filter = oFF.QFilterExpression.create(this, this);
	this.m_filters.put(name, filter);
	return filter;
};
oFF.OlapFilterManager.prototype.getFilters = function()
{
	return this.m_filters;
};
oFF.OlapFilterManager.prototype.getModelCapabilities = function()
{
	return this.m_capabilities;
};
oFF.OlapFilterManager.prototype.deleteFilterByName = function(name)
{
	var filter = this.m_filters.remove(name);
	if (oFF.notNull(filter))
	{
		filter.setComplexRoot(null);
		oFF.XObjectExt.release(filter);
	}
};
oFF.OlapFilterManager.prototype.addFilter = function(filter)
{
	if (oFF.notNull(filter))
	{
		var filterName = filter.getUniqueId();
		this.deleteFilterByName(filterName);
		this.m_filters.put(filterName, filter);
	}
};
oFF.OlapFilterManager.prototype.containsName = function(name)
{
	return this.m_filters.containsKey(name);
};
oFF.OlapFilterManager.prototype.getFilterById = function(uniqueId)
{
	if (oFF.isNull(uniqueId))
	{
		return null;
	}
	var iterator = this.m_filters.getIterator();
	while (iterator.hasNext())
	{
		var filterExpression = iterator.next();
		if (oFF.XString.isEqual(filterExpression.getUniqueId(), uniqueId))
		{
			return filterExpression;
		}
	}
	return null;
};
oFF.OlapFilterManager.prototype.externalizeDynamicFilterAfterSubmit = function(queryManager, isInitialSubmit)
{
	this._externalizeDynamicFilter(queryManager, isInitialSubmit);
};
oFF.OlapFilterManager.prototype.externalizeDynamicFilter = function(queryManager)
{
	this._externalizeDynamicFilter(queryManager, true);
};
oFF.OlapFilterManager.prototype.cleanupFilterBeforeAutoSubmit = function(queryManager, isInitialSubmit)
{
	if (oFF.notNull(queryManager) && queryManager.getActiveResultSetContainer().getSyncState().isNotInSync() && queryManager.isExecuteAutoVariableSubmit() && queryManager.getInitSettings().isExternalizedDynamicFilter())
	{
		var queryModel = queryManager.getQueryModel();
		if (oFF.isNull(queryModel))
		{
			return;
		}
		var queryManagerBase = queryManager;
		var variableProcessorState = queryManagerBase.getVariableProcessorState();
		var isValidState = variableProcessorState === oFF.VariableProcessorState.PROCESSING_AUTO_SUBMIT || variableProcessorState === oFF.VariableProcessorState.PROCESSING_AUTO_SUBMIT_AFTER_REINIT;
		var variableManager = queryModel.getVariableManager();
		if (isValidState && variableManager.hasDimensionMemberVariableAffectingDynamicFilter())
		{
			queryModel.queueEventing();
			var filter = queryModel.getFilter();
			var dynamicFilter = filter.getDynamicFilter();
			var externalizedFilterName = filter.getExternalizedFilterName();
			var internalBackProjectionFilter = this.getFilterByName(externalizedFilterName);
			var filterDimensions = oFF.XHashSetOfString.create();
			var taggingStoryVariables = oFF.XString.isEqual(queryManager.getTagging().getByKey(oFF.OlapFilterManager.TAGGING_STORY_VARIABLES), "true");
			var variableBasedFilterDimensionNames = variableManager.getDimensionNamesOfVariablesAffectingDynamicFilterValue();
			var dimensionsUsedInFilter = filter.getDynamicFilter().getDimensionsUsedInFilter();
			if (taggingStoryVariables)
			{
				filterDimensions.addAll(variableBasedFilterDimensionNames);
			}
			filterDimensions.addAll(dimensionsUsedInFilter);
			var dimensionNames = this._unlinkOrCollectConflictingDimensionsForOverwrittenFilters(filter, filterDimensions, internalBackProjectionFilter, taggingStoryVariables).getValuesAsReadOnlyListOfString();
			this.clearFilterByDimensionNames(queryManager, dimensionNames, null);
			this.clearFilterByDimensionNames(queryManager, variableBasedFilterDimensionNames, null);
			var prunedDimensions = this.m_prunedDimensions.getByKey(queryManager.getInstanceId());
			if (oFF.notNull(prunedDimensions))
			{
				this.clearFilterByDimensionNames(queryManager, prunedDimensions, variableBasedFilterDimensionNames);
			}
			if (dynamicFilter.isComplexFilter())
			{
				this.m_flattenedComplexFilters.add(externalizedFilterName);
				var convertedFilter = oFF.QFilterUtil.convertComplexFilterToCartesian(dynamicFilter.getComplexRoot());
				if (oFF.notNull(convertedFilter))
				{
					dynamicFilter.setCartesianProduct(convertedFilter);
				}
			}
			var dynamicProduct = dynamicFilter.getCartesianProduct();
			if (oFF.notNull(dynamicProduct))
			{
				var variablesAffectingDynamicFilter = variableManager.getVariablesAffectingDynamicFilter();
				for (var j = 0; j < variablesAffectingDynamicFilter.size(); j++)
				{
					var variable = variablesAffectingDynamicFilter.get(j);
					if (!variable.isHierarchyInfoVariable())
					{
						var dimension = variable.getDimensionForRuntimeFilterValue();
						if (oFF.notNull(dimension) && !dimensionNames.contains(dimension.getName()) && (oFF.isNull(prunedDimensions) || !prunedDimensions.contains(dimension.getName()) || oFF.XString.isEqual(queryManager.getTagging().getByKey(oFF.OlapFilterManager.TAGGING_VARIABLE_DIALOG_HAS_BEEN_SET), "true")))
						{
							var dynamicList = dynamicProduct.getCartesianListWithDefault(dimension);
							var filterField;
							if (variable.getVariableType() === oFF.VariableType.HIERARCHY_NODE_VARIABLE)
							{
								filterField = dimension.getHierarchyKeyField();
							}
							else if (dimension.isCompound())
							{
								filterField = dimension.getFirstFieldByType(oFF.PresentationType.KEY_NOT_COMPOUND);
							}
							else
							{
								filterField = dimension.getFlatKeyField();
							}
							dynamicList.setFieldMetadata(filterField.getMetadata());
							dynamicList.clear();
							var lowValueBag = dynamicList.addNewCartesianElement().getLow();
							lowValueBag.setVariableValue(variable);
							this.addHierarchyInfo(variable, dynamicList, filter.isFlattenHierarchyNodeFiltersFromVariables());
						}
					}
				}
			}
			this.m_prunedDimensions.remove(queryManager.getInstanceId());
			filter.linkFilterExt(externalizedFilterName, null, queryModel.getVariableManager().hasDimensionMemberVariableAffectingDynamicFilter(), true);
			queryModel.resumeEventing();
		}
	}
};
oFF.OlapFilterManager.prototype.addHierarchyInfo = function(variable, dynamicList, isFlattenHierarchyNodeFiltersFromVariables)
{
	if (variable.getVariableType().isTypeOf(oFF.VariableType.HIERARCHY_NODE_VARIABLE))
	{
		var dimension = variable.getDimensionForRuntimeFilterValue();
		var hierarchyName = dimension.getHierarchyName();
		if (dimension.useHierarchyNameVariable())
		{
			hierarchyName = dimension.getHierarchyNameVariableName();
		}
		var hierarchyDueDate = dimension.getHierarchyDueDate();
		if (dimension.useHierarchyDueDateVariable())
		{
			hierarchyDueDate = null;
		}
		var hierarchyVersion = dimension.getHierarchyVersion();
		if (dimension.useHierarchyVersionVariable())
		{
			hierarchyVersion = dimension.getHierarchyVersionVariableName();
		}
		dynamicList.setHierarchyInfo(hierarchyName, hierarchyDueDate, hierarchyVersion);
		if (isFlattenHierarchyNodeFiltersFromVariables)
		{
			dynamicList.setConvertToFlatFilter(true);
		}
	}
};
oFF.OlapFilterManager.prototype.clearFilterByDimensionNames = function(queryManager, dimensionNames, except)
{
	var convenienceCommands = queryManager.getConvenienceCommands();
	var iterator = dimensionNames.getIterator();
	while (iterator.hasNext())
	{
		var dimName = iterator.next();
		if (oFF.isNull(except) || !except.contains(dimName))
		{
			convenienceCommands.clearFiltersByDimensionName(dimName);
		}
	}
};
oFF.OlapFilterManager.prototype.discardNonVariableFilters = function(queryModel, variableManager, dynamicFilter)
{
	var cartesianProduct = dynamicFilter.getCartesianProduct();
	if (oFF.isNull(cartesianProduct))
	{
		cartesianProduct = oFF.QFilterUtil.convertComplexFilterToCartesian(dynamicFilter.getComplexRoot());
	}
	if (oFF.notNull(cartesianProduct))
	{
		var variableDimensionNames = variableManager.getDimensionNamesOfVariablesAffectingDynamicFilterValue();
		var dimensionNamesIterator = dynamicFilter.getDimensionsUsedInFilter().getIterator();
		while (dimensionNamesIterator.hasNext())
		{
			var dimensionName = dimensionNamesIterator.next();
			var list = cartesianProduct.getCartesianListByDimensionName(dimensionName);
			if (oFF.notNull(list) && !variableDimensionNames.contains(dimensionName) && (!queryModel.getDimensionByName(dimensionName).isMeasureStructure() || this.isExternalizeMeasureFilters(queryModel.getQueryManager())))
			{
				cartesianProduct.removeByDimensionName(dimensionName);
			}
		}
		dynamicFilter.setCartesianProduct(cartesianProduct);
	}
};
oFF.OlapFilterManager.prototype.externalizeNonVariableFilter = function(queryManager)
{
	if (oFF.isNull(queryManager))
	{
		return;
	}
	var queryModel = queryManager.getQueryModel();
	if (oFF.isNull(queryModel))
	{
		return;
	}
	var variableManager = queryModel.getVariableManager();
	var filter = queryModel.getFilter();
	var dynamicFilter = filter.getDynamicFilter();
	var cartesianProduct = dynamicFilter.getCartesianProduct();
	if (oFF.isNull(cartesianProduct))
	{
		cartesianProduct = oFF.QFilterUtil.convertComplexFilterToCartesian(dynamicFilter.getComplexRoot());
	}
	if (oFF.notNull(cartesianProduct))
	{
		queryModel.queueEventing();
		var externalizedNVFN = filter.getExternalizedNonVariableFilterName();
		var internalNVF = this.getFilterByName(externalizedNVFN);
		var variableDimensionNames = variableManager.getDimensionNamesOfVariablesAffectingDynamicFilterValue();
		var internalNVFP = internalNVF.getCartesianProductWithDefault();
		var dimensionNamesIterator = dynamicFilter.getDimensionsUsedInFilter().getIterator();
		while (dimensionNamesIterator.hasNext())
		{
			var dimensionName = dimensionNamesIterator.next();
			var list = cartesianProduct.getCartesianListByDimensionName(dimensionName);
			if (oFF.notNull(list) && !variableDimensionNames.contains(dimensionName) && !this.isVariableReferenceInCartesianList(list))
			{
				var newList = internalNVFP.getCartesianListByDimensionMdWithDefault(list.getFieldMetadata().getDimensionMetadata());
				newList.copyFrom(list, null);
				cartesianProduct.removeByDimensionName(dimensionName);
			}
		}
		dynamicFilter.setCartesianProduct(cartesianProduct);
		filter.linkFilter(externalizedNVFN, internalNVF);
		queryModel.resumeEventing();
	}
};
oFF.OlapFilterManager.prototype.isVariableReferenceInCartesianList = function(list)
{
	return oFF.XStream.of(list).anyMatch( function(element){
		var cartEl = element;
		return oFF.notNull(cartEl) && cartEl.getLow() !== null && cartEl.getLow().getValueType().isTypeOf(oFF.XValueType.VARIABLE);
	}.bind(this));
};
oFF.OlapFilterManager.prototype._externalizeDynamicFilter = function(queryManager, isInitialSubmit)
{
	if (oFF.isNull(queryManager))
	{
		return;
	}
	var queryModel = queryManager.getQueryModel();
	if (oFF.isNull(queryModel))
	{
		return;
	}
	var variableManager = queryModel.getVariableManager();
	var filter = queryModel.getFilter();
	var dynamicFilter = filter.getDynamicFilter();
	var isValidState = queryManager.getPreviousVariableProcessorState() !== oFF.VariableProcessorState.SUBMITTED;
	if (isValidState && queryManager.getInitSettings().isExternalizedNonVariableFilter())
	{
		this.discardNonVariableFilters(queryModel, variableManager, dynamicFilter);
	}
	if (!dynamicFilter.isComplexFilter() && isValidState)
	{
		queryModel.queueEventing();
		var externalizedFilterName = filter.getExternalizedFilterName();
		var internalBackProjectionFilter = this.getFilterByName(externalizedFilterName);
		var filterDimensions = oFF.XHashSetOfString.create();
		filterDimensions.addAll(variableManager.getDimensionNamesOfVariablesAffectingDynamicFilterValue());
		filterDimensions.addAll(dynamicFilter.getDimensionsUsedInFilter());
		var dimensionNames = this._unlinkOrCollectConflictingDimensionsForOverwrittenFilters(filter, filterDimensions, internalBackProjectionFilter, oFF.XString.isEqual(queryManager.getTagging().getByKey(oFF.OlapFilterManager.TAGGING_STORY_VARIABLES), "true")).getValuesAsReadOnlyListOfString();
		var backProjectionUniqueId = internalBackProjectionFilter.getUniqueId();
		internalBackProjectionFilter.copyFrom(dynamicFilter, null);
		internalBackProjectionFilter.setUniqueId(backProjectionUniqueId);
		var internalBackProjectionProduct = internalBackProjectionFilter.getCartesianProductWithDefault();
		var i;
		for (i = 0; i < dimensionNames.size(); i++)
		{
			var dimensionName = dimensionNames.get(i);
			internalBackProjectionProduct.removeByDimensionName(dimensionName);
		}
		if (filter.isFlattenHierarchyNodeFiltersFromVariables())
		{
			for (i = 0; i < internalBackProjectionProduct.size(); i++)
			{
				var cartesianList = internalBackProjectionProduct.getCartesianChild(i);
				if (oFF.XStringUtils.isNotNullAndNotEmpty(cartesianList.getHierarchyName()))
				{
					cartesianList.setConvertToFlatFilter(true);
				}
			}
		}
		filter.linkFilterExt(externalizedFilterName, internalBackProjectionFilter, queryModel.getVariableManager().hasDimensionMemberVariableAffectingDynamicFilter(), true);
		this._removeEmptyCartesianLists(dynamicFilter, internalBackProjectionFilter);
		if (this.isExternalizeMeasureFilters(queryManager))
		{
			queryModel.getConvenienceCommands().clearFilters();
		}
		else
		{
			queryModel.getConvenienceCommands().clearNonMeasureFilters();
			if (dynamicFilter.isCartesianProduct() && dynamicFilter.getCartesianProduct().size() === 1 && this.m_flattenedComplexFilters.contains(externalizedFilterName))
			{
				this.m_flattenedComplexFilters.removeElement(externalizedFilterName);
				var andFilter = oFF.QFactory.createFilterAnd(queryModel);
				andFilter.add(dynamicFilter.getCartesianProduct().getCartesianChild(0));
				dynamicFilter.setComplexRoot(andFilter);
			}
			var dimensionsUsedInFilter = dynamicFilter.getDimensionsUsedInFilter().getIterator();
			while (dimensionsUsedInFilter.hasNext())
			{
				internalBackProjectionProduct.removeByDimensionName(dimensionsUsedInFilter.next());
			}
		}
		var variablesAffectingDynamicFilter = queryModel.getVariableManager().getVariablesAffectingDynamicFilter();
		for (var j = 0; j < variablesAffectingDynamicFilter.size(); j++)
		{
			var variable = variablesAffectingDynamicFilter.get(j);
			variable.setWinControlInAutoSubmit(false);
		}
		queryModel.resumeEventing();
	}
};
oFF.OlapFilterManager.prototype._unlinkOrCollectConflictingDimensionsForOverwrittenFilters = function(filter, filterDimensions, filterToExclude, collectConflictingDimensions)
{
	var dimensionNameIterator = filterDimensions.getIterator();
	var skippedDimensions = oFF.XHashSetOfString.create();
	var backProjectionIds = filter.getBackProjectionFilterIds();
	while (dimensionNameIterator.hasNext())
	{
		var dimensionName = dimensionNameIterator.next();
		var linkedFilters = filter.getLinkedFilters();
		var linkedFilterIterator = linkedFilters.getKeysAsIteratorOfString();
		while (linkedFilterIterator.hasNext())
		{
			var filterName = linkedFilterIterator.next();
			var linkedFilter = linkedFilters.getByKey(filterName);
			var cartesianProduct = linkedFilter.getCartesianProduct();
			if (linkedFilter === filterToExclude || oFF.isNull(cartesianProduct) || !backProjectionIds.contains(linkedFilter.getUniqueId()))
			{
				continue;
			}
			if (cartesianProduct.getCartesianListByDimensionName(dimensionName) !== null)
			{
				if (collectConflictingDimensions)
				{
					skippedDimensions.add(dimensionName);
				}
				else
				{
					filter.linkFilterExt(filterName, null, true, true);
				}
			}
		}
	}
	return skippedDimensions;
};
oFF.OlapFilterManager.prototype._removeEmptyCartesianLists = function(dynamicFilter, externalizedDynamic)
{
	var externalizedCP = externalizedDynamic.getCartesianProductWithDefault();
	var dynamicCP = dynamicFilter.getCartesianProductWithDefault();
	var dimensionNameIterator = externalizedDynamic.getDimensionsUsedInFilter().getIterator();
	while (dimensionNameIterator.hasNext())
	{
		var dimensionName = dimensionNameIterator.next();
		var cartesianList = dynamicCP.getCartesianListByDimensionName(dimensionName);
		if (!oFF.XCollectionUtils.hasElements(cartesianList))
		{
			externalizedCP.removeByDimensionName(dimensionName);
		}
	}
};
oFF.OlapFilterManager.prototype._getBackProjectionFilter = function(filter)
{
	var backProjectionFilterIds = filter.getBackProjectionFilterIds();
	if (backProjectionFilterIds.isEmpty())
	{
		return null;
	}
	var backProjectionFilter = oFF.QFactory.createFilterExpression(this, this);
	var cartesianProduct = backProjectionFilter.getCartesianProductWithDefault();
	var externalizedFilterName = filter.getExternalizedFilterName();
	if (this.containsName(externalizedFilterName))
	{
		var serverFilter = this.getFilterByName(externalizedFilterName);
		this._mergeCartesianLists(cartesianProduct, this.getFilterByName(externalizedFilterName));
		backProjectionFilter.setUniqueId(serverFilter.getUniqueId());
	}
	var linkedFilters = filter.getLinkedFilters();
	var linkedFilterIterator = linkedFilters.getKeysAsIteratorOfString();
	while (linkedFilterIterator.hasNext())
	{
		var filterKey = linkedFilterIterator.next();
		var curFilter = linkedFilters.getByKey(filterKey);
		if (!oFF.XString.isEqual(filterKey, externalizedFilterName) && backProjectionFilterIds.contains(curFilter.getUniqueId()))
		{
			this._mergeCartesianLists(cartesianProduct, curFilter);
		}
	}
	return backProjectionFilter;
};
oFF.OlapFilterManager.prototype._mergeCartesianLists = function(cartesianProduct, backProjectionFilter)
{
	if (oFF.notNull(backProjectionFilter) && backProjectionFilter.isCartesianProduct())
	{
		var backProjectionProduct = backProjectionFilter.getCartesianProduct();
		var backProjectionListIt = backProjectionProduct.getIterator();
		while (backProjectionListIt.hasNext())
		{
			var backProjectionList = backProjectionListIt.next();
			var cartesianList = cartesianProduct.getCartesianListByDimensionMdWithDefault(backProjectionList.getFieldMetadata().getDimensionMetadata());
			cartesianList.copyFrom(backProjectionList, null);
		}
	}
};
oFF.OlapFilterManager.prototype.getExternalizeDynamicFilter = function(queryManager)
{
	if (oFF.isNull(queryManager))
	{
		return null;
	}
	return this.getFilterByName(queryManager.getQueryModel().getFilter().getExternalizedFilterName());
};
oFF.OlapFilterManager.prototype.getVariableDrivenFilters = function(queryManager)
{
	if (oFF.isNull(queryManager))
	{
		return null;
	}
	else if (queryManager.getInitSettings().isExternalizedNonVariableFilter())
	{
		return queryManager.getInitSettings().isExternalizedDynamicFilter() && queryManager.isSubmitted() ? this.getFilterByName(queryManager.getQueryModel().getFilter().getExternalizedFilterName()).getCartesianProduct() : queryManager.getQueryModel().getFilter().getDynamicFilter().getCartesianProduct();
	}
	else
	{
		oFF.noSupport();
	}
};
oFF.OlapFilterManager.prototype.getNonVariableDrivenFilters = function(queryManager)
{
	if (oFF.isNull(queryManager))
	{
		return null;
	}
	else if (queryManager.getInitSettings().isExternalizedNonVariableFilter())
	{
		return this.getFilterByName(queryManager.getQueryModel().getFilter().getExternalizedNonVariableFilterName()).getCartesianProduct();
	}
	else
	{
		oFF.noSupport();
	}
};
oFF.OlapFilterManager.prototype.pruneNonVariableFilters = function(queryManager)
{
	if (oFF.notNull(queryManager) && queryManager.getQueryModel() !== null)
	{
		var queryModel = queryManager.getQueryModel();
		var filterExpression = queryModel.getFilter().getDynamicFilter();
		var variableManager = queryModel.getVariableManager();
		if (oFF.notNull(filterExpression))
		{
			var pruneList = oFF.XHashSetOfString.create();
			pruneList.addAll(filterExpression.getDimensionsUsedInFilter());
			var externalizedFilterName = queryModel.getFilter().getExternalizedFilterName();
			var internalBackProjectionFilter = this.getFilterByName(externalizedFilterName);
			if (oFF.notNull(internalBackProjectionFilter))
			{
				pruneList.addAll(internalBackProjectionFilter.getDimensionsUsedInFilter());
			}
			var varDims = variableManager.getDimensionNamesOfVariablesAffectingDynamicFilterValue().getIterator();
			while (varDims.hasNext())
			{
				var dimension = varDims.next();
				if (pruneList.contains(dimension))
				{
					pruneList.removeElement(dimension);
				}
			}
			var measureDimensionName = queryModel.getMeasureDimension().getName();
			if (pruneList.contains(measureDimensionName))
			{
				pruneList.removeElement(measureDimensionName);
			}
			if (oFF.XCollectionUtils.hasElements(pruneList))
			{
				this.pruneDimensionNamesInternal(queryManager, pruneList);
			}
		}
	}
};
oFF.OlapFilterManager.prototype.isExternalizeMeasureFilters = function(queryManager)
{
	return this.m_externalizeMeasureFilters.contains(queryManager.getInstanceId());
};
oFF.OlapFilterManager.prototype.setExternalizeMeasureFilters = function(queryManager, externalize)
{
	if (externalize)
	{
		this.m_externalizeMeasureFilters.add(queryManager.getInstanceId());
	}
	else
	{
		this.m_externalizeMeasureFilters.removeElement(queryManager.getInstanceId());
	}
};
oFF.OlapFilterManager.prototype.pruneDimensionNamesForDynamicFilter = function(queryManager, dimensionNames)
{
	if (oFF.notNull(queryManager) && queryManager.getQueryModel() !== null && queryManager.getQueryModel().getVariableManager().hasDimensionMemberVariableAffectingDynamicFilter())
	{
		if (!oFF.XString.isEqual(queryManager.getTagging().getByKey(oFF.OlapFilterManager.TAGGING_VARIABLE_DIALOG_HAS_BEEN_SET), "true"))
		{
			this.pruneDimensionNamesInternal(queryManager, dimensionNames);
		}
	}
};
oFF.OlapFilterManager.prototype.pruneDimensionNamesInternal = function(queryManager, dimensionNames)
{
	var filter = queryManager.getQueryModel().getFilter();
	var externalizedFilterName = filter.getExternalizedFilterName();
	var internalBackProjectionFilter = this.getFilterByName(externalizedFilterName);
	if (oFF.notNull(dimensionNames) && oFF.notNull(internalBackProjectionFilter))
	{
		var dimNameIterator = dimensionNames.getIterator();
		while (dimNameIterator.hasNext())
		{
			oFF.QFilterUtil.clearSelectionsInContainerByDimension(dimNameIterator.next(), internalBackProjectionFilter);
		}
	}
	if (queryManager.getVariableProcessorState().isTypeOf(oFF.VariableProcessorState.SUBMITTED))
	{
		if (this.isExternalizeMeasureFilters(queryManager))
		{
			queryManager.getConvenienceCommands().clearFilters();
		}
		else
		{
			queryManager.getConvenienceCommands().clearNonMeasureFilters();
		}
	}
	else if (oFF.notNull(dimensionNames) && queryManager.isExecuteAutoVariableSubmit())
	{
		var prunedDimensions = this.m_prunedDimensions.getByKey(queryManager.getInstanceId());
		if (oFF.notNull(prunedDimensions))
		{
			var prunedDimensionsUnion = oFF.XListOfString.create();
			prunedDimensionsUnion.addAll(prunedDimensions);
			prunedDimensionsUnion.addAll(dimensionNames);
			this.m_prunedDimensions.put(queryManager.getInstanceId(), prunedDimensionsUnion);
		}
		else
		{
			this.m_prunedDimensions.put(queryManager.getInstanceId(), dimensionNames.getValuesAsReadOnlyListOfString());
		}
	}
};
oFF.OlapFilterManager.prototype.pruneExternalizedDynamicFilter = function(queryManager)
{
	if (oFF.notNull(queryManager) && queryManager.getQueryModel() !== null && queryManager.getVariableProcessorState().isTypeOf(oFF.VariableProcessorState.SUBMITTED) && queryManager.getQueryModel().getVariableManager().hasDimensionMemberVariableAffectingDynamicFilter())
	{
		var queryModel = queryManager.getQueryModel();
		var filter = queryModel.getFilter();
		var dynamicFilter = filter.getDynamicFilter();
		var externalizedFilterName = filter.getExternalizedFilterName();
		var internalBackProjectionFilter = this.getFilterByName(externalizedFilterName);
		if (oFF.notNull(internalBackProjectionFilter))
		{
			if (!oFF.XString.isEqual(queryManager.getTagging().getByKey(oFF.OlapFilterManager.TAGGING_VARIABLE_DIALOG_HAS_BEEN_SET), "true"))
			{
				var dimensionNamesOfDynamicFilter = dynamicFilter.getDimensionsUsedInFilter();
				var dimensionNamesOfBackprojection = internalBackProjectionFilter.getDimensionsUsedInFilter().getIterator();
				var internalBackProjectionProduct = internalBackProjectionFilter.getCartesianProduct();
				while (dimensionNamesOfBackprojection.hasNext())
				{
					var dimensionName = dimensionNamesOfBackprojection.next();
					if (!dimensionNamesOfDynamicFilter.contains(dimensionName))
					{
						internalBackProjectionProduct.removeByDimensionName(dimensionName);
					}
				}
				filter.linkFilterExt(externalizedFilterName, internalBackProjectionFilter, queryModel.getVariableManager().hasDimensionMemberVariableAffectingDynamicFilter(), true);
			}
			if (this.isExternalizeMeasureFilters(queryManager))
			{
				queryModel.getConvenienceCommands().clearFilters();
			}
			else
			{
				queryModel.getConvenienceCommands().clearNonMeasureFilters();
			}
		}
	}
};
oFF.OlapFilterManager.prototype.projectExternalizedFilter = function(queryManager)
{
	if (oFF.isNull(queryManager))
	{
		return;
	}
	var queryModel = queryManager.getQueryModel();
	if (oFF.isNull(queryModel))
	{
		return;
	}
	if (queryModel.getVariableManager().hasDimensionMemberVariableAffectingDynamicFilter())
	{
		queryManager.queueEventing();
		var filter = queryModel.getFilter();
		var dynamicFilter = filter.getDynamicFilter();
		var backProjectionFilter = this._getBackProjectionFilter(filter);
		if (oFF.notNull(backProjectionFilter))
		{
			if (this.isExternalizeMeasureFilters(queryManager))
			{
				queryModel.getConvenienceCommands().clearFilters();
				dynamicFilter.copyFrom(backProjectionFilter, null);
			}
			else
			{
				queryModel.getConvenienceCommands().clearNonMeasureFilters();
				if (dynamicFilter.isComplexFilter())
				{
					this.m_flattenedComplexFilters.add(filter.getExternalizedFilterName());
				}
				var remainingMeasureFilters = dynamicFilter.getFilterRootElement();
				dynamicFilter.copyFrom(backProjectionFilter, null);
				this.complementCartesianProductFromComplex(dynamicFilter.getCartesianProductWithDefault(), remainingMeasureFilters);
			}
		}
		queryModel.resumeEventing();
	}
};
oFF.OlapFilterManager.prototype.complementCartesianProductFromComplex = function(cartesianProduct, remainingFilters)
{
	if (oFF.notNull(remainingFilters))
	{
		var componentType = remainingFilters.getOlapComponentType();
		if (componentType.isTypeOf(oFF.FilterComponentType.CARTESIAN_LIST))
		{
			var remainingList = remainingFilters;
			if (cartesianProduct.getCartesianListByDimensionName(remainingList.getDimensionName()) === null)
			{
				var newList = cartesianProduct.getCartesianListByDimensionMdWithDefault(remainingList.getFieldMetadata().getDimensionMetadata());
				newList.copyFrom(remainingList, null);
			}
		}
		else if (componentType.isTypeOf(oFF.FilterComponentType.AND))
		{
			var remainingComplex = remainingFilters;
			for (var i = 0; i < remainingComplex.size(); i++)
			{
				this.complementCartesianProductFromComplex(cartesianProduct, remainingComplex.get(i));
			}
		}
	}
};
oFF.OlapFilterManager.prototype.releaseExternalizedFilter = function(queryManager)
{
	if (oFF.isNull(queryManager))
	{
		return;
	}
	var queryModel = queryManager.getQueryModel();
	if (oFF.isNull(queryModel))
	{
		return;
	}
	var filter = queryModel.getFilter();
	if (oFF.isNull(filter))
	{
		return;
	}
	this.deleteFilterByName(filter.getExternalizedFilterName());
	this.deleteFilterByName(filter.getExternalizedNonVariableFilterName());
};
oFF.OlapFilterManager.prototype.setModCounter = function(modCounter)
{
	this.updateModCounter(modCounter);
};

oFF.QGeoManager = function() {};
oFF.QGeoManager.prototype = new oFF.QModelComponent();
oFF.QGeoManager.prototype._ff_c = "QGeoManager";

oFF.QGeoManager.CHOROPLETH_HIERARCHIES_IDENTIFIER = "hierarchy:";
oFF.QGeoManager.CHOROPLETH_DRILLPATH_IDENTIFIER = "drillpath:";
oFF.QGeoManager.CHOROPLETH_TABLE_PREFIX = "table:[";
oFF.QGeoManager.EXTENDED_DIMENSION_NAME_EXT = "_extDim_";
oFF.QGeoManager.EXTENDED_DIMENSION_NAME_HIERARCHY = "_H";
oFF.QGeoManager.EXTENDED_DIMENSION_NAME_LEVEL = "_L";
oFF.QGeoManager.create = function(context)
{
	var geoManager = new oFF.QGeoManager();
	geoManager.setupGeoManager(context);
	return geoManager;
};
oFF.QGeoManager.prototype.m_choroplethHierarchies = null;
oFF.QGeoManager.prototype.m_choroplethDrillPaths = null;
oFF.QGeoManager.prototype.m_sharedQueryManagers = null;
oFF.QGeoManager.prototype.m_choroplethIntermediateDrillPaths = null;
oFF.QGeoManager.prototype.m_listenerIdentifiers = null;
oFF.QGeoManager.prototype.m_syncTypes = null;
oFF.QGeoManager.prototype.m_queryManagers = null;
oFF.QGeoManager.prototype.m_systemNames = null;
oFF.QGeoManager.prototype.m_shouldUseSynonyms = null;
oFF.QGeoManager.prototype.m_levelKeys = null;
oFF.QGeoManager.prototype.m_levelInfos = null;
oFF.QGeoManager.prototype.m_drillPoints = null;
oFF.QGeoManager.prototype.m_drillPathTableKeyToLevelKeys = null;
oFF.QGeoManager.prototype.setupGeoManager = function(context)
{
	this.setupModelComponentWithName(context, null, "GeoManager");
	oFF.QGeoConstants.staticSetup();
	this.initialize();
};
oFF.QGeoManager.prototype.initialize = function()
{
	this.m_choroplethHierarchies = oFF.XHashMapByString.create();
	this.m_choroplethDrillPaths = oFF.XHashMapByString.create();
	this.m_sharedQueryManagers = oFF.XHashMapByString.create();
	this.m_choroplethIntermediateDrillPaths = oFF.XHashMapByString.create();
	this.m_listenerIdentifiers = oFF.XHashMapByString.create();
	this.m_syncTypes = oFF.XHashMapByString.create();
	this.m_queryManagers = oFF.XHashMapByString.create();
	this.m_systemNames = oFF.XHashMapOfStringByString.create();
	this.m_shouldUseSynonyms = oFF.XHashMapByString.create();
	this.m_levelKeys = oFF.XHashMapOfStringByString.create();
	this.m_levelInfos = oFF.XHashMapByString.create();
	this.m_drillPoints = oFF.XHashMapByString.create();
	this.m_drillPathTableKeyToLevelKeys = oFF.XHashMapByString.create();
};
oFF.QGeoManager.prototype.getOlapComponentType = function()
{
	return oFF.OlapComponentType.GEO_MANAGER;
};
oFF.QGeoManager.prototype.releaseObject = function()
{
	this.clearCache();
	oFF.QModelComponent.prototype.releaseObject.call( this );
};
oFF.QGeoManager.prototype.clearCache = function()
{
	this.m_choroplethHierarchies = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_choroplethHierarchies);
	this.m_choroplethDrillPaths = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_choroplethDrillPaths);
	this.m_sharedQueryManagers = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_sharedQueryManagers);
	this.m_choroplethIntermediateDrillPaths = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_choroplethIntermediateDrillPaths);
	this.m_listenerIdentifiers = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_listenerIdentifiers);
	this.m_syncTypes = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_syncTypes);
	this.m_queryManagers = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_queryManagers);
	this.m_systemNames = oFF.XObjectExt.release(this.m_systemNames);
	this.m_shouldUseSynonyms = oFF.XObjectExt.release(this.m_shouldUseSynonyms);
	this.m_levelKeys = oFF.XObjectExt.release(this.m_levelKeys);
	this.m_levelInfos = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_levelInfos);
	this.m_drillPoints = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_drillPoints);
	this.m_drillPathTableKeyToLevelKeys = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_drillPathTableKeyToLevelKeys);
};
oFF.QGeoManager.prototype.reset = function()
{
	this.clearCache();
	this.initialize();
};
oFF.QGeoManager.prototype.loadChoroplethHierarchiesExt = function(syncType, listener, systemName, liveSynonymSupportEnabled, localSynonymSupportEnabled, customIdentifier)
{
	return this._loadChoroplethHierarchies(syncType, listener, systemName, liveSynonymSupportEnabled, localSynonymSupportEnabled, customIdentifier);
};
oFF.QGeoManager.prototype.loadChoroplethHierarchies = function(syncType, listener, systemName, liveSynonymSupportEnabled, customIdentifier)
{
	return this._loadChoroplethHierarchies(syncType, listener, systemName, liveSynonymSupportEnabled, false, customIdentifier);
};
oFF.QGeoManager.prototype._loadChoroplethHierarchies = function(syncType, listener, systemName, liveSynonymSupportEnabled, localSynonymSupportEnabled, customIdentifier)
{
	var theSystemName = systemName;
	var masterSystemName = this.getApplication().getSystemLandscape().getMasterSystemName();
	if (oFF.isNull(theSystemName))
	{
		theSystemName = masterSystemName;
	}
	var isMasterSystem = this.isMasterSystemName(theSystemName);
	var hierarchiesResult = this.getChoroplethHierarchiesBySystemName(theSystemName);
	if (oFF.isNull(hierarchiesResult))
	{
		var shouldUseSynonym = null;
		if (liveSynonymSupportEnabled && !isMasterSystem || localSynonymSupportEnabled && isMasterSystem)
		{
			var systemConnect = this.getApplication().getConnectionPool().getSystemConnect(theSystemName);
			var serverMetadata = systemConnect.getServerMetadata();
			if (oFF.notNull(serverMetadata) && serverMetadata.supportsCapability(oFF.ServerService.ANALYTIC, oFF.InACapabilities.C177_DATA_ENTRY_ON_UNBOOKED))
			{
				shouldUseSynonym = oFF.XBooleanValue.create(true);
			}
		}
		if (syncType === oFF.SyncType.BLOCKING)
		{
			this.processQueryManagerCreationForChoroplethHierarchies(theSystemName, syncType, shouldUseSynonym, null, null);
			hierarchiesResult = this.getChoroplethHierarchiesBySystemName(theSystemName);
			if (hierarchiesResult.hasErrors() && !isMasterSystem)
			{
				this.processQueryManagerCreationForChoroplethHierarchies(masterSystemName, syncType, null, null, null);
				hierarchiesResult = this.getChoroplethHierarchiesBySystemName(masterSystemName);
			}
		}
		else
		{
			var requestKey = oFF.XStringUtils.concatenate3(oFF.QGeoManager.CHOROPLETH_HIERARCHIES_IDENTIFIER, theSystemName, oFF.XBoolean.convertToString(!isMasterSystem && liveSynonymSupportEnabled));
			var listenerIdentifiers = this.m_listenerIdentifiers.getByKey(requestKey);
			if (oFF.notNull(listenerIdentifiers))
			{
				listenerIdentifiers.add(oFF.XPair.create(listener, customIdentifier));
			}
			else
			{
				listenerIdentifiers = oFF.XList.create();
				listenerIdentifiers.add(oFF.XPair.create(listener, customIdentifier));
				this.m_listenerIdentifiers.put(requestKey, listenerIdentifiers);
				this.m_syncTypes.put(requestKey, syncType);
				this.m_systemNames.put(requestKey, theSystemName);
				this.m_shouldUseSynonyms.put(requestKey, shouldUseSynonym);
				this.processQueryManagerCreationForChoroplethHierarchies(theSystemName, syncType, shouldUseSynonym, this, oFF.XStringValue.create(requestKey));
			}
		}
	}
	if (oFF.notNull(hierarchiesResult))
	{
		if (hierarchiesResult.hasErrors() && !isMasterSystem && syncType !== oFF.SyncType.BLOCKING)
		{
			this.loadChoroplethHierarchiesExt(syncType, listener, masterSystemName, false, false, customIdentifier);
		}
		else if (oFF.notNull(listener))
		{
			listener.onChoroplethHierarchiesLoaded(hierarchiesResult, hierarchiesResult.getData(), customIdentifier);
		}
	}
	return hierarchiesResult;
};
oFF.QGeoManager.prototype.processQueryManagerCreationForChoroplethHierarchies = function(systemName, syncType, shouldUseSynonym, listener, customIdentifier)
{
	var dataSourceName = this.getChoroplethHierarchyTableName(systemName, shouldUseSynonym);
	var queryManager = this.getOlapEnv().getQueryManagerByDataSource(systemName, dataSourceName);
	var extResult = null;
	if (oFF.notNull(queryManager))
	{
		extResult = oFF.ExtResult.create(queryManager.cloneQueryManager(), null);
		if (syncType === oFF.SyncType.BLOCKING)
		{
			this.processQueryExecutionForChoroplethHierarchies(extResult, extResult.getData(), systemName, syncType, shouldUseSynonym, null, customIdentifier);
		}
		else
		{
			this.processQueryExecutionForChoroplethHierarchies(extResult, extResult.getData(), systemName, syncType, shouldUseSynonym, this, customIdentifier);
		}
	}
	else
	{
		extResult = this.getOlapEnv().processQueryManagerCreationWithDataSourceName(syncType, listener, customIdentifier, systemName, dataSourceName);
		if (syncType === oFF.SyncType.BLOCKING)
		{
			this.processQueryExecutionForChoroplethHierarchies(extResult, extResult.getData(), systemName, syncType, shouldUseSynonym, null, customIdentifier);
		}
	}
};
oFF.QGeoManager.prototype.isMasterSystemName = function(systemName)
{
	return oFF.XString.isEqual(systemName, this.getApplication().getSystemLandscape().getMasterSystemName());
};
oFF.QGeoManager.prototype.getChoroplethHierarchyTableName = function(systemName, shouldUseSynonym)
{
	var tableName = oFF.XStringBuffer.create();
	var isMasterSystem = this.isMasterSystemName(systemName);
	if (!isMasterSystem)
	{
		tableName.append(systemName).append("//");
	}
	tableName.append(oFF.QGeoManager.CHOROPLETH_TABLE_PREFIX);
	if (oFF.notNull(shouldUseSynonym) && shouldUseSynonym.getBoolean())
	{
		tableName.append(oFF.QGeoConstants.CHOROPLETH_HIERARCHY_SYNONYM_SCHEMANAME).append("][").append(oFF.QGeoConstants.CHOROPLETH_HIERARCHY_SYNONYM_PACKAGENAME).append("][").append(oFF.QGeoConstants.CHOROPLETH_HIERARCHY_SYNONYM_OBJECTNAME);
	}
	else
	{
		tableName.append(oFF.QGeoConstants.CHOROPLETH_HIERARCHY_SCHEMANAME).append("][");
		if (isMasterSystem)
		{
			var systemDescription = this.getApplication().getSystemLandscape().getSystemDescription(systemName);
			var tenantRootPackage = systemDescription.getTenantRootPackage();
			if (oFF.XStringUtils.isNotNullAndNotEmpty(tenantRootPackage))
			{
				tableName.append(tenantRootPackage).append(".");
			}
		}
		tableName.append(oFF.QGeoConstants.CHOROPLETH_HIERARCHY_PACKAGENAME).append("][").append(oFF.QGeoConstants.CHOROPLETH_HIERARCHY_OBJECTNAME);
	}
	tableName.append("]");
	return tableName.toString();
};
oFF.QGeoManager.prototype.onQueryManagerCreated = function(extResult, queryManager, customIdentifier)
{
	if (oFF.isNull(customIdentifier))
	{
		throw oFF.XException.createRuntimeException("Identifier can not be null");
	}
	var xGuid = customIdentifier;
	var requestKey = xGuid.getString();
	var syncType = this.m_syncTypes.getByKey(requestKey);
	if (this.isForChoroplethHierarchies(requestKey))
	{
		this.m_queryManagers.put(requestKey, queryManager);
		var systemName = this.m_systemNames.getByKey(requestKey);
		var shouldUseSynonym = this.m_shouldUseSynonyms.getByKey(requestKey);
		this.processQueryExecutionForChoroplethHierarchies(extResult, queryManager, systemName, syncType, shouldUseSynonym, this, customIdentifier);
	}
	else if (this.isForChoroplethDrillPath(requestKey))
	{
		var drillPathTableKey = requestKey;
		this.m_sharedQueryManagers.put(drillPathTableKey, extResult);
		var levelKeysPending = this.m_drillPathTableKeyToLevelKeys.remove(drillPathTableKey);
		for (var index = 0; index < levelKeysPending.size(); index++)
		{
			var levelKey = levelKeysPending.get(index);
			requestKey = this.m_levelKeys.getByKey(levelKey);
			var levels = this.m_levelInfos.getByKey(levelKey);
			var point = this.m_drillPoints.getByKey(levelKey);
			this.processQueryExecutionForChoroplethDrillPath(extResult, queryManager, syncType, levels, point, requestKey, this, oFF.XStringValue.create(levelKey));
		}
	}
};
oFF.QGeoManager.prototype.processQueryExecutionForChoroplethHierarchies = function(extResult, queryManager, systemName, syncType, shouldUseSynonym, listener, customIdentifier)
{
	if (extResult.isValid())
	{
		var cmd = queryManager.getConvenienceCommands();
		for (var index = 0; index < oFF.QGeoConstants.CHOROPLETH_HIERARCHY_DIMENSIONS.size(); index++)
		{
			cmd.moveDimensionToRows(oFF.QGeoConstants.CHOROPLETH_HIERARCHY_DIMENSIONS.get(index));
		}
		var resultsetResult = queryManager.processQueryExecution(syncType, listener, customIdentifier);
		if (syncType === oFF.SyncType.BLOCKING)
		{
			this.processResultSetForChoroplethHierarchies(resultsetResult, resultsetResult.getData(), syncType, systemName, shouldUseSynonym, null);
			oFF.XObjectExt.release(queryManager);
		}
	}
	else
	{
		this.handleErrorsForChoroplethHierarchies(extResult, null, systemName, syncType, customIdentifier);
	}
};
oFF.QGeoManager.prototype.onQueryExecuted = function(extResult, resultSetContainer, customIdentifier)
{
	if (oFF.isNull(customIdentifier))
	{
		throw oFF.XException.createRuntimeException("Identifier can not be null");
	}
	var xGuid = customIdentifier;
	var requestKey = xGuid.getString();
	var syncType = this.m_syncTypes.getByKey(requestKey);
	if (this.isForChoroplethHierarchies(requestKey))
	{
		var systemName = this.m_systemNames.getByKey(requestKey);
		var shouldUseSynonym = this.m_shouldUseSynonyms.getByKey(requestKey);
		this.processResultSetForChoroplethHierarchies(extResult, resultSetContainer, syncType, systemName, shouldUseSynonym, customIdentifier);
	}
	else if (this.isForChoroplethDrillPath(requestKey))
	{
		var levelKey = requestKey;
		requestKey = this.m_levelKeys.getByKey(levelKey);
		var levels = this.m_levelInfos.getByKey(levelKey);
		this.processResultSetForChoroplethDrillPath(extResult, resultSetContainer, syncType, levels, levelKey, requestKey);
	}
};
oFF.QGeoManager.prototype.processResultSetForChoroplethHierarchies = function(extResult, resultSetContainer, syncType, systemName, shouldUseSynonym, customIdentifier)
{
	if (extResult.isValid())
	{
		var cursorResultSet = resultSetContainer.getCursorResultSet();
		var cursorRowsAxis = cursorResultSet.getCursorRowsAxis();
		var rsDimensions = cursorRowsAxis.getRsDimensions();
		var rsDimensionCount = rsDimensions.size();
		var errorMessage = null;
		if (rsDimensionCount !== oFF.QGeoConstants.CHOROPLETH_HIERARCHY_DIMENSIONS.size())
		{
			errorMessage = oFF.XMessage.createErrorWithCode(oFF.OriginLayer.UTILITY, oFF.ErrorCodes.FAILED_TO_READ_CHOROPLETH_HIERARCHIES, "Error reading choropleth hierarchies: the number of dimensions is not matched", null, false, null);
			this.handleErrorsForChoroplethHierarchies(null, errorMessage, systemName, syncType, customIdentifier);
			return;
		}
		for (var index = 0; index < rsDimensionCount; index++)
		{
			var rsDimension = rsDimensions.get(index);
			if (!oFF.XString.isEqual(rsDimension.getName(), oFF.QGeoConstants.CHOROPLETH_HIERARCHY_DIMENSIONS.get(index)))
			{
				errorMessage = oFF.XMessage.createErrorWithCode(oFF.OriginLayer.UTILITY, oFF.ErrorCodes.FAILED_TO_READ_CHOROPLETH_HIERARCHIES, "Error reading choropleth hierarchies: the dimension name is not matched", null, false, null);
				this.handleErrorsForChoroplethHierarchies(null, errorMessage, systemName, syncType, customIdentifier);
				return;
			}
		}
		var hierarchies = oFF.XHashMapByString.create();
		var hierarchy = null;
		var level = null;
		cursorRowsAxis.setTupleCursorBeforeStart();
		var tuplesCount = cursorRowsAxis.getTuplesCount();
		var tupleElements = cursorRowsAxis.getTupleElementsCount();
		for (var i = 0; i < tuplesCount; i++)
		{
			cursorRowsAxis.nextTuple();
			var elementNames = oFF.XListOfString.create();
			for (var k = 0; k < tupleElements; k++)
			{
				cursorRowsAxis.nextTupleElement();
				while (cursorRowsAxis.hasNextFieldValue())
				{
					var fieldValue = cursorRowsAxis.nextFieldValue();
					elementNames.add(fieldValue.getValue().getStringRepresentation());
				}
			}
			if (oFF.isNull(hierarchy) || !oFF.XString.isEqual(hierarchy.getHierarchyId(), elementNames.get(0)))
			{
				hierarchy = oFF.QGeoChoroplethHierarchy.create(elementNames.get(0), elementNames.get(1));
				hierarchies.put(elementNames.get(0), hierarchy);
				level = null;
			}
			if (oFF.isNull(level) || !oFF.XString.isEqual(level.getLevelId(), elementNames.get(2)))
			{
				level = oFF.QGeoChoroplethHierarchyLevel.create(elementNames.get(2), elementNames.get(3));
				level.setLocation(elementNames.get(4));
				level.setObjectName(elementNames.get(5));
				level.setPackageName(elementNames.get(6));
				level.setSchemaName(elementNames.get(7));
				var isStandardLevel = oFF.XString.isEqual(level.getObjectName(), oFF.QGeoConstants.CHOROPLETH_DATASOURCE_OBJECTNAME) && oFF.XString.isEqual(level.getPackageName(), oFF.QGeoConstants.CHOROPLETH_DATASOURCE_PACKAGENAME) && oFF.XString.isEqual(level.getSchemaName(), oFF.QGeoConstants.CHOROPLETH_DATASOURCE_SCHEMANAME);
				if (!isStandardLevel && oFF.notNull(shouldUseSynonym) && shouldUseSynonym.getBoolean())
				{
					isStandardLevel = oFF.XString.isEqual(level.getObjectName(), oFF.QGeoConstants.CHOROPLETH_DATASOURCE_SYNONYM_OBJECTNAME) && oFF.XString.isEqual(level.getPackageName(), oFF.QGeoConstants.CHOROPLETH_DATASOURCE_SYNONYM_PACKAGENAME) && oFF.XString.isEqual(level.getSchemaName(), oFF.QGeoConstants.CHOROPLETH_DATASOURCE_SYNONYM_SCHEMANAME);
				}
				level.setIsCustom(!isStandardLevel);
				hierarchy.addLevel(level);
			}
			level.addColumn(oFF.QGeoColumn.create(elementNames.get(8), elementNames.get(9)));
		}
		var hierarchiesResult = oFF.ExtResult.create(hierarchies, null);
		this.m_choroplethHierarchies.put(systemName, hierarchiesResult);
		if (syncType !== oFF.SyncType.BLOCKING)
		{
			this.processChoroplethHiearachiesResult(customIdentifier);
		}
	}
	else
	{
		this.handleErrorsForChoroplethHierarchies(extResult, null, systemName, syncType, customIdentifier);
	}
};
oFF.QGeoManager.prototype.getChoroplethHierarchiesBySystemName = function(systemName)
{
	return this.m_choroplethHierarchies.getByKey(systemName);
};
oFF.QGeoManager.prototype.handleErrorsForChoroplethHierarchies = function(extResult, errorMessage, systemName, syncType, customIdentifier)
{
	if (oFF.notNull(extResult) && !extResult.isValid() || oFF.notNull(errorMessage))
	{
		var errorResult;
		if (oFF.notNull(extResult))
		{
			errorResult = oFF.ExtResult.createWithExternalMessages(null, extResult);
		}
		else
		{
			errorResult = oFF.ExtResult.createWithMessage(errorMessage);
		}
		this.m_choroplethHierarchies.put(systemName, errorResult);
		if (syncType !== oFF.SyncType.BLOCKING)
		{
			this.processChoroplethHiearachiesResult(customIdentifier);
		}
	}
};
oFF.QGeoManager.prototype.processChoroplethHiearachiesResult = function(customIdentifier)
{
	var xGuid = customIdentifier;
	var requestKey = xGuid.getString();
	var systemName = this.m_systemNames.remove(requestKey);
	var syncType = this.m_syncTypes.remove(requestKey);
	this.m_shouldUseSynonyms.remove(requestKey);
	var queryManager = this.m_queryManagers.remove(requestKey);
	if (oFF.notNull(queryManager))
	{
		oFF.XObjectExt.release(queryManager);
	}
	var listenerIdentifiers = this.m_listenerIdentifiers.remove(requestKey);
	var hierarchiesResult = this.getChoroplethHierarchiesBySystemName(systemName);
	for (var index1 = 0; index1 < listenerIdentifiers.size(); index1++)
	{
		var listenerIdentifier = listenerIdentifiers.get(index1);
		var listener = listenerIdentifier.getFirstObject();
		var identifier = listenerIdentifier.getSecondObject();
		if (!hierarchiesResult.isValid() && !this.isMasterSystemName(systemName))
		{
			this.loadChoroplethHierarchiesExt(syncType, listener, this.getApplication().getSystemLandscape().getMasterSystemName(), false, false, identifier);
		}
		else if (oFF.notNull(listener))
		{
			listener.onChoroplethHierarchiesLoaded(hierarchiesResult, hierarchiesResult.getData(), identifier);
		}
	}
};
oFF.QGeoManager.prototype.getChoroplethExtendedDimension = function(systemName, hierarchyId, levelId, geoDimensionName, parentQueryManager)
{
	var level = this.getChoroplethHierarchyLevel(systemName, hierarchyId, levelId);
	if (oFF.isNull(level))
	{
		throw oFF.XException.createRuntimeException("Fail to get choropleth hierarchy level");
	}
	var joinFieldName = null;
	var isAreaEnriched = this.isAreaEnriched(geoDimensionName, parentQueryManager);
	if (isAreaEnriched)
	{
		joinFieldName = this.getAgileAreaFieldName(geoDimensionName, parentQueryManager, levelId);
	}
	var useAreaJoin = oFF.notNull(joinFieldName);
	if (oFF.isNull(joinFieldName))
	{
		useAreaJoin = isAreaEnriched && this.hasMatchingAreaField(geoDimensionName, parentQueryManager);
		joinFieldName = this.getJoinFieldName(geoDimensionName, parentQueryManager, useAreaJoin, isAreaEnriched && !useAreaJoin);
	}
	if (oFF.isNull(joinFieldName))
	{
		throw oFF.XException.createRuntimeException("Fail to get join field");
	}
	var externalDataSource = oFF.QFactory.createDataSource();
	externalDataSource.setSchemaName(level.getSchemaName());
	if (oFF.XStringUtils.isNotNullAndNotEmpty(level.getPackageName()))
	{
		externalDataSource.setPackageName(level.getPackageName());
	}
	externalDataSource.setObjectName(level.getObjectName());
	externalDataSource.setType(oFF.MetaObjectType.DBVIEW);
	var extendDimensionName = this.getExtendedDimensionName(hierarchyId, level, geoDimensionName, parentQueryManager);
	var extendedDimension = oFF.QExtendedDimension.create(extendDimensionName, joinFieldName, useAreaJoin ? oFF.QGeoConstants.CHOROPLETH_METADATA_AREA_ID : level.getLocation());
	extendedDimension.setDataSource(externalDataSource);
	var joinType = useAreaJoin ? oFF.JoinType.INNER : oFF.JoinType.CONTAINS;
	extendedDimension.setJoinType(joinType);
	if (joinType === oFF.JoinType.INNER)
	{
		var systemConnect = this.getApplication().getConnectionPool().getSystemConnect(systemName);
		var serverMetadata = systemConnect.getServerMetadata();
		if (oFF.notNull(serverMetadata) && serverMetadata.supportsCapability(oFF.ServerService.ANALYTIC, oFF.InACapabilities.C143_EXTENDED_DIMENSIONS_JOIN_CARDINALITY))
		{
			extendedDimension.setJoinCardinality(oFF.JoinCardinality.N_ONE);
		}
	}
	extendedDimension.setVisibility(oFF.DimensionVisibility.METADATA);
	return extendedDimension;
};
oFF.QGeoManager.prototype.getChoroplethHierarchyLevel = function(systemName, hierarchyId, levelId)
{
	var hierarchiesResult = this.getChoroplethHierarchiesBySystemName(systemName);
	if (oFF.notNull(hierarchiesResult) && !hierarchiesResult.hasErrors())
	{
		var hierarchies = hierarchiesResult.getData();
		if (oFF.notNull(hierarchies))
		{
			var hierarchy = hierarchies.getByKey(hierarchyId);
			if (oFF.notNull(hierarchy))
			{
				var level = hierarchy.getLevelById(levelId);
				return level;
			}
		}
	}
	else
	{
		if (!this.isMasterSystemName(systemName))
		{
			return this.getChoroplethHierarchyLevel(this.getApplication().getSystemLandscape().getMasterSystemName(), hierarchyId, levelId);
		}
	}
	return null;
};
oFF.QGeoManager.prototype.getJoinFieldName = function(geoDimensionName, parentQueryManager, isAreaJoin, getPointOnly)
{
	if (oFF.notNull(parentQueryManager) && oFF.notNull(geoDimensionName))
	{
		var dimension = parentQueryManager.getQueryModel().getDimensionByName(geoDimensionName);
		if (oFF.notNull(dimension))
		{
			var joinField = null;
			var dimensionFields = dimension.getFields();
			for (var idxField = 0; idxField < dimensionFields.size(); idxField++)
			{
				var field = dimensionFields.getFieldAt(idxField);
				var valueType = field.getValueType();
				if (isAreaJoin)
				{
					if (oFF.XString.startsWith(oFF.XString.toUpperCase(field.getName()), oFF.QGeoConstants.CHOROPLETH_METADATA_AREA_ID))
					{
						joinField = field;
						break;
					}
				}
				else if (valueType.isSpatial())
				{
					if (valueType === oFF.XValueType.POINT)
					{
						joinField = field;
						if (getPointOnly)
						{
							break;
						}
					}
					else if (!getPointOnly)
					{
						joinField = field;
						break;
					}
				}
			}
			if (oFF.notNull(joinField))
			{
				return joinField.getName();
			}
		}
	}
	return null;
};
oFF.QGeoManager.prototype.isAreaEnriched = function(geoDimensionName, parentQueryManager)
{
	var isArea = false;
	var extendedDimensions = parentQueryManager.getQueryModel().getExtendedDimensions();
	if (oFF.notNull(extendedDimensions))
	{
		for (var index = 0; index < extendedDimensions.size(); index++)
		{
			var extendedDimension = extendedDimensions.get(index);
			if (oFF.XString.isEqual(geoDimensionName, extendedDimension.getName()))
			{
				isArea = extendedDimension.getLocationType() === oFF.LocationType.AREA;
				break;
			}
		}
	}
	return isArea;
};
oFF.QGeoManager.prototype.getAgileAreaFieldName = function(geoDimensionName, parentQueryManager, levelId)
{
	var dimension = parentQueryManager.getQueryModel().getDimensionByName(geoDimensionName);
	var agileAreaSemanticType = null;
	var levelNumber = oFF.XInteger.convertFromString(levelId);
	if (levelNumber >= 1 && levelNumber <= oFF.QGeoConstants.AGILE_AREA_SEMANTIC_TYPES.size())
	{
		agileAreaSemanticType = oFF.QGeoConstants.AGILE_AREA_SEMANTIC_TYPES.get(levelNumber - 1);
	}
	if (oFF.notNull(dimension) && oFF.notNull(agileAreaSemanticType))
	{
		var dimensionFields = dimension.getFields();
		for (var idxField = 0; idxField < dimensionFields.size(); idxField++)
		{
			var field = dimensionFields.getFieldAt(idxField);
			var semanticType = field.getSemanticType();
			if (oFF.notNull(semanticType) && oFF.XString.isEqual(semanticType, agileAreaSemanticType))
			{
				return field.getName();
			}
		}
	}
	return null;
};
oFF.QGeoManager.prototype.hasMatchingAreaField = function(geoDimensionName, parentQueryManager)
{
	var cmd = parentQueryManager.getConvenienceCommands();
	var dimension = parentQueryManager.getQueryModel().getDimensionByName(geoDimensionName);
	var gisAttributes = cmd.getGISAttributesForDimension(dimension);
	for (var idx = 0; idx < gisAttributes.size(); idx++)
	{
		var field = gisAttributes.get(idx);
		var fieldName = field.getName();
		var iterator = oFF.QGeoConstants.AREA_ENRICHED_PREFIXES.getIterator();
		while (iterator.hasNext())
		{
			if (oFF.XString.startsWith(oFF.XString.toUpperCase(fieldName), iterator.next()))
			{
				return true;
			}
		}
	}
	return false;
};
oFF.QGeoManager.prototype.getExtendedDimensionName = function(hierarchyId, level, geoDimensionName, parentQueryManager)
{
	var extendedDimensionName = oFF.XStringBuffer.create().append(geoDimensionName).append(oFF.QGeoManager.EXTENDED_DIMENSION_NAME_EXT).append(level.getLevelName()).append(oFF.QGeoManager.EXTENDED_DIMENSION_NAME_HIERARCHY).append(hierarchyId).append(oFF.QGeoManager.EXTENDED_DIMENSION_NAME_LEVEL).append(level.getLevelId());
	var queryModel = parentQueryManager.getQueryModel();
	var dimension = queryModel.getDimensionByName(extendedDimensionName.toString());
	if (oFF.notNull(dimension))
	{
		extendedDimensionName = extendedDimensionName.append("_");
	}
	var index = 1;
	while (oFF.notNull(dimension))
	{
		extendedDimensionName = extendedDimensionName.appendInt(index++);
		dimension = queryModel.getDimensionByName(extendedDimensionName.toString());
	}
	return extendedDimensionName.toString();
};
oFF.QGeoManager.prototype.getChoroplethDrillPath = function(syncType, listener, systemName, hierarchyId, levelIds, xPosition, yPosition, customIdentifier)
{
	var drillPathResult = null;
	var errorMessage = null;
	if (oFF.isNull(hierarchyId) || oFF.isNull(levelIds) || levelIds.isEmpty())
	{
		errorMessage = oFF.XMessage.createErrorWithCode(oFF.OriginLayer.UTILITY, oFF.ErrorCodes.CHOROPLETH_DRILL_PATH_INVALID_PARAMETERS, "HierarchyId and levelIds can not be null", null, false, null);
		drillPathResult = oFF.ExtResult.createWithMessage(errorMessage);
	}
	else
	{
		var theSystemName = systemName;
		var masterSystemName = this.getApplication().getSystemLandscape().getMasterSystemName();
		if (oFF.isNull(theSystemName))
		{
			theSystemName = masterSystemName;
		}
		var sortedLevelIds = oFF.XListOfString.createFromReadOnlyList(levelIds);
		sortedLevelIds.sortByDirection(oFF.XSortDirection.ASCENDING);
		var point = oFF.XPointValue.createWithPosition(xPosition, yPosition);
		point.setSrid(oFF.XIntegerValue.create(oFF.QGeoConstants.SPATIAL_REFERENCE_WGS_1984_WEB_MERCATOR_AUXILIARY_SPHERE));
		var requestKey = oFF.XStringUtils.concatenate5(oFF.QGeoManager.CHOROPLETH_DRILLPATH_IDENTIFIER, theSystemName, hierarchyId, sortedLevelIds.toString(), point.toString());
		drillPathResult = this.m_choroplethDrillPaths.getByKey(requestKey);
		if (oFF.isNull(drillPathResult))
		{
			var levelKeys = oFF.XListOfString.create();
			var levelInfos = oFF.XHashMapByString.create();
			for (var index = 0; index < sortedLevelIds.size(); index++)
			{
				var levelId = sortedLevelIds.get(index);
				var level = this.getChoroplethHierarchyLevel(systemName, hierarchyId, levelId);
				if (oFF.isNull(level))
				{
					errorMessage = oFF.XMessage.createErrorWithCode(oFF.OriginLayer.UTILITY, oFF.ErrorCodes.CHOROPLETH_DRILL_PATH_CHOROPLETH_HIERARCHIES_NOT_LOADED, "Choropleth hierarchy levels are either not loaded or not valid", null, false, null);
					drillPathResult = oFF.ExtResult.createWithMessage(errorMessage);
					break;
				}
				var levelKey = oFF.XStringUtils.concatenate5(requestKey, level.getSchemaName(), level.getPackageName(), level.getObjectName(), level.getLocation());
				var levels = levelInfos.getByKey(levelKey);
				if (oFF.isNull(levels))
				{
					levelKeys.add(levelKey);
					levelInfos.put(levelKey, oFF.XList.create());
					levels = levelInfos.getByKey(levelKey);
				}
				levels.add(level);
			}
			if (oFF.isNull(drillPathResult))
			{
				if (syncType === oFF.SyncType.BLOCKING)
				{
					this.processQueryManagerCreationForChoroplethDrillPath(theSystemName, syncType, levelKeys, levelInfos, point, requestKey);
					drillPathResult = this.processIntermediateDrillPaths(requestKey);
				}
				else
				{
					var listenerIdentifiers = this.m_listenerIdentifiers.getByKey(requestKey);
					if (oFF.notNull(listenerIdentifiers))
					{
						listenerIdentifiers.add(oFF.XPair.create(listener, customIdentifier));
					}
					else
					{
						listenerIdentifiers = oFF.XList.create();
						listenerIdentifiers.add(oFF.XPair.create(listener, customIdentifier));
						this.m_listenerIdentifiers.put(requestKey, listenerIdentifiers);
						this.processQueryManagerCreationForChoroplethDrillPath(theSystemName, syncType, levelKeys, levelInfos, point, requestKey);
					}
				}
			}
		}
	}
	if (oFF.notNull(drillPathResult) && oFF.notNull(listener))
	{
		listener.onChoroplethDrillPathsLoaded(drillPathResult, drillPathResult.getData(), customIdentifier);
	}
	return drillPathResult;
};
oFF.QGeoManager.prototype.getChoroplethDrillPathTableName = function(levels)
{
	var level = levels.get(0);
	var dataSourceName = oFF.XStringUtils.concatenate5(oFF.QGeoManager.CHOROPLETH_TABLE_PREFIX, level.getSchemaName(), "][", level.getPackageName(), "][");
	dataSourceName = oFF.XStringUtils.concatenate3(dataSourceName, level.getObjectName(), "]");
	return dataSourceName;
};
oFF.QGeoManager.prototype.processQueryManagerCreationForChoroplethDrillPath = function(systemName, syncType, levelKeys, levelInfos, point, requestKey)
{
	for (var index = 0; index < levelKeys.size(); index++)
	{
		var levelKey = levelKeys.get(index);
		var levels = levelInfos.getByKey(levelKey);
		if (syncType !== oFF.SyncType.BLOCKING)
		{
			this.m_levelKeys.put(levelKey, requestKey);
			this.m_levelInfos.put(levelKey, levels);
			this.m_syncTypes.put(levelKey, syncType);
			this.m_drillPoints.put(levelKey, point);
		}
		var dataSourceName = this.getChoroplethDrillPathTableName(levels);
		var drillPathTableKey = oFF.XStringUtils.concatenate3(oFF.QGeoManager.CHOROPLETH_DRILLPATH_IDENTIFIER, systemName, dataSourceName);
		var extResult = this.m_sharedQueryManagers.getByKey(drillPathTableKey);
		if (oFF.isNull(extResult))
		{
			var queryManager = this.getOlapEnv().getQueryManagerByDataSource(systemName, dataSourceName);
			if (oFF.notNull(queryManager))
			{
				extResult = oFF.ExtResult.create(queryManager.cloneQueryManager(), null);
				this.m_sharedQueryManagers.put(drillPathTableKey, extResult);
			}
		}
		if (oFF.isNull(extResult))
		{
			if (syncType === oFF.SyncType.BLOCKING)
			{
				extResult = this.getOlapEnv().processQueryManagerCreationWithDataSourceName(syncType, null, null, systemName, dataSourceName);
				this.m_sharedQueryManagers.put(drillPathTableKey, extResult);
			}
			else
			{
				var levelKeysPending = this.m_drillPathTableKeyToLevelKeys.getByKey(drillPathTableKey);
				if (oFF.notNull(levelKeysPending))
				{
					levelKeysPending.add(levelKey);
				}
				else
				{
					levelKeysPending = oFF.XListOfString.create();
					levelKeysPending.add(levelKey);
					this.m_drillPathTableKeyToLevelKeys.put(drillPathTableKey, levelKeysPending);
					this.getOlapEnv().processQueryManagerCreationWithDataSourceName(syncType, this, oFF.XStringValue.create(drillPathTableKey), systemName, dataSourceName);
				}
			}
		}
		if (oFF.notNull(extResult))
		{
			if (syncType === oFF.SyncType.BLOCKING)
			{
				this.processQueryExecutionForChoroplethDrillPath(extResult, extResult.getData(), syncType, levels, point, requestKey, null, oFF.XStringValue.create(levelKey));
			}
			else
			{
				this.processQueryExecutionForChoroplethDrillPath(extResult, extResult.getData(), syncType, levels, point, requestKey, this, oFF.XStringValue.create(levelKey));
			}
		}
	}
};
oFF.QGeoManager.prototype.processQueryExecutionForChoroplethDrillPath = function(extResult, queryManager, syncType, levels, point, requestKey, listener, customIdentifier)
{
	var xGuid = customIdentifier;
	var levelKey = xGuid.getString();
	if (extResult.isValid())
	{
		var clonedQueryManager = queryManager.cloneQueryManager();
		var errorMessage = null;
		var level = levels.get(0);
		var queryModel = clonedQueryManager.getQueryModel();
		var dynamicFilter = queryModel.getFilter().getDynamicFilter();
		var cartesianProduct = dynamicFilter.getCartesianProductWithDefault();
		var locationDimension = queryModel.getDimensionByName(level.getLocation());
		if (oFF.isNull(locationDimension))
		{
			errorMessage = oFF.XMessage.createErrorWithCode(oFF.OriginLayer.UTILITY, oFF.ErrorCodes.CHOROPLETH_DRILL_PATH_FIELD_NOT_FOUND, oFF.XStringUtils.concatenate2("Location dimension is not found: ", level.getLocation()), null, false, null);
		}
		else
		{
			var cmd = clonedQueryManager.getConvenienceCommands();
			var cartesianList1 = cartesianProduct.getCartesianListWithDefault(locationDimension);
			var locationKeyField = locationDimension.getKeyField();
			locationKeyField.setTextTransformation(oFF.TextTransformationType.SPATIAL_AS_GEOJSON);
			cartesianList1.setField(locationKeyField);
			var spatialFilter = cartesianList1.addNewCartesianElement();
			spatialFilter.setComparisonOperator(oFF.SpatialComparisonOperator.INTERSECTS);
			spatialFilter.setField(locationKeyField);
			spatialFilter.getLow().setPoint(point);
			if (level.isCustom())
			{
				cmd.moveDimensionToRows(oFF.QGeoConstants.CHOROPLETH_METADATA_CUSTOM_ID);
			}
			else
			{
				cmd.moveDimensionToRows(oFF.QGeoConstants.CHOROPLETH_METADATA_LEVEL);
				cmd.moveDimensionToRows(oFF.QGeoConstants.CHOROPLETH_METADATA_FEATURE_ID);
				var levelDimension = queryModel.getDimensionByName(oFF.QGeoConstants.CHOROPLETH_METADATA_LEVEL);
				if (oFF.isNull(levelDimension))
				{
					errorMessage = oFF.XMessage.createErrorWithCode(oFF.OriginLayer.UTILITY, oFF.ErrorCodes.CHOROPLETH_DRILL_PATH_FIELD_NOT_FOUND, "Level dimension is not found", null, false, null);
				}
				else
				{
					var cartesianList2 = cartesianProduct.getCartesianListWithDefault(levelDimension);
					var levelKeyField = levelDimension.getKeyField();
					cartesianList2.setField(levelKeyField);
					for (var i = 0; i < levels.size(); i++)
					{
						level = levels.get(i);
						var levelFilter = cartesianList2.addNewCartesianElement();
						levelFilter.configureSingleParameterExpression(oFF.XStringValue.create(level.getLevelId()), oFF.ComparisonOperator.EQUAL);
						levelFilter.setField(levelKeyField);
					}
				}
			}
			cmd.moveDimensionToRows(level.getLocation());
			var columnName = this.getColumnDimensionName(level);
			if (oFF.notNull(columnName))
			{
				cmd.moveDimensionToRows(columnName);
			}
		}
		if (oFF.isNull(errorMessage))
		{
			if (syncType !== oFF.SyncType.BLOCKING)
			{
				this.m_queryManagers.put(levelKey, clonedQueryManager);
			}
			var resultsetResult = clonedQueryManager.processQueryExecution(syncType, listener, customIdentifier);
			if (syncType === oFF.SyncType.BLOCKING)
			{
				this.processResultSetForChoroplethDrillPath(resultsetResult, resultsetResult.getData(), syncType, levels, levelKey, requestKey);
				oFF.XObjectExt.release(clonedQueryManager);
			}
		}
		else
		{
			this.processResultSetForChoroplethDrillPath(oFF.ExtResult.createWithMessage(errorMessage), null, syncType, levels, levelKey, requestKey);
			oFF.XObjectExt.release(clonedQueryManager);
		}
	}
	else
	{
		this.processResultSetForChoroplethDrillPath(oFF.ExtResult.createWithExternalMessages(null, extResult), null, syncType, levels, levelKey, requestKey);
	}
};
oFF.QGeoManager.prototype.getColumnDimensionName = function(level)
{
	var columns = level.getColumns();
	for (var index = 0; index < columns.size(); index++)
	{
		var column = columns.get(index);
		if (oFF.XString.isEqual(column.getText(), oFF.QGeoConstants.CHOROPLETH_LEVEL_COLUMN_LABEL_NAME))
		{
			return column.getName();
		}
	}
	return null;
};
oFF.QGeoManager.prototype.processResultSetForChoroplethDrillPath = function(extResult, resultSetContainer, syncType, levels, levelKey, requestKey)
{
	var drillPathResults = this.m_choroplethIntermediateDrillPaths.getByKey(requestKey);
	if (oFF.isNull(drillPathResults))
	{
		this.m_choroplethIntermediateDrillPaths.put(requestKey, oFF.XHashMapByString.create());
		drillPathResults = this.m_choroplethIntermediateDrillPaths.getByKey(requestKey);
	}
	if (extResult.isValid() && oFF.notNull(levels) && !levels.isEmpty())
	{
		var level = levels.get(0);
		var columnName = this.getColumnDimensionName(level);
		var locationName = level.getLocation();
		var drillPaths = oFF.XList.create();
		var cursorResultSet = resultSetContainer.getCursorResultSet();
		var cursorRowsAxis = cursorResultSet.getCursorRowsAxis();
		cursorRowsAxis.setTupleCursorBeforeStart();
		var levelIndex = -1;
		var idIndex = -1;
		var shapeIndex = -1;
		var areaNameIndex = -1;
		var rsDimensions = cursorRowsAxis.getRsDimensions();
		var rsDimensionCount = rsDimensions.size();
		for (var j = 0; j < rsDimensionCount; j++)
		{
			var rsDimension = rsDimensions.get(j);
			var dimensionName = rsDimension.getName();
			if (oFF.XString.isEqual(dimensionName, oFF.QGeoConstants.CHOROPLETH_METADATA_LEVEL))
			{
				levelIndex = j;
			}
			else if (oFF.XString.isEqual(dimensionName, oFF.QGeoConstants.CHOROPLETH_METADATA_FEATURE_ID) || oFF.XString.isEqual(dimensionName, oFF.QGeoConstants.CHOROPLETH_METADATA_CUSTOM_ID))
			{
				idIndex = j;
			}
			else if (oFF.XString.isEqual(dimensionName, locationName))
			{
				shapeIndex = j;
			}
			else if (oFF.notNull(columnName) && oFF.XString.isEqual(dimensionName, columnName))
			{
				areaNameIndex = j;
			}
		}
		var tuplesCount = cursorRowsAxis.getTuplesCount();
		var tupleElements = cursorRowsAxis.getTupleElementsCount();
		for (var i = 0; i < tuplesCount; i++)
		{
			cursorRowsAxis.nextTuple();
			var elementNames = oFF.XListOfString.create();
			for (var k = 0; k < tupleElements; k++)
			{
				cursorRowsAxis.nextTupleElement();
				while (cursorRowsAxis.hasNextFieldValue())
				{
					var fieldValue = cursorRowsAxis.nextFieldValue();
					elementNames.add(fieldValue.getValue().getStringRepresentation());
				}
			}
			var drillPath = oFF.QGeoChoroplethDrillPath.create();
			if (shapeIndex >= 0)
			{
				drillPath.setShape(elementNames.get(shapeIndex));
			}
			if (areaNameIndex >= 0)
			{
				drillPath.setAreaName(elementNames.get(areaNameIndex));
			}
			if (idIndex >= 0)
			{
				drillPath.setAreaId(elementNames.get(idIndex));
			}
			if (levelIndex >= 0)
			{
				drillPath.setLevelId(elementNames.get(levelIndex));
			}
			else
			{
				if (i < levels.size())
				{
					level = levels.get(i);
				}
				drillPath.setLevelId(level.getLevelId());
			}
			drillPath.setSRID(oFF.QGeoConstants.SPATIAL_REFERENCE_WGS_1984_WEB_MERCATOR_AUXILIARY_SPHERE);
			drillPaths.add(drillPath);
		}
		drillPathResults.put(levelKey, oFF.ExtResult.create(drillPaths, null));
	}
	else if (!extResult.isValid())
	{
		drillPathResults.put(levelKey, oFF.ExtResult.createWithExternalMessages(null, extResult));
	}
	else if (oFF.isNull(levels) || levels.isEmpty())
	{
		var errorMessage = oFF.XMessage.createErrorWithCode(oFF.OriginLayer.UTILITY, oFF.ErrorCodes.FAILED_TO_GET_CHOROPLETH_DRILL_PATH, "Levels are invalid", null, false, null);
		drillPathResults.put(levelKey, oFF.ExtResult.createWithMessage(errorMessage));
	}
	if (syncType !== oFF.SyncType.BLOCKING)
	{
		var levelKeys = oFF.XListOfString.create();
		var iterator = this.m_levelKeys.getKeysAsIteratorOfString();
		var key = null;
		while (iterator.hasNext())
		{
			key = iterator.next();
			if (oFF.XString.isEqual(requestKey, this.m_levelKeys.getByKey(key)))
			{
				levelKeys.add(key);
			}
		}
		if (drillPathResults.size() === levelKeys.size())
		{
			var drillPathResult = this.processIntermediateDrillPaths(requestKey);
			for (var index = 0; index < levelKeys.size(); index++)
			{
				key = levelKeys.get(index);
				this.m_levelKeys.remove(key);
				this.m_levelInfos.remove(key);
				this.m_drillPoints.remove(key);
				this.m_syncTypes.remove(key);
				var queryManager = this.m_queryManagers.remove(key);
				if (oFF.notNull(queryManager))
				{
					oFF.XObjectExt.release(queryManager);
				}
			}
			this.m_choroplethIntermediateDrillPaths.remove(requestKey);
			var listenerIdentifiers = this.m_listenerIdentifiers.remove(requestKey);
			for (var index1 = 0; index1 < listenerIdentifiers.size(); index1++)
			{
				var listenerIdentifier = listenerIdentifiers.get(index1);
				var listener = listenerIdentifier.getFirstObject();
				var identifier = listenerIdentifier.getSecondObject();
				if (oFF.notNull(listener))
				{
					listener.onChoroplethDrillPathsLoaded(drillPathResult, drillPathResult.getData(), identifier);
				}
			}
		}
	}
};
oFF.QGeoManager.prototype.processIntermediateDrillPaths = function(requestKey)
{
	var drillPathResults = this.m_choroplethIntermediateDrillPaths.remove(requestKey);
	var extResult = null;
	if (oFF.isNull(drillPathResults))
	{
		var errorMessage = oFF.XMessage.createErrorWithCode(oFF.OriginLayer.UTILITY, oFF.ErrorCodes.FAILED_TO_GET_CHOROPLETH_DRILL_PATH, "Failed to choropleth drill path", null, false, null);
		extResult = oFF.ExtResult.createWithMessage(errorMessage);
	}
	else
	{
		var drillPaths = oFF.XList.create();
		var messages = oFF.MessageManagerSimple.createMessageManager();
		var iterator = drillPathResults.getIterator();
		while (iterator.hasNext())
		{
			var drillPathResult = iterator.next();
			if (drillPathResult.hasErrors())
			{
				messages.copyAllMessages(drillPathResult);
			}
			else
			{
				drillPaths.addAll(drillPathResult.getData());
			}
		}
		if (messages.isValid())
		{
			drillPaths.sortByComparator(oFF.QGeoChoroplethDrillPathComparatorAsc.create());
			extResult = oFF.ExtResult.create(drillPaths, null);
		}
		else
		{
			extResult = oFF.ExtResult.createWithExternalMessages(null, messages);
		}
	}
	this.m_choroplethDrillPaths.put(requestKey, extResult);
	return extResult;
};
oFF.QGeoManager.prototype.isForChoroplethHierarchies = function(requestKey)
{
	return oFF.XString.startsWith(requestKey, oFF.QGeoManager.CHOROPLETH_HIERARCHIES_IDENTIFIER);
};
oFF.QGeoManager.prototype.isForChoroplethDrillPath = function(requestKey)
{
	return oFF.XString.startsWith(requestKey, oFF.QGeoManager.CHOROPLETH_DRILLPATH_IDENTIFIER);
};

oFF.QModelDimensionLinksManager = function() {};
oFF.QModelDimensionLinksManager.prototype = new oFF.QModelComponent();
oFF.QModelDimensionLinksManager.prototype._ff_c = "QModelDimensionLinksManager";

oFF.QModelDimensionLinksManager.create = function(context)
{
	var modelLinkManager = new oFF.QModelDimensionLinksManager();
	modelLinkManager.setupModelLinkManager(context);
	return modelLinkManager;
};
oFF.QModelDimensionLinksManager.prototype.m_dimensionLinksMap = null;
oFF.QModelDimensionLinksManager.prototype.setupModelLinkManager = function(context)
{
	this.setupModelComponentWithName(context, null, "ModelLinkManager");
	this.m_dimensionLinksMap = oFF.XHashMapByString.create();
};
oFF.QModelDimensionLinksManager.prototype.releaseObject = function()
{
	this.m_dimensionLinksMap = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_dimensionLinksMap);
};
oFF.QModelDimensionLinksManager.prototype.addDimensionLinkFromDimensionParts = function(storageName, firstDimensionLinkPart, secondDimensionLinkPart, linkOnMatchingHierarchies)
{
	var firstDatasetId = firstDimensionLinkPart.getQueryManagerKey();
	if (oFF.isNull(firstDatasetId))
	{
		throw oFF.XException.createIllegalArgumentException("firstDimensionLinkPart requires query manager key.");
	}
	var secondDatasetId = secondDimensionLinkPart.getQueryManagerKey();
	if (oFF.isNull(secondDatasetId))
	{
		throw oFF.XException.createIllegalArgumentException("secondDimensionLinkPart requires query manager key.");
	}
	var modelDimensionLinksList = this.m_dimensionLinksMap.getByKey(storageName);
	if (oFF.isNull(modelDimensionLinksList))
	{
		modelDimensionLinksList = oFF.XList.create();
		this.m_dimensionLinksMap.put(storageName, modelDimensionLinksList);
	}
	var modelDimensionLinks = oFF.ModelDimensionLinksManagerHelper.findModelDimensionLinksByDatasetIds(firstDatasetId, secondDatasetId, modelDimensionLinksList);
	if (oFF.isNull(modelDimensionLinks))
	{
		modelDimensionLinks = oFF.QModelDimensionLinks.create(this, firstDatasetId, secondDatasetId);
		modelDimensionLinksList.add(modelDimensionLinks);
	}
	modelDimensionLinks.addNewLinkFromParts(firstDimensionLinkPart, secondDimensionLinkPart, linkOnMatchingHierarchies);
	firstDimensionLinkPart.addSecondaryParent(modelDimensionLinks);
	secondDimensionLinkPart.addSecondaryParent(modelDimensionLinks);
};
oFF.QModelDimensionLinksManager.prototype.removeDimensionLink = function(storageName, firstDimensionLinkPart, secondDimensionLinkPart)
{
	var firstDatasetId = firstDimensionLinkPart.getQueryManagerKey();
	if (oFF.isNull(firstDatasetId))
	{
		throw oFF.XException.createIllegalArgumentException("firstDimensionLinkPart requires query manager key.");
	}
	var secondDatasetId = secondDimensionLinkPart.getQueryManagerKey();
	if (oFF.isNull(secondDatasetId))
	{
		throw oFF.XException.createIllegalArgumentException("secondDimensionLinkPart requires query manager key.");
	}
	var modelDimensionLinksList = this.m_dimensionLinksMap.getByKey(storageName);
	if (oFF.notNull(modelDimensionLinksList))
	{
		var modelDimensionLinks = oFF.ModelDimensionLinksManagerHelper.findModelDimensionLinksByDatasetIds(firstDatasetId, secondDatasetId, modelDimensionLinksList);
		if (oFF.notNull(modelDimensionLinks))
		{
			modelDimensionLinks.removeLinkByParts(firstDimensionLinkPart, secondDimensionLinkPart);
		}
	}
};
oFF.QModelDimensionLinksManager.prototype.removeAllDimensionLinks = function(storageName)
{
	var dimensionLinksList = this.m_dimensionLinksMap.getByKey(storageName);
	if (oFF.notNull(dimensionLinksList))
	{
		var dimensionLinksListIter = dimensionLinksList.getIterator();
		while (dimensionLinksListIter.hasNext())
		{
			var dimensionLinks = dimensionLinksListIter.next();
			dimensionLinks.clear();
		}
	}
};
oFF.QModelDimensionLinksManager.prototype.getModelDimensionLinksStorage = function(storageName, firstDatasetId, secondDatasetId)
{
	return oFF.ModelDimensionLinksManagerHelper.findModelDimensionLinksByDatasetIds(firstDatasetId, secondDatasetId, this.m_dimensionLinksMap.getByKey(storageName));
};
oFF.QModelDimensionLinksManager.prototype.getDimensionLinksByDatasetId = function(storageName, datasetId, reorderMatchingLinksByFirstDatasetId)
{
	var dimensionLinksList = this.m_dimensionLinksMap.getByKey(storageName);
	var matchingLinks = oFF.XList.create();
	if (oFF.notNull(dimensionLinksList))
	{
		var dimensionLinksListIter = dimensionLinksList.getIterator();
		while (dimensionLinksListIter.hasNext())
		{
			var dimensionLinks = dimensionLinksListIter.next();
			if (oFF.XString.isEqual(datasetId, dimensionLinks.getFirstDatasetId()) || oFF.XString.isEqual(datasetId, dimensionLinks.getSecondDatasetId()))
			{
				var dimensionLinksIter = dimensionLinks.getIterator();
				while (dimensionLinksIter.hasNext())
				{
					var dimensionLink = dimensionLinksIter.next();
					if (oFF.XString.isEqual(datasetId, dimensionLink.getFirstPart().getQueryManagerKey()))
					{
						matchingLinks.add(dimensionLink);
					}
					else if (oFF.XString.isEqual(datasetId, dimensionLink.getSecondPart().getQueryManagerKey()))
					{
						if (reorderMatchingLinksByFirstDatasetId)
						{
							matchingLinks.add(oFF.QDimensionLink.createDimensionLinkFromParts(this.getContext(), null, dimensionLink.getSecondPart(), dimensionLink.getFirstPart(), dimensionLink.isLinkOnMatchingHierarchies()));
						}
						else
						{
							matchingLinks.add(dimensionLink);
						}
					}
				}
			}
		}
	}
	return matchingLinks;
};
oFF.QModelDimensionLinksManager.prototype.getDimensionLinksByDatasetIds = function(storageName, firstDatasetId, secondDatasetId, reorderMatchLinksByFirstSecondDatasetId)
{
	var matchingLinks = oFF.XList.create();
	var modelDimensionLinks = oFF.ModelDimensionLinksManagerHelper.findModelDimensionLinksByDatasetIds(firstDatasetId, secondDatasetId, this.m_dimensionLinksMap.getByKey(storageName));
	if (oFF.notNull(modelDimensionLinks))
	{
		var modelDimensionLinksIter = modelDimensionLinks.getIterator();
		while (modelDimensionLinksIter.hasNext())
		{
			var dimensionLink = modelDimensionLinksIter.next();
			var dimensionLinkFirstDatasetId = dimensionLink.getFirstPart().getQueryManagerKey();
			var dimensionLinkSecondDatasetId = dimensionLink.getSecondPart().getQueryManagerKey();
			if (oFF.XString.isEqual(firstDatasetId, dimensionLinkFirstDatasetId) && oFF.XString.isEqual(secondDatasetId, dimensionLinkSecondDatasetId) || oFF.XString.isEqual(firstDatasetId, dimensionLinkSecondDatasetId) && oFF.XString.isEqual(secondDatasetId, dimensionLinkFirstDatasetId))
			{
				if (!reorderMatchLinksByFirstSecondDatasetId || oFF.XString.isEqual(firstDatasetId, dimensionLink.getFirstPart().getQueryManagerKey()))
				{
					matchingLinks.add(dimensionLink);
				}
				else
				{
					matchingLinks.add(oFF.QDimensionLink.createDimensionLinkFromParts(this.getContext(), null, dimensionLink.getSecondPart(), dimensionLink.getFirstPart(), dimensionLink.isLinkOnMatchingHierarchies()));
				}
			}
		}
	}
	return matchingLinks;
};
oFF.QModelDimensionLinksManager.prototype.getDimensionLinks = function(storageName)
{
	var modelDimensionLinksList = this.m_dimensionLinksMap.getByKey(storageName);
	if (oFF.isNull(modelDimensionLinksList))
	{
		modelDimensionLinksList = oFF.XList.create();
	}
	return modelDimensionLinksList;
};
oFF.QModelDimensionLinksManager.prototype.createBlendableQueryManager = function(storageName, primaryQueryManager, name)
{
	var keyRefStoreContext = oFF.QFactory.createKeyRefStoreContext(this, storageName);
	var blendableQueryManager = oFF.BlendableQueryManager.create(keyRefStoreContext, name);
	blendableQueryManager.setClientQueryObjectStorageName(storageName);
	if (oFF.notNull(primaryQueryManager))
	{
		blendableQueryManager.setPrimaryQueryManager(primaryQueryManager);
	}
	return blendableQueryManager;
};

oFF.HierarchyCatalogManager = function() {};
oFF.HierarchyCatalogManager.prototype = new oFF.QOlapSyncAction();
oFF.HierarchyCatalogManager.prototype._ff_c = "HierarchyCatalogManager";

oFF.HierarchyCatalogManager.OBJECT_VERSION = "objectVersion";
oFF.HierarchyCatalogManager.HIERARCHY_NAME = "hierarchyName";
oFF.HierarchyCatalogManager.VERSION_NAME = "versionName";
oFF.HierarchyCatalogManager.BW_NAME_KEY = "Name.KEY";
oFF.HierarchyCatalogManager.BW_TEXT_SHORT_TEXT = "Text.SHORT_TEXT";
oFF.HierarchyCatalogManager.BW_TEXT_MEDIUM_TEXT = "Text.MEDIUM_TEXT";
oFF.HierarchyCatalogManager.BW_TEXT_LONG_TEXT = "Text.LONG_TEXT";
oFF.HierarchyCatalogManager.BW_VERSION_DISPLAY_KEY = "Version.DISPLAY_KEY";
oFF.HierarchyCatalogManager.BW_VERSION_KEY = "Version.KEY";
oFF.HierarchyCatalogManager.BW_VERSION_LONG_TEXT = "Version.LONG_TEXT";
oFF.HierarchyCatalogManager.BW_DATE_TO_KEY = "DateTo.KEY";
oFF.HierarchyCatalogManager.BW_DATE_FROM = "DateFrom";
oFF.HierarchyCatalogManager.BW_DATE_FROM_KEY = "DateFrom.KEY";
oFF.HierarchyCatalogManager.BW_OWNER_KEY = "Owner.KEY";
oFF.HierarchyCatalogManager.BW_HIEID = "HieID";
oFF.HierarchyCatalogManager.BW_HIEID_KEY = "HieID.KEY";
oFF.HierarchyCatalogManager.BW_HIETYPE = "HieType";
oFF.HierarchyCatalogManager.BW_HIETYPE_KEY = "HieType.KEY";
oFF.HierarchyCatalogManager.BW_OBJVERS = "ObjVers";
oFF.HierarchyCatalogManager.BW_OBJVERS_KEY = "ObjVers.KEY";
oFF.HierarchyCatalogManager.BW_IS_REMOTE = "Is_Remote_Hier";
oFF.HierarchyCatalogManager.BW_IS_REMOTE_KEY = "Is_Remote_Hier.KEY";
oFF.HierarchyCatalogManager.BW_TYPE_CUSTOM_HIERARCHY = "0";
oFF.HierarchyCatalogManager.create = function(queryManager, dataSource, dimensionName, dimensionQueryModel)
{
	var object = new oFF.HierarchyCatalogManager();
	object.setupCatalogManager(queryManager, dataSource, dimensionName, dimensionQueryModel);
	return object;
};
oFF.HierarchyCatalogManager.prototype.m_filter = null;
oFF.HierarchyCatalogManager.prototype.m_operator = null;
oFF.HierarchyCatalogManager.prototype.m_dataSource = null;
oFF.HierarchyCatalogManager.prototype.m_dimensionName = null;
oFF.HierarchyCatalogManager.prototype.m_dimensionQueryModel = null;
oFF.HierarchyCatalogManager.prototype.m_filterHierarchyDate = null;
oFF.HierarchyCatalogManager.prototype.m_enableFilterHierarchyDate = false;
oFF.HierarchyCatalogManager.prototype.m_includeCustomHierarchies = false;
oFF.HierarchyCatalogManager.prototype.m_catalogResult = null;
oFF.HierarchyCatalogManager.prototype.setupCatalogManager = function(queryManager, dataSource, dimensionName, dimensionQueryModel)
{
	this.setupAction(null, null, null, queryManager);
	this.m_dataSource = dataSource;
	this.m_dimensionName = dimensionName;
	this.m_dimensionQueryModel = dimensionQueryModel;
	this.m_filter = oFF.XHashMapOfStringByString.create();
	this.m_operator = oFF.XHashMapByString.create();
};
oFF.HierarchyCatalogManager.prototype.isHierarchyLevelsRequest = function()
{
	var queryManager = this.getQueryManager();
	return oFF.notNull(queryManager) && oFF.XString.isEqual(queryManager.getDataSource().getName(), "$$HierarchyLevels$$");
};
oFF.HierarchyCatalogManager.prototype.releaseObject = function()
{
	this.m_dataSource = null;
	this.m_dimensionName = null;
	this.m_dimensionQueryModel = null;
	this.m_catalogResult = oFF.XObjectExt.release(this.m_catalogResult);
	this.m_filterHierarchyDate = oFF.XObjectExt.release(this.m_filterHierarchyDate);
	this.m_filter = oFF.XObjectExt.release(this.m_filter);
	this.m_operator = oFF.XObjectExt.release(this.m_operator);
	oFF.XObjectExt.release(this.getQueryManager());
	oFF.QOlapSyncAction.prototype.releaseObject.call( this );
};
oFF.HierarchyCatalogManager.prototype.processGetResult = function(syncType, listener, customIdentifier)
{
	return this.processSyncAction(syncType, listener, customIdentifier);
};
oFF.HierarchyCatalogManager.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onHierarchyCatalogResult(extResult, data, customIdentifier);
};
oFF.HierarchyCatalogManager.prototype.processSynchronization = function(syncType)
{
	var queryManager = this.getQueryManager();
	var queryModel = queryManager.getQueryModel();
	var commands = queryModel.getConvenienceCommands();
	commands.resetToDefault();
	if (queryManager.getSystemType().isTypeOf(oFF.SystemType.HANA))
	{
		this.processHana(commands);
	}
	else
	{
		this.processBW(commands);
	}
	this._addFilter(commands, "Name", this.getFilterHierarchyName(), this.getOperatorHierarchyName());
	this._addFilter(commands, "Version", this.getFilterVersionName(), this.getOperatorVersionName());
	queryManager.processQueryExecution(syncType, this, null);
	return true;
};
oFF.HierarchyCatalogManager.prototype._addFilter = function(commands, dimName, filterValue, operator)
{
	commands.clearFiltersByDimensionName(dimName);
	if (oFF.notNull(operator))
	{
		commands.addSingleMemberFilterByDimensionName(dimName, filterValue, operator);
	}
};
oFF.HierarchyCatalogManager.prototype.processHana = function(commands)
{
	var dataSource = this.m_dataSource;
	commands.addSimpleSingleMemberFilter("Type", dataSource.getType() === null ? null : dataSource.getType().getCamelCaseName());
	commands.addSimpleSingleMemberFilter("SchemaName", dataSource.getSchemaName());
	commands.addSimpleSingleMemberFilter("PackageName", dataSource.getPackageName());
	commands.addSimpleSingleMemberFilter("ObjectName", dataSource.getObjectName());
	commands.moveDimensionToRows("Dimension");
	commands.moveDimensionToRows("Name");
	commands.moveDimensionToRows("Version");
	commands.moveDimensionToRows("DateTo");
	if (this.isHierarchyLevelsRequest())
	{
		commands.moveDimensionToRows("$$HierarchyLevel$$");
		commands.moveDimensionToRows("$$HierarchyLevelName$$");
		commands.moveDimensionToRows("$$HierarchyLevelUniqueName$$");
		commands.moveDimensionToRows("$$HierarchyLevelCaption$$");
		commands.moveDimensionToRows("$$HierarchyLevelType$$");
	}
	else
	{
		commands.moveDimensionToRows("$$HierarchyName$$");
		commands.moveDimensionToRows("Description");
	}
	if (oFF.XStringUtils.isNotNullAndNotEmpty(this.m_dimensionName))
	{
		commands.addSimpleSingleMemberFilter("Dimension", this.m_dimensionName);
	}
	var queryModel = this.getQueryModel();
	if (oFF.notNull(this.m_dimensionQueryModel) && this.m_dimensionQueryModel.hasVariables() && oFF.notNull(queryModel))
	{
		var variableManager = queryModel.getVariableManager();
		oFF.XCollectionUtils.forEach(this.m_dimensionQueryModel.getVariables(),  function(variable){
			var copiedVariable = oFF.QFactory.createVariable(variableManager.getContext(), variableManager, variable);
			copiedVariable.setExternalRepresentation(variable);
			variableManager.addVariable(copiedVariable);
		}.bind(this));
	}
};
oFF.HierarchyCatalogManager.prototype.addDimensionAndField = function(commands, dimensionName, fieldName)
{
	commands.moveDimensionToRows(dimensionName);
	commands.addFieldToResultSet(dimensionName, fieldName);
};
oFF.HierarchyCatalogManager.prototype.processBW = function(commands)
{
	this.addDimensionAndField(commands, "Name", oFF.HierarchyCatalogManager.BW_NAME_KEY);
	commands.moveDimensionToRows("Text");
	commands.addFieldToResultSet("Text", oFF.HierarchyCatalogManager.BW_TEXT_SHORT_TEXT);
	commands.addFieldToResultSet("Text", oFF.HierarchyCatalogManager.BW_TEXT_MEDIUM_TEXT);
	commands.addFieldToResultSet("Text", oFF.HierarchyCatalogManager.BW_TEXT_LONG_TEXT);
	commands.moveDimensionToRows("Version");
	commands.addFieldToResultSet("Version", oFF.HierarchyCatalogManager.BW_VERSION_KEY);
	commands.addFieldToResultSet("Version", oFF.HierarchyCatalogManager.BW_VERSION_LONG_TEXT);
	this.addDimensionAndField(commands, "DateTo", oFF.HierarchyCatalogManager.BW_DATE_TO_KEY);
	this.addDimensionAndField(commands, oFF.HierarchyCatalogManager.BW_DATE_FROM, oFF.HierarchyCatalogManager.BW_DATE_FROM_KEY);
	this.addDimensionAndField(commands, "Owner", oFF.HierarchyCatalogManager.BW_OWNER_KEY);
	this.addDimensionAndField(commands, oFF.HierarchyCatalogManager.BW_HIEID, oFF.HierarchyCatalogManager.BW_HIEID_KEY);
	this.addDimensionAndField(commands, oFF.HierarchyCatalogManager.BW_OBJVERS, oFF.HierarchyCatalogManager.BW_OBJVERS_KEY);
	this.addDimensionAndField(commands, oFF.HierarchyCatalogManager.BW_IS_REMOTE, oFF.HierarchyCatalogManager.BW_IS_REMOTE_KEY);
	this._addFilter(commands, oFF.HierarchyCatalogManager.BW_OBJVERS, this.getFilterHierarchyObjectVersion(), this.getOperatorHierarchyObjectVersion());
	if (oFF.notNull(this.m_filterHierarchyDate) && this.m_enableFilterHierarchyDate)
	{
		var hierarchyDate = this.m_filterHierarchyDate.toSAPFormat();
		this._addFilter(commands, oFF.HierarchyCatalogManager.BW_DATE_FROM, hierarchyDate, oFF.ComparisonOperator.LESS_EQUAL);
		this._addFilter(commands, "DateTo", hierarchyDate, oFF.ComparisonOperator.GREATER_EQUAL);
	}
};
oFF.HierarchyCatalogManager.prototype.onQueryExecuted = function(extResult, resultSetContainer, customIdentifier)
{
	this.addAllMessages(extResult);
	if (extResult.isValid())
	{
		var classicResultSet = resultSetContainer.getClassicResultSet();
		var catalogResult = oFF.QFactory.createHierarchyCatalogResult();
		this.setupExt(catalogResult, classicResultSet, this.m_dimensionName);
		if (this.customHierarchiesIncluded())
		{
			var datasourceName = classicResultSet.getQueryManager().getSystemType().isTypeOf(oFF.SystemType.ABAP) ? null : this.m_dataSource.getName();
			this.addCustomHierarchies(catalogResult, classicResultSet, this.m_dimensionName, datasourceName, this.getOlapEnv().getCustomHierarchyRepository(), this.m_filter.getByKey(oFF.HierarchyCatalogManager.HIERARCHY_NAME));
		}
		this.m_catalogResult = catalogResult;
		this.setData(this.m_catalogResult);
	}
	this.endSync();
};
oFF.HierarchyCatalogManager.prototype.addCustomHierarchies = function(catalogResult, resultSet, dimensionName, datasourceName, customHierarchyRepo, hierarchyNameFilter)
{
	catalogResult.addAllItems(customHierarchyRepo._getCustomHierarchyCatalogItemsByDimensionName(resultSet.getQueryManager().getSystemName(), datasourceName, dimensionName, hierarchyNameFilter));
};
oFF.HierarchyCatalogManager.prototype.setupExt = function(catalogResult, resultSet, dimensionName)
{
	if (resultSet.getQueryModel().getSystemType().isTypeOf(oFF.SystemType.HANA))
	{
		if (this.isHierarchyLevelsRequest())
		{
			this.setupHanaHierarchyLevels(catalogResult, resultSet);
		}
		else
		{
			this.setupHana(catalogResult, resultSet);
		}
	}
	else
	{
		this.setupBW(catalogResult, resultSet, dimensionName);
	}
};
oFF.HierarchyCatalogManager.prototype.setupHanaHierarchyLevels = function(catalogResult, resultSet)
{
	var queryModel = resultSet.getQueryModel();
	var hierarchyNameField = this.getHanaKeyField(queryModel, "Name");
	var versionNameField = this.getHanaKeyField(queryModel, "Version");
	var dateToField = this.getHanaKeyField(queryModel, "DateTo");
	var dimensionNameField = this.getHanaKeyField(queryModel, "Dimension");
	var levelField = this.getHanaKeyField(queryModel, "$$HierarchyLevel$$");
	var levelNameField = this.getHanaKeyField(queryModel, "$$HierarchyLevelName$$");
	var levelUniqueNameField = this.getHanaKeyField(queryModel, "$$HierarchyLevelUniqueName$$");
	var levelCaptionField = this.getHanaKeyField(queryModel, "$$HierarchyLevelCaption$$");
	var levelTypeField = this.getHanaKeyField(queryModel, "$$HierarchyLevelType$$");
	var rowsAxis = resultSet.getRowsAxis();
	var tuplesCount = rowsAxis.getTuplesCount();
	for (var i = 0; i < tuplesCount; i++)
	{
		var tuple = rowsAxis.getTupleAt(i);
		var hierarchyName = oFF.notNull(hierarchyNameField) ? tuple.getStringByField(hierarchyNameField) : null;
		if (oFF.XStringUtils.isNullOrEmpty(hierarchyName))
		{
			continue;
		}
		var levels;
		var item = oFF.XCollectionUtils.findFirst(catalogResult.getObjects(),  function(catalogItem){
			return oFF.XString.isEqual(catalogItem.getHierarchyUniqueName(), hierarchyName);
		}.bind(this));
		if (oFF.isNull(item))
		{
			levels = oFF.XList.create();
			item = oFF.HierarchyCatalogItem.createCatalogItem();
			item.setHierarchyLevels(levels);
			item.setHierarchyName(hierarchyName);
			item.setHierarchyUniqueName(hierarchyName);
			item.setSupportsHierarchyLevels(true);
			if (oFF.notNull(dimensionNameField))
			{
				item.setDimensionName(tuple.getStringByField(dimensionNameField));
			}
			if (oFF.notNull(versionNameField))
			{
				item.setVersionName(tuple.getStringByField(versionNameField));
			}
			if (oFF.notNull(dateToField))
			{
				var dateToFieldString = tuple.getStringByField(dateToField);
				if (oFF.XStringUtils.isNotNullAndNotEmpty(dateToFieldString))
				{
					item.setDateTo(oFF.XDate.createDateFromIsoFormat(dateToFieldString));
				}
			}
			catalogResult.addItem(item);
		}
		else
		{
			levels = item.getHierarchyLevels();
		}
		var level = oFF.HierarchyCatalogLevel.createCatalogLevel();
		levels.add(level);
		if (oFF.notNull(levelField))
		{
			var levelValue = oFF.XInteger.convertFromStringWithDefault(tuple.getStringByField(levelField), -1);
			if (levelValue > -1)
			{
				level.setLevel(levelValue);
			}
		}
		if (oFF.notNull(levelTypeField))
		{
			var levelTypeValue = oFF.XInteger.convertFromStringWithDefault(tuple.getStringByField(levelTypeField), -1);
			if (levelTypeValue > -1)
			{
				level.setLevelType(oFF.QInAConverter.lookupHierarchyLevelType(levelTypeValue));
			}
		}
		if (oFF.notNull(levelNameField))
		{
			level.setLevelName(tuple.getStringByField(levelNameField));
		}
		if (oFF.notNull(levelUniqueNameField))
		{
			level.setLevelUniqueName(tuple.getStringByField(levelUniqueNameField));
		}
		if (oFF.notNull(levelCaptionField))
		{
			level.setLevelDescription(tuple.getStringByField(levelCaptionField));
		}
	}
};
oFF.HierarchyCatalogManager.prototype.setupHana = function(catalogResult, resultSet)
{
	var queryModel = resultSet.getQueryModel();
	var dimensionNameField = this.getHanaKeyField(queryModel, "Dimension");
	var hierarchyNameField = this.getHanaKeyField(queryModel, "Name");
	var hierarchyUniqueNameField = this.getHanaKeyField(queryModel, "$$HierarchyName$$");
	var hierarchyDescriptionField = this.getHanaKeyField(queryModel, "Description");
	var versionNameField = this.getHanaKeyField(queryModel, "Version");
	var dateToField = this.getHanaKeyField(queryModel, "DateTo");
	var rowsAxis = resultSet.getRowsAxis();
	var tuplesCount = rowsAxis.getTuplesCount();
	for (var i = 0; i < tuplesCount; i++)
	{
		var tuple = rowsAxis.getTupleAt(i);
		var item = oFF.HierarchyCatalogItem.createCatalogItem();
		if (oFF.notNull(dimensionNameField))
		{
			item.setDimensionName(tuple.getStringByField(dimensionNameField));
		}
		if (oFF.notNull(hierarchyNameField))
		{
			item.setHierarchyName(tuple.getStringByField(hierarchyNameField));
		}
		if (oFF.notNull(hierarchyUniqueNameField))
		{
			item.setHierarchyUniqueName(tuple.getStringByField(hierarchyUniqueNameField));
		}
		if (oFF.notNull(hierarchyDescriptionField))
		{
			item.setHierarchyLongText(tuple.getStringByField(hierarchyDescriptionField));
		}
		if (oFF.notNull(versionNameField))
		{
			item.setVersionName(tuple.getStringByField(versionNameField));
		}
		if (oFF.notNull(dateToField))
		{
			var dateToFieldString = tuple.getStringByField(dateToField);
			if (oFF.XStringUtils.isNotNullAndNotEmpty(dateToFieldString))
			{
				item.setDateTo(oFF.XDate.createDateFromIsoFormat(dateToFieldString));
			}
		}
		catalogResult.addItem(item);
	}
};
oFF.HierarchyCatalogManager.prototype.getHanaKeyField = function(queryModel, dimensionName)
{
	var dimension = queryModel.getDimensionByName(dimensionName);
	return oFF.notNull(dimension) ? dimension.getFieldByName(oFF.XStringUtils.concatenate2("Key", dimensionName)) : null;
};
oFF.HierarchyCatalogManager.prototype.setupBW = function(catalogResult, resultSet, dimensionName)
{
	var queryModel = resultSet.getQueryModel();
	var commands = queryModel.getConvenienceCommands();
	var hierarchyNameField = queryModel.getDimensionByName("Name").getFieldByName(oFF.HierarchyCatalogManager.BW_NAME_KEY);
	var hierarchyShortTextField = this.getFieldIfPresent(commands, queryModel, "Text", oFF.HierarchyCatalogManager.BW_TEXT_SHORT_TEXT);
	var hierarchyMediumTextField = this.getFieldIfPresent(commands, queryModel, "Text", oFF.HierarchyCatalogManager.BW_TEXT_MEDIUM_TEXT);
	var hierarchyLongTextField = this.getFieldIfPresent(commands, queryModel, "Text", oFF.HierarchyCatalogManager.BW_TEXT_LONG_TEXT);
	var versionDimension = queryModel.getDimensionByName("Version");
	var versionDisplayKeyField = versionDimension.getFieldByName(oFF.HierarchyCatalogManager.BW_VERSION_DISPLAY_KEY);
	var versionNameField = versionDimension.getFieldByName(oFF.HierarchyCatalogManager.BW_VERSION_KEY);
	var versionLongTextField = versionDimension.getFieldByName(oFF.HierarchyCatalogManager.BW_VERSION_LONG_TEXT);
	var dataToField = queryModel.getDimensionByName("DateTo").getFieldByName(oFF.HierarchyCatalogManager.BW_DATE_TO_KEY);
	var dataFromField = this.getFieldIfPresent(commands, queryModel, oFF.HierarchyCatalogManager.BW_DATE_FROM, oFF.HierarchyCatalogManager.BW_DATE_FROM_KEY);
	var ownerField = this.getFieldIfPresent(commands, queryModel, "Owner", oFF.HierarchyCatalogManager.BW_OWNER_KEY);
	var idField = this.getFieldIfPresent(commands, queryModel, oFF.HierarchyCatalogManager.BW_HIEID, oFF.HierarchyCatalogManager.BW_HIEID_KEY);
	var typeField = this.getFieldIfPresent(commands, queryModel, oFF.HierarchyCatalogManager.BW_HIETYPE, oFF.HierarchyCatalogManager.BW_HIETYPE_KEY);
	var objVersField = this.getFieldIfPresent(commands, queryModel, oFF.HierarchyCatalogManager.BW_OBJVERS, oFF.HierarchyCatalogManager.BW_OBJVERS_KEY);
	var isRemoteField = this.getFieldIfPresent(commands, queryModel, oFF.HierarchyCatalogManager.BW_IS_REMOTE, oFF.HierarchyCatalogManager.BW_IS_REMOTE_KEY);
	var connection = resultSet.getQueryManager().getConnection();
	var customHierarchySessionData = oFF.notNull(connection) ? connection.getCustomObject(oFF.CustomHierarchySessionData.CUSTOM_HIERARCHY_SESSION_DATA) : null;
	var rowsAxis = resultSet.getRowsAxis();
	var tuplesCount = rowsAxis.getTuplesCount();
	for (var i = 0; i < tuplesCount; i++)
	{
		var tuple = rowsAxis.getTupleAt(i);
		var type = oFF.notNull(typeField) ? tuple.getStringByField(typeField) : null;
		var hierarchyName = oFF.notNull(hierarchyNameField) ? tuple.getStringByField(hierarchyNameField) : null;
		if (oFF.XString.isEqual(type, oFF.HierarchyCatalogManager.BW_TYPE_CUSTOM_HIERARCHY) && oFF.notNull(customHierarchySessionData) && customHierarchySessionData.getHierarchyDefinitionByName(hierarchyName) !== null)
		{
			continue;
		}
		var item = oFF.HierarchyCatalogItem.createCatalogItem();
		item.setDimensionName(dimensionName);
		if (oFF.notNull(hierarchyName))
		{
			item.setHierarchyName(hierarchyName);
		}
		if (oFF.notNull(hierarchyShortTextField))
		{
			item.setHierarchyShortText(tuple.getStringByField(hierarchyShortTextField));
		}
		if (oFF.notNull(hierarchyMediumTextField))
		{
			item.setHierarchyMediumText(tuple.getStringByField(hierarchyMediumTextField));
		}
		if (oFF.notNull(hierarchyLongTextField))
		{
			item.setHierarchyLongText(tuple.getStringByField(hierarchyLongTextField));
		}
		if (oFF.notNull(versionNameField))
		{
			item.setVersionName(tuple.getStringByField(versionNameField));
		}
		if (oFF.notNull(versionDisplayKeyField))
		{
			item.setVersionDisplayKey(tuple.getStringByField(versionDisplayKeyField));
		}
		if (oFF.notNull(versionLongTextField))
		{
			item.setVersionDescription(tuple.getStringByField(versionLongTextField));
		}
		if (oFF.notNull(dataToField))
		{
			var dateToValue = tuple.getStringByField(dataToField);
			if (oFF.XStringUtils.isNotNullAndNotEmpty(dateToValue))
			{
				item.setDateTo(oFF.XDate.createDateFromSAPFormat(dateToValue));
			}
		}
		if (oFF.notNull(dataFromField))
		{
			var dateFromValue = tuple.getStringByField(dataFromField);
			if (oFF.XStringUtils.isNotNullAndNotEmpty(dateFromValue))
			{
				item.setDateFrom(oFF.XDate.createDateFromSAPFormat(dateFromValue));
			}
		}
		if (oFF.notNull(ownerField))
		{
			item.setOwner(tuple.getStringByField(ownerField));
		}
		if (oFF.notNull(idField))
		{
			item.setHierId(tuple.getStringByField(idField));
		}
		if (oFF.notNull(type))
		{
			item.setHierType(type);
		}
		if (oFF.notNull(objVersField))
		{
			item.setObjectVersion(tuple.getStringByField(objVersField));
		}
		if (oFF.notNull(isRemoteField))
		{
			var isRemote = false;
			if (isRemoteField.getValueType() === oFF.XValueType.STRING)
			{
				if (oFF.XString.isEqual(tuple.getStringByField(isRemoteField), "X"))
				{
					isRemote = true;
				}
			}
			else if (isRemoteField.getValueType() === oFF.XValueType.BOOLEAN)
			{
				isRemote = tuple.getBooleanByField(isRemoteField);
			}
			item.setIsRemote(isRemote);
		}
		catalogResult.addItem(item);
	}
};
oFF.HierarchyCatalogManager.prototype.getFieldIfPresent = function(commands, queryModel, dimensionName, fieldName)
{
	if (commands.containsResultSetField(dimensionName, fieldName))
	{
		return queryModel.getDimensionByName(dimensionName).getFieldByName(fieldName);
	}
	return null;
};
oFF.HierarchyCatalogManager.prototype.setFilterHierarchyName = function(hierarchyName, enable)
{
	if (enable)
	{
		this.setFilterHierarchyNameWithOperator(hierarchyName, oFF.ComparisonOperator.EQUAL);
	}
	else
	{
		this.setFilterHierarchyNameWithOperator(hierarchyName, null);
	}
};
oFF.HierarchyCatalogManager.prototype.assertComparisonOperator = function(comparisonOperator)
{
	if (oFF.notNull(comparisonOperator) && comparisonOperator !== oFF.ComparisonOperator.EQUAL && comparisonOperator !== oFF.ComparisonOperator.MATCH)
	{
		throw oFF.XException.createRuntimeException("illegal comparison operator");
	}
};
oFF.HierarchyCatalogManager.prototype._setFilterInternal = function(key, value, operator)
{
	this.assertComparisonOperator(operator);
	this.m_filter.put(key, value);
	this.m_operator.put(key, operator);
	this.resetSyncState();
};
oFF.HierarchyCatalogManager.prototype.setFilterHierarchyNameWithOperator = function(hierarchyName, comparisonOperator)
{
	this._setFilterInternal(oFF.HierarchyCatalogManager.HIERARCHY_NAME, hierarchyName, comparisonOperator);
};
oFF.HierarchyCatalogManager.prototype.getOperatorHierarchyName = function()
{
	return this.m_operator.getByKey(oFF.HierarchyCatalogManager.HIERARCHY_NAME);
};
oFF.HierarchyCatalogManager.prototype.getFilterHierarchyName = function()
{
	return this.m_filter.getByKey(oFF.HierarchyCatalogManager.HIERARCHY_NAME);
};
oFF.HierarchyCatalogManager.prototype.isFilterHierarchyNameEnabled = function()
{
	return this.getOperatorHierarchyName() !== null;
};
oFF.HierarchyCatalogManager.prototype.setFilterVersionName = function(versionName, enable)
{
	if (enable)
	{
		this.setFilterVersionNameWithOperator(versionName, oFF.ComparisonOperator.EQUAL);
	}
	else
	{
		this.setFilterVersionNameWithOperator(versionName, null);
	}
};
oFF.HierarchyCatalogManager.prototype.setFilterVersionNameWithOperator = function(versionName, comparisonOperator)
{
	this._setFilterInternal(oFF.HierarchyCatalogManager.VERSION_NAME, versionName, comparisonOperator);
};
oFF.HierarchyCatalogManager.prototype.getOperatorVersionName = function()
{
	return this.m_operator.getByKey(oFF.HierarchyCatalogManager.VERSION_NAME);
};
oFF.HierarchyCatalogManager.prototype.getFilterVersionName = function()
{
	return this.m_filter.getByKey(oFF.HierarchyCatalogManager.VERSION_NAME);
};
oFF.HierarchyCatalogManager.prototype.isFilterVersionNameEnabled = function()
{
	return this.getOperatorVersionName() !== null;
};
oFF.HierarchyCatalogManager.prototype.setFilterHierarchyObjectVersion = function(objectVersion, enable)
{
	if (enable)
	{
		this.setFilterHierarchyObjectVersionWithOperator(objectVersion, oFF.ComparisonOperator.EQUAL);
	}
	else
	{
		this.setFilterHierarchyObjectVersionWithOperator(objectVersion, null);
	}
};
oFF.HierarchyCatalogManager.prototype.setFilterHierarchyObjectVersionWithOperator = function(objectVersion, comparisonOperator)
{
	this._setFilterInternal(oFF.HierarchyCatalogManager.OBJECT_VERSION, objectVersion, comparisonOperator);
};
oFF.HierarchyCatalogManager.prototype.getOperatorHierarchyObjectVersion = function()
{
	return this.m_operator.getByKey(oFF.HierarchyCatalogManager.OBJECT_VERSION);
};
oFF.HierarchyCatalogManager.prototype.getFilterHierarchyObjectVersion = function()
{
	return this.m_filter.getByKey(oFF.HierarchyCatalogManager.OBJECT_VERSION);
};
oFF.HierarchyCatalogManager.prototype.isFilterHierarchyObjectVersionEnabled = function()
{
	return this.getOperatorHierarchyObjectVersion() !== null;
};
oFF.HierarchyCatalogManager.prototype.setFilterHierarchyDate = function(date, enable)
{
	if (oFF.isNull(date))
	{
		this.m_filterHierarchyDate = oFF.XObjectExt.release(this.m_filterHierarchyDate);
	}
	else
	{
		if (oFF.isNull(this.m_filterHierarchyDate))
		{
			this.m_filterHierarchyDate = oFF.XDate.createDateWithValues(date.getYear(), date.getMonthOfYear(), date.getDayOfMonth());
		}
		else
		{
			this.m_filterHierarchyDate.resetValue(date);
		}
	}
	this.resetSyncState();
	this.m_enableFilterHierarchyDate = enable;
};
oFF.HierarchyCatalogManager.prototype.getFilterHierarchyDate = function()
{
	return this.m_filterHierarchyDate;
};
oFF.HierarchyCatalogManager.prototype.setIncludeCustomHierarchies = function(includeCustomHierarchies)
{
	this.m_includeCustomHierarchies = includeCustomHierarchies;
	this.resetSyncState();
};
oFF.HierarchyCatalogManager.prototype.customHierarchiesIncluded = function()
{
	return this.m_includeCustomHierarchies;
};
oFF.HierarchyCatalogManager.prototype.getVariableManager = function()
{
	var queryModel = this.getQueryModel();
	return oFF.notNull(queryModel) ? queryModel.getVariableManager() : null;
};

oFF.QmShutdownAction = function() {};
oFF.QmShutdownAction.prototype = new oFF.QOlapSyncAction();
oFF.QmShutdownAction.prototype._ff_c = "QmShutdownAction";

oFF.QmShutdownAction.createAndRun = function(syncType, listener, customIdentifier, parent)
{
	var newObject = new oFF.QmShutdownAction();
	newObject.setupActionAndRun(syncType, listener, customIdentifier, parent);
	return newObject;
};
oFF.QmShutdownAction.prototype.m_providerShutdownAction = null;
oFF.QmShutdownAction.prototype.releaseObject = function()
{
	this.m_providerShutdownAction = null;
	oFF.QOlapSyncAction.prototype.releaseObject.call( this );
};
oFF.QmShutdownAction.prototype.processSynchronization = function(syncType)
{
	var parent = this.getActionContext();
	if (oFF.notNull(parent))
	{
		if (parent.getLifeCycleState() !== oFF.LifeCycleState.ACTIVE)
		{
			this.addError(oFF.ErrorCodes.INVALID_STATE, "Query Manager cannot be shutdown, it is not in active state");
			return false;
		}
		parent.setLifeCycleState(oFF.LifeCycleState.SHUTTING_DOWN);
		this.m_providerShutdownAction = parent.processProviderShutdown(syncType, this, null);
		return true;
	}
	return false;
};
oFF.QmShutdownAction.prototype.onProviderShutdown = function(extResult, queryProvider, customIdentifier)
{
	this.addAllMessages(extResult);
	var parent = this.getActionContext();
	if (oFF.notNull(parent))
	{
		parent.setLifeCycleState(oFF.LifeCycleState.TERMINATED);
	}
	this.setData(parent);
	this.endSync();
};
oFF.QmShutdownAction.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onQueryManagerRelease(extResult, data, customIdentifier);
};
oFF.QmShutdownAction.prototype.cancelSynchronization = function()
{
	oFF.QOlapSyncAction.prototype.cancelSynchronization.call( this );
	this.m_providerShutdownAction.cancelSynchronization();
};

oFF.QueryManager = function() {};
oFF.QueryManager.prototype = new oFF.DfService();
oFF.QueryManager.prototype._ff_c = "QueryManager";

oFF.QueryManager.prototype.m_name = null;
oFF.QueryManager.prototype.m_dataSource = null;
oFF.QueryManager.prototype.m_lifeCycleState = null;
oFF.QueryManager.prototype.m_systemDescription = null;
oFF.QueryManager.prototype.m_queryModel = null;
oFF.QueryManager.prototype.m_activeContainer = null;
oFF.QueryManager.prototype.m_convenienceCmds = null;
oFF.QueryManager.prototype.m_metadataModel = null;
oFF.QueryManager.prototype.m_directVariableTransferConsumer = false;
oFF.QueryManager.prototype.m_mode = null;
oFF.QueryManager.prototype.m_processorStateListeners = null;
oFF.QueryManager.prototype.m_queryExecutedListener = null;
oFF.QueryManager.prototype.m_beforeQueryExecutionListener = null;
oFF.QueryManager.prototype.m_variableProcessorPreviousState = null;
oFF.QueryManager.prototype.m_variableProcessorState = null;
oFF.QueryManager.prototype.m_hasPreparedAfterVariables = false;
oFF.QueryManager.prototype.m_planningManager = null;
oFF.QueryManager.prototype.m_dimensionsToClone = null;
oFF.QueryManager.prototype.m_dimensionsRequestedFromClient = null;
oFF.QueryManager.prototype.m_preQueryExecutor = null;
oFF.QueryManager.prototype.m_enableHierarchyToUDHConversion = false;
oFF.QueryManager.prototype.m_includePerformanceData = null;
oFF.QueryManager.prototype.m_myNameAsMicroCube = null;
oFF.QueryManager.prototype.m_lovManager = null;
oFF.QueryManager.prototype.m_cacheHintsEnabled = false;
oFF.QueryManager.prototype.m_isMetadataCached = false;
oFF.QueryManager.prototype.m_preQueryName = null;
oFF.QueryManager.prototype.m_suppressExitVariableValues = false;
oFF.QueryManager.prototype.m_keyRefSerializationEnabled = false;
oFF.QueryManager.prototype.m_clientQueryObjectStorageName = null;
oFF.QueryManager.prototype.m_modCounterState = null;
oFF.QueryManager.prototype.m_disableExitVariables = false;
oFF.QueryManager.prototype.m_documentsService = null;
oFF.QueryManager.prototype.setupService = function(serviceConfigInfo)
{
	oFF.DfService.prototype.setupService.call( this , serviceConfigInfo);
	var config = serviceConfigInfo;
	var dataSource = config.getDataSource();
	var targetDataSource = null;
	if (oFF.notNull(dataSource))
	{
		targetDataSource = dataSource.clone();
	}
	else
	{
		targetDataSource = oFF.QDataSource.create();
	}
	this.setDataSource(targetDataSource);
};
oFF.QueryManager.prototype.getComponentType = function()
{
	return this.getOlapComponentType();
};
oFF.QueryManager.prototype.getOlapComponentType = function()
{
	return oFF.OlapComponentType.QUERY_MANAGER;
};
oFF.QueryManager.prototype.releaseObject = function()
{
	var olapEnvironmentBase = this.getOlapEnvironmentBase();
	if (oFF.notNull(olapEnvironmentBase))
	{
		olapEnvironmentBase.getFilterManager().releaseExternalizedFilter(this);
		olapEnvironmentBase.unregisterQueryManager(this);
		if (oFF.notNull(this.m_myNameAsMicroCube))
		{
			olapEnvironmentBase.removeMicroCubeName(this.getSystemName(), this.m_myNameAsMicroCube);
			this.m_myNameAsMicroCube = null;
		}
	}
	this.m_convenienceCmds = oFF.XObjectExt.release(this.m_convenienceCmds);
	this.m_activeContainer = oFF.XObjectExt.release(this.m_activeContainer);
	this.m_processorStateListeners = oFF.XObjectExt.release(this.m_processorStateListeners);
	this.m_queryModel = oFF.XObjectExt.release(this.m_queryModel);
	this.setLifeCycleState(oFF.LifeCycleState.RELEASED);
	this.m_metadataModel = oFF.XObjectExt.release(this.m_metadataModel);
	this.m_planningManager = oFF.XObjectExt.release(this.m_planningManager);
	this.m_preQueryExecutor = oFF.XObjectExt.release(this.m_preQueryExecutor);
	this.m_systemDescription = null;
	this.m_variableProcessorPreviousState = null;
	this.m_variableProcessorState = null;
	this.m_queryExecutedListener = null;
	this.m_beforeQueryExecutionListener = null;
	this.m_dimensionsToClone = oFF.XObjectExt.release(this.m_dimensionsToClone);
	this.m_dimensionsRequestedFromClient = oFF.XObjectExt.release(this.m_dimensionsRequestedFromClient);
	this.m_includePerformanceData = null;
	this.m_lovManager = oFF.XObjectExt.release(this.m_lovManager);
	this.m_clientQueryObjectStorageName = null;
	this.m_modCounterState = oFF.XObjectExt.release(this.m_modCounterState);
	this.m_documentsService = oFF.XObjectExt.release(this.m_documentsService);
	oFF.DfService.prototype.releaseObject.call( this );
};
oFF.QueryManager.prototype.setupValues = function()
{
	this.m_lifeCycleState = oFF.LifeCycleState.INITIAL;
	this.m_activeContainer = oFF.ResultSetContainer.create(this, null);
	this.m_variableProcessorState = oFF.VariableProcessorState.CHANGEABLE_STARTUP;
	var olapEnvironmentBase = this.getOlapEnvironmentBase();
	olapEnvironmentBase.registerQueryManager(this);
	this.m_queryExecutedListener = oFF.XSimpleMap.create();
	this.m_beforeQueryExecutionListener = oFF.XSimpleMap.create();
	this.m_includePerformanceData = oFF.TriStateBool._DEFAULT;
	this.m_isMetadataCached = false;
	this.m_keyRefSerializationEnabled = true;
	this.m_clientQueryObjectStorageName = null;
};
oFF.QueryManager.prototype.setupClone = function(origin, cloneMode, dataSource)
{
	var application = origin.getApplication();
	var serviceConfig = origin.getServiceConfig();
	var serviceConfigClone;
	if (cloneMode === oFF.QueryCloneMode.MICRO_CUBE)
	{
		serviceConfigClone = serviceConfig.cloneUsingExtDataSource(dataSource);
	}
	else
	{
		serviceConfigClone = serviceConfig.clone();
	}
	oFF.DfService.prototype.setupService.call( this , serviceConfigClone);
	serviceConfigClone.linkToQueryManager(this);
	var connectionPool = application.getConnectionPool();
	var origSystemDescription = origin.getSystemDescription();
	var originConnection = origin.getConnection();
	var cloneConnection = originConnection;
	if (oFF.isNull(originConnection))
	{
		cloneConnection = connectionPool.getConnection(origSystemDescription.getSystemName());
	}
	else if (originConnection.useSessionUrlRewrite() && connectionPool.getMaximumSharedConnections(origSystemDescription.getSystemName()) > 1)
	{
		cloneConnection = connectionPool.getConnectionExt(origSystemDescription.getSystemName(), false, originConnection.getName());
		if (originConnection.getWebServicePathForBLOBs() !== null)
		{
			cloneConnection.setWebServicePathForBLOBs(originConnection.getWebServicePathForBLOBs().getPath());
		}
	}
	if (cloneMode === oFF.QueryCloneMode.MICRO_CUBE)
	{
		this.setDataSource(dataSource);
	}
	else
	{
		var dataSourceOrigin = origin.getDataSource();
		var dataSourceClone = null;
		if (oFF.notNull(dataSourceOrigin))
		{
			dataSourceClone = dataSourceOrigin.clone();
		}
		this.setDataSource(dataSourceClone);
	}
	this.setConnection(cloneConnection);
	this.setSystemDescription(origSystemDescription);
	this.getSettingsBase().setDataRequest(origin.getInitSettings().getDataRequest());
	this.setUseSavedPromptsForExitVariables(origin.isUsingSavedPromptsForExitVariables());
	this.setupValues();
	this.m_includePerformanceData = origin.getIncludePerformanceData();
	if (origin.getQueryModel() !== null)
	{
		this.setupQueryModel();
	}
	this.m_lifeCycleState = oFF.LifeCycleState.STARTING_UP;
	this.m_mode = origin.getMode();
	this.m_activeContainer = oFF.ResultSetContainer.create(this, origin.getActiveResultSetContainer());
	this.m_enableHierarchyToUDHConversion = origin.isHierarchyToUDHConversionEnabled();
	this.m_clientQueryObjectStorageName = origin.getClientQueryObjectStorageName();
	this.setOffsetColumns(origin.getOffsetColumns());
	this.setOffsetRows(origin.getOffsetRows());
	this.setMaxRows(origin.getMaxRows());
	this.setMaxColumns(origin.getMaxColumns());
	this.setSuppressExitVariableValuesInRepoMode(origin.isSuppressExitVariableValuesInRepoMode());
	if (cloneMode !== oFF.QueryCloneMode.MICRO_CUBE)
	{
		var variableVariants = origin.getVariableVariants();
		if (oFF.notNull(variableVariants))
		{
			var sizeVariants = variableVariants.size();
			for (var idxVariants = 0; idxVariants < sizeVariants; idxVariants++)
			{
				this.addVariableVariant(variableVariants.get(idxVariants).clone());
			}
		}
	}
	if (oFF.XCollectionUtils.hasElements(serviceConfig.getRequiredDimensions()))
	{
		serviceConfigClone.setRequiredDimensions(serviceConfig.getRequiredDimensions().createListOfStringCopy());
	}
	if (oFF.XCollectionUtils.hasElements(origin.getDimensionsToClone()))
	{
		this.setDimensionsToClone(origin.getDimensionsToClone().createSetCopy());
		this.setDimensionsRequestedFromClient(origin.getDimensionsRequestedFromClient().createSetCopy());
	}
	if (oFF.notNull(this.m_queryModel))
	{
		this.m_queryModel.stopEventing();
	}
	var originQueryModel = origin.getQueryModel();
	if (oFF.notNull(originQueryModel))
	{
		var serverBaseSerialization = null;
		if (cloneMode === oFF.QueryCloneMode.BASE_STATE)
		{
			serverBaseSerialization = originQueryModel.getServerBaseSerializationForBaseState();
		}
		else
		{
			serverBaseSerialization = originQueryModel.getServerBaseSerialization();
		}
		if (cloneMode === oFF.QueryCloneMode.CURRENT_STATE || cloneMode === oFF.QueryCloneMode.MICRO_CUBE)
		{
			this.m_queryModel.copyQueryModel(originQueryModel, cloneMode);
		}
		else
		{
			var modelCapabilities = this.getModelCapabilities();
			if (cloneMode === oFF.QueryCloneMode.CURRENT_STATE_INA)
			{
				var serializer = oFF.QInAExportFactory.createForCloning(application, modelCapabilities);
				var inaQueryModel = serializer.exportQueryModel(originQueryModel, true, true);
				var deserializer = oFF.QInAImportFactory.createForCloning(application, modelCapabilities);
				deserializer.importQueryModel(inaQueryModel, this.m_queryModel);
				oFF.MessageUtil.checkNoError(deserializer);
			}
			else if (cloneMode === oFF.QueryCloneMode.BASE_STATE)
			{
				var deserializer2 = oFF.QInAImportFactory.create(application, oFF.QModelFormat.INA_METADATA, modelCapabilities);
				deserializer2.importQueryModel(serverBaseSerialization, this.m_queryModel);
			}
			else
			{
				throw oFF.XException.createRuntimeException(oFF.XStringUtils.concatenate2("Mode not yet supported: ", cloneMode.toString()));
			}
		}
		this.m_queryModel.getDrillManager().setValidateContextFreeNavigations(originQueryModel.getDrillManager().isValidatingContextFreeNavigations());
		this.m_queryModel.setExportFixedFilter(originQueryModel.isExportingFixedFilter());
		this.m_queryModel.setExportVariables(originQueryModel.isExportingVariables());
		this.m_queryModel.setServerBaseSerialization(null, oFF.QModelOrigin.CLONING, serverBaseSerialization);
		this.m_queryModel.setSupportsDataEntryReadOnly(originQueryModel.supportsDataEntryReadOnly());
		this.m_queryModel.setDataEntryReadOnly(originQueryModel.isDataEntryReadOnly());
		this.m_queryModel.setDataEntryEnabled(originQueryModel.isDataEntryEnabled());
		this.reorderStructureMember(this.m_queryModel.getMeasureDimension(), originQueryModel.getMeasureDimension());
		this.reorderStructureMember(this.m_queryModel.getNonMeasureDimension(), originQueryModel.getNonMeasureDimension());
		this.reorderStructureMember(this.m_queryModel.getNonMeasureDimension2(), originQueryModel.getNonMeasureDimension2());
		this.reorderStructureMember(this.m_queryModel.getAccountDimension(), originQueryModel.getAccountDimension());
		this.m_queryModel.getDrillManagerBase().copyRootNodesFrom(originQueryModel.getDrillManager());
	}
	this.m_metadataModel = origin.getMetadataModel().cloneOlapComponent(this.getQueryModel(), null);
	if (oFF.notNull(this.m_queryModel) && this.getInitSettings().isExternalizedNonVariableFilter())
	{
		var olapEnvironment = this.getOlapEnv();
		var olapFilterManager = oFF.isNull(olapEnvironment) ? null : olapEnvironment.getFilterManager();
		if (cloneMode === oFF.QueryCloneMode.BASE_STATE)
		{
			olapFilterManager.externalizeNonVariableFilter(this);
		}
		else
		{
			var externalizedNonVariableFilter = oFF.isNull(olapFilterManager) ? null : olapFilterManager.getNonVariableDrivenFilters(origin);
			if (oFF.notNull(externalizedNonVariableFilter))
			{
				var filter = this.m_queryModel.getFilter();
				var filterName = filter.getExternalizedNonVariableFilterName();
				var newNonVariableFilter = olapFilterManager.getFilterByName(filterName);
				var newProduct = newNonVariableFilter.getCartesianProductWithDefault();
				newProduct.copyFrom(externalizedNonVariableFilter, null);
				this.m_queryModel.getFilter().linkFilter(filterName, newNonVariableFilter);
			}
		}
	}
	if (oFF.notNull(this.m_queryModel))
	{
		var instanceId = serviceConfigClone.getInstanceId();
		var dataSourceBase = this.m_queryModel.getDataSourceBase();
		dataSourceBase.setInstanceId(instanceId);
		this.m_queryModel.resumeEventing();
	}
	if (this.getResultSetPersistenceIdentifier() !== null)
	{
		this.setResultSetPersistenceIdentifier(null);
		this.setResultSetPersistanceTargetSchema(null);
		this.setResultSetPersistanceTargetTable(null);
	}
	if (origin.hasLovManager())
	{
		this.getLovManager().copyFrom(origin.getLovManager(), null);
	}
	this.setLifeCycleState(oFF.LifeCycleState.ACTIVE);
	if (oFF.VariableProcessorState.PROCESSING_EMPTY_VARIABLE_DEFINITION === origin.getVariableProcessorState())
	{
		this.setVariableProcessorState(origin.getVariableProcessorState());
	}
	this.m_includePerformanceData = origin.getIncludePerformanceData();
	this.setCacheHintEnabled(origin.isCacheHintEnabled());
	this.m_keyRefSerializationEnabled = origin.isKeyRefSerializationEnabled();
};
oFF.QueryManager.prototype.reorderStructureMember = function(cloneDimension, origDimension)
{
	if (oFF.notNull(cloneDimension) && oFF.notNull(origDimension))
	{
		cloneDimension.reOrderStructureMembers(origDimension.getOrderedStructureMemberNames());
	}
};
oFF.QueryManager.prototype.resetVisualizationContainers = function()
{
	var queryModel = this.getQueryModel();
	var visualizationManager = oFF.isNull(queryModel) ? null : queryModel.getVisualizationManager();
	var visualizationDefinitions = oFF.isNull(visualizationManager) ? null : visualizationManager.getVisualizationDefinitions();
	if (oFF.XCollectionUtils.hasElements(visualizationDefinitions))
	{
		oFF.XCollectionUtils.forEach(visualizationDefinitions,  function(visDef){
			visDef.resetVisualizationContainer();
		}.bind(this));
	}
};
oFF.QueryManager.prototype.invalidateVisualizationContainers = function()
{
	var queryModel = this.getQueryModel();
	var visualizationManager = oFF.isNull(queryModel) ? null : queryModel.getVisualizationManager();
	var visualizationDefinitions = oFF.isNull(visualizationManager) ? null : visualizationManager.getVisualizationDefinitions();
	if (oFF.XCollectionUtils.hasElements(visualizationDefinitions))
	{
		oFF.XCollectionUtils.forEach(visualizationDefinitions,  function(visDef){
			visDef.invalidateVisualizationContainer();
		}.bind(this));
	}
};
oFF.QueryManager.prototype.cloneOlapComponent = function(context, parent)
{
	return this.cloneQueryManagerExt(oFF.QueryCloneMode.CURRENT_STATE);
};
oFF.QueryManager.prototype.cloneQueryManager = function()
{
	return this.cloneQueryManagerExt(oFF.QueryCloneMode.CURRENT_STATE);
};
oFF.QueryManager.prototype.cloneExt = function(flags)
{
	var cloneMode = oFF.QueryCloneMode.findInFlags(flags, oFF.QueryCloneMode.CURRENT_STATE);
	return this.cloneQueryManagerExt(cloneMode);
};
oFF.QueryManager.prototype.cloneQueryManagerExt = function(cloneMode)
{
	var queryManagerClone;
	if (this.getMode() === oFF.QueryManagerMode.BLENDING)
	{
		var serviceConfig = this.getServiceConfig();
		var blendingDefinition = serviceConfig.getBlendingDefinition();
		var cloneBlendingDefinition = blendingDefinition.clone();
		var blendingServiceConfig = oFF.QueryServiceConfig.createWithBlendingDefinition(this.getApplication(), cloneBlendingDefinition);
		var extBlendingManager = blendingServiceConfig.processQueryManagerCreation(oFF.SyncType.BLOCKING, null, null);
		oFF.MessageUtil.checkNoError(extBlendingManager);
		queryManagerClone = extBlendingManager.getData();
		var queryModelClone = queryManagerClone.getQueryModel();
		queryModelClone.getDrillManager().setValidateContextFreeNavigations(this.m_queryModel.getDrillManager().isValidatingContextFreeNavigations());
		var originalModel = this.m_queryModel.serializeToString(oFF.QModelFormat.INA_REPOSITORY);
		var deserializeExt = queryModelClone.deserializeExt(oFF.QModelFormat.INA_REPOSITORY, originalModel);
		var dimensions = this.m_queryModel.getDimensions();
		if (oFF.notNull(dimensions))
		{
			var dimensionsSize = dimensions.size();
			for (var dimensionIndex = 0; dimensionIndex < dimensionsSize; dimensionIndex++)
			{
				var dimension = dimensions.get(dimensionIndex);
				if (oFF.isNull(dimension))
				{
					continue;
				}
				var cloneDimension = queryModelClone.getDimensionByNameFromExistingMetadata(dimension.getName());
				if (oFF.isNull(cloneDimension))
				{
					continue;
				}
				cloneDimension.reOrderStructureMembers(dimension.getOrderedStructureMemberNames());
			}
		}
		queryModelClone.getDrillManager().copyRootNodesFrom(this.m_queryModel.getDrillManager());
		oFF.MessageUtil.checkNoError(deserializeExt);
		if (cloneMode === oFF.QueryCloneMode.BASE_STATE)
		{
			queryManagerClone.getConvenienceCommands().resetToDefault();
		}
	}
	else
	{
		queryManagerClone = this.cloneQueryManagerBase(cloneMode);
	}
	return queryManagerClone;
};
oFF.QueryManager.prototype.cloneQueryManagerBase = function(cloneMode)
{
	this.assertLifeCycleActive();
	var queryMgr = this.newObject();
	queryMgr.setupClone(this, cloneMode, null);
	return queryMgr;
};
oFF.QueryManager.prototype.newObject = oFF.noSupport;
oFF.QueryManager.prototype.cloneQueryManagerOptimized = function(neededDimensions)
{
	var queryModel = this.getQueryModelBase();
	var usedDimensions = oFF.XHashSetOfString.create();
	var dimensionsRequestedFromClient = oFF.XHashSetOfString.create();
	dimensionsRequestedFromClient.addAll(neededDimensions);
	dimensionsRequestedFromClient.add(queryModel.getMeasureDimension().getName());
	this.setDimensionsRequestedFromClient(dimensionsRequestedFromClient);
	usedDimensions.addAll(neededDimensions);
	oFF.DimensionUsageAnalyzer2.addDimensionsUsedByVariables(queryModel, usedDimensions);
	oFF.DimensionUsageAnalyzer2.addDimensionsUsedInFilters(queryModel, usedDimensions);
	oFF.DimensionUsageAnalyzer2.addDimensionsUsedInUniversalDisplayHierarchies(queryModel, usedDimensions);
	oFF.DimensionUsageAnalyzer2.addDimensionsUsedByLeveledHierarchies(queryModel, usedDimensions);
	oFF.DimensionUsageAnalyzer2.addDimensionsUsedInExceptions(queryModel, usedDimensions);
	oFF.DimensionUsageAnalyzer2.addDimensionsUsedInConditions(queryModel, usedDimensions);
	usedDimensions.add(this.getQueryModel().getMeasureDimension().getName());
	this.setDimensionsToClone(usedDimensions);
	var cloneQueryManagerBase = this.cloneQueryManagerBase(oFF.QueryCloneMode.CURRENT_STATE);
	var cloneQServiceConfig = cloneQueryManagerBase.getQueryServiceConfig();
	cloneQServiceConfig.setRequiredDimensions(oFF.XListOfString.createFromReadOnlyList(usedDimensions.getValuesAsReadOnlyListOfString()));
	cloneQServiceConfig.setSupportsDimensionLazyLoad(false);
	this.getDimensionsToClone().clear();
	this.getDimensionsRequestedFromClient().clear();
	return cloneQueryManagerBase;
};
oFF.QueryManager.prototype.setupQueryModel = function()
{
	var capabilities = this.getCapabilitiesBase();
	this.m_queryModel = oFF.QueryModel.create(this.getOlapEnv(), this, capabilities);
	if (this.isLightweightSearch())
	{
		this.m_queryModel.getModelCapabilitiesBase().setSupportsComplexFilter(true);
	}
	var dataSource = this.getDataSource();
	if (oFF.notNull(dataSource))
	{
		this.m_queryModel.getModelCapabilitiesBase().setSupportsExtendedVariableDefinition(this.supportsAndAllowsEmptyExtendedVarDefinition());
		this.m_queryModel.getDataSourceBase().copyFrom(dataSource, null);
	}
	return this.m_queryModel;
};
oFF.QueryManager.prototype.invalidateState = function()
{
	if (this._createPlanningManager())
	{
		this.m_planningManager.setPublicVersionEditPossible(false);
	}
	if (this.getMode() === oFF.QueryManagerMode.RAW_QUERY)
	{
		this.getResultsetContainer(true);
	}
	else
	{
		this.m_queryModel.notifyNodeChanged();
	}
};
oFF.QueryManager.prototype.lazyLoadMetadataModel = function()
{
	if (oFF.isNull(this.m_metadataModel))
	{
		this.m_metadataModel = oFF.QMetadataModel.create(this.m_queryModel);
	}
};
oFF.QueryManager.prototype.getMetadataModelBase = function()
{
	this.lazyLoadMetadataModel();
	return this.m_metadataModel;
};
oFF.QueryManager.prototype.getMetadataModel = function()
{
	this.lazyLoadMetadataModel();
	return this.m_metadataModel;
};
oFF.QueryManager.prototype.processQueryExecution = function(syncType, listener, customIdentifier)
{
	this.checkRootNodeFetching();
	if (oFF.notNull(this.m_lovManager) && this.m_lovManager.isLovAbstractionEnabled() && this.getActiveResultSetContainer().getSyncState().isNotInSync())
	{
		var lovConfig = this.m_lovManager.createConfigForActiveResultSetContainer(this.getActiveResultSetContainer());
		if (lovConfig.isValid())
		{
			return this.m_lovManager.processListOfValuesByConfig(lovConfig, syncType, listener, customIdentifier);
		}
		oFF.XObjectExt.release(lovConfig);
	}
	this.maintainStateForRsWithAutoSubmit(null);
	return this.processQueryExecutionInternal(syncType, listener, customIdentifier, this.getMode() === oFF.QueryManagerMode.BLENDING);
};
oFF.QueryManager.prototype.checkRootNodeFetching = function()
{
	if (this.getMode() === oFF.QueryManagerMode.BLENDING)
	{
		var leafQueryModels = oFF.BlendingUtils.getLeafQueryModels(this);
		oFF.XCollectionUtils.forEach(leafQueryModels,  function(leafQueryModel){
			var leafDrillManager = leafQueryModel.getDrillManager();
			if (oFF.notNull(leafDrillManager))
			{
				leafDrillManager.checkRootNodeFetching();
			}
		}.bind(this));
	}
	else
	{
		var drillManager = this.getDrillManager();
		if (oFF.notNull(drillManager))
		{
			drillManager.checkRootNodeFetching();
		}
	}
};
oFF.QueryManager.prototype.maintainStateForRsWithAutoSubmit = function(resultSetContainer)
{
	if (oFF.notNull(this.m_queryModel) && this.getModelCapabilities().supportsAutoVariableSubmit())
	{
		this.m_queryModel.setIsMetadataUpdatedByAutoSubmit(false);
	}
	var variableProcessorState = this.getVariableProcessorState();
	if (this.isExecuteAutoVariableSubmit() && !this.isProcessingAutoSubmit())
	{
		if (variableProcessorState !== oFF.VariableProcessorState.SUBMITTED && this.hasVariables())
		{
			var isVariableValueHelp = variableProcessorState === oFF.VariableProcessorState.VALUE_HELP;
			if (oFF.notNull(resultSetContainer))
			{
				var rsQueryModelDef = resultSetContainer.getRsQueryModelDef();
				isVariableValueHelp = isVariableValueHelp || oFF.notNull(rsQueryModelDef) && !rsQueryModelDef.isExecuteAutoVariableSubmit();
			}
			var rsContainer = oFF.notNull(resultSetContainer) ? resultSetContainer : this.getActiveResultSetContainer();
			if (variableProcessorState === oFF.VariableProcessorState.CHANGEABLE_REINIT && rsContainer.getSyncState().isInSync())
			{
				this.getResultsetContainer(true);
			}
			if (!isVariableValueHelp)
			{
				var processingStateForAutoSubmit = null;
				if (variableProcessorState === oFF.VariableProcessorState.CHANGEABLE_STARTUP)
				{
					processingStateForAutoSubmit = oFF.VariableProcessorState.PROCESSING_AUTO_SUBMIT;
				}
				else if (variableProcessorState === oFF.VariableProcessorState.CHANGEABLE_REINIT)
				{
					processingStateForAutoSubmit = oFF.VariableProcessorState.PROCESSING_AUTO_SUBMIT_AFTER_REINIT;
				}
				if (oFF.notNull(processingStateForAutoSubmit))
				{
					var dimensionMemberVariables = this.getDimensionMemberVariables();
					for (var i = 0; i < dimensionMemberVariables.size(); i++)
					{
						var variable = dimensionMemberVariables.get(i);
						variable.maintainFilterStateForAutoSubmit();
						var varType = variable.getVariableType();
						if (varType === oFF.VariableType.HIERARCHY_NAME_VARIABLE)
						{
							var hierarchyDimension = variable.getHierarchyNameDimension();
							var hierNameVarName = hierarchyDimension.getHierarchyNameVariableName();
							if (oFF.XString.isEqual(variable.getName(), hierNameVarName) && hierarchyDimension.useHierarchyNameVariable() && variable.isWinControlInAutoSubmit() && !hierarchyDimension.isDisplayHierarchyFixInFilter())
							{
								hierarchyDimension.setHierarchy(null);
							}
						}
					}
					this.setVariableProcessorState(processingStateForAutoSubmit);
				}
			}
		}
	}
};
oFF.QueryManager.prototype.processQueryExecutionAsBlendingSource = function(syncType, persistanceType, listener, customIdentifier)
{
	this.setResultSetPersistenceTargetType(persistanceType);
	return this.processQueryExecutionInternal(syncType, listener, customIdentifier, true);
};
oFF.QueryManager.prototype.processQueryExecutionAsRemotePreQuery = function(syncType, listener, customIdentifier)
{
	this.getActiveResultSetContainerBase().setIsRemotePreQuery(true);
	return this.processQueryExecutionInternal(syncType, listener, customIdentifier, true);
};
oFF.QueryManager.prototype.processQueryExecutionAsLovProcess = function(lovConfig, syncType, listener, customIdentifier)
{
	var lovManager = this.getLovManager();
	if (lovConfig.isUseActiveResultSetContainer())
	{
		return this.processQueryExecutionInternal(syncType, listener, customIdentifier, false);
	}
	var activeContainer = this.m_activeContainer;
	this.m_activeContainer = oFF.ResultSetContainer.create(this, activeContainer);
	this.m_activeContainer.setLovConfig(lovConfig);
	lovManager.setKeyFigureCalculation(this.m_activeContainer, lovConfig);
	var result = this.processQueryExecutionInternal(syncType, listener, customIdentifier, false);
	this.m_activeContainer = activeContainer;
	return result;
};
oFF.QueryManager.prototype.processQueryExecutionInternal = function(syncType, listener, customIdentifier, isBlendingProcess)
{
	this.assertLifeCycleActive();
	if (syncType === oFF.SyncType.REGISTER)
	{
		this.m_queryExecutedListener.put(listener, oFF.XPair.create(listener, customIdentifier));
		this.getActiveResultSetContainerBase().attachListener(listener, oFF.ListenerType.SPECIFIC, customIdentifier);
		return null;
	}
	else if (syncType === oFF.SyncType.UNREGISTER)
	{
		this.m_queryExecutedListener.remove(listener);
		return null;
	}
	this.callOnBeforeQueryExecutionListeners(customIdentifier);
	if (this.getOlapEnv() !== null && this.getOlapEnv().getFilterManager() !== null)
	{
		var variableProcessorState = this.getVariableProcessorState();
		this.getOlapEnv().getFilterManager().cleanupFilterBeforeAutoSubmit(this, variableProcessorState === oFF.VariableProcessorState.PROCESSING_SUBMIT || variableProcessorState === oFF.VariableProcessorState.PROCESSING_AUTO_SUBMIT || variableProcessorState === oFF.VariableProcessorState.CHANGEABLE_STARTUP);
	}
	var mainSequence = null;
	if (this.getPreQueryName() === null)
	{
		mainSequence = this.initializeMainSequence(syncType, listener, customIdentifier);
	}
	if (this.variablesRequireImplicitSubmit())
	{
		this.getActiveResultSetContainerBase().attachAllListeners(this.m_queryExecutedListener.getValuesAsReadOnlyList());
		return this.processSequenceWithMainSequence(mainSequence, oFF.QueryManagerProcessingSequence.createSequence(this, this.getActiveResultSetContainer(), true, false), syncType, listener, customIdentifier);
	}
	this.prepareAfterVariables();
	this.getActiveResultSetContainerBase().attachAllListeners(this.m_queryExecutedListener.getValuesAsReadOnlyList());
	if (!this.getActiveResultSetContainer().areAllPrequeriesInSync() || this.getPreQueryName() !== null || oFF.notNull(this.m_queryModel) && this.m_queryModel.isBasedOnMicroCube() || isBlendingProcess && this.getActiveResultSetContainer().getSyncState().isTypeOf(oFF.SyncState.PROCESSING))
	{
		this.getResultsetContainer(true);
	}
	if (!isBlendingProcess && this.getResultSetPersistenceIdentifier() !== null)
	{
		this.cleanPersistencySettings();
	}
	if (this.getModelCapabilities().supportsCustomHierarchy())
	{
		return this.processSequenceWithMainSequence(mainSequence, oFF.QueryManagerProcessingSequence.createSequence(this, this.getActiveResultSetContainer(), false, false), syncType, listener, customIdentifier);
	}
	if (oFF.isNull(mainSequence))
	{
		return this.getActiveResultSetContainerBase().processExecution(syncType, listener, customIdentifier);
	}
	else
	{
		mainSequence.setMainAction(oFF.ResultSetContainerProcessExecutionAction.createAction(this.getActiveResultSetContainer()));
		return mainSequence.processSyncAction(syncType, listener, customIdentifier);
	}
};
oFF.QueryManager.prototype.callOnBeforeQueryExecutionListeners = function(customIdentifier)
{
	if (oFF.XCollectionUtils.hasElements(this.m_beforeQueryExecutionListener))
	{
		var listenerPairs = this.m_beforeQueryExecutionListener.getValuesAsReadOnlyList().getIterator();
		while (listenerPairs.hasNext())
		{
			var pair = listenerPairs.next();
			pair.getFirstObject().onBeforeQueryExecuted(oFF.notNull(customIdentifier) ? customIdentifier : pair.getSecondObject());
		}
	}
};
oFF.QueryManager.prototype.initializeMainSequence = function(syncType, listener, customIdentifier)
{
	var transientFilterActions = this.getTransientFilterActions(syncType);
	var mainSequence = null;
	if (transientFilterActions.size() > 0)
	{
		mainSequence = oFF.SyncActionSequence.create(syncType, listener, customIdentifier, this);
		for (var i = 0; i < transientFilterActions.size(); i++)
		{
			mainSequence.addAction(transientFilterActions.get(i));
		}
	}
	return mainSequence;
};
oFF.QueryManager.prototype.getTransientFilterActions = function(syncType)
{
	var actions = oFF.XList.create();
	var filterAcrossModels = oFF.QFilterUtil.collectFilterAcrossModels(this.getQueryModel());
	for (var i = 0; i < filterAcrossModels.size(); i++)
	{
		var filterAcrossModel = filterAcrossModels.get(i);
		var famTargetDatasetId = filterAcrossModel.getTargetDatasetId();
		var targetContext;
		if (oFF.XString.isEqual(famTargetDatasetId, this.getQueryModel().getDatasetId()))
		{
			targetContext = this;
		}
		else
		{
			targetContext = this.getOlapEnv().getSharedQueryManager(famTargetDatasetId);
		}
		if (oFF.notNull(targetContext))
		{
			var action = filterAcrossModel.processLovQueriesExecutionExt(targetContext.getQueryModel(), syncType, null, null);
			if (oFF.notNull(action))
			{
				actions.add(action);
			}
		}
	}
	return actions;
};
oFF.QueryManager.prototype.processSequenceWithMainSequence = function(mainSequence, sequence, syncType, listener, customIdentifier)
{
	if (oFF.isNull(mainSequence))
	{
		return sequence.processSyncAction(syncType, listener, customIdentifier);
	}
	else
	{
		mainSequence.setMainAction(sequence);
		return mainSequence.processSyncAction(syncType, listener, customIdentifier);
	}
};
oFF.QueryManager.prototype.retriggerQueryExecutionWithCustomHierarchies = function(syncType, listener, customIdentifier, resultSetContainer)
{
	oFF.QueryManagerProcessingSequence.createSequence(this, resultSetContainer, false, true).processSyncAction(syncType, listener, customIdentifier);
};
oFF.QueryManager.prototype.cleanPersistencySettings = function()
{
	this.setResultSetPersistenceIdentifier(null);
	this.setResultSetPersistanceTargetSchema(null);
	this.setResultSetPersistanceTargetTable(null);
	this.getActiveResultSetContainerBase().setSerializedData(null, null);
};
oFF.QueryManager.prototype.getResultsetContainer = function(enforceOutOfSync)
{
	if (oFF.isNull(this.m_activeContainer) || this.m_activeContainer.isReleased() || enforceOutOfSync && this.m_activeContainer.getSyncState() !== oFF.SyncState.OUT_OF_SYNC)
	{
		var oldContainer = this.m_activeContainer;
		this.m_activeContainer = oFF.ResultSetContainer.create(this, this.m_activeContainer);
		this.resetVisualizationContainers();
		if (oFF.notNull(oldContainer))
		{
			oldContainer.setSerializedData(null, null);
		}
	}
	return this.m_activeContainer;
};
oFF.QueryManager.prototype.getClassicResultSet = function()
{
	this.assertLifeCycleActive();
	return this.getActiveResultSetContainer().getClassicResultSet();
};
oFF.QueryManager.prototype.isClassicResultSetAvailable = function()
{
	this.assertLifeCycleActive();
	return this.getActiveResultSetContainer().isClassicResultSetAvailable();
};
oFF.QueryManager.prototype.getCursorResultSet = function()
{
	this.assertLifeCycleActive();
	return this.getActiveResultSetContainer().getCursorResultSet();
};
oFF.QueryManager.prototype.getAbstractRendering = function(type, protocol)
{
	this.assertLifeCycleActive();
	return this.getActiveResultSetContainer().getAbstractRendering(type, protocol);
};
oFF.QueryManager.prototype.isCursorResultSetAvailable = function()
{
	this.assertLifeCycleActive();
	return this.getActiveResultSetContainer().isCursorResultSetAvailable();
};
oFF.QueryManager.prototype.setOffsetRows = function(offset)
{
	if (this.getResultsetContainer(false).getOffsetRows() !== offset)
	{
		this.getResultsetContainer(true).setOffsetRows(offset);
	}
	return null;
};
oFF.QueryManager.prototype.getOffsetRows = function()
{
	return this.getResultsetContainer(false).getOffsetRows();
};
oFF.QueryManager.prototype.setOffsetColumns = function(offset)
{
	if (this.getResultsetContainer(false).getOffsetColumns() !== offset)
	{
		this.getResultsetContainer(true).setOffsetColumns(offset);
	}
	return null;
};
oFF.QueryManager.prototype.getOffsetColumns = function()
{
	return this.getResultsetContainer(false).getOffsetColumns();
};
oFF.QueryManager.prototype.setSuppressKeyfigureCalculation = function(doSupress)
{
	if (this.getResultsetContainer(false).isKeyfigureCalculationSuppressed() !== doSupress)
	{
		this.getResultsetContainer(true).setSuppressKeyfigureCalculation(doSupress);
	}
	return null;
};
oFF.QueryManager.prototype.isKeyfigureCalculationSuppressed = function()
{
	return this.getResultsetContainer(false).isKeyfigureCalculationSuppressed();
};
oFF.QueryManager.prototype.setMaxRows = function(max)
{
	if (this.getResultsetContainer(false).getMaxRows() !== max)
	{
		this.getResultsetContainer(true).setMaxRows(max);
	}
	return null;
};
oFF.QueryManager.prototype.getMaxRows = function()
{
	return this.getResultsetContainer(false).getMaxRows();
};
oFF.QueryManager.prototype.setMaxColumns = function(max)
{
	if (this.getResultsetContainer(false).getMaxColumns() !== max)
	{
		this.getResultsetContainer(true).setMaxColumns(max);
	}
	return null;
};
oFF.QueryManager.prototype.getMaxColumns = function()
{
	return this.getResultsetContainer(false).getMaxColumns();
};
oFF.QueryManager.prototype.getMaxResultRecords = function()
{
	return this.getResultsetContainer(false).getMaxResultRecords();
};
oFF.QueryManager.prototype.setMaxResultRecords = function(maxResultRecords)
{
	if (this.getResultsetContainer(false).getMaxResultRecords() !== maxResultRecords)
	{
		this.getResultsetContainer(true).setMaxResultRecords(maxResultRecords);
	}
	return null;
};
oFF.QueryManager.prototype.resetMaxResultRecords = function()
{
	this.getResultsetContainer(true).resetMaxResultRecords();
	return null;
};
oFF.QueryManager.prototype.setResultSetPersistanceTargetSchema = function(resultSetPersistenceSchema)
{
	var currentSchema = this.getResultsetContainer(false).getResultSetPersistenceSchema();
	if (!oFF.XString.isEqual(currentSchema, resultSetPersistenceSchema))
	{
		this.getResultsetContainer(true).setResultSetPersistanceTargetSchema(resultSetPersistenceSchema);
	}
	return null;
};
oFF.QueryManager.prototype.setResultSetPersistanceTargetTable = function(resultSetPersistenceTable)
{
	var currentTable = this.getResultsetContainer(false).getResultSetPersistenceTable();
	if (!oFF.XString.isEqual(currentTable, resultSetPersistenceTable))
	{
		this.getResultsetContainer(true).setResultSetPersistanceTargetTable(resultSetPersistenceTable);
	}
	return null;
};
oFF.QueryManager.prototype.setResultSetPersistenceTargetType = function(resultSetPersistenceType)
{
	var currentType = this.getResultsetContainer(false).getResultSetPersistenceType();
	if (currentType !== resultSetPersistenceType)
	{
		this.getResultsetContainer(true).setResultSetPersistenceTargetType(resultSetPersistenceType);
	}
	return null;
};
oFF.QueryManager.prototype.setResultSetPersistenceIdentifier = function(resultSetPersistenceIdentifier)
{
	var currentIdentifier = this.getResultsetContainer(false).getResultSetPersistenceIdentifier();
	if (!oFF.XString.isEqual(currentIdentifier, resultSetPersistenceIdentifier))
	{
		this.getResultsetContainer(true).setResultSetPersistenceIdentifier(resultSetPersistenceIdentifier);
	}
	return null;
};
oFF.QueryManager.prototype.getResultSetPersistenceSchema = function()
{
	return this.getResultsetContainer(false).getResultSetPersistenceSchema();
};
oFF.QueryManager.prototype.getResultSetPersistenceTable = function()
{
	return this.getResultsetContainer(false).getResultSetPersistenceTable();
};
oFF.QueryManager.prototype.getResultSetPersistenceType = function()
{
	return this.getResultsetContainer(false).getResultSetPersistenceType();
};
oFF.QueryManager.prototype.getResultSetPersistenceIdentifier = function()
{
	return this.getResultsetContainer(false).getResultSetPersistenceIdentifier();
};
oFF.QueryManager.prototype.setExecuteRequestOnOldResultSet = function(executeRequestOnOldResultSet)
{
	if (this.getResultsetContainer(false).getExecuteRequestOnOldResultSet() !== executeRequestOnOldResultSet)
	{
		this.getResultsetContainer(true).setExecuteRequestOnOldResultSet(executeRequestOnOldResultSet);
	}
	return null;
};
oFF.QueryManager.prototype.isResultSetTransportEnabled = function()
{
	return this.getResultsetContainer(false).isResultSetTransportEnabled();
};
oFF.QueryManager.prototype.setResultSetTransportEnabled = function(isEnabled)
{
	if (this.getResultsetContainer(false).isResultSetTransportEnabled() !== isEnabled)
	{
		this.getResultsetContainer(true).setResultSetTransportEnabled(isEnabled);
	}
	return null;
};
oFF.QueryManager.prototype.setDataRefreshEnabled = function(dataRefreshEnabled)
{
	if (this.getResultsetContainer(false).getDataRefreshEnabled() !== dataRefreshEnabled)
	{
		this.getResultsetContainer(true).setDataRefreshEnabled(dataRefreshEnabled);
	}
};
oFF.QueryManager.prototype.getDataRefreshEnabled = function()
{
	return this.getResultsetContainer(false).getDataRefreshEnabled();
};
oFF.QueryManager.prototype.getExecuteRequestOnOldResultSet = function()
{
	return this.getActiveResultSetContainer().getExecuteRequestOnOldResultSet();
};
oFF.QueryManager.prototype.getActiveResultSetContainer = function()
{
	return this.getResultsetContainer(false);
};
oFF.QueryManager.prototype.getActiveResultSetContainerBase = function()
{
	return this.getResultsetContainer(false);
};
oFF.QueryManager.prototype.setActiveResultSetContainer = function(activeResultSetContainer)
{
	this.m_activeContainer = activeResultSetContainer;
};
oFF.QueryManager.prototype.getResultSetSyncState = function()
{
	return this.getActiveResultSetContainer().getResultSetSyncState();
};
oFF.QueryManager.prototype.getResultSetMessages = function()
{
	return this.getActiveResultSetContainer();
};
oFF.QueryManager.prototype.getQueryServiceConfig = function()
{
	return this.getServiceConfig();
};
oFF.QueryManager.prototype.getSystemDescription = function()
{
	if (oFF.isNull(this.m_systemDescription))
	{
		var initSettings = this.getInitSettings();
		var systemDescription = initSettings.getSystemDescription();
		this.m_systemDescription = oFF.XWeakReferenceUtil.getWeakRef(systemDescription);
	}
	return oFF.XWeakReferenceUtil.getHardRef(this.m_systemDescription);
};
oFF.QueryManager.prototype.setSystemDescription = function(systemDescription)
{
	this.m_systemDescription = oFF.XWeakReferenceUtil.getWeakRef(systemDescription);
};
oFF.QueryManager.prototype.isDataSourceInitial = function()
{
	return oFF.isNull(this.m_dataSource) || this.m_dataSource.getType() === null;
};
oFF.QueryManager.prototype.getDataSourceOrigin = function()
{
	return this.getDataSource();
};
oFF.QueryManager.prototype.getDataSourceTarget = function()
{
	return this.getDataSource();
};
oFF.QueryManager.prototype.getDataSource = function()
{
	return this.m_dataSource;
};
oFF.QueryManager.prototype.setDataSource = function(dataSource)
{
	this.m_dataSource = dataSource;
};
oFF.QueryManager.prototype.getMode = function()
{
	if (oFF.isNull(this.m_mode))
	{
		this.m_mode = this.getInitSettings().getMode();
	}
	return this.m_mode;
};
oFF.QueryManager.prototype.setMode = function(mode)
{
	this.m_mode = mode;
};
oFF.QueryManager.prototype.getInstanceId = function()
{
	return this.getInitSettings().getInstanceId();
};
oFF.QueryManager.prototype.getProviderType = function()
{
	return this.getInitSettings().getProviderType();
};
oFF.QueryManager.prototype.getDefinition = function()
{
	return this.getInitSettings().getDefinition();
};
oFF.QueryManager.prototype.getInitSettings = function()
{
	return this.getServiceConfig();
};
oFF.QueryManager.prototype.getSettingsBase = function()
{
	return this.getServiceConfig();
};
oFF.QueryManager.prototype.getOlapEnvironmentBase = function()
{
	var application = this.getApplication();
	return oFF.isNull(application) ? null : application.getOlapEnvironment();
};
oFF.QueryManager.prototype.getTagging = function()
{
	return this.getServiceConfig().getTagging();
};
oFF.QueryManager.prototype.getSelectionTagging = function()
{
	return null;
};
oFF.QueryManager.prototype.enableReturnedDataSelection = function(dataSelection)
{
	this.m_queryModel.toggleReturnedDataSelection(dataSelection, true);
};
oFF.QueryManager.prototype.getAllEnabledReturnedDataSelections = function()
{
	if (!this.supportsReturnedDataSelection())
	{
		return null;
	}
	return oFF.XStream.of(this.m_queryModel.getAllEnabledReturnedDataSelectionConstants()).collect(oFF.XStreamCollector.toListOfString( function(retDataSel){
		return retDataSel.getName();
	}.bind(this)));
};
oFF.QueryManager.prototype.disableReturnedDataSelection = function(dataSelection)
{
	this.m_queryModel.toggleReturnedDataSelection(dataSelection, false);
};
oFF.QueryManager.prototype.getAllDisabledReturnedDataSelections = function()
{
	if (!this.supportsReturnedDataSelection())
	{
		return null;
	}
	return oFF.XStream.of(this.m_queryModel.getAllDisabledReturnedDataSelectionConstants()).collect(oFF.XStreamCollector.toListOfString( function(retDataSel){
		return retDataSel.getName();
	}.bind(this)));
};
oFF.QueryManager.prototype.supportsBatchRsStreaming = function()
{
	return this.getCapabilitiesBase().supportsBatchRsStreaming();
};
oFF.QueryManager.prototype.supportsBatchBlendingRsStreaming = function()
{
	return this.getCapabilitiesBase().supportsBatchBlendingRsStreaming();
};
oFF.QueryManager.prototype.supportsDirectVariableTransfer = function()
{
	return this.getCapabilitiesBase().supportsDirectVariableTransfer();
};
oFF.QueryManager.prototype.supportsCheckVariables = function()
{
	return this.getCapabilitiesBase().supportsCheckVariables();
};
oFF.QueryManager.prototype.supportsReInitVariables = function()
{
	return this.getCapabilitiesBase().supportsReInitVariables();
};
oFF.QueryManager.prototype.supportsVariableMasking = function()
{
	return this.getCapabilitiesBase().supportsVariableMasking();
};
oFF.QueryManager.prototype.supportsReturnedDataSelection = function()
{
	return this.getCapabilitiesBase().supportsReturnedDataSelection();
};
oFF.QueryManager.prototype.supportsInputReadinessStates = function()
{
	return this.getCapabilitiesBase().supportsInputReadinessStates();
};
oFF.QueryManager.prototype.supportsShutdown = function()
{
	return this.getCapabilitiesBase().supportsShutdown();
};
oFF.QueryManager.prototype.supportsServerState = function()
{
	return this.getCapabilitiesBase().supportsServerState();
};
oFF.QueryManager.prototype.supportsAnalyticCapability = function(capabilityName)
{
	if (oFF.XStringUtils.isNullOrEmpty(capabilityName))
	{
		return false;
	}
	var connectionContainer = this.getConnection();
	if (oFF.isNull(connectionContainer))
	{
		return false;
	}
	return connectionContainer.getSystemConnect().getServerMetadata().supportsCapability(oFF.ServerService.ANALYTIC, capabilityName);
};
oFF.QueryManager.prototype.supportsMaintainsVariableVariants = function()
{
	return this.getCapabilitiesBase().supportsMaintainsVariableVariants();
};
oFF.QueryManager.prototype.registerChangedListener = oFF.noSupport;
oFF.QueryManager.prototype.unregisterChangedListener = oFF.noSupport;
oFF.QueryManager.prototype.hasChangedValues = function()
{
	return this.getPlanningManager().hasChangedValues();
};
oFF.QueryManager.prototype.hasChangedValueLocks = function()
{
	return this.getPlanningManager().hasChangedValueLocks();
};
oFF.QueryManager.prototype.hasChangedCells = function()
{
	return this.getPlanningManager().hasChangedCells();
};
oFF.QueryManager.prototype.transferNewValues = function()
{
	this.getPlanningManager().transferNewValues();
};
oFF.QueryManager.prototype.resetNewValues = function()
{
	this.getPlanningManager().resetNewValues();
};
oFF.QueryManager.prototype.hasNewValues = function()
{
	return this.getPlanningManager().hasNewValues();
};
oFF.QueryManager.prototype.setDataEntryReadOnly = function(dataEntryReadOnly)
{
	this.getPlanningManager().setDataEntryReadOnly(dataEntryReadOnly);
};
oFF.QueryManager.prototype.isDataEntryReadOnly = function()
{
	return this.getPlanningManager().isDataEntryReadOnly();
};
oFF.QueryManager.prototype.setDataEntryEnabled = function(dataEntryEnabled)
{
	this.getPlanningManager().setDataEntryEnabled(dataEntryEnabled);
};
oFF.QueryManager.prototype.isDataEntryEnabled = function()
{
	return this.getPlanningManager().isDataEntryEnabled();
};
oFF.QueryManager.prototype.initializeDataAreaState = function()
{
	return this.getPlanningManager().initializeDataAreaState();
};
oFF.QueryManager.prototype.getPlanningModel = function()
{
	return this.getPlanningManager().getPlanningModel();
};
oFF.QueryManager.prototype.getDataArea = function()
{
	return this.getPlanningManager().getDataArea();
};
oFF.QueryManager.prototype.createDataAreaCommand = function(commandType)
{
	var dataArea = this.getPlanningManager().getDataArea();
	var command = null;
	if (oFF.isNull(dataArea))
	{
		command = oFF.QLightweightDataAreaCommand.create(this, this.getQueryModelBase(), commandType);
	}
	else
	{
		command = dataArea.createPlanningContextCommand(commandType);
		command.setConnection(this.getConnection());
	}
	return command;
};
oFF.QueryManager.prototype.createDataAreaCommandRefresh = function()
{
	return this.createDataAreaCommand(oFF.PlanningContextCommandType.REFRESH);
};
oFF.QueryManager.prototype.createDataAreaCommandDocSave = function()
{
	return this.createDataAreaCommand(oFF.PlanningContextCommandType.DOC_SAVE);
};
oFF.QueryManager.prototype.createDataAreaCommandDocReset = function()
{
	return this.createDataAreaCommand(oFF.PlanningContextCommandType.DOC_RESET);
};
oFF.QueryManager.prototype.isPublicVersionEditPossible = function()
{
	return this.getPlanningManager().isPublicVersionEditPossible();
};
oFF.QueryManager.prototype.setPublicVersionEditPossible = function(publicVersionEdit)
{
	this.getPlanningManager().setPublicVersionEditPossible(publicVersionEdit);
};
oFF.QueryManager.prototype.setVersionAliasById = function(aliasName, versionId)
{
	this.getPlanningManager().setVersionAliasById(aliasName, versionId);
};
oFF.QueryManager.prototype.removeVersionAlias = function(aliasName)
{
	this.getPlanningManager().removeVersionAlias(aliasName);
};
oFF.QueryManager.prototype.clearVersionAliases = function()
{
	this.getPlanningManager().clearVersionAliases();
};
oFF.QueryManager.prototype.getVersionAliases = function()
{
	return this.getPlanningManager().getVersionAliases();
};
oFF.QueryManager.prototype.getPlanningVersionIdentifier = function(versionId, sharedVersion, versionOwner)
{
	return this.getPlanningManager().getPlanningVersionIdentifier(versionId, sharedVersion, versionOwner);
};
oFF.QueryManager.prototype.getPlanningVersionSettings = function(versionIdentifier, sequenceId, useExternalView)
{
	return this.getPlanningManager().getPlanningVersionSettings(versionIdentifier, sequenceId, useExternalView);
};
oFF.QueryManager.prototype.getPlanningVersionSettingsSimple = function(versionId, sequenceId, useExternalView)
{
	return this.getPlanningManager().getPlanningVersionSettingsSimple(versionId, sequenceId, useExternalView);
};
oFF.QueryManager.prototype.addPlanningVersionSettings = function(sequenceSettings)
{
	return this.getPlanningManager().addPlanningVersionSettings(sequenceSettings);
};
oFF.QueryManager.prototype.deletePlanningVersionSettings = function(versionIdentifier)
{
	return this.getPlanningManager().deletePlanningVersionSettings(versionIdentifier);
};
oFF.QueryManager.prototype.getAllPlanningVersionSettings = function()
{
	return this.getPlanningManager().getAllPlanningVersionSettings();
};
oFF.QueryManager.prototype.setPlanningVersionSettingsMode = function(settingsMode)
{
	this.getPlanningManager().setPlanningVersionSettingsMode(settingsMode);
};
oFF.QueryManager.prototype.getPlanningVersionSettingsMode = function()
{
	return this.getPlanningManager().getPlanningVersionSettingsMode();
};
oFF.QueryManager.prototype.getPlanningMode = function()
{
	return this.getPlanningManager().getPlanningMode();
};
oFF.QueryManager.prototype.setPlanningMode = function(planningMode)
{
	this.getPlanningManager().setPlanningMode(planningMode);
};
oFF.QueryManager.prototype.getPlanningRestriction = function()
{
	return this.getPlanningManager().getPlanningRestriction();
};
oFF.QueryManager.prototype.setPlanningRestriction = function(restrictionType)
{
	this.getPlanningManager().setPlanningRestriction(restrictionType);
};
oFF.QueryManager.prototype.supportsDataEntryReadOnly = function()
{
	return this.getPlanningManager().supportsDataEntryReadOnly();
};
oFF.QueryManager.prototype._createPlanningManager = function()
{
	return this.getPlanningManager() !== null;
};
oFF.QueryManager.prototype.getPlanningManager = function()
{
	if (oFF.isNull(this.m_planningManager))
	{
		this.m_planningManager = oFF.PlanningFactory.createPlanningManager(this);
	}
	return this.m_planningManager;
};
oFF.QueryManager.prototype.getContext = function()
{
	return this;
};
oFF.QueryManager.prototype.getOlapEnv = function()
{
	var application = this.getApplication();
	return oFF.isNull(application) ? null : application.getOlapEnvironment();
};
oFF.QueryManager.prototype.getOlapSystemContainer = function()
{
	var systemName = this.getSystemName();
	return this.getOlapEnv().getSystemContainer(systemName);
};
oFF.QueryManager.prototype.getQueryManager = function()
{
	return this;
};
oFF.QueryManager.prototype.getQueryModel = function()
{
	return this.m_queryModel;
};
oFF.QueryManager.prototype.getQueryModelBase = function()
{
	return this.m_queryModel;
};
oFF.QueryManager.prototype.getConvenienceCommands = function()
{
	if (oFF.isNull(this.m_convenienceCmds))
	{
		this.m_convenienceCmds = this.getOlapEnv().selectCmds(this);
	}
	return this.m_convenienceCmds;
};
oFF.QueryManager.prototype.getModelCapabilities = function()
{
	this.assertLifeCycleActive();
	if (oFF.isNull(this.m_queryModel))
	{
		return this.getOlapSystemContainer().getServiceCapabilitiesExt(this.getProviderType());
	}
	return this.m_queryModel.getModelCapabilities();
};
oFF.QueryManager.prototype.getFieldAccessorSingle = function()
{
	this.assertLifeCycleActive();
	return oFF.isNull(this.m_queryModel) ? null : this.m_queryModel.getFieldAccessorSingle();
};
oFF.QueryManager.prototype.getDimensionAccessor = function()
{
	this.assertLifeCycleActive();
	return oFF.isNull(this.m_queryModel) ? null : this.m_queryModel.getDimensionAccessor();
};
oFF.QueryManager.prototype.getDrillManager = function()
{
	this.assertLifeCycleActive();
	return oFF.isNull(this.m_queryModel) ? null : this.m_queryModel.getDrillManager();
};
oFF.QueryManager.prototype.getCellContextManager = function()
{
	this.assertLifeCycleActive();
	return oFF.isNull(this.m_queryModel) ? null : this.m_queryModel.getCellContextManager();
};
oFF.QueryManager.prototype.isSystemMappingValid = function(remoteQueryManager)
{
	return this.getSystemDescription().isSystemMappingValid(remoteQueryManager.getSystemDescription());
};
oFF.QueryManager.prototype.prepareAfterVariables = function()
{
	if (!this.m_hasPreparedAfterVariables)
	{
		var state = this.getVariableProcessorState();
		var hasVariables = this.hasVariables();
		if (!hasVariables || state === oFF.VariableProcessorState.SUBMITTED || state === oFF.VariableProcessorState.CHANGEABLE_DIRECT_VALUE_TRANSFER)
		{
			var initSettings = this.getInitSettings();
			var definitionType = initSettings.getDefinitionType();
			var definitionAsStructure = initSettings.getDefinitionAsStructure();
			if (oFF.notNull(definitionType) && oFF.notNull(definitionAsStructure))
			{
				var preparator = oFF.QueryPreparatorFactory.newInstance(definitionType);
				if (oFF.notNull(preparator))
				{
					preparator.prepareAfterVariables(this, definitionAsStructure);
				}
			}
			this.m_hasPreparedAfterVariables = true;
		}
	}
};
oFF.QueryManager.prototype.resetPreparation = function()
{
	this.m_hasPreparedAfterVariables = false;
};
oFF.QueryManager.prototype.isLightweightSearch = function()
{
	var dataSource = this.getDataSource();
	return oFF.notNull(dataSource) && dataSource.getType() === oFF.MetaObjectType.CATALOG_VIEW_2;
};
oFF.QueryManager.prototype.getDimensionsToClone = function()
{
	return this.m_dimensionsToClone;
};
oFF.QueryManager.prototype.setDimensionsToClone = function(dimensionsToClone)
{
	this.m_dimensionsToClone = dimensionsToClone;
};
oFF.QueryManager.prototype.getDimensionsRequestedFromClient = function()
{
	return this.m_dimensionsRequestedFromClient;
};
oFF.QueryManager.prototype.setDimensionsRequestedFromClient = function(dimensionsRequestedFromClient)
{
	this.m_dimensionsRequestedFromClient = dimensionsRequestedFromClient;
};
oFF.QueryManager.prototype.getPreQueryExecutor = function()
{
	if (oFF.isNull(this.m_preQueryExecutor))
	{
		this.m_preQueryExecutor = oFF.PreQueryExecutor.create(this);
	}
	return this.m_preQueryExecutor;
};
oFF.QueryManager.prototype.enableHierarchyToUDHConversion = function(enableConversion)
{
	if (this.getSystemType().isTypeOf(oFF.SystemType.BW) && this.getModelCapabilities().supportsUniversalDisplayHierarchiesCustomDimensions())
	{
		this.m_enableHierarchyToUDHConversion = enableConversion;
		this.invalidateState();
	}
};
oFF.QueryManager.prototype.isHierarchyToUDHConversionEnabled = function()
{
	return this.m_enableHierarchyToUDHConversion;
};
oFF.QueryManager.prototype.isHierarchyToUDHConversionEnabledForCurrentRs = function()
{
	return this.getActiveResultSetContainer().isHierarchyToUDHConversionEnabled();
};
oFF.QueryManager.prototype.setNameForMicroCubeUse = function(name)
{
	var olapEnv = this.getOlapEnv();
	var isValidValue = olapEnv.addMicroCube(this.getSystemName(), name, this);
	oFF.XBooleanUtils.checkTrue(isValidValue, oFF.XStringUtils.concatenate2("MicroCube's name is not valid or already exists: ", name));
	this.m_myNameAsMicroCube = name;
};
oFF.QueryManager.prototype.getNameForMicroCubeUse = function()
{
	return this.m_myNameAsMicroCube;
};
oFF.QueryManager.prototype.getKeyRefStorage = oFF.noSupport;
oFF.QueryManager.prototype.setSuppressCalculatedMembersWithoutBookedData = function(suppressIndicator)
{
	this.getResultsetContainer(true).setSuppressCalculatedMembersWithoutBookedData(suppressIndicator);
};
oFF.QueryManager.prototype.getSuppressCalculatedMembersWithoutBookedData = function()
{
	return this.getResultsetContainer(false).getSuppressCalculatedMembersWithoutBookedData();
};
oFF.QueryManager.prototype.setRequestPerformanceData = function(requestPerformanceData)
{
	if (this.getSystemType().isTypeOf(oFF.SystemType.HANA))
	{
		this.m_includePerformanceData = oFF.TriStateBool.lookup(requestPerformanceData);
	}
};
oFF.QueryManager.prototype.isRequestingPerformanceData = function()
{
	return this.m_includePerformanceData.getBoolean() === true;
};
oFF.QueryManager.prototype.getIncludePerformanceData = function()
{
	return this.m_includePerformanceData;
};
oFF.QueryManager.prototype.assertLifeCycleActive = function()
{
	if (this.m_lifeCycleState !== oFF.LifeCycleState.ACTIVE && this.m_lifeCycleState !== oFF.LifeCycleState.STARTING_UP)
	{
		throw oFF.XException.createIllegalStateException("Query manager is not active");
	}
};
oFF.QueryManager.prototype.getLifeCycleState = function()
{
	return this.m_lifeCycleState;
};
oFF.QueryManager.prototype.setLifeCycleState = function(desiredLifeCycleState)
{
	if (desiredLifeCycleState === oFF.LifeCycleState.TERMINATED && this.m_lifeCycleState === oFF.LifeCycleState.RELEASED)
	{
		return;
	}
	if (desiredLifeCycleState.getCode() < this.m_lifeCycleState.getCode())
	{
		var buffer = oFF.XStringBuffer.create();
		buffer.append("QueryManager: cannot change lifeCycle from ");
		buffer.append(this.m_lifeCycleState.getName()).append(" to ");
		buffer.append(desiredLifeCycleState.getName());
		throw oFF.XException.createIllegalStateException(buffer.toString());
	}
	this.m_lifeCycleState = desiredLifeCycleState;
};
oFF.QueryManager.prototype.queueEventing = function()
{
	this.assertLifeCycleActive();
	if (oFF.notNull(this.m_queryModel))
	{
		this.m_queryModel.queueEventing();
	}
};
oFF.QueryManager.prototype.stopEventing = function()
{
	this.assertLifeCycleActive();
	if (oFF.notNull(this.m_queryModel))
	{
		this.m_queryModel.stopEventing();
	}
};
oFF.QueryManager.prototype.isEventingStopped = function()
{
	this.assertLifeCycleActive();
	return oFF.notNull(this.m_queryModel) && this.m_queryModel.isEventingStopped();
};
oFF.QueryManager.prototype.resumeEventing = function()
{
	this.assertLifeCycleActive();
	if (oFF.notNull(this.m_queryModel))
	{
		this.m_queryModel.resumeEventing();
	}
};
oFF.QueryManager.prototype.onModelChange = function(phase)
{
	if (phase === oFF.QDeltaBroadcastPhase.BEFORE_EVENTS_BROADCAST && !this.getVariableProcessorState().isTypeOf(oFF.VariableProcessorState.PROCESSING_SUBMIT))
	{
		this.getResultsetContainer(true);
		this.invalidateVisualizationContainers();
	}
};
oFF.QueryManager.prototype.processCancel = function(syncType)
{
	this.getQueryManagerProvider().processProviderCancelThreads(syncType, null, null);
};
oFF.QueryManager.prototype.processClearCache = function(syncType, timestamp)
{
	this.getQueryManagerProvider().processProviderClearCache(syncType, null, null, timestamp);
};
oFF.QueryManager.prototype.processShutdown = function(syncType, listener, customIdentifier)
{
	return oFF.QmShutdownAction.createAndRun(syncType, listener, customIdentifier, this);
};
oFF.QueryManager.prototype.getVariableProcessor = function()
{
	return this;
};
oFF.QueryManager.prototype.hasVariables = function()
{
	this.assertLifeCycleActive();
	return oFF.notNull(this.m_queryModel) && this.m_queryModel.hasVariables();
};
oFF.QueryManager.prototype.hasInputEnabledVariables = function()
{
	this.assertLifeCycleActive();
	return oFF.notNull(this.m_queryModel) && this.m_queryModel.hasInputEnabledVariables();
};
oFF.QueryManager.prototype.hasInputEnabledAndNonTechnicalVariables = function()
{
	this.assertLifeCycleActive();
	return oFF.notNull(this.m_queryModel) && this.m_queryModel.hasInputEnabledAndNonTechnicalVariables();
};
oFF.QueryManager.prototype.clearExternalVariablesRepresentations = function()
{
	this.assertLifeCycleActive();
	this.m_queryModel.clearExternalVariablesRepresentations();
};
oFF.QueryManager.prototype.hasMandatoryVariables = function()
{
	this.assertLifeCycleActive();
	return oFF.notNull(this.m_queryModel) && this.m_queryModel.hasMandatoryVariables();
};
oFF.QueryManager.prototype.getVariables = function()
{
	this.assertLifeCycleActive();
	return this.m_queryModel.getVariables();
};
oFF.QueryManager.prototype.getInputEnabledVariables = function()
{
	this.assertLifeCycleActive();
	return this.m_queryModel.getInputEnabledVariables();
};
oFF.QueryManager.prototype.getInputEnabledAndNonTechnicalVariables = function()
{
	this.assertLifeCycleActive();
	return this.m_queryModel.getInputEnabledAndNonTechnicalVariables();
};
oFF.QueryManager.prototype.getVariable = function(name)
{
	this.assertLifeCycleActive();
	var variableManagerBase = this.m_queryModel.getVariableManagerBase();
	return variableManagerBase.getVariableBaseByName(name);
};
oFF.QueryManager.prototype.setWinControlInAutoSubmitByType = function(variableType, isWinControlInAutoSubmit, isLimitToExitVariable)
{
	this.assertLifeCycleActive();
	this.m_queryModel.setWinControlInAutoSubmitByType(variableType, isWinControlInAutoSubmit, isLimitToExitVariable);
};
oFF.QueryManager.prototype.getPreviousVariableProcessorState = function()
{
	return this.m_variableProcessorPreviousState;
};
oFF.QueryManager.prototype.setPreviousVariableProcessorState = function(variableProcessorPreviousState)
{
	this.m_variableProcessorPreviousState = variableProcessorPreviousState;
};
oFF.QueryManager.prototype.registerVariableProcessorStateChangedListener = function(listener, customIdentifier)
{
	if (oFF.notNull(listener))
	{
		if (oFF.isNull(this.m_processorStateListeners))
		{
			this.m_processorStateListeners = oFF.XList.create();
		}
		this.m_processorStateListeners.add(oFF.ListenerPair.create(listener, customIdentifier));
	}
};
oFF.QueryManager.prototype.unregisterVariableProcessorStateChangedListener = function(listener)
{
	if (oFF.notNull(this.m_processorStateListeners))
	{
		for (var i = 0; i < this.m_processorStateListeners.size(); )
		{
			var listenerPair = this.m_processorStateListeners.get(i);
			if (listenerPair.getListener() === listener)
			{
				this.m_processorStateListeners.removeAt(i);
			}
			else
			{
				i++;
			}
		}
	}
};
oFF.QueryManager.prototype.setVariableProcessorState = function(variableProcessorState)
{
	if (variableProcessorState === oFF.VariableProcessorState.VALUE_HELP)
	{
		this.m_variableProcessorPreviousState = variableProcessorState;
		this.m_variableProcessorState = variableProcessorState;
	}
	else
	{
		if (this.m_variableProcessorState !== variableProcessorState)
		{
			this.m_variableProcessorPreviousState = this.m_variableProcessorState;
			this.m_variableProcessorState = variableProcessorState;
			if (oFF.notNull(this.m_processorStateListeners))
			{
				var processorStateListenersSize = this.m_processorStateListeners.size();
				for (var i = 0; i < processorStateListenersSize; i++)
				{
					var listenerPair = this.m_processorStateListeners.get(i);
					var listener = listenerPair.getListener();
					listener.onVariableProcessorStateChanged(this, listenerPair.getCustomIdentifier());
				}
			}
		}
	}
};
oFF.QueryManager.prototype.getVariableProcessorState = function()
{
	return this.m_variableProcessorState;
};
oFF.QueryManager.prototype.isSubmitNeeded = function()
{
	return this.getVariableProcessorState().isSubmitNeeded() && (this.hasVariables() || this.supportsAndAllowsEmptyExtendedVarDefinition());
};
oFF.QueryManager.prototype.isReinitNeeded = function()
{
	return this.getVariableProcessorState().isReinitNeeded() && (this.hasVariables() || this.supportsAndAllowsEmptyExtendedVarDefinition());
};
oFF.QueryManager.prototype.isCancelNeeded = function()
{
	return this.getVariableProcessorState().isCancelNeeded() && (this.hasVariables() || this.supportsAndAllowsEmptyExtendedVarDefinition());
};
oFF.QueryManager.prototype.isProcessingAutoSubmit = function()
{
	return this.m_variableProcessorState === oFF.VariableProcessorState.PROCESSING_AUTO_SUBMIT || this.m_variableProcessorState === oFF.VariableProcessorState.PROCESSING_AUTO_SUBMIT_AFTER_REINIT;
};
oFF.QueryManager.prototype.isSubmitted = function()
{
	return this.m_variableProcessorState.isTypeOf(oFF.VariableProcessorState.SUBMITTED);
};
oFF.QueryManager.prototype.returnToPreviousProcessorState = function()
{
	if (this.m_variableProcessorPreviousState === oFF.VariableProcessorState.PROCESSING_REINIT)
	{
		this.m_variableProcessorPreviousState = oFF.VariableProcessorState.CHANGEABLE_REINIT;
	}
	else if (this.m_variableProcessorPreviousState === oFF.VariableProcessorState.PROCESSING_SUBMIT || this.m_variableProcessorPreviousState === oFF.VariableProcessorState.PROCESSING_SUBMIT_AFTER_REINIT || this.m_variableProcessorPreviousState === oFF.VariableProcessorState.PROCESSING_AUTO_SUBMIT || this.m_variableProcessorPreviousState === oFF.VariableProcessorState.PROCESSING_AUTO_SUBMIT_AFTER_REINIT)
	{
		this.m_variableProcessorPreviousState = oFF.VariableProcessorState.SUBMITTED;
	}
	if (this.m_variableProcessorPreviousState !== oFF.VariableProcessorState.CHANGEABLE_REINIT && this.m_variableProcessorPreviousState !== oFF.VariableProcessorState.CHANGEABLE_STARTUP && this.m_variableProcessorPreviousState !== oFF.VariableProcessorState.SUBMITTED && this.m_variableProcessorPreviousState !== oFF.VariableProcessorState.SUBMIT_FAILED && this.m_variableProcessorPreviousState !== oFF.VariableProcessorState.VALUE_HELP && this.m_variableProcessorPreviousState !== oFF.VariableProcessorState.PROCESSING_EMPTY_VARIABLE_DEFINITION && this.m_variableProcessorPreviousState !== oFF.VariableProcessorState.CHANGEABLE_DIRECT_VALUE_TRANSFER)
	{
		oFF.XObjectExt.assertNotNullExt(this.m_variableProcessorPreviousState, "Not allowed to return to previous state: [null]");
		throw oFF.XException.createIllegalStateException(oFF.XStringUtils.concatenate2("Not allowed to return to previous state: ", this.m_variableProcessorPreviousState.getName()));
	}
	var tmp = this.m_variableProcessorPreviousState;
	this.setVariableProcessorState(tmp);
	this.m_variableProcessorPreviousState = null;
};
oFF.QueryManager.prototype.getVariableContainer = function()
{
	return this.getVariableContainerBase();
};
oFF.QueryManager.prototype.getVariableContainerBase = function()
{
	return oFF.isNull(this.m_queryModel) ? null : this.m_queryModel.getVariableManagerBase();
};
oFF.QueryManager.prototype.reInitVariablesAfterSubmit = function(syncType, listener, customIdentifier)
{
	return this.getVariableProcessorProvider().processReInitVariableAfterSubmit(syncType, listener, customIdentifier);
};
oFF.QueryManager.prototype.submitVariables = function(syncType, listener, customIdentifier)
{
	return this.getVariableProcessorProvider().processVariableSubmit(syncType, listener, customIdentifier);
};
oFF.QueryManager.prototype.cancelReInitVariables = function(syncType, listener, customIdentifier)
{
	return this.getVariableProcessorProvider().processVariableCancel(syncType, listener, customIdentifier);
};
oFF.QueryManager.prototype.isDirectVariableTransferEnabled = function()
{
	return this.m_directVariableTransferConsumer;
};
oFF.QueryManager.prototype.setDirectVariableTransferEnabled = function(directVariableTransfer)
{
	if (this.m_directVariableTransferConsumer !== directVariableTransfer)
	{
		if (this.supportsDirectVariableTransfer())
		{
			this.m_directVariableTransferConsumer = directVariableTransfer;
			this.getVariableProcessorProvider().setDirectVariableTransfer(directVariableTransfer);
			this.getVariableProcessorProvider().setIsVariableSubmitNeeded(!this.m_directVariableTransferConsumer);
			if (oFF.notNull(this.m_queryModel))
			{
				this.m_queryModel.notifyNodeChanged();
			}
			if (this.m_directVariableTransferConsumer)
			{
				this.setVariableProcessorState(oFF.VariableProcessorState.CHANGEABLE_DIRECT_VALUE_TRANSFER);
			}
			else
			{
				this.setVariableProcessorState(oFF.VariableProcessorState.CHANGEABLE_REINIT);
			}
		}
	}
};
oFF.QueryManager.prototype.checkVariables = function(syncType, listener, customIdentifier)
{
	return this.getVariableProcessorProvider().processCheckVariables(syncType, listener, customIdentifier);
};
oFF.QueryManager.prototype.variablesRequireImplicitSubmitForValueHelp = function(valueHelpDimension)
{
	if (this.isDirectVariableTransferEnabled())
	{
		return false;
	}
	if (this.isShallow())
	{
		return false;
	}
	var isNonHierarchicalStructureMemberValueHelp = oFF.notNull(valueHelpDimension) && valueHelpDimension.getDimensionType().isTypeOf(oFF.DimensionType.ABSTRACT_STRUCTURE) && !valueHelpDimension.isHierarchyActive();
	if (this.isExecuteAutoVariableSubmit() && !(isNonHierarchicalStructureMemberValueHelp && this.getQueryModelBase().getVariableManagerBase().hasVariableByType(oFF.VariableType.TEXT_VARIABLE)))
	{
		return false;
	}
	if (isNonHierarchicalStructureMemberValueHelp && !this.getQueryModelBase().getVariableManagerBase().hasVariableByType(oFF.VariableType.TEXT_VARIABLE))
	{
		return false;
	}
	return (this.supportsAndAllowsEmptyExtendedVarDefinition() || this.hasVariables()) && !this.isSubmitted() && !this.isVariableSubmitFailed();
};
oFF.QueryManager.prototype.getOrCreateDocumentsStoreService = function(withVersions)
{
	if (oFF.isNull(this.m_documentsService))
	{
		if (this.isShallow())
		{
			var activeResultSetContainer = this.getActiveResultSetContainer();
			if (oFF.notNull(activeResultSetContainer) && oFF.XStringUtils.isNotNullAndNotEmpty(activeResultSetContainer.getRsDocumentServicePath()))
			{
				this.m_documentsService = oFF.DocumentsStoreServiceFactory.createDocumentStoreForShallowQueryManager(this, this.getInstanceId(), activeResultSetContainer.getRsDocumentServicePath(), withVersions, activeResultSetContainer.getRsDataArea());
			}
		}
		else if (this.getQueryModel() !== null)
		{
			var documentsInfo = this.getQueryModel().getDocumentsInfo();
			this.m_documentsService = oFF.isNull(documentsInfo) || documentsInfo.getSupportsDocuments() === oFF.DocumentsSupportType.NONE || oFF.XStringUtils.isNullOrEmpty(documentsInfo.getDocumentsServicePath()) ? null : oFF.DocumentsStoreServiceFactory.createDocumentStore(this, withVersions, this.getQueryModel().getDataArea());
		}
	}
	return this.m_documentsService;
};
oFF.QueryManager.prototype.variablesRequireImplicitSubmit = function()
{
	if (this.isDirectVariableTransferEnabled())
	{
		return false;
	}
	if (this.isShallow())
	{
		return false;
	}
	if (this.isExecuteAutoVariableSubmit())
	{
		return false;
	}
	return (this.supportsAndAllowsEmptyExtendedVarDefinition() || this.hasVariables()) && !this.isSubmitted() && !this.isVariableSubmitFailed();
};
oFF.QueryManager.prototype.variablesRequireSACImplicitSubmit = function()
{
	if (this.isDirectVariableTransferEnabled() || this.isShallow())
	{
		return false;
	}
	return (this.supportsAndAllowsEmptyExtendedVarDefinition() || this.hasVariables()) && !this.isSubmitted() && !this.isVariableSubmitFailed();
};
oFF.QueryManager.prototype.isExecuteAutoVariableSubmit = function()
{
	return oFF.notNull(this.m_queryModel) && this.getModelCapabilities().supportsAutoVariableSubmit() && this.getInitSettings().isEnableAutoVariableSubmit();
};
oFF.QueryManager.prototype.isVariableSubmitFailed = function()
{
	return this.m_variableProcessorState === oFF.VariableProcessorState.SUBMIT_FAILED;
};
oFF.QueryManager.prototype.supportsAndAllowsEmptyExtendedVarDefinition = function()
{
	var type = this.getDataSource().getType();
	return this.getCapabilitiesBase().supportsExtendedVariableDefinition() && this.getQueryServiceConfig().getMakeEmptyVariableDefinitionInsteadOfMetadata() && (oFF.MetaObjectType.QUERY === type || oFF.MetaObjectType.DEFAULT_PLAN_QUERY === type || oFF.MetaObjectType.DEFAULT_REPORT_QUERY === type || oFF.MetaObjectType.LOCAL_QUERY === type || oFF.MetaObjectType.QUERY_VIEW === type);
};
oFF.QueryManager.prototype.supportsBatchBlendingRsStreamingExt = function()
{
	var isBlended = false;
	var initSettings = this.getInitSettings();
	if (initSettings.getMode() === oFF.QueryManagerMode.BLENDING)
	{
		isBlended = true;
	}
	else if (initSettings.getMode() === oFF.QueryManagerMode.RAW_QUERY)
	{
		var structureJSON = initSettings.getDataRequest();
		if (oFF.notNull(structureJSON) && structureJSON.containsKey("Analytics"))
		{
			structureJSON = structureJSON.getStructureByKey("Analytics");
			if (structureJSON.containsKey("DataSource"))
			{
				structureJSON = structureJSON.getStructureByKey("DataSource");
				if (structureJSON.containsKey("Sources"))
				{
					var sourcesStructureJSON = structureJSON.getListByKey("Sources");
					if (sourcesStructureJSON.size() > 0)
					{
						isBlended = true;
					}
				}
			}
		}
	}
	return isBlended ? this.supportsBatchBlendingRsStreaming() : this.supportsBatchRsStreaming();
};
oFF.QueryManager.prototype.getLovManager = function()
{
	if (oFF.isNull(this.m_lovManager))
	{
		this.m_lovManager = oFF.LovManager.create(this);
	}
	return this.m_lovManager;
};
oFF.QueryManager.prototype.hasLovManager = function()
{
	return oFF.notNull(this.m_lovManager);
};
oFF.QueryManager.prototype.serialize = function(modelFormat, capabilities)
{
	return this.serializeToStringExt(modelFormat, capabilities);
};
oFF.QueryManager.prototype.serializeToFormat = function(modelFormat)
{
	return this.serializeToString(modelFormat);
};
oFF.QueryManager.prototype.serializeToString = function(modelFormat)
{
	var content = this.serializeToContentExt(modelFormat, null);
	var inaStructure = content.getJsonContent();
	return oFF.PrUtils.serialize(inaStructure, true, false, 0);
};
oFF.QueryManager.prototype.serializeToStringExt = function(modelFormat, capabilities)
{
	var content = this.serializeToContentExt(modelFormat, capabilities);
	var inaStructure = content.getJsonContent();
	return oFF.PrUtils.serialize(inaStructure, true, false, 0);
};
oFF.QueryManager.prototype.serializeToElement = function(modelFormat)
{
	return this.serializeToElementExt(modelFormat, null);
};
oFF.QueryManager.prototype.serializeToElementExt = function(modelFormat, capabilities)
{
	var content = this.serializeToContentExt(modelFormat, capabilities);
	var inaStructure = content.getJsonContent();
	return inaStructure;
};
oFF.QueryManager.prototype.serializeToContent = function(modelFormat)
{
	return this.serializeToContentExt(modelFormat, null);
};
oFF.QueryManager.prototype.serializeToContentExt = function(modelFormat, capabilities)
{
	var exporter;
	var theCapabilities = capabilities;
	if (oFF.isNull(theCapabilities) && modelFormat.isTypeOf(oFF.QModelFormat.INA_DATA))
	{
		theCapabilities = this.getModelCapabilities();
	}
	var contextType = null;
	if (modelFormat.isTypeOf(oFF.QModelFormat.INA_DATA))
	{
		contextType = oFF.QContextType.RESULT_SET;
	}
	exporter = oFF.QInAExportFactory.create(this.getApplication(), modelFormat, theCapabilities, contextType);
	var element = exporter.exportComponent(null, this, null, oFF.QImExFlag.DEFAULT_ALL);
	var content = oFF.XContent.createJsonObjectContent(modelFormat, element);
	return content;
};
oFF.QueryManager.prototype.deserializeFromContent = function(content)
{
	return this.deserializeFromElementExt(content.getContentType(), content.getJsonContent());
};
oFF.QueryManager.prototype.isShallow = function()
{
	var initSettings = this.getInitSettings();
	var hasRuntimeQueryModel = initSettings.getMode() === oFF.QueryManagerMode.RAW_QUERY && initSettings.getDefinitionType() === oFF.QModelFormat.INA_CLONE_RENDERING;
	return initSettings.getDataRequestAsString() !== null && (this.getQueryModel() === null || hasRuntimeQueryModel);
};
oFF.QueryManager.prototype.isBasedOnVirtualDataSource = function()
{
	return oFF.XString.isEqual(this.getDataSource().getFullQualifiedName(), oFF.QModelConstants.UPDATE_DYN_VAR_VIRTUAL_DATASOURCE);
};
oFF.QueryManager.prototype.hasMoreColumnRecordsAvailable = function()
{
	return this.getActiveResultSetContainer().hasMoreColumnRecordsAvailable();
};
oFF.QueryManager.prototype.hasMoreRowRecordsAvailable = function()
{
	return this.getActiveResultSetContainer().hasMoreRowRecordsAvailable();
};
oFF.QueryManager.prototype.getInputEnabledVariable = function(name)
{
	return this.getVariableContainer().getInputEnabledVariable(name);
};
oFF.QueryManager.prototype.getHierarchyNodeVariable = function(name)
{
	return this.getVariableContainer().getHierarchyNodeVariable(name);
};
oFF.QueryManager.prototype.getHierarchyNameVariable = function(name)
{
	return this.getVariableContainer().getHierarchyNameVariable(name);
};
oFF.QueryManager.prototype.getHierarchyNameVariables = function()
{
	return this.getVariableContainer().getHierarchyNameVariables();
};
oFF.QueryManager.prototype.getDimensionMemberVariables = function()
{
	return this.getVariableContainer().getDimensionMemberVariables();
};
oFF.QueryManager.prototype.getVariableMode = function()
{
	if (this.getVariableProcessorProvider().isDirectVariableTransfer())
	{
		return oFF.VariableMode.DIRECT_VALUE_TRANSFER;
	}
	return oFF.VariableMode.SUBMIT_AND_REINIT;
};
oFF.QueryManager.prototype.setCacheHintEnabled = function(enabled)
{
	this.m_cacheHintsEnabled = enabled;
};
oFF.QueryManager.prototype.isCacheHintEnabled = function()
{
	return this.m_cacheHintsEnabled;
};
oFF.QueryManager.prototype.getSystemName = function()
{
	var systemDescription = this.getSystemDescription();
	if (oFF.isNull(systemDescription))
	{
		return null;
	}
	return systemDescription.getSystemName();
};
oFF.QueryManager.prototype.getSystemType = function()
{
	return this.getSystemDescription().getSystemType();
};
oFF.QueryManager.prototype.setIsMetadataCached = function(isMetadataCached)
{
	this.m_isMetadataCached = isMetadataCached;
};
oFF.QueryManager.prototype.isMetadataCached = function()
{
	return this.m_isMetadataCached;
};
oFF.QueryManager.prototype.getPreQueryName = function()
{
	return this.m_preQueryName;
};
oFF.QueryManager.prototype.setPreQueryName = function(preQueryName)
{
	this.m_preQueryName = preQueryName;
};
oFF.QueryManager.prototype.isSuppressExitVariableValuesInRepoMode = function()
{
	return this.m_suppressExitVariableValues;
};
oFF.QueryManager.prototype.setSuppressExitVariableValuesInRepoMode = function(suppress)
{
	this.m_suppressExitVariableValues = suppress;
};
oFF.QueryManager.prototype.getQueryManagerProvider = oFF.noSupport;
oFF.QueryManager.prototype.getVariableProcessorProvider = oFF.noSupport;
oFF.QueryManager.prototype.isUpdatingDataRequestCapabilities = oFF.noSupport;
oFF.QueryManager.prototype.setUpdatingDataRequestCapabilities = oFF.noSupport;
oFF.QueryManager.prototype.getVariableVariantByName = oFF.noSupport;
oFF.QueryManager.prototype.processModelInitialization = oFF.noSupport;
oFF.QueryManager.prototype.processModelInitializationAndApplyRepoState = oFF.noSupport;
oFF.QueryManager.prototype.loadQueryModel = oFF.noSupport;
oFF.QueryManager.prototype.getRriTargetManager = oFF.noSupport;
oFF.QueryManager.prototype.cloneQueryManagerUsingExtDataSource = oFF.noSupport;
oFF.QueryManager.prototype.setDeserializationStructureAsNull = oFF.noSupport;
oFF.QueryManager.prototype.setNoVariableSubmitResponse = oFF.noSupport;
oFF.QueryManager.prototype.processBLOB = oFF.noSupport;
oFF.QueryManager.prototype.processUpdateRuntimeBlendQueryFromDependentQueries = oFF.noSupport;
oFF.QueryManager.prototype.getResourcePath = oFF.noSupport;
oFF.QueryManager.prototype.getResourceDetailsFromResourceIdentifier = oFF.noSupport;
oFF.QueryManager.prototype.recordingStateOfQueryManager = oFF.noSupport;
oFF.QueryManager.prototype.applyingStateOnQueryManager = oFF.noSupport;
oFF.QueryManager.prototype.applyRSFeatureRequest = oFF.noSupport;
oFF.QueryManager.prototype.setClientQueryObjectMigrationStorageName = function(storageName)
{
	this.m_clientQueryObjectStorageName = storageName;
};
oFF.QueryManager.prototype.getClientQueryObjectMigrationStorageName = function()
{
	return this.m_clientQueryObjectStorageName;
};
oFF.QueryManager.prototype.setClientQueryObjectStorageName = function(storageName)
{
	this.m_clientQueryObjectStorageName = storageName;
};
oFF.QueryManager.prototype.getClientQueryObjectStorageName = function()
{
	return this.m_clientQueryObjectStorageName;
};
oFF.QueryManager.prototype.getDataRequestAsString = oFF.noSupport;
oFF.QueryManager.prototype.getDataRequest = oFF.noSupport;
oFF.QueryManager.prototype.emptyVariableDefinition = oFF.noSupport;
oFF.QueryManager.prototype.activateVariableVariant = oFF.noSupport;
oFF.QueryManager.prototype.deleteVariableVariant = oFF.noSupport;
oFF.QueryManager.prototype.updateVariableVariantValues = oFF.noSupport;
oFF.QueryManager.prototype.saveVariableVariant = oFF.noSupport;
oFF.QueryManager.prototype.transferVariables = oFF.noSupport;
oFF.QueryManager.prototype.transferVariablesByVariable = oFF.noSupport;
oFF.QueryManager.prototype.updateDynamicVariables = oFF.noSupport;
oFF.QueryManager.prototype.resetExitOrUpdateDynamicVariable = oFF.noSupport;
oFF.QueryManager.prototype.getVariableVariants = oFF.noSupport;
oFF.QueryManager.prototype.getValueHelpProvider = oFF.noSupport;
oFF.QueryManager.prototype.setValueHelpProvider = oFF.noSupport;
oFF.QueryManager.prototype.applyState = oFF.noSupport;
oFF.QueryManager.prototype.recordState = oFF.noSupport;
oFF.QueryManager.prototype.getMessageManager = oFF.noSupport;
oFF.QueryManager.prototype.addVariableVariant = oFF.noSupport;
oFF.QueryManager.prototype.removeVariableVariant = oFF.noSupport;
oFF.QueryManager.prototype.clearVariableVariants = oFF.noSupport;
oFF.QueryManager.prototype.applyValueHelpCapabilities = oFF.noSupport;
oFF.QueryManager.prototype.getCapabilitiesBase = oFF.noSupport;
oFF.QueryManager.prototype.createCustomHierarchyProvider = oFF.noSupport;
oFF.QueryManager.prototype.getResultSetProviderFactory = oFF.noSupport;
oFF.QueryManager.prototype.deserializeExt = oFF.noSupport;
oFF.QueryManager.prototype.deserializeFromElementExt = function(modelFormat, element)
{
	return this.getQueryModel().deserializeFromElementExt(modelFormat, element);
};
oFF.QueryManager.prototype.deserializeNewComponentExt = oFF.noSupport;
oFF.QueryManager.prototype.deserializeNewComponentFromElementExt = oFF.noSupport;
oFF.QueryManager.prototype.updateQueryManager = oFF.noSupport;
oFF.QueryManager.prototype.isIncludePerformanceNotDefault = oFF.noSupport;
oFF.QueryManager.prototype.isApplyingRepoState = oFF.noSupport;
oFF.QueryManager.prototype.getName = function()
{
	return oFF.isNull(this.m_name) ? this.getInstanceId() : this.m_name;
};
oFF.QueryManager.prototype.setName = function(name)
{
	oFF.XStringUtils.checkStringNotEmpty(name, "Name of query manager must be a valid string");
	var olapEnv = this.getOlapEnvironmentBase();
	if (!oFF.XString.isEqual(name, this.m_name))
	{
		if (olapEnv.containsQueryManagerWithName(name))
		{
			throw oFF.XException.createIllegalArgumentException(oFF.XStringUtils.concatenate2("Olap Environment already contains Query Manager with name:", name));
		}
		olapEnv.unregisterQueryManager(this);
		this.m_name = name;
		olapEnv.registerQueryManager(this);
	}
};
oFF.QueryManager.prototype.isKeyRefSerializationEnabled = function()
{
	return this.m_keyRefSerializationEnabled;
};
oFF.QueryManager.prototype.setkeyRefSerializationEnabled = function(keyRefSerializationEnabled)
{
	this.m_keyRefSerializationEnabled = keyRefSerializationEnabled;
};
oFF.QueryManager.prototype.getStorageGroupName = function()
{
	return null;
};
oFF.QueryManager.prototype.getStorageName = function()
{
	return null;
};
oFF.QueryManager.prototype.getStorageObjectName = function()
{
	return null;
};
oFF.QueryManager.prototype.getChangedProperties = function()
{
	return null;
};
oFF.QueryManager.prototype.setChangedProperties = oFF.noSupport;
oFF.QueryManager.prototype.getChangedPropertiesInDetail = function()
{
	return null;
};
oFF.QueryManager.prototype.getModCounterState = function()
{
	if (oFF.isNull(this.m_modCounterState))
	{
		this.m_modCounterState = oFF.ModCounterState.create(this);
	}
	return this.m_modCounterState;
};
oFF.QueryManager.prototype.setUseSavedPromptsForExitVariables = function(disableExitVariables)
{
	this.m_disableExitVariables = disableExitVariables;
};
oFF.QueryManager.prototype.isUsingSavedPromptsForExitVariables = function()
{
	return this.m_disableExitVariables;
};
oFF.QueryManager.prototype.canMaterializeCompleteObject = function()
{
	return false;
};
oFF.QueryManager.prototype.canHaveExtensions = function()
{
	return false;
};
oFF.QueryManager.prototype.attachQueryExecutedListener = function(listener, customIdentifier)
{
	this.m_queryExecutedListener.put(listener, oFF.XPair.create(listener, customIdentifier));
};
oFF.QueryManager.prototype.detachQueryExecutedListener = function(listener)
{
	this.m_queryExecutedListener.remove(listener);
};
oFF.QueryManager.prototype.attachBeforeQueryExecutionListener = function(listener, customIdentifier)
{
	this.m_beforeQueryExecutionListener.put(listener, oFF.XPair.create(listener, customIdentifier));
};
oFF.QueryManager.prototype.detachBeforeQueryExecutionListener = function(listener)
{
	this.m_beforeQueryExecutionListener.remove(listener);
};
oFF.QueryManager.prototype.prepareMergeCandidate = oFF.noSupport;
oFF.QueryManager.prototype.getChangedPropertiesFromModellerMetadata = function()
{
	return null;
};

oFF.OlapVarImmediateCallback = function() {};
oFF.OlapVarImmediateCallback.prototype = new oFF.QOlapSyncAction();
oFF.OlapVarImmediateCallback.prototype._ff_c = "OlapVarImmediateCallback";

oFF.OlapVarImmediateCallback.createAndRun = function(syncType, listener, customIdentifier)
{
	var obj = new oFF.OlapVarImmediateCallback();
	obj.setupActionAndRun(syncType, listener, customIdentifier, null);
	return obj;
};
oFF.OlapVarImmediateCallback.createAndRunError = function(errorCode, errorMessage, syncType, listener, customIdentifier)
{
	var obj = new oFF.OlapVarImmediateCallback();
	obj.m_errorMessage = errorMessage;
	obj.m_errorCode = errorCode;
	obj.setupActionAndRun(syncType, listener, customIdentifier, null);
	return obj;
};
oFF.OlapVarImmediateCallback.prototype.m_errorMessage = null;
oFF.OlapVarImmediateCallback.prototype.m_errorCode = 0;
oFF.OlapVarImmediateCallback.prototype.isSuccessfullyProcessed = function()
{
	return this.isValid();
};
oFF.OlapVarImmediateCallback.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	if (oFF.XStringUtils.isNotNullAndNotEmpty(this.m_errorMessage))
	{
		this.addError(this.m_errorCode, this.m_errorMessage);
	}
	listener.onVariableProcessorExecuted(this, this, customIdentifier);
};

oFF.AbstractBlendableQueryManager = function() {};
oFF.AbstractBlendableQueryManager.prototype = new oFF.QModelComponent();
oFF.AbstractBlendableQueryManager.prototype._ff_c = "AbstractBlendableQueryManager";

oFF.AbstractBlendableQueryManager.prototype.m_primaryDatasetId = null;
oFF.AbstractBlendableQueryManager.prototype.m_queryManagers = null;
oFF.AbstractBlendableQueryManager.prototype.m_activeContainer = null;
oFF.AbstractBlendableQueryManager.prototype.m_clientQueryObjectStorageName = null;
oFF.AbstractBlendableQueryManager.prototype.getOlapComponentType = function()
{
	return oFF.OlapComponentType.BLENDABLE_QUERY_MANAGER;
};
oFF.AbstractBlendableQueryManager.prototype.setupBlendingManager = function(context)
{
	this.setupModelComponent(context, null);
	this.m_queryManagers = oFF.XLinkedHashMapByString.create();
	this.m_primaryDatasetId = null;
};
oFF.AbstractBlendableQueryManager.prototype.copyFromInternal = oFF.noSupport;
oFF.AbstractBlendableQueryManager.prototype.releaseObject = function()
{
	this.m_primaryDatasetId = null;
	this.m_queryManagers = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_queryManagers);
	this.m_activeContainer = oFF.XObjectExt.release(this.m_activeContainer);
	oFF.QModelComponent.prototype.releaseObject.call( this );
};
oFF.AbstractBlendableQueryManager.prototype.getPrimaryQueryManager = function()
{
	return this.getQueryManagerByDatasetId(this.m_primaryDatasetId);
};
oFF.AbstractBlendableQueryManager.prototype.getSecondaryQueryManagers = function()
{
	var allQueryManagers = this.getAllQueryManagers();
	var secondaryQueryManagers = oFF.XList.create();
	var queryManagerIterator = allQueryManagers.getIterator();
	while (queryManagerIterator.hasNext())
	{
		var queryManager = queryManagerIterator.next();
		if (!oFF.XString.isEqual(queryManager.getQueryModel().getDatasetId(), this.m_primaryDatasetId))
		{
			secondaryQueryManagers.add(queryManager);
		}
	}
	return secondaryQueryManagers;
};
oFF.AbstractBlendableQueryManager.prototype.getAllQueryManagers = function()
{
	return this.m_queryManagers.getValuesAsReadOnlyList();
};
oFF.AbstractBlendableQueryManager.prototype.getQueryManagerByDatasetId = function(name)
{
	return this.m_queryManagers.getByKey(name);
};
oFF.AbstractBlendableQueryManager.prototype.setPrimaryQueryManager = function(queryManager)
{
	this.addQueryManager(queryManager);
	this.m_primaryDatasetId = queryManager.getQueryModel().getDatasetId();
};
oFF.AbstractBlendableQueryManager.prototype.addSecondaryQueryManager = function(queryManager)
{
	this.addQueryManager(queryManager);
};
oFF.AbstractBlendableQueryManager.prototype.addQueryManager = function(queryManager)
{
	var datasetId = queryManager.getQueryModel().getDatasetId();
	if (oFF.isNull(datasetId))
	{
		throw oFF.XException.createIllegalArgumentException("The query manager requires a datasetId.");
	}
	this.m_queryManagers.put(datasetId, queryManager);
	queryManager.getQueryModel().addSecondaryParent(this);
	queryManager.getTagging().put(oFF.QStateConstants.TAG_UNDO_IGNORE, "");
};
oFF.AbstractBlendableQueryManager.prototype.cloneQueryManagerExt = function(cloneMode)
{
	var cloneBlendableQueryManager = this.newBlendableQueryManager();
	cloneBlendableQueryManager.setupBlendingManager(this.getContext());
	cloneBlendableQueryManager.setupClone(this, cloneMode, null);
	return cloneBlendableQueryManager;
};
oFF.AbstractBlendableQueryManager.prototype.cloneQueryManagerOptimized = function(neededDimensions)
{
	var cloneBlendableQueryManager = this.newBlendableQueryManager();
	cloneBlendableQueryManager.setupBlendingManager(this.getContext());
	cloneBlendableQueryManager.setupClone(this, oFF.QueryCloneMode.CURRENT_STATE, null);
	return cloneBlendableQueryManager;
};
oFF.AbstractBlendableQueryManager.prototype.cloneQueryManager = function()
{
	return this.cloneQueryManagerExt(oFF.QueryCloneMode.CURRENT_STATE);
};
oFF.AbstractBlendableQueryManager.prototype.setupClone = function(origin, cloneMode, dataSource)
{
	var originBlendableQM = origin;
	this.m_primaryDatasetId = originBlendableQM.m_primaryDatasetId;
	this.m_clientQueryObjectStorageName = originBlendableQM.m_clientQueryObjectStorageName;
	this.m_queryManagers.clear();
	var originQueryManagers = originBlendableQM.getAllQueryManagers();
	for (var j = 0; j < originQueryManagers.size(); j++)
	{
		var originQueryManager = originQueryManagers.get(j);
		var copyQueryManager = originQueryManager.cloneQueryManagerExt(cloneMode);
		this.m_queryManagers.put(originQueryManager.getQueryModel().getDatasetId(), copyQueryManager);
	}
};
oFF.AbstractBlendableQueryManager.prototype.cloneQueryManagerUsingExtDataSource = function(cloneMode, dataSource)
{
	var queryManager = this.getQueryManager();
	var cloneQueryManager = null;
	if (oFF.notNull(queryManager))
	{
		cloneQueryManager = queryManager.cloneQueryManagerUsingExtDataSource(cloneMode, dataSource);
	}
	return cloneQueryManager;
};
oFF.AbstractBlendableQueryManager.prototype.cloneQueryManagerBase = function(cloneMode)
{
	return this.cloneQueryManagerExt(cloneMode);
};
oFF.AbstractBlendableQueryManager.prototype.getQueryManager = function()
{
	return this.getPrimaryQueryManager();
};
oFF.AbstractBlendableQueryManager.prototype.getQueryModel = function()
{
	var primaryQueryManager = this.getQueryManagerByDatasetId(this.m_primaryDatasetId);
	var queryModel = null;
	if (oFF.notNull(primaryQueryManager))
	{
		queryModel = primaryQueryManager.getQueryModel();
	}
	return queryModel;
};
oFF.AbstractBlendableQueryManager.prototype.getContext = function()
{
	return this;
};
oFF.AbstractBlendableQueryManager.prototype.getModelCapabilities = function()
{
	var primaryQueryManager = this.getQueryManagerByDatasetId(this.m_primaryDatasetId);
	var modelCapabilities = null;
	if (oFF.notNull(primaryQueryManager))
	{
		modelCapabilities = primaryQueryManager.getModelCapabilities();
	}
	return modelCapabilities;
};
oFF.AbstractBlendableQueryManager.prototype.supportsServerState = function()
{
	var queryManager = this.getQueryManager();
	var supportsServerState = false;
	if (oFF.notNull(queryManager))
	{
		supportsServerState = queryManager.supportsServerState();
	}
	return supportsServerState;
};
oFF.AbstractBlendableQueryManager.prototype.supportsReturnedDataSelection = function()
{
	var queryManager = this.getQueryManager();
	var supportsReturnedDataSelection = false;
	if (oFF.notNull(queryManager))
	{
		supportsReturnedDataSelection = queryManager.supportsReturnedDataSelection();
	}
	return supportsReturnedDataSelection;
};
oFF.AbstractBlendableQueryManager.prototype.supportsShutdown = function()
{
	var queryManager = this.getQueryManager();
	var supportsShutdown = false;
	if (oFF.notNull(queryManager))
	{
		supportsShutdown = queryManager.supportsShutdown();
	}
	return supportsShutdown;
};
oFF.AbstractBlendableQueryManager.prototype.supportsInputReadinessStates = function()
{
	var queryManager = this.getQueryManager();
	var supportsInputReadinessStates = false;
	if (oFF.notNull(queryManager))
	{
		supportsInputReadinessStates = queryManager.supportsInputReadinessStates();
	}
	return supportsInputReadinessStates;
};
oFF.AbstractBlendableQueryManager.prototype.supportsBatchRsStreaming = function()
{
	var queryManager = this.getQueryManager();
	var supportsBatchRsStreaming = false;
	if (oFF.notNull(queryManager))
	{
		supportsBatchRsStreaming = queryManager.supportsBatchRsStreaming();
	}
	return supportsBatchRsStreaming;
};
oFF.AbstractBlendableQueryManager.prototype.supportsBatchBlendingRsStreaming = function()
{
	var queryManager = this.getQueryManager();
	var supportsBatchBlendingRsStreaming = false;
	if (oFF.notNull(queryManager))
	{
		supportsBatchBlendingRsStreaming = queryManager.supportsBatchBlendingRsStreaming();
	}
	return supportsBatchBlendingRsStreaming;
};
oFF.AbstractBlendableQueryManager.prototype.supportsAnalyticCapability = function(capabilityName)
{
	var queryManager = this.getQueryManager();
	var supportsAnalyticCapability = false;
	if (oFF.notNull(queryManager))
	{
		supportsAnalyticCapability = queryManager.supportsAnalyticCapability(capabilityName);
	}
	return supportsAnalyticCapability;
};
oFF.AbstractBlendableQueryManager.prototype.applyValueHelpCapabilities = function()
{
	this.getQueryManagerBase().applyValueHelpCapabilities();
};
oFF.AbstractBlendableQueryManager.prototype.getCapabilitiesBase = function()
{
	return this.getQueryManagerBase().getCapabilitiesBase();
};
oFF.AbstractBlendableQueryManager.prototype.processModelInitialization = oFF.noSupport;
oFF.AbstractBlendableQueryManager.prototype.processModelInitializationAndApplyRepoState = oFF.noSupport;
oFF.AbstractBlendableQueryManager.prototype.loadQueryModel = oFF.noSupport;
oFF.AbstractBlendableQueryManager.prototype.processShutdown = function(syncType, listener, customIdentifier)
{
	var queryManager = this.getQueryManager();
	var syncAction = null;
	if (oFF.notNull(queryManager))
	{
		syncAction = queryManager.processShutdown(syncType, listener, customIdentifier);
	}
	return syncAction;
};
oFF.AbstractBlendableQueryManager.prototype.processClearCache = function(syncType, timestamp)
{
	var queryManager = this.getQueryManager();
	if (oFF.notNull(queryManager))
	{
		queryManager.processClearCache(syncType, timestamp);
	}
};
oFF.AbstractBlendableQueryManager.prototype.processCancel = function(syncType)
{
	var queryManager = this.getQueryManager();
	if (oFF.notNull(queryManager))
	{
		queryManager.processCancel(syncType);
	}
};
oFF.AbstractBlendableQueryManager.prototype.processQueryExecutionAsBlendingSource = oFF.noSupport;
oFF.AbstractBlendableQueryManager.prototype.retriggerQueryExecutionWithCustomHierarchies = oFF.noSupport;
oFF.AbstractBlendableQueryManager.prototype.processQueryExecutionAsRemotePreQuery = function(syncType, listener, customIdentifier)
{
	return this.getQueryManagerBase().processQueryExecutionAsRemotePreQuery(syncType, listener, customIdentifier);
};
oFF.AbstractBlendableQueryManager.prototype.processQueryExecutionAsLovProcess = function(lovConfig, syncType, listener, customIdentifier)
{
	return this.getQueryManagerBase().processQueryExecutionAsLovProcess(lovConfig, syncType, listener, customIdentifier);
};
oFF.AbstractBlendableQueryManager.prototype.createCustomHierarchyProvider = function(customHierarchyDefinition, enforceRequest)
{
	return this.getQueryManagerBase().createCustomHierarchyProvider(customHierarchyDefinition, enforceRequest);
};
oFF.AbstractBlendableQueryManager.prototype.processUpdateRuntimeBlendQueryFromDependentQueries = oFF.noSupport;
oFF.AbstractBlendableQueryManager.prototype.setRequestPerformanceData = function(requestPerformanceData)
{
	var queryManager = this.getQueryManager();
	if (oFF.notNull(queryManager))
	{
		queryManager.setRequestPerformanceData(requestPerformanceData);
	}
};
oFF.AbstractBlendableQueryManager.prototype.isRequestingPerformanceData = function()
{
	var queryManager = this.getQueryManager();
	var isRequestingPerformanceData = false;
	if (oFF.notNull(queryManager))
	{
		isRequestingPerformanceData = queryManager.isRequestingPerformanceData();
	}
	return isRequestingPerformanceData;
};
oFF.AbstractBlendableQueryManager.prototype.isUpdatingDataRequestCapabilities = function()
{
	var queryManager = this.getQueryManager();
	var isUpdatingDataRequestCapabilities = false;
	if (oFF.notNull(queryManager))
	{
		isUpdatingDataRequestCapabilities = queryManager.isUpdatingDataRequestCapabilities();
	}
	return isUpdatingDataRequestCapabilities;
};
oFF.AbstractBlendableQueryManager.prototype.setUpdatingDataRequestCapabilities = function(updateCapabilities)
{
	var queryManager = this.getQueryManager();
	if (oFF.notNull(queryManager))
	{
		queryManager.setRequestPerformanceData(updateCapabilities);
	}
};
oFF.AbstractBlendableQueryManager.prototype.setPreQueryName = function(preQueryName)
{
	var queryManager = this.getQueryManager();
	if (oFF.notNull(queryManager))
	{
		queryManager.setPreQueryName(preQueryName);
	}
};
oFF.AbstractBlendableQueryManager.prototype.getPreQueryName = function()
{
	var queryManager = this.getQueryManager();
	var preQueryName = null;
	if (oFF.notNull(queryManager))
	{
		preQueryName = queryManager.getPreQueryName();
	}
	return preQueryName;
};
oFF.AbstractBlendableQueryManager.prototype.getVariableVariantByName = function(variableVariantName)
{
	var queryManager = this.getQueryManager();
	var variableVariant = null;
	if (oFF.notNull(queryManager))
	{
		variableVariant = queryManager.getVariableVariantByName(variableVariantName);
	}
	return variableVariant;
};
oFF.AbstractBlendableQueryManager.prototype.enableReturnedDataSelection = function(dataSelection)
{
	var queryManager = this.getQueryManager();
	if (oFF.notNull(queryManager))
	{
		queryManager.enableReturnedDataSelection(dataSelection);
	}
};
oFF.AbstractBlendableQueryManager.prototype.disableReturnedDataSelection = function(dataSelection)
{
	var queryManager = this.getQueryManager();
	if (oFF.notNull(queryManager))
	{
		queryManager.disableReturnedDataSelection(dataSelection);
	}
};
oFF.AbstractBlendableQueryManager.prototype.getAllEnabledReturnedDataSelections = function()
{
	var queryManager = this.getQueryManager();
	var enabledReturnedDataSelections = oFF.XListOfString.create();
	if (oFF.notNull(queryManager))
	{
		enabledReturnedDataSelections = queryManager.getAllEnabledReturnedDataSelections();
	}
	return enabledReturnedDataSelections;
};
oFF.AbstractBlendableQueryManager.prototype.getAllDisabledReturnedDataSelections = function()
{
	var queryManager = this.getQueryManager();
	var disabledReturnedDataSelections = oFF.XListOfString.create();
	if (oFF.notNull(queryManager))
	{
		disabledReturnedDataSelections = queryManager.getAllDisabledReturnedDataSelections();
	}
	return disabledReturnedDataSelections;
};
oFF.AbstractBlendableQueryManager.prototype.updateQueryManager = function(masterQueryManager, neededDimensions)
{
	var queryManager = this.getQueryManager();
	if (oFF.notNull(queryManager))
	{
		queryManager.updateQueryManager(masterQueryManager, neededDimensions);
	}
};
oFF.AbstractBlendableQueryManager.prototype.invalidateState = function()
{
	var queryManager = this.getQueryManager();
	if (oFF.notNull(queryManager))
	{
		queryManager.invalidateState();
	}
	this.getResultsetContainer(true);
};
oFF.AbstractBlendableQueryManager.prototype.getMetadataModel = function()
{
	var queryManager = this.getQueryManager();
	var metadataModel = null;
	if (oFF.notNull(queryManager))
	{
		metadataModel = queryManager.getMetadataModel();
	}
	return metadataModel;
};
oFF.AbstractBlendableQueryManager.prototype.getRriTargetManager = function()
{
	var queryManager = this.getQueryManager();
	var rriTargetManager = null;
	if (oFF.notNull(queryManager))
	{
		rriTargetManager = queryManager.getRriTargetManager();
	}
	return rriTargetManager;
};
oFF.AbstractBlendableQueryManager.prototype.setSuppressExitVariableValuesInRepoMode = function(suppress)
{
	var queryManager = this.getQueryManager();
	if (oFF.notNull(queryManager))
	{
		queryManager.setSuppressExitVariableValuesInRepoMode(suppress);
	}
};
oFF.AbstractBlendableQueryManager.prototype.isSuppressExitVariableValuesInRepoMode = function()
{
	var queryManager = this.getQueryManager();
	var isSuppressExitVariableValuesInRepoMode = false;
	if (oFF.notNull(queryManager))
	{
		isSuppressExitVariableValuesInRepoMode = queryManager.isSuppressExitVariableValuesInRepoMode();
	}
	return isSuppressExitVariableValuesInRepoMode;
};
oFF.AbstractBlendableQueryManager.prototype.isSystemMappingValid = function(remoteQueryManager)
{
	var queryManager = this.getQueryManager();
	var isSystemMappingValid = false;
	if (oFF.notNull(queryManager))
	{
		isSystemMappingValid = queryManager.isSystemMappingValid(remoteQueryManager);
	}
	return isSystemMappingValid;
};
oFF.AbstractBlendableQueryManager.prototype.setIsMetadataCached = function(isMetadataCached)
{
	var queryManager = this.getQueryManager();
	if (oFF.notNull(queryManager))
	{
		queryManager.setIsMetadataCached(isMetadataCached);
	}
};
oFF.AbstractBlendableQueryManager.prototype.setDeserializationStructureAsNull = function()
{
	var queryManager = this.getQueryManager();
	if (oFF.notNull(queryManager))
	{
		queryManager.setDeserializationStructureAsNull();
	}
};
oFF.AbstractBlendableQueryManager.prototype.setNoVariableSubmitResponse = function(noVariableSubmitResponse)
{
	var queryManager = this.getQueryManager();
	if (oFF.notNull(queryManager))
	{
		queryManager.setNoVariableSubmitResponse(noVariableSubmitResponse);
	}
};
oFF.AbstractBlendableQueryManager.prototype.getPreQueryExecutor = function()
{
	var queryManager = this.getQueryManager();
	var preQueryExecutor = null;
	if (oFF.notNull(queryManager))
	{
		preQueryExecutor = queryManager.getPreQueryExecutor();
	}
	return preQueryExecutor;
};
oFF.AbstractBlendableQueryManager.prototype.processBLOB = function(syncType, listener, customIdentifier, imagePath)
{
	var queryManager = this.getQueryManager();
	var syncAction = null;
	if (oFF.notNull(queryManager))
	{
		syncAction = queryManager.processBLOB(syncType, listener, customIdentifier, imagePath);
	}
	return syncAction;
};
oFF.AbstractBlendableQueryManager.prototype.getResourcePath = function()
{
	var queryManager = this.getQueryManager();
	var resourcePath = null;
	if (oFF.notNull(queryManager))
	{
		resourcePath = queryManager.getResourcePath();
	}
	return resourcePath;
};
oFF.AbstractBlendableQueryManager.prototype.getResourceDetailsFromResourceIdentifier = function(resourceKey)
{
	var queryManager = this.getQueryManager();
	var resourceDetails = null;
	if (oFF.notNull(queryManager))
	{
		resourceDetails = queryManager.getResourceDetailsFromResourceIdentifier(resourceKey);
	}
	return resourceDetails;
};
oFF.AbstractBlendableQueryManager.prototype.enableHierarchyToUDHConversion = function(enableConversion)
{
	var queryManager = this.getQueryManager();
	if (oFF.notNull(queryManager))
	{
		queryManager.enableHierarchyToUDHConversion(enableConversion);
	}
};
oFF.AbstractBlendableQueryManager.prototype.isHierarchyToUDHConversionEnabled = function()
{
	var queryManager = this.getQueryManager();
	return oFF.notNull(queryManager) && queryManager.isHierarchyToUDHConversionEnabled();
};
oFF.AbstractBlendableQueryManager.prototype.isHierarchyToUDHConversionEnabledForCurrentRs = function()
{
	var queryManager = this.getQueryManager();
	return oFF.notNull(queryManager) && queryManager.isHierarchyToUDHConversionEnabledForCurrentRs();
};
oFF.AbstractBlendableQueryManager.prototype.isShallow = function()
{
	return false;
};
oFF.AbstractBlendableQueryManager.prototype.supportsAndAllowsEmptyExtendedVarDefinition = function()
{
	var queryManager = this.getQueryManager();
	var supportsAndAllowsEmptyExtendedVarDefinition = false;
	if (oFF.notNull(queryManager))
	{
		supportsAndAllowsEmptyExtendedVarDefinition = queryManager.supportsAndAllowsEmptyExtendedVarDefinition();
	}
	return supportsAndAllowsEmptyExtendedVarDefinition;
};
oFF.AbstractBlendableQueryManager.prototype.getNameForMicroCubeUse = function()
{
	var queryManager = this.getQueryManager();
	var name = null;
	if (oFF.notNull(queryManager))
	{
		name = queryManager.getNameForMicroCubeUse();
	}
	return name;
};
oFF.AbstractBlendableQueryManager.prototype.setNameForMicroCubeUse = function(name)
{
	var queryManager = this.getQueryManager();
	if (oFF.notNull(queryManager))
	{
		queryManager.setNameForMicroCubeUse(name);
	}
};
oFF.AbstractBlendableQueryManager.prototype.recordingStateOfQueryManager = function()
{
	var queryManager = this.getQueryManager();
	var recordingState = false;
	if (oFF.notNull(queryManager))
	{
		recordingState = queryManager.recordingStateOfQueryManager();
	}
	return recordingState;
};
oFF.AbstractBlendableQueryManager.prototype.applyingStateOnQueryManager = function()
{
	var queryManager = this.getQueryManager();
	var applyingState = false;
	if (oFF.notNull(queryManager))
	{
		applyingState = queryManager.applyingStateOnQueryManager();
	}
	return applyingState;
};
oFF.AbstractBlendableQueryManager.prototype.setCacheHintEnabled = function(enabled)
{
	var queryManager = this.getQueryManager();
	if (oFF.notNull(queryManager))
	{
		queryManager.setCacheHintEnabled(enabled);
	}
};
oFF.AbstractBlendableQueryManager.prototype.isCacheHintEnabled = function()
{
	var queryManager = this.getQueryManager();
	var isCacheHintEnabled = false;
	if (oFF.notNull(queryManager))
	{
		isCacheHintEnabled = queryManager.isCacheHintEnabled();
	}
	return isCacheHintEnabled;
};
oFF.AbstractBlendableQueryManager.prototype.resetPreparation = function()
{
	var queryManager = this.getQueryManager();
	if (oFF.notNull(queryManager))
	{
		queryManager.resetPreparation();
	}
};
oFF.AbstractBlendableQueryManager.prototype.getLovManager = function()
{
	var queryManager = this.getQueryManager();
	var lovManager = null;
	if (oFF.notNull(queryManager))
	{
		lovManager = queryManager.getLovManager();
	}
	return lovManager;
};
oFF.AbstractBlendableQueryManager.prototype.setDataSource = function(dataSource)
{
	var queryManager = this.getQueryManager();
	if (oFF.notNull(queryManager))
	{
		queryManager.setDataSource(dataSource);
	}
};
oFF.AbstractBlendableQueryManager.prototype.applyRSFeatureRequest = function()
{
	var queryManager = this.getQueryManager();
	if (oFF.notNull(queryManager))
	{
		queryManager.applyRSFeatureRequest();
	}
};
oFF.AbstractBlendableQueryManager.prototype.getInitSettings = function()
{
	var queryManager = this.getQueryManager();
	var settings = null;
	if (oFF.notNull(queryManager))
	{
		settings = queryManager.getInitSettings();
	}
	return settings;
};
oFF.AbstractBlendableQueryManager.prototype.setClientQueryObjectMigrationStorageName = function(storageName)
{
	var queryManager = this.getQueryManager();
	if (oFF.notNull(queryManager))
	{
		queryManager.setClientQueryObjectStorageName(storageName);
	}
};
oFF.AbstractBlendableQueryManager.prototype.getClientQueryObjectMigrationStorageName = function()
{
	var queryManager = this.getQueryManager();
	var storageName = null;
	if (oFF.notNull(queryManager))
	{
		storageName = queryManager.getClientQueryObjectStorageName();
	}
	return storageName;
};
oFF.AbstractBlendableQueryManager.prototype.setClientQueryObjectStorageName = function(storageName)
{
	this.m_clientQueryObjectStorageName = storageName;
};
oFF.AbstractBlendableQueryManager.prototype.getClientQueryObjectStorageName = function()
{
	return this.m_clientQueryObjectStorageName;
};
oFF.AbstractBlendableQueryManager.prototype.getDataRequestAsString = function()
{
	var queryManager = this.getQueryManager();
	var request = null;
	if (oFF.notNull(queryManager))
	{
		request = queryManager.getDataRequestAsString();
	}
	return request;
};
oFF.AbstractBlendableQueryManager.prototype.getDataRequest = function()
{
	var queryManager = this.getQueryManager();
	var request = null;
	if (oFF.notNull(queryManager))
	{
		request = queryManager.getDataRequest();
	}
	return request;
};
oFF.AbstractBlendableQueryManager.prototype.getPlanningManager = function()
{
	var queryManager = this.getQueryManager();
	var planningManager = null;
	if (oFF.notNull(queryManager))
	{
		planningManager = queryManager.getPlanningManager();
	}
	return planningManager;
};
oFF.AbstractBlendableQueryManager.prototype.isKeyRefSerializationEnabled = function()
{
	var queryManager = this.getQueryManager();
	var isKeyRefSerializationEnabled = false;
	if (oFF.notNull(queryManager))
	{
		isKeyRefSerializationEnabled = queryManager.isKeyRefSerializationEnabled();
	}
	return isKeyRefSerializationEnabled;
};
oFF.AbstractBlendableQueryManager.prototype.setkeyRefSerializationEnabled = function(keyRefSerializationEnabled)
{
	var queryManager = this.getQueryManager();
	if (oFF.notNull(queryManager))
	{
		queryManager.setkeyRefSerializationEnabled(keyRefSerializationEnabled);
	}
};
oFF.AbstractBlendableQueryManager.prototype.getLifeCycleState = function()
{
	var queryManager = this.getQueryManager();
	var lifeCycleState = null;
	if (oFF.notNull(queryManager))
	{
		lifeCycleState = queryManager.getLifeCycleState();
	}
	return lifeCycleState;
};
oFF.AbstractBlendableQueryManager.prototype.getInstanceId = function()
{
	var queryManager = this.getQueryManager();
	var instanceId = null;
	if (oFF.notNull(queryManager))
	{
		instanceId = queryManager.getInstanceId();
	}
	return instanceId;
};
oFF.AbstractBlendableQueryManager.prototype.applyState = function(syncType, listener, customerIdentifier, stateId)
{
	var queryManager = this.getQueryManager();
	var syncAction = null;
	if (oFF.notNull(queryManager))
	{
		syncAction = queryManager.applyState(syncType, listener, customerIdentifier, stateId);
	}
	return syncAction;
};
oFF.AbstractBlendableQueryManager.prototype.recordState = function()
{
	var queryManager = this.getQueryManager();
	var state = null;
	if (oFF.notNull(queryManager))
	{
		state = queryManager.recordState();
	}
	return state;
};
oFF.AbstractBlendableQueryManager.prototype.getMode = function()
{
	var queryManager = this.getQueryManager();
	var mode = null;
	if (oFF.notNull(queryManager))
	{
		mode = queryManager.getInitSettings().getMode();
	}
	return mode;
};
oFF.AbstractBlendableQueryManager.prototype.getProviderType = function()
{
	var queryManager = this.getQueryManager();
	var providerType = null;
	if (oFF.notNull(queryManager))
	{
		providerType = queryManager.getInitSettings().getProviderType();
	}
	return providerType;
};
oFF.AbstractBlendableQueryManager.prototype.getDefinition = function()
{
	var queryManager = this.getQueryManager();
	var definition = null;
	if (oFF.notNull(queryManager))
	{
		definition = queryManager.getInitSettings().getDefinition();
	}
	return definition;
};
oFF.AbstractBlendableQueryManager.prototype.isDataSourceInitial = function()
{
	return this.getQueryManagerBase().isDataSourceInitial();
};
oFF.AbstractBlendableQueryManager.prototype.getIncludePerformanceData = function()
{
	return this.getQueryManagerBase().getIncludePerformanceData();
};
oFF.AbstractBlendableQueryManager.prototype.getValueHelpProvider = function()
{
	return this.getQueryManagerBase().getValueHelpProvider();
};
oFF.AbstractBlendableQueryManager.prototype.setValueHelpProvider = function(valueHelpProvider)
{
	this.getQueryManagerBase().setValueHelpProvider(valueHelpProvider);
};
oFF.AbstractBlendableQueryManager.prototype.isIncludePerformanceNotDefault = function()
{
	return this.getQueryManagerBase().isIncludePerformanceNotDefault();
};
oFF.AbstractBlendableQueryManager.prototype.isApplyingRepoState = function()
{
	return this.getQueryManagerBase().isApplyingRepoState();
};
oFF.AbstractBlendableQueryManager.prototype.hasLovManager = function()
{
	return this.getQueryManagerBase().hasLovManager();
};
oFF.AbstractBlendableQueryManager.prototype.isBasedOnVirtualDataSource = function()
{
	return false;
};
oFF.AbstractBlendableQueryManager.prototype.setLifeCycleState = function(desiredLifeCycleState)
{
	this.getQueryManagerBase().setLifeCycleState(desiredLifeCycleState);
};
oFF.AbstractBlendableQueryManager.prototype.onModelChange = function(phase)
{
	this.getQueryManagerBase().onModelChange(phase);
};
oFF.AbstractBlendableQueryManager.prototype.getDimensionsToClone = function()
{
	return this.getQueryManagerBase().getDimensionsToClone();
};
oFF.AbstractBlendableQueryManager.prototype.getDimensionsRequestedFromClient = function()
{
	return this.getQueryManagerBase().getDimensionsRequestedFromClient();
};
oFF.AbstractBlendableQueryManager.prototype.isMetadataCached = function()
{
	return this.getQueryManagerBase().isMetadataCached();
};
oFF.AbstractBlendableQueryManager.prototype.setupQueryModel = function()
{
	return this.getQueryManagerBase().setupQueryModel();
};
oFF.AbstractBlendableQueryManager.prototype.getMetadataModelBase = function()
{
	return this.getQueryManagerBase().getMetadataModelBase();
};
oFF.AbstractBlendableQueryManager.prototype.isLightweightSearch = function()
{
	return this.getQueryManagerBase().isLightweightSearch();
};
oFF.AbstractBlendableQueryManager.prototype.getMessageManager = function()
{
	return this.getQueryManagerBase();
};
oFF.AbstractBlendableQueryManager.prototype.isValid = function()
{
	var queryManager = this.getQueryManager();
	var isValid = false;
	if (oFF.notNull(queryManager))
	{
		isValid = queryManager.isValid();
	}
	return isValid;
};
oFF.AbstractBlendableQueryManager.prototype.hasErrors = function()
{
	var queryManager = this.getQueryManager();
	var hasErrors = false;
	if (oFF.notNull(queryManager))
	{
		hasErrors = queryManager.hasErrors();
	}
	return hasErrors;
};
oFF.AbstractBlendableQueryManager.prototype.hasWarnings = function()
{
	var queryManager = this.getQueryManager();
	var hasWarnings = false;
	if (oFF.notNull(queryManager))
	{
		hasWarnings = queryManager.hasWarnings();
	}
	return hasWarnings;
};
oFF.AbstractBlendableQueryManager.prototype.getNumberOfErrors = function()
{
	var queryManager = this.getQueryManager();
	var num = 0;
	if (oFF.notNull(queryManager))
	{
		num = queryManager.getNumberOfErrors();
	}
	return num;
};
oFF.AbstractBlendableQueryManager.prototype.getNumberOfWarnings = function()
{
	var queryManager = this.getQueryManager();
	var num = 0;
	if (oFF.notNull(queryManager))
	{
		num = queryManager.getNumberOfWarnings();
	}
	return num;
};
oFF.AbstractBlendableQueryManager.prototype.hasSeverity = function(severity)
{
	var queryManager = this.getQueryManager();
	var hasSeverity = false;
	if (oFF.notNull(queryManager))
	{
		hasSeverity = queryManager.hasSeverity(severity);
	}
	return hasSeverity;
};
oFF.AbstractBlendableQueryManager.prototype.getNumberOfSeverity = function(severity)
{
	var queryManager = this.getQueryManager();
	var num = 0;
	if (oFF.notNull(queryManager))
	{
		num = queryManager.getNumberOfSeverity(severity);
	}
	return num;
};
oFF.AbstractBlendableQueryManager.prototype.getFirstWithSeverity = function(severity)
{
	var queryManager = this.getQueryManager();
	var msg = null;
	if (oFF.notNull(queryManager))
	{
		msg = queryManager.getFirstWithSeverity(severity);
	}
	return msg;
};
oFF.AbstractBlendableQueryManager.prototype.getErrors = function()
{
	var queryManager = this.getQueryManager();
	var msgs = oFF.XList.create();
	if (oFF.notNull(queryManager))
	{
		msgs = queryManager.getErrors();
	}
	return msgs;
};
oFF.AbstractBlendableQueryManager.prototype.getWarnings = function()
{
	var queryManager = this.getQueryManager();
	var msgs = oFF.XList.create();
	if (oFF.notNull(queryManager))
	{
		msgs = queryManager.getWarnings();
	}
	return msgs;
};
oFF.AbstractBlendableQueryManager.prototype.getInfos = function()
{
	var queryManager = this.getQueryManager();
	var msgs = oFF.XList.create();
	if (oFF.notNull(queryManager))
	{
		msgs = queryManager.getInfos();
	}
	return msgs;
};
oFF.AbstractBlendableQueryManager.prototype.getSemanticalErrors = function()
{
	var queryManager = this.getQueryManager();
	var msgs = oFF.XList.create();
	if (oFF.notNull(queryManager))
	{
		msgs = queryManager.getSemanticalErrors();
	}
	return msgs;
};
oFF.AbstractBlendableQueryManager.prototype.getMessages = function()
{
	var queryManager = this.getQueryManager();
	var msgs = oFF.XList.create();
	if (oFF.notNull(queryManager))
	{
		msgs = queryManager.getMessages();
	}
	return msgs;
};
oFF.AbstractBlendableQueryManager.prototype.containsCode = function(severity, code)
{
	var queryManager = this.getQueryManager();
	var containsCode = false;
	if (oFF.notNull(queryManager))
	{
		containsCode = queryManager.containsCode(severity, code);
	}
	return containsCode;
};
oFF.AbstractBlendableQueryManager.prototype.getMessage = function(severity, code)
{
	var queryManager = this.getQueryManager();
	var msg = null;
	if (oFF.notNull(queryManager))
	{
		msg = queryManager.getMessage(severity, code);
	}
	return msg;
};
oFF.AbstractBlendableQueryManager.prototype.getFirstError = function()
{
	var queryManager = this.getQueryManager();
	var error = null;
	if (oFF.notNull(queryManager))
	{
		error = queryManager.getFirstError();
	}
	return error;
};
oFF.AbstractBlendableQueryManager.prototype.getRootProfileNode = function()
{
	var queryManager = this.getQueryManager();
	var node = null;
	if (oFF.notNull(queryManager))
	{
		node = queryManager.getRootProfileNode();
	}
	return node;
};
oFF.AbstractBlendableQueryManager.prototype.getSummary = function()
{
	var queryManager = this.getQueryManager();
	var summary = null;
	if (oFF.notNull(queryManager))
	{
		summary = queryManager.getSummary();
	}
	return summary;
};
oFF.AbstractBlendableQueryManager.prototype.getClientStatusCode = function()
{
	var queryManager = this.getQueryManager();
	var code = 0;
	if (oFF.notNull(queryManager))
	{
		code = queryManager.getClientStatusCode();
	}
	return code;
};
oFF.AbstractBlendableQueryManager.prototype.getServerStatusCode = function()
{
	var queryManager = this.getQueryManager();
	var code = 0;
	if (oFF.notNull(queryManager))
	{
		code = queryManager.getServerStatusCode();
	}
	return code;
};
oFF.AbstractBlendableQueryManager.prototype.getServerStatusDetails = function()
{
	var queryManager = this.getQueryManager();
	var details = null;
	if (oFF.notNull(queryManager))
	{
		details = queryManager.getServerStatusDetails();
	}
	return details;
};
oFF.AbstractBlendableQueryManager.prototype.getOlapSystemContainer = function()
{
	var queryManager = this.getQueryManager();
	var olapSystemContainer = null;
	if (oFF.notNull(queryManager))
	{
		olapSystemContainer = queryManager.getOlapSystemContainer();
	}
	return olapSystemContainer;
};
oFF.AbstractBlendableQueryManager.prototype.getServiceConfig = function()
{
	var queryManager = this.getQueryManager();
	var serviceConfig = null;
	if (oFF.notNull(queryManager))
	{
		serviceConfig = queryManager.getServiceConfig();
	}
	return serviceConfig;
};
oFF.AbstractBlendableQueryManager.prototype.getQueryServiceConfig = function()
{
	var queryManager = this.getQueryManager();
	var serviceConfig = null;
	if (oFF.notNull(queryManager))
	{
		serviceConfig = queryManager.getQueryServiceConfig();
	}
	return serviceConfig;
};
oFF.AbstractBlendableQueryManager.prototype.getSystemDescription = function()
{
	var queryManager = this.getQueryManager();
	var systemDescription = null;
	if (oFF.notNull(queryManager))
	{
		systemDescription = queryManager.getSystemDescription();
	}
	return systemDescription;
};
oFF.AbstractBlendableQueryManager.prototype.getSystemType = function()
{
	var queryManager = this.getQueryManager();
	var systemType = null;
	if (oFF.notNull(queryManager))
	{
		systemType = queryManager.getSystemType();
	}
	return systemType;
};
oFF.AbstractBlendableQueryManager.prototype.getSystemName = function()
{
	var queryManager = this.getQueryManager();
	var systemName = null;
	if (oFF.notNull(queryManager))
	{
		systemName = queryManager.getSystemName();
	}
	return systemName;
};
oFF.AbstractBlendableQueryManager.prototype.getConnection = function()
{
	return this.getQueryManagerBase().getConnection();
};
oFF.AbstractBlendableQueryManager.prototype.setSystemDescription = function(systemDescription)
{
	this.getQueryManagerBase().setSystemDescription(systemDescription);
};
oFF.AbstractBlendableQueryManager.prototype.processQueryExecution = function(syncType, listener, customIdentifier)
{
	return this.getResultsetContainer(false).processExecution(syncType, listener, customIdentifier);
};
oFF.AbstractBlendableQueryManager.prototype.getResultsetContainer = function(enforceOutOfSync)
{
	if (oFF.isNull(this.m_activeContainer) || this.m_activeContainer.isReleased() || enforceOutOfSync && this.m_activeContainer.getSyncState() !== oFF.SyncState.OUT_OF_SYNC)
	{
		var previousRuntimeQueryManager = null;
		var modCounter = null;
		if (oFF.notNull(this.m_activeContainer) && !this.m_activeContainer.isReleased())
		{
			var activeContainer = this.m_activeContainer;
			var runtimeQueryManager = activeContainer.getRuntimeQueryManager();
			if (oFF.notNull(runtimeQueryManager))
			{
				if (runtimeQueryManager.getInitSettings().getMode() === oFF.QueryManagerMode.BLENDING)
				{
					previousRuntimeQueryManager = runtimeQueryManager;
					previousRuntimeQueryManager.invalidateState();
				}
			}
		}
		var oldContainer = this.m_activeContainer;
		var baseContainer = this.m_activeContainer;
		if (oFF.notNull(baseContainer) && baseContainer.getBlendingProcess() !== null)
		{
			modCounter = baseContainer.getBlendingProcess().getLastModCounterState();
		}
		this.m_activeContainer = oFF.BlendableResultSetContainer.createBlendableResultSetContainer(this, previousRuntimeQueryManager, modCounter);
		if (oFF.notNull(oldContainer))
		{
			oldContainer.setSerializedData(null, null);
		}
	}
	return this.m_activeContainer;
};
oFF.AbstractBlendableQueryManager.prototype.assertLifeCycleActive = function()
{
	if (this.getLifeCycleState() !== oFF.LifeCycleState.ACTIVE && this.getLifeCycleState() !== oFF.LifeCycleState.STARTING_UP)
	{
		throw oFF.XException.createIllegalStateException("Query manager is not active");
	}
};
oFF.AbstractBlendableQueryManager.prototype.getClassicResultSet = function()
{
	this.assertLifeCycleActive();
	return this.getActiveResultSetContainer().getClassicResultSet();
};
oFF.AbstractBlendableQueryManager.prototype.isClassicResultSetAvailable = function()
{
	this.assertLifeCycleActive();
	return this.getActiveResultSetContainer().isClassicResultSetAvailable();
};
oFF.AbstractBlendableQueryManager.prototype.getCursorResultSet = function()
{
	this.assertLifeCycleActive();
	return this.getActiveResultSetContainer().getCursorResultSet();
};
oFF.AbstractBlendableQueryManager.prototype.getAbstractRendering = function(type, protocol)
{
	this.assertLifeCycleActive();
	return this.getActiveResultSetContainer().getAbstractRendering(type, protocol);
};
oFF.AbstractBlendableQueryManager.prototype.isCursorResultSetAvailable = function()
{
	this.assertLifeCycleActive();
	return this.getActiveResultSetContainer().isCursorResultSetAvailable();
};
oFF.AbstractBlendableQueryManager.prototype.setOffsetRows = function(offset)
{
	if (this.getResultsetContainer(false).getOffsetRows() !== offset)
	{
		this.getResultsetContainer(true).setOffsetRows(offset);
	}
	return null;
};
oFF.AbstractBlendableQueryManager.prototype.getOffsetRows = function()
{
	return this.getResultsetContainer(false).getOffsetRows();
};
oFF.AbstractBlendableQueryManager.prototype.setOffsetColumns = function(offset)
{
	if (this.getResultsetContainer(false).getOffsetColumns() !== offset)
	{
		this.getResultsetContainer(true).setOffsetColumns(offset);
	}
	return null;
};
oFF.AbstractBlendableQueryManager.prototype.getOffsetColumns = function()
{
	return this.getResultsetContainer(false).getOffsetColumns();
};
oFF.AbstractBlendableQueryManager.prototype.setSuppressKeyfigureCalculation = function(doSupress)
{
	if (this.getResultsetContainer(false).isKeyfigureCalculationSuppressed() !== doSupress)
	{
		this.getResultsetContainer(true).setSuppressKeyfigureCalculation(doSupress);
	}
	return null;
};
oFF.AbstractBlendableQueryManager.prototype.isKeyfigureCalculationSuppressed = function()
{
	return this.getResultsetContainer(false).isKeyfigureCalculationSuppressed();
};
oFF.AbstractBlendableQueryManager.prototype.setMaxRows = function(max)
{
	if (this.getResultsetContainer(false).getMaxRows() !== max)
	{
		this.getResultsetContainer(true).setMaxRows(max);
	}
	return null;
};
oFF.AbstractBlendableQueryManager.prototype.getMaxRows = function()
{
	return this.getResultsetContainer(false).getMaxRows();
};
oFF.AbstractBlendableQueryManager.prototype.setMaxColumns = function(max)
{
	if (this.getResultsetContainer(false).getMaxColumns() !== max)
	{
		this.getResultsetContainer(true).setMaxColumns(max);
	}
	return null;
};
oFF.AbstractBlendableQueryManager.prototype.getMaxColumns = function()
{
	return this.getResultsetContainer(false).getMaxColumns();
};
oFF.AbstractBlendableQueryManager.prototype.getMaxResultRecords = function()
{
	return this.getResultsetContainer(false).getMaxResultRecords();
};
oFF.AbstractBlendableQueryManager.prototype.setMaxResultRecords = function(maxResultRecords)
{
	if (this.getResultsetContainer(false).getMaxResultRecords() !== maxResultRecords)
	{
		this.getResultsetContainer(true).setMaxResultRecords(maxResultRecords);
	}
	return null;
};
oFF.AbstractBlendableQueryManager.prototype.resetMaxResultRecords = function()
{
	this.getResultsetContainer(true).resetMaxResultRecords();
	return null;
};
oFF.AbstractBlendableQueryManager.prototype.setResultSetPersistanceTargetSchema = function(resultSetPersistenceSchema)
{
	var currentSchema = this.getResultsetContainer(false).getResultSetPersistenceSchema();
	if (!oFF.XString.isEqual(currentSchema, resultSetPersistenceSchema))
	{
		this.getResultsetContainer(true).setResultSetPersistanceTargetSchema(resultSetPersistenceSchema);
	}
	return null;
};
oFF.AbstractBlendableQueryManager.prototype.setResultSetPersistanceTargetTable = function(resultSetPersistenceTable)
{
	var currentTable = this.getResultsetContainer(false).getResultSetPersistenceTable();
	if (!oFF.XString.isEqual(currentTable, resultSetPersistenceTable))
	{
		this.getResultsetContainer(true).setResultSetPersistanceTargetTable(resultSetPersistenceTable);
	}
	return null;
};
oFF.AbstractBlendableQueryManager.prototype.setResultSetPersistenceTargetType = function(resultSetPersistenceType)
{
	var currentType = this.getResultsetContainer(false).getResultSetPersistenceType();
	if (currentType !== resultSetPersistenceType)
	{
		this.getResultsetContainer(true).setResultSetPersistenceTargetType(resultSetPersistenceType);
	}
	return null;
};
oFF.AbstractBlendableQueryManager.prototype.setResultSetPersistenceIdentifier = function(resultSetPersistenceIdentifier)
{
	var currentIdentifier = this.getResultsetContainer(false).getResultSetPersistenceIdentifier();
	if (!oFF.XString.isEqual(currentIdentifier, resultSetPersistenceIdentifier))
	{
		this.getResultsetContainer(true).setResultSetPersistenceIdentifier(resultSetPersistenceIdentifier);
	}
	return null;
};
oFF.AbstractBlendableQueryManager.prototype.getResultSetPersistenceSchema = function()
{
	return this.getResultsetContainer(false).getResultSetPersistenceSchema();
};
oFF.AbstractBlendableQueryManager.prototype.getResultSetPersistenceTable = function()
{
	return this.getResultsetContainer(false).getResultSetPersistenceTable();
};
oFF.AbstractBlendableQueryManager.prototype.getResultSetPersistenceType = function()
{
	return this.getResultsetContainer(false).getResultSetPersistenceType();
};
oFF.AbstractBlendableQueryManager.prototype.getResultSetPersistenceIdentifier = function()
{
	return this.getResultsetContainer(false).getResultSetPersistenceIdentifier();
};
oFF.AbstractBlendableQueryManager.prototype.setExecuteRequestOnOldResultSet = function(executeRequestOnOldResultSet)
{
	if (this.getResultsetContainer(false).getExecuteRequestOnOldResultSet() !== executeRequestOnOldResultSet)
	{
		this.getResultsetContainer(true).setExecuteRequestOnOldResultSet(executeRequestOnOldResultSet);
	}
	return null;
};
oFF.AbstractBlendableQueryManager.prototype.isResultSetTransportEnabled = function()
{
	return this.getResultsetContainer(false).isResultSetTransportEnabled();
};
oFF.AbstractBlendableQueryManager.prototype.setResultSetTransportEnabled = function(isEnabled)
{
	if (this.getResultsetContainer(false).isResultSetTransportEnabled() !== isEnabled)
	{
		this.getResultsetContainer(true).setResultSetTransportEnabled(isEnabled);
	}
	return null;
};
oFF.AbstractBlendableQueryManager.prototype.setDataRefreshEnabled = function(dataRefreshEnabled)
{
	if (this.getResultsetContainer(false).getDataRefreshEnabled() !== dataRefreshEnabled)
	{
		this.getResultsetContainer(true).setDataRefreshEnabled(dataRefreshEnabled);
	}
};
oFF.AbstractBlendableQueryManager.prototype.getDataRefreshEnabled = function()
{
	return this.getResultsetContainer(false).getDataRefreshEnabled();
};
oFF.AbstractBlendableQueryManager.prototype.getExecuteRequestOnOldResultSet = function()
{
	return this.getActiveResultSetContainer().getExecuteRequestOnOldResultSet();
};
oFF.AbstractBlendableQueryManager.prototype.getActiveResultSetContainer = function()
{
	return this.getResultsetContainer(false);
};
oFF.AbstractBlendableQueryManager.prototype.getResultSetSyncState = function()
{
	return this.getActiveResultSetContainer().getResultSetSyncState();
};
oFF.AbstractBlendableQueryManager.prototype.getResultSetMessages = function()
{
	return this.getActiveResultSetContainer();
};
oFF.AbstractBlendableQueryManager.prototype.hasMoreColumnRecordsAvailable = function()
{
	return this.getActiveResultSetContainer().hasMoreColumnRecordsAvailable();
};
oFF.AbstractBlendableQueryManager.prototype.hasMoreRowRecordsAvailable = function()
{
	return this.getActiveResultSetContainer().hasMoreRowRecordsAvailable();
};
oFF.AbstractBlendableQueryManager.prototype.setSuppressCalculatedMembersWithoutBookedData = function(suppressIndicator)
{
	this.getResultsetContainer(true).setSuppressCalculatedMembersWithoutBookedData(suppressIndicator);
};
oFF.AbstractBlendableQueryManager.prototype.getSuppressCalculatedMembersWithoutBookedData = function()
{
	return this.getResultsetContainer(false).getSuppressCalculatedMembersWithoutBookedData();
};
oFF.AbstractBlendableQueryManager.prototype.getActiveResultSetContainerBase = function()
{
	return this.getResultsetContainer(false);
};
oFF.AbstractBlendableQueryManager.prototype.getResultSetProviderFactory = function()
{
	return this.getQueryManagerBase().getResultSetProviderFactory();
};
oFF.AbstractBlendableQueryManager.prototype.setActiveResultSetContainer = function(activeResultSetContainer)
{
	this.m_activeContainer = activeResultSetContainer;
};
oFF.AbstractBlendableQueryManager.prototype.emptyVariableDefinition = oFF.noSupport;
oFF.AbstractBlendableQueryManager.prototype.submitVariables = function(syncType, listener, customIdentifier)
{
	var blendableVariableSubmitProcessor = oFF.BlendableQMVariableSubmitProcessor.createBlendableVariableSubmitProcessor(this);
	return blendableVariableSubmitProcessor.submitVariables(syncType, listener, customIdentifier);
};
oFF.AbstractBlendableQueryManager.prototype.reInitVariablesAfterSubmit = function(syncType, listener, customIdentifier)
{
	var blendableVariableSubmitProcessor = oFF.BlendableQMVariableSubmitProcessor.createBlendableVariableSubmitProcessor(this);
	return blendableVariableSubmitProcessor.reInitVariablesAfterSubmit(syncType, listener, customIdentifier);
};
oFF.AbstractBlendableQueryManager.prototype.activateVariableVariant = function(variableVariant, syncType, listener, customIdentifier)
{
	var blendableVariableSubmitProcessor = oFF.BlendableQMVariableSubmitProcessor.createBlendableVariableSubmitProcessor(this);
	return blendableVariableSubmitProcessor.activateVariableVariant(variableVariant, syncType, listener, customIdentifier);
};
oFF.AbstractBlendableQueryManager.prototype.deleteVariableVariant = oFF.noSupport;
oFF.AbstractBlendableQueryManager.prototype.updateVariableVariantValues = oFF.noSupport;
oFF.AbstractBlendableQueryManager.prototype.saveVariableVariant = oFF.noSupport;
oFF.AbstractBlendableQueryManager.prototype.cancelReInitVariables = function(syncType, listener, customIdentifier)
{
	var blendableVariableSubmitProcessor = oFF.BlendableQMVariableSubmitProcessor.createBlendableVariableSubmitProcessor(this);
	return blendableVariableSubmitProcessor.cancelReInitVariables(syncType, listener, customIdentifier);
};
oFF.AbstractBlendableQueryManager.prototype.supportsMaintainsVariableVariants = function()
{
	return false;
};
oFF.AbstractBlendableQueryManager.prototype.isProcessingAutoSubmit = function()
{
	var isProcessingAutoSubmit = false;
	var allQMIter = this.getAllQueryManagers().getIterator();
	while (allQMIter.hasNext())
	{
		var qm = allQMIter.next();
		if (qm.isProcessingAutoSubmit())
		{
			isProcessingAutoSubmit = true;
			break;
		}
	}
	return isProcessingAutoSubmit;
};
oFF.AbstractBlendableQueryManager.prototype.isSubmitted = function()
{
	var isSubmitted = true;
	var allQMIter = this.getAllQueryManagers().getIterator();
	while (allQMIter.hasNext())
	{
		var qm = allQMIter.next();
		if ((qm.supportsAndAllowsEmptyExtendedVarDefinition() || qm.hasVariables()) && !qm.isSubmitted())
		{
			isSubmitted = false;
			break;
		}
	}
	return isSubmitted;
};
oFF.AbstractBlendableQueryManager.prototype.transferVariables = function(syncType, listener, customIdentifier)
{
	var blendableVariableSubmitProcessor = oFF.BlendableQMVariableSubmitProcessor.createBlendableVariableSubmitProcessor(this);
	return blendableVariableSubmitProcessor.transferVariables(syncType, listener, customIdentifier);
};
oFF.AbstractBlendableQueryManager.prototype.transferVariablesByVariable = function(variable, syncType, listener, customIdentifier)
{
	var blendableVariableSubmitProcessor = oFF.BlendableQMVariableSubmitProcessor.createBlendableVariableSubmitProcessor(this);
	return blendableVariableSubmitProcessor.transferVariablesByVariable(variable, syncType, listener, customIdentifier);
};
oFF.AbstractBlendableQueryManager.prototype.setDirectVariableTransferEnabled = function(directVariableTransfer)
{
	var queryManager = this.getQueryManager();
	if (oFF.notNull(queryManager))
	{
		queryManager.setDirectVariableTransferEnabled(directVariableTransfer);
	}
};
oFF.AbstractBlendableQueryManager.prototype.isDirectVariableTransferEnabled = function()
{
	var queryManager = this.getQueryManager();
	var isDirectVariableTransferEnabled = false;
	if (oFF.notNull(queryManager))
	{
		isDirectVariableTransferEnabled = queryManager.isDirectVariableTransferEnabled();
	}
	return isDirectVariableTransferEnabled;
};
oFF.AbstractBlendableQueryManager.prototype.getVariableProcessorState = function()
{
	var queryManager = this.getQueryManager();
	var variableProcessorState = null;
	if (oFF.notNull(queryManager))
	{
		variableProcessorState = queryManager.getVariableProcessorState();
	}
	return variableProcessorState;
};
oFF.AbstractBlendableQueryManager.prototype.registerVariableProcessorStateChangedListener = function(listener, customIdentifier)
{
	var queryManager = this.getQueryManager();
	if (oFF.notNull(queryManager))
	{
		queryManager.registerVariableProcessorStateChangedListener(listener, customIdentifier);
	}
};
oFF.AbstractBlendableQueryManager.prototype.unregisterVariableProcessorStateChangedListener = function(listener)
{
	var queryManager = this.getQueryManager();
	if (oFF.notNull(queryManager))
	{
		queryManager.unregisterVariableProcessorStateChangedListener(listener);
	}
};
oFF.AbstractBlendableQueryManager.prototype.checkVariables = function(syncType, listener, customIdentifier)
{
	var blendableVariableSubmitProcessor = oFF.BlendableQMVariableSubmitProcessor.createBlendableVariableSubmitProcessor(this);
	return blendableVariableSubmitProcessor.checkVariables(syncType, listener, customIdentifier);
};
oFF.AbstractBlendableQueryManager.prototype.getSelectionTagging = function()
{
	var queryManager = this.getQueryManager();
	var tagging = null;
	if (oFF.notNull(queryManager))
	{
		tagging = queryManager.getSelectionTagging();
	}
	return tagging;
};
oFF.AbstractBlendableQueryManager.prototype.updateDynamicVariables = function(syncType, listener, customIdentifier)
{
	var queryManager = this.getQueryManager();
	if (oFF.notNull(queryManager))
	{
		queryManager.updateDynamicVariables(syncType, listener, customIdentifier);
	}
};
oFF.AbstractBlendableQueryManager.prototype.getVariableVariants = function()
{
	var queryManager = this.getQueryManager();
	var variants = null;
	if (oFF.notNull(queryManager))
	{
		variants = queryManager.getVariableVariants();
	}
	return variants;
};
oFF.AbstractBlendableQueryManager.prototype.resetExitOrUpdateDynamicVariable = function(syncType, listener, customIdentifier, overwriteDefaultForInputEnabledVar)
{
	var queryManager = this.getQueryManager();
	if (oFF.notNull(queryManager))
	{
		queryManager.resetExitOrUpdateDynamicVariable(syncType, listener, customIdentifier, overwriteDefaultForInputEnabledVar);
	}
};
oFF.AbstractBlendableQueryManager.prototype.supportsCheckVariables = function()
{
	var queryManager = this.getQueryManager();
	var supportsCheckVariables = false;
	if (oFF.notNull(queryManager))
	{
		supportsCheckVariables = queryManager.supportsCheckVariables();
	}
	return supportsCheckVariables;
};
oFF.AbstractBlendableQueryManager.prototype.supportsReInitVariables = function()
{
	var queryManager = this.getQueryManager();
	var supportsReInitVariables = false;
	if (oFF.notNull(queryManager))
	{
		supportsReInitVariables = queryManager.supportsReInitVariables();
	}
	return supportsReInitVariables;
};
oFF.AbstractBlendableQueryManager.prototype.supportsDirectVariableTransfer = function()
{
	var queryManager = this.getQueryManager();
	var supportsDirectVariableTransfer = false;
	if (oFF.notNull(queryManager))
	{
		supportsDirectVariableTransfer = queryManager.supportsDirectVariableTransfer();
	}
	return supportsDirectVariableTransfer;
};
oFF.AbstractBlendableQueryManager.prototype.supportsVariableMasking = function()
{
	var queryManager = this.getQueryManager();
	var supportsVariableMasking = false;
	if (oFF.notNull(queryManager))
	{
		supportsVariableMasking = queryManager.supportsVariableMasking();
	}
	return supportsVariableMasking;
};
oFF.AbstractBlendableQueryManager.prototype.clearExternalVariablesRepresentations = function()
{
	var queryManager = this.getQueryManager();
	if (oFF.notNull(queryManager))
	{
		queryManager.clearExternalVariablesRepresentations();
	}
};
oFF.AbstractBlendableQueryManager.prototype.getVariableMode = function()
{
	var queryManager = this.getQueryManager();
	var variableMode = null;
	if (oFF.notNull(queryManager))
	{
		variableMode = queryManager.getVariableMode();
	}
	return variableMode;
};
oFF.AbstractBlendableQueryManager.prototype.hasVariables = function()
{
	var queryManager = this.getQueryManager();
	var hasVariables = false;
	if (oFF.notNull(queryManager))
	{
		hasVariables = queryManager.hasVariables();
	}
	return hasVariables;
};
oFF.AbstractBlendableQueryManager.prototype.hasMandatoryVariables = function()
{
	var queryManager = this.getQueryManager();
	var hasMandatoryVariables = false;
	if (oFF.notNull(queryManager))
	{
		hasMandatoryVariables = queryManager.hasMandatoryVariables();
	}
	return hasMandatoryVariables;
};
oFF.AbstractBlendableQueryManager.prototype.hasInputEnabledVariables = function()
{
	var queryManager = this.getQueryManager();
	var hasInputEnabledVariables = false;
	if (oFF.notNull(queryManager))
	{
		hasInputEnabledVariables = queryManager.hasInputEnabledVariables();
	}
	return hasInputEnabledVariables;
};
oFF.AbstractBlendableQueryManager.prototype.hasInputEnabledAndNonTechnicalVariables = function()
{
	return oFF.XCollectionUtils.hasElements(this.getInputEnabledAndNonTechnicalVariables());
};
oFF.AbstractBlendableQueryManager.prototype.getVariables = function()
{
	var queryManager = this.getQueryManager();
	var variables = oFF.XListOfNameObject.create();
	if (oFF.notNull(queryManager))
	{
		variables = queryManager.getVariables();
	}
	return variables;
};
oFF.AbstractBlendableQueryManager.prototype.setWinControlInAutoSubmitByType = function(variableType, isWinControlInAutoSubmit, isLimitToExitVariable)
{
	var queryManager = this.getQueryManager();
	if (oFF.notNull(queryManager))
	{
		queryManager.setWinControlInAutoSubmitByType(variableType, isWinControlInAutoSubmit, isLimitToExitVariable);
	}
};
oFF.AbstractBlendableQueryManager.prototype.getInputEnabledVariables = function()
{
	var queryManager = this.getQueryManager();
	var variables = oFF.XListOfNameObject.create();
	if (oFF.notNull(queryManager))
	{
		variables = queryManager.getInputEnabledVariables();
	}
	return variables;
};
oFF.AbstractBlendableQueryManager.prototype.getInputEnabledAndNonTechnicalVariables = function()
{
	var queryManager = this.getQueryManager();
	var variables = oFF.XListOfNameObject.create();
	if (oFF.notNull(queryManager))
	{
		variables = queryManager.getInputEnabledAndNonTechnicalVariables();
	}
	return variables;
};
oFF.AbstractBlendableQueryManager.prototype.getInputEnabledVariable = function(name)
{
	var queryManager = this.getQueryManager();
	var variable = null;
	if (oFF.notNull(queryManager))
	{
		variable = queryManager.getInputEnabledVariable(name);
	}
	return variable;
};
oFF.AbstractBlendableQueryManager.prototype.getVariable = function(name)
{
	var queryManager = this.getQueryManager();
	var variable = null;
	if (oFF.notNull(queryManager))
	{
		variable = queryManager.getVariable(name);
	}
	return variable;
};
oFF.AbstractBlendableQueryManager.prototype.getHierarchyNodeVariable = function(name)
{
	var queryManager = this.getQueryManager();
	var variable = null;
	if (oFF.notNull(queryManager))
	{
		variable = queryManager.getHierarchyNodeVariable(name);
	}
	return variable;
};
oFF.AbstractBlendableQueryManager.prototype.getHierarchyNameVariable = function(name)
{
	var queryManager = this.getQueryManager();
	var variable = null;
	if (oFF.notNull(queryManager))
	{
		variable = queryManager.getHierarchyNameVariable(name);
	}
	return variable;
};
oFF.AbstractBlendableQueryManager.prototype.getHierarchyNameVariables = function()
{
	var queryManager = this.getQueryManager();
	var variables = oFF.XList.create();
	if (oFF.notNull(queryManager))
	{
		variables = queryManager.getHierarchyNameVariables();
	}
	return variables;
};
oFF.AbstractBlendableQueryManager.prototype.getDimensionMemberVariables = function()
{
	var queryManager = this.getQueryManager();
	var variables = oFF.XList.create();
	if (oFF.notNull(queryManager))
	{
		variables = queryManager.getDimensionMemberVariables();
	}
	return variables;
};
oFF.AbstractBlendableQueryManager.prototype.isSubmitNeeded = function()
{
	var isSubmitNeeded = false;
	var allQMIter = this.getAllQueryManagers().getIterator();
	while (allQMIter.hasNext())
	{
		var qm = allQMIter.next();
		isSubmitNeeded = qm.isSubmitNeeded();
		if (isSubmitNeeded)
		{
			break;
		}
	}
	return isSubmitNeeded;
};
oFF.AbstractBlendableQueryManager.prototype.isReinitNeeded = function()
{
	var isReinitNeeded = false;
	var allQMIter = this.getAllQueryManagers().getIterator();
	while (allQMIter.hasNext())
	{
		var qm = allQMIter.next();
		isReinitNeeded = qm.isReinitNeeded();
		if (isReinitNeeded)
		{
			break;
		}
	}
	return isReinitNeeded;
};
oFF.AbstractBlendableQueryManager.prototype.isExecuteAutoVariableSubmit = function()
{
	return this.getQueryManagerBase().isExecuteAutoVariableSubmit();
};
oFF.AbstractBlendableQueryManager.prototype.maintainStateForRsWithAutoSubmit = function(resultSetContainer)
{
	this.getQueryManagerBase().maintainStateForRsWithAutoSubmit(resultSetContainer);
};
oFF.AbstractBlendableQueryManager.prototype.variablesRequireImplicitSubmit = function()
{
	return this.getQueryManagerBase().variablesRequireImplicitSubmit();
};
oFF.AbstractBlendableQueryManager.prototype.variablesRequireImplicitSubmitForValueHelp = function(valueHelpDimension)
{
	return this.getQueryManagerBase().variablesRequireImplicitSubmitForValueHelp(valueHelpDimension);
};
oFF.AbstractBlendableQueryManager.prototype.variablesRequireSACImplicitSubmit = function()
{
	return this.getQueryManager().variablesRequireSACImplicitSubmit();
};
oFF.AbstractBlendableQueryManager.prototype.isCancelNeeded = function()
{
	var isCancelNeeded = false;
	var allQMIter = this.getAllQueryManagers().getIterator();
	while (allQMIter.hasNext())
	{
		var qm = allQMIter.next();
		isCancelNeeded = qm.isCancelNeeded();
		if (isCancelNeeded)
		{
			break;
		}
	}
	return isCancelNeeded;
};
oFF.AbstractBlendableQueryManager.prototype.getVariableProcessor = function()
{
	var queryManager = this.getQueryManager();
	var variableProcessor = null;
	if (oFF.notNull(queryManager))
	{
		variableProcessor = queryManager.getVariableProcessor();
	}
	return variableProcessor;
};
oFF.AbstractBlendableQueryManager.prototype.addVariableVariant = function(variant)
{
	this.getQueryManagerBase().addVariableVariant(variant);
};
oFF.AbstractBlendableQueryManager.prototype.removeVariableVariant = function(variant)
{
	this.getQueryManagerBase().removeVariableVariant(variant);
};
oFF.AbstractBlendableQueryManager.prototype.clearVariableVariants = function()
{
	this.getQueryManagerBase().clearVariableVariants();
};
oFF.AbstractBlendableQueryManager.prototype.setVariableProcessorState = function(variableProcessorState)
{
	this.getQueryManagerBase().setVariableProcessorState(variableProcessorState);
};
oFF.AbstractBlendableQueryManager.prototype.returnToPreviousProcessorState = function()
{
	this.getQueryManagerBase().returnToPreviousProcessorState();
};
oFF.AbstractBlendableQueryManager.prototype.getVariableContainerBase = function()
{
	return this.getQueryManagerBase().getVariableContainerBase();
};
oFF.AbstractBlendableQueryManager.prototype.prepareAfterVariables = function()
{
	this.getQueryManagerBase().prepareAfterVariables();
};
oFF.AbstractBlendableQueryManager.prototype.getPreviousVariableProcessorState = function()
{
	return this.getQueryManagerBase().getPreviousVariableProcessorState();
};
oFF.AbstractBlendableQueryManager.prototype.setPreviousVariableProcessorState = function(variableProcessorPreviousState)
{
	this.getQueryManagerBase().setPreviousVariableProcessorState(variableProcessorPreviousState);
};
oFF.AbstractBlendableQueryManager.prototype.isPublicVersionEditPossible = function()
{
	var queryManager = this.getQueryManager();
	var isPublicVersionEditPossible = false;
	if (oFF.notNull(queryManager))
	{
		isPublicVersionEditPossible = queryManager.isPublicVersionEditPossible();
	}
	return isPublicVersionEditPossible;
};
oFF.AbstractBlendableQueryManager.prototype.hasChangedValues = function()
{
	var queryManager = this.getQueryManager();
	var hasChangedValues = false;
	if (oFF.notNull(queryManager))
	{
		hasChangedValues = queryManager.hasChangedValues();
	}
	return hasChangedValues;
};
oFF.AbstractBlendableQueryManager.prototype.hasChangedValueLocks = function()
{
	var queryManager = this.getQueryManager();
	var hasChangedValueLocks = false;
	if (oFF.notNull(queryManager))
	{
		hasChangedValueLocks = queryManager.hasChangedValueLocks();
	}
	return hasChangedValueLocks;
};
oFF.AbstractBlendableQueryManager.prototype.hasChangedCells = function()
{
	var queryManager = this.getQueryManager();
	var hasChangedCells = false;
	if (oFF.notNull(queryManager))
	{
		hasChangedCells = queryManager.hasChangedCells();
	}
	return hasChangedCells;
};
oFF.AbstractBlendableQueryManager.prototype.transferNewValues = function()
{
	var queryManager = this.getQueryManager();
	if (oFF.notNull(queryManager))
	{
		queryManager.transferNewValues();
	}
};
oFF.AbstractBlendableQueryManager.prototype.resetNewValues = function()
{
	var queryManager = this.getQueryManager();
	if (oFF.notNull(queryManager))
	{
		queryManager.resetNewValues();
	}
};
oFF.AbstractBlendableQueryManager.prototype.hasNewValues = function()
{
	var queryManager = this.getQueryManager();
	var hasNewValues = false;
	if (oFF.notNull(queryManager))
	{
		hasNewValues = queryManager.hasNewValues();
	}
	return hasNewValues;
};
oFF.AbstractBlendableQueryManager.prototype.setDataEntryReadOnly = function(dataEntryReadOnly)
{
	var queryManager = this.getQueryManager();
	if (oFF.notNull(queryManager))
	{
		queryManager.setDataEntryReadOnly(dataEntryReadOnly);
	}
};
oFF.AbstractBlendableQueryManager.prototype.isDataEntryReadOnly = function()
{
	var queryManager = this.getQueryManager();
	var isDataEntryReadOnly = false;
	if (oFF.notNull(queryManager))
	{
		isDataEntryReadOnly = queryManager.isDataEntryReadOnly();
	}
	return isDataEntryReadOnly;
};
oFF.AbstractBlendableQueryManager.prototype.isDataEntryEnabled = function()
{
	var queryManager = this.getQueryManager();
	var isDataEntryEnabled = false;
	if (oFF.notNull(queryManager))
	{
		isDataEntryEnabled = queryManager.isDataEntryEnabled();
	}
	return isDataEntryEnabled;
};
oFF.AbstractBlendableQueryManager.prototype.getPlanningModel = function()
{
	var queryManager = this.getQueryManager();
	var planningModel = null;
	if (oFF.notNull(queryManager))
	{
		planningModel = queryManager.getPlanningModel();
	}
	return planningModel;
};
oFF.AbstractBlendableQueryManager.prototype.getDataArea = function()
{
	var queryManager = this.getQueryManager();
	var dataArea = null;
	if (oFF.notNull(queryManager))
	{
		dataArea = queryManager.getDataArea();
	}
	return dataArea;
};
oFF.AbstractBlendableQueryManager.prototype.createDataAreaCommand = function(commandType)
{
	var queryManager = this.getQueryManager();
	var command = null;
	if (oFF.notNull(queryManager))
	{
		command = queryManager.createDataAreaCommand(commandType);
	}
	return command;
};
oFF.AbstractBlendableQueryManager.prototype.createDataAreaCommandRefresh = function()
{
	return this.createDataAreaCommand(oFF.PlanningContextCommandType.REFRESH);
};
oFF.AbstractBlendableQueryManager.prototype.createDataAreaCommandDocSave = function()
{
	return this.createDataAreaCommand(oFF.PlanningContextCommandType.DOC_SAVE);
};
oFF.AbstractBlendableQueryManager.prototype.createDataAreaCommandDocReset = function()
{
	return this.createDataAreaCommand(oFF.PlanningContextCommandType.DOC_RESET);
};
oFF.AbstractBlendableQueryManager.prototype.getPlanningMode = function()
{
	var queryManager = this.getQueryManager();
	var planningMode = null;
	if (oFF.notNull(queryManager))
	{
		planningMode = queryManager.getPlanningMode();
	}
	return planningMode;
};
oFF.AbstractBlendableQueryManager.prototype.setPlanningMode = function(planningMode)
{
	var queryManager = this.getQueryManager();
	if (oFF.notNull(queryManager))
	{
		queryManager.setPlanningMode(planningMode);
	}
};
oFF.AbstractBlendableQueryManager.prototype.getPlanningRestriction = function()
{
	var queryManager = this.getQueryManager();
	var planningRestriction = null;
	if (oFF.notNull(queryManager))
	{
		planningRestriction = queryManager.getPlanningRestriction();
	}
	return planningRestriction;
};
oFF.AbstractBlendableQueryManager.prototype.setPlanningRestriction = function(restrictionType)
{
	var queryManager = this.getQueryManager();
	if (oFF.notNull(queryManager))
	{
		queryManager.setPlanningRestriction(restrictionType);
	}
};
oFF.AbstractBlendableQueryManager.prototype.supportsDataEntryReadOnly = function()
{
	var queryManager = this.getQueryManager();
	var supportsDataEntryReadOnly = false;
	if (oFF.notNull(queryManager))
	{
		supportsDataEntryReadOnly = queryManager.supportsDataEntryReadOnly();
	}
	return supportsDataEntryReadOnly;
};
oFF.AbstractBlendableQueryManager.prototype.getPlanningVersionIdentifier = function(versionId, sharedVersion, versionOwner)
{
	var queryManager = this.getQueryManager();
	var planningVersionIdentifier = null;
	if (oFF.notNull(queryManager))
	{
		planningVersionIdentifier = queryManager.getPlanningVersionIdentifier(versionId, sharedVersion, versionOwner);
	}
	return planningVersionIdentifier;
};
oFF.AbstractBlendableQueryManager.prototype.getPlanningVersionSettings = function(versionIdentifier, sequenceId, useExternalView)
{
	var queryManager = this.getQueryManager();
	var settings = null;
	if (oFF.notNull(queryManager))
	{
		settings = queryManager.getPlanningVersionSettings(versionIdentifier, sequenceId, useExternalView);
	}
	return settings;
};
oFF.AbstractBlendableQueryManager.prototype.getPlanningVersionSettingsSimple = function(versionId, sequenceId, useExternalView)
{
	var queryManager = this.getQueryManager();
	var settings = null;
	if (oFF.notNull(queryManager))
	{
		settings = queryManager.getPlanningVersionSettingsSimple(versionId, sequenceId, useExternalView);
	}
	return settings;
};
oFF.AbstractBlendableQueryManager.prototype.addPlanningVersionSettings = function(sequenceSettings)
{
	var queryManager = this.getQueryManager();
	var settings = null;
	if (oFF.notNull(queryManager))
	{
		settings = queryManager.addPlanningVersionSettings(sequenceSettings);
	}
	return settings;
};
oFF.AbstractBlendableQueryManager.prototype.deletePlanningVersionSettings = function(versionIdentifier)
{
	var queryManager = this.getQueryManager();
	var settings = null;
	if (oFF.notNull(queryManager))
	{
		settings = queryManager.deletePlanningVersionSettings(versionIdentifier);
	}
	return settings;
};
oFF.AbstractBlendableQueryManager.prototype.getAllPlanningVersionSettings = function()
{
	var queryManager = this.getQueryManager();
	var settings = null;
	if (oFF.notNull(queryManager))
	{
		settings = queryManager.getAllPlanningVersionSettings();
	}
	return settings;
};
oFF.AbstractBlendableQueryManager.prototype.setPlanningVersionSettingsMode = function(settingsMode)
{
	var queryManager = this.getQueryManager();
	if (oFF.notNull(queryManager))
	{
		queryManager.setPlanningVersionSettingsMode(settingsMode);
	}
};
oFF.AbstractBlendableQueryManager.prototype.getPlanningVersionSettingsMode = function()
{
	var queryManager = this.getQueryManager();
	var settingsMode = null;
	if (oFF.notNull(queryManager))
	{
		settingsMode = queryManager.getPlanningVersionSettingsMode();
	}
	return settingsMode;
};
oFF.AbstractBlendableQueryManager.prototype.setDataEntryEnabled = function(dataEntryEnabled)
{
	var queryManager = this.getQueryManager();
	if (oFF.notNull(queryManager))
	{
		queryManager.setDataEntryEnabled(dataEntryEnabled);
	}
};
oFF.AbstractBlendableQueryManager.prototype.initializeDataAreaState = function()
{
	var queryManager = this.getQueryManager();
	var initializeDataAreaState = null;
	if (oFF.notNull(queryManager))
	{
		initializeDataAreaState = queryManager.initializeDataAreaState();
	}
	return initializeDataAreaState;
};
oFF.AbstractBlendableQueryManager.prototype.setPublicVersionEditPossible = function(publicVersionEdit)
{
	var queryManager = this.getQueryManager();
	if (oFF.notNull(queryManager))
	{
		queryManager.setPublicVersionEditPossible(publicVersionEdit);
	}
};
oFF.AbstractBlendableQueryManager.prototype.setVersionAliasById = function(aliasName, versionId)
{
	var queryManager = this.getQueryManager();
	if (oFF.notNull(queryManager))
	{
		queryManager.setVersionAliasById(aliasName, versionId);
	}
};
oFF.AbstractBlendableQueryManager.prototype.removeVersionAlias = function(aliasName)
{
	var queryManager = this.getQueryManager();
	if (oFF.notNull(queryManager))
	{
		queryManager.removeVersionAlias(aliasName);
	}
};
oFF.AbstractBlendableQueryManager.prototype.clearVersionAliases = function()
{
	var queryManager = this.getQueryManager();
	if (oFF.notNull(queryManager))
	{
		queryManager.clearVersionAliases();
	}
};
oFF.AbstractBlendableQueryManager.prototype.getVersionAliases = function()
{
	var queryManager = this.getQueryManager();
	var versionAliases = oFF.XHashMapOfStringByString.create();
	if (oFF.notNull(queryManager))
	{
		versionAliases = queryManager.getVersionAliases();
	}
	return versionAliases;
};
oFF.AbstractBlendableQueryManager.prototype.attachQueryExecutedListener = function(listener, customIdentifier)
{
	var queryManager = this.getQueryManager();
	if (oFF.notNull(queryManager))
	{
		queryManager.attachQueryExecutedListener(listener, customIdentifier);
	}
};
oFF.AbstractBlendableQueryManager.prototype.detachQueryExecutedListener = function(listener)
{
	var queryManager = this.getQueryManager();
	if (oFF.notNull(queryManager))
	{
		queryManager.detachQueryExecutedListener(listener);
	}
};
oFF.AbstractBlendableQueryManager.prototype.attachBeforeQueryExecutionListener = function(listener, customIdentifier)
{
	var queryManager = this.getQueryManager();
	if (oFF.notNull(queryManager))
	{
		queryManager.attachBeforeQueryExecutionListener(listener, customIdentifier);
	}
};
oFF.AbstractBlendableQueryManager.prototype.detachBeforeQueryExecutionListener = function(listener)
{
	var queryManager = this.getQueryManager();
	if (oFF.notNull(queryManager))
	{
		queryManager.detachBeforeQueryExecutionListener(listener);
	}
};
oFF.AbstractBlendableQueryManager.prototype.invalidateVisualizationContainers = function()
{
	var queryManager = this.getQueryManagerBase();
	if (oFF.notNull(queryManager))
	{
		queryManager.invalidateVisualizationContainers();
	}
};
oFF.AbstractBlendableQueryManager.prototype.getOrCreateDocumentsStoreService = function(withVersions)
{
	var queryManager = this.getQueryManagerBase();
	var service = null;
	if (oFF.notNull(queryManager))
	{
		service = queryManager.getOrCreateDocumentsStoreService(withVersions);
	}
	return service;
};

oFF.QCustomHierarchyDefinitionExt = function() {};
oFF.QCustomHierarchyDefinitionExt.prototype = new oFF.QCustomHierarchyDefinition();
oFF.QCustomHierarchyDefinitionExt.prototype._ff_c = "QCustomHierarchyDefinitionExt";

oFF.QCustomHierarchyDefinitionExt.createExtendedHierarchyDefinition = function(origin, inaHierarchy)
{
	var definitionResponse = new oFF.QCustomHierarchyDefinitionExt();
	definitionResponse.setupHierarchyDefinition(null, null, null, null, true);
	definitionResponse.copyFrom(origin, null);
	definitionResponse.m_inaHierarchy = inaHierarchy;
	return definitionResponse;
};
oFF.QCustomHierarchyDefinitionExt.prototype.m_inaHierarchy = null;
oFF.QCustomHierarchyDefinitionExt.prototype.releaseObject = function()
{
	oFF.QCustomHierarchyDefinition.prototype.releaseObject.call( this );
	this.m_inaHierarchy = oFF.XObjectExt.release(this.m_inaHierarchy);
};
oFF.QCustomHierarchyDefinitionExt.prototype.getInaHierarchy = function()
{
	return this.m_inaHierarchy;
};
oFF.QCustomHierarchyDefinitionExt.prototype.setInaHierarchy = function(inaHierarchy)
{
	this.m_inaHierarchy = inaHierarchy;
};

oFF.BlendableQueryManager = function() {};
oFF.BlendableQueryManager.prototype = new oFF.AbstractBlendableQueryManager();
oFF.BlendableQueryManager.prototype._ff_c = "BlendableQueryManager";

oFF.BlendableQueryManager.create = function(context, name)
{
	var blendingManager = new oFF.BlendableQueryManager();
	blendingManager.setupModelComponent(context, null);
	blendingManager.setName(oFF.notNull(name) ? name : context.getApplication().createNextInstanceId());
	blendingManager.setupBlendingManager(context);
	return blendingManager;
};
oFF.BlendableQueryManager.prototype.m_primaryBlendedMeasures = null;
oFF.BlendableQueryManager.prototype.m_queryModelLinkSettings = null;
oFF.BlendableQueryManager.prototype.m_sortContainer = null;
oFF.BlendableQueryManager.prototype.m_blendedDimensionOrder = null;
oFF.BlendableQueryManager.prototype.m_blendedDrillOperations = null;
oFF.BlendableQueryManager.prototype.m_useEmptyAllMemberMeasureFilter = false;
oFF.BlendableQueryManager.prototype.m_rankSettings = null;
oFF.BlendableQueryManager.prototype.m_modCounterState = null;
oFF.BlendableQueryManager.prototype.m_formulaExceptions = null;
oFF.BlendableQueryManager.prototype.m_blendingRestrictionsEnabled = false;
oFF.BlendableQueryManager.prototype.setName = function(name)
{
	oFF.XStringUtils.checkStringNotEmpty(name, "Name of query manager must be a valid string");
	var olapEnvironmentBase = this.getOlapEnv();
	if (!oFF.XString.isEqual(name, this.getName()))
	{
		if (olapEnvironmentBase.containsQueryManagerWithName(name))
		{
			throw oFF.XException.createIllegalArgumentException(oFF.XStringUtils.concatenate2("Olap Environment already contains Query Manager with name:", name));
		}
		olapEnvironmentBase.unregisterQueryManager(this);
		oFF.AbstractBlendableQueryManager.prototype.setName.call( this , name);
		olapEnvironmentBase.registerQueryManager(this);
	}
};
oFF.BlendableQueryManager.prototype.newBlendableQueryManager = function()
{
	return new oFF.BlendableQueryManager();
};
oFF.BlendableQueryManager.prototype.setupBlendingManager = function(context)
{
	oFF.AbstractBlendableQueryManager.prototype.setupBlendingManager.call( this , context);
	this.m_primaryBlendedMeasures = oFF.QModelComponentList.createModelComponentWithNameList(context, this, false, "Primary Blended Measures", true);
	this.m_queryModelLinkSettings = oFF.QModelComponentList.createModelComponentList(context, this, true, "Query Model Link Settings");
	this.m_blendedDimensionOrder = oFF.XHashMapByString.create();
	this.m_blendedDrillOperations = oFF.QModelComponentList.createModelComponentList(context, this, true, "Blendable Drill Operation");
	this.m_useEmptyAllMemberMeasureFilter = false;
	this.m_rankSettings = oFF.QModelComponentList.createModelComponentList(context, this, true, "Rank Settings");
	this.m_sortContainer = oFF.QBlendingSortContainer.create(this);
	this.m_formulaExceptions = oFF.QModelComponentList.createModelComponentWithNameList(context, this, false, "Thresholds", true);
	this.m_blendingRestrictionsEnabled = false;
};
oFF.BlendableQueryManager.prototype.copyFromInternal = function(other, flags)
{
	var origin = other;
	this.m_primaryBlendedMeasures.clear();
	var primaryBlendedMeasuresIter = origin.m_primaryBlendedMeasures.getIterator();
	while (primaryBlendedMeasuresIter.hasNext())
	{
		this.m_primaryBlendedMeasures.add(primaryBlendedMeasuresIter.next());
	}
	this.m_queryModelLinkSettings.clear();
	var queryModelLinkSettingsIterator = origin.m_queryModelLinkSettings.getIterator();
	while (queryModelLinkSettingsIterator.hasNext())
	{
		var queryModelLinkSettings = queryModelLinkSettingsIterator.next();
		this.m_queryModelLinkSettings.add(queryModelLinkSettings.cloneOlapComponent(this, null));
	}
	this.m_sortContainer.copyFrom(origin.m_sortContainer, null);
	this.m_blendedDimensionOrder.clear();
	var blendedDimensionOrderRowsIter = origin.getBlendedDimensionsByAxis(oFF.AxisType.ROWS).getIterator();
	while (blendedDimensionOrderRowsIter.hasNext())
	{
		var blendedDimensionOrderRow = blendedDimensionOrderRowsIter.next();
		var newBlendedDimensionInfoRow = this.addBlendedDimensionInfoToAxis(oFF.AxisType.ROWS, blendedDimensionOrderRow.getDatasetId(), blendedDimensionOrderRow.getDimensionName());
		newBlendedDimensionInfoRow.copyFrom(blendedDimensionOrderRow, null);
	}
	var blendedDimensionOrderColumnsIter = origin.getBlendedDimensionsByAxis(oFF.AxisType.COLUMNS).getIterator();
	while (blendedDimensionOrderColumnsIter.hasNext())
	{
		var blendedDimensionOrderColumn = blendedDimensionOrderColumnsIter.next();
		var newBlendedDimensionOrderColumn = this.addBlendedDimensionInfoToAxis(oFF.AxisType.COLUMNS, blendedDimensionOrderColumn.getDatasetId(), blendedDimensionOrderColumn.getDimensionName());
		newBlendedDimensionOrderColumn.copyFrom(blendedDimensionOrderColumn, null);
	}
	this.m_blendedDrillOperations.clear();
	var blendedDrillInfosIter = origin.getBlendedDrillOperations().getIterator();
	while (blendedDrillInfosIter.hasNext())
	{
		var blendedDrillInfo = blendedDrillInfosIter.next();
		var newBlendedDrillInfo = this.addNewBlendedDrillOperation(blendedDrillInfo.getDatasetId(), blendedDrillInfo.getDimensionName());
		newBlendedDrillInfo.copyFrom(blendedDrillInfo, null);
	}
	this.m_useEmptyAllMemberMeasureFilter = origin.m_useEmptyAllMemberMeasureFilter;
	this.m_rankSettings.clear();
	var rankSettingsIter = origin.getRankSettings().getIterator();
	while (rankSettingsIter.hasNext())
	{
		var rankSettings = oFF.QFactory.createRankSettings();
		rankSettings.copyFrom(rankSettingsIter.next(), null);
		this.m_rankSettings.add(rankSettings);
	}
	this.m_formulaExceptions.clear();
	var formulaExceptionsIter = origin.m_formulaExceptions.getIterator();
	while (formulaExceptionsIter.hasNext())
	{
		this.m_formulaExceptions.add(formulaExceptionsIter.next());
	}
	this.m_blendingRestrictionsEnabled = origin.m_blendingRestrictionsEnabled;
};
oFF.BlendableQueryManager.prototype.releaseObject = function()
{
	var olapEnvironmentBase = this.getOlapEnv();
	olapEnvironmentBase.unregisterQueryManager(this);
	this.m_primaryBlendedMeasures = oFF.XObjectExt.release(this.m_primaryBlendedMeasures);
	this.m_queryModelLinkSettings = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_queryModelLinkSettings);
	this.m_blendedDimensionOrder = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_blendedDimensionOrder);
	this.m_sortContainer = oFF.XObjectExt.release(this.m_sortContainer);
	this.m_blendedDrillOperations = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_blendedDrillOperations);
	this.m_modCounterState = oFF.XObjectExt.release(this.m_modCounterState);
	this.m_formulaExceptions = oFF.XObjectExt.release(this.m_formulaExceptions);
	oFF.AbstractBlendableQueryManager.prototype.releaseObject.call( this );
};
oFF.BlendableQueryManager.prototype.clearPrimaryBlendedMeasures = function()
{
	for (var i = this.m_primaryBlendedMeasures.size() - 1; i >= 0; i--)
	{
		this.removePrimaryBlendedMeasure(this.m_primaryBlendedMeasures.get(i));
	}
};
oFF.BlendableQueryManager.prototype.clearQueryModelLinkSettings = function()
{
	oFF.XCollectionUtils.releaseEntriesFromCollection(this.m_queryModelLinkSettings);
	this.m_queryModelLinkSettings.clear();
};
oFF.BlendableQueryManager.prototype.addSecondaryQueryManager = function(queryManager)
{
	oFF.AbstractBlendableQueryManager.prototype.addSecondaryQueryManager.call( this , queryManager);
	var primaryDatasetId = this.getPrimaryQueryManager().getQueryModel().getDatasetId();
	var secondaryDatasetId = queryManager.getQueryModel().getDatasetId();
	this.addNewQueryModelLinkSettings(primaryDatasetId, secondaryDatasetId);
};
oFF.BlendableQueryManager.prototype.removeSecondaryQueryManager = function(datasetId)
{
	var queryModelLinkSettings = this.m_queryModelLinkSettings.getByKey(datasetId);
	if (oFF.notNull(queryModelLinkSettings))
	{
		this.m_queryModelLinkSettings.removeElement(queryModelLinkSettings);
	}
	var removedQueryManager = this.m_queryManagers.remove(datasetId);
	oFF.XObjectExt.release(removedQueryManager);
};
oFF.BlendableQueryManager.prototype.addNewQueryModelLinkSettings = function(primaryDatasetId, secondaryDatasetId)
{
	var queryModelLinkSettings = oFF.QueryModelLinkSettings.create(this, primaryDatasetId, secondaryDatasetId);
	this.m_queryModelLinkSettings.add(queryModelLinkSettings);
};
oFF.BlendableQueryManager.prototype.getLinkType = function(secondaryDatasetId)
{
	var blendingLinkType = null;
	var queryModelLinkSettings = this.m_queryModelLinkSettings.getByKey(secondaryDatasetId);
	if (oFF.notNull(queryModelLinkSettings))
	{
		blendingLinkType = queryModelLinkSettings.getLinkType();
	}
	return blendingLinkType;
};
oFF.BlendableQueryManager.prototype.setLinkType = function(secondaryDatasetId, blendingLinkType)
{
	var queryModelLinkSettings = this.getQueryModelLinkSettings(secondaryDatasetId);
	queryModelLinkSettings.setLinkType(blendingLinkType);
};
oFF.BlendableQueryManager.prototype.getUnlinkedDimensionJoinType = function(secondaryDatasetId)
{
	var unlinkedDimensionJoinType = null;
	var queryModelLinkSettings = this.m_queryModelLinkSettings.getByKey(secondaryDatasetId);
	if (oFF.notNull(queryModelLinkSettings))
	{
		unlinkedDimensionJoinType = queryModelLinkSettings.getUnlinkedDimensionJoinType();
	}
	return unlinkedDimensionJoinType;
};
oFF.BlendableQueryManager.prototype.setUnlinkedDimensionJoinType = function(secondaryDatasetId, unlinkedDimensionJoinType)
{
	var queryModelLinkSettings = this.getQueryModelLinkSettings(secondaryDatasetId);
	queryModelLinkSettings.setUnlinkedDimensionJoinType(unlinkedDimensionJoinType);
};
oFF.BlendableQueryManager.prototype.getActivePrimaryLinkDimensionNames = function(secondaryDatasetId)
{
	var activePrimaryLinkedDimensionNames = null;
	var queryModelLinkSettings = this.m_queryModelLinkSettings.getByKey(secondaryDatasetId);
	if (oFF.notNull(queryModelLinkSettings))
	{
		activePrimaryLinkedDimensionNames = queryModelLinkSettings.getActivePrimaryLinkDimensionNames();
	}
	return activePrimaryLinkedDimensionNames;
};
oFF.BlendableQueryManager.prototype.addActivePrimaryLinkDimensionName = function(secondaryDatasetId, primaryDimensionLinkName)
{
	var queryModelLinkSettings = this.getQueryModelLinkSettings(secondaryDatasetId);
	queryModelLinkSettings.addActivePrimaryLinkDimensionName(primaryDimensionLinkName);
};
oFF.BlendableQueryManager.prototype.removeActivePrimaryLinkDimensionName = function(secondaryDatasetId, primaryDimensionLinkName)
{
	var queryModelLinkSettings = this.getQueryModelLinkSettings(secondaryDatasetId);
	queryModelLinkSettings.removeActivePrimaryLinkDimensionName(primaryDimensionLinkName);
};
oFF.BlendableQueryManager.prototype.removeAllActivePrimaryLinkDimensionNames = function(secondaryDatasetId)
{
	var queryModelLinkSettings = this.getQueryModelLinkSettings(secondaryDatasetId);
	queryModelLinkSettings.removeAllActivePrimaryLinkDimensionNames();
};
oFF.BlendableQueryManager.prototype.getQueryModelLinkSettings = function(secondaryDatasetId)
{
	var queryModelLinkSettings = this.m_queryModelLinkSettings.getByKey(secondaryDatasetId);
	if (this.getQueryManagerByDatasetId(secondaryDatasetId) !== null && oFF.isNull(queryModelLinkSettings))
	{
		queryModelLinkSettings = oFF.QueryModelLinkSettings.create(this, this.getPrimaryQueryManager().getQueryModel().getDatasetId(), secondaryDatasetId);
		this.m_queryModelLinkSettings.add(queryModelLinkSettings);
	}
	return queryModelLinkSettings;
};
oFF.BlendableQueryManager.prototype.getPrimaryBlendedMeasures = function()
{
	return this.m_primaryBlendedMeasures;
};
oFF.BlendableQueryManager.prototype.removePrimaryBlendedMeasure = function(member)
{
	var removeElement = this.m_primaryBlendedMeasures.removeElement(member);
	if (oFF.notNull(removeElement))
	{
		if (removeElement.getContext() === this)
		{
			oFF.XObjectExt.release(removeElement);
		}
		else
		{
			removeElement.removeSecondaryParent(this);
		}
	}
};
oFF.BlendableQueryManager.prototype.addPrimaryBlendedMeasure = function(member)
{
	this.m_primaryBlendedMeasures.add(member);
	member.addSecondaryParent(this);
};
oFF.BlendableQueryManager.prototype.validateBlend = function()
{
	var validationResult = oFF.MessageManager.createMessageManagerExt(this.getSession());
	this.getBlendingProcessConfigs(validationResult);
	return validationResult;
};
oFF.BlendableQueryManager.prototype.getBlendingProcessConfigs = function(validationResult)
{
	var modelLinkManager = this.getOlapEnv().getModelLinkManager();
	var primaryQueryManager = this.getPrimaryQueryManager();
	var primaryDatasetId = primaryQueryManager.getQueryModel().getDatasetId();
	var configs = oFF.XList.create();
	if (!oFF.BlendingUtils.isQueryModelInUseForBlending(primaryQueryManager.getQueryModel(), this.isUseEmptyAllMemberMeasureFilter(), false))
	{
		if (this.m_blendingRestrictionsEnabled)
		{
			var primaryNotInUseArgs = oFF.XListOfString.create();
			primaryNotInUseArgs.add(primaryDatasetId);
			var primaryQMNotInUseMsg = oFF.ErrorMessages.getText(oFF.ErrorMessages.QUERYMODEL_NOT_IN_USE, primaryNotInUseArgs, null, null);
			validationResult.addError(oFF.ErrorCodes.QUERYMODEL_NOT_IN_USE, primaryQMNotInUseMsg);
		}
		return configs;
	}
	var queryModelLinkSettingsIterator = this.m_queryModelLinkSettings.getIterator();
	while (queryModelLinkSettingsIterator.hasNext())
	{
		var queryModelLinkSettings = queryModelLinkSettingsIterator.next();
		var secondDatasetId = queryModelLinkSettings.getSecondDatasetId();
		var secondaryQueryManager = this.getQueryManagerByDatasetId(secondDatasetId);
		if (oFF.isNull(secondaryQueryManager) || !oFF.BlendingUtils.isQueryModelInUseForBlending(secondaryQueryManager.getQueryModel(), this.isUseEmptyAllMemberMeasureFilter(), true))
		{
			if (this.m_blendingRestrictionsEnabled)
			{
				var secondaryQMNotInUseArgs = oFF.XListOfString.create();
				secondaryQMNotInUseArgs.add(secondDatasetId);
				var secondaryQMNotInUseMsg = oFF.ErrorMessages.getText(oFF.ErrorMessages.QUERYMODEL_NOT_IN_USE, secondaryQMNotInUseArgs, null, null);
				validationResult.addError(oFF.ErrorCodes.QUERYMODEL_NOT_IN_USE, secondaryQMNotInUseMsg);
			}
			continue;
		}
		var modelLinks = modelLinkManager.getDimensionLinksByDatasetIds(this.getStorageName(), primaryDatasetId, secondDatasetId, true);
		if (modelLinks.size() > 0)
		{
			var copyQueryModelLinkSettings = oFF.QueryModelLinkSettings.create(this, primaryDatasetId, secondDatasetId);
			copyQueryModelLinkSettings.copyFrom(queryModelLinkSettings, null);
			var copyModelLinks = oFF.XList.create();
			var modelDimensionLinksIter = modelLinks.getIterator();
			while (modelDimensionLinksIter.hasNext())
			{
				var activeDimensionLink = modelDimensionLinksIter.next();
				var linkDimensionNotInDrillArgs;
				var linkDimensionNotInDrillArgsMsg;
				var isValidLink = !this.m_blendingRestrictionsEnabled;
				if (!isValidLink)
				{
					var primaryDimension = this.getPrimaryQueryManager().getQueryModel().getDimensionByName(activeDimensionLink.getFirstPart().getDimensionName());
					isValidLink = oFF.notNull(primaryDimension) && (oFF.AxisType.ROWS === primaryDimension.getAxisType() || oFF.AxisType.COLUMNS === primaryDimension.getAxisType());
					if (!isValidLink)
					{
						linkDimensionNotInDrillArgs = oFF.XListOfString.create();
						linkDimensionNotInDrillArgs.add(activeDimensionLink.getFirstPart().getDimensionName());
						linkDimensionNotInDrillArgsMsg = oFF.ErrorMessages.getText(oFF.ErrorMessages.LINK_DIMENSION_NOT_IN_DRILL, linkDimensionNotInDrillArgs, null, null);
						validationResult.addError(oFF.ErrorCodes.LINK_DIMENSION_NOT_IN_DRILL, linkDimensionNotInDrillArgsMsg);
					}
					var secondaryDimension = this.getQueryManagerByDatasetId(secondDatasetId).getQueryModel().getDimensionByName(activeDimensionLink.getSecondPart().getDimensionName());
					if (oFF.notNull(secondaryDimension) && (oFF.AxisType.ROWS === secondaryDimension.getAxisType() || oFF.AxisType.COLUMNS === secondaryDimension.getAxisType()))
					{
						isValidLink = false;
						linkDimensionNotInDrillArgs = oFF.XListOfString.create();
						linkDimensionNotInDrillArgs.add(activeDimensionLink.getSecondPart().getDimensionName());
						linkDimensionNotInDrillArgsMsg = oFF.ErrorMessages.getText(oFF.ErrorMessages.SECONDARY_LINK_DIMENSION_IN_DRILL, linkDimensionNotInDrillArgs, null, null);
						validationResult.addError(oFF.ErrorCodes.SECONDARY_LINK_DIMENSION_IN_DRILL, linkDimensionNotInDrillArgsMsg);
					}
				}
				if (isValidLink)
				{
					copyModelLinks.add(activeDimensionLink.cloneOlapComponent(this.getContext(), null));
				}
			}
			if (copyModelLinks.size() > 0)
			{
				configs.add(oFF.BlendingProcessConfig.create(primaryQueryManager, secondaryQueryManager, copyModelLinks, copyQueryModelLinkSettings));
			}
		}
	}
	return configs;
};
oFF.BlendableQueryManager.prototype.cloneQueryManagerExt = function(cloneMode)
{
	var cloneBlendableQueryManager = oFF.AbstractBlendableQueryManager.prototype.cloneQueryManagerExt.call( this , cloneMode);
	cloneBlendableQueryManager.copyFrom(this, null);
	return cloneBlendableQueryManager;
};
oFF.BlendableQueryManager.prototype.cloneQueryManagerOptimized = function(neededDimensions)
{
	var cloneBlendableQueryManager = oFF.AbstractBlendableQueryManager.prototype.cloneQueryManagerOptimized.call( this , neededDimensions);
	cloneBlendableQueryManager.copyFrom(this, null);
	return cloneBlendableQueryManager;
};
oFF.BlendableQueryManager.prototype.notifyChildChanged = function(changedNodes)
{
	this.getResultsetContainer(true);
	oFF.AbstractBlendableQueryManager.prototype.notifyChildChanged.call( this , changedNodes);
};
oFF.BlendableQueryManager.prototype.getRuntimeQueryManager = function(syncType, listener, customIdentifier)
{
	var runtimeBlendedQueryManagerAction = oFF.RuntimeBlendedQueryManagerAction.create(this);
	return runtimeBlendedQueryManagerAction.processSyncAction(syncType, listener, customIdentifier);
};
oFF.BlendableQueryManager.prototype.exportPersistedQueriesAndRuntimeQueryManager = function(syncType, listener, customIdentifier)
{
	var blendableQMPersistedInAExportAction = oFF.BlendableQMPersistedInAExportAction.create(this);
	return blendableQMPersistedInAExportAction.processSyncAction(syncType, listener, customIdentifier);
};
oFF.BlendableQueryManager.prototype.serializeToContentExt = function(modelFormat, capabilities)
{
	var content;
	if (modelFormat.isTypeOf(oFF.QModelFormat.INA_DATA))
	{
		var processRuntimeQueryManagerAction = this.getRuntimeQueryManager(oFF.SyncType.BLOCKING, null, null);
		if (!processRuntimeQueryManagerAction.hasErrors())
		{
			var runtimeQueryManager = processRuntimeQueryManagerAction.getData();
			content = runtimeQueryManager.serializeToContentExt(modelFormat, oFF.notNull(capabilities) ? capabilities : runtimeQueryManager.getModelCapabilities());
		}
		else
		{
			content = null;
		}
		oFF.XObjectExt.release(processRuntimeQueryManagerAction);
	}
	else
	{
		content = oFF.AbstractBlendableQueryManager.prototype.serializeToContentExt.call( this , modelFormat, capabilities);
	}
	return content;
};
oFF.BlendableQueryManager.prototype.getBlendedDimensionsByAxis = function(axis)
{
	var blendedDimensionOrder = this.m_blendedDimensionOrder.getByKey(axis.getName());
	if (oFF.isNull(blendedDimensionOrder))
	{
		blendedDimensionOrder = oFF.XList.create();
	}
	return blendedDimensionOrder;
};
oFF.BlendableQueryManager.prototype.setBlendedDimensionInfosByAxis = function(axis, blendedDimensionOrder)
{
	var newBlendedDimensionOrder = oFF.QModelComponentList.createModelComponentList(this, this, true, "Blended Dimension Order");
	newBlendedDimensionOrder.addAll(blendedDimensionOrder);
	this.m_blendedDimensionOrder.put(axis.getName(), newBlendedDimensionOrder);
};
oFF.BlendableQueryManager.prototype.clearBlendedDimensionInfosByAxis = function(axis)
{
	var blendedDimensionOrder = this.m_blendedDimensionOrder.getByKey(axis.getName());
	if (oFF.notNull(blendedDimensionOrder) && blendedDimensionOrder.size() > 0)
	{
		blendedDimensionOrder.clear();
	}
};
oFF.BlendableQueryManager.prototype.addBlendedDimensionInfoToAxis = function(axis, datasetId, dimensionName)
{
	var blendedDimensionInfo = this.m_blendedDimensionOrder.getByKey(axis.getName());
	var newBlendedDimensionInfo = this.insertBlendedDimensionInfoToAxis(axis, datasetId, dimensionName, oFF.notNull(blendedDimensionInfo) ? blendedDimensionInfo.size() : 0);
	return newBlendedDimensionInfo;
};
oFF.BlendableQueryManager.prototype.insertBlendedDimensionInfoToAxis = function(axis, datasetId, dimensionName, index)
{
	var blendedDimensionInfo = this.m_blendedDimensionOrder.getByKey(axis.getName());
	if (oFF.isNull(blendedDimensionInfo))
	{
		blendedDimensionInfo = oFF.QModelComponentList.createModelComponentList(this, this, true, "Blended Dimension Order");
		this.m_blendedDimensionOrder.put(axis.getName(), blendedDimensionInfo);
	}
	var newBlendedDimensionInfo = oFF.BlendedDimensionInfo.createBlendedDimensionInfo(datasetId, dimensionName);
	blendedDimensionInfo.insert(index, newBlendedDimensionInfo);
	return newBlendedDimensionInfo;
};
oFF.BlendableQueryManager.prototype.removeBlendedDimensionInfo = function(axisType, blendedDimensionInfo)
{
	var rowsBlendedDimensionInfo = this.m_blendedDimensionOrder.getByKey(axisType.getName());
	if (oFF.notNull(rowsBlendedDimensionInfo))
	{
		rowsBlendedDimensionInfo.removeElement(blendedDimensionInfo);
	}
};
oFF.BlendableQueryManager.prototype.getBlendedDrillOperations = function()
{
	return this.m_blendedDrillOperations;
};
oFF.BlendableQueryManager.prototype.addNewBlendedDrillOperation = function(datasetId, dimensionName)
{
	var newBlendedDimensionDrillInfo = oFF.BlendedDrillInfo.createBlendedDimensionDrillInfo(this, datasetId, dimensionName);
	this.m_blendedDrillOperations.add(newBlendedDimensionDrillInfo);
	return newBlendedDimensionDrillInfo;
};
oFF.BlendableQueryManager.prototype.clearBlendedDrillOperations = function()
{
	if (this.m_blendedDrillOperations.size() > 0)
	{
		this.m_blendedDrillOperations.clear();
	}
};
oFF.BlendableQueryManager.prototype.setUseEmptyAllMemberMeasureFilter = function(useEmptyAllMemberMeasureFilter)
{
	if (this.m_useEmptyAllMemberMeasureFilter !== useEmptyAllMemberMeasureFilter)
	{
		this.m_useEmptyAllMemberMeasureFilter = useEmptyAllMemberMeasureFilter;
		this.notifyNodeChanged();
	}
};
oFF.BlendableQueryManager.prototype.isUseEmptyAllMemberMeasureFilter = function()
{
	return this.m_useEmptyAllMemberMeasureFilter;
};
oFF.BlendableQueryManager.prototype.removeBlendedDrillOperation = function(blendedDrillOperation)
{
	this.m_blendedDrillOperations.removeElement(blendedDrillOperation);
};
oFF.BlendableQueryManager.prototype.migrateLegacyBlendedQueryState = function(originalBlendedQueryManager)
{
	oFF.BlendingUtils.migrateAxis(this, originalBlendedQueryManager, oFF.AxisType.ROWS);
	oFF.BlendingUtils.migrateAxis(this, originalBlendedQueryManager, oFF.AxisType.COLUMNS);
};
oFF.BlendableQueryManager.prototype.updateBlendableDimensionSort = function(dimensionSort)
{
	this.m_sortContainer.updateBlendableDimensionSort(dimensionSort);
};
oFF.BlendableQueryManager.prototype.addBlendableDimensionSort = function(fieldName, datasetId, sortDirection, preserveGrouping)
{
	this.m_sortContainer.addBlendableDimensionSort(fieldName, datasetId, sortDirection, preserveGrouping);
};
oFF.BlendableQueryManager.prototype.removeBlendableDimensionSort = function(fieldName, datasetId)
{
	this.m_sortContainer.removeBlendableDimensionSort(fieldName, datasetId);
};
oFF.BlendableQueryManager.prototype.clearBlendableDimensionSorts = function()
{
	this.m_sortContainer.clearBlendableDimensionSorts();
};
oFF.BlendableQueryManager.prototype.getBlendableDimensionSorts = function()
{
	return this.m_sortContainer.getBlendableDimensionSorts();
};
oFF.BlendableQueryManager.prototype.setPrimaryBlendableMeasureMemberSort = function(measureMemberName, datasetId, sortDirection)
{
	this.m_sortContainer.setPrimaryBlendableMeasureMemberSort(measureMemberName, datasetId, sortDirection);
};
oFF.BlendableQueryManager.prototype.clearPrimaryBlendableMemberMeasureSort = function()
{
	this.m_sortContainer.clearPrimaryBlendableMemberMeasureSort();
};
oFF.BlendableQueryManager.prototype.getPrimaryBlendableMeasureMemberSort = function()
{
	return this.m_sortContainer.getPrimaryBlendableMeasureMemberSort();
};
oFF.BlendableQueryManager.prototype.isBlended = function()
{
	var validateBlend = this.validateBlend();
	return !validateBlend.hasErrors();
};
oFF.BlendableQueryManager.prototype.supportsBatchBlendingRsStreamingExt = function()
{
	if (this.isBlended())
	{
		return this.supportsBatchBlendingRsStreaming();
	}
	return this.supportsBatchRsStreaming();
};
oFF.BlendableQueryManager.prototype.getRankSettings = function()
{
	return this.m_rankSettings;
};
oFF.BlendableQueryManager.prototype.addRankSettings = function(rankSettings)
{
	this.m_rankSettings.add(rankSettings);
};
oFF.BlendableQueryManager.prototype.clearRankSettings = function()
{
	if (this.m_rankSettings.size() > 0)
	{
		oFF.XCollectionUtils.releaseEntriesFromCollection(this.m_rankSettings);
		this.m_rankSettings.clear();
	}
};
oFF.BlendableQueryManager.prototype.removeRankSettings = function(index)
{
	return this.m_rankSettings.removeAt(index);
};
oFF.BlendableQueryManager.prototype.getModCounterState = function()
{
	if (oFF.isNull(this.m_modCounterState))
	{
		this.m_modCounterState = oFF.ModCounterState.create(this);
	}
	return this.m_modCounterState;
};
oFF.BlendableQueryManager.prototype.setBlendableMeasureMemberSort = function(blendableMeasureSort)
{
	this.m_sortContainer.setBlendableMeasureMemberSort(blendableMeasureSort);
};
oFF.BlendableQueryManager.prototype.getBlendableMeasureMemberSort = function()
{
	return this.m_sortContainer.getBlendableMeasureMemberSort();
};
oFF.BlendableQueryManager.prototype.setUseSavedPromptsForExitVariables = function(disableExitVariables) {};
oFF.BlendableQueryManager.prototype.isUsingSavedPromptsForExitVariables = function()
{
	return false;
};
oFF.BlendableQueryManager.prototype.getAllQueryModelLinkSettings = function()
{
	return this.m_queryModelLinkSettings;
};
oFF.BlendableQueryManager.prototype.getSortingContainer = function()
{
	return this.m_sortContainer;
};
oFF.BlendableQueryManager.prototype.isDefaultOrder = function()
{
	return this.m_sortContainer.isDefaultOrder();
};
oFF.BlendableQueryManager.prototype.setIsDefaultOrder = function(isDefaultOrder)
{
	this.m_sortContainer.setIsDefaultOrder(isDefaultOrder);
};
oFF.BlendableQueryManager.prototype.prepareMergeCandidate = oFF.noSupport;
oFF.BlendableQueryManager.prototype.getFormulaExceptions = function()
{
	return this.m_formulaExceptions;
};
oFF.BlendableQueryManager.prototype.addFormulaException = function(formulaException)
{
	this.m_formulaExceptions.add(formulaException);
};
oFF.BlendableQueryManager.prototype.removeFormulaException = function(name)
{
	var formulaException = oFF.XCollectionUtils.getByName(this.m_formulaExceptions, name);
	this.m_formulaExceptions.removeElement(formulaException);
	return formulaException;
};
oFF.BlendableQueryManager.prototype.clearFormulaExceptions = function()
{
	this.m_formulaExceptions.clear();
};
oFF.BlendableQueryManager.prototype.unblend = function()
{
	var primaryQueryManager = this.m_queryManagers.remove(this.m_primaryDatasetId);
	primaryQueryManager.getQueryModel().setModCounter(this.getModCounter() + 1);
	primaryQueryManager.invalidateState();
	var originalName = this.getName();
	this.releaseObject();
	primaryQueryManager.setName(originalName);
	primaryQueryManager.getTagging().remove(oFF.QStateConstants.TAG_UNDO_IGNORE);
	return primaryQueryManager;
};
oFF.BlendableQueryManager.prototype.setBlendingRestrictionsEnabled = function(blendingRestrictionsEnabled)
{
	this.m_blendingRestrictionsEnabled = blendingRestrictionsEnabled;
};
oFF.BlendableQueryManager.prototype.isBlendingRestrictionsEnabled = function()
{
	return this.m_blendingRestrictionsEnabled;
};

oFF.OlapImplModule = function() {};
oFF.OlapImplModule.prototype = new oFF.DfModule();
oFF.OlapImplModule.prototype._ff_c = "OlapImplModule";

oFF.OlapImplModule.s_module = null;
oFF.OlapImplModule.getInstance = function()
{
	if (oFF.isNull(oFF.OlapImplModule.s_module))
	{
		oFF.DfModule.checkInitialized(oFF.ProtocolModule.getInstance());
		oFF.DfModule.checkInitialized(oFF.OlapApiModule.getInstance());
		oFF.DfModule.checkInitialized(oFF.OlapApiBaseModule.getInstance());
		oFF.DfModule.checkInitialized(oFF.ResultsetModule.getInstance());
		oFF.DfModule.checkInitialized(oFF.OlapModelModule.getInstance());
		oFF.OlapImplModule.s_module = oFF.DfModule.startExt(new oFF.OlapImplModule());
		var registrationService = oFF.RegistrationService.getInstance();
		oFF.QInAConverter.staticSetup();
		oFF.QDeltaOperationPhase.staticSetup();
		oFF.QDeltaBroadcastPhase.staticSetup();
		oFF.QDeltaChangeState.staticSetup();
		oFF.QInAImportFactory.staticSetup();
		oFF.QInAExportFactory.staticSetup();
		oFF.QTechnicalVariableNames.staticSetup();
		oFF.InACapabilitiesProvider.staticSetup();
		oFF.QFactory.setInstance(oFF.QFactoryImpl.create());
		oFF.HierarchyCatalogServiceConfig.staticSetup();
		registrationService.addServiceConfig(oFF.OlapApiModule.XS_HIERARCHY_CATALOG, oFF.HierarchyCatalogServiceConfig.CLAZZ);
		oFF.HierarchyCatalogService.staticSetup();
		registrationService.addService(oFF.OlapApiModule.XS_HIERARCHY_CATALOG, oFF.HierarchyCatalogService.CLAZZ);
		oFF.OlapEnvironmentFactoryImpl.staticSetupImpl();
		oFF.PlanningFactory.setInstance(new oFF.PlanningManagerFactoryDummyImpl());
		oFF.CommandSpaceFactory.setInstance(new oFF.CommandSpaceFactoryImpl());
		oFF.CommentingFactory.setInstance(oFF.CommentingFactoryImpl.create());
		oFF.DfModule.stopExt(oFF.OlapImplModule.s_module);
	}
	return oFF.OlapImplModule.s_module;
};
oFF.OlapImplModule.prototype.getName = function()
{
	return "ff4310.olap.impl";
};

oFF.OlapImplModule.getInstance();

return sap.firefly;
	} );