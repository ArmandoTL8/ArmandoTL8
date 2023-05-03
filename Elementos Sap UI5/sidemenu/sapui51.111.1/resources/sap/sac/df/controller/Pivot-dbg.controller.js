/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap, Promise*/
sap.ui.define(
  "sap/sac/df/controller/Pivot.controller",
  [
    "sap/m/MessageBox",
    "sap/ui/core/mvc/Controller",
    "sap/sac/df/utils/ErrorHandler",
    "sap/sac/df/types/NavigationCommandType",
    "sap/sac/df/types/DimensionType",
    "sap/sac/df/types/CellValueType",
    "sap/sac/grid/CellType",
    "sap/sac/df/types/Axis"
  ],
  /*eslint-disable max-params*/
  function (
    MessageBox,
    Controller,
    ErrorHandler,
    NavigationCmdType,
    DimensionType,
    CellValueType,
    CellType,
    Axis
  ) /*eslint-enable max-params*/ {
    "use strict";
    Controller.extend(
      "sap.sac.df.controller.Pivot", {

        onAfterRendering: function() {
          var that = this;
          var oView = that.getView();
          oView.getModel("om").attachRequestSent (
            function(oDP) {
              if(that.getPivot().getDataProviderName() === oDP.getParameter("infoObject")) {
                that.getPivot().getEasyGrid().setBusyIndicatorDelay(0);
                that.getPivot().getEasyGrid().setBusy(true);
              }
            }
          );

          oView.getModel("om").attachRequestCompleted (
            function() {
              var oEasyGrid = that.getPivot().getEasyGrid();
              oEasyGrid.setBusy(false);
            }
          );

          oView.getModel("om").attachRequestFailed (
            function() {
              var oEasyGrid = that.getPivot().getEasyGrid();
              oEasyGrid.setBusy(false);
            }
          );
        },

        requestRows: function (oEvent) {
          var that = this;
          var oOM = that.getView().getModel("om");
          var oDP = oOM.getDataProvider(that.getPivot().getDataProviderName());
          var nOffset = oEvent.getParameter("currentRow");
          if (oDP && nOffset !== oDP.virtualOffsetRow) {
            that.getPivot().fireNavigationCmd(
              {
                navigationCmdType: NavigationCmdType.RowRequest,
                cmd: function () {
                  that.getPivot().getEasyGrid().setBusy(false);
                  return oDP.setOffsetRow(
                    nOffset
                  ).synchronize(
                    true
                  );
                }
              }
            );
          }
        },
        onExit: function () {
          var that = this;
          that.getView().removeAllDependents();
        },
        requestColumns: function (oEvent) {
          var that = this;
          var oOlapModel = that.getView().getModel("om");
          var oDataProvider = oOlapModel.getDataProvider(that.getPivot().getDataProviderName());
          var nOffset = oEvent.getParameter("currentColumn");
          that.getPivot().fireNavigationCmd({
            navigationCmdType: sap.sac.df.NavigationCmdType.ColumnRequest,
            cmd: function () {
              that.getPivot().getEasyGrid().setBusy(false);
              return oDataProvider.setOffsetCol(
                nOffset
              ).synchronize(true);
            }
          });
        },
        onDrill: function (oEvent) {
          var oCell = oEvent.getParameter("cell");
          var bKeepOffset = oEvent.getParameter("keepOffset");
          var oDP = this.getView().getModel("om").getDataProvider(this.getPivot().getDataProviderName());
          function doDrill() {
            return Promise.resolve(null).then(function () {
              return oDP.drill(oCell.data("cellDimension"), oCell.data("tupleIndex"), bKeepOffset);
            });
          }
          this.getPivot().fireNavigationCmd({
            navigationCmdType: NavigationCmdType.HierarchyNavigation,
            cmd: doDrill,
            cell: oCell
          });
        },
        onRightClick: function (oEvent) {
          var that = this;
          var oCell = oEvent.getParameter("cell");
          var sDimName = oCell.data("cellDimension");
          var oView = that.getView();
          var oOlapModel = oView.getModel("om");
          var oLink = oEvent.getParameter("link");
          var oDim = oOlapModel.getDataProvider(that.getPivot().getDataProviderName()).Dimensions[sDimName];
          var oSel = null;
          if (oDim) {
            if (oDim.Axis === Axis.Rows) {
              oSel = oOlapModel.getDataProvider(that.getPivot().getDataProviderName()).getRowSelection(oCell.data("tupleIndex"));
            } else if (oDim.Axis === Axis.Columns) {
              oSel = oOlapModel.getDataProvider(that.getPivot().getDataProviderName()).getColumnSelection(oCell.data("tupleIndex"));
            }
          } else if (oCell.getCellType() === CellType.STANDARD || oCell.getCellType() === CellType.RESULT) {
            oSel = oOlapModel.getDataProvider(that.getPivot().getDataProviderName()).getSelection(oCell.data("dataRow"), oCell.data("dataColumn"));
          }
          function doCM(){
            MessageBox.information("Implement your own Context menu handling");
          }
          that.getPivot().fireNavigationCmd({
            cmd: doCM,
            anchor: oLink,
            cell: oCell,
            selection: oSel,
            navigationCmdType: NavigationCmdType.CellClick
          });
        }
      }
    );
    return sap.sac.df.controller.Pivot;
  }
);
