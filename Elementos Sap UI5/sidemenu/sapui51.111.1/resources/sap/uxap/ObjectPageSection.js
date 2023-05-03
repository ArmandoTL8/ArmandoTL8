/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./ObjectPageSectionBase","sap/ui/Device","sap/m/Button","sap/ui/core/ResizeHandler","sap/ui/core/StashedControlSupport","sap/ui/base/ManagedObjectObserver","./ObjectPageSubSection","./library","sap/m/library","./ObjectPageSectionRenderer"],function(t,e,i,o,n,s,r,a,u,l){"use strict";var p=u.ButtonType;var d=t.extend("sap.uxap.ObjectPageSection",{metadata:{library:"sap.uxap",properties:{showTitle:{type:"boolean",group:"Appearance",defaultValue:true},titleUppercase:{type:"boolean",group:"Appearance",defaultValue:true},wrapTitle:{type:"boolean",group:"Appearance",defaultValue:false}},defaultAggregation:"subSections",aggregations:{subSections:{type:"sap.uxap.ObjectPageSubSection",multiple:true,singularName:"subSection",forwarding:{getter:"_getGrid",aggregation:"content"}},heading:{type:"sap.ui.core.Control",multiple:false},_showHideAllButton:{type:"sap.m.Button",multiple:false,visibility:"hidden"},_showHideButton:{type:"sap.m.Button",multiple:false,visibility:"hidden"}},associations:{selectedSubSection:{type:"sap.uxap.ObjectPageSubSection",multiple:false}},designtime:"sap/uxap/designtime/ObjectPageSection.designtime"},renderer:l});d.MEDIA_RANGE=e.media.RANGESETS.SAP_STANDARD;d._getClosestSection=function(t){var e=typeof t==="string"&&sap.ui.getCore().byId(t)||t;return e instanceof r?e.getParent():e};d._getLibraryResourceBundle=function(){return sap.ui.getCore().getLibraryResourceBundle("sap.uxap")};d.prototype.getSectionText=function(t){return d._getLibraryResourceBundle().getText("SECTION_CONTROL_NAME")};d.prototype._expandSection=function(){t.prototype._expandSection.call(this)._updateShowHideAllButton(!this._thereAreHiddenSubSections())};d.prototype.init=function(){t.prototype.init.call(this);this._sContainerSelector=".sapUxAPObjectPageSectionContainer";this._onResizeRef=this._onResize.bind(this);this._oGridContentObserver=new s(this._onGridContentChange.bind(this))};d.prototype.exit=function(){this._detachMediaContainerWidthChange(this._updateImportance,this);if(this._iResizeHandlerId){o.deregister(this._iResizeHandlerId);this._iResizeHandlerId=null}if(t.prototype.exit){t.prototype.exit.call(this)}};d.prototype._onResize=function(){this._updateMultilineContent()};d.prototype._getImportanceLevelToHide=function(t){var e=this._getObjectPageLayout(),i=t||this._getCurrentMediaContainerRange(),o=e&&e.getShowOnlyHighImportance();return this._determineTheLowestLevelOfImportanceToShow(i.name,o)};d.prototype._updateImportance=function(t){var e=this._getObjectPageLayout(),i=this._getImportanceLevelToHide(t),o=this.bOutput&&this.getDomRef("header");this.getSubSections().forEach(function(t){t._applyImportanceRules(i)});this._applyImportanceRules(i);this._updateShowHideAllButton(false);o&&o.classList.toggle("sapUxAPObjectPageSectionHeaderHidden",!this._isTitleVisible());o&&o.setAttribute("aria-hidden",!this._isTitleVisible());if(e&&this.getDomRef()){e._requestAdjustLayout()}};d.prototype._updateMultilineContent=function(){var t=this.getSubSections(),e=t.find(function(t){return t.getVisible()});if(e&&e.getDomRef()){var i=e._getTitleDomId(),o,n,s,r,a;if(!i){return}a=document.getElementById(e._getTitleDomId());o=a?a.offsetWidth:0;n=this.$().find(".sapUxAPObjectPageSubSectionHeaderActions").width();s=this.$("header").width();r=o+n>s;e._toggleMultiLineSectionContent(r)}};d.prototype._determineTheLowestLevelOfImportanceToShow=function(t,e){if(e||t==="Phone"){return a.Importance.High}if(t==="Tablet"){return a.Importance.Medium}return a.Importance.Low};d.prototype.connectToModels=function(){this.getSubSections().forEach(function(t){t.connectToModels()})};d.prototype._allowPropagationToLoadedViews=function(t){this.getSubSections().forEach(function(e){e._allowPropagationToLoadedViews(t)})};d.prototype.onBeforeRendering=function(){t.prototype.onBeforeRendering.call(this);this._detachMediaContainerWidthChange(this._updateImportance,this);this._updateImportance();this._applyLayout()};d.prototype.onAfterRendering=function(){this._updateMultilineContent();this._attachMediaContainerWidthChange(this._updateImportance,this);this._iResizeHandlerId=o.register(this,this._onResizeRef)};d.prototype._applyLayout=function(){var t={M:2,L:3,XL:4},e=this.getSubSections();this._resetLayoutData(e);this._assignLayoutData(e,t);return this};d.prototype._getMinRequiredColspanForChild=function(t){return t?t._getMinRequiredColspan():0};d.prototype._allowAutoextendColspanForChild=function(t){return true};d.prototype._onGridContentChange=function(t){var e;if(t.type==="aggregation"&&t.name==="content"){this.invalidate();e=t.mutation;if(e==="add"||e==="insert"){this._oGridContentObserver.observe(t.child,{properties:["visible"]})}else if(t.mutation==="remove"){this._oGridContentObserver.unobserve(t.child)}}if(t.type==="property"&&t.name==="visible"){this.invalidate()}};d.prototype._isTitleVisible=function(){return this.getShowTitle()&&this._getInternalTitleVisible()||this._getShouldDisplayExpandCollapseButton()||this._getShouldDisplayShowHideAllButton()};d.prototype._setSubSectionsFocusValues=function(){var t=this._getVisibleSubSections()||[],e=this.getSelectedSubSection(),i;if(t.length===0){return this}if(t.length===1){t[0]._setToFocusable(false);return this}t.forEach(function(t){if(e===t.getId()){t._setToFocusable(true);i=true}else{t._setToFocusable(false)}});if(!i){t[0]._setToFocusable(true)}return this};d.prototype._disableSubSectionsFocus=function(){var t=this.getSubSections()||[];t.forEach(function(t){t._setToFocusable(false)});return this};d.prototype._thereAreHiddenSubSections=function(){return this.getSubSections().some(function(t){return t._getIsHidden()})};d.prototype._updateShowHideSubSections=function(t){this.getSubSections().forEach(function(e){if(t&&e._shouldBeHidden()){e._updateShowHideState(true)}else if(!t){e._updateShowHideState(false)}})};d.prototype._getShouldDisplayShowHideAllButton=function(){return this.getSubSections().some(function(t){return t._shouldBeHidden()})};d.prototype._getShouldDisplayExpandCollapseButton=function(){return this._getIsHidden()};d.prototype._showHideContentAllContent=function(){var t=this._thereAreHiddenSubSections();if(this._getIsHidden()&&t){this._updateShowHideState(false)}this._updateShowHideSubSections(!t);this._updateShowHideAllButton(t)};d.prototype._updateShowHideState=function(e){if(this._getIsHidden()===e){return this}this._updateShowHideButton(e);this._getShowHideAllButton().setVisible(this._getShouldDisplayShowHideAllButton());return t.prototype._updateShowHideState.call(this,e)};d.prototype._updateShowHideAllButton=function(t){this._getShowHideAllButton().setVisible(this._getShouldDisplayShowHideAllButton()).setText(this._getShowHideAllButtonText(t))};d.prototype._getVisibleSubSections=function(){return this.getSubSections().filter(function(t){return t.getVisible()&&t._getInternalVisible()})};d.prototype._getShowHideAllButton=function(){if(!this.getAggregation("_showHideAllButton")){this.setAggregation("_showHideAllButton",new i({visible:this._getShouldDisplayShowHideAllButton(),text:this._getShowHideAllButtonText(!this._thereAreHiddenSubSections()),press:this._showHideContentAllContent.bind(this),type:p.Transparent}).addStyleClass("sapUxAPSectionShowHideButton"),true)}return this.getAggregation("_showHideAllButton")};d.prototype._getShowHideButtonText=function(t){return d._getLibraryResourceBundle().getText(t?"HIDE":"SHOW")};d.prototype._getShowHideAllButtonText=function(t){return d._getLibraryResourceBundle().getText(t?"HIDE_ALL":"SHOW_ALL")};d.prototype._updateShowHideButton=function(t){this._getShowHideButton().setVisible(this._shouldBeHidden()).setText(this._getShowHideButtonText(!t))};d.prototype._getShowHideButton=function(){if(!this.getAggregation("_showHideButton")){this.setAggregation("_showHideButton",new i({visible:this._shouldBeHidden(),text:this._getShowHideButtonText(!this._getIsHidden()),press:this._showHideContent.bind(this),type:p.Transparent}).addStyleClass("sapUxAPSectionShowHideButton"),true)}return this.getAggregation("_showHideButton")};n.mixInto(d);return d});
//# sourceMappingURL=ObjectPageSection.js.map