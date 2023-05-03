/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
[
"sap/sac/df/firefly/ff2220.ui.tools","sap/sac/df/firefly/ff2650.visualization.impl","sap/sac/df/firefly/ff4310.olap.impl"
],
function(oFF)
{
"use strict";

oFF.BindingUtils = {

	getBindingSoureList:function(vizDef, feedName)
	{
			var chartDefBindings = vizDef.getStructureByKey(oFF.VizDefConstants.K_CHART).getListByKey(oFF.VizDefConstants.K_BINDINGS);
		var ids = oFF.XListOfString.create();
		for (var i = 0; i < chartDefBindings.size(); ++i)
		{
			var binding = chartDefBindings.getStructureAt(i);
			if (oFF.XString.isEqual(binding.getStringByKey(oFF.VizDefConstants.K_FEED), feedName))
			{
				var source = binding.getListByKey(oFF.VizDefConstants.K_SOURCE);
				for (var j = 0; j < source.size(); ++j)
				{
					ids.add(source.getStructureAt(j).getStringByKey(oFF.VizDefConstants.K_ID));
				}
			}
		}
		return ids;
	}
};

oFF.ChartRendererFactoryImpl = function() {};
oFF.ChartRendererFactoryImpl.prototype = new oFF.XObject();
oFF.ChartRendererFactoryImpl.prototype._ff_c = "ChartRendererFactoryImpl";

oFF.ChartRendererFactoryImpl.create = function()
{
	return new oFF.ChartRendererFactoryImpl();
};
oFF.ChartRendererFactoryImpl.prototype.newRenderer = function(protocolType)
{
	if (protocolType.isTypeOf(oFF.ProtocolBindingType.GOOGLE_CHART_PROTOCOL))
	{
		return oFF.RsGoogleChartRenderer.create();
	}
	if (protocolType.isTypeOf(oFF.ProtocolBindingType.VIZ_FRAME_PROTOCOL))
	{
		return oFF.RsVizFrameRenderer.create();
	}
	if (protocolType.isTypeOf(oFF.ProtocolBindingType.MICRO_CHART_PROTOCOL))
	{
		return oFF.RsMicroChartRenderer.create();
	}
	return oFF.RsHiChartRenderer.create();
};

oFF.RsHiChartRenderer = function() {};
oFF.RsHiChartRenderer.prototype = new oFF.XObject();
oFF.RsHiChartRenderer.prototype._ff_c = "RsHiChartRenderer";

oFF.RsHiChartRenderer.create = function()
{
	return new oFF.RsHiChartRenderer();
};
oFF.RsHiChartRenderer.getDoubleValueExtended = function(structure, name, defaultValue)
{
	var result = defaultValue;
	var number2beConverted = structure.getStringByKeyExt(name, "0");
	if (structure.getElementTypeByKey(name).isNumber())
	{
		result = structure.getByKey(name).asNumber().getDouble();
	}
	else if (oFF.notNull(number2beConverted) && oFF.XString.containsString(number2beConverted, "E"))
	{
		var number2be = oFF.XDouble.convertFromString(oFF.XString.substring(number2beConverted, 0, oFF.XString.indexOf(number2beConverted, "E")));
		var exponotialComponent = oFF.XInteger.convertFromString(oFF.XString.substring(number2beConverted, oFF.XString.indexOf(number2beConverted, "E"), oFF.XString.size(number2beConverted)));
		result = number2be * oFF.XMath.pow(10, exponotialComponent);
	}
	else if (oFF.notNull(number2beConverted))
	{
		try
		{
			result = oFF.XDouble.convertFromString(number2beConverted);
		}
		catch (t)
		{
			result = defaultValue;
		}
	}
	return result;
};
oFF.RsHiChartRenderer.prototype.render = function(type, rs)
{
	if (oFF.notNull(rs))
	{
		var helper = oFF.RsHiChartRenderHelper.create(type, rs);
		return helper.getChartData();
	}
	return null;
};
oFF.RsHiChartRenderer.prototype.renderVisualizationWithResultSet = function(visualizationDefinition, cursorResultSet)
{
	if (oFF.notNull(cursorResultSet))
	{
		var helper = oFF.RsHiChartRenderHelper.createWithVisualizationDefinition(visualizationDefinition, cursorResultSet);
		var theChartData = helper.getChartData();
		if (!theChartData.containsKey(oFF.VizDefConstants.K_TITLE))
		{
			var title = theChartData.putNewStructure(oFF.VizDefConstants.K_TITLE);
			title.putString(oFF.VizDefConstants.K_TEXT, "");
		}
		return helper.getChartData();
	}
	return null;
};

oFF.RsHiChartUtils = {

	create:function()
	{
			return new oFF.RsHiChartUtils();
	},
	axisPloter:function(vizAxis, axisChart, chartType, defaultlabeling)
	{
			var isVisible = true;
		var isVisibleLabels = defaultlabeling;
		var isAxisTickVisible = false;
		var axisColor = "#FFFFFF";
		var vizPropAxisLine = vizAxis.getStructureByKey(oFF.VizDefConstants.K_AXIS_LINE);
		if (vizAxis.getElementTypeByKey(oFF.VizDefConstants.K_VISIBLE) === oFF.PrElementType.BOOLEAN)
		{
			isVisibleLabels = vizAxis.getBooleanByKeyExt(oFF.VizDefConstants.K_VISIBLE, defaultlabeling);
		}
		var vizPropAxisTick = vizAxis.getStructureByKey(oFF.VizDefConstants.K_AXIS_TICK);
		if (oFF.notNull(vizPropAxisLine))
		{
			if (vizPropAxisLine.containsKey(oFF.VizDefConstants.K_SIZE))
			{
				var axisLineSize = vizPropAxisLine.getIntegerByKeyExt(oFF.VizDefConstants.K_SIZE, 0);
				axisChart.putInteger(oFF.VizDefConstants.K_LINE_WIDTH, axisLineSize);
			}
			isVisible = vizPropAxisLine.getBooleanByKeyExt(oFF.VizDefConstants.K_VISIBLE, true);
		}
		if (oFF.notNull(vizPropAxisTick))
		{
			isAxisTickVisible = vizPropAxisTick.getBooleanByKeyExt(oFF.VizDefConstants.K_VISIBLE, false);
		}
		var isShowLabelGrids = vizAxis.getBooleanByKeyExt(oFF.VizDefConstants.K_SHOW_LABEL_GRIDS, true);
		if (!oFF.XString.isEqual(oFF.VizDefConstants.K_HEATMAP, chartType) && vizAxis.hasStringByKey(oFF.VizDefConstants.K_COLOR) && isVisible)
		{
			axisColor = vizAxis.getStringByKeyExt(oFF.VizDefConstants.K_COLOR, "#FFFFFF");
		}
		axisChart.putString(oFF.VizDefConstants.K_LINE_COLOR, axisColor);
		var vizAxisLabel = vizAxis.getStructureByKey(oFF.VizDefConstants.K_LABEL);
		if (oFF.notNull(vizAxisLabel))
		{
			var vizAxisLabelStyle = vizAxisLabel.getStructureByKey(oFF.VizDefConstants.K_STYLE);
			if (oFF.notNull(vizAxisLabelStyle))
			{
				var axisLabelColor = vizAxisLabelStyle.getStringByKey(oFF.VizDefConstants.K_COLOR);
				var axisLabelFontFamily = vizAxisLabelStyle.getStringByKey(oFF.VizDefConstants.K_FONT_FAMILY);
				var axisLabelFontsize = vizAxisLabelStyle.getStringByKey(oFF.VizDefConstants.K_FONT_SIZE);
				var xAxisLabels = axisChart.putNewStructure(oFF.VizDefConstants.K_LABELS);
				if (isShowLabelGrids)
				{
					xAxisLabels.putInteger(oFF.VizDefConstants.K_X, -5);
					var xAxisLabelsStyle = xAxisLabels.putNewStructure(oFF.VizDefConstants.K_STYLE);
					xAxisLabelsStyle.putString(oFF.VizDefConstants.K_FONT_SIZE, axisLabelFontsize);
					xAxisLabelsStyle.putString(oFF.VizDefConstants.K_FILL, axisLabelColor);
					if (oFF.XString.isEqual(chartType, oFF.VizDefConstants.V_CHART_TYPE_BOXPLOT))
					{
						xAxisLabelsStyle.putString(oFF.VizDefConstants.K_COLOR, axisLabelColor);
					}
					xAxisLabelsStyle.putString(oFF.VizDefConstants.K_FONT_FAMILY, axisLabelFontFamily);
				}
				xAxisLabels.putBoolean(oFF.VizDefConstants.K_ENABLED, isVisibleLabels);
			}
		}
		if (!isAxisTickVisible)
		{
			axisChart.putInteger(oFF.VizDefConstants.K_GRIDLINE_WIDTH, 0);
			axisChart.putString(oFF.VizDefConstants.K_TICK_COLOR, "rgb(166, 168, 171)");
			axisChart.putInteger(oFF.VizDefConstants.K_TICK_WIDTH, 0);
		}
		return axisChart;
	},
	responsiveBuilder:function(chartType, theChartData)
	{
			var responsive = theChartData.putNewStructure(oFF.VizDefConstants.K_RESPONSIVE);
		var rules = responsive.putNewList(oFF.VizDefConstants.K_RULES);
		var rules3Object = rules.addNewStructure();
		var conditionStruct3 = rules3Object.putNewStructure(oFF.VizDefConstants.K_CONDITION);
		conditionStruct3.putInteger(oFF.VizDefConstants.K_MAX_HEIGHT, 176);
		var chartOptions3Rules = rules3Object.putNewStructure(oFF.VizDefConstants.K_CHART_OPTIONS);
		var chartOptionsLegend3 = chartOptions3Rules.putNewStructure(oFF.VizDefConstants.K_LEGEND);
		chartOptionsLegend3.putBoolean(oFF.VizDefConstants.K_ENABLED, false);
		var chartOptions3yAxis = chartOptions3Rules.putNewStructure(oFF.VizDefConstants.K_Y_AXIS);
		var chartOptions3yAxisLabel = chartOptions3yAxis.putNewStructure(oFF.VizDefConstants.K_LABELS);
		chartOptions3yAxisLabel.putInteger(oFF.VizDefConstants.K_ROTATION, 344);
		chartOptions3yAxisLabel.putInteger(oFF.VizDefConstants.K_X, 10);
		var rules1Object = rules.addNewStructure();
		var conditionStruct = rules1Object.putNewStructure(oFF.VizDefConstants.K_CONDITION);
		conditionStruct.putInteger(oFF.VizDefConstants.K_MAX_WIDTH, 359);
		conditionStruct.putInteger(oFF.VizDefConstants.K_MIN_HEIGHT, 70);
		var chartOptions1Rules = rules1Object.putNewStructure(oFF.VizDefConstants.K_CHART_OPTIONS);
		var chartInfo = chartOptions1Rules.putNewStructure(oFF.VizDefConstants.K_CHART);
		chartInfo.putBoolean(oFF.VizDefConstants.K_ANIMATION, false);
		var chartOptionsPlotOptions = chartOptions1Rules.putNewStructure(oFF.VizDefConstants.K_PLOT_OPTIONS);
		var chartOptionsPlotOptionsSeries = chartOptionsPlotOptions.putNewStructure(oFF.VizDefConstants.K_SERIES);
		var chartOptionsDatalabels = chartOptionsPlotOptionsSeries.putNewStructure(oFF.VizDefConstants.K_DATA_LABELS);
		var chartOptionsDatalabelsStyle = chartOptionsDatalabels.putNewStructure(oFF.VizDefConstants.K_STYLE);
		if (oFF.XString.isEqual(chartType, oFF.VizDefConstants.K_PIE))
		{
			chartOptionsDatalabelsStyle.putString(oFF.VizDefConstants.K_FONT_SIZE, "9px");
			chartOptionsDatalabels.putInteger(oFF.VizDefConstants.K_CONNECTOR_WIDTH, 0);
			chartOptionsDatalabels.putInteger(oFF.VizDefConstants.K_DISTANCE, -30);
			chartOptionsDatalabels.putBoolean(oFF.VizDefConstants.K_INSIDE, true);
			chartInfo.putInteger(oFF.VizDefConstants.K_MARGIN_TOP, 40);
		}
		else
		{
			chartInfo.putInteger(oFF.VizDefConstants.K_MARGIN_TOP, 50);
			chartOptionsDatalabelsStyle.putString(oFF.VizDefConstants.K_FONT_SIZE, "9px");
		}
		var chartOptionsTitle = chartOptions1Rules.putNewStructure(oFF.VizDefConstants.K_TITLE);
		var chartOptionsTitleStyle = chartOptionsTitle.putNewStructure(oFF.VizDefConstants.K_STYLE);
		chartOptionsTitleStyle.putString(oFF.VizDefConstants.K_FONT_SIZE, "13px");
		chartOptionsTitleStyle.putBoolean(oFF.VizDefConstants.K_FLOATING, true);
		var chartOptions1subTitle = chartOptions1Rules.putNewStructure(oFF.VizDefConstants.K_SUBTITLE);
		chartOptions1subTitle.putString(oFF.VizDefConstants.K_TEXT, "");
		var chartOptionsxAxis = chartOptions1Rules.putNewStructure(oFF.VizDefConstants.K_X_AXIS);
		var chartOptionsxAxisLabel = chartOptionsxAxis.putNewStructure(oFF.VizDefConstants.K_LABELS);
		var chartOptionsxAxisLabelStyle = chartOptionsxAxisLabel.putNewStructure(oFF.VizDefConstants.K_STYLE);
		chartOptionsxAxisLabelStyle.putString(oFF.VizDefConstants.K_FONT_SIZE, "10px");
		var chartOptionsyAxis = chartOptions1Rules.putNewStructure(oFF.VizDefConstants.K_Y_AXIS);
		var chartOptionsyAxisLabel = chartOptionsyAxis.putNewStructure(oFF.VizDefConstants.K_LABELS);
		var chartOptionsyAxisLabelStyle = chartOptionsyAxisLabel.putNewStructure(oFF.VizDefConstants.K_STYLE);
		chartOptionsyAxisLabelStyle.putString(oFF.VizDefConstants.K_FONT_SIZE, "10px");
		var rules2Object = rules.addNewStructure();
		var condition2Struct = rules2Object.putNewStructure(oFF.VizDefConstants.K_CONDITION);
		condition2Struct.putInteger(oFF.VizDefConstants.K_MAX_WIDTH, 176);
		var chartOptions2Rules = rules2Object.putNewStructure(oFF.VizDefConstants.K_CHART_OPTIONS);
		var chart2Info = chartOptions2Rules.putNewStructure(oFF.VizDefConstants.K_CHART);
		chart2Info.putBoolean(oFF.VizDefConstants.K_ANIMATION, false);
		var chartOptionsLegend2 = chartOptions2Rules.putNewStructure(oFF.VizDefConstants.K_LEGEND);
		chartOptionsLegend2.putBoolean(oFF.VizDefConstants.K_ENABLED, false);
		chartOptionsLegend2.putInteger(oFF.VizDefConstants.K_Y, 25);
		var chartOptions2PlotOptions = chartOptions2Rules.putNewStructure(oFF.VizDefConstants.K_PLOT_OPTIONS);
		var chartOptions2PlotOptionsPie = chartOptions2PlotOptions.putNewStructure(oFF.VizDefConstants.K_SERIES);
		chartOptions2PlotOptionsPie.putInteger(oFF.VizDefConstants.K_MIN_SIZE, 100);
		var chartOptions2Datalabels = chartOptions2PlotOptionsPie.putNewStructure(oFF.VizDefConstants.K_DATA_LABELS);
		chartOptions2Datalabels.putInteger(oFF.VizDefConstants.K_CONNECTOR_WIDTH, 0);
		chartOptions2Datalabels.putInteger(oFF.VizDefConstants.K_DISTANCE, -25);
		var chartOptions2DatalabelsStyle = chartOptions2Datalabels.putNewStructure(oFF.VizDefConstants.K_STYLE);
		chartOptions2DatalabelsStyle.putString(oFF.VizDefConstants.K_FONT_SIZE, "8px");
		chart2Info.putInteger(oFF.VizDefConstants.K_MARGIN_TOP, 40);
		var chartOptions2Title = chartOptions2Rules.putNewStructure(oFF.VizDefConstants.K_TITLE);
		var chartOptions2TitleStyle = chartOptions2Title.putNewStructure(oFF.VizDefConstants.K_STYLE);
		chartOptions2TitleStyle.putString(oFF.VizDefConstants.K_FONT_SIZE, "10px");
		var chartOptions2subTitle = chartOptions2Rules.putNewStructure(oFF.VizDefConstants.K_SUBTITLE);
		chartOptions2subTitle.putString(oFF.VizDefConstants.K_TEXT, "");
		var chartOptions2xAxis = chartOptions2Rules.putNewStructure(oFF.VizDefConstants.K_X_AXIS);
		var chartOptions2xAxisLabel = chartOptions2xAxis.putNewStructure(oFF.VizDefConstants.K_LABELS);
		var chartOptions2xAxisLabelStyle = chartOptions2xAxisLabel.putNewStructure(oFF.VizDefConstants.K_STYLE);
		chartOptions2xAxisLabelStyle.putString(oFF.VizDefConstants.K_FONT_SIZE, "9px");
		var chartOptions2yAxis = chartOptions2Rules.putNewStructure(oFF.VizDefConstants.K_Y_AXIS);
		var chartOptions2yAxisLabel = chartOptions2yAxis.putNewStructure(oFF.VizDefConstants.K_LABELS);
		var chartOptions2yAxisLabelStyle = chartOptions2yAxisLabel.putNewStructure(oFF.VizDefConstants.K_STYLE);
		chartOptions2yAxisLabelStyle.putString(oFF.VizDefConstants.K_FONT_SIZE, "9px");
	}
};

oFF.RsGoogleChartConfig = {

	s_charts:null,
	staticSetup:function()
	{
			if (oFF.isNull(oFF.RsGoogleChartConfig.s_charts))
		{
			oFF.RsGoogleChartConfig.s_charts = oFF.XSimpleMap.create();
			oFF.RsGoogleChartConfig.s_charts.put(oFF.SemanticBindingType.BAR, oFF.GoogleChartBar.create());
			oFF.RsGoogleChartConfig.s_charts.put(oFF.SemanticBindingType.COLUMN, oFF.GoogleChartColumn.create());
			oFF.RsGoogleChartConfig.s_charts.put(oFF.SemanticBindingType.LINE, oFF.GoogleChartLine.create());
		}
	},
	createOptions:function(vizDef)
	{
			var chart = oFF.RsGoogleChartConfig.s_charts.getByKey(oFF.RsGoogleChartConfig.getChartType(vizDef));
		if (oFF.notNull(chart))
		{
			return chart.createOptions(vizDef);
		}
		return oFF.PrFactory.createStructure();
	},
	createMetadata:function(vizDef, columns)
	{
			var chart = oFF.RsGoogleChartConfig.s_charts.getByKey(oFF.RsGoogleChartConfig.getChartType(vizDef));
		if (oFF.notNull(chart))
		{
			return chart.createMetadata(columns);
		}
		return oFF.PrFactory.createStructure();
	},
	getChartType:function(vizDef)
	{
			var vizDefChart = vizDef.getStructureByKey(oFF.VizDefConstants.K_CHART);
		var type = vizDefChart.getStringByKey(oFF.VizDefConstants.K_TYPE);
		if (oFF.XString.isEqual(type, oFF.VizDefConstants.V_CHART_TYPE_BAR) || oFF.XString.isEqual(type, oFF.VizDefConstants.V_STACKED_BAR))
		{
			return oFF.SemanticBindingType.BAR;
		}
		if (oFF.XString.isEqual(type, oFF.VizDefConstants.V_CHART_TYPE_COLUMN) || oFF.XString.isEqual(type, oFF.VizDefConstants.V_STACKED_COLUMN))
		{
			return oFF.SemanticBindingType.COLUMN;
		}
		if (oFF.XString.isEqual(type, oFF.VizDefConstants.V_TYPE_BARCOLUMN))
		{
			var properties = vizDefChart.getStructureByKey(oFF.VizDefConstants.K_PROPERTIES);
			var propertiesGeneral = properties.getStructureByKey(oFF.VizDefConstants.K_GENERAL);
			if (oFF.notNull(propertiesGeneral) && propertiesGeneral.getBooleanByKeyExt(oFF.VizDefConstants.K_INVERTED, false))
			{
				return oFF.SemanticBindingType.BAR;
			}
			return oFF.SemanticBindingType.COLUMN;
		}
		if (oFF.XString.isEqual(type, oFF.VizDefConstants.K_LINE))
		{
			return oFF.SemanticBindingType.LINE;
		}
		return null;
	}
};

oFF.RsGoogleChartRenderer = function() {};
oFF.RsGoogleChartRenderer.prototype = new oFF.XObject();
oFF.RsGoogleChartRenderer.prototype._ff_c = "RsGoogleChartRenderer";

oFF.RsGoogleChartRenderer.create = function()
{
	return new oFF.RsGoogleChartRenderer();
};
oFF.RsGoogleChartRenderer.prototype.render = function(type, rs)
{
	var structure = oFF.PrFactory.createStructure();
	var vizDef = rs.getQueryModel().getVizManager().getVizDef();
	if (oFF.notNull(vizDef) && vizDef.containsKey(oFF.VizDefConstants.K_CHART) && rs.getAvailableDataCellCount() > 0)
	{
		var rowsAxis = rs.getCursorRowsAxis();
		var columnsAxis = rs.getCursorColumnsAxis();
		var dataStructure = structure.putNewStructure(oFF.GoogleConstants.K_DATA);
		var cols = dataStructure.putNewList(oFF.GoogleConstants.K_COLS);
		var rows = dataStructure.putNewList(oFF.GoogleConstants.K_ROWS);
		this.addHeaderForDimensionColumns(rowsAxis, cols);
		this.addHeaderForMeasureColumns(columnsAxis, cols);
		this.addRows(rowsAxis, rows, rs);
		structure.put(oFF.GoogleConstants.K_OPTIONS, oFF.RsGoogleChartConfig.createOptions(vizDef));
		structure.put(oFF.GoogleConstants.K_METADATA, oFF.RsGoogleChartConfig.createMetadata(vizDef, cols));
	}
	return structure;
};
oFF.RsGoogleChartRenderer.prototype.renderVisualizationWithResultSet = function(visualizationDefinition, cursorResultSet)
{
	return this.render(visualizationDefinition.getSemanticBindingType(), cursorResultSet);
};
oFF.RsGoogleChartRenderer.prototype.addHeaderForDimensionColumns = function(rowsAxis, cols)
{
	rowsAxis.setTupleCursorBeforeStart();
	rowsAxis.nextTuple();
	for (var i = 0; i < rowsAxis.getTupleElementsCount(); i++)
	{
		rowsAxis.nextTupleElement();
		rowsAxis.nextFieldValue();
		var dimension = rowsAxis.getField().getDimension();
		this.addHeader(cols, dimension.getText(), oFF.GoogleConstants.V_TYPE_STRING);
	}
};
oFF.RsGoogleChartRenderer.prototype.addHeaderForMeasureColumns = function(columnsAxis, cols)
{
	columnsAxis.setTupleCursorBeforeStart();
	while (columnsAxis.hasNextTuple())
	{
		columnsAxis.nextTuple();
		var header = oFF.XStringBuffer.create();
		while (columnsAxis.hasNextTupleElement())
		{
			columnsAxis.nextTupleElement();
			if (header.length() > 0)
			{
				header.append("/");
			}
			header.append(this.getMemberName(columnsAxis));
		}
		this.addHeader(cols, header.toString(), oFF.GoogleConstants.V_TYPE_NUMBER);
	}
};
oFF.RsGoogleChartRenderer.prototype.addHeader = function(cols, label, type)
{
	var columnStructure = cols.addNewStructure();
	columnStructure.putString(oFF.GoogleConstants.K_TYPE, type);
	columnStructure.putString(oFF.GoogleConstants.K_LABEL, label);
};
oFF.RsGoogleChartRenderer.prototype.addRows = function(rowsAxis, rows, rs)
{
	var tuplesRows = rowsAxis.getTuplesCount();
	rowsAxis.setTupleCursorBeforeStart();
	for (var tupleIndex = 0; tupleIndex < tuplesRows; tupleIndex++)
	{
		rowsAxis.nextTuple();
		if (!this.isResultRow(rowsAxis))
		{
			var rowStructure = rows.addNewStructure();
			var list = rowStructure.putNewList(oFF.GoogleConstants.K_C);
			while (rowsAxis.hasNextTupleElement())
			{
				rowsAxis.nextTupleElement();
				this.addRowCell(list, oFF.XStringValue.create(this.getMemberName(rowsAxis)));
			}
			for (var cellIndex = 0; cellIndex < rs.getDataColumns(); cellIndex++)
			{
				var dataCell = rs.getDataCell(cellIndex, tupleIndex);
				this.addRowCell(list, this.getCellValue(dataCell));
			}
		}
	}
};
oFF.RsGoogleChartRenderer.prototype.isResultRow = function(rowsAxis)
{
	if (rowsAxis.hasNextTupleElement())
	{
		rowsAxis.nextTupleElement();
		if (rowsAxis.getDimensionMemberType() === oFF.MemberType.RESULT)
		{
			return true;
		}
		rowsAxis.setTupleElementCursorBeforeStart();
	}
	return false;
};
oFF.RsGoogleChartRenderer.prototype.getMemberName = function(axis)
{
	var member = null;
	while (axis.hasNextFieldValue())
	{
		var fieldValue = axis.nextFieldValue();
		if (oFF.isNull(member) || oFF.PresentationType.isTextPresentation(fieldValue.getField().getPresentationType()))
		{
			member = fieldValue.getValue().getStringRepresentation();
		}
	}
	return member;
};
oFF.RsGoogleChartRenderer.prototype.getCellValue = function(dataCell)
{
	var valueException = dataCell.getValueException();
	if (valueException === oFF.ValueException.NULL_VALUE || valueException === oFF.ValueException.UNDEFINED)
	{
		return oFF.XStringValue.create(null);
	}
	if (valueException === oFF.ValueException.ZERO)
	{
		return oFF.XIntegerValue.create(0);
	}
	return dataCell.getXValue();
};
oFF.RsGoogleChartRenderer.prototype.addRowCell = function(list, value)
{
	var structure = list.addNewStructure();
	var valueType = value.getValueType();
	if (valueType === oFF.XValueType.STRING)
	{
		structure.putString(oFF.GoogleConstants.K_V, value.getStringRepresentation());
	}
	else if (valueType === oFF.XValueType.INTEGER)
	{
		structure.putInteger(oFF.GoogleConstants.K_V, value.getInteger());
	}
	else if (valueType === oFF.XValueType.DOUBLE)
	{
		structure.putDouble(oFF.GoogleConstants.K_V, value.getDouble());
	}
	else if (valueType === oFF.XValueType.LONG)
	{
		structure.putLong(oFF.GoogleConstants.K_V, value.getLong());
	}
	else if (valueType === oFF.XValueType.BOOLEAN)
	{
		structure.putBoolean(oFF.GoogleConstants.K_V, value.getBoolean());
	}
};

oFF.GoogleChart = function() {};
oFF.GoogleChart.prototype = new oFF.XObject();
oFF.GoogleChart.prototype._ff_c = "GoogleChart";

oFF.GoogleChart.LEGEND_MAX_LINES = 3;
oFF.GoogleChart.WIDTH = 600;
oFF.GoogleChart.HEIGHT = 500;
oFF.GoogleChart.HEIGHT_CHART_AREA = 380;
oFF.GoogleChart.ANIMATION_DURATION = 750;
oFF.GoogleChart.prototype.createOptions = function(vizDef)
{
	var structure = oFF.PrFactory.createStructure();
	var vizDefChart = vizDef.getStructureByKey(oFF.VizDefConstants.K_CHART);
	var vdProperties = vizDefChart.getStructureByKey(oFF.VizDefConstants.K_PROPERTIES);
	structure.putString(oFF.GoogleConstants.K_TITLE, vizDefChart.getStringByKeyExt(oFF.VizDefConstants.K_TITLE, ""));
	structure.putNewStructure(oFF.GoogleConstants.K_SERIES);
	var vdLegend = vdProperties.getStructureByKey(oFF.VizDefConstants.K_LEGEND);
	var vdLegendLabel = vdLegend.getStructureByKey(oFF.VizDefConstants.K_LABEL);
	var vdLegendLabelStyle = vdLegendLabel.getStructureByKey(oFF.VizDefConstants.K_STYLE);
	var vdLegendGroup = vdProperties.getStructureByKey(oFF.VizDefConstants.K_LEGEND_GROUP);
	var vdLegendGroupLayout = vdLegendGroup.getStructureByKey(oFF.VizDefConstants.K_LAYOUT);
	var vdLegendGroupPosition = vdLegendGroupLayout.getStringByKeyExt(oFF.VizDefConstants.K_POSITION, oFF.GoogleConstants.V_POSITION_NONE);
	var legend = structure.putNewStructure(oFF.GoogleConstants.K_LEGEND);
	this.setTextStyle(legend, vdLegendLabelStyle);
	legend.putString(oFF.GoogleConstants.K_POSITION, vdLegendGroupPosition);
	legend.putString(oFF.GoogleConstants.K_ALIGNMENT, oFF.GoogleConstants.V_CENTER);
	legend.putInteger(oFF.GoogleConstants.K_MAX_LINES, oFF.GoogleChart.LEGEND_MAX_LINES);
	structure.putInteger(oFF.GoogleConstants.K_WIDTH, oFF.GoogleChart.WIDTH);
	structure.putInteger(oFF.GoogleConstants.K_HEIGHT, oFF.GoogleChart.HEIGHT);
	var chartArea = structure.putNewStructure(oFF.GoogleConstants.K_CHART_AREA);
	chartArea.putInteger(oFF.GoogleConstants.K_HEIGHT, oFF.GoogleChart.HEIGHT_CHART_AREA);
	var animation = structure.putNewStructure(oFF.GoogleConstants.K_ANIMATION);
	animation.putBoolean(oFF.GoogleConstants.K_STARTUP, true);
	animation.putInteger(oFF.GoogleConstants.K_DURATION, oFF.GoogleChart.ANIMATION_DURATION);
	animation.putString(oFF.GoogleConstants.K_EASING, oFF.GoogleConstants.V_EASING_LINEAR);
	var vdPlotArea = vdProperties.getStructureByKey(oFF.VizDefConstants.K_PLOT_AREA);
	var vdPlotAreaColumnLabel = vdPlotArea.getStructureByKey(oFF.VizDefConstants.K_STACK_COLUMN_LABEL);
	var vdPlotAreaColumnLabelStyle = vdPlotAreaColumnLabel.getStructureByKey(oFF.VizDefConstants.K_STYLE);
	var annotations = structure.putNewStructure(oFF.GoogleConstants.K_ROLE_ANNOTATIONS);
	annotations.putBoolean(oFF.GoogleConstants.K_HIGH_CONTRAST, true);
	this.setTextStyle(annotations, vdPlotAreaColumnLabelStyle);
	var stem = annotations.putNewStructure(oFF.GoogleConstants.K_STEM);
	stem.putInteger(oFF.GoogleConstants.K_LENGTH, 2);
	var tooltip = structure.putNewStructure(oFF.GoogleConstants.K_TOOLTIP);
	this.setTextStyle(tooltip, vdPlotAreaColumnLabelStyle);
	this.addChartSpecificOptions(structure, vizDef);
	return structure;
};
oFF.GoogleChart.prototype.createMetadata = function(columns)
{
	var structure = oFF.PrFactory.createStructure();
	structure.putString(oFF.GoogleConstants.K_CHART_TYPE, this.getChartName());
	var cols = structure.putNewList(oFF.GoogleConstants.K_COLS);
	for (var i = 0; i < columns.size(); i++)
	{
		cols.addInteger(i);
		var columnType = columns.getStructureAt(i).getStringByKey(oFF.GoogleConstants.K_TYPE);
		if (oFF.XString.isEqual(columnType, oFF.GoogleConstants.K_NUMBER))
		{
			var colAnnotation = cols.addNewStructure();
			colAnnotation.putString(oFF.GoogleConstants.K_ROLE, oFF.GoogleConstants.V_ROLE_ANNOTATION);
			colAnnotation.putString(oFF.GoogleConstants.K_TYPE, oFF.GoogleConstants.V_TYPE_STRING);
			colAnnotation.putString(oFF.GoogleConstants.K_CALC, oFF.GoogleConstants.V_CALC_STRINGIFY);
			colAnnotation.putInteger(oFF.GoogleConstants.K_SOURCE_COLUMN, i);
		}
	}
	return structure;
};
oFF.GoogleChart.prototype.setTextStyle = function(structure, vizDefStyle)
{
	var textStyle = structure.putNewStructure(oFF.GoogleConstants.K_TEXT_STYLE);
	textStyle.putString(oFF.GoogleConstants.K_FONT_NAME, vizDefStyle.getStringByKeyExt(oFF.VizDefConstants.K_FONT_FAMILY, ""));
	textStyle.putString(oFF.GoogleConstants.K_COLOR, vizDefStyle.getStringByKeyExt(oFF.VizDefConstants.K_COLOR, "rgb(0,0,0)"));
	var fontSize = vizDefStyle.getStringByKey(oFF.VizDefConstants.K_FONT_SIZE);
	if (oFF.notNull(fontSize))
	{
		textStyle.putString(oFF.GoogleConstants.K_FONT_SIZE, oFF.XString.replace(fontSize, "px", ""));
	}
	var fontWeight = vizDefStyle.getStringByKey(oFF.VizDefConstants.K_FONT_WEIGHT);
	if (oFF.XString.isEqual(fontWeight, oFF.VizDefConstants.V_FONT_WEIGHT_BOLD))
	{
		textStyle.putBoolean(oFF.GoogleConstants.K_BOLD, true);
	}
};
oFF.GoogleChart.prototype.setAxisStyle = function(axis, vizDef, axisName, showLabels)
{
	var vdChart = vizDef.getStructureByKey(oFF.VizDefConstants.K_CHART);
	var vdProperties = vdChart.getStructureByKey(oFF.VizDefConstants.K_PROPERTIES);
	var vdAxis = vdProperties.getStructureByKey(axisName);
	var vdAxisLabel = vdAxis.getStructureByKey(oFF.VizDefConstants.K_LABEL);
	var vdOtherAxis = this.getOppositeAxis(axisName, vdProperties);
	this.setTextStyle(axis, vdAxisLabel.getStructureByKey(oFF.VizDefConstants.K_STYLE));
	if (!showLabels)
	{
		axis.putString(oFF.GoogleConstants.K_TEXT_POSITION, oFF.GoogleConstants.V_POSITION_NONE);
	}
	var vdAxisLine = vdOtherAxis.getStructureByKey(oFF.VizDefConstants.K_AXIS_LINE);
	if (oFF.notNull(vdAxisLine) && vdAxisLine.getBooleanByKeyExt(oFF.VizDefConstants.K_VISIBLE, true))
	{
		axis.putInteger(oFF.GoogleConstants.K_BASELINE, 0);
	}
	var vdAxisReferenceLines = this.getAxisReferenceLines(vizDef, axisName);
	if (oFF.notNull(vdAxisReferenceLines))
	{
		var ticks = axis.putNewList(oFF.GoogleConstants.K_TICKS);
		for (var i = 0; i < vdAxisReferenceLines.size(); i++)
		{
			ticks.addString(vdAxisReferenceLines.getStructureAt(i).getStringByKey(oFF.VizDefConstants.K_VALUE));
		}
	}
	else if (!this.isTicksVisible(vdOtherAxis))
	{
		axis.putNewList(oFF.GoogleConstants.K_TICKS);
	}
};
oFF.GoogleChart.prototype.getOppositeAxis = function(axisName, vdProperties)
{
	if (oFF.XString.isEqual(axisName, oFF.VizDefConstants.K_CATEGORY_AXIS))
	{
		return vdProperties.getStructureByKey(oFF.VizDefConstants.K_VALUE_AXIS);
	}
	return vdProperties.getStructureByKey(oFF.VizDefConstants.K_CATEGORY_AXIS);
};
oFF.GoogleChart.prototype.getAxisReferenceLines = function(vizDef, axisName)
{
	var vdAnalyticObjects = vizDef.getStructureByKey(oFF.VizDefConstants.K_ANALYTIC_OBJECTS);
	var vdReferenceLines = vdAnalyticObjects.getListByKey(oFF.VizDefConstants.K_REFERENCELINES);
	if (oFF.notNull(vdReferenceLines))
	{
		for (var i = 0; i < vdReferenceLines.size(); i++)
		{
			var feed = vdReferenceLines.getStructureAt(i);
			if (oFF.XString.isEqual(feed.getStringByKey(oFF.VizDefConstants.K_FEED), axisName))
			{
				var markers = feed.getListByKey(oFF.VizDefConstants.K_MARKERS);
				if (!oFF.PrUtils.isListEmpty(markers))
				{
					return markers;
				}
			}
		}
	}
	return null;
};
oFF.GoogleChart.prototype.isTicksVisible = function(vdAxis)
{
	var vdAxisTick = vdAxis.getStructureByKey(oFF.VizDefConstants.K_AXIS_TICK);
	return oFF.notNull(vdAxisTick) && vdAxisTick.getBooleanByKeyExt(oFF.VizDefConstants.K_VISIBLE, false);
};

oFF.RsHiChartRenderHelper = function() {};
oFF.RsHiChartRenderHelper.prototype = new oFF.XObject();
oFF.RsHiChartRenderHelper.prototype._ff_c = "RsHiChartRenderHelper";

oFF.RsHiChartRenderHelper.createWithVisualizationDefinition = function(visualizationDefinition, cursorResultSet)
{
	var helper = null;
	var chartSetting = visualizationDefinition.getChartSetting();
	var chartType = oFF.ChartType.BAR_COLUMN;
	var chartOrientation = oFF.ChartOrientation.HORIZONTAL;
	var secondChartType = oFF.ChartType.NONE;
	var stackingType = oFF.ChartStackingType.NONE;
	if (oFF.notNull(chartSetting))
	{
		chartType = chartSetting.getChartType();
		if (chartType === oFF.ChartType.BAR_COLUMN && chartSetting.getChartType2() !== null)
		{
			secondChartType = chartSetting.getChartType2();
		}
		if (chartSetting.getChartOrientation() !== null)
		{
			chartOrientation = chartSetting.getChartOrientation();
		}
		stackingType = chartSetting.getChartStackingType();
	}
	if (oFF.notNull(cursorResultSet))
	{
		var chartTypeString = null;
		var secondChart = null;
		var isPolar = false;
		var innerRadius = "0%";
		var stackingTypeString = null;
		if (chartType === oFF.ChartType.VARIABLE_PIE || chartType === oFF.ChartType.VARI_WIDE)
		{
			stackingTypeString = oFF.VizDefConstants.V_NORMAL;
		}
		if (stackingType === oFF.ChartStackingType.NORMAL)
		{
			stackingTypeString = oFF.VizDefConstants.V_NORMAL;
		}
		else if (stackingType === oFF.ChartStackingType.PERCENT)
		{
			stackingTypeString = oFF.VizDefConstants.V_PERCENT;
		}
		if (chartType !== oFF.ChartType.BAR_COLUMN && chartType !== oFF.ChartType.LINE && chartType !== oFF.ChartType.AREA && chartType !== oFF.ChartType.VARI_WIDE && chartType !== oFF.ChartType.VARIABLE_PIE)
		{
			stackingTypeString = null;
		}
		chartTypeString = oFF.RsHiChartRenderHelper.unmapChartType(chartType, chartOrientation);
		if ((chartType === oFF.ChartType.LINE || chartType === oFF.ChartType.AREA || chartType === oFF.ChartType.POINT || chartType === oFF.ChartType.BAR_COLUMN) && (secondChartType === oFF.ChartType.LINE || secondChartType === oFF.ChartType.AREA || secondChartType === oFF.ChartType.POINT || secondChartType === oFF.ChartType.BAR_COLUMN))
		{
			secondChart = oFF.RsHiChartRenderHelper.unmapChartType(secondChartType, chartOrientation);
		}
		isPolar = oFF.RsHiChartRenderHelper.checkChartTypePolar(chartType);
		var inverted = chartOrientation === oFF.ChartOrientation.HORIZONTAL;
		var isCombinationChart = secondChartType !== oFF.ChartType.NONE;
		var isColumn = chartType === oFF.ChartType.BAR_COLUMN && chartOrientation === oFF.ChartOrientation.VERTICAL;
		var isBellcurve = chartType === oFF.ChartType.BELL_CURVE;
		var isLine = chartType === oFF.ChartType.LINE || chartType === oFF.ChartType.TIME_SERIES;
		var isTimeseries = chartType === oFF.ChartType.TIME_SERIES;
		var isBar = chartType === oFF.ChartType.BAR_COLUMN && chartOrientation === oFF.ChartOrientation.HORIZONTAL;
		var isSpline = chartType === oFF.ChartType.SPLINE;
		var isArea = chartType === oFF.ChartType.AREA;
		var isPie = chartType === oFF.ChartType.PIE || chartType === oFF.ChartType.DOUGHNUT;
		var isWordcloud = chartType === oFF.ChartType.WORD_CLOUD;
		var isVariablepie = chartType === oFF.ChartType.VARIABLE_PIE;
		var isVariwide = chartType === oFF.ChartType.VARI_WIDE;
		var isScatter = chartType === oFF.ChartType.SCATTER_PLOT;
		var isBubble = chartType === oFF.ChartType.BUBBLE;
		var isPackedBubble = chartType === oFF.ChartType.PACKED_BUBBLE;
		var isHeatMap = chartType === oFF.ChartType.HEAT_MAP;
		var isTreeMap = chartType === oFF.ChartType.TREE_MAP;
		var isBoxPlot = chartType === oFF.ChartType.BOX_PLOT;
		var isMetric = chartType === oFF.ChartType.METRIC;
		if (isLine || isBar || isSpline || isBellcurve || isColumn || isArea || isCombinationChart)
		{
			if (isTimeseries)
			{
				helper = new oFF.RsHiChartTimeSeriesHelper();
			}
			else
			{
				helper = new oFF.RsHiChartCategorialSeriesHelper();
			}
		}
		else if (isWordcloud)
		{
			helper = new oFF.RsHiChartWordcloudHelper();
		}
		else if (isPie || isVariablepie || isWordcloud)
		{
			helper = new oFF.RsHiChartPieHelper();
		}
		else if (isBoxPlot)
		{
			helper = new oFF.RsHiChartBoxplotHelper();
		}
		else if (isBubble || isScatter)
		{
			helper = new oFF.RsHiChartCorrelationHelper();
		}
		else if (isHeatMap)
		{
			helper = new oFF.RsHiChartHeatmapHelper();
		}
		else if (isTreeMap)
		{
			helper = new oFF.RsHiChartTreemapHelper();
		}
		else if (isMetric)
		{
			helper = new oFF.RsHiChartMetricHelper();
		}
		else if (isVariwide)
		{
			helper = new oFF.RsHiChartMarimekkoHelper();
		}
		else if (isPackedBubble)
		{
			helper = new oFF.RsHiChartClusterBubbleHelper();
		}
		else
		{
			helper = new oFF.RsHiChartUnsupportedHelper();
		}
		helper.setupBase(null, null, visualizationDefinition, cursorResultSet, chartTypeString, secondChart, stackingTypeString, innerRadius, isPolar, isCombinationChart, inverted);
	}
	return helper;
};
oFF.RsHiChartRenderHelper.checkChartTypePolar = function(chartType)
{
	return chartType === oFF.ChartType.RADAR || chartType === oFF.ChartType.PIE || chartType === oFF.ChartType.VARIABLE_PIE || chartType === oFF.ChartType.DOUGHNUT;
};
oFF.RsHiChartRenderHelper.unmapChartType = function(chartType, chartOrientation)
{
	var chartTypeString = null;
	if (chartType === oFF.ChartType.BAR_COLUMN && chartOrientation === oFF.ChartOrientation.HORIZONTAL)
	{
		chartTypeString = oFF.VizDefConstants.V_CHART_TYPE_BAR;
	}
	else if (chartType === oFF.ChartType.BAR_COLUMN && chartOrientation === oFF.ChartOrientation.VERTICAL)
	{
		chartTypeString = oFF.VizDefConstants.V_CHART_TYPE_COLUMN;
	}
	else if (chartType === oFF.ChartType.VARI_WIDE)
	{
		chartTypeString = oFF.VizDefConstants.K_VARIWIDE;
	}
	else if (chartType === oFF.ChartType.DOUGHNUT || chartType === oFF.ChartType.PIE)
	{
		chartTypeString = oFF.VizDefConstants.K_PIE;
	}
	else if (chartType === oFF.ChartType.SCATTER_PLOT)
	{
		chartTypeString = oFF.VizDefConstants.K_SCATTER;
	}
	else if (chartType === oFF.ChartType.BUBBLE)
	{
		chartTypeString = oFF.VizDefConstants.V_CHART_TYPE_BUBBLE;
	}
	else if (chartType === oFF.ChartType.RADAR)
	{
		chartTypeString = oFF.VizDefConstants.K_LINE;
	}
	else if (chartType === oFF.ChartType.METRIC)
	{
		chartTypeString = oFF.VizDefConstants.K_SOLID_GAUGE;
	}
	else if (chartType === oFF.ChartType.AREA)
	{
		chartTypeString = oFF.VizDefConstants.K_AREA;
	}
	else if (chartType === oFF.ChartType.BOX_PLOT)
	{
		chartTypeString = oFF.VizDefConstants.V_CHART_TYPE_BOXPLOT;
	}
	else if (chartType === oFF.ChartType.TIME_SERIES)
	{
		chartTypeString = oFF.VizDefConstants.K_LINE;
	}
	else if (chartType === oFF.ChartType.LINE)
	{
		chartTypeString = oFF.VizDefConstants.K_LINE;
	}
	else if (chartType === oFF.ChartType.PACKED_BUBBLE)
	{
		chartTypeString = oFF.VizDefConstants.K_PACKED_BUBBLE;
	}
	else if (chartType === oFF.ChartType.WORD_CLOUD)
	{
		chartTypeString = oFF.VizDefConstants.K_WORDCLOUD;
	}
	else if (chartType === oFF.ChartType.BELL_CURVE)
	{
		chartTypeString = oFF.VizDefConstants.V_CHART_TYPE_BELLCURVE;
	}
	else if (chartType === oFF.ChartType.SPLINE)
	{
		chartTypeString = oFF.VizDefConstants.K_SPLINE;
	}
	else if (chartType === oFF.ChartType.VARIABLE_PIE)
	{
		chartTypeString = oFF.VizDefConstants.K_VARIPIE;
	}
	else if (chartType === oFF.ChartType.HEAT_MAP)
	{
		chartTypeString = oFF.VizDefConstants.K_HEATMAP;
	}
	else if (chartType === oFF.ChartType.TREE_MAP)
	{
		chartTypeString = oFF.VizDefConstants.K_TREEMAP;
	}
	else if (chartType === oFF.ChartType.BOX_PLOT)
	{
		chartTypeString = oFF.VizDefConstants.V_CHART_TYPE_BOXPLOT;
	}
	return chartTypeString;
};
oFF.RsHiChartRenderHelper.create = function(type, rs)
{
	var helper = null;
	var userPrefrence = null;
	if (oFF.notNull(rs))
	{
		var intermediatechartType = null;
		var vizDef = rs.getQueryModel().getVizManager().getVizDef();
		var globalDef = rs.getQueryModel().getVizManager().getGlobalDef();
		var chartType = oFF.XString.toLowerCase(type.getName());
		var secondChart = null;
		var isPolar = false;
		var isTimeseries = false;
		var innerRadius = "0%";
		var stackingType = null;
		if (oFF.XString.isEqual(chartType, oFF.VizDefConstants.K_COMB_BCL))
		{
			chartType = oFF.VizDefConstants.V_CHART_TYPE_COLUMN;
			secondChart = oFF.VizDefConstants.K_LINE;
		}
		else if (oFF.XString.isEqual(chartType, oFF.VizDefConstants.K_RADAR))
		{
			chartType = oFF.VizDefConstants.K_LINE;
			isPolar = true;
		}
		var inverted = false;
		if (oFF.notNull(vizDef))
		{
			var chart = vizDef.getStructureByKey(oFF.VizDefConstants.K_CHART);
			userPrefrence = vizDef.getStructureByKey(oFF.VizDefConstants.K_USER_PREFERENCES);
			if (oFF.notNull(chart))
			{
				intermediatechartType = chart.getStringByKey(oFF.VizDefConstants.K_TYPE);
				if (oFF.XString.isEqual(intermediatechartType, oFF.VizDefConstants.V_CHART_TYPE_BAR) || oFF.XString.isEqual(intermediatechartType, oFF.VizDefConstants.V_STACKED_BAR))
				{
					inverted = true;
				}
			}
			var chartPropertiesGeneral;
			var chartProperties = chart.getStructureByKey(oFF.VizDefConstants.K_PROPERTIES);
			if (oFF.notNull(chartProperties))
			{
				chartPropertiesGeneral = chartProperties.getStructureByKey(oFF.VizDefConstants.K_GENERAL);
				if (oFF.notNull(chartPropertiesGeneral))
				{
					if (chartPropertiesGeneral.containsKey(oFF.VizDefConstants.K_INVERTED))
					{
						inverted = chartPropertiesGeneral.getBooleanByKey(oFF.VizDefConstants.K_INVERTED);
					}
					if (chartPropertiesGeneral.containsKey(oFF.VizDefConstants.K_ORIENTATION))
					{
						inverted = oFF.XString.isEqual(chartPropertiesGeneral.getStringByKey(oFF.VizDefConstants.K_ORIENTATION), oFF.VizDefConstants.V_HORIZONTAL);
					}
					stackingType = chartPropertiesGeneral.getStringByKey(oFF.VizDefConstants.K_FULL_STACKING);
				}
			}
			if (oFF.notNull(userPrefrence))
			{
				chartPropertiesGeneral = userPrefrence.getStructureByKey(oFF.VizDefConstants.K_GENERAL);
				if (oFF.notNull(chartPropertiesGeneral))
				{
					if (chartPropertiesGeneral.containsKey(oFF.VizDefConstants.K_INVERTED))
					{
						inverted = chartPropertiesGeneral.getBooleanByKey(oFF.VizDefConstants.K_INVERTED);
					}
					if (chartPropertiesGeneral.containsKey(oFF.VizDefConstants.K_ORIENTATION))
					{
						inverted = oFF.XString.isEqual(chartPropertiesGeneral.getStringByKey(oFF.VizDefConstants.K_ORIENTATION), oFF.VizDefConstants.V_HORIZONTAL);
					}
					if (chartPropertiesGeneral.containsKey(oFF.VizDefConstants.K_FULL_STACKING))
					{
						stackingType = chartPropertiesGeneral.getStringByKey(oFF.VizDefConstants.K_FULL_STACKING);
					}
				}
			}
			if (oFF.XString.isEqual(intermediatechartType, oFF.VizDefConstants.K_MARIMEKKO))
			{
				chartType = oFF.VizDefConstants.K_VARIWIDE;
				stackingType = oFF.VizDefConstants.V_NORMAL;
				inverted = false;
			}
			else if (oFF.XString.isEqual(intermediatechartType, oFF.VizDefConstants.K_BAR_COLUMN))
			{
				stackingType = null;
				if (!inverted)
				{
					chartType = oFF.VizDefConstants.V_CHART_TYPE_COLUMN;
				}
				else
				{
					chartType = oFF.VizDefConstants.V_CHART_TYPE_BAR;
				}
			}
			else if (oFF.XString.isEqual(intermediatechartType, oFF.VizDefConstants.V_TYPE_CHART_DONUT))
			{
				stackingType = null;
				inverted = false;
				chartType = oFF.VizDefConstants.K_PIE;
				innerRadius = "50%";
			}
			else if (oFF.XString.isEqual(intermediatechartType, oFF.VizDefConstants.K_SCATTER_PLOT))
			{
				stackingType = null;
				inverted = false;
				chartType = oFF.VizDefConstants.K_SCATTER;
			}
			else if (oFF.XString.isEqual(intermediatechartType, oFF.VizDefConstants.K_RADAR))
			{
				stackingType = null;
				inverted = false;
				chartType = oFF.VizDefConstants.K_LINE;
				isPolar = true;
			}
			else if (oFF.XString.isEqual(intermediatechartType, oFF.VizDefConstants.K_METRIC))
			{
				stackingType = null;
				inverted = false;
				chartType = oFF.VizDefConstants.K_SOLID_GAUGE;
			}
			else if (oFF.XString.isEqual(intermediatechartType, oFF.VizDefConstants.K_AREA))
			{
				inverted = false;
				stackingType = oFF.VizDefConstants.V_NORMAL;
				chartType = oFF.VizDefConstants.K_AREA;
			}
			else if (oFF.XString.isEqual(intermediatechartType, oFF.VizDefConstants.K_STACKED_BAR) || oFF.XString.isEqual(intermediatechartType, oFF.VizDefConstants.K_STACKED_COLUMN))
			{
				if (oFF.isNull(stackingType))
				{
					stackingType = oFF.VizDefConstants.V_NORMAL;
				}
				if (oFF.XString.isEqual(intermediatechartType, oFF.VizDefConstants.K_STACKED_COLUMN) && !inverted)
				{
					chartType = oFF.VizDefConstants.V_CHART_TYPE_COLUMN;
				}
				else if (oFF.XString.isEqual(intermediatechartType, oFF.VizDefConstants.K_STACKED_BAR) && inverted)
				{
					chartType = oFF.VizDefConstants.V_CHART_TYPE_BAR;
				}
				else
				{
					chartType = oFF.VizDefConstants.V_CHART_TYPE_COLUMN;
				}
			}
			else if (oFF.XString.isEqual(intermediatechartType, oFF.VizDefConstants.K_COMB_STACKED_BCL))
			{
				chartType = oFF.VizDefConstants.V_CHART_TYPE_COLUMN;
				secondChart = oFF.VizDefConstants.K_LINE;
				stackingType = oFF.VizDefConstants.V_NORMAL;
			}
			else if (oFF.XString.isEqual(intermediatechartType, oFF.VizDefConstants.K_COMB_BCL))
			{
				chartType = oFF.VizDefConstants.V_CHART_TYPE_COLUMN;
				secondChart = oFF.VizDefConstants.K_LINE;
				stackingType = null;
			}
			else if (oFF.XString.isEqual(intermediatechartType, oFF.VizDefConstants.V_CHART_TYPE_BOXPLOT))
			{
				chartType = oFF.VizDefConstants.V_CHART_TYPE_BOXPLOT;
				stackingType = null;
				inverted = false;
			}
			else if (oFF.XString.isEqual(intermediatechartType, oFF.VizDefConstants.K_TIME_SERIES))
			{
				isTimeseries = true;
				chartType = oFF.VizDefConstants.K_LINE;
				stackingType = null;
				inverted = false;
			}
			else if (oFF.XString.isEqual(intermediatechartType, oFF.VizDefConstants.K_CLUSTER_BUBBLE))
			{
				chartType = oFF.VizDefConstants.K_PACKED_BUBBLE;
				stackingType = null;
				inverted = false;
			}
			else
			{
				chartType = oFF.XString.toLowerCase(vizDef.getStructureByKey(oFF.VizDefConstants.K_CHART).getStringByKey(oFF.VizDefConstants.K_TYPE));
				stackingType = null;
				inverted = false;
			}
		}
		var isCombinationChart = !oFF.XString.isEqual(null, secondChart);
		var isColumn = oFF.XString.isEqual(chartType, oFF.VizDefConstants.V_CHART_TYPE_COLUMN);
		var isBellcurve = oFF.XString.isEqual(chartType, oFF.VizDefConstants.V_CHART_TYPE_BELLCURVE);
		var isLine = oFF.XString.isEqual(chartType, oFF.VizDefConstants.K_LINE);
		var isBar = oFF.XString.isEqual(chartType, oFF.VizDefConstants.V_CHART_TYPE_BAR);
		var isSpline = oFF.XString.isEqual(chartType, oFF.VizDefConstants.K_SPLINE);
		var isArea = oFF.XString.isEqual(chartType, oFF.VizDefConstants.K_AREA);
		var isPie = oFF.XString.isEqual(chartType, oFF.VizDefConstants.K_PIE);
		var isWordcloud = oFF.XString.isEqual(chartType, oFF.VizDefConstants.K_WORDCLOUD);
		var isVariablepie = oFF.XString.isEqual(chartType, oFF.VizDefConstants.K_VARIPIE);
		var isVariwide = oFF.XString.isEqual(chartType, oFF.VizDefConstants.K_VARIWIDE);
		var isScatter = oFF.XString.isEqual(chartType, oFF.VizDefConstants.K_SCATTER);
		var isBubble = oFF.XString.isEqual(chartType, oFF.VizDefConstants.V_CHART_TYPE_BUBBLE);
		var isPackedBubble = oFF.XString.isEqual(chartType, oFF.VizDefConstants.K_PACKED_BUBBLE);
		var isHeatMap = oFF.XString.isEqual(chartType, oFF.VizDefConstants.K_HEATMAP);
		var isTreeMap = oFF.XString.isEqual(chartType, oFF.VizDefConstants.K_TREEMAP);
		var isBoxPlot = oFF.XString.isEqual(chartType, oFF.VizDefConstants.V_CHART_TYPE_BOXPLOT);
		var isMetric = oFF.XString.isEqual(chartType, oFF.VizDefConstants.K_SOLID_GAUGE);
		if (isLine || isBar || isSpline || isBellcurve || isColumn || isArea || isCombinationChart)
		{
			if (isTimeseries)
			{
				helper = new oFF.RsHiChartTimeSeriesHelper();
			}
			else
			{
				helper = new oFF.RsHiChartCategorialSeriesHelper();
			}
		}
		else if (isWordcloud)
		{
			helper = new oFF.RsHiChartWordcloudHelper();
		}
		else if (isPie || isVariablepie || isWordcloud)
		{
			helper = new oFF.RsHiChartPieHelper();
		}
		else if (isBoxPlot)
		{
			helper = new oFF.RsHiChartBoxplotHelper();
		}
		else if (isBubble || isScatter)
		{
			helper = new oFF.RsHiChartCorrelationHelper();
		}
		else if (isHeatMap)
		{
			helper = new oFF.RsHiChartHeatmapHelper();
		}
		else if (isTreeMap)
		{
			helper = new oFF.RsHiChartTreemapHelper();
		}
		else if (isMetric)
		{
			helper = new oFF.RsHiChartMetricHelper();
		}
		else if (isVariwide)
		{
			helper = new oFF.RsHiChartMarimekkoHelper();
		}
		else if (isPackedBubble)
		{
			helper = new oFF.RsHiChartClusterBubbleHelper();
		}
		else
		{
			helper = new oFF.RsHiChartUnsupportedHelper();
		}
		helper.setupBase(vizDef, globalDef, null, rs, chartType, secondChart, stackingType, innerRadius, isPolar, isCombinationChart, inverted);
		if (oFF.notNull(userPrefrence))
		{
			oFF.RsHiChartVizUserPrefrence.userPrefrence(helper.getChartData(), userPrefrence, chartType);
		}
	}
	return helper;
};
oFF.RsHiChartRenderHelper.prototype.m_vizDef = null;
oFF.RsHiChartRenderHelper.prototype.m_globalDef = null;
oFF.RsHiChartRenderHelper.prototype.m_chartType = null;
oFF.RsHiChartRenderHelper.prototype.m_polar = false;
oFF.RsHiChartRenderHelper.prototype.m_innerRadius = null;
oFF.RsHiChartRenderHelper.prototype.m_theChartData = null;
oFF.RsHiChartRenderHelper.prototype.m_inverted = false;
oFF.RsHiChartRenderHelper.prototype.m_stackingType = null;
oFF.RsHiChartRenderHelper.prototype.m_showLegend = false;
oFF.RsHiChartRenderHelper.prototype.m_colors = null;
oFF.RsHiChartRenderHelper.prototype.m_colorIndex = 0;
oFF.RsHiChartRenderHelper.prototype.getStackingType = function()
{
	return this.m_stackingType;
};
oFF.RsHiChartRenderHelper.prototype.isInverted = function()
{
	return this.m_inverted;
};
oFF.RsHiChartRenderHelper.prototype.getVizDef = function()
{
	return this.m_vizDef;
};
oFF.RsHiChartRenderHelper.prototype.isPolar = function()
{
	return this.m_polar;
};
oFF.RsHiChartRenderHelper.prototype.getGlobalDef = function()
{
	return this.m_globalDef;
};
oFF.RsHiChartRenderHelper.prototype.getChartData = function()
{
	return this.m_theChartData;
};
oFF.RsHiChartRenderHelper.prototype.getChartType = function()
{
	return this.m_chartType;
};
oFF.RsHiChartRenderHelper.prototype.isUnsupported = function()
{
	return false;
};
oFF.RsHiChartRenderHelper.prototype.isResponsive = function()
{
	return true;
};
oFF.RsHiChartRenderHelper.prototype.getInnerRadius = function()
{
	return this.m_innerRadius;
};
oFF.RsHiChartRenderHelper.prototype.m_secondChart = null;
oFF.RsHiChartRenderHelper.prototype.getSecondChart = function()
{
	return this.m_secondChart;
};
oFF.RsHiChartRenderHelper.prototype.setupBase = function(vizDef, globalDef, visualizationDefinition, rs, chartType, secondChart, stackingType, innerRadius, isPolar, isCombinationChart, inverted)
{
	this.m_polar = isPolar;
	this.m_chartType = chartType;
	this.m_secondChart = secondChart;
	this.m_innerRadius = innerRadius;
	this.m_vizDef = vizDef;
	this.m_globalDef = globalDef;
	this.m_theChartData = oFF.PrFactory.createStructure();
	this.m_inverted = inverted;
	this.m_stackingType = stackingType;
	this.m_colorIndex = -1;
	var chartTypeInfo = this.m_theChartData.putNewStructure(oFF.VizDefConstants.K_CHART);
	if (this.m_inverted && !oFF.XString.isEqual(this.m_chartType, oFF.VizDefConstants.V_CHART_TYPE_BAR))
	{
		chartTypeInfo.putBoolean(oFF.VizDefConstants.K_INVERTED, true);
	}
	chartTypeInfo.putBoolean(oFF.VizDefConstants.K_POLAR, isPolar);
	chartTypeInfo.putString(oFF.VizDefConstants.K_TYPE, chartType);
	chartTypeInfo.putBoolean(oFF.VizDefConstants.K_ANIMATION, false);
	var chartlang = this.m_theChartData.putNewStructure(oFF.VizDefConstants.K_LANG);
	chartlang.putString(oFF.VizDefConstants.K_DECIMAL_POINT, ",");
	chartlang.putString(oFF.VizDefConstants.K_THOUSANDS_SEP, ".");
	var backgroundColor = "rgba(0,0,0,0)";
	chartTypeInfo.putString(oFF.VizDefConstants.K_BACKGROUND_COLOR, backgroundColor);
	if (oFF.notNull(vizDef))
	{
		backgroundColor = vizDef.getStringByKey(oFF.VizDefConstants.K_BBACKGROUND_COLOR);
		if (oFF.notNull(backgroundColor))
		{
			if (oFF.XString.size(backgroundColor) > 0)
			{
				chartTypeInfo.putString(oFF.VizDefConstants.K_BACKGROUND_COLOR, backgroundColor);
			}
		}
	}
	var chartTypeInfostyle = chartTypeInfo.putNewStructure(oFF.VizDefConstants.K_STYLE);
	chartTypeInfostyle.putString(oFF.VizDefConstants.K_FONT_FAMILY, "LatoWeb, 'Open Sans', 'Helvetica Neue', Helvetica, Arial, 'sans serif'");
	var boost = this.m_theChartData.putNewStructure(oFF.VizDefConstants.K_BOOST);
	var credits = this.m_theChartData.putNewStructure(oFF.VizDefConstants.K_CREDITS);
	credits.putBoolean(oFF.VizDefConstants.K_ENABLED, false);
	boost.putBoolean(oFF.VizDefConstants.K_USER_GPU_TRANSLATIONS, true);
	if (this.isUnsupported())
	{
		chartlang.putString(oFF.VizDefConstants.K_NO_DATA, "Chart not supported ");
		this.getChartData().putBoolean("fullscreenEnabled", false);
		return;
	}
	if (rs.hasErrors())
	{
		chartlang.putString(oFF.VizDefConstants.K_NO_DATA, "Olap query returned with errors ");
		this.getChartData().putBoolean(oFF.VizDefConstants.K_FULL_SCREEN_ENABLED, false);
		return;
	}
	oFF.RsHiChartVizUtils.vizProcessor(vizDef, chartTypeInfostyle, this.m_theChartData, chartType);
	if (this.isResponsive())
	{
		oFF.RsHiChartUtils.responsiveBuilder(chartType, this.m_theChartData);
	}
	var customFormatting = null;
	var feedMembers = null;
	if (oFF.notNull(vizDef))
	{
		customFormatting = oFF.RsVizAxisExtractor.extractCustomFormatting(vizDef, globalDef);
		feedMembers = vizDef.getStructureByKey("feedMembers");
	}
	if (oFF.isNull(feedMembers) && oFF.notNull(visualizationDefinition))
	{
		feedMembers = oFF.RsVizAxisExtractor.getFeedMembersFromVisualizationDefinition(rs, visualizationDefinition);
	}
	if (oFF.isNull(feedMembers))
	{
		feedMembers = oFF.RsVizAxisExtractor.guessFeedMembers(rs, chartType, isCombinationChart);
	}
	var columnTuples = oFF.RsVizAxisExtractor.getTuplesFromColumnAxis(rs, feedMembers, customFormatting);
	var rowTuples = oFF.RsVizAxisExtractor.getTuplesFromRowAxis(rs, feedMembers, customFormatting);
	this.initializeColorList();
	this.prepareRendering();
	this.readResultSetData(columnTuples, rowTuples, rs);
	this.reiterateResultSet(columnTuples, rowTuples, rs);
	this.addColorList();
	oFF.RsHiChartVizUtils.addColorGradient(globalDef, vizDef, this.m_theChartData);
	oFF.RsHiChartVizUtils.checkShowLegend(vizDef, this.m_theChartData, chartType, this.isShowLegend());
	this.finishRendering();
};
oFF.RsHiChartRenderHelper.prototype.addColorList = function()
{
	var colors = this.m_theChartData.putNewList(oFF.VizDefConstants.K_COLORS);
	for (var cls = 0; cls < this.m_colors.size(); cls++)
	{
		colors.addString(this.m_colors.get(cls));
	}
};
oFF.RsHiChartRenderHelper.prototype.getCurrentColor = function()
{
	return this.getColorAt(this.m_colorIndex);
};
oFF.RsHiChartRenderHelper.prototype.getColorAt = function(index)
{
	if (index > 0 && this.m_colors.size() > index)
	{
		return this.m_colors.get(index);
	}
	return null;
};
oFF.RsHiChartRenderHelper.prototype.initializeColorList = function()
{
	this.m_colors = oFF.XListOfString.create();
	var colorCollector = oFF.XListOfString.create();
	if (oFF.notNull(this.m_vizDef))
	{
		var colorScheme = this.m_vizDef.getStructureByKey(oFF.VizDefConstants.K_COLOR_SCHEME);
		var colorSet = oFF.XHashSetOfString.create();
		var colorSync = this.m_globalDef.getStructureByKey(oFF.VizDefConstants.K_COLOR_SYNC);
		var colorBindingName = oFF.XStringBuffer.create();
		var chartDefBindings = this.m_vizDef.getStructureByKey(oFF.VizDefConstants.K_CHART).getListByKey(oFF.VizDefConstants.K_BINDINGS);
		for (var i = 0; i < chartDefBindings.size(); ++i)
		{
			var binding = chartDefBindings.getStructureAt(i);
			if (oFF.XString.isEqual(binding.getStringByKey(oFF.VizDefConstants.K_FEED), oFF.VizDefConstants.K_COLOR))
			{
				var colorSource = binding.getListByKey(oFF.VizDefConstants.K_SOURCE);
				if (colorSource.size() > 0)
				{
					for (var j = 0; j < colorSource.size(); ++j)
					{
						if (colorSource.getStructureAt(j).hasStringByKey(oFF.VizDefConstants.K_ID))
						{
							if (colorBindingName.length() !== 0)
							{
								colorBindingName.append("/");
							}
							var curColorSource = colorSource.getStructureAt(j);
							if (curColorSource.containsKey(oFF.VizDefConstants.K_DIMENSION))
							{
								colorBindingName.append(curColorSource.getStringByKey(oFF.VizDefConstants.K_DIMENSION));
							}
							else
							{
								colorBindingName.append(curColorSource.getStringByKey(oFF.VizDefConstants.K_ID));
							}
						}
					}
				}
			}
		}
		if (!this.m_vizDef.getStructureByKey(oFF.VizDefConstants.K_CHART).getBooleanByKeyExt(oFF.VizDefConstants.K_IS_EXCLUDE_COLOR_SYNC, false))
		{
			if (oFF.XStringUtils.isNotNullAndNotEmpty(colorBindingName.toString()) && oFF.XCollectionUtils.hasElements(colorSync))
			{
				var colorMap = colorSync.getStructureByKey(colorBindingName.toString());
				if (oFF.notNull(colorMap))
				{
					var curColors = colorMap.getListByKey(oFF.VizDefConstants.K_COLORS);
					for (var k = 0; k < curColors.size(); ++k)
					{
						colorCollector.add(curColors.getStringAt(k));
					}
				}
			}
		}
		if (oFF.XCollectionUtils.hasElements(colorScheme))
		{
			var palleteColors = colorScheme.getListByKey(oFF.VizDefConstants.K_PALETTE_COLORS);
			if (oFF.notNull(palleteColors))
			{
				for (var y = 0; y < palleteColors.size(); y++)
				{
					colorCollector.add(palleteColors.getStringAt(y));
				}
			}
		}
		if (colorCollector.size() < 5 && oFF.XCollectionUtils.hasElements(colorSync))
		{
			var colorKeys = colorSync.getKeysAsReadOnlyListOfStringSorted();
			for (var cki = 0; cki < colorKeys.size(); cki++)
			{
				var curColorKey = colorKeys.get(cki);
				if (!oFF.XString.isEqual(curColorKey, colorBindingName.toString()))
				{
					var colourMap = colorSync.getStructureByKey(curColorKey);
					if (oFF.notNull(colourMap))
					{
						var curColours = colourMap.getListByKey(oFF.VizDefConstants.K_COLORS);
						for (var z = 0; z < curColours.size(); ++z)
						{
							colorCollector.add(curColours.getStringAt(z));
						}
					}
				}
			}
		}
		if (colorCollector.size() < 5)
		{
			colorCollector.add(oFF.VizDefConstants.V_COLOR_1);
			colorCollector.add(oFF.VizDefConstants.V_COLOR_2);
			colorCollector.add(oFF.VizDefConstants.V_COLOR_3);
			colorCollector.add(oFF.VizDefConstants.V_COLOR_4);
			colorCollector.add(oFF.VizDefConstants.V_COLOR_5);
			colorCollector.add(oFF.VizDefConstants.V_COLOR_6);
			colorCollector.add(oFF.VizDefConstants.V_COLOR_7);
			colorCollector.add(oFF.VizDefConstants.V_COLOR_8);
			colorCollector.add(oFF.VizDefConstants.V_COLOR_9);
			colorCollector.add(oFF.VizDefConstants.V_COLOR_10);
			colorCollector.add(oFF.VizDefConstants.V_COLOR_11);
			colorCollector.add(oFF.VizDefConstants.V_COLOR_12);
			colorCollector.add(oFF.VizDefConstants.V_COLOR_13);
			colorCollector.add(oFF.VizDefConstants.V_COLOR_14);
			colorCollector.add(oFF.VizDefConstants.V_COLOR_15);
			colorCollector.add(oFF.VizDefConstants.V_COLOR_16);
			colorCollector.add(oFF.VizDefConstants.V_COLOR_17);
			colorCollector.add(oFF.VizDefConstants.V_COLOR_18);
		}
		colorSet.addAll(colorCollector);
		for (var cls = 0; cls < colorCollector.size(); cls++)
		{
			var curColor = colorCollector.get(cls);
			if (colorSet.contains(curColor))
			{
				colorSet.removeElement(curColor);
				this.m_colors.add(curColor);
			}
		}
	}
	else
	{
		this.m_colors.add(oFF.VizDefConstants.V_COLOR_1);
		this.m_colors.add(oFF.VizDefConstants.V_COLOR_2);
		this.m_colors.add(oFF.VizDefConstants.V_COLOR_3);
		this.m_colors.add(oFF.VizDefConstants.V_COLOR_4);
		this.m_colors.add(oFF.VizDefConstants.V_COLOR_5);
		this.m_colors.add(oFF.VizDefConstants.V_COLOR_6);
		this.m_colors.add(oFF.VizDefConstants.V_COLOR_7);
		this.m_colors.add(oFF.VizDefConstants.V_COLOR_8);
		this.m_colors.add(oFF.VizDefConstants.V_COLOR_9);
		this.m_colors.add(oFF.VizDefConstants.V_COLOR_10);
		this.m_colors.add(oFF.VizDefConstants.V_COLOR_11);
		this.m_colors.add(oFF.VizDefConstants.V_COLOR_12);
		this.m_colors.add(oFF.VizDefConstants.V_COLOR_13);
		this.m_colors.add(oFF.VizDefConstants.V_COLOR_14);
		this.m_colors.add(oFF.VizDefConstants.V_COLOR_15);
		this.m_colors.add(oFF.VizDefConstants.V_COLOR_16);
		this.m_colors.add(oFF.VizDefConstants.V_COLOR_17);
		this.m_colors.add(oFF.VizDefConstants.V_COLOR_18);
	}
};
oFF.RsHiChartRenderHelper.prototype.addColorAndPattern = function(colorOrig, pattern, dataLayer, chartType, individualDataPoint)
{
	if (!individualDataPoint)
	{
		this.m_colorIndex++;
	}
	var color = colorOrig;
	if (oFF.XStringUtils.isNullOrEmpty(color) && this.m_colorIndex < this.m_colors.size())
	{
		color = this.m_colors.get(this.m_colorIndex);
	}
	if (!oFF.XString.isEqual(chartType, oFF.VizDefConstants.K_LINE) && oFF.XStringUtils.isNotNullAndNotEmpty(pattern))
	{
		dataLayer.putStringNotNullAndNotEmpty(oFF.VizDefConstants.K_BORDER_COLOR, color);
		if (oFF.XString.isEqual(pattern, oFF.VizDefConstants.K_PATTERN_NON_FILL))
		{
			if (individualDataPoint && !oFF.XString.isEqual(chartType, oFF.VizDefConstants.K_AREA))
			{
				dataLayer.putString(oFF.VizDefConstants.K_COLOR, "#ffffff");
			}
			else
			{
				dataLayer.putStringNotNullAndNotEmpty(oFF.VizDefConstants.K_COLOR, color);
			}
		}
		else
		{
			var size = 0;
			var path = "";
			if (oFF.XString.isEqual(pattern, oFF.VizDefConstants.K_PATTERN_HATCHING1))
			{
				size = oFF.VizDefConstants.V_PATTERN_SIZE_HATCHING1;
				path = oFF.VizDefConstants.V_PATTERN_PATH_HATCHING1;
			}
			else if (oFF.XString.isEqual(pattern, oFF.VizDefConstants.K_PATTERN_HATCHING2))
			{
				size = oFF.VizDefConstants.V_PATTERN_SIZE_HATCHING2;
				path = oFF.VizDefConstants.V_PATTERN_PATH_HATCHING2;
			}
			else if (oFF.XString.isEqual(pattern, oFF.VizDefConstants.K_PATTERN_HATCHING3))
			{
				size = oFF.VizDefConstants.V_PATTERN_SIZE_HATCHING3;
				path = oFF.VizDefConstants.V_PATTERN_PATH_HATCHING3;
			}
			else if (oFF.XString.isEqual(pattern, oFF.VizDefConstants.K_PATTERN_HATCHING4))
			{
				size = oFF.VizDefConstants.V_PATTERN_SIZE_HATCHING4;
				path = oFF.VizDefConstants.V_PATTERN_PATH_HATCHING4;
			}
			else if (oFF.XString.isEqual(pattern, oFF.VizDefConstants.K_PATTERN_HATCHING5))
			{
				size = oFF.VizDefConstants.V_PATTERN_SIZE_HATCHING5;
				path = oFF.VizDefConstants.V_PATTERN_PATH_HATCHING5;
			}
			else if (oFF.XString.isEqual(pattern, oFF.VizDefConstants.K_PATTERN_HATCHING6))
			{
				size = oFF.VizDefConstants.V_PATTERN_SIZE_HATCHING6;
				path = oFF.VizDefConstants.V_PATTERN_PATH_HATCHING6;
			}
			else if (oFF.XString.isEqual(pattern, oFF.VizDefConstants.K_PATTERN_HATCHING7))
			{
				size = oFF.VizDefConstants.V_PATTERN_SIZE_HATCHING7;
				path = oFF.VizDefConstants.V_PATTERN_PATH_HATCHING7;
			}
			else if (oFF.XString.isEqual(pattern, oFF.VizDefConstants.K_PATTERN_HATCHING8))
			{
				size = oFF.VizDefConstants.V_PATTERN_SIZE_HATCHING8;
				path = oFF.VizDefConstants.V_PATTERN_PATH_HATCHING8;
			}
			if (size > 0 && oFF.XStringUtils.isNotNullAndNotEmpty(path))
			{
				var patternStructure = dataLayer.putNewStructure(oFF.VizDefConstants.K_COLOR).putNewStructure(oFF.VizDefConstants.K_PATTERN);
				patternStructure.putStringNotNullAndNotEmpty(oFF.VizDefConstants.K_COLOR, color);
				patternStructure.putInteger(oFF.VizDefConstants.K_WIDTH, size);
				patternStructure.putInteger(oFF.VizDefConstants.K_HEIGHT, size);
				patternStructure.putString(oFF.VizDefConstants.K_PATH, path);
			}
		}
	}
	else
	{
		dataLayer.putStringNotNullAndNotEmpty(oFF.VizDefConstants.K_COLOR, color);
	}
};
oFF.RsHiChartRenderHelper.prototype.reiterateResultSet = function(columnAxis, rowAxis, rs) {};
oFF.RsHiChartRenderHelper.prototype.isShowLegend = function()
{
	return this.m_showLegend;
};
oFF.RsHiChartRenderHelper.prototype.setShowLegend = function(showLegend)
{
	this.m_showLegend = showLegend;
};

oFF.RsMicroChartRenderer = function() {};
oFF.RsMicroChartRenderer.prototype = new oFF.XObject();
oFF.RsMicroChartRenderer.prototype._ff_c = "RsMicroChartRenderer";

oFF.RsMicroChartRenderer.create = function()
{
	return new oFF.RsMicroChartRenderer();
};
oFF.RsMicroChartRenderer.prototype.m_valueAxis = null;
oFF.RsMicroChartRenderer.prototype.m_seriesFilColor = null;
oFF.RsMicroChartRenderer.prototype.render = function(type, rs)
{
	var vizDef = rs.getQueryModel().getVizManager().getVizDef();
	var globalDef = rs.getQueryModel().getVizManager().getGlobalDef();
	var chartJson = oFF.PrFactory.createStructure();
	if (oFF.notNull(vizDef))
	{
		var chartDef = vizDef.getStructureByKey("chart");
		if (oFF.notNull(chartDef))
		{
			if (oFF.XString.isEqual(chartDef.getStringByKey("type"), "barcolumn"))
			{
				this.renderColumnChart(rs, chartJson, vizDef);
			}
		}
		chartJson.put("vizDef", vizDef);
		chartJson.put("globalDef", globalDef);
	}
	else
	{
		this.renderColumnChart(rs, chartJson, null);
	}
	return chartJson;
};
oFF.RsMicroChartRenderer.prototype.renderVisualizationWithResultSet = function(visualizationDefinition, cursorResultSet)
{
	return this.render(visualizationDefinition.getSemanticBindingType(), cursorResultSet);
};
oFF.RsMicroChartRenderer.prototype.renderColumnChart = function(rs, chartJson, vizDef)
{
	chartJson.putString("chart", "Column");
	chartJson.putBoolean("allowColumnLabels", true);
	var columnList = chartJson.putNewList("columns");
	this.extractValueAxisFromVizDef(vizDef);
	this.extractSeriesColorsFromVizDef(vizDef);
	this.generateColumns(rs, columnList);
};
oFF.RsMicroChartRenderer.prototype.generateColumns = function(rs, columnList)
{
	var colAxis = rs.getCursorColumnsAxis();
	colAxis.setTupleCursorBeforeStart();
	var colCounter = 0;
	while (colAxis.hasNextTuple())
	{
		var colLabel = null;
		var colVal = 0;
		var colDisplayVal = null;
		var colHierarchyKey = null;
		var debugAllFieldValues = "";
		colAxis.nextTuple();
		while (colAxis.hasNextTupleElement())
		{
			colAxis.nextTupleElement();
			while (colAxis.hasNextFieldValue())
			{
				colAxis.nextFieldValue();
				var pt = colAxis.getField().getPresentationType();
				var formattedValue = colAxis.getFormattedValue();
				debugAllFieldValues = oFF.XStringUtils.concatenate5(pt.getName(), ":", formattedValue, " - ", debugAllFieldValues);
				if (pt.isTypeOf(oFF.PresentationType.SHORT_TEXT) || pt.isTypeOf(oFF.PresentationType.LONG_TEXT) || pt.isTypeOf(oFF.PresentationType.MEDIUM_TEXT) || pt.isTypeOf(oFF.PresentationType.HIERARCHY_TEXT))
				{
					colLabel = formattedValue;
				}
				else if (oFF.isNull(colLabel) && pt.isTypeOf(oFF.PresentationType.DISPLAY_KEY))
				{
					colLabel = formattedValue;
				}
				if (pt.isTypeOf(oFF.PresentationType.HIERARCHY_KEY))
				{
					colHierarchyKey = formattedValue;
				}
			}
		}
		var tmpDataCell = rs.getDataCell(colCounter, 0);
		colVal = tmpDataCell.getDouble();
		colDisplayVal = tmpDataCell.getFormattedValue();
		colCounter++;
		var memberIndex = this.getIndexOfMember(colHierarchyKey);
		var columnColor = this.getColorForMember(colHierarchyKey);
		var tmpCol = oFF.PrStructure.create();
		if (memberIndex !== -1 && columnList.size() > memberIndex)
		{
			columnList.insert(memberIndex, tmpCol);
		}
		else
		{
			columnList.add(tmpCol);
		}
		tmpCol.putDouble("value", colVal);
		tmpCol.putString("displayValue", colDisplayVal);
		tmpCol.putString("label", colLabel);
		if (oFF.notNull(columnColor))
		{
			tmpCol.putString("color", columnColor);
		}
		tmpCol.putString("hierarchyKey", colHierarchyKey);
	}
};
oFF.RsMicroChartRenderer.prototype.extractValueAxisFromVizDef = function(vizDef)
{
	if (oFF.notNull(vizDef))
	{
		var feedMembers = vizDef.getStructureByKey("feedMembers");
		if (oFF.notNull(feedMembers))
		{
			this.m_valueAxis = feedMembers.getListByKey("valueAxis");
		}
	}
};
oFF.RsMicroChartRenderer.prototype.getIndexOfMember = function(hierarchyKey)
{
	if (oFF.notNull(this.m_valueAxis))
	{
		return this.m_valueAxis.getIndex(oFF.PrString.createWithValue(hierarchyKey));
	}
	return -1;
};
oFF.RsMicroChartRenderer.prototype.extractSeriesColorsFromVizDef = function(vizDef)
{
	this.m_seriesFilColor = oFF.PrStructure.create();
	if (oFF.notNull(vizDef))
	{
		var userPreferences = vizDef.getStructureByKey("userPreferences");
		if (oFF.notNull(userPreferences))
		{
			var series = userPreferences.getStructureByKey("series");
			if (oFF.notNull(series))
			{
				var fillColor = series.getStructureByKey("fillColor");
				if (oFF.notNull(fillColor))
				{
					var fillColorKeysIterator = fillColor.getKeysAsIteratorOfString();
					while (fillColorKeysIterator.hasNext())
					{
						var tmpFillColorKey = fillColorKeysIterator.next();
						var tmpColorList = fillColor.getListByKey(tmpFillColorKey);
						for (var a = 0; a < tmpColorList.size(); a++)
						{
							var tmpSecondaryList = tmpColorList.getListAt(a);
							if (tmpSecondaryList.size() > 0)
							{
								var tmpThirdList = tmpSecondaryList.getListAt(0);
								if (tmpThirdList.size() > 0)
								{
									var tmpColorMember = tmpThirdList.getStructureAt(0);
									if (oFF.notNull(tmpColorMember))
									{
										var tmpEntityId = tmpColorMember.getStructureByKey("entityId");
										if (oFF.notNull(tmpEntityId))
										{
											var memberId = tmpEntityId.getStringByKeyExt("id", null);
											if (oFF.notNull(memberId))
											{
												var validColor = oFF.XString.replace(tmpFillColorKey, "\"", "");
												this.m_seriesFilColor.putString(memberId, validColor);
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
};
oFF.RsMicroChartRenderer.prototype.getColorForMember = function(hierarchyKey)
{
	if (oFF.notNull(this.m_seriesFilColor) && this.m_seriesFilColor.size() > 0)
	{
		return this.m_seriesFilColor.getStringByKey(hierarchyKey);
	}
	return null;
};

oFF.RsHiChartVizEvents = {

	create:function()
	{
			return new oFF.RsHiChartVizEvents();
	},
	addEvents:function(theChartData, chartType, vizDef)
	{
			if (oFF.XString.isEqual(chartType, oFF.VizDefConstants.V_CHART_TYPE_BUBBLE) || oFF.XString.isEqual(chartType, oFF.VizDefConstants.K_SCATTER))
		{
			var onLoadFuncStr = "function(){var newXMinArr=[];var newXMaxArr=[];var newYMinArr=[];var newYMaxArr=[];for(var tmpSeriesIndex in this.series){newXMinArr.push(Math.min.apply(Math,this.series[tmpSeriesIndex].xData));newXMaxArr.push(Math.max.apply(Math,this.series[tmpSeriesIndex].xData));newYMinArr.push(Math.min.apply(Math,this.series[tmpSeriesIndex].yData));newYMaxArr.push(Math.max.apply(Math,this.series[tmpSeriesIndex].yData))} let maxX=Math.max.apply(Math,newXMaxArr);let minX=Math.min.apply(Math,newXMinArr);let maxY=Math.max.apply(Math,newYMaxArr);let minY=Math.min.apply(Math,newYMinArr);var intervalX=this.xAxis[0].tickInterval;var intervalY=this.yAxis[0].tickInterval;this.xAxis[0].update({max:1.1*maxX,min:Math.min(0,(minX)-intervalX/2)},!1);this.yAxis[0].update({max:1.1*maxY,min:Math.min(0,(minY)-intervalY/2)},!1);this.redraw(!1)}";
			var chartStruct = theChartData.getStructureByKey(oFF.VizDefConstants.K_CHART);
			if (oFF.notNull(chartStruct))
			{
				var eventsStruct = chartStruct.putNewStructure("events");
				eventsStruct.putString("load", onLoadFuncStr);
			}
		}
		return theChartData;
	}
};

oFF.RsVizAxis = function() {};
oFF.RsVizAxis.prototype = new oFF.XObject();
oFF.RsVizAxis.prototype._ff_c = "RsVizAxis";

oFF.RsVizAxis.create = function()
{
	var newInstance = new oFF.RsVizAxis();
	newInstance.m_numberFormatingInfosByFeed = oFF.XHashMapByString.create();
	newInstance.m_elements = oFF.XList.create();
	newInstance.m_availableFeedTypes = oFF.XHashSetOfString.create();
	return newInstance;
};
oFF.RsVizAxis.prototype.m_elements = null;
oFF.RsVizAxis.prototype.m_availableFeedTypes = null;
oFF.RsVizAxis.prototype.m_numberFormatingInfosByFeed = null;
oFF.RsVizAxis.prototype.m_numberFormattingInfo = null;
oFF.RsVizAxis.prototype.releaseObject = function()
{
	this.m_elements = oFF.XObjectExt.release(this.m_elements);
	this.m_availableFeedTypes = oFF.XObjectExt.release(this.m_availableFeedTypes);
	this.m_numberFormattingInfo = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.RsVizAxis.prototype.getFormattedValue = function(baseFeed, feedTuple, dataCell)
{
	var fallBackFormattingInfo = this.m_numberFormatingInfosByFeed.getByKey(baseFeed);
	return oFF.RsVizAxisExtractor.getFormattedValue(dataCell, feedTuple.getNumberFormattingInfo(), fallBackFormattingInfo);
};
oFF.RsVizAxis.prototype.getDecimalPlaces = function(baseFeed)
{
	var selectedNumberFormattingInfo = this.m_numberFormatingInfosByFeed.getByKey(baseFeed);
	if (oFF.notNull(selectedNumberFormattingInfo))
	{
		return selectedNumberFormattingInfo.getMaxDecimalPlaces();
	}
	return oFF.notNull(this.m_numberFormattingInfo) ? this.m_numberFormattingInfo.getMaxDecimalPlaces() : 0;
};
oFF.RsVizAxis.prototype.getNumericShift = function(baseFeed)
{
	var selectedNumberFormattingInfo = this.m_numberFormatingInfosByFeed.getByKey(baseFeed);
	if (oFF.notNull(selectedNumberFormattingInfo))
	{
		return selectedNumberFormattingInfo.getNumericShift();
	}
	return oFF.notNull(this.m_numberFormattingInfo) ? this.m_numberFormattingInfo.getNumericShift() : 0;
};
oFF.RsVizAxis.prototype.getScaledValue = function(baseFeed, feedTuple, dataCell)
{
	var fallBackFormattingInfo = this.m_numberFormatingInfosByFeed.getByKey(baseFeed);
	return oFF.RsVizAxisExtractor.getScaledValue(dataCell, feedTuple.getNumberFormattingInfo(), fallBackFormattingInfo);
};
oFF.RsVizAxis.prototype.addElement = function(element)
{
	this.m_elements.add(element);
	var availableFeedTypes = element.getAvailableFeedTypes();
	this.m_availableFeedTypes.addAll(availableFeedTypes);
	var newNumberFormattingInfo = element.getNumberFormattingInfo();
	if (oFF.isNull(this.m_numberFormattingInfo) || this.m_numberFormattingInfo.isUseFormattingFromDataCell())
	{
		this.m_numberFormattingInfo = newNumberFormattingInfo;
	}
	var feedTypeIterator = availableFeedTypes.getIterator();
	while (feedTypeIterator.hasNext())
	{
		var curFeedType = feedTypeIterator.next();
		var curNumberFormattingInfo = this.m_numberFormatingInfosByFeed.getByKey(curFeedType);
		if (oFF.isNull(curNumberFormattingInfo) || curNumberFormattingInfo.isUseFormattingFromDataCell())
		{
			this.m_numberFormatingInfosByFeed.put(curFeedType, newNumberFormattingInfo);
		}
	}
};
oFF.RsVizAxis.prototype.getExtendedPrettyNamesForFeed = function(unique, includeTotals, feedSelector, extensions)
{
	var list = oFF.XListOfString.create();
	if (oFF.XStringUtils.isNotNullAndNotEmpty(feedSelector))
	{
		list.add(feedSelector);
	}
	return this.getExtendedPrettyNamesForFeeds(unique, includeTotals, list, extensions);
};
oFF.RsVizAxis.prototype.getExtendedPrettyNamesForFeeds = function(unique, includeTotals, feedSelectorOrig, extensions)
{
	var feedSelector = oFF.XListOfString.create();
	feedSelector.addAll(feedSelectorOrig);
	var availableFeedIterator;
	if (oFF.XCollectionUtils.hasElements(extensions))
	{
		availableFeedIterator = extensions.getIterator();
	}
	else
	{
		availableFeedIterator = this.m_availableFeedTypes.getIterator();
	}
	while (availableFeedIterator.hasNext())
	{
		var feed = availableFeedIterator.next();
		if (!feedSelectorOrig.contains(feed) && this.getPrettyNamesForFeed(true, includeTotals, feed).size() > 1)
		{
			feedSelector.add(feed);
		}
	}
	return this.getPrettyNamesForFeeds(unique, includeTotals, feedSelector);
};
oFF.RsVizAxis.prototype.getPrettyNamesForFeeds = function(unique, includeTotals, feedSelector)
{
	var result = oFF.XListOfString.create();
	var keyResult = oFF.XListOfString.create();
	for (var i = 0; i < this.m_elements.size(); i++)
	{
		var prettyResult = this.m_elements.get(i).getPrettyText(feedSelector);
		var prettyKeyResult = this.m_elements.get(i).getPrettyKeyText(feedSelector);
		if (oFF.XStringUtils.isNotNullAndNotEmpty(prettyResult))
		{
			if (!unique || !keyResult.contains(prettyKeyResult) && (includeTotals || !this.m_elements.get(i).isTotal()))
			{
				result.add(prettyResult);
				keyResult.add(prettyKeyResult);
			}
		}
	}
	return result;
};
oFF.RsVizAxis.prototype.getFormattedNamesForFeeds = function(unique, includeTotals, feedSelector)
{
	var result = oFF.XListOfString.create();
	var keyResult = oFF.XListOfString.create();
	for (var i = 0; i < this.m_elements.size(); i++)
	{
		var prettyResult = this.m_elements.get(i).getFormattedText(feedSelector);
		var prettyKeyResult = this.m_elements.get(i).getPrettyKeyText(feedSelector);
		if (oFF.XStringUtils.isNotNullAndNotEmpty(prettyResult))
		{
			if (!unique || !keyResult.contains(prettyKeyResult) && (includeTotals || !this.m_elements.get(i).isTotal()))
			{
				result.add(prettyResult);
				keyResult.add(prettyKeyResult);
			}
		}
	}
	return result;
};
oFF.RsVizAxis.prototype.getPrettyNamesForFeedsExclude = function(unique, includeTotals, feedSelector, excludeFeeds)
{
	var result = oFF.XListOfString.create();
	var keyResult = oFF.XListOfString.create();
	for (var i = 0; i < this.m_elements.size(); i++)
	{
		var prettyResult = this.m_elements.get(i).getPrettyTextExclude(feedSelector, excludeFeeds);
		var prettyKeyResult = this.m_elements.get(i).getPrettyKeyText(feedSelector);
		if (oFF.XStringUtils.isNotNullAndNotEmpty(prettyResult))
		{
			if (!unique || !keyResult.contains(prettyKeyResult) && (includeTotals || !this.m_elements.get(i).isTotal()))
			{
				result.add(prettyResult);
				keyResult.add(prettyKeyResult);
			}
		}
	}
	return result;
};
oFF.RsVizAxis.prototype.getMatchingFeedSubList = function(feedSelector)
{
	var result = oFF.XListOfString.create();
	for (var j = 0; j < feedSelector.size(); j++)
	{
		for (var i = 0; i < this.m_elements.size(); i++)
		{
			if (this.m_elements.get(i).isSelectedByString(feedSelector.get(j)))
			{
				result.add(feedSelector.get(j));
				break;
			}
		}
	}
	return result;
};
oFF.RsVizAxis.prototype.hasTupleForFeed = function(feed)
{
	for (var i = 0; i < this.m_elements.size(); i++)
	{
		if (this.m_elements.get(i).isSelectedByString(feed))
		{
			return true;
		}
	}
	return false;
};
oFF.RsVizAxis.prototype.getTupleForFeed = function(feed)
{
	for (var i = 0; i < this.m_elements.size(); i++)
	{
		if (this.m_elements.get(i).isSelectedByString(feed))
		{
			return this.m_elements.get(i);
		}
	}
	return null;
};
oFF.RsVizAxis.prototype.getMatchingTupleIndicesForMemberNameAndFeed = function(memberNames, feed)
{
	var result = oFF.XList.create();
	for (var h = 0; h < this.m_elements.size(); h++)
	{
		var selected = 2;
		var curElement = this.m_elements.get(h);
		if (curElement.isSelectedByString(feed))
		{
			for (var j = 0; j < memberNames.size(); j++)
			{
				var curMemberName = memberNames.get(j);
				if (!curElement.getMemberKeys().contains(curMemberName))
				{
					selected--;
				}
			}
			if (selected > 0)
			{
				result.add(oFF.XIntegerValue.create(h));
			}
		}
	}
	return result;
};
oFF.RsVizAxis.prototype.getMatchingTupleIndicesForMemberNamesAndSuffix = function(memberNames, suffix)
{
	for (var i = 0; i < this.m_elements.size(); i++)
	{
		var selected = true;
		var matchSuffix = false;
		var curElement = this.m_elements.get(i);
		for (var j = 0; j < memberNames.size(); j++)
		{
			var curFeedSelector = memberNames.get(j);
			var matchCurrentSuffix = curElement.isSelectedByString(oFF.XStringUtils.concatenate2(curFeedSelector, suffix));
			matchSuffix = matchCurrentSuffix || matchSuffix;
			if (!curElement.getMemberKeys().contains(curFeedSelector) && !matchCurrentSuffix)
			{
				selected = false;
				break;
			}
		}
		if (selected && matchSuffix)
		{
			return i;
		}
	}
	return -1;
};
oFF.RsVizAxis.prototype.getTupleIndexForMemberName = function(memberName)
{
	var list = oFF.XList.create();
	for (var i = 0; i < this.m_elements.size(); i++)
	{
		if (this.m_elements.get(i).getMemberKeys().contains(memberName))
		{
			list.add(oFF.XIntegerValue.create(i));
		}
	}
	return list;
};
oFF.RsVizAxis.prototype.getTupleIndexForMemberNames = function(memberNames)
{
	var list = oFF.XList.create();
	for (var i = 0; i < this.m_elements.size(); i++)
	{
		var candidate = true;
		for (var j = 0; j < memberNames.size(); j++)
		{
			var member = memberNames.get(j);
			if (!this.m_elements.get(i).getMemberKeys().contains(member))
			{
				candidate = false;
				break;
			}
		}
		if (candidate)
		{
			list.add(oFF.XIntegerValue.create(i));
		}
	}
	return list;
};
oFF.RsVizAxis.prototype.getIndicesGroupedByFeed = function(groupingFeed)
{
	var map = oFF.XHashMapByString.create();
	for (var i = 0; i < this.getTuplesCount(); i++)
	{
		var currentTuple = this.getTupleAt(i);
		var currentGroupingFeed = currentTuple.getPrettyText(groupingFeed);
		if (!map.containsKey(currentGroupingFeed))
		{
			map.put(currentGroupingFeed, oFF.XList.create());
		}
		map.getByKey(currentGroupingFeed).add(oFF.XIntegerValue.create(i));
	}
	return map;
};
oFF.RsVizAxis.prototype.getIndicesGroupedByFeedAndOrdered = function(groupingFeed, orderingFeed)
{
	var map = oFF.XHashMapByString.create();
	var list = this.getIndicesByFeedOrder(orderingFeed);
	for (var i = 0; i < list.size(); i++)
	{
		var currentIndex = list.get(i);
		var currentTuple = this.getTupleAt(currentIndex.getInteger());
		var currentGroupingFeed = currentTuple.getPrettyText(groupingFeed);
		if (!map.containsKey(currentGroupingFeed))
		{
			map.put(currentGroupingFeed, oFF.XList.create());
		}
		map.getByKey(currentGroupingFeed).add(currentIndex);
	}
	return map;
};
oFF.RsVizAxis.prototype.getIndicesByFeedOrder = function(feedSelector)
{
	var list = oFF.XList.create();
	for (var h = 0; h < feedSelector.size(); h++)
	{
		var currentFeed = feedSelector.get(h);
		var currentBorder = list.size();
		for (var i = 0; i < this.m_elements.size(); i++)
		{
			var currentElement = this.m_elements.get(i);
			if (currentElement.isSelectedByString(currentFeed))
			{
				var j = list.size();
				while (j > currentBorder && currentElement.compareTo(this.m_elements.get(list.get(j - 1).getInteger())) < 0)
				{
					j--;
				}
				list.insert(j, oFF.XIntegerValue.create(i));
			}
		}
	}
	return list;
};
oFF.RsVizAxis.prototype.getPrettyNamesForFeed = function(unique, includeTotals, feedSelector)
{
	var list = oFF.XListOfString.create();
	if (oFF.XStringUtils.isNotNullAndNotEmpty(feedSelector))
	{
		list.add(feedSelector);
	}
	return this.getPrettyNamesForFeeds(unique, includeTotals, list);
};
oFF.RsVizAxis.prototype.getFormattedNamesForFeed = function(unique, includeTotals, feedSelector)
{
	var list = oFF.XListOfString.create();
	if (oFF.XStringUtils.isNotNullAndNotEmpty(feedSelector))
	{
		list.add(feedSelector);
	}
	return this.getFormattedNamesForFeeds(unique, includeTotals, list);
};
oFF.RsVizAxis.prototype.getPrettyNamesForFeedExclude = function(unique, includeTotals, feedSelector, excludeFeeds)
{
	var list = oFF.XListOfString.create();
	if (oFF.XStringUtils.isNotNullAndNotEmpty(feedSelector))
	{
		list.add(feedSelector);
	}
	return this.getPrettyNamesForFeedsExclude(unique, includeTotals, list, excludeFeeds);
};
oFF.RsVizAxis.prototype.getLabelsForFeed = function(unique, includeTotals, withHierarchy, feedSelector)
{
	var list = oFF.XListOfString.create();
	if (oFF.XStringUtils.isNotNullAndNotEmpty(feedSelector))
	{
		list.add(feedSelector);
	}
	return this.getLabelsForFeeds(unique, includeTotals, withHierarchy, list);
};
oFF.RsVizAxis.prototype.getLabelsForFeeds = function(unique, includeTotals, withHierarchy, feedSelector)
{
	var container = oFF.XHashSetOfString.create();
	var result = oFF.XList.create();
	for (var i = 0; i < this.m_elements.size(); i++)
	{
		var prettyResult = this.m_elements.get(i).getLabel(withHierarchy ? this : null, feedSelector);
		if (oFF.notNull(prettyResult))
		{
			if (!unique || !container.contains(prettyResult.getCompoundId()) && (includeTotals || !this.m_elements.get(i).isTotal()))
			{
				result.add(prettyResult);
				container.add(prettyResult.getCompoundId());
			}
		}
	}
	return result;
};
oFF.RsVizAxis.prototype.getLabels = function(unique, includeTotals, withHierarchy)
{
	var container = oFF.XHashSetOfString.create();
	var result = oFF.XList.create();
	for (var i = 0; i < this.m_elements.size(); i++)
	{
		var prettyResult = this.m_elements.get(i).getLabel(withHierarchy ? this : null, null);
		if (oFF.isNull(prettyResult))
		{
			prettyResult = this.m_elements.get(i).getDefaultLabel(withHierarchy ? this : null);
		}
		if (oFF.notNull(prettyResult))
		{
			if (!unique || !container.contains(prettyResult.getCompoundId()) && (includeTotals || !this.m_elements.get(i).isTotal()))
			{
				container.add(prettyResult.getCompoundId());
				result.add(prettyResult);
			}
		}
	}
	return result;
};
oFF.RsVizAxis.prototype.getPrettyNames = function(unique, includeTotals)
{
	var result = oFF.XListOfString.create();
	for (var i = 0; i < this.m_elements.size(); i++)
	{
		var prettyResult = this.m_elements.get(i).getPrettyText(null);
		if (oFF.XStringUtils.isNullOrEmpty(prettyResult))
		{
			prettyResult = this.m_elements.get(i).getPrettyDefaultText();
		}
		if (oFF.XStringUtils.isNotNullAndNotEmpty(prettyResult))
		{
			if (!unique || !result.contains(prettyResult) && (includeTotals || !this.m_elements.get(i).isTotal()))
			{
				result.add(prettyResult);
			}
		}
	}
	return result;
};
oFF.RsVizAxis.prototype.getFormattedNames = function(unique, includeTotals)
{
	var result = oFF.XListOfString.create();
	for (var i = 0; i < this.m_elements.size(); i++)
	{
		var prettyResult = this.m_elements.get(i).getFormattedText(null);
		if (oFF.XStringUtils.isNullOrEmpty(prettyResult))
		{
			prettyResult = this.m_elements.get(i).getFormattedDefaultText();
		}
		if (oFF.XStringUtils.isNotNullAndNotEmpty(prettyResult))
		{
			if (!unique || !result.contains(prettyResult) && (includeTotals || !this.m_elements.get(i).isTotal()))
			{
				result.add(prettyResult);
			}
		}
	}
	return result;
};
oFF.RsVizAxis.prototype.getExtendedPrettyNames = function(unique, includeTotals)
{
	return this.getExtendedPrettyNamesForFeed(unique, includeTotals, null, null);
};
oFF.RsVizAxis.prototype.toString = function()
{
	return oFF.XStringUtils.concatenate3(this.m_elements.toString(), ":::", this.m_availableFeedTypes.toString());
};
oFF.RsVizAxis.prototype.getTuplesCount = function()
{
	return this.m_elements.size();
};
oFF.RsVizAxis.prototype.getTupleAt = function(i)
{
	return i > -1 && i < this.m_elements.size() ? this.m_elements.get(i) : null;
};
oFF.RsVizAxis.prototype.getFormattedDateList = function()
{
	var result = oFF.XListOfString.create();
	var i = 0;
	var dateFound = false;
	for (i = 0; i < this.m_elements.size(); i++)
	{
		var curDate = this.m_elements.get(i).getFormattedDate();
		if (oFF.notNull(curDate))
		{
			dateFound = true;
		}
		result.add(curDate);
	}
	if (dateFound)
	{
		return result;
	}
	return null;
};
oFF.RsVizAxis.prototype.getDateList = function()
{
	var i = 0;
	var fallbackLevel = 0;
	var dateFound = false;
	for (; fallbackLevel < 4; fallbackLevel++)
	{
		var result = oFF.XList.create();
		for (i = 0; i < this.m_elements.size(); i++)
		{
			var curDate = this.m_elements.get(i).getDate(fallbackLevel);
			if (oFF.notNull(curDate))
			{
				dateFound = true;
			}
			result.add(curDate);
		}
		if (dateFound)
		{
			return result;
		}
	}
	return null;
};
oFF.RsVizAxis.prototype.getDimensionsForFeed = function(feed)
{
	var list = oFF.XListOfString.create();
	list.add(feed);
	return this.getDimensionsForFeeds(list);
};
oFF.RsVizAxis.prototype.getDimensionsForFeeds = function(feeds)
{
	var result = oFF.XListOfString.create();
	for (var i = 0; i < this.m_elements.size(); i++)
	{
		var subDimensions = this.m_elements.get(i).getDimensionTextsForFeeds(feeds);
		for (var j = 0; j < subDimensions.size(); j++)
		{
			if (!result.contains(subDimensions.get(j)))
			{
				result.add(subDimensions.get(j));
			}
		}
	}
	return result;
};
oFF.RsVizAxis.prototype.getFeedDimensionTuple = function(selectorList)
{
	for (var i = 0; i < this.m_elements.size(); i++)
	{
		var dimensionNames = this.m_elements.get(i).getDimensionNamesForFeeds(selectorList);
		var resultBuffer = oFF.XStringBuffer.create();
		for (var j = 0; j < dimensionNames.size(); j++)
		{
			resultBuffer.append(dimensionNames.get(j));
			resultBuffer.append("/");
		}
		var resultString = resultBuffer.toString();
		if (oFF.XStringUtils.isNotNullAndNotEmpty(resultString))
		{
			return oFF.XString.substring(resultString, 0, oFF.XString.size(resultString) - 1);
		}
	}
	return "";
};

oFF.RsVizAxisExtractor = {

	getTuplesFromRowAxis:function(rs, feedMembers, customFormatting)
	{
			return oFF.RsVizAxisExtractor.getTuplesFromAxis(rs, rs.getCursorRowsAxis(), true, feedMembers, customFormatting);
	},
	getTuplesFromColumnAxis:function(rs, feedMembers, customFormatting)
	{
			return oFF.RsVizAxisExtractor.getTuplesFromAxis(rs, rs.getCursorColumnsAxis(), false, feedMembers, customFormatting);
	},
	getTuplesFromAxis:function(rs, cursorAxis, isRow, feedMembers, customFormatting)
	{
			var result = oFF.RsVizAxis.create();
		var dimensionForMeasures = rs.getQueryModel().getAccountDimension();
		if (oFF.isNull(dimensionForMeasures))
		{
			dimensionForMeasures = rs.getQueryModel().getMeasureDimension();
		}
		cursorAxis.setTupleCursorBeforeStart();
		var i = 0;
		while (cursorAxis.hasNextTuple())
		{
			cursorAxis.nextTuple();
			var cellPrototype = null;
			if (isRow)
			{
				cellPrototype = rs.getDataCell(0, i);
			}
			else
			{
				cellPrototype = rs.getDataCell(i, 0);
			}
			var decimalPlaces = cellPrototype.getDecimalPlaces();
			var scalingFactor = cellPrototype.getScalingFactor();
			var showSignAs = cellPrototype.getFormatString();
			var defaultFormatting = oFF.RsVizNumberFormattingInfo.createNumberFormat(scalingFactor, decimalPlaces, decimalPlaces, showSignAs, scalingFactor === 0);
			var feedTuple = oFF.RsVizFeedTuple.createTuple();
			feedTuple.setNumberFormattingInfo(defaultFormatting);
			while (cursorAxis.hasNextTupleElement())
			{
				var memberType = cursorAxis.nextTupleElement().getDimensionMemberType();
				var subFeedTypes = oFF.RsVizAxisExtractor.getAxisMemberFeedTypes(cursorAxis, feedMembers);
				feedTuple.addElement(oFF.RsVizAxisExtractor.createTupleElement(cursorAxis, dimensionForMeasures, subFeedTypes, customFormatting, feedTuple, memberType));
			}
			result.addElement(feedTuple);
			i++;
		}
		return result;
	},
	createTupleElement:function(cursorAxis, dimensionForMeasures, subFeedTypes, memberFormatMap, feedTuple, memberType)
	{
			cursorAxis.setFieldValueCursorBeforeStart();
		var text = "";
		var key = "";
		var dimensionmember = null;
		var displayLevel = 0;
		var parentIndex = -1;
		var drillState = oFF.DrillState.LEAF;
		var formattedValueList = oFF.XListOfString.create();
		var valueList = oFF.XList.create();
		var valueTypeList = oFF.XList.create();
		var presentationTypeList = oFF.XList.create();
		var textValidity = 0;
		var keyValidity = 0;
		while (cursorAxis.hasNextFieldValue())
		{
			cursorAxis.nextFieldValue();
			var pt = cursorAxis.getField().getPresentationType();
			var formattedValue = cursorAxis.getFormattedValue();
			formattedValueList.add(formattedValue);
			presentationTypeList.add(pt);
			var cvt = cursorAxis.getValueType();
			if (cursorAxis.getValue() !== null)
			{
				valueList.add(cursorAxis.getValue().clone());
			}
			valueTypeList.add(cvt);
			if (pt.isTypeOf(oFF.PresentationType.SHORT_TEXT) || pt.isTypeOf(oFF.PresentationType.LONG_TEXT) || pt.isTypeOf(oFF.PresentationType.MEDIUM_TEXT))
			{
				if (textValidity < 5 && oFF.XStringUtils.isNotNullAndNotEmpty(formattedValue))
				{
					text = formattedValue;
					textValidity = 5;
				}
			}
			else if (pt.isTypeOf(oFF.PresentationType.HIERARCHY_TEXT) && textValidity < 4 && oFF.XStringUtils.isNotNullAndNotEmpty(formattedValue))
			{
				text = formattedValue;
				textValidity = 4;
			}
			else if (pt.isTypeOf(oFF.PresentationType.HIERARCHY_DISPLAY_KEY) && textValidity < 3 && oFF.XStringUtils.isNotNullAndNotEmpty(formattedValue))
			{
				text = formattedValue;
				textValidity = 3;
			}
			else if (pt.isTypeOf(oFF.PresentationType.DISPLAY_KEY) && textValidity < 2 && oFF.XStringUtils.isNotNullAndNotEmpty(formattedValue))
			{
				text = formattedValue;
				textValidity = 2;
			}
			else if (textValidity <= 1 && oFF.PresentationType.isTextPresentation(pt) && oFF.XStringUtils.isNotNullAndNotEmpty(formattedValue))
			{
				text = formattedValue;
				textValidity = 1;
			}
			if (keyValidity <= 4 && pt.isTypeOf(oFF.PresentationType.HIERARCHY_KEY) && !pt.isTypeOf(oFF.PresentationType.HIERARCHY_DISPLAY_KEY) && oFF.XStringUtils.isNotNullAndNotEmpty(formattedValue))
			{
				key = formattedValue;
				keyValidity = 4;
			}
			else if (keyValidity <= 3 && pt.isTypeOf(oFF.PresentationType.HIERARCHY_KEY) && oFF.XStringUtils.isNotNullAndNotEmpty(formattedValue))
			{
				key = formattedValue;
				keyValidity = 3;
			}
			else if (keyValidity <= 2 && pt.isTypeOf(oFF.PresentationType.KEY) && !pt.isTypeOf(oFF.PresentationType.DISPLAY_KEY) && oFF.XStringUtils.isNotNullAndNotEmpty(formattedValue))
			{
				key = formattedValue;
				keyValidity = 2;
			}
			else if (keyValidity <= 1 && oFF.PresentationType.isKeyPresentation(pt) && oFF.XStringUtils.isNotNullAndNotEmpty(formattedValue))
			{
				key = formattedValue;
				keyValidity = 1;
			}
		}
		if (dimensionForMeasures.containsStructureMember(key) && oFF.XStringUtils.isNotNullAndNotEmpty(dimensionForMeasures.getStructureMember(key).getText()))
		{
			text = dimensionForMeasures.getStructureMember(key).getText();
		}
		if (!cursorAxis.getRsDimensionAtCurrentPosition().isMeasureStructure())
		{
			dimensionmember = cursorAxis.getField().getDimension().getDimensionMember(cursorAxis.getDimensionMemberName());
			displayLevel = cursorAxis.getDisplayLevel();
			parentIndex = cursorAxis.getParentNodeIndex();
			drillState = cursorAxis.getDrillState();
			if (oFF.XStringUtils.isNullOrEmpty(text))
			{
				text = dimensionmember.getText();
				key = dimensionmember.getName();
			}
		}
		var formatelement = null;
		var showSignAs = "()";
		var decimalPlaces = -1;
		var color = null;
		var pattern = null;
		if (oFF.notNull(memberFormatMap))
		{
			var vi;
			var formatMap = memberFormatMap.getStructureByKey(oFF.VizDefConstants.K_NUMBER_FORMATTING);
			if (oFF.notNull(formatMap))
			{
				formatelement = formatMap.getByKey(key);
				for (vi = 0; oFF.isNull(formatelement) && vi < valueList.size(); vi++)
				{
					formatelement = formatMap.getByKey(valueList.get(vi).getStringRepresentation());
				}
			}
			formatMap = memberFormatMap.getStructureByKey(oFF.VizDefConstants.K_SHOW_SIGN_AS);
			if (oFF.notNull(formatMap))
			{
				showSignAs = formatMap.getStringByKey(key);
				for (vi = 0; oFF.isNull(formatelement) && vi < valueList.size(); vi++)
				{
					showSignAs = formatMap.getStringByKey(valueList.get(vi).getStringRepresentation());
				}
			}
			formatMap = memberFormatMap.getStructureByKey(oFF.VizDefConstants.K_DECIMAL_PLACES);
			if (oFF.notNull(formatMap))
			{
				decimalPlaces = formatMap.getIntegerByKey(key);
				for (vi = 0; oFF.isNull(formatelement) && vi < valueList.size(); vi++)
				{
					decimalPlaces = formatMap.getIntegerByKey(valueList.get(vi).getStringRepresentation());
				}
			}
			formatMap = memberFormatMap.getStructureByKey(oFF.VizDefConstants.K_PATTERN_FORMATTING);
			if (oFF.notNull(formatMap))
			{
				pattern = formatMap.getStringByKey(key);
				for (vi = 0; oFF.isNull(pattern) && vi < valueList.size(); vi++)
				{
					pattern = formatMap.getStringByKey(valueList.get(vi).getStringRepresentation());
				}
			}
			formatMap = memberFormatMap.getStructureByKey(oFF.VizDefConstants.K_COLOR_FORMATTING);
			if (oFF.notNull(formatMap))
			{
				color = formatMap.getStringByKey(key);
				for (vi = 0; oFF.isNull(color) && vi < valueList.size(); vi++)
				{
					color = formatMap.getStringByKey(valueList.get(vi).getStringRepresentation());
				}
			}
		}
		feedTuple.setColor(color);
		feedTuple.setPattern(pattern);
		if (oFF.notNull(formatelement))
		{
			var numericShift = 0;
			var numericScale = 2;
			var numericScaleMin = 0;
			if (formatelement.isStructure())
			{
				var formatStructure = formatelement.asStructure();
				var options = formatStructure.getStructureByKey(oFF.VizDefConstants.K_OPTIONS);
				var multiplier = formatStructure.getStructureByKey(oFF.VizDefConstants.K_SCALE).getStringByKey(oFF.VizDefConstants.K_MULTIPLIER);
				if (oFF.XString.startsWith(multiplier, "1E"))
				{
					numericShift = oFF.XInteger.convertFromString(oFF.XString.substring(multiplier, 2, oFF.XString.size(multiplier)));
				}
				if (options.containsKey(oFF.VizDefConstants.K_MINIMUM_FRACTION_DIGITS))
				{
					numericScaleMin = options.getIntegerByKey(oFF.VizDefConstants.K_MINIMUM_FRACTION_DIGITS);
				}
				if (options.containsKey(oFF.VizDefConstants.K_MAXIMUM_FRACTION_DIGITS))
				{
					numericScale = options.getIntegerByKey(oFF.VizDefConstants.K_MAXIMUM_FRACTION_DIGITS) - numericScaleMin;
				}
			}
			else if (formatelement.isInteger())
			{
				numericShift = formatelement.asInteger().getInteger();
			}
			if (decimalPlaces > -1)
			{
				numericScale = decimalPlaces;
				numericScaleMin = decimalPlaces;
			}
			var overriddenInfo = oFF.RsVizNumberFormattingInfo.createNumberFormat(numericShift, numericScaleMin, numericScale, showSignAs, false);
			feedTuple.setNumberFormattingInfo(overriddenInfo);
		}
		if (oFF.XStringUtils.isNullOrEmpty(text))
		{
			text = key;
		}
		return oFF.RsVizTupleElement.createTupleElement(dimensionmember, displayLevel, parentIndex, drillState, key, text, subFeedTypes, formattedValueList, valueList, valueTypeList, presentationTypeList, memberType);
	},
	getAxisMemberFeedTypes:function(cursorAxis, feedTypes)
	{
			var result = oFF.XLinkedHashMapByString.create();
		cursorAxis.setFieldValueCursorBeforeStart();
		var keys = feedTypes.getKeysAsReadOnlyListOfString();
		while (cursorAxis.hasNextFieldValue())
		{
			cursorAxis.nextFieldValue();
			var fieldValueV = cursorAxis.getFieldValue();
			var dimName = fieldValueV.getField().getDimension().getName();
			var memberName = cursorAxis.getDimensionMemberName();
			var memberAlias = "";
			if (oFF.XStringUtils.isNotNullAndNotEmpty(memberName))
			{
				var structureMember = cursorAxis.getField().getDimension().getStructureMember(memberName);
				if (oFF.notNull(structureMember))
				{
					memberAlias = structureMember.getAliasName();
				}
			}
			for (var i = 0; i < keys.size(); i++)
			{
				var feedType = keys.get(i);
				var feedMembers = feedTypes.getListByKey(feedType);
				for (var j = 0; j < feedMembers.size(); j++)
				{
					var currentFeedName = feedMembers.getStringAt(j);
					if (oFF.XString.isEqual(memberAlias, currentFeedName) || oFF.XString.isEqual(memberName, currentFeedName) || oFF.XString.isEqual(fieldValueV.toString(), currentFeedName) || oFF.XString.isEqual(fieldValueV.getFormattedValue(), currentFeedName) || oFF.XString.isEqual(dimName, currentFeedName))
					{
						if (!result.containsKey(feedType))
						{
							result.put(feedType, oFF.XIntegerValue.create(j));
						}
						break;
					}
				}
			}
		}
		cursorAxis.setFieldValueCursorBeforeStart();
		return result;
	},
	getFormattedValue:function(dataCell, numberFormattingInfo, numberFormattingInfoDefault)
	{
			var currentNumberFormattingInfo = numberFormattingInfo;
		if (oFF.isNull(currentNumberFormattingInfo) || currentNumberFormattingInfo.isUseFormattingFromDataCell())
		{
			if (dataCell.getScalingFactor() === 0 && oFF.notNull(numberFormattingInfoDefault) && !numberFormattingInfoDefault.isUseFormattingFromDataCell())
			{
				currentNumberFormattingInfo = numberFormattingInfoDefault;
			}
		}
		if (oFF.notNull(currentNumberFormattingInfo) && !currentNumberFormattingInfo.isUseFormattingFromDataCell())
		{
			if (!dataCell.getValueException().isValidValue() && dataCell.getValueException() !== oFF.ValueException.MIXED_CURRENCIES_OR_UNITS)
			{
				return "";
			}
			var prefix = currentNumberFormattingInfo.isShowPlusSign() ? "+" : "";
			var numericShift = currentNumberFormattingInfo.getNumericShift();
			var numericScaleMin = currentNumberFormattingInfo.getMinDecimalPlaces();
			var numericScale = currentNumberFormattingInfo.getMaxDecimalPlaces() - numericScaleMin;
			try
			{
				var baseValue = dataCell.getDouble() * oFF.XMath.pow(10, numericShift);
				var formatString = "#";
				formatString = "#,#";
				if (numericScale > 0 || numericScaleMin > 0)
				{
					formatString = "#,#.";
					var i;
					for (i = 0; i < numericScaleMin; i++)
					{
						formatString = oFF.XStringUtils.concatenate2(formatString, "0");
					}
					for (i = 0; i < numericScale; i++)
					{
						formatString = oFF.XStringUtils.concatenate2(formatString, "#");
					}
				}
				return oFF.XStringUtils.concatenate2(prefix, oFF.XNumberFormatter.formatDoubleToString(baseValue, formatString));
			}
			catch (t)
			{
				return dataCell.getFormattedValue();
			}
		}
		else
		{
			var formattedValue = dataCell.getFormattedValue();
			if (oFF.XStringUtils.isNullOrEmpty(formattedValue) && dataCell.getValueException() === oFF.ValueException.NORMAL)
			{
				formattedValue = oFF.XDouble.convertToString(dataCell.getDouble());
			}
			return formattedValue;
		}
	},
	getScaledValue:function(dataCell, numberFormattingInfo, numberFormattingInfoDefault)
	{
			var currentNumberFormattingInfo = numberFormattingInfo;
		if (oFF.isNull(currentNumberFormattingInfo) || currentNumberFormattingInfo.isUseFormattingFromDataCell())
		{
			if (dataCell.getScalingFactor() === 0 && oFF.notNull(numberFormattingInfoDefault) && !numberFormattingInfoDefault.isUseFormattingFromDataCell())
			{
				currentNumberFormattingInfo = numberFormattingInfoDefault;
			}
		}
		var numericShift;
		if (oFF.notNull(currentNumberFormattingInfo) && !currentNumberFormattingInfo.isUseFormattingFromDataCell())
		{
			numericShift = currentNumberFormattingInfo.getNumericShift();
		}
		else
		{
			numericShift = dataCell.getScalingFactor();
		}
		if (!dataCell.getValueException().isValidValue() && dataCell.getValueException() !== oFF.ValueException.MIXED_CURRENCIES_OR_UNITS)
		{
			return 0;
		}
		try
		{
			return dataCell.getDouble() * oFF.XMath.pow(10, numericShift);
		}
		catch (t)
		{
			return 0;
		}
	},
	guessFeedMembers:function(rs, chartType, isCombinationChart)
	{
			var isColumn = oFF.XString.isEqual(chartType, oFF.VizDefConstants.V_CHART_TYPE_COLUMN);
		var isBellcurve = oFF.XString.isEqual(chartType, oFF.VizDefConstants.V_CHART_TYPE_BELLCURVE);
		var isLine = oFF.XString.isEqual(chartType, oFF.VizDefConstants.K_LINE);
		var isBar = oFF.XString.isEqual(chartType, oFF.VizDefConstants.V_CHART_TYPE_BAR);
		var isSpline = oFF.XString.isEqual(chartType, oFF.VizDefConstants.K_SPLINE);
		var isArea = oFF.XString.isEqual(chartType, oFF.VizDefConstants.K_AREA);
		var isPie = oFF.XString.isEqual(chartType, oFF.VizDefConstants.K_PIE);
		var isWordcloud = oFF.XString.isEqual(chartType, oFF.VizDefConstants.K_WORDCLOUD);
		var isVariablepie = oFF.XString.isEqual(chartType, oFF.VizDefConstants.K_VARIPIE);
		var isVariwide = oFF.XString.isEqual(chartType, oFF.VizDefConstants.K_VARIWIDE);
		var isScatter = oFF.XString.isEqual(chartType, oFF.VizDefConstants.K_SCATTER);
		var isBubble = oFF.XString.isEqual(chartType, oFF.VizDefConstants.V_CHART_TYPE_BUBBLE);
		var isPackedBubble = oFF.XString.isEqual(chartType, oFF.VizDefConstants.K_PACKED_BUBBLE);
		var isHeatMap = oFF.XString.isEqual(chartType, oFF.VizDefConstants.K_HEATMAP);
		var isTreeMap = oFF.XString.isEqual(chartType, oFF.VizDefConstants.K_TREEMAP);
		var isBoxPlot = oFF.XString.isEqual(chartType, oFF.VizDefConstants.V_CHART_TYPE_BOXPLOT);
		var isMetric = oFF.XString.isEqual(chartType, oFF.VizDefConstants.K_SOLID_GAUGE);
		var feedMembersMap = oFF.PrFactory.createStructure();
		var rowAxis = rs.getCursorRowsAxis();
		var colAxis = rs.getCursorColumnsAxis();
		var categoryList = feedMembersMap.putNewList(oFF.VizDefConstants.K_CATEGORY_AXIS);
		var categoryList2 = feedMembersMap.putNewList(oFF.VizDefConstants.K_CATEGORY_AXIS2);
		var valueList = feedMembersMap.putNewList(oFF.VizDefConstants.K_VALUE_AXIS);
		var valueList2 = feedMembersMap.putNewList(oFF.VizDefConstants.K_VALUE_AXIS2);
		var bubbleList = feedMembersMap.putNewList(oFF.VizDefConstants.K_BUBBLE_WIDTH);
		var weightList = feedMembersMap.putNewList(oFF.VizDefConstants.K_WEIGHT);
		var sizeList = feedMembersMap.putNewList(oFF.VizDefConstants.K_SIZE);
		var timeList = feedMembersMap.putNewList(oFF.VizDefConstants.K_TIME_AXIS);
		var colorList = feedMembersMap.putNewList(oFF.VizDefConstants.K_COLOR);
		var colDimStack = oFF.RsVizAxisExtractor.getDimensionStack(colAxis);
		var rowDimStack = oFF.RsVizAxisExtractor.getDimensionStack(rowAxis);
		var measureStack = oFF.RsVizAxisExtractor.getMemberStack(colAxis, colDimStack.size());
		if (rowDimStack.size() > 0)
		{
			timeList.addString(rowDimStack.get(rowDimStack.size() - 1));
			colorList.addString(rowDimStack.get(rowDimStack.size() - 1));
			categoryList.addString(rowDimStack.get(rowDimStack.size() - 1));
		}
		if (colDimStack.size() > 1)
		{
			if (isHeatMap)
			{
				categoryList2.addString(colDimStack.get(colDimStack.size() - 2));
			}
			else
			{
				colorList.addString(colDimStack.get(colDimStack.size() - 2));
			}
		}
		if (isLine || isBar || isSpline || isBellcurve || isColumn || isArea || isCombinationChart || isMetric || isBoxPlot)
		{
			var size = measureStack.size();
			if (isCombinationChart && measureStack.size() > 1)
			{
				size--;
				valueList2.addString(measureStack.get(measureStack.size() - 1));
			}
			for (var i = 0; i < size; i++)
			{
				valueList.addString(measureStack.get(i));
			}
		}
		else if (isPie || isVariablepie || isWordcloud || isBubble || isScatter || isTreeMap || isVariwide || isPackedBubble)
		{
			if (measureStack.size() > 0)
			{
				weightList.addString(measureStack.get(0));
				valueList.addString(measureStack.get(0));
				sizeList.addString(measureStack.get(measureStack.size() - 1));
			}
			if (measureStack.size() > 1)
			{
				valueList2.addString(measureStack.get(1));
			}
			if (measureStack.size() > 2)
			{
				bubbleList.addString(measureStack.get(2));
			}
		}
		else if (isHeatMap)
		{
			if (measureStack.size() > 0)
			{
				colorList.addString(measureStack.get(0));
			}
		}
		return feedMembersMap;
	},
	getDimensionStack:function(axis)
	{
			var resultList = oFF.XListOfString.create();
		axis.setFieldValueCursorBeforeStart();
		axis.setTupleElementCursorBeforeStart();
		axis.setTupleCursorBeforeStart();
		if (axis.hasNextTuple())
		{
			axis.nextTuple();
			while (axis.hasNextTupleElement())
			{
				axis.nextTupleElement();
				if (axis.hasNextFieldValue())
				{
					axis.nextFieldValue();
				}
				resultList.add(axis.getRsDimensionAtCurrentPosition().getName());
				if (axis.getRsDimensionAtCurrentPosition().getDimensionType() === oFF.DimensionType.ACCOUNT)
				{
					break;
				}
			}
		}
		axis.setFieldValueCursorBeforeStart();
		axis.setTupleElementCursorBeforeStart();
		axis.setTupleCursorBeforeStart();
		return resultList;
	},
	getMemberStack:function(axis, position)
	{
			var resultList = oFF.XListOfString.create();
		axis.setFieldValueCursorBeforeStart();
		axis.setTupleElementCursorBeforeStart();
		axis.setTupleCursorBeforeStart();
		while (axis.hasNextTuple())
		{
			axis.nextTuple();
			axis.setTupleElementCursorBeforeStart();
			var tupleIndex = 0;
			while (axis.hasNextTupleElement() && tupleIndex++ < position)
			{
				axis.nextTupleElement();
			}
			if (axis.hasNextFieldValue())
			{
				axis.nextFieldValue();
			}
			resultList.add(axis.getDimensionMemberName());
		}
		axis.setFieldValueCursorBeforeStart();
		axis.setTupleElementCursorBeforeStart();
		axis.setTupleCursorBeforeStart();
		return resultList;
	},
	getMemberStackFromVisualizationDefinition:function(visualizationDefinition, vvt)
	{
			var resultList = oFF.XListOfString.create();
		var visualizationValueTypes = visualizationDefinition.getChartSetting().getTypedValueSelectionsForType(vvt);
		for (var i = 0; i < visualizationValueTypes.size(); i++)
		{
			resultList.add(visualizationValueTypes.get(i).getDimensionMember().getName());
		}
		return resultList;
	},
	extractCustomFormatting:function(vizDef, globalDef)
	{
			if (oFF.isNull(vizDef))
		{
			return null;
		}
		var customFormatting = vizDef.getStructureByKey(oFF.VizDefConstants.K_CUSTOM_FORMATTING);
		var placeholders2Id = vizDef.getStructureByKey(oFF.VizDefConstants.K_PLACEHOLDER_2_ID);
		var measureSync = oFF.isNull(globalDef) ? null : globalDef.getListByKey(oFF.VizDefConstants.K_MEASURE_SYNC);
		if (oFF.isNull(customFormatting))
		{
			customFormatting = vizDef.putNewStructure(oFF.VizDefConstants.K_CUSTOM_FORMATTING);
		}
		var patternFormatting = customFormatting.getStructureByKey(oFF.VizDefConstants.K_PATTERN_FORMATTING);
		if (oFF.isNull(patternFormatting))
		{
			patternFormatting = customFormatting.putNewStructure(oFF.VizDefConstants.K_PATTERN_FORMATTING);
		}
		var colorFormatting = customFormatting.getStructureByKey(oFF.VizDefConstants.K_COLOR_FORMATTING);
		if (oFF.isNull(colorFormatting))
		{
			colorFormatting = customFormatting.putNewStructure(oFF.VizDefConstants.K_COLOR_FORMATTING);
		}
		var upIds = oFF.XHashSetOfString.create();
		if (!vizDef.getStructureByKey(oFF.VizDefConstants.K_CHART).getBooleanByKeyExt(oFF.VizDefConstants.K_IS_EXCLUDE_COLOR_SYNC, false))
		{
			if (oFF.notNull(measureSync))
			{
				for (var h = 0; h < measureSync.size(); h++)
				{
					var ms = measureSync.getStructureAt(h);
					var idStruct = ms.getStructureByKey(oFF.VizDefConstants.K_ID);
					var idName = idStruct.getStringByKey(oFF.VizDefConstants.K_ID);
					if (!colorFormatting.containsKey(idName))
					{
						colorFormatting.putStringNotNullAndNotEmpty(idName, ms.getStringByKey(oFF.VizDefConstants.K_COLOR));
					}
					if (!patternFormatting.containsKey(idName))
					{
						patternFormatting.putStringNotNullAndNotEmpty(idName, ms.getStringByKey(oFF.VizDefConstants.K_PATTERN));
					}
				}
			}
		}
		else
		{
			var feedMembers = vizDef.getStructureByKey(oFF.VizDefConstants.K_FEED_MEMBERS);
			var feedKeys = feedMembers.getKeysAsReadOnlyListOfString();
			for (var fi = 0; fi < feedKeys.size(); fi++)
			{
				var curFeedKey = feedKeys.get(fi);
				if (!oFF.XString.containsString(curFeedKey, oFF.VizDefConstants.K_ERRORBAR_INFIX))
				{
					var deleteValue = feedMembers.getListByKey(curFeedKey);
					for (var dvi = 0; dvi < deleteValue.size(); dvi++)
					{
						colorFormatting.remove(deleteValue.getStringAt(dvi));
					}
				}
			}
			patternFormatting.clear();
			var userPrefrence = vizDef.getStructureByKey(oFF.VizDefConstants.K_USER_PREFERENCES);
			if (oFF.notNull(userPrefrence))
			{
				var measuresStructure = userPrefrence.getStructureByKey(oFF.VizDefConstants.K_MEASURE);
				if (oFF.notNull(measuresStructure))
				{
					var measureColors = measuresStructure.getListByKey(oFF.VizDefConstants.K_COLORS);
					if (oFF.notNull(measureColors))
					{
						for (var g = 0; g < measureColors.size(); g++)
						{
							var msUp = measureColors.getStructureAt(g);
							var idStructUp = msUp.getStructureByKey(oFF.VizDefConstants.K_ID);
							var idNameUp = idStructUp.getStringByKey(oFF.VizDefConstants.K_ID);
							colorFormatting.putStringNotNullAndNotEmpty(idNameUp, msUp.getStringByKey(oFF.VizDefConstants.K_COLOR));
							patternFormatting.putStringNotNullAndNotEmpty(idNameUp, msUp.getStringByKey(oFF.VizDefConstants.K_PATTERN));
							upIds.add(idNameUp);
						}
					}
				}
			}
		}
		if (oFF.notNull(placeholders2Id))
		{
			var placeholders = placeholders2Id.getKeysAsReadOnlyListOfString();
			for (var i = 0; i < placeholders.size(); i++)
			{
				var placeholder = placeholders.get(i);
				var mappedId = placeholders2Id.getStringByKey(placeholder);
				if (colorFormatting.containsKey(placeholder) && (!colorFormatting.containsKey(mappedId) || upIds.contains(placeholder)))
				{
					colorFormatting.putString(mappedId, colorFormatting.getStringByKey(placeholder));
				}
				if (patternFormatting.containsKey(placeholder) && !patternFormatting.containsKey(mappedId))
				{
					patternFormatting.putString(mappedId, patternFormatting.getStringByKey(placeholder));
				}
				if (colorFormatting.containsKey(mappedId) && (!colorFormatting.containsKey(placeholder) || upIds.contains(mappedId)))
				{
					colorFormatting.putString(placeholder, colorFormatting.getStringByKey(mappedId));
				}
				if (patternFormatting.containsKey(mappedId) && !patternFormatting.containsKey(placeholder))
				{
					patternFormatting.putString(placeholder, patternFormatting.getStringByKey(mappedId));
				}
			}
		}
		return customFormatting;
	},
	getFeedMembersFromVisualizationDefinition:function(rs, visualizationDefinition)
	{
			var feedMembersMap = oFF.PrFactory.createStructure();
		var chartSetting = visualizationDefinition.getChartSetting();
		var chartType = chartSetting.getChartType();
		var secondaryChartType = chartSetting.getChartType2();
		var categoryList = feedMembersMap.putNewList(oFF.VizDefConstants.K_CATEGORY_AXIS);
		var categoryList2 = feedMembersMap.putNewList(oFF.VizDefConstants.K_CATEGORY_AXIS2);
		var valueList = feedMembersMap.putNewList(oFF.VizDefConstants.K_VALUE_AXIS);
		var valueList2 = feedMembersMap.putNewList(oFF.VizDefConstants.K_VALUE_AXIS2);
		var valueListVariance = feedMembersMap.putNewList(oFF.VizDefConstants.K_VARIANCE);
		var bubbleList = feedMembersMap.putNewList(oFF.VizDefConstants.K_BUBBLE_WIDTH);
		var weightList = feedMembersMap.putNewList(oFF.VizDefConstants.K_WEIGHT);
		var sizeList = feedMembersMap.putNewList(oFF.VizDefConstants.K_SIZE);
		var timeList = feedMembersMap.putNewList(oFF.VizDefConstants.K_TIME_AXIS);
		var colorList = feedMembersMap.putNewList(oFF.VizDefConstants.K_COLOR);
		var cursorColumnAxis = rs.getCursorColumnsAxis();
		var cursorRowAxis = rs.getCursorRowsAxis();
		var colDimStack;
		var rowDimStack;
		if (oFF.XStream.of(cursorColumnAxis.getRsDimensions()).anyMatch( function(defDim){
			return oFF.XString.isEqual(defDim.getName(), visualizationDefinition.getKeyFigureDimension().getName());
		}.bind(this)))
		{
			colDimStack = oFF.RsVizAxisExtractor.getDimensionStack(cursorColumnAxis);
			rowDimStack = oFF.RsVizAxisExtractor.getDimensionStack(cursorRowAxis);
		}
		else
		{
			rowDimStack = oFF.RsVizAxisExtractor.getDimensionStack(cursorColumnAxis);
			colDimStack = oFF.RsVizAxisExtractor.getDimensionStack(cursorRowAxis);
		}
		colDimStack.removeElement(visualizationDefinition.getKeyFigureDimension().getName());
		if (chartType === oFF.ChartType.LINE || chartType === oFF.ChartType.BAR_COLUMN || chartType === oFF.ChartType.AREA)
		{
			categoryList.addAllStrings(rowDimStack);
			colorList.addAllStrings(colDimStack);
			valueList.addAllStrings(oFF.RsVizAxisExtractor.getMemberStackFromVisualizationDefinition(visualizationDefinition, oFF.VisualizationValueType.VALUE));
			if (secondaryChartType !== oFF.ChartType.NONE)
			{
				valueList2.addAllStrings(oFF.RsVizAxisExtractor.getMemberStackFromVisualizationDefinition(visualizationDefinition, oFF.VisualizationValueType.VALUE_B));
			}
			valueListVariance.addAllStrings(oFF.RsVizAxisExtractor.getMemberStackFromVisualizationDefinition(visualizationDefinition, oFF.VisualizationValueType.VALUE_VARIANCE));
		}
		else if (chartType === oFF.ChartType.RADAR)
		{
			categoryList.addAllStrings(rowDimStack);
			colorList.addAllStrings(colDimStack);
			valueList.addAllStrings(oFF.RsVizAxisExtractor.getMemberStackFromVisualizationDefinition(visualizationDefinition, oFF.VisualizationValueType.VALUE));
		}
		else if (chartType === oFF.ChartType.BOX_PLOT)
		{
			categoryList.addAllStrings(rowDimStack);
			colorList.addAllStrings(colDimStack);
			valueList.addAllStrings(oFF.RsVizAxisExtractor.getMemberStackFromVisualizationDefinition(visualizationDefinition, oFF.VisualizationValueType.VALUE));
		}
		else if (chartType === oFF.ChartType.TIME_SERIES)
		{
			timeList.addAllStrings(rowDimStack);
			colorList.addAllStrings(colDimStack);
			valueList.addAllStrings(oFF.RsVizAxisExtractor.getMemberStackFromVisualizationDefinition(visualizationDefinition, oFF.VisualizationValueType.VALUE));
		}
		else if (chartType === oFF.ChartType.HEAT_MAP)
		{
			categoryList.addAllStrings(rowDimStack);
			categoryList2.addAllStrings(colDimStack);
			colorList.addAllStrings(oFF.RsVizAxisExtractor.getMemberStackFromVisualizationDefinition(visualizationDefinition, oFF.VisualizationValueType.COLOR));
		}
		else if (chartType === oFF.ChartType.PACKED_BUBBLE || chartType === oFF.ChartType.BUBBLE || chartType === oFF.ChartType.SCATTER_PLOT || chartType === oFF.ChartType.VARI_WIDE)
		{
			colorList.addAllStrings(colDimStack);
			valueList.addAllStrings(oFF.RsVizAxisExtractor.getMemberStackFromVisualizationDefinition(visualizationDefinition, oFF.VisualizationValueType.VALUE));
			valueList2.addAllStrings(oFF.RsVizAxisExtractor.getMemberStackFromVisualizationDefinition(visualizationDefinition, oFF.VisualizationValueType.VALUE_B));
			if (chartType === oFF.ChartType.BUBBLE || chartType === oFF.ChartType.PACKED_BUBBLE)
			{
				bubbleList.addAllStrings(oFF.RsVizAxisExtractor.getMemberStackFromVisualizationDefinition(visualizationDefinition, oFF.VisualizationValueType.SIZE));
			}
		}
		else if (chartType === oFF.ChartType.METRIC)
		{
			valueList.addAllStrings(oFF.RsVizAxisExtractor.getMemberStackFromVisualizationDefinition(visualizationDefinition, oFF.VisualizationValueType.VALUE));
			valueList2.addAllStrings(oFF.RsVizAxisExtractor.getMemberStackFromVisualizationDefinition(visualizationDefinition, oFF.VisualizationValueType.VALUE_B));
			valueListVariance.addAllStrings(oFF.RsVizAxisExtractor.getMemberStackFromVisualizationDefinition(visualizationDefinition, oFF.VisualizationValueType.VALUE_VARIANCE));
		}
		else if (chartType === oFF.ChartType.PIE || chartType === oFF.ChartType.DOUGHNUT)
		{
			categoryList.addAllStrings(rowDimStack);
			sizeList.addAllStrings(oFF.RsVizAxisExtractor.getMemberStackFromVisualizationDefinition(visualizationDefinition, oFF.VisualizationValueType.SIZE));
		}
		else if (chartType === oFF.ChartType.TREE_MAP)
		{
			categoryList.addAllStrings(rowDimStack);
			colorList.addAllStrings(oFF.RsVizAxisExtractor.getMemberStackFromVisualizationDefinition(visualizationDefinition, oFF.VisualizationValueType.COLOR));
			weightList.addAllStrings(oFF.RsVizAxisExtractor.getMemberStackFromVisualizationDefinition(visualizationDefinition, oFF.VisualizationValueType.WEIGHT));
		}
		return feedMembersMap;
	}
};

oFF.RsVizFeedTuple = function() {};
oFF.RsVizFeedTuple.prototype = new oFF.XObject();
oFF.RsVizFeedTuple.prototype._ff_c = "RsVizFeedTuple";

oFF.RsVizFeedTuple.createTuple = function()
{
	var newInstance = new oFF.RsVizFeedTuple();
	newInstance.m_elements = oFF.XList.create();
	newInstance.m_availableFeedTypes = oFF.XHashSetOfString.create();
	return newInstance;
};
oFF.RsVizFeedTuple.prototype.m_elements = null;
oFF.RsVizFeedTuple.prototype.m_availableFeedTypes = null;
oFF.RsVizFeedTuple.prototype.m_numberFormattingInfo = null;
oFF.RsVizFeedTuple.prototype.m_pattern = null;
oFF.RsVizFeedTuple.prototype.m_color = null;
oFF.RsVizFeedTuple.prototype.getPattern = function()
{
	return this.m_pattern;
};
oFF.RsVizFeedTuple.prototype.getColor = function()
{
	return this.m_color;
};
oFF.RsVizFeedTuple.prototype.releaseObject = function()
{
	this.m_elements = oFF.XObjectExt.release(this.m_elements);
	this.m_availableFeedTypes = oFF.XObjectExt.release(this.m_availableFeedTypes);
	this.m_numberFormattingInfo = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.RsVizFeedTuple.prototype.getMemberKeysForFeedsOtherThan = function(feed)
{
	var result = oFF.XListOfString.create();
	for (var i = 0; i < this.m_elements.size(); i++)
	{
		if (!this.m_elements.get(i).isSelectedByString(feed))
		{
			result.add(this.m_elements.get(i).getKey());
		}
	}
	return result;
};
oFF.RsVizFeedTuple.prototype.getMemberKeys = function()
{
	var result = oFF.XListOfString.create();
	for (var i = 0; i < this.m_elements.size(); i++)
	{
		result.add(this.m_elements.get(i).getKey());
	}
	return result;
};
oFF.RsVizFeedTuple.prototype.setNumberFormattingInfo = function(value)
{
	this.m_numberFormattingInfo = value;
};
oFF.RsVizFeedTuple.prototype.getNumberFormattingInfo = function()
{
	return this.m_numberFormattingInfo;
};
oFF.RsVizFeedTuple.prototype.addElement = function(element)
{
	this.m_elements.add(element);
	this.m_availableFeedTypes.addAll(element.getFeedTypes());
};
oFF.RsVizFeedTuple.prototype.isTotal = function()
{
	for (var i = 0; i < this.m_elements.size(); i++)
	{
		if (this.m_elements.get(i).isTotal())
		{
			return true;
		}
	}
	return false;
};
oFF.RsVizFeedTuple.prototype.getPrettyDefaultText = function()
{
	var val = oFF.XStringBuffer.create();
	for (var i = 0; i < this.m_elements.size(); i++)
	{
		if (!oFF.XCollectionUtils.hasElements(this.m_availableFeedTypes) || oFF.XCollectionUtils.hasElements(this.m_elements.get(i).getFeedTypes()))
		{
			val.append("/");
			val.append(this.m_elements.get(i).getText());
		}
	}
	var result = val.toString();
	if (oFF.XString.size(result) > 1)
	{
		return oFF.XString.substring(result, 1, oFF.XString.size(result));
	}
	return null;
};
oFF.RsVizFeedTuple.prototype.getDefaultLabel = function(axisForHierarchyLookup)
{
	var result = null;
	for (var i = 0; i < this.m_elements.size(); i++)
	{
		if (!oFF.XCollectionUtils.hasElements(this.m_availableFeedTypes) || oFF.XCollectionUtils.hasElements(this.m_elements.get(i).getFeedTypes()))
		{
			result = this.createVizLabel(i, axisForHierarchyLookup, result);
		}
	}
	return result;
};
oFF.RsVizFeedTuple.prototype.createVizLabel = function(i, axisForHierarchyLookup, parent)
{
	var result = parent;
	var currentElement = this.m_elements.get(i);
	if (oFF.notNull(axisForHierarchyLookup) && currentElement.getParentIndex() > -1 && currentElement.getParentIndex() < axisForHierarchyLookup.getTuplesCount())
	{
		result = axisForHierarchyLookup.getTupleAt(currentElement.getParentIndex()).createVizLabel(i, axisForHierarchyLookup, result);
	}
	return oFF.RsVizLabel.create(currentElement.getKey(), currentElement.getText(), currentElement.getFormattedText(), result, currentElement.getDisplayLevel(), currentElement.getDrillState());
};
oFF.RsVizFeedTuple.prototype.getFormattedDefaultText = function()
{
	var val = oFF.XStringBuffer.create();
	for (var i = 0; i < this.m_elements.size(); i++)
	{
		if (!oFF.XCollectionUtils.hasElements(this.m_availableFeedTypes) || oFF.XCollectionUtils.hasElements(this.m_elements.get(i).getFeedTypes()))
		{
			val.append("/");
			val.append(this.m_elements.get(i).getFormattedText());
		}
	}
	var result = val.toString();
	if (oFF.XString.size(result) > 1)
	{
		return oFF.XString.substring(result, 1, oFF.XString.size(result));
	}
	return null;
};
oFF.RsVizFeedTuple.prototype.setPattern = function(pattern)
{
	this.m_pattern = pattern;
};
oFF.RsVizFeedTuple.prototype.setColor = function(color)
{
	this.m_color = color;
};
oFF.RsVizFeedTuple.prototype.getPrettyTextForFeed = function(feedSelector)
{
	var feeds = oFF.XListOfString.create();
	feeds.add(feedSelector);
	return this.getPrettyText(feeds);
};
oFF.RsVizFeedTuple.prototype.getPrettyText = function(feedSelector)
{
	if (!oFF.XCollectionUtils.hasElements(this.m_availableFeedTypes))
	{
		return null;
	}
	var val = oFF.XStringBuffer.create();
	for (var i = 0; i < this.m_elements.size(); i++)
	{
		if (this.m_elements.get(i).isSelectedByList(feedSelector))
		{
			val.append("/");
			val.append(this.m_elements.get(i).getText());
		}
	}
	var result = val.toString();
	if (oFF.XString.size(result) > 1)
	{
		return oFF.XString.substring(result, 1, oFF.XString.size(result));
	}
	return null;
};
oFF.RsVizFeedTuple.prototype.getLabel = function(axisForHierarchyLookup, feedSelector)
{
	if (!oFF.XCollectionUtils.hasElements(this.m_availableFeedTypes))
	{
		return null;
	}
	var result = null;
	for (var i = 0; i < this.m_elements.size(); i++)
	{
		if (this.m_elements.get(i).isSelectedByList(feedSelector))
		{
			result = this.createVizLabel(i, axisForHierarchyLookup, result);
		}
	}
	return result;
};
oFF.RsVizFeedTuple.prototype.getFormattedText = function(feedSelector)
{
	if (!oFF.XCollectionUtils.hasElements(this.m_availableFeedTypes))
	{
		return null;
	}
	var val = oFF.XStringBuffer.create();
	for (var i = 0; i < this.m_elements.size(); i++)
	{
		if (this.m_elements.get(i).isSelectedByList(feedSelector))
		{
			val.append("/");
			val.append(this.m_elements.get(i).getFormattedText());
		}
	}
	var result = val.toString();
	if (oFF.XString.size(result) > 1)
	{
		return oFF.XString.substring(result, 1, oFF.XString.size(result));
	}
	return null;
};
oFF.RsVizFeedTuple.prototype.getPrettyTextExclude = function(feedSelector, feedExclude)
{
	if (!oFF.XCollectionUtils.hasElements(this.m_availableFeedTypes))
	{
		return null;
	}
	var val = oFF.XStringBuffer.create();
	for (var i = 0; i < this.m_elements.size(); i++)
	{
		if (this.m_elements.get(i).isSelectedByList(feedSelector) && !this.m_elements.get(i).isSelectedByList(feedExclude))
		{
			val.append("/");
			val.append(this.m_elements.get(i).getText());
		}
	}
	var result = val.toString();
	if (oFF.XString.size(result) > 1)
	{
		return oFF.XString.substring(result, 1, oFF.XString.size(result));
	}
	return null;
};
oFF.RsVizFeedTuple.prototype.getPrettyKeyText = function(feedSelector)
{
	if (!oFF.XCollectionUtils.hasElements(this.m_availableFeedTypes))
	{
		return null;
	}
	var val = oFF.XStringBuffer.create();
	for (var i = 0; i < this.m_elements.size(); i++)
	{
		if (this.m_elements.get(i).isSelectedByList(feedSelector))
		{
			val.append("/");
			val.append(this.m_elements.get(i).getKey());
		}
	}
	var result = val.toString();
	if (oFF.XString.size(result) > 1)
	{
		return oFF.XString.substring(result, 1, oFF.XString.size(result));
	}
	return null;
};
oFF.RsVizFeedTuple.prototype.toString = function()
{
	return oFF.XStringUtils.concatenate3(this.m_elements.toString(), ":::", this.m_availableFeedTypes.toString());
};
oFF.RsVizFeedTuple.prototype.getAvailableFeedTypes = function()
{
	return this.m_availableFeedTypes;
};
oFF.RsVizFeedTuple.prototype.isSelectedByList = function(feedSelector)
{
	if (oFF.XCollectionUtils.hasElements(this.m_availableFeedTypes) && !oFF.XCollectionUtils.hasElements(feedSelector))
	{
		return true;
	}
	for (var i = 0; i < feedSelector.size(); i++)
	{
		if (this.m_availableFeedTypes.contains(feedSelector.get(i)))
		{
			return true;
		}
	}
	return false;
};
oFF.RsVizFeedTuple.prototype.isSelectedByString = function(feedSelector)
{
	return oFF.XStringUtils.isNullOrEmpty(feedSelector) || this.m_availableFeedTypes.contains(feedSelector);
};
oFF.RsVizFeedTuple.prototype.getDate = function(fallbackLevel)
{
	for (var i = 0; i < this.m_elements.size(); i++)
	{
		var date = this.m_elements.get(i).getDate(fallbackLevel);
		if (oFF.notNull(date))
		{
			return date;
		}
	}
	return null;
};
oFF.RsVizFeedTuple.prototype.getFormattedDate = function()
{
	for (var i = 0; i < this.m_elements.size(); i++)
	{
		var date = this.m_elements.get(i).getFormattedDate();
		if (oFF.notNull(date))
		{
			return date;
		}
	}
	return null;
};
oFF.RsVizFeedTuple.prototype.getDimensionTextsForFeeds = function(feeds)
{
	var result = oFF.XListOfString.create();
	for (var i = 0; i < this.m_elements.size(); i++)
	{
		var curElement = this.m_elements.get(i);
		if (curElement.getDimensionMember() !== null && curElement.getDimensionMember().getDimension() !== null && curElement.isSelectedByList(feeds) && !result.contains(curElement.getDimensionMember().getDimension().getName()))
		{
			result.add(curElement.getDimensionMember().getDimension().getText());
		}
	}
	return result;
};
oFF.RsVizFeedTuple.prototype.getDimensionNamesForFeeds = function(feeds)
{
	var result = oFF.XListOfString.create();
	for (var i = 0; i < this.m_elements.size(); i++)
	{
		var curElement = this.m_elements.get(i);
		if (curElement.getDimensionMember() !== null && curElement.getDimensionMember().getDimension() !== null && curElement.isSelectedByList(feeds) && !result.contains(curElement.getDimensionMember().getDimension().getName()))
		{
			result.add(curElement.getDimensionMember().getDimension().getName());
		}
	}
	return result;
};
oFF.RsVizFeedTuple.prototype.compareTo = function(objectToCompare)
{
	if (oFF.isNull(objectToCompare))
	{
		return 1;
	}
	var otherObject = objectToCompare;
	var size = oFF.XMath.min(this.m_elements.size(), otherObject.m_elements.size());
	for (var i = 0; i < size; i++)
	{
		var compVal = this.m_elements.get(i).compareTo(otherObject.m_elements.get(i));
		if (compVal !== 0)
		{
			return compVal;
		}
	}
	return 0;
};
oFF.RsVizFeedTuple.prototype.getFormattedValue = function(dataCell)
{
	return oFF.RsVizAxisExtractor.getFormattedValue(dataCell, this.getNumberFormattingInfo(), null);
};
oFF.RsVizFeedTuple.prototype.getDecimalPlaces = function()
{
	return this.m_numberFormattingInfo.getMaxDecimalPlaces();
};
oFF.RsVizFeedTuple.prototype.getNumericShift = function()
{
	return this.m_numberFormattingInfo.getNumericShift();
};
oFF.RsVizFeedTuple.prototype.getScaledValue = function(dataCell)
{
	return oFF.RsVizAxisExtractor.getScaledValue(dataCell, this.getNumberFormattingInfo(), null);
};

oFF.RsVizLabel = function() {};
oFF.RsVizLabel.prototype = new oFF.XObject();
oFF.RsVizLabel.prototype._ff_c = "RsVizLabel";

oFF.RsVizLabel.create = function(id, label, formattedLabel, parent, displayLevel, drillState)
{
	var newInstance = new oFF.RsVizLabel();
	newInstance.m_id = id;
	newInstance.m_label = label;
	newInstance.m_formattedLabel = formattedLabel;
	newInstance.m_parent = parent;
	newInstance.m_leafOrCollapsed = oFF.isNull(drillState) || drillState === oFF.DrillState.LEAF || drillState === oFF.DrillState.COLLAPSED || drillState === oFF.DrillState.COLLAPSED_EXPAND_AND_DRILLDOWN_ALLOWED;
	newInstance.m_displayLevel = displayLevel;
	if (oFF.notNull(parent))
	{
		parent.m_leafOrCollapsed = false;
	}
	return newInstance;
};
oFF.RsVizLabel.prototype.m_id = null;
oFF.RsVizLabel.prototype.m_label = null;
oFF.RsVizLabel.prototype.m_formattedLabel = null;
oFF.RsVizLabel.prototype.m_compoundId = null;
oFF.RsVizLabel.prototype.m_compoundLabel = null;
oFF.RsVizLabel.prototype.m_compoundFormattedLabel = null;
oFF.RsVizLabel.prototype.m_leafOrCollapsed = false;
oFF.RsVizLabel.prototype.m_displayLevel = 0;
oFF.RsVizLabel.prototype.m_parent = null;
oFF.RsVizLabel.prototype.releaseObject = function()
{
	this.m_id = null;
	this.m_label = null;
	this.m_formattedLabel = null;
	this.m_parent = null;
	this.m_compoundFormattedLabel = null;
	this.m_compoundId = null;
	this.m_compoundLabel = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.RsVizLabel.prototype.getId = function()
{
	return this.m_id;
};
oFF.RsVizLabel.prototype.getLabel = function()
{
	return this.m_label;
};
oFF.RsVizLabel.prototype.getParent = function()
{
	return this.m_parent;
};
oFF.RsVizLabel.prototype.getCompoundLabel = function()
{
	if (oFF.isNull(this.m_compoundLabel))
	{
		if (oFF.notNull(this.m_parent))
		{
			this.m_compoundLabel = oFF.XStringUtils.concatenate3(this.m_parent.getCompoundLabel(), "/", this.m_label);
		}
		else
		{
			this.m_compoundLabel = this.m_label;
		}
	}
	return this.m_compoundLabel;
};
oFF.RsVizLabel.prototype.getCompoundFormattedLabel = function()
{
	if (oFF.isNull(this.m_compoundFormattedLabel))
	{
		if (oFF.notNull(this.m_parent))
		{
			this.m_compoundFormattedLabel = oFF.XStringUtils.concatenate3(this.m_parent.getCompoundFormattedLabel(), "/", this.m_formattedLabel);
		}
		else
		{
			this.m_compoundFormattedLabel = this.m_formattedLabel;
		}
	}
	return this.m_compoundFormattedLabel;
};
oFF.RsVizLabel.prototype.getCompoundId = function()
{
	if (oFF.isNull(this.m_compoundId))
	{
		if (oFF.notNull(this.m_parent))
		{
			this.m_compoundId = oFF.XStringUtils.concatenate3(this.m_parent.getCompoundId(), "/", this.m_id);
		}
		else
		{
			this.m_compoundId = this.m_id;
		}
	}
	return this.m_compoundId;
};
oFF.RsVizLabel.prototype.getFormattedLabel = function()
{
	return this.m_formattedLabel;
};
oFF.RsVizLabel.prototype.isLeafOrCollapsed = function()
{
	return this.m_leafOrCollapsed;
};
oFF.RsVizLabel.prototype.getDisplayLevel = function()
{
	return this.m_displayLevel;
};

oFF.RsVizNumberFormattingInfo = function() {};
oFF.RsVizNumberFormattingInfo.prototype = new oFF.XObject();
oFF.RsVizNumberFormattingInfo.prototype._ff_c = "RsVizNumberFormattingInfo";

oFF.RsVizNumberFormattingInfo.createNumberFormat = function(numericShift, minDecimalPlaces, maxDecimalPlaces, showSignAs, useFormattingFromDataCell)
{
	var newInstance = new oFF.RsVizNumberFormattingInfo();
	newInstance.m_numericShift = numericShift;
	newInstance.m_minDecimalPlaces = minDecimalPlaces;
	newInstance.m_maxDecimalPlaces = maxDecimalPlaces;
	newInstance.m_useFormattingFromDataCell = useFormattingFromDataCell;
	newInstance.m_showSignAs = showSignAs;
	return newInstance;
};
oFF.RsVizNumberFormattingInfo.prototype.m_numericShift = 0;
oFF.RsVizNumberFormattingInfo.prototype.m_minDecimalPlaces = 0;
oFF.RsVizNumberFormattingInfo.prototype.m_maxDecimalPlaces = 0;
oFF.RsVizNumberFormattingInfo.prototype.m_useFormattingFromDataCell = false;
oFF.RsVizNumberFormattingInfo.prototype.m_showSignAs = null;
oFF.RsVizNumberFormattingInfo.prototype.releaseObject = function()
{
	this.m_showSignAs = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.RsVizNumberFormattingInfo.prototype.getNumericShift = function()
{
	return this.m_numericShift;
};
oFF.RsVizNumberFormattingInfo.prototype.getMinDecimalPlaces = function()
{
	return this.m_minDecimalPlaces;
};
oFF.RsVizNumberFormattingInfo.prototype.getMaxDecimalPlaces = function()
{
	return this.m_maxDecimalPlaces;
};
oFF.RsVizNumberFormattingInfo.prototype.isShowPlusSign = function()
{
	return oFF.XStringUtils.isNotNullAndNotEmpty(this.m_showSignAs) && oFF.XString.startsWith(this.m_showSignAs, "+");
};
oFF.RsVizNumberFormattingInfo.prototype.isUseFormattingFromDataCell = function()
{
	return this.m_useFormattingFromDataCell;
};
oFF.RsVizNumberFormattingInfo.prototype.getShowSignAs = function()
{
	return this.m_showSignAs;
};

oFF.RsVizTupleElement = function() {};
oFF.RsVizTupleElement.prototype = new oFF.XObject();
oFF.RsVizTupleElement.prototype._ff_c = "RsVizTupleElement";

oFF.RsVizTupleElement.createTupleElement = function(dimensionMember, displayLevel, parentIndex, drillState, key, text, feedTypes, formattedValueList, valueList, valueTypeList, presentationTypeList, memberType)
{
	var newInstance = new oFF.RsVizTupleElement();
	newInstance.m_displayLevel = displayLevel;
	newInstance.m_drillState = drillState;
	newInstance.m_member = dimensionMember;
	newInstance.m_parentIndex = parentIndex;
	newInstance.m_key = key;
	newInstance.m_text = text;
	newInstance.m_feedTypes = feedTypes;
	newInstance.m_formattedValueList = formattedValueList;
	newInstance.m_valueList = valueList;
	newInstance.m_valueTypeList = valueTypeList;
	newInstance.m_presentationTypeList = presentationTypeList;
	newInstance.m_memberType = memberType;
	return newInstance;
};
oFF.RsVizTupleElement.prototype.m_feedTypes = null;
oFF.RsVizTupleElement.prototype.m_member = null;
oFF.RsVizTupleElement.prototype.m_parentIndex = 0;
oFF.RsVizTupleElement.prototype.m_key = null;
oFF.RsVizTupleElement.prototype.m_text = null;
oFF.RsVizTupleElement.prototype.m_formattedValueList = null;
oFF.RsVizTupleElement.prototype.m_valueList = null;
oFF.RsVizTupleElement.prototype.m_valueTypeList = null;
oFF.RsVizTupleElement.prototype.m_presentationTypeList = null;
oFF.RsVizTupleElement.prototype.m_memberType = null;
oFF.RsVizTupleElement.prototype.m_drillState = null;
oFF.RsVizTupleElement.prototype.m_displayLevel = 0;
oFF.RsVizTupleElement.prototype.releaseObject = function()
{
	this.m_member = null;
	this.m_key = null;
	this.m_text = null;
	this.m_feedTypes = oFF.XObjectExt.release(this.m_feedTypes);
	this.m_formattedValueList = oFF.XObjectExt.release(this.m_formattedValueList);
	this.m_valueList = oFF.XObjectExt.release(this.m_valueList);
	this.m_valueTypeList = oFF.XObjectExt.release(this.m_valueTypeList);
	this.m_presentationTypeList = oFF.XObjectExt.release(this.m_presentationTypeList);
	this.m_memberType = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.RsVizTupleElement.prototype.getParentIndex = function()
{
	return this.m_parentIndex;
};
oFF.RsVizTupleElement.prototype.getFormattedValueList = function()
{
	return this.m_formattedValueList;
};
oFF.RsVizTupleElement.prototype.getValueTypeList = function()
{
	return this.m_valueTypeList;
};
oFF.RsVizTupleElement.prototype.getPresentationTypeList = function()
{
	return this.m_presentationTypeList;
};
oFF.RsVizTupleElement.prototype.getKey = function()
{
	return this.m_key;
};
oFF.RsVizTupleElement.prototype.getFormattedText = function()
{
	var prefix = "";
	var suffix = "";
	if (oFF.notNull(this.m_drillState) && this.m_drillState !== oFF.DrillState.LEAF && this.m_drillState !== oFF.DrillState.LEAF_UDH)
	{
		if (this.m_displayLevel === 0)
		{
			prefix = "<b>";
			suffix = "</b>";
		}
		else if (this.m_displayLevel === 1)
		{
			prefix = "<b><em>";
			suffix = "</em></b>";
		}
		else if (this.m_displayLevel === 2)
		{
			prefix = "<em>";
			suffix = "</em>";
		}
	}
	return oFF.XStringUtils.concatenate3(prefix, this.m_text, suffix);
};
oFF.RsVizTupleElement.prototype.getText = function()
{
	return this.m_text;
};
oFF.RsVizTupleElement.prototype.getDimensionMember = function()
{
	return this.m_member;
};
oFF.RsVizTupleElement.prototype.toString = function()
{
	return oFF.XStringUtils.concatenate5(this.m_feedTypes.toString(), "::<", this.m_key, ">::", this.m_text);
};
oFF.RsVizTupleElement.prototype.isSelectedByList = function(feedSelector)
{
	var feedTypes = this.m_feedTypes.getKeysAsReadOnlyListOfString();
	if (oFF.XCollectionUtils.hasElements(this.m_feedTypes) && !oFF.XCollectionUtils.hasElements(feedSelector))
	{
		return true;
	}
	for (var i = 0; i < this.m_feedTypes.size(); i++)
	{
		if (feedSelector.contains(feedTypes.get(i)))
		{
			return true;
		}
	}
	return false;
};
oFF.RsVizTupleElement.prototype.isSelectedByString = function(feedSelector)
{
	return oFF.XStringUtils.isNullOrEmpty(feedSelector) || this.m_feedTypes.containsKey(feedSelector);
};
oFF.RsVizTupleElement.prototype.getFeedTypes = function()
{
	return this.m_feedTypes.getKeysAsReadOnlyListOfString();
};
oFF.RsVizTupleElement.prototype.isTotal = function()
{
	return oFF.notNull(this.m_memberType) && this.m_memberType.isTypeOf(oFF.MemberType.RESULT);
};
oFF.RsVizTupleElement.prototype.getDate = function(fallbackLevel)
{
	if (oFF.isNull(this.m_member))
	{
		return null;
	}
	for (var i = 0; i < this.m_valueList.size(); i++)
	{
		var fieldValue = this.m_valueList.get(i);
		if (fieldValue.getValueType() === oFF.XValueType.DATE)
		{
			return fieldValue;
		}
		if (fallbackLevel === 0)
		{
			return null;
		}
		var rep = fieldValue.getStringRepresentation();
		if (fallbackLevel === 2)
		{
			rep = oFF.XStringUtils.concatenate2(rep, "01");
		}
		else if (fallbackLevel === 3)
		{
			rep = oFF.XStringUtils.concatenate2(rep, "0101");
		}
		try
		{
			if (oFF.XString.startsWith(rep, "!") && oFF.XString.size(rep) === 9)
			{
				return oFF.XDate.createDateFromString(oFF.XString.substring(rep, 1, 9), oFF.DateTimeFormat.SAP);
			}
			else if (oFF.XString.size(rep) === 8)
			{
				return oFF.XDate.createDateFromString(rep, oFF.DateTimeFormat.SAP);
			}
			else if (oFF.XString.startsWith(rep, "!") && oFF.XString.size(rep) === 11)
			{
				return oFF.XDate.createDateFromString(oFF.XString.substring(rep, 1, 11), oFF.DateTimeFormat.ISO);
			}
			else if (oFF.XString.size(rep) === 10)
			{
				return oFF.XDate.createDateFromString(rep, oFF.DateTimeFormat.ISO);
			}
		}
		catch (t)
		{
			continue;
		}
	}
	return null;
};
oFF.RsVizTupleElement.prototype.getFormattedDate = function()
{
	if (oFF.isNull(this.m_member))
	{
		return null;
	}
	for (var i = 0; i < this.m_valueList.size(); i++)
	{
		var fieldValue = this.m_valueList.get(i);
		if (fieldValue.getValueType() === oFF.XValueType.DATE)
		{
			return fieldValue.toString();
		}
	}
	return this.m_text;
};
oFF.RsVizTupleElement.prototype.compareTo = function(objectToCompare)
{
	if (oFF.isNull(objectToCompare))
	{
		return 1;
	}
	var otherObject = objectToCompare;
	var keys = this.m_feedTypes.getKeysAsReadOnlyListOfString();
	var size = keys.size();
	for (var i = 0; i < size; i++)
	{
		var key = keys.get(i);
		var ftThis = this.m_feedTypes.getByKey(key);
		var ftThat = otherObject.m_feedTypes.getByKey(key);
		if (oFF.isNull(ftThat))
		{
			return 1;
		}
		var compVal = ftThis.getInteger() - ftThat.getInteger();
		if (compVal !== 0)
		{
			return compVal;
		}
	}
	return oFF.XString.isEqual(this.getKey(), otherObject.getKey()) ? 0 : 1;
};
oFF.RsVizTupleElement.prototype.getDrillState = function()
{
	return this.m_drillState;
};
oFF.RsVizTupleElement.prototype.getDisplayLevel = function()
{
	return this.m_displayLevel;
};

oFF.RsVizFrameRenderer = function() {};
oFF.RsVizFrameRenderer.prototype = new oFF.XObject();
oFF.RsVizFrameRenderer.prototype._ff_c = "RsVizFrameRenderer";

oFF.RsVizFrameRenderer.create = function()
{
	return new oFF.RsVizFrameRenderer();
};
oFF.RsVizFrameRenderer.prototype.render = function(type, rs)
{
	var structure = oFF.PrFactory.createStructure();
	var vizDef = rs.getQueryModel().getVizManager().getVizDef();
	if (oFF.notNull(vizDef) && vizDef.containsKey(oFF.VizDefConstants.K_CHART) && rs.getAvailableDataCellCount() > 0)
	{
		structure.putString("test", "testValue");
	}
	structure.putString("test2", "testValue2");
	return structure;
};
oFF.RsVizFrameRenderer.prototype.renderVisualizationWithResultSet = function(visualizationDefinition, cursorResultSet)
{
	return this.render(visualizationDefinition.getSemanticBindingType(), cursorResultSet);
};

oFF.RsHiChartVizUserPrefrence = {

	create:function()
	{
			return new oFF.RsHiChartVizUserPrefrence();
	},
	userPrefrence:function(theChartData, userPrefrence, chartType)
	{
			if (!oFF.XString.isEqual(chartType, oFF.VizDefConstants.K_SOLID_GAUGE))
		{
			var userDatalabels = userPrefrence.getStructureByKey(oFF.VizDefConstants.K_DATA_LABEL);
			if (oFF.notNull(userDatalabels))
			{
				var userDatalabelsStyle = userDatalabels.getStructureByKey(oFF.VizDefConstants.K_STYLE);
				var userDatalabelsStyleColor = userDatalabelsStyle.getStringByKey(oFF.VizDefConstants.K_COLOR);
				var userDatalabelsStyleFontWeight = userDatalabelsStyle.getStringByKey(oFF.VizDefConstants.K_FONT_WEIGHT);
				var userDatalabelsStyleforSize = userDatalabelsStyle.getStringByKey(oFF.VizDefConstants.K_FONT_SIZE);
				var plotOptions = theChartData.getStructureByKey(oFF.VizDefConstants.K_PLOT_OPTIONS);
				if (oFF.notNull(plotOptions))
				{
					var plotOptionChartTypeStructureSeries = plotOptions.getStructureByKey(chartType);
					if (oFF.notNull(plotOptionChartTypeStructureSeries))
					{
						var plotOptionChartTypeStructureDatalabels = plotOptionChartTypeStructureSeries.getStructureByKey(oFF.VizDefConstants.K_DATA_LABELS);
						var yAxis = theChartData.getListByKey(oFF.VizDefConstants.K_Y_AXIS);
						if (oFF.notNull(yAxis))
						{
							var yAxisStack = yAxis.getStructureAt(0);
							if (oFF.notNull(yAxisStack))
							{
								if (yAxisStack.containsKey(oFF.VizDefConstants.K_STACK_LABELS))
								{
									var stackLabelsHi = yAxisStack.putNewStructure(oFF.VizDefConstants.K_STACK_LABELS);
									stackLabelsHi.putBoolean(oFF.VizDefConstants.K_ENABLED, true);
									var stackLabelsHiStyle = stackLabelsHi.putNewStructure(oFF.VizDefConstants.K_STYLE);
									if (oFF.notNull(userDatalabelsStyleColor))
									{
										stackLabelsHiStyle.putString(oFF.VizDefConstants.K_COLOR, userDatalabelsStyleColor);
										stackLabelsHiStyle.putString(oFF.VizDefConstants.K_FILL, userDatalabelsStyleColor);
									}
									stackLabelsHiStyle.putString(oFF.VizDefConstants.K_FONT_WEIGHT, userDatalabelsStyleFontWeight);
									stackLabelsHiStyle.putString(oFF.VizDefConstants.K_FONT_SIZE, userDatalabelsStyleforSize);
								}
							}
						}
						if (oFF.notNull(plotOptionChartTypeStructureDatalabels))
						{
							var plotOptionChartTypeStructureDatalabelsStyle = plotOptionChartTypeStructureDatalabels.getStructureByKey(oFF.VizDefConstants.K_STYLE);
							if (oFF.notNull(plotOptionChartTypeStructureDatalabelsStyle))
							{
								if (oFF.notNull(userDatalabelsStyleColor))
								{
									plotOptionChartTypeStructureDatalabelsStyle.putString(oFF.VizDefConstants.K_COLOR, userDatalabelsStyleColor);
									plotOptionChartTypeStructureDatalabelsStyle.putString(oFF.VizDefConstants.K_FILL, userDatalabelsStyleColor);
								}
								plotOptionChartTypeStructureDatalabelsStyle.putString(oFF.VizDefConstants.K_FONT_WEIGHT, userDatalabelsStyleFontWeight);
								plotOptionChartTypeStructureDatalabelsStyle.putString(oFF.VizDefConstants.K_FONT_SIZE, userDatalabelsStyleforSize);
							}
						}
					}
				}
			}
			var userTitle = userPrefrence.getStructureByKey(oFF.VizDefConstants.K_TITLE);
			if (oFF.notNull(userTitle))
			{
				var isTitleVisible = userTitle.getBooleanByKeyExt(oFF.VizDefConstants.K_VISIBLE, true);
				var title = theChartData.getStructureByKey(oFF.VizDefConstants.K_TITLE);
				if (oFF.notNull(title))
				{
					if (isTitleVisible === false)
					{
						title.putString(oFF.VizDefConstants.K_TEXT, "");
					}
					var userPrefsTitleStyle = userTitle.getStructureByKey(oFF.VizDefConstants.K_STYLE);
					if (oFF.notNull(userPrefsTitleStyle))
					{
						title.put(oFF.VizDefConstants.K_STYLE, userPrefsTitleStyle);
					}
				}
			}
			var userSubTitle = userPrefrence.getStructureByKey(oFF.VizDefConstants.K_SUB_TITLE);
			if (oFF.notNull(userSubTitle))
			{
				var isSubTitleVisible = userSubTitle.getBooleanByKeyExt(oFF.VizDefConstants.K_VISIBLE, true);
				var subTitle = theChartData.getStructureByKey(oFF.VizDefConstants.K_SUBTITLE);
				if (oFF.notNull(subTitle))
				{
					if (isSubTitleVisible === false)
					{
						subTitle.putString(oFF.VizDefConstants.K_TEXT, "");
					}
					var userPrefsSubTitleStyle = userSubTitle.getStructureByKey(oFF.VizDefConstants.K_STYLE);
					if (oFF.notNull(userPrefsSubTitleStyle))
					{
						subTitle.put(oFF.VizDefConstants.K_STYLE, userPrefsSubTitleStyle);
					}
				}
			}
			var xAxisElement = theChartData.getByKey(oFF.VizDefConstants.K_X_AXIS);
			var xAxis = oFF.notNull(xAxisElement) && xAxisElement.isList() ? xAxisElement.asList() : null;
			var xAxisStruct = oFF.notNull(xAxisElement) && xAxisElement.isStructure() ? xAxisElement.asStructure() : oFF.XCollectionUtils.hasElements(xAxis) ? xAxis.getStructureAt(0) : null;
			var generalUserPrefs = userPrefrence.getStructureByKey(oFF.VizDefConstants.K_GENERAL);
			if (oFF.notNull(generalUserPrefs))
			{
				var axisLabel = generalUserPrefs.getStructureByKey(oFF.VizDefConstants.K_AXIS_LABEL);
				if (oFF.notNull(axisLabel))
				{
					if (oFF.notNull(xAxisStruct))
					{
						var xAxisStructLabels = xAxisStruct.getStructureByKey(oFF.VizDefConstants.K_LABELS);
						if (oFF.isNull(xAxisStructLabels))
						{
							xAxisStructLabels = xAxisStruct.putNewStructure(oFF.VizDefConstants.K_LABELS);
						}
						var userAxisLabelsStyle = axisLabel.getStructureByKey(oFF.VizDefConstants.K_STYLE);
						if (oFF.notNull(userAxisLabelsStyle))
						{
							xAxisStructLabels.put(oFF.VizDefConstants.K_STYLE, userAxisLabelsStyle);
						}
					}
				}
			}
			var chartlegend = theChartData.getStructureByKey(oFF.VizDefConstants.K_LEGEND);
			if (oFF.notNull(chartlegend))
			{
				var userLegend = userPrefrence.getStructureByKey(oFF.VizDefConstants.K_LEGEND);
				if (oFF.notNull(userLegend))
				{
					var userLegendLabels = userLegend.getStructureByKey(oFF.VizDefConstants.K_LABEL);
					if (oFF.notNull(userLegendLabels))
					{
						var userLegendStyle = userLegendLabels.getStructureByKey(oFF.VizDefConstants.K_STYLE);
						if (oFF.notNull(userLegendStyle))
						{
							chartlegend.put(oFF.VizDefConstants.K_ITEM_STYLE, userLegendStyle);
						}
					}
				}
			}
		}
		return theChartData;
	}
};

oFF.RsHiChartVizUtils = {

	create:function()
	{
			return new oFF.RsHiChartVizUtils();
	},
	chartTitleBuilder:function(theChartData, charTtitle, chartSubtitle)
	{
			if (oFF.notNull(charTtitle))
		{
			var title = theChartData.putNewStructure(oFF.VizDefConstants.K_TITLE);
			title.putString(oFF.VizDefConstants.K_TEXT, charTtitle);
			title.putString(oFF.VizDefConstants.K_ALIGN, oFF.VizDefConstants.V_LEFT);
		}
		if (oFF.notNull(chartSubtitle))
		{
			var subtitle = theChartData.putNewStructure(oFF.VizDefConstants.K_SUBTITLE);
			subtitle.putString(oFF.VizDefConstants.K_TEXT, chartSubtitle);
			subtitle.putString(oFF.VizDefConstants.K_ALIGN, oFF.VizDefConstants.V_LEFT);
		}
	},
	chartLegendBuilder:function(theChartData)
	{
			var legend = theChartData.putNewStructure(oFF.VizDefConstants.K_LEGEND);
		legend.putBoolean(oFF.VizDefConstants.K_ENABLED, true);
		legend.putInteger(oFF.VizDefConstants.K_SYMBOL_RADIUS, 0);
		legend.putString(oFF.VizDefConstants.K_LAYOUT, oFF.VizDefConstants.V_VERTICAL);
		legend.putString(oFF.VizDefConstants.K_ALIGN, oFF.VizDefConstants.V_RIGHT);
		legend.putString(oFF.VizDefConstants.K_VERTICAL_ALIGN, oFF.VizDefConstants.V_POSITION_TOP);
		legend.putBoolean(oFF.VizDefConstants.K_SQUARE_SYMBOL, true);
		var legenditemStyle = legend.putNewStructure(oFF.VizDefConstants.K_ITEM_STYLE);
		legenditemStyle.putString(oFF.VizDefConstants.K_FONT_SIZE, "12px");
		legenditemStyle.putString(oFF.VizDefConstants.K_FONT_WEIGHT, oFF.VizDefConstants.V_NORMAL);
		legenditemStyle.putString(oFF.VizDefConstants.K_FONT_SIZE, "12px");
	},
	chartPlotBuilder:function(theChartData, chartType, plotArea)
	{
			var isDataLabels = true;
		if (oFF.notNull(plotArea) && plotArea.hasElements())
		{
			var dataLabelPlotArea = plotArea.getStructureByKey(oFF.VizDefConstants.K_DATA_LABEL);
			isDataLabels = dataLabelPlotArea.getBooleanByKeyExt(oFF.VizDefConstants.K_VISIBLE, false);
		}
		var plotOptions = theChartData.putNewStructure(oFF.VizDefConstants.K_PLOT_OPTIONS);
		var plotOptionsSeries = plotOptions.putNewStructure(oFF.VizDefConstants.K_SERIES);
		plotOptionsSeries.putInteger(oFF.VizDefConstants.K_CROP_THRESHOLD, 1000);
		var plotOptionChartTypeStructure = plotOptions.putNewStructure(chartType);
		plotOptionChartTypeStructure.putBoolean(oFF.VizDefConstants.K_GROUPING, true);
		var dataLabels = plotOptionChartTypeStructure.putNewStructure(oFF.VizDefConstants.K_DATA_LABELS);
		dataLabels.putBoolean(oFF.VizDefConstants.K_ENABLED, isDataLabels);
		dataLabels.putString(oFF.VizDefConstants.K_FORMAT, "{point.yFormatted} ");
		var dataLabelsStyle = dataLabels.putNewStructure(oFF.VizDefConstants.K_STYLE);
		dataLabelsStyle.putString(oFF.VizDefConstants.K_FONT_WEIGHT, oFF.VizDefConstants.V_FONT_WEIGHT_BOLD);
		dataLabelsStyle.putString(oFF.VizDefConstants.K_FONT_FAMILY, "LatoWeb, 'Open Sans', 'Helvetica Neue', Helvetica, Arial, 'sans serif'");
		dataLabelsStyle.putString(oFF.VizDefConstants.K_FONT_SIZE, "12px");
		dataLabelsStyle.putString(oFF.VizDefConstants.K_COLOR, "rgb(88,89,91)");
	},
	checkShowLegend:function(vizDef, theChartData, chartType, isShowLegendInitial)
	{
			var plotOptions = theChartData.getStructureByKey(oFF.VizDefConstants.K_PLOT_OPTIONS);
		var plotOptionChartTypeStructure = plotOptions.getStructureByKey(chartType);
		plotOptionChartTypeStructure.putBoolean(oFF.VizDefConstants.K_SHOW_IN_LEGEND, isShowLegendInitial);
		var legendViz = theChartData.getStructureByKey(oFF.VizDefConstants.K_LEGEND);
		legendViz.putBoolean(oFF.VizDefConstants.K_ENABLED, isShowLegendInitial);
		if (oFF.isNull(vizDef))
		{
			return;
		}
		var chartObject = vizDef.getStructureByKey(oFF.VizDefConstants.K_CHART);
		if (oFF.isNull(chartObject))
		{
			return;
		}
		var isShowLegend = false;
		var isShowLegendFinal = isShowLegendInitial;
		var chartProperties = chartObject.getStructureByKey(oFF.VizDefConstants.K_PROPERTIES);
		if (oFF.notNull(chartProperties))
		{
			var legendGroup = chartProperties.getStructureByKey(oFF.VizDefConstants.K_LEGEND_GROUP);
			if (oFF.notNull(legendGroup))
			{
				if (legendGroup.getElementTypeByKey(oFF.VizDefConstants.K_VISIBLE) === oFF.PrElementType.BOOLEAN)
				{
					isShowLegend = legendGroup.getBooleanByKeyExt(oFF.VizDefConstants.K_VISIBLE, isShowLegendInitial);
				}
				else if (legendGroup.getElementTypeByKey(oFF.VizDefConstants.K_VISIBLE) === oFF.PrElementType.STRING)
				{
					isShowLegend = oFF.XBoolean.convertFromStringWithDefault(legendGroup.getStringByKey(oFF.VizDefConstants.K_VISIBLE), isShowLegendInitial);
				}
				else
				{
					isShowLegend = isShowLegendInitial;
				}
				var isResponsiveLegend = legendGroup.getBooleanByKeyExt(oFF.VizDefConstants.K_RESPONSIVE, true);
				isShowLegendFinal = isShowLegend && !isResponsiveLegend || isShowLegendInitial && isResponsiveLegend;
				legendViz.putBoolean(oFF.VizDefConstants.K_ENABLED, isShowLegendFinal);
			}
		}
		plotOptionChartTypeStructure.putBoolean(oFF.VizDefConstants.K_SHOW_IN_LEGEND, isShowLegendInitial);
	},
	vizProcessor:function(vizDef, chartTypeInfo, theChartData, chartType)
	{
			var chartTitle = null;
		var chartSubTitle = null;
		var chartProperties;
		var legendlObject;
		var layoutObject;
		var legendGroup;
		var plotArea = oFF.PrFactory.createStructure();
		if (oFF.notNull(vizDef))
		{
			var chartObject = vizDef.getStructureByKey(oFF.VizDefConstants.K_CHART);
			var legendViz = theChartData.putNewStructure(oFF.VizDefConstants.K_LEGEND);
			if (oFF.notNull(chartObject))
			{
				chartTitle = chartObject.getStringByKey(oFF.VizDefConstants.K_TITLE);
				chartSubTitle = chartObject.getStringByKey(oFF.VizDefConstants.K_SUB_TITLE);
				oFF.RsHiChartVizUtils.chartTitleBuilder(theChartData, chartTitle, chartSubTitle);
				var plotOptionChart = theChartData.putNewStructure(oFF.VizDefConstants.K_PLOT_OPTIONS);
				var plotOptionChartTypeStructure = plotOptionChart.putNewStructure(chartType);
				var plotOptionsSeries = plotOptionChart.putNewStructure(oFF.VizDefConstants.K_SERIES);
				plotOptionsSeries.putString(oFF.VizDefConstants.K_BORDER_COLOR, oFF.VizDefConstants.K_TRANSPARENT);
				var dataLabels = plotOptionChartTypeStructure.putNewStructure(oFF.VizDefConstants.K_DATA_LABELS);
				chartProperties = chartObject.getStructureByKey(oFF.VizDefConstants.K_PROPERTIES);
				if (oFF.notNull(chartProperties))
				{
					var generalObject = chartProperties.getStructureByKey(oFF.VizDefConstants.K_GENERAL);
					if (oFF.notNull(generalObject))
					{
						layoutObject = generalObject.getStructureByKey(oFF.VizDefConstants.K_LAYOUT);
						if (oFF.notNull(layoutObject))
						{
							var spacingBottom = layoutObject.getIntegerByKey(oFF.VizDefConstants.K_PADDING_BOTTOM);
							chartTypeInfo.putInteger(oFF.VizDefConstants.K_SPACING_BOTTOM, spacingBottom);
						}
						else
						{
							chartTypeInfo.putInteger(oFF.VizDefConstants.K_SPACING_BOTTOM, 0);
						}
					}
					legendlObject = chartProperties.getStructureByKey(oFF.VizDefConstants.K_LEGEND);
					if (oFF.notNull(legendlObject))
					{
						legendViz = theChartData.putNewStructure(oFF.VizDefConstants.K_LEGEND);
						var legendLabel = legendlObject.getStructureByKey(oFF.VizDefConstants.K_LABEL);
						if (oFF.notNull(legendLabel))
						{
							var legendlayoutStyle = legendLabel.getStructureByKey(oFF.VizDefConstants.K_STYLE);
							if (oFF.notNull(legendlayoutStyle))
							{
								var fontFamily = legendlayoutStyle.getStringByKey(oFF.VizDefConstants.K_FONT_FAMILY);
								var fontSize = legendlayoutStyle.getStringByKey(oFF.VizDefConstants.K_FONT_SIZE);
								var fontWeight = legendlayoutStyle.getStringByKey(oFF.VizDefConstants.K_FONT_WEIGHT);
								var legenditemStyle = legendViz.putNewStructure(oFF.VizDefConstants.K_ITEM_STYLE);
								legenditemStyle.putString(oFF.VizDefConstants.K_FONT_FAMILY, fontFamily);
								legenditemStyle.putString(oFF.VizDefConstants.K_FONT_WEIGHT, fontWeight);
								legenditemStyle.putString(oFF.VizDefConstants.K_FONT_SIZE, fontSize);
							}
						}
					}
					legendGroup = chartProperties.getStructureByKey(oFF.VizDefConstants.K_LEGEND_GROUP);
					if (oFF.notNull(legendGroup))
					{
						var legendGrouplayout = legendGroup.getStructureByKey(oFF.VizDefConstants.K_LAYOUT);
						if (oFF.notNull(legendGrouplayout))
						{
							var legendgroupPosition = legendGrouplayout.getStringByKey(oFF.VizDefConstants.K_POSITION);
							legendViz.putString(oFF.VizDefConstants.K_VERTICAL_ALIGN, legendgroupPosition);
						}
					}
					plotArea = chartProperties.getStructureByKey(oFF.VizDefConstants.K_PLOT_AREA);
					if (oFF.notNull(plotArea))
					{
						var vizDatalabel = plotArea.getStructureByKey(oFF.VizDefConstants.K_DATA_LABEL);
						if (oFF.notNull(vizDatalabel))
						{
							dataLabels = oFF.RsHiChartVizUtils.datalabelPloter(vizDatalabel, dataLabels);
						}
						var seriesDataLabels = plotOptionsSeries.putNewStructure(oFF.VizDefConstants.K_DATA_LABELS);
						seriesDataLabels.putString(oFF.VizDefConstants.K_FORMAT, "{point.yFormatted}");
					}
				}
			}
		}
		else
		{
			legendlObject = theChartData.putNewStructure(oFF.VizDefConstants.K_LEGEND);
			legendlObject.putBoolean(oFF.VizDefConstants.K_ENABLED, true);
			chartTypeInfo.putInteger(oFF.VizDefConstants.K_SPACING_TOP, 0);
			oFF.RsHiChartVizUtils.chartTitleBuilder(theChartData, chartTitle, chartSubTitle);
			oFF.RsHiChartVizUtils.chartLegendBuilder(theChartData);
			oFF.RsHiChartVizUtils.chartPlotBuilder(theChartData, chartType, plotArea);
		}
	},
	datalabelPloter:function(vizDatalabel, datalabelChart)
	{
			var isDataLabels = vizDatalabel.getBooleanByKeyExt(oFF.VizDefConstants.K_VISIBLE, true);
		var isHideWhenOverlap = vizDatalabel.getBooleanByKeyExt(oFF.VizDefConstants.K_IS_HIDDEN_WHEN_OVERLAP, true);
		var datalabelStyle = vizDatalabel.getStructureByKey(oFF.VizDefConstants.K_STYLE);
		var fontSize = datalabelStyle.getStringByKey(oFF.VizDefConstants.K_FONT_SIZE);
		var fontWeight = datalabelStyle.getStringByKey(oFF.VizDefConstants.K_FONT_WEIGHT);
		var fontFamily = datalabelStyle.getStringByKey(oFF.VizDefConstants.K_FONT_FAMILY);
		var color = datalabelStyle.getStringByKey(oFF.VizDefConstants.K_COLOR);
		datalabelChart.putBoolean(oFF.VizDefConstants.K_ENABLED, isDataLabels);
		datalabelChart.putBoolean(oFF.VizDefConstants.K_HIDE_WHEN_OVERLAP, isHideWhenOverlap);
		var dataLabelsStyle = datalabelChart.putNewStructure(oFF.VizDefConstants.K_STYLE);
		dataLabelsStyle.putString(oFF.VizDefConstants.K_FONT_FAMILY, fontFamily);
		dataLabelsStyle.putString(oFF.VizDefConstants.K_FONT_SIZE, fontSize);
		dataLabelsStyle.putString(oFF.VizDefConstants.K_FONT_WEIGHT, fontWeight);
		if (!oFF.XString.isEqual(color, null))
		{
			dataLabelsStyle.putString("fill", color);
			dataLabelsStyle.putString(oFF.VizDefConstants.K_COLOR, color);
		}
		dataLabelsStyle.putString("textOutline", "0px");
		return datalabelChart;
	},
	addColorGradient:function(globalDef, vizDef, theChartData)
	{
			if (oFF.notNull(vizDef))
		{
			var colorScheme = vizDef.getStructureByKey(oFF.VizDefConstants.K_COLOR_SCHEME);
			var colorSync = globalDef.getStructureByKey(oFF.VizDefConstants.K_COLOR_SYNC);
			if (!vizDef.getStructureByKey(oFF.VizDefConstants.K_CHART).getBooleanByKeyExt(oFF.VizDefConstants.K_IS_EXCLUDE_COLOR_SYNC, false))
			{
				if (oFF.XCollectionUtils.hasElements(colorScheme))
				{
					var palleteDesc = colorScheme.getStructureByKey(oFF.VizDefConstants.K_PALETTE_DESC);
					if (oFF.notNull(palleteDesc))
					{
						var palette = theChartData.putNewStructure(oFF.VizDefConstants.K_PALETTE);
						var keysList = palette.putNewList(oFF.VizDefConstants.K_GRADIENT_KEYS);
						var gradientstruct = palleteDesc.getStructureByKey(oFF.VizDefConstants.K_GRADIENT);
						if (oFF.notNull(gradientstruct))
						{
							var gradientKeys = gradientstruct.getKeysAsReadOnlyListOfString();
							var listofKeys = oFF.XList.create();
							for (var yyy = 0; yyy < gradientKeys.size(); yyy++)
							{
								listofKeys.add(oFF.XDoubleValue.create(oFF.XDouble.convertFromString(gradientKeys.get(yyy))));
							}
							listofKeys.sortByComparator(new oFF.XComparatorDouble());
							for (var yfc = 0; yfc < listofKeys.size(); yfc++)
							{
								keysList.addDouble(listofKeys.get(yfc).getDouble());
							}
							palette.put(oFF.VizDefConstants.K_GRADIENT, gradientstruct);
						}
					}
				}
			}
			var feedStruct;
			var colorSyncColordim;
			var colordimensionId = null;
			var chartObject = vizDef.getStructureByKey(oFF.VizDefConstants.K_CHART);
			if (oFF.notNull(chartObject))
			{
				var bindingsList = chartObject.getListByKey(oFF.VizDefConstants.K_BINDINGS);
				for (var bIndex = 0; bIndex < bindingsList.size(); bIndex++)
				{
					feedStruct = bindingsList.getStructureAt(bIndex);
					if (oFF.XString.isEqual(feedStruct.getStringByKey(oFF.VizDefConstants.K_FEED), oFF.VizDefConstants.K_COLOR))
					{
						var sourceList = feedStruct.getListByKey(oFF.VizDefConstants.K_SOURCE);
						if (sourceList.size() > 0)
						{
							colordimensionId = sourceList.getStructureAt(0).getStringByKey(oFF.VizDefConstants.K_ID);
						}
						break;
					}
				}
				var storyWideSettings = globalDef.getStructureByKey(oFF.VizDefConstants.K_STORY_WIDE_SETTINGS);
				if (oFF.notNull(storyWideSettings))
				{
					var customColorPalette = storyWideSettings.getListByKey(oFF.VizDefConstants.K_CUSTOM_COLOR_PALETTES);
					if (oFF.notNull(customColorPalette))
					{
						var customColorPaletteGradient = customColorPalette.getStructureAt(0).getStructureByKey(oFF.VizDefConstants.K_GRADIENT);
						var strcut = customColorPaletteGradient.getKeysAsReadOnlyListOfString();
						var stopList = oFF.PrFactory.createList();
						for (var oo = 0; oo < strcut.size(); oo++)
						{
							var list = oFF.PrFactory.createList();
							list.addString(strcut.get(oo));
							list.addString(customColorPaletteGradient.getStringByKey(strcut.get(oo)));
							stopList.add(list);
						}
					}
				}
				if (oFF.notNull(colorSync))
				{
					colorSyncColordim = colorSync.getStructureByKey(colordimensionId);
					if (oFF.notNull(colorSyncColordim))
					{
						var explicitColorAssignments = colorSyncColordim.getStructureByKey(oFF.VizDefConstants.K_EXPLICIT_COLOR_ASSIGNMENTS);
						theChartData.put(oFF.VizDefConstants.K_EXPLICIT_COLOR_ASSIGNMENTS, explicitColorAssignments);
					}
				}
			}
		}
	}
};

oFF.RsHiChartVizUtilsCorrelation = {

	create:function()
	{
			return new oFF.RsHiChartVizUtilsCorrelation();
	},
	renderValueAxis:function(axisData, axisDef, bAlignTitle)
	{
			var axisTitle = axisData.putNewStructure(oFF.VizDefConstants.K_TITLE);
		axisData.putInteger(oFF.VizDefConstants.K_GRIDLINE_WIDTH, 0);
		if (oFF.isNull(axisDef))
		{
			return;
		}
		axisData.putBoolean(oFF.VizDefConstants.K_VISIBLE, axisDef.getBooleanByKey(oFF.VizDefConstants.K_VISIBLE));
		var axisLine = axisDef.getStructureByKey(oFF.VizDefConstants.K_AXIS_LINE);
		axisData.putInteger(oFF.VizDefConstants.K_LINE_WIDTH, axisLine.getBooleanByKey(oFF.VizDefConstants.K_VISIBLE) ? 3 : 0);
		axisData.putString(oFF.VizDefConstants.K_LINE_COLOR, "#bbbdbf");
		var axisTick = axisDef.getStructureByKey(oFF.VizDefConstants.K_AXIS_TICK);
		var iTickLen = 0;
		if (oFF.notNull(axisTick) && axisTick.getBooleanByKey(oFF.VizDefConstants.K_VISIBLE))
		{
			iTickLen = axisTick.getIntegerByKey(oFF.VizDefConstants.K_SIZE);
		}
		axisData.putInteger(oFF.VizDefConstants.K_TICK_LENGTH, iTickLen);
		axisData.putString(oFF.VizDefConstants.K_TICK_COLOR, "rgb(166, 168, 171)");
		var axisLabelProperties = axisDef.getStructureByKey(oFF.VizDefConstants.K_LABEL);
		var axisLabel = axisData.putNewStructure(oFF.VizDefConstants.K_LABEL);
		axisLabel.putBoolean(oFF.VizDefConstants.K_ENABLED, axisLabelProperties.getBooleanByKey(oFF.VizDefConstants.K_VISIBLE));
		var labelFont = axisData.putNewStructure(oFF.VizDefConstants.K_STYLE);
		var labelProperties = axisLabelProperties.getStructureByKey(oFF.VizDefConstants.K_STYLE);
		labelFont.putString(oFF.VizDefConstants.K_COLOR, labelProperties.getStringByKey(oFF.VizDefConstants.K_COLOR));
		labelFont.putString(oFF.VizDefConstants.K_FONT_FAMILY, axisLabelProperties.getStringByKey(oFF.VizDefConstants.K_FONT_FAMILY));
		labelFont.putString(oFF.VizDefConstants.K_FONT_SIZE, axisLabelProperties.getStringByKey(oFF.VizDefConstants.K_FONT_SIZE));
		var titleProperties = axisDef.getStructureByKey(oFF.VizDefConstants.K_TITLE);
		axisTitle.putBoolean(oFF.VizDefConstants.K_ENABLED, titleProperties.getBooleanByKey(oFF.VizDefConstants.K_VISIBLE));
		if (bAlignTitle)
		{
			axisTitle.putString(oFF.VizDefConstants.K_ALIGN, oFF.VizDefConstants.V_MIDDLE);
		}
		var axisTitleStyle = axisTitle.putNewStructure(oFF.VizDefConstants.K_STYLE);
		var titleFont = titleProperties.getStructureByKey(oFF.VizDefConstants.K_STYLE);
		axisTitleStyle.putString(oFF.VizDefConstants.K_COLOR, "#000000");
		axisTitleStyle.putString(oFF.VizDefConstants.K_FONT_WEIGHT, oFF.VizDefConstants.K_BOLD);
		labelFont.putString(oFF.VizDefConstants.K_COLOR, titleFont.getStringByKey(oFF.VizDefConstants.K_COLOR));
		labelFont.putString(oFF.VizDefConstants.K_FONT_FAMILY, titleFont.getStringByKey(oFF.VizDefConstants.K_FONT_FAMILY));
		labelFont.putString(oFF.VizDefConstants.K_FONT_SIZE, titleFont.getStringByKey(oFF.VizDefConstants.K_FONT_SIZE));
	},
	legendStyler:function(theChartData)
	{
			var legend = theChartData.putNewStructure(oFF.VizDefConstants.K_LEGEND);
		legend.putBoolean(oFF.VizDefConstants.K_ENABLED, true);
		legend.putBoolean(oFF.VizDefConstants.K_SQUARE_SYMBOL, true);
		legend.putInteger(oFF.VizDefConstants.K_SYMBOL_RADIUS, 0);
		legend.putString(oFF.VizDefConstants.K_LAYOUT, oFF.VizDefConstants.V_HORIZONTAL);
		legend.putString(oFF.VizDefConstants.K_ALIGN, oFF.VizDefConstants.V_CENTER);
		legend.putString(oFF.VizDefConstants.K_VERTICAL_ALIGN, oFF.VizDefConstants.V_POSITION_TOP);
		var legenditemStyle = legend.putNewStructure(oFF.VizDefConstants.K_ITEM_STYLE);
		legenditemStyle.putString(oFF.VizDefConstants.K_FONT_SIZE, "12px");
		legenditemStyle.putString(oFF.VizDefConstants.K_FONT_WEIGHT, oFF.VizDefConstants.V_NORMAL);
		legenditemStyle.putString(oFF.VizDefConstants.K_FONT_SIZE, "12px");
	}
};

oFF.RsHiChartVizUtilsHeatmap = {

	create:function()
	{
			return new oFF.RsHiChartVizUtilsHeatmap();
	},
	rendrerHeatmap:function(theChartData, chartType, vizDef, globalDef)
	{
			var plotOptions = theChartData.getStructureByKey(oFF.VizDefConstants.K_PLOT_OPTIONS);
		if (oFF.isNull(plotOptions))
		{
			plotOptions = theChartData.putNewStructure(oFF.VizDefConstants.K_PLOT_OPTIONS);
		}
		var plotOptionChartTypeStructure = plotOptions.getStructureByKey(chartType);
		plotOptionChartTypeStructure.putBoolean(oFF.VizDefConstants.K_COLOR_BY_POINT, false);
		var chartTypeInfo = theChartData.getStructureByKey(oFF.VizDefConstants.K_CHART);
		chartTypeInfo.putString(oFF.VizDefConstants.K_TYPE, chartType);
		var isInverted = true;
		chartTypeInfo.putBoolean(oFF.VizDefConstants.K_INVERTED, isInverted);
		var colorAxis = theChartData.putNewStructure(oFF.VizDefConstants.K_COLOR_AXIS);
		var paletteChart = theChartData.getStructureByKey(oFF.VizDefConstants.K_PALETTE);
		if (oFF.notNull(paletteChart))
		{
			var thresholdList1 = oFF.PrFactory.createList();
			var altValue = 0;
			var colorInt = "#FFFFFF";
			var gradientKeys = paletteChart.getListByKey(oFF.VizDefConstants.K_GRADIENT_KEYS);
			var gradientStructure = paletteChart.getStructureByKey(oFF.VizDefConstants.K_GRADIENT);
			for (var gk = 0; gk < gradientKeys.size(); gk++)
			{
				var intervalList1 = oFF.PrFactory.createList();
				altValue = gradientKeys.getDoubleAt(gk) / 100;
				colorInt = gradientStructure.getStringByKey(oFF.XDouble.convertToString(gradientKeys.getDoubleAt(gradientKeys.size() - 1 - gk)));
				intervalList1.addDouble(altValue);
				intervalList1.addString(colorInt);
				thresholdList1.add(intervalList1);
			}
			colorAxis.put(oFF.VizDefConstants.K_STOPS, thresholdList1);
		}
		var isHeatmap = oFF.XString.isEqual(chartType, oFF.VizDefConstants.K_HEATMAP);
		if (oFF.notNull(globalDef))
		{
			var intervalStructure = oFF.PrFactory.createStructure();
			var minInterval = 0;
			var gradiantValue = 0;
			var intervalColor = "#FFFFFF";
			var thresholdIntervals = globalDef.getListByKey(oFF.VizDefConstants.K_THRESHOLDS);
			if (oFF.notNull(thresholdIntervals) && isHeatmap)
			{
				var thresholdList = oFF.PrFactory.createList();
				var maxElement = 1;
				if (theChartData.containsKey(oFF.VizDefConstants.K_MAX_ELEMENT))
				{
					maxElement = oFF.XMath.max(oFF.XDouble.convertToInt(theChartData.getDoubleByKey(oFF.VizDefConstants.K_MAX_ELEMENT)), oFF.XDouble.convertToInt(theChartData.getDoubleByKey(oFF.VizDefConstants.K_MAX_ELEMENT)) * -1);
				}
				for (var ti = 0; ti < thresholdIntervals.size(); ti++)
				{
					intervalStructure = thresholdIntervals.getStructureAt(ti);
					var intervalList = oFF.PrFactory.createList();
					minInterval = intervalStructure.getDoubleByKey(oFF.VizDefConstants.K_LOW);
					intervalColor = intervalStructure.getStringByKey(oFF.VizDefConstants.K_COLOR);
					gradiantValue = minInterval / maxElement;
					intervalList.addDouble(gradiantValue);
					intervalList.addString(intervalColor);
					thresholdList.add(intervalList);
				}
				colorAxis.put(oFF.VizDefConstants.K_STOPS, thresholdList);
			}
		}
		var legend = theChartData.getStructureByKey(oFF.VizDefConstants.K_LEGEND);
		var xAxis = oFF.PrFactory.createList();
		var xAxisStruct = oFF.PrFactory.createStructure();
		var yAxis = oFF.PrFactory.createList();
		var yAxisStruct = oFF.PrFactory.createStructure();
		if (isHeatmap)
		{
			xAxis = theChartData.getListByKey(oFF.VizDefConstants.K_X_AXIS);
			if (oFF.isNull(xAxis))
			{
				xAxis = theChartData.putNewList(oFF.VizDefConstants.K_X_AXIS);
				xAxisStruct = xAxis.addNewStructure();
			}
			else
			{
				xAxisStruct = xAxis.getStructureAt(0);
			}
			yAxis = theChartData.getListByKey(oFF.VizDefConstants.K_Y_AXIS);
			if (oFF.isNull(yAxis))
			{
				yAxis = theChartData.putNewList(oFF.VizDefConstants.K_Y_AXIS);
				yAxisStruct = yAxis.addNewStructure();
			}
			else
			{
				yAxisStruct = yAxis.getStructureAt(0);
			}
		}
		var dataLabels = plotOptionChartTypeStructure.getStructureByKey(oFF.VizDefConstants.K_DATA_LABELS);
		var yAxisTitle = yAxisStruct.putNewStructure(oFF.VizDefConstants.K_TITLE);
		var xAxisTitle = xAxisStruct.putNewStructure(oFF.VizDefConstants.K_TITLE);
		yAxisTitle.putString(oFF.VizDefConstants.K_TEXT, "");
		xAxisTitle.putString(oFF.VizDefConstants.K_TEXT, "");
		var minColor = "#a0f3ff";
		var maxColor = "#003c6b";
		var isDataLabels = true;
		if (oFF.notNull(vizDef))
		{
			var colorScheme = vizDef.getStructureByKey(oFF.VizDefConstants.K_COLOR_SCHEME);
			if (oFF.notNull(colorScheme))
			{
				var paletteColors = colorScheme.getListByKey(oFF.VizDefConstants.K_PALETTE_COLORS);
				if (oFF.notNull(paletteColors))
				{
					if (paletteColors.size() > 0)
					{
						maxColor = paletteColors.getStringAt(0);
						minColor = paletteColors.getStringAt(paletteColors.size() - 1);
					}
				}
			}
			var vizProp = vizDef.getStructureByKey(oFF.VizDefConstants.K_CHART).getStructureByKey(oFF.VizDefConstants.K_PROPERTIES);
			if (oFF.notNull(vizProp))
			{
				var vizPropCategoryAxis = vizProp.getStructureByKey(oFF.VizDefConstants.K_CATEGORY_AXIS2);
				if (oFF.notNull(vizPropCategoryAxis))
				{
					xAxisStruct = oFF.RsHiChartUtils.axisPloter(vizPropCategoryAxis, xAxisStruct, chartType, true);
				}
				var vizPropCategoryAxis2 = vizProp.getStructureByKey(oFF.VizDefConstants.K_CATEGORY_AXIS);
				if (oFF.notNull(vizPropCategoryAxis2))
				{
					yAxisStruct = oFF.RsHiChartUtils.axisPloter(vizPropCategoryAxis2, yAxisStruct, chartType, true);
				}
				var vizPlotArea = vizProp.getStructureByKey(oFF.VizDefConstants.K_PLOT_AREA);
				if (oFF.notNull(vizPlotArea))
				{
					dataLabels.putBoolean(oFF.VizDefConstants.K_ENABLED, isDataLabels);
				}
			}
			colorAxis.putString(oFF.VizDefConstants.K_MIN_COLOR, minColor);
			colorAxis.putString(oFF.VizDefConstants.K_MAX_COLOR, maxColor);
			colorAxis.putBoolean(oFF.VizDefConstants.K_REVERSED, false);
		}
		else
		{
			var yAxisLabels = yAxisStruct.putNewStructure(oFF.VizDefConstants.K_LABELS);
			var yAxisLabelsStyle = yAxisLabels.putNewStructure(oFF.VizDefConstants.K_STYLE);
			yAxisLabelsStyle.putString(oFF.VizDefConstants.K_FONT_SIZE, "13px");
			yAxisLabelsStyle.putString(oFF.VizDefConstants.K_FILL, "rgb(166, 168, 171)");
			yAxisLabelsStyle.putString(oFF.VizDefConstants.K_FONT_WEIGHT, oFF.VizDefConstants.V_FONT_WEIGHT_NORMAL);
			xAxisStruct.putString(oFF.VizDefConstants.K_LINE_COLOR, "#FFFFFF");
			var xAxisLabels1 = xAxisStruct.putNewStructure(oFF.VizDefConstants.K_LABELS);
			var xAxisLabelsStyle1 = xAxisLabels1.putNewStructure(oFF.VizDefConstants.K_STYLE);
			xAxisLabelsStyle1.putString(oFF.VizDefConstants.K_FONT_SIZE, "13px");
			xAxisLabelsStyle1.putString(oFF.VizDefConstants.K_FILL, "rgb(166, 168, 171)");
			xAxisLabelsStyle1.putString(oFF.VizDefConstants.K_FONT_WEIGHT, oFF.VizDefConstants.V_FONT_WEIGHT_NORMAL);
			colorAxis.putString(oFF.VizDefConstants.K_MIN_COLOR, minColor);
			colorAxis.putString(oFF.VizDefConstants.K_MAX_COLOR, maxColor);
			colorAxis.putInteger(oFF.VizDefConstants.K_MIN, 1);
		}
		var isTreemap = oFF.XString.isEqual(chartType, oFF.VizDefConstants.K_TREEMAP);
		if (isTreemap)
		{
			plotOptionChartTypeStructure.putString(oFF.VizDefConstants.K_TYPE, chartType);
			var objectLevels = plotOptionChartTypeStructure.putNewList(oFF.VizDefConstants.K_LEVELS);
			var objectLevel1 = objectLevels.addNewStructure();
			objectLevel1.putInteger(oFF.VizDefConstants.K_LEVEL, 1);
			objectLevel1.putInteger(oFF.VizDefConstants.K_BORDER_WIDTH, 6);
			var objectLeveldatalabels = objectLevel1.putNewStructure(oFF.VizDefConstants.K_DATA_LABELS);
			objectLeveldatalabels.putBoolean(oFF.VizDefConstants.K_ENABLED, true);
			objectLeveldatalabels.putString(oFF.VizDefConstants.K_FORMAT, "<div>{point.name}</div><br/>");
			objectLeveldatalabels.putString(oFF.VizDefConstants.K_ALIGN, oFF.VizDefConstants.V_LEFT);
			objectLeveldatalabels.putString(oFF.VizDefConstants.K_VERTICAL_ALIGN, oFF.VizDefConstants.V_POSITION_TOP);
			var objectLeveldatalabelsStyle = objectLeveldatalabels.putNewStructure(oFF.VizDefConstants.K_STYLE);
			objectLeveldatalabelsStyle.putString(oFF.VizDefConstants.K_FONT_SIZE, "14px");
			var objectLevel2 = objectLevels.addNewStructure();
			objectLevel2.putInteger(oFF.VizDefConstants.K_LEVEL, 2);
			var objectLeveldatalabels1 = objectLevel2.putNewStructure(oFF.VizDefConstants.K_DATA_LABELS);
			objectLeveldatalabels1.putBoolean(oFF.VizDefConstants.K_ENABLED, true);
			objectLeveldatalabels1.putString(oFF.VizDefConstants.K_FORMAT, "<div>{point.name}</div><br/><div>{point.valueFormatted}</div >");
			legend.putInteger(oFF.VizDefConstants.K_Y, 25);
		}
		dataLabels.putBoolean(oFF.VizDefConstants.K_ENABLED, isDataLabels);
		dataLabels.putBoolean(oFF.VizDefConstants.K_HIDE_WHEN_OVERLAP, true);
		var dataLabelsStyle = dataLabels.putNewStructure(oFF.VizDefConstants.K_STYLE);
		dataLabelsStyle.putString(oFF.VizDefConstants.K_FONT_FAMILY, "LatoWeb, 'Open Sans', 'Helvetica Neue', Helvetica, Arial, 'sans serif'");
		dataLabelsStyle.putString(oFF.VizDefConstants.K_FONT_SIZE, "10px");
		dataLabelsStyle.putString(oFF.VizDefConstants.K_FONT_WEIGHT, oFF.VizDefConstants.V_FONT_WEIGHT_NORMAL);
		dataLabelsStyle.putString(oFF.VizDefConstants.K_FILL, "black");
		dataLabelsStyle.putString(oFF.VizDefConstants.K_COLOR, "black");
		dataLabelsStyle.putString(oFF.VizDefConstants.K_TEXT_OUTLINE, "0px");
		dataLabels.putString(oFF.VizDefConstants.K_ALIGN, oFF.VizDefConstants.V_CENTER);
		legend.putBoolean(oFF.VizDefConstants.K_ENABLED, true);
		legend.putString(oFF.VizDefConstants.K_LAYOUT, oFF.VizDefConstants.V_VERTICAL);
		legend.putString(oFF.VizDefConstants.K_ALIGN, oFF.VizDefConstants.V_RIGHT);
		legend.putString(oFF.VizDefConstants.K_VERTICAL_ALIGN, oFF.VizDefConstants.V_MIDDLE);
		legend.putInteger("x", 15);
		var legendStyle = legend.putNewStructure(oFF.VizDefConstants.K_STYLE);
		legendStyle.putString(oFF.VizDefConstants.K_FONT_FAMILY, "LatoWeb, 'Open Sans', 'Helvetica Neue', Helvetica, Arial, 'sans serif'");
		return theChartData;
	}
};

oFF.RsHiChartVizUtilsSimple = {

	create:function()
	{
			return new oFF.RsHiChartVizUtilsSimple();
	},
	legendStyler:function(theChartData)
	{
			var legend = theChartData.getStructureByKey(oFF.VizDefConstants.K_LEGEND);
		if (oFF.notNull(legend))
		{
			legend.putBoolean(oFF.VizDefConstants.K_SQUARE_SYMBOL, true);
			legend.putInteger(oFF.VizDefConstants.K_SYMBOL_RADIUS, 0);
			legend.putString(oFF.VizDefConstants.K_LAYOUT, oFF.VizDefConstants.V_HORIZONTAL);
			legend.putString(oFF.VizDefConstants.K_ALIGN, oFF.VizDefConstants.V_CENTER);
			legend.putInteger(oFF.VizDefConstants.K_Y, 20);
			legend.putString(oFF.VizDefConstants.K_VERTICAL_ALIGN, oFF.VizDefConstants.V_POSITION_TOP);
			var legenditemStyle = legend.putNewStructure(oFF.VizDefConstants.K_ITEM_STYLE);
			legenditemStyle.putString(oFF.VizDefConstants.K_FONT_SIZE, "12px");
			legenditemStyle.putString(oFF.VizDefConstants.K_FONT_WEIGHT, oFF.VizDefConstants.V_NORMAL);
			legenditemStyle.putString(oFF.VizDefConstants.K_FONT_SIZE, "12px");
		}
	},
	plotOptionChart:function(yAxis, chartType, stackingTypeN, plotOptions, yNumber, fillColor)
	{
			var yAxisTitle = yAxis.putNewStructure(oFF.VizDefConstants.K_TITLE);
		yAxisTitle.putString(oFF.VizDefConstants.K_TEXT, "");
		yAxis.putInteger(oFF.VizDefConstants.K_GRID_LINE_WIDTH, 0);
		var plotOptionChartTypeStructure;
		plotOptionChartTypeStructure = plotOptions.getStructureByKey(chartType);
		if (yNumber === 1 || oFF.isNull(plotOptionChartTypeStructure))
		{
			plotOptionChartTypeStructure = plotOptions.putNewStructure(chartType);
		}
		if (oFF.XStringUtils.isNotNullAndNotEmpty(stackingTypeN) && !oFF.XString.isEqual(stackingTypeN, "null"))
		{
			plotOptionChartTypeStructure.putString(oFF.VizDefConstants.K_STACKING, stackingTypeN);
		}
		plotOptionChartTypeStructure.putInteger(oFF.VizDefConstants.K_Y_AXIS, yNumber);
		plotOptionChartTypeStructure.putBoolean(oFF.VizDefConstants.K_COLOR_BY_POINT, false);
		plotOptionChartTypeStructure.putDouble(oFF.VizDefConstants.K_POINT_PADDING, 0);
		if (oFF.XString.isEqual(oFF.VizDefConstants.V_CHART_TYPE_BOXPLOT, chartType))
		{
			plotOptionChartTypeStructure.putString(oFF.VizDefConstants.K_FILL_COLOR, fillColor);
			yAxis.putInteger(oFF.VizDefConstants.K_TICK_AMOUNT, 4);
		}
		var dataLabels = plotOptionChartTypeStructure.getStructureByKey(oFF.VizDefConstants.K_DATA_LABELS);
		if (oFF.isNull(dataLabels))
		{
			dataLabels = plotOptionChartTypeStructure.putNewStructure(oFF.VizDefConstants.K_DATA_LABELS);
		}
		oFF.RsHiChartVizUtilsSimple.dataLabelBuilder(dataLabels);
	},
	addReferenceLine:function(vizDef, valueAxisStruct, valueAxis2Struct, colAxis, rowAxis, crs)
	{
			var hasReferenceLines = false;
		var analyticObjects = vizDef.getStructureByKey(oFF.VizDefConstants.K_ANALYTIC_OBJECTS);
		if (oFF.notNull(analyticObjects))
		{
			var referenceLineList = analyticObjects.getListByKey(oFF.VizDefConstants.K_REFERENCELINES);
			if (oFF.notNull(referenceLineList))
			{
				if (referenceLineList.hasElements())
				{
					hasReferenceLines = true;
					for (var i = 0; i < referenceLineList.size(); i++)
					{
						var referenceLine = referenceLineList.getStructureAt(i);
						var referenceLineMarkers = referenceLine.getListByKey(oFF.VizDefConstants.K_MARKERS);
						var referenceLineFeed = referenceLine.getStringByKey(oFF.VizDefConstants.K_FEED);
						for (var qq = 0; qq < referenceLineMarkers.size(); qq++)
						{
							var referenceLineMarkersStruct = referenceLineMarkers.getStructureAt(qq);
							var plotLineValue = 0;
							if (referenceLineMarkersStruct.containsKey(oFF.VizDefConstants.K_DYNAMIC_VALUE))
							{
								var dnStruct = referenceLineMarkersStruct.getStructureByKey(oFF.VizDefConstants.K_DYNAMIC_VALUE);
								var aggType = dnStruct.getStringByKey(oFF.VizDefConstants.K_AGGREGATION_TYPE);
								var measureId = dnStruct.getStructureByKey(oFF.VizDefConstants.K_MEASURE).getStructureByKey(oFF.VizDefConstants.K_ID).getStringByKey(oFF.VizDefConstants.K_ID);
								var colId = colAxis.getTupleIndexForMemberName(measureId);
								if (!oFF.XCollectionUtils.hasElements(colId))
								{
									var rowId = rowAxis.getTupleIndexForMemberName(measureId);
									if (oFF.XCollectionUtils.hasElements(rowId))
									{
										plotLineValue = oFF.RsHiChartVizUtilsSimple.getAggregateValue(rowId, colAxis, aggType, false, crs);
									}
								}
								else
								{
									plotLineValue = oFF.RsHiChartVizUtilsSimple.getAggregateValue(colId, rowAxis, aggType, true, crs);
								}
							}
							else
							{
								plotLineValue = oFF.RsHiChartRenderer.getDoubleValueExtended(referenceLineMarkersStruct, oFF.VizDefConstants.K_VALUE, 0);
							}
							var color = oFF.VizDefConstants.V_BLACK;
							if (referenceLineMarkersStruct.hasStringByKey(oFF.VizDefConstants.K_COLOR))
							{
								color = referenceLineMarkersStruct.getStringByKey(oFF.VizDefConstants.K_COLOR);
							}
							var colorBelow = referenceLineMarkersStruct.getStringByKey("belowColor");
							var colorAbove = referenceLineMarkersStruct.getStringByKey("aboveColor");
							var referenceLineLabel = referenceLineMarkersStruct.getStructureByKey(oFF.VizDefConstants.K_LABEL);
							var text = referenceLineLabel.getStringByKey(oFF.VizDefConstants.K_TEXT);
							var referenceLineLabelStyle = referenceLineLabel.getStructureByKey(oFF.VizDefConstants.K_STYLE);
							if (oFF.XString.isEqual(oFF.VizDefConstants.K_VALUE_AXIS, referenceLineFeed))
							{
								oFF.RsHiChartVizUtilsSimple.ploLineBuilder(valueAxisStruct, plotLineValue, colorBelow, colorAbove, color, text, referenceLineLabelStyle);
							}
							if (oFF.XString.isEqual(oFF.VizDefConstants.K_VALUE_AXIS2, referenceLineFeed))
							{
								oFF.RsHiChartVizUtilsSimple.ploLineBuilder(valueAxis2Struct, plotLineValue, colorBelow, colorAbove, color, text, referenceLineLabelStyle);
							}
						}
					}
				}
			}
		}
		return hasReferenceLines;
	},
	ploLineBuilder:function(yAxis, Value, belowColor, aboveColor, color, text, styleStructure)
	{
			var colorB = "#000000";
		var plotLines = yAxis.containsKey(oFF.VizDefConstants.K_PLOT_LINES) ? yAxis.getListByKey(oFF.VizDefConstants.K_PLOT_LINES) : yAxis.putNewList(oFF.VizDefConstants.K_PLOT_LINES);
		var plotLinepProp = plotLines.addNewStructure();
		if (oFF.notNull(color))
		{
			colorB = color;
		}
		plotLinepProp.putString(oFF.VizDefConstants.K_COLOR, colorB);
		var plotLineslabels = plotLinepProp.putNewStructure(oFF.VizDefConstants.K_LABEL);
		if (oFF.notNull(text))
		{
			plotLineslabels.putString(oFF.VizDefConstants.K_TEXT, text);
		}
		else
		{
			plotLineslabels.putString(oFF.VizDefConstants.K_TEXT, oFF.XDouble.convertToString(Value));
		}
		var plotLinepPropStrucStyle = plotLineslabels.putNewStructure(oFF.VizDefConstants.K_STYLE);
		plotLinepPropStrucStyle.putString(oFF.VizDefConstants.K_COLOR, styleStructure.getStringByKey(oFF.VizDefConstants.K_COLOR));
		plotLinepProp.putString(oFF.VizDefConstants.K_DASH_STYLE, oFF.VizDefConstants.K_SHORT_DOT);
		plotLineslabels.putInteger(oFF.VizDefConstants.K_ROTATION, 0);
		plotLinepProp.putDouble(oFF.VizDefConstants.K_VALUE, Value);
		plotLinepProp.putInteger(oFF.VizDefConstants.K_WIDTH, 2);
		var plotBands = yAxis.containsKey(oFF.VizDefConstants.K_PLOT_BANDS) ? yAxis.getListByKey(oFF.VizDefConstants.K_PLOT_BANDS) : yAxis.putNewList(oFF.VizDefConstants.K_PLOT_BANDS);
		if (oFF.notNull(belowColor))
		{
			var plotBandsProp = plotBands.addNewStructure();
			plotBandsProp.putString(oFF.VizDefConstants.K_COLOR, oFF.RsHiChartVizUtilsSimple.setColorAlpha(belowColor, 0.2));
			plotBandsProp.putDouble(oFF.VizDefConstants.K_FROM, 0);
			plotBandsProp.putDouble(oFF.VizDefConstants.K_TO, Value);
		}
		if (oFF.notNull(aboveColor))
		{
			var plotBandsProp1 = plotBands.addNewStructure();
			plotBandsProp1.putString(oFF.VizDefConstants.K_COLOR, oFF.RsHiChartVizUtilsSimple.setColorAlpha(aboveColor, 0.2));
			plotBandsProp1.putDouble(oFF.VizDefConstants.K_FROM, Value);
			plotBandsProp1.putDouble(oFF.VizDefConstants.K_TO, Value * 100);
		}
	},
	setColorAlpha:function(colorString, alpha)
	{
			var newColor = null;
		var alphaString = oFF.XDouble.convertToString(alpha);
		if (oFF.notNull(colorString))
		{
			if (oFF.XString.startsWith(colorString, "rgb"))
			{
				var end = oFF.XString.indexOf(colorString, ")");
				if (end > 0)
				{
					newColor = oFF.XString.replace(colorString, "rgb", "rgba");
					var alphaToAdd = oFF.XStringUtils.concatenate3(",", alphaString, ")");
					newColor = oFF.XString.replace(newColor, ")", alphaToAdd);
				}
			}
			else if (oFF.XString.isEqual(colorString, "transparent"))
			{
				newColor = oFF.XStringUtils.concatenate3("rgba(255,255,255,", alphaString, ")");
			}
			else
			{
				newColor = colorString;
			}
		}
		return newColor;
	},
	dataLabelBuilder:function(dataLabels)
	{
			var dataLabelsStyle = dataLabels.putNewStructure(oFF.VizDefConstants.K_STYLE);
		dataLabels.putBoolean(oFF.VizDefConstants.K_ENABLED, true);
		dataLabels.putBoolean(oFF.VizDefConstants.K_HIDE_WHEN_OVERLAP, true);
		dataLabels.putString(oFF.VizDefConstants.K_FORMAT, "{point.yFormatted} ");
		dataLabelsStyle.putString(oFF.VizDefConstants.K_FILL, "black");
		dataLabelsStyle.putString(oFF.VizDefConstants.K_COLOR, "black");
		dataLabelsStyle.putString(oFF.VizDefConstants.K_FONT_FAMILY, "LatoWeb, 'Open Sans', 'Helvetica Neue', Helvetica, Arial, 'sans serif'");
		dataLabelsStyle.putString(oFF.VizDefConstants.K_FONT_SIZE, "12px");
		dataLabelsStyle.putString(oFF.VizDefConstants.K_FONT_WEIGHT, oFF.VizDefConstants.V_NORMAL);
		dataLabelsStyle.putString(oFF.VizDefConstants.K_TEXT_OUTLINE, "0px");
	},
	dataLabelAlignment:function(yAxis, chartType, decimalPlaces, showStackingLabel)
	{
			var axisStackLabels = yAxis.putNewStructure(oFF.VizDefConstants.K_STACK_LABELS);
		axisStackLabels.putBoolean(oFF.VizDefConstants.K_ENABLED, showStackingLabel);
		axisStackLabels.putString(oFF.VizDefConstants.K_FORMAT, oFF.XStringUtils.concatenate3("{total:,.", oFF.XInteger.convertToString(decimalPlaces), "f}"));
		if (oFF.XString.isEqual(oFF.VizDefConstants.V_CHART_TYPE_BAR, chartType))
		{
			var stackLabelsStlye = axisStackLabels.putNewStructure(oFF.VizDefConstants.K_STYLE);
			stackLabelsStlye.putString(oFF.VizDefConstants.K_COLOR, "rgb(88,89,91)");
			stackLabelsStlye.putString(oFF.VizDefConstants.K_FONT_SIZE, "12px");
			stackLabelsStlye.putString(oFF.VizDefConstants.K_FONT_STYLE, oFF.VizDefConstants.V_NORMAL);
			stackLabelsStlye.putString(oFF.VizDefConstants.K_FONT_WEIGHT, oFF.VizDefConstants.K_BOLD);
		}
		else if (oFF.XString.isEqual(oFF.VizDefConstants.V_CHART_TYPE_COLUMN, chartType))
		{
			axisStackLabels.putString(oFF.VizDefConstants.K_ALIGN, oFF.VizDefConstants.V_CENTER);
			axisStackLabels.putString(oFF.VizDefConstants.K_VERTICAL_ALIGN, oFF.VizDefConstants.V_POSITION_TOP);
			axisStackLabels.putInteger(oFF.VizDefConstants.K_Y, -20);
			axisStackLabels.putInteger(oFF.VizDefConstants.K_X, 5);
		}
		else
		{
			axisStackLabels.putString(oFF.VizDefConstants.K_ALIGN, oFF.VizDefConstants.V_CENTER);
			axisStackLabels.putInteger(oFF.VizDefConstants.K_Y, -20);
		}
	},
	getAggregateValue:function(indexList, axis, aggType, rowIteration, crs)
	{
			var counter = 0;
		var aggregator = 0;
		for (var i = 0; i < axis.getTuplesCount(); i++)
		{
			if (!axis.getTupleAt(i).isTotal())
			{
				for (var j = 0; j < indexList.size(); j++)
				{
					var index = indexList.get(j).getInteger();
					var curDataCell;
					if (rowIteration)
					{
						curDataCell = crs.getDataCell(index, i);
					}
					else
					{
						curDataCell = crs.getDataCell(i, index);
					}
					if (curDataCell.getValueException() !== oFF.ValueException.NORMAL)
					{
						continue;
					}
					var curValue = curDataCell.getDouble();
					if (counter === 0)
					{
						aggregator = curValue;
					}
					else if (oFF.XString.isEqual(aggType, "max"))
					{
						if (aggregator < curValue)
						{
							aggregator = curValue;
						}
					}
					else if (oFF.XString.isEqual(aggType, "min"))
					{
						if (aggregator > curValue)
						{
							aggregator = curValue;
						}
					}
					else
					{
						aggregator = aggregator + curValue;
					}
					counter++;
				}
			}
		}
		if (oFF.XString.isEqual(aggType, "average") || oFF.XString.isEqual(aggType, "avg"))
		{
			return aggregator / counter;
		}
		return aggregator;
	}
};

oFF.GridRendererFactoryImpl = function() {};
oFF.GridRendererFactoryImpl.prototype = new oFF.XObject();
oFF.GridRendererFactoryImpl.prototype._ff_c = "GridRendererFactoryImpl";

oFF.GridRendererFactoryImpl.create = function()
{
	return new oFF.GridRendererFactoryImpl();
};
oFF.GridRendererFactoryImpl.prototype.newRenderer = function(protocolType)
{
	return oFF.RsSacTableRenderer.createAnalyticsGridRenderer();
};

oFF.SacAnalyticTableExportHelperFactory = function() {};
oFF.SacAnalyticTableExportHelperFactory.prototype = new oFF.XObject();
oFF.SacAnalyticTableExportHelperFactory.prototype._ff_c = "SacAnalyticTableExportHelperFactory";

oFF.SacAnalyticTableExportHelperFactory.create = function()
{
	return new oFF.SacAnalyticTableExportHelperFactory();
};
oFF.SacAnalyticTableExportHelperFactory.prototype.newTableExportHelper = function(table, niceDataSourceTitle)
{
	return oFF.SacAnalyticTableExportHelper.createAnalyticsTableExportHelper(table, niceDataSourceTitle);
};

oFF.SacTableClipboardHelperFactory = function() {};
oFF.SacTableClipboardHelperFactory.prototype = new oFF.XObject();
oFF.SacTableClipboardHelperFactory.prototype._ff_c = "SacTableClipboardHelperFactory";

oFF.SacTableClipboardHelperFactory.create = function()
{
	return new oFF.SacTableClipboardHelperFactory();
};
oFF.SacTableClipboardHelperFactory.prototype.newClipboardHelper = function(analyticsTable)
{
	return oFF.SacAnalyticsTableClipboardHelper.createForAnalytics(analyticsTable);
};

oFF.RsSacTableRenderer = function() {};
oFF.RsSacTableRenderer.prototype = new oFF.XObject();
oFF.RsSacTableRenderer.prototype._ff_c = "RsSacTableRenderer";

oFF.RsSacTableRenderer.createAnalyticsGridRenderer = function()
{
	var newSacTableRenderer = new oFF.RsSacTableRenderer();
	return newSacTableRenderer;
};
oFF.RsSacTableRenderer.prototype.m_tableJson = null;
oFF.RsSacTableRenderer.prototype.m_rowList = null;
oFF.RsSacTableRenderer.prototype.m_renderHelper = null;
oFF.RsSacTableRenderer.prototype.prepareJsonStructure = function()
{
	this.m_tableJson = oFF.PrFactory.createStructure();
	this.m_rowList = this.m_tableJson.putNewList(oFF.SacTableConstants.TD_L_ROWS);
};
oFF.RsSacTableRenderer.prototype.render = function(tableContainer)
{
	var table = tableContainer.getVisualizationData();
	this.prepareJsonStructure();
	var tableJson = this.getTableJson();
	this.m_renderHelper = oFF.SacAnalyticTableWidgetRenderHelper.createAnalyticTableRenderHelper(table);
	if (oFF.isNull(table))
	{
		tableJson = null;
	}
	else
	{
		if (table.isPartial())
		{
			this.m_renderHelper.fillRowsFromList(table.getHeaderRowList(), this.m_rowList, 0, table.isFreezeHeaderRows(), table.getFreezeUpToRow());
			this.m_renderHelper.fillRowsFromList(table.getLocalRowList(), this.m_rowList, table.getCurrentRowsOffset() + table.getHeaderRowList().size(), false, table.getFreezeUpToRow());
			tableJson.putBoolean(oFF.SacTableConstants.TD_B_PARTIAL, true);
		}
		else
		{
			this.m_renderHelper.fillRowsFromList(table.getHeaderRowList(), this.m_rowList, 0, table.isFreezeHeaderRows(), table.getFreezeUpToRow());
			this.m_renderHelper.fillRowsFromList(table.getRowList(), this.m_rowList, table.getHeaderRowList().size(), false, table.getFreezeUpToRow());
			var partialStructure = tableJson.putNewStructure(oFF.SacTableConstants.TD_B_PARTIAL);
			partialStructure.putInteger(oFF.SacTableConstants.TDP_N_TOTAL_ROWS, table.getRowsTotalCount());
			partialStructure.putInteger(oFF.SacTableConstants.TDP_N_ROW_HEIGHT, oFF.SacTableConstants.DF_R_N_HEIGHT);
		}
		this.postRender(table);
		tableJson.putBoolean(oFF.SacTableConstants.TD_B_SCROLL_TO_TOP, false);
	}
	return tableJson;
};
oFF.RsSacTableRenderer.prototype.reHighlight = function(rowMin, rowMax, colMin, colMax, tableContainer)
{
	tableContainer.applyRenderingScope(rowMin, rowMax, colMin, colMax);
	var result = this.reFormat(tableContainer, false);
	tableContainer.resetRenderingScope();
	return result;
};
oFF.RsSacTableRenderer.prototype.reFormat = function(tableContainer, recreateRows)
{
	var table = tableContainer.getVisualizationData();
	var tableJson = null;
	if (oFF.notNull(table) && oFF.notNull(this.m_renderHelper))
	{
		this.prepareJsonStructure();
		if (recreateRows)
		{
			this.m_renderHelper.fillRowsFromList(table.getHeaderRowList(), this.m_rowList, 0, table.isFreezeHeaderRows(), table.getFreezeUpToRow());
			this.m_renderHelper.fillRowsFromList(table.getRowList(), this.m_rowList, table.getHeaderRowList().size(), false, table.getFreezeUpToRow());
		}
		this.postRender(table);
		tableJson = this.getTableJson();
		tableJson.putBoolean(oFF.SacTableConstants.TD_B_PARTIAL, true);
		tableJson.putBoolean(oFF.SacTableConstants.TD_B_SCROLL_TO_TOP, false);
	}
	return tableJson;
};
oFF.RsSacTableRenderer.prototype.getFullRowList = function(table)
{
	var rowList = oFF.XList.create();
	var prRowList = oFF.PrFactory.createList();
	this.m_renderHelper.fillRowsFromList(table.getHeaderRowList(), prRowList, 0, table.isFreezeHeaderRows(), table.getFreezeUpToRow());
	this.m_renderHelper.fillRowsFromListKeepGaps(table.getRowList(), prRowList, table.getHeaderRowList().size());
	for (var i = 0; i < prRowList.size(); i++)
	{
		rowList.add(prRowList.getStructureAt(i));
	}
	return rowList;
};
oFF.RsSacTableRenderer.prototype.postRender = function(table)
{
	var tokenList = null;
	if (oFF.notNull(this.m_renderHelper))
	{
		tokenList = this.m_renderHelper.renderGenericSettings(this.m_tableJson);
		var highlightedCells = table.getEffectiveHighlightedCells();
		if (oFF.XCollectionUtils.hasElements(highlightedCells))
		{
			var highlightingList = this.getTableJson().putNewList(oFF.SacTableConstants.TD_L_HIGHLIGHTED_CELLS);
			oFF.XCollectionUtils.forEach(highlightedCells,  function(cell){
				var struct = highlightingList.addNewStructure();
				struct.putString(oFF.SacTableConstants.HC_S_BACKGROUND_COLOR, cell.getColor());
				struct.putInteger(oFF.SacTableConstants.C_N_X, cell.getColumn());
				struct.putInteger(oFF.SacTableConstants.C_N_Y, cell.getRow());
			}.bind(this));
		}
		this.getTableJson().putInteger(oFF.SacTableConstants.TD_N_DATA_REGION_HEADER_END_ROW, table.getHeaderEndRow());
		var totalRowsDiff = table.getTotalRowDiff();
		if (totalRowsDiff < 0)
		{
			this.getTableJson().putInteger(oFF.SacTableConstants.TD_N_TOTAL_ROWS_DIFF, totalRowsDiff);
		}
		else
		{
			this.getTableJson().remove(oFF.SacTableConstants.TD_N_TOTAL_ROWS_DIFF);
		}
		table.setTotalRowDiff(0);
	}
	return tokenList;
};
oFF.RsSacTableRenderer.prototype.getTableJson = function()
{
	return this.m_tableJson;
};
oFF.RsSacTableRenderer.prototype.releaseObject = function()
{
	this.releaseStaleData();
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.RsSacTableRenderer.prototype.releaseStaleData = function()
{
	this.m_tableJson = null;
	this.m_rowList = null;
};

oFF.FioriGrid = function() {};
oFF.FioriGrid.prototype = new oFF.XObject();
oFF.FioriGrid.prototype._ff_c = "FioriGrid";

oFF.FioriGrid.MAGIC_CELL_DIV = "/";
oFF.FioriGrid.create = function(resultSet)
{
	var grid = new oFF.FioriGrid();
	grid.setupGrid(resultSet);
	return grid;
};
oFF.FioriGrid.prototype.m_cells = null;
oFF.FioriGrid.prototype.m_rowDefs = null;
oFF.FioriGrid.prototype.m_colDefs = null;
oFF.FioriGrid.prototype.m_fixedWidth = 0;
oFF.FioriGrid.prototype.m_fixedHeight = 0;
oFF.FioriGrid.prototype.m_resultSet = null;
oFF.FioriGrid.prototype.m_semStyles = null;
oFF.FioriGrid.prototype.m_withDetails = false;
oFF.FioriGrid.prototype.m_fixedHeightOff = 0;
oFF.FioriGrid.prototype.m_fixedWidthOff = 0;
oFF.FioriGrid.prototype.m_offsetRows = 0;
oFF.FioriGrid.prototype.m_offsetColumns = 0;
oFF.FioriGrid.prototype.m_suppressRepetition = true;
oFF.FioriGrid.prototype.m_suppress_unit = null;
oFF.FioriGrid.prototype.setupGrid = function(resultSet)
{
	this.m_resultSet = resultSet;
	this.m_withDetails = true;
	this.m_semStyles = oFF.XHashMapOfStringByString.create();
};
oFF.FioriGrid.prototype.releaseObject = function()
{
	if (oFF.notNull(this.m_cells))
	{
		var size0 = this.m_cells.size0();
		for (var x = 0; x < size0; x++)
		{
			var size1 = this.m_cells.size1();
			for (var y = 0; y < size1; y++)
			{
				var cell = this.m_cells.getByIndices(x, y);
				if (oFF.notNull(cell))
				{
					oFF.XObjectExt.release(cell);
					this.m_cells.setByIndices(x, y, null);
				}
			}
		}
		oFF.XObjectExt.release(this.m_cells);
		this.m_cells = null;
	}
	this.m_colDefs = null;
	this.m_rowDefs = null;
	this.m_resultSet = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.FioriGrid.prototype.prepareCellStructure = function()
{
	if (oFF.isNull(this.m_cells) && oFF.notNull(this.m_resultSet))
	{
		this.prepareStructure();
	}
};
oFF.FioriGrid.prototype.prepareStructure = function()
{
	var columnsAxis = this.m_resultSet.getColumnsAxis();
	var colMaxCount = oFF.XMath.max(columnsAxis.getDataCount(), columnsAxis.getTuplesCount());
	var rowsAxis = this.m_resultSet.getRowsAxis();
	this.m_fixedHeight = oFF.XMath.max(this.getEffectiveFieldSizeCol(columnsAxis), this.getEffectiveFieldSizeRow(rowsAxis) === 0 ? 0 : 1);
	var rowDataCount = rowsAxis.getDataCount();
	var rowTupleCount = rowsAxis.getTuplesCount();
	var rowMaxCount = oFF.XMath.max(rowDataCount, rowTupleCount);
	this.m_fixedWidth = oFF.XMath.max(this.getEffectiveFieldSizeRow(rowsAxis), 1);
	var totalColumns = this.m_fixedWidth + colMaxCount;
	var totalRows = this.m_fixedHeight + rowMaxCount;
	this.m_offsetColumns = this.m_resultSet.getQueryManager().getOffsetColumns();
	this.m_offsetRows = this.m_resultSet.getQueryManager().getOffsetRows();
	this.m_cells = oFF.XArray2Dim.create(totalColumns, totalRows);
	this.m_rowDefs = oFF.XList.create();
	this.m_colDefs = oFF.XList.create();
	for (var x = 0; x < totalColumns; x++)
	{
		this.m_colDefs.add(oFF.FioriLineDef.create());
	}
	for (var y = 0; y < totalRows; y++)
	{
		this.m_rowDefs.add(oFF.FioriLineDef.create());
	}
	this.setTitleCells(rowsAxis, oFF.XMath.max(this.m_fixedHeight - 1, 0), columnsAxis.getRsDimensions().isEmpty());
	this.setTitleCells(columnsAxis, oFF.XMath.max(this.m_fixedWidth - 1, 0), rowsAxis.getRsDimensions().isEmpty());
	var fixedHeight = this.m_fixedHeight - this.m_fixedHeightOff;
	this.setHeaderCells(rowsAxis, fixedHeight);
	var fixedWidth = this.m_fixedWidth - this.m_fixedWidthOff;
	this.setHeaderCells(columnsAxis, fixedWidth);
	this.setDataCells();
};
oFF.FioriGrid.prototype.getMaxDisplayLevel = function(columns, rsDim)
{
	var tuplesCount = columns.getTuplesCount();
	var result = 0;
	for (var tupleIndex = 0; tupleIndex < tuplesCount; tupleIndex++)
	{
		var tuple = columns.getTupleAt(tupleIndex);
		result = oFF.XMath.max(result, tuple.getTupleElementByDimension(rsDim).getDisplayLevel());
	}
	return result;
};
oFF.FioriGrid.prototype.getEffectiveFieldSizeCol = function(axis)
{
	var effectiveSize = 0;
	var rsDimensions = axis.getRsDimensions();
	var dimensionSize = rsDimensions.size();
	for (var idxDim = 0; idxDim < dimensionSize; idxDim++)
	{
		effectiveSize = effectiveSize + rsDimensions.get(idxDim).getResultSetFields().size();
		effectiveSize = effectiveSize + this.getMaxDisplayLevel(axis, rsDimensions.get(idxDim));
	}
	return effectiveSize;
};
oFF.FioriGrid.prototype.getEffectiveFieldSizeRow = function(axis)
{
	var effectiveSize = 0;
	var rsDimensions = axis.getRsDimensions();
	var dimensionSize = rsDimensions.size();
	for (var idxDim = 0; idxDim < dimensionSize; idxDim++)
	{
		effectiveSize = effectiveSize + rsDimensions.get(idxDim).getResultSetFields().size();
	}
	return effectiveSize;
};
oFF.FioriGrid.prototype.setTitleCells = function(axis, offset, complementaryAxisEmpty)
{
	var type = axis.getType();
	var rsDimensions = axis.getRsDimensions();
	var position = 0;
	var buffer = oFF.XStringBuffer.create();
	var bufferDV = oFF.XStringBuffer.create();
	var dimSize = rsDimensions.size();
	for (var idxDim = 0; idxDim < dimSize; idxDim++)
	{
		var rsDimension = rsDimensions.get(idxDim);
		var visibleFields = rsDimension.getResultSetFields();
		var fieldSize = visibleFields.size();
		for (var idxField = 0; idxField < fieldSize; idxField++)
		{
			var fieldName = visibleFields.get(idxField).getName();
			if (oFF.XStringUtils.isNullOrEmpty(rsDimension.getName()))
			{
				buffer.append("[").append(fieldName).append("]");
			}
			else
			{
				if (idxField === 0)
				{
					bufferDV.append(rsDimension.getText());
				}
				if (rsDimension.isMeasureStructure())
				{
					if (idxField === 0)
					{
						buffer.append("Measures");
					}
				}
				else if (rsDimension.isStructure())
				{
					if (idxField === 0)
					{
						buffer.append("Structure");
					}
				}
				else
				{
					if (idxField === 0)
					{
						buffer.append(rsDimension.getName()).append(".[");
					}
					else
					{
						buffer.append("[");
					}
					buffer.append(fieldName).append("]");
				}
			}
			if (type === oFF.AxisType.ROWS)
			{
				if (!(rsDimension.isStructure() && dimSize === idxDim + 1))
				{
					var titleCell = oFF.FioriGridCell.create(buffer.toString(), oFF.FioriCellType.TITLE);
					titleCell.setDisplayValue(bufferDV.toString());
					var extName1 = this.m_resultSet.getQueryModel().getDimensionByName(rsDimension.getName()).getExternalName();
					if (oFF.notNull(extName1))
					{
						titleCell.setDimension(extName1);
					}
					else
					{
						titleCell.setDimension(rsDimension.getName());
					}
					titleCell.setRow(offset);
					titleCell.setColumn(position);
					this.setCell(position, offset, titleCell);
				}
			}
			else
			{
				if (!(rsDimension.isStructure() && dimSize === idxDim + 1))
				{
					var existingCell = this.m_cells.getByIndices(offset, position);
					if (oFF.notNull(existingCell))
					{
						var simpleName = buffer.toString();
						buffer.clear();
						bufferDV.clear();
						buffer.append(existingCell.toString());
						buffer.append(oFF.FioriGrid.MAGIC_CELL_DIV);
						buffer.append(simpleName);
						bufferDV.append(existingCell.getDisplayValue());
						if (idxField === 0 && !rsDimension.isStructure())
						{
							bufferDV.append(oFF.FioriGrid.MAGIC_CELL_DIV);
							bufferDV.append(rsDimension.getText());
						}
					}
					var titCell = oFF.FioriGridCell.create(buffer.toString(), oFF.FioriCellType.TITLE);
					titCell.setRow(position);
					titCell.setColumn(offset);
					titCell.setDisplayValue(bufferDV.toString());
					if (oFF.notNull(existingCell))
					{
						titCell.setDimension(existingCell.getDimension());
						var extName2 = this.m_resultSet.getQueryModel().getDimensionByName(rsDimension.getName()).getExternalName();
						if (oFF.notNull(extName2))
						{
							titCell.setDimensionOther(extName2);
						}
						else
						{
							titCell.setDimensionOther(rsDimension.getName());
						}
					}
					else
					{
						var extNameO = this.m_resultSet.getQueryModel().getDimensionByName(rsDimension.getName()).getExternalName();
						if (oFF.notNull(extNameO))
						{
							titCell.setDimension(extNameO);
						}
						else
						{
							titCell.setDimension(rsDimension.getName());
						}
					}
					this.setCell(offset, position, titCell);
				}
				else if (complementaryAxisEmpty)
				{
					this.m_fixedWidthOff = 1;
				}
			}
			buffer.clear();
			bufferDV.clear();
			position++;
		}
	}
};
oFF.FioriGrid.prototype.setDataCells = function()
{
	var readinessStates = this.m_resultSet.getInputReadinessStates();
	var dc = this.m_resultSet.getDataColumns();
	var dr = this.m_resultSet.getDataRows();
	var sb = oFF.XStringBuffer.create();
	for (var y = 0; y < dr; y++)
	{
		for (var x = 0; x < dc; x++)
		{
			var dataCell = this.m_resultSet.getDataCell(x, y);
			var cell;
			if (this.m_withDetails)
			{
				cell = oFF.FioriGridCell.create(this.getCellValueWithDetails(dataCell, readinessStates), oFF.FioriCellType.DATA);
			}
			else
			{
				cell = oFF.FioriGridCell.create(this.getCellValue(this.formatDataCellValue(dataCell), dataCell), oFF.FioriCellType.DATA);
			}
			sb.clear();
			this.appendPrefixValueSuffix(dataCell.getCurrencyUnit(), dataCell, sb);
			cell.setDisplayValue(sb.toString());
			cell.setAlertLevel(dataCell.getMaxAlertLevel().getName());
			cell.setDocumentId(dataCell.getDocumentId());
			cell.setInput(dataCell.isDataEntryEnabled());
			var rsDC = dataCell.getDataCell();
			if (oFF.notNull(rsDC))
			{
				sb.clear();
				var refStr = rsDC.getReferenceStructureElement1();
				if (oFF.notNull(refStr))
				{
					sb.append("mem-");
					sb.append(refStr.getFieldValue(refStr.getDimension().getDisplayKeyField()).getString());
					if (refStr.getFieldValue(refStr.getDimension().getDisplayKeyField()) !== null)
					{
						cell.setMember(refStr.getFieldValue(refStr.getDimension().getDisplayKeyField()).getString());
					}
					else
					{
						cell.setMember(refStr.getName());
					}
				}
				refStr = rsDC.getReferenceStructureElement2();
				if (oFF.notNull(refStr))
				{
					sb.append("-mem-");
					sb.append(refStr.getFieldValue(refStr.getDimension().getDisplayKeyField()).getString());
					if (refStr.getFieldValue(refStr.getDimension().getDisplayKeyField()) !== null)
					{
						cell.setMember2(refStr.getFieldValue(refStr.getDimension().getDisplayKeyField()).getString());
					}
					else
					{
						cell.setMember(refStr.getName());
					}
				}
				var s3 = dataCell.getDocumentId();
				if (oFF.XStringUtils.isNotNullAndNotEmpty(s3))
				{
					cell.setDataValueId(oFF.XStringUtils.concatenate3("docId", "-", s3));
				}
			}
			cell.setRow(y + this.m_fixedHeight - this.m_fixedHeightOff + this.m_offsetRows);
			cell.setColumn(x + this.m_fixedWidth - this.m_fixedWidthOff + this.m_offsetColumns);
			this.setCell(x + this.m_fixedWidth - this.m_fixedWidthOff, y + this.m_fixedHeight - this.m_fixedHeightOff, cell);
		}
	}
};
oFF.FioriGrid.prototype.formatDataCellValue = function(dataCell)
{
	return dataCell.getFormattedValue();
};
oFF.FioriGrid.prototype.getCellValueWithDetails = function(dataCell, readinessStates)
{
	var sb = oFF.XStringBuffer.create();
	var qDataCell = dataCell.getDataCell();
	if (oFF.notNull(qDataCell))
	{
		sb.append("(DataCell->").append(qDataCell.getName()).append(")");
	}
	var decimalPlaces = dataCell.getDecimalPlaces();
	if (decimalPlaces !== 0)
	{
		sb.append("(Decimal Places=").appendInt(decimalPlaces).append(")");
	}
	if (dataCell.isDataEntryEnabled())
	{
		sb.append("I:");
	}
	if (dataCell.isValueLocked())
	{
		sb.append("L:");
	}
	var currencyUnit = dataCell.getCurrencyUnit();
	this.appendPrefixValueSuffix(currencyUnit, dataCell, sb);
	this.appendValueException(dataCell, sb);
	this.appendAlertLevel(dataCell, sb);
	this.appendValueChanged(dataCell, sb);
	sb.append("|").append(dataCell.getValueType().getName());
	sb.append("|").append(dataCell.getFormatString());
	this.appendCurrencyUnit(currencyUnit, sb);
	this.appendInputReadiness(dataCell, readinessStates, sb);
	return sb.toString();
};
oFF.FioriGrid.prototype.appendPrefixValueSuffix = function(currencyUnit, dataCell, sb)
{
	if (oFF.notNull(currencyUnit) && oFF.XString.compare(this.m_suppress_unit, currencyUnit.getFormatted()) === 0)
	{
		sb.append(this.formatDataCellValue(dataCell));
	}
	else
	{
		if (oFF.notNull(currencyUnit) && currencyUnit.hasPrefix())
		{
			sb.append(currencyUnit.getPrefix()).append(" ");
		}
		sb.append(this.formatDataCellValue(dataCell));
		if (oFF.notNull(currencyUnit) && currencyUnit.hasSuffix())
		{
			sb.append(" ").append(currencyUnit.getSuffix());
		}
	}
};
oFF.FioriGrid.prototype.appendValueException = function(dataCell, sb)
{
	var valueException = dataCell.getValueException();
	if (valueException !== oFF.ValueException.NORMAL)
	{
		sb.append("|");
		if (oFF.isNull(valueException))
		{
			sb.append("<null>");
		}
		else
		{
			sb.append(valueException.getName());
		}
	}
};
oFF.FioriGrid.prototype.appendInputReadiness = function(dataCell, readinessStates, sb)
{
	var queryManager = dataCell.getQueryModel().getQueryManager();
	if (queryManager.supportsInputReadinessStates() && dataCell.getQueryModel().isDataEntryEnabled())
	{
		var inputReadinessState = dataCell.getInputReadinessState();
		if (oFF.notNull(inputReadinessState))
		{
			var readinessState = readinessStates.get(inputReadinessState.getIndex());
			var inputReadinessTypes = readinessState.getInputReadinessTypes();
			var types = oFF.XListOfString.create();
			for (var i = 0; i < inputReadinessTypes.size(); i++)
			{
				types.add(inputReadinessTypes.get(i).getShortcut());
			}
			sb.append("|S:").append(oFF.XCollectionUtils.join(types, ","));
		}
	}
};
oFF.FioriGrid.prototype.appendAlertLevel = function(dataCell, sb)
{
	var maxAlertLevel = dataCell.getMaxAlertLevel();
	if (maxAlertLevel !== oFF.AlertLevel.NORMAL)
	{
		sb.append("|[");
		sb.append(oFF.isNull(maxAlertLevel) ? "<null>" : maxAlertLevel.getName());
		sb.append("]");
	}
};
oFF.FioriGrid.prototype.appendValueChanged = function(dataCell, sb)
{
	if (dataCell.isValueChanged())
	{
		sb.append("|N:");
		var newValue = dataCell.getXValue();
		if (oFF.isNull(newValue))
		{
			sb.append("<null>");
		}
		else
		{
			sb.append(newValue.getValueType().getName());
			if (newValue.getValueType() === oFF.XValueType.STRING)
			{
				sb.append(" ").append(newValue.getString());
			}
		}
	}
	if (dataCell.isNewValueForced())
	{
		sb.append("|F:");
	}
};
oFF.FioriGrid.prototype.appendCurrencyUnit = function(currencyUnit, sb)
{
	if (oFF.notNull(currencyUnit) && !currencyUnit.isEmpty())
	{
		sb.append("|");
		if (currencyUnit.isMixed())
		{
			sb.append("M:");
		}
		else if (currencyUnit.hasUnit())
		{
			sb.append("U:");
		}
		else if (currencyUnit.hasCurrency())
		{
			sb.append("C:");
		}
		if (currencyUnit.hasFormatted())
		{
			sb.append(currencyUnit.getFormatted());
		}
		else
		{
			sb.append("<null>");
		}
	}
};
oFF.FioriGrid.prototype.getCellValue = function(formattedValue, dataCell)
{
	var valueException = dataCell.getValueException();
	if (valueException === oFF.ValueException.NULL_VALUE || valueException === oFF.ValueException.UNDEFINED)
	{
		return "";
	}
	var exceptionText = null;
	if (valueException !== oFF.ValueException.NORMAL && valueException !== oFF.ValueException.ZERO)
	{
		exceptionText = valueException.getName();
	}
	var alertLevelText = null;
	var maxAlertLevel = dataCell.getMaxAlertLevel();
	if (maxAlertLevel !== oFF.AlertLevel.NORMAL)
	{
		alertLevelText = maxAlertLevel.getName();
	}
	if (oFF.notNull(exceptionText) || oFF.notNull(alertLevelText))
	{
		var buffer = oFF.XStringBuffer.create();
		buffer.append(formattedValue);
		if (oFF.notNull(alertLevelText))
		{
			buffer.append(" [").append(alertLevelText).append("]");
		}
		if (oFF.notNull(exceptionText))
		{
			buffer.append(" [").append(exceptionText).append("]");
		}
		return buffer.toString();
	}
	return formattedValue;
};
oFF.FioriGrid.prototype.setHeaderCells = function(axis, tupleOffset)
{
	var rsDimensions = axis.getRsDimensions();
	var axisType = axis.getType();
	var tuplesCount = axis.getTuplesCount();
	var formattedValue = oFF.XStringBuffer.create();
	var displayValue = oFF.XStringBuffer.create();
	var isColAxis = axis.getType() === oFF.AxisType.COLUMNS;
	for (var tupleIndex = 0; tupleIndex < tuplesCount; tupleIndex++)
	{
		var tuple = axis.getTupleAt(tupleIndex);
		var position = 0;
		var tupleSize = tuple.size();
		for (var tupleElementIndex = 0; tupleElementIndex < tupleSize; tupleElementIndex++)
		{
			var rsDimension = rsDimensions.get(tupleElementIndex);
			var element = tuple.get(tupleElementIndex);
			var adjustDispLevel = isColAxis ? element.getDisplayLevel() : 0;
			var rsVisibleFields = rsDimension.getResultSetFields();
			var visibleFieldCount = rsVisibleFields.size();
			var dimensionMember = element.getDimensionMember();
			formattedValue.clear();
			var maxDispLevel = isColAxis && visibleFieldCount > 0 ? this.getMaxDisplayLevel(axis, rsDimension) : 0;
			if (isColAxis && visibleFieldCount > 0 && maxDispLevel > 0)
			{
				for (var fillIndex = 0; fillIndex <= maxDispLevel; ++fillIndex)
				{
					var fillCell = oFF.FioriGridCell.create("", oFF.FioriCellType.HEADER);
					fillCell.setDisplayValue("");
					var extName3 = this.m_resultSet.getQueryModel().getDimensionByName(rsDimension.getName()).getExternalName();
					if (oFF.notNull(extName3))
					{
						fillCell.setDimension(extName3);
					}
					else
					{
						fillCell.setDimension(rsDimension.getName());
					}
					if (dimensionMember.getName() !== null && rsDimension.isStructure() && dimensionMember.getDimension().getStructureMember(dimensionMember.getName()).getFieldValue(dimensionMember.getDimension().getDisplayKeyField()) !== null)
					{
						fillCell.setMember(dimensionMember.getDimension().getStructureMember(dimensionMember.getName()).getFieldValue(dimensionMember.getDimension().getDisplayKeyField()).getString());
					}
					else
					{
						fillCell.setMember(dimensionMember.getName());
					}
					fillCell.setRow(position + fillIndex);
					fillCell.setColumn(tupleIndex + tupleOffset);
					this.setCell(tupleIndex + tupleOffset, position + fillIndex, fillCell);
				}
			}
			for (var fieldIndex = 0; fieldIndex < visibleFieldCount; fieldIndex++)
			{
				var fieldValue = dimensionMember.getAllFieldValues().getByKey(rsVisibleFields.get(fieldIndex).getName());
				formattedValue.append(this.formatFieldValue(fieldValue));
				displayValue.append(this.formatFieldValue(fieldValue));
				if (fieldIndex === 0)
				{
					this.prependToFirstField(element, formattedValue);
					this.appendAlertLevelToValue(element, formattedValue);
				}
				var gridCell = oFF.FioriGridCell.create(formattedValue.toString(), oFF.FioriCellType.HEADER);
				if (!this.m_suppressRepetition || element.getFirstTuple() === tuple)
				{
					gridCell.setDisplayValue(displayValue.toString());
				}
				var extName5 = this.m_resultSet.getQueryModel().getDimensionByName(rsDimension.getName()).getExternalName();
				if (oFF.notNull(extName5))
				{
					gridCell.setDimension(extName5);
				}
				else
				{
					gridCell.setDimension(rsDimension.getName());
				}
				if (rsDimension.isStructure() && dimensionMember.getDimension().getStructureMember(dimensionMember.getName()).getFieldValue(dimensionMember.getDimension().getDisplayKeyField()) !== null)
				{
					gridCell.setMember(dimensionMember.getDimension().getStructureMember(dimensionMember.getName()).getFieldValue(dimensionMember.getDimension().getDisplayKeyField()).getString());
					var sM = gridCell.getMember();
					if (oFF.notNull(sM))
					{
						gridCell.setSemantic(this.m_semStyles.getByKey(sM));
					}
				}
				else
				{
					gridCell.setMember(dimensionMember.getName());
				}
				if (axis === this.m_resultSet.getRowsAxis())
				{
					gridCell.setRowTupleIndex(tupleIndex);
				}
				else
				{
					gridCell.setColumnTupleIndex(tupleIndex);
				}
				if (fieldIndex === 0 && element.getFirstTuple() === tuple)
				{
					gridCell.setDisplayLevel(isColAxis ? 0 : element.getDisplayLevel());
					var drillState = element.getDrillState();
					var icon = "";
					if (drillState === oFF.DrillState.EXPANDED || drillState === oFF.DrillState.DRILLED)
					{
						gridCell.setDrillState("Expanded");
						if (rsDimension.getLowerLevelNodeAlignment() === oFF.Alignment.CHILDREN_ABOVE_PARENT)
						{
							if (axisType === oFF.AxisType.ROWS)
							{
								icon = "sap-icon://slim-arrow-up";
							}
							else
							{
								icon = "sap-icon://slim-arrow-left";
							}
						}
						else
						{
							if (axisType === oFF.AxisType.ROWS)
							{
								icon = "sap-icon://slim-arrow-down";
							}
							else
							{
								icon = "sap-icon://slim-arrow-down";
							}
						}
					}
					else if (drillState === oFF.DrillState.COLLAPSED || drillState === oFF.DrillState.LEAF_UDH_EXPAND_ALLOWED)
					{
						gridCell.setDrillState("Collapsed");
						if (rsDimension.getLowerLevelNodeAlignment() === oFF.Alignment.CHILDREN_ABOVE_PARENT)
						{
							if (axisType === oFF.AxisType.ROWS)
							{
								icon = "sap-icon://slim-arrow-right";
							}
							else
							{
								icon = "sap-icon://slim-arrow-up";
							}
						}
						else
						{
							if (axisType === oFF.AxisType.ROWS)
							{
								icon = "sap-icon://slim-arrow-right";
							}
							else
							{
								icon = "sap-icon://slim-arrow-right";
							}
						}
					}
					else
					{
						gridCell.setDrillState("None");
						icon = "";
					}
					gridCell.setIcon(icon);
				}
				var sMember = gridCell.getMember();
				if (oFF.notNull(sMember) && this.m_semStyles.getByKey(sMember) !== null)
				{
					gridCell.setSemantic(this.m_semStyles.getByKey(sMember));
				}
				formattedValue.clear();
				displayValue.clear();
				this.addCell(axisType, position + adjustDispLevel, tupleIndex, tupleOffset, gridCell);
				position++;
			}
		}
	}
};
oFF.FioriGrid.prototype.formatFieldValue = function(fieldValue)
{
	if (oFF.isNull(fieldValue))
	{
		return "";
	}
	else
	{
		if (fieldValue.getValueType() === oFF.XValueType.DOUBLE)
		{
			var value = fieldValue.getDouble();
			return oFF.XNumberFormatter.formatDoubleToString(value, "#.0000");
		}
		else
		{
			return fieldValue.getFormattedValue();
		}
	}
};
oFF.FioriGrid.prototype.appendAlertLevelToValue = function(element, formattedValue)
{
	if (oFF.XStringUtils.isNotNullAndNotEmpty(element.getExceptionName()))
	{
		formattedValue.append(" [").appendInt(element.getAlertLevel()).append("]");
	}
};
oFF.FioriGrid.prototype.prependToFirstField = function(element, formattedValue)
{
	var displayLevel = element.getDisplayLevel();
	var drillState = element.getDrillState();
	if (displayLevel > 0 || drillState !== oFF.DrillState.LEAF)
	{
		var oldValue = formattedValue.toString();
		formattedValue.clear();
		for (var i = 0; i < displayLevel; i++)
		{
			formattedValue.append("  ");
		}
		if (drillState === oFF.DrillState.COLLAPSED || drillState === oFF.DrillState.LEAF_DRILLDOWN_ALLOWED || drillState === oFF.DrillState.LEAF_UDH_EXPAND_ALLOWED || drillState === oFF.DrillState.COLLAPSED_EXPAND_AND_DRILLDOWN_ALLOWED)
		{
			formattedValue.append("+ ");
		}
		else if (drillState === oFF.DrillState.EXPANDED || drillState === oFF.DrillState.DRILLED || drillState === oFF.DrillState.LEAF_UDH)
		{
			formattedValue.append("- ");
		}
		formattedValue.append(oldValue);
	}
};
oFF.FioriGrid.prototype.addCell = function(axisType, position, tupleIndex, tupleOffset, cell)
{
	if (axisType === oFF.AxisType.ROWS)
	{
		cell.setRow(tupleIndex + tupleOffset + this.m_offsetRows);
		cell.setColumn(position);
		this.setCell(position, tupleIndex + tupleOffset, cell);
	}
	else
	{
		cell.setRow(position);
		cell.setColumn(tupleIndex + tupleOffset + this.m_offsetColumns);
		this.setCell(tupleIndex + tupleOffset, position, cell);
	}
};
oFF.FioriGrid.prototype.setCell = function(x, y, cell)
{
	if (this.m_rowDefs.get(y).hasTotals() || this.m_colDefs.get(x).hasTotals())
	{
		cell.setIsTotal(true);
	}
	this.m_cells.setByIndices(x, y, cell);
};
oFF.FioriGrid.prototype.getColumnCount = function()
{
	return this.m_cells.size0();
};
oFF.FioriGrid.prototype.getRowCount = function()
{
	return this.m_cells.size1();
};
oFF.FioriGrid.prototype.getFixedColumnsCount = function()
{
	return this.m_fixedWidth;
};
oFF.FioriGrid.prototype.getFixedRowsCount = function()
{
	return this.m_fixedHeight;
};
oFF.FioriGrid.prototype.getColumnMaxCharacters = function(column, rowStart, maxRowCount)
{
	var max = 0;
	var totalRows = this.m_cells.size1();
	var rowCounter = 0;
	for (var row = rowStart; row < totalRows && (maxRowCount === -1 || rowCounter < maxRowCount); row++)
	{
		var cell = this.m_cells.getByIndices(column, row);
		if (oFF.notNull(cell))
		{
			max = oFF.XMath.max(cell.getCharacterCount(), max);
		}
		rowCounter++;
	}
	return max;
};
oFF.FioriGrid.prototype.getSimpleCell = function(column, row)
{
	return this.m_cells.getByIndices(column, row);
};
oFF.FioriGrid.prototype.setSuppressUnit = function(unit)
{
	this.m_suppress_unit = unit;
};
oFF.FioriGrid.prototype.addSemanticStyle = function(member, semantic)
{
	this.m_semStyles.put(member, semantic);
};
oFF.FioriGrid.prototype.exportToFireflyGrid = function(suppressRepetition)
{
	this.m_suppressRepetition = suppressRepetition;
	this.prepareCellStructure();
	var colCount = this.getColumnCount();
	var rowCount = this.getRowCount();
	var fixedRows = this.getFixedRowsCount();
	var fixedCols = this.getFixedColumnsCount();
	var layer1 = oFF.PrFactory.createStructure();
	layer1.putString("Type", "Grid");
	layer1.putString("ApplicationName", this.m_resultSet.getApplication().getApplicationName());
	layer1.putInteger("RowCount", rowCount);
	layer1.putInteger("ColCount", colCount);
	layer1.putInteger("FixedRows", fixedRows);
	layer1.putInteger("FixedColumns", fixedCols);
	var layer1Cells = layer1.putNewList("Cells");
	for (var y = 0; y < rowCount; y++)
	{
		for (var x = 0; x < colCount; x++)
		{
			var gridCell = this.getSimpleCell(x, y);
			if (oFF.notNull(gridCell))
			{
				var cell = layer1Cells.addNewStructure();
				cell.putString("Type", "Text");
				cell.putString("DisplayValue", gridCell.getDisplayValue());
				cell.putString("Value", gridCell.getText(-1));
				cell.putInteger("Row", gridCell.getRow());
				cell.putInteger("Column", gridCell.getColumn());
				cell.putString("DrillState", gridCell.getDrillState());
				cell.putString("DataValueId", gridCell.getDataValueId());
				cell.putInteger("DisplayLevel", gridCell.getDisplayLevel());
				cell.putInteger("RowTupleIndex", gridCell.getRowTupleIndex());
				cell.putInteger("ColumnTupleIndex", gridCell.getColumnTupleIndex());
				cell.putInteger("TupleIndex", gridCell.getRowTupleIndex() > 0 ? gridCell.getRowTupleIndex() : gridCell.getColumnTupleIndex());
				cell.putString("Icon", gridCell.getIcon());
				cell.putString("AlertLevel", gridCell.getAlertLevel());
				cell.putString("DocumentId", gridCell.getDocumentId());
				cell.putBoolean("Input", gridCell.getInput());
				if (gridCell.isTotals())
				{
					cell.putBoolean("Totals", true);
				}
				var cellType = gridCell.getCellType();
				if (cellType === oFF.FioriCellType.HEADER)
				{
					cell.putString("Semantic", "Header");
					cell.putString("Dimension", gridCell.getDimension());
					cell.putString("Member", gridCell.getMember());
					cell.putString("SemanticClass", gridCell.getSemantic());
				}
				else if (cellType === oFF.FioriCellType.TITLE)
				{
					cell.putString("Semantic", "Title");
					cell.putString("Dimension", gridCell.getDimension());
					if (gridCell.getDimensionOther() !== null)
					{
						cell.putString("DimensionOther", gridCell.getDimensionOther());
					}
				}
				else if (cellType === oFF.FioriCellType.DATA)
				{
					cell.putInteger("DataRow", y - fixedRows);
					cell.putInteger("DataColumn", x - fixedCols);
					cell.putString("Member", gridCell.getMember());
					cell.putString("Member2", gridCell.getMember2());
					cell.putString("Semantic", gridCell.isTotals() ? "Result" : "Standard");
				}
				else
				{
					cell.putString("Semantic", "Empty");
					cell.putString("GridPart", "Empty");
				}
			}
		}
	}
	return layer1;
};

oFF.FioriGridCell = function() {};
oFF.FioriGridCell.prototype = new oFF.XObject();
oFF.FioriGridCell.prototype._ff_c = "FioriGridCell";

oFF.FioriGridCell.create = function(content, cellType)
{
	var object = new oFF.FioriGridCell();
	object.setupExt(content, cellType);
	return object;
};
oFF.FioriGridCell.prototype.m_content = null;
oFF.FioriGridCell.prototype.m_isLeftAligned = false;
oFF.FioriGridCell.prototype.m_isTotal = false;
oFF.FioriGridCell.prototype.m_drillState = null;
oFF.FioriGridCell.prototype.m_displayLevel = 0;
oFF.FioriGridCell.prototype.m_displayValue = null;
oFF.FioriGridCell.prototype.m_cellType = null;
oFF.FioriGridCell.prototype.m_dataValueId = null;
oFF.FioriGridCell.prototype.m_oDimName = null;
oFF.FioriGridCell.prototype.m_isRep = false;
oFF.FioriGridCell.prototype.m_dimName = null;
oFF.FioriGridCell.prototype.m_memName = null;
oFF.FioriGridCell.prototype.m_memName2 = null;
oFF.FioriGridCell.prototype.m_rowIndex = 0;
oFF.FioriGridCell.prototype.m_colIndex = 0;
oFF.FioriGridCell.prototype.m_icon = null;
oFF.FioriGridCell.prototype.m_alertLevel = null;
oFF.FioriGridCell.prototype.m_input = false;
oFF.FioriGridCell.prototype.m_semantic = null;
oFF.FioriGridCell.prototype.m_row = 0;
oFF.FioriGridCell.prototype.m_col = 0;
oFF.FioriGridCell.prototype.m_documentId = null;
oFF.FioriGridCell.prototype.setupExt = function(content, cellType)
{
	this.m_content = content;
	this.m_isLeftAligned = cellType !== oFF.FioriCellType.DATA;
	this.m_cellType = cellType;
};
oFF.FioriGridCell.prototype.releaseObject = function()
{
	this.m_content = null;
	this.m_cellType = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.FioriGridCell.prototype.getCharacterCount = function()
{
	if (oFF.isNull(this.m_content))
	{
		return 0;
	}
	return oFF.XString.size(this.m_content);
};
oFF.FioriGridCell.prototype.isLeftAligned = function()
{
	return this.m_isLeftAligned;
};
oFF.FioriGridCell.prototype.getText = function(max)
{
	if (oFF.isNull(this.m_content))
	{
		return "";
	}
	if (oFF.XString.size(this.m_content) > max)
	{
		return oFF.XString.substring(this.m_content, 0, max);
	}
	return this.m_content;
};
oFF.FioriGridCell.prototype.getCellType = function()
{
	return this.m_cellType;
};
oFF.FioriGridCell.prototype.isTotals = function()
{
	return this.m_isTotal;
};
oFF.FioriGridCell.prototype.setIsTotal = function(isTotal)
{
	this.m_isTotal = isTotal;
};
oFF.FioriGridCell.prototype.setDisplayLevel = function(displayLevel)
{
	this.m_displayLevel = displayLevel;
};
oFF.FioriGridCell.prototype.setDrillState = function(drillState)
{
	this.m_drillState = drillState;
};
oFF.FioriGridCell.prototype.toString = function()
{
	if (oFF.isNull(this.m_content))
	{
		return "";
	}
	return this.m_content;
};
oFF.FioriGridCell.prototype.getDisplayLevel = function()
{
	return this.m_displayLevel;
};
oFF.FioriGridCell.prototype.getDrillState = function()
{
	return this.m_drillState;
};
oFF.FioriGridCell.prototype.setDisplayValue = function(displayValue)
{
	this.m_displayValue = displayValue;
};
oFF.FioriGridCell.prototype.getDisplayValue = function()
{
	return this.m_displayValue;
};
oFF.FioriGridCell.prototype.setDataValueId = function(dataValueId)
{
	this.m_dataValueId = dataValueId;
};
oFF.FioriGridCell.prototype.getDataValueId = function()
{
	return this.m_dataValueId;
};
oFF.FioriGridCell.prototype.getDimension = function()
{
	return this.m_dimName;
};
oFF.FioriGridCell.prototype.setDimension = function(value)
{
	this.m_dimName = value;
};
oFF.FioriGridCell.prototype.getMember = function()
{
	return this.m_memName;
};
oFF.FioriGridCell.prototype.setMember = function(value)
{
	this.m_memName = value;
};
oFF.FioriGridCell.prototype.getMember2 = function()
{
	return this.m_memName2;
};
oFF.FioriGridCell.prototype.setMember2 = function(value)
{
	this.m_memName2 = value;
};
oFF.FioriGridCell.prototype.getRowTupleIndex = function()
{
	return this.m_rowIndex;
};
oFF.FioriGridCell.prototype.setRowTupleIndex = function(index)
{
	this.m_rowIndex = index;
};
oFF.FioriGridCell.prototype.getColumnTupleIndex = function()
{
	return this.m_colIndex;
};
oFF.FioriGridCell.prototype.setColumnTupleIndex = function(index)
{
	this.m_colIndex = index;
};
oFF.FioriGridCell.prototype.getIcon = function()
{
	return this.m_icon;
};
oFF.FioriGridCell.prototype.setIcon = function(icon)
{
	this.m_icon = icon;
};
oFF.FioriGridCell.prototype.getAlertLevel = function()
{
	return this.m_alertLevel;
};
oFF.FioriGridCell.prototype.setAlertLevel = function(alertLevel)
{
	this.m_alertLevel = alertLevel;
};
oFF.FioriGridCell.prototype.getDocumentId = function()
{
	return this.m_documentId;
};
oFF.FioriGridCell.prototype.setDocumentId = function(documentId)
{
	this.m_documentId = documentId;
};
oFF.FioriGridCell.prototype.getInput = function()
{
	return this.m_input;
};
oFF.FioriGridCell.prototype.setInput = function(bInput)
{
	this.m_input = bInput;
};
oFF.FioriGridCell.prototype.getColumn = function()
{
	return this.m_col;
};
oFF.FioriGridCell.prototype.setColumn = function(column)
{
	this.m_col = column;
};
oFF.FioriGridCell.prototype.getRow = function()
{
	return this.m_row;
};
oFF.FioriGridCell.prototype.setRow = function(row)
{
	this.m_row = row;
};
oFF.FioriGridCell.prototype.getDimensionOther = function()
{
	return this.m_oDimName;
};
oFF.FioriGridCell.prototype.setDimensionOther = function(value)
{
	this.m_oDimName = value;
};
oFF.FioriGridCell.prototype.getIsRepetition = function()
{
	return this.m_isRep;
};
oFF.FioriGridCell.prototype.setIsRepetition = function(value)
{
	this.m_isRep = value;
};
oFF.FioriGridCell.prototype.setSemantic = function(semantic)
{
	this.m_semantic = semantic;
};
oFF.FioriGridCell.prototype.getSemantic = function()
{
	return this.m_semantic;
};

oFF.FioriGridFactoryImpl = function() {};
oFF.FioriGridFactoryImpl.prototype = new oFF.XObject();
oFF.FioriGridFactoryImpl.prototype._ff_c = "FioriGridFactoryImpl";

oFF.FioriGridFactoryImpl.create = function()
{
	return new oFF.FioriGridFactoryImpl();
};
oFF.FioriGridFactoryImpl.prototype.createFioriGrid = function(resultSet)
{
	return oFF.FioriGrid.create(resultSet);
};

oFF.FioriLineDef = function() {};
oFF.FioriLineDef.prototype = new oFF.XObject();
oFF.FioriLineDef.prototype._ff_c = "FioriLineDef";

oFF.FioriLineDef.create = function()
{
	return new oFF.FioriLineDef();
};
oFF.FioriLineDef.prototype.m_hasTotals = false;
oFF.FioriLineDef.prototype.hasTotals = function()
{
	return this.m_hasTotals;
};
oFF.FioriLineDef.prototype.setHasTotals = function(hasTotals)
{
	this.m_hasTotals = hasTotals;
};
oFF.FioriLineDef.prototype.toString = function()
{
	return oFF.XStringBuffer.create().append("Totals:").appendBoolean(this.m_hasTotals).toString();
};

oFF.ReferenceGridFactoryImpl = function() {};
oFF.ReferenceGridFactoryImpl.prototype = new oFF.XObject();
oFF.ReferenceGridFactoryImpl.prototype._ff_c = "ReferenceGridFactoryImpl";

oFF.ReferenceGridFactoryImpl.create = function()
{
	return new oFF.ReferenceGridFactoryImpl();
};
oFF.ReferenceGridFactoryImpl.prototype.createReferenceGridSimple = function(resultSet)
{
	return oFF.ReferenceGrid.create(resultSet);
};
oFF.ReferenceGridFactoryImpl.prototype.createReferenceGridWithDetails = function(resultSet)
{
	return oFF.ReferenceGrid.createWithDetails(resultSet);
};
oFF.ReferenceGridFactoryImpl.prototype.createReferenceGrid = function(resultSet, withDetails)
{
	if (withDetails)
	{
		return this.createReferenceGridWithDetails(resultSet);
	}
	return this.createReferenceGridSimple(resultSet);
};
oFF.ReferenceGridFactoryImpl.prototype.createReferenceGridWithName = function(name, resultSet)
{
	if (oFF.notNull(name) && oFF.XString.endsWith(name, "_gen"))
	{
		return oFF.ReferenceGrid2.createWithName2(name, resultSet);
	}
	return oFF.ReferenceGrid.createWithName(name, resultSet);
};
oFF.ReferenceGridFactoryImpl.prototype.createReferenceGridWithNameAndDetails = function(name, resultSet)
{
	return oFF.ReferenceGrid.createWithNameAndDetails(name, resultSet);
};
oFF.ReferenceGridFactoryImpl.prototype.createForVizGrid = function(resultSet)
{
	return oFF.ReferenceGrid.createForVizGrid(resultSet);
};

oFF.KpiRendererFactoryImpl = function() {};
oFF.KpiRendererFactoryImpl.prototype = new oFF.XObject();
oFF.KpiRendererFactoryImpl.prototype._ff_c = "KpiRendererFactoryImpl";

oFF.KpiRendererFactoryImpl.create = function()
{
	return new oFF.KpiRendererFactoryImpl();
};
oFF.KpiRendererFactoryImpl.prototype.newRenderer = function(protocolType)
{
	return oFF.RsKpiRenderer.create();
};

oFF.RsKpiRenderer = function() {};
oFF.RsKpiRenderer.prototype = new oFF.XObject();
oFF.RsKpiRenderer.prototype._ff_c = "RsKpiRenderer";

oFF.RsKpiRenderer.create = function()
{
	return new oFF.RsKpiRenderer();
};
oFF.RsKpiRenderer.processMetricData = function(columnAxis, rs, vizDef)
{
	var theChartData = oFF.PrFactory.createStructure();
	var chartInfo = theChartData.putNewStructure(oFF.VizDefConstants.K_CHART);
	chartInfo.putString(oFF.VizDefConstants.K_TYPE, oFF.SapKpiConstants.K_METRIC);
	var sapCard = theChartData.putNewStructure(oFF.SapKpiConstants.K_SAP_CARD);
	sapCard.putString(oFF.VizDefConstants.K_TYPE, oFF.SapKpiConstants.K_ANALYTICAL);
	var header = sapCard.putNewStructure(oFF.SapKpiConstants.K_HEADER);
	header.putString(oFF.VizDefConstants.K_TYPE, oFF.SapKpiConstants.K_NUMERIC);
	header.putString(oFF.VizDefConstants.K_TITLE, vizDef.getStructureByKey(oFF.VizDefConstants.K_CHART).getStringByKey(oFF.VizDefConstants.K_TITLE));
	header.putString(oFF.VizDefConstants.K_SUB_TITLE, vizDef.getStructureByKey(oFF.VizDefConstants.K_CHART).getStringByKey(oFF.VizDefConstants.K_SUB_TITLE));
	var feedSelector = oFF.XListOfString.create();
	feedSelector.add(oFF.VizDefConstants.K_VALUE_AXIS);
	feedSelector.add(oFF.VizDefConstants.K_VALUE_AXIS2);
	feedSelector.add(oFF.VizDefConstants.K_THRESHOLD_REFERENCE);
	feedSelector.add(oFF.VizDefConstants.K_VARIANCE);
	var columnIndices = columnAxis.getIndicesByFeedOrder(feedSelector);
	var needProcessPrimary = columnAxis.hasTupleForFeed(oFF.VizDefConstants.K_VALUE_AXIS);
	var sideInds = header.putNewList(oFF.SapKpiConstants.K_SIDEINDICATORS);
	var mainInd = null;
	var state = "";
	var trend = "";
	for (var i = 0; i < columnIndices.size(); i++)
	{
		var ij = columnIndices.get(i).getInteger();
		var currentTuple = columnAxis.getTupleAt(ij);
		var currentMeasureName = currentTuple.getPrettyText(feedSelector);
		var dataCell1 = rs.getDataCell(ij, 0);
		if (needProcessPrimary && currentTuple.isSelectedByString(oFF.VizDefConstants.K_VALUE_AXIS))
		{
			header.putString(oFF.SapKpiConstants.K_UNIT_OF_MEASUREMENT, dataCell1.getCurrencyUnit().getFormatted());
			header.putString(oFF.VizDefConstants.K_SUB_TITLE, currentMeasureName);
			mainInd = header.putNewStructure(oFF.SapKpiConstants.K_MAININDICATOR);
			oFF.RsKpiRenderer.addIndicatorContent(currentTuple, dataCell1, mainInd);
			needProcessPrimary = false;
		}
		else if (currentTuple.isSelectedByString(oFF.VizDefConstants.K_VALUE_AXIS2))
		{
			var side = sideInds.addNewStructure();
			side.putString(oFF.VizDefConstants.K_TITLE, currentMeasureName);
			oFF.RsKpiRenderer.addIndicatorContent(currentTuple, dataCell1, side);
		}
		if (currentTuple.isSelectedByString(oFF.VizDefConstants.K_THRESHOLD_REFERENCE))
		{
			var val = oFF.XInteger.convertToString((dataCell1.getExceptionSettingPriorityByName(oFF.ExceptionSetting.ALERT_LEVEL.getName()).getInteger() - 1) / 3);
			if (oFF.RsKpiRenderer.getStateMap().containsKey(val))
			{
				state = oFF.RsKpiRenderer.getStateMap().getStringByKey(val);
			}
		}
		if (currentTuple.isSelectedByString(oFF.VizDefConstants.K_VARIANCE))
		{
			var doubleVal = dataCell1.getDouble();
			if (doubleVal !== 0)
			{
				trend = doubleVal > 0 ? oFF.SapKpiConstants.V_UP : oFF.SapKpiConstants.V_DOWN;
			}
		}
	}
	if (oFF.notNull(mainInd))
	{
		if (!oFF.XString.isEqual(state, ""))
		{
			mainInd.putString(oFF.SapKpiConstants.K_STATE, state);
		}
		if (!oFF.XString.isEqual(trend, ""))
		{
			mainInd.putString(oFF.SapKpiConstants.K_TREND, trend);
		}
	}
	return theChartData;
};
oFF.RsKpiRenderer.unitMap = null;
oFF.RsKpiRenderer.stateMap = null;
oFF.RsKpiRenderer.getStateMap = function()
{
	if (oFF.isNull(oFF.RsKpiRenderer.stateMap))
	{
		oFF.RsKpiRenderer.stateMap = oFF.PrFactory.createStructure();
		oFF.RsKpiRenderer.stateMap.putString("0", oFF.SapKpiConstants.V_GOOD);
		oFF.RsKpiRenderer.stateMap.putString("1", oFF.SapKpiConstants.V_CRITICAL);
		oFF.RsKpiRenderer.stateMap.putString("2", oFF.SapKpiConstants.V_ERROR);
	}
	return oFF.RsKpiRenderer.stateMap;
};
oFF.RsKpiRenderer.getUnitMap = function()
{
	if (oFF.isNull(oFF.RsKpiRenderer.unitMap))
	{
		oFF.RsKpiRenderer.unitMap = oFF.PrFactory.createStructure();
		oFF.RsKpiRenderer.unitMap.putString("-3", "K");
		oFF.RsKpiRenderer.unitMap.putString("-6", "M");
		oFF.RsKpiRenderer.unitMap.putString("-9", "B");
	}
	return oFF.RsKpiRenderer.unitMap;
};
oFF.RsKpiRenderer.addIndicatorContent = function(tuple, dataCell1, indicator)
{
	var unitMap = oFF.RsKpiRenderer.getUnitMap();
	var unit = "";
	var scaleFactor = oFF.XInteger.convertToString(tuple.getNumericShift());
	if (unitMap.containsKey(scaleFactor))
	{
		unit = unitMap.getStringByKey(scaleFactor);
	}
	var numberValue = oFF.XStringBuffer.create();
	numberValue.append(!dataCell1.getCurrencyUnit().isEmpty() ? dataCell1.getCurrencyUnit().getSuffix() : "");
	numberValue.append(tuple.getFormattedValue(dataCell1));
	indicator.putString(oFF.SapKpiConstants.K_UNIT, unit);
	indicator.putString(oFF.SapKpiConstants.K_NUMBER, numberValue.toString());
};
oFF.RsKpiRenderer.prototype.render = function(rs)
{
	var vizDef = rs.getQueryModel().getVizManager().getVizDef();
	var globalDef = rs.getQueryModel().getVizManager().getGlobalDef();
	if (oFF.notNull(vizDef) && vizDef.containsKey(oFF.VizDefConstants.K_CHART) && rs.getAvailableDataCellCount() > 0)
	{
		var chart = vizDef.getStructureByKey(oFF.VizDefConstants.K_CHART);
		if (oFF.XString.isEqual(chart.getStringByKey(oFF.VizDefConstants.K_TYPE), oFF.SapKpiConstants.K_METRIC))
		{
			var customFormatting = oFF.RsVizAxisExtractor.extractCustomFormatting(vizDef, globalDef);
			var feedMembers = vizDef.getStructureByKey("feedMembers");
			var columnTuples = oFF.RsVizAxisExtractor.getTuplesFromColumnAxis(rs, feedMembers, customFormatting);
			return oFF.RsKpiRenderer.processMetricData(columnTuples, rs, vizDef);
		}
	}
	return oFF.PrFactory.createStructure();
};

oFF.SapKpiConstants = {

	K_METRIC:"metric",
	K_SAP_CARD:"sap.card",
	K_ANALYTICAL:"Analytical",
	K_HEADER:"header",
	K_NUMERIC:"Numeric",
	K_SIDEINDICATORS:"sideIndicators",
	K_UNIT_OF_MEASUREMENT:"unitOfMeasurement",
	K_MAININDICATOR:"mainIndicator",
	K_UNIT:"unit",
	K_NUMBER:"number",
	K_THRESHOLDREFERENCE:"thresholdReference",
	K_VARIANCE:"variance",
	K_STATE:"state",
	K_TREND:"trend",
	K_FEEDMEMBERS:"feedMembers",
	K_GLOBALOBJECTS:"GlobalObjects",
	K_CALCULATIONS:"Calculations",
	V_GOOD:"Good",
	V_CRITICAL:"Critical",
	V_ERROR:"Error",
	V_CALCULATION:"calculation",
	V_UP:"Up",
	V_DOWN:"Down"
};

oFF.RsVizContainerFactoryImpl = function() {};
oFF.RsVizContainerFactoryImpl.prototype = new oFF.XObject();
oFF.RsVizContainerFactoryImpl.prototype._ff_c = "RsVizContainerFactoryImpl";

oFF.RsVizContainerFactoryImpl.create = function()
{
	return new oFF.RsVizContainerFactoryImpl();
};
oFF.RsVizContainerFactoryImpl.prototype.newVisualizationContainer = function(visualizationDefinition)
{
	if (visualizationDefinition.getOlapComponentType() === oFF.OlapComponentType.VISUALIZATION_TABLE_DEFINITION)
	{
		return oFF.RsVizTableContainer.create(visualizationDefinition);
	}
	else if (visualizationDefinition.getOlapComponentType() === oFF.OlapComponentType.VISUALIZATION_CHART_DEFINITION)
	{
		return oFF.RsVizChartContainer.create(visualizationDefinition);
	}
	else if (visualizationDefinition.getOlapComponentType() === oFF.OlapComponentType.VISUALIZATION_CUSTOM_DEFINITION)
	{
		return oFF.RsVizCustomVisualizationContainer.create(visualizationDefinition);
	}
	else
	{
		return null;
	}
};

oFF.DataCellNumberFormatterSettings = function() {};
oFF.DataCellNumberFormatterSettings.prototype = new oFF.XObject();
oFF.DataCellNumberFormatterSettings.prototype._ff_c = "DataCellNumberFormatterSettings";

oFF.DataCellNumberFormatterSettings.create = function(cell)
{
	var settings = new oFF.DataCellNumberFormatterSettings();
	var format = cell.getFormatString();
	settings.setDecimalGroupingSeparatorFromFormat(format);
	settings.setDecimalSeparatorFromFormat(format);
	settings.setScaleFactor(cell);
	settings.setMaxDigitsRightAndPadding(cell);
	settings.setCurrencyFormatSettings(cell.getCurrencyUnit());
	return settings;
};
oFF.DataCellNumberFormatterSettings.prototype.m_decimalSeparator = null;
oFF.DataCellNumberFormatterSettings.prototype.m_decimalGroupingSeparator = null;
oFF.DataCellNumberFormatterSettings.prototype.m_scaleFactor = null;
oFF.DataCellNumberFormatterSettings.prototype.m_maxDigitsRight = -1;
oFF.DataCellNumberFormatterSettings.prototype.m_rightPad = -1;
oFF.DataCellNumberFormatterSettings.prototype.m_currencySettings = null;
oFF.DataCellNumberFormatterSettings.prototype.setCurrencyFormatSettings = function(currencyUnit)
{
	var settings = null;
	if (currencyUnit.hasPrefix())
	{
		settings = oFF.XCurrencyFormatSettings.create();
		settings.setCurrencyPresentationPosition(0);
		settings.setValuePosition(1);
		settings.setScaleTextPosition(2);
		settings.setCurrencyPresentationHasSpace(true);
		settings.setScaleTextHasSpace(true);
	}
	else if (currencyUnit.hasSuffix())
	{
		settings = oFF.XCurrencyFormatSettings.create();
		settings.setCurrencyPresentationPosition(2);
		settings.setValuePosition(0);
		settings.setScaleTextPosition(1);
		settings.setCurrencyPresentationHasSpace(true);
		settings.setScaleTextHasSpace(true);
	}
	this.m_currencySettings = settings;
};
oFF.DataCellNumberFormatterSettings.prototype.getDecimalGroupingSeparator = function()
{
	return this.m_decimalGroupingSeparator;
};
oFF.DataCellNumberFormatterSettings.prototype.getDecimalSeparator = function()
{
	return this.m_decimalSeparator;
};
oFF.DataCellNumberFormatterSettings.prototype.getScaleFactor = function()
{
	return this.m_scaleFactor;
};
oFF.DataCellNumberFormatterSettings.prototype.getMaxDigitsRight = function()
{
	return this.m_maxDigitsRight;
};
oFF.DataCellNumberFormatterSettings.prototype.getRightPad = function()
{
	return this.m_rightPad;
};
oFF.DataCellNumberFormatterSettings.prototype.getScaleFormat = function()
{
	return null;
};
oFF.DataCellNumberFormatterSettings.prototype.getSignPresentation = function()
{
	return null;
};
oFF.DataCellNumberFormatterSettings.prototype.getCurrencyFormatSettings = function()
{
	return this.m_currencySettings;
};
oFF.DataCellNumberFormatterSettings.prototype.setDecimalGroupingSeparatorFromFormat = function(format)
{
	var decimalGroupingSeparator = this.getFirstCharacterAfter(format, "#");
	if (oFF.isNull(decimalGroupingSeparator) && !oFF.XString.containsString(format, "#"))
	{
		this.m_decimalGroupingSeparator = " ";
	}
	else if (this.isSupportedDecimalGroupingSeparator(decimalGroupingSeparator))
	{
		this.m_decimalGroupingSeparator = decimalGroupingSeparator;
	}
};
oFF.DataCellNumberFormatterSettings.prototype.setDecimalSeparatorFromFormat = function(format)
{
	var decimalSeparator = this.getFirstCharacterAfter(format, "0");
	if (this.isSupportedDecimalSeparator(decimalSeparator))
	{
		this.m_decimalSeparator = decimalSeparator;
	}
};
oFF.DataCellNumberFormatterSettings.prototype.setScaleFactor = function(dataCell)
{
	this.m_scaleFactor = oFF.XIntegerValue.create(-dataCell.getScalingFactor());
};
oFF.DataCellNumberFormatterSettings.prototype.setMaxDigitsRightAndPadding = function(dataCell)
{
	var decimalPlaces = dataCell.getDecimalPlaces();
	if (decimalPlaces >= 0)
	{
		this.m_maxDigitsRight = decimalPlaces;
		this.m_rightPad = decimalPlaces;
	}
};
oFF.DataCellNumberFormatterSettings.prototype.isSupportedDecimalGroupingSeparator = function(separator)
{
	return oFF.XString.isEqual(",", separator) || oFF.XString.isEqual(".", separator) || oFF.XString.isEqual(" ", separator);
};
oFF.DataCellNumberFormatterSettings.prototype.isSupportedDecimalSeparator = function(separator)
{
	return oFF.XString.isEqual(",", separator) || oFF.XString.isEqual(".", separator);
};
oFF.DataCellNumberFormatterSettings.prototype.getFirstCharacterAfter = function(source, search)
{
	var index = oFF.XString.indexOf(source, search);
	if (index < 0 || index === oFF.XString.size(source) - 1)
	{
		return null;
	}
	return oFF.XString.substring(source, index + 1, index + 2);
};

oFF.QStructureMemberFormatterSettings = function() {};
oFF.QStructureMemberFormatterSettings.prototype = new oFF.XObject();
oFF.QStructureMemberFormatterSettings.prototype._ff_c = "QStructureMemberFormatterSettings";

oFF.QStructureMemberFormatterSettings.create = function(rowStructureMember, columnStructureMember, queryModel)
{
	var settings = new oFF.QStructureMemberFormatterSettings();
	var queryDataCell = settings.getDataCell(rowStructureMember, columnStructureMember, queryModel);
	settings.setScaleFactor(rowStructureMember, columnStructureMember, queryDataCell);
	settings.setMaxDigitsRightAndPadding(rowStructureMember, columnStructureMember, queryDataCell);
	settings.setScaleFormat(rowStructureMember, columnStructureMember, queryDataCell);
	settings.setSignPresentation(rowStructureMember, columnStructureMember, queryDataCell);
	return settings;
};
oFF.QStructureMemberFormatterSettings.prototype.m_scaleFactor = null;
oFF.QStructureMemberFormatterSettings.prototype.m_maxDigitsRight = -1;
oFF.QStructureMemberFormatterSettings.prototype.m_rightPad = -1;
oFF.QStructureMemberFormatterSettings.prototype.m_scaleFormat = null;
oFF.QStructureMemberFormatterSettings.prototype.m_signPresentation = null;
oFF.QStructureMemberFormatterSettings.prototype.getDecimalSeparator = function()
{
	return null;
};
oFF.QStructureMemberFormatterSettings.prototype.getDecimalGroupingSeparator = function()
{
	return null;
};
oFF.QStructureMemberFormatterSettings.prototype.getCurrencyFormatSettings = function()
{
	return null;
};
oFF.QStructureMemberFormatterSettings.prototype.getScaleFormat = function()
{
	return this.m_scaleFormat;
};
oFF.QStructureMemberFormatterSettings.prototype.getSignPresentation = function()
{
	return this.m_signPresentation;
};
oFF.QStructureMemberFormatterSettings.prototype.getScaleFactor = function()
{
	return this.m_scaleFactor;
};
oFF.QStructureMemberFormatterSettings.prototype.getMaxDigitsRight = function()
{
	return this.m_maxDigitsRight;
};
oFF.QStructureMemberFormatterSettings.prototype.getRightPad = function()
{
	return this.m_rightPad;
};
oFF.QStructureMemberFormatterSettings.prototype.setScaleFactor = function(rowStructureMember, columnStructureMember, queryDataCell)
{
	if (queryDataCell.isPresent())
	{
		var queryScaleFactor = queryDataCell.get().getScalingFactor();
		if (queryScaleFactor >= 0)
		{
			this.m_scaleFactor = oFF.XIntegerValue.create(queryScaleFactor);
		}
	}
	else
	{
		this.getLeadingScalingPower(rowStructureMember, columnStructureMember).ifPresent( function(scale){
			this.m_scaleFactor = oFF.XIntegerValue.create(-scale.getInteger());
		}.bind(this));
	}
};
oFF.QStructureMemberFormatterSettings.prototype.setScaleFormat = function(rowStructureMember, columnStructureMember, queryDataCell)
{
	if (queryDataCell.isPresent())
	{
		this.m_scaleFormat = queryDataCell.get().getScaleFormat();
	}
	else
	{
		this.m_scaleFormat = this.getLeadingScaleFormat(rowStructureMember, columnStructureMember).orElse(null);
	}
};
oFF.QStructureMemberFormatterSettings.prototype.setSignPresentation = function(rowStructureMember, columnStructureMember, queryDataCell)
{
	if (queryDataCell.isPresent())
	{
		this.m_signPresentation = queryDataCell.get().getSignPresentation();
	}
	else
	{
		this.m_signPresentation = this.getLeadingSignPresentation(rowStructureMember, columnStructureMember).orElse(null);
	}
};
oFF.QStructureMemberFormatterSettings.prototype.setMaxDigitsRightAndPadding = function(rowStructureMember, columnStructureMember, queryDataCell)
{
	var decimalPlaces;
	if (queryDataCell.isPresent())
	{
		decimalPlaces = queryDataCell.get().getDecimalPlaces();
	}
	else
	{
		var leadingDecimalPlaces = this.getLeadingDecimalPlaces(rowStructureMember, columnStructureMember);
		decimalPlaces = leadingDecimalPlaces.isPresent() ? leadingDecimalPlaces.get().getInteger() : -1;
	}
	if (decimalPlaces >= 0)
	{
		this.m_maxDigitsRight = decimalPlaces;
		this.m_rightPad = decimalPlaces;
	}
};
oFF.QStructureMemberFormatterSettings.prototype.getDataCell = function(rowStructureMember, columnStructureMember, queryModel)
{
	var result = oFF.XOptional.empty();
	var queryDataCells = queryModel.getQueryDataCells();
	if (oFF.XCollectionUtils.hasElements(queryDataCells))
	{
		result = oFF.XStream.of(queryDataCells).filter( function(i){
			return (oFF.isNull(rowStructureMember) || i.hasMemberReference(rowStructureMember)) && (oFF.isNull(columnStructureMember) || i.hasMemberReference(columnStructureMember));
		}.bind(this)).findAny();
	}
	return result;
};
oFF.QStructureMemberFormatterSettings.prototype.getLeadingScalingPower = function(rowStructureMember, columnStructureMember)
{
	return this.findBySolveOrder(rowStructureMember, columnStructureMember,  function(queryStructure){
		return queryStructure.getNumericShift();
	}.bind(this));
};
oFF.QStructureMemberFormatterSettings.prototype.getLeadingScaleFormat = function(rowStructureMember, columnStructureMember)
{
	return this.findBySolveOrder(rowStructureMember, columnStructureMember,  function(queryStructure){
		return queryStructure.getScaleFormat();
	}.bind(this));
};
oFF.QStructureMemberFormatterSettings.prototype.getLeadingSignPresentation = function(rowStructureMember, columnStructureMember)
{
	return this.findBySolveOrder(rowStructureMember, columnStructureMember,  function(queryStructure){
		return queryStructure.getSignPresentation();
	}.bind(this));
};
oFF.QStructureMemberFormatterSettings.prototype.getLeadingDecimalPlaces = function(rowStructureMember, columnStructureMember)
{
	return this.findBySolveOrder(rowStructureMember, columnStructureMember,  function(queryStructure){
		return queryStructure.getNumericScale();
	}.bind(this));
};
oFF.QStructureMemberFormatterSettings.prototype.findBySolveOrder = function(rowStructureMember, columnStructureMember, queryStructureFn)
{
	var first = rowStructureMember;
	var second = columnStructureMember;
	if (oFF.notNull(rowStructureMember) && oFF.notNull(columnStructureMember) && rowStructureMember.getSolveOrder() < columnStructureMember.getSolveOrder())
	{
		first = columnStructureMember;
		second = rowStructureMember;
	}
	var result = null;
	if (oFF.notNull(first))
	{
		result = queryStructureFn(first);
	}
	if (oFF.isNull(result) && oFF.notNull(second))
	{
		result = queryStructureFn(second);
	}
	return oFF.XOptional.ofNullable(result);
};

oFF.SacTableAggregation = function() {};
oFF.SacTableAggregation.prototype = new oFF.XObject();
oFF.SacTableAggregation.prototype._ff_c = "SacTableAggregation";

oFF.SacTableAggregation.create = function(text, plain, dimension, dimensionMemberType, drillState, displayLevel, field, index, isMainAttribute, dimensionIndex, dimensionMemberName, parentDimensionMemberName, pathKey, repeatedMemberName, valueException, dimensionMemberValueException)
{
	var result = new oFF.SacTableAggregation();
	result.m_text = text;
	result.m_plain = plain;
	result.m_dimension = dimension;
	result.m_drillState = drillState;
	result.m_displayLevel = displayLevel;
	result.m_field = field;
	result.m_index = index;
	result.m_isMainAttribute = isMainAttribute;
	result.m_dimensionIndex = dimensionIndex;
	result.m_dimensionMemberType = dimensionMemberType;
	result.m_dimensionMemberName = dimensionMemberName;
	result.m_parentDimensionMemberName = parentDimensionMemberName;
	result.m_pathKey = pathKey;
	result.m_repeatedMemberName = repeatedMemberName;
	result.m_valueException = valueException;
	result.m_dimensionMemberValueException = dimensionMemberValueException;
	return result;
};
oFF.SacTableAggregation.remapToMemberPath = function(tableAggregationMap)
{
	var values = tableAggregationMap.getValuesAsReadOnlyList();
	var result = oFF.XHashMapOfStringByString.create();
	for (var i = 0; i < values.size(); i++)
	{
		var value = values.get(i);
		result.put(value.getDimension().getName(), value.getDimensionMemberName());
	}
	return result;
};
oFF.SacTableAggregation.getMemberHeader = function(cursorAxis, dimHeader, previousHeader, overwriteTexts)
{
	var repeatedMemberName = true;
	var result = oFF.XLinkedHashMapByString.create();
	var pathKey = "";
	while (cursorAxis.hasNextTupleElement())
	{
		var tupleElement = cursorAxis.nextTupleElement();
		var dimensionMemberName = tupleElement.getDimensionMemberName();
		var parentDimensionMemberName = tupleElement.getParentDimensionMemberName();
		var memberType = tupleElement.getDimensionMemberType();
		var formattedValue;
		pathKey = oFF.XStringUtils.concatenate5(pathKey, "::[", tupleElement.getRsDimensionAtCurrentPosition().getName(), "]==>", dimensionMemberName);
		var valueException;
		var dmValueException = tupleElement.getDimensionMemberNameValueException();
		var field;
		var fieldNameValueMap = oFF.XLinkedHashMapOfStringByString.create();
		var fieldNameList = oFF.XListOfString.create();
		var fieldName;
		while (cursorAxis.hasNextFieldValue())
		{
			var fieldValue = cursorAxis.nextFieldValue();
			field = fieldValue.getField();
			valueException = fieldValue.getValueException();
			fieldName = field.getName();
			var header = dimHeader.getByKey(fieldName);
			var dimension = oFF.isNull(header) ? null : header.getDimension();
			var structureMember = oFF.isNull(dimension) ? null : dimension.getStructureMemberByAliasOrMember(dimensionMemberName);
			var displayLevel = tupleElement.getDisplayLevel();
			var plain = oFF.XValueUtil.getString(fieldValue.getValue());
			formattedValue = fieldValue.getFormattedValue();
			if (oFF.notNull(structureMember) && field.getPresentationType() !== null && field.getPresentationType().isTypeOf(oFF.PresentationType.ABSTRACT_TEXT) && (dimension.getMainAttribute() === field.getAttribute() && dimension.getFieldLayoutType() === oFF.FieldLayoutType.ATTRIBUTE_BASED || dimension.getTextField() === field || dimension.getClientDefaultTextField() === field || dimension.getDefaultResultSetTextField() === field) && oFF.XStringUtils.isNotNullAndNotEmpty(structureMember.getText()))
			{
				formattedValue = structureMember.getText();
			}
			if (oFF.XStringUtils.isNullOrEmpty(formattedValue))
			{
				formattedValue = plain;
			}
			if (valueException === oFF.ValueException.UNDEFINED)
			{
				formattedValue = overwriteTexts.getByKey(oFF.SacTableConstants.S_VALUE_EXCEPTION_UNDEFINED);
			}
			else if (valueException === oFF.ValueException.ERROR)
			{
				formattedValue = overwriteTexts.getByKey(oFF.SacTableConstants.S_VALUE_EXCEPTION_ERROR);
			}
			else if (valueException === oFF.ValueException.NULL_VALUE && dmValueException === oFF.ValueException.NULL_VALUE)
			{
				formattedValue = overwriteTexts.getByKey(oFF.SacTableConstants.S_VALUE_EXCEPTION_NULL);
			}
			else if (oFF.notNull(valueException) && valueException !== oFF.ValueException.NORMAL && valueException !== oFF.ValueException.ZERO && valueException !== oFF.ValueException.NULL_VALUE)
			{
				formattedValue = overwriteTexts.getByKey(oFF.SacTableConstants.S_VALUE_EXCEPTION_OTHER);
			}
			fieldNameValueMap.put(fieldName, formattedValue);
			if (dimHeader.containsKey(fieldName))
			{
				if (oFF.isNull(previousHeader) || !previousHeader.containsKey(fieldName))
				{
					repeatedMemberName = false;
				}
				else if (!oFF.XString.isEqual(previousHeader.getByKey(fieldName).getPlain(), plain) || previousHeader.getByKey(fieldName).getDisplayLevel() !== displayLevel || previousHeader.getByKey(fieldName).getValueException() !== valueException || previousHeader.getByKey(fieldName).getDimensionMemberValueException() !== dmValueException || !oFF.XString.isEqual(previousHeader.getByKey(fieldName).getDimensionMemberName(), dimensionMemberName))
				{
					var previousOne = previousHeader.getByKey(fieldName);
					previousOne.setDimensionSectionEnd();
					repeatedMemberName = false;
				}
				var newTableAggregation = oFF.SacTableAggregation.create(formattedValue, plain, header.getDimension(), memberType, tupleElement.getDrillState(), displayLevel, header.getField(), header.getIndex(), header.isMainAttribute(), header.getDimensionIndex(), dimensionMemberName, parentDimensionMemberName, pathKey, repeatedMemberName, valueException, dmValueException);
				newTableAggregation.setLowerLevelNodeAlignment(header.getDimension().getHierarchyManager().getLowerLevelNodeAlignment());
				result.put(fieldName, newTableAggregation);
				if (oFF.notNull(previousHeader) && previousHeader.containsKey(fieldName))
				{
					var previousAggregation = previousHeader.getByKey(fieldName);
					if (oFF.XString.isEqual(parentDimensionMemberName, previousAggregation.getDimensionMemberName()))
					{
						newTableAggregation.setParent(previousAggregation);
					}
					else if (oFF.XString.isEqual(dimensionMemberName, previousAggregation.getParentDimensionMemberName()))
					{
						previousAggregation.setParent(newTableAggregation);
					}
					newTableAggregation.setHierarchyLevelStart(!previousAggregation.findParent(newTableAggregation));
					previousAggregation.setHierarchyLevelEnd(!newTableAggregation.findParent(previousAggregation));
				}
				fieldNameList.add(fieldName);
			}
		}
		for (var i = 0; i < fieldNameList.size(); i++)
		{
			fieldName = fieldNameList.get(i);
			var aggregation = result.getByKey(fieldName);
			formattedValue = aggregation.getText();
			memberType = aggregation.getDimensionMemberType();
			if (memberType === oFF.MemberType.RESULT)
			{
				if (oFF.XStringUtils.isNotNullAndNotEmpty(overwriteTexts.getByKey(oFF.SacTableConstants.S_TOTAL_MEMBER_OVERWRITE_TEXT)))
				{
					formattedValue = i === 0 ? overwriteTexts.getByKey(oFF.SacTableConstants.S_TOTAL_MEMBER_OVERWRITE_TEXT) : "";
				}
			}
			else if (memberType === oFF.MemberType.CONDITION_RESULT)
			{
				if (oFF.XStringUtils.isNotNullAndNotEmpty(overwriteTexts.getByKey(oFF.SacTableConstants.S_TOTAL_INCLUDING_MEMBER_OVERWRITE_TEXT)))
				{
					formattedValue = i === 0 ? overwriteTexts.getByKey(oFF.SacTableConstants.S_TOTAL_INCLUDING_MEMBER_OVERWRITE_TEXT) : "";
				}
			}
			else if (memberType === oFF.MemberType.CONDITION_OTHERS_RESULT)
			{
				if (oFF.XStringUtils.isNotNullAndNotEmpty(overwriteTexts.getByKey(oFF.SacTableConstants.S_TOTAL_INCLUDING_MEMBER_OVERWRITE_TEXT)))
				{
					formattedValue = i === 0 ? overwriteTexts.getByKey(oFF.SacTableConstants.S_TOTAL_REMAINING_MEMBER_OVERWRITE_TEXT) : "";
				}
			}
			else if (oFF.XStringUtils.isNullOrEmpty(formattedValue) && (aggregation.getValueException() === null || aggregation.getValueException() === oFF.ValueException.NORMAL || aggregation.getDimensionMemberValueException() === null || aggregation.getDimensionMemberValueException() === oFF.ValueException.NORMAL))
			{
				field = aggregation.getField();
				var attribute = oFF.isNull(field) ? null : field.getAttribute();
				if (oFF.isNull(attribute))
				{
					formattedValue = aggregation.getDimensionMemberName();
				}
				if (oFF.notNull(attribute) && oFF.XStringUtils.isNullOrEmpty(formattedValue) && !oFF.PresentationType.DISPLAY_KEY.isTypeOf(field.getPresentationType()) && !oFF.PresentationType.HIERARCHY_DISPLAY_KEY.isTypeOf(field.getPresentationType()) && !oFF.PresentationType.DISPLAY_KEY_NOT_COMPOUND.isTypeOf(field.getPresentationType()))
				{
					var displayKeyField = attribute.getFieldByPresentationType(oFF.PresentationType.DISPLAY_KEY_NOT_COMPOUND);
					if (oFF.isNull(displayKeyField))
					{
						displayKeyField = attribute.getDisplayKeyField();
					}
					if (oFF.notNull(displayKeyField) && fieldNameValueMap.containsKey(displayKeyField.getName()))
					{
						formattedValue = fieldNameValueMap.getByKey(displayKeyField.getName());
					}
				}
				if (oFF.XStringUtils.isNullOrEmpty(formattedValue))
				{
					formattedValue = overwriteTexts.getByKey(oFF.SacTableConstants.S_VALUE_EXCEPTION_NO_VALUE);
				}
			}
			aggregation.setText(formattedValue);
		}
	}
	return result;
};
oFF.SacTableAggregation.getEmptyDimHeader = function(axis, queryModel, overwriteTexts)
{
	var i;
	var j;
	var dimensions = axis.getDimensions();
	var size = dimensions.size();
	var result = oFF.XLinkedHashMapByString.create();
	var index = 0;
	var text;
	var aggregation;
	for (i = 0; i < size; i++)
	{
		var baseDimension = dimensions.get(i);
		var dimension = queryModel.getDimensionByName(baseDimension.getName());
		var mainAttribute = dimension.getMainAttribute();
		var resultSetFields;
		text = dimension.getText();
		if (oFF.isNull(text))
		{
			text = dimension.getName();
		}
		var rsfSize;
		var field;
		if (dimension.isUniversalDisplayHierarchyDimension())
		{
			resultSetFields = baseDimension.getResultSetFields();
			rsfSize = resultSetFields.size();
			for (j = 0; j < rsfSize; j++)
			{
				text = oFF.SacTableAggregation.getUdhDimText(queryModel, dimension, overwriteTexts, j);
				field = dimension.getFieldByName(resultSetFields.get(j).getName());
				aggregation = oFF.SacTableAggregation.create(text, field.getName(), dimension, null, null, -1, field, index, true, i, null, null, null, false, null, null);
				aggregation.setLowerLevelNodeAlignment(dimension.getLowerLevelNodeAlignment());
				result.put(field.getName(), aggregation);
				index++;
			}
		}
		else
		{
			var fieldLayoutType = dimension.getFieldLayoutType();
			resultSetFields = baseDimension.getResultSetFields();
			var mainFields = mainAttribute.getFields();
			var curAttribute;
			var visitedAttributes = oFF.XSetOfNameObject.create();
			var attributeText = "";
			rsfSize = resultSetFields.size();
			for (j = 0; j < rsfSize; j++)
			{
				field = dimension.getFieldByName(resultSetFields.get(j).getName());
				curAttribute = field.getAttribute();
				if (oFF.notNull(curAttribute) && !visitedAttributes.contains(curAttribute))
				{
					attributeText = curAttribute.getText();
					if (oFF.isNull(attributeText))
					{
						attributeText = curAttribute.getName();
					}
					if (curAttribute === dimension.getMainAttribute())
					{
						attributeText = oFF.SacTableAggregation.getDimText(overwriteTexts, dimension);
					}
				}
				if (field.getObtainability() === oFF.ObtainabilityType.USER_INTERFACE)
				{
					continue;
				}
				var inMainFields = mainFields.contains(field);
				if (inMainFields || fieldLayoutType === oFF.FieldLayoutType.ATTRIBUTE_BASED)
				{
					text = attributeText;
					attributeText = "";
				}
				else
				{
					text = field.getText();
					if (oFF.isNull(text))
					{
						text = field.getName();
					}
				}
				if (oFF.notNull(curAttribute))
				{
					visitedAttributes.add(curAttribute);
				}
				aggregation = oFF.SacTableAggregation.create(text, field.getName(), dimension, null, null, -1, field, index, inMainFields, i, null, null, null, false, null, null);
				aggregation.setLowerLevelNodeAlignment(dimension.getLowerLevelNodeAlignment());
				result.put(field.getName(), aggregation);
				index++;
			}
		}
	}
	return result;
};
oFF.SacTableAggregation.getUdhDimText = function(queryModel, dimension, overwriteTexts, index)
{
	var text = "";
	if (index === 0)
	{
		var dimensionsInUdh = dimension.getQueryModel().getUniversalDisplayHierarchies().getByAxisType(dimension.getAxisType()).getDimensionNames();
		var dimTextList = oFF.XStream.ofString(dimensionsInUdh).map( function(str){
			return queryModel.getDimensionByName(str.getString());
		}.bind(this)).collect(oFF.XStreamCollector.toListOfString( function(dim){
			return oFF.SacTableAggregation.getDimText(overwriteTexts, dim);
		}.bind(this)));
		text = oFF.XCollectionUtils.join(dimTextList, "/");
	}
	return text;
};
oFF.SacTableAggregation.getDimText = function(overwriteTexts, dimension)
{
	var dimPres = dimension.getText();
	if (dimension.getDimensionType().isTypeOf(oFF.DimensionType.MEASURE_STRUCTURE) && oFF.XStringUtils.isNotNullAndNotEmpty(overwriteTexts.getByKey(oFF.SacTableConstants.S_MEASURE_DIMENSION_OVERWRITE_TEXT)))
	{
		dimPres = overwriteTexts.getByKey(oFF.SacTableConstants.S_MEASURE_DIMENSION_OVERWRITE_TEXT);
	}
	else if (dimension.getDimensionType().isTypeOf(oFF.DimensionType.SECONDARY_STRUCTURE) && oFF.XStringUtils.isNotNullAndNotEmpty(overwriteTexts.getByKey(oFF.SacTableConstants.S_STRUCTURE_DIMENSION_OVERWRITE_TEXT)))
	{
		dimPres = overwriteTexts.getByKey(oFF.SacTableConstants.S_STRUCTURE_DIMENSION_OVERWRITE_TEXT);
	}
	if (oFF.isNull(dimPres))
	{
		dimPres = dimension.getName();
	}
	return dimPres;
};
oFF.SacTableAggregation.getDimHeader = function(cursorAxis, queryModel, overwriteTexts)
{
	var i;
	var j;
	var dimensions = cursorAxis.getRsDimensions();
	var size = dimensions.size();
	var result = oFF.XLinkedHashMapByString.create();
	var index = 0;
	var text;
	var aggregation;
	for (i = 0; i < size; i++)
	{
		var baseDimension = dimensions.get(i);
		var dimension = queryModel.getDimensionByName(baseDimension.getName());
		var mainAttribute = dimension.getMainAttribute();
		var resultSetFields;
		text = dimension.getText();
		if (oFF.isNull(text))
		{
			text = dimension.getName();
		}
		var rsfSize;
		var field;
		if (dimension.isUniversalDisplayHierarchyDimension())
		{
			resultSetFields = baseDimension.getResultSetFields();
			rsfSize = resultSetFields.size();
			for (j = 0; j < rsfSize; j++)
			{
				field = dimension.getFieldByName(resultSetFields.get(j).getName());
				text = oFF.SacTableAggregation.getUdhDimText(queryModel, dimension, overwriteTexts, j);
				aggregation = oFF.SacTableAggregation.create(text, field.getName(), dimension, null, null, -1, field, index, true, i, null, null, null, false, null, null);
				aggregation.setLowerLevelNodeAlignment(dimension.getLowerLevelNodeAlignment());
				result.put(field.getName(), aggregation);
				index++;
			}
		}
		else
		{
			var fieldLayoutType = dimension.getFieldLayoutType();
			resultSetFields = baseDimension.getResultSetFields();
			var mainFields = mainAttribute.getFields();
			var curAttribute;
			var visitedAttributes = oFF.XSetOfNameObject.create();
			var attributeText = text;
			rsfSize = resultSetFields.size();
			for (j = 0; j < rsfSize; j++)
			{
				field = dimension.getFieldByName(resultSetFields.get(j).getName());
				curAttribute = field.getAttribute();
				if (oFF.notNull(curAttribute) && !visitedAttributes.contains(curAttribute))
				{
					attributeText = curAttribute.getText();
					if (oFF.isNull(attributeText))
					{
						attributeText = curAttribute.getName();
					}
					if (curAttribute === dimension.getMainAttribute())
					{
						attributeText = oFF.SacTableAggregation.getDimText(overwriteTexts, dimension);
					}
				}
				if (field.getObtainability() === oFF.ObtainabilityType.USER_INTERFACE)
				{
					continue;
				}
				var inMainFields = mainFields.contains(field);
				if (inMainFields || fieldLayoutType === oFF.FieldLayoutType.ATTRIBUTE_BASED)
				{
					text = attributeText;
					attributeText = "";
				}
				else
				{
					text = field.getText();
					if (oFF.isNull(text))
					{
						text = field.getName();
					}
				}
				if (oFF.notNull(curAttribute))
				{
					visitedAttributes.add(curAttribute);
				}
				aggregation = oFF.SacTableAggregation.create(text, field.getName(), dimension, null, null, -1, field, index, inMainFields, i, null, null, null, false, null, null);
				aggregation.setLowerLevelNodeAlignment(dimension.getLowerLevelNodeAlignment());
				result.put(field.getName(), aggregation);
				index++;
			}
		}
	}
	return result;
};
oFF.SacTableAggregation.getSimplifiedUniqueName = function(elementPath)
{
	var simplifiedName = "";
	for (var i = 0; i < elementPath.size(); i++)
	{
		var pathElement = elementPath.get(i);
		simplifiedName = oFF.XStringUtils.concatenate5(simplifiedName, "::[", pathElement.getDimension().getName(), "]==>", pathElement.getName());
	}
	return simplifiedName;
};
oFF.SacTableAggregation.prototype.m_drillState = null;
oFF.SacTableAggregation.prototype.m_displayLevel = 0;
oFF.SacTableAggregation.prototype.m_text = null;
oFF.SacTableAggregation.prototype.m_plain = null;
oFF.SacTableAggregation.prototype.m_dimension = null;
oFF.SacTableAggregation.prototype.m_parent = null;
oFF.SacTableAggregation.prototype.m_field = null;
oFF.SacTableAggregation.prototype.m_index = 0;
oFF.SacTableAggregation.prototype.m_dimensionIndex = 0;
oFF.SacTableAggregation.prototype.m_isMainAttribute = false;
oFF.SacTableAggregation.prototype.m_dimensionMemberType = null;
oFF.SacTableAggregation.prototype.m_dimensionMemberName = null;
oFF.SacTableAggregation.prototype.m_pathKey = null;
oFF.SacTableAggregation.prototype.m_repeatedMemberName = false;
oFF.SacTableAggregation.prototype.m_dimensionSectionEnd = false;
oFF.SacTableAggregation.prototype.m_valueException = null;
oFF.SacTableAggregation.prototype.m_dimensionMemberValueException = null;
oFF.SacTableAggregation.prototype.m_parentDimensionMemberName = null;
oFF.SacTableAggregation.prototype.m_hierarchyLevelStart = false;
oFF.SacTableAggregation.prototype.m_hierarchyLevelEnd = false;
oFF.SacTableAggregation.prototype.m_lowerLevelNodeAlignment = null;
oFF.SacTableAggregation.prototype.setLowerLevelNodeAlignment = function(lowerLevelNodeAlignment)
{
	this.m_lowerLevelNodeAlignment = lowerLevelNodeAlignment;
};
oFF.SacTableAggregation.prototype.setHierarchyLevelStart = function(levelStart)
{
	this.m_hierarchyLevelStart = levelStart;
};
oFF.SacTableAggregation.prototype.setHierarchyLevelEnd = function(levelEnd)
{
	this.m_hierarchyLevelEnd = levelEnd;
};
oFF.SacTableAggregation.prototype.findParent = function(tableAggregation)
{
	return oFF.isNull(this.m_parent) ? false : this.m_parent === tableAggregation || this.m_parent.findParent(tableAggregation);
};
oFF.SacTableAggregation.prototype.getText = function()
{
	return this.m_text;
};
oFF.SacTableAggregation.prototype.setText = function(formattedValue)
{
	this.m_text = formattedValue;
};
oFF.SacTableAggregation.prototype.getPlain = function()
{
	return this.m_plain;
};
oFF.SacTableAggregation.prototype.getDimension = function()
{
	return this.m_dimension;
};
oFF.SacTableAggregation.prototype.getIndex = function()
{
	return this.m_index;
};
oFF.SacTableAggregation.prototype.isMainAttribute = function()
{
	return this.m_isMainAttribute;
};
oFF.SacTableAggregation.prototype.getLowerLevelNodeAlignment = function()
{
	return this.m_lowerLevelNodeAlignment;
};
oFF.SacTableAggregation.prototype.getDimensionIndex = function()
{
	return this.m_dimensionIndex;
};
oFF.SacTableAggregation.prototype.getField = function()
{
	return this.m_field;
};
oFF.SacTableAggregation.prototype.getDrillState = function()
{
	return this.m_drillState;
};
oFF.SacTableAggregation.prototype.getDisplayLevel = function()
{
	return this.m_displayLevel;
};
oFF.SacTableAggregation.prototype.getDimensionMemberType = function()
{
	return this.m_dimensionMemberType;
};
oFF.SacTableAggregation.prototype.getDimensionMemberName = function()
{
	return this.m_dimensionMemberName;
};
oFF.SacTableAggregation.prototype.getPathKey = function()
{
	return this.m_pathKey;
};
oFF.SacTableAggregation.prototype.getValueException = function()
{
	return this.m_valueException;
};
oFF.SacTableAggregation.prototype.getDimensionMemberValueException = function()
{
	return this.m_dimensionMemberValueException;
};
oFF.SacTableAggregation.prototype.getParentDimensionMemberName = function()
{
	return this.m_parentDimensionMemberName;
};
oFF.SacTableAggregation.prototype.isRepeatedMemberName = function()
{
	return this.m_repeatedMemberName;
};
oFF.SacTableAggregation.prototype.isDimensionSectionEndEnd = function()
{
	return this.m_dimensionSectionEnd;
};
oFF.SacTableAggregation.prototype.isDimensionSectionStart = function()
{
	return !this.m_repeatedMemberName;
};
oFF.SacTableAggregation.prototype.isHierarchyLevelStart = function()
{
	return this.m_hierarchyLevelStart;
};
oFF.SacTableAggregation.prototype.isHierarchyLevelEnd = function()
{
	return this.m_hierarchyLevelEnd;
};
oFF.SacTableAggregation.prototype.getParent = function()
{
	return this.m_parent;
};
oFF.SacTableAggregation.prototype.setParent = function(tableAggregation)
{
	this.m_parent = tableAggregation;
};
oFF.SacTableAggregation.prototype.setDimensionSectionEnd = function()
{
	this.m_dimensionSectionEnd = true;
};
oFF.SacTableAggregation.prototype.releaseObject = function()
{
	this.m_drillState = null;
	this.m_displayLevel = 0;
	this.m_text = null;
	this.m_plain = null;
	this.m_dimension = null;
	this.m_field = null;
	this.m_index = 0;
	this.m_dimensionIndex = 0;
	this.m_isMainAttribute = false;
	this.m_dimensionMemberType = null;
	this.m_dimensionMemberName = null;
	this.m_pathKey = null;
	this.m_repeatedMemberName = false;
	oFF.XObject.prototype.releaseObject.call( this );
};

oFF.OlapVizToPivotConverterUtil = {

	getTableAxisTypeFromViz:function(axisType)
	{
			if (axisType === oFF.AxisType.ROWS)
		{
			return oFF.SacTableAxisType.ROWS;
		}
		if (axisType === oFF.AxisType.COLUMNS)
		{
			return oFF.SacTableAxisType.COLUMNS;
		}
		return null;
	},
	getAlertLevelFromViz:function(alertLevel)
	{
			return oFF.isNull(alertLevel) ? null : oFF.SacAlertLevel.getByLevelValue(alertLevel.getLevel());
	},
	getAlertSymbolFromViz:function(alertSymbol)
	{
			var result = null;
		if (oFF.notNull(alertSymbol))
		{
			if (alertSymbol === oFF.AlertSymbol.ALERT)
			{
				result = oFF.SacAlertSymbol.ALERT;
			}
			else if (alertSymbol === oFF.AlertSymbol.WARNING)
			{
				result = oFF.SacAlertSymbol.WARNING;
			}
			else if (alertSymbol === oFF.AlertSymbol.GOOD)
			{
				result = oFF.SacAlertSymbol.GOOD;
			}
			else if (alertSymbol === oFF.AlertSymbol.DIAMOND)
			{
				result = oFF.SacAlertSymbol.DIAMOND;
			}
		}
		return result;
	},
	getCellChartOrientationFromViz:function(cellChartOrientation)
	{
			return cellChartOrientation === oFF.CellChartOrientation.VERTICAL ? oFF.SacCellChartOrientation.VERTICAL : oFF.SacCellChartOrientation.HORIZONTAL;
	},
	getCellChartTypeFromViz:function(cellChartType)
	{
			if (cellChartType === oFF.CellChartType.BAR)
		{
			return oFF.SacCellChartType.BAR;
		}
		else if (cellChartType === oFF.CellChartType.VARIANCE_BAR)
		{
			return oFF.SacCellChartType.VARIANCE_BAR;
		}
		else if (cellChartType === oFF.CellChartType.PIN)
		{
			return oFF.SacCellChartType.PIN;
		}
		return null;
	},
	getLinePatternTypeFromViz:function(linePatternType)
	{
			return oFF.isNull(linePatternType) ? null : oFF.SacLinePatternType.lookup(linePatternType.getName());
	},
	getLineStyleFromViz:function(lineStyle)
	{
			return oFF.isNull(lineStyle) ? null : oFF.SacTableLineStyle.lookup(lineStyle.getName());
	},
	getTableMemberHeaderHandlingFromViz:function(tableMemberHeaderHandling)
	{
			var result = null;
		if (oFF.notNull(tableMemberHeaderHandling))
		{
			result = oFF.SacTableMemberHeaderHandling.lookup(tableMemberHeaderHandling.getName());
		}
		return result;
	},
	getTablePageBreakHandlingFromViz:function(tablePageBreakHandling)
	{
			var result = null;
		if (oFF.notNull(tablePageBreakHandling))
		{
			result = oFF.SacTablePageBreakHandling.lookup(tablePageBreakHandling.getName());
		}
		return result;
	},
	getValueSignFromViz:function(valueSign)
	{
			var result = null;
		if (oFF.notNull(valueSign))
		{
			if (valueSign === oFF.ValueSign.NORMAL)
			{
				result = oFF.SacValueSign.NORMAL;
			}
			else if (valueSign === oFF.ValueSign.NEGATIVE)
			{
				result = oFF.SacValueSign.NEGATIVE;
			}
			else if (valueSign === oFF.ValueSign.ZERO)
			{
				result = oFF.SacValueSign.ZERO;
			}
			else if (valueSign === oFF.ValueSign.POSITIVE)
			{
				result = oFF.SacValueSign.POSITIVE;
			}
			else if (valueSign === oFF.ValueSign.NULL_VALUE)
			{
				result = oFF.SacValueSign.NULL_VALUE;
			}
			else if (valueSign === oFF.ValueSign.UNBOOKED)
			{
				result = oFF.SacValueSign.UNBOOKED;
			}
			else if (valueSign === oFF.ValueSign.UNDEFINED)
			{
				result = oFF.SacValueSign.UNDEFINED;
			}
		}
		return result;
	},
	getVerticalAlignmentFromViz:function(verticalAlignment)
	{
			var result = null;
		if (verticalAlignment === oFF.CellAlignmentVertical.TOP)
		{
			result = oFF.SacTableCellVerticalAlignment.TOP;
		}
		else if (verticalAlignment === oFF.CellAlignmentVertical.MIDDLE)
		{
			result = oFF.SacTableCellVerticalAlignment.MIDDLE;
		}
		else if (verticalAlignment === oFF.CellAlignmentVertical.BOTTOM)
		{
			result = oFF.SacTableCellVerticalAlignment.BOTTOM;
		}
		else if (verticalAlignment === oFF.CellAlignmentVertical.INHERIT)
		{
			result = oFF.SacTableCellVerticalAlignment.INHERIT;
		}
		return result;
	},
	getHorizontalAlignmentFromViz:function(horizontalAlignment)
	{
			var result = null;
		if (horizontalAlignment === oFF.CellAlignmentHorizontal.LEFT)
		{
			result = oFF.SacTableCellHorizontalAlignment.LEFT;
		}
		else if (horizontalAlignment === oFF.CellAlignmentHorizontal.CENTER)
		{
			result = oFF.SacTableCellHorizontalAlignment.CENTER;
		}
		else if (horizontalAlignment === oFF.CellAlignmentHorizontal.RIGHT)
		{
			result = oFF.SacTableCellHorizontalAlignment.RIGHT;
		}
		else if (horizontalAlignment === oFF.CellAlignmentHorizontal.INHERIT)
		{
			result = oFF.SacTableCellHorizontalAlignment.INHERIT;
		}
		return result;
	},
	applyHeaderSectionInfoFromViz:function(headerSectionInfo, sacHeaderSectionInfo)
	{
			if (headerSectionInfo.isDimensionLevel())
		{
			sacHeaderSectionInfo.setHeaderLevel(0);
		}
		else if (headerSectionInfo.isAttributeLevel())
		{
			sacHeaderSectionInfo.setHeaderLevel(1);
		}
		else if (headerSectionInfo.isFieldLevel())
		{
			sacHeaderSectionInfo.setHeaderLevel(2);
		}
		else
		{
			sacHeaderSectionInfo.setHeaderLevel(-1);
		}
		sacHeaderSectionInfo.setHeaderName(headerSectionInfo.getHeaderName());
		sacHeaderSectionInfo.setExactHeaderLevel(headerSectionInfo.isExactHeaderLevel());
		sacHeaderSectionInfo.setAxisLevel(headerSectionInfo.getAxisLevel());
	},
	applyHeaderSectionInfoFromField:function(field, tableAxis)
	{
			var attribute = field.getAttribute();
		var dimension = field.getDimension();
		var startOfDimension = false;
		var endOfDimension = false;
		var startOfAttribute = false;
		var endOfAttribute = false;
		var fieldFilter =  function(fi){
			return fi.getObtainability() === null || fi.getObtainability() === oFF.ObtainabilityType.ALWAYS;
		}.bind(this);
		if (oFF.isNull(attribute) || dimension.getFieldLayoutType() === oFF.FieldLayoutType.FIELD_BASED)
		{
			var drsf = oFF.XStream.of(dimension.getResultSetFields()).filter(fieldFilter).collect(oFF.XStreamCollector.toList());
			startOfDimension = drsf.getIndex(field) === 0;
			startOfAttribute = startOfDimension;
			endOfDimension = drsf.getIndex(field) === drsf.size() - 1;
			endOfAttribute = endOfDimension;
		}
		else
		{
			var rsa = dimension.getResultSetAttributes();
			var arsf = oFF.XStream.of(attribute.getResultSetFields()).filter(fieldFilter).collect(oFF.XStreamCollector.toList());
			startOfAttribute = arsf.getIndex(field) === 0;
			endOfAttribute = arsf.getIndex(field) === arsf.size() - 1;
			startOfDimension = startOfAttribute && rsa.getIndex(attribute) === 0;
			endOfDimension = endOfAttribute && rsa.getIndex(attribute) === rsa.size() - 1;
		}
		var dimensionHeader = tableAxis.addPartOfHeaderSectionInfo(startOfDimension, endOfDimension);
		dimensionHeader.setHeaderLevel(0);
		dimensionHeader.setHeaderName(dimension.getName());
		dimensionHeader.setAxisLevel(dimension.getIndexOnAxis());
		var attributeHeader = tableAxis.addPartOfHeaderSectionInfo(startOfAttribute, endOfAttribute);
		attributeHeader.setHeaderLevel(1);
		attributeHeader.setHeaderName(oFF.isNull(attribute) ? dimension.getName() : attribute.getName());
		var fieldHeader = tableAxis.addPartOfHeaderSectionInfo(true, true);
		fieldHeader.setHeaderLevel(2);
		fieldHeader.setHeaderName(field.getName());
	},
	applyDataSectionInfoFromViz:function(axisPathElement, sacDataSectionInfo)
	{
			sacDataSectionInfo.setGroupName(axisPathElement.getDimensionName());
		sacDataSectionInfo.setSectionLevelName(axisPathElement.getHierarchyLevelName());
		sacDataSectionInfo.clearSectionNodeNames();
		oFF.XCollectionUtils.forEachString(axisPathElement.getMemberNames(),  function(snn){
			sacDataSectionInfo.addSectionNodeName(snn);
		}.bind(this));
		sacDataSectionInfo.setGroupLevel(axisPathElement.getAxisLevel());
		sacDataSectionInfo.setSectionLevel(axisPathElement.getHierarchyLevel());
		sacDataSectionInfo.setExactSectionLevel(axisPathElement.isExactHierarchyLevel());
		sacDataSectionInfo.setIncludeHeaderBand(axisPathElement.isIncludeHeaderBand());
		sacDataSectionInfo.setIncludeTotalsBand(axisPathElement.isIncludeTotalsBand());
		sacDataSectionInfo.setIncludeInnerBands(axisPathElement.isIncludeSubDrills());
		sacDataSectionInfo.setMatchesExpanded(axisPathElement.isMatchesExpanded());
		if (axisPathElement.getHierarchyAlignment() === oFF.Alignment.CHILDREN_ABOVE_PARENT)
		{
			sacDataSectionInfo.setMatchesHierarchyBottomUp(oFF.TriStateBool._TRUE);
		}
		else if (axisPathElement.getHierarchyAlignment() === oFF.Alignment.CHILDREN_BELOW_PARENT)
		{
			sacDataSectionInfo.setMatchesHierarchyBottomUp(oFF.TriStateBool._FALSE);
		}
		sacDataSectionInfo.setMatchesLeaves(axisPathElement.isMatchesLeaves());
	},
	applyPathInfoFromViz:function(axisPath, sacPath)
	{
			sacPath.setMatchingGroupSectionStart(axisPath.isMatchingDimensionSectionStart());
		sacPath.setMatchingGroupSectionEnd(axisPath.isMatchingDimensionSectionEnd());
		sacPath.setMatchingExactLevelStart(axisPath.isMatchingHierarchyLevelStart());
		sacPath.setMatchingExactLevelEnd(axisPath.isMatchingHierarchyLevelEnd());
		oFF.XCollectionUtils.forEach(axisPath,  function(element){
			oFF.OlapVizToPivotConverterUtil.applyDataSectionInfoFromViz(element, sacPath.addNewPathElement());
		}.bind(this));
	},
	applyDataSectionInfoFromTuple:function(tableAggregations, keys, tableAxis)
	{
			var keysIterator = keys.getIterator();
		var dataPath = tableAxis.getDataPath();
		while (keysIterator.hasNext())
		{
			var key = keysIterator.next();
			var tableAggregation = tableAggregations.getByKey(key);
			dataPath = oFF.OlapVizToPivotConverterUtil.applyDataSectionInfoFromElement(dataPath, tableAggregation);
		}
	},
	applyDataSectionInfoFromElement:function(dataPath, tableAggregation)
	{
			oFF.OlapVizToPivotConverterUtil.createDataPathElementFromTableAggregation(dataPath, tableAggregation).setExactSectionLevel(true);
		dataPath.updateMaxLevel(tableAggregation.getDimensionIndex());
		var parentAggregation = tableAggregation.getParent();
		while (oFF.notNull(parentAggregation))
		{
			oFF.OlapVizToPivotConverterUtil.createDataPathElementFromTableAggregation(dataPath, parentAggregation).setExactSectionLevel(false);
			parentAggregation = parentAggregation.getParent();
		}
		return dataPath;
	},
	createDataPathElementFromTableAggregation:function(dataPath, tableAggregation)
	{
			var dataPathElement = dataPath.addNewPathElement();
		dataPathElement.setGroupLevelStart(tableAggregation.isDimensionSectionStart());
		dataPathElement.setGroupLevelEnd(tableAggregation.isDimensionSectionEndEnd());
		dataPathElement.setSectionLevelStart(tableAggregation.isHierarchyLevelStart());
		dataPathElement.setSectionLevelEnd(tableAggregation.isHierarchyLevelEnd());
		var isTotal = tableAggregation.getDimensionMemberType().isTypeOf(oFF.MemberType.RESULT);
		dataPathElement.setTotalBand(isTotal);
		dataPathElement.setInnerBand(!isTotal);
		dataPathElement.setGroupName(tableAggregation.getDimension().getName());
		dataPathElement.setGroupLevel(tableAggregation.getDimensionIndex());
		dataPathElement.setSectionLevel(tableAggregation.getDisplayLevel());
		var drillState = tableAggregation.getDrillState();
		dataPathElement.setLeaf(oFF.isNull(drillState) || drillState === oFF.DrillState.LEAF);
		dataPathElement.setExpanded(drillState === oFF.DrillState.EXPANDED || drillState === oFF.DrillState.DRILLED);
		dataPathElement.setHierarchyBottomUp(tableAggregation.getLowerLevelNodeAlignment() === oFF.Alignment.CHILDREN_ABOVE_PARENT);
		dataPathElement.setSectionNodeName(tableAggregation.getDimensionMemberName());
		return dataPathElement;
	},
	applyDataPointStyleFromViz:function(vizDataPointStyle, sacDataPointStyle)
	{
			sacDataPointStyle.setExceptionName(vizDataPointStyle.getExceptionName());
		sacDataPointStyle.setAlertLevelMin(oFF.OlapVizToPivotConverterUtil.getAlertLevelFromViz(vizDataPointStyle.getAlertLevelMin()));
		sacDataPointStyle.setAlertLevelMax(oFF.OlapVizToPivotConverterUtil.getAlertLevelFromViz(vizDataPointStyle.getAlertLevelMax()));
		sacDataPointStyle.setValueSign(oFF.OlapVizToPivotConverterUtil.getValueSignFromViz(vizDataPointStyle.getValueSign()));
		oFF.OlapVizToPivotConverterUtil.applyTableStyleFromViz(vizDataPointStyle.getFormattingStyle(), sacDataPointStyle.getTableStyle());
		sacDataPointStyle.setPriority(vizDataPointStyle.getPriority());
	},
	applyScopedStyleFromViz:function(vizScopedTableStyle, scopedStyle)
	{
			oFF.OlapVizToPivotConverterUtil.applyTableStyleFromViz(vizScopedTableStyle.getStyle(), scopedStyle.getStyle());
		oFF.OlapVizToPivotConverterUtil.applyCellsReferenceScopeFromViz(vizScopedTableStyle.getOrthogonalColumnsScope(), scopedStyle.getOrthogonalColumnsRestriction());
		oFF.OlapVizToPivotConverterUtil.applyCellsReferenceScopeFromViz(vizScopedTableStyle.getOrthogonalRowsScope(), scopedStyle.getOrthogonalRowsRestriction());
	},
	applyCellsReferenceScopeFromViz:function(vizCellsReferenceScope, sectionReference)
	{
			var headerSectionInfos = vizCellsReferenceScope.getHeaderSectionInfos().getIterator();
		sectionReference.clearHeaderSectionsInfos();
		while (headerSectionInfos.hasNext())
		{
			oFF.OlapVizToPivotConverterUtil.applyHeaderSectionInfoFromViz(headerSectionInfos.next(), sectionReference.addNewHeaderSectionInfo());
		}
		sectionReference.setMatchHeaderSectionStart(vizCellsReferenceScope.isMatchHeaderSectionStart());
		sectionReference.setMatchHeaderSectionEnd(vizCellsReferenceScope.isMatchHeaderSectionEnd());
		sectionReference.setMatchFullHeaderSection(vizCellsReferenceScope.isMatchFullHeaderSection());
		var dataPaths = vizCellsReferenceScope.getAxisPaths().getIterator();
		sectionReference.clearDataPaths();
		while (dataPaths.hasNext())
		{
			oFF.OlapVizToPivotConverterUtil.applyPathInfoFromViz(dataPaths.next(), sectionReference.addNewDataPath());
		}
		sectionReference.setMatchDataSectionStart(vizCellsReferenceScope.isMatchDataSectionStart());
		sectionReference.setMatchDataSectionEnd(vizCellsReferenceScope.isMatchDataSectionEnd());
		sectionReference.setMatchFullDataSection(vizCellsReferenceScope.isMatchFullDataSection());
		sectionReference.setMatchModulo(vizCellsReferenceScope.getMatchModulo());
		sectionReference.setMatchOrdinal(vizCellsReferenceScope.getMatchOrdinal());
	},
	applyTableStyleFromViz:function(formattingStyle, sacTableStyle)
	{
			sacTableStyle.setFillColor(formattingStyle.getFillColor());
		oFF.OlapVizToPivotConverterUtil.transferStyledLine(sacTableStyle.getStyledLineTop(), formattingStyle.getStyledLineTop());
		oFF.OlapVizToPivotConverterUtil.transferStyledLine(sacTableStyle.getStyledLineBottom(), formattingStyle.getStyledLineBottom());
		oFF.OlapVizToPivotConverterUtil.transferStyledLine(sacTableStyle.getStyledLineLeft(), formattingStyle.getStyledLineLeft());
		oFF.OlapVizToPivotConverterUtil.transferStyledLine(sacTableStyle.getStyledLineRight(), formattingStyle.getStyledLineRight());
		sacTableStyle.setBackgroundContent(formattingStyle.getBackgroundContent());
		sacTableStyle.setBackgroundPatternType(oFF.OlapVizToPivotConverterUtil.getLinePatternTypeFromViz(formattingStyle.getBackgroundPatternType()));
		sacTableStyle.setFontItalicExt(formattingStyle.isFontItalicExt());
		sacTableStyle.setFontBoldExt(formattingStyle.isFontBoldExt());
		sacTableStyle.setFontUnderlineExt(formattingStyle.isFontUnderlineExt());
		sacTableStyle.setFontStrikeThroughExt(formattingStyle.isFontStrikeThroughExt());
		sacTableStyle.setFontSize(formattingStyle.getFontSize());
		sacTableStyle.setFontFamily(formattingStyle.getFontFamily());
		sacTableStyle.setFontColor(formattingStyle.getFontColor());
		sacTableStyle.setCellChartLineColor(formattingStyle.getCellChartLineColor());
		sacTableStyle.setCellChartBarColor(formattingStyle.getCellChartBarColor());
		sacTableStyle.setThresholdType(oFF.OlapVizToPivotConverterUtil.getAlertSymbolFromViz(formattingStyle.getAlertSymbol()));
		sacTableStyle.setThresholdColor(formattingStyle.getAlertColor());
		sacTableStyle.setVerticalAlignment(oFF.OlapVizToPivotConverterUtil.getVerticalAlignmentFromViz(formattingStyle.getVerticalAlignment()));
		sacTableStyle.setHorizontalAlignment(oFF.OlapVizToPivotConverterUtil.getHorizontalAlignmentFromViz(formattingStyle.getHorizontalAlignment()));
	},
	transferStyledLine:function(lineStyleSac, lineStyleOlap)
	{
			lineStyleSac.setLeftPadding(lineStyleOlap.getLeftPadding());
		lineStyleSac.setRightPadding(lineStyleOlap.getRightPadding());
		lineStyleSac.setTopPadding(lineStyleOlap.getTopPadding());
		lineStyleSac.setBottomPadding(lineStyleOlap.getBottomPadding());
		lineStyleSac.setColor(lineStyleOlap.getColor());
		lineStyleSac.setWidth(lineStyleOlap.getWidth());
		lineStyleSac.setPatternWidth(lineStyleOlap.getPatternWidth());
		lineStyleSac.setPatternBackground(lineStyleOlap.getPatternBackground());
		lineStyleSac.setPatternColor(lineStyleOlap.getPatternColor());
		lineStyleSac.setPatternBorderColor(lineStyleOlap.getPatternBorderColor());
		lineStyleSac.setPatternType(oFF.OlapVizToPivotConverterUtil.getLinePatternTypeFromViz(lineStyleOlap.getPatternType()));
		lineStyleSac.setLineStyle(oFF.OlapVizToPivotConverterUtil.getLineStyleFromViz(lineStyleOlap.getLineStyle()));
	},
	applyInsertedTupleFromViz:function(vizTuple, sacTuple)
	{
			var tableDefinition = vizTuple.getTableDefinition();
		sacTuple.setCellWidth(vizTuple.getCellWidth());
		sacTuple.setCellHeight(vizTuple.getCellHeight());
		sacTuple.setFormattedText(vizTuple.getFormattedText());
		sacTuple.setMerged(vizTuple.isMerged());
		var vizScopedStyles = vizTuple.getScopedStyleNames().getIterator();
		while (vizScopedStyles.hasNext())
		{
			oFF.OlapVizToPivotConverterUtil.applyScopedStyleFromViz(tableDefinition.getScopedStyle(vizScopedStyles.next()), sacTuple.addNewScopedStyle());
		}
	},
	applyTableMarkupFromViz:function(vizTableMarkup, sacTableMarkup)
	{
			var tableDefinition = vizTableMarkup.getTableDefinition();
		sacTableMarkup.setHide(vizTableMarkup.isHide());
		sacTableMarkup.setCellHeight(vizTableMarkup.getCellHeight());
		sacTableMarkup.setCellWidth(vizTableMarkup.getCellWidth());
		sacTableMarkup.setPriority(vizTableMarkup.getPriority());
		sacTableMarkup.setPageBreakHandlingBefore(oFF.OlapVizToPivotConverterUtil.getTablePageBreakHandlingFromViz(vizTableMarkup.getPageBreakHandlingBefore()));
		sacTableMarkup.setPageBreakHandlingInside(oFF.OlapVizToPivotConverterUtil.getTablePageBreakHandlingFromViz(vizTableMarkup.getPageBreakHandlingInside()));
		sacTableMarkup.setPageBreakHandlingAfter(oFF.OlapVizToPivotConverterUtil.getTablePageBreakHandlingFromViz(vizTableMarkup.getPageBreakHandlingAfter()));
		oFF.OlapVizToPivotConverterUtil.applyCellsReferenceScopeFromViz(vizTableMarkup.getColumnsScope(), sacTableMarkup.getColumnsScope());
		oFF.OlapVizToPivotConverterUtil.applyCellsReferenceScopeFromViz(vizTableMarkup.getRowsScope(), sacTableMarkup.getRowsScope());
		var vizScopedStyles = vizTableMarkup.getScopedStyleNames().getIterator();
		while (vizScopedStyles.hasNext())
		{
			var newScopedStyle = sacTableMarkup.addNewScopedStyle();
			oFF.OlapVizToPivotConverterUtil.applyScopedStyleFromViz(tableDefinition.getScopedStyle(vizScopedStyles.next()), newScopedStyle);
			if (newScopedStyle.getPriority() < 0 && sacTableMarkup.getPriority() > -1)
			{
				newScopedStyle.setPriority(sacTableMarkup.getPriority());
			}
		}
		var vizInsertedTuples = vizTableMarkup.getTuplesBefore().getIterator();
		while (vizInsertedTuples.hasNext())
		{
			oFF.OlapVizToPivotConverterUtil.applyInsertedTupleFromViz(vizInsertedTuples.next(), sacTableMarkup.addNewTupleBefore());
		}
		vizInsertedTuples = vizTableMarkup.getTuplesAfter().getIterator();
		while (vizInsertedTuples.hasNext())
		{
			oFF.OlapVizToPivotConverterUtil.applyInsertedTupleFromViz(vizInsertedTuples.next(), sacTableMarkup.addNewTupleAfter());
		}
	},
	applyHighlightingFromViz:function(vizHighlightArea, sacTableHighlightArea)
	{
			sacTableHighlightArea.setHighlightColor(vizHighlightArea.getHighlightColor());
		sacTableHighlightArea.setPriority(vizHighlightArea.getPriority());
		oFF.OlapVizToPivotConverterUtil.applyCellsReferenceScopeFromViz(vizHighlightArea.getColumnsReference(), sacTableHighlightArea.getColumnsReference());
		oFF.OlapVizToPivotConverterUtil.applyCellsReferenceScopeFromViz(vizHighlightArea.getRowsReference(), sacTableHighlightArea.getRowsReference());
	}
};

oFF.GoogleChartBar = function() {};
oFF.GoogleChartBar.prototype = new oFF.GoogleChart();
oFF.GoogleChartBar.prototype._ff_c = "GoogleChartBar";

oFF.GoogleChartBar.create = function()
{
	return new oFF.GoogleChartBar();
};
oFF.GoogleChartBar.prototype.getChartName = function()
{
	return "BarChart";
};
oFF.GoogleChartBar.prototype.addChartSpecificOptions = function(structure, vizDef)
{
	var vizDefChart = vizDef.getStructureByKey(oFF.VizDefConstants.K_CHART);
	var vdType = vizDefChart.getStringByKey(oFF.VizDefConstants.K_TYPE);
	structure.putBoolean(oFF.GoogleConstants.K_STACKED, oFF.XString.isEqual(vdType, oFF.VizDefConstants.V_STACKED_BAR));
	var bar = structure.putNewStructure(oFF.GoogleConstants.K_BAR);
	bar.putString(oFF.GoogleConstants.K_GROUP_WIDTH, "50%");
	this.setAxisStyle(structure.putNewStructure(oFF.GoogleConstants.K_VERTICAL_AXIS), vizDef, oFF.VizDefConstants.K_CATEGORY_AXIS, true);
	this.setAxisStyle(structure.putNewStructure(oFF.GoogleConstants.K_HORIZONTAL_AXIS), vizDef, oFF.VizDefConstants.K_VALUE_AXIS, false);
};

oFF.GoogleChartColumn = function() {};
oFF.GoogleChartColumn.prototype = new oFF.GoogleChart();
oFF.GoogleChartColumn.prototype._ff_c = "GoogleChartColumn";

oFF.GoogleChartColumn.create = function()
{
	return new oFF.GoogleChartColumn();
};
oFF.GoogleChartColumn.prototype.getChartName = function()
{
	return "ColumnChart";
};
oFF.GoogleChartColumn.prototype.addChartSpecificOptions = function(structure, vizDef)
{
	var vizDefChart = vizDef.getStructureByKey(oFF.VizDefConstants.K_CHART);
	var vdType = vizDefChart.getStringByKey(oFF.VizDefConstants.K_TYPE);
	structure.putBoolean(oFF.GoogleConstants.K_STACKED, oFF.XString.isEqual(vdType, oFF.VizDefConstants.V_STACKED_BAR));
	var bar = structure.putNewStructure(oFF.GoogleConstants.K_BAR);
	bar.putString(oFF.GoogleConstants.K_GROUP_WIDTH, "50%");
	this.setAxisStyle(structure.putNewStructure(oFF.GoogleConstants.K_VERTICAL_AXIS), vizDef, oFF.VizDefConstants.K_VALUE_AXIS, false);
	this.setAxisStyle(structure.putNewStructure(oFF.GoogleConstants.K_HORIZONTAL_AXIS), vizDef, oFF.VizDefConstants.K_CATEGORY_AXIS, true);
};

oFF.GoogleChartLine = function() {};
oFF.GoogleChartLine.prototype = new oFF.GoogleChart();
oFF.GoogleChartLine.prototype._ff_c = "GoogleChartLine";

oFF.GoogleChartLine.POINT_SIZE = 3;
oFF.GoogleChartLine.create = function()
{
	return new oFF.GoogleChartLine();
};
oFF.GoogleChartLine.prototype.getChartName = function()
{
	return "LineChart";
};
oFF.GoogleChartLine.prototype.addChartSpecificOptions = function(structure, vizDef)
{
	structure.putInteger(oFF.GoogleConstants.K_POINT_SIZE, oFF.GoogleChartLine.POINT_SIZE);
	this.setAxisStyle(structure.putNewStructure(oFF.GoogleConstants.K_VERTICAL_AXIS), vizDef, oFF.VizDefConstants.K_VALUE_AXIS, false);
	this.setAxisStyle(structure.putNewStructure(oFF.GoogleConstants.K_HORIZONTAL_AXIS), vizDef, oFF.VizDefConstants.K_CATEGORY_AXIS, true);
};

oFF.RsHiChartCovariationHelper = function() {};
oFF.RsHiChartCovariationHelper.prototype = new oFF.RsHiChartRenderHelper();
oFF.RsHiChartCovariationHelper.prototype._ff_c = "RsHiChartCovariationHelper";

oFF.RsHiChartCovariationHelper.prototype.m_xMeasures = null;
oFF.RsHiChartCovariationHelper.prototype.m_yMeasures = null;
oFF.RsHiChartCovariationHelper.prototype.m_zMeasures = null;
oFF.RsHiChartCovariationHelper.prototype.m_xColors = null;
oFF.RsHiChartCovariationHelper.prototype.m_yColors = null;
oFF.RsHiChartCovariationHelper.prototype.m_zColors = null;
oFF.RsHiChartCovariationHelper.prototype.m_xPatterns = null;
oFF.RsHiChartCovariationHelper.prototype.m_yPatterns = null;
oFF.RsHiChartCovariationHelper.prototype.m_zPatterns = null;
oFF.RsHiChartCovariationHelper.prototype.m_xList = null;
oFF.RsHiChartCovariationHelper.prototype.m_yList = null;
oFF.RsHiChartCovariationHelper.prototype.m_zList = null;
oFF.RsHiChartCovariationHelper.prototype.m_xListFormatted = null;
oFF.RsHiChartCovariationHelper.prototype.m_yListFormatted = null;
oFF.RsHiChartCovariationHelper.prototype.m_zListFormatted = null;
oFF.RsHiChartCovariationHelper.prototype.m_categoriesList = null;
oFF.RsHiChartCovariationHelper.prototype.m_categoryLabels = null;
oFF.RsHiChartCovariationHelper.prototype.m_tooltipValueMeasures = null;
oFF.RsHiChartCovariationHelper.prototype.m_tooltipList = null;
oFF.RsHiChartCovariationHelper.prototype.m_tooltipListFormatted = null;
oFF.RsHiChartCovariationHelper.prototype.m_colorList = null;
oFF.RsHiChartCovariationHelper.prototype.getColorList = function()
{
	return this.m_colorList;
};
oFF.RsHiChartCovariationHelper.prototype.getCategoriesList = function()
{
	return this.m_categoriesList;
};
oFF.RsHiChartCovariationHelper.prototype.getCategoryLabels = function()
{
	return this.m_categoryLabels;
};
oFF.RsHiChartCovariationHelper.prototype.getXMeasures = function()
{
	return this.m_xMeasures;
};
oFF.RsHiChartCovariationHelper.prototype.getYMeasures = function()
{
	return this.m_yMeasures;
};
oFF.RsHiChartCovariationHelper.prototype.getZMeasures = function()
{
	return this.m_zMeasures;
};
oFF.RsHiChartCovariationHelper.prototype.getXColors = function()
{
	return this.m_xColors;
};
oFF.RsHiChartCovariationHelper.prototype.getYColors = function()
{
	return this.m_yColors;
};
oFF.RsHiChartCovariationHelper.prototype.getZColors = function()
{
	return this.m_zColors;
};
oFF.RsHiChartCovariationHelper.prototype.getXPatterns = function()
{
	return this.m_xPatterns;
};
oFF.RsHiChartCovariationHelper.prototype.getYPatterns = function()
{
	return this.m_yPatterns;
};
oFF.RsHiChartCovariationHelper.prototype.getZPatterns = function()
{
	return this.m_zPatterns;
};
oFF.RsHiChartCovariationHelper.prototype.getXList = function()
{
	return this.m_xList;
};
oFF.RsHiChartCovariationHelper.prototype.getXListRemapped = function()
{
	if (oFF.XCollectionUtils.hasElements(this.m_xList))
	{
		return this.m_xList.getListAt(0);
	}
	return null;
};
oFF.RsHiChartCovariationHelper.prototype.getYListRemapped = function()
{
	if (oFF.XCollectionUtils.hasElements(this.m_yList))
	{
		return this.m_yList.getListAt(0);
	}
	return this.getXListRemapped();
};
oFF.RsHiChartCovariationHelper.prototype.getZListRemapped = function()
{
	if (oFF.XCollectionUtils.hasElements(this.m_zList))
	{
		return this.m_zList.getListAt(0);
	}
	return this.getYListRemapped();
};
oFF.RsHiChartCovariationHelper.prototype.getXListFormattedRemapped = function()
{
	if (oFF.XCollectionUtils.hasElements(this.m_xListFormatted))
	{
		return this.m_xListFormatted.getListAt(0);
	}
	return null;
};
oFF.RsHiChartCovariationHelper.prototype.getYListFormattedRemapped = function()
{
	if (oFF.XCollectionUtils.hasElements(this.m_yListFormatted))
	{
		return this.m_yListFormatted.getListAt(0);
	}
	return this.getXListFormattedRemapped();
};
oFF.RsHiChartCovariationHelper.prototype.getZListFormattedRemapped = function()
{
	if (oFF.XCollectionUtils.hasElements(this.m_zListFormatted))
	{
		return this.m_zListFormatted.getListAt(0);
	}
	return this.getYListFormattedRemapped();
};
oFF.RsHiChartCovariationHelper.prototype.getYList = function()
{
	return this.m_yList;
};
oFF.RsHiChartCovariationHelper.prototype.getZList = function()
{
	return this.m_zList;
};
oFF.RsHiChartCovariationHelper.prototype.getXListFormatted = function()
{
	return this.m_xListFormatted;
};
oFF.RsHiChartCovariationHelper.prototype.getYListFormatted = function()
{
	return this.m_yListFormatted;
};
oFF.RsHiChartCovariationHelper.prototype.getZListFormatted = function()
{
	return this.m_zListFormatted;
};
oFF.RsHiChartCovariationHelper.prototype.readResultSetData = function(columnAxis, rowAxis, rs)
{
	var theChartData = this.getChartData();
	var hideTotalOnRows = true;
	if (rs.getAvailableDataCellCount() > 0)
	{
		this.m_xMeasures = oFF.XListOfString.create();
		this.m_yMeasures = oFF.XListOfString.create();
		this.m_zMeasures = oFF.XListOfString.create();
		this.m_xPatterns = oFF.XListOfString.create();
		this.m_yPatterns = oFF.XListOfString.create();
		this.m_zPatterns = oFF.XListOfString.create();
		this.m_xColors = oFF.XListOfString.create();
		this.m_yColors = oFF.XListOfString.create();
		this.m_zColors = oFF.XListOfString.create();
		var colFeeds = oFF.XListOfString.create();
		if (oFF.XStringUtils.isNotNullAndNotEmpty(this.getXFeed()))
		{
			colFeeds.add(this.getXFeed());
		}
		if (oFF.XStringUtils.isNotNullAndNotEmpty(this.getYFeed()))
		{
			colFeeds.add(this.getYFeed());
		}
		if (oFF.XStringUtils.isNotNullAndNotEmpty(this.getZFeed()))
		{
			colFeeds.add(this.getZFeed());
		}
		this.m_tooltipValueMeasures = oFF.XListOfString.create();
		colFeeds.add(oFF.VizDefConstants.K_TOOLTIP_VALUE_AXIS);
		this.m_colorList = columnAxis.getPrettyNamesForFeed(true, !hideTotalOnRows, oFF.VizDefConstants.K_COLOR);
		this.m_categoriesList = rowAxis.getPrettyNames(true, !hideTotalOnRows);
		this.m_categoryLabels = rowAxis.getLabels(true, !hideTotalOnRows, true);
		if (!oFF.XCollectionUtils.hasElements(this.m_categoriesList))
		{
			this.m_categoriesList = oFF.XListOfString.create();
			this.m_categoriesList.add("");
		}
		this.m_xList = oFF.PrFactory.createList();
		this.m_yList = oFF.PrFactory.createList();
		this.m_zList = oFF.PrFactory.createList();
		this.m_tooltipList = oFF.PrFactory.createList();
		this.m_xListFormatted = oFF.PrFactory.createList();
		this.m_yListFormatted = oFF.PrFactory.createList();
		this.m_zListFormatted = oFF.PrFactory.createList();
		this.m_tooltipListFormatted = oFF.PrFactory.createList();
		var curList;
		var curListFormatted;
		var curFeed;
		var rowSelector = oFF.XListOfString.create();
		rowSelector.add(oFF.VizDefConstants.K_CATEGORY_AXIS);
		rowSelector.add(oFF.VizDefConstants.K_COLOR);
		var indices = columnAxis.getIndicesByFeedOrder(colFeeds);
		for (var ij = 0; ij < indices.size(); ij++)
		{
			var i = indices.get(ij).getInteger();
			var columnTuple = columnAxis.getTupleAt(i);
			if (columnTuple.isSelectedByString(this.getXFeed()))
			{
				var xTitle = columnTuple.getPrettyTextForFeed(this.getXFeed());
				if (!this.m_xMeasures.contains(xTitle))
				{
					this.m_xMeasures.add(xTitle);
					this.m_xPatterns.add(columnTuple.getPattern());
					this.m_xColors.add(columnTuple.getColor());
				}
				curList = this.m_xList.addNewList();
				curListFormatted = this.m_xListFormatted.addNewList();
				curFeed = this.getXFeed();
			}
			else if (this.getYFeed() !== null && columnTuple.isSelectedByString(this.getYFeed()))
			{
				var yTitle = columnTuple.getPrettyTextForFeed(this.getYFeed());
				if (!this.m_yMeasures.contains(yTitle))
				{
					this.m_yMeasures.add(yTitle);
					this.m_yPatterns.add(columnTuple.getPattern());
					this.m_yColors.add(columnTuple.getColor());
				}
				curList = this.m_yList.addNewList();
				curListFormatted = this.m_yListFormatted.addNewList();
				curFeed = this.getYFeed();
			}
			else if (this.getZFeed() !== null && columnTuple.isSelectedByString(this.getZFeed()))
			{
				var zTitle = columnTuple.getPrettyTextForFeed(this.getZFeed());
				if (!this.m_zMeasures.contains(zTitle))
				{
					this.m_zMeasures.add(zTitle);
					this.m_zPatterns.add(columnTuple.getPattern());
					this.m_zColors.add(columnTuple.getColor());
				}
				curList = this.m_zList.addNewList();
				curListFormatted = this.m_zListFormatted.addNewList();
				curFeed = this.getZFeed();
			}
			else if (columnTuple.isSelectedByString(oFF.VizDefConstants.K_TOOLTIP_VALUE_AXIS))
			{
				var tTitle = columnTuple.getPrettyTextForFeed(oFF.VizDefConstants.K_TOOLTIP_VALUE_AXIS);
				if (!this.m_tooltipValueMeasures.contains(tTitle))
				{
					this.m_tooltipValueMeasures.add(tTitle);
				}
				curList = this.m_tooltipList.addNewList();
				curListFormatted = this.m_tooltipListFormatted.addNewList();
				curFeed = "";
			}
			else
			{
				continue;
			}
			if (rowAxis.getTuplesCount() > 0)
			{
				for (var j = 0; j < rowAxis.getTuplesCount(); j++)
				{
					if (hideTotalOnRows && rowAxis.getTupleAt(j).isTotal())
					{
						continue;
					}
					this.addValueToList(rs, i, j, curList, curListFormatted, curFeed, columnAxis, columnTuple);
				}
			}
			else
			{
				this.addValueToList(rs, i, 0, curList, curListFormatted, curFeed, columnAxis, columnTuple);
			}
		}
		var tooltipBuffer = oFF.XStringBuffer.create();
		tooltipBuffer.append("<b>{series.name}</b><br/>");
		this.decorateToolTip(tooltipBuffer);
		for (var ti = 0; ti < this.m_tooltipListFormatted.size(); ti++)
		{
			tooltipBuffer.append("<b>{point.tHeader");
			tooltipBuffer.append(oFF.XInteger.convertToString(ti));
			tooltipBuffer.append("}</b>  {point.tFormatted");
			tooltipBuffer.append(oFF.XInteger.convertToString(ti));
			tooltipBuffer.append("}<br/>");
		}
		tooltipBuffer.append("{point.errorRange}");
		var ttStruct = theChartData.putNewStructure(oFF.VizDefConstants.K_TOOLTIP);
		ttStruct.putString(oFF.VizDefConstants.K_POINT_FORMAT, tooltipBuffer.toString());
		ttStruct.putString(oFF.VizDefConstants.K_HEADER_FORMAT, "");
	}
	this.setShowLegend(this.getXList().size() > 1);
};
oFF.RsHiChartCovariationHelper.prototype.decorateToolTip = function(stringBuffer) {};
oFF.RsHiChartCovariationHelper.prototype.addValueToList = function(rs, i, j, curList, curListFormatted, curFeed, columnAxis, columnTuple)
{
	var dataCellS = rs.getDataCell(i, j);
	var valueTypeS = dataCellS.getValueType();
	if (valueTypeS === oFF.XValueType.DOUBLE || valueTypeS === oFF.XValueType.DECIMAL_FLOAT)
	{
		if (dataCellS.getXValue() === null)
		{
			curList.addDouble(0);
		}
		else
		{
			curList.addDouble(dataCellS.getDouble());
		}
		var formattedValue = columnAxis.getFormattedValue(curFeed, columnTuple, dataCellS);
		curListFormatted.addString(formattedValue);
	}
};
oFF.RsHiChartCovariationHelper.prototype.addToolTipsToSeries = function(newStructure, xOffset, rowIndex)
{
	if (oFF.XCollectionUtils.hasElements(this.m_tooltipValueMeasures))
	{
		var tsize = this.m_tooltipValueMeasures.size();
		for (var j = 0; j < tsize; j++)
		{
			newStructure.putString(oFF.XStringUtils.concatenate2(oFF.VizDefConstants.K_T_HEADER, oFF.XInteger.convertToString(j)), this.m_tooltipValueMeasures.get(j));
			newStructure.putString(oFF.XStringUtils.concatenate2(oFF.VizDefConstants.K_T_FORMATTED, oFF.XInteger.convertToString(j)), this.m_tooltipListFormatted.getListAt(xOffset * tsize + j).getStringAt(rowIndex));
		}
	}
};

oFF.RsHiChartHeatmapHelper = function() {};
oFF.RsHiChartHeatmapHelper.prototype = new oFF.RsHiChartRenderHelper();
oFF.RsHiChartHeatmapHelper.prototype._ff_c = "RsHiChartHeatmapHelper";

oFF.RsHiChartHeatmapHelper.prototype.isShowLegend = function()
{
	return false;
};
oFF.RsHiChartHeatmapHelper.prototype.prepareRendering = function() {};
oFF.RsHiChartHeatmapHelper.prototype.readResultSetData = function(columnAxis, rowAxis, rs)
{
	var theChartData = this.getChartData();
	var listOfDoubles = oFF.XList.create();
	var chartlang = theChartData.putNewStructure(oFF.VizDefConstants.K_LANG);
	if (rs.getAvailableDataCellCount() > 0)
	{
		var hideTotalOnRows = true;
		var xAxis = theChartData.putNewList(oFF.VizDefConstants.K_X_AXIS);
		var yAxis = theChartData.putNewList(oFF.VizDefConstants.K_Y_AXIS);
		var xAxisStruct = xAxis.addNewStructure();
		var yAxisStruct = yAxis.addNewStructure();
		var yDList = yAxisStruct.putNewList(oFF.VizDefConstants.K_CATEGORIES);
		var xDList = xAxisStruct.putNewList(oFF.VizDefConstants.K_CATEGORIES);
		var seriesList = theChartData.putNewList(oFF.VizDefConstants.K_SERIES);
		var seriesListStructure = seriesList.addNewStructure();
		var dataLabels = seriesListStructure.putNewStructure(oFF.VizDefConstants.K_DATA_LABELS);
		dataLabels.putString(oFF.VizDefConstants.K_POINT_FORMAT, "{point.valueFormatted}");
		var dataLayerList = seriesListStructure.putNewList(oFF.VizDefConstants.K_DATA);
		var tooltipBuffer = oFF.XStringBuffer.create();
		var columnSelectors = oFF.XListOfString.create();
		columnSelectors.add(oFF.VizDefConstants.K_COLOR);
		var colorList = oFF.XListOfString.create();
		tooltipBuffer.append("<b>{point.xCategory} / {point.yCategory}</b><br/><b>{point.series.name}</b>:  {point.valueFormatted}<br/>");
		var columnIterator = columnAxis.getPrettyNamesForFeed(true, !hideTotalOnRows, oFF.VizDefConstants.K_CATEGORY_AXIS2).getIterator();
		while (columnIterator.hasNext())
		{
			xDList.addString(columnIterator.next());
		}
		var straightOrdering = oFF.XCollectionUtils.hasElements(xDList) && xDList.size() > 1;
		var rowIterator = rowAxis.getPrettyNamesForFeed(true, !hideTotalOnRows, oFF.VizDefConstants.K_CATEGORY_AXIS).getIterator();
		var tooltipHeaders = columnAxis.getPrettyNamesForFeed(true, false, oFF.VizDefConstants.K_TOOLTIP_VALUE_AXIS);
		for (var h = 0; h < tooltipHeaders.size(); h++)
		{
			tooltipBuffer.append("<b>{point.tHeader");
			tooltipBuffer.append(oFF.XInteger.convertToString(h));
			tooltipBuffer.append("}</b>:  {point.tFormatted");
			tooltipBuffer.append(oFF.XInteger.convertToString(h));
			tooltipBuffer.append("}<br/>");
		}
		while (rowIterator.hasNext())
		{
			yDList.addString(rowIterator.next());
		}
		if (xDList.isEmpty())
		{
			xDList.addString("");
		}
		if (yDList.isEmpty())
		{
			yDList.addString("");
		}
		var ii = 0;
		var indices = columnAxis.getIndicesByFeedOrder(columnSelectors);
		for (var ij = 0; ij < indices.size(); ij++)
		{
			var i = indices.get(ij).getInteger();
			var columnTuple = columnAxis.getTupleAt(i);
			if (!columnTuple.isSelectedByString(oFF.VizDefConstants.K_COLOR))
			{
				continue;
			}
			if (hideTotalOnRows && columnAxis.getTupleAt(i).isTotal())
			{
				continue;
			}
			colorList.add(columnTuple.getPrettyTextForFeed(oFF.VizDefConstants.K_COLOR));
			var memberNames = columnTuple.getMemberKeys();
			var tooltipIndices = null;
			var tooltipValues = null;
			if (oFF.XCollectionUtils.hasElements(memberNames))
			{
				tooltipIndices = columnAxis.getMatchingTupleIndicesForMemberNameAndFeed(memberNames, oFF.VizDefConstants.K_TOOLTIP_VALUE_AXIS);
			}
			var jj = 0;
			for (var j = 0; j < rowAxis.getTuplesCount(); j++)
			{
				if (!rowAxis.getTupleAt(j).isSelectedByString(oFF.VizDefConstants.K_CATEGORY_AXIS))
				{
					continue;
				}
				if (oFF.XCollectionUtils.hasElements(tooltipIndices))
				{
					tooltipValues = oFF.XListOfString.create();
					for (var ttindex = 0; ttindex < tooltipIndices.size(); ttindex++)
					{
						var tooltipIndex = tooltipIndices.get(ttindex).getInteger();
						tooltipValues.add(columnAxis.getFormattedValue(oFF.VizDefConstants.K_COLOR, columnAxis.getTupleAt(tooltipIndex), rs.getDataCell(tooltipIndex, j)));
					}
				}
				var dataCell1 = rs.getDataCell(i, j);
				var dataList = oFF.PrFactory.createStructure();
				var xValue = dataCell1.getXValue();
				if (!hideTotalOnRows || !rowAxis.getTupleAt(j).isTotal())
				{
					if (oFF.notNull(xValue))
					{
						dataList.putInteger(oFF.VizDefConstants.K_X, straightOrdering ? ii : jj);
						dataList.putInteger(oFF.VizDefConstants.K_Y, straightOrdering ? jj : ii);
						dataList.putDouble(oFF.VizDefConstants.K_VALUE, dataCell1.getDouble());
						dataList.putString(oFF.VizDefConstants.K_VALUE_FORMATTED, dataCell1.getFormattedValue());
						dataList.putString(oFF.VizDefConstants.K_X_CATEGORY, oFF.XCollectionUtils.hasElements(xDList) && ii < xDList.size() ? xDList.getStringAt(ii) : "");
						dataList.putString(oFF.VizDefConstants.K_Y_CATEGORY, oFF.XCollectionUtils.hasElements(yDList) && jj < yDList.size() ? yDList.getStringAt(jj) : "");
						if (oFF.XCollectionUtils.hasElements(tooltipHeaders))
						{
							for (var th = 0; th < tooltipHeaders.size(); th++)
							{
								dataList.putString(oFF.XStringUtils.concatenate2(oFF.VizDefConstants.K_T_HEADER, oFF.XInteger.convertToString(th)), tooltipHeaders.get(th));
							}
						}
						if (oFF.XCollectionUtils.hasElements(tooltipValues))
						{
							for (var tv = 0; tv < tooltipValues.size(); tv++)
							{
								dataList.putString(oFF.XStringUtils.concatenate2(oFF.VizDefConstants.K_T_FORMATTED, oFF.XInteger.convertToString(tv)), tooltipValues.get(tv));
							}
						}
						dataLayerList.add(dataList);
						listOfDoubles.add(oFF.XDoubleValue.create(dataCell1.getDouble()));
					}
				}
				jj++;
			}
			ii++;
		}
		if (!straightOrdering)
		{
			yAxisStruct.put(oFF.VizDefConstants.K_CATEGORIES, xDList);
			xAxisStruct.put(oFF.VizDefConstants.K_CATEGORIES, yDList);
		}
		if (oFF.XCollectionUtils.hasElements(colorList))
		{
			seriesListStructure.putString(oFF.VizDefConstants.K_NAME, colorList.get(0));
		}
		var maxelement = oFF.XDoubleValue.create(1);
		if (listOfDoubles.size() > 1)
		{
			listOfDoubles.sortByComparator(new oFF.XComparatorDouble());
			maxelement = listOfDoubles.get(listOfDoubles.size() - 1);
		}
		seriesListStructure.putInteger(oFF.VizDefConstants.K_BORDER_WIDTH, 2);
		seriesListStructure.putString(oFF.VizDefConstants.K_BORDER_COLOR, "white");
		if (oFF.XCollectionUtils.hasElements(listOfDoubles))
		{
			theChartData.putDouble(oFF.VizDefConstants.K_MIN_ELEMENT, listOfDoubles.get(0).getDouble());
			theChartData.putDouble(oFF.VizDefConstants.K_MAX_ELEMENT, maxelement.getDouble());
		}
		var tooltip = theChartData.putNewStructure(oFF.VizDefConstants.K_TOOLTIP);
		tooltip.putString(oFF.VizDefConstants.K_POINT_FORMAT, tooltipBuffer.toString());
		tooltip.putString(oFF.VizDefConstants.K_HEADER_FORMAT, "");
		oFF.RsHiChartVizUtilsHeatmap.rendrerHeatmap(theChartData, this.getChartType(), this.getVizDef(), this.getGlobalDef());
	}
	else
	{
		theChartData.putBoolean(oFF.VizDefConstants.K_FULL_SCREEN_ENABLED, false);
		chartlang.putString(oFF.VizDefConstants.K_NO_DATA, "FireFly Resultset is empty.");
	}
};
oFF.RsHiChartHeatmapHelper.prototype.finishRendering = function()
{
	oFF.RsHiChartVizUtilsHeatmap.rendrerHeatmap(this.getChartData(), this.getChartType(), this.getVizDef(), this.getGlobalDef());
};

oFF.RsHiChartSeriesHelper = function() {};
oFF.RsHiChartSeriesHelper.prototype = new oFF.RsHiChartRenderHelper();
oFF.RsHiChartSeriesHelper.prototype._ff_c = "RsHiChartSeriesHelper";

oFF.RsHiChartSeriesHelper.prototype.getChartWidth = function()
{
	return this.m_chartWidth;
};
oFF.RsHiChartSeriesHelper.prototype.setChartWidth = function(chartWidth)
{
	this.m_chartWidth = chartWidth;
};
oFF.RsHiChartSeriesHelper.prototype.m_hasVariance = false;
oFF.RsHiChartSeriesHelper.prototype.m_widthScale = 0;
oFF.RsHiChartSeriesHelper.prototype.m_chartWidth = 0;
oFF.RsHiChartSeriesHelper.prototype.isTimeseries = function()
{
	return false;
};
oFF.RsHiChartSeriesHelper.prototype.isCombinationChart = function()
{
	return oFF.XStringUtils.isNotNullAndNotEmpty(this.getSecondChart());
};
oFF.RsHiChartSeriesHelper.prototype.reiterateResultSet = function(columnAxis, rowAxis, rs)
{
	var theChartData = this.getChartData();
	var hasValueAxis2 = columnAxis.hasTupleForFeed(oFF.VizDefConstants.K_VALUE_AXIS2);
	var yAxisList = theChartData.putNewList(oFF.VizDefConstants.K_Y_AXIS);
	var yAxis = yAxisList.addNewStructure();
	var xAxis;
	var xAxisStruct;
	var plotOptions = oFF.PrFactory.createStructure();
	plotOptions = theChartData.getStructureByKey(oFF.VizDefConstants.K_PLOT_OPTIONS);
	var fillColor = oFF.VizDefConstants.K_TRANSPARENT;
	if (theChartData.getListByKey(oFF.VizDefConstants.K_COLORS) !== null)
	{
		if (theChartData.getListByKey(oFF.VizDefConstants.K_COLORS).size() > 0)
		{
			fillColor = theChartData.getListByKey(oFF.VizDefConstants.K_COLORS).getStringAt(0);
		}
	}
	if (oFF.isNull(plotOptions))
	{
		plotOptions = theChartData.putNewStructure(oFF.VizDefConstants.K_PLOT_OPTIONS);
	}
	var series = theChartData.getListByKey(oFF.VizDefConstants.K_SERIES);
	var seriesType = null;
	var errorBarIndex = 0;
	if (this.isTimeseries())
	{
		xAxis = theChartData.putNewList(oFF.VizDefConstants.K_X_AXIS);
		xAxisStruct = xAxis.addNewStructure();
		xAxisStruct.putString(oFF.VizDefConstants.K_TYPE, oFF.VizDefConstants.K_DATE_TIME);
	}
	else
	{
		xAxis = theChartData.getListByKey(oFF.VizDefConstants.K_X_AXIS);
		if (oFF.isNull(xAxis))
		{
			xAxis = theChartData.putNewList(oFF.VizDefConstants.K_X_AXIS);
		}
		xAxisStruct = xAxis.getStructureAt(0);
		if (oFF.isNull(xAxisStruct))
		{
			xAxisStruct = xAxis.addNewStructure();
		}
	}
	var yAxis1 = null;
	if (hasValueAxis2)
	{
		yAxis1 = yAxisList.addNewStructure();
		oFF.RsHiChartVizUtilsSimple.plotOptionChart(yAxis1, this.getSecondChart(), null, plotOptions, 1, fillColor);
		yAxis1.putBoolean(oFF.VizDefConstants.K_OPPOSITE, true);
		if (this.isHasVariance())
		{
			if (this.isInverted())
			{
				yAxis1.putString(oFF.VizDefConstants.K_WIDTH, "50%");
			}
			else
			{
				yAxis1.putString(oFF.VizDefConstants.K_WIDTH, "50%");
				yAxis.putString(oFF.VizDefConstants.V_POSITION_TOP, "50%");
			}
		}
		oFF.RsHiChartVizUtilsSimple.dataLabelAlignment(yAxis1, this.getSecondChart(), columnAxis.getDecimalPlaces(oFF.VizDefConstants.K_VALUE_AXIS2), false);
	}
	var seriesStruct;
	var seriesStructPrevious;
	var hasErrorBar = false;
	var vizProp = null;
	if (this.getVizDef() !== null)
	{
		vizProp = this.getVizDef().getStructureByKey(oFF.VizDefConstants.K_CHART).getStructureByKey(oFF.VizDefConstants.K_PROPERTIES);
		if (oFF.notNull(vizProp))
		{
			var vizPropCategoryAxis = vizProp.getStructureByKey(oFF.VizDefConstants.K_CATEGORY_AXIS);
			if (oFF.notNull(vizPropCategoryAxis) && !this.isPolar())
			{
				xAxisStruct = oFF.RsHiChartUtils.axisPloter(vizPropCategoryAxis, xAxisStruct, this.getChartType(), true);
			}
			var vizPropValueAxis = vizProp.getStructureByKey(oFF.VizDefConstants.K_VALUE_AXIS);
			if (oFF.notNull(vizPropValueAxis) && !this.isPolar())
			{
				yAxis = oFF.RsHiChartUtils.axisPloter(vizPropValueAxis, yAxis, this.getChartType(), false);
			}
			oFF.RsHiChartVizUtilsSimple.addReferenceLine(this.getVizDef(), yAxis, yAxis1, columnAxis, rowAxis, rs);
		}
	}
	if (this.isHasVariance())
	{
		var yAxis2 = yAxisList.addNewStructure();
		if (this.isInverted())
		{
			yAxis.putString(oFF.VizDefConstants.K_WIDTH, "50%");
			yAxis2.putString(oFF.VizDefConstants.K_WIDTH, "50%");
			yAxis2.putString(oFF.VizDefConstants.V_LEFT, "50%");
		}
		else
		{
			yAxis.putString(oFF.VizDefConstants.K_HEIGHT, "50%");
			yAxis2.putString(oFF.VizDefConstants.K_HEIGHT, "50%");
			yAxis.putString(oFF.VizDefConstants.V_POSITION_TOP, "50%");
		}
		if (oFF.notNull(vizProp))
		{
			var valAxis = vizProp.getStructureByKey(oFF.VizDefConstants.K_VALUE_AXIS);
			if (oFF.notNull(valAxis))
			{
				oFF.RsHiChartUtils.axisPloter(valAxis, yAxis2, this.getChartType(), false);
			}
		}
		oFF.RsHiChartVizUtilsSimple.plotOptionChart(yAxis2, this.getChartType(), null, plotOptions, this.isCombinationChart() ? 2 : 1, fillColor);
	}
	oFF.RsHiChartVizUtilsSimple.legendStyler(theChartData);
	if (hasErrorBar)
	{
		for (var z = 0; z < series.size(); z++)
		{
			oFF.RsHiChartVizUtilsSimple.plotOptionChart(yAxis, this.getChartType(), this.getStackingType(), plotOptions, 0, fillColor);
			seriesStruct = series.getStructureAt(z);
			seriesType = seriesStruct.getStringByKey(oFF.VizDefConstants.K_TYPE);
			if (oFF.XString.isEqual(seriesType, oFF.VizDefConstants.K_ERRORBAR))
			{
				errorBarIndex = z;
				seriesStructPrevious = series.getStructureAt(errorBarIndex - 1);
				var dataLabelsSeriesStruct = seriesStruct.putNewStructure(oFF.VizDefConstants.K_DATA_LABELS);
				dataLabelsSeriesStruct.putBoolean(oFF.VizDefConstants.K_ENABLED, true);
				var dataLabelsSeriesStructStyle = dataLabelsSeriesStruct.putNewStructure(oFF.VizDefConstants.K_STYLE);
				dataLabelsSeriesStructStyle.putString(oFF.VizDefConstants.K_FILL, "black");
				dataLabelsSeriesStructStyle.putString(oFF.VizDefConstants.K_COLOR, "black");
				var dataLabelsSeriesStructPrevious = seriesStructPrevious.putNewStructure(oFF.VizDefConstants.K_DATA_LABELS);
				dataLabelsSeriesStructPrevious.putBoolean(oFF.VizDefConstants.K_ENABLED, false);
			}
		}
	}
	else
	{
		oFF.RsHiChartVizUtilsSimple.plotOptionChart(yAxis, this.getChartType(), this.getStackingType(), plotOptions, 0, fillColor);
	}
	var showStackingLabels = oFF.XStringUtils.isNullOrEmpty(this.getSecondChart()) && oFF.XString.isEqual(oFF.VizDefConstants.V_NORMAL, this.getStackingType()) && (oFF.XString.isEqual(this.getChartType(), oFF.VizDefConstants.V_CHART_TYPE_BAR) || oFF.XString.isEqual(this.getChartType(), oFF.VizDefConstants.V_CHART_TYPE_COLUMN));
	oFF.RsHiChartVizUtilsSimple.dataLabelAlignment(yAxis, this.getChartType(), columnAxis.getDecimalPlaces(oFF.VizDefConstants.K_VALUE_AXIS), showStackingLabels);
	var isLine = oFF.XString.isEqual(oFF.VizDefConstants.K_LINE, this.getChartType());
	var isArea = oFF.XString.isEqual(oFF.VizDefConstants.K_AREA, this.getChartType());
	if (!this.isPolar() && !this.isTimeseries() && !isLine && !isArea)
	{
		if (this.getChartWidth() > 3 && this.getChartWidth() * this.getWidthScale() > 20)
		{
			var scrollbaronxAxis = xAxisStruct.putNewStructure(oFF.VizDefConstants.K_SCROLL_BAR);
			scrollbaronxAxis.putBoolean(oFF.VizDefConstants.K_SHOW_FULL, false);
			scrollbaronxAxis.putBoolean(oFF.VizDefConstants.K_ENABLED, true);
			xAxisStruct.putInteger(oFF.VizDefConstants.K_MIN, 0);
			xAxisStruct.putInteger(oFF.VizDefConstants.K_MAX, oFF.XMath.max(1, oFF.XMath.div(oFF.XMath.min(13, this.getChartWidth()), oFF.XMath.max(1, this.getWidthScale()))));
		}
	}
	var isBar = oFF.XString.isEqual(oFF.VizDefConstants.V_CHART_TYPE_BAR, this.getChartType());
	if (isBar)
	{
		var plotLines = yAxis.containsKey(oFF.VizDefConstants.K_PLOT_LINES) ? yAxis.getListByKey(oFF.VizDefConstants.K_PLOT_LINES) : yAxis.putNewList(oFF.VizDefConstants.K_PLOT_LINES);
		var plotLinepProp = plotLines.addNewStructure();
		plotLinepProp.putString(oFF.VizDefConstants.K_COLOR, oFF.VizDefConstants.V_BLACK);
		plotLinepProp.putInteger(oFF.VizDefConstants.K_WIDTH, 2);
		plotLinepProp.putInteger(oFF.VizDefConstants.K_VALUE, 0);
		plotLinepProp.putString(oFF.VizDefConstants.K_ID, oFF.VizDefConstants.V_BASE_PLOTLINE_ID);
		plotLinepProp.putInteger(oFF.VizDefConstants.K_Z_INDEX, 6);
	}
};
oFF.RsHiChartSeriesHelper.prototype.getWidthScale = function()
{
	return this.m_widthScale;
};
oFF.RsHiChartSeriesHelper.prototype.setWidthScale = function(widthScale)
{
	this.m_widthScale = widthScale;
};
oFF.RsHiChartSeriesHelper.prototype.isHasVariance = function()
{
	return this.m_hasVariance;
};
oFF.RsHiChartSeriesHelper.prototype.setHasVariance = function(hasVariance)
{
	this.m_hasVariance = hasVariance;
};

oFF.RsHiChartUnsupportedHelper = function() {};
oFF.RsHiChartUnsupportedHelper.prototype = new oFF.RsHiChartRenderHelper();
oFF.RsHiChartUnsupportedHelper.prototype._ff_c = "RsHiChartUnsupportedHelper";

oFF.RsHiChartUnsupportedHelper.prototype.prepareRendering = function() {};
oFF.RsHiChartUnsupportedHelper.prototype.isUnsupported = function()
{
	return true;
};
oFF.RsHiChartUnsupportedHelper.prototype.readResultSetData = function(columnAxis, rowAxis, rs) {};
oFF.RsHiChartUnsupportedHelper.prototype.finishRendering = function() {};

oFF.SacAnalyticsTableClipboardHelper = function() {};
oFF.SacAnalyticsTableClipboardHelper.prototype = new oFF.SacTableClipboardHelper();
oFF.SacAnalyticsTableClipboardHelper.prototype._ff_c = "SacAnalyticsTableClipboardHelper";

oFF.SacAnalyticsTableClipboardHelper.createForAnalytics = function(analyticsTable)
{
	var instance = new oFF.SacAnalyticsTableClipboardHelper();
	instance.setupWithTable(analyticsTable);
	return instance;
};
oFF.SacAnalyticsTableClipboardHelper.prototype.fillStructureOfCell = function(tableCell, owningList, rowIndex, colIndex)
{
	var parentTable = this.getTable();
	if (tableCell.isEffectiveMergeRepetitiveHeaderCells())
	{
		if (tableCell.getRepetitiveColumns() > 0)
		{
			tableCell.setMergedColumns(tableCell.getRepetitiveColumns());
		}
		if (tableCell.getRepetitiveRows() > 0)
		{
			tableCell.setMergedRows(tableCell.getRepetitiveRows());
		}
	}
	else
	{
		if (tableCell.getMergedColumns() > 0)
		{
			tableCell.setMergedColumns(0);
		}
		if (tableCell.getMergedRows() > 0)
		{
			tableCell.setMergedRows(0);
		}
	}
	var structure = oFF.SacTableClipboardHelper.prototype.fillStructureOfCell.call( this , tableCell, owningList, rowIndex, colIndex);
	var parentColumn = tableCell.getParentColumn();
	var parentRow = tableCell.getParentRow();
	structure.putInteger(oFF.SacTableConstants.N_TUPLE_INDEX, parentColumn.getTupleIndex());
	if (tableCell.isLastHeaderRow() && !parentTable.isEmptyRowDimensions())
	{
		structure.putInteger(oFF.SacTableConstants.RCS_N_INDEX, parentColumn.getDimensionIndex());
		if (parentColumn.getFieldName() !== null)
		{
			structure.putString(oFF.SacTableConstants.C_SN_FIELD, parentColumn.getFieldName());
		}
	}
	else
	{
		structure.putInteger(oFF.SacTableConstants.RCS_N_INDEX, parentRow.getDimensionIndex());
		if (parentRow.getFieldName() !== null)
		{
			structure.putString(oFF.SacTableConstants.C_SN_FIELD, parentRow.getFieldName());
		}
	}
	var sortDirection = tableCell.getSortDirection();
	if (oFF.notNull(sortDirection))
	{
		var iconContent = null;
		if (sortDirection === oFF.XSortDirection.DEFAULT_VALUE)
		{
			iconContent = "\uE095";
		}
		else if (sortDirection === oFF.XSortDirection.ASCENDING)
		{
			iconContent = "\uE1FD";
		}
		else if (sortDirection === oFF.XSortDirection.DESCENDING)
		{
			iconContent = "\uE1FC";
		}
		var cellIcon = structure.putNewList(oFF.SacTableConstants.C_L_CELL_ICONS_RIGHT).addNewStructure();
		cellIcon.putString(oFF.SacTableConstants.CI_S_CLASS_NAME, oFF.SacTableConstants.CI_SV_CLASS_NAME_SAP_UI_ICON);
		var cellIconAttribute = cellIcon.putNewStructure(oFF.SacTableConstants.CI_M_DATA_ATTRIBUTES);
		cellIconAttribute.putString(oFF.SacTableConstants.CIA_S_DATA_SAP_UI_ICON_CONTENT, iconContent);
		var cellIconStyle = cellIcon.putNewStructure(oFF.SacTableConstants.CI_M_STYLE);
		cellIconStyle.putString(oFF.SacTableConstants.CIS_S_FONT_FAMILY, oFF.SacTableConstants.CIS_SV_SAP_ICONS);
		cellIconStyle.putInteger(oFF.SacTableConstants.CIS_N_MARGIN_LEFT, oFF.SacTableConstants.CIS_NV_MARGIN_RIGHT);
		cellIcon.putBoolean(oFF.SacTableConstants.CI_B_ICON_AFTER, true);
	}
	return structure;
};

oFF.SacAnalyticTableCsvRenderHelper = function() {};
oFF.SacAnalyticTableCsvRenderHelper.prototype = new oFF.SacTableCsvRenderHelper();
oFF.SacAnalyticTableCsvRenderHelper.prototype._ff_c = "SacAnalyticTableCsvRenderHelper";


oFF.SacAnalyticTableExportHelper = function() {};
oFF.SacAnalyticTableExportHelper.prototype = new oFF.SacTableExportHelper();
oFF.SacAnalyticTableExportHelper.prototype._ff_c = "SacAnalyticTableExportHelper";

oFF.SacAnalyticTableExportHelper.createAnalyticsTableExportHelper = function(parentTable, niceDataSourceTitle)
{
	var instance = new oFF.SacAnalyticTableExportHelper();
	instance.initializeRH(parentTable, niceDataSourceTitle);
	return instance;
};
oFF.SacAnalyticTableExportHelper.prototype.getAnalyticTable = function()
{
	return this.getTableObject();
};
oFF.SacAnalyticTableExportHelper.prototype.renderRow = function(rowList, row, rowIndex, startCol, colEndIndex)
{
	var rowActual = row;
	var structure = oFF.SacTableExportHelper.prototype.renderRow.call( this , rowList, row, rowIndex, startCol, colEndIndex);
	structure.putInteger(oFF.SacTableConstants.N_TUPLE_INDEX, rowActual.getTupleIndex());
	structure.putInteger(oFF.SacTableConstants.RCS_N_INDEX, rowActual.getDimensionIndex());
	structure.putString(oFF.SacTableConstants.C_SN_FIELD, rowActual.getFieldName());
	return structure;
};
oFF.SacAnalyticTableExportHelper.prototype.preFormatCellChart = function(cellBase, structure, rowIndex, colIndex)
{
	var cellChart = oFF.SacTableExportHelper.prototype.preFormatCellChart.call( this , cellBase, structure, rowIndex, colIndex);
	this.postFormatCellChart(cellChart, cellBase.getParentRow(), cellBase.getParentColumn());
	return cellChart;
};
oFF.SacAnalyticTableExportHelper.prototype.renderColumn = function(sacTableColumn, columnStructure)
{
	var sacTableColumnActual = sacTableColumn;
	columnStructure.putInteger(oFF.SacTableConstants.RCS_N_INDEX, sacTableColumnActual.getDimensionIndex());
	columnStructure.putInteger(oFF.SacTableConstants.N_TUPLE_INDEX, sacTableColumnActual.getTupleIndex());
	columnStructure.putString(oFF.SacTableConstants.C_SN_FIELD, sacTableColumnActual.getFieldName());
};
oFF.SacAnalyticTableExportHelper.prototype.renderCell = function(cellList, cellBase, rowIndex, colIndex)
{
	var cellBaseActual = cellBase;
	if (cellBase.isEffectiveMergeRepetitiveHeaderCells())
	{
		if (cellBaseActual.getRepetitiveColumns() > 0)
		{
			cellBaseActual.setMergedColumns(cellBaseActual.getRepetitiveColumns());
		}
		if (cellBaseActual.getRepetitiveRows() > 0)
		{
			cellBaseActual.setMergedRows(cellBaseActual.getRepetitiveRows());
		}
	}
	else
	{
		if (cellBaseActual.getMergedColumns() > 0)
		{
			cellBaseActual.setMergedColumns(0);
		}
		if (cellBaseActual.getMergedRows() > 0)
		{
			cellBaseActual.setMergedRows(0);
		}
	}
	var structure = oFF.SacTableExportHelper.prototype.renderCell.call( this , cellList, cellBase, rowIndex, colIndex);
	var parentColumn = cellBaseActual.getParentColumn();
	var parentRow = cellBaseActual.getParentRow();
	structure.putInteger(oFF.SacTableConstants.N_TUPLE_INDEX, parentColumn.getTupleIndex());
	if (cellBaseActual.isLastHeaderRow() && !this.getAnalyticTable().isEmptyRowDimensions())
	{
		structure.putInteger(oFF.SacTableConstants.RCS_N_INDEX, parentColumn.getDimensionIndex());
		if (parentColumn.getFieldName() !== null)
		{
			structure.putString(oFF.SacTableConstants.C_SN_FIELD, parentColumn.getFieldName());
		}
	}
	else
	{
		structure.putInteger(oFF.SacTableConstants.RCS_N_INDEX, parentRow.getDimensionIndex());
		if (parentRow.getFieldName() !== null)
		{
			structure.putString(oFF.SacTableConstants.C_SN_FIELD, parentRow.getFieldName());
		}
	}
	if (cellBaseActual.getSortDirection() !== null)
	{
		var iconContent = null;
		if (cellBaseActual.getSortDirection() === oFF.XSortDirection.DEFAULT_VALUE)
		{
			iconContent = "\uE095";
		}
		else if (cellBaseActual.getSortDirection() === oFF.XSortDirection.ASCENDING)
		{
			iconContent = "\uE1FD";
		}
		else if (cellBaseActual.getSortDirection() === oFF.XSortDirection.DESCENDING)
		{
			iconContent = "\uE1FC";
		}
		var cellIcon = structure.putNewList(oFF.SacTableConstants.C_L_CELL_ICONS_RIGHT).addNewStructure();
		cellIcon.putString(oFF.SacTableConstants.CI_S_CLASS_NAME, oFF.SacTableConstants.CI_SV_CLASS_NAME_SAP_UI_ICON);
		var cellIconAttribute = cellIcon.putNewStructure(oFF.SacTableConstants.CI_M_DATA_ATTRIBUTES);
		cellIconAttribute.putString(oFF.SacTableConstants.CIA_S_DATA_SAP_UI_ICON_CONTENT, iconContent);
		var cellIconStyle = cellIcon.putNewStructure(oFF.SacTableConstants.CI_M_STYLE);
		cellIconStyle.putString(oFF.SacTableConstants.CIS_S_FONT_FAMILY, oFF.SacTableConstants.CIS_SV_SAP_ICONS);
		cellIconStyle.putInteger(oFF.SacTableConstants.CIS_N_MARGIN_LEFT, oFF.SacTableConstants.CIS_NV_MARGIN_RIGHT);
		cellIcon.putBoolean(oFF.SacTableConstants.CI_B_ICON_AFTER, true);
	}
	return structure;
};
oFF.SacAnalyticTableExportHelper.prototype.postFormatCellChart = function(structure, parentRow, parentColumn)
{
	var anaTab = this.getAnalyticTable();
	if (oFF.XStringUtils.isNotNullAndNotEmpty(anaTab.getDimensionToColorate()) && oFF.XCollectionUtils.hasElements(anaTab.getDimensionColorPalette()))
	{
		var paletteSize = anaTab.getDimensionColorPalette().size();
		var indexElement;
		var keys;
		var index;
		var size;
		var color;
		var subList;
		if (anaTab.getRowDimensionMemberIndex().containsKey(anaTab.getDimensionToColorate()))
		{
			indexElement = anaTab.getRowDimensionMemberIndex().getByKey(anaTab.getDimensionToColorate());
			keys = indexElement.getKeysAsReadOnlyListOfString();
			size = keys.size();
			for (index = 0; index < size; index++)
			{
				color = anaTab.getDimensionColorPalette().get(oFF.XMath.mod(index, paletteSize));
				subList = indexElement.getByKey(keys.get(index));
				if (subList.contains(oFF.XIntegerValue.create(parentRow.getTupleIndex())))
				{
					structure.putString(oFF.SacTableConstants.CC_S_BAR_COLOR, color);
					break;
				}
			}
		}
		else if (anaTab.getColumnDimensionMemberIndex().containsKey(anaTab.getDimensionToColorate()))
		{
			indexElement = anaTab.getColumnDimensionMemberIndex().getByKey(anaTab.getDimensionToColorate());
			keys = indexElement.getKeysAsReadOnlyListOfString();
			size = keys.size();
			for (index = 0; index < size; index++)
			{
				color = anaTab.getDimensionColorPalette().get(oFF.XMath.mod(index, paletteSize));
				subList = indexElement.getByKey(keys.get(index));
				if (subList.contains(oFF.XIntegerValue.create(parentColumn.getTupleIndex())))
				{
					structure.putString(oFF.SacTableConstants.CC_S_BAR_COLOR, color);
					break;
				}
			}
		}
	}
};
oFF.SacAnalyticTableExportHelper.prototype.renderGenericSettings = function(tableJson, startCol, colEndIndex, startRow)
{
	var queryModel = this.getAnalyticTable().getQueryModel();
	if (oFF.notNull(queryModel))
	{
		tableJson.putString(oFF.SacTableConstants.S_QUERY_NAME, queryModel.getName());
		tableJson.putString(oFF.SacTableConstants.S_QUERY_TEXT, queryModel.getText());
		var infoProvider = queryModel.getInfoProvider();
		if (oFF.notNull(infoProvider))
		{
			tableJson.putString(oFF.SacTableConstants.S_INFO_PROVIDER_NAME, infoProvider.getName());
		}
		var filterStructure = tableJson.putNewStructure(oFF.SacTableConstants.M_FILTER_INFO);
		var filter = queryModel.getFilter().getDynamicFilter();
		this.addFilterInfo(filterStructure, oFF.SacTableConstants.M_FILTER_INFO_QM, filter);
		var linkedFilters = queryModel.getFilter().getLinkedFilters();
		if (oFF.XCollectionUtils.hasElements(linkedFilters))
		{
			var linkedFiltersKeyIterator = linkedFilters.getKeysAsIteratorOfString();
			var linkedStructure = filterStructure.putNewStructure(oFF.SacTableConstants.M_FILTER_INFO_LINKED);
			while (linkedFiltersKeyIterator.hasNext())
			{
				var linkedFilterKey = linkedFiltersKeyIterator.next();
				var linkedFilter = linkedFilters.getByKey(linkedFilterKey);
				this.addFilterInfo(linkedStructure, linkedFilterKey, linkedFilter);
			}
		}
		if (oFF.XCollectionUtils.hasElements(queryModel.getConditionManager()))
		{
			var conditionsInfo = queryModel.getConditionManager().serializeToElement(oFF.QModelFormat.INA_REPOSITORY_DATA);
			this.clearIds(conditionsInfo);
			tableJson.put(oFF.SacTableConstants.M_CONDITIONS_INFO, conditionsInfo);
		}
		if (oFF.XCollectionUtils.hasElements(queryModel.getVariables()))
		{
			var variableInfo = queryModel.getVariableContainer().serializeToElement(oFF.QModelFormat.INA_REPOSITORY_DATA);
			this.clearIds(variableInfo);
			tableJson.put(oFF.SacTableConstants.M_VARIABLE_INFO, variableInfo);
		}
	}
	return oFF.SacTableExportHelper.prototype.renderGenericSettings.call( this , tableJson, startCol, colEndIndex, startRow);
};
oFF.SacAnalyticTableExportHelper.prototype.addFilterInfo = function(filterStructure, filterKey, filter)
{
	var filterInfo = filter.serializeToElement(oFF.QModelFormat.INA_REPOSITORY_DATA);
	this.clearIds(filterInfo);
	filterStructure.put(filterKey, filterInfo);
};
oFF.SacAnalyticTableExportHelper.prototype.clearIds = function(element)
{
	if (oFF.notNull(element))
	{
		if (element.isStructure())
		{
			var elementStructure = element.asStructure();
			elementStructure.remove("Id");
			elementStructure.remove("System");
			var keyIterator = elementStructure.getKeysAsIteratorOfString();
			while (keyIterator.hasNext())
			{
				this.clearIds(elementStructure.getByKey(keyIterator.next()));
			}
		}
		else if (element.isList())
		{
			var elementList = element.asList();
			var iterator = elementList.getIterator();
			while (iterator.hasNext())
			{
				this.clearIds(iterator.next());
			}
		}
	}
};

oFF.SacAnalyticTableWidgetRenderHelper = function() {};
oFF.SacAnalyticTableWidgetRenderHelper.prototype = new oFF.SacTableWidgetRenderHelper();
oFF.SacAnalyticTableWidgetRenderHelper.prototype._ff_c = "SacAnalyticTableWidgetRenderHelper";

oFF.SacAnalyticTableWidgetRenderHelper.createAnalyticTableRenderHelper = function(parentTable)
{
	var instance = new oFF.SacAnalyticTableWidgetRenderHelper();
	instance.initializeRH(parentTable);
	return instance;
};
oFF.SacAnalyticTableWidgetRenderHelper.prototype.getAnalyticTable = function()
{
	return this.getTableObject();
};
oFF.SacAnalyticTableWidgetRenderHelper.prototype.renderRow = function(rowList, row, rowIndex)
{
	var rowActual = row;
	var structure = oFF.SacTableWidgetRenderHelper.prototype.renderRow.call( this , rowList, row, rowIndex);
	structure.putInteger(oFF.SacTableConstants.N_TUPLE_INDEX, rowActual.getTupleIndex());
	structure.putInteger(oFF.SacTableConstants.RCS_N_INDEX, rowActual.getDimensionIndex());
	structure.putString(oFF.SacTableConstants.C_SN_FIELD, rowActual.getFieldName());
	return structure;
};
oFF.SacAnalyticTableWidgetRenderHelper.prototype.preFormatCellChart = function(cellBase, structure, rowIndex, colIndex)
{
	var cellChart = oFF.SacTableWidgetRenderHelper.prototype.preFormatCellChart.call( this , cellBase, structure, rowIndex, colIndex);
	this.postFormatCellChart(cellChart, cellBase.getParentRow(), cellBase.getParentColumn());
	return cellChart;
};
oFF.SacAnalyticTableWidgetRenderHelper.prototype.renderColumn = function(sacTableColumn, columnStructure)
{
	if (oFF.notNull(sacTableColumn))
	{
		var sacTableColumnActual = sacTableColumn;
		columnStructure.putInteger(oFF.SacTableConstants.RCS_N_INDEX, sacTableColumnActual.getDimensionIndex());
		columnStructure.putInteger(oFF.SacTableConstants.N_TUPLE_INDEX, sacTableColumnActual.getTupleIndex());
		columnStructure.putString(oFF.SacTableConstants.C_SN_FIELD, sacTableColumnActual.getFieldName());
	}
};
oFF.SacAnalyticTableWidgetRenderHelper.prototype.renderCell = function(cellList, cellBase, rowIndex, colIndex)
{
	var cellBaseActual = cellBase;
	if (cellBase.isEffectiveMergeRepetitiveHeaderCells())
	{
		if (cellBaseActual.getRepetitiveColumns() > 0)
		{
			cellBaseActual.setMergedColumns(cellBaseActual.getRepetitiveColumns());
		}
		if (cellBaseActual.getRepetitiveRows() > 0)
		{
			cellBaseActual.setMergedRows(cellBaseActual.getRepetitiveRows());
		}
	}
	else
	{
		if (cellBaseActual.getParentRow().getParentRow() === null && cellBaseActual.getMergedColumns() > 0)
		{
			cellBaseActual.setMergedColumns(0);
		}
		if (cellBaseActual.getParentColumn().getParentColumn() === null && cellBaseActual.getMergedRows() > 0)
		{
			cellBaseActual.setMergedRows(0);
		}
	}
	var structure = oFF.SacTableWidgetRenderHelper.prototype.renderCell.call( this , cellList, cellBase, rowIndex, colIndex);
	var parentColumn = cellBaseActual.getParentColumn();
	var parentRow = cellBaseActual.getParentRow();
	structure.putInteger(oFF.SacTableConstants.N_TUPLE_INDEX, parentColumn.getTupleIndex());
	if (cellBaseActual.isLastHeaderRow() && !this.getAnalyticTable().isEmptyRowDimensions())
	{
		structure.putInteger(oFF.SacTableConstants.RCS_N_INDEX, parentColumn.getDimensionIndex());
		if (parentColumn.getFieldName() !== null)
		{
			structure.putString(oFF.SacTableConstants.C_SN_FIELD, parentColumn.getFieldName());
		}
	}
	else
	{
		structure.putInteger(oFF.SacTableConstants.RCS_N_INDEX, parentRow.getDimensionIndex());
		if (parentRow.getFieldName() !== null)
		{
			structure.putString(oFF.SacTableConstants.C_SN_FIELD, parentRow.getFieldName());
		}
	}
	if (cellBaseActual.getSortDirection() !== null)
	{
		var iconContent = null;
		if (cellBaseActual.getSortDirection() === oFF.XSortDirection.DEFAULT_VALUE)
		{
			iconContent = "\uE095";
		}
		else if (cellBaseActual.getSortDirection() === oFF.XSortDirection.ASCENDING)
		{
			iconContent = "\uE1FD";
		}
		else if (cellBaseActual.getSortDirection() === oFF.XSortDirection.DESCENDING)
		{
			iconContent = "\uE1FC";
		}
		var cellIcon = structure.putNewList(oFF.SacTableConstants.C_L_CELL_ICONS_RIGHT).addNewStructure();
		cellIcon.putString(oFF.SacTableConstants.CI_S_CLASS_NAME, oFF.SacTableConstants.CI_SV_CLASS_NAME_SAP_UI_ICON);
		var cellIconAttribute = cellIcon.putNewStructure(oFF.SacTableConstants.CI_M_DATA_ATTRIBUTES);
		cellIconAttribute.putString(oFF.SacTableConstants.CIA_S_DATA_SAP_UI_ICON_CONTENT, iconContent);
		var cellIconStyle = cellIcon.putNewStructure(oFF.SacTableConstants.CI_M_STYLE);
		cellIconStyle.putString(oFF.SacTableConstants.CIS_S_FONT_FAMILY, oFF.SacTableConstants.CIS_SV_SAP_ICONS);
		cellIconStyle.putInteger(oFF.SacTableConstants.CIS_N_MARGIN_LEFT, oFF.SacTableConstants.CIS_NV_MARGIN_RIGHT);
		var type = cellBaseActual.getType();
		if (type === oFF.SacTableConstants.CT_ATTRIBUTE_COL_DIM_HEADER || type === oFF.SacTableConstants.CT_COL_DIM_HEADER || type === oFF.SacTableConstants.CT_ROW_DIM_MEMBER || type === oFF.SacTableConstants.CT_ATTRIBUTE_ROW_DIM_MEMBER)
		{
			cellIconStyle.putString(oFF.SacTableConstants.CIS_S_ROTATE, oFF.SacTableConstants.CIS_SV_ROTATE);
		}
		cellIcon.putBoolean(oFF.SacTableConstants.CI_B_ICON_AFTER, true);
	}
	return structure;
};
oFF.SacAnalyticTableWidgetRenderHelper.prototype.postFormatCellChart = function(structure, parentRow, parentColumn)
{
	var anaTab = this.getAnalyticTable();
	if (oFF.XStringUtils.isNotNullAndNotEmpty(anaTab.getDimensionToColorate()) && oFF.XCollectionUtils.hasElements(anaTab.getDimensionColorPalette()))
	{
		var paletteSize = anaTab.getDimensionColorPalette().size();
		var indexElement;
		var keys;
		var index;
		var size;
		var color;
		var subList;
		if (anaTab.getRowDimensionMemberIndex().containsKey(anaTab.getDimensionToColorate()))
		{
			indexElement = anaTab.getRowDimensionMemberIndex().getByKey(anaTab.getDimensionToColorate());
			keys = indexElement.getKeysAsReadOnlyListOfString();
			size = keys.size();
			for (index = 0; index < size; index++)
			{
				color = anaTab.getDimensionColorPalette().get(oFF.XMath.mod(index, paletteSize));
				subList = indexElement.getByKey(keys.get(index));
				if (subList.contains(oFF.XIntegerValue.create(parentRow.getTupleIndex())))
				{
					structure.putString(oFF.SacTableConstants.CC_S_BAR_COLOR, color);
					break;
				}
			}
		}
		else if (anaTab.getColumnDimensionMemberIndex().containsKey(anaTab.getDimensionToColorate()))
		{
			indexElement = anaTab.getColumnDimensionMemberIndex().getByKey(anaTab.getDimensionToColorate());
			keys = indexElement.getKeysAsReadOnlyListOfString();
			size = keys.size();
			for (index = 0; index < size; index++)
			{
				color = anaTab.getDimensionColorPalette().get(oFF.XMath.mod(index, paletteSize));
				subList = indexElement.getByKey(keys.get(index));
				if (subList.contains(oFF.XIntegerValue.create(parentColumn.getTupleIndex())))
				{
					structure.putString(oFF.SacTableConstants.CC_S_BAR_COLOR, color);
					break;
				}
			}
		}
	}
};

oFF.SacAnalyticTableXlsRenderHelper = function() {};
oFF.SacAnalyticTableXlsRenderHelper.prototype = new oFF.SacTableXlsRenderHelper();
oFF.SacAnalyticTableXlsRenderHelper.prototype._ff_c = "SacAnalyticTableXlsRenderHelper";


oFF.ReferenceGrid = function() {};
oFF.ReferenceGrid.prototype = new oFF.XObject();
oFF.ReferenceGrid.prototype._ff_c = "ReferenceGrid";

oFF.ReferenceGrid.MAGIC_CELL_DIV = "/";
oFF.ReferenceGrid.create = function(resultSet)
{
	var grid = new oFF.ReferenceGrid();
	grid.setupSimpleGrid(resultSet, false, false);
	return grid;
};
oFF.ReferenceGrid.createWithDetails = function(resultSet)
{
	var grid = new oFF.ReferenceGrid();
	grid.setupSimpleGrid(resultSet, true, false);
	return grid;
};
oFF.ReferenceGrid.createWithName = function(gridName, resultSet)
{
	var grid = new oFF.ReferenceGrid();
	grid.setupSimpleGrid(resultSet, false, false);
	return grid;
};
oFF.ReferenceGrid.createWithNameAndDetails = function(gridName, resultSet)
{
	var grid = new oFF.ReferenceGrid();
	grid.setupSimpleGrid(resultSet, true, false);
	return grid;
};
oFF.ReferenceGrid.createForVizGrid = function(resultSet)
{
	var grid = new oFF.ReferenceGrid();
	grid.setupSimpleGrid(resultSet, false, true);
	return grid;
};
oFF.ReferenceGrid.prototype.m_resultSet = null;
oFF.ReferenceGrid.prototype.m_withDetails = false;
oFF.ReferenceGrid.prototype.m_defineAllCells = false;
oFF.ReferenceGrid.prototype.m_renderForFireflyGrid = false;
oFF.ReferenceGrid.prototype.m_fixedHeightOff = 0;
oFF.ReferenceGrid.prototype.m_fixedWidthOff = 0;
oFF.ReferenceGrid.prototype.m_offsetRows = 0;
oFF.ReferenceGrid.prototype.m_offsetColumns = 0;
oFF.ReferenceGrid.prototype.m_grid = null;
oFF.ReferenceGrid.prototype.setupSimpleGrid = function(resultSet, withDetails, defineAllCells)
{
	this.setup();
	this.m_withDetails = withDetails;
	this.m_defineAllCells = defineAllCells;
	this.m_resultSet = resultSet;
	this.m_grid = oFF.XReferenceGrid.create();
};
oFF.ReferenceGrid.prototype.releaseObject = function()
{
	this.m_resultSet = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.ReferenceGrid.prototype.prepareCellStructure = function(useRowsHeaderPane, useColumnsHeaderPane)
{
	if (this.m_grid.hasCells() === false && oFF.notNull(this.m_resultSet))
	{
		this.prepareStructure(useRowsHeaderPane, useColumnsHeaderPane);
	}
};
oFF.ReferenceGrid.prototype.prepareStructure = function(useRowsHeaderPane, useColumnsHeaderPane)
{
	var columnsAxis = this.m_resultSet.getColumnsAxis();
	var colMaxCount = oFF.XMath.max(columnsAxis.getDataCount(), columnsAxis.getTuplesCount());
	var rowsAxis = this.m_resultSet.getRowsAxis();
	if (useColumnsHeaderPane)
	{
		this.m_grid.setFixedHeight(oFF.XMath.max(this.getEffectiveFieldSize(columnsAxis), this.m_renderForFireflyGrid && this.getEffectiveFieldSize(rowsAxis) === 0 ? 0 : 1));
	}
	else
	{
		this.m_grid.setFixedHeight(0);
	}
	var rowDataCount = rowsAxis.getDataCount();
	var rowTupleCount = rowsAxis.getTuplesCount();
	var rowMaxCount = oFF.XMath.max(rowDataCount, rowTupleCount);
	if (useRowsHeaderPane)
	{
		this.m_grid.setFixedWidth(oFF.XMath.max(this.getEffectiveFieldSize(rowsAxis), 1));
	}
	else
	{
		this.m_grid.setFixedWidth(0);
	}
	var totalColumns = this.m_grid.getFixedWidth() + colMaxCount;
	var totalRows = this.m_grid.getFixedHeight() + rowMaxCount;
	this.m_offsetColumns = this.m_resultSet.getQueryManager().getOffsetColumns();
	this.m_offsetRows = this.m_resultSet.getQueryManager().getOffsetRows();
	this.m_grid.setFullSize(totalColumns, totalRows);
	for (var x = 0; x < totalColumns; x++)
	{
		this.m_grid.addColumnsDef(oFF.XReferenceGridLine.create());
	}
	for (var y = 0; y < totalRows; y++)
	{
		this.m_grid.addRowsDef(oFF.XReferenceGridLine.create());
	}
	if (useRowsHeaderPane && useColumnsHeaderPane)
	{
		this.setTitleCells(rowsAxis, oFF.XMath.max(this.getFixedHeight() - 1, 0), columnsAxis.getRsDimensions().isEmpty());
		this.setTitleCells(columnsAxis, oFF.XMath.max(this.getFixedWidth() - 1, 0), rowsAxis.getRsDimensions().isEmpty());
	}
	if (useRowsHeaderPane)
	{
		var fixedHeight = this.m_grid.getFixedHeight() - this.m_fixedHeightOff;
		this.setHeaderCells(rowsAxis, fixedHeight);
	}
	if (useColumnsHeaderPane)
	{
		var fixedWidth = this.m_grid.getFixedWidth() - this.m_fixedWidthOff;
		this.setHeaderCells(columnsAxis, fixedWidth);
	}
	this.setDataCells();
};
oFF.ReferenceGrid.prototype.getEffectiveFieldSize = function(axis)
{
	var effectiveSize = 0;
	var rsDimensions = axis.getRsDimensions();
	var dimensionSize = rsDimensions.size();
	for (var idxDim = 0; idxDim < dimensionSize; idxDim++)
	{
		effectiveSize = effectiveSize + rsDimensions.get(idxDim).getResultSetFields().size();
	}
	return effectiveSize;
};
oFF.ReferenceGrid.prototype.setTitleCells = function(axis, row, complementaryAxisEmpty)
{
	var type = axis.getType();
	var rsDimensions = axis.getRsDimensions();
	var column = 0;
	var buffer = oFF.XStringBuffer.create();
	var bufferDV = oFF.XStringBuffer.create();
	var dimSize = rsDimensions.size();
	for (var idxDim = 0; idxDim < dimSize; idxDim++)
	{
		var rsDimension = rsDimensions.get(idxDim);
		var visibleFields = rsDimension.getResultSetFields();
		var fieldSize = visibleFields.size();
		for (var idxField = 0; idxField < fieldSize; idxField++)
		{
			var fieldName = visibleFields.get(idxField).getName();
			if (oFF.XStringUtils.isNullOrEmpty(rsDimension.getName()))
			{
				buffer.append("[").append(fieldName).append("]");
			}
			else
			{
				if (idxField === 0)
				{
					bufferDV.append(rsDimension.getText());
				}
				if (rsDimension.isMeasureStructure())
				{
					if (idxField === 0)
					{
						buffer.append("Measures");
					}
				}
				else if (rsDimension.isStructure())
				{
					if (idxField === 0)
					{
						buffer.append("Structure");
					}
				}
				else
				{
					if (idxField === 0)
					{
						buffer.append(rsDimension.getName()).append(".[");
					}
					else
					{
						buffer.append("[");
					}
					buffer.append(fieldName).append("]");
				}
			}
			if (type === oFF.AxisType.ROWS)
			{
				if (!(this.m_renderForFireflyGrid && rsDimension.isStructure() && dimSize === idxDim + 1))
				{
					var titleCell = oFF.XReferenceGridCell.create(buffer.toString(), oFF.RgCellType.TITLE);
					titleCell.setDisplayValue(bufferDV.toString());
					titleCell.setDimension(rsDimension.getName());
					titleCell.setPart("Rows");
					titleCell.setRow(row);
					titleCell.setColumn(column);
					this.m_grid.setCell(column, row, titleCell, false);
				}
				else if (complementaryAxisEmpty && !this.m_renderForFireflyGrid)
				{
					this.m_fixedHeightOff = 1;
				}
			}
			else
			{
				if (!(this.m_renderForFireflyGrid && rsDimension.isStructure() && dimSize === idxDim + 1))
				{
					var existingCell = this.m_grid.getSimpleCell(row, column);
					if (oFF.notNull(existingCell))
					{
						var simpleName = buffer.toString();
						buffer.clear();
						bufferDV.clear();
						buffer.append(existingCell.toString());
						buffer.append(oFF.ReferenceGrid.MAGIC_CELL_DIV);
						buffer.append(simpleName);
						if (this.m_renderForFireflyGrid)
						{
							bufferDV.append(existingCell.getDisplayValue());
						}
						if (idxField === 0 && !rsDimension.isStructure())
						{
							bufferDV.append(oFF.ReferenceGrid.MAGIC_CELL_DIV);
							bufferDV.append(rsDimension.getText());
						}
					}
					var titCell = oFF.XReferenceGridCell.create(buffer.toString(), oFF.RgCellType.TITLE);
					if (this.m_renderForFireflyGrid)
					{
						titCell.setRow(row);
						titCell.setColumn(column);
						titCell.setDisplayValue(bufferDV.toString());
						if (oFF.notNull(existingCell))
						{
							titCell.setPart("Mixed");
						}
						else
						{
							titCell.setPart("Columns");
						}
						if (oFF.notNull(existingCell))
						{
							titCell.setDimension(existingCell.getDimension());
						}
						else
						{
							titCell.setDimension(rsDimension.getName());
						}
					}
					else
					{
						titCell.setDimension(rsDimension.getName());
					}
					this.m_grid.setCell(row, column, titCell, true);
				}
				else if (complementaryAxisEmpty)
				{
					this.m_fixedWidthOff = 1;
				}
			}
			buffer.clear();
			bufferDV.clear();
			column++;
		}
	}
};
oFF.ReferenceGrid.prototype.setDataCells = function()
{
	var readinessStates = this.m_resultSet.getInputReadinessStates();
	var dc = this.m_resultSet.getDataColumns();
	var dr = this.m_resultSet.getDataRows();
	var sb = oFF.XStringBuffer.create();
	for (var y = 0; y < dr; y++)
	{
		for (var x = 0; x < dc; x++)
		{
			var dataCell = this.m_resultSet.getDataCell(x, y);
			var cell;
			if (this.m_withDetails)
			{
				cell = oFF.XReferenceGridCell.create(this.getCellValueWithDetails(dataCell, readinessStates), oFF.RgCellType.DATA);
			}
			else
			{
				cell = oFF.XReferenceGridCell.create(this.getCellValue(this.formatDataCellValue(dataCell), dataCell), oFF.RgCellType.DATA);
			}
			if (this.m_renderForFireflyGrid)
			{
				sb.clear();
				this.appendPrefixValueSuffix(dataCell.getCurrencyUnit(), dataCell, sb);
				cell.setDisplayValue(sb.toString());
				cell.setPart("Data");
				cell.setAlertLeve(dataCell.getMaxAlertLevel().getName());
				cell.setIsInputEnabled(dataCell.isDataEntryEnabled());
				var rsDC = dataCell.getDataCell();
				if (oFF.notNull(rsDC))
				{
					var s1 = dataCell.getQueryModel().getDataSource().getName();
					sb.clear();
					var refStr = rsDC.getReferenceStructureElement1();
					if (oFF.notNull(refStr))
					{
						sb.append("mem-");
						sb.append(refStr.getFieldValue(refStr.getDimension().getDisplayKeyField()).getString());
						if (refStr.getFieldValue(refStr.getDimension().getDisplayKeyField()) !== null)
						{
							cell.setMember(refStr.getFieldValue(refStr.getDimension().getDisplayKeyField()).getString());
						}
						else
						{
							cell.setMember(refStr.getName());
						}
					}
					refStr = rsDC.getReferenceStructureElement2();
					if (oFF.notNull(refStr))
					{
						sb.append("-mem-");
						sb.append(refStr.getFieldValue(refStr.getDimension().getDisplayKeyField()).getString());
						if (refStr.getFieldValue(refStr.getDimension().getDisplayKeyField()) !== null)
						{
							cell.setMember2(refStr.getFieldValue(refStr.getDimension().getDisplayKeyField()).getString());
						}
						else
						{
							cell.setMember(refStr.getName());
						}
					}
					var s2 = sb.toString();
					var s3 = dataCell.getValueException().isValidValue() && dataCell.getValueException() !== oFF.ValueException.NULL_VALUE ? oFF.XNumberFormatter.formatDoubleToString(dataCell.getDouble(), "0.####") : "";
					sb.clear();
					cell.setDataValueId(oFF.XStringUtils.concatenate5(s1, "-", s2, "-", s3));
				}
				cell.setRow(y + this.m_grid.getFixedHeight() - this.m_fixedHeightOff + this.m_offsetRows);
				cell.setColumn(x + this.m_grid.getFixedWidth() - this.m_fixedWidthOff + this.m_offsetColumns);
			}
			this.m_grid.setCell(x + this.m_grid.getFixedWidth() - this.m_fixedWidthOff, y + this.m_grid.getFixedHeight() - this.m_fixedHeightOff, cell, false);
		}
	}
};
oFF.ReferenceGrid.prototype.formatDataCellValue = function(dataCell)
{
	return dataCell.getFormattedValue();
};
oFF.ReferenceGrid.prototype.getCellValueWithDetails = function(dataCell, readinessStates)
{
	var sb = oFF.XStringBuffer.create();
	var qDataCell = dataCell.getDataCell();
	if (oFF.notNull(qDataCell))
	{
		sb.append("(DataCell->").append(qDataCell.getName()).append(")");
	}
	var decimalPlaces = dataCell.getDecimalPlaces();
	if (decimalPlaces !== 0)
	{
		sb.append("(Decimal Places=").appendInt(decimalPlaces).append(")");
	}
	if (dataCell.isDataEntryEnabled())
	{
		sb.append("I:");
	}
	if (dataCell.isValueLocked())
	{
		sb.append("L:");
	}
	var currencyUnit = dataCell.getCurrencyUnit();
	this.appendPrefixValueSuffix(currencyUnit, dataCell, sb);
	this.appendValueException(dataCell, sb);
	this.appendAlertLevel(dataCell, sb);
	this.appendValueChanged(dataCell, sb);
	sb.append("|").append(dataCell.getValueType().getName());
	sb.append("|").append(dataCell.getFormatString());
	this.appendCurrencyUnit(currencyUnit, sb);
	this.appendInputReadiness(dataCell, readinessStates, sb);
	return sb.toString();
};
oFF.ReferenceGrid.prototype.appendPrefixValueSuffix = function(currencyUnit, dataCell, sb)
{
	if (oFF.notNull(currencyUnit) && currencyUnit.hasPrefix())
	{
		sb.append(currencyUnit.getPrefix()).append(" ");
	}
	sb.append(this.formatDataCellValue(dataCell));
	if (oFF.notNull(currencyUnit) && currencyUnit.hasSuffix())
	{
		sb.append(" ").append(currencyUnit.getSuffix());
	}
};
oFF.ReferenceGrid.prototype.appendValueException = function(dataCell, sb)
{
	var valueException = dataCell.getValueException();
	if (valueException !== oFF.ValueException.NORMAL)
	{
		sb.append("|");
		if (oFF.isNull(valueException))
		{
			sb.append("<null>");
		}
		else
		{
			sb.append(valueException.getName());
		}
	}
};
oFF.ReferenceGrid.prototype.appendInputReadiness = function(dataCell, readinessStates, sb)
{
	var queryManager = dataCell.getQueryModel().getQueryManager();
	if (queryManager.supportsInputReadinessStates() && dataCell.getQueryModel().isDataEntryEnabled())
	{
		var inputReadinessState = dataCell.getInputReadinessState();
		if (oFF.notNull(inputReadinessState))
		{
			var readinessState = readinessStates.get(inputReadinessState.getIndex());
			var inputReadinessTypes = readinessState.getInputReadinessTypes();
			var types = oFF.XListOfString.create();
			for (var i = 0; i < inputReadinessTypes.size(); i++)
			{
				types.add(inputReadinessTypes.get(i).getShortcut());
			}
			sb.append("|S:").append(oFF.XCollectionUtils.join(types, ","));
		}
	}
};
oFF.ReferenceGrid.prototype.appendAlertLevel = function(dataCell, sb)
{
	var maxAlertLevel = dataCell.getMaxAlertLevel();
	if (maxAlertLevel !== oFF.AlertLevel.NORMAL)
	{
		sb.append("|[");
		sb.append(oFF.isNull(maxAlertLevel) ? "<null>" : maxAlertLevel.getName());
		sb.append("]");
	}
};
oFF.ReferenceGrid.prototype.appendValueChanged = function(dataCell, sb)
{
	if (dataCell.isValueChanged())
	{
		sb.append("|N:");
		var newValue = dataCell.getXValue();
		if (oFF.isNull(newValue))
		{
			sb.append("<null>");
		}
		else
		{
			sb.append(newValue.getValueType().getName());
			if (newValue.getValueType() === oFF.XValueType.STRING)
			{
				sb.append(" ").append(newValue.getString());
			}
		}
	}
	if (dataCell.isNewValueForced())
	{
		sb.append("|F:");
	}
};
oFF.ReferenceGrid.prototype.appendCurrencyUnit = function(currencyUnit, sb)
{
	if (oFF.notNull(currencyUnit) && !currencyUnit.isEmpty())
	{
		sb.append("|");
		if (currencyUnit.isMixed())
		{
			sb.append("M:");
		}
		else if (currencyUnit.hasUnit())
		{
			sb.append("U:");
		}
		else if (currencyUnit.hasCurrency())
		{
			sb.append("C:");
		}
		if (currencyUnit.hasFormatted())
		{
			sb.append(currencyUnit.getFormatted());
		}
		else
		{
			sb.append("<null>");
		}
	}
};
oFF.ReferenceGrid.prototype.getCellValue = function(formattedValue, dataCell)
{
	var valueException = dataCell.getValueException();
	if (valueException === oFF.ValueException.NULL_VALUE || valueException === oFF.ValueException.UNDEFINED)
	{
		return "";
	}
	var exceptionText = null;
	if (valueException !== oFF.ValueException.NORMAL && valueException !== oFF.ValueException.ZERO)
	{
		exceptionText = valueException.getName();
	}
	var alertLevelText = null;
	var maxAlertLevel = dataCell.getMaxAlertLevel();
	if (maxAlertLevel !== oFF.AlertLevel.NORMAL)
	{
		alertLevelText = maxAlertLevel.getName();
	}
	if (oFF.notNull(exceptionText) || oFF.notNull(alertLevelText))
	{
		var buffer = oFF.XStringBuffer.create();
		buffer.append(formattedValue);
		if (oFF.notNull(alertLevelText))
		{
			buffer.append(" [").append(alertLevelText).append("]");
		}
		if (oFF.notNull(exceptionText))
		{
			buffer.append(" [").append(exceptionText).append("]");
		}
		return buffer.toString();
	}
	return formattedValue;
};
oFF.ReferenceGrid.prototype.setHeaderCells = function(axis, tupleOffset)
{
	var rsDimensions = axis.getRsDimensions();
	var axisType = axis.getType();
	var tuplesCount = axis.getTuplesCount();
	var formattedValue = oFF.XStringBuffer.create();
	var displayValue = oFF.XStringBuffer.create();
	var emptyHeaderCell = oFF.XReferenceGridCell.create(null, oFF.RgCellType.HEADER);
	var emptyHeaderTotalsCell = oFF.XReferenceGridCell.create(null, oFF.RgCellType.HEADER);
	for (var tupleIndex = 0; tupleIndex < tuplesCount; tupleIndex++)
	{
		var tuple = axis.getTupleAt(tupleIndex);
		var position = 0;
		var hasTotals = false;
		var tupleSize = tuple.size();
		for (var tupleElementIndex = 0; tupleElementIndex < tupleSize; tupleElementIndex++)
		{
			var rsDimension = rsDimensions.get(tupleElementIndex);
			var element = tuple.get(tupleElementIndex);
			var rsVisibleFields = rsDimension.getResultSetFields();
			var visibleFieldCount = rsVisibleFields.size();
			if (element.getFirstTuple() === tuple || this.m_renderForFireflyGrid === true)
			{
				var dimensionMember = element.getDimensionMember();
				formattedValue.clear();
				var memberType = dimensionMember.getMemberType();
				if (memberType.isResult())
				{
					this.enableTotals(axisType, tupleIndex + tupleOffset);
					if (visibleFieldCount > 0)
					{
						var added = 0;
						if (!hasTotals)
						{
							if (memberType === oFF.MemberType.CONDITION_RESULT)
							{
								formattedValue.append("[Totals Included]");
								displayValue.append("[Totals Included]");
							}
							else if (memberType === oFF.MemberType.CONDITION_OTHERS_RESULT)
							{
								formattedValue.append("[Totals Remaining]");
								displayValue.append("[Totals Remaining]");
							}
							else
							{
								formattedValue.append("[Totals]");
								displayValue.append("[Totals]");
							}
							this.appendAlertLevelToValue(element, formattedValue);
							var totalsCell = oFF.XReferenceGridCell.create(formattedValue.toString(), oFF.RgCellType.HEADER);
							if (this.m_renderForFireflyGrid)
							{
								if (element.getFirstTuple() === tuple)
								{
									totalsCell.setDisplayValue(displayValue.toString());
								}
								totalsCell.setDimension(rsDimension.getName());
								if (rsDimension.isStructure() && dimensionMember.getDimension().getStructureMember(dimensionMember.getName()).getFieldValue(dimensionMember.getDimension().getDisplayKeyField()) !== null)
								{
									totalsCell.setMember(dimensionMember.getDimension().getStructureMember(dimensionMember.getName()).getFieldValue(dimensionMember.getDimension().getDisplayKeyField()).getString());
								}
								else
								{
									totalsCell.setMember(dimensionMember.getName());
								}
								if (axis === this.m_resultSet.getRowsAxis())
								{
									totalsCell.setPart("Rows");
									totalsCell.setRowTupleIndex(tupleIndex);
								}
								else
								{
									totalsCell.setPart("Columns");
									totalsCell.setColumnTupleIndex(tupleIndex);
								}
							}
							this.addCell(axisType, position, tupleIndex, tupleOffset, totalsCell);
							formattedValue.clear();
							displayValue.clear();
							added = 1;
						}
						if (this.m_defineAllCells)
						{
							position = position + added;
							for (var x = added; x < visibleFieldCount; x++)
							{
								this.addCell(axisType, position, tupleIndex, tupleOffset, emptyHeaderTotalsCell);
								position++;
							}
						}
						else
						{
							position = position + visibleFieldCount;
						}
					}
					hasTotals = true;
				}
				else
				{
					for (var fieldIndex = 0; fieldIndex < visibleFieldCount; fieldIndex++)
					{
						var fieldValue = dimensionMember.getAllFieldValues().getByKey(rsVisibleFields.get(fieldIndex).getName());
						formattedValue.append(this.formatFieldValue(fieldValue));
						displayValue.append(this.formatFieldValue(fieldValue));
						if (fieldIndex === 0)
						{
							this.prependToFirstField(element, formattedValue);
							this.appendAlertLevelToValue(element, formattedValue);
						}
						var gridCell = oFF.XReferenceGridCell.create(formattedValue.toString(), oFF.RgCellType.HEADER);
						if (this.m_renderForFireflyGrid)
						{
							if (axisType === oFF.AxisType.ROWS)
							{
								gridCell.setPart("Rows");
							}
							else
							{
								gridCell.setPart("Columns");
							}
							if (element.getFirstTuple() === tuple)
							{
								gridCell.setDisplayValue(displayValue.toString());
							}
							gridCell.setDimension(rsDimension.getName());
							if (rsDimension.isStructure() && dimensionMember.getDimension().getStructureMember(dimensionMember.getName()).getFieldValue(dimensionMember.getDimension().getDisplayKeyField()) !== null)
							{
								gridCell.setMember(dimensionMember.getDimension().getStructureMember(dimensionMember.getName()).getFieldValue(dimensionMember.getDimension().getDisplayKeyField()).getString());
							}
							else
							{
								gridCell.setMember(dimensionMember.getName());
							}
							if (axis === this.m_resultSet.getRowsAxis())
							{
								gridCell.setRowTupleIndex(tupleIndex);
							}
							else
							{
								gridCell.setColumnTupleIndex(tupleIndex);
							}
						}
						if (fieldIndex === 0 && element.getFirstTuple() === tuple)
						{
							gridCell.setDisplayLevel(element.getDisplayLevel());
							var drillState = element.getDrillState();
							var icon = "";
							if (drillState === oFF.DrillState.EXPANDED || drillState === oFF.DrillState.DRILLED)
							{
								gridCell.setDrillState("Expanded");
								if (rsDimension.getLowerLevelNodeAlignment() === oFF.Alignment.CHILDREN_ABOVE_PARENT)
								{
									if (axisType === oFF.AxisType.ROWS)
									{
										icon = "sap-icon://slim-arrow-up";
									}
									else
									{
										icon = "sap-icon://slim-arrow-left";
									}
								}
								else
								{
									if (axisType === oFF.AxisType.ROWS)
									{
										icon = "sap-icon://slim-arrow-down";
									}
									else
									{
										icon = "sap-icon://slim-arrow-down";
									}
								}
							}
							else if (drillState === oFF.DrillState.COLLAPSED || drillState === oFF.DrillState.LEAF_UDH_EXPAND_ALLOWED)
							{
								gridCell.setDrillState("Collapsed");
								if (rsDimension.getLowerLevelNodeAlignment() === oFF.Alignment.CHILDREN_ABOVE_PARENT)
								{
									if (axisType === oFF.AxisType.ROWS)
									{
										icon = "sap-icon://slim-arrow-right";
									}
									else
									{
										icon = "sap-icon://slim-arrow-up";
									}
								}
								else
								{
									if (axisType === oFF.AxisType.ROWS)
									{
										icon = "sap-icon://slim-arrow-right";
									}
									else
									{
										icon = "sap-icon://slim-arrow-right";
									}
								}
							}
							else
							{
								gridCell.setDrillState("None");
								icon = "";
							}
							gridCell.setIcon(icon);
						}
						formattedValue.clear();
						displayValue.clear();
						this.addCell(axisType, position, tupleIndex, tupleOffset, gridCell);
						position++;
					}
				}
			}
			else
			{
				if (this.m_defineAllCells)
				{
					for (var m = 0; m < visibleFieldCount; m++)
					{
						this.addCell(axisType, position, tupleIndex, tupleOffset, emptyHeaderCell);
						position++;
					}
				}
				else
				{
					position = position + visibleFieldCount;
				}
			}
		}
	}
};
oFF.ReferenceGrid.prototype.formatFieldValue = function(fieldValue)
{
	if (oFF.isNull(fieldValue))
	{
		return "[null]";
	}
	else
	{
		if (fieldValue.getValueType() === oFF.XValueType.DOUBLE || fieldValue.getValueType() === oFF.XValueType.DECIMAL_FLOAT && fieldValue.getDecFloat().mayLoosePrecision())
		{
			var value = fieldValue.getDouble();
			return oFF.XNumberFormatter.formatDoubleToString(value, "#.0000");
		}
		else
		{
			return fieldValue.getFormattedValue();
		}
	}
};
oFF.ReferenceGrid.prototype.appendAlertLevelToValue = function(element, formattedValue)
{
	if (oFF.XStringUtils.isNotNullAndNotEmpty(element.getExceptionName()))
	{
		formattedValue.append(" [").appendInt(element.getAlertLevel()).append("]");
	}
};
oFF.ReferenceGrid.prototype.prependToFirstField = function(element, formattedValue)
{
	var displayLevel = element.getDisplayLevel();
	var drillState = element.getDrillState();
	if (displayLevel > 0 || drillState !== oFF.DrillState.LEAF)
	{
		var oldValue = formattedValue.toString();
		formattedValue.clear();
		for (var i = 0; i < displayLevel; i++)
		{
			formattedValue.append("  ");
		}
		if (drillState === oFF.DrillState.COLLAPSED || drillState === oFF.DrillState.LEAF_DRILLDOWN_ALLOWED || drillState === oFF.DrillState.LEAF_UDH_EXPAND_ALLOWED || drillState === oFF.DrillState.COLLAPSED_EXPAND_AND_DRILLDOWN_ALLOWED)
		{
			formattedValue.append("+ ");
		}
		else if (drillState === oFF.DrillState.EXPANDED || drillState === oFF.DrillState.DRILLED || drillState === oFF.DrillState.LEAF_UDH)
		{
			formattedValue.append("- ");
		}
		formattedValue.append(oldValue);
	}
};
oFF.ReferenceGrid.prototype.addCell = function(axisType, position, tupleIndex, tupleOffset, cell)
{
	if (axisType === oFF.AxisType.ROWS)
	{
		cell.setRow(tupleIndex + tupleOffset + this.m_offsetRows);
		cell.setColumn(position + this.m_offsetColumns);
		this.m_grid.setCell(position, tupleIndex + tupleOffset, cell, false);
	}
	else
	{
		cell.setRow(position);
		cell.setColumn(tupleIndex + tupleOffset);
		this.m_grid.setCell(tupleIndex + tupleOffset, position, cell, false);
	}
};
oFF.ReferenceGrid.prototype.enableTotals = function(axisType, position)
{
	var rgLineDef;
	if (axisType === oFF.AxisType.ROWS)
	{
		rgLineDef = this.m_grid.getRowsDef(position);
	}
	else
	{
		rgLineDef = this.m_grid.getColumnDef(position);
	}
	if (oFF.notNull(rgLineDef))
	{
		rgLineDef.setHasTotals(true);
	}
};
oFF.ReferenceGrid.prototype.exportForProtocol = function(protocolType)
{
	if (protocolType.isTypeOf(oFF.ProtocolBindingType.FIREFLY_GRID))
	{
		return this.exportToFireflyGrid();
	}
	return this.exportToVizGrid();
};
oFF.ReferenceGrid.prototype.exportToVizGrid = function()
{
	this.prepareCellStructure(true, true);
	var colCount = this.m_grid.getColumnCount();
	var rowCount = this.m_grid.getRowCount();
	var layer1 = oFF.PrFactory.createStructure();
	layer1.putString("Type", "Grid");
	layer1.putInteger("RowCount", rowCount);
	layer1.putInteger("ColCount", colCount);
	var layer1Cells = layer1.putNewList("Cells");
	for (var y = 0; y < rowCount; y++)
	{
		for (var x = 0; x < colCount; x++)
		{
			var cell = layer1Cells.addNewStructure();
			var gridCell = this.m_grid.getSimpleCell(x, y);
			if (oFF.notNull(gridCell))
			{
				cell.putString("Type", "Text");
				cell.putString("Value", gridCell.getText(50));
				if (!gridCell.isLeftAligned())
				{
					cell.putString("HAlign", "End");
				}
				if (gridCell.isTotals())
				{
					cell.putBoolean("Totals", true);
				}
				var cellType = gridCell.getCellType();
				if (cellType === oFF.RgCellType.HEADER)
				{
					cell.putString("Semantic", "Header");
				}
				else if (cellType === oFF.RgCellType.TITLE)
				{
					cell.putString("Semantic", "Title");
				}
			}
			else
			{
				cell.putString("Type", "Empty");
			}
		}
	}
	return layer1;
};
oFF.ReferenceGrid.prototype.exportToFireflyGrid = function()
{
	this.m_renderForFireflyGrid = true;
	this.prepareCellStructure(true, true);
	var colCount = this.m_grid.getColumnCount();
	var rowCount = this.m_grid.getRowCount();
	var fixedRows = this.m_grid.getFixedRowsCount();
	var fixedCols = this.m_grid.getFixedColumnsCount();
	var layer1 = oFF.PrFactory.createStructure();
	layer1.putString("Type", "Grid");
	layer1.putString("ApplicationName", this.m_resultSet.getApplication().getApplicationName());
	layer1.putInteger("RowCount", rowCount);
	layer1.putInteger("ColCount", colCount);
	layer1.putInteger("FixedRows", fixedRows);
	layer1.putInteger("FixedColumns", fixedCols);
	var layer1Cells = layer1.putNewList("Cells");
	for (var y = 0; y < rowCount; y++)
	{
		for (var x = 0; x < colCount; x++)
		{
			var gridCell = this.m_grid.getSimpleCell(x, y);
			if (oFF.notNull(gridCell))
			{
				var cell = layer1Cells.addNewStructure();
				cell.putString("GridPart", gridCell.getPart());
				cell.putString("Type", "Text");
				cell.putString("DisplayValue", gridCell.getDisplayValue());
				cell.putString("Value", gridCell.getText(-1));
				cell.putInteger("Row", gridCell.getRow());
				cell.putInteger("Column", gridCell.getColumn());
				cell.putString("DrillState", gridCell.getDrillState());
				cell.putString("DataValueId", gridCell.getDataValueId());
				cell.putInteger("DisplayLevel", gridCell.getDisplayLevel());
				cell.putInteger("RowTupleIndex", gridCell.getRowTupleIndex());
				cell.putInteger("ColumnTupleIndex", gridCell.getColumnTupleIndex());
				cell.putString("Icon", gridCell.getIcon());
				cell.putString("AlertLevel", gridCell.getAlertLevel());
				cell.putBoolean("Input", gridCell.isInputEnabled());
				if (gridCell.isTotals())
				{
					cell.putBoolean("Totals", true);
				}
				var cellType = gridCell.getCellType();
				if (cellType === oFF.RgCellType.HEADER)
				{
					cell.putString("Semantic", "Header");
					cell.putString("Dimension", gridCell.getDimension());
					cell.putString("Member", gridCell.getMember());
				}
				else if (cellType === oFF.RgCellType.TITLE)
				{
					cell.putString("Semantic", "Title");
					cell.putString("Dimension", gridCell.getDimension());
				}
				else if (cellType === oFF.RgCellType.DATA)
				{
					cell.putInteger("DataRow", y - fixedRows);
					cell.putInteger("DataColumn", x - fixedCols);
					cell.putString("Member", gridCell.getMember());
					cell.putString("Member2", gridCell.getMember2());
					cell.putString("Semantic", gridCell.isTotals() ? "Result" : "Standard");
				}
				else
				{
					cell.putString("Semantic", "Empty");
					cell.putString("GridPart", "Empty");
				}
			}
		}
	}
	this.m_renderForFireflyGrid = false;
	return layer1;
};
oFF.ReferenceGrid.prototype.getRowCount = function()
{
	return this.m_grid.getRowCount();
};
oFF.ReferenceGrid.prototype.getColumnCount = function()
{
	return this.m_grid.getColumnCount();
};
oFF.ReferenceGrid.prototype.getFixedRowsCount = function()
{
	return this.m_grid.getFixedRowsCount();
};
oFF.ReferenceGrid.prototype.getFixedColumnsCount = function()
{
	return this.m_grid.getFixedColumnsCount();
};
oFF.ReferenceGrid.prototype.getColumnMaxCharacters = function(column, rowStart, maxRowCount)
{
	return this.m_grid.getColumnMaxCharacters(column, rowStart, maxRowCount);
};
oFF.ReferenceGrid.prototype.addRowsDef = function(line)
{
	this.m_grid.addRowsDef(line);
};
oFF.ReferenceGrid.prototype.getRowsDef = function(index)
{
	return this.m_grid.getRowsDef(index);
};
oFF.ReferenceGrid.prototype.addColumnsDef = function(line)
{
	this.m_grid.addColumnsDef(line);
};
oFF.ReferenceGrid.prototype.getColumnDef = function(index)
{
	return this.m_grid.getColumnDef(index);
};
oFF.ReferenceGrid.prototype.getSimpleCell = function(column, row)
{
	return this.m_grid.getSimpleCell(column, row);
};
oFF.ReferenceGrid.prototype.setCell = function(x, y, cell, overwriteAllowed)
{
	this.m_grid.setCell(x, y, cell, overwriteAllowed);
};
oFF.ReferenceGrid.prototype.exportToAscii = function(maxCellSize)
{
	return this.exportToAsciiExt(maxCellSize, true, true, 0, -1, 0, -1);
};
oFF.ReferenceGrid.prototype.exportBodyColumns = function(maxCellSize, useColumnsHeaderPane, columnStart, maxColumnCount)
{
	return this.exportToAsciiExt(maxCellSize, false, useColumnsHeaderPane, 0, -1, columnStart, maxColumnCount);
};
oFF.ReferenceGrid.prototype.exportBodyRows = function(maxCellSize, useRowsHeaderPane, rowStart, maxRowCount)
{
	return this.exportToAsciiExt(maxCellSize, useRowsHeaderPane, false, rowStart, maxRowCount, 0, -1);
};
oFF.ReferenceGrid.prototype.exportToAsciiExt = function(maxCellSize, useRowsHeaderPane, useColumnsHeaderPane, rowStart, maxRowCount, columnStart, maxColumnCount)
{
	this.prepareCellStructure(useRowsHeaderPane, useColumnsHeaderPane);
	return this.m_grid.exportToAsciiExt(maxCellSize, useRowsHeaderPane, useColumnsHeaderPane, rowStart, maxRowCount, columnStart, maxColumnCount);
};
oFF.ReferenceGrid.prototype.exportToFingerprint = function()
{
	this.m_grid.setFingerprintMode();
	this.prepareCellStructure(true, true);
	return this.m_grid.getFingerprint();
};
oFF.ReferenceGrid.prototype.getFixedHeight = function()
{
	return this.m_grid.getFixedHeight();
};
oFF.ReferenceGrid.prototype.setFixedHeight = function(fixedHeight)
{
	this.m_grid.setFixedHeight(fixedHeight);
};
oFF.ReferenceGrid.prototype.getFixedWidth = function()
{
	return this.m_grid.getFixedWidth();
};
oFF.ReferenceGrid.prototype.setFixedWidth = function(fixedWidth)
{
	this.m_grid.setFixedWidth(fixedWidth);
};
oFF.ReferenceGrid.prototype.setFullSize = function(totalColumns, totalRows)
{
	this.m_grid.setFullSize(totalColumns, totalRows);
};
oFF.ReferenceGrid.prototype.hasCells = function()
{
	return this.m_grid.hasCells();
};
oFF.ReferenceGrid.prototype.getFingerprint = oFF.noSupport;
oFF.ReferenceGrid.prototype.setFingerprintMode = oFF.noSupport;

oFF.RsHiChartBoxplotHelper = function() {};
oFF.RsHiChartBoxplotHelper.prototype = new oFF.RsHiChartSeriesHelper();
oFF.RsHiChartBoxplotHelper.prototype._ff_c = "RsHiChartBoxplotHelper";

oFF.RsHiChartBoxplotHelper.prototype.prepareRendering = function() {};
oFF.RsHiChartBoxplotHelper.prototype.readResultSetData = function(columnAxis, rowAxis, rs)
{
	var theChartData = this.getChartData();
	var xAxis = theChartData.putNewList(oFF.VizDefConstants.K_X_AXIS);
	var xAxisStruct = xAxis.addNewStructure();
	var chartlang = theChartData.putNewStructure(oFF.VizDefConstants.K_LANG);
	var decimalPlaceString = oFF.XInteger.convertToString(columnAxis.getDecimalPlaces(oFF.VizDefConstants.K_VALUE_AXIS));
	if (rs.getAvailableDataCellCount() > 0)
	{
		var seriesList = theChartData.putNewList(oFF.VizDefConstants.K_SERIES);
		var buff = oFF.XStringBuffer.create();
		buff.append("<b>{series.name}</b><br/><b>Distribution</b> <br/>");
		buff.append("Maximum: {point.high:,.");
		buff.append(decimalPlaceString);
		buff.append("f} <br/>Upper Quartile: {point.q3:,.");
		buff.append(decimalPlaceString);
		buff.append("f} <br/>Median: {point.median:,.");
		buff.append(decimalPlaceString);
		buff.append("f} <br/>Lower Quartile: {point.q1:,.");
		buff.append(decimalPlaceString);
		buff.append("f} <br/>Minimum: {point.low:,.");
		buff.append(decimalPlaceString);
		buff.append("f}");
		var categoriesList = xAxisStruct.putNewList(oFF.VizDefConstants.K_CATEGORIES);
		var rowHeadings = rowAxis.getPrettyNamesForFeed(true, false, oFF.VizDefConstants.K_CATEGORY_AXIS);
		var columnSelectors = oFF.XListOfString.create();
		columnSelectors.add(oFF.VizDefConstants.K_VALUE_AXIS);
		columnSelectors.add(oFF.VizDefConstants.K_VALUE_AXIS2);
		columnSelectors.add(oFF.VizDefConstants.K_VARIANCE);
		for (var h = 0; h < rowHeadings.size(); h++)
		{
			categoriesList.addString(rowHeadings.get(h));
		}
		var numberOfSubSeries = columnAxis.getPrettyNamesForFeeds(true, false, columnSelectors).size();
		var indices = columnAxis.getIndicesByFeedOrder(columnSelectors);
		var contextFeed = oFF.VizDefConstants.V_FEED_COLOR;
		columnSelectors.add(oFF.VizDefConstants.K_COLOR);
		var pureColors = columnAxis.getPrettyNamesForFeed(true, false, oFF.VizDefConstants.K_COLOR);
		var overwriteColors = pureColors.size() < 2;
		if (columnAxis.hasTupleForFeed(oFF.VizDefConstants.V_FEED_DATA_CONTEXT) && columnAxis.getPrettyNamesForFeed(true, false, oFF.VizDefConstants.V_FEED_DATA_CONTEXT).size() > 1)
		{
			contextFeed = oFF.VizDefConstants.V_FEED_DATA_CONTEXT;
			numberOfSubSeries = columnAxis.getPrettyNamesForFeeds(true, false, columnSelectors).size();
		}
		var alreadyHandledIndices = oFF.XList.create();
		var ix = -1;
		for (var ij = 0; ij < indices.size(); ij++)
		{
			var curInt = indices.get(ij);
			if (alreadyHandledIndices.contains(curInt))
			{
				continue;
			}
			ix = ix + 1;
			var i = curInt.getInteger();
			var columnTuple = columnAxis.getTupleAt(i);
			var currentContextMembers = columnTuple.getMemberKeysForFeedsOtherThan(contextFeed);
			var aggregatableIndices = columnAxis.getTupleIndexForMemberNames(currentContextMembers);
			alreadyHandledIndices.addAll(aggregatableIndices);
			this.setShowLegend(numberOfSubSeries > 1);
			var compositeMeasureName = columnTuple.getPrettyText(columnSelectors);
			var dataLayer = seriesList.addNewStructure();
			var boxplotData = dataLayer.putNewList(oFF.VizDefConstants.K_DATA);
			var dolt = dataLayer.putNewStructure(oFF.VizDefConstants.K_TOOLTIP);
			dolt.putString(oFF.VizDefConstants.K_POINT_FORMAT, buff.toString());
			dolt.putString(oFF.VizDefConstants.K_HEADER_FORMAT, "");
			dataLayer.putBoolean(oFF.VizDefConstants.K_SHOW_IN_LEGEND, true);
			dataLayer.putString(oFF.VizDefConstants.K_TYPE, oFF.VizDefConstants.V_CHART_TYPE_BOXPLOT);
			dataLayer.putString(oFF.VizDefConstants.K_NAME, compositeMeasureName);
			var dataLayerOutlier = seriesList.addNewStructure();
			dataLayerOutlier.putString(oFF.VizDefConstants.K_TYPE, oFF.VizDefConstants.K_SCATTER);
			dataLayerOutlier.putString(oFF.VizDefConstants.K_NAME, compositeMeasureName);
			dataLayerOutlier.putString("linkedTo", ":previous");
			var dataLayerOutlierMarkers = dataLayerOutlier.putNewStructure(oFF.VizDefConstants.K_MARKER);
			dataLayerOutlierMarkers.putString(oFF.VizDefConstants.K_FILL_COLOR, oFF.VizDefConstants.K_TRANSPARENT);
			dataLayerOutlierMarkers.putInteger(oFF.VizDefConstants.K_LINE_WIDTH, 1);
			var outlier = dataLayerOutlier.putNewList(oFF.VizDefConstants.K_DATA);
			var dott = dataLayerOutlier.putNewStructure(oFF.VizDefConstants.K_TOOLTIP);
			dott.putString(oFF.VizDefConstants.K_POINT_FORMAT, oFF.XStringUtils.concatenate3("<b>{series.name}</b><br/><b>Outliers</b><br/><br/> {point.categoryName}: {point.y:,.", decimalPlaceString, "f}"));
			dott.putString(oFF.VizDefConstants.K_HEADER_FORMAT, "");
			if (overwriteColors)
			{
				this.addColorAndPattern(columnTuple.getColor(), columnTuple.getPattern(), dataLayer, oFF.VizDefConstants.V_CHART_TYPE_BOXPLOT, false);
				this.addColorAndPattern(columnTuple.getColor(), columnTuple.getPattern(), dataLayerOutlier, oFF.VizDefConstants.K_SCATTER, true);
				dataLayerOutlierMarkers.putString(oFF.VizDefConstants.K_LINE_COLOR, this.getCurrentColor());
			}
			else
			{
				dataLayerOutlierMarkers.putString(oFF.VizDefConstants.K_LINE_COLOR, this.getColorAt(0));
			}
			for (var j = 0; j < rowAxis.getTuplesCount(); j++)
			{
				if (!rowAxis.getTupleAt(j).isSelectedByString(oFF.VizDefConstants.K_CATEGORY_AXIS))
				{
					continue;
				}
				if (rowAxis.getTupleAt(j).isTotal())
				{
					continue;
				}
				var listOfDoubles = oFF.XList.create();
				for (var kj = 0; kj < aggregatableIndices.size(); kj++)
				{
					var k = aggregatableIndices.get(kj).getInteger();
					var currentTuple = columnAxis.getTupleAt(i);
					if (!currentTuple.isSelectedByString(oFF.VizDefConstants.K_VALUE_AXIS))
					{
						continue;
					}
					var dataCell = rs.getDataCell(k, j);
					var doubleValue = 0;
					var valueType = dataCell.getValueType();
					if (valueType === oFF.XValueType.DOUBLE || valueType === oFF.XValueType.DECIMAL_FLOAT)
					{
						if (dataCell.getXValue() !== null)
						{
							doubleValue = columnAxis.getScaledValue(oFF.VizDefConstants.K_VALUE_AXIS, currentTuple, dataCell);
							listOfDoubles.add(oFF.XDoubleValue.create(doubleValue));
						}
					}
				}
				if (listOfDoubles.size() === 0)
				{
					continue;
				}
				listOfDoubles.sortByComparator(oFF.XComparatorDouble.create());
				var boxPlotDataStructure = boxplotData.addNewStructure();
				var firstQuarter = 0;
				var thirdQuarter = 0;
				var intervalQuartile = 0;
				var median = 0;
				var element = 0;
				var min = 0;
				var max = 0;
				var divNumber = listOfDoubles.size() - 1;
				var quarter1Index = divNumber / 4;
				var quarter2Index = divNumber / 2;
				var quarter3Index = divNumber * 3 / 4;
				firstQuarter = listOfDoubles.get(oFF.XDouble.convertToInt(quarter1Index)).getDouble();
				median = listOfDoubles.get(oFF.XDouble.convertToInt(quarter2Index)).getDouble();
				thirdQuarter = listOfDoubles.get(oFF.XDouble.convertToInt(quarter3Index)).getDouble();
				intervalQuartile = (thirdQuarter - firstQuarter) * 1.5;
				max = listOfDoubles.get(0).getDouble();
				min = listOfDoubles.get(listOfDoubles.size() - 1).getDouble();
				for (var ld = 0; ld < listOfDoubles.size(); ld++)
				{
					element = listOfDoubles.get(ld).getDouble();
					if (thirdQuarter + intervalQuartile < element || firstQuarter - intervalQuartile > element)
					{
						var outlierStruct = outlier.addNewStructure();
						outlierStruct.putDouble(oFF.VizDefConstants.K_X, j - 0.25 + (0.5 + ix) / numberOfSubSeries / 2);
						outlierStruct.putDouble(oFF.VizDefConstants.K_Y, element);
						outlierStruct.putString(oFF.VizDefConstants.K_CATEGORY_NAME, rowHeadings.get(j));
						if (overwriteColors)
						{
							this.addColorAndPattern(columnTuple.getColor(), columnTuple.getPattern(), outlierStruct, oFF.VizDefConstants.K_SCATTER, true);
						}
					}
					else
					{
						if (element < min)
						{
							min = element;
						}
						if (element > max)
						{
							max = element;
						}
					}
				}
				boxPlotDataStructure.putDouble("low", min);
				boxPlotDataStructure.putDouble("q1", firstQuarter);
				boxPlotDataStructure.putDouble("median", median);
				boxPlotDataStructure.putDouble("q3", thirdQuarter);
				boxPlotDataStructure.putDouble("high", max);
				if (overwriteColors)
				{
					this.addColorAndPattern(columnTuple.getColor(), columnTuple.getPattern(), boxPlotDataStructure, oFF.VizDefConstants.K_SCATTER, true);
				}
			}
		}
	}
	else
	{
		theChartData.putBoolean(oFF.VizDefConstants.K_FULL_SCREEN_ENABLED, false);
		chartlang.putString(oFF.VizDefConstants.K_NO_DATA, "Firefly Resultset is Empty.");
	}
};
oFF.RsHiChartBoxplotHelper.prototype.finishRendering = function() {};

oFF.RsHiChartCategorialSeriesHelper = function() {};
oFF.RsHiChartCategorialSeriesHelper.prototype = new oFF.RsHiChartSeriesHelper();
oFF.RsHiChartCategorialSeriesHelper.prototype._ff_c = "RsHiChartCategorialSeriesHelper";

oFF.RsHiChartCategorialSeriesHelper.prototype.prepareRendering = function() {};
oFF.RsHiChartCategorialSeriesHelper.prototype.readResultSetData = function(columnAxis, rowAxis, rs)
{
	var theChartData = this.getChartData();
	var dataList;
	var dataLayer;
	var errorLayer;
	var errorList;
	var compositemeasureName = null;
	var hasVariance = false;
	var hideTotalOnRows = true;
	var xAxis = theChartData.putNewList(oFF.VizDefConstants.K_X_AXIS);
	var xAxisStruct = xAxis.addNewStructure();
	var chartlang = theChartData.putNewStructure(oFF.VizDefConstants.K_LANG);
	var seriesList = theChartData.putNewList(oFF.VizDefConstants.K_SERIES);
	var customColor = theChartData.getStructureByKey(oFF.VizDefConstants.K_EXPLICIT_COLOR_ASSIGNMENTS);
	if (oFF.notNull(customColor))
	{
		theChartData.getListByKey(oFF.VizDefConstants.K_COLORS).clear();
	}
	var tooltipBuffer = oFF.XStringBuffer.create();
	tooltipBuffer.append("<b>{series.name}</b> / ");
	tooltipBuffer.append("{point.category}<br/><b>{point.name}</b>  {point.yFormatted}<br/>");
	if (rs.getAvailableDataCellCount() > 0)
	{
		var explicitCategories = true;
		var rowCategories = rowAxis.getFormattedNamesForFeed(true, !hideTotalOnRows, oFF.VizDefConstants.K_CATEGORY_AXIS);
		if (rowCategories.size() === 0)
		{
			rowCategories = rowAxis.getFormattedNames(true, !hideTotalOnRows);
			explicitCategories = false;
		}
		var columnSelectors = oFF.XListOfString.create();
		columnSelectors.add(oFF.VizDefConstants.K_VALUE_AXIS);
		columnSelectors.add(oFF.VizDefConstants.K_VALUE_AXIS2);
		columnSelectors.add(oFF.VizDefConstants.K_VARIANCE);
		var rowSelector = oFF.XListOfString.create();
		rowSelector.add(oFF.VizDefConstants.K_CATEGORY_AXIS);
		var pureColors = columnAxis.getPrettyNamesForFeed(true, !hideTotalOnRows, oFF.VizDefConstants.K_COLOR);
		var pureMeasures = columnAxis.getPrettyNamesForFeeds(true, !hideTotalOnRows, columnSelectors);
		var overwriteColors = pureColors.size() < 2;
		var rowCategoryCount = rowCategories.size();
		var chartTitle;
		if (rowCategoryCount > 0)
		{
			chartTitle = oFF.XStringUtils.concatenate3(oFF.XCollectionUtils.join(pureMeasures, ", "), " Per ", oFF.XCollectionUtils.join(rowAxis.getDimensionsForFeed(oFF.VizDefConstants.K_CATEGORY_AXIS), ", "));
			var categoriesList = xAxisStruct.putNewList(oFF.VizDefConstants.K_CATEGORIES);
			for (var k = 0; k < rowCategories.size(); k++)
			{
				categoriesList.addString(rowCategories.get(k));
			}
		}
		else
		{
			xAxisStruct.putString(oFF.VizDefConstants.K_TYPE, oFF.VizDefConstants.K_CATEGORY);
			chartTitle = oFF.XCollectionUtils.join(pureMeasures, ", ");
		}
		var title = theChartData.getStructureByKey(oFF.VizDefConstants.K_TITLE);
		if (oFF.isNull(title))
		{
			title = theChartData.putNewStructure(oFF.VizDefConstants.K_TITLE);
			title.putString(oFF.VizDefConstants.K_TEXT, chartTitle);
		}
		else
		{
			var titletext = title.getStringByKey(oFF.VizDefConstants.K_TEXT);
			if (oFF.isNull(titletext))
			{
				title.putString(oFF.VizDefConstants.K_TEXT, chartTitle);
			}
		}
		var selectorList = oFF.XListOfString.create();
		if (pureColors.size() > 1)
		{
			selectorList.add(oFF.VizDefConstants.K_COLOR);
		}
		if (pureMeasures.size() > 1)
		{
			selectorList.addAll(columnSelectors);
		}
		var tooltipHeaders = columnAxis.getPrettyNamesForFeed(true, false, oFF.VizDefConstants.K_TOOLTIP_VALUE_AXIS);
		for (var ti = 0; ti < tooltipHeaders.size(); ti++)
		{
			tooltipBuffer.append("<b>{point.tHeader");
			tooltipBuffer.append(oFF.XInteger.convertToString(ti));
			tooltipBuffer.append("}</b>  {point.tFormatted");
			tooltipBuffer.append(oFF.XInteger.convertToString(ti));
			tooltipBuffer.append("}<br/>");
		}
		tooltipBuffer.append("{point.errorRange}");
		var indices = columnAxis.getIndicesByFeedOrder(columnSelectors);
		this.setShowLegend(indices.size() > 1);
		for (var ij = 0; ij < indices.size(); ij++)
		{
			var i = indices.get(ij).getInteger();
			var columnTuple = columnAxis.getTupleAt(i);
			if (!columnTuple.isSelectedByList(columnSelectors))
			{
				continue;
			}
			dataLayer = seriesList.addNewStructure();
			var variance = columnTuple.isSelectedByString(oFF.VizDefConstants.K_VARIANCE);
			var valueAxis2 = !variance && columnTuple.isSelectedByString(oFF.VizDefConstants.K_VALUE_AXIS2);
			var axisIndex = valueAxis2 ? 1 : variance ? this.isCombinationChart() ? 2 : 1 : 0;
			compositemeasureName = variance ? "\u0394" : columnTuple.getPrettyText(selectorList);
			dataLayer.putString(oFF.VizDefConstants.K_NAME, compositemeasureName);
			var simpleMeasureName = variance ? "" : columnTuple.getPrettyText(columnSelectors);
			var seriesChartType = valueAxis2 ? this.getSecondChart() : this.getChartType();
			dataLayer.putString(oFF.VizDefConstants.K_TYPE, seriesChartType);
			dataLayer.putInteger(oFF.VizDefConstants.K_Y_AXIS, axisIndex);
			var currentFeedType = variance ? oFF.VizDefConstants.K_VARIANCE : valueAxis2 ? oFF.VizDefConstants.K_VALUE_AXIS2 : oFF.VizDefConstants.K_VALUE_AXIS;
			dataLayer.putString(oFF.VizDefConstants.K_AXIS, currentFeedType);
			hasVariance = hasVariance || variance;
			dataList = dataLayer.putNewList(oFF.VizDefConstants.K_DATA);
			var memberNames = columnTuple.getMemberKeys();
			errorList = null;
			var errorIndex1 = i;
			var errorIndex2 = i;
			var hasErrorBar = false;
			var tooltipIndices = null;
			var tooltipValues = null;
			if (oFF.XCollectionUtils.hasElements(memberNames))
			{
				tooltipIndices = columnAxis.getMatchingTupleIndicesForMemberNameAndFeed(memberNames, oFF.VizDefConstants.K_TOOLTIP_VALUE_AXIS);
				var errorIndex = columnAxis.getMatchingTupleIndicesForMemberNamesAndSuffix(memberNames, oFF.VizDefConstants.K_ERRORBAR_MIN);
				if (errorIndex !== -1)
				{
					errorIndex1 = errorIndex;
					hasErrorBar = true;
				}
				errorIndex = columnAxis.getMatchingTupleIndicesForMemberNamesAndSuffix(memberNames, oFF.VizDefConstants.K_ERRORBAR_MAX);
				if (errorIndex !== -1)
				{
					errorIndex2 = errorIndex;
					hasErrorBar = true;
				}
				if (hasErrorBar)
				{
					errorLayer = seriesList.addNewStructure();
					errorList = errorLayer.putNewList(oFF.VizDefConstants.K_DATA);
					errorLayer.putInteger(oFF.VizDefConstants.K_Y_AXIS, axisIndex);
					errorLayer.putString(oFF.VizDefConstants.K_TYPE, oFF.VizDefConstants.K_ERRORBAR);
					errorLayer.putStringNotNullAndNotEmpty(oFF.VizDefConstants.K_COLOR, columnAxis.getTupleAt(oFF.XMath.max(errorIndex1, errorIndex2)).getColor());
				}
			}
			var dataCell;
			var error1 = 0;
			var error2 = 0;
			var error1Formatted = "";
			var error2Formatted = "";
			if (overwriteColors)
			{
				this.addColorAndPattern(columnTuple.getColor(), columnTuple.getPattern(), dataLayer, seriesChartType, false);
			}
			if (rowCategoryCount > 0)
			{
				for (var j = 0; j < rowAxis.getTuplesCount(); j++)
				{
					if (explicitCategories && !rowAxis.getTupleAt(j).isSelectedByString(oFF.VizDefConstants.K_CATEGORY_AXIS))
					{
						continue;
					}
					if (!hideTotalOnRows || !rowAxis.getTupleAt(j).isTotal())
					{
						if (hasErrorBar)
						{
							error1 = columnAxis.getScaledValue(currentFeedType, columnAxis.getTupleAt(errorIndex1), rs.getDataCell(errorIndex1, j));
							error1Formatted = columnAxis.getFormattedValue(currentFeedType, columnAxis.getTupleAt(errorIndex1), rs.getDataCell(errorIndex1, j));
							error2 = columnAxis.getScaledValue(currentFeedType, columnAxis.getTupleAt(errorIndex2), rs.getDataCell(errorIndex2, j));
							error2Formatted = columnAxis.getFormattedValue(currentFeedType, columnAxis.getTupleAt(errorIndex2), rs.getDataCell(errorIndex2, j));
						}
						if (oFF.XCollectionUtils.hasElements(tooltipIndices))
						{
							tooltipValues = oFF.XListOfString.create();
							for (var ttindex = 0; ttindex < tooltipIndices.size(); ttindex++)
							{
								var tooltipIndex = tooltipIndices.get(ttindex).getInteger();
								tooltipValues.add(columnAxis.getFormattedValue("", columnAxis.getTupleAt(tooltipIndex), rs.getDataCell(tooltipIndex, j)));
							}
						}
						dataCell = rs.getDataCell(i, j);
						this.addValue(currentFeedType, dataList, dataCell, columnAxis, columnTuple, simpleMeasureName, errorList, error1, error2, rowAxis.getTupleAt(j).getPrettyText(rowSelector), tooltipHeaders, tooltipValues, error1Formatted, error2Formatted, overwriteColors, seriesChartType);
					}
				}
			}
			else if (rs.getDataRows() > 0)
			{
				for (var jj = 0; jj < rs.getDataRows(); jj++)
				{
					if (hasErrorBar)
					{
						error1 = columnAxis.getScaledValue(currentFeedType, columnAxis.getTupleAt(errorIndex1), rs.getDataCell(errorIndex1, jj));
						error1Formatted = columnAxis.getFormattedValue(currentFeedType, columnAxis.getTupleAt(errorIndex1), rs.getDataCell(errorIndex1, jj));
						error2 = columnAxis.getScaledValue(currentFeedType, columnAxis.getTupleAt(errorIndex2), rs.getDataCell(errorIndex2, jj));
						error2Formatted = columnAxis.getFormattedValue(currentFeedType, columnAxis.getTupleAt(errorIndex2), rs.getDataCell(errorIndex2, jj));
					}
					if (oFF.XCollectionUtils.hasElements(tooltipIndices))
					{
						tooltipValues = oFF.XListOfString.create();
						for (var tt1index = 0; tt1index < tooltipIndices.size(); tt1index++)
						{
							var tooltipIndex1 = tooltipIndices.get(tt1index).getInteger();
							tooltipValues.add(columnAxis.getFormattedValue("", columnAxis.getTupleAt(tooltipIndex1), rs.getDataCell(tooltipIndex1, jj)));
						}
					}
					dataCell = rs.getDataCell(i, jj);
					this.addValue(currentFeedType, dataList, dataCell, columnAxis, columnTuple, simpleMeasureName, errorList, error1, error2, null, tooltipHeaders, tooltipValues, error1Formatted, error2Formatted, overwriteColors, seriesChartType);
				}
			}
		}
		if (rowCategoryCount < 2)
		{
			if (pureColors.size() < 2)
			{
				this.setChartWidth(rowCategories.size());
			}
			else
			{
				this.setChartWidth(pureColors.size());
			}
		}
		else
		{
			this.setChartWidth(rowCategoryCount);
		}
		this.setWidthScale(1);
		if (oFF.XStringUtils.isNullOrEmpty(this.getStackingType()) || !oFF.XString.isEqual(this.getChartType(), oFF.VizDefConstants.V_CHART_TYPE_BAR) && !oFF.XString.isEqual(this.getChartType(), oFF.VizDefConstants.V_CHART_TYPE_COLUMN))
		{
			var divisor = this.isCombinationChart() ? 2 : 1;
			if (rowCategoryCount > 1)
			{
				this.setWidthScale(indices.size() / divisor);
			}
			else if (pureColors.size() > 1)
			{
				this.setWidthScale(oFF.XMath.max(1, pureMeasures.size() / divisor));
			}
		}
		if (seriesList.size() === 0)
		{
			chartlang.putString(oFF.VizDefConstants.K_NO_DATA, "At least one measure is required to build a chart.");
		}
	}
	var tooltip = theChartData.putNewStructure(oFF.VizDefConstants.K_TOOLTIP);
	tooltip.putString(oFF.VizDefConstants.K_POINT_FORMAT, tooltipBuffer.toString());
	tooltip.putString(oFF.VizDefConstants.K_HEADER_FORMAT, "");
	this.setHasVariance(hasVariance);
};
oFF.RsHiChartCategorialSeriesHelper.prototype.finishRendering = function() {};
oFF.RsHiChartCategorialSeriesHelper.prototype.addValue = function(currentFeedType, dataList, dataCell, axis, tuple, measureName, errorList, error1, error2, categoryName, tooltipHeaders, tooltipValues, error1Formatted, error2Formatted, enforceColor, seriesChartType)
{
	var doubleValue = 0;
	var valueType = dataCell.getValueType();
	var intermediateStructure = dataList.addNewStructure();
	if (valueType === oFF.XValueType.DOUBLE || valueType === oFF.XValueType.DECIMAL_FLOAT)
	{
		if (dataCell.getXValue() !== null)
		{
			doubleValue = axis.getScaledValue(currentFeedType, tuple, dataCell);
			intermediateStructure.putDouble(oFF.VizDefConstants.K_Y, doubleValue);
			intermediateStructure.putString(oFF.VizDefConstants.K_Y_FORMATTED, axis.getFormattedValue(currentFeedType, tuple, dataCell));
		}
		else
		{
			intermediateStructure.putString(oFF.VizDefConstants.K_Y, null);
			intermediateStructure.putString(oFF.VizDefConstants.K_Y_FORMATTED, null);
		}
		if (enforceColor)
		{
			this.addColorAndPattern(tuple.getColor(), tuple.getPattern(), intermediateStructure, seriesChartType, true);
		}
		intermediateStructure.putString(oFF.VizDefConstants.K_NAME, measureName);
		if (oFF.notNull(categoryName))
		{
			intermediateStructure.putString(oFF.VizDefConstants.K_CATEGORY, categoryName);
		}
	}
	if (oFF.notNull(errorList))
	{
		var subList = errorList.addNewList();
		subList.addDouble(error1);
		subList.addDouble(error2);
		if (error1 < error2)
		{
			intermediateStructure.putString(oFF.VizDefConstants.K_ERROR_RANGE, oFF.XStringUtils.concatenate3(oFF.XDouble.convertToString(error1), " .. ", error2Formatted));
		}
		else
		{
			intermediateStructure.putString(oFF.VizDefConstants.K_ERROR_RANGE, oFF.XStringUtils.concatenate3(oFF.XDouble.convertToString(error2), " .. ", error1Formatted));
		}
	}
	if (oFF.XCollectionUtils.hasElements(tooltipHeaders))
	{
		for (var j = 0; j < tooltipHeaders.size(); j++)
		{
			intermediateStructure.putString(oFF.XStringUtils.concatenate2(oFF.VizDefConstants.K_T_HEADER, oFF.XInteger.convertToString(j)), tooltipHeaders.get(j));
		}
	}
	if (oFF.XCollectionUtils.hasElements(tooltipValues))
	{
		for (var i = 0; i < tooltipValues.size(); i++)
		{
			intermediateStructure.putString(oFF.XStringUtils.concatenate2(oFF.VizDefConstants.K_T_FORMATTED, oFF.XInteger.convertToString(i)), tooltipValues.get(i));
		}
	}
};

oFF.RsHiChartClusterBubbleHelper = function() {};
oFF.RsHiChartClusterBubbleHelper.prototype = new oFF.RsHiChartCovariationHelper();
oFF.RsHiChartClusterBubbleHelper.prototype._ff_c = "RsHiChartClusterBubbleHelper";

oFF.RsHiChartClusterBubbleHelper.prototype.getXFeed = function()
{
	return oFF.VizDefConstants.K_VALUE_AXIS;
};
oFF.RsHiChartClusterBubbleHelper.prototype.getYFeed = function()
{
	return oFF.VizDefConstants.K_VALUE_AXIS2;
};
oFF.RsHiChartClusterBubbleHelper.prototype.getZFeed = function()
{
	return oFF.VizDefConstants.K_BUBBLE_WIDTH;
};
oFF.RsHiChartClusterBubbleHelper.prototype.decorateToolTip = function(stringBuffer)
{
	stringBuffer.append("<b>{point.name}</b>: {point.valueFormatted} <br/>");
};
oFF.RsHiChartClusterBubbleHelper.prototype.prepareRendering = function() {};
oFF.RsHiChartClusterBubbleHelper.prototype.reiterateResultSet = function(columnAxis, rowAxis, rs)
{
	var theChartData = this.getChartData();
	var yAxisList = theChartData.putNewList(oFF.VizDefConstants.K_Y_AXIS);
	var yAxis = yAxisList.addNewStructure();
	var xAxisList = theChartData.putNewList(oFF.VizDefConstants.K_X_AXIS);
	var xAxisStruct = xAxisList.addNewStructure();
	var vizProp = null;
	if (this.getVizDef() !== null)
	{
		vizProp = this.getVizDef().getStructureByKey(oFF.VizDefConstants.K_CHART).getStructureByKey(oFF.VizDefConstants.K_PROPERTIES);
		if (oFF.notNull(vizProp))
		{
			var vizPropCategoryAxis = vizProp.getStructureByKey(oFF.VizDefConstants.K_CATEGORY_AXIS);
			if (oFF.notNull(vizPropCategoryAxis))
			{
				oFF.RsHiChartUtils.axisPloter(vizPropCategoryAxis, xAxisStruct, this.getChartType(), true);
			}
			var vizPropValueAxis = vizProp.getStructureByKey(oFF.VizDefConstants.K_VALUE_AXIS);
			if (oFF.notNull(vizPropValueAxis))
			{
				yAxis = oFF.RsHiChartUtils.axisPloter(vizPropValueAxis, yAxis, this.getChartType(), false);
			}
		}
	}
	oFF.RsHiChartVizUtilsSimple.legendStyler(theChartData);
	var plotOptions = oFF.PrFactory.createStructure();
	plotOptions = theChartData.getStructureByKey(oFF.VizDefConstants.K_PLOT_OPTIONS);
	var fillColor = oFF.VizDefConstants.K_TRANSPARENT;
	if (theChartData.getListByKey(oFF.VizDefConstants.K_COLORS) !== null)
	{
		if (theChartData.getListByKey(oFF.VizDefConstants.K_COLORS).size() > 0)
		{
			fillColor = theChartData.getListByKey(oFF.VizDefConstants.K_COLORS).getStringAt(0);
		}
	}
	if (oFF.isNull(plotOptions))
	{
		plotOptions = theChartData.putNewStructure(oFF.VizDefConstants.K_PLOT_OPTIONS);
	}
	if (!oFF.XString.isEqual(this.getStackingType(), null))
	{
		oFF.RsHiChartVizUtilsSimple.dataLabelAlignment(yAxis, this.getChartType(), columnAxis.getDecimalPlaces(this.getXFeed()), false);
	}
	oFF.RsHiChartVizUtilsSimple.plotOptionChart(yAxis, this.getChartType(), this.getStackingType(), plotOptions, 0, fillColor);
	oFF.RsHiChartVizUtilsSimple.dataLabelAlignment(yAxis, this.getChartType(), columnAxis.getDecimalPlaces(this.getXFeed()), false);
};
oFF.RsHiChartClusterBubbleHelper.prototype.finishRendering = function()
{
	var theChartData = this.getChartData();
	var seriesList = theChartData.putNewList(oFF.VizDefConstants.K_SERIES);
	var intermediateList = oFF.PrFactory.createList();
	intermediateList.addAll(this.getXList());
	intermediateList.addAll(this.getYList());
	intermediateList.addAll(this.getZList());
	var intermediateListFormatted = oFF.PrFactory.createList();
	intermediateListFormatted.addAll(this.getXListFormatted());
	intermediateListFormatted.addAll(this.getYListFormatted());
	intermediateListFormatted.addAll(this.getZListFormatted());
	var measureList = oFF.XListOfString.create();
	measureList.addAll(this.getXMeasures());
	measureList.addAll(this.getYMeasures());
	measureList.addAll(this.getZMeasures());
	for (var g = 0; g < intermediateList.size(); g++)
	{
		var polarLayer = seriesList.addNewStructure();
		var newList = polarLayer.putNewList(oFF.VizDefConstants.K_DATA);
		polarLayer.putString(oFF.VizDefConstants.K_NAME, this.getColorList().get(g));
		var subList = intermediateList.getListAt(g);
		var subListFormatted = intermediateListFormatted.getListAt(g);
		for (var e = 0; e < subList.size(); e++)
		{
			var subStructure = newList.addNewStructure();
			subStructure.putDouble(oFF.VizDefConstants.K_VALUE, subList.getDoubleAt(e));
			subStructure.putString(oFF.VizDefConstants.K_VALUE_FORMATTED, subListFormatted.getStringAt(e));
			if (oFF.XCollectionUtils.hasElements(measureList))
			{
				subStructure.putString(oFF.VizDefConstants.K_NAME, measureList.get(0));
			}
			else
			{
				subStructure.putString(oFF.VizDefConstants.K_NAME, "");
			}
			this.addToolTipsToSeries(subStructure, g, e);
		}
	}
};

oFF.RsHiChartCorrelationHelper = function() {};
oFF.RsHiChartCorrelationHelper.prototype = new oFF.RsHiChartCovariationHelper();
oFF.RsHiChartCorrelationHelper.prototype._ff_c = "RsHiChartCorrelationHelper";

oFF.RsHiChartCorrelationHelper.prototype.getXFeed = function()
{
	return oFF.VizDefConstants.K_VALUE_AXIS;
};
oFF.RsHiChartCorrelationHelper.prototype.getYFeed = function()
{
	return oFF.VizDefConstants.K_VALUE_AXIS2;
};
oFF.RsHiChartCorrelationHelper.prototype.getZFeed = function()
{
	return oFF.VizDefConstants.K_BUBBLE_WIDTH;
};
oFF.RsHiChartCorrelationHelper.prototype.decorateToolTip = function(stringBuffer)
{
	stringBuffer.append("<b>{point.name}</b> <br/>");
	stringBuffer.append("<b>{point.SeriesX}</b>: {point.xFormatted} <br/>");
	stringBuffer.append("<b>{point.SeriesY}</b>: {point.yFormatted} <br/>");
	if (oFF.XCollectionUtils.hasElements(this.getZMeasures()))
	{
		stringBuffer.append("<b>{point.SeriesZ}</b>: {point.zFormatted} <br/>");
	}
};
oFF.RsHiChartCorrelationHelper.prototype.reiterateResultSet = function(columnAxis, rowAxis, rs)
{
	var theChartData = this.getChartData();
	var vizDef = this.getVizDef();
	var bubbleColor = "#FFAA49";
	var dashStyle = "Dash";
	var yAxis = theChartData.putNewList(oFF.VizDefConstants.K_Y_AXIS);
	var xAxis = theChartData.putNewList(oFF.VizDefConstants.K_X_AXIS);
	var xAxisStruct = xAxis.addNewStructure();
	var yAxisStruct = yAxis.addNewStructure();
	if (oFF.notNull(vizDef))
	{
		oFF.RsHiChartVizUtilsSimple.addReferenceLine(vizDef, xAxisStruct, yAxisStruct, columnAxis, rowAxis, rs);
		if (vizDef.containsKey(oFF.VizDefConstants.K_BUBBLE_STYLING))
		{
			var BubbleStyle = vizDef.getStructureByKey(oFF.VizDefConstants.K_BUBBLE_STYLING);
			if (oFF.notNull(BubbleStyle))
			{
				dashStyle = BubbleStyle.getStringByKey(oFF.VizDefConstants.K_PATTERN);
				bubbleColor = BubbleStyle.getStringByKey(oFF.VizDefConstants.K_COLOR);
			}
		}
	}
	var chartTypeInfo = theChartData.getStructureByKey(oFF.VizDefConstants.K_CHART);
	chartTypeInfo.putString(oFF.VizDefConstants.K_TYPE, this.getChartType());
	var chartTypeInfostyle = chartTypeInfo.putNewStructure(oFF.VizDefConstants.K_STYLE);
	chartTypeInfostyle.putString(oFF.VizDefConstants.K_FONT_FAMILY, "LatoWeb, 'Open Sans', 'Helvetica Neue', Helvetica, Arial, 'sans serif'");
	chartTypeInfostyle.putString(oFF.VizDefConstants.K_FONT_SIZE, "13px");
	chartTypeInfo.putInteger(oFF.VizDefConstants.K_MARGIN_TOP, 100);
	var valueAxisProperties = null;
	if (oFF.notNull(vizDef))
	{
		valueAxisProperties = vizDef.getStructureByKey(oFF.VizDefConstants.K_CHART).getStructureByKey(oFF.VizDefConstants.K_PROPERTIES).getStructureByKey(oFF.VizDefConstants.K_VALUE_AXIS);
	}
	oFF.RsHiChartVizUtilsCorrelation.renderValueAxis(xAxisStruct, valueAxisProperties, false);
	if (oFF.notNull(vizDef))
	{
		valueAxisProperties = vizDef.getStructureByKey(oFF.VizDefConstants.K_CHART).getStructureByKey(oFF.VizDefConstants.K_PROPERTIES).getStructureByKey(oFF.VizDefConstants.K_VALUE_AXIS2);
	}
	oFF.RsHiChartVizUtilsCorrelation.renderValueAxis(yAxisStruct, valueAxisProperties, true);
	var legend = theChartData.getStructureByKey(oFF.VizDefConstants.K_LEGEND);
	legend.putBoolean(oFF.VizDefConstants.K_SQUARE_SYMBOL, true);
	legend.putString(oFF.VizDefConstants.K_LAYOUT, oFF.VizDefConstants.V_VERTICAL);
	legend.putInteger(oFF.VizDefConstants.K_MAX_HEIGHT, 50);
	legend.putInteger(oFF.VizDefConstants.K_Y, 20);
	legend.putString(oFF.VizDefConstants.K_ALIGN, oFF.VizDefConstants.V_CENTER);
	legend.putString(oFF.VizDefConstants.K_VERTICAL_ALIGN, oFF.VizDefConstants.V_POSITION_TOP);
	var legenditemStyle = legend.putNewStructure(oFF.VizDefConstants.K_ITEM_STYLE);
	legenditemStyle.putString(oFF.VizDefConstants.K_FONT_SIZE, "12px");
	legenditemStyle.putString(oFF.VizDefConstants.K_FONT_WEIGHT, oFF.VizDefConstants.V_NORMAL);
	var plotOptions = theChartData.putNewStructure(oFF.VizDefConstants.K_PLOT_OPTIONS);
	var plotOptionChartTypeStructure = plotOptions.putNewStructure(this.getChartType());
	var plotOptionChartMarkerStructure = plotOptionChartTypeStructure.putNewStructure(oFF.VizDefConstants.K_MARKER);
	plotOptionChartMarkerStructure.putString(oFF.VizDefConstants.K_SYMBOL, oFF.VizDefConstants.V_CIRCLE);
	var shapeOptions = theChartData.putNewStructure(oFF.VizDefConstants.K_SHAPE_OPTIONS);
	if (this.getXList().size() > 1)
	{
		oFF.RsHiChartVizUtilsCorrelation.legendStyler(theChartData);
	}
	else
	{
		plotOptionChartTypeStructure.putString(oFF.VizDefConstants.K_DASH_STYLE, dashStyle);
		plotOptionChartTypeStructure.putString(oFF.VizDefConstants.K_COLOR, bubbleColor);
		plotOptionChartTypeStructure.putString(oFF.VizDefConstants.K_STROKE, bubbleColor);
		plotOptionChartTypeStructure.putString(oFF.VizDefConstants.K_FILL, bubbleColor);
		shapeOptions.putString(oFF.VizDefConstants.K_FILL, bubbleColor);
	}
	var dataLabels = plotOptionChartTypeStructure.putNewStructure(oFF.VizDefConstants.K_DATA_LABELS);
	dataLabels.putBoolean(oFF.VizDefConstants.K_ENABLED, false);
	this.addPadding(this.getXList(), xAxisStruct);
	this.addPadding(this.getYList(), yAxisStruct);
};
oFF.RsHiChartCorrelationHelper.prototype.addPadding = function(valueList, axisStruct)
{
	var valueSet = false;
	var min = 0;
	var max = 0;
	var index;
	var subIndex;
	var curValue;
	var curList;
	for (index = 0; index < valueList.size(); index++)
	{
		curList = valueList.getListAt(index);
		for (subIndex = 0; subIndex < curList.size(); subIndex++)
		{
			curValue = curList.getDoubleAt(subIndex);
			if (!valueSet || curValue > max)
			{
				max = curValue;
			}
			if (!valueSet || curValue < min)
			{
				min = curValue;
			}
			valueSet = true;
		}
	}
	var paddingMargin = (max - min) / 10;
	if (max + paddingMargin < 0)
	{
		axisStruct.putDouble(oFF.VizDefConstants.K_MAX, 0);
	}
	else
	{
		axisStruct.putDouble(oFF.VizDefConstants.K_MAX_PADDING, 0.05);
	}
	if (min - paddingMargin > 0)
	{
		axisStruct.putDouble(oFF.VizDefConstants.K_MIN, 0);
	}
	else
	{
		axisStruct.putDouble(oFF.VizDefConstants.K_MIN_PADDING, 0.05);
	}
};
oFF.RsHiChartCorrelationHelper.prototype.prepareRendering = function() {};
oFF.RsHiChartCorrelationHelper.prototype.finishRendering = function()
{
	var theChartData = this.getChartData();
	var seriesList = theChartData.putNewList(oFF.VizDefConstants.K_SERIES);
	var xList = this.getXList();
	var yList = this.getYList();
	var zList = this.getZList();
	var xListFormatted = this.getXListFormatted();
	var yListFormatted = this.getYListFormatted();
	var zListFormatted = this.getZListFormatted();
	var xtitle = oFF.XCollectionUtils.hasElements(this.getXMeasures()) ? this.getXMeasures().get(0) : "";
	var ytitle = oFF.XCollectionUtils.hasElements(this.getYMeasures()) ? this.getYMeasures().get(0) : "";
	var ztitle = oFF.XCollectionUtils.hasElements(this.getZMeasures()) ? this.getZMeasures().get(0) : "";
	if (oFF.XStringUtils.isNotNullAndNotEmpty(xtitle) || oFF.XStringUtils.isNotNullAndNotEmpty(ytitle))
	{
		var xAxistitle = this.getChartData().getListByKey(oFF.VizDefConstants.K_X_AXIS).getStructureAt(0).getStructureByKey(oFF.VizDefConstants.K_TITLE);
		xAxistitle.putString(oFF.VizDefConstants.K_TEXT, xtitle);
		var yAxistitle = this.getChartData().getListByKey(oFF.VizDefConstants.K_Y_AXIS).getStructureAt(0).getStructureByKey(oFF.VizDefConstants.K_TITLE);
		yAxistitle.putString(oFF.VizDefConstants.K_TEXT, ytitle);
	}
	var valueSizeC = 0;
	var valueY = 0;
	var valueX = 0;
	var valueSizeCFormatted = "0";
	var valueYFormatted = "0";
	var valueXFormatted = "0";
	var zListinterim = oFF.PrFactory.createList();
	var zListFormattedinterim = oFF.PrFactory.createList();
	for (var count = 0; count < oFF.XMath.min(xList.size(), yList.size()); count++)
	{
		var newdataStruct = seriesList.addNewStructure();
		var newdatalist = newdataStruct.putNewList(oFF.VizDefConstants.K_DATA);
		newdataStruct.putString(oFF.VizDefConstants.K_TYPE, this.getChartType());
		if (oFF.XCollectionUtils.hasElements(this.getColorList()) && this.getColorList().size() > count)
		{
			newdataStruct.putString(oFF.VizDefConstants.K_NAME, this.getColorList().get(count));
		}
		else
		{
			newdataStruct.putString(oFF.VizDefConstants.K_NAME, "");
		}
		newdataStruct.putBoolean(oFF.VizDefConstants.K_SIZE_BY_ABSOLUTE_VALUE, true);
		var xListinterim = xList.getListAt(count);
		var xListFormattedinterim = xListFormatted.getListAt(count);
		var yListinterim = yList.getListAt(count);
		var yListFormattedinterim = yListFormatted.getListAt(count);
		if (zList.size() > 0)
		{
			zListinterim = zList.getListAt(count);
		}
		if (zListFormatted.size() > 0)
		{
			zListFormattedinterim = zListFormatted.getListAt(count);
		}
		for (var a = 0; a < this.getCategoriesList().size(); a++)
		{
			var nestedlist = oFF.PrFactory.createStructure();
			valueX = xListinterim.getDoubleAt(a);
			valueY = yListinterim.getDoubleAt(a);
			valueXFormatted = xListFormattedinterim.getStringAt(a);
			valueYFormatted = yListFormattedinterim.getStringAt(a);
			var name = this.getCategoriesList().get(a);
			nestedlist.putString(oFF.VizDefConstants.K_NAME, name);
			nestedlist.putDouble(oFF.VizDefConstants.K_X, valueX);
			nestedlist.putDouble(oFF.VizDefConstants.K_Y, valueY);
			nestedlist.putString(oFF.VizDefConstants.K_X_FORMATTED, valueXFormatted);
			nestedlist.putString(oFF.VizDefConstants.K_Y_FORMATTED, valueYFormatted);
			if (oFF.notNull(zListinterim))
			{
				if (zListinterim.size() > a)
				{
					valueSizeC = zListinterim.getDoubleAt(a);
					nestedlist.putDouble(oFF.VizDefConstants.K_Z, valueSizeC);
				}
			}
			if (oFF.notNull(zListFormattedinterim))
			{
				if (zListFormattedinterim.size() > a)
				{
					valueSizeCFormatted = zListFormattedinterim.getStringAt(a);
					nestedlist.putString(oFF.VizDefConstants.K_Z_FORMATTED, valueSizeCFormatted);
				}
			}
			nestedlist.putString(oFF.VizDefConstants.K_SERIES_X, xtitle);
			nestedlist.putString(oFF.VizDefConstants.K_SERIES_Y, ytitle);
			nestedlist.putString(oFF.VizDefConstants.K_SERIES_Z, ztitle);
			if (!(valueSizeC === 0 && valueX === 0 && valueY === 0))
			{
				newdatalist.add(nestedlist);
			}
			this.addToolTipsToSeries(nestedlist, count, a);
		}
	}
};

oFF.RsHiChartMarimekkoHelper = function() {};
oFF.RsHiChartMarimekkoHelper.prototype = new oFF.RsHiChartCovariationHelper();
oFF.RsHiChartMarimekkoHelper.prototype._ff_c = "RsHiChartMarimekkoHelper";

oFF.RsHiChartMarimekkoHelper.prototype.getXFeed = function()
{
	return oFF.VizDefConstants.K_VALUE_AXIS;
};
oFF.RsHiChartMarimekkoHelper.prototype.getYFeed = function()
{
	return oFF.VizDefConstants.K_VALUE_AXIS2;
};
oFF.RsHiChartMarimekkoHelper.prototype.getZFeed = function()
{
	return oFF.VizDefConstants.K_BUBBLE_WIDTH;
};
oFF.RsHiChartMarimekkoHelper.prototype.reiterateResultSet = function(columnAxis, rowAxis, rs)
{
	var theChartData = this.getChartData();
	var yAxisList = theChartData.putNewList(oFF.VizDefConstants.K_Y_AXIS);
	var yAxis = yAxisList.addNewStructure();
	var xAxisList = theChartData.putNewList(oFF.VizDefConstants.K_X_AXIS);
	var xAxisStruct = xAxisList.addNewStructure();
	xAxisStruct.putString(oFF.VizDefConstants.K_TYPE, oFF.VizDefConstants.K_CATEGORY);
	var vizProp = null;
	if (this.getVizDef() !== null)
	{
		vizProp = this.getVizDef().getStructureByKey(oFF.VizDefConstants.K_CHART).getStructureByKey(oFF.VizDefConstants.K_PROPERTIES);
		if (oFF.notNull(vizProp))
		{
			var vizPropCategoryAxis = vizProp.getStructureByKey(oFF.VizDefConstants.K_CATEGORY_AXIS);
			if (oFF.notNull(vizPropCategoryAxis))
			{
				xAxisStruct = oFF.RsHiChartUtils.axisPloter(vizPropCategoryAxis, xAxisStruct, this.getChartType(), true);
			}
			var vizPropValueAxis = vizProp.getStructureByKey(oFF.VizDefConstants.K_VALUE_AXIS);
			if (oFF.notNull(vizPropValueAxis))
			{
				yAxis = oFF.RsHiChartUtils.axisPloter(vizPropValueAxis, yAxis, this.getChartType(), false);
			}
			oFF.RsHiChartVizUtilsSimple.addReferenceLine(this.getVizDef(), yAxis, yAxis, columnAxis, rowAxis, rs);
		}
	}
	oFF.RsHiChartVizUtilsSimple.legendStyler(theChartData);
	var plotOptions = oFF.PrFactory.createStructure();
	plotOptions = theChartData.getStructureByKey(oFF.VizDefConstants.K_PLOT_OPTIONS);
	var fillColor = oFF.VizDefConstants.K_TRANSPARENT;
	if (theChartData.getListByKey(oFF.VizDefConstants.K_COLORS) !== null)
	{
		if (theChartData.getListByKey(oFF.VizDefConstants.K_COLORS).size() > 0)
		{
			fillColor = theChartData.getListByKey(oFF.VizDefConstants.K_COLORS).getStringAt(0);
		}
	}
	if (oFF.isNull(plotOptions))
	{
		plotOptions = theChartData.putNewStructure(oFF.VizDefConstants.K_PLOT_OPTIONS);
	}
	if (!oFF.XString.isEqual(this.getStackingType(), null))
	{
		oFF.RsHiChartVizUtilsSimple.dataLabelAlignment(yAxis, this.getChartType(), columnAxis.getDecimalPlaces(this.getXFeed()), false);
	}
	oFF.RsHiChartVizUtilsSimple.plotOptionChart(yAxis, this.getChartType(), this.getStackingType(), plotOptions, 0, fillColor);
	oFF.RsHiChartVizUtilsSimple.dataLabelAlignment(yAxis, this.getChartType(), columnAxis.getDecimalPlaces(this.getXFeed()), false);
};
oFF.RsHiChartMarimekkoHelper.prototype.decorateToolTip = function(stringBuffer)
{
	stringBuffer.append("<b>{point.xName}</b> <br/>");
	stringBuffer.append("<b>{point.yName}</b>: {point.yFormatted} <br/>");
	if (oFF.XCollectionUtils.hasElements(this.getYMeasures()))
	{
		stringBuffer.append("<b>{point.zName}</b>: {point.zFormatted} <br/>");
	}
};
oFF.RsHiChartMarimekkoHelper.prototype.prepareRendering = function() {};
oFF.RsHiChartMarimekkoHelper.prototype.finishRendering = function()
{
	var theChartData = this.getChartData();
	var seriesList = theChartData.putNewList(oFF.VizDefConstants.K_SERIES);
	var xAxisStruct = this.getChartData().putNewStructure(oFF.VizDefConstants.K_X_AXIS);
	xAxisStruct.putString(oFF.VizDefConstants.K_TYPE, oFF.VizDefConstants.K_CATEGORY);
	var xDList = xAxisStruct.putNewList(oFF.VizDefConstants.K_CATEGORIES);
	for (var i = 0; i < this.getCategoriesList().size(); i++)
	{
		xDList.addString(this.getCategoriesList().get(i));
	}
	seriesList.clear();
	if (oFF.XCollectionUtils.hasElements(this.getColorList()))
	{
		if (this.getYMeasures().size() === 0)
		{
			this.createOneDimensionalColorSeries(seriesList);
		}
		else
		{
			this.createTwoDimensionalColorSeries(seriesList);
		}
	}
	else
	{
		if (this.getYMeasures().size() === 0)
		{
			this.createOneDimensionalSeries(seriesList);
		}
		else
		{
			this.createTwoDimensionalSeries(seriesList);
		}
	}
};
oFF.RsHiChartMarimekkoHelper.prototype.createOneDimensionalSeries = function(seriesList)
{
	for (var ww = 0; ww < this.getXMeasures().size(); ww++)
	{
		var polarLayer = seriesList.addNewStructure();
		var dataLabels = polarLayer.putNewStructure(oFF.VizDefConstants.K_DATA_LABELS);
		dataLabels.putBoolean(oFF.VizDefConstants.K_ENABLED, true);
		polarLayer.putString(oFF.VizDefConstants.K_NAME, this.getXMeasures().get(ww));
		this.addColorAndPattern(this.getXColors().get(ww), this.getXPatterns().get(ww), polarLayer, oFF.VizDefConstants.K_VARIWIDE, false);
		var newList = polarLayer.putNewList(oFF.VizDefConstants.K_DATA);
		for (var uu = 0; uu < this.getCategoriesList().size(); uu++)
		{
			var ml = newList.addNewStructure();
			ml.putInteger(oFF.VizDefConstants.K_X, uu);
			ml.putDouble(oFF.VizDefConstants.K_Y, this.getXList().getListAt(ww).getDoubleAt(uu));
			ml.putDouble(oFF.VizDefConstants.K_Z, this.getXList().getListAt(ww).getDoubleAt(uu));
			ml.putString(oFF.VizDefConstants.K_Y_FORMATTED, this.getXListFormatted().getListAt(ww).getStringAt(uu));
			ml.putString(oFF.VizDefConstants.K_Z_FORMATTED, this.getXListFormatted().getListAt(ww).getStringAt(uu));
			ml.putString(oFF.VizDefConstants.K_X_NAME, this.getCategoriesList().get(uu));
			ml.putString(oFF.VizDefConstants.K_Y_NAME, this.getXMeasures().get(ww));
			ml.putString(oFF.VizDefConstants.K_Z_NAME, this.getXMeasures().get(ww));
			this.addColorAndPattern(this.getXColors().get(ww), this.getXPatterns().get(ww), ml, oFF.VizDefConstants.K_VARIWIDE, true);
			this.addToolTipsToSeries(ml, 0, uu);
		}
	}
};
oFF.RsHiChartMarimekkoHelper.prototype.createTwoDimensionalSeries = function(seriesList)
{
	for (var ww = 0; ww < this.getXMeasures().size(); ww++)
	{
		for (var vv = 0; vv < this.getYMeasures().size(); vv++)
		{
			var polarLayer = seriesList.addNewStructure();
			var dataLabels = polarLayer.putNewStructure(oFF.VizDefConstants.K_DATA_LABELS);
			dataLabels.putBoolean(oFF.VizDefConstants.K_ENABLED, true);
			polarLayer.putString(oFF.VizDefConstants.K_NAME, oFF.XStringUtils.concatenate3(this.getXMeasures().get(ww), "/", this.getYMeasures().get(vv)));
			this.addColorAndPattern(this.getXColors().get(ww), this.getXPatterns().get(ww), polarLayer, oFF.VizDefConstants.K_VARIWIDE, false);
			var newList = polarLayer.putNewList(oFF.VizDefConstants.K_DATA);
			for (var uu = 0; uu < this.getCategoriesList().size(); uu++)
			{
				var ml = newList.addNewStructure();
				this.addColorAndPattern(this.getXColors().get(ww), this.getXPatterns().get(ww), ml, oFF.VizDefConstants.K_VARIWIDE, true);
				ml.putInteger(oFF.VizDefConstants.K_X, uu);
				ml.putDouble(oFF.VizDefConstants.K_Y, this.getXList().getListAt(ww).getDoubleAt(uu));
				ml.putDouble(oFF.VizDefConstants.K_Z, this.getYList().getListAt(vv).getDoubleAt(uu));
				ml.putString(oFF.VizDefConstants.K_X_NAME, this.getCategoriesList().get(uu));
				ml.putString(oFF.VizDefConstants.K_Y_FORMATTED, this.getXListFormatted().getListAt(ww).getStringAt(uu));
				ml.putString(oFF.VizDefConstants.K_Z_FORMATTED, this.getYListFormatted().getListAt(vv).getStringAt(uu));
				ml.putString(oFF.VizDefConstants.K_Y_NAME, this.getXMeasures().get(ww));
				ml.putString(oFF.VizDefConstants.K_Z_NAME, this.getYMeasures().get(vv));
				this.addToolTipsToSeries(ml, 0, uu);
			}
		}
	}
};
oFF.RsHiChartMarimekkoHelper.prototype.createTwoDimensionalColorSeries = function(seriesList)
{
	var yListSize = this.getYList().size();
	var yMeasuresSize = this.getYMeasures().size();
	for (var cc = 0; cc < this.getColorList().size(); cc++)
	{
		var color = this.getColorList().get(cc);
		for (var ww = 0; ww < this.getXMeasures().size(); ww++)
		{
			var polarLayer = seriesList.addNewStructure();
			var dataLabels = polarLayer.putNewStructure(oFF.VizDefConstants.K_DATA_LABELS);
			dataLabels.putBoolean(oFF.VizDefConstants.K_ENABLED, true);
			polarLayer.putString(oFF.VizDefConstants.K_NAME, oFF.XStringUtils.concatenate3(color, "/", this.getXMeasures().get(ww)));
			var newList = polarLayer.putNewList(oFF.VizDefConstants.K_DATA);
			for (var uu = 0; uu < this.getCategoriesList().size(); uu++)
			{
				var xmeasure = this.getXList().getListAt(this.getXMeasures().size() * cc + ww).getDoubleAt(uu);
				var xmeasureFormatted = this.getXListFormatted().getListAt(this.getXMeasures().size() * cc + ww).getStringAt(uu);
				var ymeasureFormatted = "";
				var xName = this.getXMeasures().get(ww);
				var yName = "";
				var ymeasure = 0;
				var vv;
				for (vv = 0; vv < yListSize; vv++)
				{
					ymeasure = this.getYList().getListAt(vv).getDoubleAt(uu);
					ymeasureFormatted = this.getYListFormatted().getListAt(vv).getStringAt(uu);
					yName = this.getYMeasures().get(0);
					if (ymeasure !== 0)
					{
						break;
					}
				}
				var ml = newList.addNewStructure();
				ml.putInteger(oFF.VizDefConstants.K_X, uu);
				ml.putDouble(oFF.VizDefConstants.K_Y, xmeasure);
				ml.putDouble(oFF.VizDefConstants.K_Z, ymeasure);
				ml.putString(oFF.VizDefConstants.K_Y_FORMATTED, xmeasureFormatted);
				ml.putString(oFF.VizDefConstants.K_Z_FORMATTED, ymeasureFormatted);
				ml.putString(oFF.VizDefConstants.K_X_NAME, this.getCategoriesList().get(uu));
				ml.putString(oFF.VizDefConstants.K_Y_NAME, xName);
				ml.putString(oFF.VizDefConstants.K_Z_NAME, yName);
				this.addToolTipsToSeries(ml, oFF.XMath.div(vv, yMeasuresSize), uu);
			}
		}
	}
};
oFF.RsHiChartMarimekkoHelper.prototype.createOneDimensionalColorSeries = function(seriesList)
{
	var xMeasuresSize = this.getXMeasures().size();
	for (var cc = 0; cc < this.getColorList().size(); cc++)
	{
		var color = this.getColorList().get(cc);
		for (var ww = 0; ww < this.getXMeasures().size(); ww++)
		{
			var polarLayer = seriesList.addNewStructure();
			var dataLabels = polarLayer.putNewStructure(oFF.VizDefConstants.K_DATA_LABELS);
			dataLabels.putBoolean(oFF.VizDefConstants.K_ENABLED, true);
			polarLayer.putString(oFF.VizDefConstants.K_NAME, oFF.XStringUtils.concatenate3(color, "/", this.getXMeasures().get(ww)));
			var newList = polarLayer.putNewList(oFF.VizDefConstants.K_DATA);
			for (var uu = 0; uu < this.getCategoriesList().size(); uu++)
			{
				var xmeasure = this.getXList().getListAt(this.getXMeasures().size() * cc + ww).getDoubleAt(uu);
				var ymeasure = 0;
				var vv;
				for (vv = 0; vv < this.getXList().size(); vv++)
				{
					ymeasure = this.getXList().getListAt(vv).getDoubleAt(uu);
					if (ymeasure !== 0)
					{
						break;
					}
				}
				var xmeasureFormatted = this.getXListFormatted().getListAt(this.getXMeasures().size() * cc + ww).getStringAt(uu);
				var xName = this.getXMeasures().get(ww);
				var ml = newList.addNewStructure();
				ml.putInteger(oFF.VizDefConstants.K_X, uu);
				ml.putDouble(oFF.VizDefConstants.K_Y, xmeasure);
				ml.putDouble(oFF.VizDefConstants.K_Z, ymeasure);
				ml.putString(oFF.VizDefConstants.K_Y_FORMATTED, xmeasureFormatted);
				ml.putString(oFF.VizDefConstants.K_X_NAME, this.getCategoriesList().get(uu));
				ml.putString(oFF.VizDefConstants.K_Y_NAME, xName);
				this.addToolTipsToSeries(ml, oFF.XMath.div(vv, xMeasuresSize), uu);
			}
		}
	}
};

oFF.RsHiChartMetricHelper = function() {};
oFF.RsHiChartMetricHelper.prototype = new oFF.RsHiChartCovariationHelper();
oFF.RsHiChartMetricHelper.prototype._ff_c = "RsHiChartMetricHelper";

oFF.RsHiChartMetricHelper.prototype.isResponsive = function()
{
	return false;
};
oFF.RsHiChartMetricHelper.prototype.prepareRendering = function() {};
oFF.RsHiChartMetricHelper.prototype.finishRendering = function()
{
	var xList = this.getXList();
	if (!oFF.XCollectionUtils.hasElements(xList))
	{
		return;
	}
	var zList = this.getZList();
	var xListFormatted = this.getXListFormatted();
	var yListFormatted = this.getYListFormatted();
	var zListFormatted = this.getZListFormatted();
	if (!oFF.XCollectionUtils.hasElements(xListFormatted))
	{
		return;
	}
	var theChartData = this.getChartData();
	var seriesList = theChartData.putNewList(oFF.VizDefConstants.K_SERIES);
	var polarLayer = seriesList.addNewStructure();
	var newList = polarLayer.putNewList(oFF.VizDefConstants.K_DATA);
	var valueAxisAxisStyleFontSize = "120px";
	var categoryAxisStyleFontSize = "30px";
	var sideAxisStyleFontSize = "40px";
	var categoryAxisStyleFontColor = oFF.VizDefConstants.V_BLACK;
	var valueAxisAxisStyleFontColor = oFF.VizDefConstants.V_BLACK;
	var yStructure = newList.addNewStructure();
	yStructure.putString(oFF.VizDefConstants.K_VALUE_FORMATTED, xListFormatted.getListAt(0).getStringAt(0));
	yStructure.putDouble(oFF.VizDefConstants.K_Y, xList.getListAt(0).getDoubleAt(0));
	yStructure.putString(oFF.VizDefConstants.K_NAME, this.getXMeasures().get(0));
	var i = 0;
	var targetValues = yStructure.putNewList(oFF.VizDefConstants.K_TARGET_VALUES);
	var sb = oFF.XStringBuffer.create();
	if (yListFormatted.size() + zListFormatted.size() > 0)
	{
		sb.append("<br/><div style=\"font-size:");
		sb.append(sideAxisStyleFontSize);
		sb.append("\">");
	}
	var maxLabelSize = 0;
	var maxNumberLength = 0;
	for (i = 0; i < yListFormatted.size(); i++)
	{
		maxNumberLength = oFF.XMath.max(maxNumberLength, oFF.XString.size(yListFormatted.getListAt(i).getStringAt(0)));
		if (i < this.getYMeasures().size())
		{
			maxLabelSize = oFF.XMath.max(maxLabelSize, oFF.XString.size(this.getYMeasures().get(i)));
		}
	}
	if (zListFormatted.size() > 0)
	{
		maxNumberLength = oFF.XMath.max(maxNumberLength, oFF.XString.size(zListFormatted.getListAt(0).getStringAt(0)));
	}
	for (i = 0; i < yListFormatted.size(); i++)
	{
		var tvs = targetValues.addNewStructure();
		tvs.putString(oFF.VizDefConstants.K_TARGET_FORMATTED, yListFormatted.getListAt(i).getStringAt(0));
		var yMeasureString = "";
		if (i < this.getYMeasures().size())
		{
			yMeasureString = this.getYMeasures().get(i);
		}
		tvs.putString(oFF.VizDefConstants.K_NAME, yMeasureString);
		sb.append("<br/><div><span style=\"text-align:left;font-size:");
		sb.append(sideAxisStyleFontSize);
		sb.append(";width:");
		var spacing = 3 + maxNumberLength - oFF.XString.size(yMeasureString);
		sb.append(oFF.XInteger.convertToString(spacing));
		sb.append("em;\">{point.targetValues.");
		sb.append(oFF.XInteger.convertToString(i));
		sb.append(".targetFormatted}");
		for (var j = 0; j < spacing; j++)
		{
			sb.append("\u00A0");
		}
		sb.append(" </span><span style=\"text-align:right;font-size:");
		sb.append(sideAxisStyleFontSize);
		sb.append(";\">{point.targetValues.");
		sb.append(oFF.XInteger.convertToString(i));
		sb.append(".name}</span></div>");
	}
	if (zListFormatted.size() > 0)
	{
		yStructure.putString(oFF.VizDefConstants.K_VARIANCE, zListFormatted.getListAt(0).getStringAt(0));
		sb.append("<br/><div><span style=\"font-size:");
		sb.append(sideAxisStyleFontSize);
		sb.append(";width:");
		var tabbing = 3 + maxLabelSize + maxNumberLength - oFF.XString.size(zListFormatted.getListAt(0).getStringAt(0));
		sb.append(oFF.XInteger.convertToString(tabbing));
		sb.append("em;\">");
		sb.append(zList.getListAt(0).getDoubleAt(0) < 0 ? "\u21E9" : zList.getListAt(0).getDoubleAt(0) === 0 ? "\u21E8" : "\u21E7");
		sb.append("\u00A0{point.variance}");
		sb.append("</span><span style=\"text-align:right;font-size:");
		sb.append(sideAxisStyleFontSize);
		sb.append(";\"></span></div>");
	}
	if (yListFormatted.size() + zListFormatted.size() > 0)
	{
		sb.append("</div>");
	}
	var chartTypeInfo = theChartData.getStructureByKey(oFF.VizDefConstants.K_CHART);
	var chartLang = theChartData.putNewStructure(oFF.VizDefConstants.K_LANG);
	chartLang.putString(oFF.VizDefConstants.K_THOUSANDS_SEP, ",");
	chartTypeInfo.putInteger(oFF.VizDefConstants.K_MARGIN_TOP, 110);
	var tooltip = theChartData.putNewStructure(oFF.VizDefConstants.K_TOOLTIP);
	tooltip.putBoolean(oFF.VizDefConstants.K_ENABLED, false);
	var pane = theChartData.putNewStructure(oFF.VizDefConstants.K_PANE);
	var paneBackground = pane.putNewList(oFF.VizDefConstants.K_BACKGROUND).addNewStructure();
	paneBackground.putString(oFF.VizDefConstants.K_BACKGROUND_COLOR, "rgba(0,0,0,0)");
	paneBackground.putString(oFF.VizDefConstants.K_INNER_RADIUS, "0%");
	paneBackground.putString(oFF.VizDefConstants.K_OUTER_RADIUS, "0%");
	paneBackground.putString(oFF.VizDefConstants.K_SHAPE, oFF.VizDefConstants.V_ARC);
	pane.putInteger(oFF.VizDefConstants.K_END_ANGLE, 0);
	pane.putInteger(oFF.VizDefConstants.K_START_ANGLE, 0);
	pane.putInteger(oFF.VizDefConstants.K_SIZE, 0);
	var centerPane = pane.putNewList(oFF.VizDefConstants.V_CENTER);
	centerPane.addString("0%");
	centerPane.addString("0%");
	var yAxis = theChartData.putNewList(oFF.VizDefConstants.K_Y_AXIS);
	var yAxisStruct = yAxis.addNewStructure();
	yAxisStruct.putInteger(oFF.VizDefConstants.K_LINE_WIDTH, 0);
	yAxisStruct.putInteger(oFF.VizDefConstants.K_GRIDLINE_WIDTH, 0);
	yAxisStruct.putBoolean(oFF.VizDefConstants.K_VISIBLE, false);
	var legend = theChartData.putNewStructure(oFF.VizDefConstants.K_LEGEND);
	legend.putBoolean(oFF.VizDefConstants.K_ENABLED, false);
	var plotOptions = theChartData.putNewStructure(oFF.VizDefConstants.K_PLOT_OPTIONS);
	var plotOptionChartTypeStructure = plotOptions.putNewStructure(oFF.VizDefConstants.K_SERIES);
	var dataLabels = plotOptionChartTypeStructure.putNewStructure(oFF.VizDefConstants.K_DATA_LABELS);
	dataLabels.putBoolean(oFF.VizDefConstants.K_ENABLED, true);
	dataLabels.putString(oFF.VizDefConstants.K_ALIGN, oFF.VizDefConstants.V_RIGHT);
	dataLabels.putString(oFF.VizDefConstants.K_VERTICAL_ALIGN, oFF.VizDefConstants.V_MIDDLE);
	dataLabels.putInteger(oFF.VizDefConstants.K_Y, 0);
	dataLabels.putInteger(oFF.VizDefConstants.K_BORDER_WIDTH, 0);
	var valueAxisformat = ";\">{point.valueFormatted}</span>";
	var categoryAxisformat = ";\">{point.name}</span></div>";
	theChartData.putBoolean(oFF.VizDefConstants.K_FULL_SCREEN_ENABLED, false);
	var formatCategoryAxis = null;
	var formatValueAxis = null;
	var format = null;
	formatCategoryAxis = oFF.XStringUtils.concatenate5("<div><span style=\"font-size:", categoryAxisStyleFontSize, ";color:", categoryAxisStyleFontColor, categoryAxisformat);
	formatValueAxis = oFF.XStringUtils.concatenate5("<span style=\"font-size:", valueAxisAxisStyleFontSize, ";color:", valueAxisAxisStyleFontColor, valueAxisformat);
	var formatTerciaryAxis = sb.toString();
	format = oFF.XStringUtils.concatenate4(formatValueAxis, "<br/>", formatCategoryAxis, formatTerciaryAxis);
	dataLabels.putString(oFF.VizDefConstants.K_FORMAT, format);
	var styleDatalabels = dataLabels.putNewStructure(oFF.VizDefConstants.K_STYLE);
	styleDatalabels.putString(oFF.VizDefConstants.K_TEXT_OUTLINE, "0px");
	var plotOptionSolidGauge = plotOptions.putNewStructure(oFF.VizDefConstants.K_SOLID_GAUGE);
	plotOptionSolidGauge.putBoolean(oFF.VizDefConstants.K_ANIMATION, false);
};
oFF.RsHiChartMetricHelper.prototype.getXFeed = function()
{
	return oFF.VizDefConstants.K_VALUE_AXIS;
};
oFF.RsHiChartMetricHelper.prototype.getYFeed = function()
{
	return oFF.VizDefConstants.K_VALUE_AXIS2;
};
oFF.RsHiChartMetricHelper.prototype.getZFeed = function()
{
	return oFF.VizDefConstants.K_VARIANCE;
};

oFF.RsHiChartPieHelper = function() {};
oFF.RsHiChartPieHelper.prototype = new oFF.RsHiChartCovariationHelper();
oFF.RsHiChartPieHelper.prototype._ff_c = "RsHiChartPieHelper";

oFF.RsHiChartPieHelper.prototype.isShowLegend = function()
{
	return true;
};
oFF.RsHiChartPieHelper.prototype.getXFeed = function()
{
	return oFF.VizDefConstants.K_SIZE;
};
oFF.RsHiChartPieHelper.prototype.getYFeed = function()
{
	return null;
};
oFF.RsHiChartPieHelper.prototype.getZFeed = function()
{
	return null;
};
oFF.RsHiChartPieHelper.prototype.decorateToolTip = function(stringBuffer)
{
	stringBuffer.append("<b>{point.name}</b>: {point.yFormatted} <br/>");
};
oFF.RsHiChartPieHelper.prototype.prepareRendering = function()
{
	var theChartData = this.getChartData();
	var chartTypeInfo = theChartData.getStructureByKey(oFF.VizDefConstants.K_CHART);
	var chartTypeInfostyle = chartTypeInfo.putNewStructure(oFF.VizDefConstants.K_STYLE);
	chartTypeInfostyle.putString(oFF.VizDefConstants.K_FONT_FAMILY, "LatoWeb, 'Open Sans', 'Helvetica Neue', Helvetica, Arial, 'sans serif'");
	chartTypeInfostyle.putString(oFF.VizDefConstants.K_FONT_SIZE, "13px");
	var legend = theChartData.getStructureByKey(oFF.VizDefConstants.K_LEGEND);
	legend.putBoolean(oFF.VizDefConstants.K_SQUARE_SYMBOL, true);
	legend.putInteger(oFF.VizDefConstants.K_SYMBOL_RADIUS, 0);
	legend.putString(oFF.VizDefConstants.K_LAYOUT, oFF.VizDefConstants.V_HORIZONTAL);
	legend.putString(oFF.VizDefConstants.K_ALIGN, oFF.VizDefConstants.V_CENTER);
	legend.putString(oFF.VizDefConstants.K_VERTICAL_ALIGN, oFF.VizDefConstants.V_POSITION_TOP);
	var plotOptions = theChartData.putNewStructure(oFF.VizDefConstants.K_PLOT_OPTIONS);
	var yAxis = theChartData.putNewList(oFF.VizDefConstants.K_Y_AXIS);
	var yAxisStruct = yAxis.addNewStructure();
	var yAxisTitle = yAxisStruct.putNewStructure(oFF.VizDefConstants.K_TITLE);
	yAxisTitle.putString(oFF.VizDefConstants.K_TEXT, "");
	var plotOptionChartTypeStructure = plotOptions.putNewStructure(this.getChartType());
	plotOptionChartTypeStructure.putBoolean(oFF.VizDefConstants.K_SHOW_IN_LEGEND, true);
	plotOptionChartTypeStructure.putString(oFF.VizDefConstants.K_INNER_SIZE, this.getInnerRadius());
	var dataLabels = plotOptionChartTypeStructure.putNewStructure(oFF.VizDefConstants.K_DATA_LABELS);
	dataLabels.putBoolean(oFF.VizDefConstants.K_ENABLED, true);
	dataLabels.putString(oFF.VizDefConstants.K_FORMAT, "{point.percentage:.2f} %");
	dataLabels.putBoolean(oFF.VizDefConstants.K_HIDE_WHEN_OVERLAP, true);
	dataLabels.putInteger(oFF.VizDefConstants.K_DISTANCE, 15);
	var dataLabelsStyle = dataLabels.putNewStructure(oFF.VizDefConstants.K_STYLE);
	dataLabelsStyle.putString(oFF.VizDefConstants.K_FONT_WEIGHT, oFF.VizDefConstants.V_FONT_WEIGHT_BOLD);
	dataLabelsStyle.putString(oFF.VizDefConstants.K_FONT_FAMILY, "LatoWeb, 'Open Sans', 'Helvetica Neue', Helvetica, Arial, 'sans serif'");
	dataLabelsStyle.putString(oFF.VizDefConstants.K_FONT_SIZE, "12px");
	dataLabelsStyle.putString(oFF.VizDefConstants.K_COLOR, "rgb(88,89,91)");
};
oFF.RsHiChartPieHelper.prototype.finishRendering = function()
{
	var theChartData = this.getChartData();
	var seriesList = theChartData.putNewList(oFF.VizDefConstants.K_SERIES);
	var polarLayer = seriesList.addNewStructure();
	var newList = polarLayer.putNewList(oFF.VizDefConstants.K_DATA);
	if (this.getXList().size() === 0)
	{
		return;
	}
	polarLayer.putString(oFF.VizDefConstants.K_NAME, this.getXMeasures().get(0));
	var xList = this.getXListRemapped();
	var yList = this.getYListRemapped();
	var xListFormatted = this.getXListFormattedRemapped();
	var yListFormatted = this.getYListFormattedRemapped();
	var categoriesList = this.getCategoriesList();
	for (var p = 0; p < xList.size(); p++)
	{
		var newstruct = newList.addNewStructure();
		var yValue = xList.getDoubleAt(p);
		var yValueFormatted = oFF.XDouble.convertToString(yValue);
		var zValue = 0.0;
		var zValueFormatted = "0.0";
		if (p < xListFormatted.size())
		{
			yValueFormatted = xListFormatted.getStringAt(p);
		}
		if (p < yList.size())
		{
			zValue = yList.getDoubleAt(p);
			zValueFormatted = oFF.XDouble.convertToString(zValue);
		}
		if (p < yListFormatted.size())
		{
			zValueFormatted = yListFormatted.getStringAt(p);
		}
		newstruct.putString(oFF.VizDefConstants.K_Y_FORMATTED, yValueFormatted);
		newstruct.putString(oFF.VizDefConstants.K_Z_FORMATTED, zValueFormatted);
		newstruct.putDouble(oFF.VizDefConstants.K_Y, yValue);
		newstruct.putDouble(oFF.VizDefConstants.K_Z, zValue);
		this.addToolTipsToSeries(newstruct, 0, p);
		if (categoriesList.size() > p)
		{
			var s = categoriesList.get(p);
			newstruct.putString(oFF.VizDefConstants.K_NAME, s);
		}
	}
};

oFF.RsHiChartTimeSeriesHelper = function() {};
oFF.RsHiChartTimeSeriesHelper.prototype = new oFF.RsHiChartSeriesHelper();
oFF.RsHiChartTimeSeriesHelper.prototype._ff_c = "RsHiChartTimeSeriesHelper";

oFF.RsHiChartTimeSeriesHelper.addValue = function(dataList, date, dataCell, axis, tuple, measureName, errorList, error1, error2, categoryName, tooltipHeaders, tooltipValues, error1Formatted, error2Formatted, enforceColor)
{
	var doubleValue = 0;
	var valueType = dataCell.getValueType();
	var intermediateStructure = dataList.addNewStructure();
	if (valueType === oFF.XValueType.DOUBLE || valueType === oFF.XValueType.DECIMAL_FLOAT)
	{
		intermediateStructure.putDouble(oFF.VizDefConstants.K_X, date.getMilliseconds());
		if (dataCell.getXValue() !== null)
		{
			doubleValue = dataCell.getDouble();
			intermediateStructure.putDouble(oFF.VizDefConstants.K_Y, doubleValue);
			intermediateStructure.putString(oFF.VizDefConstants.K_Y_FORM, axis.getFormattedValue(oFF.VizDefConstants.K_VALUE_AXIS, tuple, dataCell));
			intermediateStructure.putDouble(oFF.VizDefConstants.K_PERCENT, doubleValue * 100);
		}
		else
		{
			intermediateStructure.putString(oFF.VizDefConstants.K_Y, null);
			intermediateStructure.putString(oFF.VizDefConstants.K_Y_FORM, null);
		}
		if (enforceColor)
		{
			intermediateStructure.putStringNotNullAndNotEmpty(oFF.VizDefConstants.K_COLOR, tuple.getColor());
		}
		intermediateStructure.putString(oFF.VizDefConstants.K_NAME, measureName);
		if (oFF.notNull(categoryName))
		{
			intermediateStructure.putString(oFF.VizDefConstants.K_CATEGORY_FORM, categoryName);
		}
	}
	if (oFF.notNull(errorList))
	{
		var subList = errorList.addNewList();
		subList.addDouble(error1);
		subList.addDouble(error2);
		if (error1 < error2)
		{
			intermediateStructure.putString(oFF.VizDefConstants.K_ERROR_RANGE, oFF.XStringUtils.concatenate3(oFF.XDouble.convertToString(error1), " .. ", error2Formatted));
		}
		else
		{
			intermediateStructure.putString(oFF.VizDefConstants.K_ERROR_RANGE, oFF.XStringUtils.concatenate3(oFF.XDouble.convertToString(error2), " .. ", error1Formatted));
		}
	}
	if (oFF.XCollectionUtils.hasElements(tooltipHeaders))
	{
		for (var j = 0; j < tooltipHeaders.size(); j++)
		{
			intermediateStructure.putString(oFF.XStringUtils.concatenate2(oFF.VizDefConstants.K_T_HEADER, oFF.XInteger.convertToString(j)), tooltipHeaders.get(j));
		}
	}
	if (oFF.XCollectionUtils.hasElements(tooltipValues))
	{
		for (var i = 0; i < tooltipValues.size(); i++)
		{
			intermediateStructure.putString(oFF.XStringUtils.concatenate2(oFF.VizDefConstants.K_T_FORMATTED, oFF.XInteger.convertToString(i)), tooltipValues.get(i));
		}
	}
};
oFF.RsHiChartTimeSeriesHelper.prototype.isTimeseries = function()
{
	return true;
};
oFF.RsHiChartTimeSeriesHelper.prototype.prepareRendering = function() {};
oFF.RsHiChartTimeSeriesHelper.prototype.readResultSetData = function(columnAxis, rowAxis, rs)
{
	var theChartData = this.getChartData();
	var dataList = null;
	var dataLayer = null;
	var chartlang = theChartData.putNewStructure(oFF.VizDefConstants.K_LANG);
	var seriesList = theChartData.putNewList(oFF.VizDefConstants.K_SERIES);
	var tooltipBuffer = oFF.XStringBuffer.create();
	tooltipBuffer.append("<b>{series.name}</b><br/>");
	var errorList;
	tooltipBuffer.append("<b>{point.name}</b>:  {point.yForm}<br/>");
	var dataAvailable = false;
	var columnSelectors = oFF.XListOfString.create();
	columnSelectors.add(oFF.VizDefConstants.K_VALUE_AXIS);
	columnSelectors.add(oFF.VizDefConstants.K_VALUE_AXIS2);
	columnSelectors.add(oFF.VizDefConstants.K_VARIANCE);
	var pureColors = columnAxis.getPrettyNamesForFeed(true, false, oFF.VizDefConstants.K_COLOR);
	if (rs.getAvailableDataCellCount() > 0)
	{
		var tooltipHeaders = columnAxis.getPrettyNamesForFeed(true, false, oFF.VizDefConstants.K_TOOLTIP_VALUE_AXIS);
		for (var ti = 0; ti < tooltipHeaders.size(); ti++)
		{
			tooltipBuffer.append("<b>{point.tHeader");
			tooltipBuffer.append(oFF.XInteger.convertToString(ti));
			tooltipBuffer.append("}</b>:  {point.tFormatted");
			tooltipBuffer.append(oFF.XInteger.convertToString(ti));
			tooltipBuffer.append("}<br/>");
		}
		tooltipBuffer.append("{point.errorRange}<br/>");
		tooltipBuffer.append("{point.categoryForm}<br/>");
		var rowList = rowAxis.getDateList();
		var rowFormattedList = rowAxis.getFormattedDateList();
		if (oFF.XCollectionUtils.hasElements(rowList))
		{
			var indices = columnAxis.getIndicesByFeedOrder(columnSelectors);
			var selectorList = oFF.XListOfString.create();
			selectorList.add(oFF.VizDefConstants.K_COLOR);
			selectorList.addAll(columnSelectors);
			this.setShowLegend(indices.size() > 1);
			for (var ij = 0; ij < indices.size(); ij++)
			{
				var i = indices.get(ij).getInteger();
				var columnTuple = columnAxis.getTupleAt(i);
				if (!columnTuple.isSelectedByString(oFF.VizDefConstants.K_VALUE_AXIS))
				{
					continue;
				}
				var overwriteColors = pureColors.size() < 2;
				dataLayer = seriesList.addNewStructure();
				dataLayer.putString(oFF.VizDefConstants.K_NAME, columnTuple.getPrettyDefaultText());
				dataList = dataLayer.putNewList(oFF.VizDefConstants.K_DATA);
				if (overwriteColors)
				{
					dataLayer.putStringNotNullAndNotEmpty(oFF.VizDefConstants.K_COLOR, columnTuple.getColor());
				}
				var memberNames = columnTuple.getMemberKeys();
				errorList = null;
				var errorIndex1 = i;
				var errorIndex2 = i;
				var hasErrorBar = false;
				var tooltipIndices = null;
				var tooltipValues = null;
				if (oFF.XCollectionUtils.hasElements(memberNames))
				{
					tooltipIndices = columnAxis.getMatchingTupleIndicesForMemberNameAndFeed(memberNames, oFF.VizDefConstants.K_TOOLTIP_VALUE_AXIS);
					var errorIndex = columnAxis.getMatchingTupleIndicesForMemberNamesAndSuffix(memberNames, oFF.VizDefConstants.K_ERRORBAR_MIN);
					if (errorIndex !== -1)
					{
						errorIndex1 = errorIndex;
						hasErrorBar = true;
					}
					errorIndex = columnAxis.getMatchingTupleIndicesForMemberNamesAndSuffix(memberNames, oFF.VizDefConstants.K_ERRORBAR_MAX);
					if (errorIndex !== -1)
					{
						errorIndex2 = errorIndex;
						hasErrorBar = true;
					}
					if (hasErrorBar)
					{
						var errorLayer = seriesList.addNewStructure();
						errorList = errorLayer.putNewList(oFF.VizDefConstants.K_DATA);
						errorLayer.putString(oFF.VizDefConstants.K_TYPE, oFF.VizDefConstants.K_ERRORBAR);
					}
				}
				for (var j = 0; j < rowAxis.getTuplesCount(); j++)
				{
					if (!rowAxis.getTupleAt(j).isSelectedByString(oFF.VizDefConstants.K_TIME_AXIS))
					{
						continue;
					}
					var date = rowList.get(j);
					var error1 = 0;
					var error2 = 0;
					var error1Formatted = "";
					var error2Formatted = "";
					if (oFF.notNull(date))
					{
						if (hasErrorBar)
						{
							error1 = rs.getDataCell(errorIndex1, j).getDouble();
							error1Formatted = columnAxis.getFormattedValue(oFF.VizDefConstants.K_VALUE_AXIS, columnAxis.getTupleAt(errorIndex1), rs.getDataCell(errorIndex1, j));
							error2 = rs.getDataCell(errorIndex2, j).getDouble();
							error2Formatted = columnAxis.getFormattedValue(oFF.VizDefConstants.K_VALUE_AXIS, columnAxis.getTupleAt(errorIndex2), rs.getDataCell(errorIndex2, j));
						}
						if (oFF.XCollectionUtils.hasElements(tooltipIndices))
						{
							tooltipValues = oFF.XListOfString.create();
							for (var ttindex = 0; ttindex < tooltipIndices.size(); ttindex++)
							{
								var tooltipIndex = tooltipIndices.get(ttindex).getInteger();
								tooltipValues.add(columnAxis.getFormattedValue("", columnAxis.getTupleAt(tooltipIndex), rs.getDataCell(tooltipIndex, j)));
							}
						}
						var dataCell = rs.getDataCell(i, j);
						if (!rowAxis.getTupleAt(j).isTotal())
						{
							oFF.RsHiChartTimeSeriesHelper.addValue(dataList, date, dataCell, columnAxis, columnTuple, columnTuple.getPrettyDefaultText(), errorList, error1, error2, rowFormattedList.get(j), tooltipHeaders, tooltipValues, error1Formatted, error2Formatted, overwriteColors);
							dataAvailable = true;
						}
					}
				}
			}
			var tooltip = theChartData.putNewStructure(oFF.VizDefConstants.K_TOOLTIP);
			tooltip.putString(oFF.VizDefConstants.K_POINT_FORMAT, tooltipBuffer.toString());
			tooltip.putString(oFF.VizDefConstants.K_HEADER_FORMAT, "");
		}
	}
	if (!dataAvailable)
	{
		chartlang.putString(oFF.VizDefConstants.K_NO_DATA, "Firefly Resultset is Empty.");
		theChartData.putBoolean(oFF.VizDefConstants.K_FULL_SCREEN_ENABLED, false);
	}
};
oFF.RsHiChartTimeSeriesHelper.prototype.finishRendering = function()
{
	this.getChartData().putBoolean(oFF.VizDefConstants.K_IS_TIME_SERIES, true);
};

oFF.RsHiChartTreemapHelper = function() {};
oFF.RsHiChartTreemapHelper.prototype = new oFF.RsHiChartCovariationHelper();
oFF.RsHiChartTreemapHelper.prototype._ff_c = "RsHiChartTreemapHelper";

oFF.RsHiChartTreemapHelper.prototype.prepareRendering = function() {};
oFF.RsHiChartTreemapHelper.prototype.finishRendering = function()
{
	var theChartData = this.getChartData();
	var seriesList = theChartData.putNewList(oFF.VizDefConstants.K_SERIES);
	var polarLayer = seriesList.addNewStructure();
	polarLayer.putString(oFF.VizDefConstants.K_LAYOUT_ALGORITHM, oFF.VizDefConstants.V_TREEMAP_LAYOUT_STRIP);
	var newList = polarLayer.putNewList(oFF.VizDefConstants.K_DATA);
	if (this.getXList().size() === 0)
	{
		return;
	}
	if (this.getYMeasures().size() > 0)
	{
		polarLayer.putString(oFF.VizDefConstants.K_NAME, this.getYMeasures().get(0));
	}
	else if (this.getXMeasures().size() > 0)
	{
		polarLayer.putString(oFF.VizDefConstants.K_NAME, this.getXMeasures().get(0));
	}
	else
	{
		polarLayer.putString(oFF.VizDefConstants.K_NAME, "");
	}
	var xList = this.getXListRemapped();
	var yList = this.getYListRemapped();
	var xListFormatted = this.getXListFormattedRemapped();
	var yListFormatted = this.getYListFormattedRemapped();
	var xMeasures = this.getXMeasures();
	var yMeasures = this.getYMeasures();
	var categoriesLabels = this.getCategoryLabels();
	var twoDimensional = oFF.XCollectionUtils.hasElements(yMeasures);
	if (!twoDimensional)
	{
		yList = xList;
		yListFormatted = xListFormatted;
		yMeasures = xMeasures;
	}
	var dataLabels = polarLayer.putNewStructure(oFF.VizDefConstants.K_DATA_LABELS);
	dataLabels.putString(oFF.VizDefConstants.K_POINT_FORMAT, "<b>{point.name}</b><br/> {point.valueFormatted}");
	var xValues = 0;
	var yValues = 0;
	var xValuesFormatted = "0";
	var yValuesFormatted = "0";
	var keySet = oFF.XHashSetOfString.create();
	for (var k = 0; k < categoriesLabels.size(); k++)
	{
		var element = categoriesLabels.get(k);
		xValues = xList.getDoubleAt(k);
		yValues = yList.getDoubleAt(k);
		xValuesFormatted = xListFormatted.getStringAt(k);
		yValuesFormatted = yListFormatted.getStringAt(k);
		var newStructure = this.getNewLabeledStructure(newList, element, keySet);
		if (element.isLeafOrCollapsed())
		{
			newStructure.putDouble(oFF.VizDefConstants.K_VALUE, xValues);
			newStructure.putDouble(oFF.VizDefConstants.K_COLOR_VALUE, yValues);
		}
		newStructure.putString(oFF.VizDefConstants.K_VALUE_FORMATTED, xValuesFormatted);
		newStructure.putString(oFF.VizDefConstants.K_COLOR_VALUE_FORMATTED, yValuesFormatted);
		newStructure.putString(oFF.VizDefConstants.K_COLOR_NAME, yMeasures.get(0));
		newStructure.putString(oFF.VizDefConstants.K_VALUE_NAME, xMeasures.get(0));
		newStructure.putString(oFF.VizDefConstants.K_TYPE, this.getChartType());
		this.addToolTipsToSeries(newStructure, 0, k);
	}
	oFF.RsHiChartVizUtilsHeatmap.rendrerHeatmap(this.getChartData(), this.getChartType(), this.getVizDef(), this.getGlobalDef());
};
oFF.RsHiChartTreemapHelper.prototype.getNewLabeledStructure = function(newList, element, keySet)
{
	if (keySet.contains(element.getCompoundId()))
	{
		return null;
	}
	if (element.getParent() !== null)
	{
		this.getNewLabeledStructure(newList, element.getParent(), keySet);
	}
	keySet.add(element.getCompoundId());
	var newStructure = newList.addNewStructure();
	newStructure.putString(oFF.VizDefConstants.K_ID, element.getCompoundId());
	if (element.getParent() !== null)
	{
		newStructure.putString(oFF.VizDefConstants.K_PARENT, element.getParent().getCompoundId());
	}
	newStructure.putString(oFF.VizDefConstants.K_NAME, element.getLabel());
	if (!element.isLeafOrCollapsed())
	{
		newStructure.putInteger(oFF.VizDefConstants.K_BORDER_WIDTH, oFF.XMath.div(6, element.getDisplayLevel() + 1));
		newStructure.putString(oFF.VizDefConstants.K_BORDER_COLOR, "grey");
	}
	return newStructure;
};
oFF.RsHiChartTreemapHelper.prototype.getXFeed = function()
{
	return oFF.VizDefConstants.K_WEIGHT;
};
oFF.RsHiChartTreemapHelper.prototype.getYFeed = function()
{
	return oFF.VizDefConstants.K_COLOR;
};
oFF.RsHiChartTreemapHelper.prototype.getZFeed = function()
{
	return null;
};
oFF.RsHiChartTreemapHelper.prototype.decorateToolTip = function(stringBuffer)
{
	stringBuffer.append("<b>{point.name}</b><br/><b>{point.valueName}</b>: {point.valueFormatted} <br/>");
	if (oFF.XCollectionUtils.hasElements(this.getYMeasures()))
	{
		stringBuffer.append("<b>{point.colorName}</b>: {point.colorValueFormatted} <br/>");
	}
};

oFF.RsHiChartWordcloudHelper = function() {};
oFF.RsHiChartWordcloudHelper.prototype = new oFF.RsHiChartCovariationHelper();
oFF.RsHiChartWordcloudHelper.prototype._ff_c = "RsHiChartWordcloudHelper";

oFF.RsHiChartWordcloudHelper.prototype.getXFeed = function()
{
	return oFF.VizDefConstants.K_SIZE;
};
oFF.RsHiChartWordcloudHelper.prototype.getYFeed = function()
{
	return null;
};
oFF.RsHiChartWordcloudHelper.prototype.getZFeed = function()
{
	return null;
};
oFF.RsHiChartWordcloudHelper.prototype.decorateToolTip = function(stringBuffer)
{
	stringBuffer.append("<b>{point.name}</b>: {point.weightFormatted}  <br/>");
};
oFF.RsHiChartWordcloudHelper.prototype.prepareRendering = function()
{
	var theChartData = this.getChartData();
	var chartTypeInfo = theChartData.getStructureByKey(oFF.VizDefConstants.K_CHART);
	var chartTypeInfostyle = chartTypeInfo.putNewStructure(oFF.VizDefConstants.K_STYLE);
	chartTypeInfostyle.putString(oFF.VizDefConstants.K_FONT_FAMILY, "LatoWeb, 'Open Sans', 'Helvetica Neue', Helvetica, Arial, 'sans serif'");
	chartTypeInfostyle.putString(oFF.VizDefConstants.K_FONT_SIZE, "13px");
	var legend = theChartData.getStructureByKey(oFF.VizDefConstants.K_LEGEND);
	legend.putBoolean(oFF.VizDefConstants.K_SQUARE_SYMBOL, true);
	legend.putInteger(oFF.VizDefConstants.K_SYMBOL_RADIUS, 0);
	legend.putString(oFF.VizDefConstants.K_LAYOUT, oFF.VizDefConstants.V_HORIZONTAL);
	legend.putString(oFF.VizDefConstants.K_ALIGN, oFF.VizDefConstants.V_CENTER);
	legend.putString(oFF.VizDefConstants.K_VERTICAL_ALIGN, oFF.VizDefConstants.V_POSITION_TOP);
	var plotOptions = theChartData.putNewStructure(oFF.VizDefConstants.K_PLOT_OPTIONS);
	var yAxis = theChartData.putNewList(oFF.VizDefConstants.K_Y_AXIS);
	var yAxisStruct = yAxis.addNewStructure();
	var yAxisTitle = yAxisStruct.putNewStructure(oFF.VizDefConstants.K_TITLE);
	yAxisTitle.putString(oFF.VizDefConstants.K_TEXT, "");
	var plotOptionChartTypeStructure = plotOptions.putNewStructure(this.getChartType());
	var plotOptionChartTypeStructureStyle = plotOptionChartTypeStructure.putNewStructure(oFF.VizDefConstants.K_STYLE);
	plotOptionChartTypeStructureStyle.putString(oFF.VizDefConstants.K_FONT_FAMILY, "LatoWeb, 'Open Sans', 'Helvetica Neue', Helvetica, Arial, 'sans serif'");
	var plotOptionChartTypeStructureRotation = plotOptionChartTypeStructure.putNewStructure(oFF.VizDefConstants.K_ROTATION);
	plotOptionChartTypeStructureRotation.putInteger(oFF.VizDefConstants.K_FROM, -45);
	plotOptionChartTypeStructureRotation.putInteger(oFF.VizDefConstants.K_TO, 25);
	plotOptionChartTypeStructure.putString(oFF.VizDefConstants.K_PLACEMENT_STRATEGY, "center");
	plotOptionChartTypeStructure.putBoolean(oFF.VizDefConstants.K_SHOW_IN_LEGEND, true);
	var dataLabels = plotOptionChartTypeStructure.putNewStructure(oFF.VizDefConstants.K_DATA_LABELS);
	dataLabels.putBoolean(oFF.VizDefConstants.K_ENABLED, true);
	dataLabels.putString(oFF.VizDefConstants.K_FORMAT, "{point.percentage:.2f} %");
	dataLabels.putBoolean(oFF.VizDefConstants.K_HIDE_WHEN_OVERLAP, true);
	dataLabels.putInteger(oFF.VizDefConstants.K_DISTANCE, 15);
	var dataLabelsStyle = dataLabels.putNewStructure(oFF.VizDefConstants.K_STYLE);
	dataLabelsStyle.putString(oFF.VizDefConstants.K_FONT_WEIGHT, oFF.VizDefConstants.K_BOLD);
	dataLabelsStyle.putString(oFF.VizDefConstants.K_FONT_FAMILY, "LatoWeb, 'Open Sans', 'Helvetica Neue', Helvetica, Arial, 'sans serif'");
	dataLabelsStyle.putString(oFF.VizDefConstants.K_FONT_SIZE, "12px");
	dataLabelsStyle.putString(oFF.VizDefConstants.K_COLOR, "rgb(88,89,91)");
};
oFF.RsHiChartWordcloudHelper.prototype.finishRendering = function()
{
	var theChartData = this.getChartData();
	var seriesList = theChartData.putNewList(oFF.VizDefConstants.K_SERIES);
	var xList = this.getXList();
	var xlistFormatted = this.getXListFormatted();
	var listSize = xList.size();
	for (var o = 0; o < listSize; o++)
	{
		var polarLayer = seriesList.addNewStructure();
		polarLayer.putString(oFF.VizDefConstants.K_NAME, this.getXMeasures().get(o));
		var newList = polarLayer.putNewList(oFF.VizDefConstants.K_DATA);
		var xListSub = xList.getListAt(o);
		var xListFormattedSub = xlistFormatted.getListAt(o);
		for (var p = 0; p < xListSub.size(); p++)
		{
			var newStruct = newList.addNewStructure();
			var yValue = xListSub.getDoubleAt(p);
			var yValueFormatted = oFF.XDouble.convertToString(yValue);
			if (p < xListFormattedSub.size())
			{
				yValueFormatted = xListFormattedSub.getStringAt(p);
			}
			newStruct.putDouble(oFF.VizDefConstants.K_WEIGHT, yValue);
			newStruct.putString(oFF.VizDefConstants.K_WEIGHT_FORMATTED, yValueFormatted);
			var nameString = this.getCategoriesList().get(p);
			newStruct.putString(oFF.VizDefConstants.K_NAME, nameString);
			newStruct.putString(oFF.VizDefConstants.K_TYPE, this.getChartType());
			this.addToolTipsToSeries(newStruct, o, p);
		}
	}
};

oFF.ReferenceGrid2 = function() {};
oFF.ReferenceGrid2.prototype = new oFF.ReferenceGrid();
oFF.ReferenceGrid2.prototype._ff_c = "ReferenceGrid2";

oFF.ReferenceGrid2.createWithName2 = function(gridName, resultSet)
{
	var grid = new oFF.ReferenceGrid2();
	grid.setupSimpleGrid(resultSet, false, false);
	return grid;
};
oFF.ReferenceGrid2.prototype.prepareCellStructure = function(useRowsHeaderPane, useColumnsHeaderPane)
{
	if (oFF.notNull(this.m_resultSet))
	{
		this.prepareStructure(useRowsHeaderPane, useColumnsHeaderPane);
	}
};
oFF.ReferenceGrid2.prototype.formatDataCellValue = function(dataCell)
{
	var value;
	if (dataCell.getXValue() !== null && dataCell.getXValue().getValueType() === oFF.XValueType.DOUBLE)
	{
		var stringRepresentation = dataCell.getXValue().getStringRepresentation();
		value = oFF.XNumberFormatter.formatDoubleToString(oFF.XDouble.convertFromString(stringRepresentation), "#,#.###");
	}
	else
	{
		value = dataCell.getFormattedValue();
	}
	return value;
};

oFF.SacAnalyticsCell = function() {};
oFF.SacAnalyticsCell.prototype = new oFF.SacTableCell();
oFF.SacAnalyticsCell.prototype._ff_c = "SacAnalyticsCell";

oFF.SacAnalyticsCell._createAnalyticsCell = function(row, referenceColumn)
{
	var instance = new oFF.SacAnalyticsCell();
	instance.setupInternal(row, referenceColumn);
	return instance;
};
oFF.SacAnalyticsCell.prototype.m_sortDirection = null;
oFF.SacAnalyticsCell.prototype.m_repetitiveRows = 0;
oFF.SacAnalyticsCell.prototype.m_repetitiveColumns = 0;
oFF.SacAnalyticsCell.prototype.m_dataCellRef = null;
oFF.SacAnalyticsCell.prototype.setupInternal = function(row, column)
{
	oFF.SacTableCell.prototype.setupInternal.call( this , row, column);
};
oFF.SacAnalyticsCell.prototype.releaseObject = function()
{
	this.m_sortDirection = null;
	this.m_repetitiveRows = 0;
	this.m_repetitiveColumns = 0;
	oFF.SacTableCell.prototype.releaseObject.call( this );
};
oFF.SacAnalyticsCell.prototype.getSortDirection = function()
{
	return this.m_sortDirection;
};
oFF.SacAnalyticsCell.prototype.setSortDirection = function(sortDirection)
{
	this.m_sortDirection = sortDirection;
};
oFF.SacAnalyticsCell.prototype.getRepetitiveRows = function()
{
	return this.m_repetitiveRows;
};
oFF.SacAnalyticsCell.prototype.setRepetitiveRows = function(repetitiveRows)
{
	this.m_repetitiveRows = repetitiveRows;
};
oFF.SacAnalyticsCell.prototype.getRepetitiveColumns = function()
{
	return this.m_repetitiveColumns;
};
oFF.SacAnalyticsCell.prototype.setRepetitiveColumns = function(repetitiveColumns)
{
	this.m_repetitiveColumns = repetitiveColumns;
};
oFF.SacAnalyticsCell.prototype.getDataCellRef = function()
{
	return this.m_dataCellRef;
};
oFF.SacAnalyticsCell.prototype.setDataCellRef = function(dataCellRef)
{
	this.m_dataCellRef = dataCellRef;
};

oFF.SacAnalyticsTable = function() {};
oFF.SacAnalyticsTable.prototype = new oFF.SacTable();
oFF.SacAnalyticsTable.prototype._ff_c = "SacAnalyticsTable";

oFF.SacAnalyticsTable._createAnalyticsTable = function()
{
	var instance = new oFF.SacAnalyticsTable();
	instance.internalSetup();
	return instance;
};
oFF.SacAnalyticsTable.prototype.m_dimensionToColorate = null;
oFF.SacAnalyticsTable.prototype.m_dimensionColorPalette = null;
oFF.SacAnalyticsTable.prototype.m_showDimensionTitles = false;
oFF.SacAnalyticsTable.prototype.m_headerCompactionType = null;
oFF.SacAnalyticsTable.prototype.m_tupleColumns = null;
oFF.SacAnalyticsTable.prototype.m_tupleRows = null;
oFF.SacAnalyticsTable.prototype.m_rowIndices = null;
oFF.SacAnalyticsTable.prototype.m_columnIndices = null;
oFF.SacAnalyticsTable.prototype.m_lastRowToFetch = 0;
oFF.SacAnalyticsTable.prototype.m_lastColumnToFetch = 0;
oFF.SacAnalyticsTable.prototype.m_columnTuplesCount = 0;
oFF.SacAnalyticsTable.prototype.m_columnsTotalCount = 0;
oFF.SacAnalyticsTable.prototype.m_rowsTotalCount = 0;
oFF.SacAnalyticsTable.prototype.m_emptyRowDimensions = false;
oFF.SacAnalyticsTable.prototype.m_emptyColumnDimensions = false;
oFF.SacAnalyticsTable.prototype.m_columnHeaderAggregation = null;
oFF.SacAnalyticsTable.prototype.m_rowHeaderAggregation = null;
oFF.SacAnalyticsTable.prototype.m_rowKeys = null;
oFF.SacAnalyticsTable.prototype.m_columnKeys = null;
oFF.SacAnalyticsTable.prototype.m_caps = null;
oFF.SacAnalyticsTable.prototype.m_columnValueAggregations = null;
oFF.SacAnalyticsTable.prototype.m_rowValueAggregations = null;
oFF.SacAnalyticsTable.prototype.m_columnDimensionMemberIndex = null;
oFF.SacAnalyticsTable.prototype.m_rowDimensionMemberIndex = null;
oFF.SacAnalyticsTable.prototype.m_sortDirections = null;
oFF.SacAnalyticsTable.prototype.m_queryModel = null;
oFF.SacAnalyticsTable.prototype.m_hasDataForRows = false;
oFF.SacAnalyticsTable.prototype.m_localRowList = null;
oFF.SacAnalyticsTable.prototype.m_hasData = false;
oFF.SacAnalyticsTable.prototype.m_headerEndRow = 0;
oFF.SacAnalyticsTable.prototype.m_totalRowDiff = 0;
oFF.SacAnalyticsTable.prototype.m_tableDefinition = null;
oFF.SacAnalyticsTable.prototype.m_overwriteTexts = null;
oFF.SacAnalyticsTable.prototype.m_userProfile = null;
oFF.SacAnalyticsTable.prototype.m_currentRowsOffset = 0;
oFF.SacAnalyticsTable.prototype.m_partial = false;
oFF.SacAnalyticsTable.prototype.m_scaleTextsMap = null;
oFF.SacAnalyticsTable.prototype.m_memberSortIconsLevel = 0;
oFF.SacAnalyticsTable.prototype.m_activeVersions = null;
oFF.SacAnalyticsTable.prototype.m_columnKeysSize = 0;
oFF.SacAnalyticsTable.prototype.m_rowKeysSize = 0;
oFF.SacAnalyticsTable.prototype.m_totalRowsCountMayBeInaccurate = false;
oFF.SacAnalyticsTable.prototype.m_totalColumnsCountMayBeInaccurate = false;
oFF.SacAnalyticsTable.prototype.m_dateFormatter = null;
oFF.SacAnalyticsTable.prototype.m_timeFormatter = null;
oFF.SacAnalyticsTable.prototype.m_dateTimeFormatter = null;
oFF.SacAnalyticsTable.prototype.internalSetup = function()
{
	oFF.SacTable.prototype.internalSetup.call( this );
	this.m_tupleColumns = oFF.XList.create();
	this.m_tupleRows = oFF.XList.create();
	this.m_localRowList = oFF.XList.create();
	this.m_dimensionColorPalette = oFF.XListOfString.create();
	this.m_overwriteTexts = oFF.XHashMapOfStringByString.create();
	this.m_headerCompactionType = oFF.TableHeaderCompactionType.PREFERABLY_COLUMN;
};
oFF.SacAnalyticsTable.prototype.needsEmptyHeaderRow = function()
{
	return this.m_headerCompactionType === oFF.TableHeaderCompactionType.NONE || this.m_headerCompactionType === oFF.TableHeaderCompactionType.COLUMN || !this.m_emptyRowDimensions && this.m_showDimensionTitles && this.m_headerCompactionType === oFF.TableHeaderCompactionType.PREFERABLY_COLUMN || !this.m_emptyRowDimensions && this.m_emptyColumnDimensions && this.m_showDimensionTitles;
};
oFF.SacAnalyticsTable.prototype.needsEmptyHeaderColumn = function()
{
	return this.m_headerCompactionType === oFF.TableHeaderCompactionType.NONE || this.m_headerCompactionType === oFF.TableHeaderCompactionType.ROW || !this.m_emptyColumnDimensions && this.m_showDimensionTitles && this.m_headerCompactionType === oFF.TableHeaderCompactionType.PREFERABLY_ROW || !this.m_emptyColumnDimensions && this.m_emptyRowDimensions && this.m_showDimensionTitles;
};
oFF.SacAnalyticsTable.prototype.releaseObject = function()
{
	this.m_userProfile = null;
	this.m_dimensionToColorate = null;
	this.m_dimensionColorPalette = oFF.XObjectExt.release(this.m_dimensionColorPalette);
	this.m_showDimensionTitles = false;
	this.m_lastRowToFetch = -1;
	this.m_columnTuplesCount = -1;
	this.m_columnsTotalCount = -1;
	this.m_rowsTotalCount = -1;
	this.m_emptyRowDimensions = false;
	this.m_emptyColumnDimensions = false;
	this.m_columnHeaderAggregation = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_columnHeaderAggregation);
	this.m_rowHeaderAggregation = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_rowHeaderAggregation);
	this.m_rowKeys = oFF.XObjectExt.release(this.m_rowKeys);
	this.m_columnKeys = oFF.XObjectExt.release(this.m_columnKeys);
	this.m_caps = null;
	this.m_columnValueAggregations = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_columnValueAggregations);
	this.m_rowValueAggregations = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_rowValueAggregations);
	this.m_columnDimensionMemberIndex = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_columnDimensionMemberIndex);
	this.m_rowDimensionMemberIndex = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_rowDimensionMemberIndex);
	this.m_scaleTextsMap.clear();
	this.m_sortDirections = oFF.XObjectExt.release(this.m_sortDirections);
	this.m_queryModel = null;
	this.m_hasDataForRows = false;
	this.m_localRowList = oFF.XObjectExt.release(this.m_localRowList);
	this.m_hasData = false;
	this.m_headerEndRow = -1;
	this.m_totalRowDiff = 0;
	this.m_tableDefinition = null;
	oFF.SacTable.prototype.releaseObject.call( this );
};
oFF.SacAnalyticsTable.prototype.preFill = function(rs)
{
	var columnDimensions = rs.getCursorColumnsAxis().getRsDimensions();
	var rowDimensions = rs.getCursorRowsAxis().getRsDimensions();
	this.clearColumnHeaderGroupNames();
	this.clearRowHeaderGroupNames();
	oFF.XCollectionUtils.forEach(columnDimensions,  function(cd){
		this.addColumnHeaderGroupName(cd.getName());
	}.bind(this));
	oFF.XCollectionUtils.forEach(rowDimensions,  function(rd){
		this.addRowHeaderGroupName(rd.getName());
	}.bind(this));
	var columnDimensionCount = columnDimensions.size();
	var rowDimensionCount = rowDimensions.size();
	var rowTuplesCountLocal = oFF.XMath.max(rs.getDataRows(), rs.getCursorRowsAxis().getTuplesCount());
	this.m_columnTuplesCount = oFF.XMath.max(rs.getDataColumns(), rs.getCursorColumnsAxis().getTuplesCount());
	this.m_hasDataForRows = rowTuplesCountLocal > 0 && (this.m_columnTuplesCount > 0 || rowDimensionCount > 0);
	this.m_rowsTotalCount = -1;
	this.m_columnsTotalCount = -1;
	this.retrieveRowsTotalCount(rs);
	this.retrieveColumnsTotalCount(rs);
	this.m_columnDimensionMemberIndex = oFF.XHashMapByString.create();
	this.m_rowDimensionMemberIndex = oFF.XHashMapByString.create();
	this.m_sortDirections = oFF.XHashMapByString.create();
	this.clear();
	this.m_columnValueAggregations = oFF.XList.create();
	this.m_rowValueAggregations = oFF.XList.create();
	this.m_queryModel = rs.getQueryModel();
	this.m_caps = this.m_queryModel.getModelCapabilities();
	this.analyzeSortingOperations();
	var planningModel = this.m_queryModel.getQueryManager().getPlanningModel();
	this.m_activeVersions = oFF.isNull(planningModel) ? null : planningModel.getActiveVersions();
	this.m_lastRowToFetch = oFF.XMath.max(1, rowTuplesCountLocal);
	this.m_rowHeaderAggregation = oFF.SacTableAggregation.getDimHeader(rs.getCursorRowsAxis(), this.m_queryModel, this.m_overwriteTexts);
	this.m_columnHeaderAggregation = oFF.SacTableAggregation.getDimHeader(rs.getCursorColumnsAxis(), this.m_queryModel, this.m_overwriteTexts);
	this.m_columnKeys = this.m_columnHeaderAggregation.getKeysAsReadOnlyListOfString();
	this.m_rowKeys = this.m_rowHeaderAggregation.getKeysAsReadOnlyListOfString();
	this.m_hasData = this.m_columnTuplesCount > 0 && columnDimensionCount > 0 || rowTuplesCountLocal > 0 && rowDimensionCount > 0;
	if (this.m_hasData)
	{
		this.applyTableMarkups();
		this.createHeaderColumns();
		this.prepareDataColumns(rs, 0, -1);
		this.postFormatHeaderRows();
	}
	this.createScaleTextsMap();
	return this.m_hasData;
};
oFF.SacAnalyticsTable.prototype.applyHighlighting = function()
{
	if (this.getAvailableHighlightAreas() !== null)
	{
		var vizIterator = this.getAvailableHighlightAreas().getIterator();
		this.clearHighlightAreas();
		while (vizIterator.hasNext())
		{
			oFF.OlapVizToPivotConverterUtil.applyHighlightingFromViz(vizIterator.next(), this.addNewHighlightArea());
		}
	}
};
oFF.SacAnalyticsTable.prototype.applyTableMarkups = function()
{
	if (this.getAvailableTableMarkups() !== null)
	{
		var vizIterator = this.getAvailableTableMarkups().getIterator();
		while (vizIterator.hasNext())
		{
			oFF.OlapVizToPivotConverterUtil.applyTableMarkupFromViz(vizIterator.next(), this.addNewTableMarkup());
		}
	}
};
oFF.SacAnalyticsTable.prototype.prepareDataColumns = function(rs, offsetOrig, upperBound)
{
	var newOffset = this.createDataColumns(rs, offsetOrig, upperBound);
	this.fillHeaderRows(newOffset, this.m_lastColumnToFetch);
	return newOffset;
};
oFF.SacAnalyticsTable.prototype.formatTable = function(rowFrom, rowTo, colFrom, colTo)
{
	this.updateHeaderColumnStyles();
	var i;
	var newColFrom = colFrom;
	var newColTo = colTo;
	var newRowFrom = rowFrom;
	var newRowTo = rowTo;
	for (i = colFrom; i < this.m_tupleColumns.size(); i++)
	{
		if (this.m_tupleColumns.get(i) !== null)
		{
			newColFrom = this.getColumnList().getIndex(this.m_tupleColumns.get(i));
			break;
		}
	}
	for (i = colTo; i > -1; i--)
	{
		if (this.m_tupleColumns.get(i) !== null)
		{
			newColTo = this.getColumnList().getIndex(this.m_tupleColumns.get(i));
			break;
		}
	}
	for (i = rowFrom; i < this.m_tupleRows.size(); i++)
	{
		if (this.m_tupleRows.get(i) !== null)
		{
			newRowFrom = this.getRowList().getIndex(this.m_tupleRows.get(i));
			break;
		}
	}
	for (i = rowTo; i > -1; i--)
	{
		if (this.m_tupleRows.get(i) !== null)
		{
			newRowTo = this.getRowList().getIndex(this.m_tupleRows.get(i));
			break;
		}
	}
	this.updateColumStyles(newColFrom, newColTo);
	this.updateRowStyles(newRowFrom, newRowTo);
	this.updateHeaderRowStyles();
};
oFF.SacAnalyticsTable.prototype.postFormatHeaderRows = function()
{
	var headerRows = this.getHeaderRowList();
	var headerColSize = this.getHeaderColumnList().size();
	for (var i = 0; i < headerRows.size(); i++)
	{
		var merger = 0;
		var headerRow = headerRows.get(i);
		var cellsList = headerRow.getCells();
		if (cellsList.size() === 0)
		{
			break;
		}
		var cell = cellsList.get(0);
		var subCell;
		if (i === 0 && cell.getType() === -1)
		{
			for (merger = 0; merger + 1 < cellsList.size(); merger++)
			{
				subCell = cellsList.get(merger + 1);
				if (subCell.getType() !== -1)
				{
					break;
				}
			}
			cell.setRepetitiveColumns(merger);
		}
		for (var j = headerColSize; j < cellsList.size(); j++)
		{
			cell = cellsList.get(j);
			if (!cell.isRepeatedHeader())
			{
				for (merger = 0; j + merger + 1 < cellsList.size(); merger++)
				{
					subCell = cellsList.get(j + merger + 1);
					var parentColumn = subCell.getParentColumn();
					if (parentColumn.getTupleIndex() > -1 && !subCell.isRepeatedHeader())
					{
						break;
					}
				}
				j = j + merger;
				cell.setRepetitiveColumns(merger);
			}
		}
	}
};
oFF.SacAnalyticsTable.prototype.postFormatHeaderColumns = function()
{
	var headerRowList = this.getHeaderRowList();
	var dataRowList = this.getRowList();
	var cell;
	var subCell;
	var baseRow;
	var merger;
	var columnsSize = this.getHeaderColumnList().size();
	if (columnsSize > 0 && oFF.XCollectionUtils.hasElements(headerRowList))
	{
		baseRow = headerRowList.get(0);
		cell = baseRow.getCells().get(0);
		if (cell.getType() === -1)
		{
			for (merger = 0; merger + 1 < headerRowList.size(); merger++)
			{
				subCell = headerRowList.get(merger + 1).getCells().get(0);
				if (subCell.getType() !== -1)
				{
					break;
				}
			}
			cell.setRepetitiveRows(merger);
		}
	}
	for (var i = 0; i < columnsSize; i++)
	{
		if (oFF.XCollectionUtils.hasElements(dataRowList))
		{
			for (var j = 0; j < dataRowList.size(); j++)
			{
				baseRow = dataRowList.get(j);
				if (oFF.isNull(baseRow))
				{
					continue;
				}
				cell = baseRow.getCells().get(i);
				if (!cell.isRepeatedHeader())
				{
					for (merger = 0; j + merger + 1 < dataRowList.size(); merger++)
					{
						var subRow = dataRowList.get(j + merger + 1);
						if (oFF.isNull(subRow))
						{
							break;
						}
						subCell = subRow.getCells().get(i);
						if (subRow.getTupleIndex() > -1 && !subCell.isRepeatedHeader())
						{
							break;
						}
					}
					j = j + merger;
					cell.setRepetitiveRows(merger);
				}
			}
		}
	}
};
oFF.SacAnalyticsTable.prototype.analyzeSortingOperations = function()
{
	var sortingManager = this.m_queryModel.getSortingManager();
	var sortingOperations = sortingManager.getSortingOperations();
	var i;
	var sortDim;
	for (i = 0; i < sortingOperations.size(); i++)
	{
		var sortOp = sortingOperations.get(i);
		var direction = sortOp.getDirection();
		if (sortOp.getCustomSort() !== null)
		{
			continue;
		}
		else if (sortOp.getSortingType().isTypeOf(oFF.SortType.MEMBER_KEY))
		{
			sortDim = sortOp.getDimension();
			if (this.checkAbstractDimensionSort(sortDim, sortingManager))
			{
				oFF.XStream.of(sortOp.getDimension().getMainAttribute().getFields()).filter( function(fi){
					return fi.getPresentationType().isTypeOf(oFF.PresentationType.ABSTRACT_KEY);
				}.bind(this)).forEach( function(fil){
					this.getSortDirections().put(fil.getName(), direction);
				}.bind(this));
			}
		}
		else if (sortOp.getSortingType().isTypeOf(oFF.SortType.MEMBER_TEXT))
		{
			sortDim = sortOp.getDimension();
			if (this.checkAbstractDimensionSort(sortDim, sortingManager))
			{
				oFF.XStream.of(sortOp.getDimension().getMainAttribute().getFields()).filter( function(fi2){
					return fi2.getPresentationType().isTypeOf(oFF.PresentationType.ABSTRACT_TEXT);
				}.bind(this)).forEach( function(fil2){
					this.getSortDirections().put(fil2.getName(), direction);
				}.bind(this));
			}
		}
		else if (sortOp.getSortingType().isTypeOf(oFF.SortType.FIELD))
		{
			var field = sortOp.getField();
			sortDim = field.getDimension();
			if (this.checkAbstractDimensionSort(sortDim, sortingManager))
			{
				this.getSortDirections().put(field.getName(), direction);
			}
		}
		else if (sortOp.getSortingType().isTypeOf(oFF.SortType.DATA_CELL_VALUE))
		{
			var pathUniqueName = oFF.SacTableAggregation.getSimplifiedUniqueName(sortOp.getElementPath());
			this.getSortDirections().put(pathUniqueName, direction);
		}
		else if (sortOp.getSortingType().isTypeOf(oFF.SortType.MEASURE))
		{
			var measure = sortOp.getMeasure();
			this.getSortDirections().put(measure.getName(), direction);
		}
	}
};
oFF.SacAnalyticsTable.prototype.checkAbstractDimensionSort = function(sortDim, sortingManager)
{
	return !sortingManager.hasConflictingSortingOperationForDimension(sortDim) && (this.m_queryModel.getRowsAxis().contains(sortDim) || this.m_queryModel.getColumnsAxis().contains(sortDim));
};
oFF.SacAnalyticsTable.prototype.createHeaderColumns = function()
{
	this.m_rowKeysSize = this.m_rowKeys.size();
	this.m_columnKeysSize = this.m_columnKeys.size();
	this.m_emptyRowDimensions = this.m_rowKeysSize === 0;
	this.m_emptyColumnDimensions = this.m_columnKeysSize === 0;
	var preColumnsAmount = this.m_rowKeysSize + (this.needsEmptyHeaderColumn() ? 1 : 0);
	var preRowsAmount = this.m_columnKeysSize + (this.needsEmptyHeaderRow() ? 1 : 0);
	this.setPreColumnsAmount(preColumnsAmount);
	this.setPreRowsAmount(preRowsAmount);
	for (var j = 0; j < this.getPreColumnsAmount(); j++)
	{
		this.createNewAnalyticHeaderColumn();
	}
};
oFF.SacAnalyticsTable.prototype.fillHeaderRows = function(offsetOrig, maxTupleId)
{
	var dimensionMemberType;
	var valueAggregationElement;
	var i;
	var row;
	var cell;
	var needsCreateHeaderRows = this.getHeaderRowList().size() === 0 && this.getPreRowsAmount() > 0;
	if (needsCreateHeaderRows)
	{
		for (i = 0; i < this.getPreRowsAmount(); i++)
		{
			this.addNewAnalyticHeaderRow();
		}
	}
	var field;
	var sortDirection;
	var dimension;
	var headerAggregation;
	for (i = 0; i < this.m_columnKeysSize; i++)
	{
		row = this.getHeaderRowList().get(i);
		headerAggregation = this.m_columnHeaderAggregation.getByKey(this.m_columnKeys.get(i));
		field = headerAggregation.getField();
		row.setFieldName(field.getName());
		row.setDimensionIndex(headerAggregation.getDimensionIndex());
		oFF.OlapVizToPivotConverterUtil.applyHeaderSectionInfoFromField(field, row);
		if (this.getPreColumnsAmount() > 0 && this.m_showDimensionTitles)
		{
			cell = row.getCells().get(this.getPreColumnsAmount() - 1);
			if (oFF.isNull(cell))
			{
				continue;
			}
			cell.setAllowDragDrop(true);
			cell.setType(headerAggregation.isMainAttribute() ? oFF.SacTableConstants.CT_COL_DIM_HEADER : oFF.SacTableConstants.CT_ATTRIBUTE_COL_DIM_HEADER);
			cell.getTableStyle().setHorizontalAlignment(oFF.SacTableCellHorizontalAlignment.RIGHT);
			cell.getTableStyle().setVerticalAlignment(oFF.SacTableCellVerticalAlignment.BOTTOM);
			cell.setPlainString(headerAggregation.getPlain());
			cell.setFormatted(headerAggregation.getText());
			dimension = headerAggregation.getDimension();
			if ((headerAggregation.isMainAttribute() && this.m_caps.supportsDimensionSorting(dimension, field.getPresentationType().isTypeOf(oFF.PresentationType.ABSTRACT_KEY) ? oFF.SortType.MEMBER_KEY : oFF.SortType.MEMBER_TEXT) || this.m_caps.supportsFieldSorting(field)) && !dimension.isStructure() && !dimension.getDimensionType().isTypeOf(oFF.DimensionType.ACCOUNT) && !dimension.getDimensionType().isTypeOf(oFF.DimensionType.GENERAL_VERSION) && this.m_columnsTotalCount > 1)
			{
				sortDirection = this.m_sortDirections.getByKey(field.getName());
				if (oFF.isNull(sortDirection))
				{
					sortDirection = oFF.XSortDirection.DEFAULT_VALUE;
				}
				cell.setSortDirection(sortDirection);
				cell.setLengthAddition(3);
			}
			else
			{
				cell.setLengthAddition(1);
			}
		}
	}
	var offset = offsetOrig;
	if (oFF.XCollectionUtils.hasElements(this.m_columnValueAggregations) && this.m_columnValueAggregations.size() > offsetOrig + 1 && this.m_columnValueAggregations.get(offset) === null)
	{
		offset = offset + 1;
	}
	var valueAggregation = null;
	var cells;
	var columnObject;
	var h;
	for (i = 0; i < this.m_columnKeysSize; i++)
	{
		row = this.getHeaderRowList().get(i);
		cells = row.getCells();
		var isAxisValidForMemberSort = this.isAxisValidForMemberSort(this.m_queryModel.getRowsAxis());
		for (h = this.getHeaderColumnList().size() + offset; h < cells.size(); h++)
		{
			cell = cells.get(h);
			if (oFF.isNull(cell))
			{
				continue;
			}
			columnObject = cell.getParentColumn();
			var columnTupleIndex = columnObject.getTupleIndex();
			if (maxTupleId > -1 && columnTupleIndex > maxTupleId)
			{
				break;
			}
			if (columnTupleIndex > -1)
			{
				valueAggregation = this.m_columnValueAggregations.get(columnTupleIndex);
				valueAggregationElement = valueAggregation.getByKey(this.m_columnKeys.get(i));
				var dimensionName = valueAggregationElement.getDimension().getName();
				if (!this.m_columnDimensionMemberIndex.containsKey(dimensionName))
				{
					this.m_columnDimensionMemberIndex.put(dimensionName, oFF.XHashMapByString.create());
				}
				var indexElement = this.m_columnDimensionMemberIndex.getByKey(dimensionName);
				var dimensionMemberName = valueAggregationElement.getDimensionMemberName();
				if (!indexElement.containsKey(dimensionMemberName))
				{
					indexElement.put(dimensionMemberName, oFF.XList.create());
				}
				indexElement.getByKey(dimensionMemberName).add(oFF.XIntegerValue.create(h));
				dimensionMemberType = valueAggregationElement.getDimensionMemberType();
				if (dimensionMemberType.isTypeOf(oFF.MemberType.RESULT) || oFF.OlapComponentType.TOTALS === dimensionMemberType)
				{
					columnObject.setTotalLevel(i);
					columnObject.setTotalsContext(true);
					cell.setTotalsContext(true);
				}
				cell.setAllowDragDrop(true);
				cell.setType(valueAggregationElement.isMainAttribute() ? oFF.SacTableConstants.CT_COL_DIM_MEMBER : oFF.SacTableConstants.CT_ATTRIBUTE_COL_DIM_MEMBER);
				cell.getTableStyle().setHorizontalAlignment(oFF.SacTableCellHorizontalAlignment.RIGHT);
				cell.getTableStyle().setVerticalAlignment(oFF.SacTableCellVerticalAlignment.BOTTOM);
				cell.setRepeatedHeader(valueAggregationElement.isRepeatedMemberName());
				cell.setPlainString(valueAggregationElement.getPlain());
				cell.setFormatted(this.getTextWithSuffix(valueAggregationElement));
				if (isAxisValidForMemberSort && (this.m_caps.supportsDataCellSorting() && i + 1 === this.m_columnKeysSize || !this.m_caps.supportsDataCellSorting() && this.m_caps.supportsMeasureSorting() && valueAggregationElement.getDimension().isMeasureStructure() && !cell.isRepeatedHeader()) && this.m_rowsTotalCount > 1)
				{
					sortDirection = this.m_sortDirections.getByKey(valueAggregationElement.getPathKey());
					if (oFF.isNull(sortDirection) || sortDirection === oFF.XSortDirection.DEFAULT_VALUE)
					{
						sortDirection = this.m_sortDirections.getByKey(valueAggregationElement.getDimensionMemberName());
					}
					if (oFF.isNull(sortDirection))
					{
						sortDirection = oFF.XSortDirection.DEFAULT_VALUE;
					}
					cell.setSortDirection(sortDirection);
					cell.setLengthAddition(3);
				}
				else
				{
					cell.setLengthAddition(1);
				}
				var drillState = valueAggregationElement.getDrillState();
				dimensionMemberType = valueAggregationElement.getDimensionMemberType();
				dimension = valueAggregationElement.getDimension();
				var hierarchyActive = dimension.isHierarchyActive() || dimension.isUniversalDisplayHierarchyDimension();
				this.setReversedHierarchy(this.checkReversedHierarchyForDimension(dimension));
				var isInHierarchy = valueAggregationElement.isMainAttribute() && oFF.notNull(drillState) && hierarchyActive;
				if (isInHierarchy)
				{
					var displayLevel = valueAggregationElement.getDisplayLevel();
					cell.setLengthAddition(2 * displayLevel + cell.getLengthAddition());
					cell.setInHierarchy(true);
					cell.setHierarchyLevel(displayLevel);
					cell.setHierarchyPaddingType(oFF.SacTableConstants.C_N_HIERARCHY_PADDING_TOP);
					cell.setHierarchyPaddingValue(oFF.SacTableConstants.DF_C_N_HIERARCHY_PADDING_TOP);
					cell.setShowDrillIcon(oFF.notNull(drillState) && drillState !== oFF.DrillState.LEAF && oFF.MemberType.RESULT !== dimensionMemberType && oFF.OlapComponentType.TOTALS !== dimensionMemberType);
					cell.setExpanded(drillState === oFF.DrillState.EXPANDED || drillState === oFF.DrillState.DRILLED);
				}
				var newHeight = (isInHierarchy ? oFF.SacTableConstants.DF_C_N_HIERARCHY_PADDING_TOP : 0) + oFF.SacTableConstants.DF_R_N_HEIGHT + oFF.XMath.div(oFF.SacTableConstants.DF_R_N_HEIGHT * 2 * valueAggregationElement.getDisplayLevel(), 3) + valueAggregationElement.getDisplayLevel() * 3;
				if (row.getHeight() < newHeight)
				{
					row.setDefaultHeight(newHeight);
				}
			}
		}
	}
	if (!this.m_emptyRowDimensions)
	{
		for (i = 0; i < this.m_rowKeysSize; i++)
		{
			headerAggregation = this.m_rowHeaderAggregation.getByKey(this.m_rowKeys.get(i));
			columnObject = this.getHeaderColumnList().get(i);
			field = headerAggregation.getField();
			columnObject.setFieldName(field.getName());
			columnObject.setDimensionIndex(headerAggregation.getDimensionIndex());
			oFF.OlapVizToPivotConverterUtil.applyHeaderSectionInfoFromField(field, columnObject);
		}
	}
	if (needsCreateHeaderRows && this.m_showDimensionTitles && this.m_rowKeysSize > 0)
	{
		row = this.getHeaderRowList().get(this.getPreRowsAmount() - 1);
		row.setTupleIndex(-1);
		row.setDefaultHeight(oFF.SacTableConstants.DF_R_N_HEIGHT);
		for (i = 0; i < this.m_rowKeysSize; i++)
		{
			headerAggregation = this.m_rowHeaderAggregation.getByKey(this.m_rowKeys.get(i));
			field = headerAggregation.getField();
			cell = row.getCells().get(i);
			cell.setAllowDragDrop(true);
			cell.setType(headerAggregation.isMainAttribute() ? oFF.SacTableConstants.CT_ROW_DIM_HEADER : oFF.SacTableConstants.CT_ATTRIBUTE_ROW_DIM_HEADER);
			cell.getTableStyle().setHorizontalAlignment(oFF.SacTableCellHorizontalAlignment.LEFT);
			cell.getTableStyle().setVerticalAlignment(oFF.SacTableCellVerticalAlignment.BOTTOM);
			cell.setPlainString(headerAggregation.getPlain());
			cell.setFormatted(headerAggregation.getText());
			dimension = headerAggregation.getDimension();
			if ((headerAggregation.isMainAttribute() && this.m_caps.supportsDimensionSorting(dimension, field.getPresentationType().isTypeOf(oFF.PresentationType.ABSTRACT_KEY) ? oFF.SortType.MEMBER_KEY : oFF.SortType.MEMBER_TEXT) || this.m_caps.supportsFieldSorting(field)) && !dimension.isStructure() && !dimension.getDimensionType().isTypeOf(oFF.DimensionType.ACCOUNT) && !dimension.getDimensionType().isTypeOf(oFF.DimensionType.GENERAL_VERSION) && this.m_rowsTotalCount > 1)
			{
				sortDirection = this.m_sortDirections.getByKey(field.getName());
				if (oFF.isNull(sortDirection))
				{
					sortDirection = oFF.XSortDirection.DEFAULT_VALUE;
				}
				cell.setSortDirection(sortDirection);
				cell.setLengthAddition(3);
			}
			else
			{
				cell.setLengthAddition(1);
			}
		}
		if (this.m_emptyColumnDimensions && this.m_showDimensionTitles && this.m_rowKeysSize > 0 && this.m_hasData)
		{
			cells = row.getCells();
			if (cells.size() > this.getPreColumnsAmount())
			{
				cell = cells.get(this.getPreColumnsAmount());
				cell.setType(oFF.SacTableConstants.CT_EMPTY_AXIS_COLUMN_HEADER);
				cell.setAllowDragDrop(true);
			}
		}
	}
	this.m_headerEndRow = this.m_columnKeysSize - 1;
	this.formatHeaderColumnWidths();
};
oFF.SacAnalyticsTable.prototype.getTextWithSuffix = function(valueAggregationElement)
{
	if (oFF.XCollectionUtils.hasElements(this.m_activeVersions) && valueAggregationElement.getDimension().getDimensionType().isTypeOf(oFF.DimensionType.GENERAL_VERSION) && oFF.XStream.of(this.m_activeVersions).anyMatch( function(av){
		return (oFF.XString.isEqual(av.getVersionDescription(), valueAggregationElement.getPlain()) || oFF.XString.isEqual(av.getVersionUniqueName(), valueAggregationElement.getPlain()) || oFF.XString.isEqual(av.getVersionDescription(), valueAggregationElement.getText())) && av.getVersionState() === oFF.PlanningVersionState.CHANGED;
	}.bind(this)))
	{
		return oFF.XStringUtils.concatenate2(valueAggregationElement.getText(), " *");
	}
	else
	{
		return valueAggregationElement.getText();
	}
};
oFF.SacAnalyticsTable.prototype.isAxisValidForMemberSort = function(orthogonalAxis)
{
	var valid;
	if (this.m_memberSortIconsLevel === oFF.SacTableConstants.N_MEMBER_SORT_ICONS_NONE)
	{
		valid = false;
	}
	else if (this.m_memberSortIconsLevel === oFF.SacTableConstants.N_MEMBER_SORT_ICONS_MAXIMAL)
	{
		valid = true;
	}
	else
	{
		var dimOnAxis = this.checkDimensionOnAxis(orthogonalAxis, this.m_queryModel.getVersionDimension());
		dimOnAxis = dimOnAxis || this.checkDimensionOnAxis(orthogonalAxis, this.m_queryModel.getAccountDimension());
		dimOnAxis = dimOnAxis || this.checkDimensionOnAxis(orthogonalAxis, this.m_queryModel.getMeasureDimension());
		dimOnAxis = dimOnAxis || this.checkDimensionOnAxis(orthogonalAxis, this.m_queryModel.getNonMeasureDimension());
		if (this.m_memberSortIconsLevel === oFF.SacTableConstants.N_MEMBER_SORT_ICONS_EXTENSIVE)
		{
			valid = !dimOnAxis;
		}
		else
		{
			valid = !dimOnAxis && orthogonalAxis === this.m_queryModel.getRowsAxis() && this.m_queryModel.getColumnsAxis().size() === 1;
		}
	}
	return valid;
};
oFF.SacAnalyticsTable.prototype.checkDimensionOnAxis = function(rowsAxis, dimension)
{
	return rowsAxis.contains(dimension) && this.checkHasRelevantMembers(dimension);
};
oFF.SacAnalyticsTable.prototype.checkHasRelevantMembers = function(dimension)
{
	var structMembers = dimension.getAllStructureMembers();
	var hasExactlyOne = oFF.notNull(structMembers) && structMembers.size() === 1;
	if (!hasExactlyOne)
	{
		var dynFilter = this.m_queryModel.getFilter().getDynamicFilter();
		var cartProd = oFF.isNull(dynFilter) ? null : dynFilter.getCartesianProduct();
		var structureFilter = oFF.isNull(cartProd) ? null : cartProd.getCartesianList(dimension);
		hasExactlyOne = oFF.notNull(structureFilter) && structureFilter.size() === 1;
	}
	return !hasExactlyOne;
};
oFF.SacAnalyticsTable.prototype.fillDataRows = function(rs, offsetOrig)
{
	this.prepareDataRows(rs, offsetOrig, -1);
	this.fillDataCells(rs, offsetOrig, 0);
	return this.m_currentRowsOffset;
};
oFF.SacAnalyticsTable.prototype.createDataColumns = function(rs, offsetOrig, upperBound)
{
	if (oFF.isNull(this.m_columnIndices))
	{
		this.m_columnIndices = oFF.XList.create();
	}
	else if (offsetOrig === 0)
	{
		this.m_columnIndices.clear();
	}
	var offset = offsetOrig;
	this.m_lastColumnToFetch = oFF.XMath.max(1, offsetOrig + rs.getCursorColumnsAxis().getTuplesCount());
	if (upperBound > -1)
	{
		this.m_lastColumnToFetch = oFF.XMath.min(upperBound + 1, this.m_lastColumnToFetch);
	}
	if (this.m_columnsTotalCount === -1 || this.m_columnsTotalCount > offsetOrig)
	{
		this.preFillAxis(rs.getCursorColumnsAxis(), this.m_columnHeaderAggregation, this.m_columnValueAggregations, rs.getResultSetContainer().getOffsetColumns());
		if (oFF.XCollectionUtils.hasElements(this.m_columnValueAggregations) && this.m_columnValueAggregations.get(offsetOrig) === null)
		{
			offset = offsetOrig + 1;
		}
		var columnObject;
		var tupleIndex = offset;
		var insertPosition = this.prepareColumnInsertOffsetForTupleIndex(offset);
		for (; tupleIndex < this.m_lastColumnToFetch; tupleIndex++, insertPosition++)
		{
			var newIndex = oFF.XIntegerValue.create(tupleIndex);
			if (this.m_columnIndices.contains(newIndex))
			{
				oFF.XLogger.println(oFF.XStringUtils.concatenate2("DUPLICATE ", newIndex.toString()));
			}
			else
			{
				this.m_columnIndices.add(newIndex);
			}
			var valueAggregation = oFF.XCollectionUtils.hasElements(this.m_columnValueAggregations) ? this.m_columnValueAggregations.get(tupleIndex) : null;
			columnObject = this.addNewAnalyticDataColumnAtTupleIndex(tupleIndex, insertPosition);
			oFF.OlapVizToPivotConverterUtil.applyDataSectionInfoFromTuple(valueAggregation, this.m_columnKeys, columnObject);
			var cellChartMember = this.extractStructureMemberWithCellChart(valueAggregation);
			if (oFF.notNull(cellChartMember))
			{
				this.fillCellChart(columnObject, cellChartMember);
			}
			columnObject.setTupleIndex(tupleIndex);
		}
	}
	return offset;
};
oFF.SacAnalyticsTable.prototype.prepareDataRows = function(rs, offsetOrig, upperBound)
{
	if (oFF.isNull(this.m_rowIndices))
	{
		this.m_rowIndices = oFF.XList.create();
	}
	else if (offsetOrig === 0)
	{
		this.m_rowIndices.clear();
	}
	var offset = offsetOrig;
	this.m_lastRowToFetch = oFF.XMath.max(1, rs.getResultSetContainer().getOffsetRows() + rs.getCursorRowsAxis().getTuplesCount());
	if (upperBound > -1)
	{
		this.m_lastRowToFetch = oFF.XMath.min(this.m_lastRowToFetch, upperBound + 1);
	}
	if (this.m_rowsTotalCount === -1 || this.m_rowsTotalCount > offsetOrig)
	{
		this.preFillAxis(rs.getCursorRowsAxis(), this.m_rowHeaderAggregation, this.m_rowValueAggregations, rs.getResultSetContainer().getOffsetRows());
		if (this.m_hasDataForRows)
		{
			if (!this.m_emptyRowDimensions && this.m_rowValueAggregations.get(offsetOrig) === null)
			{
				offset = offsetOrig + 1;
			}
			var valueAggregationElement;
			var i;
			var rowObject;
			var cellObject;
			var h = offset;
			var insertPosition = this.prepareRowInsertOffsetForTupleIndex(offset);
			var isAxisValidForMemberSort = this.isAxisValidForMemberSort(this.m_queryModel.getColumnsAxis());
			for (; h < this.m_lastRowToFetch; h++, insertPosition++)
			{
				var newIndex = oFF.XIntegerValue.create(h);
				if (this.m_rowIndices.contains(newIndex))
				{
					oFF.XLogger.println(oFF.XStringUtils.concatenate2("DUPLICATE ", newIndex.toString()));
				}
				else
				{
					this.m_rowIndices.add(newIndex);
				}
				var rowValueAggregation = this.m_emptyRowDimensions ? null : this.m_rowValueAggregations.get(h);
				rowObject = this.addNewAnalyticDataRowAtTupleIndex(h, insertPosition);
				var cellChartMember = this.extractStructureMemberWithCellChart(rowValueAggregation);
				if (oFF.notNull(cellChartMember))
				{
					this.fillCellChart(rowObject, cellChartMember);
					if (rowObject.isShowCellChart() && rowObject.getCellChartOrientation() === oFF.SacCellChartOrientation.VERTICAL)
					{
						rowObject.setDefaultHeight(oFF.SacTableConstants.DF_R_N_HEIGHT_VERTICAL_CHARTS);
					}
				}
				rowObject.setTupleIndex(h);
				oFF.OlapVizToPivotConverterUtil.applyDataSectionInfoFromTuple(rowValueAggregation, this.m_rowKeys, rowObject);
				rowObject.setDefaultHeight(oFF.SacTableConstants.DF_R_N_HEIGHT);
				if (!this.m_emptyRowDimensions)
				{
					for (i = 0; i < this.m_rowKeysSize; i++)
					{
						var rowKey = this.m_rowKeys.get(i);
						valueAggregationElement = rowValueAggregation.getByKey(rowKey);
						var dimensionName = valueAggregationElement.getDimension().getName();
						if (!this.m_rowDimensionMemberIndex.containsKey(dimensionName))
						{
							this.m_rowDimensionMemberIndex.put(dimensionName, oFF.XHashMapByString.create());
						}
						var indexElement = this.m_rowDimensionMemberIndex.getByKey(dimensionName);
						var dimensionMemberName = valueAggregationElement.getDimensionMemberName();
						if (!indexElement.containsKey(dimensionMemberName))
						{
							indexElement.put(dimensionMemberName, oFF.XList.create());
						}
						indexElement.getByKey(dimensionMemberName).add(oFF.XIntegerValue.create(h));
						cellObject = rowObject.getCells().get(i);
						var dimensionMemberType = valueAggregationElement.getDimensionMemberType();
						if (dimensionMemberType === oFF.MemberType.RESULT || oFF.OlapComponentType.TOTALS === dimensionMemberType)
						{
							rowObject.setTotalLevel(i);
							rowObject.setTotalsContext(true);
							cellObject.setTotalsContext(true);
						}
						cellObject.setAllowDragDrop(true);
						cellObject.setType(valueAggregationElement.isMainAttribute() ? oFF.SacTableConstants.CT_ROW_DIM_MEMBER : oFF.SacTableConstants.CT_ATTRIBUTE_ROW_DIM_MEMBER);
						cellObject.getTableStyle().setHorizontalAlignment(oFF.SacTableCellHorizontalAlignment.LEFT);
						cellObject.getTableStyle().setVerticalAlignment(oFF.SacTableCellVerticalAlignment.BOTTOM);
						cellObject.setRepeatedHeader(valueAggregationElement.isRepeatedMemberName());
						cellObject.setPlainString(valueAggregationElement.getPlain());
						cellObject.setFormatted(this.getTextWithSuffix(valueAggregationElement));
						if (isAxisValidForMemberSort && (this.m_caps.supportsDataCellSorting() && i + 1 === this.m_rowKeysSize || !this.m_caps.supportsDataCellSorting() && this.m_caps.supportsMeasureSorting() && valueAggregationElement.getDimension().isMeasureStructure() && !cellObject.isRepeatedHeader()) && this.m_columnsTotalCount > 1)
						{
							var sortDirection = this.m_sortDirections.getByKey(valueAggregationElement.getPathKey());
							if (oFF.isNull(sortDirection) || sortDirection === oFF.XSortDirection.DEFAULT_VALUE)
							{
								sortDirection = this.m_sortDirections.getByKey(valueAggregationElement.getDimensionMemberName());
							}
							if (oFF.isNull(sortDirection))
							{
								sortDirection = oFF.XSortDirection.DEFAULT_VALUE;
							}
							cellObject.setSortDirection(sortDirection);
							cellObject.setLengthAddition(3);
						}
						else
						{
							cellObject.setLengthAddition(1);
						}
						var drillState = valueAggregationElement.getDrillState();
						dimensionMemberType = valueAggregationElement.getDimensionMemberType();
						var headerDimension = valueAggregationElement.getDimension();
						var hierarchyActive = headerDimension.isHierarchyActive() || headerDimension.isUniversalDisplayHierarchyDimension();
						this.setReversedHierarchy(this.checkReversedHierarchyForDimension(headerDimension));
						var isInHierarchy = valueAggregationElement.isMainAttribute() && oFF.notNull(drillState) && hierarchyActive;
						if (isInHierarchy)
						{
							var displayLevel = valueAggregationElement.getDisplayLevel();
							cellObject.setLengthAddition(2 * displayLevel + cellObject.getLengthAddition());
							cellObject.setInHierarchy(true);
							cellObject.setHierarchyLevel(displayLevel);
							cellObject.setHierarchyPaddingType(oFF.SacTableConstants.C_N_HIERARCHY_PADDING_LEFT);
							cellObject.setHierarchyPaddingValue(oFF.SacTableConstants.DF_C_N_HIERARCHY_PADDING_LEFT);
							cellObject.setShowDrillIcon(oFF.notNull(drillState) && drillState !== oFF.DrillState.LEAF && oFF.MemberType.RESULT !== dimensionMemberType && oFF.OlapComponentType.TOTALS !== dimensionMemberType);
							cellObject.setExpanded(drillState === oFF.DrillState.EXPANDED || drillState === oFF.DrillState.DRILLED || drillState === oFF.DrillState.LEAF_UDH);
						}
					}
				}
				else if (this.m_showDimensionTitles && this.m_columnKeysSize > 0)
				{
					cellObject = rowObject.getCells().get(this.getHeaderColumnList().size() - 1);
					cellObject.setType(oFF.SacTableConstants.CT_EMPTY_AXIS_ROW_HEADER);
				}
			}
		}
		this.retrieveColumnsTotalCount(rs);
		this.retrieveRowsTotalCount(rs);
		this.updateTableDimensions();
	}
	this.applyColumnAndRowSizes();
	this.formatLocalDataColumnWidths();
	this.postFormatHeaderColumns();
	this.m_currentRowsOffset = offset;
	return this.m_currentRowsOffset;
};
oFF.SacAnalyticsTable.prototype.checkReversedHierarchyForDimension = function(headerDimension)
{
	var reversedHierarchy;
	if (headerDimension.isUniversalDisplayHierarchyDimension())
	{
		if (this.m_queryModel.getSession().hasFeature(oFF.FeatureToggleOlap.UDH_ALIGNMENT))
		{
			reversedHierarchy = headerDimension.getAxis().getResultAlignment() === oFF.ResultAlignment.BOTTOM;
		}
		else
		{
			reversedHierarchy = false;
		}
	}
	else
	{
		reversedHierarchy = headerDimension.getLowerLevelNodeAlignment() === oFF.Alignment.CHILDREN_ABOVE_PARENT;
	}
	return reversedHierarchy;
};
oFF.SacAnalyticsTable.prototype.retrieveColumnsTotalCount = function(rs)
{
	this.m_columnsTotalCount = rs.getCursorColumnsAxis().getTuplesCountTotal();
	this.m_totalColumnsCountMayBeInaccurate = this.m_columnsTotalCount < 0;
	if (this.m_totalColumnsCountMayBeInaccurate)
	{
		var offset = 10;
		if (rs.getResultSetContainer().getMaxColumns() > this.m_lastColumnToFetch + 1)
		{
			offset = 0;
			this.m_totalColumnsCountMayBeInaccurate = false;
		}
		this.m_columnsTotalCount = this.m_lastColumnToFetch + offset;
	}
	this.m_columnsTotalCount = oFF.XMath.max(this.m_columnsTotalCount, rs.getDataColumns());
};
oFF.SacAnalyticsTable.prototype.retrieveRowsTotalCount = function(rs)
{
	this.m_rowsTotalCount = rs.getCursorRowsAxis().getTuplesCountTotal();
	this.m_totalRowsCountMayBeInaccurate = this.m_rowsTotalCount < 0;
	if (this.m_totalRowsCountMayBeInaccurate)
	{
		var offset = 10;
		if (rs.getResultSetContainer().getMaxRows() > this.m_lastRowToFetch + 1)
		{
			offset = 0;
			this.m_totalRowsCountMayBeInaccurate = false;
		}
		this.m_rowsTotalCount = this.m_lastRowToFetch + offset;
	}
	this.m_rowsTotalCount = oFF.XMath.max(this.m_rowsTotalCount, rs.getDataRows());
};
oFF.SacAnalyticsTable.prototype.fillDataCells = function(rs, offsetRowsOrig, offsetColumnsOrig)
{
	this.applyDataPointStyles();
	var hasDataCells = rs.getDataRows() > 0 && rs.getDataColumns() > 0;
	var offsetRows = offsetRowsOrig;
	var offsetColumns = offsetColumnsOrig;
	var offsetRowBase = rs.getResultSetContainer().getOffsetRows();
	var offsetColumnBase = rs.getResultSetContainer().getOffsetColumns();
	this.m_lastRowToFetch = oFF.XMath.max(1, offsetRowBase + rs.getCursorRowsAxis().getTuplesCount());
	this.m_lastColumnToFetch = oFF.XMath.max(1, offsetColumnBase + rs.getCursorColumnsAxis().getTuplesCount());
	if (oFF.XCollectionUtils.hasElements(this.m_tupleRows) && offsetRows < this.m_tupleRows.size() && this.m_tupleRows.get(offsetRows) === null)
	{
		offsetRows = offsetRows + 1;
	}
	if (oFF.XCollectionUtils.hasElements(this.m_tupleColumns) && offsetColumns < this.m_tupleColumns.size() && this.m_tupleColumns.get(offsetColumns) === null)
	{
		offsetColumns = offsetColumns + 1;
	}
	if (this.m_rowsTotalCount === -1 || this.m_rowsTotalCount > offsetRows)
	{
		this.m_localRowList.clear();
		if (this.m_hasDataForRows)
		{
			var rowObject;
			var cellObject;
			for (var rowTupleIndex = offsetRows; rowTupleIndex < this.m_lastRowToFetch && rowTupleIndex < this.m_tupleRows.size(); rowTupleIndex++)
			{
				rowObject = this.m_tupleRows.get(rowTupleIndex);
				if (oFF.isNull(rowObject))
				{
					break;
				}
				this.m_localRowList.add(rowObject);
				if (rowTupleIndex > -1)
				{
					var cells = rowObject.getCells();
					for (var columnTupleIndex = offsetColumns; columnTupleIndex < this.m_lastColumnToFetch && columnTupleIndex < this.m_tupleColumns.size(); columnTupleIndex++)
					{
						var columnObject = this.m_tupleColumns.get(columnTupleIndex);
						var cellIndex = this.getPreColumnsAmount() + this.getColumnList().getIndex(columnObject);
						cellObject = cells.get(cellIndex);
						if (oFF.isNull(cellObject))
						{
							break;
						}
						if (rowObject.isShowCellChart() || columnObject.isShowCellChart())
						{
							cellObject.setType(oFF.SacTableConstants.CT_CHART);
							if (columnObject.isShowCellChart() && columnObject.getCellChartOrientation() === oFF.SacCellChartOrientation.VERTICAL)
							{
								rowObject.setDefaultHeight(oFF.SacTableConstants.DF_R_N_HEIGHT_VERTICAL_CHARTS);
							}
						}
						if (hasDataCells && columnTupleIndex > -1)
						{
							var dataCell = rs.getDataCell(columnTupleIndex - offsetColumnBase, rowTupleIndex - offsetRowBase);
							if (dataCell.isDataEntryEnabled())
							{
								cellObject.setType(oFF.SacTableConstants.CT_INPUT);
								cellObject.getTableStyle().setHorizontalAlignment(oFF.SacTableCellHorizontalAlignment.RIGHT);
							}
							else
							{
								cellObject.setType(oFF.SacTableConstants.CT_VALUE);
								cellObject.getTableStyle().setHorizontalAlignment(oFF.SacTableCellHorizontalAlignment.RIGHT);
							}
							var qDataCell = dataCell.getDataCell();
							if (oFF.notNull(qDataCell))
							{
								cellObject.setDataCellRef(qDataCell.getName());
							}
							cellObject.getTableStyle().setVerticalAlignment(oFF.SacTableCellVerticalAlignment.BOTTOM);
							var scaleFormatTuple = this.getFormattedValue(dataCell, rowTupleIndex, columnTupleIndex);
							var valueException = dataCell.getValueException();
							var valueSign = null;
							var formattedValue = scaleFormatTuple.getFirstString();
							var excelFormatString = scaleFormatTuple.getSecondString();
							if (valueException === oFF.ValueException.UNDEFINED)
							{
								formattedValue = "\u2012";
								valueSign = oFF.SacValueSign.UNDEFINED;
							}
							else if (valueException === oFF.ValueException.MIXED_CURRENCIES_OR_UNITS || valueException === oFF.ValueException.UNDEFINED_NOP)
							{
								formattedValue = "*";
								valueSign = oFF.SacValueSign.UNDEFINED;
							}
							else if (valueException !== oFF.ValueException.NORMAL && valueException !== oFF.ValueException.ZERO)
							{
								cellObject.setType(oFF.SacTableConstants.CT_UNBOOKED);
								formattedValue = oFF.XStringUtils.concatenate3(valueException.getName(), ": ", formattedValue);
								valueSign = oFF.SacValueSign.UNBOOKED;
							}
							cellObject.setFormatted(formattedValue);
							cellObject.setFormattingPattern(excelFormatString);
							var doubleValueX;
							if (valueException !== oFF.ValueException.UNDEFINED && valueException !== oFF.ValueException.NULL_VALUE)
							{
								if (dataCell.getValueType().isNumber())
								{
									var doubleValue = dataCell.getDouble();
									doubleValueX = oFF.XDoubleValue.create(doubleValue);
									cellObject.setPlain(doubleValueX);
									if (valueException === oFF.ValueException.ZERO)
									{
										valueSign = oFF.SacValueSign.ZERO;
									}
									else if (doubleValue < 0)
									{
										valueSign = oFF.SacValueSign.POSITIVE;
									}
									else if (doubleValue > 0)
									{
										valueSign = oFF.SacValueSign.NEGATIVE;
									}
								}
								else
								{
									cellObject.setPlainString(dataCell.getStringRepresentation());
									valueSign = oFF.SacValueSign.NORMAL;
								}
							}
							cellObject.setCommentDocumentId(dataCell.getDocumentId());
							var maxAlertLevel = dataCell.getMaxAlertLevel();
							var alertLevelName = dataCell.getMaxAlertLevelName();
							var formulaExceptionManager = this.m_queryModel.getFormulaExceptionManager();
							var threshold = oFF.isNull(formulaExceptionManager) ? null : formulaExceptionManager.getModelFormulaExceptionThreshold(alertLevelName);
							if (oFF.notNull(threshold) && oFF.XStringUtils.isNotNullAndNotEmpty(threshold.getColor()))
							{
								cellObject.getTableStyle().setThresholdColor(threshold.getColor());
								cellObject.getTableStyle().setThresholdType(oFF.SacAlertSymbol.GOOD);
							}
							var exceptionInformation = cellObject.addNewExceptionInformation();
							exceptionInformation.setExceptionName(alertLevelName);
							exceptionInformation.setLevel(oFF.SacAlertLevel.getByLevelValue(maxAlertLevel.getLevel()));
							exceptionInformation.setValueSign(valueSign);
						}
					}
				}
			}
		}
		this.retrieveColumnsTotalCount(rs);
		this.retrieveRowsTotalCount(rs);
		this.updateTableDimensions();
	}
	this.m_currentRowsOffset = offsetRows;
	this.applyColumnAndRowSizes();
	this.formatLocalDataColumnWidths();
	this.postFormatHeaderColumns();
};
oFF.SacAnalyticsTable.prototype.updateTableDimensions = function()
{
	if (oFF.XCollectionUtils.hasElements(this.m_tupleColumns))
	{
		var tupleColumnsSize = this.m_tupleColumns.size();
		var lastTupleColumn = this.m_tupleColumns.get(tupleColumnsSize - 1);
		var lastTupleColumnIndex = this.getLastRelatedColumnIndex(lastTupleColumn);
		this.setDataColumnsAmount(this.m_columnsTotalCount + lastTupleColumnIndex - tupleColumnsSize + 1);
	}
	else
	{
		this.setDataColumnsAmount(0);
	}
	if (oFF.XCollectionUtils.hasElements(this.m_tupleRows))
	{
		var tupleRowsSize = this.m_tupleRows.size();
		var lastTupleRow = this.m_tupleRows.get(tupleRowsSize - 1);
		var lastTupleRowIndex = this.getLastRelatedRowIndex(lastTupleRow);
		this.setDataRowAmount(this.m_rowsTotalCount + lastTupleRowIndex - tupleRowsSize + 1);
	}
	else
	{
		this.setDataRowAmount(this.m_rowsTotalCount);
	}
};
oFF.SacAnalyticsTable.prototype.getLastRelatedRowIndex = function(rowObject)
{
	var newIndex = this.getRowList().getIndex(rowObject);
	var rowsAfter = rowObject.getRowsAfter();
	for (var i = 0; i < rowsAfter.size(); i++)
	{
		newIndex = oFF.XMath.max(newIndex, this.getLastRelatedRowIndex(rowsAfter.get(i)));
	}
	return newIndex;
};
oFF.SacAnalyticsTable.prototype.getLastRelatedColumnIndex = function(columnObject)
{
	var newIndex = this.getColumnList().getIndex(columnObject);
	var columnsAfter = columnObject.getColumnsAfter();
	for (var i = 0; i < columnsAfter.size(); i++)
	{
		newIndex = oFF.XMath.max(newIndex, this.getLastRelatedColumnIndex(columnsAfter.get(i)));
	}
	return newIndex;
};
oFF.SacAnalyticsTable.prototype.getFormattedValue = function(dataCell, rowTupleIndex, columnTupleIndex)
{
	var formattedValue = dataCell.getFormattedValue();
	var excelFormatString = oFF.XNumberFormatter.standardizeFormatString(dataCell.getFormatString(), dataCell.getQueryModel().getSystemType().isTypeOf(oFF.SystemType.BW), dataCell.getValueType().isDateBased());
	var valueException = dataCell.getValueException();
	var currencyUnit = dataCell.getCurrencyUnit();
	var currencyUnitPrefix = "";
	var currencyUnitSuffix = "";
	if (currencyUnit.hasPrefix())
	{
		currencyUnitPrefix = oFF.XStringUtils.concatenate2(currencyUnit.getPrefix(), " ");
	}
	if (currencyUnit.hasSuffix())
	{
		currencyUnitSuffix = oFF.XStringUtils.concatenate2(" ", currencyUnit.getSuffix());
	}
	var unitFormattingApplied = false;
	if (oFF.notNull(formattedValue) && (valueException === oFF.ValueException.NORMAL || valueException === oFF.ValueException.ZERO || valueException === oFF.ValueException.MIXED_CURRENCIES_OR_UNITS))
	{
		var valueType = dataCell.getValueType();
		if (valueType.isTypeOf(oFF.XValueType.DOUBLE))
		{
			var rowStructureMember = !oFF.XCollectionUtils.hasElements(this.m_rowValueAggregations) ? null : this.extractStructureMember(this.m_rowValueAggregations.get(rowTupleIndex));
			var columnStructureMember = !oFF.XCollectionUtils.hasElements(this.m_columnValueAggregations) ? null : this.extractStructureMember(this.m_columnValueAggregations.get(columnTupleIndex));
			var cellFormatterSettings = oFF.DataCellNumberFormatterSettings.create(dataCell);
			var settingsFactory = oFF.XNumberFormatterSettingsFactory.getInstance();
			var formatterSettings = settingsFactory.merge(cellFormatterSettings, this.m_userProfile);
			var qStructureMemberFormatterSettings = oFF.QStructureMemberFormatterSettings.create(rowStructureMember, columnStructureMember, dataCell.getQueryModel());
			formatterSettings = settingsFactory.merge(formatterSettings, qStructureMemberFormatterSettings);
			var currencyUnitPair = this.getCurrencyUnitPair(dataCell.getComplexUnit());
			unitFormattingApplied = true;
			if (oFF.notNull(currencyUnitPair))
			{
				var scaleFormatTuple = oFF.XNumberFormatter.formatDoubleToStringUsingSettingsWithCurrency(dataCell.getDouble(), formatterSettings, currencyUnitPair, this.m_scaleTextsMap, excelFormatString);
				formattedValue = scaleFormatTuple.getFirstString();
				excelFormatString = scaleFormatTuple.getSecondString();
			}
			else
			{
				var currency = oFF.XPairOfString.create(currencyUnitPrefix, currencyUnitSuffix);
				var scaleFormatTuple2 = oFF.XNumberFormatter.formatDoubleToStringUsingSettingsWithCurrency(dataCell.getDouble(), formatterSettings, currency, this.m_scaleTextsMap, excelFormatString);
				formattedValue = scaleFormatTuple2.getFirstString();
				excelFormatString = scaleFormatTuple2.getSecondString();
			}
		}
		else if (valueType.isTypeOf(oFF.XValueType.PERCENT))
		{
			formattedValue = oFF.XStringUtils.concatenate2(formattedValue, " %");
			excelFormatString = oFF.XStringUtils.concatenate2(excelFormatString, "\" %\"");
			unitFormattingApplied = true;
		}
		else if (valueType.isTypeOf(oFF.XValueType.DATE) && oFF.notNull(this.m_dateFormatter))
		{
			var date = dataCell.getDate();
			formattedValue = oFF.isNull(date) ? formattedValue : this.m_dateFormatter.formatDate(date);
		}
		else if (valueType.isTypeOf(oFF.XValueType.TIME) && oFF.notNull(this.m_timeFormatter))
		{
			var time = dataCell.getTime();
			formattedValue = oFF.isNull(time) ? formattedValue : this.m_timeFormatter.formatTime(time);
		}
		else if (valueType.isTypeOf(oFF.XValueType.DATE_TIME) && oFF.notNull(this.m_dateTimeFormatter))
		{
			var dateTime = dataCell.getDateTime();
			formattedValue = oFF.isNull(dateTime) ? formattedValue : this.m_dateTimeFormatter.formatDateTime(dateTime);
		}
	}
	if (oFF.isNull(formattedValue))
	{
		formattedValue = " ";
	}
	if (!unitFormattingApplied)
	{
		formattedValue = oFF.XStringUtils.concatenate2(currencyUnitPrefix, formattedValue);
		formattedValue = oFF.XStringUtils.concatenate2(formattedValue, currencyUnitSuffix);
	}
	return oFF.XPairOfString.create(formattedValue, excelFormatString);
};
oFF.SacAnalyticsTable.prototype.getCurrencyUnitPair = function(complexUnit)
{
	if (oFF.isNull(complexUnit))
	{
		return null;
	}
	var pair = null;
	var unitTypes = complexUnit.getUnitTypes();
	if (oFF.notNull(unitTypes) && unitTypes.size() > 0)
	{
		if (oFF.UnitType.lookup(unitTypes.get(0)) === oFF.UnitType.CURRENCY)
		{
			var currency = complexUnit.getUnitDescriptions().get(0);
			if (unitTypes.size() > 1)
			{
				var perUnit = oFF.XStringUtils.concatenate2("/", complexUnit.getUnitValues().get(1));
				pair = oFF.XPairOfString.create(currency, perUnit);
			}
			else
			{
				pair = oFF.XPairOfString.create(currency, null);
			}
		}
		else if (unitTypes.size() === 1 && oFF.UnitType.lookup(unitTypes.get(0)) === oFF.UnitType.UNIT)
		{
			var unit = oFF.XStringUtils.concatenate2(" ", complexUnit.getUnitValues().get(0));
			pair = oFF.XPairOfString.create("", unit);
		}
	}
	return pair;
};
oFF.SacAnalyticsTable.prototype.extractStructureMember = function(sacTableAggregationIXMapByString)
{
	var structureMember = null;
	if (oFF.notNull(sacTableAggregationIXMapByString))
	{
		var values = sacTableAggregationIXMapByString.getValuesAsReadOnlyList();
		for (var i = 0; i < values.size(); i++)
		{
			var value = values.get(i);
			var dimension = value.getDimension();
			if (dimension.getDimensionType().isTypeOf(oFF.DimensionType.ABSTRACT_STRUCTURE) || dimension.getDimensionType().isTypeOf(oFF.DimensionType.ACCOUNT))
			{
				structureMember = dimension.getStructureMemberByAliasOrMember(value.getDimensionMemberName());
				break;
			}
		}
	}
	return structureMember;
};
oFF.SacAnalyticsTable.prototype.formatLocalDataColumnWidths = function()
{
	this.formatWidthList(this.m_localRowList);
};
oFF.SacAnalyticsTable.prototype.fillCellChart = function(formattableElement, structureMemberWithCellChart)
{
	if (oFF.notNull(structureMemberWithCellChart) && structureMemberWithCellChart.isShowCellChart())
	{
		var cellChartType = structureMemberWithCellChart.getCellChartType();
		if (oFF.isNull(cellChartType) || cellChartType === oFF.CellChartType.NONE)
		{
			cellChartType = oFF.CellChartType.BAR;
		}
		var memberName = structureMemberWithCellChart.getAliasOrMemberName();
		formattableElement.setShowCellChart(true);
		formattableElement.setCellChartType(oFF.OlapVizToPivotConverterUtil.getCellChartTypeFromViz(cellChartType));
		formattableElement.setCellChartMemberName(memberName);
		formattableElement.getTableStyle().setCellChartLineColor(structureMemberWithCellChart.getCellChartLineColor());
		formattableElement.getTableStyle().setCellChartBarColor(structureMemberWithCellChart.getCellChartBarColor());
		formattableElement.setHideNumberForCellChart(structureMemberWithCellChart.isHideNumberForCellChart());
		formattableElement.setCellChartOrientation(oFF.OlapVizToPivotConverterUtil.getCellChartOrientationFromViz(structureMemberWithCellChart.getCellChartOrientation()));
	}
};
oFF.SacAnalyticsTable.prototype.extractStructureMemberWithCellChart = function(sacTableAggregationIXMapByString)
{
	var structureMember = null;
	if (oFF.notNull(sacTableAggregationIXMapByString))
	{
		var values = sacTableAggregationIXMapByString.getValuesAsReadOnlyList();
		for (var i = 0; i < values.size(); i++)
		{
			var value = values.get(i);
			var dimension = value.getDimension();
			if (dimension.getDimensionType().isTypeOf(oFF.DimensionType.ABSTRACT_STRUCTURE))
			{
				structureMember = dimension.getStructureMemberByAliasOrMember(value.getDimensionMemberName());
				if (oFF.notNull(structureMember) && !structureMember.isShowCellChart())
				{
					structureMember = null;
				}
				break;
			}
		}
	}
	return structureMember;
};
oFF.SacAnalyticsTable.prototype.preFillAxis = function(cursorAxis, headerAggregation, valueAggregations, offset)
{
	cursorAxis.setTupleCursorBeforeStart();
	if (offset === 0)
	{
		oFF.XCollectionUtils.releaseEntriesFromCollection(valueAggregations);
		valueAggregations.clear();
	}
	var aggSize = valueAggregations.size();
	var lastAggregation = null;
	if (cursorAxis.hasNextTuple())
	{
		if (offset === aggSize)
		{
			if (aggSize > 0)
			{
				lastAggregation = valueAggregations.get(aggSize - 1);
			}
		}
		else
		{
			for (var i = aggSize; i <= offset; i++)
			{
				valueAggregations.add(null);
			}
			var startWithOffset = false;
			if (offset < aggSize)
			{
				lastAggregation = valueAggregations.get(offset - 1);
				if (oFF.notNull(lastAggregation))
				{
					startWithOffset = true;
				}
			}
			cursorAxis.nextTuple();
			lastAggregation = oFF.SacTableAggregation.getMemberHeader(cursorAxis, headerAggregation, lastAggregation, this.m_overwriteTexts);
			if (startWithOffset)
			{
				valueAggregations.set(offset, lastAggregation);
			}
			var index = offset + 1;
			while (cursorAxis.hasNextTuple() && index < aggSize)
			{
				cursorAxis.nextTuple();
				lastAggregation = oFF.SacTableAggregation.getMemberHeader(cursorAxis, headerAggregation, lastAggregation, this.m_overwriteTexts);
				valueAggregations.set(index, lastAggregation);
				index++;
			}
		}
		while (cursorAxis.hasNextTuple())
		{
			cursorAxis.nextTuple();
			lastAggregation = oFF.SacTableAggregation.getMemberHeader(cursorAxis, headerAggregation, lastAggregation, this.m_overwriteTexts);
			valueAggregations.add(lastAggregation);
		}
	}
};
oFF.SacAnalyticsTable.prototype.applyDataPointStyles = function()
{
	this.clearDataPointStyles();
	var dataPointStyles = this.getAvailableDataPointStyle();
	if (oFF.XCollectionUtils.hasElements(dataPointStyles))
	{
		for (var j = 0; j < dataPointStyles.size(); j++)
		{
			var dataPointStyle = dataPointStyles.get(j);
			var sacDataPointStyle = this.addNewDataPointStyle();
			oFF.OlapVizToPivotConverterUtil.applyDataPointStyleFromViz(dataPointStyle, sacDataPointStyle);
		}
	}
};
oFF.SacAnalyticsTable.prototype.getAvailableDataPointStyle = function()
{
	var dataPointStyles = null;
	if (oFF.notNull(this.m_tableDefinition))
	{
		dataPointStyles = this.m_tableDefinition.getDataPointStyles();
	}
	return dataPointStyles;
};
oFF.SacAnalyticsTable.prototype.getAvailableHighlightAreas = function()
{
	var highlightAreas = null;
	if (oFF.notNull(this.m_tableDefinition))
	{
		highlightAreas = this.m_tableDefinition.getHighlightAreas();
	}
	return highlightAreas;
};
oFF.SacAnalyticsTable.prototype.getAvailableTableMarkups = function()
{
	var tableMarkups = null;
	if (oFF.notNull(this.m_tableDefinition))
	{
		tableMarkups = this.m_tableDefinition.getTableMarkups();
	}
	return tableMarkups;
};
oFF.SacAnalyticsTable.prototype.isShowDimensionTitles = function()
{
	return this.m_showDimensionTitles;
};
oFF.SacAnalyticsTable.prototype.setShowDimensionTitles = function(showDimensionTitles)
{
	if (showDimensionTitles !== this.m_showDimensionTitles)
	{
		this.m_showDimensionTitles = showDimensionTitles;
		if (this.m_hasData)
		{
			this.adaptCellLayout();
		}
	}
};
oFF.SacAnalyticsTable.prototype.getHeaderCompactionType = function()
{
	return this.m_headerCompactionType;
};
oFF.SacAnalyticsTable.prototype.setHeaderCompactionType = function(headerCompactionType)
{
	if (headerCompactionType !== this.m_headerCompactionType)
	{
		this.m_headerCompactionType = headerCompactionType;
		if (this.m_hasData)
		{
			this.adaptCellLayout();
		}
	}
};
oFF.SacAnalyticsTable.prototype.adaptCellLayout = function()
{
	var preColumnsAmountBefore = this.getPreColumnsAmount();
	var preColumnsAmount = this.m_rowKeysSize + (this.needsEmptyHeaderColumn() ? 1 : 0);
	var preRowsAmountBefore = this.getPreRowsAmount();
	var preRowsAmount = this.m_columnKeysSize + (this.needsEmptyHeaderRow() ? 1 : 0);
	if (preColumnsAmountBefore !== preColumnsAmount)
	{
		this.clearHeaderColumnList();
		this.createHeaderColumns();
	}
	this.clearHeaderRowList();
	this.setPreRowsAmount(preRowsAmount);
	this.fillHeaderRows(0, -1);
	this.m_totalRowDiff = preRowsAmount - preRowsAmountBefore;
};
oFF.SacAnalyticsTable.prototype.getDimensionToColorate = function()
{
	return this.m_dimensionToColorate;
};
oFF.SacAnalyticsTable.prototype.setDimensionToColorate = function(dimensionToColorate)
{
	this.m_dimensionToColorate = dimensionToColorate;
};
oFF.SacAnalyticsTable.prototype.getDimensionColorPalette = function()
{
	return this.m_dimensionColorPalette;
};
oFF.SacAnalyticsTable.prototype.setDimensionColorPalette = function(dimensionColorPalette)
{
	this.m_dimensionColorPalette = dimensionColorPalette;
};
oFF.SacAnalyticsTable.prototype.applyColumnAndRowSizes = function()
{
	if (oFF.notNull(this.m_tableDefinition) && oFF.notNull(this.m_queryModel) && !this.m_queryModel.isReleased())
	{
		var heights = this.m_tableDefinition.getFixedPixelHeightsForRows();
		var keys = heights.getKeysAsIterator();
		var index;
		var key;
		var size = this.getHeaderRowList().size();
		while (keys.hasNext())
		{
			key = keys.next();
			index = key.getInteger();
			var height = heights.getByKey(key).getInteger();
			if (index < size)
			{
				this.getHeaderRowList().get(index).setHeight(height);
			}
			else if (index - size < this.getRowList().size())
			{
				var row = this.getRowList().get(index - size);
				if (oFF.notNull(row))
				{
					row.setHeight(height);
				}
			}
		}
		var widths = this.m_tableDefinition.getFixedPixelWidthsForColumns();
		keys = widths.getKeysAsIterator();
		size = this.getHeaderColumnList().size();
		while (keys.hasNext())
		{
			key = keys.next();
			index = key.getInteger();
			var width = widths.getByKey(key).getInteger();
			if (index < size)
			{
				this.getHeaderColumnList().get(index).setWidth(width);
			}
			else if (index - size < this.getColumnList().size())
			{
				var column = this.getColumnList().get(index - size);
				if (oFF.notNull(column))
				{
					column.setWidth(width);
				}
			}
		}
	}
};
oFF.SacAnalyticsTable.prototype.getQueryModel = function()
{
	return this.m_queryModel;
};
oFF.SacAnalyticsTable.prototype.addNewAnalyticHeaderRow = function()
{
	var row = oFF.SacAnalyticsRow.createAnalyticsRow(this);
	this.addHeaderRow(row);
	return row;
};
oFF.SacAnalyticsTable.prototype.addNewAnalyticDataRowAt = function(dataIndex, overwriteAtPosition)
{
	var newRow = oFF.SacAnalyticsRow.createAnalyticsRow(this);
	this.addDataRowAt(dataIndex, newRow, overwriteAtPosition);
	return newRow;
};
oFF.SacAnalyticsTable.prototype.prepareRowInsertOffsetForTupleIndex = function(tupleIndex)
{
	if (tupleIndex === 0)
	{
		return 0;
	}
	while (this.m_tupleRows.size() < tupleIndex)
	{
		this.m_tupleRows.add(null);
	}
	var previousTupleIndex = tupleIndex - 1;
	while (previousTupleIndex > 0 && this.m_tupleRows.get(previousTupleIndex) === null)
	{
		previousTupleIndex--;
	}
	var previousTupleRow = this.m_tupleRows.get(previousTupleIndex);
	var index = oFF.isNull(previousTupleRow) ? previousTupleIndex : this.thisGetMaxInsertedRowIndex(previousTupleRow, previousTupleIndex);
	return tupleIndex - previousTupleIndex + index;
};
oFF.SacAnalyticsTable.prototype.thisGetMaxInsertedRowIndex = function(previousTupleRow, previousRowIndex)
{
	var rowIndex = oFF.XMath.max(previousRowIndex, this.getRowList().getIndex(previousTupleRow));
	var rowsAfter = previousTupleRow.getRowsAfter();
	for (var i = 0; i < rowsAfter.size(); i++)
	{
		rowIndex = this.thisGetMaxInsertedRowIndex(rowsAfter.get(i), rowIndex);
	}
	return rowIndex;
};
oFF.SacAnalyticsTable.prototype.addNewAnalyticDataRowAtTupleIndex = function(tupleIndex, dataIndex)
{
	var newRow = oFF.SacAnalyticsRow.createAnalyticsRow(this);
	if (this.m_tupleRows.size() <= tupleIndex)
	{
		this.m_tupleRows.insert(tupleIndex, newRow);
	}
	else
	{
		this.m_tupleRows.set(tupleIndex, newRow);
	}
	this.addDataRowAt(dataIndex, newRow, true);
	return newRow;
};
oFF.SacAnalyticsTable.prototype.prepareColumnInsertOffsetForTupleIndex = function(tupleIndex)
{
	if (tupleIndex === 0)
	{
		return 0;
	}
	while (this.m_tupleColumns.size() < tupleIndex)
	{
		this.m_tupleColumns.add(null);
	}
	var previousTupleIndex = tupleIndex - 1;
	while (previousTupleIndex > 0 && this.m_tupleColumns.get(previousTupleIndex) === null)
	{
		previousTupleIndex--;
	}
	var previousTupleColumn = this.m_tupleColumns.get(previousTupleIndex);
	var index = oFF.isNull(previousTupleColumn) ? previousTupleIndex : this.thisGetMaxInsertedColumnIndex(previousTupleColumn, previousTupleIndex);
	return tupleIndex - previousTupleIndex + index;
};
oFF.SacAnalyticsTable.prototype.thisGetMaxInsertedColumnIndex = function(previousTupleColumn, previousColumnIndex)
{
	var columnIndex = oFF.XMath.max(previousColumnIndex, this.getColumnList().getIndex(previousTupleColumn));
	var columnsAfter = previousTupleColumn.getColumnsAfter();
	for (var i = 0; i < columnsAfter.size(); i++)
	{
		columnIndex = this.thisGetMaxInsertedColumnIndex(columnsAfter.get(i), columnIndex);
	}
	return columnIndex;
};
oFF.SacAnalyticsTable.prototype.addNewAnalyticDataColumnAtTupleIndex = function(tupleIndex, dataIndex)
{
	var newColumn = oFF.SacAnalyticsColumn.createAnalyticsColumn(this);
	if (this.m_tupleColumns.size() <= tupleIndex)
	{
		this.m_tupleColumns.insert(tupleIndex, newColumn);
	}
	else
	{
		this.m_tupleColumns.set(tupleIndex, newColumn);
	}
	this.addDataColumnAt(dataIndex, newColumn, true);
	return newColumn;
};
oFF.SacAnalyticsTable.prototype.getColumnsTotalCount = function()
{
	return this.m_hasData ? oFF.XMath.max(0, this.getPreColumnsAmount()) + oFF.XMath.max(0, this.getDataColumnsAmount()) : 0;
};
oFF.SacAnalyticsTable.prototype.getDataColumnsTotalCount = function()
{
	return this.m_hasData ? oFF.XMath.max(0, this.m_columnsTotalCount) : 0;
};
oFF.SacAnalyticsTable.prototype.getRowsTotalCount = function()
{
	return this.m_hasData ? oFF.XMath.max(0, this.getPreRowsAmount()) + oFF.XMath.max(0, oFF.SacTable.prototype.getDataRowAmount.call( this )) : 0;
};
oFF.SacAnalyticsTable.prototype.getDataRowAmount = function()
{
	return this.m_hasData ? oFF.XMath.max(0, oFF.SacTable.prototype.getDataRowAmount.call( this )) : 0;
};
oFF.SacAnalyticsTable.prototype.getDataRowsTotalCount = function()
{
	return this.m_hasData ? oFF.XMath.max(0, this.m_rowsTotalCount) : 0;
};
oFF.SacAnalyticsTable.prototype.getColumnsLoadedCount = function()
{
	return this.m_hasData ? oFF.XMath.max(0, this.getPreColumnsAmount()) + (oFF.XCollectionUtils.hasElements(this.getColumnList()) ? oFF.XStream.of(this.getColumnList()).filter( function(val){
		return oFF.notNull(val);
	}.bind(this)).countItems() : 0) : 0;
};
oFF.SacAnalyticsTable.prototype.getRowsLoadedCount = function()
{
	return this.m_hasData ? oFF.XMath.max(0, this.getPreRowsAmount()) + (oFF.XCollectionUtils.hasElements(this.getRowList()) ? oFF.XStream.of(this.getRowList()).filter( function(val){
		return oFF.notNull(val);
	}.bind(this)).countItems() : 0) : 0;
};
oFF.SacAnalyticsTable.prototype.getTitle = function()
{
	var title = oFF.SacTable.prototype.getTitle.call( this );
	if (oFF.isNull(title) && oFF.notNull(this.m_queryModel))
	{
		title = this.m_queryModel.getText();
		if (oFF.XStringUtils.isNullOrEmpty(title))
		{
			title = this.m_queryModel.getName();
		}
		if (oFF.XStringUtils.isNullOrEmpty(title))
		{
			title = "Query Model without a name";
		}
	}
	return title;
};
oFF.SacAnalyticsTable.prototype.getHeaderEndRow = function()
{
	return this.m_headerEndRow;
};
oFF.SacAnalyticsTable.prototype.getLocalRowList = function()
{
	return this.m_localRowList;
};
oFF.SacAnalyticsTable.prototype.getSortDirections = function()
{
	return this.m_sortDirections;
};
oFF.SacAnalyticsTable.prototype.getTotalRowDiff = function()
{
	return this.m_totalRowDiff;
};
oFF.SacAnalyticsTable.prototype.setTotalRowDiff = function(totalRowDiff)
{
	this.m_totalRowDiff = totalRowDiff;
};
oFF.SacAnalyticsTable.prototype.newHeaderRow = function()
{
	return this.addNewAnalyticHeaderRow();
};
oFF.SacAnalyticsTable.prototype.newHeaderRowAt = function(index)
{
	var row = oFF.SacAnalyticsRow.createAnalyticsRow(this);
	this.addHeaderRowAt(row, index);
	return row;
};
oFF.SacAnalyticsTable.prototype.createNewHeaderColumn = function()
{
	return this.createNewAnalyticHeaderColumn();
};
oFF.SacAnalyticsTable.prototype.createNewHeaderColumnAt = function(index)
{
	var newColumn = oFF.SacAnalyticsColumn.createAnalyticsColumn(this);
	this.addHeaderColumnAt(newColumn, index);
	return newColumn;
};
oFF.SacAnalyticsTable.prototype.createNewDataColumn = function()
{
	return this.createNewAnalyticDataColumn();
};
oFF.SacAnalyticsTable.prototype.createNewDataColumnAt = function(index)
{
	return this.createNewAnalyticDataColumnAt(index);
};
oFF.SacAnalyticsTable.prototype.createNewAnalyticHeaderColumn = function()
{
	var newColumn = oFF.SacAnalyticsColumn.createAnalyticsColumn(this);
	this.addHeaderColumn(newColumn);
	return newColumn;
};
oFF.SacAnalyticsTable.prototype.createNewAnalyticDataColumn = function()
{
	var newColumn = oFF.SacAnalyticsColumn.createAnalyticsColumn(this);
	this.addDataColumn(newColumn);
	return newColumn;
};
oFF.SacAnalyticsTable.prototype.createNewAnalyticDataColumnAt = function(index)
{
	var newColumn = oFF.SacAnalyticsColumn.createAnalyticsColumn(this);
	this.addDataColumnAt(index, newColumn, false);
	return newColumn;
};
oFF.SacAnalyticsTable.prototype.newDataRow = function()
{
	return this.addNewAnalyticDataRowAt(this.getRowList().size(), false);
};
oFF.SacAnalyticsTable.prototype.newDataRowAt = function(dataIndex, overwriteAtPosition)
{
	return this.addNewAnalyticDataRowAt(dataIndex, overwriteAtPosition);
};
oFF.SacAnalyticsTable.prototype.isEmptyRowDimensions = function()
{
	return this.m_emptyRowDimensions;
};
oFF.SacAnalyticsTable.prototype.applyTableDefinition = function(tableDefinition)
{
	if (oFF.notNull(tableDefinition))
	{
		this.m_tableDefinition = tableDefinition;
		this.m_dimensionColorPalette.clear();
		this.m_dimensionColorPalette.addAll(tableDefinition.getDimensionColorPalette());
		this.m_queryModel = tableDefinition.getQueryModel();
		var applicationSettings = tableDefinition.getApplicationSettings();
		if (oFF.notNull(applicationSettings))
		{
			if (applicationSettings.getUserProfile() !== null)
			{
				var dateFormat = null;
				var timeFormat = null;
				this.m_userProfile = applicationSettings.getUserProfile();
				if (this.m_userProfile.getDateFormatting() !== null)
				{
					dateFormat = this.m_userProfile.getDateFormatting();
					try
					{
						this.m_dateFormatter = oFF.XDateTimeFormatter.create(dateFormat);
					}
					catch (t1)
					{
						oFF.XLogger.println(oFF.XStringUtils.concatenate2("Invalid date format ", dateFormat));
					}
				}
				if (this.m_userProfile.getTimeFormatting() !== null)
				{
					timeFormat = this.m_userProfile.getTimeFormatting();
					try
					{
						this.m_timeFormatter = oFF.XDateTimeFormatter.create(timeFormat);
					}
					catch (t2)
					{
						oFF.XLogger.println(oFF.XStringUtils.concatenate2("Invalid time format ", timeFormat));
					}
				}
				if (this.m_userProfile.getDateFormatting() !== null || this.m_userProfile.getTimeFormatting() !== null)
				{
					var dateTimeFormat = dateFormat;
					if (oFF.isNull(dateFormat))
					{
						dateTimeFormat = timeFormat;
					}
					else if (oFF.notNull(timeFormat))
					{
						dateTimeFormat = oFF.XStringUtils.concatenate3(dateFormat, " ", timeFormat);
					}
					try
					{
						this.m_dateTimeFormatter = oFF.XDateTimeFormatter.create(dateTimeFormat);
					}
					catch (t3)
					{
						oFF.XLogger.println(oFF.XStringUtils.concatenate2("Invalid date or time format ", dateTimeFormat));
					}
				}
			}
			if (applicationSettings.getWidgetWidth() > 0)
			{
				this.setWidth(applicationSettings.getWidgetWidth());
			}
			if (applicationSettings.getWidgetHeight() > 0)
			{
				this.setHeight(applicationSettings.getWidgetHeight());
			}
			if (applicationSettings.getMaxColumns() > 0)
			{
				this.setMaxColumns(applicationSettings.getMaxColumns());
			}
			this.m_memberSortIconsLevel = applicationSettings.getMemberSortIconsLevel();
		}
		this.setDimensionToColorate(tableDefinition.getDimensionToColorate());
		this.setStripeDataRows(tableDefinition.isEffectiveStripeDataRows());
		this.setStripeDataColumns(tableDefinition.isEffectiveStripeDataColumns());
		this.setFreezeHeaderRows(tableDefinition.isEffectiveFreezeHeaderRows());
		this.setFreezeHeaderColumns(tableDefinition.isEffectiveFreezeHeaderColumns());
		this.setFreezeUpToColumn(tableDefinition.getFreezeUpToColumn());
		this.setFreezeUpToRow(tableDefinition.getFreezeUpToRow());
		this.setShowFreezeLines(tableDefinition.isEffectiveShowFreezeLines());
		this.setShowGrid(tableDefinition.isEffectiveShowGrid());
		this.setHeaderCompactionType(tableDefinition.getEffectiveTableHeaderCompactionType());
		this.setShowDimensionTitles(tableDefinition.isEffectiveShowDimensionTitles());
		this.setTableMemberHeaderHandling(oFF.OlapVizToPivotConverterUtil.getTableMemberHeaderHandlingFromViz(tableDefinition.getEffectiveTableMemberHeaderHandling()));
		this.setShowCoordinateHeader(tableDefinition.isEffectiveShowCoordinateHeader());
		this.setHeaderColor(tableDefinition.getHeaderColor());
		this.setTotalLevel6Color(tableDefinition.getTotalLevel6Color());
		this.setTotalLevel5Color(tableDefinition.getTotalLevel5Color());
		this.setTotalLevel4Color(tableDefinition.getTotalLevel4Color());
		this.setTotalLevel3Color(tableDefinition.getTotalLevel3Color());
		this.setTotalLevel2Color(tableDefinition.getTotalLevel2Color());
		this.setTotalLevel1Color(tableDefinition.getTotalLevel1Color());
		this.setTotalLevel0Color(tableDefinition.getTotalLevel0Color());
		this.applyColumnAndRowSizes();
	}
};
oFF.SacAnalyticsTable.prototype.fillEmptyTable = function(tableDefinition)
{
	var rowDimensionCount = this.m_queryModel.getRowsAxis().size();
	var rowTuplesCountLocal = 0;
	this.m_columnTuplesCount = 0;
	this.m_hasDataForRows = rowTuplesCountLocal > 0 && (this.m_columnTuplesCount > 0 || rowDimensionCount > 0);
	this.m_rowsTotalCount = -1;
	this.m_columnsTotalCount = -1;
	this.m_columnDimensionMemberIndex = oFF.XHashMapByString.create();
	this.m_rowDimensionMemberIndex = oFF.XHashMapByString.create();
	this.m_sortDirections = oFF.XHashMapByString.create();
	this.clear();
	this.m_columnValueAggregations = oFF.XList.create();
	this.m_rowValueAggregations = oFF.XList.create();
	this.m_caps = this.m_queryModel.getModelCapabilities();
	this.analyzeSortingOperations();
	this.setShowDimensionTitles(true);
	this.m_lastRowToFetch = oFF.XMath.max(1, rowTuplesCountLocal);
	this.m_hasData = false;
	this.m_localRowList.clear();
	this.m_columnHeaderAggregation = oFF.SacTableAggregation.getEmptyDimHeader(this.m_queryModel.getColumnsAxis(), this.m_queryModel, this.m_overwriteTexts);
	this.m_rowHeaderAggregation = oFF.SacTableAggregation.getEmptyDimHeader(this.m_queryModel.getRowsAxis(), this.m_queryModel, this.m_overwriteTexts);
	this.m_columnKeys = this.m_columnHeaderAggregation.getKeysAsReadOnlyListOfString();
	this.m_rowKeys = this.m_rowHeaderAggregation.getKeysAsReadOnlyListOfString();
	this.createHeaderColumns();
	this.fillHeaderRows(0, -1);
	this.postFormatHeaderRows();
};
oFF.SacAnalyticsTable.prototype.getIndexOfFirstUndefinedRowAfter = function(rowIndex)
{
	var result = rowIndex;
	var rowList = this.m_tupleRows;
	var rowsSize = rowList.size();
	while (result < rowsSize && rowList.get(result) !== null)
	{
		result++;
	}
	return result;
};
oFF.SacAnalyticsTable.prototype.getIndexOfLastUndefinedRowBefore = function(rowIndex)
{
	var result = rowIndex;
	var rowList = this.m_tupleRows;
	var rowsSize = rowList.size();
	while (result < rowsSize && result > -1 && rowList.get(result) !== null)
	{
		result--;
	}
	return result;
};
oFF.SacAnalyticsTable.prototype.getIndexOfFirstUndefinedColumnAfter = function(columnIndex)
{
	var result = columnIndex;
	var columnList = this.m_tupleColumns;
	var columnSize = columnList.size();
	while (result < columnSize && columnList.get(result) !== null)
	{
		result++;
	}
	return result;
};
oFF.SacAnalyticsTable.prototype.getIndexOfLastUndefinedColumnBefore = function(columnIndex)
{
	var result = columnIndex;
	var columnList = this.m_tupleColumns;
	var columnsSize = columnList.size();
	while (result < columnsSize && result > -1 && columnList.get(result) !== null)
	{
		result--;
	}
	return result;
};
oFF.SacAnalyticsTable.prototype.getIndexOfFirstIncompleteTileColumnAfter = function(columnIndexStart, columnIndexEnd, rowIndexStart, rowIndexEnd)
{
	var result = columnIndexStart;
	var columnList = this.m_tupleColumns;
	var columnSize = columnList.size();
	if (this.checkRowsRange(rowIndexStart, rowIndexEnd))
	{
		while (result < columnSize && this.checkColumnComplete(columnList.get(result), result, rowIndexStart, rowIndexEnd))
		{
			result++;
		}
	}
	return result;
};
oFF.SacAnalyticsTable.prototype.getIndexOfLastIncompleteTileColumnBefore = function(columnIndexStart, columnIndexEnd, rowIndexStart, rowIndexEnd)
{
	var result = columnIndexEnd;
	var columnList = this.m_tupleColumns;
	var columnsSize = columnList.size();
	if (this.checkRowsRange(rowIndexStart, rowIndexEnd))
	{
		while (result < columnsSize && result > -1 && this.checkColumnComplete(columnList.get(result), result, rowIndexStart, rowIndexEnd))
		{
			result--;
		}
	}
	return result;
};
oFF.SacAnalyticsTable.prototype.getIndexOfFirstIncompleteTileRowAfter = function(columnIndexStart, columnIndexEnd, rowIndexStart, rowIndexEnd)
{
	var result = rowIndexStart;
	var rowList = this.m_tupleRows;
	var rowsSize = rowList.size();
	if (this.checkColumnsRange(columnIndexStart, columnIndexEnd))
	{
		while (result < rowsSize && this.checkRowComplete(rowList.get(result), columnIndexStart, columnIndexEnd))
		{
			result++;
		}
	}
	return result;
};
oFF.SacAnalyticsTable.prototype.getIndexOfLastIncompleteTileRowBefore = function(columnIndexStart, columnIndexEnd, rowIndexStart, rowIndexEnd)
{
	var result = rowIndexEnd;
	var rowList = this.m_tupleRows;
	var rowsSize = rowList.size();
	if (this.checkColumnsRange(columnIndexStart, columnIndexEnd))
	{
		while (result < rowsSize && result > -1 && this.checkRowComplete(rowList.get(result), columnIndexStart, columnIndexEnd))
		{
			result--;
		}
	}
	return result;
};
oFF.SacAnalyticsTable.prototype.checkColumnComplete = function(sacTableColumn, colIndexOrig, rowIndexStart, rowIndexEnd)
{
	var complete = false;
	if (oFF.notNull(sacTableColumn))
	{
		var colIndex = colIndexOrig + this.getPreColumnsAmount();
		var rowList = this.getRowList();
		var rowListSize = rowList.size();
		var headerRowList = this.getHeaderRowList();
		var headerRowlistSize = headerRowList.size();
		var tupleRowsSize = this.m_tupleRows.size();
		var rowStartActual = tupleRowsSize > rowIndexStart ? rowList.getIndex(this.m_tupleRows.get(rowIndexStart)) : -1;
		var rowEndActual = tupleRowsSize > rowIndexEnd ? rowList.getIndex(this.m_tupleRows.get(rowIndexEnd)) : -1;
		var i;
		var row;
		if (this.getDataRowsTotalCount() > 0)
		{
			complete = rowStartActual > -1 && rowEndActual > -1 && rowStartActual < rowListSize && rowEndActual < rowListSize;
			if (complete)
			{
				for (i = rowStartActual; i <= rowEndActual; i++)
				{
					row = rowList.get(i);
					if (oFF.isNull(row) || row.getCells().size() <= colIndex || row.getCells().get(colIndex) === null || row.getCells().get(colIndex).getType() === -1)
					{
						complete = false;
						break;
					}
				}
			}
		}
		else if (headerRowlistSize > 0)
		{
			row = headerRowList.get(0);
			complete = oFF.notNull(row) && row.getCells().size() > colIndex && row.getCells().get(colIndex) !== null && row.getCells().get(colIndex).getType() !== -1;
		}
	}
	return complete;
};
oFF.SacAnalyticsTable.prototype.checkRowComplete = function(sacTableRow, columnIndexStart, columnIndexEnd)
{
	var complete = false;
	if (oFF.notNull(sacTableRow))
	{
		var cells = sacTableRow.getCells();
		var preColumnsAmount = this.getPreColumnsAmount();
		var size = cells.size();
		var i;
		if (this.getDataColumnsTotalCount() > 0)
		{
			var tupleColumnsSize = this.m_tupleColumns.size();
			var cellsStartActual = tupleColumnsSize > columnIndexStart ? preColumnsAmount + this.getColumnList().getIndex(this.m_tupleColumns.get(columnIndexStart)) : -1;
			var cellsEndActual = tupleColumnsSize > columnIndexEnd ? preColumnsAmount + this.getColumnList().getIndex(this.m_tupleColumns.get(columnIndexEnd)) : -1;
			complete = cellsStartActual > -1 && cellsEndActual > -1 && cellsStartActual < size && cellsEndActual < size;
			if (complete)
			{
				for (i = cellsStartActual; i <= cellsEndActual; i++)
				{
					if (cells.get(i) === null || cells.get(i).getType() === -1)
					{
						complete = false;
						break;
					}
				}
			}
		}
		else if (preColumnsAmount > 0)
		{
			complete = cells.get(0) !== null && cells.get(0).getType() !== -1;
		}
	}
	return complete;
};
oFF.SacAnalyticsTable.prototype.checkColumnsRange = function(columnIndexStart, columnIndexEnd)
{
	return this.getDataColumnsTotalCount() === 0 || this.checkListRange(this.m_tupleColumns, columnIndexStart, columnIndexEnd);
};
oFF.SacAnalyticsTable.prototype.checkRowsRange = function(rowIndexStart, rowIndexEnd)
{
	return this.getDataRowsTotalCount() === 0 || this.checkListRange(this.m_tupleRows, rowIndexStart, rowIndexEnd);
};
oFF.SacAnalyticsTable.prototype.checkListRange = function(list, indexStart, indexEnd)
{
	var passed = false;
	var size = list.size();
	if (indexStart <= size && indexEnd < size)
	{
		passed = true;
		for (var i = indexStart; i <= indexEnd; i++)
		{
			if (list.get(i) === null)
			{
				passed = false;
				break;
			}
		}
	}
	return passed;
};
oFF.SacAnalyticsTable.prototype.createScaleTextsMap = function()
{
	this.m_scaleTextsMap = oFF.XHashMapOfStringByString.create();
	this.m_scaleTextsMap.put(oFF.XStringUtils.concatenate2(oFF.ScaleFormat.SHORT.getName(), "_3"), this.m_overwriteTexts.getByKey(oFF.SacTableConstants.S_SCALE_SHORT_THOUSAND));
	this.m_scaleTextsMap.put(oFF.XStringUtils.concatenate2(oFF.ScaleFormat.SHORT.getName(), "_6"), this.m_overwriteTexts.getByKey(oFF.SacTableConstants.S_SCALE_SHORT_MILLION));
	this.m_scaleTextsMap.put(oFF.XStringUtils.concatenate2(oFF.ScaleFormat.SHORT.getName(), "_9"), this.m_overwriteTexts.getByKey(oFF.SacTableConstants.S_SCALE_SHORT_BILLION));
	this.m_scaleTextsMap.put(oFF.XStringUtils.concatenate2(oFF.ScaleFormat.LONG.getName(), "_3"), this.m_overwriteTexts.getByKey(oFF.SacTableConstants.S_SCALE_LONG_THOUSAND));
	this.m_scaleTextsMap.put(oFF.XStringUtils.concatenate2(oFF.ScaleFormat.LONG.getName(), "_6"), this.m_overwriteTexts.getByKey(oFF.SacTableConstants.S_SCALE_LONG_MILLION));
	this.m_scaleTextsMap.put(oFF.XStringUtils.concatenate2(oFF.ScaleFormat.LONG.getName(), "_9"), this.m_overwriteTexts.getByKey(oFF.SacTableConstants.S_SCALE_LONG_BILLION));
};
oFF.SacAnalyticsTable.prototype.getColumnDimensionMemberIndex = function()
{
	return this.m_columnDimensionMemberIndex;
};
oFF.SacAnalyticsTable.prototype.getRowDimensionMemberIndex = function()
{
	return this.m_rowDimensionMemberIndex;
};
oFF.SacAnalyticsTable.prototype.getColumnEmWidths = function()
{
	var columnWidths = oFF.XList.create();
	var i;
	var headerColumnList = this.getHeaderColumnList();
	var size = headerColumnList.size();
	for (i = 0; i < size; i++)
	{
		columnWidths.add(oFF.XIntegerValue.create(headerColumnList.get(i).getDefaultEmWidth()));
	}
	var columnList = this.getColumnList();
	size = columnList.size();
	var accumulator = 0;
	var column;
	for (i = 0; i < size; i++)
	{
		column = columnList.get(i);
		if (oFF.isNull(column))
		{
			break;
		}
		var currentWidth = column.getDefaultEmWidth();
		columnWidths.add(oFF.XIntegerValue.create(currentWidth));
		accumulator = accumulator + currentWidth;
	}
	var average = i === 0 ? 0 : oFF.XMath.div(accumulator, i);
	for (; i < size; i++)
	{
		column = columnList.get(i);
		if (oFF.isNull(column))
		{
			columnWidths.add(oFF.XIntegerValue.create(average));
		}
		else
		{
			columnWidths.add(oFF.XIntegerValue.create(column.getDefaultEmWidth()));
		}
	}
	var totalCount = this.getDataColumnsTotalCount();
	var maxColumns = this.getMaxColumns();
	for (; i < oFF.XMath.min(totalCount, maxColumns === 0 ? totalCount : maxColumns); i++)
	{
		columnWidths.add(oFF.XIntegerValue.create(average));
	}
	return columnWidths;
};
oFF.SacAnalyticsTable.prototype.putOverwriteText = function(key, value)
{
	this.m_overwriteTexts.put(key, value);
};
oFF.SacAnalyticsTable.prototype.getCurrentRowsOffset = function()
{
	return this.m_currentRowsOffset;
};
oFF.SacAnalyticsTable.prototype.isPartial = function()
{
	return this.m_partial;
};
oFF.SacAnalyticsTable.prototype.setPartial = function(partial)
{
	this.m_partial = partial;
};
oFF.SacAnalyticsTable.prototype.totalRowsCountMayBeInaccurate = function()
{
	return this.m_totalRowsCountMayBeInaccurate;
};
oFF.SacAnalyticsTable.prototype.totalColumnsCountMayBeInaccurate = function()
{
	return this.m_totalColumnsCountMayBeInaccurate;
};

oFF.SacAnalyticsColumn = function() {};
oFF.SacAnalyticsColumn.prototype = new oFF.SacTableColumn();
oFF.SacAnalyticsColumn.prototype._ff_c = "SacAnalyticsColumn";

oFF.SacAnalyticsColumn.createAnalyticsColumn = function(table)
{
	var instance = new oFF.SacAnalyticsColumn();
	instance.m_tupleIndex = -1;
	instance.m_dimensionIndex = -1;
	instance.setupInternal(table);
	return instance;
};
oFF.SacAnalyticsColumn.prototype.m_tupleIndex = 0;
oFF.SacAnalyticsColumn.prototype.m_fieldName = null;
oFF.SacAnalyticsColumn.prototype.m_dimensionIndex = 0;
oFF.SacAnalyticsColumn.prototype.releaseObject = function()
{
	this.m_tupleIndex = -1;
	this.m_fieldName = null;
	this.m_dimensionIndex = -1;
	oFF.SacTableColumn.prototype.releaseObject.call( this );
};
oFF.SacAnalyticsColumn.prototype.getTupleIndex = function()
{
	return this.m_tupleIndex;
};
oFF.SacAnalyticsColumn.prototype.setTupleIndex = function(tupleIndex)
{
	this.m_tupleIndex = tupleIndex;
};
oFF.SacAnalyticsColumn.prototype.getFieldName = function()
{
	return this.m_fieldName;
};
oFF.SacAnalyticsColumn.prototype.setFieldName = function(fieldName)
{
	this.m_fieldName = fieldName;
};
oFF.SacAnalyticsColumn.prototype.getDimensionIndex = function()
{
	return this.m_dimensionIndex;
};
oFF.SacAnalyticsColumn.prototype.setDimensionIndex = function(dimensionIndex)
{
	this.m_dimensionIndex = dimensionIndex;
};
oFF.SacAnalyticsColumn.prototype.getRootTupleIndex = function()
{
	if (this.getParentColumn() !== null && this.getParentColumn() !== this)
	{
		return this.getParentColumn().getRootTupleIndex();
	}
	return this.m_tupleIndex;
};

oFF.SacAnalyticsRow = function() {};
oFF.SacAnalyticsRow.prototype = new oFF.SacTableRow();
oFF.SacAnalyticsRow.prototype._ff_c = "SacAnalyticsRow";

oFF.SacAnalyticsRow.createAnalyticsRow = function(table)
{
	var instance = new oFF.SacAnalyticsRow();
	instance.m_tupleIndex = -1;
	instance.m_dimensionIndex = -1;
	instance.setupInternal(table);
	return instance;
};
oFF.SacAnalyticsRow.prototype.m_tupleIndex = 0;
oFF.SacAnalyticsRow.prototype.m_fieldName = null;
oFF.SacAnalyticsRow.prototype.m_dimensionIndex = 0;
oFF.SacAnalyticsRow.prototype.releaseObject = function()
{
	this.m_tupleIndex = -1;
	this.m_fieldName = null;
	this.m_dimensionIndex = -1;
	oFF.SacTableRow.prototype.releaseObject.call( this );
};
oFF.SacAnalyticsRow.prototype.getTupleIndex = function()
{
	return this.m_tupleIndex;
};
oFF.SacAnalyticsRow.prototype.setTupleIndex = function(tupleIndex)
{
	this.m_tupleIndex = tupleIndex;
};
oFF.SacAnalyticsRow.prototype.addNewAnalyticsCell = function()
{
	var newIndex = this.getCells().size();
	var referenceColumn = this.getReferenceColumn(newIndex);
	var newCell = oFF.SacAnalyticsCell._createAnalyticsCell(this, referenceColumn);
	this.addCell(newCell);
	return newCell;
};
oFF.SacAnalyticsRow.prototype.addNewAnalyticsCellAt = function(index, overwriteAtPosition)
{
	var i = this.getCells().size();
	for (; i < index; i++)
	{
		this.addCell(null);
	}
	if (overwriteAtPosition && i === index)
	{
		this.addCell(null);
	}
	var newCell = oFF.SacAnalyticsCell._createAnalyticsCell(this, this.getReferenceColumn(index));
	if (overwriteAtPosition)
	{
		this.setCellAt(index, newCell);
	}
	else
	{
		this.insertCellAt(index, newCell);
	}
	return newCell;
};
oFF.SacAnalyticsRow.prototype.getFieldName = function()
{
	return this.m_fieldName;
};
oFF.SacAnalyticsRow.prototype.setFieldName = function(fieldName)
{
	this.m_fieldName = fieldName;
};
oFF.SacAnalyticsRow.prototype.getDimensionIndex = function()
{
	return this.m_dimensionIndex;
};
oFF.SacAnalyticsRow.prototype.setDimensionIndex = function(dimensionIndex)
{
	this.m_dimensionIndex = dimensionIndex;
};
oFF.SacAnalyticsRow.prototype.addNewCell = function()
{
	return this.addNewAnalyticsCell();
};
oFF.SacAnalyticsRow.prototype.insertNewCellAtWithColumn = function(index, column, overwriteAtPosition)
{
	return this.addNewAnalyticsCellAt(index, overwriteAtPosition);
};
oFF.SacAnalyticsRow.prototype.prependBandTuple = function(newTuples, maxLevel)
{
	if (!this.isHeader() && oFF.XStream.of(this.getDataPath().getPathElements()).anyMatch( function(pe){
		return pe.getGroupLevel() === maxLevel && pe.isGroupLevelStart();
	}.bind(this)))
	{
		var newTuple = this.addHeaderBandTuple();
		this.moveOutBandInformation(newTuple, maxLevel);
		var newDataPath = newTuple.getDataPath();
		oFF.XStream.of(this.getDataPath().getPathElements()).filter( function(dpe){
			return dpe.getGroupLevel() <= maxLevel;
		}.bind(this)).forEach( function(dpel){
			var npel = newDataPath.addNewPathElement();
			npel.copyFrom(dpel, null);
			if (npel.getGroupLevel() === maxLevel)
			{
				npel.setHeaderBand(true);
				npel.setInnerBand(false);
				dpel.setGroupLevelStart(false);
				dpel.setSectionLevelStart(false);
			}
			newDataPath.updateMaxLevel(npel.getGroupLevel());
		}.bind(this));
		newTuples.add(newTuple);
	}
};
oFF.SacAnalyticsRow.prototype.moveOutBandInformation = function(newTuple, index)
{
	var thisCells = this.getCells();
	newTuple.setTupleIndex(this.getTupleIndex());
	var otherCells = newTuple.getCells();
	var headerColumnList = this.getParentTable().getHeaderColumnList();
	var headerColumnListSize = headerColumnList.size();
	var lastMatchingColumn = 0;
	for (var i = 0; i < headerColumnListSize; i++)
	{
		var headerColumn = headerColumnList.get(i);
		if (headerColumn.getDimensionIndex() === index)
		{
			var thisCell = thisCells.get(i);
			var otherCell = otherCells.get(i);
			otherCell.setFormatted(thisCell.getFormatted());
			otherCell.setPlain(thisCell.getPlain());
			otherCell.setShowDrillIcon(otherCell.isShowDrillIcon());
			thisCell.setFormatted("");
			thisCell.setShowDrillIcon(false);
			lastMatchingColumn = i;
		}
	}
	var lastMatchingCell = otherCells.get(lastMatchingColumn);
	lastMatchingCell.setMergedColumns(otherCells.size() - lastMatchingColumn - 1);
};
oFF.SacAnalyticsRow.prototype.getRootTupleIndex = function()
{
	if (this.getParentRow() !== null && this.getParentRow() !== this)
	{
		return this.getParentRow().getRootTupleIndex();
	}
	return this.m_tupleIndex;
};
oFF.SacAnalyticsRow.prototype.addNewChildRowBefore = function()
{
	var result = oFF.SacTableRow.prototype.addNewChildRowBefore.call( this );
	var localRows = this.getParentTable().getLocalRowList();
	var localIndex = localRows.getIndex(this);
	if (localIndex > -1)
	{
		localRows.insert(localIndex, result);
	}
	return result;
};
oFF.SacAnalyticsRow.prototype.addNewChildRowAfter = function()
{
	var result = oFF.SacTableRow.prototype.addNewChildRowAfter.call( this );
	var localRows = this.getParentTable().getLocalRowList();
	var localIndex = localRows.getIndex(this);
	if (localIndex > -1)
	{
		localRows.insert(localIndex + 1, result);
	}
	return result;
};

oFF.OlapDataPrg = function() {};
oFF.OlapDataPrg.prototype = new oFF.DfShellProgramWithApplication();
oFF.OlapDataPrg.prototype._ff_c = "OlapDataPrg";

oFF.OlapDataPrg.SYSTEM_NAME = "system";
oFF.OlapDataPrg.QUERY = "query";
oFF.OlapDataPrg.OUTPUT = "output";
oFF.OlapDataPrg.main = function()
{
	oFF.KernelNativeModule.getInstance();
	var kernelBoot = oFF.KernelBoot.createByName("olapdata");
	kernelBoot.setArgument("system", "KIW");
	kernelBoot.setArgument("query", "query:[0BICS_C03_BICSTEST_Q0000]");
	kernelBoot.setDefaultSyncType(oFF.SyncType.BLOCKING);
	kernelBoot.runFull();
};
oFF.OlapDataPrg.prototype.newProgram = function()
{
	var newPrg = new oFF.OlapDataPrg();
	newPrg.setup();
	return newPrg;
};
oFF.OlapDataPrg.prototype.getProgramName = function()
{
	return "olapdata";
};
oFF.OlapDataPrg.prototype.doSetupProgramMetadata = function(metadata)
{
	oFF.DfShellProgramWithApplication.prototype.doSetupProgramMetadata.call( this , metadata);
	metadata.addMandatoryOption(oFF.OlapDataPrg.SYSTEM_NAME, "The system name", "", oFF.XValueType.STRING);
	metadata.addMandatoryOption(oFF.OlapDataPrg.QUERY, "The query name", "", oFF.XValueType.STRING);
	metadata.addOption(oFF.OlapDataPrg.OUTPUT, "Output DOM id. If not given, the output is written on the console", "", oFF.XValueType.STRING);
};
oFF.OlapDataPrg.prototype.runProcess = function()
{
	this.writeToOutput("Initializing Query Manager...");
	var application = this.getApplication();
	var prgArgs = this.getArguments();
	var systemName = prgArgs.getStringByKey(oFF.OlapDataPrg.SYSTEM_NAME);
	var queryName = prgArgs.getStringByKey(oFF.OlapDataPrg.QUERY);
	var serviceCfg = oFF.QueryServiceConfig.createWithDataSourceName(application, systemName, queryName);
	serviceCfg.processQueryManagerCreation(null, this, null);
	return false;
};
oFF.OlapDataPrg.prototype.onQueryManagerCreated = function(extResult, queryManager, customIdentifier)
{
	if (extResult.hasErrors())
	{
		this.writeToOutput(extResult.getSummary());
	}
	else
	{
		this.writeToOutput("Loading Resultset...");
		queryManager.processQueryExecution(null, this, null);
	}
};
oFF.OlapDataPrg.prototype.onQueryExecuted = function(extResult, resultSetContainer, customIdentifier)
{
	if (extResult.hasErrors())
	{
		this.writeToOutput(extResult.getSummary());
	}
	else
	{
		var classicResultSet = resultSetContainer.getClassicResultSet();
		var grid = oFF.ReferenceGrid.create(classicResultSet);
		var ascii = grid.exportToAscii(30);
		this.writeToOutput(oFF.XStringUtils.concatenate3("<pre>", ascii, "</pre>"));
	}
};
oFF.OlapDataPrg.prototype.writeToOutput = function(text)
{
	var prgArgs = this.getArguments();
	var output = prgArgs.getStringByKey(oFF.OlapDataPrg.OUTPUT);
	if (oFF.XStringUtils.isNotNullAndNotEmpty(output))
	{
		oFF.DocumentEnv.setStringAtId(output, text);
	}
	else
	{
		this.println(text);
	}
};

oFF.RsVizChartContainer = function() {};
oFF.RsVizChartContainer.prototype = new oFF.RsVizVisualizationContainer();
oFF.RsVizChartContainer.prototype._ff_c = "RsVizChartContainer";

oFF.RsVizChartContainer.create = function(chartDefinition)
{
	var instance = new oFF.RsVizChartContainer();
	instance.setupVisualization(chartDefinition);
	instance.setupAction(null, null, null, chartDefinition);
	return instance;
};
oFF.RsVizChartContainer.prototype.setupVisualization = function(chartDefinition)
{
	this.setVisualizationDefinition(chartDefinition);
};
oFF.RsVizChartContainer.prototype.clearVisualizationData = function() {};
oFF.RsVizChartContainer.prototype.updateDefinition = function() {};
oFF.RsVizChartContainer.prototype.createVisualizationData = function() {};

oFF.RsVizCustomVisualizationContainer = function() {};
oFF.RsVizCustomVisualizationContainer.prototype = new oFF.RsVizVisualizationContainer();
oFF.RsVizCustomVisualizationContainer.prototype._ff_c = "RsVizCustomVisualizationContainer";

oFF.RsVizCustomVisualizationContainer.create = function(customDefinition)
{
	var instance = new oFF.RsVizCustomVisualizationContainer();
	instance.setupVisualization(customDefinition);
	instance.setupAction(null, null, null, customDefinition);
	return instance;
};
oFF.RsVizCustomVisualizationContainer.prototype.setupVisualization = function(customDefinition)
{
	this.setVisualizationDefinition(customDefinition);
};
oFF.RsVizCustomVisualizationContainer.prototype.clearVisualizationData = function() {};
oFF.RsVizCustomVisualizationContainer.prototype.updateDefinition = function() {};
oFF.RsVizCustomVisualizationContainer.prototype.createVisualizationData = function() {};

oFF.RsVizTableContainer = function() {};
oFF.RsVizTableContainer.prototype = new oFF.RsVizVisualizationContainer();
oFF.RsVizTableContainer.prototype._ff_c = "RsVizTableContainer";

oFF.RsVizTableContainer.create = function(tableDefinition)
{
	var instance = new oFF.RsVizTableContainer();
	instance.setupVisualization();
	instance.setupAction(null, null, null, tableDefinition);
	return instance;
};
oFF.RsVizTableContainer.prototype.m_columnTuples = null;
oFF.RsVizTableContainer.prototype.m_rowTuples = null;
oFF.RsVizTableContainer.prototype.m_columnDimensions = null;
oFF.RsVizTableContainer.prototype.m_rowDimensions = null;
oFF.RsVizTableContainer.prototype.m_pendingRowScrollPoint = 0;
oFF.RsVizTableContainer.prototype.m_pendingRowScrollPointEnd = 0;
oFF.RsVizTableContainer.prototype.m_pendingColScrollPoint = 0;
oFF.RsVizTableContainer.prototype.m_pendingColScrollPointEnd = 0;
oFF.RsVizTableContainer.prototype.m_scrollWindowMinRow = 0;
oFF.RsVizTableContainer.prototype.m_scrollWindowMaxRow = 0;
oFF.RsVizTableContainer.prototype.m_scrollWindowMinCol = 0;
oFF.RsVizTableContainer.prototype.m_scrollWindowMaxCol = 0;
oFF.RsVizTableContainer.prototype.m_pagingProcess = null;
oFF.RsVizTableContainer.prototype.m_pendingPaging = false;
oFF.RsVizTableContainer.prototype.m_rowPadding = 0;
oFF.RsVizTableContainer.prototype.m_colPadding = 0;
oFF.RsVizTableContainer.prototype.m_minRowFetch = 0;
oFF.RsVizTableContainer.prototype.m_minColFetch = 0;
oFF.RsVizTableContainer.prototype.m_maxRowLoad = 0;
oFF.RsVizTableContainer.prototype.m_maxColLoad = 0;
oFF.RsVizTableContainer.prototype.m_pendingQueryExecutedListener = null;
oFF.RsVizTableContainer.prototype.m_pendingSyncType = null;
oFF.RsVizTableContainer.prototype.m_pendingIdentifier = null;
oFF.RsVizTableContainer.prototype.setupVisualization = function()
{
	this.m_columnTuples = oFF.XList.create();
	this.m_rowTuples = oFF.XList.create();
	this.loadApplicationSettings();
};
oFF.RsVizTableContainer.prototype.loadApplicationSettings = function()
{
	var tableDefinition = this.getVisualizationDefinition();
	if (oFF.notNull(tableDefinition))
	{
		var applicationSettings = tableDefinition.getApplicationSettings();
		this.m_minColFetch = applicationSettings.getMinColumnsFetch();
		this.m_minRowFetch = applicationSettings.getMinRowsFetch();
		this.m_maxColLoad = applicationSettings.getMaxColumns();
		this.m_maxRowLoad = applicationSettings.getMaxRows();
		this.m_rowPadding = applicationSettings.getTileRowsPadding();
		this.m_colPadding = applicationSettings.getTileColumnsPadding();
	}
};
oFF.RsVizTableContainer.prototype.getResultTable = function()
{
	return this.getVisualizationData();
};
oFF.RsVizTableContainer.prototype.reschedulePendingScroll = function()
{
	this.processTileVisualization(this.m_pendingSyncType, this.m_pendingQueryExecutedListener, this.m_pendingIdentifier, this.m_pendingRowScrollPoint, this.m_pendingRowScrollPointEnd, this.m_pendingColScrollPoint, this.m_pendingColScrollPointEnd);
};
oFF.RsVizTableContainer.prototype.processTileVisualization = function(syncType, queryExecutedListener, customIdentifier, rowScrollReferencePoint, rowScrollEndReferencePoint, colScrollReferencePoint, colScrollEndReferencePoint)
{
	this.loadApplicationSettings();
	var busy = false;
	if (this.getQueryManager().isValid() && this.getQueryManager().getActiveResultSetContainer().getSyncState().isInSync())
	{
		var tableObject = this.getVisualizationData();
		var dataRowsCountTotal = tableObject.getDataRowsTotalCount() + (tableObject.totalRowsCountMayBeInaccurate() ? this.m_minRowFetch * 3 : 0);
		if (this.m_maxRowLoad > -1)
		{
			dataRowsCountTotal = oFF.XMath.min(this.m_maxRowLoad, dataRowsCountTotal);
		}
		var dataColsCountTotal = tableObject.getDataColumnsTotalCount() + (tableObject.totalColumnsCountMayBeInaccurate() ? this.m_minColFetch * 3 : 0);
		if (this.m_maxColLoad > -1)
		{
			dataColsCountTotal = oFF.XMath.min(this.m_maxColLoad, dataColsCountTotal);
		}
		this.m_pendingRowScrollPoint = -1;
		this.m_pendingRowScrollPointEnd = -1;
		this.m_pendingColScrollPoint = -1;
		this.m_pendingColScrollPointEnd = -1;
		var correctedRowScrollReferencePoint = oFF.XMath.max(0, oFF.XMath.min(dataRowsCountTotal - 1, rowScrollReferencePoint));
		var correctedColScrollReferencePoint = oFF.XMath.max(0, oFF.XMath.min(dataColsCountTotal - 1, colScrollReferencePoint));
		var newMinOrigRow = oFF.XMath.max(0, correctedRowScrollReferencePoint - this.m_rowPadding);
		var newMaxOrigRow = oFF.XMath.min(dataRowsCountTotal - 1, rowScrollEndReferencePoint + this.m_rowPadding);
		var newMinOrigCol = oFF.XMath.max(0, correctedColScrollReferencePoint - this.m_colPadding);
		var newMaxOrigCol = oFF.XMath.min(dataColsCountTotal - 1, colScrollEndReferencePoint + this.m_colPadding);
		var newMinRow = tableObject.getIndexOfFirstIncompleteTileRowAfter(newMinOrigCol, newMaxOrigCol, newMinOrigRow, newMaxOrigRow);
		var newMaxRow = oFF.XMath.max(0, tableObject.getIndexOfLastIncompleteTileRowBefore(newMinOrigCol, newMaxOrigCol, newMinOrigRow, newMaxOrigRow));
		var horizontalLazyLoad = this.m_minColFetch < this.m_maxColLoad;
		var newMinCol = 0;
		var newMaxCol = this.m_maxColLoad;
		if (horizontalLazyLoad)
		{
			newMinCol = tableObject.getIndexOfFirstIncompleteTileColumnAfter(newMinOrigCol, newMaxOrigCol, newMinOrigRow, newMaxOrigRow);
			newMaxCol = oFF.XMath.max(0, tableObject.getIndexOfLastIncompleteTileColumnBefore(newMinOrigCol, newMaxOrigCol, newMinOrigRow, newMaxOrigRow));
		}
		if (newMaxRow >= newMinRow && newMaxRow - newMinRow < this.m_minRowFetch)
		{
			if (newMaxRow === newMaxOrigRow)
			{
				newMaxRow = tableObject.getIndexOfLastIncompleteTileRowBefore(newMinCol, newMaxCol, newMinRow, oFF.XMath.min(dataRowsCountTotal - 1, newMinRow + this.m_minRowFetch));
			}
			if (newMinRow === newMinOrigRow)
			{
				newMinRow = tableObject.getIndexOfFirstIncompleteTileRowAfter(newMinCol, newMaxCol, oFF.XMath.max(0, newMaxRow - this.m_minRowFetch), newMaxRow);
			}
		}
		if (horizontalLazyLoad && newMaxCol >= newMinCol && newMaxCol - newMinCol < this.m_minColFetch)
		{
			if (newMaxCol === newMaxOrigCol)
			{
				newMaxCol = tableObject.getIndexOfLastIncompleteTileColumnBefore(newMinCol, oFF.XMath.min(dataColsCountTotal - 1, newMinCol + this.m_minColFetch), newMinRow, newMaxRow);
			}
			if (newMinCol === newMinOrigCol)
			{
				newMinCol = tableObject.getIndexOfFirstIncompleteTileColumnAfter(oFF.XMath.max(0, newMaxCol - this.m_minColFetch), newMaxCol, newMinRow, newMaxRow);
			}
		}
		if ((newMinRow <= newMaxOrigRow || newMaxOrigRow === -1) && newMaxRow >= newMinOrigRow && newMinRow <= newMaxRow && (newMinRow < dataRowsCountTotal || newMinRow === 0) && newMinRow > -1 && newMaxRow > -1 && (newMinCol <= newMaxOrigCol || newMaxOrigCol === -1) && newMaxCol >= newMinOrigCol && newMinCol <= newMaxCol && (newMinCol < dataColsCountTotal || newMinCol === 0) && newMinCol > -1 && newMaxCol > -1)
		{
			var smallWinStartRow = oFF.XMath.max(newMinRow, correctedRowScrollReferencePoint - this.m_rowPadding);
			var smallWinEndRow = oFF.XMath.min(newMaxRow, rowScrollEndReferencePoint + this.m_rowPadding);
			var smallWinStartCol = oFF.XMath.max(newMinCol, correctedColScrollReferencePoint - this.m_colPadding);
			var smallWinEndCol = oFF.XMath.min(newMaxCol, colScrollEndReferencePoint + this.m_colPadding);
			if (smallWinEndRow > this.m_scrollWindowMaxRow || smallWinStartRow < this.m_scrollWindowMinRow || smallWinEndCol > this.m_scrollWindowMaxCol || smallWinStartCol < this.m_scrollWindowMinCol)
			{
				busy = true;
				if (oFF.isNull(this.m_pagingProcess))
				{
					this.m_pendingPaging = false;
					this.executeWindowedRequest(syncType, queryExecutedListener, customIdentifier, newMinRow, newMaxRow, newMinCol, newMaxCol);
				}
				else
				{
					this.m_pendingRowScrollPoint = correctedRowScrollReferencePoint;
					this.m_pendingRowScrollPointEnd = rowScrollEndReferencePoint;
					this.m_pendingColScrollPoint = correctedColScrollReferencePoint;
					this.m_pendingColScrollPointEnd = colScrollEndReferencePoint;
					this.m_pendingQueryExecutedListener = queryExecutedListener;
					this.m_pendingIdentifier = customIdentifier;
					this.m_pendingSyncType = syncType;
					this.m_pendingPaging = true;
				}
			}
		}
	}
	else
	{
		this.m_pendingRowScrollPoint = rowScrollReferencePoint;
		this.m_pendingRowScrollPointEnd = rowScrollEndReferencePoint;
		this.m_pendingColScrollPoint = colScrollReferencePoint;
		this.m_pendingColScrollPointEnd = colScrollEndReferencePoint;
		this.m_pendingQueryExecutedListener = queryExecutedListener;
		this.m_pendingIdentifier = customIdentifier;
		this.m_pendingSyncType = syncType;
		this.m_pendingPaging = true;
	}
	return busy;
};
oFF.RsVizTableContainer.prototype.executeWindowedRequest = function(syncType, queryExecutedListener, customIdentifier, rowMin, rowMax, colMin, colMax)
{
	this.m_pendingPaging = false;
	var colMinEff = colMin < 0 ? 0 : colMin;
	var colMaxEff = colMax < 0 ? this.m_minColFetch : colMax;
	this.processQueryExecutionWindow(syncType, queryExecutedListener, customIdentifier, rowMin, rowMax - rowMin + 1, colMinEff, colMaxEff - colMinEff + 1);
	this.m_scrollWindowMinRow = rowMin;
	this.m_scrollWindowMaxRow = rowMax;
	this.m_scrollWindowMinCol = colMin;
	this.m_scrollWindowMaxCol = colMax;
};
oFF.RsVizTableContainer.prototype.processQueryExecutionWindow = function(syncType, queryExecutedListener, customIdentifier, startRow, sizeRow, startCol, sizeCol)
{
	var cmd = this.getQueryManager().getConvenienceCommands();
	if (sizeRow > 0)
	{
		cmd.setOffsetRows(startRow);
		cmd.setMaxRows(sizeRow);
	}
	if (sizeCol > 0)
	{
		cmd.setOffsetColumns(startCol);
		cmd.setMaxColumns(sizeCol);
	}
	this.m_pagingProcess = this.getQueryManager().processQueryExecution(syncType, queryExecutedListener, customIdentifier);
};
oFF.RsVizTableContainer.prototype.createVisualizationData = function()
{
	var applicationSettings = this.getVisualizationDefinition().getApplicationSettings();
	var tableDefinition = this.getVisualizationDefinition();
	var rsContainer = this.getQueryManager().getActiveResultSetContainer();
	var tableData = this.getVisualizationData();
	var offsetRows = rsContainer.getOffsetRows();
	var offsetColumns = rsContainer.getOffsetColumns();
	var hasData = true;
	var emptyResultToRender = rsContainer.hasErrors() || rsContainer.getSyncState().isNotInSync();
	if (oFF.isNull(tableData) || offsetRows === 0 && offsetColumns === 0 || emptyResultToRender)
	{
		tableData = oFF.SacAnalyticsTable._createAnalyticsTable();
		tableData.applyTableDefinition(tableDefinition);
		var overwriteTexts = applicationSettings.getOverwriteTexts();
		var overwriteTextKeys = overwriteTexts.getKeysAsIteratorOfString();
		while (overwriteTextKeys.hasNext())
		{
			var key = overwriteTextKeys.next();
			tableData.putOverwriteText(key, overwriteTexts.getByKey(key));
		}
		if (applicationSettings.getWidgetHeight() > 0)
		{
			tableData.setHeight(applicationSettings.getWidgetHeight());
		}
		if (applicationSettings.getWidgetWidth() > 0)
		{
			tableData.setWidth(applicationSettings.getWidgetWidth());
		}
		hasData = !emptyResultToRender && tableData.preFill(rsContainer.getCursorResultSet());
	}
	if (hasData)
	{
		var cursorResultSet = rsContainer.getCursorResultSet();
		var lastRow = offsetRows + oFF.XMath.max(cursorResultSet.getDataRows(), cursorResultSet.getCursorRowsAxis().getTuplesCount()) - 1;
		var lastColumn = offsetColumns + oFF.XMath.max(cursorResultSet.getDataColumns(), cursorResultSet.getCursorColumnsAxis().getTuplesCount()) - 1;
		var lowerRow = tableData.getIndexOfFirstUndefinedRowAfter(offsetRows);
		var upperRow = tableData.getIndexOfLastUndefinedRowBefore(lastRow);
		var lowerColumn = tableData.getIndexOfFirstUndefinedColumnAfter(offsetColumns);
		var upperColumn = tableData.getIndexOfLastUndefinedColumnBefore(lastColumn);
		if (lowerRow <= upperRow)
		{
			var newOffsetRows = tableData.prepareDataRows(cursorResultSet, lowerRow, upperRow);
			if (lowerRow === offsetRows)
			{
				offsetRows = newOffsetRows;
			}
		}
		if (lowerColumn <= upperColumn)
		{
			var newOffsetColumns = tableData.prepareDataColumns(cursorResultSet, lowerColumn, upperColumn);
			if (lowerColumn === offsetColumns)
			{
				offsetColumns = newOffsetColumns;
			}
		}
		tableData.fillDataCells(cursorResultSet, offsetRows, offsetColumns);
		tableData.formatTable(offsetRows, upperRow, offsetColumns, upperColumn);
		tableData.setPartial(offsetRows > 0 || offsetColumns > 0);
	}
	else
	{
		tableData.fillEmptyTable(tableDefinition);
	}
	this.updateModel();
	if (offsetRows === 0 && offsetColumns === 0)
	{
		this.m_scrollWindowMaxCol = 0;
		this.m_scrollWindowMinCol = 0;
		this.m_scrollWindowMaxRow = 0;
		this.m_scrollWindowMinRow = 0;
	}
	this.setVisualizationData(tableData);
	this.m_pagingProcess = null;
	if (this.m_pendingPaging)
	{
		this.m_pendingPaging = false;
		this.reschedulePendingScroll();
	}
};
oFF.RsVizTableContainer.prototype.clearVisualizationData = function()
{
	var tableDefinition = this.getVisualizationDefinition();
	var tableData = oFF.SacAnalyticsTable._createAnalyticsTable();
	tableData.applyTableDefinition(tableDefinition);
	tableData.fillEmptyTable(tableDefinition);
	this.setVisualizationData(tableData);
};
oFF.RsVizTableContainer.prototype.updateDefinition = function()
{
	if (this.getResultTable() !== null && this.getVisualizationDefinition() !== null)
	{
		this.getResultTable().applyTableDefinition(this.getVisualizationDefinition());
	}
};
oFF.RsVizTableContainer.prototype.applyRenderingScope = function(rowStartViewPort, rowEndViewPort, colStartViewPort, colEndViewPort)
{
	var tableObject = this.getVisualizationData();
	if (oFF.notNull(tableObject))
	{
		var newMinOrigRow = oFF.XMath.max(0, rowStartViewPort - this.m_rowPadding);
		var newMaxOrigRow = rowEndViewPort + this.m_rowPadding;
		var newMinOrigCol = oFF.XMath.max(0, colStartViewPort - this.m_colPadding);
		var newMaxOrigCol = colEndViewPort + this.m_colPadding;
		tableObject.setRenderingScope(newMinOrigRow, newMaxOrigRow, newMinOrigCol, newMaxOrigCol);
	}
};
oFF.RsVizTableContainer.prototype.resetRenderingScope = function()
{
	var tableObject = this.getVisualizationData();
	if (oFF.notNull(tableObject))
	{
		tableObject.resetRenderingScope();
	}
};
oFF.RsVizTableContainer.prototype.updateModel = function()
{
	var resultSetContainer = this.getQueryManager().getActiveResultSetContainer();
	var classicResultSet = resultSetContainer.isCursorResultSetAvailable() ? resultSetContainer.getClassicResultSet() : null;
	if (oFF.notNull(classicResultSet))
	{
		var rcc = classicResultSet.getResultSetContainer();
		var offsetColumns = rcc.getOffsetColumns();
		var offsetRows = rcc.getOffsetRows();
		if (offsetColumns === 0 && offsetRows === 0)
		{
			this.m_columnTuples.clear();
			this.m_columnDimensions = classicResultSet.getColumnsAxis().getRsDimensions();
			this.m_rowTuples.clear();
			this.m_rowDimensions = classicResultSet.getRowsAxis().getRsDimensions();
		}
		this.fillAxis(offsetColumns, classicResultSet.getColumnsAxis(), this.m_columnTuples);
		this.fillAxis(offsetRows, classicResultSet.getRowsAxis(), this.m_rowTuples);
	}
};
oFF.RsVizTableContainer.prototype.fillAxis = function(offset, axis, tuples)
{
	var i = 0;
	var tuplesSize = tuples.size();
	var tuplesCount = axis.getTuplesCount();
	if (offset > tuplesSize)
	{
		for (var h = tuplesSize; h < offset; h++)
		{
			tuples.add(null);
		}
	}
	else if (offset < tuplesSize)
	{
		for (; i < tuplesCount && i + offset < tuplesSize; i++)
		{
			tuples.set(i + offset, axis.getTupleAt(i));
		}
	}
	for (; i < tuplesCount; i++)
	{
		tuples.add(axis.getTupleAt(i));
	}
};
oFF.RsVizTableContainer.prototype.getDocumentId = function(column, row)
{
	var cellObject = this.getCellObjectAt(column, row);
	var documentId = null;
	if (oFF.notNull(cellObject))
	{
		documentId = cellObject.getCommentDocumentId();
	}
	return documentId;
};
oFF.RsVizTableContainer.prototype.getRowAtIndex = function(index)
{
	var result = null;
	var resultTable = this.getResultTable();
	if (oFF.notNull(resultTable))
	{
		var headerRowList = resultTable.getHeaderRowList();
		var headerRowSize = headerRowList.size();
		var rowList = resultTable.getRowList();
		if (index > -1 && index < headerRowSize)
		{
			result = headerRowList.get(index);
		}
		else if (index >= headerRowSize && index - headerRowSize < rowList.size())
		{
			result = rowList.get(index - headerRowSize);
		}
	}
	return result;
};
oFF.RsVizTableContainer.prototype.getColumnAtIndex = function(index)
{
	var result = null;
	var resultTable = this.getResultTable();
	if (oFF.notNull(resultTable))
	{
		var headerColumnList = resultTable.getHeaderColumnList();
		var headerColumnSize = headerColumnList.size();
		var columnList = resultTable.getColumnList();
		if (index > -1 && index < headerColumnSize)
		{
			result = headerColumnList.get(index);
		}
		else if (index >= headerColumnSize && index - headerColumnSize < columnList.size())
		{
			result = columnList.get(index - headerColumnSize);
		}
	}
	return result;
};
oFF.RsVizTableContainer.prototype.getHeaderColumnAmount = function()
{
	var headerColumnAmount = -1;
	var resultTable = this.getResultTable();
	if (oFF.notNull(resultTable))
	{
		headerColumnAmount = resultTable.getPreColumnsAmount();
	}
	return headerColumnAmount;
};
oFF.RsVizTableContainer.prototype.getHeaderRowAmount = function()
{
	var headerRowAmount = -1;
	var resultTable = this.getResultTable();
	if (oFF.notNull(resultTable))
	{
		headerRowAmount = resultTable.getPreRowsAmount();
	}
	return headerRowAmount;
};
oFF.RsVizTableContainer.prototype.getHeaderEndRow = function()
{
	var headerRowAmount = -1;
	var resultTable = this.getResultTable();
	if (oFF.notNull(resultTable))
	{
		headerRowAmount = resultTable.getHeaderEndRow();
	}
	return headerRowAmount;
};
oFF.RsVizTableContainer.prototype.getRowTupleIndex = function(row)
{
	var tupleIndex = -1;
	var analyticsRow = this.getRowAtIndex(row);
	if (oFF.notNull(analyticsRow))
	{
		tupleIndex = analyticsRow.getTupleIndex();
	}
	return tupleIndex;
};
oFF.RsVizTableContainer.prototype.getColumnTupleIndex = function(column)
{
	var tupleIndex = -1;
	var analyticsColumn = this.getColumnAtIndex(column);
	if (oFF.notNull(analyticsColumn))
	{
		tupleIndex = analyticsColumn.getTupleIndex();
	}
	return tupleIndex;
};
oFF.RsVizTableContainer.prototype.isEmptyHeaderCell = function(column, row)
{
	var cell = this.getCellObjectAt(column, row);
	return row < this.getHeaderRowAmount() && this.hasRowDimensions() && column <= this.getHeaderColumnAmount() && oFF.notNull(cell) && cell.getType() === oFF.SacTableConstants.CT_HEADER;
};
oFF.RsVizTableContainer.prototype.isOnHeaderColumn = function(column)
{
	return this.getResultTable() !== null && this.hasRowDimensions() && column < this.getHeaderColumnAmount();
};
oFF.RsVizTableContainer.prototype.isOnDataColumn = function(column)
{
	return this.getResultTable() !== null && column >= this.getHeaderColumnAmount();
};
oFF.RsVizTableContainer.prototype.isOnHeaderRow = function(row)
{
	return this.getResultTable() !== null && this.hasColumnDimensions() && row < this.getHeaderRowAmount() && row <= this.getHeaderEndRow();
};
oFF.RsVizTableContainer.prototype.isOnDataRow = function(row)
{
	return this.getResultTable() !== null && row >= this.getHeaderRowAmount();
};
oFF.RsVizTableContainer.prototype.getColumnTuple = function(column)
{
	var correctedColumn = this.getColumnTupleIndex(column);
	if (correctedColumn > -1 && correctedColumn < this.m_columnTuples.size())
	{
		return this.m_columnTuples.get(correctedColumn);
	}
	return null;
};
oFF.RsVizTableContainer.prototype.getColumnTuples = function(columnMin, columnMax)
{
	var result = oFF.XList.create();
	var correctedColumnMin = this.getColumnTupleIndex(columnMin);
	var correctedColumnMax = this.getColumnTupleIndex(columnMax);
	if (correctedColumnMin > -1 && correctedColumnMax < this.m_columnTuples.size())
	{
		for (var i = correctedColumnMin; i <= correctedColumnMax; i++)
		{
			result.add(this.m_columnTuples.get(i));
		}
	}
	return result;
};
oFF.RsVizTableContainer.prototype.getRowTuple = function(row)
{
	var correctedRow = this.getRowTupleIndex(row);
	if (correctedRow > -1 && correctedRow < this.m_rowTuples.size())
	{
		return this.m_rowTuples.get(correctedRow);
	}
	return null;
};
oFF.RsVizTableContainer.prototype.getRowTuples = function(rowMin, rowMax)
{
	var result = oFF.XList.create();
	var correctedRowMin = this.getRowTupleIndex(rowMin);
	var correctedRowMax = this.getRowTupleIndex(rowMax);
	if (correctedRowMin > -1 && correctedRowMax < this.m_rowTuples.size())
	{
		for (var i = correctedRowMin; i <= correctedRowMax; i++)
		{
			result.add(this.m_rowTuples.get(i));
		}
	}
	return result;
};
oFF.RsVizTableContainer.prototype.getColumnTupleElement = function(column, row)
{
	var correctedColumn = this.getColumnTupleIndex(column);
	if (correctedColumn > -1 && correctedColumn < this.m_columnTuples.size() && this.isOnHeaderRow(row))
	{
		var rowObject = this.getRowAtIndex(row);
		if (oFF.notNull(rowObject))
		{
			var dimIndex = rowObject.getDimensionIndex();
			var columnTuple = this.m_columnTuples.get(correctedColumn);
			if (dimIndex > -1 && oFF.notNull(columnTuple))
			{
				return columnTuple.getTupleElementAt(dimIndex);
			}
		}
	}
	return null;
};
oFF.RsVizTableContainer.prototype.getColumnTupleElements = function(columnMin, columnMax, rowMin, rowMax)
{
	var result = oFF.XList.create();
	var correctedColumnMin = this.getColumnTupleIndex(columnMin);
	var correctedColumnMax = this.getColumnTupleIndex(columnMax);
	if (correctedColumnMin > -1 && correctedColumnMax < this.m_columnTuples.size() && this.isOnHeaderRow(rowMin) && this.isOnHeaderRow(rowMax))
	{
		for (var row = rowMin; row <= rowMax; row++)
		{
			var rowObject = this.getRowAtIndex(row);
			if (oFF.notNull(rowObject))
			{
				var dimIndex = rowObject.getDimensionIndex();
				if (dimIndex > -1)
				{
					for (var i = correctedColumnMin; i <= correctedColumnMax; i++)
					{
						var columnTuple = this.m_columnTuples.get(i);
						if (oFF.notNull(columnTuple))
						{
							var tupleElement = columnTuple.getTupleElementAt(dimIndex);
							if (!result.contains(tupleElement))
							{
								result.add(tupleElement);
							}
						}
					}
				}
			}
		}
	}
	return result;
};
oFF.RsVizTableContainer.prototype.getRowTupleElement = function(column, row)
{
	var correctedRow = this.getRowTupleIndex(row);
	if (correctedRow > -1 && correctedRow < this.m_rowTuples.size() && this.isOnHeaderColumn(column))
	{
		var columnObject = this.getColumnAtIndex(column);
		if (oFF.notNull(columnObject))
		{
			var dimIndex = columnObject.getDimensionIndex();
			var rowTuple = this.m_rowTuples.get(correctedRow);
			if (dimIndex > -1 && oFF.notNull(rowTuple))
			{
				return rowTuple.getTupleElementAt(dimIndex);
			}
		}
	}
	return null;
};
oFF.RsVizTableContainer.prototype.getRowTupleElements = function(columnMin, columnMax, rowMin, rowMax)
{
	var result = oFF.XList.create();
	var correctedRowMin = this.getRowTupleIndex(rowMin);
	var correctedRowMax = this.getRowTupleIndex(rowMax);
	if (correctedRowMin > -1 && correctedRowMax < this.m_rowTuples.size() && this.isOnHeaderColumn(columnMin) && this.isOnHeaderColumn(columnMax))
	{
		for (var column = columnMin; column <= columnMax; column++)
		{
			var columnObject = this.getColumnAtIndex(column);
			if (oFF.notNull(columnObject))
			{
				var dimIndex = columnObject.getDimensionIndex();
				if (dimIndex > -1)
				{
					for (var i = correctedRowMin; i <= correctedRowMax; i++)
					{
						var rowTuple = this.m_rowTuples.get(i);
						if (oFF.notNull(rowTuple))
						{
							var tupleElement = rowTuple.getTupleElementAt(dimIndex);
							if (!result.contains(tupleElement))
							{
								result.add(rowTuple.getTupleElementAt(dimIndex));
							}
						}
					}
				}
			}
		}
	}
	return result;
};
oFF.RsVizTableContainer.prototype.getColumnTupleFieldName = function(row)
{
	if (this.isOnHeaderRow(row))
	{
		var rowObject = this.getRowAtIndex(row);
		if (oFF.notNull(rowObject) && oFF.XStringUtils.isNotNullAndNotEmpty(rowObject.getFieldName()))
		{
			return rowObject.getFieldName();
		}
	}
	return null;
};
oFF.RsVizTableContainer.prototype.getColumnTupleFieldNames = function(rowMin, rowMax, enforceSameDimension)
{
	var rowObjectMin = this.getRowAtIndex(rowMin);
	var rowObjectMax = this.getRowAtIndex(rowMax);
	if (!enforceSameDimension || oFF.notNull(rowObjectMin) && oFF.notNull(rowObjectMax) && rowObjectMin.getDimensionIndex() === rowObjectMax.getDimensionIndex())
	{
		var result = oFF.XListOfString.create();
		for (var i = rowMin; i <= rowMax; i++)
		{
			var rowObject = this.getRowAtIndex(i);
			if (oFF.notNull(rowObject) && oFF.XStringUtils.isNotNullAndNotEmpty(rowObject.getFieldName()))
			{
				result.add(rowObject.getFieldName());
			}
		}
		return result;
	}
	return null;
};
oFF.RsVizTableContainer.prototype.getRowTupleFieldName = function(column)
{
	if (this.isOnHeaderColumn(column))
	{
		var columnObject = this.getColumnAtIndex(column);
		if (oFF.notNull(columnObject) && oFF.XStringUtils.isNotNullAndNotEmpty(columnObject.getFieldName()))
		{
			return columnObject.getFieldName();
		}
	}
	return null;
};
oFF.RsVizTableContainer.prototype.getRowTupleFieldNames = function(columnMin, columnMax, enforceSameDimension)
{
	var columnObjectMin = this.getColumnAtIndex(columnMin);
	var columnObjectMax = this.getColumnAtIndex(columnMax);
	if (!enforceSameDimension || oFF.notNull(columnObjectMin) && oFF.notNull(columnObjectMax) && columnObjectMin.getDimensionIndex() === columnObjectMax.getDimensionIndex())
	{
		var result = oFF.XListOfString.create();
		for (var i = columnMin; i <= columnMax; i++)
		{
			var columnObject = this.getColumnAtIndex(i);
			if (oFF.notNull(columnObject) && oFF.XStringUtils.isNotNullAndNotEmpty(columnObject.getFieldName()))
			{
				result.add(columnObject.getFieldName());
			}
		}
		return result;
	}
	return null;
};
oFF.RsVizTableContainer.prototype.getColumnDimensionStrict = function(column, row)
{
	if (column === this.getHeaderColumnAmount() - 1)
	{
		return this.getColumnDimension(row);
	}
	return null;
};
oFF.RsVizTableContainer.prototype.getColumnDimension = function(row)
{
	if (this.isOnHeaderRow(row))
	{
		var rowObject = this.getRowAtIndex(row);
		if (oFF.notNull(rowObject))
		{
			var dimIndex = rowObject.getDimensionIndex();
			return dimIndex < 0 ? null : this.m_columnDimensions.get(dimIndex);
		}
	}
	return null;
};
oFF.RsVizTableContainer.prototype.getColumnDimensions = function(rowMin, rowMax)
{
	var result = oFF.XList.create();
	if (this.isOnHeaderRow(rowMax))
	{
		for (var i = rowMin; i <= rowMax; i++)
		{
			var rowObject = this.getRowAtIndex(i);
			if (oFF.notNull(rowObject))
			{
				var dimIndex = rowObject.getDimensionIndex();
				var curDim = dimIndex < 0 ? null : this.m_columnDimensions.get(dimIndex);
				if (oFF.notNull(curDim) && !result.contains(curDim))
				{
					result.add(curDim);
				}
			}
		}
	}
	return result;
};
oFF.RsVizTableContainer.prototype.getRowDimensionStrict = function(column, row)
{
	if (row === this.getHeaderRowAmount() - 1)
	{
		return this.getRowDimension(column);
	}
	return null;
};
oFF.RsVizTableContainer.prototype.getRowDimension = function(column)
{
	if (this.isOnHeaderColumn(column))
	{
		var columnObject = this.getColumnAtIndex(column);
		if (oFF.notNull(columnObject))
		{
			var dimIndex = columnObject.getDimensionIndex();
			return dimIndex < 0 ? null : this.m_rowDimensions.get(dimIndex);
		}
	}
	return null;
};
oFF.RsVizTableContainer.prototype.getRowDimensions = function(columnMin, columnMax)
{
	var result = oFF.XList.create();
	if (this.isOnHeaderColumn(columnMax))
	{
		for (var i = columnMin; i <= columnMax; i++)
		{
			var columnObject = this.getColumnAtIndex(i);
			if (oFF.notNull(columnObject))
			{
				var dimIndex = columnObject.getDimensionIndex();
				var curDim = dimIndex < 0 ? null : this.m_rowDimensions.get(dimIndex);
				if (oFF.notNull(curDim) && !result.contains(curDim))
				{
					result.add(curDim);
				}
			}
		}
	}
	return result;
};
oFF.RsVizTableContainer.prototype.hasColumnDimensions = function()
{
	return oFF.XStream.of(this.m_columnDimensions).anyMatch( function(cDim){
		var colDim = cDim.getQueryModel().getDimensionByName(cDim.getName());
		return colDim.isUniversalDisplayHierarchyDimension() && cDim.getResultSetFields().size() > 0 || colDim.getFieldLayoutType() === oFF.FieldLayoutType.ATTRIBUTE_BASED && colDim.getResultSetAttributes().size() > 0 || colDim.getFieldLayoutType() === oFF.FieldLayoutType.FIELD_BASED && colDim.getResultSetFields().size() > 0;
	}.bind(this));
};
oFF.RsVizTableContainer.prototype.hasRowDimensions = function()
{
	return oFF.XStream.of(this.m_rowDimensions).anyMatch( function(rDim){
		var rowDim = rDim.getQueryModel().getDimensionByName(rDim.getName());
		return rowDim.isUniversalDisplayHierarchyDimension() && rDim.getResultSetFields().size() > 0 || rowDim.getFieldLayoutType() === oFF.FieldLayoutType.ATTRIBUTE_BASED && rowDim.getResultSetAttributes().size() > 0 || rowDim.getFieldLayoutType() === oFF.FieldLayoutType.FIELD_BASED && rowDim.getResultSetFields().size() > 0;
	}.bind(this));
};
oFF.RsVizTableContainer.prototype.releaseObject = function()
{
	this.m_columnTuples = null;
	this.m_rowTuples = null;
	this.m_columnDimensions = null;
	this.m_rowDimensions = null;
	oFF.RsVizVisualizationContainer.prototype.releaseObject.call( this );
};
oFF.RsVizTableContainer.prototype.getCellObjectAt = function(column, row)
{
	var rowObject = this.getRowAtIndex(row);
	var cellObject = null;
	if (oFF.notNull(rowObject))
	{
		var cellObjectList = rowObject.getCells();
		if (column < cellObjectList.size())
		{
			cellObject = cellObjectList.get(column);
		}
	}
	return cellObject;
};
oFF.RsVizTableContainer.prototype.getTargetDropAxisType = function(column, row)
{
	var result = null;
	var cellObject = this.getCellObjectAt(column, row);
	if (oFF.notNull(cellObject))
	{
		var cellTypeInt = cellObject.getType();
		if (cellTypeInt === oFF.SacTableConstants.CT_EMPTY_AXIS_ROW_HEADER)
		{
			result = oFF.AxisType.ROWS;
		}
		else if (cellTypeInt === oFF.SacTableConstants.CT_EMPTY_AXIS_COLUMN_HEADER)
		{
			result = oFF.AxisType.COLUMNS;
		}
	}
	return result;
};

oFF.OlapReferenceModule = function() {};
oFF.OlapReferenceModule.prototype = new oFF.DfModule();
oFF.OlapReferenceModule.prototype._ff_c = "OlapReferenceModule";

oFF.OlapReferenceModule.s_module = null;
oFF.OlapReferenceModule.getInstance = function()
{
	if (oFF.isNull(oFF.OlapReferenceModule.s_module))
	{
		oFF.DfModule.checkInitialized(oFF.OlapApiModule.getInstance());
		oFF.DfModule.checkInitialized(oFF.VisualizationImplModule.getInstance());
		oFF.OlapReferenceModule.s_module = oFF.DfModule.startExt(new oFF.OlapReferenceModule());
		oFF.RsVisualizationContainerFactory.setInstance(oFF.RsVizContainerFactoryImpl.create());
		oFF.ReferenceGridFactory.setInstance(oFF.ReferenceGridFactoryImpl.create());
		oFF.FioriGridFactory.setInstance(oFF.FioriGridFactoryImpl.create());
		oFF.RsGoogleChartConfig.staticSetup();
		oFF.ChartRendererFactory.setInstance(oFF.ChartRendererFactoryImpl.create());
		oFF.KpiRendererFactory.setInstance(oFF.KpiRendererFactoryImpl.create());
		oFF.GridRendererFactory.setInstance(oFF.GridRendererFactoryImpl.create());
		oFF.TableClipboardHelperFactory.setInstance(oFF.SacTableClipboardHelperFactory.create());
		oFF.AnalyticTableExportHelperFactory.setInstance(oFF.SacAnalyticTableExportHelperFactory.create());
		oFF.DfModule.stopExt(oFF.OlapReferenceModule.s_module);
	}
	return oFF.OlapReferenceModule.s_module;
};
oFF.OlapReferenceModule.prototype.getName = function()
{
	return "ff4340.olap.reference";
};

oFF.OlapReferenceModule.getInstance();

return sap.firefly;
	} );