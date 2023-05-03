/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */
sap.ui.define(["./sapvbi"],function(){"use strict";VBI.VBIContext=function(e){var n={};n.vbiclass="VBIContext";n.m_bLoaded=false;n.m_Resources=null;n.m_Config=null;n.m_DataTypeProvider=null;n.m_DataProvider=null;n.m_SceneManager=null;n.m_MapProviders=null;n.m_MapLayerStackManager=null;n.m_Windows=null;n.m_Actions=null;n.m_Automations=null;n.m_Menus=null;n.m_Control=e;n.m_deltacolTable=[];var i=new Date;n.m_StartupTime=i.getTime();n.clear=function(){if(n.m_Resources){n.m_Resources.clear()}if(n.m_Config){n.m_Config.clear()}if(n.m_DataTypeProvider){n.m_DataTypeProvider.clear()}if(n.m_DataProvider){n.m_DataProvider.clear()}if(n.m_SceneManager){n.m_SceneManager.clear()}if(n.m_MapProviders){n.m_MapProviders.clear()}if(n.m_MapLayerStackManager){n.m_MapLayerStackManager.clear()}if(n.m_Windows){n.m_Windows.clear()}if(n.m_Actions){n.m_Actions.clear()}if(n.m_Automations){n.m_Automations.clear()}if(n.m_Menus){n.m_Menus.clear()}n.m_Control=null;n.m_Resources=null;n.m_Config=null;n.m_DataTypeProvider=null;n.m_DataProvider=null;n.m_SceneManager=null;n.m_MapProviders=null;n.m_MapLayerStackManager=null;n.m_Windows=null;n.m_Actions=null;n.m_Automations=null;n.m_Menus=null};n.GetResources=function(){if(!n.m_Resources){n.m_Resources=new VBI.Resources}return n.m_Resources};n.GetConfig=function(){if(!n.m_Config){n.m_Config=new VBI.Configurations}return n.m_Config};n.GetMainScene=function(){if(n.m_Windows){var e=n.m_Windows.GetMainWindow();if(e){var i=e.GetScene();if(i){return i}}}return null};n.FireAction=function(e,i,t,r,a,o,l,m){var s=null;if(jQuery.type(t)=="object"){s=t.m_ID}else if(jQuery.type(t)=="string"){s=t}var u={};var c=u["SAPVB"]={};c["version"]="2.0";c["xmlns:VB"]="VB";var d=c["Action"]={};d.name=e.m_name;d.object=s;d.id=e.m_id;if(o!=undefined){d.instance=o}else if(r){d.instance=r.GetPath()}var h=0;var _=0;var f=false;if(a){d.Params={};d.Params.Param=[];for(var g in a){var v={};v["name"]=g;v["#"]=a[g];d.Params.Param.push(v);if(g=="x"){h=a[g];f=true}if(g=="y"){_=a[g];f=true}}}if(t=="Thumbnail"){h*=i.GetInternalDivWidth()/i.m_Div.clientWidth;_*=i.GetInternalDivHeight()/i.m_Div.clientHeight}if(n.m_DataProvider){n.m_DataProvider.store(c)}var b;if(e.m_additionalProperties&&(b=e.m_additionalProperties.length)){var p=d.AddActionProperties={};var C=p.AddActionProperty=[];for(var W=0;W<b;++W){var P,M;switch(e.m_additionalProperties[W]){case"zoom":C.push({name:"zoom","#":i.GetCurrentZoomlevel().toString()});break;case"pieitem":if(t instanceof VBI.VisualObjects.Pie&&m){C.push({name:"pieitem","#":m.m_Detail.m_slice})}break;case"centerpoint":P=VBI.MathLib.RadToDeg(i.GetCenterPos());C.push({name:"centerpoint","#":P[0].toString()+";"+P[1].toString()+";0.0"});break;case"vos":C.push({name:"vos","#":r.cnt});break;case"subclusters":M=r.isCl==4&&r.bw!=undefined?r.bw.length:-1;C.push({name:"subclusters","#":M});break;case"clustersnextlod":if(r.isCl==4&&r.bw!=undefined){M=i.GetCurrentZoomlevel()==r.lod?r.bw.length:1}else{M=-1}C.push({name:"clustersnextlod","#":M});break;case"clusterarea":var T="";if(r.isCl==4&&r.bo!=undefined){T=this.m_Clustering.getClusterArea(i,r)}C.push({name:"clusterarea","#":T});break;case"pos":if(f){P=i.GetPosFromVPPoint([h,_,0]);C.push({name:"pos","#":P[0].toString()+";"+P[1].toString()+";0.0"})}break;case"pitch":C.push({name:"pitch","#":"0.0"});break;case"yaw":C.push({name:"yaw","#":"0.0"});break;default:break}}}var H=JSON.stringify(c,null,"  ");if(n.m_Control){if(l){return n.m_Control.fireEvent("submit",{data:H},true)}n.m_Control.fireSubmit({data:H})}};n.onRenderLayer=function(e){n.m_Control.fireRender({canvas:e})};n.onMoveLayer=function(e){n.m_Control.fireMove({canvas:e})};n.onZoomLayer=function(e){n.m_Control.fireZoom({canvas:e})};n.onOpenWindow=function(e,i){n.m_Control.fireOpenWindow({id:e,contentarea:i})};n.onCloseWindow=function(e,i){n.m_Control.fireCloseWindow({id:e,contentarea:i})};n.onOpenContainer=function(e,i){n.m_Control.fireContainerCreated({id:e,contentarea:i})};n.onCloseContainer=function(e,i){n.m_Control.fireContainerDestroyed({id:e,contentarea:i})};n.onChangeTrackingMode=function(e,i){n.m_Control.fireChangeTrackingMode({mode:e,bSet:i})};n.DoMinimize=function(e){var i=n.moThumbnail;var t=this.m_Control;var r;if(!i.bThumbnailed){i.strOrgWidth=this.m_Control.getWidth();i.strOrgHeight=this.m_Control.getHeight();i.nOrgWidth=i.nFullWidth?i.nFullWidth:e.m_nDivWidth;i.nOrgHeight=i.nFullHeight?i.nFullHeight:e.m_nDivHeight;i.bThumbnailed=true;r=i.nThumbWidth===e.m_nDivWidth&&i.nThumbHeight===e.m_nDivHeight}else{r=i.nThumbWidth===parseInt(t.getWidth(),10)&&i.nThumbHeight===parseInt(t.getHeight(),10);if(i.nFullWidth&&i.nOrgWidth!=i.nFullWidth){i.nOrgWidth=i.nFullWidth;r=true}if(i.nFullHeight&&i.nOrgHeight!=i.nFullHeight){i.nOrgHeight=i.nFullHeight;r=true}}if(i.nThumbWidth<=0&&i.nOrgHeight>0){i.nThumbWidth=i.nOrgWidth/i.nOrgHeight*i.nThumbHeight}if(i.nThumbHeight<=0&&i.nOrgWidth>0){i.nThumbHeight=i.nOrgHeight/i.nOrgWidth*i.nThumbWidth}t.setWidth(i.nThumbWidth);t.setHeight(i.nThumbHeight);if(r){e.resizeCanvas(0)}};return n}});
//# sourceMappingURL=sapvbicontext.js.map