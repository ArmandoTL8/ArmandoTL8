/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
[
"sap/sac/df/firefly/ff0005.language.ext","sap/sac/df/firefly/ff2100.runtime"
],
function(oFF)
{
"use strict";

oFF.RpcSqlInaUtil = {

	QY_MESSAGES:"Messages",
	QY_MESSAGE_CLASS:"MessageClass",
	QY_NUMBER:"Number",
	QY_TYPE:"Type",
	QY_TEXT:"Text",
	VA_SEVERITY_ERROR:2,
	createErrorResponse:function(errors)
	{
			var response = oFF.PrFactory.createStructure();
		var messages = response.putNewList(oFF.RpcSqlInaUtil.QY_MESSAGES);
		var size = errors.size();
		for (var i = 0; i < size; i++)
		{
			var error = errors.get(i);
			var message = messages.addNewStructure();
			message.putString(oFF.RpcSqlInaUtil.QY_TEXT, error.getText());
			message.putInteger(oFF.RpcSqlInaUtil.QY_TYPE, oFF.RpcSqlInaUtil.VA_SEVERITY_ERROR);
			message.putInteger(oFF.RpcSqlInaUtil.QY_NUMBER, error.getCode());
			message.putString(oFF.RpcSqlInaUtil.QY_MESSAGE_CLASS, "RpcSql");
		}
		return response;
	},
	getErrors:function(data)
	{
			var errors = oFF.XList.create();
		if (oFF.notNull(data) && data.isStructure())
		{
			var rawMessages = data.asStructure().getByKey(oFF.RpcSqlInaUtil.QY_MESSAGES);
			if (oFF.notNull(rawMessages) && rawMessages.isList())
			{
				var messages = rawMessages.asList();
				for (var i = 0, size = messages.size(); i < size; i++)
				{
					if (messages.getStructureAt(i).getIntegerByKey(oFF.RpcSqlInaUtil.QY_TYPE) === oFF.RpcSqlInaUtil.VA_SEVERITY_ERROR)
					{
						errors.add(oFF.XMessage.createError("RpcSql", messages.getStructureAt(i).getStringByKey(oFF.RpcSqlInaUtil.QY_TEXT), null, false, null));
					}
				}
			}
		}
		return errors;
	}
};

oFF.SqlAccessControl = function() {};
oFF.SqlAccessControl.prototype = new oFF.XObject();
oFF.SqlAccessControl.prototype._ff_c = "SqlAccessControl";

oFF.SqlAccessControl.create = function(parent)
{
	var ctrl = new oFF.SqlAccessControl();
	ctrl.m_allowed_schemas = oFF.XListOfString.create();
	ctrl.m_allowed_tables = oFF.XList.create();
	ctrl.m_parent = parent;
	return ctrl;
};
oFF.SqlAccessControl.create2 = function()
{
	return oFF.SqlAccessControl.create(null);
};
oFF.SqlAccessControl.loadAccessControlFile = function(el)
{
	var acl = oFF.XHashMapByString.create();
	var st = el.asStructure();
	var users = st.getKeysAsReadOnlyListOfString();
	for (var i = 0; i < users.size(); i++)
	{
		var username = users.get(i);
		acl.put(username, oFF.SqlAccessControl.create2().importJson(st.getStructureByKey(username)));
	}
	return acl;
};
oFF.SqlAccessControl.prototype.m_parent = null;
oFF.SqlAccessControl.prototype.m_allowed_schemas = null;
oFF.SqlAccessControl.prototype.m_allowed_tables = null;
oFF.SqlAccessControl.prototype.allowSchema = function(name)
{
	this.m_allowed_schemas.add(name);
};
oFF.SqlAccessControl.prototype.allowTable = function(name)
{
	this.m_allowed_tables.add(oFF.SqlReference.create(name));
};
oFF.SqlAccessControl.prototype.allowTable2 = function(schema, name)
{
	this.m_allowed_tables.add(oFF.SqlReference.create2(schema, name));
};
oFF.SqlAccessControl.prototype.hasAccess = function(reference)
{
	var schema = reference.getComponents().size() === 2 ? reference.getComponents().get(0) : "";
	var i;
	for (i = 0; i < this.m_allowed_schemas.size(); i++)
	{
		if (oFF.XString.isEqual(schema, this.m_allowed_schemas.get(i)))
		{
			return true;
		}
	}
	for (i = 0; i < this.m_allowed_tables.size(); i++)
	{
		var size = this.m_allowed_tables.get(i).getComponents().size();
		if (reference.getComponents().size() !== size)
		{
			continue;
		}
		var j;
		for (j = 0; j < size; j++)
		{
			if (!oFF.XString.isEqual(reference.getComponents().get(j), this.m_allowed_tables.get(i).getComponents().get(j)))
			{
				break;
			}
		}
		if (j === size)
		{
			return true;
		}
	}
	if (oFF.notNull(this.m_parent))
	{
		return this.m_parent.hasAccess(reference);
	}
	return false;
};
oFF.SqlAccessControl.prototype.importJson = function(st)
{
	var i;
	var allowedSchemas = st.getListByKey("allowedSchemas");
	if (oFF.notNull(allowedSchemas))
	{
		for (i = 0; i < allowedSchemas.size(); i++)
		{
			var schemaName = allowedSchemas.getStringAt(i);
			this.allowSchema(schemaName);
		}
	}
	var allowedTables = st.getListByKey("allowedTables");
	if (oFF.notNull(allowedTables))
	{
		for (i = 0; i < allowedTables.size(); i++)
		{
			var tableId = allowedTables.getStringAt(i);
			var tkzr = oFF.SqlTokenizer.create(tableId);
			var tkn = tkzr.parsePlainOrReference();
			if (oFF.isNull(tkn) || !tkzr.endOfInput())
			{
				throw oFF.XException.createIllegalArgumentException(oFF.SqlOperation.format("Unexpected sql table identifier {0}", oFF.StringListBuilder.create().add(tableId).build()));
			}
			if (tkn.getType() === oFF.SqlTokenType.PLAIN)
			{
				this.allowTable(tkn.asSqlPlainToken().getString());
			}
			else
			{
				this.m_allowed_tables.add(tkn.asSqlReferenceToken().getReference());
			}
		}
	}
	return this;
};
oFF.SqlAccessControl.prototype.toJson = function()
{
	var opts = new oFF.SqlCodeGenOptions();
	opts.referenceQuotes = "\"";
	opts.stringQuotes = "'";
	var i;
	var st = oFF.PrFactory.createStructure();
	var allowedSchemas = st.putNewList("allowedSchemas");
	for (i = 0; i < this.m_allowed_schemas.size(); i++)
	{
		allowedSchemas.addString(this.m_allowed_schemas.get(i));
	}
	var allowedTables = st.getListByKey("allowedTables");
	for (i = 0; i < this.m_allowed_tables.size(); i++)
	{
		allowedTables.addString(this.m_allowed_tables.get(i).toSqlString(opts));
	}
	return st;
};

oFF.SqlValidateAccess = function() {};
oFF.SqlValidateAccess.prototype = new oFF.XObject();
oFF.SqlValidateAccess.prototype._ff_c = "SqlValidateAccess";

oFF.SqlValidateAccess.create = function(sql, access)
{
	var validator = new oFF.SqlValidateAccess();
	validator.m_tokenizer = oFF.SqlTokenizer.create(sql);
	validator.m_tokenizer.next();
	validator.m_access = access;
	validator.m_errors = oFF.XListOfString.create();
	return validator;
};
oFF.SqlValidateAccess.main = function()
{
	oFF.SqlModule.getInstance();
	var s = oFF.DefaultSession.create();
	var mypolicy = oFF.SqlAccessControl.create2();
	mypolicy.allowTable("test");
	mypolicy.allowSchema("mydb");
	mypolicy.allowTable("facts");
	var tests = new oFF.ListBuilder().init().build();
	tests.add(oFF.XPair.create(oFF.XStringValue.create("select * from \"facts\" UNION select ('___INA_SQL_TOTAL') AS \"YEAR\" from \"facts\""), oFF.XBooleanValue.create(true)));
	var errors = 0;
	for (var i = 0; i < tests.size(); i++)
	{
		var sql = tests.get(i).getFirstObject().getString();
		var valid = oFF.SqlValidateAccess.create(sql, mypolicy).validate();
		if (valid !== tests.get(i).getSecondObject().getBoolean())
		{
			errors++;
			s.getLogger().logError("Test failed unexpected result:");
			s.getLogger().logError(sql);
			s.getLogger().logError(oFF.XBoolean.convertToString(valid));
		}
	}
	s.getLogger().logError2("Failed Tests:", oFF.XInteger.convertToString(errors));
};
oFF.SqlValidateAccess.prototype.m_tokenizer = null;
oFF.SqlValidateAccess.prototype.m_access = null;
oFF.SqlValidateAccess.prototype.m_errors = null;
oFF.SqlValidateAccess.prototype.validateSelectJoinAlias = function()
{
	var depth = this.m_tokenizer.getCurrentDepth();
	var tkn = this.m_tokenizer.next();
	if (tkn.getType() === oFF.SqlTokenType.PLAIN || tkn.getType() === oFF.SqlTokenType.REFERENCE)
	{
		tkn = this.m_tokenizer.next();
	}
	if (tkn.getType() === oFF.SqlTokenType.OPERATOR && oFF.XString.isEqual(tkn.asSqlOperatorToken().getString(), ","))
	{
		return this.validateSelectJoins();
	}
	while (depth <= this.m_tokenizer.getCurrentDepth())
	{
		tkn = this.m_tokenizer.next();
		if (oFF.isNull(tkn))
		{
			return true;
		}
		if (tkn.getType() === oFF.SqlTokenType.PLAIN)
		{
			if (depth === this.m_tokenizer.getCurrentDepth() && oFF.XString.isEqual(tkn.asSqlPlainToken().getString(), "union"))
			{
				this.m_tokenizer.next();
				return this.validate();
			}
			if (oFF.XString.isEqual(tkn.asSqlPlainToken().getString(), "select"))
			{
				this.m_errors.add("Queries after from and joins are not supported");
				return false;
			}
		}
	}
	return true;
};
oFF.SqlValidateAccess.prototype.validateSelectJoin = function()
{
	var tkn = this.m_tokenizer.next();
	if (oFF.isNull(tkn))
	{
		return false;
	}
	if (tkn.getType() === oFF.SqlTokenType.REFERENCE && this.m_access.hasAccess(tkn.asSqlReferenceToken().getReference()) || tkn.getType() === oFF.SqlTokenType.PLAIN && this.m_access.hasAccess(oFF.SqlReference.create(tkn.asSqlPlainToken().getString())))
	{
		return this.validateSelectJoinAlias();
	}
	else if (tkn.getType() === oFF.SqlTokenType.OPERATOR && oFF.XString.isEqual(tkn.asSqlOperatorToken().getString(), "("))
	{
		this.m_tokenizer.next();
		if (!this.validate())
		{
			return false;
		}
		return this.validateSelectJoinAlias();
	}
	return false;
};
oFF.SqlValidateAccess.prototype.validateSelectJoins = function()
{
	var tkn = this.m_tokenizer.getCurrent();
	if (tkn.getType() === oFF.SqlTokenType.PLAIN)
	{
		if (oFF.XString.isEqual(tkn.asSqlPlainToken().getString(), "inner"))
		{
			tkn = this.m_tokenizer.next();
			if (tkn.getType() === oFF.SqlTokenType.PLAIN && oFF.XString.isEqual(tkn.asSqlPlainToken().getString(), "join"))
			{
				return this.validateSelectJoin();
			}
			return false;
		}
		else if (oFF.XString.isEqual(tkn.asSqlPlainToken().getString(), "full") || oFF.XString.isEqual(tkn.asSqlPlainToken().getString(), "left") || oFF.XString.isEqual(tkn.asSqlPlainToken().getString(), "right"))
		{
			tkn = this.m_tokenizer.next();
			if (tkn.getType() === oFF.SqlTokenType.PLAIN && oFF.XString.isEqual(tkn.asSqlPlainToken().getString(), "outer"))
			{
				tkn = this.m_tokenizer.next();
			}
			if (tkn.getType() === oFF.SqlTokenType.PLAIN && oFF.XString.isEqual(tkn.asSqlPlainToken().getString(), "join"))
			{
				return this.validateSelectJoin();
			}
			return false;
		}
	}
	var depth = this.m_tokenizer.getCurrentDepth();
	while (depth <= this.m_tokenizer.getCurrentDepth())
	{
		var tkn2 = this.m_tokenizer.getCurrent();
		if (oFF.isNull(tkn2))
		{
			return true;
		}
		if (tkn2.getType() === oFF.SqlTokenType.PLAIN)
		{
			if (oFF.XString.isEqual(tkn2.asSqlPlainToken().getString(), "select"))
			{
				return false;
			}
		}
		this.m_tokenizer.next();
	}
	return true;
};
oFF.SqlValidateAccess.prototype.isSqlKeyword = function(test)
{
	var ops = oFF.StringListBuilder.create().add("select").add("true").add("false").add("null").add("with").add("inner").add("join").add("outer").add("left").add("right").add("full").add("from").add("on").add("and").add("or").add("like").add("order").add("group").add("by").add("limit").add("offset").add("asc").add("desc").add("top").add("where").add("not").add("in").add("union").build();
	for (var j = 0; j < ops.size(); j++)
	{
		if (oFF.XString.isEqual(test, ops.get(j)))
		{
			return true;
		}
	}
	return false;
};
oFF.SqlValidateAccess.prototype.validateSelectAlias = function()
{
	var depth = this.m_tokenizer.getCurrentDepth();
	var tkn = this.m_tokenizer.next();
	if (this.m_tokenizer.endOfInput() && oFF.isNull(tkn))
	{
		return true;
	}
	if (oFF.isNull(tkn))
	{
		throw oFF.XException.createIllegalStateException("NO");
	}
	if (tkn.getType() === oFF.SqlTokenType.PLAIN && !this.isSqlKeyword(tkn.asSqlPlainToken().getString()) || tkn.getType() === oFF.SqlTokenType.REFERENCE)
	{
		tkn = this.m_tokenizer.next();
		if (this.m_tokenizer.endOfInput() && oFF.isNull(tkn))
		{
			return true;
		}
	}
	if (oFF.isNull(tkn))
	{
		throw oFF.XException.createIllegalStateException("NO");
	}
	if (tkn.getType() === oFF.SqlTokenType.OPERATOR && oFF.XString.isEqual(tkn.asSqlOperatorToken().getString(), ","))
	{
		return this.validateSelectFrom();
	}
	if (depth === this.m_tokenizer.getCurrentDepth() && oFF.XString.isEqual(tkn.asSqlPlainToken().getString(), "union"))
	{
		this.m_tokenizer.next();
		return this.validate();
	}
	return depth > this.m_tokenizer.getCurrentDepth() || this.validateSelectJoins();
};
oFF.SqlValidateAccess.prototype.validateSelectFrom = function()
{
	var tkn = this.m_tokenizer.next();
	if (oFF.isNull(tkn))
	{
		return false;
	}
	if (tkn.getType() === oFF.SqlTokenType.REFERENCE && this.m_access.hasAccess(tkn.asSqlReferenceToken().getReference()) || tkn.getType() === oFF.SqlTokenType.PLAIN && !this.isSqlKeyword(tkn.asSqlPlainToken().getString()) && this.m_access.hasAccess(oFF.SqlReference.create(tkn.asSqlPlainToken().getString())))
	{
		return this.validateSelectAlias();
	}
	else if (tkn.getType() === oFF.SqlTokenType.OPERATOR && oFF.XString.isEqual(tkn.asSqlOperatorToken().getString(), "("))
	{
		this.m_tokenizer.next();
		if (!this.validate())
		{
			return false;
		}
		return this.validateSelectAlias();
	}
	return false;
};
oFF.SqlValidateAccess.prototype.validateSelect = function()
{
	var depth = this.m_tokenizer.getCurrentDepth();
	while (depth <= this.m_tokenizer.getCurrentDepth())
	{
		var tkn = this.m_tokenizer.next();
		if (oFF.isNull(tkn))
		{
			return false;
		}
		if (tkn.getType() === oFF.SqlTokenType.PLAIN)
		{
			if (oFF.XString.isEqual(tkn.asSqlPlainToken().getString(), "select"))
			{
				this.m_errors.add("SubQueries before from and joins are not supported");
				return false;
			}
			if (depth === this.m_tokenizer.getCurrentDepth() && oFF.XString.isEqual(tkn.asSqlPlainToken().getString(), "from"))
			{
				return this.validateSelectFrom();
			}
		}
	}
	return false;
};
oFF.SqlValidateAccess.prototype.validateWith = function()
{
	var tkn = this.m_tokenizer.next();
	if (oFF.isNull(tkn) || tkn.getType() !== oFF.SqlTokenType.PLAIN && tkn.getType() !== oFF.SqlTokenType.REFERENCE)
	{
		return false;
	}
	var access = oFF.SqlAccessControl.create(this.m_access);
	access.allowTable(tkn.getType() === oFF.SqlTokenType.PLAIN ? tkn.asSqlPlainToken().getString() : tkn.asSqlReferenceToken().getReference().getComponents().get(0));
	var vaccess = new oFF.SqlValidateAccess();
	vaccess.m_access = access;
	vaccess.m_tokenizer = this.m_tokenizer;
	tkn = this.m_tokenizer.next();
	if (oFF.isNull(tkn) || tkn.getType() !== oFF.SqlTokenType.PLAIN || !oFF.XString.isEqual(tkn.asSqlPlainToken().getString(), "as"))
	{
		return false;
	}
	tkn = this.m_tokenizer.next();
	if (oFF.isNull(tkn) || tkn.getType() !== oFF.SqlTokenType.OPERATOR || !oFF.XString.isEqual(tkn.asSqlOperatorToken().getString(), "("))
	{
		return false;
	}
	this.m_tokenizer.next();
	if (!this.validate())
	{
		return false;
	}
	if (this.m_tokenizer.getCurrent().getType() !== oFF.SqlTokenType.OPERATOR || !oFF.XString.isEqual(this.m_tokenizer.getCurrent().asSqlOperatorToken().getString(), ")"))
	{
		return false;
	}
	tkn = this.m_tokenizer.next();
	if (oFF.isNull(tkn))
	{
		return false;
	}
	if (tkn.getType() === oFF.SqlTokenType.OPERATOR && oFF.XString.isEqual(tkn.asSqlOperatorToken().getString(), ","))
	{
		return vaccess.validateWith();
	}
	return vaccess.validate();
};
oFF.SqlValidateAccess.prototype.validate = function()
{
	var directive = this.m_tokenizer.getCurrent();
	if (oFF.isNull(directive) || directive.getType() !== oFF.SqlTokenType.PLAIN)
	{
		return false;
	}
	if (oFF.XString.isEqual(directive.asSqlPlainToken().getString(), "select"))
	{
		return this.validateSelect();
	}
	if (oFF.XString.isEqual(directive.asSqlPlainToken().getString(), "with"))
	{
		return this.validateWith();
	}
	return false;
};

oFF.SqlCodeGenOptions = function() {};
oFF.SqlCodeGenOptions.prototype = new oFF.XObject();
oFF.SqlCodeGenOptions.prototype._ff_c = "SqlCodeGenOptions";

oFF.SqlCodeGenOptions.prototype.referenceQuotes = "\"";
oFF.SqlCodeGenOptions.prototype.stringQuotes = "'";
oFF.SqlCodeGenOptions.prototype.hasWith = true;
oFF.SqlCodeGenOptions.prototype.hasSubqueries = true;
oFF.SqlCodeGenOptions.prototype.noQuote = false;

oFF.SqlJoin = function() {};
oFF.SqlJoin.prototype = new oFF.XObject();
oFF.SqlJoin.prototype._ff_c = "SqlJoin";

oFF.SqlJoin.create = function(jointype, table)
{
	var join = new oFF.SqlJoin();
	if (oFF.XStringUtils.containsString(jointype, " on", true))
	{
		throw oFF.XException.createIllegalArgumentException("jointype contains a space");
	}
	join.m_jointype = jointype;
	join.m_table = table;
	join.m_on = null;
	return join;
};
oFF.SqlJoin.prototype.m_jointype = null;
oFF.SqlJoin.prototype.m_table = null;
oFF.SqlJoin.prototype.m_on = null;
oFF.SqlJoin.prototype.on = function(on)
{
	this.m_on = on;
	return this;
};
oFF.SqlJoin.prototype.toSqlString = function(opts)
{
	var buf = oFF.XStringBuffer.create();
	buf.append(this.m_jointype);
	buf.append(" ");
	buf.append(this.m_table.toSqlString(opts));
	if (oFF.notNull(this.m_on))
	{
		buf.append(" on ");
		buf.append(this.m_on);
	}
	var ret = buf.toString();
	oFF.XObjectExt.release(buf);
	return ret;
};
oFF.SqlJoin.prototype.ReplaceTableSource = function(old, replacement)
{
	if (this.m_table.isEqualTableSource(old))
	{
		return oFF.SqlJoin.create(this.m_jointype, replacement).on(this.m_on);
	}
	return this;
};

oFF.SqlOperation = function() {};
oFF.SqlOperation.prototype = new oFF.XObject();
oFF.SqlOperation.prototype._ff_c = "SqlOperation";

oFF.SqlOperation.create = function(format, operants)
{
	var op = new oFF.SqlOperation();
	op.m_format = format;
	op.m_operants = operants;
	return op;
};
oFF.SqlOperation.format = function(format, arg)
{
	var buf = oFF.XStringBuffer.create();
	for (var i = 0; i < oFF.XString.size(format); )
	{
		var openbr = oFF.XString.indexOfFrom(format, "{", i);
		var closebr = oFF.XString.indexOfFrom(format, "}", i);
		if (openbr === -1 || closebr < openbr)
		{
			if (closebr !== -1)
			{
				if (closebr + 1 >= oFF.XString.size(format))
				{
					throw oFF.XException.createIllegalArgumentException("invalid format string");
				}
				buf.append(oFF.XString.substring(format, i, closebr + 1));
				if (!oFF.XString.isEqual(oFF.XString.substring(format, closebr + 1, closebr + 2), "}"))
				{
					throw oFF.XException.createIllegalArgumentException("invalid format string");
				}
				i = closebr + 2;
			}
			else
			{
				buf.append(oFF.XString.substring(format, i, -1));
				i = oFF.XString.size(format);
			}
		}
		else if (openbr + 1 >= oFF.XString.size(format))
		{
			throw oFF.XException.createIllegalArgumentException("invalid format string");
		}
		else if (oFF.XString.isEqual(oFF.XString.substring(format, openbr + 1, openbr + 2), "{"))
		{
			buf.append(oFF.XString.substring(format, i, openbr + 1));
			i = openbr + 2;
		}
		else
		{
			buf.append(oFF.XString.substring(format, i, openbr));
			var index = oFF.XInteger.convertFromString(oFF.XString.substring(format, openbr + 1, closebr));
			if (index < 0 || index >= arg.size())
			{
				throw oFF.XException.createIllegalArgumentException("index out of range");
			}
			buf.append(arg.get(index));
			i = closebr + 1;
		}
	}
	return buf.toString();
};
oFF.SqlOperation.parseStringLiteral = function(sep, statement)
{
	var l = oFF.XListOfString.create();
	l.add(sep);
	if (!oFF.XString.match(statement, oFF.SqlOperation.format("^{0}({0}{0}|[^{0}])*{0}", l)))
	{
		return null;
	}
	var s = oFF.XString.substring(statement, 1, -1);
	for (var i = 0; i + 1 < oFF.XString.size(s); i++)
	{
		if (oFF.XString.isEqual(oFF.XString.substring(s, i, i + 1), sep))
		{
			if (oFF.XString.isEqual(oFF.XString.substring(s, i + 1, i + 2), sep))
			{
				s = oFF.XStringUtils.concatenate2(oFF.XString.substring(s, 0, i + 1), oFF.XString.substring(s, i + 2, -1));
			}
			else
			{
				break;
			}
		}
	}
	return oFF.SqlStringConstant.create(s);
};
oFF.SqlOperation.main = function()
{
	var val = oFF.SqlOperation.parseValue("'Hello World'", new oFF.SqlCodeGenOptions());
	val.isEqualTo(null);
	val = oFF.SqlOperation.parseValue("  'Hello World'", new oFF.SqlCodeGenOptions());
	val = oFF.SqlOperation.parseValue("  +2.5", new oFF.SqlCodeGenOptions());
	val = oFF.SqlOperation.parseValue("  +2.", new oFF.SqlCodeGenOptions());
	val = oFF.SqlOperation.parseValue("  +.1", new oFF.SqlCodeGenOptions());
	val = oFF.SqlOperation.parseValue("  -.1", new oFF.SqlCodeGenOptions());
	val = oFF.SqlOperation.parseValue("  +2e+4", new oFF.SqlCodeGenOptions());
	val = oFF.SqlOperation.parseValue("  +2e-4", new oFF.SqlCodeGenOptions());
	val = oFF.SqlOperation.parseValue("  -.3e-4", new oFF.SqlCodeGenOptions());
};
oFF.SqlOperation.parseNumber = function(_statement)
{
	var statement = _statement;
	var i = 0;
	if (oFF.XString.match(statement, "^[\\+-]"))
	{
		i++;
	}
	for (; i < oFF.XString.size(statement); i++)
	{
		if (!oFF.XString.match(oFF.XString.substring(statement, i, -1), "^[0-9]"))
		{
			break;
		}
	}
	var j = i;
	if (oFF.XString.match(oFF.XString.substring(statement, i, -1), "^\\."))
	{
		for (j = i + 1; j < oFF.XString.size(statement); j++)
		{
			if (!oFF.XString.match(oFF.XString.substring(statement, j, -1), "^[0-9]"))
			{
				break;
			}
		}
	}
	var k = 0;
	if (j + 2 < oFF.XString.size(statement) && oFF.XString.match(oFF.XString.substring(statement, j, -1), "^e"))
	{
		k = j + 1;
		if (oFF.XString.match(oFF.XString.substring(statement, k, -1), "^[+-]"))
		{
			k++;
		}
		for (; k < oFF.XString.size(statement); k++)
		{
			if (!oFF.XString.match(oFF.XString.substring(statement, k, -1), "^[0-9]"))
			{
				break;
			}
		}
	}
	if (j > i || k > 0)
	{
		return oFF.SqlDoubleConstant.create(oFF.XDouble.convertFromString(oFF.XString.substring(statement, 0, k > 0 ? k : j)));
	}
	return oFF.SqlIntegerConstant.create(oFF.XLong.convertFromString(oFF.XString.substring(statement, 0, i)));
};
oFF.SqlOperation.parseValue = function(_statement, opts)
{
	var statement = _statement;
	while (oFF.XString.match(statement, "^\\s"))
	{
		statement = oFF.XString.substring(statement, 1, -1);
	}
	var left = oFF.SqlOperation.parseStringLiteral(opts.stringQuotes, statement);
	if (oFF.notNull(left))
	{
		return left;
	}
	left = oFF.SqlOperation.parseStringLiteral(opts.referenceQuotes, statement);
	if (oFF.notNull(left))
	{
		return left;
	}
	if (oFF.XString.match(statement, "^\\("))
	{
		left = oFF.SqlOperation.parseValue(oFF.XString.substring(statement, 1, -1), opts);
		if (oFF.notNull(left))
		{
			return left;
		}
	}
	if (oFF.XString.match(statement, "^[\\+-]?([0-9]+(\\.[0-9]*)?|\\.[0-9]+)(e[+-]?[0-9]+)?"))
	{
		left = oFF.SqlOperation.parseNumber(statement);
		if (oFF.notNull(left))
		{
			return left;
		}
	}
	return null;
};
oFF.SqlOperation.and = function(left, right)
{
	var operants = oFF.XList.create();
	operants.add(left);
	operants.add(right);
	return oFF.SqlOperation.create("({0}) and ({1})", operants);
};
oFF.SqlOperation.or = function(left, right)
{
	var operants = oFF.XList.create();
	operants.add(left);
	operants.add(right);
	return oFF.SqlOperation.create("({0}) or ({1})", operants);
};
oFF.SqlOperation.equals = function(left, right)
{
	var operants = oFF.XList.create();
	operants.add(left);
	operants.add(right);
	return oFF.SqlOperation.create("({0}) = ({1})", operants);
};
oFF.SqlOperation.less = function(left, right)
{
	var operants = oFF.XList.create();
	operants.add(left);
	operants.add(right);
	return oFF.SqlOperation.create("({0}) < ({1})", operants);
};
oFF.SqlOperation.greater = function(left, right)
{
	var operants = oFF.XList.create();
	operants.add(left);
	operants.add(right);
	return oFF.SqlOperation.create("({0}) > ({1})", operants);
};
oFF.SqlOperation.lessEqual = function(left, right)
{
	var operants = oFF.XList.create();
	operants.add(left);
	operants.add(right);
	return oFF.SqlOperation.create("({0}) <= ({1})", operants);
};
oFF.SqlOperation.greaterEqual = function(left, right)
{
	var operants = oFF.XList.create();
	operants.add(left);
	operants.add(right);
	return oFF.SqlOperation.create("({0}) >= ({1})", operants);
};
oFF.SqlOperation._in = function(left, right)
{
	var operants = oFF.XList.create();
	operants.add(left);
	operants.add(right);
	return oFF.SqlOperation.create("({0}) in ({1})", operants);
};
oFF.SqlOperation.between = function(val, left, right)
{
	var operants = oFF.XList.create();
	operants.add(val);
	operants.add(left);
	operants.add(right);
	return oFF.SqlOperation.create("({0}) between ({1}) and ({2})", operants);
};
oFF.SqlOperation.not = function(p)
{
	var operants = oFF.XList.create();
	operants.add(p);
	return oFF.SqlOperation.create("not ({0})", operants);
};
oFF.SqlOperation.exists = function(p)
{
	var operants = oFF.XList.create();
	operants.add(p);
	return oFF.SqlOperation.create("exists ({0})", operants);
};
oFF.SqlOperation.like = function(left, right)
{
	var operants = oFF.XList.create();
	operants.add(left);
	operants.add(right);
	return oFF.SqlOperation.create("({0}) like ({1})", operants);
};
oFF.SqlOperation.prototype.m_format = "";
oFF.SqlOperation.prototype.m_operants = null;
oFF.SqlOperation.prototype.toSqlString = function(opts)
{
	var buf = oFF.XStringBuffer.create();
	for (var i = 0; i < oFF.XString.size(this.m_format); )
	{
		var openbr = oFF.XString.indexOfFrom(this.m_format, "{", i);
		var closebr = oFF.XString.indexOfFrom(this.m_format, "}", i);
		if (openbr === -1 || closebr < openbr)
		{
			if (closebr !== -1)
			{
				if (closebr + 1 >= oFF.XString.size(this.m_format))
				{
					throw oFF.XException.createIllegalArgumentException("invalid format string");
				}
				buf.append(oFF.XString.substring(this.m_format, i, closebr + 1));
				if (!oFF.XString.isEqual(oFF.XString.substring(this.m_format, closebr + 1, closebr + 2), "}"))
				{
					throw oFF.XException.createIllegalArgumentException("invalid format string");
				}
				i = closebr + 2;
			}
			else
			{
				buf.append(oFF.XString.substring(this.m_format, i, -1));
				i = oFF.XString.size(this.m_format);
			}
		}
		else if (openbr + 1 >= oFF.XString.size(this.m_format))
		{
			throw oFF.XException.createIllegalArgumentException("invalid format string");
		}
		else if (oFF.XString.isEqual(oFF.XString.substring(this.m_format, openbr + 1, openbr + 2), "{"))
		{
			buf.append(oFF.XString.substring(this.m_format, i, openbr + 1));
			i = openbr + 2;
		}
		else
		{
			buf.append(oFF.XString.substring(this.m_format, i, openbr));
			var index = oFF.XInteger.convertFromString(oFF.XString.substring(this.m_format, openbr + 1, closebr));
			if (index < 0 || index >= this.m_operants.size())
			{
				throw oFF.XException.createIllegalArgumentException("index out of range");
			}
			buf.append(this.m_operants.get(index).toSqlString(opts));
			i = closebr + 1;
		}
	}
	return buf.toString();
};
oFF.SqlOperation.prototype.ReplaceTableSource = function(old, replacement)
{
	return this;
};

oFF.SqlParser = function() {};
oFF.SqlParser.prototype = new oFF.XObject();
oFF.SqlParser.prototype._ff_c = "SqlParser";

oFF.SqlParser.format = function(format, arg)
{
	var buf = oFF.XStringBuffer.create();
	for (var i = 0; i < oFF.XString.size(format); )
	{
		var openbr = oFF.XString.indexOfFrom(format, "{", i);
		var closebr = oFF.XString.indexOfFrom(format, "}", i);
		if (openbr === -1 || closebr < openbr)
		{
			if (closebr !== -1)
			{
				if (closebr + 1 >= oFF.XString.size(format))
				{
					throw oFF.XException.createIllegalArgumentException("invalid format string");
				}
				buf.append(oFF.XString.substring(format, i, closebr + 1));
				if (!oFF.XString.isEqual(oFF.XString.substring(format, closebr + 1, closebr + 2), "}"))
				{
					throw oFF.XException.createIllegalArgumentException("invalid format string");
				}
				i = closebr + 2;
			}
			else
			{
				buf.append(oFF.XString.substring(format, i, -1));
				i = oFF.XString.size(format);
			}
		}
		else if (openbr + 1 >= oFF.XString.size(format))
		{
			throw oFF.XException.createIllegalArgumentException("invalid format string");
		}
		else if (oFF.XString.isEqual(oFF.XString.substring(format, openbr + 1, openbr + 2), "{"))
		{
			buf.append(oFF.XString.substring(format, i, openbr + 1));
			i = openbr + 2;
		}
		else
		{
			buf.append(oFF.XString.substring(format, i, openbr));
			var index = oFF.XInteger.convertFromString(oFF.XString.substring(format, openbr + 1, closebr));
			if (index < 0 || index >= arg.size())
			{
				throw oFF.XException.createIllegalArgumentException("index out of range");
			}
			buf.append(arg.get(index));
			i = closebr + 1;
		}
	}
	return buf.toString();
};
oFF.SqlParser.format1 = function(format, val1)
{
	var arg = oFF.XListOfString.create();
	arg.add(val1);
	return oFF.SqlParser.format(format, arg);
};
oFF.SqlParser.format2 = function(format, val1, val2)
{
	var arg = oFF.XListOfString.create();
	arg.add(val1);
	arg.add(val2);
	return oFF.SqlParser.format(format, arg);
};
oFF.SqlParser.format3 = function(format, val1, val2, val3)
{
	var arg = oFF.XListOfString.create();
	arg.add(val1);
	arg.add(val2);
	arg.add(val3);
	return oFF.SqlParser.format(format, arg);
};
oFF.SqlParser.main = function()
{
	oFF.SqlParser.test();
};
oFF.SqlParser.create = function(statement)
{
	var p = new oFF.SqlParser();
	p.m_statement = statement;
	return p;
};
oFF.SqlParser.test = function()
{
	var val = oFF.SqlParser.create("'Hello World'").parseValue(new oFF.SqlCodeGenOptions());
	val.isEqualTo(null);
	val = oFF.SqlParser.create("  'Hello World'").parseValue(new oFF.SqlCodeGenOptions());
	val = oFF.SqlParser.create("  +2.5").parseValue(new oFF.SqlCodeGenOptions());
	val = oFF.SqlParser.create("  +2.").parseValue(new oFF.SqlCodeGenOptions());
	val = oFF.SqlParser.create("  +.1").parseValue(new oFF.SqlCodeGenOptions());
	val = oFF.SqlParser.create("  -.1").parseValue(new oFF.SqlCodeGenOptions());
	val = oFF.SqlParser.create("  +2e+4").parseValue(new oFF.SqlCodeGenOptions());
	val = oFF.SqlParser.create("  +2e-4").parseValue(new oFF.SqlCodeGenOptions());
	val = oFF.SqlParser.create("  -.3e-4").parseValue(new oFF.SqlCodeGenOptions());
	val = oFF.SqlParser.create("  -.3e-4 = `Hello World` and 'x' = 'y' or 'y' = 'y' and 'x' = 'x' ").parseCondition2(new oFF.SqlCodeGenOptions(), 0);
	oFF.XLogger.println(val.toSqlString(new oFF.SqlCodeGenOptions()));
};
oFF.SqlParser.prototype.m_statement = "";
oFF.SqlParser.prototype.position = 0;
oFF.SqlParser.prototype.getStatement = function()
{
	return oFF.XString.substring(this.m_statement, this.position, -1);
};
oFF.SqlParser.prototype.updatePosition = function(inc)
{
	this.position = this.position + inc;
};
oFF.SqlParser.prototype.getStatementUpdatePosition = function(inc)
{
	var ret = oFF.XString.substring(this.m_statement, this.position, this.position + inc);
	this.position = this.position + inc;
	return ret;
};
oFF.SqlParser.prototype.parseStringLiteral = function(sep)
{
	var l = oFF.XListOfString.create();
	l.add(sep);
	if (!oFF.XString.match(this.getStatement(), oFF.SqlParser.format("^{0}({0}{0}|[^{0}])*{0}", l)))
	{
		return null;
	}
	var s = oFF.XString.substring(this.getStatement(), 1, -1);
	var i = 0;
	for (; i + 1 < oFF.XString.size(s); i++)
	{
		if (oFF.XString.isEqual(oFF.XString.substring(s, i, i + 1), sep))
		{
			if (oFF.XString.isEqual(oFF.XString.substring(s, i + 1, i + 2), sep))
			{
				s = oFF.XStringUtils.concatenate2(oFF.XString.substring(s, 0, i + 1), oFF.XString.substring(s, i + 2, -1));
			}
			else
			{
				break;
			}
		}
	}
	this.updatePosition(i + 2);
	return oFF.XString.substring(s, 0, i);
};
oFF.SqlParser.prototype.parseNumber = function()
{
	var i = 0;
	if (oFF.XString.match(this.getStatement(), "^[\\+-]"))
	{
		i++;
	}
	for (; i < oFF.XString.size(this.getStatement()); i++)
	{
		if (!oFF.XString.match(oFF.XString.substring(this.getStatement(), i, -1), "^[0-9]"))
		{
			break;
		}
	}
	var j = i;
	if (oFF.XString.match(oFF.XString.substring(this.getStatement(), i, -1), "^\\."))
	{
		for (j = i + 1; j < oFF.XString.size(this.getStatement()); j++)
		{
			if (!oFF.XString.match(oFF.XString.substring(this.getStatement(), j, -1), "^[0-9]"))
			{
				break;
			}
		}
	}
	var k = 0;
	if (j + 2 < oFF.XString.size(this.getStatement()) && oFF.XString.match(oFF.XString.substring(this.getStatement(), j, -1), "^e"))
	{
		k = j + 1;
		if (oFF.XString.match(oFF.XString.substring(this.getStatement(), k, -1), "^[+-]"))
		{
			k++;
		}
		for (; k < oFF.XString.size(this.getStatement()); k++)
		{
			if (!oFF.XString.match(oFF.XString.substring(this.getStatement(), k, -1), "^[0-9]"))
			{
				break;
			}
		}
	}
	if (j > i || k > 0)
	{
		return oFF.SqlDoubleConstant.create(oFF.XDouble.convertFromString(this.getStatementUpdatePosition(k > 0 ? k : j)));
	}
	return oFF.SqlIntegerConstant.create(oFF.XLong.convertFromString(this.getStatementUpdatePosition(i)));
};
oFF.SqlParser.prototype.skipWhiteSpace = function()
{
	var xret = false;
	while (oFF.XString.match(this.getStatement(), "^\\s"))
	{
		xret = true;
		this.updatePosition(1);
	}
	return xret;
};
oFF.SqlParser.prototype.parseValue = function(opts)
{
	this.skipWhiteSpace();
	var ls = this.parseStringLiteral(opts.stringQuotes);
	if (oFF.notNull(ls))
	{
		return oFF.SqlStringConstant.create(ls);
	}
	ls = this.parseStringLiteral(opts.referenceQuotes);
	if (oFF.notNull(ls))
	{
		this.skipWhiteSpace();
		if (!oFF.XString.match(this.getStatement(), "^\\."))
		{
			return oFF.SqlReference.create(ls);
		}
		this.updatePosition(1);
		var comp2 = this.parseStringLiteral(opts.referenceQuotes);
		this.skipWhiteSpace();
		if (oFF.notNull(comp2) && !oFF.XString.match(this.getStatement(), "^\\."))
		{
			return oFF.SqlReference.create2(ls, comp2);
		}
		this.updatePosition(1);
		var comp3 = this.parseStringLiteral(opts.referenceQuotes);
		this.skipWhiteSpace();
		if (oFF.notNull(comp2))
		{
			return oFF.SqlReference.create3(ls, comp2, comp3);
		}
	}
	var left;
	if (oFF.XString.match(this.getStatement(), "^\\("))
	{
		this.updatePosition(1);
		left = this.parseValue(opts);
		if (oFF.notNull(left))
		{
			this.skipWhiteSpace();
			if (!oFF.XString.match(this.getStatement(), "^\\)"))
			{
				throw oFF.XException.createIllegalArgumentException(oFF.SqlParser.format1("Syntax error at position {0}", oFF.XInteger.convertToString(this.position)));
			}
			this.updatePosition(1);
			return left;
		}
	}
	if (oFF.XString.match(this.getStatement(), "^[\\+-]?([0-9]+(\\.[0-9]*)?|\\.[0-9]+)(e[+-]?[0-9]+)?"))
	{
		left = this.parseNumber();
		if (oFF.notNull(left))
		{
			return left;
		}
	}
	return null;
};
oFF.SqlParser.prototype.parseArtihmetic = function(opts, precedence)
{
	this.skipWhiteSpace();
	if (oFF.XString.match(this.getStatement(), "^\\("))
	{
		this.updatePosition(1);
		var val = this.parseArtihmetic(opts, 0);
		if (oFF.notNull(val))
		{
			this.skipWhiteSpace();
			if (!oFF.XString.match(this.getStatement(), "^\\)"))
			{
				throw oFF.XException.createIllegalArgumentException(oFF.SqlParser.format1("Syntax error at position {0}, expected )", oFF.XInteger.convertToString(this.position)));
			}
			this.updatePosition(1);
			return val;
		}
		return val;
	}
	var left = this.parseValue(opts);
	this.skipWhiteSpace();
	if (oFF.XString.match(this.getStatement(), "^\\*"))
	{
		this.updatePosition(1);
		return null;
	}
	return left;
};
oFF.SqlParser.prototype.parseCondition = function(opts, precedence)
{
	this.skipWhiteSpace();
	if (oFF.XString.match(this.getStatement(), "^\\("))
	{
		this.updatePosition(1);
		var val = this.parseCondition(opts, 0);
		if (oFF.notNull(val))
		{
			this.skipWhiteSpace();
			if (!oFF.XString.match(this.getStatement(), "^\\)"))
			{
				throw oFF.XException.createIllegalArgumentException(oFF.SqlParser.format1("Syntax error at position {0}, expected )", oFF.XInteger.convertToString(this.position)));
			}
			this.updatePosition(1);
			return val;
		}
		return val;
	}
	var left = this.parseValue(opts);
	var right;
	this.skipWhiteSpace();
	if (oFF.XString.match(this.getStatement(), "^\\="))
	{
		this.updatePosition(1);
		right = this.parseValue(opts);
		return oFF.SqlOperation.equals(left, right);
	}
	if (oFF.XString.match(this.getStatement(), "^\\<"))
	{
		this.updatePosition(1);
		right = this.parseValue(opts);
		return oFF.SqlOperation.less(left, right);
	}
	if (oFF.XString.match(this.getStatement(), "^\\>"))
	{
		this.updatePosition(1);
		right = this.parseValue(opts);
		return oFF.SqlOperation.greater(left, right);
	}
	if (oFF.XString.match(this.getStatement(), "^\\<="))
	{
		this.updatePosition(1);
		right = this.parseValue(opts);
		return oFF.SqlOperation.lessEqual(left, right);
	}
	if (oFF.XString.match(this.getStatement(), "^\\>="))
	{
		this.updatePosition(1);
		right = this.parseValue(opts);
		return oFF.SqlOperation.greaterEqual(left, right);
	}
	return null;
};
oFF.SqlParser.prototype.parseCondition2 = function(opts, precedence)
{
	var right;
	this.skipWhiteSpace();
	if (precedence <= 2 && oFF.XString.match(this.getStatement(), "^\\not"))
	{
		this.updatePosition(1);
		right = this.parseCondition(opts, 3);
		return oFF.SqlOperation.not(right);
	}
	var left = null;
	if (oFF.XString.match(this.getStatement(), "^\\("))
	{
		this.updatePosition(1);
		var val = this.parseCondition2(opts, 0);
		if (oFF.notNull(val))
		{
			this.skipWhiteSpace();
			if (!oFF.XString.match(this.getStatement(), "^\\)"))
			{
				throw oFF.XException.createIllegalArgumentException(oFF.SqlParser.format1("Syntax error at position {0}, expected )", oFF.XInteger.convertToString(this.position)));
			}
			this.updatePosition(1);
			left = val;
		}
	}
	if (oFF.isNull(left))
	{
		left = this.parseCondition(opts, precedence);
	}
	while (oFF.XString.size(this.getStatement()) > 0)
	{
		this.skipWhiteSpace();
		if (oFF.XString.size(this.getStatement()) === 0)
		{
			break;
		}
		if (precedence <= 1 && oFF.XString.match(this.getStatement(), "^and"))
		{
			this.updatePosition(3);
			right = this.parseCondition2(opts, 1);
			left = oFF.SqlOperation.and(left, right);
		}
		else if (precedence <= 0 && oFF.XString.match(this.getStatement(), "^or"))
		{
			this.updatePosition(2);
			right = this.parseCondition2(opts, 0);
			left = oFF.SqlOperation.or(left, right);
		}
		else
		{
			break;
		}
	}
	return left;
};

oFF.SqlSubQuery = {

};

oFF.ListBuilder = function() {};
oFF.ListBuilder.prototype = new oFF.XObject();
oFF.ListBuilder.prototype._ff_c = "ListBuilder";

oFF.ListBuilder.create = function()
{
	return new oFF.ListBuilder().init();
};
oFF.ListBuilder.create2 = function(l)
{
	return new oFF.ListBuilder().init2(l);
};
oFF.ListBuilder.prototype.m_cells = null;
oFF.ListBuilder.prototype.init = function()
{
	this.m_cells = oFF.XList.create();
	return this;
};
oFF.ListBuilder.prototype.init2 = function(l)
{
	this.m_cells = l;
	return this;
};
oFF.ListBuilder.prototype.add = function(v)
{
	this.m_cells.add(v);
	return this;
};
oFF.ListBuilder.prototype.build = function()
{
	return this.m_cells;
};

oFF.MapBuilder = function() {};
oFF.MapBuilder.prototype = new oFF.XObject();
oFF.MapBuilder.prototype._ff_c = "MapBuilder";

oFF.MapBuilder.create = function()
{
	return new oFF.MapBuilder().init();
};
oFF.MapBuilder.create2 = function(l)
{
	return new oFF.MapBuilder().init2(l);
};
oFF.MapBuilder.prototype.m_cells = null;
oFF.MapBuilder.prototype.init = function()
{
	this.m_cells = oFF.XSimpleMap.create();
	return this;
};
oFF.MapBuilder.prototype.init2 = function(l)
{
	this.m_cells = l;
	return this;
};
oFF.MapBuilder.prototype.put = function(k, v)
{
	this.m_cells.put(k, v);
	return this;
};
oFF.MapBuilder.prototype.build = function()
{
	return this.m_cells;
};

oFF.PrListBuilder = function() {};
oFF.PrListBuilder.prototype = new oFF.XObject();
oFF.PrListBuilder.prototype._ff_c = "PrListBuilder";

oFF.PrListBuilder.create = function()
{
	return new oFF.PrListBuilder().init();
};
oFF.PrListBuilder.prototype.m_cells = null;
oFF.PrListBuilder.prototype.init = function()
{
	this.m_cells = oFF.PrFactory.createList();
	return this;
};
oFF.PrListBuilder.prototype.add = function(v)
{
	this.m_cells.add(v);
	return this;
};
oFF.PrListBuilder.prototype.build = function()
{
	return this.m_cells;
};

oFF.StringListBuilder = function() {};
oFF.StringListBuilder.prototype = new oFF.XObject();
oFF.StringListBuilder.prototype._ff_c = "StringListBuilder";

oFF.StringListBuilder.create = function()
{
	return new oFF.StringListBuilder().init();
};
oFF.StringListBuilder.create2 = function(l)
{
	return new oFF.StringListBuilder().init2(l);
};
oFF.StringListBuilder.prototype.m_cells = null;
oFF.StringListBuilder.prototype.init = function()
{
	this.m_cells = oFF.XListOfString.create();
	return this;
};
oFF.StringListBuilder.prototype.init2 = function(l)
{
	this.m_cells = l;
	return this;
};
oFF.StringListBuilder.prototype.add = function(v)
{
	this.m_cells.add(v);
	return this;
};
oFF.StringListBuilder.prototype.build = function()
{
	return this.m_cells;
};

oFF.StringMapBuilder = function() {};
oFF.StringMapBuilder.prototype = new oFF.XObject();
oFF.StringMapBuilder.prototype._ff_c = "StringMapBuilder";

oFF.StringMapBuilder.create = function()
{
	return new oFF.StringMapBuilder().init();
};
oFF.StringMapBuilder.create2 = function(l)
{
	return new oFF.StringMapBuilder().init2(l);
};
oFF.StringMapBuilder.prototype.m_cells = null;
oFF.StringMapBuilder.prototype.init = function()
{
	this.m_cells = oFF.XHashMapByString.create();
	return this;
};
oFF.StringMapBuilder.prototype.init2 = function(l)
{
	this.m_cells = l;
	return this;
};
oFF.StringMapBuilder.prototype.put = function(k, v)
{
	this.m_cells.put(k, v);
	return this;
};
oFF.StringMapBuilder.prototype.build = function()
{
	return this.m_cells;
};

oFF.SqlToken = function() {};
oFF.SqlToken.prototype = new oFF.XObject();
oFF.SqlToken.prototype._ff_c = "SqlToken";

oFF.SqlToken.prototype.asSqlPlainToken = function()
{
	return null;
};
oFF.SqlToken.prototype.asSqlReferenceToken = function()
{
	return null;
};
oFF.SqlToken.prototype.asSqlStringToken = function()
{
	return null;
};
oFF.SqlToken.prototype.asSqlNumberToken = function()
{
	return null;
};
oFF.SqlToken.prototype.asSqlOperatorToken = function()
{
	return null;
};

oFF.SqlTokenizer = function() {};
oFF.SqlTokenizer.prototype = new oFF.XObject();
oFF.SqlTokenizer.prototype._ff_c = "SqlTokenizer";

oFF.SqlTokenizer.create = function(sql)
{
	if (oFF.isNull(oFF.SqlTokenType.PLAIN))
	{
		oFF.SqlTokenType.staticSetup();
	}
	var tknz = new oFF.SqlTokenizer();
	tknz.m_sql = sql;
	tknz.m_pos = 0;
	tknz.m_depth = 0;
	return tknz;
};
oFF.SqlTokenizer.startsWithFrom = function(str, val, offset)
{
	var i = offset;
	var endOffset = offset + oFF.XString.size(val);
	if (oFF.XString.size(str) < endOffset)
	{
		return false;
	}
	while (i < endOffset)
	{
		if (oFF.XString.getCharAt(str, i) !== oFF.XString.getCharAt(val, i - offset))
		{
			return false;
		}
		i++;
	}
	return i === endOffset;
};
oFF.SqlTokenizer.main = function()
{
	var tknz = oFF.SqlTokenizer.create("SELECT mycol From myTable");
	while (tknz.parse() !== null)
	{
		oFF.XInteger.convertToString(tknz.m_pos);
	}
	tknz = oFF.SqlTokenizer.create("with x as (SELECT mycol From myTable) select * from x UNION select * from x");
	while (tknz.parse() !== null)
	{
		oFF.XInteger.convertToString(tknz.m_pos);
	}
};
oFF.SqlTokenizer.prototype.m_sql = null;
oFF.SqlTokenizer.prototype.m_pos = 0;
oFF.SqlTokenizer.prototype.m_depth = 0;
oFF.SqlTokenizer.prototype.m_current = null;
oFF.SqlTokenizer.prototype.skipSpace = function()
{
	var encoding = " ";
	var i = this.m_pos;
	while (i < oFF.XString.size(this.m_sql) && oFF.XString.getCharAt(this.m_sql, i) === oFF.XString.getCharAt(encoding, 0))
	{
		i++;
	}
	if (this.m_pos < i)
	{
		this.m_pos = i;
		return true;
	}
	return false;
};
oFF.SqlTokenizer.prototype.endOfInput = function()
{
	return this.m_pos === oFF.XString.size(this.m_sql);
};
oFF.SqlTokenizer.prototype.expectTokenEnd = function()
{
	if (!this.endOfInput() && !this.isOperator() && !this.skipSpace())
	{
		throw oFF.XException.createIllegalArgumentException(oFF.SqlOperation.format("Missing space or end of input after the current token at position {0}", oFF.StringListBuilder.create().add(oFF.XInteger.convertToString(this.m_pos)).build()));
	}
};
oFF.SqlTokenizer.prototype.parsePlainToken = function()
{
	var i = this.m_pos;
	var encoding = "aAzZ_09.";
	while (i < oFF.XString.size(this.m_sql))
	{
		var ch = oFF.XString.getCharAt(this.m_sql, i);
		if (ch >= oFF.XString.getCharAt(encoding, 0) && ch <= oFF.XString.getCharAt(encoding, 2) || ch >= oFF.XString.getCharAt(encoding, 1) && ch <= oFF.XString.getCharAt(encoding, 3) || ch === oFF.XString.getCharAt(encoding, 4) || i > 0 && ch >= oFF.XString.getCharAt(encoding, 5) && ch <= oFF.XString.getCharAt(encoding, 6))
		{
			i++;
		}
		else
		{
			break;
		}
	}
	if (this.m_pos < i)
	{
		var res = oFF.SqlPlainToken.create(oFF.XString.toLowerCase(oFF.XString.substring(this.m_sql, this.m_pos, i)));
		this.m_pos = i;
		if (this.endOfInput() || oFF.XString.getCharAt(this.m_sql, this.m_pos) !== oFF.XString.getCharAt(encoding, 7))
		{
			this.expectTokenEnd();
		}
		return res;
	}
	return null;
};
oFF.SqlTokenizer.prototype.parseIntegerToken = function()
{
	var i = this.m_pos;
	var encoding = "09+-";
	while (i < oFF.XString.size(this.m_sql))
	{
		var ch = oFF.XString.getCharAt(this.m_sql, i);
		if (ch >= oFF.XString.getCharAt(encoding, 0) && ch <= oFF.XString.getCharAt(encoding, 1) || i > 0 && (ch === oFF.XString.getCharAt(encoding, 2) || ch === oFF.XString.getCharAt(encoding, 3)))
		{
			i++;
		}
		else
		{
			break;
		}
	}
	if (this.m_pos < i)
	{
		var res = oFF.XString.substring(this.m_sql, this.m_pos, i);
		this.m_pos = i;
		return res;
	}
	return null;
};
oFF.SqlTokenizer.prototype.parseNumberToken = function()
{
	var oldpos = this.m_pos;
	var s1 = this.parseIntegerToken();
	var s2 = null;
	var s3 = null;
	if (this.endOfInput())
	{
		return oFF.notNull(s1) ? oFF.SqlNumberToken.create(s1) : null;
	}
	var encoding = ".eE";
	var ch = oFF.XString.getCharAt(this.m_sql, this.m_pos);
	if (ch === oFF.XString.getCharAt(encoding, 0))
	{
		this.m_pos++;
		s2 = this.parseIntegerToken();
		if (oFF.isNull(s1) && oFF.isNull(s2))
		{
			throw oFF.XException.createIllegalArgumentException(oFF.SqlOperation.format("Invalid floating point format at position {0}", oFF.StringListBuilder.create().add(oFF.XInteger.convertToString(this.m_pos)).build()));
		}
	}
	if (oFF.isNull(s1) && oFF.isNull(s2))
	{
		return null;
	}
	if (!this.endOfInput() && ch === oFF.XString.getCharAt(encoding, 1) || ch === oFF.XString.getCharAt(encoding, 2))
	{
		this.m_pos++;
		s3 = this.parseIntegerToken();
		if (oFF.isNull(s3))
		{
			throw oFF.XException.createIllegalArgumentException(oFF.SqlOperation.format("Invalid floating point format at position {0}", oFF.StringListBuilder.create().add(oFF.XInteger.convertToString(this.m_pos)).build()));
		}
	}
	if (oldpos < this.m_pos)
	{
		var res = oFF.SqlNumberToken.create(oFF.XString.substring(this.m_sql, oldpos, this.m_pos));
		this.expectTokenEnd();
		return res;
	}
	return null;
};
oFF.SqlTokenizer.prototype.parseQuote = function(quote)
{
	var i = this.m_pos;
	if (this.endOfInput() || oFF.XString.getCharAt(this.m_sql, i) !== oFF.XString.getCharAt(quote, 0))
	{
		return null;
	}
	i++;
	var str = oFF.XStringBuffer.create();
	while (i < oFF.XString.size(this.m_sql))
	{
		var ch = oFF.XString.getCharAt(this.m_sql, i);
		if (ch === oFF.XString.getCharAt(quote, 0))
		{
			if (i + 1 < oFF.XString.size(this.m_sql) && oFF.XString.getCharAt(this.m_sql, i + 1) === oFF.XString.getCharAt(quote, 0))
			{
				i++;
			}
			else
			{
				break;
			}
		}
		str.appendChar(ch);
		i++;
	}
	if (this.endOfInput() || oFF.XString.getCharAt(this.m_sql, i) !== oFF.XString.getCharAt(quote, 0))
	{
		throw oFF.XException.createIllegalArgumentException(oFF.SqlOperation.format("Missing closing Quote {0} at position {1}", oFF.StringListBuilder.create().add(quote).add(oFF.XInteger.convertToString(this.m_pos)).build()));
	}
	i++;
	var res = oFF.SqlStringToken.create(str.toString());
	this.m_pos = i;
	return res;
};
oFF.SqlTokenizer.prototype.isOperator = function()
{
	var i = this.m_pos;
	if (this.endOfInput())
	{
		return false;
	}
	var ops = oFF.StringListBuilder.create().add(",").add(";").add("(").add(")").add("+").add("-").add("*").add("/").add("!=").add("=").add("<=").add(">=").add("<").add(">").build();
	for (var j = 0; j < ops.size(); j++)
	{
		if (oFF.SqlTokenizer.startsWithFrom(this.m_sql, ops.get(j), i))
		{
			return true;
		}
	}
	return false;
};
oFF.SqlTokenizer.prototype.parseOperator = function()
{
	var i = this.m_pos;
	if (this.endOfInput())
	{
		return null;
	}
	var ops = oFF.StringListBuilder.create().add(",").add(";").add("(").add(")").add("+").add("-").add("*").add("/").add("!=").add("=").add("<=").add(">=").add("<").add(">").build();
	for (var j = 0; j < ops.size(); j++)
	{
		if (oFF.SqlTokenizer.startsWithFrom(this.m_sql, ops.get(j), i))
		{
			i = i + oFF.XString.size(ops.get(j));
			if (j === 2)
			{
				this.m_depth++;
			}
			if (j === 3)
			{
				if (this.m_depth === 0)
				{
					throw oFF.XException.createIllegalArgumentException("unexpected ) missing (");
				}
				this.m_depth--;
			}
			break;
		}
	}
	if (this.m_pos < i)
	{
		var res = oFF.SqlOperatorToken.create(oFF.XString.substring(this.m_sql, this.m_pos, i));
		this.m_pos = i;
		return res;
	}
	return null;
};
oFF.SqlTokenizer.prototype.parsePlainOrReference2 = function()
{
	var res = this.parsePlainToken();
	if (oFF.notNull(res))
	{
		return res;
	}
	var refq = this.parseQuote("\"");
	if (oFF.notNull(refq))
	{
		return oFF.SqlReferenceToken.create(oFF.SqlReference.create(refq.getString()));
	}
	return null;
};
oFF.SqlTokenizer.prototype.parsePlainOrReferenceAsReference = function()
{
	var res = this.parsePlainToken();
	if (oFF.notNull(res))
	{
		return res.getString();
	}
	res = this.parseQuote("\"");
	if (oFF.notNull(res))
	{
		return res.getString();
	}
	var star = "*";
	if (oFF.XString.getCharAt(this.m_sql, this.m_pos) === oFF.XString.getCharAt(star, 0))
	{
		this.m_pos++;
		return star;
	}
	return null;
};
oFF.SqlTokenizer.prototype.parsePlainOrReference = function()
{
	var t1 = this.parsePlainOrReference2();
	if (oFF.notNull(t1))
	{
		var encoding = ".";
		this.skipSpace();
		if (this.endOfInput() || oFF.XString.getCharAt(this.m_sql, this.m_pos) !== oFF.XString.getCharAt(encoding, 0))
		{
			return t1;
		}
		this.m_pos++;
		this.skipSpace();
		var s2 = this.parsePlainOrReferenceAsReference();
		if (oFF.isNull(s2))
		{
			throw oFF.XException.createIllegalArgumentException(oFF.SqlOperation.format("Missing reference name after . at position {0}", oFF.StringListBuilder.create().add(oFF.XInteger.convertToString(this.m_pos)).build()));
		}
		this.skipSpace();
		var s1 = t1.getType() === oFF.SqlTokenType.PLAIN ? t1.asSqlPlainToken().getString() : t1.asSqlReferenceToken().getReference().getComponents().get(0);
		if (this.endOfInput() || oFF.XString.getCharAt(this.m_sql, this.m_pos) !== oFF.XString.getCharAt(encoding, 0))
		{
			return oFF.SqlReferenceToken.create(oFF.SqlReference.create2(s1, s2));
		}
		this.m_pos++;
		this.skipSpace();
		var s3 = this.parsePlainOrReferenceAsReference();
		if (oFF.isNull(s3))
		{
			throw oFF.XException.createIllegalArgumentException(oFF.SqlOperation.format("Missing reference name after . at position {0}", oFF.StringListBuilder.create().add(oFF.XInteger.convertToString(this.m_pos)).build()));
		}
		return oFF.SqlReferenceToken.create(oFF.SqlReference.create3(s1, s2, s3));
	}
	return null;
};
oFF.SqlTokenizer.prototype.parse = function()
{
	this.skipSpace();
	var res = this.parsePlainOrReference();
	if (oFF.notNull(res))
	{
		return res;
	}
	res = this.parseQuote("'");
	if (oFF.notNull(res))
	{
		return res;
	}
	res = this.parseNumberToken();
	if (oFF.notNull(res))
	{
		return res;
	}
	res = this.parseOperator();
	if (oFF.notNull(res))
	{
		return res;
	}
	if (this.endOfInput() && this.m_depth > 0)
	{
		throw oFF.XException.createIllegalArgumentException("Expected ) at the of the input");
	}
	return null;
};
oFF.SqlTokenizer.prototype.getCurrentDepth = function()
{
	return this.m_depth;
};
oFF.SqlTokenizer.prototype.next = function()
{
	this.m_current = this.parse();
	return this.m_current;
};
oFF.SqlTokenizer.prototype.getCurrent = function()
{
	return this.m_current;
};

oFF.RpcSqlDriverFactory = function() {};
oFF.RpcSqlDriverFactory.prototype = new oFF.SqlDriverFactory();
oFF.RpcSqlDriverFactory.prototype._ff_c = "RpcSqlDriverFactory";

oFF.RpcSqlDriverFactory.staticSetup = function()
{
	oFF.SqlDriverFactory.registerFactory(new oFF.RpcSqlDriverFactory());
};
oFF.RpcSqlDriverFactory.prototype.newSqlDriver = function(driverName, data)
{
	if (oFF.XString.indexOf(driverName, "ina_sql=") === 0)
	{
		if (oFF.isNull(data))
		{
			throw oFF.XException.createIllegalArgumentException("Invalid Connection Pool == null");
		}
		return oFF.RpcSqlDriver.create2(driverName, data, oFF.XString.substring(driverName, 8, -1));
	}
	return null;
};

oFF.RpcSqlProxy = function() {};
oFF.RpcSqlProxy.prototype = new oFF.XObject();
oFF.RpcSqlProxy.prototype._ff_c = "RpcSqlProxy";

oFF.RpcSqlProxy.prototype.m_connectionstring = null;
oFF.RpcSqlProxy.prototype.m_drivername = null;
oFF.RpcSqlProxy.prototype.m_username = null;
oFF.RpcSqlProxy.prototype.m_password = null;
oFF.RpcSqlProxy.prototype.m_acl = null;
oFF.RpcSqlProxy.prototype.convert = function(set)
{
	var meta = set.getMetaData();
	var rstruct = oFF.PrFactory.createStructure();
	var columns = rstruct.putNewList("columns");
	for (var i = 0; i < meta.size(); i++)
	{
		columns.add(oFF.PrFactory.createString(meta.get(i)));
	}
	var values = rstruct.putNewList("values");
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
	return rstruct;
};
oFF.RpcSqlProxy.prototype.getDataBaseProvider = function()
{
	var driver = oFF.SqlDriverFactory.create(this.m_drivername, null);
	driver.processOpenExt(oFF.SyncType.BLOCKING, null, null, this.m_connectionstring, this.m_username, this.m_password);
	return driver;
};
oFF.RpcSqlProxy.prototype.onHttpRequest = function(serverRequestResponse)
{
	var user = serverRequestResponse.getClientHttpRequest().getInternalUser();
	if (oFF.isNull(user))
	{
		user = "";
	}
	var mypolicy = null;
	var acl = oFF.notNull(this.m_acl) ? oFF.SqlAccessControl.loadAccessControlFile(this.m_acl) : null;
	if (oFF.notNull(acl))
	{
		mypolicy = acl.getByKey(user);
		if (oFF.isNull(mypolicy))
		{
			mypolicy = oFF.SqlAccessControl.create2();
		}
	}
	var req = serverRequestResponse.getClientHttpRequest().getJsonContent();
	var serverPath = serverRequestResponse.getClientHttpRequest().getRelativePath();
	var newServerResponse = serverRequestResponse.newServerResponse();
	if (oFF.XString.isEqual(serverPath, "/sap/sql/ina/GetServerInfo"))
	{
		var root = oFF.PrFactory.createStructure();
		var serverInfo = root.putNewStructure("ServerInfo");
		serverInfo.putString("SystemId", "SQLJSON");
		serverInfo.putString("DataBaseManagementSystem", "Generic Sql");
		var services = root.putNewList("Services");
		var s = services.addNewStructure();
		var capabilities = s.putNewList("Capabilities");
		var cap = capabilities.addNewStructure();
		cap.putString("Capability", "BasicSql");
		cap.putString("Description", "A simple sql protocol");
		cap = capabilities.addNewStructure();
		cap.putString("Capability", "BasicSqlMetaData");
		cap.putString("Description", "Metadata for Sql Database");
		s.putString("Service", "Analytics");
		root.putNewStructure("Settings");
		newServerResponse.setString(root.toString());
		serverRequestResponse.setResponse(newServerResponse);
		return;
	}
	else if (oFF.XString.isEqual(serverPath, "/BasicSql"))
	{
		if (oFF.isNull(req) || !req.isStructure())
		{
			var c = oFF.MessageManagerSimple.createMessageManager();
			c.addError(1, "Expected a json object!");
			this.respondWithInaError(serverRequestResponse, newServerResponse, c.getErrors());
			return;
		}
		var sql = req.asStructure().getStringByKey("sql");
		if (oFF.notNull(mypolicy))
		{
			var validator = oFF.SqlValidateAccess.create(sql, mypolicy);
			if (!validator.validate())
			{
				this.respondWithInaError(serverRequestResponse, newServerResponse, new oFF.ListBuilder().init().add(oFF.XMessage.createError(sql, "Access Denied", null, false, null)).build());
				return;
			}
		}
		var type = req.asStructure().getStringByKey("type");
		var driver = this.getDataBaseProvider();
		if (oFF.XString.isEqual(type, "update"))
		{
			driver.processExecuteUpdate(oFF.SyncType.BLOCKING, null, null, sql);
			if (driver.hasErrors())
			{
				this.respondWithInaError(serverRequestResponse, newServerResponse, driver.getErrors());
			}
			else
			{
				newServerResponse.setStatusCode(201);
				serverRequestResponse.setResponse(newServerResponse);
			}
		}
		else if (oFF.XString.isEqual(type, "query"))
		{
			var res = driver.processExecuteQuery(oFF.SyncType.BLOCKING, null, null, sql);
			if (driver.hasErrors())
			{
				this.respondWithInaError(serverRequestResponse, newServerResponse, driver.getErrors());
			}
			else
			{
				var el = this.convert(res.getData());
				newServerResponse.setStatusCode(200);
				newServerResponse.setString(el.toString());
				serverRequestResponse.setResponse(newServerResponse);
			}
		}
		else
		{
			var c2 = oFF.MessageManagerSimple.createMessageManager();
			c2.addError(1, oFF.XStringUtils.concatenate2("Unexpected query type: ", type));
			this.respondWithInaError(serverRequestResponse, newServerResponse, c2.getErrors());
		}
		driver.close();
	}
	else if (oFF.XString.isEqual(serverPath, "/GetSchemas"))
	{
		this.getSchemas(req.asStructure(), serverRequestResponse, newServerResponse);
	}
	else if (oFF.XString.isEqual(serverPath, "/GetTables"))
	{
		this.getTables(req.asStructure(), serverRequestResponse, newServerResponse);
	}
	else if (oFF.XString.isEqual(serverPath, "/GetColumns"))
	{
		this.getColumns(req.asStructure(), serverRequestResponse, newServerResponse);
	}
	else if (oFF.XString.isEqual(serverPath, "/GetImportedKeys"))
	{
		this.getImportedKeys(req.asStructure(), serverRequestResponse, newServerResponse);
	}
	else
	{
		newServerResponse.setStatusCode(404);
		serverRequestResponse.setResponse(newServerResponse);
	}
};
oFF.RpcSqlProxy.prototype.getSchemas = function(root, serverRequestResponse, newServerResponse)
{
	var driver = this.getDataBaseProvider();
	var tableRes = driver.processGetSchemas(oFF.SyncType.BLOCKING, null, null);
	if (driver.hasErrors())
	{
		this.respondWithInaError(serverRequestResponse, newServerResponse, driver.getErrors());
	}
	else
	{
		newServerResponse.setStatusCode(200);
		newServerResponse.setString(this.convert(tableRes.getData()).toString());
		serverRequestResponse.setResponse(newServerResponse);
	}
	driver.close();
};
oFF.RpcSqlProxy.prototype.getTables = function(root, serverRequestResponse, newServerResponse)
{
	var driver = this.getDataBaseProvider();
	var catalog = root.getStringByKey("catalog");
	var schemaNamePattern = root.getStringByKey("schemaNamePattern");
	var tableNamePattern = root.getStringByKey("tableNamePattern");
	var tableRes = driver.processGetTables(oFF.SyncType.BLOCKING, null, null, catalog, schemaNamePattern, tableNamePattern);
	if (driver.hasErrors())
	{
		this.respondWithInaError(serverRequestResponse, newServerResponse, driver.getErrors());
	}
	else
	{
		newServerResponse.setStatusCode(200);
		newServerResponse.setString(this.convert(tableRes.getData()).toString());
		serverRequestResponse.setResponse(newServerResponse);
	}
	driver.close();
};
oFF.RpcSqlProxy.prototype.getColumns = function(root, serverRequestResponse, newServerResponse)
{
	var driver = this.getDataBaseProvider();
	var catalog = root.getStringByKey("catalog");
	var schemaNamePattern = root.getStringByKey("schemaNamePattern");
	var tableNamePattern = root.getStringByKey("tableNamePattern");
	var columnNamePattern = root.getStringByKey("columnNamePattern");
	var tableRes = driver.processGetColumns(oFF.SyncType.BLOCKING, null, null, catalog, schemaNamePattern, tableNamePattern, columnNamePattern);
	if (driver.hasErrors())
	{
		this.respondWithInaError(serverRequestResponse, newServerResponse, driver.getErrors());
	}
	else
	{
		newServerResponse.setStatusCode(200);
		newServerResponse.setString(this.convert(tableRes.getData()).toString());
		serverRequestResponse.setResponse(newServerResponse);
	}
	driver.close();
};
oFF.RpcSqlProxy.prototype.getImportedKeys = function(root, serverRequestResponse, newServerResponse)
{
	var driver = this.getDataBaseProvider();
	var catalog = root.getStringByKey("catalog");
	var schema = root.getStringByKey("schema");
	var table = root.getStringByKey("table");
	var tableRes = driver.processGetImportedKeys(oFF.SyncType.BLOCKING, null, null, catalog, schema, table);
	if (driver.hasErrors())
	{
		this.respondWithInaError(serverRequestResponse, newServerResponse, driver.getErrors());
	}
	else
	{
		newServerResponse.setStatusCode(200);
		newServerResponse.setString(this.convert(tableRes.getData()).toString());
		serverRequestResponse.setResponse(newServerResponse);
	}
	driver.close();
};
oFF.RpcSqlProxy.prototype.respondWithInaError = function(serverRequestResponse, newServerResponse, errors)
{
	var c = oFF.MessageManagerSimple.createMessageManager();
	c.setServerStatusCode(404);
	newServerResponse.setString(oFF.RpcSqlInaUtil.createErrorResponse(errors).toString());
	newServerResponse.setStatusCode(200);
	serverRequestResponse.setResponse(newServerResponse);
};
oFF.RpcSqlProxy.prototype.initServerContainer = function(environment)
{
	this.m_drivername = environment.getByKey("drivername");
	this.m_connectionstring = environment.getByKey("connectionstring");
	this.m_username = environment.getByKey("username");
	this.m_password = environment.getByKey("password");
	var process = oFF.DefaultSession.create();
	if (oFF.notNull(process))
	{
		var metadatafile = oFF.XFile.create(process, environment.getByKey("acl"));
		if (oFF.notNull(metadatafile) && metadatafile.isValid())
		{
			var content = metadatafile.load();
			if (oFF.notNull(content))
			{
				this.m_acl = content.getJsonContent();
			}
		}
	}
};

oFF.RawSqlTableSource = function() {};
oFF.RawSqlTableSource.prototype = new oFF.XObject();
oFF.RawSqlTableSource.prototype._ff_c = "RawSqlTableSource";

oFF.RawSqlTableSource.create = function(source)
{
	var obj = new oFF.RawSqlTableSource();
	obj.m_source = source;
	return obj;
};
oFF.RawSqlTableSource.prototype.m_source = null;
oFF.RawSqlTableSource.prototype.toSqlString = function(opts)
{
	return this.m_source;
};
oFF.RawSqlTableSource.prototype.ReplaceTableSource = function(old, replacement)
{
	return this;
};
oFF.RawSqlTableSource.prototype.isEqualTableSource = function(other)
{
	return false;
};

oFF.SqlSelectAlias = function() {};
oFF.SqlSelectAlias.prototype = new oFF.XObject();
oFF.SqlSelectAlias.prototype._ff_c = "SqlSelectAlias";

oFF.SqlSelectAlias.create = function(val, alias)
{
	var ref = new oFF.SqlSelectAlias();
	ref.initialize(val, alias);
	return ref;
};
oFF.SqlSelectAlias.quote = function(val, quote)
{
	return oFF.XStringUtils.concatenate3(quote, oFF.XString.replace(val, quote, oFF.XStringUtils.concatenate2(quote, quote)), quote);
};
oFF.SqlSelectAlias.prototype.m_body = null;
oFF.SqlSelectAlias.prototype.m_alias = null;
oFF.SqlSelectAlias.prototype.initialize = function(body, alias)
{
	if (oFF.isNull(body))
	{
		throw oFF.XException.createIllegalArgumentException("body is null");
	}
	if (oFF.isNull(alias))
	{
		throw oFF.XException.createIllegalArgumentException("alias is null");
	}
	this.m_body = body;
	this.m_alias = alias;
};
oFF.SqlSelectAlias.prototype.toSqlString = function(opts)
{
	var b = oFF.XStringBuffer.create();
	b.append("(");
	b.append(this.m_body.toSqlString(opts));
	b.append(") AS ");
	b.append(oFF.SqlSelectAlias.quote(this.m_alias, opts.referenceQuotes));
	return b.toString();
};
oFF.SqlSelectAlias.prototype.ReplaceTableSource = function(old, replacement)
{
	return this;
};

oFF.SqlSelectAll = function() {};
oFF.SqlSelectAll.prototype = new oFF.XObject();
oFF.SqlSelectAll.prototype._ff_c = "SqlSelectAll";

oFF.SqlSelectAll.prototype.m_tableref = null;
oFF.SqlSelectAll.prototype.setTableReference = function(xref)
{
	this.m_tableref = xref;
	return this;
};
oFF.SqlSelectAll.prototype.toSqlString = function(opts)
{
	return oFF.notNull(this.m_tableref) ? oFF.SqlOperation.format("{0}.*", new oFF.StringListBuilder().init().add(this.m_tableref.toSqlString(opts)).build()) : "*";
};
oFF.SqlSelectAll.prototype.ReplaceTableSource = function(old, replacement)
{
	return this;
};

oFF.SqlTableAlias = function() {};
oFF.SqlTableAlias.prototype = new oFF.XObject();
oFF.SqlTableAlias.prototype._ff_c = "SqlTableAlias";

oFF.SqlTableAlias.create = function(val, alias)
{
	var ref = new oFF.SqlTableAlias();
	ref.initialize(val, alias);
	ref.m_quote = true;
	return ref;
};
oFF.SqlTableAlias.quote = function(val, quote)
{
	return oFF.XStringUtils.concatenate3(quote, oFF.XString.replace(val, quote, oFF.XStringUtils.concatenate2(quote, quote)), quote);
};
oFF.SqlTableAlias.create2 = function(val, alias)
{
	var ref = new oFF.SqlTableAlias();
	ref.initialize(val, alias);
	ref.m_quote = false;
	return ref;
};
oFF.SqlTableAlias.prototype.m_body = null;
oFF.SqlTableAlias.prototype.m_alias = null;
oFF.SqlTableAlias.prototype.m_quote = false;
oFF.SqlTableAlias.prototype.initialize = function(body, alias)
{
	if (oFF.isNull(body))
	{
		throw oFF.XException.createIllegalArgumentException("body is null");
	}
	if (oFF.isNull(alias))
	{
		throw oFF.XException.createIllegalArgumentException("alias is null");
	}
	this.m_body = body;
	this.m_alias = alias;
};
oFF.SqlTableAlias.prototype.toSqlString = function(opts)
{
	var b = oFF.XStringBuffer.create();
	if (this.m_quote)
	{
		b.append("(");
	}
	b.append(this.m_body.toSqlString(opts));
	if (this.m_quote)
	{
		b.append(")");
	}
	b.append(" ");
	b.append(oFF.SqlTableAlias.quote(this.m_alias, opts.referenceQuotes));
	return b.toString();
};
oFF.SqlTableAlias.prototype.ReplaceTableSource = function(old, replacement)
{
	return oFF.SqlTableAlias.create(this.m_body.ReplaceTableSource(old, replacement), this.m_alias);
};
oFF.SqlTableAlias.prototype.isEqualTableSource = function(other)
{
	return false;
};

oFF.SqlNumberToken = function() {};
oFF.SqlNumberToken.prototype = new oFF.SqlToken();
oFF.SqlNumberToken.prototype._ff_c = "SqlNumberToken";

oFF.SqlNumberToken.create = function(token)
{
	var ret = new oFF.SqlNumberToken();
	ret.m_token = token;
	return ret;
};
oFF.SqlNumberToken.prototype.m_token = null;
oFF.SqlNumberToken.prototype.getType = function()
{
	return oFF.SqlTokenType.NUMBER;
};
oFF.SqlNumberToken.prototype.asSqlNumberToken = function()
{
	return this;
};
oFF.SqlNumberToken.prototype.getString = function()
{
	return this.m_token;
};

oFF.SqlOperatorToken = function() {};
oFF.SqlOperatorToken.prototype = new oFF.SqlToken();
oFF.SqlOperatorToken.prototype._ff_c = "SqlOperatorToken";

oFF.SqlOperatorToken.create = function(token)
{
	var ret = new oFF.SqlOperatorToken();
	ret.m_token = token;
	return ret;
};
oFF.SqlOperatorToken.prototype.m_token = null;
oFF.SqlOperatorToken.prototype.getType = function()
{
	return oFF.SqlTokenType.OPERATOR;
};
oFF.SqlOperatorToken.prototype.asSqlOperatorToken = function()
{
	return this;
};
oFF.SqlOperatorToken.prototype.getString = function()
{
	return this.m_token;
};

oFF.SqlPlainToken = function() {};
oFF.SqlPlainToken.prototype = new oFF.SqlToken();
oFF.SqlPlainToken.prototype._ff_c = "SqlPlainToken";

oFF.SqlPlainToken.create = function(token)
{
	var ret = new oFF.SqlPlainToken();
	ret.m_token = token;
	return ret;
};
oFF.SqlPlainToken.prototype.m_token = null;
oFF.SqlPlainToken.prototype.getType = function()
{
	return oFF.SqlTokenType.PLAIN;
};
oFF.SqlPlainToken.prototype.asSqlPlainToken = function()
{
	return this;
};
oFF.SqlPlainToken.prototype.getString = function()
{
	return this.m_token;
};

oFF.SqlReferenceToken = function() {};
oFF.SqlReferenceToken.prototype = new oFF.SqlToken();
oFF.SqlReferenceToken.prototype._ff_c = "SqlReferenceToken";

oFF.SqlReferenceToken.create = function(token)
{
	var ret = new oFF.SqlReferenceToken();
	ret.m_token = token;
	return ret;
};
oFF.SqlReferenceToken.prototype.m_token = null;
oFF.SqlReferenceToken.prototype.getType = function()
{
	return oFF.SqlTokenType.REFERENCE;
};
oFF.SqlReferenceToken.prototype.asSqlReferenceToken = function()
{
	return this;
};
oFF.SqlReferenceToken.prototype.getReference = function()
{
	return this.m_token;
};

oFF.SqlStringToken = function() {};
oFF.SqlStringToken.prototype = new oFF.SqlToken();
oFF.SqlStringToken.prototype._ff_c = "SqlStringToken";

oFF.SqlStringToken.create = function(token)
{
	var ret = new oFF.SqlStringToken();
	ret.m_token = token;
	return ret;
};
oFF.SqlStringToken.prototype.m_token = null;
oFF.SqlStringToken.prototype.getType = function()
{
	return oFF.SqlTokenType.STRING;
};
oFF.SqlStringToken.prototype.asSqlStringToken = function()
{
	return this;
};
oFF.SqlStringToken.prototype.getString = function()
{
	return this.m_token;
};

oFF.SqlQuery = function() {};
oFF.SqlQuery.prototype = new oFF.XObject();
oFF.SqlQuery.prototype._ff_c = "SqlQuery";

oFF.SqlQuery.create = function()
{
	var query = new oFF.SqlQuery();
	query.m_selection = oFF.XList.create();
	query.m_from = oFF.XList.create();
	query.m_groupby = oFF.XList.create();
	query.m_orderby = oFF.XList.create();
	query.m_where = null;
	query.m_having = null;
	query.m_joins = oFF.XList.create();
	query.m_distinct = false;
	query.m_limit = -1;
	query.m_offset = 0;
	return query;
};
oFF.SqlQuery.prototype.m_selection = null;
oFF.SqlQuery.prototype.m_from = null;
oFF.SqlQuery.prototype.m_groupby = null;
oFF.SqlQuery.prototype.m_where = null;
oFF.SqlQuery.prototype.m_having = null;
oFF.SqlQuery.prototype.m_joins = null;
oFF.SqlQuery.prototype.m_orderby = null;
oFF.SqlQuery.prototype.m_distinct = false;
oFF.SqlQuery.prototype.m_offset = 0;
oFF.SqlQuery.prototype.m_limit = 0;
oFF.SqlQuery.prototype.setDistinct = function(dis)
{
	this.m_distinct = dis;
	return this;
};
oFF.SqlQuery.prototype.select = function(column)
{
	if (oFF.isNull(column))
	{
		throw oFF.XException.createIllegalArgumentException("column == null");
	}
	this.getSelection().add(column);
	return this;
};
oFF.SqlQuery.prototype.from = function(table)
{
	this.m_from.add(table);
	return this;
};
oFF.SqlQuery.prototype.groupBy = function(sqlTableColumnRef)
{
	this.m_groupby.add(sqlTableColumnRef);
	return this;
};
oFF.SqlQuery.prototype.orderBy = function(sqlTableColumnRef, descending)
{
	this.m_orderby.add(oFF.XPair.create(sqlTableColumnRef, oFF.XBooleanValue.create(descending)));
	return this;
};
oFF.SqlQuery.prototype.limit = function(offset, limit)
{
	this.m_offset = offset;
	this.m_limit = limit;
	return this;
};
oFF.SqlQuery.prototype.where = function(where)
{
	this.m_where = where;
	return this;
};
oFF.SqlQuery.prototype.having = function(having)
{
	this.m_having = having;
	return this;
};
oFF.SqlQuery.prototype.innerJoin = function(table)
{
	var join = oFF.SqlJoin.create("inner join", table);
	this.m_joins.add(join);
	return join;
};
oFF.SqlQuery.prototype.leftJoin = function(table)
{
	var join = oFF.SqlJoin.create("left join", table);
	this.m_joins.add(join);
	return join;
};
oFF.SqlQuery.prototype.rightJoin = function(table)
{
	var join = oFF.SqlJoin.create("right join", table);
	this.m_joins.add(join);
	return join;
};
oFF.SqlQuery.prototype.toSqlString = function(opts)
{
	var uselimit = this.m_orderby.size() > 0 && this.m_limit !== -1;
	var buf = oFF.XStringBuffer.create();
	var salt = oFF.XMath.random(4096);
	if (uselimit)
	{
		buf.append("select * from (");
	}
	buf.append("select");
	buf.append(" ");
	if (this.m_distinct)
	{
		buf.append("distinct");
		buf.append(" ");
	}
	var i;
	for (i = 0; i < this.getSelection().size(); ++i)
	{
		if (i !== 0)
		{
			buf.append(", ");
		}
		buf.append(this.getSelection().get(i).toSqlString(opts));
	}
	if (uselimit)
	{
		buf.append(", ROW_NUMBER() over (");
		this.appendOrderBy(opts, buf);
		buf.append(") as ROW_");
		buf.appendInt(salt);
	}
	buf.append(" ");
	buf.append("from");
	buf.append(" ");
	while (this.m_from.size() > 1 && this.m_joins.size() > 0)
	{
		var name = this.m_from.removeAt(1);
		this.m_joins.insert(0, oFF.SqlJoin.create("cross join", name));
	}
	for (i = 0; i < this.m_from.size(); ++i)
	{
		if (i !== 0)
		{
			buf.append(", ");
		}
		buf.append(this.m_from.get(i).toSqlString(opts));
	}
	for (i = 0; i < this.m_joins.size(); ++i)
	{
		buf.append(" ");
		buf.append(this.m_joins.get(i).toSqlString(opts));
	}
	if (oFF.notNull(this.m_where))
	{
		buf.append(" where ");
		buf.append(this.m_where);
	}
	if (this.m_groupby.size() > 0)
	{
		buf.append(" group by ");
		for (i = 0; i < this.m_groupby.size(); ++i)
		{
			if (i !== 0)
			{
				buf.append(", ");
			}
			buf.append(this.m_groupby.get(i).toSqlString(opts));
		}
		if (oFF.notNull(this.m_having))
		{
			buf.append(" having ");
			buf.append(this.m_having);
		}
	}
	if (this.m_orderby.size() > 0 && !uselimit)
	{
		buf.append(" ");
		this.appendOrderBy(opts, buf);
	}
	if (uselimit)
	{
		buf.append(") T where T.ROW_");
		buf.appendInt(salt);
		buf.append(" <= ");
		buf.appendInt(this.m_offset + this.m_limit);
		buf.append(" AND T.ROW_");
		buf.appendInt(salt);
		buf.append(" > ");
		buf.appendInt(this.m_offset);
		buf.append(" order by T.ROW_");
		buf.appendInt(salt);
	}
	var ret = buf.toString();
	oFF.XObjectExt.release(buf);
	return ret;
};
oFF.SqlQuery.prototype.appendOrderBy = function(opts, buf)
{
	var i;
	buf.append("order by ");
	for (i = 0; i < this.m_orderby.size(); ++i)
	{
		if (i !== 0)
		{
			buf.append(", ");
		}
		buf.append(this.m_orderby.get(i).getFirstObject().toSqlString(opts));
		buf.append(" ");
		if (this.m_orderby.get(i).getSecondObject().getBoolean())
		{
			buf.append("desc");
		}
		else
		{
			buf.append("asc");
		}
	}
};
oFF.SqlQuery.prototype.cloneQuery = function()
{
	var query = new oFF.SqlQuery();
	query.m_selection = this.getSelection().createListCopy();
	query.m_from = this.m_from.createListCopy();
	query.m_orderby = this.m_orderby.createListCopy();
	query.m_groupby = this.m_groupby.createListCopy();
	query.m_where = this.m_where;
	query.m_having = this.m_having;
	query.m_joins = this.m_joins.createListCopy();
	query.m_distinct = this.m_distinct;
	return query;
};
oFF.SqlQuery.prototype.releaseObject = function()
{
	oFF.XObjectExt.release(this.getSelection());
	oFF.XObjectExt.release(this.m_from);
	oFF.XObjectExt.release(this.m_groupby);
	oFF.XObjectExt.release(this.m_joins);
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.SqlQuery.prototype.selectAll = function()
{
	return this.select(new oFF.SqlSelectAll());
};
oFF.SqlQuery.prototype.ReplaceTableSource = function(old, replacement)
{
	var clone = this.cloneQuery();
	for (var i = 0; i < this.m_from.size(); ++i)
	{
		if (this.m_from.get(i).isEqualTableSource(old))
		{
			var opts = new oFF.SqlCodeGenOptions();
			opts.noQuote = true;
			clone.m_from.set(i, oFF.SqlTableAlias.create(replacement, old.toSqlString(opts)));
		}
		else
		{
			clone.m_from.set(i, clone.m_from.get(i).ReplaceTableSource(old, replacement));
		}
	}
	return clone;
};
oFF.SqlQuery.prototype.isEqualTableSource = function(other)
{
	return false;
};
oFF.SqlQuery.prototype.getSelection = function()
{
	return this.m_selection;
};

oFF.SqlUnion = function() {};
oFF.SqlUnion.prototype = new oFF.XObject();
oFF.SqlUnion.prototype._ff_c = "SqlUnion";

oFF.SqlUnion.create = function(first, second)
{
	var un = new oFF.SqlUnion();
	un.queries = oFF.XList.create();
	un.queries.add(first);
	un.queries.add(second);
	return un;
};
oFF.SqlUnion.prototype.queries = null;
oFF.SqlUnion.prototype.unionWith = function(other)
{
	this.queries.add(other);
	return this;
};
oFF.SqlUnion.prototype.toSqlString = function(opts)
{
	var ret = oFF.XStringBuffer.create();
	ret.append(this.queries.get(0).toSqlString(opts));
	for (var i = 1, size = this.queries.size(); i < size; i++)
	{
		ret.append(" UNION ");
		ret.append(this.queries.get(i).toSqlString(opts));
	}
	return ret.toString();
};
oFF.SqlUnion.prototype.ReplaceTableSource = function(old, replacement)
{
	var un = new oFF.SqlUnion();
	un.queries = oFF.XList.create();
	for (var i = 0, size = this.queries.size(); i < size; i++)
	{
		un.unionWith(this.queries.get(i).ReplaceTableSource(old, replacement));
	}
	return un;
};
oFF.SqlUnion.prototype.isEqualTableSource = function(other)
{
	return false;
};

oFF.SqlWindowFunction = function() {};
oFF.SqlWindowFunction.prototype = new oFF.XObject();
oFF.SqlWindowFunction.prototype._ff_c = "SqlWindowFunction";

oFF.SqlWindowFunction.prototype.toSqlString = function(opts)
{
	return "sum()";
};
oFF.SqlWindowFunction.prototype.ReplaceTableSource = function(old, replacement)
{
	return this;
};

oFF.SqlWith = function() {};
oFF.SqlWith.prototype = new oFF.XObject();
oFF.SqlWith.prototype._ff_c = "SqlWith";

oFF.SqlWith.create = function()
{
	var sql = new oFF.SqlWith();
	sql.m_localVars = oFF.XList.create();
	return sql;
};
oFF.SqlWith.prototype.m_localVars = null;
oFF.SqlWith.prototype.m_body = null;
oFF.SqlWith.prototype.addDependency = function(name, subquery)
{
	this.m_localVars.add(oFF.XPair.create(oFF.XStringValue.create(name), subquery));
};
oFF.SqlWith.prototype.setBody = function(subquery)
{
	this.m_body = subquery;
};
oFF.SqlWith.prototype.toSqlString = function(opts)
{
	if (oFF.isNull(this.m_body))
	{
		throw oFF.XException.createIllegalArgumentException("you have to set the body to get a String");
	}
	var ret = oFF.XStringBuffer.create();
	if (opts.hasWith)
	{
		ret.append("with ");
		for (var q = 0, sizeq = this.m_localVars.size(); q < sizeq; ++q)
		{
			if (q !== 0)
			{
				ret.append(", ");
			}
			ret.append(oFF.SqlReference.create(this.m_localVars.get(q).getFirstObject().getString()).toSqlString(opts));
			ret.append(" as (");
			ret.append(this.m_localVars.get(q).getSecondObject().toSqlString(opts));
			ret.append(")");
		}
		ret.append(" ");
		ret.append(this.m_body.toSqlString(opts));
	}
	else if (opts.hasSubqueries)
	{
		var query = this.m_body;
		for (var s = 0, sizer = this.m_localVars.size(); s < sizer; ++s)
		{
			for (var r = 0; r < sizer; ++r)
			{
				query = query.ReplaceTableSource(oFF.SqlReference.create(this.m_localVars.get(r).getFirstObject().getString()), this.m_localVars.get(r).getSecondObject());
			}
		}
		ret.append(query.toSqlString(opts));
	}
	else
	{
		throw oFF.XException.createRuntimeException("Not implemented yet");
	}
	return ret.toString();
};
oFF.SqlWith.prototype.ReplaceTableSource = function(old, replacement)
{
	var opts = new oFF.SqlCodeGenOptions();
	opts.noQuote = true;
	var toReplace = old.toSqlString(opts);
	var i;
	for (i = 0; i < this.m_localVars.size(); i++)
	{
		if (oFF.XString.isEqual(toReplace, this.m_localVars.get(i).getFirstObject().getString()))
		{
			return this;
		}
	}
	var sql = new oFF.SqlWith();
	sql.m_localVars = oFF.XList.create();
	sql.m_body = this.m_body;
	for (i = 0; i < this.m_localVars.size(); i++)
	{
		sql.m_localVars.add(oFF.XPair.create(this.m_localVars.get(i).getFirstObject(), this.m_localVars.get(i).getSecondObject().ReplaceTableSource(old, replacement)));
		sql.m_body = sql.m_body.ReplaceTableSource(old, replacement);
	}
	return sql;
};
oFF.SqlWith.prototype.isEqualTableSource = function(other)
{
	return false;
};

oFF.RawSqlConstant = function() {};
oFF.RawSqlConstant.prototype = new oFF.XObject();
oFF.RawSqlConstant.prototype._ff_c = "RawSqlConstant";

oFF.RawSqlConstant.create = function(source)
{
	var obj = new oFF.RawSqlConstant();
	obj.m_source = source;
	return obj;
};
oFF.RawSqlConstant.prototype.m_source = null;
oFF.RawSqlConstant.prototype.toSqlString = function(opts)
{
	return this.m_source;
};
oFF.RawSqlConstant.prototype.ReplaceTableSource = function(old, replacement)
{
	return this;
};

oFF.SqlAggregateFunction = function() {};
oFF.SqlAggregateFunction.prototype = new oFF.XObject();
oFF.SqlAggregateFunction.prototype._ff_c = "SqlAggregateFunction";

oFF.SqlAggregateFunction.create = function(name, over)
{
	var fun = new oFF.SqlAggregateFunction();
	fun.m_over = over;
	fun.m_name = name;
	return fun;
};
oFF.SqlAggregateFunction.prototype.m_over = null;
oFF.SqlAggregateFunction.prototype.m_name = null;
oFF.SqlAggregateFunction.prototype.toSqlString = function(opts)
{
	return oFF.XStringUtils.concatenate4(this.m_name, "(", this.m_over.toSqlString(opts), ")");
};
oFF.SqlAggregateFunction.prototype.ReplaceTableSource = function(old, replacement)
{
	return this;
};

oFF.SqlCast = function() {};
oFF.SqlCast.prototype = new oFF.XObject();
oFF.SqlCast.prototype._ff_c = "SqlCast";

oFF.SqlCast.create = function(c, type)
{
	var obj = new oFF.SqlCast();
	obj.m_constant = c;
	obj.m_type = type;
	return obj;
};
oFF.SqlCast.prototype.m_constant = null;
oFF.SqlCast.prototype.m_type = null;
oFF.SqlCast.prototype.toSqlString = function(opts)
{
	return oFF.SqlOperation.format("CAST ( {0} AS {1} )", oFF.StringListBuilder.create().add(this.m_constant.toSqlString(opts)).add(this.m_type).build());
};
oFF.SqlCast.prototype.ReplaceTableSource = function(old, replacement)
{
	this.m_constant = this.m_constant.ReplaceTableSource(old, replacement);
	return this;
};

oFF.SqlDoubleConstant = function() {};
oFF.SqlDoubleConstant.prototype = new oFF.XObject();
oFF.SqlDoubleConstant.prototype._ff_c = "SqlDoubleConstant";

oFF.SqlDoubleConstant.create = function(value)
{
	var c = new oFF.SqlDoubleConstant();
	c.m_value = value;
	return c;
};
oFF.SqlDoubleConstant.prototype.m_value = 0.0;
oFF.SqlDoubleConstant.prototype.toSqlString = function(opts)
{
	return oFF.XDouble.convertToString(this.m_value);
};
oFF.SqlDoubleConstant.prototype.ReplaceTableSource = function(old, replacement)
{
	return this;
};

oFF.SqlIntegerConstant = function() {};
oFF.SqlIntegerConstant.prototype = new oFF.XObject();
oFF.SqlIntegerConstant.prototype._ff_c = "SqlIntegerConstant";

oFF.SqlIntegerConstant.create = function(value)
{
	var c = new oFF.SqlIntegerConstant();
	c.m_value = value;
	return c;
};
oFF.SqlIntegerConstant.prototype.m_value = 0;
oFF.SqlIntegerConstant.prototype.toSqlString = function(opts)
{
	return oFF.XLong.convertToString(this.m_value);
};
oFF.SqlIntegerConstant.prototype.ReplaceTableSource = function(old, replacement)
{
	return this;
};

oFF.SqlReference = function() {};
oFF.SqlReference.prototype = new oFF.XObject();
oFF.SqlReference.prototype._ff_c = "SqlReference";

oFF.SqlReference.create3 = function(a, b, c)
{
	var ref = new oFF.SqlReference();
	ref.initialize(a, b, c);
	return ref;
};
oFF.SqlReference.create2 = function(a, b)
{
	var ref = new oFF.SqlReference();
	ref.initialize(null, a, b);
	return ref;
};
oFF.SqlReference.create = function(a)
{
	var ref = new oFF.SqlReference();
	ref.initialize(null, null, a);
	return ref;
};
oFF.SqlReference.quote = function(val, quote)
{
	return oFF.XStringUtils.concatenate3(quote, oFF.XString.replace(val, quote, oFF.XStringUtils.concatenate2(quote, quote)), quote);
};
oFF.SqlReference.prototype.m_components = null;
oFF.SqlReference.prototype.getComponents = function()
{
	return this.m_components;
};
oFF.SqlReference.prototype.initialize = function(a, b, c)
{
	this.m_components = oFF.XListOfString.create();
	if (oFF.notNull(a))
	{
		this.m_components.add(a);
	}
	if (oFF.notNull(b))
	{
		this.m_components.add(b);
	}
	if (oFF.notNull(c))
	{
		this.m_components.add(c);
	}
};
oFF.SqlReference.prototype.toSqlString = function(opts)
{
	var b = oFF.XStringBuffer.create();
	if (this.m_components.size() === 1 && opts.noQuote)
	{
		b.append(this.m_components.get(0));
	}
	else
	{
		for (var i = 0, size = this.m_components.size(); i < size; i++)
		{
			if (i !== 0)
			{
				b.append(".");
			}
			b.append(oFF.SqlReference.quote(this.m_components.get(i), opts.referenceQuotes));
		}
	}
	return b.toString();
};
oFF.SqlReference.prototype.ReplaceTableSource = function(old, replacement)
{
	return this;
};
oFF.SqlReference.prototype.isEqualTableSource = function(other)
{
	return oFF.XString.isEqual(this.toSqlString(new oFF.SqlCodeGenOptions()), other.toSqlString(new oFF.SqlCodeGenOptions()));
};

oFF.SqlStringConstant = function() {};
oFF.SqlStringConstant.prototype = new oFF.XObject();
oFF.SqlStringConstant.prototype._ff_c = "SqlStringConstant";

oFF.SqlStringConstant.create = function(string)
{
	if (oFF.isNull(string))
	{
		throw oFF.XException.createIllegalArgumentException("string of StringConstat is null");
	}
	var val = new oFF.SqlStringConstant();
	val.m_string = string;
	return val;
};
oFF.SqlStringConstant.quote = function(val, quote)
{
	return oFF.XStringUtils.concatenate3(quote, oFF.XString.replace(val, quote, oFF.XStringUtils.concatenate2(quote, quote)), quote);
};
oFF.SqlStringConstant.prototype.m_string = null;
oFF.SqlStringConstant.prototype.toSqlString = function(opts)
{
	return oFF.SqlStringConstant.quote(this.m_string, opts.stringQuotes);
};
oFF.SqlStringConstant.prototype.ReplaceTableSource = function(old, replacement)
{
	return this;
};

oFF.RpcSqlDriver = function() {};
oFF.RpcSqlDriver.prototype = new oFF.MessageManager();
oFF.RpcSqlDriver.prototype._ff_c = "RpcSqlDriver";

oFF.RpcSqlDriver.create = function(driverName, app, systemAlias)
{
	var newObj = new oFF.RpcSqlDriver();
	newObj.setupDriver(app.getConnectionPool(), systemAlias);
	return newObj;
};
oFF.RpcSqlDriver.create2 = function(driverName, pool, systemAlias)
{
	var newObj = new oFF.RpcSqlDriver();
	newObj.setupDriver(pool, systemAlias);
	return newObj;
};
oFF.RpcSqlDriver.prototype.m_connectionUri = null;
oFF.RpcSqlDriver.prototype.m_connection = null;
oFF.RpcSqlDriver.prototype.m_pool = null;
oFF.RpcSqlDriver.prototype.m_systemAlias = null;
oFF.RpcSqlDriver.prototype.setupDriver = function(pool, systemAlias)
{
	this.m_pool = pool;
	this.m_systemAlias = systemAlias;
	this.setupSessionContext(null);
};
oFF.RpcSqlDriver.prototype.open = function(uri)
{
	this.m_connection = this.m_pool.getConnection(this.m_systemAlias);
	var serverMetadata = this.m_connection.getServerMetadata();
	if (oFF.isNull(serverMetadata))
	{
		this.addError(9, "Failed to connect to server, missing Server Metadata");
		return;
	}
	if (!serverMetadata.supportsCapability(oFF.ServerService.ANALYTIC, "BasicSql"))
	{
		this.addError(10, "Server doesn't support BasicSql");
		return;
	}
};
oFF.RpcSqlDriver.prototype.openExt = function(url, user, pwd)
{
	this.open(oFF.XUri.createFromUrl(url));
};
oFF.RpcSqlDriver.prototype.close = function() {};
oFF.RpcSqlDriver.prototype.executeUpdate = function(sql)
{
	var st = oFF.PrFactory.createStructure();
	st.putString("type", "update");
	st.putString("sql", sql);
	var rpc = this.m_connection.newRpcFunction("/BasicSql");
	rpc.getRpcRequest().setMethod(oFF.HttpRequestMethod.HTTP_POST);
	rpc.getRpcRequest().setRequestStructure(st);
	rpc.processFunctionExecution(oFF.SyncType.BLOCKING, null, null);
	this.addAllMessages(rpc);
	return 0;
};
oFF.RpcSqlDriver.prototype.processExecuteUpdate = function(syncType, listener, customIdentifier, sql)
{
	return oFF.RpcSqlUpdateAction.createAndRun(this, this.m_connection, syncType, listener, customIdentifier, this.getSession(), sql);
};
oFF.RpcSqlDriver.prototype.executeQuery = function(sql)
{
	var st = oFF.PrFactory.createStructure();
	st.putString("type", "query");
	st.putString("sql", sql);
	var rpc = this.m_connection.newRpcFunction("/BasicSql");
	rpc.getRpcRequest().setMethod(oFF.HttpRequestMethod.HTTP_POST);
	rpc.getRpcRequest().setRequestStructure(st);
	rpc.processFunctionExecution(oFF.SyncType.BLOCKING, null, null);
	this.addAllMessages(rpc);
	var rlist = oFF.PrFactory.createList();
	rlist.add(rpc.getRpcResponse().getRootElement());
	return oFF.SqlJsonResultSet.create(rlist);
};
oFF.RpcSqlDriver.prototype.processExecuteQuery = function(syncType, listener, customIdentifier, sql)
{
	return oFF.RpcSqlQueryAction.createAndRun(this, this.m_connection, syncType, listener, customIdentifier, this.getSession(), sql);
};
oFF.RpcSqlDriver.prototype.getConnection = function()
{
	return this.m_connectionUri;
};
oFF.RpcSqlDriver.prototype.processOpen = function(syncType, listener, customIdentifier, uri)
{
	this.open(uri);
	return oFF.RpcSqlOpenAction.createAndRun(this, syncType, listener, customIdentifier, this.getSession());
};
oFF.RpcSqlDriver.prototype.processOpenExt = function(syncType, listener, customIdentifier, url, user, pwd)
{
	this.openExt(url, user, pwd);
	return oFF.RpcSqlOpenAction.createAndRun(this, syncType, listener, customIdentifier, this.getSession());
};
oFF.RpcSqlDriver.prototype.processGetSchemas = function(syncType, listener, customIdentifier)
{
	var serverMetadata = this.m_connection.getServerMetadata();
	if (oFF.isNull(serverMetadata))
	{
		this.addError(9, "Failed to connect to server, missing Server Metadata");
		return oFF.SqlSynchroniousQueryAction.createAndRun(null, syncType, listener, customIdentifier, this.getSession());
	}
	if (!serverMetadata.supportsCapability(oFF.ServerService.ANALYTIC, "BasicSqlMetaData"))
	{
		this.addError(10, "Server doesn't support BasicSqlMetaData");
		return oFF.SqlSynchroniousQueryAction.createAndRun(null, syncType, listener, customIdentifier, this.getSession());
	}
	return oFF.RpcSqlQueryAction.createAndRunSpecial(this, this.m_connection, syncType, listener, customIdentifier, this.getSession(), "/GetSchemas", oFF.PrFactory.createStructure());
};
oFF.RpcSqlDriver.prototype.processGetTables = function(syncType, listener, customIdentifier, catalog, schemaNamePattern, tableNamePattern)
{
	var serverMetadata = this.m_connection.getServerMetadata();
	if (oFF.isNull(serverMetadata))
	{
		this.addError(9, "Failed to connect to server, missing Server Metadata");
		return oFF.SqlSynchroniousQueryAction.createAndRun(null, syncType, listener, customIdentifier, this.getSession());
	}
	if (!serverMetadata.supportsCapability(oFF.ServerService.ANALYTIC, "BasicSqlMetaData"))
	{
		this.addError(10, "Server doesn't support BasicSqlMetaData");
		return oFF.SqlSynchroniousQueryAction.createAndRun(null, syncType, listener, customIdentifier, this.getSession());
	}
	var st = oFF.PrFactory.createStructure();
	st.putString("catalog", catalog);
	st.putString("schemaNamePattern", schemaNamePattern);
	st.putString("tableNamePattern", tableNamePattern);
	return oFF.RpcSqlQueryAction.createAndRunSpecial(this, this.m_connection, syncType, listener, customIdentifier, this.getSession(), "/GetTables", st);
};
oFF.RpcSqlDriver.prototype.processGetColumns = function(syncType, listener, customIdentifier, catalog, schemaNamePattern, tableNamePattern, columnNamePattern)
{
	var serverMetadata = this.m_connection.getServerMetadata();
	if (oFF.isNull(serverMetadata))
	{
		this.addError(9, "Failed to connect to server, missing Server Metadata");
		return oFF.SqlSynchroniousQueryAction.createAndRun(null, syncType, listener, customIdentifier, this.getSession());
	}
	if (!serverMetadata.supportsCapability(oFF.ServerService.ANALYTIC, "BasicSqlMetaData"))
	{
		this.addError(10, "Server doesn't support BasicSqlMetaData");
		return oFF.SqlSynchroniousQueryAction.createAndRun(null, syncType, listener, customIdentifier, this.getSession());
	}
	var st = oFF.PrFactory.createStructure();
	st.putString("catalog", catalog);
	st.putString("schemaNamePattern", schemaNamePattern);
	st.putString("tableNamePattern", tableNamePattern);
	st.putString("columnNamePattern", columnNamePattern);
	return oFF.RpcSqlQueryAction.createAndRunSpecial(this, this.m_connection, syncType, listener, customIdentifier, this.getSession(), "/GetColumns", st);
};
oFF.RpcSqlDriver.prototype.processGetImportedKeys = function(syncType, listener, customIdentifier, catalog, schema, table)
{
	var serverMetadata = this.m_connection.getServerMetadata();
	if (oFF.isNull(serverMetadata))
	{
		this.addError(9, "Failed to connect to server, missing Server Metadata");
		return oFF.SqlSynchroniousQueryAction.createAndRun(null, syncType, listener, customIdentifier, this.getSession());
	}
	if (!serverMetadata.supportsCapability(oFF.ServerService.ANALYTIC, "BasicSqlMetaData"))
	{
		this.addError(10, "Server doesn't support BasicSqlMetaData");
		return oFF.SqlSynchroniousQueryAction.createAndRun(null, syncType, listener, customIdentifier, this.getSession());
	}
	var st = oFF.PrFactory.createStructure();
	st.putString("catalog", catalog);
	st.putString("schema", schema);
	st.putString("table", table);
	return oFF.RpcSqlQueryAction.createAndRunSpecial(this, this.m_connection, syncType, listener, customIdentifier, this.getSession(), "/GetImportedKeys", st);
};

oFF.SqlTokenType = function() {};
oFF.SqlTokenType.prototype = new oFF.XConstant();
oFF.SqlTokenType.prototype._ff_c = "SqlTokenType";

oFF.SqlTokenType.PLAIN = null;
oFF.SqlTokenType.REFERENCE = null;
oFF.SqlTokenType.STRING = null;
oFF.SqlTokenType.NUMBER = null;
oFF.SqlTokenType.OPERATOR = null;
oFF.SqlTokenType.staticSetup = function()
{
	oFF.SqlTokenType.PLAIN = oFF.SqlTokenType.create("PLAIN");
	oFF.SqlTokenType.REFERENCE = oFF.SqlTokenType.create("REFERENCE");
	oFF.SqlTokenType.STRING = oFF.SqlTokenType.create("STRING");
	oFF.SqlTokenType.NUMBER = oFF.SqlTokenType.create("NUMBER");
	oFF.SqlTokenType.OPERATOR = oFF.SqlTokenType.create("OPERATOR");
};
oFF.SqlTokenType.create = function(name)
{
	return oFF.XConstant.setupName(new oFF.SqlTokenType(), name);
};

oFF.RpcSqlOpenAction = function() {};
oFF.RpcSqlOpenAction.prototype = new oFF.SyncAction();
oFF.RpcSqlOpenAction.prototype._ff_c = "RpcSqlOpenAction";

oFF.RpcSqlOpenAction.createAndRun = function(driver, syncType, listener, customIdentifier, context)
{
	var obj = new oFF.RpcSqlOpenAction();
	obj.m_driver = driver;
	obj.setupActionAndRun(syncType, listener, customIdentifier, context);
	return obj;
};
oFF.RpcSqlOpenAction.prototype.m_driver = null;
oFF.RpcSqlOpenAction.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onOpened(extResult, data, customIdentifier);
};
oFF.RpcSqlOpenAction.prototype.processSynchronization = function(syncType)
{
	this.setData(this.m_driver);
	return false;
};

oFF.RpcSqlQuery = function() {};
oFF.RpcSqlQuery.prototype = new oFF.SyncAction();
oFF.RpcSqlQuery.prototype._ff_c = "RpcSqlQuery";

oFF.RpcSqlQuery.createAndRun = function(driver, syncType, listener, customIdentifier, context)
{
	var obj = new oFF.RpcSqlQuery();
	obj.m_driver = driver;
	obj.setupActionAndRun(syncType, listener, customIdentifier, context);
	return obj;
};
oFF.RpcSqlQuery.prototype.m_driver = null;
oFF.RpcSqlQuery.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onQueryResult(extResult, data, customIdentifier);
};
oFF.RpcSqlQuery.prototype.processSynchronization = function(syncType)
{
	this.m_driver.addInfo(0, "");
	this.setData(null);
	return false;
};

