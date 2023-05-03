/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
sap.ui.define(["sap/apf/utils/filter","sap/apf/core/utils/filter","sap/apf/utils/startFilter","sap/apf/utils/utils"],function(e,r,t,i){"use strict";var n=function(n){var a=[{isLevel:true}];var o=n&&n.constructors&&n.constructors.StartFilter||t;var s={};var f={};var u={};var l={};var c=n.instances.messageHandler;var v=jQuery.Deferred();var d=jQuery.Deferred();var p=false;var y=jQuery.Deferred();var g=0;var h=0;var m;var P=jQuery.Deferred();this.getStartFilters=function(){F().done(function(){v.resolve(Q())});return v.promise()};this.setRestrictionByProperty=function(e){if(!m){m=jQuery.Deferred()}g++;var r=e.getInternalFilter();var t=r.getProperties()[0];s[t]=e;F();m.done(function(){var i=true;w().forEach(function(e){if(e.getPropertyName()===t){if(r.isDisjunctionOverEqualities()){var n=P.state()==="pending";e.setSelectedValues(j(r),n)}else{e.setContext(r)}i=false}});if(i){a.unshift(new o(n,{multiSelection:true,property:t,invisible:true,notConfigured:true},r))}if(y.state()==="resolved"){y=jQuery.Deferred()}if(n.functions.getFacetFilterConfigurations().length===0){y.resolve(b(A()))}f[t]=e;delete s[t];if(!u[t]){u[t]=e.serialize()}h++;if(h===g){O();P.resolve()}})};this.getRestrictionByProperty=function(r){if(f[r]){return f[r]}else if(s[r]){return s[r]}return new e(c)};this.getCumulativeFilter=function(){var e=jQuery.Deferred();var t=new r(c);var i;F().done(function(){i=w().length;if(i===0){e.resolve(new r(c))}y.done(function(i,n,a){var o;o=new r(c);if(i&&i.type==="internalFilter"){o=i}if(jQuery.isArray(i)){i.forEach(function(e){o.addOr(new r(c,a,"eq",e))})}if(n){t.addAnd(n).addAnd(o)}else{t=o}e.resolve(t)})});return e.promise()};this.serialize=function(e,r){var t=jQuery.Deferred();var i;var n;var a={};a.startFilters=[];a.restrictionsSetByApplication={};for(n in f){a.restrictionsSetByApplication[n]=f[n].serialize()}i=w().length;if(w().length>0){w().forEach(function(n){n.serialize(e,r).done(function(e){a.startFilters.push(e);i--;if(i===0){t.resolve(a)}})})}else{t.resolve(a)}return t.promise()};this.deserialize=function(r){var t=jQuery.Deferred();y.done(function(){var i=w();var n;var a;f={};r.startFilters.forEach(function(e){for(var r=0,t=i.length;r<t;r++){if(e.propertyName===i[r].getPropertyName()){i[r].deserialize(e)}}});for(n in r.restrictionsSetByApplication){a=new e(c);a.deserialize(r.restrictionsSetByApplication[n]);f[n]=a}y=jQuery.Deferred();O();y.done(function(){t.resolve()})});return t};this.resetAll=function(){var r;w().forEach(function(e){e.reset()});f={};for(r in u){f[r]=new e(c).deserialize(u[r])}O()};this.resetVisibleStartFilters=function(){Q().forEach(function(e){e.reset()});var e=0;var r=a.length;for(var t=0;t<r;t++){if(a[t].isLevel){e=t+1;break}}if(a[e]){a[e].setRestriction(l[a[e].getPropertyName()])}};function F(){if(!p){p=true;n.instances.onBeforeApfStartupPromise.done(function(){n.functions.getReducedCombinedContext().done(function(e){var r=n.functions.getFacetFilterConfigurations();var t=e.getProperties();var s=t.length;var f=null;r.forEach(function(r){for(var u=0;u<s;u++){if(r.property===t[u]){f=t[u];break}}if(f){var l=N(e,f);if(i.isPropertyTypeWithDateSemantics(r.metadataProperty)){l=i.convertDateListToInternalFormat(l,r.metadataProperty)}a.push(new o(n,r,l));t.splice(t.indexOf(f),1);f=null}else{a.push(new o(n,r))}});t.forEach(function(r){a.unshift(new o(n,{property:r,invisible:true,multiSelection:true},N(e,r)))});if(!m){m=jQuery.Deferred();P.resolve()}m.resolve();P.done(function(){S().done(function(){E();d.resolve()})})})})}return d}function E(){var e=D();e.forEach(function(t){t.getSelectedValues().done(i);function i(n,a){var o;var s=new r(c);var f;a.done(i);for(var u=0;u<e.length;u++){if(e[u]===t){o=u;break}}if(o===e.length-1){if(y.state()==="resolved"){y=jQuery.Deferred()}y.resolve(n,l[t.getPropertyName()],t.getPropertyName());return}else if(y.state()==="resolved"){y=jQuery.Deferred()}if(n&&n.type==="internalFilter"){s=n}else if(jQuery.isArray(n)){n.forEach(function(e){s.addOr(t.getPropertyName(),"eq",e)})}if(l[t.getPropertyName()]){if(s.isEmpty()){f=l[t.getPropertyName()].copy()}else{if(l[t.getPropertyName()].isOr()){f=new r(c);f.addAnd(l[t.getPropertyName()]).addAnd(s)}else{f=l[t.getPropertyName()].copy().addAnd(s)}}}else{f=s}l[e[o+1].getPropertyName()]=f;e[o+1].setRestriction(f)}})}function j(e){var r=[];e.getFilterTerms().forEach(function(e){r.push(e.getValue())});return r}function N(e,r){var t=[];var i=e.getFilterTermsForProperty(r);var n=e.restrictToProperties([r]);if(n.toUrlParam().indexOf("%20and%20")>-1){return n}for(var a=0,o=i.length;a<o;a++){if(i[a].getOp()!=="EQ"){return n}t.push(i[a].getValue())}return t}function Q(){var e=[];w().forEach(function(r){if(r.isVisible()){e.push(r)}});return e}function D(){var e=false;var r=[];a.forEach(function(t){if(t.isLevel){e=true}else if(e===true){r.push(t)}});return r}function w(){var e=[];a.forEach(function(r){if(!r.isLevel){e.push(r)}});return e}function A(){var e=[];for(var r=0,t=a.length;r<t;r++){if(!a[r].isLevel){e.push(a[r])}else{break}}return e}function S(){var e=jQuery.Deferred();t(b(A()));return e;function t(t){var i;var n=a.length;var o=t;var s=0;for(i=0;i<n;i++){if(a[i].isLevel){s=i+1;break}}if(a[s]){a[s].setRestriction(o);l[a[s].getPropertyName()]=o.copy();f(s)}else{y.resolve(b(A()));e.resolve()}function f(t){if(a[t+1]){a[t].getSelectedValues().done(function(e){var i=new r(c);if(e&&e.type==="internalFilter"){i.addOr(e)}else if(jQuery.isArray(e)){e.forEach(function(e){i.addOr(a[t].getPropertyName(),"eq",e)})}if(!i.isEmpty()){o.addAnd(i)}a[t+1].setRestriction(o);l[a[t+1].getPropertyName()]=o.copy();f(t+1)})}else{e.resolve()}}}}function b(e){var t=new r(c);e.forEach(function(e){var i=new r(c);e.getSelectedValues().done(function(r){if(r.type==="internalFilter"){i.addOr(r)}else{r.forEach(function(r){i.addOr(e.getPropertyName(),"eq",r)})}});t.addAnd(i)});return t}function O(){var e=0;var r=a.length;for(var t=0;t<r;t++){if(a[t].isLevel){e=t+1;break}}if(a[e]){var i=b(A());l[a[e].getPropertyName()]=i;a[e].setRestriction(i)}else{y.resolve(b(A()))}}};sap.apf.utils.StartFilterHandler=n;return n},true);
//# sourceMappingURL=startFilterHandler.js.map