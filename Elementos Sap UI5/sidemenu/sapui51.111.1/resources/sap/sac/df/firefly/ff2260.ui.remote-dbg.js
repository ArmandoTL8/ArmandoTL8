/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
[
"sap/sac/df/firefly/ff2240.ui.program"
],
function(oFF)
{
"use strict";

oFF.UiCompositeRemoteFactory = function() {};
oFF.UiCompositeRemoteFactory.prototype = new oFF.XObject();
oFF.UiCompositeRemoteFactory.prototype._ff_c = "UiCompositeRemoteFactory";

oFF.UiCompositeRemoteFactory.prototype.newInstance = function()
{
	return oFF.UiCompositeRemote.create();
};

oFF.UiServerEvent = function() {};
oFF.UiServerEvent.prototype = new oFF.XObject();
oFF.UiServerEvent.prototype._ff_c = "UiServerEvent";

oFF.UiServerEvent.s_evMap = null;
oFF.UiServerEvent.staticSetup = function()
{
	oFF.UiServerEvent.s_evMap = oFF.XSetOfNameObject.create();
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnTransferStart());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnTransferEnd());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnSitAndWait());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnChangedValue());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnReadOnlyPropertySync());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnSelect());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnSelectionChange());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnCollapse());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnExpand());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnDoubleClick());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnClick());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnContextMenu());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnClose());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnOpen());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnBeforeClose());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnBeforeOpen());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnAfterClose());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnAfterOpen());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnChange());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnEnter());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnLiveChange());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnDelete());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnDetailPress());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnPress());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnEditingBegin());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnEditingEnd());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnBack());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnRefresh());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnLoadFinished());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnMove());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnMoveStart());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnMoveEnd());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnResize());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnSuggestionSelect());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnScroll());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnScrollLoad());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnHover());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnHoverEnd());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnPaste());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnSelectionFinish());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnSearch());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnButtonPress());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnError());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnReadLineFinished());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnExecute());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnTerminate());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnFileDrop());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnDrop());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnItemClose());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnItemSelect());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnTableDragAndDrop());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnMenuPress());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnValueHelpRequest());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnColumnResize());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnRowResize());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnItemPress());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnDragStart());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnDragEnd());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnEscape());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnKeyDown());
	oFF.UiServerEvent.s_evMap.add(new oFF.UiServerEvOnKeyUp());
};
oFF.UiServerEvent.lookup = function(name)
{
	return oFF.UiServerEvent.s_evMap.getByKey(name);
};
oFF.UiServerEvent.prototype.executeOperation = oFF.noSupport;
oFF.UiServerEvent.prototype.getEventType = oFF.noSupport;
oFF.UiServerEvent.prototype.getName = function()
{
	var tmpEvent = this.getEventType();
	if (oFF.notNull(tmpEvent))
	{
		return tmpEvent.getRemoteName();
	}
	throw oFF.XException.createRuntimeException("Missing event defintion for UiServerEvent. Check remote server events!");
};
oFF.UiServerEvent.prototype.isControlContext = function()
{
	return true;
};
oFF.UiServerEvent.prototype.createControlEventWithParams = function(uiContext, uiAppContainer, operation)
{
	if (oFF.notNull(uiAppContainer) && oFF.notNull(uiContext))
	{
		var newParameters = this.getParametersFromEvent(operation);
		return oFF.UiControlEvent.create(uiContext, newParameters);
	}
	throw oFF.XException.createRuntimeException("Event handling failed! Missing uiContext or uiAppContainer. Check remote server events!");
};
oFF.UiServerEvent.prototype.createSelectionEvent = function(uiContext, uiAppContainer, operation)
{
	if (oFF.notNull(uiAppContainer) && oFF.notNull(uiContext))
	{
		var uiManager = uiAppContainer.getUiManager();
		if (oFF.notNull(uiManager))
		{
			var newParameters = this.getParametersFromEvent(operation);
			var selectedItems = oFF.XList.create();
			if (oFF.notNull(operation) && operation.size() > oFF.SphereServer.CUSTOM_PARAM_OFFSET)
			{
				var selectedItemIds = operation.getStringAt(oFF.SphereServer.CUSTOM_PARAM_OFFSET);
				var selectedIds = oFF.XStringTokenizer.splitString(selectedItemIds, oFF.UiRemoteProtocol.MULTI_ITEM_SEPARATOR);
				if (oFF.notNull(selectedIds))
				{
					var idsIterator = selectedIds.getIterator();
					while (idsIterator.hasNext())
					{
						var tmpSelectedId = idsIterator.next();
						var tmpSelectedItem = uiManager.selectById(tmpSelectedId);
						selectedItems.add(tmpSelectedItem);
					}
				}
			}
			return oFF.UiSelectionEvent.createMultiSelection(uiContext, newParameters, selectedItems);
		}
	}
	throw oFF.XException.createRuntimeException("Event handling failed! Missing uiContext or uiAppContainer. Check remote server events!");
};
oFF.UiServerEvent.prototype.createResizeEvent = function(uiContext, uiAppContainer, operation)
{
	if (oFF.notNull(uiAppContainer) && oFF.notNull(uiContext))
	{
		var resizeEvent = oFF.UiResizeEvent.create(uiContext);
		this.deserializeEventInternal(resizeEvent, operation);
		return resizeEvent;
	}
	throw oFF.XException.createRuntimeException("Event handling failed! Missing uiContext or uiAppContainer. Check remote server events!");
};
oFF.UiServerEvent.prototype.createMoveEvent = function(uiContext, uiAppContainer, operation)
{
	if (oFF.notNull(uiAppContainer) && oFF.notNull(uiContext))
	{
		var moveEvent = oFF.UiMoveEvent.create(uiContext);
		this.deserializeEventInternal(moveEvent, operation);
		return moveEvent;
	}
	throw oFF.XException.createRuntimeException("Event handling failed! Missing uiContext or uiAppContainer. Check remote server events!");
};
oFF.UiServerEvent.prototype.createDropEventWithParams = function(uiContext, uiAppContainer, operation)
{
	if (oFF.notNull(uiAppContainer) && oFF.notNull(uiContext))
	{
		var dropEvent = oFF.UiDropEvent.create(uiContext);
		this.deserializeEventInternal(dropEvent, operation);
		var uiManager = uiAppContainer.getUiManager();
		if (oFF.notNull(uiManager))
		{
			var draggedControl = null;
			var droppedControl = null;
			var relativeDropPosition = null;
			if (oFF.notNull(operation) && operation.size() > oFF.SphereServer.CUSTOM_PARAM_OFFSET)
			{
				var draggedControlId = operation.getStringAt(oFF.SphereServer.CUSTOM_PARAM_OFFSET);
				draggedControl = uiManager.selectById(draggedControlId);
				var droppedControlId = operation.getStringAt(oFF.SphereServer.CUSTOM_PARAM_OFFSET + 2);
				droppedControl = uiManager.selectById(droppedControlId);
				var relativeDropPosStr = operation.getStringAt(oFF.SphereServer.CUSTOM_PARAM_OFFSET + 4);
				relativeDropPosition = oFF.UiRelativeDropPosition.lookup(relativeDropPosStr);
			}
			dropEvent.setDropData(draggedControl, droppedControl, relativeDropPosition);
		}
		return dropEvent;
	}
	throw oFF.XException.createRuntimeException("Event handling failed! Missing uiContext or uiAppContainer. Check remote server events!");
};
oFF.UiServerEvent.prototype.createItemEventWithParams = function(uiContext, uiAppContainer, operation)
{
	if (oFF.notNull(uiAppContainer) && oFF.notNull(uiContext))
	{
		var uiManager = uiAppContainer.getUiManager();
		if (oFF.notNull(uiManager))
		{
			var newParameters = this.getParametersFromEvent(operation);
			var affectedItem = null;
			if (oFF.notNull(operation) && operation.size() > oFF.SphereServer.CUSTOM_PARAM_OFFSET)
			{
				var affectedItemId = operation.getStringAt(oFF.SphereServer.CUSTOM_PARAM_OFFSET);
				affectedItem = uiManager.selectById(affectedItemId);
			}
			return oFF.UiItemEvent.createItem(uiContext, newParameters, affectedItem);
		}
	}
	throw oFF.XException.createRuntimeException("Event handling failed! Missing uiContext or uiAppContainer. Check remote server events!");
};
oFF.UiServerEvent.prototype.createKeyboardEvent = function(uiContext, uiAppContainer, operation)
{
	if (oFF.notNull(uiAppContainer) && oFF.notNull(uiContext))
	{
		var keyboardEvent = oFF.UiKeyboardEvent.create(uiContext);
		this.deserializeEventInternal(keyboardEvent, operation);
		return keyboardEvent;
	}
	throw oFF.XException.createRuntimeException("Event handling failed! Missing uiContext or uiAppContainer. Check remote server events!");
};
oFF.UiServerEvent.prototype.getParametersFromEvent = function(operation)
{
	var newParameters = oFF.XProperties.create();
	if (oFF.notNull(operation) && operation.size() > oFF.SphereServer.PARAM_OFFSET)
	{
		var newParametersString = operation.getStringAt(oFF.SphereServer.PARAM_OFFSET);
		if (oFF.notNull(newParametersString))
		{
			newParameters.deserialize(newParametersString);
		}
	}
	return newParameters;
};
oFF.UiServerEvent.prototype.deserializeEventInternal = function(eventBase, operation)
{
	if (oFF.notNull(eventBase) && oFF.notNull(operation))
	{
		if (operation.size() > oFF.SphereServer.PARAM_OFFSET)
		{
			eventBase.setByString(operation.getStringAt(oFF.SphereServer.PARAM_OFFSET));
		}
	}
	else
	{
		throw oFF.XException.createRuntimeException("Event deserialize failed! Missinf required information. Check remote server events!");
	}
};

oFF.UiServerEvOnAfterClose = function() {};
oFF.UiServerEvOnAfterClose.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnAfterClose.prototype._ff_c = "UiServerEvOnAfterClose";

oFF.UiServerEvOnAfterClose.prototype.getEventType = function()
{
	return oFF.UiEvent.ON_AFTER_CLOSE;
};
oFF.UiServerEvOnAfterClose.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var newEvent = this.createControlEventWithParams(uiContext, uiAppContainer, operation);
	var tsControl = uiContext;
	tsControl.onAfterClose(newEvent);
	return uiAppContainer;
};

oFF.UiServerEvOnAfterOpen = function() {};
oFF.UiServerEvOnAfterOpen.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnAfterOpen.prototype._ff_c = "UiServerEvOnAfterOpen";

oFF.UiServerEvOnAfterOpen.prototype.getEventType = function()
{
	return oFF.UiEvent.ON_AFTER_OPEN;
};
oFF.UiServerEvOnAfterOpen.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var newEvent = this.createControlEventWithParams(uiContext, uiAppContainer, operation);
	var tsControl = uiContext;
	tsControl.onAfterOpen(newEvent);
	return uiAppContainer;
};

oFF.UiServerEvOnBack = function() {};
oFF.UiServerEvOnBack.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnBack.prototype._ff_c = "UiServerEvOnBack";

oFF.UiServerEvOnBack.prototype.getEventType = function()
{
	return oFF.UiEvent.ON_BACK;
};
oFF.UiServerEvOnBack.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var newEvent = this.createControlEventWithParams(uiContext, uiAppContainer, operation);
	var tsControl = uiContext;
	tsControl.onBack(newEvent);
	return uiAppContainer;
};

oFF.UiServerEvOnBeforeClose = function() {};
oFF.UiServerEvOnBeforeClose.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnBeforeClose.prototype._ff_c = "UiServerEvOnBeforeClose";

oFF.UiServerEvOnBeforeClose.prototype.getEventType = function()
{
	return oFF.UiEvent.ON_BEFORE_CLOSE;
};
oFF.UiServerEvOnBeforeClose.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var newEvent = this.createControlEventWithParams(uiContext, uiAppContainer, operation);
	var tsControl = uiContext;
	tsControl.onBeforeClose(newEvent);
	return uiAppContainer;
};

oFF.UiServerEvOnBeforeOpen = function() {};
oFF.UiServerEvOnBeforeOpen.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnBeforeOpen.prototype._ff_c = "UiServerEvOnBeforeOpen";

oFF.UiServerEvOnBeforeOpen.prototype.getEventType = function()
{
	return oFF.UiEvent.ON_BEFORE_OPEN;
};
oFF.UiServerEvOnBeforeOpen.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var newEvent = this.createControlEventWithParams(uiContext, uiAppContainer, operation);
	var tsControl = uiContext;
	tsControl.onBeforeOpen(newEvent);
	return uiAppContainer;
};

oFF.UiServerEvOnButtonPress = function() {};
oFF.UiServerEvOnButtonPress.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnButtonPress.prototype._ff_c = "UiServerEvOnButtonPress";

oFF.UiServerEvOnButtonPress.prototype.getEventType = function()
{
	return oFF.UiEvent.ON_BUTTON_PRESS;
};
oFF.UiServerEvOnButtonPress.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var newEvent = this.createControlEventWithParams(uiContext, uiAppContainer, operation);
	var tsControl = uiContext;
	tsControl.onButtonPress(newEvent);
	return uiAppContainer;
};

oFF.UiServerEvOnChange = function() {};
oFF.UiServerEvOnChange.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnChange.prototype._ff_c = "UiServerEvOnChange";

oFF.UiServerEvOnChange.prototype.getEventType = function()
{
	return oFF.UiEvent.ON_CHANGE;
};
oFF.UiServerEvOnChange.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var newEvent = this.createControlEventWithParams(uiContext, uiAppContainer, operation);
	var tsControl = uiContext;
	tsControl.onChange(newEvent);
	return uiAppContainer;
};

oFF.UiServerEvOnChangedValue = function() {};
oFF.UiServerEvOnChangedValue.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnChangedValue.prototype._ff_c = "UiServerEvOnChangedValue";

oFF.UiServerEvOnChangedValue.prototype.getName = function()
{
	return oFF.UiRemoteProtocol.EV_ON_CHANGED_VALUE;
};
oFF.UiServerEvOnChangedValue.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var offset = oFF.SphereServer.PARAM_OFFSET;
	var methodName = operation.getStringAt(offset);
	offset++;
	var op = oFF.UiAllOperations.lookupOp(methodName);
	op.executeOperation(uiAppContainer, uiContext, operation, offset);
	return uiAppContainer;
};

oFF.UiServerEvOnClick = function() {};
oFF.UiServerEvOnClick.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnClick.prototype._ff_c = "UiServerEvOnClick";

oFF.UiServerEvOnClick.prototype.getEventType = function()
{
	return oFF.UiEvent.ON_CLICK;
};
oFF.UiServerEvOnClick.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var newEvent = this.createControlEventWithParams(uiContext, uiAppContainer, operation);
	var tsControl = uiContext;
	tsControl.onClick(newEvent);
	return uiAppContainer;
};

oFF.UiServerEvOnClose = function() {};
oFF.UiServerEvOnClose.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnClose.prototype._ff_c = "UiServerEvOnClose";

oFF.UiServerEvOnClose.prototype.getEventType = function()
{
	return oFF.UiEvent.ON_CLOSE;
};
oFF.UiServerEvOnClose.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var newEvent = this.createControlEventWithParams(uiContext, uiAppContainer, operation);
	var tsControl = uiContext;
	tsControl.onClose(newEvent);
	return uiAppContainer;
};

oFF.UiServerEvOnCollapse = function() {};
oFF.UiServerEvOnCollapse.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnCollapse.prototype._ff_c = "UiServerEvOnCollapse";

oFF.UiServerEvOnCollapse.prototype.getEventType = function()
{
	return oFF.UiEvent.ON_COLLAPSE;
};
oFF.UiServerEvOnCollapse.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var newEvent = this.createItemEventWithParams(uiContext, uiAppContainer, operation);
	var tsControl = uiContext;
	tsControl.onCollapse(newEvent);
	return uiAppContainer;
};

oFF.UiServerEvOnColumnResize = function() {};
oFF.UiServerEvOnColumnResize.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnColumnResize.prototype._ff_c = "UiServerEvOnColumnResize";

oFF.UiServerEvOnColumnResize.prototype.getEventType = function()
{
	return oFF.UiEvent.ON_COLUMN_RESIZE;
};
oFF.UiServerEvOnColumnResize.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var newEvent = this.createControlEventWithParams(uiContext, uiAppContainer, operation);
	var tsControl = uiContext;
	tsControl.onColumnResize(newEvent);
	return uiAppContainer;
};

oFF.UiServerEvOnContextMenu = function() {};
oFF.UiServerEvOnContextMenu.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnContextMenu.prototype._ff_c = "UiServerEvOnContextMenu";

oFF.UiServerEvOnContextMenu.prototype.getEventType = function()
{
	return oFF.UiEvent.ON_CONTEXT_MENU;
};
oFF.UiServerEvOnContextMenu.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var newEvent = this.createControlEventWithParams(uiContext, uiAppContainer, operation);
	var tsControl = uiContext;
	tsControl.onContextMenu(newEvent);
	return uiAppContainer;
};

oFF.UiServerEvOnDelete = function() {};
oFF.UiServerEvOnDelete.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnDelete.prototype._ff_c = "UiServerEvOnDelete";

oFF.UiServerEvOnDelete.prototype.getEventType = function()
{
	return oFF.UiEvent.ON_DELETE;
};
oFF.UiServerEvOnDelete.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var newEvent = this.createItemEventWithParams(uiContext, uiAppContainer, operation);
	var tsControl = uiContext;
	tsControl.onDelete(newEvent);
	return uiAppContainer;
};

oFF.UiServerEvOnDetailPress = function() {};
oFF.UiServerEvOnDetailPress.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnDetailPress.prototype._ff_c = "UiServerEvOnDetailPress";

oFF.UiServerEvOnDetailPress.prototype.getEventType = function()
{
	return oFF.UiEvent.ON_DETAIL_PRESS;
};
oFF.UiServerEvOnDetailPress.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var newEvent = this.createControlEventWithParams(uiContext, uiAppContainer, operation);
	var tsControl = uiContext;
	tsControl.onDetailPress(newEvent);
	return uiAppContainer;
};

oFF.UiServerEvOnDoubleClick = function() {};
oFF.UiServerEvOnDoubleClick.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnDoubleClick.prototype._ff_c = "UiServerEvOnDoubleClick";

oFF.UiServerEvOnDoubleClick.prototype.getEventType = function()
{
	return oFF.UiEvent.ON_DOUBLE_CLICK;
};
oFF.UiServerEvOnDoubleClick.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var newEvent = this.createControlEventWithParams(uiContext, uiAppContainer, operation);
	var tsControl = uiContext;
	tsControl.onDoubleClick(newEvent);
	return uiAppContainer;
};

oFF.UiServerEvOnDragEnd = function() {};
oFF.UiServerEvOnDragEnd.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnDragEnd.prototype._ff_c = "UiServerEvOnDragEnd";

oFF.UiServerEvOnDragEnd.prototype.getEventType = function()
{
	return oFF.UiEvent.ON_DRAG_END;
};
oFF.UiServerEvOnDragEnd.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var newEvent = this.createControlEventWithParams(uiContext, uiAppContainer, operation);
	var tsControl = uiContext;
	tsControl.onDragEnd(newEvent);
	return uiAppContainer;
};

oFF.UiServerEvOnDragStart = function() {};
oFF.UiServerEvOnDragStart.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnDragStart.prototype._ff_c = "UiServerEvOnDragStart";

oFF.UiServerEvOnDragStart.prototype.getEventType = function()
{
	return oFF.UiEvent.ON_DRAG_START;
};
oFF.UiServerEvOnDragStart.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var newEvent = this.createControlEventWithParams(uiContext, uiAppContainer, operation);
	var tsControl = uiContext;
	tsControl.onDragStart(newEvent);
	return uiAppContainer;
};

oFF.UiServerEvOnDrop = function() {};
oFF.UiServerEvOnDrop.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnDrop.prototype._ff_c = "UiServerEvOnDrop";

oFF.UiServerEvOnDrop.prototype.getEventType = function()
{
	return oFF.UiEvent.ON_DROP;
};
oFF.UiServerEvOnDrop.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var newEvent = this.createDropEventWithParams(uiContext, uiAppContainer, operation);
	var tsControl = uiContext;
	tsControl.onDrop(newEvent);
	return uiAppContainer;
};

oFF.UiServerEvOnEditingBegin = function() {};
oFF.UiServerEvOnEditingBegin.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnEditingBegin.prototype._ff_c = "UiServerEvOnEditingBegin";

oFF.UiServerEvOnEditingBegin.prototype.getEventType = function()
{
	return oFF.UiEvent.ON_EDITING_BEGIN;
};
oFF.UiServerEvOnEditingBegin.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var newEvent = this.createControlEventWithParams(uiContext, uiAppContainer, operation);
	var tsControl = uiContext;
	tsControl.onEditingBegin(newEvent);
	return uiAppContainer;
};

oFF.UiServerEvOnEditingEnd = function() {};
oFF.UiServerEvOnEditingEnd.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnEditingEnd.prototype._ff_c = "UiServerEvOnEditingEnd";

oFF.UiServerEvOnEditingEnd.prototype.getEventType = function()
{
	return oFF.UiEvent.ON_EDITING_END;
};
oFF.UiServerEvOnEditingEnd.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var newEvent = this.createControlEventWithParams(uiContext, uiAppContainer, operation);
	var tsControl = uiContext;
	tsControl.onEditingEnd(newEvent);
	return uiAppContainer;
};

oFF.UiServerEvOnEnter = function() {};
oFF.UiServerEvOnEnter.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnEnter.prototype._ff_c = "UiServerEvOnEnter";

oFF.UiServerEvOnEnter.prototype.getEventType = function()
{
	return oFF.UiEvent.ON_ENTER;
};
oFF.UiServerEvOnEnter.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var newEvent = this.createControlEventWithParams(uiContext, uiAppContainer, operation);
	var tsControl = uiContext;
	tsControl.onEnter(newEvent);
	return uiAppContainer;
};

oFF.UiServerEvOnError = function() {};
oFF.UiServerEvOnError.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnError.prototype._ff_c = "UiServerEvOnError";

oFF.UiServerEvOnError.prototype.getEventType = function()
{
	return oFF.UiEvent.ON_ERROR;
};
oFF.UiServerEvOnError.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var newEvent = this.createControlEventWithParams(uiContext, uiAppContainer, operation);
	var tsControl = uiContext;
	tsControl.onError(newEvent);
	return uiAppContainer;
};

oFF.UiServerEvOnEscape = function() {};
oFF.UiServerEvOnEscape.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnEscape.prototype._ff_c = "UiServerEvOnEscape";

oFF.UiServerEvOnEscape.prototype.getEventType = function()
{
	return oFF.UiEvent.ON_ESCAPE;
};
oFF.UiServerEvOnEscape.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var newEvent = this.createControlEventWithParams(uiContext, uiAppContainer, operation);
	var tsControl = uiContext;
	tsControl.onEscape(newEvent);
	return uiAppContainer;
};

oFF.UiServerEvOnExecute = function() {};
oFF.UiServerEvOnExecute.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnExecute.prototype._ff_c = "UiServerEvOnExecute";

oFF.UiServerEvOnExecute.prototype.getEventType = function()
{
	return oFF.UiEvent.ON_EXECUTE;
};
oFF.UiServerEvOnExecute.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var newEvent = this.createControlEventWithParams(uiContext, uiAppContainer, operation);
	var tsControl = uiContext;
	tsControl.onExecute(newEvent);
	return uiAppContainer;
};

oFF.UiServerEvOnExpand = function() {};
oFF.UiServerEvOnExpand.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnExpand.prototype._ff_c = "UiServerEvOnExpand";

oFF.UiServerEvOnExpand.prototype.getEventType = function()
{
	return oFF.UiEvent.ON_EXPAND;
};
oFF.UiServerEvOnExpand.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var newEvent = this.createItemEventWithParams(uiContext, uiAppContainer, operation);
	var tsControl = uiContext;
	tsControl.onExpand(newEvent);
	return uiAppContainer;
};

oFF.UiServerEvOnFileDrop = function() {};
oFF.UiServerEvOnFileDrop.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnFileDrop.prototype._ff_c = "UiServerEvOnFileDrop";

oFF.UiServerEvOnFileDrop.prototype.getEventType = function()
{
	return oFF.UiEvent.ON_FILE_DROP;
};
oFF.UiServerEvOnFileDrop.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var newEvent = this.createControlEventWithParams(uiContext, uiAppContainer, operation);
	var tsControl = uiContext;
	tsControl.onFileDrop(newEvent);
	return uiAppContainer;
};

oFF.UiServerEvOnHover = function() {};
oFF.UiServerEvOnHover.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnHover.prototype._ff_c = "UiServerEvOnHover";

oFF.UiServerEvOnHover.prototype.getEventType = function()
{
	return oFF.UiEvent.ON_HOVER;
};
oFF.UiServerEvOnHover.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var newEvent = this.createControlEventWithParams(uiContext, uiAppContainer, operation);
	var tsControl = uiContext;
	tsControl.onHover(newEvent);
	return uiAppContainer;
};

oFF.UiServerEvOnHoverEnd = function() {};
oFF.UiServerEvOnHoverEnd.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnHoverEnd.prototype._ff_c = "UiServerEvOnHoverEnd";

oFF.UiServerEvOnHoverEnd.prototype.getEventType = function()
{
	return oFF.UiEvent.ON_HOVER_END;
};
oFF.UiServerEvOnHoverEnd.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var newEvent = this.createControlEventWithParams(uiContext, uiAppContainer, operation);
	var tsControl = uiContext;
	tsControl.onHoverEnd(newEvent);
	return uiAppContainer;
};

oFF.UiServerEvOnItemClose = function() {};
oFF.UiServerEvOnItemClose.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnItemClose.prototype._ff_c = "UiServerEvOnItemClose";

oFF.UiServerEvOnItemClose.prototype.getEventType = function()
{
	return oFF.UiEvent.ON_ITEM_CLOSE;
};
oFF.UiServerEvOnItemClose.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var newEvent = this.createItemEventWithParams(uiContext, uiAppContainer, operation);
	var tsControl = uiContext;
	tsControl.onItemClose(newEvent);
	return uiAppContainer;
};

oFF.UiServerEvOnItemPress = function() {};
oFF.UiServerEvOnItemPress.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnItemPress.prototype._ff_c = "UiServerEvOnItemPress";

oFF.UiServerEvOnItemPress.prototype.getEventType = function()
{
	return oFF.UiEvent.ON_ITEM_PRESS;
};
oFF.UiServerEvOnItemPress.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var newEvent = this.createItemEventWithParams(uiContext, uiAppContainer, operation);
	var tsControl = uiContext;
	tsControl.onItemPress(newEvent);
	return uiAppContainer;
};

oFF.UiServerEvOnItemSelect = function() {};
oFF.UiServerEvOnItemSelect.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnItemSelect.prototype._ff_c = "UiServerEvOnItemSelect";

oFF.UiServerEvOnItemSelect.prototype.getEventType = function()
{
	return oFF.UiEvent.ON_ITEM_SELECT;
};
oFF.UiServerEvOnItemSelect.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var newEvent = this.createItemEventWithParams(uiContext, uiAppContainer, operation);
	var tsControl = uiContext;
	tsControl.onItemSelect(newEvent);
	return uiAppContainer;
};

oFF.UiServerEvOnKeyDown = function() {};
oFF.UiServerEvOnKeyDown.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnKeyDown.prototype._ff_c = "UiServerEvOnKeyDown";

oFF.UiServerEvOnKeyDown.prototype.getEventType = function()
{
	return oFF.UiEvent.ON_KEY_DOWN;
};
oFF.UiServerEvOnKeyDown.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var newEvent = this.createKeyboardEvent(uiContext, uiAppContainer, operation);
	var tsControl = uiContext;
	tsControl.onKeyDown(newEvent);
	return uiAppContainer;
};

oFF.UiServerEvOnKeyUp = function() {};
oFF.UiServerEvOnKeyUp.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnKeyUp.prototype._ff_c = "UiServerEvOnKeyUp";

oFF.UiServerEvOnKeyUp.prototype.getEventType = function()
{
	return oFF.UiEvent.ON_KEY_UP;
};
oFF.UiServerEvOnKeyUp.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var newEvent = this.createKeyboardEvent(uiContext, uiAppContainer, operation);
	var tsControl = uiContext;
	tsControl.onKeyUp(newEvent);
	return uiAppContainer;
};

oFF.UiServerEvOnLiveChange = function() {};
oFF.UiServerEvOnLiveChange.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnLiveChange.prototype._ff_c = "UiServerEvOnLiveChange";

oFF.UiServerEvOnLiveChange.prototype.getEventType = function()
{
	return oFF.UiEvent.ON_LIVE_CHANGE;
};
oFF.UiServerEvOnLiveChange.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var newEvent = this.createControlEventWithParams(uiContext, uiAppContainer, operation);
	var tsControl = uiContext;
	tsControl.onLiveChange(newEvent);
	return uiAppContainer;
};

oFF.UiServerEvOnLoadFinished = function() {};
oFF.UiServerEvOnLoadFinished.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnLoadFinished.prototype._ff_c = "UiServerEvOnLoadFinished";

oFF.UiServerEvOnLoadFinished.prototype.getEventType = function()
{
	return oFF.UiEvent.ON_LOAD_FINISHED;
};
oFF.UiServerEvOnLoadFinished.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var newEvent = this.createControlEventWithParams(uiContext, uiAppContainer, operation);
	var tsControl = uiContext;
	tsControl.onLoadFinished(newEvent);
	return uiAppContainer;
};

oFF.UiServerEvOnMenuPress = function() {};
oFF.UiServerEvOnMenuPress.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnMenuPress.prototype._ff_c = "UiServerEvOnMenuPress";

oFF.UiServerEvOnMenuPress.prototype.getEventType = function()
{
	return oFF.UiEvent.ON_MENU_PRESS;
};
oFF.UiServerEvOnMenuPress.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var newEvent = this.createControlEventWithParams(uiContext, uiAppContainer, operation);
	var tsControl = uiContext;
	tsControl.onMenuPress(newEvent);
	return uiAppContainer;
};

oFF.UiServerEvOnMove = function() {};
oFF.UiServerEvOnMove.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnMove.prototype._ff_c = "UiServerEvOnMove";

oFF.UiServerEvOnMove.prototype.getEventType = function()
{
	return oFF.UiEvent.ON_MOVE;
};
oFF.UiServerEvOnMove.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var newEvent = this.createMoveEvent(uiContext, uiAppContainer, operation);
	var tsControl = uiContext;
	tsControl.onMove(newEvent);
	return uiAppContainer;
};

oFF.UiServerEvOnMoveEnd = function() {};
oFF.UiServerEvOnMoveEnd.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnMoveEnd.prototype._ff_c = "UiServerEvOnMoveEnd";

oFF.UiServerEvOnMoveEnd.prototype.getEventType = function()
{
	return oFF.UiEvent.ON_MOVE_END;
};
oFF.UiServerEvOnMoveEnd.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var newEvent = this.createMoveEvent(uiContext, uiAppContainer, operation);
	var tsControl = uiContext;
	tsControl.onMoveEnd(newEvent);
	return uiAppContainer;
};

oFF.UiServerEvOnMoveStart = function() {};
oFF.UiServerEvOnMoveStart.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnMoveStart.prototype._ff_c = "UiServerEvOnMoveStart";

oFF.UiServerEvOnMoveStart.prototype.getEventType = function()
{
	return oFF.UiEvent.ON_MOVE_START;
};
oFF.UiServerEvOnMoveStart.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var newEvent = this.createMoveEvent(uiContext, uiAppContainer, operation);
	var tsControl = uiContext;
	tsControl.onMoveStart(newEvent);
	return uiAppContainer;
};

oFF.UiServerEvOnOpen = function() {};
oFF.UiServerEvOnOpen.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnOpen.prototype._ff_c = "UiServerEvOnOpen";

oFF.UiServerEvOnOpen.prototype.getEventType = function()
{
	return oFF.UiEvent.ON_OPEN;
};
oFF.UiServerEvOnOpen.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var newEvent = this.createControlEventWithParams(uiContext, uiAppContainer, operation);
	var tsControl = uiContext;
	tsControl.onOpen(newEvent);
	return uiAppContainer;
};

oFF.UiServerEvOnPaste = function() {};
oFF.UiServerEvOnPaste.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnPaste.prototype._ff_c = "UiServerEvOnPaste";

oFF.UiServerEvOnPaste.prototype.getEventType = function()
{
	return oFF.UiEvent.ON_PASTE;
};
oFF.UiServerEvOnPaste.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var newEvent = this.createControlEventWithParams(uiContext, uiAppContainer, operation);
	var tsControl = uiContext;
	tsControl.onPaste(newEvent);
	return uiAppContainer;
};

oFF.UiServerEvOnPress = function() {};
oFF.UiServerEvOnPress.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnPress.prototype._ff_c = "UiServerEvOnPress";

oFF.UiServerEvOnPress.prototype.getEventType = function()
{
	return oFF.UiEvent.ON_PRESS;
};
oFF.UiServerEvOnPress.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var newEvent = this.createControlEventWithParams(uiContext, uiAppContainer, operation);
	var tsControl = uiContext;
	tsControl.onPress(newEvent);
	return uiAppContainer;
};

oFF.UiServerEvOnReadLineFinished = function() {};
oFF.UiServerEvOnReadLineFinished.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnReadLineFinished.prototype._ff_c = "UiServerEvOnReadLineFinished";

oFF.UiServerEvOnReadLineFinished.prototype.getEventType = function()
{
	return oFF.UiEvent.ON_READ_LINE_FINISHED;
};
oFF.UiServerEvOnReadLineFinished.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var newEvent = this.createControlEventWithParams(uiContext, uiAppContainer, operation);
	var tsControl = uiContext;
	tsControl.onReadLineFinished(newEvent);
	return uiAppContainer;
};

oFF.UiServerEvOnReadOnlyPropertySync = function() {};
oFF.UiServerEvOnReadOnlyPropertySync.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnReadOnlyPropertySync.prototype._ff_c = "UiServerEvOnReadOnlyPropertySync";

oFF.UiServerEvOnReadOnlyPropertySync.prototype.getName = function()
{
	return oFF.UiRemoteProtocol.EV_ON_READ_ONLY_PROPERTY_SYNC;
};
oFF.UiServerEvOnReadOnlyPropertySync.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var propOffset = oFF.SphereServer.PARAM_OFFSET;
	var valueOffset = oFF.SphereServer.PARAM_OFFSET + 1;
	var propName = operation.getStringAt(propOffset);
	var prop = oFF.UiProperty.lookup(propName);
	if (oFF.notNull(uiContext) && oFF.notNull(prop))
	{
		var tmpVal = null;
		if (operation.get(valueOffset) !== null)
		{
			var valType = operation.getElementTypeAt(valueOffset);
			if (valType === oFF.PrElementType.INTEGER)
			{
				tmpVal = oFF.XIntegerValue.create(operation.getIntegerAt(valueOffset));
			}
			else if (valType === oFF.PrElementType.BOOLEAN)
			{
				tmpVal = oFF.XBooleanValue.create(operation.getBooleanAt(valueOffset));
			}
			else if (valType === oFF.PrElementType.DOUBLE)
			{
				tmpVal = oFF.XDoubleValue.create(operation.getDoubleAt(valueOffset));
			}
			else if (valType === oFF.PrElementType.LONG)
			{
				tmpVal = oFF.XLongValue.create(operation.getLongAt(valueOffset));
			}
			else if (valType === oFF.PrElementType.STRING)
			{
				tmpVal = oFF.XStringValue.create(operation.getStringAt(valueOffset));
			}
		}
		uiContext.updatePropertyValue(prop, tmpVal);
	}
	return uiAppContainer;
};