oFF.RpcSqlQueryAction = function() {};
oFF.RpcSqlQueryAction.prototype = new oFF.SyncAction();
oFF.RpcSqlQueryAction.prototype._ff_c = "RpcSqlQueryAction";

oFF.RpcSqlQueryAction.createAndRun = function(driver, con, syncType, listener, customIdentifier, context, sql)
{
	var st = oFF.PrFactory.createStructure();
	st.putString("type", "query");
	st.putString("sql", sql);
	return oFF.RpcSqlQueryAction.createAndRunSpecial(driver, con, syncType, listener, customIdentifier, context, "/BasicSql", st);
};
oFF.RpcSqlQueryAction.createAndRunSpecial = function(driver, con, syncType, listener, customIdentifier, context, endpoint, st)
{
	var obj = new oFF.RpcSqlQueryAction();
	obj.m_driver = driver;
	if (oFF.isNull(con))
	{
		driver.addError(2, "Not Connected!");
		obj.m_rpc = null;
	}
	else
	{
		var rpc = con.newRpcFunction(endpoint);
		rpc.getRpcRequest().setMethod(oFF.HttpRequestMethod.HTTP_POST);
		rpc.getRpcRequest().setRequestStructure(st);
		obj.m_rpc = rpc;
	}
	obj.setupActionAndRun(syncType, listener, customIdentifier, context);
	return obj;
};
oFF.RpcSqlQueryAction.prototype.m_driver = null;
oFF.RpcSqlQueryAction.prototype.m_rpc = null;
oFF.RpcSqlQueryAction.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onQueryResult(extResult, data, customIdentifier);
};
oFF.RpcSqlQueryAction.prototype.processSynchronization = function(syncType)
{
	if (oFF.isNull(this.m_rpc))
	{
		return false;
	}
	this.m_rpc.processFunctionExecution(syncType, this, null);
	return true;
};
oFF.RpcSqlQueryAction.prototype.onFunctionExecuted = function(extResult, response, customIdentifier)
{
	this.m_driver.addAllMessages(this.m_rpc);
	if (this.m_rpc.isValid() && this.m_rpc.getServerStatusCode() === 200)
	{
		var errors = oFF.RpcSqlInaUtil.getErrors(this.m_rpc.getRpcResponse().getRootElement());
		if (errors.size() > 0)
		{
			for (var i = 0, size = errors.size(); i < size; i++)
			{
				this.m_driver.addMessage(errors.get(i));
			}
		}
		else
		{
			var rlist = oFF.PrFactory.createList();
			rlist.add(this.m_rpc.getRpcResponse().getRootElement());
			this.setData(oFF.SqlJsonResultSet.create(rlist));
		}
	}
	else
	{
		this.m_driver.addError(2, "Failed to execute Query");
		this.setData(null);
	}
	this.endSync();
};

