/*
 * SAPUI5
  (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["jquery.sap.global"],function(jQuery){jQuery.sap.declare("sap.zen.dsh.zen_rt_components_infochart");sap.zen.dsh.com_sap_ip_bi_InfoChart={getSelectedMember:function(t){if(typeof t!=="string"){t=t.name}var e={};if(this.dataSelected){e=JSON.parse(this.dataSelected)}var _;if(e){var a=e[t];if(a&&a.length!=0){_=a[0]}}return this.createMember(t,_)},getSelectedMembers:function(t){if(typeof t!=="string"){t=t.name}var e=[];var _={};if(this.dataSelected){_=JSON.parse(this.dataSelected)}var a=_[t];if(a){for(var r=0;r<a.length;r++){var I=a[r];var O=this.createMember(t,I);e.push(O)}}return e},showTotals:function(t){this.showTotals=t},showDataLabels:function(t){this.updateChartPropertyByPath("plotArea.dataLabel.visible",t)},showScalingFactors:function(t){this.showScaling=t},getChartType:function(){var t=this.charttype;var e=t.__value__||t;e=e.replace("info/","INFO_").toUpperCase();return e},setChartType:function(t){var e=undefined;var _=this.charttype;if(!_.__value__){e=_;_={}}else{e=_.__value__}t=t.replace("INFO_","info/").toLowerCase();_.__value__=t;_[t]=_[e]||{properties:{}};this.charttype=_},setDataSelection:function(t){this.data=t},getLegendPosition:function(){return this.getChartPropertyByPath("legendGroup.layout.position","right")},setLegendPosition:function(t){this.updateChartPropertyByPath("legendGroup.layout.position",t.toLowerCase())},clearSelection:function(){this.chartSelection="CLEAR";this.dataSelected="{}"},getAxisScalingMin:function(t){return this.getChartPropertyByPath("plotArea."+this.getAxisFromEnum(t)+".minValue",0)},getAxisScalingMax:function(t){return this.getChartPropertyByPath("plotArea."+this.getAxisFromEnum(t)+".maxValue",0)},setAxisScaling:function(t,e,_){var a=this.getAxisFromEnum(t);this.updateChartPropertyByPath("plotArea."+a+".fixedRange",true);this.updateChartPropertyByPath("plotArea."+a+".minValue",e);this.updateChartPropertyByPath("plotArea."+a+".maxValue",_)},removeAxisScaling:function(t){var e="plotArea."+this.getAxisFromEnum(t);var _=this.getChartPropertyByPath(e);if(_){this.updateChartPropertyByPath(e+".fixedRange",false);this.updateChartPropertyByPath(e+".minValue","");this.updateChartPropertyByPath(e+".maxValue","")}},setCvomBinding:function(t){return this.cvombinding=t},getChartPropertyByPath:function(t,e){var _=this.charttype[this.charttype.__value__];return this.getPropertyByPath(_,t)||e},getPropertyByPath:function(t,e){e="properties."+e;var _=e.split(".");var a=t;for(var r=0;r<_.length;r++){if(a){a=a[_[r]]}else{break}}return a},updateChartPropertyByPath:function(t,e){this.setChartType(this.getChartType());var _=this.charttype;var a=_[_.__value__];if(!a){a={properties:{}};_[_.__value__]=a}a=this.setPropertyByPath(a,t,e);this.charttype=_},setPropertyByPath:function(t,e,_){var a=t;e="properties."+e;var r=e.split(".");var I=a;for(var O=0;O<r.length-1;O++){I[r[O]]=I[r[O]]||{};I=I[r[O]]}I[r[r.length-1]]=_;return a},getAllPropertiesAsJSON:function(){return JSON.stringify(this.charttype)},getDataSelectionString:function(){return JSON.stringify(this.data)},getAxisFromEnum:function(t){var e="primaryScale";if(t=="AXIS_2"){e="secondaryScale"}return e}};sap.zen.dsh.InfoChartAxisScalingEnumfield={};sap.zen.dsh.InfoChartAxisScaling={AXIS_1:"AXIS_1",AXIS_2:"AXIS_2"};sap.zen.dsh.InfoChartTypeEnumfield={};sap.zen.dsh.InfoChartType={INFO_COLUMN:"INFO_COLUMN",INFO_BAR:"INFO_BAR",INFO_LINE:"INFO_LINE",INFO_PIE:"INFO_PIE",INFO_STACKED_COLUMN:"INFO_STACKED_COLUMN",INFO_STACKED_BAR:"INFO_STACKED_BAR",INFO_AREA:"INFO_AREA",INFO_HORIZONTAL_AREA:"INFO_HORIZONTAL_AREA",INFO_HORIZONTAL_COMBINATION:"INFO_HORIZONTAL_COMBINATION",INFO_HORIZONTAL_LINE:"INFO_HORIZONTAL_LINE",INFO_TREEMAP:"INFO_TREEMAP",INFO_TRELLIS_AREA:"INFO_TRELLIS_AREA",INFO_TRELLIS_BAR:"INFO_TRELLIS_BAR",INFO_TRELLIS_COLUMN:"INFO_TRELLIS_COLUMN",INFO_TRELLIS_HORIZONTAL_AREA:"INFO_TRELLIS_HORIZONTAL_AREA",INFO_TRELLIS_HORIZONTAL_LINE:"INFO_TRELLIS_HORIZONTAL_LINE",INFO_TRELLIS_LINE:"INFO_TRELLIS_LINE",INFO_RADAR:"INFO_RADAR",INFO_100_STACKED_BAR:"INFO_100_STACKED_BAR",INFO_100_STACKED_COLUMN:"INFO_100_STACKED_COLUMN",INFO_COMBINATION:"INFO_COMBINATION",INFO_BUBBLE:"INFO_BUBBLE",INFO_SCATTER:"INFO_SCATTER",INFO_DUAL_COLUMN:"INFO_DUAL_COLUMN",INFO_DUAL_STACKED_COLUMN:"INFO_DUAL_STACKED_COLUMN",INFO_100_DUAL_STACKED_COLUMN:"INFO_100_DUAL_STACKED_COLUMN",INFO_DUAL_BAR:"INFO_DUAL_BAR",INFO_DUAL_STACKED_BAR:"INFO_DUAL_STACKED_BAR",INFO_100_DUAL_STACKED_BAR:"INFO_100_DUAL_STACKED_BAR",INFO_DUAL_LINE:"INFO_DUAL_LINE",INFO_BULLET:"INFO_BULLET",INFO_VERTICAL_BULLET:"INFO_VERTICAL_BULLET",INFO_DONUT:"INFO_DONUT",INFO_HEATMAP:"INFO_HEATMAP",INFO_STACKED_COMBINATION:"INFO_STACKED_COMBINATION",INFO_HORIZONTAL_STACKED_COMBINATION:"INFO_HORIZONTAL_STACKED_COMBINATION",INFO_DUAL_STACKED_COMBINATION:"INFO_DUAL_STACKED_COMBINATION",INFO_DUAL_COMBINATION:"INFO_DUAL_COMBINATION",INFO_DUAL_HORIZONTAL_COMBINATION:"INFO_DUAL_HORIZONTAL_COMBINATION",INFO_TIMESERIES_LINE:"INFO_TIMESERIES_LINE"}});
//# sourceMappingURL=contribution.ztl.js.map