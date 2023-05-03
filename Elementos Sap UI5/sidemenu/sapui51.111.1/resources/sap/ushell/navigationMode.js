// Copyright (c) 2009-2022 SAP SE, All Rights Reserved
sap.ui.define(["sap/base/Log","sap/base/util/isPlainObject","sap/ushell/Config"],function(e,n,a){"use strict";var i={};var o=function(n){var a=true;if(n){if(typeof n!=="object"){a=false}else{Object.keys(n).forEach(function(e){if(["GUI","WDA","WCF"].indexOf(e)===-1){a=false}else if(typeof n[e]!=="boolean"){a=false}})}}if(!a){e.error("Invalid parameter: 'enableInPlaceForClassicUIs' must be an object; allowed properties: GUI|WDA, type boolean","Actual parameter: "+JSON.stringify(n),"sap.ushell.services.navigationMode")}};var t=function(e){switch(e){case"TR":return"GUI";case"WDA":return"WDA";case"WCF":return"WCF";default:return undefined}};i._isInplaceEnabledForApplicationType=function(e){var i=a.last("/core/navigation/enableInPlaceForClassicUIs");o(i);if(n(i)){return i[t(e)]}return false};i.compute=function(n,a,o){var t;var d={};if(["inplace","explace"].indexOf(a)>=0){d["sap-ushell-next-navmode"]=a}if(["inplace","explace","frameless"].indexOf(o)>=0){t=i._getInternalNavigationMode(o,n);e.debug("Navigation mode was forced to "+t+" because sap-ushell-navmode parameter was set to "+o+" for target","sap.ushell.navigationMode");d.navigationMode=t;d.explicitNavMode=true;return d}if(i._isInplaceEnabledForApplicationType(n)===true){d.navigationMode=i._getInternalNavigationMode("inplace",n);d.explicitNavMode=false}return d};i._getInternalNavigationMode=function(n,a){var i={SAPUI5:{inplace:"embedded",explace:"newWindowThenEmbedded",frameless:"newWindowThenEmbedded"},WDA:{inplace:"embedded",explace:"newWindowThenEmbedded",frameless:"newWindow"},TR:{inplace:"embedded",explace:"newWindowThenEmbedded",frameless:"newWindow"},URL:{inplace:"embedded",explace:"newWindow",frameless:"newWindow"},WCF:{inplace:"embedded",explace:"newWindowThenEmbedded",frameless:"newWindow"}};if(!i.hasOwnProperty(a)){e.error(a+" is not a valid application type","expected one of "+Object.keys(i).join(", "),"sap.ushell.navigationMode");return null}if(n!=="inplace"&&n!=="explace"&&n!=="frameless"){e.error(n+" is not a valid external navigation mode","expected one of 'inplace', 'explace' or 'frameless'","sap.ushell.navigationMode");return null}if(a==="SAPUI5"&&n==="frameless"){e.error("'"+n+"' is not a valid external navigation mode for application type '"+a+"'","falling back to internal navigation mode '"+i.SAPUI5.frameless+"'","sap.ushell.navigationMode")}return i[a][n]};i.getExternalNavigationMode=function(n){var a={embedded:"inplace",newWindowThenEmbedded:"explace",replace:"inplace",newWindow:"explace"};if(!a.hasOwnProperty(n)){e.error(n+" is not a recognized internal navigation mode","expected one of "+Object.keys(a).join(","),"sap.ushell.navigationMode");return null}return a[n]};var d=["NWBC","WDA","TR","WCF"];i.getNavigationMode=function(n,a){var i=n.additionalInformation,o=n.applicationType,t,r;if(d.indexOf((a||{}).applicationType)>-1&&!(a||{}).explicitNavMode){return"newWindowThenEmbedded"}if(n.appCapabilities&&n.appCapabilities.navigationMode){return n.appCapabilities.navigationMode}if((i===null||typeof i==="string"||typeof i==="undefined")&&(o==="URL"||o==="SAPUI5")){if(i&&i.indexOf("managed=")===0){if(i==="managed=FioriWave1"){return"embedded"}if(i==="managed="){return"newWindow"}return undefined}if(i&&i.indexOf("SAPUI5.Component=")===0){t="[a-zA-Z0-9_]+";r=["^SAPUI5.Component=",t,"([.]",t,")*$"].join("");if(!new RegExp(r).test(i)){e.warning(["The UI5 component name in",i,"is not valid.","Please use names satisfying",r].join(" "))}return"embedded"}return"newWindow"}if(d.indexOf(o)>-1){return"newWindowThenEmbedded"}return undefined};i.computeNavigationModeForHomepageTiles=function(e,n,a){var i={applicationType:e,additionalInformation:n};if(d.indexOf(e)>-1&&a){return"embedded"}return this.getNavigationMode(i)};return i},false);
//# sourceMappingURL=navigationMode.js.map