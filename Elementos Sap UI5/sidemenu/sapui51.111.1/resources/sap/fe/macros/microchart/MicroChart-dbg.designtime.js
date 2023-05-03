/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define([], function () {
  "use strict";

  // Provides the Design Time Metadata for the sap.fe.macros.MicroChart macro.
  return {
    annotations: {
      /**
       * Renders a MicroChart based on the information that is provided within the <code>Chart</code> annotation. The <code>Chart</code> annotation
       * contains the <code>ChartType</code> property that must be defined. Supported chart types are Area, Bar, BarStacked, Bullet, Column, Donut, Line and Pie.
       *
       * <br>
       * <i>XML Example of using Chart annotation with Column ChartType</i>
       *
       * <pre>
       *    &lt;Annotations Target=&quot;SmartMicroChart.ProductType&quot; xmlns=&quot;http://docs.oasis-open.org/odata/ns/edm&quot;&gt;
       *      &lt;Annotation Term=&quot;com.sap.vocabularies.UI.v1.Chart&quot; Qualifier=&quot;ColumnChartQualifier&quot;&gt;
       *        &lt;Record Type=&quot;com.sap.vocabularies.UI.v1.ChartDefinitionType&quot;&gt;
       *          &lt;PropertyValue Property=&quot;ChartType&quot; EnumMember=&quot;com.sap.vocabularies.UI.v1.ChartType/Column&quot; /&gt;
       *          &lt;PropertyValue Property=&quot;Title&quot; String=&quot;ProductTitle&quot; /&gt;
       *          &lt;PropertyValue Property=&quot;Description&quot; String=&quot;ProductDescription&quot; /&gt;
       *          &lt;PropertyValue Property="Dimensions"&gt;
       *              &lt;Collection&gt;
       *                  &lt;PropertyPath&gt;Month&lt;/PropertyPath&gt;
       *              &lt;/Collection&gt;
       *          &lt;/PropertyValue&gt;
       *          &lt;PropertyValue Property=&quot;Measures&quot;&gt;
       *            &lt;Collection&gt;
       *              &lt;PropertyPath&gt;Price&lt;/PropertyPath&gt;
       *            &lt;/Collection&gt;
       *          &lt;/PropertyValue&gt;
       *          &lt;PropertyValue Property=&quot;MeasureAttributes&quot;&gt;
       *            &lt;Collection&gt;
       *              &lt;Record Type=&quot;com.sap.vocabularies.UI.v1.ChartMeasureAttributeType&quot;&gt;
       *                &lt;PropertyValue Property=&quot;Measure&quot; PropertyPath=&quot;Price&quot; /&gt;
       *                &lt;PropertyValue Property=&quot;Role&quot; EnumMember=&quot;com.sap.vocabularies.UI.v1.ChartMeasureRoleType/Axis1&quot; /&gt;
       *                &lt;PropertyValue Property=&quot;DataPoint&quot; AnnotationPath=&quot;@com.sap.vocabularies.UI.v1.DataPoint#ColumnChartDataPoint&quot; /&gt;
       *              &lt;/Record&gt;
       *            &lt;/Collection&gt;
       *          &lt;/PropertyValue&gt;
       *        &lt;/Record&gt;
       *      &lt;/Annotation&gt;
       *    &lt;/Annotations&gt;
       * </pre>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/UI.md#Chart  com.sap.vocabularies.UI.v1.Chart}</b><br/>
       *   </li>
       * </ul>
       */
      chart: {
        namespace: "com.sap.vocabularies.UI.v1",
        annotation: "Chart",
        target: ["EntityType"],
        defaultValue: null,
        since: "1.75"
      },
      /**
       * The <code>ChartDefinitionType</code> is a <code>ComplexType</code> that is used to describe the <code>Chart</code> annotation.
       * See XML Example for Chart annotation for reference.
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/UI.md#ChartDefinitionType  com.sap.vocabularies.UI.v1.ChartDefinitionType}</b><br/>
       *   </li>
       * </ul>
       */
      chartDefinitionType: {
        namespace: "com.sap.vocabularies.UI.v1",
        annotation: "ChartDefinitionType",
        target: ["EntityType"],
        defaultValue: null,
        since: "1.75"
      },
      /**
       * The <code>ChartType</code> is an <code>EnumType</code> that is provided within the <code>Chart</code> annotation to define the chart type.
       * Supported chart types are Area, Bar, BarStacked, Bullet, Column, Donut, Line and Pie.
       *
       * <br>
       * <i>XML Example of using ChartType property with Bullet</i>
       *
       * <pre>
       *    &lt;Annotation Term=&quot;com.sap.vocabularies.UI.v1.Chart&quot; Qualifier=&quot;BulletChartQualifier&quot;&gt;
       *      &lt;Record Type=&quot;com.sap.vocabularies.UI.v1.ChartDefinitionType&quot;&gt;
       *        &lt;PropertyValue Property=&quot;ChartType&quot; EnumMember=&quot;com.sap.vocabularies.UI.v1.Chart/Bullet&quot; /&gt;
       *      &lt;/Record&gt;
       *    &lt;/Annotation&gt;
       * </pre>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/UI.md#ChartType  com.sap.vocabularies.UI.v1.ChartType}</b><br/>
       *   </li>
       * </ul>
       */
      chartType: {
        namespace: "com.sap.vocabularies.UI.v1",
        annotation: "ChartType",
        target: ["Property"],
        defaultValue: null,
        since: "1.75"
      },
      /**
       * The <code>ChartMeasureAttributeType</code> is a <code>ComplexType</code> that is used to describe the Chart annotation property MeasureAttributes.
       * See XML Example for Chart annotation for reference.
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/UI.md#ChartMeasureAttributeType  com.sap.vocabularies.UI.v1.ChartMeasureAttributeType}</b><br/>
       *   </li>
       * </ul>
       */
      chartMeasureAttributeType: {
        namespace: "com.sap.vocabularies.UI.v1",
        annotation: "ChartMeasureAttributeType",
        since: "1.75"
      },
      /**
       * Based on the <code>DataPoint</code> annotation that is provided by <code>MeasureAttributes</code>, the values and colors of the chart are defined
       * by using the <code>Value</code> property and <code>Criticality</code> property.
       * The data point's <code>Value</code> must be the same property as in <code>Measure</code>.
       *
       * <br>
       * <i>XML Example of using DataPoint annotation (see also XML Example for Chart annotation)</i>
       *
       * <pre>
       *    &lt;Annotation Term=&quot;com.sap.vocabularies.UI.v1.DataPoint&quot; Qualifier=&quot;ColumnChartDataPoint&quot; &gt;
       *      &lt;Record Type=&quot;com.sap.vocabularies.UI.v1.DataPointType&quot;&gt;
       *        &lt;PropertyValue Property=&quot;Value&quot; Path=&quot;Price&quot; /&gt;
       *        &lt;PropertyValue Property=&quot;Title&quot; Path=&quot;Title&quot; /&gt;
       *        &lt;PropertyValue Property=&quot;Criticality&quot; Path=&quot;Criticality&quot;/&gt;
       *      &lt;/Record&gt;
       *    &lt;/Annotation&gt;
       * </pre>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/UI.md#DataPoint  com.sap.vocabularies.UI.v1.DataPoint}</b><br/>
       *   </li>
       * </ul>
       */
      dataPoint: {
        namespace: "com.sap.vocabularies.UI.v1",
        annotation: "DataPoint",
        target: ["EntityType"],
        defaultValue: null,
        since: "1.75"
      },
      /**
       * The <code>DataPointType</code> is a <code>ComplexType</code> that is used to define the type of the <code>DataPoint</code> annotation.
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/UI.md#DataPointType  com.sap.vocabularies.UI.v1.DataPointType}</b><br/>
       *   </li>
       * </ul>
       */
      dataPointType: {
        namespace: "com.sap.vocabularies.UI.v1",
        annotation: "DataPointType",
        target: ["EntityType"],
        defaultValue: null,
        since: "1.75"
      },
      /**
       * The <code>CriticalityType</code> is an <code>EnumType</code> that is used to define the type of
       * <code>Criticality</code> property in the <code>DataPoint</code> annotation.
       * The property defines a service-calculated criticality and is an alternative to <code>CriticalityCalculation</code>.
       *
       * <br>
       * <i>XML Example of using Criticality property with the CriticalityType</i>
       *
       * <pre>
       *    &lt;Record Type=&quot;com.sap.vocabularies.UI.v1.DataPointType&quot;&gt;
       *      &lt;PropertyValue Property=&quot;Title&quot; Path=&quot;Actual Cost&quot;/&gt;
       *      &lt;PropertyValue Property=&quot;Value&quot; Path=&quot;ActualCost&quot;/&gt;
       *      &lt;PropertyValue Property=&quot;Criticality&quot; EnumMember=&quot;com.sap.vocabularies.UI.v1.CriticalityType/Positive&quot; /&gt;
       *    &lt;/Record&gt;
       * </pre>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/UI.md#CriticalityType  com.sap.vocabularies.UI.v1.CriticalityType}</b><br/>
       *   </li>
       * </ul>
       */
      criticalityType: {
        namespace: "com.sap.vocabularies.UI.v1",
        annotation: "CriticalityType",
        target: ["Property"],
        defaultValue: null,
        since: "1.75"
      },
      /**
       * The <code>CriticalityCalculationType</code> is a <code>ComplexType</code> that is used to define the
       * type of <code>CriticalityCalculation</code> property in the <code>DataPoint</code> annotation.
       * These parameters are used for client-calculated criticality and are an alternative to <code>Criticality</code>.
       *
       * <br>
       * <i>XML Example of using CriticalityCalculation property with the CriticalityCalculationType type</i>
       *
       * <pre>
       *    &lt;PropertyValue Property=&quot;CriticalityCalculation&quot;&gt;
       *      &lt;Record Type=&quot;com.sap.vocabularies.UI.v1.CriticalityCalculationType&quot;&gt;
       *        &lt;PropertyValue Property=&quot;ImprovementDirection&quot; EnumMember=&quot;com.sap.vocabularies.UI.v1.ImprovementDirectionType/Target&quot; /&gt;
       *        &lt;PropertyValue Property=&quot;DeviationRangeLowValue&quot; Path=&quot;PriceDeviationLowerBound&quot;/&gt;
       *        &lt;PropertyValue Property=&quot;ToleranceRangeLowValue&quot; Path=&quot;PriceToleranceLowerBound&quot;/&gt;
       *        &lt;PropertyValue Property=&quot;ToleranceRangeHighValue&quot; Path=&quot;PriceToleranceUpperBound&quot;/&gt;
       *        &lt;PropertyValue Property=&quot;DeviationRangeHighValue&quot; Path=&quot;PriceDeviationUpperBound&quot;/&gt;
       *      &lt;/Record&gt;
       *    &lt;/PropertyValue&gt;
       * </pre>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/UI.md#CriticalityCalculationType  com.sap.vocabularies.UI.v1.CriticalityCalculationType}</b><br/>
       *   </li>
       * </ul>
       */
      criticalityCalculationType: {
        namespace: "com.sap.vocabularies.UI.v1",
        annotation: "CriticalityCalculationType",
        target: ["Property"],
        defaultValue: null,
        since: "1.75"
      },
      /**
       * The <code>Text</code> annotation describes the display value of the <code>Value</code> property in the <code>DataPoint</code> annotation.
       *
       * <br>
       * <i>XML Example of using Text annotation</i>
       *
       * <pre>
       *    &lt;Annotations Target=&quot;SalesOrderItem/Price&quot; xmlns=&quot;http://docs.oasis-open.org/odata/ns/edm&quot;&gt;
       *       &lt;Annotation Term=&quot;com.sap.vocabularies.Common.v1.Text&quot; Path=&quot;DisplayValue&quot; /&gt;
       *    &lt;/Annotations&gt;
       *    &lt;Property Name=&quot;DisplayValue&quot; type=&quot;Edm.String&quot; /&gt;
       * </pre>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/Common.md#Text  com.sap.vocabularies.Common.v1.Text}</b><br/>
       *   </li>
       * </ul>
       */
      text: {
        namespace: "com.sap.vocabularies.Common.v1",
        annotation: "Text",
        target: ["Property"],
        defaultValue: null,
        since: "1.75"
      },
      /**
       * Defines that a property is not displayed.
       * If the property <code>Value</code> of the <code>DataPoint</code> in the <code>MeasureAttribute</code>
       * of the Chart is annotated as hidden, the Chart is not rendered.
       *
       * <br>
       * <i>Example in OData V4 notation with hidden ProductUUID</i>
       *
       * <pre>
       *     &lt;Annotations Target=&quot;ProductCollection.Product/ProductUUID &quot;&gt;
       *         &lt;Annotation Term=&quot;com.sap.vocabularies.UI.v1.Hidden&quot;/&gt;
       *     &lt;/Annotations&gt;
       * </pre>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/SAP/odata-vocabularies/blob/master/vocabularies/UI.md#Hidden  com.sap.vocabularies.UI.v1.Hidden}</b><br/>
       *   </li>
       * </ul>
       */
      hidden: {
        namespace: "com.sap.vocabularies.UI.v1",
        annotation: "Hidden",
        target: ["Property", "Record"],
        since: "1.75"
      },
      /**
       * Defines a currency code for an amount according to the ISO 4217 standard. The <code>ISOCurrency</code> annotation can point to a
       * <code>Property</code>, which can also be <code>null</code>.
       * The currency code is rendered in the footer of the container containing the MicroChart, if showOnlyChart is false.
       *
       * <br>
       * <i>XML Example of OData V4 with Price and CurrencyCode as ISOCurrency</i>
       *
       * <pre>
       *    &lt;Annotations Target=&quot;SalesOrderItem/Price&quot; xmlns=&quot;http://docs.oasis-open.org/odata/ns/edm&quot;&gt;
       *      &lt;Annotation Term=&quot;Org.OData.Measures.V1.ISOCurrency&quot; Path=&quot;CurrencyCode&quot; /&gt;
       *    &lt;/Annotations&gt;
       *    &lt;Property Name=&quot;CurrencyCode&quot; type=&quot;Edm.String&quot; /&gt;
       * </pre>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/oasis-tcs/odata-vocabularies/blob/master/vocabularies/Org.OData.Measures.V1.md#ISOCurrency  Org.OData.Measures.V1.ISOCurrency}</b><br/>
       *   </li>
       * </ul>
       */
      currencyCode: {
        namespace: "Org.OData.Measures.V1",
        annotation: "ISOCurrency",
        target: ["Property"],
        defaultValue: null,
        since: "1.75"
      },
      /**
       * Returns the unit of measure for the measured quantity, for example 'cm' for 'centimeters', and renders the value associated with the Unit annotation
       * of a <code>Property</code>, which can be <code>null</code>.
       * The unit of measure is rendered in the footer of the container containing the MicroChart, if showOnlyChart is false.
       *
       * <br>
       * <i>XML Example of OData V4 with OrderedQuantity and OrderedUnit as Unit</i>
       *
       * <pre>
       *    &lt;Annotations Target=&quot;SalesOrderItem/OrderedQuantity&quot; xmlns=&quot;http://docs.oasis-open.org/odata/ns/edm&quot;&gt;
       *      &lt;Annotation Term=&quot;Org.OData.Measures.V1.Unit&quot; Path=&quot;OrderedUnit&quot; /&gt;
       *    &lt;/Annotations&gt;
       *    &lt;Property Name=&quot;OrderedUnit&quot; type=&quot;Edm.String&quot; /&gt;
       * </pre>
       *
       * <br>
       * <i><b><u>Documentation links</u></b></i>
       * <ul>
       *   <li>Term <b>{@link https://github.com/oasis-tcs/odata-vocabularies/blob/master/vocabularies/Org.OData.Measures.V1.md#Unit  Org.OData.Measures.V1.Unit}</b><br/>
       *   </li>
       * </ul>
       */
      unitOfMeasure: {
        namespace: "Org.OData.Measures.V1",
        annotation: "Unit",
        target: ["Property"],
        defaultValue: null,
        since: "1.75"
      }
    }
  };
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhbm5vdGF0aW9ucyIsImNoYXJ0IiwibmFtZXNwYWNlIiwiYW5ub3RhdGlvbiIsInRhcmdldCIsImRlZmF1bHRWYWx1ZSIsInNpbmNlIiwiY2hhcnREZWZpbml0aW9uVHlwZSIsImNoYXJ0VHlwZSIsImNoYXJ0TWVhc3VyZUF0dHJpYnV0ZVR5cGUiLCJkYXRhUG9pbnQiLCJkYXRhUG9pbnRUeXBlIiwiY3JpdGljYWxpdHlUeXBlIiwiY3JpdGljYWxpdHlDYWxjdWxhdGlvblR5cGUiLCJ0ZXh0IiwiaGlkZGVuIiwiY3VycmVuY3lDb2RlIiwidW5pdE9mTWVhc3VyZSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiTWljcm9DaGFydC5kZXNpZ250aW1lLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIFByb3ZpZGVzIHRoZSBEZXNpZ24gVGltZSBNZXRhZGF0YSBmb3IgdGhlIHNhcC5mZS5tYWNyb3MuTWljcm9DaGFydCBtYWNyby5cbmV4cG9ydCBkZWZhdWx0IHtcblx0YW5ub3RhdGlvbnM6IHtcblx0XHQvKipcblx0XHQgKiBSZW5kZXJzIGEgTWljcm9DaGFydCBiYXNlZCBvbiB0aGUgaW5mb3JtYXRpb24gdGhhdCBpcyBwcm92aWRlZCB3aXRoaW4gdGhlIDxjb2RlPkNoYXJ0PC9jb2RlPiBhbm5vdGF0aW9uLiBUaGUgPGNvZGU+Q2hhcnQ8L2NvZGU+IGFubm90YXRpb25cblx0XHQgKiBjb250YWlucyB0aGUgPGNvZGU+Q2hhcnRUeXBlPC9jb2RlPiBwcm9wZXJ0eSB0aGF0IG11c3QgYmUgZGVmaW5lZC4gU3VwcG9ydGVkIGNoYXJ0IHR5cGVzIGFyZSBBcmVhLCBCYXIsIEJhclN0YWNrZWQsIEJ1bGxldCwgQ29sdW1uLCBEb251dCwgTGluZSBhbmQgUGllLlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPlhNTCBFeGFtcGxlIG9mIHVzaW5nIENoYXJ0IGFubm90YXRpb24gd2l0aCBDb2x1bW4gQ2hhcnRUeXBlPC9pPlxuXHRcdCAqXG5cdFx0ICogPHByZT5cblx0XHQgKiAgICAmbHQ7QW5ub3RhdGlvbnMgVGFyZ2V0PSZxdW90O1NtYXJ0TWljcm9DaGFydC5Qcm9kdWN0VHlwZSZxdW90OyB4bWxucz0mcXVvdDtodHRwOi8vZG9jcy5vYXNpcy1vcGVuLm9yZy9vZGF0YS9ucy9lZG0mcXVvdDsmZ3Q7XG5cdFx0ICogICAgICAmbHQ7QW5ub3RhdGlvbiBUZXJtPSZxdW90O2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0JnF1b3Q7IFF1YWxpZmllcj0mcXVvdDtDb2x1bW5DaGFydFF1YWxpZmllciZxdW90OyZndDtcblx0XHQgKiAgICAgICAgJmx0O1JlY29yZCBUeXBlPSZxdW90O2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0RGVmaW5pdGlvblR5cGUmcXVvdDsmZ3Q7XG5cdFx0ICogICAgICAgICAgJmx0O1Byb3BlcnR5VmFsdWUgUHJvcGVydHk9JnF1b3Q7Q2hhcnRUeXBlJnF1b3Q7IEVudW1NZW1iZXI9JnF1b3Q7Y29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnRUeXBlL0NvbHVtbiZxdW90OyAvJmd0O1xuXHRcdCAqICAgICAgICAgICZsdDtQcm9wZXJ0eVZhbHVlIFByb3BlcnR5PSZxdW90O1RpdGxlJnF1b3Q7IFN0cmluZz0mcXVvdDtQcm9kdWN0VGl0bGUmcXVvdDsgLyZndDtcblx0XHQgKiAgICAgICAgICAmbHQ7UHJvcGVydHlWYWx1ZSBQcm9wZXJ0eT0mcXVvdDtEZXNjcmlwdGlvbiZxdW90OyBTdHJpbmc9JnF1b3Q7UHJvZHVjdERlc2NyaXB0aW9uJnF1b3Q7IC8mZ3Q7XG5cdFx0ICogICAgICAgICAgJmx0O1Byb3BlcnR5VmFsdWUgUHJvcGVydHk9XCJEaW1lbnNpb25zXCImZ3Q7XG5cdFx0ICogICAgICAgICAgICAgICZsdDtDb2xsZWN0aW9uJmd0O1xuXHRcdCAqICAgICAgICAgICAgICAgICAgJmx0O1Byb3BlcnR5UGF0aCZndDtNb250aCZsdDsvUHJvcGVydHlQYXRoJmd0O1xuXHRcdCAqICAgICAgICAgICAgICAmbHQ7L0NvbGxlY3Rpb24mZ3Q7XG5cdFx0ICogICAgICAgICAgJmx0Oy9Qcm9wZXJ0eVZhbHVlJmd0O1xuXHRcdCAqICAgICAgICAgICZsdDtQcm9wZXJ0eVZhbHVlIFByb3BlcnR5PSZxdW90O01lYXN1cmVzJnF1b3Q7Jmd0O1xuXHRcdCAqICAgICAgICAgICAgJmx0O0NvbGxlY3Rpb24mZ3Q7XG5cdFx0ICogICAgICAgICAgICAgICZsdDtQcm9wZXJ0eVBhdGgmZ3Q7UHJpY2UmbHQ7L1Byb3BlcnR5UGF0aCZndDtcblx0XHQgKiAgICAgICAgICAgICZsdDsvQ29sbGVjdGlvbiZndDtcblx0XHQgKiAgICAgICAgICAmbHQ7L1Byb3BlcnR5VmFsdWUmZ3Q7XG5cdFx0ICogICAgICAgICAgJmx0O1Byb3BlcnR5VmFsdWUgUHJvcGVydHk9JnF1b3Q7TWVhc3VyZUF0dHJpYnV0ZXMmcXVvdDsmZ3Q7XG5cdFx0ICogICAgICAgICAgICAmbHQ7Q29sbGVjdGlvbiZndDtcblx0XHQgKiAgICAgICAgICAgICAgJmx0O1JlY29yZCBUeXBlPSZxdW90O2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0TWVhc3VyZUF0dHJpYnV0ZVR5cGUmcXVvdDsmZ3Q7XG5cdFx0ICogICAgICAgICAgICAgICAgJmx0O1Byb3BlcnR5VmFsdWUgUHJvcGVydHk9JnF1b3Q7TWVhc3VyZSZxdW90OyBQcm9wZXJ0eVBhdGg9JnF1b3Q7UHJpY2UmcXVvdDsgLyZndDtcblx0XHQgKiAgICAgICAgICAgICAgICAmbHQ7UHJvcGVydHlWYWx1ZSBQcm9wZXJ0eT0mcXVvdDtSb2xlJnF1b3Q7IEVudW1NZW1iZXI9JnF1b3Q7Y29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnRNZWFzdXJlUm9sZVR5cGUvQXhpczEmcXVvdDsgLyZndDtcblx0XHQgKiAgICAgICAgICAgICAgICAmbHQ7UHJvcGVydHlWYWx1ZSBQcm9wZXJ0eT0mcXVvdDtEYXRhUG9pbnQmcXVvdDsgQW5ub3RhdGlvblBhdGg9JnF1b3Q7QGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFQb2ludCNDb2x1bW5DaGFydERhdGFQb2ludCZxdW90OyAvJmd0O1xuXHRcdCAqICAgICAgICAgICAgICAmbHQ7L1JlY29yZCZndDtcblx0XHQgKiAgICAgICAgICAgICZsdDsvQ29sbGVjdGlvbiZndDtcblx0XHQgKiAgICAgICAgICAmbHQ7L1Byb3BlcnR5VmFsdWUmZ3Q7XG5cdFx0ICogICAgICAgICZsdDsvUmVjb3JkJmd0O1xuXHRcdCAqICAgICAgJmx0Oy9Bbm5vdGF0aW9uJmd0O1xuXHRcdCAqICAgICZsdDsvQW5ub3RhdGlvbnMmZ3Q7XG5cdFx0ICogPC9wcmU+XG5cdFx0ICpcblx0XHQgKiA8YnI+XG5cdFx0ICogPGk+PGI+PHU+RG9jdW1lbnRhdGlvbiBsaW5rczwvdT48L2I+PC9pPlxuXHRcdCAqIDx1bD5cblx0XHQgKiAgIDxsaT5UZXJtIDxiPntAbGluayBodHRwczovL2dpdGh1Yi5jb20vU0FQL29kYXRhLXZvY2FidWxhcmllcy9ibG9iL21hc3Rlci92b2NhYnVsYXJpZXMvVUkubWQjQ2hhcnQgIGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0fTwvYj48YnIvPlxuXHRcdCAqICAgPC9saT5cblx0XHQgKiA8L3VsPlxuXHRcdCAqL1xuXHRcdGNoYXJ0OiB7XG5cdFx0XHRuYW1lc3BhY2U6IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjFcIixcblx0XHRcdGFubm90YXRpb246IFwiQ2hhcnRcIixcblx0XHRcdHRhcmdldDogW1wiRW50aXR5VHlwZVwiXSxcblx0XHRcdGRlZmF1bHRWYWx1ZTogbnVsbCxcblx0XHRcdHNpbmNlOiBcIjEuNzVcIlxuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBUaGUgPGNvZGU+Q2hhcnREZWZpbml0aW9uVHlwZTwvY29kZT4gaXMgYSA8Y29kZT5Db21wbGV4VHlwZTwvY29kZT4gdGhhdCBpcyB1c2VkIHRvIGRlc2NyaWJlIHRoZSA8Y29kZT5DaGFydDwvY29kZT4gYW5ub3RhdGlvbi5cblx0XHQgKiBTZWUgWE1MIEV4YW1wbGUgZm9yIENoYXJ0IGFubm90YXRpb24gZm9yIHJlZmVyZW5jZS5cblx0XHQgKlxuXHRcdCAqIDxicj5cblx0XHQgKiA8aT48Yj48dT5Eb2N1bWVudGF0aW9uIGxpbmtzPC91PjwvYj48L2k+XG5cdFx0ICogPHVsPlxuXHRcdCAqICAgPGxpPlRlcm0gPGI+e0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9TQVAvb2RhdGEtdm9jYWJ1bGFyaWVzL2Jsb2IvbWFzdGVyL3ZvY2FidWxhcmllcy9VSS5tZCNDaGFydERlZmluaXRpb25UeXBlICBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydERlZmluaXRpb25UeXBlfTwvYj48YnIvPlxuXHRcdCAqICAgPC9saT5cblx0XHQgKiA8L3VsPlxuXHRcdCAqL1xuXHRcdGNoYXJ0RGVmaW5pdGlvblR5cGU6IHtcblx0XHRcdG5hbWVzcGFjZTogXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MVwiLFxuXHRcdFx0YW5ub3RhdGlvbjogXCJDaGFydERlZmluaXRpb25UeXBlXCIsXG5cdFx0XHR0YXJnZXQ6IFtcIkVudGl0eVR5cGVcIl0sXG5cdFx0XHRkZWZhdWx0VmFsdWU6IG51bGwsXG5cdFx0XHRzaW5jZTogXCIxLjc1XCJcblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICogVGhlIDxjb2RlPkNoYXJ0VHlwZTwvY29kZT4gaXMgYW4gPGNvZGU+RW51bVR5cGU8L2NvZGU+IHRoYXQgaXMgcHJvdmlkZWQgd2l0aGluIHRoZSA8Y29kZT5DaGFydDwvY29kZT4gYW5ub3RhdGlvbiB0byBkZWZpbmUgdGhlIGNoYXJ0IHR5cGUuXG5cdFx0ICogU3VwcG9ydGVkIGNoYXJ0IHR5cGVzIGFyZSBBcmVhLCBCYXIsIEJhclN0YWNrZWQsIEJ1bGxldCwgQ29sdW1uLCBEb251dCwgTGluZSBhbmQgUGllLlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPlhNTCBFeGFtcGxlIG9mIHVzaW5nIENoYXJ0VHlwZSBwcm9wZXJ0eSB3aXRoIEJ1bGxldDwvaT5cblx0XHQgKlxuXHRcdCAqIDxwcmU+XG5cdFx0ICogICAgJmx0O0Fubm90YXRpb24gVGVybT0mcXVvdDtjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydCZxdW90OyBRdWFsaWZpZXI9JnF1b3Q7QnVsbGV0Q2hhcnRRdWFsaWZpZXImcXVvdDsmZ3Q7XG5cdFx0ICogICAgICAmbHQ7UmVjb3JkIFR5cGU9JnF1b3Q7Y29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnREZWZpbml0aW9uVHlwZSZxdW90OyZndDtcblx0XHQgKiAgICAgICAgJmx0O1Byb3BlcnR5VmFsdWUgUHJvcGVydHk9JnF1b3Q7Q2hhcnRUeXBlJnF1b3Q7IEVudW1NZW1iZXI9JnF1b3Q7Y29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnQvQnVsbGV0JnF1b3Q7IC8mZ3Q7XG5cdFx0ICogICAgICAmbHQ7L1JlY29yZCZndDtcblx0XHQgKiAgICAmbHQ7L0Fubm90YXRpb24mZ3Q7XG5cdFx0ICogPC9wcmU+XG5cdFx0ICpcblx0XHQgKiA8YnI+XG5cdFx0ICogPGk+PGI+PHU+RG9jdW1lbnRhdGlvbiBsaW5rczwvdT48L2I+PC9pPlxuXHRcdCAqIDx1bD5cblx0XHQgKiAgIDxsaT5UZXJtIDxiPntAbGluayBodHRwczovL2dpdGh1Yi5jb20vU0FQL29kYXRhLXZvY2FidWxhcmllcy9ibG9iL21hc3Rlci92b2NhYnVsYXJpZXMvVUkubWQjQ2hhcnRUeXBlICBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydFR5cGV9PC9iPjxici8+XG5cdFx0ICogICA8L2xpPlxuXHRcdCAqIDwvdWw+XG5cdFx0ICovXG5cdFx0Y2hhcnRUeXBlOiB7XG5cdFx0XHRuYW1lc3BhY2U6IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjFcIixcblx0XHRcdGFubm90YXRpb246IFwiQ2hhcnRUeXBlXCIsXG5cdFx0XHR0YXJnZXQ6IFtcIlByb3BlcnR5XCJdLFxuXHRcdFx0ZGVmYXVsdFZhbHVlOiBudWxsLFxuXHRcdFx0c2luY2U6IFwiMS43NVwiXG5cdFx0fSxcblx0XHQvKipcblx0XHQgKiBUaGUgPGNvZGU+Q2hhcnRNZWFzdXJlQXR0cmlidXRlVHlwZTwvY29kZT4gaXMgYSA8Y29kZT5Db21wbGV4VHlwZTwvY29kZT4gdGhhdCBpcyB1c2VkIHRvIGRlc2NyaWJlIHRoZSBDaGFydCBhbm5vdGF0aW9uIHByb3BlcnR5IE1lYXN1cmVBdHRyaWJ1dGVzLlxuXHRcdCAqIFNlZSBYTUwgRXhhbXBsZSBmb3IgQ2hhcnQgYW5ub3RhdGlvbiBmb3IgcmVmZXJlbmNlLlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPjxiPjx1PkRvY3VtZW50YXRpb24gbGlua3M8L3U+PC9iPjwvaT5cblx0XHQgKiA8dWw+XG5cdFx0ICogICA8bGk+VGVybSA8Yj57QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1NBUC9vZGF0YS12b2NhYnVsYXJpZXMvYmxvYi9tYXN0ZXIvdm9jYWJ1bGFyaWVzL1VJLm1kI0NoYXJ0TWVhc3VyZUF0dHJpYnV0ZVR5cGUgIGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0TWVhc3VyZUF0dHJpYnV0ZVR5cGV9PC9iPjxici8+XG5cdFx0ICogICA8L2xpPlxuXHRcdCAqIDwvdWw+XG5cdFx0ICovXG5cdFx0Y2hhcnRNZWFzdXJlQXR0cmlidXRlVHlwZToge1xuXHRcdFx0bmFtZXNwYWNlOiBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxXCIsXG5cdFx0XHRhbm5vdGF0aW9uOiBcIkNoYXJ0TWVhc3VyZUF0dHJpYnV0ZVR5cGVcIixcblx0XHRcdHNpbmNlOiBcIjEuNzVcIlxuXHRcdH0sXG5cdFx0LyoqXG5cdFx0ICogQmFzZWQgb24gdGhlIDxjb2RlPkRhdGFQb2ludDwvY29kZT4gYW5ub3RhdGlvbiB0aGF0IGlzIHByb3ZpZGVkIGJ5IDxjb2RlPk1lYXN1cmVBdHRyaWJ1dGVzPC9jb2RlPiwgdGhlIHZhbHVlcyBhbmQgY29sb3JzIG9mIHRoZSBjaGFydCBhcmUgZGVmaW5lZFxuXHRcdCAqIGJ5IHVzaW5nIHRoZSA8Y29kZT5WYWx1ZTwvY29kZT4gcHJvcGVydHkgYW5kIDxjb2RlPkNyaXRpY2FsaXR5PC9jb2RlPiBwcm9wZXJ0eS5cblx0XHQgKiBUaGUgZGF0YSBwb2ludCdzIDxjb2RlPlZhbHVlPC9jb2RlPiBtdXN0IGJlIHRoZSBzYW1lIHByb3BlcnR5IGFzIGluIDxjb2RlPk1lYXN1cmU8L2NvZGU+LlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPlhNTCBFeGFtcGxlIG9mIHVzaW5nIERhdGFQb2ludCBhbm5vdGF0aW9uIChzZWUgYWxzbyBYTUwgRXhhbXBsZSBmb3IgQ2hhcnQgYW5ub3RhdGlvbik8L2k+XG5cdFx0ICpcblx0XHQgKiA8cHJlPlxuXHRcdCAqICAgICZsdDtBbm5vdGF0aW9uIFRlcm09JnF1b3Q7Y29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YVBvaW50JnF1b3Q7IFF1YWxpZmllcj0mcXVvdDtDb2x1bW5DaGFydERhdGFQb2ludCZxdW90OyAmZ3Q7XG5cdFx0ICogICAgICAmbHQ7UmVjb3JkIFR5cGU9JnF1b3Q7Y29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YVBvaW50VHlwZSZxdW90OyZndDtcblx0XHQgKiAgICAgICAgJmx0O1Byb3BlcnR5VmFsdWUgUHJvcGVydHk9JnF1b3Q7VmFsdWUmcXVvdDsgUGF0aD0mcXVvdDtQcmljZSZxdW90OyAvJmd0O1xuXHRcdCAqICAgICAgICAmbHQ7UHJvcGVydHlWYWx1ZSBQcm9wZXJ0eT0mcXVvdDtUaXRsZSZxdW90OyBQYXRoPSZxdW90O1RpdGxlJnF1b3Q7IC8mZ3Q7XG5cdFx0ICogICAgICAgICZsdDtQcm9wZXJ0eVZhbHVlIFByb3BlcnR5PSZxdW90O0NyaXRpY2FsaXR5JnF1b3Q7IFBhdGg9JnF1b3Q7Q3JpdGljYWxpdHkmcXVvdDsvJmd0O1xuXHRcdCAqICAgICAgJmx0Oy9SZWNvcmQmZ3Q7XG5cdFx0ICogICAgJmx0Oy9Bbm5vdGF0aW9uJmd0O1xuXHRcdCAqIDwvcHJlPlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPjxiPjx1PkRvY3VtZW50YXRpb24gbGlua3M8L3U+PC9iPjwvaT5cblx0XHQgKiA8dWw+XG5cdFx0ICogICA8bGk+VGVybSA8Yj57QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1NBUC9vZGF0YS12b2NhYnVsYXJpZXMvYmxvYi9tYXN0ZXIvdm9jYWJ1bGFyaWVzL1VJLm1kI0RhdGFQb2ludCAgY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YVBvaW50fTwvYj48YnIvPlxuXHRcdCAqICAgPC9saT5cblx0XHQgKiA8L3VsPlxuXHRcdCAqL1xuXHRcdGRhdGFQb2ludDoge1xuXHRcdFx0bmFtZXNwYWNlOiBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxXCIsXG5cdFx0XHRhbm5vdGF0aW9uOiBcIkRhdGFQb2ludFwiLFxuXHRcdFx0dGFyZ2V0OiBbXCJFbnRpdHlUeXBlXCJdLFxuXHRcdFx0ZGVmYXVsdFZhbHVlOiBudWxsLFxuXHRcdFx0c2luY2U6IFwiMS43NVwiXG5cdFx0fSxcblx0XHQvKipcblx0XHQgKiBUaGUgPGNvZGU+RGF0YVBvaW50VHlwZTwvY29kZT4gaXMgYSA8Y29kZT5Db21wbGV4VHlwZTwvY29kZT4gdGhhdCBpcyB1c2VkIHRvIGRlZmluZSB0aGUgdHlwZSBvZiB0aGUgPGNvZGU+RGF0YVBvaW50PC9jb2RlPiBhbm5vdGF0aW9uLlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPjxiPjx1PkRvY3VtZW50YXRpb24gbGlua3M8L3U+PC9iPjwvaT5cblx0XHQgKiA8dWw+XG5cdFx0ICogICA8bGk+VGVybSA8Yj57QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1NBUC9vZGF0YS12b2NhYnVsYXJpZXMvYmxvYi9tYXN0ZXIvdm9jYWJ1bGFyaWVzL1VJLm1kI0RhdGFQb2ludFR5cGUgIGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFQb2ludFR5cGV9PC9iPjxici8+XG5cdFx0ICogICA8L2xpPlxuXHRcdCAqIDwvdWw+XG5cdFx0ICovXG5cdFx0ZGF0YVBvaW50VHlwZToge1xuXHRcdFx0bmFtZXNwYWNlOiBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxXCIsXG5cdFx0XHRhbm5vdGF0aW9uOiBcIkRhdGFQb2ludFR5cGVcIixcblx0XHRcdHRhcmdldDogW1wiRW50aXR5VHlwZVwiXSxcblx0XHRcdGRlZmF1bHRWYWx1ZTogbnVsbCxcblx0XHRcdHNpbmNlOiBcIjEuNzVcIlxuXHRcdH0sXG5cdFx0LyoqXG5cdFx0ICogVGhlIDxjb2RlPkNyaXRpY2FsaXR5VHlwZTwvY29kZT4gaXMgYW4gPGNvZGU+RW51bVR5cGU8L2NvZGU+IHRoYXQgaXMgdXNlZCB0byBkZWZpbmUgdGhlIHR5cGUgb2Zcblx0XHQgKiA8Y29kZT5Dcml0aWNhbGl0eTwvY29kZT4gcHJvcGVydHkgaW4gdGhlIDxjb2RlPkRhdGFQb2ludDwvY29kZT4gYW5ub3RhdGlvbi5cblx0XHQgKiBUaGUgcHJvcGVydHkgZGVmaW5lcyBhIHNlcnZpY2UtY2FsY3VsYXRlZCBjcml0aWNhbGl0eSBhbmQgaXMgYW4gYWx0ZXJuYXRpdmUgdG8gPGNvZGU+Q3JpdGljYWxpdHlDYWxjdWxhdGlvbjwvY29kZT4uXG5cdFx0ICpcblx0XHQgKiA8YnI+XG5cdFx0ICogPGk+WE1MIEV4YW1wbGUgb2YgdXNpbmcgQ3JpdGljYWxpdHkgcHJvcGVydHkgd2l0aCB0aGUgQ3JpdGljYWxpdHlUeXBlPC9pPlxuXHRcdCAqXG5cdFx0ICogPHByZT5cblx0XHQgKiAgICAmbHQ7UmVjb3JkIFR5cGU9JnF1b3Q7Y29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YVBvaW50VHlwZSZxdW90OyZndDtcblx0XHQgKiAgICAgICZsdDtQcm9wZXJ0eVZhbHVlIFByb3BlcnR5PSZxdW90O1RpdGxlJnF1b3Q7IFBhdGg9JnF1b3Q7QWN0dWFsIENvc3QmcXVvdDsvJmd0O1xuXHRcdCAqICAgICAgJmx0O1Byb3BlcnR5VmFsdWUgUHJvcGVydHk9JnF1b3Q7VmFsdWUmcXVvdDsgUGF0aD0mcXVvdDtBY3R1YWxDb3N0JnF1b3Q7LyZndDtcblx0XHQgKiAgICAgICZsdDtQcm9wZXJ0eVZhbHVlIFByb3BlcnR5PSZxdW90O0NyaXRpY2FsaXR5JnF1b3Q7IEVudW1NZW1iZXI9JnF1b3Q7Y29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ3JpdGljYWxpdHlUeXBlL1Bvc2l0aXZlJnF1b3Q7IC8mZ3Q7XG5cdFx0ICogICAgJmx0Oy9SZWNvcmQmZ3Q7XG5cdFx0ICogPC9wcmU+XG5cdFx0ICpcblx0XHQgKiA8YnI+XG5cdFx0ICogPGk+PGI+PHU+RG9jdW1lbnRhdGlvbiBsaW5rczwvdT48L2I+PC9pPlxuXHRcdCAqIDx1bD5cblx0XHQgKiAgIDxsaT5UZXJtIDxiPntAbGluayBodHRwczovL2dpdGh1Yi5jb20vU0FQL29kYXRhLXZvY2FidWxhcmllcy9ibG9iL21hc3Rlci92b2NhYnVsYXJpZXMvVUkubWQjQ3JpdGljYWxpdHlUeXBlICBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5Dcml0aWNhbGl0eVR5cGV9PC9iPjxici8+XG5cdFx0ICogICA8L2xpPlxuXHRcdCAqIDwvdWw+XG5cdFx0ICovXG5cdFx0Y3JpdGljYWxpdHlUeXBlOiB7XG5cdFx0XHRuYW1lc3BhY2U6IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjFcIixcblx0XHRcdGFubm90YXRpb246IFwiQ3JpdGljYWxpdHlUeXBlXCIsXG5cdFx0XHR0YXJnZXQ6IFtcIlByb3BlcnR5XCJdLFxuXHRcdFx0ZGVmYXVsdFZhbHVlOiBudWxsLFxuXHRcdFx0c2luY2U6IFwiMS43NVwiXG5cdFx0fSxcblx0XHQvKipcblx0XHQgKiBUaGUgPGNvZGU+Q3JpdGljYWxpdHlDYWxjdWxhdGlvblR5cGU8L2NvZGU+IGlzIGEgPGNvZGU+Q29tcGxleFR5cGU8L2NvZGU+IHRoYXQgaXMgdXNlZCB0byBkZWZpbmUgdGhlXG5cdFx0ICogdHlwZSBvZiA8Y29kZT5Dcml0aWNhbGl0eUNhbGN1bGF0aW9uPC9jb2RlPiBwcm9wZXJ0eSBpbiB0aGUgPGNvZGU+RGF0YVBvaW50PC9jb2RlPiBhbm5vdGF0aW9uLlxuXHRcdCAqIFRoZXNlIHBhcmFtZXRlcnMgYXJlIHVzZWQgZm9yIGNsaWVudC1jYWxjdWxhdGVkIGNyaXRpY2FsaXR5IGFuZCBhcmUgYW4gYWx0ZXJuYXRpdmUgdG8gPGNvZGU+Q3JpdGljYWxpdHk8L2NvZGU+LlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPlhNTCBFeGFtcGxlIG9mIHVzaW5nIENyaXRpY2FsaXR5Q2FsY3VsYXRpb24gcHJvcGVydHkgd2l0aCB0aGUgQ3JpdGljYWxpdHlDYWxjdWxhdGlvblR5cGUgdHlwZTwvaT5cblx0XHQgKlxuXHRcdCAqIDxwcmU+XG5cdFx0ICogICAgJmx0O1Byb3BlcnR5VmFsdWUgUHJvcGVydHk9JnF1b3Q7Q3JpdGljYWxpdHlDYWxjdWxhdGlvbiZxdW90OyZndDtcblx0XHQgKiAgICAgICZsdDtSZWNvcmQgVHlwZT0mcXVvdDtjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5Dcml0aWNhbGl0eUNhbGN1bGF0aW9uVHlwZSZxdW90OyZndDtcblx0XHQgKiAgICAgICAgJmx0O1Byb3BlcnR5VmFsdWUgUHJvcGVydHk9JnF1b3Q7SW1wcm92ZW1lbnREaXJlY3Rpb24mcXVvdDsgRW51bU1lbWJlcj0mcXVvdDtjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5JbXByb3ZlbWVudERpcmVjdGlvblR5cGUvVGFyZ2V0JnF1b3Q7IC8mZ3Q7XG5cdFx0ICogICAgICAgICZsdDtQcm9wZXJ0eVZhbHVlIFByb3BlcnR5PSZxdW90O0RldmlhdGlvblJhbmdlTG93VmFsdWUmcXVvdDsgUGF0aD0mcXVvdDtQcmljZURldmlhdGlvbkxvd2VyQm91bmQmcXVvdDsvJmd0O1xuXHRcdCAqICAgICAgICAmbHQ7UHJvcGVydHlWYWx1ZSBQcm9wZXJ0eT0mcXVvdDtUb2xlcmFuY2VSYW5nZUxvd1ZhbHVlJnF1b3Q7IFBhdGg9JnF1b3Q7UHJpY2VUb2xlcmFuY2VMb3dlckJvdW5kJnF1b3Q7LyZndDtcblx0XHQgKiAgICAgICAgJmx0O1Byb3BlcnR5VmFsdWUgUHJvcGVydHk9JnF1b3Q7VG9sZXJhbmNlUmFuZ2VIaWdoVmFsdWUmcXVvdDsgUGF0aD0mcXVvdDtQcmljZVRvbGVyYW5jZVVwcGVyQm91bmQmcXVvdDsvJmd0O1xuXHRcdCAqICAgICAgICAmbHQ7UHJvcGVydHlWYWx1ZSBQcm9wZXJ0eT0mcXVvdDtEZXZpYXRpb25SYW5nZUhpZ2hWYWx1ZSZxdW90OyBQYXRoPSZxdW90O1ByaWNlRGV2aWF0aW9uVXBwZXJCb3VuZCZxdW90Oy8mZ3Q7XG5cdFx0ICogICAgICAmbHQ7L1JlY29yZCZndDtcblx0XHQgKiAgICAmbHQ7L1Byb3BlcnR5VmFsdWUmZ3Q7XG5cdFx0ICogPC9wcmU+XG5cdFx0ICpcblx0XHQgKiA8YnI+XG5cdFx0ICogPGk+PGI+PHU+RG9jdW1lbnRhdGlvbiBsaW5rczwvdT48L2I+PC9pPlxuXHRcdCAqIDx1bD5cblx0XHQgKiAgIDxsaT5UZXJtIDxiPntAbGluayBodHRwczovL2dpdGh1Yi5jb20vU0FQL29kYXRhLXZvY2FidWxhcmllcy9ibG9iL21hc3Rlci92b2NhYnVsYXJpZXMvVUkubWQjQ3JpdGljYWxpdHlDYWxjdWxhdGlvblR5cGUgIGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNyaXRpY2FsaXR5Q2FsY3VsYXRpb25UeXBlfTwvYj48YnIvPlxuXHRcdCAqICAgPC9saT5cblx0XHQgKiA8L3VsPlxuXHRcdCAqL1xuXHRcdGNyaXRpY2FsaXR5Q2FsY3VsYXRpb25UeXBlOiB7XG5cdFx0XHRuYW1lc3BhY2U6IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjFcIixcblx0XHRcdGFubm90YXRpb246IFwiQ3JpdGljYWxpdHlDYWxjdWxhdGlvblR5cGVcIixcblx0XHRcdHRhcmdldDogW1wiUHJvcGVydHlcIl0sXG5cdFx0XHRkZWZhdWx0VmFsdWU6IG51bGwsXG5cdFx0XHRzaW5jZTogXCIxLjc1XCJcblx0XHR9LFxuXHRcdC8qKlxuXHRcdCAqIFRoZSA8Y29kZT5UZXh0PC9jb2RlPiBhbm5vdGF0aW9uIGRlc2NyaWJlcyB0aGUgZGlzcGxheSB2YWx1ZSBvZiB0aGUgPGNvZGU+VmFsdWU8L2NvZGU+IHByb3BlcnR5IGluIHRoZSA8Y29kZT5EYXRhUG9pbnQ8L2NvZGU+IGFubm90YXRpb24uXG5cdFx0ICpcblx0XHQgKiA8YnI+XG5cdFx0ICogPGk+WE1MIEV4YW1wbGUgb2YgdXNpbmcgVGV4dCBhbm5vdGF0aW9uPC9pPlxuXHRcdCAqXG5cdFx0ICogPHByZT5cblx0XHQgKiAgICAmbHQ7QW5ub3RhdGlvbnMgVGFyZ2V0PSZxdW90O1NhbGVzT3JkZXJJdGVtL1ByaWNlJnF1b3Q7IHhtbG5zPSZxdW90O2h0dHA6Ly9kb2NzLm9hc2lzLW9wZW4ub3JnL29kYXRhL25zL2VkbSZxdW90OyZndDtcblx0XHQgKiAgICAgICAmbHQ7QW5ub3RhdGlvbiBUZXJtPSZxdW90O2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5UZXh0JnF1b3Q7IFBhdGg9JnF1b3Q7RGlzcGxheVZhbHVlJnF1b3Q7IC8mZ3Q7XG5cdFx0ICogICAgJmx0Oy9Bbm5vdGF0aW9ucyZndDtcblx0XHQgKiAgICAmbHQ7UHJvcGVydHkgTmFtZT0mcXVvdDtEaXNwbGF5VmFsdWUmcXVvdDsgdHlwZT0mcXVvdDtFZG0uU3RyaW5nJnF1b3Q7IC8mZ3Q7XG5cdFx0ICogPC9wcmU+XG5cdFx0ICpcblx0XHQgKiA8YnI+XG5cdFx0ICogPGk+PGI+PHU+RG9jdW1lbnRhdGlvbiBsaW5rczwvdT48L2I+PC9pPlxuXHRcdCAqIDx1bD5cblx0XHQgKiAgIDxsaT5UZXJtIDxiPntAbGluayBodHRwczovL2dpdGh1Yi5jb20vU0FQL29kYXRhLXZvY2FidWxhcmllcy9ibG9iL21hc3Rlci92b2NhYnVsYXJpZXMvQ29tbW9uLm1kI1RleHQgIGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5UZXh0fTwvYj48YnIvPlxuXHRcdCAqICAgPC9saT5cblx0XHQgKiA8L3VsPlxuXHRcdCAqL1xuXHRcdHRleHQ6IHtcblx0XHRcdG5hbWVzcGFjZTogXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjFcIixcblx0XHRcdGFubm90YXRpb246IFwiVGV4dFwiLFxuXHRcdFx0dGFyZ2V0OiBbXCJQcm9wZXJ0eVwiXSxcblx0XHRcdGRlZmF1bHRWYWx1ZTogbnVsbCxcblx0XHRcdHNpbmNlOiBcIjEuNzVcIlxuXHRcdH0sXG5cdFx0LyoqXG5cdFx0ICogRGVmaW5lcyB0aGF0IGEgcHJvcGVydHkgaXMgbm90IGRpc3BsYXllZC5cblx0XHQgKiBJZiB0aGUgcHJvcGVydHkgPGNvZGU+VmFsdWU8L2NvZGU+IG9mIHRoZSA8Y29kZT5EYXRhUG9pbnQ8L2NvZGU+IGluIHRoZSA8Y29kZT5NZWFzdXJlQXR0cmlidXRlPC9jb2RlPlxuXHRcdCAqIG9mIHRoZSBDaGFydCBpcyBhbm5vdGF0ZWQgYXMgaGlkZGVuLCB0aGUgQ2hhcnQgaXMgbm90IHJlbmRlcmVkLlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPkV4YW1wbGUgaW4gT0RhdGEgVjQgbm90YXRpb24gd2l0aCBoaWRkZW4gUHJvZHVjdFVVSUQ8L2k+XG5cdFx0ICpcblx0XHQgKiA8cHJlPlxuXHRcdCAqICAgICAmbHQ7QW5ub3RhdGlvbnMgVGFyZ2V0PSZxdW90O1Byb2R1Y3RDb2xsZWN0aW9uLlByb2R1Y3QvUHJvZHVjdFVVSUQgJnF1b3Q7Jmd0O1xuXHRcdCAqICAgICAgICAgJmx0O0Fubm90YXRpb24gVGVybT0mcXVvdDtjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IaWRkZW4mcXVvdDsvJmd0O1xuXHRcdCAqICAgICAmbHQ7L0Fubm90YXRpb25zJmd0O1xuXHRcdCAqIDwvcHJlPlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPjxiPjx1PkRvY3VtZW50YXRpb24gbGlua3M8L3U+PC9iPjwvaT5cblx0XHQgKiA8dWw+XG5cdFx0ICogICA8bGk+VGVybSA8Yj57QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1NBUC9vZGF0YS12b2NhYnVsYXJpZXMvYmxvYi9tYXN0ZXIvdm9jYWJ1bGFyaWVzL1VJLm1kI0hpZGRlbiAgY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuSGlkZGVufTwvYj48YnIvPlxuXHRcdCAqICAgPC9saT5cblx0XHQgKiA8L3VsPlxuXHRcdCAqL1xuXHRcdGhpZGRlbjoge1xuXHRcdFx0bmFtZXNwYWNlOiBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxXCIsXG5cdFx0XHRhbm5vdGF0aW9uOiBcIkhpZGRlblwiLFxuXHRcdFx0dGFyZ2V0OiBbXCJQcm9wZXJ0eVwiLCBcIlJlY29yZFwiXSxcblx0XHRcdHNpbmNlOiBcIjEuNzVcIlxuXHRcdH0sXG5cdFx0LyoqXG5cdFx0ICogRGVmaW5lcyBhIGN1cnJlbmN5IGNvZGUgZm9yIGFuIGFtb3VudCBhY2NvcmRpbmcgdG8gdGhlIElTTyA0MjE3IHN0YW5kYXJkLiBUaGUgPGNvZGU+SVNPQ3VycmVuY3k8L2NvZGU+IGFubm90YXRpb24gY2FuIHBvaW50IHRvIGFcblx0XHQgKiA8Y29kZT5Qcm9wZXJ0eTwvY29kZT4sIHdoaWNoIGNhbiBhbHNvIGJlIDxjb2RlPm51bGw8L2NvZGU+LlxuXHRcdCAqIFRoZSBjdXJyZW5jeSBjb2RlIGlzIHJlbmRlcmVkIGluIHRoZSBmb290ZXIgb2YgdGhlIGNvbnRhaW5lciBjb250YWluaW5nIHRoZSBNaWNyb0NoYXJ0LCBpZiBzaG93T25seUNoYXJ0IGlzIGZhbHNlLlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPlhNTCBFeGFtcGxlIG9mIE9EYXRhIFY0IHdpdGggUHJpY2UgYW5kIEN1cnJlbmN5Q29kZSBhcyBJU09DdXJyZW5jeTwvaT5cblx0XHQgKlxuXHRcdCAqIDxwcmU+XG5cdFx0ICogICAgJmx0O0Fubm90YXRpb25zIFRhcmdldD0mcXVvdDtTYWxlc09yZGVySXRlbS9QcmljZSZxdW90OyB4bWxucz0mcXVvdDtodHRwOi8vZG9jcy5vYXNpcy1vcGVuLm9yZy9vZGF0YS9ucy9lZG0mcXVvdDsmZ3Q7XG5cdFx0ICogICAgICAmbHQ7QW5ub3RhdGlvbiBUZXJtPSZxdW90O09yZy5PRGF0YS5NZWFzdXJlcy5WMS5JU09DdXJyZW5jeSZxdW90OyBQYXRoPSZxdW90O0N1cnJlbmN5Q29kZSZxdW90OyAvJmd0O1xuXHRcdCAqICAgICZsdDsvQW5ub3RhdGlvbnMmZ3Q7XG5cdFx0ICogICAgJmx0O1Byb3BlcnR5IE5hbWU9JnF1b3Q7Q3VycmVuY3lDb2RlJnF1b3Q7IHR5cGU9JnF1b3Q7RWRtLlN0cmluZyZxdW90OyAvJmd0O1xuXHRcdCAqIDwvcHJlPlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPjxiPjx1PkRvY3VtZW50YXRpb24gbGlua3M8L3U+PC9iPjwvaT5cblx0XHQgKiA8dWw+XG5cdFx0ICogICA8bGk+VGVybSA8Yj57QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL29hc2lzLXRjcy9vZGF0YS12b2NhYnVsYXJpZXMvYmxvYi9tYXN0ZXIvdm9jYWJ1bGFyaWVzL09yZy5PRGF0YS5NZWFzdXJlcy5WMS5tZCNJU09DdXJyZW5jeSAgT3JnLk9EYXRhLk1lYXN1cmVzLlYxLklTT0N1cnJlbmN5fTwvYj48YnIvPlxuXHRcdCAqICAgPC9saT5cblx0XHQgKiA8L3VsPlxuXHRcdCAqL1xuXHRcdGN1cnJlbmN5Q29kZToge1xuXHRcdFx0bmFtZXNwYWNlOiBcIk9yZy5PRGF0YS5NZWFzdXJlcy5WMVwiLFxuXHRcdFx0YW5ub3RhdGlvbjogXCJJU09DdXJyZW5jeVwiLFxuXHRcdFx0dGFyZ2V0OiBbXCJQcm9wZXJ0eVwiXSxcblx0XHRcdGRlZmF1bHRWYWx1ZTogbnVsbCxcblx0XHRcdHNpbmNlOiBcIjEuNzVcIlxuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKiBSZXR1cm5zIHRoZSB1bml0IG9mIG1lYXN1cmUgZm9yIHRoZSBtZWFzdXJlZCBxdWFudGl0eSwgZm9yIGV4YW1wbGUgJ2NtJyBmb3IgJ2NlbnRpbWV0ZXJzJywgYW5kIHJlbmRlcnMgdGhlIHZhbHVlIGFzc29jaWF0ZWQgd2l0aCB0aGUgVW5pdCBhbm5vdGF0aW9uXG5cdFx0ICogb2YgYSA8Y29kZT5Qcm9wZXJ0eTwvY29kZT4sIHdoaWNoIGNhbiBiZSA8Y29kZT5udWxsPC9jb2RlPi5cblx0XHQgKiBUaGUgdW5pdCBvZiBtZWFzdXJlIGlzIHJlbmRlcmVkIGluIHRoZSBmb290ZXIgb2YgdGhlIGNvbnRhaW5lciBjb250YWluaW5nIHRoZSBNaWNyb0NoYXJ0LCBpZiBzaG93T25seUNoYXJ0IGlzIGZhbHNlLlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPlhNTCBFeGFtcGxlIG9mIE9EYXRhIFY0IHdpdGggT3JkZXJlZFF1YW50aXR5IGFuZCBPcmRlcmVkVW5pdCBhcyBVbml0PC9pPlxuXHRcdCAqXG5cdFx0ICogPHByZT5cblx0XHQgKiAgICAmbHQ7QW5ub3RhdGlvbnMgVGFyZ2V0PSZxdW90O1NhbGVzT3JkZXJJdGVtL09yZGVyZWRRdWFudGl0eSZxdW90OyB4bWxucz0mcXVvdDtodHRwOi8vZG9jcy5vYXNpcy1vcGVuLm9yZy9vZGF0YS9ucy9lZG0mcXVvdDsmZ3Q7XG5cdFx0ICogICAgICAmbHQ7QW5ub3RhdGlvbiBUZXJtPSZxdW90O09yZy5PRGF0YS5NZWFzdXJlcy5WMS5Vbml0JnF1b3Q7IFBhdGg9JnF1b3Q7T3JkZXJlZFVuaXQmcXVvdDsgLyZndDtcblx0XHQgKiAgICAmbHQ7L0Fubm90YXRpb25zJmd0O1xuXHRcdCAqICAgICZsdDtQcm9wZXJ0eSBOYW1lPSZxdW90O09yZGVyZWRVbml0JnF1b3Q7IHR5cGU9JnF1b3Q7RWRtLlN0cmluZyZxdW90OyAvJmd0O1xuXHRcdCAqIDwvcHJlPlxuXHRcdCAqXG5cdFx0ICogPGJyPlxuXHRcdCAqIDxpPjxiPjx1PkRvY3VtZW50YXRpb24gbGlua3M8L3U+PC9iPjwvaT5cblx0XHQgKiA8dWw+XG5cdFx0ICogICA8bGk+VGVybSA8Yj57QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL29hc2lzLXRjcy9vZGF0YS12b2NhYnVsYXJpZXMvYmxvYi9tYXN0ZXIvdm9jYWJ1bGFyaWVzL09yZy5PRGF0YS5NZWFzdXJlcy5WMS5tZCNVbml0ICBPcmcuT0RhdGEuTWVhc3VyZXMuVjEuVW5pdH08L2I+PGJyLz5cblx0XHQgKiAgIDwvbGk+XG5cdFx0ICogPC91bD5cblx0XHQgKi9cblx0XHR1bml0T2ZNZWFzdXJlOiB7XG5cdFx0XHRuYW1lc3BhY2U6IFwiT3JnLk9EYXRhLk1lYXN1cmVzLlYxXCIsXG5cdFx0XHRhbm5vdGF0aW9uOiBcIlVuaXRcIixcblx0XHRcdHRhcmdldDogW1wiUHJvcGVydHlcIl0sXG5cdFx0XHRkZWZhdWx0VmFsdWU6IG51bGwsXG5cdFx0XHRzaW5jZTogXCIxLjc1XCJcblx0XHR9XG5cdH1cbn07XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7RUFBQTtFQUFBLE9BQ2U7SUFDZEEsV0FBVyxFQUFFO01BQ1o7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO01BQ0VDLEtBQUssRUFBRTtRQUNOQyxTQUFTLEVBQUUsNEJBQTRCO1FBQ3ZDQyxVQUFVLEVBQUUsT0FBTztRQUNuQkMsTUFBTSxFQUFFLENBQUMsWUFBWSxDQUFDO1FBQ3RCQyxZQUFZLEVBQUUsSUFBSTtRQUNsQkMsS0FBSyxFQUFFO01BQ1IsQ0FBQztNQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7TUFDRUMsbUJBQW1CLEVBQUU7UUFDcEJMLFNBQVMsRUFBRSw0QkFBNEI7UUFDdkNDLFVBQVUsRUFBRSxxQkFBcUI7UUFDakNDLE1BQU0sRUFBRSxDQUFDLFlBQVksQ0FBQztRQUN0QkMsWUFBWSxFQUFFLElBQUk7UUFDbEJDLEtBQUssRUFBRTtNQUNS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