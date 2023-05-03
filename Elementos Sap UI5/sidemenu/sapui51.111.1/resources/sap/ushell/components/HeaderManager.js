// Copyright (c) 2009-2022 SAP SE, All Rights Reserved
sap.ui.define(["sap/base/util/ObjectPath","sap/ui/Device","sap/ushell/components/_HeaderManager/PropertyStrategiesFactory","sap/ushell/components/StateHelper","sap/ushell/Config","sap/ushell/EventHub","sap/ushell/utils","sap/ushell/utils/clone"],function(e,t,a,n,r,o,l,s){"use strict";var i={application:{},centralAreaElement:null,headEndItems:[],headItems:[],headerVisible:true,showLogo:false,ShellAppTitleState:undefined,rootIntent:r.last("/core/shellHeader/rootIntent"),homeUri:r.last("/core/shellHeader/homeUri"),title:""};var d;var u;var c="endItemsOverflowBtn";var h;var f={blank:{},"blank-home":{},home:{headItems:[]},app:{headItems:["backBtn"]},minimal:{headItems:[]},standalone:{headItems:["backBtn"]},embedded:{headItems:["backBtn"]},"embedded-home":{headItems:[]},headerless:{headItems:["backBtn"],headerVisible:false},merged:{headItems:["backBtn"]},"headerless-home":{headerVisible:false},"merged-home":{},lean:{headItems:[]},"lean-home":{}};var m=[];function p(e,a){var n=e&&e.appState?e.appState:"home";d=D(e);u=a;h=t.media.getCurrentRange(t.media.RANGESETS.SAP_STANDARD).name;I();v();k(n);B()}function S(){b()}function v(){var e=o.on("setHeaderCentralAreaElement").do(function(e){P({propertyName:"centralAreaElement",value:e.id,aStates:n.getPassStates(e.states),bCurrentState:!!e.currentState,bDoNotPropagate:!!e.bDoNotPropagate})});m.push(e);m.push(o.on("updateHeaderOverflowState").do(g));t.media.attachHandler(g,this,t.media.RANGESETS.SAP_STANDARD);m.push(r.on("/core/shellHeader/headEndItems").do(E));m.push(r.on("/core/shell/model/currentSpaceAndPage").do(A))}function b(){if(m){m.forEach(function(e){e.off()})}t.media.detachHandler(g,this,t.media.RANGESETS.SAP_STANDARD)}function g(e){if(e&&e.name){h=e.name}I();E()}function I(e){var t=r.last("/core/shell/model/currentState/stateName"),a=t==="merged"||t==="headerless",n=!a;P({propertyName:"showLogo",value:n,aStates:["home","app","blank","blank-home","minimal","lean"],bCurrentState:false,bDoNotPropagate:true})}function A(e){if(r.last("/core/spaces/enabled")&&r.last("/core/spaces/homeNavigationTarget")==="origin_page"){var t=e?e.hash:i.rootIntent;var a=this&&this.updateStates||P;a({propertyName:"homeUri",value:"#"+t})}}function E(e){var t=r.last("/core/shellHeader/headEndItems"),a=t.indexOf(c)>-1,n=e&&e.name||h,o;if(n==="Phone"&&!a&&t.length>2){N([c],false,["home","app"])}else if(n!=="Phone"&&a){o=sap.ui.getCore().byId("headEndItemsOverflow");if(o){o.destroy()}H([c],false,["home","app"])}}function N(e,t,a,n){P({propertyName:"headEndItems",value:e,aStates:a,bCurrentState:!!t,bDoNotPropagate:!!n})}function H(e,t,a){P({propertyName:"headEndItems",value:e,aStates:a,bCurrentState:!!t,action:"remove",bDoNotPropagate:false})}function C(e,t){var a={};Object.keys(e).forEach(function(n){var r=e[n];a[n]=Object.keys(r).reduce(function(e,t){e[t]=r[t];return e},s(t))});return a}function P(t){var o=t.propertyName,l=!t.bCurrentState?n.getAllStateToUpdate(t.aStates,t.bDoNotPropagate):[],s=r.last("/core/shellHeader"),i=r.last("/core/shell/model/currentState/stateName"),u=t.value,c;if(o.charAt(0)==="/"){o=o.substring(1)}c=a(o,t.action);if(!c){return}if(!t.bCurrentState){d=O(d,o,c,l,u)}if(l.indexOf(i)>-1||t.bCurrentState){var h=e.get(o.split("/"),s),f=c.execute(h,u);if(h!==f){e.set(o.split("/"),f,s);w(o,s)}}if(t.bCurrentState){T(o,c,u)}}function y(e){var t;for(t in e){if(e.hasOwnProperty(t)){l.updateProperties(d[t],e[t])}}}function k(e){var t=d[e];if(!t){throw new Error("the state ("+e+") does not exist")}r.emit("/core/shellHeader",s(t))}function B(e){var t=r.last("/core/shellHeader"),a,n;if(u&&u.customShellState){a=u.customShellState.currentState}if(e&&u.extendedShellStates[e]){n=u.extendedShellStates[e].customState.currentState}r.emit("/core/shellHeader",x(t,a,n))}function x(e,t,n){var o={};Object.keys(e).forEach(function(r){var l=a(r);var i=s(e[r]);if(l){if(n){i=l.execute(i,n[r])}if(t){i=l.execute(i,t[r])}}o[r]=i});o.ShellAppTitleState=r.last("/core/shellHeader/ShellAppTitleState");return o}function D(e){if(e){i.rootIntent=e.rootIntent;i.homeUri="#"+e.rootIntent}var t=C(f,i);function a(e,t){var a,n;for(a in t){if(a==="blank"||a==="blank-home"){continue}if(e==="openCatalogBtn"&&(a==="lean"||a==="lean-home")){continue}if(e==="ContactSupportBtn"){if(["home","app","minimal","standalone","embedded","embedded-home","lean"].indexOf(a)===-1){continue}}n=t[a].headEndItems.indexOf(e);if(n===-1){t[a].headEndItems.push(e)}}}function n(e,t){var a;for(a in t){t[a].title=e}}if(e){if(e.moveContactSupportActionToShellHeader){a("ContactSupportBtn",t)}if(e.moveAppFinderActionToShellHeader){a("openCatalogBtn",t)}if(e.title){n(e.title,t)}}return t}function O(t,a,n,r,o){if(r.length===0){return t}var l=s(t);r.forEach(function(t){var r=l[t],s;if(r){s=n.execute(e.get(a.split("/"),r),o);e.set(a.split("/"),s,r)}});return l}function T(t,a,n){var r,o;if(!u){return}r=u.customShellState.currentState;o=a.execute(e.get(t.split("/"),r),n);e.set(t.split("/"),o,r)}function w(e,t){var a=e.split("/").shift();r.emit("/core/shellHeader/"+a,t[a])}function _(e){var t;try{t=d[e]}catch(e){t=undefined}return t}function R(e,t){var a;try{a=_(e)[t]}catch(e){a=undefined}return a}function U(e){d=e}return{init:p,destroy:S,switchState:k,updateStates:P,recalculateState:B,extendStates:y,handleCurrentSpaceAndPage:A,handleEndItemsOverflow:E,validateShowLogo:I,_createInitialState:D,_generateBaseHeaderState:C,_getBaseState:_,_getBaseStateMember:R,_resetBaseStates:U}});
//# sourceMappingURL=HeaderManager.js.map