/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
jQuery.sap.declare("sap.uiext.inbox.SubstitutionRulesManagerUtils");sap.uiext.inbox.SubstitutionRulesManagerUtils=function(){throw new Error};sap.uiext.inbox.SubstitutionRulesManagerUtils._getText=function(e,t,i,r,u,n){var T=this._isOutDated(n);var _=!this._isFutureDate(u)&&!T;var a=sap.ui.getCore().getLibraryResourceBundle("sap.uiext.inbox");if(T){return""}else{if(t){if(i){if(_){return e+" "+a.getText("SUBSTIUTION_RULE_CURRENTLY_RECEIVING_TASKS")}else{return e+" "+a.getText("SUBSTIUTION_RULE_WILL_RECEIVE_TASKS_FROM")+" "+this._getFormattedDate(u)}}else{if(r){if(_){return a.getText("SUBSTITUTION_RULE_ENABLE_FOR")+" "+e+" "+a.getText("SUBSTITUTION_RULE_TO_RECIEVE_TASKS")}else{return a.getText("SUBSTITUTION_RULE_ENABLE_FOR")+" "+e+" "+a.getText("SUBSTITUTION_RULE_TO_RECIEVE_TASKS")+" "+a.getText("SUBSTITUTION_RULE_FROM_TXT")+" "+this._getFormattedDate(u)}}else{return e+" "+a.getText("SUBSTIUTION_RULE_HAS_NOT_ACTIVATED_YOUR")}}}else{if(i){if(_){return a.getText("SUBSTIUTION_RULE_CURRENTLY_RECEIVING_TASKS_FROM")+" "+e}else{return a.getText("SUBSTIUTION_RULE_YOU_WILL_RECEIVE_TASKS_FROM")+" "+e+" "+a.getText("SUBSTITUTION_RULE_FROM_TXT")+" "+this._getFormattedDate(u)}}else{if(r){if(_){return a.getText("SUBSTIUTION_RULE_TURN_ON_TO_RECEIVE_TASKS_FROM")+" "+e}else{return a.getText("SUBSTIUTION_RULE_TURN_ON_TO_RECEIVE_TASKS_FROM")+" "+e+" "+a.getText("SUBSTITUTION_RULE_FROM_TXT")+" "+this._getFormattedDate(u)}}else{if(_){return a.getText("SUBSTIUTION_RULE_IS_CURRENTLY_DISABLED_BY")+" "+e}else{return a.getText("SUBSTIUTION_RULE_YOU_WILL_RECEIVE_TASKS_FROM")+" "+e+" "+a.getText("SUBSTITUTION_RULE_FROM_TXT")+" "+this._getFormattedDate(u)}}}}}};sap.uiext.inbox.SubstitutionRulesManagerUtils._isOutDated=function(e){if(e!==null&&e!==""){if(this._getTimeDiff(e)<0){return true}}return false};sap.uiext.inbox.SubstitutionRulesManagerUtils._isFutureDate=function(e){if(e!==null&&e!==""){if(this._getTimeDiff(e)>0&&!this._isCurrentDate(e)){return true}}return false};sap.uiext.inbox.SubstitutionRulesManagerUtils._isCurrentDate=function(e){if(e!==null&&e!==""){var t=new Date;if(t.getDate()==e.getDate()&&t.getMonth()==e.getMonth()&&t.getYear()==e.getYear()){return true}}return false};sap.uiext.inbox.SubstitutionRulesManagerUtils._getStatus=function(e,t,i,r){var u=this._isOutDated(r);var n=!this._isFutureDate(i)&&!u;var T=sap.ui.getCore().getLibraryResourceBundle("sap.uiext.inbox");if(r=="")return"";if(u)return T.getText("SUBSTITUTION_OUT_OF_DATE_RANGE");else{if(t){var _=n?"SUBSTITUTION_RULE_ACTIVE_FOR_LABEL":"SUBSTITUTION_RULE_ACTIVE_IN_LABEL";return T.getText(_)+" "+this._getNoOfDays(n,i,r)}else return T.getText("SUBSTITUTION_DISABLED_STATUS")}};sap.uiext.inbox.SubstitutionRulesManagerUtils._getNoOfDays=function(e,t,i){var r=sap.ui.getCore().getLibraryResourceBundle("sap.uiext.inbox");var u="";if(i!==null&&i!==""){var n=this._getTimeDiff(e?i:t)/(1e3*60*60*24);if(n>1){var T=Math.floor(n);if(T===1){return T+" "+r.getText("SUBSTIUTION_RULE_IN_DAY")}else{return T+" "+r.getText("SUBSTIUTION_RULE_IN_MORE_DAYS")}}else if(n>0){return Math.ceil(n)+" "+r.getText("SUBSTIUTION_RULE_IN_DAY")}}return""};sap.uiext.inbox.SubstitutionRulesManagerUtils._getFormattedDate=function(e){var t=sap.ui.core.format.DateFormat.getDateInstance({style:"medium"});if(e!=undefined&&e!=""){return t.format(e)}};sap.uiext.inbox.SubstitutionRulesManagerUtils._getTodaysDateinYYYYMMDD=function(){var e=new Date;var t=String(e.getFullYear());if(e.getMonth()<9){t=t+"0"}t=t+String(e.getMonth()+1);if(e.getDate()<9){t=t+"0"}t=t+String(e.getDate());return t};sap.uiext.inbox.SubstitutionRulesManagerUtils._getTodaysDate=function(){var e=new Date;return e};sap.uiext.inbox.SubstitutionRulesManagerUtils._getTimeDiff=function(e){var t=new Date;var i=t.getTimezoneOffset()*60*1e3;var r=new Date(e.getFullYear(),e.getMonth(),e.getDate(),24,0,0);var u=r.getTime()-t.getTime();return u};sap.uiext.inbox.SubstitutionRulesManagerUtils._getTimeZoneOffset=function(){return undefined};
//# sourceMappingURL=SubstitutionRulesManagerUtils.js.map