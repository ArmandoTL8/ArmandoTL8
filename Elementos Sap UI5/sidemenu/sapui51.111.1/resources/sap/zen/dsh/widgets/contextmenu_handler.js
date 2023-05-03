/*
 * SAPUI5
  (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["jquery.sap.global","sap/zen/dsh/utils/BaseHandler"],function(jQuery,e){"use strict";var t=function(){e.apply(this,arguments);var t=this;this.aAllowedSemanticSources=[];this.oMenuItemToDialogJsonMap={};this.create=function(e,t){var n=t.id;var i=this.createButton(n);this.init(i,t);i.setVisible(false);return i};this.update=function(a,r){if(!sap.zen.designmode&&r!==undefined){if(!r.entries){return null}this.aAllowedSemanticSources=[];if(r.navigation){if(r.navigation.allowedSemanticSources){var o=0;var s=r.navigation.allowedSemanticSources.length;if(s&&s>0){for(o=0;o<s;o++){this.aAllowedSemanticSources.push(r.navigation.allowedSemanticSources[o].entry.semanticName)}}}}this.oMenuItemToDialogJsonMap={};var l=r.entries;if(r.dialog===true&&l){var d=l[0].entry;c(d.dialog)}else{var u=n(r,l,"0");e.dispatcher.registerContextMenu(u);var f=sap.ui.core.Popup.Dock;if(u.getItems().length>0){var p=t.clientX;if(sap.ui.getCore().getConfiguration().getRTL()===true){p=jQuery(window).width()-t.clientX}u.open(false,a.getFocusDomRef(),f.BeginTop,f.BeginTop,window,""+p+" "+t.clientY);i(a,u,r.context,r.navigation&&r.navigation.onJumpToCommand||"")}}}return a};this.init=function(e,t){if(!sap.zen.designmode){var n=jQuery(document);n.unbind("contextmenu");n.bind("contextmenu",m.bind(this,t));n.bind("keypress",function(e){var n=e.keyCode?e.keyCode:e.which;if(n=="13"&&e.target&&e.target.getBoundingClientRect){var i=e.target.getBoundingClientRect();m.apply(this,[t,{clientX:i.left,clientY:i.top}])}})}};this.getType=function(){return"contextmenu"};function n(e,i,a){var r="menu"+a;var o=sap.ui.getCore().getControl(r);if(o){o.destroyItems();o.destroy()}var s=t.createMenu(r);var l,d,u;var f=false;if(i){for(var p=0;p<i.length;p++){d=i[p].entry;u=a+"-"+p;l="item"+u;if(d.key){l="CONTEXT_MENU_"+d.key}var v=t.createMenuItem(l,{text:d.text});if(d.disabled){v.setEnabled(false)}if(d.checked){v.setIcon("sap-icon://accept")}if(d.onSelect){v.attachSelect(new Function(d.onSelect))}if(d.entries){var g=n(e,d.entries,u);v.setSubmenu(g)}if(d.dialog){t.oMenuItemToDialogJsonMap[l]=d.dialog;v.attachSelect(c.bind(t))}if(d.startsSection&&f){v.setStartsSection(true)}s.addItem(v);f=true}}var m;if(e.cssclass&&e.cssclass!==""){m=e.cssclass}if(m){s.addStyleClass(m)}return s}function i(e,n,i,a){var r=[];if(sap.ushell&&sap.ushell.Container){sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function(c){var d=[];if(i.dimension&&i.dimension.length>0){r.push(i.dimension);if(jQuery.inArray(r[0],t.aAllowedSemanticSources)===-1){return}}else{r=t.aAllowedSemanticSources}var u=o(i);var f=s(i,u);l(i.filter,u);l(i.variables,u);var p;if(f!==undefined&&sap.zen.dsh.sapbi_page&&sap.zen.dsh.sapbi_page.appComponent){var v=c.createEmptyAppState(sap.zen.dsh.sapbi_page.appComponent);var g={selectionVariant:f};v.setData(g);v.save();p=v.getKey()}var m=function(e){if(a&&a.length>0){a=a.replace("__HASH__",e);var t=new Function(a);t();return true}return false};var h=[];r.forEach(function(e){h.push([{semanticObject:e,params:u,ignoreFormFactor:false,ui5Component:sap.zen.dsh.sapbi_page.appComponent,appStateKey:p,compactIntents:false}])});var b=c.hrefForAppSpecificHash("");if(b){var y=b.indexOf("?");b=b.substring(0,y>0?y:b.length-2)}c.getLinks(h).done(function(a){a.forEach(function(e){e[0].forEach(function(e){if(e.text&&e.intent&&e.intent!==b&&e.intent.indexOf(b+"?")!==0){d.push(e)}})});d.sort(function(e,t){return e.text.localeCompare(t.text)});if(d&&d.length>0){var r=n.getId()+"_JUMP_SUB";var o=sap.ui.getCore().getControl(r);if(o){o.destroyItems();o.destroy()}var s=null;var l;var c=function(){if(sap.ushell&&sap.ushell.Container){sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function(e){if(!m(this.dsh_shellHash)){e.toExternal({target:{shellHash:t.dsh_shellHash}})}}.bind(this))}};for(l=0;l<d.length;++l){var u=d[l];if(!n.bOpen){return null}var f=e.getId()+"_FIORINAV_"+l;var p=sap.ui.getCore().getControl(f);if(!p){p=t.createMenuItem(f,{text:u.text})}else{p.setText(u.text)}p.dsh_shellHash=u.intent;p.attachSelect(c.bind(p));if(!s){s=sap.ui.getCore().getControl(r);if(!s){s=t.createMenu(r)}}s.addItem(p)}if(s!==null&&n.bOpen===true){var v=e.getId()+"_"+i.menuitemid;var g=t.createMenuItem(v,{text:i.text});g.setSubmenu(s);n.addItem(g)}}})}.bind(t))}}var a=function(e,t){var n;if(e){var i=e.length;if(i>0){for(var a=0;a<i;a++){n=e[a].dimension.name;if(n&&n.length>0&&!Object.prototype.hasOwnProperty.call(t,n)){if(e[a].dimension.selection){t[n]=[{Sign:"I",Option:"EQ",Low:e[a].dimension.selection,High:null}]}else if(e[a].dimension.selections&&e[a].dimension.selections.length>0){t[n]=e[a].dimension.selections.map(function(e){if(e.LowType!=="DATE"){return e}var t={};for(var n in e){if(Object.prototype.hasOwnProperty.call(e,n)){t[n]=(n==="Low"||n==="High")&&e[n]?e[n]+"T00:00:00.000Z":e[n]}}return t})}}}}}};var r=function(e,t){var n={};var i=[];t=t||{};for(var r in t){if(Object.prototype.hasOwnProperty.call(t,r)){n[r]=[{Sign:"I",Option:"EQ",Low:t[r],High:null}]}}a(e.filter,n);a(e.variables,n);for(var o in n){if(Object.prototype.hasOwnProperty.call(n,o)){i.push({PropertyName:o,Ranges:n[o]})}}if(i.length>0){return i}};var o=function(e){if(!e){return}var t={};if(e.member&&e.member.length>0){t[e.dimension]=e.member==="#"?"":e.member;if(e.memberType==="DATE"){t[e.dimension]=t[e.dimension]+"T00:00:00.000Z"}}var n,i,a;var r=e.tuple_elements;if(r){var o=r.length;for(i=0;i<o;i++){n=r[i].tuple_element;if(n.member&&n.member.length>0){a=n.dimension;if(!t[a]){t[a]=n.member==="#"?"":n.member;if(n.memberType==="DATE"){t[a]=t[a]+"T00:00:00.000Z"}}}}}return t};var s=function(e,t){if(!e){return}var n={};var i=r(e,t);if(i!==undefined){n.SelectOptions=i;n.SelectionVariantID=(new Date).toISOString();n.Text="Temporary Variant "+n.SelectionVariantID;return n}};var l=function(e,t){var n,i,a;if(e&&t){var r=e.length;if(r>0){for(var o=0;o<r;o++){n=e[o].dimension.name;if(n&&n.length>0){if(!t[n]){i=e[o].dimension.selection;if(i&&i.length>0){t[n]=i}else{a=e[o].dimension.selections;if(a&&a.length===1){if(a[0].Sign&&a[0].Sign==="I"&&a[0].Option&&a[0].Option==="EQ"){t[n]=a[0].Low==="#"?"":a[0].Low;if(a[0].LowType==="DATE"){t[n]=t[n]+"T00:00:00.000Z"}}}}}}}}}};function c(e){var n,i;if(e.sId){n=e.getParameters().id;i=t.oMenuItemToDialogJsonMap[n]}else{i=e}t.oDialogResult={};t.oDialogResult.dlgtype=i.dlgtype;t.aDlgControls=[];var a=t.createDialog(n+"_"+i.dlgtype,{modal:true});a.setResizable(false);a.setTitle(i.title);a.attachClosed(function(){a.destroyContent();a.destroy();t.aDlgControls=[];t.oDialogResult={}});d(a,i);var r=new sap.ui.layout.VerticalLayout(n+"_vlayout");a.addContent(r);var o=null;var s=0;if(i.elements){s=i.elements.length}if(s<=1){o=u(a,i).bind(t)}for(var l=0;l<s;l++){var c=i.elements[l].element;f(c,r,o)}a.open()}function d(e,n){var i=t.createButton(e.getId()+"OK_BTN");i.setText(n.okbtntext);i.attachPress(u(e,n).bind(t));var a=t.createButton(e.getId()+"CANCEL_BTN");a.setText(n.cancelbtntext);a.attachPress(function(){e.close()});e.addButton(i);e.addButton(a)}function u(e,n){return function(){var i=t.aDlgControls.length;for(var a=0;a<i;a++){var r=t.aDlgControls[a];if(r){var o=r.control;r.fOkHandler(o)}}var s=JSON.stringify(t.oDialogResult);var l='"';var c=new RegExp(l,"g");s=s.replace(c,'\\"');e.close();var d=n.submitdialogcommand.replace("__JSON__",s);var u=new Function(d);u()}}function f(n,i,a){var r=n.type;var o;var s=null;var l=null;if(r==="dropdown"){if(n.text){o=t.createLabel(n.id+"_label");o.setText(n.text);o.setWidth("200px");i.addContent(o)}s=t.createDropdownBox(n.id);s.setWidth(n.id==="dd_hierarchy"?"400px":"200px");var c;if(n.entries){var d=n.entries.length;for(var u=0;u<d;u++){var f=n.entries[u].entry;var m=new sap.ui.core.ListItem;m.setKey(f.id);m.setText(f.text);if(f.selected){if(f.selected===true){if(e.dispatcher.isMainMode()){c=m}else{c=f.text}}}s.addItem(m)}}if(c){if(e.dispatcher.isMainMode()){s.setSelectedItem(c)}else{s.setValue(c)}}s.attachChange(function(){var e=s.getSelectedKey();if(e!=="multiple"){var t=s.getItems()[0];if(t.getKey()==="multiple"){s.removeItem(t)}}});i.addContent(s);l=p}else if(r==="checkbox"){s=t.createCheckBox(n.id);s.setText(n.text);if(n.checked){s.setChecked(n.checked===true)}else{s.setChecked(false)}i.addContent(s);l=v}else if(r==="input"){if(n.text){o=t.createLabel(n.id+"_label");o.setText(n.text);o.setWidth("200px");i.addContent(o)}s=t.createTextField(n.id);if(a&&s.attachSubmit){s.attachSubmit(a)}else if(a&&s.onsapenter){s.addEventDelegate({onsapenter:a})}s.setValue(n.value);i.addContent(s);l=g}else if(r==="numeric_input"){if(n.text){o=t.createLabel(n.id+"_label");o.setText(n.text);o.setWidth("200px");i.addContent(o)}s=t.createTextField(n.id);s.attachBrowserEvent("keypress",function(e){var t=[48,49,50,51,52,53,54,55,56,57,0,8];if(!(jQuery.inArray(e.which,t)>=0)){e.preventDefault()}});s.setValue(n.value);s.setWidth("100px");i.addContent(s);l=g}if(s){t.aDlgControls.push({control:s,fOkHandler:l.bind(t)})}}function p(e){t.oDialogResult[e.getId()]=e.getSelectedKey()}function v(e){t.oDialogResult[e.getId()]=""+e.getChecked()}function g(e){t.oDialogResult[e.getId()]=""+e.getValue()}function m(n,i){if(!i.ctrlKey){e.dispatcher.cancelDragDropOperation();t.clientX=i.clientX;t.clientY=i.clientY;var a=h(i.clientX,i.clientY);var r;var o;if(jQuery.browser.msie&&document.msElementsFromPoint!==undefined){var s=document.msElementsFromPoint(i.clientX,i.clientY);for(var l=0;l<s.length;l++){var c=jQuery(s[l]);var d=e.dispatcher.getControlForId(c.attr("id"));if(d){o=sap.ui.getCore().byId(d.getId());break}}}else{r=a.closest(".zenControl");o=sap.ui.getCore().byId(r.attr("id"))}if(o){var u=e.dispatcher.getHandlers(o.zenControlType);if(u&&u[0]){var f=u[0];var p=f.getContextMenuAction(n.contextmenuid,o,a);if(!p){}else{if(i){if(i.preventDefault){i.preventDefault()}if(i.stopPropagation){i.stopPropagation()}if(i.cancelBubble){i.cancelBubble=true}}p()}}}}}function h(t,n){var i=jQuery(window.document.elementFromPoint(t,n));var a=i.closest(".zenControl");var r=a.attr("id");var o=e.dispatcher.getControlForId(r);var s=[];if(o&&o.zenControlType==="xtable"){r=i.attr("id");while(r&&r.indexOf("droparea")>-1){s.push(i);i.css("display","none");i=jQuery(window.document.elementFromPoint(t,n));r=i.attr("id")}for(var l=0;l<s.length;l++){s[l].css("display","block")}}return i}};var n=new t;e.dispatcher.addHandlers(n.getType(),n);return n});
//# sourceMappingURL=contextmenu_handler.js.map