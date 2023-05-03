/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){function e(e,r,t){if(t){return r?r(e):e}if(!e||!e.then){e=Promise.resolve(e)}return r?e.then(r):e}sap.ui.define(["./SearchUrlParserInav2","./SearchHelper","./i18n","sap/m/MessageBox"],function(r,t,a,o){function s(e){return e&&e.__esModule&&typeof e.default!=="undefined"?e.default:e}function i(e,r){if(!(e instanceof r)){throw new TypeError("Cannot call a class as a function")}}function n(e,r){for(var t=0;t<r.length;t++){var a=r[t];a.enumerable=a.enumerable||false;a.configurable=true;if("value"in a)a.writable=true;Object.defineProperty(e,a.key,a)}}function l(e,r,t){if(r)n(e.prototype,r);if(t)n(e,t);Object.defineProperty(e,"prototype",{writable:false});return e}var d=s(r);var u=s(a);var c=o["Icon"];var f=o["Action"];var m=function(){function r(e){i(this,r);this.model=e.model;this.urlParserInav2=new d(e)}l(r,[{key:"parse",value:function r(){try{const r=arguments,o=this;var a=r.length>0&&r[0]!==undefined?r[0]:true;if(!o.model.config.isSearchUrl(t.getHashFromUrl())){return Promise.resolve(undefined)}if(!t.hasher.hasChanged()){return Promise.resolve(undefined)}return e(o.model.initAsync(),function(){var e=t.getUrlParameters();if($.isEmptyObject(e)){return undefined}if(e.datasource||e.searchterm){if(!e.datasource||o.isJson(e.datasource)){return o.urlParserInav2.parseUrlParameters(e)}}e=o.model.config.parseSearchUrlParameters(e);if(e.datasource&&!o.isJson(e.datasource)&&e.searchterm){o.parseSimplifiedUrlParameters(e)}else{o.parseUrlParameters(e)}o.model.setProperty("/searchTermPlaceholder",o.model.calculatePlaceholder());o.model.calculateSearchButtonStatus();if(a){o.model._firePerspectiveQuery({deserialization:true})}})}catch(e){return Promise.reject(e)}}},{key:"isJson",value:function e(r){return r.indexOf("{")>=0&&r.indexOf("}")>=0}},{key:"parseSimplifiedUrlParameters",value:function e(r){if(r.top){var t=parseInt(r.top,10);this.model.setTop(t,false)}var a=this.model.sinaNext.createFilter();a.setSearchTerm(r.searchterm);var o=this.model.sinaNext.getDataSource(r.datasource);if(!o){o=this.model.sinaNext.allDataSource}a.setDataSource(o);this.model.setProperty("/uiFilter",a);this.model.setDataSource(a.dataSource,false,false)}},{key:"parseUrlParameters",value:function e(r){if(r.top){var t=parseInt(r.top,10);this.model.setTop(t,false)}if(r.orderby&&r.sortorder){var a={orderBy:decodeURIComponent(r.orderby),sortOrder:r.sortorder};this.model.setOrderBy(a,false)}else{this.model.resetOrderBy(false)}var s;if(r.filter){try{var i=JSON.parse(r.filter);s=this.model.sinaNext.parseFilterFromJson(i);this.model.setProperty("/uiFilter",s);this.model.setDataSource(s.dataSource,false,false)}catch(e){o.show(u.getText("searchUrlParsingErrorLong")+"\n("+e.toString()+")",{icon:c.ERROR,title:u.getText("searchUrlParsingError"),actions:[f.OK]})}}}},{key:"render",value:function e(){return this.renderFromParameters(this.model.getTop(),this.model.getProperty("/uiFilter"),true,this.model.getOrderBy())}},{key:"renderFromParameters",value:function e(r,t,a,o){var s={top:r.toString(),filter:a?encodeURIComponent(JSON.stringify(t.toJson())):JSON.stringify(t.toJson())};if(this.model.config.FF_sortOrderInUrl&&o&&Object.keys(o).length>0){if(o.orderBy){s.orderby=encodeURIComponent(o.orderBy)}if(o.sortOrder){s.sortorder=o.sortOrder}}return this.model.config.renderSearchUrl(s)}}]);return r}();return m})})();
//# sourceMappingURL=SearchUrlParser.js.map