oFF.UiServerEvOnRefresh = function() {};
oFF.UiServerEvOnRefresh.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnRefresh.prototype._ff_c = "UiServerEvOnRefresh";

oFF.UiServerEvOnRefresh.prototype.getEventType = function()
{
	return oFF.UiEvent.ON_REFRESH;
};
oFF.UiServerEvOnRefresh.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var newEvent = this.createControlEventWithParams(uiContext, uiAppContainer, operation);
	var tsControl = uiContext;
	tsControl.onRefresh(newEvent);
	return uiAppContainer;
};

oFF.UiServerEvOnResize = function() {};
oFF.UiServerEvOnResize.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnResize.prototype._ff_c = "UiServerEvOnResize";

oFF.UiServerEvOnResize.prototype.getEventType = function()
{
	return oFF.UiEvent.ON_RESIZE;
};
oFF.UiServerEvOnResize.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var newEvent = this.createResizeEvent(uiContext, uiAppContainer, operation);
	var tsControl = uiContext;
	tsControl.onResize(newEvent);
	return uiAppContainer;
};

oFF.UiServerEvOnRowResize = function() {};
oFF.UiServerEvOnRowResize.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnRowResize.prototype._ff_c = "UiServerEvOnRowResize";

oFF.UiServerEvOnRowResize.prototype.getEventType = function()
{
	return oFF.UiEvent.ON_ROW_RESIZE;
};
oFF.UiServerEvOnRowResize.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var newEvent = this.createControlEventWithParams(uiContext, uiAppContainer, operation);
	var tsControl = uiContext;
	tsControl.onRowResize(newEvent);
	return uiAppContainer;
};

oFF.UiServerEvOnScroll = function() {};
oFF.UiServerEvOnScroll.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnScroll.prototype._ff_c = "UiServerEvOnScroll";

oFF.UiServerEvOnScroll.prototype.getEventType = function()
{
	return oFF.UiEvent.ON_SCROLL;
};
oFF.UiServerEvOnScroll.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var newEvent = this.createControlEventWithParams(uiContext, uiAppContainer, operation);
	var tsControl = uiContext;
	tsControl.onScroll(newEvent);
	return uiAppContainer;
};

oFF.UiServerEvOnScrollLoad = function() {};
oFF.UiServerEvOnScrollLoad.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnScrollLoad.prototype._ff_c = "UiServerEvOnScrollLoad";

oFF.UiServerEvOnScrollLoad.prototype.getEventType = function()
{
	return oFF.UiEvent.ON_SCROLL_LOAD;
};
oFF.UiServerEvOnScrollLoad.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var newEvent = this.createControlEventWithParams(uiContext, uiAppContainer, operation);
	var tsControl = uiContext;
	tsControl.onScrollLoad(newEvent);
	return uiAppContainer;
};

oFF.UiServerEvOnSearch = function() {};
oFF.UiServerEvOnSearch.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnSearch.prototype._ff_c = "UiServerEvOnSearch";

oFF.UiServerEvOnSearch.prototype.getEventType = function()
{
	return oFF.UiEvent.ON_SEARCH;
};
oFF.UiServerEvOnSearch.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var newEvent = this.createControlEventWithParams(uiContext, uiAppContainer, operation);
	var tsControl = uiContext;
	tsControl.onSearch(newEvent);
	return uiAppContainer;
};

oFF.UiServerEvOnSelect = function() {};
oFF.UiServerEvOnSelect.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnSelect.prototype._ff_c = "UiServerEvOnSelect";

oFF.UiServerEvOnSelect.prototype.getEventType = function()
{
	return oFF.UiEvent.ON_SELECT;
};
oFF.UiServerEvOnSelect.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var newEvent = this.createSelectionEvent(uiContext, uiAppContainer, operation);
	var tsControl = uiContext;
	tsControl.onSelect(newEvent);
	return uiAppContainer;
};

oFF.UiServerEvOnSelectionChange = function() {};
oFF.UiServerEvOnSelectionChange.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnSelectionChange.prototype._ff_c = "UiServerEvOnSelectionChange";

oFF.UiServerEvOnSelectionChange.prototype.getEventType = function()
{
	return oFF.UiEvent.ON_SELECTION_CHANGE;
};
oFF.UiServerEvOnSelectionChange.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var newEvent = this.createSelectionEvent(uiContext, uiAppContainer, operation);
	var tsControl = uiContext;
	tsControl.onSelectionChange(newEvent);
	return uiAppContainer;
};

oFF.UiServerEvOnSelectionFinish = function() {};
oFF.UiServerEvOnSelectionFinish.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnSelectionFinish.prototype._ff_c = "UiServerEvOnSelectionFinish";

oFF.UiServerEvOnSelectionFinish.prototype.getEventType = function()
{
	return oFF.UiEvent.ON_SELECTION_FINISH;
};
oFF.UiServerEvOnSelectionFinish.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var newEvent = this.createSelectionEvent(uiContext, uiAppContainer, operation);
	var tsControl = uiContext;
	tsControl.onSelectionFinish(newEvent);
	return uiAppContainer;
};

oFF.UiServerEvOnSitAndWait = function() {};
oFF.UiServerEvOnSitAndWait.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnSitAndWait.prototype._ff_c = "UiServerEvOnSitAndWait";

oFF.UiServerEvOnSitAndWait.prototype.getName = function()
{
	return oFF.UiRemoteProtocol.EV_ON_SIT_AND_WAIT;
};
oFF.UiServerEvOnSitAndWait.prototype.isControlContext = function()
{
	return false;
};
oFF.UiServerEvOnSitAndWait.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	return uiAppContainer;
};

oFF.UiServerEvOnSuggestionSelect = function() {};
oFF.UiServerEvOnSuggestionSelect.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnSuggestionSelect.prototype._ff_c = "UiServerEvOnSuggestionSelect";

oFF.UiServerEvOnSuggestionSelect.prototype.getEventType = function()
{
	return oFF.UiEvent.ON_SUGGESTION_SELECT;
};
oFF.UiServerEvOnSuggestionSelect.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var newEvent = this.createSelectionEvent(uiContext, uiAppContainer, operation);
	var tsControl = uiContext;
	tsControl.onSuggestionSelect(newEvent);
	return uiAppContainer;
};

oFF.UiServerEvOnTableDragAndDrop = function() {};
oFF.UiServerEvOnTableDragAndDrop.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnTableDragAndDrop.prototype._ff_c = "UiServerEvOnTableDragAndDrop";

oFF.UiServerEvOnTableDragAndDrop.prototype.getEventType = function()
{
	return oFF.UiEvent.ON_TABLE_DRAG_AND_DROP;
};
oFF.UiServerEvOnTableDragAndDrop.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var newEvent = this.createControlEventWithParams(uiContext, uiAppContainer, operation);
	var tsControl = uiContext;
	tsControl.onTableDragAndDrop(newEvent);
	return uiAppContainer;
};

oFF.UiServerEvOnTerminate = function() {};
oFF.UiServerEvOnTerminate.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnTerminate.prototype._ff_c = "UiServerEvOnTerminate";

oFF.UiServerEvOnTerminate.prototype.getEventType = function()
{
	return oFF.UiEvent.ON_TERMINATE;
};
oFF.UiServerEvOnTerminate.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var newEvent = this.createControlEventWithParams(uiContext, uiAppContainer, operation);
	var tsControl = uiContext;
	tsControl.onTerminate(newEvent);
	return uiAppContainer;
};

oFF.UiServerEvOnTransferEnd = function() {};
oFF.UiServerEvOnTransferEnd.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnTransferEnd.prototype._ff_c = "UiServerEvOnTransferEnd";

oFF.UiServerEvOnTransferEnd.prototype.getName = function()
{
	return oFF.UiRemoteProtocol.EV_ON_TRANSFER_END;
};
oFF.UiServerEvOnTransferEnd.prototype.isControlContext = function()
{
	return false;
};
oFF.UiServerEvOnTransferEnd.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	if (oFF.notNull(uiAppContainer))
	{
		var uiManager = uiAppContainer.getUiManager();
		if (oFF.notNull(uiManager))
		{
			uiManager.endValueTransfer();
		}
	}
	return uiAppContainer;
};

oFF.UiServerEvOnTransferStart = function() {};
oFF.UiServerEvOnTransferStart.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnTransferStart.prototype._ff_c = "UiServerEvOnTransferStart";

oFF.UiServerEvOnTransferStart.prototype.getName = function()
{
	return oFF.UiRemoteProtocol.EV_ON_TRANSFER_START;
};
oFF.UiServerEvOnTransferStart.prototype.isControlContext = function()
{
	return false;
};
oFF.UiServerEvOnTransferStart.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	if (oFF.notNull(uiAppContainer))
	{
		var uiManager = uiAppContainer.getUiManager();
		if (oFF.notNull(uiManager))
		{
			uiManager.startValueTransfer();
		}
	}
	return uiAppContainer;
};

oFF.UiServerEvOnValueHelpRequest = function() {};
oFF.UiServerEvOnValueHelpRequest.prototype = new oFF.UiServerEvent();
oFF.UiServerEvOnValueHelpRequest.prototype._ff_c = "UiServerEvOnValueHelpRequest";

oFF.UiServerEvOnValueHelpRequest.prototype.getEventType = function()
{
	return oFF.UiEvent.ON_VALUE_HELP_REQUEST;
};
oFF.UiServerEvOnValueHelpRequest.prototype.executeOperation = function(server, instanceId, uiAppContainer, uiContext, operation)
{
	var newEvent = this.createControlEventWithParams(uiContext, uiAppContainer, operation);
	var tsControl = uiContext;
	tsControl.onValueHelpRequest(newEvent);
	return uiAppContainer;
};

oFF.SphereServer = function() {};
oFF.SphereServer.prototype = new oFF.XObjectExt();
oFF.SphereServer.prototype._ff_c = "SphereServer";

oFF.SphereServer.PARAM_OFFSET = 3;
oFF.SphereServer.CUSTOM_PARAM_OFFSET = 4;
oFF.SphereServer.DEFAULT_SYNC_TIMER = 1000;
oFF.SphereServer.FRAGMENT_PROCESSING_TIMEOUT = 50;
oFF.SphereServer.staticSetup = function() {};
oFF.SphereServer.createServer = function(process)
{
	var newObj = new oFF.SphereServer();
	newObj.setupServer(process);
	return newObj;
};
oFF.SphereServer.prototype.DEBUGGING = false;
oFF.SphereServer.prototype.TRACING = false;
oFF.SphereServer.prototype.m_application = null;
oFF.SphereServer.prototype.m_appContainerSet = null;
oFF.SphereServer.prototype.m_startTime = null;
oFF.SphereServer.prototype.initServerContainer = function(environment)
{
	oFF.UiRemoteModule.getInstance();
	var kernel = oFF.Kernel.create(environment);
	var process = kernel.getKernelProcessBase();
	process.newWorkingTaskManager(oFF.WorkingTaskManagerType.SINGLE_THREADED);
	this.setupServer(process);
};
oFF.SphereServer.prototype.setupServer = function(process)
{
	this.m_application = oFF.ApplicationFactory.createApplication(process);
	var theSession = this.m_application.getSession();
	theSession.setDefaultSyncType(oFF.SyncType.NON_BLOCKING);
	this.m_appContainerSet = oFF.XSetOfNameObject.create();
	this.DEBUGGING = theSession.getEnvironment().getBooleanByKeyExt(oFF.XEnvironmentConstants.FIREFLY_SPHERE_DEBUGGING, false);
	this.TRACING = theSession.getEnvironment().getBooleanByKeyExt(oFF.XEnvironmentConstants.FIREFLY_SPHERE_TRACE, false);
	this.m_startTime = oFF.XDateTime.create();
};
oFF.SphereServer.prototype.getLogSeverity = function()
{
	return oFF.XObjectExt.prototype.getLogSeverity.call( this );
};
oFF.SphereServer.prototype.releaseObject = function()
{
	this.m_appContainerSet = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_appContainerSet);
	this.m_application = oFF.XObjectExt.release(this.m_application);
	oFF.XObjectExt.prototype.releaseObject.call( this );
};
oFF.SphereServer.prototype.onHttpRequest = function(serverRequestResponse)
{
	var clientRequest = serverRequestResponse.getClientHttpRequest();
	var remoteAction = null;
	var instanceId = null;
	try
	{
		var uri = clientRequest.getUri();
		var queryMap = uri.getQueryMap();
		remoteAction = oFF.UiRemoteAction.lookup(queryMap.getByKey(oFF.UiRemoteProtocol.ACTION));
		instanceId = queryMap.getByKey(oFF.UiRemoteProtocol.INSTANCE_ID);
		var jsonContent = clientRequest.getJsonContent();
		var uiAppContainer = this.m_appContainerSet.getByKey(instanceId);
		var serverResponse = oFF.HttpResponse.createResponse(clientRequest);
		var serverJsonResponse = oFF.PrFactory.createStructure();
		serverResponse.setJsonObject(serverJsonResponse);
		if (remoteAction === oFF.UiRemoteAction.GET_SERVER_INFO)
		{
			this.handleGetServerInfoAction(serverResponse, serverJsonResponse);
		}
		else if (remoteAction === oFF.UiRemoteAction.INITIALIZE)
		{
			this.handleInitializeAction(jsonContent, serverResponse, serverJsonResponse);
		}
		else if (remoteAction === oFF.UiRemoteAction.SYNC)
		{
			this.handleSyncAction(uiAppContainer, jsonContent, serverResponse, serverJsonResponse);
		}
		else if (remoteAction === oFF.UiRemoteAction.EVENT)
		{
			this.handleEventAction(uiAppContainer, jsonContent, serverResponse, serverJsonResponse);
		}
		else if (remoteAction === oFF.UiRemoteAction.TERMINATE)
		{
			this.handleTerminateAction(instanceId, serverResponse, serverJsonResponse);
		}
		else
		{
			serverResponse.setStatusCode(oFF.HttpStatusCode.SC_NOT_ACCEPTABLE);
			serverResponse.setStatusCodeDetails("Unknown action");
		}
		serverRequestResponse.setResponse(serverResponse);
	}
	catch (e)
	{
		if (remoteAction === oFF.UiRemoteAction.INITIALIZE)
		{
			this.terminateProgram(instanceId);
		}
		this.logExt(oFF.OriginLayer.SERVER, oFF.Severity.ERROR, 0, oFF.XException.getStackTrace(e, 0));
		var errorJsonResponse = oFF.PrFactory.createStructure();
		errorJsonResponse.putString(oFF.UiRemoteProtocol.INSTANCE_ID, instanceId);
		errorJsonResponse.putString(oFF.UiRemoteProtocol.STATUS, oFF.UiRemoteServerStatus.ERROR.getName());
		errorJsonResponse.putString(oFF.UiRemoteProtocol.ERROR_MESSAGE, oFF.XException.getMessage(e));
		var errorResponse = oFF.HttpResponse.createResponse(clientRequest);
		errorResponse.setStatusCode(oFF.HttpStatusCode.SC_INTERNAL_SERVER_ERROR);
		errorResponse.setStatusCodeDetails("An error occured during remote program execution!");
		errorResponse.setJsonObject(errorJsonResponse);
		serverRequestResponse.setResponse(errorResponse);
	}
};
oFF.SphereServer.prototype.getApplication = function()
{
	return this.m_application;
};
oFF.SphereServer.prototype.getSession = function()
{
	return this.m_application.getSession();
};
oFF.SphereServer.prototype.getProcess = function()
{
	return this.m_application.getProcess();
};
oFF.SphereServer.prototype.getLogWriter = function()
{
	return this.getSession().getLogWriter();
};
oFF.SphereServer.prototype.terminateProgram = function(instanceId)
{
	var uiPrgContainer = this.m_appContainerSet.getByKey(instanceId);
	if (oFF.notNull(uiPrgContainer))
	{
		this.m_appContainerSet.removeElement(uiPrgContainer);
		uiPrgContainer.terminateServerPrg();
		uiPrgContainer.releaseObject();
	}
};
oFF.SphereServer.prototype.getProgramContainer = function(name)
{
	return this.m_appContainerSet.getByKey(name);
};
oFF.SphereServer.prototype.handleGetServerInfoAction = function(serverResponse, serverJsonResponse)
{
	serverJsonResponse.putString(oFF.UiRemoteProtocol.PROTOCOL_VERSION, oFF.UiRemoteProtocol.REMOTE_UI_VERSION);
	serverJsonResponse.putLong(oFF.UiRemoteProtocol.START_TIME, this.m_startTime.getTimeInMilliseconds());
	var programsList = serverJsonResponse.putNewList(oFF.UiRemoteProtocol.PROGRAMS);
	oFF.XStream.of(oFF.ProgramRegistration.getOrderedAllEntries()).forEach( function(prgManifest){
		var tmpPrgStruct = programsList.addNewStructure();
		tmpPrgStruct.putString(oFF.UiRemoteProtocol.PROGRAM_NAME, prgManifest.getProgramName());
		tmpPrgStruct.putString(oFF.UiRemoteProtocol.PROGRAM_DESCRIPTION, prgManifest.getDescription());
		tmpPrgStruct.putString(oFF.UiRemoteProtocol.PROGRAM_CONTAINER_TYPE, prgManifest.getOutputContainerType().getName());
	}.bind(this));
	var runningContainersList = serverJsonResponse.putNewList(oFF.UiRemoteProtocol.RUNNING_CONTAINERS);
	var prgContainersKeyIterator = this.m_appContainerSet.getKeysAsIteratorOfString();
	while (prgContainersKeyIterator.hasNext())
	{
		var containerKey = prgContainersKeyIterator.next();
		var tmpContainer = this.m_appContainerSet.getByKey(containerKey);
		runningContainersList.add(tmpContainer.getContainerInfo());
	}
	serverJsonResponse.putString(oFF.UiRemoteProtocol.STATUS, oFF.UiRemoteServerStatus.EXECUTED.getName());
	serverResponse.setStatusCode(oFF.HttpStatusCode.SC_OK);
	serverResponse.setStatusCodeDetails("Server info success");
};
oFF.SphereServer.prototype.handleInitializeAction = function(jsonContent, serverResponse, serverJsonResponse)
{
	if (oFF.notNull(jsonContent))
	{
		var initData = jsonContent.getStructureByKey(oFF.UiRemoteProtocol.INIT_DATA);
		if (oFF.notNull(initData))
		{
			var newAppContainer = this.initializeProgramContainer(initData);
			if (oFF.notNull(newAppContainer))
			{
				this.prepareSuccessResponse(newAppContainer, oFF.UiRemoteServerStatus.INITIALIZED.getName(), jsonContent, serverResponse, serverJsonResponse);
				var processedFragment = newAppContainer.processFragmentCfgs();
				if (processedFragment)
				{
					this.scheduleClientServerSync(serverJsonResponse, oFF.SphereServer.FRAGMENT_PROCESSING_TIMEOUT, oFF.UiRemoteSyncReason.FRAGMENT_PROCESSING);
				}
			}
			else
			{
				serverResponse.setStatusCode(oFF.HttpStatusCode.SC_INTERNAL_SERVER_ERROR);
				serverResponse.setStatusCodeDetails("Failed to initialize remote program!");
			}
		}
		else
		{
			serverResponse.setStatusCode(oFF.HttpStatusCode.SC_INTERNAL_SERVER_ERROR);
			serverResponse.setStatusCodeDetails("Missing init data! Cannot initialize program!");
		}
	}
	else
	{
		serverResponse.setStatusCode(oFF.HttpStatusCode.SC_INTERNAL_SERVER_ERROR);
		serverResponse.setStatusCodeDetails("Request is empty!");
	}
};
oFF.SphereServer.prototype.handleSyncAction = function(uiAppContainer, jsonContent, serverResponse, serverJsonResponse)
{
	var isValid = this.validateSyncEventAction(uiAppContainer, jsonContent, serverResponse, serverJsonResponse);
	if (isValid)
	{
		this.doIntegrityCheck(uiAppContainer, jsonContent);
		this.processEvents(uiAppContainer, jsonContent);
		this.prepareSuccessResponse(uiAppContainer, oFF.UiRemoteServerStatus.SYNCED.getName(), jsonContent, serverResponse, serverJsonResponse);
	}
};
oFF.SphereServer.prototype.handleEventAction = function(uiAppContainer, jsonContent, serverResponse, serverJsonResponse)
{
	var isValid = this.validateSyncEventAction(uiAppContainer, jsonContent, serverResponse, serverJsonResponse);
	if (isValid)
	{
		this.doIntegrityCheck(uiAppContainer, jsonContent);
		this.processEvents(uiAppContainer, jsonContent);
		this.prepareSuccessResponse(uiAppContainer, oFF.UiRemoteServerStatus.EVENTS_PROCESSED.getName(), jsonContent, serverResponse, serverJsonResponse);
	}
};
oFF.SphereServer.prototype.handleTerminateAction = function(instanceId, serverResponse, serverJsonResponse)
{
	this.terminateProgram(instanceId);
	serverResponse.setStatusCode(oFF.HttpStatusCode.SC_OK);
	serverResponse.setStatusCodeDetails("Program successfully terminated!");
	serverJsonResponse.putString(oFF.UiRemoteProtocol.STATUS, oFF.UiRemoteServerStatus.TERMINATED.getName());
};
oFF.SphereServer.prototype.initializeProgramContainer = function(initData)
{
	var uiAppContainer = null;
	if (oFF.notNull(initData))
	{
		var process = this.getProcess();
		var env = process.getEnvironment();
		var sdk = env.getVariable(oFF.XEnvironmentConstants.FIREFLY_SDK);
		var sdkFile = oFF.XFile.create(process, sdk);
		var serverBase = sdkFile.getUri();
		uiAppContainer = oFF.UiServerPrgContainer.createAndRun(initData, serverBase, this.TRACING);
		if (oFF.notNull(uiAppContainer))
		{
			this.m_appContainerSet.add(uiAppContainer);
		}
	}
	return uiAppContainer;
};
oFF.SphereServer.prototype.prepareSuccessResponse = function(uiAppContainer, status, jsonContent, serverResponse, serverJsonResponse)
{
	uiAppContainer.updateLastActivity();
	var uiManager = uiAppContainer.getContainerServerUiMgr();
	serverJsonResponse.putString(oFF.UiRemoteProtocol.INSTANCE_ID, uiAppContainer.getIntanceId());
	serverJsonResponse.put(oFF.UiRemoteProtocol.OPERATIONS, uiAppContainer.getPendingUiOperations());
	serverJsonResponse.putString(oFF.UiRemoteProtocol.STATUS, status);
	this.scheduleNextSyncTimerIfNeeded(serverJsonResponse);
	var newFragment = uiManager.getFragment();
	serverJsonResponse.putString(oFF.UiRemoteProtocol.FRAGMENT, newFragment);
	var integrityCheck = serverJsonResponse.putNewStructure(oFF.UiRemoteProtocol.INTEGRITY_CHECK);
	integrityCheck.putInteger(oFF.UiRemoteProtocol.TOTAL_CONTROLS, uiManager.getSelectableElementCount());
	integrityCheck.putString(oFF.UiRemoteProtocol.PROTOCOL_VERSION, oFF.UiRemoteProtocol.REMOTE_UI_VERSION);
	uiAppContainer.trace(jsonContent, serverJsonResponse);
	serverResponse.setStatusCode(oFF.HttpStatusCode.SC_OK);
	serverResponse.setStatusCodeDetails("OK");
};
oFF.SphereServer.prototype.validateSyncEventAction = function(uiAppContainer, jsonContent, serverResponse, serverJsonResponse)
{
	if (oFF.notNull(jsonContent))
	{
		if (oFF.notNull(uiAppContainer))
		{
			return true;
		}
		else
		{
			serverResponse.setStatusCode(oFF.HttpStatusCode.SC_INTERNAL_SERVER_ERROR);
			serverResponse.setStatusCodeDetails("Could not find remote program for the specified instanceId!");
		}
	}
	else
	{
		serverResponse.setStatusCode(oFF.HttpStatusCode.SC_INTERNAL_SERVER_ERROR);
		serverResponse.setStatusCodeDetails("Request is empty!");
	}
	return false;
};
oFF.SphereServer.prototype.doIntegrityCheck = function(uiAppContainer, jsonContent)
{
	if (this.DEBUGGING)
	{
		var integrityCheck = jsonContent.getStructureByKey(oFF.UiRemoteProtocol.INTEGRITY_CHECK);
		var clientControlCount = integrityCheck.getIntegerByKey(oFF.UiRemoteProtocol.TOTAL_CONTROLS);
		var serverUiMgr = uiAppContainer.getContainerServerUiMgr();
		if (oFF.notNull(serverUiMgr))
		{
			var serverControlCount = serverUiMgr.getSelectableElementCount();
			if (clientControlCount !== serverControlCount)
			{
				var buffer = oFF.XStringBuffer.create();
				buffer.append("Server/Client control count different: ");
				buffer.appendInt(serverControlCount);
				buffer.append(" != ");
				buffer.appendInt(clientControlCount);
				this.log(buffer.toString());
			}
		}
	}
};
oFF.SphereServer.prototype.processEvents = function(uiAppContainer, jsonContent)
{
	var events = jsonContent.getListByKey(oFF.UiRemoteProtocol.EVENTS);
	for (var k = 0; k < events.size(); k++)
	{
		var eventDesc2 = events.getListAt(k);
		var eventName2 = eventDesc2.getStringAt(0);
		var theEvent = oFF.UiServerEvent.lookup(eventName2);
		var context = null;
		if (theEvent.isControlContext())
		{
			var contextId = eventDesc2.getStringAt(1);
			var uiManager = uiAppContainer.getUiManager();
			context = uiManager.selectById(contextId);
		}
		theEvent.executeOperation(this, uiAppContainer.getIntanceId(), uiAppContainer, context, eventDesc2);
	}
};
oFF.SphereServer.prototype.scheduleNextSyncTimerIfNeeded = function(jsonResponse)
{
	var dispatcher = oFF.Dispatcher.getInstance();
	var stillRunningTasks = dispatcher.getProcessingTimeReceiverCount();
	var activeTimeoutCount = oFF.XTimeoutManager.getManager().getActiveTimeoutCount();
	var nextTimeout = oFF.XTimeoutManager.getManager().getTimeLeftUntilNextExecution();
	var nextSyncTimer = 0;
	if (stillRunningTasks > 0)
	{
		nextSyncTimer = oFF.SphereServer.DEFAULT_SYNC_TIMER;
	}
	if (activeTimeoutCount > 0 && nextTimeout > 0)
	{
		if (nextSyncTimer > 0)
		{
			nextSyncTimer = oFF.XMath.min(nextTimeout, nextSyncTimer);
		}
		else
		{
			nextSyncTimer = nextTimeout;
		}
	}
	if (nextSyncTimer > 0)
	{
		this.scheduleClientServerSync(jsonResponse, nextSyncTimer, oFF.UiRemoteSyncReason.ACTIVE_TIMEOUTS);
		jsonResponse.putInteger(oFF.UiRemoteProtocol.STILL_RUNNING_TASKS, stillRunningTasks);
		jsonResponse.putInteger(oFF.UiRemoteProtocol.ACTIVE_TIMEOUTS, activeTimeoutCount);
	}
};
oFF.SphereServer.prototype.scheduleClientServerSync = function(jsonResponse, time, reason)
{
	var reasonStr = oFF.UiRemoteSyncReason.BASIC_SYNC.getName();
	if (oFF.notNull(reason))
	{
		reasonStr = reason.getName();
	}
	if (time > 0)
	{
		jsonResponse.putInteger(oFF.UiRemoteProtocol.NEXT_SYNC_TIMER, time);
	}
	jsonResponse.putString(oFF.UiRemoteProtocol.SYNC_TIMER_REASON, reasonStr);
};

oFF.UiServerPrgContainer = function() {};
oFF.UiServerPrgContainer.prototype = new oFF.DfNameObject();
oFF.UiServerPrgContainer.prototype._ff_c = "UiServerPrgContainer";

