/*!
 * (c) Copyright 2010-2019 SAP SE or an SAP affiliate company.
 */
sap.ui.define(["jquery.sap.global"],function(jQuery){"use strict";jQuery.sap.declare("sap.zen.crosstab.CrosstabCellApi");sap.zen.crosstab.CrosstabCellApi=function(e,t,l,a,i){var n=e.getDataArea();var r=e.getColumnHeaderArea();var o=e.getRowHeaderArea();var s=e.getDimensionHeaderArea();var u=l-1;var g=t-1;this.getTableCell=function(e,a){var i=null;if(a>=t&&e>=l){i=n.getCell(e-l,a-t)}else if(a<t&&e<l){i=s.getCell(e,a)}else if(a>=t&&e<l){i=r.getCell(e,a-t)}else if(a<t&&e>=l){i=o.getCell(e-l,a)}return i};this.getTableCellWithColSpan=function(e,a){var i=null;if(a>=t&&e>=l){i=n.getDataModel().getCellWithColSpan(e-l,a-t,true)}else if(a<t&&e<l){i=s.getDataModel().getCellWithColSpan(e,a,true)}else if(a>=t&&e<l){i=r.getDataModel().getCellWithColSpan(e,a-t,true)}else if(a<t&&e>=l){i=o.getDataModel().getCellWithColSpan(e-l,a,true)}return i};this.getTableCellWithRowSpan=function(e,a){var i=null;if(a>=t&&e>=l){i=n.getDataModel().getCellWithRowSpan(e-l,a-t,true)}else if(a<t&&e<l){i=s.getDataModel().getCellWithRowSpan(e,a,true)}else if(a>=t&&e<l){i=r.getDataModel().getCellWithRowSpan(e,a-t,true)}else if(a<t&&e>=l){i=o.getDataModel().getCellWithRowSpan(e-l,a,true)}return i};this.getTableCellWithSpans=function(e,t){var l=this.getTableCell(e,t);var a=t--;while(!l&&a>=0){var i=e;l=this.getTableCell(i,a);if(l&&l.isLoading()){return l}if(!l){i--;while(!l&&i>=0){l=this.getTableCell(i,a);i--}if(l){if(l.isLoading()){return l}var n=l.getTableRow()+l.getRowSpan()-1;if(n<e){l=null}}}a--}return l};this.getTableRowCnt=function(){return i+l};this.getTableColCnt=function(){return a+t};this.getTableMaxScrollRowCnt=function(){return i};this.getTableMaxScrollColCnt=function(){return a};this.getTableFixedRowHeaderColCnt=function(){return t};this.getTableFixedColHeaderRowCnt=function(){return l};this.getTableMaxDimHeaderRow=function(){return u};this.getTableMaxDimHeaderCol=function(){return g}};return sap.zen.crosstab.CrosstabCellApi});
//# sourceMappingURL=CrosstabCellApi.js.map