/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
[
"sap/sac/df/firefly/ff0005.language.ext","sap/sac/df/firefly/ff0040.commons","sap/sac/df/firefly/ff0070.structures","sap/sac/df/firefly/ff2650.visualization.impl"
],
function(oFF)
{
"use strict";

oFF.ExportHandlerFactory = function() {};
oFF.ExportHandlerFactory.prototype = new oFF.XObject();
oFF.ExportHandlerFactory.prototype._ff_c = "ExportHandlerFactory";

oFF.ExportHandlerFactory.s_driverFactory = null;
oFF.ExportHandlerFactory.create = function()
{
	var eh = null;
	if (oFF.notNull(oFF.ExportHandlerFactory.s_driverFactory))
	{
		eh = oFF.ExportHandlerFactory.s_driverFactory.newExportHandler();
	}
	return eh;
};
oFF.ExportHandlerFactory.registerFactory = function(driverFactory)
{
	oFF.ExportHandlerFactory.s_driverFactory = driverFactory;
};

oFF.Appendix = function() {};
oFF.Appendix.prototype = new oFF.XObjectExt();
oFF.Appendix.prototype._ff_c = "Appendix";

oFF.Appendix.create = function(title, techTitle, tenantTitle, queryTitle, infoProvTitle, modelTitle, createdByTitle, createdOnTitle)
{
	var result = new oFF.Appendix();
	result.m_title = title;
	result.m_techTitle = techTitle;
	result.m_tenantTitle = tenantTitle;
	result.m_queryTitle = queryTitle;
	result.m_infoProvTitle = infoProvTitle;
	result.m_modelTitle = modelTitle;
	result.m_createdByTitle = createdByTitle;
	result.m_createdOnTitle = createdOnTitle;
	result.m_techRow = oFF.PrFactory.createStructure();
	result.setTechRow();
	result.m_tenantRow = oFF.PrFactory.createStructure();
	result.m_queryRow = oFF.PrFactory.createStructure();
	result.m_infoProvRow = oFF.PrFactory.createStructure();
	result.m_modelRow = oFF.PrFactory.createStructure();
	result.m_createdByRow = oFF.PrFactory.createStructure();
	result.m_createdOnRow = oFF.PrFactory.createStructure();
	return result;
};
oFF.Appendix.clearRow = function(row)
{
	if (row.size() > 0)
	{
		row.clear();
	}
	return row.putNewList(oFF.Model.TABLE_ROW_CELLS);
};
oFF.Appendix.getCells = function(row)
{
	return row.getListByKey(oFF.Model.TABLE_ROW_CELLS);
};
oFF.Appendix.getRowSize = function(row)
{
	if (oFF.notNull(row) && row.size() > 0)
	{
		var cells = oFF.Appendix.getCells(row);
		if (oFF.notNull(cells))
		{
			return cells.size();
		}
	}
	return 0;
};
oFF.Appendix.addRowToTableRows = function(row, tableRows, maxRowSize)
{
	if (oFF.Appendix.getRowSize(row) > 0)
	{
		var cells = oFF.Appendix.getCells(row);
		var curSize = cells.size();
		while (curSize < maxRowSize)
		{
			curSize = curSize + 1;
			oFF.Appendix.padWithEmptyCell(cells);
		}
		tableRows.add(row);
	}
};
oFF.Appendix.padWithEmptyCell = function(cells)
{
	oFF.Appendix.addDataToCellsConditionally(cells, "", true);
};
oFF.Appendix.addDataToCells = function(cells, data)
{
	oFF.Appendix.addDataToCellsConditionally(cells, data, false);
};
oFF.Appendix.addDataToCellsConditionally = function(cells, data, allowEmpty)
{
	if (allowEmpty && oFF.notNull(data) || !oFF.XStringUtils.isNullOrEmpty(data))
	{
		cells.addNewStructure().putString(oFF.Model.FORMATTED_VALUE, data);
	}
};
oFF.Appendix.prototype.m_title = null;
oFF.Appendix.prototype.m_techTitle = null;
oFF.Appendix.prototype.m_tenantTitle = null;
oFF.Appendix.prototype.m_queryTitle = null;
oFF.Appendix.prototype.m_infoProvTitle = null;
oFF.Appendix.prototype.m_modelTitle = null;
oFF.Appendix.prototype.m_createdByTitle = null;
oFF.Appendix.prototype.m_createdOnTitle = null;
oFF.Appendix.prototype.m_techRow = null;
oFF.Appendix.prototype.m_tenantRow = null;
oFF.Appendix.prototype.m_queryRow = null;
oFF.Appendix.prototype.m_infoProvRow = null;
oFF.Appendix.prototype.m_modelRow = null;
oFF.Appendix.prototype.m_createdByRow = null;
oFF.Appendix.prototype.m_createdOnRow = null;
oFF.Appendix.prototype.m_allRows = null;
oFF.Appendix.prototype.getTitle = function()
{
	return this.m_title;
};
oFF.Appendix.prototype.getAllRows = function()
{
	if (oFF.isNull(this.m_allRows))
	{
		this.m_allRows = oFF.XList.create();
		this.m_allRows.add(this.m_techRow);
		this.m_allRows.add(this.m_tenantRow);
		this.m_allRows.add(this.m_queryRow);
		this.m_allRows.add(this.m_infoProvRow);
		this.m_allRows.add(this.m_modelRow);
		this.m_allRows.add(this.m_createdByRow);
		this.m_allRows.add(this.m_createdOnRow);
	}
	return this.m_allRows;
};
oFF.Appendix.prototype.getMaxRowSize = function()
{
	var result = 0;
	var appendixRows = this.getAllRows();
	for (var rIdx = 0; rIdx < appendixRows.size(); rIdx++)
	{
		result = oFF.XMath.max(result, oFF.Appendix.getRowSize(appendixRows.get(rIdx)));
	}
	return result;
};
oFF.Appendix.prototype.setTechRow = function()
{
	var cells = oFF.Appendix.clearRow(this.m_techRow);
	oFF.Appendix.addDataToCells(cells, this.m_techTitle);
};
oFF.Appendix.prototype.setTenantData = function(url)
{
	if (oFF.notNull(url))
	{
		var cells = oFF.Appendix.clearRow(this.m_tenantRow);
		oFF.Appendix.addDataToCells(cells, this.m_tenantTitle);
		oFF.Appendix.addDataToCells(cells, url.getUrlExt(true, false, false, false, false, true, true, false, false));
	}
};
oFF.Appendix.prototype.setQueryData = function(technicalName, description, type)
{
	if (oFF.XStringUtils.isNotNullAndNotEmpty(technicalName) || oFF.XStringUtils.isNotNullAndNotEmpty(description))
	{
		var startIndex = oFF.XString.lastIndexOf(technicalName, "[") + 1;
		var endIndex = oFF.XString.lastIndexOf(technicalName, "]");
		var name = oFF.XString.substring(technicalName, startIndex, endIndex);
		var cells;
		if (oFF.notNull(type) && type.isTypeOf(oFF.SystemType.ORCA))
		{
			cells = oFF.Appendix.clearRow(this.m_modelRow);
			oFF.Appendix.addDataToCells(cells, this.m_modelTitle);
		}
		else
		{
			cells = oFF.Appendix.clearRow(this.m_queryRow);
			oFF.Appendix.addDataToCells(cells, this.m_queryTitle);
		}
		oFF.Appendix.addDataToCells(cells, name);
		if (!oFF.XString.isEqual(name, description))
		{
			oFF.Appendix.addDataToCells(cells, description);
		}
	}
};
oFF.Appendix.prototype.setInfoProviderData = function(name, description)
{
	if (oFF.XStringUtils.isNotNullAndNotEmpty(name) || oFF.XStringUtils.isNotNullAndNotEmpty(description))
	{
		var cells = oFF.Appendix.clearRow(this.m_infoProvRow);
		oFF.Appendix.addDataToCells(cells, this.m_infoProvTitle);
		oFF.Appendix.addDataToCells(cells, name);
		if (!oFF.XString.isEqual(name, description))
		{
			oFF.Appendix.addDataToCells(cells, description);
		}
	}
};
oFF.Appendix.prototype.setCreatedBy = function(createdBy)
{
	if (oFF.XStringUtils.isNotNullAndNotEmpty(createdBy))
	{
		var cells = oFF.Appendix.clearRow(this.m_createdByRow);
		oFF.Appendix.addDataToCells(cells, this.m_createdByTitle);
		oFF.Appendix.addDataToCells(cells, createdBy);
	}
};
oFF.Appendix.prototype.setCreatedOn = function(date)
{
	if (oFF.notNull(date))
	{
		var cells = oFF.Appendix.clearRow(this.m_createdOnRow);
		oFF.Appendix.addDataToCells(cells, this.m_createdOnTitle);
		oFF.Appendix.addDataToCells(cells, date.toIsoFormat());
	}
};
oFF.Appendix.prototype.populateTable = function(table)
{
	var rows = table.getListByKey(oFF.Model.TABLE_ROWS_KEY);
	var maxRowSize = this.getMaxRowSize();
	var widths = table.putNewList(oFF.Model.COL_WIDTHS_KEY);
	var isFirst = true;
	while (widths.size() < maxRowSize)
	{
		if (isFirst)
		{
			isFirst = false;
			widths.addDouble(40.0);
		}
		else
		{
			widths.addDouble(80.0);
		}
	}
	var appendixRows = this.getAllRows();
	for (var rIdx = 0; rIdx < appendixRows.size(); rIdx++)
	{
		oFF.Appendix.addRowToTableRows(appendixRows.get(rIdx), rows, maxRowSize);
	}
};
oFF.Appendix.prototype.releaseObject = function()
{
	oFF.XObjectExt.release(this.m_techRow);
	oFF.XObjectExt.release(this.m_tenantRow);
	oFF.XObjectExt.release(this.m_queryRow);
	oFF.XObjectExt.release(this.m_infoProvRow);
	oFF.XObjectExt.release(this.m_modelRow);
	oFF.XObjectExt.release(this.m_createdByRow);
	oFF.XObjectExt.release(this.m_createdOnRow);
	oFF.XObjectExt.release(this.m_allRows);
	oFF.XObjectExt.prototype.releaseObject.call( this );
};

oFF.BaseExportConfig = function() {};
oFF.BaseExportConfig.prototype = new oFF.XObjectExt();
oFF.BaseExportConfig.prototype._ff_c = "BaseExportConfig";

oFF.BaseExportConfig.CSV_EXPORT = "CSV";
oFF.BaseExportConfig.PDF_EXPORT = "PDF";
oFF.BaseExportConfig.XLSX_EXPORT = "XLSX";
oFF.BaseExportConfig.prototype.root = null;
oFF.BaseExportConfig.prototype.m_fileName = "";
oFF.BaseExportConfig.prototype.m_flatten = false;
oFF.BaseExportConfig.prototype.m_includeFormatting = false;
oFF.BaseExportConfig.prototype.m_scope = "";
oFF.BaseExportConfig.prototype.m_expandHierarchy = false;
oFF.BaseExportConfig.prototype.m_appendix = null;
oFF.BaseExportConfig.prototype.m_enablePdfAppendix = false;
oFF.BaseExportConfig.prototype.init = function(conf)
{
	this.root = conf;
};
oFF.BaseExportConfig.prototype.getStructure = function()
{
	return this.root;
};
oFF.BaseExportConfig.prototype.setFileName = function(name)
{
	this.m_fileName = name;
};
oFF.BaseExportConfig.prototype.getFileName = function()
{
	return this.m_fileName;
};
oFF.BaseExportConfig.prototype.setScope = function(scope)
{
	this.m_scope = scope;
};
oFF.BaseExportConfig.prototype.getScope = function()
{
	return this.m_scope;
};
oFF.BaseExportConfig.prototype.setFlattenHierarchy = function(flatten)
{
	this.m_flatten = flatten;
};
oFF.BaseExportConfig.prototype.getFlattenHierarchy = function()
{
	return this.m_flatten;
};
oFF.BaseExportConfig.prototype.setIncludeFormatting = function(include)
{
	this.m_includeFormatting = include;
};
oFF.BaseExportConfig.prototype.getIncludeFormatting = function()
{
	return this.m_includeFormatting;
};
oFF.BaseExportConfig.prototype.setExpandHierarchy = function(expand)
{
	this.m_expandHierarchy = expand;
};
oFF.BaseExportConfig.prototype.getExpandHierarchy = function()
{
	return this.m_expandHierarchy;
};
oFF.BaseExportConfig.prototype.setEnablePdfAppendix = function(enable)
{
	this.m_enablePdfAppendix = enable;
};
oFF.BaseExportConfig.prototype.supportsAppendix = function()
{
	return oFF.XString.isEqual(this.getType(), oFF.BaseExportConfig.XLSX_EXPORT) || oFF.XString.isEqual(this.getType(), oFF.BaseExportConfig.PDF_EXPORT) && this.m_enablePdfAppendix;
};
oFF.BaseExportConfig.prototype.includeAppendix = function()
{
	return oFF.notNull(this.m_appendix) && this.supportsAppendix();
};
oFF.BaseExportConfig.prototype.addAppendix = function(appendix)
{
	this.m_appendix = appendix;
};
oFF.BaseExportConfig.prototype.getAppendix = function()
{
	return this.m_appendix;
};
oFF.BaseExportConfig.prototype.releaseObject = function()
{
	oFF.XObjectExt.release(this.root);
	oFF.XObjectExt.release(this.m_appendix);
	oFF.XObjectExt.prototype.releaseObject.call( this );
};

oFF.Exporter = function() {};
oFF.Exporter.prototype = new oFF.XObjectExt();
oFF.Exporter.prototype._ff_c = "Exporter";

oFF.Exporter.create = function()
{
	var exp = new oFF.Exporter();
	exp.exportHandler = oFF.ExportHandlerFactory.create();
	return exp;
};
oFF.Exporter.prototype.exportHandler = null;
oFF.Exporter.prototype.exportCsv = function(model)
{
	this.exportHandler.exportCsv(model);
};
oFF.Exporter.prototype.exportXlsx = function(model)
{
	this.exportHandler.exportXlsx(model);
};
oFF.Exporter.prototype.exportPdf = function(model)
{
	this.exportHandler.exportPdf(model);
};

oFF.Model = function() {};
oFF.Model.prototype = new oFF.XObjectExt();
oFF.Model.prototype._ff_c = "Model";

oFF.Model.VALUE_KEY = "value";
oFF.Model.LINE_COLOR_KEY = "lineColor";
oFF.Model.CELL_STYLES_KEY = "cellStyles";
oFF.Model.TABLE_ROW_CELLS = "cells";
oFF.Model.FORMATTED_VALUE = "formattedValue";
oFF.Model.TABLE_ROWS_KEY = "rows";
oFF.Model.COL_WIDTHS_KEY = "colWidths";
oFF.Model.TABLE_TITLE_KEY = "title";
oFF.Model.MODEL_TABLES_KEY = "tables";
oFF.Model.PADDING_MIDDLE_KEY = "middle";
oFF.Model.PADDING_BOTTOM_KEY = "bottom";
oFF.Model.PADDING_TOP_KEY = "top";
oFF.Model.PADDING_CENTER_KEY = "center";
oFF.Model.XLSX_FORMAT_KEY = "xlFormat";
oFF.Model.TOTAL_WIDTH_KEY = "totalWidth";
oFF.Model.TOTAL_HEIGHT_KEY = "totalHeight";
oFF.Model.NUM_COLS_KEY = "numCols";
oFF.Model.PADDING_KEY = "padding";
oFF.Model.FONT_COLOR_KEY = "fontColor";
oFF.Model.LINE_SIZE_KEY = "lineSize";
oFF.Model.PADDING_LEFT_KEY = "left";
oFF.Model.PADDING_RIGHT_KEY = "right";
oFF.Model.STYLE_KEY = "style";
oFF.Model.FONT_WEIGHT_KEY = "fontWeight";
oFF.Model.HIER_PAD_RIGHT_KEY = "hierPadRight";
oFF.Model.HIER_PAD_LEFT_KEY = "hierPadLeft";
oFF.Model.HIER_PAD_TOP_KEY = "hierPadTop";
oFF.Model.FILE_NAME_KEY = "fileName";
oFF.Model.XLSX_CONF_KEY = "xlsx";
oFF.Model.CSV_CONF_KEY = "csv";
oFF.Model.PDF_CONF_KEY = "pdf";
oFF.Model.HOR_ALIGN_KEY = "horAlign";
oFF.Model.VERT_ALIGN_KEY = "vertAlign";
oFF.Model.NUM_HEADER_COLS = "numHeaderCols";
oFF.Model.NUM_HEADER_ROWS = "numHeaderRows";
oFF.Model.create = function()
{
	var model = new oFF.Model();
	model.root = oFF.PrFactory.createStructure();
	model.setupModel();
	return model;
};
oFF.Model.convertToMm = function(pixels)
{
	return pixels * 0.26458333;
};
oFF.Model.parseColor = function(iPrStructure, color)
{
	var replacePattern = oFF.XString.containsString(color, "rgba") ? "rgba(" : "rgb(";
	var noPrefix = oFF.XString.replace(color, replacePattern, "");
	var noPostfix = oFF.XString.replace(noPrefix, ")", "");
	var rgba = oFF.XStringTokenizer.splitString(noPostfix, ",");
	iPrStructure.putInteger("r", oFF.XInteger.convertFromString(rgba.get(0)));
	iPrStructure.putInteger("g", oFF.XInteger.convertFromString(rgba.get(1)));
	iPrStructure.putInteger("b", oFF.XInteger.convertFromString(rgba.get(2)));
};
oFF.Model.addRowsToModel = function(currentModel, config, styleMap, styles, exportRows, rows, baseRow)
{
	var formatStrMap = oFF.XLinkedHashMapByString.create();
	for (var i2 = 0; i2 < rows.size(); i2++)
	{
		var row = rows.get(i2);
		var exportRow = exportRows.addNewStructure();
		exportRow.putDouble("height", oFF.Model.convertToMm(row.getHeight()));
		var exportCells = exportRow.putNewList(oFF.Model.TABLE_ROW_CELLS);
		var cells = row.getCells();
		for (var j = 0; j < cells.size(); j++)
		{
			var cell = cells.get(j);
			var exportCell = exportCells.addNewStructure();
			var fvalue = cell.getFormatted();
			exportCell.putString(oFF.Model.FORMATTED_VALUE, oFF.isNull(fvalue) ? "" : fvalue);
			if (cell.getPlain() !== null && cell.getPlain().getValueType().isNumber())
			{
				exportCell.putDouble(oFF.Model.VALUE_KEY, oFF.XValueUtil.getDouble(cell.getPlain(), false, true));
			}
			exportCell.putBoolean("rowHeaderCell", cell.getType() === oFF.SacTableConstants.CT_ROW_DIM_HEADER);
			var style = cell.getTableStyle();
			var exportCellStyle = oFF.PrFactory.createStructure();
			var pattern = cell.getFormattingPattern();
			var patternId = -1;
			if (oFF.XStringUtils.isNotNullAndNotEmpty(pattern) && oFF.XString.isEqual(config.getType(), oFF.BaseExportConfig.XLSX_EXPORT))
			{
				if (!formatStrMap.containsKey(pattern))
				{
					patternId = config.addNumberFormat(pattern);
					formatStrMap.put(pattern, oFF.XIntegerValue.create(patternId));
				}
				else
				{
					patternId = formatStrMap.getByKey(pattern).getInteger();
				}
				exportCellStyle.putInteger(oFF.Model.XLSX_FORMAT_KEY, patternId);
			}
			if (oFF.notNull(style) && style.getStyledLineBottom() !== null)
			{
				oFF.Model.parseColor(exportCellStyle.putNewStructure(oFF.Model.LINE_COLOR_KEY), style.getStyledLineBottom().getColor());
				exportCellStyle.putDouble(oFF.Model.LINE_SIZE_KEY, 0.26458333);
				var exportPadding = exportCellStyle.putNewStructure(oFF.Model.PADDING_KEY);
				exportPadding.putDouble(oFF.Model.PADDING_RIGHT_KEY, 1.06);
				exportPadding.putDouble(oFF.Model.PADDING_LEFT_KEY, 1.06);
				exportPadding.putDouble(oFF.Model.PADDING_BOTTOM_KEY, 1.06);
				exportPadding.putDouble(oFF.Model.PADDING_TOP_KEY, 1.06);
				if (cell.getHierarchyPaddingType() !== null)
				{
					exportPadding.putDouble(oFF.Model.convertHierPadding(cell.getHierarchyPaddingType()), oFF.Model.convertToMm(cell.getHierarchyPaddingValue()));
				}
				var styleKey = exportCellStyle.toString();
				if (!styleMap.containsKey(styleKey))
				{
					var nextIndex = styles.size();
					styleMap.put(styleKey, oFF.XIntegerValue.create(nextIndex));
					styles.add(exportCellStyle);
					exportCell.putInteger(oFF.Model.STYLE_KEY, nextIndex);
				}
				else
				{
					var index = styleMap.getByKey(styleKey);
					exportCell.putInteger(oFF.Model.STYLE_KEY, index.getInteger());
				}
			}
		}
	}
};
oFF.Model.setAlignments = function(style, exportCellStyle)
{
	var horAlign = oFF.SacTableConstants.HA_LEFT;
	var vertAlign = oFF.SacTableConstants.VA_MIDDLE;
	if (oFF.notNull(style))
	{
		var alignment = style.getStructureByKey(oFF.SacTableConstants.ST_M_ALIGNMENT);
		if (oFF.notNull(alignment))
		{
			horAlign = alignment.getIntegerByKey(oFF.SacTableConstants.STAL_N_HORIZONTAL);
			vertAlign = alignment.getIntegerByKey(oFF.SacTableConstants.STAL_N_VERTICAL);
		}
	}
	exportCellStyle.putString(oFF.Model.HOR_ALIGN_KEY, oFF.Model.getHorAlignment(horAlign));
	exportCellStyle.putString(oFF.Model.VERT_ALIGN_KEY, oFF.Model.getVertAlignment(vertAlign));
};
oFF.Model.getHorAlignment = function(align)
{
	if (align === oFF.SacTableConstants.HA_CENTER)
	{
		return oFF.Model.PADDING_CENTER_KEY;
	}
	else if (align === oFF.SacTableConstants.HA_LEFT)
	{
		return oFF.Model.PADDING_LEFT_KEY;
	}
	else if (align === oFF.SacTableConstants.HA_RIGHT)
	{
		return oFF.Model.PADDING_RIGHT_KEY;
	}
	else
	{
		return oFF.Model.PADDING_CENTER_KEY;
	}
};
oFF.Model.getVertAlignment = function(align)
{
	if (align === oFF.SacTableConstants.VA_TOP)
	{
		return oFF.Model.PADDING_TOP_KEY;
	}
	else if (align === oFF.SacTableConstants.VA_BOTTOM)
	{
		return oFF.Model.PADDING_BOTTOM_KEY;
	}
	else if (align === oFF.SacTableConstants.VA_MIDDLE)
	{
		return oFF.Model.PADDING_MIDDLE_KEY;
	}
	else
	{
		return oFF.Model.PADDING_MIDDLE_KEY;
	}
};
oFF.Model.convertHierPadding = function(hierarchyPaddingType)
{
	if (oFF.XString.isEqual(oFF.SacTableConstants.C_N_HIERARCHY_PADDING_LEFT, hierarchyPaddingType) || oFF.XString.isEqual(oFF.SacTableConstants.C_N_HIERARCHY_PADDING_TOP, hierarchyPaddingType))
	{
		return oFF.Model.HIER_PAD_LEFT_KEY;
	}
	return oFF.Model.HIER_PAD_RIGHT_KEY;
};
oFF.Model.prototype.root = null;
oFF.Model.prototype.csvConf = null;
oFF.Model.prototype.pdfConf = null;
oFF.Model.prototype.xlsConf = null;
oFF.Model.prototype.m_headerColumnsCellTypes = null;
oFF.Model.prototype.m_headerRowsCellTypes = null;
oFF.Model.prototype.asStructure = function()
{
	return this.root;
};
oFF.Model.prototype.setupModel = function()
{
	var headerRowsCellTypes = oFF.XList.create();
	headerRowsCellTypes.add(oFF.XIntegerValue.create(oFF.SacTableConstants.CT_COL_DIM_HEADER));
	headerRowsCellTypes.add(oFF.XIntegerValue.create(oFF.SacTableConstants.CT_COL_DIM_MEMBER));
	headerRowsCellTypes.add(oFF.XIntegerValue.create(oFF.SacTableConstants.CT_ATTRIBUTE_COL_DIM_HEADER));
	headerRowsCellTypes.add(oFF.XIntegerValue.create(oFF.SacTableConstants.CT_ATTRIBUTE_COL_DIM_MEMBER));
	headerRowsCellTypes.add(oFF.XIntegerValue.create(oFF.SacTableConstants.CT_ROW_DIM_HEADER));
	headerRowsCellTypes.add(oFF.XIntegerValue.create(oFF.SacTableConstants.CT_ATTRIBUTE_ROW_DIM_HEADER));
	this.m_headerRowsCellTypes = headerRowsCellTypes;
	var headerColumnsCellTypes = oFF.XList.create();
	headerColumnsCellTypes.add(oFF.XIntegerValue.create(oFF.SacTableConstants.CT_ROW_DIM_HEADER));
	headerColumnsCellTypes.add(oFF.XIntegerValue.create(oFF.SacTableConstants.CT_ROW_DIM_MEMBER));
	headerColumnsCellTypes.add(oFF.XIntegerValue.create(oFF.SacTableConstants.CT_ATTRIBUTE_ROW_DIM_HEADER));
	headerColumnsCellTypes.add(oFF.XIntegerValue.create(oFF.SacTableConstants.CT_ATTRIBUTE_ROW_DIM_MEMBER));
	this.m_headerColumnsCellTypes = headerColumnsCellTypes;
};
oFF.Model.prototype.setFileName = function(name)
{
	this.root.putString(oFF.Model.FILE_NAME_KEY, name);
};
oFF.Model.prototype.getFileName = function()
{
	return this.root.getStringByKey(oFF.Model.FILE_NAME_KEY);
};
oFF.Model.prototype.setConfig = function(conf)
{
	if (oFF.XString.isEqual(oFF.BaseExportConfig.CSV_EXPORT, conf.getType()))
	{
		this.root.put(oFF.Model.CSV_CONF_KEY, conf.getStructure());
	}
	else if (oFF.XString.isEqual(oFF.BaseExportConfig.PDF_EXPORT, conf.getType()))
	{
		this.root.put(oFF.Model.PDF_CONF_KEY, conf.getStructure());
	}
	else if (oFF.XString.isEqual(oFF.BaseExportConfig.XLSX_EXPORT, conf.getType()))
	{
		this.getXlsxConfigs().add(conf.getStructure());
	}
};
oFF.Model.prototype.getXlsxConfigs = function()
{
	var result;
	if (!this.root.containsKey(oFF.Model.XLSX_CONF_KEY))
	{
		result = this.root.putNewList(oFF.Model.XLSX_CONF_KEY);
	}
	else
	{
		result = this.root.getListByKey(oFF.Model.XLSX_CONF_KEY);
	}
	return result;
};
oFF.Model.prototype.addTable = function(title)
{
	var tables;
	if (!this.root.containsKey(oFF.Model.MODEL_TABLES_KEY))
	{
		tables = this.root.putNewList(oFF.Model.MODEL_TABLES_KEY);
	}
	else
	{
		tables = this.root.getListByKey(oFF.Model.MODEL_TABLES_KEY);
	}
	var table = tables.addNewStructure();
	table.putNewList(oFF.Model.TABLE_ROWS_KEY);
	table.putString(oFF.Model.TABLE_TITLE_KEY, title);
	return table;
};
oFF.Model.prototype.releaseObject = function()
{
	oFF.XObjectExt.release(this.root);
	oFF.XObjectExt.release(this.csvConf);
	oFF.XObjectExt.release(this.pdfConf);
	oFF.XObjectExt.release(this.xlsConf);
	oFF.XObjectExt.prototype.releaseObject.call( this );
};
oFF.Model.prototype.toString = function()
{
	return this.root.toString();
};
oFF.Model.prototype.parseTableJson = function(config, modelJson)
{
	var q_name = modelJson.getStructureByKey(oFF.Model.TABLE_TITLE_KEY).getStringByKey("titleText");
	this.setFileName(config.getFileName());
	this.setConfig(config);
	var table = this.addTable(q_name);
	if (config.supportsAppendix() && config.getAppendix() !== null)
	{
		var appendixTable = this.addTable(config.getAppendix().getTitle());
		config.getAppendix().populateTable(appendixTable);
	}
	var colSettings = modelJson.getListByKey("columnSettings");
	table.putInteger(oFF.Model.NUM_COLS_KEY, colSettings.size());
	table.putDouble(oFF.Model.TOTAL_HEIGHT_KEY, oFF.Model.convertToMm(modelJson.getIntegerByKey(oFF.Model.TOTAL_HEIGHT_KEY)));
	table.putDouble(oFF.Model.TOTAL_WIDTH_KEY, oFF.Model.convertToMm(modelJson.getIntegerByKey(oFF.Model.TOTAL_WIDTH_KEY)));
	var dataRegionCornerRow = modelJson.getIntegerByKey("dataRegionCornerRow");
	var dataRegionCornerCol = modelJson.getIntegerByKey("dataRegionCornerCol");
	var headerColumnsIndices = oFF.XList.create();
	var headerRowsIndices = oFF.XList.create();
	var colWidths = table.putNewList(oFF.Model.COL_WIDTHS_KEY);
	for (var i = 0; i < colSettings.size(); i++)
	{
		var colSetting = colSettings.getStructureAt(i);
		colWidths.addDouble(oFF.Model.convertToMm(colSetting.getIntegerByKey("width")));
	}
	var styleMap = oFF.XHashMapByString.create();
	var styles = table.putNewList(oFF.Model.CELL_STYLES_KEY);
	var formatStrMap = oFF.XLinkedHashMapByString.create();
	var exportRows = table.getListByKey(oFF.Model.TABLE_ROWS_KEY);
	var rows = modelJson.getListByKey(oFF.Model.TABLE_ROWS_KEY);
	for (var i2 = 0; i2 < rows.size(); i2++)
	{
		var row = rows.getStructureAt(i2);
		var exportRow = exportRows.addNewStructure();
		exportRow.putDouble("height", oFF.Model.convertToMm(row.getIntegerByKey("height")));
		var exportCells = exportRow.putNewList(oFF.Model.TABLE_ROW_CELLS);
		var cells = row.getListByKey(oFF.Model.TABLE_ROW_CELLS);
		for (var j = 0; j < cells.size(); j++)
		{
			var cell = cells.getStructureAt(j);
			var exportCell = exportCells.addNewStructure();
			var fvalue = cell.getStringByKey("formatted");
			exportCell.putString(oFF.Model.FORMATTED_VALUE, oFF.isNull(fvalue) ? "" : fvalue);
			if (cell.containsKey("plain") && !cell.hasStringByKey("plain"))
			{
				exportCell.putDouble(oFF.Model.VALUE_KEY, cell.getDoubleByKey("plain"));
			}
			var type = cell.getIntegerByKey("cellType");
			var isValue = type === oFF.SacTableConstants.CT_VALUE;
			var isInHeaderRow = this.m_headerRowsCellTypes.contains(oFF.XIntegerValue.create(type));
			var isInHeaderColumn = this.m_headerColumnsCellTypes.contains(oFF.XIntegerValue.create(type));
			if (isInHeaderRow && !headerRowsIndices.contains(oFF.XIntegerValue.create(i2)))
			{
				headerRowsIndices.add(oFF.XIntegerValue.create(i2));
			}
			if (isInHeaderColumn && !headerColumnsIndices.contains(oFF.XIntegerValue.create(j)))
			{
				headerColumnsIndices.add(oFF.XIntegerValue.create(j));
			}
			var style = cell.getStructureByKey(oFF.Model.STYLE_KEY);
			var exportCellStyle = oFF.PrFactory.createStructure();
			var pattern = cell.getStringByKey(oFF.SacTableConstants.C_S_FORMAT_STRING);
			var patternId = -1;
			if (oFF.XStringUtils.isNotNullAndNotEmpty(pattern) && oFF.XString.isEqual(config.getType(), oFF.BaseExportConfig.XLSX_EXPORT))
			{
				if (!formatStrMap.containsKey(pattern) && oFF.XString.isEqual(config.getType(), oFF.BaseExportConfig.XLSX_EXPORT))
				{
					patternId = config.addNumberFormat(pattern);
					formatStrMap.put(pattern, oFF.XIntegerValue.create(patternId));
				}
				else
				{
					patternId = formatStrMap.getByKey(pattern).getInteger();
				}
				exportCellStyle.putInteger(oFF.Model.XLSX_FORMAT_KEY, patternId);
			}
			if (oFF.notNull(style))
			{
				var fontColor = exportCellStyle.putNewStructure(oFF.Model.FONT_COLOR_KEY);
				if (isValue)
				{
					oFF.Model.parseColor(fontColor, "rgb(153,153,153)");
				}
				else
				{
					oFF.Model.parseColor(fontColor, "rgb(51,51,51)");
				}
				oFF.Model.setAlignments(style, exportCellStyle);
				if (style.containsKey("font"))
				{
					var font = style.getStructureByKey("font");
					if (font.containsKey("bold") && font.getBooleanByKey("bold") === true)
					{
						exportCellStyle.putInteger(oFF.Model.FONT_WEIGHT_KEY, 700);
					}
				}
				if (i2 <= dataRegionCornerRow && j <= dataRegionCornerCol && !exportCellStyle.hasStringByKey(oFF.Model.FONT_WEIGHT_KEY))
				{
					exportCellStyle.putInteger(oFF.Model.FONT_WEIGHT_KEY, 700);
				}
				var exportPadding = oFF.PrFactory.createStructure();
				if (cell.containsKey(oFF.SacTableConstants.C_N_HIERARCHY_PADDING_LEFT))
				{
					var hierPadLeft = cell.getIntegerByKey(oFF.SacTableConstants.C_N_HIERARCHY_PADDING_LEFT);
					exportPadding.putDouble(oFF.Model.HIER_PAD_LEFT_KEY, oFF.Model.convertToMm(hierPadLeft));
				}
				if (cell.containsKey(oFF.SacTableConstants.C_N_HIERARCHY_PADDING_TOP))
				{
					var hierPadTop = cell.getIntegerByKey(oFF.SacTableConstants.C_N_HIERARCHY_PADDING_TOP);
					exportPadding.putDouble(oFF.Model.HIER_PAD_TOP_KEY, oFF.Model.convertToMm(hierPadTop));
				}
				if (style.containsKey("lines"))
				{
					var line = style.getListByKey("lines").getStructureAt(0);
					oFF.Model.parseColor(exportCellStyle.putNewStructure(oFF.Model.LINE_COLOR_KEY), line.getStringByKey("color"));
					exportCellStyle.putDouble(oFF.Model.LINE_SIZE_KEY, oFF.Model.convertToMm(line.getIntegerByKey("size")));
					var padding = line.getStructureByKey(oFF.Model.PADDING_KEY);
					exportPadding.putDouble(oFF.Model.PADDING_RIGHT_KEY, oFF.Model.convertToMm(padding.getIntegerByKey(oFF.Model.PADDING_RIGHT_KEY)));
					exportPadding.putDouble(oFF.Model.PADDING_LEFT_KEY, oFF.Model.convertToMm(padding.getIntegerByKey(oFF.Model.PADDING_LEFT_KEY)));
				}
				if (exportPadding.hasElements())
				{
					exportCellStyle.put(oFF.Model.PADDING_KEY, exportPadding);
				}
				var styleKey = exportCellStyle.toString();
				if (!styleMap.containsKey(styleKey))
				{
					var nextIndex = styles.size();
					styleMap.put(styleKey, oFF.XIntegerValue.create(nextIndex));
					styles.add(exportCellStyle);
					exportCell.putInteger(oFF.Model.STYLE_KEY, nextIndex);
				}
				else
				{
					var index = styleMap.getByKey(styleKey);
					exportCell.putInteger(oFF.Model.STYLE_KEY, index.getInteger());
				}
			}
		}
	}
	table.putInteger(oFF.Model.NUM_HEADER_COLS, headerColumnsIndices.size());
	table.putInteger(oFF.Model.NUM_HEADER_ROWS, headerRowsIndices.size());
};
oFF.Model.prototype.processTable = function(config, sacTable)
{
	this.setFileName(config.getFileName());
	this.setConfig(config);
	var table = this.addTable(sacTable.getTitle() === null ? "DefaultTitle" : sacTable.getTitle());
	table.putInteger(oFF.Model.NUM_COLS_KEY, sacTable.getColumnList().size());
	table.putDouble(oFF.Model.TOTAL_HEIGHT_KEY, oFF.Model.convertToMm(sacTable.getHeight()));
	table.putDouble(oFF.Model.TOTAL_WIDTH_KEY, oFF.Model.convertToMm(sacTable.getWidth()));
	var colWidths = table.putNewList(oFF.Model.COL_WIDTHS_KEY);
	for (var i = 0; i < sacTable.getColumnList().size(); i++)
	{
		colWidths.addDouble(oFF.Model.convertToMm(sacTable.getColumnWidth(i)));
	}
	var styleMap = oFF.XHashMapByString.create();
	var styles = table.putNewList(oFF.Model.CELL_STYLES_KEY);
	var exportRows = table.getListByKey(oFF.Model.TABLE_ROWS_KEY);
	oFF.Model.addRowsToModel(this, config, styleMap, styles, exportRows, sacTable.getHeaderRowList(), 0);
	oFF.Model.addRowsToModel(this, config, styleMap, styles, exportRows, sacTable.getRowList(), sacTable.getHeaderRowList().size() - 1);
};

oFF.CsvConfig = function() {};
oFF.CsvConfig.prototype = new oFF.BaseExportConfig();
oFF.CsvConfig.prototype._ff_c = "CsvConfig";

oFF.CsvConfig.CSV_DEFAULT_DELIM = ",";
oFF.CsvConfig.CSV_DELIM_KEY = "delimiter";
oFF.CsvConfig.createDefault = function(conf, fileName)
{
	var result = new oFF.CsvConfig();
	result.init(conf);
	result.setDelimiter(oFF.CsvConfig.CSV_DEFAULT_DELIM);
	result.setFileName(fileName);
	return result;
};
oFF.CsvConfig.wrap = function(conf)
{
	var result = new oFF.CsvConfig();
	result.init(conf);
	return result;
};
oFF.CsvConfig.prototype.getType = function()
{
	return oFF.BaseExportConfig.CSV_EXPORT;
};
oFF.CsvConfig.prototype.setDelimiter = function(delim)
{
	this.root.putString(oFF.CsvConfig.CSV_DELIM_KEY, delim);
};

oFF.PdfConfig = function() {};
oFF.PdfConfig.prototype = new oFF.BaseExportConfig();
oFF.PdfConfig.prototype._ff_c = "PdfConfig";

oFF.PdfConfig.PDF_PAGE_SIZE_KEY = "pageSize";
oFF.PdfConfig.PDF_BUILTIN_FONT_KEY = "builtInFont";
oFF.PdfConfig.PDF_FONT_SIZE = "fontSize";
oFF.PdfConfig.PDF_AUTO_SIZE_KEY = "autoSize";
oFF.PdfConfig.PDF_FREEZE_ROWS_KEY = "freezeRows";
oFF.PdfConfig.PDF_PAGE_ORIENT_KEY = "orientation";
oFF.PdfConfig.PDF_PAGE_NUM_LOC_KEY = "pageNumberLocation";
oFF.PdfConfig.PDF_ORIENT_LANDSCAPE = "landscape";
oFF.PdfConfig.PDF_ORIENT_PORTRAIT = "portrait";
oFF.PdfConfig.createDefault = function(conf, fileName)
{
	var result = new oFF.PdfConfig();
	result.setFileName(fileName);
	result.init(conf);
	result.setOrientation(oFF.PdfConfig.PDF_ORIENT_LANDSCAPE);
	result.setPageSize("a4");
	result.setBuiltInFont("Helvetica");
	result.setAutoSize(true);
	result.setFontSize(6);
	return result;
};
oFF.PdfConfig.wrap = function(conf)
{
	var result = new oFF.PdfConfig();
	result.init(conf);
	return result;
};
oFF.PdfConfig.prototype.getType = function()
{
	return oFF.BaseExportConfig.PDF_EXPORT;
};
oFF.PdfConfig.prototype.setFontSize = function(d)
{
	this.root.putDouble(oFF.PdfConfig.PDF_FONT_SIZE, d);
};
oFF.PdfConfig.prototype.setOrientation = function(orient)
{
	this.root.putString(oFF.PdfConfig.PDF_PAGE_ORIENT_KEY, orient);
};
oFF.PdfConfig.prototype.getOrientation = function()
{
	return this.root.getStringByKey(oFF.PdfConfig.PDF_PAGE_ORIENT_KEY);
};
oFF.PdfConfig.prototype.setPageSize = function(pageSize)
{
	this.root.putString(oFF.PdfConfig.PDF_PAGE_SIZE_KEY, oFF.XString.toLowerCase(pageSize));
};
oFF.PdfConfig.prototype.setBuiltInFont = function(font)
{
	this.root.putString(oFF.PdfConfig.PDF_BUILTIN_FONT_KEY, font);
};
oFF.PdfConfig.prototype.setAutoSize = function(autoSize)
{
	this.root.putBoolean(oFF.PdfConfig.PDF_AUTO_SIZE_KEY, autoSize);
};
oFF.PdfConfig.prototype.getAutoSize = function()
{
	return this.root.getBooleanByKey(oFF.PdfConfig.PDF_AUTO_SIZE_KEY);
};
oFF.PdfConfig.prototype.setFreezeRows = function(numRows)
{
	this.root.putInteger(oFF.PdfConfig.PDF_FREEZE_ROWS_KEY, numRows);
};
oFF.PdfConfig.prototype.getFreezeRows = function()
{
	return this.root.getIntegerByKey(oFF.PdfConfig.PDF_FREEZE_ROWS_KEY);
};
oFF.PdfConfig.prototype.setNumberLocation = function(location)
{
	this.root.putString(oFF.PdfConfig.PDF_PAGE_NUM_LOC_KEY, location);
};
oFF.PdfConfig.prototype.getNumberLocation = function()
{
	return this.root.getStringByKey(oFF.PdfConfig.PDF_PAGE_NUM_LOC_KEY);
};

oFF.XlsConfig = function() {};
oFF.XlsConfig.prototype = new oFF.BaseExportConfig();
oFF.XlsConfig.prototype._ff_c = "XlsConfig";

oFF.XlsConfig.XLSX_AUTO_FILTER = "autoFilter";
oFF.XlsConfig.XLSX_NUMBER_FORMATS = "numberFormats";
oFF.XlsConfig.createDefault = function(conf, fileName)
{
	var result = new oFF.XlsConfig();
	result.init(conf);
	result.setAutoFilterActive(true);
	result.setFileName(fileName);
	return result;
};
oFF.XlsConfig.wrap = function(conf)
{
	var result = new oFF.XlsConfig();
	result.init(conf);
	return result;
};
oFF.XlsConfig.prototype.setAutoFilterActive = function(isActive)
{
	this.root.putBoolean(oFF.XlsConfig.XLSX_AUTO_FILTER, isActive);
};
oFF.XlsConfig.prototype.getType = function()
{
	return oFF.BaseExportConfig.XLSX_EXPORT;
};
oFF.XlsConfig.prototype.getNumberFormats = function()
{
	if (this.root.containsKey(oFF.XlsConfig.XLSX_NUMBER_FORMATS))
	{
		return this.root.getListByKey(oFF.XlsConfig.XLSX_NUMBER_FORMATS);
	}
	return this.root.putNewList(oFF.XlsConfig.XLSX_NUMBER_FORMATS);
};
oFF.XlsConfig.prototype.addNumberFormat = function(formatStr)
{
	var nmbFmts = this.getNumberFormats();
	var nextId = nmbFmts.size();
	this.getNumberFormats().addString(formatStr);
	return nextId;
};

oFF.ExportModule = function() {};
oFF.ExportModule.prototype = new oFF.DfModule();
oFF.ExportModule.prototype._ff_c = "ExportModule";

oFF.ExportModule.s_module = null;
oFF.ExportModule.getInstance = function()
{
	if (oFF.isNull(oFF.ExportModule.s_module))
	{
		oFF.DfModule.checkInitialized(oFF.LanguageExtModule.getInstance());
		oFF.DfModule.checkInitialized(oFF.CommonsModule.getInstance());
		oFF.DfModule.checkInitialized(oFF.VisualizationImplModule.getInstance());
		oFF.ExportModule.s_module = oFF.DfModule.startExt(new oFF.ExportModule());
		oFF.DfModule.stopExt(oFF.ExportModule.s_module);
	}
	return oFF.ExportModule.s_module;
};
oFF.ExportModule.prototype.getName = function()
{
	return "ff2700.export";
};

oFF.ExportModule.getInstance();

return sap.firefly;
	} );