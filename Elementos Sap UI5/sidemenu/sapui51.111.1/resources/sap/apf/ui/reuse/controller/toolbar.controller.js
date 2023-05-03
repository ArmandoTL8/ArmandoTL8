/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2018 SAP AG. All rights reserved
 */
sap.ui.define(["sap/ui/core/mvc/Controller","sap/apf/ui/utils/print"],function(e,t){"use strict";return e.extend("sap.apf.ui.reuse.controller.toolbar",{resetAnalysisPath:function(){this.oUiApi.getAnalysisPath().getCarouselView().getController().removeAllThumbnails();this.oCoreApi.resetPath();this.oUiApi.getAnalysisPath().getController().isNewPath=true;this.oStartFilterHandler.resetAll();this.oUiApi.contextChanged(true);this.oUiApi.getAnalysisPath().getController().refreshAnalysisPath();this.oCoreApi.setDirtyState(false);this.oCoreApi.setPathName("");this.oUiApi.getLayoutView().getController().setPathTitle();this.oUiApi.getStepContainer().rerender()},onInit:function(){this.view=this.getView();if(sap.ui.Device.system.desktop){this.view.addStyleClass("sapUiSizeCompact")}this.oViewData=this.getView().getViewData();this.oCoreApi=this.oViewData.oCoreApi;this.oSerializationMediator=this.oViewData.oSerializationMediator;this.oUiApi=this.oViewData.uiApi;this.oStartFilterHandler=this.oViewData.oStartFilterHandler;this.bIsPathGalleryWithDelete=false;this.oPathGalleryDialog={}},addCompactStyleClassForDialog:function(e){if(sap.ui.Device.system.desktop){e.addStyleClass("sapUiSizeCompact")}},onSaveAndSaveAsPress:function(e){var t=this;if(t.oCoreApi.getSteps().length!==0){t.oUiApi.getLayoutView().setBusy(true);t.oCoreApi.readPaths(function(a,i,o){var s=a.paths;if(i!==undefined){t.getView().maxNumberOfSteps=i.getEntityTypeMetadata().maximumNumberOfSteps;t.getView().maxNumberOfPaths=i.getEntityTypeMetadata().maxOccurs}if(o===undefined&&typeof a==="object"){t.getSaveDialog(e,function(){},s)}else{var n=t.oCoreApi.createMessageObject({code:"6005",aParameters:[]});n.setPrevious(o);t.oCoreApi.putMessage(n)}t.oUiApi.getLayoutView().setBusy(false)})}else{var a=t.oCoreApi.createMessageObject({code:"6012",aParameters:[]});t.oCoreApi.putMessage(a)}},openPathGallery:function(e){var t={};var a=this;var i,o;a.oCoreApi.readPaths(function(s,n,l){if(l===undefined&&typeof s==="object"){var r=s.paths;for(i=0;i<r.length;i++){var p=r[i].StructuredAnalysisPath.steps.length;var g=r[i].LastChangeUTCDateTime;var u=/\d+/g;var h=parseInt(g.match(u)[0],10);var c=new Date(h).toString().split(" ");var d=c[1]+"-"+c[2]+"-"+c[3];r[i].title=r[i].AnalysisPathName;r[i].guid=r[i].AnalysisPath;r[i].StructuredAnalysisPath.noOfSteps=p;r[i].description=d+"  -   ("+a.oCoreApi.getTextNotHtmlEncoded("no-of-steps",[p])+")";r[i].summary=r[i].AnalysisPathName+"- ("+d+") - ("+a.oCoreApi.getTextNotHtmlEncoded("no-of-steps",[p])+")"}t={GalleryElements:r};if(e){a.openSavedPathGallery(t,a,"deleteAnalysisPath")}else{a.openSavedPathGallery(t,a,"pathGallery")}a.oUiApi.getLayoutView().setBusy(false)}else{o=a.oCoreApi.createMessageObject({code:"6005",aParameters:[]});o.setPrevious(l);a.oCoreApi.putMessage(o);a.oUiApi.getLayoutView().setBusy(false)}})},openSavedPathGallery:function(e,t,a){if(t.oPathGalleryDialog[a]===undefined||t.oPathGalleryDialog[a]&&t.oPathGalleryDialog[a].bIsDestroyed){t.oPathGalleryDialog[a]=new sap.ui.view({type:sap.ui.core.mvc.ViewType.JS,viewName:"sap.apf.ui.reuse.view."+a,viewData:{oInject:t.oViewData}})}t.oPathGalleryDialog[a].getViewData().jsonData=e;var i=t.oPathGalleryDialog[a].getController().oDialog;if(!i||i&&!i.isOpen()){t.oPathGalleryDialog[a].getController().openPathGallery()}},doPrint:function(){var e=new sap.apf.ui.utils.Print(this.oViewData);e.doPrint()},getSaveDialog:function(e,t,a){var i=this;var o=this.oCoreApi.getTextNotHtmlEncoded("saveName");var s=this.oUiApi.getLayoutView().getController().oSavedPathName.getText();var n=new sap.ui.model.json.JSONModel;n.setData(a);if(s){if(this.oCoreApi.isDirty()){s=s.split("*")[1]}}this.oInput=new sap.m.Input({type:sap.m.InputType.Text,placeholder:o,showSuggestion:true,maxLength:100,suggestionItems:{path:"/",template:new sap.ui.core.Item({text:"{AnalysisPathName}",additionalText:"{AnalysisPath}"})}}).addStyleClass("textStyle");this.oInput.setModel(n);if(!e){this.oInput.destroySuggestionItems()}this.oInput.attachEvent("click",function(e){jQuery(e.currentTarget).attr("value","")});function l(e,t,a,o){i.oInput.setValueState(e);i.oInput.setShowValueStateMessage(t);i.saveDialog.getBeginButton().setEnabled(a);if(a===true){i.saveDialog.getBeginButton().setType("Emphasized")}if(o){i.oInput.setValueStateText(o)}}this.oInput.attachLiveChange(function(e){var t=this.getValue();var a=new RegExp("[*]","g");if(t.trim()===""){l(sap.ui.core.ValueState.Error,true,false)}else{l(sap.ui.core.ValueState.None,false,true)}if(t.match(a)!==null){var o=i.oCoreApi.getTextNotHtmlEncoded("invalidPathName");l(sap.ui.core.ValueState.Error,true,false,o)}i.oInput.setValue(t)});if(s!==i.oCoreApi.getTextNotHtmlEncoded("unsaved")){this.oInput.setValue(s)}this.analysisPathName=i.oInput.getValue().trim();if(i.saveDialog===undefined||i.saveDialog&&i.saveDialog.bIsDestroyed){i.saveDialog=new sap.m.Dialog({type:sap.m.DialogType.Message,title:i.oCoreApi.getTextNotHtmlEncoded("save-analysis-path"),content:i.oInput,contentWidth:"110px",contentHeight:"110px",beginButton:new sap.m.Button({text:i.oCoreApi.getTextNotHtmlEncoded("ok"),enabled:false,press:function(){i.saveDialog.getBeginButton().setEnabled(false);i.saveDialog.getEndButton().setEnabled(false);var a=i.oInput.getValue().trim();i.saveAnalysisPath(a,t,e);i.saveDialog.close()}}),endButton:new sap.m.Button({text:i.oCoreApi.getTextNotHtmlEncoded("cancel"),press:function(){i.saveDialog.close()}}),afterClose:function(){i.oUiApi.getLayoutView().setBusy(false);i.saveDialog.destroy()}}).addStyleClass("saveDialog");this.addCompactStyleClassForDialog(i.saveDialog);if(this.oInput.getValue()===s){i.saveDialog.getBeginButton().setEnabled(true)}}if(i.oCoreApi.getSteps().length>=1){if(!e&&s===i.oCoreApi.getTextNotHtmlEncoded("unsaved")){if(!i.saveDialog||i.saveDialog&&!i.saveDialog.isOpen()){i.saveDialog.open()}}else if(e){if(!i.saveDialog||i.saveDialog&&!i.saveDialog.isOpen()){i.saveDialog.open()}}else{i.saveAnalysisPath(s,t,e)}}},doOkOnNewAnalysisPath:function(){var e=this;this.isOpen=false;e.oCoreApi.readPaths(function(t,a,i){var o=true;var s=t.paths;if(a!==undefined){e.getView().maxNumberOfSteps=a.getEntityTypeMetadata().maximumNumberOfSteps;e.getView().maxNumberOfPaths=a.getEntityTypeMetadata().maxOccurs}if(i===undefined&&typeof t==="object"){e.getSaveDialog(o,function(){e.resetAnalysisPath()},s)}else{var n=e.oCoreApi.createMessageObject({code:"6005",aParameters:[]});n.setPrevious(i);e.oCoreApi.putMessage(n)}})},doOkOnOpenAnalysisPath:function(e){var t=this;this.isOpen=true;this.bIsPathGalleryWithDelete=e;t.oCoreApi.readPaths(function(e,a,i){var o=true;var s=e.paths;if(a!==undefined){t.getView().maxNumberOfSteps=a.getEntityTypeMetadata().maximumNumberOfSteps;t.getView().maxNumberOfPaths=a.getEntityTypeMetadata().maxOccurs}if(i===undefined&&typeof e==="object"){t.getSaveDialog(o,function(){return},s)}else{var n=t.oCoreApi.createMessageObject({code:"6005",aParameters:[]});n.setPrevious(i);t.oCoreApi.putMessage(n)}})},getNewAnalysisPathDialog:function(){var e=this;if(this.oCoreApi.isDirty()&&e.oCoreApi.getSteps().length!==0){e.newDialog=new sap.m.Dialog({type:sap.m.DialogType.Message,title:e.oCoreApi.getTextNotHtmlEncoded("newPath"),content:new sap.m.Text({text:e.oCoreApi.getTextNotHtmlEncoded("analysis-path-not-saved")}).addStyleClass("textStyle"),beginButton:new sap.m.Button({text:e.oCoreApi.getTextNotHtmlEncoded("yes"),press:function(){e.doOkOnNewAnalysisPath();e.newDialog.close()}}),endButton:new sap.m.Button({text:e.oCoreApi.getTextNotHtmlEncoded("no"),press:function(){e.resetAnalysisPath();e.newDialog.close()}}),afterClose:function(){e.oUiApi.getLayoutView().setBusy(false);e.newDialog.destroy()}});this.addCompactStyleClassForDialog(e.newDialog);e.newDialog.setInitialFocus(e.newDialog);e.newDialog.open()}else{this.resetAnalysisPath()}},getOpenDialog:function(e){var t=this;t.newOpenDialog=new sap.m.Dialog({type:sap.m.DialogType.Message,title:t.oCoreApi.getTextNotHtmlEncoded("newPath"),content:new sap.m.Text({text:t.oCoreApi.getTextNotHtmlEncoded("analysis-path-not-saved")}).addStyleClass("textStyle"),beginButton:new sap.m.Button({text:t.oCoreApi.getTextNotHtmlEncoded("yes"),press:function(){t.doOkOnOpenAnalysisPath(t.bIsPathGalleryWithDelete);t.newOpenDialog.close()}}),endButton:new sap.m.Button({text:t.oCoreApi.getTextNotHtmlEncoded("no"),press:function(){t.resetAnalysisPath();t.openPathGallery(t.bIsPathGalleryWithDelete);t.newOpenDialog.close()}}),afterClose:function(){t.oUiApi.getLayoutView().setBusy(false);t.newOpenDialog.destroy()}});this.addCompactStyleClassForDialog(t.newOpenDialog);t.newOpenDialog.setInitialFocus(t.newOpenDialog);t.newOpenDialog.open()},getConfirmDialog:function(e){var t=this;var a=e||{};var i={success:a.success||function(){return},fail:a.fail||function(){return},msg:a.msg||""};t.confirmDialog=new sap.m.Dialog({title:t.oCoreApi.getTextNotHtmlEncoded("caution"),type:sap.m.DialogType.Message,content:new sap.m.Text({text:i.msg}).addStyleClass("textStyle"),beginButton:new sap.m.Button({text:t.oCoreApi.getTextNotHtmlEncoded("yes"),press:function(){t.overWriteAnalysisPath();t.confirmDialog.close()}}),endButton:new sap.m.Button({text:t.oCoreApi.getTextNotHtmlEncoded("no"),press:function(){var e=true;var a=t.oInput.getModel().getData();t.getSaveDialog(e,function(){return},a);t.confirmDialog.close()}}),afterClose:function(){t.oUiApi.getLayoutView().setBusy(false);t.confirmDialog.destroy()}});this.addCompactStyleClassForDialog(t.confirmDialog);t.confirmDialog.open()},callbackforSave:function(e){e()},onOpenPathGallery:function(e){if(this.oCoreApi.isDirty()&&this.oCoreApi.getSteps().length!==0){this.getOpenDialog(e)}else{this.openPathGallery(e)}this.isOpen=false},saveAnalysisPath:function(e,t,a){var i=this;this.saveCallback=t;this.analysisPathName=e;this.aData=i.oInput.getModel().getData();var o=false;this.guid="";for(var s=0;s<this.aData.length;s++){var n=this.aData[s].AnalysisPathName;if(this.analysisPathName===n){o=true;this.guid=this.aData[s].AnalysisPath;break}}var l=o?this.aData.length:this.aData.length+1;var r=i.oCoreApi.getSteps().length;if(l>this.getView().maxNumberOfPaths){i.oCoreApi.putMessage(i.oCoreApi.createMessageObject({code:"6014"}));return false}else if(r>this.getView().maxNumberOfSteps){i.oCoreApi.putMessage(i.oCoreApi.createMessageObject({code:"6015"}));return false}if(!o){i.oSerializationMediator.savePath(i.analysisPathName,function(e,t,a){if(a===undefined&&typeof e==="object"){i.oCoreApi.setDirtyState(false);i.oUiApi.getLayoutView().getController().setPathTitle();i.getSuccessToast(i.analysisPathName,false);if(typeof i.saveCallback==="function"){i.saveCallback()}}else{var o=i.oCoreApi.createMessageObject({code:"6006",aParameters:[i.analysisPathName]});o.setPrevious(a);i.oCoreApi.putMessage(o)}})}else{var p;if(this.oCoreApi.isDirty()&&this.oCoreApi.getSteps().length!==0){p=i.oUiApi.getLayoutView().getController().oSavedPathName.getText().slice(1,i.oUiApi.getLayoutView().getController().oSavedPathName.getText().length)}else{p=i.oUiApi.getLayoutView().getController().oSavedPathName.getText()}if(!a&&p===i.analysisPathName){i.overWriteAnalysisPath()}else{this.getConfirmDialog({msg:i.oCoreApi.getTextNotHtmlEncoded("path-exists",["'"+i.analysisPathName+"'"])})}}},getSuccessToast:function(e,t){var a=this;var i=a.oCoreApi.createMessageObject({code:t?"6017":"6016",aParameters:[e]});a.oCoreApi.putMessage(i);if(a.isOpen&&a.bIsPathGalleryWithDelete){a.openPathGallery(a.bIsPathGalleryWithDelete)}else if(a.isOpen){a.openPathGallery()}},overWriteAnalysisPath:function(){var e=this;var t=this.analysisPathName;var a=this.guid;e.oSerializationMediator.savePath(a,t,function(a,i,o){if(o===undefined&&typeof a==="object"){e.oCoreApi.setDirtyState(false);e.oUiApi.getLayoutView().getController().setPathTitle();if(e.saveDialog&&e.saveDialog.isOpen()){e.saveDialog.close()}e.getSuccessToast(t,true);if(typeof e.saveCallback==="function"){e.saveCallback()}}else{var s=e.oCoreApi.createMessageObject({code:"6007",aParameters:[t]});s.setPrevious(o);e.oCoreApi.putMessage(s)}})},apfDestroy:function(){sap.apf.utils.checkAndCloseDialog(this.saveDialog);sap.apf.utils.checkAndCloseDialog(this.newOpenDialog);sap.apf.utils.checkAndCloseDialog(this.newDialog);sap.apf.utils.checkAndCloseDialog(this.confirmDialog);sap.apf.utils.checkAndCloseDialog(this.errorMsgDialog);sap.apf.utils.checkAndCloseDialog(this.noPathAddedDialog);if(this.deleteAnalysisPath!==undefined){sap.apf.utils.checkAndCloseDialog(this.deleteAnalysisPath.getController().oDialog)}if(this.pathGallery!==undefined){sap.apf.utils.checkAndCloseDialog(this.pathGallery.getController().oDialog)}}})});
//# sourceMappingURL=toolbar.controller.js.map