oFF.UiServerPrgContainer.createAndRun = function(initData, serverBase, isTracingEnabled)
{
	if (oFF.notNull(initData) && initData.isStructure())
	{
		var newObject = new oFF.UiServerPrgContainer();
		newObject.setupContainer(initData);
		newObject.m_isTracingEnabled = isTracingEnabled;
		var success = newObject.createAndRunContainerProgram(serverBase);
		if (success)
		{
			return newObject;
		}
	}
	return null;
};
oFF.UiServerPrgContainer.prototype.m_kernel = null;
oFF.UiServerPrgContainer.prototype.m_uiProgram = null;
oFF.UiServerPrgContainer.prototype.m_application = null;
oFF.UiServerPrgContainer.prototype.m_startTime = null;
oFF.UiServerPrgContainer.prototype.m_lastActivity = null;
oFF.UiServerPrgContainer.prototype.m_traceIndex = 0;
oFF.UiServerPrgContainer.prototype.m_traceName = null;
oFF.UiServerPrgContainer.prototype.m_isTracingEnabled = false;
oFF.UiServerPrgContainer.prototype.m_initData = null;
oFF.UiServerPrgContainer.prototype.m_prgCfgProgramName = null;
oFF.UiServerPrgContainer.prototype.m_prgCfgRemotePrgContainerType = null;
oFF.UiServerPrgContainer.prototype.m_canProcessFragment = false;
oFF.UiServerPrgContainer.prototype.m_fragmentCfgList = null;
oFF.UiServerPrgContainer.prototype.releaseObject = function()
{
	this.m_startTime = oFF.XObjectExt.release(this.m_startTime);
	this.m_uiProgram = oFF.XObjectExt.release(this.m_uiProgram);
	this.m_kernel = oFF.XObjectExt.release(this.m_kernel);
	this.m_application = oFF.XObjectExt.release(this.m_application);
	this.m_initData = null;
	oFF.DfNameObject.prototype.releaseObject.call( this );
};
oFF.UiServerPrgContainer.prototype.setupContainer = function(initData)
{
	this.m_initData = initData;
	var instanceId = this.m_initData.getStringByKeyExt(oFF.UiRemoteProtocol.INSTANCE_ID, oFF.XGuid.getGuid());
	var remoteLocation = this.m_initData.getStringByKey(oFF.UiRemoteProtocol.INIT_REMOTE_LOCATION);
	var programName = this.m_initData.getStringByKey(oFF.UiRemoteProtocol.INIT_PROGRAM_NAME);
	var programContainerTypeName = this.m_initData.getStringByKey(oFF.UiRemoteProtocol.PROGRAM_CONTAINER_TYPE);
	this._setupInternal(instanceId);
	var clientBase = null;
	if (oFF.notNull(remoteLocation))
	{
		clientBase = oFF.XUri.createFromUrl(remoteLocation);
		clientBase.setPath("/");
		clientBase.setQuery(null);
		clientBase.setFragment(null);
	}
	var remotePrgContainerType = oFF.ProgramContainerType.lookup(programContainerTypeName);
	this.m_prgCfgProgramName = programName;
	this.m_prgCfgRemotePrgContainerType = remotePrgContainerType;
	this.m_canProcessFragment = remotePrgContainerType === oFF.ProgramContainerType.STANDALONE;
};
oFF.UiServerPrgContainer.prototype.createAndRunContainerProgram = function(serverBase)
{
	this.m_startTime = oFF.XDateTime.create();
	this.m_lastActivity = oFF.XDateTime.create();
	var remoteLocation = this.m_initData.getStringByKey(oFF.UiRemoteProtocol.INIT_REMOTE_LOCATION);
	var prgEnv = oFF.XHashMapOfStringByString.create();
	prgEnv.put(oFF.XEnvironmentConstants.NETWORK_LOCATION, remoteLocation);
	this.m_kernel = oFF.Kernel.create(prgEnv);
	var kernelProcess = this.m_kernel.getKernelProcessBase();
	kernelProcess.newWorkingTaskManager(oFF.WorkingTaskManagerType.SINGLE_THREADED);
	kernelProcess.setDefaultSyncType(oFF.SyncType.NON_BLOCKING);
	var state = oFF.KernelPersistentState.create(this.m_kernel);
	this.m_kernel.registerOnEvent(state);
	this.m_kernel.registerOnEvent(this);
	if (this.m_canProcessFragment)
	{
		this.m_fragmentCfgList = state.getStartCfgsByUrl(remoteLocation);
	}
	this.m_uiProgram = this.newProgram(kernelProcess);
	if (oFF.notNull(this.m_uiProgram))
	{
		this.m_uiProgram.prepareArguments();
		this.m_uiProgram.initializeProgram();
		this.m_uiProgram.evalArguments();
		this.m_application = this.m_uiProgram.getApplication();
		var traceName = this.m_initData.getStringByKey(oFF.UiRemoteProtocol.INIT_TRACE_NAME);
		this.setTraceName(traceName);
		var uiServerManager = this.newServerUiManager(this.m_uiProgram, serverBase);
		this.m_application.setUiManager(uiServerManager);
		var genesis = oFF.UiGenesis.create(uiServerManager.getAnchor());
		this.m_uiProgram.renderUi(genesis);
		return true;
	}
	else
	{
		this.log2("Cannot find factory for application: ", this.m_prgCfgProgramName);
		return false;
	}
};
oFF.UiServerPrgContainer.prototype.newProgram = function(process)
{
	var program = null;
	var initArgsStructure = this.m_initData.getStructureByKey(oFF.UiRemoteProtocol.INIT_ARGS_STRUCTURE);
	var initArgsString = this.m_initData.getStringByKey(oFF.UiRemoteProtocol.INIT_ARGS_STRING);
	var factory = oFF.ProgramRegistration.getProgramFactory(this.m_prgCfgProgramName);
	if (oFF.notNull(factory))
	{
		program = factory.newProgram();
		var subSession = process.newSubSession();
		if (oFF.isNull(initArgsStructure))
		{
			initArgsStructure = oFF.PrFactory.createStructure();
			var programMetadata = factory.getProgramMetadata();
			initArgsStructure = oFF.ProgramUtils.createArgStructureFromString(programMetadata, initArgsString);
		}
		var args = oFF.ProgramArgs.createWithStructure(initArgsStructure);
		var startCfg = oFF.ProgramStartCfg.create(process, this.m_prgCfgProgramName, null, args);
		startCfg.setProgram(program);
		if (oFF.notNull(this.m_prgCfgRemotePrgContainerType))
		{
			startCfg.setEnforcedContainerType(this.m_prgCfgRemotePrgContainerType);
		}
		subSession.setStartConfiguration(startCfg);
		program.setProcess(subSession);
	}
	return program;
};
oFF.UiServerPrgContainer.prototype.newServerUiManager = function(uiProgram, serverBase)
{
	var remoteLocation = this.m_initData.getStringByKey(oFF.UiRemoteProtocol.INIT_REMOTE_LOCATION);
	var fragment = this.m_initData.getStringByKey(oFF.UiRemoteProtocol.FRAGMENT);
	var platformName = this.m_initData.getStringByKey(oFF.UiRemoteProtocol.INIT_PLATFORM);
	var devInfoStr = this.m_initData.getStringByKey(oFF.UiRemoteProtocol.INIT_DEVICE_INFO);
	var driverInfoStr = this.m_initData.getStringByKey(oFF.UiRemoteProtocol.INIT_DRIVER_INFO);
	var style = this.m_initData.getStringByKey(oFF.UiRemoteProtocol.STYLE_CLASS);
	var uiFrameworkConfig = this.m_initData.getStructureByKey(oFF.UiRemoteProtocol.INIT_UI_FRAMEWORK_CONFIG);
	var uiTypeDefs = this.m_initData.getStructureByKey(oFF.UiRemoteProtocol.INIT_UI_TYPE_DEFS);
	var clientBase = null;
	if (oFF.notNull(remoteLocation))
	{
		clientBase = oFF.XUri.createFromUrl(remoteLocation);
		clientBase.setPath("/");
		clientBase.setQuery(null);
		clientBase.setFragment(null);
	}
	var remotePlatform = oFF.XPlatform.lookupWithDefault(platformName, oFF.XPlatform.GENERIC);
	var uiServerManager = oFF.UiServerManager.create(uiProgram.getSession(), remotePlatform);
	uiServerManager.setResourceLocations(serverBase, clientBase);
	var process = uiProgram.getProcess();
	process.setEntity(oFF.ProcessEntity.GUI, uiServerManager);
	var kernel = process.getKernel();
	var subSystemContainer = kernel.getSubSystemContainer(oFF.SubSystemType.GUI);
	subSystemContainer.setSubSystem(uiServerManager);
	var selector = process.getSelector();
	selector.registerSelector(oFF.SigSelDomain.UI, uiServerManager.getSigSelProviderSelector());
	selector.registerSelector(oFF.SigSelDomain.DIALOG, uiServerManager.getSigSelProviderSelector());
	if (this.m_canProcessFragment)
	{
		uiServerManager.setFragment(fragment);
	}
	else
	{
		uiServerManager.setFragment("");
	}
	if (oFF.notNull(devInfoStr))
	{
		var devInfo = oFF.UiDeviceInfo.createByString(devInfoStr);
		uiServerManager.setDeviceInfo(devInfo);
	}
	if (oFF.notNull(driverInfoStr))
	{
		var driverInfo = oFF.UiDriverInfo.createByString(driverInfoStr);
		uiServerManager.setDriverInfo(driverInfo);
	}
	if (oFF.notNull(style))
	{
		var styleClass = oFF.UiStyleClass.lookup(style);
		if (oFF.notNull(styleClass))
		{
			uiServerManager.setDefaultStyleClass(styleClass);
		}
	}
	if (oFF.notNull(uiFrameworkConfig))
	{
		uiServerManager.setTheme(uiFrameworkConfig.getStringByKeyExt(oFF.UiRemoteProtocol.CLIENT_THEME, ""), null);
		uiServerManager.setRtl(uiFrameworkConfig.getBooleanByKeyExt(oFF.UiRemoteProtocol.CLIENT_RTL, false));
	}
	if (oFF.notNull(uiTypeDefs))
	{
		var iterator = uiTypeDefs.getKeysAsReadOnlyListOfString().getIterator();
		while (iterator.hasNext())
		{
			var uiType = iterator.next();
			var currentUiTypeDef = uiTypeDefs.getStructureByKey(uiType);
			var flagList = currentUiTypeDef.getListByKey(oFF.UiRemoteProtocol.CAPABILITY_FLAGS);
			if (oFF.notNull(flagList))
			{
				for (var i = 0; i < flagList.size(); i++)
				{
					var flag = flagList.getStringAt(i);
					uiServerManager.setUiTypeCapabilityFlag(uiType, flag);
				}
			}
		}
	}
	return uiServerManager;
};
oFF.UiServerPrgContainer.prototype.processFragmentCfgs = function()
{
	if (this.m_canProcessFragment && oFF.notNull(this.m_fragmentCfgList) && this.m_fragmentCfgList.hasElements())
	{
		for (var k = 0; k < this.m_fragmentCfgList.size(); k++)
		{
			var startCfg = this.m_fragmentCfgList.get(k);
			startCfg.setParentProcess(this.m_uiProgram.getProcess());
			startCfg.setIsNewConsoleNeeded(true);
			startCfg.setIsCreatingChildProcess(true);
			this.m_kernel.startPrg(startCfg, oFF.SyncType.NON_BLOCKING, null);
		}
		this.m_fragmentCfgList = null;
		return true;
	}
	return false;
};
oFF.UiServerPrgContainer.prototype.terminateServerPrg = function()
{
	if (oFF.notNull(this.m_kernel))
	{
		this.m_kernel.unregisterOnEvent(this);
	}
};
oFF.UiServerPrgContainer.prototype.updateLastActivity = function()
{
	this.m_lastActivity = oFF.XDateTime.create();
};
oFF.UiServerPrgContainer.prototype.getIntanceId = function()
{
	return this.getName();
};
oFF.UiServerPrgContainer.prototype.getContainerInfo = function()
{
	var containerInfoStruct = oFF.PrFactory.createStructure();
	containerInfoStruct.putString(oFF.UiRemoteProtocol.INSTANCE_ID, this.getIntanceId());
	containerInfoStruct.putString(oFF.UiRemoteProtocol.PROGRAM_NAME, this.m_prgCfgProgramName);
	containerInfoStruct.putString(oFF.UiRemoteProtocol.STYLE_CLASS, this.getContainerServerUiMgr().getDefaultStyleClass().getName());
	containerInfoStruct.putString(oFF.UiRemoteProtocol.FRAGMENT, this.getContainerServerUiMgr().getFragment());
	containerInfoStruct.putLong(oFF.UiRemoteProtocol.START_TIME, this.m_startTime.getTimeInMilliseconds());
	containerInfoStruct.putLong(oFF.UiRemoteProtocol.LAST_ACTIVITY, this.m_lastActivity.getTimeInMilliseconds());
	return containerInfoStruct;
};
oFF.UiServerPrgContainer.prototype.getContainerServerUiMgr = function()
{
	return this.getUiManager();
};
oFF.UiServerPrgContainer.prototype.getPendingUiOperations = function()
{
	return this.getContainerServerUiMgr().fetchCommandSequence();
};
oFF.UiServerPrgContainer.prototype.setTraceName = function(traceName)
{
	this.m_traceName = traceName;
};
oFF.UiServerPrgContainer.prototype.trace = function(request, response)
{
	if (this.m_isTracingEnabled)
	{
		var appTracePath = "${ff_tmp}/spheretraces";
		if (oFF.XStringUtils.isNotNullAndNotEmpty(this.m_traceName))
		{
			appTracePath = oFF.XStringUtils.concatenate3(appTracePath, oFF.XFile.SLASH, this.m_traceName);
		}
		var process = this.m_application.getProcess();
		var traceFolder = oFF.XFile.createWithVars(process, appTracePath);
		traceFolder.mkdirs();
		if (this.m_traceIndex === 0)
		{
			traceFolder.deleteChildren();
		}
		var requestPath = oFF.XStringUtils.concatenate4(appTracePath, oFF.XFile.SLASH, oFF.XInteger.convertToString(this.m_traceIndex), ".request.json");
		var responsePath = oFF.XStringUtils.concatenate4(appTracePath, oFF.XFile.SLASH, oFF.XInteger.convertToString(this.m_traceIndex), ".response.json");
		var uiTreePath = oFF.XStringUtils.concatenate4(appTracePath, oFF.XFile.SLASH, oFF.XInteger.convertToString(this.m_traceIndex), ".uitree.json");
		var requestFile = oFF.XFile.createWithVars(process, requestPath);
		var responseFile = oFF.XFile.createWithVars(process, responsePath);
		var uiTreeFile = oFF.XFile.createWithVars(process, uiTreePath);
		var requestContent = oFF.XByteArray.convertFromString(request.toString());
		requestFile.saveByteArray(requestContent);
		var responseContent = oFF.XByteArray.convertFromString(response.toString());
		responseFile.saveByteArray(responseContent);
		var uiTree = this.getContainerServerUiMgr().serializeUiTree();
		var uiTreeJsonString = uiTree.toString();
		var uiTreeContent = oFF.XByteArray.convertFromString(uiTreeJsonString);
		uiTreeFile.saveByteArray(uiTreeContent);
		this.m_traceIndex = this.m_traceIndex + 1;
	}
};
oFF.UiServerPrgContainer.prototype.getUiManager = function()
{
	return this.m_application.getUiManager();
};
oFF.UiServerPrgContainer.prototype.getGenesis = function()
{
	return this.getUiManager().getGenesis();
};
oFF.UiServerPrgContainer.prototype.getContext = function(identifier)
{
	var uiContext = this.getUiManager().selectById(identifier);
	if (oFF.isNull(uiContext))
	{
		this.log2("Cannot find context for ", identifier);
	}
	return uiContext;
};
oFF.UiServerPrgContainer.prototype.onProcessEvent = function(event, process, eventType)
{
	if (this.m_canProcessFragment)
	{
		this.getContainerServerUiMgr().setFragment(oFF.NetworkEnv.getFragment());
	}
};
oFF.UiServerPrgContainer.prototype.onContextMenu = oFF.noSupport;
oFF.UiServerPrgContainer.prototype.onSelect = oFF.noSupport;
oFF.UiServerPrgContainer.prototype.onSelectionChange = oFF.noSupport;
oFF.UiServerPrgContainer.prototype.onChange = oFF.noSupport;
oFF.UiServerPrgContainer.prototype.onLiveChange = oFF.noSupport;
oFF.UiServerPrgContainer.prototype.onClick = oFF.noSupport;
oFF.UiServerPrgContainer.prototype.onDoubleClick = oFF.noSupport;
oFF.UiServerPrgContainer.prototype.onOpen = oFF.noSupport;
oFF.UiServerPrgContainer.prototype.onClose = oFF.noSupport;
oFF.UiServerPrgContainer.prototype.onBeforeOpen = oFF.noSupport;
oFF.UiServerPrgContainer.prototype.onBeforeClose = oFF.noSupport;
oFF.UiServerPrgContainer.prototype.onAfterOpen = oFF.noSupport;
oFF.UiServerPrgContainer.prototype.onAfterClose = oFF.noSupport;
oFF.UiServerPrgContainer.prototype.onCollapse = oFF.noSupport;
oFF.UiServerPrgContainer.prototype.onExpand = oFF.noSupport;
oFF.UiServerPrgContainer.prototype.onEnter = oFF.noSupport;
oFF.UiServerPrgContainer.prototype.onPress = oFF.noSupport;
oFF.UiServerPrgContainer.prototype.onEditingBegin = oFF.noSupport;
oFF.UiServerPrgContainer.prototype.onEditingEnd = oFF.noSupport;
oFF.UiServerPrgContainer.prototype.onBack = oFF.noSupport;
oFF.UiServerPrgContainer.prototype.onRefresh = oFF.noSupport;
oFF.UiServerPrgContainer.prototype.onLoadFinished = oFF.noSupport;
oFF.UiServerPrgContainer.prototype.onDelete = oFF.noSupport;
oFF.UiServerPrgContainer.prototype.onDetailPress = oFF.noSupport;
oFF.UiServerPrgContainer.prototype.onMove = oFF.noSupport;
oFF.UiServerPrgContainer.prototype.onMoveStart = oFF.noSupport;
oFF.UiServerPrgContainer.prototype.onMoveEnd = oFF.noSupport;
oFF.UiServerPrgContainer.prototype.onResize = oFF.noSupport;
oFF.UiServerPrgContainer.prototype.onSuggestionSelect = oFF.noSupport;
oFF.UiServerPrgContainer.prototype.onScroll = oFF.noSupport;
oFF.UiServerPrgContainer.prototype.onScrollLoad = oFF.noSupport;
oFF.UiServerPrgContainer.prototype.onHover = oFF.noSupport;
oFF.UiServerPrgContainer.prototype.onHoverEnd = oFF.noSupport;
oFF.UiServerPrgContainer.prototype.onPaste = oFF.noSupport;
oFF.UiServerPrgContainer.prototype.onSelectionFinish = oFF.noSupport;
oFF.UiServerPrgContainer.prototype.onSearch = oFF.noSupport;
oFF.UiServerPrgContainer.prototype.onButtonPress = oFF.noSupport;
oFF.UiServerPrgContainer.prototype.onError = oFF.noSupport;
oFF.UiServerPrgContainer.prototype.onReadLineFinished = oFF.noSupport;
oFF.UiServerPrgContainer.prototype.onExecute = oFF.noSupport;
oFF.UiServerPrgContainer.prototype.onTerminate = oFF.noSupport;
oFF.UiServerPrgContainer.prototype.onFileDrop = oFF.noSupport;
oFF.UiServerPrgContainer.prototype.onDrop = oFF.noSupport;
oFF.UiServerPrgContainer.prototype.onItemClose = oFF.noSupport;
oFF.UiServerPrgContainer.prototype.onItemSelect = oFF.noSupport;
oFF.UiServerPrgContainer.prototype.onTableDragAndDrop = oFF.noSupport;
oFF.UiServerPrgContainer.prototype.onMenuPress = oFF.noSupport;
oFF.UiServerPrgContainer.prototype.onValueHelpRequest = oFF.noSupport;
oFF.UiServerPrgContainer.prototype.onColumnResize = oFF.noSupport;
oFF.UiServerPrgContainer.prototype.onRowResize = oFF.noSupport;
oFF.UiServerPrgContainer.prototype.onItemPress = oFF.noSupport;
oFF.UiServerPrgContainer.prototype.onDragStart = oFF.noSupport;
oFF.UiServerPrgContainer.prototype.onDragEnd = oFF.noSupport;
oFF.UiServerPrgContainer.prototype.onEscape = oFF.noSupport;
oFF.UiServerPrgContainer.prototype.onKeyDown = oFF.noSupport;
oFF.UiServerPrgContainer.prototype.onKeyUp = oFF.noSupport;

oFF.UiRemoteAction = function() {};
oFF.UiRemoteAction.prototype = new oFF.UiBaseConstant();
oFF.UiRemoteAction.prototype._ff_c = "UiRemoteAction";

oFF.UiRemoteAction.INITIALIZE = null;
oFF.UiRemoteAction.CONNECT = null;
oFF.UiRemoteAction.SYNC = null;
oFF.UiRemoteAction.EVENT = null;
oFF.UiRemoteAction.TERMINATE = null;
oFF.UiRemoteAction.GET_SERVER_INFO = null;
oFF.UiRemoteAction.s_lookup = null;
oFF.UiRemoteAction.staticSetup = function()
{
	oFF.UiRemoteAction.s_lookup = oFF.XHashMapByString.create();
	oFF.UiRemoteAction.INITIALIZE = oFF.UiRemoteAction.create("Initialize", false);
	oFF.UiRemoteAction.SYNC = oFF.UiRemoteAction.create("Sync", true);
	oFF.UiRemoteAction.CONNECT = oFF.UiRemoteAction.create("Connect", true);
	oFF.UiRemoteAction.EVENT = oFF.UiRemoteAction.create("Event", true);
	oFF.UiRemoteAction.TERMINATE = oFF.UiRemoteAction.create("Terminate", true);
	oFF.UiRemoteAction.GET_SERVER_INFO = oFF.UiRemoteAction.create("GetServerInfo", false);
};
oFF.UiRemoteAction.create = function(name, requiresContainerInstance)
{
	var newConstant = oFF.UiBaseConstant.createUiConstant(new oFF.UiRemoteAction(), name, oFF.UiRemoteAction.s_lookup);
	newConstant.m_requiresContainerInstance = requiresContainerInstance;
	return newConstant;
};
oFF.UiRemoteAction.lookup = function(name)
{
	return oFF.UiBaseConstant.lookupConstant(name, oFF.UiRemoteAction.s_lookup);
};
oFF.UiRemoteAction.prototype.m_requiresContainerInstance = false;
oFF.UiRemoteAction.prototype.requiresContainerInstance = function()
{
	return this.m_requiresContainerInstance;
};

oFF.UiRemoteServerStatus = function() {};
oFF.UiRemoteServerStatus.prototype = new oFF.UiBaseConstant();
oFF.UiRemoteServerStatus.prototype._ff_c = "UiRemoteServerStatus";

oFF.UiRemoteServerStatus.INITIALIZED = null;
oFF.UiRemoteServerStatus.EXECUTED = null;
oFF.UiRemoteServerStatus.SYNCED = null;
oFF.UiRemoteServerStatus.EVENTS_PROCESSED = null;
oFF.UiRemoteServerStatus.TERMINATED = null;
oFF.UiRemoteServerStatus.ERROR = null;
oFF.UiRemoteServerStatus.s_lookup = null;
oFF.UiRemoteServerStatus.staticSetup = function()
{
	oFF.UiRemoteServerStatus.s_lookup = oFF.XHashMapByString.create();
	oFF.UiRemoteServerStatus.INITIALIZED = oFF.UiRemoteServerStatus.create("Initialized");
	oFF.UiRemoteServerStatus.EXECUTED = oFF.UiRemoteServerStatus.create("Executed");
	oFF.UiRemoteServerStatus.SYNCED = oFF.UiRemoteServerStatus.create("Synced");
	oFF.UiRemoteServerStatus.EVENTS_PROCESSED = oFF.UiRemoteServerStatus.create("EventsProcessed");
	oFF.UiRemoteServerStatus.TERMINATED = oFF.UiRemoteServerStatus.create("Terminated");
	oFF.UiRemoteServerStatus.ERROR = oFF.UiRemoteServerStatus.create("Error");
};
oFF.UiRemoteServerStatus.create = function(name)
{
	var newConstant = oFF.UiBaseConstant.createUiConstant(new oFF.UiRemoteServerStatus(), name, oFF.UiRemoteServerStatus.s_lookup);
	return newConstant;
};
oFF.UiRemoteServerStatus.lookup = function(name)
{
	return oFF.UiBaseConstant.lookupConstant(name, oFF.UiRemoteServerStatus.s_lookup);
};

oFF.UiRemoteSyncReason = function() {};
oFF.UiRemoteSyncReason.prototype = new oFF.UiBaseConstant();
oFF.UiRemoteSyncReason.prototype._ff_c = "UiRemoteSyncReason";

oFF.UiRemoteSyncReason.BASIC_SYNC = null;
oFF.UiRemoteSyncReason.ACTIVE_TIMEOUTS = null;
oFF.UiRemoteSyncReason.FRAGMENT_PROCESSING = null;
oFF.UiRemoteSyncReason.s_lookup = null;
oFF.UiRemoteSyncReason.staticSetup = function()
{
	oFF.UiRemoteSyncReason.s_lookup = oFF.XHashMapByString.create();
	oFF.UiRemoteSyncReason.BASIC_SYNC = oFF.UiRemoteSyncReason.create("BasicSync");
	oFF.UiRemoteSyncReason.ACTIVE_TIMEOUTS = oFF.UiRemoteSyncReason.create("ActiveTimeouts");
	oFF.UiRemoteSyncReason.FRAGMENT_PROCESSING = oFF.UiRemoteSyncReason.create("FragmentProcessing");
};
oFF.UiRemoteSyncReason.create = function(name)
{
	var newConstant = oFF.UiBaseConstant.createUiConstant(new oFF.UiRemoteSyncReason(), name, oFF.UiRemoteSyncReason.s_lookup);
	return newConstant;
};
oFF.UiRemoteSyncReason.lookup = function(name)
{
	return oFF.UiBaseConstant.lookupConstant(name, oFF.UiRemoteSyncReason.s_lookup);
};

oFF.SubSysGuiServerPrg = function() {};
oFF.SubSysGuiServerPrg.prototype = new oFF.DfProgramSubSys();
oFF.SubSysGuiServerPrg.prototype._ff_c = "SubSysGuiServerPrg";

oFF.SubSysGuiServerPrg.DEFAULT_PROGRAM_NAME = "@SubSys.Gui.Server";
oFF.SubSysGuiServerPrg.prototype.m_uiServerManager = null;
oFF.SubSysGuiServerPrg.prototype.newProgram = function()
{
	var newObj = new oFF.SubSysGuiServerPrg();
	newObj.setup();
	return newObj;
};
oFF.SubSysGuiServerPrg.prototype.getProgramName = function()
{
	return oFF.SubSysGuiServerPrg.DEFAULT_PROGRAM_NAME;
};
oFF.SubSysGuiServerPrg.prototype.getSubSystemType = function()
{
	return oFF.SubSystemType.GUI;
};
oFF.SubSysGuiServerPrg.prototype.runProcess = function()
{
	var process = this.getProcess();
	this.m_uiServerManager = oFF.UiServerManager.create(process, oFF.XPlatform.GENERIC);
	var procEnv = process.getEnvironment();
	var devInfoStr = procEnv.getStringByKeyExt(oFF.UiRemoteProtocol.INIT_DEVICE_INFO, null);
	if (oFF.notNull(devInfoStr))
	{
		var devInfo = oFF.UiDeviceInfo.createByString(devInfoStr);
		this.m_uiServerManager.setDeviceInfo(devInfo);
	}
	var driverInfoStr = procEnv.getStringByKeyExt(oFF.UiRemoteProtocol.INIT_DRIVER_INFO, null);
	if (oFF.notNull(driverInfoStr))
	{
		var driverInfo = oFF.UiDriverInfo.createByString(driverInfoStr);
		this.m_uiServerManager.setDriverInfo(driverInfo);
	}
	var styleClassStr = procEnv.getStringByKeyExt(oFF.UiRemoteProtocol.STYLE_CLASS, null);
	if (oFF.notNull(styleClassStr))
	{
		var styleClass = oFF.UiStyleClass.lookup(styleClassStr);
		if (oFF.notNull(styleClass))
		{
			this.m_uiServerManager.setDefaultStyleClass(styleClass);
		}
	}
	this.activateSubSystem(null, oFF.SubSystemStatus.ACTIVE);
	return false;
};
oFF.SubSysGuiServerPrg.prototype.getMainApi = function()
{
	return this.m_uiServerManager;
};

oFF.SphereClient = function() {};
oFF.SphereClient.prototype = new oFF.DfUiProgram();
oFF.SphereClient.prototype._ff_c = "SphereClient";

