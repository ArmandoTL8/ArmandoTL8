// Copyright (c) 2009-2022 SAP SE, All Rights Reserved
sap.ui.define(["sap/ushell/adapters/cdm/_LaunchPage/readHome"],function(e){"use strict";function i(e){return r(e,"Home",true)}function r(e,i,r){var t={identification:{id:e,namespace:"",title:i},payload:{isPreset:false,locked:false,tiles:[],links:[],groups:[]}};if(r){t.payload.isDefaultGroup=true}return t}function t(i,r,t){var o=e.getGroupId(r);i.groups[o]=r;if(t!==undefined){i.site.payload.groupsOrder.splice(t,0,o)}else{i.site.payload.groupsOrder.push(o)}return i}function o(e,i,r){if(e&&e.groups&&e.groups[r]){e.groups[r]=i}return e}function u(e,i){if(e&&e.groups&&e.groups[i.identification.id]){delete e.groups[i.identification.id]}if(e&&e.site&&e.site.payload&&e.site.payload.groupsOrder){e.site.payload.groupsOrder=e.site.payload.groupsOrder.filter(function(e){return e!==i.identification.id})}return e}function s(e,i){e.site.payload.groupsOrder=i;return e}function n(e,i){e.identification.title=i}function a(e,i){if(i){delete e.identification.isVisible}else{e.identification.isVisible=false}}return{createDefaultGroup:i,createEmptyGroup:r,addGroupToSite:t,overwriteGroup:o,removeGroupFromSite:u,setGroupsOrder:s,setGroupTitle:n,setGroupVisibility:a}},false);
//# sourceMappingURL=modifyHome.js.map