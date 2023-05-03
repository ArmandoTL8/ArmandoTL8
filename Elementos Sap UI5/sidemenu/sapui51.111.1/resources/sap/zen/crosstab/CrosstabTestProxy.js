/*!
 * (c) Copyright 2010-2019 SAP SE or an SAP affiliate company.
 */
sap.ui.define(["jquery.sap.global","sap/zen/crosstab/ColResizer"],function(jQuery,e){"use strict";jQuery.sap.declare("sap.zen.crosstab.CrosstabTestProxy");sap.zen.crosstab.CrosstabTestProxy=function(t,r){var s=false;var n=new e(t);function a(e,t,r,s){var n=e.getDataModel().getCellWithSpan(t,r);if(n){var a={};var i=jQuery(document.getElementById(n.getId()));if(i&&i.length>0){a.target=i[0];s(a)}}}this.hoverCell=function(e,t,s){a(e,t,s,r.executeOnMouseEnter)};this.selectCell=function(e,t,s){a(e,t,s,r.executeOnClickAction)};this.setTestAction=function(e){s=e};this.getTestAction=function(){return s};this.testClickSortOrHierarchy=function(e,t,s){var n=e.getDataModel().getCellWithSpan(t,s);if(n){var a=jQuery("#sort_"+n.getId());if(a&&a.length>0){var i={};i.target=a[0];r.executeOnClickAction(i)}}};this.doubleClickColResize=function(e,r){var s=t.getColumnHeaderArea().getCell(e,r);if(s){var a="resi_"+s.getId();var i={};i.target={};i.target.id=a;n.onDoubleClick(i)}}};return sap.zen.crosstab.CrosstabTestProxy});
//# sourceMappingURL=CrosstabTestProxy.js.map