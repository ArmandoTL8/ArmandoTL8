/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
sap.ui.define(["sap/apf/core/utils/checkForTimeout","sap/ui/model/odata/ODataUtils"],function(e,t){"use strict";var s=function(s){var a={};var i=s&&s.functions&&s.functions.ajax;var n=s&&s.functions&&s.functions.getSapSystem&&s.functions.getSapSystem();this.check=function(s,r){if(n&&!r){s=t.setOrigin(s,{force:true,alias:n})}if(a[s]!==undefined){return a[s]}var u=false;var f={url:s,type:"HEAD",success:function(t,s,a){var i=e(a);if(i===undefined){u=true}else{u=false}},error:function(){u=false},async:false};if(i){i(f)}else{jQuery.ajax(f)}a[s]=u;return u}};sap.apf.core.utils.FileExists=s;return s},true);
//# sourceMappingURL=fileExists.js.map