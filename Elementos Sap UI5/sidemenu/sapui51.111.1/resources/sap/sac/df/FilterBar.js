/*
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
sap.ui.define("sap/sac/df/FilterBar",["sap/ui/mdc/FilterBar","sap/sac/df/variablebar/FilterBarHandler"],function(e,t){var i=e.extend("sap.sac.df.FilterBar",{metadata:{library:"sap.sac.df",properties:{multiDimModelId:{type:"string",defaultValue:"om"},mode:{type:"string",defaultValue:"VariablesOfDataProvider"}},publicMethods:["initialiseFilterBar"]},renderer:"sap.ui.mdc.FilterBarRenderer",init:function(){if(e.prototype.init){e.prototype.init.apply(this,arguments)}this.setP13nMode(["Item","Value"]);this.setDelegate({name:"sap/sac/df/variablebar/FilterBarDelegate"})},_getMultiDimModel:function(){var e=this.getModel();return e?e:this.getParent().getModel(this.getMultiDimModelId())},initialiseFilterBar:function(e){var i=this;e?this.setModel(e):this.setModel(this._getMultiDimModel());this._oFilterBarHandler=t.initialise(i)}});return i});
//# sourceMappingURL=FilterBar.js.map