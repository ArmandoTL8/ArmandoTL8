/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
[
"sap/sac/df/firefly/ff2100.runtime","sap/sac/df/firefly/ff4050.processor","sap/sac/df/firefly/ff4200.olap.api","sap/sac/df/firefly/ff3500.sql"
],
function(oFF)
{
"use strict";

oFF.Aggregation = function() {};
oFF.Aggregation.prototype = new oFF.XObject();
oFF.Aggregation.prototype._ff_c = "Aggregation";

oFF.Aggregation.create = function(name, def)
{
	var ag = new oFF.Aggregation();
	ag.m_name = name;
	ag.m_def = def;
	return ag;
};
oFF.Aggregation.prototype.m_name = null;
oFF.Aggregation.prototype.m_def = 0;
oFF.Aggregation.prototype.getName = function()
{
	return this.m_name;
};
oFF.Aggregation.prototype.getDefaultValue = function()
{
	return this.m_def;
};

oFF.OlapDimension = function() {};
oFF.OlapDimension.prototype = new oFF.XObject();
oFF.OlapDimension.prototype._ff_c = "OlapDimension";

oFF.OlapDimension.prototype.m_name = null;
oFF.OlapDimension.prototype.m_type = null;
oFF.OlapDimension.prototype.m_member = null;
oFF.OlapDimension.prototype.getMembers = function()
{
	return this.m_member;
};
oFF.OlapDimension.prototype.setMembers = function(member)
{
	this.m_member = member;
};
oFF.OlapDimension.prototype.getName = function()
{
	return this.m_name;
};
oFF.OlapDimension.prototype.setName = function(name)
{
	this.m_name = name;
};
oFF.OlapDimension.prototype.getType = function()
{
	return this.m_type;
};
oFF.OlapDimension.prototype.setType = function(type)
{
	this.m_type = type;
};

oFF.OlapDimensionMember = function() {};
oFF.OlapDimensionMember.prototype = new oFF.XObject();
oFF.OlapDimensionMember.prototype._ff_c = "OlapDimensionMember";

oFF.OlapDimensionMember.create = function(name)
{
	var member = new oFF.OlapDimensionMember();
	member.setName(name);
	member.setAggregation(oFF.Aggregation.create("avg", 0));
	return member;
};
oFF.OlapDimensionMember.prototype.name = null;
oFF.OlapDimensionMember.prototype.aggregation = null;
oFF.OlapDimensionMember.prototype.m_displayName = null;
oFF.OlapDimensionMember.prototype.m_rawvalue = null;
oFF.OlapDimensionMember.prototype.getAggregation = function()
{
	return this.aggregation;
};
oFF.OlapDimensionMember.prototype.setAggregation = function(aggregation)
{
	this.aggregation = aggregation;
};
oFF.OlapDimensionMember.prototype.getName = function()
{
	return this.name;
};
oFF.OlapDimensionMember.prototype.setName = function(name)
{
	if (oFF.XStringUtils.containsString(name, " ", true))
	{
		throw oFF.XException.createIllegalArgumentException("name contains a space");
	}
	this.name = name;
};
oFF.OlapDimensionMember.prototype.getDisplayName = function()
{
	return oFF.isNull(this.m_displayName) ? this.name : this.m_displayName;
};
oFF.OlapDimensionMember.prototype.setDisplayName = function(name)
{
	this.m_displayName = name;
};
oFF.OlapDimensionMember.prototype.getRawValue = function()
{
	return this.m_rawvalue;
};
oFF.OlapDimensionMember.prototype.setRawValue = function(m_rawvalue)
{
	this.m_rawvalue = m_rawvalue;
};

oFF.OlapFilterToSqlConverter = function() {};
oFF.OlapFilterToSqlConverter.prototype = new oFF.XObject();
oFF.OlapFilterToSqlConverter.prototype._ff_c = "OlapFilterToSqlConverter";

oFF.OlapFilterToSqlConverter.prototype.evaluateSelection = function(selection)
{
	var setOperand = selection.getStructureByKey("SetOperand");
	if (oFF.notNull(setOperand))
	{
		return this.convertSetOperand(setOperand);
	}
	var operator = selection.getStructureByKey("Operator");
	if (oFF.notNull(operator))
	{
		return this.convertOperator(operator);
	}
	var tuplesOperand = selection.getStructureByKey("TuplesOperand");
	if (oFF.notNull(tuplesOperand))
	{
		return this.convertTuplesOperand(tuplesOperand);
	}
	return null;
};
oFF.OlapFilterToSqlConverter.prototype.convertTuplesOperand = function(tuplesOperand)
{
	var orOp = null;
	var fieldNames = tuplesOperand.getListByKey("FieldNames");
	var tuples = tuplesOperand.getListByKey("Tuples");
	for (var t = 0; t < tuples.size(); t++)
	{
		var andOp = null;
		var tuple = tuples.getListAt(t);
		if (fieldNames.size() !== tuple.size())
		{
			throw oFF.XException.createIllegalArgumentException(oFF.SqlOperation.format("Invalid TuplesOperand structure '{0}': expected '{1}' and '{2}' to have the same length", oFF.StringListBuilder.create().add(tuplesOperand.toString()).add(fieldNames.toString()).add(tuple.toString()).build()));
		}
		for (var f = 0; f < fieldNames.size(); f++)
		{
			var fieldName = this.convertOlapFieldNameToSql(fieldNames.getStringAt(f));
			var tOp = oFF.SqlOperation.equals(oFF.SqlReference.create(fieldName), oFF.SqlStringConstant.create(tuple.getStringAt(f)));
			if (oFF.notNull(andOp))
			{
				andOp = oFF.SqlOperation.and(andOp, tOp);
			}
			else
			{
				andOp = tOp;
			}
		}
		if (oFF.notNull(orOp))
		{
			orOp = oFF.SqlOperation.or(orOp, andOp);
		}
		else
		{
			orOp = andOp;
		}
	}
	return orOp;
};
oFF.OlapFilterToSqlConverter.prototype.convertOperator = function(operator)
{
	var op = null;
	var code = operator.getStringByKey("Code");
	var subSelections = operator.getListByKey("SubSelections");
	for (var d = 0; d < subSelections.size(); d++)
	{
		var cop2 = this.evaluateSelection(subSelections.getStructureAt(d));
		if (d === 0)
		{
			if (oFF.XString.isEqual(code, "Not"))
			{
				op = oFF.SqlOperation.not(cop2);
			}
			else
			{
				op = cop2;
			}
		}
		else if (oFF.XString.isEqual(code, "And"))
		{
			op = oFF.SqlOperation.and(op, cop2);
		}
		else if (oFF.XString.isEqual(code, "Or"))
		{
			op = oFF.SqlOperation.or(op, cop2);
		}
		else
		{
			throw oFF.XException.createIllegalArgumentException(oFF.SqlOperation.format("Invalid Operator {0} for multiple arguments", oFF.StringListBuilder.create().add(code).build()));
		}
	}
	if (oFF.isNull(op))
	{
		throw oFF.XException.createIllegalArgumentException(oFF.SqlOperation.format("Invalid Operator {0} for zero arguments", oFF.StringListBuilder.create().add(code).build()));
	}
	return op;
};
oFF.OlapFilterToSqlConverter.prototype.convertSetOperand = function(setOperand)
{
	var op = null;
	var excludes = null;
	var elements = setOperand.getListByKey("Elements");
	var fieldName = this.convertOlapFieldNameToSql(setOperand.getStringByKey("FieldName"));
	for (var c = 0; c < elements.size(); c++)
	{
		var comp = elements.getStructureAt(c).getStringByKey("Comparison");
		var isExcluding = elements.getStructureAt(c).getBooleanByKey("IsExcluding");
		var cop = null;
		var low = null;
		var _low = elements.getStructureAt(c).getStringByKey("Low");
		if (oFF.notNull(_low))
		{
			low = oFF.SqlStringConstant.create(_low);
		}
		if (oFF.isNull(low))
		{
			throw oFF.XException.createIllegalArgumentException("Low of setoperand is empty");
		}
		if (oFF.XString.isEqual(comp, "="))
		{
			cop = oFF.SqlOperation.equals(oFF.SqlReference.create(fieldName), low);
		}
		else if (oFF.XString.isEqual(comp, "<>"))
		{
			cop = oFF.SqlOperation.not(oFF.SqlOperation.equals(oFF.SqlReference.create(fieldName), low));
		}
		else if (oFF.XString.isEqual(comp, "<"))
		{
			cop = oFF.SqlOperation.less(oFF.SqlReference.create(fieldName), low);
		}
		else if (oFF.XString.isEqual(comp, "<="))
		{
			cop = oFF.SqlOperation.lessEqual(oFF.SqlReference.create(fieldName), low);
		}
		else if (oFF.XString.isEqual(comp, ">"))
		{
			cop = oFF.SqlOperation.greater(oFF.SqlReference.create(fieldName), low);
		}
		else if (oFF.XString.isEqual(comp, ">="))
		{
			cop = oFF.SqlOperation.greaterEqual(oFF.SqlReference.create(fieldName), low);
		}
		else if (oFF.XString.isEqual(comp, "LIKE") || oFF.XString.isEqual(comp, "MATCH"))
		{
			if (oFF.notNull(_low))
			{
				low = oFF.SqlStringConstant.create(oFF.XString.replace(oFF.XString.replace(_low, "*", "%"), "?", "_"));
			}
			cop = oFF.SqlOperation.like(oFF.SqlReference.create(fieldName), low);
		}
		else if (oFF.XString.isEqual(comp, "NOT_MATCH"))
		{
			if (oFF.notNull(_low))
			{
				low = oFF.SqlStringConstant.create(oFF.XString.replace(oFF.XString.replace(_low, "*", "%"), "?", "_"));
			}
			cop = oFF.SqlOperation.not(oFF.SqlOperation.like(oFF.SqlReference.create(fieldName), low));
		}
		if (oFF.notNull(cop))
		{
			if (isExcluding)
			{
				if (oFF.isNull(excludes))
				{
					excludes = oFF.SqlOperation.not(cop);
				}
				else
				{
					excludes = oFF.SqlOperation.and(excludes, oFF.SqlOperation.not(cop));
				}
			}
			else
			{
				if (oFF.isNull(op))
				{
					op = cop;
				}
				else
				{
					op = oFF.SqlOperation.or(op, cop);
				}
			}
		}
	}
	if (oFF.notNull(excludes))
	{
		if (oFF.isNull(op))
		{
			return excludes;
		}
		else
		{
			return oFF.SqlOperation.and(op, excludes);
		}
	}
	return op;
};
oFF.OlapFilterToSqlConverter.prototype.convertOlapFieldNameToSql = function(fieldName)
{
	return oFF.XString.substring(fieldName, 0, oFF.XString.lastIndexOf(fieldName, "."));
};

oFF.OlapFormulaToSql = {

	convert:function(formula)
	{
			var _function = formula.getStructureByKey("Function");
		if (oFF.notNull(_function))
		{
			return oFF.OlapFormulaToSql.convertFunction(_function);
		}
		var constant = formula.getStructureByKey("Constant");
		if (oFF.notNull(constant))
		{
			return oFF.OlapFormulaToSql.convertConstant(constant);
		}
		var member = formula.getStructureByKey("Member");
		if (oFF.notNull(member))
		{
			return oFF.OlapFormulaToSql.convertMember(member);
		}
		return null;
	},
	convertMember:function(member)
	{
			var name = member.getStringByKey("Name");
		return oFF.SqlAggregateFunction.create("sum", oFF.SqlReference.create(name)).toSqlString(new oFF.SqlCodeGenOptions());
	},
	convertConstant:function(constant)
	{
			var valueType = constant.getStringByKey("ValueType");
		if (oFF.XString.isEqual(valueType, "Number"))
		{
			var dvalue = constant.getDoubleByKey("Value");
			return oFF.SqlDoubleConstant.create(dvalue).toSqlString(new oFF.SqlCodeGenOptions());
		}
		if (oFF.XString.isEqual(valueType, "String"))
		{
			var svalue = constant.getStringByKey("Value");
			return oFF.SqlStringConstant.create(svalue).toSqlString(new oFF.SqlCodeGenOptions());
		}
		return null;
	},
	convertFunction:function(_function)
	{
			var name = oFF.XString.toUpperCase(_function.getStringByKey("Name"));
		var parameters = _function.getListByKey("Parameters");
		var bops = oFF.StringListBuilder.create().add("+").add("-").add("*").add("/").add("<").add(">").add("<=").add(">=").add("!=").build();
		var i;
		for (i = 0; i < bops.size(); i++)
		{
			if (oFF.XString.isEqual(name, bops.get(i)))
			{
				return oFF.SqlOperation.format("({0}) {1} ({2})", oFF.StringListBuilder.create().add(oFF.OlapFormulaToSql.convert(parameters.getStructureAt(0))).add(name).add(oFF.OlapFormulaToSql.convert(parameters.getStructureAt(1))).build());
			}
		}
		var bops2 = new oFF.StringMapBuilder().init().put("==", oFF.XStringValue.create("=")).put("AND", oFF.XStringValue.create("&")).put("OR", oFF.XStringValue.create("|")).put("XOR", oFF.XStringValue.create("^")).build();
		for (i = 0; i < bops2.size(); i++)
		{
			if (oFF.XString.isEqual(name, bops2.getKeysAsReadOnlyListOfString().get(i)))
			{
				return oFF.SqlOperation.format("({0}) {1} ({2})", oFF.StringListBuilder.create().add(oFF.OlapFormulaToSql.convert(parameters.getStructureAt(0))).add(bops2.getValuesAsReadOnlyList().get(i).getString()).add(oFF.OlapFormulaToSql.convert(parameters.getStructureAt(1))).build());
			}
		}
		var funcs = new oFF.StringMapBuilder().init().put("**", oFF.SqlFunctionDescription.create("POWER", 2)).put("LOG", oFF.SqlFunctionDescription.create("LOG", 1)).put("EXP", oFF.SqlFunctionDescription.create("EXP", 1)).put("ROUND", oFF.SqlFunctionDescription.create("ROUND", 1)).put("FLOOR", oFF.SqlFunctionDescription.create("FLOOR", 1)).put("CEIL", oFF.SqlFunctionDescription.create("CEIL", 1)).put("SQRT", oFF.SqlFunctionDescription.create("SQRT", 1)).put("LOG10", oFF.SqlFunctionDescription.create("LOG10", 1)).put("ABS", oFF.SqlFunctionDescription.create("ABS", 1)).put("TRUNCATE", oFF.SqlFunctionDescription.create("TRUNC", 1)).put("SIN", oFF.SqlFunctionDescription.create("SIN", 1)).put("COS", oFF.SqlFunctionDescription.create("COS", 1)).put("TAN", oFF.SqlFunctionDescription.create("TAN", 1)).put("ASIN", oFF.SqlFunctionDescription.create("ASIN", 1)).put("ACOS", oFF.SqlFunctionDescription.create("ACOS", 1)).put("ATAN", oFF.SqlFunctionDescription.create("ATAN", 1)).put("SINH", oFF.SqlFunctionDescription.create("SINH", 1)).put("COSH", oFF.SqlFunctionDescription.create("COSH", 1)).put("TANH", oFF.SqlFunctionDescription.create("TANH", 1)).put("DIV", oFF.SqlFunctionDescription.create("DIV", 1)).put("NOT", oFF.SqlFunctionDescription.create("~", 1)).put("SIGN", oFF.SqlFunctionDescription.create("SIGN", 1)).put("MOD", oFF.SqlFunctionDescription.create("MOD", 2)).build();
		for (i = 0; i < funcs.size(); i++)
		{
			if (oFF.XString.isEqual(name, funcs.getKeysAsReadOnlyListOfString().get(i)))
			{
				var fbuf = oFF.XStringBuffer.create();
				var desc = funcs.getValuesAsReadOnlyList().get(i);
				fbuf.append(desc.getName());
				fbuf.append("(");
				for (var j = 0; j < desc.getArgs(); j++)
				{
					if (j !== 0)
					{
						fbuf.append(",");
					}
					fbuf.append(oFF.OlapFormulaToSql.convert(parameters.getStructureAt(0)));
				}
				fbuf.append(")");
			}
		}
		if (oFF.XString.isEqual(name, "IF"))
		{
			return oFF.SqlOperation.format("CASE WHEN ({0}) THEN ({1}) ELSE ({2}) END", oFF.StringListBuilder.create().add(oFF.OlapFormulaToSql.convert(parameters.getStructureAt(0))).add(oFF.OlapFormulaToSql.convert(parameters.getStructureAt(1))).add(oFF.OlapFormulaToSql.convert(parameters.getStructureAt(2))).build());
		}
		if (oFF.XString.isEqual(name, "MAX"))
		{
			return oFF.SqlOperation.format("CASE WHEN ({0}) > ({1}) THEN ({0}) ELSE ({1}) END", oFF.StringListBuilder.create().add(oFF.OlapFormulaToSql.convert(parameters.getStructureAt(0))).add(oFF.OlapFormulaToSql.convert(parameters.getStructureAt(1))).build());
		}
		if (oFF.XString.isEqual(name, "MIN"))
		{
			return oFF.SqlOperation.format("CASE WHEN ({0}) < ({1}) THEN ({0}) ELSE ({1}) END", oFF.StringListBuilder.create().add(oFF.OlapFormulaToSql.convert(parameters.getStructureAt(0))).add(oFF.OlapFormulaToSql.convert(parameters.getStructureAt(1))).build());
		}
		if (oFF.XString.isEqual(name, "MAX0"))
		{
			return oFF.SqlOperation.format("CASE WHEN ({0}) > ({1}) THEN ({0}) ELSE ({1}) END", oFF.StringListBuilder.create().add(oFF.OlapFormulaToSql.convert(parameters.getStructureAt(0))).add("0").build());
		}
		if (oFF.XString.isEqual(name, "MIN0"))
		{
			return oFF.SqlOperation.format("CASE WHEN ({0}) < ({1}) THEN ({0}) ELSE ({1}) END", oFF.StringListBuilder.create().add(oFF.OlapFormulaToSql.convert(parameters.getStructureAt(0))).add("0").build());
		}
		return null;
	},
	main:function()
	{
			oFF.OlapEngineModule.getInstance();
		var res = oFF.OlapFormulaToSql.convert(oFF.JsonParserFactory.createFromString("{\"Formula\":{\"Function\":{\"Name\":\"*\",\"Parameters\":[{\"Member\":{\"Name\":\"area\"}},{\"Constant\":{\"Value\":2,\"ValueType\":\"Number\"}}]}},\"Name\":\"Doubler\",\"Visibility\":\"Visible\"}").asStructure().getStructureByKey("Formula"));
		oFF.XString.asString(res);
	}
};

oFF.OlapRequest = function() {};
oFF.OlapRequest.prototype = new oFF.XObject();
oFF.OlapRequest.prototype._ff_c = "OlapRequest";

oFF.OlapRequest.create = function(request, where)
{
	var req = new oFF.OlapRequest();
	req.m_request = request;
	req.m_where = where;
	req.m_mode = 4;
	req.m_source = oFF.SqlReference.create("test");
	req.m_tablealias = "test";
	return req;
};
oFF.OlapRequest.prototype.m_request = null;
oFF.OlapRequest.prototype.m_where = null;
oFF.OlapRequest.prototype.m_mode = 0;
oFF.OlapRequest.prototype.m_source = null;
oFF.OlapRequest.prototype.m_tablealias = null;
oFF.OlapRequest.prototype.setDataSource = function(source, tablealias)
{
	this.m_source = source;
	this.m_tablealias = tablealias;
	return this;
};
oFF.OlapRequest.prototype.ToSql = function()
{
	if (this.m_mode === 4)
	{
		return this.ToSqlWithBooked3();
	}
	return null;
};
oFF.OlapRequest.prototype.ToSqlWithBooked3 = function()
{
	var query = oFF.SqlQuery.create().from(this.m_source);
	if (oFF.notNull(this.m_where) && oFF.XString.size(this.m_where) > 0)
	{
		query.where(this.m_where);
	}
	var queries = oFF.XList.create();
	var tmp = oFF.SqlQuery.create();
	queries.add(tmp);
	var i;
	for (i = 0; i < this.getRequest().size(); ++i)
	{
		if (this.getRequest().get(i).getDim().getType() === oFF.OlapDimensionType.NORMAL)
		{
			var buf2 = oFF.SqlSelectAlias.create(oFF.SqlCast.create(oFF.SqlReference.create2(this.m_tablealias, this.getRequest().get(i).getDim().getName()), "varchar"), this.getRequest().get(i).getDim().getName());
			for (var z = 0, size = queries.size(); z < size; ++z)
			{
				if (this.getRequest().get(i).getHasTotal())
				{
					var oldquery = queries.get(z).cloneQuery();
					oldquery.select(oFF.SqlSelectAlias.create(oFF.SqlStringConstant.create("___INA_SQL_TOTAL"), this.getRequest().get(i).getDim().getName()));
					queries.add(oldquery);
				}
				queries.get(z).select(oFF.SqlSelectAlias.create(oFF.SqlReference.create(this.getRequest().get(i).getDim().getName()), this.getRequest().get(i).getDim().getName()));
				queries.get(z).groupBy(oFF.SqlReference.create(this.getRequest().get(i).getDim().getName()));
			}
			query.select(buf2);
			query.groupBy(oFF.SqlReference.create(this.getRequest().get(i).getDim().getName()));
		}
		else
		{
			var j;
			for (j = 0; j < this.getRequest().get(i).getDim().getMembers().size(); ++j)
			{
				var member = this.getRequest().get(i).getDim().getMembers().get(j);
				var buf = oFF.SqlSelectAlias.create(member.getRawValue() !== null ? member.getRawValue() : oFF.SqlAggregateFunction.create(member.getAggregation().getName(), oFF.SqlReference.create(member.getName())), member.getName());
				for (var y = 0, size2 = queries.size(); y < size2; ++y)
				{
					queries.get(y).select(buf);
				}
				query.select(buf);
			}
		}
	}
	queries.set(0, oFF.SqlQuery.create().selectAll().from(oFF.SqlReference.create("test_with")));
	var withStmt = oFF.SqlWith.create();
	withStmt.addDependency("test_with", query);
	var power2 = 2;
	var power2old = 1;
	for (var x = 1, size3 = queries.size(); x < size3; ++x)
	{
		var newTableName = oFF.XStringUtils.concatenate2("total_", oFF.XInteger.convertToString(x));
		if (x === power2)
		{
			power2old = power2;
			power2 = power2old * 2;
		}
		var res = oFF.XMath.binaryAnd(x, power2old - 1);
		var tablename = res === 0 ? "test_with" : oFF.XStringUtils.concatenate2("total_", oFF.XInteger.convertToString(res));
		withStmt.addDependency(newTableName, queries.get(x).from(oFF.SqlReference.create(tablename)));
		queries.set(x, oFF.SqlQuery.create().selectAll().from(oFF.SqlReference.create(newTableName)));
	}
	if (queries.size() > 1)
	{
		var un = oFF.SqlUnion.create(queries.get(0), queries.get(1));
		for (var ul = 2, size77 = queries.size(); ul < size77; ++ul)
		{
			un = un.unionWith(queries.get(ul));
		}
		withStmt.setBody(un);
	}
	else
	{
		withStmt.setBody(queries.get(0));
	}
	return withStmt.toSqlString(new oFF.SqlCodeGenOptions());
};
oFF.OlapRequest.prototype.getRequest = function()
{
	return this.m_request;
};

oFF.OlapRequestEntry = function() {};
oFF.OlapRequestEntry.prototype = new oFF.XObject();
oFF.OlapRequestEntry.prototype._ff_c = "OlapRequestEntry";

oFF.OlapRequestEntry.prototype.m_dim = null;
oFF.OlapRequestEntry.prototype.m_type = null;
oFF.OlapRequestEntry.prototype.m_followedByTotal = false;
oFF.OlapRequestEntry.prototype.m_hasTotal = false;
oFF.OlapRequestEntry.prototype.m_hasConditionalTotal = false;
oFF.OlapRequestEntry.prototype.getType = function()
{
	return this.m_type;
};
oFF.OlapRequestEntry.prototype.setType = function(type)
{
	this.m_type = type;
};
oFF.OlapRequestEntry.prototype.getDim = function()
{
	return this.m_dim;
};
oFF.OlapRequestEntry.prototype.setDim = function(name)
{
	this.m_dim = name;
};
oFF.OlapRequestEntry.prototype.setFollowedByTotal = function(b)
{
	this.m_followedByTotal = b;
};
oFF.OlapRequestEntry.prototype.getFollowedByTotal = function()
{
	return this.m_followedByTotal;
};
oFF.OlapRequestEntry.prototype.setHasTotal = function(b)
{
	this.m_hasTotal = b;
};
oFF.OlapRequestEntry.prototype.getHasTotal = function()
{
	return this.m_hasTotal;
};
oFF.OlapRequestEntry.prototype.setHasConditionalTotal = function(b)
{
	this.m_hasConditionalTotal = b;
};
oFF.OlapRequestEntry.prototype.getHasConditionalTotal = function()
{
	return this.m_hasConditionalTotal;
};

oFF.OlapResultValue = function() {};
oFF.OlapResultValue.prototype = new oFF.XObject();
oFF.OlapResultValue.prototype._ff_c = "OlapResultValue";

oFF.OlapResultValue.create = function(row, col, value)
{
	var val = new oFF.OlapResultValue();
	val.m_row = row;
	val.m_col = col;
	val.m_value = value;
	return val;
};
oFF.OlapResultValue.prototype.m_row = null;
oFF.OlapResultValue.prototype.m_col = null;
oFF.OlapResultValue.prototype.m_value = null;
oFF.OlapResultValue.prototype.getValue = function()
{
	return this.m_value;
};
oFF.OlapResultValue.prototype.getCol = function()
{
	return this.m_col;
};
oFF.OlapResultValue.prototype.getRow = function()
{
	return this.m_row;
};

oFF.SqlFunctionDescription = function() {};
oFF.SqlFunctionDescription.prototype = new oFF.XObject();
oFF.SqlFunctionDescription.prototype._ff_c = "SqlFunctionDescription";

oFF.SqlFunctionDescription.create = function(name, args)
{
	var ret = new oFF.SqlFunctionDescription();
	ret.setName(name);
	ret.setArgs(args);
	return ret;
};
oFF.SqlFunctionDescription.prototype.m_name = null;
oFF.SqlFunctionDescription.prototype.m_args = 0;
oFF.SqlFunctionDescription.prototype.getName = function()
{
	return this.m_name;
};
oFF.SqlFunctionDescription.prototype.setName = function(name)
{
	this.m_name = name;
};
oFF.SqlFunctionDescription.prototype.getArgs = function()
{
	return this.m_args;
};
oFF.SqlFunctionDescription.prototype.setArgs = function(args)
{
	this.m_args = args;
};

oFF.GenericAttributeBuilder = function() {};
oFF.GenericAttributeBuilder.prototype = new oFF.XObject();
oFF.GenericAttributeBuilder.prototype._ff_c = "GenericAttributeBuilder";

oFF.GenericAttributeBuilder.create = function()
{
	return new oFF.GenericAttributeBuilder().init();
};
oFF.GenericAttributeBuilder.prototype.init = function()
{
	this.m_values = oFF.XList.create();
	return this.setObtainability(oFF.ObtainabilityType.ALWAYS).setIsKey(false).setIsFilterable(true);
};
oFF.GenericAttributeBuilder.prototype.m_name = null;
oFF.GenericAttributeBuilder.prototype.m_description = null;
oFF.GenericAttributeBuilder.prototype.m_values = null;
oFF.GenericAttributeBuilder.prototype.m_isKey = false;
oFF.GenericAttributeBuilder.prototype.m_obtainibility = null;
oFF.GenericAttributeBuilder.prototype.m_dataType = null;
oFF.GenericAttributeBuilder.prototype.m_decimals = 0;
oFF.GenericAttributeBuilder.prototype.m_initialValue = null;
oFF.GenericAttributeBuilder.prototype.m_isFilerable = false;
oFF.GenericAttributeBuilder.prototype.m_length = 0;
oFF.GenericAttributeBuilder.prototype.m_presentationType = null;
oFF.GenericAttributeBuilder.prototype.setName = function(name)
{
	this.m_name = name;
	return this;
};
oFF.GenericAttributeBuilder.prototype.getName = function()
{
	return this.m_name;
};
oFF.GenericAttributeBuilder.prototype.setDescription = function(desc)
{
	this.m_description = desc;
	return this;
};
oFF.GenericAttributeBuilder.prototype.getDescription = function()
{
	return this.m_description;
};
oFF.GenericAttributeBuilder.prototype.setIsKey = function(isKey)
{
	this.m_isKey = isKey;
	return this;
};
oFF.GenericAttributeBuilder.prototype.isKey = function()
{
	return this.m_isKey;
};
oFF.GenericAttributeBuilder.prototype.setObtainability = function(obtainability)
{
	this.m_obtainibility = obtainability;
	return this;
};
oFF.GenericAttributeBuilder.prototype.appendValue = function(el)
{
	this.m_values.add(el);
	return this;
};
oFF.GenericAttributeBuilder.prototype.getValues = function()
{
	return this.m_values;
};
oFF.GenericAttributeBuilder.prototype.setDataType = function(name)
{
	this.m_dataType = name;
	return this;
};
oFF.GenericAttributeBuilder.prototype.setDecimals = function(name)
{
	this.m_decimals = name;
	return this;
};
oFF.GenericAttributeBuilder.prototype.setInitialValue = function(name)
{
	this.m_initialValue = name;
	return this;
};
oFF.GenericAttributeBuilder.prototype.setIsFilterable = function(name)
{
	this.m_isFilerable = name;
	return this;
};
oFF.GenericAttributeBuilder.prototype.setLength = function(name)
{
	this.m_length = name;
	return this;
};
oFF.GenericAttributeBuilder.prototype.setPresentationType = function(name)
{
	this.m_presentationType = name;
	return this;
};
oFF.GenericAttributeBuilder.prototype.toStructure = function(parentName)
{
	var ret = oFF.PrFactory.createStructure();
	ret.putString("Name", oFF.XStringUtils.concatenate3(parentName, ".", this.m_name));
	ret.putString("Description", this.m_description);
	ret.putBoolean("IsKey", this.m_isKey);
	ret.putString("Obtainability", this.m_obtainibility.getName());
	var values = ret.putNewList("Values");
	for (var i = 0; i < this.m_values.size(); i++)
	{
		values.add(this.m_values.get(i));
	}
	ret.putString("DataType", this.m_dataType);
	ret.putInteger("Decimals", this.m_decimals);
	ret.put("InitialValue", this.m_initialValue);
	ret.putBoolean("IsFilterable", this.m_isFilerable);
	ret.putInteger("Length", this.m_length);
	ret.putString("PresentationType", this.m_presentationType);
	ret.put("FilterCapability", oFF.JsonParserFactory.createFromString("{\"Comparison\":{\"Excluding\":[\"=\",\">\",\"<\",\">=\",\"<=\",\"<>\",\"BETWEEN\",\"NOT_BETWEEN\",\"FUZZY\",\"LIKE\",\"MATCH\",\"NOT_MATCH\",\"IS_NULL\"],\"Including\":[\"=\",\">\",\"<\",\">=\",\"<=\",\"<>\",\"BETWEEN\",\"NOT_BETWEEN\",\"FUZZY\",\"LIKE\",\"MATCH\",\"NOT_MATCH\",\"IS_NULL\"]}}\r\n"));
	return ret;
};

oFF.GenericAxisBuilder = function() {};
oFF.GenericAxisBuilder.prototype = new oFF.XObject();
oFF.GenericAxisBuilder.prototype._ff_c = "GenericAxisBuilder";

oFF.GenericAxisBuilder.create = function()
{
	var obj = new oFF.GenericAxisBuilder();
	obj.m_dimensions = oFF.XList.create();
	obj.m_tuples = oFF.XList.create();
	return obj;
};
oFF.GenericAxisBuilder.create2 = function(dims, tuples)
{
	var obj = new oFF.GenericAxisBuilder();
	obj.m_dimensions = dims;
	obj.m_tuples = tuples;
	return obj;
};
oFF.GenericAxisBuilder.prototype.m_dimensions = null;
oFF.GenericAxisBuilder.prototype.m_name = null;
oFF.GenericAxisBuilder.prototype.m_type = null;
oFF.GenericAxisBuilder.prototype.m_tuples = null;
oFF.GenericAxisBuilder.prototype.m_totalTuples = 0;
oFF.GenericAxisBuilder.prototype.appendDimension = function()
{
	var ret = oFF.GenericDimensionBuilder.create();
	this.m_dimensions.add(ret);
	return ret;
};
oFF.GenericAxisBuilder.prototype.getDimensions = function()
{
	return this.m_dimensions;
};
oFF.GenericAxisBuilder.prototype.appendTuple = function(tuple)
{
	while (tuple.size() > this.getDimensions().size())
	{
		var attr = this.appendDimension().setName(oFF.XStringUtils.concatenate2("UnknownDimension", oFF.XInteger.convertToString(this.getDimensions().size()))).setDescription("UnknownDimension").getAttributes();
		attr.add(oFF.GenericAttributeBuilder.create().setName("KEY").setIsKey(true).setDescription("Primary Key"));
		attr.add(oFF.GenericAttributeBuilder.create().setName("LONG_TEXT").setDescription("My Description"));
	}
	while (tuple.size() > this.m_tuples.size())
	{
		this.m_tuples.add(oFF.GenericTupleBuilder.create());
	}
	for (var i = 0; i < tuple.size(); i++)
	{
		var member_i = this.getDimensions().get(i).getAttributes().get(1).getValues().size();
		var found = false;
		for (var j = 0; j < member_i; j++)
		{
			if (this.getDimensions().get(i).getAttributes().get(1).getValues().get(j) === null ? tuple.get(i) === null : this.getDimensions().get(i).getAttributes().get(1).getValues().get(j).isEqualTo(tuple.get(i)))
			{
				found = true;
				member_i = j;
				break;
			}
		}
		if (!found)
		{
			this.getDimensions().get(i).getAttributes().get(1).appendValue(tuple.get(i));
			this.getDimensions().get(i).getAttributes().get(0).appendValue(tuple.get(i));
		}
		this.m_tuples.get(i).getEntries().add(oFF.GenericTupleEntryBuilder.create().setMemberIndex(member_i));
	}
	return this;
};
oFF.GenericAxisBuilder.prototype.appendTuple2 = function(tuple)
{
	if (tuple.size() > this.getDimensions().size())
	{
		throw oFF.XException.createIllegalStateException("You don't have enough Dimensions available");
	}
	while (tuple.size() > this.m_tuples.size())
	{
		this.m_tuples.add(oFF.GenericTupleBuilder.create());
	}
	for (var i = 0; i < tuple.size(); i++)
	{
		var attributes = this.getDimensions().get(i).getAttributes();
		var member_i = attributes.get(0).getValues().size();
		var found = false;
		for (var j = 0; j < member_i; j++)
		{
			var match = true;
			for (var j2 = 0; j2 < attributes.size(); j2++)
			{
				var val = tuple.get(i).getByKey(attributes.get(j2).getName());
				if (!(attributes.get(j2).getValues().get(j) === null ? oFF.isNull(val) : attributes.get(1).getValues().get(j).isEqualTo(val)))
				{
					match = false;
				}
			}
			if (match)
			{
				found = true;
				member_i = j;
				break;
			}
		}
		if (!found)
		{
			for (var j3 = 0; j3 < attributes.size(); j3++)
			{
				attributes.get(j3).appendValue(tuple.get(i).getByKey(attributes.get(j3).getName()));
			}
		}
		this.m_tuples.get(i).getEntries().add(oFF.GenericTupleEntryBuilder.create().setMemberIndex(member_i));
	}
	return this;
};
oFF.GenericAxisBuilder.prototype.getOrAppendTupleIndex2 = function(tuple)
{
	return this.getOrAppendTupleIndex3(tuple, true, false, false);
};
oFF.GenericAxisBuilder.prototype.getOrAppendTupleIndex3 = function(tuple, append, reverse, bestMatch)
{
	if (tuple.size() === 0)
	{
		return -1;
	}
	if (tuple.size() > this.getDimensions().size())
	{
		throw oFF.XException.createIllegalStateException("You don't have enough Dimensions available");
	}
	while (tuple.size() > this.m_tuples.size())
	{
		this.m_tuples.add(oFF.GenericTupleBuilder.create());
	}
	var ret = this.m_tuples.get(0).getEntries().size();
	var tupleidxs = oFF.XList.create();
	for (var i = 0; i < tuple.size(); i++)
	{
		var attributes = this.getDimensions().get(i).getAttributes();
		var member_i = attributes.get(0).getValues().size();
		var found = false;
		for (var j = 0; j < member_i; j++)
		{
			var match = true;
			for (var j2 = 0; j2 < attributes.size(); j2++)
			{
				var val = tuple.get(i).getByKey(attributes.get(j2).getName());
				if (!(attributes.get(j2).getValues().get(j) === null ? oFF.isNull(val) : attributes.get(j2).getValues().get(j).isEqualTo(val)))
				{
					match = false;
				}
			}
			if (match)
			{
				found = true;
				member_i = j;
				break;
			}
		}
		if (!found)
		{
			if (!append)
			{
				return -1;
			}
			for (var j3 = 0; j3 < attributes.size(); j3++)
			{
				attributes.get(j3).appendValue(tuple.get(i).getByKey(attributes.get(j3).getName()));
			}
		}
		tupleidxs.add(oFF.XIntegerValue.create(member_i));
	}
	var matchsize = 0;
	var matchi = -1;
	for (var k = 0, entrysize = this.m_tuples.get(0).getEntries().size(); k < entrysize; k++)
	{
		var found2 = true;
		for (var l = 0; l < tuple.size(); l++)
		{
			if (entrysize !== this.m_tuples.get(l).getEntries().size())
			{
				throw oFF.XException.createRuntimeException("Inconsistent Tuple builder!");
			}
			if (this.m_tuples.get(l).getEntries().get(reverse ? (entrysize - 1 - k) : k).getMemberIndex() !== tupleidxs.get(l).getInteger())
			{
				found2 = false;
				if (matchsize < l)
				{
					matchsize = l;
					matchi = reverse ? (entrysize - 1 - k) : k;
				}
				break;
			}
		}
		if (found2)
		{
			return reverse ? (entrysize - 1 - k) : k;
		}
	}
	if (bestMatch)
	{
		return matchi;
	}
	if (append)
	{
		for (var m = 0; m < tuple.size(); m++)
		{
			this.m_tuples.get(m).getEntries().add(oFF.GenericTupleEntryBuilder.create().setMemberIndex(tupleidxs.get(m).getInteger()));
		}
	}
	return ret;
};
oFF.GenericAxisBuilder.prototype.getOrAppendTupleIndex = function(tuple)
{
	var n = oFF.XList.create();
	for (var i = 0; i < tuple.size(); i++)
	{
		n.add(new oFF.StringMapBuilder().init().put("ID", tuple.get(i)).put("LONG_TEXT", tuple.get(i)).build());
	}
	return this.getOrAppendTupleIndex2(n);
};
oFF.GenericAxisBuilder.prototype.getOrAppendTupleIndex4 = function(tuple, append, reverse, bestMatch)
{
	var n = oFF.XList.create();
	for (var i = 0; i < tuple.size(); i++)
	{
		n.add(new oFF.StringMapBuilder().init().put("ID", tuple.get(i)).put("LONG_TEXT", tuple.get(i)).build());
	}
	return this.getOrAppendTupleIndex3(n, append, reverse, bestMatch);
};
oFF.GenericAxisBuilder.prototype.insertTuple = function(n, tuple)
{
	var tupleidxs = oFF.XList.create();
	for (var i = 0; i < tuple.size(); i++)
	{
		var attributes = this.getDimensions().get(i).getAttributes();
		var member_i = attributes.get(0).getValues().size();
		var found = false;
		for (var j = 0; j < member_i; j++)
		{
			var match = true;
			for (var j2 = 0; j2 < attributes.size(); j2++)
			{
				var val = tuple.get(i).getByKey(attributes.get(j2).getName());
				if (!(attributes.get(j2).getValues().get(j) === null ? oFF.isNull(val) : attributes.get(1).getValues().get(j).isEqualTo(val)))
				{
					match = false;
				}
			}
			if (match)
			{
				found = true;
				member_i = j;
				break;
			}
		}
		if (!found)
		{
			for (var j3 = 0; j3 < attributes.size(); j3++)
			{
				attributes.get(j3).appendValue(tuple.get(i).getByKey(attributes.get(j3).getName()));
			}
		}
		tupleidxs.add(oFF.XIntegerValue.create(member_i));
	}
	for (var m = 0; m < tuple.size(); m++)
	{
		this.m_tuples.get(m).getEntries().insert(n, oFF.GenericTupleEntryBuilder.create().setMemberIndex(tupleidxs.get(m).getInteger()));
	}
};
oFF.GenericAxisBuilder.prototype.insertTuple2 = function(o, tuple)
{
	var n = oFF.XList.create();
	for (var i = 0; i < tuple.size(); i++)
	{
		n.add(new oFF.StringMapBuilder().init().put("ID", tuple.get(i)).put("LONG_TEXT", tuple.get(i)).build());
	}
	this.insertTuple(o, n);
};
oFF.GenericAxisBuilder.prototype.getTuple = function(o)
{
	var n = oFF.XList.create();
	for (var m = 0; m < this.m_tuples.size(); m++)
	{
		var attr = this.m_tuples.get(m).getEntries().get(o).getMemberIndex();
		var attributes = this.getDimensions().get(m).getAttributes();
		var e = oFF.XHashMapByString.create();
		for (var j = 0; j < attributes.size(); j++)
		{
			e.put(attributes.get(j).getName(), attributes.get(j).getValues().get(oFF.XDouble.convertToInt(attr)));
		}
		n.add(e);
	}
	return n;
};
oFF.GenericAxisBuilder.prototype.toStructure = function()
{
	var root = oFF.PrFactory.createStructure();
	root.putString("Name", this.getName());
	root.putString("Type", this.getType());
	var dims = root.putNewList("Dimensions");
	for (var i = 0; i < this.m_dimensions.size(); i++)
	{
		dims.add(this.m_dimensions.get(i).toStructure());
	}
	var alertLevels = root.putNewList("ExceptionAlertLevel");
	var names = root.putNewList("ExceptionName");
	while (this.m_tuples.size() < this.m_dimensions.size())
	{
		this.m_tuples.add(oFF.GenericTupleBuilder.create());
	}
	for (var r = 0; r < (this.m_tuples.size() >= 1 ? this.m_tuples.get(0).getEntries().size() : 1); r++)
	{
		alertLevels.add(oFF.PrFactory.createDouble(0));
		names.add(oFF.PrFactory.createString(""));
	}
	var tupleCount = this.m_tuples.size() >= 1 ? this.m_tuples.get(0).getEntries().size() : 1;
	root.putInteger("TupleCount", tupleCount);
	root.putInteger("TupleCountTotal", this.m_totalTuples > tupleCount ? this.m_totalTuples : tupleCount);
	var tuples = root.putNewList("Tuples");
	for (var j = 0; j < this.m_tuples.size(); j++)
	{
		tuples.add(this.m_tuples.get(j).toStructure());
	}
	return root;
};
oFF.GenericAxisBuilder.prototype.toStructurelimit = function(start, end)
{
	var root = oFF.PrFactory.createStructure();
	root.putString("Name", this.getName());
	root.putString("Type", this.getType());
	var dims = root.putNewList("Dimensions");
	for (var i = 0; i < this.m_dimensions.size(); i++)
	{
		dims.add(this.m_dimensions.get(i).toStructure());
	}
	var alertLevels = root.putNewList("ExceptionAlertLevel");
	var names = root.putNewList("ExceptionName");
	while (this.m_tuples.size() < this.m_dimensions.size())
	{
		this.m_tuples.add(oFF.GenericTupleBuilder.create());
	}
	for (var r = 0; r < (this.m_tuples.size() >= 1 ? this.m_tuples.get(0).getEntries().size() : 1); r++)
	{
		alertLevels.add(oFF.PrFactory.createDouble(0));
		names.add(oFF.PrFactory.createString(""));
	}
	var tupleCount = end - start;
	root.putInteger("TupleCount", end - start);
	root.putInteger("TupleCountTotal", this.m_totalTuples > tupleCount ? this.m_totalTuples : tupleCount);
	var tuples = root.putNewList("Tuples");
	for (var j = 0; j < this.m_tuples.size(); j++)
	{
		tuples.add(this.m_tuples.get(j).toStructureLimit(start, end));
	}
	return root;
};
oFF.GenericAxisBuilder.prototype.getName = function()
{
	return this.m_name;
};
oFF.GenericAxisBuilder.prototype.setName = function(m_name)
{
	this.m_name = m_name;
	return this;
};
oFF.GenericAxisBuilder.prototype.getType = function()
{
	return this.m_type;
};
oFF.GenericAxisBuilder.prototype.setType = function(m_type)
{
	this.m_type = m_type;
	return this;
};
oFF.GenericAxisBuilder.prototype.setTotalTuples = function(totalTuples)
{
	this.m_totalTuples = totalTuples;
	return this;
};

oFF.GenericCellBuilder = function() {};
oFF.GenericCellBuilder.prototype = new oFF.XObject();
oFF.GenericCellBuilder.prototype._ff_c = "GenericCellBuilder";

oFF.GenericCellBuilder.create = function()
{
	return new oFF.GenericCellBuilder().init();
};
oFF.GenericCellBuilder.prototype.m_exception = 0.0;
oFF.GenericCellBuilder.prototype.m_lockedvalue = 0.0;
oFF.GenericCellBuilder.prototype.m_inputenabled = 0.0;
oFF.GenericCellBuilder.prototype.m_exceptionalertlevel = 0.0;
oFF.GenericCellBuilder.prototype.m_exceptionname = null;
oFF.GenericCellBuilder.prototype.m_value = null;
oFF.GenericCellBuilder.prototype.m_queryDataCellReference = null;
oFF.GenericCellBuilder.prototype.init = function()
{
	this.setException(0);
	this.setLockedvalue(0);
	this.setInputenabled(0);
	this.setExceptionalertlevel(0);
	this.setExceptionname("");
	this.setValue(null);
	return this;
};
oFF.GenericCellBuilder.prototype.getException = function()
{
	return this.m_exception;
};
oFF.GenericCellBuilder.prototype.setException = function(m_exception)
{
	this.m_exception = m_exception;
	return this;
};
oFF.GenericCellBuilder.prototype.getLockedvalue = function()
{
	return this.m_lockedvalue;
};
oFF.GenericCellBuilder.prototype.setLockedvalue = function(m_lockedvalue)
{
	this.m_lockedvalue = m_lockedvalue;
	return this;
};
oFF.GenericCellBuilder.prototype.getInputenabled = function()
{
	return this.m_inputenabled;
};
oFF.GenericCellBuilder.prototype.setInputenabled = function(m_inputenabled)
{
	this.m_inputenabled = m_inputenabled;
	return this;
};
oFF.GenericCellBuilder.prototype.getExceptionalertlevel = function()
{
	return this.m_exceptionalertlevel;
};
oFF.GenericCellBuilder.prototype.setExceptionalertlevel = function(m_exceptionalertlevel)
{
	this.m_exceptionalertlevel = m_exceptionalertlevel;
	return this;
};
oFF.GenericCellBuilder.prototype.getExceptionname = function()
{
	return this.m_exceptionname;
};
oFF.GenericCellBuilder.prototype.setExceptionname = function(m_exceptionname)
{
	this.m_exceptionname = m_exceptionname;
	return this;
};
oFF.GenericCellBuilder.prototype.getValue = function()
{
	return this.m_value;
};
oFF.GenericCellBuilder.prototype.setValue = function(m_value)
{
	this.m_value = m_value;
	return this;
};
oFF.GenericCellBuilder.prototype.getQueryDataCellReference = function()
{
	return this.m_queryDataCellReference;
};
oFF.GenericCellBuilder.prototype.setQueryDataCellReference = function(ref)
{
	this.m_queryDataCellReference = ref;
	return this;
};

oFF.GenericCellsBuilder = function() {};
oFF.GenericCellsBuilder.prototype = new oFF.XObject();
oFF.GenericCellsBuilder.prototype._ff_c = "GenericCellsBuilder";

oFF.GenericCellsBuilder.create = function()
{
	return new oFF.GenericCellsBuilder().init().setColumns(1);
};
oFF.GenericCellsBuilder.prototype.m_cells = null;
oFF.GenericCellsBuilder.prototype.init = function()
{
	this.m_cells = oFF.XList.create();
	return this;
};
oFF.GenericCellsBuilder.prototype.setColumns = function(columns)
{
	return this;
};
oFF.GenericCellsBuilder.prototype.toStructure = function()
{
	var root = oFF.PrFactory.createStructure();
	var exceptions = oFF.PrFactory.createList();
	var exceptionalertlevels = oFF.PrFactory.createList();
	var exceptionNames = oFF.PrFactory.createList();
	var values = oFF.PrFactory.createList();
	var valuesFormatted = oFF.PrFactory.createList();
	var valuesRounded = oFF.PrFactory.createList();
	var inputsEnabled = oFF.PrFactory.createList();
	var unitindexes = oFF.PrFactory.createList();
	var lockedValues = oFF.PrFactory.createList();
	var units = oFF.PrFactory.createList();
	var cellFormat = oFF.PrFactory.createList();
	var qrefs = oFF.PrFactory.createList();
	for (var i = 0; i < this.m_cells.size(); i++)
	{
		exceptions.add(oFF.PrFactory.createDouble(this.m_cells.get(i).getException()));
		exceptionalertlevels.add(oFF.PrFactory.createDouble(this.m_cells.get(i).getExceptionalertlevel()));
		exceptionNames.add(oFF.PrFactory.createString(this.m_cells.get(i).getExceptionname()));
		if (this.m_cells.get(i).getValue() !== null)
		{
			values.add(this.m_cells.get(i).getValue());
			valuesFormatted.add(oFF.PrFactory.createString(this.m_cells.get(i).getValue().getStringRepresentation()));
			valuesRounded.add(oFF.PrFactory.createString(this.m_cells.get(i).getValue().getStringRepresentation()));
		}
		else
		{
			values.add(null);
			valuesFormatted.add(oFF.PrFactory.createString("null"));
			valuesRounded.add(oFF.PrFactory.createString("null"));
		}
		inputsEnabled.add(oFF.PrFactory.createDouble(this.m_cells.get(i).getInputenabled()));
		unitindexes.add(oFF.PrFactory.createInteger(-1));
		lockedValues.add(oFF.PrFactory.createInteger(0));
		units.add(oFF.PrFactory.createString(""));
		cellFormat.add(oFF.PrFactory.createString("#.##0"));
		qrefs.add(oFF.PrFactory.createString(this.m_cells.get(i).getQueryDataCellReference()));
	}
	root.put("Exceptions", oFF.GenericEncodedList.encodeNone2(exceptions));
	root.put("ExceptionAlertLevel", oFF.GenericEncodedList.encodeNone2(exceptionalertlevels));
	root.put("ExceptionName", oFF.GenericEncodedList.encodeNone2(exceptionNames));
	root.put("Values", oFF.GenericEncodedList.encodeNone2(values));
	root.put("ValuesFormatted", oFF.GenericEncodedList.encodeNone2(valuesFormatted));
	root.put("ValuesRounded", oFF.GenericEncodedList.encodeNone2(valuesRounded));
	root.put("InputEnabled", oFF.GenericEncodedList.encodeNone2(inputsEnabled));
	root.put("UnitIndex", oFF.GenericEncodedList.encodeNone2(unitindexes));
	root.put("LockedValue", oFF.GenericEncodedList.encodeNone2(lockedValues));
	root.put("CellValueTypes", oFF.GenericEncodedList.encodeNone2(lockedValues));
	root.put("Units", oFF.GenericEncodedList.encodeNone2(units));
	root.put("UnitDescriptions", oFF.GenericEncodedList.encodeNone2(units));
	root.put("UnitTypes", oFF.GenericEncodedList.encodeNone2(lockedValues));
	root.put("UnitPositions", oFF.GenericEncodedList.encodeNone2(lockedValues));
	root.put("NumericRounding", oFF.GenericEncodedList.encodeNone2(lockedValues));
	root.put("NumericShift", oFF.GenericEncodedList.encodeNone2(lockedValues));
	root.put("CellFormat", oFF.GenericEncodedList.encodeNone2(cellFormat));
	root.put("QueryDataCellReferences", oFF.GenericEncodedList.encodeNone2(qrefs));
	return root;
};
oFF.GenericCellsBuilder.prototype.toStructureLimit = function(rowFrom, rowTo, columnFrom, columnTo, lineLength)
{
	var root = oFF.PrFactory.createStructure();
	var exceptions = oFF.PrFactory.createList();
	var exceptionalertlevels = oFF.PrFactory.createList();
	var exceptionNames = oFF.PrFactory.createList();
	var values = oFF.PrFactory.createList();
	var valuesFormatted = oFF.PrFactory.createList();
	var valuesRounded = oFF.PrFactory.createList();
	var inputsEnabled = oFF.PrFactory.createList();
	var unitindexes = oFF.PrFactory.createList();
	var lockedValues = oFF.PrFactory.createList();
	var units = oFF.PrFactory.createList();
	var cellFormat = oFF.PrFactory.createList();
	var qrefs = oFF.PrFactory.createList();
	for (var i = rowFrom * lineLength + columnFrom; i < this.m_cells.size() && i < rowTo * lineLength; i++)
	{
		var col = oFF.XMath.mod(i, lineLength);
		if (col >= columnTo)
		{
			i = i + lineLength - col + columnFrom - 1;
			continue;
		}
		exceptions.add(oFF.PrFactory.createDouble(this.m_cells.get(i).getException()));
		exceptionalertlevels.add(oFF.PrFactory.createDouble(this.m_cells.get(i).getExceptionalertlevel()));
		exceptionNames.add(oFF.PrFactory.createString(this.m_cells.get(i).getExceptionname()));
		if (this.m_cells.get(i).getValue() !== null)
		{
			values.add(this.m_cells.get(i).getValue());
			valuesFormatted.add(oFF.PrFactory.createString(this.m_cells.get(i).getValue().getStringRepresentation()));
			valuesRounded.add(oFF.PrFactory.createString(this.m_cells.get(i).getValue().getStringRepresentation()));
		}
		else
		{
			values.add(null);
			valuesFormatted.add(oFF.PrFactory.createString("null"));
			valuesRounded.add(oFF.PrFactory.createString("null"));
		}
		inputsEnabled.add(oFF.PrFactory.createDouble(this.m_cells.get(i).getInputenabled()));
		unitindexes.add(oFF.PrFactory.createInteger(-1));
		lockedValues.add(oFF.PrFactory.createInteger(0));
		units.add(oFF.PrFactory.createString(""));
		cellFormat.add(oFF.PrFactory.createString("#.##0"));
		qrefs.add(oFF.PrFactory.createString(this.m_cells.get(i).getQueryDataCellReference()));
	}
	root.put("Exceptions", oFF.GenericEncodedList.encodeNone2(exceptions));
	root.put("ExceptionAlertLevel", oFF.GenericEncodedList.encodeNone2(exceptionalertlevels));
	root.put("ExceptionName", oFF.GenericEncodedList.encodeNone2(exceptionNames));
	root.put("Values", oFF.GenericEncodedList.encodeNone2(values));
	root.put("ValuesFormatted", oFF.GenericEncodedList.encodeNone2(valuesFormatted));
	root.put("ValuesRounded", oFF.GenericEncodedList.encodeNone2(valuesRounded));
	root.put("InputEnabled", oFF.GenericEncodedList.encodeNone2(inputsEnabled));
	root.put("UnitIndex", oFF.GenericEncodedList.encodeNone2(unitindexes));
	root.put("LockedValue", oFF.GenericEncodedList.encodeNone2(lockedValues));
	root.put("CellValueTypes", oFF.GenericEncodedList.encodeNone2(lockedValues));
	root.put("Units", oFF.GenericEncodedList.encodeNone2(units));
	root.put("UnitDescriptions", oFF.GenericEncodedList.encodeNone2(units));
	root.put("UnitTypes", oFF.GenericEncodedList.encodeNone2(lockedValues));
	root.put("UnitPositions", oFF.GenericEncodedList.encodeNone2(lockedValues));
	root.put("NumericRounding", oFF.GenericEncodedList.encodeNone2(lockedValues));
	root.put("NumericShift", oFF.GenericEncodedList.encodeNone2(lockedValues));
	root.put("CellFormat", oFF.GenericEncodedList.encodeNone2(cellFormat));
	root.put("QueryDataCellReferences", oFF.GenericEncodedList.encodeNone2(qrefs));
	return root;
};
oFF.GenericCellsBuilder.prototype.getCells = function()
{
	return this.m_cells;
};

oFF.GenericCubeBuilder = function() {};
oFF.GenericCubeBuilder.prototype = new oFF.XObject();
oFF.GenericCubeBuilder.prototype._ff_c = "GenericCubeBuilder";

oFF.GenericCubeBuilder.create = function()
{
	return new oFF.GenericCubeBuilder().init().setAnnotations("");
};
oFF.GenericCubeBuilder.demoContent = function()
{
	oFF.OlapEngineModule.getInstance();
	oFF.OlapApiModule.getInstance();
	var b = oFF.GenericCubeBuilder.create().setBaseDataSource(oFF.GenericDataSourceBuilder.create().setObjectName("Root").setDescription("Root").setType("InfoCube")).setDataSource(oFF.GenericDataSourceBuilder.create().setObjectName("Basic").setType("Query").setDescription("Basic"));
	var dim1 = oFF.GenericDimensionBuilder.create().setName("Country").setDescription("Origin Country").setDimensionType(3).setAxisDefault("Rows").setAxisConstraints(oFF.StringListBuilder.create().add("Columns").add("Rows").add("Free").build()).setDataType(null).setKeyAttribute("Country.ID");
	dim1.getAttributes().add(oFF.GenericAttributeBuilder.create().setIsKey(true).setName("ID").setDataType("String"));
	dim1.getAttributes().add(oFF.GenericAttributeBuilder.create().setName("LONG_TEXT").setDataType("String"));
	b.getDimensions().add(dim1);
	dim1 = oFF.GenericDimensionBuilder.create().setName("Product").setDescription("Origin Product").setDimensionType(3).setAxisDefault("Rows").setAxisConstraints(oFF.StringListBuilder.create().add("Columns").add("Rows").add("Free").build()).setDataType(null).setKeyAttribute("Product.ID");
	dim1.getAttributes().add(oFF.GenericAttributeBuilder.create().setIsKey(true).setName("ID").setDataType("String"));
	dim1.getAttributes().add(oFF.GenericAttributeBuilder.create().setName("LONG_TEXT").setDataType("String"));
	b.getDimensions().add(dim1);
	var dim2 = oFF.GenericDimensionBuilder.create().setName("Measure").setDescription("Data").setDimensionType(2).setAxisDefault("Columns").setAxisConstraints(oFF.StringListBuilder.create().add("Columns").add("Rows").add("Free").build()).setDataType(null).setKeyAttribute("Measure.ID");
	dim2.getAttributes().add(oFF.GenericAttributeBuilder.create().setIsKey(true).setName("ID").setDataType("String"));
	dim2.getAttributes().add(oFF.GenericAttributeBuilder.create().setName("LONG_TEXT").setDataType("String"));
	dim2.putMember(new oFF.StringMapBuilder().init().put("ID", oFF.PrFactory.createString("0")).put("LONG_TEXT", oFF.PrFactory.createString("Hello World 1")).build());
	dim2.putMember(new oFF.StringMapBuilder().init().put("ID", oFF.PrFactory.createString("1")).put("LONG_TEXT", oFF.PrFactory.createString("Hello World 2")).build());
	dim2.putMember(new oFF.StringMapBuilder().init().put("ID", oFF.PrFactory.createString("2")).put("LONG_TEXT", oFF.PrFactory.createString("Hello World 3")).build());
	dim2.putMember(new oFF.StringMapBuilder().init().put("ID", oFF.PrFactory.createString("3")).put("LONG_TEXT", oFF.PrFactory.createString("Hello World 4")).build());
	dim2.putMember(new oFF.StringMapBuilder().init().put("ID", oFF.PrFactory.createString("4")).put("LONG_TEXT", oFF.PrFactory.createString("Test Member")).build());
	b.getDimensions().add(dim2);
	return b.toStructure();
};
oFF.GenericCubeBuilder.main = function() {};
oFF.GenericCubeBuilder.prototype.m_annotations = null;
oFF.GenericCubeBuilder.prototype.m_baseDataSource = null;
oFF.GenericCubeBuilder.prototype.m_dataSource = null;
oFF.GenericCubeBuilder.prototype.m_catalogPackage = null;
oFF.GenericCubeBuilder.prototype.m_catalogSchema = null;
oFF.GenericCubeBuilder.prototype.m_catalogType = null;
oFF.GenericCubeBuilder.prototype.m_createdBy = null;
oFF.GenericCubeBuilder.prototype.m_createdOn = null;
oFF.GenericCubeBuilder.prototype.m_dueDate = null;
oFF.GenericCubeBuilder.prototype.m_dimensions = null;
oFF.GenericCubeBuilder.prototype.getDimensions = function()
{
	return this.m_dimensions;
};
oFF.GenericCubeBuilder.prototype.init = function()
{
	this.m_dimensions = oFF.XList.create();
	return this;
};
oFF.GenericCubeBuilder.prototype.getAnnotations = function()
{
	return this.m_annotations;
};
oFF.GenericCubeBuilder.prototype.setAnnotations = function(annotations)
{
	this.m_annotations = annotations;
	return this;
};
oFF.GenericCubeBuilder.prototype.setDataSource = function(annotations)
{
	this.m_dataSource = annotations;
	return this;
};
oFF.GenericCubeBuilder.prototype.setBaseDataSource = function(annotations)
{
	this.m_baseDataSource = annotations;
	return this;
};
oFF.GenericCubeBuilder.prototype.toStructure = function()
{
	var root = oFF.PrFactory.createStructure();
	root.putString("Annotations", this.m_annotations);
	root.putString("CatalogPackage", this.m_catalogPackage);
	root.putString("CatalogSchema", this.m_catalogSchema);
	root.putString("CatalogType", this.m_catalogType);
	root.putString("CreatedBy", this.m_createdBy);
	root.putString("CreatedOn", this.m_createdOn);
	root.putString("DueDate", this.m_dueDate);
	root.putNewStructure("DynamicFilter");
	root.put("ExtendedSortTypes", oFF.PrListBuilder.create().add(oFF.PrFactory.createString("MemberText")).build());
	root.put("Sort", oFF.JsonParserFactory.createFromString("[{ \"Dimension\": \"code\", \"SortType\": \"MemberText\", \"MeasureName\": \"\", \"Direction\": \"Asc\" }]"));
	var currencyTranslation = root.putNewStructure("CurrencyTranslation");
	currencyTranslation.putString("Name", "");
	currencyTranslation.putString("Operation", "Original");
	currencyTranslation.putString("Target", "");
	root.put("BaseDataSource", this.m_baseDataSource.toStructure());
	root.put("DataSource", this.m_dataSource.toStructure());
	root.put("Query", oFF.JsonParserFactory.createFromString("{\"Axes\":[{\"DimensionOrderFixed\":false,\"Axis\":\"Rows\",\"ZeroSuppressionType\":0,\"ResultAlignment\":\"Bottom\"},{\"DimensionOrderFixed\":false,\"Axis\":\"Columns\",\"ZeroSuppressionType\":0,\"ResultAlignment\":\"Bottom\"},{\"DimensionOrderFixed\":false,\"Axis\":\"Free\",\"ZeroSuppressionType\":0,\"ResultAlignment\":\"Bottom\"}],\"CurrencyTranslationEnabled\":\"Possible\",\"ResultStructureFeature\":{\"Enabled\":true,\"Reordering\":\"None\",\"ResultAlignment\":{\"ConfigLevel\":\"Axis\",\"ResultAlignmentList\":[\"Top\",\"Bottom\"]},\"ConditionalVisibility\":true,\"ConditionalTotals\":false,\"ConditionalTotalsList\":[]}}"));
	var dims = root.putNewList("Dimensions");
	for (var i = 0; i < this.m_dimensions.size(); i++)
	{
		dims.add(this.m_dimensions.get(i).toStructure());
	}
	var inaroot = oFF.PrFactory.createStructure();
	inaroot.put("Cube", root);
	return inaroot;
};

oFF.GenericDataSourceBuilder = function() {};
oFF.GenericDataSourceBuilder.prototype = new oFF.XObject();
oFF.GenericDataSourceBuilder.prototype._ff_c = "GenericDataSourceBuilder";

oFF.GenericDataSourceBuilder.create = function()
{
	return new oFF.GenericDataSourceBuilder().init();
};
oFF.GenericDataSourceBuilder.prototype.m_objectName = null;
oFF.GenericDataSourceBuilder.prototype.m_type = null;
oFF.GenericDataSourceBuilder.prototype.m_dataArea = null;
oFF.GenericDataSourceBuilder.prototype.m_description = null;
oFF.GenericDataSourceBuilder.prototype.m_instanceId = null;
oFF.GenericDataSourceBuilder.prototype.init = function()
{
	return this;
};
oFF.GenericDataSourceBuilder.prototype.getObjectName = function()
{
	return this.m_objectName;
};
oFF.GenericDataSourceBuilder.prototype.setObjectName = function(annotations)
{
	this.m_objectName = annotations;
	return this;
};
oFF.GenericDataSourceBuilder.prototype.getType = function()
{
	return this.m_type;
};
oFF.GenericDataSourceBuilder.prototype.setType = function(annotations)
{
	this.m_type = annotations;
	return this;
};
oFF.GenericDataSourceBuilder.prototype.getDataArea = function()
{
	return this.m_dataArea;
};
oFF.GenericDataSourceBuilder.prototype.setDataArea = function(annotations)
{
	this.m_dataArea = annotations;
	return this;
};
oFF.GenericDataSourceBuilder.prototype.setDescription = function(desc)
{
	this.m_description = desc;
	return this;
};
oFF.GenericDataSourceBuilder.prototype.setInstanceId = function(desc)
{
	this.m_instanceId = desc;
	return this;
};
oFF.GenericDataSourceBuilder.prototype.toStructure = function()
{
	var root = oFF.PrFactory.createStructure();
	root.putString("ObjectName", this.m_objectName);
	root.putString("Type", this.m_type);
	root.putString("DataArea", this.m_dataArea);
	root.putString("Description", this.m_description);
	root.putString("InstanceId", this.m_instanceId);
	return root;
};

oFF.GenericDimensionBuilder = function() {};
oFF.GenericDimensionBuilder.prototype = new oFF.XObject();
oFF.GenericDimensionBuilder.prototype._ff_c = "GenericDimensionBuilder";

oFF.GenericDimensionBuilder.create = function()
{
	return new oFF.GenericDimensionBuilder().init();
};
oFF.GenericDimensionBuilder.convertList = function(lofs)
{
	var constr = oFF.PrFactory.createList();
	for (var j = 0; oFF.notNull(lofs) && j < lofs.size(); j++)
	{
		constr.add(oFF.PrFactory.createString(lofs.get(j)));
	}
	return constr;
};
oFF.GenericDimensionBuilder.prototype.init = function()
{
	this.m_attributes = oFF.XList.create();
	this.m_axisConstraints = oFF.XListOfString.create();
	this.setMembers(oFF.PrList.create());
	return this;
};
oFF.GenericDimensionBuilder.prototype.m_name = null;
oFF.GenericDimensionBuilder.prototype.m_description = null;
oFF.GenericDimensionBuilder.prototype.m_attributes = null;
oFF.GenericDimensionBuilder.prototype.m_axisConstraints = null;
oFF.GenericDimensionBuilder.prototype.m_axisDefault = null;
oFF.GenericDimensionBuilder.prototype.m_dataType = null;
oFF.GenericDimensionBuilder.prototype.m_defaultResultSetAttributeNodes = null;
oFF.GenericDimensionBuilder.prototype.m_defaultResultSetAttributes = null;
oFF.GenericDimensionBuilder.prototype.m_defaultResultSetReadMode = null;
oFF.GenericDimensionBuilder.prototype.m_dimensionType = 0;
oFF.GenericDimensionBuilder.prototype.m_keyAttribute = null;
oFF.GenericDimensionBuilder.prototype.m_members = null;
oFF.GenericDimensionBuilder.prototype.m_hirachy = null;
oFF.GenericDimensionBuilder.prototype.setName = function(name)
{
	this.m_name = name;
	return this;
};
oFF.GenericDimensionBuilder.prototype.getName = function()
{
	return this.m_name;
};
oFF.GenericDimensionBuilder.prototype.setDescription = function(desc)
{
	this.m_description = desc;
	return this;
};
oFF.GenericDimensionBuilder.prototype.getAttributes = function()
{
	return this.m_attributes;
};
oFF.GenericDimensionBuilder.prototype.getAxisConstraints = function()
{
	return this.m_axisConstraints;
};
oFF.GenericDimensionBuilder.prototype.toStructure = function()
{
	var ret = oFF.PrFactory.createStructure();
	ret.putString("Name", this.m_name);
	ret.putString("Description", this.m_description);
	ret.putString("AxisDefault", this.m_axisDefault);
	ret.putString("DataType", this.m_dataType);
	ret.putString("DefaultResultSetReadMode", this.m_defaultResultSetReadMode);
	ret.putInteger("DimensionType", this.m_dimensionType);
	ret.put("DefaultResultSetAttributes", oFF.GenericDimensionBuilder.convertList(this.m_defaultResultSetAttributes));
	ret.put("DefaultResultSetAttributeNodes", oFF.GenericDimensionBuilder.convertList(this.m_defaultResultSetAttributeNodes));
	ret.put("AxisConstraints", oFF.GenericDimensionBuilder.convertList(this.m_axisConstraints));
	ret.put("DefaultResultStructure", oFF.JsonParserFactory.createFromString("{\"ResultAlignment\":\"\",\"ResultStructure\":[{\"Result\":\"Total\",\"Visibility\":\"Visible\"},{\"Result\":\"Members\",\"Visibility\":\"Visible\"}]}"));
	var values = ret.putNewList("Attributes");
	var memberTypes = oFF.PrFactory.createList();
	if (this.m_attributes.size() > 0)
	{
		for (var z = 0; z < this.m_attributes.get(0).getValues().size(); z++)
		{
			memberTypes.add(oFF.PrFactory.createInteger(this.m_attributes.get(0).getValues().get(z) !== null && this.m_attributes.get(0).getValues().get(z).isString() && oFF.XString.isEqual(this.m_attributes.get(0).getValues().get(z).asString().getString(), "___INA_SQL_TOTAL") ? 1 : 0));
		}
	}
	var attributeNames = oFF.PrList.create();
	var defaultResultsetattributeNames = oFF.PrList.create();
	for (var i = 0; i < this.m_attributes.size(); i++)
	{
		values.add(this.m_attributes.get(i).toStructure(this.m_name));
		var attrname = oFF.PrFactory.createString(oFF.XStringUtils.concatenate3(this.m_name, ".", this.m_attributes.get(i).getName()));
		attributeNames.add(attrname);
		if (!this.m_attributes.get(i).isKey())
		{
			defaultResultsetattributeNames.add(attrname);
		}
		else if (oFF.isNull(this.m_keyAttribute))
		{
			this.m_keyAttribute = attrname.getString();
		}
	}
	ret.put("MemberTypes", oFF.GenericEncodedList.encodeNone2(memberTypes));
	ret.putString("KeyAttribute", this.m_keyAttribute);
	var constr = ret.putNewList("AxisConstraints");
	for (var j = 0; j < this.m_axisConstraints.size(); j++)
	{
		constr.add(oFF.PrFactory.createString(this.m_axisConstraints.get(j)));
	}
	if (this.getMembers() !== null && this.getMembers().size() > 0)
	{
		ret.put("Members", this.m_members);
	}
	ret.putNewList("DefaultResultSetAttributeNodes").addString(this.m_name);
	ret.putNewList("Hierarchies");
	ret.putBoolean("HierarchiesPossible", false);
	ret.putInteger("Length", 0);
	ret.putNewList("LevelHierarchies");
	ret.putBoolean("MultipleValues", true);
	if (oFF.notNull(this.m_hirachy))
	{
		ret.put("AttributeHierarchy", this.m_hirachy);
	}
	else
	{
		var hirachy = ret.putNewStructure("AttributeHierarchy");
		hirachy.putString("DefaultDisplayKeyAttribute", this.m_keyAttribute);
		hirachy.putString("DefaultKeyAttribute", this.m_keyAttribute);
		hirachy.put("DefaultTextAttribute", defaultResultsetattributeNames.get(0));
		hirachy.putNewList("Children");
		hirachy.put("AttributeNames", attributeNames);
		hirachy.put("DefaultResultSetAttributes", defaultResultsetattributeNames);
		hirachy.putString("Name", this.m_name);
		hirachy.putString("Description", this.m_description);
	}
	return ret;
};
oFF.GenericDimensionBuilder.prototype.getAxisDefault = function()
{
	return this.m_axisDefault;
};
oFF.GenericDimensionBuilder.prototype.setAxisDefault = function(m_axisDefault)
{
	this.m_axisDefault = m_axisDefault;
	return this;
};
oFF.GenericDimensionBuilder.prototype.getDataType = function()
{
	return this.m_dataType;
};
oFF.GenericDimensionBuilder.prototype.setDataType = function(m_dataType)
{
	this.m_dataType = m_dataType;
	return this;
};
oFF.GenericDimensionBuilder.prototype.getDefaultResultSetAttributeNodes = function()
{
	return this.m_defaultResultSetAttributeNodes;
};
oFF.GenericDimensionBuilder.prototype.setDefaultResultSetAttributeNodes = function(m_defaultResultSetAttributeNodes)
{
	this.m_defaultResultSetAttributeNodes = m_defaultResultSetAttributeNodes;
	return this;
};
oFF.GenericDimensionBuilder.prototype.getDefaultResultSetReadMode = function()
{
	return this.m_defaultResultSetReadMode;
};
oFF.GenericDimensionBuilder.prototype.setDefaultResultSetReadMode = function(m_defaultResultSetReadMode)
{
	this.m_defaultResultSetReadMode = m_defaultResultSetReadMode;
	return this;
};
oFF.GenericDimensionBuilder.prototype.getKeyAttribute = function()
{
	return this.m_keyAttribute;
};
oFF.GenericDimensionBuilder.prototype.setKeyAttribute = function(m_keyAttribute)
{
	this.m_keyAttribute = m_keyAttribute;
	return this;
};
oFF.GenericDimensionBuilder.prototype.getDimensionType = function()
{
	return this.m_dimensionType;
};
oFF.GenericDimensionBuilder.prototype.setDimensionType = function(m_dimensionType)
{
	this.m_dimensionType = m_dimensionType;
	return this;
};
oFF.GenericDimensionBuilder.prototype.getDefaultResultSetAttributes = function()
{
	return this.m_defaultResultSetAttributes;
};
oFF.GenericDimensionBuilder.prototype.setDefaultResultSetAttributes = function(m_defaultResultSetAttributes)
{
	this.m_defaultResultSetAttributes = m_defaultResultSetAttributes;
	return this;
};
oFF.GenericDimensionBuilder.prototype.setAxisConstraints = function(m_axisConstraints)
{
	this.m_axisConstraints = m_axisConstraints;
	return this;
};
oFF.GenericDimensionBuilder.prototype.putMember = function(attr)
{
	var member = oFF.PrFactory.createStructure();
	var keys = attr.getKeysAsReadOnlyListOfString();
	for (var i = 0; i < keys.size(); i++)
	{
		member.put(oFF.XStringUtils.concatenate3(this.m_name, ".", keys.get(i)), attr.getByKey(keys.get(i)));
	}
	var memberOperand = member.putNewStructure("MemberOperand");
	memberOperand.putString("Value", attr.getByKey("ID").asString().getString());
	memberOperand.putString("Description", attr.getByKey("LONG_TEXT").asString().getString());
	member.putString("Visibility", "Visible");
	member.putNewList("DefaultSelectedDimensions");
	member.putBoolean("IsSelectionCandidate", false);
	member.putString("ResultCalculation", "");
	member.putString("SingleValueCalculation", "");
	this.m_members.add(member);
	return this;
};
oFF.GenericDimensionBuilder.prototype.getMembers = function()
{
	return this.m_members;
};
oFF.GenericDimensionBuilder.prototype.setMembers = function(m_members)
{
	this.m_members = m_members;
};
oFF.GenericDimensionBuilder.prototype.getHirachy = function()
{
	return this.m_hirachy;
};
oFF.GenericDimensionBuilder.prototype.setHirachy = function(m_hirachy)
{
	this.m_hirachy = m_hirachy;
};

oFF.GenericEncodedList = {

	appendToPrList:function(l, o)
	{
			for (var i = 0; i < o.size(); i++)
		{
			l.add(o.get(i));
		}
		return l;
	},
	encodeNone:function(l)
	{
			var st = oFF.PrFactory.createStructure();
		st.putString("Encoding", "None");
		st.putInteger("Size", l.size());
		oFF.GenericEncodedList.appendToPrList(st.putNewList("Values"), l);
		return st;
	},
	encodeNone2:function(l)
	{
			var st = oFF.PrFactory.createStructure();
		st.putString("Encoding", "None");
		st.putInteger("Size", l.size());
		st.put("Values", l);
		return st;
	}
};

oFF.GenericResultSetBuilder = function() {};
oFF.GenericResultSetBuilder.prototype = new oFF.XObject();
oFF.GenericResultSetBuilder.prototype._ff_c = "GenericResultSetBuilder";

oFF.GenericResultSetBuilder.create = function()
{
	var obj = new oFF.GenericResultSetBuilder();
	obj.m_cells = oFF.GenericCellsBuilder.create();
	obj.m_axes = oFF.XList.create();
	return obj;
};
oFF.GenericResultSetBuilder.demoResultSet = function()
{
	oFF.OlapEngineModule.getInstance();
	oFF.OlapApiModule.getInstance();
	oFF.OlapEngineModule.getInstance();
	var b = oFF.GenericResultSetBuilder.create();
	var rows = oFF.GenericAxisBuilder.create().setName("Rows").setType("Rows");
	var columns = oFF.GenericAxisBuilder.create().setName("Columns").setType("Columns");
	b.getAxes().add(rows);
	b.getAxes().add(columns);
	var dim1 = oFF.GenericDimensionBuilder.create().setName("Country").setDescription("Origin Country").setDimensionType(3).setAxisDefault("Rows").setAxisConstraints(oFF.StringListBuilder.create().add("Columns").add("Rows").build()).setDataType(null).setKeyAttribute("Country.ID");
	dim1.getAttributes().add(oFF.GenericAttributeBuilder.create().setIsKey(true).setName("ID").setDataType("String"));
	dim1.getAttributes().add(oFF.GenericAttributeBuilder.create().setName("LONG_TEXT").setDataType("String"));
	rows.getDimensions().add(dim1);
	dim1 = oFF.GenericDimensionBuilder.create().setName("Product").setDescription("Origin Product").setDimensionType(3).setAxisDefault("Columns").setAxisConstraints(oFF.StringListBuilder.create().add("Columns").add("Rows").build()).setDataType(null).setKeyAttribute("Product.ID");
	dim1.getAttributes().add(oFF.GenericAttributeBuilder.create().setIsKey(true).setName("ID").setDataType("String"));
	dim1.getAttributes().add(oFF.GenericAttributeBuilder.create().setName("LONG_TEXT").setDataType("String"));
	rows.getDimensions().add(dim1);
	var dim2 = oFF.GenericDimensionBuilder.create().setName("Measure").setDescription("Data").setDimensionType(2).setAxisDefault("Columns").setAxisConstraints(oFF.StringListBuilder.create().add("Columns").add("Rows").build()).setDataType(null).setKeyAttribute("Measure.ID");
	dim2.getAttributes().add(oFF.GenericAttributeBuilder.create().setIsKey(true).setName("ID").setDataType("String"));
	dim2.getAttributes().add(oFF.GenericAttributeBuilder.create().setName("LONG_TEXT").setDataType("String"));
	var members = oFF.PrFactory.createList();
	var member = members.addNewStructure();
	member.putString("Measure.ID", "0");
	member.putString("Measure.LONG_TEXT", "Hello World");
	member.putString("Visibility", "Visible");
	member.putNewList("DefaultSelectedDimensions");
	member.putBoolean("IsSelectionCandidate", false);
	member.putString("ResultCalculation", "");
	member.putString("SingleValueCalculation", "");
	member = members.addNewStructure();
	member.putString("Measure.ID", "1");
	member.putString("Measure.LONG_TEXT", "Hello World 2");
	member.putString("Visibility", "Visible");
	member.putNewList("DefaultSelectedDimensions");
	member.putBoolean("IsSelectionCandidate", false);
	member.putString("ResultCalculation", "");
	member.putString("SingleValueCalculation", "");
	member = members.addNewStructure();
	member.putString("Measure.ID", "3");
	member.putString("Measure.LONG_TEXT", "Hello World 3");
	member.putString("Visibility", "Visible");
	member.putNewList("DefaultSelectedDimensions");
	member.putBoolean("IsSelectionCandidate", false);
	member.putString("ResultCalculation", "");
	member.putString("SingleValueCalculation", "");
	dim2.setMembers(members);
	columns.getDimensions().add(dim2);
	var hirachy = oFF.PrFactory.createStructure();
	hirachy.putString("DefaultDisplayKeyAttribute", "Measure.ID");
	hirachy.putString("DefaultKeyAttribute", "Measure.ID");
	hirachy.putString("DefaultTextAttribute", "Measure.LONG_TEXT");
	hirachy.putNewList("Children");
	hirachy.put("AttributeNames", oFF.PrListBuilder.create().add(oFF.PrFactory.createString("Measure.ID")).add(oFF.PrFactory.createString("Measure.LONG_TEXT")).build());
	hirachy.putNewList("DefaultResultSetAttributes").addString("Measure.LONG_TEXT");
	hirachy.putString("Name", "Measure");
	hirachy.putString("Description", "My Measure");
	dim2.setHirachy(hirachy);
	rows.appendTuple(new oFF.ListBuilder().init().add(oFF.PrFactory.createString("A")).add(oFF.PrFactory.createString("A")).build());
	b.append(new oFF.ListBuilder().init().add(oFF.PrFactory.createInteger(1)).add(oFF.PrFactory.createInteger(5)).add(oFF.PrFactory.createInteger(4)).add(oFF.PrFactory.createInteger(2)).build());
	rows.appendTuple(new oFF.ListBuilder().init().add(oFF.PrFactory.createString("A")).add(oFF.PrFactory.createString("B")).build());
	b.append(new oFF.ListBuilder().init().add(oFF.PrFactory.createInteger(1)).add(oFF.PrFactory.createInteger(5)).add(oFF.PrFactory.createInteger(4)).add(oFF.PrFactory.createInteger(2)).build());
	rows.appendTuple(new oFF.ListBuilder().init().add(oFF.PrFactory.createString("B")).add(oFF.PrFactory.createString("A")).build());
	b.append(new oFF.ListBuilder().init().add(oFF.PrFactory.createInteger(1)).add(oFF.PrFactory.createInteger(5)).add(oFF.PrFactory.createInteger(999)).add(oFF.PrFactory.createInteger(2)).build());
	rows.appendTuple(new oFF.ListBuilder().init().add(oFF.PrFactory.createString("B")).add(oFF.PrFactory.createString("B")).build());
	b.append(new oFF.ListBuilder().init().add(oFF.PrFactory.createInteger(1)).add(oFF.PrFactory.createInteger(5)).add(oFF.PrFactory.createInteger(4)).add(oFF.PrFactory.createInteger(2)).build());
	columns.appendTuple(new oFF.ListBuilder().init().add(oFF.PrFactory.createString("C")).build());
	columns.appendTuple(new oFF.ListBuilder().init().add(oFF.PrFactory.createString("D")).build());
	columns.appendTuple(new oFF.ListBuilder().init().add(oFF.PrFactory.createString("E")).build());
	columns.appendTuple(new oFF.ListBuilder().init().add(oFF.PrFactory.createString("F")).build());
	return b.toStructure();
};
oFF.GenericResultSetBuilder.main = function() {};
oFF.GenericResultSetBuilder.prototype.m_cells = null;
oFF.GenericResultSetBuilder.prototype.m_rows = 0;
oFF.GenericResultSetBuilder.prototype.m_columns = 0;
oFF.GenericResultSetBuilder.prototype.m_axes = null;
oFF.GenericResultSetBuilder.prototype.append = function(data)
{
	if (data.size() !== this.m_columns)
	{
		if (this.m_columns === 0)
		{
			this.m_columns = data.size();
		}
		else
		{
			throw oFF.XException.createIllegalStateException("changing column count while building resultset is unsupported");
		}
	}
	this.m_rows++;
	for (var k = 0; k < data.size(); k++)
	{
		this.m_cells.getCells().add(oFF.GenericCellBuilder.create().setValue(data.get(k)).setQueryDataCellReference(oFF.XInteger.convertToString(k + 1)));
	}
};
oFF.GenericResultSetBuilder.prototype.insert = function(row, column, data)
{
	if (column >= this.m_columns)
	{
		var newColumnSize = column + 1;
		for (var i = 0; i < this.m_rows; i++)
		{
			for (var j = this.m_columns; j < newColumnSize; j++)
			{
				this.m_cells.getCells().insert(i * newColumnSize + j, oFF.GenericCellBuilder.create().setValue(null).setQueryDataCellReference(oFF.XInteger.convertToString(j + 1)));
			}
		}
		this.m_columns = newColumnSize;
	}
	for (var l = this.m_rows - 1; l <= row; l++)
	{
		for (var m = 0; m < this.m_columns; m++)
		{
			this.m_cells.getCells().add(oFF.GenericCellBuilder.create().setValue(null).setQueryDataCellReference(oFF.XInteger.convertToString(m + 1)));
		}
	}
	if (this.m_rows <= row)
	{
		this.m_rows = row + 1;
	}
	this.m_cells.getCells().get(row * this.m_columns + column).setValue(data);
};
oFF.GenericResultSetBuilder.prototype.getAxes = function()
{
	return this.m_axes;
};
oFF.GenericResultSetBuilder.prototype.toStructure = function()
{
	var root = oFF.PrFactory.createStructure();
	var grids = root.putNewList("Grids").addNewStructure();
	var axes = grids.putNewList("Axes");
	for (var i = 0; i < this.m_axes.size(); i++)
	{
		axes.add(this.m_axes.get(i).toStructure());
	}
	if (this.m_rows > 0 && this.m_columns > 0)
	{
		grids.put("Cells", this.m_cells.toStructure());
	}
	grids.put("CellArraySizes", oFF.PrListBuilder.create().add(oFF.PrFactory.createInteger(this.m_rows)).add(oFF.PrFactory.createInteger(this.m_columns)).build());
	return root;
};
oFF.GenericResultSetBuilder.prototype.toStructureLimit = function(rowFrom, rowTo, columnFrom, columnTo)
{
	var root = oFF.PrFactory.createStructure();
	var grids = root.putNewList("Grids").addNewStructure();
	var axes = grids.putNewList("Axes");
	for (var i = 0; i < this.m_axes.size(); i++)
	{
		axes.add(this.m_axes.get(i).toStructurelimit(oFF.XString.isEqual(this.m_axes.get(i).getType(), "Rows") ? rowFrom : columnFrom, oFF.XString.isEqual(this.m_axes.get(i).getType(), "Rows") ? rowTo : columnTo));
	}
	if (this.m_rows > 0 && this.m_columns > 0)
	{
		grids.put("Cells", this.m_cells.toStructureLimit(rowFrom, rowTo, columnFrom, columnTo, this.m_columns));
	}
	grids.put("CellArraySizes", oFF.PrListBuilder.create().add(oFF.PrFactory.createInteger(oFF.XMath.min(this.m_rows, rowTo - rowFrom))).add(oFF.PrFactory.createInteger(oFF.XMath.min(this.m_columns, columnTo - columnFrom))).build());
	return root;
};
oFF.GenericResultSetBuilder.prototype.insertRow = function(j)
{
	this.m_rows++;
	for (var i = 0; i < this.m_columns; i++)
	{
		this.m_cells.getCells().insert(j * this.m_columns + i, oFF.GenericCellBuilder.create().setValue(null).setQueryDataCellReference(oFF.XInteger.convertToString(j + 1)));
	}
};
oFF.GenericResultSetBuilder.prototype.insertColumn = function(j)
{
	this.m_columns++;
	for (var i = 0; i < this.m_rows; i++)
	{
		this.m_cells.getCells().insert(i * this.m_columns + j, oFF.GenericCellBuilder.create().setValue(null).setQueryDataCellReference(oFF.XInteger.convertToString(j + 1)));
	}
};

oFF.GenericTupleBuilder = function() {};
oFF.GenericTupleBuilder.prototype = new oFF.XObject();
oFF.GenericTupleBuilder.prototype._ff_c = "GenericTupleBuilder";

oFF.GenericTupleBuilder.create = function()
{
	return new oFF.GenericTupleBuilder().init(oFF.XList.create());
};
oFF.GenericTupleBuilder.create2 = function(entries)
{
	return new oFF.GenericTupleBuilder().init(entries);
};
oFF.GenericTupleBuilder.prototype.m_tuples = null;
oFF.GenericTupleBuilder.prototype.init = function(entries)
{
	this.m_tuples = entries;
	return this;
};
oFF.GenericTupleBuilder.prototype.toStructure = function()
{
	var root = oFF.PrFactory.createStructure();
	var memberIndex = oFF.PrFactory.createList();
	var parentIndex = oFF.PrFactory.createList();
	var displayLevel = oFF.PrFactory.createList();
	var level = oFF.PrFactory.createList();
	var drillState = oFF.PrFactory.createList();
	for (var i = 0; i < this.m_tuples.size(); i++)
	{
		memberIndex.add(oFF.PrFactory.createDouble(this.m_tuples.get(i).getMemberIndex()));
		parentIndex.add(oFF.PrFactory.createDouble(this.m_tuples.get(i).getParentIndex()));
		displayLevel.add(oFF.PrFactory.createDouble(this.m_tuples.get(i).getDisplayLevel()));
		level.add(oFF.PrFactory.createDouble(this.m_tuples.get(i).getLevel()));
		drillState.add(oFF.PrFactory.createDouble(this.m_tuples.get(i).getDrillState()));
	}
	root.put("MemberIndexes", oFF.GenericEncodedList.encodeNone2(memberIndex));
	root.put("ParentIndexes", oFF.GenericEncodedList.encodeNone2(parentIndex));
	root.put("DisplayLevel", oFF.GenericEncodedList.encodeNone2(displayLevel));
	root.put("Level", oFF.GenericEncodedList.encodeNone2(level));
	root.put("DrillState", oFF.GenericEncodedList.encodeNone2(drillState));
	return root;
};
oFF.GenericTupleBuilder.prototype.toStructureLimit = function(start, end)
{
	var root = oFF.PrFactory.createStructure();
	var memberIndex = oFF.PrFactory.createList();
	var parentIndex = oFF.PrFactory.createList();
	var displayLevel = oFF.PrFactory.createList();
	var level = oFF.PrFactory.createList();
	var drillState = oFF.PrFactory.createList();
	for (var i = start; i < this.m_tuples.size() && i < end; i++)
	{
		memberIndex.add(oFF.PrFactory.createDouble(this.m_tuples.get(i).getMemberIndex()));
		parentIndex.add(oFF.PrFactory.createDouble(this.m_tuples.get(i).getParentIndex()));
		displayLevel.add(oFF.PrFactory.createDouble(this.m_tuples.get(i).getDisplayLevel()));
		level.add(oFF.PrFactory.createDouble(this.m_tuples.get(i).getLevel()));
		drillState.add(oFF.PrFactory.createDouble(this.m_tuples.get(i).getDrillState()));
	}
	root.put("MemberIndexes", oFF.GenericEncodedList.encodeNone2(memberIndex));
	root.put("ParentIndexes", oFF.GenericEncodedList.encodeNone2(parentIndex));
	root.put("DisplayLevel", oFF.GenericEncodedList.encodeNone2(displayLevel));
	root.put("Level", oFF.GenericEncodedList.encodeNone2(level));
	root.put("DrillState", oFF.GenericEncodedList.encodeNone2(drillState));
	return root;
};
oFF.GenericTupleBuilder.prototype.getEntries = function()
{
	return this.m_tuples;
};

oFF.GenericTupleEntryBuilder = function() {};
oFF.GenericTupleEntryBuilder.prototype = new oFF.XObject();
oFF.GenericTupleEntryBuilder.prototype._ff_c = "GenericTupleEntryBuilder";

oFF.GenericTupleEntryBuilder.create = function()
{
	return new oFF.GenericTupleEntryBuilder().init();
};
oFF.GenericTupleEntryBuilder.prototype.m_memberIndex = 0.0;
oFF.GenericTupleEntryBuilder.prototype.m_parentIndex = 0.0;
oFF.GenericTupleEntryBuilder.prototype.m_displayLevel = 0.0;
oFF.GenericTupleEntryBuilder.prototype.m_level = 0.0;
oFF.GenericTupleEntryBuilder.prototype.m_drillState = 0.0;
oFF.GenericTupleEntryBuilder.prototype.init = function()
{
	this.setMemberIndex(0);
	this.setParentIndex(-1);
	this.setDisplayLevel(0);
	this.setLevel(0);
	this.setDrillState(0);
	return this;
};
oFF.GenericTupleEntryBuilder.prototype.getMemberIndex = function()
{
	return this.m_memberIndex;
};
oFF.GenericTupleEntryBuilder.prototype.setMemberIndex = function(m_exception)
{
	this.m_memberIndex = m_exception;
	return this;
};
oFF.GenericTupleEntryBuilder.prototype.getParentIndex = function()
{
	return this.m_parentIndex;
};
oFF.GenericTupleEntryBuilder.prototype.setParentIndex = function(parentIndex)
{
	this.m_parentIndex = parentIndex;
	return this;
};
oFF.GenericTupleEntryBuilder.prototype.getDisplayLevel = function()
{
	return this.m_displayLevel;
};
oFF.GenericTupleEntryBuilder.prototype.setDisplayLevel = function(displayLevel)
{
	this.m_displayLevel = displayLevel;
	return this;
};
oFF.GenericTupleEntryBuilder.prototype.getLevel = function()
{
	return this.m_level;
};
oFF.GenericTupleEntryBuilder.prototype.setLevel = function(m_exceptionalertlevel)
{
	this.m_level = m_exceptionalertlevel;
	return this;
};
oFF.GenericTupleEntryBuilder.prototype.getDrillState = function()
{
	return this.m_drillState;
};
oFF.GenericTupleEntryBuilder.prototype.setDrillState = function(drillState)
{
	this.m_drillState = drillState;
	return this;
};

oFF.OlapSqlProcessor = function() {};
oFF.OlapSqlProcessor.prototype = new oFF.XObject();
oFF.OlapSqlProcessor.prototype._ff_c = "OlapSqlProcessor";

oFF.OlapSqlProcessor.create = function()
{
	return new oFF.OlapSqlProcessor().setServerInfo("/sap/sql/ina/GetServerInfo").setInaPath("/sap/sql/ina/GetResponse");
};
oFF.OlapSqlProcessor.prototype.m_serverInfo = null;
oFF.OlapSqlProcessor.prototype.m_inaPath = null;
oFF.OlapSqlProcessor.prototype.m_metaData = null;
oFF.OlapSqlProcessor.prototype.setServerInfo = function(serverInfo)
{
	this.m_serverInfo = serverInfo;
	return this;
};
oFF.OlapSqlProcessor.prototype.setInaPath = function(inaPath)
{
	this.m_inaPath = inaPath;
	return this;
};
oFF.OlapSqlProcessor.prototype.setMetaData = function(metaData)
{
	this.m_metaData = metaData;
	return this;
};
oFF.OlapSqlProcessor.prototype.execSyncQuery = function(driver, sql)
{
	var xres = driver.processExecuteQuery(oFF.SyncType.BLOCKING, null, null, sql);
	if (xres.getData() === null)
	{
		throw oFF.XException.createRuntimeException(driver.hasErrors() ? driver.getErrors().get(driver.getErrors().size() - 1).getText() : "Unknown sql error");
	}
	return xres.getData();
};
oFF.OlapSqlProcessor.prototype.onProcess = function(req, serverPath, driver)
{
	try
	{
		if (oFF.XString.isEqual(serverPath, this.m_serverInfo))
		{
			return oFF.XPair.create(oFF.XIntegerValue.create(200), oFF.JsonParserFactory.createFromString("{\"ServerInfo\":{\"DataBaseManagementSystem\":\"HDB\",\"SystemId\":\"BIX\",\"Client\":\"001\",\"UserLanguageCode\":\"EN\",\"ReentranceTicket\":\"AjQxMDMBABhBAE4AWgBFAEkARwBFAFIAIAAgACAAIAACAAYwADAAMQADABBCAEkAWAAgACAAIAAgACAABAAYMgAwADIAMQAxADAAMQA1ADEAMAAwADUABwAEAAAAAggAAQEJAAJFAA8AAzAwMRAACEJJWCAgICAg/wD8MIH5BgkqhkiG9w0BBwKggeswgegCAQExCzAJBgUrDgMCGgUAMAsGCSqGSIb3DQEHATGByDCBxQIBATAaMA4xDDAKBgNVBAMTA0JJWAIICiAVERITGQEwCQYFKw4DAhoFAKBdMBgGCSqGSIb3DQEJAzELBgkqhkiG9w0BBwEwHAYJKoZIhvcNAQkFMQ8XDTIxMTAxNTEwMDU1MFowIwYJKoZIhvcNAQkEMRYEFPrcJrRp12yWu!A5iTm3jzcglq5AMAkGByqGSM44BAMELzAtAhRhD2J3MOsawGvbkQAL5TpswR7b2AIVAJ8RUQj4uPcfhQ0!v99ocCEctIyW\"},\"Services\":[{\"Capabilities\":[{\"Capability\":\"SuppressQueryDataCells\"},{\"Capability\":\"ValueHelpWithAttributes\"},{\"Capability\":\"TuplesOperand\"},{\"Capability\":\"DetailedResponseExpansion\"},{\"Capability\":\"SupportsOperatorVariance\"},{\"Capability\":\"SupportsSpatialFilter\"},{\"Capability\":\"SpatialFilterSRID\"},{\"Capability\":\"SupportsSpatialTransformations\"},{\"Capability\":\"SpatialChoropleth\"},{\"Capability\":\"SpatialClustering\"},{\"Capability\":\"SupportsIgnoreExternalDimensions\"},{\"Capability\":\"ResultSetInterval\"},{\"Capability\":\"SupportsExtendedSort\"},{\"Capability\":\"SubmitReturnsVariableValues\"},{\"Capability\":\"RRI\"},{\"Capability\":\"ZeroSuppression\"},{\"Capability\":\"LogOffPath\",\"Value\":\"/sap/bw/ina/Logoff\"},{\"Capability\":\"AttributeHierarchyHierarchyFields\"},{\"Capability\":\"HierarchyNavigationCounter\"},{\"Capability\":\"NewValuesExtendedFormat\"},{\"Capability\":\"RsCellValueTypes\"},{\"Capability\":\"QDataCells\"},{\"Capability\":\"Supplements\"},{\"Capability\":\"HierarchyNameVariable\"},{\"Capability\":\"FastPath\",\"Value\":\"/sap/bw/ina/GetResponse\"},{\"Capability\":\"FastPathXXLWebService\",\"Value\":\"/sap/bw/ina/GetXXLValue\"},{\"Capability\":\"NewValuesImplicitUnlock\"},{\"Capability\":\"ExtendedDimensionTypes\"},{\"Capability\":\"ChangeCounter\"},{\"Capability\":\"ActionClose\"},{\"Capability\":\"SupportsCummulative\"},{\"Capability\":\"HierarchyCatalog\"},{\"Capability\":\"CatalogServiceV20\"},{\"Capability\":\"SAPDate\"},{\"Capability\":\"ExtHierarchy\"},{\"Capability\":\"VariableReSubmit\"},{\"Capability\":\"SemanticalErrorType\"},{\"Capability\":\"AttributeHierarchy\"},{\"Capability\":\"ClientCapabilities\"},{\"Capability\":\"CellsValueFormatted\"},{\"Capability\":\"MaxResultRecords\"},{\"Capability\":\"StatefulServer\",\"Description\":\"User Session is stateful. Please use url /sap/public/bc/icf/logoff?sap-client=000 to close session.\"},{\"Capability\":\"SupportsSetOperand\"},{\"Capability\":\"ReadMode\"},{\"Capability\":\"ServerStructureNames\"},{\"Capability\":\"SupportsEncodedResultSet\"},{\"Capability\":\"Obtainability\"},{\"Capability\":\"Workspace\",\"Description\":\"BPC workspace integration\"},{\"Capability\":\"DatasourceAtService\"},{\"Capability\":\"Workstatus\",\"Description\":\"BPC workstatus integration\"},{\"Capability\":\"PagingTupleCountTotal\"},{\"Capability\":\"MetadataBaseMeasureName\"},{\"Capability\":\"SupportsHierarchySelectionAsFlatSelection\"},{\"Capability\":\"SupportsDimensionFilterCapability\"},{\"Capability\":\"DimF4SelectionWithCompoundment\"},{\"Capability\":\"Exceptions\"},{\"Capability\":\"Conditions\"},{\"Capability\":\"DefinitionReturnsVariableValues\"},{\"Capability\":\"SupportsDataCellMixedValues\"},{\"Capability\":\"SupportsCalculatedKeyFigures\"},{\"Capability\":\"SupportsRestrictedKeyFigures\"},{\"Capability\":\"StackedRestrictionsCheck\"},{\"Capability\":\"SupportsOriginalTexts\"},{\"Capability\":\"UnifiedDataCells\"},{\"Capability\":\"MDSLikePaging\"},{\"Capability\":\"HierarchyLevelOffsetFilter\"},{\"Capability\":\"CartesianFilterIntersect\"},{\"Capability\":\"SupportsMemberValueExceptions\"},{\"Capability\":\"SupportsKeyfigureHierarchies\"},{\"Capability\":\"ExpandHierarchyBottomUp\"},{\"Capability\":\"InitialDrillLevelRelative\"},{\"Capability\":\"MDMHierarchyWithDrillLevel\"},{\"Capability\":\"SupportsDataRefresh\"},{\"Capability\":\"SupportsDataRefreshAndDataTopicality\"},{\"Capability\":\"ResultSetAxisType\"},{\"Capability\":\"DimensionHierarchyLevels\"},{\"Capability\":\"SupportsVariableVariants\"},{\"Capability\":\"ReadModesV2\"},{\"Capability\":\"ExceptionsV2\"},{\"Capability\":\"SupportsSIDPresentation\"},{\"Capability\":\"VariableMasking\"},{\"Capability\":\"ComplexTupleFilter\"},{\"Capability\":\"ExtendedVariableDefinition\"},{\"Capability\":\"PresentationLength\"},{\"Capability\":\"SuppressKeyfigureCalculation\"},{\"Capability\":\"RemoteBlending\"},{\"Capability\":\"CubeBlending\"},{\"Capability\":\"StructureHierarchyZeroBased\"},{\"Capability\":\"MaintainsVariableVariants\"},{\"Capability\":\"ResultSetUnitIndex\"},{\"Capability\":\"CustomMeasureSortOrder\"},{\"Capability\":\"ExceptionAggregationDimsAndFormulas\"},{\"Capability\":\"UniversalDisplayHierarchyZeroBased\"},{\"Capability\":\"QDataCellModelDefaults\"},{\"Capability\":\"SupportsMemberVisibility\"},{\"Capability\":\"SupportsMemberVisibility\"},{\"Capability\":\"UniversalDisplayHierarchyAlignment\"},{\"Capability\":\"ClientInfo\"},{\"Capability\":\"StructureRestrictionsInValueHelp\"},{\"Capability\":\"SupportsOperatorTotals\"},{\"Capability\":\"QueryCurrencyTranslation\"},{\"Capability\":\"UniversalDisplayHierarchyCustomDimensions\"},{\"Capability\":\"INACurrentMember\"},{\"Capability\":\"DynamicRestrictionOnFormula\"},{\"Capability\":\"SuppressSupplements\"},{\"Capability\":\"TextInHierarchy\"},{\"Capability\":\"F4FilterForTextField\"},{\"Capability\":\"RespectUnassignedNodeSetting\"},{\"Capability\":\"ResultSetHierarchyLevel\"},{\"Capability\":\"TransientHierarchy1\"},{\"Capability\":\"DynamicMembersOnNonMeasureStructure\"},{\"Capability\":\"VariableAutoSubmit\"},{\"Capability\":\"ResultStructure\"}],\"Service\":\"Analytics\"},{\"Capabilities\":[{\"Capability\":\"EnableClientEPMPlugin\",\"Value\":\"false\"}],\"Service\":\"BWSettings\"},{\"Capabilities\":[{\"Capability\":\"FastPath\",\"Value\":\"/sap/bw/ina/GetCatalog\"},{\"Capability\":\"ExtendedDimensionTypes\"},{\"Capability\":\"HierarchyCatalog\"},{\"Capability\":\"SemanticalErrorType\"},{\"Capability\":\"AttributeHierarchy\"},{\"Capability\":\"ClientCapabilities\"},{\"Capability\":\"SupportsNonCartesianProduct\"},{\"Capability\":\"SupportsEncodedResultSet\"},{\"Capability\":\"SupportsDimensionFilterCapability\"}],\"Service\":\"Catalog\"},{\"Capabilities\":[{\"Capability\":\"FastPath\",\"Value\":\"/sap/bw/ina/GetResponse\"},{\"Capability\":\"Paging\",\"Value\":\"Y\"}],\"Service\":\"HierarchyMember\"},{\"Capabilities\":[{\"Capability\":\"SupportsBatch\",\"Value\":\"/sap/bw/ina/BatchProcessing\"}],\"Service\":\"InA\"},{\"Capabilities\":[{\"Capability\":\"FastPath\",\"Value\":\"/sap/bw/ina/GetResponse\"},{\"Capability\":\"SupportsExtendedSort\"}],\"Service\":\"Masterdata\"},{\"Capabilities\":[{\"Capability\":\"AttributeHierarchyHierarchyFields\"},{\"Capability\":\"ClientCapabilities\"},{\"Capability\":\"DatasourceAtService\"},{\"Capability\":\"FastPath\",\"Value\":\"/sap/bw/ina/GetResponse\"},{\"Capability\":\"HierarchyCatalog\"},{\"Capability\":\"HierarchyNavigationCounter\"},{\"Capability\":\"NewValuesExtendedFormat\"},{\"Capability\":\"NewValuesImplicitUnlock\"},{\"Capability\":\"Obtainability\"},{\"Capability\":\"QDataCells\"},{\"Capability\":\"ResultSetInterval\"},{\"Capability\":\"SAPDate\"},{\"Capability\":\"StatefulServer\"},{\"Capability\":\"Supplements\"},{\"Capability\":\"SupportsCummulative\"},{\"Capability\":\"SupportsEncodedResultSet\"},{\"Capability\":\"SupportsSetOperand\"},{\"Capability\":\"VariableReSubmit\"},{\"Capability\":\"ZeroSuppression\"},{\"Capability\":\"AttributeHierarchy\"},{\"Capability\":\"DefinitionReturnsVariableValues\"},{\"Capability\":\"DetailedResponseExpansion\"},{\"Capability\":\"DimensionHierarchyLevels\"},{\"Capability\":\"ExceptionsV2\"},{\"Capability\":\"ExpandHierarchyBottomUp\"},{\"Capability\":\"ExpandQueryAxis\"},{\"Capability\":\"ExtendedDimensionTypes\"},{\"Capability\":\"ExtendedVariableDefinition\"},{\"Capability\":\"F4FilterForTextField\"},{\"Capability\":\"HierarchyNameVariable\"},{\"Capability\":\"InitialDrillLevelRelative\"},{\"Capability\":\"MDSLikePaging\"},{\"Capability\":\"MetadataBaseMeasureName\"},{\"Capability\":\"PresentationLength\"},{\"Capability\":\"QDataCellModelDefaults\"},{\"Capability\":\"ReadModesV2\"},{\"Capability\":\"RespectUnassignedNodeSetting\"},{\"Capability\":\"StructureHierarchyZeroBased\"},{\"Capability\":\"SubmitReturnsVariableValues\"},{\"Capability\":\"SupportsDataCellMixedValues\"},{\"Capability\":\"SupportsExtendedSort\"},{\"Capability\":\"SupportsKeyfigureHierarchies\"},{\"Capability\":\"SupportsMemberVisibility\"},{\"Capability\":\"SupportsRestrictedKeyFigures\"},{\"Capability\":\"SupportsSIDPresentation\"},{\"Capability\":\"SuppressSupplements\"},{\"Capability\":\"UniversalDisplayHierarchyZeroBased\"},{\"Capability\":\"TextInHierarchy\"}],\"Service\":\"Planning\"},{\"Capabilities\":[{\"Capability\":\"FastPath\",\"Value\":\"/sap/bw/ina/GetResponse\"},{\"Capability\":\"SupportsEncodedResultSet\"},{\"Capability\":\"ServerStructureNames\"},{\"Capability\":\"DatasourceAtService\"},{\"Capability\":\"SupportsSetOperand\"},{\"Capability\":\"Obtainability\"},{\"Capability\":\"AttributeHierarchy\"}],\"Service\":\"QueryDefinition\"},{\"Capabilities\":[{\"Capability\":\"FastPath\",\"Value\":\"/sap/bw/ina/GetResponse\"}],\"Service\":\"UserManagement\"},{\"Capabilities\":[{\"Capability\":\"FastPath\",\"Value\":\"/sap/bw/ina/ValueHelp\"},{\"Capability\":\"ExtendedDimensionTypes\"},{\"Capability\":\"SemanticalErrorType\"},{\"Capability\":\"AttributeHierarchy\"},{\"Capability\":\"ClientCapabilities\"},{\"Capability\":\"SupportsEncodedResultSet\"},{\"Capability\":\"InitialDrillLevelRelative\"}],\"Service\":\"ValueHelp\"},{\"Capabilities\":[{\"Capability\":\"FastPath\",\"Value\":\"/sap/bw/ina/GetResponse\"}],\"Service\":\"Workspace\"},{\"Capabilities\":[],\"Service\":\"Metadata\"}],\"Settings\":{\"EnableClientEPMPlugin\":\"false\"} }"));
		}
		else if (oFF.XString.isEqual(serverPath, this.m_inaPath))
		{
			if (req.asStructure().containsKey("Metadata"))
			{
				if (req.asStructure().containsKey("Metadata") && req.asStructure().getStructureByKey("Metadata").containsKey("DataSource") && oFF.XString.isEqual(req.asStructure().getStructureByKey("Metadata").getStructureByKey("DataSource").getStringByKey("ObjectName"), "$$DataSource$$"))
				{
					return oFF.XPair.create(oFF.XIntegerValue.create(200), this.generateMetadata2().toStructure());
				}
				else
				{
					var cube = this.generateMetadata(driver, req.asStructure().getStructureByKey("Metadata").getStructureByKey("DataSource").getStringByKey("ObjectName"));
					return oFF.XPair.create(oFF.XIntegerValue.create(200), cube.toStructure());
				}
			}
			else
			{
				var subSetDescription = req.asStructure().getStructureByKey("Analytics").getStructureByKey("Definition").getStructureByKey("ResultSetFeatureRequest").getStructureByKey("SubSetDescription");
				if (req.asStructure().containsKey("Analytics") && req.asStructure().getStructureByKey("Analytics").containsKey("DataSource") && oFF.XString.isEqual(req.asStructure().getStructureByKey("Analytics").getStructureByKey("DataSource").getStringByKey("ObjectName"), "$$DataSource$$"))
				{
					return oFF.XPair.create(oFF.XIntegerValue.create(200), this.generateResultSet(subSetDescription.getIntegerByKey("RowFrom"), subSetDescription.getIntegerByKey("RowTo")).toStructure());
				}
				else
				{
					var objectName = req.asStructure().getStructureByKey("Analytics").getStructureByKey("DataSource").getStringByKey("ObjectName");
					var mycube = this.generateMetadata(driver, objectName);
					var source = oFF.SqlReference.create("CustomDimension1");
					var alias = "CustomDimension1";
					var rawsource = null;
					var olapreq = this.convertToOlapRequest(req.asStructure().getStructureByKey("Analytics").getStructureByKey("Definition").getListByKey("Dimensions"));
					if (oFF.notNull(this.m_metaData) && this.m_metaData.isStructure())
					{
						var dataSources = this.m_metaData.asStructure().getListByKey("DataSources");
						for (var i = 0, size = dataSources.size(); i < size; i++)
						{
							if (oFF.XString.isEqual(objectName, dataSources.getStructureAt(i).getStringByKey("Name")))
							{
								var sqlDataSource = dataSources.getStructureAt(i).getStringByKey("SqlDataSource");
								var filter = req.asStructure().getStructureByKey("Analytics").getStructureByKey("Definition").getStructureByKey("Filter");
								var dynamicFilter = req.asStructure().getStructureByKey("Analytics").getStructureByKey("Definition").getStructureByKey("DynamicFilter");
								if (oFF.isNull(dynamicFilter))
								{
									dynamicFilter = filter;
								}
								var op = null;
								if (oFF.notNull(dynamicFilter))
								{
									var selection = dynamicFilter.getStructureByKey("Selection");
									op = new oFF.OlapFilterToSqlConverter().evaluateSelection(selection);
								}
								if (oFF.XString.containsString(sqlDataSource, " "))
								{
									sqlDataSource = oFF.SqlOperation.format("({0}) \"datasource\"", new oFF.StringListBuilder().init().add(sqlDataSource).build());
									alias = "datasource";
								}
								else
								{
									sqlDataSource = oFF.SqlOperation.format("{0} \"datasource\"", new oFF.StringListBuilder().init().add(sqlDataSource).build());
									alias = "datasource";
								}
								rawsource = source = oFF.RawSqlTableSource.create(sqlDataSource);
								var filtered = this.filterAxis(req, alias, this.convertToOlapRequest(mycube.toStructure().asStructure().getStructureByKey("Cube").getListByKey("Dimensions")), source, "");
								if (oFF.notNull(op))
								{
									sqlDataSource = oFF.SqlOperation.format("(select * from ({0}) \"datasource\" where {1}) \"datasource\"", new oFF.StringListBuilder().init().add(filtered.toSqlString(new oFF.SqlCodeGenOptions())).add(op.toSqlString(new oFF.SqlCodeGenOptions())).build());
									alias = "datasource";
								}
								else
								{
									sqlDataSource = oFF.SqlOperation.format("({0}) \"datasource\"", new oFF.StringListBuilder().init().add(filtered.toSqlString(new oFF.SqlCodeGenOptions())).build());
									alias = "datasource";
								}
								source = oFF.RawSqlTableSource.create(sqlDataSource);
							}
						}
					}
					var rows = oFF.SqlQuery.create().from(source).setDistinct(true);
					var columns = oFF.SqlQuery.create().from(source).setDistinct(true);
					var combinedQuery = oFF.SqlQuery.create();
					combinedQuery.select(new oFF.SqlSelectAll().setTableReference(oFF.SqlReference.create(alias)));
					var mergecond = null;
					var measureonRows = false;
					var hasDimOnRow = false;
					var hasDimOnColumn = false;
					var rmeasureAxis = oFF.SqlQuery.create();
					var cmeasureAxis = oFF.SqlQuery.create();
					for (var v = 0; v < olapreq.getRequest().size(); ++v)
					{
						var query = olapreq.getRequest().get(v).getType() === oFF.OlapRequestEntryType.COLUMN ? columns : rows;
						if (olapreq.getRequest().get(v).getDim().getType() === oFF.OlapDimensionType.NORMAL)
						{
							if (olapreq.getRequest().get(v).getType() === oFF.OlapRequestEntryType.COLUMN)
							{
								hasDimOnColumn = true;
							}
							else
							{
								hasDimOnRow = true;
							}
							var buf2 = oFF.SqlSelectAlias.create(oFF.SqlCast.create(oFF.SqlReference.create2(alias, olapreq.getRequest().get(v).getDim().getName()), "varchar"), olapreq.getRequest().get(v).getDim().getName());
							query.select(buf2);
							var measureAxis = olapreq.getRequest().get(v).getType() === oFF.OlapRequestEntryType.COLUMN ? cmeasureAxis : rmeasureAxis;
							measureAxis.select(oFF.SqlReference.create(olapreq.getRequest().get(v).getDim().getName()));
							measureAxis.groupBy(oFF.SqlReference.create(olapreq.getRequest().get(v).getDim().getName()));
							var desc = false;
							var sort = req.asStructure().getStructureByKey("Analytics").getStructureByKey("Definition").getListByKey("Sort");
							if (oFF.notNull(sort))
							{
								for (var b = 0; b < sort.size(); b++)
								{
									if (oFF.XString.isEqual(sort.getStructureAt(b).getStringByKey("Dimension"), olapreq.getRequest().get(v).getDim().getName()) && oFF.XString.isEqual(sort.getStructureAt(b).getStringByKey("Direction"), "Desc"))
									{
										desc = true;
									}
								}
							}
							query.orderBy(oFF.SqlReference.create(olapreq.getRequest().get(v).getDim().getName()), desc);
							var cond = oFF.SqlOperation.equals(oFF.SqlReference.create2(alias, olapreq.getRequest().get(v).getDim().getName()), oFF.SqlReference.create2(olapreq.getRequest().get(v).getType() === oFF.OlapRequestEntryType.COLUMN ? "c" : "r", olapreq.getRequest().get(v).getDim().getName()));
							var curcol = oFF.SqlReference.create2(alias, olapreq.getRequest().get(v).getDim().getName());
							combinedQuery.groupBy(curcol);
							if (oFF.isNull(mergecond))
							{
								mergecond = cond;
							}
							else
							{
								mergecond = oFF.SqlOperation.and(mergecond, cond);
							}
						}
						else if (olapreq.getRequest().get(v).getDim().getType() === oFF.OlapDimensionType.MEASURE)
						{
							query.select(oFF.SqlReference.create(olapreq.getRequest().get(v).getDim().getName()));
							if (olapreq.getRequest().get(v).getType() === oFF.OlapRequestEntryType.ROW)
							{
								measureonRows = true;
							}
							for (var u = 0, ulen = olapreq.getRequest().get(v).getDim().getMembers().size(); u < ulen; u++)
							{
								combinedQuery.groupBy(oFF.SqlReference.create2(alias, olapreq.getRequest().get(v).getDim().getMembers().get(u).getName()));
							}
						}
					}
					var rowsreq = this.virtualAxisRequest(req, alias, olapreq, rows, hasDimOnRow, oFF.OlapRequestEntryType.ROW, measureonRows, 0, -1);
					var columnsreq = this.virtualAxisRequest(req, alias, olapreq, columns, hasDimOnColumn, oFF.OlapRequestEntryType.COLUMN, !measureonRows, 0, -1);
					var rowFrom = subSetDescription.getIntegerByKey("RowFrom");
					var rowTo = subSetDescription.getIntegerByKey("RowTo");
					if (rowTo === -1)
					{
						rowTo = rowFrom + 500;
					}
					var rowCount = rowTo - rowFrom;
					var columnFrom = subSetDescription.getIntegerByKey("ColumnFrom");
					var columnTo = subSetDescription.getIntegerByKey("ColumnTo");
					if (columnTo === -1)
					{
						columnTo = columnFrom + 500;
					}
					var columnCount = columnTo - columnFrom;
					var rowsreqlimited = this.virtualAxisRequest(req, alias, olapreq, rows, hasDimOnRow, oFF.OlapRequestEntryType.ROW, measureonRows, rowFrom, rowCount);
					var columnsreqlimited = this.virtualAxisRequest(req, alias, olapreq, columns, hasDimOnColumn, oFF.OlapRequestEntryType.COLUMN, !measureonRows, columnFrom, columnCount);
					var rawRows = oFF.SqlTableAlias.create(rowsreqlimited, "r");
					var rawColumns = oFF.SqlTableAlias.create(columnsreqlimited, "c");
					if (measureonRows)
					{
						combinedQuery.from(rawColumns);
						combinedQuery.from(oFF.SqlTableAlias.create(rmeasureAxis, "r"));
						rmeasureAxis.from(rawRows);
						if (rmeasureAxis.getSelection().size() === 0)
						{
							rmeasureAxis.select(oFF.SqlSelectAlias.create(oFF.SqlIntegerConstant.create(0), "___INA_SQL_DUMMY"));
							rmeasureAxis.orderBy(oFF.SqlReference.create("___INA_SQL_DUMMY"), false);
						}
					}
					else
					{
						combinedQuery.from(oFF.SqlTableAlias.create(cmeasureAxis, "c"));
						combinedQuery.from(rawRows);
						cmeasureAxis.from(rawColumns);
						if (cmeasureAxis.getSelection().size() === 0)
						{
							cmeasureAxis.select(oFF.SqlSelectAlias.create(oFF.SqlIntegerConstant.create(0), "___INA_SQL_DUMMY"));
							cmeasureAxis.orderBy(oFF.SqlReference.create("___INA_SQL_DUMMY"), false);
						}
					}
					var srcsqlstmt = olapreq.setDataSource(rawsource, alias).ToSql();
					combinedQuery.from(oFF.RawSqlTableSource.create(oFF.SqlOperation.format("({0}) \"{1}\"", new oFF.StringListBuilder().init().add(srcsqlstmt).add(alias).build())));
					if (oFF.notNull(mergecond))
					{
						combinedQuery.where(mergecond.toSqlString(new oFF.SqlCodeGenOptions()));
					}
					var sqlstmt = combinedQuery.toSqlString(new oFF.SqlCodeGenOptions());
					var sqlrows = hasDimOnRow || measureonRows ? this.execSyncQuery(driver, rowsreqlimited.toSqlString(new oFF.SqlCodeGenOptions())) : oFF.SqlJsonResultSet.create(oFF.JsonParserFactory.createFromString("[{\"columns\":[],\"values\":[[]]}]").asList());
					var sqlcolumns = hasDimOnColumn || !measureonRows ? this.execSyncQuery(driver, columnsreqlimited.toSqlString(new oFF.SqlCodeGenOptions())) : oFF.SqlJsonResultSet.create(oFF.JsonParserFactory.createFromString("[{\"columns\":[],\"values\":[[]]}]").asList());
					var sqlresultSet = this.execSyncQuery(driver, sqlstmt);
					var sqlrowcountstmtresultset = hasDimOnRow || measureonRows ? this.execSyncQuery(driver, oFF.SqlOperation.format("select count(*) from ({0}) x", new oFF.StringListBuilder().init().add(rowsreq.toSqlString(new oFF.SqlCodeGenOptions())).build())) : null;
					var sqlcolumncountstmtresultset = hasDimOnColumn || !measureonRows ? this.execSyncQuery(driver, oFF.SqlOperation.format("select count(*) from ({0}) x", new oFF.StringListBuilder().init().add(columnsreq.toSqlString(new oFF.SqlCodeGenOptions())).build())) : null;
					var totalRows = oFF.notNull(sqlrowcountstmtresultset) && sqlrowcountstmtresultset.next() ? oFF.XDouble.convertToInt(sqlrowcountstmtresultset.getDoubleAt(0)) : 1;
					var totalColumns = oFF.notNull(sqlcolumncountstmtresultset) && sqlcolumncountstmtresultset.next() ? oFF.XDouble.convertToInt(sqlcolumncountstmtresultset.getDoubleAt(0)) : 1;
					return oFF.XPair.create(oFF.XIntegerValue.create(200), this.ConvertResultSet(sqlresultSet, olapreq, mycube, rowCount, columnCount, totalRows, totalColumns, rowTo, columnTo, sqlrows, sqlcolumns));
				}
			}
		}
		return oFF.XPair.create(oFF.XIntegerValue.create(404), oFF.PrStructure.create());
	}
	catch (except)
	{
		var internalServerError = oFF.PrStructure.create();
		internalServerError.putString("message", oFF.XException.getMessage(except));
		internalServerError.putString("stacktrace", oFF.XException.getStackTrace(except, 0));
		return oFF.XPair.create(oFF.XIntegerValue.create(500), internalServerError);
	}
};
oFF.OlapSqlProcessor.prototype.filterAxis = function(req, alias, olapreq, source, whereFilter)
{
	var axisentries = oFF.XList.create();
	var measure_entry = -1;
	for (var a = 0; a < olapreq.getRequest().size(); ++a)
	{
		if (olapreq.getRequest().get(a).getDim().getType() === oFF.OlapDimensionType.NORMAL)
		{
			axisentries.add(oFF.SqlReference.create(olapreq.getRequest().get(a).getDim().getName()));
		}
		else
		{
			measure_entry = a;
			axisentries.add(null);
		}
	}
	if (measure_entry !== -1)
	{
		var members = olapreq.getRequest().get(measure_entry).getDim().getMembers();
		if (members.size() > 0)
		{
			var measureUnion = null;
			for (var h = 0; h < members.size(); h++)
			{
				var measureQuery = oFF.SqlQuery.create();
				for (var c = 0; c < axisentries.size(); c++)
				{
					if (axisentries.get(c) === null)
					{
						measureQuery.select(oFF.SqlSelectAlias.create(oFF.SqlStringConstant.create(members.get(h).getName()), olapreq.getRequest().get(measure_entry).getDim().getName()));
					}
					else
					{
						measureQuery.select(axisentries.get(c));
					}
				}
				for (var g = 0; g < members.size(); g++)
				{
					if (members.get(g).getRawValue() === null)
					{
						measureQuery.select(oFF.SqlReference.create(members.get(g).getName()));
					}
				}
				measureQuery.from(source);
				if (oFF.isNull(measureUnion))
				{
					measureUnion = measureQuery;
				}
				else
				{
					measureUnion = oFF.SqlUnion.create(measureUnion, measureQuery);
				}
			}
			return measureUnion;
		}
	}
	var dummyQuery = oFF.SqlQuery.create();
	for (var k = 0; k < axisentries.size(); k++)
	{
		if (axisentries.get(k) !== null)
		{
			dummyQuery.select(axisentries.get(k));
		}
	}
	dummyQuery.from(source);
	return dummyQuery;
};
oFF.OlapSqlProcessor.prototype.virtualAxisRequest = function(req, alias, olapreq, axis, hasDimOnAxis, curaxis, hasMeasure, offset, limit)
{
	var virtualAxis = oFF.SqlWith.create();
	virtualAxis.addDependency("q0", axis);
	if (axis.getSelection().size() === 0)
	{
		axis.select(oFF.SqlSelectAlias.create(oFF.SqlIntegerConstant.create(0), "___INA_SQL_DUMMY"));
		axis.orderBy(oFF.SqlReference.create("___INA_SQL_DUMMY"), false);
	}
	var finalSelector = oFF.SqlQuery.create();
	finalSelector.selectAll();
	finalSelector.limit(offset, limit);
	virtualAxis.setBody(finalSelector);
	var axisentries = oFF.XList.create();
	for (var a = 0; a < olapreq.getRequest().size(); ++a)
	{
		if (olapreq.getRequest().get(a).getType() === curaxis)
		{
			if (olapreq.getRequest().get(a).getDim().getType() === oFF.OlapDimensionType.NORMAL)
			{
				axisentries.add(oFF.SqlReference.create(olapreq.getRequest().get(a).getDim().getName()));
			}
			else
			{
				if (hasMeasure)
				{
					axisentries.add(oFF.SqlReference.create(olapreq.getRequest().get(a).getDim().getName()));
				}
			}
		}
	}
	var qi = 0;
	for (var e = 0, axisentry = 0; e < olapreq.getRequest().size(); ++e)
	{
		if (olapreq.getRequest().get(e).getType() === curaxis)
		{
			if (olapreq.getRequest().get(e).getDim().getType() === oFF.OlapDimensionType.NORMAL)
			{
				var curcol2 = oFF.SqlReference.create2(alias, olapreq.getRequest().get(e).getDim().getName());
				if (olapreq.getRequest().get(e).getHasTotal())
				{
					var isTotal2 = oFF.SqlOperation.equals(curcol2, oFF.SqlStringConstant.create("___INA_SQL_TOTAL"));
					finalSelector.orderBy(oFF.RawSqlConstant.create(oFF.SqlOperation.format("CASE WHEN {0} THEN 1 ELSE 2 END", oFF.StringListBuilder.create().add(isTotal2.toSqlString(new oFF.SqlCodeGenOptions())).build())), olapreq.getRequest().get(e).getFollowedByTotal());
					var totalQuery = oFF.SqlQuery.create();
					for (var g = 0; g < axisentries.size(); g++)
					{
						if (g === axisentry)
						{
							totalQuery.select(oFF.SqlSelectAlias.create(oFF.SqlStringConstant.create("___INA_SQL_TOTAL"), olapreq.getRequest().get(e).getDim().getName()));
							if (olapreq.getRequest().get(e).getHasConditionalTotal())
							{
								totalQuery.having(oFF.SqlOperation.greater(oFF.RawSqlConstant.create("count(*)"), oFF.SqlIntegerConstant.create(1)).toSqlString(new oFF.SqlCodeGenOptions()));
							}
						}
						else if (axisentries.get(g) !== null)
						{
							totalQuery.select(axisentries.get(g));
							totalQuery.groupBy(axisentries.get(g));
						}
					}
					var oldsrcquery = oFF.SqlReference.create(oFF.SqlOperation.format("q{0}", oFF.StringListBuilder.create().add(oFF.XInteger.convertToString(qi)).build()));
					totalQuery.from(oldsrcquery);
					virtualAxis.addDependency(oFF.SqlOperation.format("q{0}", oFF.StringListBuilder.create().add(oFF.XInteger.convertToString(qi + 1)).build()), oFF.SqlUnion.create(oFF.SqlQuery.create().selectAll().from(oldsrcquery), totalQuery));
					qi++;
				}
				var desc2 = false;
				var sort2 = req.asStructure().getStructureByKey("Analytics").getStructureByKey("Definition").getListByKey("Sort");
				if (oFF.notNull(sort2))
				{
					for (var r = 0; r < sort2.size(); r++)
					{
						if (oFF.XString.isEqual(sort2.getStructureAt(r).getStringByKey("Dimension"), olapreq.getRequest().get(e).getDim().getName()) && oFF.XString.isEqual(sort2.getStructureAt(r).getStringByKey("Direction"), "Desc"))
						{
							desc2 = true;
						}
					}
				}
				finalSelector.orderBy(curcol2, desc2);
			}
			else if (olapreq.getRequest().get(e).getDim().getMembers().size() > 1)
			{
				var sortMember = "case";
				for (var u = 0; u < olapreq.getRequest().get(e).getDim().getMembers().size(); u++)
				{
					sortMember = oFF.SqlOperation.format("{0} when {1} then {2}", oFF.StringListBuilder.create().add(sortMember).add(oFF.SqlOperation.equals(oFF.SqlReference.create2(alias, olapreq.getRequest().get(e).getDim().getName()), oFF.SqlStringConstant.create(olapreq.getRequest().get(e).getDim().getMembers().get(u).getName())).toSqlString(new oFF.SqlCodeGenOptions())).add(oFF.XInteger.convertToString(u)).build());
				}
				finalSelector.orderBy(oFF.RawSqlConstant.create(oFF.SqlOperation.format("{0} END", oFF.StringListBuilder.create().add(sortMember).build())), false);
			}
			axisentry++;
		}
	}
	finalSelector.from(oFF.SqlTableAlias.create2(oFF.SqlReference.create(oFF.SqlOperation.format("q{0}", oFF.StringListBuilder.create().add(oFF.XInteger.convertToString(qi)).build())), alias));
	return virtualAxis;
};
oFF.OlapSqlProcessor.prototype.generateResultSet = function(rowFrom, rowTo)
{
	var cube = this.generateMetadata2();
	var res = oFF.GenericResultSetBuilder.create();
	var rows = oFF.GenericAxisBuilder.create().setName("Rows").setType("Rows");
	rows.getDimensions().add(cube.getDimensions().get(0));
	rows.getDimensions().add(cube.getDimensions().get(1));
	res.getAxes().add(rows);
	if (oFF.notNull(this.m_metaData) && this.m_metaData.isStructure())
	{
		var dataSources = this.m_metaData.asStructure().getListByKey("DataSources");
		rows.setTotalTuples(dataSources.size());
		for (var i = rowFrom, size = rowTo === -1 ? dataSources.size() : oFF.XMath.min(dataSources.size(), rowTo); i < size; i++)
		{
			var name = dataSources.getStructureAt(i).getStringByKey("Name");
			var description = dataSources.getStructureAt(i).getStringByKey("Description");
			rows.appendTuple2(new oFF.ListBuilder().init().add(new oFF.StringMapBuilder().init().put("ID", oFF.PrFactory.createString(name)).put("LONG_TEXT", oFF.PrFactory.createString(description)).build()).add(new oFF.StringMapBuilder().init().put("ID", oFF.PrFactory.createString("Query")).put("LONG_TEXT", oFF.PrFactory.createString("Query")).build()).build());
		}
	}
	else
	{
		rows.appendTuple2(new oFF.ListBuilder().init().add(new oFF.StringMapBuilder().init().put("ID", oFF.PrFactory.createString("Test1")).put("LONG_TEXT", oFF.PrFactory.createString("My Test DataSource 1")).build()).build());
		rows.appendTuple2(new oFF.ListBuilder().init().add(new oFF.StringMapBuilder().init().put("ID", oFF.PrFactory.createString("Test2")).put("LONG_TEXT", oFF.PrFactory.createString("My Test DataSource 2")).build()).build());
		rows.appendTuple2(new oFF.ListBuilder().init().add(new oFF.StringMapBuilder().init().put("ID", oFF.PrFactory.createString("Test2")).put("LONG_TEXT", oFF.PrFactory.createString("My Test DataSource 3")).build()).build());
	}
	return res;
};
oFF.OlapSqlProcessor.prototype.generateMetadata2 = function()
{
	var cube = oFF.GenericCubeBuilder.create().setBaseDataSource(oFF.GenericDataSourceBuilder.create().setObjectName("Root").setDescription("Root").setType("InfoCube")).setDataSource(oFF.GenericDataSourceBuilder.create().setObjectName("$$DataSource$$").setType("Query").setDescription("Basic"));
	var dim = oFF.GenericDimensionBuilder.create().setName("ObjectName").setDescription("ObjectName").setAxisConstraints(oFF.StringListBuilder.create().add("Columns").add("Rows").add("Free").build()).setDataType(null).setKeyAttribute(oFF.XStringUtils.concatenate2("ObjectName", ".ID")).setAxisDefault("Rows");
	dim.getAttributes().add(oFF.GenericAttributeBuilder.create().setIsKey(true).setName("ID").setDataType("String").setPresentationType("Key"));
	dim.getAttributes().add(oFF.GenericAttributeBuilder.create().setName("LONG_TEXT").setDataType("String").setPresentationType("Text"));
	cube.getDimensions().add(dim);
	dim = oFF.GenericDimensionBuilder.create().setName("Type").setDescription("Type").setAxisConstraints(oFF.StringListBuilder.create().add("Columns").add("Rows").add("Free").build()).setDataType(null).setKeyAttribute(oFF.XStringUtils.concatenate2("meta_object_type", ".ID")).setAxisDefault("Rows");
	dim.getAttributes().add(oFF.GenericAttributeBuilder.create().setIsKey(true).setName("ID").setDataType("String").setPresentationType("Key"));
	dim.getAttributes().add(oFF.GenericAttributeBuilder.create().setName("LONG_TEXT").setDataType("String").setPresentationType("Text"));
	cube.getDimensions().add(dim);
	return cube;
};
oFF.OlapSqlProcessor.prototype.convertToOlapRequest = function(dims)
{
	var requestlist = oFF.XList.create();
	for (var y = 0; y < dims.size(); y++)
	{
		var entry = new oFF.OlapRequestEntry();
		var dim = new oFF.OlapDimension();
		dim.setName(dims.getStructureAt(y).getStringByKey("Name"));
		if (dims.getStructureAt(y).containsKey("Members"))
		{
			dim.setType(oFF.OlapDimensionType.MEASURE);
			dim.setMembers(oFF.XList.create());
			var members = dims.getStructureAt(y).getListByKey("Members");
			for (var z = 0; z < members.size(); z++)
			{
				if (!oFF.XString.isEqual(members.getStructureAt(z).getStringByKey("Visibility"), "Hidden"))
				{
					var formula = members.getStructureAt(z).getStructureByKey("Formula");
					var member = null;
					if (oFF.notNull(formula))
					{
						var sformula = oFF.OlapFormulaToSql.convert(formula);
						member = oFF.OlapDimensionMember.create(members.getStructureAt(z).getStringByKey("Name"));
						member.setRawValue(oFF.RawSqlConstant.create(sformula));
						dim.getMembers().add(member);
						continue;
					}
					member = oFF.OlapDimensionMember.create(members.getStructureAt(z).getStructureByKey("MemberOperand").getStringByKey("Value"));
					member.setDisplayName(members.getStructureAt(z).getStructureByKey("MemberOperand").getStringByKey("Description"));
					member.setAggregation(oFF.Aggregation.create("sum", 0));
					dim.getMembers().add(member);
				}
			}
		}
		else
		{
			dim.setType(oFF.OlapDimensionType.NORMAL);
		}
		entry.setDim(dim);
		var rowOrCol = dims.getStructureAt(y).getStringByKey("Axis");
		entry.setType(oFF.XString.isEqual(rowOrCol, "Rows") ? oFF.OlapRequestEntryType.ROW : oFF.OlapRequestEntryType.COLUMN);
		var resultStructure = dims.getStructureAt(y).getListByKey("ResultStructure");
		if (oFF.notNull(resultStructure) && resultStructure.size() === 2)
		{
			if (oFF.XString.isEqual(resultStructure.getStructureAt(1).getStringByKey("Result"), "Total") && oFF.XString.isEqual(resultStructure.getStructureAt(1).getStringByKey("Visibility"), "Always"))
			{
				entry.setFollowedByTotal(true);
				entry.setHasTotal(true);
			}
			else if (oFF.XString.isEqual(resultStructure.getStructureAt(0).getStringByKey("Result"), "Total") && oFF.XString.isEqual(resultStructure.getStructureAt(0).getStringByKey("Visibility"), "Always"))
			{
				entry.setFollowedByTotal(false);
				entry.setHasTotal(true);
			}
			else if (oFF.XString.isEqual(resultStructure.getStructureAt(1).getStringByKey("Result"), "Total") && oFF.XString.isEqual(resultStructure.getStructureAt(1).getStringByKey("Visibility"), "Conditional"))
			{
				entry.setFollowedByTotal(true);
				entry.setHasTotal(true);
				entry.setHasConditionalTotal(true);
			}
			else if (oFF.XString.isEqual(resultStructure.getStructureAt(0).getStringByKey("Result"), "Total") && oFF.XString.isEqual(resultStructure.getStructureAt(0).getStringByKey("Visibility"), "Conditional"))
			{
				entry.setFollowedByTotal(false);
				entry.setHasTotal(true);
				entry.setHasConditionalTotal(true);
			}
		}
		requestlist.add(entry);
	}
	var olapreq = oFF.OlapRequest.create(requestlist, "");
	return olapreq;
};
oFF.OlapSqlProcessor.prototype.generateMetadata = function(driver, objectName)
{
	var cube = oFF.GenericCubeBuilder.create().setBaseDataSource(oFF.GenericDataSourceBuilder.create().setObjectName("Root").setDescription("Root").setType("InfoCube")).setDataSource(oFF.GenericDataSourceBuilder.create().setObjectName("Basic").setType("Query").setDescription("Basic"));
	if (oFF.notNull(this.m_metaData) && this.m_metaData.isStructure())
	{
		var hasMeasure = false;
		var dataSources = this.m_metaData.asStructure().getListByKey("DataSources");
		for (var i = 0, size = dataSources.size(); i < size; i++)
		{
			if (oFF.XString.isEqual(objectName, dataSources.getStructureAt(i).getStringByKey("Name")))
			{
				var dimensions = dataSources.getStructureAt(i).getListByKey("Dimensions");
				for (var j = 0; j < dimensions.size(); j++)
				{
					var name = dimensions.getStructureAt(j).getStringByKey("Name");
					var description = dimensions.getStructureAt(j).getStringByKey("Description");
					var type = dimensions.getStructureAt(j).getStringByKey("Type");
					var axis = dimensions.getStructureAt(j).getStringByKey("Axis");
					var isMeasure = oFF.XString.isEqual(type, "Measure");
					var dimension = oFF.GenericDimensionBuilder.create().setName(name).setDescription(description).setAxisConstraints(oFF.StringListBuilder.create().add("Columns").add("Rows").add("Free").build()).setDataType(null).setKeyAttribute(oFF.XStringUtils.concatenate2(name, ".ID")).setAxisDefault(axis);
					dimension.getAttributes().add(oFF.GenericAttributeBuilder.create().setIsKey(true).setName("ID").setDataType("String").setIsFilterable(true).setPresentationType("Key").setObtainability(oFF.ObtainabilityType.USER_INTERFACE));
					dimension.getAttributes().add(oFF.GenericAttributeBuilder.create().setName("LONG_TEXT").setDataType("String").setIsFilterable(true).setPresentationType("LongText").setObtainability(oFF.ObtainabilityType.ALWAYS));
					if (isMeasure)
					{
						hasMeasure = true;
						dimension.setDimensionType(2);
						dimension.setAxisConstraints(oFF.StringListBuilder.create().add("Columns").add("Rows").build());
						var members = dimensions.getStructureAt(j).getListByKey("Members");
						for (var k = 0; k < members.size(); k++)
						{
							dimension.putMember(new oFF.StringMapBuilder().init().put("ID", oFF.PrFactory.createString(members.getStructureAt(k).getStringByKey("Name"))).put("LONG_TEXT", oFF.PrFactory.createString(members.getStructureAt(k).getStringByKey("Description"))).build());
						}
					}
					else
					{
						dimension.setDimensionType(3);
					}
					cube.getDimensions().add(dimension);
				}
				break;
			}
		}
		if (!hasMeasure)
		{
			var dummymeasure = oFF.GenericDimensionBuilder.create().setName("CustomDimension1").setDescription("CustomDimension1").setAxisConstraints(oFF.StringListBuilder.create().add("Columns").add("Rows").build()).setDataType(null).setKeyAttribute(oFF.XStringUtils.concatenate2("CustomDimension1", ".ID")).setAxisDefault("Columns").setDimensionType(2);
			dummymeasure.getAttributes().add(oFF.GenericAttributeBuilder.create().setIsKey(true).setName("ID").setDataType("String"));
			dummymeasure.getAttributes().add(oFF.GenericAttributeBuilder.create().setName("LONG_TEXT").setDataType("String"));
			cube.getDimensions().add(dummymeasure);
		}
		return cube;
	}
	var meta = driver.processGetTables(oFF.SyncType.BLOCKING, null, null, "", "public", "CustomDimension1").getData();
	while (meta.next())
	{
		var tablename = meta.getStringAt(2);
		var tabledata = driver.processGetColumns(oFF.SyncType.BLOCKING, null, null, "", "", tablename, "").getData();
		var measure = oFF.GenericDimensionBuilder.create().setName("Measure").setDescription("Data").setDimensionType(2).setAxisDefault("Columns").setAxisConstraints(oFF.StringListBuilder.create().add("Columns").add("Rows").add("Free").build()).setDataType(null).setKeyAttribute("Measure.ID");
		measure.getAttributes().add(oFF.GenericAttributeBuilder.create().setIsKey(true).setName("ID").setDataType("String"));
		measure.getAttributes().add(oFF.GenericAttributeBuilder.create().setName("LONG_TEXT").setDataType("String"));
		cube.getDimensions().clear();
		while (tabledata.next())
		{
			var columnName = tabledata.getStringAt(3);
			if (oFF.XString.isEqual(columnName, "area") || oFF.XString.isEqual(columnName, "area_land") || oFF.XString.isEqual(columnName, "area_water") || oFF.XString.isEqual(columnName, "population") || oFF.XString.isEqual(columnName, "population_growth") || oFF.XString.isEqual(columnName, "birth_rate") || oFF.XString.isEqual(columnName, "death_rate") || oFF.XString.isEqual(columnName, "migration_rate"))
			{
				measure.putMember(new oFF.StringMapBuilder().init().put("ID", oFF.PrFactory.createString(columnName)).put("LONG_TEXT", oFF.PrFactory.createString(columnName)).build());
			}
			else
			{
				var dim = oFF.GenericDimensionBuilder.create().setName(columnName).setDescription(columnName).setDimensionType(3).setAxisDefault("Rows").setAxisConstraints(oFF.StringListBuilder.create().add("Columns").add("Rows").add("Free").build()).setDataType(null).setKeyAttribute(oFF.XStringUtils.concatenate2(columnName, ".ID"));
				dim.getAttributes().add(oFF.GenericAttributeBuilder.create().setIsKey(true).setName("ID").setDataType("String"));
				dim.getAttributes().add(oFF.GenericAttributeBuilder.create().setName("LONG_TEXT").setDataType("String"));
				cube.getDimensions().add(dim);
			}
		}
		if (measure.getMembers().size() > 0)
		{
			cube.getDimensions().add(measure);
			break;
		}
	}
	return cube;
};
oFF.OlapSqlProcessor.prototype.ConvertResultSet = function(sqlresultSet, req, cube, _rowCount, _columnCount, totalRows, totalColumns, rowTo, columnTo, sqlrows, sqlcolumns)
{
	var resultsetBuilder = oFF.GenericResultSetBuilder.create();
	var rows = oFF.GenericAxisBuilder.create().setName("Rows").setType("Rows");
	var columns = oFF.GenericAxisBuilder.create().setName("Columns").setType("Columns");
	resultsetBuilder.getAxes().add(rows);
	resultsetBuilder.getAxes().add(columns);
	rows.setTotalTuples(totalRows);
	columns.setTotalTuples(totalColumns);
	var columnCount = columnTo > totalColumns ? _columnCount - (columnTo - totalColumns) : _columnCount;
	var rowCount = rowTo > totalRows ? _rowCount - (rowTo - totalRows) : _rowCount;
	if (oFF.notNull(sqlcolumns))
	{
		this.populateResultSet(sqlcolumns, req, cube, resultsetBuilder, oFF.GenericAxisBuilder.create(), columns, true);
	}
	if (oFF.notNull(sqlrows))
	{
		this.populateResultSet(sqlrows, req, cube, resultsetBuilder, rows, oFF.GenericAxisBuilder.create(), true);
	}
	if (columnCount > 0 && rowCount > 0)
	{
		resultsetBuilder.insert(0, columnCount - 1, null);
		resultsetBuilder.insert(rowCount - 1, 0, null);
	}
	this.populateResultSet(sqlresultSet, req, cube, resultsetBuilder, rows, columns, false);
	return resultsetBuilder.toStructure();
};
oFF.OlapSqlProcessor.prototype.populateResultSet = function(sqlresultSet, req, cube, resultsetBuilder, rows, columns, _firstLoop)
{
	var firstLoop = _firstLoop;
	while (sqlresultSet.next())
	{
		var it__ = req.getRequest().getIterator();
		var row = oFF.XList.create();
		var column = oFF.XList.create();
		var adddims = firstLoop;
		firstLoop = false;
		var measure_i = -1;
		var measure_axis = null;
		var measure_values = oFF.XList.create();
		while (it__.hasNext())
		{
			var xc = it__.next();
			var curaxis = xc.getType() === oFF.OlapRequestEntryType.COLUMN ? column : row;
			if (xc.getDim().getType() === oFF.OlapDimensionType.MEASURE)
			{
				var curdim = null;
				for (var j = 0; j < cube.getDimensions().size(); j++)
				{
					if (oFF.XString.isEqual(cube.getDimensions().get(j).getName(), xc.getDim().getName()))
					{
						curdim = cube.getDimensions().get(j);
						break;
					}
				}
				if (_firstLoop)
				{
					curaxis.add(this.measureIdToDesc(xc, curdim, sqlresultSet.getStringByKey(xc.getDim().getName()) !== null ? sqlresultSet.getStringByKey(xc.getDim().getName()) : "null"));
				}
				else
				{
					measure_i = curaxis.size();
					curaxis.add(null);
					measure_axis = curaxis;
					for (var i = 0, size = xc.getDim().getMembers().size(); i < size; i++)
					{
						var membername = xc.getDim().getMembers().get(i).getName();
						var val = null;
						if (!sqlresultSet.hasNullByKey(membername))
						{
							val = oFF.PrFactory.createDouble(sqlresultSet.getDoubleByKeyExt(membername, -1));
							if (val.asNumber().getDouble() === -1)
							{
								for (var k = 0; k < sqlresultSet.getMetaData().size(); k++)
								{
									if (oFF.XString.isEqual(membername, sqlresultSet.getMetaData().get(k)) && sqlresultSet.getMetaData().getType(k) === oFF.SqlResultSetType.STRING)
									{
										val = oFF.PrFactory.createString(sqlresultSet.getStringAt(k));
									}
								}
							}
						}
						measure_values.add(oFF.XPair.create(this.measureIdToDesc(xc, curdim, membername), val));
					}
				}
			}
			else
			{
				var dimdesc = oFF.PrFactory.createString(sqlresultSet.getStringByKey(xc.getDim().getName()) !== null ? sqlresultSet.getStringByKey(xc.getDim().getName()) : "null");
				curaxis.add(new oFF.StringMapBuilder().init().put("ID", dimdesc).put("LONG_TEXT", dimdesc).build());
			}
			if (adddims)
			{
				for (var uv = 0; uv < cube.getDimensions().size(); uv++)
				{
					if (oFF.XString.isEqual(cube.getDimensions().get(uv).getName(), xc.getDim().getName()))
					{
						(xc.getType() === oFF.OlapRequestEntryType.COLUMN ? columns : rows).getDimensions().add(cube.getDimensions().get(uv));
					}
				}
			}
		}
		if (measure_i === -1 || measure_values.size() === 0)
		{
			if (measure_i !== -1)
			{
				measure_axis.removeAt(measure_i);
			}
			if (_firstLoop)
			{
				rows.getOrAppendTupleIndex2(row);
				columns.getOrAppendTupleIndex2(column);
			}
		}
		else
		{
			for (var l = 0; l < measure_values.size(); l++)
			{
				measure_axis.set(measure_i, measure_values.get(l).getFirstObject());
				var row_i = row.size() === 0 ? 0 : !_firstLoop ? rows.getOrAppendTupleIndex3(row, false, false, false) : rows.getOrAppendTupleIndex2(row);
				var column_i = column.size() === 0 ? 0 : !_firstLoop ? columns.getOrAppendTupleIndex3(column, false, false, false) : columns.getOrAppendTupleIndex2(column);
				if (row_i !== -1 && column_i !== -1)
				{
					resultsetBuilder.insert(row_i, column_i, measure_values.get(l).getSecondObject());
				}
			}
		}
	}
};
oFF.OlapSqlProcessor.prototype.measureIdToDesc = function(xc, curdim, membername)
{
	var measureId = oFF.PrFactory.createString(membername);
	var measureDesc = measureId;
	if (oFF.notNull(curdim))
	{
		for (var k = 0; k < curdim.getMembers().size(); k++)
		{
			if (oFF.XString.isEqual(curdim.getMembers().getStructureAt(k).getStringByKey(oFF.XStringUtils.concatenate2(xc.getDim().getName(), ".ID")), membername))
			{
				measureDesc = oFF.PrFactory.createString(curdim.getMembers().getStructureAt(k).getStringByKeyExt(oFF.XStringUtils.concatenate2(xc.getDim().getName(), ".LONG_TEXT"), membername));
				break;
			}
		}
	}
	var mv = new oFF.StringMapBuilder().init().put("ID", measureId).put("LONG_TEXT", measureDesc).build();
	return mv;
};

oFF.RpcOlapSqlInaUtil = {

	QY_MESSAGES:"Messages",
	QY_MESSAGE_CLASS:"MessageClass",
	QY_NUMBER:"Number",
	QY_TYPE:"Type",
	QY_TEXT:"Text",
	VA_SEVERITY_ERROR:2,
	createErrorResponse:function(errors)
	{
			var response = oFF.PrFactory.createStructure();
		var messages = response.putNewList(oFF.RpcOlapSqlInaUtil.QY_MESSAGES);
		var size = errors.size();
		for (var i = 0; i < size; i++)
		{
			var error = errors.get(i);
			var message = messages.addNewStructure();
			message.putString(oFF.RpcOlapSqlInaUtil.QY_TEXT, error.getText());
			message.putInteger(oFF.RpcOlapSqlInaUtil.QY_TYPE, oFF.RpcOlapSqlInaUtil.VA_SEVERITY_ERROR);
			message.putInteger(oFF.RpcOlapSqlInaUtil.QY_NUMBER, error.getCode());
			message.putString(oFF.RpcOlapSqlInaUtil.QY_MESSAGE_CLASS, "RpcSql");
		}
		return response;
	},
	getErrors:function(data)
	{
			var errors = oFF.XList.create();
		if (oFF.notNull(data) && data.isStructure())
		{
			var rawMessages = data.asStructure().getByKey(oFF.RpcOlapSqlInaUtil.QY_MESSAGES);
			if (oFF.notNull(rawMessages) && rawMessages.isList())
			{
				var messages = rawMessages.asList();
				for (var i = 0, size = messages.size(); i < size; i++)
				{
					if (messages.getStructureAt(i).getIntegerByKey(oFF.RpcOlapSqlInaUtil.QY_TYPE) === oFF.RpcOlapSqlInaUtil.VA_SEVERITY_ERROR)
					{
						errors.add(oFF.XMessage.createError("RpcSql", messages.getStructureAt(i).getStringByKey(oFF.RpcOlapSqlInaUtil.QY_TEXT), null, false, null));
					}
				}
			}
		}
		return errors;
	}
};

oFF.ArrayIterator = function() {};
oFF.ArrayIterator.prototype = new oFF.XObject();
oFF.ArrayIterator.prototype._ff_c = "ArrayIterator";

oFF.ArrayIterator.create = function(a)
{
	var ret = new oFF.ArrayIterator();
	ret.m_a = a;
	ret.m_pos = 0;
	return ret;
};
oFF.ArrayIterator.prototype.m_a = null;
oFF.ArrayIterator.prototype.m_pos = 0;
oFF.ArrayIterator.prototype.hasNext = function()
{
	return this.m_pos < this.m_a.size();
};
oFF.ArrayIterator.prototype.next = function()
{
	return this.m_a.get(this.m_pos++);
};

oFF.DummyIterator = function() {};
oFF.DummyIterator.prototype = new oFF.XObject();
oFF.DummyIterator.prototype._ff_c = "DummyIterator";

oFF.DummyIterator.prototype.hasNext = function()
{
	return false;
};
oFF.DummyIterator.prototype.next = function()
{
	return null;
};

oFF.OlapRpcFunctionFactory = function() {};
oFF.OlapRpcFunctionFactory.prototype = new oFF.RpcFunctionFactory();
oFF.OlapRpcFunctionFactory.prototype._ff_c = "OlapRpcFunctionFactory";

oFF.OlapRpcFunctionFactory.staticSetup = function()
{
	var processor = new oFF.OlapRpcFunctionFactory();
	oFF.RpcFunctionFactory.registerFactory(null, oFF.SystemType.VIRTUAL_INA_SQL, processor);
};
oFF.OlapRpcFunctionFactory.prototype.newRpcFunction = function(context, name, systemType, protocolType)
{
	var rpcFunction = oFF.OlapRpcVirtualFunction.create(context, oFF.XUri.createFromUrl(name));
	return rpcFunction;
};

oFF.RpcOlapSqlProxy = function() {};
oFF.RpcOlapSqlProxy.prototype = new oFF.XObject();
oFF.RpcOlapSqlProxy.prototype._ff_c = "RpcOlapSqlProxy";

oFF.RpcOlapSqlProxy.prototype.m_connectionstring = null;
oFF.RpcOlapSqlProxy.prototype.m_drivername = null;
oFF.RpcOlapSqlProxy.prototype.m_username = null;
oFF.RpcOlapSqlProxy.prototype.m_password = null;
oFF.RpcOlapSqlProxy.prototype.m_metadata = null;
oFF.RpcOlapSqlProxy.prototype.getDataBaseProvider = function()
{
	var driver = oFF.SqlDriverFactory.create(this.m_drivername, null);
	driver.processOpenExt(oFF.SyncType.BLOCKING, null, null, this.m_connectionstring, this.m_username, this.m_password);
	return driver;
};
oFF.RpcOlapSqlProxy.prototype.onHttpRequest = function(serverRequestResponse)
{
	var req = serverRequestResponse.getClientHttpRequest().getJsonContent();
	var serverPath = serverRequestResponse.getClientHttpRequest().getRelativePath();
	var newServerResponse = serverRequestResponse.newServerResponse();
	newServerResponse.setContentType(oFF.ContentType.APPLICATION_JSON);
	var proc = oFF.OlapSqlProcessor.create();
	proc.setMetaData(this.m_metadata);
	var response = proc.setServerInfo("/sap/sql/ina/GetServerInfo").setInaPath("/sap/sql/ina/GetResponse").onProcess(req, serverPath, this.getDataBaseProvider());
	newServerResponse.setStatusCode(response.getFirstObject().getInteger());
	newServerResponse.setString(response.getSecondObject().toString());
	serverRequestResponse.setResponse(newServerResponse);
};
oFF.RpcOlapSqlProxy.prototype.initServerContainer = function(environment)
{
	oFF.OlapEngineModule.getInstance();
	this.m_drivername = environment.getByKey("drivername");
	this.m_connectionstring = environment.getByKey("connectionstring");
	this.m_username = environment.getByKey("username");
	this.m_password = environment.getByKey("password");
	var process = oFF.DefaultSession.create();
	if (oFF.notNull(process))
	{
		var metadatafile = oFF.XFile.create(process, environment.getByKey("metadata"));
		if (oFF.notNull(metadatafile) && metadatafile.isValid())
		{
			var content = metadatafile.load();
			if (oFF.notNull(content))
			{
				this.m_metadata = content.getJsonContent();
			}
		}
	}
};

oFF.OlapDimensionType = function() {};
oFF.OlapDimensionType.prototype = new oFF.XConstant();
oFF.OlapDimensionType.prototype._ff_c = "OlapDimensionType";

oFF.OlapDimensionType.MEASURE = null;
oFF.OlapDimensionType.NORMAL = null;
oFF.OlapDimensionType.staticSetup = function()
{
	oFF.OlapDimensionType.MEASURE = oFF.OlapDimensionType.create("MEASURE");
	oFF.OlapDimensionType.NORMAL = oFF.OlapDimensionType.create("NORMAL");
};
oFF.OlapDimensionType.create = function(name)
{
	return oFF.XConstant.setupName(new oFF.OlapDimensionType(), name);
};

oFF.OlapRequestEntryType = function() {};
oFF.OlapRequestEntryType.prototype = new oFF.XConstant();
oFF.OlapRequestEntryType.prototype._ff_c = "OlapRequestEntryType";

oFF.OlapRequestEntryType.ROW = null;
oFF.OlapRequestEntryType.COLUMN = null;
oFF.OlapRequestEntryType.staticSetup = function()
{
	oFF.OlapRequestEntryType.ROW = oFF.OlapRequestEntryType.create("ROW");
	oFF.OlapRequestEntryType.COLUMN = oFF.OlapRequestEntryType.create("COLUMN");
};
oFF.OlapRequestEntryType.create = function(name)
{
	return oFF.XConstant.setupName(new oFF.OlapRequestEntryType(), name);
};

oFF.ShellSqlOlap = function() {};
oFF.ShellSqlOlap.prototype = new oFF.DfProgram();
oFF.ShellSqlOlap.prototype._ff_c = "ShellSqlOlap";

oFF.ShellSqlOlap.COLUMN_SIZE = 20;
oFF.ShellSqlOlap.parseLine = function(line)
{
	var entries = oFF.XStringTokenizer.splitString(line, ",");
	var it2___ = entries.getIterator();
	var requestlist = oFF.XList.create();
	var sqlWhere = null;
	while (it2___.hasNext())
	{
		var sentry = oFF.XString.trim(it2___.next());
		var on = oFF.XStringTokenizer.splitString(sentry, " on ");
		while (on.size() === 1 && it2___.hasNext())
		{
			sentry = oFF.XStringUtils.concatenate3(sentry, ",", oFF.XString.trim(it2___.next()));
			on = oFF.XStringTokenizer.splitString(sentry, " on ");
		}
		if (on.size() === 2)
		{
			var entry = new oFF.OlapRequestEntry();
			var dim = new oFF.OlapDimension();
			dim.setName(on.get(0));
			if (oFF.XString.containsString(dim.getName(), " with "))
			{
				dim.setType(oFF.OlapDimensionType.MEASURE);
				dim.setMembers(oFF.XList.create());
				var withList = oFF.XStringTokenizer.splitString(dim.getName(), " with ");
				dim.setName(oFF.XString.trim(withList.get(0)));
				var members = oFF.XStringTokenizer.splitString(oFF.XString.trim(withList.get(1)), ",");
				var it3 = members.getIterator();
				while (it3.hasNext())
				{
					dim.getMembers().add(oFF.OlapDimensionMember.create(oFF.XString.trim(it3.next())));
				}
			}
			else
			{
				dim.setType(oFF.OlapDimensionType.NORMAL);
			}
			entry.setDim(dim);
			var rowOrCol = oFF.XString.trim(on.get(1));
			if (oFF.XString.containsString(rowOrCol, " where "))
			{
				var where = oFF.XStringTokenizer.splitString(rowOrCol, " where ");
				rowOrCol = where.get(0);
				sqlWhere = where.get(1);
			}
			else
			{
				sqlWhere = null;
			}
			entry.setType(oFF.XString.isEqual(rowOrCol, "Rows") ? oFF.OlapRequestEntryType.ROW : oFF.OlapRequestEntryType.COLUMN);
			requestlist.add(entry);
		}
	}
	return oFF.OlapRequest.create(requestlist, sqlWhere);
};
oFF.ShellSqlOlap.sortAxis = function(map)
{
	for (var u = 0, size = map.size(); u < size; ++u)
	{
		var values = map.get(u).getValuesAsReadOnlyList();
		var other = map.get(u).getByKey(oFF.PrFactory.createString("Total"));
		if (oFF.isNull(other))
		{
			continue;
		}
		var d = other.getInteger();
		for (var i = 0, size2 = values.size(); i < size2; i++)
		{
			var c = values.get(i);
			if (c.getInteger() === size2 - 1)
			{
				other.setInteger(c.getInteger());
				c.setInteger(d);
				break;
			}
		}
	}
};
oFF.ShellSqlOlap.generateIndex = function(map, tuple)
{
	var clit = map.getIterator();
	var xit = tuple.getIterator();
	var xindex = 0;
	while (xit.hasNext() && clit.hasNext())
	{
		var cxmap = clit.next();
		var k = xit.next();
		var ciint = cxmap.getByKey(k);
		if (oFF.isNull(ciint))
		{
			cxmap.put(k, ciint = oFF.XIntegerValue.create(cxmap.size()));
		}
		xindex = cxmap.size() * xindex + ciint.getInteger();
	}
	return xindex;
};
oFF.ShellSqlOlap.prototype.req = null;
oFF.ShellSqlOlap.prototype.sql = null;
oFF.ShellSqlOlap.prototype.doSetupProgramMetadata = function(metadata)
{
	oFF.DfProgram.prototype.doSetupProgramMetadata.call( this , metadata);
	metadata.addParameterList("query", "olap query");
};
oFF.ShellSqlOlap.prototype.newProgram = function()
{
	var newPrg = new oFF.ShellSqlOlap();
	newPrg.setup();
	return newPrg;
};
oFF.ShellSqlOlap.prototype.getProgramName = function()
{
	return "sqlap";
};
oFF.ShellSqlOlap.prototype.getDefaultContainerType = function()
{
	return oFF.ProgramContainerType.CONSOLE;
};
oFF.ShellSqlOlap.prototype.prepareArguments = function()
{
	oFF.DfProgram.prototype.prepareArguments.call( this );
};
oFF.ShellSqlOlap.prototype.runProcess = function()
{
	var list = this.getArgumentList();
	var buf = oFF.XStringBuffer.create();
	for (var i = 0; i < list.size(); ++i)
	{
		if (i !== 0)
		{
			buf.append(" ");
		}
		buf.append(list.get(i));
	}
	var line = buf.toString();
	this.req = oFF.ShellSqlOlap.parseLine(line);
	this.sql = this.req.ToSql();
	oFF.XLogger.println(this.sql);
	var d = oFF.SqlDriverFactory.create("org.sqlite.JDBC", null);
	d.processOpenExt(oFF.SyncType.NON_BLOCKING, this, null, "jdbc:sqlite::memory:", null, null);
	return false;
};
oFF.ShellSqlOlap.prototype.convert = function(set)
{
	var meta = set.getMetaData();
	var rlist = oFF.PrFactory.createList();
	var rstruct = rlist.addNewStructure();
	var columns = rstruct.putNewList("columns");
	for (var i = 0; i < meta.size(); i++)
	{
		columns.add(oFF.PrFactory.createString(meta.get(i)));
	}
	var values = rstruct.putNewList("values");
	var NaN = oFF.XMath.pow(-1, 0.5);
	if (!oFF.XMath.isNaN(NaN))
	{
		oFF.noSupport();
	}
	while (set.next())
	{
		var row = values.addNewList();
		for (var j = 0; j < meta.size(); j++)
		{
			var type = meta.getType(j);
			if (type === oFF.SqlResultSetType.DOUBLE)
			{
				row.add(oFF.PrFactory.createDouble(set.getDoubleAt(j)));
				continue;
			}
			if (type === oFF.SqlResultSetType.LONG)
			{
				row.add(oFF.PrFactory.createLong(set.getLongAtExt(j, -1)));
				continue;
			}
			if (type === oFF.SqlResultSetType.INTEGER)
			{
				row.add(oFF.PrFactory.createInteger(set.getIntegerAtExt(j, -1)));
				continue;
			}
			if (type === oFF.SqlResultSetType.BOOLEAN)
			{
				row.add(oFF.PrFactory.createBoolean(set.getBooleanAtExt(j, true)));
				continue;
			}
			if (type === oFF.SqlResultSetType.STRING)
			{
				row.add(oFF.PrFactory.createString(set.getStringAtExt(j, null)));
				continue;
			}
			row.addNull();
		}
	}
	return rlist;
};
oFF.ShellSqlOlap.prototype.onHttpResponse = function(extResult, response, customIdentifier)
{
	if (response.getStatusCode() !== 200)
	{
		throw oFF.XException.createRuntimeException(oFF.XStringUtils.concatenate2("Failed to get sql query result with message: ", response.getStringContentWithCharset(oFF.XCharset.UTF8)));
	}
	var content = response.getJsonContent();
	this.onSqlResponse(content);
	this.exitNow(0);
};
oFF.ShellSqlOlap.prototype.onSqlResponse = function(content)
{
	var valuesArray = oFF.XList.create();
	var columnmap = oFF.XList.create();
	var rowmap = oFF.XList.create();
	var values = oFF.XList.create();
	var exclude = oFF.XList.create();
	var exclude2 = oFF.XList.create();
	var columnNames = oFF.XListOfString.create();
	var rowNames = oFF.XListOfString.create();
	var rlist = content.asList();
	for (var zy = 0; zy < rlist.size(); zy++)
	{
		var json = rlist.get(zy);
		if (json.isStructure())
		{
			var data = json.asStructure().getByKey("values").asList().getIterator();
			while (data.hasNext())
			{
				var cdata = data.next();
				var it__ = this.req.getRequest().getIterator();
				var fill = exclude.size() === 0 && exclude2.size() === 0;
				var b = 0;
				var c = 0;
				while (it__.hasNext())
				{
					var xc = it__.next();
					if (fill)
					{
						if (xc.getType() === oFF.OlapRequestEntryType.COLUMN)
						{
							columnNames.add(xc.getDim().getName());
						}
						else
						{
							rowNames.add(xc.getDim().getName());
						}
					}
					if (xc.getDim().getType() !== oFF.OlapDimensionType.MEASURE)
					{
						if (xc.getType() === oFF.OlapRequestEntryType.COLUMN)
						{
							b++;
						}
						else
						{
							c++;
						}
						continue;
					}
					if (fill)
					{
						(xc.getType() === oFF.OlapRequestEntryType.COLUMN ? exclude : exclude2).add(oFF.XIntegerValue.create(xc.getType() === oFF.OlapRequestEntryType.COLUMN ? b++ : c++));
					}
					var it___ = xc.getDim().getMembers().getIterator();
					while (it___.hasNext())
					{
						var xcc = it___.next();
						var x = oFF.XList.create();
						var y = oFF.XList.create();
						var val = null;
						var row = cdata.asList();
						var col = row.getIterator();
						var desc = json.asStructure().getByKey("columns").asList().getIterator();
						while (col.hasNext() && desc.hasNext())
						{
							var d = desc.next();
							var v = col.next();
							var it = xc.getDim().getMembers().getIterator();
							var matched = false;
							while (it.hasNext())
							{
								if (d.isEqualTo(oFF.PrFactory.createString(it.next().getName())))
								{
									matched = true;
									break;
								}
							}
							if (matched)
							{
								if (d.isEqualTo(oFF.PrFactory.createString(xcc.getName())))
								{
									(xc.getType() === oFF.OlapRequestEntryType.COLUMN ? x : y).add(d);
									val = v;
								}
							}
							else
							{
								var it2 = this.req.getRequest().getIterator();
								while (it2.hasNext())
								{
									var xval = it2.next();
									if (xval.getDim().getType() === oFF.OlapDimensionType.NORMAL && d.isEqualTo(oFF.PrFactory.createString(xval.getDim().getName())))
									{
										(xval.getType() === oFF.OlapRequestEntryType.COLUMN ? x : y).add(v);
										break;
									}
								}
							}
						}
						while (columnmap.size() < x.size())
						{
							columnmap.add(oFF.XSimpleMap.create());
						}
						while (rowmap.size() < y.size())
						{
							rowmap.add(oFF.XSimpleMap.create());
						}
						oFF.ShellSqlOlap.generateIndex(columnmap, x);
						oFF.ShellSqlOlap.generateIndex(rowmap, y);
						values.add(oFF.OlapResultValue.create(y, x, val));
					}
				}
			}
		}
	}
	oFF.ShellSqlOlap.sortAxis(columnmap);
	oFF.ShellSqlOlap.sortAxis(rowmap);
	var valuesIterator = values.getIterator();
	while (valuesIterator.hasNext())
	{
		var valxy = valuesIterator.next();
		var j = oFF.ShellSqlOlap.generateIndex(rowmap, valxy.getRow());
		var i = oFF.ShellSqlOlap.generateIndex(columnmap, valxy.getCol());
		while (valuesArray.size() <= j)
		{
			valuesArray.add(oFF.XList.create());
		}
		var crow = valuesArray.get(j);
		if (crow.size() <= i)
		{
			var __it = valuesArray.getIterator();
			while (__it.hasNext())
			{
				var ___cur = __it.next();
				while (___cur.size() <= i)
				{
					___cur.add(null);
				}
			}
		}
		var old2 = crow.get(i);
		if (oFF.notNull(old2) && old2.isNumeric() && valxy.getValue().isNumeric())
		{
			crow.set(i, oFF.PrFactory.createDouble(old2.asNumber().getDouble() + valxy.getValue().asNumber().getDouble()));
		}
		else
		{
			crow.set(i, valxy.getValue());
		}
	}
	this.printTable(this.mapToSortedArray(rowmap), valuesArray, this.printColmap(this.mapToSortedArray(rowmap), this.mapToSortedArray(columnmap), valuesArray, columnNames, rowNames));
};
oFF.ShellSqlOlap.prototype.printColmap = function(rowmap, map, valuesArray, columnNames, rowNames)
{
	var its = oFF.XList.create();
	var buffs = oFF.XList.create();
	for (var rows = map.size(), k = rows - 1; k >= 0; --k)
	{
		its.add(new oFF.DummyIterator());
		var xc = oFF.XStringBuffer.create();
		buffs.add(xc);
		var colname1 = columnNames.get(k);
		var availableSize = (rowmap.size() - 1) * (oFF.ShellSqlOlap.COLUMN_SIZE + 1) + oFF.ShellSqlOlap.COLUMN_SIZE;
		if (k + 1 !== rows)
		{
			if (availableSize < oFF.XString.size(colname1))
			{
				colname1 = oFF.XString.substring(colname1, 0, availableSize);
			}
			for (var q = 0; q < availableSize - oFF.XString.size(colname1); ++q)
			{
				xc.append(" ");
			}
			xc.append(colname1);
			xc.append("|");
		}
		else
		{
			for (var b = 0; b < rowNames.size() - 1; b++)
			{
				this.printName(rowNames.get(b), xc);
				xc.append("|");
			}
			var halfcol = oFF.XMath.div(oFF.ShellSqlOlap.COLUMN_SIZE - 1, 2);
			var lastrowname = rowNames.get(rowNames.size() - 1);
			if (oFF.XString.size(lastrowname) > halfcol)
			{
				lastrowname = oFF.XString.substring(lastrowname, 0, halfcol);
			}
			xc.append(lastrowname);
			for (var missp2 = oFF.XString.size(lastrowname); missp2 < halfcol; missp2++)
			{
				xc.append(" ");
			}
			xc.append("\\");
			availableSize = oFF.ShellSqlOlap.COLUMN_SIZE - 1 - halfcol;
			if (availableSize < oFF.XString.size(colname1))
			{
				colname1 = oFF.XString.substring(colname1, 0, availableSize);
			}
			for (var missp = oFF.XString.size(colname1); missp < availableSize; missp++)
			{
				xc.append(" ");
			}
			xc.append(colname1);
			xc.append("|");
		}
	}
	for (var i = 0; valuesArray.size() > 0 && i < valuesArray.get(0).size(); i++)
	{
		var l = 0;
		while (l < its.size() && !its.get(l).hasNext())
		{
			l++;
		}
		if (l < its.size())
		{
			if (i !== 0)
			{
				buffs.get(l).append("|");
			}
			this.printName(this.PrToString(its.get(l).next()), buffs.get(l));
		}
		for (var o = l + 1; o < its.size(); o++)
		{
			for (var f = 0; f < oFF.ShellSqlOlap.COLUMN_SIZE + 1; f++)
			{
				buffs.get(o).append(" ");
			}
		}
		for (var m = l - 1; m >= 0; m--)
		{
			its.set(m, oFF.ArrayIterator.create(map.get(map.size() - 1 - m)));
			if (i !== 0)
			{
				buffs.get(m).append("|");
			}
			this.printName(this.PrToString(its.get(m).next()), buffs.get(m));
		}
	}
	var sepLen = 0;
	for (var n = its.size() - 1; n >= 0; --n)
	{
		var line = buffs.get(n).toString();
		var seperator = oFF.XStringBuffer.create();
		for (var d = 0; d < oFF.XString.size(line); d++)
		{
			seperator.append(oFF.XString.isEqual(oFF.XString.substring(line, d, d + 1), "|") ? "+" : "-");
		}
		sepLen = oFF.XString.size(line);
		this.println(seperator.toString());
		this.println(line);
	}
	return sepLen;
};
oFF.ShellSqlOlap.prototype.mapToSortedArray = function(map)
{
	var xarr = oFF.XArray.create(map.size());
	for (var i = 0; i < xarr.size(); i++)
	{
		var subarray = oFF.XArray.create(map.get(i).size());
		var keys = map.get(i).getKeysAsReadOnlyList();
		for (var j = 0; j < subarray.size(); j++)
		{
			subarray.set(map.get(i).getByKey(keys.get(j)).getInteger(), keys.get(j));
		}
		xarr.set(i, subarray);
	}
	return xarr;
};
oFF.ShellSqlOlap.prototype.PrToString = function(v)
{
	return v.getType() === oFF.PrElementType.STRING ? v.asString().getString() : v.getStringRepresentation();
};
oFF.ShellSqlOlap.prototype.printTable = function(map, valuesArray, seplen)
{
	var its = oFF.XList.create();
	for (var k = map.size() - 1; k >= 0; k--)
	{
		its.add(new oFF.DummyIterator());
	}
	for (var i = 0; i < valuesArray.size(); i++)
	{
		var builder = oFF.XStringBuffer.create();
		var l = 0;
		while (l < its.size() && !its.get(l).hasNext())
		{
			l++;
		}
		var whitesp = map.size() - l;
		if (l < its.size())
		{
			whitesp--;
		}
		for (var n = 0; n < whitesp; ++n)
		{
			for (var e = 0; e < oFF.ShellSqlOlap.COLUMN_SIZE; ++e)
			{
				builder.append(" ");
			}
			builder.append("|");
		}
		if (l < its.size())
		{
			this.printName(this.PrToString(its.get(l).next()), builder);
			builder.append("|");
		}
		for (var m = l - 1; m >= 0; m--)
		{
			its.set(m, oFF.ArrayIterator.create(map.get(map.size() - 1 - m)));
			this.printName(this.PrToString(its.get(m).next()), builder);
			builder.append("|");
		}
		for (var j = 0; j < valuesArray.get(i).size(); j++)
		{
			var el = valuesArray.get(i).get(j);
			if (j !== 0)
			{
				builder.append("|");
			}
			if (oFF.isNull(el))
			{
				var _null = "NULL";
				builder.append(_null);
				for (var l3 = 0; l3 < oFF.ShellSqlOlap.COLUMN_SIZE - oFF.XString.size(_null); ++l3)
				{
					builder.append(" ");
				}
			}
			else
			{
				var val = this.PrToString(el);
				builder.append(val);
				for (var l1 = 0; l1 < oFF.ShellSqlOlap.COLUMN_SIZE - oFF.XString.size(val); ++l1)
				{
					builder.append(" ");
				}
			}
		}
		var line = builder.toString();
		var seperator = oFF.XStringBuffer.create();
		for (var d = 0; d < seplen; d++)
		{
			seperator.append(d < (its.size() - l - 1) * (oFF.ShellSqlOlap.COLUMN_SIZE + 1) - 1 ? d < oFF.XString.size(line) && oFF.XString.isEqual(oFF.XString.substring(line, d, d + 1), "|") ? "|" : " " : d < oFF.XString.size(line) && oFF.XString.isEqual(oFF.XString.substring(line, d, d + 1), "|") ? "+" : "-");
		}
		this.println(seperator.toString());
		this.println(line);
	}
};
oFF.ShellSqlOlap.prototype.printName = function(label, builder)
{
	builder.append(oFF.XString.size(label) > oFF.ShellSqlOlap.COLUMN_SIZE ? oFF.XString.substring(label, 0, oFF.ShellSqlOlap.COLUMN_SIZE) : label);
	for (var o = 0; o < oFF.ShellSqlOlap.COLUMN_SIZE - oFF.XString.size(label); ++o)
	{
		builder.append(" ");
	}
};
oFF.ShellSqlOlap.prototype.onOpened = function(extResult, driver, customIdentifier)
{
	driver.executeUpdate("CREATE TABLE `test` ( `Country` varchar(2) DEFAULT NULL, `Product` varchar(2) DEFAULT NULL, `Revenue` int DEFAULT NULL, `Profit` int DEFAULT NULL, `Year` int DEFAULT 2020);");
	driver.executeUpdate("INSERT INTO `test` VALUES ('DE','UM',10,2,2020),('DE','UM',20,4,2020),('FR','UM',15,3,2020),('IT','PE',25,2,2020),('IT','PA',31,3,2020),('IT','PE',10,2,2020),('IT','PE',25,2,2021);");
	this.onSqlResponse(this.convert(driver.executeQuery(this.sql)));
	this.exitNow(0);
};

oFF.OlapRpcVirtualFunction = function() {};
oFF.OlapRpcVirtualFunction.prototype = new oFF.DfRpcFunction();
oFF.OlapRpcVirtualFunction.prototype._ff_c = "OlapRpcVirtualFunction";

oFF.OlapRpcVirtualFunction.create = function(connection, functionUri)
{
	var filePath = connection.getSystemDescription().getProperties().getStringByKey("METADATA");
	var file = oFF.XFile.create(connection.getProcess(), filePath);
	var rpcFunction = new oFF.OlapRpcVirtualFunction();
	rpcFunction.setupFunction(connection, functionUri);
	var cont = file.load();
	rpcFunction.m_metadata = oFF.notNull(cont) ? cont.getJsonContent() : null;
	rpcFunction.m_driver = oFF.RpcSqlDriver.create2("rpc", connection.getConnectionPool(), connection.getSystemDescription().getHost());
	rpcFunction.m_driver.open(oFF.XUri.create());
	return rpcFunction;
};
oFF.OlapRpcVirtualFunction.prototype.m_driver = null;
oFF.OlapRpcVirtualFunction.prototype.m_metadata = null;
oFF.OlapRpcVirtualFunction.prototype.processFunctionExecution = function(syncType, listener, customIdentifier)
{
	var rpcRequest = this.getRpcRequest();
	oFF.XLogger.println("VIRTUAL_INA_SQL Request");
	oFF.XLogger.println(rpcRequest.getUri().getPath());
	if (rpcRequest.getRequestStructure() === null)
	{
		oFF.XLogger.println("null");
	}
	else
	{
		oFF.XLogger.println(rpcRequest.getRequestStructure().toString());
	}
	var ret = oFF.OlapSqlProcessor.create().setMetaData(this.m_metadata).setServerInfo("/sinaInfo").setInaPath("/sinaIna").onProcess(rpcRequest.getRequestStructure(), rpcRequest.getUri().getPath(), this.m_driver);
	oFF.XLogger.println("VIRTUAL_INA_SQL Response");
	if (ret.getSecondObject() === null)
	{
		oFF.XLogger.println("null");
	}
	else
	{
		oFF.XLogger.println(ret.getSecondObject().toString());
	}
	this.setServerStatusCode(ret.getFirstObject().getInteger());
	this.getRpcResponse().setRootElement(ret.getSecondObject(), ret.getSecondObject().toString());
	this.setData(this.getRpcResponse());
	return this.processSyncAction(syncType, listener, customIdentifier);
};

oFF.OlapEngineModule = function() {};
oFF.OlapEngineModule.prototype = new oFF.DfModule();
oFF.OlapEngineModule.prototype._ff_c = "OlapEngineModule";

oFF.OlapEngineModule.s_module = null;
oFF.OlapEngineModule.getInstance = function()
{
	if (oFF.isNull(oFF.OlapEngineModule.s_module))
	{
		oFF.DfModule.checkInitialized(oFF.RuntimeModule.getInstance());
		oFF.OlapEngineModule.s_module = oFF.DfModule.startExt(new oFF.OlapEngineModule());
		oFF.OlapDimensionType.staticSetup();
		oFF.OlapRequestEntryType.staticSetup();
		oFF.OlapRpcFunctionFactory.staticSetup();
		oFF.DfModule.stopExt(oFF.OlapEngineModule.s_module);
	}
	return oFF.OlapEngineModule.s_module;
};
oFF.OlapEngineModule.prototype.getName = function()
{
	return "ff4500.olap.engine";
};

oFF.OlapEngineModule.getInstance();

return sap.firefly;
	} );