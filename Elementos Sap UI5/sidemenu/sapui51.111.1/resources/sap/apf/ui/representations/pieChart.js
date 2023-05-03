/*!
* SAP APF Analysis Path Framework
*
 * (c) Copyright 2012-2014 SAP SE. All rights reserved
*/
sap.ui.define(["sap/apf/ui/representations/BaseVizFrameChartRepresentation","sap/apf/core/constants","sap/apf/ui/utils/constants"],function(e,t,a){"use strict";function n(t,n){e.apply(this,[t,n]);this.type=a.representationTypes.PIE_CHART;this.chartType=a.vizFrameChartTypes.PIE;this._addDefaultKind()}n.prototype=Object.create(e.prototype);n.prototype.constructor=n;n.prototype._addDefaultKind=function(){this.parameter.measures.forEach(function(e){if(e.kind===undefined){e.kind=t.representationMetadata.kind.SECTORSIZE}});this.parameter.dimensions.forEach(function(e){if(e.kind===undefined){e.kind=t.representationMetadata.kind.SECTORCOLOR}})};n.prototype.getAxisFeedItemId=function(e){var a=t.representationMetadata.kind;var n;switch(e){case a.SECTORCOLOR:n=t.vizFrame.feedItemTypes.COLOR;break;case a.SECTORSIZE:n=t.vizFrame.feedItemTypes.SIZE;break;default:break}return n};sap.apf.ui.representations.pieChart=n;return n},true);
//# sourceMappingURL=pieChart.js.map