oFF.SphereClient.DEFAULT_PROGRAM_NAME = "SphereClient";
oFF.SphereClient.PARAM_PROGRAM = "program";
oFF.SphereClient.PARAM_INIT_ARGS_STRING = "initArgsString";
oFF.SphereClient.PARAM_LOCATION = "location";
oFF.SphereClient.PARAM_WEBWORKER = "webworker";
oFF.SphereClient.DEBUG_VERBOSE = false;
oFF.SphereClient.DEFAULT_LOCATION = "http://localhost:3030";
oFF.SphereClient.DEFAULT_WEBWORKER_LOCATION = "webworker://";
oFF.SphereClient.SPHERE_CLIENT_REMOTE_SERVER_KEY = "remoteServer";
oFF.SphereClient.SPHERE_CLIENT_PROGRAM_NAME_KEY = "programName";
oFF.SphereClient.SPHERE_CLIENT_ARGUMENTS_KEY = "arguments";
oFF.SphereClient.SPHERE_CLIENT_TRACE_NAME_KEY = "traceName";
oFF.SphereClient.REMOTE_SYSTEM_NAME = "remote";
oFF.SphereClient.MISMATCH_PROTOCOL_VER_MSG = "Ui remote client <-> server version mismatch! Might cause unexpected issues!";
oFF.SphereClient.createRunner = function()
{
	var runner = oFF.KernelBoot.createByName(oFF.SphereClient.DEFAULT_PROGRAM_NAME);
	return runner;
};
oFF.SphereClient.prototype.m_programName = null;
oFF.SphereClient.prototype.m_prgInitArgsString = null;
oFF.SphereClient.prototype.m_remoteLocation = null;
oFF.SphereClient.prototype.m_remoteTraceName = null;
oFF.SphereClient.prototype.m_webworkerMode = false;
oFF.SphereClient.prototype.m_clientStarted = false;
oFF.SphereClient.prototype.m_remoteServerInput = null;
oFF.SphereClient.prototype.m_programComboBox = null;
oFF.SphereClient.prototype.m_prgInitArgsInput = null;
oFF.SphereClient.prototype.m_traceNameInput = null;
oFF.SphereClient.prototype.m_startBtn = null;
oFF.SphereClient.prototype.m_getSrvInfoBtn = null;
oFF.SphereClient.prototype.m_statusMessageLbl = null;
oFF.SphereClient.prototype.m_errorDetailsLbl = null;
oFF.SphereClient.prototype.m_instanceId = null;
oFF.SphereClient.prototype.m_serverToClientMap = null;
oFF.SphereClient.prototype.m_clientToServerMap = null;
oFF.SphereClient.prototype.m_passiveValues = null;
oFF.SphereClient.prototype.m_syncTimerId = null;
oFF.SphereClient.prototype.m_locationUri = null;
oFF.SphereClient.prototype.newProgram = function()
{
	var prg = new oFF.SphereClient();
	prg.setup();
	return prg;
};
oFF.SphereClient.prototype.getProgramName = function()
{
	return oFF.SphereClient.DEFAULT_PROGRAM_NAME;
};
oFF.SphereClient.prototype.releaseObject = function()
{
	oFF.DfUiProgram.prototype.releaseObject.call( this );
	this.m_remoteServerInput = oFF.XObjectExt.release(this.m_remoteServerInput);
	this.m_programComboBox = oFF.XObjectExt.release(this.m_programComboBox);
	this.m_prgInitArgsInput = oFF.XObjectExt.release(this.m_prgInitArgsInput);
	this.m_traceNameInput = oFF.XObjectExt.release(this.m_traceNameInput);
	this.m_startBtn = oFF.XObjectExt.release(this.m_startBtn);
	this.m_getSrvInfoBtn = oFF.XObjectExt.release(this.m_getSrvInfoBtn);
	this.m_errorDetailsLbl = oFF.XObjectExt.release(this.m_errorDetailsLbl);
	this.m_statusMessageLbl = oFF.XObjectExt.release(this.m_statusMessageLbl);
	this.m_passiveValues = oFF.XObjectExt.release(this.m_passiveValues);
	this.m_serverToClientMap = oFF.XObjectExt.release(this.m_serverToClientMap);
	this.m_clientToServerMap = oFF.XObjectExt.release(this.m_clientToServerMap);
	this.m_locationUri = oFF.XObjectExt.release(this.m_locationUri);
};
oFF.SphereClient.prototype.getLogLayer = function()
{
	return oFF.OriginLayer.APPLICATION;
};
oFF.SphereClient.prototype.getLogSeverity = function()
{
	return oFF.Severity.PRINT;
};
oFF.SphereClient.prototype.isShowMenuBar = function()
{
	return false;
};
oFF.SphereClient.prototype.getMenuBarDisplayName = function()
{
	return oFF.SphereClient.DEFAULT_PROGRAM_NAME;
};
oFF.SphereClient.prototype.getWindowMenuItems = function(genesis)
{
	var tmpMenuItems = oFF.XList.create();
	var stopMenuItem = genesis.newControl(oFF.UiType.MENU_ITEM);
	stopMenuItem.setText("Stop");
	stopMenuItem.setIcon("stop");
	stopMenuItem.setTooltip("Stop remote program execution!");
	stopMenuItem.setEnabled(this.m_clientStarted);
	stopMenuItem.registerOnPress(oFF.UiLambdaPressListener.create( function(controlEvent){
		this.restartClient();
	}.bind(this)));
	tmpMenuItems.add(stopMenuItem);
	return tmpMenuItems;
};
oFF.SphereClient.prototype.onContainerAfterClose = function()
{
	this.terminateRunningProgram();
};
oFF.SphereClient.prototype.prepareProgramMetadata = function(metadata)
{
	metadata.addOption(oFF.SphereClient.PARAM_PROGRAM, "Specify the program name which should be execute.", "Program name", oFF.XValueType.STRING);
	metadata.addOption(oFF.SphereClient.PARAM_INIT_ARGS_STRING, "Specify the arguments string for the remote program.", "Arguments string", oFF.XValueType.STRING);
	metadata.addOption(oFF.SphereClient.PARAM_LOCATION, "Specify the remote server on which the program should be executed", "Remote uri", oFF.XValueType.STRING);
	metadata.addOption(oFF.SphereClient.PARAM_WEBWORKER, "Specify if the client should start the webworker", "", oFF.XValueType.STRING);
};
oFF.SphereClient.prototype.processArguments = function(args)
{
	this.m_programName = args.getStringByKeyExt(oFF.SphereClient.PARAM_PROGRAM, null);
	this.m_prgInitArgsString = args.getStringByKeyExt(oFF.SphereClient.PARAM_INIT_ARGS_STRING, "");
	this.m_webworkerMode = oFF.XString.isEqual(args.getStringByKeyExt(oFF.SphereClient.PARAM_WEBWORKER, "false"), "true");
	this.m_remoteLocation = args.getStringByKeyExt(oFF.SphereClient.PARAM_LOCATION, this.getDefaultRemoteServerUrl());
	this.m_remoteTraceName = args.getStringByKeyExt(oFF.DfApplicationProgram.PARAM_TRACE_NAME, "");
};
oFF.SphereClient.prototype.setupProgram = function()
{
	this.m_clientStarted = false;
	return null;
};
oFF.SphereClient.prototype.buildUi = function(genesis)
{
	if (oFF.XStringUtils.isNotNullAndNotEmpty(this.m_programName) && oFF.XStringUtils.isNotNullAndNotEmpty(this.m_remoteLocation))
	{
		this.autoStart();
	}
	else
	{
		this.showInitialScreen();
	}
	this.setTitle("SphereClient");
};
oFF.SphereClient.prototype.runRemoteProgram = function()
{
	this.prepareRemoteUiSystemLandscape(this.m_remoteLocation);
	if (oFF.notNull(this.m_locationUri))
	{
		var activityIndicator = this.getGenesis().newRoot(oFF.UiType.ACTIVITY_INDICATOR);
		activityIndicator.useMaxSpace();
		activityIndicator.setIconSize(oFF.UiCssLength.create("1.5rem"));
		activityIndicator.setText(oFF.XStringUtils.concatenate4("Executing ", this.m_programName, " on ", this.m_remoteLocation));
		this.executeInitializeRequest(this.m_programName, this.m_prgInitArgsString, this.m_remoteTraceName);
	}
	else
	{
		this.getGenesis().showWarningToast("The specified remote server seems to be wrong!");
	}
};
oFF.SphereClient.prototype.autoStart = function()
{
	this.runRemoteProgram();
};
oFF.SphereClient.prototype.manualStart = function()
{
	this.m_remoteLocation = this.m_remoteServerInput.getText();
	this.m_programName = this.m_programComboBox.getSelectedItem() !== null ? this.m_programComboBox.getSelectedItem().getName() : null;
	this.m_prgInitArgsString = this.m_prgInitArgsInput.getText();
	this.m_remoteTraceName = this.m_traceNameInput.getText();
	if (oFF.XStringUtils.isNotNullAndNotEmpty(this.m_remoteLocation) && oFF.XStringUtils.isNotNullAndNotEmpty(this.m_programName))
	{
		this.m_startBtn.setEnabled(false);
		this.m_statusMessageLbl.setVisible(false);
		this.m_errorDetailsLbl.setVisible(false);
		this.runRemoteProgram();
		this.getProcess().getLocalStorage().putString(oFF.SphereClient.SPHERE_CLIENT_REMOTE_SERVER_KEY, this.m_remoteLocation);
		this.getProcess().getLocalStorage().putString(oFF.SphereClient.SPHERE_CLIENT_PROGRAM_NAME_KEY, this.m_programName);
		this.getProcess().getLocalStorage().putString(oFF.SphereClient.SPHERE_CLIENT_ARGUMENTS_KEY, this.m_prgInitArgsString);
		this.getProcess().getLocalStorage().putString(oFF.SphereClient.SPHERE_CLIENT_TRACE_NAME_KEY, this.m_remoteTraceName);
	}
	else
	{
		this.getGenesis().showWarningToast("Missing program name or remote server location! Cannot start!");
	}
};
oFF.SphereClient.prototype.updateTitle = function()
{
	this.setTitle(oFF.XStringUtils.concatenate5(this.m_programName, "@", this.m_locationUri.getHost(), ":", oFF.XInteger.convertToString(this.m_locationUri.getPort())));
};
oFF.SphereClient.prototype.showInitialScreen = function()
{
	if (this.getGenesis() !== null)
	{
		this.m_remoteLocation = this.getProcess().getLocalStorage().getStringByKeyExt(oFF.SphereClient.SPHERE_CLIENT_REMOTE_SERVER_KEY, this.m_remoteLocation);
		this.m_programName = this.getProcess().getLocalStorage().getStringByKeyExt(oFF.SphereClient.SPHERE_CLIENT_PROGRAM_NAME_KEY, "Athena");
		this.m_prgInitArgsString = this.getProcess().getLocalStorage().getStringByKeyExt(oFF.SphereClient.SPHERE_CLIENT_ARGUMENTS_KEY, this.m_prgInitArgsString);
		this.m_remoteTraceName = this.getProcess().getLocalStorage().getStringByKeyExt(oFF.SphereClient.SPHERE_CLIENT_TRACE_NAME_KEY, this.m_remoteTraceName);
		this.getGenesis().clearUi();
		var mainLayout = this.getGenesis().newControl(oFF.UiType.FLEX_LAYOUT);
		mainLayout.setName("ScContentWrapper");
		mainLayout.useMaxSpace();
		mainLayout.setDirection(oFF.UiFlexDirection.COLUMN);
		mainLayout.setAlignItems(oFF.UiFlexAlignItems.CENTER);
		mainLayout.setPadding(oFF.UiCssBoxEdges.create("20px"));
		mainLayout.setBackgroundColor(oFF.UiColor.create("rgba(52,68,114, 0.08)"));
		var titleLbl = mainLayout.addNewItemOfType(oFF.UiType.LABEL);
		titleLbl.setText("Remote Ui connection");
		titleLbl.setFontSize(oFF.UiCssLength.create("20px"));
		titleLbl.setFontWeight(oFF.UiFontWeight.BOLD);
		titleLbl.setTextAlign(oFF.UiTextAlign.CENTER);
		var subtitleLbl = mainLayout.addNewItemOfType(oFF.UiType.LABEL);
		subtitleLbl.setText(oFF.XStringUtils.concatenate2("Client version: ", oFF.UiRemoteProtocol.REMOTE_UI_VERSION));
		subtitleLbl.setFontSize(oFF.UiCssLength.create("15px"));
		subtitleLbl.setTextAlign(oFF.UiTextAlign.CENTER);
		subtitleLbl.setPadding(oFF.UiCssBoxEdges.create("10px 0px 20px 0px"));
		this.m_remoteServerInput = this.createFormInput(mainLayout, "Remote server:", "ScRemoteServerInput", this.m_remoteLocation, "Server url");
		this.m_programComboBox = this.createProgramComboBox(mainLayout);
		this.m_prgInitArgsInput = this.createFormInput(mainLayout, "Init args:", "ScPrgInitArgsInput", this.m_prgInitArgsString, "Arguments");
		this.m_traceNameInput = this.createFormInput(mainLayout, "Trace name:", "ScTraceNameInput", this.m_remoteTraceName, "Trace");
		var actionWrapper = mainLayout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
		actionWrapper.setDirection(oFF.UiFlexDirection.ROW);
		actionWrapper.setJustifyContent(oFF.UiFlexJustifyContent.CENTER);
		actionWrapper.setMargin(oFF.UiCssBoxEdges.create("10px 0px 0px 0px"));
		actionWrapper.useMaxWidth();
		this.m_startBtn = actionWrapper.addNewItemOfType(oFF.UiType.BUTTON);
		this.m_startBtn.setWidth(oFF.UiCssLength.create("150px"));
		this.m_startBtn.setText("Run");
		this.m_startBtn.setIcon("begin");
		this.m_startBtn.setEnabled(true);
		this.m_startBtn.setMargin(oFF.UiCssBoxEdges.create("0px 10px 0px 0px"));
		this.m_startBtn.registerOnPress(oFF.UiLambdaPressListener.create( function(controlEvent){
			this.manualStart();
		}.bind(this)));
		this.m_getSrvInfoBtn = actionWrapper.addNewItemOfType(oFF.UiType.BUTTON);
		this.m_getSrvInfoBtn.setWidth(oFF.UiCssLength.create("150px"));
		this.m_getSrvInfoBtn.setText("Get Server Info");
		this.m_getSrvInfoBtn.setIcon("it-host");
		this.m_getSrvInfoBtn.setEnabled(true);
		this.m_getSrvInfoBtn.setMargin(oFF.UiCssBoxEdges.create("0px 0px 0px 10px"));
		this.m_getSrvInfoBtn.registerOnPress(oFF.UiLambdaPressListener.create( function(controlEvent2){
			this.m_getSrvInfoBtn.setEnabled(false);
			this.m_remoteLocation = this.m_remoteServerInput.getText();
			this.getProcess().getLocalStorage().putString(oFF.SphereClient.SPHERE_CLIENT_REMOTE_SERVER_KEY, this.m_remoteLocation);
			this.executeGetServerInfo();
		}.bind(this)));
		var pusher = mainLayout.addNewItemOfType(oFF.UiType.SPACER);
		pusher.setMargin(oFF.UiCssBoxEdges.create("auto"));
		this.m_statusMessageLbl = mainLayout.addNewItemOfType(oFF.UiType.LABEL);
		this.m_statusMessageLbl.setText("");
		this.m_statusMessageLbl.setFontSize(oFF.UiCssLength.create("14px"));
		this.m_statusMessageLbl.setWidth(oFF.UiCssLength.create("90%"));
		this.m_statusMessageLbl.setBackgroundColor(oFF.UiColor.ERROR);
		this.m_statusMessageLbl.setFontColor(oFF.UiColor.WHITE);
		this.m_statusMessageLbl.setFontWeight(oFF.UiFontWeight.BOLD);
		this.m_statusMessageLbl.setTextAlign(oFF.UiTextAlign.CENTER);
		this.m_statusMessageLbl.setPadding(oFF.UiCssBoxEdges.create("10px"));
		this.m_statusMessageLbl.setCornerRadius(oFF.UiCssBoxEdges.create("5px"));
		this.m_statusMessageLbl.setVisible(false);
		this.m_errorDetailsLbl = mainLayout.addNewItemOfType(oFF.UiType.LABEL);
		this.m_errorDetailsLbl.setText("");
		this.m_errorDetailsLbl.setFontSize(oFF.UiCssLength.create("12px"));
		this.m_errorDetailsLbl.setWidth(oFF.UiCssLength.create("90%"));
		this.m_errorDetailsLbl.setFontColor(oFF.UiColor.ERROR);
		this.m_errorDetailsLbl.setBackgroundColor(oFF.UiColor.WHITE);
		this.m_errorDetailsLbl.setTextAlign(oFF.UiTextAlign.LEFT);
		this.m_errorDetailsLbl.setWrapping(true);
		this.m_errorDetailsLbl.setPadding(oFF.UiCssBoxEdges.create("5px"));
		this.m_errorDetailsLbl.setMargin(oFF.UiCssBoxEdges.create("10px 0px 0px 0px"));
		this.m_errorDetailsLbl.setCornerRadius(oFF.UiCssBoxEdges.create("5px"));
		this.m_errorDetailsLbl.setBorderColor(oFF.UiColor.ERROR);
		this.m_errorDetailsLbl.setBorderStyle(oFF.UiBorderStyle.SOLID);
		this.m_errorDetailsLbl.setBorderWidth(oFF.UiCssBoxEdges.create("1px"));
		this.m_errorDetailsLbl.setFontWeight(oFF.UiFontWeight.BOLD);
		this.m_errorDetailsLbl.setVisible(false);
		this.getGenesis().setRoot(mainLayout);
	}
};
oFF.SphereClient.prototype.restartClient = function()
{
	this.terminateRunningProgram();
	this.showInitialScreen();
};
oFF.SphereClient.prototype.createFormLine = function(layout, text)
{
	var wrapperLayout = layout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	wrapperLayout.setWidth(oFF.UiCssLength.create("100%"));
	wrapperLayout.setDirection(oFF.UiFlexDirection.ROW);
	wrapperLayout.setWrap(oFF.UiFlexWrap.NO_WRAP);
	var inputLabel = wrapperLayout.addNewItemOfType(oFF.UiType.LABEL);
	inputLabel.setWidth(oFF.UiCssLength.create("200px"));
	inputLabel.setText(text);
	return wrapperLayout;
};
oFF.SphereClient.prototype.createFormInput = function(layout, text, name, value, placeholder)
{
	var formLineLayout = this.createFormLine(layout, text);
	var tmpInput = formLineLayout.addNewItemOfType(oFF.UiType.INPUT);
	tmpInput.setName(name);
	tmpInput.setPlaceholder(placeholder);
	tmpInput.setText(value);
	tmpInput.registerOnEnter(oFF.UiLambdaEnterListener.create( function(controlEvent){
		this.manualStart();
	}.bind(this)));
	return tmpInput;
};
oFF.SphereClient.prototype.createProgramComboBox = function(layout)
{
	var formLineLayout = this.createFormLine(layout, "Program: ");
	var tmpComboBox = formLineLayout.addNewItemOfType(oFF.UiType.COMBO_BOX);
	tmpComboBox.setName("ScProgramNameInput");
	tmpComboBox.setPlaceholder("Program");
	tmpComboBox.setWidth(oFF.UiCssLength.create("100%"));
	tmpComboBox.registerOnEnter(oFF.UiLambdaEnterListener.create( function(controlEvent){
		this.manualStart();
	}.bind(this)));
	var allPrograms = oFF.ProgramRegistration.getOrderedAllEntries().getIterator();
	while (allPrograms.hasNext())
	{
		var tmpPrgManifest = allPrograms.next();
		if (tmpPrgManifest.getOutputContainerType() !== oFF.ProgramContainerType.CONSOLE && tmpPrgManifest.getOutputContainerType() !== oFF.ProgramContainerType.NONE && oFF.XString.isEqual(tmpPrgManifest.getProgramName(), oFF.SphereClient.DEFAULT_PROGRAM_NAME) === false)
		{
			var newItem = tmpComboBox.addNewItem();
			newItem.setName(tmpPrgManifest.getProgramName());
			if (oFF.XStringUtils.isNotNullAndNotEmpty(tmpPrgManifest.getDescription()))
			{
				newItem.setText(oFF.XStringUtils.concatenate3(tmpPrgManifest.getProgramName(), " - ", tmpPrgManifest.getDescription()));
			}
			else
			{
				newItem.setText(tmpPrgManifest.getProgramName());
			}
		}
	}
	tmpComboBox.setSelectedName(this.m_programName);
	return tmpComboBox;
};
oFF.SphereClient.prototype.showError = function(errorMessage, errorDetails)
{
	this.m_statusMessageLbl.setVisible(true);
	this.m_statusMessageLbl.setText(errorMessage);
	this.m_statusMessageLbl.setBackgroundColor(oFF.UiColor.ERROR);
	if (oFF.XStringUtils.isNotNullAndNotEmpty(errorDetails))
	{
		this.m_errorDetailsLbl.setVisible(true);
		this.m_errorDetailsLbl.setText(errorDetails);
	}
	this.m_startBtn.setEnabled(true);
};
oFF.SphereClient.prototype.isWebWorkerEnabled = function()
{
	return this.m_webworkerMode || oFF.notNull(this.m_remoteServerInput) && oFF.XString.containsString(this.m_remoteServerInput.getText(), "webworker");
};
oFF.SphereClient.prototype.getDefaultRemoteServerUrl = function()
{
	if (this.isWebWorkerEnabled())
	{
		return oFF.SphereClient.DEFAULT_WEBWORKER_LOCATION;
	}
	var tmpRemoteUri = oFF.NetworkEnv.getLocation();
	if (oFF.notNull(tmpRemoteUri))
	{
		var adapted = oFF.XUri.createFromOther(tmpRemoteUri);
		if (oFF.notNull(adapted))
		{
			adapted.setPath(null);
			adapted.setQuery(null);
			adapted.setFragment(null);
			return adapted.getUrl();
		}
	}
	return oFF.SphereClient.DEFAULT_LOCATION;
};
oFF.SphereClient.prototype.didPressExitMenuItem = function(event)
{
	if (this.getResolvedProgramContainerType() !== oFF.ProgramContainerType.STANDALONE && oFF.XString.isEqual(oFF.DfUiProgram.DEFAULT_MENU_BAR_PROGRAM_NAME_MENU_EXIT_BTN_TAG, event.getControl().getTag()))
	{
		return true;
	}
	return false;
};
oFF.SphereClient.prototype.processGetServerInfoResponse = function(responseJsonContent)
{
	var serverVersion = responseJsonContent.getStringByKey(oFF.UiRemoteProtocol.PROTOCOL_VERSION);
	var startTimeMillis = responseJsonContent.getLongByKey(oFF.UiRemoteProtocol.START_TIME);
	var serverPrograms = responseJsonContent.getListByKey(oFF.UiRemoteProtocol.PROGRAMS);
	var runningContainers = responseJsonContent.getListByKey(oFF.UiRemoteProtocol.RUNNING_CONTAINERS);
	var versionStr = serverVersion;
	if (!oFF.XString.isEqual(serverVersion, oFF.UiRemoteProtocol.REMOTE_UI_VERSION))
	{
		versionStr = oFF.XStringUtils.concatenate2(serverVersion, " (client version mismatch!)");
	}
	var srvProgramsStr = "Server programs";
	if (oFF.notNull(serverPrograms))
	{
		srvProgramsStr = oFF.XStringUtils.concatenate4(srvProgramsStr, " (", oFF.XInteger.convertToString(serverPrograms.size()), ")");
	}
	var runningContainerStr = "Running containers";
	if (oFF.notNull(runningContainers))
	{
		runningContainerStr = oFF.XStringUtils.concatenate4(runningContainerStr, " (", oFF.XInteger.convertToString(runningContainers.size()), ")");
	}
	var serverInfoFormPopup = oFF.UtFormPopup.create(this.getGenesis(), "Server Info success!", null);
	serverInfoFormPopup.setPopupState(oFF.UiValueState.SUCCESS);
	serverInfoFormPopup.setWidth(oFF.UiCssLength.create("760px"));
	serverInfoFormPopup.setReadOnly();
	serverInfoFormPopup.addInput(null, this.m_remoteLocation, "Server", null, null, null);
	serverInfoFormPopup.addInput(null, versionStr, "Version", null, null, null);
	serverInfoFormPopup.addInput(null, this.getElapsedStringFromMillis(startTimeMillis, false), "Started", null, null, null);
	var runningContainerSection = serverInfoFormPopup.addFormSection(null, null, false);
	runningContainerSection.setGap(oFF.UiCssGap.create("5px"));
	runningContainerSection.addFormLabel(null, runningContainerStr, null);
	runningContainerSection.addFormCustomControl(null, this.createRunningContainerTable(runningContainers));
	var srvProgramsSection = serverInfoFormPopup.addFormSection(null, null, false);
	srvProgramsSection.setGap(oFF.UiCssGap.create("5px"));
	srvProgramsSection.addFormLabel(null, srvProgramsStr, null);
	srvProgramsSection.addFormCustomControl(null, this.createSrvProgramsList(serverPrograms));
	serverInfoFormPopup.open();
};
oFF.SphereClient.prototype.createSrvProgramsList = function(srvProgramList)
{
	var prgList = this.getGenesis().newControl(oFF.UiType.LIST);
	prgList.setMaxHeight(oFF.UiCssLength.create("200px"));
	prgList.useMaxWidth();
	prgList.setSelectionMode(oFF.UiSelectionMode.NONE);
	prgList.setOverflow(oFF.UiOverflow.AUTO);
	if (oFF.notNull(srvProgramList))
	{
		oFF.XCollectionUtils.forEach(srvProgramList,  function(prgInfoStruct){
			if (prgInfoStruct.isStructure())
			{
				var tmpStruct = prgInfoStruct.asStructure();
				var prgName = tmpStruct.getStringByKey(oFF.UiRemoteProtocol.PROGRAM_NAME);
				var prgDesc = tmpStruct.getStringByKey(oFF.UiRemoteProtocol.PROGRAM_DESCRIPTION);
				var prgDevStr = tmpStruct.getStringByKey(oFF.UiRemoteProtocol.PROGRAM_CONTAINER_TYPE);
				var listItemText = oFF.XStringUtils.concatenate4(prgName, " [", prgDesc, "]");
				listItemText = oFF.XStringUtils.concatenate4(listItemText, " (", oFF.XString.substring(prgDevStr, 0, 1), ")");
				var newListItem = prgList.addNewItem();
				newListItem.setText(listItemText);
			}
		}.bind(this));
	}
	return prgList;
};
oFF.SphereClient.prototype.createRunningContainerTable = function(runningContainersList)
{
	var runningContainersTable = this.getGenesis().newControl(oFF.UiType.RESPONSIVE_TABLE);
	runningContainersTable.setBorderStyle(oFF.UiBorderStyle.SOLID);
	runningContainersTable.setBorderColor(oFF.UiColor.GREY);
	runningContainersTable.setBorderWidth(oFF.UiCssBoxEdges.create("1px"));
	runningContainersTable.setNoDataText("No running containers!");
	runningContainersTable.addNewResponsiveTableColumn().setTitle("InstanceId").setWidth(oFF.UiCssLength.create("auto"));
	runningContainersTable.addNewResponsiveTableColumn().setTitle("Program name").setWidth(oFF.UiCssLength.create("130px"));
	runningContainersTable.addNewResponsiveTableColumn().setTitle("Style").setWidth(oFF.UiCssLength.create("70px"));
	runningContainersTable.addNewResponsiveTableColumn().setTitle("Started").setWidth(oFF.UiCssLength.create("110px"));
	runningContainersTable.addNewResponsiveTableColumn().setTitle("Last activity").setWidth(oFF.UiCssLength.create("110px"));
	runningContainersTable.setSelectionMode(oFF.UiSelectionMode.NONE);
	if (oFF.notNull(runningContainersList))
	{
		oFF.XCollectionUtils.forEach(runningContainersList,  function(containerInfoStruct){
			if (containerInfoStruct.isStructure())
			{
				var tmpStruct = containerInfoStruct.asStructure();
				var instanceId = tmpStruct.getStringByKey(oFF.UiRemoteProtocol.INSTANCE_ID);
				var prgName = tmpStruct.getStringByKey(oFF.UiRemoteProtocol.PROGRAM_NAME);
				var styleClassStr = tmpStruct.getStringByKey(oFF.UiRemoteProtocol.STYLE_CLASS);
				var startTimeMillis = tmpStruct.getLongByKey(oFF.UiRemoteProtocol.START_TIME);
				var lastActivityMillis = tmpStruct.getLongByKey(oFF.UiRemoteProtocol.LAST_ACTIVITY);
				var startTimeStr = this.getElapsedStringFromMillis(startTimeMillis, true);
				var lastActivityStr = this.getElapsedStringFromMillis(lastActivityMillis, true);
				var tmpResponsiveRow = runningContainersTable.addNewResponsiveTableRow();
				tmpResponsiveRow.addNewLabelCell().setText(instanceId).setTooltip(instanceId);
				tmpResponsiveRow.addNewLabelCell().setText(prgName).setTooltip(prgName);
				tmpResponsiveRow.addNewLabelCell().setText(styleClassStr).setTooltip(styleClassStr);
				tmpResponsiveRow.addNewLabelCell().setText(startTimeStr).setTooltip(startTimeStr);
				tmpResponsiveRow.addNewLabelCell().setText(lastActivityStr).setTooltip(lastActivityStr);
			}
		}.bind(this));
	}
	return runningContainersTable;
};
oFF.SphereClient.prototype.getElapsedStringFromMillis = function(startMillis, shortStyle)
{
	var elapsedStr = "";
	var currentTime = oFF.XDateTime.create();
	var timeDiffMinutes = oFF.XDouble.convertToInt((currentTime.getMilliseconds() - startMillis) / 1000 / 60);
	var timeDiffHours = oFF.XDouble.convertToInt(timeDiffMinutes / 60);
	var leftMinutes = oFF.XMath.mod(timeDiffMinutes, 60);
	if (leftMinutes === 0 && timeDiffHours === 0)
	{
		elapsedStr = "just now";
	}
	else if (shortStyle)
	{
		elapsedStr = oFF.XStringUtils.concatenate4(oFF.XInteger.convertToString(timeDiffHours), "h ", oFF.XInteger.convertToString(leftMinutes), "m ago");
	}
	else
	{
		elapsedStr = oFF.XStringUtils.concatenate4(oFF.XInteger.convertToString(timeDiffHours), " hours ", oFF.XInteger.convertToString(leftMinutes), " minutes ago");
	}
	return elapsedStr;
};
oFF.SphereClient.prototype.showClientServerMismatchWarning = function()
{
	var clientContainer = this.getGenesis().getAnchor();
	if (oFF.notNull(clientContainer) && clientContainer.getUiType() === oFF.UiType.PAGE)
	{
		clientContainer.setFloatingFooter(true);
		var msgStrip = clientContainer.setNewFooter(oFF.UiType.MESSAGE_STRIP);
		msgStrip.setText(oFF.SphereClient.MISMATCH_PROTOCOL_VER_MSG);
		msgStrip.setWidth(oFF.UiCssLength.create("99.9%"));
		msgStrip.setShowIcon(true);
		msgStrip.setIcon("alert");
		msgStrip.setMessageType(oFF.UiMessageType.WARNING);
		msgStrip.setShowCloseButton(true);
		msgStrip.registerOnClose(oFF.UiLambdaCloseListener.create( function(event){
			clientContainer.setFooter(null);
			clientContainer.setFloatingFooter(false);
		}.bind(this)));
	}
	else
	{
		this.getGenesis().showWarningToast(oFF.SphereClient.MISMATCH_PROTOCOL_VER_MSG);
	}
};
oFF.SphereClient.prototype.prepareRemoteUri = function(locationUri)
{
	var tmpRemoteUri = null;
	if (oFF.notNull(locationUri))
	{
		tmpRemoteUri = oFF.XUri.createFromUrl(locationUri);
	}
	else
	{
		tmpRemoteUri = oFF.NetworkEnv.getLocation();
		if (oFF.isNull(tmpRemoteUri))
		{
			tmpRemoteUri = oFF.XUri.createFromUrl(oFF.SphereClient.DEFAULT_LOCATION);
		}
		else
		{
			var adapted = oFF.XUri.createFromOther(tmpRemoteUri);
			adapted.setPath(null);
			adapted.setQuery(null);
			adapted.setFragment(null);
			return adapted;
		}
	}
	if (oFF.notNull(tmpRemoteUri) && (oFF.XStringUtils.isNotNullAndNotEmpty(tmpRemoteUri.getHost()) || this.isWebWorkerEnabled()))
	{
		return tmpRemoteUri;
	}
	return null;
};
oFF.SphereClient.prototype.prepareRemoteUiSystemLandscape = function(locationUri)
{
	this.m_locationUri = this.prepareRemoteUri(locationUri);
	if (oFF.notNull(this.m_locationUri))
	{
		this.getApplication().getConnectionPool().clearConnections();
		var application = this.getApplication();
		var sysLand = oFF.StandaloneSystemLandscape.create(this);
		var system = sysLand.setSystemByUri(oFF.SphereClient.REMOTE_SYSTEM_NAME, this.m_locationUri, oFF.SystemType.GENERIC);
		system.setIsCsrfTokenRequired(false);
		application.setSystemLandscape(sysLand);
	}
};
oFF.SphereClient.prototype.prepareFunction = function(remoteAction, instanceId)
{
	if (oFF.notNull(remoteAction))
	{
		var connection = this.getApplication().getConnectionPool().getConnection(oFF.SphereClient.REMOTE_SYSTEM_NAME);
		var buffer = oFF.XStringBuffer.create();
		buffer.append("/remote/myapp?");
		buffer.append(oFF.UiRemoteProtocol.ACTION);
		buffer.append("=");
		buffer.append(remoteAction.getName());
		if (remoteAction.requiresContainerInstance())
		{
			if (oFF.XStringUtils.isNotNullAndNotEmpty(instanceId))
			{
				buffer.append("&");
				buffer.append(oFF.UiRemoteProtocol.INSTANCE_ID);
				buffer.append("=");
				buffer.append(instanceId);
			}
			else
			{
				throw oFF.XException.createRuntimeException("Instance id is required for this request!");
			}
		}
		var path = buffer.toString();
		var ocpFunction = connection.newRpcFunction(path);
		ocpFunction.getRpcRequest().setMethod(oFF.HttpRequestMethod.HTTP_POST);
		return ocpFunction;
	}
	return null;
};
oFF.SphereClient.prototype.prepareEmptyRequest = function(ocpFunction)
{
	var requestStructure = oFF.PrFactory.createStructure();
	ocpFunction.getRpcRequest().setRequestStructure(requestStructure);
	return requestStructure;
};
oFF.SphereClient.prototype.prepareIntegrityRequest = function(ocpFunction)
{
	var requestStructure = this.prepareEmptyRequest(ocpFunction);
	this.addIntegrityCheckToRequest(requestStructure);
	return requestStructure;
};
oFF.SphereClient.prototype.addIntegrityCheckToRequest = function(requestJson)
{
	var integrityCheck = requestJson.putNewStructure(oFF.UiRemoteProtocol.INTEGRITY_CHECK);
	integrityCheck.putInteger(oFF.UiRemoteProtocol.TOTAL_CONTROLS, this.getUiManager().getSelectableElementCount());
	integrityCheck.putString(oFF.UiRemoteProtocol.PROTOCOL_VERSION, oFF.UiRemoteProtocol.REMOTE_UI_VERSION);
};
oFF.SphereClient.prototype.executeGetServerInfo = function()
{
	this.prepareRemoteUiSystemLandscape(this.m_remoteLocation);
	var ocpFunction = this.prepareFunction(oFF.UiRemoteAction.GET_SERVER_INFO, null);
	this.prepareEmptyRequest(ocpFunction);
	ocpFunction.processFunctionExecution(oFF.SyncType.NON_BLOCKING, oFF.UiLambdaFunctionExecutedListener.create( function(extResult){
		this.m_getSrvInfoBtn.setEnabled(true);
		if (extResult.isValid())
		{
			var jsonContent = extResult.getData().getRootElement();
			if (oFF.notNull(jsonContent))
			{
				this.processGetServerInfoResponse(jsonContent);
			}
		}
		else
		{
			this.getGenesis().showErrorToast("Get server info failed! No response from server!");
		}
	}.bind(this)), null);
};
oFF.SphereClient.prototype.executeInitializeRequest = function(prgName, argsString, traceName)
{
	this.reInitClient();
	var ocpFunction = this.prepareFunction(oFF.UiRemoteAction.INITIALIZE, null);
	var initStruct = this.prepareIntegrityRequest(ocpFunction);
	initStruct.put(oFF.UiRemoteProtocol.INIT_DATA, this.getInitData(prgName, argsString, traceName));
	ocpFunction.processFunctionExecution(oFF.SyncType.NON_BLOCKING, this, null);
};
oFF.SphereClient.prototype.reInitClient = function()
{
	this.m_passiveValues = oFF.XProperties.create();
	this.m_serverToClientMap = oFF.XHashMapByString.create();
	this.m_clientToServerMap = oFF.XHashMapOfStringByString.create();
	this.m_instanceId = null;
	var allUiTypes = oFF.UiType.getAllUiTypes();
	while (allUiTypes.hasNext())
	{
		var currentType = allUiTypes.next();
		if (currentType.isComposite())
		{
			currentType.setFactory(new oFF.UiCompositeRemoteFactory());
		}
	}
};
oFF.SphereClient.prototype.getInitData = function(programName, prgInitArgsString, traceName)
{
	var initDataStruct = oFF.PrFactory.createStructure();
	var location = oFF.NetworkEnv.getLocation();
	initDataStruct.putString(oFF.UiRemoteProtocol.INIT_REMOTE_LOCATION, oFF.notNull(location) ? location.getUrl() : oFF.SphereClient.DEFAULT_LOCATION);
	var fragment = oFF.NetworkEnv.getFragment();
	initDataStruct.putString(oFF.UiRemoteProtocol.FRAGMENT, fragment);
	if (oFF.notNull(programName))
	{
		initDataStruct.putString(oFF.UiRemoteProtocol.INIT_PROGRAM_NAME, programName);
	}
	if (oFF.notNull(prgInitArgsString))
	{
		initDataStruct.putString(oFF.UiRemoteProtocol.INIT_ARGS_STRING, prgInitArgsString);
	}
	if (oFF.notNull(traceName))
	{
		initDataStruct.putString(oFF.UiRemoteProtocol.INIT_TRACE_NAME, traceName);
	}
	var prgContainerType = this.getResolvedProgramContainerType();
	if (oFF.notNull(prgContainerType))
	{
		initDataStruct.putString(oFF.UiRemoteProtocol.PROGRAM_CONTAINER_TYPE, prgContainerType.getName());
	}
	var variableNames = oFF.XEnvironment.getInstance().getVariableNames();
	var iterator = variableNames.getIterator();
	while (iterator.hasNext())
	{
		var key = iterator.next();
		var value = oFF.XEnvironment.getInstance().getVariable(key);
		if (oFF.XString.isEqual(oFF.XString.toLowerCase(oFF.UiRemoteProtocol.INIT_PROGRAM_NAME), key))
		{
			initDataStruct.putString(oFF.UiRemoteProtocol.INIT_PROGRAM_NAME, value);
		}
		else if (oFF.XString.isEqual(oFF.XString.toLowerCase(oFF.UiRemoteProtocol.STYLE_CLASS), oFF.XString.toLowerCase(key)))
		{
			initDataStruct.putString(oFF.UiRemoteProtocol.STYLE_CLASS, value);
		}
		else
		{
			initDataStruct.putString(key, value);
		}
	}
	initDataStruct.putString(oFF.UiRemoteProtocol.INIT_PLATFORM, this.getUiManager().getPlatform().getName());
	initDataStruct.putString(oFF.UiRemoteProtocol.INIT_DEVICE_INFO, this.getUiManager().getDeviceInfo().getAsString());
	initDataStruct.putString(oFF.UiRemoteProtocol.INIT_DRIVER_INFO, this.getUiManager().getDriverInfo().getAsString());
	var uiFrameworkConfig = initDataStruct.putNewStructure(oFF.UiRemoteProtocol.INIT_UI_FRAMEWORK_CONFIG);
	uiFrameworkConfig.putString(oFF.UiRemoteProtocol.CLIENT_THEME, this.getUiManager().getTheme());
	uiFrameworkConfig.putBoolean(oFF.UiRemoteProtocol.CLIENT_RTL, this.getUiManager().isRtl());
	var uiTypeDefs = initDataStruct.putNewStructure(oFF.UiRemoteProtocol.INIT_UI_TYPE_DEFS);
	var allUiTypes = oFF.UiType.getAllUiTypes();
	while (allUiTypes.hasNext())
	{
		var uiType = allUiTypes.next();
		var simpleFlags = uiType.getCapabilityFlags();
		if (oFF.notNull(simpleFlags))
		{
			var name = uiType.getName();
			var typeInfos = uiTypeDefs.putNewStructure(name);
			var simpleFlagList = typeInfos.putNewList(oFF.UiRemoteProtocol.CAPABILITY_FLAGS);
			var flagIterator = simpleFlags.getIterator();
			while (flagIterator.hasNext())
			{
				simpleFlagList.addString(flagIterator.next());
			}
		}
	}
	return initDataStruct;
};
oFF.SphereClient.prototype.executeSyncRequest = function()
{
	if (this.m_clientStarted)
	{
		var ocpFunction = this.prepareFunction(oFF.UiRemoteAction.SYNC, this.m_instanceId);
		var singleEvent = this.prepareSingleEvent(ocpFunction);
		singleEvent.addString(oFF.UiRemoteProtocol.EV_ON_SIT_AND_WAIT);
		ocpFunction.processFunctionExecution(oFF.SyncType.NON_BLOCKING, this, null);
	}
};
oFF.SphereClient.prototype.prepareEventFunction = function()
{
	var ocpFunction = this.prepareFunction(oFF.UiRemoteAction.EVENT, this.m_instanceId);
	return ocpFunction;
};
oFF.SphereClient.prototype.executeTerminateRequest = function(instanceId, isFireAndForget, listener)
{
	var ocpFunction = this.prepareFunction(oFF.UiRemoteAction.TERMINATE, instanceId);
	ocpFunction.getRpcRequest().setIsFireAndForgetCall(isFireAndForget);
	var terminateStruct = this.prepareIntegrityRequest(ocpFunction);
	terminateStruct.putString(oFF.UiRemoteProtocol.INSTANCE_ID, instanceId);
	ocpFunction.processFunctionExecution(oFF.SyncType.NON_BLOCKING, listener, null);
};
oFF.SphereClient.prototype.terminateRunningProgram = function()
{
	if (this.m_clientStarted)
	{
		this.m_clientStarted = false;
		this.executeTerminateRequest(this.m_instanceId, true, null);
	}
};
oFF.SphereClient.prototype.onFunctionExecuted = function(extResult, response, customIdentifier)
{
	if (extResult.isValid())
	{
		if (!this.m_clientStarted)
		{
			this.m_clientStarted = true;
			this.updateTitle();
		}
		var jsonContent = response.getRootElement();
		this.m_instanceId = jsonContent.getStringByKeyExt(oFF.UiRemoteProtocol.INSTANCE_ID, this.m_instanceId);
		this.validateClientServerProtocolVersion(jsonContent);
		if (this.isStandalone())
		{
			var fragment = jsonContent.getStringByKey(oFF.UiRemoteProtocol.FRAGMENT);
			oFF.NetworkEnv.setFragment(fragment);
		}
		var list = jsonContent.getListByKey(oFF.UiRemoteProtocol.OPERATIONS);
		var size = list.size();
		for (var i = 0; i < size; i++)
		{
			var operation = list.getListAt(i);
			var offset = 0;
			var methodName = operation.getStringAt(offset);
			offset = offset + 1;
			var op = oFF.UiAllOperations.lookupOp(methodName);
			if (oFF.notNull(op))
			{
				var uiContext = null;
				var contextName = operation.getStringAt(offset);
				offset = offset + 1;
				if (oFF.notNull(contextName))
				{
					uiContext = this.m_serverToClientMap.getByKey(contextName);
					if (oFF.isNull(uiContext))
					{
						this.logError2("Cannot find control context ", contextName);
					}
				}
				var retContextName = operation.getStringAt(offset);
				offset = offset + 1;
				var returnObj = op.executeOperation(this, uiContext, operation, offset);
				if (oFF.notNull(returnObj) && oFF.XStringUtils.isNotNullAndNotEmpty(retContextName) && returnObj.isReleased() === false)
				{
					var componentType = returnObj.getComponentType();
					if (componentType.isTypeOf(oFF.XComponentType._UI))
					{
						var uiReturnContext = returnObj;
						this.m_serverToClientMap.put(retContextName, uiReturnContext);
						var uiId = uiReturnContext.getId();
						if (oFF.XString.isEqual(uiId, retContextName) === false)
						{
							this.m_clientToServerMap.put(uiId, retContextName);
						}
					}
				}
				else if (oFF.notNull(returnObj) && oFF.XStringUtils.isNotNullAndNotEmpty(retContextName) && returnObj.isReleased())
				{
					this.cleanupControlMappingAfterRelease(retContextName);
				}
			}
			else
			{
				this.log2("Cannot find operation: ", methodName);
			}
		}
		this.doIntergrityCheck(jsonContent);
		this.collectPassiveValues();
		this.scheduleServerSyncIfNeeded(jsonContent);
	}
	else
	{
		this.log("Error in ocp call");
		this.log(extResult.getSummary());
		var errorJsonContent = response.getRootElement();
		if (oFF.notNull(errorJsonContent))
		{
			var errorMessage = errorJsonContent.getStringByKeyExt(oFF.UiRemoteProtocol.ERROR_MESSAGE, null);
			if (!this.m_clientStarted)
			{
				this.showInitialScreen();
				var errMsg = oFF.XStringUtils.concatenate4("Error: (#", oFF.XInteger.convertToString(extResult.getServerStatusCode()), ") ", extResult.getServerStatusDetails());
				this.showError(errMsg, errorMessage);
			}
		}
	}
};
oFF.SphereClient.prototype.scheduleServerSyncIfNeeded = function(serverJson)
{
	var nextSyncTimer = serverJson.getIntegerByKeyExt(oFF.UiRemoteProtocol.NEXT_SYNC_TIMER, -1);
	if (nextSyncTimer !== -1)
	{
		if (oFF.notNull(this.m_syncTimerId))
		{
			oFF.XTimeout.clear(this.m_syncTimerId);
		}
		this.m_syncTimerId = oFF.XTimeout.timeout(nextSyncTimer,  function(){
			this.executeSyncRequest();
			this.m_syncTimerId = null;
		}.bind(this));
	}
};
oFF.SphereClient.prototype.validateClientServerProtocolVersion = function(jsonContent)
{
	if (jsonContent.containsKey(oFF.UiRemoteProtocol.STATUS))
	{
		var srvStatus = oFF.UiRemoteServerStatus.lookup(jsonContent.getStringByKey(oFF.UiRemoteProtocol.STATUS));
		if (srvStatus === oFF.UiRemoteServerStatus.INITIALIZED)
		{
			var integrityCheck = jsonContent.getStructureByKey(oFF.UiRemoteProtocol.INTEGRITY_CHECK);
			if (oFF.notNull(integrityCheck) && integrityCheck.containsKey(oFF.UiRemoteProtocol.PROTOCOL_VERSION))
			{
				var srvProtcolVersion = integrityCheck.getStringByKey(oFF.UiRemoteProtocol.PROTOCOL_VERSION);
				if (!oFF.XString.isEqual(srvProtcolVersion, oFF.UiRemoteProtocol.REMOTE_UI_VERSION))
				{
					this.showClientServerMismatchWarning();
				}
			}
		}
	}
};
oFF.SphereClient.prototype.doIntergrityCheck = function(serverJson) {};
oFF.SphereClient.prototype.prepareUiEvent = function(event, eventDef, ocpFunction)
{
	if (oFF.isNull(eventDef))
	{
		throw oFF.XException.createRuntimeException("Missing event! Please specify an event!");
	}
	var singleEvent = this.prepareSingleEvent(ocpFunction);
	var control = event.getControl();
	this.addOperation(singleEvent, eventDef.getRemoteName(), control);
	var parametersStr = null;
	if (event.getParameters() !== null)
	{
		parametersStr = event.getParameters().serialize();
	}
	singleEvent.addString(parametersStr);
	return singleEvent;
};
oFF.SphereClient.prototype.prepareUiEventNew = function(event, eventDef, ocpFunction)
{
	if (oFF.isNull(eventDef))
	{
		throw oFF.XException.createRuntimeException("Missing event! Please specify an event!");
	}
	var eventBase = event;
	var singleEvent = this.prepareSingleEvent(ocpFunction);
	var control = eventBase.getControl();
	this.addOperation(singleEvent, eventDef.getRemoteName(), control);
	singleEvent.addString(eventBase.getAsString());
	return singleEvent;
};
oFF.SphereClient.prototype.prepareSingleEvent = function(ocpFunction)
{
	var eventList = this.prepareEventRequest(ocpFunction);
	this.passiveValueTransfer(eventList);
	var singleEvent = eventList.addNewList();
	return singleEvent;
};
oFF.SphereClient.prototype.prepareEventRequest = function(ocpFunction)
{
	var requestStructure = oFF.PrFactory.createStructure();
	ocpFunction.getRpcRequest().setRequestStructure(requestStructure);
	var eventList = requestStructure.putNewList(oFF.UiRemoteProtocol.EVENTS);
	requestStructure.putString(oFF.UiRemoteProtocol.INSTANCE_ID, this.m_instanceId);
	this.addIntegrityCheckToRequest(requestStructure);
	return eventList;
};
oFF.SphereClient.prototype.sendControlEvent = function(event, eventDef)
{
	var ocpFunction = this.prepareEventFunction();
	this.prepareUiEvent(event, eventDef, ocpFunction);
	ocpFunction.processFunctionExecution(oFF.SyncType.NON_BLOCKING, this, null);
};
oFF.SphereClient.prototype.sendSelectionEvent = function(event, eventDef)
{
	var ocpFunction = this.prepareEventFunction();
	var singleEvent = this.prepareUiEvent(event, eventDef, ocpFunction);
	try
	{
		var selectedItems = event.getSelectedItems();
		var selectedItemIds = this.createControlIdsStringFromList(selectedItems);
		singleEvent.addString(selectedItemIds);
	}
	catch (e)
	{
		oFF.XLogger.println("[SphereClient] Warning - Expected a UiSelectionEvent! Sending limited event data!");
	}
	ocpFunction.processFunctionExecution(oFF.SyncType.NON_BLOCKING, this, null);
};
oFF.SphereClient.prototype.sendResizeEvent = function(event, eventDef)
{
	var ocpFunction = this.prepareEventFunction();
	this.prepareUiEventNew(event, eventDef, ocpFunction);
	ocpFunction.processFunctionExecution(oFF.SyncType.NON_BLOCKING, this, null);
};
oFF.SphereClient.prototype.sendMoveEvent = function(event, eventDef)
{
	var ocpFunction = this.prepareEventFunction();
	this.prepareUiEventNew(event, eventDef, ocpFunction);
	ocpFunction.processFunctionExecution(oFF.SyncType.NON_BLOCKING, this, null);
};
oFF.SphereClient.prototype.sendDropEvent = function(event, eventDef)
{
	var ocpFunction = this.prepareEventFunction();
	var singleEvent = this.prepareUiEventNew(event, eventDef, ocpFunction);
	try
	{
		this.addControlRef(singleEvent, event.getDraggedControl());
		this.addControlRef(singleEvent, event.getDroppedControl());
		if (event.getRelativeDropPosition() !== null)
		{
			singleEvent.addString(event.getRelativeDropPosition().getName());
		}
	}
	catch (e)
	{
		oFF.XLogger.println("[SphereClient] Warning - Expected a UIDropEvent! Sending limited event data!");
	}
	ocpFunction.processFunctionExecution(oFF.SyncType.NON_BLOCKING, this, null);
};
oFF.SphereClient.prototype.sendItemEvent = function(event, eventDef)
{
	var ocpFunction = this.prepareEventFunction();
	var singleEvent = this.prepareUiEvent(event, eventDef, ocpFunction);
	try
	{
		this.addControlRef(singleEvent, event.getAffectedItem());
	}
	catch (e)
	{
		oFF.XLogger.println("[SphereClient] Warning - Expected a UIItemEvent! Sending limited event data!");
	}
	ocpFunction.processFunctionExecution(oFF.SyncType.NON_BLOCKING, this, null);
};
oFF.SphereClient.prototype.sendKeyboardEvent = function(event, eventDef)
{
	var ocpFunction = this.prepareEventFunction();
	this.prepareUiEventNew(event, eventDef, ocpFunction);
	ocpFunction.processFunctionExecution(oFF.SyncType.NON_BLOCKING, this, null);
};
oFF.SphereClient.prototype.passiveValueTransfer = function(eventList)
{
	var changedValueTransfer;
	changedValueTransfer = eventList.addNewList();
	changedValueTransfer.addString(oFF.UiRemoteProtocol.EV_ON_TRANSFER_START);
	var theId;
	var element;
	var item;
	var storageId;
	var capabilityName = oFF.UiType._SUPPORTS_TEXT_CHANGE;
	var select = this.selectByCapability(capabilityName);
	if (oFF.notNull(select) && select.hasNext())
	{
		var newText;
		var oldText;
		while (select.hasNext())
		{
			element = select.next();
			storageId = this.createStorageId(element.getId(), capabilityName);
			newText = element.getText();
			oldText = this.m_passiveValues.getStringByKey(storageId);
			if (oFF.XString.isEqual(newText, oldText) === false)
			{
				changedValueTransfer = eventList.addNewList();
				this.addOperation(changedValueTransfer, oFF.UiRemoteProtocol.EV_ON_CHANGED_VALUE, element);
				changedValueTransfer.addString(oFF.UiProperty.TEXT.getSetterMethodName());
				changedValueTransfer.addString(newText);
			}
		}
	}
	capabilityName = oFF.UiType._SUPPORTS_CHECKED_CHANGE;
	select = this.selectByCapability(capabilityName);
	if (oFF.notNull(select) && select.hasNext())
	{
		var newChecked;
		var oldChecked;
		while (select.hasNext())
		{
			element = select.next();
			storageId = this.createStorageId(element.getId(), capabilityName);
			newChecked = element.isChecked();
			oldChecked = this.m_passiveValues.getBooleanByKeyExt(storageId, false);
			if (newChecked !== oldChecked)
			{
				changedValueTransfer = eventList.addNewList();
				this.addOperation(changedValueTransfer, oFF.UiRemoteProtocol.EV_ON_CHANGED_VALUE, element);
				changedValueTransfer.addString(oFF.UiProperty.CHECKED.getSetterMethodName());
				changedValueTransfer.addBoolean(element.isChecked());
			}
		}
	}
	capabilityName = oFF.UiType._SUPPORTS_PARTIALLY_CHECKED_CHANGE;
	select = this.selectByCapability(capabilityName);
	if (oFF.notNull(select) && select.hasNext())
	{
		var newPartiallyChecked;
		var oldPartiallyChecked;
		while (select.hasNext())
		{
			element = select.next();
			storageId = this.createStorageId(element.getId(), capabilityName);
			newPartiallyChecked = element.isPartiallyChecked();
			oldPartiallyChecked = this.m_passiveValues.getBooleanByKeyExt(storageId, false);
			if (newPartiallyChecked !== oldPartiallyChecked)
			{
				changedValueTransfer = eventList.addNewList();
				this.addOperation(changedValueTransfer, oFF.UiRemoteProtocol.EV_ON_CHANGED_VALUE, element);
				changedValueTransfer.addString(oFF.UiProperty.PARTIALLY_CHECKED.getSetterMethodName());
				changedValueTransfer.addBoolean(element.isPartiallyChecked());
			}
		}
	}
	capabilityName = oFF.UiType._SUPPORTS_ON_CHANGE;
	select = this.selectByCapability(capabilityName);
	if (oFF.notNull(select) && select.hasNext())
	{
		var newOn;
		var oldOn;
		while (select.hasNext())
		{
			element = select.next();
			storageId = this.createStorageId(element.getId(), capabilityName);
			newOn = element.isOn();
			oldOn = this.m_passiveValues.getBooleanByKeyExt(storageId, false);
			if (newOn !== oldOn)
			{
				changedValueTransfer = eventList.addNewList();
				this.addOperation(changedValueTransfer, oFF.UiRemoteProtocol.EV_ON_CHANGED_VALUE, element);
				changedValueTransfer.addString(oFF.UiProperty.ON.getSetterMethodName());
				changedValueTransfer.addBoolean(element.isOn());
			}
		}
	}
	capabilityName = oFF.UiType._SUPPORTS_SELECTED_CHANGE;
	select = this.selectByCapability(capabilityName);
	if (oFF.notNull(select) && select.hasNext())
	{
		var newSelected;
		var oldSelected;
		while (select.hasNext())
		{
			element = select.next();
			storageId = this.createStorageId(element.getId(), capabilityName);
			newSelected = element.isSelected();
			oldSelected = this.m_passiveValues.getBooleanByKeyExt(storageId, false);
			if (newSelected !== oldSelected)
			{
				changedValueTransfer = eventList.addNewList();
				this.addOperation(changedValueTransfer, oFF.UiRemoteProtocol.EV_ON_CHANGED_VALUE, element);
				changedValueTransfer.addString(oFF.UiProperty.SELECTED.getSetterMethodName());
				changedValueTransfer.addBoolean(element.isSelected());
			}
		}
	}
	capabilityName = oFF.UiType._SUPPORTS_EXPANDED_CHANGE;
	select = this.selectByCapability(capabilityName);
	if (oFF.notNull(select) && select.hasNext())
	{
		var newExpanded;
		var oldExpanded;
		while (select.hasNext())
		{
			element = select.next();
			storageId = this.createStorageId(element.getId(), capabilityName);
			newExpanded = element.isExpanded();
			oldExpanded = this.m_passiveValues.getBooleanByKeyExt(storageId, false);
			if (newExpanded !== oldExpanded)
			{
				changedValueTransfer = eventList.addNewList();
				this.addOperation(changedValueTransfer, oFF.UiRemoteProtocol.EV_ON_CHANGED_VALUE, element);
				changedValueTransfer.addString(oFF.UiProperty.EXPANDED.getSetterMethodName());
				changedValueTransfer.addBoolean(element.isExpanded());
			}
		}
	}
	capabilityName = oFF.UiType._SUPPORTS_VALUE_CHANGE;
	select = this.selectByCapability(capabilityName);
	if (oFF.notNull(select) && select.hasNext())
	{
		var newValue;
		var oldValue;
		while (select.hasNext())
		{
			element = select.next();
			storageId = this.createStorageId(element.getId(), capabilityName);
			newValue = element.getValue();
			oldValue = this.m_passiveValues.getStringByKey(storageId);
			if (oFF.XString.isEqual(newValue, oldValue) === false)
			{
				changedValueTransfer = eventList.addNewList();
				this.addOperation(changedValueTransfer, oFF.UiRemoteProtocol.EV_ON_CHANGED_VALUE, element);
				changedValueTransfer.addString(oFF.UiProperty.VALUE.getSetterMethodName());
				changedValueTransfer.addString(newValue);
			}
		}
	}
	capabilityName = oFF.UiType._SUPPORTS_SLIDER_VALUE_CHANGE;
	select = this.selectByCapability(capabilityName);
	if (oFF.notNull(select) && select.hasNext())
	{
		var newSliderValue;
		var oldSliderValue;
		while (select.hasNext())
		{
			element = select.next();
			storageId = this.createStorageId(element.getId(), capabilityName);
			newSliderValue = element.getSliderValue();
			oldSliderValue = this.m_passiveValues.getIntegerByKeyExt(storageId, -1);
			if (newSliderValue !== oldSliderValue)
			{
				changedValueTransfer = eventList.addNewList();
				this.addOperation(changedValueTransfer, oFF.UiRemoteProtocol.EV_ON_CHANGED_VALUE, element);
				changedValueTransfer.addString(oFF.UiProperty.SLIDER_VALUE.getSetterMethodName());
				changedValueTransfer.addInteger(element.getSliderValue());
			}
		}
	}
	capabilityName = oFF.UiType._SUPPORTS_RANGE_SLIDER_VALUE_CHANGE;
	select = this.selectByCapability(capabilityName);
	if (oFF.notNull(select) && select.hasNext())
	{
		var newSliderUpperValue;
		var oldSliderUpperValue;
		while (select.hasNext())
		{
			element = select.next();
			storageId = this.createStorageId(element.getId(), capabilityName);
			newSliderUpperValue = element.getSliderUpperValue();
			oldSliderUpperValue = this.m_passiveValues.getIntegerByKeyExt(storageId, -1);
			if (newSliderUpperValue !== oldSliderUpperValue)
			{
				changedValueTransfer = eventList.addNewList();
				this.addOperation(changedValueTransfer, oFF.UiRemoteProtocol.EV_ON_CHANGED_VALUE, element);
				changedValueTransfer.addString(oFF.UiProperty.SLIDER_UPPER_VALUE.getSetterMethodName());
				changedValueTransfer.addInteger(element.getSliderUpperValue());
			}
		}
	}
	capabilityName = oFF.UiType._SUPPORTS_COMMAND_HISTORY_CHANGE;
	select = this.selectByCapability(capabilityName);
	if (oFF.notNull(select) && select.hasNext())
	{
		var newCommandHistory;
		var oldCommandHistory;
		while (select.hasNext())
		{
			element = select.next();
			storageId = this.createStorageId(element.getId(), capabilityName);
			newCommandHistory = this.createStringFromListOfStrings(element.getCommandHistory());
			oldCommandHistory = this.m_passiveValues.getStringByKeyExt(storageId, "");
			if (oFF.XString.isEqual(newCommandHistory, oldCommandHistory) === false)
			{
				changedValueTransfer = eventList.addNewList();
				this.addOperation(changedValueTransfer, oFF.UiRemoteProtocol.EV_ON_CHANGED_VALUE, element);
				changedValueTransfer.addString(oFF.UiProperty.COMMAND_HISTORY.getSetterMethodName());
				changedValueTransfer.addString(newCommandHistory);
			}
		}
	}
	capabilityName = oFF.UiType._SUPPORTS_VISIBLE_ROW_COUNT_CHANGE;
	select = this.selectByCapability(capabilityName);
	if (oFF.notNull(select) && select.hasNext())
	{
		var newVisibleRowCount;
		var oldVisibleRowCount;
		while (select.hasNext())
		{
			element = select.next();
			storageId = this.createStorageId(element.getId(), capabilityName);
			newVisibleRowCount = element.getVisibleRowCount();
			oldVisibleRowCount = this.m_passiveValues.getIntegerByKeyExt(storageId, -1);
			if (newVisibleRowCount !== oldVisibleRowCount)
			{
				changedValueTransfer = eventList.addNewList();
				this.addOperation(changedValueTransfer, oFF.UiRemoteProtocol.EV_ON_CHANGED_VALUE, element);
				changedValueTransfer.addString(oFF.UiProperty.VISIBLE_ROW_COUNT.getSetterMethodName());
				changedValueTransfer.addInteger(newVisibleRowCount);
			}
		}
	}
	capabilityName = oFF.UiType._SUPPORTS_FIRST_VISIBLE_ROW_CHANGE;
	select = this.selectByCapability(capabilityName);
	if (oFF.notNull(select) && select.hasNext())
	{
		var newFirstVisibleRowId;
		var oldFirstVisibleRowId;
		while (select.hasNext())
		{
			element = select.next();
			storageId = this.createStorageId(element.getId(), capabilityName);
			var firstVisibleRow = element.getFirstVisibleRow();
			if (oFF.notNull(firstVisibleRow))
			{
				newFirstVisibleRowId = firstVisibleRow.getId();
				oldFirstVisibleRowId = this.m_passiveValues.getStringByKey(storageId);
				if (oFF.XString.isEqual(newFirstVisibleRowId, oldFirstVisibleRowId) === false)
				{
					changedValueTransfer = eventList.addNewList();
					this.addOperation(changedValueTransfer, oFF.UiRemoteProtocol.EV_ON_CHANGED_VALUE, element);
					changedValueTransfer.addString(oFF.UiProperty.FIRST_VISIBLE_ROW.getSetterMethodName());
					theId = newFirstVisibleRowId;
					theId = this.lookupServerId(theId);
					changedValueTransfer.addString(theId);
				}
			}
		}
	}
	capabilityName = oFF.UiType._SUPPORTS_NAVIGATION_PAGES_CHANGE;
	select = this.selectByCapability(capabilityName);
	if (oFF.notNull(select) && select.hasNext())
	{
		var newNavigationPages;
		var oldNavigationPages;
		while (select.hasNext())
		{
			element = select.next();
			storageId = this.createStorageId(element.getId(), capabilityName);
			newNavigationPages = this.createControlIdsStringFromList(element.getPages());
			oldNavigationPages = this.m_passiveValues.getStringByKey(storageId);
			if (oFF.XString.isEqual(newNavigationPages, oldNavigationPages) === false)
			{
				var newNavPagesList = oFF.XStringTokenizer.splitString(newNavigationPages, oFF.UiRemoteProtocol.MULTI_ITEM_SEPARATOR);
				var oldNavPagesList = oFF.XStringTokenizer.splitString(oldNavigationPages, oFF.UiRemoteProtocol.MULTI_ITEM_SEPARATOR);
				if (oFF.isNull(newNavPagesList))
				{
					newNavPagesList = oFF.XListOfString.create();
				}
				if (oFF.isNull(oldNavPagesList))
				{
					oldNavPagesList = oFF.XListOfString.create();
				}
				if (newNavPagesList.size() < oldNavPagesList.size())
				{
					changedValueTransfer = eventList.addNewList();
					for (var b = 0; b < oldNavPagesList.size(); b++)
					{
						var tmpControlId = oldNavPagesList.get(b);
						if (newNavPagesList.contains(tmpControlId) === false)
						{
							this.addOperation(changedValueTransfer, oFF.UiRemoteProtocol.EV_ON_CHANGED_VALUE, element);
							changedValueTransfer.addString(oFF.UiAggregation.PAGES.getRemoveMethodName());
							changedValueTransfer.addString(tmpControlId);
						}
					}
				}
				this.m_passiveValues.putString(storageId, newNavigationPages);
			}
		}
	}
	capabilityName = oFF.UiType._SUPPORTS_START_DATE_CHANGE;
	select = this.selectByCapability(capabilityName);
	if (oFF.notNull(select) && select.hasNext())
	{
		var newStartDate;
		var oldStartDate;
		while (select.hasNext())
		{
			element = select.next();
			storageId = this.createStorageId(element.getId(), capabilityName);
			newStartDate = element.getStartDate();
			oldStartDate = this.m_passiveValues.getStringByKey(storageId);
			if (oFF.XString.isEqual(newStartDate, oldStartDate) === false)
			{
				changedValueTransfer = eventList.addNewList();
				this.addOperation(changedValueTransfer, oFF.UiRemoteProtocol.EV_ON_CHANGED_VALUE, element);
				changedValueTransfer.addString(oFF.UiProperty.START_DATE.getSetterMethodName());
				changedValueTransfer.addString(newStartDate);
			}
		}
	}
	capabilityName = oFF.UiType._SUPPORTS_END_DATE_CHANGE;
	select = this.selectByCapability(capabilityName);
	if (oFF.notNull(select) && select.hasNext())
	{
		var newEndDate;
		var oldEndDate;
		while (select.hasNext())
		{
			element = select.next();
			storageId = this.createStorageId(element.getId(), capabilityName);
			newEndDate = element.getEndDate();
			oldEndDate = this.m_passiveValues.getStringByKey(storageId);
			if (oFF.XString.isEqual(newEndDate, oldEndDate) === false)
			{
				changedValueTransfer = eventList.addNewList();
				this.addOperation(changedValueTransfer, oFF.UiRemoteProtocol.EV_ON_CHANGED_VALUE, element);
				changedValueTransfer.addString(oFF.UiProperty.END_DATE.getSetterMethodName());
				changedValueTransfer.addString(newEndDate);
			}
		}
	}
	capabilityName = oFF.UiType._SUPPORTS_PRESSED_CHANGE;
	select = this.selectByCapability(capabilityName);
	if (oFF.notNull(select) && select.hasNext())
	{
		var newPressed;
		var oldPressed;
		while (select.hasNext())
		{
			element = select.next();
			storageId = this.createStorageId(element.getId(), capabilityName);
			newPressed = element.isPressed();
			oldPressed = this.m_passiveValues.getBooleanByKeyExt(storageId, false);
			if (newPressed !== oldPressed)
			{
				changedValueTransfer = eventList.addNewList();
				this.addOperation(changedValueTransfer, oFF.UiRemoteProtocol.EV_ON_CHANGED_VALUE, element);
				changedValueTransfer.addString(oFF.UiProperty.PRESSED.getSetterMethodName());
				changedValueTransfer.addBoolean(element.isPressed());
			}
		}
	}
	capabilityName = oFF.UiType._SUPPORTS_SELECTED_ITEM;
	select = this.selectByCapability(capabilityName);
	if (oFF.notNull(select) && select.hasNext())
	{
		var newSelectedId;
		var oldSelectedId;
		while (select.hasNext())
		{
			element = select.next();
			storageId = this.createStorageId(element.getId(), capabilityName);
			item = element.getSelectedItem();
			if (oFF.notNull(item))
			{
				newSelectedId = item.getId();
				oldSelectedId = this.m_passiveValues.getStringByKey(storageId);
				if (oFF.XString.isEqual(newSelectedId, oldSelectedId) === false)
				{
					changedValueTransfer = eventList.addNewList();
					this.addOperation(changedValueTransfer, oFF.UiRemoteProtocol.EV_ON_CHANGED_VALUE, element);
					changedValueTransfer.addString(oFF.UiRemoteProtocol.OP_SET_SELECTED_ITEM);
					theId = newSelectedId;
					theId = this.lookupServerId(theId);
					changedValueTransfer.addString(theId);
				}
			}
		}
	}
	capabilityName = oFF.UiType._SUPPORTS_SELECTED_ITEMS;
	select = this.selectByCapability(capabilityName);
	if (oFF.notNull(select) && select.hasNext())
	{
		while (select.hasNext())
		{
			element = select.next();
			storageId = this.createStorageId(element.getId(), capabilityName);
			var selectedItems = element.getSelectedItems();
			var newSelectedIds = this.createControlIdsStringFromList(selectedItems);
			var oldSelectedIds = this.m_passiveValues.getStringByKey(storageId);
			if (oFF.XString.isEqual(newSelectedIds, oldSelectedIds) === false)
			{
				changedValueTransfer = eventList.addNewList();
				this.addOperation(changedValueTransfer, oFF.UiRemoteProtocol.EV_ON_CHANGED_VALUE, element);
				changedValueTransfer.addString(oFF.UiRemoteProtocol.OP_SET_SELECTED_ITEMS);
				changedValueTransfer.addString(newSelectedIds);
			}
		}
	}
	capabilityName = oFF.UiType._SUPPORTS_OPEN_CHANGE;
	select = this.selectByCapability(capabilityName);
	if (oFF.notNull(select) && select.hasNext())
	{
		var newIsOpen;
		var oldIsOpen;
		while (select.hasNext())
		{
			element = select.next();
			storageId = this.createStorageId(element.getId(), capabilityName);
			newIsOpen = element.isOpen();
			oldIsOpen = this.m_passiveValues.getBooleanByKeyExt(storageId, false);
			if (newIsOpen !== oldIsOpen)
			{
				changedValueTransfer = eventList.addNewList();
				this.addOperation(changedValueTransfer, oFF.UiRemoteProtocol.EV_ON_READ_ONLY_PROPERTY_SYNC, element);
				changedValueTransfer.addString(oFF.UiProperty.OPEN.getName());
				changedValueTransfer.addBoolean(newIsOpen);
			}
		}
	}
	capabilityName = oFF.UiType._SUPPORTS_MAXIMIZED_CHANGE;
	select = this.selectByCapability(capabilityName);
	if (oFF.notNull(select) && select.hasNext())
	{
		var newIsMaximized;
		var oldIsMaximized;
		while (select.hasNext())
		{
			element = select.next();
			storageId = this.createStorageId(element.getId(), capabilityName);
			newIsMaximized = element.isMaximized();
			oldIsMaximized = this.m_passiveValues.getBooleanByKeyExt(storageId, false);
			if (newIsMaximized !== oldIsMaximized)
			{
				changedValueTransfer = eventList.addNewList();
				this.addOperation(changedValueTransfer, oFF.UiRemoteProtocol.EV_ON_READ_ONLY_PROPERTY_SYNC, element);
				changedValueTransfer.addString(oFF.UiProperty.MAXIMIZED.getName());
				changedValueTransfer.addBoolean(newIsMaximized);
			}
		}
	}
	capabilityName = oFF.UiType._SUPPORTS_HIDDEN_CHANGE;
	select = this.selectByCapability(capabilityName);
	if (oFF.notNull(select) && select.hasNext())
	{
		var newIsHidden;
		var oldIsHidden;
		while (select.hasNext())
		{
			element = select.next();
			storageId = this.createStorageId(element.getId(), capabilityName);
			newIsHidden = element.isHidden();
			oldIsHidden = this.m_passiveValues.getBooleanByKeyExt(storageId, false);
			if (newIsHidden !== oldIsHidden)
			{
				changedValueTransfer = eventList.addNewList();
				this.addOperation(changedValueTransfer, oFF.UiRemoteProtocol.EV_ON_READ_ONLY_PROPERTY_SYNC, element);
				changedValueTransfer.addString(oFF.UiProperty.HIDDEN.getName());
				changedValueTransfer.addBoolean(newIsHidden);
			}
		}
	}
	capabilityName = oFF.UiType._SUPPORTS_OFFSET_HEIGHT_CHANGE;
	select = this.selectByCapability(capabilityName);
	if (oFF.notNull(select) && select.hasNext())
	{
		var newOffsetHeight;
		var oldOffsetHeight;
		while (select.hasNext())
		{
			element = select.next();
			storageId = this.createStorageId(element.getId(), capabilityName);
			newOffsetHeight = element.getOffsetHeight();
			oldOffsetHeight = this.m_passiveValues.getIntegerByKeyExt(storageId, 0);
			if (newOffsetHeight !== oldOffsetHeight)
			{
				changedValueTransfer = eventList.addNewList();
				this.addOperation(changedValueTransfer, oFF.UiRemoteProtocol.EV_ON_READ_ONLY_PROPERTY_SYNC, element);
				changedValueTransfer.addString(oFF.UiProperty.OFFSET_HEIGHT.getName());
				changedValueTransfer.addInteger(newOffsetHeight);
			}
		}
	}
	capabilityName = oFF.UiType._SUPPORTS_OFFSET_WIDTH_CHANGE;
	select = this.selectByCapability(capabilityName);
	if (oFF.notNull(select) && select.hasNext())
	{
		var newOffsetWidth;
		var oldOffsetWidth;
		while (select.hasNext())
		{
			element = select.next();
			storageId = this.createStorageId(element.getId(), capabilityName);
			newOffsetWidth = element.getOffsetWidth();
			oldOffsetWidth = this.m_passiveValues.getIntegerByKeyExt(storageId, 0);
			if (newOffsetWidth !== oldOffsetWidth)
			{
				changedValueTransfer = eventList.addNewList();
				this.addOperation(changedValueTransfer, oFF.UiRemoteProtocol.EV_ON_READ_ONLY_PROPERTY_SYNC, element);
				changedValueTransfer.addString(oFF.UiProperty.OFFSET_WIDTH.getName());
				changedValueTransfer.addInteger(newOffsetWidth);
			}
		}
	}
	changedValueTransfer = eventList.addNewList();
	changedValueTransfer.addString(oFF.UiRemoteProtocol.EV_ON_TRANSFER_END);
};
oFF.SphereClient.prototype.collectPassiveValues = function()
{
	var element;
	var storageId;
	this.m_passiveValues = oFF.XProperties.create();
	var capabilityName = oFF.UiType._SUPPORTS_TEXT_CHANGE;
	var select = this.selectByCapability(capabilityName);
	if (oFF.notNull(select) && select.hasNext())
	{
		while (select.hasNext())
		{
			element = select.next();
			storageId = this.createStorageId(element.getId(), capabilityName);
			this.m_passiveValues.putString(storageId, element.getText());
		}
	}
	capabilityName = oFF.UiType._SUPPORTS_CHECKED_CHANGE;
	select = this.selectByCapability(capabilityName);
	if (oFF.notNull(select) && select.hasNext())
	{
		while (select.hasNext())
		{
			element = select.next();
			storageId = this.createStorageId(element.getId(), capabilityName);
			this.m_passiveValues.putBoolean(storageId, element.isChecked());
		}
	}
	capabilityName = oFF.UiType._SUPPORTS_PARTIALLY_CHECKED_CHANGE;
	select = this.selectByCapability(capabilityName);
	if (oFF.notNull(select) && select.hasNext())
	{
		while (select.hasNext())
		{
			element = select.next();
			storageId = this.createStorageId(element.getId(), capabilityName);
			this.m_passiveValues.putBoolean(storageId, element.isPartiallyChecked());
		}
	}
	capabilityName = oFF.UiType._SUPPORTS_ON_CHANGE;
	select = this.selectByCapability(capabilityName);
	if (oFF.notNull(select) && select.hasNext())
	{
		while (select.hasNext())
		{
			element = select.next();
			storageId = this.createStorageId(element.getId(), capabilityName);
			this.m_passiveValues.putBoolean(storageId, element.isOn());
		}
	}
	capabilityName = oFF.UiType._SUPPORTS_SELECTED_CHANGE;
	select = this.selectByCapability(capabilityName);
	if (oFF.notNull(select) && select.hasNext())
	{
		while (select.hasNext())
		{
			element = select.next();
			storageId = this.createStorageId(element.getId(), capabilityName);
			this.m_passiveValues.putBoolean(storageId, element.isSelected());
		}
	}
	capabilityName = oFF.UiType._SUPPORTS_EXPANDED_CHANGE;
	select = this.selectByCapability(capabilityName);
	if (oFF.notNull(select) && select.hasNext())
	{
		while (select.hasNext())
		{
			element = select.next();
			storageId = this.createStorageId(element.getId(), capabilityName);
			this.m_passiveValues.putBoolean(storageId, element.isExpanded());
		}
	}
	capabilityName = oFF.UiType._SUPPORTS_VALUE_CHANGE;
	select = this.selectByCapability(capabilityName);
	if (oFF.notNull(select) && select.hasNext())
	{
		while (select.hasNext())
		{
			element = select.next();
			storageId = this.createStorageId(element.getId(), capabilityName);
			this.m_passiveValues.putString(storageId, element.getValue());
		}
	}
	capabilityName = oFF.UiType._SUPPORTS_SLIDER_VALUE_CHANGE;
	select = this.selectByCapability(capabilityName);
	if (oFF.notNull(select) && select.hasNext())
	{
		while (select.hasNext())
		{
			element = select.next();
			storageId = this.createStorageId(element.getId(), capabilityName);
			this.m_passiveValues.putInteger(storageId, element.getSliderValue());
		}
	}
	capabilityName = oFF.UiType._SUPPORTS_RANGE_SLIDER_VALUE_CHANGE;
	select = this.selectByCapability(capabilityName);
	if (oFF.notNull(select) && select.hasNext())
	{
		while (select.hasNext())
		{
			element = select.next();
			storageId = this.createStorageId(element.getId(), capabilityName);
			this.m_passiveValues.putInteger(storageId, element.getSliderUpperValue());
		}
	}
	capabilityName = oFF.UiType._SUPPORTS_COMMAND_HISTORY_CHANGE;
	select = this.selectByCapability(capabilityName);
	if (oFF.notNull(select) && select.hasNext())
	{
		while (select.hasNext())
		{
			element = select.next();
			storageId = this.createStorageId(element.getId(), capabilityName);
			var commandsStr = this.createStringFromListOfStrings(element.getCommandHistory());
			this.m_passiveValues.putString(storageId, commandsStr);
		}
	}
	capabilityName = oFF.UiType._SUPPORTS_VISIBLE_ROW_COUNT_CHANGE;
	select = this.selectByCapability(capabilityName);
	if (oFF.notNull(select) && select.hasNext())
	{
		while (select.hasNext())
		{
			element = select.next();
			storageId = this.createStorageId(element.getId(), capabilityName);
			this.m_passiveValues.putInteger(storageId, element.getVisibleRowCount());
		}
	}
	capabilityName = oFF.UiType._SUPPORTS_FIRST_VISIBLE_ROW_CHANGE;
	select = this.selectByCapability(capabilityName);
	if (oFF.notNull(select) && select.hasNext())
	{
		var firstVisibleRow;
		while (select.hasNext())
		{
			element = select.next();
			firstVisibleRow = element.getFirstVisibleRow();
			if (oFF.notNull(firstVisibleRow))
			{
				storageId = this.createStorageId(element.getId(), capabilityName);
				this.m_passiveValues.putString(storageId, firstVisibleRow.getId());
			}
		}
	}
	capabilityName = oFF.UiType._SUPPORTS_NAVIGATION_PAGES_CHANGE;
	select = this.selectByCapability(capabilityName);
	if (oFF.notNull(select) && select.hasNext())
	{
		while (select.hasNext())
		{
			element = select.next();
			var navPagesIds = this.createControlIdsStringFromList(element.getPages());
			storageId = this.createStorageId(element.getId(), capabilityName);
			this.m_passiveValues.putString(storageId, navPagesIds);
		}
	}
	capabilityName = oFF.UiType._SUPPORTS_START_DATE_CHANGE;
	select = this.selectByCapability(capabilityName);
	if (oFF.notNull(select) && select.hasNext())
	{
		while (select.hasNext())
		{
			element = select.next();
			storageId = this.createStorageId(element.getId(), capabilityName);
			this.m_passiveValues.putString(storageId, element.getStartDate());
		}
	}
	capabilityName = oFF.UiType._SUPPORTS_END_DATE_CHANGE;
	select = this.selectByCapability(capabilityName);
	if (oFF.notNull(select) && select.hasNext())
	{
		while (select.hasNext())
		{
			element = select.next();
			storageId = this.createStorageId(element.getId(), capabilityName);
			this.m_passiveValues.putString(storageId, element.getEndDate());
		}
	}
	capabilityName = oFF.UiType._SUPPORTS_PRESSED_CHANGE;
	select = this.selectByCapability(capabilityName);
	if (oFF.notNull(select) && select.hasNext())
	{
		while (select.hasNext())
		{
			element = select.next();
			storageId = this.createStorageId(element.getId(), capabilityName);
			this.m_passiveValues.putBoolean(storageId, element.isPressed());
		}
	}
	capabilityName = oFF.UiType._SUPPORTS_SELECTED_ITEM;
	select = this.selectByCapability(capabilityName);
	if (oFF.notNull(select) && select.hasNext())
	{
		var item;
		while (select.hasNext())
		{
			element = select.next();
			item = element.getSelectedItem();
			if (oFF.notNull(item))
			{
				storageId = this.createStorageId(element.getId(), capabilityName);
				this.m_passiveValues.putString(storageId, item.getId());
			}
		}
	}
	capabilityName = oFF.UiType._SUPPORTS_SELECTED_ITEMS;
	select = this.selectByCapability(capabilityName);
	if (oFF.notNull(select) && select.hasNext())
	{
		while (select.hasNext())
		{
			element = select.next();
			var selectedItems = element.getSelectedItems();
			var selectedIds = this.createControlIdsStringFromList(selectedItems);
			storageId = this.createStorageId(element.getId(), capabilityName);
			this.m_passiveValues.putString(storageId, selectedIds);
		}
	}
	capabilityName = oFF.UiType._SUPPORTS_OPEN_CHANGE;
	select = this.selectByCapability(capabilityName);
	if (oFF.notNull(select) && select.hasNext())
	{
		while (select.hasNext())
		{
			element = select.next();
			storageId = this.createStorageId(element.getId(), capabilityName);
			this.m_passiveValues.putBoolean(storageId, element.isOpen());
		}
	}
	capabilityName = oFF.UiType._SUPPORTS_MAXIMIZED_CHANGE;
	select = this.selectByCapability(capabilityName);
	if (oFF.notNull(select) && select.hasNext())
	{
		while (select.hasNext())
		{
			element = select.next();
			storageId = this.createStorageId(element.getId(), capabilityName);
			this.m_passiveValues.putBoolean(storageId, element.isMaximized());
		}
	}
	capabilityName = oFF.UiType._SUPPORTS_HIDDEN_CHANGE;
	select = this.selectByCapability(capabilityName);
	if (oFF.notNull(select) && select.hasNext())
	{
		while (select.hasNext())
		{
			element = select.next();
			storageId = this.createStorageId(element.getId(), capabilityName);
			this.m_passiveValues.putBoolean(storageId, element.isHidden());
		}
	}
	capabilityName = oFF.UiType._SUPPORTS_OFFSET_HEIGHT_CHANGE;
	select = this.selectByCapability(capabilityName);
	if (oFF.notNull(select) && select.hasNext())
	{
		while (select.hasNext())
		{
			element = select.next();
			storageId = this.createStorageId(element.getId(), capabilityName);
			this.m_passiveValues.putInteger(storageId, element.getOffsetHeight());
		}
	}
	capabilityName = oFF.UiType._SUPPORTS_OFFSET_WIDTH_CHANGE;
	select = this.selectByCapability(capabilityName);
	if (oFF.notNull(select) && select.hasNext())
	{
		while (select.hasNext())
		{
			element = select.next();
			storageId = this.createStorageId(element.getId(), capabilityName);
			this.m_passiveValues.putInteger(storageId, element.getOffsetWidth());
		}
	}
};
oFF.SphereClient.prototype.selectByCapability = function(capabilityFlag)
{
	var uiTypeList = oFF.UiType.lookupByCapabilityFlag(capabilityFlag);
	if (oFF.isNull(uiTypeList) || uiTypeList.isEmpty())
	{
		return null;
	}
	var selectStatement = oFF.XStringBuffer.create();
	for (var i = 0; i < uiTypeList.size(); i++)
	{
		if (i > 0)
		{
			selectStatement.append(oFF.UiRemoteProtocol.MULTI_ITEM_SEPARATOR);
		}
		selectStatement.append("?");
		selectStatement.append(uiTypeList.get(i).getName());
	}
	var selection = selectStatement.toString();
	var select = this.getUiManager().select(selection);
	return select;
};
oFF.SphereClient.prototype.addOperation = function(paramList, opName, item)
{
	paramList.addString(opName);
	this.addControlRef(paramList, item);
};
oFF.SphereClient.prototype.addControlRef = function(paramList, item)
{
	var theId = null;
	var theName = null;
	if (oFF.notNull(item))
	{
		theId = item.getId();
		theId = this.lookupServerId(theId);
		theName = item.getName();
	}
	paramList.addString(theId);
	paramList.addString(theName);
};
oFF.SphereClient.prototype.createControlIdsStringFromList = function(controlList)
{
	if (oFF.isNull(controlList) || controlList.isEmpty())
	{
		return null;
	}
	var controlIdsBuffer = oFF.XStringBuffer.create();
	for (var a = 0; a < controlList.size(); a++)
	{
		var tmpControl = controlList.get(a);
		if (a > 0)
		{
			controlIdsBuffer.append(oFF.UiRemoteProtocol.MULTI_ITEM_SEPARATOR);
		}
		controlIdsBuffer.append(this.lookupServerId(tmpControl.getId()));
	}
	return controlIdsBuffer.toString();
};
oFF.SphereClient.prototype.createStringFromListOfStrings = function(listOfString)
{
	var stringBuffer = oFF.XStringBuffer.create();
	for (var a = 0; a < listOfString.size(); a++)
	{
		var tmpStr = listOfString.get(a);
		if (a > 0)
		{
			stringBuffer.append(oFF.UiRemoteProtocol.MULTI_ITEM_SEPARATOR);
		}
		stringBuffer.append(this.lookupServerId(tmpStr));
	}
	return stringBuffer.toString();
};
oFF.SphereClient.prototype.createStorageId = function(elementId, capabilityName)
{
	return oFF.XStringUtils.concatenate3(elementId, "_", capabilityName);
};
oFF.SphereClient.prototype.cleanupControlMappingAfterRelease = function(contextName)
{
	this.m_serverToClientMap.remove(contextName);
	var mappedClientId = null;
	var keysIterator = this.m_clientToServerMap.getKeysAsIteratorOfString();
	while (keysIterator.hasNext())
	{
		var tmpKey = keysIterator.next();
		var tmpValue = this.m_clientToServerMap.getByKey(tmpKey);
		if (oFF.XString.isEqual(contextName, tmpValue))
		{
			mappedClientId = tmpKey;
			break;
		}
	}
	this.m_clientToServerMap.remove(mappedClientId);
};
oFF.SphereClient.prototype.lookupServerId = function(clientId)
{
	var serverId = this.m_clientToServerMap.getByKey(clientId);
	if (oFF.notNull(serverId))
	{
		return serverId;
	}
	return clientId;
};
oFF.SphereClient.prototype.getContext = function(identifier)
{
	if (oFF.XStringUtils.isNullOrEmpty(identifier))
	{
		return null;
	}
	return this.m_serverToClientMap.getByKey(identifier);
};
oFF.SphereClient.prototype.onContextMenu = function(event)
{
	this.sendControlEvent(event, oFF.UiEvent.ON_CONTEXT_MENU);
};
oFF.SphereClient.prototype.onSelect = function(event)
{
	this.sendSelectionEvent(event, oFF.UiEvent.ON_SELECT);
};
oFF.SphereClient.prototype.onSelectionChange = function(event)
{
	this.sendSelectionEvent(event, oFF.UiEvent.ON_SELECTION_CHANGE);
};
oFF.SphereClient.prototype.onChange = function(event)
{
	this.sendControlEvent(event, oFF.UiEvent.ON_CHANGE);
};
oFF.SphereClient.prototype.onLiveChange = function(event)
{
	this.sendControlEvent(event, oFF.UiEvent.ON_LIVE_CHANGE);
};
oFF.SphereClient.prototype.onClick = function(event)
{
	this.sendControlEvent(event, oFF.UiEvent.ON_CLICK);
};
oFF.SphereClient.prototype.onDoubleClick = function(event)
{
	this.sendControlEvent(event, oFF.UiEvent.ON_DOUBLE_CLICK);
};
oFF.SphereClient.prototype.onOpen = function(event)
{
	this.sendControlEvent(event, oFF.UiEvent.ON_OPEN);
};
oFF.SphereClient.prototype.onClose = function(event)
{
	this.sendControlEvent(event, oFF.UiEvent.ON_CLOSE);
};
oFF.SphereClient.prototype.onBeforeOpen = function(event)
{
	this.sendControlEvent(event, oFF.UiEvent.ON_BEFORE_OPEN);
};
oFF.SphereClient.prototype.onBeforeClose = function(event)
{
	this.sendControlEvent(event, oFF.UiEvent.ON_BEFORE_CLOSE);
};
oFF.SphereClient.prototype.onAfterOpen = function(event)
{
	this.sendControlEvent(event, oFF.UiEvent.ON_AFTER_OPEN);
};
oFF.SphereClient.prototype.onAfterClose = function(event)
{
	this.sendControlEvent(event, oFF.UiEvent.ON_AFTER_CLOSE);
};
oFF.SphereClient.prototype.onCollapse = function(event)
{
	this.sendItemEvent(event, oFF.UiEvent.ON_COLLAPSE);
};
oFF.SphereClient.prototype.onExpand = function(event)
{
	this.sendItemEvent(event, oFF.UiEvent.ON_EXPAND);
};
oFF.SphereClient.prototype.onEnter = function(event)
{
	this.sendControlEvent(event, oFF.UiEvent.ON_ENTER);
};
oFF.SphereClient.prototype.onPress = function(event)
{
	if (this.didPressExitMenuItem(event))
	{
		this.terminate();
	}
	else
	{
		this.sendControlEvent(event, oFF.UiEvent.ON_PRESS);
	}
};
oFF.SphereClient.prototype.onEditingBegin = function(event)
{
	this.sendControlEvent(event, oFF.UiEvent.ON_EDITING_BEGIN);
};
oFF.SphereClient.prototype.onEditingEnd = function(event)
{
	this.sendControlEvent(event, oFF.UiEvent.ON_EDITING_END);
};
oFF.SphereClient.prototype.onBack = function(event)
{
	this.sendControlEvent(event, oFF.UiEvent.ON_BACK);
};
oFF.SphereClient.prototype.onRefresh = function(event)
{
	this.sendControlEvent(event, oFF.UiEvent.ON_REFRESH);
};
oFF.SphereClient.prototype.onLoadFinished = function(event)
{
	this.sendControlEvent(event, oFF.UiEvent.ON_LOAD_FINISHED);
};
oFF.SphereClient.prototype.onDelete = function(event)
{
	this.sendItemEvent(event, oFF.UiEvent.ON_DELETE);
};
oFF.SphereClient.prototype.onDetailPress = function(event)
{
	this.sendControlEvent(event, oFF.UiEvent.ON_DETAIL_PRESS);
};
oFF.SphereClient.prototype.onMove = function(event)
{
	this.sendMoveEvent(event, oFF.UiEvent.ON_MOVE);
};
oFF.SphereClient.prototype.onMoveStart = function(event)
{
	this.sendMoveEvent(event, oFF.UiEvent.ON_MOVE_START);
};
oFF.SphereClient.prototype.onMoveEnd = function(event)
{
	this.sendMoveEvent(event, oFF.UiEvent.ON_MOVE_END);
};
oFF.SphereClient.prototype.onResize = function(event)
{
	this.sendResizeEvent(event, oFF.UiEvent.ON_RESIZE);
};
oFF.SphereClient.prototype.onSuggestionSelect = function(event)
{
	this.sendSelectionEvent(event, oFF.UiEvent.ON_SUGGESTION_SELECT);
};
oFF.SphereClient.prototype.onScroll = function(event)
{
	this.sendControlEvent(event, oFF.UiEvent.ON_SCROLL);
};
oFF.SphereClient.prototype.onScrollLoad = function(event)
{
	this.sendControlEvent(event, oFF.UiEvent.ON_SCROLL_LOAD);
};
oFF.SphereClient.prototype.onHover = function(event)
{
	this.sendControlEvent(event, oFF.UiEvent.ON_HOVER);
};
oFF.SphereClient.prototype.onHoverEnd = function(event)
{
	this.sendControlEvent(event, oFF.UiEvent.ON_HOVER_END);
};
oFF.SphereClient.prototype.onPaste = function(event)
{
	this.sendControlEvent(event, oFF.UiEvent.ON_PASTE);
};
oFF.SphereClient.prototype.onSelectionFinish = function(event)
{
	this.sendSelectionEvent(event, oFF.UiEvent.ON_SELECTION_FINISH);
};
oFF.SphereClient.prototype.onSearch = function(event)
{
	this.sendControlEvent(event, oFF.UiEvent.ON_SEARCH);
};
oFF.SphereClient.prototype.onButtonPress = function(event)
{
	this.sendControlEvent(event, oFF.UiEvent.ON_BUTTON_PRESS);
};
oFF.SphereClient.prototype.onError = function(event)
{
	this.sendControlEvent(event, oFF.UiEvent.ON_ERROR);
};
oFF.SphereClient.prototype.onReadLineFinished = function(event)
{
	this.sendControlEvent(event, oFF.UiEvent.ON_READ_LINE_FINISHED);
};
oFF.SphereClient.prototype.onExecute = function(event)
{
	this.sendControlEvent(event, oFF.UiEvent.ON_EXECUTE);
};
oFF.SphereClient.prototype.onTerminate = function(event)
{
	this.sendControlEvent(event, oFF.UiEvent.ON_TERMINATE);
};
oFF.SphereClient.prototype.onFileDrop = function(event)
{
	this.sendControlEvent(event, oFF.UiEvent.ON_FILE_DROP);
};
oFF.SphereClient.prototype.onDrop = function(event)
{
	this.sendDropEvent(event, oFF.UiEvent.ON_DROP);
};
oFF.SphereClient.prototype.onItemClose = function(event)
{
	this.sendItemEvent(event, oFF.UiEvent.ON_ITEM_CLOSE);
};
oFF.SphereClient.prototype.onItemSelect = function(event)
{
	this.sendItemEvent(event, oFF.UiEvent.ON_ITEM_SELECT);
};
oFF.SphereClient.prototype.onTableDragAndDrop = function(event)
{
	this.sendControlEvent(event, oFF.UiEvent.ON_TABLE_DRAG_AND_DROP);
};
oFF.SphereClient.prototype.onMenuPress = function(event)
{
	this.sendControlEvent(event, oFF.UiEvent.ON_MENU_PRESS);
};
oFF.SphereClient.prototype.onValueHelpRequest = function(event)
{
	this.sendControlEvent(event, oFF.UiEvent.ON_VALUE_HELP_REQUEST);
};
oFF.SphereClient.prototype.onColumnResize = function(event)
{
	this.sendControlEvent(event, oFF.UiEvent.ON_COLUMN_RESIZE);
};
oFF.SphereClient.prototype.onRowResize = function(event)
{
	this.sendControlEvent(event, oFF.UiEvent.ON_ROW_RESIZE);
};
oFF.SphereClient.prototype.onItemPress = function(event)
{
	this.sendControlEvent(event, oFF.UiEvent.ON_ITEM_PRESS);
};
oFF.SphereClient.prototype.onDragStart = function(event)
{
	this.sendControlEvent(event, oFF.UiEvent.ON_DRAG_START);
};
oFF.SphereClient.prototype.onDragEnd = function(event)
{
	this.sendControlEvent(event, oFF.UiEvent.ON_DRAG_END);
};
oFF.SphereClient.prototype.onEscape = function(event)
{
	this.sendControlEvent(event, oFF.UiEvent.ON_ESCAPE);
};
oFF.SphereClient.prototype.onKeyDown = function(event)
{
	this.sendKeyboardEvent(event, oFF.UiEvent.ON_KEY_DOWN);
};
oFF.SphereClient.prototype.onKeyUp = function(event)
{
	this.sendKeyboardEvent(event, oFF.UiEvent.ON_KEY_UP);
};

