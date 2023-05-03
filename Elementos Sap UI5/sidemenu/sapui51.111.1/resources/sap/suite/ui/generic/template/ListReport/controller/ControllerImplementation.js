sap.ui.define(["sap/ui/model/Filter","sap/suite/ui/generic/template/ListReport/extensionAPI/ExtensionAPI","sap/suite/ui/generic/template/listTemplates/listUtils","sap/suite/ui/generic/template/listTemplates/controller/MessageStripHelper","sap/suite/ui/generic/template/ListReport/controller/IappStateHandler","sap/suite/ui/generic/template/ListReport/controller/MultipleViewsHandler","sap/suite/ui/generic/template/ListReport/controller/WorklistHandler","sap/suite/ui/generic/template/lib/ShareUtils","sap/suite/ui/generic/template/genericUtilities/controlHelper","sap/suite/ui/generic/template/genericUtilities/FeLogger","sap/base/util/ObjectPath","sap/suite/ui/generic/template/js/StableIdHelper","sap/base/util/deepExtend","sap/suite/ui/generic/template/lib/CreateWithDialogHandler","sap/suite/ui/generic/template/ListReport/controller/MultiEditHandler","sap/ui/generic/app/navigation/service/SelectionVariant","sap/suite/ui/generic/template/lib/AddCardsHelper","sap/suite/ui/generic/template/listTemplates/filterSettingsPreparationHelper"],function(e,t,n,a,i,r,o,l,s,c,d,u,p,g,f,m,v,S){"use strict";var C=new c("ListReport.controller.ControllerImplementation").getLogger();var b={getMethods:function(c,b,h){var E={};E.oWorklistData={bWorkListEnabled:!!b.oComponentUtils.getSettings().isWorklist};var y;var T=null;function I(){var e=h.getOwnerComponent();var t=b.oComponentUtils.getTemplatePrivateModel();t.setProperty("/listReport/isLeaf",e.getIsLeaf())}function F(e){var t=e.getSource();var n=h.getOwnerComponent().getAnnotationPath();if(n!==undefined){D(t,n)}h.onInitSmartFilterBarExtension(e);h.templateBaseExtension.onInitSmartFilterBar(e)}function D(e,t){if(t.indexOf("com.sap.vocabularies.UI.v1.PresentationVariant")>-1){return}var a=new m(JSON.stringify(e.getUiState().getSelectionVariant()));var i=h.getOwnerComponent().getModel().getMetaModel();var r=h.getOwnerComponent().getEntitySet();var o=i.getODataEntityType(i.getODataEntitySet(r).entityType);var l=i.getObject(o.$path+"/"+t);if(l&&l.SelectionVariant&&(l.SelectionVariant.Path||l.SelectionVariant.AnnotationPath)){t=(l.SelectionVariant.Path||l.SelectionVariant.AnnotationPath).split("@")[1]}var s=i.getObject(o.$path+"/"+t);if(s){s=n.createSVObject(s,e);s.FilterContextUrl=a.getFilterContextUrl();E.oIappStateHandler.setFiltersUsingUIState(s.toJSONObject(),true,false)}else{var c=h.getOwnerComponent().getAppComponent().getNavigationController();c.navigateToMessagePage({title:b.oCommonUtils.getText("ST_ERROR"),text:"Manifest property 'annotationPath' is configured with "+t+" but no such annotation found.",description:""})}}function H(e){b.oCommonUtils.setEnabledToolbarButtons(e);if(!s.isSmartChart(e)){b.oCommonUtils.setEnabledFooterButtons(e)}}function P(e){var t;t=e.getSource();t.getChartAsync().then(function(e){e.attachSelectData(H.bind(null,t));e.attachDeselectData(H.bind(null,t))})}function M(e){var t=e.getParameters();var n=e.getSource();b.oCommonEventHandlers.onSemanticObjectLinkNavigationPressed(n,t)}function U(e){var t,n;t=e.getParameters();n=e.getSource();b.oCommonEventHandlers.onSemanticObjectLinkNavigationTargetObtained(n.getEntitySet(),n.getFieldSemanticObjectMap(),t,E)}function R(e){var t=e.getParameters(),n=t.mainNavigation,a=e.getSource(),i;if(n){i=a.getText&&a.getText();var r=b.oCommonUtils.getCustomData(e);if(r&&r["LinkDescr"]){var o=r["LinkDescr"];n.setDescription(o)}}b.oCommonEventHandlers.onSemanticObjectLinkNavigationTargetObtained(E.oPresentationControlHandler.getEntitySet(),{},t,E,i)}function w(e){var t=c.getItems();for(var n=0;n<t.length;n++){if(!e||t[n].getBindingContextPath()===e){return t[n]}}}function A(e){b.oCommonEventHandlers.onListNavigate(e,E,undefined,true)}function O(e,t,n){var a=b.oServices.oCRUDManager.getDefaultValues(t,e);if(a instanceof Promise){var i=function(e){n.call(this,e[0],t)};a.then(i,i)}else{n.call(this,e,t)}}function L(e,t){if(e){B(e,t)}else{O(null,t,B)}}function B(e,t){if(t.data("CrossNavigation")){b.oCommonUtils.fnProcessDataLossOrDraftDiscardConfirmation(function(){b.oCommonEventHandlers.addEntry(t,false,E.oSmartFilterbar,e)},Function.prototype,"LeaveApp")}else{b.oCommonEventHandlers.addEntry(t,false,E.oSmartFilterbar,e)}}function x(){var e=E.oMultipleViewsHandler.getMode()!=="single"&&E.oMultipleViewsHandler.getSelectedKey()||"";var t=u.getStableId({type:"ListReportAction",subType:"Create",sQuickVariantKey:e});b.oCommonUtils.executeIfControlReady(function(t){var n=u.getStableId({type:"ListReportAction",subType:"CreateWithDialog",sQuickVariantKey:e});var a=n&&h.byId(n);if(a){E.oCreateWithDialogHandler.createWithDialog(a,t)}else{L(null,t)}},t)}function V(e){O(undefined,e.getSource(),k)}function k(e,t){var n=h.getOwnerComponent().getCreateWithFilters();var a=n.strategy||"extension";var i;switch(a){case"extension":i=h.getPredefinedValuesForCreateExtension(E.oSmartFilterbar,e)||{};break;default:C.error(a+" is not a valid strategy to extract values from the SmartFilterBar");return}var r=u.getStableId({type:"ListReportAction",subType:"CreateWithDialog"});var o=r&&h.byId(r);if(o){E.oCreateWithDialogHandler.createWithDialog(o,t,i)}else{L(i,t)}}function N(e){var t=b.oComponentUtils.getTemplatePrivateModel();var n=t.getProperty("/listReport/deleteEnabled");if(n){b.oCommonEventHandlers.deleteEntries(e)}}function W(t){if(!b.oComponentUtils.isDraftEnabled()){return}var n=b.oComponentUtils.getTemplatePrivateModel();var a=n.getProperty("/listReport/vDraftState");switch(a){case"1":t.push(new e("IsActiveEntity","EQ",true));t.push(new e("HasDraftEntity","EQ",false));break;case"2":t.push(new e("IsActiveEntity","EQ",false));break;case"3":t.push(new e("IsActiveEntity","EQ",true));t.push(new e("SiblingEntity/IsActiveEntity","EQ",null));t.push(new e("DraftAdministrativeData/InProcessByUser","NE",""));break;case"4":t.push(new e("IsActiveEntity","EQ",true));t.push(new e("SiblingEntity/IsActiveEntity","EQ",null));t.push(new e("DraftAdministrativeData/InProcessByUser","EQ",""));break;case"5":t.push(new e("IsActiveEntity","EQ",true));break;default:var i=new e({filters:[new e("IsActiveEntity","EQ",false),new e("SiblingEntity/IsActiveEntity","EQ",null)],and:false});if(t[0]&&t[0].aFilters){var r=t[0];t[0]=new e([r,i],true)}else{t.push(i)}break}}function j(){return E.oSmartFilterbar.getBasicSearchValue()||E.oWorklistHandler.getSearchString()}function _(e){var t={sharePageToPressed:function(e){var t=b.oServices.oApplication.getBusyHelper();if(t.isBusy()){return}var n=b.oServices.oApplication.getAppTitle();var a=l.getCurrentUrl().then(function(t){switch(e){case"MicrosoftTeams":l.openMSTeamsShareDialog(n,t);break;case"Email":n=b.oCommonUtils.getText("EMAIL_HEADER",[n]);sap.m.URLHelper.triggerEmail(null,n,t);break;default:break}});t.setBusy(a)},shareJamPressed:function(){l.openJamShareDialog(b.oServices.oApplication.getAppTitle())},shareTilePressed:function(){l.fireBookMarkPress()},getDownloadUrl:function(){var e=E.oPresentationControlHandler.getBinding(E);return e&&e.getDownloadUrl()||""},getServiceUrl:function(){return E.oSmartFilterbar.hasDateRangeTypeFieldsWithValue().then(function(e){var n=e?"":t.getDownloadUrl();n=n&&n+"&$top=0&$inlinecount=allpages";var a={serviceUrl:n};h.onSaveAsTileExtension(a);return a.serviceUrl})},getModelData:function(){var e=d.get("sap.ushell.Container.getUser");var n=h.getOwnerComponent().getAppComponent().getMetadata();var a=n.getManifestEntry("sap.ui");var i=n.getManifestEntry("sap.app");return t.getServiceUrl().then(function(t){return l.getCurrentUrl().then(function(n){return{serviceUrl:t,icon:a&&a.icons?a.icons.icon:"",title:i?i.title:"",isShareInJamActive:!!e&&e().isJamActive(),customUrl:l.getCustomUrl(),currentUrl:n}})})}};l.openSharePopup(b.oCommonUtils,e,t)}function Q(e){var t=e.getId();var n=E.oSmartFilterbar;var a="";var i=[];var r=!!(b.oComponentUtils&&b.oComponentUtils.getSettings()&&(b.oComponentUtils.getSettings().quickVariantSelectionX||b.oComponentUtils.getSettings().quickVariantSelection));if(e.fetchVariant()&&e.fetchVariant().filter&&e.fetchVariant().filter.filterItems){i=e.fetchVariant().filter.filterItems}var o={search:!!n.getBasicSearchValue(),filter:!!(i.length||n.retrieveFiltersWithValues().length)};if(r){a=b.oCommonUtils.getContextText("NOITEMS_MULTIVIEW_LR_SMARTTABLE_WITH_FILTER",t)}else if(o.search||o.filter){a=b.oCommonUtils.getContextText("NOITEMS_LR_SMARTTABLE_WITH_FILTER",t)}else{a=b.oCommonUtils.getContextText("NOITEMS_LR_SMARTTABLE",t)}e.setNoData(a)}function q(e){var t=e.getId();var n=b.oCommonUtils.getContextText("NOITEMS_LR_SMARTCHART",t);e.getChartAsync().then(function(e){e.setCustomMessages({NO_DATA:n})})}function z(e){var t=e.getEntitySet();b.oComponentUtils.preloadComponent(t)}var J;function $(e){if(J){J()}J=Function.prototype;b.oCommonEventHandlers.onDataReceived(e);if(T){var t;var n=false;for(var a=0;a<T.aWaitingObjects.length&&!n;a++){t=w(T.aWaitingObjects[a]);if(t){A(t);T.resolve();n=true}}if(!n){t=w();if(t){A(t);T.resolve()}else{T.reject()}}T=null;return}y.handleDataReceived(e,A);var i=b.oComponentUtils.getTemplatePrivateModel();i.setProperty("/listReport/firstSelection",true);E.oIappStateHandler.setDataShownInTable(true);b.oComponentUtils.hidePlaceholder()}return{onInit:function(){E.oSmartFilterbar=h.byId("listReportFilter");E.oPresentationControlHandler=b.oServices.oPresentationControlHandlerFactory.getPresentationControlHandler(h.byId(u.getStableId({type:"ListReportTable",subType:"SmartTable"}))||h.byId(u.getStableId({type:"ListReportTable",subType:"SmartList"})));S.fnMergeControlConfiguration(E.oSmartFilterbar.getControlConfiguration());E.updateControlOnSelectionChange=H;y=b.oComponentUtils.getFclProxy();E.bLoadListAndFirstEntryOnStartup=y.isListAndFirstEntryLoadedOnStartup();var e=new r(E,h,b);E.oMultipleViewsHandler=e;E.oMessageStripHelper=new a(E.oPresentationControlHandler,e,h,b,"listReport");E.refreshModel=function(){var t=b.oCommonUtils.refreshModel(E.oPresentationControlHandler.getEntitySet());if(t){e.refreshSiblingControls(E.oPresentationControlHandler)}};E.oCreateWithDialogHandler=new g(E,h,b);E.oWorklistHandler=new o(E,h,b);E.oIappStateHandler=new i(E,h,b);E.oMultiEditHandler=new f(E,h,b);var t=b.oComponentUtils.getTemplatePrivateModel();t.setProperty("/generic/bDataAreShownInTable",false);t.setProperty("/listReport/firstSelection",false);t.setProperty("/listReport/isHeaderExpanded",true);t.setProperty("/listReport/deleteEnabled",false);t.setProperty("/listReport/multiEditEnabled",false);if(b.oComponentUtils.isDraftEnabled()){t.setProperty("/listReport/vDraftState","0")}t.setProperty("/listReport/multipleViews/msgVisibility",false);c.adaptToChildContext=function(e){E.oPresentationControlHandler.scrollToSelectedItemAsPerChildContext(e)};c.getItems=function(){return E.oPresentationControlHandler.getItems()};c.displayNextObject=function(e){return new Promise(function(t,n){T={aWaitingObjects:e,resolve:t,reject:n}})};c.refreshBinding=function(e,t){if(E.oIappStateHandler.areDataShownInTable()){if(E.oMultipleViewsHandler.refreshOperation(2,null,!e&&t)){return}if(e||t[h.getOwnerComponent().getEntitySet()]){b.oCommonUtils.refreshModel(h.getOwnerComponent().getEntitySet());E.oPresentationControlHandler.refresh()}}};c.getCurrentState=function(){return{permanentState:{data:E.oIappStateHandler.getCurrentAppState(),lifecycle:{permanent:true}}}};c.applyState=function(e){E.oIappStateHandler.applyState(e.permanentState).then(function(){if(!E.oIappStateHandler.areDataShownInTable()){y.handleDataReceived()}})};I();h.byId("template::FilterText").attachBrowserEvent("click",function(){h.byId("page").setHeaderExpanded(true)});var n=h.byId(u.getStableId({type:"ListReportAction",subType:"Share"})+"-internalBtn");n.attachPress(function(){_(n)})},handlers:{addEntry:x,addEntryWithFilters:V,deleteEntries:N,deleteEntry:function(e){b.oCommonEventHandlers.deleteEntry(e)},updateTableTabCounts:function(){E.oMultipleViewsHandler.fnUpdateTableTabCounts()},onCancelCreateWithPopUpDialog:function(){E.oCreateWithDialogHandler.onCancelPopUpDialog()},onSaveCreateWithPopUpDialog:function(e){E.oCreateWithDialogHandler.onSavePopUpDialog(e)},onSelectionChange:function(e){var t=e.getSource();H(t)},onMultiSelectionChange:function(e){b.oCommonEventHandlers.onMultiSelectionChange(e)},onContactDetails:function(e){b.oCommonEventHandlers.onContactDetails(e)},onSmartFilterBarInitialise:F,onSmartFilterBarInitialized:function(){E.oIappStateHandler.onSmartFilterBarInitialized()},onAfterSFBVariantLoad:function(e){E.oIappStateHandler.onAfterSFBVariantLoad(e)},onSmartListDataReceived:function(e){var t=e.getSource();$(t)},onBeforeRebindTable:function(e){var t=e.getSource();Q(t);var a=e.getParameters().bindingParams;E.oMultipleViewsHandler.aTableFilters=p({},a.filters);var i=a.filters.slice(0);b.oCommonEventHandlers.onBeforeRebindTable(e,{determineSortOrder:E.oMultipleViewsHandler.determineSortOrder,ensureExtensionFields:h.templateBaseExtension.ensureFieldsForSelect,addTemplateSpecificFilters:W,getSearchString:j,addExtensionFilters:h.templateBaseExtension.addFilters,resolveParamaterizedEntitySet:E.oMultipleViewsHandler.resolveParameterizedEntitySet,isFieldControlRequired:false,isPopinWithoutHeader:true,isDataFieldForActionRequired:true,isFieldControlsPathRequired:true,isMandatoryFiltersRequired:true});h.onBeforeRebindTableExtension(e);var r=a.events.dataRequested||Function.prototype;a.events.dataRequested=function(e){z(t);r.call(this,e)};var o=a.events.dataReceived||Function.prototype;a.events.dataReceived=function(e){$(t);o.call(this,e)};var l=a.events.refresh||Function.prototype;a.events.refresh=function(e){E.oMultipleViewsHandler.onDataRequested();l.call(this,e)};E.oMessageStripHelper.onBeforeRebindControl(e);E.oMultipleViewsHandler.onRebindContentControl(a,i);n.handleErrorsOnTableOrChart(b,e,E)},onListNavigate:function(e){b.oCommonEventHandlers.onListNavigate(e,E)},onEdit:function(e){b.oCommonEventHandlers.onListNavigate(e,E,undefined,undefined,true)},onCallActionFromToolBar:function(e){b.oCommonEventHandlers.onCallActionFromToolBar(e,E)},onDataFieldForIntentBasedNavigation:function(e){b.oCommonEventHandlers.onDataFieldForIntentBasedNavigation(e,E)},onDataFieldWithIntentBasedNavigation:function(e){b.oCommonEventHandlers.onDataFieldWithIntentBasedNavigation(e,E)},onBeforeSemanticObjectLinkNavigationCallback:function(e){return b.oCommonEventHandlers.onBeforeSemanticObjectLinkNavigationCallback(e)},onBeforeSemanticObjectLinkPopoverOpens:function(e){var t=e.getSource();var n=E.oSmartFilterbar.getUiState().getSelectionVariant();if(E.oSmartFilterbar.getEntitySet()!==t.getEntitySet()){n.FilterContextUrl=b.oServices.oApplication.getNavigationHandler().constructContextUrl(t.getEntitySet(),t.getModel())}var a=JSON.stringify(n);b.oCommonUtils.semanticObjectLinkNavigation(e,a,h,E)},onSemanticObjectLinkNavigationPressed:M,onSemanticObjectLinkNavigationTargetObtained:U,onSemanticObjectLinkNavigationTargetObtainedSmartLink:R,onDraftLinkPressed:function(e){var t=e.getSource();var n=t.getBindingContext();b.oCommonUtils.showDraftPopover(n,t)},onAssignedFiltersChanged:function(e){if(e.getSource()){h.byId("template::FilterText").setText(e.getSource().retrieveFiltersWithValuesAsText())}},onSearchButtonPressed:function(){E.oIappStateHandler.onSearchPressed()},onAddCardsToRepository:function(e){var t=E.oPresentationControlHandler;var n=h.getOwnerComponent();var a=t.getModel();var i=t.getEntitySet();var r=h.getView();var o=a.getMetaModel().getODataEntitySet(i);var l=a.getMetaModel().getODataEntityType(o.entityType);var s={};s["currentControlHandler"]=t;s["component"]=n;s["view"]=r;s["entitySet"]=o;s["entityType"]=l;s["oSmartFilterbar"]=E.oSmartFilterbar;var c=b.oComponentUtils.getTemplatePrivateModel();var d=c.getProperty("/listReport/oInsightsInstance");var u=c.getProperty("/listReport/vDraftState");if(u){s["oFECustomFilterData"]={name:"IsActiveEntity",value:u}}v.showColumnsForCardGeneration(s,e.getSource(),b).then(function(e){d.showCardPreview(e)})},onBeforeRebindChart:function(e){var t=e.getSource();q(t);var a=e.getParameters().bindingParams;E.oMultipleViewsHandler.aTableFilters=p({},a.filters);var i=a.filters.slice(0);var r={setBindingPath:t.setChartBindingPath.bind(t),ensureExtensionFields:Function.prototype,addTemplateSpecificFilters:W,addExtensionFilters:h.templateBaseExtension.addFilters,resolveParamaterizedEntitySet:E.oMultipleViewsHandler.resolveParameterizedEntitySet,isFieldControlRequired:false,isMandatoryFiltersRequired:true};b.oCommonUtils.onBeforeRebindTableOrChart(e,r,E.oSmartFilterbar);h.onBeforeRebindChartExtension(e);var o=a.events.dataReceived||Function.prototype;a.events.dataReceived=function(e){E.oMultipleViewsHandler.onDataRequested();b.oComponentUtils.hidePlaceholder();o.call(this,e)};E.oMultipleViewsHandler.onRebindContentControl(a,i);n.handleErrorsOnTableOrChart(b,e,E)},onChartInitialized:function(e){P(e);b.oCommonUtils.checkToolbarIntentsSupported(e.getSource())},onSelectionDetailsActionPress:function(e){E.oMultipleViewsHandler.onDetailsActionPress(e)},onShareListReportActionButtonPress:function(e){b.oCommonUtils.executeIfControlReady(_,u.getStableId({type:"ListReportAction",subType:"Share"})+"-internalBtn")},onInlineDataFieldForAction:function(e){b.oCommonEventHandlers.onInlineDataFieldForAction(e)},onInlineDataFieldForIntentBasedNavigation:function(e){b.oCommonEventHandlers.onInlineDataFieldForIntentBasedNavigation(e.getSource(),E)},onDeterminingDataFieldForAction:function(e){b.oCommonEventHandlers.onDeterminingDataFieldForAction(e,E.oPresentationControlHandler)},onDeterminingDataFieldForIntentBasedNavigation:function(e){b.oCommonEventHandlers.onDeterminingDataFieldForIntentBasedNavigation(e.getSource(),E.oPresentationControlHandler.getSelectedContexts(),E.oSmartFilterbar)},onTableInit:function(e){var t=e.getSource();b.oCommonUtils.checkToolbarIntentsSupported(t);var n=new sap.ui.model.base.ManagedObjectModel(t);t.setModel(n,"tableobserver")},onSearchWorkList:function(e){E.oWorklistHandler.performWorklistSearch(e)},onMultiEditButtonPress:function(){E.oMultiEditHandler.onMultiEditButtonPress()},onSaveMultiEditDialog:function(e){E.oMultiEditHandler.onSaveMultiEditDialog(e)},onCancelMultiEditDialog:function(e){E.oMultiEditHandler.onCancelMultiEditDialog(e)},dataStateFilter:function(e,t){return E.oMessageStripHelper.dataStateFilter(e,t)},dataStateClose:function(){E.oMessageStripHelper.onClose()}},formatters:{formatDraftType:function(e,t,n){if(e&&e.DraftUUID){if(!t){return sap.m.ObjectMarkerType.Draft}else if(n){return e.InProcessByUser?sap.m.ObjectMarkerType.Locked:sap.m.ObjectMarkerType.Unsaved}}return sap.m.ObjectMarkerType.Flagged},formatDraftVisibility:function(e,t){if(e&&e.DraftUUID){if(!t){return sap.m.ObjectMarkerVisibility.TextOnly}}return sap.m.ObjectMarkerVisibility.IconAndText},formatDraftLineItemVisible:function(e,t){if(e&&e.DraftUUID){if(t==="5"){return false}return true}return false},formatDraftOwner:function(e,t){var n="";if(e&&e.DraftUUID&&t){var a=e.InProcessByUserDescription||e.InProcessByUser||e.LastChangedByUserDescription||e.LastChangedByUser;if(a){n=b.oCommonUtils.getText("ST_DRAFT_OWNER",[a])}else{n=b.oCommonUtils.getText("ST_DRAFT_ANOTHER_USER")}}return n},formatItemTextForMultipleView:function(e){return E.oMultipleViewsHandler?E.oMultipleViewsHandler.formatItemTextForMultipleView(e):""},formatMessageStrip:function(e,t){return E.oMultipleViewsHandler?E.oMultipleViewsHandler.formatMessageStrip(e,t):""}},extensionAPI:new t(b,h,E)}}};return b});
//# sourceMappingURL=ControllerImplementation.js.map