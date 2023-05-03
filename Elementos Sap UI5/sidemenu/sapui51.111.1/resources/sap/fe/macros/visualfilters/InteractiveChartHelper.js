/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/util/JSTokenizer","sap/fe/core/CommonUtils","sap/fe/core/controls/filterbar/utils/VisualFilterUtils","sap/fe/core/helpers/StableIdHelper","sap/fe/core/templating/CriticalityFormatters","sap/fe/core/templating/FilterHelper","sap/fe/core/type/TypeUtil","sap/fe/macros/CommonHelper","sap/fe/macros/filter/FilterFieldHelper","sap/fe/macros/ResourceModel","sap/ui/core/format/NumberFormat","sap/ui/mdc/condition/ConditionConverter","sap/ui/model/odata/v4/AnnotationHelper","sap/ui/model/odata/v4/ODataUtils"],function(e,t,a,n,r,i,o,s,l,c,u,g,f,p){"use strict";var h=i.getFiltersConditionsFromSelectionVariant;var m=r.buildExpressionForCriticalityColorMicroChart;var d=n.generate;const y={getChartDisplayedValue:function(e,t,a){const n=d([a]);return"{parts:[{path:'"+e+"',type:'sap.ui.model.odata.type.Decimal', constraints:{'nullable':false}}"+(t&&t.ScaleFactor?",{value:'"+t.ScaleFactor.$Decimal+"'}":",{path:'internal>scalefactorNumber/"+n+"'}")+(t&&t.NumberOfFractionalDigits?",{value:'"+t.NumberOfFractionalDigits+"'}":",{value:'0'}")+",{path:'internal>currency/"+n+"'}"+",{path:'"+e+"',type:'sap.ui.model.odata.type.String', constraints:{'nullable':false}}"+"], formatter:'VisualFilterRuntime.scaleVisualFilterValue'}"},getChartValue:function(e){return"{path:'"+e+"',type:'sap.ui.model.odata.type.Decimal', constraints:{'nullable':false}}"},getChart:function(e){const t=e.getModel();const a=t.getObject(e.getPath());const n=a.Visualizations;for(let a=0;a<n.length;a++){if(n[a].$AnnotationPath.indexOf("com.sap.vocabularies.UI.v1.Chart")>-1){const r=f.getNavigationPath(e.getPath());return t.createBindingContext(r+"/"+n[a].$AnnotationPath)}}return undefined},getChartLabel:function(){return arguments.length<=2?undefined:arguments[2]},_getMeasurePath:function(e,t){let a;if(t){a="/Measures/0/$PropertyPath"}if(e.DynamicMeasures&&e.DynamicMeasures.length>0){a="/DynamicMeasures/0/$AnnotationPath/AggregatableProperty/$PropertyPath"}else if(!t&&e.Measures&&e.Measures.length>0){a="/Measures/0/$PropertyPath"}return a},getAggregationBinding:function(n,r,i,s,c,u,f,m,d,P,$,C,b,I){const v=C?C.getPath():"";const M=r.Dimensions[0].$PropertyPath;const T=[];let O,D,S,E;let V=i.$kind=="NavigationProperty"?n.getPath(1):(i.$kind=="EntitySet"?"/":"")+n.getModel(1).getObject(`${n.getPath(1)}@sapui.name`);const A=y.getUoM(n,r,i,undefined,m,d);const F=n.getInterface(1).getPath(),x=n.getInterface(1).getModel();if(b){T.push({operator:"EQ",value1:"true",value2:null,path:"IsActiveEntity",isParameter:true})}if(f&&f.getObject()){S=h(F,x,f.getObject(),a.getCustomConditions.bind(a));for(const e in S){const t=S[e];t.forEach(function(e){if(!e.isParameter){T.push(e)}})}}if(v!==`${V}/`&&$&&$.length&&S){const n=[];const r=a.convertFilterCondions(S);const i=t.getParameterInfo(x,V).parameterProperties;if(i){for(const t in $){const a=$[t];const s=i[a];const c=F.split("/")[1];const u=x.createBindingContext(`/${c}/${a}`);const f=e.parseJS(l.formatOptions(s,{context:u})||"{}");const h=e.parseJS(l.constraints(s,{context:u})||"{}");const m=o.getTypeConfig(s.$Type,f,h);const d=r[a];const y=d?d[0]:undefined;if(y){const e=g.toType(y,m,o);const t=s.$Type;let r=encodeURIComponent(p.formatLiteral(e.values[0],t));r=r.replaceAll("'","\\'");n.push(`${a}=${r}`)}}}const s=V.slice(0,V.lastIndexOf("/"));const c=V.substring(V.lastIndexOf("/")+1);E=`${s}(${n.toString()})/${c}`;V=E}if(m){if(P){O=A&&A.$Path?`{ 'unit' : '${A.$Path}' }`:"{}";D=""}else{O="{}";D=A&&A.$Path?`, '${A.$Path}' : {}`:""}}else if(d&&d.AggregatableProperty&&d.AggregatableProperty.value&&d.AggregationMethod){O="{ 'name' : '"+d.AggregatableProperty.value+"', 'with' : '"+d.AggregationMethod+"'}";D=A&&A.$Path?", '"+A.$Path+"' : {}":""}const U=s?"' : { 'additionally' : ['"+s.$Path+"'] }":"' : { }";const R=JSON.stringify(T);return"{path: '"+V+"', templateShareable: true, suspended : true, 'filters' : "+R+",'parameters' : {"+y.getSortOrder(n,x,r,c,u,I)+", '$$aggregation' : {'aggregate' : {'"+I+"' : "+O+"},'group' : {'"+M+U+D+"} } }"+y.getMaxItems(r)+"}"},getSortOrder:function(e,t,a,n,r,i){let o;if(a.ChartType.$EnumMember==="com.sap.vocabularies.UI.v1.ChartType/Donut"||a.ChartType.$EnumMember==="com.sap.vocabularies.UI.v1.ChartType/Bar"){if(r&&r.length){if(r[0].DynamicProperty){o=t.getObject(e.getPath(0).split("@")[0]+r[0].DynamicProperty.$AnnotationPath).Name}else{o=r[0].Property.$PropertyPath}if(o===i){return"'$orderby' : '"+i+(r[0].Descending?" desc'":"'")}return"'$orderby' : '"+i+" desc'"}return"'$orderby' : '"+i+" desc'"}else if(n==="Edm.Date"||n==="Edm.Time"||n==="Edm.DateTimeOffset"){return"'$orderby' : '"+a.Dimensions[0].$PropertyPath+"'"}else if(r&&r.length&&r[0].Property.$PropertyPath===a.Dimensions[0].$PropertyPath){return"'$orderby' : '"+r[0].Property.$PropertyPath+(r[0].Descending?" desc'":"'")}else{return"'$orderby' : '"+a.Dimensions[0].$PropertyPath+"'"}},getMaxItems:function(e){if(e.ChartType.$EnumMember==="com.sap.vocabularies.UI.v1.ChartType/Bar"){return",'startIndex' : 0,'length' : 3"}else if(e.ChartType.$EnumMember==="com.sap.vocabularies.UI.v1.ChartType/Line"){return",'startIndex' : 0,'length' : 6"}else{return""}},getColorBinding:function(e,t,a){const n=e.getModel(0);const r=e.getPath(1);const i=n.getObject(`${r}$PropertyPath@com.sap.vocabularies.UI.v1.ValueCriticality`);t=t.targetObject;if(t.Criticality){return m(t)}else if(t.CriticalityCalculation){const a=t.CriticalityCalculation.ImprovementDirection&&t.CriticalityCalculation.ImprovementDirection.$EnumMember;const n=f.value(t.Value,{context:e.getInterface(0)});const r=f.value(t.CriticalityCalculation.DeviationRangeLowValue,{context:e.getInterface(0)});const i=f.value(t.CriticalityCalculation.ToleranceRangeLowValue,{context:e.getInterface(0)});const o=f.value(t.CriticalityCalculation.AcceptanceRangeLowValue,{context:e.getInterface(0)});const l=f.value(t.CriticalityCalculation.AcceptanceRangeHighValue,{context:e.getInterface(0)});const c=f.value(t.CriticalityCalculation.ToleranceRangeHighValue,{context:e.getInterface(0)});const u=f.value(t.CriticalityCalculation.DeviationRangeHighValue,{context:e.getInterface(0)});return s.getCriticalityCalculationBinding(a,n,r,i,o,l,c,u)}else if(i&&i.length){return s.getValueCriticality(a.$PropertyPath,i)}else{return undefined}},getScaleUoMTitle:function(e,t,a,n,r,i,o,s){const l=e.getModel(0);const c=l.getObject(`${e.getPath(0)}/MeasureAttributes/0/DataPoint/$AnnotationPath/ValueFormat/ScaleFactor/$Decimal`);const g=d([n]);const f=u.getIntegerInstance({style:"short",showScale:false,shortRefNumber:c});let p=f.getScale();let h=y.getUoM(e,t,a,undefined,r,i);h=h&&(h.$Path?"${internal>uom/"+g+"}":"'"+h+"'");p=p?"'"+p+"'":"${internal>scalefactor/"+g+"}";if(!o){o="|"}o=h?"' "+o+" ' + ":"";const m=p&&h?o+p+" + ' ' + "+h:o+(p||h);return s?m:"{= "+m+"}"},getMeasureDimensionTitle:function(e,t,a,n,r){const i=e.getModel(0);let o;const s=y._getMeasurePath(t,n);const l=i.getObject(`${e.getPath(0)}`+s);const u=i.getObject(`${e.getPath(0)}/Dimensions/0/$PropertyPath`);let g=y.getLabel(i,e,"Dimensions");if(!n&&r){o=r.annotations&&r.annotations.Common&&r.annotations.Common.Label;if(o===undefined){o=o=y.getLabel(i,e,"Measures")}}else{o=y.getLabel(i,e,"Measures")}if(o===undefined){o=l}if(g===undefined){g=u}return c&&c.getText("M_INTERACTIVE_CHART_HELPER_VISUALFILTER_MEASURE_DIMENSION_TITLE",[o,g])},getLabel:function(e,t,a){return e.getObject(`${t.getPath(0)}/${a}/0/$PropertyPath@com.sap.vocabularies.Common.v1.Label`)},getToolTip:function(e,t,a,n,r,i,o){const l=t&&t["ChartType"];let u=y.getMeasureDimensionTitle(e,t,a,r,i);u=s.escapeSingleQuotes(u);if(o==="false"&&l==="UI.ChartType/Line"){return`{= '${u}'}`}const g=c.getText("M_INTERACTIVE_CHART_HELPER_VISUALFILTER_TOOLTIP_SEPERATOR");const f=d([n]);const p=y.getScaleUoMTitle(e,t,a,f,r,i,g,true);return"{= '"+u+(p?"' + "+p:"'")+"}"},getUoM:function(e,t,a,n,r,i){const o=e.getModel(0);const s=y._getMeasurePath(t,r);const l=o.getObject(`${e.getPath(0)}`+s+`@Org.OData.Measures.V1.ISOCurrency`);const c=o.getObject(`${e.getPath(0)}`+s+`@Org.OData.Measures.V1.Unit`);const u=o.getObject(`${e.getPath(0)}`+s);let g;if(!r&&i){g=i.AggregatableProperty&&i.AggregatableProperty.value}else{g=u}const f=function(t,a){const r=a&&a.split("V1.")[1];const i={};if(t){i[r]=t;return n&&t.$Path?JSON.stringify(i):t}else if(g){t=e.getModel(1).getObject(`${e.getPath(1)}/${g}${a}`);i[r]=t;return t&&n&&t.$Path?JSON.stringify(i):t}};return f(l,"@Org.OData.Measures.V1.ISOCurrency")||f(c,"@Org.OData.Measures.V1.Unit")},getScaleFactor:function(e){if(e&&e.ScaleFactor){return e.ScaleFactor.$Decimal}return undefined},getUoMVisiblity:function(e,t){const a=e&&e["ChartType"];if(t){return false}else if(!(a==="UI.ChartType/Bar"||a==="UI.ChartType/Line")){return false}else{return true}},getInParameterFiltersBinding:function(e){if(e.length>0){const t=[];let a="";e.forEach(function(e){if(e.localDataProperty){t.push(`{path:'$filters>/conditions/${e.localDataProperty}'}`)}});if(t.length>0){a=t.join();return`{parts:[${a}], formatter:'sap.fe.macros.visualfilters.VisualFilterRuntime.getFiltersFromConditions'}`}else{return undefined}}else{return undefined}},getfilterCountBinding:function(e){var t,a;const n=(t=e.Dimensions[0])===null||t===void 0?void 0:(a=t.$target)===null||a===void 0?void 0:a.name;return"{path:'$filters>/conditions/"+n+"', formatter:'sap.fe.macros.visualfilters.VisualFilterRuntime.getFilterCounts'}"}};y.getColorBinding.requiresIContext=true;y.getAggregationBinding.requiresIContext=true;y.getUoM.requiresIContext=true;y.getScaleUoMTitle.requiresIContext=true;y.getToolTip.requiresIContext=true;y.getMeasureDimensionTitle.requiresIContext=true;return y},false);
//# sourceMappingURL=InteractiveChartHelper.js.map