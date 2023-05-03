/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./_Helper","./_Parser","sap/ui/model/Filter"],function(e,t,r){"use strict";var n=/,|%2C|%2c/,i={aggregate:{"*":{grandTotal:"boolean",max:"boolean",min:"boolean",name:"string",subtotals:"boolean",unit:"string",with:"string"}},"grandTotal like 1.84":"boolean",grandTotalAtBottomOnly:"boolean",group:{"*":{additionally:["string"]}},groupLevels:["string"],search:"string",subtotalsAtBottomOnly:"boolean"},a=Object.freeze({"@$ui5.node.isExpanded":false}),o=Object.freeze({"@$ui5.node.isExpanded":true}),s=new RegExp("^("+t.sODataIdentifier+"(?:/"+t.sODataIdentifier+")*"+")(?:"+t.sWhitespace+"+(?:asc|desc))?$"),l={expandTo:/^[1-9]\d*$/,hierarchyQualifier:"string",search:"string"},u;function f(e,t,r,n,i,a,o){var s=e.aggregate[i],l=s.name||i,u=s.unit,f=s.with;if(n){if(f==="average"||f==="countdistinct"){throw new Error("Cannot aggregate totals with '"+f+"'")}l=i;i="UI5grand__"+i}if(f){l+=" with "+f+" as "+i}else if(s.name){l+=" as "+i}r.push(l);if(u&&!r.includes(u)&&!o.includes(u,a+1)&&!t.includes(u)){r.push(u)}}function c(e){var t=[];if(e.$skip){t.push("skip("+e.$skip+")")}delete e.$skip;if(e.$top<Infinity){t.push("top("+e.$top+")")}delete e.$top;return t.join("/")}u={beforeOverwritePlaceholder:function(t,r,n,i,a){var o=e.getPrivateAnnotation(t,"parent");if(!e.hasPrivateAnnotation(t,"placeholder")){throw new Error("Unexpected element")}if(o!==n||e.getPrivateAnnotation(t,"index")!==i||t["@$ui5.node.level"]!==r["@$ui5.node.level"]&&t["@$ui5.node.level"]!==0){throw new Error("Wrong placeholder")}["descendants","filter","predicate"].forEach(function(n){if(e.hasPrivateAnnotation(t,n)&&e.getPrivateAnnotation(t,n)!==e.getPrivateAnnotation(r,n)){throw new Error("Unexpected structural change: "+n)}});if(a in t&&t[a]!==r[a]){throw new Error("Unexpected structural change: "+a+" from "+JSON.stringify(t[a])+" to "+JSON.stringify(r[a]))}e.copyPrivateAnnotation(t,"spliced",r);if("@$ui5.node.isExpanded"in t){if(t["@$ui5.node.isExpanded"]===undefined!==(r["@$ui5.node.isExpanded"]===undefined)){throw new Error("Not a leaf anymore (or vice versa)")}r["@$ui5.node.isExpanded"]=t["@$ui5.node.isExpanded"]}},buildApply:function(e,t,r,n,i){var a,o="",s=[],l=e["grandTotal like 1.84"],g,d,p,h=[],y,$=[];function v(t,r){var n,a=e.aggregate[t];if(a[r]){n="UI5"+r+"__"+t;h.push(t+" with "+r+" as "+n);if(i){i[n]={measure:t,method:r}}}}if(e.hierarchyQualifier){return u.buildApply4Hierarchy(e,t,!r)}t=Object.assign({},t);e.groupLevels=e.groupLevels||[];d=!r||r>e.groupLevels.length;e.group=e.group||{};e.groupLevels.forEach(function(t){e.group[t]=e.group[t]||{}});g=d?Object.keys(e.group).sort().filter(function(t){return!e.groupLevels.includes(t)}):[e.groupLevels[r-1]];if(!r){g=e.groupLevels.concat(g)}e.aggregate=e.aggregate||{};a=Object.keys(e.aggregate).sort();if(r===1&&!n){a.filter(function(t){return e.aggregate[t].grandTotal}).forEach(f.bind(null,e,[],s,l))}if(!n){a.forEach(function(e){v(e,"min");v(e,"max")})}a.filter(function(t){return d||e.aggregate[t].subtotals}).forEach(f.bind(null,e,g,$,false));if($.length){o="aggregate("+$.join(",")+")"}if(g.length){g.forEach(function(t){var r=e.group[t].additionally;if(r){g.push.apply(g,r)}});o="groupby(("+g.join(",")+(o?"),"+o+")":"))")}if(n){delete t.$count}else if(t.$count){h.push("$count as UI5__count");delete t.$count}if(t.$filter){o+="/filter("+t.$filter+")";delete t.$filter}if(t.$orderby){o+="/orderby("+t.$orderby+")";delete t.$orderby}y=c(t);if(l&&s.length){if(e.groupLevels.length){throw new Error("Cannot combine visual grouping with grand total")}o+="/concat(aggregate("+s.join(",")+"),aggregate("+h.join(",")+"),"+(y||"identity")+")"}else{if(h.length){o+="/concat(aggregate("+h.join(",")+"),"+(y||"identity")+")"}else if(y){o+="/"+y}if(r===1&&t.$$leaves&&!n){p="groupby(("+Object.keys(e.group).sort().join(",")+"))/aggregate($count as UI5__leaves)"}delete t.$$leaves;if(s.length){o="concat("+(p?p+",":"")+"aggregate("+s.join(",")+"),"+o+")"}else if(p){o="concat("+p+","+o+")"}}if(e.search){o="search("+e.search+")/"+o}if(t.$$filterBeforeAggregate){o="filter("+t.$$filterBeforeAggregate+")/"+o;delete t.$$filterBeforeAggregate}if(o){t.$apply=o}return t},buildApply4Hierarchy:function(e,t,r){var n="",i=e.hierarchyQualifier,a=e.$metaPath,o=e.$NodeProperty,s=e.$path,l,u="",f;function c(r){var n;if(t.$select){n=e["$"+r];if(!n){if(!l){l=e.$fetchMetadata(a+"/@com.sap.vocabularies.Hierarchy.v1.RecursiveHierarchy#"+i).getResult()}n=e["$"+r]=l[r].$PropertyPath}t.$select.push(n)}}if(!o){o="???";if(t){f=e.$fetchMetadata(a+"/@Org.OData.Aggregation.V1.RecursiveHierarchy#"+i+"/NodeProperty/$PropertyPath");if(f.isFulfilled()){o=e.$NodeProperty=f.getResult()}}}t=Object.assign({},t);if(t.$select){t.$select=t.$select.slice();if(!t.$select.includes(o)){t.$select.push(o)}}if(t.$filter||e.search){if(t.$filter){n="filter("+t.$filter;u=")/";delete t.$filter}if(e.search){n+=u+"search("+e.search}n="ancestors($root"+s+","+i+","+o+","+n+"),keep start)/"}if(t.$$filterBeforeAggregate){n+="descendants($root"+s+","+i+","+o+",filter("+t.$$filterBeforeAggregate+"),1)";delete t.$$filterBeforeAggregate;if(t.$orderby){n+="/orderby("+t.$orderby+")";delete t.$orderby}}else{if(t.$orderby){n+="orderby("+t.$orderby+")/";delete t.$orderby}n+="com.sap.vocabularies.Hierarchy.v1.TopLevels(HierarchyNodes=$root"+(s||"")+",HierarchyQualifier='"+i+"',NodeProperty='"+o+"',Levels="+(r?9:e.expandTo||1)+")";if(r){c("DistanceFromRootProperty")}else if(e.expandTo>1){c("DistanceFromRootProperty");c("LimitedDescendantCountProperty")}}if(!r){c("DrillStateProperty")}t.$apply=n;return t},checkTypeof:function(e,t,r){if(Array.isArray(t)){if(!Array.isArray(e)){throw new Error("Not an array value for '"+r+"'")}e.forEach(function(e,n){u.checkTypeof(e,t[0],r+"/"+n)})}else if(t instanceof RegExp){if(!t.test(e)){throw new Error("Not a matching value for '"+r+"'")}}else if(typeof t==="object"){var n="*"in t;if(typeof e!=="object"||!e||Array.isArray(e)){throw new Error("Not an object value for '"+r+"'")}Object.keys(e).forEach(function(i){if(!n&&!(i in t)){throw new Error("Unsupported property: '"+r+"/"+i+"'")}u.checkTypeof(e[i],t[n?"*":i],r+"/"+i)})}else if(typeof e!==t){throw new Error("Not a "+t+" value for '"+r+"'")}},createPlaceholder:function(t,r,n){var i={"@$ui5.node.level":t};e.setPrivateAnnotation(i,"index",r);e.setPrivateAnnotation(i,"parent",n);e.setPrivateAnnotation(i,"placeholder",true);return i},extractSubtotals:function(e,t,r,n){var i=t["@$ui5.node.level"];Object.keys(e.aggregate).forEach(function(a){var o=e.aggregate[a],s,l=o.unit;if(!o.subtotals){return}r[a]=t[a];if(n){n[a]=null}if(l){r[l]=t[l];if(n){s=e.groupLevels.indexOf(l);if(s<0||s>=i){n[l]=null}}}})},filterOrderby:function(e,t,r){var n=u.getFilteredOrderby(e.$orderby,t,r);e=Object.assign({},e);if(n){e.$orderby=n}else{delete e.$orderby}return e},getAllProperties:function(e){var t=Object.keys(e.aggregate),r=Object.keys(e.group),n=t.concat(r);t.forEach(function(t){var r=e.aggregate[t].unit;if(r){n.push(r)}});r.forEach(function(t){var r=e.group[t].additionally;if(r){r.forEach(function(e){n.push(e.includes("/")?e.split("/"):e)})}});return n},getCollapsedObject:function(t){return e.getPrivateAnnotation(t,"collapsed")||a},getFilteredOrderby:function(e,t,r){var i=!r||r>t.groupLevels.length;function a(e){return Object.keys(t.aggregate).some(function(r){var n=t.aggregate[r];return n.subtotals&&e===n.unit})}function o(e){if(e in t.group&&(!r||!t.groupLevels.includes(e))){return true}return Object.keys(t.aggregate).some(function(r){return e===t.aggregate[r].unit})||Object.keys(t.group).some(function(n){return(!r||!t.groupLevels.includes(n))&&l(e,n)})}function l(e,r){return e===r||t.group[r].additionally&&t.group[r].additionally.includes(e)}if(e){return e.split(n).filter(function(e){var n=s.exec(e),u;if(n){u=n[1];return u in t.aggregate&&(i||t.aggregate[u].subtotals)||i&&o(u)||!i&&(l(u,t.groupLevels[r-1])||a(u))}return true}).join(",")}},getOrCreateExpandedObject:function(t,r){var n,i;if(t.subtotalsAtBottomOnly===undefined){return o}i=e.getPrivateAnnotation(r,"expanded");if(!i){n={"@$ui5.node.isExpanded":false};e.setPrivateAnnotation(r,"collapsed",n);i={"@$ui5.node.isExpanded":true};e.setPrivateAnnotation(r,"expanded",i);u.extractSubtotals(t,r,n,t.subtotalsAtBottomOnly?i:null)}return i},hasGrandTotal:function(e){return e&&Object.keys(e).some(function(t){return e[t].grandTotal})},hasMinOrMax:function(e){return e&&Object.keys(e).some(function(t){var r=e[t];return r.min||r.max})},isAffected:function(t,r,n){function i(t,r){if(t.endsWith("/*")){t=t.slice(0,-2)}return e.hasPathPrefix(r,t)||e.hasPathPrefix(t,r)}function a(e,t){return t.some(function(t){return t.aFilters?a(e,t.aFilters):i(e,t.sPath)})}return n.some(function(e){var n=i.bind(null,e);return e===""||e==="*"||Object.keys(t.aggregate).some(function(r){var n=t.aggregate[r];return i(e,n.name||r)})||Object.keys(t.group).some(n)||t.groupLevels.some(n)||a(e,r)})},markSplicedStale:function(t){var r=e.getPrivateAnnotation(t,"spliced");if(r){r.$stale=true}},removeUI5grand__:function(e){Object.keys(e).forEach(function(t){if(t.startsWith("UI5grand__")){e[t.slice(10)]=e[t];delete e[t]}})},setAnnotations:function(t,r,n,i,a){e.setAnnotation(t,"@$ui5.node.isExpanded",r);e.setAnnotation(t,"@$ui5.node.isTotal",n);t["@$ui5.node.level"]=i;if(a){a.forEach(function(r){if(Array.isArray(r)){e.createMissing(t,r)}else if(!(r in t)){t[r]=null}})}},setPath:function(t,r){t.$metaPath=r&&e.getMetaPath(r);t.$path=r},splitFilter:function(e,t){var n=[],i=[];function a(e){return e.aFilters?e.aFilters.some(a):e.sPath in t.aggregate}function o(e){if(e.aFilters&&e.bAnd){e.aFilters.forEach(o)}else{(a(e)?n:i).push(e)}}function s(e){return e.length>1?new r(e,true):e[0]}if(!t||!t.aggregate){return[e]}o(e);return[s(n),s(i)]},validateAggregation:function(e,t){if(e.hierarchyQualifier&&!t){throw new Error("Missing parameter autoExpandSelect at model")}u.checkTypeof(e,e.hierarchyQualifier?l:i,"$$aggregation")},validateAggregationAndSetPath:function(e,t,r,n){u.validateAggregation(e,t);e.$fetchMetadata=r;u.setPath(e,n)}};return u},false);
//# sourceMappingURL=_AggregationHelper.js.map