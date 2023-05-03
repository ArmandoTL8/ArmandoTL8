/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/core/format/DateFormat","sap/ui/thirdparty/d3"],function(t){"use strict";var e=function(){throw new Error};e._oDefaultDateTimeFormat=t.getDateTimeInstance();e.abapTimestampToDate=function(t){if(typeof t==="string"){var e=new Date(t.substr(0,4),parseInt(t.substr(4,2),0)-1,t.substr(6,2),t.substr(8,2),t.substr(10,2),t.substr(12,2));if(!jQuery.isNumeric(e.getTime())){e=new Date(t);if(!isNaN(e.getTime())&&e.toISOString()===t){return this.abapTimestampToDate(this.isoTimestampToAbapTimestamp(t))}}return e}else if(jQuery.type(t)==="date"){return t}return null};e.isoTimestampToAbapTimestamp=function(t){if(t){var e=new Date(t);return""+e.getUTCFullYear()+(e.getUTCMonth()<9?"0":"")+(e.getUTCMonth()+1)+(e.getUTCDate()<10?"0":"")+e.getUTCDate()+(e.getUTCHours()<10?"0":"")+e.getUTCHours()+(e.getUTCMinutes()<10?"0":"")+e.getUTCMinutes()+(e.getUTCSeconds()<10?"0":"")+e.getUTCSeconds()}return""};e.dateToAbapTimestamp=function(t){if(t){return""+t.getFullYear()+(t.getMonth()<9?"0":"")+(t.getMonth()+1)+(t.getDate()<10?"0":"")+t.getDate()+(t.getHours()<10?"0":"")+t.getHours()+(t.getMinutes()<10?"0":"")+t.getMinutes()+(t.getSeconds()<10?"0":"")+t.getSeconds()}return""};e.abapTimestampToTimeLabel=function(t,e){var a=sap.gantt.misc.Format._convertUTCToLocalTime(t,e);var r=sap.gantt.misc.Format._oDefaultDateTimeFormat.format(a);return r};e.relativeTimeToAbsolutTime=function(t,e,a,r){t=t!==undefined?t:0;e=e!==undefined?e:0;a=a!==undefined?a:0;r=r!==undefined?r:0;var i=this.abapTimestampToDate("20120101000000");var n=new Date;n.setTime(i.getTime()+r*1e3+a*60*1e3+e*3600*1e3+t*24*3600*1e3);return n};e.absolutTimeToRelativeTime=function(t){var e=this.abapTimestampToDate("20120101000000");var a=t.getTime()-e.getTime();var r=Math.floor(a/(24*3600*1e3));var i=a%(24*3600*1e3);var n=Math.floor(i/(3600*1e3));i=i%(3600*1e3);var o=Math.floor(i/(60*1e3));i=i%(60*1e3);var s=Math.floor(i/1e3);var m={intervalDays:r,intervalHours:n,intervalMinutes:o,intervalSecond:s};return m};e._convertUTCToLocalTime=function(t,e){var a=0;if(e&&e.getUtcdiff()){var r=this.getTimeStampFormatter();a=Math.round((r.parse("20000101"+e.getUtcdiff()).getTime()-r.parse("20000101000000").getTime())/1e3);if(e.getUtcsign()==="-"){a=-a}}var i=sap.gantt.misc.Format.abapTimestampToDate(t);var n=d3.time.second.offset(i,a);var o=e.getDstHorizons();if(o.length>0){for(var s=0;s<o.length;s++){var m=sap.gantt.misc.Format.abapTimestampToDate(o[s].getStartTime());var T=sap.gantt.misc.Format.abapTimestampToDate(o[s].getEndTime());if(n>=m&&n<=T){n=d3.time.second.offset(n,60*60)}}}return n};e.getTimeStampFormatter=function(){return d3.time.format("%Y%m%d%H%M%S")};return e},true);
//# sourceMappingURL=Format.js.map