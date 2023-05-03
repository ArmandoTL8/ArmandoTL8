/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/base/Log","sap/ui/model/json/JSONModel","sap/ui/core/Core"],function(e,r,t){"use strict";var a="/sap/opu/odata4/ui2/insights_srv/srvd/ui2/";var i=a+"insights_cards_repo_srv/0001/";var n="INSIGHTS_CARDS";var s=a+"insights_cards_read_srv/0001/"+n;var o="POST";var d="PUT";var c=e.getLogger("sap.insights.CardHelper");var u=sap.ui.getCore().getLibraryResourceBundle("sap.insights");var p="sap.insights.preview.Preview",l="sap.insights.selection.Selection",h="sap.insights.selection.SelectionDialog",f="sap.insights.copy.Copy";function g(e){return i+n+"('"+e+"')"}function C(){return fetch(i,{method:"HEAD",headers:{"X-CSRF-Token":"Fetch"}}).then(function(e){var r=e.headers.get("X-CSRF-Token");if(e.ok&&r){return r}L(u.getText("tokenFetchError"))})}function v(e,r,t){if([d,o].indexOf(t)===-1){L("Method not supported.")}var a=e["sap.app"].id;var s=t===d?g(a):i+n;e={descriptorContent:JSON.stringify(e),id:a};var c=JSON.stringify(e);return fetch(s,{method:t,headers:{"X-CSRF-Token":r,"content-type":"application/json;odata.metadata=minimal;charset=utf-8"},body:c}).then(function(e){return e.json()}).then(function(e){if(e.error){L(e.error.message)}return JSON.parse(e.descriptorContent)})}function m(e,r){var t=i+n+"/com.sap.gateway.srvd.ui2.insights_cards_repo_srv.v0001.setRank?";var a=JSON.stringify({changedCards:JSON.stringify(e)});return fetch(t,{method:o,headers:{"X-CSRF-Token":r,"content-type":"application/json;odata.metadata=minimal;charset=utf-8"},body:a}).then(function(e){return e.json()}).then(function(e){if(e.error){L(e.error.message)}e.value.forEach(function(e){if(e.descriptorContent){e.descriptorContent=JSON.parse(e.descriptorContent)}});return e.value})}function y(e){var r=e.split(".");if(r[0]!=="user"){L("sap.app.id value should start with user.<id>.")}}function b(e,r){return fetch(g(e),{method:"DELETE",headers:{"X-CSRF-Token":r}}).then(function(e){return e.ok?{}:e.json()}).then(function(r){if(r.error){L(r.error.message)}return e})}function S(){var e="sap.insights is not enabled for this system.";var r="ux.eng.s4producthomes1";try{var t=window["sap-ushell-config"];var a=t.apps.insights.enabled;var i=t.ushell.homeApp.component.name;var n=i===r;var s=t.ushell.spaces.myHome.enabled;var o=t.ushell.spaces.enabled;if(a&&s&&n&&o){return Promise.resolve(true)}return Promise.reject(new Error(e))}catch(r){return Promise.reject(new Error(e))}}function L(e){c.error(e);throw new Error(e)}function P(e){var r=false;if(e&&e.parameters&&e.parameters.ibnTarget&&e.parameters.ibnTarget.semanticObject&&e.parameters.ibnTarget.action){r=true}if(e&&e.ibnTarget&&e.ibnTarget.semanticObject&&e.ibnTarget.action){r=true}return r}function w(e){var r=false;if(!e["sap.app"]){c.error("Invalid card manifest. sap.app namespace do not exists.");r=true}if(!r&&!e["sap.app"].id){c.error("Invalid card manifest. sap.app.id do not exists.");r=true}if(!r){y(e["sap.app"].id,false)}if(!r&&!e["sap.app"].type){c.error("Invalid card manifest. sap.app.type do not exists.");r=true}if(!r&&e["sap.app"].type.toLowerCase()!=="card"){c.error("Invalid card manifest. invalid value for sap.app.type, expected card.");r=true}if(!r&&!e["sap.card"]){c.error("Invalid card manifest. sap.card namespace do not exists.");r=true}if(!r&&!e["sap.card"].type){c.error("Invalid card manifest. sap.card.type do not exists.");r=true}var t=["Analytical","List","Table"];if(!r&&t.indexOf(e["sap.card"].type)===-1){c.error("Invalid card manifest. Invalid value for sap.card.type. Supported types: "+t);r=true}if(!r&&!e["sap.insights"]){c.error("Invalid card manifest. sap.insights namespace do not exists.");r=true}if(!r&&!e["sap.insights"].parentAppId){c.error("Invalid card manifest. sap.insights.parentAppId do not exists.");r=true}if(!r&&!e["sap.insights"].cardType){c.error("Invalid card manifest. sap.insights.cardType do not exists.");r=true}if(!r&&e["sap.insights"].cardType!=="RT"){c.error("Invalid card manifest. Invalid value for sap.insights.cardType, supported value is RT");r=true}if(!r&&!e["sap.insights"].versions||!e["sap.insights"].versions.ui5){c.error("Invalid card manifest. Invalid value for sap.insights version");r=true}if(!r&&e["sap.insights"].templateName==="OVP"){var a,i,n,s=false,o=e["sap.card"].type;if(o==="Analytical"){a=e["sap.card"].content.actions||[];i=e["sap.card"].header.actions||[];a=a.filter(function(e){return e.type==="Navigation"&&e.parameters&&e.parameters.ibnTarget&&e.parameters.ibnTarget.semanticObject&&e.parameters.ibnTarget.action});i=i.filter(function(e){return e.type==="Navigation"&&e.parameters&&e.parameters.ibnTarget&&e.parameters.ibnTarget.semanticObject&&e.parameters.ibnTarget.action});if(a.length>0||i.length>0){s=true}if(e["sap.card"].configuration.parameters.state&&e["sap.card"].configuration.parameters.state.value){n=JSON.parse(e["sap.card"].configuration.parameters.state.value);s=P(n)}}if(o==="List"||o==="Table"){a=(o==="List"?e["sap.card"].content.item.actions:e["sap.card"].content.row.actions)||[];i=e["sap.card"].header.actions||[];a=a.filter(function(e){return e.type==="Navigation"});i=i.filter(function(e){return e.type==="Navigation"});if(a.length>0||i.length>0){var d={},p={};if(e["sap.card"].configuration.parameters.headerState&&e["sap.card"].configuration.parameters.headerState.value){d=JSON.parse(e["sap.card"].configuration.parameters.headerState.value)}if(e["sap.card"].configuration.parameters.lineItemState&&e["sap.card"].configuration.parameters.lineItemState.value){p=JSON.parse(e["sap.card"].configuration.parameters.lineItemState.value)}var l=P(d),h=P(p);s=l||h}}if(!s){c.error("Invalid card manifest. Card should have navigation.");r=true}}if(r){throw new Error(u.getText("invalidManifest"))}}var T={localCardCache:{},userCardModel:(new r).setDefaultBindingMode("OneWay"),suggestedCardModel:(new r).setDefaultBindingMode("OneWay"),parentAppDetailsCache:{},_mergeCard:function(e,r){try{w(e)}catch(e){return Promise.reject(e)}return C().then(function(t){return v(e,t,r)}).then(function(e){this.localCardCache={};this.suggestedCardModel.setProperty("/isLoading",false);return e}.bind(this))},createCard:function(e){this.suggestedCardModel.setProperty("/isLoading",true);return this._mergeCard(e,o)},updateCard:function(e){this.suggestedCardModel.setProperty("/isLoading",true);return this._mergeCard(e,d)},deleteCard:function(e){try{y(e)}catch(e){return Promise.reject(e)}this.suggestedCardModel.setProperty("/isLoading",true);return C().then(function(r){return b(e,r)}).then(function(e){this.localCardCache={};this.suggestedCardModel.setProperty("/isLoading",false);return e}.bind(this))},getUserCards:function(){if(this.localCardCache.userCards){return Promise.resolve(this.localCardCache.userCards)}var e=s+"?$orderby=rank";return this._readCard(e).then(function(e){this.localCardCache.userCards=e;return e}.bind(this))},getUserCardModel:function(){return this.getUserCards().then(function(e){var r=e.filter(function(e){return e.visibility});this.userCardModel.setProperty("/cards",e);this.userCardModel.setProperty("/cardCount",e.length);this.userCardModel.setProperty("/visibleCardCount",r.length);return this.userCardModel}.bind(this))},getSuggestedCards:function(){if(this.localCardCache.suggestedCards){return Promise.resolve(this.localCardCache.suggestedCards)}var e=s+"?$filter=visibility eq true&$select=descriptorUrl,visibility,rank&$orderby=rank&$skip=0&$top=10";return this._readCard(e).then(function(e){this.localCardCache.suggestedCards=e;return e}.bind(this))},getSuggestedCardModel:function(){return this.getSuggestedCards().then(function(e){this.suggestedCardModel.setProperty("/cards",e);this.suggestedCardModel.setProperty("/cardCount",e.length);this.suggestedCardModel.setProperty("/isLoading",false);return this.suggestedCardModel}.bind(this))},_readCard:function(e){return fetch(e).then(function(e){if(e.ok){return e.json()}L("Cannot read user's suggested cards.")}).then(function(e){e.value.forEach(function(e){if(e.descriptorContent){e.descriptorContent=JSON.parse(e.descriptorContent)}});return e.value})},setCardsRanking:function(e){this.suggestedCardModel.setProperty("/isLoading",true);return C().then(function(r){return m(e,r)}).then(function(e){this.localCardCache={};this.suggestedCardModel.setProperty("/isLoading",false);return e}.bind(this))},_refreshUserCards:function(e){this.suggestedCardModel.setProperty("/isLoading",true);var r=e?{deleteAllCards:"X"}:{};return new Promise(function(e){fetch(i,{method:"HEAD",headers:{"X-CSRF-Token":"Fetch"}}).then(function(t){var a=t.headers.get("X-CSRF-Token");fetch(i+n+"/com.sap.gateway.srvd.ui2.insights_cards_repo_srv.v0001.deleteCards?",{method:"POST",headers:{"X-CSRF-Token":a,"content-type":"application/json;odata.metadata=minimal;charset=utf-8"},body:JSON.stringify(r)}).then(function(){this.localCardCache={};this.suggestedCardModel.setProperty("/isLoading",false);e()}.bind(this))}.bind(this))}.bind(this))},getParentAppDetails:function(e){if(this.parentAppDetailsCache[e.descriptorContent["sap.app"].id]){return Promise.resolve(this.parentAppDetailsCache[e.descriptorContent["sap.app"].id])}var r={};return sap.ushell.Container.getServiceAsync("ClientSideTargetResolution").then(function(t){var a=t._oAdapter._aInbounds||[];var i=a.find(function(r){return r.resolutionResult&&r.resolutionResult.applicationDependencies&&r.resolutionResult.applicationDependencies.name===e.descriptorContent["sap.insights"].parentAppId});if(i){r.semanticObject=i.semanticObject;r.action=i.action;r.semanticURL="#"+i.semanticObject+"-"+i.action;r.title=e.descriptorContent["sap.app"].title;this.parentAppDetailsCache[e.descriptorContent["sap.app"].id]=r}return r}.bind(this))}};var _={_oViewCache:{},_getLoadLibraryPromise:function(e){var r;switch(e){case p:r=Promise.all([t.loadLibrary("sap.m"),t.loadLibrary("sap.ui.integration"),t.loadLibrary("sap.viz")]);break;case l:case h:r=Promise.all([t.loadLibrary("sap.m"),t.loadLibrary("sap.ui.core"),t.loadLibrary("sap.f"),t.loadLibrary("sap.ui.integration"),t.loadLibrary("sap.ui.layout"),t.loadLibrary("sap.viz")]);break;case f:r=Promise.all([t.loadLibrary("sap.m"),t.loadLibrary("sap.ui.core"),t.loadLibrary("sap.f"),t.loadLibrary("sap.ui.integration"),t.loadLibrary("sap.ui.layout")]);break;default:break}return r},_getXMLView:function(e){return new Promise(function(r,t){if(this._oViewCache[e]){return r(this._oViewCache[e])}return this._getLoadLibraryPromise(e).then(function(){return sap.ui.core.mvc.XMLView.create({viewName:e}).then(function(t){this._oViewCache[e]=t;return r(this._oViewCache[e])}.bind(this))}.bind(this))}.bind(this))},showCardPreview:function(e,r){return this._getXMLView(p).then(function(t){return t.getController().showPreview(e,r)})},_showCardSelectionDialog:function(e){return this._getXMLView(h).then(function(r){return r.getController().showSelectionDialog(e)})}};return{getServiceAsync:function(e){return S().then(function(){if(e==="UIService"){return _}return T}).catch(function(e){return Promise.reject(e)})}}});
//# sourceMappingURL=CardHelper.js.map