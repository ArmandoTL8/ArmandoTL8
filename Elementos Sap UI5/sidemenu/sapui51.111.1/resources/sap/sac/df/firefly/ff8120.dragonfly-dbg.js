/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
[
"sap/sac/df/firefly/ff4330.olap.catalog.impl","sap/sac/df/firefly/ff4340.olap.reference","sap/sac/df/firefly/ff4410.olap.ip.providers","sap/sac/df/firefly/ff8050.application.ui"
],
function(oFF)
{
"use strict";

oFF.Ui5GridExport = function() {};
oFF.Ui5GridExport.prototype = new oFF.XObject();
oFF.Ui5GridExport.prototype._ff_c = "Ui5GridExport";

oFF.Ui5GridExport.create = function(table, tableDefinition)
{
	var instance = new oFF.Ui5GridExport();
	instance.m_table = table;
	instance.m_tableDefinition = tableDefinition;
	return instance;
};
oFF.Ui5GridExport.getDimensionMemberName = function(dimensionMember)
{
	var name = null;
	var dimension = dimensionMember.getDimension();
	if (dimension.isStructure())
	{
		var structureMember = dimension.getStructureMember(dimensionMember.getName());
		var displayKeyField = structureMember.getDimension().getDisplayKeyField();
		var fieldValue = structureMember.getFieldValue(displayKeyField);
		if (oFF.notNull(fieldValue))
		{
			name = fieldValue.getValue().getStringRepresentation();
		}
	}
	if (oFF.isNull(name))
	{
		name = dimensionMember.getName();
	}
	return name;
};
oFF.Ui5GridExport.prototype.m_table = null;
oFF.Ui5GridExport.prototype.m_tableDefinition = null;
oFF.Ui5GridExport.prototype._export = function()
{
	var rowList = this.m_table.getRowList();
	var colList = this.m_table.getColumnList();
	var rows = rowList.size();
	var cols = colList.size();
	var endRow = rows - 1;
	var endCol = cols - 1;
	var grid = oFF.PrFactory.createStructure();
	grid.putInteger(oFF.Ui5GridExportConstants.TOTAL_ROWS, this.m_table.getRowsTotalCount());
	grid.putInteger(oFF.Ui5GridExportConstants.TOTAL_COLUMNS, this.m_table.getColumnsTotalCount());
	var headerRowList = this.m_table.getHeaderRowList();
	var cellsList = grid.putNewList("Cells");
	var headerRowSize = headerRowList.size();
	var colEndIndex = oFF.XMath.min(colList.size(), endCol + 1);
	var rowEndIndex = oFF.XMath.min(rowList.size(), endRow + 1);
	var row;
	var effectiveIndex = 0;
	var index;
	for (index = 0; index < headerRowSize; index++)
	{
		row = headerRowList.get(index);
		if (oFF.notNull(row) && !row.isEffectivelyHidden())
		{
			this.renderRow(cellsList, row, effectiveIndex++, colEndIndex);
		}
		else if (oFF.isNull(row))
		{
			effectiveIndex++;
		}
	}
	for (index = 0; index < rowEndIndex; index++)
	{
		row = rowList.get(index);
		if (oFF.notNull(row) && !row.isEffectivelyHidden())
		{
			this.renderRow(cellsList, row, effectiveIndex++, colEndIndex);
		}
		else if (oFF.isNull(row))
		{
			effectiveIndex++;
		}
	}
	return grid;
};
oFF.Ui5GridExport.prototype.renderRow = function(cellList, row, rowIndex, colEndIndex)
{
	var effectiveIndex = 0;
	var preColumnsAmount = this.m_table.getPreColumnsAmount();
	for (var i = 0; i < preColumnsAmount + colEndIndex; i++)
	{
		var cell = row.getCells().get(i);
		if (oFF.notNull(cell) && cell.getParentColumn() !== null && !cell.getParentColumn().isEffectivelyHidden())
		{
			this.renderCell(cellList, cell, rowIndex, effectiveIndex++);
		}
		else if (oFF.isNull(cell))
		{
			effectiveIndex++;
		}
	}
};
oFF.Ui5GridExport.prototype.renderCell = function(cellList, cellBase, rowIndex, colIndex)
{
	var cellJson = cellList.addNewStructure();
	cellJson.putInteger(oFF.Ui5GridExportConstants.ROW, rowIndex);
	cellJson.putInteger(oFF.Ui5GridExportConstants.COLUMN, colIndex);
	var mergedColumns = cellBase.getMergedColumns();
	var mergedRows = cellBase.getMergedRows();
	if (mergedColumns !== 0 || mergedRows !== 0)
	{
		var mergerStructure = cellJson.putNewStructure(oFF.Ui5GridExportConstants.MERGED);
		if (mergedColumns >= 0 && mergedRows >= 0)
		{
			if (cellBase.getMergedColumns() > 0)
			{
				mergerStructure.putInteger(oFF.Ui5GridExportConstants.MERGED_COLUMNS, cellBase.getMergedColumns());
			}
			if (cellBase.getMergedRows() > 0)
			{
				mergerStructure.putInteger(oFF.Ui5GridExportConstants.MERGED_ROWS, cellBase.getMergedRows());
			}
		}
		else
		{
			mergerStructure.putInteger(oFF.Ui5GridExportConstants.ORIGINAL_COLUMN, colIndex + cellBase.getMergedColumns());
			mergerStructure.putInteger(oFF.Ui5GridExportConstants.ORIGINAL_ROW, rowIndex + cellBase.getMergedRows());
		}
	}
	if (cellBase.getCommentDocumentId() !== null)
	{
		cellJson.putString(oFF.Ui5GridExportConstants.DOCUMENT_ID, cellBase.getCommentDocumentId());
	}
	var formattingPattern;
	if (!cellBase.isRepeatedHeader() || cellBase.isEffectiveRepetitiveHeaderCells())
	{
		cellJson.putString(oFF.Ui5GridExportConstants.FORMATTED, cellBase.getFormatted());
		formattingPattern = cellBase.getFormattingPattern();
	}
	else
	{
		cellJson.putString(oFF.Ui5GridExportConstants.FORMATTED, "");
		formattingPattern = "";
	}
	if (!cellBase.isHeaderCell())
	{
		cellJson.putString(oFF.Ui5GridExportConstants.FORMAT_STRING, formattingPattern);
	}
	if (cellBase.getPlain() !== null)
	{
		var valueType = cellBase.getPlain().getValueType();
		cellJson.putString(oFF.Ui5GridExportConstants.CELL_DATA_TYPE, valueType.getName());
		if (!cellBase.isHeaderCell())
		{
			if (valueType === oFF.XValueType.BOOLEAN)
			{
				cellJson.putBoolean(oFF.Ui5GridExportConstants.CELL_PLAIN, oFF.XValueUtil.getBoolean(cellBase.getPlain(), false, true));
			}
			else if (valueType === oFF.XValueType.DOUBLE)
			{
				cellJson.putDouble(oFF.Ui5GridExportConstants.CELL_PLAIN, oFF.XValueUtil.getDouble(cellBase.getPlain(), false, true));
			}
			else if (valueType === oFF.XValueType.LONG)
			{
				cellJson.putLong(oFF.Ui5GridExportConstants.CELL_PLAIN, oFF.XValueUtil.getLong(cellBase.getPlain(), false, true));
			}
			else if (valueType === oFF.XValueType.INTEGER)
			{
				cellJson.putInteger(oFF.Ui5GridExportConstants.CELL_PLAIN, oFF.XValueUtil.getInteger(cellBase.getPlain(), false, true));
			}
			else
			{
				cellJson.putString(oFF.Ui5GridExportConstants.CELL_PLAIN, cellBase.getPlain().getStringRepresentation());
			}
		}
	}
	var effectiveCellType = cellBase.getEffectiveCellType();
	var cellType = this.getCellType(effectiveCellType);
	cellJson.putString(oFF.Ui5GridExportConstants.CELL_TYPE, cellType);
	var tupleElement;
	if (oFF.XString.isEqual(cellType, oFF.Ui5GridExportConstants.CT_DIM_MEMBER_COL) || oFF.XString.isEqual(cellType, oFF.Ui5GridExportConstants.CT_VALUE))
	{
		var parentColumn = cellBase.getParentColumn();
		var colTupleIndex = parentColumn.getTupleIndex();
		cellJson.putInteger("TupleIndexCol", colTupleIndex);
	}
	if (oFF.XString.isEqual(cellType, oFF.Ui5GridExportConstants.CT_DIM_MEMBER_ROW) || oFF.XString.isEqual(cellType, oFF.Ui5GridExportConstants.CT_VALUE))
	{
		var parentRow = cellBase.getParentRow();
		var rowTupleIndex = parentRow.getTupleIndex();
		cellJson.putInteger("TupleIndexRow", rowTupleIndex);
	}
	if (oFF.XString.isEqual(cellType, oFF.Ui5GridExportConstants.CT_DIM_MEMBER_COL) || oFF.XString.isEqual(cellType, oFF.Ui5GridExportConstants.CT_DIM_HEADER_COL))
	{
		var columnDimension = this.m_tableDefinition.getColumnDimension(rowIndex);
		cellJson.putString("Dimension", this.getDimensionName(columnDimension));
	}
	if (oFF.XString.isEqual(cellType, oFF.Ui5GridExportConstants.CT_DIM_MEMBER_ROW) || oFF.XString.isEqual(cellType, oFF.Ui5GridExportConstants.CT_DIM_HEADER_ROW))
	{
		var rowDimension = this.m_tableDefinition.getRowDimension(colIndex);
		cellJson.putString("Dimension", this.getDimensionName(rowDimension));
	}
	if (oFF.XString.isEqual(cellType, oFF.Ui5GridExportConstants.CT_DIM_MEMBER_COL))
	{
		tupleElement = this.m_tableDefinition.getColumnTupleElement(colIndex, rowIndex);
		var dimensionMember = tupleElement.getDimensionMember();
		cellJson.putString("Member", oFF.Ui5GridExport.getDimensionMemberName(dimensionMember));
		cellJson.putBoolean(oFF.Ui5GridExportConstants.REPEATED_MEMBER_NAME, cellBase.isRepeatedHeader());
	}
	if (oFF.XString.isEqual(cellType, oFF.Ui5GridExportConstants.CT_DIM_MEMBER_ROW))
	{
		tupleElement = this.m_tableDefinition.getRowTupleElement(colIndex, rowIndex);
		cellJson.putString("Member", oFF.Ui5GridExport.getDimensionMemberName(tupleElement.getDimensionMember()));
		cellJson.putBoolean(oFF.Ui5GridExportConstants.REPEATED_MEMBER_NAME, cellBase.isRepeatedHeader());
	}
	if (cellBase.isEffectiveTotalsContext())
	{
		cellJson.putBoolean(oFF.Ui5GridExportConstants.TOTALS, true);
	}
	var inHierarchy = cellBase.isInHierarchy();
	cellJson.putBoolean(oFF.Ui5GridExportConstants.IN_HIERARCHY, inHierarchy);
	if (inHierarchy)
	{
		cellJson.putInteger(oFF.Ui5GridExportConstants.HIERARCHY_LEVEL, cellBase.getHierarchyLevel());
		cellJson.putBoolean(oFF.Ui5GridExportConstants.HIERARCHY_NODE_EXPANDED, cellBase.isExpanded());
	}
	this.fillSemanticObjects(cellJson, cellBase, rowIndex, colIndex, oFF.XString.isEqual(cellType, oFF.Ui5GridExportConstants.CT_VALUE));
};
oFF.Ui5GridExport.prototype.fillSemanticObjects = function(cell, cellBase, rowIndex, colIndex, isDataCell)
{
	var semanticObjects = oFF.PrFactory.createList();
	this.addSemanticObjectFromTupleElement(semanticObjects, this.m_tableDefinition.getColumnTupleElement(colIndex, rowIndex));
	this.addSemanticObjectFromTupleElement(semanticObjects, this.m_tableDefinition.getRowTupleElement(colIndex, rowIndex));
	if (isDataCell)
	{
		var tuple = this.m_tableDefinition.getColumnTuple(colIndex);
		var i;
		for (i = 0; i < tuple.size(); i++)
		{
			this.addSemanticObjectFromTupleElement(semanticObjects, tuple.getTupleElementAt(i));
		}
		tuple = this.m_tableDefinition.getRowTuple(rowIndex);
		for (i = 0; i < tuple.size(); i++)
		{
			this.addSemanticObjectFromTupleElement(semanticObjects, tuple.getTupleElementAt(i));
		}
	}
	var dataCellRef = cellBase.getDataCellRef();
	if (oFF.notNull(dataCellRef))
	{
		var queryDataCell = this.m_tableDefinition.getQueryModel().getQueryDataCell(dataCellRef);
		if (oFF.notNull(queryDataCell) && queryDataCell.getSemanticObject() !== null)
		{
			semanticObjects.addString(queryDataCell.getSemanticObject());
		}
	}
	if (semanticObjects.hasElements())
	{
		cell.put("SemanticObjects", semanticObjects);
	}
};
oFF.Ui5GridExport.prototype.addSemanticObjectFromTupleElement = function(semanticObjects, tupleElement)
{
	if (oFF.notNull(tupleElement))
	{
		var dimension = this.m_tableDefinition.getQueryModel().getDimensionByName(tupleElement.getDimension().getName());
		var semanticObject = dimension.getSemanticObject();
		if (oFF.notNull(semanticObject))
		{
			semanticObjects.addString(semanticObject);
		}
		if (dimension.isStructure())
		{
			var dimensionMember = tupleElement.getDimensionMember();
			if (oFF.notNull(dimensionMember))
			{
				var structureMember = dimension.getStructureMember(dimensionMember.getName());
				semanticObject = structureMember.getSemanticObject();
				if (oFF.notNull(semanticObject))
				{
					semanticObjects.addString(semanticObject);
				}
			}
		}
	}
};
oFF.Ui5GridExport.prototype.getDimensionName = function(dimension)
{
	var mdDimension = this.m_tableDefinition.getQueryModel().getDimensionByName(dimension.getName());
	if (mdDimension.isMeasureStructure())
	{
		return "MeasureStructure";
	}
	if (mdDimension.isStructure())
	{
		return "NonMeasureStructure";
	}
	return mdDimension.getExternalName() !== null ? mdDimension.getExternalName() : dimension.getName();
};
oFF.Ui5GridExport.prototype.getCellType = function(effectiveCellType)
{
	if (effectiveCellType === oFF.SacTableConstants.CT_VALUE)
	{
		return oFF.Ui5GridExportConstants.CT_VALUE;
	}
	else if (effectiveCellType === oFF.SacTableConstants.CT_INPUT)
	{
		return oFF.Ui5GridExportConstants.CT_VALUE;
	}
	else if (effectiveCellType === oFF.SacTableConstants.CT_UNBOOKED)
	{
		return oFF.Ui5GridExportConstants.CT_VALUE;
	}
	else if (effectiveCellType === oFF.SacTableConstants.CT_HEADER)
	{
		return oFF.Ui5GridExportConstants.CT_HEADER;
	}
	else if (effectiveCellType === oFF.SacTableConstants.CT_ROW_DIM_HEADER)
	{
		return oFF.Ui5GridExportConstants.CT_DIM_HEADER_ROW;
	}
	else if (effectiveCellType === oFF.SacTableConstants.CT_COL_DIM_HEADER)
	{
		return oFF.Ui5GridExportConstants.CT_DIM_HEADER_COL;
	}
	else if (effectiveCellType === oFF.SacTableConstants.CT_COL_DIM_MEMBER)
	{
		return oFF.Ui5GridExportConstants.CT_DIM_MEMBER_COL;
	}
	else if (effectiveCellType === oFF.SacTableConstants.CT_ROW_DIM_MEMBER)
	{
		return oFF.Ui5GridExportConstants.CT_DIM_MEMBER_ROW;
	}
	else if (effectiveCellType === oFF.SacTableConstants.CT_EMPTY_AXIS_ROW_HEADER)
	{
		return oFF.Ui5GridExportConstants.CT_EMPTY_AXIS_HEADER_ROW;
	}
	else if (effectiveCellType === oFF.SacTableConstants.CT_EMPTY_AXIS_COLUMN_HEADER)
	{
		return oFF.Ui5GridExportConstants.CT_EMPTY_AXIS_HEADER_COL;
	}
	else
	{
		return oFF.XInteger.convertToString(effectiveCellType);
	}
};

oFF.Ui5GridExportConstants = {

	TOTAL_ROWS:"TotalRows",
	TOTAL_COLUMNS:"TotalColumns",
	IN_HIERARCHY:"InHierarchy",
	HIERARCHY_LEVEL:"HierarchyLevel",
	HIERARCHY_NODE_EXPANDED:"HierarchyNodeExpanded",
	ROW:"Row",
	COLUMN:"Column",
	MERGED:"Merged",
	MERGED_COLUMNS:"MergedColumns",
	MERGED_ROWS:"MergedRows",
	ORIGINAL_COLUMN:"OriginalColumn",
	ORIGINAL_ROW:"OriginalRow",
	DOCUMENT_ID:"DocumentId",
	FORMATTED:"Value",
	FORMAT_STRING:"FormatString",
	REPEATED_MEMBER_NAME:"RepeatedMemberName",
	CELL_DATA_TYPE:"Type",
	CELL_PLAIN:"PlainValue",
	CELL_TYPE:"CellType",
	CT_VALUE:"Value",
	CT_HEADER:"Header",
	CT_DIM_HEADER_ROW:"DimHeaderRow",
	CT_DIM_HEADER_COL:"DimHeaderCol",
	CT_DIM_MEMBER_COL:"DimMemberCol",
	CT_DIM_MEMBER_ROW:"DimMemberRow",
	CT_EMPTY_AXIS_HEADER_ROW:"EmptyAxisHeaderRow",
	CT_EMPTY_AXIS_HEADER_COL:"EmptyAxisHeaderCol",
	DATA_ROW:"DataRow",
	DATA_COLUMN:"DataColumn",
	TOTALS:"Totals"
};

oFF.DragonflyModule = function() {};
oFF.DragonflyModule.prototype = new oFF.DfModule();
oFF.DragonflyModule.prototype._ff_c = "DragonflyModule";

oFF.DragonflyModule.s_module = null;
oFF.DragonflyModule.getInstance = function()
{
	if (oFF.isNull(oFF.DragonflyModule.s_module))
	{
		oFF.DfModule.checkInitialized(oFF.ProviderModule.getInstance());
		oFF.DfModule.checkInitialized(oFF.OlapReferenceModule.getInstance());
		oFF.DfModule.checkInitialized(oFF.OlapCatalogImplModule.getInstance());
		oFF.DfModule.checkInitialized(oFF.ApplicationUiModule.getInstance());
		oFF.DragonflyModule.s_module = oFF.DfModule.startExt(new oFF.DragonflyModule());
		oFF.DfModule.stopExt(oFF.DragonflyModule.s_module);
	}
	return oFF.DragonflyModule.s_module;
};
oFF.DragonflyModule.prototype.getName = function()
{
	return "ff8120.dragonfly";
};

oFF.DragonflyModule.getInstance();

return sap.firefly;
	} );