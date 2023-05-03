/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log","sap/base/util/merge","sap/fe/core/CommonUtils","sap/fe/macros/chart/ChartUtils","sap/fe/macros/CommonHelper","sap/fe/macros/filter/FilterUtils","sap/fe/macros/ODataMetaModelUtil","sap/ui/mdc/library","sap/ui/mdc/odata/v4/util/DelegateUtil","sap/ui/mdc/odata/v4/vizChart/ChartDelegate","sap/ui/model/Filter","sap/ui/model/FilterOperator"],function(e,t,a,r,n,o,s,i,l,c,g,f){"use strict";const p=i.ChartItemRoleType;const u=Object.assign({},c);u._setChartNoDataText=function(t,n){let o="";const s=r.getAllFilterInfo(t),i=n.path.startsWith("/")?n.path.substr(1):n.path;const l=function(){if(t.data("multiViews")){return"M_TABLE_AND_CHART_NO_DATA_TEXT_MULTI_VIEW"}else{return"T_TABLE_AND_CHART_NO_DATA_TEXT_WITH_FILTER"}};if(t.getFilter()){if(s.search||s.filters&&s.filters.length){o=l()}else{o="T_TABLE_AND_CHART_NO_DATA_TEXT"}}else if(s.search||s.filters&&s.filters.length){o=l()}else{o="M_TABLE_AND_CHART_NO_FILTERS_NO_DATA_TEXT"}return t.getModel("sap.fe.i18n").getResourceBundle().then(function(e){t.setNoDataText(a.getTranslatedText(o,e,undefined,i))}).catch(function(t){e.error(t)})};u._handleProperty=function(t,a,r,o,i,l){const c=n.parseCustomData(t.data("applySupported"));const g=s.getSortRestrictionsInfo(a);const f=a["@Org.OData.Capabilities.V1.FilterRestrictions"];const d=s.getFilterRestrictionsInfo(f);const h=this.getModel().getObject(this.getPath());const m=this.getModel().getObject(`${this.getPath()}@sapui.name`);const b=this.getModel();if(h&&h.$kind==="Property"){if(h.$isCollection){return}const a=b.getObject(`${this.getPath()}@`);const n=b.getObject("@sapui.name",b.getMetaContext(this.getPath()));const f=c&&c.GroupableProperties;const _=c&&c.AggregatableProperties;let C=false,y=false;if(f&&f.length){for(let e=0;e<f.length;e++){if(f[e].$PropertyPath===n){C=true;break}}}if(_&&_.length){for(let e=0;e<_.length;e++){if(_[e].Property.$PropertyPath===n){y=true;break}}}if(!f||f&&!f.length){C=a["@Org.OData.Aggregation.V1.Groupable"]}if(!_||_&&!_.length){y=a["@Org.OData.Aggregation.V1.Aggregatable"]}if(!C&&!y){return}if(y){const e=u._createPropertyInfosForAggregatable(t,m,a,d,g,r,o);e.forEach(function(e){i.push(e)})}if(C){const r=m||"",n=a["@com.sap.vocabularies.Common.v1.Text"]?a["@com.sap.vocabularies.Common.v1.Text"].$Path:null;let o=false;if(r&&r.indexOf("/")>-1){e.error(`$expand is not yet supported. Property: ${r} from an association cannot be used`);return}if(n&&n.indexOf("/")>-1){e.error(`$expand is not yet supported. Text Property: ${n} from an association cannot be used`);o=true}i.push({name:"_fe_groupable_"+m,propertyPath:m,label:a["@com.sap.vocabularies.Common.v1.Label"]||m,sortable:u._getSortable(t,g.propertyInfo[m],false),filterable:d[m]?d[m].filterable:true,groupable:true,aggregatable:false,maxConditions:s.isMultiValueFilterExpression(d.propertyInfo[m])?-1:1,sortKey:m,role:p.category,criticality:l,textProperty:!o&&a["@com.sap.vocabularies.Common.v1.Text"]?a["@com.sap.vocabularies.Common.v1.Text"].$Path:null,textFormatter:a["@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement"]})}}};u.formatText=function(e,t){const a=this.textFormatter;if(a.$EnumMember==="com.sap.vocabularies.UI.v1.TextArrangementType/TextFirst"){return`${t} (${e})`}else if(a.$EnumMember==="com.sap.vocabularies.UI.v1.TextArrangementType/TextLast"){return`${e} (${t})`}else if(a.$EnumMember==="com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly"){return t}return t?t:e};u.updateBindingInfo=function(e,t){u._setChartNoDataText(e,t);const s=sap.ui.getCore().byId(e.getFilter());if(s){const i=s.getConditions();if(i){if(!t){t={}}t.sorter=this.getSorters(e);const a=e.getControlDelegate().getInnerChart(e);let n;if(a){if(r.getChartSelectionsExist(e)){n=r.getAllFilterInfo(e)}}n=n?n:r.getFilterBarFilterInfo(e);if(n){t.filters=n.filters}const o=l.getParametersInfo(s,i);if(o){t.path=o}}const c=o.getFilterInfo(s,{});const g=n.parseCustomData(e.data("applySupported"));if(g&&g.enableSearch&&c.search){t.parameters.$search=a.normalizeSearchTerm(c.search)}else if(t.parameters.$search){delete t.parameters.$search}}else{if(!t){t={}}t.sorter=this.getSorters(e)}u._checkAndAddDraftFilter(e,t)};u.fetchProperties=function(e){const t=this._getModel(e);let a;if(!t){a=new Promise(t=>{e.attachModelContextChange({resolver:t},d,this)}).then(t=>this._createPropertyInfos(e,t))}else{a=this._createPropertyInfos(e,t)}return a.then(function(t){if(e.data){e.data("$mdcChartPropertyInfo",t)}return t})};function d(e,t){const a=e.getSource();const r=this._getModel(a);if(r){a.detachModelContextChange(d);t.resolver(r)}}u._createPropertyInfos=async function(t,a){const r=`/${t.data("entitySet")}`;const o=a.getMetaModel();const i=await Promise.all([o.requestObject(`${r}/`),o.requestObject(`${r}@`)]);const l=[];const c=i[0],g=i[1];const f=n.parseCustomData(t.data("customAgg"));let p;const d=[];for(const e in g){if(e.startsWith("@Org.OData.Aggregation.V1.CustomAggregate")){p=e.replace("@Org.OData.Aggregation.V1.CustomAggregate#","");const t=p.split("@");if(t.length==2&&t[1]=="com.sap.vocabularies.Common.v1.Label"){f[t[0]]=g[e]}}}const h=[],m=[];if(Object.keys(f).length>=1){const a=t.getItems();for(const e in a){if(a[e].isA("sap.ui.mdc.chart.DimensionItem")){h.push(a[e].getKey())}else if(a[e].isA("sap.ui.mdc.chart.MeasureItem")){m.push(a[e].getKey())}}if(m.filter(function(e){return h.indexOf(e)!=-1}).length>=1){e.error("Dimension and Measure has the sameProperty Configured")}}const b=n.parseCustomData(t.data("transAgg"));const _={};for(const e in b){const t=b[e].propertyPath;_[t]=_[t]||{};_[t][b[e].aggregationMethod]={name:b[e].name,label:b[e].label}}for(const e in c){if(e.indexOf("$")!==0){d.push(s.fetchCriticality(o,o.createBindingContext(`${r}/${e}`)).then(u._handleProperty.bind(o.getMetaContext(`${r}/${e}`),t,g,_,f,l)))}}await Promise.all(d);return l};u._createPropertyInfosForAggregatable=function(e,a,r,n,o,i,l){const c=[];if(Object.keys(i).indexOf(a)>-1){for(const e in i[a]){c.push({name:"_fe_aggregatable_"+i[a][e].name,propertyPath:a,label:i[a][e].label||`${r["@com.sap.vocabularies.Common.v1.Label"]} (${e})`||`${a} (${e})`,sortable:o.propertyInfo[a]?o.propertyInfo[a].sortable:true,filterable:n[a]?n[a].filterable:true,groupable:false,aggregatable:true,aggregationMethod:e,maxConditions:s.isMultiValueFilterExpression(n.propertyInfo[a])?-1:1,role:p.axis1,datapoint:null})}}if(Object.keys(l).indexOf(a)>-1){for(const e in l){if(e===a){const a=t({},l[e],{name:"_fe_aggregatable_"+e,groupable:false,aggregatable:true,role:p.axis1,datapoint:null});c.push(a);break}}}return c};u.rebind=function(e,t){const a=t.parameters.$search;if(a){delete t.parameters.$search}c.rebind(e,t);if(a){const t=e.getControlDelegate().getInnerChart(e),r=t&&t.getBinding("data");r.suspend();r.setAggregation({search:a});const n={onBeforeRendering:function(){r.resume();t.removeEventDelegate(n)}};t.addEventDelegate(n)}e.fireEvent("bindingUpdated")};u._setChart=function(e,t){const a=e.getParent();t.setVizProperties(e.data("vizProperties"));t.detachSelectData(a.handleSelectionChange.bind(a));t.detachDeselectData(a.handleSelectionChange.bind(a));t.detachDrilledUp(a.handleSelectionChange.bind(a));t.attachSelectData(a.handleSelectionChange.bind(a));t.attachDeselectData(a.handleSelectionChange.bind(a));t.attachDrilledUp(a.handleSelectionChange.bind(a));t.setSelectionMode(e.getPayload().selectionMode.toUpperCase());c._setChart(e,t)};u._getBindingInfo=function(e){if(this._getBindingInfoFromState(e)){return this._getBindingInfoFromState(e)}const a=e.getDelegate().payload;const r=e.getModel()&&e.getModel().getMetaModel();const n=e.data("targetCollectionPath");const o=(r.getObject(`${n}/$kind`)!=="NavigationProperty"?"/":"")+a.contextPath;const s=t({},a.parameters,{entitySet:e.data("entitySet")});return{path:o,events:{dataRequested:e.getParent().onInternalDataRequested.bind(e.getParent())},parameters:s}};u.removeItemFromInnerChart=function(e,t){c.removeItemFromInnerChart.call(this,e,t);if(t.getType()==="groupable"){const t=this._getChart(e);t.fireDeselectData()}};u._getSortable=function(e,t,a){if(a){if(e.data("draftSupported")==="true"){return false}else{return t?t.sortable:true}}return t?t.sortable:true};u._checkAndAddDraftFilter=function(e,t){if(e.data("draftSupported")==="true"){if(!t){t={}}if(!t.filters){t.filters=[]}t.filters.push(new g("IsActiveEntity",f.EQ,true))}};u.getInternalChartNameFromPropertyNameAndKind=function(e,t){return e.replace("_fe_"+t+"_","")};u.getPropertyFromNameAndKind=function(e,t,a){return a.getPropertyHelper().getProperty("_fe_"+t+"_"+e)};return u},false);
//# sourceMappingURL=ChartDelegate.js.map