oFF.RpcSqlUpdateAction = function() {};
oFF.RpcSqlUpdateAction.prototype = new oFF.SyncAction();
oFF.RpcSqlUpdateAction.prototype._ff_c = "RpcSqlUpdateAction";

oFF.RpcSqlUpdateAction.createAndRun = function(driver, con, syncType, listener, customIdentifier, context, sql)
{
	var obj = new oFF.RpcSqlUpdateAction();
	obj.m_driver = driver;
	if (oFF.isNull(con))
	{
		driver.addError(2, "Not Connected!");
		obj.m_rpc = null;
	}
	else
	{
		var st = oFF.PrFactory.createStructure();
		st.putString("type", "update");
		st.putString("sql", sql);
		var rpc = con.newRpcFunction("/BasicSql");
		rpc.getRpcRequest().setMethod(oFF.HttpRequestMethod.HTTP_POST);
		rpc.getRpcRequest().setRequestStructure(st);
		obj.m_rpc = rpc;
	}
	obj.setupActionAndRun(syncType, listener, customIdentifier, context);
	return obj;
};
oFF.RpcSqlUpdateAction.prototype.m_driver = null;
oFF.RpcSqlUpdateAction.prototype.m_rpc = null;
oFF.RpcSqlUpdateAction.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onUpdated(extResult, data, customIdentifier);
};
oFF.RpcSqlUpdateAction.prototype.processSynchronization = function(syncType)
{
	if (oFF.isNull(this.m_rpc))
	{
		return false;
	}
	this.m_rpc.processFunctionExecution(syncType, this, null);
	return true;
};
oFF.RpcSqlUpdateAction.prototype.onFunctionExecuted = function(extResult, response, customIdentifier)
{
	this.m_driver.addAllMessages(this.m_rpc);
	if (this.m_rpc.isValid() && this.m_rpc.getServerStatusCode() >= 200 && this.m_rpc.getServerStatusCode() < 300)
	{
		var errors = oFF.RpcSqlInaUtil.getErrors(this.m_rpc.getRpcResponse().getRootElement());
		if (errors.size() > 0)
		{
			for (var i = 0, size = errors.size(); i < size; i++)
			{
				this.m_driver.addMessage(errors.get(i));
			}
			this.setData(oFF.XIntegerValue.create(1));
		}
		else
		{
			this.setData(oFF.XIntegerValue.create(0));
		}
	}
	else
	{
		this.m_driver.addError(2, "Failed to execute Update");
		this.setData(oFF.XIntegerValue.create(1));
	}
	this.endSync();
};

oFF.SqlModule = function() {};
oFF.SqlModule.prototype = new oFF.DfModule();
oFF.SqlModule.prototype._ff_c = "SqlModule";

oFF.SqlModule.s_module = null;
oFF.SqlModule.getInstance = function()
{
	if (oFF.isNull(oFF.SqlModule.s_module))
	{
		oFF.DfModule.checkInitialized(oFF.RuntimeModule.getInstance());
		oFF.SqlModule.s_module = oFF.DfModule.startExt(new oFF.SqlModule());
		oFF.SqlTokenType.staticSetup();
		oFF.RpcSqlDriverFactory.staticSetup();
		oFF.DfModule.stopExt(oFF.SqlModule.s_module);
	}
	return oFF.SqlModule.s_module;
};
oFF.SqlModule.prototype.getName = function()
{
	return "ff3500.sql";
};

oFF.SqlModule.getInstance();

return sap.firefly;
	} );