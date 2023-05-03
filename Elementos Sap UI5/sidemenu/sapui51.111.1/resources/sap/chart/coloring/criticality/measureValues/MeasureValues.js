/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
sap.ui.define(["sap/chart/coloring/ColoringUtils","sap/chart/coloring/ColorPalette","sap/chart/coloring/criticality/measureValues/MeasureUtils","sap/chart/ChartLog","sap/chart/data/MeasureSemantics","sap/ui/thirdparty/jquery"],function(e,t,r,i,a,jQuery){"use strict";var n={};var s=["Static","Calculated","DynamicThresholds","ConstantThresholds"];function o(e,t,a,n,s,o,l,u){var c={supportMultiMsr:false,supportHeatMap:false};var h=s.length>1;if(r[e].validate){jQuery.extend(c,r[e].validate(o,a,n,t,u))}if(h&&!c.supportMultiMsr){throw new i("error","Colorings.Criticality","Only support multiple active measures when using Static Criticality.")}if(l.bMBC&&!c.supportHeatMap){throw new i("error","Colorings","Heatmap only support Criticality.MeasureValues.ConstantThresholds.")}}var l=function(t,r,a,n,l){var c=a.aMsr;e.checkColoringMeasure(n,c,t);var h=[];n.forEach(function(e,c){var f=Object.keys(t[e]).filter(function(e){return s.indexOf(e)>-1}).sort();var g=u(f);if(f.length>1&&!g){throw new i("error","Colorings.Criticality.MeasureValues",'The combination of "DynamicThresholds"and "ConstantThresholds" or only one of "Static", "Calculated", "DynamicThresholds", or "ConstantThresholds" can be applied to the measure, '+e+".")}if(!g&&f.length===1){o(f[0],r,e,a,n,t,l,h)}});if(e.hasSeriesDim(a)||l.bTimeChart&&l.bWaterfall&&a.aDim.length>1||l.bIsPie&&a.aDim.length){throw new i("error","colorings.Criticality.MeasureValues","Semantic coloring could not be applied if chart already has coloring.")}};function u(e){return e.length===2&&e[0]=="ConstantThresholds"&&e[1]==="DynamicThresholds"}function c(e,t){var r=e.filter(function(e){return e.msr.getName()===t})[0];return r}function h(e,t,r){if(e.sMethod==="Static"){var i=[];t.forEach(function(t){jQuery.each(a,function(n,s){var o=t[s];if(o){var l=c(e,t[s]);if(!l){jQuery.each(a,function(a,n){if(s!==n){var l=c(e,t[n]);if(l){var u=r.filter(function(e){return e.getName()===o})[0];var h={msr:u,settings:{Static:l.settings.Static},type:"Static"};i.push(h)}}})}else{t.criticalityType=l.settings.Static}}})});e.push.apply(e,i)}}n.qualify=function(t,r,n,s,c,f){l(t,r,s,n,f);var g=[],d=[],m=s.aDim.map(function(e){return e.getName()}).sort();jQuery.each(t,function(a,l){var c=Object.keys(l);var h=e.find(a,s.aMsr);var p=c.filter(function(e){return e!=="Legend"}).sort();if(n.length&&n.indexOf(a)===-1){return}var v=false,C;for(var y=0;y<p.length&&!v;y++){C=p[y];g.sMethod=C;if(C==="ConstantThresholds"){var M=null,b=null;for(var w=0;w<l[C].AggregationLevels.length;w++){if(l[C].AggregationLevels[w].VisibleDimensions){var T=l[C].AggregationLevels[w].VisibleDimensions.sort();if(T.join(",")===m.join(",")){M=l[C].AggregationLevels[w]}}else{b=l[C].AggregationLevels[w]}}M=M||b;if(M){v=true;if(!f.bFiltered){g.push({type:C,msr:h,settings:l,byAggregation:M});d.push(h.getName())}}}else{v=true;g.push({type:C,msr:h,settings:l});d.push(h.getName())}}if(!v){throw new i("error","Colorings.Criticality.MeasureValues.ConstantThresholds","No aggregation levels matched with current visible dimensions.")}if(u(p)){o(C,r,h.getName(),s,n,t,f)}});h(g,r,s.aMsr);if(g.length){var p=0;r.forEach(function(e){var t=false;jQuery.each(a,function(r,i){if(d.indexOf(e[i])>-1){t=true;return false}});if(!t){e.iUnMentionedIndex=p++}});if(p>3){throw new i("error","Colorings.Criticality.MeasureValues","Too many unmentioned measures (the maximum number is 3).")}}g.bShowUnmentionedMsr=f.bShowUnmentionedMsr;return g};n.parse=function(e,t,i,a,n){var s=a.bMBC,o={aMsrs:t.aMsr,aDims:t.aDim,oStatus:i},l={msr:e.msr,callbacks:{},additionalDimensions:[],additionalMeasures:[],legend:{}};r[e.type].parse(e,o,l,s,n);return l};n.getContextHandler=function(e,t,i,a){if(r[e].getContextHandler){return r[e].getContextHandler(t,i,a)}else{return null}};return n});
//# sourceMappingURL=MeasureValues.js.map