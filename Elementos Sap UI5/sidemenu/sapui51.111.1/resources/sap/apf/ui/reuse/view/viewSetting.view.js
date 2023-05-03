/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
(function(){"use strict";sap.ui.jsview("sap.apf.ui.reuse.view.viewSetting",{getControllerName:function(){return"sap.apf.ui.reuse.controller.viewSetting"},createContent:function(e){var t=this.getViewData().oTableInstance;var n=t.tableControl;var a=[];n.getColumns().forEach(function(e){var t=new sap.m.ViewSettingsItem({text:e.getCustomData()[0].getValue().text,key:e.getCustomData()[0].getValue().key});a.push(t)});var i=new sap.m.ViewSettingsDialog({sortItems:a,confirm:e.handleConfirmForSort.bind(e),cancel:e.handleCancel.bind(e)});return i}})})();
//# sourceMappingURL=viewSetting.view.js.map