/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){function e(e,t,r){if(r){return t?t(e):e}if(!e||!e.then){e=Promise.resolve(e)}return t?e.then(t):e}sap.ui.define(["../i18n","./SinaBaseSuggestionProvider","./SinaObjectSuggestionFormatter","./SuggestionType","sap/esh/search/ui/SearchHelper","../sinaNexTS/sina/SearchResultSetItemAttribute"],function(t,r,i,a,s,o){function n(e){return e&&e.__esModule&&typeof e.default!=="undefined"?e.default:e}function u(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),r.push.apply(r,i)}return r}function c(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?u(Object(r),!0).forEach(function(t){g(e,t,r[t])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):u(Object(r)).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))})}return e}function g(e,t,r){if(t in e){Object.defineProperty(e,t,{value:r,enumerable:true,configurable:true,writable:true})}else{e[t]=r}return e}function l(e,t){if(!(e instanceof t)){throw new TypeError("Cannot call a class as a function")}}function f(e,t){for(var r=0;r<t.length;r++){var i=t[r];i.enumerable=i.enumerable||false;i.configurable=true;if("value"in i)i.writable=true;Object.defineProperty(e,i.key,i)}}function h(e,t,r){if(t)f(e.prototype,t);if(r)f(e,r);Object.defineProperty(e,"prototype",{writable:false});return e}function S(e,t){if(typeof t!=="function"&&t!==null){throw new TypeError("Super expression must either be null or a function")}e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:true,configurable:true}});Object.defineProperty(e,"prototype",{writable:false});if(t)d(e,t)}function d(e,t){d=Object.setPrototypeOf?Object.setPrototypeOf.bind():function e(t,r){t.__proto__=r;return t};return d(e,t)}function p(e){var t=b();return function r(){var i=v(e),a;if(t){var s=v(this).constructor;a=Reflect.construct(i,arguments,s)}else{a=i.apply(this,arguments)}return y(this,a)}}function y(e,t){if(t&&(typeof t==="object"||typeof t==="function")){return t}else if(t!==void 0){throw new TypeError("Derived constructors may only return object or undefined")}return m(e)}function m(e){if(e===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return e}function b(){if(typeof Reflect==="undefined"||!Reflect.construct)return false;if(Reflect.construct.sham)return false;if(typeof Proxy==="function")return true;try{Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){}));return true}catch(e){return false}}function v(e){v=Object.setPrototypeOf?Object.getPrototypeOf.bind():function e(t){return t.__proto__||Object.getPrototypeOf(t)};return v(e)}var D=n(t);var T=n(r);var O=n(i);var j=a["Type"];var k=a["SuggestionType"];var P=o["SearchResultSetItemAttribute"];var w=function(t){S(i,t);var r=p(i);function i(e){var t;l(this,i);t=r.call(this,e.sinaNext);t.model=e.model;t.suggestionTypes=e.suggestionTypes;t.suggestionHandler=e.suggestionHandler;t.suggestionLimit=sap.ui.Device.system.phone?5:7;t.suggestionStartingCharacters=t.model.config.suggestionStartingCharacters;t.sinaObjectSuggestionFormatter=new O;return t}h(i,[{key:"abortSuggestions",value:function e(){this.suggestionQuery.abort()}},{key:"getSuggestions",value:function t(r){try{const t=this;t.suggestions=[];t.firstObjectDataSuggestion=true;t.numberSuggestionsByType={};for(var i=0;i<k.types.length;++i){var a=k.types[i];t.numberSuggestionsByType[a]=0}var s=r.searchTerm;if(t.suggestionTypes.length===1&&t.suggestionTypes.indexOf(j.SearchTermData)>=0&&s.length<t.suggestionStartingCharacters){return Promise.resolve(t.suggestions)}if(t.suggestionTypes.length===1&&t.suggestionTypes.indexOf(j.Object)>=0&&s.length<t.suggestionStartingCharacters){return Promise.resolve(t.suggestions)}if(t.suggestionTypes.length===1&&t.suggestionTypes.indexOf(j.DataSource)>=0&&t.model.getDataSource()!==t.model.sinaNext.allDataSource&&t.model.getDataSource()!==t.model.favDataSource){return Promise.resolve(t.suggestions)}t.createAllAndAppDsSuggestions();if(!t.model.config.searchBusinessObjects){return Promise.resolve(t.suggestions)}if(t.model.getDataSource()===t.model.appDataSource){return Promise.resolve(t.suggestions)}t.prepareSuggestionQuery(r);return e(t.suggestionQuery.getResultSetAsync(),function(e){var r=e.items;t.formatSinaSuggestions(r);return t.suggestions})}catch(e){return Promise.reject(e)}}},{key:"createAllAndAppDsSuggestions",value:function e(){if(this.suggestionTypes.indexOf(j.DataSource)<0){return}if(this.model.getDataSource()!==this.model.allDataSource&&this.model.getDataSource()!==this.model.favDataSource){return}var t=[];if(this.model.getDataSource()===this.model.allDataSource){t.unshift(this.model.appDataSource);t.unshift(this.model.allDataSource)}if(this.model.getDataSource()===this.model.favDataSource){if(this.model.favDataSource.includeApps){t.unshift(this.model.appDataSource)}t.unshift(this.model.favDataSource)}var r=this.model.getProperty("/uiFilter/searchTerm");var i=r.replace(/\*/g,"");var a=new s.Tester(i);for(var o=0;o<t.length;++o){var n=t[o];if(n.id===this.model.getDataSource().id){continue}var u=a.test(n.label);if(u.bMatch===true){if(this.isSuggestionLimitReached(j.DataSource)){return}var c={sina:this.sinaNext,label:"<i>"+D.getText("searchInPlaceholder",[""])+"</i> "+u.sHighlightedText,dataSource:n,position:k.properties.DataSource.position,type:this.sinaNext.SuggestionType.DataSource,calculationMode:this.sinaNext.SuggestionCalculationMode.Data,uiSuggestionType:j.DataSource};this.addSuggestion(c)}}}},{key:"isSuggestionLimitReached",value:function e(t){var r=this.suggestionHandler.getSuggestionLimit(t);var i=this.numberSuggestionsByType[t];if(i>=r){return true}return false}},{key:"preFormatSuggestions",value:function e(t){for(var r=0;r<t.length;++r){var i=t[r];var a=i;a.uiSuggestionType=this.getSuggestionType(i);a.position=k.properties[a.uiSuggestionType].position;this.assembleKey(a);if(a.childSuggestions){this.preFormatSuggestions(a.childSuggestions)}}}},{key:"assembleKey",value:function e(t){switch(t.uiSuggestionType){case j.DataSource:t.key=j.DataSource+t.dataSource.id;break;case j.SearchTermData:t.key=j.SearchTermData+t.searchTerm;if(t.dataSource){t.key+=t.dataSource.id}break;case j.SearchTermHistory:t.key=j.SearchTermData+t.searchTerm;if(t.dataSource){t.key+=t.dataSource.id}break;case j.Object:{var r=t.object.detailAttributes[0];if(r instanceof P){var i=r.value;t.key=j.Object+i}break}}}},{key:"formatSinaSuggestions",value:function e(t){this.preFormatSuggestions(t);for(var r=0;r<t.length;++r){var i=t[r];if(this.isSuggestionLimitReached(i.uiSuggestionType)){continue}switch(i.uiSuggestionType){case j.DataSource:if(this.model.getDataSource()!==this.model.allDataSource&&this.model.getDataSource()!==this.model.favDataSource){continue}this.addSuggestion(i);break;case j.SearchTermData:this.formatSearchTermDataSuggestion(i);break;case j.SearchTermHistory:this.addSuggestion(i);break;case j.Object:case j.Transaction:{var a=c(c({},i),{},{dataSource:i.object.dataSource,object:i.object});this.sinaObjectSuggestionFormatter.format(this,a);break}default:break}}return this.suggestions}},{key:"addSuggestion",value:function e(t){this.suggestions.push(t);this.numberSuggestionsByType[t.uiSuggestionType]+=1}},{key:"formatSearchTermDataSuggestion",value:function e(t){if(this.model.getDataSource()===this.model.allDataSource){if(this.firstObjectDataSuggestion){this.firstObjectDataSuggestion=false;if(t.childSuggestions.length>0){t.label=this.assembleSearchInSuggestionLabel(t);t.grouped=true;this.addSuggestion(t);this.addChildSuggestions(t)}else{this.addSuggestion(t)}}else{this.addSuggestion(t)}}else{this.addSuggestion(t)}}},{key:"addChildSuggestions",value:function e(t){for(var r=0;r<Math.min(2,t.childSuggestions.length);++r){if(this.isSuggestionLimitReached(j.SearchTermData)){return}var i=t.childSuggestions[r];i.label=this.assembleSearchInSuggestionLabel(i);i.grouped=true;this.addSuggestion(i)}}},{key:"assembleSearchInSuggestionLabel",value:function e(t){return D.getText("resultsIn",["<span>"+t.label+"</span>",t.filter.dataSource.labelPlural])}},{key:"getSuggestionType",value:function e(t){switch(t.type){case this.sinaNext.SuggestionType.SearchTerm:if(t.calculationMode===this.sinaNext.SuggestionCalculationMode.History){return j.SearchTermHistory}return j.SearchTermData;case this.sinaNext.SuggestionType.SearchTermAndDataSource:if(t.calculationMode===this.sinaNext.SuggestionCalculationMode.History){return j.SearchTermHistory}return j.SearchTermData;case this.sinaNext.SuggestionType.DataSource:return j.DataSource;case this.sinaNext.SuggestionType.Object:return j.Object}}}]);return i}(T);return w})})();
//# sourceMappingURL=SinaSuggestionProvider.js.map