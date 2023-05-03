/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP SE. All rights reserved
 */
sap.ui.define(["sap/apf/ui/representations/BaseVizFrameChartRepresentation","sap/apf/core/constants","sap/apf/ui/utils/constants"],function(e,t,a){"use strict";function n(t,n){e.apply(this,[t,n]);this.type=a.representationTypes.COLUMN_CHART;this.chartType=a.vizFrameChartTypes.COLUMN;this._addDefaultKind()}n.prototype=Object.create(e.prototype);n.prototype.constructor=n;n.prototype._addDefaultKind=function(){this.parameter.measures.forEach(function(e){if(e.kind===undefined){e.kind=t.representationMetadata.kind.YAXIS}});this.parameter.dimensions.forEach(function(e,a){if(e.kind===undefined){e.kind=a===0?t.representationMetadata.kind.XAXIS:t.representationMetadata.kind.LEGEND}})};n.prototype.getAxisFeedItemId=function(e){var a=t.representationMetadata.kind;var n;switch(e){case a.XAXIS:n=t.vizFrame.feedItemTypes.CATEGORYAXIS;break;case a.YAXIS:n=t.vizFrame.feedItemTypes.VALUEAXIS;break;case a.LEGEND:n=t.vizFrame.feedItemTypes.COLOR;break;default:break}return n};sap.apf.ui.representations.columnChart=n;return n},true);
//# sourceMappingURL=columnChart.js.map