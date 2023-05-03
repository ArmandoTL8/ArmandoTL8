/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP SE. All rights reserved
 */
(function(){"use strict";sap.ui.jsfragment("sap.apf.ui.reuse.fragment.newMessageDialog",{createContent:function(t){var e=new sap.m.Button(t.createId("idYesButton"),{text:t.oCoreApi.getTextNotHtmlEncoded("yes")});var o=new sap.m.Button(t.createId("idNoButton"),{text:t.oCoreApi.getTextNotHtmlEncoded("no")});var a=new sap.m.Dialog(t.createId("idNewDialog"),{type:sap.m.DialogType.Standard,title:t.oCoreApi.getTextNotHtmlEncoded("newPath"),content:new sap.m.Text({text:t.oCoreApi.getTextNotHtmlEncoded("analysis-path-not-saved")}).addStyleClass("textStyle"),buttons:[e,o],afterClose:function(){a.destroy()}});return a}})})();
//# sourceMappingURL=newMessageDialog.fragment.js.map