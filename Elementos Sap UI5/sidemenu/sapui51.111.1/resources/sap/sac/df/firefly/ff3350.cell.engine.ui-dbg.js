/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
[
"sap/sac/df/firefly/ff3300.cell.engine","sap/sac/df/firefly/ff2650.visualization.impl"
],
function(oFF)
{
"use strict";

oFF.SpreadsheetModel = function() {};
oFF.SpreadsheetModel.prototype = new oFF.XObject();
oFF.SpreadsheetModel.prototype._ff_c = "SpreadsheetModel";

oFF.SpreadsheetModel.create = function()
{
	var instance = new oFF.SpreadsheetModel();
	instance.m_spreadsheet = oFF.XSpreadsheet.create();
	instance.m_selectedCellAddressRange = oFF.XCellAddressRange.createWithString("A1");
	return instance;
};
oFF.SpreadsheetModel.prototype.m_spreadsheet = null;
oFF.SpreadsheetModel.prototype.m_selectedCellAddressRange = null;
oFF.SpreadsheetModel.prototype.setSelectedCellAddress = function(selectedCellAddress)
{
	this.m_selectedCellAddressRange = selectedCellAddress;
};
oFF.SpreadsheetModel.prototype.getSelectedCells = function()
{
	return this.m_spreadsheet.getCellRangeWithAddressRange(this.m_selectedCellAddressRange);
};
oFF.SpreadsheetModel.prototype.getFirstSelectedCell = function()
{
	return this.m_spreadsheet.getCellAtAddress(this.m_selectedCellAddressRange.getStartingAddress());
};
oFF.SpreadsheetModel.prototype.getSelectedCellAddress = function()
{
	return this.m_selectedCellAddressRange;
};
oFF.SpreadsheetModel.prototype.getAllCells = function()
{
	return this.m_spreadsheet.getCells();
};
oFF.SpreadsheetModel.prototype.setTextAtAddress = function(text, addressString)
{
	var address = oFF.XCellAddress.create(addressString);
	this.m_spreadsheet.getCellAtAddress(address).setText(text);
};
oFF.SpreadsheetModel.prototype.getCellAtAddress = function(address)
{
	return this.m_spreadsheet.getCellAtAddress(address);
};

oFF.SpreadsheetRenderer = function() {};
oFF.SpreadsheetRenderer.prototype = new oFF.XObject();
oFF.SpreadsheetRenderer.prototype._ff_c = "SpreadsheetRenderer";

oFF.SpreadsheetRenderer.create = function(table, spreadsheetModel)
{
	var instance = new oFF.SpreadsheetRenderer();
	instance.m_spreadsheetModel = spreadsheetModel;
	instance.m_table = table;
	instance.m_genericRenderer = oFF.SacTableFactory.createGridRenderer(table);
	return instance;
};
oFF.SpreadsheetRenderer.prototype.m_spreadsheetModel = null;
oFF.SpreadsheetRenderer.prototype.m_genericRenderer = null;
oFF.SpreadsheetRenderer.prototype.m_table = null;
oFF.SpreadsheetRenderer.prototype.setGridConfigration = function(gridConfig)
{
	this.m_genericRenderer.setGridConfigration(gridConfig);
};
oFF.SpreadsheetRenderer.prototype.render = function()
{
	var cells = this.m_spreadsheetModel.getAllCells();
	this.m_table.setMinCellWidth(98);
	for (var i = 0; i < cells.size(); i++)
	{
		var dr;
		if (i >= this.m_table.getDataRowAmount())
		{
			dr = this.m_table.newDataRow();
		}
		else
		{
			dr = this.m_table.getRowList().get(i);
		}
		dr.setHeight(24);
		for (var j = 0; j < cells.get(i).size(); j++)
		{
			var sacTableCell;
			if (j >= dr.getCells().size())
			{
				sacTableCell = dr.addNewCell();
			}
			else
			{
				sacTableCell = dr.getCells().get(j);
			}
			var spreadsheetCell = cells.get(i).get(j);
			sacTableCell.setFormatted(spreadsheetCell.getFormattedString());
			this.formatCell(spreadsheetCell, sacTableCell);
		}
	}
	this.m_table.setDataColumnsAmount(cells.get(0).size());
	this.m_table.setDataRowAmount(cells.size());
	this.m_table.setPreColumnsAmount(0);
	return this.m_genericRenderer.render();
};
oFF.SpreadsheetRenderer.prototype.formatCell = function(spreadsheetCell, sacTableCell)
{
	sacTableCell.getTableStyle().setFontColor(spreadsheetCell.getTextColor());
	sacTableCell.getTableStyle().setFillColor(spreadsheetCell.getBackgroundColor());
	sacTableCell.getTableStyle().setFontBold(spreadsheetCell.getBold());
	sacTableCell.getTableStyle().setFontItalic(spreadsheetCell.getItalic());
	sacTableCell.getTableStyle().setFontSize(spreadsheetCell.getFontSize());
	sacTableCell.getTableStyle().setHorizontalAlignment(spreadsheetCell.getHorizontalAlignment());
};
oFF.SpreadsheetRenderer.prototype.getTableJson = function()
{
	return this.m_genericRenderer.getTableJson();
};

oFF.SacSpreadsheetClipboardHelper = function() {};
oFF.SacSpreadsheetClipboardHelper.prototype = new oFF.SacTableClipboardHelper();
oFF.SacSpreadsheetClipboardHelper.prototype._ff_c = "SacSpreadsheetClipboardHelper";

oFF.SacSpreadsheetClipboardHelper.createForSpreadsheet = function(tableInstance, model)
{
	var instance = new oFF.SacSpreadsheetClipboardHelper();
	instance.setupWithTable(tableInstance);
	instance.setupModel(model);
	return instance;
};
oFF.SacSpreadsheetClipboardHelper.prototype.m_model = null;
oFF.SacSpreadsheetClipboardHelper.prototype.setupModel = function(model)
{
	this.m_model = model;
};
oFF.SacSpreadsheetClipboardHelper.prototype.pasteCells = function(pasting, column, row)
{
	var colMin = pasting.getIntegerByKey(oFF.SacTable.SELECTION_COL_MIN);
	var rowMin = pasting.getIntegerByKey(oFF.SacTable.SELECTION_ROW_MIN);
	var cellList = pasting.getListByKey(oFF.SacTable.SELECTION_LIST);
	var plainString = "";
	var plain;
	for (var i = 0; i < cellList.size(); i++)
	{
		var cell = cellList.getStructureAt(i);
		var colIndex = cell.getIntegerByKey(oFF.SacTableConstants.C_N_COLUMN) - colMin + column;
		var rowIndex = cell.getIntegerByKey(oFF.SacTableConstants.C_N_ROW) - rowMin + row;
		var cells;
		if (rowIndex < this.getTable().getHeaderRowList().size())
		{
			cells = this.getTable().getHeaderRowList().get(rowIndex).getCells();
			if (colIndex < cells.size())
			{
				plain = cell.getByKey(oFF.SacTableConstants.C_SN_PLAIN);
				plainString = oFF.isNull(plain) ? "" : plain.getStringRepresentation();
				this.m_model.getCellAtAddress(oFF.XCellAddress.createWithIndices(rowIndex, colIndex)).setText(plainString);
			}
		}
		else if (rowIndex - this.getTable().getHeaderRowList().size() < this.getTable().getRowList().size())
		{
			cells = this.getTable().getRowList().get(rowIndex - this.getTable().getHeaderRowList().size()).getCells();
			if (colIndex < cells.size())
			{
				plain = cell.getByKey(oFF.SacTableConstants.C_SN_PLAIN);
				plainString = oFF.isNull(plain) ? "" : plain.getStringRepresentation();
				this.m_model.getCellAtAddress(oFF.XCellAddress.createWithIndices(rowIndex, colIndex)).setText(plainString);
			}
		}
	}
};
oFF.SacSpreadsheetClipboardHelper.prototype.getCellValueAt = function(rowIndex, columnIndex)
{
	return this.m_model.getCellAtAddress(oFF.XCellAddress.createWithIndices(rowIndex, columnIndex)).evaluate();
};

oFF.SpreadsheetController = function() {};
oFF.SpreadsheetController.prototype = new oFF.XObject();
oFF.SpreadsheetController.prototype._ff_c = "SpreadsheetController";

oFF.SpreadsheetController.create = function(functionInput, cellSelectInput)
{
	var instance = new oFF.SpreadsheetController();
	instance.m_uiModel = oFF.SpreadsheetModel.create();
	instance.m_functionInput = functionInput;
	instance.m_addressInput = cellSelectInput;
	instance.internalSetup();
	return instance;
};
oFF.SpreadsheetController.prototype.m_uiModel = null;
oFF.SpreadsheetController.prototype.m_functionInput = null;
oFF.SpreadsheetController.prototype.m_addressInput = null;
oFF.SpreadsheetController.prototype.m_tableView = null;
oFF.SpreadsheetController.prototype.internalSetup = function()
{
	this.m_functionInput.registerOnEnter(this);
	this.m_addressInput.setEnabled(false);
};
oFF.SpreadsheetController.prototype.setTableView = function(tableView)
{
	this.m_tableView = tableView;
};
oFF.SpreadsheetController.prototype.onSelectionChange = function(event)
{
	var selectionArea = event.getParameters().getByKey("selectionArea");
	var cellAddressRange = this.getCellAddress(selectionArea);
	this.m_tableView.analyzeSelectionEvent(event);
	this.m_uiModel.setSelectedCellAddress(cellAddressRange);
	this.m_functionInput.setText(this.m_uiModel.getSelectedCells().get(0).get(0).getStringLiteral());
	this.m_functionInput.focus();
	this.m_addressInput.setText(this.m_uiModel.getSelectedCellAddress().getAddressString());
};
oFF.SpreadsheetController.prototype.getCellAddress = function(selectionArea)
{
	var jsonParser = oFF.JsonParserFactory.newInstance();
	var selectionParameters = jsonParser.parse(selectionArea).asList();
	var startRow = selectionParameters.asList().get(0).asStructure().getIntegerByKey("startRow");
	var startCol = selectionParameters.asList().get(0).asStructure().getIntegerByKey("startCol");
	var endRow = selectionParameters.asList().get(0).asStructure().getIntegerByKey("endRow");
	var endCol = selectionParameters.asList().get(0).asStructure().getIntegerByKey("endCol");
	var cellAddress = oFF.XCellAddressRange.createWithIndices(startRow, endRow, startCol, endCol);
	return cellAddress;
};
oFF.SpreadsheetController.prototype.getModel = function()
{
	return this.m_uiModel;
};
oFF.SpreadsheetController.prototype.setTextAtAddress = function(text, address)
{
	this.m_uiModel.setTextAtAddress(text, address);
};
oFF.SpreadsheetController.prototype.onEnter = function(event)
{
	this.setCellText(this.m_functionInput.getText());
};
oFF.SpreadsheetController.prototype.setCellText = function(text)
{
	this.m_uiModel.getFirstSelectedCell().setText(text);
	this.m_tableView.renderSpreadsheet();
};
oFF.SpreadsheetController.prototype.releaseObject = function()
{
	this.m_uiModel = oFF.XObjectExt.release(this.m_uiModel);
};

oFF.SacSpreadsheetTable = function() {};
oFF.SacSpreadsheetTable.prototype = new oFF.SacTable();
oFF.SacSpreadsheetTable.prototype._ff_c = "SacSpreadsheetTable";

oFF.SacSpreadsheetTable.createWithModel = function(model)
{
	var instance = new oFF.SacSpreadsheetTable();
	instance.internalSetup();
	instance.m_model = model;
	return instance;
};
oFF.SacSpreadsheetTable.prototype.m_model = null;
oFF.SacSpreadsheetTable.prototype.m_linkedSelection = null;
oFF.SacSpreadsheetTable.prototype.m_linkedTable = null;
oFF.SacSpreadsheetTable.prototype.setupLinkedSelection = function(linkedTable, selection)
{
	this.m_linkedSelection = selection;
	this.m_linkedTable = linkedTable;
	this.updateLinkedSelection();
};
oFF.SacSpreadsheetTable.prototype.updateLinkedSelection = function()
{
	if (oFF.notNull(this.m_linkedSelection) && oFF.notNull(this.m_linkedTable))
	{
		var linkedData = oFF.SacBasicTableClipboardHelper.create(this.m_linkedTable).copyCells(this.m_linkedSelection);
		var colMin = linkedData.getIntegerByKey(oFF.SacTable.SELECTION_COL_MIN);
		var rowMin = linkedData.getIntegerByKey(oFF.SacTable.SELECTION_ROW_MIN);
		var cellList = linkedData.getListByKey(oFF.SacTable.SELECTION_LIST);
		var plainString = "";
		var plain;
		for (var i = 0; i < cellList.size(); i++)
		{
			var cell = cellList.getStructureAt(i);
			var colIndex = cell.getIntegerByKey(oFF.SacTableConstants.C_N_COLUMN) - colMin;
			var rowIndex = cell.getIntegerByKey(oFF.SacTableConstants.C_N_ROW) - rowMin;
			var cells;
			if (rowIndex < this.getHeaderRowList().size())
			{
				cells = this.getHeaderRowList().get(rowIndex).getCells();
				if (colIndex < cells.size())
				{
					plain = cell.getByKey(oFF.SacTableConstants.C_SN_PLAIN);
					plainString = (oFF.isNull(plain)) ? "" : plain.getStringRepresentation();
					this.m_model.getCellAtAddress(oFF.XCellAddress.createWithIndices(rowIndex, colIndex)).updateTextFromLinkedObject(plainString);
				}
			}
			else if (rowIndex - this.getHeaderRowList().size() < this.getRowList().size())
			{
				cells = this.getRowList().get(rowIndex - this.getHeaderRowList().size()).getCells();
				if (colIndex < cells.size())
				{
					plain = cell.getByKey(oFF.SacTableConstants.C_SN_PLAIN);
					plainString = (oFF.isNull(plain)) ? "" : plain.getStringRepresentation();
					this.m_model.getCellAtAddress(oFF.XCellAddress.createWithIndices(rowIndex, colIndex)).updateTextFromLinkedObject(plainString);
				}
			}
		}
	}
};

oFF.SpreadSheetTableView = function() {};
oFF.SpreadSheetTableView.prototype = new oFF.DfUiContentView();
oFF.SpreadSheetTableView.prototype._ff_c = "SpreadSheetTableView";

oFF.SpreadSheetTableView.create = function(genesis)
{
	var instance = new oFF.SpreadSheetTableView();
	instance.initView(genesis);
	return instance;
};
oFF.SpreadSheetTableView.prototype.m_contentLayout = null;
oFF.SpreadSheetTableView.prototype.m_sacTable = null;
oFF.SpreadSheetTableView.prototype.m_formulaInput = null;
oFF.SpreadSheetTableView.prototype.m_cellAddressInput = null;
oFF.SpreadSheetTableView.prototype.m_abstractSacTable = null;
oFF.SpreadSheetTableView.prototype.m_abstractTableRenderer = null;
oFF.SpreadSheetTableView.prototype.m_tableClipboardHelper = null;
oFF.SpreadSheetTableView.prototype.m_controller = null;
oFF.SpreadSheetTableView.prototype.m_columnMin = 0;
oFF.SpreadSheetTableView.prototype.m_rowMin = 0;
oFF.SpreadSheetTableView.prototype.m_currentSelectionElement = null;
oFF.SpreadSheetTableView.prototype.setupView = function() {};
oFF.SpreadSheetTableView.prototype.buildViewUi = function(genesis)
{
	this.m_contentLayout = genesis.newControl(oFF.UiType.FLEX_LAYOUT);
	this.m_contentLayout.setDirection(oFF.UiFlexDirection.COLUMN);
	this.m_contentLayout.useMaxSpace();
	this.setupTopBar();
	this.m_controller = oFF.SpreadsheetController.create(this.m_formulaInput, this.m_cellAddressInput);
	this.m_controller.setTableView(this);
	this.m_sacTable = this.m_contentLayout.addNewItemOfType(oFF.UiType.SAC_TABLE_GRID);
	this.m_sacTable.useMaxSpace();
	this.m_sacTable.registerOnResize(this);
	this.m_sacTable.registerOnSelectionChange(this.m_controller);
	this.m_abstractSacTable = oFF.SacSpreadsheetTable.createWithModel(this.m_controller.getModel());
	this.m_abstractTableRenderer = oFF.SpreadsheetRenderer.create(this.m_abstractSacTable, this.m_controller.getModel());
	this.m_tableClipboardHelper = oFF.SacSpreadsheetClipboardHelper.createForSpreadsheet(this.m_abstractSacTable, this.m_controller.getModel());
	this.createExampleCells();
	this.renderSpreadsheet();
	genesis.setRoot(this.m_contentLayout);
};
oFF.SpreadSheetTableView.prototype.destroyView = function()
{
	this.m_formulaInput = oFF.XObjectExt.release(this.m_formulaInput);
	this.m_cellAddressInput = oFF.XObjectExt.release(this.m_cellAddressInput);
	this.m_sacTable = oFF.XObjectExt.release(this.m_sacTable);
	this.m_abstractSacTable = oFF.XObjectExt.release(this.m_abstractSacTable);
	this.m_abstractTableRenderer = oFF.XObjectExt.release(this.m_abstractTableRenderer);
	this.m_controller = oFF.XObjectExt.release(this.m_controller);
	this.m_tableClipboardHelper = oFF.XObjectExt.release(this.m_tableClipboardHelper);
};
oFF.SpreadSheetTableView.prototype.setupTopBar = function()
{
	var topBarWrapper = this.m_contentLayout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	topBarWrapper.setDirection(oFF.UiFlexDirection.ROW);
	topBarWrapper.setAlignItems(oFF.UiFlexAlignItems.CENTER);
	topBarWrapper.useMaxWidth();
	topBarWrapper.setFlex("0 0 34px");
	topBarWrapper.setBackgroundColor(oFF.UiColor.GREY.newBrighterColor(0.3));
	topBarWrapper.setBorderWidth(oFF.UiCssBoxEdges.create("0px 0px 1px 0px"));
	topBarWrapper.setBorderColor(oFF.UiColor.GREY);
	topBarWrapper.setBorderStyle(oFF.UiBorderStyle.SOLID);
	this.m_cellAddressInput = topBarWrapper.addNewItemOfType(oFF.UiType.INPUT);
	this.m_cellAddressInput.setTag("gdsSpreadsheetSelectedCellInput");
	this.m_cellAddressInput.setMargin(oFF.UiCssBoxEdges.create("0px 7px 0px 0px"));
	this.m_cellAddressInput.setFlex("0 0 100px");
	var cancelIcon = topBarWrapper.addNewItemOfType(oFF.UiType.ICON);
	cancelIcon.setTag("gdsSpreadsheetCancelIcon");
	cancelIcon.setIconSize(oFF.UiCssLength.create("20px"));
	cancelIcon.setIcon("decline");
	cancelIcon.setColor(oFF.UiColor.RED);
	cancelIcon.setMargin(oFF.UiCssBoxEdges.create("0px 7px"));
	var enterIcon = topBarWrapper.addNewItemOfType(oFF.UiType.ICON);
	enterIcon.setTag("gdsSpreadsheetEnterIcon");
	enterIcon.setIconSize(oFF.UiCssLength.create("20px"));
	enterIcon.setIcon("accept");
	enterIcon.setColor(oFF.UiColor.GREEN);
	enterIcon.setMargin(oFF.UiCssBoxEdges.create("0px 7px"));
	var functionIcon = topBarWrapper.addNewItemOfType(oFF.UiType.ICON);
	functionIcon.setIconSize(oFF.UiCssLength.create("20px"));
	functionIcon.setIcon("fx");
	functionIcon.setColor(oFF.UiColor.GREY);
	functionIcon.setMargin(oFF.UiCssBoxEdges.create("0px 7px"));
	functionIcon.setEnabled(false);
	this.m_formulaInput = topBarWrapper.addNewItemOfType(oFF.UiType.INPUT);
	this.m_formulaInput.setTag("gdsSpreadsheetFunctionInput");
};
oFF.SpreadSheetTableView.prototype.pasteCells = function(clipboardData)
{
	this.m_tableClipboardHelper.pasteCells(oFF.JsonParserFactory.createFromString(clipboardData).asStructure(), this.m_columnMin, this.m_rowMin);
	this.m_sacTable.setModelJson(this.m_abstractTableRenderer.render());
};
oFF.SpreadSheetTableView.prototype.copyCells = function()
{
	return this.m_tableClipboardHelper.copyCells(this.m_currentSelectionElement).toString();
};
oFF.SpreadSheetTableView.prototype.onResize = function(event)
{
	var width = event.getOffsetWidth();
	var height = event.getOffsetHeight();
	if (width !== 0 && height !== 0)
	{
		if (oFF.notNull(this.m_abstractSacTable))
		{
			this.m_abstractSacTable.setWidth(width);
			this.m_abstractSacTable.setHeight(height);
			this.m_sacTable.setModelJson(this.m_abstractTableRenderer.render());
		}
	}
};
oFF.SpreadSheetTableView.prototype.createExampleCells = function() {};
oFF.SpreadSheetTableView.prototype.setStyleOnCellRange = function(operation)
{
	var selectedCells = this.m_controller.getModel().getSelectedCells();
	for (var i = 0; i < selectedCells.size(); i++)
	{
		for (var j = 0; j < selectedCells.get(i).size(); j++)
		{
			operation(selectedCells.get(i).get(j));
		}
	}
};
oFF.SpreadSheetTableView.prototype.toggleSelectedCellBold = function()
{
	this.setStyleOnCellRange( function(cell){
		cell.setBold(!cell.getBold());
	}.bind(this));
	this.renderSpreadsheet();
};
oFF.SpreadSheetTableView.prototype.toggleSelectedCellItalic = function()
{
	this.setStyleOnCellRange( function(cell){
		cell.setItalic(!cell.getItalic());
	}.bind(this));
	this.renderSpreadsheet();
};
oFF.SpreadSheetTableView.prototype.setHorizontalAlignLeft = function()
{
	this.setHorizontalAlignment(oFF.SacTableCellHorizontalAlignment.LEFT);
};
oFF.SpreadSheetTableView.prototype.setHorizontalAlignCenter = function()
{
	this.setHorizontalAlignment(oFF.SacTableCellHorizontalAlignment.CENTER);
};
oFF.SpreadSheetTableView.prototype.setHorizontalAlignRight = function()
{
	this.setHorizontalAlignment(oFF.SacTableCellHorizontalAlignment.RIGHT);
};
oFF.SpreadSheetTableView.prototype.addDecimalPlace = function()
{
	this.setStyleOnCellRange( function(cell){
		cell.addRightDigit();
	}.bind(this));
	this.renderSpreadsheet();
};
oFF.SpreadSheetTableView.prototype.removeDecimalPlace = function()
{
	this.setStyleOnCellRange( function(cell){
		cell.removeRightDigit();
	}.bind(this));
	this.renderSpreadsheet();
};
oFF.SpreadSheetTableView.prototype.setHorizontalAlignment = function(horizontalAlignment)
{
	this.setStyleOnCellRange( function(cell){
		cell.setHorizontalAlignment(horizontalAlignment);
	}.bind(this));
	this.renderSpreadsheet();
};
oFF.SpreadSheetTableView.prototype.setSelectedCellBackgroundColor = function(color)
{
	var cssColor = oFF.XStringUtils.concatenate2("#", color);
	this.setStyleOnCellRange( function(cell){
		cell.setBackgroundColor(cssColor);
	}.bind(this));
	this.renderSpreadsheet();
};
oFF.SpreadSheetTableView.prototype.setSelectedCellFontSize = function(fontSize)
{
	this.setStyleOnCellRange( function(cell){
		cell.setFontSize(fontSize);
	}.bind(this));
	this.renderSpreadsheet();
};
oFF.SpreadSheetTableView.prototype.setSelectedCellTextColor = function(color)
{
	var cssColor = oFF.XStringUtils.concatenate2("#", color);
	this.setStyleOnCellRange( function(cell){
		cell.setTextColor(cssColor);
	}.bind(this));
	this.renderSpreadsheet();
};
oFF.SpreadSheetTableView.prototype.renderSpreadsheet = function()
{
	var result = this.m_abstractTableRenderer.render();
	this.m_sacTable.setModelJson(result);
};
oFF.SpreadSheetTableView.prototype.analyzeSelectionEvent = function(event)
{
	var selectionString = event.getParameters().getStringByKey(oFF.UiEventParams.PARAM_SELECTION_AREA);
	if (oFF.XStringUtils.isNotNullAndNotEmpty(selectionString))
	{
		var selectionElement = oFF.JsonParserFactory.createFromString(selectionString);
		if (!this.trySetupSelection(selectionElement))
		{
			this.m_columnMin = -1;
			this.m_rowMin = -1;
		}
	}
	else
	{
		this.m_columnMin = -1;
		this.m_rowMin = -1;
	}
};
oFF.SpreadSheetTableView.prototype.trySetupSelection = function(selectionElement)
{
	this.m_currentSelectionElement = selectionElement;
	var success = false;
	if (oFF.notNull(selectionElement))
	{
		if (selectionElement.isStructure())
		{
			this.analyseSelectionStructure(selectionElement.asStructure());
			success = true;
		}
		else if (selectionElement.isList())
		{
			var selectionList = selectionElement.asList();
			if (oFF.XCollectionUtils.hasElements(selectionList))
			{
				for (var i = 0; i < selectionList.size(); i++)
				{
					this.analyseSelectionStructure(selectionList.getStructureAt(i));
				}
				success = true;
			}
		}
	}
	return success;
};
oFF.SpreadSheetTableView.prototype.analyseSelectionStructure = function(selectionStructure)
{
	var startCol = selectionStructure.getIntegerByKey(oFF.SacTableConstants.CCD_N_START_COL);
	var endCol = selectionStructure.getIntegerByKey(oFF.SacTableConstants.CCD_N_END_COL);
	var startRow = selectionStructure.getIntegerByKey(oFF.SacTableConstants.CCD_N_START_ROW);
	var endRow = selectionStructure.getIntegerByKey(oFF.SacTableConstants.CCD_N_END_ROW);
	this.m_columnMin = oFF.XMath.min(startCol, endCol);
	this.m_rowMin = oFF.XMath.min(startRow, endRow);
};
oFF.SpreadSheetTableView.prototype.getCurrentSelectionElement = function()
{
	return this.m_currentSelectionElement;
};
oFF.SpreadSheetTableView.prototype.setSelectedCellBold = function()
{
	this.toggleSelectedCellBold();
};
oFF.SpreadSheetTableView.prototype.setSelectedCellItalic = function()
{
	this.toggleSelectedCellItalic();
};
oFF.SpreadSheetTableView.prototype.getTable = function()
{
	return this.m_abstractSacTable;
};
oFF.SpreadSheetTableView.prototype.getGridControl = function()
{
	return this.m_sacTable;
};
oFF.SpreadSheetTableView.prototype.getColumnMin = function()
{
	return this.m_columnMin;
};
oFF.SpreadSheetTableView.prototype.getRowMin = function()
{
	return this.m_rowMin;
};

oFF.CellEngineUiModule = function() {};
oFF.CellEngineUiModule.prototype = new oFF.DfModule();
oFF.CellEngineUiModule.prototype._ff_c = "CellEngineUiModule";

oFF.CellEngineUiModule.s_module = null;
oFF.CellEngineUiModule.getInstance = function()
{
	if (oFF.isNull(oFF.CellEngineUiModule.s_module))
	{
		oFF.DfModule.checkInitialized(oFF.CellEngineModule.getInstance());
		oFF.CellEngineUiModule.s_module = oFF.DfModule.startExt(new oFF.CellEngineUiModule());
		oFF.DfModule.stopExt(oFF.CellEngineUiModule.s_module);
	}
	return oFF.CellEngineUiModule.s_module;
};
oFF.CellEngineUiModule.prototype.getName = function()
{
	return "ff3350.cell.engine.ui";
};

oFF.DfModule.checkInitialized(oFF.VisualizationImplModule.getInstance());
oFF.DfModule.checkInitialized(oFF.CellEngineModule.getInstance());
oFF.CellEngineUiModule.getInstance();

return sap.firefly;
	} );