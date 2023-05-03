/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/rta/command/BaseCommand","sap/ui/rta/library","sap/ui/core/util/reflection/JsControlTreeModifier","sap/ui/fl/apply/api/ControlVariantApplyAPI","sap/ui/fl/Utils"],function(e,t,n,a,r){"use strict";var i=e.extend("sap.ui.rta.command.ControlVariantSetTitle",{metadata:{library:"sap.ui.rta",properties:{oldText:{type:"string"},newText:{type:"string"}},associations:{},events:{}}});i.prototype.prepare=function(e){this.sLayer=e.layer;return true};i.prototype.getPreparedChange=function(){this._oPreparedChange=this.getVariantChange();if(!this._oPreparedChange){return undefined}return this._oPreparedChange};i.prototype.execute=function(){var e=this.getElement();var i=e.getTitle().getBinding("text");this.oAppComponent=r.getAppComponentForControl(e);this.oModel=this.oAppComponent.getModel(a.getVariantModelName());this.sVariantManagementReference=n.getSelector(e,this.oAppComponent).id;this.sCurrentVariant=this.oModel.getCurrentVariantReference(this.sVariantManagementReference);var o=this.oModel.getVariantTitle(this.sCurrentVariant,this.sVariantManagementReference);this.setOldText(o);var s={appComponent:this.oAppComponent,variantReference:this.sCurrentVariant,changeType:"setTitle",title:this.getNewText(),layer:this.sLayer,generator:t.GENERATOR_NAME};return Promise.resolve(this.oModel.addVariantChange(this.sVariantManagementReference,s)).then(function(e){this._oVariantChange=e;i.checkUpdate(true)}.bind(this))};i.prototype.undo=function(){var e=this.getElement().getTitle().getBinding("text");var t={variantReference:this.sCurrentVariant,changeType:"setTitle",title:this.getOldText()};var n=this._oVariantChange;return Promise.resolve(this.oModel.deleteVariantChange(this.sVariantManagementReference,t,n)).then(function(){this._oVariantChange=null;e.checkUpdate(true)}.bind(this))};return i});
//# sourceMappingURL=ControlVariantSetTitle.js.map