/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/base/Log","sap/base/util/restricted/_isEqual","sap/ui/base/ManagedObject","sap/ui/core/Fragment","sap/ui/fl/write/api/ContextBasedAdaptationsAPI","sap/m/ColumnListItem","sap/ui/rta/Utils","sap/ui/model/Filter","sap/ui/model/FilterOperator","sap/ui/model/json/JSONModel"],function(t,e,a,o,n,i,r,s,l,d){"use strict";var c={Initial:0,Default:1024,Before:function(t){return t+1024},Between:function(t,e){return(t+e)/2},After:function(t){return t+.5}};var u=a.extend("sap.ui.rta.toolbar.contextBased.ManageAdaptations",{metadata:{properties:{toolbar:{type:"any"}}},constructor:function(){a.prototype.constructor.apply(this,arguments);this.oTextResources=this.getToolbar().getTextResources()}});u.prototype.openManageAdaptationDialog=function(){if(!this._oManageAdaptationDialogPromise){this._oManageAdaptationDialogPromise=o.load({name:"sap.ui.rta.toolbar.contextBased.ManageAdaptationsDialog",id:this.getToolbar().getId()+"_fragment--sapUiRta_manageAdaptationDialog",controller:{formatContextColumnCell:p.bind(this),formatContextColumnTooltip:g.bind(this),onLiveSearch:v.bind(this),moveUp:A.bind(this),moveDown:C.bind(this),onDropSelectedAdaptation:b.bind(this),onSaveReorderedAdaptations:O.bind(this),onClose:L.bind(this)}}).then(function(t){this._oManageAdaptationDialog=t;t.addStyleClass(r.getRtaStyleClassName());this.getToolbar().addDependent(this._oManageAdaptationDialog);t.setContentWidth("650px");t.setContentHeight("450px");t.setHorizontalScrolling(false)}.bind(this))}else{f.call(this,false);I.call(this,true);P.call(this,false)}return this._oManageAdaptationDialogPromise.then(function(){var t=this.getToolbar().getRtaInformation();return n.load({control:t.rootControl,layer:t.flexSettings.layer})}.bind(this)).then(function(t){this.oAdaptationsModel=t;this.oReferenceAdaptationsData=JSON.parse(JSON.stringify(t.getData()));this._oControlConfigurationModel=new d({isTableItemSelected:false});this._oManageAdaptationDialog.setModel(this.oAdaptationsModel,"contextBased");this._oManageAdaptationDialog.setModel(this._oControlConfigurationModel,"controlConfiguration");_(this.oAdaptationsModel);y.call(this).attachSelectionChange(h.bind(this));return this._oManageAdaptationDialog.open()}.bind(this)).catch(function(e){t.error(e.stack);var a="MSG_LREP_TRANSFER_ERROR";var o={titleKey:"BTN_MANAGE_APP_CTX"};o.details=e.userMessage;r.showMessageBox("error",a,o)})};function p(t){return t.length+" "+(t.length>1?this.oTextResources.getText("TXT_TABLE_CONTEXT_CELL_ROLES"):this.oTextResources.getText("TXT_TABLE_CONTEXT_CELL_ROLE"))}function g(t){return t.join("\n")}function h(t){if(t.getParameter("selected")===true){this._oControlConfigurationModel.setProperty("/isTableItemSelected",true);if(E.call(this)){f.call(this,true)}}}function f(t){var e=B.call(this,"moveUpButton");var a=B.call(this,"moveDownButton");e.setEnabled(t);a.setEnabled(t)}function v(t){var e;var a=t.getSource().getValue();var o=y.call(this);var n=D.call(this);var i=S.call(this);if(a&&a.length>0){f.call(this,false);I.call(this,false);var r=new s("title",l.Contains,a);var d=new s({path:"contexts/role",test:function(t){return t.some(function(t){return t.includes(a.toUpperCase())})}});var c=new s("createdBy",l.Contains,a);var u=new s("changedBy",l.Contains,a);e=new s([r,d,c,u]);if(i.toUpperCase().includes(a.toUpperCase())){n.setVisible(true)}else{n.setVisible(false)}}else{I.call(this,true);if(this._oControlConfigurationModel.getProperty("/isTableItemSelected")){f.call(this,true)}n.setVisible(true)}var p=o.getBinding("items");p.filter(e,"Application")}function A(t){T.call(this,"Up");t.getSource().focus()}function C(t){T.call(this,"Down");t.getSource().focus()}function m(t,e){return t.rank-e.rank}function M(t){var e=t.getProperty("/adaptations")||[];e.sort(m);t.setProperty("/adaptations",e);t.refresh(true)}function _(t){var e=t.getProperty("/adaptations")||[];e.forEach(function(t,e){t.rank=e+1});t.setProperty("/adaptations",e)}function T(t){var e=y.call(this);var a=e.getSelectedItem(0);var o=a.getBindingContext("contextBased");var n=e.indexOfItem(a)+(t==="Up"?-1:1);var i=e.getItems()[n];var r=i?i.getBindingContext("contextBased"):undefined;if(!r){return}var s=r.getProperty("rank");var l=o.getProperty("rank");this.oAdaptationsModel.setProperty("rank",s,o);this.oAdaptationsModel.setProperty("rank",l,r);M(this.oAdaptationsModel);e.getItems()[n].setSelected(true).focus();P.call(this,true)}function b(t){var e=t.getParameter("draggedControl");var a=e.getBindingContext("contextBased");if(!a){return}var o=c.Default;var n=t.getParameter("droppedControl");if(n instanceof i){var r=t.getParameter("dropPosition");var s=n.getBindingContext("contextBased");var l=s.getProperty("rank");var d=n.getParent();var u=d.indexOfItem(n);if(s===a){return}var p=u+(r==="After"?1:-1);var g=d.getItems()[p];if(!g||p===-1){o=p===-1?.5:c[r](l)}else{var h=g.getBindingContext("contextBased");o=c.Between(l,h.getProperty("rank"))}}this.oAdaptationsModel.setProperty("rank",o,a);M(this.oAdaptationsModel);_(this.oAdaptationsModel);P.call(this,true)}function x(){return!e(this.oAdaptationsModel.getProperty("/adaptations").map(function(t){return t.id}),this.oReferenceAdaptationsData.adaptations.map(function(t){return t.id}))}function P(t){var e=B.call(this,"manageAdaptations-saveButton");e.setTooltip(t?"":this.oTextResources.getText("TOOLTIP_APP_CTX_DIALOG_SAVE"));e.setEnabled(t)}function y(){return B.call(this,"manageAdaptationsTable")}function B(t){return this.getToolbar().getControl("manageAdaptationDialog--"+t)}function D(){return B.call(this,"defaultContext")}function S(){return B.call(this,"defaultApplicationTitle").getProperty("text")}function R(){return B.call(this,"searchField")}function E(){return R.call(this).getValue().length===0}function I(t){y.call(this).getDragDropConfig()[0].setEnabled(t)}function O(){if(x.call(this)){var e=this.getToolbar().getRtaInformation();var a=this.oAdaptationsModel.getProperty("/adaptations").map(function(t){return t.id});n.reorder({control:e.rootControl,layer:e.flexSettings.layer,parameters:{priorities:a}}).catch(function(e){t.error(e.stack);var a="MSG_LREP_TRANSFER_ERROR";var o={titleKey:"BTN_MANAGE_APP_CTX"};o.details=e.userMessage;r.showMessageBox("error",a,o)})}L.call(this)}function L(){this._oControlConfigurationModel.setProperty("/isTableItemSelected",false);R.call(this).setValue("");D.call(this).setVisible(true);this._oManageAdaptationDialog.getModel("contextBased").setData(null);this._oManageAdaptationDialog.close()}return u});
//# sourceMappingURL=ManageAdaptations.js.map