oFF.UiServerManager = function() {};
oFF.UiServerManager.prototype = new oFF.DfUiManager();
oFF.UiServerManager.prototype._ff_c = "UiServerManager";

oFF.UiServerManager.VIRTUAL_ROOT_NAME = "virtualRoot";
oFF.UiServerManager.create = function(session, remotePlatform)
{
	var newObj = new oFF.UiServerManager();
	newObj.setupServerUiManager(session, remotePlatform);
	return newObj;
};
oFF.UiServerManager.prototype.m_operations = null;
oFF.UiServerManager.prototype.m_idCounter = 0;
oFF.UiServerManager.prototype.m_serverBase = null;
oFF.UiServerManager.prototype.m_clientBase = null;
oFF.UiServerManager.prototype.m_uiTypeCapabilityFlags = null;
oFF.UiServerManager.prototype.m_remotePlatform = null;
oFF.UiServerManager.prototype.m_fragment = null;
oFF.UiServerManager.prototype.setupServerUiManager = function(session, remotePlatform)
{
	oFF.DfUiManager.prototype.setupSessionContext.call( this , session);
	this.m_remotePlatform = remotePlatform;
	this.setNativeAnchor(oFF.UiServerManager.VIRTUAL_ROOT_NAME, "$root$", null);
	this.m_uiTypeCapabilityFlags = oFF.XHashMapByString.create();
	this.m_operations = oFF.PrFactory.createList();
	this.m_fragment = oFF.NetworkEnv.getFragment();
	var allUiTypes = oFF.UiType.getAllUiTypes();
	while (allUiTypes.hasNext())
	{
		var currentType = allUiTypes.next();
		if (currentType.isComposite() === false)
		{
			currentType.setFactory(oFF.UiServerControl.createUiFactory());
		}
	}
};
oFF.UiServerManager.prototype.releaseObject = function()
{
	oFF.DfUiManager.prototype.releaseObject.call( this );
};
oFF.UiServerManager.prototype.getAnchorWrapperId = function(originId)
{
	return originId;
};
oFF.UiServerManager.prototype.serializeUiTree = function()
{
	var anchor = oFF.DfUiManager.prototype.getAnchor.call( this );
	var anchorStructure = oFF.UiUtils.exportToStructure(anchor);
	return anchorStructure;
};
oFF.UiServerManager.prototype.exportHtml = function(template)
{
	var root = oFF.DfUiManager.prototype.getAnchor.call( this );
	var htmldoc = oFF.UiUtils.exportToHtml(root, template);
	return htmldoc;
};
oFF.UiServerManager.prototype.getAnchor = function()
{
	var root = this.getAnchorByName(oFF.UiServerManager.VIRTUAL_ROOT_NAME);
	this.addOperation(null, oFF.UiRemoteProtocol.OP_GET_ROOT, root);
	return root;
};
oFF.UiServerManager.prototype.addOperation1String = function(object, name, param0)
{
	var operation = this.addOperation(object, name, null);
	operation.addString(param0);
	return operation;
};
oFF.UiServerManager.prototype.addOperation1Int = function(object, name, param0)
{
	var operation = this.addOperation(object, name, null);
	operation.addInteger(param0);
	return operation;
};
oFF.UiServerManager.prototype.addOperation1Double = function(object, name, param0)
{
	var operation = this.addOperation(object, name, null);
	operation.addDouble(param0);
	return operation;
};
oFF.UiServerManager.prototype.addOperation1Boolean = function(object, name, param0)
{
	var operation = this.addOperation(object, name, null);
	operation.addBoolean(param0);
	return operation;
};
oFF.UiServerManager.prototype.addOperation1Element = function(object, name, param0)
{
	var operation = this.addOperation(object, name, null);
	operation.add(param0);
	return operation;
};
oFF.UiServerManager.prototype.addOperation1Context = function(object, name, param0)
{
	var operation = this.addOperation(object, name, null);
	if (oFF.notNull(param0))
	{
		operation.addString(param0.getId());
	}
	else
	{
		operation.addString(null);
	}
	return operation;
};
oFF.UiServerManager.prototype.addOperation = function(context, methodName, returnContext)
{
	var operation = null;
	if (this.m_callLevel === 0)
	{
		operation = this.m_operations.addNewList();
	}
	else
	{
		operation = oFF.PrFactory.createList();
	}
	operation.addString(methodName);
	if (oFF.notNull(context))
	{
		operation.addString(context.getId());
	}
	else
	{
		operation.addString(null);
	}
	if (oFF.notNull(returnContext))
	{
		operation.addString(returnContext.getId());
	}
	else
	{
		operation.addString(null);
	}
	return operation;
};
oFF.UiServerManager.prototype.fetchCommandSequence = function()
{
	var currentSequence = this.m_operations;
	this.m_operations = oFF.PrFactory.createList();
	return currentSequence;
};
oFF.UiServerManager.prototype.getNextId = function()
{
	var retId = oFF.XInteger.convertToString(this.m_idCounter);
	this.m_idCounter++;
	return retId;
};
oFF.UiServerManager.prototype.setResourceLocations = function(serverBase, clientBase)
{
	this.m_serverBase = serverBase;
	this.m_clientBase = clientBase;
	if (oFF.notNull(clientBase))
	{
		var env = this.getSession().getEnvironment();
		var targetUri = oFF.XUri.createChild(clientBase, "production/resources/");
		var targetUrl = targetUri.getUrlExt(true, true, true, true, false, true, true, false, false);
		env.setVariable(oFF.XEnvironmentConstants.FIREFLY_MIMES, targetUrl);
	}
};
oFF.UiServerManager.prototype.adaptResourceUri = function(uri)
{
	if (oFF.isNull(uri))
	{
		return null;
	}
	if (oFF.notNull(this.m_serverBase) && oFF.notNull(this.m_clientBase))
	{
		if (this.m_serverBase.getProtocolType() === uri.getProtocolType())
		{
			var serverBasePath = this.m_serverBase.getPath();
			var path = uri.getPath();
			if (oFF.XString.startsWith(path, serverBasePath))
			{
				var size = oFF.XString.size(serverBasePath);
				var relative = oFF.XString.substring(path, size + 1, -1);
				var clientUri = oFF.XUri.createFromParentUriAndRelativeUrl(this.m_clientBase, relative, false);
				return clientUri.getUrl();
			}
		}
	}
	return uri.getUrl();
};
oFF.UiServerManager.prototype.doMasterPostprocessing = function(uiElement)
{
	if (oFF.notNull(uiElement))
	{
		var uiType = uiElement.getUiType();
		if (uiType !== oFF.UiType.ROOT)
		{
			var prOperation = this.addOperation(null, oFF.UiRemoteProtocol.OP_NEW_UI_CONTROL, uiElement);
			var theId = uiElement.getId();
			var name = uiElement.getName();
			prOperation.addString(theId);
			prOperation.addString(name);
			prOperation.addString(uiType.getName());
			var uiStyleClass = uiElement.getUiStyleClass();
			if (oFF.notNull(uiStyleClass))
			{
				prOperation.addString(uiStyleClass.getName());
			}
			else
			{
				prOperation.addString(null);
			}
			if (uiElement.isCompositeControl())
			{
				this.addOperation1Context(uiElement, oFF.UiRemoteProtocol.OP_SET_BASE_CONTROL, uiElement.getBaseControl());
			}
		}
	}
};
oFF.UiServerManager.prototype.setUiTypeCapabilityFlag = function(uiType, flag)
{
	var set = this.m_uiTypeCapabilityFlags.getByKey(uiType);
	if (oFF.isNull(set))
	{
		set = oFF.XHashSetOfString.create();
		this.m_uiTypeCapabilityFlags.put(uiType, set);
	}
	set.add(flag);
};
oFF.UiServerManager.prototype.hasUiTypeCapabilityFlag = function(uiType, flag)
{
	var set = this.m_uiTypeCapabilityFlags.getByKey(uiType);
	if (oFF.isNull(set))
	{
		return false;
	}
	return set.contains(flag);
};
oFF.UiServerManager.prototype.getPlatform = function()
{
	return this.m_remotePlatform;
};
oFF.UiServerManager.prototype.setTheme = function(themeName, themeBaseUrl)
{
	oFF.DfUiManager.prototype.setTheme.call( this , themeName, themeBaseUrl);
	var params = this.addOperation(null, oFF.UiRemoteProtocol.OP_UI_MGR_SET_THEME, null);
	if (oFF.notNull(params))
	{
		params.addString(themeName);
		params.addString(themeBaseUrl);
	}
};
oFF.UiServerManager.prototype.setRtl = function(enableRtl)
{
	oFF.DfUiManager.prototype.setRtl.call( this , enableRtl);
	var params = this.addOperation(null, oFF.UiRemoteProtocol.OP_UI_MGR_SET_RTL, null);
	if (oFF.notNull(params))
	{
		params.addBoolean(enableRtl);
	}
};
oFF.UiServerManager.prototype.setFragment = function(fragment)
{
	this.m_fragment = fragment;
	oFF.NetworkEnv.setFragment(fragment);
};
oFF.UiServerManager.prototype.getFragment = function()
{
	return this.m_fragment;
};

