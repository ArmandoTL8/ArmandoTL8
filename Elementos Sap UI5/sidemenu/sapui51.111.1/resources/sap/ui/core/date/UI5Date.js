/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/Configuration","sap/ui/core/format/TimezoneUtil"],function(t,e){"use strict";var n=["year","month","day","hour","minute","second","fractionalSecond"],r=/Z|GMT|:.*[\+|\-]|^([\+|\-]\d{2})?\d{4}(-\d{2}){0,2}$/,o=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],i=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],a={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6};function s(t,e){return(t<0?"-":"")+Math.abs(t).toString().padStart(e,"0")}function u(t,e){var o=u._createDateInstance(t);Object.defineProperties(this,{sTimezoneID:{value:e},oDate:{value:o,writable:true},oDateParts:{value:undefined,writable:true}});if(isNaN(o)){return}if(t.length>1||t.length===1&&typeof t[0]==="string"&&!r.test(t[0])){this._setParts(n,[o.getFullYear(),o.getMonth(),o.getDate(),o.getHours(),o.getMinutes(),o.getSeconds(),o.getMilliseconds()])}}u.prototype=Object.create(Date.prototype,{constructor:{value:Date}});u.prototype[Symbol.toStringTag]="Date";u.prototype._getPart=function(t){var n;if(isNaN(this.oDate)){return NaN}this.oDateParts=this.oDateParts||e._getParts(this.oDate,this.sTimezoneID);if(t==="weekday"){return a[this.oDateParts.weekday]}n=parseInt(this.oDateParts[t]);if(t==="month"){n-=1}else if(t==="year"){if(this.oDateParts.era==="B"){n=1-n}}return n};u.prototype._setParts=function(t,n){var r,o,i,a,s,u,c={},h=Math.min(t.length,n.length);if(h===0){return this.setTime(NaN)}for(r=0;r<h;r+=1){u=parseInt(+n[r]);s=t[r];if(isNaN(u)){return this.setTime(NaN)}if(s==="month"){u+=1}else if(s==="year"){if(u<=0){u=1-u;c.era="B"}else{c.era="A"}}c[s]=u.toString()}if(this.oDateParts){o=this.oDateParts}else if(isNaN(this.oDate)){o={day:"1",fractionalSecond:"0",hour:"0",minute:"0",month:"1",second:"0"}}else{o=e._getParts(this.oDate,this.sTimezoneID)}c=Object.assign({},o,c);i=e._getDateFromParts(c);if(isNaN(i)){return this.setTime(NaN)}a=i.getTime()+e.calculateOffset(i,this.sTimezoneID)*1e3;return this.setTime(a)};u.prototype.getDate=function(){return this._getPart("day")};u.prototype.getDay=function(){return this._getPart("weekday")};u.prototype.getFullYear=function(){return this._getPart("year")};u.prototype.getHours=function(){return this._getPart("hour")};u.prototype.getMilliseconds=function(){return this._getPart("fractionalSecond")};u.prototype.getMinutes=function(){return this._getPart("minute")};u.prototype.getMonth=function(){return this._getPart("month")};u.prototype.getSeconds=function(){return this._getPart("second")};u.prototype.getTimezoneOffset=function(){return e.calculateOffset(this.oDate,this.sTimezoneID)/60};u.prototype.getYear=function(){return this._getPart("year")-1900};u.prototype.setDate=function(t){return this._setParts(["day"],arguments)};u.prototype.setFullYear=function(t,e,n){return this._setParts(["year","month","day"],arguments)};u.prototype.setHours=function(t,e,n,r){return this._setParts(["hour","minute","second","fractionalSecond"],arguments)};u.prototype.setMilliseconds=function(t){return this._setParts(["fractionalSecond"],arguments)};u.prototype.setMinutes=function(t,e,n){return this._setParts(["minute","second","fractionalSecond"],arguments)};u.prototype.setMonth=function(t,e){return this._setParts(["month","day"],arguments)};u.prototype.setSeconds=function(t,e){return this._setParts(["second","fractionalSecond"],arguments)};u.prototype.setTime=function(t){this.oDateParts=undefined;return this.oDate.setTime(t)};u.prototype.setYear=function(t){return this._setParts(["year"],[parseInt(t)+1900])};u.prototype.toDateString=function(){if(isNaN(this.oDate)){return this.oDate.toDateString()}return o[this.getDay()]+" "+i[this.getMonth()]+" "+s(this.getDate(),2)+" "+s(this.getFullYear(),4)};u.prototype.toString=function(){if(isNaN(this.oDate)){return this.oDate.toString()}return this.toDateString()+" "+this.toTimeString()};u.prototype.toTimeString=function(){var t,e,n,r;if(isNaN(this.oDate)){return this.oDate.toTimeString()}r=this.getTimezoneOffset();n=r>0?"-":"+";t=Math.floor(Math.abs(r)/60);e=Math.abs(r)%60;return s(this.getHours(),2)+":"+s(this.getMinutes(),2)+":"+s(this.getSeconds(),2)+" GMT"+n+s(t,2)+s(e,2)};["getTime","getUTCDate","getUTCDay","getUTCFullYear","getUTCHours","getUTCMilliseconds","getUTCMinutes","getUTCMonth","getUTCSeconds","setUTCDate","setUTCFullYear","setUTCHours","setUTCMilliseconds","setUTCMinutes","setUTCMonth","setUTCSeconds","toGMTString","toISOString","toJSON","toUTCString","valueOf"].forEach(function(t){u.prototype[t]=function(){return this.oDate[t].apply(this.oDate,arguments)}});["toLocaleDateString","toLocaleString","toLocaleTimeString"].forEach(function(e){u.prototype[e]=function(n,r){return this.oDate[e](n||t.getLanguageTag(),Object.assign({timeZone:this.sTimezoneID},r))}});u._createDateInstance=function(t){if(t[0]instanceof Date){t[0]=t[0].valueOf()}return new(Function.prototype.bind.apply(Date,[].concat.apply([null],t)))};u.getInstance=function(){var n=t.getTimezone();if(n!==e.getLocalTimezone()){return new u(arguments,n)}return u._createDateInstance(arguments)};u.checkDate=function(n){if(isNaN(n.getTime())){throw new Error("The given Date is not valid")}if(!(n instanceof u)&&t.getTimezone()!==e.getLocalTimezone()){throw new Error("Configured time zone requires the parameter 'oDate' to be an instance of"+" sap.ui.core.date.UI5Date")}};return u});
//# sourceMappingURL=UI5Date.js.map