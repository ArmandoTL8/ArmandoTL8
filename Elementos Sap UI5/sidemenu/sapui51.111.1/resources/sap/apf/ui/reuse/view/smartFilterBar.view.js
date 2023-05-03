/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
(function(){"use strict";sap.ui.jsview("sap.apf.ui.reuse.view.smartFilterBar",{getControllerName:function(){return"sap.apf.ui.reuse.controller.smartFilterBar"},createContent:function(t){var e=this,a,r,i,n;a=e.getViewData().oSmartFilterBarConfiguration.entitySet;r=e.getViewData().oSmartFilterBarConfiguration.id;i=e.getViewData().oCoreApi.getSmartFilterBarPersistenceKey(r);n=new sap.ui.comp.smartfilterbar.SmartFilterBar(t.createId("idAPFSmartFilterBar"),{entitySet:a,controlConfiguration:e.getViewData().controlConfiguration,initialized:t.afterInitialization.bind(t),search:t.handlePressOfGoButton.bind(t),persistencyKey:i,considerAnalyticalParameters:true,customData:{key:"dateFormatSettings",value:{UTC:true}},useDateRangeType:true,liveMode:true,filterChange:t.validateFilters.bind(t)});e.setParent(e.getViewData().parent);return n}})})();
//# sourceMappingURL=smartFilterBar.view.js.map