

/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap */
sap.ui.define(
  "sap/sac/df/types/WidgetType",
  [
  ],
  function(){
    /**
     * Widget Type of an InACard
     *
     * @enum {string}
     * @alias sap.sac.df.types.WidgetType
     * @private
     */
    var WidgetType = {
      /**
       * Pivot Table
       * @public
       **/
      pivot: "pivot",
      /**
       * Bar Chart
       * @public
       **/
      bar: "bar",
      /**
       * Column Chart
       * @public
       **/
      colum: "column",
      /**
       * Line Chart
       * @public
       **/
      line: "line",
      /**
       * Pie Chart
       * @public
       **/
      pie: "pie",
      /**
       * Donut Chart
       * @public
       **/
      donut: "donut"
    };
    return WidgetType;
  }
);
