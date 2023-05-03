/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log","sap/fe/core/helpers/ModelHelper","sap/fe/macros/internal/valuehelp/ValueListHelper","sap/ui/core/Core"],function(e,t,n,s){"use strict";const a={contextPropertyChange:function(e,t,n){const o=s.byId(n);const l=o&&o.getBindingContext();const i=o&&o.getModel("fieldsInfo");const u=i.getProperty(`/values/${t}`)||i.getProperty(`/unitData/${t}`)||[];if(l&&(u.inputType==="InputWithValueHelp"||u.inputType==="InputWithUnit")&&!u.valueListInfo){a._setValueListInfo(l,o,i,t)}const r=i&&i.getProperty("/isOpen");if(!r||!o.getVisible()){return}a._updateSelectKey(o,t,e)},handleMDCFieldChange:function(t,n){const s=t&&t.getSource();const o=t&&t.getParameter("promise");const l=s.getContent();if(!l||!n){return}o.then(a._updateSelectKeyForMDCFieldChange.bind(a,s,n)).catch(t=>{e.warning(`VHD selection couldn't be populated in the mass edit field.${t}`)})},handleSelectionChange:function(e){const t=e&&e.getSource();const n=t.getSelectedKey();const s=t&&n&&n.split("/");let o;if(s[0]==="UseValueHelpValue"){const n=e.getParameter("previousSelectedItem");const l=n.getKey();o=s.slice(1).join("/");a._onVHSelect(t,o,l);return}const l=t&&t.getModel("fieldsInfo");o=a._getPropertyNameFromKey(n);a._updateSuggestionForFieldsWithInParameters(l,o,n.startsWith("Default/")||n.startsWith("ClearFieldValue/"),true);a._updateSuggestionForFieldsWithOutParameters(l,o,n.startsWith("Default/")||n.startsWith("ClearFieldValue/"),false);a._updateResults(t,s,true)},_updateSelectKeyForMDCFieldChange:function(e,t,n){const s=e&&e.getBindingContext();const o=e&&e.getModel("fieldsInfo");const l=o.getProperty(`/values/${t}`)||o.getProperty(`/unitData/${t}`)||[];if(s&&(l.inputType==="InputWithValueHelp"||l.inputType==="InputWithUnit")&&!l.valueListInfo){a._setValueListInfo(s,e,o,t)}a._updateSuggestionForFieldsWithOutParameters(o,t,false,true);a._updateSuggestionForFieldsWithInParameters(o,t,false,true);const i=e.getFormFormattedValue();a._updateSelectKey(e,t,n,i)},_updateSuggestionForFieldsWithInParameters:function(e,t,n,s){const o=e.getProperty("/values");const l=e.getProperty("/unitData");const i=Object.keys(o);const u=Object.keys(l);i.forEach(a._updateInParameterSuggetions.bind(a,e,"/values/",t,n,s));u.forEach(a._updateInParameterSuggetions.bind(a,e,"/unitData/",t,n,s))},_updateInParameterSuggetions:function(e,t,n,s,o,l){const i=e.getProperty(`${t+l}/valueListInfo`);if(i&&n!=l){const u=i.inParameters;if(u&&u.length>0&&u.includes(n)){a._updateFieldPathSuggestions(e,t+l,s,o)}}},_updateSuggestionForFieldsWithOutParameters:function(e,t,n,s){const o=e.getProperty(`/values/${t}/valueListInfo`)||e.getProperty(`/unitData/${t}/valueListInfo`);if(o&&o.outParameters){const l=o.outParameters;if(l.length&&l.length>0){a._updateOutParameterSuggetions(l,e,n,s);const o=e.getProperty(`/values/${t}`)&&`/values/${t}`||e.getProperty(`/unitData/${t}`)&&`/unitData/${t}`;if(o){a._updateFieldPathSuggestions(e,o,false,true)}}}},_updateOutParameterSuggetions:function(e,t,n,s){const o=t.getProperty("/values");const l=t.getProperty("/unitData");const i=Object.keys(o);const u=Object.keys(l);e.forEach(e=>{if(i.includes(e)){a._updateFieldPathSuggestions(t,`/values/${e}`,n,s)}else if(u.includes(e)){a._updateFieldPathSuggestions(t,`/unitData/${e}`,n,s)}})},_updateFieldPathSuggestions:function(e,t,n,s){const a=e.getProperty(t);const o=a.defaultOptions;const l=e.getProperty(`${t}/selectedKey`);const i=s&&a.find(e=>e.key===l);if(n){const e=a.selectOptions;a.length=0;o.forEach(e=>a.push(e));e.forEach(e=>a.push(e))}else{a.length=0;o.forEach(e=>a.push(e))}e.setProperty(t,a);if(i&&!a.includes(i)){a.push(i);e.setProperty(`${t}/selectedKey`,l)}},_setValueListInfo:function(e,t,n,s){const o=n.getProperty(`/values/${s}`)&&"/values/"||n.getProperty(`/unitData/${s}`)&&"/unitData/";if(n.getProperty(`${o}${s}/valueListInfo`)){return}const l=n.getProperty(`${o}${s}/valueListInfo`);if(!l){a._requestValueList(e,t,n,s)}},_requestValueList:function(s,o,l,i){var u;const r=t.getMetaPathForContext(s);const d=r&&`${r}/${i}`;const c=o===null||o===void 0?void 0:o.getDependents();const g=o===null||o===void 0?void 0:o.getFieldHelp();const f=c===null||c===void 0?void 0:c.find(e=>e.getId()===g);const p=(u=f.getDelegate())===null||u===void 0?void 0:u.payload;if(!(f!==null&&f!==void 0&&f.getBindingContext())){f===null||f===void 0?void 0:f.setBindingContext(s)}const y=s.getModel().getMetaModel();n.createVHUIModel(f,d,y);const P=n.getValueListInfo(f,d,p);P.then(e=>{const t=e[0];const s=l.getProperty(`/values/${i}`)&&"/values/"||l.getProperty(`/unitData/${i}`)&&"/unitData/";const o={inParameters:t.vhParameters&&n.getInParameters(t.vhParameters).map(e=>e.helpPath),outParameters:t.vhParameters&&n.getOutParameters(t.vhParameters).map(e=>e.helpPath)};l.setProperty(`${s}${i}/valueListInfo`,o);if(o.outParameters.length>0){a._updateFieldPathSuggestions(l,`/values/${i}`,false,true)}}).catch(()=>{e.warning(`Mass Edit: Couldn't load valueList info for ${d}`)})},_getValueHelp:function(e,t){const n=t===null||t===void 0?void 0:t.getDependents();const s=t===null||t===void 0?void 0:t.getFieldHelp();return n===null||n===void 0?void 0:n.find(e=>e.getId()===s)},_onVHSelect:function(e,t,n){const s=e&&e.getModel("fieldsInfo");const o=s.getProperty(`/values/${t}`)&&"/values/"||s.getProperty(`/unitData/${t}`)&&"/unitData/";const l=e.getBindingContext();const i=a._getValueHelp(l,e.getParent());if(!(i!==null&&i!==void 0&&i.getBindingContext())){i===null||i===void 0?void 0:i.setBindingContext(l)}e.fireValueHelpRequest();s.setProperty(`${o+t}/selectedKey`,n)},_getPropertyNameFromKey:function(e){let t="";if(e.startsWith("Default/")||e.startsWith("ClearFieldValue/")||e.startsWith("UseValueHelpValue/")){t=e.substring(e.indexOf("/")+1)}else{t=e.substring(0,e.lastIndexOf("/"))}return t},_updateSelectKey:function(e,t,n,s){const o=e.getContent();if(!o||!t){return}let l=o.getSelectedKey();if((l.startsWith("Default/")||l.startsWith("ClearFieldValue/"))&&!n){return}const i=a._valueExists(s)?s:n;const u=e&&e.getModel("fieldsInfo");const r=u.getProperty(`/values/${t}`)||u.getProperty(`/unitData/${t}`)||[];const d=u.getProperty(`/values/${t}`)&&"/values/"||u.getProperty(`/unitData/${t}`)&&"/unitData/";const c=r.find(e=>{var t;return(e===null||e===void 0?void 0:(t=e.textInfo)===null||t===void 0?void 0:t.value)===n||e.text===n});if(c){if(s&&c.textInfo&&c.textInfo.descriptionPath&&(c.text!=i||c.textInfo.fullText!=i)){c.text=i;c.textInfo.fullText=i;c.textInfo.description=e.getAdditionalValue()}if(c.key===l){u.setProperty(`${d+t}/selectedKey`,l);return}l=c.key}else if([undefined,null,""].indexOf(n)===-1){l=`${t}/${n}`;const s={text:i,key:l,textInfo:{description:e.getAdditionalValue(),descriptionPath:r&&r.textInfo&&r.textInfo.descriptionPath,fullText:i,textArrangement:e.getDisplay(),value:e.getValue(),valuePath:t}};r.push(s);r.selectOptions=r.selectOptions||[];r.selectOptions.push(s);u.setProperty(d+t,r)}else{l=`Default/${t}`}u.setProperty(`${d+t}/selectedKey`,l);a._updateResults(o)},_getValue:function(e){var t;return e.getMetadata().getName()==="sap.fe.core.controls.MassEditSelect"?(t=e.getSelectedItem())===null||t===void 0?void 0:t.getText():e.getValue()},_getValueOnEmpty:function(e,t,n,s){if(!n){const a=t.getProperty(`/values/${s}`)||t.getProperty(`/unitData/${s}`)||[];if(a.unitProperty){n=0;e.setValue(n)}else if(a.inputType==="CheckBox"){n=false}}return n},_valueExists:function(e){return e!=undefined&&e!=null},_updateResults:function(e){let t=arguments.length>1&&arguments[1]!==undefined?arguments[1]:[];let n=arguments.length>2?arguments[2]:undefined;const s=e&&e.getModel("fieldsInfo");const o=s&&s.getData();let l=a._getValue(e);t=t.length>0?t:e&&e.getSelectedKey()&&e.getSelectedKey().split("/");let i;const u=e.data("fieldPath");if(t[0]==="Default"){i={keyValue:t[1],value:t[0]}}else if(t[0]==="ClearFieldValue"){l="";l=a._getValueOnEmpty(e,s,l,u);i={keyValue:t[1],value:l}}else if(!t){l=a._getValueOnEmpty(e,s,l,u);i={keyValue:u,value:l}}else{const e=t.slice(0,-1).join("/");const n=s.getProperty(`/values/${e}`)||s.getProperty(`/unitData/${e}`)||[];const o=(n||[]).find(function(e){var t;return(e===null||e===void 0?void 0:(t=e.textInfo)===null||t===void 0?void 0:t.value)===l||e.text===l});i={keyValue:e,value:o.textInfo&&a._valueExists(o.textInfo.value)?o.textInfo.value:o.text}}let r=-1;for(let e=0;e<o.results.length;e++){if(o.results[e].keyValue===i.keyValue){r=e}}if(r!==-1){o.results[r]=i}else{o.results.push(i)}if(n&&!i.keyValue.includes("/")){const n=e.getBindingContext();if(t[0]==="Default"||t[0]==="ClearFieldValue"){n.setProperty(i.keyValue,null)}else if(i){n.setProperty(i.keyValue,i.value)}}}};return a},false);
//# sourceMappingURL=MassEditHandlers.js.map