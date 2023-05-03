/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./CalendarContentRenderer","sap/ui/core/ResizeHandler","sap/ui/integration/library","sap/ui/integration/cards/BaseContent","sap/ui/integration/util/BindingHelper","sap/ui/integration/util/BindingResolver","sap/f/CalendarAppointmentInCard","sap/f/CalendarInCard","sap/f/PlanningCalendarInCardLegend","sap/m/library","sap/m/Button","sap/m/FlexBox","sap/ui/core/format/DateFormat","sap/ui/core/Locale","sap/ui/core/LocaleData","sap/ui/model/Filter","sap/ui/model/FilterOperator","sap/ui/unified/calendar/CalendarDate","sap/ui/unified/calendar/CalendarUtils","sap/ui/unified/DateTypeRange","sap/ui/core/date/UniversalDate","sap/ui/unified/CalendarLegendItem","sap/ui/core/Configuration"],function(t,e,a,i,n,s,o,r,l,p,d,m,h,g,u,c,_,f,D,y,C,I,A){"use strict";var T=a.CardActionArea;var S=i.extend("sap.ui.integration.cards.CalendarContent",{renderer:t,metadata:{library:"sap.ui.integration",properties:{visibleAppointmentsCount:{type:"int",group:"Data",defaultValue:2},noAppointmentsText:{type:"string",group:"Misc",defaultValue:null}},aggregations:{appointments:{type:"sap.f.CalendarAppointmentInCard",multiple:true,singularName:"appointment"}}}});S.prototype._createCardContent=function(){this._oCalendar=new r(this.getId()+"-navigation",{startDateChange:function(t){var e=t.getSource()._getFocusedDate().toLocalJSDate();this._handleStartDateChange(e)}.bind(this),select:function(t){var e=t.getSource().getSelectedDates()[0].getStartDate();this._setParameters(t,t.getParameter("startDate"));this._refreshVisibleAppointments(e);this.invalidate();this._handleSelect(e)}.bind(this)});this._oLegend=new l(this.getId()+"-legend",{columnWidth:"7.5rem",standardItems:[]});this._oCalendar.setLegend(this._oLegend);this._oContent=new m(this.getId()+"-wrapper",{items:[this._oCalendar,this._oLegend]});this.setAggregation("_content",this._oContent);this._oFormatAria=h.getDateTimeInstance({pattern:"EEEE dd/MM/YYYY 'at' "+L.call(this).getTimePattern("medium")})};S.prototype.init=function(){this._aVisibleAppointments=[];i.prototype.init.apply(this,arguments);this._createCardContent()};S.prototype.exit=function(){if(this._sTwoColumnsResizeListener){e.deregister(this._sTwoColumnsResizeListener);this._sTwoColumnsResizeListener=undefined}i.prototype.exit.apply(this,arguments);if(this._oAppointmentTemplate){this._oAppointmentTemplate.destroy();this._oAppointmentTemplate=null}if(this._oSpecialDateTemplate){this._oSpecialDateTemplate.destroy();this._oSpecialDateTemplate=null}if(this._oCalendarLegendItemTemplate){this._oCalendarLegendItemTemplate.destroy();this._oCalendarLegendItemTemplate=null}if(this._oAppointmentLegendItemTemplate){this._oAppointmentLegendItemTemplate.destroy();this._oAppointmentLegendItemTemplate=null}if(this._bDataInitiallyLoaded){this._bDataInitiallyLoaded=null}};S.prototype.onDataChanged=function(){var t=this._oCalendar.getSelectedDates()[0]&&this._oCalendar.getSelectedDates()[0].getStartDate();if(!t){return}if(!this._bDataInitiallyLoaded){this._handleSelect(t);this._handleStartDateChange(t);this._bDataInitiallyLoaded=true}this._setParameters();this._refreshVisibleAppointments(t);this.invalidate()};S.prototype.onBeforeRendering=function(){i.prototype.onBeforeRendering.apply(this,arguments);var t=this._oCalendar.getSelectedDates().length?this._oCalendar.getSelectedDates()[0].getStartDate():this._oCalendar.getStartDate();this._setParameters();this._refreshVisibleAppointments(t);this.getModel("parameters").setProperty("/visibleItems",this._iVisibleItems);this.getModel("parameters").setProperty("/allItems",this._iAllItems)};S.prototype.onAfterRendering=function(){i.prototype.onAfterRendering.call(this,arguments);if(!this._sTwoColumnsResizeListener){this._sTwoColumnsResizeListener=e.register(this,this.resizeHandler);this.resizeHandler({control:this,target:this.getDomRef()})}};S.prototype.resizeHandler=function(t){t.control.toggleStyleClass("sapMPCInCardTwoColumns",t.target.getBoundingClientRect().width>576)};S.prototype.setConfiguration=function(t){i.prototype.setConfiguration.apply(this,arguments);t=this.getParsedConfiguration();this.fireEvent("_actionContentReady");if(!t){return this}if(t.item){this._addItem(t.item)}if(t.specialDate){this._addSpecialDate(t.specialDate)}if(t.legendItem){this._addLegendItem(t.legendItem)}if(t.date){this._addDate(t.date)}if(t.maxItems){this._addMaxItems(t.maxItems)}if(t.maxLegendItems){this._addMaxLegendItems(t.maxLegendItems)}if(t.noItemsText){this._addNoItemsText(t.noItemsText)}if(t.moreItems&&t.moreItems.actions){this._oActions.attach({area:T.Content,actions:t.moreItems.actions,control:this._getMoreButton()})}return this};S.prototype._setParameters=function(t,e){var a,i,n,s,o;if(e){a=e}else if(this._oCalendar.getSelectedDates().length){a=this._oCalendar.getSelectedDates()[0].getStartDate()}else{a=this._oCalendar.getStartDate()}i=new Date(a.getFullYear(),a.getMonth(),a.getDate()).getTime();n=new Date(a.getFullYear(),a.getMonth(),a.getDate()+1).getTime();s=this.getAppointments();if(s){o=s.filter(function(t){var e=t.getStartDate().getTime(),a=t.getEndDate().getTime();if(e>=i&&e<n||a>i&&a<=n||e<i&&a>n){return t}})}else{o=[]}this._iAllItems=o.length;this._iMaxItems=this.getVisibleAppointmentsCount();this._iVisibleItems=Math.min(this._iMaxItems,this._iAllItems);if(this.getModel("parameters")){this.getModel("parameters").setProperty("/visibleItems",this._iVisibleItems);this.getModel("parameters").setProperty("/allItems",this._iAllItems)}};S.prototype._refreshVisibleAppointments=function(t){this._aVisibleAppointments=this._calculateVisibleAppointments(this.getAppointments(),t)};S.prototype._calculateVisibleAppointments=function(t,e){var a=this._isAppointmentInSelectedDate(e);var i=function(t,a){var i=t.getEndDate(),n=new Date;if(e.getDate()===n.getDate()&&e.getMonth()===n.getMonth()&&e.getFullYear()===n.getFullYear()){return this._iAllItems-a<this._iVisibleItems||i.getTime()>n.getTime()}return true};var n=t.filter(a,this).sort(this._sortByStartHourCB).filter(i,this).slice(0,this._iVisibleItems);return n};S.prototype._sortByStartHourCB=function(t,e){return t.getStartDate().getTime()-e.getStartDate().getTime()||e.getEndDate().getTime()-t.getEndDate().getTime()};S.prototype._isAppointmentInSelectedDate=function(t){return function(e){var a=e.getStartDate().getTime(),i=e.getEndDate().getTime(),n=t.getTime(),s=C.getInstance(new Date(t.getTime())),o,r,l,p;s.setDate(s.getDate()+1);o=s.getTime()-1e3;r=a<n&&i>o;l=a>=n&&a<o;p=i>n&&i<=o;return r||l||p}};S.prototype._getVisibleAppointments=function(){return this._aVisibleAppointments};S.prototype.formatDate=function(t){var e=h.getDateTimeInstance({pattern:"yyyy-MM-dd'T'HH:mm:ss.SSSXXX"}).parse(t);if(!e){e=h.getInstance({pattern:"yyyy-MM-dd"}).parse(t)}return e};S.prototype._addItem=function(t){var e={title:t.template.title,text:t.template.text,type:t.template.type},a;if(t.template.startDate){e.startDate=n.formattedProperty(t.template.startDate,this.formatDate)}if(t.template.endDate){e.endDate=n.formattedProperty(t.template.endDate,this.formatDate)}if(t.template.icon&&t.template.icon.src){e.icon=n.formattedProperty(t.template.icon.src,function(t){return this._oIconFormatter.formatSrc(t)}.bind(this))}this._oAppointmentTemplate=new o(e);var i=this.getActions();i.attach({area:T.ContentItem,actions:t.template.actions,control:this,actionControl:this._oAppointmentTemplate,enabledPropertyName:"clickable",enabledPropertyValue:true,disabledPropertyValue:false});a={path:t.path,template:this._oAppointmentTemplate};this._bindAggregationToControl("appointments",this,a)};S.prototype._addSpecialDate=function(t){var e=t.template,a;if(e.startDate){e.startDate=n.formattedProperty(e.startDate,this.formatDate)}if(e.endDate){e.endDate=n.formattedProperty(e.endDate,this.formatDate)}this._oSpecialDateTemplate=new y(e);a={path:t.path,template:this._oSpecialDateTemplate};this._bindAggregationToControl("specialDates",this._oCalendar,a)};S.prototype._addLegendItem=function(t){var e={text:t.template.text,type:t.template.type},a={text:t.template.text,type:t.template.type},i,n;this._oCalendarLegendItemTemplate=new I(e);i={path:t.path,template:this._oCalendarLegendItemTemplate,filters:new c({path:"category",operator:_.Contains,value1:"calendar"})};this._bindAggregationToControl("items",this._oLegend,i);this._oAppointmentLegendItemTemplate=new I(a);n={path:t.path,template:this._oAppointmentLegendItemTemplate,filters:new c({path:"category",operator:_.Contains,value1:"appointment"})};this._bindAggregationToControl("appointmentItems",this._oLegend,n)};S.prototype._addDate=function(t){if(s.isBindingInfo(t)){if(!t){return}var e=new y;e.bindProperty("startDate",n.formattedProperty(t,this.formatDate));this._oCalendar.addSelectedDate(e)}else{this._oCalendar.addSelectedDate(new y({startDate:this.formatDate(t)}));var a=this.formatDate(t);this._handleSelect(a);this._handleStartDateChange(a);this._bDataInitiallyLoaded=true}};S.prototype._addMaxItems=function(t){if(s.isBindingInfo(t)){t&&this.bindProperty("visibleAppointmentsCount",t)}else{this.setVisibleAppointmentsCount(t)}};S.prototype._addMaxLegendItems=function(t){if(s.isBindingInfo(t)){t&&this._oLegend.bindProperty("visibleLegendItemsCount",t)}else{this._oLegend.setVisibleLegendItemsCount(t)}};S.prototype._addNoItemsText=function(t){if(s.isBindingInfo(t)){t&&this.bindProperty("noAppointmentsText",t)}else{this.setNoAppointmentsText(t)}};S.prototype._getMoreButton=function(){if(!this._oMoreAppsButton){this._oMoreAppsButton=new d({text:"More"})}return this._oMoreAppsButton};S.prototype._bNeedForMoreButton=function(){return this._iAllItems>this.getVisibleAppointmentsCount()};S.prototype._getCurrentAppointment=function(){var t=this._getVisibleAppointments(),e=new Date,a,i,n,s,o=this._oCalendar.getSelectedDates().length?this._oCalendar.getSelectedDates()[0].getStartDate():this._oCalendar.getStartDate();if(o.getDate()===e.getDate()&&o.getMonth()===e.getMonth()&&o.getFullYear()===e.getFullYear()){for(s=t.length-1;s>=0;s--){a=t[s];i=a.getStartDate().getTime();n=a.getEndDate().getTime();if(e.getTime()>i&&e.getTime()<n){return a}}}};S.prototype._handleStartDateChange=function(t){var e=this.getActions(),a=f.fromLocalJSDate(t),i=D._getFirstDateOfWeek(D._getFirstDateOfMonth(a)),n=new f(t.getFullYear(),t.getMonth()+1,1),s;n.setDate(n.getDate()-1);s=D._getFirstDateOfWeek(n);s.setDate(s.getDate()+6);e.fireAction(this,"MonthChange",{firstDate:i.toLocalJSDate(),lastDate:s.toLocalJSDate()})};S.prototype._handleSelect=function(t){var e=this.getActions();e.fireAction(this,"DateChange",{selectedDate:t})};function L(){if(!this._oLocaleData){var t=b.call(this);var e=new g(t);this._oLocaleData=u.getInstance(e)}return this._oLocaleData}function b(){if(!this._sLocale){this._sLocale=A.getFormatSettings().getFormatLocale().toString()}return this._sLocale}return S});
//# sourceMappingURL=CalendarContent.js.map