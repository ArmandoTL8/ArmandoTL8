/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
sap.ui.define(["sap/m/Link","sap/ui/core/Control","sap/m/VBox","sap/m/HBox","sap/m/Button","sap/m/Title","sap/ui/core/TitleLevel","sap/m/Image","sap/m/Text","sap/ui/layout/form/SimpleForm","./Factory","./LinkData","sap/ui/model/json/JSONModel","./Util","sap/ui/layout/HorizontalLayout","sap/ui/layout/VerticalLayout","sap/ui/layout/library","sap/ui/comp/personalization/Util","sap/ui/base/ManagedObjectObserver","sap/m/FlexItemData","sap/ui/model/BindingMode","sap/m/library","sap/ui/comp/personalization/Controller","sap/ui/comp/personalization/SelectionWrapper","sap/ui/comp/personalization/ColumnWrapper","sap/base/Log","sap/ui/comp/navpopover/flexibility/changes/AddLink","sap/ui/core/CustomData"],function(e,t,i,n,a,o,r,s,l,p,u,v,c,g,h,f,d,b,y,m,A,C,_,P,k,L,I,x){"use strict";var N=d.form.SimpleFormLayout;var S=C.FlexJustifyContent;var M=C.ButtonType;var w=i.extend("sap.ui.comp.navpopover.NavigationContainer",{metadata:{library:"sap.ui.comp",properties:{mainNavigationId:{type:"string",group:"Misc",defaultValue:null},enableAvailableActionsPersonalization:{type:"boolean",defaultValue:true}},aggregations:{availableActions:{type:"sap.ui.comp.navpopover.LinkData",multiple:true,singularName:"availableAction"},mainNavigation:{type:"sap.ui.comp.navpopover.LinkData",multiple:false}},associations:{extraContent:{type:"sap.ui.core.Control",multiple:false},component:{type:"sap.ui.core.Element",multiple:false},control:{type:"sap.ui.core.Control",multiple:false}},events:{navigate:{},beforePopoverOpen:{},afterPopoverClose:{}}},renderer:{apiVersion:2}});w.prototype.init=function(){i.prototype.init.call(this);var e=new c({mainNavigationLink:{title:undefined,subtitle:undefined,href:undefined,target:undefined},availableActions:[],enableAvailableActionsPersonalization:undefined,extraContent:undefined,initialAvailableActions:[]});e.setDefaultBindingMode(A.TwoWay);e.setSizeLimit(1e3);this.setModel(e,"$sapuicompNavigationContainer");this._oObserver=new y(this._observeChanges.bind(this));this._oAvailableActionsObserver=new y(this._observeAvailableActionsChanges.bind(this));this._oAvailableActionsObserver.observe(this,{aggregations:["availableActions"]});this.oPersonalizationController=null};w.prototype.applySettings=function(){i.prototype.applySettings.apply(this,arguments);this._createContent()};w.prototype.exit=function(e){if(this._getInternalModel()){this._getInternalModel().destroy()}if(this._oObserver){this._oObserver.disconnect();this._oObserver=null}if(this._oAvailableActionsObserver){this._oAvailableActionsObserver.disconnect();this._oAvailableActionsObserver=null}this._oDefaultExtraConent=null;this._oSeparator=null};w.prototype.openSelectionDialog=function(e,t,i,n,a,o){this.fireBeforePopoverOpen();return this._getFlexRuntimeInfoAPI().then(function(n){return n.waitForChanges({element:this}).then(function(){return new Promise(function(n){var r=this._getInternalModel();var s=g.getStorableAvailableActions(r.getProperty("/initialAvailableActions"));var l=g.getStorableAvailableActions(r.getProperty("/availableActions")).map(function(e){return{columnKey:e.key,visible:e.visible}});var p=new P({press:function(e){this._onLinkPress(e)}.bind(this),columns:s.map(function(t){return new k({label:t.text,selected:t.visible,href:e?undefined:t.href,internalHref:e?undefined:t.internalHref,target:t.target,description:t.description,customData:new x({key:"p13nData",value:{columnKey:t.key}})})})});p._container=this;if(!this.oPersonalizationController){this.oPersonalizationController=new _({resetToInitialTableState:true,table:p,setting:{selection:{visible:true,payload:{callbackSaveChanges:function(e){var t=e&&e.selection&&e.selection.selectionItems||[];if(i){i(t.map(function(e){return{key:e.columnKey,visible:e.visible}}));return Promise.resolve(true)}var n=[];var a=[];t.forEach(function(e){if(e.visible===true){n.push({key:e.columnKey,visible:e.visible})}else{a.push({key:e.columnKey,visible:e.visible})}});return w._saveChanges(n,a,this).then(function(){return true})}.bind(this)}}},dialogConfirmedReset:function(){w._discardChanges(this)}.bind(this),dialogAfterClose:function(){this.fireAfterPopoverClose();n()}.bind(this)})}this.oPersonalizationController.setPersonalizationData({selection:{selectionItems:l}});this.oPersonalizationController.openDialog({contentWidth:"28rem",contentHeight:"35rem",styleClass:""+a,showReset:t,selection:{visible:true}}).then(function(){var e=this.oPersonalizationController._oDialog;if(o){o.addDependent(e)}n()}.bind(this))}.bind(this))}.bind(this))}.bind(this))};w._discardChanges=function(e){return new Promise(function(t){sap.ui.getCore().loadLibrary("sap.ui.fl",{async:true}).then(function(){sap.ui.require(["sap/ui/comp/navpopover/FlexConnector"],function(i){return i.discardChangesForControl(e).then(function(){return t(true)},function(e){L.error("Changes could not be discarded in LRep: "+e);return t(false)})})})})};w._saveChanges=function(e,t,i){return new Promise(function(n){sap.ui.getCore().loadLibrary("sap.ui.fl",{async:true}).then(function(){sap.ui.require(["sap/ui/comp/navpopover/FlexConnector"],function(a){return a.createAndSaveChangesForControl(e,t,i).then(function(){return n(true)},function(e){L.error("Changes could not be saved in LRep: "+e);return n(false)})})})})};w.prototype.getDirectLink=function(){var e=this._getInternalModel();if(e.getProperty("/extraContent")){return null}if(e.getProperty("/mainNavigationLink/href")&&!e.getProperty("/availableActions").length){return this._oHeaderArea.getItems()[0].getContent()}if(e.getProperty("/availableActions").length===1&&!e.getProperty("/mainNavigationLink/href")){return this._oActionArea.getItems()[0].getItems()[0]}return null};w.prototype.hasContent=function(){var e=this._getInternalModel();return!!e.getProperty("/mainNavigationLink/href")||!!e.getProperty("/availableActions").length||!!e.getProperty("/extraContent")};w.prototype.setExtraContent=function(e){this.setAssociation("extraContent",e);if(!e){return this}var t=this._getInternalModel();if(t.getProperty("/extraContent")){this.removeItem(1)}if(typeof e==="string"){e=sap.ui.getCore().byId(e)}this.insertItem(e,1);t.setProperty("/extraContent",e);return this};w.prototype.setMainNavigationId=function(e){this.setProperty("mainNavigationId",e,true);var t=this._getInternalModel();if(typeof e==="string"){t.setProperty("/mainNavigationLink/title",e)}return this};w.prototype.setMainNavigation=function(e){this.setAggregation("mainNavigation",e,true);if(!e){return this}var t=this._getInternalModel();if(e.getHref()){t.setProperty("/mainNavigationLink/href",e.getHref());t.setProperty("/mainNavigationLink/internalHref",e.getInternalHref());t.setProperty("/mainNavigationLink/target",e.getTarget())}if(!t.getProperty("/mainNavigationLink/title")&&t.getProperty("/mainNavigationLink/title")!==""){t.setProperty("/mainNavigationLink/title",e.getText())}t.setProperty("/mainNavigationLink/subtitle",e.getDescription());return this};w.prototype.setEnableAvailableActionsPersonalization=function(e){this.setProperty("enableAvailableActionsPersonalization",e,true);this._getInternalModel().setProperty("/enableAvailableActionsPersonalization",e);return this};w.prototype.onAfterRenderingActionForm=function(){var e=this._getInternalModel();var t=e.getProperty("/extraContent")?e.getProperty("/extraContent").$()[0]:undefined;if(t&&t.scrollHeight>t.clientHeight){this.setFitContainer(false).setJustifyContent(S.Start)}};w.prototype._getFlexRuntimeInfoAPI=function(){return sap.ui.getCore().loadLibrary("sap.ui.fl",{async:true}).then(function(){return new Promise(function(e){sap.ui.require(["sap/ui/fl/apply/api/FlexRuntimeInfoAPI"],function(t){e(t)})})})};w.prototype._createContent=function(){this.addStyleClass("navigationPopover");this._oHeaderArea=this._createHeaderArea();this._oDefaultExtraConent=new p({layout:N.ResponsiveGridLayout,content:[new o({text:sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp").getText("POPOVER_MSG_NO_CONTENT")})]});this._oDefaultExtraConent.addStyleClass("navigationPopoverDefaultExtraContent");this._oSeparator=new i({visible:false});this._oSeparator.addStyleClass("navigationPopoverSeparator");this._oActionArea=new i({items:{path:"/availableActions",templateShareable:false,factory:function(t,n){var a=new e({visible:"{visible}",text:"{text}",href:"{href}",target:"{target}",press:n.getProperty("press")});var o=new x({key:"internalHref",value:"{internalHref}"});a.addCustomData(o);this._oObserver.observe(a,{bindings:["visible"],properties:["visible"]});return new i({visible:"{visible}",layoutData:new m({styleClass:n.getProperty("description")?"navigationPopoverAvailableLinkGroup":"navigationPopoverAvailableLinkWithoutGroup"}),items:[a,new l({visible:"{visible}",text:"{description}"})]})}.bind(this)}});this._oActionArea.addEventDelegate({onAfterRendering:this.onAfterRenderingActionForm.bind(this)});this._oActionArea.addStyleClass("navigationPopoverAvailableLinks");this._oPersonalizationButton=new n({visible:{parts:[{path:"/enableAvailableActionsPersonalization"}],formatter:function(e){return!!e}},justifyContent:"End",items:new a({type:M.Transparent,text:sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp").getText("POPOVER_DEFINE_LINKS"),press:function(e){this.openSelectionDialog(false,true,undefined,true,undefined,e.getSource())}.bind(this)})});this._oPersonalizationButton.addStyleClass("navigationPopoverPersonalizationButton");this.setFitContainer(true);this.setJustifyContent(S.Start);this.addItem(this._oHeaderArea).addItem(this._getInternalModel().getProperty("/extraContent")||this._oDefaultExtraConent).addItem(this._oSeparator).addItem(this._oActionArea).addItem(this._oPersonalizationButton);this._oHeaderArea.setModel(this._getInternalModel());this._oSeparator.setModel(this._getInternalModel());this._oActionArea.setModel(this._getInternalModel());this._oPersonalizationButton.setModel(this._getInternalModel())};w.prototype._createHeaderArea=function(){var e=this._createTitle();var t=this._createSubTitle();var n=new i({items:[e,t],visible:{path:"/mainNavigationLink/title",formatter:function(e){return!!e}}});n.addStyleClass("navigationPopoverTitleH1");n.addStyleClass("navigationPopoverHeader");return n};w.prototype._createSubTitle=function(){var e=new l({text:{path:"/mainNavigationLink/subtitle"},visible:{path:"/mainNavigationLink/subtitle",formatter:function(e){return!!e}}});return e};w.prototype._createTitle=function(){var t=new e({href:{path:"/mainNavigationLink/href"},text:{path:"/mainNavigationLink/title"},target:{path:"/mainNavigationLink/target"},visible:{path:"/mainNavigationLink/title",formatter:function(e){return!!e}},enabled:{path:"/mainNavigationLink/href",formatter:function(e){return!!e}},press:this._onLinkPress.bind(this)});var i=new x({key:"internalHref",value:"{/mainNavigationLink/internalHref}"});t.addCustomData(i);var n=new o({level:r.Auto,content:t});n.addStyleClass("sapFontHeader5Size");this._oObserver.observe(n,{bindings:["visible"],properties:["visible"]});return n};w.prototype._getControl=function(){var e=this.getAssociation("control");if(typeof e==="string"){e=sap.ui.getCore().byId(e)}return e};w.prototype._onLinkPress=function(e){var t=e.getId()==="press"?e.getSource():e.getParameters().getSource();var i=e.getParameters().ctrlKey||e.getParameters().metaKey;if(t.getTarget()!=="_blank"&&!i){e.preventDefault();this.fireNavigate({text:t.getText(),href:t.getHref(),internalHref:t.data("internalHref")})}};w.prototype._getComponent=function(){var e=this.getComponent();if(typeof e==="string"){e=sap.ui.getCore().getComponent(e)}return e};w.prototype._observeAvailableActionsChanges=function(e){var t;if(e.object.isA("sap.ui.comp.navpopover.NavigationContainer")){switch(e.name){case"availableActions":t=this._getInternalModel();var i=e.child?[e.child]:e.children;i.forEach(function(i){switch(e.mutation){case"insert":if(!i||!i.isA("sap.ui.comp.navpopover.LinkData")){return}i.setPress(this._onLinkPress.bind(this));this._oAvailableActionsObserver.observe(i,{properties:["visible"]});t.setProperty("/initialAvailableActions/"+this.indexOfAvailableAction(i)+"/",i.getJson());t.setProperty("/availableActions/"+this.indexOfAvailableAction(i)+"/",i.getJson());break;case"remove":L.error("Deletion of AvailableActions is not supported");break;default:L.error("Mutation '"+e.mutation+"' is not supported jet.")}}.bind(this));break;default:L.error("The '"+e.name+"' of NavigationContainer is not supported yet.")}}else if(e.object.isA("sap.ui.comp.navpopover.LinkData")){switch(e.name){case"visible":var n=e.object;t=this._getInternalModel();var a=-1;t.getProperty("/availableActions").some(function(e,t){if(n.getKey()===e.key){a=t;return true}});if(a<0){L.error("The available action with key '"+n.getKey()+"' does not exist in availableActions.")}if(n.getVisibleChangedByUser()){t.setProperty("/availableActions/"+a+"/visible",n.getVisible())}else{t.setProperty("/initialAvailableActions/"+a+"/visible",n.getVisible());t.setProperty("/availableActions/"+a+"/visible",n.getVisible())}break;default:L.error("The '"+e.name+"' of LinkData is not supported yet.")}}};w.prototype._observeChanges=function(e){if((e.type==="property"||e.type==="binding")&&e.name==="visible"){var t=this._getInternalModel().getProperty("/availableActions");var i=t.filter(function(e){return e.visible===true});this._oSeparator.setVisible(i.length>0||!!this._getInternalModel().getProperty("/enableAvailableActionsPersonalization"));this._oActionArea.setVisible(i.length>0);if(this.hasContent()&&!this._getInternalModel().getProperty("/extraContent")){this._oDefaultExtraConent.setVisible(false)}}};w.prototype._getInternalModel=function(){return this.getModel("$sapuicompNavigationContainer")};return w});
//# sourceMappingURL=NavigationContainer.js.map