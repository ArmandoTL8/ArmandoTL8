/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/mdc/enum/ProcessingStrategy","sap/ui/mdc/condition/FilterOperatorUtil","./SelectionController","sap/ui/mdc/p13n/P13nBuilder","sap/ui/mdc/p13n/FlexUtil","sap/base/Log","sap/base/util/merge","sap/base/util/UriParameters"],function(t,e,n,i,r,o,a,s){"use strict";var u=n.extend("sap.ui.mdc.p13n.subcontroller.FilterController",{constructor:function(){n.apply(this,arguments);this._bResetEnabled=true}});u.prototype.getStateKey=function(){return"filter"};u.prototype.getUISettings=function(){return{title:sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc").getText("filter.PERSONALIZATION_DIALOG_TITLE"),tabText:sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc").getText("p13nDialog.TAB_Filter"),afterClose:function(t){var e=t.getSource();if(e){var n=e.getContent()[0];if(n.isA("sap.m.p13n.Container")){n.removeView("Filter")}else{e.removeAllContent()}}e.destroy()}}};u.prototype.getCurrentState=function(){return this.getAdaptationControl().getCurrentState()[this.getStateKey()]};u.prototype.getChangeOperations=function(){return{add:"addCondition",remove:"removeCondition"}};u.prototype.getBeforeApply=function(){var t=this.getAdaptationControl().getInbuiltFilter();var e=t?t.createConditionChanges():Promise.resolve([]);return e};u.prototype.getFilterControl=function(){return this.getAdaptationControl().isA("sap.ui.mdc.IFilter")?this.getAdaptationControl():this.getAdaptationControl()._oP13nFilter};u.prototype.sanityCheck=function(t){u.checkConditionOperatorSanity(t);return t};u.checkConditionOperatorSanity=function(t){for(var n in t){var i=t[n];for(var r=0;r<i.length;r++){var a=i[r];var s=a.operator;if(!e.getOperator(s)){i.splice(r,1);if(t[n].length==0){delete t[n]}o.warning("The provided conditions for field '"+n+"' contain unsupported operators - these conditions will be neglected.")}}}};u.prototype._getPresenceAttribute=function(t){return"active"};u.prototype.initAdaptationUI=function(t,e){var n=this.mixInfoAndState(t);return this.getAdaptationControl().retrieveInbuiltFilter().then(function(t){t.setP13nData(n);t.setLiveMode(false);t.getTitle=function(){return sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc").getText("filter.PERSONALIZATION_DIALOG_TITLE")};this._oAdaptationFB=t;return t.createFilterFields().then(function(){this._oPanel=t;return t}.bind(this))}.bind(this))};u.prototype.update=function(t){var e=this.mixInfoAndState(t);this._oPanel.setP13nData(e);var n=this.getAdaptationControl();var i=n&&n.getInbuiltFilter();if(i){i.createFilterFields()}};u.prototype.getDelta=function(e){if(e.applyAbsolute===t.FullReplace){Object.keys(e.existingState).forEach(function(t){if(!e.changedState.hasOwnProperty(t)){e.changedState[t]=[]}})}return r.getConditionDeltaChanges(e)};u.prototype.model2State=function(){var t={},e=this.getCurrentState();this.getP13nData().items.forEach(function(n){if(n.active&&Object.keys(e).includes(n.name)){t[n.name]=e[n.name]}});return t};u.prototype.mixInfoAndState=function(t){var e=this.getCurrentState()||{};var n=this.prepareAdaptationData(t,function(t,n){var i=e[t.name];t.active=i&&i.length>0?true:false;return!(n.filterable===false)});i.sortP13nData({visible:new s(window.location.search).getAll("sap-ui-xx-filterQueryPanel")[0]==="true"?"active":null,position:undefined},n.items);return n};u.prototype.changesToState=function(t,e,n){var i={};t.forEach(function(t){var e=a({},t.changeSpecificData.content);var n=e.name;if(!i[n]){i[n]=[]}if(t.changeSpecificData.changeType===this.getChangeOperations()["remove"]){e.condition.filtered=false}i[n].push(e.condition)}.bind(this));return i};return u});
//# sourceMappingURL=FilterController.js.map