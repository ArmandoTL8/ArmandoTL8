/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2015 SAP SE. All rights reserved
 */
jQuery.sap.declare("sap.apf.modeler.core.navigationTarget");(function(){"use strict";sap.apf.modeler.core.NavigationTarget=function(e,t,i){var n,r,a=false,s,o,c;var u=false;var p=[];if(i){n=i.semObject;r=i.actn;a=i.isStepSpecific;s=i.requestForFilterMapping;o=i.targetPropertiesForFilterMapping;p=i.parameters;c=i.titleKey;u=i.useDynamicParameters}else{s={};o=new t.constructors.ElementContainer("TargetPropertyForFilterMapping",undefined,t)}this.getId=function(){return e};this.setSemanticObject=function(e){n=e};this.getSemanticObject=function(){return n};this.setAction=function(e){r=e};this.getAction=function(){return r};this.isGlobal=function(){return!a};this.isStepSpecific=function(){return a};this.setGlobal=function(){a=false};this.setStepSpecific=function(){a=true};this.setFilterMappingService=function(e){s.service=e};this.getFilterMappingService=function(){return s.service};this.setFilterMappingEntitySet=function(e){s.entitySet=e};this.getFilterMappingEntitySet=function(){return s.entitySet};this.addFilterMappingTargetProperty=function(e){o.createElementWithProposedId(undefined,e)};this.getFilterMappingTargetProperties=function(){var e=[];var t=o.getElements();t.forEach(function(t){e.push(t.getId())});return e};this.removeFilterMappingTargetProperty=function(e){o.removeElement(e)};this.getNavigationParameter=function(e){var t;p.forEach(function(i){if(i.key===e){t=i}});return t};this.getAllNavigationParameters=function(){return p};this.addNavigationParameter=function(e,t,i){if(i===undefined||i>p.length){i=p.length}p.splice(i,0,{key:e,value:t})};this.removeNavigationParameter=function(e){var t;p.forEach(function(i,n){if(i.key===e){t=n}});if(t>=0){p.splice(t,1)}};this.setTitleKey=function(e){c=e};this.setUseDynamicParameters=function(e){u=e};this.getUseDynamicParameters=function(){return u};this.getTitleKey=function(){return c};this.copy=function(e){var i={semObject:n,actn:r,isStepSpecific:a,requestForFilterMapping:s,targetPropertiesForFilterMapping:o,parameters:p,titleKey:c,useDynamicParameters:u};var f=sap.apf.modeler.core.ConfigurationObjects.deepDataCopy(i);return new sap.apf.modeler.core.NavigationTarget(e||this.getId(),t,f)}}})();
//# sourceMappingURL=navigationTarget.js.map