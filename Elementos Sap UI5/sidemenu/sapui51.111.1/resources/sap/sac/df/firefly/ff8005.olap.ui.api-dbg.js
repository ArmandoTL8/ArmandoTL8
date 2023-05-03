/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
[
"sap/sac/df/firefly/ff2200.ui","sap/sac/df/firefly/ff2240.ui.program","sap/sac/df/firefly/ff3600.horizon.ui.api","sap/sac/df/firefly/ff4200.olap.api"
],
function(oFF)
{
"use strict";

oFF.FilterDialogProgramRunnerFactory = {

	createForDimension:function(parentProcess, queryManager, dimension, title)
	{
			var runner = oFF.ProgramRunner.createRunner(parentProcess, oFF.FilterDialog.DEFAULT_PROGRAM_NAME_DIMENSION);
		runner.setObjectArgument(oFF.DfOuDialogProgram.PARAM_QUERY_MANAGER, queryManager);
		runner.setArgument(oFF.FilterDialog.PARAM_DIMENSION_NAME, dimension);
		runner.setArgument(oFF.FilterDialog.PARAM_TITLE, title);
		return runner;
	},
	createForVariable:function(parentProcess, queryManager, variable, title)
	{
			var runner = oFF.ProgramRunner.createRunner(parentProcess, oFF.FilterDialog.DEFAULT_PROGRAM_NAME_VARIABLE);
		if (oFF.notNull(queryManager))
		{
			runner.setObjectArgument(oFF.DfOuDialogProgram.PARAM_QUERY_MANAGER, queryManager);
			runner.setArgument(oFF.FilterDialog.PARAM_VARIABLE_NAME, variable.getName());
		}
		else
		{
			runner.setObjectArgument(oFF.FilterDialog.PARAM_VARIABLE, variable);
		}
		runner.setArgument(oFF.FilterDialog.PARAM_TITLE, title);
		return runner;
	},
	createForHierarchyCatalog:function(parentProcess, queryManager, dimension, title)
	{
			var runner = oFF.ProgramRunner.createRunner(parentProcess, oFF.FilterDialog.DEFAULT_PROGRAM_NAME_HIERARCHY_CATALOG);
		runner.setObjectArgument(oFF.DfOuDialogProgram.PARAM_QUERY_MANAGER, queryManager);
		runner.setArgument(oFF.FilterDialog.PARAM_DIMENSION_NAME, dimension);
		runner.setArgument(oFF.FilterDialog.PARAM_TITLE, title);
		return runner;
	},
	createForMeasureBasedFilter:function(parentProcess, queryManager, mbfMemberName, filterMeasureBased, title)
	{
			var runner = oFF.ProgramRunner.createRunner(parentProcess, oFF.FilterDialog.DEFAULT_PROGRAM_NAME_MEASURE_BASED_FILTER);
		runner.setObjectArgument(oFF.DfOuDialogProgram.PARAM_QUERY_MANAGER, queryManager);
		runner.setArgument(oFF.FilterDialog.PARAM_MBF_MEMBER_NAME, mbfMemberName);
		runner.setObjectArgument(oFF.FilterDialog.PARAM_MBF, filterMeasureBased);
		runner.setArgument(oFF.FilterDialog.PARAM_TITLE, title);
		return runner;
	},
	createForLinkedMeasureBasedFilter:function(parentProcess, queryManager, mbfMemberName, layeredFilterName, title)
	{
			var runner = oFF.ProgramRunner.createRunner(parentProcess, oFF.FilterDialog.DEFAULT_PROGRAM_NAME_MEASURE_BASED_FILTER);
		runner.setObjectArgument(oFF.DfOuDialogProgram.PARAM_QUERY_MANAGER, queryManager);
		runner.setArgument(oFF.FilterDialog.PARAM_MBF_MEMBER_NAME, mbfMemberName);
		runner.setArgument(oFF.FilterDialog.PARAM_LAYERED_FILTER_NAME, layeredFilterName);
		runner.setArgument(oFF.FilterDialog.PARAM_TITLE, title);
		return runner;
	}
};

oFF.FilterDialogValueFactory = {

	s_factory:null,
	setInstance:function(factory)
	{
			oFF.FilterDialogValueFactory.s_factory = factory;
	},
	createValue:function(key, displayKey, text)
	{
			return oFF.FilterDialogValueFactory.s_factory.newValue(key, displayKey, text);
	},
	createValueExt:function(key, displayKey, text, hierarchyName, operator)
	{
			return oFF.FilterDialogValueFactory.s_factory.newValueExt(key, displayKey, text, hierarchyName, operator);
	},
	createValueWithType:function(key, displayKey, text, valueType)
	{
			return oFF.FilterDialogValueFactory.s_factory.newValueWithType(key, displayKey, text, valueType);
	},
	createValueHelpValue:function(node)
	{
			return oFF.FilterDialogValueFactory.s_factory.newValueHelpValue(node);
	},
	createValueHelpValueExt:function(node, hierarchyName, comparisonOperator)
	{
			return oFF.FilterDialogValueFactory.s_factory.newValueHelpValueExt(node, hierarchyName, comparisonOperator);
	},
	createRangeValue:function(low, high, excludedRange)
	{
			return oFF.FilterDialogValueFactory.s_factory.newRangeValue(low, high, excludedRange);
	},
	createDateRangeDynamic:function(dateRange)
	{
			return oFF.FilterDialogValueFactory.s_factory.newDateRangeDynamic(dateRange);
	},
	createDateRangeFixed:function(min, max, granularity, dateTimeProvider)
	{
			return oFF.FilterDialogValueFactory.s_factory.newDateRangeFixed(min, max, granularity, dateTimeProvider);
	},
	createEmptyValue:function()
	{
			return oFF.FilterDialogValueFactory.s_factory.newEmptyValue();
	},
	createNullValue:function()
	{
			return oFF.FilterDialogValueFactory.s_factory.newNullValue();
	},
	createSelectionFromFilter:function(dimension, filter)
	{
			return oFF.FilterDialogValueFactory.s_factory.newSelectionFromFilter(dimension, filter);
	},
	createSelectionFromVariable:function(variable)
	{
			return oFF.FilterDialogValueFactory.s_factory.newSelectionFromVariable(variable);
	}
};

oFF.FilterDialogMBFUtils = {

	getMemberName:function(filterMeasureBased)
	{
			return oFF.FilterDialogMBFUtils.getMemberNameFromFormula(oFF.FilterDialogMBFUtils.asFormulaFunction(filterMeasureBased.getFormula()));
	},
	getMemberNameFromFormula:function(ifFunction)
	{
			if (oFF.notNull(ifFunction) && oFF.XString.isEqual(ifFunction.getFunctionName(), oFF.FormulaOperator.IF.getName()) && ifFunction.hasElements())
		{
			var condition = oFF.FilterDialogMBFUtils.asFormulaFunction(ifFunction.get(0));
			var operator = oFF.notNull(condition) ? oFF.FilterDialogMBFUtils.getByFormulaOperator(condition.getFunctionName()) : null;
			if (operator === oFF.ComparisonOperator.BETWEEN || operator === oFF.ComparisonOperator.NOT_BETWEEN)
			{
				condition = oFF.FilterDialogMBFUtils.asFormulaFunction(condition.get(0));
			}
			if (oFF.notNull(condition) && condition.hasElements())
			{
				var formulaMember = condition.get(0).getOlapComponentType() === oFF.OlapComponentType.FORMULA_ITEM_MEMBER ? condition.get(0) : null;
				if (oFF.notNull(formulaMember) && oFF.XStringUtils.isNotNullAndNotEmpty(formulaMember.getMemberName()))
				{
					return formulaMember.getMemberName();
				}
			}
			return oFF.FilterDialogMBFUtils.getMemberNameFromFormula(oFF.FilterDialogMBFUtils.asFormulaFunction(ifFunction.get(2)));
		}
		return null;
	},
	getFilterRangesByMemberName:function(filterMeasureBased, memberName)
	{
			var result = oFF.XList.create();
		oFF.FilterDialogMBFUtils.addFormulaFunctionToSelection(oFF.FilterDialogMBFUtils.asFormulaFunction(filterMeasureBased.getFormula()), memberName, result);
		return result;
	},
	getFilterRanges:function(filterMeasureBased)
	{
			var result = oFF.XList.create();
		var memberName = oFF.FilterDialogMBFUtils.getMemberName(filterMeasureBased);
		if (oFF.notNull(memberName))
		{
			oFF.FilterDialogMBFUtils.addFormulaFunctionToSelection(oFF.FilterDialogMBFUtils.asFormulaFunction(filterMeasureBased.getFormula()), memberName, result);
		}
		return result;
	},
	addFormulaFunctionToSelection:function(ifFunction, memberName, result)
	{
			if (oFF.notNull(ifFunction) && oFF.XString.isEqual(ifFunction.getFunctionName(), oFF.FormulaOperator.IF.getName()) && ifFunction.size() === 3)
		{
			var ifCondition = oFF.FilterDialogMBFUtils.asFormulaFunction(ifFunction.get(0));
			if (oFF.notNull(ifCondition))
			{
				var operator = oFF.FilterDialogMBFUtils.getByFormulaOperator(ifCondition.getFunctionName());
				if (operator === oFF.ComparisonOperator.BETWEEN || operator === oFF.ComparisonOperator.NOT_BETWEEN)
				{
					if (ifCondition.size() === 2)
					{
						var itemLow = oFF.FilterDialogMBFUtils.createItemFromFormulaFunction(oFF.FilterDialogMBFUtils.asFormulaFunction(ifCondition.get(0)), memberName, oFF.ComparisonOperator.EQUAL);
						var itemHigh = oFF.FilterDialogMBFUtils.createItemFromFormulaFunction(oFF.FilterDialogMBFUtils.asFormulaFunction(ifCondition.get(1)), memberName, oFF.ComparisonOperator.EQUAL);
						if (oFF.notNull(itemLow) && oFF.notNull(itemHigh))
						{
							result.add(oFF.FilterDialogValueFactory.createRangeValue(itemLow, itemHigh, operator === oFF.ComparisonOperator.NOT_BETWEEN));
						}
					}
				}
				else if (oFF.notNull(operator))
				{
					oFF.XCollectionUtils.addIfNotNull(result, oFF.FilterDialogMBFUtils.createItemFromFormulaFunction(ifCondition, memberName, operator));
				}
			}
			var elsePart = oFF.FilterDialogMBFUtils.asFormulaFunction(ifFunction.get(2));
			oFF.FilterDialogMBFUtils.addFormulaFunctionToSelection(elsePart, memberName, result);
		}
	},
	createItemFromFormulaFunction:function(fif, memberName, operator)
	{
			if (oFF.notNull(fif) && fif.size() === 2)
		{
			var formulaMember = fif.get(0).getOlapComponentType() === oFF.OlapComponentType.FORMULA_ITEM_MEMBER ? fif.get(0) : null;
			var formulaConstant = oFF.FilterDialogMBFUtils.asFormulaFunction(fif.get(1));
			if (oFF.notNull(formulaMember) && oFF.XString.isEqual(formulaMember.getMemberName(), memberName) && oFF.notNull(formulaConstant) && formulaConstant.hasElements())
			{
				var formulaConstantValue = formulaConstant.get(0);
				if (formulaConstantValue.getOlapComponentType() === oFF.OlapComponentType.FORMULA_CONSTANT)
				{
					return oFF.FilterDialogValueFactory.createValueExt(formulaConstantValue.getString(), null, null, null, operator);
				}
			}
		}
		return null;
	},
	asFormulaFunction:function(formulaItem)
	{
			return oFF.notNull(formulaItem) && formulaItem.getOlapComponentType() === oFF.OlapComponentType.FORMULA_FUNCTION ? formulaItem : null;
	},
	createFormula:function(filterMeasureBased, memberName, selection)
	{
			if (!oFF.XCollectionUtils.hasElements(selection))
		{
			return null;
		}
		var functionIf = oFF.QFactory.createFormulaFunctionWithName(filterMeasureBased, oFF.FormulaOperator.IF.getName());
		var prevFuntionIf = null;
		var root = functionIf;
		for (var i = 0; i < selection.size(); i++)
		{
			var value = selection.get(i);
			if (!oFF.FilterDialogMBFUtils.isValidValue(value))
			{
				continue;
			}
			var operator = value.getComparisonOperator();
			var formulaOperator = oFF.FilterDialogMBFUtils.getFormulaOperator(operator);
			var isBetweenOperator = operator === oFF.ComparisonOperator.BETWEEN;
			var functionCondition;
			if ((isBetweenOperator || operator === oFF.ComparisonOperator.NOT_BETWEEN) && value.getType() === oFF.FilterDialogValueType.RANGE)
			{
				var rangeValue = value;
				functionCondition = oFF.QFactory.createFormulaFunctionWithName(filterMeasureBased, formulaOperator.getName());
				functionCondition.add(oFF.FilterDialogMBFUtils.createFormulaItemFunction(filterMeasureBased, memberName, isBetweenOperator ? oFF.FormulaOperator.GE : oFF.FormulaOperator.LT, rangeValue.getLow().getKey()));
				functionCondition.add(oFF.FilterDialogMBFUtils.createFormulaItemFunction(filterMeasureBased, memberName, isBetweenOperator ? oFF.FormulaOperator.LE : oFF.FormulaOperator.GT, rangeValue.getHigh().getKey()));
			}
			else
			{
				functionCondition = oFF.FilterDialogMBFUtils.createFormulaItemFunction(filterMeasureBased, memberName, formulaOperator, value.getKey());
			}
			functionIf.add(functionCondition);
			functionIf.add(oFF.QFactory.createFormulaConstantWithIntValue(filterMeasureBased, 1));
			if (i === selection.size() - 1)
			{
				functionIf.add(oFF.QFactory.createFormulaConstantWithIntValue(filterMeasureBased, 0));
			}
			else
			{
				prevFuntionIf = functionIf;
				functionIf = oFF.QFactory.createFormulaFunctionWithName(filterMeasureBased, oFF.FormulaOperator.IF.getName());
				prevFuntionIf.add(functionIf);
			}
		}
		if (functionIf.isEmpty())
		{
			if (functionIf === root)
			{
				return null;
			}
			prevFuntionIf.removeAt(2);
			prevFuntionIf.add(oFF.QFactory.createFormulaConstantWithIntValue(filterMeasureBased, 0));
		}
		return root;
	},
	isValidValue:function(value)
	{
			if (oFF.isNull(value) || value.isNull())
		{
			return false;
		}
		if (value.getType() === oFF.FilterDialogValueType.RANGE)
		{
			var rangeValue = value;
			return !rangeValue.getLow().isNull() && rangeValue.getLow().getKey() !== null && !rangeValue.getHigh().isNull() && rangeValue.getHigh().getKey() !== null;
		}
		return value.getKey() !== null;
	},
	createFormulaItemFunction:function(filterMeasureBased, memberName, operator, constantValue)
	{
			var fif = oFF.QFactory.createFormulaFunctionWithName(filterMeasureBased, operator.getName());
		fif.add(oFF.QFactory.createFormulaMemberWithName(filterMeasureBased, memberName));
		var value = oFF.QFactory.createFormulaFunctionWithName(filterMeasureBased, oFF.FormulaOperator.DECFLOAT.getName());
		value.add(oFF.QFactory.createFormulaConstantWithStringValue(filterMeasureBased, constantValue));
		fif.add(value);
		return fif;
	},
	getByFormulaOperator:function(formulaOperatorName)
	{
			if (oFF.XString.isEqual(formulaOperatorName, oFF.FormulaOperator.AND.getName()))
		{
			return oFF.ComparisonOperator.BETWEEN;
		}
		if (oFF.XString.isEqual(formulaOperatorName, oFF.FormulaOperator.OR.getName()))
		{
			return oFF.ComparisonOperator.NOT_BETWEEN;
		}
		if (oFF.XString.isEqual(formulaOperatorName, oFF.FormulaOperator.GT.getName()))
		{
			return oFF.ComparisonOperator.GREATER_THAN;
		}
		if (oFF.XString.isEqual(formulaOperatorName, oFF.FormulaOperator.GE.getName()))
		{
			return oFF.ComparisonOperator.GREATER_EQUAL;
		}
		if (oFF.XString.isEqual(formulaOperatorName, oFF.FormulaOperator.LT.getName()))
		{
			return oFF.ComparisonOperator.LESS_THAN;
		}
		if (oFF.XString.isEqual(formulaOperatorName, oFF.FormulaOperator.LE.getName()))
		{
			return oFF.ComparisonOperator.LESS_EQUAL;
		}
		if (oFF.XString.isEqual(formulaOperatorName, oFF.FormulaOperator.EQ.getName()))
		{
			return oFF.ComparisonOperator.EQUAL;
		}
		if (oFF.XString.isEqual(formulaOperatorName, oFF.FormulaOperator.NE.getName()))
		{
			return oFF.ComparisonOperator.NOT_EQUAL;
		}
		return null;
	},
	getFormulaOperator:function(comparisonOperator)
	{
			if (comparisonOperator === oFF.ComparisonOperator.BETWEEN)
		{
			return oFF.FormulaOperator.AND;
		}
		if (comparisonOperator === oFF.ComparisonOperator.NOT_BETWEEN)
		{
			return oFF.FormulaOperator.OR;
		}
		if (comparisonOperator === oFF.ComparisonOperator.GREATER_THAN)
		{
			return oFF.FormulaOperator.GT;
		}
		if (comparisonOperator === oFF.ComparisonOperator.GREATER_EQUAL)
		{
			return oFF.FormulaOperator.GE;
		}
		if (comparisonOperator === oFF.ComparisonOperator.LESS_THAN)
		{
			return oFF.FormulaOperator.LT;
		}
		if (comparisonOperator === oFF.ComparisonOperator.LESS_EQUAL)
		{
			return oFF.FormulaOperator.LE;
		}
		if (comparisonOperator === oFF.ComparisonOperator.NOT_EQUAL)
		{
			return oFF.FormulaOperator.NE;
		}
		return oFF.FormulaOperator.EQ;
	}
};

oFF.FilterDialogValueUtils = {

	supportsFilterOnDimension:function(dimension)
	{
			return oFF.notNull(dimension) && dimension.getKeyField().isFilterable();
	},
	newSelectionFromFilter:function(dimension, filter)
	{
			return oFF.FilterDialogValueFactory.createSelectionFromFilter(dimension, filter);
	},
	newSelectionFromMeasureBasedFilter:function(filterMeasureBased)
	{
			return oFF.FilterDialogMBFUtils.getFilterRanges(filterMeasureBased);
	},
	updateDynamicFilter:function(dimension, selection)
	{
			if (oFF.isNull(dimension))
		{
			return;
		}
		var hasSelection = oFF.XCollectionUtils.hasElements(selection);
		var filter = dimension.getFilter();
		if (hasSelection || oFF.notNull(filter))
		{
			var queryFilter = dimension.getQueryModel().getFilter();
			queryFilter.queueEventing();
			var dynamicFilter = queryFilter.getDynamicFilter();
			if (hasSelection)
			{
				oFF.FilterDialogValueUtils._updateFilterWithSelection(dimension, oFF.notNull(filter) ? filter : dynamicFilter.getCartesianProductWithDefault().getCartesianListWithDefault(dimension), selection);
			}
			else
			{
				dynamicFilter.removeFilterById(filter.getUniqueId());
			}
			queryFilter.resumeEventing();
		}
	},
	updateLayeredFilter:function(dimension, layeredFilterName, selection)
	{
			if (oFF.isNull(dimension) || oFF.XStringUtils.isNullOrEmpty(layeredFilterName))
		{
			return;
		}
		var hasSelection = oFF.XCollectionUtils.hasElements(selection);
		var queryFilter = dimension.getQueryModel().getFilter();
		var layeredFilter = queryFilter.getLinkedFilter(layeredFilterName);
		var filter = oFF.notNull(layeredFilter) ? layeredFilter.getCartesianList(dimension) : null;
		if (hasSelection || oFF.notNull(filter))
		{
			queryFilter.queueEventing();
			if (oFF.isNull(layeredFilter))
			{
				layeredFilter = oFF.QFactory.createFilterExpression(queryFilter, queryFilter);
				queryFilter.linkFilter(layeredFilterName, layeredFilter);
			}
			layeredFilter.setPreserveOnRepoSerialization(true);
			if (hasSelection)
			{
				oFF.FilterDialogValueUtils._updateFilterWithSelection(dimension, oFF.notNull(filter) ? filter : layeredFilter.getCartesianProductWithDefault().getCartesianListWithDefault(dimension), selection);
			}
			else
			{
				layeredFilter.removeFilterById(filter.getUniqueId());
				if (!layeredFilter.getFilterRootElement().getChildren().hasNext())
				{
					queryFilter.linkFilter(layeredFilterName, null);
				}
			}
			queryFilter.resumeEventing();
		}
	},
	_updateFilterWithSelection:function(dimension, filter, selection)
	{
			oFF.XObjectExt.assertNotNullExt(dimension, "Dimension must not be null");
		oFF.XObjectExt.assertNotNullExt(filter, "Filter must not be null");
		oFF.XObjectExt.assertNotNullExt(selection, "Selection must not be null");
		filter.clear();
		var hierarchyName = selection.get(0).getHierarchyName();
		var isHierarchical = oFF.XStringUtils.isNotNullAndNotEmpty(hierarchyName);
		var convertToFlat = isHierarchical && (!dimension.isHierarchyActive() || !oFF.XString.isEqual(hierarchyName, dimension.getHierarchyName()));
		var keyField = isHierarchical ? dimension.getHierarchyKeyField() : dimension.getFlatKeyField();
		var displayKeyField = isHierarchical ? dimension.getHierarchyDisplayKeyField() : dimension.getFlatDisplayKeyField();
		if (displayKeyField === keyField)
		{
			displayKeyField = null;
		}
		var textField = isHierarchical ? dimension.getHierarchyTextField() : dimension.getFlatTextField();
		var filterCapability = dimension.getFilterCapabilities().getFilterCapabilitiesByField(keyField);
		var supportedOperatorsExcluding = oFF.notNull(filterCapability) ? filterCapability.getSupportedComparisonOperators(oFF.SetSign.EXCLUDING) : null;
		filter.setHierarchyName(hierarchyName);
		filter.setField(keyField);
		filter.addSupplementField(displayKeyField);
		filter.addSupplementField(textField);
		filter.setConvertToFlatFilter(convertToFlat);
		for (var i = 0; i < selection.size(); i++)
		{
			var selectedValue = selection.get(i);
			var type = selectedValue.getType();
			var operator = selectedValue.getComparisonOperator();
			var filterElement;
			if (type === oFF.FilterDialogValueType.DATE_RANGE_FIXED || type === oFF.FilterDialogValueType.DATE_RANGE_DYNAMIC)
			{
				filterElement = oFF.QFactory.createFilterOperationDateRange(filter.getFilterExpression(), filter.getField());
				filter.add(filterElement);
			}
			else
			{
				filterElement = filter.addNewCartesianElement();
			}
			filterElement.setHierarchyName(filter.getHierarchyName());
			filterElement.setComparisonOperator(operator);
			filterElement.setSetSign(oFF.SetSign.INCLUDING);
			if (selectedValue.isNull())
			{
				filterElement.setComparisonOperator(oFF.ComparisonOperator.IS_NULL);
				if (operator === oFF.ComparisonOperator.NOT_EQUAL && oFF.notNull(supportedOperatorsExcluding) && supportedOperatorsExcluding.contains(oFF.ComparisonOperator.IS_NULL))
				{
					filterElement.setSetSign(oFF.SetSign.EXCLUDING);
				}
			}
			else if (operator === oFF.ComparisonOperator.NOT_EQUAL && oFF.notNull(supportedOperatorsExcluding) && supportedOperatorsExcluding.contains(oFF.ComparisonOperator.EQUAL))
			{
				filterElement.setComparisonOperator(oFF.ComparisonOperator.EQUAL);
				filterElement.setSetSign(oFF.SetSign.EXCLUDING);
			}
			else if (operator === oFF.ComparisonOperator.NOT_BETWEEN && oFF.notNull(supportedOperatorsExcluding) && supportedOperatorsExcluding.contains(oFF.ComparisonOperator.BETWEEN))
			{
				filterElement.setComparisonOperator(oFF.ComparisonOperator.BETWEEN);
				filterElement.setSetSign(oFF.SetSign.EXCLUDING);
			}
			else if (operator === oFF.ComparisonOperator.NOT_MATCH && oFF.notNull(supportedOperatorsExcluding) && supportedOperatorsExcluding.contains(oFF.ComparisonOperator.MATCH))
			{
				filterElement.setComparisonOperator(oFF.ComparisonOperator.MATCH);
				filterElement.setSetSign(oFF.SetSign.EXCLUDING);
			}
			if (type === oFF.FilterDialogValueType.RANGE)
			{
				oFF.FilterDialogValueUtils._setFilterValue(filterElement.getLow(), selectedValue.getLow(), keyField, displayKeyField, textField, filterElement);
				oFF.FilterDialogValueUtils._setFilterValue(filterElement.getHigh(), selectedValue.getHigh(), keyField, displayKeyField, textField, filterElement);
			}
			else if (type === oFF.FilterDialogValueType.DATE_RANGE_FIXED || type === oFF.FilterDialogValueType.DATE_RANGE_DYNAMIC)
			{
				filterElement.setDateRange(selectedValue.getDateRange(), keyField);
			}
			else if (!selectedValue.isNull())
			{
				oFF.FilterDialogValueUtils._setFilterValue(filterElement.getLow(), selectedValue, keyField, displayKeyField, textField, filterElement);
			}
		}
	},
	_setFilterValue:function(valueBag, value, keyField, displayKeyField, textField, filterElement)
	{
			if (value.getType() === oFF.FilterDialogValueType.VALUEHELP)
		{
			valueBag.setDimensionMember(value.getValueHelpNode().getDimensionMember());
		}
		else
		{
			var key = value.getKey();
			valueBag.setValue(oFF.XValueUtil.getValueFromString(oFF.notNull(key) ? key : "", keyField.getValueType()));
		}
		filterElement.setField(keyField);
		if (value.hasDisplayKey() && oFF.notNull(displayKeyField))
		{
			valueBag.addSupplementValue(displayKeyField.getName(), value.getDisplayKey());
		}
		if (oFF.notNull(textField))
		{
			valueBag.addSupplementValue(textField.getName(), value.getText());
		}
	},
	updateMeasureBasedFilter:function(filterMeasureBased, layeredFilterName, memberName, dimensionContext, crossCalculationMeasure, selection)
	{
			if (oFF.isNull(filterMeasureBased) || oFF.XStringUtils.isNullOrEmpty(memberName) || !oFF.XCollectionUtils.hasElements(dimensionContext))
		{
			return;
		}
		if (oFF.XStringUtils.isNotNullAndNotEmpty(layeredFilterName))
		{
			var queryFilter = filterMeasureBased.getQueryModel().getFilter();
			queryFilter.queueEventing();
			oFF.FilterDialogValueUtils._updateMBF(filterMeasureBased, memberName, dimensionContext, crossCalculationMeasure, selection);
			if (filterMeasureBased.getFormula() === null)
			{
				queryFilter.linkFilter(layeredFilterName, null);
			}
			else
			{
				var linkedFilter = queryFilter.getLinkedFilter(layeredFilterName);
				if (oFF.isNull(linkedFilter))
				{
					linkedFilter = oFF.QFactory.createFilterExpression(queryFilter, queryFilter);
					queryFilter.linkFilter(layeredFilterName, linkedFilter);
				}
				linkedFilter.setPreserveOnRepoSerialization(true);
				if (linkedFilter.getFilterRootElement() !== filterMeasureBased)
				{
					linkedFilter.setComplexRoot(filterMeasureBased);
				}
			}
			queryFilter.resumeEventing();
		}
		else
		{
			filterMeasureBased.queueEventing();
			oFF.FilterDialogValueUtils._updateMBF(filterMeasureBased, memberName, dimensionContext, crossCalculationMeasure, selection);
			filterMeasureBased.resumeEventing();
		}
	},
	_updateMBF:function(filterMeasureBased, memberName, dimensionContext, crossCalculationMeasure, selection)
	{
			filterMeasureBased.clearDimensionContext();
		oFF.XCollectionUtils.forEachString(dimensionContext,  function(dimContext){
			filterMeasureBased.addDimensionContext(dimContext);
		}.bind(this));
		filterMeasureBased.setCrossCalculationMeasure(crossCalculationMeasure);
		filterMeasureBased.setFormula(oFF.FilterDialogMBFUtils.createFormula(filterMeasureBased, memberName, selection));
	}
};

oFF.FilterDialogConfig = function() {};
oFF.FilterDialogConfig.prototype = new oFF.XObject();
oFF.FilterDialogConfig.prototype._ff_c = "FilterDialogConfig";

oFF.FilterDialogConfig.create = function(args, queryManager, contentType)
{
	var config = new oFF.FilterDialogConfig();
	config.setupConfig(args, queryManager, contentType);
	return config;
};
oFF.FilterDialogConfig.prototype.m_contentType = null;
oFF.FilterDialogConfig.prototype.m_variable = null;
oFF.FilterDialogConfig.prototype.m_dimension = null;
oFF.FilterDialogConfig.prototype.m_mbfMemberName = null;
oFF.FilterDialogConfig.prototype.m_filterMeasureBased = null;
oFF.FilterDialogConfig.prototype.m_isOpenWithDynamicFilter = false;
oFF.FilterDialogConfig.prototype.m_layeredFilterName = null;
oFF.FilterDialogConfig.prototype.m_closeListener = null;
oFF.FilterDialogConfig.prototype.m_beforeFilterChangeListener = null;
oFF.FilterDialogConfig.prototype.m_listenerSelectionChange = null;
oFF.FilterDialogConfig.prototype.m_listenerDisplayChange = null;
oFF.FilterDialogConfig.prototype.m_title = null;
oFF.FilterDialogConfig.prototype.m_selectionMode = null;
oFF.FilterDialogConfig.prototype.m_selectionRequired = false;
oFF.FilterDialogConfig.prototype.m_resizeable = false;
oFF.FilterDialogConfig.prototype.m_defaultSelection = null;
oFF.FilterDialogConfig.prototype.m_alwaysShowSelectionContainer = false;
oFF.FilterDialogConfig.prototype.m_externalValueHelpProcess = null;
oFF.FilterDialogConfig.prototype.m_offerExclude = false;
oFF.FilterDialogConfig.prototype.m_offerListView = false;
oFF.FilterDialogConfig.prototype.m_offerRangeView = false;
oFF.FilterDialogConfig.prototype.m_offerFunctionalValuesView = false;
oFF.FilterDialogConfig.prototype.m_listPageSize = 0;
oFF.FilterDialogConfig.prototype.m_listPreloadPageCount = 0;
oFF.FilterDialogConfig.prototype.m_listSearchSize = 0;
oFF.FilterDialogConfig.prototype.m_listChildNodePageSize = 0;
oFF.FilterDialogConfig.prototype.m_dimensionDisplayInfo = null;
oFF.FilterDialogConfig.prototype.m_offerClipboard = false;
oFF.FilterDialogConfig.prototype.m_offerHierarchyChange = false;
oFF.FilterDialogConfig.prototype.m_offerEqualInRangeFilter = false;
oFF.FilterDialogConfig.prototype.m_dynamicDateRangeMaxYears = 0;
oFF.FilterDialogConfig.prototype.setupConfig = function(args, queryManager, contentType)
{
	this.evalContentObject(args, queryManager, contentType);
	this.m_isOpenWithDynamicFilter = args.getBooleanByKeyExt(oFF.FilterDialog.PARAM_OPEN_WITH_DYNAMIC_FILTER, false);
	this.m_layeredFilterName = args.getStringByKey(oFF.FilterDialog.PARAM_LAYERED_FILTER_NAME);
	this.m_closeListener = args.getXObjectByKey(oFF.FilterDialog.PARAM_LISTENER_CLOSE);
	this.m_beforeFilterChangeListener = args.getXObjectByKey(oFF.FilterDialog.PARAM_LISTENER_BEFORE_FILTER_CHANGE);
	this.m_listenerSelectionChange = args.getXObjectByKey(oFF.FilterDialog.PARAM_LISTENER_SELECTION_CHANGE);
	this.m_listenerDisplayChange = args.getXObjectByKey(oFF.FilterDialog.PARAM_LISTENER_DISPLAY_CHANGE);
	this.m_title = args.getStringByKey(oFF.FilterDialog.PARAM_TITLE);
	this.m_selectionMode = oFF.UiSelectionMode.lookup(args.getStringByKey(oFF.FilterDialog.PARAM_SELECTION_MODE));
	if (oFF.isNull(this.m_selectionMode))
	{
		this.m_selectionMode = oFF.UiSelectionMode.SINGLE_SELECT_LEFT;
	}
	this.m_selectionRequired = args.getBooleanByKeyExt(oFF.FilterDialog.PARAM_SELECTION_REQUIRED, false);
	this.m_resizeable = args.getBooleanByKeyExt(oFF.FilterDialog.PARAM_RESIZABLE, true);
	this.m_defaultSelection = args.getXObjectByKey(oFF.FilterDialog.PARAM_DEFAULT_SELECTION);
	this.m_alwaysShowSelectionContainer = args.getBooleanByKeyExt(oFF.FilterDialog.PARAM_ALWAYS_SHOW_SELECTION_CONTAINER, false);
	this.m_externalValueHelpProcess = args.getXObjectByKey(oFF.FilterDialog.PARAM_EXTERNAL_VALUEHELP_PROCESS);
	this.m_offerExclude = args.getBooleanByKeyExt(oFF.FilterDialog.PARAM_OFFER_EXCLUDE, false);
	if (this.m_contentType === oFF.FilterDialogContentType.DIMENSION)
	{
		this.m_offerRangeView = oFF.FilterDialogViewType.RANGE.isSupportedByDim(this.m_dimension) && args.getBooleanByKeyExt(oFF.FilterDialog.PARAM_OFFER_RANGE_VIEW, false);
		this.m_offerFunctionalValuesView = oFF.FilterDialogViewType.FUNCTIONAL_VALUES.isSupportedByDim(this.m_dimension) && args.getBooleanByKeyExt(oFF.FilterDialog.PARAM_OFFER_FUNCTIONAL_VALUES_VIEW, false);
		this.m_offerListView = oFF.FilterDialogViewType.LIST.isSupportedByDim(this.m_dimension) && (args.getBooleanByKeyExt(oFF.FilterDialog.PARAM_OFFER_LIST_VIEW, false) || (!this.m_offerRangeView && !this.m_offerFunctionalValuesView));
		if (this.m_isOpenWithDynamicFilter && oFF.notNull(this.m_dimension))
		{
			this.m_defaultSelection = oFF.FilterDialogValueFactory.createSelectionFromFilter(this.m_dimension, this.m_dimension.getFilter());
		}
		else if (oFF.XStringUtils.isNotNullAndNotEmpty(this.m_layeredFilterName) && oFF.notNull(this.m_dimension))
		{
			var layeredFilter = this.m_dimension.getQueryModel().getFilter().getLinkedFilter(this.m_layeredFilterName);
			var filter = oFF.notNull(layeredFilter) ? layeredFilter.getCartesianList(this.m_dimension) : null;
			this.m_defaultSelection = oFF.FilterDialogValueFactory.createSelectionFromFilter(this.m_dimension, filter);
		}
	}
	else if (this.m_contentType === oFF.FilterDialogContentType.VARIABLE || this.m_contentType === oFF.FilterDialogContentType.HIERARCHY_CATALOG)
	{
		this.m_offerListView = true;
	}
	else if (this.m_contentType === oFF.FilterDialogContentType.MEASURE_BASED_FILTER)
	{
		this.m_offerRangeView = true;
		if (oFF.XStringUtils.isNotNullAndNotEmpty(this.m_layeredFilterName) && oFF.notNull(queryManager) && queryManager.getModelCapabilities().supportsFilterMeasureBased())
		{
			var layeredMbf = queryManager.getQueryModel().getFilter().getLinkedFilter(this.m_layeredFilterName);
			if (oFF.notNull(layeredMbf))
			{
				var filterRootElement = layeredMbf.getFilterRootElement();
				if (oFF.notNull(filterRootElement) && filterRootElement.getOlapComponentType() === oFF.FilterComponentType.FILTER_MEASURE_BASED)
				{
					this.m_filterMeasureBased = filterRootElement;
				}
			}
			if (oFF.isNull(this.m_filterMeasureBased))
			{
				this.m_filterMeasureBased = oFF.QFactory.createFilterMeasureBased(queryManager.getQueryModel(), oFF.XStringUtils.concatenate3(this.m_layeredFilterName, "-", "MeasureBasedFilter"));
			}
		}
	}
	this.m_listPageSize = oFF.XMath.max(args.getIntegerByKeyExt(oFF.FilterDialog.PARAM_LIST_PAGE_SIZE, 20), 1);
	this.m_listPreloadPageCount = oFF.XMath.max(args.getIntegerByKeyExt(oFF.FilterDialog.PARAM_LIST_PRELOAD_PAGE_COUNT, 8), 1);
	this.m_listSearchSize = oFF.XMath.max(args.getIntegerByKeyExt(oFF.FilterDialog.PARAM_LIST_SEARCH_SIZE, 100), 1);
	this.m_listChildNodePageSize = oFF.XMath.max(args.getIntegerByKeyExt(oFF.FilterDialog.PARAM_LIST_CHILD_NODES_PAGE_SIZE, 50), 1);
	this.m_dimensionDisplayInfo = oFF.FilterDialogDimensionDisplayInfo.lookup(args.getStringByKey(oFF.FilterDialog.PARAM_DIMENSION_DISPLAY_INFO));
	this.m_offerClipboard = args.getBooleanByKeyExt(oFF.FilterDialog.PARAM_OFFER_CLIPBOARD, false);
	this.m_offerHierarchyChange = args.getBooleanByKeyExt(oFF.FilterDialog.PARAM_OFFER_HIERARCHY_CHANGE, false);
	this.m_offerEqualInRangeFilter = args.getBooleanByKeyExt(oFF.FilterDialog.PARAM_OFFER_EQUAL_IN_RANGE_FILTER, false);
	this.m_dynamicDateRangeMaxYears = oFF.XMath.max(args.getIntegerByKeyExt(oFF.FilterDialog.PARAM_DYNAMIC_DATE_RANGE_MAX_YEARS, 100), 0);
};
oFF.FilterDialogConfig.prototype.evalContentObject = function(args, queryManager, contentType)
{
	this.m_contentType = contentType;
	if (this.m_contentType === oFF.FilterDialogContentType.VARIABLE)
	{
		this.m_variable = args.getXObjectByKey(oFF.FilterDialog.PARAM_VARIABLE);
		if (oFF.isNull(this.m_variable) && oFF.notNull(queryManager) && args.containsKey(oFF.FilterDialog.PARAM_VARIABLE_NAME))
		{
			this.m_variable = queryManager.getVariable(args.getStringByKey(oFF.FilterDialog.PARAM_VARIABLE_NAME));
		}
		this.m_dimension = oFF.notNull(this.m_variable) ? this.m_variable.getDimension() : null;
	}
	else if ((this.m_contentType === oFF.FilterDialogContentType.DIMENSION || this.m_contentType === oFF.FilterDialogContentType.HIERARCHY_CATALOG) && oFF.notNull(queryManager))
	{
		this.m_dimension = queryManager.getDimensionAccessor().getDimensionByName(args.getStringByKey(oFF.FilterDialog.PARAM_DIMENSION_NAME));
	}
	else if (this.m_contentType === oFF.FilterDialogContentType.MEASURE_BASED_FILTER)
	{
		this.m_mbfMemberName = args.getStringByKey(oFF.FilterDialog.PARAM_MBF_MEMBER_NAME);
		this.m_filterMeasureBased = args.getXObjectByKey(oFF.FilterDialog.PARAM_MBF);
		if (oFF.XStringUtils.isNullOrEmpty(this.m_mbfMemberName) && oFF.notNull(this.m_filterMeasureBased))
		{
			this.m_mbfMemberName = oFF.FilterDialogMBFUtils.getMemberName(this.m_filterMeasureBased);
		}
	}
};
oFF.FilterDialogConfig.prototype.isValid = function()
{
	if (this.m_contentType === oFF.FilterDialogContentType.VARIABLE)
	{
		return oFF.notNull(this.m_variable) && oFF.notNull(this.m_dimension);
	}
	if (this.m_contentType === oFF.FilterDialogContentType.DIMENSION)
	{
		var useFilter = this.m_isOpenWithDynamicFilter || oFF.XStringUtils.isNotNullAndNotEmpty(this.m_layeredFilterName);
		return oFF.notNull(this.m_dimension) && (!useFilter || oFF.XCollectionUtils.hasElements(this.m_defaultSelection) || oFF.FilterDialogValueUtils.supportsFilterOnDimension(this.m_dimension));
	}
	if (this.m_contentType === oFF.FilterDialogContentType.HIERARCHY_CATALOG)
	{
		return oFF.notNull(this.m_dimension);
	}
	if (this.m_contentType === oFF.FilterDialogContentType.MEASURE_BASED_FILTER)
	{
		return oFF.XStringUtils.isNotNullAndNotEmpty(this.m_mbfMemberName) && oFF.notNull(this.m_filterMeasureBased);
	}
	return false;
};
oFF.FilterDialogConfig.prototype.releaseObject = function()
{
	oFF.XObject.prototype.releaseObject.call( this );
	this.m_contentType = null;
	this.m_variable = null;
	this.m_dimension = null;
	this.m_mbfMemberName = null;
	this.m_filterMeasureBased = null;
	this.m_layeredFilterName = null;
	this.m_closeListener = null;
	this.m_beforeFilterChangeListener = null;
	this.m_listenerSelectionChange = null;
	this.m_listenerDisplayChange = null;
	this.m_title = null;
	this.m_selectionMode = null;
	this.m_defaultSelection = null;
	this.m_externalValueHelpProcess = null;
	this.m_dimensionDisplayInfo = null;
};
oFF.FilterDialogConfig.prototype.getContentType = function()
{
	return this.m_contentType;
};
oFF.FilterDialogConfig.prototype.getVariable = function()
{
	return this.m_variable;
};
oFF.FilterDialogConfig.prototype.getDimension = function()
{
	return this.m_dimension;
};
oFF.FilterDialogConfig.prototype.getMeasureBasedFilterMember = function()
{
	return this.m_mbfMemberName;
};
oFF.FilterDialogConfig.prototype.getMeasureBasedFilter = function()
{
	return this.m_filterMeasureBased;
};
oFF.FilterDialogConfig.prototype.isOpenWithDynamicFilter = function()
{
	return this.m_isOpenWithDynamicFilter;
};
oFF.FilterDialogConfig.prototype.isOpenWithLayeredFilter = function()
{
	return !this.m_isOpenWithDynamicFilter && oFF.XStringUtils.isNotNullAndNotEmpty(this.m_layeredFilterName);
};
oFF.FilterDialogConfig.prototype.getLayeredFilterName = function()
{
	return this.m_layeredFilterName;
};
oFF.FilterDialogConfig.prototype.getCloseListener = function()
{
	return this.m_closeListener;
};
oFF.FilterDialogConfig.prototype.getBeforeFilterChangeListener = function()
{
	return this.m_beforeFilterChangeListener;
};
oFF.FilterDialogConfig.prototype.getListenerSelectionChange = function()
{
	return this.m_listenerSelectionChange;
};
oFF.FilterDialogConfig.prototype.getListenerDisplayChange = function()
{
	return this.m_listenerDisplayChange;
};
oFF.FilterDialogConfig.prototype.getTitle = function()
{
	return this.m_title;
};
oFF.FilterDialogConfig.prototype.getSelectionMode = function()
{
	return this.m_selectionMode;
};
oFF.FilterDialogConfig.prototype.isSelectionRequired = function()
{
	return this.m_selectionRequired;
};
oFF.FilterDialogConfig.prototype.isResizeable = function()
{
	return this.m_resizeable;
};
oFF.FilterDialogConfig.prototype.getDefaultSelection = function()
{
	return this.m_defaultSelection;
};
oFF.FilterDialogConfig.prototype.isAlwaysShowSelectionContainer = function()
{
	return this.m_alwaysShowSelectionContainer;
};
oFF.FilterDialogConfig.prototype.getExternalValueHelpProcess = function()
{
	return this.m_externalValueHelpProcess;
};
oFF.FilterDialogConfig.prototype.isOfferExclude = function()
{
	return this.m_offerExclude;
};
oFF.FilterDialogConfig.prototype.isOfferListView = function()
{
	return this.m_offerListView;
};
oFF.FilterDialogConfig.prototype.isOfferRangeView = function()
{
	return this.m_offerRangeView;
};
oFF.FilterDialogConfig.prototype.isOfferFunctionalValuesView = function()
{
	return this.m_offerFunctionalValuesView;
};
oFF.FilterDialogConfig.prototype.getListPageSize = function()
{
	return this.m_listPageSize;
};
oFF.FilterDialogConfig.prototype.getListPreloadPageCount = function()
{
	return this.m_listPreloadPageCount;
};
oFF.FilterDialogConfig.prototype.getListSearchSize = function()
{
	return this.m_listSearchSize;
};
oFF.FilterDialogConfig.prototype.getListChildNodePageSize = function()
{
	return this.m_listChildNodePageSize;
};
oFF.FilterDialogConfig.prototype.getDimensionDisplayInfo = function()
{
	return this.m_dimensionDisplayInfo;
};
oFF.FilterDialogConfig.prototype.isOfferClipboard = function()
{
	return this.m_offerClipboard;
};
oFF.FilterDialogConfig.prototype.isOfferHierarchyChange = function()
{
	return this.m_offerHierarchyChange;
};
oFF.FilterDialogConfig.prototype.isOfferEqualInRangeFilter = function()
{
	return this.m_offerEqualInRangeFilter;
};
oFF.FilterDialogConfig.prototype.getDynamicDateRangeMaxYears = function()
{
	return this.m_dynamicDateRangeMaxYears;
};

oFF.FilterDialogContentType = function() {};
oFF.FilterDialogContentType.prototype = new oFF.XConstant();
oFF.FilterDialogContentType.prototype._ff_c = "FilterDialogContentType";

oFF.FilterDialogContentType.VARIABLE = null;
oFF.FilterDialogContentType.DIMENSION = null;
oFF.FilterDialogContentType.HIERARCHY_CATALOG = null;
oFF.FilterDialogContentType.MEASURE_BASED_FILTER = null;
oFF.FilterDialogContentType.staticSetup = function()
{
	oFF.FilterDialogContentType.VARIABLE = oFF.XConstant.setupName(new oFF.FilterDialogContentType(), "Variable");
	oFF.FilterDialogContentType.DIMENSION = oFF.XConstant.setupName(new oFF.FilterDialogContentType(), "Dimension");
	oFF.FilterDialogContentType.HIERARCHY_CATALOG = oFF.XConstant.setupName(new oFF.FilterDialogContentType(), "HierarchyCatalog");
	oFF.FilterDialogContentType.MEASURE_BASED_FILTER = oFF.XConstant.setupName(new oFF.FilterDialogContentType(), "MeasureBasedFilter");
};
oFF.FilterDialogContentType.prototype.isValueHelp = function()
{
	return this.isVariableValueHelp() || this.isDimensionMemberValueHelp();
};
oFF.FilterDialogContentType.prototype.isVariableValueHelp = function()
{
	return this.isEqualTo(oFF.FilterDialogContentType.VARIABLE);
};
oFF.FilterDialogContentType.prototype.isDimensionMemberValueHelp = function()
{
	return this.isEqualTo(oFF.FilterDialogContentType.DIMENSION);
};
oFF.FilterDialogContentType.prototype.isHierarchyCatalog = function()
{
	return this.isEqualTo(oFF.FilterDialogContentType.HIERARCHY_CATALOG);
};
oFF.FilterDialogContentType.prototype.isMeasureBasedFilter = function()
{
	return this.isEqualTo(oFF.FilterDialogContentType.MEASURE_BASED_FILTER);
};
oFF.FilterDialogContentType.prototype.isBackendDriven = function()
{
	return this.isValueHelp() || this.isHierarchyCatalog();
};

oFF.FilterDialogDimensionDisplayInfo = function() {};
oFF.FilterDialogDimensionDisplayInfo.prototype = new oFF.XConstant();
oFF.FilterDialogDimensionDisplayInfo.prototype._ff_c = "FilterDialogDimensionDisplayInfo";

oFF.FilterDialogDimensionDisplayInfo.ID = null;
oFF.FilterDialogDimensionDisplayInfo.DESCRIPTION = null;
oFF.FilterDialogDimensionDisplayInfo.ID_AND_DESCRIPTION = null;
oFF.FilterDialogDimensionDisplayInfo.QUERY_DEFAULT = null;
oFF.FilterDialogDimensionDisplayInfo.s_lookup = null;
oFF.FilterDialogDimensionDisplayInfo.staticSetup = function()
{
	oFF.FilterDialogDimensionDisplayInfo.s_lookup = oFF.XHashMapByString.create();
	oFF.FilterDialogDimensionDisplayInfo.ID = oFF.FilterDialogDimensionDisplayInfo.crateDimDisplayInfo("id");
	oFF.FilterDialogDimensionDisplayInfo.DESCRIPTION = oFF.FilterDialogDimensionDisplayInfo.crateDimDisplayInfo("description");
	oFF.FilterDialogDimensionDisplayInfo.ID_AND_DESCRIPTION = oFF.FilterDialogDimensionDisplayInfo.crateDimDisplayInfo("idAndDescription");
	oFF.FilterDialogDimensionDisplayInfo.QUERY_DEFAULT = oFF.FilterDialogDimensionDisplayInfo.crateDimDisplayInfo("queryDefault");
};
oFF.FilterDialogDimensionDisplayInfo.crateDimDisplayInfo = function(name)
{
	var dimDisplayInfo = oFF.XConstant.setupName(new oFF.FilterDialogDimensionDisplayInfo(), name);
	oFF.FilterDialogDimensionDisplayInfo.s_lookup.put(oFF.XString.toLowerCase(name), dimDisplayInfo);
	return dimDisplayInfo;
};
oFF.FilterDialogDimensionDisplayInfo.lookup = function(name)
{
	return oFF.FilterDialogDimensionDisplayInfo.s_lookup.getByKey(oFF.XString.toLowerCase(name));
};
oFF.FilterDialogDimensionDisplayInfo.prototype.showId = function()
{
	return this === oFF.FilterDialogDimensionDisplayInfo.ID || this === oFF.FilterDialogDimensionDisplayInfo.ID_AND_DESCRIPTION;
};
oFF.FilterDialogDimensionDisplayInfo.prototype.showDescription = function()
{
	return this === oFF.FilterDialogDimensionDisplayInfo.DESCRIPTION || this === oFF.FilterDialogDimensionDisplayInfo.ID_AND_DESCRIPTION;
};

oFF.FilterDialogViewType = function() {};
oFF.FilterDialogViewType.prototype = new oFF.XConstant();
oFF.FilterDialogViewType.prototype._ff_c = "FilterDialogViewType";

oFF.FilterDialogViewType.s_allTypes = null;
oFF.FilterDialogViewType.LIST = null;
oFF.FilterDialogViewType.RANGE = null;
oFF.FilterDialogViewType.MEASURE_BASED_FILTER = null;
oFF.FilterDialogViewType.FUNCTIONAL_VALUES = null;
oFF.FilterDialogViewType.staticSetup = function()
{
	oFF.FilterDialogViewType.s_allTypes = oFF.XHashMapByString.create();
	oFF.FilterDialogViewType.LIST = oFF.FilterDialogViewType.setupFilterType("List");
	oFF.FilterDialogViewType.RANGE = oFF.FilterDialogViewType.setupFilterType("Range");
	oFF.FilterDialogViewType.MEASURE_BASED_FILTER = oFF.FilterDialogViewType.setupFilterType("MeasureBasedFilter");
	oFF.FilterDialogViewType.FUNCTIONAL_VALUES = oFF.FilterDialogViewType.setupFilterType("FunctionalValues");
};
oFF.FilterDialogViewType.setupFilterType = function(name)
{
	var filterType = oFF.XConstant.setupName(new oFF.FilterDialogViewType(), name);
	oFF.FilterDialogViewType.s_allTypes.put(name, filterType);
	return filterType;
};
oFF.FilterDialogViewType.getByName = function(name)
{
	return oFF.FilterDialogViewType.s_allTypes.getByKey(name);
};
oFF.FilterDialogViewType.getAllFilterTypes = function()
{
	return oFF.FilterDialogViewType.s_allTypes.getValuesAsReadOnlyList();
};
oFF.FilterDialogViewType.prototype.isSupportedByDim = function(dimension)
{
	if (oFF.notNull(dimension))
	{
		if (this === oFF.FilterDialogViewType.LIST)
		{
			return true;
		}
		if (this === oFF.FilterDialogViewType.RANGE)
		{
			var valueType = dimension.getFlatKeyField().getValueType();
			return valueType.isNumber() || (!dimension.getFiscalEnabled() && !dimension.isUserManaged() && !dimension.isTimeConfigEnablePattern() && (valueType.isDateBased() || oFF.HierarchyLevelType.getHighestDateRangeGranularity(dimension) !== null));
		}
		if (this === oFF.FilterDialogViewType.MEASURE_BASED_FILTER)
		{
			return dimension.isStructure() && dimension.getQueryModel().getModelCapabilities().supportsFilterMeasureBased();
		}
		if (this === oFF.FilterDialogViewType.FUNCTIONAL_VALUES)
		{
			return dimension.getModelCapabilities().supportsFunctionalValueHelp();
		}
	}
	return false;
};

oFF.FilterDialogValueType = function() {};
oFF.FilterDialogValueType.prototype = new oFF.XConstant();
oFF.FilterDialogValueType.prototype._ff_c = "FilterDialogValueType";

oFF.FilterDialogValueType.BASIC = null;
oFF.FilterDialogValueType.VALUEHELP = null;
oFF.FilterDialogValueType.RANGE = null;
oFF.FilterDialogValueType.DATE_RANGE_DYNAMIC = null;
oFF.FilterDialogValueType.DATE_RANGE_FIXED = null;
oFF.FilterDialogValueType.HIERARCHY_CATALOG = null;
oFF.FilterDialogValueType.VALUEHELP_FUNCTION = null;
oFF.FilterDialogValueType.staticSetup = function()
{
	oFF.FilterDialogValueType.BASIC = oFF.XConstant.setupName(new oFF.FilterDialogValueType(), "basic");
	oFF.FilterDialogValueType.VALUEHELP = oFF.XConstant.setupName(new oFF.FilterDialogValueType(), "valueHelp");
	oFF.FilterDialogValueType.RANGE = oFF.XConstant.setupName(new oFF.FilterDialogValueType(), "range");
	oFF.FilterDialogValueType.DATE_RANGE_DYNAMIC = oFF.XConstant.setupName(new oFF.FilterDialogValueType(), "dateRangeDynamic");
	oFF.FilterDialogValueType.DATE_RANGE_FIXED = oFF.XConstant.setupName(new oFF.FilterDialogValueType(), "dateRangeFixed");
	oFF.FilterDialogValueType.HIERARCHY_CATALOG = oFF.XConstant.setupName(new oFF.FilterDialogValueType(), "hierarchyCatalog");
	oFF.FilterDialogValueType.VALUEHELP_FUNCTION = oFF.XConstant.setupName(new oFF.FilterDialogValueType(), "valueHelpFunction");
};

oFF.OlapUiReadMode = function() {};
oFF.OlapUiReadMode.prototype = new oFF.XConstant();
oFF.OlapUiReadMode.prototype._ff_c = "OlapUiReadMode";

oFF.OlapUiReadMode.BOOKED = null;
oFF.OlapUiReadMode.MASTER = null;
oFF.OlapUiReadMode.QUERY_DEFAULT = null;
oFF.OlapUiReadMode.staticSetup = function()
{
	oFF.OlapUiReadMode.BOOKED = oFF.XConstant.setupName(new oFF.OlapUiReadMode(), "booked");
	oFF.OlapUiReadMode.MASTER = oFF.XConstant.setupName(new oFF.OlapUiReadMode(), "master");
	oFF.OlapUiReadMode.QUERY_DEFAULT = oFF.XConstant.setupName(new oFF.OlapUiReadMode(), "default");
};

oFF.DfOuDialogProgram = function() {};
oFF.DfOuDialogProgram.prototype = new oFF.DfUiDialogProgram();
oFF.DfOuDialogProgram.prototype._ff_c = "DfOuDialogProgram";

oFF.DfOuDialogProgram.PARAM_QUERY_MANAGER = "queryManager";
oFF.DfOuDialogProgram.PARAM_QUERY_MANAGER_NAME = "queryManagerName";
oFF.DfOuDialogProgram.PARAM_OK_PROCEDURE = "okProcedure";
oFF.DfOuDialogProgram.PARAM_CANCEL_PROCEDURE = "cancelProcedure";
oFF.DfOuDialogProgram.prototype.m_queryManager = null;
oFF.DfOuDialogProgram.prototype.m_okProcedure = null;
oFF.DfOuDialogProgram.prototype.m_cancelProcedure = null;
oFF.DfOuDialogProgram.prototype.releaseObject = function()
{
	this.m_queryManager = null;
	this.m_okProcedure = null;
	this.m_cancelProcedure = null;
	oFF.DfUiDialogProgram.prototype.releaseObject.call( this );
};
oFF.DfOuDialogProgram.prototype.prepareProgramMetadata = function(metadata)
{
	metadata.addParameter(oFF.DfOuDialogProgram.PARAM_QUERY_MANAGER, "The query manager.");
	metadata.addParameter(oFF.DfOuDialogProgram.PARAM_QUERY_MANAGER_NAME, "The name of the query manager (String)");
	metadata.addParameter(oFF.DfOuDialogProgram.PARAM_OK_PROCEDURE, "A procedure to notify the caller when the ok button was pressed.");
	metadata.addParameter(oFF.DfOuDialogProgram.PARAM_CANCEL_PROCEDURE, "A procedure to notify the caller when the cancel button was pressed.");
	this.prepareOlapDialogMetadata(metadata);
};
oFF.DfOuDialogProgram.prototype.processArguments = function(args)
{
	var prgArgs = this.getArguments();
	if (oFF.isNull(this.m_queryManager))
	{
		this.m_queryManager = prgArgs.getXObjectByKey(oFF.DfOuDialogProgram.PARAM_QUERY_MANAGER);
		if (oFF.isNull(this.m_queryManager) && args.containsKey(oFF.DfOuDialogProgram.PARAM_QUERY_MANAGER_NAME))
		{
			var parentProcess = this.getProcess().getParentProcess();
			if (oFF.notNull(parentProcess))
			{
				var application = parentProcess.getApplication();
				if (oFF.notNull(application))
				{
					var olapEnv = application.getOlapEnvironment();
					if (oFF.notNull(olapEnv))
					{
						this.m_queryManager = olapEnv.getQueryManagerByName(args.getStringByKey(oFF.DfOuDialogProgram.PARAM_QUERY_MANAGER_NAME));
					}
				}
			}
		}
	}
	this.m_okProcedure = prgArgs.getXObjectByKey(oFF.DfOuDialogProgram.PARAM_OK_PROCEDURE);
	this.m_cancelProcedure = prgArgs.getXObjectByKey(oFF.DfOuDialogProgram.PARAM_CANCEL_PROCEDURE);
	this.processOlapDialogArguments(prgArgs);
};
oFF.DfOuDialogProgram.prototype.assertQueryManagerSet = function()
{
	if (oFF.isNull(this.m_queryManager))
	{
		throw oFF.XException.createRuntimeException("Missing query manager!");
	}
};
oFF.DfOuDialogProgram.prototype.getQueryManager = function()
{
	return this.m_queryManager;
};
oFF.DfOuDialogProgram.prototype.setQueryManager = function(queryManager)
{
	this.m_queryManager = queryManager;
};
oFF.DfOuDialogProgram.prototype.notifyOkPressed = function()
{
	if (oFF.notNull(this.m_okProcedure))
	{
		this.m_okProcedure.execute();
	}
};
oFF.DfOuDialogProgram.prototype.notifyCancelPressed = function()
{
	if (oFF.notNull(this.m_cancelProcedure))
	{
		this.m_cancelProcedure.execute();
	}
};

oFF.FilterDialog = function() {};
oFF.FilterDialog.prototype = new oFF.DfOuDialogProgram();
oFF.FilterDialog.prototype._ff_c = "FilterDialog";

oFF.FilterDialog.DEFAULT_PROGRAM_NAME_DIMENSION = "FilterDialogDimension";
oFF.FilterDialog.DEFAULT_PROGRAM_NAME_VARIABLE = "FilterDialogVariable";
oFF.FilterDialog.DEFAULT_PROGRAM_NAME_HIERARCHY_CATALOG = "FilterDialogHierarchyCatalog";
oFF.FilterDialog.DEFAULT_PROGRAM_NAME_MEASURE_BASED_FILTER = "FilterDialogMeasureBasedFilter";
oFF.FilterDialog.PARAM_VARIABLE_NAME = "variableName";
oFF.FilterDialog.PARAM_VARIABLE = "variable";
oFF.FilterDialog.PARAM_DIMENSION_NAME = "dimensionName";
oFF.FilterDialog.PARAM_MBF_MEMBER_NAME = "measureBasedFilterMemberName";
oFF.FilterDialog.PARAM_MBF = "measureBasedFilter";
oFF.FilterDialog.PARAM_OPEN_WITH_DYNAMIC_FILTER = "openWithDynamicFilter";
oFF.FilterDialog.PARAM_LAYERED_FILTER_NAME = "layeredFilterName";
oFF.FilterDialog.PARAM_LISTENER_CLOSE = "closeListener";
oFF.FilterDialog.PARAM_LISTENER_BEFORE_FILTER_CHANGE = "beforeFilterChangeListener";
oFF.FilterDialog.PARAM_LISTENER_SELECTION_CHANGE = "listenerSelectionChange";
oFF.FilterDialog.PARAM_LISTENER_DISPLAY_CHANGE = "listenerDisplayChange";
oFF.FilterDialog.PARAM_TITLE = "title";
oFF.FilterDialog.PARAM_SELECTION_MODE = "selectionMode";
oFF.FilterDialog.PARAM_SELECTION_REQUIRED = "selectionRequired";
oFF.FilterDialog.PARAM_RESIZABLE = "resizeable";
oFF.FilterDialog.PARAM_DEFAULT_SELECTION = "defaultSelection";
oFF.FilterDialog.PARAM_ALWAYS_SHOW_SELECTION_CONTAINER = "alwaysShowSelectionContainer";
oFF.FilterDialog.PARAM_EXTERNAL_VALUEHELP_PROCESS = "externalValueHelpProcess";
oFF.FilterDialog.PARAM_OFFER_EXCLUDE = "offerExclude";
oFF.FilterDialog.PARAM_OFFER_LIST_VIEW = "offerListView";
oFF.FilterDialog.PARAM_OFFER_RANGE_VIEW = "offerRangeView";
oFF.FilterDialog.PARAM_OFFER_FUNCTIONAL_VALUES_VIEW = "offerFunctionalValuesView";
oFF.FilterDialog.PARAM_LIST_PAGE_SIZE = "lisPageSize";
oFF.FilterDialog.PARAM_LIST_PRELOAD_PAGE_COUNT = "listPreloadPageCount";
oFF.FilterDialog.PARAM_LIST_SEARCH_SIZE = "listSearchSize";
oFF.FilterDialog.PARAM_LIST_CHILD_NODES_PAGE_SIZE = "childNodesPageSize";
oFF.FilterDialog.PARAM_DIMENSION_DISPLAY_INFO = "dimensionDisplayInfo";
oFF.FilterDialog.PARAM_OFFER_CLIPBOARD = "offerClipboard";
oFF.FilterDialog.PARAM_OFFER_HIERARCHY_CHANGE = "offerHierarchyChange";
oFF.FilterDialog.PARAM_OFFER_EQUAL_IN_RANGE_FILTER = "offerEqualInRangeFilter";
oFF.FilterDialog.PARAM_DYNAMIC_DATE_RANGE_MAX_YEARS = "dynamicDateRangeMaxYears";
oFF.FilterDialog.prototype.m_config = null;
oFF.FilterDialog.prototype.releaseObject = function()
{
	oFF.DfOuDialogProgram.prototype.releaseObject.call( this );
	this.m_config = oFF.XObjectExt.release(this.m_config);
};
oFF.FilterDialog.prototype.prepareOlapDialogMetadata = function(metadata)
{
	metadata.addParameter(oFF.FilterDialog.PARAM_VARIABLE_NAME, "The name of the variable to open the dialog for (String)");
	metadata.addParameter(oFF.FilterDialog.PARAM_VARIABLE, "The variable to open the dialog for. There is no query manager available in planning sequences and therefore the variable must be transferred via this object parameter (Object)");
	metadata.addParameter(oFF.FilterDialog.PARAM_DIMENSION_NAME, "The name of the dimension to open the dialog for (String)");
	metadata.addParameter(oFF.FilterDialog.PARAM_MBF_MEMBER_NAME, "The name of the structure/dimension member to open the measure based filter dialog for (String)");
	metadata.addParameter(oFF.FilterDialog.PARAM_MBF, "The measure based filter to open the filter dialog for. The MBF member name and either this or a layered filter name must be set. (Object)");
	metadata.addParameter(oFF.FilterDialog.PARAM_OPEN_WITH_DYNAMIC_FILTER, "Whether the dialog should parse and update the dynamic filter (Boolean)");
	metadata.addParameter(oFF.FilterDialog.PARAM_LAYERED_FILTER_NAME, "Whether the dialog should parse and update a specific layered filter (String)");
	metadata.addParameter(oFF.FilterDialog.PARAM_LISTENER_CLOSE, "A close listener (Object)");
	metadata.addParameter(oFF.FilterDialog.PARAM_LISTENER_BEFORE_FILTER_CHANGE, "A listener triggered just before the filter is updated, only if dynamic or layered filter parameter is set (Object)");
	metadata.addParameter(oFF.FilterDialog.PARAM_LISTENER_SELECTION_CHANGE, "A listener for selection changes (Object)");
	metadata.addParameter(oFF.FilterDialog.PARAM_LISTENER_DISPLAY_CHANGE, "A listener for display changs inside the dialog (Object)");
	metadata.addParameter(oFF.FilterDialog.PARAM_TITLE, "The dialog title (String)");
	metadata.addParameter(oFF.FilterDialog.PARAM_SELECTION_MODE, "The name of the dialog UI selection mode (String)");
	metadata.addParameter(oFF.FilterDialog.PARAM_SELECTION_REQUIRED, "Whether a selection is required (Boolean)");
	metadata.addParameter(oFF.FilterDialog.PARAM_RESIZABLE, "Whether the dialog should be resizeable (Boolean)");
	metadata.addParameter(oFF.FilterDialog.PARAM_DEFAULT_SELECTION, "A list of values selected by default (Object)");
	metadata.addParameter(oFF.FilterDialog.PARAM_ALWAYS_SHOW_SELECTION_CONTAINER, "Whether the selection list should always be visible in the dialog (Boolean)");
	metadata.addParameter(oFF.FilterDialog.PARAM_EXTERNAL_VALUEHELP_PROCESS, "A modified value help process (Boolean)");
	metadata.addParameter(oFF.FilterDialog.PARAM_OFFER_EXCLUDE, "Whether an exclude toggle should be available (Boolean)");
	metadata.addParameter(oFF.FilterDialog.PARAM_OFFER_LIST_VIEW, "Whether a list of members should be available for selection (Boolean)");
	metadata.addParameter(oFF.FilterDialog.PARAM_OFFER_RANGE_VIEW, "Whether it should be possible to view and define range values (Boolean)");
	metadata.addParameter(oFF.FilterDialog.PARAM_OFFER_FUNCTIONAL_VALUES_VIEW, "Whether functional values should be available for selection (Boolean)");
	metadata.addParameter(oFF.FilterDialog.PARAM_LIST_PAGE_SIZE, "The page size in a list view (Integer)");
	metadata.addParameter(oFF.FilterDialog.PARAM_LIST_PRELOAD_PAGE_COUNT, "The pages preloaded in a list view (Integer)");
	metadata.addParameter(oFF.FilterDialog.PARAM_LIST_SEARCH_SIZE, "The amount of values searched in a list view (Integer)");
	metadata.addParameter(oFF.FilterDialog.PARAM_LIST_CHILD_NODES_PAGE_SIZE, "The page size of children in a tree (Integer)");
	metadata.addParameter(oFF.FilterDialog.PARAM_DIMENSION_DISPLAY_INFO, "The dimension display info in a list, e.g. id or description (String)");
	metadata.addParameter(oFF.FilterDialog.PARAM_OFFER_CLIPBOARD, "Whether a clipboard for copy paste functionality should be available (Boolean)");
	metadata.addParameter(oFF.FilterDialog.PARAM_OFFER_HIERARCHY_CHANGE, "Whether changing the hierarchy should be available (Boolean)");
	metadata.addParameter(oFF.FilterDialog.PARAM_OFFER_EQUAL_IN_RANGE_FILTER, "Whether comparison operator EQUAL should be availble in range view (Boolean)");
	metadata.addParameter(oFF.FilterDialog.PARAM_DYNAMIC_DATE_RANGE_MAX_YEARS, "The max amount of years for look back and ahead in dynamic date ranges (Integer)");
};
oFF.FilterDialog.prototype.processOlapDialogArguments = function(args)
{
	this.m_config = oFF.FilterDialogConfig.create(args, this.getQueryManager(), this.getContentType());
	if (!this.m_config.isValid())
	{
		this.kill();
		throw oFF.XException.createIllegalArgumentException("Invalid filter dialog configuration!");
	}
};
oFF.FilterDialog.prototype.setupProgram = function()
{
	return null;
};
oFF.FilterDialog.prototype.isResizeAllowed = function()
{
	return oFF.notNull(this.m_config) && this.m_config.isResizeable();
};
oFF.FilterDialog.prototype.getDefaultContainerSize = function()
{
	if (this.getUiManager().getDeviceInfo().isMobile())
	{
		return oFF.UiSize.createMax();
	}
	return oFF.UiSize.createExt(oFF.UiCssLength.createExt(974, oFF.UiCssSizeUnit.PIXEL), oFF.UiCssLength.createExt(640, oFF.UiCssSizeUnit.PIXEL));
};
oFF.FilterDialog.prototype.getConfig = function()
{
	return this.m_config;
};
oFF.FilterDialog.prototype.getVariableConfig = function()
{
	return this.getContentType() === oFF.FilterDialogContentType.VARIABLE ? this.m_config : null;
};
oFF.FilterDialog.prototype.getDimensionConfig = function()
{
	return this.getContentType() === oFF.FilterDialogContentType.DIMENSION ? this.m_config : null;
};
oFF.FilterDialog.prototype.getHierarchyCatalogConfig = function()
{
	return this.getContentType() === oFF.FilterDialogContentType.HIERARCHY_CATALOG ? this.m_config : null;
};
oFF.FilterDialog.prototype.getMeasureBasedFilterConfig = function()
{
	return this.getContentType() === oFF.FilterDialogContentType.MEASURE_BASED_FILTER ? this.m_config : null;
};

oFF.OlapUiApiModule = function() {};
oFF.OlapUiApiModule.prototype = new oFF.DfModule();
oFF.OlapUiApiModule.prototype._ff_c = "OlapUiApiModule";

oFF.OlapUiApiModule.s_module = null;
oFF.OlapUiApiModule.getInstance = function()
{
	if (oFF.isNull(oFF.OlapUiApiModule.s_module))
	{
		oFF.DfModule.checkInitialized(oFF.UiModule.getInstance());
		oFF.DfModule.checkInitialized(oFF.UiProgramModule.getInstance());
		oFF.DfModule.checkInitialized(oFF.OlapApiModule.getInstance());
		oFF.DfModule.checkInitialized(oFF.HorizonUiApiModule.getInstance());
		oFF.OlapUiApiModule.s_module = oFF.DfModule.startExt(new oFF.OlapUiApiModule());
		oFF.FilterDialogValueType.staticSetup();
		oFF.FilterDialogContentType.staticSetup();
		oFF.FilterDialogDimensionDisplayInfo.staticSetup();
		oFF.DfModule.stopExt(oFF.OlapUiApiModule.s_module);
	}
	return oFF.OlapUiApiModule.s_module;
};
oFF.OlapUiApiModule.prototype.getName = function()
{
	return "ff8005.olap.ui.api";
};

oFF.OlapUiApiModule.getInstance();

return sap.firefly;
	} );