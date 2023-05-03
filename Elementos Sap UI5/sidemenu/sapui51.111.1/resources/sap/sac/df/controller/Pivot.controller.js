/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
sap.ui.define("sap/sac/df/controller/Pivot.controller",["sap/m/MessageBox","sap/ui/core/mvc/Controller","sap/sac/df/utils/ErrorHandler","sap/sac/df/types/NavigationCommandType","sap/sac/df/types/DimensionType","sap/sac/df/types/CellValueType","sap/sac/grid/CellType","sap/sac/df/types/Axis"],function(e,t,a,i,o,r,n,s){"use strict";t.extend("sap.sac.df.controller.Pivot",{onAfterRendering:function(){var e=this;var t=e.getView();t.getModel("om").attachRequestSent(function(t){if(e.getPivot().getDataProviderName()===t.getParameter("infoObject")){e.getPivot().getEasyGrid().setBusyIndicatorDelay(0);e.getPivot().getEasyGrid().setBusy(true)}});t.getModel("om").attachRequestCompleted(function(){var t=e.getPivot().getEasyGrid();t.setBusy(false)});t.getModel("om").attachRequestFailed(function(){var t=e.getPivot().getEasyGrid();t.setBusy(false)})},requestRows:function(e){var t=this;var a=t.getView().getModel("om");var o=a.getDataProvider(t.getPivot().getDataProviderName());var r=e.getParameter("currentRow");if(o&&r!==o.virtualOffsetRow){t.getPivot().fireNavigationCmd({navigationCmdType:i.RowRequest,cmd:function(){t.getPivot().getEasyGrid().setBusy(false);return o.setOffsetRow(r).synchronize(true)}})}},onExit:function(){var e=this;e.getView().removeAllDependents()},requestColumns:function(e){var t=this;var a=t.getView().getModel("om");var i=a.getDataProvider(t.getPivot().getDataProviderName());var o=e.getParameter("currentColumn");t.getPivot().fireNavigationCmd({navigationCmdType:sap.sac.df.NavigationCmdType.ColumnRequest,cmd:function(){t.getPivot().getEasyGrid().setBusy(false);return i.setOffsetCol(o).synchronize(true)}})},onDrill:function(e){var t=e.getParameter("cell");var a=e.getParameter("keepOffset");var o=this.getView().getModel("om").getDataProvider(this.getPivot().getDataProviderName());function r(){return Promise.resolve(null).then(function(){return o.drill(t.data("cellDimension"),t.data("tupleIndex"),a)})}this.getPivot().fireNavigationCmd({navigationCmdType:i.HierarchyNavigation,cmd:r,cell:t})},onRightClick:function(t){var a=this;var o=t.getParameter("cell");var r=o.data("cellDimension");var l=a.getView();var g=l.getModel("om");var v=t.getParameter("link");var d=g.getDataProvider(a.getPivot().getDataProviderName()).Dimensions[r];var c=null;if(d){if(d.Axis===s.Rows){c=g.getDataProvider(a.getPivot().getDataProviderName()).getRowSelection(o.data("tupleIndex"))}else if(d.Axis===s.Columns){c=g.getDataProvider(a.getPivot().getDataProviderName()).getColumnSelection(o.data("tupleIndex"))}}else if(o.getCellType()===n.STANDARD||o.getCellType()===n.RESULT){c=g.getDataProvider(a.getPivot().getDataProviderName()).getSelection(o.data("dataRow"),o.data("dataColumn"))}function u(){e.information("Implement your own Context menu handling")}a.getPivot().fireNavigationCmd({cmd:u,anchor:v,cell:o,selection:c,navigationCmdType:i.CellClick})}});return sap.sac.df.controller.Pivot});
//# sourceMappingURL=Pivot.controller.js.map