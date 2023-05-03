/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlock","sap/base/Log","sap/fe/core/buildingBlocks/BuildingBlockRuntime","sap/fe/core/CommonUtils","sap/fe/core/converters/controls/Common/DataVisualization","sap/fe/core/converters/controls/ListReport/FilterBar","sap/fe/core/converters/MetaModelConverter","sap/fe/core/helpers/ModelHelper","sap/fe/core/helpers/StableIdHelper","sap/fe/core/TemplateModel","sap/fe/core/templating/FilterHelper","sap/fe/macros/CommonHelper","../ResourceModel"],function(e,t,i,r,a,l,n,o,s,u,c,p,d){"use strict";var f,b,h,g,m,y,v,F,C,S,w,B,P,$,I,_,D,z,x,A,M,V,k,E,H,R,T,O,L,N,j,U,q,J,X,G,W,K,Q,Y,Z,ee,te,ie,re,ae,le,ne,oe,se,ue,ce,pe,de,fe,be,he,ge,me,ye,ve,Fe,Ce;var Se={};var we=c.getFilterConditions;var Be=s.generate;var Pe=n.getInvolvedDataModelObjects;var $e=l.getSelectionFields;var Ie=a.getSelectionVariant;var _e=i.xml;var De=e.defineBuildingBlock;var ze=e.BuildingBlockBase;var xe=e.blockEvent;var Ae=e.blockAttribute;var Me=e.blockAggregation;function Ve(e,t,i,r){if(!i)return;Object.defineProperty(e,t,{enumerable:i.enumerable,configurable:i.configurable,writable:i.writable,value:i.initializer?i.initializer.call(r):void 0})}function ke(e){if(e===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return e}function Ee(e,t){e.prototype=Object.create(t.prototype);e.prototype.constructor=e;He(e,t)}function He(e,t){He=Object.setPrototypeOf?Object.setPrototypeOf.bind():function e(t,i){t.__proto__=i;return t};return He(e,t)}function Re(e,t,i,r,a){var l={};Object.keys(r).forEach(function(e){l[e]=r[e]});l.enumerable=!!l.enumerable;l.configurable=!!l.configurable;if("value"in l||l.initializer){l.writable=true}l=i.slice().reverse().reduce(function(i,r){return r(e,t,i)||i},l);if(a&&l.initializer!==void 0){l.value=l.initializer?l.initializer.call(a):void 0;l.initializer=undefined}if(l.initializer===void 0){Object.defineProperty(e,t,l);l=null}return l}function Te(e,t){throw new Error("Decorating class property failed. Please ensure that "+"proposal-class-properties is enabled and runs after the decorators transform.")}const Oe=function(e,t){t.slotName=t.key;t.key=t.key.replace("InlineXML_","");t.label=e.getAttribute("label");t.required=e.getAttribute("required")==="true";return t};let Le=(f=De({name:"FilterBar",namespace:"sap.fe.macros.internal",publicNamespace:"sap.fe.macros"}),b=Ae({type:"string",isPublic:true}),h=Ae({type:"boolean",isPublic:true}),g=Ae({type:"sap.ui.model.Context"}),m=Ae({type:"string"}),y=Ae({type:"sap.ui.model.Context",isPublic:true}),v=Ae({type:"sap.ui.model.Context",isPublic:true}),F=Ae({type:"boolean",defaultValue:false,isPublic:true}),C=Ae({type:"string"}),S=Ae({type:"boolean"}),w=Ae({type:"boolean",defaultValue:false}),B=Ae({type:"boolean",defaultValue:true}),P=Ae({type:"sap.ui.mdc.FilterBarP13nMode[]",defaultValue:"Item,Value"}),$=Ae({type:"string"}),I=Ae({type:"boolean",defaultValue:true}),_=Ae({type:"boolean",defaultValue:false,isPublic:true}),D=Ae({type:"string",required:false}),z=Ae({type:"boolean",defaultValue:false}),x=Ae({type:"boolean",defaultValue:false}),A=Ae({type:"boolean",defaultValue:false}),M=Ae({type:"string"}),V=Ae({type:"string",defaultValue:"compact"}),k=Ae({type:"boolean",defaultValue:false,isPublic:true}),E=Ae({type:"boolean",defaultValue:false}),H=xe(),R=xe(),T=xe(),O=xe(),L=xe(),N=xe(),j=Me({type:"sap.fe.macros.FilterField",isPublic:true,hasVirtualNode:true,processAggregations:Oe}),f(U=(q=function(e){Ee(i,e);function i(i,a,l){var n,s,c,d;var f;f=e.call(this,i,a,l)||this;Ve(f,"id",J,ke(f));Ve(f,"visible",X,ke(f));Ve(f,"selectionFields",G,ke(f));Ve(f,"filterBarDelegate",W,ke(f));Ve(f,"metaPath",K,ke(f));Ve(f,"contextPath",Q,ke(f));Ve(f,"showMessages",Y,ke(f));Ve(f,"variantBackreference",Z,ke(f));Ve(f,"hideBasicSearch",ee,ke(f));Ve(f,"enableFallback",te,ke(f));Ve(f,"showAdaptFiltersButton",ie,ke(f));Ve(f,"p13nMode",re,ke(f));Ve(f,"propertyInfo",ae,ke(f));Ve(f,"useSemanticDateRange",le,ke(f));Ve(f,"liveMode",ne,ke(f));Ve(f,"filterConditions",oe,ke(f));Ve(f,"suspendSelection",se,ke(f));Ve(f,"showDraftEditState",ue,ke(f));Ve(f,"isDraftCollaborative",ce,ke(f));Ve(f,"toggleControlId",pe,ke(f));Ve(f,"initialLayout",de,ke(f));Ve(f,"showClearButton",fe,ke(f));Ve(f,"_applyIdToContent",be,ke(f));Ve(f,"search",he,ke(f));Ve(f,"filterChanged",ge,ke(f));Ve(f,"stateChange",me,ke(f));Ve(f,"internalFilterChanged",ye,ke(f));Ve(f,"internalSearch",ve,ke(f));Ve(f,"afterClear",Fe,ke(f));Ve(f,"filterFields",Ce,ke(f));f.checkIfCollaborationDraftSupported=e=>{if(o.isCollaborationDraftSupported(e)){f.isDraftCollaborative=true}};f.getEntityTypePath=e=>e[0].endsWith("/")?e[0]:e[0]+"/";f.getSearch=()=>{if(!f.hideBasicSearch){return _e`<control:basicSearchField>
			<mdc:FilterField
				id="${Be([f.id,"BasicSearchField"])}"
				placeholder="{sap.fe.i18n>M_FILTERBAR_SEARCH}"
				conditions="{$filters>/conditions/$search}"
				dataType="sap.ui.model.odata.type.String"
				maxConditions="1"
			/>
		</control:basicSearchField>`}return _e``};f.processSelectionFields=()=>{var e,t,i,r;let a=_e``;if(f.showDraftEditState){a=`<core:Fragment fragmentName="sap.fe.macros.filter.DraftEditState" type="XML" />`}f._valueHelps=[];f._filterFields=[];(e=f._filterFields)===null||e===void 0?void 0:e.push(a);if(!Array.isArray(f.selectionFields)){f.selectionFields=f.selectionFields.getObject()}(t=f.selectionFields)===null||t===void 0?void 0:t.forEach((e,t)=>{if(e.availability==="Default"){f.setFilterFieldsAndValueHelps(e,t)}});f._filterFields=((i=f._filterFields)===null||i===void 0?void 0:i.length)>0?f._filterFields:"";f._valueHelps=((r=f._valueHelps)===null||r===void 0?void 0:r.length)>0?f._valueHelps:""};f.setFilterFieldsAndValueHelps=(e,t)=>{if(e.template===undefined&&e.type!=="Slot"){f.pushFilterFieldsAndValueHelps(e)}else if(Array.isArray(f._filterFields)){var i;(i=f._filterFields)===null||i===void 0?void 0:i.push(_e`<template:with path="selectionFields>${t}" var="item">
					<core:Fragment fragmentName="sap.fe.macros.filter.CustomFilter" type="XML" />
				</template:with>`)}};f.pushFilterFieldsAndValueHelps=e=>{if(Array.isArray(f._filterFields)){var t;(t=f._filterFields)===null||t===void 0?void 0:t.push(_e`<internalMacro:FilterField
			idPrefix="${Be([f.id,"FilterField",p.getNavigationPath(e.annotationPath)])}"
			vhIdPrefix="${Be([f.id,"FilterFieldValueHelp"])}"
			property="${e.annotationPath}"
			contextPath="${f._getContextPathForFilterField(e,f._internalContextPath)}"
			useSemanticDateRange="${f.useSemanticDateRange}"
			settings="${p.stringifyCustomData(e.settings)}"
			visualFilter="${e.visualFilter}"
			/>`)}if(Array.isArray(f._valueHelps)){var i;(i=f._valueHelps)===null||i===void 0?void 0:i.push(_e`<macro:ValueHelp
			idPrefix="${Be([f.id,"FilterFieldValueHelp"])}"
			conditionModel="$filters"
			property="${e.annotationPath}"
			contextPath="${f._getContextPathForFilterField(e,f._internalContextPath)}"
			filterFieldValueHelp="true"
			useSemanticDateRange="${f.useSemanticDateRange}"
		/>`)}};const b=i.contextPath;const h=i.metaPath;if(!h){t.error("Context Path not available for FilterBar Macro.");return ke(f)}const g=h===null||h===void 0?void 0:h.getPath();let m="";const y=(g===null||g===void 0?void 0:g.split("/@com.sap.vocabularies.UI.v1.SelectionFields"))||[];if(y.length>0){m=f.getEntityTypePath(y)}const v=o.getEntitySetPath(m);const F=b===null||b===void 0?void 0:b.getModel();f._internalContextPath=F===null||F===void 0?void 0:F.createBindingContext(m);const C="@com.sap.vocabularies.UI.v1.SelectionFields";const S="@com.sap.vocabularies.UI.v1.SelectionFields"+(y.length&&y[1]||"");const w={};w[C]={filterFields:i.filterFields};const B=Pe(f._internalContextPath);const P=f.getConverterContext(B,undefined,l,w);if(!i.propertyInfo){f.propertyInfo=$e(P,[],S).sPropertyInfo}if(!i.selectionFields){const e=$e(P,[],S).selectionFields;f.selectionFields=new u(e,F).createBindingContext("/");const t=P.getEntityType(),i=Ie(t,P),r=F.getContext(v),a=we(r,{selectionVariant:i});f.filterConditions=a}f._processPropertyInfos(f.propertyInfo);const $=Pe(b).targetObject;if((n=$.annotations)!==null&&n!==void 0&&(s=n.Common)!==null&&s!==void 0&&s.DraftRoot||(c=$.annotations)!==null&&c!==void 0&&(d=c.Common)!==null&&d!==void 0&&d.DraftNode){f.showDraftEditState=true;f.checkIfCollaborationDraftSupported(F)}if(i._applyIdToContent){f._apiId=i.id+"::FilterBar";f._contentId=i.id}else{f._apiId=i.id;f._contentId=f.getContentId(i.id+"")}if(i.hideBasicSearch!==true){const e=r.getSearchRestrictions(v,F);f.hideBasicSearch=Boolean(e&&!e.Searchable)}f.processSelectionFields();return f}Se=i;var a=i.prototype;a.getContentId=function e(t){return`${t}-content`};a._processPropertyInfos=function e(t){const i=[];if(t){const e=t.replace(/\\{/g,"{").replace(/\\}/g,"}");const r=JSON.parse(e);r.forEach(function(e){if(e.isParameter){i.push(e.name)}if(e.path==="$editState"){e.label=d.getText("FILTERBAR_EDITING_STATUS")}});this.propertyInfo=JSON.stringify(r).replace(/\{/g,"\\{").replace(/\}/g,"\\}")}this._parameters=JSON.stringify(i)};a._getContextPathForFilterField=function e(t,i){let r=i;if(t.isParameter){const e=t.annotationPath;r=e.substring(0,e.lastIndexOf("/")+1)}return r};a.getTemplate=function e(){var t;const i=(t=this._internalContextPath)===null||t===void 0?void 0:t.getPath();let r="";if(this.filterBarDelegate){r=this.filterBarDelegate}else{r="{name:'sap/fe/macros/filterBar/FilterBarDelegate', payload: {entityTypePath: '"+i+"'}}"}return _e`<macroFilterBar:FilterBarAPI
        xmlns:template="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1"
        xmlns:core="sap.ui.core"
        xmlns:mdc="sap.ui.mdc"
        xmlns:control="sap.fe.core.controls"
        xmlns:macroFilterBar="sap.fe.macros.filterBar"
        xmlns:macro="sap.fe.macros"
        xmlns:internalMacro="sap.fe.macros.internal"
        xmlns:customData="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"
		id="${this._apiId}"
		search="${this.search}"
		filterChanged="${this.filterChanged}"
		afterClear="${this.afterClear}"
		internalSearch="${this.internalSearch}"
		internalFilterChanged="${this.internalFilterChanged}"
		stateChange="${this.stateChange}"
	>
		<control:FilterBar
			core:require="{API: 'sap/fe/macros/filterBar/FilterBarAPI'}"
			id="${this._contentId}"
			liveMode="${this.liveMode}"
			delegate="${r}"
			variantBackreference="${this.variantBackreference}"
			showAdaptFiltersButton="${this.showAdaptFiltersButton}"
			showClearButton="${this.showClearButton}"
			p13nMode="${this.p13nMode}"
			search="API.handleSearch($event)"
			filtersChanged="API.handleFilterChanged($event)"
			filterConditions="${this.filterConditions}"
			suspendSelection="${this.suspendSelection}"
			showMessages="${this.showMessages}"
			toggleControl="${this.toggleControlId}"
			initialLayout="${this.initialLayout}"
			propertyInfo="${this.propertyInfo}"
			customData:localId="${this.id}"
			visible="${this.visible}"
			customData:hideBasicSearch="${this.hideBasicSearch}"
			customData:showDraftEditState="${this.showDraftEditState}"
			customData:useSemanticDateRange="${this.useSemanticDateRange}"
			customData:entityType="${i}"
			customData:parameters="${this._parameters}"
		>
			<control:dependents>
				${this._valueHelps}
			</control:dependents>
			${this.getSearch()}
			<control:filterItems>
				${this._filterFields}
			</control:filterItems>
		</control:FilterBar>
	</macroFilterBar:FilterBarAPI>`};return i}(ze),J=Re(q.prototype,"id",[b],{configurable:true,enumerable:true,writable:true,initializer:null}),X=Re(q.prototype,"visible",[h],{configurable:true,enumerable:true,writable:true,initializer:null}),G=Re(q.prototype,"selectionFields",[g],{configurable:true,enumerable:true,writable:true,initializer:null}),W=Re(q.prototype,"filterBarDelegate",[m],{configurable:true,enumerable:true,writable:true,initializer:null}),K=Re(q.prototype,"metaPath",[y],{configurable:true,enumerable:true,writable:true,initializer:null}),Q=Re(q.prototype,"contextPath",[v],{configurable:true,enumerable:true,writable:true,initializer:null}),Y=Re(q.prototype,"showMessages",[F],{configurable:true,enumerable:true,writable:true,initializer:null}),Z=Re(q.prototype,"variantBackreference",[C],{configurable:true,enumerable:true,writable:true,initializer:null}),ee=Re(q.prototype,"hideBasicSearch",[S],{configurable:true,enumerable:true,writable:true,initializer:null}),te=Re(q.prototype,"enableFallback",[w],{configurable:true,enumerable:true,writable:true,initializer:null}),ie=Re(q.prototype,"showAdaptFiltersButton",[B],{configurable:true,enumerable:true,writable:true,initializer:null}),re=Re(q.prototype,"p13nMode",[P],{configurable:true,enumerable:true,writable:true,initializer:null}),ae=Re(q.prototype,"propertyInfo",[$],{configurable:true,enumerable:true,writable:true,initializer:null}),le=Re(q.prototype,"useSemanticDateRange",[I],{configurable:true,enumerable:true,writable:true,initializer:null}),ne=Re(q.prototype,"liveMode",[_],{configurable:true,enumerable:true,writable:true,initializer:null}),oe=Re(q.prototype,"filterConditions",[D],{configurable:true,enumerable:true,writable:true,initializer:null}),se=Re(q.prototype,"suspendSelection",[z],{configurable:true,enumerable:true,writable:true,initializer:null}),ue=Re(q.prototype,"showDraftEditState",[x],{configurable:true,enumerable:true,writable:true,initializer:null}),ce=Re(q.prototype,"isDraftCollaborative",[A],{configurable:true,enumerable:true,writable:true,initializer:null}),pe=Re(q.prototype,"toggleControlId",[M],{configurable:true,enumerable:true,writable:true,initializer:null}),de=Re(q.prototype,"initialLayout",[V],{configurable:true,enumerable:true,writable:true,initializer:null}),fe=Re(q.prototype,"showClearButton",[k],{configurable:true,enumerable:true,writable:true,initializer:null}),be=Re(q.prototype,"_applyIdToContent",[E],{configurable:true,enumerable:true,writable:true,initializer:null}),he=Re(q.prototype,"search",[H],{configurable:true,enumerable:true,writable:true,initializer:null}),ge=Re(q.prototype,"filterChanged",[R],{configurable:true,enumerable:true,writable:true,initializer:null}),me=Re(q.prototype,"stateChange",[T],{configurable:true,enumerable:true,writable:true,initializer:null}),ye=Re(q.prototype,"internalFilterChanged",[O],{configurable:true,enumerable:true,writable:true,initializer:null}),ve=Re(q.prototype,"internalSearch",[L],{configurable:true,enumerable:true,writable:true,initializer:null}),Fe=Re(q.prototype,"afterClear",[N],{configurable:true,enumerable:true,writable:true,initializer:null}),Ce=Re(q.prototype,"filterFields",[j],{configurable:true,enumerable:true,writable:true,initializer:null}),q))||U);Se=Le;return Se},false);
//# sourceMappingURL=FilterBarBuildingBlock.js.map