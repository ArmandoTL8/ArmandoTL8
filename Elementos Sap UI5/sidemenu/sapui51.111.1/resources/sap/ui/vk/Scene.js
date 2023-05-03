/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["sap/ui/base/ManagedObject","./AnimationSequence","./AnimationTrack","./ViewGroup","./View","./Highlight"],function(e,t,i,s,r,n){"use strict";var u=e.extend("sap.ui.vk.Scene",{metadata:{library:"sap.ui.vk",abstract:true,properties:{doubleSided:{type:"boolean",defaultValue:false}}}});u.prototype.getInitialView=function(){return null};u.prototype.createSequence=function(e,i){var s=new t(e,i);this.addSequence(s);return s};u.prototype.getSequences=function(){if(!this._sequences){this._sequences=[]}return this._sequences};u.prototype.findSequence=function(e){if(!this._sequences){return undefined}return this._sequences.find(function(t){return t.getId()===e})};u.prototype.addSequence=function(e){if(!this._sequences){this._sequences=[]}this._sequences.push(e);return this};u.prototype.insertSequence=function(e,t){if(!this._sequences){this._sequences=[]}if(t<0){t=0}else if(t!==0&&t>=this._sequences.length){t=this._sequences.length}this._sequences.splice(t,0,e);return this};u.prototype.indexOfSequence=function(e){if(!this._sequences){return-1}return this._sequences.indexOf(e)};u.prototype.removeSequence=function(e){if(this._sequences){var t=this.indexOfSequence(e);if(t>=0){this._sequences.splice(t,1)}}return this};u.prototype.removeSequences=function(){if(this._sequences){this._sequences.splice(0)}return this};u.prototype.createTrack=function(e,t){var s=new i(e,t);this.addTrack(s);return s};u.prototype.getTracks=function(){if(!this._tracks){this._tracks=[]}return this._tracks};u.prototype.findTrack=function(e){if(!this._tracks){return undefined}return this._tracks.find(function(t){return t.getId()===e})};u.prototype.addTrack=function(e){if(!this._tracks){this._tracks=[]}this._tracks.push(e);return this};u.prototype.insertTrack=function(e,t){if(!this._tracks){this._tracks=[]}if(t<0){t=0}else if(t!==0&&t>=this._tracks.length){t=this._tracks.length}this._tracks.splice(t,0,e);return this};u.prototype.indexOfTrack=function(e){if(!this._tracks){return-1}return this._tracks.findIndex(function(t){return t==e})};u.prototype.removeTrack=function(e){if(this._tracks){var t=this.indexOfTrack(e);if(t>=0){this._tracks.splice(t,1)}}return this};u.prototype.removeTracks=function(){if(this._tracks){this._tracks.splice(0)}return this};u.prototype.getViewGroups=function(){if(!this._viewGroups){this._viewGroups=[]}return this._viewGroups};u.prototype.createViewGroup=function(e){if(!this._viewGroups){this._viewGroups=[]}var t=new s(e);this._viewGroups.push(t);return t};u.prototype.indexOfViewGroup=function(e){if(!this._viewGroups){return-1}return this._viewGroups.find(function(t){return t==e})};u.prototype.insertViewGroup=function(e,t){if(!this._viewGroups){this._viewGroups=[]}if(t<0){t=0}else if(t!==0&&t>=this._viewGroups.length){t=this._viewGroups.length}this._viewGroups.splice(t,0,e);return this};u.prototype.removeViewGroup=function(e){var t=this.indexOfViewGroup(e);if(t>=0){this._viewGroups.splice(t,1)}return this};u.prototype.removeViewGroups=function(){this._viewGroups.splice(0);return this};u.prototype.findViewGroupByView=function(e){var t;if(this._viewGroups){for(var i=0;i<this._viewGroups.length;i++){if(this._viewGroups[i].indexOfView(e)>=0){t=this._viewGroups[i];break}}}return t};u.prototype.getViews=function(){if(!this._views){this._views=[]}return this._views};u.prototype.createView=function(e){if(!this._views){this._views=[]}var t=new r(e);this._views.push(t);return t};u.prototype.removeView=function(e){if(!this._views){return this}var t=this.getViewGroups();if(Array.isArray(t)){t.forEach(function(t){t.removeView(e)})}var i=this._views.indexOf(e);if(i>=0){this._views.splice(i,1)}return this};u.prototype.createHighlight=function(e,t){var i=new n(e,t);if(!this._highlights){this._highlights=new Map}this._highlights.set(e,i);return i};u.prototype.getHighlight=function(e){var t;if(this._highlights){t=this._highlights.get(e)}return t};u.prototype.removeHighlight=function(e){if(this._highlights){this._highlights.delete(e)}return this};return u});
//# sourceMappingURL=Scene.js.map