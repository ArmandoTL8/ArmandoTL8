/*!
* SAP APF Analysis Path Framework
* 
 * (c) Copyright 2012-2014 SAP SE. All rights reserved
*/
sap.ui.define(["sap/apf/ui/representations/BaseVizFrameChartRepresentation","sap/apf/core/constants"],function(e,a){"use strict";var t=function(e,a){sap.apf.ui.representations.BaseVizFrameChartRepresentation.apply(this,[e,a]);this.type=sap.apf.ui.utils.CONSTANTS.representationTypes.DONUT_CHART;this.chartType=sap.apf.ui.utils.CONSTANTS.vizFrameChartTypes.DONUT};t.prototype=Object.create(sap.apf.ui.representations.BaseVizFrameChartRepresentation.prototype);t.prototype.getAxisFeedItemId=function(e){var a=sap.apf.core.constants.representationMetadata.kind;var t;switch(e){case a.SECTORCOLOR:t=sap.apf.core.constants.vizFrame.feedItemTypes.COLOR;break;case a.SECTORSIZE:t=sap.apf.core.constants.vizFrame.feedItemTypes.SIZE;break;default:break}return t};return t},true);
//# sourceMappingURL=donutChart.js.map