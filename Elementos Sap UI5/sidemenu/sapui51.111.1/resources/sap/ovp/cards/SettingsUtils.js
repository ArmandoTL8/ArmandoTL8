sap.ui.define(["sap/m/Dialog","sap/m/Button","sap/ovp/cards/PayLoadUtils","sap/ovp/cards/OVPCardAsAPIUtils","sap/ovp/cards/rta/SettingsDialogConstants","sap/ovp/cards/CommonUtils","sap/ui/Device","sap/m/MessagePopover","sap/m/MessagePopoverItem","sap/m/Link","sap/m/MessageBox","sap/ovp/cards/AnnotationHelper","sap/ui/core/mvc/ViewType","sap/ui/model/json/JSONModel","sap/ovp/app/resources","sap/ovp/app/OVPUtils","sap/base/util/merge","sap/ovp/app/OVPLogger","sap/ui/model/odata/v2/ODataModel","sap/ui/model/odata/CountMode","sap/ui/core/mvc/XMLView","sap/ui/core/Core"],function(e,t,a,i,r,n,s,o,l,d,p,c,u,f,h,g,v,y,m,C,b,S){"use strict";var P=h;var w=new y("OVP.cards.SettingsUtils");function O(e,t,a){var r=e.getComponentInstance(),s=r.getComponentData(),o=s.appComponent,l=s.mainComponent,d=a?"":s.cardId,p=d+"Dialog",c=a?"":s.modelName,u=!c?undefined:o.getModel(c),f=t.getModel().getData(),h={cards:{}};h.cards[p]={template:f.template,settings:f};if(ce.bNewKPICardFlag){var g=f.selectedKPI;u=new m(g.ODataURI,{annotationURI:g.ModelURI,defaultCountMode:C.None});c=n._getLayerNamespace()+".kpi_card_model_"+D(g.ODataURI)}if(u&&!!c){h.cards[p].model=c;t.setModel(u,c)}h.cards[p]=l._getTemplateForChart(h.cards[p]);t.getController()._oManifest=h;if(ce.bNewKPICardFlag){u.getMetaModel().loaded().then(function(){var e=i.createCardComponent(t,h,"dialogCard");e.then(function(){t.setBusy(false)}).catch(function(){L(h.cards[p].settings,"OVP_KEYUSER_ANNOTATION_FAILURE");V(t,h,p)})},function(e){w.error(e)});u.attachMetadataFailed(function(){L(h.cards[p].settings,"OVP_KEYUSER_METADATA_FAILURE");V(t,h,p)})}else{i.createCardComponent(t,h,"dialogCard")}}function I(e,t){if(!this.oNewDataSources[e]){this.oNewDataSources[e]={uri:t}}}function E(e){if(this.oNewDataSources[e]){delete this.oNewDataSources[e]}}function T(e){var t=this.oAppComponent.getMetadata(),a=t.getManifestEntry("sap.app").dataSources;if(this.oNewDataSources[e]){return this.oNewDataSources}return a}function D(e){var t=e.split("/");return t[t.length-1]?t[t.length-1]:t[t.length-2]}function V(e,t,a){t.cards[a].template="sap.ovp.cards.error";t.cards[a].model=undefined;var r=i.createCardComponent(e,t,"dialogCard");var n=e.getController();r.then(function(){e.setBusy(false);n.setBusy(false)}).catch(function(){e.setBusy(false);n.setBusy(false)})}function L(e,t){if(e){e.errorStatusText=h.getText(t)}}function A(e){if(e.indexOf("#")!==-1){return e.split("#")[1]}else{return"Default"}}function x(e,t){if(e){var a,i,r;if(e.indexOf("{")===0&&e.indexOf("}")===e.length-1){e=e.slice(1,-1);if(e.indexOf(">")!=-1){a=e.split(">");r=a[0];i=a[1]}else if(e.indexOf("&gt;")!=-1){a=e.split("&gt;");r=a[0];i=a[1]}if(!!i&&r==="@i18n"&&ce.oi18nModel){return ce.oi18nModel.getProperty(i)}else{return e}}else{return e}}else{return t}}function _(e,t,a,i){if(t[e]&&t[e][a]){var r=typeof t[e][a]==="string"?t[e][a]:t[e][a].String;return x(r,i)}else{return i}}function k(e,t){var a=A(t),i=h.getText("OVP_KEYUSER_LABEL_DEFAULT_LABEL_WITH_QUALIFIER",[a]);i=i?i:a;if(t.indexOf(",")!==-1){t=t.split(",")[0]}if(t.indexOf(".Identification")!==-1){if(e[t]){var r=c.sortCollectionByImportance(e[t]);for(var n=0;n<r.length;n++){var s=r[n];if(s.RecordType==="com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation"){if(s&&s["Label"]){return x(s["Label"].String,i)}else{return s["SemanticObject"].String+"-"+s["Action"].String}}if(s.RecordType==="com.sap.vocabularies.UI.v1.DataFieldWithUrl"){if(s&&s["Label"]){return x(s["Label"].String,i)}else{return s["Url"].String}}}}return h.getText("OVP_KEYUSER_LABEL_NO_NAVIGATION")}else if(t.indexOf(".LineItem")!==-1){var o=c.sortCollectionByImportance(e[t]);o.forEach(function(e,t){if(e["RecordType"]&&e["RecordType"].indexOf(".DataField")!==-1&&e["Label"]){o[t]["Label"]={String:x(e["Label"].String,i)}}});return o}else if(t.indexOf(".HeaderInfo")!==-1){if(e[t]&&e[t]["Description"]&&e[t]["Description"].Label){return x(e[t]["Description"].Label.String,i)}else{return i}}else if(t.indexOf(".PresentationVariant")!==-1||t.indexOf(".SelectionVariant")!==-1||t.indexOf(".SelectionPresentationVariant")!==-1){return _(t,e,"Text",i)}else if(t.indexOf(".DataPoint")!==-1){return _(t,e,"Title",i)}else if(t.indexOf(".Chart")!==-1){return _(t,e,"Description",i)}else if(t.indexOf(".FieldGroup")!==-1){return _(t,e,"Label",i)}else{var l="";if(a!=="Default"){l="#"+a}var d="com.sap.vocabularies.Common.v1.Label"+l;if(e[t]&&e[t][d]){return x(e[t][d].String,i)}else{return i}}}function N(e,t){var a=A(t),i=h.getText("OVP_KEYUSER_LABEL_DEFAULT_LABEL_WITH_QUALIFIER",[a]);i=i?i:a;if(t.indexOf(",")!==-1){t=t.split(",")[0]}if(t.indexOf(".Identification")!==-1){if(e[t]){var r=c.sortCollectionByImportance(e[t]);for(var n=0;n<r.length;n++){var s=r[n];if(s.$Type==="com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation"){if(s&&s["Label"]){return x(s["Label"],i)}else{return s["SemanticObject"]+"-"+s["Action"]}}if(s.$Type==="com.sap.vocabularies.UI.v1.DataFieldWithUrl"){if(s&&s["Label"]){return x(s["Label"],i)}else{return s["Url"]}}}}return h.getText("OVP_KEYUSER_LABEL_NO_NAVIGATION")}else if(t.indexOf(".LineItem")!==-1){var r=c.sortCollectionByImportance(e[t]);r.forEach(function(e,t){if(e["$Type"]&&e["$Type"].indexOf(".DataField")!==-1&&e["Label"]){r[t]["Label"]=x(e["Label"],i)}});return r}else if(t.indexOf(".HeaderInfo")!==-1){if(e[t]&&e[t]["Description"]&&e[t]["Description"].Label){return x(e[t]["Description"].Label,i)}else{return i}}else if(t.indexOf(".PresentationVariant")!==-1||t.indexOf(".SelectionVariant")!==-1||t.indexOf(".SelectionPresentationVariant")!==-1){return _(t,e,"Text",i)}else if(t.indexOf(".DataPoint")!==-1){return _(t,e,"Title",i)}else if(t.indexOf(".Chart")!==-1){return _(t,e,"Description",i)}else if(t.indexOf(".FieldGroup")!==-1){return _(t,e,"Label",i)}else{var o="";if(a!=="Default"){o="#"+a}var l="com.sap.vocabularies.Common.v1.Label"+o;if(e[t]&&e[t][l]){return x(e[t][l],i)}else{return i}}}function R(e,t,a){switch(t){case"cardPreview":return i.getSupportedCardTypes().indexOf(e)!==-1;case"noOfRows":case"noOfColumns":case"stopResizing":var r=["sap.ovp.cards.stack"];return r.indexOf(e)===-1;case"listType":case"listFlavor":var n=["sap.ovp.cards.list","sap.ovp.cards.v4.list"];return n.indexOf(e)!==-1;case"listFlavorForLinkList":var s=["sap.ovp.cards.linklist","sap.ovp.cards.v4.linklist"];return s.indexOf(e)!==-1;case"isViewSwitchSupportedCard":case"showViewSwitch":case"kpiHeader":var o=["sap.ovp.cards.list","sap.ovp.cards.table","sap.ovp.cards.v4.list","sap.ovp.cards.v4.table","sap.ovp.cards.charts.analytical","sap.ovp.cards.charts.smart.chart","sap.ovp.cards.charts.bubble","sap.ovp.cards.charts.donut","sap.ovp.cards.charts.line"];return o.indexOf(e)!==-1;case"chartSPVorKPI":case"chart":var l=["sap.ovp.cards.charts.analytical","sap.ovp.cards.charts.smart.chart","sap.ovp.cards.charts.bubble","sap.ovp.cards.charts.donut","sap.ovp.cards.charts.line"];return l.indexOf(e)!==-1;case"sortOrder":case"sortBy":case"lineItem":if(!a){var d=["sap.ovp.cards.list","sap.ovp.cards.table","sap.ovp.cards.v4.list","sap.ovp.cards.v4.table"];return d.indexOf(e)!==-1}else{var d=["sap.ovp.cards.list","sap.ovp.cards.table","sap.ovp.cards.v4.list","sap.ovp.cards.v4.table","sap.ovp.cards.charts.analytical","sap.ovp.cards.linklist","sap.ovp.cards.v4.linklist","sap.ovp.cards.stack"];return d.indexOf(e)!==-1}break;case"identification":var p=["sap.ovp.cards.stack"];return p.indexOf(e)!==-1;case"addViewSwitch":var c=["sap.ovp.cards.list","sap.ovp.cards.table","sap.ovp.cards.v4.list","sap.ovp.cards.v4.table"];return c.indexOf(e)!==-1;case"addKPIHeader":var c=["sap.ovp.cards.list","sap.ovp.cards.table","sap.ovp.cards.v4.list","sap.ovp.cards.v4.table","sap.ovp.cards.charts.analytical"];return c.indexOf(e)!==-1;case"selecionOrPresentation":var u=["sap.ovp.cards.list","sap.ovp.cards.table","sap.ovp.cards.v4.list","sap.ovp.cards.v4.table","sap.ovp.cards.linklist","sap.ovp.cards.v4.linklist"];return u.indexOf(e)!==-1;case"addODataSelect":var f=["sap.ovp.cards.list","sap.ovp.cards.table","sap.ovp.cards.v4.list","sap.ovp.cards.v4.table","sap.ovp.cards.stack"];return f.indexOf(e)!==-1;case"addCustomActions":var f=["sap.ovp.cards.stack"];return f.indexOf(e)!==-1;case"setCardProperties":if(a){var d=["sap.ovp.cards.list","sap.ovp.cards.table","sap.ovp.cards.v4.list","sap.ovp.cards.v4.table","sap.ovp.cards.linklist","sap.ovp.cards.v4.linklist","sap.ovp.cards.stack"];return d.indexOf(e)!==-1}break;default:break}}function M(e){return!!e.kpiAnnotationPath}function F(e){return!!e.selectionPresentationAnnotationPath}function B(e){return F(e)||M(e)}function K(e){return e.substring(e.lastIndexOf("_")+1,e.length).indexOf("C")!==-1}function U(e){if(e.NewKPICard){return e.NewKPICard}else if(e.selectedKPICardID){return e.selectedKPICardID.indexOf("newKPICard")!==-1}else{return false}}function H(e,t,a,i,r){var n=true;var s=true;var o=false;var l=false;var d=false;if(a){if(e.mainViewSelected){s=false}else{n=false}}if(e.addNewCard&&e.model){var l=true;if(e.template){d=true;if(e.entitySet){o=true}}}var p;switch(t){case"cardPreview":p=R(e.template,"cardPreview");break;case"noOfRows":case"noOfColumns":case"stopResizing":p=n&&R(e.template,t);break;case"title":p=n;break;case"dynamicSwitchSubTitle":p=n&&!!e.dynamicSubTitle;break;case"dynamicSwitchStateSubTitle":p=!!e.dynamicSubtitleAnnotationPath;break;case"subTitle":if(!e.addNewCard){if(!e.subTitle){e.subTitle=" ";p=true}else{p=n&&!e.dynamicSubtitleAnnotationPath}}else{p=n}break;case"dynamicSubTitle":p=n&&!!e.dynamicSubtitleAnnotationPath;break;case"valueSelectionInfo":if(!e.addNewCard){if(!e.valueSelectionInfo){e.valueSelectionInfo=" "}p=n&&R(e.template,"kpiHeader")&&!!e.dataPointAnnotationPath&&!U(e)}else{p=n&&l&&d&&o&&e.addKPIHeaderCheckBox&&R(e.template,"addKPIHeader")}break;case"dataPoint":if(!e.addNewCard){p=s&&!M(e)&&R(e.template,"kpiHeader")&&!!e.dataPointAnnotationPath}else{p=s&&l&&d&&o&&e.addKPIHeaderCheckBox&&R(e.template,"addKPIHeader")}break;case"listType":case"listFlavor":case"listFlavorForLinkList":if(!e.addNewCard){p=n&&R(e.template,t)}else{p=n&&l&&d&&o&&R(e.template,t)}break;case"identification":if(!e.addNewCard){p=s&&!e.staticContent&&!R(e.template,t)}else{p=s&&l&&d&&o&&!R(e.template,t)}break;case"selectionPresentationVariant":if(!e.addNewCard){p=s&&F(e)&&!M(e)&&R(e.template,"kpiHeader")}else{p=s&&l&&d&&o&&R(e.template,"selecionOrPresentation")&&!!(Array.isArray(e.selectionPresentationVariant)&&e.selectionPresentationVariant.length)}break;case"KPI":case"dataPointSelectionMode":if(!e.addNewCard){p=s&&M(e)&&!F(e)&&R(e.template,"chart")&&!U(e)}else{p=s&&l&&d&&o&&R(e.template,"chart")}break;case"presentationVariant":case"selectionVariant":if(!e.addNewCard){p=s&&!B(e)&&!e.staticContent&&R(e.template,"kpiHeader")}else{p=s&&l&&d&&o&&!(Array.isArray(e.selectionPresentationVariant)&&e.selectionPresentationVariant.length)&&R(e.template,"selecionOrPresentation")}break;case"kpiHeader":p=n&&!M(e)&&R(e.template,t);break;case"lineItem":case"chart":if(!e.addNewCard){p=s&&!B(e)&&R(e.template,t)}else{p=s&&l&&d&&o&&R(e.template,t,e.addNewCard)}break;case"chartSPVorKPI":p=s&&B(e)&&!U(e)&&R(e.template,t);break;case"presentationVariantSPVorKPI":case"selectionVariantSPVorKPI":p=s&&B(e)&&!U(e)&&!e.staticContent&&R(e.template,"kpiHeader");break;case"showViewName":p=a&&s;break;case"showDefaultView":if(a&&s){if(e.defaultViewSelected!=e.selectedKey){p=true}}else{p=false}break;case"showEntitySet":if(a&&s){if(e.selectedKey>0&&e.tabs[e.selectedKey-1].entitySet){p=true}else{p=false}}else{p=false}break;case"showMore":case"removeVisual":case"lineItemSubTitle":case"lineItemTitle":case"staticLink":case"links":var c=(e.template==="sap.ovp.cards.linklist"||e.template==="sap.ovp.cards.v4.linklist")&&!!e.staticContent;if(t==="staticLink"){p=c&&!!e.staticContent[i].targetUri}else if(t==="links"){p=c&&!!e.staticContent[i].semanticObject}else if(t==="removeVisual"){p=c&&(!!e.staticContent[i].targetUri||!!e.staticContent[i].semanticObject)}else{p=c}break;case"selectCardType":p=n&&l;break;case"addKPIHeader":p=n&&l&&d&&R(e.template,t);break;case"setEntitySet":p=s&&l&&d;break;case"setCardProperties":p=n&&l&&d&&o&&R(e.template,t,e.addNewCard);break;case"setGeneralCardProperties":p=n&&l&&d&&o;break;case"setAnnotationCardProperties":p=s&&l&&d&&o;break;case"subTitleRequired":p=l&&d&&o&&e.addKPIHeaderCheckBox;break;case"addODataSelect":if(!e.addNewCard){p=s&&R(e.template,t)}else{p=s&&l&&d&&o&&R(e.template,t)}break;case"isViewSwitchSupportedCard":case"showViewSwitch":p=l&&d&&(o||!!e.showViewSwitchButton)&&R(e.template,t);break;case"dataSource":p=n;break;case"dataSourceExisting":p=!e.newDataSource;break;case"dataSourceNew":p=e.newDataSource;break;case"addCustomActions":p=n&&R(e.template,t);break;default:break}return p}function W(e){var t=false;this.oVisibility.viewSwitchEnabled=false;this.oVisibility.showViewSwitch=false;if(!this.bAddNewCardFlag){if(R(e.template,"isViewSwitchSupportedCard")&&!U(e)){if(e.tabs&&e.tabs.length){t=true;this.oVisibility.showViewSwitch=true}this.oVisibility.viewSwitchEnabled=true}}else{if(e.tabs&&e.tabs.length){t=true;this.oVisibility.showViewSwitch=H(e,"showViewSwitch")}this.oVisibility.viewSwitchEnabled=H(e,"isViewSwitchSupportedCard")}this.oVisibility.cardPreview=H(e,"cardPreview");this.oVisibility.stopResizing=H(e,"stopResizing",t);this.oVisibility.noOfRows=H(e,"noOfRows",t);this.oVisibility.noOfColumns=H(e,"noOfColumns",t);this.oVisibility.title=H(e,"title",t);this.oVisibility.subTitle=H(e,"subTitle",t);this.oVisibility.valueSelectionInfo=H(e,"valueSelectionInfo",t);this.oVisibility.listType=H(e,"listType",t);this.oVisibility.listFlavor=H(e,"listFlavor",t);this.oVisibility.listFlavorForLinkList=H(e,"listFlavorForLinkList",t);if((e.template==="sap.ovp.cards.linklist"||e.template==="sap.ovp.cards.v4.linklist")&&!!e.staticContent){var a=e.staticContent,i={},r={},n={},s={};for(var o=0;o<a.length;o++){var l=a[o].index;i[l]=H(e,"staticLink",null,o);r[l]=H(e,"links",null,o);n[l]=H(e,"removeVisual",null,o);s[l]=H(e,"showMore",null,o)}this.oVisibility.staticLink=i;this.oVisibility.links=r;this.oVisibility.removeVisual=n;this.oVisibility.showMore=s}this.oVisibility.lineItemTitle=H(e,"lineItemTitle");this.oVisibility.lineItemSubTitle=H(e,"lineItemSubTitle");this.oVisibility.showViewName=H(e,"showViewName",t);this.oVisibility.showDefaultView=H(e,"showDefaultView",t);this.oVisibility.showEntitySet=H(e,"showEntitySet",t);this.aVariantNames.forEach(function(a){this.oVisibility[a.sPath]=H(e,a.sPath,t)&&!!e[a.sPath]&&!!e[a.sPath].length}.bind(this));this.oVisibility.kpiHeader=H(e,"kpiHeader",t)&&!!e["dataPoint"]&&!!e["dataPoint"].length;this.oVisibility.dynamicSwitchSubTitle=H(e,"dynamicSwitchSubTitle",t);this.oVisibility.dynamicSwitchStateSubTitle=H(e,"dynamicSwitchStateSubTitle",t);this.oVisibility.dataSource=H(e,"dataSource",t);this.oVisibility.dataSourceExisting=H(e,"dataSourceExisting",t);this.oVisibility.dataSourceNew=H(e,"dataSourceNew",t);this.oVisibility.selectCardType=H(e,"selectCardType",t);this.oVisibility.addKPIHeader=H(e,"addKPIHeader",t);this.oVisibility.setEntitySet=H(e,"setEntitySet",t);this.oVisibility.setCardProperties=H(e,"setCardProperties",t);this.oVisibility.setGeneralCardProperties=H(e,"setGeneralCardProperties",t);this.oVisibility.subTitleRequired=H(e,"subTitleRequired",t);this.oVisibility.dataPointSelectionMode=H(e,"dataPointSelectionMode",t);var d;for(var o=0;o<this.aVisiblePropertiesForAnnotation.length;o++){if(this.oVisibility[this.aVisiblePropertiesForAnnotation[o].sProperty]){d=true;break}}this.oVisibility.setAnnotationCardProperties=d?H(e,"setAnnotationCardProperties",t):false;this.oVisibility.addODataSelect=H(e,"addODataSelect",t);this.oVisibility.addCustomActions=H(e,"addCustomActions",t);this.oVisibility.moveToTheTop=false;this.oVisibility.moveUp=false;this.oVisibility.moveDown=false;this.oVisibility.moveToTheBottom=false;this.oVisibility.delete=false}function Y(e){var t=e.getProperty("/staticContent");for(var a=0;a<t.length;a++){t[a].index="Index--"+(a+1)}e.setProperty("/staticContent",t)}function j(e){var t=0;for(var a=e.length-1;a>=0;a--){if(/^\d+$/.test(e[a])){t=parseInt(e[a],10);break}}return t}function z(e){var t=e&&e.metaModel&&e.metaModel.oModel;var a=n.isODataV4(t);if(e.lineItem){e.lineItem.forEach(function(t){if(a&&t.value==="@"+e.annotationPath||t.value===e.annotationPath){e.lineItemQualifier=t.name}})}if(e.tabs&&e.tabs.length&&e.selectedKey){e.viewName=e.tabs[e.selectedKey-1].value;e.isDefaultView=false;if(e.selectedKey===e.defaultViewSelected){e.isDefaultView=true}}var i=e.sortOrder;e.sortOrder="descending";if(i&&i.toLowerCase()!=="descending"){e.sortOrder="ascending"}e.isExtendedList=false;if(e.listType==="extended"){e.isExtendedList=true}e.isBarList=false;if(e.listFlavor==="bar"){e.isBarList=true}e.hasKPIHeader=false;if(e.dataPointAnnotationPath){e.hasKPIHeader=true}return e}function G(e){var t=e&&e.metaModel&&e.metaModel.oModel;var a=n.isODataV4(t);var i=e.kpiAnnotationPath;var r=e.template;var s=a?e.entityType.$Type:e.entityType;var o="";if(i&&s&&r==="sap.ovp.cards.charts.analytical"){var l=s[i];var d=l&&l.Detail;if(d&&d.RecordType==="com.sap.vocabularies.UI.v1.KPIDetailType"&&d.SemanticObject&&d.Action){o="#"+d.SemanticObject.String+"-"+d.Action.String}}e["KPINav"]=o}function $(e){var t=[],a=e.metaModel,i=!!a?a.getODataEntityContainer().entitySet:[],r=a&&a.getODataEntityContainer().namespace+".";i.forEach(function(i){if(!e.addNewCard){var n=h.getText("OVP_KEYUSER_LABEL_DEFAULT_LABEL_WITH_QUALIFIER",[i.name]),s=a.getODataEntityType(i.entityType)["sap:label"];t.push({name:x(s,n),value:i.name})}else{var n=h.getText("OVP_KEYUSER_LABEL_DEFAULT_LABEL_WITH_QUALIFIER",[i.name]),s=a.getODataEntityType(i.entityType)["sap:label"],o=i.entityType.split(r)[1];t.push({name:x(s,n),value:i.name,entityType:o})}});if(t.length>0){e["allEntitySet"]=t}}function Q(e){var t=e.metaModel,a=t.getObject("/"),i=Object.keys(a),r=[],n=[];for(var s=0;s<i.length;s++){if(i[s].startsWith("$")){continue}r.push({name:i[s],entityType:a[i[s]].$Type})}var o=t.getData();var l=o.$EntityContainer;var d=l?l.split("."):"";d.pop();var p=d.join(".")+".";r.forEach(function(t){var a=h.getText("OVP_KEYUSER_LABEL_DEFAULT_LABEL_WITH_QUALIFIER",[t.name]);var i=o&&o[t.entityType]&&o[t.entityType]["sap:label"];if(!e.addNewCard){n.push({name:x(i,a),value:t.name})}else{var r=t.entityType.split(p)[1];n.push({name:x(i,a),value:t.name,entityType:r})}});if(n.length>0){e["allEntitySet"]=n}}function X(e){var t=e.metaModel&&e.metaModel.getObject("/dataServices/schema")&&e.metaModel.getObject("/dataServices/schema")[0].entityType;if(t){t.forEach(function(t){var a=0;this.aVariantNames.forEach(function(e){for(var i in t){if(i.indexOf(e.sVariant)!==-1){a++}}});if(!a){e.allEntitySet=e.allEntitySet.filter(function(e){return e.entityType!==t.name})}}.bind(this))}}function q(e){var t=e&&e.metaModel&&e.metaModel.oModel;var a=n.isODataV4(t);var i;if(a){i=e.metaModel.getData()["$Annotations"][e.entityType.$Type]}else{i=e.entityType}if(!e["allEntitySet"]){if(a){Q(e)}else{$(e)}}G(e);if(e.addNewCard){X.call(this,e)}this.aVariantNames.forEach(function(t){var r=[],n=1;for(var s in i){if(i.hasOwnProperty(s)&&s.indexOf(t.sVariant)!==-1){if(t.sVariant===".LineItem"){var o={name:P.getText("OVP_KEYUSER_LABEL_LINEITEM_OPTIONS",[n]),value:a?s.substring(1):s,fields:a?N(i,s):k(i,s)};r.push(o);n++}else{r.push({name:a?N(i,s):k(i,s),value:a?s.substring(1):s})}}}if(r.length!==0){e[t.sPath]=r}});if(a){var r=pe(e);e["modelProperties"]=r.map(function(e){return{name:e,value:e}})}else if(e.entityType&&e.entityType.property){e["modelProperties"]=e.entityType.property.map(function(e){return{name:e.name,value:e.name}})}if(!!e.tabs&&e.tabs.length){var s=false,o=e.tabs[e.tabs.length-1].value,l=o.split(" ");e.newViewCounter=j(l);e.defaultViewSelected=e.selectedKey;e.isViewResetEnabled=false;e.aViews=[{text:P&&P.getText("OVP_KEYUSER_LABEL_MAIN_VIEW"),key:0,isLaterAddedView:false,isViewResetEnabled:false}];s=e.tabs.some(function(e){return e.dataPointAnnotationPath});e.tabs.forEach(function(t,a){var i=t.value;if(s&&!t.dataPointAnnotationPath&&t.dataPoint&&t.dataPoint.length){t.dataPointAnnotationPath=t.dataPoint[0].value}if(a+1===e.selectedKey){i=t.value;if(P){i+=" ("+P.getText("OVP_KEYUSER_LABEL_DEFAULT_VIEW")+")"}else{i+=" (Default view)"}}e.aViews.push({text:i,key:a+1,initialSelectedKey:a+1,isLaterAddedView:false,isViewResetEnabled:false})})}else if(R(e.template,"isViewSwitchSupportedCard")){e.newViewCounter=0;e.aViews=[{text:P.getText("OVP_KEYUSER_SHOWS_DIFFERENT_VIEWS"),key:0,initialSelectedKey:0,isLaterAddedView:false,isViewResetEnabled:false}]}return e}function J(e){var t=e.getData();if(sap.ushell&&sap.ushell.Container){sap.ushell.Container.getService("CrossApplicationNavigation").getLinks().done(function(a){var i=[],r={};for(var n=0;n<a.length;n++){i.push(a[n].intent);r[a[n].intent]=a[n].text}sap.ushell.Container.getService("CrossApplicationNavigation").isIntentSupported(i).done(function(a){var i=[];for(var n in a){if(a.hasOwnProperty(n)&&a[n].supported===true&&r&&r[n]){i.push({name:r[n],value:n})}}var s=t;if(i.length!==0||i.length!==0){s["links"]=i}e.refresh()}).fail(function(e){w.error(e)})}).fail(function(e){w.error(e)})}}function Z(e){this.oResetButton.setEnabled(e)}function ee(e){this.oSaveButton.setEnabled(e);var t=this.oMessagePopOver.getModel(),a=t.getProperty("/Counter/Error");this.bError=a>0}function te(e){var t=new RegExp("http(s)?://(www.)?[a-z0-9]+([-.]{1}[a-z0-9]+)*.[a-z]{2,5}(:[0-9]{1,5})?(/.*)?","i");return t.test(e)}function ae(e,t){if(t==="targetUri"){return!te(e)&&(!!e||e==="")}else{return!e.trim().length}}function ie(e){var t=e.getParameter("path"),a="",i,r,n,s,o,l;if(t==="/title"||t==="title"||t==="/viewName"||t==="targetUri"||t==="value"){var d=e.getParameter("value"),p=ae(d,t),c,u=e.getParameter("context");if(t==="/viewName"){c=e.getSource().getProperty("/selectedKey");a=h.getText("OVP_KEYUSER_INPUT_ERROR_VIEW_NAME");t="/tabs/"+(c-1)+"/value"}if(t==="value"){a=h.getText("OVP_KEYUSER_INPUT_ERROR_VIEW_NAME");t=u.getPath()+"/"+t}if(t.indexOf("/title")!==-1){a=h.getText("OVP_KEYUSER_INPUT_ERROR")}if(u&&u.getPath().indexOf("staticContent")!==-1){i=u.getPath().split("/");if(t==="title"){a=h.getText("OVP_KEYUSER_INPUT_ERROR_RECORD_TITLE")+(parseInt(i[i.length-1],10)+1)}else if(t==="targetUri"){a=h.getText("OVP_KEYUSER_INPUT_ERROR_RECORD_URL")+" "+(parseInt(i[i.length-1],10)+1)}t=u.getPath()+"/"+t}n=this.oMessagePopOver.getModel();s=n.getProperty("/Messages");o=n.getProperty("/Counter/All");l=n.getProperty("/Counter/Error");if(p){ee.bind(this)(true);for(r=0;r<s.length;r++){if(s[r].fieldName===t){s.splice(r,1);o--;l--;r--}}s.push({type:"Error",title:a,fieldName:t,counter:l+1});o++;l++}else{ee.bind(this)(true);for(r=0;r<s.length;r++){if(s[r].fieldName===t){s.splice(r,1);o--;l--;r--}}}n.setProperty("/Messages",s);n.setProperty("/Counter/All",o);n.setProperty("/Counter/Error",l);n.refresh(true)}else if(t==="/staticContent,title"||t==="/staticContent,targetUri"||t==="/tabs,value"){i=t.split(",");n=this.oMessagePopOver.getModel();s=n.getProperty("/Messages");o=n.getProperty("/Counter/All");l=n.getProperty("/Counter/Error");ee.bind(this)(true);for(r=0;r<s.length;r++){if(s[r].fieldName.indexOf(i[0])!==-1&&s[r].fieldName.indexOf(i[1])!==-1){s.splice(r,1);o--;l--;r--}}n.setProperty("/Messages",s);n.setProperty("/Counter/All",o);n.setProperty("/Counter/Error",l);n.refresh(true)}}function re(){var e=this.oMessagePopOver.getModel();e.setProperty("/Messages",[]);e.setProperty("/Counter/All",0);e.setProperty("/Counter/Error",0);e.setProperty("/Counter/Success",0);e.setProperty("/Counter/Warning",0);e.setProperty("/Counter/Information",0);e.refresh(true)}function ne(){var e=new d({text:"Show more information",href:"",target:"_blank"});var t=new l({type:"{type}",title:"{title}",description:"{description}",subtitle:"{subtitle}",counter:"{counter}",fieldName:"{fieldName}",link:e});this.oMessagePopOver=new o({items:{path:"/Messages",template:t}});var a={Counter:{All:0,Error:0,Success:0,Warning:0,Information:0},Messages:[]};var i=new f(a);this.oMessagePopOver.setModel(i);this.oMessagePopOverButton.setModel(i)}function se(e,t){var a=e.byId("sapOvpSettingsForm");if(a){var i=a.getDomRef();if(i){i.style.width=t}}}function oe(e){var t=this.dialogBox.getContent()[0],a=t.getModel(),i=t.getModel("deviceMediaProperties");switch(e.name){case"S":case"M":i.setProperty("/deviceMedia","Column");se(t,"100%");break;case"L":case"XL":default:i.setProperty("/deviceMedia","Row");se(t,"calc(100% - "+(a.getProperty("/dialogBoxWidth")+1)+"rem)");break}i.refresh(true)}function le(){s.media.detachHandler(oe.bind(this),null,"SettingsViewRangeSet");s.media.removeRangeSet("SettingsViewRangeSet")}function de(){s.media.initRangeSet("SettingsViewRangeSet",[520,760,960],"px",["S","M","L","XL"]);s.media.attachHandler(oe.bind(this),null,"SettingsViewRangeSet");oe.bind(this)(s.media.getCurrentRange("SettingsViewRangeSet"))}function pe(e){var t=e.entitySet,a=e.metaModel,i=a.getObject("/"+t),r=i.$Type,n=a.getObject("/"+r),s=Object.keys(n);var o=s.filter(function(e){return!e.startsWith("$")});return o}var ce={dialogBox:undefined,oSaveButton:undefined,oResetButton:undefined,oMessagePopOverButton:undefined,oMessagePopOver:undefined,oAppDescriptor:undefined,oOriginalAppDescriptor:undefined,oMainComponent:undefined,oAppComponent:undefined,oNewDataSources:{},sApplicationId:"",oi18nModel:undefined,iContentHeightForDialog:38,iContentHeightForDialogWithViewSwitch:33,aVariantNames:r.aVariantNames,aVisiblePropertiesForAnnotation:r.aVisiblePropertiesForAnnotation,getDataSources:T,removeDataSources:E,setDataSources:I,attachWindowResizeHandler:de,detachWindowResizeHandler:le,settingFormWidth:se,addKPINavApplicationName:G,addManifestSettings:z,setVisibilityForFormElements:W,getVisibilityOfElement:H,checkForEmptyString:x,enableResetButton:Z,enableSaveButton:ee,checkClonedCard:K,resetErrorHandling:re,createErrorCard:V,setErrorMessage:L,getQualifier:A,getTrimmedDataURIName:D,addSupportingObjects:q,oVisibility:r.oVisibility,bError:false,bNewStaticLinkListCardFlag:false,bNewKPICardFlag:false,bAddNewCardFlag:false,aListType:r.aListType,aListFlavour:r.aListFlavour,aDataPointSelectionMode:r.aDataPointSelectionMode,aSortOrder:r.aSortOrder,aCardType:r.aCardType,aLinkListFlavour:r.aLinkListFlavour,getDialogBox:function(a){return new Promise(function(i,o){if(!this.dialogBox){this.oSaveButton=new t("settingsSaveBtn",{text:h.getText("save"),type:"Emphasized"});var l=new t("settingsCancelBtn",{text:h.getText("cancelBtn")});this.oResetButton=new t("settingsResetBtn",{text:h.getText("resetCardBtn")});this.oMessagePopOverButton=new t("settingsMessagePopOverBtn",{text:"{/Counter/All}",type:"Emphasized",icon:"sap-icon://message-popup",visible:"{= ${/Counter/All} === 0 ? false : true}"}).addStyleClass("sapOvpSettingsMessagePopOverBtn");this.dialogBox=new e("settingsDialog",{title:h.getText("settingsDialogTitle"),buttons:[this.oMessagePopOverButton,this.oSaveButton,l,this.oResetButton],afterClose:function(e){var t=this.dialogBox.getContent()[0],a=t.byId("sapOvpSettingsLineItemTitle"),i=t.byId("sapOvpSettingsLineItemSubTitle");if(a){a.destroy()}if(i){i.destroy()}this.bNewStaticLinkListCardFlag=false;this.bNewKPICardFlag=false;this.bAddNewCardFlag=false;this.newDataSource=false;this.dialogBox.destroyContent();this.detachWindowResizeHandler()}.bind(this)});this.dialogBox.setBusyIndicatorDelay(0);l.attachPress(function(e){this.dialogBox.close()}.bind(this))}this.oResetButton.setVisible(!this.bNewKPICardFlag);ne.bind(this)();var d=this.bNewStaticLinkListCardFlag||this.bNewKPICardFlag||this.bAddNewCardFlag;var p=a.getComponentInstance(),c=p.getRootControl().getModel("ovpCardProperties"),y;this.oi18nModel=p.getComponentData().i18n;if(this.bNewStaticLinkListCardFlag){y={title:"New Title",subTitle:"New Subtitle",staticContent:[],listFlavor:"standard",template:"sap.ovp.cards.linklist",layoutDetail:c.getProperty("/layoutDetail")}}else if(this.bNewKPICardFlag){var m=p.getComponentData().mainComponent.getView().getModel("JSONModelForSSB").getProperty("/d/results"),C=m[0];y={entitySet:C.ODataEntityset,kpiAnnotationPath:"com.sap.vocabularies.UI.v1.KPI#"+C.KPIQualifier,title:C.GroupTitle,subTitle:C.KPITitle,template:"sap.ovp.cards.charts.analytical",layoutDetail:c.getProperty("/layoutDetail"),selectedKPI:C,errorStatusText:undefined,KPIData:m}}else if(this.bAddNewCardFlag){y={addNewCard:true,newDataSource:false,title:"",subTitle:"",cardType:this.aCardType,aListType:this.aListType,aListFlavour:this.aListFlavour,valueSelectionInfo:"",navigation:this.aDataPointSelectionMode,aLinkListFlavour:this.aLinkListFlavour,authorization:""}}else{y=c.getData()}var P=v({},y);P=q.call(this,P);P=this.addManifestSettings(P);var w=new f(P),I=a.getDomRef().offsetHeight,E=new f(s.system),T=new f({deviceMedia:"Row"}),D=p.getComponentData(),V=D.mainComponent,L=D.appComponent,A=d?"":D.cardId;this.oAppComponent=L;this.oAppDescriptor=V._getCardFromManifest(A);this.sApplicationId=V._getApplicationId();this.oMainComponent=V;this.oOriginalAppDescriptor=L._getOvpCardOriginalConfig(A);E.setDefaultBindingMode("OneWay");P.dialogBoxHeight=I;P.dialogBoxWidth=20;var x=[];if(P.customParams||P.staticParameters){w.setProperty("/addCustomParameters",true);if(P.staticParameters&&Object.keys(P.staticParameters).length){for(var _ in P.staticParameters){x.push({key:_,value:P.staticParameters[_]})}w.setProperty("/aAllStaticParameters",x)}}else{w.setProperty("/addCustomParameters",false)}var k=n._getLayer();if(k===g.Layers.vendor){w.setProperty("/layer",k);if(P.objectStreamCardsSettings&&P.objectStreamCardsSettings.customActions){w.setProperty("/addCustomActions",true)}else{w.setProperty("/addCustomActions",false)}var N=p.getComponentData().appComponent.sId;var M=S.byId(N+"---mainView").getModel("i18n");var F=M.oData.bundle&&M.oData.bundle.oi18nModel;if(Array.isArray(F)&&F[0]&&F[0].aPropertyFiles[0]&&F[0].aPropertyFiles[0].mProperties){var B=F[0].aPropertyFiles[0].mProperties;var K=[];var U=[];var H=[];var W=[];if(!P.addNewCard){var j=r.oI18nKeyValueProperty;for(var _ in j){if(_==="title"){U.push({key:"",value:P[_]})}if(_==="subTitle"){H.push({key:"",value:P[_]})}if(_==="valueSelectionInfo"){W.push({key:"",value:P[_]})}}for(var _ in B){if(B.hasOwnProperty(_)){U.push({key:_,value:B[_]})}}for(var _ in B){if(B.hasOwnProperty(_)){H.push({key:_,value:B[_]})}}for(var _ in B){if(B.hasOwnProperty(_)){W.push({key:_,value:B[_]})}}w.setProperty("/ai18nPropertiesAndTitle",U);w.setProperty("/ai18nPropertiesAndSubTitle",H);w.setProperty("/ai18nPropertiesAndValSelInfo",W)}for(var _ in B){if(B.hasOwnProperty(_)){K.push({key:_,value:B[_]})}}w.setProperty("/ai18nProperties",K)}}if(P.template==="sap.ovp.cards.linklist"||P.template==="sap.ovp.cards.v4.linklist"){w.setProperty("/listFlavorName",h.getText("OVP_KEYUSER_CAROUSEL"))}else{w.setProperty("/listFlavorName",h.getText("OVP_KEYUSER_BARLIST"))}if(P.layoutDetail==="resizable"){var z=["sap.ovp.cards.list","sap.ovp.cards.table","sap.ovp.cards.v4.list","sap.ovp.cards.v4.table"];if(!P.defaultSpan){P.defaultSpan={};w.setProperty("/defaultSpan/cols",w.getProperty("/cardLayout/colSpan"));w.setProperty("/defaultSpan/rows",z.indexOf(P.template)?w.getProperty("/cardLayout/noOfItems"):w.getProperty("/cardLayout/rowSpan"))}else{if(!P.defaultSpan.rows){w.setProperty("/defaultSpan/rows",z.indexOf(P.template)?w.getProperty("/cardLayout/noOfItems"):w.getProperty("/cardLayout/rowSpan"))}if(!P.defaultSpan.cols){w.setProperty("/defaultSpan/cols",w.getProperty("/cardLayout/colSpan"))}}P.NoOfColumns=[];var G=1,$=6;for(var Q=G;Q<=$;Q++){P.NoOfColumns.push({value:Q})}if(R(P.template,"chart")||P.template==="sap.ovp.cards.linklist"||P.template==="sap.ovp.cards.v4.linklist"){var X=a.getComponentInstance().getComponentData().mainComponent,Z=X.getLayout(),ee=Z.getDashboardLayoutUtil(),te=V._getCardId(a.getId()),ae=ee.calculateCardProperties(te),re=ee._getCardController(te).getView().byId("bubbleText")?43:0,se=ae.headerHeight+ae.dropDownHeight+re+50,oe=Math.ceil(ae.minCardHeight/ee.getRowHeightPx())+1;P.NoOfRows=[];P.NoOfRows.push({name:"None",value:0});P.NoOfRows.push({name:"Small",value:oe});P.NoOfRows.push({name:"Standard",value:Math.ceil((se+480)/ee.getRowHeightPx())+1});if(this.bNewStaticLinkListCardFlag||this.bNewKPICardFlag){w.setProperty("/defaultSpan/cols",1);w.setProperty("/defaultSpan/rows",oe)}}}if(P.addNewCard){w.setProperty("/addViewSwitchCheckBox",false);w.setProperty("/addKPIHeaderCheckBox",false);var le=[];var de=V.oCardsModels;if(de){for(var _ in de){if(_.indexOf("kpi_card_model_")<0){le.push(Object.assign({},{Title:_},de[_]))}}w.setProperty("/datasources",le);w.setProperty("/datasourcesFromManifest",le)}}var pe={};var ce=new f(pe);J(ce);if((P.template==="sap.ovp.cards.linklist"||P.template==="sap.ovp.cards.v4.linklist")&&P.staticContent){Y(w);w.setProperty("/lineItemId","linkListItem--1");w.setProperty("/lineItemIdCounter",P.staticContent.length)}if(P.template==="sap.ovp.cards.charts.analytical"){var ue=V._getCardId(a.getId());w.setProperty("/NewKPICard",this.bNewKPICardFlag);w.setProperty("/selectedKPICardID",ue)}this.setVisibilityForFormElements(P);var fe=new f(this.oVisibility);if(!this.bAddNewCardFlag){w.attachPropertyChange(ie.bind(this))}var he=new b("settingsView",{viewName:"sap.ovp.cards.rta.SettingsDialog",type:u.XML,preprocessors:{xml:{bindingContexts:{ovpCardProperties:w.createBindingContext("/")},models:{ovpCardProperties:w,deviceSystemProperties:E}}}});he.setModel(ce,"staticCardProperties");var ge=h.oResourceModel;he.setModel(w);he.setModel(ge,"ovpResourceModel");he.setModel(T,"deviceMediaProperties");he.setModel(fe,"visibility");if(this.oi18nModel){he.setModel(this.oi18nModel,"@i18n")}this.dialogBox.addContent(he);this.attachWindowResizeHandler();he.loaded().then(function(e){if(!this.bAddNewCardFlag){var t=e.byId("dialogCard");if(!t.getVisible()){t=e.byId("dialogCardNoPreview");var r=he.getModel().getProperty("/template").split("."),n=r[r.length-1],s=h.getText("OVP_KEYUSER_NO_CARD_PREVIEW_MSG",[n]);t.setText(s)}else{t.setWidth(P.dialogBoxWidth+"rem")}}O(a,e,d);this.dialogBox.open();e.getController().settingsResolve=i}.bind(this))}.bind(this))}};ce.fnEditCardHandler=function(e,t){var a=e.getComponentInstance().getComponentData().mainComponent,i=a.getLayout(),r=a.getUIModel();return ce.getDialogBox(e).then(function(t){var s=[{appComponent:e.getComponentInstance().getComponentData().appComponent,changeSpecificData:{appDescriptorChangeType:"appdescr_ovp_changeCard",content:t.appDescriptorChange}},{selectorControl:n.getApp().getLayout(),changeSpecificData:{runtimeOnly:true,changeType:"editCardSettings",content:t.flexibilityChange}}];if(t.viewSwitchChange){s.push({selectorControl:n.getApp().getLayout(),changeSpecificData:{changeType:"viewSwitch",content:t.viewSwitchChange}})}if(r.getProperty("/containerLayout")==="resizable"){var o=i.getDashboardLayoutModel(),l=i.getDashboardLayoutUtil(),d=a._getCardId(e.getId()),p=o.getCardById(d),c=l.calculateCardProperties(d),u=o.getColCount(),f="C"+u,h=t.flexibilityChange.newAppDescriptor.settings.defaultSpan,g,v=[];if(h&&h.cols){s.forEach(function(e){if(e.changeSpecificData.changeType==="editCardSettings"){var t=e.changeSpecificData.content.oldAppDescriptor;t.settings.defaultSpan={rowSpan:p.dashboardLayout.rowSpan,colSpan:p.dashboardLayout.colSpan,showOnlyHeader:p.dashboardLayout.showOnlyHeader}}});if(h.rows===0){p.dashboardLayout.autoSpan=false;g=Math.ceil((c.headerHeight+2*l.CARD_BORDER_PX)/l.getRowHeightPx())}else{p.dashboardLayout.autoSpan=true;var y=["sap.ovp.cards.list","sap.ovp.cards.table","sap.ovp.cards.v4.list","sap.ovp.cards.v4.table"];if(y.indexOf(p.template>-1)){p.dashboardLayout.noOfItems=h.rows}else{g=h.rows}}o._arrangeCards(p,{row:g,column:h.cols},"resize",v);o._removeSpaceBeforeCard(v);v.forEach(function(e){var t={};t.dashboardLayout={};t.cardId=e.content.cardId;t.dashboardLayout[f]=e.content.dashboardLayout;s.push({selectorControl:n.getApp().getLayout(),changeSpecificData:{changeType:"dragOrResize",content:t}})})}}return s})};ce.fnCloneCardHandler=function(e,t){return a.getPayLoadForCloneCard(e).then(function(t){return[{appComponent:e.getComponentInstance().getComponentData().appComponent,changeSpecificData:{appDescriptorChangeType:"appdescr_ovp_addNewCard",content:t.appDescriptorChange}},{selectorControl:n.getApp().getLayout(),changeSpecificData:{runtimeOnly:true,changeType:"newCardSettings",content:t.flexibilityChange}}]})};ce.fnAddStaticLinkListCardHandler=function(e,t){ce.bNewStaticLinkListCardFlag=true;return ce.getDialogBox(e).then(function(t){return[{appComponent:e.getComponentInstance().getComponentData().appComponent,changeSpecificData:{appDescriptorChangeType:"appdescr_ovp_addNewCard",content:t.appDescriptorChange}},{selectorControl:n.getApp().getLayout(),changeSpecificData:{runtimeOnly:true,changeType:"newCardSettings",content:t.flexibilityChange}}]})};ce.fnAddKPICardHandler=function(e,t){ce.bNewKPICardFlag=true;return ce.getDialogBox(e).then(function(t){var a=[{appComponent:e.getComponentInstance().getComponentData().appComponent,changeSpecificData:{appDescriptorChangeType:"appdescr_ovp_addNewCard",content:t.appDescriptorChange}},{selectorControl:n.getApp().getLayout(),changeSpecificData:{runtimeOnly:true,changeType:"newCardSettings",content:t.flexibilityChange}}];if(t.addODataAnnotation){a.push({appComponent:e.getComponentInstance().getComponentData().appComponent,changeSpecificData:{appDescriptorChangeType:"appdescr_app_addAnnotationsToOData",content:t.addODataAnnotation}})}return a})};ce.fnAddNewCardHandler=function(e,t){ce.bAddNewCardFlag=true;return ce.getDialogBox(e).then(function(t){var a=[{appComponent:e.getComponentInstance().getComponentData().appComponent,changeSpecificData:{appDescriptorChangeType:"appdescr_ovp_addNewCard",content:t.appDescriptorChange}},{selectorControl:n.getApp().getLayout(),changeSpecificData:{runtimeOnly:true,changeType:"newCardSettings",content:t.flexibilityChange}}];if(t.addODataAnnotation){a.push({appComponent:e.getComponentInstance().getComponentData().appComponent,changeSpecificData:{appDescriptorChangeType:"appdescr_app_addAnnotationsToOData",content:t.addODataAnnotation}})}return a})};ce.fnRemoveCardHandler=function(e,t){return new Promise(function(t,i){p.confirm(h.getText("OVP_KEYUSER_MESSAGE_BOX_WARNING_MESSAGE_DELETE"),{actions:[p.Action.DELETE,p.Action.CANCEL],icon:p.Icon.WARNING,title:h.getText("OVP_KEYUSER_MESSAGE_BOX_TITLE_DELETE"),initialFocus:p.Action.CANCEL,onClose:function(r){if(r==="DELETE"){t(a.getPayLoadForRemoveCard(e))}else{i(null)}}})}).then(function(t){var a=[{appComponent:e.getComponentInstance().getComponentData().appComponent,changeSpecificData:{appDescriptorChangeType:"appdescr_ovp_removeCard",content:t.appDescriptorChange}},{selectorControl:n.getApp().getLayout(),changeSpecificData:{runtimeOnly:true,changeType:"removeCardContainer",content:t.flexibilityChange}}];if(t.removeDataSourceChange){t.removeDataSourceChange.forEach(function(t){a.push({appComponent:e.getComponentInstance().getComponentData().appComponent,changeSpecificData:{appDescriptorChangeType:"appdescr_app_removeDataSource",content:t}})})}return a},function(e){return[]})};return ce},true);
//# sourceMappingURL=SettingsUtils.js.map