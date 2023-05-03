/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/m/Button","sap/m/Dialog","sap/ui/comp/smartform/SmartForm","sap/ui/comp/smartform/Group","sap/ui/comp/smartform/GroupElement","sap/m/RadioButtonGroup","sap/m/RadioButton","sap/m/Slider"],function(e,t,n,o,i,a,r,s){"use strict";var g=sap.ui.getCore().getLibraryResourceBundle("sap.gantt");var u={getDialogBox:function(u){return new Promise(function(l,T){var c=new n({editable:true,useHorizontalLayout:false,groups:[new o({groupElements:[new i({label:g.getText("TXT_CH_GCT_ORIENATION"),elements:[new a({columns:3,selectedIndex:this.setSelectedIndex(u,"dragOrientation"),buttons:[new r({text:g.getText("TXT_CH_GCT_FREE")}),new r({text:g.getText("TXT_CH_GCT_HORIZONTAL")}),new r({text:g.getText("TXT_CH_GCT_VERTICAL")})]})]}),new i({label:g.getText("TXT_CH_GCT_HEIGHT"),elements:[new s({value:parseInt(u.getHeight().split("%")[0],10)})]})]})]});var p=new e({text:g.getText("SAVE_BUTTON"),type:"Emphasized"}),d=new e({text:g.getText("CANCEL_BUTTON")});this.dialogBox=new t({title:g.getText("TXT_CH_GCT_DIALOG_TITLE"),buttons:[p,d],content:[c]});d.attachPress(function(e){this.dialogBox.close()}.bind(this));p.attachPress(function(e){var t=this.dialogBox.getContent()[0].getGroups()[0].getGroupElements(),n={newChange:{dragOrientation:t[0].getElements()[0].getSelectedButton().getText(),height:t[1].getElements()[0].getValue()+"%"},oldChange:{dragOrientation:u.getDragOrientation(),height:u.getHeight()}};this.dialogBox.close();l(n)}.bind(this));this.dialogBox.open()}.bind(this))}};u.setSelectedIndex=function(e,t){var n=e.getProperty(t);if(t==="dragOrientation"){if(n==="Free"){return 0}else if(n==="Horizontal"){return 1}else{return 2}}};u.fnConfigureContainerSettings=function(e){return u.getDialogBox(e).then(function(t){return[{selectorControl:e,changeSpecificData:{changeType:"ganttChartWithTableSettings",content:t}}]})};return u},true);
//# sourceMappingURL=GanttChartWithTable.js.map