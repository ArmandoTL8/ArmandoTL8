/*!
* SAP APF Analysis Path Framework
* 
 * (c) Copyright 2012-2018 SAP SE. All rights reserved
*/
sap.ui.define(["sap/apf/core/constants","sap/apf/ui/utils/constants","sap/apf/ui/representations/BaseVizFrameChartRepresentation"],function(e,t,a){"use strict";var r=function(e,a){sap.apf.ui.representations.BaseVizFrameChartRepresentation.apply(this,[e,a]);this.type=t.representationTypes.STACKED_COMBINATION_CHART;this.chartType=t.vizFrameChartTypes.STACKED_COMBINATION};r.prototype=Object.create(sap.apf.ui.representations.BaseVizFrameChartRepresentation.prototype);r.prototype.getAxisFeedItemId=function(t){var a=e.representationMetadata.kind;var r;switch(t){case a.XAXIS:r=e.vizFrame.feedItemTypes.CATEGORYAXIS;break;case a.LEGEND:r=e.vizFrame.feedItemTypes.COLOR;break;case a.YAXIS:r=e.vizFrame.feedItemTypes.VALUEAXIS;break;default:break}return r};sap.apf.ui.representations.stackedCombinationChart=r;return r},true);
//# sourceMappingURL=stackedCombinationChart.js.map