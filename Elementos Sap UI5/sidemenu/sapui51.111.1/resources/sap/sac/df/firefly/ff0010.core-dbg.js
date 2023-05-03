/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
[
"sap/sac/df/firefly/ff0005.language.ext"
],
function(oFF)
{
"use strict";

oFF.XCompararorStringAsNumber = function() {};
oFF.XCompararorStringAsNumber.prototype = new oFF.XObject();
oFF.XCompararorStringAsNumber.prototype._ff_c = "XCompararorStringAsNumber";

oFF.XCompararorStringAsNumber.prototype.m_sortDirection = null;
oFF.XCompararorStringAsNumber.prototype.setupExt = function(sortDirection)
{
	this.m_sortDirection = sortDirection;
};
oFF.XCompararorStringAsNumber.prototype.compare = function(o1, o2)
{
	var i1 = oFF.XInteger.convertFromString(o1);
	var i2 = oFF.XInteger.convertFromString(o2);
	if (i1 === i2)
	{
		return 0;
	}
	var result = 1;
	if (i1 < i2)
	{
		result = -1;
	}
	if (this.m_sortDirection === oFF.XSortDirection.DESCENDING)
	{
		return -result;
	}
	return result;
};

oFF.XComparatorDouble = function() {};
oFF.XComparatorDouble.prototype = new oFF.XObject();
oFF.XComparatorDouble.prototype._ff_c = "XComparatorDouble";

oFF.XComparatorDouble.create = function()
{
	return new oFF.XComparatorDouble();
};
oFF.XComparatorDouble.prototype.compare = function(o1, o2)
{
	var s1 = o1.getDouble();
	var s2 = o2.getDouble();
	if (s1 === s2)
	{
		return 0;
	}
	else if (s1 > s2)
	{
		return 1;
	}
	else
	{
		return -1;
	}
};

oFF.XComparatorInteger = function() {};
oFF.XComparatorInteger.prototype = new oFF.XObject();
oFF.XComparatorInteger.prototype._ff_c = "XComparatorInteger";

oFF.XComparatorInteger.create = function()
{
	return new oFF.XComparatorInteger();
};
oFF.XComparatorInteger.prototype.compare = function(o1, o2)
{
	var s1 = o1.getInteger();
	var s2 = o2.getInteger();
	if (s1 === s2)
	{
		return 0;
	}
	else if (s1 > s2)
	{
		return 1;
	}
	else
	{
		return -1;
	}
};

oFF.XComparatorLambda = function() {};
oFF.XComparatorLambda.prototype = new oFF.XObject();
oFF.XComparatorLambda.prototype._ff_c = "XComparatorLambda";

oFF.XComparatorLambda.create = function(comparingLambda)
{
	var result = new oFF.XComparatorLambda();
	result.m_lambda = comparingLambda;
	return result;
};
oFF.XComparatorLambda.prototype.m_lambda = null;
oFF.XComparatorLambda.prototype.compare = function(o1, o2)
{
	return this.m_lambda(o1, o2).getInteger();
};

oFF.XComparatorLong = function() {};
oFF.XComparatorLong.prototype = new oFF.XObject();
oFF.XComparatorLong.prototype._ff_c = "XComparatorLong";

oFF.XComparatorLong.create = function()
{
	return new oFF.XComparatorLong();
};
oFF.XComparatorLong.prototype.compare = function(o1, o2)
{
	var s1 = o1.getLong();
	var s2 = o2.getLong();
	if (s1 === s2)
	{
		return 0;
	}
	else if (s1 > s2)
	{
		return 1;
	}
	else
	{
		return -1;
	}
};

oFF.XComparatorName = function() {};
oFF.XComparatorName.prototype = new oFF.XObject();
oFF.XComparatorName.prototype._ff_c = "XComparatorName";

oFF.XComparatorName.create = function()
{
	return new oFF.XComparatorName();
};
oFF.XComparatorName.prototype.compare = function(o1, o2)
{
	var s1 = o1.getName();
	var s2 = o2.getName();
	return oFF.XString.compare(s1, s2);
};

oFF.XComparatorString = function() {};
oFF.XComparatorString.prototype = new oFF.XObject();
oFF.XComparatorString.prototype._ff_c = "XComparatorString";

oFF.XComparatorString.create = function(descending)
{
	var comparator = new oFF.XComparatorString();
	comparator.m_descending = descending;
	return comparator;
};
oFF.XComparatorString.prototype.m_descending = false;
oFF.XComparatorString.prototype.compare = function(o1, o2)
{
	if (this.m_descending)
	{
		return oFF.XString.compare(o2.getString(), o1.getString());
	}
	return oFF.XString.compare(o1.getString(), o2.getString());
};

oFF.XArrayUtils = {

	copyFromStringArray:function(source, target, sourceOffset, targetOffset, length)
	{
			var sourcePos = sourceOffset;
		var targetPos = targetOffset;
		var value;
		for (var i = 0; i < length; i++)
		{
			value = source.get(sourcePos);
			target.set(targetPos, value);
			sourcePos++;
			targetPos++;
		}
	},
	copyFromObjectArray:function(source, target, sourceOffset, targetOffset, length)
	{
			var sourcePos = sourceOffset;
		var targetPos = targetOffset;
		var value;
		for (var i = 0; i < length; i++)
		{
			value = source.get(sourcePos);
			target.set(targetPos, value);
			sourcePos++;
			targetPos++;
		}
	}
};

oFF.XListUtils = {

	addAllObjects:function(source, target)
	{
			if (oFF.notNull(source) && source !== target)
		{
			var list = source.getValuesAsReadOnlyList();
			var size = list.size();
			for (var i = 0; i < size; i++)
			{
				target.add(list.get(i));
			}
		}
	},
	sublist:function(source, target, beginIndex, endIndex)
	{
			for (var i = beginIndex; i <= endIndex; i++)
		{
			target.add(source.get(i));
		}
		return target;
	},
	addAllStrings:function(source, target)
	{
			if (oFF.notNull(source) && source !== target)
		{
			var list = source.getValuesAsReadOnlyListOfString();
			var size = list.size();
			for (var i = 0; i < size; i++)
			{
				target.add(list.get(i));
			}
		}
	},
	reorderList:function(list, orderedNames)
	{
			if (oFF.notNull(list) && oFF.notNull(orderedNames))
		{
			if (list.size() === orderedNames.size())
			{
				var existingOrder = list.getKeysAsReadOnlyListOfString();
				if (existingOrder.size() === orderedNames.size())
				{
					var orderIsEqual = true;
					var name;
					for (var i = 0; i < orderedNames.size(); i++)
					{
						name = orderedNames.get(i);
						if (!oFF.XString.isEqual(name, existingOrder.get(i)))
						{
							orderIsEqual = false;
							break;
						}
					}
					if (orderIsEqual === false)
					{
						var element;
						var currentIndex;
						for (var j = 0; j < orderedNames.size(); j++)
						{
							name = orderedNames.get(j);
							element = list.getByKey(name);
							if (oFF.isNull(element))
							{
								return;
							}
						}
						for (var k = 0; k < orderedNames.size(); k++)
						{
							name = orderedNames.get(k);
							element = list.getByKey(name);
							currentIndex = list.getIndex(element);
							list.moveElement(currentIndex, k);
						}
					}
				}
			}
		}
	},
	isListEquals:function(thisObject, otherObject)
	{
			if (thisObject === otherObject)
		{
			return true;
		}
		if (oFF.isNull(thisObject) || oFF.isNull(otherObject))
		{
			return false;
		}
		if (thisObject.size() !== otherObject.size())
		{
			return false;
		}
		for (var idx = 0; idx < thisObject.size(); idx++)
		{
			if (thisObject.get(idx) === null && otherObject.get(idx) === null)
			{
				continue;
			}
			else if (thisObject.get(idx) === null || otherObject.get(idx) === null)
			{
				return false;
			}
			else if (!thisObject.get(idx).isEqualTo(otherObject.get(idx)))
			{
				return false;
			}
		}
		return true;
	},
	isListOfStringEquals:function(thisObject, otherObject)
	{
			if (oFF.isNull(otherObject))
		{
			return false;
		}
		if (thisObject === otherObject)
		{
			return true;
		}
		var otherStringList = otherObject;
		if (thisObject.size() !== otherStringList.size())
		{
			return false;
		}
		for (var idx = 0; idx < thisObject.size(); idx++)
		{
			if (!oFF.XString.isEqual(thisObject.get(idx), otherStringList.get(idx)))
			{
				return false;
			}
		}
		return true;
	},
	assertGetSetIndexValid:function(space, index)
	{
			if (index < 0 || index >= space.size())
		{
			throw oFF.XException.createIllegalArgumentException("illegal index");
		}
	},
	assertInsertIndexValid:function(space, index)
	{
			if (index < 0 || index > space.size())
		{
			throw oFF.XException.createIllegalArgumentException("illegal index");
		}
	}
};

oFF.XMapUtils = {

	putAllObjects:function(source, target)
	{
			var keys = source.getKeysAsReadOnlyListOfString();
		var size = keys.size();
		var key;
		var value;
		for (var i = 0; i < size; i++)
		{
			key = keys.get(i);
			value = source.getByKey(key);
			target.put(key, value);
		}
	},
	putAllStrings:function(source, target)
	{
			var keys = source.getKeysAsReadOnlyListOfString();
		var size = keys.size();
		var key;
		var value;
		for (var i = 0; i < size; i++)
		{
			key = keys.get(i);
			value = source.getByKey(key);
			target.put(key, value);
		}
	}
};

oFF.XRegex = function() {};
oFF.XRegex.prototype = new oFF.XObject();
oFF.XRegex.prototype._ff_c = "XRegex";

oFF.XRegex.s_instance = null;
oFF.XRegex.setInstance = function(instance)
{
	oFF.XRegex.s_instance = instance;
};
oFF.XRegex.getInstance = function()
{
	return oFF.XRegex.s_instance;
};
oFF.XRegex.prototype.getFirstGroupOfMatch = oFF.noSupport;

oFF.XIteratorWrapper = function() {};
oFF.XIteratorWrapper.prototype = new oFF.XObject();
oFF.XIteratorWrapper.prototype._ff_c = "XIteratorWrapper";

oFF.XIteratorWrapper.create = function(list)
{
	var newObject = new oFF.XIteratorWrapper();
	newObject.m_iterator = list;
	return newObject;
};
oFF.XIteratorWrapper.prototype.m_iterator = null;
oFF.XIteratorWrapper.prototype.releaseObject = function()
{
	this.m_iterator = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.XIteratorWrapper.prototype.hasNext = function()
{
	return this.m_iterator.hasNext();
};
oFF.XIteratorWrapper.prototype.next = function()
{
	return this.m_iterator.next();
};

oFF.XObjectIterator = function() {};
oFF.XObjectIterator.prototype = new oFF.XObject();
oFF.XObjectIterator.prototype._ff_c = "XObjectIterator";

oFF.XObjectIterator.create = function(list)
{
	var newObject = new oFF.XObjectIterator();
	newObject.m_list = list;
	newObject.m_index = -1;
	return newObject;
};
oFF.XObjectIterator.prototype.m_list = null;
oFF.XObjectIterator.prototype.m_index = 0;
oFF.XObjectIterator.prototype.releaseObject = function()
{
	this.m_list = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.XObjectIterator.prototype.getList = function()
{
	return this.m_list;
};
oFF.XObjectIterator.prototype.hasNext = function()
{
	return this.m_index + 1 < this.getList().size();
};
oFF.XObjectIterator.prototype.next = function()
{
	this.m_index++;
	return this.getList().get(this.m_index);
};

oFF.XUniversalIterator = function() {};
oFF.XUniversalIterator.prototype = new oFF.XObject();
oFF.XUniversalIterator.prototype._ff_c = "XUniversalIterator";

oFF.XUniversalIterator.create = function(list)
{
	var newObject = new oFF.XUniversalIterator();
	newObject.m_list = list;
	newObject.m_index = -1;
	return newObject;
};
oFF.XUniversalIterator.prototype.m_list = null;
oFF.XUniversalIterator.prototype.m_index = 0;
oFF.XUniversalIterator.prototype.releaseObject = function()
{
	this.m_list = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.XUniversalIterator.prototype.getList = function()
{
	return this.m_list;
};
oFF.XUniversalIterator.prototype.hasNext = function()
{
	return this.m_index + 1 < this.getList().size();
};
oFF.XUniversalIterator.prototype.next = function()
{
	this.m_index++;
	return this.getList().get(this.m_index);
};

oFF.DfAbstractReadOnlyBinary = function() {};
oFF.DfAbstractReadOnlyBinary.prototype = new oFF.XObjectExt();
oFF.DfAbstractReadOnlyBinary.prototype._ff_c = "DfAbstractReadOnlyBinary";

oFF.DfAbstractReadOnlyBinary.prototype.isEmpty = function()
{
	return !this.hasElements();
};

oFF.DfAbstractKeyBagOfString = function() {};
oFF.DfAbstractKeyBagOfString.prototype = new oFF.DfAbstractReadOnlyBinary();
oFF.DfAbstractKeyBagOfString.prototype._ff_c = "DfAbstractKeyBagOfString";

oFF.DfAbstractKeyBagOfString.prototype.getKeysAsIteratorOfString = function()
{
	return this.getKeysAsReadOnlyListOfString().getIterator();
};

oFF.XSortDirection = function() {};
oFF.XSortDirection.prototype = new oFF.XConstant();
oFF.XSortDirection.prototype._ff_c = "XSortDirection";

oFF.XSortDirection.ASCENDING = null;
oFF.XSortDirection.DESCENDING = null;
oFF.XSortDirection.NONE = null;
oFF.XSortDirection.DISABLED = null;
oFF.XSortDirection.DEFAULT_VALUE = null;
oFF.XSortDirection.staticSetup = function()
{
	oFF.XSortDirection.ASCENDING = oFF.XConstant.setupName(new oFF.XSortDirection(), "ASCENDING");
	oFF.XSortDirection.DESCENDING = oFF.XConstant.setupName(new oFF.XSortDirection(), "DESCENDING");
	oFF.XSortDirection.DEFAULT_VALUE = oFF.XConstant.setupName(new oFF.XSortDirection(), "DEFAULT");
	oFF.XSortDirection.NONE = oFF.XConstant.setupName(new oFF.XSortDirection(), "NONE");
	oFF.XSortDirection.DISABLED = oFF.XConstant.setupName(new oFF.XSortDirection(), "DISABLED");
};

oFF.DfAbstractMapOfStringByString = function() {};
oFF.DfAbstractMapOfStringByString.prototype = new oFF.DfAbstractKeyBagOfString();
oFF.DfAbstractMapOfStringByString.prototype._ff_c = "DfAbstractMapOfStringByString";

oFF.DfAbstractMapOfStringByString.prototype.getIterator = function()
{
	return this.getValuesAsReadOnlyListOfString().getIterator();
};
oFF.DfAbstractMapOfStringByString.prototype.isEqualTo = function(other)
{
	if (oFF.isNull(other))
	{
		return false;
	}
	if (this === other)
	{
		return true;
	}
	var otherMap = other;
	if (this.size() !== otherMap.size())
	{
		return false;
	}
	var keys = this.getKeysAsIteratorOfString();
	while (keys.hasNext())
	{
		var key = keys.next();
		if (!otherMap.containsKey(key))
		{
			return false;
		}
		if (!oFF.XString.isEqual(this.getByKey(key), otherMap.getByKey(key)))
		{
			return false;
		}
	}
	oFF.XObjectExt.release(keys);
	return true;
};
oFF.DfAbstractMapOfStringByString.prototype.putAll = function(other)
{
	oFF.XMapUtils.putAllStrings(other, this);
};

oFF.DfAbstractMapByString = function() {};
oFF.DfAbstractMapByString.prototype = new oFF.DfAbstractKeyBagOfString();
oFF.DfAbstractMapByString.prototype._ff_c = "DfAbstractMapByString";

oFF.DfAbstractMapByString.prototype.getIterator = function()
{
	return this.getValuesAsReadOnlyList().getIterator();
};
oFF.DfAbstractMapByString.prototype.putAll = function(other)
{
	oFF.XMapUtils.putAllObjects(other, this);
};
oFF.DfAbstractMapByString.prototype.putIfNotNull = function(key, element)
{
	if (oFF.notNull(element))
	{
		this.put(key, element);
	}
};
oFF.DfAbstractMapByString.prototype.isEqualTo = function(other)
{
	if (oFF.isNull(other))
	{
		return false;
	}
	if (this === other)
	{
		return true;
	}
	var otherMap = other;
	if (this.size() !== otherMap.size())
	{
		return false;
	}
	var keys = this.getKeysAsIteratorOfString();
	while (keys.hasNext())
	{
		var key = keys.next();
		if (!otherMap.containsKey(key))
		{
			return false;
		}
		var thisValue = this.getByKey(key);
		var thatValue = otherMap.getByKey(key);
		var thisValueObj = thisValue;
		var thatValueObj = thatValue;
		if (thisValueObj !== thatValueObj)
		{
			if (oFF.isNull(thisValue))
			{
				return false;
			}
			if (!thisValue.isEqualTo(thatValue))
			{
				return false;
			}
		}
	}
	oFF.XObjectExt.release(keys);
	return true;
};

oFF.DfAbstractSetOfString = function() {};
oFF.DfAbstractSetOfString.prototype = new oFF.DfAbstractReadOnlyBinary();
oFF.DfAbstractSetOfString.prototype._ff_c = "DfAbstractSetOfString";

oFF.DfAbstractSetOfString.prototype.getIterator = function()
{
	return this.getValuesAsReadOnlyListOfString().getIterator();
};
oFF.DfAbstractSetOfString.prototype.addAll = function(other)
{
	oFF.XListUtils.addAllStrings(other, this);
};
oFF.DfAbstractSetOfString.prototype.isEqualTo = function(other)
{
	if (oFF.isNull(other))
	{
		return false;
	}
	if (this === other)
	{
		return true;
	}
	var otherSet = other;
	if (this.size() !== otherSet.size())
	{
		return false;
	}
	var values = this.getIterator();
	while (values.hasNext())
	{
		var value = values.next();
		if (!otherSet.contains(value))
		{
			return false;
		}
	}
	oFF.XObjectExt.release(values);
	return true;
};

oFF.DfAbstractList = function() {};
oFF.DfAbstractList.prototype = new oFF.DfAbstractReadOnlyBinary();
oFF.DfAbstractList.prototype._ff_c = "DfAbstractList";

oFF.DfAbstractList.prototype.getValuesAsReadOnlyList = function()
{
	return this;
};
oFF.DfAbstractList.prototype.isEqualTo = function(other)
{
	return oFF.XListUtils.isListEquals(this, other);
};
oFF.DfAbstractList.prototype.addAll = function(other)
{
	oFF.XListUtils.addAllObjects(other, this);
};
oFF.DfAbstractList.prototype.contains = function(element)
{
	return this.getIndex(element) !== -1;
};
oFF.DfAbstractList.prototype.getIndex = function(element)
{
	var theSize = this.size();
	var otherElement = element;
	for (var i = 0; i < theSize; i++)
	{
		var thisElement = this.get(i);
		if (thisElement === otherElement)
		{
			return i;
		}
		if (oFF.notNull(thisElement) && thisElement.isEqualTo(otherElement))
		{
			return i;
		}
	}
	return -1;
};
oFF.DfAbstractList.prototype.removeElement = function(element)
{
	var index = this.getIndex(element);
	if (index !== -1)
	{
		this.removeAt(index);
	}
	return element;
};

oFF.DfAbstractListOfString = function() {};
oFF.DfAbstractListOfString.prototype = new oFF.DfAbstractReadOnlyBinary();
oFF.DfAbstractListOfString.prototype._ff_c = "DfAbstractListOfString";

oFF.DfAbstractListOfString.prototype.getValuesAsReadOnlyListOfString = function()
{
	return this;
};
oFF.DfAbstractListOfString.prototype.isEqualTo = function(other)
{
	return oFF.XListUtils.isListOfStringEquals(this, other);
};
oFF.DfAbstractListOfString.prototype.addAll = function(other)
{
	oFF.XListUtils.addAllStrings(other, this);
};

oFF.CoreModule = function() {};
oFF.CoreModule.prototype = new oFF.DfModule();
oFF.CoreModule.prototype._ff_c = "CoreModule";

oFF.CoreModule.s_module = null;
oFF.CoreModule.getInstance = function()
{
	if (oFF.isNull(oFF.CoreModule.s_module))
	{
		oFF.DfModule.checkInitialized(oFF.LanguageExtModule.getInstance());
		oFF.CoreModule.s_module = oFF.DfModule.startExt(new oFF.CoreModule());
		oFF.XSortDirection.staticSetup();
		oFF.DfModule.stopExt(oFF.CoreModule.s_module);
	}
	return oFF.CoreModule.s_module;
};
oFF.CoreModule.prototype.getName = function()
{
	return "ff0010.core";
};

oFF.CoreModule.getInstance();

return sap.firefly;
	} );