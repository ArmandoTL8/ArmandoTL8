/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2013 SAP AG. All rights reserved
 */
sap.ui.define(["sap/landvisz/library","sap/ui/core/Control","./OptionRenderer"],function(t,i,n){"use strict";var e=i.extend("sap.landvisz.Option",{metadata:{library:"sap.landvisz",properties:{type:{type:"string",group:"Identification",defaultValue:null},currentEntity:{type:"string",group:"Data",defaultValue:null}},aggregations:{optionEntities:{type:"sap.landvisz.OptionEntity",multiple:true,singularName:"optionEntity"}}}});e.prototype.init=function(){this.viewType};return e});
//# sourceMappingURL=Option.js.map