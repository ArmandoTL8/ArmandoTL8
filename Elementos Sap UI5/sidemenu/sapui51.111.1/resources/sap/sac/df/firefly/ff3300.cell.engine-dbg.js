/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
[
"sap/sac/df/firefly/ff2220.ui.tools","sap/sac/df/firefly/ff2600.visualization.abstract"
],
function(oFF)
{
"use strict";

oFF.XCellEngineParser = function() {};
oFF.XCellEngineParser.prototype = new oFF.XObject();
oFF.XCellEngineParser.prototype._ff_c = "XCellEngineParser";

oFF.XCellEngineParser.create = function()
{
	var instance = new oFF.XCellEngineParser();
	return instance;
};
oFF.XCellEngineParser.prototype.m_lookahead = null;
oFF.XCellEngineParser.prototype.m_tokenizer = null;
oFF.XCellEngineParser.prototype.parse = function(inputString)
{
	this.m_tokenizer = oFF.XCellEngineTokenizer.create(inputString);
	this.m_lookahead = this.m_tokenizer.getNextToken();
	if (oFF.isNull(this.m_lookahead))
	{
		return oFF.XCellEngineParserLiteral.create(oFF.XStringValue.create(""));
	}
	return this.expression();
};
oFF.XCellEngineParser.prototype.integerLiteral = function()
{
	var token = this.consume(oFF.XTokenTypes.INTEGER);
	return oFF.XCellEngineParserLiteral.create(oFF.XIntegerValue.create(oFF.XInteger.convertFromString(token.getValue())));
};
oFF.XCellEngineParser.prototype.doubleLiteral = function()
{
	var token = this.consume(oFF.XTokenTypes.DOUBLE);
	return oFF.XCellEngineParserLiteral.create(oFF.XDoubleValue.create(oFF.XDouble.convertFromString(token.getValue())));
};
oFF.XCellEngineParser.prototype.identifier = function()
{
	var identifier = null;
	var token = null;
	if (oFF.XString.isEqual(this.m_lookahead.getType(), oFF.XTokenTypes.IDENTIFIER))
	{
		token = this.consume(oFF.XTokenTypes.IDENTIFIER);
		identifier = oFF.XCellEngineParserIdentifier.create(token.getValue());
	}
	else
	{
		token = this.consume(oFF.XTokenTypes.RANGE_IDENTIFIER);
		identifier = oFF.XCellEngineParserIdentifier.create(token.getValue());
	}
	return identifier;
};
oFF.XCellEngineParser.prototype.stringLiteral = function()
{
	var token = this.consume(oFF.XTokenTypes.STRING);
	return oFF.XCellEngineParserLiteral.create(oFF.XStringValue.create(token.getValue()));
};
oFF.XCellEngineParser.prototype.primaryExpression = function()
{
	var primaryExpression;
	if (this.isLookAheadOpenParenthesis())
	{
		primaryExpression = this.parenthesisedExpression();
	}
	else if (oFF.XString.isEqual(this.m_lookahead.getType(), oFF.XTokenTypes.INTEGER))
	{
		primaryExpression = this.integerLiteral();
	}
	else if (oFF.XString.isEqual(this.m_lookahead.getType(), oFF.XTokenTypes.IDENTIFIER) || oFF.XString.isEqual(this.m_lookahead.getType(), oFF.XTokenTypes.RANGE_IDENTIFIER))
	{
		primaryExpression = this.identifier();
	}
	else if (oFF.XString.isEqual(this.m_lookahead.getType(), oFF.XTokenTypes.DOUBLE))
	{
		primaryExpression = this.doubleLiteral();
	}
	else if (oFF.XString.isEqual(this.m_lookahead.getType(), oFF.XTokenTypes.FUNCTION_NAME))
	{
		primaryExpression = this.functionCallExpression();
	}
	else
	{
		primaryExpression = this.stringLiteral();
	}
	return primaryExpression;
};
oFF.XCellEngineParser.prototype.isLookAheadOpenParenthesis = function()
{
	return oFF.notNull(this.m_lookahead) && oFF.XString.isEqual(this.m_lookahead.getType(), oFF.XTokenTypes.OPEN_PARENTHESIS);
};
oFF.XCellEngineParser.prototype.parenthesisedExpression = function()
{
	this.consume(oFF.XTokenTypes.OPEN_PARENTHESIS);
	var expression = this.expression();
	this.consume(oFF.XTokenTypes.CLOSE_PARENTHESIS);
	return expression;
};
oFF.XCellEngineParser.prototype.expression = function()
{
	var expression = this.additiveExpression();
	return expression;
};
oFF.XCellEngineParser.prototype.additiveExpression = function()
{
	var left = this.multiplicativeExpression();
	while (this.isLookaheadAdditionOrSubtractionOperator())
	{
		var token = this.consume(oFF.XTokenTypes.ADDITIVE_OPERATOR);
		var right = this.multiplicativeExpression();
		left = oFF.XCellEngineParserBinaryOperation.create(left, token.getValue(), right);
	}
	return left;
};
oFF.XCellEngineParser.prototype.isLookaheadAdditionOrSubtractionOperator = function()
{
	return oFF.notNull(this.m_lookahead) && oFF.XString.isEqual(this.m_lookahead.getType(), oFF.XTokenTypes.ADDITIVE_OPERATOR);
};
oFF.XCellEngineParser.prototype.multiplicativeExpression = function()
{
	var left = this.primaryExpression();
	while (this.isLookAheadMultiplicativeOperator())
	{
		var token = this.consume(oFF.XTokenTypes.MULTIPLICATIVE_OPERATOR);
		var right = this.primaryExpression();
		left = oFF.XCellEngineParserBinaryOperation.create(left, token.getValue(), right);
	}
	return left;
};
oFF.XCellEngineParser.prototype.functionCallExpression = function()
{
	var functionName = this.consume(oFF.XTokenTypes.FUNCTION_NAME).getValue();
	var args = this.argumentList();
	return oFF.XCellEngineParserFunctionCall.create(functionName, args);
};
oFF.XCellEngineParser.prototype.argumentList = function()
{
	this.consume(oFF.XTokenTypes.OPEN_PARENTHESIS);
	var args = oFF.XList.create();
	args.add(this.expression());
	while (oFF.XString.isEqual(this.m_lookahead.getType(), oFF.XTokenTypes.COMMA))
	{
		this.consume(oFF.XTokenTypes.COMMA);
		args.add(this.expression());
	}
	this.consume(oFF.XTokenTypes.CLOSE_PARENTHESIS);
	return args;
};
oFF.XCellEngineParser.prototype.isLookAheadMultiplicativeOperator = function()
{
	return oFF.notNull(this.m_lookahead) && oFF.XString.isEqual(this.m_lookahead.getType(), oFF.XTokenTypes.MULTIPLICATIVE_OPERATOR);
};
oFF.XCellEngineParser.prototype.consume = function(tokenType)
{
	var token = this.m_lookahead;
	if (oFF.isNull(token))
	{
		throw oFF.XException.createIllegalStateException(oFF.XStringUtils.concatenate3("SyntaxError: Unexpected end of input, expected: \"", tokenType, "\""));
	}
	if (!oFF.XString.isEqual(token.getType(), tokenType))
	{
		throw oFF.XException.createIllegalStateException(oFF.XStringUtils.concatenate4("SyntaxError: Unexpected token: \"", token.getValue(), "\", expected: \"", tokenType));
	}
	this.m_lookahead = this.m_tokenizer.getNextToken();
	return token;
};

oFF.XCellEngineParserBinaryOperation = function() {};
oFF.XCellEngineParserBinaryOperation.prototype = new oFF.XObject();
oFF.XCellEngineParserBinaryOperation.prototype._ff_c = "XCellEngineParserBinaryOperation";

oFF.XCellEngineParserBinaryOperation.create = function(left, operator, right)
{
	var obj = new oFF.XCellEngineParserBinaryOperation();
	obj.m_left = left;
	obj.operator = operator;
	obj.m_right = right;
	return obj;
};
oFF.XCellEngineParserBinaryOperation.prototype.m_left = null;
oFF.XCellEngineParserBinaryOperation.prototype.operator = null;
oFF.XCellEngineParserBinaryOperation.prototype.m_right = null;
oFF.XCellEngineParserBinaryOperation.prototype.getLeft = function()
{
	return this.m_left;
};
oFF.XCellEngineParserBinaryOperation.prototype.getRight = function()
{
	return this.m_right;
};
oFF.XCellEngineParserBinaryOperation.prototype.getOperator = function()
{
	return this.operator;
};
oFF.XCellEngineParserBinaryOperation.prototype.accept = function(visitor)
{
	visitor.visitBinaryOperation(this);
};
oFF.XCellEngineParserBinaryOperation.prototype.isEqualTo = function(other)
{
	var otherLiteral = other;
	return this.m_left.isEqualTo(otherLiteral.m_left) && oFF.XString.isEqual(this.operator, otherLiteral.operator) && this.m_right.isEqualTo(otherLiteral.m_right);
};

oFF.XCellEngineParserFunctionCall = function() {};
oFF.XCellEngineParserFunctionCall.prototype = new oFF.XObject();
oFF.XCellEngineParserFunctionCall.prototype._ff_c = "XCellEngineParserFunctionCall";

oFF.XCellEngineParserFunctionCall.create = function(functionName, args)
{
	var obj = new oFF.XCellEngineParserFunctionCall();
	obj.m_functionName = functionName;
	obj.m_args = args;
	return obj;
};
oFF.XCellEngineParserFunctionCall.prototype.m_functionName = null;
oFF.XCellEngineParserFunctionCall.prototype.m_args = null;
oFF.XCellEngineParserFunctionCall.prototype.getFunctionName = function()
{
	return this.m_functionName;
};
oFF.XCellEngineParserFunctionCall.prototype.getArs = function()
{
	return this.m_args;
};
oFF.XCellEngineParserFunctionCall.prototype.accept = function(visitor)
{
	visitor.visitFunctionCall(this);
};
oFF.XCellEngineParserFunctionCall.prototype.isEqualTo = function(other)
{
	var otherFunctionCall = other;
	var areArgsEqual = true;
	for (var i = 0; i < this.m_args.size(); i++)
	{
		var thisArg = this.m_args.get(i);
		var otherArg = otherFunctionCall.m_args.get(i);
		if (oFF.isNull(thisArg) || oFF.isNull(otherArg) || !thisArg.isEqualTo(otherArg))
		{
			areArgsEqual = false;
			break;
		}
	}
	return oFF.XString.isEqual(this.m_functionName, otherFunctionCall.m_functionName) && areArgsEqual;
};

oFF.XCellEngineParserIdentifier = function() {};
oFF.XCellEngineParserIdentifier.prototype = new oFF.XObject();
oFF.XCellEngineParserIdentifier.prototype._ff_c = "XCellEngineParserIdentifier";

oFF.XCellEngineParserIdentifier.create = function(identifier)
{
	var obj = new oFF.XCellEngineParserIdentifier();
	obj.m_identifier = identifier;
	return obj;
};
oFF.XCellEngineParserIdentifier.prototype.m_identifier = null;
oFF.XCellEngineParserIdentifier.prototype.getM_identifier = function()
{
	return this.m_identifier;
};
oFF.XCellEngineParserIdentifier.prototype.accept = function(visitor)
{
	visitor.visitIdentifier(this);
};
oFF.XCellEngineParserIdentifier.prototype.isEqualTo = function(other)
{
	var otherIdentifier = other;
	return oFF.XString.isEqual(this.m_identifier, otherIdentifier.m_identifier);
};

oFF.XCellEngineParserLiteral = function() {};
oFF.XCellEngineParserLiteral.prototype = new oFF.XObject();
oFF.XCellEngineParserLiteral.prototype._ff_c = "XCellEngineParserLiteral";

oFF.XCellEngineParserLiteral.create = function(value)
{
	var obj = new oFF.XCellEngineParserLiteral();
	obj.m_value = value;
	return obj;
};
oFF.XCellEngineParserLiteral.prototype.m_value = null;
oFF.XCellEngineParserLiteral.prototype.getValue = function()
{
	return this.m_value;
};
oFF.XCellEngineParserLiteral.prototype.accept = function(visitor)
{
	visitor.visitLiteral(this);
};
oFF.XCellEngineParserLiteral.prototype.isEqualTo = function(other)
{
	var otherLiteral = other;
	return this.m_value.isEqualTo(otherLiteral.m_value);
};

oFF.XCellEngineToken = function() {};
oFF.XCellEngineToken.prototype = new oFF.XObject();
oFF.XCellEngineToken.prototype._ff_c = "XCellEngineToken";

oFF.XCellEngineToken.create = function(type, value)
{
	var instance = new oFF.XCellEngineToken();
	instance.m_type = type;
	instance.m_value = value;
	return instance;
};
oFF.XCellEngineToken.prototype.m_type = null;
oFF.XCellEngineToken.prototype.m_value = null;
oFF.XCellEngineToken.prototype.getType = function()
{
	return this.m_type;
};
oFF.XCellEngineToken.prototype.getValue = function()
{
	return this.m_value;
};

oFF.XCellEngineTokenizer = function() {};
oFF.XCellEngineTokenizer.prototype = new oFF.XObject();
oFF.XCellEngineTokenizer.prototype._ff_c = "XCellEngineTokenizer";

oFF.XCellEngineTokenizer.create = function(string)
{
	var instance = new oFF.XCellEngineTokenizer();
	instance.m_string = string;
	instance.m_cursor = 0;
	instance.m_extractors = oFF.XArray.create(8);
	instance.setupXTokenizer();
	return instance;
};
oFF.XCellEngineTokenizer.prototype.m_string = null;
oFF.XCellEngineTokenizer.prototype.m_cursor = 0;
oFF.XCellEngineTokenizer.prototype.m_extractors = null;
oFF.XCellEngineTokenizer.prototype.setupXTokenizer = function()
{
	this.m_extractors.set(0, oFF.XWhiteSpaceExtractor.create(this.m_string));
	this.m_extractors.set(1, oFF.XCellEngineIdentifierExtractor.create(this.m_string));
	this.m_extractors.set(2, oFF.XCellFunctionCallExtractor.create(this.m_string));
	this.m_extractors.set(3, oFF.XNumericTokenExtractor.create(this.m_string));
	this.m_extractors.set(4, oFF.XAdditiveOperatorExtractor.create(this.m_string));
	this.m_extractors.set(5, oFF.XMultiplicativeOperatorExtractor.create(this.m_string));
	this.m_extractors.set(6, oFF.XParenthesisExtractor.create(this.m_string));
	this.m_extractors.set(7, oFF.XCellCommaExtractor.create(this.m_string));
};
oFF.XCellEngineTokenizer.prototype.getNextToken = function()
{
	var token = null;
	if (!this.hasMoreTokens())
	{
		return token;
	}
	if (this.startsWithEquals())
	{
		if (this.m_cursor === 0)
		{
			this.m_cursor = 1;
		}
		token = this.runExtractors();
		if (oFF.notNull(token))
		{
			return token;
		}
		throw oFF.XException.createIllegalStateException(oFF.XStringUtils.concatenate3("Unexpected token: \"", oFF.XString.substring(this.m_string, this.m_cursor, this.m_cursor + 1), "\""));
	}
	else
	{
		token = oFF.XCellEngineToken.create(oFF.XTokenTypes.STRING, oFF.XString.substring(this.m_string, 0, oFF.XString.size(this.m_string)));
	}
	return token;
};
oFF.XCellEngineTokenizer.prototype.hasMoreTokens = function()
{
	return oFF.notNull(this.m_string) && oFF.XString.size(this.m_string) > 0 && this.m_cursor < oFF.XString.size(this.m_string);
};
oFF.XCellEngineTokenizer.prototype.runExtractors = function()
{
	var token = null;
	for (var i = 0; i < this.m_extractors.size(); i++)
	{
		var extractor = this.m_extractors.get(i);
		extractor.setCursorPosition(this.m_cursor);
		token = extractor.extract();
		this.m_cursor = extractor.getCursorPosition();
		if (oFF.notNull(token))
		{
			break;
		}
	}
	return token;
};
oFF.XCellEngineTokenizer.prototype.startsWithEquals = function()
{
	return oFF.XString.isEqual(oFF.XString.substring(this.m_string, 0, 1), "=");
};

oFF.XAbstractTokenExtractor = function() {};
oFF.XAbstractTokenExtractor.prototype = new oFF.XObject();
oFF.XAbstractTokenExtractor.prototype._ff_c = "XAbstractTokenExtractor";

oFF.XAbstractTokenExtractor.prototype.m_cursor = 0;
oFF.XAbstractTokenExtractor.prototype.m_string = null;
oFF.XAbstractTokenExtractor.prototype.isEOF = function()
{
	return this.m_cursor === oFF.XString.size(this.m_string);
};
oFF.XAbstractTokenExtractor.prototype.increaseCursor = function()
{
	this.m_cursor++;
};
oFF.XAbstractTokenExtractor.prototype.getString = function()
{
	return this.m_string;
};
oFF.XAbstractTokenExtractor.prototype.setString = function(string)
{
	this.m_string = string;
};
oFF.XAbstractTokenExtractor.prototype.getCursorPosition = function()
{
	return this.m_cursor;
};
oFF.XAbstractTokenExtractor.prototype.setCursorPosition = function(cursorPosition)
{
	this.m_cursor = cursorPosition;
};
oFF.XAbstractTokenExtractor.prototype.extract = function()
{
	var string = oFF.XString.substring(this.getString(), this.getCursorPosition(), oFF.XString.size(this.getString()));
	return this.extractInternal(string);
};

oFF.XSpreadsheet = function() {};
oFF.XSpreadsheet.prototype = new oFF.XObject();
oFF.XSpreadsheet.prototype._ff_c = "XSpreadsheet";

oFF.XSpreadsheet.create = function()
{
	var instance = new oFF.XSpreadsheet();
	instance.setupSpreadsheet();
	return instance;
};
oFF.XSpreadsheet.prototype.m_cellProvider = null;
oFF.XSpreadsheet.prototype.m_cells = null;
oFF.XSpreadsheet.prototype.setupSpreadsheet = function()
{
	this.m_cells = oFF.XList.create();
	for (var i = 0; i < 100; i++)
	{
		var rows = oFF.XList.create();
		this.m_cells.add(rows);
		for (var j = 0; j < 26; j++)
		{
			var cell = oFF.XCell.create(this);
			rows.add(cell);
		}
	}
	this.m_cellProvider = oFF.XSpreadsheetCellProvider.create(this);
};
oFF.XSpreadsheet.prototype.releaseObject = function()
{
	for (var i = 0; i < this.m_cells.size(); i++)
	{
		for (var j = 0; j < this.m_cells.get(i).size(); j++)
		{
			oFF.XObjectExt.release(this.m_cells.get(i).get(j));
		}
		oFF.XObjectExt.release(this.m_cells.get(i));
	}
	oFF.XObjectExt.release(this.m_cells);
};
oFF.XSpreadsheet.prototype.getCellAtAddress = function(address)
{
	return this.m_cells.get(address.getRow()).get(address.getColumn());
};
oFF.XSpreadsheet.prototype.getCells = function()
{
	return this.m_cells;
};
oFF.XSpreadsheet.prototype.getCellRangeWithAddress = function(beginAddress, endAddress)
{
	var range = oFF.XList.create();
	for (var rowIndex = beginAddress.getRow(); rowIndex <= endAddress.getRow(); rowIndex++)
	{
		var row = oFF.XList.create();
		range.add(row);
		for (var columnIndex = beginAddress.getColumn(); columnIndex <= endAddress.getColumn(); columnIndex++)
		{
			row.add(this.m_cells.get(rowIndex).get(columnIndex));
		}
	}
	return range;
};
oFF.XSpreadsheet.prototype.getCellRangeWithAddressRange = function(addressRange)
{
	var range = oFF.XList.create();
	for (var rowIndex = addressRange.getStartRow(); rowIndex <= addressRange.getEndRow(); rowIndex++)
	{
		var row = oFF.XList.create();
		range.add(row);
		for (var columnIndex = addressRange.getStartColumn(); columnIndex <= addressRange.getEndColumn(); columnIndex++)
		{
			row.add(this.m_cells.get(rowIndex).get(columnIndex));
		}
	}
	return range;
};
oFF.XSpreadsheet.prototype.getCellProvider = function()
{
	return this.m_cellProvider;
};

oFF.XSpreadsheetCellProvider = function() {};
oFF.XSpreadsheetCellProvider.prototype = new oFF.XObject();
oFF.XSpreadsheetCellProvider.prototype._ff_c = "XSpreadsheetCellProvider";

oFF.XSpreadsheetCellProvider.create = function(spreadsheet)
{
	var instance = new oFF.XSpreadsheetCellProvider();
	instance.m_spreadsheet = spreadsheet;
	return instance;
};
oFF.XSpreadsheetCellProvider.prototype.m_spreadsheet = null;
oFF.XSpreadsheetCellProvider.prototype.getCellAtAddress = function(address)
{
	return this.m_spreadsheet.getCellAtAddress(address);
};
oFF.XSpreadsheetCellProvider.prototype.getCellRangeWithAddress = function(begin, end)
{
	return this.m_spreadsheet.getCellRangeWithAddress(begin, end);
};

oFF.XSpreadsheetInterpreter = function() {};
oFF.XSpreadsheetInterpreter.prototype = new oFF.XObject();
oFF.XSpreadsheetInterpreter.prototype._ff_c = "XSpreadsheetInterpreter";

oFF.XSpreadsheetInterpreter.create = function(cellProvider)
{
	var obj = new oFF.XSpreadsheetInterpreter();
	obj.setupFunctions();
	obj.m_cellProvider = cellProvider;
	return obj;
};
oFF.XSpreadsheetInterpreter.prototype.m_root = null;
oFF.XSpreadsheetInterpreter.prototype.m_functions = null;
oFF.XSpreadsheetInterpreter.prototype.m_cellProvider = null;
oFF.XSpreadsheetInterpreter.prototype.setupFunctions = function()
{
	this.m_functions = oFF.XHashMapByString.create();
	this.m_functions.put("sum", oFF.XSumOperation.create());
	this.m_functions.put("average", oFF.XAverageOperation.create());
	this.m_functions.put("count", oFF.XCountOperation.create());
	this.m_functions.put("max", oFF.XMaxOperation.create());
	this.m_functions.put("min", oFF.XMinOperation.create());
};
oFF.XSpreadsheetInterpreter.prototype.visitLiteral = function(xCellEngineLiteral)
{
	this.m_root = oFF.XSpreadsheetLiteral.create(xCellEngineLiteral.getValue());
};
oFF.XSpreadsheetInterpreter.prototype.visitIdentifier = function(xCellEngineParserIdentifier)
{
	var identifier = xCellEngineParserIdentifier.getM_identifier();
	if (this.isRange(identifier))
	{
		var addressRange = oFF.XCellAddressRange.createWithString(identifier);
		this.m_root = oFF.XSpreadsheetRangeIdentifier.create(this.m_cellProvider.getCellRangeWithAddress(addressRange.getStartingAddress(), addressRange.getEndingAddress()));
	}
	else
	{
		this.m_root = oFF.XSpreadsheetIdentifier.create(this.m_cellProvider.getCellAtAddress(oFF.XCellAddress.create(identifier)));
	}
};
oFF.XSpreadsheetInterpreter.prototype.isRange = function(identifier)
{
	return oFF.XStringUtils.containsString(identifier, ":", true);
};
oFF.XSpreadsheetInterpreter.prototype.visitBinaryOperation = function(xCellEngineBinaryOperation)
{
	xCellEngineBinaryOperation.getLeft().accept(this);
	var left = this.m_root;
	xCellEngineBinaryOperation.getRight().accept(this);
	var right = this.m_root;
	var operator = oFF.XSpreadsheetOperationFactory.createBinaryOperation(xCellEngineBinaryOperation.getOperator());
	this.m_root = oFF.XSpreadsheetBinaryOperation.create(left, operator, right);
};
oFF.XSpreadsheetInterpreter.prototype.visitFunctionCall = function(xCellEngineParserFunctionCall)
{
	var args = oFF.XList.create();
	for (var i = 0; i < xCellEngineParserFunctionCall.getArs().size(); i++)
	{
		xCellEngineParserFunctionCall.getArs().get(i).accept(this);
		args.add(this.m_root);
	}
	var functionName = xCellEngineParserFunctionCall.getFunctionName();
	var _function = this.getFunction(functionName);
	if (oFF.isNull(_function))
	{
		throw oFF.XException.createIllegalStateException(oFF.XStringUtils.concatenate3("SyntaxError: Function with name: \"", functionName, "\", expected does not exist"));
	}
	this.m_root = oFF.XSpreadsheetFunctionCall.create(_function, args);
};
oFF.XSpreadsheetInterpreter.prototype.getFunction = function(functionName)
{
	return this.m_functions.getByKey(oFF.XString.toLowerCase(functionName));
};
oFF.XSpreadsheetInterpreter.prototype.compile = function(formulaTree)
{
	formulaTree.accept(this);
	return this.m_root;
};

oFF.XSpreadsheetBinaryOperation = function() {};
oFF.XSpreadsheetBinaryOperation.prototype = new oFF.XObject();
oFF.XSpreadsheetBinaryOperation.prototype._ff_c = "XSpreadsheetBinaryOperation";

oFF.XSpreadsheetBinaryOperation.create = function(left, operator, right)
{
	var instance = new oFF.XSpreadsheetBinaryOperation();
	instance.left = left;
	instance.operator = operator;
	instance.right = right;
	return instance;
};
oFF.XSpreadsheetBinaryOperation.prototype.left = null;
oFF.XSpreadsheetBinaryOperation.prototype.operator = null;
oFF.XSpreadsheetBinaryOperation.prototype.right = null;
oFF.XSpreadsheetBinaryOperation.prototype.evaluate = function()
{
	var result;
	try
	{
		result = this.operator.apply(this.left.evaluate(), this.right.evaluate());
	}
	catch (t)
	{
		result = oFF.XStringValue.create("#ERROR");
	}
	return result;
};
oFF.XSpreadsheetBinaryOperation.prototype.isEqualTo = function(other)
{
	var otherBinaryOperation = other;
	return this.left.isEqualTo(otherBinaryOperation.left) && this.right.isEqualTo(otherBinaryOperation.right) && oFF.XString.isEqual(this.operator.getOperationType(), otherBinaryOperation.operator.getOperationType());
};

oFF.XSpreadsheetFunctionCall = function() {};
oFF.XSpreadsheetFunctionCall.prototype = new oFF.XObject();
oFF.XSpreadsheetFunctionCall.prototype._ff_c = "XSpreadsheetFunctionCall";

oFF.XSpreadsheetFunctionCall.create = function(_function, args)
{
	var instance = new oFF.XSpreadsheetFunctionCall();
	instance.m_function = _function;
	instance.m_args = args;
	return instance;
};
oFF.XSpreadsheetFunctionCall.prototype.m_function = null;
oFF.XSpreadsheetFunctionCall.prototype.m_args = null;
oFF.XSpreadsheetFunctionCall.prototype.evaluate = function()
{
	var result;
	try
	{
		var evaluatedArgs = oFF.XList.create();
		for (var i = 0; i < this.m_args.size(); i++)
		{
			evaluatedArgs.add(this.m_args.get(i).evaluate());
		}
		result = this.m_function.apply(evaluatedArgs);
	}
	catch (t)
	{
		result = oFF.XStringValue.create("#ERROR");
	}
	return result;
};

oFF.XSpreadsheetIdentifier = function() {};
oFF.XSpreadsheetIdentifier.prototype = new oFF.XObject();
oFF.XSpreadsheetIdentifier.prototype._ff_c = "XSpreadsheetIdentifier";

oFF.XSpreadsheetIdentifier.create = function(cell)
{
	var instance = new oFF.XSpreadsheetIdentifier();
	instance.m_cell = cell;
	return instance;
};
oFF.XSpreadsheetIdentifier.prototype.m_cell = null;
oFF.XSpreadsheetIdentifier.prototype.evaluate = function()
{
	var result;
	try
	{
		result = this.m_cell.evaluate();
	}
	catch (t)
	{
		result = oFF.XStringValue.create("#ERROR");
	}
	return result;
};
oFF.XSpreadsheetIdentifier.prototype.isEqualTo = function(other)
{
	var otherIdentifier = other;
	return this.m_cell.isEqualTo(otherIdentifier.m_cell);
};

oFF.XSpreadsheetLiteral = function() {};
oFF.XSpreadsheetLiteral.prototype = new oFF.XObject();
oFF.XSpreadsheetLiteral.prototype._ff_c = "XSpreadsheetLiteral";

oFF.XSpreadsheetLiteral.create = function(value)
{
	var instance = new oFF.XSpreadsheetLiteral();
	instance.m_value = value;
	return instance;
};
oFF.XSpreadsheetLiteral.prototype.m_value = null;
oFF.XSpreadsheetLiteral.prototype.evaluate = function()
{
	return this.m_value;
};
oFF.XSpreadsheetLiteral.prototype.isEqualTo = function(other)
{
	var otherLiteral = other;
	return this.m_value.isEqualTo(otherLiteral.m_value);
};

oFF.XSpreadsheetOperationFactory = {

	createBinaryOperation:function(operator)
	{
			var binaryOperation = null;
		if (oFF.XSpreadsheetOperationFactory.isAdditionOperator(operator))
		{
			binaryOperation = oFF.XAdditionFunction.create();
		}
		else if (oFF.XSpreadsheetOperationFactory.isSubtractionOperator(operator))
		{
			binaryOperation = oFF.XSubtractionFunction.create();
		}
		else if (oFF.XSpreadsheetOperationFactory.isMultiplicationOperator(operator))
		{
			binaryOperation = oFF.XMultiplicationFunction.create();
		}
		else if (oFF.XSpreadsheetOperationFactory.isDivisionOperator(operator))
		{
			binaryOperation = oFF.XDivisionFunction.create();
		}
		return binaryOperation;
	},
	isAdditionOperator:function(operator)
	{
			return oFF.XString.isEqual(operator, "+");
	},
	isSubtractionOperator:function(operator)
	{
			return oFF.XString.isEqual(operator, "-");
	},
	isMultiplicationOperator:function(operator)
	{
			return oFF.XString.isEqual(operator, "*");
	},
	isDivisionOperator:function(operator)
	{
			return oFF.XString.isEqual(operator, "/");
	}
};

oFF.XSpreadsheetRangeIdentifier = function() {};
oFF.XSpreadsheetRangeIdentifier.prototype = new oFF.XObject();
oFF.XSpreadsheetRangeIdentifier.prototype._ff_c = "XSpreadsheetRangeIdentifier";

oFF.XSpreadsheetRangeIdentifier.create = function(range)
{
	var instance = new oFF.XSpreadsheetRangeIdentifier();
	instance.m_range = oFF.XRangeValue.create(range);
	return instance;
};
oFF.XSpreadsheetRangeIdentifier.prototype.m_range = null;
oFF.XSpreadsheetRangeIdentifier.prototype.evaluate = function()
{
	return this.m_range;
};

oFF.XCellEngineBinaryOperationTypes = {

	ADDITION:"ADDITION",
	SUBTRACTION:"SUBTRACTION",
	MULTIPLICATION:"MULTIPLICATION",
	DIVISION:"DIVISION"
};

oFF.XAdditionFunction = function() {};
oFF.XAdditionFunction.prototype = new oFF.XObject();
oFF.XAdditionFunction.prototype._ff_c = "XAdditionFunction";

oFF.XAdditionFunction.create = function()
{
	var instance = new oFF.XAdditionFunction();
	return instance;
};
oFF.XAdditionFunction.prototype.apply = function(left, right)
{
	var firstDouble = this.convertToDouble(left);
	var secondDouble = this.convertToDouble(right);
	return oFF.XDoubleValue.create(firstDouble.getDouble() + secondDouble.getDouble());
};
oFF.XAdditionFunction.prototype.convertToDouble = function(value)
{
	return oFF.XDoubleValue.create(oFF.XDouble.convertFromString(value.getStringRepresentation()));
};
oFF.XAdditionFunction.prototype.getOperationType = function()
{
	return oFF.XCellEngineBinaryOperationTypes.ADDITION;
};

oFF.XAverageOperation = function() {};
oFF.XAverageOperation.prototype = new oFF.XObject();
oFF.XAverageOperation.prototype._ff_c = "XAverageOperation";

oFF.XAverageOperation.create = function()
{
	return new oFF.XAverageOperation();
};
oFF.XAverageOperation.prototype.apply = function(args)
{
	var value = oFF.XDoubleValue.create(0);
	var arg = args.get(0);
	if (!arg.getValueType().isEqualTo(oFF.XValueType.LIST))
	{
		value = this.convertToDouble(arg);
	}
	else
	{
		var rangeValue = arg;
		var count = 0;
		for (var rowIndex = 0; rowIndex < rangeValue.toRangeList().size(); rowIndex++)
		{
			var row = rangeValue.toRangeList().get(rowIndex);
			for (var columnIndex = 0; columnIndex < row.size(); columnIndex++)
			{
				count = count + 1;
				var doubleValue = this.convertToDouble(value);
				var doubleArg = this.convertToDouble(row.get(columnIndex).evaluate());
				value = oFF.XDoubleValue.create(doubleValue.getDouble() + doubleArg.getDouble());
			}
		}
		value = oFF.XDoubleValue.create(this.convertToDouble(value).getDouble() / count);
	}
	return value;
};
oFF.XAverageOperation.prototype.convertToDouble = function(value)
{
	return oFF.XDoubleValue.create(oFF.XDouble.convertFromString(value.getStringRepresentation()));
};

oFF.XCountOperation = function() {};
oFF.XCountOperation.prototype = new oFF.XObject();
oFF.XCountOperation.prototype._ff_c = "XCountOperation";

oFF.XCountOperation.create = function()
{
	return new oFF.XCountOperation();
};
oFF.XCountOperation.prototype.apply = function(args)
{
	var value = oFF.XDoubleValue.create(0);
	var arg = args.get(0);
	if (!arg.getValueType().isEqualTo(oFF.XValueType.LIST))
	{
		return oFF.XDoubleValue.create(1);
	}
	else
	{
		var rangeValue = arg;
		for (var rowIndex = 0; rowIndex < rangeValue.toRangeList().size(); rowIndex++)
		{
			var row = rangeValue.toRangeList().get(rowIndex);
			for (var columnIndex = 0; columnIndex < row.size(); columnIndex++)
			{
				var doubleValue = this.convertToDouble(value);
				value = oFF.XDoubleValue.create(doubleValue.getDouble() + 1);
			}
		}
	}
	return value;
};
oFF.XCountOperation.prototype.convertToDouble = function(value)
{
	return oFF.XDoubleValue.create(oFF.XDouble.convertFromString(value.getStringRepresentation()));
};

oFF.XDivisionFunction = function() {};
oFF.XDivisionFunction.prototype = new oFF.XObject();
oFF.XDivisionFunction.prototype._ff_c = "XDivisionFunction";

oFF.XDivisionFunction.create = function()
{
	var instance = new oFF.XDivisionFunction();
	return instance;
};
oFF.XDivisionFunction.prototype.apply = function(left, right)
{
	var firstDouble = this.convertToDouble(left);
	var secondDouble = this.convertToDouble(right);
	return oFF.XDoubleValue.create(firstDouble.getDouble() / secondDouble.getDouble());
};
oFF.XDivisionFunction.prototype.convertToDouble = function(value)
{
	return oFF.XDoubleValue.create(oFF.XDouble.convertFromString(value.getStringRepresentation()));
};
oFF.XDivisionFunction.prototype.getOperationType = function()
{
	return oFF.XCellEngineBinaryOperationTypes.DIVISION;
};

oFF.XMaxOperation = function() {};
oFF.XMaxOperation.prototype = new oFF.XObject();
oFF.XMaxOperation.prototype._ff_c = "XMaxOperation";

oFF.XMaxOperation.create = function()
{
	return new oFF.XMaxOperation();
};
oFF.XMaxOperation.prototype.apply = function(args)
{
	var value = oFF.XDoubleValue.create(0);
	var arg = args.get(0);
	var doubleValue = null;
	var doubleArg = null;
	if (!arg.getValueType().isEqualTo(oFF.XValueType.LIST))
	{
		doubleArg = this.convertToDouble(arg);
		value = oFF.XDoubleValue.create(doubleArg.getDouble());
	}
	else
	{
		var rangeValue = arg;
		var rangeList = rangeValue.toRangeList();
		value = this.convertToDouble(rangeList.get(0).get(0).evaluate());
		for (var rowIndex = 0; rowIndex < rangeList.size(); rowIndex++)
		{
			var row = rangeList.get(rowIndex);
			for (var columnIndex = 0; columnIndex < row.size(); columnIndex++)
			{
				doubleValue = this.convertToDouble(value);
				doubleArg = this.convertToDouble(row.get(columnIndex).evaluate());
				if (doubleArg.getDouble() > doubleValue.getDouble())
				{
					value = oFF.XDoubleValue.create(doubleArg.getDouble());
				}
			}
		}
	}
	return value;
};
oFF.XMaxOperation.prototype.convertToDouble = function(value)
{
	return oFF.XDoubleValue.create(oFF.XDouble.convertFromString(value.getStringRepresentation()));
};

oFF.XMinOperation = function() {};
oFF.XMinOperation.prototype = new oFF.XObject();
oFF.XMinOperation.prototype._ff_c = "XMinOperation";

oFF.XMinOperation.create = function()
{
	return new oFF.XMinOperation();
};
oFF.XMinOperation.prototype.apply = function(args)
{
	var value = oFF.XDoubleValue.create(0);
	var arg = args.get(0);
	var doubleValue = null;
	var doubleArg = null;
	if (!arg.getValueType().isEqualTo(oFF.XValueType.LIST))
	{
		doubleArg = this.convertToDouble(arg);
		value = oFF.XDoubleValue.create(doubleArg.getDouble());
	}
	else
	{
		var rangeValue = arg;
		var rangeList = rangeValue.toRangeList();
		value = this.convertToDouble(rangeList.get(0).get(0).evaluate());
		for (var rowIndex = 0; rowIndex < rangeList.size(); rowIndex++)
		{
			var row = rangeList.get(rowIndex);
			for (var columnIndex = 0; columnIndex < row.size(); columnIndex++)
			{
				doubleValue = this.convertToDouble(value);
				doubleArg = this.convertToDouble(row.get(columnIndex).evaluate());
				if (doubleArg.getDouble() < doubleValue.getDouble())
				{
					value = oFF.XDoubleValue.create(doubleArg.getDouble());
				}
			}
		}
	}
	return value;
};
oFF.XMinOperation.prototype.convertToDouble = function(value)
{
	return oFF.XDoubleValue.create(oFF.XDouble.convertFromString(value.getStringRepresentation()));
};

oFF.XMultiplicationFunction = function() {};
oFF.XMultiplicationFunction.prototype = new oFF.XObject();
oFF.XMultiplicationFunction.prototype._ff_c = "XMultiplicationFunction";

oFF.XMultiplicationFunction.create = function()
{
	var instance = new oFF.XMultiplicationFunction();
	return instance;
};
oFF.XMultiplicationFunction.prototype.apply = function(left, right)
{
	var firstDouble = this.convertToDouble(left);
	var secondDouble = this.convertToDouble(right);
	return oFF.XDoubleValue.create(firstDouble.getDouble() * secondDouble.getDouble());
};
oFF.XMultiplicationFunction.prototype.convertToDouble = function(value)
{
	return oFF.XDoubleValue.create(oFF.XDouble.convertFromString(value.getStringRepresentation()));
};
oFF.XMultiplicationFunction.prototype.getOperationType = function()
{
	return oFF.XCellEngineBinaryOperationTypes.MULTIPLICATION;
};

oFF.XSubtractionFunction = function() {};
oFF.XSubtractionFunction.prototype = new oFF.XObject();
oFF.XSubtractionFunction.prototype._ff_c = "XSubtractionFunction";

oFF.XSubtractionFunction.create = function()
{
	var instance = new oFF.XSubtractionFunction();
	return instance;
};
oFF.XSubtractionFunction.prototype.apply = function(left, right)
{
	var firstDouble = this.convertToDouble(left);
	var secondDouble = this.convertToDouble(right);
	return oFF.XDoubleValue.create(firstDouble.getDouble() - secondDouble.getDouble());
};
oFF.XSubtractionFunction.prototype.convertToDouble = function(value)
{
	return oFF.XDoubleValue.create(oFF.XDouble.convertFromString(value.getStringRepresentation()));
};
oFF.XSubtractionFunction.prototype.getOperationType = function()
{
	return oFF.XCellEngineBinaryOperationTypes.SUBTRACTION;
};

oFF.XSumOperation = function() {};
oFF.XSumOperation.prototype = new oFF.XObject();
oFF.XSumOperation.prototype._ff_c = "XSumOperation";

oFF.XSumOperation.create = function()
{
	return new oFF.XSumOperation();
};
oFF.XSumOperation.prototype.apply = function(args)
{
	var value = oFF.XDoubleValue.create(0);
	var arg = args.get(0);
	var doubleValue = null;
	var doubleArg = null;
	if (!arg.getValueType().isEqualTo(oFF.XValueType.LIST))
	{
		doubleValue = this.convertToDouble(value);
		doubleArg = this.convertToDouble(arg);
		value = oFF.XDoubleValue.create(doubleValue.getDouble() + doubleArg.getDouble());
	}
	else
	{
		var rangeValue = arg;
		for (var rowIndex = 0; rowIndex < rangeValue.toRangeList().size(); rowIndex++)
		{
			var row = rangeValue.toRangeList().get(rowIndex);
			for (var columnIndex = 0; columnIndex < row.size(); columnIndex++)
			{
				doubleValue = this.convertToDouble(value);
				doubleArg = this.convertToDouble(row.get(columnIndex).evaluate());
				value = oFF.XDoubleValue.create(doubleValue.getDouble() + doubleArg.getDouble());
			}
		}
	}
	return value;
};
oFF.XSumOperation.prototype.convertToDouble = function(value)
{
	return oFF.XDoubleValue.create(oFF.XDouble.convertFromString(value.getStringRepresentation()));
};

oFF.XCellAddressConverter = function() {};
oFF.XCellAddressConverter.prototype = new oFF.XObject();
oFF.XCellAddressConverter.prototype._ff_c = "XCellAddressConverter";

oFF.XCellAddressConverter.ASCII_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
oFF.XCellAddressConverter.create = function()
{
	var instance = new oFF.XCellAddressConverter();
	return instance;
};
oFF.XCellAddressConverter.prototype.convertStringAddressToColumnIndex = function(addressString)
{
	var columnAddress = this.getColumnString(addressString);
	var stringLength = oFF.XString.size(columnAddress);
	var column = 0;
	for (var i = 0; i < stringLength; i++)
	{
		var charAt = oFF.XString.getCharAt(columnAddress, i);
		var magnitude = oFF.XDouble.convertToInt(oFF.XMath.pow(26, stringLength - (i + 1)));
		column = column + magnitude * (charAt - 64);
	}
	return column - 1;
};
oFF.XCellAddressConverter.prototype.convertStringAddressToRowIndex = function(addressString)
{
	oFF.XString.toUpperCase(addressString);
	var begin = 0;
	for (var i = 0; i < oFF.XString.size(addressString); i++)
	{
		var charAt = oFF.XString.getCharAt(addressString, i);
		if (!this.isLetter(charAt))
		{
			begin = i;
			break;
		}
	}
	return oFF.XInteger.convertFromString(oFF.XString.substring(addressString, begin, oFF.XString.size(addressString))) - 1;
};
oFF.XCellAddressConverter.prototype.convertIndicesToAddressString = function(colIndex, rowIndex)
{
	var colString = this.getColumnStringFromIndex(colIndex);
	var rowString = oFF.XInteger.convertToString(rowIndex + 1);
	return oFF.XStringUtils.concatenate2(colString, rowString);
};
oFF.XCellAddressConverter.prototype.isLetter = function(charAt)
{
	return charAt >= 65 && charAt <= 90;
};
oFF.XCellAddressConverter.prototype.getColumnString = function(address)
{
	oFF.XString.toUpperCase(address);
	var end = 0;
	for (var i = 0; i < oFF.XString.size(address); i++)
	{
		var charAt = oFF.XString.getCharAt(address, i);
		if (!this.isLetter(charAt))
		{
			end = i;
			break;
		}
	}
	return oFF.XString.substring(address, 0, end);
};
oFF.XCellAddressConverter.prototype.getColumnStringFromIndex = function(colIndex)
{
	var normalizedColIndex = colIndex + 1;
	var colString = "";
	while (normalizedColIndex > 0)
	{
		var letterIndex = oFF.XMath.mod(colIndex, 26);
		var colChar = oFF.XString.substring(oFF.XCellAddressConverter.ASCII_CHARACTERS, letterIndex, letterIndex + 1);
		colString = oFF.XStringUtils.concatenate2(colChar, colString);
		normalizedColIndex = oFF.XMath.div(colIndex, 26);
	}
	return colString;
};

oFF.XAdditiveOperatorExtractor = function() {};
oFF.XAdditiveOperatorExtractor.prototype = new oFF.XAbstractTokenExtractor();
oFF.XAdditiveOperatorExtractor.prototype._ff_c = "XAdditiveOperatorExtractor";

oFF.XAdditiveOperatorExtractor.create = function(string)
{
	var instance = new oFF.XAdditiveOperatorExtractor();
	instance.setString(string);
	return instance;
};
oFF.XAdditiveOperatorExtractor.prototype.extractInternal = function(string)
{
	var token = null;
	var firstChar = oFF.XString.substring(string, 0, 1);
	if (oFF.XString.isEqual(firstChar, "+") || oFF.XString.isEqual(firstChar, "-"))
	{
		this.increaseCursor();
		token = oFF.XCellEngineToken.create(oFF.XTokenTypes.ADDITIVE_OPERATOR, firstChar);
	}
	return token;
};

oFF.XCellCommaExtractor = function() {};
oFF.XCellCommaExtractor.prototype = new oFF.XAbstractTokenExtractor();
oFF.XCellCommaExtractor.prototype._ff_c = "XCellCommaExtractor";

oFF.XCellCommaExtractor.create = function(string)
{
	var instance = new oFF.XCellCommaExtractor();
	instance.setString(string);
	return instance;
};
oFF.XCellCommaExtractor.prototype.extractInternal = function(string)
{
	var token = null;
	var firstChar = oFF.XString.substring(string, 0, 1);
	if (oFF.XString.isEqual(firstChar, ","))
	{
		this.increaseCursor();
		token = oFF.XCellEngineToken.create(oFF.XTokenTypes.COMMA, firstChar);
	}
	return token;
};

oFF.XCellEngineIdentifierExtractor = function() {};
oFF.XCellEngineIdentifierExtractor.prototype = new oFF.XAbstractTokenExtractor();
oFF.XCellEngineIdentifierExtractor.prototype._ff_c = "XCellEngineIdentifierExtractor";

oFF.XCellEngineIdentifierExtractor.create = function(string)
{
	var instance = new oFF.XCellEngineIdentifierExtractor();
	instance.setString(string);
	return instance;
};
oFF.XCellEngineIdentifierExtractor.prototype.extractInternal = function(string)
{
	var token = null;
	var identifierType = oFF.XTokenTypes.IDENTIFIER;
	var beginIndex = 0;
	var next = oFF.XString.substring(string, beginIndex, beginIndex + 1);
	beginIndex++;
	if (this.isLetter(next))
	{
		while (this.isLetter(next) && beginIndex < oFF.XString.size(string))
		{
			next = oFF.XString.substring(string, beginIndex, beginIndex + 1);
			beginIndex++;
		}
		if (!this.isNumber(next))
		{
			return null;
		}
		while (this.isNumber(next) && beginIndex < oFF.XString.size(string))
		{
			next = oFF.XString.substring(string, beginIndex, beginIndex + 1);
			if (this.isNumber(next))
			{
				beginIndex++;
			}
		}
		if (oFF.XString.isEqual(next, ":"))
		{
			identifierType = oFF.XTokenTypes.RANGE_IDENTIFIER;
			beginIndex++;
			next = oFF.XString.substring(string, beginIndex, beginIndex + 1);
			beginIndex++;
			while (this.isLetter(next) && beginIndex < oFF.XString.size(string))
			{
				next = oFF.XString.substring(string, beginIndex, beginIndex + 1);
				beginIndex++;
			}
			if (!this.isNumber(next))
			{
				return null;
			}
			while (this.isNumber(next) && beginIndex < oFF.XString.size(string))
			{
				next = oFF.XString.substring(string, beginIndex, beginIndex + 1);
				if (this.isNumber(next))
				{
					beginIndex++;
				}
			}
		}
		this.setCursorPosition(this.getCursorPosition() + beginIndex);
		token = oFF.XCellEngineToken.create(identifierType, oFF.XString.substring(string, 0, beginIndex));
	}
	return token;
};
oFF.XCellEngineIdentifierExtractor.prototype.isNumber = function(inputString)
{
	var charAt = oFF.XString.getCharAt(inputString, 0);
	return charAt >= 48 && charAt <= 57;
};
oFF.XCellEngineIdentifierExtractor.prototype.isLetter = function(inputString)
{
	var normalizedString = oFF.XString.toUpperCase(inputString);
	var charAt = oFF.XString.getCharAt(normalizedString, 0);
	return charAt >= 65 && charAt <= 90;
};

oFF.XCellFunctionCallExtractor = function() {};
oFF.XCellFunctionCallExtractor.prototype = new oFF.XAbstractTokenExtractor();
oFF.XCellFunctionCallExtractor.prototype._ff_c = "XCellFunctionCallExtractor";

oFF.XCellFunctionCallExtractor.create = function(string)
{
	var instance = new oFF.XCellFunctionCallExtractor();
	instance.setString(string);
	return instance;
};
oFF.XCellFunctionCallExtractor.prototype.extractInternal = function(string)
{
	var token = null;
	var isValid = false;
	var beginIndex = 0;
	var next = oFF.XString.substring(string, beginIndex, beginIndex + 1);
	beginIndex++;
	if (this.isLetter(next))
	{
		while (this.isLetter(next) && beginIndex < oFF.XString.size(string))
		{
			next = oFF.XString.substring(string, beginIndex, beginIndex + 1);
			if (oFF.XString.getCharAt(next, 0) === 40)
			{
				isValid = true;
				break;
			}
			beginIndex++;
		}
		if (isValid)
		{
			this.setCursorPosition(this.getCursorPosition() + beginIndex);
			token = oFF.XCellEngineToken.create(oFF.XTokenTypes.FUNCTION_NAME, oFF.XString.substring(string, 0, beginIndex));
		}
	}
	return token;
};
oFF.XCellFunctionCallExtractor.prototype.isLetter = function(inputString)
{
	var normalizedString = oFF.XString.toUpperCase(inputString);
	var charAt = oFF.XString.getCharAt(normalizedString, 0);
	return charAt >= 65 && charAt <= 90;
};

oFF.XMultiplicativeOperatorExtractor = function() {};
oFF.XMultiplicativeOperatorExtractor.prototype = new oFF.XAbstractTokenExtractor();
oFF.XMultiplicativeOperatorExtractor.prototype._ff_c = "XMultiplicativeOperatorExtractor";

oFF.XMultiplicativeOperatorExtractor.create = function(string)
{
	var instance = new oFF.XMultiplicativeOperatorExtractor();
	instance.setString(string);
	return instance;
};
oFF.XMultiplicativeOperatorExtractor.prototype.extractInternal = function(string)
{
	var token = null;
	var firstChar = oFF.XString.substring(string, 0, 1);
	if (oFF.XString.isEqual(firstChar, "*") || oFF.XString.isEqual(firstChar, "/"))
	{
		this.increaseCursor();
		token = oFF.XCellEngineToken.create(oFF.XTokenTypes.MULTIPLICATIVE_OPERATOR, firstChar);
	}
	return token;
};

oFF.XNumericTokenExtractor = function() {};
oFF.XNumericTokenExtractor.prototype = new oFF.XAbstractTokenExtractor();
oFF.XNumericTokenExtractor.prototype._ff_c = "XNumericTokenExtractor";

oFF.XNumericTokenExtractor.create = function(string)
{
	var instance = new oFF.XNumericTokenExtractor();
	instance.setString(string);
	instance.m_isInteger = true;
	return instance;
};
oFF.XNumericTokenExtractor.prototype.m_isInteger = false;
oFF.XNumericTokenExtractor.prototype.extractInternal = function(string)
{
	var token = null;
	var beginIndex = 0;
	try
	{
		oFF.XInteger.convertFromString(oFF.XString.substring(string, beginIndex, beginIndex + 1));
		this.increaseCursor();
		beginIndex++;
		while (!this.isEOF())
		{
			if (oFF.XString.isEqual(oFF.XString.substring(string, beginIndex, beginIndex + 1), "."))
			{
				this.m_isInteger = false;
				this.increaseCursor();
				beginIndex++;
			}
			try
			{
				oFF.XInteger.convertFromString(oFF.XString.substring(string, beginIndex, beginIndex + 1));
				this.increaseCursor();
				beginIndex++;
			}
			catch (internalException)
			{
				break;
			}
		}
		var numberToken = oFF.XString.substring(string, 0, beginIndex);
		if (this.m_isInteger)
		{
			token = oFF.XCellEngineToken.create(oFF.XTokenTypes.INTEGER, numberToken);
		}
		else
		{
			token = oFF.XCellEngineToken.create(oFF.XTokenTypes.DOUBLE, numberToken);
		}
	}
	catch (externalException)
	{
		token = null;
	}
	return token;
};

oFF.XParenthesisExtractor = function() {};
oFF.XParenthesisExtractor.prototype = new oFF.XAbstractTokenExtractor();
oFF.XParenthesisExtractor.prototype._ff_c = "XParenthesisExtractor";

oFF.XParenthesisExtractor.create = function(string)
{
	var instance = new oFF.XParenthesisExtractor();
	instance.setString(string);
	return instance;
};
oFF.XParenthesisExtractor.prototype.extractInternal = function(string)
{
	var token = null;
	var firstChar = oFF.XString.substring(string, 0, 1);
	if (oFF.XString.isEqual(firstChar, "("))
	{
		this.increaseCursor();
		token = oFF.XCellEngineToken.create(oFF.XTokenTypes.OPEN_PARENTHESIS, firstChar);
	}
	else if (oFF.XString.isEqual(firstChar, ")"))
	{
		this.increaseCursor();
		token = oFF.XCellEngineToken.create(oFF.XTokenTypes.CLOSE_PARENTHESIS, firstChar);
	}
	return token;
};

oFF.XWhiteSpaceExtractor = function() {};
oFF.XWhiteSpaceExtractor.prototype = new oFF.XAbstractTokenExtractor();
oFF.XWhiteSpaceExtractor.prototype._ff_c = "XWhiteSpaceExtractor";

oFF.XWhiteSpaceExtractor.create = function(string)
{
	var instance = new oFF.XWhiteSpaceExtractor();
	instance.setString(string);
	return instance;
};
oFF.XWhiteSpaceExtractor.prototype.extractInternal = function(string)
{
	var beginIndex = 0;
	var firstChar = oFF.XString.substring(string, beginIndex, beginIndex + 1);
	while (this.isWhiteSpace(firstChar))
	{
		this.increaseCursor();
		beginIndex++;
		firstChar = oFF.XString.substring(string, beginIndex, beginIndex + 1);
	}
	return null;
};
oFF.XWhiteSpaceExtractor.prototype.isWhiteSpace = function(firstChar)
{
	return oFF.XString.isEqual(firstChar, " ") || oFF.XString.isEqual(firstChar, "\t") || oFF.XString.isEqual(firstChar, "\n");
};

oFF.XCellFormat = function() {};
oFF.XCellFormat.prototype = new oFF.XObject();
oFF.XCellFormat.prototype._ff_c = "XCellFormat";

oFF.XCellFormat.create = function()
{
	var obj = new oFF.XCellFormat();
	obj.setupFormat();
	return obj;
};
oFF.XCellFormat.prototype.m_backgroundColor = null;
oFF.XCellFormat.prototype.m_textColor = null;
oFF.XCellFormat.prototype.m_bold = false;
oFF.XCellFormat.prototype.m_italic = false;
oFF.XCellFormat.prototype.m_fontSize = 0;
oFF.XCellFormat.prototype.m_cellHorizontalAlignment = null;
oFF.XCellFormat.prototype.m_numberFormatterSettings = null;
oFF.XCellFormat.prototype.setupFormat = function()
{
	this.m_backgroundColor = "#ffffff";
	this.m_textColor = "#000000";
	this.m_bold = false;
	this.m_italic = false;
	this.m_fontSize = 0;
	this.m_numberFormatterSettings = oFF.XNumberFormatterSettingsFactory.getInstance().create();
};
oFF.XCellFormat.prototype.setBackgroundColor = function(backgroundColor)
{
	this.m_backgroundColor = backgroundColor;
};
oFF.XCellFormat.prototype.getBackgroundColor = function()
{
	return this.m_backgroundColor;
};
oFF.XCellFormat.prototype.setTextColor = function(textColor)
{
	this.m_textColor = textColor;
};
oFF.XCellFormat.prototype.getTextColor = function()
{
	return this.m_textColor;
};
oFF.XCellFormat.prototype.setBold = function(bold)
{
	this.m_bold = bold;
};
oFF.XCellFormat.prototype.getBold = function()
{
	return this.m_bold;
};
oFF.XCellFormat.prototype.setItalic = function(italic)
{
	this.m_italic = italic;
};
oFF.XCellFormat.prototype.getItalic = function()
{
	return this.m_italic;
};
oFF.XCellFormat.prototype.setFontSize = function(fontSize)
{
	this.m_fontSize = fontSize;
};
oFF.XCellFormat.prototype.getFontSize = function()
{
	return this.m_fontSize;
};
oFF.XCellFormat.prototype.setHorizontalAlignment = function(horizontalAlignment)
{
	this.m_cellHorizontalAlignment = horizontalAlignment;
};
oFF.XCellFormat.prototype.getHorizontalAlignment = function()
{
	return this.m_cellHorizontalAlignment;
};
oFF.XCellFormat.prototype.addRightDigit = function()
{
	var digitsRight = this.m_numberFormatterSettings.getMaxDigitsRight();
	if (digitsRight >= 0)
	{
		this.m_numberFormatterSettings.setMaxDigitsRight(digitsRight + 1);
	}
	else
	{
		this.m_numberFormatterSettings.setMaxDigitsRight(1);
	}
};
oFF.XCellFormat.prototype.removeRightDigit = function()
{
	var digitsRight = this.m_numberFormatterSettings.getMaxDigitsRight();
	if (digitsRight > 0)
	{
		this.m_numberFormatterSettings.setMaxDigitsRight(digitsRight - 1);
	}
};
oFF.XCellFormat.prototype.formatString = function(stringToFormat)
{
	if (oFF.XStringUtils.isNumber(stringToFormat))
	{
		var value = oFF.XDouble.convertFromString(stringToFormat);
		return oFF.XNumberFormatter.formatDoubleToStringUsingSettings(value, this.m_numberFormatterSettings);
	}
	return stringToFormat;
};

oFF.XCell = function() {};
oFF.XCell.prototype = new oFF.XObject();
oFF.XCell.prototype._ff_c = "XCell";

oFF.XCell.create = function(spreadsheet)
{
	var instance = new oFF.XCell();
	instance.m_spreadsheet = spreadsheet;
	instance.m_stringLiteral = "";
	instance.m_cellFormat = oFF.XCellFormat.create();
	return instance;
};
oFF.XCell.prototype.m_stringLiteral = null;
oFF.XCell.prototype.m_formula = null;
oFF.XCell.prototype.m_spreadsheet = null;
oFF.XCell.prototype.m_changed = false;
oFF.XCell.prototype.m_cellFormat = null;
oFF.XCell.prototype.getStringLiteral = function()
{
	return this.m_stringLiteral;
};
oFF.XCell.prototype.getStringRepresentation = function()
{
	return this.evaluate().getStringRepresentation();
};
oFF.XCell.prototype.getFormattedString = function()
{
	var stringRepresentation = this.getStringRepresentation();
	return this.m_cellFormat.formatString(stringRepresentation);
};
oFF.XCell.prototype.evaluate = function()
{
	if (oFF.notNull(this.m_formula))
	{
		var compiler = oFF.XSpreadsheetInterpreter.create(this.m_spreadsheet.getCellProvider());
		return compiler.compile(this.m_formula).evaluate();
	}
	return oFF.XStringValue.create("");
};
oFF.XCell.prototype.setText = function(text)
{
	this.setTextInternal(text);
	this.m_changed = true;
};
oFF.XCell.prototype.setTextInternal = function(text)
{
	this.m_stringLiteral = text;
	var parser = oFF.XCellEngineParser.create();
	this.m_formula = parser.parse(text);
};
oFF.XCell.prototype.updateTextFromLinkedObject = function(text)
{
	if (!this.m_changed)
	{
		this.setTextInternal(text);
	}
};
oFF.XCell.prototype.isChanged = function()
{
	return this.m_changed;
};
oFF.XCell.prototype.isEqualTo = function(other)
{
	var otherCell = other;
	return otherCell.evaluate().isEqualTo(otherCell.evaluate());
};
oFF.XCell.prototype.releaseObject = function()
{
	oFF.XObjectExt.release(this.m_formula);
};
oFF.XCell.prototype.setBackgroundColor = function(backgroundColor)
{
	this.m_cellFormat.setBackgroundColor(backgroundColor);
};
oFF.XCell.prototype.getBackgroundColor = function()
{
	return this.m_cellFormat.getBackgroundColor();
};
oFF.XCell.prototype.setTextColor = function(textColor)
{
	this.m_cellFormat.setTextColor(textColor);
};
oFF.XCell.prototype.getTextColor = function()
{
	return this.m_cellFormat.getTextColor();
};
oFF.XCell.prototype.setBold = function(bold)
{
	this.m_cellFormat.setBold(bold);
};
oFF.XCell.prototype.getBold = function()
{
	return this.m_cellFormat.getBold();
};
oFF.XCell.prototype.setItalic = function(italic)
{
	this.m_cellFormat.setItalic(italic);
};
oFF.XCell.prototype.getItalic = function()
{
	return this.m_cellFormat.getItalic();
};
oFF.XCell.prototype.setFontSize = function(fontSize)
{
	this.m_cellFormat.setFontSize(fontSize);
};
oFF.XCell.prototype.getFontSize = function()
{
	return this.m_cellFormat.getFontSize();
};
oFF.XCell.prototype.setHorizontalAlignment = function(horizontalAlignment)
{
	this.m_cellFormat.setHorizontalAlignment(horizontalAlignment);
};
oFF.XCell.prototype.getHorizontalAlignment = function()
{
	return this.m_cellFormat.getHorizontalAlignment();
};
oFF.XCell.prototype.addRightDigit = function()
{
	if (oFF.XStringUtils.isNumber(this.getStringRepresentation()))
	{
		this.m_cellFormat.addRightDigit();
	}
};
oFF.XCell.prototype.removeRightDigit = function()
{
	if (oFF.XStringUtils.isNumber(this.getStringRepresentation()))
	{
		this.m_cellFormat.removeRightDigit();
	}
};

oFF.XCellAddress = function() {};
oFF.XCellAddress.prototype = new oFF.XObject();
oFF.XCellAddress.prototype._ff_c = "XCellAddress";

oFF.XCellAddress.create = function(addressString)
{
	var instance = new oFF.XCellAddress();
	instance.internalSetup();
	instance.m_column = instance.m_addressConverter.convertStringAddressToColumnIndex(addressString);
	instance.m_row = instance.m_addressConverter.convertStringAddressToRowIndex(addressString);
	return instance;
};
oFF.XCellAddress.createWithIndices = function(row, column)
{
	var instance = new oFF.XCellAddress();
	instance.internalSetup();
	instance.m_column = column;
	instance.m_row = row;
	return instance;
};
oFF.XCellAddress.prototype.m_row = 0;
oFF.XCellAddress.prototype.m_column = 0;
oFF.XCellAddress.prototype.m_addressConverter = null;
oFF.XCellAddress.prototype.internalSetup = function()
{
	this.m_addressConverter = oFF.XCellAddressConverter.create();
};
oFF.XCellAddress.prototype.getRow = function()
{
	return this.m_row;
};
oFF.XCellAddress.prototype.getColumn = function()
{
	return this.m_column;
};
oFF.XCellAddress.prototype.getAddressString = function()
{
	return this.m_addressConverter.convertIndicesToAddressString(this.m_column, this.m_row);
};
oFF.XCellAddress.prototype.isEqualTo = function(other)
{
	var otherAddress = other;
	return this.m_row === otherAddress.m_row && this.m_column === otherAddress.m_column;
};
oFF.XCellAddress.prototype.releaseObject = function()
{
	oFF.XObjectExt.release(this.m_addressConverter);
};

oFF.XCellAddressRange = function() {};
oFF.XCellAddressRange.prototype = new oFF.XObject();
oFF.XCellAddressRange.prototype._ff_c = "XCellAddressRange";

oFF.XCellAddressRange.createWithIndices = function(startRow, endRow, startColumn, endColumn)
{
	var obj = new oFF.XCellAddressRange();
	obj.m_rangeStart = oFF.XCellAddress.createWithIndices(startRow, startColumn);
	obj.m_rangeEnd = oFF.XCellAddress.createWithIndices(endRow, endColumn);
	return obj;
};
oFF.XCellAddressRange.createWithString = function(addressString)
{
	var obj = new oFF.XCellAddressRange();
	var addressList = oFF.XStringTokenizer.splitString(addressString, ":");
	var size = addressList.size();
	obj.m_rangeStart = oFF.XCellAddress.create(addressList.get(0));
	obj.m_rangeEnd = (size > 1) ? oFF.XCellAddress.create(addressList.get(1)) : oFF.XCellAddress.create(addressList.get(0));
	return obj;
};
oFF.XCellAddressRange.prototype.m_rangeStart = null;
oFF.XCellAddressRange.prototype.m_rangeEnd = null;
oFF.XCellAddressRange.prototype.getStartingAddress = function()
{
	return this.m_rangeStart;
};
oFF.XCellAddressRange.prototype.getEndingAddress = function()
{
	return this.m_rangeEnd;
};
oFF.XCellAddressRange.prototype.getStartRow = function()
{
	return this.m_rangeStart.getRow();
};
oFF.XCellAddressRange.prototype.getEndRow = function()
{
	return this.m_rangeEnd.getRow();
};
oFF.XCellAddressRange.prototype.getStartColumn = function()
{
	return this.m_rangeStart.getColumn();
};
oFF.XCellAddressRange.prototype.getEndColumn = function()
{
	return this.m_rangeEnd.getColumn();
};
oFF.XCellAddressRange.prototype.getAddressString = function()
{
	var addressString = this.m_rangeStart.getAddressString();
	if (this.getStartRow() !== this.getEndRow() || this.getStartColumn() !== this.getEndColumn())
	{
		addressString = oFF.XStringUtils.concatenate3(addressString, ":", this.m_rangeEnd.getAddressString());
	}
	return addressString;
};

oFF.XTokenTypes = function() {};
oFF.XTokenTypes.prototype = new oFF.XConstant();
oFF.XTokenTypes.prototype._ff_c = "XTokenTypes";

oFF.XTokenTypes.INTEGER = "INTEGER";
oFF.XTokenTypes.DOUBLE = "DOUBLE";
oFF.XTokenTypes.STRING = "STRING";
oFF.XTokenTypes.ADDITIVE_OPERATOR = "ADDITIVE_OPERATOR";
oFF.XTokenTypes.MULTIPLICATIVE_OPERATOR = "MULTIPLICATIVE_OPERATOR";
oFF.XTokenTypes.OPEN_PARENTHESIS = "OPEN_PARENTHESIS";
oFF.XTokenTypes.CLOSE_PARENTHESIS = "CLOSE_PARENTHESIS";
oFF.XTokenTypes.IDENTIFIER = "IDENTIFIER";
oFF.XTokenTypes.FUNCTION_NAME = "FUNCTION_NAME";
oFF.XTokenTypes.COMMA = "COMMA";
oFF.XTokenTypes.RANGE_IDENTIFIER = "RANGE_IDENTIFIER";

oFF.XRangeValue = function() {};
oFF.XRangeValue.prototype = new oFF.XAbstractValue();
oFF.XRangeValue.prototype._ff_c = "XRangeValue";

oFF.XRangeValue.create = function(range)
{
	var instance = new oFF.XRangeValue();
	instance.m_range = range;
	return instance;
};
oFF.XRangeValue.prototype.m_range = null;
oFF.XRangeValue.prototype.getStringRepresentation = function()
{
	return this.m_range.toString();
};
oFF.XRangeValue.prototype.getValueType = function()
{
	return oFF.XValueType.LIST;
};
oFF.XRangeValue.prototype.toRangeList = function()
{
	return this.m_range;
};

oFF.CellEngineModule = function() {};
oFF.CellEngineModule.prototype = new oFF.DfModule();
oFF.CellEngineModule.prototype._ff_c = "CellEngineModule";

oFF.CellEngineModule.s_module = null;
oFF.CellEngineModule.getInstance = function()
{
	if (oFF.isNull(oFF.CellEngineModule.s_module))
	{
		oFF.DfModule.checkInitialized(oFF.IoModule.getInstance());
		oFF.DfModule.checkInitialized(oFF.VisualizationAbstractModule.getInstance());
		oFF.CellEngineModule.s_module = oFF.DfModule.startExt(new oFF.CellEngineModule());
		oFF.DfModule.stopExt(oFF.CellEngineModule.s_module);
	}
	return oFF.CellEngineModule.s_module;
};
oFF.CellEngineModule.prototype.getName = function()
{
	return "ff3300.cell.engine";
};

oFF.CellEngineModule.getInstance();

return sap.firefly;
	} );