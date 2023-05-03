sap.ui.define(["sap/ovp/cards/MetadataAnalyser","sap/ovp/cards/CommonUtils","sap/fe/navigation/SelectionVariant","sap/ovp/cards/AnnotationHelper","sap/ovp/cards/Integration/Helpers/i18n"],function(e,t,a,r,n){"use strict";var i={};function o(e){if(e){if(e.hasOwnProperty("SelectionVariantID")){delete e.SelectionVariantID}else if(e.hasOwnProperty("PresentationVariantID")){delete e.PresentationVariantID}delete e.Text;delete e.ODataFilterExpression;delete e.Version;delete e.FilterContextUrl;delete e.ParameterContextUrl;return e}return e}function l(e,t,a){var r;e.forEach(function(e){r=e&&e.Ranges;t.massAddSelectOption(a,r)})}function s(e){var r,n,i;var s=0;for(var u in e){var f=new a;if(e.hasOwnProperty(u)&&e[u]){r=e[u].value;if(r&&typeof r==="string"&&t.isJSONData(r)){r=JSON.parse(r);if(typeof r!=="object"){e[u].value=r.toString();continue}n=r.SelectOptions&&r.SelectOptions[0];if(n&&n.Ranges&&n.Ranges.length===1){i=n.Ranges[0]||{};if(i.Option==="EQ"&&!i.Low){n.Ranges=[];e[u].value=JSON.stringify(r)}}}else if(r&&Array.isArray(r)){var c,g;for(s=0;s<r.length;s++){c=JSON.parse(r[s]);g=c&&c.SelectOptions||[];l(g,f,u)}f=o(f&&f.toJSONObject());e[u].value=JSON.stringify(f)}}}}function u(e,t){var a,r="";t&&t.getAllFiltersWithValues().filter(function(n){a=n.getName();if(a.includes(e)||a===e){r=t&&t.getFilterData()&&t.getFilterData()[a]||""}});return r}function f(t,a,n,i){var o=t.getMetaModel().getODataEntityType(a.entityType)||{};var l=i.view.getModel("ovpCardProperties");var s=o[l.getProperty("/selectionAnnotationPath")]||{};var u=l.getProperty("/parameters")||[];var f=i.cardComponentData.mainComponent.oGlobalFilter;var c=[];var g=e.checkAnalyticalParameterisedEntitySet(t,a.name);if(g){c=r.resolveAnalyticalParameterizedEntitySet(t,a,s,u,f,true)||[]}else{var p=e.getParametersByEntitySet(t,a.name);if(p&&p.entitySetName){c=e.getPropertyOfEntitySet(t,p.entitySetName)||[]}}return c.filter(function(e){return e&&e.name===n})}function c(e,t,a,r){if(a){var n=f(e,t,a,r)||[],i=n[0]||{},o=i["com.sap.vocabularies.Common.v1.FilterDefaultValue"]||{},l=Object.keys(o)||[];return o[l[0]]||i.defaultValue}}function g(e,t){var a=t&&t.getFilterData();return a&&(a["$Parameter."+e]||a[e])||""}function p(e,t,a){if(e){var r=t&&t.property&&t.property.filter(function(t){return t&&t.name===e})||[];if(!r.length){r=a&&a.property&&a.property.filter(function(t){return t&&t.name===e})}}var n=r&&r.length?r[0]:{};var i=n&&n["com.sap.vocabularies.Common.v1.FilterDefaultValue"]||{};var o=Object.keys(i);return n&&(o&&o.length&&i[o[0]]||n.defaultValue)}function v(e){var a;var r=[];if(e&&Array.isArray(e)){e.forEach(function(e){if(e){a=o(JSON.parse(e));r.push(JSON.stringify(a))}});return r}else if(e&&t.isJSONData(e)){a=o(JSON.parse(e));return JSON.stringify(a)}}function d(e){var t="";if(!e){return null}if(e.type){t=e.type.startsWith("Edm.")?e.type.split("Edm.")[1]:e.type}var a={Boolean:"boolean",Byte:"integer",SByte:"integer",Int16:"integer",Int32:"integer",Int64:"number",Single:"number",Double:"number",Float:"number",Decimal:"number",Guid:"string",String:"string",Date:"date",DateTime:"datetime",DateTimeOffset:"datetime",Time:"datetime",Binary:"",Stream:"",TimeOfDay:"",Duration:""};if(t&&t==="string"){return t}else if(t&&a[t]){return a[t]}else{return"string"}}function m(e){var t=[];var a=e&&e.RequestAtLeast||undefined;if(a){for(var r=0;r<a.length;r++){if(a[r].PropertyPath){t.push(a[r].PropertyPath)}}}return t}function S(e,t,a,r){var n="";if(Array.isArray(t)){t.filter(function(t){if(t&&t.includes(e.Low)){n=t}})}else if(typeof t==="string"){n=t}if(!n&&e.Low&&e.High){var i=a&&a.getFilterData()||{},o=i[r]||{};if(o.ranges){var l=o.ranges||[];var s=l.filter(function(t){return t.value1===e.Low});var u=s[0]||{};n=u.tokenText||""}}return n}function y(e,t,a,r){var n=e&&e.getUiState(),i=n&&n.getSelectionVariant(),o=i&&i.SelectOptions||[],l=false;o.filter(function(e){return e&&e["PropertyName"]===t}).map(function(n){l=true;var i=n&&n.Ranges||[];i.forEach(function(n){var i=S(n,r,e,t);a.addSelectOption(t,n.Sign,n.Option,n.Low,n.High,i)})});if(!l){a.addSelectOption(t,"I","EQ","")}}function O(e,t){var a;var r=/'/g;switch(e.Option){case"BT":a=t+" ge "+"'"+e.Low.replace(r,"''")+"'"+" and "+t+" le "+"'"+e.High.replace(r,"''")+"'";break;case"NB":a=t+" lt "+"'"+e.Low.replace(r,"''")+"'"+" or "+t+" gt "+"'"+e.High.replace(r,"''")+"'";break;case"EQ":case"GE":case"GT":case"LE":case"LT":case"NE":a=t+" "+e.Option.toLowerCase()+" "+"'"+e.Low.replace(r,"''")+"'";break;case"Contains":case"EndsWith":case"NotContains":case"NotEndsWith":case"NotStartsWith":case"StartsWith":a=e.Option.toLowerCase().replace("not","not ")+"("+t+","+"'"+e.Low.replace(r,"''")+"'"+")";break;default:throw new Error("Unsupported operator: "+e.Option)}return a}function T(e){var t=e&&e.cardComponentData,a=t&&t.appComponent,r=a&&a.ovpConfig,n=r&&r.datePropertiesSettings;if(n){return n}}function E(e,a){var r=T(e);var n=a&&a.name;var i=r&&Object.keys(r);if(i&&i.length&&n){return i&&i.indexOf(n)>-1}else if(t.isDate(a)){var o=e.cardComponentData.appComponent.getManifestObject().getRawJson();var l=o&&o["sap.ovp"];return l&&l.useDateRangeType}}function D(e){var t=T(e);var a=t&&Object.keys(t);if(a&&a.length){a.forEach(function(e){if(i[e]){var a=t[e]&&Object.keys(t[e])||[];a.forEach(function(a){if(a&&a!=="defaultValue"&&a!=="customDateRangeImplementation"){i[e][a]=t[e][a]}})}})}return i}function h(e,t){if(t){i[e.name]={"sap:filter-restriction":"single-value"}}else{i[e.name]={"sap:filter-restriction":e["sap:filter-restriction"]}}}function b(e){var t=Object.keys(i)||[];if(t.length&&e){return t.some(function(t){return e&&e.indexOf(t)>-1})}}function P(e,t){var a=T(e);if(a&&a[t]&&a[t]["defaultValue"]){return a[t]["defaultValue"]["operation"]}else{var r=e.cardComponentData.appComponent.getManifestObject().getRawJson();var n=r&&r["sap.ovp"];var i=n.filterSettings&&n.filterSettings.dateSettings&&n.filterSettings.dateSettings.fields;return i&&i[t]&&i[t]["defaultValue"]&&i[t]["defaultValue"]["operation"]}}function A(e,t){var a=e&&e.getUiState(),r=a&&a.getSelectionVariant(),n=r&&r.SelectOptions||[];var i=n.filter(function(e){return e&&e["PropertyName"]===t});i=i&&i[0]||[];var o=i.Ranges||[];return o&&o[0]}function R(e){var t=["DATE","DATETIME"];return t.indexOf(e)>-1}function V(e){if(e){var t=e.conditionTypeInfo,a=t&&t.data;if(R(a.operation)&&a.value1){return JSON.stringify(a.value1)}return a.operation}}function N(e,t,a){var r=g(e.name,t);var n=r&&r.conditionTypeInfo;var i=n&&n.data&&n.data["operation"];var o=r&&r["ranges"];var l=o&&o[0];if(i){switch(i){case"DATE":case"DATERANGE":case"SPECIFICMONTH":case"FROM":case"TO":case"DATETIME":case"DATETIMERANGE":case"FROMDATETIME":case"TODATETIME":var s=S({Low:l.Low},a,t,e.name);var u=A(t,e.name);if(u){u.Text=s;return u}break;case"LASTDAYS":case"LASTWEEKS":case"LASTMONTHS":case"LASTQUARTERS":case"LASTYEARS":case"NEXTDAYS":case"NEXTWEEKS":case"NEXTMONTHS":case"NEXTQUARTERS":case"NEXTYEARS":var f=n&&n.data&&n.data.value1;var s=S({Low:f},a,t,e.name);return{Low:i,High:f.toString(),Option:"BT",Text:s};case"TODAYFROMTO":var c=n&&n.data&&n.data.value1;var p=n&&n.data&&n.data.value2;var s=S({Low:c},a,t,e.name);return{Low:i,High:c.toString()+","+p.toString(),Option:"BT",Text:s};default:var s=S({Low:i},a,t,e.name)||"";s=s.substring(0,s.indexOf("(")-1);return{Low:i,High:null,Option:"EQ",Text:s}}}}function w(e,t){var a=t&&t.getAllFilterItems();var r=a.filter(function(t){var a=t&&t.getProperty("name");return a==="$Parameter."+e||a===e});var n=r[0]&&r[0].getControl();var i=n&&n.getValue();if(i){return JSON.stringify(i)}}function C(e,t,a,r,n){var i=e.view.getModel("ovpCardProperties"),o=i&&i.getProperty("/bInsightRTEnabled"),l=e.cardComponentData.mainComponent.oGlobalFilter,s=P(e,t.name)||a;if(o){var u=N(t,l,n);if(u){r.addSelectOption(t.name,"I",u.Option,u.Low,u.High,u.Text)}}else if(s){r.addSelectOption(t.name,"I","EQ",s,null,s)}}function L(e,t){if(t&&e){var a=t.getFiltersWithValues()||[],r="",n=a.filter(function(t){r=t&&t.getName();return r===e||"$Parameter."+e===r});var i=n&&n[0]&&n[0].getControl();if(i&&i.getMetadata()&&i.getMetadata().getName()==="sap.m.DynamicDateRange"){var o=i.getIdForLabel()||"";o=o.substring(0,o.lastIndexOf("-"));if(o){var l=sap.ui.getCore().byId(o);return l&&l.getValue()}}else if(i&&i.getProperty("value")){return i.getProperty("value")}else if(i&&typeof i.getTokens==="function"){var s=i.getTokens()||[],u=s.map(function(e){return e.getText()});return{type:"filters",value:u}}}}function I(e,t,a,r,i,o){var l=L(e,t);var s=r.view.getModel("ovpCardProperties");var u=s&&s.getProperty("/bInsightRTEnabled");if(l&&typeof l==="string"&&(u||i)){if(!a[e]){a[e]={}}a[e]["label"]=l;if(i&&!u){var f="configuration.parameters."+e+".label",c=r.cardComponentData.cardId,g=c+"_configuration_parameters_"+e+"_label";n.seti18nValueToMap(f,"{{"+g+"}}",true);l=o?i:l;n.inserti18nPayLoad(c,g,l,"Label","Configuration Parameter label")}return l}else if(l&&l.value&&l.type==="filters"){return l.value}}return{enhanceVariant:v,updateRangeValue:s,getPropertyType:d,getParameterValue:u,getRequestAtLeastFields:m,getFilterDefaultValue:p,getParameterDefaultValue:c,addFiltervalues:y,getParameterActualValue:g,removeExtraInfoVariant:o,getSingleFilterValue:O,getSemanticDateConfiguration:D,IsSemanticDateRangeValid:E,getDateRangeValueForParameters:V,getDateRangeControlValue:w,getDateOperationValue:R,getLabelForConfigParams:I,getRelatedTextToRange:S,setFilterRestrictionToSemanticDateRange:h,addDateRangeValueToSV:C,getDateRangeDefaultValue:P,IsSemanticDateExistsInUrl:b}});
//# sourceMappingURL=Filters.js.map