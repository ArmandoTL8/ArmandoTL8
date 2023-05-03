/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
[
"sap/sac/df/firefly/ff2220.ui.tools"
],
function(oFF)
{
"use strict";

oFF.SiWriterJava = function() {};
oFF.SiWriterJava.prototype = new oFF.XObject();
oFF.SiWriterJava.prototype._ff_c = "SiWriterJava";

oFF.SiWriterJava.create = function()
{
	var writer = new oFF.SiWriterJava();
	writer.m_buffer = oFF.XStringBufferExt.create();
	return writer;
};
oFF.SiWriterJava.prototype.m_buffer = null;
oFF.SiWriterJava.prototype.writeExpressionSequence = function(token)
{
	var children = token.getChildren();
	for (var i = 0; i < children.size(); i++)
	{
		var child = children.get(i);
		child.write(this);
		if (child.getType() !== oFF.SiTokenType.CURLY_BRACKET)
		{
			this.m_buffer.append(";");
		}
	}
};
oFF.SiWriterJava.prototype.writeBlock = function(token)
{
	this.m_buffer.append("{");
	var child = token.getChild();
	if (oFF.notNull(child))
	{
		child.write(this);
	}
	this.m_buffer.append("}");
};
oFF.SiWriterJava.prototype.writeFunction = function(token)
{
	this.m_buffer.append(token.getValue());
	this.m_buffer.append("(");
	var children = token.getChildren();
	if (oFF.notNull(children))
	{
		for (var i = 0; i < children.size(); i++)
		{
			if (i > 0)
			{
				this.m_buffer.append(",");
			}
			var child = children.get(i);
			child.write(this);
		}
	}
	this.m_buffer.append(")");
};
oFF.SiWriterJava.prototype.writeIdentifier = function(token)
{
	this.m_buffer.append(token.getValue());
};
oFF.SiWriterJava.prototype.writeString = function(token)
{
	this.m_buffer.append("'");
	this.m_buffer.append(token.getValue());
	this.m_buffer.append("'");
};
oFF.SiWriterJava.prototype.writeInteger = function(token)
{
	this.m_buffer.append(token.getValue());
};
oFF.SiWriterJava.prototype.writeDouble = function(token)
{
	this.m_buffer.append(token.getValue());
};
oFF.SiWriterJava.prototype.writeOpDot = function(token)
{
	this.writeOp(token, ".");
};
oFF.SiWriterJava.prototype.writeOpPlus = function(token)
{
	this.writeOp(token, "+");
};
oFF.SiWriterJava.prototype.writeOpMinus = function(token)
{
	this.writeOp(token, "-");
};
oFF.SiWriterJava.prototype.writeOpMult = function(token)
{
	this.writeOp(token, "*");
};
oFF.SiWriterJava.prototype.writeOpDiv = function(token)
{
	this.writeOp(token, "/");
};
oFF.SiWriterJava.prototype.writeOpLower = function(token)
{
	this.writeOp(token, "<");
};
oFF.SiWriterJava.prototype.writeOpLowerEqual = function(token)
{
	this.writeOp(token, "<=");
};
oFF.SiWriterJava.prototype.writeOpGreater = function(token)
{
	this.writeOp(token, ">");
};
oFF.SiWriterJava.prototype.writeOpGreaterEqual = function(token)
{
	this.writeOp(token, ">=");
};
oFF.SiWriterJava.prototype.writeOpEqual = function(token)
{
	this.writeOp(token, "==");
};
oFF.SiWriterJava.prototype.writeOpNotEqual = function(token)
{
	this.writeOp(token, "!=");
};
oFF.SiWriterJava.prototype.writeOpBoolAnd = function(token)
{
	this.writeOp(token, "&&");
};
oFF.SiWriterJava.prototype.writeOpBoolOr = function(token)
{
	this.writeOp(token, "||");
};
oFF.SiWriterJava.prototype.writeOp = function(token, name)
{
	var left = token.getLeft();
	left.write(this);
	this.m_buffer.append(name);
	var right = token.getRight();
	right.write(this);
};
oFF.SiWriterJava.prototype.writeDefault = function(token) {};
oFF.SiWriterJava.prototype.writeTrue = function(token)
{
	this.m_buffer.append("true");
};
oFF.SiWriterJava.prototype.writeFalse = function(token)
{
	this.m_buffer.append("false");
};
oFF.SiWriterJava.prototype.toString = function()
{
	return this.m_buffer.toString();
};

oFF.CustomControlRegistration = {

	s_controls:null,
	staticSetup:function()
	{
			oFF.CustomControlRegistration.s_controls = oFF.XHashMapByString.create();
	},
	setCustomControl:function(name, uiControl)
	{
			oFF.CustomControlRegistration.s_controls.put(name, uiControl);
	},
	getCustomControl:function(name)
	{
			return oFF.CustomControlRegistration.s_controls.getByKey(name);
	},
	getAllEntries:function()
	{
			return oFF.CustomControlRegistration.s_controls;
	}
};

oFF.GlobalValueHolder = function() {};
oFF.GlobalValueHolder.prototype = new oFF.XObject();
oFF.GlobalValueHolder.prototype._ff_c = "GlobalValueHolder";

oFF.GlobalValueHolder.prototype.m_content = null;
oFF.GlobalValueHolder.prototype.setContent = function(content)
{
	this.m_content = content;
};
oFF.GlobalValueHolder.prototype.getContent = function()
{
	return this.m_content;
};

oFF.SxJsonDp = function() {};
oFF.SxJsonDp.prototype = new oFF.XObject();
oFF.SxJsonDp.prototype._ff_c = "SxJsonDp";

oFF.SxJsonDp.prototype.m_structure = null;
oFF.SxJsonDp.prototype.m_name = null;
oFF.SxJsonDp.prototype.m_tagging = null;
oFF.SxJsonDp.prototype.getComponentType = function()
{
	return oFF.QuasarComponentType.JSON_DATA_PROVIDER;
};
oFF.SxJsonDp.prototype.getTagging = function()
{
	return this.m_tagging;
};
oFF.SxJsonDp.prototype.getDataProviderName = function()
{
	return this.m_name;
};
oFF.SxJsonDp.prototype.setDataProviderName = function(name)
{
	this.m_name = name;
};
oFF.SxJsonDp.prototype.getElementByPath = function(path)
{
	var pathFragments = oFF.XStringTokenizer.splitString(path, "/");
	var currentElement = this.m_structure;
	var i = 0;
	for (; i < pathFragments.size() && oFF.notNull(currentElement); i++)
	{
		var name = pathFragments.get(i);
		var type = currentElement.getType();
		if (type === oFF.PrElementType.LIST)
		{
			var currentList = currentElement;
			var index = this.convertArray(name);
			if (index >= 0 && index < currentList.size())
			{
				currentElement = currentList.get(index);
			}
			else
			{
				currentElement = null;
			}
		}
		else if (type === oFF.PrElementType.STRUCTURE)
		{
			var currentStructure = currentElement;
			currentElement = currentStructure.getByKey(name);
		}
		else
		{
			currentElement = null;
		}
	}
	var found = null;
	if (i === pathFragments.size() && oFF.notNull(currentElement))
	{
		found = currentElement;
	}
	return found;
};
oFF.SxJsonDp.prototype.setElementByPath = function(path, element)
{
	var name;
	var type;
	var currentList;
	var currentStructure;
	var index;
	var pathFragments = oFF.XStringTokenizer.splitString(path, "/");
	var currentElement = this.m_structure;
	var i = 0;
	for (; i < pathFragments.size() - 1 && oFF.notNull(currentElement); i++)
	{
		name = pathFragments.get(i);
		type = currentElement.getType();
		if (type === oFF.PrElementType.LIST)
		{
			currentList = currentElement;
			index = this.convertArray(name);
			if (index >= 0 && index < currentList.size())
			{
				currentElement = currentList.get(index);
			}
			else
			{
				currentElement = null;
			}
		}
		else if (type === oFF.PrElementType.STRUCTURE)
		{
			currentStructure = currentElement;
			currentElement = currentStructure.getByKey(name);
		}
		else
		{
			currentElement = null;
		}
	}
	if (oFF.notNull(currentElement))
	{
		name = pathFragments.get(i);
		type = currentElement.getType();
		if (type === oFF.PrElementType.LIST)
		{
			currentList = currentElement;
			index = this.convertArray(name);
			if (index >= 0 && index < currentList.size())
			{
				currentElement = currentList.get(index);
			}
			else
			{
				currentElement = null;
			}
		}
		else if (type === oFF.PrElementType.STRUCTURE)
		{
			currentStructure = currentElement;
			currentElement = currentStructure.getByKey(name);
		}
	}
};
oFF.SxJsonDp.prototype.convertArray = function(name)
{
	var index = -1;
	if (oFF.XString.startsWith(name, "(") && oFF.XString.endsWith(name, " )"))
	{
		var size = oFF.XString.size(name);
		var indexValue = oFF.XString.substring(name, 1, size - 2);
		index = oFF.XInteger.convertFromStringWithDefault(indexValue, -1);
	}
	return index;
};

oFF.SxJsonDpBindingFactory = function() {};
oFF.SxJsonDpBindingFactory.prototype = new oFF.DpBindingFactory();
oFF.SxJsonDpBindingFactory.prototype._ff_c = "SxJsonDpBindingFactory";

oFF.SxJsonDpBindingFactory.staticSetupJsonBindingFactory = function()
{
	oFF.DpBindingFactory.registerFactory(oFF.QuasarComponentType.JSON_DATA_PROVIDER, new oFF.SxJsonDpBindingFactory());
};
oFF.SxJsonDpBindingFactory.prototype.newBindingProvider = function(component, path)
{
	var dp = component;
	return oFF.SxJsonDpBindingProvider.create(dp, path);
};

oFF.SxJsonDpBindingProvider = function() {};
oFF.SxJsonDpBindingProvider.prototype = new oFF.XObject();
oFF.SxJsonDpBindingProvider.prototype._ff_c = "SxJsonDpBindingProvider";

oFF.SxJsonDpBindingProvider.create = function(dp, path)
{
	var newObject = new oFF.SxJsonDpBindingProvider();
	newObject.m_dp = dp;
	newObject.m_path = path;
	return newObject;
};
oFF.SxJsonDpBindingProvider.prototype.m_dp = null;
oFF.SxJsonDpBindingProvider.prototype.m_path = null;
oFF.SxJsonDpBindingProvider.prototype.getSenderBindings = function()
{
	var list = oFF.XList.create();
	list.add(oFF.SemanticBindingType.STRING);
	return list;
};
oFF.SxJsonDpBindingProvider.prototype.getReceiverBindings = function()
{
	var list = oFF.XList.create();
	list.add(oFF.SemanticBindingType.STRING);
	return list;
};
oFF.SxJsonDpBindingProvider.prototype.getSenderProtocolBindings = function(type)
{
	var list = oFF.XList.create();
	list.add(oFF.ProtocolBindingType.STRING);
	return list;
};
oFF.SxJsonDpBindingProvider.prototype.getReceiverProtocolBindings = function(type)
{
	var list = oFF.XList.create();
	list.add(oFF.ProtocolBindingType.STRING);
	return list;
};
oFF.SxJsonDpBindingProvider.prototype.newSenderBinding = function(type, protocol)
{
	return oFF.SxJsonDpBindingSender.create(this.m_dp, this.m_path);
};
oFF.SxJsonDpBindingProvider.prototype.newReceiverBinding = function(type, protocol)
{
	return oFF.SxJsonDpBindingReceiver.create(this.m_dp, this.m_path);
};

oFF.SxRestDp = function() {};
oFF.SxRestDp.prototype = new oFF.XObject();
oFF.SxRestDp.prototype._ff_c = "SxRestDp";

oFF.SxRestDp.prototype.m_structure = null;
oFF.SxRestDp.prototype.m_name = null;
oFF.SxRestDp.prototype.m_httpClient = null;
oFF.SxRestDp.prototype.m_application = null;
oFF.SxRestDp.prototype.m_tagging = null;
oFF.SxRestDp.prototype.m_dataRetrieved = false;
oFF.SxRestDp.prototype.m_dataUpdateListener = null;
oFF.SxRestDp.prototype.setupExt = function(name, endpointUrl, application)
{
	this.setup();
	this.m_application = application;
	this.m_dataRetrieved = false;
	this.m_structure = oFF.PrStructure.create();
	this.setDataProviderName(name);
	this.setEndpointUrl(endpointUrl);
	this.m_application.registerDataProvider(this);
};
oFF.SxRestDp.prototype.releaseObject = function()
{
	this.m_application.unregisterDataProvider(this);
	this.m_application = null;
	this.m_httpClient = oFF.XObjectExt.release(this.m_httpClient);
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.SxRestDp.prototype.getComponentType = function()
{
	return oFF.QuasarComponentType.REST_DATA_PROVIDER;
};
oFF.SxRestDp.prototype.getTagging = function()
{
	return this.m_tagging;
};
oFF.SxRestDp.prototype.getDataProviderName = function()
{
	return this.m_name;
};
oFF.SxRestDp.prototype.setDataProviderName = function(name)
{
	this.m_name = name;
};
oFF.SxRestDp.prototype.isDataReady = function()
{
	return this.m_dataRetrieved;
};
oFF.SxRestDp.prototype.registerDataUpdate = function(listener)
{
	this.m_dataUpdateListener = listener;
};
oFF.SxRestDp.prototype.setEndpointUrl = function(endpointUrl)
{
	if (oFF.XStringUtils.isNotNullAndNotEmpty(endpointUrl))
	{
		var endpointUri = oFF.XUri.createFromUrl(endpointUrl);
		if (oFF.notNull(endpointUri))
		{
			this.m_httpClient = oFF.HttpClientFactory.newInstanceByConnection(this.m_application.getSession(), endpointUri);
			if (oFF.notNull(this.m_httpClient))
			{
				var request = this.m_httpClient.getRequest();
				request.setFromUri(endpointUri);
				request.setCorsSecured(false);
			}
		}
	}
};
oFF.SxRestDp.prototype.updateData = function()
{
	if (oFF.notNull(this.m_httpClient))
	{
		this.m_httpClient.processHttpRequest(oFF.SyncType.NON_BLOCKING, this, null);
	}
};
oFF.SxRestDp.prototype.onHttpResponse = function(extResult, response, customIdentifier)
{
	if (extResult.isValid())
	{
		var data = extResult.getData();
		if (oFF.notNull(data))
		{
			var jsonContent = data.getJsonContent();
			if (oFF.notNull(jsonContent))
			{
				this.m_structure = jsonContent.asStructure();
				this.m_dataRetrieved = true;
				if (oFF.notNull(this.m_dataUpdateListener))
				{
					this.m_dataUpdateListener.onRestDataUpdate(this.m_structure, null);
				}
			}
		}
	}
};
oFF.SxRestDp.prototype.getElementByPath = function(path)
{
	var pathFragments = oFF.XStringTokenizer.splitString(path, "/");
	var currentElement = this.m_structure;
	var i = 0;
	for (; i < pathFragments.size() && oFF.notNull(currentElement); i++)
	{
		var name = pathFragments.get(i);
		var type = currentElement.getType();
		if (type === oFF.PrElementType.LIST)
		{
			var currentList = currentElement;
			var index = this.convertArray(name);
			if (index >= 0 && index < currentList.size())
			{
				currentElement = currentList.get(index);
			}
			else
			{
				currentElement = null;
			}
		}
		else if (type === oFF.PrElementType.STRUCTURE)
		{
			var currentStructure = currentElement;
			currentElement = currentStructure.getByKey(name);
		}
		else
		{
			currentElement = null;
		}
	}
	var found = null;
	if (i === pathFragments.size() && oFF.notNull(currentElement))
	{
		found = currentElement;
	}
	return found;
};
oFF.SxRestDp.prototype.setElementByPath = function(path, element)
{
	var name;
	var type;
	var currentList;
	var currentStructure;
	var index;
	var pathFragments = oFF.XStringTokenizer.splitString(path, "/");
	var currentElement = this.m_structure;
	var i = 0;
	for (; i < pathFragments.size() - 1 && oFF.notNull(currentElement); i++)
	{
		name = pathFragments.get(i);
		type = currentElement.getType();
		if (type === oFF.PrElementType.LIST)
		{
			currentList = currentElement;
			index = this.convertArray(name);
			if (index >= 0 && index < currentList.size())
			{
				currentElement = currentList.get(index);
			}
			else
			{
				currentElement = null;
			}
		}
		else if (type === oFF.PrElementType.STRUCTURE)
		{
			currentStructure = currentElement;
			currentElement = currentStructure.getByKey(name);
		}
		else
		{
			currentElement = null;
		}
	}
	if (oFF.notNull(currentElement))
	{
		name = pathFragments.get(i);
		type = currentElement.getType();
		if (type === oFF.PrElementType.LIST)
		{
			currentList = currentElement;
			index = this.convertArray(name);
			if (index >= 0 && index < currentList.size())
			{
				currentElement = currentList.get(index);
			}
			else
			{
				currentElement = null;
			}
		}
		else if (type === oFF.PrElementType.STRUCTURE)
		{
			currentStructure = currentElement;
			currentElement = currentStructure.getByKey(name);
		}
	}
};
oFF.SxRestDp.prototype.convertArray = function(name)
{
	var index = -1;
	if (oFF.XString.startsWith(name, "(") && oFF.XString.endsWith(name, " )"))
	{
		var size = oFF.XString.size(name);
		var indexValue = oFF.XString.substring(name, 1, size - 2);
		index = oFF.XInteger.convertFromStringWithDefault(indexValue, -1);
	}
	return index;
};

oFF.SxRestDpBindingFactory = function() {};
oFF.SxRestDpBindingFactory.prototype = new oFF.DpBindingFactory();
oFF.SxRestDpBindingFactory.prototype._ff_c = "SxRestDpBindingFactory";

oFF.SxRestDpBindingFactory.staticSetupJsonBindingFactory = function()
{
	oFF.DpBindingFactory.registerFactory(oFF.QuasarComponentType.REST_DATA_PROVIDER, new oFF.SxRestDpBindingFactory());
};
oFF.SxRestDpBindingFactory.prototype.newBindingProvider = function(component, path)
{
	var dp = component;
	return oFF.SxRestDpBindingProvider.create(dp, path);
};

oFF.SxRestDpBindingProvider = function() {};
oFF.SxRestDpBindingProvider.prototype = new oFF.XObject();
oFF.SxRestDpBindingProvider.prototype._ff_c = "SxRestDpBindingProvider";

oFF.SxRestDpBindingProvider.create = function(dp, path)
{
	var newObject = new oFF.SxRestDpBindingProvider();
	newObject.m_dp = dp;
	newObject.m_path = path;
	return newObject;
};
oFF.SxRestDpBindingProvider.prototype.m_dp = null;
oFF.SxRestDpBindingProvider.prototype.m_path = null;
oFF.SxRestDpBindingProvider.prototype.getSenderBindings = function()
{
	var list = oFF.XList.create();
	list.add(oFF.SemanticBindingType.STRING);
	return list;
};
oFF.SxRestDpBindingProvider.prototype.getReceiverBindings = function()
{
	var list = oFF.XList.create();
	list.add(oFF.SemanticBindingType.STRING);
	return list;
};
oFF.SxRestDpBindingProvider.prototype.getSenderProtocolBindings = function(type)
{
	var list = oFF.XList.create();
	list.add(oFF.ProtocolBindingType.STRING);
	return list;
};
oFF.SxRestDpBindingProvider.prototype.getReceiverProtocolBindings = function(type)
{
	var list = oFF.XList.create();
	list.add(oFF.ProtocolBindingType.STRING);
	return list;
};
oFF.SxRestDpBindingProvider.prototype.newSenderBinding = function(type, protocol)
{
	return oFF.SxRestDpBindingSender.create(this.m_dp, this.m_path);
};
oFF.SxRestDpBindingProvider.prototype.newReceiverBinding = function(type, protocol)
{
	return null;
};

oFF.SiToken = function() {};
oFF.SiToken.prototype = new oFF.XObject();
oFF.SiToken.prototype._ff_c = "SiToken";

oFF.SiToken.create = function(type)
{
	return oFF.SiToken.createExt(type, -1, null, null);
};
oFF.SiToken.createWithValue = function(type, value)
{
	return oFF.SiToken.createExt(type, -1, value, null);
};
oFF.SiToken.createExt = function(type, operatorLevel, value, children)
{
	var newObj = new oFF.SiToken();
	newObj.m_type = type;
	if (operatorLevel !== -1)
	{
		newObj.m_operatorLevel = operatorLevel;
	}
	else
	{
		newObj.m_operatorLevel = type.getOperatorLevel();
	}
	newObj.m_value = value;
	newObj.m_children = children;
	return newObj;
};
oFF.SiToken.prototype.m_type = null;
oFF.SiToken.prototype.m_value = null;
oFF.SiToken.prototype.m_children = null;
oFF.SiToken.prototype.m_operatorLevel = 0;
oFF.SiToken.prototype.add = function(token)
{
	if (oFF.isNull(this.m_children))
	{
		this.m_children = oFF.XList.create();
	}
	this.m_children.add(token);
	return this;
};
oFF.SiToken.prototype.getType = function()
{
	return this.m_type;
};
oFF.SiToken.prototype.isEmpty = function()
{
	return oFF.isNull(this.m_children) || this.m_children.size() === 0;
};
oFF.SiToken.prototype.hasElements = function()
{
	return this.isEmpty() === false;
};
oFF.SiToken.prototype.size = function()
{
	if (oFF.isNull(this.m_children))
	{
		return 0;
	}
	return this.m_children.size();
};
oFF.SiToken.prototype.getChildren = function()
{
	return this.m_children;
};
oFF.SiToken.prototype.getChild = function()
{
	if (oFF.notNull(this.m_children) && this.m_children.size() === 1)
	{
		return this.m_children.get(0);
	}
	return null;
};
oFF.SiToken.prototype.getLeft = function()
{
	if (oFF.notNull(this.m_children) && this.m_children.size() > 0)
	{
		return this.m_children.get(0);
	}
	return null;
};
oFF.SiToken.prototype.getRight = function()
{
	if (oFF.notNull(this.m_children) && this.m_children.size() > 1)
	{
		return this.m_children.get(1);
	}
	return null;
};
oFF.SiToken.prototype.setChildren = function(children)
{
	this.m_children = children;
};
oFF.SiToken.prototype.getValue = function()
{
	return this.m_value;
};
oFF.SiToken.prototype.setValue = function(value)
{
	this.m_value = value;
};
oFF.SiToken.prototype.getOperatorLevel = function()
{
	return this.m_operatorLevel;
};
oFF.SiToken.prototype.toClassicString = function()
{
	var buffer = oFF.XStringBuffer.create();
	if (this.m_type === oFF.SiTokenType.ROUND_BRACKET)
	{
		buffer.append("(");
	}
	else
	{
		buffer.append(this.m_type.getName());
		if (oFF.notNull(this.m_value))
		{
			buffer.append(":");
			buffer.append(this.m_value);
		}
	}
	if (oFF.notNull(this.m_children))
	{
		buffer.append("[");
		for (var i = 0; i < this.m_children.size(); i++)
		{
			if (i > 0)
			{
				buffer.append(", ");
			}
			buffer.append(this.m_children.get(i).toClassicString());
		}
		buffer.append("]");
	}
	if (this.m_type === oFF.SiTokenType.ROUND_BRACKET)
	{
		buffer.append(")");
	}
	return buffer.toString();
};
oFF.SiToken.prototype.toJson = function()
{
	var buffer = oFF.XStringBufferJson.create();
	this.toJsonInternal(buffer);
	return buffer.toString();
};
oFF.SiToken.prototype.toJsonInternal = function(buffer)
{
	if (this.m_type !== oFF.SiTokenType.ROUND_BRACKET)
	{
		buffer.openStructure();
		buffer.appendLabelAndString("Name", this.m_type.getName());
		if (oFF.notNull(this.m_value))
		{
			buffer.appendLabelAndString("Value", this.m_value);
		}
		if (oFF.notNull(this.m_children))
		{
			buffer.appendLabel("Children");
		}
	}
	if (oFF.notNull(this.m_children))
	{
		buffer.openArray();
		for (var i = 0; i < this.m_children.size(); i++)
		{
			var child = this.m_children.get(i);
			child.toJsonInternal(buffer);
		}
		buffer.closeArray();
	}
	if (this.m_type !== oFF.SiTokenType.ROUND_BRACKET)
	{
		buffer.closeStructure();
	}
	return buffer;
};
oFF.SiToken.prototype.write = function(writer)
{
	if (this.m_type === oFF.SiTokenType.EXPR_SEQ)
	{
		writer.writeExpressionSequence(this);
	}
	else if (this.m_type === oFF.SiTokenType.FUNCTION)
	{
		writer.writeFunction(this);
	}
	else if (this.m_type === oFF.SiTokenType.STRING)
	{
		writer.writeString(this);
	}
	else if (this.m_type === oFF.SiTokenType.INTEGER)
	{
		writer.writeInteger(this);
	}
	else if (this.m_type === oFF.SiTokenType.DOUBLE)
	{
		writer.writeDouble(this);
	}
	else if (this.m_type === oFF.SiTokenType.IDENTIFIER)
	{
		writer.writeIdentifier(this);
	}
	else if (this.m_type === oFF.SiTokenType.CURLY_BRACKET)
	{
		writer.writeBlock(this);
	}
	else if (this.m_type === oFF.SiTokenType.OP_DOT)
	{
		writer.writeOpDot(this);
	}
	else if (this.m_type === oFF.SiTokenType.OP_PLUS)
	{
		writer.writeOpPlus(this);
	}
	else if (this.m_type === oFF.SiTokenType.OP_MINUS)
	{
		writer.writeOpMinus(this);
	}
	else if (this.m_type === oFF.SiTokenType.OP_MULT)
	{
		writer.writeOpMult(this);
	}
	else if (this.m_type === oFF.SiTokenType.OP_DIV)
	{
		writer.writeOpDiv(this);
	}
	else if (this.m_type === oFF.SiTokenType.OP_LOWER)
	{
		writer.writeOpLower(this);
	}
	else if (this.m_type === oFF.SiTokenType.OP_LOWER_EQUAL)
	{
		writer.writeOpLowerEqual(this);
	}
	else if (this.m_type === oFF.SiTokenType.OP_GREATER)
	{
		writer.writeOpGreater(this);
	}
	else if (this.m_type === oFF.SiTokenType.OP_GREATER_EQUAL)
	{
		writer.writeOpGreaterEqual(this);
	}
	else if (this.m_type === oFF.SiTokenType.OP_EQUAL)
	{
		writer.writeOpEqual(this);
	}
	else if (this.m_type === oFF.SiTokenType.OP_NOT_EQUAL)
	{
		writer.writeOpNotEqual(this);
	}
	else if (this.m_type === oFF.SiTokenType.OP_BOOL_AND)
	{
		writer.writeOpBoolAnd(this);
	}
	else if (this.m_type === oFF.SiTokenType.OP_BOOL_OR)
	{
		writer.writeOpBoolOr(this);
	}
	else if (this.m_type === oFF.SiTokenType.CONST_TRUE)
	{
		writer.writeTrue(this);
	}
	else if (this.m_type === oFF.SiTokenType.CONST_FALSE)
	{
		writer.writeFalse(this);
	}
	else
	{
		writer.writeDefault(this);
	}
};
oFF.SiToken.prototype.toString = function()
{
	return this.toClassicString();
};

oFF.UiBinding = function() {};
oFF.UiBinding.prototype = new oFF.XObject();
oFF.UiBinding.prototype._ff_c = "UiBinding";

oFF.UiBinding.prototype.m_context = null;
oFF.UiBinding.prototype.setupExt = function(context)
{
	this.m_context = oFF.XWeakReferenceUtil.getWeakRef(context);
};
oFF.UiBinding.prototype.releaseObject = function()
{
	this.m_context = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.UiBinding.prototype.isReceiverReady = function()
{
	return true;
};
oFF.UiBinding.prototype.registerReceiverReadyListener = function(listener, customIdentifier) {};
oFF.UiBinding.prototype.unregisterReceiverReadyListener = function(listener) {};
oFF.UiBinding.prototype.getUiContext = function()
{
	return oFF.XWeakReferenceUtil.getHardRef(this.m_context);
};

oFF.UiBindingFactory = function() {};
oFF.UiBindingFactory.prototype = new oFF.DpBindingFactory();
oFF.UiBindingFactory.prototype._ff_c = "UiBindingFactory";

oFF.UiBindingFactory.staticSetupUiBindingFactory = function()
{
	oFF.DpBindingFactory.registerFactory(oFF.UiComponentType.UI_CONTROL, new oFF.UiBindingFactory());
};
oFF.UiBindingFactory.prototype.newBindingProvider = function(component, path)
{
	if (oFF.XStringUtils.isNullOrEmpty(path))
	{
		return oFF.UiBindingProviderForStd.create(component, path);
	}
	else
	{
		return oFF.UiBindingProviderForAttributes.create(component, path);
	}
};

oFF.UiBindingProviderForAttributes = function() {};
oFF.UiBindingProviderForAttributes.prototype = new oFF.XObject();
oFF.UiBindingProviderForAttributes.prototype._ff_c = "UiBindingProviderForAttributes";

oFF.UiBindingProviderForAttributes.create = function(component, path)
{
	var newObj = new oFF.UiBindingProviderForAttributes();
	newObj.m_component = component;
	newObj.m_path = path;
	if (oFF.XString.isEqual(oFF.UiAggregation.ITEMS.getName(), path))
	{
		newObj.m_getterProperty = new oFF.UiClientPropItems();
		newObj.m_setterProperty = new oFF.UiClientPropItems();
	}
	else
	{
		newObj.m_getterProperty = oFF.UiAllOperations.lookupGetterProperty(path);
		newObj.m_setterProperty = oFF.UiAllOperations.lookupSetterProperty(path);
	}
	return newObj;
};
oFF.UiBindingProviderForAttributes.prototype.m_component = null;
oFF.UiBindingProviderForAttributes.prototype.m_path = null;
oFF.UiBindingProviderForAttributes.prototype.m_getterProperty = null;
oFF.UiBindingProviderForAttributes.prototype.m_setterProperty = null;
oFF.UiBindingProviderForAttributes.prototype.getSenderBindings = function()
{
	var list = oFF.XList.create();
	var componentType = this.m_getterProperty.getComponentType();
	if (oFF.notNull(componentType))
	{
		if (componentType.isTypeOf(oFF.UiComponentType.UI_PROPERTY_OP_STRING))
		{
			list.add(oFF.SemanticBindingType.STRING);
		}
		else if (componentType.isTypeOf(oFF.UiComponentType.UI_PROPERTY_OP_JSON))
		{
			list.add(oFF.SemanticBindingType.JSON);
		}
	}
	return list;
};
oFF.UiBindingProviderForAttributes.prototype.getReceiverBindings = function()
{
	var list = oFF.XList.create();
	var componentType = this.m_setterProperty.getComponentType();
	if (oFF.notNull(componentType))
	{
		if (componentType.isTypeOf(oFF.UiComponentType.UI_PROPERTY_OP_STRING))
		{
			list.add(oFF.SemanticBindingType.STRING);
		}
		else if (componentType.isTypeOf(oFF.UiComponentType.UI_PROPERTY_OP_JSON))
		{
			list.add(oFF.SemanticBindingType.JSON);
		}
	}
	return list;
};
oFF.UiBindingProviderForAttributes.prototype.getSenderProtocolBindings = function(type)
{
	var list = oFF.XList.create();
	var componentType = this.m_getterProperty.getComponentType();
	if (oFF.notNull(componentType))
	{
		if (componentType.isTypeOf(oFF.UiComponentType.UI_PROPERTY_OP_STRING))
		{
			list.add(oFF.ProtocolBindingType.STRING);
		}
		else if (componentType.isTypeOf(oFF.UiComponentType.UI_PROPERTY_OP_JSON))
		{
			list.add(oFF.ProtocolBindingType.JSON);
		}
	}
	return list;
};
oFF.UiBindingProviderForAttributes.prototype.getReceiverProtocolBindings = function(type)
{
	var list = oFF.XList.create();
	var componentType = this.m_setterProperty.getComponentType();
	if (oFF.notNull(componentType))
	{
		if (componentType.isTypeOf(oFF.UiComponentType.UI_PROPERTY_OP_STRING))
		{
			list.add(oFF.ProtocolBindingType.STRING);
		}
		else if (componentType.isTypeOf(oFF.UiComponentType.UI_PROPERTY_OP_JSON))
		{
			list.add(oFF.ProtocolBindingType.JSON);
		}
	}
	return list;
};
oFF.UiBindingProviderForAttributes.prototype.newSenderBinding = function(type, protocol)
{
	var sender = null;
	if (protocol === oFF.ProtocolBindingType.STRING)
	{
		sender = oFF.UiBindingSendPropString.create(this.m_component, this.m_getterProperty);
	}
	else if (protocol === oFF.ProtocolBindingType.JSON)
	{
		sender = oFF.UiBindingSendPropJson.create(this.m_component, this.m_getterProperty);
	}
	return sender;
};
oFF.UiBindingProviderForAttributes.prototype.newReceiverBinding = function(type, protocol)
{
	var receiver = null;
	if (protocol === oFF.ProtocolBindingType.STRING)
	{
		receiver = oFF.UiBindingReceivePropString.create(this.m_component, this.m_setterProperty);
	}
	else if (protocol === oFF.ProtocolBindingType.JSON)
	{
		receiver = oFF.UiBindingReceivePropJson.create(this.m_component, this.m_setterProperty);
	}
	return receiver;
};
oFF.UiBindingProviderForAttributes.prototype.toString = function()
{
	return this.m_path;
};

oFF.UiBindingProviderForStd = function() {};
oFF.UiBindingProviderForStd.prototype = new oFF.XObject();
oFF.UiBindingProviderForStd.prototype._ff_c = "UiBindingProviderForStd";

oFF.UiBindingProviderForStd.create = function(component, path)
{
	var newObj = new oFF.UiBindingProviderForStd();
	newObj.m_component = component;
	newObj.m_path = path;
	return newObj;
};
oFF.UiBindingProviderForStd.prototype.m_component = null;
oFF.UiBindingProviderForStd.prototype.m_path = null;
oFF.UiBindingProviderForStd.prototype.getSenderBindings = function()
{
	var context = this.m_component;
	return context.getUiType().getSenderBindings();
};
oFF.UiBindingProviderForStd.prototype.getReceiverBindings = function()
{
	var context = this.m_component;
	return context.getUiType().getReceiverBindings();
};
oFF.UiBindingProviderForStd.prototype.getSenderProtocolBindings = function(type)
{
	var context = this.m_component;
	return context.getUiType().getSenderProtocolBindings(type);
};
oFF.UiBindingProviderForStd.prototype.getReceiverProtocolBindings = function(type)
{
	var context = this.m_component;
	return context.getUiType().getReceiverProtocolBindings(type);
};
oFF.UiBindingProviderForStd.prototype.newSenderBinding = function(type, protocol)
{
	var context = this.m_component;
	if (type === oFF.SemanticBindingType.STRING)
	{
		return oFF.UiBindingSendText.create(context);
	}
	return null;
};
oFF.UiBindingProviderForStd.prototype.newReceiverBinding = function(type, protocol)
{
	var context = this.m_component;
	if (type.isTypeOf(oFF.SemanticBindingType.STRING))
	{
		return oFF.UiBindingReceiveText.create(context);
	}
	else if (type.isTypeOf(oFF.SemanticBindingType.JSON))
	{
		return oFF.UiBindingReceiveJson.create(context);
	}
	else
	{
		return null;
	}
};
oFF.UiBindingProviderForStd.prototype.toString = function()
{
	return this.m_path;
};

oFF.UiPrgContainerFactory = function() {};
oFF.UiPrgContainerFactory.prototype = new oFF.ProgramContainerFactory();
oFF.UiPrgContainerFactory.prototype._ff_c = "UiPrgContainerFactory";

oFF.UiPrgContainerFactory.staticSetupUiContainerFactory = function()
{
	oFF.ProgramContainerFactory.registerFactory(oFF.ProgramContainerType.CONSOLE, new oFF.UiPrgContainerFactory());
	oFF.ProgramContainerFactory.registerFactory(oFF.ProgramContainerType.WINDOW, new oFF.UiPrgContainerFactory());
	oFF.ProgramContainerFactory.registerFactory(oFF.ProgramContainerType.DIALOG, new oFF.UiPrgContainerFactory());
	oFF.ProgramContainerFactory.registerFactory(oFF.ProgramContainerType.STANDALONE, new oFF.UiPrgContainerFactory());
	oFF.ProgramContainerFactory.registerFactory(oFF.ProgramContainerType.CONTENT, new oFF.UiPrgContainerFactory());
};
oFF.UiPrgContainerFactory.prototype.newProgramContainer = function(containerType)
{
	var container = null;
	if (containerType === oFF.ProgramContainerType.CONSOLE)
	{
		container = oFF.UiPrgContainerTerminal.createExt(null, null);
	}
	else if (containerType === oFF.ProgramContainerType.WINDOW)
	{
		container = oFF.UiPrgContainerWindow.createExt(null, null);
	}
	else if (containerType === oFF.ProgramContainerType.DIALOG)
	{
		container = oFF.UiPrgContainerDialog.createExt(null, null);
	}
	else if (containerType === oFF.ProgramContainerType.STANDALONE)
	{
		container = oFF.UiPrgContainerStandalone.createExt(null, null);
	}
	else if (containerType === oFF.ProgramContainerType.CONTENT)
	{
		container = oFF.UiPrgContainerContent.createExt(null, null);
	}
	return container;
};

oFF.SxJsonDpBindingReceiver = function() {};
oFF.SxJsonDpBindingReceiver.prototype = new oFF.XObject();
oFF.SxJsonDpBindingReceiver.prototype._ff_c = "SxJsonDpBindingReceiver";

oFF.SxJsonDpBindingReceiver.create = function(dp, path)
{
	var receiver = new oFF.SxJsonDpBindingReceiver();
	receiver.m_dp = dp;
	receiver.m_path = path;
	return receiver;
};
oFF.SxJsonDpBindingReceiver.prototype.m_dp = null;
oFF.SxJsonDpBindingReceiver.prototype.m_path = null;
oFF.SxJsonDpBindingReceiver.prototype.getComponentType = function()
{
	return oFF.IoComponentType.BINDING_RECEIVER;
};
oFF.SxJsonDpBindingReceiver.prototype.isReceiverReady = function()
{
	return true;
};
oFF.SxJsonDpBindingReceiver.prototype.registerReceiverReadyListener = function(listener, customIdentifier) {};
oFF.SxJsonDpBindingReceiver.prototype.unregisterReceiverReadyListener = function(listener) {};
oFF.SxJsonDpBindingReceiver.prototype.setDataManifest = function(dataManifest) {};
oFF.SxJsonDpBindingReceiver.prototype.setElement = function(element)
{
	this.m_dp.setElementByPath(this.m_path, element);
};
oFF.SxJsonDpBindingReceiver.prototype.setString = function(value)
{
	var element = oFF.PrFactory.createString(value);
	this.setElement(element);
};
oFF.SxJsonDpBindingReceiver.prototype.getString = function()
{
	var element = this.m_dp.getElementByPath(this.m_path);
	if (oFF.notNull(element))
	{
		var type = element.getType();
		if (type === oFF.PrElementType.STRING)
		{
			return element.getString();
		}
	}
	return null;
};
oFF.SxJsonDpBindingReceiver.prototype.setInteger = function(value)
{
	var element = oFF.PrFactory.createInteger(value);
	this.setElement(element);
};
oFF.SxJsonDpBindingReceiver.prototype.getInteger = function()
{
	var element = this.m_dp.getElementByPath(this.m_path);
	if (oFF.notNull(element))
	{
		var type = element.getType();
		if (type === oFF.PrElementType.INTEGER)
		{
			return element.getInteger();
		}
	}
	return 0;
};

oFF.SxJsonDpBindingSender = function() {};
oFF.SxJsonDpBindingSender.prototype = new oFF.XObject();
oFF.SxJsonDpBindingSender.prototype._ff_c = "SxJsonDpBindingSender";

oFF.SxJsonDpBindingSender.create = function(dp, path)
{
	var sender = new oFF.SxJsonDpBindingSender();
	sender.m_dp = dp;
	sender.m_path = path;
	return sender;
};
oFF.SxJsonDpBindingSender.prototype.m_dp = null;
oFF.SxJsonDpBindingSender.prototype.m_path = null;
oFF.SxJsonDpBindingSender.prototype.getComponentType = function()
{
	return oFF.IoComponentType.BINDING_SENDER;
};
oFF.SxJsonDpBindingSender.prototype.isSenderValueReady = function()
{
	return true;
};
oFF.SxJsonDpBindingSender.prototype.registerValueChangedListener = function(listener, customIdentifier) {};
oFF.SxJsonDpBindingSender.prototype.unregisterValueChangedListener = function(listener) {};
oFF.SxJsonDpBindingSender.prototype.processSenderUpdate = function() {};
oFF.SxJsonDpBindingSender.prototype.getDataManifest = function()
{
	return null;
};
oFF.SxJsonDpBindingSender.prototype.getElement = function()
{
	return this.m_dp.getElementByPath(this.m_path);
};
oFF.SxJsonDpBindingSender.prototype.getInteger = function()
{
	var element = this.getElement();
	if (oFF.notNull(element) && element.getType() === oFF.PrElementType.INTEGER)
	{
		return element.getInteger();
	}
	return 0;
};
oFF.SxJsonDpBindingSender.prototype.getString = function()
{
	var element = this.getElement();
	if (oFF.notNull(element) && element.getType() === oFF.PrElementType.STRING)
	{
		return element.getString();
	}
	return null;
};

oFF.SxRestDpBindingSender = function() {};
oFF.SxRestDpBindingSender.prototype = new oFF.XObject();
oFF.SxRestDpBindingSender.prototype._ff_c = "SxRestDpBindingSender";

oFF.SxRestDpBindingSender.create = function(dp, path)
{
	var sender = new oFF.SxRestDpBindingSender();
	sender.m_dp = dp;
	sender.m_path = path;
	dp.registerDataUpdate(sender);
	return sender;
};
oFF.SxRestDpBindingSender.prototype.m_dp = null;
oFF.SxRestDpBindingSender.prototype.m_path = null;
oFF.SxRestDpBindingSender.prototype.m_valueChangedListener = null;
oFF.SxRestDpBindingSender.prototype.getComponentType = function()
{
	return oFF.IoComponentType.BINDING_SENDER;
};
oFF.SxRestDpBindingSender.prototype.isSenderValueReady = function()
{
	return this.m_dp.isDataReady();
};
oFF.SxRestDpBindingSender.prototype.registerValueChangedListener = function(listener, customIdentifier)
{
	this.m_valueChangedListener = listener;
};
oFF.SxRestDpBindingSender.prototype.unregisterValueChangedListener = function(listener) {};
oFF.SxRestDpBindingSender.prototype.processSenderUpdate = function()
{
	this.m_dp.updateData();
};
oFF.SxRestDpBindingSender.prototype.getDataManifest = function()
{
	return null;
};
oFF.SxRestDpBindingSender.prototype.getElement = function()
{
	return this.m_dp.getElementByPath(this.m_path);
};
oFF.SxRestDpBindingSender.prototype.getInteger = function()
{
	var element = this.getElement();
	if (oFF.notNull(element) && element.getType() === oFF.PrElementType.INTEGER)
	{
		return element.getInteger();
	}
	return 0;
};
oFF.SxRestDpBindingSender.prototype.getString = function()
{
	var element = this.getElement();
	if (oFF.notNull(element))
	{
		if (element.getType() === oFF.PrElementType.STRING)
		{
			return element.getString();
		}
		else
		{
			var convertedToString = element.asString();
			if (oFF.notNull(convertedToString))
			{
				return convertedToString.getString();
			}
		}
	}
	return null;
};
oFF.SxRestDpBindingSender.prototype.onRestDataUpdate = function(restData, customIdentifier)
{
	if (oFF.notNull(this.m_valueChangedListener))
	{
		this.m_valueChangedListener.onSenderValueChanged(this, null);
	}
};

oFF.UiBindingReceiveJson = function() {};
oFF.UiBindingReceiveJson.prototype = new oFF.UiBinding();
oFF.UiBindingReceiveJson.prototype._ff_c = "UiBindingReceiveJson";

oFF.UiBindingReceiveJson.create = function(context)
{
	var newObj = new oFF.UiBindingReceiveJson();
	newObj.setupExt(context);
	return newObj;
};
oFF.UiBindingReceiveJson.prototype.getComponentType = function()
{
	return oFF.IoComponentType.BINDING_RECEIVER;
};
oFF.UiBindingReceiveJson.prototype.setElement = function(element)
{
	var uiContext = this.getUiContext();
	if (oFF.notNull(uiContext))
	{
		uiContext.setModelJson(element);
	}
};
oFF.UiBindingReceiveJson.prototype.setDataManifest = function(dataManifest)
{
	var uiContext = this.getUiContext();
	if (oFF.notNull(uiContext))
	{
		uiContext.setDataManifest(dataManifest);
	}
};

oFF.UiBindingReceivePropJson = function() {};
oFF.UiBindingReceivePropJson.prototype = new oFF.UiBinding();
oFF.UiBindingReceivePropJson.prototype._ff_c = "UiBindingReceivePropJson";

oFF.UiBindingReceivePropJson.create = function(context, clientOp)
{
	var newObj = new oFF.UiBindingReceivePropJson();
	newObj.setupExt(context);
	newObj.m_clientOp = clientOp;
	return newObj;
};
oFF.UiBindingReceivePropJson.prototype.m_clientOp = null;
oFF.UiBindingReceivePropJson.prototype.getComponentType = function()
{
	return oFF.IoComponentType.BINDING_RECEIVER;
};
oFF.UiBindingReceivePropJson.prototype.setElement = function(element)
{
	var uiContext = this.getUiContext();
	if (oFF.notNull(uiContext) && oFF.notNull(this.m_clientOp))
	{
		this.m_clientOp.setJsonValue(uiContext, element);
	}
};
oFF.UiBindingReceivePropJson.prototype.setDataManifest = function(dataManifest) {};

oFF.UiBindingReceivePropString = function() {};
oFF.UiBindingReceivePropString.prototype = new oFF.UiBinding();
oFF.UiBindingReceivePropString.prototype._ff_c = "UiBindingReceivePropString";

oFF.UiBindingReceivePropString.create = function(context, clientOp)
{
	var newObj = new oFF.UiBindingReceivePropString();
	newObj.setupExt(context);
	newObj.m_clientOp = clientOp;
	return newObj;
};
oFF.UiBindingReceivePropString.prototype.m_clientOp = null;
oFF.UiBindingReceivePropString.prototype.getComponentType = function()
{
	return oFF.IoComponentType.BINDING_RECEIVER;
};
oFF.UiBindingReceivePropString.prototype.setString = function(value)
{
	var uiContext = this.getUiContext();
	if (oFF.notNull(uiContext) && oFF.notNull(this.m_clientOp))
	{
		this.m_clientOp.setString(uiContext, value);
	}
};
oFF.UiBindingReceivePropString.prototype.getString = function()
{
	var uiContext = this.getUiContext();
	if (oFF.isNull(uiContext))
	{
		return null;
	}
	return this.m_clientOp.getString(uiContext);
};
oFF.UiBindingReceivePropString.prototype.setDataManifest = function(dataManifest) {};

oFF.UiBindingReceiveText = function() {};
oFF.UiBindingReceiveText.prototype = new oFF.UiBinding();
oFF.UiBindingReceiveText.prototype._ff_c = "UiBindingReceiveText";

oFF.UiBindingReceiveText.create = function(context)
{
	var newObj = new oFF.UiBindingReceiveText();
	newObj.setupExt(context);
	return newObj;
};
oFF.UiBindingReceiveText.prototype.getComponentType = function()
{
	return oFF.IoComponentType.BINDING_RECEIVER;
};
oFF.UiBindingReceiveText.prototype.setString = function(value)
{
	var uiContext = this.getUiContext();
	if (oFF.notNull(uiContext))
	{
		uiContext.setText(value);
	}
};
oFF.UiBindingReceiveText.prototype.getString = function()
{
	var uiContext = this.getUiContext();
	if (oFF.isNull(uiContext))
	{
		return null;
	}
	return uiContext.getText();
};
oFF.UiBindingReceiveText.prototype.setDataManifest = function(dataManifest) {};

oFF.UiBindingSendPropJson = function() {};
oFF.UiBindingSendPropJson.prototype = new oFF.XObject();
oFF.UiBindingSendPropJson.prototype._ff_c = "UiBindingSendPropJson";

oFF.UiBindingSendPropJson.create = function(context, clientOp)
{
	var newObj = new oFF.UiBindingSendPropJson();
	newObj.m_context = context;
	newObj.m_clientOp = clientOp;
	return newObj;
};
oFF.UiBindingSendPropJson.prototype.m_context = null;
oFF.UiBindingSendPropJson.prototype.m_listener = null;
oFF.UiBindingSendPropJson.prototype.m_customIdentifier = null;
oFF.UiBindingSendPropJson.prototype.m_clientOp = null;
oFF.UiBindingSendPropJson.prototype.releaseObject = function()
{
	this.m_context = null;
	this.m_listener = null;
	this.m_customIdentifier = null;
	this.m_clientOp = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.UiBindingSendPropJson.prototype.getComponentType = function()
{
	return oFF.IoComponentType.BINDING_SENDER;
};
oFF.UiBindingSendPropJson.prototype.isSenderValueReady = function()
{
	return true;
};
oFF.UiBindingSendPropJson.prototype.registerValueChangedListener = function(listener, customIdentifier)
{
	this.m_listener = listener;
	this.m_customIdentifier = customIdentifier;
	this.m_context.registerOnChange(this);
};
oFF.UiBindingSendPropJson.prototype.unregisterValueChangedListener = function(listener)
{
	this.m_context.registerOnChange(null);
	this.m_listener = null;
	this.m_customIdentifier = null;
};
oFF.UiBindingSendPropJson.prototype.onChange = function(event)
{
	if (oFF.notNull(this.m_listener))
	{
		this.m_listener.onSenderValueChanged(this, this.m_customIdentifier);
	}
};
oFF.UiBindingSendPropJson.prototype.processSenderUpdate = function() {};
oFF.UiBindingSendPropJson.prototype.getDataManifest = function()
{
	return null;
};
oFF.UiBindingSendPropJson.prototype.getElement = function()
{
	var jsonValue = this.m_clientOp.getJsonValue(this.m_context);
	return jsonValue;
};

oFF.UiBindingSendPropString = function() {};
oFF.UiBindingSendPropString.prototype = new oFF.XObject();
oFF.UiBindingSendPropString.prototype._ff_c = "UiBindingSendPropString";

oFF.UiBindingSendPropString.create = function(context, clientOp)
{
	var newObj = new oFF.UiBindingSendPropString();
	newObj.m_context = context;
	newObj.m_clientOp = clientOp;
	return newObj;
};
oFF.UiBindingSendPropString.prototype.m_context = null;
oFF.UiBindingSendPropString.prototype.m_listener = null;
oFF.UiBindingSendPropString.prototype.m_customIdentifier = null;
oFF.UiBindingSendPropString.prototype.m_clientOp = null;
oFF.UiBindingSendPropString.prototype.releaseObject = function()
{
	this.m_context = null;
	this.m_listener = null;
	this.m_customIdentifier = null;
	this.m_clientOp = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.UiBindingSendPropString.prototype.getComponentType = function()
{
	return oFF.IoComponentType.BINDING_SENDER;
};
oFF.UiBindingSendPropString.prototype.isSenderValueReady = function()
{
	return true;
};
oFF.UiBindingSendPropString.prototype.registerValueChangedListener = function(listener, customIdentifier)
{
	this.m_listener = listener;
	this.m_customIdentifier = customIdentifier;
	this.m_context.registerOnChange(this);
};
oFF.UiBindingSendPropString.prototype.unregisterValueChangedListener = function(listener)
{
	this.m_context.registerOnChange(null);
	this.m_listener = null;
	this.m_customIdentifier = null;
};
oFF.UiBindingSendPropString.prototype.onChange = function(event)
{
	if (oFF.notNull(this.m_listener))
	{
		this.m_listener.onSenderValueChanged(this, this.m_customIdentifier);
	}
};
oFF.UiBindingSendPropString.prototype.processSenderUpdate = function() {};
oFF.UiBindingSendPropString.prototype.getString = function()
{
	var value = this.m_clientOp.getString(this.m_context);
	return value;
};
oFF.UiBindingSendPropString.prototype.getDataManifest = function()
{
	return null;
};

oFF.UiBindingSendText = function() {};
oFF.UiBindingSendText.prototype = new oFF.XObject();
oFF.UiBindingSendText.prototype._ff_c = "UiBindingSendText";

oFF.UiBindingSendText.create = function(context)
{
	var newObj = new oFF.UiBindingSendText();
	newObj.m_context = context;
	return newObj;
};
oFF.UiBindingSendText.prototype.m_context = null;
oFF.UiBindingSendText.prototype.m_listener = null;
oFF.UiBindingSendText.prototype.m_customIdentifier = null;
oFF.UiBindingSendText.prototype.releaseObject = function()
{
	this.m_context = null;
	this.m_listener = null;
	this.m_customIdentifier = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.UiBindingSendText.prototype.getComponentType = function()
{
	return oFF.IoComponentType.BINDING_SENDER;
};
oFF.UiBindingSendText.prototype.isSenderValueReady = function()
{
	return true;
};
oFF.UiBindingSendText.prototype.registerValueChangedListener = function(listener, customIdentifier)
{
	this.m_listener = listener;
	this.m_customIdentifier = customIdentifier;
	this.m_context.registerOnChange(this);
};
oFF.UiBindingSendText.prototype.unregisterValueChangedListener = function(listener)
{
	this.m_context.registerOnChange(null);
	this.m_listener = null;
	this.m_customIdentifier = null;
};
oFF.UiBindingSendText.prototype.onChange = function(event)
{
	if (oFF.notNull(this.m_listener))
	{
		this.m_listener.onSenderValueChanged(this, this.m_customIdentifier);
	}
};
oFF.UiBindingSendText.prototype.processSenderUpdate = function() {};
oFF.UiBindingSendText.prototype.getString = function()
{
	return this.m_context.getText();
};
oFF.UiBindingSendText.prototype.getDataManifest = function()
{
	return null;
};

oFF.SiProject = function() {};
oFF.SiProject.prototype = new oFF.DfNameObject();
oFF.SiProject.prototype._ff_c = "SiProject";

oFF.SiProject.create = function(name)
{
	var newObj = new oFF.SiProject();
	newObj._setupInternal(name);
	return newObj;
};
oFF.SiProject.prototype.m_compilationUnits = null;
oFF.SiProject.prototype.setup = function()
{
	oFF.DfNameObject.prototype.setup.call( this );
	this.m_compilationUnits = oFF.XHashMapOfStringByString.create();
};
oFF.SiProject.prototype.load = function(file)
{
	var content = file.load();
	var code = content.getString();
	var name = file.getName();
	this.m_compilationUnits.put(name, code);
	this.logMulti("Parsing ").append(file.getNativePath()).flush();
	var parser = oFF.SiParser2.create();
	parser.parse(code, 10);
};

oFF.UiClientPropItems = function() {};
oFF.UiClientPropItems.prototype = new oFF.UiClientPropJson();
oFF.UiClientPropItems.prototype._ff_c = "UiClientPropItems";

oFF.UiClientPropItems.NAME = "Name";
oFF.UiClientPropItems.TEXT = "Text";
oFF.UiClientPropItems.SCRIPT = "Script";
oFF.UiClientPropItems.ITEMS = "Items";
oFF.UiClientPropItems.prototype.setJsonValue = function(target, value)
{
	if (value.isStructure() && target.hasAggregation(oFF.UiAggregation.ITEMS))
	{
		var root = value;
		target.clearItems();
		this.recursiveAdd(root, target);
	}
};
oFF.UiClientPropItems.prototype.recursiveAdd = function(parentStructure, parentUi)
{
	var children = parentStructure.getListByKey(oFF.UiClientPropItems.ITEMS);
	for (var i = 0; i < children.size(); i++)
	{
		var childStructure = children.get(i);
		var isNode = childStructure.containsKey(oFF.UiClientPropItems.ITEMS);
		var childUi = parentUi.addNewItem();
		if (oFF.notNull(childUi))
		{
			parentUi.add(childUi);
			var name = childStructure.getStringByKey(oFF.UiClientPropItems.NAME);
			childUi.setName(name);
			var text = childStructure.getStringByKey(oFF.UiClientPropItems.TEXT);
			childUi.setText(text);
			var script = childStructure.getStringByKey(oFF.UiClientPropItems.SCRIPT);
			if (oFF.notNull(script))
			{
				var eventScript = oFF.SxEventScripting.create(script);
				if (childUi.hasEvent(oFF.UiEvent.ON_PRESS))
				{
					childUi.registerOnPress(eventScript);
				}
				else if (childUi.hasEvent(oFF.UiEvent.ON_CLICK))
				{
					childUi.registerOnClick(eventScript);
				}
			}
			if (isNode)
			{
				this.recursiveAdd(childStructure, childUi);
			}
		}
	}
};
oFF.UiClientPropItems.prototype.getJsonValue = function(source)
{
	return null;
};

oFF.ScriptEngine = function() {};
oFF.ScriptEngine.prototype = new oFF.MessageManager();
oFF.ScriptEngine.prototype._ff_c = "ScriptEngine";

oFF.ScriptEngine.create = function()
{
	var interpreter = new oFF.ScriptEngine();
	interpreter.setupInterpreter(null, true);
	return interpreter;
};
oFF.ScriptEngine.prototype.m_virtualMachine = null;
oFF.ScriptEngine.prototype.m_useNewParser = false;
oFF.ScriptEngine.prototype.m_ast = null;
oFF.ScriptEngine.prototype.setupInterpreter = function(session, useNewParser)
{
	oFF.MessageManager.prototype.setupSessionContext.call( this , session);
	this.m_virtualMachine = oFF.SiInterpreter.create();
	this.m_useNewParser = useNewParser;
};
oFF.ScriptEngine.prototype.compileAndExecute = function(script)
{
	this.compile(script);
	this.execute();
};
oFF.ScriptEngine.prototype.execute = function()
{
	this.m_virtualMachine.execute();
};
oFF.ScriptEngine.prototype.compile = function(script)
{
	var parser;
	if (this.m_useNewParser)
	{
		parser = oFF.SiParser2.create();
	}
	else
	{
		parser = oFF.SiParser.create();
	}
	this.m_ast = parser.parse(script, -1);
	this.addAllMessages(parser);
	if (this.isValid())
	{
		this.m_virtualMachine.setRoot(this.m_ast);
	}
};
oFF.ScriptEngine.prototype.setVmCallback = function(callback)
{
	this.m_virtualMachine.setVmCallback(callback);
};
oFF.ScriptEngine.prototype.setCustomObject = function(name, value)
{
	this.m_virtualMachine.setCustomObject(name, value);
};
oFF.ScriptEngine.prototype.getCustomObject = function(name)
{
	return this.m_virtualMachine.getCustomObject(name);
};
oFF.ScriptEngine.prototype.setInitialRegister = function(obj)
{
	this.m_virtualMachine.setInitialRegister(obj);
};
oFF.ScriptEngine.prototype.getAstAsJson = function()
{
	if (this.isValid())
	{
		return this.m_virtualMachine.getAstAsJson();
	}
	return "";
};
oFF.ScriptEngine.prototype.getAstRoot = function()
{
	return this.m_ast;
};
oFF.ScriptEngine.prototype.getStateAsJson = function()
{
	return this.m_virtualMachine.getStateAsJson();
};
oFF.ScriptEngine.prototype.compileAllProjects = function(projectPath, outputPath)
{
	var session = oFF.DefaultSession.create();
	var file = oFF.XFile.createWithVars(session, projectPath);
	this.loadProjects(file);
};
oFF.ScriptEngine.prototype.loadProjects = function(file)
{
	if (file.isDirectory() === true)
	{
		var children = file.getChildren();
		for (var i = 0; i < children.size(); i++)
		{
			var childFile = children.get(i);
			var projectName = childFile.getName();
			var project = oFF.SiProject.create(projectName);
			var javaFolder = childFile.newChild("java");
			this.log(projectName);
			this.loadRecursive(project, javaFolder);
		}
	}
};
oFF.ScriptEngine.prototype.loadRecursive = function(project, file)
{
	if (file.isDirectory() === true)
	{
		var children = file.getChildren();
		for (var i = 0; i < children.size(); i++)
		{
			var childFile = children.get(i);
			this.loadRecursive(project, childFile);
		}
	}
	else
	{
		var name = file.getName();
		if (oFF.XString.endsWith(name, ".java"))
		{
			project.load(file);
		}
	}
};
oFF.ScriptEngine.prototype.toString = function()
{
	if (this.isValid())
	{
		return this.m_virtualMachine.toString();
	}
	return oFF.MessageManager.prototype.toString.call( this );
};

oFF.SiInterpreter = function() {};
oFF.SiInterpreter.prototype = new oFF.MessageManager();
oFF.SiInterpreter.prototype._ff_c = "SiInterpreter";

oFF.SiInterpreter.create = function()
{
	var interpreter = new oFF.SiInterpreter();
	interpreter.setupSessionContext(null);
	return interpreter;
};
oFF.SiInterpreter.prototype.m_callback = null;
oFF.SiInterpreter.prototype.m_registerHandler = null;
oFF.SiInterpreter.prototype.m_root = null;
oFF.SiInterpreter.prototype.m_customObjects = null;
oFF.SiInterpreter.prototype.m_variables = null;
oFF.SiInterpreter.prototype.m_stack = null;
oFF.SiInterpreter.prototype.m_register = null;
oFF.SiInterpreter.prototype.m_savedRegisters = null;
oFF.SiInterpreter.prototype.setupSessionContext = function(session)
{
	oFF.MessageManager.prototype.setupSessionContext.call( this , session);
	this.m_customObjects = oFF.XHashMapByString.create();
	this.m_variables = oFF.XHashMapByString.create();
	this.m_registerHandler = this;
	this.m_savedRegisters = oFF.XList.create();
};
oFF.SiInterpreter.prototype.execute = function()
{
	if (this.isValid() && oFF.notNull(this.m_root))
	{
		this.m_stack = oFF.XList.create();
		this.m_register = null;
		this.m_callback.beforeScriptExecution(this);
		this.runOperations(this.m_root);
		this.m_callback.afterScriptExecution(this);
		this.m_stack = null;
		this.m_register = null;
	}
};
oFF.SiInterpreter.prototype.setRoot = function(root)
{
	this.m_root = root;
};
oFF.SiInterpreter.prototype.runOperations = function(token)
{
	if (oFF.notNull(token))
	{
		var type = token.getType();
		var children = token.getChildren();
		var value = token.getValue();
		if (type === oFF.SiTokenType.CURLY_BRACKET)
		{
			for (var i = 0; i < children.size(); i++)
			{
				var child = children.get(i);
				this.runOperations(child);
			}
		}
		else if (type === oFF.SiTokenType.EXPR_SEQ)
		{
			for (var j = 0; j < children.size(); j++)
			{
				this.runOperations(children.get(j));
			}
		}
		else if (type === oFF.SiTokenType.FUNCTION)
		{
			var parameterCount = 0;
			if (oFF.notNull(children))
			{
				parameterCount = children.size();
				if (parameterCount > 0)
				{
					this.m_registerHandler.pushRegisterOnStack(this);
					for (var k = 0; k < parameterCount; k++)
					{
						var current = children.get(k);
						this.runOperations(current);
						this.m_registerHandler.pushRegisterOnStack(this);
					}
					this.m_registerHandler.setStackToRegister(this, parameterCount);
				}
			}
			var returnValue = this.m_callback.nativeCall(this, value, this.m_registerHandler.getRegister(), this.m_registerHandler.getStack(), parameterCount);
			this.m_savedRegisters.add(this.m_register);
			this.m_registerHandler.setRegister(returnValue);
			if (parameterCount > 0)
			{
				this.m_registerHandler.pop(this, parameterCount + 1);
			}
		}
		else if (type === oFF.SiTokenType.STRING || type === oFF.SiTokenType.CELL_SELECTION)
		{
			this.m_registerHandler.setStringToRegister(this, value);
		}
		else if (type === oFF.SiTokenType.INTEGER)
		{
			this.m_registerHandler.setIntegerToRegister(this, oFF.XInteger.convertFromString(value));
		}
		else if (type === oFF.SiTokenType.DOUBLE)
		{
			this.m_registerHandler.setDoubleToRegister(this, oFF.XDouble.convertFromString(value));
		}
		else if (type === oFF.SiTokenType.CONST_FALSE)
		{
			this.m_registerHandler.setBooleanToRegister(this, false);
		}
		else if (type === oFF.SiTokenType.CONST_TRUE)
		{
			this.m_registerHandler.setBooleanToRegister(this, true);
		}
		else if (type === oFF.SiTokenType.OP_DOT)
		{
			var left = token.getLeft();
			this.runOperations(left);
			var right = token.getRight();
			this.runOperations(right);
		}
		else if (type === oFF.SiTokenType.OP_ASSIGN)
		{
			var varName = token.getLeft().getValue();
			this.runOperations(token.getRight());
			this.pushRegisterToMemory(this, varName);
		}
		else if (type === oFF.SiTokenType.OP_PLUS || type === oFF.SiTokenType.OP_MINUS || type === oFF.SiTokenType.OP_MULT || type === oFF.SiTokenType.OP_DIV || type === oFF.SiTokenType.OP_EQUAL || type === oFF.SiTokenType.OP_NOT_EQUAL || type === oFF.SiTokenType.OP_LOWER || type === oFF.SiTokenType.OP_LOWER_EQUAL || type === oFF.SiTokenType.OP_GREATER || type === oFF.SiTokenType.OP_GREATER_EQUAL)
		{
			this.m_registerHandler.pushRegisterOnStack(this);
			this.runOperations(token.getLeft());
			this.m_registerHandler.pushRegisterOnStack(this);
			this.runOperations(token.getRight());
			this.m_registerHandler.pushRegisterOnStack(this);
			this.m_registerHandler.setStackToRegister(this, 2);
			var registerObj = this.m_registerHandler.getRegister();
			var stack = this.m_registerHandler.getStack();
			var returnVal = this.nativeCall(this, type.getName(), registerObj, stack, 2);
			this.m_registerHandler.setRegister(returnVal);
			this.m_registerHandler.pop(this, 3);
		}
		else if (type === oFF.SiTokenType.IDENTIFIER)
		{
			this.m_registerHandler.setVariableToRegister(this, value);
		}
	}
};
oFF.SiInterpreter.prototype.setVmCallback = function(callback)
{
	this.m_callback = callback;
};
oFF.SiInterpreter.prototype.setCustomObject = function(name, value)
{
	this.m_customObjects.put(name, value);
};
oFF.SiInterpreter.prototype.getCustomObject = function(name)
{
	return this.m_customObjects.getByKey(name);
};
oFF.SiInterpreter.prototype.setInitialRegister = function(obj)
{
	this.setRegister(obj);
};
oFF.SiInterpreter.prototype.setRegister = function(obj)
{
	this.m_register = obj;
};
oFF.SiInterpreter.prototype.getRegister = function()
{
	return this.m_register;
};
oFF.SiInterpreter.prototype.getStack = function()
{
	return this.m_stack;
};
oFF.SiInterpreter.prototype.pushRegisterOnStack = function(interpreter)
{
	this.m_stack.add(this.m_register);
};
oFF.SiInterpreter.prototype.setStackToRegister = function(interpreter, topOffset)
{
	var index = this.m_stack.size() - 1 - topOffset;
	this.m_register = this.m_stack.get(index);
};
oFF.SiInterpreter.prototype.pop = function(interpreter, number)
{
	var offset = this.m_stack.size() - number;
	for (var i = 0; i < number; i++)
	{
		this.m_stack.removeAt(offset);
	}
};
oFF.SiInterpreter.prototype.setStringToRegister = function(interpreter, value)
{
	this.m_register = oFF.XStringValue.create(value);
};
oFF.SiInterpreter.prototype.setBooleanToRegister = function(interpreter, value)
{
	this.m_register = oFF.XBooleanValue.create(value);
};
oFF.SiInterpreter.prototype.setVariableToRegister = function(interpreter, value)
{
	this.m_register = oFF.XStringValue.create(value);
};
oFF.SiInterpreter.prototype.setIntegerToRegister = function(interpreter, value)
{
	this.m_register = oFF.XIntegerValue.create(value);
};
oFF.SiInterpreter.prototype.setDoubleToRegister = function(interpreter, value)
{
	this.m_register = oFF.XDoubleValue.create(value);
};
oFF.SiInterpreter.prototype.pushRegisterToMemory = function(interpreter, varName)
{
	this.m_variables.put(varName, this.m_register);
};
oFF.SiInterpreter.prototype.beforeScriptExecution = oFF.noSupport;
oFF.SiInterpreter.prototype.afterScriptExecution = oFF.noSupport;
oFF.SiInterpreter.prototype.nativeCall = function(interpreter, name, registerObj, stack, parameterCount)
{
	var offset = stack.size() - parameterCount;
	var param0 = stack.get(offset);
	var type0 = param0.getComponentType();
	var param1 = stack.get(offset + 1);
	var type1 = param1.getComponentType();
	var result = null;
	if (oFF.XString.isEqual(oFF.SiTokenType._OP_PLUS, name) || oFF.XString.isEqual(oFF.SiTokenType._OP_MINUS, name) || oFF.XString.isEqual(oFF.SiTokenType._OP_MULT, name) || oFF.XString.isEqual(oFF.SiTokenType._OP_DIV, name))
	{
		if (type0 === oFF.XValueType.INTEGER && type1 === oFF.XValueType.INTEGER)
		{
			var left = param0.getInteger();
			var right = param1.getInteger();
			if (oFF.XString.isEqual(oFF.SiTokenType._OP_PLUS, name))
			{
				result = oFF.XIntegerValue.create(left + right);
			}
			else if (oFF.XString.isEqual(oFF.SiTokenType._OP_MINUS, name))
			{
				result = oFF.XIntegerValue.create(left - right);
			}
			else if (oFF.XString.isEqual(oFF.SiTokenType._OP_MULT, name))
			{
				result = oFF.XIntegerValue.create(left * right);
			}
			else if (oFF.XString.isEqual(oFF.SiTokenType._OP_DIV, name))
			{
				result = oFF.XIntegerValue.create(left / right);
			}
		}
		else
		{
			var left2 = 0.0;
			var right2 = 0.0;
			if (type0 === oFF.XValueType.DOUBLE && type1 === oFF.XValueType.DOUBLE)
			{
				left2 = param0.getDouble();
				right2 = param1.getDouble();
			}
			else if (type0 === oFF.XValueType.DOUBLE && type1 === oFF.XValueType.INTEGER)
			{
				left2 = param0.getDouble();
				right2 = param1.getInteger();
			}
			else if (type0 === oFF.XValueType.INTEGER && type1 === oFF.XValueType.DOUBLE)
			{
				left2 = param0.getInteger();
				right2 = param1.getDouble();
			}
			if (oFF.XString.isEqual(oFF.SiTokenType._OP_PLUS, name))
			{
				result = oFF.XDoubleValue.create(left2 + right2);
			}
			else if (oFF.XString.isEqual(oFF.SiTokenType._OP_MINUS, name))
			{
				result = oFF.XDoubleValue.create(left2 - right2);
			}
			else if (oFF.XString.isEqual(oFF.SiTokenType._OP_MULT, name))
			{
				result = oFF.XDoubleValue.create(left2 * right2);
			}
			else if (oFF.XString.isEqual(oFF.SiTokenType._OP_DIV, name))
			{
				result = oFF.XDoubleValue.create(left2 / right2);
			}
		}
	}
	else if (oFF.XString.isEqual(oFF.SiTokenType._OP_EQUAL, name) || oFF.XString.isEqual(oFF.SiTokenType._OP_NOT_EQUAL, name) || oFF.XString.isEqual(oFF.SiTokenType._OP_LOWER, name) || oFF.XString.isEqual(oFF.SiTokenType._OP_LOWER_EQUAL, name) || oFF.XString.isEqual(oFF.SiTokenType._OP_GREATER, name) || oFF.XString.isEqual(oFF.SiTokenType._OP_GREATER_EQUAL, name))
	{
		if (type0 === oFF.XValueType.INTEGER && type1 === oFF.XValueType.INTEGER)
		{
			var left3 = param0.getInteger();
			var right3 = param1.getInteger();
			if (oFF.XString.isEqual(oFF.SiTokenType._OP_EQUAL, name))
			{
				result = oFF.XBooleanValue.create(left3 === right3);
			}
			else if (oFF.XString.isEqual(oFF.SiTokenType._OP_NOT_EQUAL, name))
			{
				result = oFF.XBooleanValue.create(left3 !== right3);
			}
			else if (oFF.XString.isEqual(oFF.SiTokenType._OP_LOWER, name))
			{
				result = oFF.XBooleanValue.create(left3 < right3);
			}
			else if (oFF.XString.isEqual(oFF.SiTokenType._OP_LOWER_EQUAL, name))
			{
				result = oFF.XBooleanValue.create(left3 <= right3);
			}
			else if (oFF.XString.isEqual(oFF.SiTokenType._OP_GREATER, name))
			{
				result = oFF.XBooleanValue.create(left3 > right3);
			}
			else if (oFF.XString.isEqual(oFF.SiTokenType._OP_GREATER_EQUAL, name))
			{
				result = oFF.XBooleanValue.create(left3 >= right3);
			}
		}
	}
	if (oFF.isNull(result))
	{
		result = oFF.XStringValue.create(oFF.XStringUtils.concatenate2("MyFuncResult", name));
	}
	return result;
};
oFF.SiInterpreter.prototype.getStateAsJson = function()
{
	var buffer = oFF.XStringBufferJson.create();
	var keyList = oFF.XListOfString.createFromReadOnlyList(this.m_variables.getKeysAsReadOnlyListOfString());
	keyList.sortByDirection(oFF.XSortDirection.ASCENDING);
	var keys = keyList.getIterator();
	while (keys.hasNext() === true)
	{
		var key = keys.next();
		var object = this.m_variables.getByKey(key);
		buffer.appendLabelAndString(key, object.toString());
	}
	return buffer.toString();
};
oFF.SiInterpreter.prototype.getAstAsJson = function()
{
	if (this.isValid() && oFF.notNull(this.m_root))
	{
		return this.m_root.toJson();
	}
	return "";
};
oFF.SiInterpreter.prototype.getAstRoot = function()
{
	return this.m_root;
};
oFF.SiInterpreter.prototype.toString = function()
{
	if (this.isValid() && oFF.notNull(this.m_root))
	{
		return this.m_root.toString();
	}
	return oFF.MessageManager.prototype.toString.call( this );
};

oFF.SiParser = function() {};
oFF.SiParser.prototype = new oFF.MessageManager();
oFF.SiParser.prototype._ff_c = "SiParser";

oFF.SiParser.create = function()
{
	var parser = new oFF.SiParser();
	parser.setupSessionContext(null);
	return parser;
};
oFF.SiParser.isExecutable = function(type)
{
	return type === oFF.SiTokenType.FUNCTION || type === oFF.SiTokenType.IDENTIFIER || type === oFF.SiTokenType.OP_DOT;
};
oFF.SiParser.prototype.setupSessionContext = function(session)
{
	oFF.MessageManager.prototype.setupSessionContext.call( this , session);
};
oFF.SiParser.prototype.parse = function(script, depth)
{
	var tokens = this.tokenize(script);
	var expressions = this.clusterExpressions(tokens);
	var expressions2 = this.clusterBrackets(expressions);
	var expressions3 = this.clusterComma(expressions2);
	var expressions4 = this.clusterFunctions(expressions3);
	var expressions5 = expressions4;
	var expressions6 = this.clusterOperations(expressions5);
	this.log(expressions6.toString());
	if (expressions6.size() === 1)
	{
		return expressions5.get(0);
	}
	this.addError(0, "Syntax error");
	return null;
};
oFF.SiParser.prototype.tokenize = function(script)
{
	var tokens = oFF.XList.create();
	var size = oFF.XString.size(script);
	var isInsideString = false;
	var isInsideIdentifier = false;
	var isInsideSpace = false;
	var isInsideInt = false;
	var start = 0;
	for (var i = 0; i <= size; )
	{
		var c;
		if (i === size)
		{
			c = 0;
		}
		else
		{
			c = oFF.XString.getCharAt(script, i);
		}
		if (isInsideString)
		{
			if (c === 39 || c === 0)
			{
				var stringValue = oFF.XString.substring(script, start + 1, i);
				tokens.add(oFF.SiToken.createWithValue(oFF.SiTokenType.STRING, stringValue));
				isInsideString = false;
			}
			i++;
		}
		else if (isInsideInt)
		{
			if (c >= 48 && c <= 57)
			{
				i++;
			}
			else
			{
				var intValue = oFF.XString.substring(script, start, i);
				tokens.add(oFF.SiToken.createWithValue(oFF.SiTokenType.INTEGER, intValue));
				isInsideInt = false;
			}
		}
		else if (isInsideSpace)
		{
			if (c === 32)
			{
				i++;
			}
			else
			{
				tokens.add(oFF.SiToken.createWithValue(oFF.SiTokenType.SPACE, null));
				isInsideSpace = false;
			}
		}
		else if (isInsideIdentifier)
		{
			if (c !== 0 && (c >= 65 && c <= 90 || c >= 97 && c <= 122 || c === 95 || c === 36 || c >= 48 && c <= 57))
			{
				i++;
			}
			else
			{
				var word = oFF.XString.substring(script, start, i);
				if (oFF.XString.isEqual(word, "true"))
				{
					tokens.add(oFF.SiToken.createWithValue(oFF.SiTokenType.CONST_TRUE, word));
				}
				else if (oFF.XString.isEqual(word, "false"))
				{
					tokens.add(oFF.SiToken.createWithValue(oFF.SiTokenType.CONST_FALSE, word));
				}
				else
				{
					tokens.add(oFF.SiToken.createWithValue(oFF.SiTokenType.IDENTIFIER, word));
				}
				isInsideIdentifier = false;
			}
		}
		else
		{
			if (c !== 0)
			{
				if (c === 39)
				{
					isInsideString = true;
					start = i;
				}
				else if (c === 32)
				{
					isInsideSpace = true;
					start = i;
				}
				else if (c >= 65 && c <= 90 || c >= 97 && c <= 122 || c === 95 || c === 36)
				{
					isInsideIdentifier = true;
					start = i;
				}
				else if (c >= 48 && c <= 57)
				{
					isInsideInt = true;
					start = i;
				}
				else
				{
					var element = oFF.XString.substring(script, i, i + 1);
					var tokenType = oFF.SiTokenType.lookup(element);
					if (oFF.isNull(tokenType))
					{
						tokenType = oFF.SiTokenType.UNDEFINED;
					}
					tokens.add(oFF.SiToken.createWithValue(tokenType, null));
				}
			}
			i++;
		}
	}
	return tokens;
};
oFF.SiParser.prototype.clusterExpressions = function(tokens)
{
	var expSeq = oFF.SiToken.createWithValue(oFF.SiTokenType.EXPR_SEQ, null);
	var targetTokens = oFF.XList.create();
	var size = tokens.size();
	for (var i = 0; i < size; i++)
	{
		var current = tokens.get(i);
		if (current.getType() === oFF.SiTokenType.SEMICOLON)
		{
			this.prepareSeq(targetTokens, expSeq, false);
			targetTokens = oFF.XList.create();
		}
		else
		{
			targetTokens.add(current);
		}
	}
	this.prepareSeq(targetTokens, expSeq, false);
	var wrapper = oFF.XList.create();
	wrapper.add(expSeq);
	return wrapper;
};
oFF.SiParser.prototype.clusterBrackets = function(tokens)
{
	var size = tokens.size();
	for (var i = 0; i < size; i++)
	{
		var current = tokens.get(i);
		var children = current.getChildren();
		var clearedChildren;
		if (current.getType() === oFF.SiTokenType.EXPR_SEQ)
		{
			clearedChildren = this.clusterBrackets(children);
		}
		else
		{
			clearedChildren = this.resolveBrackets(children);
		}
		current.setChildren(clearedChildren);
	}
	return tokens;
};
oFF.SiParser.prototype.resolveBrackets = function(tokens)
{
	var targetTokens = oFF.XList.create();
	var stack = oFF.XList.create();
	var size = tokens.size();
	for (var i = 0; i < size; i++)
	{
		var current = tokens.get(i);
		var tokenType = current.getType();
		if (tokenType === oFF.SiTokenType.ROUND_BRACKET_OPEN)
		{
			stack.add(targetTokens);
			targetTokens = oFF.XList.create();
		}
		else if (tokenType === oFF.SiTokenType.ROUND_BRACKET_CLOSE)
		{
			if (stack.size() === 0)
			{
				return null;
			}
			var roundBracket = oFF.SiToken.createWithValue(oFF.SiTokenType.ROUND_BRACKET, null);
			roundBracket.setChildren(targetTokens);
			targetTokens = stack.removeAt(stack.size() - 1);
			targetTokens.add(roundBracket);
		}
		else
		{
			targetTokens.add(current);
		}
	}
	return targetTokens;
};
oFF.SiParser.prototype.clusterComma = function(tokens)
{
	var targetTokens = oFF.XList.create();
	var size = tokens.size();
	var parameterToken = null;
	for (var i = 0; i < size; i++)
	{
		var current = tokens.get(i);
		var type = current.getType();
		if (type === oFF.SiTokenType.COMMA)
		{
			if (oFF.isNull(parameterToken))
			{
				parameterToken = oFF.SiToken.createWithValue(oFF.SiTokenType.COMMA_LIST, null);
			}
			this.prepareSeq(targetTokens, parameterToken, true);
			targetTokens = oFF.XList.create();
		}
		else
		{
			var children = current.getChildren();
			if (oFF.notNull(children))
			{
				var newChildren = this.clusterComma(children);
				current.setChildren(newChildren);
			}
			targetTokens.add(current);
		}
	}
	if (oFF.notNull(parameterToken))
	{
		this.prepareSeq(targetTokens, parameterToken, true);
		var wrapper = oFF.XList.create();
		wrapper.add(parameterToken);
		return wrapper;
	}
	else if (tokens.size() > 1)
	{
		var seqToken = oFF.SiToken.createWithValue(oFF.SiTokenType.TOKEN_SEQ, null);
		seqToken.setChildren(targetTokens);
		var wrapper2 = oFF.XList.create();
		wrapper2.add(seqToken);
		return wrapper2;
	}
	else
	{
		return tokens;
	}
};
oFF.SiParser.prototype.prepareSeq = function(tokens, parent, addEmpty)
{
	var size = tokens.size();
	if (size === 0)
	{
		if (addEmpty)
		{
			parent.add(oFF.SiToken.createWithValue(oFF.SiTokenType.EMPTY, null));
		}
	}
	else if (size === 1)
	{
		parent.add(tokens.get(0));
	}
	else
	{
		var seqToken = oFF.SiToken.createWithValue(oFF.SiTokenType.TOKEN_SEQ, null);
		seqToken.setChildren(tokens);
		parent.add(seqToken);
	}
};
oFF.SiParser.prototype.clusterFunctions = function(tokens)
{
	var targetTokens = null;
	if (oFF.notNull(tokens))
	{
		targetTokens = oFF.XList.create();
		var size = tokens.size();
		for (var i = 0; i < size; i++)
		{
			var current = tokens.get(i);
			var type = current.getType();
			var next = null;
			var nextType = null;
			if (i + 1 < size)
			{
				next = tokens.get(i + 1);
				nextType = next.getType();
			}
			if (type === oFF.SiTokenType.IDENTIFIER && oFF.notNull(next) && nextType === oFF.SiTokenType.ROUND_BRACKET)
			{
				var newFunction = oFF.SiToken.createWithValue(oFF.SiTokenType.FUNCTION, current.getValue());
				var nextChildren = next.getChildren();
				if (oFF.notNull(nextChildren) && nextChildren.size() !== 0)
				{
					if (nextChildren.size() !== 1)
					{
						var clusterResult = this.clusterFunctions(nextChildren);
						newFunction.setChildren(clusterResult);
					}
					else
					{
						var parameterToken = nextChildren.get(0);
						var commaList;
						if (parameterToken.getType() !== oFF.SiTokenType.COMMA_LIST)
						{
							commaList = oFF.XList.create();
							commaList.add(parameterToken);
						}
						else
						{
							commaList = parameterToken.getChildren();
						}
						newFunction.setChildren(commaList);
					}
				}
				current = newFunction;
				i++;
			}
			var children = current.getChildren();
			children = this.clusterFunctions(children);
			current.setChildren(children);
			targetTokens.add(current);
		}
	}
	return targetTokens;
};
oFF.SiParser.prototype.clusterOperations = function(tokens)
{
	var targetTokens = oFF.XList.create();
	var size = tokens.size();
	for (var i = 0; i < size; i++)
	{
		var current = tokens.get(i);
		var type = current.getType();
		var children = current.getChildren();
		if (oFF.notNull(children))
		{
			children = this.clusterOperations(children);
			current.setChildren(children);
		}
		if (type === oFF.SiTokenType.TOKEN_SEQ)
		{
			current = this.resolveTokenSequence(current);
		}
		targetTokens.add(current);
	}
	return targetTokens;
};
oFF.SiParser.prototype.resolveTokenSequence = function(tokenSeq)
{
	var children = tokenSeq.getChildren();
	var size = children.size();
	if (size === 1)
	{
		return children.get(0);
	}
	var op = null;
	var left = children.get(0);
	var offset = 1;
	while (true)
	{
		var operator = children.get(offset);
		var right = children.get(offset + 1);
		var leftType = left.getType();
		var opType = operator.getType();
		var rightType = right.getType();
		if (oFF.SiParser.isExecutable(leftType) === false)
		{
			this.addError(4, "Left operator not executable");
		}
		else if (oFF.SiParser.isExecutable(rightType) === false)
		{
			this.addError(5, "Right operator not executable");
		}
		if (opType === oFF.SiTokenType.DOT)
		{
			op = oFF.SiToken.createWithValue(oFF.SiTokenType.OP_DOT, null);
			op.add(left);
			op.add(right);
		}
		else
		{
			this.addError(6, "Not supported operator");
			return null;
		}
		offset = offset + 2;
		if (offset >= size)
		{
			break;
		}
		left = op;
	}
	return op;
};

oFF.SiParser2 = function() {};
oFF.SiParser2.prototype = new oFF.MessageManager();
oFF.SiParser2.prototype._ff_c = "SiParser2";

oFF.SiParser2.create = function()
{
	var parser = new oFF.SiParser2();
	parser.setupSessionContext(null);
	return parser;
};
oFF.SiParser2.addTo = function(targetList, sourceList, start, end)
{
	var theTargetList = targetList;
	if (oFF.isNull(theTargetList))
	{
		theTargetList = oFF.XList.create();
	}
	if (oFF.notNull(sourceList))
	{
		var theEnd = end;
		if (end === -1)
		{
			theEnd = sourceList.size();
		}
		for (var k = start; k < theEnd; k++)
		{
			theTargetList.add(sourceList.get(k));
		}
	}
	return theTargetList;
};
oFF.SiParser2.findLast = function(tokens, type)
{
	var last = -1;
	if (oFF.notNull(tokens))
	{
		for (var i = 0; i < tokens.size(); i++)
		{
			if (tokens.get(i).getType() === type)
			{
				last = i;
			}
		}
	}
	return last;
};
oFF.SiParser2.findFirst = function(tokens, type, start)
{
	var first = -1;
	if (oFF.notNull(tokens))
	{
		for (var i = start; i < tokens.size(); i++)
		{
			if (tokens.get(i).getType() === type)
			{
				first = i;
				break;
			}
		}
	}
	return first;
};
oFF.SiParser2.findFirstLevel = function(tokens, level, start)
{
	var first = -1;
	if (oFF.notNull(tokens))
	{
		for (var i = start; i < tokens.size(); i++)
		{
			if (tokens.get(i).getOperatorLevel() === level)
			{
				first = i;
				break;
			}
		}
	}
	return first;
};
oFF.SiParser2.findLastLevel = function(tokens, level, start)
{
	var first = -1;
	if (oFF.notNull(tokens))
	{
		for (var i = tokens.size() - 1; i >= 0; i--)
		{
			if (tokens.get(i).getOperatorLevel() === level)
			{
				first = i;
				break;
			}
		}
	}
	return first;
};
oFF.SiParser2.prototype.setupSessionContext = function(session)
{
	oFF.MessageManager.prototype.setupSessionContext.call( this , session);
};
oFF.SiParser2.prototype.parse = function(script, depth)
{
	var returnToken;
	var tokens = this.tokenize(script, depth);
	if (depth === -1 || depth >= 10)
	{
		returnToken = this.parseCurlyBrackets(tokens);
	}
	else
	{
		returnToken = null;
	}
	return returnToken;
};
oFF.SiParser2.prototype.tokenize = function(script, depth)
{
	var resultTokens = null;
	if (depth === -1 || depth > 0)
	{
		var script2 = oFF.XString.replace(script, "\r", "");
		if (depth === -1 || depth > 1)
		{
			var tokens = oFF.XList.create();
			var isInsideMultiLineComment = false;
			var isInsideSingleLineComment = false;
			var isInsideString = false;
			var isInsideIdentifier = false;
			var isInsideSpace = false;
			var isInsideInt = false;
			var size = oFF.XString.size(script2);
			var start = 0;
			for (var i = 0; i <= size; )
			{
				var c;
				var n;
				if (i === size)
				{
					c = 0;
					n = 0;
				}
				else
				{
					c = oFF.XString.getCharAt(script2, i);
					if (i + 1 < size)
					{
						n = oFF.XString.getCharAt(script2, i + 1);
					}
					else
					{
						n = 0;
					}
				}
				if (isInsideMultiLineComment)
				{
					if (c === 0 || n === 0)
					{
						this.addError(0, "Unproper ending of multiline comment");
						break;
					}
					if (c === 42 && n === 47)
					{
						tokens.add(oFF.SiToken.createWithValue(oFF.SiTokenType.MULTI_LINE_COMMENT, oFF.XString.substring(script2, start + 2, i)));
						isInsideMultiLineComment = false;
						i = i + 2;
					}
					else
					{
						i++;
					}
				}
				else if (isInsideSingleLineComment)
				{
					if (c === 10 || c === 0)
					{
						tokens.add(oFF.SiToken.createWithValue(oFF.SiTokenType.SINGLE_LINE_COMMENT, oFF.XString.substring(script2, start + 2, i)));
						isInsideSingleLineComment = false;
					}
					i++;
				}
				else if (isInsideString)
				{
					if (c === 39 || c === 0)
					{
						tokens.add(oFF.SiToken.createWithValue(oFF.SiTokenType.STRING, oFF.XString.substring(script2, start + 1, i)));
						isInsideString = false;
					}
					i++;
				}
				else if (isInsideInt)
				{
					if (c >= 48 && c <= 57)
					{
						i++;
					}
					else
					{
						var intValue = oFF.XString.substring(script2, start, i);
						tokens.add(oFF.SiToken.createWithValue(oFF.SiTokenType.INTEGER, intValue));
						isInsideInt = false;
					}
				}
				else if (isInsideSpace)
				{
					if (c === 32)
					{
						i++;
					}
					else
					{
						tokens.add(oFF.SiToken.create(oFF.SiTokenType.SPACE));
						isInsideSpace = false;
					}
				}
				else if (isInsideIdentifier)
				{
					if (c !== 0 && (c >= 65 && c <= 90 || c >= 97 && c <= 122 || c === 95 || c === 36 || c >= 48 && c <= 57))
					{
						i++;
					}
					else
					{
						var word = oFF.XString.substring(script2, start, i);
						if (oFF.XString.isEqual(word, "true"))
						{
							tokens.add(oFF.SiToken.createWithValue(oFF.SiTokenType.CONST_TRUE, word));
						}
						else if (oFF.XString.isEqual(word, "false"))
						{
							tokens.add(oFF.SiToken.createWithValue(oFF.SiTokenType.CONST_FALSE, word));
						}
						else if (oFF.XString.isEqual(word, "int"))
						{
							tokens.add(oFF.SiToken.createWithValue(oFF.SiTokenType.TYPE_INT, word));
						}
						else
						{
							tokens.add(oFF.SiToken.createWithValue(oFF.SiTokenType.IDENTIFIER, word));
						}
						isInsideIdentifier = false;
					}
				}
				else
				{
					if (c !== 0)
					{
						if (c === 39)
						{
							isInsideString = true;
							start = i;
						}
						else if (c === 32)
						{
							isInsideSpace = true;
							start = i;
						}
						else if (c >= 65 && c <= 90 || c >= 97 && c <= 122 || c === 95 || c === 36)
						{
							isInsideIdentifier = true;
							start = i;
						}
						else if (c === 46)
						{
							tokens.add(oFF.SiToken.create(oFF.SiTokenType.OP_DOT));
						}
						else if (c === 43)
						{
							tokens.add(oFF.SiToken.create(oFF.SiTokenType.OP_PLUS));
						}
						else if (c === 45)
						{
							tokens.add(oFF.SiToken.create(oFF.SiTokenType.OP_MINUS));
						}
						else if (c === 42)
						{
							tokens.add(oFF.SiToken.create(oFF.SiTokenType.OP_MULT));
						}
						else if (c === 47)
						{
							if (n === 47)
							{
								isInsideSingleLineComment = true;
								start = i;
								i++;
							}
							else if (n === 42)
							{
								isInsideMultiLineComment = true;
								start = i;
								i++;
							}
							else
							{
								tokens.add(oFF.SiToken.create(oFF.SiTokenType.OP_DIV));
							}
						}
						else if (c === 60)
						{
							if (n === 61)
							{
								tokens.add(oFF.SiToken.create(oFF.SiTokenType.OP_LOWER_EQUAL));
								i++;
							}
							else
							{
								tokens.add(oFF.SiToken.create(oFF.SiTokenType.OP_LOWER));
							}
						}
						else if (c === 62)
						{
							if (n === 61)
							{
								tokens.add(oFF.SiToken.create(oFF.SiTokenType.OP_GREATER_EQUAL));
								i++;
							}
							else
							{
								tokens.add(oFF.SiToken.create(oFF.SiTokenType.OP_GREATER));
							}
						}
						else if (c === 61)
						{
							if (n === 61)
							{
								tokens.add(oFF.SiToken.create(oFF.SiTokenType.OP_EQUAL));
								i++;
							}
							else
							{
								tokens.add(oFF.SiToken.create(oFF.SiTokenType.OP_ASSIGN));
							}
						}
						else if (c === 33)
						{
							if (n === 61)
							{
								tokens.add(oFF.SiToken.create(oFF.SiTokenType.OP_NOT_EQUAL));
								i++;
							}
							else
							{
								tokens.add(oFF.SiToken.create(oFF.SiTokenType.OP_NOT));
							}
						}
						else if (c === 38)
						{
							if (n === 38)
							{
								tokens.add(oFF.SiToken.create(oFF.SiTokenType.OP_BOOL_AND));
								i++;
							}
							else
							{
								tokens.add(oFF.SiToken.create(oFF.SiTokenType.OP_BIN_AND));
							}
						}
						else if (c === 124)
						{
							if (n === 124)
							{
								tokens.add(oFF.SiToken.create(oFF.SiTokenType.OP_BOOL_OR));
								i++;
							}
							else
							{
								tokens.add(oFF.SiToken.create(oFF.SiTokenType.OP_BIN_OR));
							}
						}
						else if (c >= 48 && c <= 57)
						{
							isInsideInt = true;
							start = i;
						}
						else
						{
							var element = oFF.XString.substring(script2, i, i + 1);
							var tokenType = oFF.SiTokenType.lookup(element);
							if (oFF.isNull(tokenType))
							{
								tokenType = oFF.SiTokenType.UNDEFINED;
							}
							tokens.add(oFF.SiToken.create(tokenType));
						}
					}
					i++;
				}
			}
			var spaceFreeTokens = this.spaceFreeTokens(tokens);
			var tokensWithDouble = this.tokensWithDoublesAndCells(spaceFreeTokens);
			resultTokens = tokensWithDouble;
		}
	}
	return resultTokens;
};
oFF.SiParser2.prototype.spaceFreeTokens = function(tokens)
{
	var targetTokens = oFF.XList.create();
	var size = tokens.size();
	var token;
	var type;
	for (var k = 0; k < size; k++)
	{
		token = tokens.get(k);
		type = token.getType();
		if (type !== oFF.SiTokenType.SPACE && type !== oFF.SiTokenType.MULTI_LINE_COMMENT && type !== oFF.SiTokenType.SINGLE_LINE_COMMENT)
		{
			targetTokens.add(token);
		}
	}
	return targetTokens;
};
oFF.SiParser2.prototype.tokensWithDoublesAndCells = function(tokens)
{
	var targetTokens = oFF.XList.create();
	var size = tokens.size();
	var token;
	for (var k = 0; k < size; k++)
	{
		token = tokens.get(k);
		var type = token.getType();
		var next = null;
		var nextType = null;
		var nextNext = null;
		var nextNextType = null;
		if (k + 2 < size)
		{
			next = tokens.get(k + 1);
			nextType = next.getType();
			nextNext = tokens.get(k + 2);
			nextNextType = nextNext.getType();
		}
		if (type === oFF.SiTokenType.INTEGER && nextType === oFF.SiTokenType.OP_DOT && nextNextType === oFF.SiTokenType.INTEGER && oFF.notNull(nextNext))
		{
			var doubleValue = oFF.XStringUtils.concatenate3(token.getValue(), ".", nextNext.getValue());
			var doubleToken = oFF.SiToken.createWithValue(oFF.SiTokenType.DOUBLE, doubleValue);
			targetTokens.add(doubleToken);
			k = k + 2;
		}
		else if (type === oFF.SiTokenType.IDENTIFIER && nextType === oFF.SiTokenType.OP_COLON && nextNextType === oFF.SiTokenType.IDENTIFIER && oFF.notNull(nextNext))
		{
			var cellSelectionValue = oFF.XStringUtils.concatenate3(token.getValue(), ":", nextNext.getValue());
			var cellSelectionToken = oFF.SiToken.createWithValue(oFF.SiTokenType.CELL_SELECTION, cellSelectionValue);
			targetTokens.add(cellSelectionToken);
			k = k + 2;
		}
		else
		{
			targetTokens.add(token);
		}
	}
	return targetTokens;
};
oFF.SiParser2.prototype.parseCurlyBrackets = function(tokens)
{
	var lastOpening = oFF.SiParser2.findLast(tokens, oFF.SiTokenType.CURLY_BRACKET_OPEN);
	if (lastOpening === -1)
	{
		var firstClosing = oFF.SiParser2.findFirst(tokens, oFF.SiTokenType.CURLY_BRACKET_CLOSE, 0);
		if (firstClosing === -1)
		{
			return this.parseExpressionSequences(tokens);
		}
		this.addError(0, "Closing curly bracket '}' not expected");
		return null;
	}
	var closing = oFF.SiParser2.findFirst(tokens, oFF.SiTokenType.CURLY_BRACKET_CLOSE, lastOpening);
	if (closing === -1)
	{
		this.addError(0, "Closing round bracket '}' not found");
		return null;
	}
	var curlyBracket = oFF.SiToken.create(oFF.SiTokenType.CURLY_BRACKET);
	var bracketContent = oFF.SiParser2.addTo(null, tokens, lastOpening + 1, closing);
	if (bracketContent.size() > 0)
	{
		var deepthought = this.parseCurlyBrackets(bracketContent);
		curlyBracket.add(deepthought);
	}
	var assembledTokens = oFF.SiParser2.addTo(null, tokens, 0, lastOpening);
	assembledTokens.add(curlyBracket);
	oFF.SiParser2.addTo(assembledTokens, tokens, closing + 1, -1);
	return this.parseCurlyBrackets(assembledTokens);
};
oFF.SiParser2.prototype.parseExpressionSequences = function(tokens)
{
	var rootToken = oFF.SiToken.create(oFF.SiTokenType.EXPR_SEQ);
	var start = 0;
	var nextSemicolon;
	while (true)
	{
		nextSemicolon = oFF.SiParser2.findFirst(tokens, oFF.SiTokenType.SEMICOLON, start);
		var sequence = oFF.SiParser2.addTo(null, tokens, start, nextSemicolon);
		if (sequence.size() > 0)
		{
			var expression7 = this.parseBrackets(sequence);
			rootToken.add(expression7);
		}
		if (nextSemicolon === -1)
		{
			break;
		}
		start = nextSemicolon + 1;
	}
	return rootToken;
};
oFF.SiParser2.prototype.parseBrackets = function(tokens)
{
	var lastOpening = oFF.SiParser2.findLast(tokens, oFF.SiTokenType.ROUND_BRACKET_OPEN);
	if (lastOpening === -1)
	{
		var firstClosing = oFF.SiParser2.findFirst(tokens, oFF.SiTokenType.ROUND_BRACKET_CLOSE, 0);
		if (firstClosing === -1)
		{
			return this.parseCommaList(tokens);
		}
		this.addError(0, "Closing round bracket ')' not expected");
		return null;
	}
	var closing = oFF.SiParser2.findFirst(tokens, oFF.SiTokenType.ROUND_BRACKET_CLOSE, lastOpening);
	if (closing === -1)
	{
		this.addError(0, "Closing round bracket ')' not found");
		return null;
	}
	var roundBracket = oFF.SiToken.create(oFF.SiTokenType.ROUND_BRACKET);
	var bracketContent = oFF.SiParser2.addTo(null, tokens, lastOpening + 1, closing);
	if (bracketContent.size() > 0)
	{
		var deepthought = this.parseBrackets(bracketContent);
		roundBracket.add(deepthought);
	}
	var assembledTokens = oFF.SiParser2.addTo(null, tokens, 0, lastOpening);
	assembledTokens.add(roundBracket);
	oFF.SiParser2.addTo(assembledTokens, tokens, closing + 1, -1);
	return this.parseBrackets(assembledTokens);
};
oFF.SiParser2.prototype.parseCommaList = function(tokens)
{
	var commaListToken = oFF.SiToken.create(oFF.SiTokenType.COMMA_LIST);
	var start = 0;
	var nextComma;
	while (true)
	{
		nextComma = oFF.SiParser2.findFirst(tokens, oFF.SiTokenType.COMMA, start);
		var sequence = oFF.SiParser2.addTo(null, tokens, start, nextComma);
		if (sequence.size() > 0)
		{
			var expression7 = this.parseFunctionAndOperations(sequence);
			commaListToken.add(expression7);
		}
		else
		{
			commaListToken.add(oFF.SiToken.create(oFF.SiTokenType.EMPTY));
		}
		if (nextComma === -1)
		{
			break;
		}
		start = nextComma + 1;
	}
	if (commaListToken.size() === 1)
	{
		return commaListToken.getChild();
	}
	return commaListToken;
};
oFF.SiParser2.prototype.parseFunctionAndOperations = function(tokens)
{
	var operatorOperandSequence = this.parseFunctions(tokens);
	var singleOperation = this.parseOperations(operatorOperandSequence);
	return singleOperation;
};
oFF.SiParser2.prototype.parseFunctions = function(tokens)
{
	var targetTokens = null;
	if (oFF.notNull(tokens))
	{
		targetTokens = oFF.XList.create();
		var size = tokens.size();
		for (var i = 0; i < size; i++)
		{
			var current = tokens.get(i);
			var type = current.getType();
			var next = null;
			var nextType = null;
			if (i + 1 < size)
			{
				next = tokens.get(i + 1);
				nextType = next.getType();
			}
			if (type === oFF.SiTokenType.IDENTIFIER && nextType === oFF.SiTokenType.ROUND_BRACKET && oFF.notNull(next))
			{
				var newFunction = oFF.SiToken.createWithValue(oFF.SiTokenType.FUNCTION, current.getValue());
				targetTokens.add(newFunction);
				var bracketChild = next.getChild();
				if (oFF.notNull(bracketChild))
				{
					var bracketChildType = bracketChild.getType();
					if (bracketChildType === oFF.SiTokenType.COMMA_LIST)
					{
						var multiParameter = bracketChild.getChildren();
						newFunction.setChildren(multiParameter);
					}
					else
					{
						newFunction.add(bracketChild);
					}
				}
				i++;
			}
			else
			{
				targetTokens.add(current);
			}
		}
	}
	return targetTokens;
};
oFF.SiParser2.prototype.parseOperations = function(children)
{
	if (oFF.isNull(children))
	{
		this.addError(0, "No children");
		return null;
	}
	if (children.size() === 1)
	{
		return children.get(0);
	}
	else if (children.size() === 0)
	{
		return null;
	}
	var targetTokens = oFF.XList.create();
	targetTokens.addAll(children);
	this.mergeSign(targetTokens);
	for (var k = 10; k >= 6; k--)
	{
		while (targetTokens.size() > 1)
		{
			var firstPointOp = oFF.SiParser2.findFirstLevel(targetTokens, k, 0);
			if (firstPointOp === -1)
			{
				break;
			}
			var siToken = targetTokens.get(firstPointOp);
			var type = siToken.getType();
			this.merge(targetTokens, firstPointOp, type, false);
		}
	}
	var returnToken = this.parseAssignment(targetTokens);
	return returnToken;
};
oFF.SiParser2.prototype.mergeSign = function(targetTokens)
{
	var pos = 0;
	var tokenBeforeSign = null;
	var tokenSign = null;
	var tokenNumber = null;
	while (pos < targetTokens.size())
	{
		tokenNumber = targetTokens.get(pos);
		var type = tokenNumber.getType();
		if (type.isNumber() && oFF.notNull(tokenSign))
		{
			var signType = tokenSign.getType();
			if (signType === oFF.SiTokenType.OP_PLUS || signType === oFF.SiTokenType.OP_MINUS)
			{
				var beforeType = null;
				if (oFF.notNull(tokenBeforeSign))
				{
					beforeType = tokenBeforeSign.getType();
				}
				if (oFF.isNull(beforeType) || beforeType.isOperator())
				{
					var newValue;
					if (signType === oFF.SiTokenType.OP_PLUS)
					{
						newValue = oFF.XStringUtils.concatenate2("+", tokenNumber.getValue());
					}
					else
					{
						newValue = oFF.XStringUtils.concatenate2("-", tokenNumber.getValue());
					}
					tokenNumber.setValue(newValue);
					targetTokens.removeAt(pos - 1);
					pos--;
				}
			}
		}
		tokenBeforeSign = tokenSign;
		tokenSign = tokenNumber;
		pos++;
	}
};
oFF.SiParser2.prototype.parseAssignment = function(targetTokens)
{
	while (targetTokens.size() > 1)
	{
		var lastIndex = oFF.SiParser2.findLastLevel(targetTokens, 5, 0);
		if (lastIndex === -1)
		{
			break;
		}
		var siToken = targetTokens.get(lastIndex);
		var type = siToken.getType();
		this.merge(targetTokens, lastIndex, type, true);
	}
	return this.parseComplexDefinition(targetTokens);
};
oFF.SiParser2.prototype.parseComplexDefinition = function(targetTokens)
{
	if (targetTokens.size() !== 1)
	{
		for (var i = 0; i < targetTokens.size() - 1; i++)
		{
			var token = targetTokens.get(i);
			var type = token.getType();
			if (type.isPrimitiveType())
			{
				var rightSide = targetTokens.get(i + 1);
				var name = rightSide.getValue();
				var varDef = oFF.SiToken.createExt(oFF.SiTokenType.PRIMITIVE_TYPE_VAR_DEF, 0, name, null);
				varDef.add(token);
				varDef.add(rightSide);
				return varDef;
			}
		}
		var tokenSequence = oFF.SiToken.createExt(oFF.SiTokenType.TOKEN_SEQ, 0, null, targetTokens);
		return tokenSequence;
	}
	else
	{
		return targetTokens.get(0);
	}
};
oFF.SiParser2.prototype.merge = function(targetTokens, opIndex, tokenType, takeLeftValue)
{
	if (opIndex > 0 && opIndex + 1 < targetTokens.size())
	{
		var left = targetTokens.get(opIndex - 1);
		var right = targetTokens.get(opIndex + 1);
		var value = null;
		if (takeLeftValue === true)
		{
			value = left.getValue();
		}
		var targetToken = oFF.SiToken.createExt(tokenType, 0, value, null);
		targetToken.add(left).add(right);
		targetTokens.set(opIndex - 1, targetToken);
		targetTokens.removeAt(opIndex);
		targetTokens.removeAt(opIndex);
		return targetToken;
	}
	else
	{
		return null;
	}
};

oFF.SiTokenType = function() {};
oFF.SiTokenType.prototype = new oFF.XConstant();
oFF.SiTokenType.prototype._ff_c = "SiTokenType";

oFF.SiTokenType.IDENTIFIER = null;
oFF.SiTokenType.STRING = null;
oFF.SiTokenType.INTEGER = null;
oFF.SiTokenType.DOUBLE = null;
oFF.SiTokenType.CONST_TRUE = null;
oFF.SiTokenType.CONST_FALSE = null;
oFF.SiTokenType.SPACE = null;
oFF.SiTokenType.DOT = null;
oFF.SiTokenType.PLUS = null;
oFF.SiTokenType.MINUS = null;
oFF.SiTokenType.MULT = null;
oFF.SiTokenType.DIV = null;
oFF.SiTokenType._OP_PLUS = "OpPlus";
oFF.SiTokenType.OP_PLUS = null;
oFF.SiTokenType._OP_MINUS = "OpMinus";
oFF.SiTokenType.OP_MINUS = null;
oFF.SiTokenType._OP_MULT = "OpMult";
oFF.SiTokenType.OP_MULT = null;
oFF.SiTokenType._OP_DIV = "OpDiv";
oFF.SiTokenType.OP_DIV = null;
oFF.SiTokenType.OP_COLON = null;
oFF.SiTokenType.OP_DOT = null;
oFF.SiTokenType._OP_LOWER = "OpLower";
oFF.SiTokenType.OP_LOWER = null;
oFF.SiTokenType._OP_LOWER_EQUAL = "OpLowerEqual";
oFF.SiTokenType.OP_LOWER_EQUAL = null;
oFF.SiTokenType._OP_GREATER = "OpGreater";
oFF.SiTokenType.OP_GREATER = null;
oFF.SiTokenType._OP_GREATER_EQUAL = "OpGreaterEqual";
oFF.SiTokenType.OP_GREATER_EQUAL = null;
oFF.SiTokenType._OP_EQUAL = "OpEqual";
oFF.SiTokenType.OP_EQUAL = null;
oFF.SiTokenType._OP_NOT_EQUAL = "OpNotEqual";
oFF.SiTokenType.OP_NOT_EQUAL = null;
oFF.SiTokenType._OP_ASSIGN = "OpAssign";
oFF.SiTokenType.OP_ASSIGN = null;
oFF.SiTokenType._OP_NOT = "OpBinNot";
oFF.SiTokenType.OP_NOT = null;
oFF.SiTokenType._OP_BIN_AND = "OpBinAnd";
oFF.SiTokenType.OP_BIN_AND = null;
oFF.SiTokenType._OP_BOOL_AND = "OpBoolAnd";
oFF.SiTokenType.OP_BOOL_AND = null;
oFF.SiTokenType._OP_BIN_OR = "OpBinOr";
oFF.SiTokenType.OP_BIN_OR = null;
oFF.SiTokenType._OP_BOOL_OR = "OpBoolOr";
oFF.SiTokenType.OP_BOOL_OR = null;
oFF.SiTokenType.TYPE_INT = null;
oFF.SiTokenType.TYPE_DOUBLE = null;
oFF.SiTokenType.TYPE_STRING = null;
oFF.SiTokenType.TYPE_BOOLEAN = null;
oFF.SiTokenType.PRIMITIVE_TYPE_VAR_DEF = null;
oFF.SiTokenType.SEMICOLON = null;
oFF.SiTokenType.COMMA = null;
oFF.SiTokenType.COMMA_LIST = null;
oFF.SiTokenType.FUNCTION = null;
oFF.SiTokenType.ROUND_BRACKET_OPEN = null;
oFF.SiTokenType.ROUND_BRACKET_CLOSE = null;
oFF.SiTokenType.ROUND_BRACKET = null;
oFF.SiTokenType.CURLY_BRACKET_OPEN = null;
oFF.SiTokenType.CURLY_BRACKET_CLOSE = null;
oFF.SiTokenType.CURLY_BRACKET = null;
oFF.SiTokenType.CELL_SELECTION = null;
oFF.SiTokenType.UNDEFINED = null;
oFF.SiTokenType.TOKEN_SEQ = null;
oFF.SiTokenType.EXPR_SEQ = null;
oFF.SiTokenType.EMPTY = null;
oFF.SiTokenType.MULTI_LINE_COMMENT = null;
oFF.SiTokenType.SINGLE_LINE_COMMENT = null;
oFF.SiTokenType.s_lookup = null;
oFF.SiTokenType.staticSetup = function()
{
	oFF.SiTokenType.s_lookup = oFF.XSetOfNameObject.create();
	oFF.SiTokenType.IDENTIFIER = oFF.SiTokenType.createType("Identifier");
	oFF.SiTokenType.STRING = oFF.SiTokenType.createType("String");
	oFF.SiTokenType.INTEGER = oFF.SiTokenType.createNumber("Integer");
	oFF.SiTokenType.DOUBLE = oFF.SiTokenType.createNumber("Double");
	oFF.SiTokenType.CONST_TRUE = oFF.SiTokenType.createType("True");
	oFF.SiTokenType.CONST_FALSE = oFF.SiTokenType.createType("False");
	oFF.SiTokenType.SPACE = oFF.SiTokenType.createType("Space");
	oFF.SiTokenType.UNDEFINED = oFF.SiTokenType.createType("Undefined");
	oFF.SiTokenType.SEMICOLON = oFF.SiTokenType.createType(";");
	oFF.SiTokenType.OP_COLON = oFF.SiTokenType.createType(":");
	oFF.SiTokenType.COMMA = oFF.SiTokenType.createType(",");
	oFF.SiTokenType.COMMA_LIST = oFF.SiTokenType.createType("CommaList");
	oFF.SiTokenType.FUNCTION = oFF.SiTokenType.createType("Function");
	oFF.SiTokenType.ROUND_BRACKET_OPEN = oFF.SiTokenType.createType("(");
	oFF.SiTokenType.ROUND_BRACKET_CLOSE = oFF.SiTokenType.createType(")");
	oFF.SiTokenType.ROUND_BRACKET = oFF.SiTokenType.createType("()");
	oFF.SiTokenType.CURLY_BRACKET_OPEN = oFF.SiTokenType.createType("{");
	oFF.SiTokenType.CURLY_BRACKET_CLOSE = oFF.SiTokenType.createType("}");
	oFF.SiTokenType.CURLY_BRACKET = oFF.SiTokenType.createType("{}");
	oFF.SiTokenType.TOKEN_SEQ = oFF.SiTokenType.createType("TokenSeq");
	oFF.SiTokenType.EXPR_SEQ = oFF.SiTokenType.createType("ExprSeq");
	oFF.SiTokenType.EMPTY = oFF.SiTokenType.createType("Empty");
	oFF.SiTokenType.DOT = oFF.SiTokenType.createOperator(".", 10);
	oFF.SiTokenType.MULT = oFF.SiTokenType.createOperator("*", 9);
	oFF.SiTokenType.DIV = oFF.SiTokenType.createOperator("/", 9);
	oFF.SiTokenType.PLUS = oFF.SiTokenType.createOperator("+", 8);
	oFF.SiTokenType.MINUS = oFF.SiTokenType.createOperator("-", 8);
	oFF.SiTokenType.OP_DOT = oFF.SiTokenType.createOperator("OpDot", 10);
	oFF.SiTokenType.OP_MULT = oFF.SiTokenType.createOperator(oFF.SiTokenType._OP_MULT, 9);
	oFF.SiTokenType.OP_DIV = oFF.SiTokenType.createOperator(oFF.SiTokenType._OP_DIV, 9);
	oFF.SiTokenType.OP_PLUS = oFF.SiTokenType.createOperator(oFF.SiTokenType._OP_PLUS, 8);
	oFF.SiTokenType.OP_MINUS = oFF.SiTokenType.createOperator(oFF.SiTokenType._OP_MINUS, 8);
	oFF.SiTokenType.OP_LOWER = oFF.SiTokenType.createOperator(oFF.SiTokenType._OP_LOWER, 7);
	oFF.SiTokenType.OP_LOWER_EQUAL = oFF.SiTokenType.createOperator(oFF.SiTokenType._OP_LOWER_EQUAL, 7);
	oFF.SiTokenType.OP_GREATER = oFF.SiTokenType.createOperator(oFF.SiTokenType._OP_GREATER, 7);
	oFF.SiTokenType.OP_GREATER_EQUAL = oFF.SiTokenType.createOperator(oFF.SiTokenType._OP_GREATER_EQUAL, 7);
	oFF.SiTokenType.OP_EQUAL = oFF.SiTokenType.createOperator(oFF.SiTokenType._OP_EQUAL, 7);
	oFF.SiTokenType.OP_NOT_EQUAL = oFF.SiTokenType.createOperator(oFF.SiTokenType._OP_NOT_EQUAL, 7);
	oFF.SiTokenType.OP_BOOL_OR = oFF.SiTokenType.createOperator(oFF.SiTokenType._OP_BOOL_OR, 6);
	oFF.SiTokenType.OP_BOOL_AND = oFF.SiTokenType.createOperator(oFF.SiTokenType._OP_BOOL_AND, 6);
	oFF.SiTokenType.OP_ASSIGN = oFF.SiTokenType.createOperator(oFF.SiTokenType._OP_ASSIGN, 5);
	oFF.SiTokenType.OP_NOT = oFF.SiTokenType.createType(oFF.SiTokenType._OP_NOT);
	oFF.SiTokenType.OP_BIN_OR = oFF.SiTokenType.createType(oFF.SiTokenType._OP_BIN_OR);
	oFF.SiTokenType.OP_BIN_AND = oFF.SiTokenType.createType(oFF.SiTokenType._OP_BIN_AND);
	oFF.SiTokenType.CELL_SELECTION = oFF.SiTokenType.createType("CellSelection");
	oFF.SiTokenType.MULTI_LINE_COMMENT = oFF.SiTokenType.createType("MultiLineComment");
	oFF.SiTokenType.SINGLE_LINE_COMMENT = oFF.SiTokenType.createType("SingleLineComment");
	oFF.SiTokenType.TYPE_BOOLEAN = oFF.SiTokenType.createPrimitiveType("boolean");
	oFF.SiTokenType.TYPE_DOUBLE = oFF.SiTokenType.createPrimitiveType("double");
	oFF.SiTokenType.TYPE_INT = oFF.SiTokenType.createPrimitiveType("int");
	oFF.SiTokenType.TYPE_STRING = oFF.SiTokenType.createPrimitiveType("String");
	oFF.SiTokenType.PRIMITIVE_TYPE_VAR_DEF = oFF.SiTokenType.createType("PrimitiveTypeVarDef");
};
oFF.SiTokenType.createNumber = function(name)
{
	var newObj = oFF.SiTokenType.createType(name);
	newObj.m_isNumber = true;
	return newObj;
};
oFF.SiTokenType.createType = function(name)
{
	var newObj = new oFF.SiTokenType();
	newObj._setupInternal(name);
	oFF.SiTokenType.s_lookup.add(newObj);
	return newObj;
};
oFF.SiTokenType.createOperator = function(name, operatorLevel)
{
	var newObj = new oFF.SiTokenType();
	newObj._setupInternal(name);
	newObj.m_operatorLevel = operatorLevel;
	oFF.SiTokenType.s_lookup.add(newObj);
	return newObj;
};
oFF.SiTokenType.createPrimitiveType = function(name)
{
	var newObj = new oFF.SiTokenType();
	newObj._setupInternal(name);
	newObj.m_isPrimitiveType = true;
	oFF.SiTokenType.s_lookup.add(newObj);
	return newObj;
};
oFF.SiTokenType.lookup = function(name)
{
	return oFF.SiTokenType.s_lookup.getByKey(name);
};
oFF.SiTokenType.prototype.m_operatorLevel = 0;
oFF.SiTokenType.prototype.m_isPrimitiveType = false;
oFF.SiTokenType.prototype.m_isNumber = false;
oFF.SiTokenType.prototype.getOperatorLevel = function()
{
	return this.m_operatorLevel;
};
oFF.SiTokenType.prototype.isPrimitiveType = function()
{
	return this.m_isPrimitiveType;
};
oFF.SiTokenType.prototype.isOperator = function()
{
	return this.m_operatorLevel > 0;
};
oFF.SiTokenType.prototype.isNumber = function()
{
	return this.m_isNumber;
};

oFF.UiPrgContainer = function() {};
oFF.UiPrgContainer.prototype = new oFF.ProgramContainer();
oFF.UiPrgContainer.prototype._ff_c = "UiPrgContainer";

oFF.UiPrgContainer.prototype.m_uiManager = null;
oFF.UiPrgContainer.prototype.setupUiContainer = function(startCfg, program)
{
	oFF.ProgramContainer.prototype.setupContainer.call( this , startCfg, program);
};
oFF.UiPrgContainer.prototype.releaseObject = function()
{
	this.closeContainerControl();
	this.notifyContainerClosed();
	this.internalCleanup();
	this.m_uiManager = null;
	oFF.ProgramContainer.prototype.releaseObject.call( this );
};
oFF.UiPrgContainer.prototype.runFull = function()
{
	var uiManager = this.getUiManager();
	if (oFF.notNull(uiManager))
	{
		this.openAndRun(uiManager);
	}
};
oFF.UiPrgContainer.prototype.shutdownContainer = function()
{
	if (this.isContainerOpen())
	{
		this.closeContainerControl();
		this.notifyContainerClosed();
		this.internalCleanup();
	}
};
oFF.UiPrgContainer.prototype.setTitle = function(title)
{
	oFF.ProgramContainer.prototype.setTitle.call( this , title);
};
oFF.UiPrgContainer.prototype.getTitle = function()
{
	var containerTitle = oFF.ProgramContainer.prototype.getTitle.call( this );
	if (oFF.XStringUtils.isNullOrEmpty(containerTitle))
	{
		var startCfg = this.getStartCfg();
		containerTitle = startCfg.getStartTitle();
	}
	return containerTitle;
};
oFF.UiPrgContainer.prototype.setBusy = function(busy)
{
	if (this.getContainerControl() !== null)
	{
		this.getContainerControl().setBusy(busy);
	}
};
oFF.UiPrgContainer.prototype.isBusy = function()
{
	if (this.getContainerControl() !== null)
	{
		return this.getContainerControl().isBusy();
	}
	return false;
};
oFF.UiPrgContainer.prototype.openAndRun = function(uiManager)
{
	this.m_uiManager = uiManager;
};
oFF.UiPrgContainer.prototype.isContainerOpen = function()
{
	return false;
};
oFF.UiPrgContainer.prototype.isUiContainer = function()
{
	return true;
};
oFF.UiPrgContainer.prototype.isModalContainer = function()
{
	return false;
};
oFF.UiPrgContainer.prototype.isFloatingContainer = function()
{
	return false;
};
oFF.UiPrgContainer.prototype.getOffsetWidth = function()
{
	return this.getContainerOffsetWidth();
};
oFF.UiPrgContainer.prototype.getOffsetHeight = function()
{
	return this.getContainerOffsetHeight();
};
oFF.UiPrgContainer.prototype.setContainerNameAndCssClass = function(control)
{
	if (oFF.notNull(control))
	{
		if (oFF.XStringUtils.isNotNullAndNotEmpty(this.getContainerName()))
		{
			control.setName(this.getContainerName());
		}
		if (oFF.XStringUtils.isNotNullAndNotEmpty(this.getContainerCssClass()))
		{
			control.addCssClass(this.getContainerCssClass());
		}
	}
};
oFF.UiPrgContainer.prototype.notifyContainerClosed = function()
{
	if (this.getProgram() !== null)
	{
		this.getProgram().onContainerAfterClose();
	}
};
oFF.UiPrgContainer.prototype.notifyContainerOpened = function()
{
	if (this.getProgram() !== null)
	{
		this.getProgram().onContainerAfterOpen();
	}
};
oFF.UiPrgContainer.prototype.getUiManager = function()
{
	if (oFF.isNull(this.m_uiManager))
	{
		var program = this.getProgram();
		var process = program.getProcess();
		this.m_uiManager = process.getUiManager();
		if (oFF.isNull(this.m_uiManager))
		{
			this.m_uiManager = process.openSubSystem(oFF.SubSystemType.GUI);
		}
	}
	return this.m_uiManager;
};
oFF.UiPrgContainer.prototype.getGenesis = function()
{
	if (oFF.notNull(this.m_uiManager))
	{
		return this.m_uiManager.getFreeGenesis();
	}
	return null;
};
oFF.UiPrgContainer.prototype.terminateProgram = function()
{
	var program = this.getProgram();
	program.terminate();
};
oFF.UiPrgContainer.prototype.killProgram = function()
{
	var program = this.getProgram();
	program.kill();
};
oFF.UiPrgContainer.prototype.internalCleanup = function()
{
	oFF.XObjectExt.release(this.getProgram());
};
oFF.UiPrgContainer.prototype.isUiProgram = function()
{
	return this.getProgram() !== null && this.getProcess().getProcessType() === oFF.ProcessType.PROGRAM && this.getProgram().getComponentType().isTypeOf(oFF.UiComponentTypeExt.UI_PROGRAM);
};
oFF.UiPrgContainer.prototype.getUiProgram = function()
{
	if (this.isUiProgram())
	{
		return this.getProgram();
	}
	return null;
};
oFF.UiPrgContainer.prototype.getContainerName = function()
{
	var containerName = null;
	if (this.getProgram().getResolvedProgramContainerType().isUiContainer())
	{
		var uiPrg = this.getUiProgram();
		containerName = uiPrg.getContainerName();
	}
	return containerName;
};
oFF.UiPrgContainer.prototype.getContainerCssClass = function()
{
	var containerCssClass = null;
	if (this.getProgram().getResolvedProgramContainerType().isUiContainer())
	{
		var uiPrg = this.getUiProgram();
		containerCssClass = uiPrg.getContainerCssClass();
	}
	return containerCssClass;
};

oFF.SxEventScripting = function() {};
oFF.SxEventScripting.prototype = new oFF.XObject();
oFF.SxEventScripting.prototype._ff_c = "SxEventScripting";

oFF.SxEventScripting.create = function(script)
{
	var newObj = new oFF.SxEventScripting();
	newObj.setupEventScripting(null, script);
	return newObj;
};
oFF.SxEventScripting.prototype.m_uiManager = null;
oFF.SxEventScripting.prototype.m_script = null;
oFF.SxEventScripting.prototype.m_objCounter = 0;
oFF.SxEventScripting.prototype.m_map = null;
oFF.SxEventScripting.prototype.setupEventScripting = function(uiManager, script)
{
	this.m_uiManager = uiManager;
	this.m_script = script;
	this.m_map = oFF.XHashMapByString.create();
};
oFF.SxEventScripting.prototype.onSelect = function(event)
{
	this.runEventScript(event, oFF.UiEvent.ON_SELECT);
};
oFF.SxEventScripting.prototype.onSelectionChange = function(event)
{
	this.runEventScript(event, oFF.UiEvent.ON_SELECTION_CHANGE);
};
oFF.SxEventScripting.prototype.onChange = function(event)
{
	this.runEventScript(event, oFF.UiEvent.ON_CHANGE);
};
oFF.SxEventScripting.prototype.onLiveChange = function(event)
{
	this.runEventScript(event, oFF.UiEvent.ON_LIVE_CHANGE);
};
oFF.SxEventScripting.prototype.onEnter = function(event)
{
	this.runEventScript(event, oFF.UiEvent.ON_ENTER);
};
oFF.SxEventScripting.prototype.onPress = function(event)
{
	this.runEventScript(event, oFF.UiEvent.ON_PRESS);
};
oFF.SxEventScripting.prototype.onEditingBegin = function(event)
{
	this.runEventScript(event, oFF.UiEvent.ON_EDITING_BEGIN);
};
oFF.SxEventScripting.prototype.onEditingEnd = function(event)
{
	this.runEventScript(event, oFF.UiEvent.ON_EDITING_END);
};
oFF.SxEventScripting.prototype.onBack = function(event)
{
	this.runEventScript(event, oFF.UiEvent.ON_BACK);
};
oFF.SxEventScripting.prototype.onRefresh = function(event)
{
	this.runEventScript(event, oFF.UiEvent.ON_REFRESH);
};
oFF.SxEventScripting.prototype.onOpen = function(event)
{
	this.runEventScript(event, oFF.UiEvent.ON_OPEN);
};
oFF.SxEventScripting.prototype.onClose = function(event)
{
	this.runEventScript(event, oFF.UiEvent.ON_CLOSE);
};
oFF.SxEventScripting.prototype.onBeforeOpen = function(event)
{
	this.runEventScript(event, oFF.UiEvent.ON_BEFORE_OPEN);
};
oFF.SxEventScripting.prototype.onBeforeClose = function(event)
{
	this.runEventScript(event, oFF.UiEvent.ON_BEFORE_CLOSE);
};
oFF.SxEventScripting.prototype.onAfterOpen = function(event)
{
	this.runEventScript(event, oFF.UiEvent.ON_AFTER_OPEN);
};
oFF.SxEventScripting.prototype.onAfterClose = function(event)
{
	this.runEventScript(event, oFF.UiEvent.ON_AFTER_CLOSE);
};
oFF.SxEventScripting.prototype.onClick = function(event)
{
	this.runEventScript(event, oFF.UiEvent.ON_CLICK);
};
oFF.SxEventScripting.prototype.onContextMenu = function(event)
{
	this.runEventScript(event, oFF.UiEvent.ON_CONTEXT_MENU);
};
oFF.SxEventScripting.prototype.onDoubleClick = function(event)
{
	this.runEventScript(event, oFF.UiEvent.ON_DOUBLE_CLICK);
};
oFF.SxEventScripting.prototype.onCollapse = function(event)
{
	this.runEventScript(event, oFF.UiEvent.ON_COLLAPSE);
};
oFF.SxEventScripting.prototype.onExpand = function(event)
{
	this.runEventScript(event, oFF.UiEvent.ON_EXPAND);
};
oFF.SxEventScripting.prototype.onLoadFinished = function(event)
{
	this.runEventScript(event, oFF.UiEvent.ON_LOAD_FINISHED);
};
oFF.SxEventScripting.prototype.onDelete = function(event)
{
	this.runEventScript(event, oFF.UiEvent.ON_DELETE);
};
oFF.SxEventScripting.prototype.onDetailPress = function(event)
{
	this.runEventScript(event, oFF.UiEvent.ON_DETAIL_PRESS);
};
oFF.SxEventScripting.prototype.onMove = function(event)
{
	this.runEventScriptNew(event, oFF.UiEvent.ON_MOVE);
};
oFF.SxEventScripting.prototype.onMoveStart = function(event)
{
	this.runEventScriptNew(event, oFF.UiEvent.ON_MOVE_START);
};
oFF.SxEventScripting.prototype.onMoveEnd = function(event)
{
	this.runEventScriptNew(event, oFF.UiEvent.ON_MOVE_END);
};
oFF.SxEventScripting.prototype.onResize = function(event)
{
	this.runEventScriptNew(event, oFF.UiEvent.ON_RESIZE);
};
oFF.SxEventScripting.prototype.onSuggestionSelect = function(event)
{
	this.runEventScript(event, oFF.UiEvent.ON_SUGGESTION_SELECT);
};
oFF.SxEventScripting.prototype.onScroll = function(event)
{
	this.runEventScript(event, oFF.UiEvent.ON_SCROLL);
};
oFF.SxEventScripting.prototype.onScrollLoad = function(event)
{
	this.runEventScript(event, oFF.UiEvent.ON_SCROLL_LOAD);
};
oFF.SxEventScripting.prototype.onHover = function(event)
{
	this.runEventScript(event, oFF.UiEvent.ON_HOVER);
};
oFF.SxEventScripting.prototype.onHoverEnd = function(event)
{
	this.runEventScript(event, oFF.UiEvent.ON_HOVER_END);
};
oFF.SxEventScripting.prototype.onPaste = function(event)
{
	this.runEventScript(event, oFF.UiEvent.ON_PASTE);
};
oFF.SxEventScripting.prototype.onSelectionFinish = function(event)
{
	this.runEventScript(event, oFF.UiEvent.ON_SELECTION_FINISH);
};
oFF.SxEventScripting.prototype.onSearch = function(event)
{
	this.runEventScript(event, oFF.UiEvent.ON_SEARCH);
};
oFF.SxEventScripting.prototype.onButtonPress = function(event)
{
	this.runEventScript(event, oFF.UiEvent.ON_BUTTON_PRESS);
};
oFF.SxEventScripting.prototype.onError = function(event)
{
	this.runEventScript(event, oFF.UiEvent.ON_ERROR);
};
oFF.SxEventScripting.prototype.onReadLineFinished = function(event)
{
	this.runEventScript(event, oFF.UiEvent.ON_READ_LINE_FINISHED);
};
oFF.SxEventScripting.prototype.onExecute = function(event)
{
	this.runEventScript(event, oFF.UiEvent.ON_EXECUTE);
};
oFF.SxEventScripting.prototype.onTerminate = function(event)
{
	this.runEventScript(event, oFF.UiEvent.ON_TERMINATE);
};
oFF.SxEventScripting.prototype.onFileDrop = function(event)
{
	this.runEventScript(event, oFF.UiEvent.ON_FILE_DROP);
};
oFF.SxEventScripting.prototype.onDrop = function(event)
{
	this.runEventScriptNew(event, oFF.UiEvent.ON_DROP);
};
oFF.SxEventScripting.prototype.onItemClose = function(event)
{
	this.runEventScript(event, oFF.UiEvent.ON_ITEM_CLOSE);
};
oFF.SxEventScripting.prototype.onItemSelect = function(event)
{
	this.runEventScript(event, oFF.UiEvent.ON_ITEM_SELECT);
};
oFF.SxEventScripting.prototype.onTableDragAndDrop = function(event)
{
	this.runEventScript(event, oFF.UiEvent.ON_TABLE_DRAG_AND_DROP);
};
oFF.SxEventScripting.prototype.onMenuPress = function(event)
{
	this.runEventScript(event, oFF.UiEvent.ON_MENU_PRESS);
};
oFF.SxEventScripting.prototype.onValueHelpRequest = function(event)
{
	this.runEventScript(event, oFF.UiEvent.ON_VALUE_HELP_REQUEST);
};
oFF.SxEventScripting.prototype.onColumnResize = function(event)
{
	this.runEventScript(event, oFF.UiEvent.ON_COLUMN_RESIZE);
};
oFF.SxEventScripting.prototype.onRowResize = function(event)
{
	this.runEventScript(event, oFF.UiEvent.ON_ROW_RESIZE);
};
oFF.SxEventScripting.prototype.onItemPress = function(event)
{
	this.runEventScript(event, oFF.UiEvent.ON_ITEM_PRESS);
};
oFF.SxEventScripting.prototype.onDragStart = function(event)
{
	this.runEventScript(event, oFF.UiEvent.ON_DRAG_START);
};
oFF.SxEventScripting.prototype.onDragEnd = function(event)
{
	this.runEventScript(event, oFF.UiEvent.ON_DRAG_END);
};
oFF.SxEventScripting.prototype.onEscape = function(event)
{
	this.runEventScript(event, oFF.UiEvent.ON_ESCAPE);
};
oFF.SxEventScripting.prototype.onKeyDown = function(event)
{
	this.runEventScriptNew(event, oFF.UiEvent.ON_KEY_DOWN);
};
oFF.SxEventScripting.prototype.onKeyUp = function(event)
{
	this.runEventScriptNew(event, oFF.UiEvent.ON_KEY_UP);
};
oFF.SxEventScripting.prototype.runEventScript = function(event, eventDef)
{
	if (oFF.isNull(eventDef))
	{
		throw oFF.XException.createRuntimeException("Missing event! Please specify an event!");
	}
	var control = event.getControl();
	var script = this.m_script;
	if (oFF.notNull(control))
	{
		if (oFF.isNull(this.m_uiManager))
		{
			this.m_uiManager = control.getUiManager();
		}
		if (oFF.isNull(this.m_script))
		{
			var docElement = control.getCustomObject();
			script = docElement.getStringByKey(eventDef.getName());
		}
	}
	var interpreter = oFF.ScriptEngine.create();
	interpreter.setVmCallback(this);
	interpreter.setCustomObject("event", event);
	interpreter.setCustomObject("uicontext", control);
	interpreter.setInitialRegister(control);
	interpreter.compile(script);
	interpreter.execute();
};
oFF.SxEventScripting.prototype.runEventScriptNew = function(event, eventDef)
{
	if (oFF.isNull(eventDef))
	{
		throw oFF.XException.createRuntimeException("Missing event! Please specify an event!");
	}
	var control = event.getControl();
	var script = this.m_script;
	if (oFF.notNull(control))
	{
		if (oFF.isNull(this.m_uiManager))
		{
			this.m_uiManager = control.getUiManager();
		}
		if (oFF.isNull(this.m_script))
		{
			var docElement = control.getCustomObject();
			script = docElement.getStringByKey(eventDef.getName());
		}
	}
	var interpreter = oFF.ScriptEngine.create();
	interpreter.setVmCallback(this);
	interpreter.setCustomObject("event", event);
	interpreter.setCustomObject("uicontext", control);
	interpreter.setInitialRegister(control);
	interpreter.compile(script);
	interpreter.execute();
};
oFF.SxEventScripting.prototype.nativeCall = function(interpreter, name, registerObj, stack, parameterCount)
{
	var parameters = this.fillParameters(stack, parameterCount);
	var executedFlag = oFF.XBooleanValue.create(false);
	var retObj = this.executeByKeyword(name, parameters, executedFlag);
	if (executedFlag.getBoolean() === false)
	{
		var component = this.lookupComponent(interpreter, registerObj);
		if (false)
		{
			var componentType = component.getComponentType();
			if (oFF.notNull(componentType))
			{
				retObj = this.executeOperation(componentType, component, name, parameters);
			}
		}
		else
		{
			var reflectParameters = this.fillParameters2(stack, parameterCount);
			var reflectReturn;
			if (oFF.notNull(parameters) && parameters.hasElements())
			{
				reflectReturn = oFF.XReflection.invokeMethodWithArgs(component, name, reflectParameters);
			}
			else
			{
				reflectReturn = oFF.XReflection.invokeMethod(component, name);
			}
			retObj = reflectReturn.getValue();
		}
	}
	return retObj;
};
oFF.SxEventScripting.prototype.executeOperation = function(componentType, component, name, parameters)
{
	var retObj = null;
	if (componentType.isTypeOf(oFF.XComponentType._UI))
	{
		var uiContext = component;
		var operation = oFF.UiAllOperations.lookupOp(name);
		if (oFF.notNull(operation))
		{
			retObj = operation.executeOperation(this, uiContext, parameters, 0);
		}
	}
	return retObj;
};
oFF.SxEventScripting.prototype.executeByKeyword = function(name, parameters, executedFlag)
{
	if (oFF.XString.isEqual(oFF.UiQuasarConstants.QSA_DOLLAR, name))
	{
		var sigSel = parameters.getStringAtExt(0, null);
		var process = this.getUiManager().getSession();
		var selector = process.getSelector();
		var selectedComponents = selector.selectComponentByExpr(sigSel, oFF.SigSelDomain.UI, null, -1, true);
		executedFlag.setBoolean(true);
		return selectedComponents;
	}
	return null;
};
oFF.SxEventScripting.prototype.lookupComponent = function(interpreter, component)
{
	var theComponent = component;
	if (oFF.isNull(theComponent))
	{
		theComponent = interpreter.getCustomObject("uicontext");
	}
	return theComponent;
};
oFF.SxEventScripting.prototype.fillParameters = function(stack, parameterCount)
{
	var parameters = oFF.PrFactory.createList();
	var offset = stack.size() - parameterCount;
	var stackObj;
	var entry;
	var valueType;
	for (var i = 0; i < parameterCount; i++)
	{
		stackObj = stack.get(offset + i);
		if (oFF.notNull(stackObj))
		{
			entry = stackObj;
			valueType = entry.getComponentType();
			if (valueType === oFF.XValueType.STRING)
			{
				parameters.addString(entry.toString());
			}
			else if (valueType === oFF.XValueType.BOOLEAN)
			{
				parameters.addBoolean(entry.getBoolean());
			}
			else if (valueType === oFF.XValueType.INTEGER)
			{
				parameters.addInteger(entry.getInteger());
			}
			else if (valueType === oFF.XValueType.DOUBLE)
			{
				parameters.addDouble(entry.getDouble());
			}
			else if (valueType.isTypeOf(oFF.XComponentType._UI))
			{
				var theId = this.newId();
				this.m_map.put(theId, entry);
				parameters.addString(theId);
			}
		}
		else
		{
			parameters.add(null);
		}
	}
	return parameters;
};
oFF.SxEventScripting.prototype.fillParameters2 = function(stack, parameterCount)
{
	var parameters = oFF.XList.create();
	var offset = stack.size() - parameterCount;
	var stackObj;
	var entry;
	var valueType;
	for (var i = 0; i < parameterCount; i++)
	{
		stackObj = stack.get(offset + i);
		if (oFF.notNull(stackObj))
		{
			entry = stackObj;
			valueType = entry.getComponentType();
			if (valueType === oFF.XValueType.STRING)
			{
				parameters.add(oFF.XReflectionParam.createString(entry.toString()));
			}
			else if (valueType === oFF.XValueType.BOOLEAN)
			{
				parameters.add(oFF.XReflectionParam.createBoolean(entry.getBoolean()));
			}
			else if (valueType === oFF.XValueType.INTEGER)
			{
				parameters.add(oFF.XReflectionParam.createInteger(entry.getInteger()));
			}
			else if (valueType === oFF.XValueType.DOUBLE)
			{
				parameters.add(oFF.XReflectionParam.createDouble(entry.getDouble()));
			}
			else
			{
				parameters.add(oFF.XReflectionParam.create(entry));
			}
		}
		else
		{
			parameters.add(oFF.XReflectionParam.create(null));
		}
	}
	return parameters;
};
oFF.SxEventScripting.prototype.beforeScriptExecution = function(interpreter) {};
oFF.SxEventScripting.prototype.afterScriptExecution = function(interpreter) {};
oFF.SxEventScripting.prototype.getContext = function(identifier)
{
	var theComponent = this.m_map.getByKey(identifier);
	if (oFF.notNull(theComponent))
	{
		var theContext = theComponent;
		theContext = theContext.getOrigin();
		return theContext;
	}
	else
	{
		return null;
	}
};
oFF.SxEventScripting.prototype.newId = function()
{
	var theId = oFF.XStringBuffer.create().append("Id").appendInt(this.m_objCounter).toString();
	this.m_objCounter++;
	return theId;
};
oFF.SxEventScripting.prototype.getUiManager = function()
{
	return this.m_uiManager;
};
oFF.SxEventScripting.prototype.getGenesis = function()
{
	return this.m_uiManager.getGenesis();
};

oFF.UiPrgContainerEmbedded = function() {};
oFF.UiPrgContainerEmbedded.prototype = new oFF.UiPrgContainer();
oFF.UiPrgContainerEmbedded.prototype._ff_c = "UiPrgContainerEmbedded";

oFF.UiPrgContainerEmbedded.prototype.m_isContainerOpen = false;
oFF.UiPrgContainerEmbedded.prototype.setupUiContainer = function(startCfg, program)
{
	this.m_isContainerOpen = false;
	oFF.UiPrgContainer.prototype.setupContainer.call( this , startCfg, program);
};
oFF.UiPrgContainerEmbedded.prototype.isContainerOpen = function()
{
	return this.m_isContainerOpen;
};
oFF.UiPrgContainerEmbedded.prototype.isModalContainer = function()
{
	return false;
};
oFF.UiPrgContainerEmbedded.prototype.isFloatingContainer = function()
{
	return false;
};
oFF.UiPrgContainerEmbedded.prototype.setContainerOpened = function()
{
	this.m_isContainerOpen = true;
	this.notifyContainerOpened();
};
oFF.UiPrgContainerEmbedded.prototype.closeContainerControl = function()
{
	this.m_isContainerOpen = false;
};
oFF.UiPrgContainerEmbedded.prototype.openContainerControl = function()
{
	this.m_isContainerOpen = true;
};
oFF.UiPrgContainerEmbedded.prototype.getContainerOffsetWidth = function()
{
	return 0;
};
oFF.UiPrgContainerEmbedded.prototype.getContainerOffsetHeight = function()
{
	return 0;
};

oFF.UiPrgContainerFloating = function() {};
oFF.UiPrgContainerFloating.prototype = new oFF.UiPrgContainer();
oFF.UiPrgContainerFloating.prototype._ff_c = "UiPrgContainerFloating";

oFF.UiPrgContainerFloating.prototype.isFloatingContainer = function()
{
	return true;
};
oFF.UiPrgContainerFloating.prototype.getInitialContainerSize = function()
{
	var startCfg = this.getStartCfg();
	var initialContainerSize = null;
	var manifestCssWidth = startCfg.getInitialContainerCssWidth();
	var manifestCssHeight = startCfg.getInitialContainerCssHeight();
	if (oFF.XStringUtils.isNotNullAndNotEmpty(manifestCssWidth) || oFF.XStringUtils.isNotNullAndNotEmpty(manifestCssHeight))
	{
		initialContainerSize = oFF.UiSize.createByCss(manifestCssWidth, manifestCssHeight);
	}
	var uiProgram = this.getUiProgram();
	if (oFF.isNull(initialContainerSize) && oFF.notNull(uiProgram))
	{
		if (uiProgram.getDefaultContainerSize() !== null)
		{
			initialContainerSize = uiProgram.getDefaultContainerSize();
		}
	}
	return initialContainerSize;
};
oFF.UiPrgContainerFloating.prototype.getInitialContainerPosition = function()
{
	var startCfg = this.getStartCfg();
	var initialContainerPosition = null;
	var manifestCssPosX = startCfg.getInitialContainerCssPosX();
	var manifestCssPosY = startCfg.getInitialContainerCssPosY();
	if (oFF.XStringUtils.isNotNullAndNotEmpty(manifestCssPosX) || oFF.XStringUtils.isNotNullAndNotEmpty(manifestCssPosY))
	{
		initialContainerPosition = oFF.UiPosition.createByCss(manifestCssPosX, manifestCssPosY);
	}
	var uiProgram = this.getUiProgram();
	if (oFF.isNull(initialContainerPosition) && oFF.notNull(uiProgram))
	{
		initialContainerPosition = uiProgram.getDefaultContainerPosition();
	}
	return initialContainerPosition;
};
oFF.UiPrgContainerFloating.prototype.shouldContainerOpenMaximized = function()
{
	var startCfg = this.getStartCfg();
	var initiallyMaximized = false;
	if (this.getUiProgram() !== null)
	{
		initiallyMaximized = this.getUiProgram().isOpenContainerMaximized();
	}
	if (startCfg.isInitiallyContainerMaximized())
	{
		initiallyMaximized = startCfg.isInitiallyContainerMaximized();
	}
	return initiallyMaximized;
};
oFF.UiPrgContainerFloating.prototype.notifyContainerResized = function(newWidth, newHeight)
{
	if (this.getUiProgram() !== null)
	{
		this.getUiProgram().onContainerResize(newWidth, newHeight);
	}
};

oFF.DfUiProgram = function() {};
oFF.DfUiProgram.prototype = new oFF.DfApplicationProgram();
oFF.DfUiProgram.prototype._ff_c = "DfUiProgram";

oFF.DfUiProgram.PRG_CONTENT_WRAPPER_NAME = "ffPrgContentWrapper";
oFF.DfUiProgram.PRG_MENU_BAR_NAME = "ffPrgMenuBar";
oFF.DfUiProgram.DEFAULT_MENU_BAR_PROGRAM_NAME_BTN_TAG = "ffPrgDefaultMenuBarPrograNameBtnTag";
oFF.DfUiProgram.DEFAULT_MENU_BAR_PROGRAM_NAME_MENU_TAG = "ffPrgDefaultMenuBarProgramNameMenu";
oFF.DfUiProgram.DEFAULT_MENU_BAR_PROGRAM_NAME_MENU_EXIT_BTN_TAG = "ffPrgDefaultMenuBarProgramNameMenuExitBtn";
oFF.DfUiProgram.runStandalone = function(factory)
{
	oFF.XClass.initializeClass("com.oFF.UiDriverModule", true);
	var uiProgram = factory.newProgram();
	uiProgram.runFull();
};
oFF.DfUiProgram.prototype.m_genesis = null;
oFF.DfUiProgram.prototype.m_programMenuBar = null;
oFF.DfUiProgram.prototype.m_contentPage = null;
oFF.DfUiProgram.prototype.getDefaultContainerType = function()
{
	return oFF.ProgramContainerType.WINDOW;
};
oFF.DfUiProgram.prototype.releaseObject = function()
{
	this.m_programMenuBar = oFF.XObjectExt.release(this.m_programMenuBar);
	this.m_contentPage = oFF.XObjectExt.release(this.m_contentPage);
	this.m_genesis = oFF.XObjectExt.release(this.m_genesis);
	oFF.DfApplicationProgram.prototype.releaseObject.call( this );
};
oFF.DfUiProgram.prototype.getComponentType = function()
{
	return oFF.UiComponentTypeExt.UI_PROGRAM;
};
oFF.DfUiProgram.prototype.doSetupProgramMetadata = function(metadata)
{
	oFF.DfApplicationProgram.prototype.doSetupProgramMetadata.call( this , metadata);
	this.prepareProgramMetadata(metadata);
};
oFF.DfUiProgram.prototype.prepareArguments = function()
{
	oFF.DfApplicationProgram.prototype.prepareArguments.call( this );
};
oFF.DfUiProgram.prototype.initializeProgram = function()
{
	oFF.DfApplicationProgram.prototype.initializeProgram.call( this );
};
oFF.DfUiProgram.prototype.evalArguments = function()
{
	oFF.DfApplicationProgram.prototype.evalArguments.call( this );
	this.processArguments(this.getArguments());
};
oFF.DfUiProgram.prototype.runProcess = function()
{
	return true;
};
oFF.DfUiProgram.prototype.canTerminate = function()
{
	return true;
};
oFF.DfUiProgram.prototype.renderUi = function(genesis)
{
	if (oFF.isNull(genesis))
	{
		throw oFF.XException.createRuntimeException("Missing genesis object, cannot render the UI. Please specify a genesis container object!");
	}
	if (oFF.isNull(this.m_genesis))
	{
		this.m_genesis = genesis;
	}
	if (this.shouldWrapContentInPage())
	{
		this.m_contentPage = genesis.newControl(oFF.UiType.PAGE);
		this.m_contentPage.setTag(oFF.DfUiProgram.PRG_CONTENT_WRAPPER_NAME);
		this.m_contentPage.useMaxSpace();
		this.m_contentPage.setShowHeader(false);
		this.m_contentPage.setShowNavButton(false);
		this.m_contentPage.setContentOnlyBusy(true);
		this.m_contentPage.setEnableScrolling(false);
		if (this.isShowMenuBar())
		{
			this.m_programMenuBar = genesis.newControl(oFF.UiType.OVERFLOW_TOOLBAR);
			this.m_programMenuBar.setTag(oFF.DfUiProgram.PRG_MENU_BAR_NAME);
			this.m_programMenuBar.setToolbarDesign(oFF.UiToolbarDesign.SOLID);
			this.m_programMenuBar.setWidth(oFF.UiCssLength.create("100%"));
			if (oFF.XStringUtils.isNotNullAndNotEmpty(this.getMenuBarDisplayName()) && !this.isEmbedded())
			{
				this.addMenuBarButton(this.getMenuBarDisplayName(), null, oFF.DfUiProgram.DEFAULT_MENU_BAR_PROGRAM_NAME_BTN_TAG,  function(controlEvent){
					var control = controlEvent.getControl();
					this.createProgramMenuBarEntry(control);
				}.bind(this));
			}
			this.m_contentPage.setSubHeader(this.m_programMenuBar);
		}
		genesis.setRoot(this.m_contentPage);
		var contentGenesis = oFF.UiGenesis.create(this.m_contentPage);
		this.proceedWithStartup(contentGenesis);
	}
	else
	{
		this.proceedWithStartup(genesis);
	}
};
oFF.DfUiProgram.prototype.proceedWithStartup = function(genesis)
{
	this.m_genesis = genesis;
	var setupPromise = this.setupProgram();
	if (oFF.isNull(setupPromise))
	{
		this.buildUi(genesis);
	}
	else
	{
		this._showSetupPromiseBusyIndicatorIfNeeded();
		setupPromise.then( function(boolVal){
			if (!this.isReleased())
			{
				this.buildUi(genesis);
			}
			return boolVal;
		}.bind(this),  function(error){
			genesis.showErrorToast(error.getText());
			this.kill();
		}.bind(this)).onFinally( function(){
			this._hideSetupPromiseBusyIndicatorIfNeeded();
		}.bind(this));
	}
};
oFF.DfUiProgram.prototype.getUiManager = function()
{
	var uiManager = this.getProcess().getUiManager();
	if (oFF.isNull(uiManager))
	{
		uiManager = this.getProcess().openSubSystem(oFF.SubSystemType.GUI);
	}
	if (oFF.isNull(uiManager) && oFF.notNull(this.m_genesis))
	{
		uiManager = this.m_genesis.getUiManager();
	}
	return uiManager;
};
oFF.DfUiProgram.prototype.getGenesis = function()
{
	return this.m_genesis;
};
oFF.DfUiProgram.prototype.setTitle = function(title)
{
	var programContainer = this.getProgramContainer();
	if (oFF.notNull(programContainer))
	{
		programContainer.setTitle(title);
	}
};
oFF.DfUiProgram.prototype.getTitle = function()
{
	var programContainer = this.getProgramContainer();
	if (oFF.notNull(programContainer))
	{
		return programContainer.getTitle();
	}
	return "";
};
oFF.DfUiProgram.prototype.setBusy = function(busy)
{
	var programContainer = this.getProgramContainer();
	if (oFF.notNull(programContainer))
	{
		programContainer.setBusy(busy);
	}
};
oFF.DfUiProgram.prototype.isBusy = function()
{
	var programContainer = this.getProgramContainer();
	if (oFF.notNull(programContainer))
	{
		return programContainer.isBusy();
	}
	return false;
};
oFF.DfUiProgram.prototype.presentExitConfirmPopup = function(title, message)
{
	var exitConfirmPopup = oFF.UtConfirmPopup.create(this.getGenesis(), title, message);
	exitConfirmPopup.setConfirmButtonText("Exit");
	exitConfirmPopup.setConfirmButtonIcon("delete");
	exitConfirmPopup.setConfirmButtonType(oFF.UiButtonType.DESTRUCTIVE);
	exitConfirmPopup.setConfirmProcedure( function(){
		this.kill();
	}.bind(this));
	exitConfirmPopup.open();
};
oFF.DfUiProgram.prototype.getMenuBar = function()
{
	if (oFF.notNull(this.m_programMenuBar))
	{
		return this.m_programMenuBar;
	}
	return oFF.UiContextDummy.getSingleton().getContent();
};
oFF.DfUiProgram.prototype.addMenuBarButton = function(text, icon, tag, pressConsumer)
{
	if (this.getMenuBar() !== null)
	{
		var tmpMenuBarButton = this.getMenuBar().addNewItemOfType(oFF.UiType.BUTTON);
		tmpMenuBarButton.setButtonType(oFF.UiButtonType.TRANSPARENT);
		tmpMenuBarButton.setTag(tag);
		tmpMenuBarButton.setText(text);
		tmpMenuBarButton.setIcon(icon);
		tmpMenuBarButton.registerOnPress(oFF.UiLambdaPressListener.create(pressConsumer));
		return tmpMenuBarButton;
	}
	return oFF.UiContextDummy.getSingleton().getContent();
};
oFF.DfUiProgram.prototype.showMenuBar = function(show)
{
	if (oFF.notNull(this.m_contentPage))
	{
		this.m_contentPage.setShowSubHeader(show);
	}
};
oFF.DfUiProgram.prototype.isMenuBarVisible = function()
{
	if (oFF.isNull(this.m_programMenuBar))
	{
		return false;
	}
	if (oFF.notNull(this.m_contentPage))
	{
		return this.m_contentPage.isShowSubHeader();
	}
	return false;
};
oFF.DfUiProgram.prototype.getOffsetWidth = function()
{
	var uiPrgContainer = this._getUiPrgContainerSafe();
	if (oFF.notNull(uiPrgContainer))
	{
		return uiPrgContainer.getOffsetWidth();
	}
	return 0;
};
oFF.DfUiProgram.prototype.getOffsetHeight = function()
{
	var uiPrgContainer = this._getUiPrgContainerSafe();
	if (oFF.notNull(uiPrgContainer))
	{
		return uiPrgContainer.getOffsetHeight();
	}
	return 0;
};
oFF.DfUiProgram.prototype.isStandalone = function()
{
	return this.getResolvedProgramContainerType() === oFF.ProgramContainerType.STANDALONE;
};
oFF.DfUiProgram.prototype.isEmbedded = function()
{
	return this.getResolvedProgramContainerType() !== null && this.getResolvedProgramContainerType().isEmbeddedContainer();
};
oFF.DfUiProgram.prototype.getLocalization = function()
{
	return oFF.UiLocalizationCenter.getCenter();
};
oFF.DfUiProgram.prototype.getTheme = function()
{
	return oFF.UiTheme.getCurrentTheme();
};
oFF.DfUiProgram.prototype.getLocalStorage = function()
{
	return this.getProcess().getLocalStorage();
};
oFF.DfUiProgram.prototype.getLocalNotificationCenter = function()
{
	return this.getProcess().getLocalNotificationCenter();
};
oFF.DfUiProgram.prototype.setNativeAnchorId = function(nativeAnchorId)
{
	this.getSession().setNativeAnchorId(nativeAnchorId);
};
oFF.DfUiProgram.prototype.setNativeAnchorObject = function(nativeAnchorObject)
{
	this.getSession().setNativeAnchorObject(nativeAnchorObject);
};
oFF.DfUiProgram.prototype.shouldWrapContentInPage = function()
{
	return this.getUiManager().getPlatform().isTypeOf(oFF.XPlatform.IOS) === false && (this.getResolvedProgramContainerType() === oFF.ProgramContainerType.WINDOW || this.getResolvedProgramContainerType() === oFF.ProgramContainerType.STANDALONE || this.getResolvedProgramContainerType() === oFF.ProgramContainerType.CONTENT);
};
oFF.DfUiProgram.prototype.createProgramMenuBarEntry = function(prgDefaultMenuBtn)
{
	if (oFF.notNull(prgDefaultMenuBtn))
	{
		var programtMenu = this.m_genesis.newControl(oFF.UiType.MENU);
		programtMenu.setTag(oFF.DfUiProgram.DEFAULT_MENU_BAR_PROGRAM_NAME_MENU_TAG);
		programtMenu.addAllItems(this.getProgramMenuItemsInternal());
		if (!this.isEmbedded())
		{
			programtMenu.addNewItem().setTag(oFF.DfUiProgram.DEFAULT_MENU_BAR_PROGRAM_NAME_MENU_EXIT_BTN_TAG).setText("Exit").setIcon("decline").setSectionStart(true).registerOnPress(oFF.UiLambdaPressListener.create( function(controlEvent){
				this.terminate();
			}.bind(this)));
		}
		programtMenu.openAt(prgDefaultMenuBtn);
	}
};
oFF.DfUiProgram.prototype.getProgramMenuItemsInternal = function()
{
	var tmpList = null;
	var menuItems = this.getProgramMenuItems(this.getGenesis());
	if (oFF.notNull(menuItems) && menuItems.size() > 0)
	{
		tmpList = oFF.XList.create();
		var menuItemsIterator = menuItems.getIterator();
		while (menuItemsIterator.hasNext())
		{
			var tmpMenuItem = menuItemsIterator.next();
			tmpList.add(tmpMenuItem);
		}
	}
	return tmpList;
};
oFF.DfUiProgram.prototype._showSetupPromiseBusyIndicatorIfNeeded = function()
{
	if (this.showActivityIndicatorOnSetupPromise() && !this.isReleased())
	{
		this.setBusy(true);
	}
};
oFF.DfUiProgram.prototype._hideSetupPromiseBusyIndicatorIfNeeded = function()
{
	if (this.showActivityIndicatorOnSetupPromise() && !this.isReleased())
	{
		this.setBusy(false);
	}
};
oFF.DfUiProgram.prototype._getUiPrgContainerSafe = function()
{
	var uiPrgContainer = null;
	try
	{
		uiPrgContainer = this.getProgramContainer();
	}
	catch (error)
	{
		this.logWarning(oFF.XException.getMessage(error));
	}
	return uiPrgContainer;
};
oFF.DfUiProgram.prototype.getDefaultContainerSize = function()
{
	return null;
};
oFF.DfUiProgram.prototype.getDefaultContainerPosition = function()
{
	return null;
};
oFF.DfUiProgram.prototype.isOpenContainerMaximized = function()
{
	return false;
};
oFF.DfUiProgram.prototype.isShowMenuBar = function()
{
	return false;
};
oFF.DfUiProgram.prototype.getMenuBarDisplayName = function()
{
	if (this.getProcess() !== null)
	{
		var prgCfg = this.getProcess().getProgramCfg();
		if (oFF.notNull(prgCfg))
		{
			var menuBarName = prgCfg.getProgramManifest().getDisplayName();
			if (oFF.XStringUtils.isNullOrEmpty(menuBarName))
			{
				menuBarName = prgCfg.getProgramManifest().getProgramName();
			}
			return menuBarName;
		}
	}
	return "PrgMenu";
};
oFF.DfUiProgram.prototype.getContainerName = function()
{
	return null;
};
oFF.DfUiProgram.prototype.getContainerCssClass = function()
{
	return null;
};
oFF.DfUiProgram.prototype.getProgramMenuItems = function(genesis)
{
	return null;
};
oFF.DfUiProgram.prototype.getDialogButtons = function(genesis)
{
	return null;
};
oFF.DfUiProgram.prototype.getWindowMenuItems = function(genesis)
{
	return null;
};
oFF.DfUiProgram.prototype.isResizeAllowed = function()
{
	return false;
};
oFF.DfUiProgram.prototype.showActivityIndicatorOnSetupPromise = function()
{
	return true;
};
oFF.DfUiProgram.prototype.onContainerResize = function(newWidth, newHeight) {};

oFF.QuasarComponentType = function() {};
oFF.QuasarComponentType.prototype = new oFF.XComponentType();
oFF.QuasarComponentType.prototype._ff_c = "QuasarComponentType";

oFF.QuasarComponentType.JSON_DATA_PROVIDER = null;
oFF.QuasarComponentType.REST_DATA_PROVIDER = null;
oFF.QuasarComponentType.staticSetupQuasarType = function()
{
	oFF.QuasarComponentType.JSON_DATA_PROVIDER = oFF.QuasarComponentType.createQuasarType("JsonDataProvider", oFF.IoComponentType.DATA_PROVIDER);
	oFF.QuasarComponentType.REST_DATA_PROVIDER = oFF.QuasarComponentType.createQuasarType("RestDataProvider", oFF.IoComponentType.DATA_PROVIDER);
};
oFF.QuasarComponentType.createQuasarType = function(constant, parent)
{
	var mt = new oFF.QuasarComponentType();
	if (oFF.isNull(parent))
	{
		mt.setupExt(constant, oFF.XComponentType._ROOT);
	}
	else
	{
		mt.setupExt(constant, parent);
	}
	return mt;
};

oFF.UiPrgContainerGenericWindow = function() {};
oFF.UiPrgContainerGenericWindow.prototype = new oFF.UiPrgContainerFloating();
oFF.UiPrgContainerGenericWindow.prototype._ff_c = "UiPrgContainerGenericWindow";

oFF.UiPrgContainerGenericWindow.GEN_WIN_PRG_CON_TASKBAR_BTN_CONTEXT_MENU_NAME = "windowTaskBarBtnContextMenu";
oFF.UiPrgContainerGenericWindow.GEN_WIN_PRG_CON_TASKBAR_BTN_CONTEXT_MENU_CLOSE_NAME = "windowTaskBarCloseMenuItem";
oFF.UiPrgContainerGenericWindow.GEN_WIN_PRG_CON_TASKBAR_BTN_CONTEXT_MENU_VISIBILLITY_NAME = "windowTaskBarToggleVisibillityMenuItem";
oFF.UiPrgContainerGenericWindow.GEN_WIN_PRG_CON_TASKBAR_BTN_CONTEXT_MENU_SPLIT_LEFT_NAME = "windowTaskBarSplitLeftMenuItem";
oFF.UiPrgContainerGenericWindow.GEN_WIN_PRG_CON_TASKBAR_BTN_CONTEXT_MENU_SPLIT_RIGHT_NAME = "windowTaskBarSplitRightMenuItem";
oFF.UiPrgContainerGenericWindow.prototype.m_taskBarButton = null;
oFF.UiPrgContainerGenericWindow.prototype.m_containerWindow = null;
oFF.UiPrgContainerGenericWindow.prototype.releaseObject = function()
{
	oFF.UiPrgContainerFloating.prototype.releaseObject.call( this );
	this.m_taskBarButton = null;
	this.m_containerWindow = oFF.XObjectExt.release(this.m_containerWindow);
};
oFF.UiPrgContainerGenericWindow.prototype.setTitle = function(title)
{
	oFF.UiPrgContainerFloating.prototype.setTitle.call( this , title);
	if (this.getWindow() !== null)
	{
		this.getWindow().setTitle(title);
	}
	if (this.getTaskBarButton() !== null)
	{
		this.getTaskBarButton().setText(title);
	}
};
oFF.UiPrgContainerGenericWindow.prototype.openAndRun = function(uiManager)
{
	oFF.UiPrgContainerFloating.prototype.openAndRun.call( this , uiManager);
};
oFF.UiPrgContainerGenericWindow.prototype.isContainerOpen = function()
{
	if (this.getWindow() !== null)
	{
		return this.getWindow().isOpen();
	}
	return false;
};
oFF.UiPrgContainerGenericWindow.prototype.isModalContainer = function()
{
	return false;
};
oFF.UiPrgContainerGenericWindow.prototype.getWindow = function()
{
	return this.m_containerWindow;
};
oFF.UiPrgContainerGenericWindow.prototype.setTaskBarButton = function(taskBarBtn)
{
	if (oFF.notNull(taskBarBtn))
	{
		this.m_taskBarButton = taskBarBtn;
		this.m_taskBarButton.registerOnPress(this);
		this.m_taskBarButton.registerOnContextMenu(this);
	}
};
oFF.UiPrgContainerGenericWindow.prototype.closeContainerControl = function()
{
	if (this.getWindow() !== null && this.isContainerOpen())
	{
		this.getWindow().close();
	}
};
oFF.UiPrgContainerGenericWindow.prototype.openContainerControl = function()
{
	if (this.getWindow() !== null && !this.isContainerOpen())
	{
		this.getWindow().open();
	}
};
oFF.UiPrgContainerGenericWindow.prototype.getContainerOffsetWidth = function()
{
	if (this.getWindow() !== null)
	{
		return this.getWindow().getOffsetWidth();
	}
	return 0;
};
oFF.UiPrgContainerGenericWindow.prototype.getContainerOffsetHeight = function()
{
	if (this.getWindow() !== null)
	{
		return this.getWindow().getOffsetHeight();
	}
	return 0;
};
oFF.UiPrgContainerGenericWindow.prototype.getTaskBarButton = function()
{
	return this.m_taskBarButton;
};
oFF.UiPrgContainerGenericWindow.prototype.setContainerWindow = function(containerWindow)
{
	this.m_containerWindow = containerWindow;
	if (this.getInitialContainerSize() !== null)
	{
		this.m_containerWindow.setSize(this.getInitialContainerSize());
	}
	if (this.getInitialContainerPosition() !== null)
	{
		this.m_containerWindow.setPosition(this.getInitialContainerPosition());
	}
	if (this.shouldContainerOpenMaximized())
	{
		this.m_containerWindow.maximize(false);
	}
	this.createWindowMenuIfAvailable();
};
oFF.UiPrgContainerGenericWindow.prototype.toggleContainerWindowVisibillityState = function()
{
	if (this.getWindow().isHidden())
	{
		this.getWindow().show(true, this.getTaskBarButton());
	}
	else
	{
		this.getWindow().hide(true, this.getTaskBarButton());
	}
};
oFF.UiPrgContainerGenericWindow.prototype.toggleContainerWindowMaximizedState = function()
{
	if (this.getWindow().isMaximized())
	{
		this.getWindow().restore(true);
	}
	else
	{
		this.getWindow().maximize(true);
	}
};
oFF.UiPrgContainerGenericWindow.prototype.handleTaskBarbuttonPress = function(animated)
{
	if (this.getWindow().isHidden())
	{
		this.getWindow().show(animated, this.getTaskBarButton());
	}
	else
	{
		this.getWindow().bringToFront();
	}
};
oFF.UiPrgContainerGenericWindow.prototype.handleSplitWindowLeft = function()
{
	this.handleTaskBarbuttonPress(false);
	this.getWindow().setFrameCss("0px", "0px", "50%", "100%");
};
oFF.UiPrgContainerGenericWindow.prototype.handleSplitWindowRight = function()
{
	this.handleTaskBarbuttonPress(false);
	this.getWindow().setFrameCss("50%", "0px", "50%", "100%");
};
oFF.UiPrgContainerGenericWindow.prototype.internalCleanup = function()
{
	this.removeTaskBarButtonFromParent();
	oFF.UiPrgContainerFloating.prototype.internalCleanup.call( this );
};
oFF.UiPrgContainerGenericWindow.prototype.createTaskBarButtonMenu = function(taskBarButton)
{
	var contextMenu = this.getGenesis().newControl(oFF.UiType.MENU);
	contextMenu.setName(oFF.UiPrgContainerGenericWindow.GEN_WIN_PRG_CON_TASKBAR_BTN_CONTEXT_MENU_NAME);
	var closePrgMenuItem = contextMenu.addNewItem();
	closePrgMenuItem.setName(oFF.UiPrgContainerGenericWindow.GEN_WIN_PRG_CON_TASKBAR_BTN_CONTEXT_MENU_CLOSE_NAME);
	closePrgMenuItem.setText("Close program");
	closePrgMenuItem.setIcon("decline");
	closePrgMenuItem.registerOnPress(this);
	closePrgMenuItem.setCustomObject(taskBarButton);
	var toggleVisibillityMenuItem = contextMenu.addNewItem();
	toggleVisibillityMenuItem.setName(oFF.UiPrgContainerGenericWindow.GEN_WIN_PRG_CON_TASKBAR_BTN_CONTEXT_MENU_VISIBILLITY_NAME);
	toggleVisibillityMenuItem.setText(this.getWindow().isHidden() ? "Show" : "Hide");
	toggleVisibillityMenuItem.setIcon(this.getWindow().isHidden() ? "header" : "minimize");
	toggleVisibillityMenuItem.registerOnPress(this);
	toggleVisibillityMenuItem.setCustomObject(taskBarButton);
	var splitLeftMenuItem = contextMenu.addNewItem();
	splitLeftMenuItem.setName(oFF.UiPrgContainerGenericWindow.GEN_WIN_PRG_CON_TASKBAR_BTN_CONTEXT_MENU_SPLIT_LEFT_NAME);
	splitLeftMenuItem.setText("Split left");
	splitLeftMenuItem.setIcon("slim-arrow-left");
	splitLeftMenuItem.registerOnPress(this);
	splitLeftMenuItem.setCustomObject(taskBarButton);
	var splitRightMenuItem = contextMenu.addNewItem();
	splitRightMenuItem.setName(oFF.UiPrgContainerGenericWindow.GEN_WIN_PRG_CON_TASKBAR_BTN_CONTEXT_MENU_SPLIT_RIGHT_NAME);
	splitRightMenuItem.setText("Split right");
	splitRightMenuItem.setIcon("slim-arrow-right");
	splitRightMenuItem.registerOnPress(this);
	splitRightMenuItem.setCustomObject(taskBarButton);
	return contextMenu;
};
oFF.UiPrgContainerGenericWindow.prototype.removeTaskBarButtonFromParent = function()
{
	var tempTaskBarBtn = this.getTaskBarButton();
	if (oFF.notNull(tempTaskBarBtn))
	{
		var taskBarBtnParent = tempTaskBarBtn.getParent();
		if (oFF.notNull(taskBarBtnParent) && taskBarBtnParent.getUiType() === oFF.UiType.TASK_BAR)
		{
			taskBarBtnParent.removeItem(tempTaskBarBtn);
		}
	}
};
oFF.UiPrgContainerGenericWindow.prototype.getWindowMenuItems = function()
{
	if (this.getProgram().getResolvedProgramContainerType().isUiContainer())
	{
		var uiPrg = this.getUiProgram();
		var tmpMenuItems = uiPrg.getWindowMenuItems(this.getGenesis());
		var tmpList = oFF.XList.create();
		oFF.XCollectionUtils.forEach(tmpMenuItems,  function(menuItem){
			if (menuItem.getUiType() === oFF.UiType.MENU_ITEM)
			{
				tmpList.add(menuItem);
			}
		}.bind(this));
		return tmpList;
	}
	return null;
};
oFF.UiPrgContainerGenericWindow.prototype.createWindowMenuIfAvailable = function()
{
	var tmpMenuItems = this.getWindowMenuItems();
	if (oFF.notNull(tmpMenuItems) && tmpMenuItems.size() > 0)
	{
		this.getWindow().registerOnMenuPress(oFF.UiLambdaMenuPressListener.create( function(controlEvent){
			var posX = controlEvent.getParameters().getIntegerByKeyExt(oFF.UiEventParams.PARAM_MENU_X, -1);
			var posy = controlEvent.getParameters().getIntegerByKeyExt(oFF.UiEventParams.PARAM_MENU_Y, -1);
			var windowMenu = this.getGenesis().newControl(oFF.UiType.MENU);
			windowMenu.addAllItems(this.getWindowMenuItems());
			windowMenu.openAtPosition(posX, posy);
		}.bind(this)));
	}
};
oFF.UiPrgContainerGenericWindow.prototype.onOpen = function(event)
{
	this.notifyContainerOpened();
};
oFF.UiPrgContainerGenericWindow.prototype.onClose = function(event)
{
	this.killProgram();
};
oFF.UiPrgContainerGenericWindow.prototype.onMoveEnd = function(event) {};
oFF.UiPrgContainerGenericWindow.prototype.onButtonPress = function(event)
{
	var pressedButtonName = event.getParameters().getStringByKeyExt(oFF.UiEventParams.PARAM_PRESSED_BUTTON_TYPE, null);
	var pressedButtonType = oFF.UiPressedButtonType.lookup(pressedButtonName);
	if (oFF.notNull(pressedButtonType) && pressedButtonType === oFF.UiPressedButtonType.HIDE)
	{
		this.toggleContainerWindowVisibillityState();
	}
	if (oFF.notNull(pressedButtonType) && pressedButtonType === oFF.UiPressedButtonType.MAXIMIZE)
	{
		this.toggleContainerWindowMaximizedState();
	}
	if (oFF.notNull(pressedButtonType) && pressedButtonType === oFF.UiPressedButtonType.CLOSE)
	{
		this.terminateProgram();
	}
};
oFF.UiPrgContainerGenericWindow.prototype.onPress = function(event)
{
	var pressedElement = event.getControl();
	var name = pressedElement.getName();
	if (pressedElement.getUiType() === oFF.UiType.TASK_BAR_BUTTON)
	{
		this.handleTaskBarbuttonPress(true);
	}
	else if (pressedElement.getUiType() === oFF.UiType.MENU_ITEM)
	{
		switch (name)
		{
			case oFF.UiPrgContainerGenericWindow.GEN_WIN_PRG_CON_TASKBAR_BTN_CONTEXT_MENU_CLOSE_NAME:
				this.terminateProgram();
				break;

			case oFF.UiPrgContainerGenericWindow.GEN_WIN_PRG_CON_TASKBAR_BTN_CONTEXT_MENU_VISIBILLITY_NAME:
				this.toggleContainerWindowVisibillityState();
				break;

			case oFF.UiPrgContainerGenericWindow.GEN_WIN_PRG_CON_TASKBAR_BTN_CONTEXT_MENU_SPLIT_LEFT_NAME:
				this.handleSplitWindowLeft();
				break;

			case oFF.UiPrgContainerGenericWindow.GEN_WIN_PRG_CON_TASKBAR_BTN_CONTEXT_MENU_SPLIT_RIGHT_NAME:
				this.handleSplitWindowRight();
				break;

			default:
		}
	}
};
oFF.UiPrgContainerGenericWindow.prototype.onContextMenu = function(event)
{
	var element = event.getControl();
	var posX = event.getParameters().getIntegerByKeyExt(oFF.UiEventParams.PARAM_CLICK_X, 0);
	var posY = event.getParameters().getIntegerByKeyExt(oFF.UiEventParams.PARAM_CLICK_Y, 0);
	var contextMenu = null;
	if (element.getUiType() === oFF.UiType.TASK_BAR_BUTTON)
	{
		contextMenu = this.createTaskBarButtonMenu(element);
	}
	if (oFF.notNull(contextMenu))
	{
		contextMenu.openAtPosition(posX, posY);
	}
};

oFF.UiPrgContainerContent = function() {};
oFF.UiPrgContainerContent.prototype = new oFF.UiPrgContainerEmbedded();
oFF.UiPrgContainerContent.prototype._ff_c = "UiPrgContainerContent";

oFF.UiPrgContainerContent.createExt = function(startCfg, program)
{
	var container = new oFF.UiPrgContainerContent();
	container.setupContainer(startCfg, program);
	return container;
};
oFF.UiPrgContainerContent.prototype.m_contentControl = null;
oFF.UiPrgContainerContent.prototype.runFull = function()
{
	try
	{
		var process = this.getProcess();
		var startConfiguration = process.getProgramCfg();
		this.m_contentControl = startConfiguration.getAnchorContentControl();
	}
	catch (e)
	{
		this.m_contentControl = null;
	}
	if (oFF.isNull(this.m_contentControl) || !this.m_contentControl.hasProperty(oFF.UiProperty.CONTENT))
	{
		throw oFF.XException.createRuntimeException("Missing content control! A content program container requires a content based control to be specified!");
	}
	else
	{
		this.openAndRun(this.getUiManager());
	}
};
oFF.UiPrgContainerContent.prototype.openAndRun = function(uiManager)
{
	var uiProgram = this.getUiProgram();
	uiProgram.prepareArguments();
	uiProgram.initializeProgram();
	uiProgram.evalArguments();
	var genesis = oFF.UiGenesis.create(this.m_contentControl);
	genesis.clearUi();
	this.setContainerNameAndCssClass(this.m_contentControl);
	uiProgram.renderUi(genesis);
	this.setContainerOpened();
};
oFF.UiPrgContainerContent.prototype.getContainerType = function()
{
	return oFF.ProgramContainerType.CONTENT;
};
oFF.UiPrgContainerContent.prototype.getContainerControl = function()
{
	return this.m_contentControl;
};

oFF.UiPrgContainerDialog = function() {};
oFF.UiPrgContainerDialog.prototype = new oFF.UiPrgContainerFloating();
oFF.UiPrgContainerDialog.prototype._ff_c = "UiPrgContainerDialog";

oFF.UiPrgContainerDialog.DIALOG_PRG_CONTAINER_TAG = "ffDialogPrgContainer";
oFF.UiPrgContainerDialog.createExt = function(startCfg, program)
{
	var dialogContainer = new oFF.UiPrgContainerDialog();
	dialogContainer.setupContainer(startCfg, program);
	return dialogContainer;
};
oFF.UiPrgContainerDialog.prototype.m_containerDialog = null;
oFF.UiPrgContainerDialog.prototype.setupUiContainer = function(startCfg, program)
{
	oFF.UiPrgContainerFloating.prototype.setupContainer.call( this , startCfg, program);
};
oFF.UiPrgContainerDialog.prototype.releaseObject = function()
{
	oFF.UiPrgContainerFloating.prototype.releaseObject.call( this );
	this.m_containerDialog = oFF.XObjectExt.release(this.m_containerDialog);
};
oFF.UiPrgContainerDialog.prototype.setTitle = function(title)
{
	oFF.UiPrgContainerFloating.prototype.setTitle.call( this , title);
	if (this.getDialog() !== null)
	{
		this.getDialog().setTitle(title);
	}
};
oFF.UiPrgContainerDialog.prototype.openAndRun = function(uiManager)
{
	oFF.UiPrgContainerFloating.prototype.openAndRun.call( this , uiManager);
	var uiProgram = this.getProgram();
	uiProgram.prepareArguments();
	uiProgram.initializeProgram();
	uiProgram.evalArguments();
	var tmpDialog = uiManager.newControl(oFF.UiType.DIALOG);
	tmpDialog.setTag(oFF.UiPrgContainerDialog.DIALOG_PRG_CONTAINER_TAG);
	tmpDialog.setTitle(this.getTitle());
	tmpDialog.setHeight(oFF.UiCssLength.create("500px"));
	tmpDialog.setWidth(oFF.UiCssLength.create("600px"));
	tmpDialog.registerOnAfterOpen(oFF.UiLambdaAfterOpenListener.create( function(controlEvent){
		this.notifyContainerOpened();
	}.bind(this)));
	tmpDialog.registerOnAfterClose(oFF.UiLambdaAfterCloseListener.create( function(controlEvent2){
		this.killProgram();
	}.bind(this)));
	tmpDialog.registerOnEscape(oFF.UiLambdaEscapeListener.create( function(controlEvent3){
		this.terminateProgram();
	}.bind(this)));
	tmpDialog.registerOnResize(oFF.UiLambdaResizeListener.create( function(resizeEvent){
		this.notifyContainerResized(resizeEvent.getOffsetWidth(), resizeEvent.getOffsetHeight());
	}.bind(this)));
	tmpDialog.setCustomObject(this);
	this.setContainerDialog(tmpDialog);
	tmpDialog.setResizable(this.canResize());
	tmpDialog.open();
	var innerGenesis = oFF.UiGenesis.create(tmpDialog);
	uiProgram.renderUi(innerGenesis);
};
oFF.UiPrgContainerDialog.prototype.isContainerOpen = function()
{
	if (this.getDialog() !== null)
	{
		return this.getDialog().isOpen();
	}
	return false;
};
oFF.UiPrgContainerDialog.prototype.isModalContainer = function()
{
	return true;
};
oFF.UiPrgContainerDialog.prototype.getContainerType = function()
{
	return oFF.ProgramContainerType.DIALOG;
};
oFF.UiPrgContainerDialog.prototype.getDialog = function()
{
	return this.m_containerDialog;
};
oFF.UiPrgContainerDialog.prototype.shake = function()
{
	if (this.getDialog() !== null)
	{
		this.getDialog().shake();
	}
};
oFF.UiPrgContainerDialog.prototype.closeContainerControl = function()
{
	if (this.getDialog() !== null && this.isContainerOpen())
	{
		this.getDialog().close();
	}
};
oFF.UiPrgContainerDialog.prototype.openContainerControl = function()
{
	if (this.getDialog() !== null && !this.isContainerOpen())
	{
		this.getDialog().open();
	}
};
oFF.UiPrgContainerDialog.prototype.getContainerOffsetWidth = function()
{
	if (this.getDialog() !== null)
	{
		return this.getDialog().getOffsetWidth();
	}
	return 0;
};
oFF.UiPrgContainerDialog.prototype.getContainerOffsetHeight = function()
{
	if (this.getDialog() !== null)
	{
		return this.getDialog().getOffsetHeight();
	}
	return 0;
};
oFF.UiPrgContainerDialog.prototype.setContainerDialog = function(dialog)
{
	this.m_containerDialog = dialog;
	this.setContainerNameAndCssClass(dialog);
	if (this.getInitialContainerSize() !== null)
	{
		this.m_containerDialog.setSize(this.getInitialContainerSize());
	}
	var dlgBtns = this.getDialogButtons();
	if (oFF.notNull(dlgBtns) && dlgBtns.size() > 0)
	{
		this.getDialog().addAllDialogButtons(dlgBtns);
	}
	else
	{
		this.addAutoCreatedCloseButton();
	}
};
oFF.UiPrgContainerDialog.prototype.addAutoCreatedCloseButton = function()
{
	var autoCreatedCloseBtn = this.getDialog().addNewDialogButton();
	autoCreatedCloseBtn.setText("Close");
	autoCreatedCloseBtn.registerOnPress(oFF.UiLambdaPressListener.create( function(controlEvent){
		this.terminateProgram();
	}.bind(this)));
};
oFF.UiPrgContainerDialog.prototype.getDialogButtons = function()
{
	if (this.getUiProgram() !== null && this.getProgram().getResolvedProgramContainerType().isUiContainer())
	{
		return this.getUiProgram().getDialogButtons(this.getGenesis());
	}
	return null;
};
oFF.UiPrgContainerDialog.prototype.canResize = function()
{
	if (this.getUiProgram() !== null && this.getProgram().getResolvedProgramContainerType().isUiContainer())
	{
		return this.getUiProgram().isResizeAllowed();
	}
	return false;
};
oFF.UiPrgContainerDialog.prototype.getContainerControl = function()
{
	return this.getDialog();
};

oFF.UiPrgContainerStandalone = function() {};
oFF.UiPrgContainerStandalone.prototype = new oFF.UiPrgContainerEmbedded();
oFF.UiPrgContainerStandalone.prototype._ff_c = "UiPrgContainerStandalone";

oFF.UiPrgContainerStandalone.createExt = function(startCfg, program)
{
	var container = new oFF.UiPrgContainerStandalone();
	container.setupContainer(startCfg, program);
	return container;
};
oFF.UiPrgContainerStandalone.prototype.m_rootGuid = null;
oFF.UiPrgContainerStandalone.prototype.m_root = null;
oFF.UiPrgContainerStandalone.prototype.releaseObject = function()
{
	this.m_root = oFF.XObjectExt.release(this.m_root);
	oFF.UiPrgContainerEmbedded.prototype.releaseObject.call( this );
};
oFF.UiPrgContainerStandalone.prototype.runFull = function()
{
	var process = this.getProcess();
	var uiManager = this.getUiManager();
	if (oFF.notNull(uiManager))
	{
		this.m_rootGuid = oFF.XGuid.getGuid();
		var startConfiguration = process.getProgramCfg();
		var nativeAnchorId = startConfiguration.getNativeAnchorId();
		var nativeAnchorObject = startConfiguration.getNativeAnchorObject();
		uiManager.setNativeAnchor(this.m_rootGuid, nativeAnchorId, nativeAnchorObject);
		uiManager.invokeOnEventingThread(this);
	}
};
oFF.UiPrgContainerStandalone.prototype.openAndRun = function(uiManager)
{
	var uiProgram = this.getProgram();
	uiProgram.prepareArguments();
	uiProgram.initializeProgram();
	uiProgram.evalArguments();
	if (oFF.notNull(this.m_rootGuid))
	{
		this.m_root = uiManager.getAnchorByName(this.m_rootGuid);
	}
	else
	{
		this.m_root = uiManager.getAnchor();
	}
	var genesis = oFF.UiGenesis.create(this.m_root);
	uiProgram.renderUi(genesis);
	this.setContainerOpened();
};
oFF.UiPrgContainerStandalone.prototype.getContainerType = function()
{
	return oFF.ProgramContainerType.STANDALONE;
};
oFF.UiPrgContainerStandalone.prototype.initializeUi = function(uiManager)
{
	this.openAndRun(uiManager);
};
oFF.UiPrgContainerStandalone.prototype.getContainerControl = function()
{
	return this.m_root;
};

oFF.DfUiDialogProgram = function() {};
oFF.DfUiDialogProgram.prototype = new oFF.DfUiProgram();
oFF.DfUiDialogProgram.prototype._ff_c = "DfUiDialogProgram";

oFF.DfUiDialogProgram.prototype.getDefaultContainerType = function()
{
	return oFF.ProgramContainerType.DIALOG;
};
oFF.DfUiDialogProgram.prototype.releaseObject = function()
{
	oFF.DfUiProgram.prototype.releaseObject.call( this );
};
oFF.DfUiDialogProgram.prototype.getComponentType = function()
{
	return oFF.UiComponentTypeExt.UI_DIALOG_PROGRAM;
};
oFF.DfUiDialogProgram.prototype.shake = function()
{
	try
	{
		var dialogContainer = this.getProgramContainer();
		if (oFF.notNull(dialogContainer) && dialogContainer.getContainerType() === oFF.ProgramContainerType.DIALOG)
		{
			dialogContainer.shake();
		}
	}
	catch (e)
	{
		this.log("Not a dialog container");
	}
};
oFF.DfUiDialogProgram.prototype.getDialogButtons = function(genesis)
{
	return null;
};
oFF.DfUiDialogProgram.prototype.isShowMenuBar = function()
{
	return false;
};

oFF.UiComponentTypeExt = function() {};
oFF.UiComponentTypeExt.prototype = new oFF.UiComponentType();
oFF.UiComponentTypeExt.prototype._ff_c = "UiComponentTypeExt";

oFF.UiComponentTypeExt.UI_STUDIO = null;
oFF.UiComponentTypeExt.UI_PROGRAM = null;
oFF.UiComponentTypeExt.UI_STUDIO_PROGRAM = null;
oFF.UiComponentTypeExt.UI_DIALOG_PROGRAM = null;
oFF.UiComponentTypeExt.staticSetupUiExtComponentType = function()
{
	oFF.UiComponentTypeExt.UI_STUDIO = oFF.UiComponentType.createUiComponentType("UiStudio", oFF.XComponentType._UI);
	oFF.UiComponentTypeExt.UI_PROGRAM = oFF.UiComponentType.createUiComponentType("UiProgram", oFF.RuntimeComponentType.APPLICATION_PROGRAM);
	oFF.UiComponentTypeExt.UI_STUDIO_PROGRAM = oFF.UiComponentType.createUiComponentType("UiStudioProgram", oFF.UiComponentTypeExt.UI_PROGRAM);
	oFF.UiComponentTypeExt.UI_DIALOG_PROGRAM = oFF.UiComponentType.createUiComponentType("UiDialogProgram", oFF.UiComponentTypeExt.UI_PROGRAM);
};

oFF.UiPrgContainerTerminal = function() {};
oFF.UiPrgContainerTerminal.prototype = new oFF.UiPrgContainerGenericWindow();
oFF.UiPrgContainerTerminal.prototype._ff_c = "UiPrgContainerTerminal";

oFF.UiPrgContainerTerminal.TERMINAL_PRG_CONTAINER_TAG = "ffTerminalWindow";
oFF.UiPrgContainerTerminal.COMMAND_SEPERATOR = ",";
oFF.UiPrgContainerTerminal.TERMINAL_COMMAND_HISTORY_KEY = "terminal_commandHistory";
oFF.UiPrgContainerTerminal.MAX_COMMAND_HISTORY_SIZE = 40;
oFF.UiPrgContainerTerminal.createExt = function(startCfg, program)
{
	var newObj = new oFF.UiPrgContainerTerminal();
	newObj.setupContainer(startCfg, program);
	return newObj;
};
oFF.UiPrgContainerTerminal.prototype.m_terminalWindow = null;
oFF.UiPrgContainerTerminal.prototype.m_singleLineListener = null;
oFF.UiPrgContainerTerminal.prototype.m_commandList = null;
oFF.UiPrgContainerTerminal.prototype.releaseObject = function()
{
	this.m_terminalWindow = oFF.XObjectExt.release(this.m_terminalWindow);
	this.m_commandList = oFF.XObjectExt.release(this.m_commandList);
	oFF.UiPrgContainerGenericWindow.prototype.releaseObject.call( this );
};
oFF.UiPrgContainerTerminal.prototype.openAndRun = function(uiManager)
{
	oFF.UiPrgContainerGenericWindow.prototype.openAndRun.call( this , uiManager);
	var program = this.getProgram();
	var session = program.getSession();
	session.setStdin(this);
	session.setStdout(this);
	session.setStdlog(this);
	program.prepareArguments();
	program.initializeProgram();
	program.evalArguments();
	this.m_terminalWindow = uiManager.newControl(oFF.UiType.TERMINAL);
	this.m_terminalWindow.setTag(oFF.UiPrgContainerTerminal.TERMINAL_PRG_CONTAINER_TAG);
	this.m_terminalWindow.setTitle(this.getTitle());
	this.m_terminalWindow.setCustomObject(this);
	this.m_terminalWindow.registerOnExecute(this);
	this.m_terminalWindow.registerOnOpen(this);
	this.m_terminalWindow.registerOnClose(this);
	this.m_terminalWindow.registerOnButtonPress(this);
	this.m_terminalWindow.registerOnMoveEnd(this);
	this.m_terminalWindow.registerOnResize(oFF.UiLambdaResizeListener.create( function(resizeEvent){
		this.notifyContainerResized(resizeEvent.getOffsetWidth(), resizeEvent.getOffsetHeight());
	}.bind(this)));
	this.setContainerNameAndCssClass(this.m_terminalWindow);
	this.setContainerWindow(this.m_terminalWindow);
	this.initCommandHistory();
	this.m_terminalWindow.open();
	program.runProgram();
};
oFF.UiPrgContainerTerminal.prototype.getContainerType = function()
{
	return oFF.ProgramContainerType.CONSOLE;
};
oFF.UiPrgContainerTerminal.prototype.onExecute = function(event)
{
	if (oFF.notNull(this.m_singleLineListener))
	{
		var listener = this.m_singleLineListener;
		this.m_singleLineListener = null;
		var command = event.getParameters().getStringByKeyExt(oFF.UiEventParams.PARAM_COMMAND, null);
		try
		{
			listener.onLineRead(command);
			this.addCommandToHistory(command);
			command = "";
			this.m_singleLineListener = listener;
		}
		catch (e)
		{
			this.m_singleLineListener = listener;
		}
	}
	else
	{
		this.getTerminalContainer().println("404 Command not found. It got lost in the void...");
	}
};
oFF.UiPrgContainerTerminal.prototype.logExt = function(layer, severity, code, message)
{
	var fullMsg = oFF.DfLogWriter.createLogString(layer, severity, code, message);
	this.getTerminalContainer().println(fullMsg);
};
oFF.UiPrgContainerTerminal.prototype.isLogWritten = function(layer, severity)
{
	return true;
};
oFF.UiPrgContainerTerminal.prototype.println = function(text)
{
	this.getTerminalContainer().println(text);
};
oFF.UiPrgContainerTerminal.prototype.print = function(text)
{
	this.getTerminalContainer().print(text);
};
oFF.UiPrgContainerTerminal.prototype.readLine = function(listener)
{
	this.m_singleLineListener = listener;
	return null;
};
oFF.UiPrgContainerTerminal.prototype.supportsSyncType = function(syncType)
{
	if (syncType === oFF.SyncType.NON_BLOCKING)
	{
		return true;
	}
	else
	{
		return false;
	}
};
oFF.UiPrgContainerTerminal.prototype.getTerminalContainer = function()
{
	return this.getWindow();
};
oFF.UiPrgContainerTerminal.prototype.initCommandHistory = function()
{
	if (this.getTerminalContainer() !== null)
	{
		var cmdHistoryStr = oFF.XLocalStorage.getInstance().getStringByKeyExt(oFF.UiPrgContainerTerminal.TERMINAL_COMMAND_HISTORY_KEY, "");
		this.m_commandList = oFF.XStringTokenizer.splitString(cmdHistoryStr, oFF.UiPrgContainerTerminal.COMMAND_SEPERATOR);
		this.getTerminalContainer().setCommandHistory(this.m_commandList);
	}
	if (oFF.isNull(this.m_commandList))
	{
		this.m_commandList = oFF.XListOfString.create();
	}
};
oFF.UiPrgContainerTerminal.prototype.addCommandToHistory = function(cmd)
{
	if (oFF.XStringUtils.isNotNullAndNotEmpty(cmd))
	{
		if (oFF.notNull(this.m_commandList))
		{
			if (this.m_commandList.size() > 0)
			{
				var lastCmd = oFF.XCollectionUtils.lastString(this.m_commandList);
				if (oFF.XString.isEqual(cmd, lastCmd))
				{
					return;
				}
			}
			this.m_commandList.add(cmd);
			if (this.m_commandList.size() > oFF.UiPrgContainerTerminal.MAX_COMMAND_HISTORY_SIZE)
			{
				this.m_commandList.removeAt(0);
			}
			var cmdHistoryStr = oFF.XCollectionUtils.join(this.m_commandList, oFF.UiPrgContainerTerminal.COMMAND_SEPERATOR);
			oFF.XLocalStorage.getInstance().putString(oFF.UiPrgContainerTerminal.TERMINAL_COMMAND_HISTORY_KEY, cmdHistoryStr);
		}
	}
};
oFF.UiPrgContainerTerminal.prototype.setPath = function(path)
{
	this.getTerminalContainer().setPath(path);
};
oFF.UiPrgContainerTerminal.prototype.setPrompt = function(prompt)
{
	this.getTerminalContainer().setPrompt(prompt);
};
oFF.UiPrgContainerTerminal.prototype.startReadLine = function(text, numOfChars)
{
	this.getTerminalContainer().startReadLine(text, numOfChars);
};
oFF.UiPrgContainerTerminal.prototype.setBlocked = function(isBlocked)
{
	this.getTerminalContainer().setBusy(isBlocked);
};
oFF.UiPrgContainerTerminal.prototype.isBlocked = function()
{
	return this.getTerminalContainer().isBusy();
};
oFF.UiPrgContainerTerminal.prototype.setReadLineFinishedConsumer = function(consumer) {};
oFF.UiPrgContainerTerminal.prototype.getContainerControl = function()
{
	return this.m_terminalWindow;
};

oFF.UiPrgContainerWindow = function() {};
oFF.UiPrgContainerWindow.prototype = new oFF.UiPrgContainerGenericWindow();
oFF.UiPrgContainerWindow.prototype._ff_c = "UiPrgContainerWindow";

oFF.UiPrgContainerWindow.WINDOW_PRG_CONTAINER_TAG = "ffProgramWindow";
oFF.UiPrgContainerWindow.createExt = function(startCfg, program)
{
	var window = new oFF.UiPrgContainerWindow();
	window.setupContainer(startCfg, program);
	return window;
};
oFF.UiPrgContainerWindow.prototype.m_window = null;
oFF.UiPrgContainerWindow.prototype.releaseObject = function()
{
	this.m_window = oFF.XObjectExt.release(this.m_window);
	oFF.UiPrgContainerGenericWindow.prototype.releaseObject.call( this );
};
oFF.UiPrgContainerWindow.prototype.openAndRun = function(uiManager)
{
	oFF.UiPrgContainerGenericWindow.prototype.openAndRun.call( this , uiManager);
	var uiProgram = this.getProgram();
	uiProgram.prepareArguments();
	uiProgram.initializeProgram();
	uiProgram.evalArguments();
	this.m_window = uiManager.newBasicControl(oFF.UiType.WINDOW, null, null, null);
	this.m_window.setTag(oFF.UiPrgContainerWindow.WINDOW_PRG_CONTAINER_TAG);
	this.m_window.setTitle(this.getTitle());
	this.m_window.setCustomObject(this);
	this.m_window.registerOnOpen(this);
	this.m_window.registerOnClose(this);
	this.m_window.registerOnButtonPress(this);
	this.m_window.registerOnMoveEnd(this);
	this.m_window.registerOnResize(oFF.UiLambdaResizeListener.create( function(resizeEvent){
		this.notifyContainerResized(resizeEvent.getOffsetWidth(), resizeEvent.getOffsetHeight());
	}.bind(this)));
	this.setContainerNameAndCssClass(this.m_window);
	this.setContainerWindow(this.m_window);
	this.m_window.open();
	var innerGenesis = oFF.UiGenesis.create(this.m_window);
	uiProgram.renderUi(innerGenesis);
};
oFF.UiPrgContainerWindow.prototype.getContainerType = function()
{
	return oFF.ProgramContainerType.WINDOW;
};
oFF.UiPrgContainerWindow.prototype.getContainerControl = function()
{
	return this.m_window;
};

oFF.UiProgramModule = function() {};
oFF.UiProgramModule.prototype = new oFF.DfModule();
oFF.UiProgramModule.prototype._ff_c = "UiProgramModule";

oFF.UiProgramModule.s_module = null;
oFF.UiProgramModule.getInstance = function()
{
	if (oFF.isNull(oFF.UiProgramModule.s_module))
	{
		oFF.DfModule.checkInitialized(oFF.UiToolsModule.getInstance());
		oFF.UiProgramModule.s_module = oFF.DfModule.startExt(new oFF.UiProgramModule());
		oFF.UiBindingFactory.staticSetupUiBindingFactory();
		oFF.SiTokenType.staticSetup();
		oFF.QuasarComponentType.staticSetupQuasarType();
		oFF.SxJsonDpBindingFactory.staticSetupJsonBindingFactory();
		oFF.SxRestDpBindingFactory.staticSetupJsonBindingFactory();
		oFF.UiComponentTypeExt.staticSetupUiExtComponentType();
		oFF.UiPrgContainerFactory.staticSetupUiContainerFactory();
		oFF.CustomControlRegistration.staticSetup();
		oFF.DfModule.stopExt(oFF.UiProgramModule.s_module);
	}
	return oFF.UiProgramModule.s_module;
};
oFF.UiProgramModule.prototype.getName = function()
{
	return "ff2240.ui.program";
};

oFF.UiProgramModule.getInstance();

return sap.firefly;
	} );