/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){window.onload=function(){sap.ui.loader.config({baseUrl:"../../../../../../resources/",paths:{"sap/esh/search/ui":"/resources/sap/esh/search/ui"}});sap.ui.getCore().attachInit(function(){sap.ui.require(["sap/esh/search/ui/SearchCompositeControl","sap/m/Button","sap/m/OverflowToolbarButton","sap/m/ToolbarSeparator","sap/m/MessageBox"],function(e,o,a,t,n){var r={sinaConfiguration:{provider:"sample"},getCustomToolbar:function e(){return[new o({text:"Search Dev. Guide",tooltip:"SAP HANA Search Developer Guide",press:function e(){return window.open("https://help.sap.com/viewer/691cb949c1034198800afde3e5be6570/2.0.05/en-US/ce86ef2fd97610149eaaaa0244ca4d36.html")}}),new o({text:"Search (help.sap)",tooltip:"Search and Operational Analytics",press:function e(){return window.open("https://help.sap.com/viewer/6522d0462aeb4909a79c3462b090ec51/1709%20002/en-US")}}),new t,new a({icon:"sap-icon://hint",text:"About",tooltip:"About this Sample UI",press:function e(){return n.information("This is SAP Search UI, based on UI5 control 'sap.esh.search.ui.SearchCompositeControl' and 'Sample Data Provider'.")}})]}};var s=new e(r);window.addEventListener("hashchange",function(){s.getModel().parseURL()},false);s.placeAt("content")});jQuery("html").css("overflow-y","auto");jQuery("html").css("height","100%")})}})();
//# sourceMappingURL=SearchUI.js.map