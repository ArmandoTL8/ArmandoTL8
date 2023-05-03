/*
 * SAPUI5
  (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["jquery.sap.global","sap/base/Log","sap/sac/df/thirdparty/lodash","sap/zen/dsh/utils/BaseHandler","sap/zen/dsh/utils/request"],function(jQuery,e,t,r,n){"use strict";var a=function(){r.apply(this,arguments);var t=false;function a(e){return e.charAt(0).toUpperCase()+e.slice(1)}this.updateProperty=function(t,r,n){if(r==="type"||r==="handler_name"||r==="id")return;var i=a(r);var s=t["set"+i];if(s){var o=n[r];try{s.call(t,o)}catch(t){e.error(t)}}};this.dispatchProperties=function(e,r,n){e.oComponentProperties=n;if(r){if(e.beforeDesignStudioUpdate){e.beforeDesignStudioUpdate()}t=true;for(var a in r){e.oControlProperties[a]=r[a];this.updateProperty(e,a,r)}t=false;if(e.afterDesignStudioUpdate){e.afterDesignStudioUpdate()}}};function i(e){var t=new sap.zen.dsh.sapbi_Command("UPDATE_PROPERTIES");t.addParameter(new sap.zen.dsh.sapbi_Parameter("TARGET_ITEM_REF",this.oComponentProperties.id));var r=new sap.zen.dsh.sapbi_Parameter("CHANGES","");var n=new sap.zen.dsh.sapbi_ParameterList;for(var i=0;i<e.length;i++){var s=e[i];var o=this["get"+a(s)]();if(Array.isArray(o)||typeof o=="object"){o=JSON.stringify(o)}n.addParameter(new sap.zen.dsh.sapbi_Parameter(s,o))}r.setChildList(n);t.addParameter(r);return t}function s(e){if(!e)return undefined;var t=e.split(".");var r=window;for(var n=0;n<t.length;n++){var a=t[n];r=r[a];if(!r){break}}return r}this.create=function(r,o,d){var l=o["id"];var p=s(o["handler_name"]);if(p){var u=new p(l,{dsControlProperties:o,dsComponentProperties:d});u.oControlProperties={};u.fireDesignStudioEvent=function(r){if(!t){if(typeof sap.zen.dsh.DSH_deployment=="undefined"){var a=[["EVENT_NAME",r,0],["BI_COMMAND_TYPE","",0],["COMPONENT_NAME",this.oComponentProperties.id,0],["COMMAND_INTERPRETER","BIAL",0]];n.zenSendCommandArrayWoEventWZenPVT(a)}else{var i=this.oComponentProperties.id;var s="Buddha";if(this.oControlProperties.pureId){s=this.oControlProperties.buddhaId;i=this.oControlProperties.pureId}var o=i+".runScript('"+r+"');";sap.zen.dsh.putInQueue(function(){if(!sap.zen.dsh.wnd){e.error("No wnd")}else{sap.zen.dsh.wnd[s].exec(o)}})}}};u.fireDesignStudioPropertiesChanged=function(r){if(!t){if(typeof sap.zen.dsh.DSH_deployment=="undefined"){var s=i.call(this,r);n.zenSendCommandArrayWoEventWZenPVT(s,false,true)}else{var o=[];for(var d=0;d<r.length;d++){var l=r[d];var p=this["get"+a(l)]();o.push(l);o.push(p)}var u=this.oComponentProperties.id;var h="Buddha";if(this.oControlProperties.pureId){h=this.oControlProperties.buddhaId;u=this.oControlProperties.pureId}sap.zen.dsh.putInQueue(function(){if(!sap.zen.dsh.wnd){e.error("No wnd")}else{sap.zen.dsh.wnd[h].exec(u+".doSDKPVT("+JSON.stringify(o)+");")}})}}};u.fireDesignStudioPropertiesChangedAndEvent=function(e,r,a){if(!t&&typeof sap.zen.dsh.DSH_deployment=="undefined"){var s=i.call(this,e);if(a){s.addParameter(new sap.zen.dsh.sapbi_Parameter("PREVENT_UNDO","X"))}var o=new sap.zen.dsh.sapbi_CommandSequence;o.addCommand(s);var d=[["EVENT_NAME",r,0],["BI_COMMAND_TYPE","",0],["COMPONENT_NAME",this.oComponentProperties.id,0],["COMMAND_INTERPRETER","BIAL",0]];var l=sap.zen.dsh.sapbi_createParameterList(d);if(a){l.addParameter(new sap.zen.dsh.sapbi_Parameter("PREVENT_UNDO","X"))}o.addCommand(l);n.zenSendCommandArrayWoEventWZenPVT(o,false,true)}else{this.fireDesignStudioPropertiesChanged(e);this.fireDesignStudioEvent(r)}};u.getZtlCallFunction=function(){return this._ztlFunction};u.setZtlCallFunction=function(e){this._ztlFunction=e;return this};u.getZtlCallPayload=function(){return this._ztlPayload};u.setZtlCallPayload=function(e){this._ztlPayload=e;return this};u.setZtlCallResult=function(e){if(e!==undefined&&this._ztlCallCallback){this._ztlCallCallback.call(this,JSON.parse(e));return this}};u.callZTLFunction=function(e,t){var r=Array.prototype.slice.apply(arguments);r=r.slice(2);this.setZtlCallPayload(JSON.stringify(r)).setZtlCallFunction(e);this._ztlCallCallback=t;this.fireDesignStudioPropertiesChangedAndEvent(["ztlCallPayload","ztlCallFunction"],"onZtlCall")};u.callZTLFunctionNoUndo=function(e,t){var r=Array.prototype.slice.apply(arguments);r=r.slice(2);this.setZtlCallPayload(JSON.stringify(r)).setZtlCallFunction(e);this._ztlCallCallback=t;this.fireDesignStudioPropertiesChangedAndEvent(["ztlCallPayload","ztlCallFunction"],"onZtlCall",true)};if(u.initDesignStudio){u.initDesignStudio()}this.dispatchProperties(u,o,d);return u}return null};this.update=function(e,t,r){this.dispatchProperties(e,t,r);return e};this.advancedPropertyCall=function(e){var t=arguments[1];var r=e[t];if(r){var n=Array.prototype.slice.apply(arguments);n=n.slice(2);return r.apply(e,n)}return null};this.getType=function(){return"sdkui5"};this.getDecorator=function(){return"SdkControlDecorator"}};var i=new a;r.dispatcher.addHandlers(i.getType(),i);return i});
//# sourceMappingURL=sdkui5_handler.js.map