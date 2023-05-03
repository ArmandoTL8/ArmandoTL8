/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
[
"sap/sac/df/firefly/ff0020.core.native"
],
function(oFF)
{
"use strict";

oFF.XCollectionFactory = {

	LOOKUP_LIST:0,
	LINKED_MAP:1,
	MAPPED_LIST:2,
	createNamedList:function(type)
	{
			if (type === oFF.XCollectionFactory.LOOKUP_LIST)
		{
			return oFF.XLookupListOfNameObject.create();
		}
		else if (type === oFF.XCollectionFactory.LINKED_MAP)
		{
			return oFF.XLinkedMap.createLinkedMap();
		}
		else if (type === oFF.XCollectionFactory.MAPPED_LIST)
		{
			return oFF.XListOfNameObject.create();
		}
		else
		{
			return null;
		}
	}
};

oFF.XCollectionUtils = {

	getByName:function(list, name)
	{
			if (oFF.isNull(list))
		{
			return null;
		}
		var size = list.size();
		for (var i = 0; i < size; i++)
		{
			var entry = list.get(i);
			if (oFF.notNull(entry) && oFF.XString.isEqual(name, entry.getName()))
			{
				return entry;
			}
		}
		return null;
	},
	getIndexByName:function(list, name)
	{
			if (oFF.isNull(list))
		{
			return -1;
		}
		var size = list.size();
		for (var i = 0; i < size; i++)
		{
			var entry = list.get(i);
			if (oFF.XString.isEqual(name, entry.getName()))
			{
				return i;
			}
		}
		return -1;
	},
	hasElements:function(collection)
	{
			return oFF.notNull(collection) && collection.hasElements();
	},
	releaseEntriesFromCollection:function(collection)
	{
			if (oFF.notNull(collection))
		{
			var iterator = collection.getIterator();
			while (iterator.hasNext())
			{
				oFF.XObjectExt.release(iterator.next());
			}
			oFF.XObjectExt.release(iterator);
		}
	},
	releaseEntriesAndCollectionIfNotNull:function(collection)
	{
			oFF.XCollectionUtils.releaseEntriesFromCollection(collection);
		oFF.XObjectExt.release(collection);
		return null;
	},
	createListCopy:function(other)
	{
			if (oFF.isNull(other))
		{
			return null;
		}
		var list = oFF.XList.create();
		list.addAll(other);
		return list;
	},
	createListOfNames:function(source)
	{
			var listOfNames = oFF.XListOfString.create();
		if (oFF.notNull(source))
		{
			var iterator = source.getIterator();
			while (iterator.hasNext())
			{
				listOfNames.add(iterator.next().getName());
			}
		}
		return listOfNames;
	},
	addAll:function(target, source)
	{
			if (oFF.notNull(target) && oFF.notNull(source))
		{
			var iterator = source.getIterator();
			while (iterator.hasNext())
			{
				target.add(iterator.next());
			}
			oFF.XObjectExt.release(iterator);
		}
		return target;
	},
	addAllIfNotPresent:function(target, source)
	{
			if (oFF.notNull(target) && oFF.notNull(source))
		{
			var iterator = source.getIterator();
			while (iterator.hasNext())
			{
				var next = iterator.next();
				if (!target.contains(next))
				{
					target.add(next);
				}
			}
			oFF.XObjectExt.release(iterator);
		}
		return target;
	},
	addAllClones:function(target, source)
	{
			if (oFF.notNull(target) && oFF.notNull(source))
		{
			var iterator = source.getIterator();
			while (iterator.hasNext())
			{
				target.add(oFF.XObjectExt.cloneIfNotNull(iterator.next()));
			}
			oFF.XObjectExt.release(iterator);
		}
		return target;
	},
	createListOfClones:function(source)
	{
			var result = oFF.XList.create();
		oFF.XCollectionUtils.addAllClones(result, source);
		return result;
	},
	sortListAsIntegers:function(list, sortDirection)
	{
			var sortedList = oFF.XListOfString.createFromReadOnlyList(list);
		var comparator = new oFF.XCompararorStringAsNumber();
		comparator.setupExt(sortDirection);
		sortedList.sortByComparator(comparator);
		return sortedList;
	},
	join:function(list, separator)
	{
			var sb = oFF.XStringBuffer.create();
		if (oFF.XCollectionUtils.hasElements(list) && oFF.notNull(separator))
		{
			sb.append(list.get(0));
			var size = list.size();
			for (var i = 1; i < size; i++)
			{
				var value = list.get(i);
				if (oFF.XStringUtils.isNotNullAndNotEmpty(value))
				{
					sb.append(separator).append(value);
				}
			}
		}
		return sb.toString();
	},
	concatenateByteArrays:function(a, b)
	{
			var c = oFF.XByteArray.create(null, a.size() + b.size());
		oFF.XByteArray.copy(a, 0, c, 0, a.size());
		oFF.XByteArray.copy(b, 0, c, a.size(), b.size());
		return c;
	},
	singletonList:function(element)
	{
			var list = oFF.XList.create();
		list.add(element);
		return list;
	},
	singletonStringList:function(element)
	{
			var list = oFF.XListOfString.create();
		list.add(element);
		return list;
	},
	addIfNotPresent:function(list, value)
	{
			if (oFF.notNull(list) && oFF.XStringUtils.isNotNullAndNotEmpty(value) && !list.contains(value))
		{
			list.add(value);
		}
	},
	addObjIfNotPresent:function(list, value)
	{
			if (oFF.notNull(list) && oFF.notNull(value) && !list.contains(value))
		{
			list.add(value);
		}
	},
	addIfNotNull:function(list, value)
	{
			if (oFF.notNull(list) && oFF.notNull(value))
		{
			list.add(value);
		}
	},
	addStringIfNotNull:function(list, value)
	{
			if (oFF.notNull(list) && oFF.notNull(value))
		{
			list.add(value);
		}
	},
	contains:function(collection, predicate)
	{
			if (oFF.notNull(collection))
		{
			var iterator = collection.getIterator();
			while (iterator.hasNext())
			{
				if (predicate(iterator.next()))
				{
					oFF.XObjectExt.release(iterator);
					return true;
				}
			}
			oFF.XObjectExt.release(iterator);
		}
		return false;
	},
	reduce:function(collection, identity, reducer)
	{
			var result = identity;
		var iterator = collection.getIterator();
		while (iterator.hasNext())
		{
			result = reducer(result, iterator.next());
		}
		oFF.XObjectExt.release(iterator);
		return result;
	},
	removeIf:function(collection, predicate)
	{
			var elementsRemoved = false;
		if (oFF.notNull(collection))
		{
			var elements = collection.getValuesAsReadOnlyList();
			var size = collection.size();
			for (var i = size - 1; i >= 0; i--)
			{
				var element = elements.get(i);
				if (predicate(element))
				{
					collection.removeElement(element);
					elementsRemoved = true;
				}
			}
		}
		return elementsRemoved;
	},
	removeFromMapIf:function(map, predicate)
	{
			var elementsRemoved = false;
		if (oFF.notNull(map))
		{
			var elements = map.getKeysAsReadOnlyListOfString();
			var size = elements.size();
			for (var i = size - 1; i >= 0; i--)
			{
				var key = elements.get(i);
				var value = map.getByKey(key);
				if (predicate(key, value))
				{
					map.remove(key);
					elementsRemoved = true;
				}
			}
		}
		return elementsRemoved;
	},
	filter:function(collection, predicate)
	{
			if (oFF.notNull(collection))
		{
			var filteredList = oFF.XList.create();
			var iterator = collection.getIterator();
			while (iterator.hasNext())
			{
				var element = iterator.next();
				if (predicate(element))
				{
					filteredList.add(element);
				}
			}
			oFF.XObjectExt.release(iterator);
			return filteredList;
		}
		return null;
	},
	filterString:function(listOfString, predicate)
	{
			if (oFF.notNull(listOfString))
		{
			var filteredList = oFF.XListOfString.create();
			oFF.XCollectionUtils.forEachString(listOfString,  function(tmpString){
				if (predicate(tmpString))
				{
					filteredList.add(tmpString);
				}
			}.bind(this));
			return filteredList;
		}
		return null;
	},
	map:function(values, mapper)
	{
			var result = oFF.XList.create();
		if (oFF.XCollectionUtils.hasElements(values))
		{
			var iterator = values.getIterator();
			while (iterator.hasNext())
			{
				result.add(mapper(iterator.next()));
			}
			oFF.XObjectExt.release(iterator);
		}
		return result;
	},
	forEach:function(collection, consumer)
	{
			if (oFF.notNull(collection))
		{
			var iterator = collection.getIterator();
			while (iterator.hasNext())
			{
				consumer(iterator.next());
			}
			oFF.XObjectExt.release(iterator);
		}
	},
	findFirst:function(collection, predicate)
	{
			if (oFF.notNull(collection))
		{
			var iterator = collection.getIterator();
			while (iterator.hasNext())
			{
				var element = iterator.next();
				if (predicate(element))
				{
					return element;
				}
			}
		}
		return null;
	},
	last:function(list)
	{
			var lastEle = null;
		if (oFF.notNull(list) && list.size() > 0)
		{
			var listSize = list.size();
			lastEle = list.get(listSize - 1);
		}
		return lastEle;
	},
	lastString:function(list)
	{
			var lastStr = null;
		if (oFF.notNull(list) && list.size() > 0)
		{
			var listSize = list.size();
			lastStr = list.get(listSize - 1);
		}
		return lastStr;
	},
	forEachString:function(list, consumer)
	{
			if (oFF.notNull(list))
		{
			var iterator = list.getIterator();
			while (iterator.hasNext())
			{
				consumer(iterator.next());
			}
			oFF.XObjectExt.release(iterator);
		}
	},
	containsAllAdjacient:function(container, contained)
	{
			var indices = oFF.XStream.of(contained).map( function(c){
			return oFF.XIntegerValue.create(container.getIndex(c));
		}.bind(this)).collect(oFF.XStreamCollector.toList());
		indices.sortByComparator(oFF.XComparatorInteger.create());
		var result = true;
		if (oFF.XCollectionUtils.hasElements(indices))
		{
			result = indices.get(0).getInteger() > -1;
			for (var i = 1; i < indices.size(); i++)
			{
				if (indices.get(i - 1).getInteger() + 1 !== indices.get(i).getInteger())
				{
					result = false;
					break;
				}
			}
		}
		return result;
	}
};

oFF.XOptional = function() {};
oFF.XOptional.prototype = new oFF.XObject();
oFF.XOptional.prototype._ff_c = "XOptional";

oFF.XOptional.empty = function()
{
	return new oFF.XOptional();
};
oFF.XOptional.of = function(value)
{
	var optional = new oFF.XOptional();
	optional.m_value = value;
	optional.m_isPresent = true;
	return optional;
};
oFF.XOptional.ofNullable = function(value)
{
	if (oFF.isNull(value))
	{
		return oFF.XOptional.empty();
	}
	return oFF.XOptional.of(value);
};
oFF.XOptional.prototype.m_isPresent = false;
oFF.XOptional.prototype.m_value = null;
oFF.XOptional.prototype.releaseObject = function()
{
	oFF.XObject.prototype.releaseObject.call( this );
	this.m_value = null;
};
oFF.XOptional.prototype.isPresent = function()
{
	return this.m_isPresent;
};
oFF.XOptional.prototype.get = function()
{
	if (!this.isPresent())
	{
		throw oFF.XException.createRuntimeException("No value present");
	}
	return this.m_value;
};
oFF.XOptional.prototype.orElse = function(other)
{
	return this.isPresent() ? this.m_value : other;
};
oFF.XOptional.prototype.orElseGet = function(other)
{
	return this.isPresent() ? this.m_value : other();
};
oFF.XOptional.prototype.ifPresent = function(consumer)
{
	if (this.isPresent())
	{
		consumer(this.m_value);
	}
};
oFF.XOptional.prototype.filter = function(predicate)
{
	if (!this.isPresent())
	{
		return this;
	}
	else
	{
		return predicate(this.m_value) ? this : oFF.XOptional.empty();
	}
};
oFF.XOptional.prototype.map = function(mapper)
{
	if (!this.isPresent())
	{
		return oFF.XOptional.empty();
	}
	else
	{
		return oFF.XOptional.ofNullable(mapper(this.m_value));
	}
};
oFF.XOptional.prototype.toString = function()
{
	if (this.isPresent())
	{
		return oFF.notNull(this.m_value) ? this.m_value.toString() : "null";
	}
	return "XOptional.empty";
};

oFF.XStream = {

	of:function(values)
	{
			return oFF.XStreamReferenceObject.create(values);
	},
	ofString:function(values)
	{
			return oFF.XStreamReferenceString.create(values);
	}
};

oFF.XStreamCollector = {

	toList:function()
	{
			return oFF.XStreamCollectorImpl.create( function(){
			var list = oFF.XList.create();
			return list;
		}.bind(this),  function(result, nextValue){
			result.add(nextValue);
			return result;
		}.bind(this));
	},
	toListOfNameObject:function()
	{
			return oFF.XStreamCollectorImpl.create( function(){
			var list = oFF.XListOfNameObject.create();
			return list;
		}.bind(this),  function(result, nextValue){
			result.add(nextValue);
			return result;
		}.bind(this));
	},
	toSetOfNameObject:function()
	{
			return oFF.XStreamCollectorImpl.create( function(){
			var set = oFF.XSetOfNameObject.create();
			return set;
		}.bind(this),  function(result, nextValue){
			result.add(nextValue);
			return result;
		}.bind(this));
	},
	to:function(collection)
	{
			return oFF.XStreamCollectorImpl.create( function(){
			return collection;
		}.bind(this),  function(result, nextValue){
			result.add(nextValue);
			return result;
		}.bind(this));
	},
	toListOfString:function(toStringFunction)
	{
			return oFF.XStreamCollectorImpl.create( function(){
			return oFF.XListOfString.create();
		}.bind(this),  function(result, nextValue){
			result.add(toStringFunction(nextValue));
			return result;
		}.bind(this));
	},
	toSetOfString:function(toStringFunction)
	{
			return oFF.XStreamCollectorImpl.create( function(){
			return oFF.XHashSetOfString.create();
		}.bind(this),  function(result, nextValue){
			result.add(toStringFunction(nextValue));
			return result;
		}.bind(this));
	},
	toMap:function(keyFunction, valueFunction)
	{
			return oFF.XStreamCollectorImpl.create( function(){
			return oFF.XHashMapByString.create();
		}.bind(this),  function(result, nextValue){
			var key = keyFunction(nextValue);
			var value = valueFunction(nextValue);
			result.put(key, value);
			return result;
		}.bind(this));
	}
};

oFF.XStreamCollectorImpl = function() {};
oFF.XStreamCollectorImpl.prototype = new oFF.XObject();
oFF.XStreamCollectorImpl.prototype._ff_c = "XStreamCollectorImpl";

oFF.XStreamCollectorImpl.create = function(supplier, _function)
{
	var collector = new oFF.XStreamCollectorImpl();
	collector.setupCollector(supplier, _function);
	return collector;
};
oFF.XStreamCollectorImpl.prototype.m_collectionSupplier = null;
oFF.XStreamCollectorImpl.prototype.m_applyValueFunction = null;
oFF.XStreamCollectorImpl.prototype.setupCollector = function(supplier, _function)
{
	this.m_collectionSupplier = supplier;
	this.m_applyValueFunction = _function;
};
oFF.XStreamCollectorImpl.prototype.releaseObject = function()
{
	oFF.XObject.prototype.releaseObject.call( this );
	this.m_collectionSupplier = null;
	this.m_applyValueFunction = null;
};
oFF.XStreamCollectorImpl.prototype.apply = function(valueIterator)
{
	var result = this.m_collectionSupplier();
	while (valueIterator.hasNext())
	{
		var next = valueIterator.next();
		if (oFF.XStreamReferenceString.isStringReference(next))
		{
			next = oFF.XStreamReferenceString.getStringReference().clone();
		}
		this.m_applyValueFunction(result, next);
	}
	return result;
};

oFF.XStreamBase = function() {};
oFF.XStreamBase.prototype = new oFF.XObject();
oFF.XStreamBase.prototype._ff_c = "XStreamBase";

oFF.XStreamBase.prototype.m_prevStreamOperation = null;
oFF.XStreamBase.prototype.m_nextValue = null;
oFF.XStreamBase.prototype.m_nextValueApplied = false;
oFF.XStreamBase.prototype.setupStream = function(prevStreamOperation)
{
	this.m_prevStreamOperation = prevStreamOperation;
};
oFF.XStreamBase.prototype.releaseObject = function()
{
	oFF.XObject.prototype.releaseObject.call( this );
	this.m_prevStreamOperation = oFF.XObjectExt.release(this.m_prevStreamOperation);
	this.m_nextValue = null;
};
oFF.XStreamBase.prototype.hasNext = function()
{
	if (this.m_nextValueApplied)
	{
		return true;
	}
	while (this.m_prevStreamOperation.hasNext())
	{
		if (this.applyNextValue(this.m_prevStreamOperation.next()))
		{
			this.m_nextValueApplied = true;
			return true;
		}
	}
	return false;
};
oFF.XStreamBase.prototype.next = function()
{
	if (!this.hasNext())
	{
		throw oFF.XException.createIllegalStateException("Illegal stream index");
	}
	this.m_nextValueApplied = false;
	return this.m_nextValue;
};
oFF.XStreamBase.prototype.checkNotConsumed = function()
{
	if (this.isReleased())
	{
		throw oFF.XException.createIllegalStateException("Stream has already been operated upon or closed");
	}
};
oFF.XStreamBase.prototype.filterNullValues = function()
{
	this.checkNotConsumed();
	return oFF.XStreamFilterOperation.create(this,  function(value){
		return oFF.notNull(value);
	}.bind(this));
};
oFF.XStreamBase.prototype.filter = function(predicate)
{
	this.checkNotConsumed();
	return oFF.XStreamFilterOperation.create(this, predicate);
};
oFF.XStreamBase.prototype.map = function(mapper)
{
	this.checkNotConsumed();
	return oFF.XStreamMapOperation.create(this, mapper);
};
oFF.XStreamBase.prototype.mapToString = function(mapper)
{
	this.checkNotConsumed();
	return oFF.XStreamMapToStringOperation.create(this, mapper);
};
oFF.XStreamBase.prototype.sorted = function(comparator)
{
	this.checkNotConsumed();
	return oFF.XStreamSortOperation.create(this, comparator);
};
oFF.XStreamBase.prototype.findAny = function()
{
	this.checkNotConsumed();
	if (this.hasNext())
	{
		var value = this.next();
		oFF.XObjectExt.release(this);
		return oFF.XOptional.of(value);
	}
	oFF.XObjectExt.release(this);
	return oFF.XOptional.empty();
};
oFF.XStreamBase.prototype.find = function(predicate)
{
	this.checkNotConsumed();
	return this.filter(predicate).findAny();
};
oFF.XStreamBase.prototype.reduce = function(identity, reducer)
{
	this.checkNotConsumed();
	var result = identity;
	while (this.hasNext())
	{
		result = reducer(result, this.next());
	}
	oFF.XObjectExt.release(this);
	return result;
};
oFF.XStreamBase.prototype.collect = function(collector)
{
	this.checkNotConsumed();
	var result = collector.apply(this);
	oFF.XObjectExt.release(collector);
	oFF.XObjectExt.release(this);
	return result;
};
oFF.XStreamBase.prototype.forEach = function(consumer)
{
	this.checkNotConsumed();
	while (this.hasNext())
	{
		consumer(this.next());
	}
	oFF.XObjectExt.release(this);
};
oFF.XStreamBase.prototype.anyMatch = function(predicate)
{
	this.checkNotConsumed();
	return this.find(predicate).isPresent();
};
oFF.XStreamBase.prototype.allMatch = function(predicate)
{
	this.checkNotConsumed();
	if (!this.hasNext())
	{
		oFF.XObjectExt.release(this);
		return true;
	}
	while (this.hasNext())
	{
		if (!predicate(this.next()))
		{
			oFF.XObjectExt.release(this);
			return false;
		}
	}
	oFF.XObjectExt.release(this);
	return true;
};
oFF.XStreamBase.prototype.countItems = function()
{
	this.checkNotConsumed();
	var result = 0;
	while (this.hasNext())
	{
		this.next();
		result++;
	}
	oFF.XObjectExt.release(this);
	return result;
};

oFF.XArray2Dim = function() {};
oFF.XArray2Dim.prototype = new oFF.DfAbstractReadOnlyBinary();
oFF.XArray2Dim.prototype._ff_c = "XArray2Dim";

oFF.XArray2Dim.create = function(dim0count, dim1count)
{
	var object = new oFF.XArray2Dim();
	object.setupExt(dim0count, dim1count, null);
	return object;
};
oFF.XArray2Dim.prototype.m_dim0count = 0;
oFF.XArray2Dim.prototype.m_dim1count = 0;
oFF.XArray2Dim.prototype.m_list = null;
oFF.XArray2Dim.prototype.setupExt = function(dim0count, dim1count, storage)
{
	this.m_dim0count = dim0count;
	this.m_dim1count = dim1count;
	if (oFF.isNull(storage))
	{
		var size = dim0count * dim1count;
		this.m_list = oFF.XArray.create(size);
	}
	else
	{
		this.m_list = storage;
	}
};
oFF.XArray2Dim.prototype.releaseObject = function()
{
	this.m_dim0count = -1;
	this.m_dim1count = -1;
	this.m_list = oFF.XObjectExt.release(this.m_list);
	oFF.DfAbstractReadOnlyBinary.prototype.releaseObject.call( this );
};
oFF.XArray2Dim.prototype.createArrayCopy = function()
{
	var copy = this.m_list.createArrayCopy();
	var object = new oFF.XArray2Dim();
	object.setupExt(this.m_dim0count, this.m_dim1count, copy);
	return object;
};
oFF.XArray2Dim.prototype.clear = function()
{
	this.m_list.clear();
};
oFF.XArray2Dim.prototype.size = function()
{
	return oFF.isNull(this.m_list) ? -1 : this.m_list.size();
};
oFF.XArray2Dim.prototype.hasElements = function()
{
	var size = this.m_list.size();
	for (var i = 0; i < size; i++)
	{
		if (this.m_list.get(i) !== null)
		{
			return true;
		}
	}
	return false;
};
oFF.XArray2Dim.prototype.setByIndices = function(index0, index1, element)
{
	if (index0 >= this.m_dim0count)
	{
		throw oFF.XException.createIllegalArgumentException("Index0 is too big");
	}
	if (index1 >= this.m_dim1count)
	{
		throw oFF.XException.createIllegalArgumentException("Index1 is too big");
	}
	var pos = index0 + index1 * this.m_dim0count;
	this.m_list.set(pos, element);
};
oFF.XArray2Dim.prototype.getByIndices = function(index0, index1)
{
	if (index0 >= this.m_dim0count || index1 >= this.m_dim1count)
	{
		return null;
	}
	var pos = index0 + index1 * this.m_dim0count;
	return this.m_list.get(pos);
};
oFF.XArray2Dim.prototype.size0 = function()
{
	return this.m_dim0count;
};
oFF.XArray2Dim.prototype.size1 = function()
{
	return this.m_dim1count;
};
oFF.XArray2Dim.prototype.toString = function()
{
	var stringBuffer = oFF.XStringBuffer.create();
	stringBuffer.append("Size0: ").appendInt(this.m_dim0count).appendNewLine();
	stringBuffer.append("Size1: ").appendInt(this.m_dim1count).appendNewLine();
	stringBuffer.append("Values:");
	for (var index1 = 0; index1 < this.m_dim1count; index1++)
	{
		stringBuffer.appendNewLine();
		stringBuffer.append("[");
		for (var index0 = 0; index0 < this.m_dim0count; index0++)
		{
			var element = this.getByIndices(index0, index1);
			stringBuffer.append(oFF.isNull(element) ? "null" : element.toString());
			if (index0 < this.m_dim0count - 1)
			{
				stringBuffer.append(", ");
			}
		}
		stringBuffer.append("]");
	}
	return stringBuffer.toString();
};

oFF.XReadOnlyListWrapper = function() {};
oFF.XReadOnlyListWrapper.prototype = new oFF.XObject();
oFF.XReadOnlyListWrapper.prototype._ff_c = "XReadOnlyListWrapper";

oFF.XReadOnlyListWrapper.create = function(list)
{
	var newObject = new oFF.XReadOnlyListWrapper();
	newObject.m_originList = list;
	return newObject;
};
oFF.XReadOnlyListWrapper.prototype.m_originList = null;
oFF.XReadOnlyListWrapper.prototype.releaseObject = function()
{
	this.m_originList = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.XReadOnlyListWrapper.prototype.getValuesAsReadOnlyList = function()
{
	return this;
};
oFF.XReadOnlyListWrapper.prototype.getIterator = function()
{
	return oFF.XUniversalIterator.create(this.m_originList);
};
oFF.XReadOnlyListWrapper.prototype.contains = function(element)
{
	return this.m_originList.contains(element);
};
oFF.XReadOnlyListWrapper.prototype.size = function()
{
	return this.m_originList.size();
};
oFF.XReadOnlyListWrapper.prototype.isEmpty = function()
{
	return this.m_originList.isEmpty();
};
oFF.XReadOnlyListWrapper.prototype.hasElements = function()
{
	return this.m_originList.hasElements();
};
oFF.XReadOnlyListWrapper.prototype.get = function(index)
{
	return this.m_originList.get(index);
};
oFF.XReadOnlyListWrapper.prototype.getIndex = function(element)
{
	return this.m_originList.getIndex(element);
};
oFF.XReadOnlyListWrapper.prototype.toString = function()
{
	return this.m_originList.toString();
};

oFF.XStreamFilterOperation = function() {};
oFF.XStreamFilterOperation.prototype = new oFF.XStreamBase();
oFF.XStreamFilterOperation.prototype._ff_c = "XStreamFilterOperation";

oFF.XStreamFilterOperation.create = function(prevStreamOperation, predicate)
{
	var filterOperation = new oFF.XStreamFilterOperation();
	filterOperation.setupFilterOperation(prevStreamOperation, predicate);
	return filterOperation;
};
oFF.XStreamFilterOperation.prototype.m_predicate = null;
oFF.XStreamFilterOperation.prototype.setupFilterOperation = function(prevStreamOperation, predicate)
{
	oFF.XStreamBase.prototype.setupStream.call( this , prevStreamOperation);
	this.m_predicate = predicate;
};
oFF.XStreamFilterOperation.prototype.releaseObject = function()
{
	oFF.XStreamBase.prototype.releaseObject.call( this );
	this.m_predicate = null;
};
oFF.XStreamFilterOperation.prototype.applyNextValue = function(value)
{
	if (this.m_predicate(value))
	{
		this.m_nextValue = value;
		return true;
	}
	return false;
};

oFF.XStreamMapOperation = function() {};
oFF.XStreamMapOperation.prototype = new oFF.XStreamBase();
oFF.XStreamMapOperation.prototype._ff_c = "XStreamMapOperation";

oFF.XStreamMapOperation.create = function(prevStreamOperation, mapper)
{
	var mapOperation = new oFF.XStreamMapOperation();
	mapOperation.setupMapOperation(prevStreamOperation, mapper);
	return mapOperation;
};
oFF.XStreamMapOperation.prototype.m_mapper = null;
oFF.XStreamMapOperation.prototype.setupMapOperation = function(prevStreamOperation, mapper)
{
	oFF.XStreamBase.prototype.setupStream.call( this , prevStreamOperation);
	this.m_mapper = mapper;
};
oFF.XStreamMapOperation.prototype.releaseObject = function()
{
	oFF.XStreamBase.prototype.releaseObject.call( this );
	this.m_mapper = null;
};
oFF.XStreamMapOperation.prototype.applyNextValue = function(value)
{
	this.m_nextValue = this.m_mapper(value);
	return true;
};

oFF.XStreamMapToStringOperation = function() {};
oFF.XStreamMapToStringOperation.prototype = new oFF.XStreamBase();
oFF.XStreamMapToStringOperation.prototype._ff_c = "XStreamMapToStringOperation";

oFF.XStreamMapToStringOperation.create = function(prevStreamOperation, mapper)
{
	var mapOperation = new oFF.XStreamMapToStringOperation();
	mapOperation.setupMapOperation(prevStreamOperation, mapper);
	return mapOperation;
};
oFF.XStreamMapToStringOperation.prototype.m_mapper = null;
oFF.XStreamMapToStringOperation.prototype.setupMapOperation = function(prevStreamOperation, mapper)
{
	oFF.XStreamBase.prototype.setupStream.call( this , prevStreamOperation);
	this.m_mapper = mapper;
};
oFF.XStreamMapToStringOperation.prototype.releaseObject = function()
{
	oFF.XStreamBase.prototype.releaseObject.call( this );
	this.m_mapper = null;
};
oFF.XStreamMapToStringOperation.prototype.applyNextValue = function(value)
{
	var nextString = this.m_mapper(value);
	oFF.XStreamReferenceString.getStringReference().setString(nextString);
	this.m_nextValue = oFF.notNull(nextString) ? oFF.XStreamReferenceString.getStringReference() : null;
	return true;
};

oFF.XStreamReference = function() {};
oFF.XStreamReference.prototype = new oFF.XStreamBase();
oFF.XStreamReference.prototype._ff_c = "XStreamReference";

oFF.XStreamReference.prototype.m_values = null;
oFF.XStreamReference.prototype.m_index = 0;
oFF.XStreamReference.prototype.setupStreamReference = function(values)
{
	this.m_values = values;
};
oFF.XStreamReference.prototype.releaseObject = function()
{
	oFF.XStreamBase.prototype.releaseObject.call( this );
	this.m_values = null;
};
oFF.XStreamReference.prototype.hasNext = function()
{
	if (this.m_nextValueApplied)
	{
		return true;
	}
	if (oFF.notNull(this.m_values) && this.m_values.size() > this.m_index)
	{
		this.applyNextValue(this.get(this.m_values, this.m_index));
		this.m_nextValueApplied = true;
		this.m_index++;
		return true;
	}
	return false;
};
oFF.XStreamReference.prototype.applyNextValue = function(value)
{
	this.m_nextValue = value;
	return true;
};

oFF.XStreamSortOperation = function() {};
oFF.XStreamSortOperation.prototype = new oFF.XStreamBase();
oFF.XStreamSortOperation.prototype._ff_c = "XStreamSortOperation";

oFF.XStreamSortOperation.create = function(prevStreamOperation, comparator)
{
	var filterOperation = new oFF.XStreamSortOperation();
	filterOperation.setupFilterOperation(prevStreamOperation, comparator);
	return filterOperation;
};
oFF.XStreamSortOperation.prototype.m_comparator = null;
oFF.XStreamSortOperation.prototype.m_objects = null;
oFF.XStreamSortOperation.prototype.m_index = 0;
oFF.XStreamSortOperation.prototype.m_isStringStream = false;
oFF.XStreamSortOperation.prototype.setupFilterOperation = function(prevStreamOperation, comparator)
{
	oFF.XStreamBase.prototype.setupStream.call( this , prevStreamOperation);
	this.m_comparator = comparator;
};
oFF.XStreamSortOperation.prototype.releaseObject = function()
{
	oFF.XStreamBase.prototype.releaseObject.call( this );
	this.m_comparator = null;
	this.m_objects = oFF.XObjectExt.release(this.m_objects);
};
oFF.XStreamSortOperation.prototype.hasNext = function()
{
	if (this.m_nextValueApplied)
	{
		return true;
	}
	if (oFF.isNull(this.m_objects))
	{
		this.collectAllStreamObjects();
		this.m_objects.sortByComparator(this.m_comparator);
	}
	if (this.m_objects.size() > this.m_index)
	{
		this.applyNextValue(this.m_objects.get(this.m_index));
		this.m_nextValueApplied = true;
		this.m_index++;
		return true;
	}
	return false;
};
oFF.XStreamSortOperation.prototype.collectAllStreamObjects = function()
{
	this.m_objects = oFF.XList.create();
	while (oFF.XStreamBase.prototype.hasNext.call( this ))
	{
		var next = this.next();
		this.m_isStringStream = this.m_isStringStream || oFF.XStreamReferenceString.isStringReference(next);
		this.m_objects.add(this.m_isStringStream ? next.clone() : next);
	}
};
oFF.XStreamSortOperation.prototype.applyNextValue = function(value)
{
	if (this.m_isStringStream)
	{
		var stringReference = oFF.XStreamReferenceString.getStringReference();
		stringReference.setString(value.getString());
		this.m_nextValue = stringReference;
	}
	else
	{
		this.m_nextValue = value;
	}
	return true;
};

oFF.XSimpleMap = function() {};
oFF.XSimpleMap.prototype = new oFF.DfAbstractReadOnlyBinary();
oFF.XSimpleMap.prototype._ff_c = "XSimpleMap";

oFF.XSimpleMap.create = function()
{
	var map = new oFF.XSimpleMap();
	map.m_list = oFF.XList.create();
	return map;
};
oFF.XSimpleMap.prototype.m_list = null;
oFF.XSimpleMap.prototype.releaseObject = function()
{
	this.m_list = oFF.XObjectExt.release(this.m_list);
	oFF.DfAbstractReadOnlyBinary.prototype.releaseObject.call( this );
};
oFF.XSimpleMap.prototype.containsKey = function(key)
{
	return this.getByKey(key) !== null;
};
oFF.XSimpleMap.prototype.getByKey = function(key)
{
	for (var i = 0; i < this.m_list.size(); i++)
	{
		var pair = this.m_list.get(i);
		if (oFF.XObjectExt.areEqual(pair.getFirstObject(), key))
		{
			return pair.getSecondObject();
		}
	}
	return null;
};
oFF.XSimpleMap.prototype.contains = function(element)
{
	for (var i = 0; i < this.m_list.size(); i++)
	{
		var pair = this.m_list.get(i);
		if (oFF.XObjectExt.areEqual(pair.getSecondObject(), element))
		{
			return true;
		}
	}
	return false;
};
oFF.XSimpleMap.prototype.getKeysAsIterator = function()
{
	return this.getKeysAsReadOnlyList().getIterator();
};
oFF.XSimpleMap.prototype.getKeysAsReadOnlyList = function()
{
	var list = oFF.XList.create();
	for (var i = 0; i < this.m_list.size(); i++)
	{
		var pair = this.m_list.get(i);
		list.add(pair.getFirstObject());
	}
	return list;
};
oFF.XSimpleMap.prototype.getIterator = function()
{
	return this.getValuesAsReadOnlyList().getIterator();
};
oFF.XSimpleMap.prototype.getValuesAsReadOnlyList = function()
{
	var list = oFF.XList.create();
	for (var i = 0; i < this.m_list.size(); i++)
	{
		var pair = this.m_list.get(i);
		list.add(pair.getSecondObject());
	}
	return list;
};
oFF.XSimpleMap.prototype.put = function(key, element)
{
	this.remove(key);
	var pair = oFF.XPair.create(key, element);
	this.m_list.add(pair);
};
oFF.XSimpleMap.prototype.remove = function(key)
{
	for (var i = 0; i < this.m_list.size(); i++)
	{
		var pair = this.m_list.get(i);
		if (oFF.XObjectExt.areEqual(pair.getFirstObject(), key))
		{
			return this.m_list.removeAt(i).getSecondObject();
		}
	}
	return null;
};
oFF.XSimpleMap.prototype.createMapCopy = function()
{
	var map = oFF.XSimpleMap.create();
	for (var i = 0; i < this.m_list.size(); i++)
	{
		var pair = this.m_list.get(i);
		map.put(pair.getFirstObject(), pair.getSecondObject());
	}
	return map;
};
oFF.XSimpleMap.prototype.hasElements = function()
{
	return this.m_list.hasElements();
};
oFF.XSimpleMap.prototype.size = function()
{
	return this.m_list.size();
};
oFF.XSimpleMap.prototype.clear = function()
{
	this.m_list.clear();
};
oFF.XSimpleMap.prototype.toString = function()
{
	return this.m_list.toString();
};

oFF.XStreamReferenceObject = function() {};
oFF.XStreamReferenceObject.prototype = new oFF.XStreamReference();
oFF.XStreamReferenceObject.prototype._ff_c = "XStreamReferenceObject";

oFF.XStreamReferenceObject.create = function(values)
{
	var streamReference = new oFF.XStreamReferenceObject();
	streamReference.setupStreamReference(oFF.notNull(values) ? values.getValuesAsReadOnlyList() : null);
	return streamReference;
};
oFF.XStreamReferenceObject.prototype.get = function(values, index)
{
	return values.get(index);
};

oFF.XStreamReferenceString = function() {};
oFF.XStreamReferenceString.prototype = new oFF.XStreamReference();
oFF.XStreamReferenceString.prototype._ff_c = "XStreamReferenceString";

oFF.XStreamReferenceString.s_string = null;
oFF.XStreamReferenceString.setupStringElement = function()
{
	oFF.XStreamReferenceString.s_string = oFF.XStringValue.create(null);
};
oFF.XStreamReferenceString.getStringReference = function()
{
	return oFF.XStreamReferenceString.s_string;
};
oFF.XStreamReferenceString.isStringReference = function(obj)
{
	return oFF.XStreamReferenceString.isEqual(obj, oFF.XStreamReferenceString.s_string);
};
oFF.XStreamReferenceString.isEqual = function(a, b)
{
	return a === b;
};
oFF.XStreamReferenceString.create = function(values)
{
	var streamReference = new oFF.XStreamReferenceString();
	streamReference.setupStreamReference(oFF.notNull(values) ? values.getValuesAsReadOnlyListOfString() : null);
	return streamReference;
};
oFF.XStreamReferenceString.prototype.get = function(values, index)
{
	var stringValue = values.get(index);
	oFF.XStreamReferenceString.s_string.setString(stringValue);
	return oFF.notNull(stringValue) ? oFF.XStreamReferenceString.s_string : null;
};

oFF.XLinkedHashMapOfStringByString = function() {};
oFF.XLinkedHashMapOfStringByString.prototype = new oFF.DfAbstractMapOfStringByString();
oFF.XLinkedHashMapOfStringByString.prototype._ff_c = "XLinkedHashMapOfStringByString";

oFF.XLinkedHashMapOfStringByString.create = function()
{
	var hashMap = new oFF.XLinkedHashMapOfStringByString();
	hashMap.setup();
	hashMap.m_order = oFF.XListOfString.create();
	hashMap.m_storage = oFF.XHashMapOfStringByString.create();
	return hashMap;
};
oFF.XLinkedHashMapOfStringByString.prototype.m_order = null;
oFF.XLinkedHashMapOfStringByString.prototype.m_storage = null;
oFF.XLinkedHashMapOfStringByString.prototype.releaseObject = function()
{
	this.m_order = oFF.XObjectExt.release(this.m_order);
	oFF.DfAbstractMapOfStringByString.prototype.releaseObject.call( this );
};
oFF.XLinkedHashMapOfStringByString.prototype.clear = function()
{
	this.m_storage.clear();
	this.m_order.clear();
};
oFF.XLinkedHashMapOfStringByString.prototype.remove = function(key)
{
	if (oFF.isNull(key))
	{
		return null;
	}
	this.m_order.removeElement(key);
	return this.m_storage.remove(key);
};
oFF.XLinkedHashMapOfStringByString.prototype.cloneExt = function(flags)
{
	return this.createMapOfStringByStringCopy();
};
oFF.XLinkedHashMapOfStringByString.prototype.containsKey = function(key)
{
	return this.m_storage.containsKey(key);
};
oFF.XLinkedHashMapOfStringByString.prototype.getKeysAsReadOnlyListOfString = function()
{
	return this.m_order.createListOfStringCopy();
};
oFF.XLinkedHashMapOfStringByString.prototype.put = function(key, element)
{
	if (oFF.notNull(key))
	{
		if (!this.m_storage.containsKey(key))
		{
			this.m_order.add(key);
		}
		this.m_storage.put(key, element);
	}
};
oFF.XLinkedHashMapOfStringByString.prototype.createMapOfStringByStringCopy = function()
{
	var copy = oFF.XLinkedHashMapOfStringByString.create();
	for (var i = 0; i < this.m_order.size(); i++)
	{
		var next = this.m_order.get(i);
		copy.put(next, this.getByKey(next));
	}
	return copy;
};
oFF.XLinkedHashMapOfStringByString.prototype.getValuesAsReadOnlyListOfString = function()
{
	var list = oFF.XListOfString.create();
	for (var i = 0; i < this.m_order.size(); i++)
	{
		list.add(this.m_storage.getByKey(this.m_order.get(i)));
	}
	return list;
};
oFF.XLinkedHashMapOfStringByString.prototype.contains = function(element)
{
	return this.m_storage.contains(element);
};
oFF.XLinkedHashMapOfStringByString.prototype.hasElements = function()
{
	return this.m_storage.hasElements();
};
oFF.XLinkedHashMapOfStringByString.prototype.size = function()
{
	return this.m_storage.size();
};
oFF.XLinkedHashMapOfStringByString.prototype.getByKey = function(key)
{
	return this.m_storage.getByKey(key);
};

oFF.XUnmodSetOfNameObject = function() {};
oFF.XUnmodSetOfNameObject.prototype = new oFF.DfAbstractKeyBagOfString();
oFF.XUnmodSetOfNameObject.prototype._ff_c = "XUnmodSetOfNameObject";

oFF.XUnmodSetOfNameObject.create = function(bag)
{
	var list = new oFF.XUnmodSetOfNameObject();
	list.m_storage = oFF.XWeakReferenceUtil.getWeakRef(bag);
	return list;
};
oFF.XUnmodSetOfNameObject.prototype.m_storage = null;
oFF.XUnmodSetOfNameObject.prototype.releaseObject = function()
{
	this.m_storage = oFF.XObjectExt.release(this.m_storage);
	oFF.DfAbstractKeyBagOfString.prototype.releaseObject.call( this );
};
oFF.XUnmodSetOfNameObject.prototype.getHardStorage = function()
{
	return oFF.XWeakReferenceUtil.getHardRef(this.m_storage);
};
oFF.XUnmodSetOfNameObject.prototype.getValuesAsReadOnlyList = function()
{
	return this.getHardStorage().getValuesAsReadOnlyList();
};
oFF.XUnmodSetOfNameObject.prototype.getIterator = function()
{
	return this.getHardStorage().getIterator();
};
oFF.XUnmodSetOfNameObject.prototype.size = function()
{
	return this.getHardStorage().size();
};
oFF.XUnmodSetOfNameObject.prototype.hasElements = function()
{
	return this.getHardStorage().hasElements();
};
oFF.XUnmodSetOfNameObject.prototype.contains = function(element)
{
	return this.getHardStorage().contains(element);
};
oFF.XUnmodSetOfNameObject.prototype.containsKey = function(key)
{
	return this.getHardStorage().containsKey(key);
};
oFF.XUnmodSetOfNameObject.prototype.getByKey = function(key)
{
	return this.getHardStorage().getByKey(key);
};
oFF.XUnmodSetOfNameObject.prototype.getKeysAsReadOnlyListOfString = function()
{
	return this.getHardStorage().getKeysAsReadOnlyListOfString();
};
oFF.XUnmodSetOfNameObject.prototype.toString = function()
{
	return this.getHardStorage().toString();
};

oFF.XAbstractReadOnlyMap = function() {};
oFF.XAbstractReadOnlyMap.prototype = new oFF.DfAbstractMapByString();
oFF.XAbstractReadOnlyMap.prototype._ff_c = "XAbstractReadOnlyMap";

oFF.XAbstractReadOnlyMap.prototype.m_storage = null;
oFF.XAbstractReadOnlyMap.prototype.setup = function()
{
	this.m_storage = oFF.XHashMapByString.create();
};
oFF.XAbstractReadOnlyMap.prototype.releaseObject = function()
{
	this.m_storage = oFF.XObjectExt.release(this.m_storage);
	oFF.DfAbstractMapByString.prototype.releaseObject.call( this );
};
oFF.XAbstractReadOnlyMap.prototype.getByKey = function(key)
{
	return this.m_storage.getByKey(key);
};
oFF.XAbstractReadOnlyMap.prototype.hasElements = function()
{
	return this.m_storage.hasElements();
};
oFF.XAbstractReadOnlyMap.prototype.size = function()
{
	return this.m_storage.size();
};
oFF.XAbstractReadOnlyMap.prototype.getValuesAsReadOnlyList = function()
{
	return this.m_storage.getValuesAsReadOnlyList();
};
oFF.XAbstractReadOnlyMap.prototype.contains = function(element)
{
	return this.m_storage.contains(element);
};
oFF.XAbstractReadOnlyMap.prototype.containsKey = function(key)
{
	return this.m_storage.containsKey(key);
};
oFF.XAbstractReadOnlyMap.prototype.getKeysAsReadOnlyListOfString = function()
{
	return this.m_storage.getKeysAsReadOnlyListOfString();
};
oFF.XAbstractReadOnlyMap.prototype.toString = function()
{
	return this.m_storage.toString();
};

oFF.XListWeakRef = function() {};
oFF.XListWeakRef.prototype = new oFF.DfAbstractReadOnlyBinary();
oFF.XListWeakRef.prototype._ff_c = "XListWeakRef";

oFF.XListWeakRef.create = function()
{
	var list = new oFF.XListWeakRef();
	list.setup();
	return list;
};
oFF.XListWeakRef.prototype.m_list = null;
oFF.XListWeakRef.prototype.setup = function()
{
	this.m_list = oFF.XList.create();
};
oFF.XListWeakRef.prototype.releaseObject = function()
{
	this.m_list = oFF.XObjectExt.release(this.m_list);
	oFF.DfAbstractReadOnlyBinary.prototype.releaseObject.call( this );
};
oFF.XListWeakRef.prototype.add = function(element)
{
	this.m_list.add(oFF.XWeakReferenceUtil.getWeakRef(element));
};
oFF.XListWeakRef.prototype.addAll = function(other)
{
	oFF.XListUtils.addAllObjects(other, this);
};
oFF.XListWeakRef.prototype.insert = function(index, element)
{
	this.m_list.insert(index, oFF.XWeakReferenceUtil.getWeakRef(element));
};
oFF.XListWeakRef.prototype.get = function(index)
{
	var weakRef = this.m_list.get(index);
	return oFF.XWeakReferenceUtil.getHardRef(weakRef);
};
oFF.XListWeakRef.prototype.getIndex = function(element)
{
	var size = this.size();
	for (var i = 0; i < size; i++)
	{
		if (this.elementsEqual(this.get(i), element))
		{
			return i;
		}
	}
	return -1;
};
oFF.XListWeakRef.prototype.removeAt = function(index)
{
	if (index < 0 || index >= this.size())
	{
		throw oFF.XException.createIllegalArgumentException("illegal index");
	}
	var weakRef = this.m_list.removeAt(index);
	return oFF.XWeakReferenceUtil.getHardRef(weakRef);
};
oFF.XListWeakRef.prototype.removeElement = function(element)
{
	var size = this.size();
	for (var i = 0; i < size; i++)
	{
		if (this.elementsEqual(this.get(i), element))
		{
			this.m_list.removeAt(i);
			return element;
		}
	}
	return null;
};
oFF.XListWeakRef.prototype.elementsEqual = function(element1, element2)
{
	return oFF.isNull(element1) && oFF.isNull(element2) || oFF.notNull(element1) && element1.isEqualTo(element2);
};
oFF.XListWeakRef.prototype.contains = function(element)
{
	return this.getIndex(element) !== -1;
};
oFF.XListWeakRef.prototype.createListCopy = function()
{
	var target = oFF.XList.create();
	var size = this.size();
	for (var i = 0; i < size; i++)
	{
		target.add(this.get(i));
	}
	return target;
};
oFF.XListWeakRef.prototype.sublist = function(beginIndex, endIndex)
{
	var start = oFF.XMath.max(beginIndex, 0);
	var end = endIndex < 0 ? this.size() : endIndex;
	var target = oFF.XList.create();
	var size = this.size();
	for (var i = start; i < size && i <= end; i++)
	{
		target.add(this.get(i));
	}
	return target;
};
oFF.XListWeakRef.prototype.set = function(index, element)
{
	this.m_list.set(index, oFF.XWeakReferenceUtil.getWeakRef(element));
};
oFF.XListWeakRef.prototype.getIterator = function()
{
	var copy = this.createListCopy();
	return copy.getIterator();
};
oFF.XListWeakRef.prototype.getValuesAsReadOnlyList = function()
{
	return this;
};
oFF.XListWeakRef.prototype.sortByComparator = oFF.noSupport;
oFF.XListWeakRef.prototype.sortByDirection = oFF.noSupport;
oFF.XListWeakRef.prototype.moveElement = function(fromIndex, toIndex)
{
	this.m_list.moveElement(fromIndex, toIndex);
};
oFF.XListWeakRef.prototype.createArrayCopy = oFF.noSupport;
oFF.XListWeakRef.prototype.hasElements = function()
{
	return this.m_list.hasElements();
};
oFF.XListWeakRef.prototype.size = function()
{
	return this.m_list.size();
};
oFF.XListWeakRef.prototype.clear = function()
{
	this.m_list.clear();
};
oFF.XListWeakRef.prototype.toString = function()
{
	return this.m_list.toString();
};

oFF.XWeakMap = function() {};
oFF.XWeakMap.prototype = new oFF.DfAbstractMapByString();
oFF.XWeakMap.prototype._ff_c = "XWeakMap";

oFF.XWeakMap.create = function()
{
	var hashMap = new oFF.XWeakMap();
	hashMap.m_storage = oFF.XHashMapByString.create();
	return hashMap;
};
oFF.XWeakMap.prototype.m_storage = null;
oFF.XWeakMap.prototype.releaseObject = function()
{
	this.m_storage = oFF.XObjectExt.release(this.m_storage);
	oFF.DfAbstractMapByString.prototype.releaseObject.call( this );
};
oFF.XWeakMap.prototype.containsKey = function(key)
{
	return this.m_storage.containsKey(key);
};
oFF.XWeakMap.prototype.contains = function(element)
{
	var values = this.getValuesAsReadOnlyList();
	return values.contains(element);
};
oFF.XWeakMap.prototype.getByKey = function(key)
{
	if (oFF.isNull(key))
	{
		return null;
	}
	var weakRef = this.m_storage.getByKey(key);
	var hardRef = oFF.XWeakReferenceUtil.getHardRef(weakRef);
	return hardRef;
};
oFF.XWeakMap.prototype.remove = function(key)
{
	var weakRef = this.m_storage.remove(key);
	return oFF.XWeakReferenceUtil.getHardRef(weakRef);
};
oFF.XWeakMap.prototype.cloneExt = function(flags)
{
	return this.createMapByStringCopy();
};
oFF.XWeakMap.prototype.createMapByStringCopy = function()
{
	var copy = oFF.XWeakMap.create();
	var iterator = this.getKeysAsIteratorOfString();
	while (iterator.hasNext())
	{
		var next = iterator.next();
		copy.put(next, this.getByKey(next));
	}
	return copy;
};
oFF.XWeakMap.prototype.getKeysAsReadOnlyListOfString = function()
{
	return this.m_storage.getKeysAsReadOnlyListOfString();
};
oFF.XWeakMap.prototype.put = function(key, element)
{
	if (oFF.isNull(key))
	{
		throw oFF.XException.createIllegalArgumentException("Null cannot be key");
	}
	this.m_storage.put(key, oFF.XWeakReferenceUtil.getWeakRef(element));
};
oFF.XWeakMap.prototype.getValuesAsReadOnlyList = function()
{
	var list = oFF.XList.create();
	var iterator = this.getKeysAsIteratorOfString();
	while (iterator.hasNext())
	{
		var next = iterator.next();
		var weakRef = this.m_storage.getByKey(next);
		var hardRef = oFF.XWeakReferenceUtil.getHardRef(weakRef);
		list.add(hardRef);
	}
	return list;
};
oFF.XWeakMap.prototype.hasElements = function()
{
	return this.m_storage.hasElements();
};
oFF.XWeakMap.prototype.size = function()
{
	return this.m_storage.size();
};
oFF.XWeakMap.prototype.clear = function()
{
	this.m_storage.clear();
};
oFF.XWeakMap.prototype.toString = function()
{
	return this.m_storage.toString();
};

oFF.XAbstractList = function() {};
oFF.XAbstractList.prototype = new oFF.DfAbstractList();
oFF.XAbstractList.prototype._ff_c = "XAbstractList";

oFF.XAbstractList.prototype.m_list = null;
oFF.XAbstractList.prototype.releaseObject = function()
{
	this.m_list = oFF.XObjectExt.release(this.m_list);
	oFF.DfAbstractList.prototype.releaseObject.call( this );
};
oFF.XAbstractList.prototype.hasElements = function()
{
	return this.m_list.hasElements();
};
oFF.XAbstractList.prototype.size = function()
{
	return this.m_list.size();
};
oFF.XAbstractList.prototype.clear = function()
{
	this.m_list.clear();
};
oFF.XAbstractList.prototype.getValuesAsReadOnlyList = function()
{
	return this.m_list.getValuesAsReadOnlyList();
};
oFF.XAbstractList.prototype.getIterator = function()
{
	return this.m_list.getIterator();
};
oFF.XAbstractList.prototype.getIndex = function(element)
{
	return this.m_list.getIndex(element);
};
oFF.XAbstractList.prototype.get = function(index)
{
	return this.m_list.get(index);
};
oFF.XAbstractList.prototype.moveElement = function(fromIndex, toIndex)
{
	this.m_list.moveElement(fromIndex, toIndex);
};
oFF.XAbstractList.prototype.sortByComparator = function(comparator)
{
	this.m_list.sortByComparator(comparator);
};
oFF.XAbstractList.prototype.sortByDirection = function(sortDirection)
{
	this.m_list.sortByDirection(sortDirection);
};
oFF.XAbstractList.prototype.createListCopy = function()
{
	return this.m_list.createListCopy();
};
oFF.XAbstractList.prototype.sublist = function(beginIndex, endIndex)
{
	return this.m_list.sublist(beginIndex, endIndex);
};
oFF.XAbstractList.prototype.createArrayCopy = function()
{
	return this.m_list.createArrayCopy();
};
oFF.XAbstractList.prototype.insert = function(index, element)
{
	this.m_list.insert(index, element);
};
oFF.XAbstractList.prototype.removeAt = function(index)
{
	return this.m_list.removeAt(index);
};
oFF.XAbstractList.prototype.addAll = function(other)
{
	this.m_list.addAll(other);
};
oFF.XAbstractList.prototype.add = function(element)
{
	this.m_list.add(element);
};
oFF.XAbstractList.prototype.removeElement = function(element)
{
	return this.m_list.removeElement(element);
};
oFF.XAbstractList.prototype.set = function(index, element)
{
	this.m_list.set(index, element);
};
oFF.XAbstractList.prototype.toString = function()
{
	return this.m_list.toString();
};

oFF.XLinkedHashMapByString = function() {};
oFF.XLinkedHashMapByString.prototype = new oFF.XAbstractReadOnlyMap();
oFF.XLinkedHashMapByString.prototype._ff_c = "XLinkedHashMapByString";

oFF.XLinkedHashMapByString.create = function()
{
	var hashMap = new oFF.XLinkedHashMapByString();
	hashMap.setup();
	hashMap.m_order = oFF.XListOfString.create();
	return hashMap;
};
oFF.XLinkedHashMapByString.prototype.m_order = null;
oFF.XLinkedHashMapByString.prototype.releaseObject = function()
{
	this.m_order = oFF.XObjectExt.release(this.m_order);
	oFF.XAbstractReadOnlyMap.prototype.releaseObject.call( this );
};
oFF.XLinkedHashMapByString.prototype.clear = function()
{
	this.m_storage.clear();
	this.m_order.clear();
};
oFF.XLinkedHashMapByString.prototype.remove = function(key)
{
	if (oFF.isNull(key))
	{
		return null;
	}
	this.m_order.removeElement(key);
	return this.m_storage.remove(key);
};
oFF.XLinkedHashMapByString.prototype.cloneExt = function(flags)
{
	return this.createMapByStringCopy();
};
oFF.XLinkedHashMapByString.prototype.createMapByStringCopy = function()
{
	var copy = oFF.XLinkedHashMapByString.create();
	for (var i = 0; i < this.m_order.size(); i++)
	{
		var next = this.m_order.get(i);
		copy.put(next, this.getByKey(next));
	}
	return copy;
};
oFF.XLinkedHashMapByString.prototype.getKeysAsReadOnlyListOfString = function()
{
	return this.m_order.createListOfStringCopy();
};
oFF.XLinkedHashMapByString.prototype.put = function(key, element)
{
	if (oFF.notNull(key))
	{
		if (!this.m_storage.containsKey(key))
		{
			this.m_order.add(key);
		}
		this.m_storage.put(key, element);
	}
};
oFF.XLinkedHashMapByString.prototype.getValuesAsReadOnlyList = function()
{
	var list = oFF.XList.create();
	for (var i = 0; i < this.m_order.size(); i++)
	{
		list.add(this.m_storage.getByKey(this.m_order.get(i)));
	}
	return list;
};
oFF.XLinkedHashMapByString.prototype.isEqualTo = function(other)
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
	var thisKeys = this.getKeysAsReadOnlyListOfString();
	var thisValues = this.getValuesAsReadOnlyList();
	var otherKeys = otherMap.getKeysAsReadOnlyListOfString();
	var otherValues = otherMap.getValuesAsReadOnlyList();
	for (var keyIdx = 0; keyIdx < thisKeys.size(); keyIdx++)
	{
		if (!oFF.XString.isEqual(thisKeys.get(keyIdx), otherKeys.get(keyIdx)))
		{
			return false;
		}
		if (!thisValues.get(keyIdx).isEqualTo(otherValues.get(keyIdx)))
		{
			return false;
		}
	}
	return true;
};

oFF.XSetOfNameObject = function() {};
oFF.XSetOfNameObject.prototype = new oFF.XAbstractReadOnlyMap();
oFF.XSetOfNameObject.prototype._ff_c = "XSetOfNameObject";

oFF.XSetOfNameObject.create = function()
{
	var list = new oFF.XSetOfNameObject();
	list.setup();
	return list;
};
oFF.XSetOfNameObject.prototype.createSetCopy = function()
{
	var copy = oFF.XSetOfNameObject.create();
	var iterator = this.m_storage.getIterator();
	while (iterator.hasNext())
	{
		copy.add(iterator.next());
	}
	return copy;
};
oFF.XSetOfNameObject.prototype.cloneExt = function(flags)
{
	var clone = oFF.XSetOfNameObject.create();
	oFF.XCollectionUtils.addAllClones(clone, this.m_storage);
	return clone;
};
oFF.XSetOfNameObject.prototype.add = function(element)
{
	this.m_storage.put(element.getName(), element);
};
oFF.XSetOfNameObject.prototype.removeElement = function(element)
{
	this.m_storage.remove(element.getName());
	return element;
};
oFF.XSetOfNameObject.prototype.addAll = function(other)
{
	oFF.XListUtils.addAllObjects(other, this);
};
oFF.XSetOfNameObject.prototype.unmodifiableSetOfNameObject = function()
{
	return oFF.XUnmodSetOfNameObject.create(this);
};
oFF.XSetOfNameObject.prototype.clear = function()
{
	this.m_storage.clear();
};
oFF.XSetOfNameObject.prototype.put = function(key, element)
{
	this.m_storage.put(key, element);
};
oFF.XSetOfNameObject.prototype.createMapByStringCopy = function()
{
	return this.m_storage.createMapByStringCopy();
};
oFF.XSetOfNameObject.prototype.remove = function(key)
{
	return this.m_storage.remove(key);
};

oFF.XListOfNameObject = function() {};
oFF.XListOfNameObject.prototype = new oFF.XAbstractList();
oFF.XListOfNameObject.prototype._ff_c = "XListOfNameObject";

oFF.XListOfNameObject.create = function()
{
	var list = new oFF.XListOfNameObject();
	list.setup();
	return list;
};
oFF.XListOfNameObject._getName = function(element)
{
	return oFF.isNull(element) ? null : element.getName();
};
oFF.XListOfNameObject.prototype.m_map = null;
oFF.XListOfNameObject.prototype.setup = function()
{
	this.m_map = oFF.XWeakMap.create();
	this.m_list = oFF.XList.create();
};
oFF.XListOfNameObject.prototype.releaseObject = function()
{
	this.m_map = oFF.XObjectExt.release(this.m_map);
	oFF.XAbstractList.prototype.releaseObject.call( this );
};
oFF.XListOfNameObject.prototype.containsKey = function(key)
{
	return this.m_map.containsKey(key);
};
oFF.XListOfNameObject.prototype.getByKey = function(key)
{
	return this.m_map.getByKey(key);
};
oFF.XListOfNameObject.prototype.getKeysAsReadOnlyListOfString = function()
{
	var result = oFF.XListOfString.create();
	var size = this.m_list.size();
	for (var i = 0; i < size; i++)
	{
		var name = this.m_list.get(i).getName();
		if (oFF.notNull(name))
		{
			result.add(name);
		}
	}
	return result;
};
oFF.XListOfNameObject.prototype.getKeysAsIteratorOfString = function()
{
	return this.m_map.getKeysAsIteratorOfString();
};
oFF.XListOfNameObject.prototype._putNameNotNull = function(element)
{
	var name = element.getName();
	if (oFF.notNull(name))
	{
		this.m_map.put(name, element);
	}
};
oFF.XListOfNameObject.prototype._removeNameNotNull = function(element)
{
	var name = element.getName();
	if (oFF.notNull(name))
	{
		this.m_map.remove(name);
	}
};
oFF.XListOfNameObject.prototype.add = function(element)
{
	if (oFF.notNull(element))
	{
		this.m_list.add(element);
		this._putNameNotNull(element);
	}
};
oFF.XListOfNameObject.prototype.addAll = function(other)
{
	oFF.XListUtils.addAllObjects(other, this);
};
oFF.XListOfNameObject.prototype.insert = function(index, element)
{
	if (oFF.notNull(element))
	{
		this.m_list.insert(index, element);
		this._putNameNotNull(element);
	}
};
oFF.XListOfNameObject.prototype.set = function(index, element)
{
	if (oFF.notNull(element))
	{
		this.m_list.set(index, element);
		this._putNameNotNull(element);
	}
};
oFF.XListOfNameObject.prototype.removeAt = function(index)
{
	var objAtIndex = this.m_list.removeAt(index);
	this._removeNameNotNull(objAtIndex);
	return objAtIndex;
};
oFF.XListOfNameObject.prototype.removeElement = function(element)
{
	if (oFF.notNull(element))
	{
		this.m_list.removeElement(element);
		this._removeNameNotNull(element);
	}
	return element;
};
oFF.XListOfNameObject.prototype.clear = function()
{
	oFF.XAbstractList.prototype.clear.call( this );
	this.m_map.clear();
};
oFF.XListOfNameObject.prototype._getIndexByName = function(name)
{
	if (this.m_map.containsKey(name))
	{
		return oFF.XCollectionUtils.getIndexByName(this.m_list, name);
	}
	return -1;
};

oFF.XLookupListOfNameObject = function() {};
oFF.XLookupListOfNameObject.prototype = new oFF.XAbstractList();
oFF.XLookupListOfNameObject.prototype._ff_c = "XLookupListOfNameObject";

oFF.XLookupListOfNameObject.create = function()
{
	var list = new oFF.XLookupListOfNameObject();
	list.setup();
	return list;
};
oFF.XLookupListOfNameObject.prototype.setup = function()
{
	this.m_list = oFF.XList.create();
};
oFF.XLookupListOfNameObject.prototype.containsKey = function(key)
{
	return this.getByKey(key) !== null;
};
oFF.XLookupListOfNameObject.prototype.getByKey = function(key)
{
	return oFF.XCollectionUtils.getByName(this, key);
};
oFF.XLookupListOfNameObject.prototype.getKeysAsIteratorOfString = function()
{
	return this.getKeysAsReadOnlyListOfString().getIterator();
};
oFF.XLookupListOfNameObject.prototype.getKeysAsReadOnlyListOfString = function()
{
	var keys = oFF.XListOfString.create();
	var s = this.size();
	for (var i = 0; i < s; i++)
	{
		var content = this.get(i);
		if (oFF.notNull(content))
		{
			keys.add(content.getName());
		}
	}
	return keys;
};

oFF.XLinkedMap = function() {};
oFF.XLinkedMap.prototype = new oFF.XListOfNameObject();
oFF.XLinkedMap.prototype._ff_c = "XLinkedMap";

oFF.XLinkedMap.createLinkedMap = function()
{
	var list = new oFF.XLinkedMap();
	list.setup();
	return list;
};
oFF.XLinkedMap.prototype.add = function(element)
{
	var name = oFF.DfNameObject.getSafeName(element);
	if (oFF.notNull(name))
	{
		var oldPosition = this._getIndexByName(name);
		if (oldPosition !== -1)
		{
			this.m_list.removeAt(oldPosition);
		}
		this.m_list.add(element);
		this.m_map.put(name, element);
	}
};
oFF.XLinkedMap.prototype.insert = function(index, element)
{
	var name = oFF.DfNameObject.getSafeName(element);
	if (oFF.notNull(name))
	{
		var oldPosition = this._getIndexByName(name);
		if (oldPosition !== -1)
		{
			this.m_list.removeAt(oldPosition);
		}
		var listSize = this.m_list.size();
		if (index >= listSize && oldPosition !== -1)
		{
			this.m_list.insert(listSize, element);
		}
		else
		{
			this.m_list.insert(index, element);
		}
		this.m_map.put(name, element);
	}
};
oFF.XLinkedMap.prototype.set = function(index, element)
{
	var name = oFF.DfNameObject.getSafeName(element);
	if (oFF.notNull(name))
	{
		var oldPosition = this._getIndexByName(name);
		this.m_list.set(index, element);
		if (oldPosition !== -1 && oldPosition !== index)
		{
			this.m_list.removeAt(oldPosition);
		}
		this.m_map.put(name, element);
	}
};
oFF.XLinkedMap.prototype._getIndexByName = function(name)
{
	if (this.m_map.containsKey(name))
	{
		return oFF.XCollectionUtils.getIndexByName(this.m_list, name);
	}
	return -1;
};

oFF.CoreExtModule = function() {};
oFF.CoreExtModule.prototype = new oFF.DfModule();
oFF.CoreExtModule.prototype._ff_c = "CoreExtModule";

oFF.CoreExtModule.s_module = null;
oFF.CoreExtModule.getInstance = function()
{
	if (oFF.isNull(oFF.CoreExtModule.s_module))
	{
		oFF.DfModule.checkInitialized(oFF.CoreModule.getInstance());
		oFF.DfModule.checkInitialized(oFF.PlatformModule.getInstance());
		oFF.CoreExtModule.s_module = oFF.DfModule.startExt(new oFF.CoreExtModule());
		oFF.XStreamReferenceString.setupStringElement();
		oFF.DfModule.stopExt(oFF.CoreExtModule.s_module);
	}
	return oFF.CoreExtModule.s_module;
};
oFF.CoreExtModule.prototype.getName = function()
{
	return "ff0030.core.ext";
};

oFF.CoreExtModule.getInstance();

return sap.firefly;
	} );