/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
(function(){"use strict";sap.ui.jsview("sap.apf.ui.reuse.view.deleteAnalysisPath",{getControllerName:function(){return"sap.apf.ui.reuse.controller.deleteAnalysisPath"},createContent:function(e){var t=jQuery(window).height()*.6+"px";var i=jQuery(window).height()*.6+"px";this.oCoreApi=this.getViewData().oInject.oCoreApi;this.oUiApi=this.getViewData().oInject.uiApi;var s=this;var a=new sap.m.List({mode:sap.m.ListMode.Delete,items:{path:"/GalleryElements",template:new sap.m.StandardListItem({title:"{AnalysisPathName}",description:"{description}",tooltip:"{AnalysisPathName}"})},delete:e.handleDeleteOfDialog.bind(e)});var o=new sap.m.Dialog({title:s.oCoreApi.getTextNotHtmlEncoded("delPath"),contentWidth:t,contentHeight:i,content:a,leftButton:new sap.m.Button({text:s.oCoreApi.getTextNotHtmlEncoded("close"),press:function(){o.close();s.oUiApi.getLayoutView().setBusy(false)}}),afterClose:function(){s.destroy()}});if(sap.ui.Device.system.desktop){this.addStyleClass("sapUiSizeCompact");o.addStyleClass("sapUiSizeCompact")}return o}})})();
//# sourceMappingURL=deleteAnalysisPath.view.js.map