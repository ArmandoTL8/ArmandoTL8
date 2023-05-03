/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log","sap/base/util/deepClone","sap/base/util/deepEqual","sap/base/util/isPlainObject","sap/fe/core/CommonUtils","sap/fe/core/helpers/KeepAliveHelper","sap/fe/core/helpers/ToES6Promise","sap/fe/core/templating/SemanticObjectHelper","sap/fe/macros/field/FieldHelper","sap/fe/macros/field/FieldRuntime","sap/fe/navigation/SelectionVariant","sap/ui/core/Core","sap/ui/core/Fragment","sap/ui/core/util/XMLPreprocessor","sap/ui/core/XMLTemplateProcessor","sap/ui/mdc/link/Factory","sap/ui/mdc/link/LinkItem","sap/ui/mdc/link/SemanticObjectMapping","sap/ui/mdc/link/SemanticObjectMappingItem","sap/ui/mdc/link/SemanticObjectUnavailableAction","sap/ui/mdc/LinkDelegate","sap/ui/model/json/JSONModel"],function(e,t,n,i,a,s,c,o,r,l,m,u,d,p,f,g,b,h,O,v,j,y){"use strict";var S=o.getDynamicPathFromSemanticObject;const k=Object.assign({},j);const _={iLinksShownInPopup:3,sapmLink:"sap.m.Link",sapuimdcLink:"sap.ui.mdc.Link",sapuimdclinkLinkItem:"sap.ui.mdc.link.LinkItem",sapmObjectIdentifier:"sap.m.ObjectIdentifier",sapmObjectStatus:"sap.m.ObjectStatus"};k.getConstants=function(){return _};k._getEntityType=function(e,t){if(t){return t.createBindingContext(e.entityType)}else{return undefined}};k._getSemanticsModel=function(e,t){if(t){return new y(e)}else{return undefined}};k._getDataField=function(e,t){return t.createBindingContext(e.dataField)};k._getContact=function(e,t){return t.createBindingContext(e.contact)};k.fnTemplateFragment=function(){let e,t;const n={};let i;if(this.resolvedpayload){i=this.resolvedpayload}else{i=this.payload}if(i&&!i.LinkId){i.LinkId=this.oControl&&this.oControl.isA(_.sapuimdcLink)?this.oControl.getId():undefined}if(i.LinkId){t=this.oControl.getModel("$sapuimdcLink").getProperty("/titleLinkHref");i.titlelink=t}const a=this._getSemanticsModel(i,this.oMetaModel);this.semanticModel=a;if(i.entityType&&this._getEntityType(i,this.oMetaModel)){e="sap.fe.macros.quickView.fragments.EntityQuickView";n.bindingContexts={entityType:this._getEntityType(i,this.oMetaModel),semantic:a.createBindingContext("/")};n.models={entityType:this.oMetaModel,semantic:a}}else if(i.dataField&&this._getDataField(i,this.oMetaModel)){e="sap.fe.macros.quickView.fragments.DataFieldQuickView";n.bindingContexts={dataField:this._getDataField(i,this.oMetaModel),semantic:a.createBindingContext("/")};n.models={dataField:this.oMetaModel,semantic:a}}n.models.entitySet=this.oMetaModel;n.models.metaModel=this.oMetaModel;if(this.oControl&&this.oControl.getModel("viewData")){n.models.viewData=this.oControl.getModel("viewData");n.bindingContexts.viewData=this.oControl.getModel("viewData").createBindingContext("/")}const s=f.loadTemplate(e,"fragment");return Promise.resolve(p.process(s,{name:e},n)).then(e=>d.load({definition:e,controller:this})).then(e=>{if(e){if(n.models&&n.models.semantic){e.setModel(n.models.semantic,"semantic");e.setBindingContext(n.bindingContexts.semantic,"semantic")}if(n.bindingContexts&&n.bindingContexts.entityType){e.setModel(n.models.entityType,"entityType");e.setBindingContext(n.bindingContexts.entityType,"entityType")}}this.resolvedpayload=undefined;return e})};k.fetchAdditionalContent=function(e,t){var n;this.oControl=t;const i=e===null||e===void 0?void 0:(n=e.navigationPath)===null||n===void 0?void 0:n.match(/{(.*?)}/);const a=i&&i.length>1&&i[1]?t.getModel().bindContext(i[1],t.getBindingContext(),{$$ownRequest:true}):null;this.payload=e;if(t&&t.isA(_.sapuimdcLink)){this.oMetaModel=t.getModel().getMetaModel();return this.fnTemplateFragment().then(function(e){if(a){e.setBindingContext(a.getBoundContext())}return[e]})}return Promise.resolve([])};k._fetchLinkCustomData=function(e){if(e.getParent()&&e.isA(_.sapuimdcLink)&&(e.getParent().isA(_.sapmLink)||e.getParent().isA(_.sapmObjectIdentifier)||e.getParent().isA(_.sapmObjectStatus))){return e.getCustomData()}else{return undefined}};k.fetchLinkItems=function(e,t,n){if(t&&k._getSemanticObjects(e)){const i=t.getObject();if(n){n.initialize(k._getSemanticObjects(e))}const a=this._link&&this._fetchLinkCustomData(this._link);this.aLinkCustomData=a&&this._fetchLinkCustomData(this._link).map(function(e){return e.mProperties.value});const s=k._calculateSemanticAttributes(i,e,n,this._link);const c=s.results;const o=s.payload;return k._retrieveNavigationTargets("",c,o,n,this._link).then(function(e){return e.length===0?null:e})}else{return Promise.resolve(null)}};k._findLinkType=function(e,t){let n,i;if((t===null||t===void 0?void 0:t.length)===1){i=new b({text:t[0].getText(),href:t[0].getHref()});n=e.hasQuickViewFacets==="false"?1:2}else if(e.hasQuickViewFacets==="false"&&(t===null||t===void 0?void 0:t.length)===0){n=0}else{n=2}return{linkType:n,linkItem:i}};k.fetchLinkType=async function(t,n){const i=n;const a=Object.assign({},t);const s={initialType:{type:2,directLink:undefined},runtimeType:undefined};if(!this.appStateKeyMap){this.appStateKeyMap={}}try{var c;if(a!==null&&a!==void 0&&a.semanticObjects){this._link=n;const e=await i._retrieveUnmodifiedLinkItems();const t=k._findLinkType(a,e);return{initialType:{type:t.linkType,directLink:t.linkItem?t.linkItem:undefined},runtimeType:undefined}}else if((a===null||a===void 0?void 0:(c=a.contact)===null||c===void 0?void 0:c.length)>0){return s}else if(a!==null&&a!==void 0&&a.entityType&&a!==null&&a!==void 0&&a.navigationPath){return s}throw new Error("no payload or semanticObjects found")}catch(t){e.error("Error in SimpleLinkDelegate.fetchLinkType: ",t)}};k._RemoveTitleLinkFromTargets=function(e,t,n){let i,a;let s=false;if(t&&n&&n[0]){let t,c;const o=n[0].intent.split("?")[0];if(e&&e[0]){c=`#${e[0].getProperty("key")}`;t=o===c;if(t){i=e[0].getProperty("href");this.payload.titlelinkhref=i;if(e[0].isA(_.sapuimdclinkLinkItem)){a=e[0].getParent();a.getModel("$sapuimdcLink").setProperty("/titleLinkHref",i);const t=a.getModel("$sapuimdcLink").getProperty("/linkItems").filter(function(e){if(`#${e.key}`!==c){return e}});if(t&&t.length>0){a.getModel("$sapuimdcLink").setProperty("/linkItems/",t)}s=true}}}}return s};k._IsSemanticObjectDynamic=function(e,t){if(e&&t.aLinkCustomData){return t.aLinkCustomData.filter(function(t){return e.filter(function(e){return e!==t}).length>0}).length>0}else{return false}};k._getLineContext=function(e,t){if(!t){if(e.getAggregation("content")[0]&&e.getAggregation("content")[0].getBindingContext()){return e.getAggregation("content")[0].getBindingContext()}}return t};k._setFilterContextUrlForSelectionVariant=function(e,t,n){if(e.getViewData().entitySet&&t){const i=n.constructContextUrl(e.getViewData().entitySet,e.getModel());t.setFilterContextUrl(i)}return t};k._setObjectMappings=function(e,t,n,i){let a=false;const s=new m(i.toJSONObject());n.forEach(function(n){let i=n.semanticObject;const c=S(n.semanticObject);if(c&&t[c]){i=t[c]}if(e===i){const e=n.items;for(const n in e){const i=e[n].key;const c=e[n].value;if(i!==c){if(t[i]){s.removeParameter(c);s.removeSelectOption(c);s.renameParameter(i,c);s.renameSelectOption(i,c);t[c]=t[i];delete t[i];a=true}else if(i.split("/").length>1){const e=i.split("/").slice(-1)[0];if(!t[e]){delete t[e];s.removeParameter(e);s.removeSelectOption(e)}else if(e!==c){s.renameParameter(e,c);s.renameSelectOption(e,c);t[c]=t[e];delete t[e]}}else{delete t[i];s.removeParameter(c);s.removeSelectOption(c)}}}}});return{params:t,hasChanged:a,selectionVariant:s}};k._getAppStateKeyAndUrlParameters=async function(e,t,i,a){var s;let o=[];if(n(i,(s=e.appStateKeyMap[""])===null||s===void 0?void 0:s.selectionVariant)){const t=e.appStateKeyMap[""];return[t.semanticAttributes,t.appstatekey]}if(e.appStateKeyMap[`${a}`]===undefined||!n(e.appStateKeyMap[`${a}`].selectionVariant,i)){o=await c(t.getAppStateKeyAndUrlParameters(i.toJSONString()));e.appStateKeyMap[`${a}`]={semanticAttributes:o[0],appstatekey:o[1],selectionVariant:i}}else{const t=e.appStateKeyMap[`${a}`];o=[t.semanticAttributes,t.appstatekey]}return o};k._getLinkItemWithNewParameter=async function(e,t,n,i,a,s,c,o,r,l){return a.expandCompactHash(i.getHref()).then(async function(m){const u=a.parseShellHash(m);const d=Object.assign({},c);const{params:p,hasChanged:f,selectionVariant:g}=k._setObjectMappings(u.semanticObject,d,s.semanticObjectMappings,r);if(f){const t=await k._getAppStateKeyAndUrlParameters(e,l,g,u.semanticObject);o=t[1]}const b={target:{semanticObject:u.semanticObject,action:u.action},params:p,appStateKey:o};delete b.params["sap-xapp-state"];i.setHref(`#${a.constructShellHash(b)}`);s.aSemanticLinks.push(i.getHref());return k._RemoveTitleLinkFromTargets.bind(e)([i],t,n)})};k._removeEmptyLinkItem=function(e){return e.filter(e=>e!==undefined)};k.modifyLinkItems=async function(t,n,i){const s=await r.checkPrimaryActions(t,true);const c=s.titleLink;const o=s.hasTitleLink;if(i.length!==0){this.payload=t;const s=i[0].getParent();const r=a.getTargetView(s);const l=a.getAppComponent(r);const m=l.getShellServices();if(!m.hasUShell()){e.error("QuickViewDelegate: Cannot retrieve the shell services");return Promise.reject()}const u=r.getModel().getMetaModel();let d=s.getBindingContext();const p={semanticObject:t.mainSemanticObject,action:""};try{const e=s&&this._fetchLinkCustomData(s).map(function(e){return e.mProperties.value});if(k._IsSemanticObjectDynamic(e,this)){const e=k._calculateSemanticAttributes(n.getObject(),t,undefined,this._link);const a=e.results;const s=e.payload;i=await k._retrieveNavigationTargets("",a,s,undefined,this._link)}const a=l.getNavigationService();const f=r.getController();let g;let b;d=k._getLineContext(r,d);const h=u.getMetaPath(d.getPath());b=f._intentBasedNavigation.removeSensitiveData(d.getObject(),h);b=f._intentBasedNavigation.prepareContextForExternalNavigation(b,d);g=a.mixAttributesAndSelectionVariant(b.semanticAttributes,{});p.propertiesWithoutConflict=b.propertiesWithoutConflict;f.intentBasedNavigation.adaptNavigationContext(g,p);k._removeTechnicalParameters(g);g=k._setFilterContextUrlForSelectionVariant(r,g,a);const O=await k._getAppStateKeyAndUrlParameters(this,a,g,"");const v=O[0];const j=O[1];let y;t.aSemanticLinks=[];i=k._removeEmptyLinkItem(i);for(const e in i){y=await k._getLinkItemWithNewParameter(this,o,c,i[e],m,t,v,j,g,a);if(y===true){i[e]=undefined}}return k._removeEmptyLinkItem(i)}catch(t){e.error("Error while getting the navigation service",t);return undefined}}else{return i}};k.beforeNavigationCallback=function(e,t){const n=t.getSource(),i=t.getParameter("href"),a=g.getService("URLParsing"),c=i&&a.parseShellHash(i);s.storeControlRefreshStrategyForHash(n,c);return Promise.resolve(true)};k._removeTechnicalParameters=function(e){e.removeSelectOption("@odata.context");e.removeSelectOption("@odata.metadataEtag");e.removeSelectOption("SAP__Messages")};k._getSemanticObjectCustomDataValue=function(e,t){let n,i;for(let a=0;a<e.length;a++){n=e[a].getKey();i=e[a].getValue();t[n]={value:i}}};k._isDynamicPath=function(e){if(e&&e.indexOf("{")===0&&e.indexOf("}")===e.length-1){return true}else{return false}};k._updatePayloadWithResolvedSemanticObjectValue=function(e,t,n){var i;if(k._isDynamicPath(e.mainSemanticObject)){if(n){t.mainSemanticObject=n}else{t.mainSemanticObject=undefined}}switch(typeof n){case"string":(i=t.semanticObjectsResolved)===null||i===void 0?void 0:i.push(n);t.semanticObjects.push(n);break;case"object":for(const e in n){var a;(a=t.semanticObjectsResolved)===null||a===void 0?void 0:a.push(n[e]);t.semanticObjects.push(n[e])}break;default:}};k._createNewPayloadWithDynamicSemanticObjectsResolved=function(e,t,n){let i,a;for(const s in e.semanticObjects){i=e.semanticObjects[s];if(k._isDynamicPath(i)){a=i.substr(1,i.indexOf("}")-1);i=t[a].value;k._updatePayloadWithResolvedSemanticObjectValue(e,n,i)}else{n.semanticObjects.push(i)}}};k._updateSemanticObjectsForMappings=function(e,t,n){t.semanticObjectMappings.forEach(function(t){if(t.semanticObject&&k._isDynamicPath(t.semanticObject)){t.semanticObject=n.semanticObjects[e.semanticObjects.indexOf(t.semanticObject)]}})};k._updateSemanticObjectsUnavailableActions=function(e,t,n){let i;t.forEach(function(t){if(t!==null&&t!==void 0&&t.semanticObject&&k._isDynamicPath(t.semanticObject)){i=e.semanticObjects.findIndex(function(e){return e===t.semanticObject});if(i!==undefined){t.semanticObject=n.semanticObjects[i]}}})};k._updateSemanticObjectsWithResolvedValue=function(e,t){for(let n=0;n<e.semanticObjects.length;n++){if(t.mainSemanticObject===(e.semanticObjectsResolved&&e.semanticObjectsResolved[n])){t.mainSemanticObject=e.semanticObjects[n]}if(t.semanticObjects[n]){t.semanticObjects[n]=e.semanticObjects[n]}else{t.semanticObjects.splice(n,1)}}};k._removeEmptySemanticObjectsMappings=function(e){for(let t=0;t<e.semanticObjectMappings.length;t++){if(e.semanticObjectMappings[t]&&e.semanticObjectMappings[t].semanticObject===undefined){e.semanticObjectMappings.splice(t,1)}}};k._setPayloadWithDynamicSemanticObjectsResolved=function(e,n){let i;if(n.semanticObjectsResolved&&n.semanticObjectsResolved.length>0){i={entityType:e.entityType,dataField:e.dataField,contact:e.contact,mainSemanticObject:e.mainSemanticObject,navigationPath:e.navigationPath,propertyPathLabel:e.propertyPathLabel,semanticObjectMappings:t(e.semanticObjectMappings),semanticObjects:n.semanticObjects};k._updateSemanticObjectsForMappings(e,i,n);const a=t(e.semanticObjectUnavailableActions);k._updateSemanticObjectsUnavailableActions(e,a,i);i.semanticObjectUnavailableActions=a;if(n.mainSemanticObject){i.mainSemanticObject=n.mainSemanticObject}else{i.mainSemanticObject=undefined}k._updateSemanticObjectsWithResolvedValue(n,i);k._removeEmptySemanticObjectsMappings(i);return i}else{return{}}};k._getPayloadWithDynamicSemanticObjectsResolved=function(e,t){let n;const i={};const a={semanticObjects:[],semanticObjectsResolved:[],semanticObjectMappings:[]};if(e.semanticObjects){if(t&&t.length>0){k._getSemanticObjectCustomDataValue(t,i);k._createNewPayloadWithDynamicSemanticObjectsResolved(e,i,a);n=k._setPayloadWithDynamicSemanticObjectsResolved(e,a);return n}}else{return undefined}};k._updatePayloadWithSemanticAttributes=function(t,n,a,s,c){t.forEach(function(t){if(n){n.addContextObject(t,a)}s[t]={};for(const o in a){let r=null,l=null;if(n){r=n.getSemanticObjectAttribute(t,o);if(!r){r=n.createAttributeStructure();n.addSemanticObjectAttribute(t,o,r)}}if(a[o]===undefined||a[o]===null){if(r){r.transformations.push({value:undefined,description:"ℹ Undefined and null values have been removed in SimpleLinkDelegate."})}continue}if(i(a[o])){if(c&&c[t]){const e=Object.keys(c[t]);let n,i,r,l;for(let m=0;m<e.length;m++){l=e[m];if(l.indexOf(o)===0){n=c[t][l];i=l.split("/")[l.split("/").length-1];r=a[o][i];if(n&&i&&r){s[t][n]=r}}}}if(r){r.transformations.push({value:undefined,description:"ℹ Plain objects has been removed in SimpleLinkDelegate."})}continue}const m=c&&c[t]&&c[t][o]?c[t][o]:o;if(r&&o!==m){l={value:undefined,description:`ℹ The attribute ${o} has been renamed to ${m} in SimpleLinkDelegate.`,reason:`🔴 A com.sap.vocabularies.Common.v1.SemanticObjectMapping annotation is defined for semantic object ${t} with source attribute ${o} and target attribute ${m}. You can modify the annotation if the mapping result is not what you expected.`}}if(s[t][m]){e.error(`SimpleLinkDelegate: The attribute ${o} can not be renamed to the attribute ${m} due to a clash situation. This can lead to wrong navigation later on.`)}s[t][m]=a[o];if(r){if(l){r.transformations.push(l);const e=n.createAttributeStructure();e.transformations.push({value:a[o],description:`ℹ The attribute ${m} with the value ${a[o]} has been added due to a mapping rule regarding the attribute ${o} in SimpleLinkDelegate.`});n.addSemanticObjectAttribute(t,m,e)}}}})};k._calculateSemanticAttributes=function(e,t,n,i){const a=i&&this._fetchLinkCustomData(i);const s=k._getPayloadWithDynamicSemanticObjectsResolved(t,a);const c=s?s:t;this.resolvedpayload=s;const o=k._getSemanticObjects(c);const r=k._convertSemanticObjectMapping(k._getSemanticObjectMappings(c));if(!o.length){return{payload:c,results:{}}}const l={};k._updatePayloadWithSemanticAttributes(o,n,e,l,r);return{payload:c,results:l}};k._retrieveNavigationTargets=function(t,n,i,s,c){if(!i.semanticObjects){return Promise.resolve([])}const o=i.semanticObjects;const r={ownNavigation:undefined,availableActions:[]};let m=0;return u.loadLibrary("sap.ui.fl",{async:true}).then(()=>new Promise(u=>{sap.ui.require(["sap/ui/fl/Utils"],async d=>{const p=d.getAppComponentForControl(c===undefined?this.oControl:c);const f=p?p.getShellServices():null;if(!f){u(r.availableActions,r.ownNavigation)}if(!f.hasUShell()){e.error("SimpleLinkDelegate: Service 'CrossApplicationNavigation' or 'URLParsing' could not be obtained");u(r.availableActions,r.ownNavigation)}const g=o.map(function(e){return[{semanticObject:e,params:n?n[e]:undefined,appStateKey:t,sortResultsBy:"text"}]});try{const e=await f.getLinks(g);let t=false;for(let n=0;n<e.length;n++){for(let i=0;i<e[n].length;i++){if(e[n][i].length>0){t=true;break}if(t){break}}}if(!e||!e.length||!t){u(r.availableActions,r.ownNavigation)}const n=k._getSemanticObjectUnavailableActions(i);const c=k._convertSemanticObjectUnavailableAction(n);let d=l._fnFixHashQueryString(a.getHash());if(d){d+="?"}const p=function(e,t){return!!c&&!!c[e]&&c[e].indexOf(t)>-1};const h=function(e){const t=f.parseShellHash(e.intent);if(p(t.semanticObject,t.action)){return}const n=`#${f.constructShellHash({target:{shellHash:e.intent}})}`;if(e.intent&&e.intent.indexOf(d)===0){r.ownNavigation=new b({href:n,text:e.text});return}const i=new b({key:t.semanticObject&&t.action?`${t.semanticObject}-${t.action}`:undefined,text:e.text,description:undefined,href:n,icon:undefined,initiallyVisible:e.tags&&e.tags.indexOf("superiorAction")>-1});if(i.getProperty("initiallyVisible")){m++}r.availableActions.push(i);if(s){s.addSemanticObjectIntent(t.semanticObject,{intent:i.getHref(),text:i.getText()})}};for(let t=0;t<o.length;t++){e[t][0].forEach(h)}if(m===0){for(let e=0;e<r.availableActions.length;e++){if(e<this.getConstants().iLinksShownInPopup){r.availableActions[e].setProperty("initiallyVisible",true)}else{break}}}u(r.availableActions,r.ownNavigation)}catch(t){e.error("SimpleLinkDelegate: '_retrieveNavigationTargets' failed executing getLinks method");u(r.availableActions,r.ownNavigation)}})}))};k._getSemanticObjects=function(e){return e.semanticObjects?e.semanticObjects:[]};k._getSemanticObjectUnavailableActions=function(e){const t=[];if(e.semanticObjectUnavailableActions){e.semanticObjectUnavailableActions.forEach(function(e){t.push(new v({semanticObject:e.semanticObject,actions:e.actions}))})}return t};k._getSemanticObjectMappings=function(e){const t=[];let n=[];if(e.semanticObjectMappings){e.semanticObjectMappings.forEach(function(e){n=[];if(e.items){e.items.forEach(function(e){n.push(new O({key:e.key,value:e.value}))})}t.push(new h({semanticObject:e.semanticObject,items:n}))})}return t};k._convertSemanticObjectMapping=function(e){if(!e.length){return undefined}const t={};e.forEach(function(e){if(!e.getSemanticObject()){throw Error(`SimpleLinkDelegate: 'semanticObject' property with value '${e.getSemanticObject()}' is not valid`)}t[e.getSemanticObject()]=e.getItems().reduce(function(e,t){e[t.getKey()]=t.getValue();return e},{})});return t};k._convertSemanticObjectUnavailableAction=function(e){let t;let n;let i=[];if(!e.length){return undefined}const a={};e.forEach(function(e){t=e.getSemanticObject();if(!t){throw Error(`SimpleLinkDelegate: 'semanticObject' property with value '${t}' is not valid`)}i=e.getActions();if(a[t]===undefined){a[t]=i}else{n=a[t];i.forEach(function(e){n.push(e)});a[t]=n}});return a};return k},false);
//# sourceMappingURL=QuickViewDelegate.js.map