oFF.UiServerControl = function() {};
oFF.UiServerControl.prototype = new oFF.DfUiContext();
oFF.UiServerControl.prototype._ff_c = "UiServerControl";

oFF.UiServerControl.createUiFactory = function()
{
	return new oFF.UiServerControl();
};
oFF.UiServerControl.prototype.newInstance = function()
{
	var object = new oFF.UiServerControl();
	object.setup();
	return object;
};
oFF.UiServerControl.prototype.setup = function()
{
	oFF.DfUiContext.prototype.setup.call( this );
};
oFF.UiServerControl.prototype.releaseObject = function()
{
	this._addUIOperation(oFF.UiRemoteProtocol.OP_RELEASE_CONTROL);
	oFF.DfUiContext.prototype.releaseObject.call( this );
};
oFF.UiServerControl.prototype.getMasterNoCall = function()
{
	var master = null;
	if (oFF.notNull(this.m_uiManager))
	{
		master = this.m_uiManager.getMaster();
		if (oFF.notNull(master) && master.isExternalCall0() === false)
		{
			master = null;
		}
	}
	return master;
};
oFF.UiServerControl.prototype.setContent = function(content)
{
	oFF.DfUiContext.prototype.setContent.call( this , content);
	return this.addControlPropertyOperation(oFF.UiProperty.CONTENT, content);
};
oFF.UiServerControl.prototype.clearContent = function()
{
	oFF.DfUiContext.prototype.clearContent.call( this );
	this._addUIOperation(oFF.UiProperty.CONTENT.getClearMethodName());
};
oFF.UiServerControl.prototype.setFooter = function(footer)
{
	oFF.DfUiContext.prototype.setFooter.call( this , footer);
	return this.addControlPropertyOperation(oFF.UiProperty.FOOTER, footer);
};
oFF.UiServerControl.prototype.clearFooter = function()
{
	oFF.DfUiContext.prototype.clearFooter.call( this );
	this._addUIOperation(oFF.UiProperty.FOOTER.getClearMethodName());
	return this;
};
oFF.UiServerControl.prototype.setSubHeader = function(subHeader)
{
	oFF.DfUiContext.prototype.setSubHeader.call( this , subHeader);
	return this.addControlPropertyOperation(oFF.UiProperty.SUB_HEADER, subHeader);
};
oFF.UiServerControl.prototype.clearSubHeader = function()
{
	oFF.DfUiContext.prototype.clearSubHeader.call( this );
	this._addUIOperation(oFF.UiProperty.SUB_HEADER.getClearMethodName());
	return this;
};
oFF.UiServerControl.prototype.setHeader = function(header)
{
	oFF.DfUiContext.prototype.setHeader.call( this , header);
	return this.addControlPropertyOperation(oFF.UiProperty.HEADER, header);
};
oFF.UiServerControl.prototype.clearHeader = function()
{
	oFF.DfUiContext.prototype.clearHeader.call( this );
	this._addUIOperation(oFF.UiProperty.HEADER.getClearMethodName());
	return this;
};
oFF.UiServerControl.prototype.setNavList = function(navList)
{
	oFF.DfUiContext.prototype.setNavList.call( this , navList);
	return this.addControlPropertyOperation(oFF.UiProperty.NAV_LIST, navList);
};
oFF.UiServerControl.prototype.clearNavList = function()
{
	oFF.DfUiContext.prototype.clearNavList.call( this );
	this._addUIOperation(oFF.UiProperty.NAV_LIST.getClearMethodName());
	return this;
};
oFF.UiServerControl.prototype.setFixedNavList = function(navList)
{
	oFF.DfUiContext.prototype.setFixedNavList.call( this , navList);
	return this.addControlPropertyOperation(oFF.UiProperty.FIXED_NAV_LIST, navList);
};
oFF.UiServerControl.prototype.clearFixedNavList = function()
{
	oFF.DfUiContext.prototype.clearFixedNavList.call( this );
	this._addUIOperation(oFF.UiProperty.FIXED_NAV_LIST.getClearMethodName());
	return this;
};
oFF.UiServerControl.prototype.setText = function(text)
{
	oFF.DfUiContext.prototype.setText.call( this , text);
	return this.addStringPropertyOperation(oFF.UiProperty.TEXT, text);
};
oFF.UiServerControl.prototype.setSrc = function(src)
{
	oFF.DfUiContext.prototype.setSrc.call( this , src);
	return this.addStringPropertyOperation(oFF.UiProperty.SRC, src);
};
oFF.UiServerControl.prototype.setTitle = function(title)
{
	oFF.DfUiContext.prototype.setTitle.call( this , title);
	return this.addStringPropertyOperation(oFF.UiProperty.TITLE, title);
};
oFF.UiServerControl.prototype.setSubtitle = function(subtitle)
{
	oFF.DfUiContext.prototype.setSubtitle.call( this , subtitle);
	return this.addStringPropertyOperation(oFF.UiProperty.SUBTITLE, subtitle);
};
oFF.UiServerControl.prototype.setTextDecoration = function(textDecoration)
{
	oFF.DfUiContext.prototype.setTextDecoration.call( this , textDecoration);
	return this.addCssBasedPropertyOperation(oFF.UiProperty.TEXT_DECORATION, textDecoration);
};
oFF.UiServerControl.prototype.setSelected = function(selected)
{
	oFF.DfUiContext.prototype.setSelected.call( this , selected);
	return this.addBooleanPropertyOperation(oFF.UiProperty.SELECTED, selected);
};
oFF.UiServerControl.prototype.setColumnSpan = function(span)
{
	oFF.DfUiContext.prototype.setColumnSpan.call( this , span);
	return this.addIntegerPropertyOperation(oFF.UiProperty.COLUMN_SPAN, span);
};
oFF.UiServerControl.prototype.setRowSpan = function(span)
{
	oFF.DfUiContext.prototype.setRowSpan.call( this , span);
	return this.addIntegerPropertyOperation(oFF.UiProperty.ROW_SPAN, span);
};
oFF.UiServerControl.prototype.setExpanded = function(isExpanded)
{
	oFF.DfUiContext.prototype.setExpanded.call( this , isExpanded);
	return this.addBooleanPropertyOperation(oFF.UiProperty.EXPANDED, isExpanded);
};
oFF.UiServerControl.prototype.setChecked = function(checked)
{
	oFF.DfUiContext.prototype.setChecked.call( this , checked);
	return this.addBooleanPropertyOperation(oFF.UiProperty.CHECKED, checked);
};
oFF.UiServerControl.prototype.setNode = function(isNode)
{
	oFF.DfUiContext.prototype.setNode.call( this , isNode);
	return this.addBooleanPropertyOperation(oFF.UiProperty.NODE, isNode);
};
oFF.UiServerControl.prototype.setRowCount = function(rowCount)
{
	oFF.DfUiContext.prototype.setRowCount.call( this , rowCount);
	return this.addIntegerPropertyOperation(oFF.UiProperty.ROW_COUNT, rowCount);
};
oFF.UiServerControl.prototype.setColumnCount = function(columnCount)
{
	oFF.DfUiContext.prototype.setColumnCount.call( this , columnCount);
	return this.addIntegerPropertyOperation(oFF.UiProperty.COLUMN_COUNT, columnCount);
};
oFF.UiServerControl.prototype.setEnabled = function(enabled)
{
	oFF.DfUiContext.prototype.setEnabled.call( this , enabled);
	return this.addBooleanPropertyOperation(oFF.UiProperty.ENABLED, enabled);
};
oFF.UiServerControl.prototype.setEditable = function(editable)
{
	oFF.DfUiContext.prototype.setEditable.call( this , editable);
	return this.addBooleanPropertyOperation(oFF.UiProperty.EDITABLE, editable);
};
oFF.UiServerControl.prototype.setVisible = function(visible)
{
	oFF.DfUiContext.prototype.setVisible.call( this , visible);
	return this.addBooleanPropertyOperation(oFF.UiProperty.VISIBLE, visible);
};
oFF.UiServerControl.prototype.setCloseable = function(isCloseable)
{
	oFF.DfUiContext.prototype.setCloseable.call( this , isCloseable);
	return this.addBooleanPropertyOperation(oFF.UiProperty.CLOSEABLE, isCloseable);
};
oFF.UiServerControl.prototype.setSectionStart = function(sectionStart)
{
	oFF.DfUiContext.prototype.setSectionStart.call( this , sectionStart);
	return this.addBooleanPropertyOperation(oFF.UiProperty.SECTION_START, sectionStart);
};
oFF.UiServerControl.prototype.setModelJson = function(model)
{
	oFF.DfUiContext.prototype.setModelJson.call( this , model);
	return this.addJsonPropertyOperation(oFF.UiProperty.MODEL_JSON, model);
};
oFF.UiServerControl.prototype.setDataManifest = function(dataManifest)
{
	oFF.DfUiContext.prototype.setDataManifest.call( this , dataManifest);
	this.addJsonPropertyOperation(oFF.UiProperty.DATA_MANIFEST, dataManifest);
};
oFF.UiServerControl.prototype.setPadding = function(padding)
{
	oFF.DfUiContext.prototype.setPadding.call( this , padding);
	return this.addCssBasedPropertyOperation(oFF.UiProperty.PADDING, padding);
};
oFF.UiServerControl.prototype.setMargin = function(margin)
{
	oFF.DfUiContext.prototype.setMargin.call( this , margin);
	return this.addCssBasedPropertyOperation(oFF.UiProperty.MARGIN, margin);
};
oFF.UiServerControl.prototype.setFontSize = function(fontSize)
{
	oFF.DfUiContext.prototype.setFontSize.call( this , fontSize);
	return this.addCssBasedPropertyOperation(oFF.UiProperty.FONT_SIZE, fontSize);
};
oFF.UiServerControl.prototype.setIconSize = function(iconSize)
{
	oFF.DfUiContext.prototype.setIconSize.call( this , iconSize);
	return this.addCssBasedPropertyOperation(oFF.UiProperty.ICON_SIZE, iconSize);
};
oFF.UiServerControl.prototype.setCornerRadius = function(cornerRadius)
{
	oFF.DfUiContext.prototype.setCornerRadius.call( this , cornerRadius);
	return this.addCssBasedPropertyOperation(oFF.UiProperty.CORNER_RADIUS, cornerRadius);
};
oFF.UiServerControl.prototype.setBorderWidth = function(borderWidth)
{
	oFF.DfUiContext.prototype.setBorderWidth.call( this , borderWidth);
	return this.addCssBasedPropertyOperation(oFF.UiProperty.BORDER_WIDTH, borderWidth);
};
oFF.UiServerControl.prototype.setHeaderHeight = function(headerHeight)
{
	oFF.DfUiContext.prototype.setHeaderHeight.call( this , headerHeight);
	return this.addCssBasedPropertyOperation(oFF.UiProperty.HEADER_HEIGHT, headerHeight);
};
oFF.UiServerControl.prototype.setFooterHeight = function(footerHeight)
{
	oFF.DfUiContext.prototype.setFooterHeight.call( this , footerHeight);
	return this.addCssBasedPropertyOperation(oFF.UiProperty.FOOTER_HEIGHT, footerHeight);
};
oFF.UiServerControl.prototype.setSliderMinimum = function(minimum)
{
	oFF.DfUiContext.prototype.setSliderMinimum.call( this , minimum);
	return this.addIntegerPropertyOperation(oFF.UiProperty.SLIDER_MINIMUM, minimum);
};
oFF.UiServerControl.prototype.setSliderMaximum = function(maximum)
{
	oFF.DfUiContext.prototype.setSliderMaximum.call( this , maximum);
	return this.addIntegerPropertyOperation(oFF.UiProperty.SLIDER_MAXIMUM, maximum);
};
oFF.UiServerControl.prototype.setSliderStep = function(step)
{
	oFF.DfUiContext.prototype.setSliderStep.call( this , step);
	return this.addIntegerPropertyOperation(oFF.UiProperty.SLIDER_STEP, step);
};
oFF.UiServerControl.prototype.setSliderValue = function(value)
{
	oFF.DfUiContext.prototype.setSliderValue.call( this , value);
	return this.addIntegerPropertyOperation(oFF.UiProperty.SLIDER_VALUE, value);
};
oFF.UiServerControl.prototype.setSliderUpperValue = function(value)
{
	oFF.DfUiContext.prototype.setSliderUpperValue.call( this , value);
	return this.addIntegerPropertyOperation(oFF.UiProperty.SLIDER_UPPER_VALUE, value);
};
oFF.UiServerControl.prototype.setPlaceholder = function(placeholder)
{
	oFF.DfUiContext.prototype.setPlaceholder.call( this , placeholder);
	return this.addStringPropertyOperation(oFF.UiProperty.PLACEHOLDER, placeholder);
};
oFF.UiServerControl.prototype.setName = function(name)
{
	oFF.DfUiContext.prototype.setName.call( this , name);
	return this.addStringPropertyOperation(oFF.UiProperty.NAME, name);
};
oFF.UiServerControl.prototype.setInputType = function(inputType)
{
	oFF.DfUiContext.prototype.setInputType.call( this , inputType);
	return this.addConstantPropertyOperation(oFF.UiProperty.INPUT_TYPE, inputType);
};
oFF.UiServerControl.prototype.setValue = function(value)
{
	oFF.DfUiContext.prototype.setValue.call( this , value);
	return this.addStringPropertyOperation(oFF.UiProperty.VALUE, value);
};
oFF.UiServerControl.prototype.setDescription = function(description)
{
	oFF.DfUiContext.prototype.setDescription.call( this , description);
	return this.addStringPropertyOperation(oFF.UiProperty.DESCRIPTION, description);
};
oFF.UiServerControl.prototype.setTooltip = function(tooltip)
{
	oFF.DfUiContext.prototype.setTooltip.call( this , tooltip);
	return this.addStringPropertyOperation(oFF.UiProperty.TOOLTIP, tooltip);
};
oFF.UiServerControl.prototype.setIcon = function(icon)
{
	oFF.DfUiContext.prototype.setIcon.call( this , icon);
	return this.addStringPropertyOperation(oFF.UiProperty.ICON, icon);
};
oFF.UiServerControl.prototype.setListItemType = function(listItemType)
{
	oFF.DfUiContext.prototype.setListItemType.call( this , listItemType);
	return this.addConstantPropertyOperation(oFF.UiProperty.LIST_ITEM_TYPE, listItemType);
};
oFF.UiServerControl.prototype.setButtonType = function(buttonType)
{
	oFF.DfUiContext.prototype.setButtonType.call( this , buttonType);
	return this.addConstantPropertyOperation(oFF.UiProperty.BUTTON_TYPE, buttonType);
};
oFF.UiServerControl.prototype.setBackgroundImageSrc = function(src)
{
	oFF.DfUiContext.prototype.setBackgroundImageSrc.call( this , src);
	return this.addStringPropertyOperation(oFF.UiProperty.BACKGROUND_IMAGE_SRC, src);
};
oFF.UiServerControl.prototype.setRotation = function(rotation)
{
	oFF.DfUiContext.prototype.setRotation.call( this , rotation);
	return this.addIntegerPropertyOperation(oFF.UiProperty.ROTATION, rotation);
};
oFF.UiServerControl.prototype.setBorderColor = function(borderColor)
{
	oFF.DfUiContext.prototype.setBorderColor.call( this , borderColor);
	return this.addCssBasedPropertyOperation(oFF.UiProperty.BORDER_COLOR, borderColor);
};
oFF.UiServerControl.prototype.setBackgroundColor = function(backgroundColor)
{
	oFF.DfUiContext.prototype.setBackgroundColor.call( this , backgroundColor);
	return this.addCssBasedPropertyOperation(oFF.UiProperty.BACKGROUND_COLOR, backgroundColor);
};
oFF.UiServerControl.prototype.setFontColor = function(fontColor)
{
	oFF.DfUiContext.prototype.setFontColor.call( this , fontColor);
	return this.addCssBasedPropertyOperation(oFF.UiProperty.FONT_COLOR, fontColor);
};
oFF.UiServerControl.prototype.setSelectionMode = function(selectionMode)
{
	oFF.DfUiContext.prototype.setSelectionMode.call( this , selectionMode);
	return this.addConstantPropertyOperation(oFF.UiProperty.SELECTION_MODE, selectionMode);
};
oFF.UiServerControl.prototype.setSelectionBehavior = function(selectionBehavior)
{
	oFF.DfUiContext.prototype.setSelectionBehavior.call( this , selectionBehavior);
	return this.addConstantPropertyOperation(oFF.UiProperty.SELECTION_BEHAVIOR, selectionBehavior);
};
oFF.UiServerControl.prototype.setRequired = function(required)
{
	oFF.DfUiContext.prototype.setRequired.call( this , required);
	return this.addBooleanPropertyOperation(oFF.UiProperty.REQUIRED, required);
};
oFF.UiServerControl.prototype.setResizable = function(resizable)
{
	oFF.DfUiContext.prototype.setResizable.call( this , resizable);
	return this.addBooleanPropertyOperation(oFF.UiProperty.RESIZABLE, resizable);
};
oFF.UiServerControl.prototype.setBorderStyle = function(borderStyle)
{
	oFF.DfUiContext.prototype.setBorderStyle.call( this , borderStyle);
	return this.addConstantPropertyOperation(oFF.UiProperty.BORDER_STYLE, borderStyle);
};
oFF.UiServerControl.prototype.setState = function(state)
{
	oFF.DfUiContext.prototype.setState.call( this , state);
	return this.addConstantPropertyOperation(oFF.UiProperty.STATE, state);
};
oFF.UiServerControl.prototype.setAnimationDuration = function(animationDuration)
{
	oFF.DfUiContext.prototype.setAnimationDuration.call( this , animationDuration);
	return this.addIntegerPropertyOperation(oFF.UiProperty.ANIMATION_DURATION, animationDuration);
};
oFF.UiServerControl.prototype.setMaxDate = function(maxDate)
{
	oFF.DfUiContext.prototype.setMaxDate.call( this , maxDate);
	return this.addStringPropertyOperation(oFF.UiProperty.MAX_DATE, maxDate);
};
oFF.UiServerControl.prototype.setMinDate = function(minDate)
{
	oFF.DfUiContext.prototype.setMinDate.call( this , minDate);
	return this.addStringPropertyOperation(oFF.UiProperty.MIN_DATE, minDate);
};
oFF.UiServerControl.prototype.setDisplayFormat = function(displayFormat)
{
	oFF.DfUiContext.prototype.setDisplayFormat.call( this , displayFormat);
	return this.addStringPropertyOperation(oFF.UiProperty.DISPLAY_FORMAT, displayFormat);
};
oFF.UiServerControl.prototype.setValueFormat = function(valueFormat)
{
	oFF.DfUiContext.prototype.setValueFormat.call( this , valueFormat);
	return this.addStringPropertyOperation(oFF.UiProperty.VALUE_FORMAT, valueFormat);
};
oFF.UiServerControl.prototype.setMinutesInterval = function(minInterval)
{
	oFF.DfUiContext.prototype.setMinutesInterval.call( this , minInterval);
	return this.addIntegerPropertyOperation(oFF.UiProperty.MINUTES_INTERVAL, minInterval);
};
oFF.UiServerControl.prototype.setSecondsInterval = function(secInterval)
{
	oFF.DfUiContext.prototype.setSecondsInterval.call( this , secInterval);
	return this.addIntegerPropertyOperation(oFF.UiProperty.SECONDS_INTERVAL, secInterval);
};
oFF.UiServerControl.prototype.setMaxLength = function(maxLength)
{
	oFF.DfUiContext.prototype.setMaxLength.call( this , maxLength);
	return this.addIntegerPropertyOperation(oFF.UiProperty.MAX_LENGTH, maxLength);
};
oFF.UiServerControl.prototype.setTextAlign = function(textAlign)
{
	oFF.DfUiContext.prototype.setTextAlign.call( this , textAlign);
	return this.addConstantPropertyOperation(oFF.UiProperty.TEXT_ALIGN, textAlign);
};
oFF.UiServerControl.prototype.setFontStyle = function(fontStyle)
{
	oFF.DfUiContext.prototype.setFontStyle.call( this , fontStyle);
	return this.addConstantPropertyOperation(oFF.UiProperty.FONT_STYLE, fontStyle);
};
oFF.UiServerControl.prototype.setFontWeight = function(fontWeight)
{
	oFF.DfUiContext.prototype.setFontWeight.call( this , fontWeight);
	return this.addConstantPropertyOperation(oFF.UiProperty.FONT_WEIGHT, fontWeight);
};
oFF.UiServerControl.prototype.setPath = function(path)
{
	oFF.DfUiContext.prototype.setPath.call( this , path);
	return this.addStringPropertyOperation(oFF.UiProperty.PATH, path);
};
oFF.UiServerControl.prototype.setBusy = function(busy)
{
	oFF.DfUiContext.prototype.setBusy.call( this , busy);
	return this.addBooleanPropertyOperation(oFF.UiProperty.BUSY, busy);
};
oFF.UiServerControl.prototype.setCounter = function(counter)
{
	oFF.DfUiContext.prototype.setCounter.call( this , counter);
	return this.addIntegerPropertyOperation(oFF.UiProperty.COUNTER, counter);
};
oFF.UiServerControl.prototype.setHighlight = function(messageType)
{
	oFF.DfUiContext.prototype.setHighlight.call( this , messageType);
	return this.addConstantPropertyOperation(oFF.UiProperty.HIGHLIGHT, messageType);
};
oFF.UiServerControl.prototype.setMessageType = function(messageType)
{
	oFF.DfUiContext.prototype.setMessageType.call( this , messageType);
	return this.addConstantPropertyOperation(oFF.UiProperty.MESSAGE_TYPE, messageType);
};
oFF.UiServerControl.prototype.setCommandHistory = function(commands)
{
	oFF.DfUiContext.prototype.setCommandHistory.call( this , commands);
	return this.addListOfStringPropertyOperation(oFF.UiProperty.COMMAND_HISTORY, commands);
};
oFF.UiServerControl.prototype.setVisibleRowCount = function(visibleRowCount)
{
	oFF.DfUiContext.prototype.setVisibleRowCount.call( this , visibleRowCount);
	return this.addIntegerPropertyOperation(oFF.UiProperty.VISIBLE_ROW_COUNT, visibleRowCount);
};
oFF.UiServerControl.prototype.setVisibleRowCountMode = function(visibleRowCountMode)
{
	oFF.DfUiContext.prototype.setVisibleRowCountMode.call( this , visibleRowCountMode);
	return this.addConstantPropertyOperation(oFF.UiProperty.VISIBLE_ROW_COUNT_MODE, visibleRowCountMode);
};
oFF.UiServerControl.prototype.setMinRowCount = function(minRowCount)
{
	oFF.DfUiContext.prototype.setMinRowCount.call( this , minRowCount);
	return this.addIntegerPropertyOperation(oFF.UiProperty.MIN_ROW_COUNT, minRowCount);
};
oFF.UiServerControl.prototype.setFirstVisibleRow = function(firstVisibleRow)
{
	oFF.DfUiContext.prototype.setFirstVisibleRow.call( this , firstVisibleRow);
	return this.addControlPropertyOperation(oFF.UiProperty.FIRST_VISIBLE_ROW, firstVisibleRow);
};
oFF.UiServerControl.prototype.setDebounceTime = function(debounceTime)
{
	oFF.DfUiContext.prototype.setDebounceTime.call( this , debounceTime);
	return this.addIntegerPropertyOperation(oFF.UiProperty.DEBOUNCE_TIME, debounceTime);
};
oFF.UiServerControl.prototype.setDirection = function(direction)
{
	oFF.DfUiContext.prototype.setDirection.call( this , direction);
	return this.addConstantPropertyOperation(oFF.UiProperty.DIRECTION, direction);
};
oFF.UiServerControl.prototype.setAlignItems = function(alignItems)
{
	oFF.DfUiContext.prototype.setAlignItems.call( this , alignItems);
	return this.addConstantPropertyOperation(oFF.UiProperty.ALIGN_ITEMS, alignItems);
};
oFF.UiServerControl.prototype.setAlignContent = function(alignContent)
{
	oFF.DfUiContext.prototype.setAlignContent.call( this , alignContent);
	return this.addConstantPropertyOperation(oFF.UiProperty.ALIGN_CONTENT, alignContent);
};
oFF.UiServerControl.prototype.setJustifyContent = function(justifyContent)
{
	oFF.DfUiContext.prototype.setJustifyContent.call( this , justifyContent);
	return this.addConstantPropertyOperation(oFF.UiProperty.JUSTIFY_CONTENT, justifyContent);
};
oFF.UiServerControl.prototype.setWrap = function(wrap)
{
	oFF.DfUiContext.prototype.setWrap.call( this , wrap);
	return this.addConstantPropertyOperation(oFF.UiProperty.WRAP, wrap);
};
oFF.UiServerControl.prototype.setFlex = function(flex)
{
	oFF.DfUiContext.prototype.setFlex.call( this , flex);
	return this.addStringPropertyOperation(oFF.UiProperty.FLEX, flex);
};
oFF.UiServerControl.prototype.setAlignSelf = function(alignSelf)
{
	oFF.DfUiContext.prototype.setAlignSelf.call( this , alignSelf);
	return this.addConstantPropertyOperation(oFF.UiProperty.ALIGN_SELF, alignSelf);
};
oFF.UiServerControl.prototype.setOrder = function(order)
{
	oFF.DfUiContext.prototype.setOrder.call( this , order);
	return this.addIntegerPropertyOperation(oFF.UiProperty.ORDER, order);
};
oFF.UiServerControl.prototype.setShowSelectAll = function(showSelectAll)
{
	oFF.DfUiContext.prototype.setShowSelectAll.call( this , showSelectAll);
	return this.addBooleanPropertyOperation(oFF.UiProperty.SHOW_SELECT_ALL, showSelectAll);
};
oFF.UiServerControl.prototype.setWrapping = function(wrapping)
{
	oFF.DfUiContext.prototype.setWrapping.call( this , wrapping);
	return this.addBooleanPropertyOperation(oFF.UiProperty.WRAPPING, wrapping);
};
oFF.UiServerControl.prototype.setValueState = function(valueState)
{
	oFF.DfUiContext.prototype.setValueState.call( this , valueState);
	return this.addConstantPropertyOperation(oFF.UiProperty.VALUE_STATE, valueState);
};
oFF.UiServerControl.prototype.setValueStateText = function(valueStateText)
{
	oFF.DfUiContext.prototype.setValueStateText.call( this , valueStateText);
	return this.addStringPropertyOperation(oFF.UiProperty.VALUE_STATE_TEXT, valueStateText);
};
oFF.UiServerControl.prototype.setPlacement = function(placementType)
{
	oFF.DfUiContext.prototype.setPlacement.call( this , placementType);
	return this.addConstantPropertyOperation(oFF.UiProperty.PLACEMENT, placementType);
};
oFF.UiServerControl.prototype.setShowNavButton = function(showNavButton)
{
	oFF.DfUiContext.prototype.setShowNavButton.call( this , showNavButton);
	return this.addBooleanPropertyOperation(oFF.UiProperty.SHOW_NAV_BUTTON, showNavButton);
};
oFF.UiServerControl.prototype.setShowHeader = function(showHeader)
{
	oFF.DfUiContext.prototype.setShowHeader.call( this , showHeader);
	return this.addBooleanPropertyOperation(oFF.UiProperty.SHOW_HEADER, showHeader);
};
oFF.UiServerControl.prototype.setOn = function(isOn)
{
	oFF.DfUiContext.prototype.setOn.call( this , isOn);
	return this.addBooleanPropertyOperation(oFF.UiProperty.ON, isOn);
};
oFF.UiServerControl.prototype.setTag = function(tag)
{
	oFF.DfUiContext.prototype.setTag.call( this , tag);
	return this.addStringPropertyOperation(oFF.UiProperty.TAG, tag);
};
oFF.UiServerControl.prototype.setOnText = function(onText)
{
	oFF.DfUiContext.prototype.setOnText.call( this , onText);
	return this.addStringPropertyOperation(oFF.UiProperty.ON_TEXT, onText);
};
oFF.UiServerControl.prototype.setOffText = function(offText)
{
	oFF.DfUiContext.prototype.setOffText.call( this , offText);
	return this.addStringPropertyOperation(oFF.UiProperty.OFF_TEXT, offText);
};
oFF.UiServerControl.prototype.setCodeType = function(codeType)
{
	oFF.DfUiContext.prototype.setCodeType.call( this , codeType);
	return this.addStringPropertyOperation(oFF.UiProperty.CODE_TYPE, codeType);
};
oFF.UiServerControl.prototype.setCustomParameters = function(customParameters)
{
	oFF.DfUiContext.prototype.setCustomParameters.call( this , customParameters);
	return this.addJsonPropertyOperation(oFF.UiProperty.CUSTOM_PARAMETERS, customParameters);
};
oFF.UiServerControl.prototype.setExpandable = function(expandable)
{
	oFF.DfUiContext.prototype.setExpandable.call( this , expandable);
	return this.addBooleanPropertyOperation(oFF.UiProperty.EXPANDABLE, expandable);
};
oFF.UiServerControl.prototype.setIntervalSelection = function(intervalSelection)
{
	oFF.DfUiContext.prototype.setIntervalSelection.call( this , intervalSelection);
	return this.addBooleanPropertyOperation(oFF.UiProperty.INTERVAL_SELECTION, intervalSelection);
};
oFF.UiServerControl.prototype.setStartDate = function(startDate)
{
	oFF.DfUiContext.prototype.setStartDate.call( this , startDate);
	return this.addStringPropertyOperation(oFF.UiProperty.START_DATE, startDate);
};
oFF.UiServerControl.prototype.setEndDate = function(endDate)
{
	oFF.DfUiContext.prototype.setEndDate.call( this , endDate);
	return this.addStringPropertyOperation(oFF.UiProperty.END_DATE, endDate);
};
oFF.UiServerControl.prototype.setPressed = function(pressed)
{
	oFF.DfUiContext.prototype.setPressed.call( this , pressed);
	return this.addBooleanPropertyOperation(oFF.UiProperty.PRESSED, pressed);
};
oFF.UiServerControl.prototype.setWidth = function(width)
{
	oFF.DfUiContext.prototype.setWidth.call( this , width);
	return this.addCssBasedPropertyOperation(oFF.UiProperty.WIDTH, width);
};
oFF.UiServerControl.prototype.setHeight = function(height)
{
	oFF.DfUiContext.prototype.setHeight.call( this , height);
	return this.addCssBasedPropertyOperation(oFF.UiProperty.HEIGHT, height);
};
oFF.UiServerControl.prototype.setX = function(x)
{
	oFF.DfUiContext.prototype.setX.call( this , x);
	return this.addCssBasedPropertyOperation(oFF.UiProperty.X_POS, x);
};
oFF.UiServerControl.prototype.setY = function(y)
{
	oFF.DfUiContext.prototype.setY.call( this , y);
	return this.addCssBasedPropertyOperation(oFF.UiProperty.Y_POS, y);
};
oFF.UiServerControl.prototype.setMinWidth = function(minWidth)
{
	oFF.DfUiContext.prototype.setMinWidth.call( this , minWidth);
	return this.addCssBasedPropertyOperation(oFF.UiProperty.MIN_WIDTH, minWidth);
};
oFF.UiServerControl.prototype.setMaxWidth = function(maxWidth)
{
	oFF.DfUiContext.prototype.setMaxWidth.call( this , maxWidth);
	return this.addCssBasedPropertyOperation(oFF.UiProperty.MAX_WIDTH, maxWidth);
};
oFF.UiServerControl.prototype.setMinHeight = function(minHeight)
{
	oFF.DfUiContext.prototype.setMinHeight.call( this , minHeight);
	return this.addCssBasedPropertyOperation(oFF.UiProperty.MIN_HEIGHT, minHeight);
};
oFF.UiServerControl.prototype.setMaxHeight = function(maxHeight)
{
	oFF.DfUiContext.prototype.setMaxHeight.call( this , maxHeight);
	return this.addCssBasedPropertyOperation(oFF.UiProperty.MAX_HEIGHT, maxHeight);
};
oFF.UiServerControl.prototype.setOpacity = function(opacity)
{
	oFF.DfUiContext.prototype.setOpacity.call( this , opacity);
	return this.addDoublePropertyOperation(oFF.UiProperty.OPACITY, opacity);
};
oFF.UiServerControl.prototype.setPrompt = function(prompt)
{
	oFF.DfUiContext.prototype.setPrompt.call( this , prompt);
	return this.addStringPropertyOperation(oFF.UiProperty.PROMPT, prompt);
};
oFF.UiServerControl.prototype.setShowSorting = function(showSorting)
{
	oFF.DfUiContext.prototype.setShowSorting.call( this , showSorting);
	return this.addBooleanPropertyOperation(oFF.UiProperty.SHOW_SORTING, showSorting);
};
oFF.UiServerControl.prototype.setShowValue = function(showValue)
{
	oFF.DfUiContext.prototype.setShowValue.call( this , showValue);
	return this.addBooleanPropertyOperation(oFF.UiProperty.SHOW_VALUE, showValue);
};
oFF.UiServerControl.prototype.setAnimated = function(animated)
{
	oFF.DfUiContext.prototype.setAnimated.call( this , animated);
	return this.addBooleanPropertyOperation(oFF.UiProperty.ANIMATED, animated);
};
oFF.UiServerControl.prototype.setPercentValue = function(value)
{
	oFF.DfUiContext.prototype.setPercentValue.call( this , value);
	return this.addDoublePropertyOperation(oFF.UiProperty.PERCENT_VALUE, value);
};
oFF.UiServerControl.prototype.setColor = function(color)
{
	oFF.DfUiContext.prototype.setColor.call( this , color);
	return this.addCssBasedPropertyOperation(oFF.UiProperty.COLOR, color);
};
oFF.UiServerControl.prototype.setOverflow = function(overflow)
{
	oFF.DfUiContext.prototype.setOverflow.call( this , overflow);
	return this.addConstantPropertyOperation(oFF.UiProperty.OVERFLOW, overflow);
};
oFF.UiServerControl.prototype.setLoadState = function(loadState)
{
	oFF.DfUiContext.prototype.setLoadState.call( this , loadState);
	return this.addConstantPropertyOperation(oFF.UiProperty.LOAD_STATE, loadState);
};
oFF.UiServerControl.prototype.setFrameType = function(frameType)
{
	oFF.DfUiContext.prototype.setFrameType.call( this , frameType);
	return this.addConstantPropertyOperation(oFF.UiProperty.FRAME_TYPE, frameType);
};
oFF.UiServerControl.prototype.setTileMode = function(tileMode)
{
	oFF.DfUiContext.prototype.setTileMode.call( this , tileMode);
	return this.addConstantPropertyOperation(oFF.UiProperty.TILE_MODE, tileMode);
};
oFF.UiServerControl.prototype.setDraggable = function(draggable)
{
	oFF.DfUiContext.prototype.setDraggable.call( this , draggable);
	return this.addBooleanPropertyOperation(oFF.UiProperty.DRAGGABLE, draggable);
};
oFF.UiServerControl.prototype.setDropInfo = function(dropInfo)
{
	oFF.DfUiContext.prototype.setDropInfo.call( this , dropInfo);
	return this.addDropInfoPropertyOperation(oFF.UiProperty.DROP_INFO, dropInfo);
};
oFF.UiServerControl.prototype.setPartiallyChecked = function(partiallyChecked)
{
	oFF.DfUiContext.prototype.setPartiallyChecked.call( this , partiallyChecked);
	return this.addBooleanPropertyOperation(oFF.UiProperty.PARTIALLY_CHECKED, partiallyChecked);
};
oFF.UiServerControl.prototype.setApplyContentPadding = function(applyContentPadding)
{
	oFF.DfUiContext.prototype.setApplyContentPadding.call( this , applyContentPadding);
	return this.addBooleanPropertyOperation(oFF.UiProperty.APPLY_CONTENT_PADDING, applyContentPadding);
};
oFF.UiServerControl.prototype.setEnableReordering = function(enableReordering)
{
	oFF.DfUiContext.prototype.setEnableReordering.call( this , enableReordering);
	return this.addBooleanPropertyOperation(oFF.UiProperty.ENABLE_REORDERING, enableReordering);
};
oFF.UiServerControl.prototype.setHeaderMode = function(headerMode)
{
	oFF.DfUiContext.prototype.setHeaderMode.call( this , headerMode);
	return this.addConstantPropertyOperation(oFF.UiProperty.HEADER_MODE, headerMode);
};
oFF.UiServerControl.prototype.setCount = function(count)
{
	oFF.DfUiContext.prototype.setCount.call( this , count);
	return this.addStringPropertyOperation(oFF.UiProperty.COUNT, count);
};
oFF.UiServerControl.prototype.setShowAddNewButton = function(showAddNewButton)
{
	oFF.DfUiContext.prototype.setShowAddNewButton.call( this , showAddNewButton);
	return this.addBooleanPropertyOperation(oFF.UiProperty.SHOW_ADD_NEW_BUTTON, showAddNewButton);
};
oFF.UiServerControl.prototype.setModified = function(modified)
{
	oFF.DfUiContext.prototype.setModified.call( this , modified);
	return this.addBooleanPropertyOperation(oFF.UiProperty.MODIFIED, modified);
};
oFF.UiServerControl.prototype.setOrientation = function(orientation)
{
	oFF.DfUiContext.prototype.setOrientation.call( this , orientation);
	return this.addConstantPropertyOperation(oFF.UiProperty.ORIENTATION, orientation);
};
oFF.UiServerControl.prototype.setGap = function(gap)
{
	oFF.DfUiContext.prototype.setGap.call( this , gap);
	return this.addCssBasedPropertyOperation(oFF.UiProperty.GAP, gap);
};
oFF.UiServerControl.prototype.setNoDataText = function(noDataText)
{
	oFF.DfUiContext.prototype.setNoDataText.call( this , noDataText);
	return this.addStringPropertyOperation(oFF.UiProperty.NO_DATA_TEXT, noDataText);
};
oFF.UiServerControl.prototype.setFloatingFooter = function(floatingFooter)
{
	oFF.DfUiContext.prototype.setFloatingFooter.call( this , floatingFooter);
	return this.addBooleanPropertyOperation(oFF.UiProperty.FLOATING_FOOTER, floatingFooter);
};
oFF.UiServerControl.prototype.setContentOnlyBusy = function(contentOnlyBusy)
{
	oFF.DfUiContext.prototype.setContentOnlyBusy.call( this , contentOnlyBusy);
	return this.addBooleanPropertyOperation(oFF.UiProperty.CONTENT_ONLY_BUSY, contentOnlyBusy);
};
oFF.UiServerControl.prototype.setShowSubHeader = function(showSubHeader)
{
	oFF.DfUiContext.prototype.setShowSubHeader.call( this , showSubHeader);
	return this.addBooleanPropertyOperation(oFF.UiProperty.SHOW_SUB_HEADER, showSubHeader);
};
oFF.UiServerControl.prototype.setCurrentLocationText = function(text)
{
	oFF.DfUiContext.prototype.setCurrentLocationText.call( this , text);
	return this.addStringPropertyOperation(oFF.UiProperty.CURRENT_LOCATION_TEXT, text);
};
oFF.UiServerControl.prototype.setSeparatorStyle = function(style)
{
	oFF.DfUiContext.prototype.setSeparatorStyle.call( this , style);
	return this.addConstantPropertyOperation(oFF.UiProperty.SEPARATOR_STYLE, style);
};
oFF.UiServerControl.prototype.setBusyDelay = function(busyDelay)
{
	oFF.DfUiContext.prototype.setBusyDelay.call( this , busyDelay);
	return this.addIntegerPropertyOperation(oFF.UiProperty.BUSY_DELAY, busyDelay);
};
oFF.UiServerControl.prototype.setBusyIndicatorSize = function(busyIndicatorSize)
{
	oFF.DfUiContext.prototype.setBusyIndicatorSize.call( this , busyIndicatorSize);
	return this.addConstantPropertyOperation(oFF.UiProperty.BUSY_INDICATOR_SIZE, busyIndicatorSize);
};
oFF.UiServerControl.prototype.setDuration = function(duration)
{
	oFF.DfUiContext.prototype.setDuration.call( this , duration);
	return this.addIntegerPropertyOperation(oFF.UiProperty.DURATION, duration);
};
oFF.UiServerControl.prototype.setBackgroundDesign = function(backgroundDesign)
{
	oFF.DfUiContext.prototype.setBackgroundDesign.call( this , backgroundDesign);
	return this.addConstantPropertyOperation(oFF.UiProperty.BACKGROUND_DESIGN, backgroundDesign);
};
oFF.UiServerControl.prototype.setShowValueHelp = function(showValueHelp)
{
	oFF.DfUiContext.prototype.setShowValueHelp.call( this , showValueHelp);
	return this.addBooleanPropertyOperation(oFF.UiProperty.SHOW_VALUE_HELP, showValueHelp);
};
oFF.UiServerControl.prototype.setValueHelpIcon = function(icon)
{
	oFF.DfUiContext.prototype.setValueHelpIcon.call( this , icon);
	return this.addStringPropertyOperation(oFF.UiProperty.VALUE_HELP_ICON, icon);
};
oFF.UiServerControl.prototype.setMenu = function(menu)
{
	oFF.DfUiContext.prototype.setMenu.call( this , menu);
	return this.addControlPropertyOperation(oFF.UiProperty.MENU, menu);
};
oFF.UiServerControl.prototype.setMenuButtonMode = function(buttonMode)
{
	oFF.DfUiContext.prototype.setMenuButtonMode.call( this , buttonMode);
	return this.addConstantPropertyOperation(oFF.UiProperty.MENU_BUTTON_MODE, buttonMode);
};
oFF.UiServerControl.prototype.setActiveIcon = function(activeIcon)
{
	oFF.DfUiContext.prototype.setActiveIcon.call( this , activeIcon);
	return this.addStringPropertyOperation(oFF.UiProperty.ACTIVE_ICON, activeIcon);
};
oFF.UiServerControl.prototype.setSortIndicator = function(sortOrder)
{
	oFF.DfUiContext.prototype.setSortIndicator.call( this , sortOrder);
	return this.addConstantPropertyOperation(oFF.UiProperty.SORT_INDICATOR, sortOrder);
};
oFF.UiServerControl.prototype.setLayoutData = function(layoutData)
{
	oFF.DfUiContext.prototype.setLayoutData.call( this , layoutData);
	return this.addStringConvertibleObjPropertyOperation(oFF.UiProperty.LAYOUT_DATA, layoutData);
};
oFF.UiServerControl.prototype.setAlternateRowColors = function(alternateRowColors)
{
	oFF.DfUiContext.prototype.setAlternateRowColors.call( this , alternateRowColors);
	return this.addBooleanPropertyOperation(oFF.UiProperty.ALTERNATE_ROW_COLORS, alternateRowColors);
};
oFF.UiServerControl.prototype.setShowCloseButton = function(showCloseButton)
{
	oFF.DfUiContext.prototype.setShowCloseButton.call( this , showCloseButton);
	return this.addBooleanPropertyOperation(oFF.UiProperty.SHOW_CLOSE_BUTTON, showCloseButton);
};
oFF.UiServerControl.prototype.setShowIcon = function(showIcon)
{
	oFF.DfUiContext.prototype.setShowIcon.call( this , showIcon);
	return this.addBooleanPropertyOperation(oFF.UiProperty.SHOW_ICON, showIcon);
};
oFF.UiServerControl.prototype.setTitleLevel = function(titleLevel)
{
	oFF.DfUiContext.prototype.setTitleLevel.call( this , titleLevel);
	return this.addConstantPropertyOperation(oFF.UiProperty.TITLE_LEVEL, titleLevel);
};
oFF.UiServerControl.prototype.setTitleStyle = function(titleStyle)
{
	oFF.DfUiContext.prototype.setTitleStyle.call( this , titleStyle);
	return this.addConstantPropertyOperation(oFF.UiProperty.TITLE_STYLE, titleStyle);
};
oFF.UiServerControl.prototype.setGridLayout = function(gridLayout)
{
	oFF.DfUiContext.prototype.setGridLayout.call( this , gridLayout);
	return this.addStringConvertibleObjPropertyOperation(oFF.UiProperty.GRID_LAYOUT, gridLayout);
};
oFF.UiServerControl.prototype.setBadgeNumber = function(badgeNumber)
{
	oFF.DfUiContext.prototype.setBadgeNumber.call( this , badgeNumber);
	return this.addIntegerPropertyOperation(oFF.UiProperty.BADGE_NUMBER, badgeNumber);
};
oFF.UiServerControl.prototype.setColumnResize = function(columnResize)
{
	oFF.DfUiContext.prototype.setColumnResize.call( this , columnResize);
	return this.addBooleanPropertyOperation(oFF.UiProperty.COLUMN_RESIZE, columnResize);
};
oFF.UiServerControl.prototype.setToolbarDesign = function(toolbarDesign)
{
	oFF.DfUiContext.prototype.setToolbarDesign.call( this , toolbarDesign);
	return this.addConstantPropertyOperation(oFF.UiProperty.TOOLBAR_DESIGN, toolbarDesign);
};
oFF.UiServerControl.prototype.setTarget = function(target)
{
	oFF.DfUiContext.prototype.setTarget.call( this , target);
	return this.addStringPropertyOperation(oFF.UiProperty.TARGET, target);
};
oFF.UiServerControl.prototype.setLazyLoading = function(lazyLoading)
{
	oFF.DfUiContext.prototype.setLazyLoading.call( this , lazyLoading);
	return this.addBooleanPropertyOperation(oFF.UiProperty.LAZY_LOADING, lazyLoading);
};
oFF.UiServerControl.prototype.setBackgroundSize = function(backgroundSize)
{
	oFF.DfUiContext.prototype.setBackgroundSize.call( this , backgroundSize);
	return this.addStringPropertyOperation(oFF.UiProperty.BACKGROUND_SIZE, backgroundSize);
};
oFF.UiServerControl.prototype.setImageMode = function(imageMode)
{
	oFF.DfUiContext.prototype.setImageMode.call( this , imageMode);
	return this.addConstantPropertyOperation(oFF.UiProperty.IMAGE_MODE, imageMode);
};
oFF.UiServerControl.prototype.setBackgroundPosition = function(backgroundPosition)
{
	oFF.DfUiContext.prototype.setBackgroundPosition.call( this , backgroundPosition);
	return this.addStringPropertyOperation(oFF.UiProperty.BACKGROUND_POSITION, backgroundPosition);
};
oFF.UiServerControl.prototype.setAutocomplete = function(autocomplete)
{
	oFF.DfUiContext.prototype.setAutocomplete.call( this , autocomplete);
	return this.addBooleanPropertyOperation(oFF.UiProperty.AUTOCOMPLETE, autocomplete);
};
oFF.UiServerControl.prototype.setAvatarSize = function(avatarSize)
{
	oFF.DfUiContext.prototype.setAvatarSize.call( this , avatarSize);
	return this.addConstantPropertyOperation(oFF.UiProperty.AVATAR_SIZE, avatarSize);
};
oFF.UiServerControl.prototype.setAvatarShape = function(avatarShape)
{
	oFF.DfUiContext.prototype.setAvatarShape.call( this , avatarShape);
	return this.addConstantPropertyOperation(oFF.UiProperty.AVATAR_SHAPE, avatarShape);
};
oFF.UiServerControl.prototype.setAvatarColor = function(avatarColor)
{
	oFF.DfUiContext.prototype.setAvatarColor.call( this , avatarColor);
	return this.addConstantPropertyOperation(oFF.UiProperty.AVATAR_COLOR, avatarColor);
};
oFF.UiServerControl.prototype.setInitials = function(initials)
{
	oFF.DfUiContext.prototype.setInitials.call( this , initials);
	return this.addStringPropertyOperation(oFF.UiProperty.INITIALS, initials);
};
oFF.UiServerControl.prototype.setShowArrow = function(showArrow)
{
	oFF.DfUiContext.prototype.setShowArrow.call( this , showArrow);
	return this.addBooleanPropertyOperation(oFF.UiProperty.SHOW_ARROW, showArrow);
};
oFF.UiServerControl.prototype.setValueHelpOnly = function(valueHelpOnly)
{
	oFF.DfUiContext.prototype.setValueHelpOnly.call( this , valueHelpOnly);
	return this.addBooleanPropertyOperation(oFF.UiProperty.VALUE_HELP_ONLY, valueHelpOnly);
};
oFF.UiServerControl.prototype.setEnableScrolling = function(enableScrolling)
{
	oFF.DfUiContext.prototype.setEnableScrolling.call( this , enableScrolling);
	return this.addBooleanPropertyOperation(oFF.UiProperty.ENABLE_SCROLLING, enableScrolling);
};
oFF.UiServerControl.prototype.setShowCurrentDateButton = function(showCurrentDateButton)
{
	oFF.DfUiContext.prototype.setShowCurrentDateButton.call( this , showCurrentDateButton);
	return this.addBooleanPropertyOperation(oFF.UiProperty.SHOW_CURRENT_DATE_BUTTON, showCurrentDateButton);
};
oFF.UiServerControl.prototype.setAdditionalText = function(additionalText)
{
	oFF.DfUiContext.prototype.setAdditionalText.call( this , additionalText);
	return this.addStringPropertyOperation(oFF.UiProperty.ADDITIONAL_TEXT, additionalText);
};
oFF.UiServerControl.prototype.setUseDefaultActionOnly = function(useDefaultActionOnly)
{
	oFF.DfUiContext.prototype.setUseDefaultActionOnly.call( this , useDefaultActionOnly);
	return this.addBooleanPropertyOperation(oFF.UiProperty.USE_DEFAULT_ACTION_ONLY, useDefaultActionOnly);
};
oFF.UiServerControl.prototype.setShowSecondaryValues = function(showSecondaryValues)
{
	oFF.DfUiContext.prototype.setShowSecondaryValues.call( this , showSecondaryValues);
	return this.addBooleanPropertyOperation(oFF.UiProperty.SHOW_SECONDARY_VALUES, showSecondaryValues);
};
oFF.UiServerControl.prototype.setShowNoData = function(showNoData)
{
	oFF.DfUiContext.prototype.setShowNoData.call( this , showNoData);
	return this.addBooleanPropertyOperation(oFF.UiProperty.SHOW_NO_DATA, showNoData);
};
oFF.UiServerControl.prototype.setShowColon = function(showColon)
{
	oFF.DfUiContext.prototype.setShowColon.call( this , showColon);
	return this.addBooleanPropertyOperation(oFF.UiProperty.SHOW_COLON, showColon);
};
oFF.UiServerControl.prototype.setStateName = function(stateName)
{
	oFF.DfUiContext.prototype.setStateName.call( this , stateName);
	return this.addStringPropertyOperation(oFF.UiProperty.STATE_NAME, stateName);
};
oFF.UiServerControl.prototype.setStateJson = function(stateJson)
{
	oFF.DfUiContext.prototype.setStateJson.call( this , stateJson);
	return this.addJsonPropertyOperation(oFF.UiProperty.STATE_JSON, stateJson);
};
oFF.UiServerControl.prototype.setListSeparators = function(listSeparators)
{
	oFF.DfUiContext.prototype.setListSeparators.call( this , listSeparators);
	return this.addConstantPropertyOperation(oFF.UiProperty.LIST_SEPARATORS, listSeparators);
};
oFF.UiServerControl.prototype.setIllustrationSize = function(illustrationSize)
{
	oFF.DfUiContext.prototype.setIllustrationSize.call( this , illustrationSize);
	return this.addConstantPropertyOperation(oFF.UiProperty.ILLUSTRATION_SIZE, illustrationSize);
};
oFF.UiServerControl.prototype.setIllustrationType = function(illustrationType)
{
	oFF.DfUiContext.prototype.setIllustrationType.call( this , illustrationType);
	return this.addConstantPropertyOperation(oFF.UiProperty.ILLUSTRATION_TYPE, illustrationType);
};
oFF.UiServerControl.prototype.addElementToAggregation = function(element, aggrDef)
{
	oFF.DfUiContext.prototype.addElementToAggregation.call( this , element, aggrDef);
	if (oFF.notNull(element) && oFF.notNull(aggrDef))
	{
		this._addAggrAddOperation(aggrDef.getAddMethodName(), element);
	}
};
oFF.UiServerControl.prototype.insertElementIntoAggregation = function(element, index, aggrDef)
{
	oFF.DfUiContext.prototype.insertElementIntoAggregation.call( this , element, index, aggrDef);
	if (oFF.notNull(element) && oFF.notNull(aggrDef))
	{
		this._addAggrInsertOperation(aggrDef.getInsertMethodName(), element, index);
	}
};
oFF.UiServerControl.prototype.removeElementFromAggregation = function(element, aggrDef)
{
	oFF.DfUiContext.prototype.removeElementFromAggregation.call( this , element, aggrDef);
	if (oFF.notNull(element) && oFF.notNull(aggrDef))
	{
		this._addAggrRemoveOperation(aggrDef.getRemoveMethodName(), element);
	}
};
oFF.UiServerControl.prototype.clearAggregation = function(aggrDef)
{
	oFF.DfUiContext.prototype.clearAggregation.call( this , aggrDef);
	if (oFF.notNull(aggrDef))
	{
		this._addAggregationClearOperation(aggrDef.getClearMethodName());
	}
};
oFF.UiServerControl.prototype.setLabelFor = function(control)
{
	oFF.DfUiContext.prototype.setLabelFor.call( this , control);
	this.addControlPropertyOperation(oFF.UiProperty.LABEL_FOR, control);
	return this;
};
oFF.UiServerControl.prototype.openAt = function(control)
{
	oFF.DfUiContext.prototype.openAt.call( this , control);
	this._addUIOperationWithControlContext(oFF.UiMethod.OPEN_AT.getMethodName(), control);
	return this;
};
oFF.UiServerControl.prototype.openAtPosition = function(posX, posY)
{
	oFF.DfUiContext.prototype.openAtPosition.call( this , posX, posY);
	var params = this._addUIOperationWithParams(oFF.UiMethod.OPEN_AT_POSITION.getMethodName());
	if (oFF.notNull(params))
	{
		params.addInteger(posX);
		params.addInteger(posY);
	}
	return this;
};
oFF.UiServerControl.prototype.open = function()
{
	oFF.DfUiContext.prototype.open.call( this );
	this._addUIOperation(oFF.UiMethod.OPEN.getMethodName());
	return this;
};
oFF.UiServerControl.prototype.close = function()
{
	oFF.DfUiContext.prototype.close.call( this );
	this._addUIOperation(oFF.UiMethod.CLOSE.getMethodName());
	return this;
};
oFF.UiServerControl.prototype.print = function(text)
{
	oFF.DfUiContext.prototype.print.call( this , text);
	this.addOperation1String(this, oFF.UiMethod.PRINT.getMethodName(), text);
};
oFF.UiServerControl.prototype.println = function(text)
{
	oFF.DfUiContext.prototype.println.call( this , text);
	this.addOperation1String(this, oFF.UiMethod.PRINTLN.getMethodName(), text);
};
oFF.UiServerControl.prototype.expandToLevel = function(level)
{
	oFF.DfUiContext.prototype.expandToLevel.call( this , level);
	this.addOperation1Int(this, oFF.UiMethod.EXPAND_TO_LEVEL.getMethodName(), level);
	return this;
};
oFF.UiServerControl.prototype.collapseAll = function()
{
	oFF.DfUiContext.prototype.collapseAll.call( this );
	this._addUIOperation(oFF.UiMethod.COLLAPSE_ALL.getMethodName());
	return this;
};
oFF.UiServerControl.prototype.focus = function()
{
	oFF.DfUiContext.prototype.focus.call( this );
	this._addUIOperation(oFF.UiMethod.FOCUS.getMethodName());
	return this;
};
oFF.UiServerControl.prototype.shake = function()
{
	oFF.DfUiContext.prototype.shake.call( this );
	this._addUIOperation(oFF.UiMethod.SHAKE.getMethodName());
	return this;
};
oFF.UiServerControl.prototype.showSuggestions = function()
{
	oFF.DfUiContext.prototype.showSuggestions.call( this );
	this._addUIOperation(oFF.UiMethod.SHOW_SUGGESTIONS.getMethodName());
	return this;
};
oFF.UiServerControl.prototype.closeSuggestions = function()
{
	oFF.DfUiContext.prototype.closeSuggestions.call( this );
	this._addUIOperation(oFF.UiMethod.CLOSE_SUGGESTIONS.getMethodName());
	return this;
};
oFF.UiServerControl.prototype.back = function()
{
	oFF.DfUiContext.prototype.back.call( this );
	this._addUIOperation(oFF.UiMethod.BACK.getMethodName());
	return this;
};
oFF.UiServerControl.prototype.scrollTo = function(x, y, duration)
{
	oFF.DfUiContext.prototype.scrollTo.call( this , x, y, duration);
	var params = this._addUIOperationWithParams(oFF.UiMethod.SCROLL_TO.getMethodName());
	if (oFF.notNull(params))
	{
		params.addInteger(x);
		params.addInteger(y);
		params.addInteger(duration);
	}
	return this;
};
oFF.UiServerControl.prototype.scrollToControl = function(control, duration)
{
	oFF.DfUiContext.prototype.scrollToControl.call( this , control, duration);
	var params = this._addUIOperationWithParams(oFF.UiMethod.SCROLL_TO_CONTROL.getMethodName());
	if (oFF.notNull(params))
	{
		this._addContextOrNull(params, control);
		params.addInteger(duration);
	}
	return this;
};
oFF.UiServerControl.prototype.scrollToIndex = function(index)
{
	oFF.DfUiContext.prototype.scrollToIndex.call( this , index);
	var params = this._addUIOperationWithParams(oFF.UiMethod.SCROLL_TO_INDEX.getMethodName());
	if (oFF.notNull(params))
	{
		params.addInteger(index);
	}
	return this;
};
oFF.UiServerControl.prototype.popToPage = function(page)
{
	oFF.DfUiContext.prototype.popToPage.call( this , page);
	var params = this._addUIOperationWithParams(oFF.UiMethod.POP_TO_PAGE.getMethodName());
	if (oFF.notNull(params))
	{
		this._addContextOrNull(params, page);
	}
	return this;
};
oFF.UiServerControl.prototype.maximize = function(animated)
{
	oFF.DfUiContext.prototype.maximize.call( this , animated);
	this.addOperation1Boolean(this, oFF.UiMethod.MAXIMIZE.getMethodName(), animated);
	return this;
};
oFF.UiServerControl.prototype.restore = function(animated)
{
	oFF.DfUiContext.prototype.restore.call( this , animated);
	this.addOperation1Boolean(this, oFF.UiMethod.RESTORE.getMethodName(), animated);
	return this;
};
oFF.UiServerControl.prototype.hide = function(animated, refControl)
{
	oFF.DfUiContext.prototype.hide.call( this , animated, refControl);
	var params = this._addUIOperationWithParams(oFF.UiMethod.HIDE.getMethodName());
	if (oFF.notNull(params))
	{
		params.addBoolean(animated);
		this._addContextOrNull(params, refControl);
	}
	return this;
};
oFF.UiServerControl.prototype.show = function(animated, refControl)
{
	oFF.DfUiContext.prototype.show.call( this , animated, refControl);
	var params = this._addUIOperationWithParams(oFF.UiMethod.SHOW.getMethodName());
	if (oFF.notNull(params))
	{
		params.addBoolean(animated);
		this._addContextOrNull(params, refControl);
	}
	return this;
};
oFF.UiServerControl.prototype.selectText = function(startIndex, endIndex)
{
	oFF.DfUiContext.prototype.selectText.call( this , startIndex, endIndex);
	var params = this._addUIOperationWithParams(oFF.UiMethod.SELECT_TEXT.getMethodName());
	if (oFF.notNull(params))
	{
		params.addInteger(startIndex);
		params.addInteger(endIndex);
	}
	return this;
};
oFF.UiServerControl.prototype.fullscreen = function()
{
	oFF.DfUiContext.prototype.fullscreen.call( this );
	this._addUIOperation(oFF.UiMethod.FULLSCREEN.getMethodName());
	return this;
};
oFF.UiServerControl.prototype.startReadLine = function(text, numOfChars)
{
	oFF.DfUiContext.prototype.startReadLine.call( this , text, numOfChars);
	var params = this._addUIOperationWithParams(oFF.UiMethod.START_READ_LINE.getMethodName());
	if (oFF.notNull(params))
	{
		params.addString(text);
		params.addInteger(numOfChars);
	}
	return this;
};
oFF.UiServerControl.prototype.bringToFront = function()
{
	oFF.DfUiContext.prototype.bringToFront.call( this );
	this._addUIOperation(oFF.UiMethod.BRING_TO_FRONT.getMethodName());
	return this;
};
oFF.UiServerControl.prototype.prettyPrint = function()
{
	oFF.DfUiContext.prototype.prettyPrint.call( this );
	this._addUIOperation(oFF.UiMethod.PRETTY_PRINT.getMethodName());
	return this;
};
oFF.UiServerControl.prototype.insertText = function(text)
{
	oFF.DfUiContext.prototype.insertText.call( this , text);
	var params = this._addUIOperationWithParams(oFF.UiMethod.INSERT_TEXT.getMethodName());
	if (oFF.notNull(params))
	{
		params.addString(text);
	}
	return this;
};
oFF.UiServerControl.prototype.addCssClass = function(cssClass)
{
	oFF.DfUiContext.prototype.addCssClass.call( this , cssClass);
	var params = this._addUIOperationWithParams(oFF.UiMethod.ADD_CSS_CLASS.getMethodName());
	if (oFF.notNull(params))
	{
		params.addString(cssClass);
	}
	return this;
};
oFF.UiServerControl.prototype.removeCssClass = function(cssClass)
{
	oFF.DfUiContext.prototype.removeCssClass.call( this , cssClass);
	var params = this._addUIOperationWithParams(oFF.UiMethod.REMOVE_CSS_CLASS.getMethodName());
	if (oFF.notNull(params))
	{
		params.addString(cssClass);
	}
	return this;
};
oFF.UiServerControl.prototype.registerEventListener = function(eventDef, listener)
{
	oFF.DfUiContext.prototype.registerEventListener.call( this , eventDef, listener);
	this._addRegisterEventOperation(eventDef);
};
oFF.UiServerControl.prototype.onSelect = function(event)
{
	var listener = this.getListenerOnSelect();
	if (oFF.notNull(listener))
	{
		listener.onSelect(event);
	}
};
oFF.UiServerControl.prototype.onSelectionChange = function(event)
{
	var listener = this.getListenerOnSelectionChange();
	if (oFF.notNull(listener))
	{
		listener.onSelectionChange(event);
	}
};
oFF.UiServerControl.prototype.onDoubleClick = function(event)
{
	var listener = this.getListenerOnDoubleClick();
	if (oFF.notNull(listener))
	{
		listener.onDoubleClick(event);
	}
};
oFF.UiServerControl.prototype.onOpen = function(event)
{
	var listener = this.getListenerOnOpen();
	if (oFF.notNull(listener))
	{
		listener.onOpen(event);
	}
};
oFF.UiServerControl.prototype.onClose = function(event)
{
	var listener = this.getListenerOnClose();
	if (oFF.notNull(listener))
	{
		listener.onClose(event);
	}
};
oFF.UiServerControl.prototype.onBeforeOpen = function(event)
{
	var listener = this.getListenerOnBeforeOpen();
	if (oFF.notNull(listener))
	{
		listener.onBeforeOpen(event);
	}
};
oFF.UiServerControl.prototype.onBeforeClose = function(event)
{
	var listener = this.getListenerOnBeforeClose();
	if (oFF.notNull(listener))
	{
		listener.onBeforeClose(event);
	}
};
oFF.UiServerControl.prototype.onAfterOpen = function(event)
{
	var listener = this.getListenerOnAfterOpen();
	if (oFF.notNull(listener))
	{
		listener.onAfterOpen(event);
	}
};
oFF.UiServerControl.prototype.onAfterClose = function(event)
{
	var listener = this.getListenerOnAfterClose();
	if (oFF.notNull(listener))
	{
		listener.onAfterClose(event);
	}
};
oFF.UiServerControl.prototype.onChange = function(event)
{
	var listener = this.getListenerOnChange();
	if (oFF.notNull(listener))
	{
		listener.onChange(event);
	}
};
oFF.UiServerControl.prototype.onLiveChange = function(event)
{
	var listener = this.getListenerOnLiveChange();
	if (oFF.notNull(listener))
	{
		listener.onLiveChange(event);
	}
};
oFF.UiServerControl.prototype.onDelete = function(event)
{
	var listener = this.getListenerOnDelete();
	if (oFF.notNull(listener))
	{
		listener.onDelete(event);
	}
};
oFF.UiServerControl.prototype.onDetailPress = function(event)
{
	var listener = this.getListenerOnDetailPress();
	if (oFF.notNull(listener))
	{
		listener.onDetailPress(event);
	}
};
oFF.UiServerControl.prototype.onMove = function(event)
{
	var listener = this.getListenerOnMove();
	if (oFF.notNull(listener))
	{
		listener.onMove(event);
	}
};
oFF.UiServerControl.prototype.onMoveStart = function(event)
{
	var listener = this.getListenerOnMoveStart();
	if (oFF.notNull(listener))
	{
		listener.onMoveStart(event);
	}
};
oFF.UiServerControl.prototype.onMoveEnd = function(event)
{
	var listener = this.getListenerOnMoveEnd();
	if (oFF.notNull(listener))
	{
		listener.onMoveEnd(event);
	}
};
oFF.UiServerControl.prototype.onResize = function(event)
{
	var listener = this.getListenerOnResize();
	if (oFF.notNull(listener))
	{
		listener.onResize(event);
	}
};
oFF.UiServerControl.prototype.onSuggestionSelect = function(event)
{
	var listener = this.getListenerOnSuggestionSelect();
	if (oFF.notNull(listener))
	{
		listener.onSuggestionSelect(event);
	}
};
oFF.UiServerControl.prototype.onScroll = function(event)
{
	var listener = this.getListenerOnScroll();
	if (oFF.notNull(listener))
	{
		listener.onScroll(event);
	}
};
oFF.UiServerControl.prototype.onScrollLoad = function(event)
{
	var listener = this.getListenerOnScrollLoad();
	if (oFF.notNull(listener))
	{
		listener.onScrollLoad(event);
	}
};
oFF.UiServerControl.prototype.onPress = function(event)
{
	var listener = this.getListenerOnPress();
	if (oFF.notNull(listener))
	{
		listener.onPress(event);
	}
};
oFF.UiServerControl.prototype.onEnter = function(event)
{
	var listener = this.getListenerOnEnter();
	if (oFF.notNull(listener))
	{
		listener.onEnter(event);
	}
};
oFF.UiServerControl.prototype.onEditingBegin = function(event)
{
	var listener = this.getListenerOnEditingBegin();
	if (oFF.notNull(listener))
	{
		listener.onEditingBegin(event);
	}
};
oFF.UiServerControl.prototype.onEditingEnd = function(event)
{
	var listener = this.getListenerOnEditingEnd();
	if (oFF.notNull(listener))
	{
		listener.onEditingEnd(event);
	}
};
oFF.UiServerControl.prototype.onBack = function(event)
{
	var listener = this.getListenerOnBack();
	if (oFF.notNull(listener))
	{
		listener.onBack(event);
	}
};
oFF.UiServerControl.prototype.onRefresh = function(event)
{
	var listener = this.getListenerOnRefresh();
	if (oFF.notNull(listener))
	{
		listener.onRefresh(event);
	}
};
oFF.UiServerControl.prototype.onLoadFinished = function(event)
{
	var listener = this.getListenerOnLoadFinished();
	if (oFF.notNull(listener))
	{
		listener.onLoadFinished(event);
	}
};
oFF.UiServerControl.prototype.onClick = function(event)
{
	var listener = this.getListenerOnClick();
	if (oFF.notNull(listener))
	{
		listener.onClick(event);
	}
};
oFF.UiServerControl.prototype.onContextMenu = function(event)
{
	var listener = this.getListenerOnContextMenu();
	if (oFF.notNull(listener))
	{
		listener.onContextMenu(event);
	}
};
oFF.UiServerControl.prototype.onCollapse = function(event)
{
	var listener = this.getListenerOnCollapse();
	if (oFF.notNull(listener))
	{
		listener.onCollapse(event);
	}
};
oFF.UiServerControl.prototype.onExpand = function(event)
{
	var listener = this.getListenerOnExpand();
	if (oFF.notNull(listener))
	{
		listener.onExpand(event);
	}
};
oFF.UiServerControl.prototype.onHover = function(event)
{
	var listener = this.getListenerOnHover();
	if (oFF.notNull(listener))
	{
		listener.onHover(event);
	}
};
oFF.UiServerControl.prototype.onHoverEnd = function(event)
{
	var listener = this.getListenerOnHoverEnd();
	if (oFF.notNull(listener))
	{
		listener.onHoverEnd(event);
	}
};
oFF.UiServerControl.prototype.onPaste = function(event)
{
	var listener = this.getListenerOnPaste();
	if (oFF.notNull(listener))
	{
		listener.onPaste(event);
	}
};
oFF.UiServerControl.prototype.onSelectionFinish = function(event)
{
	var listener = this.getListenerOnSelectionFinish();
	if (oFF.notNull(listener))
	{
		listener.onSelectionFinish(event);
	}
};
oFF.UiServerControl.prototype.onSearch = function(event)
{
	var listener = this.getListenerOnSearch();
	if (oFF.notNull(listener))
	{
		listener.onSearch(event);
	}
};
oFF.UiServerControl.prototype.onButtonPress = function(event)
{
	var listener = this.getListenerOnButtonPress();
	if (oFF.notNull(listener))
	{
		listener.onButtonPress(event);
	}
};
oFF.UiServerControl.prototype.onError = function(event)
{
	var listener = this.getListenerOnError();
	if (oFF.notNull(listener))
	{
		listener.onError(event);
	}
};
oFF.UiServerControl.prototype.onReadLineFinished = function(event)
{
	var listener = this.getListenerOnReadLineFinished();
	if (oFF.notNull(listener))
	{
		listener.onReadLineFinished(event);
	}
};
oFF.UiServerControl.prototype.onExecute = function(event)
{
	var listener = this.getListenerOnExecute();
	if (oFF.notNull(listener))
	{
		listener.onExecute(event);
	}
};
oFF.UiServerControl.prototype.onTerminate = function(event)
{
	var listener = this.getListenerOnTerminate();
	if (oFF.notNull(listener))
	{
		listener.onTerminate(event);
	}
};
oFF.UiServerControl.prototype.onFileDrop = function(event)
{
	var listener = this.getListenerOnFileDrop();
	if (oFF.notNull(listener))
	{
		listener.onFileDrop(event);
	}
};
oFF.UiServerControl.prototype.onDrop = function(event)
{
	var listener = this.getListenerOnDrop();
	if (oFF.notNull(listener))
	{
		listener.onDrop(event);
	}
};
oFF.UiServerControl.prototype.onItemClose = function(event)
{
	var listener = this.getListenerOnItemClose();
	if (oFF.notNull(listener))
	{
		listener.onItemClose(event);
	}
};
oFF.UiServerControl.prototype.onItemSelect = function(event)
{
	var listener = this.getListenerOnItemSelect();
	if (oFF.notNull(listener))
	{
		listener.onItemSelect(event);
	}
};
oFF.UiServerControl.prototype.onTableDragAndDrop = function(event)
{
	var listener = this.getListenerOnTableDragAndDrop();
	if (oFF.notNull(listener))
	{
		listener.onTableDragAndDrop(event);
	}
};
oFF.UiServerControl.prototype.onMenuPress = function(event)
{
	var listener = this.getListenerOnMenuPress();
	if (oFF.notNull(listener))
	{
		listener.onMenuPress(event);
	}
};
oFF.UiServerControl.prototype.onValueHelpRequest = function(event)
{
	var listener = this.getListenerOnValueHelpRequest();
	if (oFF.notNull(listener))
	{
		listener.onValueHelpRequest(event);
	}
};
oFF.UiServerControl.prototype.onColumnResize = function(event)
{
	var listener = this.getListenerOnColumnResize();
	if (oFF.notNull(listener))
	{
		listener.onColumnResize(event);
	}
};
oFF.UiServerControl.prototype.onRowResize = function(event)
{
	var listener = this.getListenerOnRowResize();
	if (oFF.notNull(listener))
	{
		listener.onRowResize(event);
	}
};
oFF.UiServerControl.prototype.onItemPress = function(event)
{
	var listener = this.getListenerOnItemPress();
	if (oFF.notNull(listener))
	{
		listener.onItemPress(event);
	}
};
oFF.UiServerControl.prototype.onDragStart = function(event)
{
	var listener = this.getListenerOnDragStart();
	if (oFF.notNull(listener))
	{
		listener.onDragStart(event);
	}
};
oFF.UiServerControl.prototype.onDragEnd = function(event)
{
	var listener = this.getListenerOnDragEnd();
	if (oFF.notNull(listener))
	{
		listener.onDragEnd(event);
	}
};
oFF.UiServerControl.prototype.onEscape = function(event)
{
	var listener = this.getListenerOnEscape();
	if (oFF.notNull(listener))
	{
		listener.onEscape(event);
	}
};
oFF.UiServerControl.prototype.onKeyDown = function(event)
{
	var listener = this.getListenerOnKeyDown();
	if (oFF.notNull(listener))
	{
		listener.onKeyDown(event);
	}
};
oFF.UiServerControl.prototype.onKeyUp = function(event)
{
	var listener = this.getListenerOnKeyUp();
	if (oFF.notNull(listener))
	{
		listener.onKeyUp(event);
	}
};
oFF.UiServerControl.prototype.setSelectedItem = function(item)
{
	oFF.DfUiContext.prototype.setSelectedItem.call( this , item);
	this._addUIOperationWithControlContext(oFF.UiRemoteProtocol.OP_SET_SELECTED_ITEM, item);
	return this;
};
oFF.UiServerControl.prototype.setSelectedItems = function(selectedItems)
{
	oFF.DfUiContext.prototype.setSelectedItems.call( this , selectedItems);
	this._addUIOperationWithControlContextList(oFF.UiRemoteProtocol.OP_SET_SELECTED_ITEMS, selectedItems);
	return this;
};
oFF.UiServerControl.prototype.addSelectedItem = function(selectedItem)
{
	oFF.DfUiContext.prototype.addSelectedItem.call( this , selectedItem);
	this._addUIOperationWithControlContext(oFF.UiRemoteProtocol.OP_ADD_SELECTED_ITEM, selectedItem);
	return this;
};
oFF.UiServerControl.prototype.removeSelectedItem = function(selectedItem)
{
	oFF.DfUiContext.prototype.removeSelectedItem.call( this , selectedItem);
	this._addUIOperationWithControlContext(oFF.UiRemoteProtocol.OP_REMOVE_SELECTED_ITEM, selectedItem);
	return this;
};
oFF.UiServerControl.prototype.clearSelectedItems = function()
{
	oFF.DfUiContext.prototype.clearSelectedItems.call( this );
	this._addUIOperation(oFF.UiRemoteProtocol.OP_CLEAR_SELECTED_ITEMS);
	return this;
};
oFF.UiServerControl.prototype.addOperation1String = function(object, name, param0)
{
	var master = this.getMasterNoCall();
	if (oFF.notNull(master))
	{
		master.addOperation1String(object, name, param0);
	}
	return this;
};
oFF.UiServerControl.prototype.addOperation1Int = function(object, name, param0)
{
	var master = this.getMasterNoCall();
	if (oFF.notNull(master))
	{
		master.addOperation1Int(object, name, param0);
	}
	return this;
};
oFF.UiServerControl.prototype.addOperation1Double = function(object, name, param0)
{
	var master = this.getMasterNoCall();
	if (oFF.notNull(master))
	{
		master.addOperation1Double(object, name, param0);
	}
	return this;
};
oFF.UiServerControl.prototype.addOperation1Boolean = function(object, name, param0)
{
	var master = this.getMasterNoCall();
	if (oFF.notNull(master))
	{
		master.addOperation1Boolean(object, name, param0);
	}
	return this;
};
oFF.UiServerControl.prototype.addOperation1ListOfString = function(object, name, param0)
{
	var master = this.getMasterNoCall();
	if (oFF.notNull(master))
	{
		var addOperation = master.addOperation(object, name, this);
		this._addListOfStringsOrNull(addOperation, param0);
	}
	return this;
};
oFF.UiServerControl.prototype.addOperation1Element = function(object, name, param0)
{
	var master = this.getMasterNoCall();
	if (oFF.notNull(master))
	{
		master.addOperation1Element(this, name, param0);
	}
	return this;
};
oFF.UiServerControl.prototype._addUIOperation = function(protocol)
{
	var master = this.getMasterNoCall();
	if (oFF.notNull(master))
	{
		master.addOperation(this, protocol, this);
	}
};
oFF.UiServerControl.prototype._addUIOperationWithParams = function(protocol)
{
	var master = this.getMasterNoCall();
	if (oFF.notNull(master))
	{
		return master.addOperation(this, protocol, null);
	}
	return null;
};
oFF.UiServerControl.prototype._addUIOperationWithControlContext = function(protocol, controlContext)
{
	var master = this.getMasterNoCall();
	if (oFF.notNull(master))
	{
		master.addOperation1Context(this, protocol, controlContext);
	}
};
oFF.UiServerControl.prototype._addUIOperationWithControlContextList = function(protocol, controlList)
{
	var master = this.getMasterNoCall();
	if (oFF.notNull(master))
	{
		var addOperation = master.addOperation(this, protocol, null);
		this._addIdsListOrNull(addOperation, controlList);
	}
};
oFF.UiServerControl.prototype._addRegisterEventOperation = function(eventDef)
{
	if (oFF.isNull(eventDef))
	{
		throw oFF.XException.createRuntimeException("Cannot register event listener. Missing event definition!");
	}
	this._addUIOperation(eventDef.getRegisterMethodName());
};
oFF.UiServerControl.prototype.addStringPropertyOperation = function(prop, param)
{
	if (oFF.notNull(prop))
	{
		this.addOperation1String(this, prop.getSetterMethodName(), param);
	}
	return this;
};
oFF.UiServerControl.prototype.addBooleanPropertyOperation = function(prop, param)
{
	if (oFF.notNull(prop))
	{
		this.addOperation1Boolean(this, prop.getSetterMethodName(), param);
	}
	return this;
};
oFF.UiServerControl.prototype.addIntegerPropertyOperation = function(prop, param)
{
	if (oFF.notNull(prop))
	{
		this.addOperation1Int(this, prop.getSetterMethodName(), param);
	}
	return this;
};
oFF.UiServerControl.prototype.addDoublePropertyOperation = function(prop, param)
{
	if (oFF.notNull(prop))
	{
		this.addOperation1Double(this, prop.getSetterMethodName(), param);
	}
	return this;
};
oFF.UiServerControl.prototype.addListOfStringPropertyOperation = function(prop, param)
{
	if (oFF.notNull(prop))
	{
		this.addOperation1ListOfString(this, prop.getSetterMethodName(), param);
	}
	return this;
};
oFF.UiServerControl.prototype.addCssBasedPropertyOperation = function(prop, cssBase)
{
	if (oFF.notNull(prop))
	{
		if (oFF.notNull(cssBase))
		{
			this.addOperation1String(this, prop.getSetterMethodName(), cssBase.getCssValue());
		}
		else
		{
			this.addOperation1String(this, prop.getSetterMethodName(), null);
		}
	}
	return this;
};
oFF.UiServerControl.prototype.addConstantPropertyOperation = function(prop, param)
{
	var constantName = null;
	if (oFF.notNull(param))
	{
		constantName = param.getName();
	}
	return this.addOperation1String(this, prop.getSetterMethodName(), constantName);
};
oFF.UiServerControl.prototype.addDropInfoPropertyOperation = function(prop, param)
{
	var dropInfoStr = null;
	if (oFF.notNull(param))
	{
		dropInfoStr = param.getAsString();
	}
	return this.addOperation1String(this, prop.getSetterMethodName(), dropInfoStr);
};
oFF.UiServerControl.prototype.addStringConvertibleObjPropertyOperation = function(prop, param)
{
	var objAsStr = null;
	if (oFF.notNull(param))
	{
		objAsStr = param.getAsString();
	}
	return this.addOperation1String(this, prop.getSetterMethodName(), objAsStr);
};
oFF.UiServerControl.prototype.addControlPropertyOperation = function(prop, controlContext)
{
	if (oFF.notNull(prop))
	{
		this._addUIOperationWithControlContext(prop.getSetterMethodName(), controlContext);
	}
	return this;
};
oFF.UiServerControl.prototype.addJsonPropertyOperation = function(prop, param)
{
	if (oFF.notNull(prop))
	{
		this.addOperation1Element(this, prop.getSetterMethodName(), param);
	}
	return this;
};
oFF.UiServerControl.prototype._addAggrAddOperation = function(protocol, element)
{
	var master = this.getMasterNoCall();
	if (oFF.notNull(master))
	{
		master.addOperation1Context(this, protocol, element);
	}
};
oFF.UiServerControl.prototype._addAggrInsertOperation = function(protocol, element, index)
{
	var master = this.getMasterNoCall();
	if (oFF.notNull(master))
	{
		var operation = master.addOperation1Context(this, protocol, element);
		operation.addInteger(index);
	}
};
oFF.UiServerControl.prototype._addAggrRemoveOperation = function(protocol, element)
{
	var master = this.getMasterNoCall();
	if (oFF.notNull(master))
	{
		master.addOperation1Context(this, protocol, element);
	}
};
oFF.UiServerControl.prototype._addAggregationClearOperation = function(protocol)
{
	this._addUIOperation(protocol);
};
oFF.UiServerControl.prototype._addIdsListOrNull = function(list, itemList)
{
	if (oFF.isNull(itemList))
	{
		list.addString(null);
	}
	else
	{
		var itemIdsBuffer = oFF.XStringBuffer.create();
		for (var a = 0; a < itemList.size(); a++)
		{
			var tmpItem = itemList.get(a);
			if (a > 0)
			{
				itemIdsBuffer.append(oFF.UiRemoteProtocol.MULTI_ITEM_SEPARATOR);
			}
			itemIdsBuffer.append(tmpItem.getId());
		}
		list.addString(itemIdsBuffer.toString());
	}
};
oFF.UiServerControl.prototype._addListOfStringsOrNull = function(list, stringList)
{
	if (oFF.isNull(stringList))
	{
		list.addString(null);
	}
	else
	{
		var stringBuffer = oFF.XStringBuffer.create();
		for (var a = 0; a < stringList.size(); a++)
		{
			var tmpString = stringList.get(a);
			if (a > 0)
			{
				stringBuffer.append(oFF.UiRemoteProtocol.MULTI_ITEM_SEPARATOR);
			}
			stringBuffer.append(tmpString);
		}
		list.addString(stringBuffer.toString());
	}
};
oFF.UiServerControl.prototype._addContextOrNull = function(list, context)
{
	if (oFF.notNull(context))
	{
		list.addString(context.getId());
	}
	else
	{
		list.addString(null);
	}
};

