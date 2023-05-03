sap.ui.define(["sap/rules/ui/parser/resources/vocabulary/lib/validationUtils","sap/rules/ui/parser/resources/common/lib/oDataHandler","sap/rules/ui/parser/infrastructure/util/utilsBase"],function(a,E,e){"use strict";var _=new e.utilsBaseLib;var t=E.getOdataPropName;var P=E.getOdataPropertyValue;var R=E.getEnumPropertyValue;var r=false;function i(a,e,R,r){var i,T,n,A;var u=P(a,E.PROPERTY_NAME_ID);if(P(a,E.PROPERTY_NAME_TYPE)===E.TYPE_CONDITION){i={colID:u,type:"condition",expression:"",alias:""};n=t(a,E.PROPERTY_NAME_CONDITION);r=_.buildJsonPath(r,n);i.inputModelPath=r;i.expression=P(a[n],E.PROPERTY_NAME_EXPRESSION);if(i.expression==="true"){i.expression=""}A=P(a[n],E.PROPERTY_NAME_FIXED_OPERATOR);if(A!==undefined){i.fixedOperator={};i.fixedOperator.operator=A;e[u]=A+" "}}else if(P(a,E.PROPERTY_NAME_TYPE)===E.TYPE_RESULT){i={colID:u,name:"",type:"output",businessDataType:""};T=t(a,E.PROPERTY_NAME_RESULT);i.businessDataType=P(a[T],E.PROPERTY_NAME_BUSINESS_DATA_TYPE);i.name=P(a[T],E.PROPERTY_NAME_DO_ATTRIBUTE_NAME)}R[u]=i.type;return i}function T(a,e,R){var r,i,T,n,A,u,s=true;var O={rowID:0,row:[]};O.rowID=P(a,E.PROPERTY_NAME_ID);u=t(a,E.PROPERTY_NAME_CELLS);i=P(a,E.PROPERTY_NAME_CELLS);if(i){i.forEach(function(a,t){r=_.buildJsonPath(R,u,t);T={colID:0,content:""};T.colID=P(a,E.PROPERTY_NAME_COLUMN_ID);A=P(a,E.PROPERTY_NAME_CONTENT);n=e[T.colID];if(s&&A){s=false}T.inputModelPath=r;T.content=n==="output"&&!A?null:A;if(!(n==="condition"&&!A)){O.row.push(T)}})}if(s){return null}return O}function n(a,e){var _;var R=null;var r=null;var i=null;for(_=0;_<a.length;_++){i=a[_];R=t(i,E.PROPERTY_NAME_USAGE);if(R&&i[R]===E.TYPE_DO){R=t(i,E.PROPERTY_NAME_ID);if(R&&i[R]===e){r=P(i,E.PROPERTY_NAME_NAME);break}}}return r}function A(a,e){var _={};_.source=P(a,E.PROPERTY_NAME_ATTRIBUTE_MAPPINGS_SOURCE);_.target=P(a,E.PROPERTY_NAME_ATTRIBUTE_MAPPINGS_TARGET);e.push(_)}function u(a,e,_,R,i,T){var n=null;var A=null;var u=null;var s={};s.name=P(a,E.PROPERTY_NAME_NAME);if(r){s.description=P(a,E.PROPERTY_NAME_DESCRIPTION);R.validateDescription(s,E.PROPERTY_NAME_ATTRIBUTE,_)}n=t(a,E.PROPERTY_NAME_MAPPING_INFO);if(n){s.dataMapping={};var O=t(a[n],E.PROPERTY_NAME_DATA_TYPE);if(O){s.dataType=P(a[n],E.PROPERTY_NAME_DATA_TYPE);s.dataMapping.column=P(a[n],"column");A=t(a[n],E.PROPERTY_NAME_SIZE);if(A){s.size=P(a[n],E.PROPERTY_NAME_SIZE)}}else{s.dataMapping.column=P(a[n],E.PROPERTY_NAME_NAME);s.dataType=P(a,E.PROPERTY_NAME_DATA_TYPE);A=t(a,E.PROPERTY_NAME_SIZE);if(A){s.size=a[A]}}}else{s.dataType=P(a,E.PROPERTY_NAME_DATA_TYPE);A=t(a,E.PROPERTY_NAME_SIZE);if(A){s.size=a[A]}}u=P(a,E.PROPERTY_NAME_BUSINESS_DATA_TYPE);n=t(a,E.PROPERTY_NAME_VALUE_HELP_ID);if(n&&a[n]){R.validateValueHelpBusinessDataType(a[n],u);s.valueList=a[n]}else{s.businessDataType=u}if(i&&a.hasOwnProperty(E.CP_HAS_VALUE_SOURCE)&&a[E.CP_HAS_VALUE_SOURCE]===true){s.valueList=T+"_"+a[E.CP_DATOBJECT_ID]+"_"+a[E.PROPERTY_NAME_ID];R.validateValueHelpBusinessDataType(s.valueList,u)}s.sourceType=E.SOURCE_TYPE_DATA;e.push(s)}function s(a,e,_,i,T){var u=null;var s={};s.name=P(e,E.PROPERTY_NAME_NAME);if(r){s.description=P(e,E.PROPERTY_NAME_DESCRIPTION);T.validateDescription(s,E.PROPERTY_NAME_ASSOCIATION,i)}u=t(e,E.PROPERTY_NAME_TARGET_DATA_OBJECT_ID);s.target=n(a,e[u]);s.cardinality=R(e,E.PROPERTY_NAME_CARDINALITY);s.attributeMappings=[];u=t(e,E.PROPERTY_NAME_ATTRIBUTE_MAPPINGS);if(u&&e[u]&&Array.isArray(e[u])){e[u].forEach(function(a){A(a,s.attributeMappings)})}_.push(s)}function O(a,e){var _={};var R;_.name=P(a,E.PROPERTY_NAME_NAME);_.description=P(a,E.PROPERTY_NAME_DESCRIPTION);_.businessDataType=P(a,E.PROPERTY_NAME_BUSINESS_DATA_TYPE);var r=t(a,E.PROPERTY_NAME_MAPPING_INFO);if(r){_.dataMapping={};var i=t(a[r],E.PROPERTY_NAME_DATA_TYPE);if(i){_.dataType=P(a[r],E.PROPERTY_NAME_DATA_TYPE);R=t(a[r],E.PROPERTY_NAME_SIZE);if(R){_.size=P(a[r],E.PROPERTY_NAME_SIZE)}}}else{_.dataType=P(a,E.PROPERTY_NAME_DATA_TYPE);_.size=P(a,E.PROPERTY_NAME_SIZE)}_.id=a.Id;e.push(_)}function o(a,e){var _=null;e.name=P(a,E.PROPERTY_NAME_NAME);e.type=P(a,E.PROPERTY_NAME_TYPE);_=t(a,E.PROPERTY_NAME_SCHEMA);e.schema="";if(a[_]){e.schema=a[_]}_=t(a,E.PROPERTY_NAME_PARAMETERS);if(a[_]){e.parameters=a[_]}}function N(a,e,_){var t={};var R=P(a,E.PROPERTY_NAME_ID);var r=_.getValueHelpBusinessDataType(R);if(!r){return}t.businessDataType=r;t.metadata={};t.metadata.serviceURL=P(a,E.PROPERTY_NAME_SERVICE_URL);t.metadata.propertyPath=P(a,E.PROPERTY_NAME_PROPERTY_PATH);t.metadata.type=P(a,E.PROPERTY_NAME_TYPE);e.valueLists[R]=t}function l(a,e,_){var t={};var R=P(a,E.CP_VOCABULARY_ID);var r=P(a,E.CP_DATOBJECT_ID);var i=P(a,E.CP_ATTRIBUTE_ID);var T=R+"_"+r+"_"+i;var n=_.getValueHelpBusinessDataType(T);t.businessDataType=n;t.metadata={};t.metadata.vocabularyId=R;t.metadata.attributeId=i;t.metadata.dataObjectId=r;t.metadata[E.CP_HAS_VALUE_SOURCE]=true;var A=P(a,E.CP_VALUE_SOURCE_TYPE);if(A===E.CP_VALUE_SOURCE_TYPE_STATIC){t.metadata.serviceURL="/Enumerations";t.metadata.entitySet="Enumerations"}else{t.metadata.serviceURL="/ExternalValues";t.metadata.entitySet="ExternalValues"}e.valueLists[T]=t}function M(a,e,t,R){var i={};var T=null;i.name=P(a,E.PROPERTY_NAME_NAME);i.id=P(a,E.PROPERTY_NAME_ID);i.isVocaRule=true;if(r){i.description=P(a,E.PROPERTY_NAME_DESCRIPTION);if(!R.isVocaRuleUnique(i)){R.deleteNonUniqueVocaRule(i,e.dataObjects);return}R.validateDescription(i,E.PROPERTY_NAME_VOCABULARY_RULE,t)}i.resultDataObjectId=P(a,E.PROPERTY_NAME_RESULTDOID);T=_.findObjectById(i.resultDataObjectId,e.outputs);if(!T){T=_.findObjectById(i.resultDataObjectId,e.vocaRulesOutputs)}i.attributes=T.inputParams;e.dataObjects.push(i)}function Y(a,e,_,R,i,T,n){var A=null;var N={};var l=null;A=t(e,E.PROPERTY_NAME_USAGE);if(A){N.name=P(e,E.PROPERTY_NAME_NAME);l=P(e,E.PROPERTY_NAME_TYPE);if(l){N.type=l}if(e[A]===E.TYPE_DO){if(r){N.description=P(e,E.PROPERTY_NAME_DESCRIPTION);i.validateDescription(N,E.PROPERTY_NAME_DATA_OBJECT,R)}A=t(e,E.PROPERTY_NAME_ATTRIBUTES);if(A){N.attributes=[];var M=e[A];M.forEach(function(a){if(T){u(a,N.attributes,N.name,i,T,n)}else{u(a,N.attributes,N.name,i)}})}A=t(e,E.PROPERTY_NAME_ASSOCIATIONS);if(A){var Y=e[A];N.associations=[];Y.forEach(function(E){s(a,E,N.associations,N.name,i)})}A=t(e,E.PROPERTY_NAME_MAPPING_INFO);if(A){var f=e[A];N.mappingInfo={};o(f,N.mappingInfo)}_.dataObjects.push(N)}else if(e[A]===E.TYPE_RESULT||e[A]===E.TYPE_NONE){var c=e[A];N.id=P(e,E.PROPERTY_NAME_ID);var p=P(e,E.PROPERTY_NAME_DESCRIPTION);if(p){N.description=p}A=t(e,E.PROPERTY_NAME_ATTRIBUTES);if(A){N.inputParams=[];var I=e[A];I.forEach(function(a){O(a,N.inputParams)})}if(c===E.TYPE_RESULT){_.outputs.push(N)}else{_.vocaRulesOutputs.push(N)}}}}var f=function(a,e){var r={id:"",output:"",name:"",ruleBody:{content:{headers:[],rows:[]},type:"",hitPolicy:"",ruleFormat:""}};var n=t(a,E.PROPERTY_NAME_DECISION_TABLE);var A=_.buildJsonPath(e,n);var u={};var s={};r.id=P(a,E.PROPERTY_NAME_ID);r.name=P(a,E.PROPERTY_NAME_NAME);r.ruleBody.ruleFormat=R(a,E.PROPERTY_NAME_RULE_FORMAT);r.output=P(a,E.PROPERTY_NAME_RESULT_DO_NAME);r.ruleBody.type=R(a,E.PROPERTY_NAME_TYPE);r.ruleBody.relVersion=P(a,E.PROPERTY_NAME_REL_VERSION);r.ruleBody.hitPolicy=R(a[n],E.PROPERTY_NAME_HIT_POLICY);var O=P(a[n],E.PROPERTY_NAME_DT_COLUMNS);var o=t(a[n],E.PROPERTY_NAME_DT_COLUMNS);var N=P(a[n],E.PROPERTY_NAME_DDT_ROWS);var l=t(a[n],E.PROPERTY_NAME_DDT_ROWS);if(O){var M;O.forEach(function(a,E){e=_.buildJsonPath(A,o,E);M=i(a,u,s,e);r.ruleBody.content.headers.push(M)})}if(N){var Y;N.forEach(function(a,E){e=_.buildJsonPath(A,l,E);Y=T(a,s,e);if(Y){r.ruleBody.content.rows.push(Y)}})}return r};var c=function(e,_){var P;var R=false;var i=new a.validationUtilsLib;var T=null;var n={dataObjects:[],outputs:[],vocaRulesOutputs:[],valueLists:{}};for(P=0;P<_.length;P++){if(_[P]==="byDescription"){r=true;break}}T=t(e,E.CP_VALUE_SOURCE);if(T){R=true}T=t(e,E.PROPERTY_NAME_DATA_OBJECTS);if(T){e[T].forEach(function(a){if(R){Y(e[T],a,n,e.id,i,R,a.VocabularyId)}else{Y(e[T],a,n,e.id,i)}})}T=t(e,E.PROPERTY_NAME_VALUE_HELPS);if(T&&Array.isArray(e[T])){e[T].forEach(function(a){N(a,n,i)})}if(R){T=t(e,E.CP_VALUE_SOURCE);if(T&&Array.isArray(e[T])){e[T].forEach(function(a){l(a,n,i)})}}T=t(e,E.PROPERTY_NAME_VOCABULARY_RULES);if(T){e[T].forEach(function(a){M(a,n,e.id,i)})}return n};return{convertRuleODataToInternalModel:f,convertVocabularyODataToInternalModel:c}},true);
//# sourceMappingURL=resourcesConvertor.js.map