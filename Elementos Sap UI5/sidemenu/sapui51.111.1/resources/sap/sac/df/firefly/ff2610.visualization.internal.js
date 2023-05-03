/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
sap.ui.define(["sap/sac/df/firefly/ff2600.visualization.abstract"],function(t){"use strict";t.CellChartInfo=function(){};t.CellChartInfo.prototype=new t.XObject;t.CellChartInfo.prototype._ff_c="CellChartInfo";t.CellChartInfo.create=function(n,o,e,l){var a=new t.CellChartInfo;a.m_orientation=n;a.m_startColumn=o;a.m_endColumn=o;a.m_startRow=e;a.m_endRow=e;a.m_maxValue=l;a.m_minValue=l;a.m_columns=t.XList.create();a.m_columns.add(t.XIntegerValue.create(o));return a};t.CellChartInfo.prototype.m_orientation=null;t.CellChartInfo.prototype.m_startRow=0;t.CellChartInfo.prototype.m_endRow=0;t.CellChartInfo.prototype.m_startColumn=0;t.CellChartInfo.prototype.m_endColumn=0;t.CellChartInfo.prototype.m_minValue=0;t.CellChartInfo.prototype.m_maxValue=0;t.CellChartInfo.prototype.m_columns=null;t.CellChartInfo.prototype.addColumn=function(n){var o=t.XIntegerValue.create(n);if(!this.m_columns.contains(o)){this.m_columns.add(o);this.m_startColumn=t.XMath.max(this.m_startColumn,n);this.m_endColumn=t.XMath.max(this.m_endColumn,n)}};t.CellChartInfo.prototype.addRow=function(n){this.m_startRow=t.XMath.max(this.m_startColumn,n);this.m_endRow=t.XMath.max(this.m_endColumn,n)};t.CellChartInfo.prototype.registerValue=function(t){if(this.m_minValue>t){this.m_minValue=t}if(this.m_maxValue<t){this.m_maxValue=t}};t.CellChartInfo.prototype.getOrientation=function(){return this.m_orientation};t.CellChartInfo.prototype.getStartRow=function(){return this.m_startRow};t.CellChartInfo.prototype.getEndRow=function(){return this.m_endRow};t.CellChartInfo.prototype.getStartColumn=function(){return this.m_startColumn};t.CellChartInfo.prototype.getEndColumn=function(){return this.m_endColumn};t.CellChartInfo.prototype.getMinValue=function(){return this.m_minValue};t.CellChartInfo.prototype.getMaxValue=function(){return this.m_maxValue};t.CellChartInfo.prototype.getColumns=function(){return this.m_columns};t.VisualizationInternalModule=function(){};t.VisualizationInternalModule.prototype=new t.DfModule;t.VisualizationInternalModule.prototype._ff_c="VisualizationInternalModule";t.VisualizationInternalModule.s_module=null;t.VisualizationInternalModule.getInstance=function(){if(t.isNull(t.VisualizationInternalModule.s_module)){t.DfModule.checkInitialized(t.VisualizationAbstractModule.getInstance());t.VisualizationInternalModule.s_module=t.DfModule.startExt(new t.VisualizationInternalModule);t.DfModule.stopExt(t.VisualizationInternalModule.s_module)}return t.VisualizationInternalModule.s_module};t.VisualizationInternalModule.prototype.getName=function(){return"ff2610.visualization.internal"};t.VisualizationInternalModule.getInstance();return sap.firefly});
//# sourceMappingURL=ff2610.visualization.internal.js.map