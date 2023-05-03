/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
sap.ui.define(["sap/ui/model/FilterOperator"],function(e){"use strict";var t={};t.filterMethodTypes={selectionAsArray:"saa",filter:"f"};t.FilterOperators=e;t.BooleFilterOperators={AND:"and",OR:"or",NOT:"not"};t.aSelectOpt=[t.FilterOperators.EQ,t.FilterOperators.NE,t.FilterOperators.GT,t.FilterOperators.LT,t.FilterOperators.GE,t.FilterOperators.LE,t.FilterOperators.BT,t.FilterOperators.StartsWith,t.FilterOperators.Contains,t.FilterOperators.EndsWith];t.resourceLocation={applicationMessageDefinitionLocation:"applicationMessageDefinitionLocation",applicationMessageTextBundle:"applicationMessageTextBundle",apfUiTextBundle:"apfUiTextBundle",applicationUiTextBundle:"applicationUiTextBundle",analyticalConfigurationLocation:"analyticalConfigurationLocation"};t.message={};t.message.severity={fatal:"fatal",warning:"warning",error:"error",technError:"technError",information:"information",success:"success"};t.message.code={suppressFurtherException:"APFapf1972",errorCheck:"5100",errorCheckWarning:"5101",errorCheckConfiguration:"5102",errorCheckConfigurationWarning:"5103",errorUnknown:"9000",errorExitTriggered:"9001",errorInMessageDefinition:"9003"};t.eventTypes={contextChanged:"contextChanged",printTriggered:"printTriggered",format:"format"};t.configurationObjectTypes={facetFilter:"facetFilter",smartFilterBar:"smartFilterBar"};t.existsEmptyFacetFilterArray="__existsEmptyFacetFilterArray__";t.entitySets={application:"ApplicationQueryResults",configuration:"AnalyticalConfigurationQueryResults",texts:"TextElementQueryResults",logicalSystem:"SAPClientQuery",analysisPath:"AnalysisPathQueryResults",smartBusiness:"EVALUATIONS"};t.modelerPersistenceServiceRoot="/sap/hba/r/apf/core/odata/modeler/AnalyticalConfiguration.xsodata";t.developmentLanguage="";t.textKeyForInitialText="00000000000000000000000000000000";t.representationMetadata={kind:{XAXIS:"xAxis",XAXIS2:"xAxis2",YAXIS:"yAxis",YAXIS2:"yAxis2",BUBBLEWIDTH:"bubbleWidth",SECTORSIZE:"sectorSize",LEGEND:"legend",SECTORCOLOR:"sectorColor",REGIONCOLOR:"regionColor",REGIONSHAPE:"regionShape",COLUMN:"column",HIERARCHIALCOLUMN:"hierarchicalColumn"},labelDisplayOptions:{KEY:"key",TEXT:"text",KEY_AND_TEXT:"keyAndText"},measureDisplayOptions:{BAR:"bar",LINE:"line"}};t.vizFrame={feedItemTypes:{CATEGORYAXIS:"categoryAxis",CATEGORYAXIS2:"categoryAxis2",COLOR:"color",VALUEAXIS:"valueAxis",VALUEAXIS2:"valueAxis2",BUBBLEWIDTH:"bubbleWidth",SIZE:"size",SHAPE:"shape",TIMEAXIS:"timeAxis"}};t.applicationConfiguration={applicationConfigPath:"config/applicationConfiguration.json"};return t},true);
//# sourceMappingURL=constants.js.map