oFF.UiCompositeRemote = function() {};
oFF.UiCompositeRemote.prototype = new oFF.UiComposite();
oFF.UiCompositeRemote.prototype._ff_c = "UiCompositeRemote";

oFF.UiCompositeRemote.create = function()
{
	var newObject = new oFF.UiCompositeRemote();
	newObject.setup();
	return newObject;
};
oFF.UiCompositeRemote.prototype.initializeComposite = function() {};

oFF.UiRemoteModule = function() {};
oFF.UiRemoteModule.prototype = new oFF.DfModule();
oFF.UiRemoteModule.prototype._ff_c = "UiRemoteModule";

oFF.UiRemoteModule.s_module = null;
oFF.UiRemoteModule.getInstance = function()
{
	if (oFF.isNull(oFF.UiRemoteModule.s_module))
	{
		oFF.DfModule.checkInitialized(oFF.UiProgramModule.getInstance());
		oFF.UiRemoteModule.s_module = oFF.DfModule.startExt(new oFF.UiRemoteModule());
		oFF.UiRemoteAction.staticSetup();
		oFF.UiRemoteServerStatus.staticSetup();
		oFF.UiRemoteSyncReason.staticSetup();
		oFF.UiServerEvent.staticSetup();
		oFF.SphereServer.staticSetup();
		oFF.ProgramRegistration.setProgramFactory(new oFF.SubSysGuiServerPrg());
		oFF.ProgramRegistration.setProgramFactory(new oFF.SphereClient());
		oFF.DfModule.stopExt(oFF.UiRemoteModule.s_module);
	}
	return oFF.UiRemoteModule.s_module;
};
oFF.UiRemoteModule.prototype.getName = function()
{
	return "ff2260.ui.remote";
};

oFF.UiRemoteModule.getInstance();

return sap.firefly;
	} );