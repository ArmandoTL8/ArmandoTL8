sap.ui.define(["sap/ui/base/ManagedObject","sap/ui/generic/app/transaction/DraftContext","sap/m/MessageToast","sap/suite/ui/generic/template/genericUtilities/FeLogger","sap/base/util/extend","sap/base/util/each"],function(e,t,i,n,o,r){"use strict";var a=new n("js.QuickTemplates.QuickCreateAPI").getLogger();var s=e.extend("sap.suite.ui.generic.template.js.QuickTemplates.QuickCreateAPI",{metadata:{library:"sap.suite.ui.generic.template",properties:{},events:{objectCreated:{parameters:{context:{type:"sap.ui.model.Context"}}},destroyed:{parameters:{collectionItemGuid:{type:"String"}}},autofillLineItems:{parameters:{numberOfLineItems:{type:"Number"}}}}}});s.EVENT_CONSTANTS={EventChannel:"sap.fiori.cp.quickactions.EventChannel",QUICKCREATE_LINE_ITEMS_FOUND:"LineItemsFound",QUICKCREATE_VIEW_CREATED:"QuickCreateViewCreated"};var d="items",c="participants";s.CopilotModelName="FioriCopilotODataModel";s._Instances={};s.getInstance=function(e){if(!e){return undefined}if(e.copilotEntity){return s._Instances[e.copilotEntity.getODataKey()]}else{return s._Instances[e]}};s.createAPI=function(n,u,l){function C(){return l.getView().getBindingContext().getObject()}function g(){return l.getQuickCreateItem()}function f(){return u}function E(){return n}function h(){return sap.ui.getCore().getModel(s.CopilotModelName)}function _(e){if(this._bDestroyed){return}var t=this.getQuickCreateItem();if(t.draftid===e){return}t.draftid=e;t.copilotEntity.update(t,{error:function(e){a.error(e)}})}function m(){return u.getAggregation("rootControl")}function I(){return this.oRootView}function T(e){this.oRootView=e;this.calculateViewHeight(this.oRootView,true)}function p(){if(this.oRootView&&this.oRootView.getController()&&this.oRootView.getController().bDraftEnabled!==undefined){return this.oRootView.getController().bDraftEnabled}if(!this.oRootView||!this.oRootView.getBindingContext()){return undefined}var e=new t(this.getQuickCreateModel());return e.hasDraft(this.oRootView.getBindingContext())}function b(){var e=this.getComponentInstance().getModel();if(!e&&this.oRootView){e=this.oRootView.getModel()}return e}function O(){return l.isCurrentUserCreator()}function N(){if(!this.oRootView){return undefined}return this.oRootView.getBindingContext()}function y(){var e=this.getQuickCreateRootBindingContext();if(e&&e.getObject()){return e.getObject().__metadata.type}return undefined}function M(e,t,i){var n=i.numberOfLineItems;if(n<=0){return}this.fireAutofillLineItems({numberOfLineItems:n})}function S(){this._attachToModelBindingChanges();if(!this.oRootView){var e=l.oViewUtils.findFirstViewFromControlHierarchy(this.getRootControl());if(e){this.setRootView(e)}}}function D(){if(!this._bBindingChangeAttached){var e=u.getModel();if(e){var t=e.addBinding.bind(e);var i=this;e.addBinding=function(e){t(e);e.attachEvent("change",i._onDataBindingChanged)};this._bBindingChangeAttached=true}}}function R(){return new Promise(function(e,t){var i=this.getCopilotModel();i.read("/"+i.getKey(this.getQuickCreateItem()),{success:function(t,i){if(t.modeljson){var n=this.getQuickCreateModel();this._loadingJSON=true;if(this.isDraftEnabled()){n.oData=JSON.parse(t.modeljson)}else{var o=JSON.parse(t.modeljson);n.mChangedEntities=o.mChangedEntities;n.mChangeHandles=o.mChangeHandles;n.mDeferredRequests=o.mDeferredRequests;n.oData=o.oData}n.updateBindings()}if(e){e()}delete this._loadingJSON}.bind(this),error:function(e){if(t){t(e)}}})}.bind(this))}function V(){if(!this._oUpdateModelJSONTimer){this._oUpdateModelJSONTimer=setTimeout(this._updateModelJSON,2e3)}}function v(){if(this._loadingJSON||this._bDestroyed||!this.isCurrentUserCreator()){return}this._oUpdateModelJSONTimer=null;var e=this.getQuickCreateItem();var t=this.getQuickCreateModel();var i="";if(this.isDraftEnabled()){var n={};var s=Object.keys(t.mChangedEntities);var d=Object.keys(t.oData);var c={};r(d,function(e,i){if(t.mChangedEntities[i]){c={};o(c,t.oData[i]);o(c,t.mChangedEntities[i]);n[i]=c}else{n[i]=t.oData[i]}});r(s,function(e,i){if(!n[i]){n[i]=t.mChangedEntities[i]}});i=JSON.stringify(n)}else{var u={};u.mChangedEntities=t.mChangedEntities;u.mChangeHandles=t.mChangeHandles;u.mDeferredRequests=t.mDeferredRequests;u.oData=t.oData;i=JSON.stringify(u)}if(i===e.modeljson){return}e.modeljson=i;e.copilotEntity.update(e,{error:function(e){a.error(e)}})}function w(){return new Promise(function(e,t){var n=this.getQuickCreateModel();if(this.oRootView&&this.oRootView.getBindingContext()){if(this.isDraftEnabled()){n.remove(this.oRootView.getBindingContext().getPath(),{success:function(){i.show("Draft has been discarded");e()},error:function(e){t(e)}})}else{n.resetChanges();e()}}else{e()}}.bind(this))}function L(e,t){if(e){l.calculateViewHeight(e,t)}}function P(e){l.setComponentContainerHeight(e)}function Q(e){if(this._bDestroyed){return}this.fireObjectCreated({context:e})}function A(){sap.ui.getCore().getEventBus().publish(s.EVENT_CONSTANTS.EventChannel,s.EVENT_CONSTANTS.QUICKCREATE_VIEW_CREATED,{api:this})}function k(){if(this._bDestroyed){return}if(this._oUpdateModelJSONTimer){clearTimeout(this._oUpdateModelJSONTimer);this._oUpdateModelJSONTimer=null}delete s._Instances[this._InstanceKey];if(n&&!n._bIsBeingDestroyed&&!n.bIsDestroyed){n.destroy()}this.oRootView=undefined;sap.ui.getCore().getEventBus().unsubscribe(s.EVENT_CONSTANTS.EventChannel,s.EVENT_CONSTANTS.QUICKCREATE_LINE_ITEMS_FOUND,this._onLineItemsFound,this);this.fireDestroyed({collectionItemGuid:this._InstanceKey});e.prototype.destroy.call(this);this._bDestroyed=true}function B(e,t){if(this.getCollectionItem()&&this.getCollectionItem().copilotEntity&&this.getCollectionItem().copilotEntity.getParentEntity()&&this.getCollectionItem().copilotEntity.getParentEntity().copilotEntity){if(e===d){return this.getCollectionItem().copilotEntity.getParentEntity().copilotEntity.getItemsPublic(t)}else if(e===c){return this.getCollectionItem().copilotEntity.getParentEntity().copilotEntity.getParticipantsPublic()}else{return new Promise(function(t,i){if(i){i("Error: "+e+" is not a valid part of a collection.")}else{t([])}})}}return new Promise(function(t,i){if(i){i("Error: Cannot load collection "+e+". Copilot collection entity cannot be accessed")}else{t([])}})}function U(e){return B.call(this,d,e)}function j(){return B.call(this,c)}var J=new s;J.COLLECTION_ITEM_TYPES={};J.COLLECTION_ITEM_TYPES.ITEM_TYPE_NOTE="NOTE";J.COLLECTION_ITEM_TYPES.ITEM_TYPE_RELOBJ="RO";J.COLLECTION_ITEM_TYPES.ITEM_TYPE_SCREENSHOT="SCRS";J.COLLECTION_ITEM_TYPES.ITEM_TYPE_IMAGE="IMG";J.COLLECTION_ITEM_TYPES.ITEM_TYPE_DOCUMENT="DOC";J.COLLECTION_ITEM_TYPES=Object.freeze(J.COLLECTION_ITEM_TYPES);o(J,{getCollectionItem:C.bind(J),getQuickCreateItem:g.bind(J),updateDraftID:_.bind(J),getRootControl:m.bind(J),isDraftEnabled:p.bind(J),isCurrentUserCreator:O.bind(J),getQuickCreateRootBindingContext:N.bind(J),getQuickCreateRootEntityType:y.bind(J),_onComponentContainerAfterRendering:S.bind(J),calculateViewHeight:L.bind(J),setComponentContainerHeight:P.bind(J),getQuickCreateModel:b.bind(J),objectCreated:Q.bind(J),destroy:k.bind(J),getRootView:I.bind(J),setRootView:T.bind(J),getComponentInstance:f.bind(J),getComponentContainer:E.bind(J),_onDataBindingChanged:V.bind(J),_attachToModelBindingChanges:D.bind(J),loadQuickCreateModelFromJSON:R.bind(J),_updateModelJSON:v.bind(J),getCopilotModel:h.bind(J),discardQuickCreateDraft:w.bind(J),_onLineItemsFound:M.bind(J),fireQuickCreateViewCreated:A.bind(J),getCollectionItems:U.bind(J),getCollectionParticipants:j.bind(J)});n.addEventDelegate({onAfterRendering:J._onComponentContainerAfterRendering});J._InstanceKey=J.getCollectionItem().copilotEntity.getODataKey();if(s._Instances[J._InstanceKey]){s._Instances[J._InstanceKey].destroy()}delete s._Instances[J._InstanceKey];s._Instances[J._InstanceKey]=J;sap.ui.getCore().getEventBus().subscribe(s.EVENT_CONSTANTS.EventChannel,s.EVENT_CONSTANTS.QUICKCREATE_LINE_ITEMS_FOUND,J._onLineItemsFound,J);u.oQuickCreateAPI=J;return u.oQuickCreateAPI};return s},true);
//# sourceMappingURL=QuickCreateAPI.js.map